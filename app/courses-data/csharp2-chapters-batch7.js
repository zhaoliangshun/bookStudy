// =============================================================
// C# 大全 - 第七批章节（第七部分 高级特性，共 6 章）
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
// ⚠️ 顶级语句顺序规则：using指令 → 可执行代码/局部函数 → 类型声明（class/interface/struct/record/enum/delegate）
//    违反此顺序会导致编译错误 CS8803。局部函数不需要移动。
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

模式匹配的本质：**用一个表达式同时回答两个问题**——「数据是不是这个形状」+「如果是，把内部数据提取出来」。这比传统写法更安全，因为编译器在分支内保证变量类型正确，不会出现强转失败。

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
- \`is null\` 模式不会调用重载的 \`==\` 运算符，比 \`== null\` 更安全。

### 三、switch 表达式（C# 8+）⭐

switch 表达式是「表达式」而非「语句」，能直接返回值，是模式匹配主战场。

\`\`\`csharp
// 局部函数（顶级语句中局部函数可放在执行代码前，不违反 CS8803）
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

// ===== 为什么 switch 表达式比 switch 语句好？ =====
// 1. switch 语句是语句，不能直接赋值给变量；switch 表达式是表达式，可直接用于赋值、传参
// 2. switch 表达式每个分支都是表达式，天生支持函数式编程风格
// 3. 编译器检查穷尽性——如果漏了某个可能的分支（尤其是 enum），会给出警告
// 4. 没有 fall-through 问题，不需要 break/return，代码更紧凑
\`\`\`

要点：
- \`=>\` 后跟表达式，多个分支用逗号分隔。
- \`_\` 是「丢弃模式」，等价 default，必须放最后。
- 编译器会检查穷尽性（enum 缺分支会警告）。

### 四、属性模式 ⭐

按对象属性的形状匹配：

\`\`\`csharp
// 局部函数：使用 Point 类型（Point 定义在文件末尾类型声明区）
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

// 可执行代码必须放在类型声明之前（CS8803 规则）
Console.WriteLine(Classify(new Point(0, 0)));     // 原点
Console.WriteLine(Classify(new Point(3, 3)));     // 对角线上
Console.WriteLine(Classify(new Point(-1, 2)));    // 第二象限

// ===== 属性模式用法 =====
// 1. { Prop: value } —— 常量匹配：检查属性是否等于某个值
// 2. { Prop: > 0 } —— 关系模式：> < >= <= 等比较
// 3. { Prop: var x } —— 变量绑定：把属性值绑定到变量
// 4. { Prop: { ... } } —— 嵌套属性模式：匹配嵌套对象的属性
// 5. 可组合：{ X: > 0, Y: > 0 } 同时匹配多个属性

// ===== 类型声明放在最后！顶级语句中，所有 class/interface/struct/record/enum/delegate 必须在可执行代码之后 =====
public record Point(double X, double Y);
\`\`\`

属性模式语法：\`{ 属性名: 模式, 属性名: 模式 }\`，可嵌套。

### 五、位置模式

配合 \`Deconstruct\` 解构方法（record 自动生成），按位置匹配：

\`\`\`csharp
// 局部函数
string Describe(Size s) => s switch
{
    (0, 0) => "空",
    ( > 0, > 0) => $"正常 {s.Width}x{s.Height}",
    (var w, var h) => $"异常 w={w} h={h}"
};

// 可执行代码在前
Console.WriteLine(Describe(new Size(800, 600)));  // 正常 800x600
Console.WriteLine(Describe(new Size(0, 0)));      // 空

// 类型声明在后
public record Size(int Width, int Height);
\`\`\`

位置模式按解构顺序匹配，每个位置可以是常量、关系（>0）、变量绑定。

**为什么 record 天然支持位置模式？** 因为编译器自动为 record 生成 \`Deconstruct\` 方法，将属性按主构造函数参数顺序解构成元组。普通 class 需要自己写 \`Deconstruct\` 方法才能用位置模式。

### 六、when 守卫

模式之后追加条件，类似 SQL 的 WHERE：

\`\`\`csharp
// 局部函数
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

\`when\` 用于复杂条件，让模式更精确。模式匹配本身只能做「形状匹配」，when 可以附加任意布尔条件。

### 七、元组模式

直接对元组做模式匹配，避免一堆 if：

\`\`\`csharp
// 局部函数
string ClassifyHttp(int code, string method) => (code, method) switch
{
    (200, "GET") => "OK 取到了",
    (200, "POST") => "创建成功",
    (404, _) => "资源不存在",
    (500, _) => "服务器错误",
    (_, "DELETE") => "删除结果",
    _ => "其他"
};

// 可执行代码
Console.WriteLine(ClassifyHttp(200, "GET"));    // OK 取到了
Console.WriteLine(ClassifyHttp(404, "GET"));    // 资源不存在
\`\`\`

元组模式在状态机、规则引擎中极常用。多个值组合判断时，比嵌套 if 清晰得多。

### 八、列表模式（C# 11+）⭐

按数组/列表的结构匹配：

\`\`\`csharp
// 局部函数
string Describe(int[] arr) => arr switch
{
    [] => "空数组",
    [var single] => $"单元素 {single}",
    [var first, var last] => $"两元素 {first},{last}",
    [0, .., 0] => "首尾都是 0",                    // .. 切片模式
    [var first2, .. var middle, var last2] => $"头={first2} 尾={last2} 中间{middle.Length}个"
};

Console.WriteLine(Describe(new[] { 1, 2, 3, 4 }));  // 头=1 尾=4 中间2个
Console.WriteLine(Describe(new[] { 0, 1, 0 }));     // 首尾都是 0
Console.WriteLine(Describe(Array.Empty<int>()));    // 空数组
\`\`\`

\`..\` 是切片模式，匹配「零或多个元素」，配合 var 可绑定到中间部分。列表模式让处理数组/列表的分支逻辑变得声明式。

### 九、模式匹配 vs if-else

\`\`\`csharp
// 局部函数：传统 if-else 风格
string OldWay(int n)
{
    if (n > 100) return "大";
    else if (n > 50) return "中";
    else if (n > 10) return "小";
    else return "微";
}

// 局部函数：模式匹配：声明式，逻辑一目了然
string NewWay(int n) => n switch
{
    > 100 => "大",
    > 50 => "中",
    > 10 => "小",
    _ => "微"
};

Console.WriteLine(NewWay(75));  // 中
\`\`\`

模式匹配优势：
1. **可读性**：分支结构清晰，每条规则一个箭头。
2. **不可变性**：表达式无副作用，便于函数式编程。
3. **编译器检查**：穷尽性、未使用分支会警告。
4. **可组合**：嵌套模式层层解构。

### 十、实战 demo：简易 HTTP 路由分发

\`\`\`csharp
// 局部函数
string Dispatch(Request req) => req switch
{
    { Method: "GET", Path: "/" } => "首页",
    { Method: "GET", Path: "/users" } => "用户列表",
    { Method: "GET", Path: var p } when p.StartsWith("/users/") => $"用户详情 {p[7..]}",
    { Method: "POST", Path: "/users", Body: var b } => $"创建用户：{b}",
    { Method: "DELETE", Path: var p } when p.StartsWith("/users/") => $"删除用户 {p[7..]}",
    _ => "404 未找到"
};

// 可执行代码
Console.WriteLine(Dispatch(new Request("GET", "/", "")));              // 首页
Console.WriteLine(Dispatch(new Request("GET", "/users/42", "")));     // 用户详情 42
Console.WriteLine(Dispatch(new Request("POST", "/users", "张三")));    // 创建用户：张三
Console.WriteLine(Dispatch(new Request("DELETE", "/users/1", "")));   // 删除用户 1

// 类型声明放在最后
public record Request(string Method, string Path, string Body);
\`\`\`

### 小结

- 模式匹配 = 检查形状 + 提取数据，一个表达式干两件事。
- \`is 类型 变量\` 取代 \`is + as\`；\`switch 表达式\` 取代繁琐的 switch 语句。
- 关键模式：类型、属性、位置、元组、列表、关系（>0）、\`when\` 守卫。
- 列表模式 + 切片（\`..\`）是 C# 11 新增，处理数组结构超方便。
- ⭐ 现代 C# 业务代码大量使用模式匹配——尤其是路由分发、状态机、规则引擎。
- ⚠️ **顶级语句顺序**：using → 执行代码/局部函数 → 类型声明（class/record/interface/struct/enum/delegate），否则 CS8803。`,
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
// ===== 为什么 record 适合 DTO？ =====
// DTO（Data Transfer Object）的核心需求：
// 1. 值相等：两个 DTO 内容相同就应该相等，而不是引用相等
// 2. 不可变：DTO 一旦创建不应被修改，避免副作用
// 3. 漂亮打印：ToString() 应该显示所有字段值，方便调试
// 4. 解构：方便用元组语法提取字段
// 传统 class 需要手写几十行 Equals/GetHashCode/ToString/Deconstruct，record 一行搞定！

// 可执行代码先写
var p1 = new PointRecord(1, 2);
var p2 = new PointRecord(1, 2);
Console.WriteLine(p1 == p2);   // True —— 值相等，不是引用相等
Console.WriteLine(p1);         // PointRecord { X = 1, Y = 2 }
Console.WriteLine(p1.Equals(p2)); // True —— 值相等语义

// 对比 class：默认引用相等
var pc1 = new PointClass { X = 1, Y = 2 };
var pc2 = new PointClass { X = 1, Y = 2 };
Console.WriteLine(pc1 == pc2); // False —— class 默认按引用比较，即使内容相同

// 类型声明放最后（CS8803 规则）
// 传统 class 写一个数据类：要重写 Equals/GetHashCode/ToString，否则按引用比较
public class PointClass
{
    public int X { get; init; }
    public int Y { get; init; }
}

