// C# 教程第 4 批章节（第三部分 面向对象 上）
// 覆盖：类与对象 / 字段与属性 / 方法 / 构造函数 / 静态成员
// C# 12 / .NET 8 LTS，全部使用顶级语句
const chapters = [
  {
    id: 'csharp4-ch18',
    group: '第三部分 面向对象',
    icon: '🏛️',
    title: '类与对象基础',
    content: `## 第十九章　类与对象基础

类（class）是面向对象编程的核心抽象，对象（object）则是它的具体实例。本章把"类是什么、怎么写、有哪些成员"一次讲清楚。

### 一、什么是类，什么是对象

类是一张"蓝图"或"模板"，描述某类事物共有的**数据**和**行为**。对象则是按蓝图造出来的具体实例。

打个比方：类是"汽车设计图纸"，对象是根据图纸造出来的"一辆真实的车"。图纸只有一份，但可以造出无数辆车，每辆车都有自己的状态（颜色、里程），但共享同一套行为（启动、刹车）。

在 C# 中，几乎所有东西都活在类（或 record、struct、interface）里。哪怕顶级语句，背后也是被编译器塞进一个隐藏的 Program 类。

### 二、声明类的语法

最简单的类声明：

\`\`\`csharp
class Student
{
    // 字段、属性、方法、构造函数等成员
}
\`\`\`

用 \`class\` 关键字声明，类名通常用 PascalCase。类前可加访问修饰符，默认是 \`internal\`（同程序集可见）。

### 三、类有哪些成员

C# 类可以包含非常丰富的成员：

- **字段（Field）**：存储数据的变量
- **属性（Property）**：对外暴露的、带 get/set 的"智能字段"
- **方法（Method）**：类能执行的行为
- **构造函数（Constructor）**：创建对象时初始化
- **事件（Event）**：发布/订阅通知机制
- **索引器（Indexer）**：用 \`[]\` 像数组一样访问对象
- **运算符（Operator）**：自定义 +、-、== 等
- **嵌套类型（Nested Type）**：类里再定义一个类

### 四、访问修饰符

C# 提供六种访问修饰符控制成员可见范围：

| 修饰符 | 同类 | 子类 | 同程序集 | 外部程序集 |
|--------|------|------|----------|------------|
| public | ✅ | ✅ | ✅ | ✅ |
| private | ✅ | ❌ | ❌ | ❌ |
| protected | ✅ | ✅ | ❌ | ❌ |
| internal | ✅ | ✅ | ✅ | ❌ |
| protected internal | ✅ | ✅ | ✅ | 仅子类 |
| private protected | ✅ | ✅ | 仅子类 | ❌ |

简单记忆：字段默认 private（推荐）；类内部成员不写修饰符默认 private；顶层类不写默认 internal。

### 五、file-scoped 类型

C# 11 引入 \`file\` 修饰符，让类型只在当前源文件可见，常用于源代码生成器避免命名冲突：

\`\`\`csharp
file class Helper { }
\`\`\`

### 六、partial 类

\`partial\` 关键字允许把一个类拆分到多个文件里：

\`\`\`csharp
public partial class User { public string Name; }  // FileA.cs
public partial class User { public int Age; }      // FileB.cs
\`\`\`

合并后等价于一个完整的 User 类。常用于分离自动生成代码与手写代码。

### 七、new 创建对象

\`new\` 运算符创建对象实例：

\`\`\`csharp
var s = new Student();
\`\`\`

\`new\` 做了三件事：1) 在堆上分配内存；2) 调用构造函数初始化字段；3) 返回引用赋给变量。

C# 9+ 支持目标类型 new：\`Student s = new();\`

### 八、对象初始化器

可以用 \`{ }\` 在创建对象时一次性设置公开属性：

\`\`\`csharp
var s = new Student { Name = "小明", Age = 18 };
\`\`\`

它会先调用无参构造函数，再依次给属性赋值。比写一堆构造函数重载简洁得多。

### 九、this 关键字

\`this\` 指向当前对象自己。两个常见用途：
1. 区分参数和字段（参数与字段同名时）
2. 构造函数链：\`public Student() : this("默认")\`

### 十、对象生命周期简介

对象从 \`new\` 创建开始，到没人引用时由 GC（垃圾回收器）自动回收结束。中间过程无需手动管理内存，这是 .NET 相对 C/C++ 的重要优势。

但要注意：持有非托管资源（文件、数据库连接）时，必须实现 \`IDisposable\` 主动释放，不能依赖 GC。

### 小结

类是"蓝图"，对象是"产品"；字段存数据、属性对外暴露、方法定义行为、构造函数初始化。访问修饰符控制可见性，\`partial\` 拆分文件，\`new\` 创建对象，\`this\` 引用自己。下一章深入讲字段与属性。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「类与对象基础」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句演示：类与对象基础
// 文件开头直接写可执行代码，类型声明写在后面

using System;

// 1. new 创建对象：调用无参构造函数
var stu1 = new Student();
Console.WriteLine($"stu1: {stu1.Name}, {stu1.Age}");

// 2. 带参构造函数 + 调用实例方法
var stu2 = new Student("小明", 18);
stu2.Introduce();

// 3. 对象初始化器：先无参构造，再赋值公开属性
var stu3 = new Student("小红", 17) { School = "实验中学" };  // Age 是 private set，只能走构造函数
stu3.Introduce();

// 4. 修改可写属性
stu2.Birthday = new DateTime(2007, 5, 1);
Console.WriteLine($"stu2 的生日：{stu2.Birthday:yyyy-MM-dd}");

// 5. partial 类：两部分合并成一个完整类
var p = new Person { Name = "老王" };
p.SayHi();

// 6. 调用静态方法（属于类本身，不需要对象）
Student.PrintTotal();

// ============ 类型声明区域（写在顶级语句之后） ============

// 完整的 Student 类：演示字段、属性、方法、构造函数、this
public class Student
{
    // 私有字段：内部状态，外部不可直接访问
    private string _id;                          // 实例字段
    private int _age;                            // 实例字段

    // 静态字段：所有实例共享一份数据
    public static int TotalCount;

    // 自动属性（编译器自动生成隐藏的私有字段）
    public string Name { get; set; }

    // 带私有 set 的属性：对外只读，对内可改
    public int Age
    {
        get => _age;                             // 表达式 get
        private set                              // 限制外部修改
        {
            if (value < 0 || value > 150)        // 参数验证
                throw new ArgumentException("年龄非法");
            _age = value;
        }
    }

    // 属性初始化器（C# 6+）
    public string School { get; set; } = "未知学校";

    // 自动属性 + DateTime
    public DateTime Birthday { get; set; }

    // 默认构造函数（无参）
    public Student()
    {
        _id = Guid.NewGuid().ToString();         // 生成唯一 ID
        Name = "匿名";
        Age = 0;
        TotalCount++;                            // 每创建一个对象，计数器+1
        Console.WriteLine($"[构造] 新学生 {_id} 已创建，当前总数 {TotalCount}");
    }

    // 构造函数重载 + 链式调用 this(...)
    public Student(string name, int age) : this()  // 先调用无参构造
    {
        Name = name;                             // 通过属性赋值
        Age = age;                               // 走 set 验证
    }

    // 实例方法：使用 this 引用当前对象
    public void Introduce()
    {
        // this.Name 等价于 Name，加 this 仅为强调"当前对象"
        Console.WriteLine($"大家好，我是 {this.Name}，{this.Age} 岁，就读于 {this.School}");
    }

    // 静态方法：属于类本身，不需要对象就能调用
    public static void PrintTotal()
    {
        // 静态方法里不能使用 this，也不能访问实例成员
        Console.WriteLine($"学生总数：{TotalCount}");
    }
}

// partial 类第一部分
public partial class Person
{
    public string Name { get; set; }
}

// partial 类第二部分（编译时与第一部分合并）
public partial class Person
{
    public void SayHi() => Console.WriteLine($"Hi, 我是 {Name}");
}`,
    lang: 'cs',
  },
  {
    id: 'csharp4-ch19',
    group: '第三部分 面向对象',
    icon: '🗃️',
    title: '字段与属性',
    content: `## 第二十章　字段与属性

字段和属性都是类用来"存数据"的成员，但角色截然不同：字段是底层存储，属性是受控的对外接口。

### 一、字段

字段就是类里直接声明的变量。按用途可分四类。

#### 1. 实例字段

每个对象都有自己独立的一份：

\`\`\`csharp
public class Product
{
    private string _name;     // 每个对象独立
}
\`\`\`

#### 2. 静态字段

用 \`static\` 修饰，所有实例共享同一份数据：

\`\`\`csharp
public static int TotalProducts;  // 全局共享
\`\`\`

#### 3. 只读字段

用 \`readonly\` 修饰，只能在声明时或构造函数里赋值，之后不可改：

\`\`\`csharp
public readonly DateTime CreatedAt;
\`\`\`

\`readonly\` 强调"构造完就锁定"，适合存放创建时间、序列号这类一旦确定就不变的数据。

#### 4. const 常量

\`const\` 是编译期常量，编译时直接替换为字面值：

\`\`\`csharp
public const double TaxRate = 0.13;
\`\`\`

**const vs readonly 对照**：

| 特性 | const | readonly |
|------|-------|----------|
| 赋值时机 | 编译期 | 运行期（构造函数） |
| 类型限制 | 仅基本类型/字符串 | 任意类型 |
| 隐式 static | 是 | 否 |
| 跨程序集 | 改值需重编译所有引用 | 不需要 |

跨程序集场景优先用 \`static readonly\`，避免 const 改了值但调用方没重编导致的"幽灵 bug"。

### 二、属性

属性看起来像字段，但本质是两个方法（get / set）。它对外提供"字段式"的访问语法，对内可以加入验证、计算、通知等逻辑。

#### 1. 自动属性

最简单的形式，编译器自动生成隐藏的私有字段：

\`\`\`csharp
public string Name { get; set; }
\`\`\`

#### 2. 完整属性（带 backing field）

需要自定义逻辑时手写 backing field：

\`\`\`csharp
private decimal _price;
public decimal Price
{
    get => _price;
    set => _price = value > 0 ? value : throw new ArgumentException();
}
\`\`\`

#### 3. 表达式属性

当 get 只有一行时可用 \`=>\` 简化：

\`\`\`csharp
public string DisplayName => Name + " - ¥" + Price;
\`\`\`

#### 4. 计算属性

属性可以动态计算，不一定有对应字段：

\`\`\`csharp
public decimal FinalPrice => Price * (1 - Discount);
\`\`\`

#### 5. init 只读属性（C# 9）

\`init\` 表示只能在对象初始化时赋值，之后只读：

\`\`\`csharp
public string Code { get; init; }
\`\`\`

适合不可变对象、record、DTO。

#### 6. required 必填属性（C# 11）

\`required\` 强制调用方在创建对象时必须赋值，否则编译报错：

\`\`\`csharp
public required string Sku { get; set; }
\`\`\`

配合 \`init\` 可创建严格不可变的必填属性：\`public required string Sku { get; init; }\`

#### 7. 私有 set

\`private set\` 让属性对外只读，对内可改：

\`\`\`csharp
public int Stock { get; private set; }
\`\`\`

#### 8. 属性初始化器

自动属性可直接给默认值：

\`\`\`csharp
public string Category { get; set; } = "未分类";
\`\`\`

### 三、属性 vs 字段：为什么需要属性

字段是裸数据，外部可以乱改（设负数、设 null）。属性把"读写"封装在方法里，能在赋值时验证、转换、触发事件。

公开字段还无法后续添加逻辑（会破坏 API 兼容），而属性内部加逻辑完全透明。所以**对外暴露的数据一律用属性**，这是 .NET 的铁律。

### 四、索引器 this[ ]

索引器让对象像数组一样用 \`[]\` 访问。本质是有参数的属性：

\`\`\`csharp
public object this[int index]
{
    get => ...;
    set => ...;
}
\`\`\`

例如自定义集合、字典封装类常用索引器。索引器可以重载（按 int / string 等不同 key）。

### 五、record 的主构造函数属性

record 用主构造函数声明的参数会自动生成只读 init 属性：

\`\`\`csharp
public record Point(int X, int Y);
// 等价于 public int X { get; init; } 等
\`\`\`

普通 class 在 C# 12 也能用主构造函数，但**不会**自动生成属性（要手写 \`=>\` 转发）。这是 record 与 class 在主构造函数上的关键差异。

### 六、backing field 模式

最常见的封装套路：

\`\`\`csharp
private string _name;          // 私有字段
public string Name             // 公开属性
{
    get => _name;
    set => _name = string.IsNullOrWhiteSpace(value)
        ? throw new ArgumentException()
        : value.Trim();
}
\`\`\`

字段名常用下划线开头（\`_name\`）与属性区分。

### 小结

字段分实例/静态/readonly/const 四类；属性是字段的"门面"，支持自动、init、required、计算、私有 set、索引器等多种形式。对外一律用属性，对内用字段存数据。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「字段与属性」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句演示：字段与属性
using System;

// 1. const 常量（编译期，隐式 static，通过类名访问）
Console.WriteLine($"税率：{Product.TaxRate}");

// 2. 普通对象 + required 必填属性（必须赋值，否则编译报错）
var p = new Product("鼠标", 88.0m) { Sku = "MS-001" };
Console.WriteLine(p.Summary);                     // 表达式属性

// 3. required + 多属性初始化
var p2 = new Product("键盘", 200m)
{
    Sku = "KB-001",                               // required 必须赋值
    Category = "外设"
};
Console.WriteLine($"{p2.Sku} / {p2.Category}");

// 4. init 只读属性：初始化后不能再改
var p3 = new Product("显示器", 1500m)
{
    Code = "MON-2024",                            // init 属性只能初始化时赋值
    Sku = "MON-001"
};
// p3.Code = "X";                                // ❌ 编译错误：init 后只读

// 5. 计算属性 + 私有 set
p2.ApplyDiscount(0.2m);                           // 通过方法间接修改私有 set 的 Discount
Console.WriteLine($"折后价：{p2.FinalPrice}");     // 计算属性动态算出

// 6. 静态字段：所有实例共享一份数据
Console.WriteLine($"已创建商品总数：{Product.TotalProducts}");

// 7. 索引器演示：让对象像数组一样访问
var store = new ProductStore();
store[0] = p;
store[1] = p2;
Console.WriteLine($"store[0] = {store[0]?.Name}");
Console.WriteLine($"store[1] = {store[1]?.Name}");
Console.WriteLine($"按 SKU 查找：{store["KB-001"]?.Name}");

// ============ 类型声明区域 ============

public class Product
{
    // const 常量：编译期替换，隐式 static
    public const double TaxRate = 0.13;

    // 静态字段：所有实例共享一份数据
    public static int TotalProducts;

    // readonly 只读字段：只能在声明时或构造函数里赋值
    public readonly DateTime CreatedAt;

    // 私有 backing field
    private string _name;
    private decimal _price;

    // 自动属性 + 默认值
    public string Category { get; set; } = "未分类";

    // required 必填属性（C# 11）：调用方必须赋值
    public required string Sku { get; set; }

    // init 只读属性（C# 9）：仅初始化时可写
    public string Code { get; init; } = "";

    // 完整属性：带验证逻辑
    public string Name
    {
        get => _name;
        set => _name = string.IsNullOrWhiteSpace(value)
            ? throw new ArgumentException("名称不能为空")
            : value.Trim();
    }

    // 属性 + 私有 set：对外只读，对内可改
    public decimal Price
    {
        get => _price;
        private set                              // 外部不能直接 Price = ...
        {
            if (value < 0) throw new ArgumentException("价格不能为负");
            _price = value;
        }
    }

    // 折扣：私有 set，通过方法修改
    public decimal Discount { get; private set; }

    // 计算属性：动态算出来，不存数据
    public decimal FinalPrice => Price * (1 - Discount);

    // 表达式属性：单行 get 简写
    public string Summary => $"{Name} - ¥{Price}";

    // 构造函数
    public Product(string name, decimal price)
    {
        Name = name;                             // 走属性赋值（带验证）
        Price = price;                           // 走属性赋值
        CreatedAt = DateTime.Now;                // readonly 字段在构造里赋值
        TotalProducts++;                         // 静态字段 +1
    }

    // 修改 Discount 的方法（间接修改私有 set 的属性）
    public void ApplyDiscount(decimal d)
    {
        if (d < 0 || d > 1) throw new ArgumentException("折扣必须在 0-1 之间");
        Discount = d;
    }
}

// 索引器演示：让对象像数组一样访问
public class ProductStore
{
    private Product?[] _items = new Product?[10];   // 内部数组

    // int 索引器
    public Product? this[int index]
    {
        get
        {
            if (index < 0 || index >= _items.Length)
                throw new IndexOutOfRangeException();
            return _items[index];
        }
        set
        {
            if (index < 0 || index >= _items.Length)
                throw new IndexOutOfRangeException();
            _items[index] = value;
        }
    }

    // 索引器重载：按字符串 SKU 查找（只读）
    public Product? this[string sku]
        => Array.Find(_items, x => x is not null && x.Sku == sku);
}`,
    lang: 'cs',
  },
  {
    id: 'csharp4-ch20',
    group: '第三部分 面向对象',
    icon: '🔧',
    title: '方法详解',
    content: `## 第二十一章　方法详解

方法是类的"行为"。它是封装一段可复用逻辑的最基本单元。本章把 C# 方法的所有重要特性一次讲透。

### 一、方法声明与签名

方法声明包含：修饰符、返回类型、方法名、参数列表、方法体。

\`\`\`csharp
public int Add(int a, int b) => a + b;
\`\`\`

**方法签名** = 方法名 + 参数列表（数量、类型、顺序、修饰符）。返回类型和参数名不属于签名。重载就靠签名区分。

### 二、参数传递的四种方式

#### 1. 值传递（默认）

实参的值复制一份给形参，方法内修改不影响外部变量。值类型复制值，引用类型复制引用（指向同一对象，但改引用本身不影响外部）。

\`\`\`csharp
void Foo(int x) { x = 100; }   // 外部变量不变
\`\`\`

#### 2. ref 引用传递

实参必须先初始化，方法内可读可写，对形参的修改直接影响外部变量：

\`\`\`csharp
void Inc(ref int x) { x++; }
int n = 5; Inc(ref n);   // n == 6
\`\`\`

#### 3. out 输出参数

实参不必初始化，方法内**必须**赋值，常用于"多返回值"：

\`\`\`csharp
bool TryParse(string s, out int result) { ... }
\`\`\`

#### 4. in 只读引用传递

形参按引用传但只读，避免值类型大对象复制开销，又防止误改：

\`\`\`csharp
void Print(in BigStruct s) { ... }
\`\`\`

### 三、params 可变参数

\`params\` 让方法接收任意数量的同类型参数，编译器自动装箱成数组：

\`\`\`csharp
int Sum(params int[] nums) => nums.Sum();
Sum(1, 2, 3);        // OK
Sum();               // OK，空数组
Sum(new[] { 1, 2 }); // 也可以传数组
\`\`\`

\`params\` 必须是最后一个参数。

### 四、默认参数

参数可指定默认值，调用时可省略：

\`\`\`csharp
void Greet(string name, string greeting = "你好") { ... }
Greet("小明");                  // greeting 用默认值
Greet("小明", "Hello");         // 覆盖默认值
\`\`\`

注意：默认参数必须是编译期常量；有默认值的参数必须放在没默认值的之后。

### 五、命名参数

调用时可按参数名传值，不必按顺序：

\`\`\`csharp
Greet(greeting: "Hi", name: "Tom");
\`\`\`

常与默认参数搭配，跳过中间参数：

\`\`\`csharp
DoSomething(1, optional2: "x");
\`\`\`

### 六、方法重载

同名方法只要签名不同即可并存：

\`\`\`csharp
int Add(int a, int b) => a + b;
double Add(double a, double b) => a + b;
string Add(string a, string b) => a + b;
\`\`\`

编译器根据实参类型选最佳匹配。

### 七、ref 返回

方法可返回变量的引用，调用方修改会影响原变量：

\`\`\`csharp
ref int Find(int[] arr, int target) { ... return ref arr[i]; }
ref int x = ref Find(arr, 5); x = 99;
\`\`\`

适合高性能场景（避免大对象复制）。

### 八、局部函数

方法内部可以再定义一个函数，作用域仅限外层方法：

\`\`\`csharp
int Compute(int n)
{
    int Helper(int x) => x * 2;       // 局部函数
    return Helper(n) + 1;
}
\`\`\`

局部函数能访问外层局部变量（闭包），适合把辅助逻辑就近封装。

\`static\` 修饰的局部函数不能捕获外层变量，避免闭包带来的性能开销。

### 九、表达式方法

方法体只有一句 \`return\` 时可写成 \`=>\` 表达式：

\`\`\`csharp
public int Square(int x) => x * x;
\`\`\`

简洁且语义清晰，只读方法常用。

### 十、参数验证

C# 在方法开头检查参数合法性很常见：

\`\`\`csharp
public void SetAge(int age)
{
    if (age < 0) throw new ArgumentOutOfRangeException(nameof(age));
    _age = age;
}
\`\`\`

.NET 7+ 还可用 \`ArgumentNullException.ThrowIfNull\` 等 helper 简化。

### 十一、yield return（迭代器方法）

\`yield return\` 让方法变成迭代器，按需生成序列，懒计算：

\`\`\`csharp
IEnumerable<int> Evens(int max)
{
    for (int i = 0; i <= max; i += 2)
        yield return i;
}
\`\`\`

调用方每次 \`MoveNext\` 才执行一步，内存友好。

### 十二、async 方法简介

\`async\` 标记异步方法，\`await\` 等待异步操作完成：

\`\`\`csharp
async Task<string> GetDataAsync()
{
    var text = await File.ReadAllTextAsync("a.txt");
    return text.Trim();
}
\`\`\`

异步方法在后续章节会专门讲。

### 十三、扩展方法预览

扩展方法让你**不用改源码**就能给已有类型加方法：必须写在静态类里，第一个参数带 \`this\`。

\`\`\`csharp
static class StringExtras
{
    public static bool IsBlank(this string? s)
        => string.IsNullOrWhiteSpace(s);
}

Console.WriteLine("  ".IsBlank());  // True
\`\`\`

完整用法、对接口扩展、以及和 LINQ 的关系，见后面「密封类与扩展方法」一章。这里先混个脸熟：看到 \`this\` 参数就知道是扩展方法。

### 小结

方法签名看名字和参数；四种参数传递（值/ref/out/in）解决不同需求；params/默认参数/命名参数让调用更灵活；重载、ref 返回、局部函数、表达式方法、yield、async 是日常高频工具。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「方法详解」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句演示：方法详解
using System;
using System.Collections.Generic;
using System.Linq;

var demo = new MethodDemo();

// 1. 值传递：修改不影响外部
int x = 10;
demo.ByValue(x);
Console.WriteLine($"值传递后 x = {x}");            // 仍是 10

// 2. ref 引用传递：修改影响外部
int y = 10;
demo.ByRef(ref y);
Console.WriteLine($"ref 传递后 y = {y}");          // 变成 11

// 3. out 输出参数：方法内必须赋值
demo.TryParse("42", out int result);
Console.WriteLine($"out 解析结果 = {result}");

// 4. in 只读引用：传大对象不复制
var big = new BigStruct { Data = new int[100] };
demo.PrintBig(in big);

// 5. params 可变参数
Console.WriteLine($"Sum = {demo.Sum(1, 2, 3, 4, 5)}");

// 6. 默认参数
demo.Greet("小明");
demo.Greet("小明", "Hello");

// 7. 命名参数（可乱序）
demo.Greet(greeting: "Hi", name: "Tom");

// 8. 方法重载：编译器按实参类型选最佳匹配
Console.WriteLine(demo.Add(1, 2));                 // int 版本
Console.WriteLine(demo.Add(1.5, 2.5));             // double 版本
Console.WriteLine(demo.Add("a", "b"));             // string 版本

// 9. 表达式方法
Console.WriteLine($"平方 = {demo.Square(7)}");

// 10. ref 返回：返回数组元素的引用，可直接改原数组
int[] arr = { 1, 2, 3, 4, 5 };
ref int r = ref demo.FindRef(arr, 3);
r = 99;
Console.WriteLine($"arr = {string.Join(", ", arr)}");

// 11. 局部函数
Console.WriteLine($"Compute(5) = {demo.UseLocalFunction(5)}");

// 12. yield return 迭代器：按需生成偶数
foreach (var n in demo.Evens(10))
    Console.Write(n + " ");
Console.WriteLine();

// ============ 类型声明区域 ============

public class MethodDemo
{
    // 1. 值传递：复制一份
    public void ByValue(int x) => x = 100;          // 修改的是副本

    // 2. ref 引用传递：直接操作外部变量
    public void ByRef(ref int y) => y++;            // 影响外部

    // 3. out 输出参数：方法内必须赋值
    public bool TryParse(string s, out int result)
    {
        if (int.TryParse(s, out result))            // 内部 TryParse 已赋值
            return true;
        result = 0;                                  // 失败也必须赋值
        return false;
    }

    // 4. in 只读引用：避免大对象复制
    public void PrintBig(in BigStruct s)
    {
        // s.Data = null;                            // ❌ in 不允许修改
        Console.WriteLine($"BigStruct 长度 = {s.Data.Length}");
    }

    // 5. params 可变参数：必须是最后一个参数
    public int Sum(params int[] nums) => nums.Sum();

    // 6. 默认参数
    public void Greet(string name, string greeting = "你好")
        => Console.WriteLine($"{greeting}, {name}!");

    // 7. 方法重载：签名不同即可
    public int Add(int a, int b) => a + b;
    public double Add(double a, double b) => a + b;
    public string Add(string a, string b) => a + b;

    // 8. 表达式方法（单行 => 简写）
    public int Square(int x) => x * x;

    // 9. ref 返回：返回变量的引用
    public ref int FindRef(int[] arr, int target)
    {
        for (int i = 0; i < arr.Length; i++)
            if (arr[i] == target)
                return ref arr[i];                  // 返回数组元素的引用
        throw new InvalidOperationException("not found");
    }

    // 10. 局部函数：方法内部定义的函数
    public int UseLocalFunction(int n)
    {
        int Helper(int x) => x * 2;                 // 普通局部函数：可捕获外部变量
        static int StaticHelper(int x) => x + 1;    // 静态局部函数：不能捕获外部
        return Helper(n) + StaticHelper(n);
    }

    // 11. yield return 迭代器方法：按需生成序列
    public IEnumerable<int> Evens(int max)
    {
        for (int i = 0; i <= max; i += 2)
            yield return i;                         // 每次 MoveNext 才执行下一步
    }
}

// 用于演示 in 参数的大结构体
public struct BigStruct
{
    public int[] Data;
}`,
    lang: 'cs',
  },
  {
    id: 'csharp4-ch21',
    group: '第三部分 面向对象',
    icon: '🏗️',
    title: '构造函数与析构',
    content: `## 第二十二章　构造函数与析构

构造函数（constructor）是对象出生时执行的"初始化仪式"。析构（destructor / finalizer）是对象死亡时的"善后处理"。本章把 C# 的全部构造形式讲清楚，特别是 C# 12 引入的主构造函数。

### 一、实例构造函数

构造函数与类同名、无返回类型，在 \`new\` 时自动调用：

\`\`\`csharp
public class Point
{
    public int X, Y;
    public Point(int x, int y) { X = x; Y = y; }    // 构造函数
}
\`\`\`

构造函数的任务：把字段初始化到合法状态。如果没写任何构造函数，编译器会自动生成一个公开无参的"默认构造函数"。

### 二、默认构造函数

只要手写了任何一个构造函数，编译器就不再自动生成无参构造函数。需要无参构造必须显式声明：

\`\`\`csharp
public class Point
{
    public Point() { }                  // 显式声明
    public Point(int x, int y) { ... }
}
\`\`\`

### 三、私有构造函数

\`private\` 构造函数让外部无法 \`new\`。常见于：
- 单例模式：只暴露一个静态 Instance
- 工具类：只有静态方法，不应实例化
- 强制走工厂方法创建

\`\`\`csharp
public class Config
{
    private Config() { }                // 外部不能 new
    public static Config Load() => new Config();   // 内部可以
}
\`\`\`

### 四、静态构造函数

\`static\` 修饰，无参数、无访问修饰符。在类第一次被使用时自动调用一次（且只调一次），用于初始化静态字段：

\`\`\`csharp
public class App
{
    static App() { Console.WriteLine("类首次加载"); }
}
\`\`\`

执行时机由运行时决定，但保证在使用任何静态成员或创建实例之前。

### 五、构造函数重载

可以定义多个签名不同的构造函数：

\`\`\`csharp
public Point() : this(0, 0) { }
public Point(int x, int y) { X = x; Y = y; }
\`\`\`

### 六、构造函数链 : this(...)

\`: this(...)\` 让一个构造函数先调用另一个本类构造函数，避免重复初始化代码：

\`\`\`csharp
public Point() : this(0, 0) { }              // 先调 Point(0,0)
public Point(int x) : this(x, 0) { }         // 先调 Point(x,0)
public Point(int x, int y) { X = x; Y = y; } // 真正干活
\`\`\`

\`: base(...)\` 则是调用父类构造函数（继承章节详细讲）。

### 七、对象初始化器 vs 构造函数

对象初始化器 \`{ Prop = value }\` 实际是"先调用构造函数，再赋值公开属性"。两者经常配合：

\`\`\`csharp
var p = new Point(1, 2) { Tag = "origin" };
\`\`\`

优势：不需要为每个属性组合都写一个构造函数。

### 八、C# 12 主构造函数

C# 12 引入主构造函数：把构造函数参数直接写在类名后面的括号里：

\`\`\`csharp
public class Student(string name, int age)
{
    public string Name => name;            // 在方法/属性里直接用
    public int Age => age;
}
\`\`\`

要点：
1. 主构造函数参数**默认不会**自动变成属性（与 record 不同！）
2. 参数可在任意方法、属性中使用，编译器把它们捕获为字段
3. 仍可额外写普通构造函数，但必须用 \`: this(...)\` 链到主构造函数
4. 想暴露为属性需手写 \`=>\` 转发

### 九、record 的主构造函数

record 类型用主构造函数声明的参数会自动生成 \`init\` 只读属性：

\`\`\`csharp
public record Point(int X, int Y);
// 等价于：public int X { get; init; } public int Y { get; init; }
\`\`\`

这是 record 与普通 class 在主构造函数上的关键差异。

### 十、析构函数 ~

C# 的析构函数（也叫 finalizer）写法：

\`\`\`csharp
public class Resource
{
    ~Resource() { /* 释放非托管资源 */ }
}
\`\`\`

要点：
- 由 GC 在回收对象前调用，时机不确定
- 不能手动调用、不能带参数、不能有访问修饰符
- **不推荐使用**：会让对象"复活"，延迟 GC，难以预测

### 十一、finalizer 简介

析构函数编译后其实是 \`Finalize\` 方法。GC 回收对象前会调用它。由于 .NET GC 不保证时机，且 finalizer 会让对象进入 freachable 队列（多活一次 GC），通常**避免手写 finalizer**。

### 十二、IDisposable 预览

析构函数靠不住，持有文件句柄、数据库连接、socket 时要自己实现 \`IDisposable\`，让调用方主动释放：

\`\`\`csharp
public sealed class FileWrapper : IDisposable
{
    private FileStream? _fs;
    public FileWrapper(string path) => _fs = File.OpenRead(path);
    public void Dispose()
    {
        _fs?.Dispose();
        _fs = null;
        GC.SuppressFinalize(this);
    }
}

using var f = new FileWrapper("a.txt");  // 离开作用域自动 Dispose，异常也会走
\`\`\`

完整 Dispose 模式、Finalizer、\`SafeHandle\`、\`IAsyncDisposable\` 见后面「IDisposable 与 Finalizer」一章。

### 十三、构造顺序

创建对象时执行顺序：
1. 派生类字段初始化为默认值（0/null）
2. 基类构造函数执行（先基类后派生）
3. 派生类字段初始化器执行
4. 派生类构造函数体执行

继承场景的具体顺序在继承章节再展开。

### 小结

构造函数分实例/私有/静态/主构造函数；\`: this(...)\` 链避免重复；C# 12 主构造函数是简化模板代码的利器，但 class 不自动生成属性；析构函数不推荐使用，非托管资源用 IDisposable。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「构造函数与析构」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句演示：构造函数与析构
using System;

// 1. 默认构造函数 + 重载 + 构造链
var a = new Point();                       // 无参，链到 Point(0,0)
var b = new Point(3, 4);                   // 直接调 Point(int,int)
var c = new Point(5);                      // 单参，链到 Point(5,0)
Console.WriteLine($"a={a}, b={b}, c={c}");

// 2. 对象初始化器：构造之后再赋值公开属性
var d = new Point(1, 1) { Tag = "origin" };
Console.WriteLine($"d={d}, Tag={d.Tag}");

// 3. 私有构造函数 + 静态工厂方法（首次访问 Config 时静态构造自动触发）
var cfg = Config.Load();
Console.WriteLine($"配置名：{cfg.Name}, 启动时刻：{Config.StartedAt:HH:mm:ss}");

// 4. C# 12 主构造函数：参数写在类名后
var stu = new StudentV12("小明", 18);
stu.Print();
// 主构造函数参数不自动成属性，需要手写属性转发
Console.WriteLine($"Name={stu.Name}, Age={stu.Age}");

// 5. 额外构造函数链到主构造函数
var stu2 = new StudentV12("小红");
Console.WriteLine($"Name={stu2.Name}, Age={stu2.Age}");

// 6. record 主构造函数：参数自动生成 init 只读属性
var p = new PointRec(10, 20);
Console.WriteLine($"record: X={p.X}, Y={p.Y}");
// p.X = 99;                              // ❌ init 后只读

// ============ 类型声明区域 ============

public class Point
{
    public int X { get; set; }
    public int Y { get; set; }
    public string? Tag { get; set; }      // 可空字符串

    // 默认构造函数：链到带参构造（避免重复初始化代码）
    public Point() : this(0, 0)
    {
        Console.WriteLine("[Point] 无参构造");
    }

    // 单参构造：链到双参构造
    public Point(int x) : this(x, 0)
    {
        Console.WriteLine($"[Point] 单参构造 ({x})");
    }

    // 双参构造：真正干活
    public Point(int x, int y)
    {
        X = x; Y = y;
        Console.WriteLine($"[Point] 双参构造 ({x},{y})");
    }

    public override string ToString() => $"({X},{Y})";
}

public class Config
{
    public string Name { get; }

    // 静态字段
    public static DateTime StartedAt;

    // 静态构造函数：类首次被使用时自动调用一次（无参、无修饰符）
    static Config()
    {
        StartedAt = DateTime.Now;
        Console.WriteLine($"[Config] 静态构造触发");
    }

    // 私有构造函数：外部无法 new
    private Config(string name)
    {
        Name = name;
        Console.WriteLine("[Config] 私有实例构造");
    }

    // 静态工厂方法：内部可调用私有构造
    public static Config Load() => new Config("default");
}

// C# 12 主构造函数：参数写在类名后面的括号里
public class StudentV12(string name, int age)
{
    // 主构造函数参数不会自动成属性，需手写转发
    public string Name => name;           // 只读属性转发
    public int Age => age;                // 只读属性转发

    // 可在任意方法中使用主构造函数参数
    public void Print() => Console.WriteLine($"学生：{name}，{age} 岁");

    // 可额外定义普通构造函数，但必须用 : this(...) 链到主构造函数
    public StudentV12(string name) : this(name, 0) { }
}

// record 的主构造函数：参数自动生成 init 只读属性
public record PointRec(int X, int Y);`,
    lang: 'cs',
  },
  {
    id: 'csharp4-ch22',
    group: '第三部分 面向对象',
    icon: '⚡',
    title: '静态类与静态成员',
    content: `## 第二十三章　静态类与静态成员

\`static\` 是 C# 里最容易被忽视却极为重要的修饰符。它决定"成员属于类本身还是属于对象"。本章彻底搞懂 static。

### 一、static 的本质

不用 \`static\` 的成员叫**实例成员**——属于某个具体对象，必须先 \`new\` 出对象才能访问。

加 \`static\` 的成员叫**静态成员**——属于类本身，不需要任何对象就能访问，所有对象共享同一份。

打个比方：实例字段是"每个学生自己的成绩"，静态字段是"全校共用的校名"。

### 二、静态字段

\`\`\`csharp
public class Counter
{
    public static int Count = 0;     // 所有实例共享
}
\`\`\`

访问方式：\`Counter.Count\`（不需要 \`new\`）。

典型用途：全局计数器、缓存、配置开关。

### 三、静态属性

\`\`\`csharp
public class Counter
{
    private static int _total;
    public static int Total
    {
        get => _total;
        private set => _total = value;
    }
}
\`\`\`

静态属性只能访问静态字段，不能碰实例成员。

### 四、静态方法

\`\`\`csharp
public static int Add(int a, int b) => a + b;
\`\`\`

调用：\`Math.Add(1, 2)\`。

静态方法里**不能使用 this**，也**不能访问实例成员**——因为没有"当前对象"概念。常用作工具方法（如 \`Math.Max\`、\`string.IsNullOrEmpty\`）。

### 五、静态构造函数

\`static\` 修饰的构造函数，无参、无访问修饰符，类首次被使用时自动调用一次：

\`\`\`csharp
static MyClass()
{
    // 初始化静态字段
}
\`\`\`

适合做：加载配置文件、初始化静态字典、注册事件。

### 六、静态类

\`static class\` 修饰的类**不能被实例化**（编译器禁止 \`new\`），且所有成员必须是静态的。

\`\`\`csharp
public static class StringHelper
{
    public static string Reverse(string s) => new string(s.Reverse().ToArray());
}
\`\`\`

典型例子：\`System.Math\`、\`System.Console\`、\`System.IO.File\`。这些都是工具类，本身没有"状态"，不该有实例。

### 七、常量与静态只读

\`const\` 是编译期常量，隐式 static。\`static readonly\` 是运行时常量，运行时初始化后不可变：

\`\`\`csharp
public const double Pi = 3.14159;             // 编译期替换
public static readonly DateTime AppStart = DateTime.Now;  // 运行时初始化
\`\`\`

跨程序集时优先 \`static readonly\`，避免 const 改值后调用方未重编导致的"幽灵 bug"。

### 八、静态局部函数

局部函数加 \`static\` 修饰后不能捕获外部变量，避免闭包开销：

\`\`\`csharp
int Compute(int x)
{
    static int Square(int n) => n * n;    // 不能用 x
    return Square(x);
}
\`\`\`

性能敏感场景下推荐加 \`static\`。

### 九、单例模式

静态成员的经典应用：单例（保证全局只有一个实例）：

\`\`\`csharp
public sealed class Singleton
{
    private static readonly Singleton _instance = new();
    public static Singleton Instance => _instance;
    private Singleton() { }              // 私有构造：禁止外部 new
}
\`\`\`

要点：
- \`sealed\` 防止子类创建第二个实例
- \`private\` 构造禁止 \`new\`
- \`static readonly\` 字段 + 静态初始化 = 线程安全懒加载

C# 还可用 \`Lazy<T>\` 实现更严格的延迟加载。

### 十、扩展方法

扩展方法让你"为别人写的类型"添加方法，语法上像在调用该类型自己的方法。规则：

1. 必须定义在**静态类**里
2. 必须是**静态方法**
3. 第一个参数前加 \`this\`，表示要扩展的类型

\`\`\`csharp
public static class StringExt
{
    public static int WordCount(this string s)
        => s.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
}

// 使用：
"hello world foo".WordCount();   // 3
\`\`\`

要点：
- 扩展方法不能访问私有成员
- 命名空间必须 using 进来才生效
- 同签名扩展方法和实例方法冲突时，实例方法优先

### 十一、Math 类示例

\`System.Math\` 是静态类的教科书级示范：

\`\`\`csharp
Math.Max(3, 5);
Math.PI;
Math.Sqrt(2);
Math.Round(3.14159, 2);
\`\`\`

它本身不能 \`new\`，所有方法都是静态工具方法。

### 十二、using static

\`using static\` 直接把某类型的静态成员导入当前文件，调用时不用写类名：

\`\`\`csharp
using static System.Math;
var x = Sqrt(2);    // 不用 Math.Sqrt
\`\`\`

适合数学公式、单元测试断言等需要频繁调用静态方法的场景，但过度使用会降低可读性。

### 小结

\`static\` 让成员属于类本身；静态类不能实例化，全是静态成员；单例模式是静态的经典应用；扩展方法必须在静态类里、第一个参数带 \`this\`；\`using static\` 可以省略类名前缀。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「静态类与静态成员」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句演示：静态类与静态成员
using System;
using static System.Math;                  // using static：直接用 Sqrt、PI 等

// 1. 静态字段：通过类名访问，不需要对象
Counter.Count = 100;
Console.WriteLine($"Counter.Count = {Counter.Count}");
Console.WriteLine($"Counter.DoubledCount = {Counter.DoubledCount}");

// 2. 静态方法 + 静态构造函数（首次访问 MathHelper 时自动触发）
Console.WriteLine($"5! = {MathHelper.Factorial(5)}");

// 3. 静态类：不能 new，只能用静态成员
// var x = new MathHelper();                // ❌ 编译错误：静态类无法实例化
Console.WriteLine($"IsPrime(7) = {MathHelper.IsPrime(7)}");
Console.WriteLine($"E = {MathHelper.E}");

// 4. using static：直接调用 Math 的静态成员，省略类名前缀
var r = Sqrt(2);                            // 等价于 Math.Sqrt(2)
var p = PI;                                 // 等价于 Math.PI
Console.WriteLine($"√2 = {r:F4}, π = {p:F4}");

// 5. 单例模式：全局唯一实例
var s1 = Singleton.Instance;
var s2 = Singleton.Instance;
Console.WriteLine($"s1 == s2 ? {ReferenceEquals(s1, s2)}");  // True
s1.Value = 42;
Console.WriteLine($"s2.Value = {s2.Value}");   // 42（同一个实例）

// 6. 扩展方法：像调用实例方法一样使用
Console.WriteLine($"单词数 = {"hello world foo".WordCount()}");   // 3
Console.WriteLine($"123 罗马数字 = {123.ToRoman()}");              // CXXIII

// ============ 类型声明区域 ============

public class Counter
{
    // 静态字段：所有实例共享
    public static int Count;

    // 静态属性：只能访问静态字段
    public static int DoubledCount => Count * 2;
}

// 静态类：不能实例化，全部成员必须静态
public static class MathHelper
{
    // const 常量（隐式 static）
    public const double E = 2.71828;

    // static readonly：运行时常量
    public static readonly DateTime CompiledAt = DateTime.Now;

    // 静态构造函数：首次访问类时自动调用一次（无参、无修饰符）
    static MathHelper()
    {
        Console.WriteLine($"[MathHelper] 静态构造触发，编译时刻 {CompiledAt:HH:mm:ss}");
    }

    // 静态方法：递归阶乘
    public static int Factorial(int n)
    {
        if (n < 0) throw new ArgumentException("负数无阶乘");
        return n <= 1 ? 1 : n * Factorial(n - 1);
    }

    // 静态方法：判断素数
    public static bool IsPrime(int n)
    {
        if (n < 2) return false;
        for (int i = 2; i * i <= n; i++)
            if (n % i == 0) return false;
        return true;
    }
}

// 单例模式：sealed + private ctor + static Instance
public sealed class Singleton
{
    // 私有静态字段：唯一实例（运行时保证线程安全懒加载）
    private static readonly Singleton _instance = new Singleton();

    // 公开静态属性：暴露唯一实例
    public static Singleton Instance => _instance;

    // 实例字段
    public int Value { get; set; }

    // 私有构造函数：禁止外部 new
    private Singleton()
    {
        Console.WriteLine("[Singleton] 唯一实例已创建");
    }
}

// 扩展方法所在的静态类
public static class StringExtensions
{
    // 扩展方法：第一个参数加 this，表示扩展 string 类型
    public static int WordCount(this string s)
        => s.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
}

// 扩展方法：扩展 int 类型，递归调用自己
public static class IntExtensions
{
    public static string ToRoman(this int number) => number switch
    {
        >= 1000 => "M" + (number - 1000).ToRoman(),
        >= 900 => "CM" + (number - 900).ToRoman(),
        >= 500 => "D" + (number - 500).ToRoman(),
        >= 400 => "CD" + (number - 400).ToRoman(),
        >= 100 => "C" + (number - 100).ToRoman(),
        >= 90 => "XC" + (number - 90).ToRoman(),
        >= 50 => "L" + (number - 50).ToRoman(),
        >= 40 => "XL" + (number - 40).ToRoman(),
        >= 10 => "X" + (number - 10).ToRoman(),
        >= 9 => "IX" + (number - 9).ToRoman(),
        >= 5 => "V" + (number - 5).ToRoman(),
        >= 4 => "IV" + (number - 4).ToRoman(),
        >= 1 => "I" + (number - 1).ToRoman(),
        _ => ""
    };
}`,
    lang: 'cs',
  },
];

export { chapters };
