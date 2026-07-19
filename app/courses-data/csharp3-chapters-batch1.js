// =============================================================
// C# 从入门到精通大全（终极版）—— 第1批章节
// 前言 + 第一部分 入门基础（共 6 章）
// -------------------------------------------------------------
// 本批包含 6 章：
//   csharp3-preface : 前言与学习路线
//   csharp3-ch01    : 第一章 开发环境与第一个程序
//   csharp3-ch02    : 第二章 变量、数据类型与字面量
//   csharp3-ch03    : 第三章 运算符完全指南
//   csharp3-ch04    : 第四章 字符串完全指南
//   csharp3-ch05    : 第五章 控制台输入输出与格式化
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 前言
  // ============================================================
  {
    id: 'csharp3-preface',
    group: '开篇',
    icon: '📖',
    title: '前言与学习路线',
    content: `## 前言

### 一、本书适合谁

这是一本**大而全、循序渐进、覆盖日常开发 100% 场景**的 C# 工程师教程。无论你是新手还是有经验的开发者，都能从中获益。

- **零基础**：从没写过代码，从 C# 开始入门。
- **转语言**：会 Java / Python / JavaScript，想转 .NET 生态。
- **补基础**：写过 C# 但基础不牢，想系统梳理知识体系。
- **进阶工程师**：想掌握 C# 12 新特性、.NET 8 工程实践、性能优化。

### 二、本书讲什么

全书 **70 章**，十二大模块。每章都遵循"一句话讲清 → 可运行 demo → 详细注释 → 小结"的结构，循序渐进、生动有趣、不拖沓。

| 模块 | 章节 | 主题 |
| --- | --- | --- |
| 入门基础 | 1-5 | 第一个程序、变量类型、运算符、字符串、输入输出 |
| 控制流 | 6-9 | 条件判断、循环、跳转、数组基础 |
| 方法与函数 | 10-14 | 方法基础、参数进阶、重载、局部函数、递归 |
| 数组与集合 | 15-18 | 多维数组、Array 操作、Span<T>、集合概述 |
| 面向对象基础 | 19-24 | 类与对象、字段属性、构造函数、静态、继承、多态 |
| OOP 进阶 | 25-30 | 抽象类接口、record、struct、enum、值引用、可空模式 |
| 泛型集合 | 31-37 | 泛型、List、Dictionary、HashSet、栈队列、迭代器、元组 |
| 委托 LINQ | 38-43 | 委托、事件、Lambda、LINQ 完整、表达式树、函数式 |
| 高级特性 | 44-49 | 反射、特性、dynamic、unsafe、源生成器、AOT |
| 异步并发 | 50-55 | async/await、Task、Channel、锁、并发集合、PLINQ |
| IO 序列化 | 56-60 | 文件、Stream、JSON、正则、Span 字符串 |
| 异常日期网络 | 61-64 | 异常体系、DateTime/TimeOnly、HttpClient、URL、Socket |
| .NET 生态 | 65-68 | DI、Logging、Configuration、Benchmark、xUnit |
| 综合实战 | 69-70 | Todo CLI、Web API 综合项目 |

### 三、版本与约定

- **.NET 8 LTS**：长期支持版本，生产首选。
- **C# 12**：顶级语句、文件作用域命名空间、主构造函数、集合表达式等。
- **沙箱执行**：每段代码都能在浏览器内点击"运行"直接看结果。
- **代码风格**：用 \`var\` 推断简单类型，复杂类型显式写出；每个 demo 都加详细注释解释"为什么"。

### 四、怎么用这本书

\`\`\`
入门(1-5) → 控制流(6-9) → 方法(10-14) → 数组集合(15-18)
                                                      ↓
实战(69-70) ← .NET生态(65-68) ← 异常网络(61-64) ← IO(56-60)
        ↑
OOP(19-30) → 泛型集合(31-37) → 委托LINQ(38-43) → 高级特性(44-49) → 异步(50-55)
\`\`\`

- **想快速上手**：先看 1-18 章，覆盖日常开发 80% 场景。
- **想写工程代码**：再补 19-37 章，掌握 OOP 与泛型集合。
- **想上生产**：最后看 38-70 章，LINQ/异步/IO/工程化。

### 五、配套 demo 示例

下面是一段经典"30 秒上手"代码，看不懂没关系，跑一跑、读注释就懂了：

\`\`\`csharp
// 顶级语句：这是完整 C# 程序，无需 class / Main
// Console.WriteLine 在 System 命名空间，但 .NET 6+ 默认开启 ImplicitUsings，无需 using
Console.WriteLine("你好，C# 工程师！");

// $ 字符串插值是日常最常用的字符串拼接方式
// {} 里可以放任意表达式（变量、算式、方法调用）
string name = "开发者";
int year = DateTime.Now.Year;
Console.WriteLine($"欢迎 {name}，{year} 年加油！");

// var 关键字让编译器自动推断类型（int / string / double / bool）
var pi = 3.14159;
var radius = 5.0;
var area = pi * radius * radius;  // 圆面积公式 πr²
Console.WriteLine($"半径 {radius} 的圆面积 = {area:F2}");
\`\`\`

### 六、学习建议

- **边读边敲**：复制代码改一改、跑一跑，比看十遍都管用。
- **⭐ 标记**：是日常开发 80% 场景都用的核心点，必掌握。
- **⚠️ 标记**：是常见坑，务必避免。
- **不要死记**：理解原理比记忆语法重要，遇到忘了回查即可。

### 七、准备好了吗？

打开第一章，我们从"Hello, World"开始，30 秒写出你的第一个 C# 程序。`,
  },

  // ============================================================
  // 第一章：开发环境与第一个程序
  // ============================================================
  {
    id: 'csharp3-ch01',
    group: '第一部分 入门基础',
    icon: '🚀',
    title: '第一章 开发环境与第一个程序',
    content: `## 第一章　开发环境与第一个程序

这一章带你从零搭建 C# 开发环境，写出第一个 C# 程序，并掌握顶级语句、输出、注释、字符串插值等基础知识。

### 一、本地环境搭建

#### 1.1 安装 .NET 8 SDK

从 [dotnet.microsoft.com](https://dotnet.microsoft.com) 下载 .NET 8 SDK 安装包，按提示安装。

安装完成后，打开终端验证：

\`\`\`bash
dotnet --version    # 应显示 8.0.x
dotnet --list-sdks  # 列出已安装的 SDK 版本
\`\`\`

#### 1.2 创建第一个项目

\`\`\`bash
# 创建控制台项目
dotnet new console -n MyFirstApp
# 进入项目目录
cd MyFirstApp
# 运行项目
dotnet run
\`\`\`

\`dotnet new console\` 会生成一个 \`Program.cs\` 文件，里面只有一行代码：

\`\`\`csharp
// 顶级语句：完整程序，无需 class、Main 方法
Console.WriteLine("Hello, World!");
\`\`\`

### 二、顶级语句（Top-level Statements）⭐

C# 9 引入「顶级语句」，让控制台程序可以简化到极致——**没有 class、没有 Main、没有样板代码**：

\`\`\`csharp
// 顶级语句：直接写业务逻辑，编译器自动生成 Main 方法
// 这就是一个完整的 .NET 程序！
Console.WriteLine("你好，C#！");

// 可以定义变量
var message = "这是顶级语句";
Console.WriteLine(message);

// 可以定义方法（局部函数）
int Add(int a, int b) => a + b;
Console.WriteLine($"1 + 2 = {Add(1, 2)}");

// 可以 await 异步操作（编译器自动生成 async Main）
string text = await File.ReadAllTextAsync("data.txt");
\`\`\`

> ⭐ **顶级语句**：一个项目只能有一个文件使用顶级语句（通常是 \`Program.cs\`）。这是 .NET 6+ 控制台/Worker 服务的默认写法。

### 三、输出家族：WriteLine 与 Write ⭐

\`\`\`csharp
// WriteLine：输出后自动添加换行符（最常用）
Console.WriteLine("第一行");    // 输出后自动换行
Console.WriteLine("第二行");    // 另起一行输出

// Write：输出但不换行，后续输出紧接在同一行
Console.Write("Hello, ");
Console.Write("World!");       // 紧接 "Hello, " 后面
Console.WriteLine();           // 空 WriteLine() 只输出一个换行符

// 实际场景：拼接式输出
Console.Write("请输入姓名：");
string name = Console.ReadLine();
Console.WriteLine($"你好，{name}！");
\`\`\`

| 方法 | 行为 | 场景 |
| --- | --- | --- |
| \`Console.WriteLine()\` | 输出字符串 + 换行 | 普通输出、日志 |
| \`Console.Write()\` | 仅输出字符串，不换行 | 提示语、进度条、拼接输出 |
| \`Console.WriteLine()\`（无参数） | 仅输出换行 | 空行分隔 |

### 四、字符串插值：\$ 前缀 ⭐⭐

C# 最常用、最舒服的特性。字符串前加 \`$\`，用 \`{}\` 嵌入变量或表达式：

\`\`\`csharp
// 基础插值：{} 放变量名
string name = "张三";
int age = 25;
double height = 1.75;
Console.WriteLine($"我叫 {name}，今年 {age} 岁，身高 {height} 米");

// {} 里可以写任意 C# 表达式
Console.WriteLine($"明年我 {age + 1} 岁");                // 算术运算
Console.WriteLine($"姓名长度：{name.Length} 个字符");       // 调用属性和方法
Console.WriteLine($"是否成年：{age >= 18}");               // 逻辑判断
Console.WriteLine($"姓名大写：{name.ToUpper()}");           // 方法调用

// 格式化输出
double price = 19.99;
int qty = 3;
Console.WriteLine($"单价 {price:C}，数量 {qty}，合计 {price * qty:C}");
// 输出：单价 ¥19.99，数量 3，合计 ¥59.97

// 大括号转义：两个大括号表示一个文字大括号
Console.WriteLine($"{{name}} 的值是 {name}");
// 输出：{name} 的值是 张三
\`\`\`

> ⭐ 日常字符串拼接**首选 \`$\` 插值**，比 \`+\` 号拼接、\`string.Format\` 直观十倍。

### 五、三种注释写法

注释是写给人看的，编译器忽略。**好注释解释"为什么"，不是"做了什么"**：

\`\`\`csharp
// 1. 单行注释：以 // 开头，到行尾结束
// 这是最常用的注释方式，解释一行代码的意图
int count = 10;  // 初始化计数器为 10（行尾注释也可）

/*
   2. 块注释：以 /* 开头，以 */ 结束
   可以跨多行，适合解释一段复杂逻辑
   也常用于临时屏蔽一段代码
*/
Console.WriteLine("这行会执行");

/*
Console.WriteLine("这行被注释掉了，不会执行");
Console.WriteLine("这行也不会执行");
*/

/// <summary>
/// 3. XML 文档注释：用 /// 开头
/// 可被 IDE 智能提示识别，可被工具生成 API 文档
/// 主要用于库开发时公开 API 的说明
/// </summary>
/// <param name="a">第一个加数</param>
/// <param name="b">第二个加数</param>
/// <returns>两数之和</returns>
int Add(int a, int b) => a + b;  // 表达式体方法
\`\`\`

| 注释类型 | 语法 | 适用场景 |
| --- | --- | --- |
| 单行注释 | \`//\` | 日常代码解释 |
| 块注释 | \`/* */\` | 多行说明、临时屏蔽代码 |
| XML 文档注释 | \`///\` | 库开发、API 文档生成 |

### 六、实战 demo：个人信息卡片

\`\`\`csharp
// 个人信息卡片 —— 综合运用输出、插值、注释
// 需求：输入姓名、年龄、城市，打印格式化名片

// 第一步：输出程序标题
Console.WriteLine("========== 个人信息卡片生成器 ==========");
Console.WriteLine();  // 空行，让输出更美观

// 第二步：获取用户输入（Console.ReadLine() 读取一行文本）
Console.Write("请输入姓名：");
string name = Console.ReadLine();  // 从控制台读取用户输入

Console.Write("请输入年龄：");
string ageStr = Console.ReadLine();
int age = int.Parse(ageStr);       // 将字符串转换为整数类型

Console.Write("请输入城市：");
string city = Console.ReadLine();

// 第三步：输出格式化名片
Console.WriteLine();  // 空行
Console.WriteLine("========== 您的名片 ==========");
// 使用 $ 字符串插值，将变量嵌入到输出字符串中
Console.WriteLine($"姓名：{name}");
Console.WriteLine($"年龄：{age} 岁");
Console.WriteLine($"城市：{city}");
// 计算并显示更多信息
Console.WriteLine($"姓名长度：{name.Length} 个字符");
Console.WriteLine($"是否成年：{age >= 18}");
Console.WriteLine("==============================");
\`\`\`

### 七、小结

本章我们完成了从零到写出第一个 C# 程序的完整旅程：

| 知识点 | 关键内容 |
| --- | --- |
| 环境搭建 | dotnet new console, dotnet run |
| 顶级语句 | 无需 class/Main，直接写业务逻辑 |
| 输出 | WriteLine（换行）、Write（不换行） |
| 字符串插值 | \$"..." 嵌入变量和表达式 |
| 注释 | // 单行、/* */ 块、/// XML 文档 |

> 下一章我们将深入 C# 的数据类型世界，了解变量、常量与字面量的全部奥秘。`,
  },

  // ============================================================
  // 第二章：变量、数据类型与字面量
  // ============================================================
  {
    id: 'csharp3-ch02',
    group: '第一部分 入门基础',
    icon: '📦',
    title: '第二章 变量、数据类型与字面量',
    content: `## 第二章　变量、数据类型与字面量

本章系统讲解 C# 的所有基本数据类型，包括整数、浮点数、布尔、字符，以及变量声明、类型推断、常量、类型转换等核心概念。

### 一、变量声明：var vs 显式类型 ⭐

\`\`\`csharp
// 方式1：显式类型声明（类型名 变量名 = 值）
int age = 25;           // 一眼看出是整数
string name = "张三";    // 一眼看出是字符串
double price = 19.99;   // 一眼看出是浮点数

// 方式2：var 隐式类型推断（编译器自动推断类型）
var age2 = 25;          // 编译器推断为 int
var name2 = "张三";      // 编译器推断为 string
var price2 = 19.99;     // 编译器推断为 double

// var 不是无类型！编译后类型固定，不可改变
var x = 100;            // x 是 int
// x = "hello";         // 编译错误！不能将 string 赋给 int 变量
\`\`\`

| 方式 | 优点 | 缺点 | 适用场景 |
| --- | --- | --- | --- |
| 显式类型 | 类型一目了然 | 代码稍长 | 类型不明显时 |
| \`var\` | 简洁 | 类型需推断 | 类型明显时（如 new 表达式） |

### 二、整数类型全家福

C# 提供 8 种整数类型，分有符号和无符号两大类：

\`\`\`csharp
// --- 有符号整数（可表示负数）---
sbyte sb = -128;         // 8 位，范围 -128 ~ 127
short s = -32768;        // 16 位，范围 -32,768 ~ 32,767
int i = -2147483648;     // 32 位，范围 -2,147,483,648 ~ 2,147,483,647（默认整数类型）
long l = -9_223_372_036_854_775_808L;  // 64 位，L 后缀表示 long 字面量

// --- 无符号整数（只能表示非负数）---
byte b = 255;            // 8 位，范围 0 ~ 255
ushort us = 65535;       // 16 位，范围 0 ~ 65,535
uint ui = 4_294_967_295U; // 32 位，U 后缀表示 uint 字面量
ulong ul = 18_446_744_073_709_551_615UL; // 64 位，UL 后缀表示 ulong 字面量
\`\`\`

| 类型 | 大小 | 有符号范围 | 无符号范围 |
| --- | --- | --- | --- |
| \`byte\` / \`sbyte\` | 1 字节 | -128 ~ 127 | 0 ~ 255 |
| \`short\` / \`ushort\` | 2 字节 | -32,768 ~ 32,767 | 0 ~ 65,535 |
| \`int\` / \`uint\` | 4 字节 | -21亿 ~ 21亿 | 0 ~ 42亿 |
| \`long\` / \`ulong\` | 8 字节 | -9e18 ~ 9e18 | 0 ~ 1.8e19 |

#### 整数字面量增强（C# 7+）

\`\`\`csharp
// 数字分隔符：用下划线 _ 提高可读性
int oneMillion = 1_000_000;          // 一百万，比 1000000 更易读
int creditCard = 1234_5678_9012_3456; // 信用卡号
long bigNumber = 0xFFFF_FFFF_FFFF;    // 十六进制也可以用分隔符

// 二进制字面量（C# 7+）
int flags = 0b1010_0011;             // 0b 前缀表示二进制字面量
// 等价于十进制的 163
Console.WriteLine($"0b1010_0011 = {flags}");
\`\`\`

### 三、浮点数类型

\`\`\`csharp
// float：单精度（32位），后缀 f 或 F
float f = 3.14f;              // 必须加 f 后缀，否则默认是 double
float f2 = 1.5e3f;            // 科学计数法：1.5 × 10³ = 1500

// double：双精度（64位），默认浮点数类型
double d = 3.14159265358979;  // 不加后缀默认是 double
double d2 = 1.5e-3;           // 科学计数法：1.5 × 10⁻³ = 0.0015

// decimal：高精度十进制（128位），后缀 m 或 M
// 适合金融计算，精度高但范围小
decimal price = 19.99m;       // 必须加 m 后缀
decimal total = 123456789.123456789m;  // 28-29 位有效数字
\`\`\`

| 类型 | 大小 | 精度 | 范围 | 适用场景 |
| --- | --- | --- | --- | --- |
| \`float\` | 4 字节 | ~7 位 | ±1.5e-45 ~ ±3.4e38 | 游戏、图形 |
| \`double\` | 8 字节 | ~15-16 位 | ±5.0e-324 ~ ±1.7e308 | 科学计算、通用 |
| \`decimal\` | 16 字节 | 28-29 位 | ±1.0e-28 ~ ±7.9e28 | 金融、货币 |

#### ⚠️ 浮点数精度陷阱

\`\`\`csharp
// double 和 float 是二进制浮点数，无法精确表示某些十进制小数
double a = 0.1;
double b = 0.2;
Console.WriteLine(a + b);          // 输出 0.30000000000000004（不是精确的 0.3！）
Console.WriteLine(a + b == 0.3);   // False！浮点数比较不要用 ==

// decimal 是十进制浮点数，可以精确表示
decimal c = 0.1m;
decimal d = 0.2m;
Console.WriteLine(c + d);          // 输出 0.3（精确！）
Console.WriteLine(c + d == 0.3m);  // True
\`\`\`

### 四、布尔与字符类型

\`\`\`csharp
// bool：只有两个值 true 和 false
bool isActive = true;               // 表示"是"
bool isComplete = false;            // 表示"否"
bool isAdult = 18 >= 18;            // 比较表达式的结果也是 bool

// char：单个 Unicode 字符（16 位），用单引号
char grade = 'A';                   // 单个字符
char digit = '9';                   // 数字字符
char chinese = '中';                // 中文字符（Unicode）
char symbol = '\'';                 // 转义字符：单引号

// 转义字符
Console.WriteLine("Tab:\\t这里有制表符");   // \\t 制表符
Console.WriteLine("换行：\\n第二行");       // \\n 换行符
Console.WriteLine("引号：\\"Hello\\"");     // \\" 双引号
Console.WriteLine("反斜杠：\\\\");          // \\\\ 反斜杠本身
\`\`\`

### 五、默认值与类型推断

\`\`\`csharp
// 每种类型都有默认值：数值 0，bool false，char '\\0'，引用类型 null
// 使用 default 关键字获取类型的默认值
int defaultInt = default;           // 0
bool defaultBool = default;         // false
string defaultString = default;     // null
double defaultDouble = default;     // 0
char defaultChar = default;         // '\\0'（空字符）

// var 类型推断：编译器根据赋值表达式推断类型
var num = 100;                      // 推断为 int
var text = "hello";                 // 推断为 string
var flag = true;                    // 推断为 bool
var list = new List<int>();         // 推断为 List<int>
// var 必须初始化，不能只声明不赋值
// var x;  // 编译错误！

// 使用 GetType() 查看变量的实际类型
Console.WriteLine($"num 的类型是 {num.GetType()}");    // System.Int32
Console.WriteLine($"text 的类型是 {text.GetType()}");  // System.String
\`\`\`

### 六、常量（const）

\`\`\`csharp
// const：编译时常量，值在编译时确定，不可修改
// 只能用于基本类型（int、double、string、bool 等）和 null
const double PI = 3.14159265358979;     // 圆周率，永不改变
const int MAX_USERS = 100;              // 最大用户数
const string APP_NAME = "MyApp v1.0";   // 应用名称
const bool DEBUG_MODE = false;          // 调试模式开关

// 常量在编译时被"内联"——直接替换为值
Console.WriteLine($"圆周率：{PI}");     // 编译后等价于 Console.WriteLine($"圆周率：3.14159265358979")

// 使用 const 的好处：语义清晰、编译期检查、性能略好
// const 不能用于运行时才能确定的值
// const DateTime now = DateTime.Now;  // 编译错误！DateTime.Now 是运行时值
\`\`\`

### 七、类型转换 ⭐

#### 7.1 隐式转换（安全，自动完成）

\`\`\`csharp
// 隐式转换：小范围 → 大范围，不会丢失数据
int i = 100;
long l = i;         // int → long 安全，自动转换
float f = 3.14f;
double d = f;       // float → double 安全，自动转换
byte b = 200;
int i2 = b;         // byte → int 安全，自动转换
\`\`\`

#### 7.2 显式转换（强制转换，可能丢失数据）

\`\`\`csharp
// 显示转换：大范围 → 小范围，需要手动转换，可能丢失数据
double d = 3.99;
int i = (int)d;         // 强制转换：截断小数部分，结果为 3（不是四舍五入！）
Console.WriteLine(i);   // 输出 3

long l = 300;
byte b = (byte)l;       // 强制转换：long → byte，可能溢出
Console.WriteLine(b);   // 输出 44（高位被截断，300 % 256 = 44）

// 使用 Convert 类进行转换（会四舍五入）
double d2 = 3.99;
int i2 = Convert.ToInt32(d2);  // Convert 会四舍五入，结果为 4
Console.WriteLine(i2);         // 输出 4
\`\`\`

#### 7.3 Parse 与 TryParse

\`\`\`csharp
// Parse：将字符串转换为数值类型，格式错误会抛异常
string s = "123";
int n = int.Parse(s);           // 字符串 "123" → 整数 123
double d = double.Parse("3.14"); // 字符串 → double

// TryParse：安全转换，不会抛异常，返回成功/失败
string input = "123abc";        // 包含非数字字符
if (int.TryParse(input, out int result))
{
    // 转换成功，result 包含转换后的值
    Console.WriteLine($"转换成功：{result}");
}
else
{
    // 转换失败，result 为 0
    Console.WriteLine($"'{input}' 无法转换为整数");
}
// ⭐ 处理用户输入时，始终用 TryParse 而不是 Parse
\`\`\`

#### 7.4 checked / unchecked

\`\`\`csharp
// checked：开启溢出检查，溢出时抛出 OverflowException
checked
{
    int max = int.MaxValue;     // 2147483647
    // int overflow = max + 1;  // 抛出 OverflowException！
}

// unchecked：关闭溢出检查（默认行为），溢出时截断
unchecked
{
    int max = int.MaxValue;     // 2147483647
    int overflow = max + 1;     // 结果为 -2147483648（环绕）
    Console.WriteLine(overflow);
}

// 项目级别控制：在 .csproj 中设置 <CheckForOverflowUnderflow>true</CheckForOverflowUnderflow>
\`\`\`

| 转换方式 | 语法 | 安全性 | 适用场景 |
| --- | --- | --- | --- |
| 隐式转换 | 直接赋值 | 安全 | 小范围→大范围 |
| 强制转换 | \`(类型)值\` | 可能丢失数据 | 大范围→小范围 |
| \`Convert\` | \`Convert.ToInt32()\` | 四舍五入 | 需要舍入的转换 |
| \`Parse\` | \`int.Parse()\` | 抛异常 | 确定格式正确的字符串 |
| \`TryParse\` | \`int.TryParse()\` | 安全 | 用户输入等不确定来源 |

### 八、小结

| 知识点 | 关键内容 |
| --- | --- |
| 变量声明 | var 类型推断 vs 显式类型 |
| 整数类型 | byte/short/int/long，有符号/无符号，数字分隔符 |
| 浮点数 | float/double/decimal，精度差异 |
| 布尔字符 | bool（true/false），char（Unicode 字符） |
| 默认值 | default 关键字 |
| 常量 | const 编译时常量，不可修改 |
| 类型转换 | 隐式/显式/Convert/Parse/TryParse，checked/unchecked |

> 熟练掌握数据类型是编程的基石。下一章我们将学习 C# 的运算符，掌握各种运算操作。`,
  },

  // ============================================================
  // 第三章：运算符完全指南
  // ============================================================
  {
    id: 'csharp3-ch03',
    group: '第一部分 入门基础',
    icon: '➕',
    title: '第三章 运算符完全指南',
    content: `## 第三章　运算符完全指南

本章全面覆盖 C# 所有运算符：算术、比较、逻辑、位运算、赋值、三元、null 合并、is/as、typeof/sizeof 以及运算符优先级。

### 一、算术运算符

\`\`\`csharp
// 基本四则运算
int a = 10, b = 3;
Console.WriteLine($"加法：{a} + {b} = {a + b}");   // 10 + 3 = 13
Console.WriteLine($"减法：{a} - {b} = {a - b}");   // 10 - 3 = 7
Console.WriteLine($"乘法：{a} * {b} = {a * b}");   // 10 * 3 = 30
Console.WriteLine($"除法：{a} / {b} = {a / b}");   // 10 / 3 = 3（整数除法截断！）
Console.WriteLine($"取模：{a} % {b} = {a % b}");   // 10 % 3 = 1（取余数）

// 浮点数除法则会得到小数结果
double x = 10.0, y = 3.0;
Console.WriteLine($"浮点除法：{x} / {y} = {x / y}"); // 10 / 3 = 3.333...

// 自增自减：++ 和 --
int count = 5;
count++;              // 后置自增：先用再加，执行后 count = 6
++count;              // 前置自增：先加再用，执行后 count = 7
Console.WriteLine($"count = {count}");  // 7

// 前置与后置的区别（仅在参与表达式时有差异）
int n = 5;
Console.WriteLine($"后置 n++：{n++}");  // 输出 5，然后 n 变成 6
Console.WriteLine($"前置 ++n：{++n}");  // n 先变成 7，然后输出 7

// 自减同理
int m = 10;
m--;                  // 后置自减
--m;                  // 前置自减
\`\`\`

### 二、比较运算符

\`\`\`csharp
// 比较运算符的结果是 bool 类型
int a = 10, b = 20;
Console.WriteLine($"a == b : {a == b}");  // Equal（等于）：False
Console.WriteLine($"a != b : {a != b}");  // Not Equal（不等于）：True
Console.WriteLine($"a > b  : {a > b}");   // Greater Than（大于）：False
Console.WriteLine($"a < b  : {a < b}");   // Less Than（小于）：True
Console.WriteLine($"a >= b : {a >= b}");  // Greater or Equal（大于等于）：False
Console.WriteLine($"a <= b : {a <= b}");  // Less or Equal（小于等于）：True

// 字符串比较（区分大小写）
Console.WriteLine($"'abc' == 'abc' : {"abc" == "abc"}");   // True
Console.WriteLine($"'abc' == 'ABC' : {"abc" == "ABC"}");   // False（区分大小写）

// 比较运算符通常用于 if 条件判断
int age = 18;
if (age >= 18)
{
    Console.WriteLine("成年人");
}
else
{
    Console.WriteLine("未成年人");
}
\`\`\`

### 三、逻辑运算符

\`\`\`csharp
// && 逻辑与（AND）：两边都为 true 才为 true
bool isLoggedIn = true;
bool hasPermission = true;
if (isLoggedIn && hasPermission)
    Console.WriteLine("可以访问");  // 两个条件都满足才能访问

// || 逻辑或（OR）：任意一边为 true 就为 true
bool isVIP = false;
bool hasCoupon = true;
if (isVIP || hasCoupon)
    Console.WriteLine("可以享受折扣");  // 只要有一个满足就可以

// ! 逻辑非（NOT）：取反
bool isBlocked = false;
if (!isBlocked)
    Console.WriteLine("用户未被封禁，可以登录");

// 短路求值（Short-circuit evaluation）
// && : 左边为 false 时，右边不执行
int x = 0;
if (false && ++x > 0) { }  // ++x 不会执行，因为左边已经是 false
Console.WriteLine(x);       // 输出 0，x 没有变化

// || : 左边为 true 时，右边不执行
int y = 0;
if (true || ++y > 0) { }   // ++y 不会执行，因为左边已经是 true
Console.WriteLine(y);       // 输出 0，y 没有变化
\`\`\`

| 运算符 | 名称 | 说明 | 短路？ |
| --- | --- | --- | --- |
| \`&&\` | 逻辑与 | 两边都为 true 结果为 true | 是 |
| \`\\|\\|\` | 逻辑或 | 任意一边为 true 结果为 true | 是 |
| \`!\` | 逻辑非 | 取反 | - |
| \`&\` | 逻辑与（不短路）| 两边都计算 | 否 |
| \`\\|\` | 逻辑或（不短路）| 两边都计算 | 否 |

### 四、位运算符

\`\`\`csharp
// 位运算符直接操作二进制位，效率高，常用于底层编程
int a = 0b0001;  // 二进制：0001（十进制 1）
int b = 0b0011;  // 二进制：0011（十进制 3）

// & 按位与：对应位都为 1 才为 1
Console.WriteLine($"a & b = {a & b}");  // 0001 & 0011 = 0001（1）

// | 按位或：对应位有 1 则为 1
Console.WriteLine($"a | b = {a | b}");  // 0001 | 0011 = 0011（3）

// ^ 按位异或：对应位不同则为 1
Console.WriteLine($"a ^ b = {a ^ b}");  // 0001 ^ 0011 = 0010（2）

// ~ 按位取反：0 变 1，1 变 0
Console.WriteLine($"~a = {~a}");        // ~0001 = -2（补码表示）

// << 左移：所有位向左移动，右边补 0（相当于乘以 2^n）
Console.WriteLine($"1 << 3 = {1 << 3}");  // 0001 → 1000（8），相当于 1*2³

// >> 右移：所有位向右移动，左边补符号位（相当于除以 2^n）
Console.WriteLine($"8 >> 2 = {8 >> 2}");  // 1000 → 0010（2），相当于 8/2²

// 位运算实战：权限管理
[Flags]  // 表示可以组合使用
enum Permission
{
    Read = 1 << 0,    // 0001 = 1
    Write = 1 << 1,   // 0010 = 2
    Execute = 1 << 2, // 0100 = 4
    Delete = 1 << 3   // 1000 = 8
}

// 组合权限：用 | 运算符
Permission userPerm = Permission.Read | Permission.Write;  // 0011
Console.WriteLine($"用户权限：{userPerm}");  // Read, Write

// 检查权限：用 & 运算符
bool canRead = (userPerm & Permission.Read) == Permission.Read;    // True
bool canDelete = (userPerm & Permission.Delete) == Permission.Delete; // False
Console.WriteLine($"可读：{canRead}，可删：{canDelete}");
\`\`\`

### 五、赋值运算符

\`\`\`csharp
// 基本赋值
int x = 10;          // 将 10 赋给 x

// 复合赋值运算符：运算 + 赋值二合一
x += 5;              // 等价于 x = x + 5，x 变为 15
x -= 3;              // 等价于 x = x - 3，x 变为 12
x *= 2;              // 等价于 x = x * 2，x 变为 24
x /= 4;              // 等价于 x = x / 4，x 变为 6
x %= 4;              // 等价于 x = x % 4，x 变为 2

// 位运算的复合赋值
int y = 0b0011;      // 3
y &= 0b0001;         // 等价于 y = y & 0b0001，y 变为 1
y |= 0b0100;         // 等价于 y = y | 0b0100，y 变为 5
y ^= 0b0101;         // 等价于 y = y ^ 0b0101，y 变为 0

// 复合赋值运算符列表
// +=  -=  *=  /=  %=  &=  |=  ^=  <<=  >>=  ??=
\`\`\`

### 六、三元运算符（?:）

\`\`\`csharp
// 语法：条件 ? 为真时的值 : 为假时的值
// 是 if-else 的简洁版表达式

int score = 85;
// 根据分数判断等级
string grade = score >= 90 ? "优秀" : "良好";
Console.WriteLine($"成绩等级：{grade}");

// 嵌套三元运算符（可读性差，不推荐超过两层）
string level = score >= 90 ? "A" : score >= 80 ? "B" : score >= 60 ? "C" : "D";
Console.WriteLine($"等级：{level}");

// 实际场景：根据条件选择不同值
int age = 20;
string canVote = age >= 18 ? "可以投票" : "未到投票年龄";
Console.WriteLine(canVote);

// 与 if-else 对比
// 三元运算符是表达式（有返回值），if-else 是语句（无返回值）
// 三元适合简单二选一，if-else 适合多步骤逻辑
\`\`\`

### 七、null 合并运算符（?? 和 ??=）

\`\`\`csharp
// ?? ：如果左边为 null，则返回右边；否则返回左边
string name = null;
string displayName = name ?? "匿名用户";   // name 为 null，返回 "匿名用户"
Console.WriteLine(displayName);            // 输出：匿名用户

string name2 = "张三";
string displayName2 = name2 ?? "匿名用户";  // name2 不为 null，返回 "张三"
Console.WriteLine(displayName2);            // 输出：张三

// ??= ：如果左边为 null，则把右边赋给左边
string config = null;
config ??= "默认配置";     // config 为 null，赋值为 "默认配置"
Console.WriteLine(config);  // 输出：默认配置

string config2 = "自定义配置";
config2 ??= "默认配置";     // config2 不为 null，保持不变
Console.WriteLine(config2);  // 输出：自定义配置

// 链式 ?? ：多个备选值
string v1 = null;
string v2 = null;
string v3 = "最终备选";
string result = v1 ?? v2 ?? v3 ?? "无值";  // 返回第一个非 null 值
Console.WriteLine(result);  // 输出：最终备选
\`\`\`

### 八、is / as 运算符

\`\`\`csharp
// is：检查对象是否为指定类型
object obj = "hello";
if (obj is string)
    Console.WriteLine("obj 是字符串");

// is 模式匹配（C# 7+）：检查类型并声明变量
if (obj is string s)
    Console.WriteLine($"字符串长度：{s.Length}");  // 直接使用 s

// as：尝试将对象转换为指定类型，失败返回 null
object obj2 = "world";
string str = obj2 as string;      // 转换成功，str = "world"
Console.WriteLine(str?.ToUpper()); // 输出 WORLD

object obj3 = 123;
string str2 = obj3 as string;      // 转换失败，str2 = null
Console.WriteLine(str2 ?? "null");  // 输出 null

// is vs as 对比
// is：返回 bool，只检查类型
// as：返回转换后的值或 null，同时完成转换
\`\`\`

### 九、typeof / sizeof

\`\`\`csharp
// typeof：获取类型的 System.Type 对象（编译时）
Type intType = typeof(int);           // 获取 int 的类型信息
Type stringType = typeof(string);     // 获取 string 的类型信息
Type listType = typeof(List<int>);    // 获取泛型类型信息
Console.WriteLine($"int 的类型名：{intType.Name}");          // Int32
Console.WriteLine($"int 的完整名：{intType.FullName}");     // System.Int32

// sizeof：获取值类型占用的字节数（仅限 unsafe 上下文或预定义类型）
int intSize = sizeof(int);            // 4 字节
int doubleSize = sizeof(double);      // 8 字节
int decimalSize = sizeof(decimal);    // 16 字节
int boolSize = sizeof(bool);          // 1 字节
Console.WriteLine($"int: {intSize} 字节, double: {doubleSize} 字节");
\`\`\`

### 十、运算符优先级

当多个运算符同时出现时，优先级决定计算顺序。从高到低排列：

| 优先级 | 运算符 | 结合性 |
| --- | --- | --- |
| 最高 | \`()\` \`[]\` \`.\` \`?.\` \`->\` | 左 |
| | \`++\`(后) \`--\`(后) \`new\` \`typeof\` \`sizeof\` | 右 |
| | \`!\` \`~\` \`++\`(前) \`--\`(前) \`(T)\` | 右 |
| | \`*\` \`/\` \`%\` | 左 |
| | \`+\` \`-\` | 左 |
| | \`<<\` \`>>\` | 左 |
| | \`<\` \`>\` \`<=\` \`>=\` \`is\` \`as\` | 左 |
| | \`==\` \`!=\` | 左 |
| | \`&\` | 左 |
| | \`^\` | 左 |
| | \`\\|\` | 左 |
| | \`&&\` | 左 |
| | \`\\|\\|\` | 左 |
| | \`??\` | 左 |
| | \`?:\` | 右 |
| 最低 | \`=\` \`+=\` \`-=\` 等 | 右 |

\`\`\`csharp
// 优先级实战：不确定时加括号，代码更清晰
int result = 2 + 3 * 4;          // 乘法优先：2 + 12 = 14
int result2 = (2 + 3) * 4;       // 括号优先：5 * 4 = 20
Console.WriteLine($"无括号：{result}，有括号：{result2}");

// 逻辑运算优先级：! > && > ||
bool r = true || false && false; // && 优先：true || false = true
bool r2 = (true || false) && false; // 括号优先：true && false = false
Console.WriteLine($"无括号：{r}，有括号：{r2}");

// ⭐ 建议：不确定优先级时，加括号！可读性 > 简洁
\`\`\`

### 十一、小结

| 运算符类别 | 关键运算符 | 日常使用频率 |
| --- | --- | --- |
| 算术 | \`+ - * / % ++ --\` | ⭐⭐⭐⭐⭐ |
| 比较 | \`== != > < >= <=\` | ⭐⭐⭐⭐⭐ |
| 逻辑 | \`&& \\|\\| !\` | ⭐⭐⭐⭐⭐ |
| 位运算 | \`& \\| ^ ~ << >>\` | ⭐⭐ |
| 赋值 | \`= += -= *= /=\` | ⭐⭐⭐⭐⭐ |
| 三元 | \`?:\` | ⭐⭐⭐⭐ |
| null 合并 | \`?? ??=\` | ⭐⭐⭐⭐⭐ |
| 类型检查 | \`is as\` | ⭐⭐⭐⭐ |
| 类型信息 | \`typeof sizeof\` | ⭐⭐ |

> 运算符是编程的"动词"，掌握它们才能写出流畅的代码。下一章我们深入字符串处理。`,
  },

  // ============================================================
  // 第四章：字符串完全指南
  // ============================================================
  {
    id: 'csharp3-ch04',
    group: '第一部分 入门基础',
    icon: '📝',
    title: '第四章 字符串完全指南',
    content: `## 第四章　字符串完全指南

本章是 C# 字符串处理的完整手册，涵盖字符串创建、转义、插值、常用方法、StringBuilder、比较等方方面面。

### 一、字符串创建方式

\`\`\`csharp
// 方式1：双引号字面量（最常用）
string s1 = "Hello, World!";

// 方式2：string.Empty（推荐替代 ""）
string s2 = string.Empty;        // 空字符串，比 "" 更明确表达意图
string s3 = "";                  // 也是空字符串，但语义不够明确

// 方式3：构造函数
string s4 = new string('*', 10); // 创建 10 个 * 字符：**********
Console.WriteLine(s4);

// 方式4：字符串插值
string name = "张三";
string s5 = $"你好，{name}！";    // 你好，张三！

// 方式5：+ 拼接（不推荐大量拼接，性能差）
string s6 = "Hello" + ", " + "World!";
\`\`\`

### 二、转义序列

\`\`\`csharp
// 常见转义字符
Console.WriteLine("换行符：第一行\\n第二行");     // \\n 换行
Console.WriteLine("制表符：列1\\t列2\\t列3");     // \\t 制表符（Tab）
Console.WriteLine("双引号：她说\\"你好\\"");       // \\" 双引号
Console.WriteLine("反斜杠：路径是 C:\\\\Users");   // \\\\ 反斜杠本身
Console.WriteLine("回车符：Hello\\rWorld");       // \\r 回车（回到行首）

// 完整转义序列列表
// \\'  单引号
// \\"  双引号
// \\\\  反斜杠
// \\0  空字符
// \\a  警报（响铃）
// \\b  退格
// \\f  换页
// \\n  换行
// \\r  回车
// \\t  水平制表符
// \\v  垂直制表符
// \\uXXXX  Unicode 字符（4 位十六进制）
// \\UXXXXXXXX  Unicode 字符（8 位十六进制）
\`\`\`

### 三、逐字字符串（@）⭐

\`\`\`csharp
// 逐字字符串：@ 前缀，转义序列不生效
// 非常适合 Windows 文件路径、正则表达式、多行文本

// 文件路径：不需要双写反斜杠
string path = @"C:\\Users\\张三\\Documents\\file.txt";
Console.WriteLine(path);  // C:\\Users\\张三\\Documents\\file.txt

// 多行文本：引号内的换行会被保留
string multiLine = @"第一行
第二行
第三行";
Console.WriteLine(multiLine);

// 逐字字符串中双引号：用两个双引号表示一个双引号
string quote = @"她说：""你好！""";
Console.WriteLine(quote);  // 她说："你好！"

// 正则表达式：不需要转义反斜杠
string pattern = @"\\d{3}-\\d{4}-\\d{4}";  // 匹配电话号码格式
\`\`\`

### 四、原始字符串字面量（\"\"\"）⭐ C# 11+

\`\`\`csharp
// 原始字符串字面量：三个双引号，最强大的字符串定义方式
// 无需任何转义，双引号和花括号都可以直接写

// JSON 字符串：不需要转义任何引号
string json = """
{
    "name": "张三",
    "age": 25,
    "city": "北京"
}
""";
Console.WriteLine(json);

// 包含 $ 和 {} 的文本：不需要转义
string template = """
使用 $"{变量}" 语法可以进行字符串插值。
""";
Console.WriteLine(template);

// 原始字符串 + 插值：$$ 表示插值符数量
string name = "张三";
string message = $$"""
你好，{{name}}！
欢迎使用 C# 12。
""";
Console.WriteLine(message);  // 你好，张三！\\n欢迎使用 C# 12。

// 缩进控制：结束的 """ 位置决定缩进基准
string indented = """
    这是第一行
        这是缩进的行
    这是第三行
    """;
// 输出时每行会去掉前面的共同缩进
\`\`\`

### 五、字符串插值格式化

\`\`\`csharp
// 基础插值
string name = "张三";
int age = 25;
Console.WriteLine($"姓名：{name}，年龄：{age}");

// 格式化说明符：{表达式:格式说明符}
double price = 19.99;
Console.WriteLine($"价格：{price:C}");   // C = 货币格式：¥19.99
Console.WriteLine($"价格：{price:N2}");  // N2 = 数字，2 位小数：19.99
Console.WriteLine($"百分比：{0.123:P1}"); // P1 = 百分比，1 位小数：12.3%

// 对齐：{表达式,宽度}  正数右对齐，负数左对齐
Console.WriteLine($"|{"姓名",-10}|{"年龄",5}|");
Console.WriteLine($"|{name,-10}|{age,5}|");
// 输出：
// |姓名      |  年龄|
// |张三      |   25|

// 插值中的条件表达式
int score = 85;
Console.WriteLine($"成绩：{score}，等级：{(score >= 90 ? "A" : score >= 60 ? "B" : "C")}");

// 插值中的方法调用
Console.WriteLine($"姓名大写：{name.ToUpper()}");
Console.WriteLine($"姓名长度：{name.Length}");
Console.WriteLine($"当前时间：{DateTime.Now:yyyy-MM-dd HH:mm:ss}");
\`\`\`

### 六、字符串常用方法 ⭐⭐⭐

\`\`\`csharp
string text = "  Hello, C# World!  ";

// --- 长度与访问 ---
Console.WriteLine($"长度：{text.Length}");              // 获取字符串字符数（空格也算）
Console.WriteLine($"首个字符：{text[0]}");              // 通过索引访问单个字符（只读）

// --- 查找与判断 ---
Console.WriteLine($"IndexOf 'C#'：{text.IndexOf("C#")}");     // 查找子串首次出现位置，未找到返回 -1
Console.WriteLine($"LastIndexOf 'l'：{text.LastIndexOf('l')}"); // 查找字符最后出现位置
Console.WriteLine($"Contains 'World'：{text.Contains("World")}"); // 是否包含子串
Console.WriteLine($"StartsWith 'He'：{text.StartsWith("He")}");  // 是否以指定字符串开头
Console.WriteLine($"EndsWith '!'：{text.EndsWith("!")}");        // 是否以指定字符串结尾

// --- 提取子串 ---
Console.WriteLine($"Substring：{text.Substring(2, 5)}");       // 从索引 2 开始取 5 个字符
Console.WriteLine($"Substring：{text.Substring(7)}");          // 从索引 7 开始取到末尾

// --- 大小写转换 ---
Console.WriteLine($"ToUpper：{text.ToUpper()}");               // 转为大写
Console.WriteLine($"ToLower：{text.ToLower()}");               // 转为小写

// --- 修剪空白 ---
Console.WriteLine($"Trim：'{text.Trim()}'");                   // 去掉首尾空白
Console.WriteLine($"TrimStart：'{text.TrimStart()}'");         // 只去掉开头空白
Console.WriteLine($"TrimEnd：'{text.TrimEnd()}'");             // 只去掉结尾空白
Console.WriteLine($"Trim('H')：'{text.Trim('H')}'");           // 去掉首尾指定字符

// --- 替换 ---
Console.WriteLine($"Replace：{text.Replace("World", "宇宙")}"); // 替换所有匹配项
Console.WriteLine($"Replace：{text.Replace(" ", "")}");         // 去掉所有空格

// --- 分割与连接 ---
string csv = "张三,李四,王五,赵六";
string[] names = csv.Split(',');                    // 按逗号分割成字符串数组
foreach (var n in names)
    Console.WriteLine($"  - {n}");

string joined = string.Join(" | ", names);          // 用分隔符连接数组
Console.WriteLine($"Join：{joined}");               // 张三 | 李四 | 王五 | 赵六

// --- 插入与移除 ---
string s = "Hello World";
Console.WriteLine($"Insert：{s.Insert(5, " C#")}");  // 在索引 5 处插入
Console.WriteLine($"Remove：{s.Remove(5, 6)}");      // 从索引 5 开始移除 6 个字符

// --- 补齐 ---
string num = "123";
Console.WriteLine($"PadLeft：'{num.PadLeft(8, '0')}'");   // 左侧补 0 到 8 位：00000123
Console.WriteLine($"PadRight：'{num.PadRight(8, '-')}'");  // 右侧补 - 到 8 位：123-----
\`\`\`

### 七、StringBuilder：高效字符串拼接 ⭐

\`\`\`csharp
// 为什么要用 StringBuilder？
// 普通字符串是不可变的，每次 + 拼接都会创建新字符串对象
// 大量拼接时 StringBuilder 性能远超 + 操作

using System.Text;  // StringBuilder 在 System.Text 命名空间

// 创建 StringBuilder
var sb = new StringBuilder();              // 空 StringBuilder
var sb2 = new StringBuilder("初始内容");    // 带初始内容
var sb3 = new StringBuilder(100);          // 预设容量（性能优化）

// 追加内容
sb.Append("Hello");                        // 追加字符串
sb.Append(' ');                            // 追加单个字符
sb.Append("World");                        // 继续追加
sb.AppendLine();                           // 追加换行符
sb.AppendLine("这是第二行");                // 追加内容并换行
sb.AppendFormat("价格：{0:C}", 19.99);     // 追加格式化字符串

// 插入
sb.Insert(0, "开头：");                    // 在指定位置插入

// 替换
sb.Replace("World", "C#");                 // 替换所有匹配项

// 移除
sb.Remove(0, 3);                           // 从索引 0 开始移除 3 个字符

// 转换为 string
string result = sb.ToString();             // 最终转换为普通字符串
Console.WriteLine(result);

// 性能对比：10 万次拼接
var sw = System.Diagnostics.Stopwatch.StartNew();

// 方式1：用 + 拼接（慢）
string s1 = "";
for (int i = 0; i < 100000; i++)
    s1 += "a";  // 每次循环都创建新字符串对象！
sw.Stop();
Console.WriteLine($"+ 拼接耗时：{sw.ElapsedMilliseconds}ms");

sw.Restart();
// 方式2：StringBuilder（快）
var sb4 = new StringBuilder();
for (int i = 0; i < 100000; i++)
    sb4.Append("a");  // 在同一个对象上追加，不创建新对象
string s2 = sb4.ToString();
sw.Stop();
Console.WriteLine($"StringBuilder 耗时：{sw.ElapsedMilliseconds}ms");
\`\`\`

### 八、字符串比较 ⭐

\`\`\`csharp
// == 运算符：区分大小写的顺序比较
Console.WriteLine($"'abc' == 'abc' : {"abc" == "abc"}");   // True
Console.WriteLine($"'abc' == 'ABC' : {"abc" == "ABC"}");   // False

// Equals：与 == 类似，但可指定比较规则
string a = "Hello";
string b = "hello";
Console.WriteLine(a.Equals(b));                            // False（默认区分大小写）
Console.WriteLine(a.Equals(b, StringComparison.OrdinalIgnoreCase)); // True（忽略大小写）

// Compare / CompareTo：返回 -1 / 0 / 1
int cmp = string.Compare("abc", "abd");  // -1（abc < abd）
Console.WriteLine($"Compare: {cmp}");

// string.Compare 指定比较规则
int cmp2 = string.Compare("abc", "ABC", StringComparison.OrdinalIgnoreCase);
Console.WriteLine($"忽略大小写比较：{cmp2}");  // 0（相等）

// Contains 忽略大小写
string text = "Hello World";
bool contains = text.Contains("world", StringComparison.OrdinalIgnoreCase);
Console.WriteLine($"忽略大小写包含：{contains}");  // True
\`\`\`

| 比较方式 | 语法 | 结果 | 适用场景 |
| --- | --- | --- | --- |
| \`==\` | \`s1 == s2\` | bool | 区分大小写的相等判断 |
| \`Equals\` | \`s1.Equals(s2, rule)\` | bool | 可指定比较规则 |
| \`Compare\` | \`string.Compare(s1, s2)\` | int | 排序时的比较 |
| \`Contains\` | \`s1.Contains(s2, rule)\` | bool | 子串包含判断 |

### 九、string.Empty vs ""

\`\`\`csharp
// string.Empty 和 "" 在运行时完全等价
// 但语义上有所不同：

// string.Empty：明确表达"空字符串"的意图
string name = string.Empty;  // 表示"名字为空"

// ""：字面量，可能被误认为是"忘记赋值"
string name2 = "";           // 看起来可能像占位符

// 最佳实践：对空字符串使用 string.Empty
// 对 null 使用 null
// 检查字符串是否为空或 null：
string? s = null;
bool isEmpty = string.IsNullOrEmpty(s);       // null 或 "" 返回 true
bool isWhite = string.IsNullOrWhiteSpace(s);   // null、"" 或纯空白 返回 true
\`\`\`

### 十、小结

| 知识点 | 关键内容 |
| --- | --- |
| 创建方式 | 双引号、string.Empty、new string() |
| 转义 | \\n \\t \\\\ \\" 等 |
| 逐字字符串 | @ 前缀，路径/正则/多行文本 |
| 原始字符串 | \"\"\" C# 11+，JSON/模板 |
| 插值格式化 | {表达式:格式}、对齐、条件表达式 |
| 常用方法 | Length、IndexOf、Substring、Replace、Split、Join、Trim |
| StringBuilder | 高效拼接，大量字符串操作首选 |
| 字符串比较 | ==、Equals、Compare、忽略大小写 |
| 空字符串 | string.Empty、IsNullOrEmpty、IsNullOrWhiteSpace |

> 字符串是编程中最常用的数据类型，熟练掌握这些方法能让你的代码如虎添翼。下一章我们学习控制台输入输出。`,
  },

  // ============================================================
  // 第五章：控制台输入输出与格式化
  // ============================================================
  {
    id: 'csharp3-ch05',
    group: '第一部分 入门基础',
    icon: '🖥️',
    title: '第五章 控制台输入输出与格式化',
    content: `## 第五章　控制台输入输出与格式化

本章全面讲解控制台程序的输入输出操作，包括读取用户输入、控制台颜色、格式化输出、对齐排版等实用技巧。

### 一、读取用户输入 ⭐

\`\`\`csharp
// Console.ReadLine()：读取一行文本（用户按回车结束）
// 返回值是 string?，可能为 null（如 Ctrl+Z 结束输入）
Console.Write("请输入你的名字：");
string? name = Console.ReadLine();       // 等待用户输入，按回车确认
Console.WriteLine($"你好，{name ?? "匿名用户"}！");

// 读取数字：ReadLine 返回字符串，需要转换
Console.Write("请输入你的年龄：");
string? ageStr = Console.ReadLine();
if (int.TryParse(ageStr, out int age))   // 安全转换，不会崩溃
{
    Console.WriteLine($"你今年 {age} 岁，明年 {age + 1} 岁");
}
else
{
    Console.WriteLine("输入的不是有效数字！");
}

// 读取多个值（空格分隔）
Console.Write("请输入两个数字（用空格分隔）：");
string? input = Console.ReadLine();
if (input != null)
{
    string[] parts = input.Split(' ');           // 按空格分割
    if (parts.Length >= 2 &&
        int.TryParse(parts[0], out int a) &&
        int.TryParse(parts[1], out int b))
    {
        Console.WriteLine($"{a} + {b} = {a + b}");
    }
}
\`\`\`

### 二、Console.ReadKey() 按鍵读取

\`\`\`csharp
// Console.ReadKey()：读取单个按键，无需按回车
// 适合菜单选择、确认操作等场景

Console.WriteLine("请按任意键继续...");
Console.ReadKey();                         // 读取按键，默认显示按键字符
Console.WriteLine();                       // 换行

Console.WriteLine("请按 Y 或 N 确认：");
ConsoleKeyInfo key = Console.ReadKey(true); // true 表示不显示按键字符
Console.WriteLine();                       // 手动换行

if (key.Key == ConsoleKey.Y)
    Console.WriteLine("你选择了 是");
else if (key.Key == ConsoleKey.N)
    Console.WriteLine("你选择了 否");
else
    Console.WriteLine("无效按键");

// ReadKey 返回的 ConsoleKeyInfo 包含：
// - Key：ConsoleKey 枚举，如 ConsoleKey.Enter
// - KeyChar：char 类型，按键的字符表示
// - Modifiers：修饰键，如 Ctrl、Shift、Alt
\`\`\`

### 三、Console.Clear()

\`\`\`csharp
// Console.Clear()：清空控制台屏幕
// 适合制作动态更新界面、菜单程序等

Console.WriteLine("这行会被清除");
Console.WriteLine("按任意键清屏...");
Console.ReadKey(true);
Console.Clear();                           // 清空控制台
Console.WriteLine("屏幕已清空！");
\`\`\`

### 四、控制台颜色 ⭐

\`\`\`csharp
// Console.ForegroundColor：设置前景色（文字颜色）
// Console.BackgroundColor：设置背景色
// Console.ResetColor()：恢复默认颜色

// 保存原始颜色，以便恢复
var originalFg = Console.ForegroundColor;
var originalBg = Console.BackgroundColor;

// 逐行输出不同颜色
Console.ForegroundColor = ConsoleColor.Red;
Console.WriteLine("红色文字：错误信息");

Console.ForegroundColor = ConsoleColor.Green;
Console.WriteLine("绿色文字：成功信息");

Console.ForegroundColor = ConsoleColor.Yellow;
Console.WriteLine("黄色文字：警告信息");

Console.ForegroundColor = ConsoleColor.Cyan;
Console.WriteLine("青色文字：提示信息");

// 背景色
Console.BackgroundColor = ConsoleColor.DarkBlue;
Console.ForegroundColor = ConsoleColor.White;
Console.WriteLine("白字深蓝底：标题样式");

// 恢复默认颜色
Console.ResetColor();
Console.WriteLine("恢复默认颜色");

// 颜色枚举列表
// Black, DarkBlue, DarkGreen, DarkCyan, DarkRed, DarkMagenta,
// DarkYellow, Gray, DarkGray, Blue, Green, Cyan, Red,
// Magenta, Yellow, White

// 实战：彩色菜单
Console.Clear();
Console.ForegroundColor = ConsoleColor.Cyan;
Console.WriteLine("========== 主菜单 ==========");
Console.ResetColor();
Console.ForegroundColor = ConsoleColor.Green;
Console.WriteLine("1. 新建文件");
Console.WriteLine("2. 打开文件");
Console.WriteLine("3. 保存文件");
Console.ForegroundColor = ConsoleColor.Red;
Console.WriteLine("4. 退出");
Console.ResetColor();
Console.WriteLine("============================");
Console.Write("请选择：");
\`\`\`

### 五、Console.Beep()

\`\`\`csharp
// Console.Beep()：发出系统提示音
// Console.Beep(frequency, duration)：指定频率和持续时间

// 简单提示音
Console.Beep();                            // 默认频率和时长的提示音

// 自定义频率和时长
Console.Beep(800, 200);                    // 800Hz，持续 200 毫秒

// 简便音阶（趣味）
Console.Beep(262, 200);  // Do
Console.Beep(294, 200);  // Re
Console.Beep(330, 200);  // Mi
Console.Beep(349, 200);  // Fa
Console.Beep(392, 200);  // Sol
\`\`\`

### 六、数值格式化 ⭐⭐

\`\`\`csharp
double value = 12345.6789;

// --- 标准格式说明符 ---
// C / c：货币格式
Console.WriteLine($"货币：{value:C}");       // ¥12,345.68（默认 2 位小数）
Console.WriteLine($"货币：{value:C3}");      // ¥12,345.679（3 位小数）

// N / n：数字格式（千位分隔符）
Console.WriteLine($"数字：{value:N}");       // 12,345.68
Console.WriteLine($"数字：{value:N1}");      // 12,345.7

// P / p：百分比格式
double percent = 0.1234;
Console.WriteLine($"百分比：{percent:P}");   // 12.34%
Console.WriteLine($"百分比：{percent:P1}");  // 12.3%

// D / d：十进制格式（仅整数）
int number = 123;
Console.WriteLine($"十进制：{number:D}");    // 123
Console.WriteLine($"十进制：{number:D6}");   // 000123（补零到 6 位）

// F / f：固定小数位
Console.WriteLine($"固定小数：{value:F}");   // 12345.68（默认 2 位）
Console.WriteLine($"固定小数：{value:F4}");  // 12345.6789

// G / g：常规格式（自动选择最紧凑的表示）
Console.WriteLine($"常规：{value:G}");       // 12345.6789

// E / e：科学计数法
Console.WriteLine($"科学计数：{value:E}");   // 1.234568E+004
Console.WriteLine($"科学计数：{value:e2}");  // 1.23e+004

// X / x：十六进制（仅整数）
int hex = 255;
Console.WriteLine($"十六进制：{hex:X}");     // FF
Console.WriteLine($"十六进制：{hex:x4}");    // 00ff

// 0 占位符：缺少的数字用 0 填充
Console.WriteLine($"{123:00000}");           // 00123
Console.WriteLine($"{12.3:000.00}");         // 012.30

// # 占位符：缺少的数字不显示
Console.WriteLine($"{123:#####}");           // 123
Console.WriteLine($"{12.3:###.##}");         // 12.3

// 自定义格式
Console.WriteLine($"{1234567890:###-###-####}"); // 123-456-7890（电话号码格式）
\`\`\`

### 七、日期格式化

\`\`\`csharp
DateTime now = DateTime.Now;

// --- 标准日期格式说明符 ---
Console.WriteLine($"短日期：{now:d}");           // 2024/1/15
Console.WriteLine($"长日期：{now:D}");           // 2024年1月15日
Console.WriteLine($"完整：{now:f}");             // 2024年1月15日 14:30
Console.WriteLine($"完整长：{now:F}");           // 2024年1月15日 14:30:00
Console.WriteLine($"短时间：{now:t}");           // 14:30
Console.WriteLine($"长时间：{now:T}");           // 14:30:00
Console.WriteLine($"可排序：{now:s}");           // 2024-01-15T14:30:00
Console.WriteLine($"通用：{now:u}");             // 2024-01-15 14:30:00Z

// --- 自定义日期格式 ---
Console.WriteLine($"{now:yyyy-MM-dd}");          // 2024-01-15
Console.WriteLine($"{now:yyyy年MM月dd日}");       // 2024年01月15日
Console.WriteLine($"{now:HH:mm:ss}");            // 14:30:00
Console.WriteLine($"{now:yyyy-MM-dd HH:mm:ss}"); // 2024-01-15 14:30:00
Console.WriteLine($"{now:yyyy-MM-dd ddd}");      // 2024-01-15 周一

// 格式符说明
// yyyy : 四位年份
// yy   : 两位年份
// MM   : 两位月份（01-12）
// dd   : 两位日期（01-31）
// HH   : 24 小时制（00-23）
// hh   : 12 小时制（01-12）
// mm   : 分钟（00-59）
// ss   : 秒（00-59）
// fff  : 毫秒（000-999）
// ddd  : 星期缩写
// dddd : 星期全称
// tt   : AM/PM
\`\`\`

### 八、对齐与填充

\`\`\`csharp
// {索引,宽度}：正数右对齐，负数左对齐
// 宽度是字符数，不足则填空格，超过则原样输出

// 表格对齐实战
Console.WriteLine($"{"商品",-10} {"单价",8} {"数量",6} {"小计",10}");
Console.WriteLine(new string('-', 36));  // 分隔线

string[] items = { "苹果", "香蕉", "西瓜", "葡萄" };
double[] prices = { 5.5, 3.0, 15.0, 8.8 };
int[] qty = { 3, 5, 1, 2 };

for (int i = 0; i < items.Length; i++)
{
    double subtotal = prices[i] * qty[i];
    // 商品名左对齐 10 位，单价右对齐 8 位，数量右对齐 6 位，小计右对齐 10 位
    Console.WriteLine($"{items[i],-10} {prices[i],8:C} {qty[i],6} {subtotal,10:C}");
}

// 输出：
// 商品       单价   数量      小计
// ------------------------------------
// 苹果        ¥5.50     3     ¥16.50
// 香蕉        ¥3.00     5     ¥15.00
// 西瓜       ¥15.00     1     ¥15.00
// 葡萄        ¥8.80     2     ¥17.60
\`\`\`

### 九、复合格式化（string.Format 风格）

\`\`\`csharp
// string.Format 和 Console.WriteLine 都支持复合格式化
// 用 {索引} 占位，后面跟参数

string name = "张三";
int age = 25;
double height = 1.75;

// 按索引占位
Console.WriteLine("{0} 今年 {1} 岁，身高 {2} 米", name, age, height);

// 同一个参数可以多次使用
Console.WriteLine("{0} 的年龄是 {1}，{0} 的身高是 {2}", name, age, height);

// 对齐 + 格式化
Console.WriteLine("姓名：{0,-10} 年龄：{1,5} 身高：{2,8:F2}", name, age, height);

// 与 $ 插值对比
// $ 插值：更直观，推荐日常使用
Console.WriteLine($"{name} 今年 {age} 岁，身高 {height:F2} 米");

// 复合格式化：参数与模板分离，适合多语言/模板场景
string template = "{0} 今年 {1} 岁";
Console.WriteLine(template, name, age);  // 可以复用模板
\`\`\`

### 十、实战 demo：交互式计算器

\`\`\`csharp
// 综合运用本章所有知识：一个完整的控制台计算器

// 设置标题颜色
Console.ForegroundColor = ConsoleColor.Cyan;
Console.WriteLine("╔══════════════════════════╗");
Console.WriteLine("║    简易计算器 v1.0       ║");
Console.WriteLine("╚══════════════════════════╝");
Console.ResetColor();
Console.WriteLine();

// 主循环
while (true)
{
    // 第一步：获取第一个数字
    Console.Write("请输入第一个数字：");
    string? input1 = Console.ReadLine();
    if (string.IsNullOrWhiteSpace(input1)) break;  // 空输入退出
    if (!double.TryParse(input1, out double num1))
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("错误：请输入有效数字！");
        Console.ResetColor();
        continue;
    }

    // 第二步：获取运算符
    Console.Write("请输入运算符（+、-、*、/）：");
    string? op = Console.ReadLine();
    if (string.IsNullOrWhiteSpace(op)) break;

    // 第三步：获取第二个数字
    Console.Write("请输入第二个数字：");
    string? input2 = Console.ReadLine();
    if (string.IsNullOrWhiteSpace(input2)) break;
    if (!double.TryParse(input2, out double num2))
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("错误：请输入有效数字！");
        Console.ResetColor();
        continue;
    }

    // 第四步：计算并输出结果
    double result = 0;
    bool valid = true;
    switch (op)
    {
        case "+":
            result = num1 + num2;
            break;
        case "-":
            result = num1 - num2;
            break;
        case "*":
            result = num1 * num2;
            break;
        case "/":
            if (num2 == 0)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("错误：除数不能为零！");
                Console.ResetColor();
                valid = false;
                break;
            }
            result = num1 / num2;
            break;
        default:
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("错误：不支持的运算符！");
            Console.ResetColor();
            valid = false;
            break;
    }

    if (valid)
    {
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"结果：{num1} {op} {num2} = {result:F2}");
        Console.ResetColor();
    }
    Console.WriteLine();
}

Console.ForegroundColor = ConsoleColor.Yellow;
Console.WriteLine("感谢使用，再见！");
Console.ResetColor();
\`\`\`

### 十一、小结

| 知识点 | 关键内容 |
| --- | --- |
| 输入 | ReadLine() 读取一行，ReadKey() 读取按键 |
| 颜色 | ForegroundColor、BackgroundColor、ResetColor() |
| 清屏 | Console.Clear() |
| 提示音 | Console.Beep() |
| 数值格式化 | C/N/P/D/F/G/E/X、自定义格式串 |
| 日期格式化 | d/D/f/F/t/T/s/u、自定义 yyyy-MM-dd |
| 对齐 | {索引,宽度} 正右负左 |
| 复合格式化 | {0} {1} 索引占位 |

> 至此，你已经掌握了 C# 控制台程序的所有基础操作。从下一章开始，我们将进入第二部分——控制流，学习条件判断和循环结构。`,
  },
];

export { chapters };