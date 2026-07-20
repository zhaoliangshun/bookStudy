// =============================================================
// C# 从入门到精通大全（全新版）—— 第1批章节
// 开篇 + 第一部分 入门基础（共 6 章）
// -------------------------------------------------------------
// 本批包含 6 章：
//   csharp4-preface : 前言
//   csharp4-ch01    : 第一章 .NET 与 C# 总览
//   csharp4-ch02    : 第二章 开发环境搭建
//   csharp4-ch03    : 第三章 第一个 C# 程序
//   csharp4-ch04    : 第四章 顶级语句与程序结构
//   csharp4-ch05    : 第五章 控制台输入输出
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 前言
  // ============================================================
  {
    id: 'csharp4-preface',
    group: '开篇',
    icon: '📖',
    title: '前言',
    content: `## 前言

### 一、本书定位

这是一本**大而全、循序渐进、工程导向**的 C# 教程书。本书不追求学术严谨到令人昏睡，也不屑于"5 分钟入门"的标题党，目标是让你读完之后真正能写出生产级 C# 代码。

市面上 C# 教程不少，但常见两类问题：要么是"教科书风"——讲一堆概念却不会用；要么是"碎片化风"——教你写 Hello World 然后直接跳到 ASP.NET Core。本书试图在这两者之间找到平衡：**每一章都从一个具体问题出发，给出可运行代码，再讲清楚背后的原理**。

全书共 70 章，覆盖日常开发 100% 高频知识点：

| 模块 | 章节 | 主题 |
| --- | --- | --- |
| 入门基础 | 1-5 | 总览、环境、第一个程序、顶级语句、控制台 IO |
| 核心语法 上 | 6-11 | 变量常量、内置类型、值/引用类型、运算符、字符串、格式化 |
| 核心语法 下 | 12-17 | 控制流、循环、跳转、数组、方法、参数进阶 |
| 面向对象 | 18-30 | 类、字段属性、构造、继承、多态、接口、record、struct |
| 泛型与集合 | 31-40 | 泛型、List、Dictionary、HashSet、栈队列、迭代器、元组 |
| 委托与 LINQ | 41-50 | 委托、事件、Lambda、LINQ、表达式树、函数式 |
| 异步与并发 | 51-58 | async/await、Task、并行、Channel、取消、限流 |
| 高级特性 | 59-65 | 反射、特性、源生成器、Span、不安全代码、互操作 |
| 工程实践 | 66-70 | 测试、日志、配置、诊断、发布部署 |

### 二、目标读者

本书适合以下人群，**不需要任何 C# 基础**：

- **完全零基础**：从没写过代码，想从 C# 开始编程之路。
- **跨语言学习者**：会 Java / Python / JavaScript / Go，想快速上手 .NET 生态。
- **基础补齐者**：写过几年 C# 但知识有断层，想系统梳理。
- **进阶工程师**：想掌握 C# 12 新特性、.NET 8 工程实践、性能优化技巧。

如果你完全不会编程，本书会从"什么是变量"讲起；如果你已经会其他语言，可以跳过前 5 章直接从第六章开始。

### 三、版本约定

本书基于以下版本编写，所有代码均经过实际验证：

- **.NET SDK**：8.0.x LTS（长期支持版，支持到 2026 年 11 月）
- **C# 语言版本**：12.0
- **运行时**：.NET 8 CLR
- **目标框架**：\`net8.0\`

C# 12 带来了不少重要特性，本书会在相关章节详细讲解：

- **主构造函数**（primary constructors）：类/结构体直接在声明处接收参数。
- **集合表达式**（collection expressions）：\`int[] arr = [1, 2, 3];\` 一行初始化。
- **内插字符串增强**：多行插值、复杂表达式更清晰。
- **\`ref readonly\` 参数**：性能与安全的折中。
- **\`required\` 成员**：强制对象初始化时必须赋值。

### 四、如何使用本教程

本教程在网页中提供**在线运行**沙箱，每章代码都可以直接点击"运行"按钮查看结果，无需本地安装环境。

**学习节奏建议**：

1. **先读文字**：理解本章要解决的问题和核心概念。
2. **再读代码**：逐行看注释，理解每一行在做什么。
3. **运行代码**：点击运行按钮，观察输出。
4. **修改代码**：尝试改一两个值或加几行，看输出变化。
5. **做小练习**：每章末尾会给出练习题，自己动手写一遍。

**阅读顺序建议**：

- **新手**：严格按章节顺序读，不要跳。
- **有经验者**：快速过前 5 章，从第六章开始细读。
- **查漏补缺**：直接跳到目标章节，每章相对独立。

### 五、阅读约定

本书使用以下排版约定：

- **粗体**：强调重要概念或术语首次出现。
- \`等宽字体\`：代码、关键字、标识符。
- > 💡 **提示**：补充说明或小技巧。
- > ⚠️ **注意**：常见坑或易错点。
- > 🔥 **进阶**：进阶内容，新手可跳过。

代码示例统一使用**顶级语句**写法（C# 9+），不写 \`class Program\` / \`static void Main\`。这意味着你看到的代码是这样：

\`\`\`csharp
var name = "C#";
Console.WriteLine($"Hello, {name}!");
\`\`\`

而不是这样：

\`\`\`csharp
using System;

namespace MyApp
{
    class Program
    {
        static void Main(string[] args)
        {
            var name = "C#";
            Console.WriteLine($"Hello, {name}!");
        }
    }
}
\`\`\`

两种写法等价，但顶级语句更简洁、更现代，本书一律采用顶级语句。

### 六、配套资源

- **在线沙箱**：本教程网页内嵌代码运行环境，无需本地配置。
- **本地运行**：安装 .NET SDK 后，每章代码都可以保存为 \`.cs\` 文件或放入控制台项目运行。
- **官方文档**：[learn.microsoft.com/dotnet](https://learn.microsoft.com/dotnet) 是权威参考。

### 七、致读者

学编程没有捷径，但有方法。**理解一行代码胜过抄十行代码，写一行自己的代码胜过看一百行别人的代码**。本书会陪你走完 C# 从入门到精通的全部旅程，准备好了吗？让我们开始吧。`,
    code: `// ===========================================================
// 第〇章 前言 —— 入门示例
// 演示：顶级语句、变量声明、Console 输出、注释风格
// 适用：.NET 8 / C# 12 控制台应用
// ===========================================================

// 1) 顶级语句：直接写语句，无需 class Program / Main 方法
//    C# 9+ 引入，整个文件只需要直接写执行代码即可。

// 2) 声明几个变量，演示 C# 的类型推断
var language = "C#";          // var 让编译器推断类型，这里推断为 string
var version = 12;             // 推断为 int
var framework = ".NET 8";     // 推断为 string
var releaseYear = 2023;       // 推断为 int（.NET 8 发布于 2023 年 11 月）

// 3) 简单输出：Console.WriteLine 会在末尾自动换行
Console.WriteLine("===== 欢迎来到 C# 教程 =====");

// 4) 字符串插值：$ 前缀 + {变量名} 即可把变量嵌入字符串
Console.WriteLine($"语言：{language} {version}");
Console.WriteLine($"框架：{framework}，发布年份：{releaseYear}");

// 5) 多变量一起声明：同类型可以一行声明多个（不强制推荐，但要知道）
int a = 1, b = 2, c = 3;
Console.WriteLine($"a + b + c = {a + b + c}");

// 6) 简单运算与输出
int sum = a + b + c;
double avg = sum / 3.0;       // 注意：3.0 让结果是 double，否则整数除法会丢精度
Console.WriteLine($"平均值：{avg:F2}");   // :F2 保留两位小数

// 7) 用 const 声明编译期常量
const double Pi = 3.14159265;
Console.WriteLine($"圆周率 Pi ≈ {Pi}");

// 8) 简单条件判断演示
bool isLearning = true;
if (isLearning)
{
    Console.WriteLine("你正在学习 C#，加油！");
}
else
{
    Console.WriteLine("赶紧开始学习吧！");
}

// 9) 简单循环演示：倒序输出 5 到 1
Console.WriteLine("倒序输出 5 到 1：");
for (int i = 5; i >= 1; i--)
{
    Console.Write($"{i} ");   // Write 不换行
}
Console.WriteLine();          // 手动换行

// 10) 调用下面定义的方法（顶级语句中方法写在最后）
Greet("读者");

// 11) 程序正常结束，输出告别语
Console.WriteLine("===== 示例结束 =====");

// ---------- 方法定义区 ----------
// 顶级语句文件中，方法定义要放在所有执行语句之后
void Greet(string name)
{
    // 在方法内部使用插值字符串
    Console.WriteLine($"你好，{name}！愿这本教程陪你走完 C# 之旅。");
}`,
    lang: 'cs',
  },

  // ============================================================
  // 第一章 .NET 与 C# 总览
  // ============================================================
  {
    id: 'csharp4-ch01',
    group: '第一部分 入门基础',
    icon: '🌐',
    title: '.NET 与 C# 总览',
    content: `## 第一章 .NET 与 C# 总览

### 一、.NET 是什么

.NET 是微软开发的**跨平台、开源、通用开发平台**。它包含三样东西：

1. **运行时**（Runtime）：负责执行你的代码、管理内存、提供基础服务。
2. **SDK**（Software Development Kit）：包含编译器、CLI 工具、运行时，用于开发 .NET 应用。
3. **类库**（Base Class Library, BCL）：提供数以万计的现成 API，从文件 IO 到网络通信到 JSON 解析全覆盖。

从 .NET 5 开始，微软把原来的 .NET Framework（仅 Windows）、.NET Core（跨平台）、Xamarin（移动端）合并成**统一的 .NET**，每年 11 月发布一个版本，偶数版本为 LTS（长期支持，3 年）。

当前主流版本：

- **.NET 8**：LTS，2023 年 11 月发布，支持到 2026 年 11 月。
- **.NET 9**：STS（标准支持，18 个月），2024 年 11 月发布。
- **.NET 10**：下一个 LTS，2025 年 11 月发布。

本书基于 .NET 8 LTS 编写。

### 二、CLR、JIT、BCL、CLS 是什么

打开 .NET 文档你会反复看到这些缩写，先一次性讲清楚：

**CLR（Common Language Runtime，公共语言运行时）**

.NET 的"虚拟机"。你的 C# 代码编译后不是机器码，而是 IL（中间语言），CLR 在运行时把 IL 翻译成机器码执行。CLR 还负责：

- 内存管理（自动垃圾回收 GC）
- 类型安全检查
- 异常处理
- 线程管理

**JIT（Just-In-Time Compiler，即时编译器）**

CLR 内部的翻译官。它把 IL 在"运行的那一刻"翻译成本机机器码，并缓存下来重复利用。JIT 的好处是能在运行时根据实际 CPU 优化代码，缺点是首次运行有"启动开销"。

**BCL（Base Class Library，基础类库）**

.NET 自带的"标准库"。\`System.IO.File\`、\`System.Net.Http.HttpClient\`、\`System.Text.Json\` 这些都属 BCL。写 C# 90% 的工作就是组合 BCL 里的 API。

**CLS（Common Language Specification，公共语言规范）**

一套语言间互操作约定。F#、VB.NET、IronPython 都能编译成 IL 跑在 CLR 上，CLS 保证不同语言写的库能互相调用。比如 F# 库导出的类型只要符合 CLS，C# 就能直接用。

### 三、C# 和 .NET 的关系

很多人混淆 C# 和 .NET，其实两者是"语言"和"平台"的关系：

- **C# 是编程语言**：定义语法、关键字、类型系统。
- **.NET 是运行平台**：定义运行时、类库、跨语言互操作。

打个比方：C# 是"中文"，.NET 是"中国"。中文是在中国境内最常用的语言，但中国境内也流通英文、法文（F#、VB.NET）；同样，中文也可以在中国境外使用（C# 编译成 IL 跑在 CLR 上，不限于 .NET，也有 Blazor WASM、NativeAOT 等场景）。

代码执行流程：C# 源代码 → C# 编译器（Roslyn）→ IL 程序集（.dll/.exe）→ CLR 加载 → JIT 翻译 → 机器码执行。

### 四、C# 版本演进（重点 8-12）

| 版本 | 年份 | 重要特性 |
| --- | --- | --- |
| C# 1.0 | 2002 | 语言诞生，与 .NET Framework 1.0 同步 |
| C# 2.0 | 2005 | 泛型、可空类型、迭代器 |
| C# 3.0 | 2007 | LINQ、Lambda、自动属性、扩展方法 |
| C# 4.0 | 2010 | dynamic、命名参数、协变逆变 |
| C# 5.0 | 2012 | async/await、调用方信息 |
| C# 6.0 | 2015 | 字符串插值、null 条件运算符、表达式体成员 |
| C# 7.0-7.3 | 2017-2018 | 元组、模式匹配、本地函数、ref readonly |
| C# 8.0 | 2019 | 可空引用类型、异步流、switch 表达式、索引/切片 |
| C# 9.0 | 2020 | 顶级语句、record、init only、目标类型 new |
| C# 10.0 | 2021 | global using、文件作用域命名空间、record struct |
| C# 11.0 | 2022 | 列表模式、原始字符串字面量、required 成员 |
| C# 12.0 | 2023 | 主构造函数、集合表达式、内插字符串增强、ref readonly 参数 |

本书重点使用 C# 8-12 的现代语法，因为这是当前生产环境的主流。

### 五、跨平台支持

.NET 8 官方支持以下平台：

- **Windows**：Windows 10/11、Windows Server 2016+
- **macOS**：macOS 11 Big Sur 及以上
- **Linux**：Ubuntu、Debian、CentOS、Alpine、RHEL 等主流发行版

CPU 架构：x64、x86、ARM32、ARM64。

你的同一个 .NET 8 程序，编译一次后可以跑在 Windows 笔记本、Mac 台式机、Linux 服务器、树莓派上，无需改代码。

### 六、运行时 vs 编译时

理解这两个概念对调试和性能优化至关重要：

- **编译时**（Compile-time）：C# 源码 → IL。这一阶段由 Roslyn 编译器完成，检查语法错误、类型错误。
- **运行时**（Runtime）：IL → 机器码 → 执行。这一阶段由 CLR 完成，包括 JIT 编译、GC、异常抛出。

有些错误编译时就能发现（比如 \`int x = "abc";\` 类型不匹配），有些只能运行时发现（比如数组越界、空引用）。C# 8 引入的可空引用类型把一部分原本运行时才报错的 \`NullReferenceException\` 提前到编译时检查。

### 七、AOT vs JIT

.NET 8 提供两种编译模式：

**JIT（默认）**：编译成 IL，运行时由 JIT 翻译成机器码。

- 优点：跨平台、启动后性能优秀、能根据运行时信息优化。
- 缺点：首次启动有 JIT 开销，需要运行时环境。
- 场景：Web 服务、桌面应用、长期运行的服务。

**AOT（Ahead-Of-Time，原生 AOT）**：编译时直接生成本机机器码，输出单个可执行文件。

- 优点：启动极快、内存占用低、无需 .NET 运行时。
- 缺点：不支持反射的某些场景、二进制体积较大、跨平台需分别编译。
- 场景：CLI 工具、云函数、嵌入式、微服务冷启动敏感场景。

本书代码默认使用 JIT 模式（沙箱环境），第 70 章会专门讲 AOT 发布。

下面 demo 演示如何在代码中获取 .NET 运行时、操作系统等环境信息。`,
    code: `// ===========================================================
// 第一章 .NET 与 C# 总览
// 演示：环境信息获取、版本检测、跨平台判断
// 适用：.NET 8 / C# 12
// ===========================================================

using System;                          // 引入 System 命名空间
using System.Runtime.InteropServices;  // 引入运行时互操作命名空间

// 1) 输出当前 .NET 运行时版本
//    Environment.Version 返回 CLR 的主版本号
Console.WriteLine("===== .NET 运行时信息 =====");
Console.WriteLine($"CLR 版本：{Environment.Version}");
//    .NET 8 的 Environment.Version 通常是 8.0.x

// 2) 输出更完整的框架描述字符串
//    RuntimeInformation.FrameworkDescription 包含完整信息
Console.WriteLine($"框架描述：{RuntimeInformation.FrameworkDescription}");

// 3) 输出操作系统信息
Console.WriteLine($"操作系统：{RuntimeInformation.OSDescription}");
Console.WriteLine($"OS 架构：{RuntimeInformation.OSArchitecture}");
Console.WriteLine($"进程架构：{RuntimeInformation.ProcessArchitecture}");

// 4) 跨平台判断：使用 OperatingSystem 静态类（.NET 5+）
//    这些方法在编译器和运行时都会做适配，避免直接判断字符串
if (OperatingSystem.IsWindows())
{
    Console.WriteLine("当前运行在 Windows 上");
}
else if (OperatingSystem.IsMacOS())
{
    Console.WriteLine("当前运行在 macOS 上");
}
else if (OperatingSystem.IsLinux())
{
    Console.WriteLine("当前运行在 Linux 上");
}

// 5) 输出机器名和当前用户
Console.WriteLine($"机器名：{Environment.MachineName}");
Console.WriteLine($"当前用户：{Environment.UserName}");

// 6) 输出当前工作目录（程序启动时所在的目录）
Console.WriteLine($"工作目录：{Environment.CurrentDirectory}");

// 7) 获取系统特殊目录路径（桌面、文档等）
//    GetFolderPath 返回操作系统对应的特殊目录
string desktop = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
Console.WriteLine($"桌面目录：{desktop}");

// 8) 输出处理器数量
//    ProcessorCount 在做并行计算时常用，用来决定线程池大小
Console.WriteLine($"CPU 核心数：{Environment.ProcessorCount}");

// 9) 演示：当前是否 64 位进程
//    IntPtr.Size 为 8 表示 64 位，4 表示 32 位
bool is64Bit = IntPtr.Size == 8;
Console.WriteLine($"是否 64 位进程：{is64Bit}");

// 10) 系统 TickCount（启动后毫秒数），用于简单计时
//     注意：环境 tick 是 int，约 24.9 天后会回绕
int ticks = Environment.TickCount;
Console.WriteLine($"系统启动至今：{ticks} ms");

// 11) 输出命令行参数
//     顶级语句中可用 args 数组；这里演示 Environment.GetCommandLineArgs
string[] args = Environment.GetCommandLineArgs();
Console.WriteLine($"命令行参数个数：{args.Length}");
if (args.Length > 0)
{
    Console.WriteLine($"参数 0（程序名）：{args[0]}");
}

Console.WriteLine("===== 信息采集完毕 =====");`,
    lang: 'cs',
  },

  // ============================================================
  // 第二章 开发环境搭建
  // ============================================================
  {
    id: 'csharp4-ch02',
    group: '第一部分 入门基础',
    icon: '🛠️',
    title: '开发环境搭建',
    content: `## 第二章 开发环境搭建

### 一、.NET SDK 安装

写 C# 代码必须装 **.NET SDK**（不只是运行时）。SDK 包含编译器（Roslyn）、运行时（CLR）、CLI 工具（dotnet 命令）。

**Windows**：

1. 访问 [dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)。
2. 下载 \`.NET 8.0 SDK\` 的 Windows x64 安装包。
3. 双击安装，一路下一步。
4. 打开 PowerShell，运行 \`dotnet --version\` 验证。

**macOS**：

推荐用 Homebrew：

\`\`\`bash
brew install --cask dotnet-sdk
\`\`\`

或者去官网下载 \`.pkg\` 安装包双击安装。

**Linux**（Ubuntu/Debian 示例）：

\`\`\`bash
# 添加微软包源
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
# 安装 SDK
sudo apt-get update && sudo apt-get install -y dotnet-sdk-8.0
\`\`\`

**验证安装**：

\`\`\`bash
dotnet --version       # 应输出 8.0.x
dotnet --list-sdks     # 列出所有已安装的 SDK
dotnet --list-runtimes # 列出所有已安装的运行时
\`\`\`

### 二、dotnet CLI 常用命令

.NET 的命令行工具叫 \`dotnet\`，几乎所有操作都能用它完成。即使你用 IDE，底层也是调用 dotnet CLI。

| 命令 | 作用 | 示例 |
| --- | --- | --- |
| \`dotnet new\` | 创建新项目 | \`dotnet new console -n MyApp\` |
| \`dotnet build\` | 编译项目 | \`dotnet build\` |
| \`dotnet run\` | 编译并运行 | \`dotnet run\` |
| \`dotnet test\` | 运行单元测试 | \`dotnet test\` |
| \`dotnet publish\` | 发布可部署产物 | \`dotnet publish -c Release\` |
| \`dotnet add package\` | 添加 NuGet 包 | \`dotnet add package Newtonsoft.Json\` |
| \`dotnet add reference\` | 添加项目引用 | \`dotnet add reference ../Lib/Lib.csproj\` |
| \`dotnet sln\` | 管理解决方案 | \`dotnet new sln -n MySolution\` |
| \`dotnet restore\` | 还原依赖 | \`dotnet restore\` |
| \`dotnet format\` | 代码格式化 | \`dotnet format\` |

**创建第一个控制台项目**：

\`\`\`bash
dotnet new console -n HelloCSharp
cd HelloCSharp
dotnet run
\`\`\`

\`dotnet new console\` 默认生成顶级语句风格的 \`Program.cs\`，开箱即用。

### 三、IDE 选择

写 C# 主流有三款 IDE，选哪个看预算和喜好：

**Visual Studio 2022（Windows only）**

- 微软亲儿子，功能最强。
- Community 版免费（个人/小团队），Professional/Enterprise 收费。
- 调试器、设计器、性能分析器一流。
- 缺点：仅 Windows、安装体积大（10GB+）。

**Visual Studio Code（跨平台）**

- 免费轻量，跨平台。
- 装 C# Dev Kit 扩展后体验接近 VS。
- 适合 Mac/Linux 用户、前端工程师兼写 C#。
- 缺点：部分高级功能不如 VS。

**JetBrains Rider（跨平台）**

- 收费（个人版约 ¥899/年），有 30 天试用。
- 智能提示、重构、导航最强（JetBrains 祖传技能）。
- 跨平台，Mac/Linux 友好。
- 缺点：收费、对 .NET 新特性跟进偶尔滞后。

**本书推荐**：

- **Windows 用户**：VS 2022 Community。
- **Mac/Linux 用户**：VS Code + C# Dev Kit，或 Rider 试用。
- **本教程沙箱**：直接网页内运行，无需任何 IDE。

### 四、项目类型

\`dotnet new\` 后面跟项目模板名，常见模板：

| 模板短名 | 用途 |
| --- | --- |
| \`console\` | 控制台应用 |
| \`classlib\` | 类库（DLL） |
| \`web\` | ASP.NET Core 空 Web 应用 |
| \`webapi\` | ASP.NET Core Web API |
| \`mvc\` | ASP.NET Core MVC |
| \`webapp\` | ASP.NET Core Razor Pages |
| \`blazor\` | Blazor Server |
| \`blazorwasm\` | Blazor WebAssembly |
| \`xunit\` | xUnit 测试项目 |
| \`nunit\` | NUnit 测试项目 |
| \`worker\` | 后台服务（Worker Service） |
| \`maui\` | .NET MAUI 跨平台 UI |

用 \`dotnet new list\` 查看本机所有可用模板。

### 五、csproj 文件结构

每个 .NET 项目都有一个 \`.csproj\` 文件，是项目的"配置文件"。一个典型的 .NET 8 控制台项目 csproj 长这样：

\`\`\`xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
\`\`\`

关键字段：

- \`Sdk="Microsoft.NET.Sdk"\`：使用 .NET 标准项目 SDK。
- \`OutputType\`：\`Exe\` 表示可执行文件，\`Library\` 表示类库。
- \`TargetFramework\`：目标框架，\`net8.0\` 是 .NET 8。
- \`ImplicitUsings\`：启用隐式 using（自动导入常用命名空间）。
- \`Nullable\`：启用可空引用类型检查（C# 8+ 特性）。

### 六、本教程沙箱说明

本教程每章代码都配有"运行"按钮，背后调用 \`/api/run-csharp\` 接口，在服务端 .NET 8 沙箱中执行你的代码，返回控制台输出。

**沙箱限制**：

- 执行时间：单次最多 10 秒。
- 内存：256 MB。
- 网络：默认禁用（部分章节会放开）。
- 文件系统：临时目录可写，重启后清空。

**沙箱使用建议**：

- 不要写死循环（会被超时杀掉）。
- 不要尝试访问本机敏感目录（沙箱里没有你的真实文件）。
- 想本地完整调试，按上面步骤装 SDK 即可。

下面 demo 用反射和 Environment 获取运行环境的详细信息。`,
    code: `// ===========================================================
// 第二章 开发环境搭建
// 演示：通过反射和 Environment 获取运行环境详细信息
// 适用：.NET 8 / C# 12
// ===========================================================

using System;
using System.Reflection;

// 1) 获取当前程序入口程序集
//    Assembly.GetEntryAssembly() 返回启动当前进程的程序集
Assembly? entryAssembly = Assembly.GetEntryAssembly();
Console.WriteLine("===== 程序集信息 =====");
if (entryAssembly is not null)
{
    // 输出程序集的全名（包含名称、版本、文化、公钥标记）
    Console.WriteLine($"入口程序集全名：{entryAssembly.FullName}");

    // 输出程序集的位置（DLL/EXE 的物理路径）
    Console.WriteLine($"程序集位置：{entryAssembly.Location}");
}
else
{
    Console.WriteLine("（未获取到入口程序集，可能由原生宿主加载）");
}

// 2) 获取当前正在执行的代码所在程序集
//    Assembly.GetExecutingAssembly() 返回包含本代码的程序集
Assembly execAssembly = Assembly.GetExecutingAssembly();
Console.WriteLine($"执行程序集：{execAssembly.GetName().Name}");

// 3) 获取当前 AppDomain 信息
//    AppDomain 是 .NET 中加载程序集、隔离代码的边界
Console.WriteLine("\\n===== AppDomain 信息 =====");
AppDomain domain = AppDomain.CurrentDomain;
Console.WriteLine($"AppDomain 友好名称：{domain.FriendlyName}");
Console.WriteLine($"是否默认域：{domain.IsDefaultAppDomain()}");
Console.WriteLine($"已加载程序集数量：{domain.GetAssemblies().Length}");

// 4) 输出 .NET 运行时版本信息
Console.WriteLine("\\n===== 运行时版本 =====");
Console.WriteLine($"CLR 版本：{Environment.Version}");
//    使用 typeof(object).Assembly 可获取核心运行时程序集
Console.WriteLine($"核心程序集路径：{typeof(object).Assembly.Location}");

// 5) 输出操作系统与机器信息
Console.WriteLine("\\n===== 操作系统与机器 =====");
Console.WriteLine($"机器名：{Environment.MachineName}");
Console.WriteLine($"用户名：{Environment.UserName}");
Console.WriteLine($"处理器核心数：{Environment.ProcessorCount}");

// 6) 输出当前工作目录与系统目录
Console.WriteLine($"当前工作目录：{Environment.CurrentDirectory}");
Console.WriteLine($"系统目录：{Environment.SystemDirectory}");

// 7) 获取 .NET 命令行参数
//    GetCommandLineArgs 第一个元素是程序本身的路径
string[] cmdArgs = Environment.GetCommandLineArgs();
Console.WriteLine($"\\n===== 命令行参数 =====");
Console.WriteLine($"参数个数：{cmdArgs.Length}");
for (int i = 0; i < cmdArgs.Length; i++)
{
    Console.WriteLine($"  [{i}] {cmdArgs[i]}");
}

// 8) 获取特殊目录路径（跨平台）
Console.WriteLine("\\n===== 系统特殊目录 =====");
Console.WriteLine($"桌面：{Environment.GetFolderPath(Environment.SpecialFolder.Desktop)}");
Console.WriteLine($"我的文档：{Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments)}");
Console.WriteLine($"临时目录：{Environment.GetFolderPath(Environment.SpecialFolder.Temp)}");

Console.WriteLine("\\n===== 环境信息采集完毕 =====");`,
    lang: 'cs',
  },

  // ============================================================
  // 第三章 第一个 C# 程序
  // ============================================================
  {
    id: 'csharp4-ch03',
    group: '第一部分 入门基础',
    icon: '👋',
    title: '第一个 C# 程序',
    content: `## 第三章 第一个 C# 程序

### 一、从零写 Hello World

打开本教程沙箱或本地 IDE，把默认生成的代码替换成下面这行：

\`\`\`csharp
Console.WriteLine("Hello, World!");
\`\`\`

点击运行，控制台输出：

\`\`\`
Hello, World!
\`\`\`

就这么一行。这就是 C# 12 的"Hello World"。对比一下 C# 1.0 时代：

\`\`\`csharp
using System;

namespace HelloWorld
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello, World!");
        }
    }
}
\`\`\`

两段代码功能完全等价，但现代 C# 用一行就搞定了。这就是**顶级语句**的威力。

### 二、逐行解释

虽然我们的 Hello World 只有一行，但里面其实包含了几个关键元素：

1. \`Console\`：类名，来自 \`System\` 命名空间，表示控制台。
2. \`.\`：成员访问运算符，表示"访问 Console 类的成员"。
3. \`WriteLine\`：方法名，表示"写一行并换行"。
4. \`(...)\`：方法调用运算符，括号里是参数。
5. \`"Hello, World!"\`：字符串字面量，用双引号包裹。
6. \`;\`：语句结束符，C# 每条语句必须以分号结尾。

### 三、编译运行过程

从源码到屏幕上出现文字，C# 经历了这些步骤：

1. **编写**：你在编辑器里写 \`.cs\` 文件。
2. **编译**：\`dotnet build\` 调用 Roslyn 编译器，把 \`.cs\` 编译成 IL（中间语言），打包成 \`.dll\` 或 \`.exe\`。
3. **加载**：\`dotnet run\` 启动 CLR，CLR 加载程序集。
4. **JIT 翻译**：CLR 把 IL 翻译成本机机器码。
5. **执行**：CPU 执行机器码，调用操作系统 API 把文字画到控制台。

整个过程对开发者透明，你只关心源码，运行细节交给 CLR。

### 四、常见编译错误

新手第一次写代码经常会遇到编译错误，提前认识几种典型的：

**错误 1：缺少分号**

\`\`\`csharp
Console.WriteLine("Hi")   // ❌ 缺少分号
\`\`\`

报错：\`CS1002 ; expected\`（应输入分号）。

**错误 2：字符串没闭合**

\`\`\`csharp
Console.WriteLine("Hi);    // ❌ 双引号没闭合
\`\`\`

报错：\`CS1010 常量中有换行符\`。

**错误 3：大小写错误**

\`\`\`csharp
console.writeline("Hi");   // ❌ C# 区分大小写
\`\`\`

报错：\`CS0103 当前上下文中不存在名称 "console"\`。

**错误 4：括号不匹配**

\`\`\`csharp
Console.WriteLine("Hi";    // ❌ 缺少右括号
\`\`\`

报错：\`CS1026 ) expected\`。

**错误 5：变量未声明就使用**

\`\`\`csharp
Console.WriteLine(name);   // ❌ name 没声明
\`\`\`

报错：\`CS0103 当前上下文中不存在名称 "name"\`。

> 💡 看到红色波浪线或 CS 开头的错误号，先把光标移到错误处，IDE 会显示详细原因。养成"先看错误号再看代码"的习惯。

### 五、命名规范

C# 区分大小写，命名要遵守规则和社区规范：

**语法规则（必须遵守，否则编译不过）**：

- 只能由字母、数字、下划线组成，不能以数字开头。
- 不能是关键字（\`class\`、\`int\`、\`if\` 等），加 \`@\` 前缀可绕过（\`@class\`，但不推荐）。
- 长度不限，但要合理。

**社区规范（强烈推荐遵守）**：

| 类型 | 规范 | 示例 |
| --- | --- | --- |
| 类名、方法名、属性 | PascalCase | \`HttpClient\`、\`ReadLine\`、\`UserName\` |
| 局部变量、字段、参数 | camelCase | \`userName\`、\`orderCount\`、\`apiKey\` |
| 接口名 | I + PascalCase | \`IDisposable\`、\`IEnumerable\` |
| 私有字段 | _ + camelCase | \`_logger\`、\`_cache\` |
| 常量 | PascalCase 或 UPPER_SNAKE | \`MaxRetry\`、\`MAX_RETRY\` |
| 命名空间 | PascalCase | \`MyApp.Services\` |

> ⚠️ 不要用拼音命名（\`yonghuMing\` 不要，用 \`userName\`）；不要用缩写到看不懂（\`usr\` 不如 \`user\`）。

### 六、C# 代码基本元素

任何 C# 代码都由以下五种元素组成：

**1. 关键字（Keyword）**

C# 预定义的保留字，有特殊含义。比如：\`class\`、\`int\`、\`if\`、\`for\`、\`return\`、\`var\`、\`new\`、\`public\`、\`static\` 等。C# 12 共有约 80 个关键字。

**2. 标识符（Identifier）**

开发者自己起的名字。变量名、方法名、类名都是标识符。\`Console\`、\`WriteLine\`、\`name\` 都是标识符（前两个由 .NET BCL 定义，最后一个由你定义）。

**3. 字面量（Literal）**

代码里直接写出来的常量值。比如：

- \`"Hello"\`：字符串字面量
- \`123\`：整数字面量
- \`3.14\`：浮点数字面量
- \`true\` / \`false\`：布尔字面量
- \`'A'\`：字符字面量
- \`null\`：空引用字面量

**4. 运算符（Operator）**

执行运算的符号。比如：

- 算术：\`+\`、\`-\`、\`*\`、\`/\`、\`%\`
- 比较：\`==\`、\`!=\`、\`>\`、\`<\`、\`>=\`、\`<=\`
- 逻辑：\`&&\`、\`||\`、\`!\`
- 赋值：\`=\`、\`+=\`、\`-=\`
- 成员访问：\`.\`
- 其他：\`??\`、\`?.\`、\`=>\`

**5. 分隔符（Separator）**

把代码元素隔开的符号：\`{\`、\`}\`、\`(\`、\`)\`、\`[\`、\`]\`、\`;\`、\`,\`。

把这些元素组合起来就是 C# 程序。比如 \`int age = 18;\` 由 \`int\`（关键字）+ \`age\`（标识符）+ \`=\`（运算符）+ \`18\`（字面量）+ \`;\`（分隔符）组成。

下一章我们会详细讲顶级语句的程序结构，让你彻底理解"为什么只写一行就能跑"。`,
    code: `// ===========================================================
// 第三章 第一个 C# 程序
// 演示：多行注释、变量声明、字符串拼接、Console 多种用法、ReadLine
// 适用：.NET 8 / C# 12
// ===========================================================

/*
 * 上面是块注释，可以跨多行
 * 通常用于文件头说明或大段解释
 */

using System;   // 引入 System 命名空间（顶级语句默认隐式引入，这里显式写一下）

// 1) 简单输出
Console.WriteLine("===== 我的第一个 C# 程序 =====");

// 2) 声明变量并赋值
string name = "C#";          // 字符串变量
int age = 22;                // 整型变量（C# 出生于 2002 年，至 2024 年约 22 岁）
double version = 12.0;       // 浮点变量
bool isAwesome = true;       // 布尔变量

// 3) 字符串拼接：用 + 号把多个字符串拼起来
Console.WriteLine("语言名：" + name);
Console.WriteLine("年龄：" + age.ToString());

// 4) 字符串插值：$ 前缀 + {变量名}，更现代更可读
//    推荐用这种方式，比 + 拼接更清晰
Console.WriteLine($"版本：{version}");
Console.WriteLine($"是否优秀：{isAwesome}");

// 5) Console.Write 与 Console.WriteLine 的区别
//    Write 不换行，WriteLine 末尾自动换行
Console.Write("同一行 ");
Console.Write("还是同一行 ");
Console.WriteLine("换行结束");

// 6) 一次输出多个变量，用逗号分隔（占位符语法）
//    {0}、{1} 是占位符，后面按顺序提供值
Console.WriteLine("姓名={0}, 年龄={1}, 版本={2}", name, age, version);

// 7) 数字格式化：在占位符后加 :格式
//    F2 表示保留 2 位小数，N0 表示千分位整数
Console.WriteLine("版本（2位小数）：{0:F2}", version);
Console.WriteLine("年龄（千分位）：{0:N0}", age);

// 8) 字符串重复与对齐
//    new string('*', 20) 生成 20 个星号
string line = new string('*', 30);
Console.WriteLine(line);

// 9) 简单交互：读取用户输入
//    注意：沙箱环境可能不支持交互输入，本地运行可正常
Console.Write("请输入你的名字（沙箱可能跳过）：");
string? input = Console.ReadLine();   // ReadLine 返回 string?（可能为 null）

// 10) 处理可能的 null（C# 8+ 可空引用类型）
//     ?? 提供默认值，避免 null 导致后续报错
string userName = input ?? "匿名用户";
Console.WriteLine($"你好，{userName}！欢迎学习 {name}。");

// 11) 简单运算并输出
int yearBorn = 2024 - age;
Console.WriteLine($"假设你现在 {age} 岁，那你大约出生在 {yearBorn} 年");

// 12) 输出彩色文字（仅部分终端支持，沙箱可能不显示颜色）
Console.ForegroundColor = ConsoleColor.Green;
Console.WriteLine("这是绿色文字");
Console.ForegroundColor = ConsoleColor.Yellow;
Console.WriteLine("这是黄色文字");
// 恢复默认颜色
Console.ResetColor();

Console.WriteLine("===== 程序结束 =====");`,
    lang: 'cs',
  },

  // ============================================================
  // 第四章 顶级语句与程序结构
  // ============================================================
  {
    id: 'csharp4-ch04',
    group: '第一部分 入门基础',
    icon: '📦',
    title: '顶级语句与程序结构',
    content: `## 第四章 顶级语句与程序结构

### 一、什么是顶级语句

从 C# 9 开始，你可以在 \`.cs\` 文件里**直接写执行语句**，不用包裹在 \`class Program\` 和 \`static void Main\` 里。这种写法叫**顶级语句**（top-level statements）。

对比看更直观。**旧写法**（C# 8 及之前）：

\`\`\`csharp
using System;

namespace MyApp
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello");
        }
    }
}
\`\`\`

**新写法**（C# 9+，顶级语句）：

\`\`\`csharp
Console.WriteLine("Hello");
\`\`\`

两段代码编译后**完全等价**：编译器会自动把顶级语句包进一个隐藏的 \`Main\` 方法里。也就是说，顶级语句是语法糖，背后还是原来的 Program + Main 结构。

### 二、顶级语句的规则

**规则 1：一个项目只能有一个文件用顶级语句**

如果有两个 \`.cs\` 文件都写了顶级语句，编译器报错：\`CS8802 只有一个编译单元可具有顶级语句\`。

**规则 2：顶级语句必须放在文件最前面**

\`using\` 指令可以放最前面，但**任何类型声明（class、interface 等）必须放在顶级语句之后**。

\`\`\`csharp
using System;

Console.WriteLine("执行语句");   // 顶级语句

class Person { ... }              // 类型声明放在后面
\`\`\`

**规则 3：方法定义放在顶级语句后面**

\`\`\`csharp
Console.WriteLine("启动");

Greet();    // 可以调用下面定义的方法

void Greet()   // 局部函数，定义在顶级语句之后
{
    Console.WriteLine("Hi");
}
\`\`\`

**规则 4：顶级语句文件中可以访问 \`args\` 参数**

\`args\` 是隐藏 \`Main\` 方法的参数，类型是 \`string[]\`，包含命令行参数。

\`\`\`csharp
foreach (var arg in args)
{
    Console.WriteLine(arg);
}
\`\`\`

**规则 5：可以用 \`return\` 返回退出码**

\`\`\`csharp
if (args.Length == 0)
{
    Console.Error.WriteLine("缺少参数");
    return 1;    // 退出码 1 表示错误
}
return 0;        // 退出码 0 表示成功
\`\`\`

### 三、using 指令

\`using\` 用于引入命名空间，让你不用写全名。比如：

\`\`\`csharp
using System.Text;        // 引入 System.Text 命名空间
using System.IO;          // 引入 System.IO 命名空间

var sb = new StringBuilder();  // 不用写 System.Text.StringBuilder
File.ReadAllText("a.txt");     // 不用写 System.IO.File
\`\`\`

不写 \`using\` 也能用，但要写全名：

\`\`\`csharp
System.Text.StringBuilder sb = new();
\`\`\`

### 四、global using

C# 10 引入 \`global using\`，在一个文件里声明后，整个项目所有文件都自动引入：

\`\`\`csharp
// GlobalUsings.cs
global using System;
global using System.IO;
global using System.Collections.Generic;
\`\`\`

其他 \`.cs\` 文件不用再写 \`using System;\` 就能直接用 \`Console\`、\`File\`、\`List<int>\`。

### 五、隐式 using（ImplicitUsings）

.NET 6+ 的新项目模板默认开启了**隐式 using**，在 csproj 里：

\`\`\`xml
<ImplicitUsings>enable</ImplicitUsings>
\`\`\`

开启后，SDK 会自动生成一批 \`global using\`，常见的命名空间（\`System\`、\`System.IO\`、\`System.Collections.Generic\`、\`System.Linq\`、\`System.Net.Http\`、\`System.Threading.Tasks\` 等）无需手动写 \`using\`。

想自定义额外要隐式引入的命名空间，在 csproj 里加：

\`\`\`xml
<ItemGroup>
  <Using Include="System.Text.Json" />
  <Using Include="System.Text.RegularExpressions" />
</ItemGroup>
\`\`\`

### 六、文件作用域命名空间

C# 10 引入**文件作用域命名空间**（file-scoped namespace），一行声明整个文件的命名空间，不用大括号缩进：

\`\`\`csharp
namespace MyApp.Services;   // 注意末尾的分号

public class UserService { ... }
\`\`\`

等价于旧写法：

\`\`\`csharp
namespace MyApp.Services
{
    public class UserService { ... }
}
\`\`\`

文件作用域命名空间让代码少一层缩进，更清爽。新建的 .NET 8 项目默认推荐用这种写法。

### 七、Main 函数的 args 参数

\`args\` 是命令行参数数组，\`args[0]\` 是第一个参数（注意：不是程序名，.NET Core 之后改了，程序名不再算作 args[0]）。

\`\`\`csharp
// 执行：dotnet run -- alice 25
Console.WriteLine($"args.Length = {args.Length}");  // 2
Console.WriteLine($"args[0] = {args[0]}");          // alice
Console.WriteLine($"args[1] = {args[1]}");          // 25
\`\`\`

> 💡 想解析复杂命令行参数（带 \`--flag\`、\`-v\` 之类），用 \`System.CommandLine\` 库，本书第 70 章会讲。

### 八、return 退出码

操作系统用退出码（exit code）判断程序成功还是失败：

- \`0\`：成功。
- 非 0：失败，具体含义由程序约定（1 通常表示一般错误，2 表示参数错误）。

顶级语句里直接 \`return 数字\` 就能设置退出码：

\`\`\`csharp
if (args.Length == 0)
{
    Console.Error.WriteLine("用法：myapp <name>");
    return 2;   // 退出码 2：参数错误
}
Console.WriteLine($"Hello, {args[0]}");
return 0;       // 退出码 0：成功
\`\`\`

在 shell 里用 \`$?\`（bash）或 \`$LASTEXITCODE\`（PowerShell）查看退出码。

### 九、Environment.Exit 与 return 的区别

\`return\` 只退出 \`Main\` 方法（顶级语句的隐藏 Main），但 \`Environment.Exit\` 强制终止整个进程，包括其他线程：

\`\`\`csharp
Environment.Exit(1);   // 立即终止进程，退出码 1
\`\`\`

通常 \`return\` 更优雅，\`Environment.Exit\` 用于需要立即终止的场景（比如启动时检测到致命错误）。

下一章我们会用这些知识写一个真正交互的控制台程序。`,
    code: `// ===========================================================
// 第四章 顶级语句与程序结构
// 演示：顶级语句、args 参数、return 退出码、Environment.Exit
// 适用：.NET 8 / C# 12
// ===========================================================

// using 指令放在文件最前面（隐式 using 已包含 System，这里显式再写一次只为演示）
using System;

// 1) 顶级语句：直接写执行代码，编译器会自动包进隐藏的 Main 方法
Console.WriteLine("===== 顶级语句演示 =====");

// 2) 访问命令行参数 args
//    args 是顶级语句中隐式可用的 string[]，包含传给程序的参数
Console.WriteLine($"收到参数个数：{args.Length}");

// 3) 遍历参数
if (args.Length > 0)
{
    Console.WriteLine("参数列表：");
    for (int i = 0; i < args.Length; i++)
    {
        Console.WriteLine($"  [{i}] {args[i]}");
    }
}

// 4) 简单参数解析：查找 --name 参数
//    用 IndexOf 找到 --name 在 args 中的位置，然后取下一个元素作为值
string userName = "匿名用户";
int nameIndex = Array.IndexOf(args, "--name");
if (nameIndex >= 0 && nameIndex + 1 < args.Length)
{
    userName = args[nameIndex + 1];
}
Console.WriteLine($"你好，{userName}！");

// 5) 查找 --help 标志参数
bool showHelp = Array.IndexOf(args, "--help") >= 0
             || Array.IndexOf(args, "-h") >= 0;
if (showHelp)
{
    Console.WriteLine("用法：dotnet run [--name <名字>] [--help]");
    Console.WriteLine("  --name <名字>   设置欢迎的用户名");
    Console.WriteLine("  --help, -h      显示帮助");
    return 0;   // 显示帮助后正常退出
}

// 6) 调用下面定义的局部函数
//    顶级语句文件中，方法定义放在执行语句之后
PrintBanner();

// 7) 演示 return 退出码
//    通常 0 表示成功，非 0 表示错误
//    shell 中用 $? 或 $LASTEXITCODE 查看
if (args.Length > 0 && args[0] == "--fail")
{
    Console.Error.WriteLine("收到 --fail 参数，模拟失败退出");
    return 1;   // 退出码 1
}

// 8) 演示 Environment.ExitCode
//    设置退出码但不立即退出，等程序自然结束时使用此码
Environment.ExitCode = 0;
Console.WriteLine("程序正常执行完毕");

Console.WriteLine("===== 演示结束 =====");

// ---------- 局部函数定义区 ----------
// 顶级语句中定义的方法必须放在所有执行语句之后
void PrintBanner()
{
    // 在方法内可以使用 Console 等任何已导入的类型
    Console.WriteLine("********************************");
    Console.WriteLine("*     C# 顶级语句示例程序      *");
    Console.WriteLine("********************************");
}

// 也可以定义返回值的方法（这里仅定义演示，不调用）
int ComputeExitCode(string[] args)
{
    return args.Length > 0 ? 0 : 1;
}`,
    lang: 'cs',
  },

  // ============================================================
  // 第五章 控制台输入输出
  // ============================================================
  {
    id: 'csharp4-ch05',
    group: '第一部分 入门基础',
    icon: '💬',
    title: '控制台输入输出',
    content: `## 第五章 控制台输入输出

### 一、Console 类总览

\`System.Console\` 是 .NET 提供的控制台 IO 类，所有命令行交互都靠它。它有三大类成员：

- **输出**：\`Write\`、\`WriteLine\`、\`Out\` 属性。
- **输入**：\`Read\`、\`ReadKey\`、\`ReadLine\`、\`In\` 属性。
- **外观**：\`ForegroundColor\`、\`BackgroundColor\`、\`Clear\`、\`Beep\`。

\`Console\` 是静态类，所有成员都是静态的，直接 \`Console.Xxx()\` 调用，不需要 new。

### 二、Console.Write 与 Console.WriteLine

**Write**：输出但不换行。

\`\`\`csharp
Console.Write("Hello ");
Console.Write("World");
// 输出：Hello World（光标停在末尾，不换行）
\`\`\`

**WriteLine**：输出后自动换行。

\`\`\`csharp
Console.WriteLine("第一行");
Console.WriteLine("第二行");
// 输出两行
\`\`\`

\`WriteLine\` 也可以不传参数，只输出一个空行：

\`\`\`csharp
Console.WriteLine();   // 等同于 Console.Write("\\n");
\`\`\`

### 三、字符串插值 $""（推荐）

C# 6+ 引入字符串插值，用 \`$\` 前缀 + \`{表达式}\` 直接嵌入变量：

\`\`\`csharp
string name = "Tom";
int age = 18;
Console.WriteLine($"我叫 {name}，今年 {age} 岁");
// 输出：我叫 Tom，今年 18 岁
\`\`\`

大括号里可以是任意表达式：

\`\`\`csharp
Console.WriteLine($"明年我 {age + 1} 岁");
Console.WriteLine($"名字长度：{name.Length}");
Console.WriteLine($"大写：{name.ToUpper()}");
\`\`\`

要在大括号里输出字面量 \`{\` 或 \`}\`，写两遍：\`{{\` 或 \`}}\`。

\`\`\`csharp
Console.WriteLine($"JSON: {{ \\"name\\": \\"{name}\\" }}");
// 输出：JSON: { "name": "Tom" }
\`\`\`

### 四、格式化输出

除了插值，C# 还支持**复合格式化**（占位符语法）：

\`\`\`csharp
Console.WriteLine("姓名={0}, 年龄={1}", "Tom", 18);
// 输出：姓名=Tom, 年龄=18
\`\`\`

\`{0}\`、\`{1}\` 是占位符，按后面参数顺序填充。一般推荐用插值，更直观。

### 五、对齐与填充

在 \`{}\` 里加 \`,数字\` 控制对齐宽度：

- 正数：右对齐，左边补空格。
- 负数：左对齐，右边补空格。

\`\`\`csharp
Console.WriteLine("|{0,10}|", "Hi");   // 右对齐，宽度 10
Console.WriteLine("|{0,-10}|", "Hi");  // 左对齐，宽度 10
// 输出：
// |        Hi|
// |Hi        |
\`\`\`

插值里也能用：

\`\`\`csharp
Console.WriteLine($"|{"Hi",10}|");
Console.WriteLine($"|{"Hi",-10}|");
\`\`\`

### 六、数字与日期格式

在 \`{}\` 里加 \`:格式\` 控制数字和日期显示：

\`\`\`csharp
double pi = 3.14159265;
Console.WriteLine($"{pi:F2}");      // 3.14（2 位小数）
Console.WriteLine($"{pi:F4}");      // 3.1416（4 位小数）

int money = 1234567;
Console.WriteLine($"{money:N0}");   // 1,234,567（千分位）
Console.WriteLine($"{money:X}");    // 12D687（十六进制）

DateTime now = DateTime.Now;
Console.WriteLine($"{now:yyyy-MM-dd}");           // 2024-12-31
Console.WriteLine($"{now:HH:mm:ss}");             // 23:59:59
Console.WriteLine($"{now:yyyy年MM月dd日 HH时mm分}"); // 2024年12月31日 23时59分
\`\`\`

### 七、控制台颜色

\`Console.ForegroundColor\` 设置前景色，\`Console.BackgroundColor\` 设置背景色：

\`\`\`csharp
Console.ForegroundColor = ConsoleColor.Red;
Console.WriteLine("红色警告");
Console.ForegroundColor = ConsoleColor.Green;
Console.WriteLine("绿色成功");
Console.ResetColor();   // 恢复默认
\`\`\`

\`ConsoleColor\` 是枚举，可选值：\`Black\`、\`DarkBlue\`、\`DarkGreen\`、\`DarkCyan\`、\`DarkRed\`、\`DarkMagenta\`、\`DarkYellow\`、\`Gray\`、\`DarkGray\`、\`Blue\`、\`Green\`、\`Cyan\`、\`Red\`、\`Magenta\`、\`Yellow\`、\`White\`。

> ⚠️ 颜色仅在支持 ANSI 转义的终端有效，IDE 内置输出窗口可能不显示颜色。本书沙箱也不显示颜色，但代码本身能正常运行。

### 八、输入方法

**Console.ReadLine**：读一行输入，返回 \`string?\`（用户按 Ctrl+D/Ctrl+Z 时返回 null）。

\`\`\`csharp
Console.Write("姓名：");
string? name = Console.ReadLine();
\`\`\`

**Console.Read**：读一个字符的 Unicode 码点（int），不换行。

\`\`\`csharp
int ch = Console.Read();
Console.WriteLine($"你输入了：{(char)ch}");
\`\`\`

**Console.ReadKey**：读一个按键，返回 \`ConsoleKeyInfo\`，无需回车。

\`\`\`csharp
ConsoleKeyInfo key = Console.ReadKey(true);   // true 表示不回显
Console.WriteLine($"你按下了 {key.Key}");
\`\`\`

### 九、标准错误流 Console.Error

\`Console.Error\` 是标准错误流，用于输出错误信息，与标准输出分离：

\`\`\`csharp
Console.Error.WriteLine("这条信息输出到 stderr");
\`\`\`

在 shell 里可以用 \`2>\` 重定向错误流：

\`\`\`bash
dotnet run 2> error.log
\`\`\`

正常信息走 \`Console.Out\`（即 \`Console.WriteLine\` 默认行为），错误信息走 \`Console.Error\`，这样能把日志分类处理。

### 十、重定向输出 Console.SetOut

\`Console.SetOut\` 可以把标准输出重定向到其他 \`TextWriter\`，比如文件：

\`\`\`csharp
using StreamWriter file = new("output.log");
Console.SetOut(file);
Console.WriteLine("这行会写入文件");
Console.Out.Flush();   // 刷新缓冲区
// 程序结束后，output.log 文件里会有这行
\`\`\`

恢复默认输出用 \`Console.SetOut(new StreamWriter(Console.OpenStandardOutput()))\`。

### 十一、args 参数解析

命令行参数通过 \`args\` 传入顶级语句。简单解析示例：

\`\`\`csharp
foreach (string arg in args)
{
    Console.WriteLine(arg);
}
\`\`\`

复杂参数（带 \`--name value\` 形式）建议用 \`System.CommandLine\` 库，本书后续章节会讲。

下面是一个综合 demo——猜数字游戏，把本章所有知识点都用上。`,
    code: `// ===========================================================
// 第五章 控制台输入输出
// 演示：交互式猜数字游戏（含输入、输出、错误流、颜色、格式化）
// 适用：.NET 8 / C# 12
// ===========================================================

using System;

// 1) 程序欢迎信息：用颜色突出标题
Console.ForegroundColor = ConsoleColor.Cyan;
Console.WriteLine("***********************************");
Console.WriteLine("*     猜数字小游戏 v1.0           *");
Console.WriteLine("***********************************");
Console.ResetColor();   // 恢复默认颜色，避免后续输出全是青色

// 2) 用 Random 生成 1 到 100 的随机数
//    Random.Shared 是 .NET 6+ 推荐的线程安全随机数生成器
int target = Random.Shared.Next(1, 101);

// 3) 设置最大尝试次数
const int MaxAttempts = 7;
int attempts = 0;
bool guessed = false;

// 4) 输出游戏说明
Console.WriteLine($"我已经想好了一个 1-100 之间的数字，你有 {MaxAttempts} 次机会猜中它。");
Console.WriteLine($"提示：每次猜测后我会告诉你偏大还是偏小。");
Console.WriteLine();

// 5) 主游戏循环
while (attempts < MaxAttempts)
{
    // 计算剩余次数
    int remaining = MaxAttempts - attempts;
    Console.ForegroundColor = ConsoleColor.Yellow;
    Console.Write($"[第 {attempts + 1}/{MaxAttempts} 次，剩余 {remaining}] 请输入你的猜测：");
    Console.ResetColor();

    // 6) 读取用户输入
    //    注意：沙箱环境可能不支持交互输入，会读到空字符串或 null
    string? input = Console.ReadLine();

    // 7) 处理 null 或空输入（沙箱环境下常见）
    if (string.IsNullOrEmpty(input))
    {
        // 演示：沙箱无输入时用固定值（实际游戏中应提示用户重新输入）
        Console.Error.WriteLine("（未读到输入，演示模式下使用 50）");
        input = "50";
    }

    // 8) 去掉首尾空白后解析为整数
    //    int.TryParse 解析失败返回 false，不会抛异常
    if (!int.TryParse(input.Trim(), out int guess))
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.Error.WriteLine($"「{input}」不是有效数字，请重新输入。");
        Console.ResetColor();
        continue;   // 不计入尝试次数
    }

    // 9) 范围检查
    if (guess < 1 || guess > 100)
    {
        Console.Error.WriteLine("请输入 1-100 之间的数字。");
        continue;
    }

    attempts++;   // 有效尝试，计数+1

    // 10) 判断猜测结果
    if (guess == target)
    {
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"恭喜！你猜对了！数字就是 {target}。");
        Console.ResetColor();
        Console.WriteLine($"你用了 {attempts} 次猜中。");
        guessed = true;
        break;
    }
    else if (guess < target)
    {
        Console.ForegroundColor = ConsoleColor.Blue;
        Console.WriteLine($"  -> {guess} 太小了，再大一点！");
        Console.ResetColor();
    }
    else
    {
        Console.ForegroundColor = ConsoleColor.Magenta;
        Console.WriteLine($"  -> {guess} 太大了，再小一点！");
        Console.ResetColor();
    }

    // 11) 输出剩余距离提示（绝对值差）
    int diff = Math.Abs(guess - target);
    string hint = diff <= 5 ? "非常接近！" : diff <= 15 ? "有点远。" : "差得远！";
    Console.WriteLine($"  提示：{hint}");
}

// 12) 游戏结束处理
if (!guessed)
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine($"很遗憾，次数用完了。正确答案是 {target}。");
    Console.ResetColor();
}

// 13) 输出统计信息（演示对齐与格式化）
Console.WriteLine();
Console.WriteLine("===== 本局统计 =====");
Console.WriteLine($"{"目标数字",-10}: {target}");
Console.WriteLine($"{"尝试次数",-10}: {attempts}");
Console.WriteLine($"{"是否猜中",-10}: {(guessed ? "是" : "否")}");
Console.WriteLine($"{"时间",-10}: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");

// 14) 退出码：猜中返回 0，未猜中返回 1
if (guessed)
{
    Console.WriteLine("感谢游玩，再见！");
    Environment.ExitCode = 0;
}
else
{
    Console.Error.WriteLine("下次再战！");
    Environment.ExitCode = 1;
}`,
    lang: 'cs',
  },
];

export { chapters };
