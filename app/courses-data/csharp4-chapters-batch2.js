// =============================================================
// C# 从入门到精通大全（全新版）—— 第2批章节
// 第二部分 核心语法 上（共 6 章）
// -------------------------------------------------------------
// 本批包含 6 章：
//   csharp4-ch06 : 第六章 变量与常量
//   csharp4-ch07 : 第七章 内置类型详解
//   csharp4-ch08 : 第八章 值类型与引用类型
//   csharp4-ch09 : 第九章 运算符
//   csharp4-ch10 : 第十章 字符串详解
//   csharp4-ch11 : 第十一章 字符串格式化与插值
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第六章 变量与常量
  // ============================================================
  {
    id: 'csharp4-ch06',
    group: '第二部分 核心语法',
    icon: '🔢',
    title: '变量与常量',
    content: `## 第六章 变量与常量

变量是程序存放数据的「盒子」。本章我们把这个盒子的方方面面彻底讲透：怎么命名、怎么声明、放在哪里、能不能改、什么时候该用 \`const\`、什么时候该用 \`readonly\`，以及 \`var\` 这个看似方便其实暗藏玄机的关键字。

### 一、变量是什么

变量是一段有名字的内存空间，程序通过名字访问它存放的数据。C# 是**强类型语言**，每个变量都必须有明确的类型，编译器在编译期就知道这个盒子里只能放什么。

\`\`\`csharp
int age = 18;        // 声明一个 int 类型变量 age，初始值 18
string name = "Tom"; // 声明一个 string 类型变量 name
\`\`\`

### 二、变量声明的两种写法

**显式类型**：在变量名前直接写类型名。

\`\`\`csharp
int count = 10;
double price = 9.9;
bool isAdmin = true;
\`\`\`

**隐式类型 var**：让编译器根据右侧表达式推断类型。\`var\` 只能用于局部变量，且声明时必须初始化。

\`\`\`csharp
var count = 10;       // 编译器推断为 int
var price = 9.9;      // 推断为 double
var name = "Tom";     // 推断为 string
var items = new List<int>(); // 推断为 List<int>
\`\`\`

### 三、变量命名规则

C# 变量命名必须遵守以下规则：

1. 只能由字母、数字、下划线 \`_\` 组成，不能以数字开头。
2. 不能是 C# 关键字（如 \`class\`、\`int\`、\`if\`），但加 \`@\` 前缀可以避开（\`@class\`）。
3. 区分大小写：\`age\` 和 \`Age\` 是两个不同的变量。
4. 不能与同一作用域内的其他变量重名。

社区推荐命名规范：

- 局部变量、字段：\`camelCase\`，如 \`userName\`、\`orderCount\`。
- 常量：\`PascalCase\` 或 \`UPPER_SNAKE_CASE\`，如 \`MaxRetry\`、\`MAX_RETRY\`。
- 避免缩写到看不懂：\`usr\` 不如 \`user\`，\`cnt\` 不如 \`count\`。

### 四、变量作用域

作用域决定了变量「在哪里能被访问到」。C# 的作用域规则很简单：**变量只在声明它的代码块 \`{ }\` 内有效**。

\`\`\`csharp
{
    int x = 1;
    Console.WriteLine(x); // OK
}
// Console.WriteLine(x); // ❌ 编译错误：x 不存在
\`\`\`

常见的作用域层级：

- **块作用域**：\`if\`、\`for\`、\`while\` 内声明的变量，出了块就消失。
- **方法作用域**：方法的参数和方法体内声明的变量，方法返回后释放。
- **类型作用域**：类/结构体的字段，对象存活期间一直存在。

### 五、常量 const

\`const\` 表示「编译期常量」，值在编译时就必须确定，运行期绝对不能改。

\`\`\`csharp
const double Pi = 3.14159265358979;
const string AppName = "MyApp";
// Pi = 3.14; // ❌ 编译错误：const 不能被重新赋值
\`\`\`

\`const\` 的特点：

- 必须在声明时初始化。
- 值必须是编译期可计算的字面量或常量表达式。
- 隐式 static，可以通过类型名直接访问。
- 只能用于值类型、string 等内置类型，不能是对象实例。

### 六、只读 readonly

\`readonly\` 表示「运行期只读」，值可以在声明时或构造函数中赋值，之后不能修改。

\`\`\`csharp
class Config
{
    public readonly string Env;          // 声明时未赋值
    public readonly DateTime Created = DateTime.Now; // 声明时赋值

    public Config(string env)
    {
        Env = env; // 在构造函数中赋值
    }
}
\`\`\`

\`readonly\` 的特点：

- 只能用于字段（不能用于局部变量）。
- 可以是任意类型，包括引用类型。
- 每个实例可以有不同的值（除非配合 static）。

### 七、const vs readonly 对比

| 对比项 | const | readonly |
| --- | --- | --- |
| 赋值时机 | 编译期 | 运行期（声明时或构造函数） |
| 类型限制 | 内置值类型、string 等 | 任意类型 |
| 隐式 static | 是 | 否（可手动加 static） |
| 跨程序集 | 值会被嵌入调用方 | 运行时读取 |
| 适用场景 | 圆周率、版本号等永不变化的值 | 配置、依赖注入的只读字段 |

> 重要陷阱：const 跨程序集时，如果常量值改了，调用方必须重新编译才能拿到新值；readonly 则在运行时读取，不需要重新编译。

### 八、var 的使用场景与陷阱

**推荐使用 var 的场景**：

- 右侧表达式类型明显：\`var name = "Tom";\`
- 泛型类型名很长：\`var dict = new Dictionary<string, List<int>>();\`
- LINQ 查询结果类型复杂：\`var query = from x in list where x > 0 select x;\`

**不推荐使用 var 的场景**：

- 右侧类型不明显：\`var data = GetData();\` —— 读者无法判断 data 是什么。
- 需要明确指定类型时：\`double x = 5;\` 写 \`var x = 5;\` 会得到 int，不是 double。

### 九、变量初始化与默认值

C# 强制要求变量在使用前必须被赋值。局部变量不初始化就用会编译报错；字段、数组元素则有默认值：

| 类型 | 默认值 |
| --- | --- |
| 数值类型 (int, double, ...) | 0 |
| bool | false |
| char | '\\\\0' |
| 引用类型 (string, class, ...) | null |

可以用 \`default(T)\` 或 \`default\` 关键字显式获取默认值：

\`\`\`csharp
int n = default;        // 0
string s = default;     // null
DateTime dt = default;  // 0001-01-01 00:00:00
\`\`\`

### 小结

- 显式类型清晰，\`var\` 简洁，看场景选择。
- \`const\` 编译期、\`readonly\` 运行期，跨程序集要小心。
- 变量必须先赋值后使用，字段有默认值。
- 命名用 \`camelCase\`，要见名知意。`,
    code: `// 第六章 变量与常量 —— 可在 .NET 8 控制台应用直接运行
// 顶级语句：直接写代码，不需要 class Program / Main

// ============================================================
// 1. 显式类型 vs 隐式类型 var
// ============================================================
int age = 28;                       // 显式声明 int 类型变量
double price = 19.99;               // 显式声明 double 类型变量
bool isAdmin = true;                // 显式声明 bool 类型变量
string username = "xiaoming";       // 显式声明 string 类型变量

var count = 100;                    // var 让编译器推断为 int
var rate = 0.85;                    // 推断为 double
var name = "Tom";                   // 推断为 string
var tags = new List<string> { "c#", "dotnet" }; // 推断为 List<string>

Console.WriteLine($"显式类型：age={age}, price={price}, isAdmin={isAdmin}");
Console.WriteLine($"隐式类型：count={count}, rate={rate}, name={name}");
Console.WriteLine($"tags 类型：{tags.GetType().Name}，元素数：{tags.Count}");

// ============================================================
// 2. 变量命名规则演示
// ============================================================
int orderCount = 5;                 // camelCase 是局部变量推荐风格
int _tempValue = 10;                // 下划线开头也合法
string 中文变量名 = "中文名也合法";   // C# 支持 Unicode 标识符（不推荐日常使用）
string @class = "用 @ 转义关键字";   // @ 前缀可以避开关键字冲突

Console.WriteLine($"orderCount={orderCount}, _tempValue={_tempValue}");
Console.WriteLine($"中文变量名={中文变量名}, @class={@class}");

// ============================================================
// 3. 变量作用域演示
// ============================================================
int outer = 100;                    // 方法作用域变量
{
    int inner = 50;                 // 块作用域变量
    Console.WriteLine($"块内访问 outer={outer}, inner={inner}");
}
// Console.WriteLine(inner);        // ❌ 取消注释会编译错误：inner 已超出作用域
Console.WriteLine($"块外只能访问 outer={outer}");

for (int i = 0; i < 3; i++)
{
    int loopVar = i * 10;           // 每次循环都是新的 loopVar
    Console.WriteLine($"  循环内 i={i}, loopVar={loopVar}");
}
// Console.WriteLine(i);            // ❌ i 也只在 for 块内有效

// ============================================================
// 4. const 常量演示
// ============================================================
const double Pi = 3.14159265358979;     // 编译期常量，必须声明时初始化
const string AppName = "MyApp";         // 字符串常量
const int MaxRetry = 3;                 // 整型常量
const double Diameter = Pi * 2;         // 可以用其他 const 进行运算

Console.WriteLine($"Pi={Pi}, AppName={AppName}, MaxRetry={MaxRetry}, Diameter={Diameter}");
// Pi = 3.14;                          // ❌ const 不能重新赋值

// ============================================================
// 5. readonly 只读字段演示（需配合类型声明）
// ============================================================
var config = new AppConfig("production");
config.ShowInfo();                      // 查看只读字段值
// config.Env = "test";                // ❌ readonly 字段构造完成后不能修改

// ============================================================
// 6. var 的陷阱演示
// ============================================================
var x1 = 5;                          // 注意：推断为 int，不是 double！
double x2 = 5;                       // 显式写 double 才是 5.0
Console.WriteLine($"var x1=5 的类型是 {x1.GetType().Name}");  // Int32
Console.WriteLine($"double x2=5 的类型是 {x2.GetType().Name}"); // Double

// var data = LoadSomething();       // ❌ 不推荐：读者不知道 data 是什么类型

// ============================================================
// 7. 变量默认值与 default 关键字
// ============================================================
int defaultInt = default;            // default 关键字获取默认值：0
bool defaultBool = default;          // false
string defaultStr = default;         // null
DateTime defaultDate = default;      // 0001-01-01 00:00:00
double defaultDouble = default(int); // 显式写 default(T)，这里得到 0 转为 double

Console.WriteLine($"default(int) = {defaultInt}");
Console.WriteLine($"default(bool) = {defaultBool}");
Console.WriteLine($"default(string) = {(defaultStr is null ? "null" : defaultStr)}");
Console.WriteLine($"default(DateTime) = {defaultDate:yyyy-MM-dd HH:mm:ss}");
Console.WriteLine($"default(int) as double = {defaultDouble}");

// ============================================================
// 8. 字段默认值演示
// ============================================================
var demo = new DefaultDemo();
demo.ShowDefaults();                 // 查看类字段的默认值

// ============================================================
// 类型声明放在文件末尾（顶级语句规范）
// ============================================================

// AppConfig：演示 readonly 字段
class AppConfig
{
    public readonly string Env;                  // 只读字段：声明时未赋值
    public readonly DateTime Created = DateTime.Now; // 只读字段：声明时赋值
    public const string Version = "1.0.0";       // const 常量：编译期确定

    public AppConfig(string env)
    {
        Env = env;                               // 在构造函数中给 readonly 赋值
    }

    public void ShowInfo()
    {
        Console.WriteLine($"AppConfig.Env = {Env}（readonly）");
        Console.WriteLine($"AppConfig.Created = {Created:O}（readonly）");
        Console.WriteLine($"AppConfig.Version = {Version}（const）");
    }
}

// DefaultDemo：演示字段默认值
class DefaultDemo
{
    private int _count;           // 字段未显式赋值，默认 0
    private bool _flag;           // 默认 false
    private string _name;         // 默认 null
    private DateTime _createTime; // 默认 0001-01-01
    private List<int> _items;     // 引用类型默认 null

    public void ShowDefaults()
    {
        Console.WriteLine($"字段默认值：_count={_count}, _flag={_flag}");
        Console.WriteLine($"字段默认值：_name={(_name is null ? "null" : _name)}");
        Console.WriteLine($"字段默认值：_createTime={_createTime:yyyy-MM-dd}");
        Console.WriteLine($"字段默认值：_items={(_items is null ? "null" : "非空")}");
    }
}`,
    lang: 'cs',
  },

  // ============================================================
  // 第七章 内置类型详解
  // ============================================================
  {
    id: 'csharp4-ch07',
    group: '第二部分 核心语法',
    icon: '🔤',
    title: '内置类型详解',
    content: `## 第七章 内置类型详解

C# 提供了一套丰富的内置类型，覆盖整型、浮点、字符、布尔、对象等。本章把这些类型的取值范围、字面量写法、内存占用讲得清清楚楚，让你以后写代码时不再为「用 int 还是 long」「用 double 还是 decimal」纠结。

### 一、整型家族一览

C# 提供了 8 种整型，按是否带符号和位数划分：

| 类型 | 位数 | 是否带符号 | 取值范围 | 默认值 |
| --- | --- | --- | --- | --- |
| sbyte | 8 | 是 | -128 ~ 127 | 0 |
| byte | 8 | 否 | 0 ~ 255 | 0 |
| short | 16 | 是 | -32768 ~ 32767 | 0 |
| ushort | 16 | 否 | 0 ~ 65535 | 0 |
| int | 32 | 是 | -2³¹ ~ 2³¹-1 | 0 |
| uint | 32 | 否 | 0 ~ 2³²-1 | 0 |
| long | 64 | 是 | -2⁶³ ~ 2⁶³-1 | 0 |
| ulong | 64 | 否 | 0 ~ 2⁶⁴-1 | 0 |

> 经验：默认用 \`int\`，文件大小、字节数组索引用 \`long\`，二进制协议字节用 \`byte\`，无符号一般不推荐（容易和带符号混用导致溢出 bug）。

### 二、浮点类型

| 类型 | 位数 | 精度 | 取值范围 | 适用场景 |
| --- | --- | --- | --- | --- |
| float | 32 | 7 位有效数字 | ±1.5×10⁻⁴⁵ ~ ±3.4×10³⁸ | 图形、传感器 |
| double | 64 | 15-16 位 | ±5.0×10⁻³²⁴ ~ ±1.7×10³⁰⁸ | 科学计算、日常 |
| decimal | 128 | 28-29 位 | ±1.0×10⁻²⁸ ~ ±7.9×10²⁸ | 财务、货币 |

> 重要：金额计算必须用 \`decimal\`，不能用 \`double\`，否则会有精度丢失（如 0.1 + 0.2 ≠ 0.3）。

### 三、字符与布尔

- \`char\`：单个 Unicode 字符，占 2 字节，用单引号 \`'A'\`。
- \`bool\`：布尔值，只有 \`true\` 和 \`false\` 两个值，占 1 字节。

### 四、object 与 dynamic

- \`object\`：所有类型的根类型。把值类型赋给 object 会发生**装箱**（详见下一章）。
- \`dynamic\`：动态类型，编译期不检查类型，运行期才解析。慎用，会丢失编译期类型安全。

### 五、字面量后缀

C# 整型字面量默认是 \`int\`，浮点默认是 \`double\`。如果需要其他类型，要加后缀：

| 后缀 | 类型 | 示例 |
| --- | --- | --- |
| L / l | long | 100L |
| U / u | uint | 100U |
| UL / ul | ulong | 100UL |
| F / f | float | 3.14F |
| D / d | double | 3.14D |
| M / m | decimal | 3.14M |

> 建议用大写后缀：\`L\` 比 \`l\` 清晰（小写 l 容易和 1 混淆）。

### 六、数字分隔符 _

C# 7 起可以用 \`_\` 作为数字分隔符，纯粹为了可读性，不影响值。

\`\`\`csharp
int million = 1_000_000;        // 等价于 1000000
long hex = 0xFF_FF_FF;          // 十六进制也能用
double pi = 3.141_592_653;      // 浮点也能用
\`\`\`

### 七、进制字面量

\`\`\`csharp
int dec = 255;          // 十进制
int hex = 0xFF;         // 十六进制，前缀 0x
int bin = 0b1111_1111;  // 二进制，前缀 0b（C# 7+）
\`\`\`

### 八、科学计数法

浮点数字面量可以用 \`e\` 表示 10 的幂：

\`\`\`csharp
double avogadro = 6.022e23;   // 6.022 × 10²³
double tiny = 1.6e-19;        // 1.6 × 10⁻¹⁹
\`\`\`

### 九、sizeof 与 MinValue / MaxValue

每个内置类型都暴露了 \`MinValue\` 和 \`MaxValue\` 静态字段，可以直接查询取值范围：

\`\`\`csharp
Console.WriteLine(int.MaxValue);    // 2147483647
Console.WriteLine(long.MinValue);   // -9223372036854775808
\`\`\`

\`sizeof\` 运算符返回类型占用的字节数（仅在 unsafe 上下文外可用于部分内置类型）：

\`\`\`csharp
Console.WriteLine(sizeof(int));     // 4
Console.WriteLine(sizeof(decimal)); // 16
\`\`\`

### 十、BitConverter 实用工具

\`BitConverter\` 可以在数值与字节数组之间转换，常用于二进制序列化、网络协议：

\`\`\`csharp
byte[] bytes = BitConverter.GetBytes(12345);
int value = BitConverter.ToInt32(bytes, 0);
\`\`\`

### 小结

- 整型默认用 \`int\`，超过 21 亿用 \`long\`。
- 金额用 \`decimal\`，科学计算用 \`double\`。
- 字面量后缀用大写：\`L\`、\`F\`、\`M\`。
- 善用 \`_\` 分隔符和 \`0b\`、\`0x\` 前缀提升可读性。`,
    code: `// 第七章 内置类型详解 —— 可在 .NET 8 控制台应用直接运行
using System.Globalization;

// ============================================================
// 1. 整型家族：8 种整型逐一演示
// ============================================================
sbyte sb = -128;                // 8 位带符号：-128 ~ 127
byte b = 255;                   // 8 位无符号：0 ~ 255
short s = -32768;               // 16 位带符号
ushort us = 65535;              // 16 位无符号
int i = 2147483647;             // 32 位带符号（最常用）
uint ui = 4294967295U;          // 32 位无符号，需 U 后缀
long l = 9223372036854775807L;  // 64 位带符号，需 L 后缀
ulong ul = 18446744073709551615UL; // 64 位无符号，需 UL 后缀

Console.WriteLine("===== 整型家族 =====");
Console.WriteLine($"sbyte  : {sb} ~ {sbyte.MaxValue}");
Console.WriteLine($"byte   : {b} ~ {byte.MaxValue}");
Console.WriteLine($"short  : {s} ~ {short.MaxValue}");
Console.WriteLine($"ushort : {us} ~ {ushort.MaxValue}");
Console.WriteLine($"int    : {i} ~ {int.MaxValue:N0}");
Console.WriteLine($"uint   : {ui} ~ {uint.MaxValue:N0}");
Console.WriteLine($"long   : {l} ~ {long.MaxValue:N0}");
Console.WriteLine($"ulong  : {ul} ~ {ulong.MaxValue:N0}");

// ============================================================
// 2. 浮点类型：float / double / decimal
// ============================================================
float f = 3.14F;                // 单精度，需 F 后缀，7 位有效数字
double d = 3.14159265358979;    // 双精度，默认浮点类型
decimal money = 199.99M;        // 高精度，需 M 后缀，财务场景必用

Console.WriteLine("\\n===== 浮点类型 =====");
Console.WriteLine($"float   : {f}（7 位有效数字）");
Console.WriteLine($"double  : {d}（15-16 位有效数字）");
Console.WriteLine($"decimal : {money}（28-29 位有效数字，金额必用）");

// 演示 double 的精度陷阱
double a = 0.1 + 0.2;           // double 计算可能产生微小误差
decimal c = 0.1m + 0.2m;        // decimal 精确计算
Console.WriteLine($"double 0.1 + 0.2 = {a}（注意末尾的 4）");
Console.WriteLine($"decimal 0.1m + 0.2m = {c}（精确）");

// ============================================================
// 3. 字符 char 与布尔 bool
// ============================================================
char ch = 'A';                  // 单个 Unicode 字符，单引号
char ch2 = '\\u4e2d';            // Unicode 转义：'中'
char ch3 = '\\t';                // 转义字符：制表符
bool isAdmin = true;            // 布尔值 true
bool isLogin = false;           // 布尔值 false

Console.WriteLine("\\n===== char 与 bool =====");
Console.WriteLine($"char 'A' = {ch}, 数字 = {(int)ch}");
Console.WriteLine($"char '\\\\u4e2d' = {ch2}");
Console.WriteLine($"bool isAdmin = {isAdmin}, isLogin = {isLogin}");

// ============================================================
// 4. object 与 dynamic 简介
// ============================================================
object obj1 = 42;               // 装箱：int → object
object obj2 = "hello";          // string 也是 object
Console.WriteLine("\\n===== object =====");
Console.WriteLine($"obj1 = {obj1}, 类型 = {obj1.GetType().Name}");
Console.WriteLine($"obj2 = {obj2}, 类型 = {obj2.GetType().Name}");

// dynamic：运行期才解析类型（慎用）
dynamic dyn = 100;
Console.WriteLine($"dynamic + 5 = {dyn + 5}");  // 编译期不检查
dyn = "now string";
Console.WriteLine($"dynamic 变成 string: {dyn.ToUpper()}");

// ============================================================
// 5. 字面量后缀演示
// ============================================================
long big = 100L;                // L 后缀：long
uint positive = 100U;           // U 后缀：uint
ulong huge = 100UL;             // UL 后缀：ulong
float pi = 3.14F;               // F 后缀：float
double e = 2.71D;               // D 后缀：double（可省略）
decimal price = 9.99M;          // M 后缀：decimal（money 的 M）

Console.WriteLine("\\n===== 字面量后缀 =====");
Console.WriteLine($"100L  → {big.GetType().Name} = {big}");
Console.WriteLine($"100U  → {positive.GetType().Name} = {positive}");
Console.WriteLine($"100UL → {huge.GetType().Name} = {huge}");
Console.WriteLine($"3.14F → {pi.GetType().Name} = {pi}");
Console.WriteLine($"2.71D → {e.GetType().Name} = {e}");
Console.WriteLine($"9.99M → {price.GetType().Name} = {price}");

// ============================================================
// 6. 数字分隔符 _ 与不同进制
// ============================================================
int million = 1_000_000;        // 下划线仅为可读性，等价 1000000
long creditCard = 6225_8888_9999_0000L; // 模拟卡号，更易读
int hex = 0xFF;                 // 十六进制：255
int bin = 0b1111_1111;          // 二进制：255
int rgb = 0xFF_88_44;           // 颜色值，分隔字节

Console.WriteLine("\\n===== 数字分隔符与进制 =====");
Console.WriteLine($"1_000_000 = {million:N0}");
Console.WriteLine($"卡号 6225_8888_9999_0000L = {creditCard:N0}");
Console.WriteLine($"0xFF = {hex}");
Console.WriteLine($"0b1111_1111 = {bin}");
Console.WriteLine($"0xFF_88_44 = {rgb}（颜色 RGB）");

// ============================================================
// 7. 科学计数法
// ============================================================
double avogadro = 6.022e23;     // 阿伏伽德罗常数
double electronMass = 9.109e-31; // 电子质量（kg）
Console.WriteLine("\\n===== 科学计数法 =====");
Console.WriteLine($"阿伏伽德罗常数 = {avogadro:E}");
Console.WriteLine($"电子质量 = {electronMass:E3} kg");

// ============================================================
// 8. MinValue / MaxValue / sizeof
// ============================================================
Console.WriteLine("\\n===== MinValue / MaxValue / sizeof =====");
Console.WriteLine($"int    范围：{int.MinValue} ~ {int.MaxValue}，sizeof = {sizeof(int)} 字节");
Console.WriteLine($"long   范围：{long.MinValue} ~ {long.MaxValue}，sizeof = {sizeof(long)} 字节");
Console.WriteLine($"double 范围：{double.MinValue:E} ~ {double.MaxValue:E}，sizeof = {sizeof(double)} 字节");
Console.WriteLine($"decimal 范围：{decimal.MinValue} ~ {decimal.MaxValue}，sizeof = {sizeof(decimal)} 字节");
Console.WriteLine($"char   范围：{(int)char.MinValue} ~ {(int)char.MaxValue}，sizeof = {sizeof(char)} 字节");

// ============================================================
// 9. BitConverter 工具演示
// ============================================================
Console.WriteLine("\\n===== BitConverter =====");
int number = 123456;
byte[] bytes = BitConverter.GetBytes(number);    // int → 4 字节小端序
Console.WriteLine($"int {number} 的字节序列：{BitConverter.ToString(bytes)}");
int restored = BitConverter.ToInt32(bytes, 0);  // 字节 → int
Console.WriteLine($"从字节还原 int = {restored}");

double dNum = 3.14;
byte[] dBytes = BitConverter.GetBytes(dNum);
Console.WriteLine($"double {dNum} 的字节序列：{BitConverter.ToString(dBytes)}");

// ============================================================
// 10. 整型溢出演示（不抛异常，环绕）
// ============================================================
Console.WriteLine("\\n===== 溢出环绕演示 =====");
int maxInt = int.MaxValue;
int overflow = maxInt + 1;      // 不开 checked 会环绕到最小值
Console.WriteLine($"int.MaxValue + 1 = {overflow}（环绕到最小值）");

checked
{
    try
    {
        int willThrow = maxInt + 1; // checked 块内会抛 OverflowException
    }
    catch (OverflowException ex)
    {
        Console.WriteLine($"checked 块捕获溢出：{ex.Message}");
    }
}`,
    lang: 'cs',
  },

  // ============================================================
  // 第八章 值类型与引用类型
  // ============================================================
  {
    id: 'csharp4-ch08',
    group: '第二部分 核心语法',
    icon: '⚖️',
    title: '值类型与引用类型',
    content: `## 第八章 值类型与引用类型

C# 的类型系统分两大阵营：**值类型**和**引用类型**。理解它们的差异，是写出正确、高效 C# 代码的关键。本章用图示和 demo 把这两个概念彻底讲透。

### 一、值类型与引用类型的分类

**值类型**（存放在栈上或嵌入所在对象内）：

- 结构体 \`struct\`：int、double、bool、DateTime、自定义 struct
- 枚举 \`enum\`
- 可空类型 \`int?\`、\`bool?\`
- 元组 \`Tuple\` / \`ValueTuple\`

**引用类型**（存放在堆上，变量保存的是引用地址）：

- 类 \`class\`
- 字符串 \`string\`（特殊：引用类型但表现像值类型）
- 数组 \`int[]\`、\`string[]\`
- 委托 \`delegate\`
- 接口 \`interface\`

### 二、栈 vs 堆：内存图示

\`\`\`
栈 Stack                       堆 Heap
+------------------+          +------------------+
| int a = 10;      |          |                  |
| double b = 3.14; |          | Person 对象       |
| Person p ────────┼─────────>|   Name = "Tom"   |
+------------------+          |   Age = 18       |
                              +------------------+
\`\`\`

- **栈**：先进后出，自动释放，存放值类型和引用的地址。访问快，容量小。
- **堆**：由 GC（垃圾回收器）管理，存放引用类型对象。容量大，访问比栈慢一点。

### 三、赋值语义：拷贝 vs 共享

**值类型赋值 = 拷贝整个数据**：

\`\`\`csharp
int a = 10;
int b = a;     // b 拷贝了 a 的值
b = 20;        // 改 b 不影响 a
// 现在 a=10, b=20
\`\`\`

**引用类型赋值 = 拷贝引用（指向同一对象）**：

\`\`\`csharp
var p1 = new Person { Name = "Tom" };
var p2 = p1;   // p2 和 p1 指向同一个 Person 对象
p2.Name = "Jerry";
// p1.Name 也变成 "Jerry"！
\`\`\`

这是新人最容易踩的坑：以为是拷贝，结果改了对方。

### 四、string 的特殊性

\`string\` 是引用类型，但表现像值类型：

\`\`\`csharp
string s1 = "hello";
string s2 = s1;
s2 = "world";
// s1 还是 "hello"，因为 string 不可变
\`\`\`

原因：string 是**不可变**的。任何修改 string 的操作都会创建新对象。详见第十章。

### 五、装箱与拆箱

**装箱 boxing**：把值类型转换成 \`object\` 或接口，会在堆上创建一个副本。

\`\`\`csharp
int n = 42;
object boxed = n;  // 装箱：在堆上创建 int 副本
\`\`\`

**拆箱 unboxing**：把 \`object\` 转回值类型。

\`\`\`csharp
object boxed = 42;
int m = (int)boxed; // 拆箱
\`\`\`

装箱和拆箱都会产生性能开销（堆分配 + 类型检查），高频路径要避免。用泛型集合 \`List<int>\` 而不是 \`ArrayList\` 就是这个原因。

### 六、object 类型

\`object\` 是所有类型的根。任何类型都可以赋值给 \`object\`：

\`\`\`csharp
object o1 = 42;       // int 装箱
object o2 = "hello";  // string 本身是引用
object o3 = new Person();
\`\`\`

### 七、is 关键字：判断类型

\`\`\`csharp
object o = "hello";
if (o is string s)
{
    Console.WriteLine(s.Length); // 模式匹配：转换 + 判空
}
\`\`\`

### 八、typeof 运算符

\`typeof\` 在编译期获取类型的 \`Type\` 对象，不需要实例：

\`\`\`csharp
Type t = typeof(int);
Console.WriteLine(t.Name); // Int32
\`\`\`

### 九、自定义 struct 与 class 的选择

- **struct**：小型、不可变、逻辑上是单个值（如坐标 Point、金额 Money）。赋值时拷贝，避免堆分配。
- **class**：可变、有继承关系、体积大。赋值时共享引用。

> 经验：默认用 \`class\`，除非有明确性能需求或语义上是「值」才用 \`struct\`。struct 用错容易踩「拷贝导致状态丢失」的坑。

### 小结

- 值类型拷贝数据，引用类型拷贝引用。
- string 是引用类型但不可变，表现像值类型。
- 装箱拆箱有性能开销，用泛型避免。
- \`is\` 判断类型，\`typeof\` 获取 Type。
- struct 用于小型值语义，class 用于对象。`,
    code: `// 第八章 值类型与引用类型 —— 可在 .NET 8 控制台应用直接运行
using System.Diagnostics;

// ============================================================
// 1. 值类型赋值 = 拷贝数据
// ============================================================
int a = 10;
int b = a;                  // b 拷贝了 a 的值
b = 999;                    // 修改 b 不影响 a
Console.WriteLine($"===== 值类型拷贝 =====");
Console.WriteLine($"a = {a}, b = {b}（修改 b 不影响 a）");

// 自定义 struct 演示值语义
var p1 = new Point { X = 1, Y = 2 };
var p2 = p1;                // struct 赋值 = 整体拷贝
p2.X = 100;                 // 修改 p2 不影响 p1
Console.WriteLine($"Point p1.X = {p1.X}, p2.X = {p2.X}（struct 也是值类型）");

// ============================================================
// 2. 引用类型赋值 = 拷贝引用（指向同一对象）
// ============================================================
var u1 = new User { Name = "Tom", Age = 18 };
var u2 = u1;                // u2 和 u1 指向堆上同一个对象
u2.Name = "Jerry";          // 修改 u2 实际改的是共享对象
Console.WriteLine($"\\n===== 引用类型共享 =====");
Console.WriteLine($"u1.Name = {u1.Name}, u2.Name = {u2.Name}（指向同一对象）");

// 数组也是引用类型
int[] arr1 = { 1, 2, 3 };
int[] arr2 = arr1;          // 共享同一数组
arr2[0] = 999;
Console.WriteLine($"arr1[0] = {arr1[0]}（数组是引用类型）");

// ============================================================
// 3. string 的特殊性：引用类型但不可变
// ============================================================
string s1 = "hello";
string s2 = s1;             // s2 和 s1 暂时指向同一对象
s2 = "world";               // 修改 s2 会创建新对象，s1 不变
Console.WriteLine($"\\n===== string 不可变性 =====");
Console.WriteLine($"s1 = {s1}, s2 = {s2}（string 修改会创建新对象）");

// string 方法调用也不修改原对象
string original = "Hello";
string upper = original.ToUpper();  // 返回新 string
Console.WriteLine($"original = {original}, upper = {upper}（ToUpper 不修改原值）");

// ============================================================
// 4. 装箱与拆箱
// ============================================================
int num = 42;
object boxed = num;         // 装箱：值类型 → object，在堆上创建副本
int unboxed = (int)boxed;   // 拆箱：object → 值类型
Console.WriteLine($"\\n===== 装箱拆箱 =====");
Console.WriteLine($"原值 = {num}, 装箱后 = {boxed}, 拆箱后 = {unboxed}");
Console.WriteLine($"boxed 类型 = {boxed.GetType().Name}（值类型被装箱成 object）");

// 错误的拆箱会抛异常
try
{
    object badBox = 42;
    long wrong = (long)badBox;  // ❌ 必须拆成原类型 int，不能直接 long
    Console.WriteLine(wrong);
}
catch (InvalidCastException ex)
{
    Console.WriteLine($"拆箱类型不匹配：{ex.Message}");
}

// ============================================================
// 5. 装箱性能对比：ArrayList vs List<int>
// ============================================================
Console.WriteLine($"\\n===== 装箱性能对比 =====");
var sw = Stopwatch.StartNew();
var arrayList = new System.Collections.ArrayList();
for (int k = 0; k < 1_000_000; k++)
{
    arrayList.Add(k);       // 每次 Add 都装箱（int → object）
}
sw.Stop();
Console.WriteLine($"ArrayList（每次装箱）100 万次：{sw.ElapsedMilliseconds} ms");

sw.Restart();
var list = new List<int>();
for (int k = 0; k < 1_000_000; k++)
{
    list.Add(k);            // 泛型 List<int> 无装箱
}
sw.Stop();
Console.WriteLine($"List<int>（无装箱）100 万次：{sw.ElapsedMilliseconds} ms");
Console.WriteLine("→ 高频路径务必用泛型集合！");

// ============================================================
// 6. is 关键字：判断类型 + 模式匹配
// ============================================================
Console.WriteLine($"\\n===== is 关键字 =====");
object[] objects = { 42, "hello", 3.14, true, new User { Name = "Anna", Age = 20 } };
foreach (object o in objects)
{
    if (o is int intVal)                // 模式匹配：是 int 就赋值给 intVal
    {
        Console.WriteLine($"是 int：{intVal}");
    }
    else if (o is string strVal)
    {
        Console.WriteLine($"是 string：{strVal}, 长度 {strVal.Length}");
    }
    else if (o is double dblVal)
    {
        Console.WriteLine($"是 double：{dblVal}");
    }
    else if (o is User user)
    {
        Console.WriteLine($"是 User：{user.Name}, {user.Age} 岁");
    }
    else
    {
        Console.WriteLine($"其他类型：{o.GetType().Name}");
    }
}

// is 还可以判断是否可转换
object maybeNull = null;
Console.WriteLine($"null is string: {maybeNull is string}（null 安全判断）");

// ============================================================
// 7. typeof 运算符：编译期获取类型
// ============================================================
Console.WriteLine($"\\n===== typeof =====");
Type intType = typeof(int);
Type stringType = typeof(string);
Type userType = typeof(User);
Console.WriteLine($"typeof(int)    = {intType.FullName}");
Console.WriteLine($"typeof(string) = {stringType.FullName}");
Console.WriteLine($"typeof(User)   = {userType.FullName}");
Console.WriteLine($"int 是值类型？{intType.IsValueType}");
Console.WriteLine($"string 是值类型？{stringType.IsValueType}");

// typeof vs GetType() 的区别
int x = 5;
Console.WriteLine($"typeof(int) == x.GetType() ? {typeof(int) == x.GetType()}");

// ============================================================
// 8. struct vs class 内存演示
// ============================================================
Console.WriteLine($"\\n===== struct vs class =====");
// struct：拷贝传参，原对象不受影响
var sp1 = new StructPoint { X = 10, Y = 20 };
var sp2 = sp1;              // 拷贝
ModifyStruct(sp1);          // 拷贝传参，修改不影响原值
Console.WriteLine($"struct 传参后 sp1.X = {sp1.X}（未变）");

// class：引用传参，原对象被修改
var cp1 = new ClassPoint { X = 10, Y = 20 };
var cp2 = cp1;              // 共享引用
ModifyClass(cp1);           // 引用传参，修改原对象
Console.WriteLine($"class 传参后 cp1.X = {cp1.X}（已变）");

// ============================================================
// 类型声明放在文件末尾
// ============================================================

// struct：值类型
struct Point
{
    public int X;
    public int Y;
}

// class：引用类型
class User
{
    public string Name { get; set; }
    public int Age { get; set; }
}

class ClassPoint
{
    public int X;
    public int Y;
}

struct StructPoint
{
    public int X;
    public int Y;
}

// 修改 struct 的方法（值传递，不影响原值）
void ModifyStruct(StructPoint p)
{
    p.X = 999;
}

// 修改 class 的方法（引用传递，影响原对象）
void ModifyClass(ClassPoint p)
{
    p.X = 999;
}`,
    lang: 'cs',
  },

  // ============================================================
  // 第九章 运算符
  // ============================================================
  {
    id: 'csharp4-ch09',
    group: '第二部分 核心语法',
    icon: '➕',
    title: '运算符',
    content: `## 第九章 运算符

运算符是程序里「做计算」的工具。C# 的运算符种类繁多，从加减乘除到位移、从条件判断到 null 处理，本章一次性讲清楚。

### 一、算术运算符

\`\`\`csharp
+   加         -   减         *   乘         /   除
%   取余       ++  自增       --  自减
\`\`\`

注意：

- 整数除法会截断小数：\`7 / 2 = 3\`，要小数得写成 \`7.0 / 2\` 或 \`7 / 2.0\`。
- 取余 \`%\` 结果符号与被除数一致：\`-7 % 3 = -1\`。
- \`++\` 前置先加再用，后置先用再加。

### 二、关系运算符

\`\`\`csharp
==  等于       !=  不等于
>   大于       <   小于
>=  大于等于   <=  小于等于
\`\`\`

结果总是 \`bool\`。注意浮点比较：\`0.1 + 0.2 == 0.3\` 是 \`false\`，要比较用 \`Math.Abs(a - b) < 1e-9\`。

### 三、逻辑运算符

| 运算符 | 含义 | 说明 |
| --- | --- | --- |
| && | 短路与 | 左边 false 时右边不计算 |
| \|\| | 短路或 | 左边 true 时右边不计算 |
| ! | 非 | 取反 |
| & | 逻辑与 | 不短路，两边都算 |
| \| | 逻辑或 | 不短路，两边都算 |
| ^ | 异或 | 两边不同为 true |

> 日常用 \`&&\` 和 \`||\`，\`&\` \`|\` 主要用于位运算或需要副作用的场景。

### 四、位运算符

\`\`\`csharp
&   按位与     |   按位或     ^   按位异或
~   按位取反   <<  左移       >>  右移
\`\`\`

常见用途：

- 权限标志位：\`Flags = Read | Write | Execute\`。
- 颜色运算：\`0xFF & 0x0F = 0x0F\`。
- 高性能乘除 2 的幂：\`x << 2\` 等价 \`x * 4\`。

### 五、赋值运算符

\`\`\`csharp
=   赋值       +=  加后赋值     -=  减后赋值
*=  乘后赋值   /=  除后赋值     %=  取余后赋值
&=  位与赋值   |=  位或赋值     ^=  位异或赋值
<<= 左移赋值   >>= 右移赋值
??= null 合并赋值（C# 8+）
\`\`\`

### 六、条件运算符 ?:

唯一的三目运算符：\`condition ? a : b\`。

\`\`\`csharp
string msg = score >= 60 ? "及格" : "不及格";
\`\`\`

### 七、null 合并运算符 ??

\`a ?? b\`：如果 \`a\` 不为 null，返回 \`a\`；否则返回 \`b\`。

\`\`\`csharp
string name = input ?? "匿名";     // input 为 null 时用 "匿名"
\`\`\`

\`??=\` 是赋值版本：\`name ??= "默认"\` 等价 \`if (name == null) name = "默认";\`。

### 八、null 条件运算符 ?.

\`a?.Member\`：如果 \`a\` 为 null，整个表达式返回 null，不会抛 \`NullReferenceException\`。

\`\`\`csharp
int? length = str?.Length;          // str 为 null 时 length 为 null
string upper = user?.Name?.ToUpper(); // 链式调用更安全
\`\`\`

注意返回类型会变成可空（\`int?\`）。

### 九、typeof 与 sizeof

\`\`\`csharp
Type t = typeof(int);        // 编译期类型
int size = sizeof(int);      // 字节数（unsafe 上下文外仅限部分内置类型）
\`\`\`

### 十、is 与 as

- \`is\`：判断对象是否可转换为某类型，返回 bool。
- \`as\`：尝试转换，成功返回转换结果，失败返回 null（不抛异常）。

\`\`\`csharp
if (o is string s) { ... }
string str = o as string;  // 失败返回 null
\`\`\`

### 十一、取地址 & 与解引用 *（仅 unsafe）

\`\`\`csharp
unsafe {
    int x = 10;
    int* p = &x;     // 取地址
    *p = 20;         // 解引用
}
\`\`\`

普通业务代码用不到，仅在高性能场景或与原生 API 交互时使用。

### 十二、运算符优先级

简化版从高到低：

1. 括号 \`()\`
2. 一元：\`++\` \`--\` \`!\` \`~\`
3. 算术：\`*\` \`/\` \`%\` → \`+\` \`-\`
4. 位移：\`<<\` \`>>\`
5. 关系：\`<\` \`>\` \`<=\` \`>=\` \`is\` \`as\`
6. 相等：\`==\` \`!=\`
7. 位与 \`&\` → 位异或 \`^\` → 位或 \`|\`
8. 逻辑与 \`&&\` → 逻辑或 \`||\`
9. null 合并 \`??\`
10. 条件 \`?:\`
11. 赋值 \`=\` \`+=\` 等

> 实战建议：拿不准就加括号，可读性比优先级记忆更重要。

### 十三、可重载运算符

C# 允许自定义类型重载运算符：

\`\`\`csharp
public static Vector operator +(Vector a, Vector b) => new(a.X + b.X, a.Y + b.Y);
\`\`\`

可重载：\`+\` \`-\` \`*\` \`/\` \`%\` \`==\` \`!=\` \`<\` \`>\` 等。不可重载：\`&&\` \`||\` \`?:\`。

### 小结

- 算术注意整数除法和浮点比较。
- 逻辑用 \`&&\` \`||\` 短路版本。
- null 处理三件套：\`??\` \`?.\` \`??=\`。
- \`is\` 判断、\`as\` 转换、\`typeof\` 取类型。
- 优先级记不清就加括号。`,
    code: `// 第九章 运算符 —— 可在 .NET 8 控制台应用直接运行
using System.Diagnostics;

// ============================================================
// 1. 算术运算符
// ============================================================
Console.WriteLine("===== 算术运算符 =====");
int a = 17, b = 5;
Console.WriteLine($"a + b = {a + b}");   // 22
Console.WriteLine($"a - b = {a - b}");   // 12
Console.WriteLine($"a * b = {a * b}");   // 85
Console.WriteLine($"a / b = {a / b}");   // 3（整数除法，截断小数）
Console.WriteLine($"a / (double)b = {a / (double)b}"); // 3.4（转浮点除法）
Console.WriteLine($"a % b = {a % b}");   // 2（取余）

// 自增自减：前置与后置
int n = 5;
Console.WriteLine($"n++ = {n++}, 之后 n = {n}"); // 先用再加：5, 之后 6
Console.WriteLine($"++n = {++n}, 之后 n = {n}"); // 先加再用：7, 之后 7

// 负数取余的符号
Console.WriteLine($"-7 % 3 = {-7 % 3}"); // -1（符号跟被除数）

// ============================================================
// 2. 关系运算符
// ============================================================
Console.WriteLine("\\n===== 关系运算符 =====");
int x = 10, y = 20;
Console.WriteLine($"x == y : {x == y}");  // False
Console.WriteLine($"x != y : {x != y}");  // True
Console.WriteLine($"x > y  : {x > y}");   // False
Console.WriteLine($"x <= y : {x <= y}");  // True

// 浮点比较陷阱
double d1 = 0.1 + 0.2;
double d2 = 0.3;
Console.WriteLine($"0.1 + 0.2 == 0.3 ? {d1 == d2}（精度陷阱）");
Console.WriteLine($"近似比较：{Math.Abs(d1 - d2) < 1e-9}（推荐做法）");

// 字符串相等比较（用 == 即可，C# 已重载）
string s1 = "hello", s2 = "hello";
Console.WriteLine($"s1 == s2 : {s1 == s2}（值相等）");

// ============================================================
// 3. 逻辑运算符
// ============================================================
Console.WriteLine("\\n===== 逻辑运算符 =====");
bool t = true, f = false;
Console.WriteLine($"t && f : {t && f}");   // False
Console.WriteLine($"t || f : {t || f}");   // True
Console.WriteLine($"!t    : {!t}");        // False
Console.WriteLine($"t ^ f  : {t ^ f}");    // True（异或）

// 短路演示
bool CheckRight() { Console.WriteLine("  -> 右边被计算"); return true; }
Console.WriteLine("短路或：");
if (t || CheckRight()) { Console.WriteLine("  左边 true，右边被跳过"); }

Console.WriteLine("非短路或（用单竖线）：");
if (t | CheckRight()) { Console.WriteLine("  右边也会被计算"); }

// ============================================================
// 4. 位运算符
// ============================================================
Console.WriteLine("\\n===== 位运算符 =====");
int p = 0b1010;  // 10
int q = 0b1100;  // 12
Console.WriteLine($"p & q  = {p & q}  (0b{Convert.ToString(p & q, 2)})");  // 8  = 1000
Console.WriteLine($"p | q  = {p | q}  (0b{Convert.ToString(p | q, 2)})");  // 14 = 1110
Console.WriteLine($"p ^ q  = {p ^ q}  (0b{Convert.ToString(p ^ q, 2)})");  // 6  = 0110
Console.WriteLine($"~p     = {~p}");                                         // -11
Console.WriteLine($"p << 2 = {p << 2}"); // 左移 2 位 = 40（×4）
Console.WriteLine($"p >> 1 = {p >> 1}"); // 右移 1 位 = 5（÷2）

// 权限标志位实战
Permission perm = Permission.Read | Permission.Write;
Console.WriteLine($"权限：{perm}");
Console.WriteLine($"包含 Read？{(perm & Permission.Read) != 0}");
Console.WriteLine($"包含 Execute？{(perm & Permission.Execute) != 0}");

// ============================================================
// 5. 赋值运算符
// ============================================================
Console.WriteLine("\\n===== 赋值运算符 =====");
int v = 10;
v += 5;  Console.WriteLine($"v += 5  → {v}"); // 15
v -= 3;  Console.WriteLine($"v -= 3  → {v}"); // 12
v *= 2;  Console.WriteLine($"v *= 2  → {v}"); // 24
v /= 5;  Console.WriteLine($"v /= 5  → {v}"); // 4
v %= 3;  Console.WriteLine($"v %= 3  → {v}"); // 1

v = 0b1010;
v <<= 2; Console.WriteLine($"v <<= 2 → {v}"); // 40
v >>= 1; Console.WriteLine($"v >>= 1 → {v}"); // 20

// ??= null 合并赋值
string name = null;
name ??= "默认名";   // name 为 null 才赋值
Console.WriteLine($"name ??= 后 = {name}");
name ??= "不会被覆盖";
Console.WriteLine($"name ??= 再次 = {name}");

// ============================================================
// 6. 条件运算符 ?:
// ============================================================
Console.WriteLine("\\n===== 条件运算符 ?: =====");
int score = 75;
string level = score >= 90 ? "优秀" : score >= 60 ? "及格" : "不及格";
Console.WriteLine($"分数 {score} → {level}");

// ============================================================
// 7. null 合并运算符 ??
// ============================================================
Console.WriteLine("\\n===== null 合并运算符 ?? =====");
string input = null;
string displayName = input ?? "匿名用户";    // input 为 null 用默认值
Console.WriteLine($"显示名 = {displayName}");

int? age = null;
int realAge = age ?? 0;                       // 可空 int 用 ?? 提供默认值
Console.WriteLine($"年龄 = {realAge}");

// 链式 ??
string nickname = null, realName = null, fallback = "游客";
string final = nickname ?? realName ?? fallback;
Console.WriteLine($"链式 ?? = {final}");

// ============================================================
// 8. null 条件运算符 ?.
// ============================================================
Console.WriteLine("\\n===== null 条件运算符 ?. =====");
User user = null;
int? nameLen = user?.Name?.Length;            // 链式 ?.，任一为 null 则整体 null
Console.WriteLine($"user?.Name?.Length = {nameLen?.ToString() ?? "null"}");

user = new User { Name = "Tom" };
int? len2 = user?.Name?.Length;
Console.WriteLine($"非空时 user?.Name?.Length = {len2}");

// ?. 配合 ?? 是常见模式
int safeLen = user?.Name?.Length ?? 0;
Console.WriteLine($"?. 配合 ?? = {safeLen}");

// ?. 调用方法
user?.SayHello();                             // user 非 null 才调用
User nullUser = null;
nullUser?.SayHello();                         // 不会抛异常

// ============================================================
// 9. typeof 与 sizeof
// ============================================================
Console.WriteLine("\\n===== typeof 与 sizeof =====");
Console.WriteLine($"typeof(int)    = {typeof(int).Name}");
Console.WriteLine($"typeof(string) = {typeof(string).Name}");
Console.WriteLine($"sizeof(int)    = {sizeof(int)} 字节");
Console.WriteLine($"sizeof(long)   = {sizeof(long)} 字节");
Console.WriteLine($"sizeof(decimal)= {sizeof(decimal)} 字节");

// ============================================================
// 10. is 与 as
// ============================================================
Console.WriteLine("\\n===== is 与 as =====");
object o1 = "hello world";
object o2 = 42;
object o3 = new User { Name = "Anna" };

// is 模式匹配
if (o1 is string s) Console.WriteLine($"o1 是 string：{s.Length} 字符");
if (o2 is int i)    Console.WriteLine($"o2 是 int：{i + 100}");

// as 转换
string asStr = o1 as string;
Console.WriteLine($"o1 as string = {asStr ?? "null"}");
string asStr2 = o2 as string;   // 转换失败返回 null
Console.WriteLine($"o2 as string = {asStr2?.ToString() ?? "null（转换失败）"}");

// ============================================================
// 11. 运算符优先级演示
// ============================================================
Console.WriteLine("\\n===== 运算符优先级 =====");
int r1 = 2 + 3 * 4;          // 14：先乘后加
int r2 = (2 + 3) * 4;        // 20：括号改变优先级
bool r3 = 1 < 2 && 3 > 4;    // False：关系优先于逻辑
bool r4 = 1 < 2 || 3 > 4;    // True
Console.WriteLine($"2 + 3 * 4 = {r1}");
Console.WriteLine($"(2 + 3) * 4 = {r2}");
Console.WriteLine($"1<2 && 3>4 = {r3}");
Console.WriteLine($"1<2 || 3>4 = {r4}");

// ============================================================
// 12. 可重载运算符演示
// ============================================================
Console.WriteLine("\\n===== 可重载运算符 =====");
var v1 = new Vector(3, 4);
var v2 = new Vector(1, 2);
var sum = v1 + v2;            // 使用重载的 +
var diff = v1 - v2;           // 使用重载的 -
Console.WriteLine($"v1 = {v1}, v2 = {v2}");
Console.WriteLine($"v1 + v2 = {sum}");
Console.WriteLine($"v1 - v2 = {diff}");
Console.WriteLine($"v1 == v2 ? {v1 == v2}");
var v3 = new Vector(3, 4);
Console.WriteLine($"v1 == v3 ? {v1 == v3}");

// ============================================================
// 类型声明放在文件末尾
// ============================================================

// 权限标志位枚举
[Flags]
enum Permission
{
    None    = 0,
    Read    = 1,
    Write   = 2,
    Execute = 4,
}

// 演示运算符重载的 Vector
class Vector
{
    public double X { get; }
    public double Y { get; }

    public Vector(double x, double y) { X = x; Y = y; }

    // 重载 + 运算符
    public static Vector operator +(Vector a, Vector b) => new(a.X + b.X, a.Y + b.Y);

    // 重载 - 运算符
    public static Vector operator -(Vector a, Vector b) => new(a.X - b.X, a.Y - b.Y);

    // 重载 == 运算符（必须同时重载 !=）
    public static bool operator ==(Vector a, Vector b) =>
        a is null ? b is null : (b is not null && a.X == b.X && a.Y == b.Y);

    public static bool operator !=(Vector a, Vector b) => !(a == b);

    public override bool Equals(object obj) => obj is Vector v && this == v;
    public override int GetHashCode() => HashCode.Combine(X, Y);
    public override string ToString() => $"({X}, {Y})";
}

class User
{
    public string Name { get; set; }
    public int Age { get; set; }
    public void SayHello() => Console.WriteLine($"Hello, I'm {Name}");
}`,
    lang: 'cs',
  },

  // ============================================================
  // 第十章 字符串详解
  // ============================================================
  {
    id: 'csharp4-ch10',
    group: '第二部分 核心语法',
    icon: '📝',
    title: '字符串详解',
    content: `## 第十章 字符串详解

字符串是日常开发使用频率最高的类型之一。C# 的 \`string\` 看似简单，其实有大量细节：不可变、驻留、性能、各种 API。本章系统讲清楚。

### 一、string 的不可变性

\`string\` 一旦创建，内容就不能被修改。所有「修改」操作（\`ToUpper\`、\`Substring\`、\`Replace\`）都返回**新的 string 对象**。

\`\`\`csharp
string s = "hello";
string upper = s.ToUpper();  // 返回新对象 "HELLO"
// s 仍然是 "hello"
\`\`\`

为什么要不可变？

1. **线程安全**：多个线程读同一 string 不会出问题。
2. **哈希稳定**：string 的 GetHashCode 结果固定，可作字典 key。
3. **共享安全**：多个变量指向同一 string 互不影响。
4. **字符串驻留**：相同的字面量在内存中只存一份。

### 二、字符串创建

\`\`\`csharp
string s1 = "hello";                       // 字面量
string s2 = new string('a', 5);            // "aaaaa"
string s3 = string.Concat("a", "b", "c");  // "abc"
string s4 = string.Join(",", new[] { 1, 2, 3 }); // "1,2,3"
\`\`\`

### 三、字符串长度与字符索引

\`\`\`csharp
string s = "hello";
int len = s.Length;          // 5
char c = s[0];               // 'h'（索引从 0 开始）
char last = s[^1];           // 'o'（C# 8+ 索引运算符）
\`\`\`

### 四、字符串拼接

| 方式 | 适用场景 | 性能 |
| --- | --- | --- |
| + / += | 少量拼接 | 中等 |
| string.Concat | 多个变量拼接 | 较快 |
| string.Join | 集合拼接（带分隔符） | 较快 |
| StringBuilder | 循环内大量拼接 | 最佳 |

> 重要：循环里用 \`+=\` 拼接字符串是性能杀手，每次都会创建新对象。务必用 \`StringBuilder\`。

### 五、字符串比较

- \`==\` 和 \`!=\`：值比较（C# 已重载，比较内容）。
- \`string.Equals(a, b)\`：等价 \`==\`。
- \`string.Compare(a, b)\`：返回 -1/0/1，用于排序。
- \`string.Equals(a, b, StringComparison.OrdinalIgnoreCase)\`：忽略大小写。

> 推荐显式指定 \`StringComparison\`，避免依赖当前文化导致 bug。

### 六、大小写转换

\`\`\`csharp
"hello".ToUpper();      // "HELLO"
"HELLO".ToLower();      // "hello"
\`\`\`

### 七、字符串查找

\`\`\`csharp
s.Contains("ell");          // 是否包含
s.StartsWith("he");        // 是否以某串开头
s.EndsWith("lo");          // 是否以某串结尾
s.IndexOf("l");            // 首次出现的索引（找不到返回 -1）
s.LastIndexOf("l");        // 最后一次出现的索引
\`\`\`

### 八、字符串截取

\`\`\`csharp
s.Substring(1);             // 从索引 1 到末尾
s.Substring(1, 3);          // 从索引 1 取 3 个字符
s[1..4];                    // 范围运算符：索引 1 到 3
s[^3..];                    // 最后 3 个字符
\`\`\`

### 九、分割与合并

\`\`\`csharp
string[] parts = "a,b,c".Split(',');           // ["a","b","c"]
string[] parts2 = "a,,b".Split(',', StringSplitOptions.RemoveEmptyEntries);
string joined = string.Join("-", parts);       // "a-b-c"
\`\`\`

### 十、修剪 Trim

\`\`\`csharp
"  hi  ".Trim();       // "hi"（去两端空白）
"  hi  ".TrimStart();  // "hi  "
"  hi  ".TrimEnd();    // "  hi"
"###hi###".Trim('#');  // "hi"（去指定字符）
\`\`\`

### 十一、替换 Replace

\`\`\`csharp
"hello".Replace("l", "L");    // "heLLo"
"hello".Replace('e', 'E');    // "hEllo"
\`\`\`

### 十二、插入与删除

\`\`\`csharp
"hello".Insert(2, "XX");    // "heXXllo"
"hello".Remove(1, 2);       // "hlo"（从索引 1 删 2 个字符）
\`\`\`

### 十三、StringBuilder 详解

\`StringBuilder\` 用于频繁修改字符串的场景，内部维护字符缓冲区，避免每次创建新对象。

\`\`\`csharp
var sb = new StringBuilder();
sb.Append("hello");
sb.AppendLine("world");
sb.AppendFormat("数字 {0}", 42);
string result = sb.ToString();
\`\`\`

常用 API：

- \`Append\`：追加字符串。
- \`AppendLine\`：追加并换行。
- \`AppendFormat\`：格式化追加。
- \`Insert\` / \`Remove\` / \`Replace\`：修改内容。
- \`Clear\`：清空。

### 十四、字符串驻留 intern

CLR 维护一张「驻留池」，相同字面量的 string 在内存中只存一份：

\`\`\`csharp
string a = "hello";
string b = "hello";
Console.WriteLine(ReferenceEquals(a, b)); // True（同一引用）
\`\`\`

可以用 \`string.Intern\` 手动驻留：\`string.Intern(new string("hello".ToCharArray()))\`。

### 十五、转义字符与 verbatim 字符串

常见转义：\`\\\\n\`（换行）、\`\\\\t\`（制表）、\`\\\\"\`（双引号）、\`\\\\\\\\\`（反斜杠）。

\`@"..."\` 是 verbatim 字符串，忽略转义，常用于文件路径、正则表达式：

\`\`\`csharp
string path = @"C:\\Users\\Tom\\file.txt";  // 不用转义反斜杠
string multi = @"
多行
文本";
\`\`\`

### 十六、空判断三件套

\`\`\`csharp
string.IsNullOrEmpty(s);     // null 或 ""
string.IsNullOrWhiteSpace(s); // null 或 "" 或只有空白字符
\`\`\`

实战中优先用 \`IsNullOrWhiteSpace\`，更严格。

### 小结

- string 不可变，所有修改都返回新对象。
- 循环拼接用 \`StringBuilder\`，否则用 \`+\` 即可。
- 比较显式指定 \`StringComparison\`。
- 空判断用 \`IsNullOrWhiteSpace\`。
- 路径、正则用 \`@"..."\`。`,
    code: `// 第十章 字符串详解 —— 可在 .NET 8 控制台应用直接运行
using System.Diagnostics;
using System.Text;

// ============================================================
// 1. 字符串不可变性演示
// ============================================================
Console.WriteLine("===== string 不可变性 =====");
string s = "hello";
string upper = s.ToUpper();        // 返回新对象，不修改 s
Console.WriteLine($"原字符串 s = {s}");
Console.WriteLine($"ToUpper 后 = {upper}");
Console.WriteLine($"s 引用未变：{ReferenceEquals(s, upper) is false}");

// ============================================================
// 2. 字符串创建方式
// ============================================================
Console.WriteLine("\\n===== 字符串创建 =====");
string s1 = "hello";                              // 字面量
string s2 = new string('a', 5);                   // "aaaaa"
string s3 = string.Concat("a", "b", "c");         // "abc"
string s4 = string.Join("-", new[] { 1, 2, 3 });  // "1-2-3"
string s5 = new string(new[] { 'X', 'Y' });       // "XY"
Console.WriteLine($"s1 = {s1}");
Console.WriteLine($"s2 = {s2}");
Console.WriteLine($"s3 = {s3}");
Console.WriteLine($"s4 = {s4}");
Console.WriteLine($"s5 = {s5}");

// ============================================================
// 3. 长度与字符索引
// ============================================================
Console.WriteLine("\\n===== 长度与索引 =====");
string txt = "Hello, 世界";
Console.WriteLine($"txt = {txt}");
Console.WriteLine($"txt.Length = {txt.Length}");  // 注意：字符数，不是字节数
Console.WriteLine($"txt[0] = {txt[0]}");          // 'H'
Console.WriteLine($"txt[^1] = {txt[^1]}");        // '界'（最后一个字符）
Console.WriteLine($"txt[7..] = {txt[7..]}");      // "世界"（从索引 7 到末尾）

// ============================================================
// 4. 字符串拼接方式对比
// ============================================================
Console.WriteLine("\\n===== 拼接方式 =====");
string plus = "a" + "b" + "c";                          // + 拼接
string concat = string.Concat("a", "b", "c");           // Concat
string join = string.Join("/", "a", "b", "c");          // Join 带分隔符
string interp = $"用户：{plus}";                          // 插值拼接
Console.WriteLine($"+ 拼接 = {plus}");
Console.WriteLine($"Concat = {concat}");
Console.WriteLine($"Join = {join}");
Console.WriteLine($"插值 = {interp}");

// ============================================================
// 5. 字符串比较
// ============================================================
Console.WriteLine("\\n===== 字符串比较 =====");
string a = "Hello", b = "hello";
Console.WriteLine($"a == b（区分大小写）：{a == b}");        // False
Console.WriteLine($"Equals OrdinalIgnoreCase：{string.Equals(a, b, StringComparison.OrdinalIgnoreCase)}"); // True
Console.WriteLine($"Compare 返回：{string.Compare(a, b, StringComparison.OrdinalIgnoreCase)}"); // 0

// 字符串排序演示
var names = new[] { "Banana", "apple", "Cherry" };
Array.Sort(names, StringComparer.OrdinalIgnoreCase);
Console.WriteLine($"排序后：{string.Join(", ", names)}");

// ============================================================
// 6. 大小写转换
// ============================================================
Console.WriteLine("\\n===== 大小写转换 =====");
Console.WriteLine($"\"Hello\" 大写 = {"Hello".ToUpper()}");
Console.WriteLine($"\"Hello\" 小写 = {"Hello".ToLower()}");

// ============================================================
// 7. 字符串查找
// ============================================================
Console.WriteLine("\\n===== 字符串查找 =====");
string sentence = "The quick brown fox jumps over the lazy dog";
Console.WriteLine($"句子：{sentence}");
Console.WriteLine($"Contains(\"fox\") = {sentence.Contains("fox")}");
Console.WriteLine($"Contains(\"cat\") = {sentence.Contains("cat")}");
Console.WriteLine($"StartsWith(\"The\") = {sentence.StartsWith("The")}");
Console.WriteLine($"EndsWith(\"dog\") = {sentence.EndsWith("dog")}");
Console.WriteLine($"IndexOf(\"the\") = {sentence.IndexOf("the")}（区分大小写）");
Console.WriteLine($"IndexOf(\"the\", OrdinalIgnoreCase) = {sentence.IndexOf("the", StringComparison.OrdinalIgnoreCase)}");
Console.WriteLine($"LastIndexOf(\"the\") = {sentence.LastIndexOf("the", StringComparison.OrdinalIgnoreCase)}");

// ============================================================
// 8. 字符串截取
// ============================================================
Console.WriteLine("\\n===== 字符串截取 =====");
string sub = "Hello, World";
Console.WriteLine($"原文：{sub}");
Console.WriteLine($"Substring(7) = {sub.Substring(7)}");          // "World"
Console.WriteLine($"Substring(0, 5) = {sub.Substring(0, 5)}");    // "Hello"
Console.WriteLine($"sub[7..] = {sub[7..]}");                      // "World"
Console.WriteLine($"sub[0..5] = {sub[0..5]}");                    // "Hello"
Console.WriteLine($"sub[^5..] = {sub[^5..]}");                    // "World"
Console.WriteLine($"sub[^6..^1] = {sub[^6..^1]}");                // "Worl"

// ============================================================
// 9. 分割与合并
// ============================================================
Console.WriteLine("\\n===== 分割与合并 =====");
string csv = "Tom,25,Engineer,Beijing";
string[] parts = csv.Split(',');
Console.WriteLine($"Split(',') = [{string.Join(" | ", parts)}]");

string csv2 = "Tom,,25,,Engineer";
string[] parts2 = csv2.Split(',', StringSplitOptions.RemoveEmptyEntries);
Console.WriteLine($"Split(去掉空项) = [{string.Join(" | ", parts2)}]");

string joined = string.Join(" - ", parts);
Console.WriteLine($"Join = {joined}");

// 多分隔符
string mixed = "a,b;c|d";
string[] multiParts = mixed.Split(new[] { ',', ';', '|' });
Console.WriteLine($"多分隔符 = [{string.Join(" | ", multiParts)}]");

// ============================================================
// 10. 修剪 Trim
// ============================================================
Console.WriteLine("\\n===== 修剪 Trim =====");
string raw = "   hello world   ";
Console.WriteLine($"原文：[{raw}]");
Console.WriteLine($"Trim() = [{raw.Trim()}]");
Console.WriteLine($"TrimStart() = [{raw.TrimStart()}]");
Console.WriteLine($"TrimEnd() = [{raw.TrimEnd()}]");
Console.WriteLine($"Trim('h','d',' ') = [{"hello world   d".Trim('h', 'd', ' ')}]");

// ============================================================
// 11. 替换 Replace
// ============================================================
Console.WriteLine("\\n===== 替换 Replace =====");
Console.WriteLine($"{"hello".Replace("l", "L")}");        // "heLLo"
Console.WriteLine($"{"hello".Replace('e', 'E')}");        // "hEllo"
Console.WriteLine($"{"a-b-c".Replace("-", "_")}");        // "a_b_c"

// ============================================================
// 12. 插入与删除
// ============================================================
Console.WriteLine("\\n===== 插入与删除 =====");
Console.WriteLine($"{"hello".Insert(2, "XX")}");          // "heXXllo"
Console.WriteLine($"{"hello".Remove(1, 2)}");             // "hlo"
Console.WriteLine($"{"hello".Remove(2)}");                // "he"（保留前 2 个）

// ============================================================
// 13. StringBuilder 详解
// ============================================================
Console.WriteLine("\\n===== StringBuilder =====");
var sb = new StringBuilder();
sb.Append("Hello");                            // 追加字符串
sb.Append(' ');                                // 追加字符
sb.AppendLine("World");                        // 追加并换行
sb.AppendFormat("数字：{0}, 字符串：{1}", 42, "hi"); // 格式化追加
sb.AppendLine();
sb.Append("结尾");
string result = sb.ToString();
Console.WriteLine(result);
Console.WriteLine($"StringBuilder 长度：{sb.Length}，容量：{sb.Capacity}");

// 修改 StringBuilder 内容
sb.Replace("World", "C#");
sb.Insert(0, ">> ");
Console.WriteLine($"修改后：{sb}");

// ============================================================
// 14. StringBuilder 性能对比
// ============================================================
Console.WriteLine("\\n===== 性能对比：+= vs StringBuilder =====");
const int N = 100_000;
var sw = Stopwatch.StartNew();
string bad = "";
for (int k = 0; k < N; k++) bad += "x";   // 每次创建新对象
sw.Stop();
Console.WriteLine($"string += {N} 次：{sw.ElapsedMilliseconds} ms");

sw.Restart();
var sb2 = new StringBuilder();
for (int k = 0; k < N; k++) sb2.Append('x');  // 复用缓冲区
string good = sb2.ToString();
sw.Stop();
Console.WriteLine($"StringBuilder {N} 次：{sw.ElapsedMilliseconds} ms");
Console.WriteLine($"两者结果长度相同：{bad.Length == good.Length}");

// ============================================================
// 15. 字符串驻留 intern
// ============================================================
Console.WriteLine("\\n===== 字符串驻留 =====");
string lit1 = "interned";
string lit2 = "interned";
Console.WriteLine($"两个字面量同一引用：{ReferenceEquals(lit1, lit2)}"); // True

// 运行时拼接的不驻留
string concat2 = "inter" + "ned";
Console.WriteLine($"拼接结果同一引用：{ReferenceEquals(lit1, concat2)}");

// 手动驻留
string interned = string.Intern(concat2);
Console.WriteLine($"Intern 后同一引用：{ReferenceEquals(lit1, interned)}");

// ============================================================
// 16. 转义字符与 verbatim 字符串
// ============================================================
Console.WriteLine("\\n===== 转义与 verbatim =====");
string escaped = "C:\\\\Users\\\\Tom\\\\file.txt";      // 双反斜杠转义
string verbatim = @"C:\\Users\\Tom\\file.txt";         // verbatim 写法
Console.WriteLine($"转义：{escaped}");
Console.WriteLine($"verbatim：{verbatim}");
Console.WriteLine($"两者相等：{escaped == verbatim}");

string json = "{ \\"name\\": \\"Tom\\", \\"age\\": 18 }"; // 转义双引号
string jsonVerbatim = @"{ ""name"": ""Tom"", ""age"": 18 }"; // verbatim 双引号写两次
Console.WriteLine($"JSON 转义：{json}");
Console.WriteLine($"JSON verbatim：{jsonVerbatim}");

string multi = @"
第一行
第二行
第三行";
Console.WriteLine($"多行 verbatim：\\n{multi}");

// ============================================================
// 17. 空判断三件套
// ============================================================
Console.WriteLine("\\n===== 空判断 =====");
string[] testCases = { null, "", "   ", "\\t\\n", "hello" };
foreach (string testCase in testCases)
{
    Console.WriteLine($"[{testCase ?? "null"}] -> " +
        $"IsNullOrEmpty={string.IsNullOrEmpty(testCase)}, " +
        $"IsNullOrWhiteSpace={string.IsNullOrWhiteSpace(testCase)}");
}`,
    lang: 'cs',
  },

  // ============================================================
  // 第十一章 字符串格式化与插值
  // ============================================================
  {
    id: 'csharp4-ch11',
    group: '第二部分 核心语法',
    icon: '🎨',
    title: '字符串格式化与插值',
    content: `## 第十一章 字符串格式化与插值

把数字、日期、对象变成漂亮的字符串，是日常开发的高频任务。C# 提供了强大的格式化体系：字符串插值、\`string.Format\`、各种格式说明符。本章把这些工具彻底讲清。

### 一、字符串插值 \`$""

C# 6 起支持字符串插值，用 \`$\` 前缀 + \`{表达式}\` 直接把变量嵌入字符串：

\`\`\`csharp
string name = "Tom";
int age = 18;
Console.WriteLine($"我叫 {name}，今年 {age} 岁");
\`\`\`

插值表达式内可以放任意 C# 表达式：

\`\`\`csharp
Console.WriteLine($"明年 {age + 1} 岁");
Console.WriteLine($"姓名长度 {name.Length}");
Console.WriteLine($"大写 {name.ToUpper()}");
\`\`\`

### 二、string.Format

插值是语法糖，编译后等价 \`string.Format\`：

\`\`\`csharp
string.Format("我叫 {0}，今年 {1} 岁", name, age);
\`\`\`

\`{0}\`、\`{1}\` 是占位符，按参数顺序填充。适合模板字符串场景（如配置文件、资源文件）。

### 三、格式说明符

在 \`{0:格式}\` 或 \`{变量:格式}\` 中加冒号 + 说明符，控制输出格式：

| 说明符 | 名称 | 示例 | 输出 |
| --- | --- | --- | --- |
| C / c | 货币 | 1234.5.ToString("C") | ¥1,234.50 |
| D / d | 十进制 | 42.ToString("D5") | 00042 |
| E / e | 指数 | 12345.ToString("E") | 1.234500E+004 |
| F / f | 定点 | 3.14159.ToString("F2") | 3.14 |
| G / g | 常规 | 3.14159.ToString("G") | 3.14159 |
| N / n | 数字 | 1234567.ToString("N") | 1,234,567.00 |
| P / p | 百分比 | 0.85.ToString("P") | 85.00% |
| X / x | 十六进制 | 255.ToString("X") | FF |

精度说明符跟在字母后：\`F2\` 保留 2 位小数，\`D5\` 补零到 5 位。

### 四、自定义格式

可以自己组合格式字符串：

\`\`\`csharp
12345.ToString("#,##0");          // "12,345"
3.14.ToString("0.00");            // "3.14"
0.85.ToString("0%");              // "85%"
123.ToString("00000");            // "00123"
\`\`\`

常用占位符：

- \`0\`：必须位，不足补 0。
- \`#\`：可选位，不足不显示。
- \`.\`：小数点。
- \`,\`：千分位。
- \`%\`：乘 100 加 %。
- \`\\\\\`：转义字符。
- \`'text'\`：字面文本。

### 五、日期时间格式化

DateTime 也有专属格式说明符：

| 说明符 | 含义 | 示例 |
| --- | --- | --- |
| yyyy | 四位年 | 2024 |
| MM | 两位月 | 01 |
| dd | 两位日 | 15 |
| HH | 24 小时制 | 14 |
| mm | 分钟 | 30 |
| ss | 秒 | 45 |
| 自定义 | yyyy-MM-dd HH:mm:ss | 2024-01-15 14:30:45 |

也有预定义格式：

\`\`\`csharp
DateTime.Now.ToString("O");  // ISO 8601
DateTime.Now.ToString("R");  // RFC 1123
DateTime.Now.ToString("u");  // 通用可排序
\`\`\`

### 六、对齐与填充

在 \`{0, 宽度}\` 中加逗号 + 数字控制对齐：

- 正数：右对齐，左侧补空格。
- 负数：左对齐，右侧补空格。

\`\`\`csharp
Console.WriteLine($"|{"名字",10}|{"年龄",-5}|");
// 输出：|        名字|年龄  |
\`\`\`

适合做表格输出。

### 七、$"" 与 @"" 组合

插值 + verbatim 可以组合成 \`$@"..."\` 或 \`@$"..."\`：

\`\`\`csharp
string path = $@"C:\\Users\\{name}\\file.txt";
\`\`\`

两种写法等价，按团队习惯选择。

### 八、内插字符串性能

字符串插值在 C# 10+ 经过优化，性能接近 \`string.Concat\`。对于简单场景，插值是首选。

C# 10 起，可以用 \`const string\` 拼接常量：

\`\`\`csharp
const string Prefix = "User";
string name = "Tom";
// 注意：const 不能用于插值，只能用字面量拼接
\`\`\`

### 九、IFormattable 接口

插值字符串 \`$"..."\` 实际上是 \`IFormattable\` 类型，可以延迟格式化：

\`\`\`csharp
IFormattable msg = $"时间 {DateTime.Now:O}";
string formatted = msg.ToString(null, CultureInfo.InvariantCulture);
\`\`\`

国际化场景常用。

### 十、ICustomFormatter 简介

需要自定义格式化逻辑时，实现 \`ICustomFormatter\`：

\`\`\`csharp
public string Format(string format, object arg, IFormatProvider provider)
{
    if (format == "X") return "自定义：" + arg;
    return arg.ToString();
}
\`\`\`

配合 \`string.Format(IFormatProvider, ...)\` 使用。日常开发用得不多，但能解决「特殊格式需求」。

### 小结

- 日常用插值 \`$""\`，简洁直观。
- 模板用 \`string.Format\`。
- 数字用 C/D/F/N/P/X，日期用 yyyy-MM-dd。
- 表格用对齐 \`{0, 10}\`。
- 路径用 \`$@""\` 组合。
- 国际化场景考虑 \`IFormattable\`。`,
    code: `// 第十一章 字符串格式化与插值 —— 可在 .NET 8 控制台应用直接运行
using System.Globalization;
using System.Text;

// ============================================================
// 1. 字符串插值 $""
// ============================================================
Console.WriteLine("===== 字符串插值 =====");
string name = "Tom";
int age = 18;
double score = 92.5;
Console.WriteLine($"我叫 {name}，今年 {age} 岁");          // 基础插值
Console.WriteLine($"明年 {age + 1} 岁");                   // 表达式插值
Console.WriteLine($"姓名长度：{name.Length}");             // 成员访问
Console.WriteLine($"大写：{name.ToUpper()}");              // 方法调用
Console.WriteLine($"成绩：{score:F1}");                    // 带格式说明符

// 三目运算符插值
Console.WriteLine($"等级：{(score >= 90 ? "A" : "B")}");

// ============================================================
// 2. string.Format
// ============================================================
Console.WriteLine("\\n===== string.Format =====");
string formatted1 = string.Format("我叫 {0}，今年 {1} 岁", name, age);
Console.WriteLine(formatted1);
string formatted2 = string.Format("{0} + {0} = {1}", 5, 10);
Console.WriteLine(formatted2);  // 占位符可重复使用
string formatted3 = string.Format("{0,-10}{1,10}", "名字", "年龄");
Console.WriteLine($"|{formatted3}|");  // 对齐演示

// ============================================================
// 3. 数字格式说明符
// ============================================================
Console.WriteLine("\\n===== 数字格式说明符 =====");
double amount = 1234.5678;
int num = 255;
int big = 1234567;

Console.WriteLine($"原值：{amount}, {num}, {big}");
Console.WriteLine($"C  货币：       {amount:C}");          // ¥1,234.57（受文化影响）
Console.WriteLine($"C2 货币2位：    {amount:C2}");
Console.WriteLine($"D5 整数补零：   {num:D5}");            // 00255
Console.WriteLine($"E  科学计数：   {big:E}");            // 1.234567E+006
Console.WriteLine($"F2 定点2位：    {amount:F2}");        // 1234.57
Console.WriteLine($"G  常规：       {amount:G}");         // 1234.5678
Console.WriteLine($"N  千分位：     {big:N}");            // 1,234,567.00
Console.WriteLine($"N0 千分位无小数：{big:N0}");          // 1,234,567
Console.WriteLine($"P  百分比：     {0.85:P}");           // 85.00%
Console.WriteLine($"P0 百分比整数： {0.85:P0}");         // 85%
Console.WriteLine($"X  十六进制：   {num:X}");            // FF
Console.WriteLine($"x  小写十六进制：{num:x}");           // ff
Console.WriteLine($"X4 十六进制补零：{num:X4}");          // 00FF

// ============================================================
// 4. 自定义数字格式
// ============================================================
Console.WriteLine("\\n===== 自定义数字格式 =====");
Console.WriteLine($"{12345:#,##0}");                // 千分位：12,345
Console.WriteLine($"{3.14159:0.00}");               // 保留 2 位：3.14
Console.WriteLine($"{0.85:0%}");                    // 百分比：85%
Console.WriteLine($"{123:00000}");                  // 补零：00123
Console.WriteLine($"{12345.6789:#,##0.00}");        // 千分位 + 2 位：12,345.68
Console.WriteLine($"{(-1234):#,##0;(#,##0)}");      // 负数括号：(1,234)
Console.WriteLine($"{0:#,##0.00;(#,##0.00);零}");   // 三段式：零

// ============================================================
// 5. 日期时间格式化
// ============================================================
Console.WriteLine("\\n===== 日期时间格式化 =====");
DateTime now = new DateTime(2024, 6, 15, 14, 30, 45);
Console.WriteLine($"原值：{now}");

// 自定义格式
Console.WriteLine($"yyyy-MM-dd             = {now:yyyy-MM-dd}");
Console.WriteLine($"yyyy/MM/dd HH:mm:ss    = {now:yyyy/MM/dd HH:mm:ss}");
Console.WriteLine($"yyyy年MM月dd日          = {now:yyyy年MM月dd日}");
Console.WriteLine($"HH:mm:ss.fff           = {now:HH:mm:ss.fff}"); // 含毫秒
Console.WriteLine($"dddd（星期）           = {now:dddd}");
Console.WriteLine($"MMM dd, yyyy           = {now:MMM dd, yyyy}");

// 预定义格式
Console.WriteLine($"O (ISO 8601)   = {now:O}");
Console.WriteLine($"R (RFC 1123)   = {now:R}");
Console.WriteLine($"u (通用可排序)  = {now:u}");
Console.WriteLine($"s (可排序)      = {now:s}");
Console.WriteLine($"D (长日期)      = {now:D}");
Console.WriteLine($"T (长时间)      = {now:T}");
Console.WriteLine($"f (完整日期时间) = {now:f}");

// TimeSpan 格式化
TimeSpan ts = TimeSpan.FromHours(2.5);
Console.WriteLine($"TimeSpan：{ts:h\\:mm\\:ss}");   // 注意冒号需要转义

// ============================================================
// 6. 对齐与填充（表格输出）
// ============================================================
Console.WriteLine("\\n===== 对齐与填充 =====");
// 正数宽度：右对齐（左侧补空格）
// 负数宽度：左对齐（右侧补空格）
Console.WriteLine($"|{"姓名",10}|{"年龄",5}|{"分数",8}|");
Console.WriteLine($"|{"----------",10}|{"-----",5}|{"--------",8}|");
Console.WriteLine($"|{"Tom",10}|{18,5}|{92.5,8:F1}|");
Console.WriteLine($"|{"Jerry",10}|{20,5}|{88.0,8:F1}|");
Console.WriteLine($"|{"Anna",10}|{19,5}|{95.3,8:F1}|");

// 左对齐演示
Console.WriteLine($"|{"姓名",-10}|{"年龄",-5}|");

// ============================================================
// 7. $"" 与 @"" 组合（路径与正则）
// ============================================================
Console.WriteLine("\\n===== $@ 组合 =====");
string userName = "Tom";
string path1 = $@"C:\\Users\\{userName}\\Documents\\file.txt";  // $@ 组合
string path2 = @$"C:\\Users\\{userName}\\Documents\\file.txt";  // @$ 组合，等价
Console.WriteLine($"路径1：{path1}");
Console.WriteLine($"路径2：{path2}");
Console.WriteLine($"两者相等：{path1 == path2}");

// 多行插值字符串
string summary = $@"
===== 用户摘要 =====
姓名：{userName}
年龄：{age}
路径：{path1}
创建时间：{DateTime.Now:yyyy-MM-dd HH:mm:ss}
====================";
Console.WriteLine(summary);

// ============================================================
// 8. 不同文化的格式化
// ============================================================
Console.WriteLine("\\n===== 不同文化 =====");
double money = 1234567.89;
DateTime date = new DateTime(2024, 6, 15);

Console.WriteLine($"默认（当前文化）：{money:C}");
Console.WriteLine($"zh-CN：{money.ToString("C", new CultureInfo("zh-CN"))}");
Console.WriteLine($"en-US：{money.ToString("C", new CultureInfo("en-US"))}");
Console.WriteLine($"ja-JP：{money.ToString("C", new CultureInfo("ja-JP"))}");
Console.WriteLine($"de-DE：{money.ToString("C", new CultureInfo("de-DE"))}");

Console.WriteLine($"日期 zh-CN：{date.ToString("D", new CultureInfo("zh-CN"))}");
Console.WriteLine($"日期 en-US：{date.ToString("D", new CultureInfo("en-US"))}");
Console.WriteLine($"日期 ja-JP：{date.ToString("D", new CultureInfo("ja-JP"))}");

// 不变文化（跨语言/系统使用）
Console.WriteLine($"InvariantCulture：{money.ToString("F2", CultureInfo.InvariantCulture)}");

// ============================================================
// 9. IFormattable 接口演示
// ============================================================
Console.WriteLine("\\n===== IFormattable =====");
IFormattable formattable = $"时间 {DateTime.Now:O}, 数字 {12345:N0}";
// 延迟格式化，可指定文化和格式
string formatted = formattable.ToString(null, CultureInfo.InvariantCulture);
Console.WriteLine($"IFormattable 输出：{formatted}");

// 自定义类型实现 IFormattable
var money2 = new Money(1234.56m, "CNY");
Console.WriteLine(money2.ToString("C", CultureInfo.CurrentCulture));
Console.WriteLine(money2.ToString("S", CultureInfo.InvariantCulture));  // 自定义 S 格式
Console.WriteLine(money2.ToString("RAW", CultureInfo.InvariantCulture)); // 自定义 RAW 格式

// ============================================================
// 10. ICustomFormatter 自定义格式化器
// ============================================================
Console.WriteLine("\\n===== ICustomFormatter =====");
var provider = new ReverseFormatter();
string customResult = string.Format(provider, "反转：{0:R}, 原样：{0}", "Hello World");
Console.WriteLine(customResult);

// ============================================================
// 11. 字符串插值性能小贴士
// ============================================================
Console.WriteLine("\\n===== 性能小贴士 =====");
string firstName = "Tom", lastName = "Jerry";
// 简单拼接：插值性能已优化，日常放心用
string full = $"{firstName} {lastName}";
Console.WriteLine($"插值拼接：{full}");

// 大量拼接还是用 StringBuilder
var sb = new StringBuilder();
for (int k = 0; k < 5; k++) sb.Append($"item{k},");
Console.WriteLine($"循环拼接：{sb.ToString().TrimEnd(',')}");

// ============================================================
// 类型声明放在文件末尾
// ============================================================

// 实现 IFormattable 的 Money 类型
class Money : IFormattable
{
    public decimal Amount { get; }
    public string CurrencyCode { get; }

    public Money(decimal amount, string code)
    {
        Amount = amount;
        CurrencyCode = code;
    }

    // 实现 IFormattable.ToString
    public string ToString(string? format, IFormatProvider? formatProvider)
    {
        // 根据格式说明符返回不同表示
        if (string.IsNullOrEmpty(format)) format = "C";

        return format switch
        {
            "C" => $"{Amount.ToString("C", formatProvider)}",      // 货币格式
            "S" => $"{CurrencyCode} {Amount:N2}",                  // 标准格式：CNY 1,234.56
            "RAW" => $"{Amount:0.####} {CurrencyCode}",            // 原始数值
            _ => Amount.ToString(format, formatProvider)           // 透传给 decimal
        };
    }

    public override string ToString() => ToString("C", null);
}

// 自定义 ICustomFormatter + IFormatProvider
class ReverseFormatter : IFormatProvider, ICustomFormatter
{
    // IFormatProvider：返回自定义 formatter
    public object? GetFormat(Type? formatType)
    {
        return formatType == typeof(ICustomFormatter) ? this : null;
    }

    // ICustomFormatter：自定义格式化逻辑
    public string Format(string? format, object? arg, IFormatProvider? formatProvider)
    {
        // 只处理 "R" 格式说明符
        if (format == "R" && arg is string s)
        {
            char[] arr = s.ToCharArray();
            Array.Reverse(arr);
            return new string(arr);  // 反转字符串
        }

        // 其他情况交给默认格式化
        if (arg is IFormattable f)
            return f.ToString(format, formatProvider);
        return arg?.ToString() ?? "";
    }
}`,
    lang: 'cs',
  },
];

export { chapters };