// record 一行搞定：上面那些方法编译器自动生成
public record PointRecord(int X, int Y);
\`\`\`

record 自动生成：构造函数、\`Equals\`/\`GetHashCode\`（按所有字段值比较）、\`ToString\`（漂亮打印）、\`Deconstruct\`（解构）。

### 二、record 定义：主构造函数 ⭐

\`\`\`csharp
// ===== 可执行代码在前 =====
var u = new User("张三", 28);
Console.WriteLine(u.Name);          // 张三
Console.WriteLine(u.Age);           // 28
Console.WriteLine(u);               // User { Name = 张三, Age = 28 }

var p = new Product(1, "鼠标", 100);
Console.WriteLine(p.DisplayName);          // 鼠标 - ¥100
Console.WriteLine(p.DiscountedPrice);      // 90

// ===== 类型声明在后 =====
// 最常用：主构造函数形式，参数即属性
public record User(string Name, int Age);

// 也可加额外成员
public record Product(int Id, string Name, decimal Price)
{
    public string DisplayName => $"{Name} - ¥{Price}";   // 计算属性
    public decimal DiscountedPrice => Price * 0.9m;
}
\`\`\`

主构造函数参数自动转成 \`init\` 只读属性，外部无法修改。这是不可变数据的基础——创建后不能改，只能通过 \`with\` 创建副本。

### 三、with 表达式：不可变修改 ⭐

record 是不可变的——要「修改」用 \`with\` 创建副本：

\`\`\`csharp
// 可执行代码
var p1 = new Point(3, 4);
// var p2 = new Point(10, 4);  // 传统写法要全参数
var p2 = p1 with { X = 10 };    // 只改 X，Y 保持不变
Console.WriteLine(p2);          // Point { X = 10, Y = 4 }
Console.WriteLine(p1);          // Point { X = 3, Y = 4 } —— 原对象不变！

// 嵌套 record：with 也要嵌套修改
var b1 = new Box(new Point(0, 0), new Point(100, 100));
var b2 = b1 with { TopLeft = b1.TopLeft with { X = 10 } };
Console.WriteLine(b2);
// Box { TopLeft = Point { X = 10, Y = 0 }, BottomRight = Point { X = 100, Y = 100 } }

// ===== 为什么不可变重要？ =====
// 1. 线程安全：不可变对象多线程访问无需加锁
// 2. 可预测：传给方法的对象不会被意外修改
// 3. 调试友好：对象状态创建后固定，不会变来变去
// 4. 支持值相等：不可变对象的哈希码可以缓存
// with 表达式不是修改原对象，而是创建一个浅拷贝并修改指定属性——函数式编程核心思想

// 类型声明
public record Point(int X, int Y);
public record Box(Point TopLeft, Point BottomRight);
\`\`\`

\`with\` 创建新对象，**原对象保持不变**——这是函数式编程的核心思想，并发安全。

### 四、值相等 ⭐

record 的相等按字段值，不按引用：

\`\`\`csharp
// 可执行代码
var m1 = new Money(100, "CNY");
var m2 = new Money(100, "CNY");
var m3 = new Money(200, "CNY");

Console.WriteLine(m1 == m2);     // True —— 值相等
Console.WriteLine(m1.Equals(m2)); // True
Console.WriteLine(m1 == m3);     // False —— 金额不同
Console.WriteLine(m1 != m3);     // True

// 对比 class
var c1 = new MoneyClass { Amount = 100, Currency = "CNY" };
var c2 = new MoneyClass { Amount = 100, Currency = "CNY" };
Console.WriteLine(c1 == c2);     // False —— class 默认按引用比较

// ===== 值相等原理 =====
// 编译器为 record 生成的 Equals 方法会：
// 1. 检查是否同一类型
// 2. 逐个比较每个主构造函数参数的值（值类型按值比，引用类型调用 Equals）
// 3. 比较额外定义的字段/属性
// 这就是为什么 record 特别适合值对象、DTO、消息等场景——语义上"内容相同即相等"

// 类型声明
public record Money(decimal Amount, string Currency);
public class MoneyClass { public decimal Amount; public string Currency; }
\`\`\`

record 默认实现值相等，无需手写 \`Equals\`/\`GetHashCode\`。

### 五、init 属性：只读初始化

\`\`\`csharp
// 可执行代码
var p = new Person { Name = "李四", Age = 25 };
Console.WriteLine(p.Name);  // 李四
// p.Name = "王五";  // 编译错误！init 只能在构造时赋值
var p2 = p with { Name = "王五" };   // OK，with 创建新对象
Console.WriteLine(p2.Name); // 王五
Console.WriteLine(p.Name);  // 李四 —— 原对象不变

// 类型声明
public record Person
{
    public string Name { get; init; } = "";
    public int Age { get; init; }
}
\`\`\`

\`init\` 介于 \`set\` 和 \`get\` 之间：构造期可写（对象初始化器、构造函数、with表达式），构造完只读——不可变性的关键。

### 六、record struct（C# 10）

普通 record 是引用类型（堆上分配），\`record struct\` 是值类型：

\`\`\`csharp
// 可执行代码
var pr = new PointRef(1, 2);
var ps = new PointStruct(1, 2);

// 值相等：两种 record 都按值比较
Console.WriteLine(new PointStruct(1, 2) == new PointStruct(1, 2));  // True

// with 也都支持
var ps2 = ps with { X = 10 };
Console.WriteLine(ps2);  // PointStruct { X = 10, Y = 2 }

// ===== 什么时候用 record struct？ =====
// record struct 是值类型，分配在栈上（或作为其他对象的一部分内联分配）：
// - 数据小（< 16 字节）：如 Point(int,int)=8字节、Size、Color、DateTimeOffset 等
// - 需要高性能、少 GC 压力：值类型不产生堆分配
// - 需要按值传递语义：赋值时拷贝，独立修改互不影响
// record class（默认）适合大对象、需要继承、需要引用传递的场景

// 类型声明
// 引用类型 record：分配在堆上
public record class PointRef(int X, int Y);
// 值类型 record：分配在栈上
public record struct PointStruct(int X, int Y);
\`\`\`

何时用 \`record struct\`？数据小（< 16 字节）、需要按值传递、不需要堆分配——比如 Point、Size、Color。

### 七、record class

\`record\` 默认就是 \`record class\`，可显式写出：

\`\`\`csharp
// 可执行代码
var d = new Dog("旺财", "拉布拉多");
Console.WriteLine(d);    // Dog { Name = 旺财, Breed = 拉布拉多 }
Console.WriteLine(d is Animal);  // True —— 是 Animal

// 类型声明
public record class Animal(string Name);    // 显式 class
public record Animal2(string Name);        // 简写，等价 record class

// 继承：record class 可继承另一个 record class
public record Dog(string Name, string Breed) : Animal(Name);
\`\`\`

注意：record struct 不可继承（值类型都不能继承），只能继承 record class。

### 八、主构造函数与 init-only

\`\`\`csharp
// 可执行代码
var order = new Order(1, "张三", new List<OrderLine>
{
    new("鼠标", 2, 100),
    new("键盘", 1, 200)
});

Console.WriteLine(order.Total);   // 400

// ===== 注意：record 的只读只是"浅不可变" =====
// order.Lines = new List<...>();  // 编译错误：init 属性不能重新赋值
order.Lines.Add(new OrderLine("显示器", 1, 1000));  // OK！集合内部仍然可变
Console.WriteLine(order.Total);   // 1400 —— Lines 被修改了！
// 如果需要完全不可变：
// 1. 使用 ImmutableList<T> 代替 List<T>
// 2. 构造函数中对集合做防御性拷贝
// 3. 把集合类型声明为 IReadOnlyList<T>

// 类型声明
// 主构造函数参数自动成为 init 属性
public record Order(int Id, string Customer, List<OrderLine> Lines)
{
    public decimal Total => Lines.Sum(l => l.Subtotal);
}

public record OrderLine(string Product, int Qty, decimal Price)
{
    public decimal Subtotal => Qty * Price;
}
\`\`\`

注意：record 的「只读」只针对 init 属性本身，**集合内部仍可变**——若要完全不可变，集合要包成 \`IReadOnlyList\` 或用 \`ImmutableList\`。

### 九、Deconstruct 解构

record 自动生成 \`Deconstruct\`，可直接解构成元组：

\`\`\`csharp
// 可执行代码
var p = new Point(3, 4);
var (x, y) = p;                  // 调用 Deconstruct
Console.WriteLine($"{x},{y}");  // 3,4

// 多个变量同时解构
var (px, py) = new Point(10, 20);
Console.WriteLine($"{px},{py}");  // 10,20

// 解构也支持模式匹配（位置模式）
var desc = p switch
{
    (0, 0) => "原点",
    (var a, var b) when a == b => "对角线",
    _ => "其他"
};
Console.WriteLine(desc);  // 其他

// 类型声明
public record Point(int X, int Y);
\`\`\`

解构让 record 在元组场景、模式匹配中无缝对接。编译器生成的 \`Deconstruct\` 方法按主构造函数参数顺序输出。

### 十、实战 demo：消息体建模

\`\`\`csharp
// ===== 为什么事件/消息用 record？ =====
// 1. 事件是不可变的事实——一旦发生就不能改变
// 2. 事件需要值相等——相同内容的事件应该相等（方便去重、幂等处理）
// 3. 事件需要漂亮打印——日志记录时 ToString() 自动显示所有字段
// 4. 事件需要解构——方便模式匹配分发处理

// 局部函数
void PublishEvent<T>(T evt) where T : notnull
{
    // record 的 ToString 自动漂亮打印
    Console.WriteLine($"[事件] {DateTime.Now:HH:mm:ss} {evt}");
}

// 可执行代码
PublishEvent(new UserCreated(Guid.NewGuid(), "张三", "z*@****", DateTime.Now));
PublishEvent(new UserRenamed(Guid.NewGuid(), "张三", "张老三"));
PublishEvent(new UserDeleted(Guid.NewGuid(), DateTime.Now));

// 状态机示例：用 record + 模式匹配做状态转换
State next = Idle switch
{
    _ when Idle == Idle => Running,    // 这里用模式匹配跳转状态
    _ => Stopped
};
Console.WriteLine($"Idle -> {next.Name}");  // Running

// 类型声明
// 用 record 建模事件总线消息：不可变 + 值相等 + 解构
public record UserCreated(Guid Id, string Name, string Email, DateTime CreatedAt);
public record UserRenamed(Guid Id, string OldName, string NewName);
public record UserDeleted(Guid Id, DateTime DeletedAt);

// 状态机示例
public record State(string Name);
// 注意：顶级语句中不能声明 public static 字段，改为局部变量
static readonly State Idle = new("Idle");
static readonly State Running = new("Running");
static readonly State Stopped = new("Stopped");
\`\`\`

### 小结

- record 是「数据为王」的类型：自动生成构造、Equals、GetHashCode、ToString、Deconstruct。
- ⭐ \`with\` 表达式 + init 属性 = 不可变修改，并发安全。
- 值相等：record 按字段值比较，class 按引用比较。
- \`record struct\`（C# 10）适合小数据、栈分配。
- 主构造函数参数即 init 属性，最常用写法。
- record class 可继承；record struct 不可继承。
- ⭐ **为什么 record 适合 DTO/值对象/消息/事件**：值相等语义、不可变性、自动生成样板代码、解构支持模式匹配。
- ⚠️ 注意：record 的不可变是"浅"的，内部集合仍可能被修改，必要时用 ImmutableList。
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

> ⚠️ using System.Reflection; 是反射 API 的必要命名空间。

### 一、Type 类：类型的元数据

每个类型在运行时都对应一个 \`Type\` 对象——它是「类型的身份证」：

\`\`\`csharp
using System.Reflection;

// ===== 为什么反射慢？ =====
// 反射慢的根本原因：
// 1. 运行时查找：编译时无法确定类型，需要在运行时遍历元数据表（MethodDef、FieldDef 等）
// 2. 参数校验：Invoke 时需要检查参数数量、类型、兼容性
// 3. JIT 无法优化：直接调用可被 JIT 内联、优化，反射调用是间接的
// 4. 装箱拆箱：所有参数/返回值都是 object，值类型会产生装箱
// 性能差距：反射比直接调用慢 100-1000 倍，但缓存后可大幅缩小差距

// 可执行代码在前
// 三种获取 Type 对象
Type t1 = typeof(User);                   // 编译期已知类型，最快
User userInstance = new User { Name = "测试", Age = 1 };
Type t2 = userInstance.GetType();           // 运行时实例获取
Type t3 = Type.GetType("User")!;    // 按字符串名获取（需完全限定名）

Console.WriteLine(t1 == t2);              // True，同一类型同一 Type 对象（缓存）
Console.WriteLine(t1.Name);               // User
Console.WriteLine(t1.FullName);           // User（顶级语句中没有命名空间）
Console.WriteLine(t1.IsClass);            // True
Console.WriteLine(t1.IsAbstract);        // False

// 反射 API 说明：
// - typeof(T)：编译期解析，零运行时开销获取 Type
// - obj.GetType()：运行时获取实际类型（多态场景有用）
// - Type.GetType(fullyQualifiedName)：按字符串名称动态查找，支持加载外部类型
// Type 对象是运行时唯一的——同一 AppDomain 中同一类型永远只有一个 Type 实例

// 类型声明在后
public class User
{
    public string Name { get; set; } = "";
    public int Age;
    public void SayHi() => Console.WriteLine($"Hi, {Name}");
}
\`\`\`

\`Type\` 是反射的入口：拿到它就能查这个类型的所有信息。

### 二、获取成员：FieldInfo / MethodInfo / PropertyInfo

\`\`\`csharp
using System.Reflection;

// 可执行代码
Type t = typeof(Sample);

// 所有公共字段
Console.WriteLine("=== 公共字段 ===");
foreach (FieldInfo f in t.GetFields())
    Console.WriteLine($"字段：{f.Name} 类型={f.FieldType.Name}");
// 字段：Field 类型=Int32

// 所有公共属性
Console.WriteLine("=== 公共属性 ===");
foreach (PropertyInfo p in t.GetProperties())
    Console.WriteLine($"属性：{p.Name} 类型={p.PropertyType.Name}");
// 属性：Name 类型=String

// 所有公共方法（包含 object 继承的）
Console.WriteLine("=== 公共方法 ===");
foreach (MethodInfo m in t.GetMethods())
    Console.WriteLine($"方法：{m.Name} 返回={m.ReturnType.Name}");

// 按名字获取特定方法
MethodInfo? hello = t.GetMethod("Hello");
Console.WriteLine($"\\n特定方法：{hello?.Name}");   // Hello

// ===== 反射 API 说明 =====
// GetFields()/GetProperties()/GetMethods() 默认只返回公共成员（Public）
// 要获取私有成员需要加 BindingFlags：
// - BindingFlags.NonPublic：私有成员
// - BindingFlags.Instance：实例成员
// - BindingFlags.Static：静态成员
// - BindingFlags.Public：公共成员（默认）
// 常用组合：BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance
// 获取所有成员（含私有的）：t.GetFields(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance)

// 类型声明
public class Sample
{
    public int Field;
    private string _secret = "hidden";
    public string Name { get; set; } = "";
    public void Hello() => Console.WriteLine("Hello");
    private void Secret() => Console.WriteLine("psst");
}
\`\`\`

\`GetFields\`/\`GetProperties\`/\`GetMethods\` 默认只返回公共成员，加 \`BindingFlags.NonPublic | BindingFlags.Instance\` 可拿到私有成员。

### 三、动态创建实例

\`\`\`csharp
using System.Reflection;

// 可执行代码
Type t = typeof(Product);

// 1. 无参构造：Activator.CreateInstance
object? obj1 = Activator.CreateInstance(t);
Console.WriteLine($"无参创建：{obj1?.GetType().Name}");   // Product

// 2. 有参构造：通过构造函数信息
ConstructorInfo? ctor = t.GetConstructor(new[] { typeof(string), typeof(decimal) });
object? obj2 = ctor?.Invoke(new object[] { "鼠标", 99 });
Console.WriteLine($"有参创建：{obj2}");   // Product { ... Name=鼠标 Price=99 }

// 3. 泛型版本（类型安全）
Product p = (Product)Activator.CreateInstance(typeof(Product), "键盘", 199)!;
Console.WriteLine($"泛型版本：{p.Name}");    // 键盘

// ===== Activator.CreateInstance 用途 =====
// - DI 容器：根据注册的类型动态创建实例，注入依赖
// - 序列化：反序列化时根据类型名创建对象
// - 插件系统：加载 DLL 后根据类型名实例化插件
// - ORM：从 DataReader 读取时动态创建实体对象
// 性能提示：频繁创建时缓存 ConstructorInfo，或用表达式树编译成 Func<object> 更快

// 类型声明
public class Product
{
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public Product() { }
    public Product(string name, decimal price) { Name = name; Price = price; }
    public override string ToString() => $"Product {{ Name = {Name}, Price = {Price} }}";
}
\`\`\`

\`Activator.CreateInstance\` 是反射创建实例的入口，框架 DI 容器靠它实例化服务。

### 四、动态调用方法

\`\`\`csharp
using System.Reflection;

// 可执行代码
object calc = new Calculator();
Type t = calc.GetType();

// 公共方法
MethodInfo? add = t.GetMethod("Add");
object? result = add?.Invoke(calc, new object[] { 3, 4 });
Console.WriteLine($"3 + 4 = {result}");   // 7

// 私有方法：BindingFlags.NonPublic
MethodInfo? hidden = t.GetMethod("Hidden",
    BindingFlags.NonPublic | BindingFlags.Instance);
hidden?.Invoke(calc, null);   // 私有方法被调用

// ===== MethodInfo.Invoke 参数说明 =====
// 第一个参数：实例对象（静态方法传 null）
// 第二个参数：object[] 参数数组（无参传 null 或空数组）
// 返回值：object，需要强转
// 注意：
// 1. 参数类型必须严格匹配（int 不能传 long，即使隐式转换也不行）
// 2. 方法有 ref/out 参数时，参数数组里的值会被修改
// 3. 调用私有方法虽然技术上可行，但破坏封装，应谨慎使用

// 类型声明
public class Calculator
{
    public int Add(int a, int b) => a + b;
    private void Hidden() => Console.WriteLine("私有方法被调用");
}
\`\`\`

\`Invoke\` 第一个参数是实例（静态方法传 null），第二个是参数数组。

### 五、动态读写字段与属性

\`\`\`csharp
using System.Reflection;

// 可执行代码
object box = new Box();
Type t = box.GetType();

// 字段读写
FieldInfo? w = t.GetField("Width");
w?.SetValue(box, 100);
Console.WriteLine($"Width = {w?.GetValue(box)}");   // 100

// 属性读写
PropertyInfo? h = t.GetProperty("Height");
h?.SetValue(box, 200);
Console.WriteLine($"Height = {h?.GetValue(box)}");   // 200

// 验证
Box typedBox = (Box)box;
Console.WriteLine($"验证：{typedBox.Width} x {typedBox.Height}");  // 100 x 200

// ===== 读写注意事项 =====
// - SetValue/GetValue 都是 object，值类型会装箱
// - 私有字段/属性需要 BindingFlags.NonPublic
// - readonly 字段也能通过反射修改（不推荐，破坏不可变契约）
// - 性能优化：缓存 FieldInfo/PropertyInfo，或用 delegate/表达式树编译强类型访问器

// 类型声明
public class Box
{
    public int Width;
    public int Height { get; set; }
}
\`\`\`

### 六、读取特性（下一章详讲）

\`\`\`csharp
using System.Reflection;

// 可执行代码
// 通过反射读取特性
Type t = typeof(LoginForm);
foreach (PropertyInfo p in t.GetProperties())
{
    bool required = p.IsDefined(typeof(RequiredAttribute), false);
    Console.WriteLine($"{p.Name} 必填={required}");
}
// Username 必填=True
// Password 必填=True
// RememberMe 必填=False

// ===== 反射读取特性 API =====
// IsDefined(type, inherit)：只判断是否有该特性，最快，不实例化特性
// GetCustomAttribute<T>(inherit)：获取单个特性实例，可以读特性属性
// GetCustomAttributes<T>(inherit)：获取所有（允许 AllowMultiple=true 的场景）
// inherit 参数：是否搜索继承链（类/方法/属性的继承）
// 特性的本质：编译时作为元数据嵌入程序集，反射时按需实例化

// 类型声明
[AttributeUsage(AttributeTargets.Property)]
public class RequiredAttribute : Attribute { }

public class LoginForm
{
    [Required] public string Username { get; set; } = "";
    [Required] public string Password { get; set; } = "";
    public string? RememberMe { get; set; }
}
\`\`\`

\`IsDefined\` 只判断是否有特性，\`GetCustomAttribute\` 还能拿到特性实例读其属性。

### 七、反射应用场景 ⭐

#### 1. JSON 序列化（Newtonsoft.Json / System.Text.Json）

序列化库遍历对象所有公共属性，反射读取名字和值：

\`\`\`csharp
using System.Reflection;

// 可执行代码
var u = new User { Name = "张三", Age = 28 };
// 序列化库内部用反射读 Name/Age 的值，拼成 JSON
string json = System.Text.Json.JsonSerializer.Serialize(u);
Console.WriteLine(json);   // {"Name":"张三","Age":28}

// 类型声明
public class User { public string Name { get; set; } = ""; public int Age { get; set; } }
\`\`\`

#### 2. ORM（Entity Framework / Dapper）

ORM 把数据库表的列名映射到类属性，全靠反射：

\`\`\`csharp
// Dapper 查询时：根据 SELECT 列名，反射找到匹配属性，赋值
// var users = connection.Query<User>("SELECT Name, Age FROM Users");
// 简化演示：列名到属性的映射逻辑
Console.WriteLine("ORM 原理：通过反射将数据库列映射到对象属性");
Console.WriteLine("SELECT Name, Age FROM Users -> new User { Name = ..., Age = ... }");
\`\`\`

#### 3. 依赖注入容器

ASP.NET Core 的 DI 容器：扫描程序集，发现带特性或实现接口的类，反射创建实例注册：

\`\`\`csharp
// 简化版 DI 原理演示
Console.WriteLine("DI 容器原理：");
Console.WriteLine("1. services.AddTransient<IUserRepo, UserRepo>();  // 注册接口→实现映射");
Console.WriteLine("2. 解析时：反射查找 UserRepo 的构造函数参数");
Console.WriteLine("3. 递归解析依赖，最后 Activator.CreateInstance 创建实例");
\`\`\`

#### 4. 插件系统

主程序运行时加载 DLL，反射扫描所有实现 \`IPlugin\` 接口的类，实例化并调用：

\`\`\`csharp
using System.Reflection;

// 可执行代码（演示原理，实际需要 DLL 文件）
Console.WriteLine("插件系统原理：");
Console.WriteLine("1. Assembly.LoadFrom(\"MyPlugin.dll\") 加载外部程序集");
Console.WriteLine("2. asm.GetTypes() 遍历所有类型");
Console.WriteLine("3. typeof(IPlugin).IsAssignableFrom(type) 筛选实现接口的类型");
Console.WriteLine("4. Activator.CreateInstance(type) 创建插件实例");
Console.WriteLine("5. 调用 plugin.Run() 执行插件逻辑");

// 注意：可执行代码在前，引用的 IPlugin 类型在后面定义（顶级语句允许多遍扫描）

// 类型声明
public interface IPlugin { void Run(); }
\`\`\`

### 八、性能注意 ⭐

反射比直接调用慢 100-1000 倍：

\`\`\`csharp
using System.Reflection;
using System.Diagnostics;

// 可执行代码
var foo = new Foo();
var sw = Stopwatch.StartNew();

// 直接调用：极快
sw.Restart();
for (int i = 0; i < 1_000_000; i++) foo.Bar();
sw.Stop();
Console.WriteLine($"直接调用：{sw.ElapsedMilliseconds} ms");

// 反射调用：慢得多
MethodInfo? m = typeof(Foo).GetMethod("Bar");
sw.Restart();
for (int i = 0; i < 1_000_000; i++) m?.Invoke(foo, null);
sw.Stop();
Console.WriteLine($"反射调用：{sw.ElapsedMilliseconds} ms");

// ===== 反射性能优化手段 =====
// 1. 缓存 MemberInfo：不要每次循环都 GetMethod，存起来重复用（最大头的优化）
// 2. 委托缓存：用 Delegate.CreateDelegate 把 MethodInfo 转成强类型委托，接近直接调用速度
// 3. 表达式树：Expression.Lambda().Compile() 编译成委托，编译一次反复用
// 4. 泛型方法：MakeGenericMethod + 缓存，避免 object 装箱
// 5. Source Generator（.NET 6+）：编译期生成代码，零运行时反射开销（System.Text.Json 已采用）
// 实战经验：业务代码不要滥用反射——能编译期确定就别拖到运行时
// 框架内部用反射通常已做缓存，不用过于担心性能

// 类型声明
public class Foo { public int Bar() => 42; }
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

// 局部函数：简化 ORM：读 DataRow 生成实体
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

// 可执行代码
// 假装有 DataRow
var dt = new DataTable();
dt.Columns.Add("user_name"); dt.Columns.Add("age");
dt.Rows.Add("张三", 28);

var user = Map<UserEntity>(dt.Rows[0]);
Console.WriteLine($"Name={user.Name}, Age={user.Age}");    // Name=张三, Age=28

// ===== 自定义特性说明（与反射配合） =====
// 特性本身只是元数据标签，没有任何行为
// 反射读取特性后，根据特性的值来改变运行时行为
// 这就是"声明式编程"——你声明"这个属性映射到 user_name 列"，框架（通过反射）实现映射
// ASP.NET Core、EF Core、Newtonsoft.Json 都是这套机制：特性声明 + 反射执行

// 类型声明
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
\`\`\`

### 小结

- 反射 = 运行时探查类型信息，入口是 \`typeof\`/\`GetType()\`，核心是 \`Type\` 对象。
- \`Type\` 拿成员：\`GetFields\`/\`GetProperties\`/\`GetMethods\`/\`GetConstructors\`，BindingFlags 控制可见性。
- 动态能力：\`Activator.CreateInstance\` 创建实例，\`MethodInfo.Invoke\` 调用方法，\`SetValue\`/\`GetValue\` 读写成员。
- 三大应用：序列化、ORM、DI 容器；插件系统也常用。
- ⭐ **为什么反射慢**：运行时元数据查找、参数校验、JIT 无法优化、装箱开销——缓存 MemberInfo 可大幅改善。
- ⭐ 反射性能远低于直接调用——能缓存就缓存，能编译期就别拖运行时；Source Generator 是未来方向。
- 高频面试点：「反射是什么」「应用场景」「为什么慢」「如何优化」。`,
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
using System.Reflection;

