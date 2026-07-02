// =============================================================
// Java 交互式教程 —— 第一批章节（基础组，共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. java-intro       — Java 简介
//   2. java-variables   — 变量与数据类型
//   3. java-operators   — 运算符与表达式
//   4. java-strings     — 字符串
//   5. java-controlflow — 条件与循环
//
// 每个章节包含：
//   id      : 唯一标识
//   group   : 分组名（本批为"基础"）
//   icon    : 展示用 emoji
//   title   : 章节标题
//   content : Markdown 格式的详细讲解（文字量大，含大量 demo）
//   code    : 可运行、带详细中文注释的 Java 示例代码
//
// 代码运行环境约束：
//   - 用 javac 编译、java 运行，各 10 秒超时
//   - 代码必须包含 public class Main { public static void main(String[] args) {...} }
//   - 通过 System.out.println 输出结果
//   - 仅使用 JDK 标准库
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：Java 简介
  // =========================================================
  {
    id: "java-intro",
    group: "基础",
    icon: "☕",
    title: "Java 简介",
    content: `## 什么是 Java？

**Java** 是一门**高级、通用、面向对象、强类型**的编程语言。它由 **Sun Microsystems（太阳微系统公司）** 的 **James Gosling（詹姆斯·高斯林）** 等人于 **1995 年**正式发布。Java 最著名的口号是"**一次编写，到处运行**"（Write Once, Run Anywhere，简称 WORA）——这是 Java 区别于同时代其他语言的最大卖点：同一段 Java 字节码可以在任何安装了 JVM 的平台上运行，无需重新编译。

Java 既是**编译型**语言（源码先被 javac 编译成字节码），又是**解释型**语言（字节码由 JVM 解释或即时编译执行）。这种"半编译半解释"的架构是 Java 实现跨平台的关键。经过近三十年的发展，Java 已经成为**企业级后端开发、Android 移动开发、大数据处理**领域的主力语言，长期位居 TIOBE 编程语言排行榜前列。

### Java 的诞生与历史

#### 创始人：James Gosling

James Gosling 是一位加拿大计算机科学家，1983 年在卡内基梅隆大学获得博士学位后加入 Sun Microsystems。在创造 Java 之前，他参与过多个项目，包括著名的 Emacs 编辑器的早期版本（Gosling Emacs）和 NeWS 窗口系统。

#### 1991 年：Green 项目

Java 的故事始于 1991 年。当时 Sun 公司启动了一个名为 **"Green Project"（绿色计划）** 的内部项目，目标是开发一种用于**消费类电子产品**（如机顶盒、PDA、交互式电视）的编程技术。这类设备的硬件能力参差不齐、CPU 架构各异，传统的 C/C++ 编译型语言需要为每种平台单独编译，维护成本极高。团队因此希望创造一门**与平台无关**的新语言。

最初这门语言被命名为 **"Oak"（橡树）**，灵感来自 James Gosling 办公室窗外的一棵橡树。但当团队准备注册商标时，发现 Oak 已经被另一家公司注册，于是 1995 年正式改名为 **"Java"**。据说这个名字来自团队成员常去的一家咖啡馆里的 **Java 咖啡**（Java 是印度尼西亚的爪哇岛，盛产咖啡）。这就是为什么 Java 的 logo 是一杯冒着热气的咖啡 ☕。

#### 1995 年：正式发布

1995 年 5 月 23 日，Sun 在 SunWorld 大会上正式发布 Java 1.0。彼时正是互联网爆炸式增长的年代，Java 凭借"Applet"技术（在浏览器中运行的小程序）迅速走红——它让网页第一次能够展示动态交互内容。虽然 Applet 后来因 Flash、JavaScript 的崛起和安全性问题被淘汰，但 Java 已经在服务器端找到了更广阔的舞台。

#### Sun 被 Oracle 收购

2009 年 4 月，**Oracle（甲骨文）公司**宣布以 74 亿美元收购 Sun Microsystems，交易于 2010 年初完成。从此 Java 的商标和主导权归 Oracle 所有，JDK 的官方实现也由 Oracle 维护。这一收购曾在开源社区引发担忧，但 Java 的演进并未停滞，反而加快了发布节奏。

### Java 版本演进时间线

| 版本 | 发布年份 | 重要特性 |
| --- | --- | --- |
| Java 1.0 | 1996 | 首个正式版本，奠定语言基础 |
| Java 1.1 | 1997 | 内部类、JDBC、反射 |
| Java 2 (J2SE 1.2) | 1998 | Swing、集合框架，引入 3 个平台版本 |
| J2SE 1.3 | 2000 | HotSpot JVM |
| J2SE 1.4 | 2002 | NIO、正则表达式、断言 assert |
| Java 5 (J2SE 1.5) | 2004 | 泛型、注解、枚举、增强 for、自动装箱 |
| Java 6 | 2006 | 性能优化、脚本语言支持 |
| Java 7 | 2011 | try-with-resources、switch 支持 String、菱形语法 <> |
| Java 8 (LTS) | 2014 | Lambda 表达式、Stream API、Optional、新日期时间 API |
| Java 9 | 2017 | 模块系统 (Jigsaw)、JShell |
| Java 10 | 2018 | var 局部变量类型推断 |
| Java 11 (LTS) | 2018 | HTTP Client、var 用于 Lambda |
| Java 13 | 2019 | 文本块 (Text Blocks) 预览 |
| Java 14 | 2020 | switch 表达式正式、Records 预览 |
| Java 15 | 2020 | 文本块正式、密封类预览 |
| Java 16 | 2021 | Records 正式 |
| Java 17 (LTS) | 2021 | 密封类正式、模式匹配增强 |
| Java 21 (LTS) | 2023 | 虚拟线程、模式匹配 for switch、序列化集合 |

**LTS（Long Term Support，长期支持）版本**会获得多年安全更新，是企业生产环境的首选。目前主流 LTS 版本是 **Java 8、11、17、21**。自 Java 9 起，Oracle 采用**每 6 个月发布一个新版本**的快速迭代节奏，非 LTS 版本只有 6 个月支持期。

### Java 的三大平台版本

历史上 Java 分为三个平台版本：

| 平台 | 全称 | 用途 |
| --- | --- | --- |
| **Java SE** | Standard Edition | 核心平台，桌面和服务器基础，本教程基于此 |
| **Java EE** | Enterprise Edition | 企业级 Web 开发（Servlet、JSP、JPA 等），2017 年改名 Jakarta EE 转交 Eclipse 基金会 |
| **Java ME** | Micro Edition | 嵌入式和移动设备，随 Android 兴起逐渐边缘化 |

日常所说的"学 Java"一般指的是 **Java SE**。

### JVM、JRE、JDK 的区别

这三个概念经常让初学者混淆，理解它们的层次关系至关重要：

\`\`\`
┌─────────────────────────────────────────┐
│  JDK (Java Development Kit) 开发工具包    │
│  ┌───────────────────────────────────┐  │
│  │  JRE (Java Runtime Environment)    │  │
│  │  运行环境                           │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  JVM (Java Virtual Machine)  │  │  │
│  │  │  虚拟机，执行字节码            │  │  │
│  │  └─────────────────────────────┘  │  │
│  │  + 核心类库 (rt.jar 等)            │  │
│  └───────────────────────────────────┘  │
│  + 编译器 javac、工具 javadoc、jdb 等     │
└─────────────────────────────────────────┘
\`\`\`

- **JVM（Java 虚拟机）**：是一个抽象的计算机，负责**执行字节码**。它是跨平台的核心——不同操作系统有不同版本的 JVM，但它们都能运行同一份字节码。JVM 还负责**内存管理**和**垃圾回收**。
- **JRE（Java 运行环境）**：= JVM + 核心类库。如果你想**运行** Java 程序，安装 JRE 就够了。
- **JDK（Java 开发工具包）**：= JRE + 开发工具（javac 编译器、javadoc 文档生成器、jdb 调试器等）。如果你想**开发** Java 程序，必须安装 JDK。

> 注意：从 Java 11 开始，Oracle 不再单独提供 JRE。JDK 已经包含了运行所需的一切。

### 跨平台原理：Write Once, Run Anywhere

Java 跨平台的核心机制：

\`\`\`
  源代码 Hello.java
       │  javac 编译
       ▼
  字节码 Hello.class  （平台无关）
       │
       ├──→ Windows JVM  → 在 Windows 上运行
       ├──→ macOS JVM    → 在 macOS 上运行
       └──→ Linux JVM    → 在 Linux 上运行
\`\`\`

**关键点**：javac 编译出的字节码（.class 文件）是**平台无关**的，但 JVM 是**平台相关**的。你只需编译一次，就能在任何装有 JVM 的系统上运行。这与 C/C++ 形成鲜明对比——C/C++ 必须为每个目标平台单独编译成机器码。

### 编译与运行流程

写好 Java 源代码后，需要两步才能运行：

\`\`\`bash
# 1. 编译：把 .java 源文件编译成 .class 字节码文件
javac Hello.java          # 生成 Hello.class

# 2. 运行：由 JVM 加载并执行字节码
java Hello                # 注意：不要加 .class 后缀
\`\`\`

**详细流程**：

1. **javac 编译**：词法分析 → 语法分析 → 语义分析 → 生成字节码（.class）。字节码是一种中间格式，不是机器码。
2. **类加载（Class Loading）**：JVM 的类加载器把 .class 文件读入内存。
3. **字节码校验（Bytecode Verifier）**：检查字节码是否合法、安全（防止恶意代码）。
4. **执行**：JVM 解释器逐条解释字节码；对于热点代码，**JIT 编译器（Just-In-Time）**会把它即时编译成机器码缓存起来，大幅提升性能。

### Java 的主要特点

#### 1. 面向对象

Java 是**纯面向对象**的语言（几乎一切皆对象，少数基本类型除外）。它支持面向对象的三大特性：**封装、继承、多态**。

#### 2. 简单性

Java 的语法源自 C/C++，但去掉了容易出错的特性：**没有指针**（用引用代替）、**没有手动内存管理**（GC 自动回收）、**没有多重继承**（用接口代替）、**没有头文件**。

#### 3. 分布式

Java 内置丰富的网络库（java.net），支持 TCP/UDP、HTTP、URL 访问，天生适合开发分布式应用。

#### 4. 健壮性

**强类型**检查、**异常处理**机制、**垃圾回收**、**数组边界检查**让 Java 程序比 C/C++ 更不容易崩溃。

#### 5. 安全性

字节码校验器、安全管理器、无指针运算等机制让 Java 适合在网络环境中运行不可信代码。

#### 6. 多线程

Java 语言层面内置多线程支持（java.lang.Thread），比 C/C++ 的 pthread 更易用。

### 垃圾回收（GC）简介

**垃圾回收（Garbage Collection，GC）**是 Java 相对 C/C++ 的一大优势。在 C/C++ 中，程序员必须手动 \`malloc/free\` 或 \`new/delete\` 管理内存，容易导致**内存泄漏**（忘记释放）和**悬垂指针**（重复释放）。

Java 的 GC 会**自动**监测哪些对象不再被引用，并回收它们占用的内存：

- **可达性分析**：JVM 从"GC Roots"（局部变量、静态字段等）出发，遍历对象引用链。不在任何引用链上的对象就是垃圾。
- **分代回收**：JVM 把堆分为**新生代**（Young Generation）和**老年代**（Old Generation）。新对象分配在新生代，多数对象"朝生夕死"，频繁回收新生代开销小；存活久的对象晋升到老年代，较少回收。
- **常见收集器**：Serial、Parallel、CMS、G1（Java 9 默认）、ZGC、Shenandoah。

程序员虽然不用手动释放内存，但仍需注意**无意中保持引用**导致的隐式内存泄漏。

### Java 与其他语言对比

| 对比维度 | Java | Python | C++ | JavaScript | Go |
| --- | --- | --- | --- | --- | --- |
| **类型系统** | 静态强类型 | 动态强类型 | 静态强类型 | 动态弱类型 | 静态强类型 |
| **执行方式** | 编译为字节码+JVM | 解释执行(字节码) | 编译为机器码 | 解释+JIT | 编译为机器码 |
| **内存管理** | 自动(GC) | 自动(GC) | 手动+RAII | 自动(GC) | 自动(GC) |
| **运行速度** | 较快 | 较慢 | 最快 | 中等 | 很快 |
| **跨平台** | 极强(JVM) | 强(解释器) | 需重编译 | 强(浏览器/Node) | 强(交叉编译) |
| **学习难度** | 中 | 低 | 高 | 中 | 低 |
| **主要领域** | 企业后端/Android | AI/数据/Web | 系统/游戏 | 前端/Node | 后端/云原生 |

### 第一个 Java 程序：Hello World

\`\`\`java
// Hello.java —— 文件名必须与 public 类名一致
public class Hello {  // 定义类 Hello
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        System.out.println("Hello, World!");  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

逐行解释：

- \`public class Hello\`：声明一个公开类，类名是 \`Hello\`。Java 规定**一个 .java 文件只能有一个 public 类**，且文件名必须与它一致。
- \`public static void main(String[] args)\`：程序入口方法。\`public\` 公开可访问，\`static\` 静态方法可直接调用，\`void\` 无返回值，\`String[] args\` 命令行参数。
- \`System.out.println(...)\`：向标准输出打印一行。\`System.out\` 是标准输出流，\`println\` 是"print line"的缩写。

### 安装 JDK

#### Windows / macOS / Linux

推荐安装 **Oracle JDK** 或开源的 **OpenJDK**（如 Adoptium/Temurin）。安装后验证：

\`\`\`bash
java -version       # 查看 JRE 版本
javac -version      # 查看编译器版本
\`\`\`

记得配置 **JAVA_HOME** 环境变量并确保 \`javac\` 在 PATH 中。

### 常用开发工具

| 工具 | 特点 |
| --- | --- |
| **IntelliJ IDEA** | JetBrains 出品，最强大的 Java IDE，社区版免费 |
| **Eclipse** | 老牌开源 IDE，插件丰富 |
| **VS Code** | 配合 Java 扩展包，轻量好用 |
| **JShell** | Java 9+ 自带的交互式 REPL |

### 本节代码演示

下面这段代码综合演示 Java 的基本写法：输出、变量声明、字符串拼接、for 循环。你可以在编辑器中修改后点击"运行代码"查看输出，直观感受 Java 的风格。`,
    code: `// ============================================================
// 第一章代码演示：Java 写法全景体验
// ============================================================
// 这段代码演示了 Java 的基本语法和常见特性，
// 包括：标准输出、变量声明、字符串拼接、for 循环。
// 你可以修改任何部分后重新运行，观察结果变化。

public class Main {
    public static void main(String[] args) {
        // ---- 1. 最经典的 Hello World ----
        System.out.println("========== 1. Hello World ==========");
        System.out.println("Hello, World!");
        System.out.println("你好，Java！");
        // println 输出后自动换行，print 不换行
        System.out.print("同一行");
        System.out.println(" 后半句");

        // 可以输出多种类型的数据
        System.out.println(42);          // 输出整数
        System.out.println(3.14);        // 输出浮点数
        System.out.println(true);        // 输出布尔值

        // ---- 2. 变量声明 ----
        System.out.println("\\n========== 2. 变量声明 ==========");
        // Java 是静态类型语言，变量必须先声明类型
        String name = "张三";            // 字符串
        int age = 28;                    // 整数
        double height = 1.75;            // 浮点数
        boolean isStudent = true;        // 布尔值

        System.out.println("姓名: " + name);
        System.out.println("年龄: " + age);
        System.out.println("身高: " + height);
        System.out.println("是学生吗: " + isStudent);

        // ---- 3. 字符串拼接 ----
        System.out.println("\\n========== 3. 字符串拼接 ==========");
        // 用 + 拼接字符串和其他类型
        String message = "我叫" + name + "，今年" + age + "岁，身高" + height + "米";
        System.out.println(message);

        // 字符串和数字拼接时，从左到右依次拼接
        System.out.println("1 + 2 = " + 1 + 2);          // "1 + 2 = 12"（先拼成字符串）
        System.out.println("1 + 2 = " + (1 + 2));        // "1 + 2 = 3"（括号先算）

        // ---- 4. for 循环 ----
        System.out.println("\\n========== 4. for 循环 ==========");
        // 经典 for 循环：for (初始化; 条件; 更新)
        System.out.println("打印 1 到 5:");
        for (int i = 1; i <= 5; i++) {
            System.out.println("  第 " + i + " 次循环");
        }

        // 累加求和
        int sum = 0;
        for (int i = 1; i <= 10; i++) {
            sum += i;  // 等价于 sum = sum + i
        }
        System.out.println("1 到 10 的和: " + sum);

        // 打印九九乘法表片段
        System.out.println("\\n========== 5. 九九乘法表（前 3 行）==========");
        for (int i = 1; i <= 3; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print(j + "x" + i + "=" + (i * j) + "\\t");
            }
            System.out.println();  // 换行
        }

        // ---- 6. 简单条件判断 ----
        System.out.println("\\n========== 6. 条件判断 ==========");
        if (age >= 18) {
            System.out.println(name + " 已成年");
        } else {
            System.out.println(name + " 未成年");
        }

        // 三目运算符
        String status = isStudent ? "学生" : "非学生";
        System.out.println("状态: " + status);

        System.out.println("\\n以上就是 Java 基础语法的全景演示！");
        System.out.println("你可以修改代码中的任何内容，然后重新运行查看效果。");
    }
}`,
  },

  // =========================================================
  // 第二章：变量与数据类型
  // =========================================================
  {
    id: "java-variables",
    group: "基础",
    icon: "📦",
    title: "变量与数据类型",
    content: `## 变量与数据类型

**变量**是程序中存储数据的"容器"，**数据类型**决定了容器能装什么样的数据、占用多少内存、能做什么操作。Java 是**静态强类型**语言：每个变量在声明时必须明确类型，且类型一经确定不能改变（这与 Python 的动态类型截然不同）。本章将全面讲解 Java 的类型系统。

### Java 的类型体系

Java 的数据类型分为两大类：

\`\`\`
Java 数据类型
├── 基本类型（Primitive Types）—— 8 种，存的是值本身
│   ├── 整型：byte, short, int, long
│   ├── 浮点型：float, double
│   ├── 字符型：char
│   └── 布尔型：boolean
└── 引用类型（Reference Types）—— 存的是对象的地址
    ├── 类（class）：String, Integer, 自定义类...
    ├── 接口（interface）
    └── 数组（array）
\`\`\`

### 8 种基本类型

基本类型是 Java 中最底层的数据类型，直接存储值，效率高。共 8 种：

| 类型 | 占用内存 | 取值范围 | 默认值 | 用途 |
| --- | --- | --- | --- | --- |
| \`byte\` | 1 字节 | -128 到 127 | 0 | 节省内存的小整数 |
| \`short\` | 2 字节 | -32768 到 32767 | 0 | 短整数 |
| \`int\` | 4 字节 | -2³¹ 到 2³¹-1（约 ±21 亿） | 0 | **最常用的整数类型** |
| \`long\` | 8 字节 | -2⁶³ 到 2⁶³-1 | 0L | 超大整数 |
| \`float\` | 4 字节 | 约 ±3.4e38（6-7 位有效数字） | 0.0f | 单精度浮点 |
| \`double\` | 8 字节 | 约 ±1.8e308（15 位有效数字） | 0.0d | **最常用的浮点类型** |
| \`char\` | 2 字节 | 0 到 65535（Unicode） | '\\u0000' | 单个字符 |
| \`boolean\` | 1 位（JVM 实现相关） | true / false | false | 真/假 |

#### 整型

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        int age = 28;                // 最常用
        long population = 14000000000L;  // long 字面量必须加 L 后缀
        byte b = 100;                // byte 范围小，注意溢出
        short s = 1000;  // 声明变量 s（short），初始值为 1000
    }
}
\`\`\`

**注意**：整数字面量默认是 \`int\` 类型。赋给 \`long\` 时必须加 \`L\` 后缀（小写 l 容易和 1 混淆，推荐大写 L）。

Java 支持下划线分隔大数字（Java 7+），提高可读性：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        int million = 1_000_000;  // 声明变量 million（int），初始值为 1_000_000
        long big = 1_000_000_000_000L;  // 声明变量 big（long），初始值为 1_000_000_000_000L
    }
}
\`\`\`

支持二进制（\`0b\`）、八进制（\`0\`）、十六进制（\`0x\`）字面量：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        int bin = 0b1010;     // 10
        int oct = 012;        // 10
        int hex = 0xFF;       // 255
    }
}
\`\`\`

#### 浮点型

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        double pi = 3.141592653589793;  // 默认就是 double
        float f = 3.14f;                // float 字面量必须加 f 后缀
        double scientific = 6.022e23;   // 科学计数法
    }
}
\`\`\`

**浮点精度陷阱**：和所有 IEEE 754 浮点数一样，Java 的 double 也有精度问题：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        System.out.println(0.1 + 0.2);        // 0.30000000000000004
        System.out.println(0.1 + 0.2 == 0.3); // false
    }
}
\`\`\`

涉及金额等精确计算时，应使用 \`java.math.BigDecimal\`：

\`\`\`java
import java.math.BigDecimal;  // 导入类 java.math.BigDecimal

public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        BigDecimal a = new BigDecimal("0.1");  // 声明变量 a（BigDecimal），初始值为 new BigDecimal("0.1")
        BigDecimal b = new BigDecimal("0.2");  // 声明变量 b（BigDecimal），初始值为 new BigDecimal("0.2")
        System.out.println(a.add(b));   // 0.3，精确
    }
}
\`\`\`

#### 字符型 char

\`char\` 存储**单个 Unicode 字符**，用单引号包裹：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        char letter = 'A';  // 声明变量 letter（char），初始值为 'A'
        char chinese = '中';  // 声明变量 chinese（char），初始值为 '中'
        char num = '9';  // 声明变量 num（char），初始值为 '9'
    }
}
\`\`\`

\`char\` 本质上是一个**无符号 16 位整数**（0-65535），可以参与整数运算：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        char c = 'A';  // 声明变量 c（char），初始值为 'A'
        System.out.println((int) c);     // 65，A 的 Unicode 码点
        System.out.println((char) 66);   // B
        System.out.println(c + 1);       // 66（char 提升为 int 参与运算）
    }
}
\`\`\`

#### 布尔型 boolean

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        boolean isJavaFun = true;  // 声明变量 isJavaFun（boolean），初始值为 true
        boolean isBoring = false;  // 声明变量 isBoring（boolean），初始值为 false
    }
}
\`\`\`

Java 的 boolean 只有 \`true\` 和 \`false\` 两个值，**不能**像 C/C++ 那样用 0/1 代替，也**不能**与整数相互转换。

### 引用类型

引用类型变量存储的是**对象的内存地址**（引用），而非对象本身。最常见的引用类型是 \`String\`：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        String name = "张三";          // 字符串字面量
        String greeting = new String("Hello");  // 用 new 创建
    }
}
\`\`\`

基本类型和引用类型的核心区别：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        // 基本类型：赋值是拷贝值
        int a = 10;  // 声明变量 a（int），初始值为 10
        int b = a;  // 声明变量 b（int），初始值为 a
        b = 20;  // 为 b 赋值：20
        System.out.println(a);  // 10，a 不受影响

        // 引用类型：赋值是拷贝引用（指向同一个对象）
        int[] arr1 = {1, 2, 3};  // 声明变量 arr1（int[]），初始值为 {1, 2, 3}
        int[] arr2 = arr1;  // 声明变量 arr2（int[]），初始值为 arr1
        arr2[0] = 99;  // 为数组 arr2 的某元素赋值：99
        System.out.println(arr1[0]);  // 99，arr1 也变了！因为是同一个数组对象
    }
}
\`\`\`

### 变量声明与初始化

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        // 先声明后赋值
        int x;  // 声明变量 x（int 类型）
        x = 10;  // 为 x 赋值：10

        // 声明同时初始化
        int y = 20;  // 声明变量 y（int），初始值为 20

        // 同时声明多个同类型变量
        int m = 1, n = 2, k = 3;  // 声明变量 m（int），初始值为 1, n = 2, k = 3
    }
}
\`\`\`

**成员变量**（类中方法外）有默认值（0、false、null），**局部变量**（方法内）没有默认值，使用前必须初始化，否则编译报错：

\`\`\`java
public class Main {  // 定义类 Main
    public void demo() {  // 方法 demo，返回 void，无参数
        int z;  // 声明变量 z（int 类型）
        // System.out.println(z);  // ❌ 编译错误：可能尚未初始化变量 z
        z = 5;  // 为 z 赋值：5
        System.out.println(z);     // ✅
    }

    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        new Main().demo();  // 调用 new Main() 的 demo 方法
    }
}
\`\`\`

### var 关键字（Java 10+）

Java 10 引入了 \`var\` 关键字，用于**局部变量类型推断**。编译器会根据右侧的值自动推断类型：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        var name = "张三";       // 推断为 String
        var age = 28;            // 推断为 int
        var list = new java.util.ArrayList<String>();  // 推断为 ArrayList<String>
    }
}
\`\`\`

**注意**：
- \`var\` 只能用于**局部变量**（方法内部），不能用于成员变量、方法参数、返回值类型。
- \`var\` 只是语法糖，Java **仍然是静态类型**——类型在编译期就确定了，运行时和写全类型完全一样。
- 不能用 \`var\` 声明而不初始化：\`var x;\` 是非法的，因为无法推断类型。

### 类型转换

#### 自动类型转换（隐式， widening）

小类型向大类型自动转换，不会丢失精度：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        byte b = 100;  // 声明变量 b（byte），初始值为 100
        int i = b;        // byte → int，自动
        long l = i;       // int → long，自动
        double d = l;     // long → double，自动
    }
}
\`\`\`

转换方向（从低到高）：
\`byte\` → \`short\`/\`char\` → \`int\` → \`long\` → \`float\` → \`double\`

#### 强制类型转换（显式， narrowing）

大类型向小类型转换必须显式强转，**可能丢失精度**：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        double d = 3.99;  // 声明变量 d（double），初始值为 3.99
        int i = (int) d;    // 3，直接截断小数部分（不是四舍五入）
        System.out.println(i);  // 打印一行到标准输出（自动换行）

        int big = 300;  // 声明变量 big（int），初始值为 300
        byte b = (byte) big;  // 溢出！300 超出 byte 范围，结果为 44
        System.out.println(b);  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

#### 表达式中的自动提升

在表达式中，\`byte\`、\`short\`、\`char\` 会自动提升为 \`int\` 参与运算：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        byte a = 10, b = 20;  // 声明变量 a（byte），初始值为 10, b = 20
        // byte c = a + b;   // ❌ 编译错误：a + b 的结果是 int
        byte c = (byte)(a + b);  // ✅ 需要强转
    }
}
\`\`\`

### 包装类（Wrapper Classes）

Java 是面向对象语言，但 8 种基本类型不是对象。为了在需要对象的场合（如集合类只能存对象）使用它们，Java 为每种基本类型提供了**包装类**：

| 基本类型 | 包装类 |
| --- | --- |
| byte | Byte |
| short | Short |
| int | **Integer** |
| long | Long |
| float | Float |
| double | Double |
| char | **Character** |
| boolean | Boolean |

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        Integer ageObj = Integer.valueOf(28);   // int → Integer
        int age = ageObj.intValue();            // Integer → int

        // 直接赋值也行（自动装箱）
        Integer x = 100;   // 自动装箱
        int y = x;         // 自动拆箱
    }
}
\`\`\`

### 自动装箱与拆箱（Autoboxing / Unboxing）

Java 5 引入了自动装箱/拆箱，让基本类型和包装类之间自动转换：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        // 自动装箱：int → Integer
        Integer a = 10;   // 等价于 Integer a = Integer.valueOf(10);

        // 自动拆箱：Integer → int
        int b = a;        // 等价于 int b = a.intValue();
    }
}
\`\`\`

这让包装类使用起来几乎和基本类型一样方便。但要注意：

**1. Integer 缓存陷阱**：\`Integer\` 会缓存 -128 到 127 的对象，这个范围内 \`==\` 比较为 true，超出范围为 false：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        Integer a = 127;  // 声明变量 a（Integer），初始值为 127
        Integer b = 127;  // 声明变量 b（Integer），初始值为 127
        System.out.println(a == b);   // true（缓存）

        Integer c = 128;  // 声明变量 c（Integer），初始值为 128
        Integer d = 128;  // 声明变量 d（Integer），初始值为 128
        System.out.println(c == d);   // false（超出缓存，是不同对象）
        System.out.println(c.equals(d));  // true（比较值，推荐用 equals）
    }
}
\`\`\`

**2. 空指针风险**：包装类可以为 null，自动拆箱时会抛 \`NullPointerException\`：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        Integer obj = null;  // 声明变量 obj（Integer），初始值为 null
        try {  // try 块：包裹可能抛出异常的代码
            int n = obj;   // ❌ NullPointerException（自动拆箱时）
            System.out.println(n);  // 打印一行到标准输出（自动换行）
        } catch (NullPointerException e) {  // 捕获异常 NullPointerException e
            System.out.println("抛出 NullPointerException：obj 为 null 时不能自动拆箱");  // 打印一行到标准输出（自动换行）
        }
    }
}
\`\`\`

**3. 性能**：自动装箱会创建对象，在循环中频繁装箱影响性能，基本类型更高效。

### 常量 final

用 \`final\` 关键字声明的变量只能赋值一次，成为常量：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        final double PI = 3.14159265;  // 声明常量变量 PI（double），初始值为 3.14159265
        // PI = 3.14;  // ❌ 编译错误：不能修改 final 变量

        final String APP_NAME = "我的应用";  // 声明常量变量 APP_NAME（String），初始值为 "我的应用"
    }
}
\`\`\`

命名约定：常量用**全大写 + 下划线**，如 \`MAX_SIZE\`、\`DEFAULT_TIMEOUT\`。

\`final\` 还可以修饰方法（不能被重写）和类（不能被继承）。

### 何时用基本类型，何时用包装类

- **优先用基本类型**：更快、更省内存、不会有空指针。
- **必须用包装类的场景**：
  - 集合类（\`List<Integer>\`、\`Map<String, Double>\`）只能存对象。
  - 反射、泛型需要对象。
  - 数据库实体字段可能为 null 时（如年龄未填），用 \`Integer\` 而非 \`int\`。

### 本节代码演示

下面这段代码综合演示了 8 种基本类型、类型转换、var 关键字、包装类、自动装箱拆箱、final 常量。运行后仔细观察输出。`,
    code: `// ============================================================
// 第二章代码演示：变量与数据类型
// ============================================================
// 本代码演示：8 种基本类型、类型转换、var 关键字、
// 包装类、自动装箱拆箱、final 常量、BigDecimal 精确计算

public class Main {
    public static void main(String[] args) {
        // ---- 1. 整型 ----
        System.out.println("========== 1. 整型 ==========");
        byte byteVar = 100;
        short shortVar = 1000;
        int intVar = 100000;
        long longVar = 10000000000L;  // long 字面量必须加 L
        System.out.println("byte: " + byteVar);
        System.out.println("short: " + shortVar);
        System.out.println("int: " + intVar);
        System.out.println("long: " + longVar);

        // 下划线分隔大数字（Java 7+）
        int million = 1_000_000;
        long bigNumber = 1_000_000_000_000L;
        System.out.println("百万(下划线分隔): " + million);
        System.out.println("万亿: " + bigNumber);

        // 不同进制
        System.out.println("二进制 0b1010 = " + 0b1010);
        System.out.println("八进制 012 = " + 012);
        System.out.println("十六进制 0xFF = " + 0xFF);

        // ---- 2. 浮点型 ----
        System.out.println("\\n========== 2. 浮点型 ==========");
        double pi = 3.141592653589793;
        float f = 3.14f;  // float 字面量必须加 f
        double scientific = 6.022e23;  // 科学计数法
        System.out.println("double pi = " + pi);
        System.out.println("float f = " + f);
        System.out.println("科学计数法 = " + scientific);

        // 浮点精度陷阱
        System.out.println("0.1 + 0.2 = " + (0.1 + 0.2));
        System.out.println("0.1 + 0.2 == 0.3 ? " + (0.1 + 0.2 == 0.3));

        // 用 BigDecimal 做精确计算
        java.math.BigDecimal a = new java.math.BigDecimal("0.1");
        java.math.BigDecimal b = new java.math.BigDecimal("0.2");
        System.out.println("BigDecimal 0.1 + 0.2 = " + a.add(b));

        // ---- 3. 字符型 ----
        System.out.println("\\n========== 3. 字符型 char ==========");
        char letter = 'A';
        char chinese = '中';
        char digit = '9';
        System.out.println("字母: " + letter);
        System.out.println("中文: " + chinese);
        System.out.println("数字字符: " + digit);

        // char 本质是无符号整数，可参与运算
        System.out.println("'A' 的码点: " + (int) letter);   // 65
        System.out.println("码点 66 对应字符: " + (char) 66);  // B
        System.out.println("'中' 的码点: " + (int) chinese);   // 20013

        // ---- 4. 布尔型 ----
        System.out.println("\\n========== 4. 布尔型 ==========");
        boolean isJavaFun = true;
        boolean isBoring = false;
        System.out.println("Java 有趣吗: " + isJavaFun);
        System.out.println("Java 无聊吗: " + isBoring);
        System.out.println("逻辑运算: isJavaFun && !isBoring = " + (isJavaFun && !isBoring));

        // ---- 5. 引用类型 vs 基本类型 ----
        System.out.println("\\n========== 5. 引用类型 vs 基本类型 ==========");
        // 基本类型：拷贝值
        int x = 10;
        int y = x;
        y = 20;
        System.out.println("基本类型: x=" + x + ", y=" + y + "（x 不受影响）");

        // 引用类型：拷贝引用（指向同一对象）
        int[] arr1 = {1, 2, 3};
        int[] arr2 = arr1;
        arr2[0] = 99;
        System.out.println("引用类型: arr1[0]=" + arr1[0] + "（arr1 也变了！）");

        // ---- 6. var 关键字（Java 10+）----
        System.out.println("\\n========== 6. var 关键字 ==========");
        var name = "张三";        // 推断为 String
        var age = 28;             // 推断为 int
        var numbers = new int[]{10, 20, 30};  // 推断为 int[]
        System.out.println("name = " + name);
        System.out.println("age = " + age);
        System.out.println("numbers 长度 = " + numbers.length);

        // ---- 7. 类型转换 ----
        System.out.println("\\n========== 7. 类型转换 ==========");
        // 自动转换（小→大）
        byte b1 = 100;
        int i1 = b1;       // byte → int
        long l1 = i1;      // int → long
        double d1 = l1;    // long → double
        System.out.println("自动转换: byte " + b1 + " → int " + i1 + " → long " + l1 + " → double " + d1);

        // 强制转换（大→小，可能丢精度）
        double d2 = 3.99;
        int i2 = (int) d2;  // 截断小数部分
        System.out.println("强转 double " + d2 + " → int " + i2 + "（截断，非四舍五入）");

        // 溢出示例
        int big = 300;
        byte b2 = (byte) big;  // 300 超出 byte 范围，溢出
        System.out.println("强转 int 300 → byte " + b2 + "（溢出）");

        // 表达式中的类型提升
        byte ba = 10, bb = 20;
        int sum = ba + bb;  // byte 相加会提升为 int
        System.out.println("byte 相加提升为 int: " + ba + " + " + bb + " = " + sum);

        // ---- 8. 包装类 ----
        System.out.println("\\n========== 8. 包装类 ==========");
        Integer ageObj = Integer.valueOf(28);  // int → Integer
        int agePrim = ageObj.intValue();       // Integer → int
        System.out.println("Integer 对象: " + ageObj);
        System.out.println("转回 int: " + agePrim);

        // 包装类的常用方法
        System.out.println("Integer.parseInt(\\\"42\\\"): " + Integer.parseInt("42"));
        System.out.println("Integer.MAX_VALUE: " + Integer.MAX_VALUE);
        System.out.println("Integer.MIN_VALUE: " + Integer.MIN_VALUE);
        System.out.println("Double.MAX_VALUE: " + Double.MAX_VALUE);
        System.out.println("Boolean.TRUE: " + Boolean.TRUE);

        // ---- 9. 自动装箱拆箱 ----
        System.out.println("\\n========== 9. 自动装箱拆箱 ==========");
        // 自动装箱：int → Integer
        Integer boxed = 100;   // 等价于 Integer.valueOf(100)
        System.out.println("自动装箱: Integer boxed = " + boxed);

        // 自动拆箱：Integer → int
        int unboxed = boxed;   // 等价于 boxed.intValue()
        System.out.println("自动拆箱: int unboxed = " + unboxed);

        // 装箱后可参与运算（自动拆箱）
        Integer x1 = 50, y1 = 60;
        int result = x1 + y1;  // 自动拆箱后相加
        System.out.println("两个 Integer 相加: " + x1 + " + " + y1 + " = " + result);

        // ---- 10. Integer 缓存陷阱 ----
        System.out.println("\\n========== 10. Integer 缓存（-128 ~ 127）==========");
        Integer a1 = 127;
        Integer b3 = 127;
        System.out.println("127 == 127: " + (a1 == b3));        // true（缓存内）

        Integer a2 = 128;
        Integer b4 = 128;
        System.out.println("128 == 128: " + (a2 == b4));        // false（超出缓存）
        System.out.println("128.equals(128): " + a2.equals(b4)); // true（比较值）

        System.out.println("结论：比较包装类用 equals()，不要用 ==");

        // ---- 11. final 常量 ----
        System.out.println("\\n========== 11. final 常量 ==========");
        final double PI = 3.14159265;
        final String APP_NAME = "我的 Java 应用";
        final int MAX_SIZE = 100;
        // PI = 3.14;  // 编译错误：不能修改 final 变量
        System.out.println("PI = " + PI);
        System.out.println("APP_NAME = " + APP_NAME);
        System.out.println("MAX_SIZE = " + MAX_SIZE);

        System.out.println("\\n变量与数据类型演示完成！");
    }
}`,
  },

  // =========================================================
  // 第三章：运算符与表达式
  // =========================================================
  {
    id: "java-operators",
    group: "基础",
    icon: "⚙️",
    title: "运算符与表达式",
    content: `## 运算符与表达式

**运算符（Operator）** 是告诉 Java 执行某种运算的符号，**表达式（Expression）** 是由运算符和操作数组成、能计算出结果的代码片段。本章全面讲解 Java 的各类运算符、优先级规则和短路求值机制。

### 算术运算符

| 运算符 | 含义 | 示例 | 结果 |
| --- | --- | --- | --- |
| \`+\` | 加法 | \`3 + 2\` | \`5\` |
| \`-\` | 减法 | \`5 - 2\` | \`3\` |
| \`*\` | 乘法 | \`3 * 4\` | \`12\` |
| \`/\` | 除法 | \`7 / 2\` | \`3\`（整数除法截断） |
| \`%\` | 取余 | \`7 % 3\` | \`1\` |
| \`++\` | 自增 | \`i++\` | i 加 1 |
| \`--\` | 自减 | \`i--\` | i 减 1 |

#### 整数除法

Java 的 \`/\` 对整数是**截断除法**（向零取整），不是 Python 的地板除：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        System.out.println(7 / 2);    // 3（截断小数）
        System.out.println(-7 / 2);   // -3（向零取整，注意与 Python 的 -4 不同）
        System.out.println(7 / 2.0);  // 3.5（有浮点数参与则为浮点除法）
    }
}
\`\`\`

#### 取余 %

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        System.out.println(7 % 3);    // 1
        System.out.println(-7 % 3);   // -1（结果符号与被除数相同，注意与 Python 不同）
        System.out.println(7 % -3);   // 1
    }
}
\`\`\`

#### 自增自减 ++ --

\`++\` 和 \`--\` 有**前置**和**后置**两种形式，区别在于返回值：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        int i = 5;  // 声明变量 i（int），初始值为 5
        int a = i++;   // a=5, i=6（后置：先赋值再自增）
        int b = ++i;   // i=7, b=7（前置：先自增再赋值）
    }
}
\`\`\`

**建议**：为避免混淆，尽量单独使用 \`i++\`，不要嵌在复杂表达式中。

### 关系运算符

返回 \`boolean\` 值：

| 运算符 | 含义 | 示例 |
| --- | --- | --- |
| \`==\` | 等于 | \`3 == 3\` → true |
| \`!=\` | 不等于 | \`3 != 4\` → true |
| \`>\` | 大于 | \`5 > 3\` → true |
| \`<\` | 小于 | \`5 < 3\` → false |
| \`>=\` | 大于等于 | \`5 >= 5\` → true |
| \`<=\` | 小于等于 | \`5 <= 4\` → false |

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        System.out.println(3 == 3);   // true
        System.out.println(5 > 3);    // true
    }
}
\`\`\`

**注意**：比较**引用类型**时，\`==\` 比较的是地址（是否同一对象），\`equals()\` 比较的是内容。这是 Java 最经典的陷阱之一，字符串章节会详细讲解。

### 逻辑运算符

Java 有两组逻辑运算符：

| 运算符 | 含义 | 短路？ |
| --- | --- | --- |
| \`&&\` | 逻辑与 | ✅ 短路 |
| \`\\|\\|\` | 逻辑或 | ✅ 短路 |
| \`!\` | 逻辑非 | - |
| \`&\` | 按位与（也可做逻辑与） | ❌ 不短路 |
| \`\\|\` | 按位或（也可做逻辑或） | ❌ 不短路 |
| \`^\` | 逻辑异或 | ❌ 不短路 |

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        System.out.println(true && false);   // false
        System.out.println(true || false);   // true
        System.out.println(!true);           // false
    }
}
\`\`\`

#### 短路求值（Short-circuit）

\`&&\` 和 \`\\|\\|\` 具有**短路特性**：如果能由左操作数确定结果，就不计算右操作数。

\`\`\`java
public class Main {  // 定义类 Main
    // 模拟一个"昂贵"的调用，用来观察是否被执行
    static boolean expensiveCall() {  // 静态方法 expensiveCall，返回 boolean，无参数
        System.out.println("  expensiveCall 被调用了！");  // 打印一行到标准输出（自动换行）
        return true;  // 返回值：true
    }

    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        // && 短路：左边为 false 时，不计算右边
        boolean result = (1 > 2) && expensiveCall();   // expensiveCall 不会被调用
        System.out.println("result = " + result);  // 打印一行到标准输出（自动换行）

        // || 短路：左边为 true 时，不计算右边
        boolean result2 = (1 < 2) || expensiveCall();  // expensiveCall 不会被调用
        System.out.println("result2 = " + result2);  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

短路求值常用于**安全访问**，避免空指针：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        String str = null;  // 声明变量 str（String），初始值为 null
        if (str != null && str.length() > 0) {  // 条件判断：满足 str != null && str.length() > 0 时执行
            // 如果 str 为 null，由于短路，str.length() 不会被执行，避免空指针
            System.out.println("字符串非空");  // 打印一行到标准输出（自动换行）
        } else {  // 否则分支
            System.out.println("str 为 null 或空串，短路保护避免了 NPE");  // 打印一行到标准输出（自动换行）
        }
    }
}
\`\`\`

#### && vs &

\`&&\` 和 \`&\` 在布尔运算中结果相同，区别在于：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        int x = 0;  // 声明变量 x（int），初始值为 0
        // && 短路：x != 0 为 false，不计算 10/x，不会除零
        boolean r1 = (x != 0) && (10 / x > 1);   // 安全，r1 = false
        System.out.println("r1 = " + r1);  // 打印一行到标准输出（自动换行）

        // & 不短路：两边都计算，10/x 会抛 ArithmeticException
        // boolean r2 = (x != 0) & (10 / x > 1);  // ❌ 除零异常
    }
}
\`\`\`

日常逻辑判断**始终用 \`&&\` 和 \`\\|\\|\`**，\`&\` 和 \`\\|\`\` 留给位运算。

### 位运算符

直接操作整数的二进制位：

| 运算符 | 含义 | 示例 | 说明 |
| --- | --- | --- | --- |
| \`&\` | 按位与 | \`5 & 3\` → 1 | 两位都为 1 才为 1 |
| \`\\|\` | 按位或 | \`5 \\| 3\` → 7 | 有一位为 1 就为 1 |
| \`^\` | 按位异或 | \`5 ^ 3\` → 6 | 两位不同为 1 |
| \`~\` | 按位取反 | \`~5\` → -6 | 0 变 1，1 变 0 |
| \`<<\` | 左移 | \`5 << 2\` → 20 | 左移 n 位 = 乘 2ⁿ |
| \`>>\` | 右移（带符号） | \`-8 >> 1\` → -4 | 高位补符号位 |
| \`>>>\` | 无符号右移 | \`-8 >>> 28\` | 高位补 0 |

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        // 5 的二进制: 0101
        // 3 的二进制: 0011
        System.out.println(5 & 3);    // 1  (0001)
        System.out.println(5 | 3);    // 7  (0111)
        System.out.println(5 ^ 3);    // 6  (0110)
        System.out.println(~5);       // -6 (取反)
        System.out.println(5 << 2);   // 20 (左移2位 = *4)
        System.out.println(20 >> 2);  // 5  (右移2位 = /4)
    }
}
\`\`\`

位运算常见用途：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        // 判断奇偶（比 n % 2 更快）
        int n = 7;  // 声明变量 n（int），初始值为 7
        boolean isOdd = (n & 1) == 1;  // 声明变量 isOdd（boolean），初始值为 (n & 1) == 1
        System.out.println(n + " 是奇数吗: " + isOdd);  // 打印一行到标准输出（自动换行）

        // 权限标志（位掩码）
        final int READ = 4, WRITE = 2, EXECUTE = 1;  // 100, 010, 001
        int permission = READ | WRITE;   // 110 = 6
        boolean canRead = (permission & READ) != 0;  // 声明变量 canRead（boolean），初始值为 (permission & READ) != 0
        System.out.println("权限值: " + permission + "，有读权限: " + canRead);  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

### 赋值运算符

#### 基本赋值

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        int x = 10;  // 声明变量 x（int），初始值为 10
    }
}
\`\`\`

#### 复合赋值运算符

| 运算符 | 等价于 |
| --- | --- |
| \`+=\` | \`x = x + y\` |
| \`-=\` | \`x = x - y\` |
| \`*=\` | \`x = x * y\` |
| \`/=\` | \`x = x / y\` |
| \`%=\` | \`x = x % y\` |
| \`&=\` | \`x = x & y\` |
| \`\\|=\` | \`x = x \\| y\` |
| \`^=\` | \`x = x ^ y\` |
| \`<<=\` | \`x = x << y\` |
| \`>>=\` | \`x = x >> y\` |

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        int x = 10;  // 声明变量 x（int），初始值为 10
        x += 5;    // x = 15
        x -= 3;    // x = 12
        x *= 2;    // x = 24
        x /= 4;    // x = 6
        x %= 4;    // x = 2
    }
}
\`\`\`

**注意**：复合赋值运算符包含**隐式类型转换**。\`x += y\` 等价于 \`x = (类型)(x + y)\`，所以 \`byte b = 10; b += 5;\` 合法（不需要强转），但 \`b = b + 5;\` 编译错误。

### 条件运算符（三目运算符）

Java 的三目运算符语法：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        // 条件 ? 值1 : 值2
        // 条件为 true 返回值1，否则返回值2

        int age = 20;  // 声明变量 age（int），初始值为 20
        String status = age >= 18 ? "成年" : "未成年";  // "成年"
        System.out.println(status);  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

三目运算符可以嵌套，但不宜过深：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        int score = 85;  // 声明变量 score（int），初始值为 85
        String grade = score >= 90 ? "优秀" : (score >= 80 ? "良好" : "及格");  // 声明变量 grade（String），初始值为 score >= 90 ? "优秀" : (score >= 80 ? "良好" : "及格")
        System.out.println(grade);  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

### instanceof 运算符

\`instanceof\` 用于判断对象是否是某个类（或其子类、接口实现）的实例：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        String s = "hello";  // 声明变量 s（String），初始值为 "hello"
        System.out.println(s instanceof String);     // true
        System.out.println(s instanceof Object);    // true（String 是 Object 子类）

        Object obj = "test";  // 声明变量 obj（Object），初始值为 "test"
        if (obj instanceof String) {  // 条件判断：满足 obj instanceof String 时执行
            String str = (String) obj;   // 安全强转
            System.out.println(str.length());  // 打印一行到标准输出（自动换行）
        }
    }
}
\`\`\`

Java 16+ 引入了**模式匹配 instanceof**，可以一步完成类型检查和赋值：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        Object obj = "test";  // 声明变量 obj（Object），初始值为 "test"
        if (obj instanceof String str) {  // 条件判断：满足 obj instanceof String str 时执行
            // str 已自动声明并强转，直接用
            System.out.println(str.length());  // 打印一行到标准输出（自动换行）
        }
    }
}
\`\`\`

### 运算符优先级

当表达式中有多个运算符时，按优先级从高到低计算。可以用 \`()\` 改变优先级。

**优先级从高到低**（常见运算符）：

| 优先级 | 运算符 |
| --- | --- |
| 1（最高） | \`()\`、\`[]\`、\`.\` |
| 2 | \`++\`、\`--\`、\`!\`、\`~\`（一元） |
| 3 | \`*\`、\`/\`、\`%\` |
| 4 | \`+\`、\`-\` |
| 5 | \`<<\`、\`>>\`、\`>>>\` |
| 6 | \`<\`、\`<=\`、\`>\`、\`>=\`、\`instanceof\` |
| 7 | \`==\`、\`!=\` |
| 8 | \`&\` |
| 9 | \`^\` |
| 10 | \`\\|\` |
| 11 | \`&&\` |
| 12 | \`\\|\\|\` |
| 13 | \`? :\`（三目） |
| 14（最低） | \`=\`、\`+=\`、\`-=\` 等 |

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        System.out.println(2 + 3 * 4);      // 14，先乘后加
        System.out.println((2 + 3) * 4);    // 20，括号优先

        System.out.println(true || false && false);  // true，&& 优先级高于 ||
        // 等价于 true || (false && false) = true || false = true
    }
}
\`\`\`

**最佳实践**：不要死记优先级，**多用括号**让意图清晰，既避免错误又提高可读性。

### 表达式与语句

- **表达式**：能计算出一个值。如 \`3 + 5\`、\`x > 0\`、\`a ? b : c\`。
- **语句**：执行一个动作，以分号结尾。如 \`int x = 5;\`、\`if (...)\`、\`return x;\`。

### 本节代码演示

下面这段代码综合演示了算术、关系、逻辑、位、赋值、三目、instanceof 运算符，以及短路求值和优先级。`,
    code: `// ============================================================
// 第三章代码演示：运算符与表达式
// ============================================================
// 本代码演示：算术、关系、逻辑、位、赋值、三目、instanceof、
// 短路求值、运算符优先级

public class Main {
    public static void main(String[] args) {
        // ---- 1. 算术运算符 ----
        System.out.println("========== 1. 算术运算符 ==========");
        System.out.println("加法: 3 + 2 = " + (3 + 2));
        System.out.println("减法: 5 - 2 = " + (5 - 2));
        System.out.println("乘法: 3 * 4 = " + (3 * 4));
        System.out.println("整数除法: 7 / 2 = " + (7 / 2));        // 3（截断）
        System.out.println("负数除法: -7 / 2 = " + (-7 / 2));     // -3（向零取整）
        System.out.println("浮点除法: 7 / 2.0 = " + (7 / 2.0));   // 3.5
        System.out.println("取余: 7 % 3 = " + (7 % 3));           // 1
        System.out.println("负数取余: -7 % 3 = " + (-7 % 3));     // -1（符号同被除数）

        // 自增自减
        int i = 5;
        int a = i++;   // 后置：a=5, i=6
        int b = ++i;   // 前置：i=7, b=7
        System.out.println("i++ 后 a=" + a + ", i=" + 6);
        System.out.println("++i 后 b=" + b + ", i=" + 7);

        // ---- 2. 关系运算符 ----
        System.out.println("\\n========== 2. 关系运算符 ==========");
        System.out.println("3 == 3: " + (3 == 3));
        System.out.println("3 != 4: " + (3 != 4));
        System.out.println("5 > 3: " + (5 > 3));
        System.out.println("5 < 3: " + (5 < 3));
        System.out.println("5 >= 5: " + (5 >= 5));
        System.out.println("5 <= 4: " + (5 <= 4));

        // ---- 3. 逻辑运算符 ----
        System.out.println("\\n========== 3. 逻辑运算符 ==========");
        System.out.println("true && false: " + (true && false));
        System.out.println("true || false: " + (true || false));
        System.out.println("!true: " + (!true));
        System.out.println("true ^ false (异或): " + (true ^ false));

        // ---- 4. 短路求值 ----
        System.out.println("\\n========== 4. 短路求值 ==========");
        int x = 0;
        // && 短路：x != 0 为 false，10/x 不会执行，避免除零
        boolean safe = (x != 0) && (10 / x > 1);
        System.out.println("(x != 0) && (10 / x > 1) = " + safe + "（短路避免除零）");

        // 演示短路：右边方法不会被调用
        boolean r1 = false && checkMethod();
        System.out.println("false && checkMethod(): 右侧未调用");
        boolean r2 = true || checkMethod();
        System.out.println("true || checkMethod(): 右侧未调用");

        // 安全访问示例
        String str = null;
        if (str != null && str.length() > 0) {
            System.out.println("字符串非空");
        } else {
            System.out.println("短路保护：str 为 null 时不调用 length()");
        }

        // ---- 5. 位运算符 ----
        System.out.println("\\n========== 5. 位运算符 ==========");
        // 5 = 0101, 3 = 0011
        System.out.println("5 & 3 = " + (5 & 3));    // 1  (0001)
        System.out.println("5 | 3 = " + (5 | 3));    // 7  (0111)
        System.out.println("5 ^ 3 = " + (5 ^ 3));    // 6  (0110)
        System.out.println("~5 = " + (~5));          // -6 (取反)
        System.out.println("5 << 2 = " + (5 << 2));  // 20 (左移 = *4)
        System.out.println("20 >> 2 = " + (20 >> 2)); // 5  (右移 = /4)

        // 位运算应用：判断奇偶
        int n = 7;
        System.out.println("\\n" + n + " & 1 = " + (n & 1) + "（1=奇数, 0=偶数）");
        n = 8;
        System.out.println(n + " & 1 = " + (n & 1) + "（1=奇数, 0=偶数）");

        // 位掩码权限
        final int READ = 4, WRITE = 2, EXECUTE = 1;
        int permission = READ | WRITE;  // 6
        System.out.println("权限 " + permission + " 有读权限: " + ((permission & READ) != 0));
        System.out.println("权限 " + permission + " 有执行权限: " + ((permission & EXECUTE) != 0));

        // ---- 6. 赋值运算符 ----
        System.out.println("\\n========== 6. 赋值运算符 ==========");
        int val = 10;
        System.out.println("初始值: " + val);
        val += 5;  System.out.println("+= 5 -> " + val);   // 15
        val -= 3;  System.out.println("-= 3 -> " + val);   // 12
        val *= 2;  System.out.println("*= 2 -> " + val);   // 24
        val /= 4;  System.out.println("/= 4 -> " + val);   // 6
        val %= 4;  System.out.println("%= 4 -> " + val);   // 2
        val <<= 3; System.out.println("<<= 3 -> " + val);  // 16

        // ---- 7. 三目运算符 ----
        System.out.println("\\n========== 7. 三目运算符 ==========");
        int age = 20;
        String status = age >= 18 ? "成年" : "未成年";
        System.out.println("年龄 " + age + ": " + status);

        age = 15;
        status = age >= 18 ? "成年" : "未成年";
        System.out.println("年龄 " + age + ": " + status);

        // 取较大值
        int p = 10, q = 20;
        int maxVal = p > q ? p : q;
        System.out.println("max(" + p + ", " + q + ") = " + maxVal);

        // 嵌套三目（不宜过深）
        int score = 85;
        String grade = score >= 90 ? "优秀" : (score >= 80 ? "良好" : "及格");
        System.out.println("成绩 " + score + ": " + grade);

        // ---- 8. instanceof 运算符 ----
        System.out.println("\\n========== 8. instanceof ==========");
        String s = "hello";
        System.out.println("s instanceof String: " + (s instanceof String));   // true
        System.out.println("s instanceof Object: " + (s instanceof Object));   // true

        Object obj = "test";
        if (obj instanceof String) {
            String str2 = (String) obj;
            System.out.println("强转后长度: " + str2.length());
        }

        // ---- 9. 运算符优先级 ----
        System.out.println("\\n========== 9. 运算符优先级 ==========");
        System.out.println("2 + 3 * 4 = " + (2 + 3 * 4));        // 14
        System.out.println("(2 + 3) * 4 = " + ((2 + 3) * 4));    // 20
        System.out.println("2 + 3 * 4 > 10 = " + (2 + 3 * 4 > 10));  // true

        // 逻辑运算符优先级: ! > && > ||
        System.out.println("true || false && false = " + (true || false && false));  // true
        System.out.println("!true || false = " + (!true || false));                  // false

        // ---- 10. 综合应用：判断闰年 ----
        System.out.println("\\n========== 10. 综合应用：闰年判断 ==========");
        int[] years = {2000, 2020, 2021, 2024, 1900};
        for (int year : years) {
            // 闰年：能被4整除且不能被100整除，或能被400整除
            boolean isLeap = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
            System.out.println(year + " 年是" + (isLeap ? "闰年" : "平年"));
        }

        // 综合应用：交换两个数不用临时变量（位运算）
        int m = 3, k = 5;
        m = m ^ k;
        k = m ^ k;
        m = m ^ k;
        System.out.println("\\n位运算交换后: m=" + m + ", k=" + k);

        System.out.println("\\n运算符与表达式演示完成！");
    }

    // 辅助方法：用于演示短路求值
    static boolean checkMethod() {
        System.out.println("  （checkMethod 被调用了）");
        return true;
    }
}`,
  },

  // =========================================================
  // 第四章：字符串
  // =========================================================
  {
    id: "java-strings",
    group: "基础",
    icon: "📝",
    title: "字符串",
    content: `## 字符串

**字符串（String）** 是 Java 中最常用的引用类型之一，用于表示文本。Java 的字符串是**不可变（immutable）**的 Unicode 字符序列。本章将全面讲解 String 的创建、常用方法、可变字符串 StringBuilder、字符串比较、格式化和文本块。

### String 的不可变性

Java 中 \`String\` 对象一旦创建，内容就**不能被修改**。所有"修改"字符串的操作（拼接、替换等）实际上都创建了**新的 String 对象**。

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        String s = "hello";  // 声明变量 s（String），初始值为 "hello"
        s = s + " world";   // 这不是修改原对象，而是创建新对象 "hello world" 并让 s 指向它
        // 原 "hello" 对象仍存在于内存中（可能被 GC 回收）
        System.out.println(s);  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

不可变性的好处：
1. **线程安全**：多个线程可以安全共享同一个 String，无需同步。
2. **安全性**：String 常用于类加载器、网络连接等场景，不可变防止被恶意篡改。
3. **哈希缓存**：String 的 hashCode 在首次计算后被缓存，作为 HashMap 的 key 时效率高。

不可变性的代价：大量拼接字符串时会产生很多中间对象，效率低。此时应使用 \`StringBuilder\`。

### 字符串的创建

#### 字符串字面量

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        String s1 = "hello";       // 字符串字面量，存放在字符串常量池
        String s2 = "hello";       // 同一字面量，复用常量池中的对象
        System.out.println(s1 == s2);   // true（同一对象）
    }
}
\`\`\`

#### new 关键字

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        String s3 = new String("hello");   // 在堆上创建新对象
        String s4 = new String("hello");  // 声明变量 s4（String），初始值为 new String("hello")
        System.out.println(s3 == s4);      // false（两个不同对象）
        System.out.println(s3.equals(s4)); // true（内容相同）
    }
}
\`\`\`

**字符串常量池**：Java 为了节省内存，维护了一个字符串常量池。字面量创建的字符串会进入常量池，相同字面量复用同一对象。而 \`new String()\` 会在堆上创建新对象（即使内容相同）。

### 字符串比较：equals vs ==

这是 Java 最经典的面试题和常见 bug 来源：

- \`==\` 比较的是**引用**（是否是同一个对象，即内存地址）
- \`equals()\` 比较的是**内容**（字符序列是否相同）

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        String a = "hello";  // 声明变量 a（String），初始值为 "hello"
        String b = "hello";  // 声明变量 b（String），初始值为 "hello"
        String c = new String("hello");  // 声明变量 c（String），初始值为 new String("hello")

        System.out.println(a == b);         // true（常量池复用）
        System.out.println(a == c);         // false（c 是堆上新对象）
        System.out.println(a.equals(c));    // true（内容相同）
    }
}
\`\`\`

**结论**：比较字符串内容**始终用 \`equals()\`**，绝不要用 \`==\`。除非你确实要判断是否是同一对象（极少需要）。

\`equalsIgnoreCase()\` 忽略大小写比较：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        System.out.println("Hello".equalsIgnoreCase("hello"));   // true
    }
}
\`\`\`

### 常用方法

#### 长度与字符

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        String s = "Hello";  // 声明变量 s（String），初始值为 "Hello"
        System.out.println(s.length());      // 5，长度
        System.out.println(s.charAt(0));     // 'H'，指定索引的字符
        System.out.println(s.charAt(4));     // 'o'
        System.out.println(s.isEmpty());     // false（空字符串 "" 返回 true）
    }
}
\`\`\`

#### 查找

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        String s = "Hello, World";  // 声明变量 s（String），初始值为 "Hello, World"
        System.out.println(s.indexOf("World"));   // 7，首次出现的位置
        System.out.println(s.indexOf("Java"));    // -1，找不到返回 -1
        System.out.println(s.indexOf('o'));       // 4
        System.out.println(s.lastIndexOf('o'));   // 8，最后一次出现
        System.out.println(s.contains("World"));  // true，是否包含
        System.out.println(s.startsWith("Hello")); // true
        System.out.println(s.endsWith("World"));   // true
    }
}
\`\`\`

#### 截取子串 substring

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        String s = "Hello, World";  // 声明变量 s（String），初始值为 "Hello, World"
        System.out.println(s.substring(7));      // "World"，从索引 7 到末尾
        System.out.println(s.substring(0, 5));   // "Hello"，[0, 5) 左闭右开
    }
}
\`\`\`

#### 替换

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        String s = "Hello, World, Hello";  // 声明变量 s（String），初始值为 "Hello, World, Hello"
        System.out.println(s.replace("Hello", "Hi"));   // "Hi, World, Hi"
        System.out.println(s.replaceFirst("Hello", "Hi")); // "Hi, World, Hello"
    }
}
\`\`\`

#### 分割 split

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        String s = "苹果,香蕉,橘子,葡萄";  // 声明变量 s（String），初始值为 "苹果,香蕉,橘子,葡萄"
        String[] fruits = s.split(",");          // 按逗号分割
        for (String f : fruits) {  // 增强 for：遍历 fruits，每次取一个元素 f
            System.out.println(f);  // 打印一行到标准输出（自动换行）
        }

        // 按正则分割
        String[] parts = "1 2  3   4".split("\\\\s+");   // 按一个或多个空白分割
        System.out.println(java.util.Arrays.toString(parts));  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

#### 去除空白

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        String s = "  Hello World  ";  // 声明变量 s（String），初始值为 "  Hello World  "
        System.out.println(s.trim());       // "Hello World"（去除两端空白）
        // Java 11+ strip() 更强大，能处理 Unicode 空白
        System.out.println(s.strip());  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

#### 大小写转换

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        System.out.println("Hello".toUpperCase());   // "HELLO"
        System.out.println("Hello".toLowerCase());   // "hello"
    }
}
\`\`\`

#### 拼接 join

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        String result = String.join("-", "2024", "01", "15");  // "2024-01-15"
        String result2 = String.join(", ", "苹果", "香蕉", "橘子");  // "苹果, 香蕉, 橘子"
        System.out.println(result);  // 打印一行到标准输出（自动换行）
        System.out.println(result2);  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

### StringBuilder 与 StringBuffer

由于 String 不可变，频繁拼接字符串效率低。Java 提供了**可变字符串**类：

| 类 | 线程安全 | 性能 | 用途 |
| --- | --- | --- | --- |
| \`String\` | 不可变（天然安全） | 拼接慢 | 少量、不变的场景 |
| \`StringBuilder\` | ❌ 不安全 | 最快 | 单线程下大量拼接 |
| \`StringBuffer\` | ✅ 安全（synchronized） | 较慢 | 多线程下大量拼接 |

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        // 不推荐：用 + 在循环中拼接（每次创建新对象）
        String s = "";  // 声明变量 s（String），初始值为 ""
        for (int i = 0; i < 100; i++) {  // for 循环：初始化 int i = 0；条件 i < 100；更新 i++
            s += i;   // 每次都创建新 String，效率极低
        }

        // 推荐：用 StringBuilder
        StringBuilder sb = new StringBuilder();  // 声明变量 sb（StringBuilder），初始值为 new StringBuilder()
        for (int i = 0; i < 100; i++) {  // for 循环：初始化 int i = 0；条件 i < 100；更新 i++
            sb.append(i);   // 原地修改，不创建新对象
        }
        String result = sb.toString();  // 声明变量 result（String），初始值为 sb.toString()
        System.out.println("两种方式结果长度相同: " + (s.length() == result.length()));  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

StringBuilder 常用方法：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        StringBuilder sb = new StringBuilder("Hello");  // 声明变量 sb（StringBuilder），初始值为 new StringBuilder("Hello")
        sb.append(", World");      // 追加
        sb.insert(5, " Java");     // 在索引 5 处插入
        sb.delete(5, 10);          // 删除 [5, 10)
        sb.reverse();              // 反转
        System.out.println("长度: " + sb.length());   // 长度
        System.out.println("结果: " + sb.toString()); // 转回 String
    }
}
\`\`\`

**经验**：单线程下用 \`StringBuilder\`，多线程下用 \`StringBuffer\`。日常绝大多数场景用 \`StringBuilder\`。

### 字符串格式化 String.format

\`String.format()\` 类似 C 的 printf，用占位符格式化字符串：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        String name = "张三";  // 声明变量 name（String），初始值为 "张三"
        int age = 28;  // 声明变量 age（int），初始值为 28
        String s = String.format("我叫 %s，今年 %d 岁", name, age);  // 声明变量 s（String），初始值为 String.format("我叫 %s，今年 %d 岁", name, age)
        // "我叫 张三，今年 28 岁"
        System.out.println(s);  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

常用占位符：

| 占位符 | 含义 | 示例 |
| --- | --- | --- |
| \`%s\` | 字符串 | \`%s\` → "张三" |
| \`%d\` | 整数 | \`%d\` → 28 |
| \`%f\` | 浮点数 | \`%f\` → 3.140000 |
| \`%.2f\` | 保留 2 位小数 | \`%.2f\` → 3.14 |
| \`%n\` | 换行 | 平台无关 |
| \`%%\` | 百分号本身 | \`%%\` → % |
| \`%x\` | 十六进制 | \`%x\` → ff |
| \`%05d\` | 补零宽 5 | \`%05d\` → 00042 |
| \`%-10s\` | 左对齐宽 10 | |

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        System.out.printf("圆周率: %.2f%n", 3.14159);   // 圆周率: 3.14
        System.out.printf("编号: %05d%n", 42);          // 编号: 00042
    }
}
\`\`\`

\`System.out.printf()\` 是 \`System.out.print(String.format(...))\` 的简写，直接格式化并输出。

### 文本块（Text Blocks，Java 13+）

Java 13 引入、Java 15 正式的**文本块**用三个双引号 \`\\"\\"\\"\` 包裹，可以优雅地书写多行字符串，无需转义换行和引号：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        // 传统写法：满是转义
        String json = "{\\n" +
                      "  \\"name\\": \\"张三\\",\\n" +
                      "  \\"age\\": 28\\n" +
                      "}";

        // 文本块：清晰直观
        String json2 = """
                {
                  "name": "张三",
                  "age": 28
                }
                """;
        System.out.println("--- 传统写法 ---");  // 打印一行到标准输出（自动换行）
        System.out.println(json);  // 打印一行到标准输出（自动换行）
        System.out.println("--- 文本块写法 ---");  // 打印一行到标准输出（自动换行）
        System.out.println(json2);  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

文本块的特点：
- 保留换行，无需 \`\\n\`。
- 内部的双引号无需转义。
- **缩进控制**：结束的 \`\\"\\"\\"\` 位置决定基准缩进，超出部分保留。

文本块非常适合编写 JSON、SQL、HTML 等多行文本。

### 字符串与基本类型转换

#### 基本类型转字符串

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        String s1 = String.valueOf(42);        // "42"
        String s2 = String.valueOf(3.14);      // "3.14"
        String s3 = String.valueOf(true);      // "true"
        String s4 = 42 + "";                   // "42"（最简写法）
        String s5 = Integer.toString(42);      // "42"
        System.out.println(s1 + ", " + s2 + ", " + s3 + ", " + s4 + ", " + s5);  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

#### 字符串转基本类型

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        int i = Integer.parseInt("42");        // 42
        double d = Double.parseDouble("3.14"); // 3.14
        boolean b = Boolean.parseBoolean("true"); // true
        System.out.println("i=" + i + ", d=" + d + ", b=" + b);  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

如果字符串不是合法数字，\`parseInt\` 会抛 \`NumberFormatException\`。

### 常见陷阱

1. **用 == 比较字符串**：见上文，必须用 equals。
2. **循环中用 + 拼接**：用 StringBuilder。
3. **空指针**：\`String s = null; s.length()\` 会抛 NPE。用 \`s == null || s.isEmpty()\` 判断空。
4. **substring 内存泄漏（已修复）**：Java 7 之前 substring 共享原字符数组，可能导致大字符串无法回收。Java 7u6 之后已修复。

### 本节代码演示

下面演示 String 不可变性、常用方法、StringBuilder、equals vs ==、String.format、文本块、类型转换。`,
    code: `// ============================================================
// 第四章代码演示：字符串
// ============================================================
// 本代码演示：String 不可变性、常用方法、StringBuilder、
// equals vs ==、String.format、文本块、类型转换

public class Main {
    public static void main(String[] args) {
        // ---- 1. 字符串创建与不可变性 ----
        System.out.println("========== 1. 字符串创建 ==========");
        String s1 = "hello";           // 字面量
        String s2 = "hello";           // 常量池复用
        String s3 = new String("hello"); // 堆上新对象
        System.out.println("s1 = " + s1);
        System.out.println("s1 == s2: " + (s1 == s2));     // true（同一对象）
        System.out.println("s1 == s3: " + (s1 == s3));     // false（不同对象）

        // 拼接产生新对象
        String s = "Hello";
        s = s + " World";
        System.out.println("拼接后: " + s);

        // ---- 2. equals vs == ----
        System.out.println("\\n========== 2. equals vs == ==========");
        String a = "Java";
        String b = "Java";
        String c = new String("Java");
        System.out.println("a == b: " + (a == b));          // true（常量池）
        System.out.println("a == c: " + (a == c));          // false（新对象）
        System.out.println("a.equals(c): " + a.equals(c));  // true（内容相同）
        System.out.println("a.equalsIgnoreCase(\\\"JAVA\\\"): " + a.equalsIgnoreCase("JAVA"));

        System.out.println("结论：比较字符串内容始终用 equals()");

        // ---- 3. 长度与字符 ----
        System.out.println("\\n========== 3. 长度与字符 ==========");
        String str = "Hello, World";
        System.out.println("字符串: " + str);
        System.out.println("length(): " + str.length());
        System.out.println("charAt(0): " + str.charAt(0));
        System.out.println("charAt(7): " + str.charAt(7));
        System.out.println("isEmpty(): " + str.isEmpty());
        System.out.println("\\\"\\\".isEmpty(): " + "".isEmpty());

        // ---- 4. 查找 ----
        System.out.println("\\n========== 4. 查找 ==========");
        System.out.println("indexOf(\\\"World\\\"): " + str.indexOf("World"));
        System.out.println("indexOf(\\\"Java\\\"): " + str.indexOf("Java"));  // -1
        System.out.println("lastIndexOf('o'): " + str.lastIndexOf('o'));
        System.out.println("contains(\\\"World\\\"): " + str.contains("World"));
        System.out.println("startsWith(\\\"Hello\\\"): " + str.startsWith("Hello"));
        System.out.println("endsWith(\\\"World\\\"): " + str.endsWith("World"));

        // ---- 5. 截取与替换 ----
        System.out.println("\\n========== 5. 截取与替换 ==========");
        System.out.println("substring(7): " + str.substring(7));
        System.out.println("substring(0, 5): " + str.substring(0, 5));
        String replaced = str.replace("World", "Java");
        System.out.println("replace: " + replaced);
        System.out.println("replaceFirst: " + str.replaceFirst("o", "0"));

        // ---- 6. 分割 split ----
        System.out.println("\\n========== 6. 分割 split ==========");
        String data = "苹果,香蕉,橘子,葡萄";
        String[] fruits = data.split(",");
        System.out.println("按逗号分割:");
        for (int i = 0; i < fruits.length; i++) {
            System.out.println("  [" + i + "] " + fruits[i]);
        }

        // 限制分割次数
        String[] parts = data.split(",", 2);
        System.out.println("限制分割 2 次: " + java.util.Arrays.toString(parts));

        // ---- 7. 去除空白与大小写 ----
        System.out.println("\\n========== 7. 去除空白与大小写 ==========");
        String padded = "  Hello World  ";
        System.out.println("原始: |" + padded + "|");
        System.out.println("trim: |" + padded.trim() + "|");
        System.out.println("strip: |" + padded.strip() + "|");  // Java 11+
        System.out.println("toUpperCase: " + "Hello".toUpperCase());
        System.out.println("toLowerCase: " + "Hello".toLowerCase());

        // ---- 8. 拼接 join ----
        System.out.println("\\n========== 8. 拼接 join ==========");
        String date = String.join("-", "2024", "01", "15");
        System.out.println("日期: " + date);
        String list = String.join(", ", "苹果", "香蕉", "橘子");
        System.out.println("列表: " + list);

        // ---- 9. StringBuilder ----
        System.out.println("\\n========== 9. StringBuilder ==========");
        // 循环拼接推荐用 StringBuilder
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 5; i++) {
            sb.append("第").append(i).append("行 ");
        }
        System.out.println("append 结果: " + sb.toString());

        // StringBuilder 其他方法
        StringBuilder sb2 = new StringBuilder("Hello");
        sb2.append(", World");
        System.out.println("append 后: " + sb2);
        sb2.insert(5, " Java");
        System.out.println("insert 后: " + sb2);
        sb2.delete(5, 10);
        System.out.println("delete 后: " + sb2);
        sb2.reverse();
        System.out.println("reverse 后: " + sb2);

        // 性能对比演示
        System.out.println("\\n--- 拼接 1000 次的写法对比 ---");
        // 不推荐写法（创建大量中间对象）
        String slow = "";
        for (int i = 0; i < 1000; i++) {
            slow += "a";
        }
        // 推荐写法
        StringBuilder fast = new StringBuilder();
        for (int i = 0; i < 1000; i++) {
            fast.append("a");
        }
        System.out.println("两种方式结果长度相同: " + (slow.length() == fast.length()));
        System.out.println("推荐：循环拼接用 StringBuilder");

        // ---- 10. String.format 格式化 ----
        System.out.println("\\n========== 10. String.format ==========");
        String name = "张三";
        int age = 28;
        double pi = 3.14159265;

        String msg = String.format("我叫 %s，今年 %d 岁", name, age);
        System.out.println(msg);
        System.out.println(String.format("圆周率: %.2f", pi));
        System.out.println(String.format("百分比: %.1f%%", 85.5));
        System.out.println(String.format("编号: %05d", 42));
        System.out.println(String.format("十六进制: %x", 255));
        System.out.println(String.format("左对齐: |%-10s|", "hi"));
        System.out.println(String.format("右对齐: |%10s|", "hi"));

        // printf 直接格式化输出
        System.out.printf("printf 直接输出: %s 今年 %d 岁%n", name, age);

        // ---- 11. 文本块（Java 13+）----
        System.out.println("\\n========== 11. 文本块（Java 13+）==========");
        String json = """
                {
                  "name": "张三",
                  "age": 28,
                  "city": "北京"
                }
                """;
        System.out.println("文本块生成的 JSON:");
        System.out.println(json);

        String sql = """
                SELECT id, name, age
                FROM users
                WHERE age >= 18
                ORDER BY name
                """;
        System.out.println("文本块生成的 SQL:");
        System.out.println(sql);

        // ---- 12. 字符串与基本类型转换 ----
        System.out.println("========== 12. 类型转换 ==========");
        // 基本类型 → 字符串
        String fromInt = String.valueOf(42);
        String fromDouble = String.valueOf(3.14);
        String fromBool = String.valueOf(true);
        String shortcut = 100 + "";   // 简写
        System.out.println("int → String: " + fromInt);
        System.out.println("double → String: " + fromDouble);
        System.out.println("boolean → String: " + fromBool);
        System.out.println("简写 100 + \\\"\\\": " + shortcut);

        // 字符串 → 基本类型
        int num = Integer.parseInt("42");
        double d = Double.parseDouble("3.14");
        boolean flag = Boolean.parseBoolean("true");
        System.out.println("String → int: " + num);
        System.out.println("String → double: " + d);
        System.out.println("String → boolean: " + flag);

        // 安全转换：处理异常
        try {
            int bad = Integer.parseInt("abc");
        } catch (NumberFormatException e) {
            System.out.println("parseInt(\\\"abc\\\") 抛出异常: 数字格式错误");
        }

        System.out.println("\\n字符串演示完成！");
    }
}`,
  },

  // =========================================================
  // 第五章：条件与循环
  // =========================================================
  {
    id: "java-controlflow",
    group: "基础",
    icon: "🔀",
    title: "条件与循环",
    content: `## 条件与循环

**条件语句**让程序根据不同情况执行不同代码，**循环语句**让程序重复执行某段代码。它们是控制程序执行流程的核心结构。本章讲解 Java 的所有条件与循环结构，包括 Java 14+ 的 switch 表达式和增强 for 循环。

### if-else 语句

最基本的条件判断：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        int score = 85;  // 声明变量 score（int），初始值为 85
        if (score >= 90) {  // 条件判断：满足 score >= 90 时执行
            System.out.println("优秀");  // 打印一行到标准输出（自动换行）
        } else if (score >= 80) {  // 否则若满足 score >= 80 则执行
            System.out.println("良好");  // 打印一行到标准输出（自动换行）
        } else if (score >= 60) {  // 否则若满足 score >= 60 则执行
            System.out.println("及格");  // 打印一行到标准输出（自动换行）
        } else {  // 否则分支
            System.out.println("不及格");  // 打印一行到标准输出（自动换行）
        }
    }
}
\`\`\`

**注意**：
- 条件必须是 \`boolean\` 类型，不能像 C/JS 那样用 \`if (1)\` 或 \`if (x)\`。
- 即使只有一条语句，也建议用 \`{}\` 包裹，避免维护时出错（著名的 Apple goto fail bug 就是因为少写花括号）。

#### 嵌套 if

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        int age = 20;  // 声明变量 age（int），初始值为 20
        boolean hasLicense = false;  // 声明变量 hasLicense（boolean），初始值为 false
        if (age >= 18) {  // 条件判断：满足 age >= 18 时执行
            if (hasLicense) {  // 条件判断：满足 hasLicense 时执行
                System.out.println("可以开车");  // 打印一行到标准输出（自动换行）
            } else {  // 否则分支
                System.out.println("成年但无驾照");  // 打印一行到标准输出（自动换行）
            }
        }
    }
}
\`\`\`

### switch 语句

当需要根据一个变量的多个具体值做不同处理时，\`switch\` 比 if-else 链更清晰。支持 \`byte\`、\`short\`、\`int\`、\`char\`、\`String\`（Java 7+）、枚举类型。

#### 传统 switch 语句

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        int day = 3;  // 声明变量 day（int），初始值为 3
        switch (day) {  // switch 分支：根据 day 的值跳转
            case 1:  // 匹配 case 1
                System.out.println("星期一");  // 打印一行到标准输出（自动换行）
                break;   // 必须有 break，否则会"穿透"
            case 2:  // 匹配 case 2
                System.out.println("星期二");  // 打印一行到标准输出（自动换行）
                break;  // 跳出当前循环或 switch
            case 3:  // 匹配 case 3
                System.out.println("星期三");  // 打印一行到标准输出（自动换行）
                break;  // 跳出当前循环或 switch
            default:  // 默认分支（所有 case 都不匹配时执行）
                System.out.println("未知");  // 打印一行到标准输出（自动换行）
        }
    }
}
\`\`\`

**case 穿透（fall-through）**：如果 case 后没有 \`break\`，执行完该 case 后会继续执行下一个 case，直到遇到 break 或 switch 结束。有时这是期望行为（多个 case 共用代码），但更多时候是 bug 来源。

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        // 利用穿透：多个 case 共用代码
        int month = 2;  // 声明变量 month（int），初始值为 2
        boolean isLeap = true;  // 声明变量 isLeap（boolean），初始值为 true
        int days = 0;  // 声明变量 days（int），初始值为 0
        switch (month) {  // switch 分支：根据 month 的值跳转
            case 1: case 3: case 5: case 7: case 8: case 10: case 12:  // 匹配 case 1: case 3: case 5: case 7: case 8: case 10: case 12
                days = 31;  // 为 days 赋值：31
                break;  // 跳出当前循环或 switch
            case 4: case 6: case 9: case 11:  // 匹配 case 4: case 6: case 9: case 11
                days = 30;  // 为 days 赋值：30
                break;  // 跳出当前循环或 switch
            case 2:  // 匹配 case 2
                days = isLeap ? 29 : 28;  // 为 days 赋值：isLeap ? 29 : 28
                break;  // 跳出当前循环或 switch
        }
        System.out.println(month + " 月有 " + days + " 天");  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

#### switch 支持 String（Java 7+）

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        String command = "start";  // 声明变量 command（String），初始值为 "start"
        switch (command) {  // switch 分支：根据 command 的值跳转
            case "start":  // 匹配 case "start"
                System.out.println("启动");  // 打印一行到标准输出（自动换行）
                break;  // 跳出当前循环或 switch
            case "stop":  // 匹配 case "stop"
                System.out.println("停止");  // 打印一行到标准输出（自动换行）
                break;  // 跳出当前循环或 switch
            default:  // 默认分支（所有 case 都不匹配时执行）
                System.out.println("未知命令");  // 打印一行到标准输出（自动换行）
        }
    }
}
\`\`\`

注意：switch 比较 String 用的是 \`equals()\`，所以不会因为常量池问题出错，且对 null 不安全（command 为 null 会 NPE）。

#### switch 表达式（Java 14+）

Java 14 引入了**新的 switch 表达式**，更简洁、更安全，没有穿透问题：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        // 用箭头语法，无穿透，无需 break
        int day = 3;  // 声明变量 day（int），初始值为 3
        String result = switch (day) {
            case 1, 2, 3, 4, 5 -> "工作日";  // Lambda 表达式：实现函数式接口
            case 6, 7 -> "周末";  // Lambda 表达式：实现函数式接口
            default -> "未知";  // Lambda 表达式：实现函数式接口
        };
        System.out.println(result);  // 打印一行到标准输出（自动换行）

        // 块语法：需要 yield 返回值
        int month = 2;  // 声明变量 month（int），初始值为 2
        boolean isLeap = true;  // 声明变量 isLeap（boolean），初始值为 true
        int days = switch (month) {
            case 1, 3, 5, 7, 8, 10, 12 -> 31;  // Lambda 表达式：实现函数式接口
            case 4, 6, 9, 11 -> 30;  // Lambda 表达式：实现函数式接口
            case 2 -> {  // Lambda 表达式：实现函数式接口
                int d = isLeap ? 29 : 28;  // 声明变量 d（int），初始值为 isLeap ? 29 : 28
                yield d;   // 块中用 yield 返回值
            }
            default -> 0;  // Lambda 表达式：实现函数式接口
        };
        System.out.println(days);  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

新 switch 表达式的优势：
1. **箭头语法 \`->\`**：无穿透，一个 case 可匹配多个值（逗号分隔）。
2. **可作为表达式返回值**：直接赋值给变量。
3. **编译器穷尽检查**：枚举或受限于已知值时，必须覆盖所有情况或加 default。

### for 循环

#### 传统 for 循环

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        for (int i = 0; i < 5; i++) {  // for 循环：初始化 int i = 0；条件 i < 5；更新 i++
            System.out.println(i);  // 打印一行到标准输出（自动换行）
        }
        // 输出 0 1 2 3 4
    }
}
\`\`\`

语法：\`for (初始化; 条件; 更新) { 循环体 }\`

三部分都可以省略（\`for (;;)\` 是死循环），但分号不能省。

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        // 累加求和
        int sum = 0;  // 声明变量 sum（int），初始值为 0
        for (int i = 1; i <= 100; i++) {  // for 循环：初始化 int i = 1；条件 i <= 100；更新 i++
            sum += i;  // sum += i（复合赋值）
        }
        // sum = 5050
        System.out.println("sum = " + sum);  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

#### 嵌套循环

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        // 九九乘法表
        for (int i = 1; i <= 9; i++) {  // for 循环：初始化 int i = 1；条件 i <= 9；更新 i++
            for (int j = 1; j <= i; j++) {  // for 循环：初始化 int j = 1；条件 j <= i；更新 j++
                System.out.print(j + "x" + i + "=" + (i * j) + "\\t");  // 打印到标准输出（不换行）
            }
            System.out.println();  // 打印一行到标准输出（自动换行）
        }
    }
}
\`\`\`

### 增强for 循环（for-each，Java 5+）

用于遍历**数组**和**集合**，无需索引，更简洁：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        int[] nums = {10, 20, 30};  // 声明变量 nums（int[]），初始值为 {10, 20, 30}
        for (int n : nums) {  // 增强 for：遍历 nums，每次取一个元素 n
            System.out.println(n);  // 打印一行到标准输出（自动换行）
        }

        String[] fruits = {"苹果", "香蕉", "橘子"};  // 声明变量 fruits（String[]），初始值为 {"苹果", "香蕉", "橘子"}
        for (String f : fruits) {  // 增强 for：遍历 fruits，每次取一个元素 f
            System.out.println(f);  // 打印一行到标准输出（自动换行）
        }
    }
}
\`\`\`

语法：\`for (元素类型 变量名 : 数组或集合) { 循环体 }\`

**for-each 的局限**：
- 无法获取索引（需要索引时用传统 for）。
- 无法在遍历时修改集合（会抛 \`ConcurrentModificationException\`）。
- 无法同时遍历多个集合。

### while 循环

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        int i = 0;  // 声明变量 i（int），初始值为 0
        while (i < 5) {  // while 循环：当 i < 5 为真时重复执行
            System.out.println(i);  // 打印一行到标准输出（自动换行）
            i++;  // i 自增 1
        }
    }
}
\`\`\`

\`while\` 先判断条件再执行循环体。条件为 false 时循环体一次都不执行。

适用场景：**循环次数不确定**，如读取输入直到结束、处理数据直到满足条件。

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        // 经典：计算一个数的位数
        int n = 12345;  // 声明变量 n（int），初始值为 12345
        int count = 0;  // 声明变量 count（int），初始值为 0
        while (n > 0) {  // while 循环：当 n > 0 为真时重复执行
            n /= 10;  // n /= 10（复合赋值）
            count++;  // count 自增 1
        }
        // count = 5
        System.out.println("count = " + count);  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

### do-while 循环

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        int i = 0;  // 声明变量 i（int），初始值为 0
        do {  // do-while 循环开始（先执行一次再判断条件）
            System.out.println(i);  // 打印一行到标准输出（自动换行）
            i++;  // i 自增 1
        } while (i < 5);  // do-while 结束：当 i < 5 为真时继续循环
    }
}
\`\`\`

\`do-while\` **先执行一次循环体，再判断条件**。所以循环体至少执行一次。

适用场景：需要**至少执行一次**的情况，如菜单选择、输入验证。

\`\`\`text
// 模拟菜单：至少展示一次
int choice;
do {
    System.out.println("1. 开始  2. 设置  3. 退出");
    // choice = readInput();  // 实际项目中这里读取用户输入
} while (choice != 3);
\`\`\`

### break 与 continue

#### break：跳出循环

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        for (int i = 0; i < 10; i++) {  // for 循环：初始化 int i = 0；条件 i < 10；更新 i++
            if (i == 5) {  // 条件判断：满足 i == 5 时执行
                break;   // i==5 时跳出整个循环
            }
            System.out.println(i);  // 打印一行到标准输出（自动换行）
        }
        // 输出 0 1 2 3 4
    }
}
\`\`\`

#### continue：跳过本次，进入下次

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        for (int i = 0; i < 10; i++) {  // for 循环：初始化 int i = 0；条件 i < 10；更新 i++
            if (i % 2 == 0) {  // 条件判断：满足 i % 2 == 0 时执行
                continue;   // 跳过偶数
            }
            System.out.println(i);  // 打印一行到标准输出（自动换行）
        }
        // 输出 1 3 5 7 9
    }
}
\`\`\`

\`break\` 和 \`continue\` 只对**最近一层**循环起作用。

### 标签 break（Labeled break）

Java 支持**带标签的 break/continue**，可以跳出多层嵌套循环：

\`\`\`java
public class Main {  // 定义类 Main
    public static void main(String[] args) {  // 程序入口 main 方法，args 接收命令行参数
        outer:   // 定义标签
        for (int i = 0; i < 5; i++) {  // for 循环：初始化 int i = 0；条件 i < 5；更新 i++
            for (int j = 0; j < 5; j++) {  // for 循环：初始化 int j = 0；条件 j < 5；更新 j++
                if (i * j > 6) {  // 条件判断：满足 i * j > 6 时执行
                    break outer;   // 直接跳出外层循环
                }
                System.out.println("i=" + i + ", j=" + j);  // 打印一行到标准输出（自动换行）
            }
        }
    }
}
\`\`\`

\`continue outer\` 则是跳过外层循环的当前迭代，进入外层下次迭代。标签 break 在处理二维数组搜索等场景很有用，但不要滥用，会影响可读性。多数情况下可以把内层循环抽成方法，用 return 代替。

### 三种循环的选择

| 循环类型 | 适用场景 |
| --- | --- |
| \`for\` | 循环次数确定，或需要索引 |
| \`for-each\` | 遍历数组/集合，不需要索引 |
| \`while\` | 循环次数不确定，可能一次都不执行 |
| \`do-while\` | 至少执行一次 |

### 常见陷阱

1. **死循环**：\`while (true)\` 忘记更新条件或 break。
2. **off-by-one 错误**：循环边界搞错，如 \`i <= 5\` 还是 \`i < 5\`。
3. **for-each 修改集合**：遍历时增删元素会抛异常，应用 Iterator。
4. **浮点数做循环条件**：\`for (double d = 0; d != 1; d += 0.1)\` 因精度问题可能死循环，用整数计数。

### 本节代码演示

下面演示 if-else、传统 switch、switch 表达式、for、for-each、while、do-while、break/continue、标签 break。`,
    code: `// ============================================================
// 第五章代码演示：条件与循环
// ============================================================
// 本代码演示：if-else、switch（传统与表达式）、for、for-each、
// while、do-while、break/continue、标签 break

public class Main {
    public static void main(String[] args) {
        // ---- 1. if-else ----
        System.out.println("========== 1. if-else ==========");
        int score = 85;
        String grade;
        if (score >= 90) {
            grade = "优秀";
        } else if (score >= 80) {
            grade = "良好";
        } else if (score >= 60) {
            grade = "及格";
        } else {
            grade = "不及格";
        }
        System.out.println("成绩 " + score + ": " + grade);

        // 三目运算符做简单判断
        int age = 20;
        String status = age >= 18 ? "成年" : "未成年";
        System.out.println("年龄 " + age + ": " + status);

        // ---- 2. 传统 switch 语句 ----
        System.out.println("\\n========== 2. 传统 switch ==========");
        int day = 3;
        switch (day) {
            case 1:
                System.out.println("星期一");
                break;
            case 2:
                System.out.println("星期二");
                break;
            case 3:
                System.out.println("星期三");
                break;
            case 4:
                System.out.println("星期四");
                break;
            case 5:
                System.out.println("星期五");
                break;
            case 6:
            case 7:   // 穿透：6 和 7 共用代码
                System.out.println("周末");
                break;
            default:
                System.out.println("未知");
        }

        // switch 支持 String（Java 7+）
        String command = "start";
        switch (command) {
            case "start":
                System.out.println("启动服务");
                break;
            case "stop":
                System.out.println("停止服务");
                break;
            case "restart":
                System.out.println("重启服务");
                break;
            default:
                System.out.println("未知命令: " + command);
        }

        // ---- 3. switch 表达式（Java 14+）----
        System.out.println("\\n========== 3. switch 表达式（Java 14+）==========");
        // 箭头语法：无穿透，多值合并，直接返回
        String dayType = switch (day) {
            case 1, 2, 3, 4, 5 -> "工作日";
            case 6, 7 -> "周末";
            default -> "未知";
        };
        System.out.println("第 " + day + " 天是: " + dayType);

        // switch 表达式 + yield（块中返回值）
        int month = 2;
        boolean isLeap = true;
        int days = switch (month) {
            case 1, 3, 5, 7, 8, 10, 12 -> 31;
            case 4, 6, 9, 11 -> 30;
            case 2 -> {
                int d = isLeap ? 29 : 28;
                yield d;   // 块中用 yield 返回
            }
            default -> 0;
        };
        System.out.println(month + " 月（闰年）有 " + days + " 天");

        // ---- 4. 传统 for 循环 ----
        System.out.println("\\n========== 4. 传统 for 循环 ==========");
        System.out.println("打印 0 到 4:");
        for (int i = 0; i < 5; i++) {
            System.out.print(i + " ");
        }
        System.out.println();

        // 累加求和
        int sum = 0;
        for (int i = 1; i <= 100; i++) {
            sum += i;
        }
        System.out.println("1 到 100 的和: " + sum);

        // 嵌套循环：九九乘法表（前 5 行）
        System.out.println("九九乘法表（前 5 行）:");
        for (int i = 1; i <= 5; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print(j + "x" + i + "=" + (i * j) + "\\t");
            }
            System.out.println();
        }

        // ---- 5. 增强 for 循环（for-each）----
        System.out.println("\\n========== 5. 增强 for 循环 ==========");
        int[] nums = {10, 20, 30, 40, 50};
        System.out.println("遍历数组:");
        for (int n : nums) {
            System.out.print(n + " ");
        }
        System.out.println();

        String[] fruits = {"苹果", "香蕉", "橘子"};
        System.out.println("遍历字符串数组:");
        for (String f : fruits) {
            System.out.println("  - " + f);
        }

        // 求数组最大值
        int max = nums[0];
        for (int n : nums) {
            if (n > max) {
                max = n;
            }
        }
        System.out.println("数组最大值: " + max);

        // ---- 6. while 循环 ----
        System.out.println("\\n========== 6. while 循环 ==========");
        // 打印 0 到 4
        int i = 0;
        while (i < 5) {
            System.out.print(i + " ");
            i++;
        }
        System.out.println();

        // 计算数字的位数
        int number = 12345;
        int temp = number;
        int count = 0;
        while (temp > 0) {
            temp /= 10;
            count++;
        }
        System.out.println(number + " 有 " + count + " 位");

        // 翻转数字
        int original = 1234;
        int n = original;
        int reversed = 0;
        while (n > 0) {
            reversed = reversed * 10 + n % 10;
            n /= 10;
        }
        System.out.println(original + " 翻转后: " + reversed);

        // ---- 7. do-while 循环 ----
        System.out.println("\\n========== 7. do-while 循环 ==========");
        // 至少执行一次
        int j = 0;
        do {
            System.out.print(j + " ");
            j++;
        } while (j < 5);
        System.out.println();

        // 即使条件一开始就为 false，也执行一次
        int k = 10;
        do {
            System.out.println("do-while 至少执行一次: k=" + k);
            k++;
        } while (k < 5);   // 条件为 false，但已执行一次

        // ---- 8. break 与 continue ----
        System.out.println("\\n========== 8. break 与 continue ==========");
        // break：跳出循环
        System.out.println("break 演示（i==5 时跳出）:");
        for (int m = 0; m < 10; m++) {
            if (m == 5) {
                break;
            }
            System.out.print(m + " ");
        }
        System.out.println();

        // continue：跳过本次
        System.out.println("continue 演示（跳过偶数）:");
        for (int m = 0; m < 10; m++) {
            if (m % 2 == 0) {
                continue;
            }
            System.out.print(m + " ");
        }
        System.out.println();

        // 找第一个能被 7 整除的大于 100 的数
        for (int m = 101; ; m++) {
            if (m % 7 == 0) {
                System.out.println("大于 100 第一个能被 7 整除的数: " + m);
                break;
            }
        }

        // ---- 9. 标签 break ----
        System.out.println("\\n========== 9. 标签 break ==========");
        // 在二维数组中查找第一个负数
        int[][] matrix = {
            {1, 2, 3},
            {4, 5, -1},
            {7, 8, 9}
        };
        int foundRow = -1, foundCol = -1;
        search:
        for (int r = 0; r < matrix.length; r++) {
            for (int c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] < 0) {
                    foundRow = r;
                    foundCol = c;
                    break search;   // 直接跳出两层循环
                }
            }
        }
        if (foundRow >= 0) {
            System.out.println("找到负数 " + matrix[foundRow][foundCol]
                + " 在第 " + foundRow + " 行第 " + foundCol + " 列");
        }

        // ---- 10. 综合应用 ----
        System.out.println("\\n========== 10. 综合应用 ==========");

        // 猜数字游戏模拟（用循环演示）
        int target = 42;
        int[] guesses = {10, 50, 30, 42};
        for (int guess : guesses) {
            if (guess == target) {
                System.out.println("猜 " + guess + " -> 猜对了！");
                break;
            } else if (guess < target) {
                System.out.println("猜 " + guess + " -> 太小了");
            } else {
                System.out.println("猜 " + guess + " -> 太大了");
            }
        }

        // 打印菱形（用循环）
        System.out.println("\\n打印菱形:");
        int size = 5;
        // 上半部分（含中间）
        for (int r = 1; r <= size; r++) {
            for (int s = 0; s < size - r; s++) {
                System.out.print(" ");
            }
            for (int s = 0; s < 2 * r - 1; s++) {
                System.out.print("*");
            }
            System.out.println();
        }
        // 下半部分
        for (int r = size - 1; r >= 1; r--) {
            for (int s = 0; s < size - r; s++) {
                System.out.print(" ");
            }
            for (int s = 0; s < 2 * r - 1; s++) {
                System.out.print("*");
            }
            System.out.println();
        }

        // 判断质数
        System.out.println("\\n100 以内的质数:");
        for (int num = 2; num <= 100; num++) {
            boolean isPrime = true;
            for (int d = 2; d * d <= num; d++) {
                if (num % d == 0) {
                    isPrime = false;
                    break;
                }
            }
            if (isPrime) {
                System.out.print(num + " ");
            }
        }
        System.out.println();

        System.out.println("\\n条件与循环演示完成！");
    }
}`,
  },
];
