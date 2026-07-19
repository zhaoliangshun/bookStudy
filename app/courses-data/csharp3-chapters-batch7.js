// =============================================================
// C# 从入门到精通大全（终极版）—— 第7批章节
// 第七部分 值类型与引用类型（共 7 章）
// -------------------------------------------------------------
// 本批包含 7 章：
//   csharp3-ch31 : 第三十一章 值类型与引用类型深度解析
//   csharp3-ch32 : 第三十二章 枚举
//   csharp3-ch33 : 第三十三章 结构体
//   csharp3-ch34 : 第三十四章 记录 (record)
//   csharp3-ch35 : 第三十五章 可空值类型
//   csharp3-ch36 : 第三十六章 可空引用类型
//   csharp3-ch37 : 第三十七章 元组与解构
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第三十一章：值类型与引用类型深度解析
  // ============================================================
  {
    id: 'csharp3-ch31',
    group: '第七部分 值类型与引用类型',
    icon: '🧱',
    title: '第三十一章 值类型与引用类型深度解析',
    content: `## 第三十一章　值类型与引用类型深度解析

理解值类型和引用类型的区别是掌握 C# 内存模型的关键。错误的赋值和传递行为是日常开发中常见的 bug 来源。

### 一、栈 vs 堆：内存分配基础

- **值类型**：通常分配在栈上（方法调用时压栈，返回时弹出），结构体直接包含数据。
- **引用类型**：对象分配在托管堆上，变量存储的是指向堆内存的引用（地址）。

### 二、值类型清单

| 类型类别 | 示例 |
| --- | --- |
| 简单类型 | \`int\`, \`long\`, \`float\`, \`double\`, \`decimal\`, \`bool\`, \`char\` |
| 结构体 | \`struct\` 定义的所有类型（包括 \`DateTime\`, \`TimeSpan\`, \`Guid\`） |
| 枚举 | \`enum\` 定义的所有类型 |
| 可空值类型 | \`int?\`, \`bool?\` 等 |
| 元组 | \`(int, string)\` ValueTuple |
| 记录结构体 | \`record struct\` |

### 三、引用类型清单

| 类型类别 | 示例 |
| --- | --- |
| 类 | \`class\` 定义的所有类型 |
| 接口 | \`interface\` 定义的所有类型 |
| 委托 | \`delegate\` 定义的所有类型 |
| 数组 | \`int[]\`, \`string[]\` 等 |
| 字符串 | \`string\`（特殊：不可变但行为像值类型） |
| 记录类 | \`record\`（非 \`record struct\`） |
| \`object\` | 所有类型的基类 |
| \`dynamic\` | 动态类型 |

### 四、赋值行为差异

这是最容易出错的差异——值类型赋值复制数据，引用类型赋值复制引用：

\`\`\`csharp
// === 值类型赋值：复制整个数据 ===
int a = 10;
int b = a;       // 将 a 的值复制一份给 b
b = 20;          // 修改 b 不影响 a
Console.WriteLine($"a = {a}, b = {b}");  // a = 10, b = 20（独立）

// === 引用类型赋值：复制引用（指向同一对象）===
int[] arr1 = { 1, 2, 3 };
int[] arr2 = arr1;  // arr2 指向与 arr1 相同的数组对象
arr2[0] = 999;      // 修改 arr2[0] 会影响 arr1
Console.WriteLine($"arr1[0] = {arr1[0]}, arr2[0] = {arr2[0]}");  // 都是 999

// === 结构体赋值：完整复制 ===
struct Point
{
    public int X;
    public int Y;
    public Point(int x, int y) { X = x; Y = y; }
}

Point p1 = new Point(10, 20);
Point p2 = p1;     // 复制整个结构体数据
p2.X = 999;        // 修改 p2 不影响 p1
Console.WriteLine($"p1.X = {p1.X}, p2.X = {p2.X}");  // p1.X = 10, p2.X = 999

// === 类赋值：复制引用 ===
class PointClass
{
    public int X;
    public int Y;
    public PointClass(int x, int y) { X = x; Y = y; }
}

PointClass pc1 = new PointClass(10, 20);
PointClass pc2 = pc1;  // pc2 指向同一对象
pc2.X = 999;           // 修改 pc2 会影响 pc1
Console.WriteLine($"pc1.X = {pc1.X}, pc2.X = {pc2.X}");  // 都是 999
\`\`\`

### 五、方法参数传递行为

\`\`\`csharp
// === 值类型默认：按值传递（复制） ===
void ModifyInt(int x)
{
    x = 999;  // 修改的是局部副本，不影响外部
    Console.WriteLine($"方法内 x = {x}");
}

int number = 42;
ModifyInt(number);
Console.WriteLine($"方法外 number = {number}");  // 仍然是 42

// === 引用类型默认：按值传递引用 ===
void ModifyArray(int[] arr)
{
    arr[0] = 999;  // 可以通过引用修改对象内容
    // arr = new int[] { 1, 2, 3 };  // 但修改引用本身不影响外部
}

int[] nums = { 10, 20, 30 };
ModifyArray(nums);
Console.WriteLine($"nums[0] = {nums[0]}");  // 999（内容被修改了）

// === ref 关键字：按引用传递值类型 ===
void ModifyByRef(ref int x)
{
    x = 999;  // 直接修改调用者的变量
    Console.WriteLine($"ref方法内 x = {x}");
}

int value = 42;
ModifyByRef(ref value);
Console.WriteLine($"ref方法外 value = {value}");  // 999（被修改了）

// === ref 关键字：按引用传递引用类型 ===
void ReplaceArray(ref int[] arr)
{
    arr = new int[] { 100, 200, 300 };  // 替换整个数组引用
}

int[] data = { 1, 2, 3 };
ReplaceArray(ref data);
Console.WriteLine($"data 现在是新数组：{string.Join(", ", data)}");  // 100, 200, 300
\`\`\`

### 六、装箱与拆箱（Boxing & Unboxing）

装箱是将值类型转为 \`object\` 的过程，在堆上分配内存。拆箱是反向操作：

\`\`\`csharp
// === 装箱：值类型 → object（堆分配） ===
int number = 42;
object boxed = number;  // 装箱：在堆上创建一个包含 42 的对象
Console.WriteLine($"装箱后：{boxed}");

// === 拆箱：object → 值类型（类型必须完全匹配） ===
int unboxed = (int)boxed;  // 拆箱：从堆上对象中取出值
Console.WriteLine($"拆箱后：{unboxed}");

// === 装箱的性能影响 ===
// 不要这样做！每次装箱都分配堆内存
object[] items = new object[1000];
for (int i = 0; i < 1000; i++)
{
    items[i] = i;  // 每次循环都装箱一次——1000 次堆分配！
}

// 正确做法：使用泛型集合避免装箱
List<int> list = new List<int>();
for (int i = 0; i < 1000; i++)
{
    list.Add(i);  // 没有装箱！List<int> 直接存储 int
}

// === 常见的隐式装箱场景 ===
// 1. 字符串拼接（非字符串值类型）
int age = 25;
string s = "年龄：" + age;  // age 被装箱为 object 再调用 ToString()

// 2. 将值类型传给接受 object 的方法
void PrintObject(object obj) => Console.WriteLine(obj);
PrintObject(42);  // 装箱

// 3. 将值类型放入非泛型集合
ArrayList arrayList = new ArrayList();
arrayList.Add(42);  // 装箱
\`\`\`

### 七、何时选择值类型 vs 引用类型

| 场景 | 推荐类型 | 原因 |
| --- | --- | --- |
| 小数据（< 16 字节） | 值类型（struct） | 栈分配、无 GC 压力 |
| 不可变数据 | 值类型（struct/record struct） | 复制是安全的 |
| 逻辑上像"值" | 值类型（struct） | 如 Point、DateTime、Complex |
| 需要继承 | 引用类型（class） | 值类型不能继承 |
| 大数据（> 16 字节） | 引用类型（class） | 避免频繁复制 |
| 需要共享状态 | 引用类型（class） | 修改一处影响所有引用 |
| 需要 null 语义 | 引用类型（class） | 引用类型天然可为 null |

### 八、string 的特殊性

\`\`\`csharp
// string 是引用类型，但行为像值类型（不可变性）
string s1 = "Hello";
string s2 = s1;      // s2 指向同一字符串对象
s1 = "World";        // s1 指向新字符串，s2 不变
Console.WriteLine($"s1 = {s1}, s2 = {s2}");  // s1 = World, s2 = Hello

// 原因：string 是不可变的——每次修改都创建新字符串
// 这是字符串驻留（interning）和线程安全的基础
\`\`\`

### 九、小结

- ⭐ 值类型复制数据，赋值时创建独立副本；引用类型复制引用，指向同一对象。
- ⭐ 默认参数传递是按值传递：值类型复制数据，引用类型复制引用。
- ⭐ 用 \`ref\` 关键字可以按引用传递，直接修改调用者变量。
- ⭐ 装箱将值类型转为 object（堆分配），有性能开销，尽量避免。
- ⭐ 小数据、不可变数据用 struct；需要继承、共享状态用 class。`,
  },

  // ============================================================
  // 第三十二章：枚举
  // ============================================================
  {
    id: 'csharp3-ch32',
    group: '第七部分 值类型与引用类型',
    icon: '🏷️',
    title: '第三十二章 枚举',
    content: `## 第三十二章　枚举

枚举（enum）是一种值类型，用于定义一组命名常量。它让代码更具可读性——用 \`DayOfWeek.Monday\` 代替魔法数字 \`1\`。

### 一、枚举定义

枚举是值类型，底层默认是 \`int\`，也可以指定其他整数类型：

\`\`\`csharp
// 基础枚举定义：每个成员默认从 0 开始递增
enum OrderStatus
{
    Pending,    // 0：待处理
    Processing, // 1：处理中
    Shipped,    // 2：已发货
    Delivered,  // 3：已送达
    Cancelled   // 4：已取消
}

// 使用枚举：提高代码可读性
OrderStatus status = OrderStatus.Processing;

// 比较枚举值
if (status == OrderStatus.Processing)
    Console.WriteLine("订单正在处理中");

// 枚举转整数
int statusCode = (int)status;  // 显式转换为 int
Console.WriteLine($"状态码：{statusCode}");  // 1

// 枚举转字符串
string statusText = status.ToString();
Console.WriteLine($"状态文本：{statusText}");  // Processing
\`\`\`

### 二、枚举的底层类型与显式赋值

\`\`\`csharp
// 指定底层类型：可以节省内存
enum ByteEnum : byte  // 底层类型为 byte（0-255）
{
    Low = 0,
    Medium = 128,
    High = 255
}

// 显式赋值：为枚举成员指定具体值
enum HttpStatusCode
{
    OK = 200,              // 成功
    Created = 201,         // 已创建
    BadRequest = 400,      // 错误请求
    Unauthorized = 401,    // 未授权
    NotFound = 404,        // 未找到
    InternalServerError = 500  // 服务器内部错误
}

// 部分赋值：未指定的成员自动递增
enum LogLevel
{
    Trace = 0,    // 0
    Debug = 1,    // 1
    Info = 10,    // 10
    Warning,      // 11（自动递增）
    Error = 20,   // 20
    Fatal         // 21（自动递增）
}

Console.WriteLine($"Warning = {(int)LogLevel.Warning}");  // 11
Console.WriteLine($"Fatal = {(int)LogLevel.Fatal}");      // 21

// 使用枚举作为方法参数
void Log(LogLevel level, string message)
{
    Console.WriteLine($"[{level}] {message}");
}

Log(LogLevel.Error, "数据库连接失败");
Log(LogLevel.Info, "系统启动成功");
\`\`\`

### 三、Flags 特性与位标志枚举

\`\`\`csharp
// [Flags] 特性：允许枚举值进行位运算组合
[Flags]
enum FileAccess
{
    None = 0,       // 无权限
    Read = 1,       // 读（二进制：0001）
    Write = 2,      // 写（二进制：0010）
    Execute = 4,    // 执行（二进制：0100）
    Delete = 8,     // 删除（二进制：1000）

    // 常见组合
    ReadWrite = Read | Write,           // 读写（0011 = 3）
    All = Read | Write | Execute | Delete  // 全部（1111 = 15）
}

// 组合多个权限：使用 | 运算符
FileAccess permissions = FileAccess.Read | FileAccess.Write;
Console.WriteLine($"权限值：{permissions}");  // Read, Write

// 检查是否包含某个权限：使用 HasFlag 或 & 运算符
bool canRead = permissions.HasFlag(FileAccess.Read);
bool canExecute = (permissions & FileAccess.Execute) == FileAccess.Execute;
Console.WriteLine($"可读：{canRead}");       // True
Console.WriteLine($"可执行：{canExecute}");   // False

// 添加权限：使用 | 运算符
permissions |= FileAccess.Execute;
Console.WriteLine($"添加执行权限后：{permissions}");  // Read, Write, Execute

// 移除权限：使用 & ~ 运算符
permissions &= ~FileAccess.Write;
Console.WriteLine($"移除写权限后：{permissions}");  // Read, Execute

// 切换权限：使用 ^ 运算符
permissions ^= FileAccess.Delete;
Console.WriteLine($"切换删除权限后：{permissions}");  // Read, Execute, Delete
\`\`\`

### 四、枚举与字符串转换

\`\`\`csharp
enum Color
{
    Red,
    Green,
    Blue,
    Yellow
}

// === 字符串 → 枚举 ===
// 方法1：Enum.Parse（可能抛出异常）
Color color1 = (Color)Enum.Parse(typeof(Color), "Green");
Console.WriteLine($"Parse 结果：{color1}");

// 方法2：Enum.TryParse（推荐，不会抛出异常）
if (Enum.TryParse<Color>("Blue", out Color color2))
{
    Console.WriteLine($"TryParse 成功：{color2}");
}

// 不区分大小写
if (Enum.TryParse("RED", ignoreCase: true, out Color color3))
{
    Console.WriteLine($"忽略大小写：{color3}");  // Red
}

// 解析无效值
if (!Enum.TryParse<Color>("Purple", out Color color4))
{
    Console.WriteLine("无效的枚举值");  // 会输出这条
}

// === 枚举 → 字符串 ===
Console.WriteLine(Color.Blue.ToString());       // Blue
Console.WriteLine(Color.Blue.ToString("G"));    // Blue（通用格式）
Console.WriteLine(((int)Color.Blue).ToString());// 2（数值）
\`\`\`

### 五、Enum.GetNames 与 Enum.GetValues

\`\`\`csharp
// 遍历所有枚举成员
enum Season
{
    Spring = 1,
    Summer = 2,
    Autumn = 3,
    Winter = 4
}

// 获取所有名称
Console.WriteLine("季节名称：");
foreach (string name in Enum.GetNames<Season>())
{
    Console.WriteLine($"  {name}");
}

// 获取所有值
Console.WriteLine("\\n季节值：");
foreach (Season season in Enum.GetValues<Season>())
{
    Console.WriteLine($"  {season} = {(int)season}");
}

// 获取枚举定义的类型
Type enumType = typeof(Season);
Console.WriteLine($"\\n底层类型：{Enum.GetUnderlyingType(enumType)}");  // System.Int32

// 检查值是否定义
bool isDefined = Enum.IsDefined(typeof(Season), 3);
Console.WriteLine($"值 3 是否定义：{isDefined}");  // True（Autumn = 3）

bool isDefined2 = Enum.IsDefined(typeof(Season), 99);
Console.WriteLine($"值 99 是否定义：{isDefined2}");  // False
\`\`\`

### 六、枚举最佳实践

\`\`\`csharp
// 好的枚举设计示例
enum PaymentMethod
{
    CreditCard = 1,   // 信用卡
    DebitCard = 2,    // 借记卡
    BankTransfer = 3, // 银行转账
    DigitalWallet = 4, // 数字钱包
    Cash = 5          // 现金
}

// 配合 switch 表达式使用（C# 8+）
decimal GetProcessingFee(PaymentMethod method, decimal amount)
{
    return method switch
    {
        PaymentMethod.CreditCard => amount * 0.025m,   // 信用卡 2.5%
        PaymentMethod.DebitCard => amount * 0.015m,    // 借记卡 1.5%
        PaymentMethod.BankTransfer => amount * 0.005m, // 银行转账 0.5%
        PaymentMethod.DigitalWallet => amount * 0.02m,  // 数字钱包 2%
        PaymentMethod.Cash => 0,                        // 现金免费
        _ => throw new ArgumentException("未知支付方式")
    };
}

decimal amount = 1000m;
Console.WriteLine($"信用卡手续费：{GetProcessingFee(PaymentMethod.CreditCard, amount):C}");
Console.WriteLine($"银行转账手续费：{GetProcessingFee(PaymentMethod.BankTransfer, amount):C}");

// ⚠️ 最佳实践
// 1. 使用单数名称（如 OrderStatus，不是 OrderStatuses）
// 2. 除非有明确需要，否则不要显式赋值（让编译器自动递增）
// 3. 位标志枚举一定用 [Flags]，值为 2 的幂次
// 4. 始终为位标志枚举定义 None = 0 成员
// 5. 枚举值应该是不可变的——不要依赖将来不添加新值
\`\`\`

### 七、小结

- ⭐ 枚举是值类型，用于定义一组命名常量，底层默认是 \`int\`。
- ⭐ \`[Flags]\` 特性支持位运算组合，值应为 2 的幂次。
- ⭐ \`Enum.TryParse<T>()\` 是安全的字符串转枚举方式。
- ⭐ \`Enum.GetNames<T>()\` 和 \`Enum.GetValues<T>()\` 用于遍历枚举。
- ⭐ 枚举让代码更具可读性，避免魔法数字。`,
  },

  // ============================================================
  // 第三十三章：结构体
  // ============================================================
  {
    id: 'csharp3-ch33',
    group: '第七部分 值类型与引用类型',
    icon: '📐',
    title: '第三十三章 结构体',
    content: `## 第三十三章　结构体

结构体（struct）是值类型，适用于小型、不可变的数据结构。与类不同，结构体在赋值和传递时复制整个数据，而非引用。

### 一、结构体定义

结构体用 \`struct\` 关键字定义，与类的主要区别是它是值类型：

\`\`\`csharp
// 结构体定义：值类型
struct Point
{
    public int X;  // 公有字段
    public int Y;

    // 构造函数：必须初始化所有字段
    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }

    // 方法：计算到原点的距离
    public double DistanceFromOrigin()
    {
        return Math.Sqrt(X * X + Y * Y);  // 欧几里得距离
    }

    // 只读属性
    public readonly bool IsOrigin => X == 0 && Y == 0;

    public override string ToString() => $"({X}, {Y})";
}

// 使用结构体
Point p1 = new Point(3, 4);
Point p2 = p1;  // 复制整个结构体（值类型行为）
p2.X = 100;     // 修改 p2 不影响 p1

Console.WriteLine($"p1: {p1}, 距离: {p1.DistanceFromOrigin():F2}");  // (3, 4), 距离: 5.00
Console.WriteLine($"p2: {p2}");  // (100, 4)
Console.WriteLine($"p1 是原点: {p1.IsOrigin}");  // False
\`\`\`

### 二、结构体 vs 类：关键差异

\`\`\`csharp
// 对比：类（引用类型）
class PointClass
{
    public int X;
    public int Y;
    public PointClass(int x, int y) { X = x; Y = y; }
}

// 对比：结构体（值类型）
struct PointStruct
{
    public int X;
    public int Y;
    public PointStruct(int x, int y) { X = x; Y = y; }
}

// === 差异1：赋值行为 ===
PointClass pc1 = new PointClass(10, 20);
PointClass pc2 = pc1;  // 复制引用，指向同一对象
pc2.X = 999;
Console.WriteLine($"类赋值：pc1.X={pc1.X}, pc2.X={pc2.X}");  // 都是 999（共享）

PointStruct ps1 = new PointStruct(10, 20);
PointStruct ps2 = ps1;  // 复制整个数据，独立副本
ps2.X = 999;
Console.WriteLine($"结构体赋值：ps1.X={ps1.X}, ps2.X={ps2.X}");  // 10, 999（独立）

// === 差异2：默认值 ===
PointClass defaultClass = default;  // null
PointStruct defaultStruct = default; // X=0, Y=0（结构体不能为 null）
Console.WriteLine($"默认结构体：{defaultStruct}");  // (0, 0)

// === 差异3：可为 null ===
PointStruct? nullableStruct = null;  // 可空值类型，需要 ? 语法
if (nullableStruct.HasValue)
    Console.WriteLine(nullableStruct.Value);
else
    Console.WriteLine("可空结构体为 null");
\`\`\`

### 三、只读结构体（readonly struct）

C# 7.2+ 引入只读结构体，确保所有成员都是只读的，编译器会优化性能：

\`\`\`csharp
// readonly struct：所有字段和属性都是只读的
readonly struct ImmutablePoint
{
    public int X { get; }  // 只读属性
    public int Y { get; }

    public ImmutablePoint(int x, int y)
    {
        X = x;
        Y = y;
    }

    // 所有方法都必须是 readonly（隐式）
    public double DistanceFromOrigin()
    {
        return Math.Sqrt(X * X + Y * Y);
    }

    // 创建修改后的新实例（而非修改自身）
    public ImmutablePoint WithX(int newX)
    {
        return new ImmutablePoint(newX, Y);  // 返回新实例
    }

    public override string ToString() => $"({X}, {Y})";
}

var point = new ImmutablePoint(3, 4);
// point.X = 5;  // 编译错误！只读属性不能修改

// 不可变模式：通过方法创建新实例
var moved = point.WithX(10);
Console.WriteLine($"原始: {point}, 新: {moved}");  // 原始: (3, 4), 新: (10, 4)
\`\`\`

### 四、ref 结构体（ref struct）

\`ref struct\` 只能在栈上分配，不能装箱也不能作为类成员。用于高性能场景如 \`Span<T>\`：

\`\`\`csharp
// ref struct：保证在栈上分配，不会逃逸到堆
ref struct StackOnlyData
{
    public int Value;
    public Span<char> Buffer;  // Span<T> 也是 ref struct

    public StackOnlyData(int value, Span<char> buffer)
    {
        Value = value;
        Buffer = buffer;
    }

    public void Process()
    {
        Console.WriteLine($"处理值: {Value}, 缓冲区长度: {Buffer.Length}");
    }
}

// 使用 ref struct
Span<char> buffer = stackalloc char[10];  // 在栈上分配字符数组
buffer[0] = 'H';
buffer[1] = 'e';
buffer[2] = 'l';
buffer[3] = 'l';
buffer[4] = 'o';

var data = new StackOnlyData(42, buffer);
data.Process();

// ref struct 限制：
// - 不能是类或非 ref struct 的字段
// - 不能装箱
// - 不能实现接口
// - 不能用作类型参数
// - 不能被 lambda 或本地函数捕获
\`\`\`

### 五、只读成员（readonly members）

C# 8+ 允许在非只读结构体中标记只读成员，编译器确保不修改状态：

\`\`\`csharp
struct MutableStruct
{
    public int X;
    public int Y;

    public MutableStruct(int x, int y)
    {
        X = x;
        Y = y;
    }

    // 只读方法：保证不修改结构体状态
    public readonly double Magnitude()
    {
        // X = 10;  // 编译错误！只读方法不能修改字段
        return Math.Sqrt(X * X + Y * Y);
    }

    // 非只读方法：可以修改状态
    public void Translate(int dx, int dy)
    {
        X += dx;  // 可以修改
        Y += dy;
    }

    // 只读属性
    public readonly bool IsZero => X == 0 && Y == 0;

    public override readonly string ToString() => $"({X}, {Y})";
}

var ms = new MutableStruct(3, 4);
Console.WriteLine($"长度: {ms.Magnitude():F2}");  // 5.00
ms.Translate(10, 20);
Console.WriteLine($"平移后: {ms}");  // (13, 24)
\`\`\`

### 六、with 表达式与结构体（C# 10+）

\`\`\`csharp
// 结构体也支持 with 表达式（C# 10+），创建修改后的副本
struct Rectangle
{
    public int Width { get; init; }   // init 访问器：只能在初始化时设置
    public int Height { get; init; }

    public Rectangle(int width, int height)
    {
        Width = width;
        Height = height;
    }

    public readonly int Area => Width * Height;
    public override readonly string ToString() => $"{Width}×{Height}";
}

var rect = new Rectangle(10, 20);
// rect.Width = 15;  // 编译错误！init 属性不能修改

// with 表达式：创建修改后的副本
var bigger = rect with { Width = 15 };
Console.WriteLine($"原始: {rect}, 面积: {rect.Area}");    // 10×20, 200
Console.WriteLine($"新: {bigger}, 面积: {bigger.Area}");  // 15×20, 300
\`\`\`

### 七、何时使用结构体

| 应该用 struct | 应该用 class |
| --- | --- |
| 数据小于 16 字节 | 数据大于 16 字节 |
| 逻辑上表示单一值（如坐标、颜色） | 逻辑上表示有行为的实体 |
| 不可变（创建后不修改） | 需要频繁修改 |
| 短期存在，不需要长期引用 | 需要长期存在和共享引用 |
| 不需要继承 | 需要继承和多态 |
| 性能敏感，避免 GC 压力 | 包含大量数据，避免复制开销 |

### 八、小结

- ⭐ 结构体是值类型，赋值时复制全部数据，适合小型不可变数据。
- ⭐ \`readonly struct\` 确保所有成员只读，编译器可优化性能。
- ⭐ \`ref struct\` 只能在栈上分配，用于高性能场景（如 \`Span<T>\`）。
- ⭐ \`readonly\` 成员标记不修改状态的方法，在非只读结构体中也能保证安全。
- ⭐ 结构体不支持继承，但可以实现接口。
- ⚠️ 大结构体（> 16 字节）频繁复制会有性能开销，应考虑用类。`,
  },

  // ============================================================
  // 第三十四章：记录 (record)
  // ============================================================
  {
    id: 'csharp3-ch34',
    group: '第七部分 值类型与引用类型',
    icon: '📋',
    title: '第三十四章 记录 (record)',
    content: `## 第三十四章　记录 (record)

记录（record）是 C# 9 引入的引用类型（C# 10 新增 \`record struct\` 值类型版本），专为不可变数据模型设计。它内置了值相等性、with 表达式和格式化输出。

### 一、记录定义

记录用 \`record\` 关键字声明，默认是引用类型（record class）：

\`\`\`csharp
// 记录定义：位置记录（positional record）
// 括号中的参数自动生成 init-only 属性
record Person(string FirstName, string LastName, int Age);

// 使用记录
var person = new Person("三", "张", 28);

// 自动生成的属性（init-only，初始化后不可修改）
Console.WriteLine($"姓名：{person.LastName}{person.FirstName}");
Console.WriteLine($"年龄：{person.Age}");

// 自动生成的 ToString() 输出
Console.WriteLine(person);  // Person { FirstName = 三, LastName = 张, Age = 28 }

// 解构记录
var (firstName, lastName, age) = person;
Console.WriteLine($"解构：{lastName}{firstName}, {age}岁");
\`\`\`

### 二、值相等性

记录默认使用值相等性——比较所有属性值，而非引用：

\`\`\`csharp
record Product(string Name, decimal Price, string Category);

var p1 = new Product("键盘", 299m, "外设");
var p2 = new Product("键盘", 299m, "外设");
var p3 = new Product("鼠标", 149m, "外设");

// 值相等：所有属性相同则相等
Console.WriteLine($"p1 == p2: {p1 == p2}");          // True（值相等）
Console.WriteLine($"p1.Equals(p2): {p1.Equals(p2)}"); // True
Console.WriteLine($"p1 == p3: {p1 == p3}");          // False

// 引用相等：需要 ReferenceEquals
Console.WriteLine($"ReferenceEquals: {ReferenceEquals(p1, p2)}");  // False

// 作为字典键也可以正常工作
var inventory = new Dictionary<Product, int>
{
    [p1] = 100
};
Console.WriteLine($"p2 的库存：{inventory[p2]}");  // 100（值相等匹配）
\`\`\`

### 三、with 表达式

with 表达式创建记录的副本，同时修改部分属性：

\`\`\`csharp
record Address(string Street, string City, string Country);

var addr1 = new Address("长安街1号", "北京", "中国");

// with 表达式：创建副本并修改指定属性
var addr2 = addr1 with { Street = "南京路100号", City = "上海" };

Console.WriteLine($"原始地址：{addr1}");
Console.WriteLine($"新地址：{addr2}");

// 实际应用：价格调整
record Product2(string Name, decimal Price, int Stock);

var product = new Product2("机械键盘", 599m, 50);

// 打折：价格打8折
var discounted = product with { Price = product.Price * 0.8m };
Console.WriteLine($"原价：{product.Price:C}，折后：{discounted.Price:C}");

// 售出后更新库存
var afterSale = product with { Stock = product.Stock - 1 };
Console.WriteLine($"售出前库存：{product.Stock}，售出后：{afterSale.Stock}");
\`\`\`

### 四、不可变性（Immutability）

\`\`\`csharp
// 记录属性默认是 init-only，创建后不可修改
record User(string Username, string Email, DateTime CreatedAt);

var user = new User("zhangsan", "zhangsan@example.com", DateTime.Now);

// user.Username = "lisi";  // 编译错误！init-only 属性不能修改

// 创建修改后的副本
var updatedUser = user with { Email = "newemail@example.com" };
Console.WriteLine($"原始邮箱：{user.Email}");
Console.WriteLine($"新邮箱：{updatedUser.Email}");

// 记录中的方法：可以添加自定义行为
record Rectangle(double Width, double Height)
{
    // 计算属性
    public double Area => Width * Height;
    public double Perimeter => 2 * (Width + Height);

    // 方法：创建缩放后的副本
    public Rectangle Scale(double factor)
    {
        return this with
        {
            Width = Width * factor,
            Height = Height * factor
        };
    }

    // 自定义 ToString
    public override string ToString()
        => $"矩形 {Width}×{Height}（面积={Area}，周长={Perimeter}）";
}

var rect = new Rectangle(10, 20);
Console.WriteLine(rect);
Console.WriteLine($"缩放2倍：{rect.Scale(2)}");
\`\`\`

### 五、record struct（C# 10+）

record struct 是值类型的记录，结合了 struct 的性能和 record 的便利：

\`\`\`csharp
// record struct：值类型记录
record struct Point3D(double X, double Y, double Z);

var p1 = new Point3D(1, 2, 3);
var p2 = new Point3D(1, 2, 3);

// 值相等（值类型本身就按值比较）
Console.WriteLine($"p1 == p2: {p1 == p2}");  // True

// with 表达式
var p3 = p1 with { Z = 10 };
Console.WriteLine($"p1: {p1}, p3: {p3}");

// record struct 是值类型：赋值时复制整个数据
var p4 = p1;  // 复制
p4 = p4 with { X = 100 };
Console.WriteLine($"p1.X: {p1.X}, p4.X: {p4.X}");  // 1, 100（独立）

// readonly record struct：完全不可变的值类型记录
readonly record struct ImmutablePoint(double X, double Y);

var ip = new ImmutablePoint(5, 10);
// ip.X = 20;  // 编译错误！
var ip2 = ip with { X = 20 };  // 正确：创建新实例
\`\`\`

### 六、record vs class vs struct 对比

| 特性 | record | class | record struct | struct |
| --- | --- | --- | --- | --- |
| 类型 | 引用类型 | 引用类型 | 值类型 | 值类型 |
| 相等性 | 值相等 | 引用相等 | 值相等 | 值相等（默认） |
| 不可变性 | init-only 属性 | 可选 | init-only 属性 | 可选 |
| with 表达式 | ✓ | ✗ | ✓ | ✗（C# 10+ 支持） |
| 继承 | ✓ | ✓ | ✗ | ✗ |
| 解构 | ✓（位置记录） | ✗ | ✓（位置记录） | ✗ |
| ToString | 格式化输出 | 默认 | 格式化输出 | 默认 |
| 适用场景 | 不可变数据模型 | 可变实体 | 高性能不可变数据 | 小型值类型 |

### 七、记录继承

\`\`\`csharp
// 记录支持继承（仅 record class，record struct 不支持）
record Animal(string Name, int Age);

record Dog(string Name, int Age, string Breed) : Animal(Name, Age);

record Cat(string Name, int Age, bool IsIndoor) : Animal(Name, Age)
{
    // 可以添加额外的方法
    public string GetLifestyle() => IsIndoor ? "室内猫" : "室外猫";
}

var dog = new Dog("旺财", 3, "金毛");
var cat = new Cat("咪咪", 2, true);

Console.WriteLine(dog);  // Dog { Name = 旺财, Age = 3, Breed = 金毛 }
Console.WriteLine(cat);  // Cat { Name = 咪咪, Age = 2, IsIndoor = True }

// 密封记录：阻止进一步继承
sealed record SealedAnimal(string Name) : Animal(Name, 0);
// record CannotInherit : SealedAnimal;  // 编译错误！
\`\`\`

### 八、小结

- ⭐ 记录（record）是专为不可变数据设计，内置值相等、with 表达式和格式化输出。
- ⭐ 位置记录自动生成 init-only 属性和解构方法。
- ⭐ with 表达式创建修改后的副本，不改变原对象。
- ⭐ record struct 是值类型记录，结合了值类型性能与记录便利性。
- ⭐ 记录适合 DTO、配置、事件数据等不可变数据模型。`,
  },

  // ============================================================
  // 第三十五章：可空值类型
  // ============================================================
  {
    id: 'csharp3-ch35',
    group: '第七部分 值类型与引用类型',
    icon: '❓',
    title: '第三十五章 可空值类型',
    content: `## 第三十五章　可空值类型

值类型默认不能为 null，但通过 \`?\` 语法可以创建可空值类型，表示"有值"或"无值"的状态。这在数据库操作、表单输入等场景中非常实用。

### 一、Nullable\<T\> 基础

\`int?\` 是 \`Nullable<int>\` 的简写，两者完全等价：

\`\`\`csharp
// 可空值类型：两种等价写法
int? nullableInt = null;           // 语法糖写法
Nullable<int> nullableInt2 = null;  // 完整写法

Console.WriteLine($"nullableInt 为 null：{nullableInt == null}");  // True

// 赋值
nullableInt = 42;
Console.WriteLine($"赋值后：{nullableInt}");  // 42

// 重置为 null
nullableInt = null;

// 其他可空类型
double? price = 19.99;
bool? isActive = null;
DateTime? birthDate = null;
char? middleInitial = 'A';

// 有值时的输出
Console.WriteLine($"价格：{price}");           // 19.99
Console.WriteLine($"是否活跃：{isActive}");     // （空）
Console.WriteLine($"出生日期：{birthDate}");    // （空）
\`\`\`

### 二、HasValue 与 Value

\`\`\`csharp
int? age = 25;

// HasValue：判断是否有值
if (age.HasValue)
{
    // Value：获取实际值（如果为 null 则抛出 InvalidOperationException）
    Console.WriteLine($"年龄：{age.Value} 岁");
}
else
{
    Console.WriteLine("年龄未知");
}

// 不安全的访问：如果为 null 会抛异常
int? nullAge = null;
// Console.WriteLine(nullAge.Value);  // InvalidOperationException！

// 安全访问模式
void PrintAge(int? age)
{
    if (age.HasValue)
        Console.WriteLine($"年龄：{age.Value}");
    else
        Console.WriteLine("年龄未提供");
}

PrintAge(30);
PrintAge(null);
\`\`\`

### 三、GetValueOrDefault

\`\`\`csharp
// GetValueOrDefault()：有值返回值，无值返回默认值
int? score = 95;
int? noScore = null;

Console.WriteLine($"有值：{score.GetValueOrDefault()}");      // 95
Console.WriteLine($"无值默认：{noScore.GetValueOrDefault()}"); // 0

// GetValueOrDefault(自定义默认值)
Console.WriteLine($"自定义默认值：{noScore.GetValueOrDefault(60)}"); // 60

// 实际应用：数据库查询结果
int? dbResult = null;  // 模拟数据库返回 null
int finalScore = dbResult.GetValueOrDefault(0);  // 用 0 作为默认值
Console.WriteLine($"最终分数：{finalScore}");  // 0
\`\`\`

### 四、null 合并运算符（??）

\`\`\`csharp
// ?? 运算符：如果左边为 null，则使用右边的值
int? input = null;
int result = input ?? 0;  // 如果 input 为 null，则用 0
Console.WriteLine($"结果：{result}");  // 0

input = 42;
result = input ?? 0;  // input 有值，直接使用
Console.WriteLine($"结果：{result}");  // 42

// ?? 可以链式使用
string? firstName = null;
string? middleName = null;
string? lastName = "张";

string displayName = firstName ?? middleName ?? lastName ?? "未知";
Console.WriteLine($"显示名称：{displayName}");  // 张

// 实际应用：配置读取
string? configValue = null;  // 模拟配置缺失
int port = int.Parse(configValue ?? "8080");  // 默认端口 8080
Console.WriteLine($"端口：{port}");

// ??= 赋值运算符：仅在左侧为 null 时赋值
int? cache = null;
cache ??= 100;  // cache 为 null，赋值为 100
Console.WriteLine($"第一次赋值：{cache}");  // 100

cache ??= 200;  // cache 已有值 100，不赋值
Console.WriteLine($"第二次赋值：{cache}");  // 100（不变）
\`\`\`

### 五、null 条件运算符（?.）

\`\`\`csharp
// ?. 运算符：如果左边为 null，则跳过整个表达式，返回 null
int?[] numbers = { 1, null, 3, null, 5 };

for (int i = 0; i < numbers.Length; i++)
{
    // 使用 ?. 安全访问可空值
    int? doubled = numbers[i]?.CompareTo(0);  // 不用这个方法，用下面这种
    Console.WriteLine($"索引 {i}：{(numbers[i]?.ToString() ?? "null")}");
}

// 实际用法：链式调用
string? text = null;
// 如果 text 为 null，?.Length 不会执行，直接返回 null
int? length = text?.Length;
Console.WriteLine($"字符串长度：{length}");  // （空）

text = "Hello";
length = text?.Length;
Console.WriteLine($"字符串长度：{length}");  // 5

// 结合 ?? 使用：安全链式访问 + 默认值
string? userName = null;
int nameLength = userName?.Length ?? 0;  // 如果 null，长度为 0
Console.WriteLine($"用户名长度：{nameLength}");  // 0
\`\`\`

### 六、可空值类型在表达式中的行为

\`\`\`csharp
// 可空值类型的运算：如果任一操作数为 null，结果也是 null
int? a = 10;
int? b = null;
int? c = 5;

// 算术运算
Console.WriteLine($"a + c = {a + c}");  // 15
Console.WriteLine($"a + b = {a + b}");  // （空）——b 为 null，结果也是 null
Console.WriteLine($"a * c = {a * c}");  // 50

// 比较运算
Console.WriteLine($"a > c = {a > c}");    // True
Console.WriteLine($"a > b = {a > b}");    // null（可空bool）
Console.WriteLine($"a == b = {a == b}");  // False（与 null 比较永远 False）

// 可空布尔值的三值逻辑
bool? flag = null;
// if (flag) ...  // 编译错误！不能直接使用可空 bool
// 需要显式检查
if (flag == true)
    Console.WriteLine("flag 为 true");
else if (flag == false)
    Console.WriteLine("flag 为 false");
else
    Console.WriteLine("flag 为 null");
\`\`\`

### 七、实战：用户信息表单

\`\`\`csharp
// 可空值类型在表单处理中的实际应用
class UserProfile
{
    public string Username { get; set; } = "";  // 必填
    public string Email { get; set; } = "";     // 必填

    // 以下为选填项，使用可空类型
    public int? Age { get; set; }               // 选填年龄
    public DateTime? BirthDate { get; set; }    // 选填生日
    public decimal? Salary { get; set; }         // 选填薪资
    public bool? IsMarried { get; set; }         // 选填婚姻状态（三态）

    public void PrintProfile()
    {
        Console.WriteLine($"用户名：{Username}");
        Console.WriteLine($"邮箱：{Email}");

        // 使用 ?? 提供默认显示
        Console.WriteLine($"年龄：{Age?.ToString() ?? "未填写"}");
        Console.WriteLine($"生日：{BirthDate?.ToString("yyyy-MM-dd") ?? "未填写"}");
        Console.WriteLine($"薪资：{Salary?.ToString("C") ?? "未填写"}");

        // 三态布尔值处理
        string marriageStatus = IsMarried switch
        {
            true => "已婚",
            false => "未婚",
            null => "未填写"
        };
        Console.WriteLine($"婚姻状态：{marriageStatus}");
    }
}

var profile = new UserProfile
{
    Username = "zhangsan",
    Email = "zhangsan@example.com",
    Age = 28,
    Salary = 15000m
    // BirthDate 和 IsMarried 未设置，自动为 null
};

profile.PrintProfile();
\`\`\`

### 八、小结

- ⭐ \`int?\` 是 \`Nullable<int>\` 的简写，让值类型可以表示 null。
- ⭐ \`HasValue\` 检查是否有值，\`Value\` 获取实际值（注意 null 检查）。
- ⭐ \`GetValueOrDefault()\` 安全获取值，可指定默认值。
- ⭐ \`??\` 运算符提供 null 时的默认值，\`??=\` 仅在 null 时赋值。
- ⭐ \`?.\` 运算符实现安全链式访问，遇到 null 则短路。
- ⚠️ 可空值类型参与运算时，如果任一操作数为 null，结果也是 null。`,
  },

  // ============================================================
  // 第三十六章：可空引用类型
  // ============================================================
  {
    id: 'csharp3-ch36',
    group: '第七部分 值类型与引用类型',
    icon: '🛡️',
    title: '第三十六章 可空引用类型',
    content: `## 第三十六章　可空引用类型

可空引用类型（Nullable Reference Types，NRT）是 C# 8 引入的编译时特性，帮助开发者避免 \`NullReferenceException\`。它通过类型注解和编译器警告，在编译阶段就发现潜在的 null 引用问题。

### 一、启用可空引用类型

在项目文件中启用或在代码文件顶部使用 \`#nullable enable\`：

\`\`\`csharp
// 在 .csproj 中全局启用：
// <Nullable>enable</Nullable>

// 或者在代码文件顶部启用：
// #nullable enable

// 引用类型默认不可为 null（启用 NRT 后）
string nonNullable = "Hello";  // 非空引用类型
// nonNullable = null;  // 编译器警告！不能为 null

// 使用 ? 声明可为 null 的引用类型
string? nullable = null;  // 可为 null 的引用类型
nullable = "World";       // 可以赋非空值
nullable = null;          // 也可以赋 null
\`\`\`

### 二、编译器警告与安全检查

\`\`\`csharp
// 编译器静态分析：检测潜在的 null 引用

// 警告示例1：可能为 null 的引用
string? maybeNull = GetNullableString();

// 直接使用可能是 null 的变量——编译器警告
// Console.WriteLine(maybeNull.Length);  // 警告：可能为 null

// 解决办法1：null 检查后安全使用
if (maybeNull != null)
{
    Console.WriteLine(maybeNull.Length);  // 安全：编译器知道这里不为 null
}

// 解决办法2：null 条件运算符
Console.WriteLine(maybeNull?.Length);  // 安全

// 解决办法3：null 合并运算符
Console.WriteLine(maybeNull?.Length ?? 0);  // null 时显示 0

string? GetNullableString()
{
    Random rnd = new Random();
    return rnd.Next(2) == 0 ? "Hello" : null;  // 随机返回 null 或非 null
}
\`\`\`

### 三、null 宽容运算符（!）

\`\`\`csharp
// null-forgiving operator (!)：告诉编译器"我知道这个值不为 null"
// 慎用！仅在确定不为 null 时使用

string? input = "Hello";

// 使用 ! 抑制编译器警告
string guaranteed = input!;  // 告诉编译器：input 肯定不为 null
Console.WriteLine(guaranteed.Length);  // 没有警告

// 实际场景1：构造函数中延迟初始化
class UserService
{
    private string _connectionString = null!;  // 使用 ! 告诉编译器会在其他地方初始化

    public UserService()
    {
        _connectionString = "Server=localhost";  // 构造函数中初始化
    }

    public void Connect()
    {
        Console.WriteLine($"连接：{_connectionString}");  // 安全使用
    }
}

// 实际场景2：Factory 方法确保非空返回
class User
{
    public string Name { get; set; } = null!;  // 通过 Factory 方法保证初始化

    public static User Create(string name)
    {
        return new User { Name = name };  // Factory 确保 Name 被设置
    }
}

// ⚠️ 警告：滥用 ! 会掩盖真正的 null 问题
// string? dangerous = null;
// dangerous!.ToString();  // 运行时 NullReferenceException！
\`\`\`

### 四、属性与方法的 NRT 标注

\`\`\`csharp
// 正确标注属性和方法参数的可空性
class Customer
{
    // 非空属性：必须在构造时初始化
    public string Id { get; set; }
    public string Name { get; set; }

    // 可为 null 的属性：使用 ? 声明
    public string? MiddleName { get; set; }
    public string? PhoneNumber { get; set; }

    public Customer(string id, string name)
    {
        Id = id;     // 保证非空
        Name = name; // 保证非空
        // MiddleName 和 PhoneNumber 默认为 null
    }

    // 方法参数标注
    public void UpdatePhone(string? phone)
    {
        // 参数可以为 null，方法内部处理
        PhoneNumber = phone;
    }

    // 返回值标注：可能返回 null
    public string? GetMiddleName()
    {
        return MiddleName;  // 可能为 null
    }

    // 确保非空返回
    public string GetFullName()
    {
        // 处理 MiddleName 可能为 null 的情况
        if (MiddleName != null)
            return $"{Name} {MiddleName}";
        return Name;
    }
}

var customer = new Customer("C001", "张三");
customer.UpdatePhone("13800138000");
Console.WriteLine($"全名：{customer.GetFullName()}");
Console.WriteLine($"中间名：{customer.GetMiddleName() ?? "无"}");
\`\`\`

### 五、NRT 最佳实践

\`\`\`csharp
// 最佳实践1：优先使用非空引用类型
// 好的设计：需要非空时明确要求
class OrderService
{
    // 非空参数：调用者必须提供非空值
    public void ProcessOrder(string orderId, string customerName)
    {
        // 不需要 null 检查——类型系统保证非空
        Console.WriteLine($"处理订单 {orderId}，客户 {customerName}");
    }
}

// 最佳实践2：明确区分"缺失"和"空值"
class SearchResult
{
    // 使用 ? 表示"可能没找到"
    public static string? FindUser(string userId)
    {
        // 模拟数据库查询
        if (userId == "admin")
            return "管理员";
        return null;  // 明确表示"未找到"
    }

    // 使用空集合表示"没有结果"，而非 null
    public static List<string> SearchProducts(string keyword)
    {
        // 永远返回非空集合，即使没有结果
        if (string.IsNullOrEmpty(keyword))
            return new List<string>();  // 空列表，不是 null
        return new List<string> { "产品A", "产品B" };
    }
}

// 最佳实践3：Try 模式
// 返回 bool 表示成功，out 参数用 ? 表示可能为 null
static bool TryParseInt(string? input, out int result)
{
    result = 0;  // 先赋默认值
    if (input == null) return false;
    return int.TryParse(input, out result);
}

// 最佳实践4：使用 [NotNullWhen] 等特性
// 这些特性帮助编译器更好地进行流分析
// 在 System.Diagnostics.CodeAnalysis 命名空间中：
// [NotNullWhen(true)]、[DoesNotReturnIf(true)] 等
\`\`\`

### 六、NRT 迁移策略

\`\`\`csharp
// 从旧项目迁移 NRT 的策略：

// 1. 项目级别逐步启用
// .csproj 中可以设置警告级别：
// <Nullable>warnings</Nullable>  // 只显示警告，不阻止编译
// <Nullable>annotations</Nullable>  // 只启用标注，不显示警告

// 2. 文件级别逐步迁移
// 在新文件中添加 #nullable enable
// 旧文件保持原样

// 3. 处理外部库（没有 NRT 标注的库）
// 使用 ! 运算符处理来自旧库的返回值
// 例如：string name = legacyLibrary.GetName()!;
\`\`\`

### 七、小结

- ⭐ 可空引用类型（NRT）是编译时特性，帮助避免 NullReferenceException。
- ⭐ 启用 NRT 后，引用类型默认不可为 null，加 \`?\` 表示可为 null。
- ⭐ null 宽容运算符（\`!\`）告诉编译器"我知道不为 null"，慎用。
- ⭐ 优先设计非空引用类型，用 null 明确表示"缺失"语义。
- ⭐ 配合 \`?.\` 和 \`??\` 运算符可以优雅地处理可空引用。`,
  },

  // ============================================================
  // 第三十七章：元组与解构
  // ============================================================
  {
    id: 'csharp3-ch37',
    group: '第七部分 值类型与引用类型',
    icon: '🎁',
    title: '第三十七章 元组与解构',
    content: `## 第三十七章　元组与解构

元组（Tuple）让你无需定义类就能将多个值组合在一起。C# 7 引入的 ValueTuple 是轻量级值类型，配合解构语法，让多值返回变得优雅自然。

### 一、ValueTuple 基础

\`\`\`csharp
// 创建元组：用括号括起多个值
(int, string) person = (25, "张三");

// 访问元素：使用 Item1, Item2... 默认名称
Console.WriteLine($"年龄：{person.Item1}，姓名：{person.Item2}");

// 命名元组元素：在声明时指定名称
(int Age, string Name) namedPerson = (28, "李四");
Console.WriteLine($"年龄：{namedPerson.Age}，姓名：{namedPerson.Name}");

// 创建时命名：在值前面加名称
var person2 = (Age: 30, Name: "王五");
Console.WriteLine($"年龄：{person2.Age}，姓名：{person2.Name}");

// 元素名称从变量推断
int age = 22;
string name = "赵六";
var person3 = (age, name);  // 元素名称推断为 age 和 name
Console.WriteLine($"年龄：{person3.age}，姓名：{person3.name}");
\`\`\`

### 二、元组作为返回值

元组最常见的用途是让方法返回多个值：

\`\`\`csharp
// 返回多个值：元组让方法签名清晰表达返回内容
(int Min, int Max) FindMinMax(int[] numbers)
{
    if (numbers.Length == 0)
        throw new ArgumentException("数组不能为空");

    int min = numbers[0];
    int max = numbers[0];

    foreach (int n in numbers)
    {
        if (n < min) min = n;  // 更新最小值
        if (n > max) max = n;  // 更新最大值
    }

    return (min, max);  // 返回元组
}

int[] data = { 3, 7, 1, 9, 4, 6, 8, 2, 5 };
var result = FindMinMax(data);
Console.WriteLine($"最小值：{result.Min}，最大值：{result.Max}");

// 直接解构结果
var (minValue, maxValue) = FindMinMax(data);
Console.WriteLine($"最小值：{minValue}，最大值：{maxValue}");

// 实际应用：除法同时返回商和余数
(int Quotient, int Remainder) Divide(int dividend, int divisor)
{
    int quotient = dividend / divisor;   // 商
    int remainder = dividend % divisor;  // 余数
    return (quotient, remainder);
}

var (q, r) = Divide(17, 5);
Console.WriteLine($"17 ÷ 5 = {q} 余 {r}");  // 17 ÷ 5 = 3 余 2
\`\`\`

### 三、元组解构

\`\`\`csharp
// 解构：将元组拆分为独立变量
(int x, int y) point = (10, 20);

// 方式1：显式类型解构
(int px, int py) = point;
Console.WriteLine($"x={px}, y={py}");

// 方式2：var 解构（每个变量推断为 var）
var (vx, vy) = point;
Console.WriteLine($"x={vx}, y={vy}");

// 方式3：混合（已有变量 + 新变量）
int existingX;
(existingX, int newY) = point;
Console.WriteLine($"x={existingX}, y={newY}");

// 解构嵌套元组
var complex = (1, (2, 3), 4);
var (a, (b, c), d) = complex;
Console.WriteLine($"a={a}, b={b}, c={c}, d={d}");  // a=1, b=2, c=3, d=4

// 使用 _ 丢弃不需要的元素
var (firstName, _, lastName) = ("张", "中间名", "三");
Console.WriteLine($"{lastName}{firstName}");  // 张三
\`\`\`

### 四、元组比较

\`\`\`csharp
// ValueTuple 支持 == 和 != 比较（元素数量相同且类型兼容）
var t1 = (1, "Hello");
var t2 = (1, "Hello");
var t3 = (2, "Hello");

Console.WriteLine($"t1 == t2: {t1 == t2}");  // True（值相等）
Console.WriteLine($"t1 == t3: {t1 == t3}");  // False

// 比较规则：逐个元素比较，使用元素的默认相等比较器
var t4 = (X: 1, Y: 2);
var t5 = (X: 1, Y: 2);
Console.WriteLine($"t4 == t5: {t4 == t5}");  // True

// 注意：元素数量不同不能比较
// var t6 = (1, 2, 3);
// Console.WriteLine(t4 == t6);  // 编译错误！
\`\`\`

### 五、自定义类型的解构

通过实现 \`Deconstruct\` 方法，让自定义类型也支持解构：

\`\`\`csharp
// 自定义类型支持解构
class Person
{
    public string FirstName { get; }
    public string LastName { get; }
    public int Age { get; }

    public Person(string firstName, string lastName, int age)
    {
        FirstName = firstName;
        LastName = lastName;
        Age = age;
    }

    // Deconstruct 方法：参数都是 out 参数
    // 返回 void，方法名必须是 Deconstruct
    public void Deconstruct(out string firstName, out string lastName, out int age)
    {
        firstName = FirstName;  // 输出名字
        lastName = LastName;    // 输出姓氏
        age = Age;              // 输出年龄
    }

    // 可以定义多个 Deconstruct 重载
    public void Deconstruct(out string fullName, out int age)
    {
        fullName = $"{LastName}{FirstName}";  // 组合全名
        age = Age;
    }
}

var person = new Person("三", "张", 28);

// 解构为三个变量
var (fn, ln, a) = person;
Console.WriteLine($"姓名：{ln}{fn}，年龄：{a}");

// 解构为两个变量（使用第二个 Deconstruct 重载）
var (fullName, age2) = person;
Console.WriteLine($"全名：{fullName}，年龄：{age2}");

// 结构体也支持解构
struct Point
{
    public int X { get; }
    public int Y { get; }

    public Point(int x, int y) { X = x; Y = y; }

    public void Deconstruct(out int x, out int y)
    {
        x = X;
        y = Y;
    }
}

var p = new Point(10, 20);
var (px, py) = p;
Console.WriteLine($"坐标：({px}, {py})");
\`\`\`

### 六、元组作为方法参数

\`\`\`csharp
// 元组作为方法参数：传递多个相关值
void PrintPerson((string Name, int Age) person)
{
    Console.WriteLine($"姓名：{person.Name}，年龄：{person.Age}");
}

PrintPerson(("张三", 25));

// 实际应用：配置参数
void ConfigureDatabase(
    (string Server, int Port, string Database) config)
{
    Console.WriteLine($"连接：{config.Server}:{config.Port}/{config.Database}");
}

var dbConfig = (Server: "localhost", Port: 5432, Database: "mydb");
ConfigureDatabase(dbConfig);

// 元组作为字典键
var cache = new Dictionary<(string, int), string>();
cache[("users", 1)] = "张三";
cache[("users", 2)] = "李四";
cache[("products", 100)] = "键盘";

Console.WriteLine($"用户1：{cache[("users", 1)]}");  // 张三
\`\`\`

### 七、何时使用元组

| 场景 | 推荐方案 | 原因 |
| --- | --- | --- |
| 方法返回多个值 | 元组 | 无需定义额外类型 |
| 临时数据分组 | 元组 | 作用域局限，用完即弃 |
| 方法内部临时组合 | 元组 | 轻量，无需 class |
| 跨方法共享数据 | 命名类型（class/record） | 类型安全，语义清晰 |
| 需要反复使用 | 命名类型 | 避免重复定义元组签名 |
| 需要添加行为 | 命名类型 | 元组只能存数据 |

### 八、实战：数据统计工具

\`\`\`csharp
// 综合示例：使用元组实现数据统计分析
(int Count, int Sum, double Average, int Min, int Max) AnalyzeData(int[] numbers)
{
    if (numbers.Length == 0)
        return (0, 0, 0, 0, 0);  // 空数组返回默认值

    int count = numbers.Length;
    int sum = 0;
    int min = numbers[0];
    int max = numbers[0];

    foreach (int n in numbers)
    {
        sum += n;                // 累加求和
        if (n < min) min = n;   // 更新最小值
        if (n > max) max = n;   // 更新最大值
    }

    double average = (double)sum / count;  // 计算平均值

    return (count, sum, average, min, max);
}

int[] scores = { 85, 92, 78, 95, 88, 73, 90, 100, 67, 82 };

var stats = AnalyzeData(scores);
Console.WriteLine("=== 成绩统计分析 ===");
Console.WriteLine($"总人数：{stats.Count}");
Console.WriteLine($"总分：{stats.Sum}");
Console.WriteLine($"平均分：{stats.Average:F2}");
Console.WriteLine($"最低分：{stats.Min}");
Console.WriteLine($"最高分：{stats.Max}");

// 直接解构使用
var (count, sum, avg, min, max) = AnalyzeData(scores);
Console.WriteLine($"\\n解构使用：{count}人，平均{avg:F2}分");
\`\`\`

### 九、小结

- ⭐ ValueTuple 是值类型，用于轻量级数据组合，支持命名元素。
- ⭐ 元组让方法返回多个值变得优雅，无需 \`out\` 参数或自定义类型。
- ⭐ 解构语法将元组拆分为独立变量，支持 \`_\` 丢弃不需要的元素。
- ⭐ 自定义类型实现 \`Deconstruct\` 方法即可支持解构。
- ⭐ 元组支持值相等比较（== / !=），可安全用作字典键。
- ⚠️ 元组适合临时数据组合，跨方法共享应使用命名类型。`,
  },
];

export { chapters };