// ===== 自定义特性的本质 =====
// 特性是编译期的"注解"，不会直接执行任何代码
// 它只是把额外信息（元数据）挂到代码元素上
// 只有当其他代码通过反射读取这个特性时，才会产生行为
// 这就是"声明式编程"——你声明"这个方法过时了"，编译器/框架看到后做相应处理
// 类似 Java 的注解、Python 的装饰器（但装饰器是运行时包装，特性是编译期元数据）

// ===== 注意：顶级语句中不能直接声明 public 方法 =====
// 带 public/private/protected/internal 修饰的方法必须放在 class/struct 内部
// 所以演示 Obsolete 特性时，我们把方法放到一个示例类里

// 可执行代码
var api = new Api();
api.NewMethod();   // 正常调用
// api.OldMethod();   // 调用 OldMethod 会编译警告 CS0618（IDE 黄色波浪线）
// api.GetV0();       // error: true 直接编译错误

// 类型声明
public class Api
{
    [Obsolete("请改用 NewMethod()", error: false)]
    public void OldMethod() => Console.WriteLine("旧方法被调用");

    public void NewMethod() => Console.WriteLine("新方法");
}
\`\`\`

特性「什么也不做」，但编译器/工具/框架看到它会做对应的事——\`Obsolete\` 让编译器发警告，\`Serializable\` 让序列化器认可这个类，\`Route\` 让 ASP.NET Core 注册路由。

### 二、内置常用特性

#### 1. Obsolete：标记过时

\`\`\`csharp
// 可执行代码
var api = new Api();
api.GetV1();   // 警告：V1 已废弃
// api.GetV0();  // 编译错误：V0 完全移除

// 类型声明
public class Api
{
    [Obsolete("V1 已废弃，请用 GetV2", error: false)]   // 警告
    public void GetV1() => Console.WriteLine("GetV1");

    [Obsolete("V0 完全移除，禁止使用", error: true)]    // 编译错误
    public void GetV0() => Console.WriteLine("GetV0");
}
\`\`\`

\`error: true\` 直接编译失败，强制迁移。这是库作者升级 API 时引导用户迁移的利器。

#### 2. Serializable：可序列化

\`\`\`csharp
// 可执行代码
Console.WriteLine("[Serializable] 标记类型可被二进制序列化");
Console.WriteLine("二进制格式化器（BinaryFormatter）看到此特性才允许序列化");
Console.WriteLine("注意：BinaryFormatter 在 .NET 8+ 已标记为过时，推荐 System.Text.Json");

// 类型声明
[Serializable]
public class Config
{
    public string Host = "";
    public int Port;
}
\`\`\`

#### 3. Conditional：条件编译

\`\`\`csharp
#define DEBUG   // 注意：#define 必须在文件最开头！这里在代码块中仅演示语法

using System.Diagnostics;

// 可执行代码
Logger.Debug("启动中");   // DEBUG 模式下输出
Logger.Audit("用户登录");  // DEBUG 模式下不调用，连参数表达式都不求值

// ===== Conditional vs #if =====
// #if DEBUG ... #endif 是条件编译，代码块整个不编译
// [Conditional("DEBUG")] 更优雅：
// 1. 方法本身总是编译（不会遗漏）
// 2. 调用点在不满足条件时，编译器整个移除调用（包括参数求值）
// 3. 多个 Conditional 是 OR 关系（有一个符号定义就调用）
// 注意：Conditional 方法必须返回 void，不能有 out 参数

// 类型声明
public class Logger
{
    [Conditional("DEBUG")]
    public static void Debug(string msg) => Console.WriteLine($"[DEBUG] {msg}");

    [Conditional("RELEASE")]
    public static void Audit(string msg) => Console.WriteLine($"[RELEASE] {msg}");
}
\`\`\`

\`Conditional\` 让调用「按编译常量条件编译」，比 \`#if\` 包调用更干净。

#### 4. 其他常用

\`\`\`csharp
using System.Runtime.InteropServices;
using System.Text.Json.Serialization;

// 可执行代码
Console.WriteLine("其他常用特性：");
Console.WriteLine("- DllImport：调用 Win32/C 原生 DLL");
Console.WriteLine("- ThreadStatic：每线程独立静态变量");
Console.WriteLine("- JsonPropertyName：JSON 序列化字段名映射");
// MessageBox(IntPtr.Zero, "Hello", "Test", 0);  // 需要 Windows 窗体

// 类型声明（演示这些特性怎么用）
public class NativeMethods
{
    [DllImport("user32.dll")]
    public static extern int MessageBox(IntPtr h, string text, string caption, int type);
}

public class ThreadStats
{
    [ThreadStatic]
    public static int _counter;
}

public class UserDto
{
    [JsonPropertyName("user_name")]
    public string Name { get; set; } = "";
}
\`\`\`

### 三、自定义特性 ⭐

#### 步骤 1：定义特性类

\`\`\`csharp
using System.Reflection;

// 可执行代码（演示如何使用）
Console.WriteLine("=== 自定义特性用法 ===");
Console.WriteLine("1. 继承 Attribute 基类");
Console.WriteLine("2. 加 [AttributeUsage] 限定可贴的目标");
Console.WriteLine("3. 类名以 Attribute 结尾（使用时可省略后缀）");
Console.WriteLine("4. 构造函数参数 = 位置参数；属性 = 命名参数");

// 验证特性可被反射读取
var prop = typeof(LoginDto).GetProperty("Username");
Console.WriteLine($"Username 有 Required 特性：{prop?.IsDefined(typeof(RequiredAttribute))}");

// 类型声明
// 1. 必须继承 Attribute
// 2. 类名习惯以 Attribute 结尾（使用时可省略）
[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public class RequiredAttribute : Attribute
{
    public string ErrorMessage { get; set; } = "必填";
    public RequiredAttribute() { }
    public RequiredAttribute(string msg) { ErrorMessage = msg; }
}

public class LoginDto
{
    [Required]
    public string Username { get; set; } = "";

    [Required("密码必填")]
    public string Password { get; set; } = "";
}
\`\`\`

\`AttributeUsage\` 限定此特性可贴的目标：类、方法、属性等。\`AllowMultiple\` 控制能否贴多次。

#### 步骤 2：使用特性

\`\`\`csharp
using System.Reflection;

// 可执行代码
Console.WriteLine("=== 特性参数类型 ===");
Console.WriteLine("位置参数：构造函数参数，必填，按顺序传");
Console.WriteLine("命名参数：属性赋值，可选，无序");
Console.WriteLine("特性参数只能是：常量、typeof()、数组创建表达式");

// 验证特性实例
var pwdProp = typeof(LoginDto2).GetProperty("Password");
var reqAttr = pwdProp?.GetCustomAttribute<RequiredAttribute>();
Console.WriteLine($"Password 错误消息：{reqAttr?.Message}");

// 类型声明
public class RequiredAttribute : Attribute
{
    public string Message { get; }
    public RequiredAttribute(string msg = "必填") { Message = msg; }
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

public class LoginDto2
{
    [Required]
    public string Username { get; set; } = "";

    [Required("密码必填")]
    [MinLength(6)]
    public string Password { get; set; } = "";

    [Range(0, 120)]
    public int Age { get; set; }
}
\`\`\`

特性参数分两种：
- **位置参数**：构造函数参数，如 \`Required("密码必填")\`。
- **命名参数**：可选属性赋值，如 \`[Required(ErrorMessage = "必填")]\`。

### 四、命名参数

\`\`\`csharp
using System.Reflection;

// 可执行代码
Console.WriteLine("命名参数是属性 = 值语法");
Console.WriteLine("可以省略（用默认值），顺序任意");

var usernameProp = typeof(Form).GetProperty("Username");
var display = usernameProp?.GetCustomAttribute<DisplayAttribute>();
Console.WriteLine($"Username 显示名：{display?.Name}，排序：{display?.Order}");

// 类型声明
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

// 局部函数
void Validate(object obj)
{
    foreach (PropertyInfo p in obj.GetType().GetProperties())
    {
        // 判断是否有 Required 特性
        if (p.GetCustomAttribute<RequiredAttribute>() is { } req)
        {
            object? val = p.GetValue(obj);
            if (val is null or "")
                Console.WriteLine($"{p.Name} 验证失败：{req.Message}");
            else
                Console.WriteLine($"{p.Name} 验证通过");
        }
    }
}

// 可执行代码
var u = new UserDto { Name = "", Email = "a@b.com", Phone = null };
Validate(u);
// Name 验证失败：用户名必填
// Email 验证通过
// Phone 没贴 Required，跳过

// ===== 三种读取方法对比 =====
// IsDefined：只判断是否存在，不实例化特性对象，性能最好
// GetCustomAttribute<T>：获取单个实例，可读取属性值
// GetCustomAttributes<T>：获取所有（AllowMultiple=true 时用）
// inherit 参数：true 时搜索继承链（子类继承父类的特性）
// 实际项目中建议封装成 Validate() 这样的帮助方法，像 ASP.NET Core ModelState 那样

// 类型声明
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
\`\`\`

三种读取方法：
- \`IsDefined(typeof(X))\`：只判断是否存在，最轻量。
- \`GetCustomAttribute<T>()\`：取单个（重复时取第一个）。
- \`GetCustomAttributes<T>()\`：取所有，返回数组。

### 六、实战 demo：数据验证框架

\`\`\`csharp
using System.Reflection;
using System.Text.RegularExpressions;

// 局部函数
List<string> Validate(object obj)
{
    var errors = new List<string>();
    foreach (PropertyInfo p in obj.GetType().GetProperties())
    {
        foreach (var attr in p.GetCustomAttributes<ValidationAttribute>())
        {
            if (!attr.IsValid(p.GetValue(obj)))
                errors.Add($"{p.Name}: {attr.ErrorMessage}");
        }
    }
    return errors;
}

// 可执行代码
var dto = new RegisterDto { Name = "", Email = "bad", Age = 200 };
foreach (var e in Validate(dto)) Console.WriteLine(e);
// Name: 必填
// Email: 邮箱格式错误
// Age: 校验失败

// ===== 这就是 ASP.NET Core Model 验证的原理！ =====
// 你写 [Required][EmailAddress][Range]，框架在模型绑定时
// 通过反射找到所有 ValidationAttribute，调用 IsValid 做校验
// 失败就把错误信息放到 ModelState 里返回 400
// 这就是"声明式验证"——只贴标签，验证逻辑由框架通过反射执行
// 你也可以轻松扩展自定义验证特性（如 [Phone]、[IdCard] 等）

// 类型声明
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
        v is string s && Regex.IsMatch(s, @"^[\w.-]+@[\w.-]+\.\w+$");
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
\`\`\`

这就是 ASP.NET Core \`[Required]\`/\`[EmailAddress]\`/\`[Range]\` 等数据注解的本质——你自己也能写。

### 七、实战 demo：表映射（迷你 EF）

\`\`\`csharp
using System.Reflection;

// 局部函数
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
        cols.Where(c => c.IsKey).Select(c => $"{c.Col}=@{c.Prop.Name}"));
    return $"SELECT {columnList} FROM {table} WHERE {where}";
}

// 可执行代码
Console.WriteLine(BuildSelectSql<User>());
// SELECT id, user_name, email_addr FROM t_user WHERE id=@Id

// ===== EF Core 的工作原理类似 =====
// 1. 启动时扫描实体类上的 [Table]、[Column]、[Key] 等特性
// 2. 构建实体→表、属性→列的映射模型
// 3. LINQ 查询翻译为 SQL 时根据映射生成正确的列名/表名
// 4. 结果映射时根据映射通过反射赋值给实体属性
// Dapper Contrib、FreeSql 等 ORM 也是同样的机制——特性 + 反射

// 类型声明
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
\`\`\`

EF Core、Dapper Contrib 都是这套机制——读特性生成 SQL。

### 小结

- 特性 = 给代码贴「元数据标签」，本身不执行逻辑，靠反射读取驱动行为。
- 内置高频：\`Obsolete\`（过时警告/错误）、\`Serializable\`、\`Conditional\`、\`DllImport\`、\`JsonPropertyName\`。
- **自定义特性**：继承 \`Attribute\`，加 \`AttributeUsage\` 限定目标，命名参数用 \`属性 = 值\`。
- ⭐ 反射读特性三招：\`IsDefined\` 判存在（最快）、\`GetCustomAttribute<T>\` 取单个、\`GetCustomAttributes<T>\` 取全部。
- 应用场景：数据验证（ASP.NET Core Model 验证）、ORM 表/列映射、序列化字段重命名、API 文档生成（Swagger 读特性生成说明）。
- 高频面试点：「特性是什么」「和注释区别」「怎么自己写」「和反射的关系」。
- ⚠️ 注意：顶级语句中 public/private 方法必须放在 class 内部，不能直接声明。`,
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
// p.Age = 29;   // 编译错误！匿名类型属性是只读的

