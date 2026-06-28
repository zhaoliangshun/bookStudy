// =============================================================
// C# 交互式教程 - 第一批章节（前言 + 第一部分，共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   csharp-preface : 前言
//   csharp-ch01    : 第一章 C# 简介与环境
//   csharp-ch02    : 第二章 第一个 C# 程序
//   csharp-ch03    : 第三章 变量与数据类型
//   csharp-ch04    : 第四章 运算符与表达式
//
// 本书为交互式教程，每章包含可运行的代码示例。
// 代码示例遵循 C# 12 / .NET 8 语法。
// 每个示例都设计为可在沙箱环境中独立运行。
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

### 一、为什么学 C#

在编程语言的江湖里，C# 是一个特别的存在——它既能在 Windows 桌面、企业后台大杀四方，也能在 Unity 游戏引擎里主宰 3D 世界，还能在移动端、云原生、机器学习领域占有一席之地。一个语言覆盖这么多场景，并不多见。

C# 由微软于 2000 年发布，由 Anders Hejlsberg（也是 Turbo Pascal 和 Delphi 的设计师）主导设计。它的设计哲学是**"简单、现代、面向对象、类型安全"**——吸收了 C++ 的强大、Java 的简洁、Visual Basic 的易用，去掉了它们各自的痛点。经过 20 多年演进，C# 已经是世界上最成熟、最现代的编程语言之一。

学 C# 的理由可以列一长串：

- **就业面广**：Windows 桌面、Web 后端（ASP.NET）、游戏开发（Unity）、移动端（.NET MAUI）、云原生（Azure）、企业级应用——到处都有 C# 的岗位。
- **生态强大**：.NET 是微软全力支持的跨平台开发平台，类库丰富，文档完善。
- **语法现代**：C# 一直在吸收函数式编程、异步编程、模式匹配等现代语言特性，写起来很爽。
- **性能优秀**：.NET 8 之后的性能已经接近 C++ 和 Rust，远超 Java 和 Python。
- **学习曲线合理**：比 C++ 简单，比 Java 现代，比 Python 严谨。

> 如果你想做 Windows 桌面应用、做 Unity 游戏、做企业级 Web 后端，C# 几乎是必学的。

### 二、C# 与 .NET 的关系

很多人搞不清 C# 和 .NET 的关系，这里先厘清：

- **C#** 是一门编程语言，只负责"怎么写代码"。
- **.NET** 是一个开发平台，包含运行时（CLR）、基础类库（BCL）、编译器、工具链。C# 写的代码必须运行在 .NET 上。

类比一下：
- C# 之于 .NET，就像 Java 之于 JVM。
- C# 之于 .NET，就像 Python 之于 CPython。

**.NET 的演进**：
- **.NET Framework**（2002-2019）：只能跑 Windows，已被微软标记为"传统"。
- **.NET Core**（2016-2019）：跨平台重写，1.x-3.x 版本。
- **.NET 5+**（2020 至今）：.NET Core 的延续，跳过 4.x 避免与 .NET Framework 4.x 混淆。目前最新长期支持版本是 **.NET 8（LTS）**。

> 这本书使用 **.NET 8 LTS** + **C# 12**，所有代码都基于这个版本。这是目前生产环境最推荐的版本。

### 三、本书定位与方法

市面上 C# 教程很多，但常见两个问题：一是只讲语法不讲生态，学完不知道 C# 能干什么；二是只罗列特性不讲取舍，读者照着写却不知道为什么这样设计。

这本书尝试做到三件事：

1. **从语法到生态**——既讲 C# 的语法特性，也讲 .NET 平台的类库、工具、应用场景。
2. **从原理到实践**——每个特性都告诉你"为什么这样设计"，并给出可运行的代码示例。
3. **聚焦常用，少讲冷门**——重点是日常开发 80% 场景会用到的 20% 知识，避免堆砌冷僻特性。

全书分为五大部分：

1. **第一部分：基础入门**——环境、第一个程序、变量与类型、运算符。
2. **第二部分：语法进阶**——控制流、方法、数组字符串、枚举结构体。
3. **第三部分：面向对象**——类与对象、继承多态、接口抽象类、属性索引器。
4. **第四部分：高级特性**——泛型、委托事件、LINQ、异步编程。
5. **第五部分：实战与生态**——集合类库、文件异常、.NET 平台、进阶路线。

### 四、写给读者的话

如果你是从其他语言转过来（Java、Python、JavaScript），这本书会帮你快速建立 C# 的全貌。

如果你是编程新手，这本书从零开始，每一章都有可运行的代码示例——你可以点击"运行"按钮看到结果，加深理解。

如果你想做 Unity 游戏、Windows 桌面、ASP.NET 后端，这本书是你的入门第一站。

> C# 是一门"越用越喜欢"的语言。它的语法现代、类型安全、工具链完善——一旦上手，你会发现编程的乐趣。

