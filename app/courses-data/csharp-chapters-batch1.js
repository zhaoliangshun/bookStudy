// =============================================================
// C# 实战教程 - 第一批章节（前言 + 第一部分快速上手，共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   csharp-preface : 前言（教程使用说明 + 学习路线）
//   csharp-ch01    : 第一章 5 分钟写出第一个程序
//   csharp-ch02    : 第二章 变量与常用类型
//   csharp-ch03    : 第三章 字符串操作实战
//   csharp-ch04    : 第四章 控制流与逻辑判断
//
// 风格：demo 驱动，每章直接上手写代码，多注释，跳过历史理论。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 前言
  // ============================================================
  {
    id: 'csharp-preface',
    group: '开篇',
    icon: '📖',
    title: '前言',
    content: `## 前言

### 一、这本教程讲什么

这是一本**实战优先**的 C# 教程。和传统教程不同，本书不讲 C# 的历史、不讲 .NET 平台的演化史、不堆砌语言特性——**每一章都从可运行的代码开始**，边写边学。

学完本书，你能做到：

- 用 C# 写出控制台程序，处理日常开发任务。
- 看懂 .NET 项目的代码结构，上手 ASP.NET Core / Unity / MAUI 不会一头雾水。
- 熟练使用集合、LINQ、异步、文件 IO、JSON、HTTP 这些**天天用得到**的能力。
- 写出有类有接口、可维护的工程化代码。

### 二、本书的版本约定

- **.NET 8 LTS**（长期支持版本，生产环境首选）
- **C# 12**（随 .NET 8 发布的语法版本）
- **顶级语句**（C# 9+ 特性，控制台程序无需 \`class Program\` / \`Main\`）

> 沙箱环境会自动检测系统已安装的 .NET SDK 版本。本机是 .NET 8.0.412。

### 三、怎么用这本教程

每章的结构都是：

1. **一两句话讲清楚这章干什么**。
2. **直接给可运行的代码**——点击"运行"按钮看结果。
3. **代码里写满注释**——重点解释为什么这样写。
4. **小结**——这章学到了什么。

建议：

- **不要只读不敲**。把每段代码复制到编辑器里改一改、跑一跑，看输出变化。
- **遇到看不懂的先跳过**。C# 有些高级特性第一次看会懵，往后学几章再回头看就懂了。
- **重点掌握带 ⭐ 标记的知识点**，这些是日常开发 80% 场景都用得到的。

### 四、五分钟上手

别等了，先跑一段代码。下面这段就是一个**完整可运行**的 C# 程序——点击运行看看效果：

\`\`\`csharp
// 这是 C# 的顶级语句：直接写代码，不用套 class/Main
// 下面这行向控制台输出一行文字并换行
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

看到了吗？这就是 C# 程序——没有 \`class\`、没有 \`Main\`、没有一堆样板代码。**现代 C# 可以非常简洁**。

### 五、全书目录一览

| 部分 | 章节 | 主题 |
| --- | --- | --- |
| 第一部分 快速上手 | 第 1-4 章 | 第一个程序、变量类型、字符串、控制流 |
| 第二部分 核心语法 | 第 5-8 章 | 方法、集合、日期时间、枚举结构体 |
| 第三部分 面向对象 | 第 9-12 章 | 类与对象、继承多态、接口、属性索引器 |
| 第四部分 高级特性 | 第 13-16 章 | 泛型、委托Lambda事件、LINQ、异步 |
| 第五部分 实战应用 | 第 17-20 章 | 文件IO、异常处理、JSON与HTTP、综合项目 |

> 准备好了吗？翻到第一章，开始写代码。`,
  },

  // ============================================================
  // 第一章：5 分钟写出第一个程序
  // ============================================================
  {
    id: 'csharp-ch01',
    group: '第一部分 快速上手',
    icon: '🚀',
    title: '5 分钟写出第一个程序',
    content: `## 第一章　5 分钟写出第一个程序

这一章带你从零跑通一段 C# 代码，掌握控制台输入输出、注释、字符串插值这几个最基础的能力。读完你就能写出"会说话"的程序。

### 一、最简程序：一行代码

C# 9 引入"顶级语句"（top-level statements），控制台程序可以简化到一行：

\`\`\`csharp
// 这就是一个完整的 C# 程序
Console.WriteLine("Hello, World!");
\`\`\`

\`Console.WriteLine\` 是 .NET 提供的方法，向控制台输出一行文字并换行。\`Console\` 类位于 \`System\` 命名空间，但 .NET 6+ 的项目模板默认开启了\`ImplicitUsings\`，所以不用写 \`using System;\`。

> ⭐ 顶级语句：一个项目里只能有一个文件用顶级语句，通常是 \`Program.cs\`。学习阶段我们全用顶级语句，简洁易读。

### 二、输出与输入

#### 1. 输出：WriteLine 换行 / Write 不换行

\`\`\`csharp
// WriteLine 输出后自动换行
Console.WriteLine("第一行");
Console.WriteLine("第二行");

// Write 输出不换行，适合拼接同一行
Console.Write("Hello, ");
Console.Write("World!");
Console.WriteLine(); // 单独一个 WriteLine() 只输出换行
\`\`\`

输出：
\`\`\`
第一行
第二行
Hello, World!
\`\`\`

#### 2. 字符串插值：用 $ 前缀 ⭐

这是 C# 最常用、最舒服的特性之一。在字符串前加 \`$\`，用 \`{}\` 包裹变量或表达式：

\`\`\`csharp
string name = "张三";
int age = 25;

// $ 前缀 + {} 插值，比 string.Format 直观
Console.WriteLine($"我叫 {name}，今年 {age} 岁");

// {} 里可以写任意表达式
Console.WriteLine($"明年我 {age + 1} 岁");
Console.WriteLine($"姓名长度：{name.Length}");
\`\`\`

输出：
\`\`\`
我叫 张三，今年 25 岁
明年我 26 岁
姓名长度：2
\`\`\`

#### 3. 读取输入：ReadLine

\`\`\`csharp
Console.Write("请输入你的名字：");
string input = Console.ReadLine(); // 读取一行输入
Console.WriteLine($"你好，{input}！");
\`\`\`

> 沙箱环境对交互式输入支持有限，但语法完全正确。真实环境里 \`ReadLine\` 是获取用户输入的标准方式。

### 三、注释的三种写法

注释是写给人看的，编译器会忽略。**好代码的注释解释"为什么"，而不是"做了什么"**。

\`\`\`csharp
// 1. 单行注释：解释一行代码的意图

/*
   2. 多行注释：解释一段逻辑
   适合写较长的说明
*/

/// <summary>
/// 3. XML 文档注释：用 /// 开头
/// 可以被工具提取成 API 文档
/// </summary>
/// <param name="a">加数</param>
/// <param name="b">被加数</param>
/// <returns>两数之和</returns>
int Add(int a, int b) => a + b;
\`\`\`

> 第 3 种 XML 注释主要用于库开发，写公开 API 时加上。日常写业务代码用前两种就够。

### 四、实战 demo：个人信息卡片

把上面学的拼起来，写一个完整的小程序——输出一张"个人信息卡片"：

\`\`\`csharp
// === 个人信息卡片生成器 ===
// 演示：字符串插值、对齐、分隔线、简单计算

Console.WriteLine("======== 个人信息卡片 ========");
Console.WriteLine();

// 基本信息（用变量存储）
string name = "C# 学习者";
int age = 28;
string job = "全栈工程师";
string city = "深圳";
double height = 175.5;

// 用字符串插值输出，{变量,-宽度} 表示左对齐占 N 个字符
Console.WriteLine($"姓名：{name}");
Console.WriteLine($"年龄：{age} 岁");
Console.WriteLine($"职业：{job}");
Console.WriteLine($"城市：{city}");
Console.WriteLine($"身高：{height:F1} cm");  // F1 表示保留 1 位小数

Console.WriteLine();

// 简单计算：算出生年份
int birthYear = 2026 - age;
Console.WriteLine($"推断出生年份：{birthYear}");

// 画一条分隔线：new string(字符, 重复次数)
Console.WriteLine(new string('=', 30));
Console.WriteLine("卡片生成完毕，按任意键继续...");
\`\`\`

输出：
\`\`\`
======== 个人信息卡片 ========

姓名：C# 学习者
年龄：28 岁
职业：全栈工程师
城市：深圳
身高：175.5 cm

推断出生年份：1998
==============================
卡片生成完毕，按任意键继续...
\`\`\`

### 五、本章小结

- ⭐ 顶级语句让控制台程序极简：直接写 \`Console.WriteLine(...)\` 就能跑。
- ⭐ \`Console.WriteLine\` 换行输出，\`Console.Write\` 不换行，\`Console.ReadLine\` 读输入。
- ⭐ 字符串插值 \`$"...{变量}..."\` 是日常最常用的输出方式。
- 注释三种写法：\`//\` 单行、\`/* */\` 多行、\`///\` XML 文档。
- 格式化占位符 \`{变量:F1}\` 保留 1 位小数，\`{变量,-20}\` 左对齐占 20 字符。

下一章讲变量和数据类型——所有编程语言的根基。`,
  },

  // ============================================================
  // 第二章：变量与常用类型
  // ============================================================
  {
    id: 'csharp-ch02',
    group: '第一部分 快速上手',
    icon: '📦',
    title: '变量与常用类型',
    content: `## 第二章　变量与常用类型

这一章讲 C# 里**天天用**的几种类型：整数、小数、布尔、字符串，以及 \`var\` 关键字和类型转换。学完你能正确地声明变量、做基本计算。

### 一、声明变量

C# 是强类型语言——每个变量都有明确类型。声明语法：\`类型 变量名 = 值;\`

\`\`\`csharp
int age = 25;            // 整数
double price = 9.99;     // 双精度小数
bool isAdmin = true;     // 布尔
string name = "张三";    // 字符串
char grade = 'A';        // 单个字符（单引号）
\`\`\`

### 二、整数类型：按范围选 ⭐

C# 的整数类型按字节数分多种。**90% 土景用 \`int\` 就够**，特殊场景才换：

\`\`\`csharp
// === 整数类型一览 ===
byte b = 255;              // 1 字节，范围 0~255（适合存颜色、字节数据）
short s = 32000;           // 2 字节（很少用）
int i = 2000000;           // 4 字节，范围 ±21 亿，最常用 ⭐
long l = 9000000000L;      // 8 字节，超大数（注意 L 后缀）

// 字面量分隔符：C# 7+ 支持下划线分隔，便于读大数
long bigNumber = 9_000_000_000L;
Console.WriteLine(bigNumber);  // 9000000000
\`\`\`

### 三、浮点类型：double / float / decimal

\`\`\`csharp
// === 小数类型 ===
double d = 3.14159;        // 8 字节，双精度，科学计算/日常首选 ⭐
float f = 3.14f;           // 4 字节，单精度（注意 f 后缀）
decimal money = 19.99m;    // 16 字节，高精度（注意 m 后缀，财务专用）⭐

Console.WriteLine($"double: {d}");
Console.WriteLine($"float: {f}");
Console.WriteLine($"decimal: {money}");
\`\`\`

> ⭐ **金额计算必须用 \`decimal\`**——它不会丢精度。用 \`double\` 算钱会出现 0.1+0.2=0.30000000000000004 这种诡异结果。

\`\`\`csharp
// 金额计算的典型坑
double a = 0.1, b = 0.2;
Console.WriteLine(a + b);  // 0.30000000000000004（精度丢失）

decimal x = 0.1m, y = 0.2m;
Console.WriteLine(x + y);  // 0.3（精确）
\`\`\`

### 四、布尔与字符

\`\`\`csharp
// 布尔：只能是 true / false
bool isLogin = true;
bool hasPermission = false;
Console.WriteLine($"登录状态：{isLogin}");

// 字符：单引号，单个 Unicode 字符
char grade = 'A';
char chinese = '中';
Console.WriteLine($"等级：{grade}，汉字：{chinese}");
\`\`\`

### 五、字符串初探

字符串后面有一整章专门讲，这里先认识基本用法：

\`\`\`csharp
// 声明
string greeting = "Hello";
string empty1 = "";        // 空字符串
string empty2 = string.Empty; // 推荐写法（不分配新对象）
string nullStr = null;     // null 引用（未指向任何对象）

// 基本操作
Console.WriteLine(greeting.Length);        // 长度 5
Console.WriteLine(greeting.ToUpper());     // 大写 HELLO
Console.WriteLine(greeting.ToLower());     // 小写 hello

// 拼接（性能不如 StringBuilder，但日常够用）
string first = "张";
string last = "三";
string full = first + last;          // +
string full2 = string.Concat(first, last);
Console.WriteLine(full);   // 张三
\`\`\`

### 六、var 关键字：让编译器推断类型 ⭐

\`var\` 让编译器根据右侧的值推断类型，写起来像动态语言，但**仍然是强类型**：

\`\`\`csharp
// 这两行等价
int x = 10;
var y = 10;          // 推断为 int

var name = "张三";    // 推断为 string
var price = 9.99;     // 推断为 double
var numbers = new[] { 1, 2, 3 };  // 推断为 int[]

// var 的好处：类型名很长时省事
var list = new List<string>();  // 比 List<string> list = ... 简洁
\`\`\`

> ⭐ **何时用 var**：右边能直观看出类型时用 \`var\`（如 \`new\` 表达式、字面量）；看不出类型时（如方法返回值）用具体类型，便于阅读。

### 七、常量与只读

\`\`\`csharp
// const：编译期常量，必须用字面量初始化
const double Pi = 3.14159265;
const string AppName = "MyApp";
// Pi = 3;  // 编译错误：const 不能重新赋值

// readonly：运行时常量（只能用在类字段，顶级语句里不直接用）
// 区别：const 在编译时替换为字面量；readonly 在运行时确定值
\`\`\`

### 八、类型转换

#### 1. 隐式转换（小类型→大类型，安全）

\`\`\`csharp
int i = 100;
long l = i;        // int → long，自动
double d = i;      // int → double，自动
Console.WriteLine(d);  // 100
\`\`\`

#### 2. 显式转换（大类型→小类型，可能丢精度）

\`\`\`csharp
double d = 9.99;
int i = (int)d;     // 强制转换，截断小数部分
Console.WriteLine(i);  // 9

long l = 5000000000L;
int i2 = (int)l;     // 超出 int 范围，溢出！结果不对
Console.WriteLine(i2); // 705032704（错误结果）
\`\`\`

#### 3. Parse / TryParse：字符串转数字 ⭐

这是**实际开发最常用**的转换方式：

\`\`\`csharp
// Parse：转换失败会抛异常
int n1 = int.Parse("123");
double d1 = double.Parse("3.14");

// TryParse：转换失败返回 false，不抛异常（推荐）⭐
string input = "abc";
if (int.TryParse(input, out int result))
{
    Console.WriteLine($"转换成功：{result}");
}
else
{
    Console.WriteLine("不是合法的数字");
}

// 实战：安全的用户输入处理
Console.Write("请输入年龄：");
string ageStr = "25";  // 模拟用户输入
if (int.TryParse(ageStr, out int age) && age >= 0 && age <= 150)
{
    Console.WriteLine($"你今年 {age} 岁");
}
else
{
    Console.WriteLine("请输入合法的年龄（0-150）");
}
\`\`\`

#### 4. Convert 类：通用转换

\`\`\`csharp
// Convert 提供 ToXxx 方法，支持多种类型互转
string s = "123";
int n = Convert.ToInt32(s);     // 字符串转 int
double d = Convert.ToDouble(s); // 字符串转 double
bool b = Convert.ToBoolean("true");
Console.WriteLine($"int={n}, double={d}, bool={b}");
\`\`\`

### 九、实战 demo：订单金额计算

把整型、浮点、字符串插值、转换组合起来：

\`\`\`csharp
// === 订单金额计算 ===
// 演示：decimal 金额计算、字符串转数字、格式化输出

// 商品信息
string itemName = "蓝牙耳机";
int quantity = 3;
decimal unitPrice = 199.50m;   // 单价（用 decimal 保证精度）
decimal taxRate = 0.13m;       // 税率 13%

// 计算
decimal subtotal = unitPrice * quantity;    // 小计
decimal tax = subtotal * taxRate;          // 税额
decimal total = subtotal + tax;            // 总价

// 输出（C 表示货币格式，会自动加 ¥ 符号）
Console.WriteLine("===== 订单详情 =====");
Console.WriteLine($"商品：{itemName}");
Console.WriteLine($"数量：{quantity}");
Console.WriteLine($"单价：{unitPrice:C}");     // ¥199.50
Console.WriteLine($"小计：{subtotal:C}");      // ¥598.50
Console.WriteLine($"税率：{taxRate:P0}");       // 13%
Console.WriteLine($"税额：{tax:C}");            // ¥77.81
Console.WriteLine($"应付：{total:C}");          // ¥676.31
Console.WriteLine("==================");

// 演示 TryParse 处理用户输入的折扣码
string discountInput = "50";  // 模拟用户输入折扣金额
if (decimal.TryParse(discountInput, out decimal discount) && discount > 0)
{
    decimal final = total - discount;
    Console.WriteLine($"优惠：-{discount:C}");
    Console.WriteLine($"实付：{final:C}");
}
\`\`\`

输出：
\`\`\`
===== 订单详情 =====
商品：蓝牙耳机
数量：3
单价：¥199.50
小计：¥598.50
税率：13%
税额：¥77.81
应付：¥676.31
==================
优惠：-¥50.00
实付：¥626.31
\`\`\`

### 十、本章小结

- ⭐ 整数默认用 \`int\`，金额必须用 \`decimal\`（带 \`m\` 后缀），科学计算用 \`double\`。
- ⭐ \`var\` 让编译器推断类型，右边能看出类型时用 \`var\` 更简洁。
- ⭐ 字符串转数字用 \`int.TryParse(s, out int n)\`——失败不抛异常，最安全。
- \`const\` 是编译期常量，不可重新赋值。
- 格式化：\`{x:C}\` 货币、\`{x:F2}\` 两位小数、\`{x:P0}\` 百分比。

下一章讲字符串操作——日常开发处理最多的数据类型。`,
  },

  // ============================================================
  // 第三章：字符串操作实战
  // ============================================================
  {
    id: 'csharp-ch03',
    group: '第一部分 快速上手',
    icon: '✏️',
    title: '字符串操作实战',
    content: `## 第三章　字符串操作实战

字符串是日常开发处理最多的数据类型——拼接、查找、替换、分割、格式化，几乎天天用。这一章讲完，你就能熟练处理 90% 的字符串任务。

### 一、字符串插值回顾

\`\`\`csharp
string name = "张三";
int age = 25;

// $ + {} 插值
string s1 = $"我叫{name}，今年{age}岁";

// {} 里可以写表达式
string s2 = $"明年{age + 1}岁，{(age >= 18 ? "成年" : "未成年")}";

Console.WriteLine(s1);
Console.WriteLine(s2);
\`\`\`

### 二、字符串常用方法 ⭐

\`\`\`csharp
string s = "  Hello, World!  ";

// === 长度与空判断 ===
Console.WriteLine(s.Length);        // 长度 17（含空格）

string empty = "";
Console.WriteLine(string.IsNullOrEmpty(empty));  // true
Console.WriteLine(string.IsNullOrWhiteSpace(s)); // false（s 有内容）

// === 去空格 ===
Console.WriteLine(s.Trim());          // "Hello, World!"（去首尾空格）
Console.WriteLine(s.TrimStart());    // 去开头空格
Console.WriteLine(s.TrimEnd());      // 去结尾空格

// === 大小写转换 ===
Console.WriteLine(s.ToUpper());      // "  HELLO, WORLD!  "
Console.WriteLine(s.ToLower());      // "  hello, world!  "
\`\`\`

### 三、查找与判断 ⭐

\`\`\`csharp
string s = "Hello, World!";

// 是否包含子串
Console.WriteLine(s.Contains("World"));   // true
Console.WriteLine(s.Contains("world"));   // false（区分大小写）

// 是否以某串开头/结尾
Console.WriteLine(s.StartsWith("Hello"));  // true
Console.WriteLine(s.EndsWith("!"));       // true

// 查找子串位置（找不到返回 -1）
int idx = s.IndexOf("World");   // 7
int notFound = s.IndexOf("world"); // -1（区分大小写）

// 忽略大小写查找
int idx2 = s.IndexOf("world", StringComparison.OrdinalIgnoreCase);
Console.WriteLine(idx2);  // 7
\`\`\`

> ⭐ \`StringComparison.OrdinalIgnoreCase\` 是忽略大小写比较的标准写法，比先 \`ToLower()\` 再比较更高效。

### 四、截取、替换、分割 ⭐

\`\`\`csharp
string s = "Hello, World!";

// 截取：Substring(起始索引, 长度)
Console.WriteLine(s.Substring(7, 5));    // "World"
Console.WriteLine(s.Substring(7));       // "World!"（到结尾）

// 替换：Replace(旧串, 新串)
string r = s.Replace("World", "C#");
Console.WriteLine(r);   // "Hello, C#!"

// 分割：Split(分隔符) → 返回数组
string csv = "张三,25,深圳,工程师";
string[] parts = csv.Split(',');
Console.WriteLine($"姓名：{parts[0]}");   // 张三
Console.WriteLine($"年龄：{parts[1]}");   // 25
Console.WriteLine($"城市：{parts[2]}");   // 深圳

// 多分隔符分割
string mixed = "a,b;c|d";
string[] arr = mixed.Split(new[] { ',', ';', '|' });
Console.WriteLine(arr.Length);  // 4
\`\`\`

### 五、拼接与合并

\`\`\`csharp
// string.Join：用分隔符把数组拼成字符串 ⭐
string[] names = { "张三", "李四", "王五" };
string joined = string.Join(", ", names);
Console.WriteLine(joined);   // 张三, 李四, 王五

// + 拼接（少量拼接用 + 没问题）
string s = "a" + "b" + "c";

// string.Concat：无分隔符拼接
string c = string.Concat("Hello", " ", "World");
Console.WriteLine(c);  // Hello World
\`\`\`

### 六、StringBuilder：循环拼接的救星 ⭐

\`\`string\` 是不可变的——每次拼接都会创建新对象。在循环里反复拼接同一个字符串，性能会很差。这时用 \`StringBuilder\`：

\`\`\`csharp
using System.Text;  // StringBuilder 在这个命名空间

// ❌ 错误写法：循环里用 + 拼接，每次都创建新字符串
string bad = "";
for (int i = 0; i < 5; i++)
{
    bad += i.ToString();  // 每次都新建一个字符串对象
}
Console.WriteLine(bad);  // 01234

// ✅ 正确写法：用 StringBuilder
var sb = new StringBuilder();
for (int i = 0; i < 5; i++)
{
    sb.Append(i);       // 追加，不创建新对象
    sb.Append(", ");    // 追加分隔符
}
string good = sb.ToString();
Console.WriteLine(good);  // 0, 1, 2, 3, 4,

// StringBuilder 的常用方法
var sb2 = new StringBuilder();
sb2.AppendLine("第一行");      // 追加一行（带换行）
sb2.AppendLine("第二行");
sb2.AppendFormat("数字：{0:D3}", 42);  // 格式化追加
Console.WriteLine(sb2.ToString());
\`\`\`

> ⭐ **经验法则**：拼接次数 ≤ 5 次用 \`+\` 或 \`string.Concat\`；超过 5 次或在循环里拼接，用 \`StringBuilder\`。

### 七、格式化与对齐

\`\`\`csharp
// 数字格式化
double pi = 3.14159265;
Console.WriteLine(pi.ToString("F2"));    // 3.14（保留 2 位小数）
Console.WriteLine(pi.ToString("F4"));    // 3.1416
Console.WriteLine(pi.ToString("P"));    // 314.16%（百分比）
Console.WriteLine(12345.ToString("N0")); // 12,345（千分位）

// 日期格式化（第 7 章详细讲）
DateTime now = DateTime.Now;
Console.WriteLine(now.ToString("yyyy-MM-dd"));  // 2026-07-18
Console.WriteLine(now.ToString("HH:mm:ss"));   // 14:30:25

// 字符串对齐：{变量,宽度} 右对齐，{变量,-宽度} 左对齐
Console.WriteLine($"{"姓名",-10}{"年龄",5}{"城市",-10}");
Console.WriteLine($"{"张三",-10}{25,5}{"深圳",-10}");
Console.WriteLine($"{"李四",-10}{30,5}{"上海",-10}");
\`\`\`

输出：
\`\`\`
姓名        年龄  城市
张三           25  深圳
李四           30  上海
\`\`\`

### 八、原始字符串字面量（C# 11+）⭐

处理带引号、反斜杠的字符串（如 JSON、正则）时，传统写法要疯狂转义。C# 11 引入 \`"""\` 三引号字符串：

\`\`\`csharp
// 传统写法：要转义引号和反斜杠
string jsonOld = "{ \\"name\\": \\"张三\\", \\"age\\": 25 }";

// 原始字符串：用 """ 包裹，里面的引号无需转义
string json = """{"name": "张三", "age": 25}""";
Console.WriteLine(json);

// 多行原始字符串：""" 后换行，内容直到 """ 前
string html = """
    <div>
        <h1>标题</h1>
        <p>内容</p>
    </div>
    """;
Console.WriteLine(html);
\`\`\`

> ⭐ 写 JSON 模板、HTML 片段、正则表达式时，优先用 \`"""\` 原始字符串，可读性大幅提升。

### 九、实战 demo：日志格式化器

写一个简单的小工具——把分散的数据格式化成对齐的日志输出：

\`\`\`csharp
using System.Text;

// === 日志格式化器 ===
// 输入若干条日志，输出对齐的表格

// 模拟日志数据
var logs = new[]
{
    new { Time = "14:30:01", Level = "INFO",  Msg = "服务启动" },
    new { Time = "14:30:05", Level = "WARN",  Msg = "内存占用偏高" },
    new { Time = "14:31:20", Level = "ERROR", Msg = "数据库连接失败" },
    new { Time = "14:32:00", Level = "INFO",  Msg = "重连成功" },
};

// 用 StringBuilder 拼接（循环里拼接的首选）
var sb = new StringBuilder();
sb.AppendLine("===== 系统日志 =====");

// 表头：-10 左对齐 10 字符，8 右对齐 8 字符
sb.AppendLine($"{"时间",-10}{"级别",8}  {"消息"}");
sb.AppendLine(new string('-', 40));

// 表内容
foreach (var log in logs)
{
    sb.AppendLine($"{log.Time,-10}{log.Level,8}  {log.Msg}");
}

sb.AppendLine(new string('-', 40));
sb.Append($"共 {logs.Length} 条日志");

Console.WriteLine(sb.ToString());
\`\`\`

输出：
\`\`\`
===== 系统日志 =====
时间          级别  消息
----------------------------------------
14:30:01     INFO  服务启动
14:30:05     WARN  内存占用偏高
14:31:20    ERROR  数据库连接失败
14:32:00     INFO  重连成功
----------------------------------------
共 4 条日志
\`\`\`

### 十、本章小结

- ⭐ \`Contains/StartsWith/EndsWith/IndexOf\` 是字符串判断四件套。
- ⭐ \`Substring/Replace/Split/Trim\` 是字符串操作四件套。
- ⭐ \`string.Join(分隔符, 数组)\` 拼接，\`Split(分隔符)\` 分割——互为逆操作。
- ⭐ 循环拼接用 \`StringBuilder\`，少量拼接用 \`+\` 即可。
- ⭐ \`"""\` 原始字符串处理 JSON/HTML/正则最舒服。
- 格式化：\`{x,-10}\` 左对齐，\`{x,8}\` 右对齐，\`F2\` 两位小数，\`C\` 货币，\`P\` 百分比。

下一章讲控制流——让程序学会"做决定"。`,
  },

  // ============================================================
  // 第四章：控制流与逻辑判断
  // ============================================================
  {
    id: 'csharp-ch04',
    group: '第一部分 快速上手',
    icon: '🔀',
    title: '控制流与逻辑判断',
    content: `## 第四章　控制流与逻辑判断

程序的本质就是"做决定 + 重复执行"。这一章讲 \`if/else\`、\`switch\`、\`for/foreach/while\`——让程序能根据条件走不同分支，能批量处理数据。

### 一、if / else if / else ⭐

\`\`\`csharp
int score = 85;

// 基础结构
if (score >= 90)
{
    Console.WriteLine("优秀");
}
else if (score >= 80)
{
    Console.WriteLine("良好");
}
else if (score >= 60)
{
    Console.WriteLine("及格");
}
else
{
    Console.WriteLine("不及格");
}
\`\`\`

### 二、逻辑运算符与短路求值

\`\`\`csharp
// && 与（都为真）、|| 或（任一为真）、! 非（取反）
int age = 25;
bool hasId = true;

// 多条件组合
if (age >= 18 && hasId)
{
    Console.WriteLine("可以入场");
}

// 短路求值：&& 左边为 false 时右边不计算
string name = null;
if (name != null && name.Length > 0)  // name 为 null 时不会执行 name.Length
{
    Console.WriteLine(name);
}

// ⭐ 空条件运算符 ?. ：优雅处理 null
string safeLen = name?.Length.ToString() ?? "null";
Console.WriteLine($"长度：{safeLen}");  // 长度：null
\`\`\`

> ⭐ \`?.\` 是处理 null 的利器：\`a?.B\` 表示"a 为 null 就返回 null，否则访问 B"。\`??\` 是 null 合并：左侧为 null 就用右侧。

### 三、三元运算符 ?:

\`\`\`csharp
int age = 20;
string stage = age >= 18 ? "成年" : "未成年";
Console.WriteLine(stage);  // 成年

// 嵌套（不推荐，可读性差）
int n = 15;
string s = n > 0 ? "正数" : n < 0 ? "负数" : "零";
Console.WriteLine(s);  // 正数
\`\`\`

### 四、switch 语句 ⭐

\`\`\`csharp
string command = "start";

switch (command)
{
    case "start":
        Console.WriteLine("启动服务");
        break;       // 必须有 break
    case "stop":
        Console.WriteLine("停止服务");
        break;
    case "restart":
        Console.WriteLine("重启服务");
        break;
    default:        // 默认分支（类似 else）
        Console.WriteLine($"未知命令：{command}");
        break;
}
\`\`\`

#### 1. switch 多个 case 合并

\`\`\`csharp
int month = 7;
switch (month)
{
    case 1: case 3: case 5: case 7: case 8: case 10: case 12:
        Console.WriteLine("31 天");
        break;
    case 4: case 6: case 9: case 11:
        Console.WriteLine("30 天");
        break;
    case 2:
        Console.WriteLine("28 或 29 天");
        break;
}
\`\`\`

#### 2. switch 表达式（C# 8+）⭐

现代 C# 推荐用 \`switch 表达式\`——把 switch 当作返回值的表达式：

\`\`\`csharp
int month = 7;
// 语法：表达式 switch { 模式 => 值, ... }
int days = month switch
{
    1 or 3 or 5 or 7 or 8 or 10 or 12 => 31,   // or 表示多个匹配
    4 or 6 or 9 or 11 => 30,
    2 => 28,
    _ => 0   // _ 是丢弃模式，相当于 default
};
Console.WriteLine($"{month} 月有 {days} 天");  // 7 月有 31 天

// 配合关系运算符（C# 9+）
int score = 85;
string grade = score switch
{
    >= 90 => "A",
    >= 80 => "B",
    >= 70 => "C",
    >= 60 => "D",
    _    => "F"
};
Console.WriteLine($"等级：{grade}");  // B
\`\`\`

> ⭐ \`switch 表达式\` 比传统 \`switch\` 语句简洁得多，且能直接赋值。**优先用表达式形式**。

### 五、for 循环

\`\`\`csharp
// 经典 for：知道循环次数时用
for (int i = 0; i < 5; i++)
{
    Console.WriteLine($"第 {i + 1} 次");
}

// 倒序
for (int i = 5; i >= 1; i--)
{
    Console.WriteLine(i);
}

// 步长为 2
for (int i = 0; i <= 10; i += 2)
{
    Console.WriteLine(i);  // 0, 2, 4, 6, 8, 10
}

// 嵌套循环：乘法表
for (int i = 1; i <= 9; i++)
{
    for (int j = 1; j <= i; j++)
    {
        Console.Write($"{j}×{i}={i * j}\t");
    }
    Console.WriteLine();
}
\`\`\`

### 六、foreach：遍历集合的首选 ⭐

\`\`\`csharp
string[] names = { "张三", "李四", "王五" };

// foreach 自动遍历每个元素，不需要索引
foreach (string name in names)
{
    Console.WriteLine(name);
}

// 遍历字符串的字符
foreach (char c in "Hello")
{
    Console.Write(c + " ");  // H e l l o
}
Console.WriteLine();

// 遍历数字范围（C# 8+ Range）
foreach (int i in Enumerable.Range(1, 5))
{
    Console.WriteLine(i);  // 1, 2, 3, 4, 5
}
\`\`\`

> ⭐ **能用 \`foreach\` 就别用 \`for\`**——更安全（不会越界）、更简洁、性能几乎一样。

### 七、while / do-while

\`\`\`csharp
// while：先判断后执行（可能一次都不执行）
int n = 5;
while (n > 0)
{
    Console.WriteLine(n);
    n--;
}

// do-while：先执行后判断（至少执行一次）
int m = 0;
do
{
    Console.WriteLine(m);
    m++;
} while (m < 3);
\`\`\`

### 八、break 与 continue ⭐

\`\`\`csharp
// break：跳出整个循环
for (int i = 1; i <= 10; i++)
{
    if (i == 5) break;   // 到 5 就停
    Console.WriteLine(i);  // 输出 1,2,3,4
}

// continue：跳过本次，继续下一次
for (int i = 1; i <= 10; i++)
{
    if (i % 2 == 0) continue;  // 跳过偶数
    Console.WriteLine(i);       // 输出 1,3,5,7,9
}

// 实战：找出第一个能被 7 整除的数
for (int i = 100; i <= 200; i++)
{
    if (i % 7 == 0)
    {
        Console.WriteLine($"找到：{i}");  // 105
        break;
    }
}
\`\`\`

### 九、实战 demo：猜数字游戏

综合运用 if/while/break，写一个完整的小游戏（电脑出题，玩家猜）：

\`\`\`csharp
// === 猜数字游戏 ===
// 演示：while 循环、if 判断、break、Random

// 用 Random 生成 1~100 的随机数
Random rnd = new Random();
int target = rnd.Next(1, 101);  // 1 到 100

Console.WriteLine("我心里想了一个 1-100 的数字，来猜猜看");
Console.WriteLine("(提示：每次会告诉你是大了还是小了)");

// 模拟玩家猜测序列
int[] guesses = { 50, 75, 60, 65, 63 };
int attempts = 0;

foreach (int guess in guesses)
{
    attempts++;
    Console.WriteLine($"第 {attempts} 次猜：{guess}");

    if (guess == target)
    {
        Console.WriteLine($"🎉 恭喜！{attempts} 次猜中了！");
        break;   // 猜中就退出循环
    }
    else if (guess < target)
    {
        Console.WriteLine("  → 小了，再大一点");
    }
    else
    {
        Console.WriteLine("  → 大了，再小一点");
    }
}

Console.WriteLine($"答案是：{target}");
\`\`\`

可能的输出：
\`\`\`
我心里想了一个 1-100 的数字，来猜猜看
(提示：每次会告诉你是大了还是小了)
第 1 次猜：50
  → 小了，再大一点
第 2 次猜：75
  → 大了，再小一点
第 3 次猜：60
  → 小了，再大一点
第 4 次猜：65
  → 大了，再小一点
第 5 次猜：63
  → 小了，再大一点
答案是：64
\`\`\`

### 十、本章小结

- ⭐ \`if/else if/else\` 处理条件分支；\`&&\`/\`||\`/\`!\` 组合条件，**短路求值**避免空引用。
- ⭐ \`?.\`（空条件）和 \`??\`（null 合并）是处理 null 的两件套。
- ⭐ **switch 表达式**比传统 switch 语句简洁，优先用：\`x switch { 1 => "一", _ => "其他" }\`。
- ⭐ \`foreach\` 遍历集合最简洁安全，能用就不用 \`for\`。
- \`break\` 跳出循环，\`continue\` 跳过本次——两者配合处理边界场景。

下一章进入第二部分，讲方法——把代码组织成可复用的单元。`,
  },
];

export { chapters };