// ===== 匿名类型要点 =====
// 1. var 必须用——你写不出类型名（编译器生成的内部名带 <> 非法字符）
// 2. 属性是只读的（get-only，不是 init），创建后不能修改
// 3. 编译器生成的 class 是 sealed，不能继承
// 4. 同一程序集中，属性名+顺序+类型相同的匿名类型是同一个类
// 5. 自动生成 Equals/GetHashCode/ToString（按值相等）
// 用途：LINQ 投影（select new { ... }）、临时数据传递、Join 中间结果
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

// 顺序不同是不同类型！
var d = new { Age = 28, Name = "张三" };  // Age 在前，Name 在后
Console.WriteLine(a.GetType() == d.GetType());   // False！类型不同
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
    Console.WriteLine($"{s.Name}: {s.Salary}");
// 张三: 8000 / 李四: 15000 / 王五: 5000

// 分组聚合
var byAge = users.GroupBy(u => u.Age > 30 ? "老" : "少")
    .Select(g => new { Group = g.Key, Count = g.Count(), Avg = g.Average(u => u.Salary) });
foreach (var g in byAge)
    Console.WriteLine($"{g.Group}: {g.Count} 人，平均 {g.Avg}");

// ===== 为什么 LINQ 用匿名类型？ =====
// 数据库查询经常只需要部分字段——SELECT Name, Salary FROM Users
// 如果不用匿名类型，你要么：
// 1. 新建一个 UserSummary 类（类爆炸，每个查询都要建类）
// 2. 返回全字段 User 对象（浪费内存、带宽，暴露不必要数据）
// 匿名类型正好解决：临时投影、不需要复用、用完即弃的场景
// EF Core 中 select new { ... } 还能让 EF 只 SELECT 需要的列，提升查询性能
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

