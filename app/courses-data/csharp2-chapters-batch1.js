// =============================================================
// C# 从入门到精通大全 - 第一批章节（前言 + 第一部分入门基础，共 6 章）
// -------------------------------------------------------------
// 本批包含 6 章：
//   csharp2-preface : 前言（教程定位 + 学习路线 + 全书目录）
//   csharp2-ch01    : 第一章 开发环境与第一个程序
//   csharp2-ch02    : 第二章 变量、数据类型与字面量
//   csharp2-ch03    : 第三章 运算符详解
//   csharp2-ch04    : 第四章 字符串与字符详解
//   csharp2-ch05    : 第五章 控制台输入输出与格式化
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
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
    title: '前言与学习路线',
    content: `## 前言

### 一、这本书适合谁

这是一本**大而全**的 C# 教程，目标只有一个：**让你从零基础写到能上生产的 C# 代码**。

适合：

- 完全没写过 C# 的新手，想系统学一门强类型语言。
- 有 Java / Python / JS 基础，想快速转 C# / .NET 生态。
- 写过一点 C# 但基础不牢，想补全知识体系。

### 二、这本书讲什么

全书 **52 章**，十大模块，覆盖日常开发 100% 高频知识点：

| 模块 | 章节 | 主题 |
| --- | --- | --- |
| 入门基础 | 第 1-5 章 | 环境、变量类型、运算符、字符串、输入输出 |
| 控制流与方法 | 第 6-9 章 | 条件、循环、方法参数、数组 |
| 面向对象基础 | 第 10-14 章 | 类、字段属性、构造函数、静态、继承 |
| 面向对象进阶 | 第 15-19 章 | 多态、抽象类接口、值引用类型、枚举结构体、可空 |
| 泛型与集合 | 第 20-26 章 | 泛型、List、Dictionary、HashSet、迭代器、元组 |
| 委托事件与 LINQ | 第 27-32 章 | 委托、事件、Lambda、LINQ、扩展方法 |
| 高级特性 | 第 33-38 章 | 模式匹配、record、反射、特性、dynamic、协变逆变 |
| 异步与并发 | 第 39-42 章 | async/await、Task、锁、并发集合 |
| IO 与序列化 | 第 43-46 章 | 文件、Stream、JSON、正则 |
| 工程化与实战 | 第 47-52 章 | 异常、日期、命名空间、HttpClient、GC、综合项目 |

### 三、版本约定

- **.NET 8 LTS**（长期支持版本，生产首选）
- **C# 12**（随 .NET 8 发布）
- **顶级语句**（控制台程序无需 \`class Program\` / \`Main\`）

### 四、怎么用这本教程

每章结构固定：

1. **一句话说清这章干什么**。
2. **可运行代码**——点击运行看结果。
3. **注释解释为什么**——不是翻译代码。
4. **小结**——这章学了什么。

建议：

- **边读边敲**。复制代码改一改、跑一跑。
- **看不懂先跳过**。高级特性往后学几章再回头看。
- **⭐ 标记**是日常开发 80% 场景都用的核心点。

### 五、五分钟上手

别等了，先跑一段：

\`\`\`csharp
// 顶级语句：直接写代码，不用 class/Main
Console.WriteLine("你好，C#！");

// $ 字符串插值，{} 放表达式
string name = "开发者";
int year = 2026;
Console.WriteLine($"欢迎 {name}，现在是 {year} 年");

// 简单算术
int a = 15, b = 27;
Console.WriteLine($"{a} + {b} = {a + b}");
\`\`\`

这就是 C# 程序——没有 class、没有 Main、没有样板代码。**现代 C# 可以非常简洁**。

### 六、学习路线建议

\`\`\`
入门(1-9章) → OOP(10-19章) → 集合(20-26章) → 委托LINQ(27-32章)
                                                          ↓
实战(47-52章) ← IO序列化(43-46章) ← 异步(39-42章) ← 高级(33-38章)
\`\`\`

如果时间紧，**最少学完 1-32 章**就够日常开发用。准备好了？翻到第一章。`,
  },

  // ============================================================
  // 第一章：开发环境与第一个程序
  // ============================================================
  {
    id: 'csharp2-ch01',
    group: '第一部分 入门基础',
    icon: '🚀',
    title: '第一章 开发环境与第一个程序',
    content: `## 第一章　开发环境与第一个程序

这一章带你从零跑通 C# 代码，掌握顶级语句、输出、注释、字符串插值。

### 一、最简程序：一行代码

C# 9 引入「顶级语句」（top-level statements），控制台程序可简化到一行：

\`\`\`csharp
// 这就是一个完整的 C# 程序
Console.WriteLine("Hello, World!");
\`\`\`

\`Console.WriteLine\` 向控制台输出一行文字并换行。\`Console\` 在 \`System\` 命名空间，但 .NET 6+ 默认开启 \`ImplicitUsings\`，不用写 \`using System;\`。

> ⭐ 顶级语句：一个项目只能有一个文件用顶级语句，通常是 \`Program.cs\`。学习阶段全用顶级语句。

### 二、输出：WriteLine 与 Write

\`\`\`csharp
// WriteLine 输出后自动换行
Console.WriteLine("第一行");
Console.WriteLine("第二行");

// Write 输出不换行，适合拼接同一行
Console.Write("Hello, ");
Console.Write("World!");
Console.WriteLine(); // 空 WriteLine() 只输出换行
\`\`\`

### 三、字符串插值：$ 前缀 ⭐

这是 C# 最常用、最舒服的特性。字符串前加 \`$\`，用 \`{}\` 包变量或表达式：

\`\`\`csharp
string name = "张三";
int age = 25;

// $ 前缀 + {} 插值，比 string.Format 直观
Console.WriteLine($"我叫 {name}，今年 {age} 岁");

// {} 里可以写任意表达式
Console.WriteLine($"明年我 {age + 1} 岁");
Console.WriteLine($"姓名长度：{name.Length}");
\`\`\`

### 四、注释的三种写法

注释是写给人看的，编译器忽略。**好注释解释"为什么"，不是"做了什么"**。

\`\`\`csharp
// 1. 单行注释：解释一行意图

/*
   2. 多行注释：解释一段逻辑
   适合较长说明
*/

/// <summary>
/// 3. XML 文档注释：用 /// 开头
/// 可被工具提取成 API 文档
/// </summary>
/// <param name="a">加数</param>
/// <param name="b">被加数</param>
/// <returns>两数之和</returns>
int Add(int a, int b) => a + b;
\`\`\`

> 第 3 种 XML 注释主要用于库开发，写公开 API 时加。日常用前两种。

### 五、实战 demo：个人信息卡片

把学的拼起来，写一个完整小程序——输出「个人信息卡片」：

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

// 字符串插值输出
Console.WriteLine($"姓名：{name}");
Console.WriteLine($"年龄：{age} 岁");
Console.WriteLine($"职业：{job}");
Console.WriteLine($"城市：{city}");
// F1 表示保留 1 位小数
Console.WriteLine($"身高：{height:F1} cm");

Console.WriteLine();

// 简单计算：算出生年份
int birthYear = 2026 - age;
Console.WriteLine($"推断出生年份：{birthYear}");

// 画分隔线：new string(字符, 重复次数)
Console.WriteLine(new string('=', 30));
Console.WriteLine("卡片生成完毕");
\`\`\`

### 六、本地环境搭建（可选）

本教程沙箱已配好 .NET 8，可直接运行。本地开发推荐：

1. **安装 .NET SDK**：访问 https://dotnet.microsoft.com/download 下载 .NET 8 SDK。
2. **选编辑器**：Visual Studio 2022（Windows，功能最全）或 VS Code + C# Dev Kit（跨平台）。
3. **创建项目**：\`dotnet new console -o MyApp\` 生成控制台项目。
4. **运行**：\`cd MyApp && dotnet run\`。

### 七、小结

- 顶级语句让 C# 程序简化到一行。
- \`Console.WriteLine\` 输出换行，\`Write\` 不换行。
- \`$\` 字符串插值是日常最频繁用的特性。
- 三种注释：\`//\`、\`/* */\`、\`///\`。`,
  },

  // ============================================================
  // 第二章：变量、数据类型与字面量
  // ============================================================
  {
    id: 'csharp2-ch02',
    group: '第一部分 入门基础',
    icon: '📦',
    title: '第二章 变量、数据类型与字面量',
    content: `## 第二章　变量、数据类型与字面量

C# 是强类型语言：每个变量都有明确类型。这一章讲清所有常用类型、变量声明、字面量写法。

### 一、变量声明

\`\`\`csharp
// 1. 显式类型：明确写出类型名
int age = 25;
string name = "张三";
double price = 9.99;

// 2. var 隐式类型：编译器根据右侧推断类型 ⭐
//    var 只能在局部变量用，且声明时必须赋值
var count = 10;        // 推断为 int
var title = "C# 指南";  // 推断为 string
var pi = 3.14159;      // 推断为 double
var isActive = true;   // 推断为 bool

// 3. 多变量同时声明（同类型）
int a = 1, b = 2, c = 3;

// 4. 先声明后赋值
int x;
x = 100;
\`\`\`

> ⭐ \`var\` 日常开发最常用，代码简洁。但类型不明显时（如方法返回值），写显式类型更清晰。

### 二、整数类型

C# 整数类型按位宽和符号区分：

| 类型 | 范围 | 大小 | 用途 |
| --- | --- | --- | --- |
| \`sbyte\` | -128 ~ 127 | 1 字节 | 节省内存的小整数 |
| \`byte\` | 0 ~ 255 | 1 字节 | 字节数据 |
| \`short\` | -32768 ~ 32767 | 2 字节 | 短整数 |
| \`ushort\` | 0 ~ 65535 | 2 字节 | 无符号短整数 |
| \`int\` ⭐ | ±21 亿 | 4 字节 | **最常用整数** |
| \`uint\` | 0 ~ 42 亿 | 4 字节 | 无符号整数 |
| \`long\` | ±922 亿亿 | 8 字节 | 大整数 |
| \`ulong\` | 0 ~ 1844 亿亿 | 8 字节 | 无符号大整数 |

\`\`\`csharp
// 整数字面量
int decimalNum = 255;          // 十进制（默认）
int hex = 0xFF;                // 十六进制 = 255
int binary = 0b1111_1111;      // 二进制 = 255
long big = 9_000_000_000L;     // L 后缀表示 long，_ 是分隔符增强可读

Console.WriteLine($"十进制：{decimalNum}");
Console.WriteLine($"十六进制：{hex}");
Console.WriteLine($"二进制：{binary}");
Console.WriteLine($"大数：{big}");
\`\`\`

> ⭐ 数字分隔符 \`_\`：C# 7+ 支持，\`1_000_000\` 等于 \`1000000\`，纯粹增强可读性。

### 三、浮点类型

| 类型 | 精度 | 大小 | 用途 |
| --- | --- | --- | --- |
| \`float\` | 7 位有效数字 | 4 字节 | 图形、节省内存 |
| \`double\` ⭐ | 15-16 位 | 8 字节 | **默认浮点** |
| \`decimal\` | 28-29 位 | 16 字节 | **金额计算** ⭐ |

\`\`\`csharp
// 浮点字面量
double d = 3.14;          // 默认是 double
double sci = 1.5e3;       // 科学计数法 = 1500
float f = 3.14f;          // f 后缀表示 float
decimal price = 19.99m;   // m 后缀表示 decimal，金额必须用 decimal

Console.WriteLine($"double: {d}");
Console.WriteLine($"科学计数: {sci}");
Console.WriteLine($"float: {f}");
Console.WriteLine($"金额: {price:C}");  // :C 货币格式
\`\`\`

> ⚠️ **金额永远用 \`decimal\`，不要用 \`double\`**。\`double\` 是二进制浮点，\`0.1 + 0.2\` 不等于 \`0.3\`；\`decimal\` 是十进制浮点，金额计算精确。

\`\`\`csharp
// 浮点精度陷阱
double da = 0.1, db = 0.2;
Console.WriteLine($"double: {da + db}");  // 0.30000000000000004

decimal ma = 0.1m, mb = 0.2m;
Console.WriteLine($"decimal: {ma + mb}"); // 0.3 精确
\`\`\`

### 四、布尔与字符

\`\`\`csharp
// 布尔：只有 true / false 两个值
bool isLogin = true;
bool isEmpty = false;
Console.WriteLine($"已登录：{isLogin}，空：{isEmpty}");

// 字符 char：单引号，Unicode 字符
char letter = 'A';
char digit = '7';
char chinese = '中';
Console.WriteLine($"字符：{letter} {digit} {chinese}");
Console.WriteLine($"A 的 ASCII 码：{(int)letter}");  // 强转 int 看编码
\`\`\`

### 五、字符串 string

\`\`\`csharp
string name = "C#";
// 字符串拼接
string s1 = "Hello" + " " + name;
// 字符串插值（推荐）
string s2 = $"Hello {name}";
// 逐字字符串 @：保留格式，转义符失效
string path = @"C:\\Users\\name\\file.txt";
// 原始字符串插值 $$（C# 11+）
string json = $$"""{"name":"{{name}}"}""";

Console.WriteLine(s1);
Console.WriteLine(s2);
Console.WriteLine(path);
Console.WriteLine(json);
\`\`\`

### 六、类型转换

\`\`\`csharp
// 1. 隐式转换：小类型 → 大类型，安全
int i = 100;
double d = i;  // int → double 自动
Console.WriteLine($"隐式：{d}");

// 2. 显式转换（强转）：大类型 → 小类型，可能丢精度
double d2 = 3.99;
int i2 = (int)d2;  // 直接截断小数 = 3
Console.WriteLine($"强转：{i2}");

// 3. Parse：字符串转数字，格式错误会抛异常
int n1 = int.Parse("123");
double n2 = double.Parse("3.14");
Console.WriteLine($"Parse: {n1}, {n2}");

// 4. TryParse：安全转换，不抛异常 ⭐
if (int.TryParse("abc", out int n3)) {
    Console.WriteLine($"转换成功：{n3}");
} else {
    Console.WriteLine("abc 不是合法数字");
}

// 5. Convert 类：处理 null 更友好
string maybeNull = null;
int n4 = Convert.ToInt32(maybeNull);  // null → 0
Console.WriteLine($"Convert null: {n4}");
\`\`\`

> ⭐ \`TryParse\` 日常开发最常用——用户输入、配置文件解析都靠它，避免异常开销。

### 七、常量与只读

\`\`\`csharp
// const 编译时常量：声明时必须赋值，不能改
const double Pi = 3.14159265;
const string AppName = "我的应用";
// Pi = 3.14; // 编译错误！

Console.WriteLine($"{AppName}，π = {Pi}");

// readonly 运行时常量：在构造函数里可赋值（后续 OOP 章节详讲）
\`\`\`

### 八、小结

- \`var\` 最常用，类型明显时写显式类型。
- 整数默认 \`int\`，大数用 \`long\`。
- 浮点默认 \`double\`，**金额必须用 \`decimal\`**。
- \`TryParse\` 是安全转换的首选。
- \`const\` 是编译时常量，不可修改。`,
  },

  // ============================================================
  // 第三章：运算符详解
  // ============================================================
  {
    id: 'csharp2-ch03',
    group: '第一部分 入门基础',
    icon: '➗',
    title: '第三章 运算符详解',
    content: `## 第三章　运算符详解

运算符是代码的基本动作。这一章覆盖算术、比较、逻辑、位、赋值、条件运算符。

### 一、算术运算符

\`\`\`csharp
int a = 17, b = 5;

// 基本算术
Console.WriteLine($"{a} + {b} = {a + b}");   // 22 加
Console.WriteLine($"{a} - {b} = {a - b}");   // 12 减
Console.WriteLine($"{a} * {b} = {a * b}");   // 85 乘
Console.WriteLine($"{a} / {b} = {a / b}");   // 3   整数除法截断
Console.WriteLine($"{a} % {b} = {a % b}");   // 2   取余

// 整数除法想得小数：至少一个操作数是浮点
Console.WriteLine($"{a} / {b} = {(double)a / b}"); // 3.4

// 自增自减
int c = 10;
c++;  // 等同 c = c + 1
Console.WriteLine($"自增后：{c}");  // 11
c--;  // 等同 c = c - 1
Console.WriteLine($"自减后：{c}");  // 10

// 前缀 vs 后缀
int x = 5;
int y = x++;  // 后缀：先赋值再自增，y=5, x=6
int z = ++x;  // 前缀：先自增再赋值，x=7, z=7
Console.WriteLine($"x={x}, y={y}, z={z}");
\`\`\`

> ⚠️ **整数除法**：两个整数相除结果还是整数（截断小数），想得小数要强转 \`double\`。

### 二、复合赋值运算符

\`\`\`csharp
int n = 100;
n += 5;   // n = n + 5 = 105
n -= 10;  // n = n - 10 = 95
n *= 2;   // n = n * 2 = 190
n /= 3;   // n = n / 3 = 63（整数除法）
n %= 10;  // n = n % 10 = 3
Console.WriteLine($"结果：{n}");

// 字符串也支持 +=
string s = "Hello";
s += " World";
Console.WriteLine(s);  // Hello World
\`\`\`

### 三、比较运算符

\`\`\`csharp
int a = 10, b = 20;

Console.WriteLine($"a == b : {a == b}");  // False 等于
Console.WriteLine($"a != b : {a != b}");  // True  不等
Console.WriteLine($"a < b  : {a < b}");   // True  小于
Console.WriteLine($"a > b  : {a > b}");   // False 大于
Console.WriteLine($"a <= b : {a <= b}");  // True  小于等于
Console.WriteLine($"a >= b : {a >= b}");  // False 大于等于

// 字符串比较：用 == 比较内容（不是地址）
string s1 = "abc", s2 = "abc";
Console.WriteLine($"s1 == s2 : {s1 == s2}");  // True
\`\`\`

### 四、逻辑运算符 ⭐

\`\`\`csharp
bool isVip = true;
bool hasCoupon = false;
int points = 500;

// && 与：两边都 true 才 true
bool canDiscount = isVip && points > 100;
Console.WriteLine($"能否打折：{canDiscount}");  // True

// || 或：一边 true 就 true
bool canGetGift = isVip || hasCoupon;
Console.WriteLine($"能否领礼：{canGetGift}");  // True

// ! 非：取反
Console.WriteLine($"非 Vip：{!isVip}");  // False

// 短路求值：&& 左边 false 不算右边，|| 左边 true 不算右边
// 这点很重要：避免空引用异常
string name = null;
// name != null && name.Length > 0：第一个 false 直接跳过，不会抛异常
bool hasName = name != null && name.Length > 0;
Console.WriteLine($"有名字：{hasName}");  // False
\`\`\`

> ⭐ **短路求值**是日常开发关键技巧：先判空再访问属性，\`obj != null && obj.X > 0\`。

### 五、条件运算符（三元）⭐

\`\`\`csharp
// 条件 ? 真值 : 假值
int age = 20;
string status = age >= 18 ? "成年" : "未成年";
Console.WriteLine($"状态：{status}");  // 成年

// 嵌套三元（可读性差，慎用）
int score = 85;
string grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 60 ? "C" : "D";
Console.WriteLine($"等级：{grade}");  // B

// ?? 空合并运算符：左边 null 用右边 ⭐
string name = null;
string display = name ?? "匿名";
Console.WriteLine($"显示名：{display}");  // 匿名

// ??= 空合并赋值：左边 null 才赋值（C# 8+）
string text = null;
text ??= "默认值";
Console.WriteLine($"text：{text}");  // 默认值
\`\`\`

> ⭐ \`??\` 和 \`??=\` 处理 null 的神器，日常高频。

### 六、位运算符

\`\`\`csharp
int a = 0b1100;  // 12
int b = 0b1010;  // 10

Console.WriteLine($"a & b = {a & b}");   // 8   按位与
Console.WriteLine($"a | b = {a | b}");   // 14  按位或
Console.WriteLine($"a ^ b = {a ^ b}");   // 6   按位异或
Console.WriteLine($"~a = {~a}");         // -13 按位取反
Console.WriteLine($"a << 2 = {a << 2}"); // 48  左移 2 位
Console.WriteLine($"a >> 2 = {a >> 2}"); // 3   右移 2 位
\`\`\`

> 位运算日常少用，主要在权限位标记、加密、图形处理场景。

### 七、实战 demo：成绩判定

\`\`\`csharp
// 综合运用运算符
int score = 76;
bool isAttendanceOk = true;

// 出勤 + 成绩双重判定
string result = (score >= 60 && isAttendanceOk) ? "通过" : "不通过";
Console.WriteLine($"成绩 {score}，出勤正常 → {result}");

// 等级判定
string grade = score >= 90 ? "优秀" :
               score >= 80 ? "良好" :
               score >= 70 ? "中等" :
               score >= 60 ? "及格" : "不及格";
Console.WriteLine($"等级：{grade}");

// 奖学金判定（前 10% 且出勤正常）
int rank = 8;  // 班级第 8 名
bool canGetScholarship = rank <= 10 && isAttendanceOk && score >= 60;
Console.WriteLine($"能否拿奖学金：{canGetScholarship}");
\`\`\`

### 八、小结

- 算术：注意整数除法截断、前缀后缀自增区别。
- 逻辑：\`&&\` \`||\` 短路求值，先判空再访问属性。
- 三元 \`? :\` 替代简单 if-else。
- \`??\` \`??=\` 处理 null 神器。
- 位运算用于权限、加密场景。`,
  },

  // ============================================================
  // 第四章：字符串与字符详解
  // ============================================================
  {
    id: 'csharp2-ch04',
    group: '第一部分 入门基础',
    icon: '🔤',
    title: '第四章 字符串与字符详解',
    content: `## 第四章　字符串与字符详解

字符串是日常开发最频繁处理的数据类型。这一章讲透 string 的所有常用操作。

### 一、字符串基础

\`\`\`csharp
// string 是引用类型，但不可变（immutable）
// 每次修改实际是创建新字符串
string s = "Hello";
// s[0] = 'h'; // 错误！字符串不可变

// 访问字符：用索引
Console.WriteLine($"首字符：{s[0]}");  // H
Console.WriteLine($"长度：{s.Length}"); // 5

// 遍历字符
foreach (char c in s) {
    Console.Write(c + " ");
}
Console.WriteLine();
\`\`\`

### 二、字符串拼接

\`\`\`csharp
string name = "张三";
int age = 25;

// 1. + 拼接（简单场景）
string s1 = "姓名：" + name + "，年龄：" + age;

// 2. 字符串插值 $（推荐 ⭐）
string s2 = $"姓名：{name}，年龄：{age}";

// 3. string.Concat（多个参数）
string s3 = string.Concat("A", "B", "C");

// 4. string.Join（用分隔符拼接数组）
string[] parts = { "2026", "07", "18" };
string date = string.Join("-", parts);  // 2026-07-18

Console.WriteLine(s1);
Console.WriteLine(s2);
Console.WriteLine(s3);
Console.WriteLine(date);
\`\`\`

> ⭐ 日常首选 \`$\` 插值，可读性最好。拼接数组用 \`string.Join\`。

### 三、字符串比较

\`\`\`csharp
string a = "Hello";
string b = "hello";

// == 比较内容（区分大小写）
Console.WriteLine($"a == b : {a == b}");  // False

// Equals 比较内容
Console.WriteLine($"a.Equals(b) : {a.Equals(b)}");  // False

// 忽略大小写比较
Console.WriteLine($"忽略大小写：{string.Equals(a, b, StringComparison.OrdinalIgnoreCase)}");  // True

// Compare 返回 -1/0/1
int cmp = string.Compare(a, b, StringComparison.OrdinalIgnoreCase);
Console.WriteLine($"Compare 结果：{cmp}");  // 0 表示相等

// 比较时务必指定 StringComparison，避免文化差异问题 ⭐
\`\`\`

> ⭐ 比较**永远显式指定** \`StringComparison\`：\`OrdinalIgnoreCase\` 忽略大小写，\`Ordinal\` 区分大小写。默认比较受系统文化影响，可能出 bug。

### 四、查找与判断

\`\`\`csharp
string s = "Hello, C# World";

// Contains 包含
Console.WriteLine($"包含 C#：{s.Contains("C#")}");  // True

// StartsWith / EndsWith
Console.WriteLine($"以 Hello 开头：{s.StartsWith("Hello")}");  // True
Console.WriteLine($"以 World 结尾：{s.EndsWith("World")}");    // True

// IndexOf 找位置（找不到返回 -1）
int idx = s.IndexOf("C#");
Console.WriteLine($"C# 位置：{idx}");  // 7

// LastIndexOf 从后找
int last = s.LastIndexOf("o");
Console.WriteLine($"最后一个 o：{last}");

// 判断空
string empty = "";
string blank = "   ";
Console.WriteLine($"empty 空：{string.IsNullOrEmpty(empty)}");      // True
Console.WriteLine($"blank 空白：{string.IsNullOrWhiteSpace(blank)}"); // True ⭐
\`\`\`

> ⭐ \`IsNullOrEmpty\` 和 \`IsNullOrWhiteSpace\` 判空最常用——\`IsNullOrWhiteSpace\` 还能处理纯空格字符串。

### 五、截取与分割

\`\`\`csharp
string s = "Hello, C# World";

// Substring 截取
string sub1 = s.Substring(7);      // 从索引 7 到结尾：C# World
string sub2 = s.Substring(7, 2);   // 从索引 7 取 2 个字符：C#
Console.WriteLine($"sub1: {sub1}");
Console.WriteLine($"sub2: {sub2}");

// Split 分割
string csv = "张三,25,深圳,程序员";
string[] fields = csv.Split(',');
foreach (var f in fields) {
    Console.WriteLine($"- {f}");
}

// 多分隔符分割
string mixed = "a,b;c|d";
string[] parts = mixed.Split(',', ';', '|');
Console.WriteLine($"分割结果：{string.Join(" ", parts)}");  // a b c d
\`\`\`

### 六、替换与去空白

\`\`\`csharp
string s = "  Hello World  ";

// Trim 去两端空白
Console.WriteLine($"Trim: '{s.Trim()}'");

// TrimStart / TrimEnd 去单边
Console.WriteLine($"TrimStart: '{s.TrimStart()}'");

// Replace 替换
string r = s.Replace("World", "C#");
Console.WriteLine($"Replace: {r.Trim()}");

// 移除字符
string cleaned = "1,2,3".Replace(",", "");
Console.WriteLine($"去逗号：{cleaned}");  // 123
\`\`\`

### 七、大小写转换

\`\`\`csharp
string s = "Hello World";

Console.WriteLine($"大写：{s.ToUpper()}");  // HELLO WORLD
Console.WriteLine($"小写：{s.ToLower()}");  // hello world

// 注意：大小写转换受文化影响，建议传 InvariantCulture
string upper = s.ToUpperInvariant();
Console.WriteLine($"不变文化大写：{upper}");
\`\`\`

### 八、StringBuilder 高效拼接 ⭐

\`string\` 不可变，循环拼接会创建大量临时字符串，性能差。\`StringBuilder\` 解决：

\`\`\`csharp
using System.Text;

// ❌ 错误：循环用 + 拼接，每次创建新字符串
// string result = "";
// for (int i = 0; i < 1000; i++) {
//     result += i.ToString();  // 每次都复制整个字符串
// }

// ✅ 正确：用 StringBuilder
var sb = new StringBuilder();
for (int i = 1; i <= 5; i++) {
    sb.Append($"第{i}行\\n");
}
string result = sb.ToString();
Console.WriteLine(result);

// StringBuilder 常用方法
var sb2 = new StringBuilder();
sb2.Append("Hello");
sb2.AppendLine();          // 追加换行
sb2.AppendLine("World");   // 追加一行
sb2.AppendFormat("数字：{0:F2}", 3.14159);  // 格式化追加
Console.WriteLine(sb2.ToString());
\`\`\`

> ⭐ **循环拼接字符串必用 \`StringBuilder\`**，性能差几十倍。一次性拼接用 \`$\` 即可。

### 九、格式化

\`\`\`csharp
// 数字格式化
double pi = 3.14159265;
int money = 1234567;

Console.WriteLine($"保留2位：{pi:F2}");           // 3.14
Console.WriteLine($"百分比：{0.75:P0}");          // 75%
Console.WriteLine($"千分位：{money:N0}");         // 1,234,567
Console.WriteLine($"货币：{money:C}");            // ¥1,234,567.00
Console.WriteLine($"十六进制：{255:X}");          // FF

// 日期格式化（后续章节详讲）
DateTime now = DateTime.Now;
Console.WriteLine($"日期：{now:yyyy-MM-dd}");
Console.WriteLine($"时间：{now:HH:mm:ss}");

// 对齐：{expr,宽度} 正数右对齐，负数左对齐
Console.WriteLine($"{"姓名",-10}|{"年龄",5}");
Console.WriteLine($"{"张三",-10}|{25,5}");
Console.WriteLine($"{"李四",-10}|{30,5}");
\`\`\`

### 十、实战 demo：简易模板引擎

\`\`\`csharp
// 综合运用字符串操作：模板替换
string template = "你好 {name}，欢迎来到 {city}。你的订单 {orderId} 已确认。";

// 模拟数据
var data = new Dictionary<string, string> {
    ["name"] = "张三",
    ["city"] = "深圳",
    ["orderId"] = "ORD20260718001"
};

// 简单模板替换
string result = template;
foreach (var kv in data) {
    result = result.Replace("{" + kv.Key + "}", kv.Value);
}
Console.WriteLine(result);

// 输出：你好 张三，欢迎来到 深圳。你的订单 ORD20260718001 已确认。
\`\`\`

### 十一、小结

- \`string\` 不可变，修改即创建新对象。
- 拼接首选 \`$\`，循环拼接用 \`StringBuilder\`。
- 比较显式指定 \`StringComparison\`。
- 判空用 \`IsNullOrEmpty\` / \`IsNullOrWhiteSpace\`。
- 格式化：\`F2\` 两位小数、\`N0\` 千分位、\`C\` 货币、\`X\` 十六进制。`,
  },

  // ============================================================
  // 第五章：控制台输入输出与格式化
  // ============================================================
  {
    id: 'csharp2-ch05',
    group: '第一部分 入门基础',
    icon: '⌨️',
    title: '第五章 控制台输入输出与格式化',
    content: `## 第五章　控制台输入输出与格式化

这一章讲透控制台交互、格式化输出、特殊字符转义。命令行工具、学习调试都用得到。

### 一、输出方法

\`\`\`csharp
// WriteLine 输出换行
Console.WriteLine("第一行");
Console.WriteLine("第二行");

// Write 输出不换行
Console.Write("A");
Console.Write("B");
Console.Write("C");
Console.WriteLine();  // 单独 WriteLine() 只输出换行

// 输出空行
Console.WriteLine();
\`\`\`

### 二、转义字符

字符串里特殊字符用反斜杠 \`\\\` 转义：

| 转义 | 含义 | 转义 | 含义 |
| --- | --- | --- | --- |
| \`\\\\n\` | 换行 | \`\\\\t\` | 制表符 |
| \`\\\\r\` | 回车 | \`\\\\\\\\\` | 反斜杠 |
| \`\\\\"\` | 双引号 | \`\\\\'\` | 单引号 |
| \`\\\\0\` | 空字符 | \`\\\\uXXXX\` | Unicode 字符 |

\`\`\`csharp
Console.WriteLine("第一行\\n第二行");
Console.WriteLine("列1\\t列2\\t列3");
Console.WriteLine("路径：C:\\\\Users\\\\name");
Console.WriteLine("他说:\\"你好\\"");

// 用 @ 逐字字符串：转义失效，原样输出
string path = @"C:\\Users\\name\\file.txt";
Console.WriteLine(path);  // C:\\Users\\name\\file.txt

// @ 还能保留多行格式
string json = @"{
  ""name"": ""张三"",
  ""age"": 25
}";
Console.WriteLine(json);
\`\`\`

> ⭐ 文件路径、正则表达式用 \`@\` 逐字字符串，避免反斜杠地狱。注意 \`@\` 里双引号要写两个 \`""\`。

### 三、格式化输出

\`\`\`csharp
// 1. 字符串插值 $（推荐 ⭐）
string name = "张三";
int age = 25;
Console.WriteLine($"姓名：{name}，年龄：{age}");

// 2. string.Format（旧写法，了解即可）
string s = string.Format("姓名：{0}，年龄：{1}", name, age);
Console.WriteLine(s);

// 3. Console.WriteLine 直接格式化
Console.WriteLine("姓名：{0}，年龄：{1}", name, age);
\`\`\`

### 四、数字格式化

\`\`\`csharp
double pi = 3.14159265;
long money = 1234567890;
double ratio = 0.8523;

// 固定小数位 F
Console.WriteLine($"F2: {pi:F2}");       // 3.14
Console.WriteLine($"F4: {pi:F4}");       // 3.1416

// 千分位 N
Console.WriteLine($"N0: {money:N0}");    // 1,234,567,890
Console.WriteLine($"N2: {money:N2}");    // 1,234,567,890.00

// 百分比 P
Console.WriteLine($"P0: {ratio:P0}");    // 85%
Console.WriteLine($"P2: {ratio:P2}");    // 85.23%

// 货币 C
Console.WriteLine($"C: {money:C}");      // ¥1,234,567,890.00

// 科学计数 E
Console.WriteLine($"E2: {money:E2}");    // 1.23E+009

// 十六进制 X
Console.WriteLine($"X: {255:X}");        // FF
Console.WriteLine($"X4: {255:X4}");      // 00FF

// 自定义格式
Console.WriteLine($"#: {1234.5:#,##0.00}");  // 1,234.50
\`\`\`

### 五、对齐与表格输出

\`\`\`csharp
// {expr,宽度}：正数右对齐，负数左对齐
Console.WriteLine($"{"姓名",-10}|{"年龄",5}|{"城市",-8}");
Console.WriteLine(new string('-', 26));
Console.WriteLine($"{"张三",-10}|{25,5}|{"深圳",-8}");
Console.WriteLine($"{"李四",-10}|{30,5}|{"北京",-8}");
Console.WriteLine($"{"王五",-10}|{28,5}|{"上海",-8}");

// 输出：
// 姓名      |  年龄|城市
// --------------------------
// 张三      |   25|深圳
// 李四      |   30|北京
// 王五      |   28|上海
\`\`\`

### 六、读取输入

\`\`\`csharp
// ReadLine 读取一行输入（返回字符串）
// 沙箱环境对交互输入支持有限，语法正确，本地可用
Console.Write("请输入名字：");
// string name = Console.ReadLine();
// Console.WriteLine($"你好，{name}！");

// ReadKey 读取单个按键
// ConsoleKey key = Console.ReadKey(true).Key;  // true 不显示按键

// Read 读取单个字符的 ASCII 码
// int ch = Console.Read();
\`\`\`

### 七、类型转换输入

用户输入都是字符串，需要转换：

\`\`\`csharp
// 模拟用户输入
string input = "25";

// TryParse 安全转换 ⭐
if (int.TryParse(input, out int age)) {
    Console.WriteLine($"年龄：{age}，明年 {age + 1} 岁");
} else {
    Console.WriteLine("输入不是合法数字");
}

// 模拟输入非法值
string bad = "abc";
if (int.TryParse(bad, out _)) {  // out _ 丢弃返回值
    Console.WriteLine("转换成功");
} else {
    Console.WriteLine($"'{bad}' 不是数字");
}
\`\`\`

### 八、颜色输出

\`\`\`csharp
// Console.ForegroundColor 设置文字颜色
Console.ForegroundColor = ConsoleColor.Green;
Console.WriteLine("成功：操作完成");

Console.ForegroundColor = ConsoleColor.Red;
Console.WriteLine("错误：文件不存在");

Console.ForegroundColor = ConsoleColor.Yellow;
Console.WriteLine("警告：磁盘空间不足");

// 重置颜色
Console.ResetColor();
Console.WriteLine("恢复正常颜色");
\`\`\`

### 九、实战 demo：账单打印

\`\`\`csharp
// 综合运用：格式化、对齐、颜色
var items = new[] {
    ("苹果", 3, 5.5),
    ("香蕉", 5, 3.2),
    ("牛奶", 2, 12.8),
    ("面包", 1, 8.0),
};

Console.ForegroundColor = ConsoleColor.Cyan;
Console.WriteLine("====== 购物账单 ======");
Console.ResetColor();

Console.WriteLine($"{"商品",-8}|{"数量",4}|{"单价",8}|{"小计",8}");
Console.WriteLine(new string('-', 32));

double total = 0;
foreach (var (name, qty, price) in items) {
    double sub = qty * price;
    total += sub;
    Console.WriteLine($"{name,-8}|{qty,4}|{price,8:F2}|{sub,8:F2}");
}

Console.WriteLine(new string('-', 32));
Console.ForegroundColor = ConsoleColor.Yellow;
Console.WriteLine($"{"合计",-8}|{"",4}|{"",8}|{total,8:F2}");
Console.ResetColor();
\`\`\`

### 十、小结

- \`WriteLine\` 换行，\`Write\` 不换行。
- \`@\` 逐字字符串：路径、正则、多行文本必备。
- 数字格式化：\`F\` 小数位、\`N\` 千分位、\`P\` 百分比、\`C\` 货币、\`X\` 十六进制。
- 对齐：\`{expr,宽度}\` 正右负左。
- 输入转换用 \`TryParse\`，别用 \`Parse\`（会抛异常）。`,
  },
];

export { chapters };