愿你读完这本书后，能写出第一行 C# 代码，能看懂 .NET 项目结构，能开始自己的第一个 C# 项目。`,
  },

  // ============================================================
  // 第一章：C# 简介与环境
  // ============================================================
  {
    id: 'csharp-ch01',
    group: '第一部分 基础入门',
    icon: '🚀',
    title: 'C# 简介与环境',
    content: `## 第一章　C# 简介与环境

学习一门语言之前，先了解它的来历、定位、运行机制——这能帮你建立"为什么这样写代码"的认知框架。这一章讲 C# 的历史、特点、与同类语言的对比，以及 .NET 平台的核心概念。

### 一、C# 的诞生与演进

#### 1. 设计背景

C# 诞生于 2000 年，由微软 Anders Hejlsberg 团队设计。当时的背景：

- **C++ 太复杂**：指针、内存管理、多重继承让开发者痛苦。
- **Java 受 Sun 控制**：微软想有自己的 JVM 实现，但与 Sun（后被 Oracle 收购）合作破裂。
- **Visual Basic 不够现代**：缺乏面向对象的严谨性。

微软决定从零设计一门新语言，目标：**"简单如 Visual Basic，强大如 C++，现代如 Java"**。这就是 C#。

C# 名字来源：C# 的"#"是音乐里的升号（sharp），寓意"C++++"（四个加号组成 #），即"C++ 的进化"。

#### 2. 主要版本演进

| 版本 | 年份 | 关键特性 |
| --- | --- | --- |
| C# 1.0 | 2002 | 基础面向对象、垃圾回收 |
| C# 2.0 | 2005 | 泛型、可空类型、迭代器 |
| C# 3.0 | 2007 | LINQ、Lambda、扩展方法、隐式类型 |
| C# 4.0 | 2010 | 动态类型、命名参数、协变逆变 |
| C# 5.0 | 2012 | async/await 异步编程 |
| C# 6.0 | 2015 | 字符串插值、空条件运算符、异常过滤器 |
| C# 7.0-7.3 | 2017-2018 | 模式匹配、元组、本地函数、ref |
| C# 8.0 | 2019 | 可空引用类型、异步流、switch 表达式 |
| C# 9.0 | 2020 | record 类型、顶级语句、init |
| C# 10.0 | 2021 | 全局 using、文件范围命名空间、const 插值 |
| C# 11.0 | 2022 | 列表模式、原始字符串、required |
| **C# 12.0** | **2023** | **主构造函数、集合表达式、别名任意类型** |

C# 一直在快速演进，每年一个新版本，是少数始终保持活力的"老牌"语言。

### 二、C# 的核心特点

#### 1. 强类型 + 类型推断

C# 是强类型语言——每个变量都有明确类型，编译期检查类型错误。但通过 \`var\` 关键字，可以让编译器推断类型，写起来像动态语言一样简洁。

\`\`\`csharp
int x = 10;              // 显式类型
var name = "张三";         // 推断为 string
var numbers = new[] { 1, 2, 3 }; // 推断为 int[]
\`\`\`

#### 2. 自动垃圾回收

C# 不需要手动管理内存。.NET CLR（公共语言运行时）有垃圾回收器（GC），自动回收不再使用的对象。比 C++ 简单，比 Java 的 GC 调优更智能。

#### 3. 面向对象 + 函数式 + 异步

C# 是多范式语言：

- **面向对象**：类、继承、多态、接口。
- **函数式**：Lambda、LINQ、模式匹配、不可变类型（record）。
- **异步编程**：async/await 是 C# 的杀手锏特性。

#### 4. 跨平台

.NET 5+ 之后完全跨平台——Windows、Linux、macOS 都能跑。容器化部署也很方便。

#### 5. 性能优秀

.NET 8 的性能已经非常接近 C++ 和 Rust，远超 Java 和 Python。在 TechEmpower 基准测试中，ASP.NET Core 经常名列前茅。

### 三、C# 与同类语言对比

#### 1. C# vs Java

| 维度 | C# | Java |
| --- | --- | --- |
| 设计公司 | 微软 | Sun/Oracle |
| 运行平台 | .NET CLR | JVM |
| 语法现代性 | 持续演进（LINQ、async、record） | 保守，演进慢 |
| 属性语法 | \`int Age { get; set; }\` | \`getAge()\` / \`setAge()\` |
| 委托/事件 | 原生支持 | 需接口模拟 |
| LINQ | 原生强大 | Stream API（较弱） |
| 异步 | async/await（首创） | CompletableFuture（较繁琐） |
| 值类型 | struct（自定义值类型） | 只有基本类型是值类型 |
| 平台 | 跨平台（.NET 5+） | 跨平台（更早） |
| 主要场景 | Windows 桌面、Unity、ASP.NET | 企业后端、Android |

**结论**：语法上 C# 比 Java 更现代、更优雅。生态上各有优势。

#### 2. C# vs Python

| 维度 | C# | Python |
| --- | --- | --- |
| 类型系统 | 强类型，编译期检查 | 动态类型，运行期检查 |
| 性能 | 快（接近 C++） | 慢（解释执行） |
| 学习曲线 | 中等 | 简单 |
| 主要场景 | Windows、游戏、企业 | 数据科学、AI、脚本 |
| 工程化 | 强（IDE、类型、重构） | 弱（动态类型难重构） |

**结论**：Python 适合快速原型和 AI，C# 适合工程化和性能敏感场景。

#### 3. C# vs TypeScript

C# 和 TypeScript 都由 Anders Hejlsberg 设计，所以**语法高度相似**：

- 都是强类型。
- 都有接口、泛型、Lambda。
- 都有 async/await。

学过 C# 学 TypeScript 几乎零门槛，反之亦然。

### 四、.NET 平台核心概念

要理解 C#，必须先理解 .NET 平台。这是 C# 代码运行的"地基"。

#### 1. CLR（Common Language Runtime，公共语言运行时）

.NET 的运行时，类似 Java 的 JVM。负责：

- **代码执行**：将中间语言（IL）编译为机器码（JIT）。
- **内存管理**：垃圾回收（GC）。
- **类型安全**：运行时类型检查。
- **异常处理**：跨语言的异常机制。
- **线程管理**：线程池、任务并行库（TPL）。

#### 2. FCL（Framework Class Library，框架类库）

.NET 提供的海量类库，类似 Java 的标准库。包括：

- **基础类型**：String、Int32、Boolean 等。
- **集合**：List<T>、Dictionary<K,V>、HashSet<T> 等。
- **IO**：File、Stream、StreamReader 等。
- **网络**：HttpClient、TcpListener 等。
- **LINQ**：Language-Integrated Query。
- **异步**：Task、Task<T>、CancellationToken。
- **反射**：Type、MethodInfo 等。

#### 3. 编译流程

C# 代码不是直接编译成机器码，而是分两步：

\`\`\`
C# 源代码 (.cs)
   ↓ C# 编译器 (csc)
中间语言 (IL，.dll/.exe)
   ↓ CLR 的 JIT 编译器
机器码（运行时）
\`\`\`

**IL（Intermediate Language）** 是平台无关的中间语言。任何 .NET 语言（C#、F#、VB.NET）都编译成 IL，然后由 CLR 执行。这就是"跨语言互操作"的基础——C# 可以调用 F# 写的库。

#### 4. 程序集（Assembly）

程序集是 .NET 的部署单元，本质是 .dll（类库）或 .exe（可执行文件）。包含：

- IL 代码。
- 元数据（类型信息）。
- 资源（图片、字符串等）。

#### 5. NuGet 包管理

NuGet 是 .NET 的包管理器，类似 Node.js 的 npm、Python 的 pip、Java 的 Maven。通过 \`dotnet add package\` 安装第三方库。

### 五、开发环境搭建

#### 1. 安装 .NET SDK

**Windows**：从 [dot.net](https://dot.net) 下载安装包。

**macOS**：
\`\`\`bash
brew install --cask dotnet-sdk
\`\`\`

**Linux**（Ubuntu）：
\`\`\`bash
sudo apt install dotnet-sdk-8.0
\`\`\`

安装后验证：
\`\`\`bash
dotnet --version
\`\`\`

#### 2. 选择 IDE

- **Visual Studio 2022**（Windows，最强大）：企业级 IDE，调试、重构、模板齐全。
- **Visual Studio for Mac**（macOS，已停更）：2026 年后停止支持。
- **JetBrains Rider**（跨平台）：付费但强大，.NET 开发者最爱。
- **Visual Studio Code**（跨平台，免费）：轻量，配合 C# Dev Kit 扩展。
- **Cursor / Trae**：AI 辅助编程，搭配 C# 扩展。

本书推荐：Windows 用 VS 2022，Mac/Linux 用 Rider 或 VS Code。

#### 3. 命令行工具

.NET 提供强大的命令行工具 \`dotnet\`：

\`\`\`bash
# 创建控制台项目
dotnet new console -n MyApp

# 运行项目
dotnet run

# 添加 NuGet 包
dotnet add package Newtonsoft.Json

# 编译
dotnet build

# 发布
dotnet publish -c Release
\`\`\`

#### 4. 第一个项目结构

\`\`\`
MyApp/
├── MyApp.csproj    # 项目文件
├── Program.cs      # 主程序入口
└── obj/            # 编译中间文件
\`\`\`

**MyApp.csproj** 内容：
\`\`\`xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
</Project>
\`\`\`

**Program.cs** 内容（C# 9+ 顶级语句）：
\`\`\`csharp
Console.WriteLine("Hello, World!");
\`\`\`

就这么简单——一行代码就是一个完整程序。

### 六、本书的代码示例约定

为了让代码示例能在沙箱环境运行，本书示例遵循以下约定：

1. **使用顶级语句**：C# 9+ 特性，无需 \`class Program\` 和 \`static void Main\`。
2. **使用 .NET 8 / C# 12**：现代语法。
3. **每个示例独立可运行**：包含必要的 \`using\`。
4. **输出用 \`Console.WriteLine\`**：方便看到结果。

> 你可以在每章末尾的代码编辑器中修改示例并运行，观察输出变化。

### 七、本章小结

- C# 由微软 2000 年发布，Anders Hejlsberg 设计，吸收 C++/Java/VB 的优点。
- 演进迅速，目前最新 C# 12（2023），每版本都有新特性。
- 五大特点：强类型 + 类型推断、自动 GC、多范式、跨平台、高性能。
- 与 Java 相比更现代；与 Python 相比更工程化；与 TypeScript 语法相似。
- .NET 平台核心：CLR（运行时）、FCL（类库）、IL（中间语言）、程序集、NuGet。
- 开发环境：安装 .NET SDK + 选择 IDE（VS/Rider/VSCode）。
- 第一个项目：\`dotnet new console\` + \`dotnet run\`，C# 9+ 顶级语句让程序极简。

下一章，我们写第一个完整的 C# 程序，亲手跑起来。`,
  },

  // ============================================================
  // 第二章：第一个 C# 程序
  // ============================================================
  {
    id: 'csharp-ch02',
    group: '第一部分 基础入门',
    icon: '👋',
    title: '第一个 C# 程序',
    content: `## 第二章　第一个 C# 程序

理论讲够了，开始写代码。这一章带你看懂 C# 程序的基本结构，亲手写出第一个能运行的程序。

### 一、Hello World

#### 1. 最简版本（C# 9+ 顶级语句）

C# 9 引入"顶级语句"（top-level statements），让控制台程序极简：

\`\`\`csharp
Console.WriteLine("Hello, World!");
\`\`\`

就一行。这就是一个完整的 C# 程序。运行试试。

> 没有 \`class\`、\`Main\`、\`using\`——C# 9+ 之后这些都是可选的。

#### 2. 传统版本（C# 8 及更早）

在 C# 9 之前，所有 C# 程序都必须这样写：

\`\`\`csharp
using System;

namespace MyApp
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

这段代码包含：

- \`using System;\`——引入 System 命名空间。
- \`namespace MyApp\`——声明命名空间。
- \`class Program\`——声明类。
- \`static void Main(string[] args)\`——程序入口方法。
- \`Console.WriteLine(...)\`——输出到控制台。

#### 3. 顶级语句 vs 传统语法

| 维度 | 顶级语句（C# 9+） | 传统语法 |
| --- | --- | --- |
| 代码量 | 1 行 | 8 行 |
| 易读性 | 简洁 | 繁琐 |
| 限制 | 一个项目只能一个文件用 | 无限制 |
| 适用 | 简单脚本、学习、demo | 复杂项目、多入口 |

> 本书大部分示例用顶级语句，简洁易读。涉及面向对象时再用完整类语法。

### 二、控制台输入输出

#### 1. \`Console.WriteLine\`——输出并换行

\`\`\`csharp
Console.WriteLine("第一行");
Console.WriteLine("第二行");
\`\`\`

输出：
\`\`\`
第一行
第二行
\`\`\`

#### 2. \`Console.Write\`——输出不换行

\`\`\`csharp
Console.Write("Hello, ");
Console.Write("World!");
\`\`\`

输出：
\`\`\`
Hello, World!
\`\`\`

#### 3. 字符串插值（C# 6+）

用 \`$\` 前缀，类似 Python 的 f-string：

\`\`\`csharp
string name = "张三";
int age = 25;
Console.WriteLine($"我叫 {name}，今年 {age} 岁。");
\`\`\`

输出：
\`\`\`
我叫 张三，今年 25 岁。
\`\`\`

#### 4. 字符串格式化（传统方式）

用 \`string.Format\` 或 \`Console.WriteLine\` 的格式化：

\`\`\`csharp
string name = "李四";
int age = 30;
Console.WriteLine("我叫 {0}，今年 {1} 岁。", name, age);
\`\`\`

\`{0}\` 对应第一个参数，\`{1}\` 对应第二个。字符串插值是更现代的写法，但格式化在某些场景仍需要（如复用模板）。

#### 5. \`Console.ReadLine\`——读取一行输入

\`\`\`csharp
Console.Write("请输入你的名字：");
string name = Console.ReadLine();
Console.WriteLine($"你好，{name}！");
\`\`\`

> 在沙箱环境，输入功能可能受限，但代码语法是正确的。

### 三、注释

注释是代码的"说明书"，编译器会忽略。

#### 1. 单行注释

\`\`\`csharp
// 这是单行注释
int x = 10; // 行尾注释
\`\`\`

#### 2. 多行注释

\`\`\`csharp
/* 这是
   多行注释 */
int y = 20;
\`\`\`

#### 3. XML 文档注释

C# 特有的文档注释，用 \`///\`：

\`\`\`csharp
/// <summary>
/// 计算两个整数的和。
/// </summary>
/// <param name="a">第一个数</param>
/// <param name="b">第二个数</param>
/// <returns>两数之和</returns>
int Add(int a, int b) => a + b;
\`\`\`

XML 注释可以被工具提取成 API 文档（类似 Java 的 Javadoc）。

### 四、命名空间（namespace）

命名空间用于组织代码，避免类名冲突。类似 Java 的 package。

#### 1. 声明命名空间

\`\`\`csharp
namespace MyApp
{
    class User { }
    class Order { }
}
\`\`\`

#### 2. 引入命名空间

\`\`\`csharp
using System;
using System.Collections.Generic;

// 现在可以直接用 Console、List<T> 等
Console.WriteLine("Hello");
var list = new List<int>();
\`\`\`

#### 3. 文件范围命名空间（C# 10+）

C# 10 引入更简洁的写法：

\`\`\`csharp
namespace MyApp;  // 文件范围命名空间，结尾分号

class User { }
class Order { }
\`\`\`

等价于：
\`\`\`csharp
namespace MyApp
{
    class User { }
    class Order { }
}
\`\`\`

#### 4. 全局 using（C# 10+）

C# 10 引入全局 using，一次声明全项目可用：

\`\`\`csharp
// 在某个文件顶部（如 GlobalUsings.cs）
global using System;
global using System.Collections.Generic;
\`\`\`

之后所有文件都自动引入这些命名空间。控制台项目模板默认会生成一个 \`GlobalUsings.cs\`。

### 五、第一个完整示例

下面是一个综合示例，演示输出、输入、变量、字符串插值：

\`\`\`csharp
// 第一个完整的 C# 程序
string name = "C# 学习者";
int year = 2024;
string version = "C# 12";

Console.WriteLine($"欢迎，{name}！");
Console.WriteLine($"当前年份：{year}");
Console.WriteLine($"使用版本：{version}");
Console.WriteLine();

// 简单计算
int a = 10;
int b = 20;
int sum = a + b;
Console.WriteLine($"{a} + {b} = {sum}");
\`\`\`

输出：
\`\`\`
欢迎，C# 学习者！
当前年份：2024
使用版本：C# 12

10 + 20 = 30
\`\`\`

### 六、运行你的第一段代码

下面是可运行示例。点击"运行"按钮查看输出，也可以修改代码再运行：

\`\`\`csharp
using System;

Console.WriteLine("=== 我的第一个 C# 程序 ===");
Console.WriteLine();

// 输出基本信息
string name = "C# 学习者";
int year = 2024;
Console.WriteLine($"你好，{name}！");
Console.WriteLine($"现在是 {year} 年，正在学习 C# 12");

// 简单计算
int a = 15;
int b = 25;
Console.WriteLine();
Console.WriteLine($"计算示例：{a} + {b} = {a + b}");
Console.WriteLine($"计算示例：{a} * {b} = {a * b}");

// 输出一段分隔线
Console.WriteLine();
Console.WriteLine(new string('-', 30));
Console.WriteLine("程序结束，恭喜你写出第一个 C# 程序！");
\`\`\`

试着把 \`name\` 改成你的名字，把 \`a\` 和 \`b\` 改成其他数字，再运行看看结果。

### 七、本章小结

- C# 9+ 顶级语句让程序极简：一行 \`Console.WriteLine("Hello, World!");\` 就是一个完整程序。
- 传统语法包含 \`using\` / \`namespace\` / \`class\` / \`Main\`，适合复杂项目。
- \`Console.WriteLine\` 输出换行，\`Console.Write\` 不换行，\`Console.ReadLine\` 读取输入。
- 字符串插值 \`$\\"...\\"\` 是现代写法，类似 Python f-string。
- 三种注释：单行 \`//\`、多行 \`/* */\`、XML 文档 \`///\`。
- 命名空间 \`namespace\` 组织代码，\`using\` 引入命名空间。
- C# 10+ 新特性：文件范围命名空间、全局 using。

下一章讲变量与数据类型——这是任何编程语言的根基。`,
  },

  // ============================================================
  // 第三章：变量与数据类型
  // ============================================================
  {
    id: 'csharp-ch03',
    group: '第一部分 基础入门',
    icon: '📦',
    title: '变量与数据类型',
    content: `## 第三章　变量与数据类型

变量是存储数据的"容器"，数据类型决定容器能装什么。这一章讲 C# 的变量声明、值类型与引用类型、常用数据类型、类型转换——这是写 C# 代码的根基。

### 一、变量声明

#### 1. 显式类型声明

\`\`\`csharp
int age = 25;
string name = "张三";
double price = 9.99;
bool isActive = true;
\`\`\`

格式：\`类型 变量名 = 值;\`

#### 2. var 隐式类型（C# 3+）

\`\`\`csharp
var age = 25;           // 推断为 int
var name = "张三";       // 推断为 string
var price = 9.99;       // 推断为 double
var numbers = new[] { 1, 2, 3 };  // 推断为 int[]
\`\`\`

\`var\` 让编译器根据右侧值推断类型。**注意**：

- \`var\` 是编译期推断，运行时仍是强类型——不能改类型。
- 必须在声明时初始化（\`var x;\` 是错的）。
- 适合复杂类型（如 LINQ 查询结果），简单类型用显式声明更清晰。

#### 3. 常量 const

\`\`\`csharp
const double Pi = 3.14159;
const string AppName = "MyApp";
// Pi = 3.14; // 错误：常量不能修改
\`\`\`

\`const\` 声明的常量在编译期确定，不可修改。

#### 4. 只读 readonly

\`\`\`csharp
class Config
{
    public readonly string Version;
    public Config(string v) { Version = v; }
}
\`\`\`

\`readonly\` 在运行时确定（如构造函数中），之后不可修改。比 \`const\` 灵活。

### 二、值类型与引用类型

这是 C# 类型系统的核心概念，必须搞清。

#### 1. 值类型（Value Type）

**存储**：变量直接存储数据本身。

**包括**：
- 所有数值类型（int、double、bool 等）。
- 结构体（struct）。
- 枚举（enum）。
- 可空类型（int? 等）。

**特点**：
- 赋值时复制值。
- 存储在栈（stack）上（通常）。
- 离开作用域自动回收。

\`\`\`csharp
int a = 10;
int b = a;  // 复制值
b = 20;
Console.WriteLine(a);  // 10，a 不变
Console.WriteLine(b);  // 20
\`\`\`

#### 2. 引用类型（Reference Type）

**存储**：变量存储对象的引用（地址），对象本身在堆（heap）上。

**包括**：
- 类（class）。
- 字符串（string，特殊引用类型，行为像值类型）。
- 数组（array）。
- 接口（interface）。
- 委托（delegate）。

**特点**：
- 赋值时复制引用，不复制对象。
- 存储在堆上，由 GC 回收。

\`\`\`csharp
class Person
{
    public string Name;
}

var p1 = new Person { Name = "张三" };
var p2 = p1;  // 复制引用，p1 和 p2 指向同一个对象
p2.Name = "李四";
Console.WriteLine(p1.Name);  // 李四！p1 也变了
\`\`\`

#### 3. string 的特殊性

string 是引用类型，但行为像值类型——赋值时不会"互相影响"：

\`\`\`csharp
string s1 = "hello";
string s2 = s1;
s2 = "world";
Console.WriteLine(s1);  // hello，s1 不变
\`\`\`

这是因为 string 是**不可变**的——每次修改其实是创建新对象。

### 三、常用数据类型

#### 1. 整数类型

| 类型 | 范围 | 大小 | 后缀 |
| --- | --- | --- | --- |
| \`sbyte\` | -128 ~ 127 | 1 字节 |  |
| \`byte\` | 0 ~ 255 | 1 字节 |  |
| \`short\` | -32768 ~ 32767 | 2 字节 |  |
| \`ushort\` | 0 ~ 65535 | 2 字节 |  |
| \`int\` | -21亿 ~ 21亿 | 4 字节 |  |
| \`uint\` | 0 ~ 42亿 | 4 字节 | \`u\` 或 \`U\` |
| \`long\` | 很大 | 8 字节 | \`l\` 或 \`L\` |
| \`ulong\` | 0 ~ 很大 | 8 字节 | \`ul\` 或 \`UL\` |

**默认**：整数默认是 \`int\`，需要长整型用 \`L\` 后缀。

\`\`\`csharp
int a = 100;
long b = 10000000000L;  // 必须加 L
uint c = 100u;
\`\`\`

#### 2. 浮点类型

| 类型 | 精度 | 大小 | 后缀 |
| --- | --- | --- | --- |
| \`float\` | 7 位有效数字 | 4 字节 | \`f\` 或 \`F\` |
| \`double\` | 15-16 位 | 8 字节 | \`d\` 或 \`D\`（可省） |
| \`decimal\` | 28-29 位 | 16 字节 | \`m\` 或 \`M\` |

**默认**：浮点默认是 \`double\`，需要 float 用 \`f\`，需要 decimal 用 \`m\`。

\`\`\`csharp
double pi = 3.14;
float f = 3.14f;       // 必须加 f
decimal money = 99.99m;  // 必须加 m
\`\`\`

> **金融计算用 decimal**，不用 float/double——后者有精度误差。

#### 3. 布尔类型

\`\`\`csharp
bool isTrue = true;
bool isFalse = false;
\`\`\`

C# 的 bool 不能与 0/1 互转（与 C/C++ 不同）。

#### 4. 字符类型

\`\`\`csharp
char c = 'A';
char newLine = '\\n';
\`\`\`

char 用单引号，是 16 位 Unicode。

#### 5. 字符串

\`\`\`csharp
string s1 = "hello";
string s2 = "world";
string s3 = s1 + " " + s2;  // 拼接
string s4 = $"{s1} {s2}";    // 插值
\`\`\`

字符串详细内容见后续章节。

#### 6. object 类型

\`object\` 是所有类型的基类（包括值类型）：

\`\`\`csharp
object o1 = 10;       // 装箱
object o2 = "hello";
object o3 = new Person();

int n = (int)o1;     // 拆箱
\`\`\`

但实际开发中尽量不用 object，用泛型更好。

### 四、可空类型

值类型默认不能为 null。但有时需要"没有值"的语义，就用可空类型。

#### 1. Nullable<T> 简写 T?

\`\`\`csharp
int? age = null;       // 可空 int
bool? flag = null;     // 可空 bool
DateTime? date = null; // 可空日期
\`\`\`

\`int?\` 是 \`Nullable<int>\` 的简写。

#### 2. 检查 null

\`\`\`csharp
int? age = null;

if (age.HasValue)
{
    Console.WriteLine(age.Value);
}
else
{
    Console.WriteLine("没有值");
}

// 或直接判断
if (age != null) { ... }
\`\`\`

#### 3. 空合并运算符 ??

\`\`\`csharp
int? age = null;
int actualAge = age ?? 0;  // age 为 null 则用 0
\`\`\`

#### 4. 空条件运算符 ?.

\`\`\`csharp
Person p = null;
string name = p?.Name;  // p 为 null 时不抛异常，返回 null
string upper = p?.Name?.ToUpper();  // 链式调用
\`\`\`

### 五、类型转换

#### 1. 隐式转换（安全，自动）

小类型 → 大类型，不丢精度：

\`\`\`csharp
int a = 10;
double b = a;   // int → double，自动
long c = a;     // int → long，自动
\`\`\`

#### 2. 显式转换（强制，可能丢精度）

大类型 → 小类型，需要强制转换：

\`\`\`csharp
double d = 3.14;
int i = (int)d;  // 3，截断小数

long l = 1000000;
int j = (int)l;  // 可能溢出
\`\`\`

#### 3. Parse 与 TryParse

字符串转数值：

\`\`\`csharp
string s = "123";
int n1 = int.Parse(s);  // 解析失败抛异常

if (int.TryParse(s, out int n2))
{
    Console.WriteLine($"解析成功：{n2}");
}
else
{
    Console.WriteLine("解析失败");
}
\`\`\`

实际开发用 TryParse 更安全。

#### 4. Convert 类

\`\`\`csharp
string s = "3.14";
double d = Convert.ToDouble(s);
int i = Convert.ToInt32("100");
\`\`\`

#### 5. 装箱与拆箱

值类型 ↔ object：

\`\`\`csharp
int x = 10;
object o = x;     // 装箱（值 → 引用）
int y = (int)o;   // 拆箱（引用 → 值）
\`\`\`

装箱有性能开销，避免在热路径使用。

### 六、类型转换示例

下面示例演示各种类型转换：

\`\`\`csharp
using System;

// 整数类型
int a = 100;
long b = a;            // 隐式转换
double c = a;          // 隐式转换

Console.WriteLine($"int a = {a}");
Console.WriteLine($"long b = {b}");
Console.WriteLine($"double c = {c}");

// 显式转换（可能丢精度）
double pi = 3.99;
int intPi = (int)pi;
Console.WriteLine($"double {pi} → int {intPi}");

// 字符串转换
string numStr = "42";
if (int.TryParse(numStr, out int parsed))
{
    Console.WriteLine($"字符串 \"{numStr}\" 解析为 {parsed}");
}

// 可空类型
int? age = null;
Console.WriteLine($"age 有值吗？{age.HasValue}");
Console.WriteLine($"age 默认值：{age ?? 0}");

// decimal 用于金额
decimal price = 99.99m;
Console.WriteLine($"价格：{price:C}");
\`\`\`

输出：
\`\`\`
int a = 100
long b = 100
double c = 100
double 3.99 → int 3
字符串 "42" 解析为 42
age 有值吗？False
age 默认值：0
价格：¥99.99
\`\`\`

### 七、命名规范

C# 命名采用 **PascalCase**（每个单词首字母大写）和 **camelCase**（首单词小写，后续首字母大写）。

| 元素 | 规范 | 示例 |
| --- | --- | --- |
| 类、方法、属性 | PascalCase | \`class UserAccount\` \`GetUserName()\` |
| 局部变量、参数 | camelCase | \`int userAge\` \`string firstName\` |
| 私有字段 | _camelCase | \`private int _count\` |
| 常量 | PascalCase | \`const double Pi = 3.14\` |
| 接口 | I + PascalCase | \`interface IEnumerable\` |
| 命名空间 | PascalCase | \`namespace MyApp.Services\` |

### 八、本章小结

- 变量声明：显式类型 \`int x = 10;\` 或隐式 \`var x = 10;\`（编译期推断）。
- \`const\` 编译期常量，\`readonly\` 运行时常量。
- **值类型**直接存储数据（int、struct、enum），赋值复制值。
- **引用类型**存储引用（class、string、array），赋值复制引用。
- string 是特殊引用类型，不可变，行为像值类型。
- 常用类型：整数（int/long）、浮点（double/decimal）、bool、char、string、object。
- 浮点默认 double，float 加 \`f\`，decimal 加 \`m\`。**金额用 decimal**。
- 可空类型 \`T?\` 用 \`??\` 和 \`?.\` 处理 null。
- 类型转换：隐式（安全）、显式（强制）、Parse/TryParse、Convert、装箱拆箱。
- 命名规范：PascalCase（类、方法、属性）、camelCase（变量、参数）。

下一章讲运算符与表达式——把变量"运算"起来。`,
  },

  // ============================================================
  // 第四章：运算符与表达式
  // ============================================================
  {
    id: 'csharp-ch04',
    group: '第一部分 基础入门',
    icon: '⚙️',
    title: '运算符与表达式',
    content: `## 第四章　运算符与表达式

运算符是"对数据做什么操作"的符号，表达式是用运算符连接起来的式子。这一章讲 C# 的各类运算符、运算优先级、表达式。

### 一、算术运算符

#### 1. 基本算术

\`\`\`csharp
int a = 10, b = 3;
Console.WriteLine(a + b);  // 13 加
Console.WriteLine(a - b);  // 7  减
Console.WriteLine(a * b);  // 30 乘
Console.WriteLine(a / b);  // 3  除（整数除法截断）
Console.WriteLine(a % b);  // 1  取余
\`\`\`

**注意整数除法**：\`10 / 3\` 结果是 \`3\`，不是 \`3.333\`。要浮点结果需转换：

\`\`\`csharp
double result = (double)a / b;  // 3.333...
\`\`\`

#### 2. 自增自减

\`\`\`csharp
int x = 5;
x++;  // x = 6，等价于 x = x + 1
x--;  // x = 5，等价于 x = x - 1

// 前缀 vs 后缀
int y = x++;  // y = 5, x = 6（先用后加）
int z = ++x;  // z = 7, x = 7（先加后用）
\`\`\`

#### 3. 复合赋值

\`\`\`csharp
int n = 10;
n += 5;  // n = n + 5 = 15
n -= 3;  // n = 12
n *= 2;  // n = 24
n /= 4;  // n = 6
n %= 4;  // n = 2
\`\`\`

### 二、关系运算符

返回 bool，用于比较：

\`\`\`csharp
int a = 10, b = 20;
Console.WriteLine(a == b);  // False 等于
Console.WriteLine(a != b);  // True  不等于
Console.WriteLine(a > b);   // False 大于
Console.WriteLine(a < b);   // True  小于
Console.WriteLine(a >= b);  // False 大于等于
Console.WriteLine(a <= b);  // True  小于等于
\`\`\`

**注意字符串比较**：用 \`==\` 比较内容，不是引用：

\`\`\`csharp
string s1 = "hello";
string s2 = "hello";
Console.WriteLine(s1 == s2);  // True（比较内容）
\`\`\`

### 三、逻辑运算符

\`\`\`csharp
bool a = true, b = false;
Console.WriteLine(a && b);  // False 与（短路）
Console.WriteLine(a || b);  // True  或（短路）
Console.WriteLine(!a);      // False 非
\`\`\`

**短路求值**：

\`\`\`csharp
string name = null;
// && 短路：name 为 null 时不调用 .Length，避免 NullReferenceException
if (name != null && name.Length > 0)
{
    Console.WriteLine("有名字");
}
\`\`\`

### 四、位运算符

直接操作二进制位：

\`\`\`csharp
int a = 0b1100;  // 12
int b = 0b1010;  // 10
Console.WriteLine(a & b);   // 8  (1000) 与
Console.WriteLine(a | b);   // 14 (1110) 或
Console.WriteLine(a ^ b);   // 6  (0110) 异或
Console.WriteLine(~a);      // -13 取反
Console.WriteLine(a << 2);  // 48 左移 2 位
Console.WriteLine(a >> 1);  // 6  右移 1 位
\`\`\`

实际开发中位运算常用于：标志位、权限、性能优化。

### 五、赋值运算符

\`\`\`csharp
int x = 10;       // 简单赋值
x += 5;          // 复合赋值
x = x + 1;       // 等价于 x++
\`\`\`

### 六、字符串运算符

\`\`\`+\` 用于字符串拼接：

\`\`\`csharp
string s1 = "Hello";
string s2 = "World";
string s3 = s1 + " " + s2;  // "Hello World"
\`\`\`

但频繁拼接用 \`StringBuilder\` 性能更好（后续章节讲）。

### 七、空相关运算符（C# 6+）

#### 1. 空合并 ?? 

\`\`\`csharp
string name = null;
string displayName = name ?? "匿名";  // name 为 null 用 "匿名"
\`\`\`

#### 2. 空合并赋值 ??=（C# 8+）

\`\`\`csharp
string name = null;
name ??= "默认名";  // name 为 null 时赋值
\`\`\`

#### 3. 空条件 ?.

\`\`\`csharp
string name = null;
int? length = name?.Length;  // name 为 null 时返回 null，不抛异常
\`\`\`

### 八、类型运算符

#### 1. is 运算符

检查对象是否是某类型：

\`\`\`csharp
object o = "hello";
if (o is string)
{
    Console.WriteLine("是字符串");
}

// C# 7+ 模式匹配
if (o is string s)
{
    Console.WriteLine($"字符串长度：{s.Length}");
}
\`\`\`

#### 2. as 运算符

安全转换类型，失败返回 null：

\`\`\`csharp
object o = "hello";
string s = o as string;  // 转换成功
int? n = o as int?;      // 失败，返回 null（int? 才能为 null）
\`\`\`

#### 3. typeof 运算符

获取类型的 Type 对象：

\`\`\`csharp
Type t = typeof(string);
Console.WriteLine(t.FullName);  // System.String
\`\`\`

### 九、运算符综合示例

\`\`\`csharp
using System;

// 算术
Console.WriteLine("=== 算术运算 ===");
int a = 10, b = 3;
Console.WriteLine($"a = {a}, b = {b}");
Console.WriteLine($"a + b = {a + b}");
Console.WriteLine($"a / b = {a / b}（整数除法）");
Console.WriteLine($"a / (double)b = {a / (double)b:F2}（浮点除法）");
Console.WriteLine($"a % b = {a % b}");

// 关系
Console.WriteLine("\\n=== 关系运算 ===");
Console.WriteLine($"a > b: {a > b}");
Console.WriteLine($"a == b: {a == b}");

// 逻辑
Console.WriteLine("\\n=== 逻辑运算 ===");
bool x = true, y = false;
Console.WriteLine($"x && y: {x && y}");
Console.WriteLine($"x || y: {x || y}");
Console.WriteLine($"!x: {!x}");

// 空相关
Console.WriteLine("\\n=== 空相关运算 ===");
string name = null;
string displayName = name ?? "匿名";
Console.WriteLine($"name ?? \\"匿名\\": {displayName}");

// 字符串插值
Console.WriteLine($"name?.Length: {name?.Length}");
\`\`\`

运行后输出：
\`\`\`
=== 算术运算 ===
a = 10, b = 3
a + b = 13
a / b = 3（整数除法）
a / (double)b = 3.33（浮点除法）
a % b = 1

=== 关系运算 ===
a > b: True
a == b: False

=== 逻辑运算 ===
x && y: False
x || y: True
!x: False

=== 空相关运算 ===
name ?? "匿名": 匿名
name?.Length: 
\`\`\`

### 十、运算符优先级

从高到低（部分）：

1. 括号 \`()\`
2. 自增自减 \`++ --\`
3. 算术 \`* / %\` → \`+ -\`
4. 关系 \`> < >= <=\` → \`\`== !=\`
5. 逻辑 \`&&\` → \`||\`
6. 赋值 \`= += -= *=\`

\`\`\`csharp
int result = 2 + 3 * 4;     // 14，先算 3*4
int result2 = (2 + 3) * 4;  // 20，括号优先
\`\`\`

**建议**：复杂表达式用括号明确优先级，不要靠记忆。

### 十一、表达式与语句

- **表达式**（expression）：有值的式子，如 \`a + b\`、\`x > 0\`。
- **语句**（statement）：执行一个动作，以分号结尾，如 \`int x = 10;\`。

\`\`\`csharp
// 表达式
5 + 3
x > 0
Math.Sqrt(2)

// 语句
int x = 5 + 3;
if (x > 0) Console.WriteLine("正数");
\`\`\`

### 十二、本章小结

- 算术运算符：\`+ - * / %\`，注意整数除法截断。
- 自增自减 \`++ --\`，前缀先加后用，后缀先用后加。
- 复合赋值 \`+= -= *= /= %=\`。
- 关系运算符返回 bool：\`== != > < >= <=\`。
- 逻辑运算符 \`&& || !\`，短路求值。
- 位运算符 \`& | ^ ~ << >>\`。
- 空相关运算符：\`??\`（默认值）、\`??=\`（默认赋值）、\`?.\`（空条件）。
- 类型运算符：\`is\`（检查）、\`as\`（安全转换）、\`typeof\`（获取类型）。
- 运算符优先级：括号 > 单目 > 算术 > 关系 > 逻辑 > 赋值。
- 复杂表达式用括号明确优先级。

下一章讲控制流——让程序"做选择"和"重复"。`,
  },
];

export { chapters };