// 运行时错误例子（编译通过，运行时抛异常）
try
{
    d = 42;
    // Console.WriteLine(d.Length);  // RuntimeBinderException：int 没有 Length
}
catch (Exception ex)
{
    Console.WriteLine($"运行时错误：{ex.GetType().Name}");
}

// ===== dynamic 原理 =====
// dynamic 本质是 object + DLR（Dynamic Language Runtime）动态绑定
// 编译器不做类型检查，把所有成员调用打包成"调用站点"(CallSite)
// 运行时 DLR 缓存绑定结果，第一次查找后缓存，后续调用快一些
// 但仍然比直接调用慢很多（和反射差不多）
// 主要用途：COM 互操作（Office 自动化）、动态语言互操作（IronPython）、处理结构未知的 JSON/XML
\`\`\`

要点：
- 编译器放弃类型检查——成员是否存在、参数是否匹配，**都推迟到运行时**。
- 类型可在运行时变（本质是 \`object\` + 动态绑定）。
- 找不到成员抛 \`RuntimeBinderException\`。

### 五、dynamic vs var vs object ⭐

三者容易混淆，区别是「什么时候确定类型」：

\`\`\`csharp
// var：编译期确定类型，强类型，仅是"语法糖简写"
var s1 = "hi";      // s1 编译期确定为 string，完全类型安全
// s1 = 42;          // 编译错误，类型固定为 string
Console.WriteLine(s1.Length);   // 直接调用 string.Length，无开销

// object：编译期是 object，运行时本是别的类型，但要用得强转/拆箱
object o = "hi";
// o.Length;          // 编译错误！object 没有 Length 属性
Console.WriteLine(((string)o).Length);  // 需要显式强转

// dynamic：编译期完全不检查，运行时才绑定
dynamic d = "hi";
Console.WriteLine(d.Length);    // OK，运行时发现是 string，绑定 Length
d = 42;                         // 类型可在运行时改变
Console.WriteLine(d.ToString());  // OK，运行时绑定 int.ToString

// ===== dynamic/var/object 区别总结 =====
// | 关键字 | 编译期类型检查 | 运行时绑定 | 类型可否变 | 性能           | 典型场景           |
// |--------|---------------|-----------|-----------|---------------|-------------------|
// | var    | 完全检查       | 否        | 否        | 与直接写类型相同 | 绝大多数变量声明   |
// | object | 检查object成员 | 需要强转   | 装拆箱后可 | 装拆箱开销     | 通用容器、互操作   |
// | dynamic| 不检查         | 是        | 是        | 慢（DLR绑定）  | COM/动态语言/动态JSON |
\`\`\`

对比表：

| 关键字 | 编译期类型检查 | 运行时绑定 | 性能 |
|--------|---------------|-----------|------|
| var | 有（完全类型安全） | 否 | 与显式类型相同 |
| object | 有（但只能用 object 成员） | 装拆箱/强转 | 装拆箱开销 |
| dynamic | 无 | 是（DLR绑定） | 慢（运行时查找） |

### 六、ExpandoObject：动态对象

\`ExpandoObject\` 是「可在运行时增删成员」的对象：

\`\`\`csharp
using System.Dynamic;

dynamic eo = new ExpandoObject();
eo.Name = "张三";           // 动态添加属性
eo.Age = 28;
eo.SayHi = (Action)(() => Console.WriteLine($"Hi, {eo.Name}"));  // 动态添加方法

eo.SayHi();      // Hi, 张三
Console.WriteLine(eo.Age);  // 28

// 动态添加属性集合
eo.Tags = new List<string> { "vip", "active" };
Console.WriteLine(string.Join(",", eo.Tags));   // vip,active

// 也能当字典用（ExpandoObject 实现了 IDictionary<string, object?>）
var dict = (IDictionary<string, object?>)eo;
foreach (var kv in dict)
    Console.WriteLine($"{kv.Key} = {kv.Value}");

// ===== ExpandoObject 用途 =====
// 1. 处理无固定 schema 的 JSON/XML（反序列化成 dynamic 访问）
// 2. 动态构建数据传给模板引擎（如 Razor 视图）
// 3. 快速原型开发，不需要先定义类
// 4. COM 互操作时简化写法
// 注意：ExpandoObject 性能比静态类型差，且没有编译检查，不要滥用
// 生产代码中，数据结构明确时应优先使用强类型 class/record
\`\`\`

\`ExpandoObject\` 适合处理「结构未知的数据」——比如读 JSON 没有对应类、配置文件解析。

### 七、反射 vs dynamic

很多场景两者都能做，但 dynamic 简洁得多：

\`\`\`csharp
using System.Reflection;

// 可执行代码
object obj = new Foo();

// 反射写法：啰嗦
var method = obj.GetType().GetMethod("Bar");
string? result1 = (string?)method?.Invoke(obj, null);
Console.WriteLine($"反射结果：{result1}");   // baz

// dynamic 写法：简洁
dynamic d = obj;
string result2 = d.Bar();      // 运行时绑定
Console.WriteLine($"dynamic结果：{result2}");   // baz

// ===== 反射 vs dynamic 如何选择？ =====
// 已知对象类型，只是不想强转：用 dynamic（代码简洁）
// 需要枚举所有成员/查找特定名称的成员：必须用反射
// 性能敏感：反射缓存后比 dynamic 略快（都比直接调用慢很多）
// 需要处理私有成员：只能用反射（dynamic 只能访问公共成员）
// 动态添加/删除属性：用 ExpandoObject
// 一般原则：业务代码尽量不用这俩，强类型最安全；框架代码才需要动态能力

// 类型声明
public class Foo { public string Bar() => "baz"; }
\`\`\`

何时选哪个：
- 已知类型用 \`dynamic\`（代码简洁）。
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
Console.WriteLine(data.name);          // 张三（注意：System.Text.Json 大小写敏感，和属性名一致）
Console.WriteLine(data.age);           // 28
// System.Text.Json 反序列化 ExpandoObject 时嵌套对象也是 JsonElement，需要转换
// 实际项目中推荐：有固定 schema 就定义 record/class 强类型反序列化
// 只有真正动态的结构才考虑 ExpandoObject 或 JsonNode

Console.WriteLine("\\n注意：System.Text.Json 动态访问推荐使用 JsonNode：");
var node = System.Text.Json.Nodes.JsonNode.Parse(json)!;
Console.WriteLine(node["name"]);       // 张三
Console.WriteLine(node["address"]["city"]);  // 北京

// 动态修改后序列化回去
node["age"] = 29;
node["email"] = "z*@****";
string newJson = node.ToJsonString(new JsonSerializerOptions { WriteIndented = true });
Console.WriteLine(newJson);
\`\`\`

### 九、实战 demo：动态包装器

\`\`\`csharp
using System.Dynamic;

// 可执行代码
dynamic d = new DynDict();
d.Name = "张三";
d.Age = 28;
Console.WriteLine(d.Name);    // 张三
Console.WriteLine(d.Age);     // 28

// 尝试访问不存在的键
Console.WriteLine(d.NonExistent ?? "不存在");  // 不存在

// ===== DynamicObject 原理 =====
// 继承 DynamicObject 后，你可以完全控制 dynamic 的行为：
// TryGetMember：访问属性时触发（d.Name）
// TrySetMember：设置属性时触发（d.Name = "张三"）
// TryInvokeMember：调用方法时触发（d.SayHi()）
// TryGetIndex：索引器访问（d[0]）
// 这让你可以实现：
// - 动态字典（像 JS 对象那样访问）
// - Fluent API/DSL（领域特定语言）
// - XML/HTML 构建器
// - 延迟加载代理
// WPF 的 DynamicObject、ASP.NET ViewBag 都是类似原理

// 类型声明
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
\`\`\`

继承 \`DynamicObject\` 重写 \`TryGetMember\`/\`TrySetMember\`/\`TryInvokeMember\`，可定制 dynamic 行为——FluentInterface、XML/HTML 构建器常这么写。

### 小结

- 匿名类型 \`new { Name = "..." }\`：**编译期**生成 sealed class，强类型，只读属性，LINQ 投影必备。
- 匿名类型值相等：相同属性名+顺序+类型+值即相等，自动生成 \`Equals\`/\`GetHashCode\`。
- ⭐ \`dynamic\`：**运行时**通过 DLR 绑定，放弃编译期类型检查，比强类型慢，找不到成员抛 \`RuntimeBinderException\`。
- **dynamic/var/object 区别**：var 编译期已知且固定（强类型推荐）、object 需要强转（通用基类）、dynamic 完全动态（少用）。
- \`ExpandoObject\` 可动态增删成员，处理结构未知数据（JSON、配置）；\`DynamicObject\` 自定义重写实现动态行为。
- 反射 vs dynamic：已知类型用 dynamic 简洁；枚举成员、访问私有成员必须反射。
- ⭐ **实战建议**：业务代码优先强类型（var/匿名类型），dynamic 留给「COM 互操作/跨语言互操作/结构真正未知的动态数据」场景。`,
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
// ===== 协变逆变解决什么问题？ =====
// 面向对象里：Dog 是 Animal，所以 Dog 可以赋值给 Animal 变量
// 但泛型默认不兼容：List<Dog> 不能赋值给 List<Animal>
// 为什么？因为 List<T> 既可以读（out）也可以写（in），如果允许就会"往狗窝塞猫"
// 协变（out）：类型参数只用在"输出"位置（返回值），安全，可以"子→父"
// 逆变（in）：类型参数只用在"输入"位置（参数），安全，可以"父→子"

