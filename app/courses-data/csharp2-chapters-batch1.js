// =============================================================
// C# 大全 - 第一部分 基础入门（第 1-10 章）
// -------------------------------------------------------------
// 本批包含 11 章：
//   csharp2-preface : 前言
//   csharp2-ch01    : 第一个程序与环境搭建
//   csharp2-ch02    : 变量与数据类型
//   csharp2-ch03    : 运算符与表达式
//   csharp2-ch04    : 控制流：条件语句
//   csharp2-ch05    : 控制流：循环语句
//   csharp2-ch06    : 数组与字符串
//   csharp2-ch07    : 方法（函数）
//   csharp2-ch08    : 异常处理
//   csharp2-ch09    : 命名空间与程序结构
//   csharp2-ch10    : 调试技巧与最佳实践
//
// 风格：demo 驱动，每章直接上手写代码，多注释，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 前言
  // ============================================================
  {
    id: 'csharp2-preface',
    group: '开篇',
    icon: '📖',
    title: '前言',
    content: `## 前言

### 一、这本教程讲什么

这是一本**大而全**的 C# 教程，目标是用 60 章的篇幅，覆盖 C# 日常开发 **100%** 会用到的知识点。

和传统教程不同，本书：
- **不讲废话**：跳过历史、理论堆砌，直接讲"怎么用"
- **demo 驱动**：每个知识点都有可运行的代码示例
- **注释详细**：代码里写满注释，解释"为什么这样写"
- **循序渐进**：从基础语法到高级特性，一步步深入

学完本书，你能做到：
- 用 C# 写出各种控制台程序，处理日常开发任务
- 熟练使用面向对象编程，写出可维护的工程化代码
- 掌握集合、泛型、LINQ、异步编程等核心能力
- 看懂 .NET 项目的代码结构，上手 ASP.NET Core / Unity / MAUI 不会一头雾水
- 熟练使用文件 IO、JSON、HTTP、数据库等实战技能

### 二、本书的版本约定

- **.NET 8 LTS**（长期支持版本，生产环境首选）
- **C# 12**（随 .NET 8 发布的语法版本）
- **顶级语句**（C# 9+ 特性，控制台程序无需 \`class Program\` / \`Main\`）

> 沙箱环境使用 .NET 8.0.412，所有示例代码都可以直接运行。

### 三、怎么用这本教程

每章的结构都是：

1. **一两句话讲清楚这章干什么**
2. **直接给可运行的代码**——点击"运行"按钮看结果
3. **代码里写满注释**——重点解释为什么这样写
4. **小结**——这章学到了什么

建议：

- **不要只读不敲**。把每段代码复制到编辑器里改一改、跑一跑，看输出变化
- **遇到看不懂的先跳过**。C# 有些高级特性第一次看会懵，往后学几章再回头看就懂了
- **重点掌握带 ⭐ 标记的知识点**，这些是日常开发 80% 场景都用得到的

### 四、全书目录一览

| 部分 | 章节 | 主题 |
| --- | --- | --- |
| 第一部分 基础入门 | 第 1-10 章 | 环境搭建、变量类型、运算符、控制流、数组字符串、方法、异常、命名空间、调试 |
| 第二部分 面向对象 | 第 11-20 章 | 类与对象、构造函数、属性、继承多态、接口、静态类、枚举结构体、记录类型 |
| 第三部分 集合与泛型 | 第 21-30 章 | 泛型、集合接口、List、Dictionary、Queue、Stack、HashSet、LINQ、迭代器 |
| 第四部分 高级特性 | 第 31-40 章 | 委托、Lambda、事件、反射、动态类型、运算符重载、索引器、模式匹配、可空类型、元组 |
| 第五部分 异步与并发 | 第 41-50 章 | async/await、Task、异步流、并行编程、线程、锁、并发集合、最佳实践 |
| 第六部分 实战应用 | 第 51-60 章 | 文件 IO、流、JSON、HTTP、数据库、EF Core、LINQ to Entities、单元测试、综合项目 |

> 准备好了吗？翻到第一章，开始写代码。`,
  },

  // ============================================================
  // 第一章：第一个程序与环境搭建
  // ============================================================
  {
    id: 'csharp2-ch01',
    group: '第一部分 基础入门',
    icon: '🚀',
    title: '第一个程序与环境搭建',
    content: `## 第一个程序与环境搭建

### 一、5 分钟写出第一个程序

C# 程序可以非常简洁。下面是一个完整可运行的程序：

\`\`\`csharp
// 这是 C# 的顶级语句：直接写代码，不用套 class/Main
// Console.WriteLine 向控制台输出一行文字并换行
Console.WriteLine("你好，C#！");

// 用 $ 前缀的字符串插值，{} 里可以放任何表达式
string name = "开发者";
int year = 2026;
Console.WriteLine($"欢迎 {name}，现在是 {year} 年");

// 简单算术
int a = 15, b = 27;
Console.WriteLine($"{a} + {b} = {a + b}");
Console.WriteLine($"{a} * {b} = {a * b}");
\`\`\`

看到了吗？没有 \`class\`、没有 \`Main\`、没有一堆样板代码。**现代 C# 可以非常简洁**。

### 二、程序的基本结构

一个 C# 程序由以下部分组成：

\`\`\`csharp
// 1. 命名空间（可选，用于组织代码）
// using System;  // .NET 6+ 默认隐式引入，无需手动写

// 2. 顶级语句（C# 9+ 特性）
// 直接写代码，编译器会自动生成 class 和 Main 方法
Console.WriteLine("这是顶级语句");

// 3. 也可以定义类、方法等
class MyClass
{
    public void SayHello()
    {
        Console.WriteLine("Hello from MyClass");
    }
}

// 4. 使用自定义类
var obj = new MyClass();
obj.SayHello();
\`\`\`

### 三、注释

C# 支持三种注释：

\`\`\`csharp
// 1. 单行注释：从 // 到行尾
int x = 10; // 这也是注释

/* 2. 多行注释：从 /* 到 * /
   可以跨越多行
   适合写大段说明 */
int y = 20;

/// 3. XML 文档注释：以 /// 开头
/// 用于生成 API 文档，IDE 会显示提示
/// <summary>
/// 这是一个示例方法
/// </summary>
/// <param name="name">参数说明</param>
void MyMethod(string name)
{
    Console.WriteLine($"Hello {name}");
}

MyMethod("World");
\`\`\`

### 四、分号与代码块

C# 用分号 \`;\` 结束语句，用花括号 \`{}\` 定义代码块：

\`\`\`csharp
// 每条语句以分号结束
int a = 10;
int b = 20;
int c = a + b;

// 花括号定义代码块
if (c > 25)
{
    Console.WriteLine("c 大于 25");
    Console.WriteLine($"c 的值是 {c}");
}
else
{
    Console.WriteLine("c 小于等于 25");
}

// 代码块可以嵌套
for (int i = 0; i < 3; i++)
{
    Console.WriteLine($"外层循环 i = {i}");
    for (int j = 0; j < 2; j++)
    {
        Console.WriteLine($"  内层循环 j = {j}");
    }
}
\`\`\`

### 五、大小写敏感

C# 是大小写敏感的语言：

\`\`\`csharp
// 这些是不同的变量
int myVar = 10;
int MyVar = 20;
int MYVAR = 30;

Console.WriteLine($"myVar = {myVar}");  // 输出 10
Console.WriteLine($"MyVar = {MyVar}");  // 输出 20
Console.WriteLine($"MYVAR = {MYVAR}");  // 输出 30

// 关键字必须小写
// int, if, else, for, while, class, public 等
// 写成 Int, IF, Else 会报错
\`\`\`

### 六、小结

本章学到了：
- 用顶级语句写出第一个 C# 程序
- 程序的三种注释方式
- 分号和代码块的作用
- C# 是大小写敏感的语言

下一章我们学习变量与数据类型。`,
  },

  // ============================================================
  // 第二章：变量与数据类型
  // ============================================================
  {
    id: 'csharp2-ch02',
    group: '第一部分 基础入门',
    icon: '📦',
    title: '变量与数据类型',
    content: `## 变量与数据类型

### 一、变量声明

变量是用来存储数据的容器。C# 是强类型语言，每个变量都有类型：

\`\`\`csharp
// 声明变量的语法：类型 变量名 = 值;
int age = 25;              // 整数
string name = "张三";       // 字符串
double price = 99.9;       // 双精度浮点数
bool isActive = true;      // 布尔值

Console.WriteLine($"姓名：{name}，年龄：{age}");
Console.WriteLine($"价格：{price}，激活：{isActive}");

// 可以先声明后赋值
int count;
count = 100;
Console.WriteLine($"count = {count}");

// 用 var 让编译器推断类型（推荐用于复杂类型）
var x = 10;          // 编译器推断为 int
var text = "hello";  // 编译器推断为 string
var pi = 3.14;       // 编译器推断为 double

Console.WriteLine($"x = {x}, text = {text}, pi = {pi}");
\`\`\`

### 二、整数类型

C# 提供多种整数类型，占用空间不同：

\`\`\`csharp
// sbyte: -128 到 127（有符号 8 位）
sbyte smallNum = 100;
Console.WriteLine($"sbyte 范围：{sbyte.MinValue} 到 {sbyte.MaxValue}");

// byte: 0 到 255（无符号 8 位）
byte b = 200;
Console.WriteLine($"byte 范围：{byte.MinValue} 到 {byte.MaxValue}");

// short: -32768 到 32767（有符号 16 位）
short s = 30000;
Console.WriteLine($"short 范围：{short.MinValue} 到 {short.MaxValue}");

// ushort: 0 到 65535（无符号 16 位）
ushort us = 60000;
Console.WriteLine($"ushort 范围：{ushort.MinValue} 到 {ushort.MaxValue}");

// int: -21 亿到 21 亿（有符号 32 位）⭐ 最常用
int i = 1000000;
Console.WriteLine($"int 范围：{int.MinValue} 到 {int.MaxValue}");

// uint: 0 到 42 亿（无符号 32 位）
uint ui = 3000000000;
Console.WriteLine($"uint 范围：{uint.MinValue} 到 {uint.MaxValue}");

// long: 更大的整数（有符号 64 位）⭐ 大数用这个
long l = 9000000000000000000;
Console.WriteLine($"long 范围：{long.MinValue} 到 {long.MaxValue}");

// ulong: 无符号 64 位
ulong ul = 18000000000000000000;
Console.WriteLine($"ulong 范围：{ulong.MinValue} 到 {ulong.MaxValue}");

// nint/nuint: 原生整数（64 位系统上是 64 位）
nint nativeInt = 12345;
Console.WriteLine($"nint = {nativeInt}");
\`\`\`

### 三、浮点数与小数

\`\`\`csharp
// float: 单精度浮点数（32 位），有效数字约 7 位
float f = 3.14f;  // 必须加 f 后缀
Console.WriteLine($"float: {f}");

// double: 双精度浮点数（64 位），有效数字约 15-16 位 ⭐ 最常用
double d = 3.14159265358979;
Console.WriteLine($"double: {d}");

// decimal: 高精度小数（128 位），有效数字 28-29 位 ⭐ 金融计算用这个
decimal m = 3.1415926535897932384626433832m;  // 必须加 m 后缀
Console.WriteLine($"decimal: {m}");

// 为什么金融用 decimal？
double a = 0.1 + 0.2;
decimal b = 0.1m + 0.2m;
Console.WriteLine($"double: 0.1 + 0.2 = {a}");      // 0.30000000000000004（精度丢失）
Console.WriteLine($"decimal: 0.1 + 0.2 = {b}");     // 0.3（精确）
\`\`\`

### 四、布尔类型

\`\`\`csharp
// bool: true 或 false
bool isAdult = true;
bool isStudent = false;

Console.WriteLine($"isAdult: {isAdult}");
Console.WriteLine($"isStudent: {isStudent}");

// 布尔值常用于条件判断
int age = 20;
bool canDrive = age >= 18;
Console.WriteLine($"可以开车吗？{canDrive}");

// 布尔运算
bool result1 = true && false;  // 与：两者都为 true 才是 true
bool result2 = true || false;  // 或：有一个为 true 就是 true
bool result3 = !true;          // 非：取反

Console.WriteLine($"true && false = {result1}");
Console.WriteLine($"true || false = {result2}");
Console.WriteLine($"!true = {result3}");
\`\`\`

### 五、字符类型

\`\`\`csharp
// char: 单个字符，用单引号
char letter = 'A';
char chinese = '中';
char digit = '0';
char symbol = '@';

Console.WriteLine($"letter: {letter}");
Console.WriteLine($"chinese: {chinese}");
Console.WriteLine($"digit: {digit}");
Console.WriteLine($"symbol: {symbol}");

// 转义字符
char newline = '\\n';  // 换行符
char tab = '\\t';      // 制表符
char quote = '\\'';    // 单引号
char backslash = '\\\\'; // 反斜杠

Console.WriteLine($"换行符：{newline}");
Console.WriteLine($"制表符：{tab}");
Console.WriteLine($"单引号：{quote}");
Console.WriteLine($"反斜杠：{backslash}");

// Unicode 字符
char heart = '\\u2665';  // 黑桃
Console.WriteLine($"Unicode: {heart}");
\`\`\`

### 六、字符串类型

\`\`\`csharp
// string: 字符串，用双引号
string greeting = "你好";
string name = "世界";

// 字符串拼接
string message = greeting + "，" + name + "！";
Console.WriteLine(message);

// 字符串插值（推荐）⭐
string message2 = $"{greeting}，{name}！";
Console.WriteLine(message2);

// 多行字符串（C# 11+）
string multiLine = """
    这是第一行
    这是第二行
    这是第三行
    """;
Console.WriteLine(multiLine);

// 原始字符串（@ 前缀，不处理转义）
string path = @"C:\\Users\\Admin\\Documents";
Console.WriteLine($"路径：{path}");

// 空字符串与 null
string empty = "";
string nullStr = null;
Console.WriteLine($"空字符串长度：{empty.Length}");
// Console.WriteLine(nullStr.Length);  // 会抛出 NullReferenceException
\`\`\`

### 七、类型转换

\`\`\`csharp
// 隐式转换：小类型自动转大类型
int intVal = 100;
long longVal = intVal;  // int 自动转 long
double doubleVal = intVal;  // int 自动转 double

Console.WriteLine($"longVal: {longVal}");
Console.WriteLine($"doubleVal: {doubleVal}");

// 显式转换：大类型转小类型需要强制转换
double pi = 3.14;
int intPi = (int)pi;  // 强制转换，会丢失小数部分
Console.WriteLine($"intPi: {intPi}");  // 输出 3

// 数值之间的转换
long bigNum = 1000000;
int smallNum = (int)bigNum;  // 可能溢出
Console.WriteLine($"smallNum: {smallNum}");

// 使用 Convert 类
string numStr = "123";
int parsed = Convert.ToInt32(numStr);
Console.WriteLine($"parsed: {parsed}");

double numDouble = Convert.ToDouble(numStr);
Console.WriteLine($"numDouble: {numDouble}");

// Parse 和 TryParse
string input = "456";
if (int.TryParse(input, out int result))
{
    Console.WriteLine($"解析成功：{result}");
}
else
{
    Console.WriteLine("解析失败");
}

// 字符串转其他类型
bool boolVal = bool.Parse("true");
DateTime dateVal = DateTime.Parse("2026-01-01");
Console.WriteLine($"boolVal: {boolVal}");
Console.WriteLine($"dateVal: {dateVal}");
\`\`\`

### 八、常量与只读变量

\`\`\`csharp
// const: 编译时常量，必须在声明时赋值
const double PI = 3.14159;
const string APP_NAME = "MyApp";
const int MAX_COUNT = 100;

Console.WriteLine($"PI: {PI}");
Console.WriteLine($"APP_NAME: {APP_NAME}");
Console.WriteLine($"MAX_COUNT: {MAX_COUNT}");

// const 的值在编译时就确定了，不能修改
// PI = 3.14;  // 编译错误！

// readonly: 运行时常量，可以在构造函数中赋值
class Config
{
    public readonly string ConnectionString;
    
    public Config(string connStr)
    {
        ConnectionString = connStr;  // 在构造函数中赋值
    }
    
    public void Show()
    {
        Console.WriteLine($"连接字符串：{ConnectionString}");
    }
}

var config = new Config("Server=localhost;Database=mydb");
config.Show();
\`\`\`

### 九、小结

本章学到了：
- 变量声明与 \`var\` 关键字
- 整数类型：\`sbyte\`/\`byte\`/\`short\`/\`ushort\`/\`int\`/\`uint\`/\`long\`/\`ulong\`
- 浮点数：\`float\`/\`double\`/\`decimal\`
- 布尔类型 \`bool\` 和字符类型 \`char\`
- 字符串 \`string\` 的各种用法
- 类型转换：隐式转换、显式转换、\`Convert\` 类、\`Parse\`/\`TryParse\`
- 常量 \`const\` 和只读变量 \`readonly\`

下一章我们学习运算符与表达式。`,
  },

  // ============================================================
  // 第三章：运算符与表达式
  // ============================================================
  {
    id: 'csharp2-ch03',
    group: '第一部分 基础入门',
    icon: '➕',
    title: '运算符与表达式',
    content: `## 运算符与表达式

### 一、算术运算符

\`\`\`csharp
// 基本算术运算符
int a = 10, b = 3;

Console.WriteLine($"a + b = {a + b}");  // 加法：13
Console.WriteLine($"a - b = {a - b}");  // 减法：7
Console.WriteLine($"a * b = {a * b}");  // 乘法：30
Console.WriteLine($"a / b = {a / b}");  // 整数除法：3（注意：不是 3.33）
Console.WriteLine($"a % b = {a % b}");  // 取余：1

// 整数除法会截断小数部分
int x = 7, y = 2;
Console.WriteLine($"7 / 2 = {x / y}");  // 输出 3，不是 3.5

// 要得到小数结果，至少一个操作数是浮点数
double result1 = 7.0 / 2;    // 3.5
double result2 = 7 / 2.0;    // 3.5
double result3 = (double)7 / 2;  // 3.5
Console.WriteLine($"7.0 / 2 = {result1}");
Console.WriteLine($"7 / 2.0 = {result2}");
Console.WriteLine($"(double)7 / 2 = {result3}");

// 一元运算符
int c = 5;
Console.WriteLine($"+c = {+c}");  // 正号：5
Console.WriteLine($"-c = {-c}");  // 负号：-5

c++;  // 后缀自增：先使用 c，再 c = c + 1
Console.WriteLine($"c++ 后：{c}");  // 6

++c;  // 前缀自增：先 c = c + 1，再使用 c
Console.WriteLine($"++c 后：{c}");  // 7

c--;  // 后缀自减
Console.WriteLine($"c-- 后：{c}");  // 6

--c;  // 前缀自减
Console.WriteLine($"--c 后：{c}");  // 5
\`\`\`

### 二、赋值运算符

\`\`\`csharp
// 基本赋值
int x = 10;
Console.WriteLine($"x = {x}");

// 复合赋值运算符
x += 5;   // x = x + 5
Console.WriteLine($"x += 5: {x}");  // 15

x -= 3;   // x = x - 3
Console.WriteLine($"x -= 3: {x}");  // 12

x *= 2;   // x = x * 2
Console.WriteLine($"x *= 2: {x}");  // 24

x /= 4;   // x = x / 4
Console.WriteLine($"x /= 4: {x}");  // 6

x %= 4;   // x = x % 4
Console.WriteLine($"x %= 4: {x}");  // 2

// 位运算赋值
int y = 10;  // 二进制 1010
y &= 6;      // y = y & 6 (1010 & 0110 = 0010)
Console.WriteLine($"y &= 6: {y}");  // 2

y = 10;
y |= 6;      // y = y | 6 (1010 | 0110 = 1110)
Console.WriteLine($"y |= 6: {y}");  // 14

y = 10;
y ^= 6;      // y = y ^ 6 (1010 ^ 0110 = 1100)
Console.WriteLine($"y ^= 6: {y}");  // 12

y = 10;
y <<= 2;     // y = y << 2 (1010 << 2 = 101000)
Console.WriteLine($"y <<= 2: {y}");  // 40

y = 10;
y >>= 2;     // y = y >> 2 (1010 >> 2 = 0010)
Console.WriteLine($"y >>= 2: {y}");  // 2
\`\`\`

### 三、比较运算符

\`\`\`csharp
// 比较运算符返回 bool 值
int a = 10, b = 20;

Console.WriteLine($"a == b: {a == b}");  // 等于：false
Console.WriteLine($"a != b: {a != b}");  // 不等于：true
Console.WriteLine($"a > b: {a > b}");    // 大于：false
Console.WriteLine($"a < b: {a < b}");    // 小于：true
Console.WriteLine($"a >= b: {a >= b}");  // 大于等于：false
Console.WriteLine($"a <= b: {a <= b}");  // 小于等于：true

// 字符串比较
string s1 = "hello";
string s2 = "hello";
string s3 = "Hello";

Console.WriteLine($"s1 == s2: {s1 == s2}");  // true（内容相同）
Console.WriteLine($"s1 == s3: {s1 == s3}");  // false（大小写敏感）

// 引用比较
object obj1 = s1;
object obj2 = s2;
Console.WriteLine($"obj1 == obj2: {obj1 == obj2}");  // true（字符串池优化）

// 使用 Equals 方法
Console.WriteLine($"s1.Equals(s3): {s1.Equals(s3)}");  // false
Console.WriteLine($"s1.Equals(s3, StringComparison.OrdinalIgnoreCase): {s1.Equals(s3, StringComparison.OrdinalIgnoreCase)}");  // true（忽略大小写）
\`\`\`

### 四、逻辑运算符

\`\`\`csharp
// &&: 逻辑与（短路与）
bool a = true, b = false;
Console.WriteLine($"a && b: {a && b}");  // false

// ||: 逻辑或（短路或）
Console.WriteLine($"a || b: {a || b}");  // true

// !: 逻辑非
Console.WriteLine($"!a: {!a}");  // false
Console.WriteLine($"!b: {!b}");  // true

// 短路特性：如果第一个操作数能确定结果，就不计算第二个
int x = 10;
bool result1 = (x > 5) && (x < 20);  // true && true = true
bool result2 = (x > 15) && (x < 20); // false && (不计算) = false
bool result3 = (x > 5) || (x < 20);  // true || (不计算) = true
bool result4 = (x > 15) || (x < 5);  // false || false = false

Console.WriteLine($"result1: {result1}");
Console.WriteLine($"result2: {result2}");
Console.WriteLine($"result3: {result3}");
Console.WriteLine($"result4: {result4}");

// &: 逻辑与（非短路）
// |: 逻辑或（非短路）
// ^: 逻辑异或
Console.WriteLine($"true & false: {true & false}");  // false
Console.WriteLine($"true | false: {true | false}");  // true
Console.WriteLine($"true ^ false: {true ^ false}");  // true
Console.WriteLine($"true ^ true: {true ^ true}");    // false
\`\`\`

### 五、位运算符

\`\`\`csharp
// 位运算符操作二进制位
int a = 10;  // 二进制 1010
int b = 6;   // 二进制 0110

// & : 按位与（两位都为 1 才是 1）
int and = a & b;  // 1010 & 0110 = 0010
Console.WriteLine($"{a} & {b} = {and}");  // 2

// | : 按位或（有一位为 1 就是 1）
int or = a | b;   // 1010 | 0110 = 1110
Console.WriteLine($"{a} | {b} = {or}");   // 14

// ^ : 按位异或（两位不同才是 1）
int xor = a ^ b;  // 1010 ^ 0110 = 1100
Console.WriteLine($"{a} ^ {b} = {xor}");  // 12

// ~ : 按位取反
int not = ~a;     // ~1010 = ...11110101（补码）
Console.WriteLine($"~{a} = {not}");  // -11

// << : 左移（乘以 2 的 n 次方）
int left = a << 2;  // 1010 << 2 = 101000
Console.WriteLine($"{a} << 2 = {left}");  // 40

// >> : 右移（除以 2 的 n 次方）
int right = a >> 2;  // 1010 >> 2 = 0010
Console.WriteLine($"{a} >> 2 = {right}");  // 2

// 实际应用：检查、设置、清除特定位
int flags = 0;  // 0000
flags |= 1;     // 设置第 0 位：0001
flags |= 4;     // 设置第 2 位：0101
Console.WriteLine($"flags: {flags}");  // 5

bool hasBit0 = (flags & 1) != 0;  // 检查第 0 位
bool hasBit1 = (flags & 2) != 0;  // 检查第 1 位
Console.WriteLine($"hasBit0: {hasBit0}");  // true
Console.WriteLine($"hasBit1: {hasBit1}");  // false
\`\`\`

### 六、条件运算符

\`\`\`csharp
// 三元运算符：condition ? trueValue : falseValue
int age = 20;
string status = age >= 18 ? "成年" : "未成年";
Console.WriteLine($"年龄 {age}，{status}");

// 等价于 if-else
string status2;
if (age >= 18)
{
    status2 = "成年";
}
else
{
    status2 = "未成年";
}
Console.WriteLine($"年龄 {age}，{status2}");

// 嵌套三元运算符
int score = 85;
string grade = score >= 90 ? "A" :
               score >= 80 ? "B" :
               score >= 70 ? "C" :
               score >= 60 ? "D" : "F";
Console.WriteLine($"分数 {score}，等级 {grade}");

// null 合并运算符 ??
string name = null;
string displayName = name ?? "匿名用户";
Console.WriteLine($"显示名称：{displayName}");

// null 条件运算符 ?.
string text = null;
int? length = text?.Length;  // 如果 text 为 null，返回 null
Console.WriteLine($"长度：{length}");  // 输出空（null）

// null 合并赋值运算符 ??=
string message = null;
message ??= "默认消息";  // 如果 message 为 null，赋值为"默认消息"
Console.WriteLine($"消息：{message}");
\`\`\`

### 七、运算符优先级

\`\`\`csharp
// 优先级从高到低：
// 1. 一元运算符：+ - ! ~ ++ --
// 2. 乘除：* / %
// 3. 加减：+ -
// 4. 移位：<< >>
// 5. 比较：< <= > >=
// 6. 相等：== !=
// 7. 位与：&
// 8. 位异或：^
// 9. 位或：|
// 10. 逻辑与：&&
// 11. 逻辑或：||
// 12. 条件：?:
// 13. 赋值：= += -= *= /= %= &= |= ^= <<= >>=

// 使用括号改变优先级
int result1 = 2 + 3 * 4;      // 14（先乘后加）
int result2 = (2 + 3) * 4;    // 20（先加后乘）
Console.WriteLine($"result1: {result1}");
Console.WriteLine($"result2: {result2}");

// 复杂表达式
bool a = true, b = false, c = true;
bool result3 = a && b || c;   // (a && b) || c = false || true = true
bool result4 = a && (b || c); // a && true = true
Console.WriteLine($"result3: {result3}");
Console.WriteLine($"result4: {result4}");
\`\`\`

### 八、小结

本章学到了：
- 算术运算符：\`+\` \`-\` \`*\` \`/\` \`%\` \`++\` \`--\`
- 赋值运算符：\`=\` \`+=\` \`-=\` 等
- 比较运算符：\`==\` \`!=\` \`>\` \`<\` \`>=\` \`<=\`
- 逻辑运算符：\`&&\` \`||\` \`!\`
- 位运算符：\`&\` \`|\` \`^\` \`~\` \`<<\` \`>>\`
- 条件运算符：三元运算符 \`?:\`、null 合并 \`??\`、null 条件 \`?.\`
- 运算符优先级

下一章我们学习控制流：条件语句。`,
  },

  // ============================================================
  // 第四章：控制流：条件语句
  // ============================================================
  {
    id: 'csharp2-ch04',
    group: '第一部分 基础入门',
    icon: '🔀',
    title: '控制流：条件语句',
    content: `## 控制流：条件语句

### 一、if 语句

\`\`\`csharp
// 基本 if 语句
int age = 20;

if (age >= 18)
{
    Console.WriteLine("你已经成年了");
}

// if-else
if (age >= 18)
{
    Console.WriteLine("成年人");
}
else
{
    Console.WriteLine("未成年人");
}

// if-else if-else
int score = 85;

if (score >= 90)
{
    Console.WriteLine("优秀");
}
else if (score >= 80)
{
    Console.WriteLine("良好");
}
else if (score >= 70)
{
    Console.WriteLine("中等");
}
else if (score >= 60)
{
    Console.WriteLine("及格");
}
else
{
    Console.WriteLine("不及格");
}

// 嵌套 if
int temperature = 25;
bool isSunny = true;

if (temperature > 20)
{
    if (isSunny)
    {
        Console.WriteLine("天气很好，适合出门");
    }
    else
    {
        Console.WriteLine("温度适宜，但阴天");
    }
}
else
{
    Console.WriteLine("天气较冷");
}
\`\`\`

### 二、switch 语句

\`\`\`csharp
// 基本 switch
int day = 3;

switch (day)
{
    case 1:
        Console.WriteLine("星期一");
        break;
    case 2:
        Console.WriteLine("星期二");
        break;
    case 3:
        Console.WriteLine("星期三");
        break;
    case 4:
        Console.WriteLine("星期四");
        break;
    case 5:
        Console.WriteLine("星期五");
        break;
    case 6:
        Console.WriteLine("星期六");
        break;
    case 7:
        Console.WriteLine("星期日");
        break;
    default:
        Console.WriteLine("无效的日期");
        break;
}

// switch 表达式（C# 8+）⭐ 推荐
string dayName = day switch
{
    1 => "星期一",
    2 => "星期二",
    3 => "星期三",
    4 => "星期四",
    5 => "星期五",
    6 => "星期六",
    7 => "星期日",
    _ => "无效的日期"  // _ 表示默认情况
};
Console.WriteLine($"今天是：{dayName}");

// 模式匹配 switch
object value = "Hello";

string type = value switch
{
    int i => $"整数：{i}",
    string s => $"字符串：{s}",
    double d => $"双精度：{d}",
    bool b => $"布尔值：{b}",
    null => "null",
    _ => $"未知类型：{value.GetType().Name}"
};
Console.WriteLine(type);

// 条件模式
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
\`\`\`

### 三、goto 语句（不推荐）

\`\`\`csharp
// goto 可以跳转到标签位置
// 虽然不推荐使用，但了解即可

int i = 0;

start:
if (i < 5)
{
    Console.WriteLine($"i = {i}");
    i++;
    goto start;  // 跳转到 start 标签
}

Console.WriteLine("循环结束");

// goto 常用于跳出多层循环
for (int x = 0; x < 3; x++)
{
    for (int y = 0; y < 3; y++)
    {
        if (x == 1 && y == 1)
        {
            goto end;  // 直接跳到 end
        }
        Console.WriteLine($"x={x}, y={y}");
    }
}

end:
Console.WriteLine("已跳出循环");
\`\`\`

### 四、模式匹配（C# 9+）

\`\`\`csharp
// is 模式匹配
object obj = "Hello";

if (obj is string s)
{
    Console.WriteLine($"是字符串：{s}");
}

if (obj is int i)
{
    Console.WriteLine($"是整数：{i}");
}
else
{
    Console.WriteLine("不是整数");
}

// 类型模式
void PrintType(object value)
{
    switch (value)
    {
        case int n when n > 0:
            Console.WriteLine($"正整数：{n}");
            break;
        case int n:
            Console.WriteLine($"整数：{n}");
            break;
        case string s when s.Length > 10:
            Console.WriteLine($"长字符串：{s}");
            break;
        case string s:
            Console.WriteLine($"字符串：{s}");
            break;
        case null:
            Console.WriteLine("null");
            break;
        default:
            Console.WriteLine($"其他类型：{value?.GetType().Name}");
            break;
    }
}

PrintType(42);
PrintType(-10);
PrintType("Hello");
PrintType("This is a very long string");
PrintType(null);
PrintType(3.14);

// 关系模式
int temperature = 25;
string comfort = temperature switch
{
    < 0 => "极冷",
    < 10 => "寒冷",
    < 20 => "凉爽",
    < 30 => "舒适",
    < 40 => "炎热",
    _ => "极热"
};
Console.WriteLine($"温度 {temperature}°C，{comfort}");
\`\`\`

### 五、小结

本章学到了：
- \`if\` / \`else if\` / \`else\` 条件语句
- \`switch\` 语句和 switch 表达式
- 模式匹配：\`is\` 模式、类型模式、关系模式
- \`goto\` 语句（不推荐使用）

下一章我们学习控制流：循环语句。`,
  },

  // ============================================================
  // 第五章：控制流：循环语句
  // ============================================================
  {
    id: 'csharp2-ch05',
    group: '第一部分 基础入门',
    icon: '🔄',
    title: '控制流：循环语句',
    content: `## 控制流：循环语句

### 一、for 循环

\`\`\`csharp
// 基本 for 循环
// 语法：for (初始化; 条件; 迭代) { 循环体 }
for (int i = 0; i < 5; i++)
{
    Console.WriteLine($"i = {i}");
}

// 计算 1 到 100 的和
int sum = 0;
for (int i = 1; i <= 100; i++)
{
    sum += i;
}
Console.WriteLine($"1 到 100 的和：{sum}");  // 5050

// 遍历数组
int[] numbers = { 10, 20, 30, 40, 50 };
for (int i = 0; i < numbers.Length; i++)
{
    Console.WriteLine($"numbers[{i}] = {numbers[i]}");
}

// 嵌套循环：打印乘法表
for (int i = 1; i <= 9; i++)
{
    for (int j = 1; j <= i; j++)
    {
        Console.Write($"{j}×{i}={i * j}\\t");
    }
    Console.WriteLine();  // 换行
}

// 倒序循环
for (int i = 10; i > 0; i--)
{
    Console.WriteLine($"倒计时：{i}");
}
Console.WriteLine("发射！");

// 步长为 2
for (int i = 0; i <= 20; i += 2)
{
    Console.Write($"{i} ");
}
Console.WriteLine();

// 多个变量
for (int i = 0, j = 10; i < j; i++, j--)
{
    Console.WriteLine($"i = {i}, j = {j}");
}
\`\`\`

### 二、while 循环

\`\`\`csharp
// while 循环：先判断条件，再执行循环体
int count = 0;

while (count < 5)
{
    Console.WriteLine($"count = {count}");
    count++;
}

// 计算阶乘
int n = 5;
int factorial = 1;
int i = 1;

while (i <= n)
{
    factorial *= i;
    i++;
}
Console.WriteLine($"{n}! = {factorial}");  // 120

// 用户输入验证（模拟）
string input = "";
int attempts = 0;

while (input != "quit" && attempts < 3)
{
    Console.WriteLine($"请输入命令（输入 quit 退出）：");
    // 模拟输入
    input = attempts == 0 ? "hello" : attempts == 1 ? "world" : "quit";
    Console.WriteLine($"输入：{input}");
    attempts++;
}

// 无限循环（需要 break 退出）
int x = 0;
while (true)
{
    if (x >= 5)
    {
        break;  // 退出循环
    }
    Console.WriteLine($"x = {x}");
    x++;
}
\`\`\`

### 三、do-while 循环

\`\`\`csharp
// do-while：先执行一次循环体，再判断条件
int num = 0;

do
{
    Console.WriteLine($"num = {num}");
    num++;
} while (num < 5);

// 即使条件一开始就不满足，也会执行一次
int y = 10;

do
{
    Console.WriteLine($"y = {y}");  // 会执行一次
    y++;
} while (y < 5);  // 条件为 false

// 菜单循环（模拟）
int choice;
do
{
    Console.WriteLine("菜单：");
    Console.WriteLine("1. 选项一");
    Console.WriteLine("2. 选项二");
    Console.WriteLine("3. 退出");
    
    // 模拟用户选择
    choice = 3;
    Console.WriteLine($"选择：{choice}");
    
} while (choice != 3);

Console.WriteLine("程序结束");
\`\`\`

### 四、foreach 循环

\`\`\`csharp
// foreach：遍历集合中的每个元素
int[] numbers = { 10, 20, 30, 40, 50 };

foreach (int num in numbers)
{
    Console.WriteLine($"数字：{num}");
}

// 遍历字符串
string text = "Hello";
foreach (char c in text)
{
    Console.WriteLine($"字符：{c}");
}

// 遍历 List
List<string> names = new List<string> { "张三", "李四", "王五" };
foreach (string name in names)
{
    Console.WriteLine($"姓名：{name}");
}

// 注意：foreach 中不能修改集合元素
int[] arr = { 1, 2, 3 };
// foreach (int x in arr) { x = 10; }  // 编译错误！

// 但如果是引用类型，可以修改对象的属性
class Person
{
    public string Name { get; set; }
    public int Age { get; set; }
}

List<Person> people = new List<Person>
{
    new Person { Name = "张三", Age = 20 },
    new Person { Name = "李四", Age = 25 }
};

foreach (var person in people)
{
    person.Age++;  // 可以修改对象属性
    Console.WriteLine($"{person.Name}，年龄 {person.Age}");
}
\`\`\`

### 五、break 和 continue

\`\`\`csharp
// break：立即退出循环
for (int i = 0; i < 10; i++)
{
    if (i == 5)
    {
        break;  // 当 i == 5 时退出循环
    }
    Console.WriteLine($"i = {i}");  // 输出 0 1 2 3 4
}

// continue：跳过本次循环，继续下一次
for (int i = 0; i < 10; i++)
{
    if (i % 2 == 0)
    {
        continue;  // 跳过偶数
    }
    Console.WriteLine($"i = {i}");  // 输出 1 3 5 7 9
}

// 在嵌套循环中使用
for (int i = 0; i < 3; i++)
{
    for (int j = 0; j < 3; j++)
    {
        if (j == 1)
        {
            continue;  // 只跳过内层循环的当前迭代
        }
        Console.WriteLine($"i={i}, j={j}");
    }
}

// 使用标签跳出多层循环（不推荐，但有时有用）
outer:
for (int i = 0; i < 3; i++)
{
    for (int j = 0; j < 3; j++)
    {
        if (i == 1 && j == 1)
        {
            break outer;  // 跳出外层循环
        }
        Console.WriteLine($"i={i}, j={j}");
    }
}
\`\`\`

### 六、yield return（迭代器）

\`\`\`csharp
// yield return：创建迭代器，延迟执行
IEnumerable<int> GetNumbers()
{
    yield return 1;
    yield return 2;
    yield return 3;
    yield return 4;
    yield return 5;
}

foreach (int num in GetNumbers())
{
    Console.WriteLine($"数字：{num}");
}

// 生成斐波那契数列
IEnumerable<int> Fibonacci(int count)
{
    int a = 0, b = 1;
    for (int i = 0; i < count; i++)
    {
        yield return a;
        int temp = a;
        a = b;
        b = temp + b;
    }
}

Console.WriteLine("斐波那契数列：");
foreach (int num in Fibonacci(10))
{
    Console.Write($"{num} ");
}
Console.WriteLine();

// yield break：提前结束迭代
IEnumerable<int> GetEvenNumbers(int max)
{
    for (int i = 0; i <= max; i++)
    {
        if (i > 10)
        {
            yield break;  // 提前结束
        }
        if (i % 2 == 0)
        {
            yield return i;
        }
    }
}

Console.WriteLine("偶数：");
foreach (int num in GetEvenNumbers(20))
{
    Console.Write($"{num} ");
}
Console.WriteLine();
\`\`\`

### 七、小结

本章学到了：
- \`for\` 循环：适合已知循环次数
- \`while\` 循环：适合条件控制的循环
- \`do-while\` 循环：至少执行一次
- \`foreach\` 循环：遍历集合
- \`break\` 退出循环，\`continue\` 跳过本次迭代
- \`yield return\` 创建迭代器

下一章我们学习数组与字符串。`,
  },

  // ============================================================
  // 第六章：数组与字符串
  // ============================================================
  {
    id: 'csharp2-ch06',
    group: '第一部分 基础入门',
    icon: '📝',
    title: '数组与字符串',
    content: `## 数组与字符串

### 一、一维数组

\`\`\`csharp
// 声明并初始化数组
int[] numbers = { 1, 2, 3, 4, 5 };
string[] names = { "张三", "李四", "王五" };

// 先声明后初始化
int[] scores;
scores = new int[] { 90, 85, 88 };

// 指定大小
int[] arr = new int[5];  // 默认值为 0
for (int i = 0; i < arr.Length; i++)
{
    arr[i] = i * 10;
}

// 访问数组元素
Console.WriteLine($"第一个元素：{numbers[0]}");  // 1
Console.WriteLine($"最后一个元素：{numbers[^1]}");  // 5（C# 8+ 索引运算符）
Console.WriteLine($"倒数第二个：{numbers[^2]}");  // 4

// 数组长度
Console.WriteLine($"数组长度：{numbers.Length}");  // 5

// 遍历数组
foreach (int num in numbers)
{
    Console.Write($"{num} ");
}
Console.WriteLine();

// 数组排序
Array.Sort(numbers);
Console.WriteLine("排序后：");
foreach (int num in numbers)
{
    Console.Write($"{num} ");
}
Console.WriteLine();

// 查找元素
int index = Array.IndexOf(numbers, 3);
Console.WriteLine($"3 的索引：{index}");

// 数组复制
int[] copy = new int[numbers.Length];
Array.Copy(numbers, copy, numbers.Length);

// 数组反转
Array.Reverse(numbers);
Console.WriteLine("反转后：");
foreach (int num in numbers)
{
    Console.Write($"{num} ");
}
Console.WriteLine();
\`\`\`

### 二、多维数组

\`\`\`csharp
// 二维数组
int[,] matrix = new int[3, 4];

// 初始化二维数组
int[,] grid = {
    { 1, 2, 3, 4 },
    { 5, 6, 7, 8 },
    { 9, 10, 11, 12 }
};

// 访问元素
Console.WriteLine($"grid[0,0] = {grid[0, 0]}");  // 1
Console.WriteLine($"grid[1,2] = {grid[1, 2]}");  // 7

// 获取维度大小
Console.WriteLine($"行数：{grid.GetLength(0)}");  // 3
Console.WriteLine($"列数：{grid.GetLength(1)}");  // 4

// 遍历二维数组
for (int i = 0; i < grid.GetLength(0); i++)
{
    for (int j = 0; j < grid.GetLength(1); j++)
    {
        Console.Write($"{grid[i, j]}\\t");
    }
    Console.WriteLine();
}

// 三维数组
int[,,] cube = new int[2, 3, 4];
cube[0, 0, 0] = 1;
cube[1, 2, 3] = 99;
Console.WriteLine($"cube[1,2,3] = {cube[1, 2, 3]}");
\`\`\`

### 三、交错数组（数组的数组）

\`\`\`csharp
// 交错数组：每个元素都是一个数组
int[][] jagged = new int[3][];

jagged[0] = new int[] { 1, 2 };
jagged[1] = new int[] { 3, 4, 5 };
jagged[2] = new int[] { 6, 7, 8, 9 };

// 访问元素
Console.WriteLine($"jagged[0][1] = {jagged[0][1]}");  // 2
Console.WriteLine($"jagged[1][2] = {jagged[1][2]}");  // 5

// 遍历交错数组
for (int i = 0; i < jagged.Length; i++)
{
    Console.Write($"第 {i} 行：");
    for (int j = 0; j < jagged[i].Length; j++)
    {
        Console.Write($"{jagged[i][j]} ");
    }
    Console.WriteLine();
}

// 初始化时指定
int[][] jagged2 = new int[][]
{
    new int[] { 1, 2, 3 },
    new int[] { 4, 5 },
    new int[] { 6, 7, 8, 9 }
};
\`\`\`

### 四、字符串基础

\`\`\`csharp
// 字符串是不可变的（immutable）
string s1 = "Hello";
string s2 = s1;  // 复制引用
s1 += " World";  // 创建新字符串

Console.WriteLine($"s1: {s1}");  // Hello World
Console.WriteLine($"s2: {s2}");  // Hello（未改变）

// 字符串长度
string text = "Hello, 世界";
Console.WriteLine($"长度：{text.Length}");  // 9

// 访问字符
Console.WriteLine($"第一个字符：{text[0]}");  // H
Console.WriteLine($"最后一个字符：{text[^1]}");  // 界

// 字符串拼接
string a = "Hello";
string b = "World";
string c = a + " " + b;  // Hello World
string d = string.Concat(a, " ", b);  // Hello World
Console.WriteLine($"c: {c}");
Console.WriteLine($"d: {d}");

// 字符串插值
string name = "张三";
int age = 25;
string message = $"姓名：{name}，年龄：{age}";
Console.WriteLine(message);

// 多行字符串（C# 11+）
string multiLine = """
    这是第一行
    这是第二行
    这是第三行
    """;
Console.WriteLine(multiLine);
\`\`\`

### 五、字符串操作

\`\`\`csharp
string text = "  Hello, World!  ";

// 去除空白
Console.WriteLine($"Trim: '{text.Trim()}'");  // 'Hello, World!'
Console.WriteLine($"TrimStart: '{text.TrimStart()}'");  // 'Hello, World!  '
Console.WriteLine($"TrimEnd: '{text.TrimEnd()}'");  // '  Hello, World!'

// 大小写转换
string lower = "hello";
string upper = "WORLD";
Console.WriteLine($"ToUpper: {lower.ToUpper()}");  // HELLO
Console.WriteLine($"ToLower: {upper.ToLower()}");  // world

// 查找子串
string str = "Hello, World!";
int index = str.IndexOf("World");
Console.WriteLine($"'World' 的位置：{index}");  // 7

bool contains = str.Contains("Hello");
Console.WriteLine($"包含 'Hello'：{contains}");  // True

bool startsWith = str.StartsWith("Hello");
Console.WriteLine($"以 'Hello' 开头：{startsWith}");  // True

bool endsWith = str.EndsWith("!");
Console.WriteLine($"以 '!' 结尾：{endsWith}");  // True

// 截取子串
string sub1 = str.Substring(7, 5);  // 从索引 7 开始，取 5 个字符
Console.WriteLine($"Substring: {sub1}");  // World

string sub2 = str[7..12];  // 范围运算符（C# 8+）
Console.WriteLine($"范围：{sub2}");  // World

// 替换
string replaced = str.Replace("World", "C#");
Console.WriteLine($"Replace: {replaced}");  // Hello, C#!

// 分割
string csv = "apple,banana,cherry";
string[] fruits = csv.Split(',');
foreach (string fruit in fruits)
{
    Console.WriteLine(fruit);
}

// 连接
string[] words = { "Hello", "World" };
string joined = string.Join(" ", words);
Console.WriteLine($"Join: {joined}");  // Hello World

// 填充
string num = "42";
string padded = num.PadLeft(5, '0');
Console.WriteLine($"PadLeft: {padded}");  // 00042

string padded2 = num.PadRight(5, '.');
Console.WriteLine($"PadRight: {padded2}");  // 42...
\`\`\`

### 六、字符串格式化

\`\`\`csharp
// 数字格式化
int num = 1234567;
double price = 99.9;
double pi = 3.14159265;

Console.WriteLine($"默认：{num}");  // 1234567
Console.WriteLine($"千分位：{num:N0}");  // 1,234,567
Console.WriteLine($"货币：{price:C}");  // ¥99.90
Console.WriteLine($"百分比：{0.856:P1}");  // 85.6%
Console.WriteLine($"定点数：{pi:F2}");  // 3.14
Console.WriteLine($"指数：{1234567:E}");  // 1.234567E+006

// 日期格式化
DateTime now = DateTime.Now;
Console.WriteLine($"短日期：{now:d}");  // 2026/1/15
Console.WriteLine($"长日期：{now:D}");  // 2026年1月15日
Console.WriteLine($"短时间：{now:t}");  // 14:30
Console.WriteLine($"长时间：{now:T}");  // 14:30:45
Console.WriteLine($"完整：{now:f}");  // 2026年1月15日 14:30
Console.WriteLine($"自定义：{now:yyyy-MM-dd HH:mm:ss}");  // 2026-01-15 14:30:45

// 对齐
string name = "张三";
int age = 25;
Console.WriteLine($"{"姓名", -10} {"年龄", 5}");  // 左对齐和右对齐
Console.WriteLine($"{name, -10} {age, 5}");

// 自定义数字格式
double value = 1234.567;
Console.WriteLine($"0.00: {value:0.00}");  // 1234.57
Console.WriteLine($"#.##: {value:#.##}");  // 1234.57
Console.WriteLine($"0,0: {value:0,0}");  // 1,235
\`\`\`

### 七、StringBuilder

\`\`\`csharp
// StringBuilder：高效拼接字符串
// 字符串是不可变的，每次拼接都会创建新对象
// StringBuilder 是可变的，适合大量拼接操作

using System.Text;

var sb = new StringBuilder();

// 追加字符串
sb.Append("Hello");
sb.Append(" ");
sb.Append("World");
Console.WriteLine(sb.ToString());  // Hello World

// 追加行
sb.AppendLine();
sb.AppendLine("第二行");
sb.AppendLine("第三行");
Console.WriteLine(sb.ToString());

// 插入
sb.Insert(0, "开始：");
Console.WriteLine(sb.ToString());

// 替换
sb.Replace("World", "C#");
Console.WriteLine(sb.ToString());

// 删除
sb.Remove(0, 3);  // 删除前 3 个字符
Console.WriteLine(sb.ToString());

// 清空
sb.Clear();
Console.WriteLine($"长度：{sb.Length}");  // 0

// 性能对比
var sw1 = System.Diagnostics.Stopwatch.StartNew();
string result1 = "";
for (int i = 0; i < 10000; i++)
{
    result1 += i.ToString();
}
sw1.Stop();
Console.WriteLine($"字符串拼接耗时：{sw1.ElapsedMilliseconds}ms");

var sw2 = System.Diagnostics.Stopwatch.StartNew();
var sb2 = new StringBuilder();
for (int i = 0; i < 10000; i++)
{
    sb2.Append(i);
}
sw2.Stop();
Console.WriteLine($"StringBuilder 耗时：{sw2.ElapsedMilliseconds}ms");
\`\`\`

### 八、小结

本章学到了：
- 一维数组、多维数组、交错数组
- 字符串的基本操作：长度、访问、拼接、查找、截取、替换、分割、连接
- 字符串格式化：数字、日期、对齐
- \`StringBuilder\` 用于高效拼接大量字符串

下一章我们学习方法（函数）。`,
  },

  // ============================================================
  // 第七章：方法（函数）
  // ============================================================
  {
    id: 'csharp2-ch07',
    group: '第一部分 基础入门',
    icon: '⚙️',
    title: '方法（函数）',
    content: `## 方法（函数）

### 一、方法基础

\`\`\`csharp
// 方法定义：访问修饰符 返回类型 方法名(参数列表) { 方法体 }

// 无参数无返回值
void SayHello()
{
    Console.WriteLine("Hello, World!");
}

SayHello();

// 有参数无返回值
void Greet(string name)
{
    Console.WriteLine($"Hello, {name}!");
}

Greet("张三");
Greet("李四");

// 有返回值
int Add(int a, int b)
{
    return a + b;
}

int result = Add(10, 20);
Console.WriteLine($"10 + 20 = {result}");

// 多个参数
double CalculateArea(double length, double width)
{
    return length * width;
}

double area = CalculateArea(5.5, 3.2);
Console.WriteLine($"面积：{area}");

// 返回不同类型
string GetGreeting(string name, int hour)
{
    if (hour < 12)
        return $"早上好，{name}";
    else if (hour < 18)
        return $"下午好，{name}";
    else
        return $"晚上好，{name}";
}

Console.WriteLine(GetGreeting("张三", 9));
Console.WriteLine(GetGreeting("李四", 15));
Console.WriteLine(GetGreeting("王五", 20));
\`\`\`

### 二、参数传递

\`\`\`csharp
// 值参数：默认方式，传递值的副本
void Modify(int x)
{
    x = 100;  // 只修改副本，不影响原变量
}

int a = 10;
Modify(a);
Console.WriteLine($"a = {a}");  // 10（未改变）

// ref 参数：传递引用，可以修改原变量
void ModifyRef(ref int x)
{
    x = 100;  // 修改原变量
}

int b = 10;
ModifyRef(ref b);
Console.WriteLine($"b = {b}");  // 100（已改变）

// out 参数：输出参数，必须赋值
void Divide(int dividend, int divisor, out int quotient, out int remainder)
{
    quotient = dividend / divisor;
    remainder = dividend % divisor;
}

Divide(17, 5, out int q, out int r);
Console.WriteLine($"17 ÷ 5 = {q} 余 {r}");

// in 参数：只读引用，避免大结构体的复制开销
void PrintReadOnly(in int x)
{
    // x = 100;  // 编译错误！in 参数不能修改
    Console.WriteLine($"x = {x}");
}

int c = 50;
PrintReadOnly(in c);

// params 参数：可变参数
void PrintNumbers(params int[] numbers)
{
    foreach (int num in numbers)
    {
        Console.Write($"{num} ");
    }
    Console.WriteLine();
}

PrintNumbers(1, 2, 3);
PrintNumbers(10, 20, 30, 40, 50);
PrintNumbers();  // 可以不传参数

// params 必须是最后一个参数
void PrintInfo(string prefix, params int[] numbers)
{
    Console.Write($"{prefix}: ");
    foreach (int num in numbers)
    {
        Console.Write($"{num} ");
    }
    Console.WriteLine();
}

PrintInfo("数字", 1, 2, 3);
\`\`\`

### 三、默认参数与命名参数

\`\`\`csharp
// 默认参数：参数有默认值
void CreatePerson(string name, int age = 18, string city = "北京")
{
    Console.WriteLine($"姓名：{name}，年龄：{age}，城市：{city}");
}

CreatePerson("张三");  // 使用默认值
CreatePerson("李四", 25);
CreatePerson("王五", 30, "上海");

// 命名参数：可以指定参数名
CreatePerson("赵六", city: "广州");  // 跳过 age，使用默认值
CreatePerson(age: 20, name: "孙七");  // 可以改变顺序

// 默认参数必须从右到左连续
// void Bad(int a = 1, int b, int c = 3) {}  // 编译错误！
void Good(int a, int b = 2, int c = 3) {}  // 正确

Good(1);
Good(1, 2);
Good(1, 2, 3);

// 构造函数中常用默认参数
class Config
{
    public string Host { get; }
    public int Port { get; }
    public bool UseSsl { get; }
    
    public Config(string host, int port = 80, bool useSsl = false)
    {
        Host = host;
        Port = port;
        UseSsl = useSsl;
    }
}

var config1 = new Config("localhost");
var config2 = new Config("example.com", 443, true);
Console.WriteLine($"config1: {config1.Host}:{config1.Port}, SSL={config1.UseSsl}");
Console.WriteLine($"config2: {config2.Host}:{config2.Port}, SSL={config2.UseSsl}");
\`\`\`

### 四、方法重载

\`\`\`csharp
// 方法重载：同名方法，参数列表不同
class Calculator
{
    // 两个整数相加
    public int Add(int a, int b)
    {
        Console.WriteLine("调用 Add(int, int)");
        return a + b;
    }
    
    // 三个整数相加
    public int Add(int a, int b, int c)
    {
        Console.WriteLine("调用 Add(int, int, int)");
        return a + b + c;
    }
    
    // 两个双精度数相加
    public double Add(double a, double b)
    {
        Console.WriteLine("调用 Add(double, double)");
        return a + b;
    }
    
    // 字符串拼接
    public string Add(string a, string b)
    {
        Console.WriteLine("调用 Add(string, string)");
        return a + b;
    }
}

var calc = new Calculator();
Console.WriteLine(calc.Add(10, 20));        // 30
Console.WriteLine(calc.Add(10, 20, 30));    // 60
Console.WriteLine(calc.Add(1.5, 2.5));      // 4.0
Console.WriteLine(calc.Add("Hello", " World"));  // Hello World

// 重载解析规则
void Print(int x) => Console.WriteLine($"int: {x}");
void Print(long x) => Console.WriteLine($"long: {x}");
void Print(double x) => Console.WriteLine($"double: {x}");
void Print(string x) => Console.WriteLine($"string: {x}");

Print(10);       // int
Print(10L);      // long
Print(10.5);     // double
Print("10");     // string
\`\`\`

### 五、局部函数

\`\`\`csharp
// 局部函数：在方法内部定义的函数
void OuterMethod()
{
    Console.WriteLine("外层方法");
    
    // 局部函数
    void InnerMethod()
    {
        Console.WriteLine("内层函数");
    }
    
    InnerMethod();  // 调用局部函数
    
    // 局部函数可以访问外层方法的变量
    int outerVar = 100;
    
    int AddToOuter(int x)
    {
        return x + outerVar;  // 可以访问 outerVar
    }
    
    Console.WriteLine($"AddToOuter(50) = {AddToOuter(50)}");
}

OuterMethod();

// 局部函数常用于验证参数
int CalculateFactorial(int n)
{
    // 参数验证
    if (n < 0)
        throw new ArgumentException("n 不能为负数");
    
    // 局部函数实现递归
    int Factorial(int x)
    {
        if (x <= 1) return 1;
        return x * Factorial(x - 1);
    }
    
    return Factorial(n);
}

Console.WriteLine($"5! = {CalculateFactorial(5)}");

// 局部函数可以隐藏外层方法
void Method1()
{
    Console.WriteLine("Method1");
    
    void Helper()
    {
        Console.WriteLine("Method1 的 Helper");
    }
    
    Helper();
}

void Method2()
{
    Console.WriteLine("Method2");
    
    void Helper()
    {
        Console.WriteLine("Method2 的 Helper");
    }
    
    Helper();
}

Method1();
Method2();
\`\`\`

### 六、扩展方法

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
}

// 使用扩展方法
string text = "  Hello World  ";
Console.WriteLine($"IsBlank: {text.IsBlank()}");  // False

string empty = "";
Console.WriteLine($"empty.IsBlank(): {empty.IsBlank()}");  // True

string original = "Hello";
string reversed = original.Reverse();
Console.WriteLine($"Reverse: {reversed}");  // olleH

string sentence = "Hello World from C#";
Console.WriteLine($"WordCount: {sentence.WordCount()}");  // 4

// 链式调用
string result = "  Hello World  ".Trim().Reverse();
Console.WriteLine($"链式调用：{result}");

// 为其他类型添加扩展方法
static class IntExtensions
{
    // 判断是否为偶数
    public static bool IsEven(this int number)
    {
        return number % 2 == 0;
    }
    
    // 判断是否为正数
    public static bool IsPositive(this int number)
    {
        return number > 0;
    }
    
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
}

int num = 10;
Console.WriteLine($"{num}.IsEven(): {num.IsEven()}");  // True
Console.WriteLine($"{num}.IsPositive(): {num.IsPositive()}");  // True

long fileSize = 1536;
Console.WriteLine($"文件大小：{fileSize.ToFileSize()}");  // 1.5 KB
\`\`\`

### 七、小结

本章学到了：
- 方法的定义和调用
- 参数传递：值参数、\`ref\`、\`out\`、\`in\`、\`params\`
- 默认参数和命名参数
- 方法重载
- 局部函数
- 扩展方法

下一章我们学习异常处理。`,
  },

  // ============================================================
  // 第八章：异常处理
  // ============================================================
  {
    id: 'csharp2-ch08',
    group: '第一部分 基础入门',
    icon: '🚨',
    title: '异常处理',
    content: `## 异常处理

### 一、try-catch 基础

\`\`\`csharp
// 异常：程序运行时发生的错误
// try-catch：捕获并处理异常

try
{
    // 可能抛出异常的代码
    int[] numbers = { 1, 2, 3 };
    Console.WriteLine(numbers[10]);  // 索引越界
}
catch (IndexOutOfRangeException ex)
{
    // 捕获特定类型的异常
    Console.WriteLine($"索引越界：{ex.Message}");
}

// 多个 catch 块
try
{
    string text = null;
    int length = text.Length;  // NullReferenceException
}
catch (NullReferenceException ex)
{
    Console.WriteLine($"空引用：{ex.Message}");
}
catch (Exception ex)
{
    // 捕获所有异常（放在最后）
    Console.WriteLine($"发生错误：{ex.Message}");
}

// 常见异常类型
try
{
    int result = 10 / 0;  // DivideByZeroException
}
catch (DivideByZeroException ex)
{
    Console.WriteLine($"除零错误：{ex.Message}");
}

try
{
    int number = int.Parse("abc");  // FormatException
}
catch (FormatException ex)
{
    Console.WriteLine($"格式错误：{ex.Message}");
}

try
{
    int bigNumber = int.Parse("999999999999");  // OverflowException
}
catch (OverflowException ex)
{
    Console.WriteLine($"溢出错误：{ex.Message}");
}
\`\`\`

### 二、finally 块

\`\`\`csharp
// finally：无论是否发生异常都会执行
// 常用于释放资源（文件、数据库连接等）

StreamReader reader = null;
try
{
    reader = new StreamReader("test.txt");
    string content = reader.ReadToEnd();
    Console.WriteLine(content);
}
catch (FileNotFoundException ex)
{
    Console.WriteLine($"文件未找到：{ex.Message}");
}
catch (Exception ex)
{
    Console.WriteLine($"读取错误：{ex.Message}");
}
finally
{
    // 无论是否发生异常，都会执行
    reader?.Dispose();  // 释放资源
    Console.WriteLine("finally 块执行");
}

// 使用 using 语句（推荐）
// using 会自动调用 Dispose，等价于 try-finally
using (var reader2 = new StreamReader("test.txt"))
{
    string content = reader2.ReadToEnd();
    Console.WriteLine(content);
}
// reader2 在这里自动被释放

// C# 8+ 的 using 声明
using var reader3 = new StreamReader("test.txt");
string content3 = reader3.ReadToEnd();
Console.WriteLine(content3);
// reader3 在方法结束时自动释放
\`\`\`

### 三、抛出异常

\`\`\`csharp
// throw：主动抛出异常
int Divide(int a, int b)
{
    if (b == 0)
    {
        throw new ArgumentException("除数不能为零", nameof(b));
    }
    return a / b;
}

try
{
    int result = Divide(10, 0);
}
catch (ArgumentException ex)
{
    Console.WriteLine($"参数错误：{ex.Message}");
}

// 自定义异常信息
void ValidateAge(int age)
{
    if (age < 0)
    {
        throw new ArgumentOutOfRangeException(nameof(age), "年龄不能为负数");
    }
    if (age > 150)
    {
        throw new ArgumentOutOfRangeException(nameof(age), "年龄不能超过 150");
    }
    Console.WriteLine($"年龄有效：{age}");
}

try
{
    ValidateAge(-5);
}
catch (ArgumentOutOfRangeException ex)
{
    Console.WriteLine($"验证失败：{ex.Message}");
}

// 重新抛出异常
try
{
    int[] arr = { 1, 2, 3 };
    Console.WriteLine(arr[10]);
}
catch (IndexOutOfRangeException ex)
{
    Console.WriteLine($"捕获异常：{ex.Message}");
    throw;  // 重新抛出，保留原始堆栈信息
    // throw ex;  // 错误！会丢失原始堆栈
}
\`\`\`

### 四、自定义异常

\`\`\`csharp
// 自定义异常类
class InsufficientFundsException : Exception
{
    public decimal Balance { get; }
    public decimal WithdrawAmount { get; }
    
    public InsufficientFundsException(decimal balance, decimal withdrawAmount)
        : base($"余额不足：余额 {balance}，尝试提取 {withdrawAmount}")
    {
        Balance = balance;
        WithdrawAmount = withdrawAmount;
    }
    
    public InsufficientFundsException(string message) : base(message) { }
    public InsufficientFundsException(string message, Exception inner) : base(message, inner) { }
}

class BankAccount
{
    public decimal Balance { get; private set; }
    
    public BankAccount(decimal initialBalance)
    {
        if (initialBalance < 0)
            throw new ArgumentException("初始余额不能为负数");
        Balance = initialBalance;
    }
    
    public void Withdraw(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("提取金额必须大于零");
        if (amount > Balance)
            throw new InsufficientFundsException(Balance, amount);
        Balance -= amount;
    }
    
    public void Deposit(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("存款金额必须大于零");
        Balance += amount;
    }
}

// 使用自定义异常
var account = new BankAccount(1000);

try
{
    account.Withdraw(1500);
}
catch (InsufficientFundsException ex)
{
    Console.WriteLine($"取款失败：{ex.Message}");
    Console.WriteLine($"当前余额：{ex.Balance}");
    Console.WriteLine($"尝试提取：{ex.WithdrawAmount}");
}

try
{
    account.Deposit(-100);
}
catch (ArgumentException ex)
{
    Console.WriteLine($"存款失败：{ex.Message}");
}
\`\`\`

### 五、异常筛选器

\`\`\`csharp
// 异常筛选器：when 子句
try
{
    int result = 10 / 0;
}
catch (DivideByZeroException ex) when (ex.Message.Contains("零"))
{
    Console.WriteLine($"捕获到除零异常：{ex.Message}");
}

// 根据条件捕获
int errorCode = 404;

try
{
    throw new Exception($"错误代码：{errorCode}");
}
catch (Exception ex) when (errorCode == 404)
{
    Console.WriteLine($"404 错误：{ex.Message}");
}
catch (Exception ex) when (errorCode >= 500)
{
    Console.WriteLine($"服务器错误：{ex.Message}");
}
catch (Exception ex)
{
    Console.WriteLine($"其他错误：{ex.Message}");
}

// 日志记录
bool LogException(Exception ex)
{
    Console.WriteLine($"[日志] {ex.GetType().Name}: {ex.Message}");
    return false;  // 返回 false 表示不捕获，继续传播
}

try
{
    throw new InvalidOperationException("测试异常");
}
catch (Exception ex) when (LogException(ex))
{
    // 不会执行到这里，因为 LogException 返回 false
}
\`\`\`

### 六、最佳实践

\`\`\`csharp
// 1. 只捕获能处理的异常
try
{
    int result = 10 / 0;
}
catch (DivideByZeroException ex)
{
    // 知道如何处理
    Console.WriteLine("除零错误，使用默认值 0");
    result = 0;
}

// 2. 不要捕获所有异常然后忽略
// 错误示例：
// try { ... } catch { }  // 吞掉所有异常！

// 3. 使用特定的异常类型
try
{
    File.ReadAllText("test.txt");
}
catch (FileNotFoundException ex)
{
    Console.WriteLine("文件不存在");
}
catch (UnauthorizedAccessException ex)
{
    Console.WriteLine("没有权限");
}
// 而不是：catch (Exception ex)

// 4. 使用 finally 或 using 释放资源
using (var stream = new FileStream("test.txt", FileMode.Open))
{
    // 使用流
}
// stream 自动关闭

// 5. 提供有意义的异常信息
void ProcessData(string data)
{
    if (string.IsNullOrEmpty(data))
    {
        throw new ArgumentException("数据不能为空", nameof(data));
    }
    // 处理数据
}

// 6. 不要使用异常控制流程
// 错误示例：
// try { return int.Parse(str); } catch { return 0; }

// 正确做法：
if (int.TryParse(str, out int result))
{
    return result;
}
return 0;

// 7. 记录异常信息
void LogError(Exception ex, string context)
{
    Console.WriteLine($"[{DateTime.Now}] {context}: {ex}");
}

try
{
    // 可能出错的操作
}
catch (Exception ex)
{
    LogError(ex, "处理用户数据");
    throw;  // 重新抛出，让上层处理
}
\`\`\`

### 七、小结

本章学到了：
- \`try-catch\` 捕获和处理异常
- \`finally\` 块用于释放资源
- \`using\` 语句自动管理资源
- \`throw\` 抛出异常
- 自定义异常类
- 异常筛选器 \`when\`
- 异常处理的最佳实践

下一章我们学习命名空间与程序结构。`,
  },

  // ============================================================
  // 第九章：命名空间与程序结构
  // ============================================================
  {
    id: 'csharp2-ch09',
    group: '第一部分 基础入门',
    icon: '📁',
    title: '命名空间与程序结构',
    content: `## 命名空间与程序结构

### 一、命名空间基础

\`\`\`csharp
// 命名空间：用于组织代码，避免命名冲突

// 定义命名空间
namespace MyApp.Models
{
    class User
    {
        public string Name { get; set; }
        public int Age { get; set; }
    }
    
    class Product
    {
        public string Name { get; set; }
        public decimal Price { get; set; }
    }
}

namespace MyApp.Services
{
    class UserService
    {
        public void AddUser(string name)
        {
            Console.WriteLine($"添加用户：{name}");
        }
    }
}

// 使用命名空间中的类
var user = new MyApp.Models.User { Name = "张三", Age = 25 };
var service = new MyApp.Services.UserService();
service.AddUser(user.Name);

// using 指令：引入命名空间
using MyApp.Models;
using MyApp.Services;

var user2 = new User { Name = "李四", Age = 30 };
var service2 = new UserService();
service2.AddUser(user2.Name);
\`\`\`

### 二、命名空间嵌套

\`\`\`csharp
// 命名空间可以嵌套
namespace Company.Product.Module
{
    class Component
    {
        public void DoWork()
        {
            Console.WriteLine("Component 工作");
        }
    }
}

// 等价于
namespace Company
{
    namespace Product
    {
        namespace Module
        {
            class Component2
            {
                public void DoWork()
                {
                    Console.WriteLine("Component2 工作");
                }
            }
        }
    }
}

// 使用
var comp1 = new Company.Product.Module.Component();
comp1.DoWork();

var comp2 = new Company.Product.Module.Component2();
comp2.DoWork();

// using 简化
using Company.Product.Module;

var comp3 = new Component();
comp3.DoWork();
\`\`\`

### 三、命名空间别名

\`\`\`csharp
// 当两个命名空间有同名类时，使用别名
namespace Namespace1
{
    class MyClass
    {
        public void Method1() => Console.WriteLine("Namespace1.MyClass");
    }
}

namespace Namespace2
{
    class MyClass
    {
        public void Method2() => Console.WriteLine("Namespace2.MyClass");
    }
}

// 使用完全限定名
var obj1 = new Namespace1.MyClass();
obj1.Method1();

var obj2 = new Namespace2.MyClass();
obj2.Method2();

// 使用别名
using N1 = Namespace1;
using N2 = Namespace2;

var obj3 = new N1.MyClass();
obj3.Method1();

var obj4 = new N2.MyClass();
obj4.Method2();

// using static：引入静态成员
using System.Math;

double result1 = Sqrt(16);  // 等价于 Math.Sqrt(16)
double result2 = Pow(2, 3);  // 等价于 Math.Pow(2, 3)
double result3 = Max(10, 20);

Console.WriteLine($"Sqrt(16) = {result1}");
Console.WriteLine($"Pow(2, 3) = {result2}");
Console.WriteLine($"Max(10, 20) = {result3}");
\`\`\`

### 四、全局 using（C# 10+）

\`\`\`csharp
// 全局 using：在整个项目中生效
// 通常放在一个单独的文件中，如 GlobalUsings.cs

// GlobalUsings.cs 内容：
global using System;
global using System.Collections.Generic;
global using System.Linq;
global using System.Text;
global using System.Threading.Tasks;

// 这样其他文件就不需要重复 using 这些命名空间

// 示例：
// 文件 1：Program.cs
var list = new List<string> { "A", "B", "C" };  // 不需要 using System.Collections.Generic
var text = new StringBuilder().Append("Hello").ToString();  // 不需要 using System.Text

// 文件 2：MyClass.cs
class MyClass
{
    public void DoWork()
    {
        var numbers = Enumerable.Range(1, 10);  // 不需要 using System.Linq
        Console.WriteLine(string.Join(", ", numbers));  // 不需要 using System
    }
}
\`\`\`

### 五、隐式 using（.NET 6+）

\`\`\`csharp
// .NET 6+ 默认启用隐式 using
// 编译器自动添加常用的 using 指令

// 自动引入的命名空间：
// - System
// - System.Collections.Generic
// - System.IO
// - System.Linq
// - System.Net.Http
// - System.Threading
// - System.Threading.Tasks

// 所以可以直接使用：
var list = new List<int> { 1, 2, 3 };  // 不需要 using System.Collections.Generic
var task = Task.Run(() => Console.WriteLine("异步任务"));  // 不需要 using System.Threading.Tasks

// 可以在 .csproj 文件中禁用
// <PropertyGroup>
//   <ImplicitUsings>disable</ImplicitUsings>
// </PropertyGroup>

// 或者添加自定义的全局 using
// 在 .csproj 中：
// <ItemGroup>
//   <Using Include="System.Console" Static="true" />
// </ItemGroup>

// 然后可以直接使用：
WriteLine("Hello");  // 等价于 Console.WriteLine
\`\`\`

### 六、程序结构

\`\`\`csharp
// 一个完整的 C# 程序结构

// 1. using 指令
using System;
using System.Collections.Generic;

// 2. 命名空间
namespace MyApp
{
    // 3. 类定义
    class Program
    {
        // 4. Main 方法（入口点）
        // C# 9+ 可以使用顶级语句，不需要显式定义 Main
        
        static void Main(string[] args)
        {
            Console.WriteLine("程序启动");
            
            // 使用其他类
            var service = new MyService();
            service.DoWork();
        }
    }
    
    // 5. 其他类
    class MyService
    {
        public void DoWork()
        {
            Console.WriteLine("MyService 工作");
        }
    }
}

// C# 9+ 顶级语句（推荐）
// 直接写代码，编译器自动生成 class 和 Main

Console.WriteLine("Hello, World!");

// 可以定义类
class MyClass2
{
    public void Method() => Console.WriteLine("MyClass2.Method");
}

// 使用类
var obj = new MyClass2();
obj.Method();

// 顶级语句必须放在所有类型定义之前
// 一个项目中只能有一个文件包含顶级语句
\`\`\`

### 七、文件作用域命名空间（C# 10+）

\`\`\`csharp
// 文件作用域命名空间：整个文件都在一个命名空间中
// 减少一层缩进

// 传统方式
namespace MyApp.Models
{
    class User
    {
        public string Name { get; set; }
    }
    
    class Product
    {
        public string Name { get; set; }
    }
}

// 文件作用域方式（推荐）
// namespace MyApp.Models;
// 
// class User
// {
//     public string Name { get; set; }
// }
// 
// class Product
// {
//     public string Name { get; set; }
// }

// 注意：文件作用域命名空间必须放在文件顶部
// 一个文件只能有一个命名空间
\`\`\`

### 八、小结

本章学到了：
- 命名空间的定义和使用
- 命名空间嵌套
- 命名空间别名和 \`using static\`
- 全局 \`using\`（C# 10+）
- 隐式 \`using\`（.NET 6+）
- 程序结构：顶级语句 vs 传统 \`Main\` 方法
- 文件作用域命名空间（C# 10+）

下一章我们学习调试技巧与最佳实践。`,
  },

  // ============================================================
  // 第十章：调试技巧与最佳实践
  // ============================================================
  {
    id: 'csharp2-ch10',
    group: '第一部分 基础入门',
    icon: '🔍',
    title: '调试技巧与最佳实践',
    content: `## 调试技巧与最佳实践

### 一、Console 输出调试

\`\`\`csharp
// 最简单的调试方式：Console 输出

// 1. 输出变量值
int x = 10;
string name = "张三";
Console.WriteLine($"调试：x = {x}, name = {name}");

// 2. 输出到标准错误
Console.Error.WriteLine("错误信息");

// 3. 条件输出（只在调试时输出）
#if DEBUG
Console.WriteLine("仅在 Debug 模式下输出");
#endif

// 4. 使用 Debug 类
System.Diagnostics.Debug.WriteLine("调试信息");
System.Diagnostics.Debug.WriteLineIf(x > 5, "x 大于 5");

// 5. 使用 Trace 类
System.Diagnostics.Trace.WriteLine("跟踪信息");
System.Diagnostics.Trace.TraceInformation("信息");
System.Diagnostics.Trace.TraceWarning("警告");
System.Diagnostics.Trace.TraceError("错误");
\`\`\`

### 二、断言

\`\`\`csharp
// 断言：验证条件是否为真，失败时抛出异常

// Debug.Assert：仅在 Debug 模式下有效
System.Diagnostics.Debug.Assert(x > 0, "x 必须大于 0");
System.Diagnostics.Debug.Assert(!string.IsNullOrEmpty(name), "name 不能为空");

// 如果条件为 false，会弹出对话框（Debug 模式）或抛出异常

// 自定义断言方法
void Assert(bool condition, string message)
{
    if (!condition)
    {
        throw new Exception($"断言失败：{message}");
    }
}

Assert(x > 0, "x 必须大于 0");
Assert(name.Length > 0, "name 不能为空");

// 使用 Contract（代码契约）
// 需要安装 System.Diagnostics.Contracts NuGet 包
// Contracts.Requires(x > 0);  // 前置条件
// Contracts.Ensures(Contracts.Result<int>() > 0);  // 后置条件
\`\`\`

### 三、条件编译

\`\`\`csharp
// 条件编译：根据编译符号包含或排除代码

// 定义编译符号（在 .csproj 中）
// <PropertyGroup>
//   <DefineConstants>DEBUG;TRACE;MY_SYMBOL</DefineConstants>
// </PropertyGroup>

// 使用条件编译
#if DEBUG
Console.WriteLine("Debug 模式");
#elif RELEASE
Console.WriteLine("Release 模式");
#else
Console.WriteLine("其他模式");
#endif

// 多个条件
#if DEBUG && TRACE
Console.WriteLine("Debug 且 Trace");
#endif

#if DEBUG || TRACE
Console.WriteLine("Debug 或 Trace");
#endif

// 条件特性
[Conditional("DEBUG")]
void DebugOnlyMethod()
{
    Console.WriteLine("仅在 Debug 模式下编译");
}

DebugOnlyMethod();  // Release 模式下这行代码会被忽略

// 条件特性必须返回 void
// 常用于日志方法
[Conditional("LOG_ENABLED")]
void Log(string message)
{
    Console.WriteLine($"[LOG] {message}");
}

Log("这是一条日志");
\`\`\`

### 四、Debugger 特性

\`\`\`csharp
// Debugger 特性：控制调试器行为

// DebuggerDisplay：自定义调试器显示
[System.Diagnostics.DebuggerDisplay("User: {Name}, Age: {Age}")]
class User
{
    public string Name { get; set; }
    public int Age { get; set; }
}

var user = new User { Name = "张三", Age = 25 };
// 调试器中显示：User: 张三, Age: 25

// DebuggerBrowsable：控制调试器是否显示成员
class MyClass
{
    [System.Diagnostics.DebuggerBrowsable(System.Diagnostics.DebuggerBrowsableState.Never)]
    private int _internalValue;  // 调试器中不显示
    
    public int PublicValue { get; set; }  // 调试器中显示
}

// DebuggerStepThrough：调试器跳过此方法
[System.Diagnostics.DebuggerStepThrough]
void SimpleMethod()
{
    // 调试时不会进入这个方法
    Console.WriteLine("Simple");
}

// DebuggerHidden：完全隐藏方法
[System.Diagnostics.DebuggerHidden]
void HiddenMethod()
{
    Console.WriteLine("Hidden");
}
\`\`\`

### 五、日志记录

\`\`\`csharp
// 简单的日志类
class Logger
{
    public enum LogLevel
    {
        Debug,
        Info,
        Warning,
        Error
    }
    
    private LogLevel _minLevel;
    
    public Logger(LogLevel minLevel = LogLevel.Info)
    {
        _minLevel = minLevel;
    }
    
    public void Log(LogLevel level, string message)
    {
        if (level >= _minLevel)
        {
            string timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            Console.WriteLine($"[{timestamp}] [{level}] {message}");
        }
    }
    
    public void Debug(string message) => Log(LogLevel.Debug, message);
    public void Info(string message) => Log(LogLevel.Info, message);
    public void Warning(string message) => Log(LogLevel.Warning, message);
    public void Error(string message) => Log(LogLevel.Error, message);
}

// 使用日志
var logger = new Logger(Logger.LogLevel.Debug);

logger.Debug("这是调试信息");
logger.Info("这是普通信息");
logger.Warning("这是警告信息");
logger.Error("这是错误信息");

// 带上下文的日志
void ProcessData(string data, Logger logger)
{
    logger.Info($"开始处理数据：{data}");
    
    try
    {
        // 处理数据
        if (string.IsNullOrEmpty(data))
        {
            throw new ArgumentException("数据不能为空");
        }
        
        logger.Info("数据处理成功");
    }
    catch (Exception ex)
    {
        logger.Error($"处理失败：{ex.Message}");
        throw;
    }
}

ProcessData("test data", logger);
\`\`\`

### 六、性能测量

\`\`\`csharp
// 使用 Stopwatch 测量代码执行时间
var stopwatch = System.Diagnostics.Stopwatch.StartNew();

// 要测量的代码
int sum = 0;
for (int i = 0; i < 1000000; i++)
{
    sum += i;
}

stopwatch.Stop();
Console.WriteLine($"执行时间：{stopwatch.ElapsedMilliseconds}ms");
Console.WriteLine($"精确时间：{stopwatch.Elapsed}");

// 多次测量取平均
const int iterations = 100;
var times = new List<long>();

for (int i = 0; i < iterations; i++)
{
    var sw = System.Diagnostics.Stopwatch.StartNew();
    
    // 要测量的代码
    var result = Enumerable.Range(1, 10000).Sum();
    
    sw.Stop();
    times.Add(sw.ElapsedMilliseconds);
}

Console.WriteLine($"平均时间：{times.Average():F2}ms");
Console.WriteLine($"最小时间：{times.Min()}ms");
Console.WriteLine($"最大时间：{times.Max()}ms");

// 使用 DateTime（精度较低，不推荐）
var start = DateTime.Now;
// 要测量的代码
var end = DateTime.Now;
Console.WriteLine($"耗时：{(end - start).TotalMilliseconds}ms");
\`\`\`

### 七、最佳实践总结

\`\`\`csharp
// 1. 命名规范
// - 类名：PascalCase（如 UserService）
// - 方法名：PascalCase（如 GetUserById）
// - 参数名：camelCase（如 userName）
// - 局部变量：camelCase（如 totalCount）
// - 私有字段：_camelCase（如 _connectionString）
// - 常量：PascalCase 或全大写（如 MaxCount 或 MAX_COUNT）

// 2. 代码组织
// - 一个类一个文件
// - 文件名与类名一致
// - 使用命名空间组织相关类

// 3. 注释
// - 公共 API 必须有 XML 文档注释
// - 复杂逻辑需要注释说明"为什么"
// - 不要注释"是什么"（代码本身应该清晰）

/// <summary>
/// 根据用户 ID 获取用户信息
/// </summary>
/// <param name="userId">用户 ID</param>
/// <returns>用户对象，如果不存在返回 null</returns>
User GetUserById(int userId)
{
    // 从数据库查询用户
    return null;
}

// 4. 错误处理
// - 不要吞掉异常
// - 使用特定的异常类型
// - 提供有意义的错误信息

// 5. 代码简洁
// - 避免过长的方法（建议不超过 50 行）
// - 避免过深的嵌套（建议不超过 3 层）
// - 使用 LINQ 简化集合操作

// 6. 使用 var
// - 当右侧类型明显时使用 var
var list = new List<string>();  // 好
List<string> list2 = new List<string>();  // 冗余

// 7. 字符串处理
// - 少量拼接用插值：$"{a} + {b} = {a + b}"
// - 大量拼接用 StringBuilder
// - 多行字符串用原始字符串字面量

// 8. 空值处理
// - 使用 ?. 避免 NullReferenceException
// - 使用 ?? 提供默认值
// - 使用 ??= 赋值

string name = null;
string displayName = name ?? "匿名用户";
name ??= "默认值";

// 9. 使用模式匹配
if (obj is string s && s.Length > 10)
{
    Console.WriteLine($"长字符串：{s}");
}

// 10. 常量与只读
// - 编译时确定的值用 const
// - 运行时确定的值用 readonly
\`\`\`

### 八、小结

本章学到了：
- Console 输出调试
- 断言验证条件
- 条件编译
- Debugger 特性
- 日志记录
- 性能测量
- C# 编程最佳实践

第一部分基础入门到此结束！接下来我们进入第二部分：面向对象编程。`,
  },
];

export { chapters };
