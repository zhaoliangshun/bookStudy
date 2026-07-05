// =============================================================
// Go 交互式教程 - 第一批章节（前言 + 第一部分，共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   go-preface : 前言
//   go-ch01    : 第一章 Go 简介与环境搭建
//   go-ch02    : 第二章 第一个 Go 程序
//   go-ch03    : 第三章 变量与数据类型
//   go-ch04    : 第四章 运算符与表达式
//
// 本书为交互式教程，每章包含可运行的代码示例。
// 代码示例遵循 Go 1.22 语法。
// 每个示例都设计为可使用 \`go run\` 独立运行。
// =============================================================

const chapters = [
  // ============================================================
  // 前言
  // ============================================================
  {
    id: 'go-preface',
    group: '开篇',
    icon: '📖',
    title: '前言',
    content: `## 前言

### 一、为什么写这本教程

在编程语言的星空中，Go（又称 Golang）是一颗相对年轻却格外明亮的星。它诞生于 2009 年，由 Google 推出，短短十几年间便成为云原生时代的"母语"——Docker、Kubernetes、etcd、Prometheus、Terraform、CockroachDB、Hugo、Grafana……这些撑起现代基础设施的项目几乎清一色用 Go 编写。

这不是巧合。Go 抓住了时代脉搏：**多核 CPU 普及、分布式系统崛起、开发效率与运行效率需要同时兼顾**。在 Java 显得笨重、Python 显得缓慢、C++ 显得复杂的当下，Go 用极简的语法、原生并发、秒级编译和出色的部署体验，赢得了云时代基础设施开发者的心。

市面上 Go 教程不少，但常见两类问题：

- **要么太浅**：只讲语法、不讲设计哲学，读完不知道为什么 Go 这么设计。
- **要么太散**：罗列特性、缺乏主线，读者看完依然无法形成 Go 的"全貌"。

这本书尝试做到三件事：

1. **从语法到哲学**——不只讲 Go 怎么写，更讲 Go 为什么这样设计（少即是多、组合优于继承、显式优于隐式）。
2. **从原理到实践**——每个特性都给出"为什么"，并配可运行代码。
3. **聚焦常用 80%**——重点是日常开发会用到的 20% 知识，不堆砌冷僻特性。

> 如果你来自 Java、C#、Python、JavaScript，这本书会帮你快速建立 Go 的全貌，并理解它"反潮流"的设计取舍。

### 二、Go 的定位

Go 不是一门"全能"语言，它有明确的定位：

- **系统级应用语言**：介于 C/C++ 与脚本语言之间，既有接近 C 的性能，又有脚本语言的开发效率。
- **服务端 / 后端 / 云原生**：网络服务、API 网关、微服务、CLI 工具是 Go 的主战场。
- **基础设施**：容器、编排、监控、配置管理等"造轮子"领域是 Go 的强项。
- **命令行工具**：单二进制部署 + 秒级编译，让 Go 成为 CLI 工具首选。

Go **不适合**的场景：

- 数据科学 / 机器学习（生态远不如 Python）。
- 桌面 GUI（缺乏成熟框架）。
- 嵌入式 / 实时系统（GC 暂停不可控）。
- 浏览器前端（WebAssembly 支持有限）。

> 选语言不是选"最好的"，而是选"最合适的"。Go 在云原生和后端基础设施领域是当前最佳选择之一。

### 三、Go 与主流语言对比

#### 1. Go vs Java

| 维度 | Go | Java |
| --- | --- | --- |
| 诞生年份 | 2009 | 1995 |
| 设计公司 | Google | Sun/Oracle |
| 语法风格 | 极简、C-like | 繁复、面向对象正统 |
| 编译产物 | 单二进制，无依赖 | JAR + JVM 依赖 |
| 启动速度 | 毫秒级 | 秒级（需 JVM 预热） |
| 内存占用 | 几十 MB 起 | 几百 MB 起 |
| 并发模型 | goroutine + channel | 线程 + 锁 / JUC |
| 泛型 | 1.18 引入，较简单 | 成熟、强大 |
| 异常机制 | error 显式返回 | try/catch |
| 继承 | 无（组合代替） | 单继承 + 接口 |
| 部署 | 单文件、容器友好 | 镜像大、依赖多 |
| 生态 | 云原生无敌 | 企业后端霸主 |

**结论**：Java 适合大型企业应用，Go 适合云原生服务和 CLI 工具。

#### 2. Go vs C#

| 维度 | Go | C# |
| --- | --- | --- |
| 语法现代性 | 极简、保守 | 持续演进、特性丰富 |
| 泛型 | 简单 | 强大（约束、协变） |
| 异步 | goroutine（更轻量） | async/await |
| 面向对象 | 弱（无类、无继承） | 强（类、继承、多态） |
| 平台 | 跨平台 | .NET 跨平台 |
| 性能 | 接近 C | 接近 C++ |
| 学习曲线 | 平缓（语言小） | 中等（特性多） |
| 主要场景 | 后端、云原生、CLI | Windows、Unity、ASP.NET |

**结论**：C# 语法更现代、特性更全；Go 更简单、部署更轻。Go 适合后端微服务，C# 适合 Windows 生态和游戏。

#### 3. Go vs Python

| 维度 | Go | Python |
| --- | --- | --- |
| 类型系统 | 静态强类型 | 动态类型 |
| 性能 | 快（编译执行） | 慢（解释执行） |
| 并发 | 原生 goroutine | GIL 限制（多进程绕开） |
| 部署 | 单二进制 | 需 Python 环境 |
| 学习曲线 | 中等 | 极简 |
| 生态 | 云原生、后端 | 数据科学、AI |
| 工程化 | 强（类型、工具链） | 弱（动态类型难重构） |
| 代码量 | 较多（显式） | 极少（隐式） |

**结论**：Python 适合原型和 AI，Go 适合工程化和性能场景。两者经常搭配使用（Python 做模型、Go 做服务）。

#### 4. Go vs Rust

| 维度 | Go | Rust |
| --- | --- | --- |
| 内存安全 | GC 自动回收 | 所有权编译期保证 |
| 性能 | 高 | 极高（零成本抽象） |
| 学习曲线 | 平缓 | 陡峭 |
| 编译速度 | 极快 | 较慢 |
| 并发 | goroutine 简单 | async 复杂 |
| 适用场景 | 服务端、CLI | 系统级、嵌入式 |

**结论**：Go 简单易学，Rust 性能极致但学习成本高。Go 是"够用就好"，Rust 是"完美主义"。

### 四、Go 的设计哲学

Go 之父团队（Robert Griesemer、Rob Pike、Ken Thompson）在设计 Go 时贯彻了三大哲学：

#### 1. 少即是多（Less is more）

Go 故意"砍掉"了很多语言特性：

- 没有类的继承（用组合和接口代替）。
- 没有泛型（1.18 才引入，且刻意简化）。
- 没有异常（用 error 显式返回）。
- 没有 while（只有 for）。
- 没有运算符重载。
- 没有宏。

> 这些"缺失"不是缺陷，而是设计——减少认知负担、避免过度工程。

#### 2. 组合优于继承（Composition over inheritance）

Go 没有"类继承"的概念。复用代码靠：

- **嵌入（embedding）**：将一个 struct 嵌入另一个 struct，自动获得其字段和方法。
- **接口**：定义行为契约，鸭子类型。

这种"组合"比"继承"更灵活、更解耦。

#### 3. 显式优于隐式（Explicit over implicit）

- 错误必须显式处理（不处理会编译报错或被 lint 警告）。
- 类型转换必须显式（不允许隐式转换）。
- 导出符号首字母大写（可见性一目了然）。
- goroutine 通信用 channel，不隐藏在锁里。

> Go 的代码读起来"啰嗦"，但意图清晰——这是为团队协作和长期维护设计的。

### 五、适合人群

这本书适合：

- **后端开发者**：想从 Java/Python/Node.js 转 Go，做微服务。
- **运维 / DevOps**：想写 Kubernetes Operator、CLI 工具。
- **云原生从业者**：想读懂、修改 Docker/K8s 等项目源码。
- **有其他语言基础的开发者**：想快速上手 Go。

这本书**可能不适合**：

- 完全零基础的新手（建议先学 Python 或 JavaScript 入门编程）。
- 只做数据科学 / AI 的开发者（Python 生态更适合）。
- 追求语言特性极致的开发者（C# 或 Rust 更满足）。

### 六、阅读建议

#### 1. 全书结构

全书分为五大部分：

1. **第一部分：基础入门**——环境、第一个程序、变量与类型、运算符。
2. **第二部分：语法进阶**——控制流、函数、数组切片、字符串、结构体。
3. **第三部分：核心特性**——方法、接口、错误处理、单元测试。
4. **第四部分：并发编程**——goroutine、channel、select、并发模式、context。
5. **第五部分：实战与生态**——包管理、标准库、Web 开发、进阶路线。

#### 2. 阅读方法

- **先跑代码再读原理**：每章代码都可运行，建议先运行再看解释。
- **对比已有语言**：每学一个特性，对比你熟悉语言中的等价物。
- **动手改示例**：在编辑器中修改示例参数，观察输出变化。
- **不要跳过错误处理**：Go 的 error 是核心特性，不是细节。
- **接受"啰嗦"**：Go 故意要求显式，不要试图用框架"简化"它。

#### 3. 版本约定

本书使用 **Go 1.22**（2024 年 2 月发布），所有代码基于此版本。

- 支持泛型（1.18+）。
- \`range over int\`（1.22 新增）。
- 改进的循环变量作用域（1.22 修复了经典坑）。

#### 4. 配套工具

- **Go 官方工具链**：\`go\` 命令（run/build/test/mod）。
- **IDE 推荐**：VS Code + Go 扩展、GoLand（JetBrains）、Cursor / Trae（AI 辅助）。
- **在线运行**：[Go Playground](https://go.dev/play/) 可直接运行 Go 代码。

### 七、写给读者的话

Go 是一门"反潮流"的语言。在所有语言都在"加特性"的年代，Go 选择"减特性"。在所有语言都追求"语法糖"的年代，Go 选择"语法苦口良药"。这种取舍让 Go 看起来"古板"，但正是这种古板，让大型团队协作、长期维护变得可控。

如果你来自 Java，你会发现 Go 没有 Spring 那样庞大的生态，但你也无需应付 Spring 的复杂配置。如果你来自 Python，你会发现 Go 写起来"啰嗦"，但部署只需一个二进制文件。如果你来自 JavaScript，你会发现 Go 没有 npm 那样混乱的依赖，但有清晰的模块化。

> Go 不是"最好的语言"，但它是"最合适云时代的语言之一"。

愿你读完这本书后，能写出第一个 Go 程序，能看懂 Docker 的源码结构，能开始自己的第一个 Go 微服务。`,
  },

  // ============================================================
  // 第一章：Go 简介与环境搭建
  // ============================================================
  {
    id: 'go-ch01',
    group: '第一部分 基础入门',
    icon: '🚀',
    title: 'Go 简介与环境搭建',
    content: `## 第一章　Go 简介与环境搭建

要理解 Go，得先了解它的来历、设计目标、与同类语言的差异。这一章讲 Go 的诞生、版本演进、核心特性、与 Java/Python 的对比，以及开发环境的搭建。

### 一、Go 的诞生

#### 1. 诞生背景

Go 的故事始于 **2007 年 9 月**，在 Google 的 20% 时间项目中诞生。三位创始人都是计算机科学的"活化石"：

- **Robert Griesemer**：Google V8 引擎和 Java HotSpot 编译器的贡献者。
- **Rob Pike**：Unix、Plan 9、UTF-8 编码的共同发明人，图灵奖得主 Bell Labs 老兵。
- **Ken Thompson**：Unix 操作系统的发明人、C 语言的奠基者之一、1983 年图灵奖得主。

这个团队被内部称为 **"Goto 团队"**（Goto 是 Google 内部对他们的戏称）。

**诞生的契机**：当时 Google 内部面临一个严峻问题——C++ 编译一次要几十分钟到几小时，Java 启动慢、依赖 JVM、内存占用大。Google 的服务器规模爆炸式增长，但开发效率却跟不上业务发展。

Rob Pike 后来回忆：

> "我们在等一次 C++ 编译的时候，去喝咖啡，回来发现还没编完。我们想，'一定有更好的方式'。"

于是他们决定设计一门新语言，目标明确：

- **编译速度极快**：秒级编译，像脚本语言一样开发。
- **静态类型 + 高性能**：接近 C 的运行效率。
- **原生并发**：充分利用多核 CPU。
- **简单易学**：语言规范只有几十页。
- **工程化友好**：内置包管理、测试、格式化。

#### 2. 正式发布

- **2009 年 11 月 10 日**：Go 正式对外发布，开源。
- **2012 年 3 月**：Go 1.0 发布，承诺**向后兼容**（Go 1 兼容性承诺：1.x 的代码在后续 1.x 都能编译运行）。
- **2015 年 8 月**：Go 1.5 实现自举——Go 编译器本身用 Go 重写（之前用 C 写）。

> Go 1 兼容性承诺是 Go 成功的关键之一——它让企业敢于采用 Go，因为不用担心语言升级破坏现有代码。

#### 3. 为什么叫 Go / Golang

- **Go**：源自 Google 的 "G"，同时寓意 "Go" 这个动词——前进、行动。
- **Golang**：因为 \`go.dev\` 域名曾被占用，官网用了 \`golang.org\`（现已迁移到 \`go.dev\`）。社区习惯称 Golang 以避免与英文动词 "go" 混淆。

吉祥物是 **Gopher**（地鼠），由艺术家 Renée French 设计，成为 Go 社区的标志。

### 二、Go 的版本演进

Go 采用"半年一个版本"的节奏（2 月、8 月各一个版本）。下表是关键版本：

| 版本 | 年份 | 关键特性 |
| --- | --- | --- |
| Go 1.0 | 2012 | 基础语法、goroutine、channel、标准库 |
| Go 1.5 | 2015 | 自举、GC 重写（并发标记清除） |
| Go 1.7 | 2016 | context 包进入标准库 |
| Go 1.11 | 2018 | Go Modules（实验性） |
| Go 1.13 | 2019 | Go Modules 正式默认 |
| Go 1.16 | 2021 | \`embed\` 嵌入文件、io/fs 抽象 |
| Go 1.18 | 2022 | **泛型**、模糊测试、工作区 |
| Go 1.20 | 2023 | 编译器 PGO（性能引导优化） |
| Go 1.21 | 2023 | 内置函数 min/max/clear、log/slog |
| **Go 1.22** | **2024** | **range over int、修复循环变量作用域** |

> Go 1.22 修复了"循环变量捕获"这个 Go 最经典的坑——之前 \`for\` 循环中的变量会被复用，导致闭包捕获错误的值。1.22 之后每次迭代创建新变量。

### 三、Go 的核心特点

#### 1. 极简的语法

Go 的语言规范只有 50 多页（C++ 规范超过 1300 页）。关键字只有 25 个：

\`\`\`go
break  case  chan  const  continue  default  defer  else  fallthrough
for  func  go  goto  if  import  interface  map  package  range  return
select  struct  switch  type  var
\`\`\`

对比：Java 关键字 50 个，C++ 超过 90 个。

#### 2. 静态类型 + 类型推断

\`\`\`go
var x int = 10        // 显式类型
var y = 20            // 推断为 int
z := 30               // 短变量声明，推断为 int
\`\`\`

#### 3. 秒级编译

Go 编译速度极快——10 万行代码几秒编完。原因：

- **无头文件**（不像 C/C++）。
- **包依赖是 DAG（有向无环图）**，不允许循环依赖。
- **编译器简单**，不做复杂优化（牺牲一点性能换编译速度）。

#### 4. 单二进制部署

\`go build\` 生成单个可执行文件，**无任何外部依赖**。这是 Go 部署体验的杀手锏：

\`\`\`bash
go build -o myapp main.go
# 得到一个 myapp 可执行文件，直接复制到任何 Linux 服务器即可运行
\`\`\`

对比 Java：需要 JVM + JAR 包 + 各种依赖。对比 Python：需要 Python 解释器 + 依赖。

#### 5. 原生并发：goroutine + channel

Go 的并发模型是其最核心的特性：

\`\`\`go
package main

import (
    "fmt"
    "time"
)

func say(s string) {
    for i := 0; i < 3; i++ {
        fmt.Println(s)
        time.Sleep(100 * time.Millisecond)
    }
}

func main() {
    go say("Hello")  // 启动 goroutine
    go say("World")  // 启动另一个 goroutine
    time.Sleep(time.Second)
}
\`\`\`

**goroutine** 是 Go 的"轻量级线程"：

- 一个 goroutine 只占几 KB 栈空间（Java 线程要 1MB）。
- 可以轻松创建百万个 goroutine。
- 由 Go runtime 调度到 OS 线程上（M:N 调度）。

**channel** 用于 goroutine 间通信：

\`\`\`go
ch := make(chan int)  // 创建 channel
go func() {
    ch <- 42          // 发送
}()
v := <-ch             // 接收
\`\`\`

> Go 的并发哲学是：**"不要通过共享内存通信，而要通过通信共享内存"**（Don't communicate by sharing memory; share memory by communicating）。

#### 6. 自动垃圾回收（GC）

Go 内置并发 GC，特点：

- **并发标记清除**：与应用线程并发执行，暂停极短（通常 < 1ms）。
- **低延迟优先**：Go 团队把 GC 暂停时间压到亚毫秒级。
- **无需调优**：默认参数已足够好（不像 Java 需要调 G1/ZGC）。

#### 7. 跨平台

Go 支持交叉编译——在 macOS 上可以编译出 Linux/Windows 的二进制：

\`\`\`bash
# 在 macOS 上编译 Linux amd64 版本
GOOS=linux GOARCH=amd64 go build -o myapp main.go

# 编译 Windows 版本
GOOS=windows GOARCH=amd64 go build -o myapp.exe main.go

# 编译 ARM 树莓派版本
GOOS=linux GOARCH=arm go build -o myapp-arm main.go
\`\`\`

无需安装交叉编译工具链——这在 C/C++ 是不可想象的。

#### 8. 内置工具链

Go 自带完整工具链，无需第三方依赖：

- \`go run\`：直接运行。
- \`go build\`：编译。
- \`go test\`：测试。
- \`go fmt\`：格式化代码（强制统一风格）。
- \`go vet\`：静态检查。
- \`go mod\`：包管理。
- \`go doc\`：查看文档。
- \`go pprof\`：性能分析。
- \`go race\`：竞态检测器。

### 四、Go vs Java 深度对比

#### 1. 语法对比：Hello World

**Java**：
\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

**Go**：
\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
\`\`\`

Go 更简洁，没有 \`class\`、\`public\`、\`static\`、\`void\` 等冗余修饰。

#### 2. 并发对比

**Java 线程**：
\`\`\`java
new Thread(() -> System.out.println("Hello")).start();
\`\`\`

**Go goroutine**：
\`\`\`go
go func() {
    fmt.Println("Hello")
}()
\`\`\`

Java 线程是 OS 线程，创建成本高（1MB 栈）；Go goroutine 是用户态线程，2KB 栈起步。

#### 3. 错误处理对比

**Java 异常**：
\`\`\`java
try {
    readFile();
} catch (IOException e) {
    e.printStackTrace();
}
\`\`\`

**Go error**：
\`\`\`go
if err := readFile(); err != nil {
    fmt.Println(err)
}
\`\`\`

Go 强制显式处理错误，不能"忽略"。Java 异常可能被吞掉（catch 后不处理）。

#### 4. 部署对比

| 方面 | Go | Java |
| --- | --- | --- |
| 产物 | 单二进制（几 MB） | JAR + 依赖 |
| 运行依赖 | 无 | JVM |
| 启动时间 | 毫秒级 | 秒级 |
| 内存占用 | 几十 MB | 几百 MB |
| 容器镜像 | scratch / alpine（10 MB） | openjdk 镜像（几百 MB） |

#### 5. 生态对比

| 场景 | Go | Java |
| --- | --- | --- |
| Web 框架 | Gin、Echo、Fiber | Spring、Spring Boot |
| 微服务 | gRPC、Kitex | Spring Cloud、Dubbo |
| 云原生 | K8s、Docker、Prometheus | 较少 |
| 大数据 | 较少 | Hadoop、Spark、Flink |
| 企业应用 | 较少 | 绝对主流 |

### 五、Go vs Python 深度对比

#### 1. 性能对比

计算斐波那契数列（递归版）：

**Python**：
\`\`\`python
def fib(n):
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)

print(fib(35))  # 约 5 秒
\`\`\`

**Go**：
\`\`\`go
package main

import "fmt"

func fib(n int) int {
    if n < 2 {
        return n
    }
    return fib(n-1) + fib(n-2)
}

func main() {
    fmt.Println(fib(35))  // 约 0.5 秒
}
\`\`\`

Go 比 Python 快约 10 倍。

#### 2. 类型系统

**Python**（动态类型）：
\`\`\`python
x = 10          # int
x = "hello"     # 现在 string，运行期才报错
\`\`\`

**Go**（静态类型）：
\`\`\`go
x := 10         // int
x = "hello"     // 编译期报错
\`\`\`

静态类型让 IDE 重构、跳转、补全更可靠。

#### 3. 部署对比

| 方面 | Go | Python |
| --- | --- | --- |
| 产物 | 单二进制 | 源代码 + 依赖 |
| 运行依赖 | 无 | Python 解释器 |
| 虚拟环境 | 不需要 | venv / conda |
| 容器镜像 | 10 MB | 100+ MB |

### 六、开发环境搭建

#### 1. 安装 Go SDK

**macOS**：

方式一：使用 Homebrew
\`\`\`bash
brew install go
\`\`\`

方式二：官方安装包
从 [go.dev/dl](https://go.dev/dl/) 下载 \`go1.22.x.darwin-amd64.pkg\` 或 \`darwin-arm64.pkg\`，双击安装。

**Linux**（Ubuntu/Debian）：
\`\`\`bash
# 下载（以 1.22.0 为例）
wget https://go.dev/dl/go1.22.0.linux-amd64.tar.gz

# 解压到 /usr/local
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz

# 配置环境变量（写入 ~/.bashrc 或 ~/.zshrc）
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
\`\`\`

**Windows**：
- 下载 \`go1.22.x.windows-amd64.msi\`，双击安装。
- 默认安装到 \`C:\\Go\`，自动配置 PATH。

**验证安装**：
\`\`\`bash
go version
# 输出：go version go1.22.0 darwin/amd64
\`\`\`

#### 2. 配置环境变量

Go 主要靠以下环境变量（可通过 \`go env\` 查看）：

- **\`GOROOT\`**：Go 安装目录（含标准库、编译器）。一般不用手动设置。
- **\`GOPATH\`**：旧的工作目录（Go Modules 之前）。现在主要存放 \`bin\`、\`pkg\`。
- **\`GOPROXY\`**：模块代理。国内推荐设置：
  \`\`\`bash
  go env -w GOPROXY=https://goproxy.cn,direct
  \`\`\`
- **\`GO111MODULE\`**：模块开关。Go 1.16+ 默认 \`on\`。
- **\`GOPRIVATE\`**：私有仓库匹配（不走公共代理）。

#### 3. GOPATH vs GOROOT vs Go Modules

这是 Go 初学者最容易混淆的概念，必须厘清：

**GOROOT**：
- Go SDK 的安装目录。
- 包含 \`bin/\`（go 命令）、\`src/\`（标准库源码）、\`pkg/\`（预编译的标准库）。
- 类比 Java：相当于 \`JAVA_HOME\`。

**GOPATH**（历史概念）：
- Go 1.11 之前，所有 Go 代码必须在 \`$GOPATH/src\` 下。
- 第三方包下载到 \`$GOPATH/src\`，编译产物在 \`$GOPATH/bin\` 和 \`$GOPATH/pkg\`。
- **缺点**：项目必须在固定目录、无法管理版本、无法同时依赖一个库的多个版本。

**Go Modules**（Go 1.11+ 引入，1.16+ 默认）：
- 现代包管理方案，**取代 GOPATH**。
- 项目可以放在任何地方。
- 通过 \`go.mod\` 文件声明依赖及版本。
- 类比 Java：相当于 Maven 的 \`pom.xml\`、Node.js 的 \`package.json\`。

> **现在的项目**：直接用 Go Modules，GOPATH 只用于存放 \`go install\` 的全局工具二进制。不要再把项目放在 \`$GOPATH/src\` 下。

#### 4. 创建第一个 Go Module

\`\`\`bash
# 创建项目目录
mkdir myapp
cd myapp

# 初始化 Go Module
go mod init example.com/myapp

# 此时生成 go.mod 文件：
# module example.com/myapp
# go 1.22
\`\`\`

\`go.mod\` 文件示例：
\`\`\`
module example.com/myapp

go 1.22

require (
    github.com/gin-gonic/gin v1.9.1
)
\`\`\`

#### 5. 选择 IDE

主流 IDE/编辑器：

- **VS Code + Go 扩展**：免费、轻量、生态丰富。本书推荐。
- **GoLand**（JetBrains）：付费、最强大、开箱即用。
- **Cursor / Trae**：AI 辅助编程，搭配 Go 扩展。
- **Vim / Neovim**：配置 \`vim-go\` 插件。
- **Sublime Text**：轻量，配合 LSP。

本书推荐：新手用 VS Code，企业用 GoLand。

VS Code 安装 Go 扩展后，会自动安装相关工具链（gopls、dlv 等）：

\`\`\`bash
# 手动触发工具链安装
go install github.com/go-delve/delve/cmd/dlv@latest
\`\`\`

### 七、go 命令详解

Go 的 \`go\` 命令是统一的工具入口。常用子命令：

#### 1. go run

直接编译并运行，不保留产物：
\`\`\`bash
go run main.go
# 或多个文件
go run .
\`\`\`

适合：开发调试、运行小脚本。

#### 2. go build

编译生成二进制：
\`\`\`bash
# 编译当前目录，生成与目录同名的二进制
go build

# 指定输出名
go build -o myapp main.go

# 交叉编译 Linux amd64
GOOS=linux GOARCH=amd64 go build -o myapp-linux

# 减小体积（去除调试信息）
go build -ldflags="-s -w" -o myapp main.go
\`\`\`

#### 3. go install

编译并安装到 \`$GOPATH/bin\`：
\`\`\`bash
go install example.com/some-tool@latest
\`\`\`

适合：安装命令行工具（如 \`golangci-lint\`）。

#### 4. go test

运行测试：
\`\`\`bash
go test ./...           # 测试所有包
go test -v              # 详细输出
go test -run TestFoo    # 只跑匹配的测试
go test -bench=.        # 跑基准测试
go test -cover          # 测试覆盖率
go test -race           # 竞态检测
\`\`\`

#### 5. go mod

模块管理：
\`\`\`bash
go mod init example.com/myapp    # 初始化
go mod tidy                       # 整理依赖（添加缺失、删除多余）
go mod download                   # 下载依赖到缓存
go mod verify                     # 校验依赖完整性
go mod graph                       # 依赖图
go mod why github.com/gin-gonic/gin  # 为什么依赖
\`\`\`

#### 6. go get / go install 获取依赖

\`\`\`bash
# Go 1.16 之前：go get
go get github.com/gin-gonic/gin@v1.9.1

# Go 1.16+ 推荐：go get 只用于添加依赖，go install 用于安装工具
go get github.com/gin-gonic/gin@latest
go install github.com/golangci/golangci-lint/cmd/golangci-lint@v1.55.0
\`\`\`

#### 7. go fmt / go vet / gofmt

\`\`\`bash
# 格式化代码（Go 强制统一风格，无分歧）
gofmt -w main.go
# 或
go fmt ./...

# 静态检查
go vet ./...
\`\`\`

> Go 的 \`gofmt\` 强制统一缩进（tab）、空格、换行——这消除了团队"代码风格之争"。

#### 8. go doc / godoc

\`\`\`bash
# 查看包文档
go doc fmt
go doc fmt.Println
go doc -all fmt
\`\`\`

#### 9. go env / go version

\`\`\`bash
go version
go env
go env GOPATH
go env -w GOPROXY=https://goproxy.cn,direct
\`\`\`

#### 10. go clean / go list

\`\`\`bash
go clean -cache     # 清理编译缓存
go clean -modcache  # 清理模块缓存
go list ./...       # 列出所有包
go list -m all      # 列出所有依赖
\`\`\`

### 八、第一个 Go 程序预览

创建项目并写一个简单程序：

\`\`\`bash
mkdir hello
cd hello
go mod init example.com/hello
\`\`\`

创建 \`main.go\`：

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
    fmt.Println("Welcome to cloud-native world.")
}
\`\`\`

运行：
\`\`\`bash
go run main.go
\`\`\`

输出：
\`\`\`
Hello, Go!
Welcome to cloud-native world.
\`\`\`

编译：
\`\`\`bash
go build -o hello
./hello
\`\`\`

### 九、Go 的运行机制

#### 1. 编译流程

Go 是**编译型语言**，但内部经历两步：

\`\`\`
Go 源代码 (.go)
   ↓ go build
机器码（原生二进制）
   ↓ 直接执行
\`\`\`

不同于 Java（先编译成字节码，再 JVM 解释/JIT）。Go 直接编译成机器码，启动快、性能高。

#### 2. Go runtime

虽然 Go 编译成原生二进制，但二进制内嵌了 **Go runtime**：

- **调度器**：goroutine 的 M:N 调度。
- **GC**：垃圾回收器。
- **内存分配器**：TCMalloc 算法。
- **网络轮询器**：netpoller，基于 epoll/kqueue/IOCP。

所以 Go 二进制比 C 大（包含 runtime），但部署更简单。

#### 3. 启动流程

\`go run\` 实际做了三步：

1. 编译 \`main.go\` 为临时二进制（在 \`/tmp\`）。
2. 运行这个二进制。
3. 退出后删除。

\`go build\` 只做第 1 步，保留产物。

### 十、本书代码约定

为了让示例可运行，约定如下：

1. **使用 Go 1.22 语法**。
2. **每个示例都是完整程序**：\`package main\` + \`func main()\`。
3. **输出用 \`fmt.Println\` / \`fmt.Printf\`**。
4. **示例可直接 \`go run main.go\`**。
5. **不依赖第三方库**（除非必要）。

> 你可以在每章末尾的代码编辑器中修改示例并运行，观察输出变化。

### 十一、常见问题

#### Q1: Go 适合做 Web 开发吗？

适合。Gin、Echo、Fiber 等框架很成熟，性能优秀。但如果你需要 Spring 那样的"全家桶"，Go 的生态确实不如 Java。

#### Q2: Go 有 ORM 吗？

有，如 GORM、ent、sqlx。但 Go 社区更倾向"接近 SQL"的方式（sqlx、pgx），不像 Java/Python 那样依赖重型 ORM。

#### Q3: Go 没有 try/catch，怎么处理错误？

用 \`error\` 类型显式返回。这看起来"啰嗦"，但能强制开发者思考错误处理，比 try/catch 吞掉异常更工程化。

#### Q4: Go 什么时候用泛型？

Go 1.18+ 支持泛型。但 Go 团队建议"非必要不用"——简单场景用 interface 和具体类型即可。泛型主要适用于通用容器、算法库。

#### Q5: Go 比 Rust 好吗？

没有"更好"。Go 简单易学、生态成熟、部署简单；Rust 性能极致、内存安全无 GC。Go 是"工程实用主义"，Rust 是"完美主义"。

### 十二、本章小结

- Go 由 Google 三巨头（Robert Griesemer、Rob Pike、Ken Thompson）于 2007 年设计，2009 年发布。
- 核心目标：编译快、性能高、原生并发、简单易学。
- 关键特性：极简语法、静态类型、goroutine/channel、并发 GC、单二进制、交叉编译、内置工具链。
- 与 Java 相比：更轻、更快启动、更适合云原生；与 Python 相比：更快、更工程化。
- 开发环境：安装 Go SDK + 配置 GOPROXY + 选择 IDE（VS Code/GoLand）。
- 包管理：Go Modules（\`go.mod\`）取代 GOPATH，项目可放任意位置。
- \`go\` 命令是统一入口：\`run\`/\`build\`/\`test\`/\`mod\`/\`fmt\`/\`vet\`。
- 第一个程序：\`go mod init\` + \`main.go\` + \`go run\`。

下一章，我们逐行拆解第一个 Go 程序，理解每个关键字的含义。`,
  },

  // ============================================================
  // 第二章：第一个 Go 程序
  // ============================================================
  {
    id: 'go-ch02',
    group: '第一部分 基础入门',
    icon: '👋',
    title: '第一个 Go 程序',
    content: `## 第二章　第一个 Go 程序

上一章装好了环境，这一章我们逐行拆解 Go 程序的结构，理解每个关键字的含义，并学习如何编译、运行、传递命令行参数。

### 一、Hello World 详解

#### 1. 最简版本

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
\`\`\`

运行：
\`\`\`bash
go run main.go
\`\`\`

输出：
\`\`\`
Hello, World!
\`\`\`

#### 2. 逐行拆解

**第一行：\`package main\`**

\`package\` 关键字声明这个文件属于哪个包。Go 程序由包组成，每个 \`.go\` 文件第一行非注释必须是 \`package\`。

\`main\` 是特殊包名——表示这是一个**可执行程序**的入口包。其他包名（如 \`fmt\`、\`net/http\`）是库包，不能直接运行。

> 规则：**只有 \`package main\` 包含 \`func main()\` 时，才能用 \`go run\` / \`go build\` 生成可执行文件**。

**第二行：\`import "fmt"\`**

\`import\` 导入其他包。\`fmt\` 是 Go 标准库的格式化输入输出包（format 的缩写）。

- 单个导入：\`import "fmt"\`
- 多个导入：
  \`\`\`go
  import (
      "fmt"
      "os"
      "strings"
  )
  \`\`\`
- 别名导入：
  \`\`\`go
  import f "fmt"   // 别名 f
  // 后续用 f.Println
  \`\`\`
- 仅副作用导入（只执行包的 \`init()\`，不引用）：
  \`\`\`go
  import _ "net/http/pprof"
  \`\`\`
- 点导入（直接用包内符号，不推荐）：
  \`\`\`go
  import . "fmt"
  // 后续直接 Println
  \`\`\`

> Go 不允许导入未使用的包——编译会报错。这是 Go 工程化的体现。

**第三行：\`func main()\`**

\`func\` 关键字声明函数。\`main\` 是入口函数名，**无参数、无返回值**。

- Go 程序从 \`main\` 包的 \`main\` 函数开始执行。
- \`main\` 函数不接收 \`args\` 参数（与 C/Java 不同），命令行参数通过 \`os.Args\` 获取。

**第四行：\`fmt.Println("Hello, World!")\`**

调用 \`fmt\` 包的 \`Println\` 函数，输出字符串并换行。

- \`Println\`：输出并换行。
- \`Print\`：输出不换行。
- \`Printf\`：格式化输出（不换行）。

注意：**Go 的函数名首字母大小写决定可见性**：

- \`Println\` 首字母大写 → **导出**（外部包可调用）。
- \`println\` 首字母小写 → **未导出**（仅包内可调用）。

> 这是 Go 独特的可见性规则——**没有 \`public\`/\`private\` 关键字，靠首字母大小写**。

#### 3. 完整可运行示例

\`\`\`go
package main

import (
    "fmt"
    "os"
)

func main() {
    fmt.Println("Hello, World!")
    fmt.Println("Go version:", os.Getenv("GOROOT"))
    
    // 输出多个值
    fmt.Println("姓名:", "张三", "年龄:", 25)
    
    // 格式化输出
    fmt.Printf("Pi = %.2f\\n", 3.14159)
    fmt.Printf("二进制 %b = 十进制 %d\\n", 10, 10)
}
\`\`\`

运行结果：
\`\`\`
Hello, World!
Go version: /usr/local/go
姓名: 张三 年龄: 25
Pi = 3.14
二进制 1010 = 十进制 10
\`\`\`

### 二、go run vs go build vs go install

三者都能"运行" Go 代码，但有差异：

#### 1. go run

\`\`\`bash
go run main.go
\`\`\`

- **作用**：编译 + 运行，不保留二进制。
- **适用**：开发调试、运行脚本。
- **产物**：临时文件（在 \`/tmp\` 或系统临时目录）。
- **多个文件**：\`go run .\` 或 \`go run main.go util.go\`。

#### 2. go build

\`\`\`bash
go build
go build -o myapp main.go
\`\`\`

- **作用**：编译生成可执行二进制。
- **适用**：生产部署。
- **产物**：当前目录的二进制文件（与目录同名，或 \`-o\` 指定）。
- **不运行**：只编译，需要手动执行。

示例：
\`\`\`bash
go build -o hello main.go
./hello
\`\`\`

#### 3. go install

\`\`\`bash
go install
go install example.com/some-tool@latest
\`\`\`

- **作用**：编译并安装到 \`$GOPATH/bin\`（或 \`$GOBIN\`）。
- **适用**：安装命令行工具。
- **产物**：\`$GOPATH/bin/myapp\`，可直接全局调用。

对比表：

| 命令 | 编译 | 运行 | 保留产物 | 产物位置 | 主要用途 |
| --- | --- | --- | --- | --- | --- |
| \`go run\` | 是 | 是 | 否 | 临时目录 | 开发调试 |
| \`go build\` | 是 | 否 | 是 | 当前目录 | 生产部署 |
| \`go install\` | 是 | 否 | 是 | \`$GOPATH/bin\` | 安装工具 |

### 三、编译产物详解

#### 1. 默认产物

\`\`\`bash
go build
\`\`\`

生成与**当前目录名**同名的二进制（不是 \`main.go\`）。

例如目录 \`/home/user/hello/\`：
\`\`\`bash
$ ls
go.mod  main.go
$ go build
$ ls
go.mod  hello  main.go
$ ./hello
Hello, World!
\`\`\`

#### 2. 指定产物名

\`\`\`bash
go build -o myapp
go build -o myapp.exe main.go
go build -o bin/myapp
\`\`\`

#### 3. 减小体积

Go 二进制默认较大（含 runtime + 调试信息）。用 \`-ldflags\` 去除调试信息：

\`\`\`bash
go build -ldflags="-s -w" -o myapp
\`\`\`

- \`-s\`：去除符号表。
- \`-w\`：去除 DWARF 调试信息。

效果：从 10 MB → 7 MB 左右。

#### 4. 交叉编译

\`\`\`bash
# macOS 上编译 Linux amd64
GOOS=linux GOARCH=amd64 go build -o myapp-linux

# macOS 上编译 Windows amd64
GOOS=windows GOARCH=amd64 go build -o myapp.exe

# 编译 ARM64（M1 Mac、AWS Graviton）
GOOS=linux GOARCH=arm64 go build -o myapp-arm64

# 查看所有支持的平台
go tool dist list
\`\`\`

常见 GOOS：\`linux\`、\`darwin\`（macOS）、\`windows\`、\`freebsd\`。
常见 GOARCH：\`amd64\`、\`arm64\`、\`386\`、\`arm\`。

> CGO 默认禁用交叉编译（需要 C 编译器）。如果代码用了 CGO，需要额外配置。

#### 5. 编译优化（PGO）

Go 1.21+ 支持 **PGO（Profile Guided Optimization）**：

\`\`\`bash
# 1. 先构建带 pprof 的版本
go build -o myapp

# 2. 运行并收集 profile
./myapp -cpuprofile=cpu.prof

# 3. 用 profile 重新编译
go build -pgo=cpu.prof -o myapp-pgo
\`\`\`

PGO 可提升 2%-7% 性能。

### 四、命令行参数：os.Args

Go 程序默认不通过 \`main\` 参数接收命令行，而是通过 \`os.Args\` 读取。

#### 1. 基本用法

\`\`\`go
package main

import (
    "fmt"
    "os"
)

func main() {
    // os.Args 是 []string，第一个元素是程序名
    fmt.Println("程序名:", os.Args[0])
    fmt.Println("参数个数:", len(os.Args)-1)
    
    for i, arg := range os.Args {
        fmt.Printf("Args[%d] = %s\\n", i, arg)
    }
}
\`\`\`

运行：
\`\`\`bash
go run main.go hello world 123
\`\`\`

输出：
\`\`\`
程序名: /tmp/go-buildxxx/main
参数个数: 3
Args[0] = /tmp/go-buildxxx/main
Args[1] = hello
Args[2] = world
Args[3] = 123
\`\`\`

#### 2. 校验参数

\`\`\`go
package main

import (
    "fmt"
    "os"
)

func main() {
    if len(os.Args) < 2 {
        fmt.Println("用法: hello <名字>")
        os.Exit(1)
    }
    
    name := os.Args[1]
    fmt.Printf("你好, %s!\\n", name)
}
\`\`\`

#### 3. os.Exit 退出码

- \`os.Exit(0)\`：正常退出。
- \`os.Exit(1)\`：错误退出（非零）。
- \`os.Exit\` 不会执行 \`defer\`——谨慎使用。

\`\`\`go
package main

import (
    "fmt"
    "os"
)

func main() {
    if len(os.Args) < 2 {
        fmt.Fprintln(os.Stderr, "错误：缺少参数")
        os.Exit(2)  // 2 表示参数错误
    }
    fmt.Println("参数:", os.Args[1])
}
\`\`\`

> \`fmt.Fprintln(os.Stderr, ...)\` 输出到标准错误流，便于区分正常输出和错误信息。

### 五、flag 包：标准命令行参数

\`os.Args\` 太原始，实战中用 \`flag\` 包——支持类型、默认值、说明、\`-h\` 帮助。

#### 1. 基本用法

\`\`\`go
package main

import (
    "flag"
    "fmt"
)

func main() {
    // 定义参数
    name := flag.String("name", "World", "问候对象")
    age := flag.Int("age", 18, "年龄")
    married := flag.Bool("married", false, "是否已婚")
    
    // 解析（必须调用）
    flag.Parse()
    
    fmt.Printf("姓名: %s\\n", *name)
    fmt.Printf("年龄: %d\\n", *age)
    fmt.Printf("已婚: %v\\n", *married)
}
\`\`\`

运行：
\`\`\`bash
go run main.go -name=张三 -age=25 -married
\`\`\`

输出：
\`\`\`
姓名: 张三
年龄: 25
已婚: true
\`\`\`

查看帮助：
\`\`\`bash
go run main.go -h
\`\`\`

输出：
\`\`\`
Usage of /tmp/go-build/main:
  -age int
        年龄 (default 18)
  -married
        是否已婚
  -name string
        问候对象 (default "World")
\`\`\`

#### 2. flag 的工作机制

- \`flag.String("name", "默认值", "说明")\` 返回 \`*string\`（指针）。
- \`flag.Int\` 返回 \`*int\`。
- \`flag.Bool\` 返回 \`*bool\`。
- \`flag.Parse()\` 解析命令行参数。
- 必须在 \`Parse()\` 之后才能读取参数值。

#### 3. 使用变量绑定

\`\`\`go
package main

import (
    "flag"
    "fmt"
)

var (
    port    int
    host    string
    debug   bool
)

func init() {
    flag.IntVar(&port, "port", 8080, "服务端口")
    flag.StringVar(&host, "host", "0.0.0.0", "监听地址")
    flag.BoolVar(&debug, "debug", false, "调试模式")
}

func main() {
    flag.Parse()
    
    fmt.Printf("服务将启动在 %s:%d (debug=%v)\\n", host, port, debug)
}
\`\`\`

#### 4. 子命令（Go 1.16+ 支持）

\`\`\`go
package main

import (
    "flag"
    "fmt"
    "os"
)

func main() {
    if len(os.Args) < 2 {
        fmt.Println("用法: myapp <command> [args]")
        fmt.Println("命令: start, stop, status")
        os.Exit(1)
    }
    
    switch os.Args[1] {
    case "start":
        startCmd()
    case "stop":
        stopCmd()
    case "status":
        statusCmd()
    default:
        fmt.Println("未知命令:", os.Args[1])
        os.Exit(1)
    }
}

func startCmd() {
    fs := flag.NewFlagSet("start", flag.ExitOnError)
    port := fs.Int("port", 8080, "端口")
    fs.Parse(os.Args[2:])
    fmt.Printf("启动服务，端口 %d\\n", *port)
}

func stopCmd() {
    fmt.Println("停止服务")
}

func statusCmd() {
    fmt.Println("服务状态：运行中")
}
\`\`\`

运行：
\`\`\`bash
go run main.go start -port=9090
# 启动服务，端口 9090

go run main.go status
# 服务状态：运行中
\`\`\`

### 六、程序结构详解

#### 1. 文件 → 包 → 模块

Go 的代码组织层级：

- **文件**（\`.go\`）：单个源文件，包含一个 \`package\` 声明。
- **包**（package）：同目录下所有 \`.go\` 文件属于同一包。
- **模块**（module）：\`go.mod\` 定义的项目根，包含多个包。

示例结构：
\`\`\`
myapp/
├── go.mod                 # 模块声明
├── main.go                # package main
├── util/
│   ├── util.go            # package util
│   └── util_test.go       # package util（测试）
└── api/
    └── handler.go         # package api
\`\`\`

\`go.mod\`：
\`\`\`
module example.com/myapp

go 1.22
\`\`\`

#### 2. 多文件包

同一个目录下的多个 \`.go\` 文件属于同一个包，可以互相调用：

\`main.go\`：
\`\`\`go
package main

import "fmt"

func main() {
    sayHello()
    fmt.Println(add(3, 5))
}
\`\`\`

\`util.go\`（同目录）：
\`\`\`go
package main

import "fmt"

func sayHello() {
    fmt.Println("Hello!")
}

func add(a, b int) int {
    return a + b
}
\`\`\`

运行：
\`\`\`bash
go run .   # 用 . 表示当前目录所有文件
\`\`\`

#### 3. 包的导入路径

\`\`\`go
import (
    "fmt"                              // 标准库
    "os"                               // 标准库
    "strings"                          // 标准库
    "example.com/myapp/util"           // 本模块内包
    "github.com/gin-gonic/gin"         // 第三方
)
\`\`\`

导入路径 = 模块路径 + 包的相对路径。

### 七、init 函数

每个包可以有 \`init()\` 函数，在 \`main()\` 之前自动执行：

\`\`\`go
package main

import "fmt"

func init() {
    fmt.Println("init 1")
}

func init() {
    fmt.Println("init 2")
}

func main() {
    fmt.Println("main")
}
\`\`\`

输出：
\`\`\`
init 1
init 2
main
\`\`\`

特点：
- 同一文件可以有多个 \`init\`，按声明顺序执行。
- 同一包多个文件的 \`init\` 按文件名字典序执行。
- 不同包的 \`init\` 按依赖图拓扑序执行。
- \`init\` 无参数、无返回值。
- 主要用于：初始化全局变量、注册驱动、加载配置。

执行顺序：
\`\`\`
导入的包的 init() → 当前包的 init() → main()
\`\`\`

### 八、注释与文档

#### 1. 单行注释

\`\`\`go
// 这是单行注释
fmt.Println("Hello") // 行尾注释
\`\`\`

#### 2. 多行注释

\`\`\`go
/*
这是多行注释
可以跨行
*/
fmt.Println("Hello")
\`\`\`

#### 3. 文档注释

Go 的文档由注释自动生成。规范：

- 紧邻声明（无空行）的注释会成为该声明的文档。
- 以名字开头。

\`\`\`go
// Add 返回两个整数的和。
func Add(a, b int) int {
    return a + b
}

// Person 表示一个人。
type Person struct {
    Name string
    Age  int
}
\`\`\`

查看：
\`\`\`bash
go doc Add
go doc Person
\`\`\`

> Go 没有 Javadoc / JSDoc 那样的标记语法（\`@param\`、\`@return\`）——保持简单。

### 九、格式化输出 fmt 详解

#### 1. Println 系列

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println("Hello", "World")    // 空格分隔，换行
    fmt.Print("Hello", "World")      // 空格分隔，不换行
    fmt.Print("Hello\\n")             // 手动换行
}
\`\`\`

#### 2. Printf 格式化

常用格式化动词：

| 动词 | 含义 | 示例 |
| --- | --- | --- |
| \`%v\` | 默认格式 | \`fmt.Printf("%v", p)\` |
| \`%+v\` | 字段名+值 | \`{Name:张三 Age:25}\` |
| \`%#v\` | Go 语法表示 | \`main.Person{Name:"张三"}\` |
| \`%T\` | 类型 | \`main.Person\` |
| \`%d\` | 整数 | \`42\` |
| \`%b\` | 二进制 | \`101010\` |
| \`%o\` | 八进制 | \`52\` |
| \`%x\` | 十六进制 | \`2a\` |
| \`%c\` | 字符 | \`A\` |
| \`%f\` | 浮点 | \`3.14\` |
| \`%e\` | 科学计数 | \`3.14e+00\` |
| \`%s\` | 字符串 | \`hello\` |
| \`%q\` | 带引号字符串 | \`"hello"\` |
| \`%t\` | 布尔 | \`true\` |
| \`%p\` | 指针地址 | \`0xc0000140a0\` |

完整示例：
\`\`\`go
package main

import "fmt"

func main() {
    name := "张三"
    age := 25
    pi := 3.14159
    
    fmt.Printf("姓名: %s\\n", name)
    fmt.Printf("年龄: %d 岁\\n", age)
    fmt.Printf("Pi: %.2f\\n", pi)
    fmt.Printf("二进制 %d = %b\\n", age, age)
    fmt.Printf("类型: %T\\n", name)
    
    type Person struct{ Name string; Age int }
    p := Person{"张三", 25}
    fmt.Printf("%%v:   %v\\n", p)
    fmt.Printf("%%+v:  %+v\\n", p)
    fmt.Printf("%%#v:  %#v\\n", p)
}
\`\`\`

输出：
\`\`\`
姓名: 张三
年龄: 25 岁
Pi: 3.14
二进制 25 = 11001
类型: string
%v:   {张三 25}
%+v:  {Name:张三 Age:25}
%#v:  main.Person{Name:"张三", Age:25}
\`\`\`

#### 3. Sprintf / Sprintln

格式化到字符串（不输出）：

\`\`\`go
package main

import "fmt"

func main() {
    s := fmt.Sprintf("姓名:%s, 年龄:%d", "张三", 25)
    fmt.Println(s)
    // 姓名:张三, 年龄:25
    
    s2 := fmt.Sprintln("Hello", "World")
    fmt.Print(s2)
    // Hello World
}
\`\`\`

#### 4. Fprintf

格式化到 \`io.Writer\`（如文件、网络）：

\`\`\`go
package main

import (
    "fmt"
    "os"
)

func main() {
    fmt.Fprintf(os.Stdout, "写到 stdout: %d\\n", 42)
    fmt.Fprintf(os.Stderr, "写到 stderr: %d\\n", 99)
}
\`\`\`

### 十、输入：fmt.Scan / bufio

#### 1. fmt.Scan 系列

\`\`\`go
package main

import "fmt"

func main() {
    var name string
    var age int
    
    fmt.Print("请输入姓名: ")
    fmt.Scan(&name)
    
    fmt.Print("请输入年龄: ")
    fmt.Scan(&age)
    
    fmt.Printf("你好 %s, 你 %d 岁\\n", name, age)
}
\`\`\`

- \`fmt.Scan\`：空格分隔，遇空格停。
- \`fmt.Scanln\`：换行分隔。
- \`fmt.Scanf\`：格式化输入。

#### 2. bufio.Reader 读取整行

\`\`\`go
package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

func main() {
    reader := bufio.NewReader(os.Stdin)
    
    fmt.Print("请输入一行: ")
    line, _ := reader.ReadString('\\n')
    line = strings.TrimSpace(line)
    
    fmt.Println("你输入了:", line)
}
\`\`\`

### 十一、实战：可配置的打招呼程序

综合运用本章知识：

\`\`\`go
package main

import (
    "flag"
    "fmt"
    "os"
    "strings"
)

// greet 向指定的人打招呼
func greet(name, lang string) string {
    switch strings.ToLower(lang) {
    case "en", "english":
        return fmt.Sprintf("Hello, %s!", name)
    case "zh", "chinese", "中文":
        return fmt.Sprintf("你好，%s！", name)
    case "ja", "japanese":
        return fmt.Sprintf("こんにちは、%s！", name)
    case "fr", "french":
        return fmt.Sprintf("Bonjour, %s!", name)
    default:
        return fmt.Sprintf("Hi, %s!", name)
    }
}

func main() {
    name := flag.String("name", "World", "问候对象")
    lang := flag.String("lang", "en", "语言 (en/zh/ja/fr)")
    upper := flag.Bool("upper", false, "是否大写")
    flag.Parse()
    
    if *name == "" {
        fmt.Fprintln(os.Stderr, "错误：name 不能为空")
        os.Exit(1)
    }
    
    msg := greet(*name, *lang)
    if *upper {
        msg = strings.ToUpper(msg)
    }
    fmt.Println(msg)
}
\`\`\`

运行：
\`\`\`bash
go run main.go -name=张三 -lang=zh
# 你好，张三！

go run main.go -name=alice -lang=en -upper
# HELLO, ALICE!
\`\`\`

### 十二、常见错误与排查

#### 1. main 包 / main 函数缺失

\`\`\`go
package hello   // 不是 main

func main() {}
\`\`\`

错误：\`go run: cannot run non-main package\`

解决：改为 \`package main\`。

#### 2. 导入未使用包

\`\`\`go
import (
    "fmt"
    "os"   // 未使用
)
\`\`\`

错误：\`imported and not used: "os"\`

解决：删除未用导入，或加 \`_\`：\`import _ "os"\`。

#### 3. 未使用变量

\`\`\`go
func main() {
    x := 10   // 未使用
}
\`\`\`

错误：\`x declared and not used\`

解决：使用 \`x\`，或用 \`_ = x\` 显式忽略。

#### 4. 大括号位置

Go 强制左大括号不换行：

\`\`\`go
// 错误（编译失败）
func main()
{
}

// 正确
func main() {
}
\`\`\`

错误：\`syntax error: unexpected semicolon or newline before {\`

> 这是 \`gofmt\` 的规定——避免风格之争。

### 十三、本章小结

- Go 程序结构：\`package main\` + \`import\` + \`func main()\`。
- \`main\` 包 + \`main\` 函数 = 可执行程序入口。
- 首字母大写 = 导出，首字母小写 = 未导出（包内可见）。
- \`go run\` 开发调试、\`go build\` 编译部署、\`go install\` 安装工具。
- 编译产物是**单二进制**，无外部依赖，支持交叉编译。
- 命令行参数：\`os.Args\`（原始）或 \`flag\` 包（标准）。
- \`flag\` 支持 String/Int/Bool 等类型、默认值、自动生成 \`-h\` 帮助。
- 多文件包：同目录多 \`.go\` 文件属同包，可互相调用。
- \`init()\` 在 \`main()\` 前执行，用于初始化。
- 注释自动生成文档（\`go doc\`）。
- \`fmt\` 包：\`Println\`/\`Printf\`/\`Sprintf\`/\`Fprintf\`。
- 格式化动词：\`%v\`/\`%d\`/\`%s\`/\`%T\`/\`%+v\` 等。

下一章讲变量与数据类型——Go 的类型系统比想象的丰富。`,
  },

  // ============================================================
  // 第三章：变量与数据类型
  // ============================================================
  {
    id: 'go-ch03',
    group: '第一部分 基础入门',
    icon: '📦',
    title: '变量与数据类型',
    content: `## 第三章　变量与数据类型

Go 是静态强类型语言——每个变量在编译期就有明确类型。这一章讲变量声明、基本类型、零值、类型转换、常量、字符串、UTF-8 与 rune。

### 一、变量声明

Go 有多种变量声明方式，各有适用场景。

#### 1. var 关键字

\`\`\`go
package main

import "fmt"

func main() {
    var a int          // 只声明，零值
    var b int = 10     // 声明并初始化
    var c = 20         // 推断类型（int）
    var d, e int = 1, 2 // 多变量同类型
    var f, g = 1, "hi" // 多变量不同类型
    
    fmt.Println(a, b, c, d, e, f, g)
}
\`\`\`

输出：
\`\`\`
0 10 20 1 2 1 hi
\`\`\`

#### 2. 短变量声明 :=

\`\`\`\`go
func main() {
    x := 10           // 等价 var x = 10
    y, z := 1, "hi"   // 多变量
    
    fmt.Println(x, y, z)
}
\`\`\`

**\`:=\` 的限制**：

- **只能在函数内部**（不能在包级别）。
- **左侧至少有一个新变量**，否则编译错误。

\`\`\`go
package main

import "fmt"

x := 10   // 错误：包级别不能用 :=

func main() {
    y := 20  // 正确：函数内
    fmt.Println(x, y)
}
\`\`\`

#### 3. 多变量重声明

\`\`\`go
func main() {
    x := 1
    y := 2
    
    x, y = y, x       // 交换值
    
    x, z := 10, 20   // x 已存在（赋值），z 是新变量（声明）
    
    fmt.Println(x, y, z)
}
\`\`\`

#### 4. 包级变量

\`\`\`go
package main

import "fmt"

var (
    version = "1.0.0"
    count   = 0
    debug   = false
)

func main() {
    fmt.Println(version, count, debug)
}
\`\`\`

#### 5. var vs := 何时用

- **包级别**：必须用 \`var\`。
- **函数内零值变量**：用 \`var x int\`（更明确类型）。
- **函数内带初始值**：用 \`x := 10\`（更简洁）。
- **类型不明确时**：用 \`var x int = 10\`（显式类型）。

> Go 风格指南建议：函数内带初始值的变量用 \`:=\`，更简洁。

### 二、基本数据类型

Go 的基本类型比想象的多。下表是完整列表：

#### 1. 整数类型

| 类型 | 范围 | 字节 | 说明 |
| --- | --- | --- | --- |
| \`int8\` | -128 ~ 127 | 1 | 有符号 8 位 |
| \`int16\` | -32768 ~ 32767 | 2 | 有符号 16 位 |
| \`int32\` | -21亿 ~ 21亿 | 4 | 有符号 32 位 |
| \`int64\` | -922京 ~ 922京 | 8 | 有符号 64 位 |
| \`int\` | 平台相关 | 4 或 8 | 最常用，64 位系统上是 int64 |
| \`uint8\` | 0 ~ 255 | 1 | 无符号 8 位（同 byte） |
| \`uint16\` | 0 ~ 65535 | 2 | 无符号 16 位 |
| \`uint32\` | 0 ~ 42亿 | 4 | 无符号 32 位 |
| \`uint64\` | 0 ~ 1844京 | 8 | 无符号 64 位 |
| \`uint\` | 平台相关 | 4 或 8 | 无符号 int |
| \`uintptr\` | - | - | 存指针，用于 unsafe |

> 实战 90% 场景用 \`int\` 即可。特定场景（网络协议、文件格式）才用 \`int32\`/\`int64\`。

\`\`\`go
package main

import (
    "fmt"
    "math"
)

func main() {
    var a int = 42
    var b int8 = 127
    var c uint8 = 255
    
    fmt.Println(a, b, c)
    
    // int 的最大值（64 位系统是 int64）
    fmt.Println("int max:", math.MaxInt64)
    fmt.Println("int32 max:", math.MaxInt32)
    fmt.Println("uint8 max:", math.MaxUint8)
}
\`\`\`

#### 2. 浮点类型

| 类型 | 字节 | 精度 | 范围 |
| --- | --- | --- | --- |
| \`float32\` | 4 | 7 位有效数字 | ±3.4e38 |
| \`float64\` | 8 | 15-16 位有效数字 | ±1.8e308 |

\`\`\`go
package main

import (
    "fmt"
    "math"
)

func main() {
    var f1 float32 = 3.14
    var f2 float64 = 3.14159265358979
    
    fmt.Println(f1, f2)
    fmt.Println("Pi:", math.Pi)
    fmt.Println("float32 max:", math.MaxFloat32)
    fmt.Println("float64 max:", math.MaxFloat64)
    
    // 科学计数法
    var e = 1.5e3   // 1500
    var m = 1.5e-3   // 0.0015
    fmt.Println(e, m)
}
\`\`\`

> 实战默认用 \`float64\`。\`float32\` 用于图形、嵌入式等内存敏感场景。

#### 3. 布尔类型

\`\`\`go
package main

import "fmt"

func main() {
    var b bool = true
    var c bool       // 零值 false
    
    fmt.Println(b, c)
    
    // 表达式结果是 bool
    fmt.Println(3 > 2)
    fmt.Println(5 == 5)
    fmt.Println(true && false)
    fmt.Println(true || false)
    fmt.Println(!true)
}
\`\`\`

#### 4. 字符串类型

\`\`\`go
package main

import "fmt"

func main() {
    var s string = "Hello, Go"
    s2 := "世界"
    
    fmt.Println(s, s2)
    fmt.Println("长度:", len(s), len(s2))
    
    // 字符串拼接
    s3 := s + " " + s2
    fmt.Println(s3)
    
    // 多行字符串（反引号）
    s4 := \`这是一个
多行字符串
包含换行\`
    fmt.Println(s4)
}
\`\`\`

注意：\`len(s2)\` 返回**字节数**，不是字符数。"世界" 的 \`len\` 是 6（UTF-8 编码每个汉字 3 字节）。

#### 5. byte 与 rune

- \`byte\`：\`uint8\` 的别名，表示一个字节。
- \`rune\`：\`int32\` 的别名，表示一个 Unicode 码点。

\`\`\`go
package main

import "fmt"

func main() {
    var b byte = 'A'      // 65
    var r rune = '世'     // 19990
    
    fmt.Println(b, r)
    fmt.Printf("b = %c (code %d)\\n", b, b)
    fmt.Printf("r = %c (code %d)\\n", r, r)
}
\`\`\`

#### 6. 类型别名一览

| 别名 | 真实类型 | 用途 |
| --- | --- | --- |
| \`byte\` | \`uint8\` | 字节数据 |
| \`rune\` | \`int32\` | Unicode 字符 |
| \`int\` | 平台 int | 通用整数 |

### 三、零值

Go 没有"未初始化"的变量——所有变量声明后自动有**零值**：

| 类型 | 零值 |
| --- | --- |
| \`int\`/\`uint\` 等 | \`0\` |
| \`float32\`/\`float64\` | \`0.0\` |
| \`bool\` | \`false\` |
| \`string\` | \`""\`（空字符串） |
| 指针 | \`nil\` |
| 切片 / map / channel | \`nil\` |
| 函数 / 接口 | \`nil\` |
| 数组 | 每个元素的零值 |
| 结构体 | 每个字段的零值 |

\`\`\`go
package main

import "fmt"

type Person struct {
    Name string
    Age  int
}

func main() {
    var i int
    var f float64
    var b bool
    var s string
    var p *int
    var arr [3]int
    var person Person
    
    fmt.Println(i)       // 0
    fmt.Println(f)       // 0
    fmt.Println(b)       // false
    fmt.Println(s)       // ""
    fmt.Println(p)       // <nil>
    fmt.Println(arr)     // [0 0 0]
    fmt.Println(person)  // { 0}
}
\`\`\`

> Go 没有"未定义值"——这避免了 C/C++ 中"未初始化变量是随机值"的经典 bug。

### 四、类型转换

Go **没有隐式类型转换**——所有转换必须显式。

#### 1. 数值之间

\`\`\`go
package main

import "fmt"

func main() {
    var i int = 42
    var f float64 = float64(i)   // int → float64
    var j int = int(f)            // float64 → int（截断小数）
    
    fmt.Println(i, f, j)
    
    // 不同 int 之间也要显式
    var a int32 = 100
    var b int64 = int64(a)
    fmt.Println(a, b)
}
\`\`\`

#### 2. 字符串与数字

Go 不能直接 \`string(42)\` 得到 "42"——那会得到字符 '*'（ASCII 42）：

\`\`\`go
package main

import (
    "fmt"
    "strconv"
)

func main() {
    // 错误示范：得到字符，不是字符串
    s1 := string(42)
    fmt.Println(s1)  // *
    
    // 正确：用 strconv
    s2 := strconv.Itoa(42)
    fmt.Println(s2)  // 42
    
    i, _ := strconv.Atoi("123")
    fmt.Println(i)   // 123
    
    f, _ := strconv.ParseFloat("3.14", 64)
    fmt.Println(f)   // 3.14
    
    s3 := strconv.FormatFloat(3.14, 'f', 2, 64)
    fmt.Println(s3)  // 3.14
}
\`\`\`

#### 3. 字符串与字节切片

\`\`\`go
package main

import "fmt"

func main() {
    s := "Hello"
    b := []byte(s)        // string → []byte
    s2 := string(b)        // []byte → string
    
    fmt.Println(b)        // [72 101 108 108 111]
    fmt.Println(s2)       // Hello
    
    // rune 切片
    r := []rune("世界")
    fmt.Println(r)        // [19990 30028]
    fmt.Println(string(r)) // 世界
}
\`\`\`

### 五、常量 const

#### 1. 基本用法

\`\`\`go
package main

import "fmt"

const Pi = 3.14159
const AppName = "MyApp"
const MaxRetry = 3

const (
    StatusOK = 200
    StatusNotFound = 404
    StatusError = 500
)

func main() {
    fmt.Println(Pi, AppName, MaxRetry)
    fmt.Println(StatusOK, StatusNotFound, StatusError)
}
\`\`\`

特点：
- \`const\` 必须在编译期确定值。
- 不能用 \`:=\`。
- 类型可省略（无类型常量，使用时自动转换）。

#### 2. 无类型常量

\`\`\`go
package main

import "fmt"

const Pi = 3.14159   // 无类型常量

func main() {
    var f32 float32 = Pi   // 自动转 float32
    var f64 float64 = Pi   // 自动转 float64
    fmt.Println(f32, f64)
}
\`\`\`

无类型常量提供"无损精度"——只在需要时才确定具体类型。

#### 3. 多常量并行

\`\`\`go
const (
    a, b = 1, 2
    c, d = 3, 4
)
\`\`\`

#### 4. iota 枚举器

\`iota\` 是 Go 的常量计数器，在 \`const\` 块中每行递增 1：

\`\`\`go
package main

import "fmt"

const (
    Sunday = iota      // 0
    Monday             // 1
    Tuesday            // 2
    Wednesday          // 3
    Thursday           // 4
    Friday             // 5
    Saturday           // 6
)

func main() {
    fmt.Println(Sunday, Monday, Saturday)  // 0 1 6
}
\`\`\`

**iota 的特性**：

- 每 \`const\` 块从 0 开始。
- 每换一行 +1（不管是否写 \`= iota\`）。
- 可参与表达式。

#### 5. iota 经典用法

**位掩码（权限位）**：

\`\`\`go
package main

import "fmt"

const (
    Read = 1 << iota    // 1 (二进制 0001)
    Write                // 2 (二进制 0010)
    Execute              // 4 (二进制 0100)
)

func main() {
    perm := Read | Write  // 3 (二进制 0011)
    fmt.Println("权限:", perm)
    fmt.Println("可读:", perm&Read != 0)
    fmt.Println("可写:", perm&Write != 0)
    fmt.Println("可执行:", perm&Execute != 0)
}
\`\`\`

**跳过值**：

\`\`\`go
const (
    _ = iota  // 0，丢弃
    KB = 1 << (10 * iota)  // 1 << 10 = 1024
    MB                     // 1 << 20
    GB                     // 1 << 30
    TB                     // 1 << 40
)
\`\`\`

**自定义类型 + iota**：

\`\`\`go
package main

import "fmt"

type Weekday int

const (
    Sunday Weekday = iota
    Monday
    Tuesday
    Wednesday
    Thursday
    Friday
    Saturday
)

func (w Weekday) String() string {
    names := [...]string{"周日", "周一", "周二", "周三", "周四", "周五", "周六"}
    if w < Sunday || w > Saturday {
        return "未知"
    }
    return names[w]
}

func main() {
    fmt.Println(Sunday, Friday)  // 周日 周五
    fmt.Printf("类型: %T 值: %d\\n", Monday, Monday)
}
\`\`\`

### 六、字符串详解

#### 1. 字符串不可变

Go 字符串一旦创建，内容不可修改：

\`\`\`go
s := "hello"
s[0] = 'H'  // 编译错误：cannot assign to s[0]
\`\`\

要修改，先转 \`[]byte\` 或 \`[]rune\`：

\`\`\`go
package main

import "fmt"

func main() {
    s := "hello"
    b := []byte(s)
    b[0] = 'H'
    s2 := string(b)
    fmt.Println(s2)  // Hello
    
    // 中文要 []rune
    s3 := "世界"
    r := []rune(s3)
    r[0] = '枫'
    s4 := string(r)
    fmt.Println(s4)  // 枫界
}
\`\`\`

#### 2. 字符串拼接

\`\`\`go
package main

import (
    "fmt"
    "strings"
)

func main() {
    s1 := "Hello" + " " + "World"
    fmt.Println(s1)
    
    // 多次拼接用 strings.Builder（性能好）
    var b strings.Builder
    for i := 0; i < 5; i++ {
        b.WriteString("Go")
    }
    s2 := b.String()
    fmt.Println(s2)  // GoGoGoGoGo
    
    // fmt.Sprintln
    s3 := fmt.Sprint("Name:", "张三", " Age:", 25)
    fmt.Println(s3)
    
    // strings.Join
    parts := []string{"a", "b", "c"}
    s4 := strings.Join(parts, ",")
    fmt.Println(s4)  // a,b,c
}
\`\`\`

#### 3. 字符串常用操作

\`\`\`go
package main

import (
    "fmt"
    "strings"
)

func main() {
    s := "Hello, Go World"
    
    // 长度（字节数）
    fmt.Println("len:", len(s))
    
    // 包含
    fmt.Println("包含 Go:", strings.Contains(s, "Go"))
    
    // 前缀后缀
    fmt.Println("前缀 Hello:", strings.HasPrefix(s, "Hello"))
    fmt.Println("后缀 World:", strings.HasSuffix(s, "World"))
    
    // 查找
    fmt.Println("索引:", strings.Index(s, "Go"))   // 7
    fmt.Println("最后索引:", strings.LastIndex(s, "o"))  // 12
    
    // 替换
    fmt.Println(strings.Replace(s, "o", "0", -1))  // 全部替换
    fmt.Println(strings.Replace(s, "o", "0", 1))    // 替换 1 个
    
    // 分割
    parts := strings.Split(s, ", ")
    fmt.Println(parts)  // [Hello Go World]
    
    // 大小写
    fmt.Println(strings.ToUpper(s))
    fmt.Println(strings.ToLower(s))
    
    // 修剪
    fmt.Println(strings.TrimSpace("  hi  "))
    fmt.Println(strings.Trim("xxhixx", "x"))
    
    // 重复
    fmt.Println(strings.Repeat("Go", 3))  // GoGoGo
}
\`\`\`

### 七、UTF-8 与 rune 详解

#### 1. Go 字符串是 UTF-8

Go 源码和字符串默认 UTF-8 编码。一个汉字通常占 3 字节：

\`\`\`go
package main

import "fmt"

func main() {
    s := "Hello, 世界"
    
    fmt.Println("字节长度:", len(s))  // 13（5 + 2 + 1 空格 + 3*2 = 13）
    
    // 字节数组
    for i := 0; i < len(s); i++ {
        fmt.Printf("%d: %x %c\\n", i, s[i], s[i])
    }
}
\`\`\`

#### 2. for range 遍历 rune

\`for range\` 字符串时，每次迭代一个 \`rune\`（不是字节）：

\`\`\`go
package main

import "fmt"

func main() {
    s := "Hello, 世界"
    
    for i, r := range s {
        fmt.Printf("位置 %d: %c (码点 %d)\\n", i, r, r)
    }
}
\`\`\

输出：
\`\`\`
位置 0: H (码点 72)
位置 1: e (码点 101)
...
位置 7: 世 (码点 19990)
位置 10: 界 (码点 30028)
\`\`\

注意位置是**字节偏移**，不是字符序号。

#### 3. 字符数（rune 数）

\`\`\`go
package main

import (
    "fmt"
    "unicode/utf8"
)

func main() {
    s := "Hello, 世界"
    
    // 字节数
    fmt.Println("字节数:", len(s))
    
    // 字符数（rune 数）
    fmt.Println("字符数:", utf8.RuneCountInString(s))
    fmt.Println("字符数:", len([]rune(s)))
}
\`\`\

### 八、类型推导

#### 1. 字面量推导

\`\`\`go
package main

import "fmt"

func main() {
    i := 10           // int
    f := 3.14         // float64
    s := "hello"      // string
    b := true         // bool
    r := 'A'          // rune (int32)
    
    fmt.Printf("i: %T\\n", i)
    fmt.Printf("f: %T\\n", f)
    fmt.Printf("s: %T\\n", s)
    fmt.Printf("b: %T\\n", b)
    fmt.Printf("r: %T\\n", r)
}
\`\`\

#### 2. 整数字面量

\`\`\`go
package main

import "fmt"

func main() {
    a := 42          // 十进制
    b := 0b101010    // 二进制
    c := 0o52        // 八进制（Go 1.13+）
    d := 0x2a        // 十六进制
    e := 1_000_000   // 下划线分隔（Go 1.13+）
    
    fmt.Println(a, b, c, d, e)  // 42 42 42 42 1000000
}
\`\`\

#### 3. 类型不一致导致的坑

\`\`\`go
package main

import "fmt"

func main() {
    var a int = 10
    var b int32 = 20
    
    // c := a + b  // 编译错误：mismatched types int and int32
    c := a + int(b)
    fmt.Println(c)
}
\`\`\

> Go 强制显式转换——避免 C/C++ 中隐式转换导致的精度丢失 bug。

### 九、复合类型预览

后续章节详讲，这里先建立印象：

\`\`\`go
package main

import "fmt"

func main() {
    // 数组（固定长度）
    var arr [3]int = [3]int{1, 2, 3}
    fmt.Println(arr)
    
    // 切片（动态长度）
    s := []int{1, 2, 3}
    s = append(s, 4)
    fmt.Println(s)
    
    // map
    m := map[string]int{"a": 1, "b": 2}
    fmt.Println(m)
    
    // 结构体
    type Point struct{ X, Y int }
    p := Point{1, 2}
    fmt.Println(p)
    
    // 指针
    x := 10
    ptr := &x
    fmt.Println(*ptr)
}
\`\`\

### 十、类型断言与类型判断（预览）

接口相关，后续详讲，这里先看示例：

\`\`\`go
package main

import "fmt"

func main() {
    var i interface{} = "hello"
    
    // 类型断言
    s, ok := i.(string)
    fmt.Println(s, ok)
    
    // 类型判断
    switch v := i.(type) {
    case string:
        fmt.Println("字符串:", v)
    case int:
        fmt.Println("整数:", v)
    default:
        fmt.Println("未知类型")
    }
}
\`\`\

### 十一、实战：单位转换器

综合运用类型与转换：

\`\`\`go
package main

import (
    "fmt"
    "strconv"
    "strings"
)

const (
    KB = 1 << (10 * (iota + 1))  // 1024
    MB                            // 1024 * 1024
    GB                            // 1024^3
    TB                            // 1024^4
)

func formatBytes(b int64) string {
    switch {
    case b >= TB:
        return strconv.FormatFloat(float64(b)/TB, 'f', 2, 64) + " TB"
    case b >= GB:
        return strconv.FormatFloat(float64(b)/GB, 'f', 2, 64) + " GB"
    case b >= MB:
        return strconv.FormatFloat(float64(b)/MB, 'f', 2, 64) + " MB"
    case b >= KB:
        return strconv.FormatFloat(float64(b)/KB, 'f', 2, 64) + " KB"
    default:
        return strconv.FormatInt(b, 10) + " B"
    }
}

func main() {
    fmt.Println(formatBytes(500))             // 500 B
    fmt.Println(formatBytes(1500))            // 1.46 KB
    fmt.Println(formatBytes(1024 * 1024))     // 1.00 MB
    fmt.Println(formatBytes(5 * GB))          // 5.00 GB
    fmt.Println(formatBytes(2 * TB))          // 2.00 TB
    
    // 用 strings 操作
    s := "Hello,World,Go"
    parts := strings.Split(s, ",")
    for i, p := range parts {
        fmt.Printf("%d: %s\\n", i, p)
    }
}
\`\`\

### 十二、常见错误与陷阱

#### 1. int 与 int64 不兼容

\`\`\`go
var a int = 10
var b int64 = 20
// c := a + b  // 错误
c := int64(a) + b
\`\`\

#### 2. 字符串长度不是字符数

\`\`\`go
s := "世界"
len(s)                  // 6（字节）
utf8.RuneCountInString(s)  // 2（字符）
\`\`\

#### 3. 浮点比较

\`\`\`go
package main

import (
    "fmt"
    "math"
)

func main() {
    a := 0.1 + 0.2
    fmt.Println(a)               // 0.30000000000000004
    fmt.Println(a == 0.3)         // false
    
    // 用差值比较
    fmt.Println(math.Abs(a-0.3) < 1e-9)  // true
}
\`\`\

#### 4. := 在块外失效

\`\`\`go
if x := 10; x > 5 {
    fmt.Println(x)  // x 仅在 if 块内可见
}
// fmt.Println(x)  // 错误：x undefined
\`\`\

#### 5. nil 不能赋值给非接口类型

\`\`\`go
var s string = nil   // 错误：string 不能是 nil
var p *int = nil      // 正确：指针可以是 nil
\`\`\

### 十三、本章小结

- 变量声明：\`var\`（任何位置）、\`:=\`（仅函数内、至少一个新变量）。
- 基本类型：\`bool\`、整数（int/uint/byte/rune）、浮点（float32/64）、字符串。
- 零值：数值 0、布尔 false、字符串 ""、引用类型 nil。
- 类型转换：**必须显式**，数值互转、字符串与 byte/rune 互转、字符串与数字用 strconv。
- 常量 \`const\`：编译期确定，支持无类型常量。
- \`iota\`：常量计数器，常用于枚举、位掩码。
- 字符串：UTF-8、不可变、\`len\` 是字节数。
- \`byte\` = \`uint8\`，\`rune\` = \`int32\`（Unicode 码点）。
- \`for range\` 字符串遍历 rune；\`utf8.RuneCountInString\` 算字符数。
- \`strings\` 包：拼接、分割、替换、查找、修剪等。
- 没有"未初始化变量"——所有变量都有零值，避免 C 的随机值 bug。

下一章讲运算符与表达式——包括 Go 的指针运算符。`,
  },

  // ============================================================
  // 第四章：运算符与表达式
  // ============================================================
  {
    id: 'go-ch04',
    group: '第一部分 基础入门',
    icon: '➕',
    title: '运算符与表达式',
    content: `## 第四章　运算符与表达式

Go 的运算符比想象的丰富——除了常规的算术、比较、逻辑、位运算，还有指针运算符 \`&\` 和 \`*\`。这一章系统讲 Go 的运算符体系。

### 一、算术运算符

#### 1. 基本算术

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println(10 + 3)   // 13 加
    fmt.Println(10 - 3)  // 7  减
    fmt.Println(10 * 3)  // 30 乘
    fmt.Println(10 / 3)  // 3  除（整数截断）
    fmt.Println(10 % 3)  // 1  取余
    
    // 浮点除法
    fmt.Println(10.0 / 3.0)  // 3.3333...
}
\`\`\

#### 2. 整数除法陷阱

Go 整数除法**截断**（向零取整），不是向下取整：

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println(7 / 2)    // 3
    fmt.Println(-7 / 2)   // -3（截断，不是 -4）
    fmt.Println(7 / -2)   // -3
    fmt.Println(-7 / -2)  // 3
    
    // 取余的符号跟随被除数
    fmt.Println(7 % 3)   // 1
    fmt.Println(-7 % 3)  // -1
    fmt.Println(7 % -3)  // 1
}
\`\`\

> Python 是向下取整（\`-7 // 2 == -4\`），Go 是截断（\`-7 / 2 == -3\`）。移植代码要小心。

#### 3. 字符串拼接 +

\`\`\`go
package main

import "fmt"

func main() {
    s := "Hello" + " " + "World"
    fmt.Println(s)
    
    // += 拼接
    s += "!"
    fmt.Println(s)
}
\`\`\

> 多次拼接用 \`strings.Builder\`，性能远优于 \`+\`。

### 二、自增自减

Go 有 \`++\` 和 \`--\`，但**只能作为语句，不能作为表达式**：

\`\`\`go
package main

import "fmt"

func main() {
    x := 10
    x++           // 正确：语句
    fmt.Println(x) // 11
    
    x--
    fmt.Println(x) // 10
    
    // 错误用法：
    // y := x++   // 编译错误：不能作为表达式
    // fmt.Println(x++)  // 编译错误
    
    // 没有 ++x 这种前缀形式
    // ++x  // 编译错误
}
\`\`\

> Go 故意限制 \`++\`/\`--\` 的用法——避免 C/C++ 中 \`a[i++] = i++\` 这种"未定义行为"陷阱。

### 三、比较运算符

| 运算符 | 含义 |
| --- | --- |
| \`==\` | 等于 |
| \`!=\` | 不等于 |
| \`>\` | 大于 |
| \`<\` | 小于 |
| \`>=\` | 大于等于 |
| \`<=\` | 小于等于 |

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println(3 == 3)   // true
    fmt.Println(3 != 4)  // true
    fmt.Println(3 > 4)   // false
    fmt.Println(3 < 4)   // true
    fmt.Println(3 >= 3)  // true
    fmt.Println(3 <= 2) // false
    
    // 字符串比较（按字典序）
    fmt.Println("abc" < "abd")  // true
    fmt.Println("abc" == "abc") // true
}
\`\`\

#### 1. 数组与结构体比较

如果元素都是可比较类型，数组和结构体可以用 \`==\`：

\`\`\`go
package main

import "fmt"

func main() {
    a := [3]int{1, 2, 3}
    b := [3]int{1, 2, 3}
    fmt.Println(a == b)  // true
    
    type Point struct{ X, Y int }
    p1 := Point{1, 2}
    p2 := Point{1, 2}
    fmt.Println(p1 == p2)  // true
}
\`\`\

切片、map、函数**不可比较**（只能与 \`nil\` 比）。

### 四、逻辑运算符

| 运算符 | 含义 |
| --- | --- |
| \`&&\` | 与（短路） |
| \`\|\|\` | 或（短路） |
| \`!\` | 非 |

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println(true && false)  // false
    fmt.Println(true || false)  // true
    fmt.Println(!true)          // false
    
    // 短路求值
    x := 0
    // x != 0 为 false，不会执行 10/x
    if x != 0 && 10/x > 1 {
        fmt.Println("不会执行")
    }
    
    // 用于默认值
    var name string
    displayName := name != "" && name || "匿名"
    fmt.Println(displayName)  // 注意：Go 不能这样写，逻辑运算符要求 bool
    
    // 正确写法
    if name == "" {
        name = "匿名"
    }
    fmt.Println(name)
}
\`\`\

> Go 逻辑运算符**只接受 bool**——不能用 \`name && "default"\` 这种 Python/JS 风格。Go 强制显式。

### 五、位运算符

| 运算符 | 含义 |
| --- | --- |
| \`&\` | 与 |
| \`\|\` | 或 |
| \`^\` | 异或 |
| \`&^\` | 位清除（AND NOT） |
| \`<<\` | 左移 |
| \`>>\` | 右移 |
| \`&^\` | 位清除 |

\`\`\`go
package main

import "fmt"

func main() {
    a := 0b1100  // 12
    b := 0b1010  // 10
    
    fmt.Printf("a & b  = %04b = %d\\n", a&b, a&b)    // 1000 = 8
    fmt.Printf("a | b  = %04b = %d\\n", a|b, a|b)    // 1110 = 14
    fmt.Printf("a ^ b  = %04b = %d\\n", a^b, a^b)    // 0110 = 6
    fmt.Printf("a &^ b = %04b = %d\\n", a&^b, a&^b)  // 0100 = 4
    
    // 移位
    fmt.Printf("1 << 3 = %d\\n", 1<<3)  // 8
    fmt.Printf("16 >> 2 = %d\\n", 16>>2) // 4
    
    // ^ 作为单目运算符是"按位取反"
    var c uint8 = 0b00001111
    fmt.Printf("^c = %08b = %d\\n", ^c, ^c)  // 11110000 = 240
}
\`\`\

#### 1. 位运算实战：权限位

\`\`\`go
package main

import "fmt"

const (
    PermRead    = 1 << iota  // 1
    PermWrite                // 2
    PermExec                 // 4
)

func main() {
    perm := PermRead | PermWrite  // 3
    
    fmt.Println("可读:", perm&PermRead != 0)  // true
    fmt.Println("可写:", perm&PermWrite != 0) // true
    fmt.Println("可执行:", perm&PermExec != 0) // false
    
    // 添加权限
    perm |= PermExec
    fmt.Println("添加执行后:", perm)  // 7
    
    // 移除权限
    perm &^= PermWrite
    fmt.Println("移除写后:", perm)  // 5
}
\`\`\

### 六、赋值运算符

| 运算符 | 等价 |
| --- | --- |
| \`=\` | 赋值 |
| \`+=\` | \`x = x + y\` |
| \`-=\` | \`x = x - y\` |
| \`*=\` | \`x = x * y\` |
| \`/=\` | \`x = x / y\` |
| \`%=\` | \`x = x % y\` |
| \`&=\` | \`x = x & y\` |
| \`\|=\` | \`x = x \| y\` |
| \`^=\` | \`x = x ^ y\` |
| \`<<=\` | \`x = x << y\` |
| \`>>=\` | \`x = x >> y\` |
| \`&^=\` | \`x = x &^ y\` |

\`\`\`go
package main

import "fmt"

func main() {
    x := 10
    x += 5   // 15
    x -= 3   // 12
    x *= 2   // 24
    x /= 5   // 4
    x %= 3   // 1
    fmt.Println(x)
    
    // 多重赋值
    a, b := 1, 2
    a, b = b, a    // 交换
    fmt.Println(a, b)  // 2 1
    
    a, b = a+b, a*b  // 同时计算
    fmt.Println(a, b)
}
\`\`\

### 七、指针运算符 & 和 *

Go 有指针，但**没有指针运算**（不能 \`p++\` 移动指针）。

#### 1. 基本用法

\`\`\`go
package main

import "fmt"

func main() {
    x := 10
    p := &x       // & 取地址
    fmt.Println(p)   // 0xc0000a2000（地址）
    fmt.Println(*p)  // 10，* 解引用
    
    *p = 20         // 通过指针修改
    fmt.Println(x)   // 20
}
\`\`\

#### 2. 指针的零值

\`\`\`go
package main

import "fmt"

func main() {
    var p *int      // 零值 nil
    fmt.Println(p)   // <nil>
    
    if p == nil {
        fmt.Println("p 是 nil")
    }
    
    // *p = 10  // 错误：nil 指针解引用会 panic
}
\`\`\

#### 3. new 函数

\`\`\`go
package main

import "fmt"

func main() {
    p := new(int)    // 分配 int，返回 *int
    fmt.Println(p, *p)  // 0xc0000a2000 0（零值）
    *p = 100
    fmt.Println(*p)
    
    // new 多用于基本类型，实际很少用——多用 :=
    x := 100  // 更常用
    _ = x
}
\`\`\

#### 4. 指针传参

\`\`\`go
package main

import "fmt"

// 值传递：不影响原变量
func incByValue(n int) {
    n++
}

// 指针传递：影响原变量
func incByPtr(n *int) {
    *n++
}

func main() {
    x := 10
    incByValue(x)
    fmt.Println(x)  // 10
    
    incByPtr(&x)
    fmt.Println(x)  // 11
}
\`\`\

> Go 函数参数默认是**值传递**。要在函数内修改外部变量，传指针。

#### 5. Go 没有指针运算

\`\`\`go
arr := [3]int{1, 2, 3}
p := &arr[0]
// p++       // 错误：Go 不允许指针运算
// p[1]      // 错误
// arr+1     // 错误
\`\`\

> Go 故意砍掉指针运算——避免 C 中指针越界、内存破坏等经典 bug。需要"指针运算"的场景用切片代替。

### 八、运算符优先级

从高到低（同行同级）：

| 优先级 | 运算符 |
| --- | --- |
| 5 | \`* / % << >> & &^\` |
| 4 | \`+ - \| ^\` |
| 3 | \`== != < <= > >=\` |
| 2 | \`&&\` |
| 1 | \`\|\|\` |

\`\`\`go
package main

import "fmt"

func main() {
    // 乘除优先
    fmt.Println(2 + 3 * 4)     // 14（不是 20）
    fmt.Println((2 + 3) * 4)   // 20
    
    // 比较高于逻辑
    fmt.Println(1 < 2 && 3 > 2)  // true
    
    // 位运算高于比较
    fmt.Println(1&2 == 0)      // true（先 1&2，再 ==0）
    
    // 复杂表达式用括号
    a, b, c := 5, 3, 2
    result := (a + b) * c / (b - 1)
    fmt.Println(result)
}
\`\`\

> Go 风格建议：**复杂表达式永远用括号**——可读性比"懂优先级"更重要。

### 九、表达式与语句

#### 1. 表达式

产生值的代码：

\`\`\`go
1 + 2           // 表达式
x > 0           // 表达式
fmt.Println(x)  // 表达式（返回值无）
a, b            // 表达式列表
\`\`\

#### 2. 语句

执行操作的代码：

\`\`\`go
x := 5          // 赋值语句
if x > 0 {}     // if 语句
for {}          // for 语句
return          // return 语句
\`\`\

#### 3. 表达式作为语句

\`\`\`go
package main

import "fmt"

func main() {
    // 表达式 + ; = 语句
    x := 10
    _ = x   // 显式忽略（避免"未使用"错误）
    
    // 函数调用是表达式
    fmt.Println("hi")
    
    // 通道操作
    ch := make(chan int, 1)
    ch <- 1     // 发送语句
    v := <-ch   // 接收表达式
    fmt.Println(v)
}
\`\`\

### 十、if 表达式

Go 的 \`if\` 可以带初始化语句：

\`\`\`go
package main

import "fmt"

func main() {
    // 标准形式
    x := 10
    if x > 5 {
        fmt.Println("大")
    } else {
        fmt.Println("小")
    }
    
    // 带初始化（iota 风格）
    if y := computeValue(); y > 100 {
        fmt.Println("大:", y)
    } else {
        fmt.Println("小:", y)
    }
    // y 仅在 if-else 内可见
    
    // else if
    score := 85
    if score >= 90 {
        fmt.Println("A")
    } else if score >= 80 {
        fmt.Println("B")
    } else if score >= 70 {
        fmt.Println("C")
    } else {
        fmt.Println("D")
    }
}

func computeValue() int {
    return 150
}
\`\`\

> Go 没有"三元运算符 \`? :\`"——这是故意的。Go 认为三元运算符降低可读性，建议用 \`if-else\`。

### 十一、类型断言与类型转换运算符

#### 1. 类型转换 T(v)

\`\`\`go
package main

import "fmt"

func main() {
    var i int = 10
    f := float64(i)         // int → float64
    s := string(65)          // int → string（ASCII 65 → 'A'）
    
    fmt.Println(f, s)
}
\`\`\

#### 2. 类型断言 v.(T)

仅用于接口：

\`\`\`go
package main

import "fmt"

func main() {
    var i interface{} = "hello"
    
    s := i.(string)        // 断言失败会 panic
    fmt.Println(s)
    
    s, ok := i.(string)    // 安全断言
    fmt.Println(s, ok)
    
    n, ok := i.(int)       // 失败不 panic
    fmt.Println(n, ok)     // 0 false
}
\`\`\

### 十二、其他运算符

#### 1. 通道运算符 <-

\`\`\`go
ch := make(chan int, 1)
ch <- 10     // 发送
v := <-ch    // 接收
\`\`\

#### 2. 接收方向通道类型

\`\`\`go
var sendOnly chan<- int = ch   // 只发送
var recvOnly <-chan int = ch   // 只接收
\`\`\

#### 3. 取地址 & 和解引用 *

如前述指针部分。

### 十三、运算符综合实战

#### 1. 计算器

\`\`\`go
package main

import "fmt"

func calc(a, b float64, op string) (float64, error) {
    switch op {
    case "+":
        return a + b, nil
    case "-":
        return a - b, nil
    case "*":
        return a * b, nil
    case "/":
        if b == 0 {
            return 0, fmt.Errorf("除数不能为零")
        }
        return a / b, nil
    case "%":
        return float64(int(a) % int(b)), nil
    default:
        return 0, fmt.Errorf("未知运算符: %s", op)
    }
}

func main() {
    tests := []struct {
        a, b float64
        op  string
    }{
        {10, 3, "+"},
        {10, 3, "-"},
        {10, 3, "*"},
        {10, 3, "/"},
        {10, 3, "%"},
        {10, 0, "/"},
    }
    
    for _, t := range tests {
        result, err := calc(t.a, t.b, t.op)
        if err != nil {
            fmt.Printf("%.0f %s %.0f = 错误: %v\\n", t.a, t.op, t.b, err)
        } else {
            fmt.Printf("%.0f %s %.0f = %.2f\\n", t.a, t.op, t.b, result)
        }
    }
}
\`\`\

输出：
\`\`\`
10 + 3 = 13.00
10 - 3 = 7.00
10 * 3 = 30.00
10 / 3 = 3.33
10 % 3 = 1.00
10 / 0 = 错误: 除数不能为零
\`\`\

#### 2. 位掩码权限系统

\`\`\`go
package main

import "fmt"

const (
    PermRead    = 1 << iota  // 1
    PermWrite                // 2
    PermDelete               // 4
    PermShare                // 8
    PermAll     = PermRead | PermWrite | PermDelete | PermShare  // 15
)

type Permission int

func (p Permission) Has(perm Permission) bool {
    return p&perm != 0
}

func (p Permission) Add(perm Permission) Permission {
    return p | perm
}

func (p Permission) Remove(perm Permission) Permission {
    return p &^ perm
}

func (p Permission) String() string {
    s := ""
    if p.Has(PermRead)   { s += "R" } else { s += "-" }
    if p.Has(PermWrite)  { s += "W" } else { s += "-" }
    if p.Has(PermDelete) { s += "D" } else { s += "-" }
    if p.Has(PermShare)  { s += "S" } else { s += "-" }
    return s
}

func main() {
    var user Permission = PermRead | PermWrite  // RW--
    fmt.Println("初始:", user)             // RW--
    
    user = user.Add(PermShare)
    fmt.Println("加分享:", user)            // RW-S
    
    user = user.Remove(PermWrite)
    fmt.Println("去写:", user)             // R--S
    
    fmt.Println("能读吗:", user.Has(PermRead))   // true
    fmt.Println("能删吗:", user.Has(PermDelete)) // false
    
    fmt.Println("全部权限:", Permission(PermAll))  // RWDS
}
\`\`\

### 十四、常见陷阱

#### 1. 整数溢出

\`\`\`go
package main

import "fmt"

func main() {
    var a int8 = 127
    a++        // 溢出，变成 -128
    fmt.Println(a)  // -128
    
    // 乘法溢出
    var b int = 1 << 62
    fmt.Println(b * 2)  // 溢出为负数
    
    // 用 math 检查
    // 实战中要用 safe arithmetic 库或大整数
}
\`\`\

> Go 不会自动检测整数溢出——这是性能取舍。需要检测可用 \`math/bits\` 包。

#### 2. 浮点比较

\`\`\`go
package main

import (
    "fmt"
    "math"
)

func main() {
    a := 0.1 + 0.2
    fmt.Println(a == 0.3)              // false
    fmt.Println(math.Abs(a-0.3) < 1e-9)  // true
}
\`\`\

#### 3. 短路与求值顺序

\`\`\`go
package main

import "fmt"

func sideEffect() bool {
    fmt.Println("副作用")
    return true
}

func main() {
    if false && sideEffect() {
        // sideEffect 不会执行
    }
    // 输出：（无）
    
    if true || sideEffect() {
        // sideEffect 不会执行
    }
    // 输出：（无）
}
\`\`\

#### 4. && 和 || 返回 bool

\`\`\`go
// 错误：Go 不能像 JS/Python 那样写
// x := name || "default"
// 必须显式
var name string
displayName := name
if displayName == "" {
    displayName = "default"
}
\`\`\

### 十五、表达式与运算符速查表

| 类别 | 运算符 |
| --- | --- |
| 算术 | \`+ - * / %\` |
| 关系 | \`== != > < >= <=\` |
| 逻辑 | \`&& \|\| !\` |
| 位运算 | \`& \| ^ &^ << >>\` |
| 赋值 | \`= += -= *= /= %= &= \|= ^= &=^= <<= >>=\` |
| 自增自减 | \`++ --\`（仅语句） |
| 指针 | \`& *\` |
| 通道 | \`<-\` |
| 类型转换 | \`T(v)\` |
| 类型断言 | \`v.(T)\` |

### 十六、本章小结

- 算术：\`+ - * / %\`，整数除法**截断**（不是向下）。
- \`++\`/\`--\` 只能作为语句，不能作为表达式，无前缀形式。
- 比较：\`== != > < >= <=\`，数组/结构体可比较（元素可比较时）。
- 逻辑：\`&& || !\`，**只接受 bool**，强制显式判断。
- 位运算：\`& \| ^ &^ << >>\`，\`&^\` 是位清除（AND NOT）。
- 赋值：\`= += -= ...\`，支持多重赋值 \`a, b = b, a\`。
- 指针：\`&\` 取地址、\`*\` 解引用，**无指针运算**（不能 \`p++\`）。
- 优先级：\`* / > + - > 比较 > && > ||\`，复杂表达式用括号。
- Go 没有 \`?:\` 三元运算符，用 \`if-else\`。
- 没有 \`++x\` 前缀形式。
- 整数溢出不会报错，需手动检查。
- 浮点比较用差值法。

第一部分到此结束。下一部分讲控制流（if/for/switch）、函数、数组切片、字符串进阶。`,
  },
];

export { chapters };