// 可执行代码
Dog d = new Dog();
Animal a = d;          // OK：Dog 是 Animal（里氏替换原则）

List<Dog> dogs = new List<Dog>();
// List<Animal> animals = dogs;   // 编译错误！List<Dog> 不能赋值给 List<Animal>
Console.WriteLine("Dog 是 Animal，但 List<Dog> 不是 List<Animal>——这是泛型不变性");

// 类型声明
public class Animal { }
public class Dog : Animal { }
\`\`\`

为什么不兼容？因为如果允许，下面这种情况就出问题：

\`\`\`csharp
Console.WriteLine("假设允许：List<Animal> animals = dogs;");
Console.WriteLine("  animals.Add(new Cat());   // 灾难！往 Dog 列表里塞了 Cat");
Console.WriteLine("这就是为什么既读又写的泛型（如 List<T>、IList<T>）不支持协变");
Console.WriteLine("但只读的 IEnumerable<out T> 就可以——因为不能往里加东西，安全");
\`\`\`

\`List<T>\` 既能读又能写，所以不能协变。但**只读的 \`IEnumerable<T>\` 就可以**。

### 二、协变 out：子类型 → 父类型 ⭐

\`out\` 关键字声明「T 只能出现在输出位置（返回值）」，编译器因此允许子类型泛型参数赋值给父类型：

\`\`\`csharp
using System.Collections.Generic;

// 可执行代码
// .NET 内置 IEnumerable<out T>：声明 T 只能用于输出
IEnumerable<Dog> dogs = new List<Dog> { new Dog(), new Dog() };
IEnumerable<Animal> animals = dogs;   // OK！协变——子→父

foreach (Animal a in animals)         // 取出来当 Animal 用
    Console.WriteLine($"取出：{a.GetType().Name}");

// 协变为什么安全？
// IEnumerable<Animal> 只能做一件事：遍历取出元素
// 取出的元素类型是 Animal，而 Dog 是 Animal
// 所以遍历 IEnumerable<Dog> 取出的每只 Dog 当然也是 Animal
// 没有办法通过 IEnumerable<Animal> 添加元素（没有 Add 方法）
// 所以不会出现"往狗窝塞猫"的问题，编译器通过 out 关键字保证安全

// 自定义协变接口演示
IProducer<Dog> dp = new DogProducer();
IProducer<Animal> ap = dp;             // OK，协变
Animal produced = ap.Produce();        // 取出来是 Dog，当 Animal 用没问题
Console.WriteLine($"生产：{produced.GetType().Name}");

// 类型声明
// 自定义协变接口：out 标记 T 只能用于输出（返回值）
public interface IProducer<out T>
{
    T Produce();                      // T 只能用作返回值，不能用作参数
}

public class DogProducer : IProducer<Dog>
{
    public Dog Produce() => new Dog();
}

public class Animal { }
public class Dog : Animal { }
\`\`\`

原理：\`IEnumerable<Animal>\` 只能**取出**元素，不能添加——既然取出来都是 \`Animal\`，那么 \`IEnumerable<Dog>\` 当然也是 \`IEnumerable<Animal>\`（取出的是 Animal 的子类 Dog，安全）。

\`out\` 约束：T 只能用在返回值、属性 getter，**不能用于方法参数**。

### 三、逆变 in：父类型 → 子类型 ⭐

\`in\` 关键字声明「T 只能出现在输入位置（参数）」，允许父类型泛型参数赋值给子类型——方向反过来：

\`\`\`csharp
using System;

// ===== 逆变原理：为什么"父→子"是安全的？ =====
// Action<Dog> 期望你传入一只狗给它处理
// Action<Animal> 能处理任何动物（包括狗）
// 所以"能处理任何动物的处理器"当然可以用来"只处理狗"
// 这和"子→父"的直觉相反，所以叫"逆"变
// 现实类比：
// - 能说"所有动物"的动物学家，当然可以只说狗
// - 但只会说狗的狗专家，不能说所有动物
// 对应到代码：
// - in T（参数位置）：父类型泛型可以赋值给子类型（逆变）
// - out T（返回位置）：子类型泛型可以赋值给父类型（协变）

// 可执行代码
// .NET 内置 Action<in T>：声明 T 只能用于参数
Action<Animal> animalAction = a => Console.WriteLine($"处理 Animal: {a.GetType().Name}");

// 反过来：把处理 Animal 的 Action 当成处理 Dog 的 Action
Action<Dog> dogAction = animalAction;   // OK！逆变——父→子

dogAction(new Dog());    // 调用：传入 Dog，被当作 Animal 处理（Dog 是 Animal，安全）

// 自定义逆变接口演示
IConsumer<Animal> ac = new AnimalConsumer();
IConsumer<Dog> dc = ac;                // OK，逆变
dc.Consume(new Dog());                 // 传入 Dog，按 Animal 处理

// 类型声明
// 自定义逆变接口：in 标记 T 只能用于输入（参数）
public interface IConsumer<in T>
{
    void Consume(T item);              // T 只能用作参数，不能用作返回值
}

public class AnimalConsumer : IConsumer<Animal>
{
    public void Consume(Animal a) => Console.WriteLine($"消费：{a.GetType().Name}");
}

public class Animal { }
public class Dog : Animal { }
\`\`\`

原理：\`Action<Dog>\` 期望接收 \`Dog\` 调用，传入 \`Dog\`。而 \`animalAction\` 能处理任何 \`Animal\`——既然 Dog 是 Animal，自然也能处理。所以「能处理 Animal 的处理器」可以赋值给「需要处理 Dog 的变量」。

\`in\` 约束：T 只能用在方法参数，**不能用于返回值**。

### 四、为何需要协变逆变

#### 协变价值：通用集合/产出接口

\`\`\`csharp
using System.Collections.Generic;
using System.Linq;

// 局部函数
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

public List<Dog> GetDogs() => new() { new Dog() };
public List<Cat> GetCats() => new() { new Cat() };
public List<Bird> GetBirds() => new() { new Bird() };

// 可执行代码
var allAnimals = GetAllAnimals();
Console.WriteLine($"动物总数：{allAnimals.Count()}");  // 3

// ===== 没有协变会怎样？ =====
// 如果 IEnumerable<T> 没有 out 标记：
// AddRange(IEnumerable<Animal>) 不能接受 List<Dog>
// 你需要为每种动物写一个 AddRangeDogs、AddRangeCats...
// 或者做痛苦的 .Cast<Animal>() 强转
// 协变让泛型接口在"只读/产出"场景下天然兼容——这是类型安全的多态

// 类型声明
public class Animal { }
public class Dog : Animal { }
public record Cat : Animal { }
public record Bird : Animal { }
\`\`\`

没有协变，\`AddRange\` 就得为每个具体类型写一遍，或大量强转。

#### 逆变价值：通用处理器/事件

\`\`\`csharp
using System;

// 可执行代码
Handler<AnimalEventArgs> animalHandler = args =>
    Console.WriteLine($"处理动物事件：{args.Name}");

Handler<DogEventArgs> dogHandler = animalHandler;  // 逆变
dogHandler(new DogEventArgs { Name = "旺财", Breed = "拉布拉多" });
// 输出：处理动物事件：旺财（Dog 事件被 Animal 处理器处理了）

// ===== 逆变的实际价值 =====
// 事件模型中：
// - 一个通用的"记录所有动物事件日志"的处理器
// - 可以订阅任何具体动物的事件（狗事件、猫事件、鸟事件）
// 因为处理器只需要访问 AnimalEventArgs 的成员（Name）
// 而 DogEventArgs 继承自 AnimalEventArgs，必然有 Name
// ASP.NET Core 中间件、事件总线、消息队列消费者大量使用这个模式
// 一个通用的日志中间件可以处理所有请求，一个通用的死信处理器可以处理所有消息类型

// 类型声明
// 事件处理器：处理基类的处理器可以接收所有子类事件
public delegate void Handler<in T>(T args);

public class AnimalEventArgs : EventArgs { public string? Name; }
public class DogEventArgs : AnimalEventArgs { public string? Breed; }
\`\`\`

ASP.NET Core 中间件、事件总线大量用逆变。

### 五、类型安全

协变逆变通过 \`out\`/\`in\` 让编译器**保证类型安全**：

\`\`\`csharp
// ===== 编译器如何保证安全？ =====
// out T 接口：如果允许 T 用作参数，就会出现"父容器接收子类型"问题
// in T 接口：如果允许 T 用作返回值，就会返回类型不匹配
// 编译器通过 out/in 关键字强制约束 T 的使用位置：
// - out T：只能出现在"输出"位置（返回值、getter）
// - in T：只能出现在"输入"位置（方法参数、setter）
// 违反则编译错误——从根源上杜绝类型安全问题
// 这是 C# 泛型比 Java 泛型（类型擦除）类型安全的原因之一

// 可执行代码
Console.WriteLine("类型安全由编译器保证：");
Console.WriteLine("- out T 接口里 T 不能做方法参数，否则编译错误");
Console.WriteLine("- in T 接口里 T 不能做返回值，否则编译错误");
Console.WriteLine("通过这些约束，协变/逆变在运行时不会出类型问题");

// 类型声明
// 正确：out T 只用在返回值
public interface IReadOnlyProducer<out T>
{
    T Produce();  // OK，返回值
}

// 正确：in T 只用在参数
public interface IWriteOnlyConsumer<in T>
{
    void Consume(T item);  // OK，参数
}

// 错误示例（注释掉，否则编译不通过）：
// public interface IBad<out T>
// {
//     void Take(T item);     // 编译错误！out T 不能做参数
//     T Give();
// }
// public interface IBad2<in T>
// {
//     void Take(T item);
//     T Give();              // 编译错误！in T 不能做返回值
// }
\`\`\`

类型安全口诀：
- **协变 out**：「\`IProducer<子>\` 当 \`IProducer<父>\` 用」——只读/产出，安全。
- **逆变 in**：「\`IConsumer<父>\` 当 \`IConsumer<子>\` 用」——只写/消费，安全。
- **不变（无修饰）**：「\`List<T>\` 既读又写」，不兼容。

### 六、Func / Action 的协变逆变

.NET 内置 \`Func<in T1, out TResult>\` 同时用了 in/out：

\`\`\`csharp
using System;

// ===== Func 为什么参数是 in、返回值是 out？ =====
// 这是函数类型的天然规律（函数式编程语言里也叫"箭头类型子类型化"）：
// 如果你有一个函数 Func<Dog, Animal>：接收 Dog，返回 Animal
// 能不能把它当成 Func<Animal, Dog> 用？
// - 参数位置（逆变 in）：调用者会传 Animal，函数期望 Dog——Animal 不一定是 Dog！
//   等等反过来：如果有 Func<Animal, Dog>，能不能当 Func<Dog, Animal>？
//   调用者传 Dog（是 Animal），函数返回 Dog（是 Animal）——安全！
// 规律是：参数类型逆变（父参数可被子参数替换），返回类型协变（子返回可被父返回替换）
// 这就是著名的"函数子类型与参数反变、返回协变"原则

// 可执行代码
// Func<T, TResult>：参数 T 是逆变，返回 TResult 是协变
Func<Animal, Dog> factory = a => { Console.WriteLine($"处理{a.GetType().Name}"); return new Dog(); };

// 协变 + 逆变：Func<Animal, Dog> 当 Func<Dog, Animal> 用
Func<Dog, Animal> generalized = factory;
// 因为：传入 Dog（比 Animal 更具体，可作 Animal），返回 Dog（是 Animal，可作 Animal）
// 两个方向都安全！

Animal result = generalized(new Dog());
Console.WriteLine($"结果类型：{result.GetType().Name}");  // Dog

// 类型声明
public class Animal { }
public class Dog : Animal { }
\`\`\`

记住：参数逆变、返回协变是函数式编程的天然规律——「函数类型」的子类型关系正好和参数反着、和返回顺着。

### 七、实战 demo：事件总线

\`\`\`csharp
using System;
using System.Collections.Generic;

// 局部函数：简化事件总线
public class EventBus
{
    private readonly Dictionary<Type, Delegate> _handlers = new();

    public void Subscribe<TEvent>(IHandler<TEvent> handler) where TEvent : DomainEvent
    {
        _handlers[typeof(TEvent)] = handler;
    }

    public void Publish<TEvent>(TEvent evt) where TEvent : DomainEvent
    {
        if (_handlers.TryGetValue(typeof(TEvent), out var del) && del is IHandler<TEvent> handler)
        {
            handler.Handle(evt);
        }
    }
}

// 可执行代码
var bus = new EventBus();
// 通用日志处理器可以订阅所有事件类型——多亏逆变
bus.Subscribe<UserCreated>(new GenericEventLogger());
bus.Subscribe<UserDeleted>(new GenericEventLogger());

bus.Publish(new UserCreated("张三"));
bus.Publish(new UserDeleted("李四"));
// 两个事件都被通用 Logger 处理了——如果没有逆变，就要为每个事件类型写一个 Logger

// ===== 逆变在事件总线中的价值 =====
// 没有逆变：
// class UserCreatedLogger : IHandler<UserCreated> { ... }
// class UserDeletedLogger : IHandler<UserDeleted> { ... }
// class UserRenamedLogger : IHandler<UserRenamed> { ... }
// ... 每个事件都要写一个几乎一样的 Logger，重复代码
// 有了逆变：
// 一个 GenericEventLogger : IHandler<DomainEvent> 搞定所有事件
// 这就是逆变带来的代码复用——通用处理器可以处理所有子类型事件

// 类型声明
public abstract record DomainEvent(DateTime OccurredAt);
public record UserCreated(string Name) : DomainEvent(DateTime.Now);
public record UserDeleted(string Name) : DomainEvent(DateTime.Now);

// 处理器接口：in 逆变——可以用父类型处理器处理子类型事件
public interface IHandler<in TEvent> where TEvent : DomainEvent
{
    void Handle(TEvent evt);
}

public class GenericEventLogger : IHandler<DomainEvent>
{
    public void Handle(DomainEvent evt) =>
        Console.WriteLine($"[{evt.OccurredAt:HH:mm:ss}] 收到事件 {evt.GetType().Name}");
}
\`\`\`

### 八、实战 demo：协变工厂与仓库

\`\`\`csharp
using System.Collections.Generic;
using System.Linq;

// 可执行代码
IRepository<User> userRepo = new UserRepository();
IRepository<IEntity> entityRepo = userRepo;   // 协变：User -> IEntity

Console.WriteLine("=== 协变仓库查询 ===");
foreach (var e in entityRepo.GetAll())
    Console.WriteLine($"[{e.Id}] {e}");

// ===== 协变在仓储模式中的价值 =====
// IRepository<out T> 是只读仓库（只有查询方法，没有 Add/Update/Delete）
// 协变允许：
// - IRepository<User> 赋值给 IRepository<IEntity>
// - 可以写通用的"实体审计"、"实体序列化"等代码
//   接受 IRepository<IEntity>，传入任何具体实体的仓库
// 如果既有读又有写（如 IRepository<T> 有 Add 方法），就不能标记 out
// 实践中常把接口拆分为：
// - IReadOnlyRepository<out T>（查询，协变）
// - IRepository<T> : IReadOnlyRepository<T>（增删改，不变）

// 类型声明
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
\`\`\`

### 九、记忆口诀

- **协变 out**：顺着走，\`IEnumerable<子>\` 当 \`IEnumerable<父>\`，\`Func<out TResult>\` 返回值。
- **逆变 in**：反着走，\`Action<父>\` 当 \`Action<子>\`，\`Func<in T>\` 参数。
- **out 只输出**：返回值、属性 get、不能做参数。
- **in 只输入**：方法参数、不能做返回值。
- **不变**：\`List<T>\`/\`IList<T>\` 既读又写，不能协变也不能逆变。

### 小结

- **协变（out）**：子类型泛型参数可赋值给父类型——只读/产出场景（\`IEnumerable<out T>\`、\`IProducer<out T>\`、\`Func<out TResult>\`）。
- **逆变（in）**：父类型泛型参数可赋值给子类型——只写/消费场景（\`Action<in T>\`、\`IHandler<in T>\`、\`IComparer<in T>\`）。
- ⭐ \`out\`/\`in\` 修饰让编译器通过约束 T 的位置（返回值/参数）来保证类型安全，否则默认泛型是不变（\`List<T>\`）。
- **协变逆变解决什么问题**：让泛型接口在类型安全的前提下支持多态——通用处理器可以处理子类型、通用集合可以接收子类型产出。
- 应用场景：通用集合（\`IEnumerable\`）、事件处理器（\`EventHandler\`）、Func/Action、DI 容器、仓储模式（只读仓库）。
- ⭐ 高频面试点：「为什么 \`List<Dog>\` 不能赋值给 \`List<Animal>\`」「协变逆变区别」「Func 为什么参数 in 返回 out」。
- 现代业务代码：理解 \`IEnumerable\`/\`Action\` 的协变逆变即可，自定义协变/逆变接口主要给框架作者用。
- ⚠️ **顶级语句顺序**：所有类型声明（class/interface/record）放在可执行代码之后，避免 CS8803。`,
  },
];

export { chapters };
