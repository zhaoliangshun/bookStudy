// =============================================================
// Python vs Java 语言对比教程 —— 第 1 批章节（语言概览与基础组，共 5 章）
// -------------------------------------------------------------
// 本教程以"对比"为核心，把 Python 与 Java 两门主流语言放在一起讲，
// 帮助有任一语言基础的开发者快速建立对另一门语言的认知，也帮助初
// 学者理解动态/静态、解释/编译、脚本/企业级两类语言范式的差异。
//
// 本批为"语言概览与基础"组，共 5 章：
//   1. pyjava-overview    — Python 与 Java 总览
//   2. pyjava-history     — 发展历史与设计哲学
//   3. pyjava-hello       — 第一个程序与开发环境
//   4. pyjava-syntax      — 基本语法对比
//   5. pyjava-types-basic — 基本数据类型
//
// 纯阅读型教程：每个章节对象只有 id/icon/group/title/content 五个字段，
// 没有 code 字段。所有代码示例直接以 Markdown 代码块形式展示在 content 中。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：Python 与 Java 总览
  // =========================================================
  {
    id: "pyjava-overview",
    icon: "🌐",
    group: "语言概览与基础",
    title: "Python 与 Java 总览",
    content: `## 第1章：Python 与 Java 总览

### 一、两门语言的定位

**Python** 是一门**动态类型、解释执行**的高级脚本语言，以"简洁、可读、开发效率高"著称。它诞生于 1989 年的圣诞节假期，由 Guido van Rossum 一个人作为业余项目启动，初衷是为 Unix/C 系统管理员和教学场景提供一个比 Shell 更强大、比 C 更易用的"胶水语言"。今天的 Python 已经成长为数据科学、人工智能、自动化运维、Web 后端和科研计算的首选语言，但骨子里的"脚本气质"——开箱即用、快速试错、强制可读性——从未改变。

**Java** 是一门**静态类型、编译到字节码再由虚拟机执行**的通用编程语言，以"稳定、跨平台、企业级生态完善"闻名。它由 Sun Microsystems（后被 Oracle 收购）的 James Gosling 团队在 1990 年代初立项，目标是给消费电子产品写"可移植"的嵌入式固件，最终演化为今天统治企业后台、金融系统、Android 应用、大数据基础设施的"重型工程语言"。Java 的设计哲学强调"一次编写，到处运行"（Write Once, Run Anywhere），通过 JVM 这一中间层抹平不同操作系统的差异。

一句话总结两门语言的精神：

| 语言 | 一句话定位 | 核心气质 |
| --- | --- | --- |
| **Python** | "人生苦短，我用 Python"——为开发者效率而生的动态语言 | 简洁、灵活、快速试错 |
| **Java** | "一次编写，到处运行"——为企业级稳定而生的静态语言 | 严谨、冗长、工程化 |

### 二、核心特征一句话对比

在深入细节之前，先用最短的话把两门语言的核心特征钉在脑子里：

- **Python**：动态类型，写完即跑，没有编译期类型检查；缩进决定代码块；整数任意精度；万物皆对象；标准库覆盖广；GIL 限制多线程并行。
- **Java**：静态类型，先编译后运行，编译期就能抓出大量错误；大括号决定代码块；整数固定宽度；基本类型与对象并存；生态以框架（Spring 等）见长；多线程原生支持。

理解这两组对立特征，是后续 25 章学习的总纲。

### 三、TIOBE 与 Stack Overflow 排名趋势

**TIOBE 编程社区指数**（基于搜索引擎结果数量）是观察语言热度的常用指标。近十年 Python 与 Java 的趋势几乎呈"剪刀差"：

| 年份 | Python 排名 | Java 排名 | 备注 |
| --- | --- | --- | --- |
| 2015 | 第 8 名左右 | 第 1 名 | Java 如日中天，Android 拉动 |
| 2018 | 第 3-4 名 | 第 1 名 | Python 受数据科学/AI 拉动上升 |
| 2020 | 第 3 名 | 第 2 名 | Python 反超 Java |
| 2022 | 第 1 名 | 第 3-4 名 | Python 登顶，Java 下滑 |
| 2024-2025 | 第 1 名 | 第 3-4 名 | Python 持续领跑，Java 稳定在第二梯队 |

**Stack Overflow Developer Survey**（开发者年度调查）从"使用人数"和"最想学/喜爱度"两个维度看：

- **使用人数**：Python 与 Java 长期占据前 5，Python 略高于 Java。
- **喜爱度（Loved）**：Python 长期在 65-72% 区间，深受数据/AI 开发者喜爱；Java 在 45-55% 区间，老开发者忠诚但年轻群体热情一般。
- **最想学（Most Wanted）**：Python 多年蝉联第一，远超 Java。

排名背后反映的不是"谁更好"，而是**时代需求的变化**——AI/数据科学爆发让 Python 顺势起飞，而 Java 在企业后台的存量仍然庞大且稳固。

### 四、使用人群对比

两门语言的使用人群结构差异巨大，决定了你学谁、和谁共事：

| 维度 | Python 用户画像 | Java 用户画像 |
| --- | --- | --- |
| **典型职业** | 数据科学家、AI 工程师、运维、科研人员、Web 全栈 | 企业后台开发、Android 开发、金融/电商系统 |
| **典型年龄** | 偏年轻，含大量非科班转码人群 | 偏中年，存量工程师多 |
| **教育背景** | 理工科、文科转码均有 | 多为计算机科班 |
| **公司类型** | 互联网、AI 创业公司、科研机构、互联网大厂 AI 部门 | 银行、保险、政府、大型互联网公司后台 |
| **典型项目规模** | 中小型脚本、Notebook、数据流水线 | 大型分布式系统、百万行级工程 |
| **协作方式** | 单人/小团队为主，迭代快 | 大团队、强流程、Code Review 严格 |

### 五、12 维度核心对比

下面这张表是本教程的"地图"，覆盖语言层面最重要的 12 个维度。后续每一章都会展开其中一项：

| 维度 | Python | Java |
| --- | --- | --- |
| **出现年份** | 1991（公开发行） | 1995（正式发布） |
| **范式** | 多范式（面向对象、函数式、过程式） | 多范式（强面向对象，函数式较晚引入） |
| **类型系统** | 动态类型、强类型 | 静态类型、强类型 |
| **执行方式** | 解释执行（CPython 字节码 + PVM） | 编译为字节码 + JVM 执行 |
| **编译目标** | .pyc 字节码（缓存于 \`__pycache__\`） | .class 字节码 |
| **内存管理** | 引用计数 + 分代 GC | 分代 GC（G1/ZGC 等多种回收器） |
| **并发模型** | GIL 限制 CPU 密集多线程；多进程/asyncio | 原生多线程；\`java.util.concurrent\` 生态成熟 |
| **包管理** | pip + venv（现代用 uv/poetry） | Maven / Gradle |
| **典型领域** | AI、数据科学、脚本、Web（Django/Flask/FastAPI） | 企业后台、Android、大数据（Hadoop/Spark） |
| **学习曲线** | 平缓，1 周可写脚本 | 较陡，需要理解类、接口、JVM |
| **性能** | 解释执行，CPU 密集场景慢 10-50 倍 | JIT 优化后接近原生，长期领先 |
| **社区** | PyPI 50 万+ 包 | Maven Central 数百万包，企业框架（Spring）独大 |

### 六、本教程的 25 章学习路线

本教程共 25 章，分为 6 组，本批（第 1-5 章）属于"语言概览与基础"组：

| 组 | 章节 | 主题 |
| --- | --- | --- |
| **语言概览与基础** | 1-5 | 总览、历史、Hello World、语法、基本类型 |
| **类型系统进阶** | 6-9 | 变量作用域、运算符、字符串、控制流 |
| **数据结构** | 10-13 | 列表 vs 数组/List、字典 vs Map、集合、元组 |
| **函数与方法** | 14-18 | 函数定义、参数、Lambda、装饰器、异常 |
| **面向对象** | 19-22 | 类与对象、继承、接口/抽象类、多态 |
| **进阶与生态** | 23-25 | 并发模型、IO/文件、模块/包与构建工具 |

学习建议：

- **已有 Python 基础**：重点看每章 Java 部分，理解静态类型/JVM/类的约束。
- **已有 Java 基础**：重点看 Python 的动态特性、缩进语法、数据科学栈。
- **两门都不熟**：先按顺序读第 1-5 章建立总览，再选一门深入。
- **面试/对比复习**：直接跳到对应章节，看对比表与代码示例。

### 七、本教程的读法

每章结构固定：先用一两段话点出主题，再用对比表给出全景，然后给出 Python 和 Java 的并列代码示例，最后用"详细讲解"段落解释为什么这样设计。代码示例**仅供阅读**，不提供在线运行——你可以复制到本地环境实测，或在站内 \`/py\`、\`/java\`、\`/pybasic\` 等子站中找可运行的代码沙箱。

### 延伸学习

本教程是对比型阅读材料，配合站内其他教程效果更佳：

- **Python 入门** → 访问 \`/py\` 或 \`/pybasic\`，系统学习 Python 语法、标准库与项目结构。
- **Java 入门** → 访问 \`/java\`，学习 Java 从语法到 Spring 的完整路径。
- **Python 进阶** → 访问 \`/pyarch\`、\`/pythread\`、\`/pynet\`，深入架构、并发与网络。
- **Java Web** → 访问 \`/java-web\`，学习 Servlet、Spring MVC、Spring Boot 实战。
- **基础概念补强** → 访问 \`/cs\`（计算机基础）、\`/os\`（操作系统）、\`/net\`（计算机网络），理解 JVM、GC、进程线程等底层概念。

下一章我们从两门语言的发展历史和设计哲学开始，看看它们为什么会变成今天这个样子。
`,
  },

  // =========================================================
  // 第二章：发展历史与设计哲学
  // =========================================================
  {
    id: "pyjava-history",
    icon: "📜",
    group: "语言概览与基础",
    title: "发展历史与设计哲学",
    content: `## 第2章：发展历史与设计哲学

要理解一门语言为什么"长成这个样子"，最好的办法是看它的历史和设计哲学。Python 和 Java 都诞生于 1990 年代前后，但起点、目标人群和哲学取舍截然不同，这些差异至今仍深深影响着两门语言的每一行代码。

### 一、Python 的发展历史

#### 1. 起源：1989 年圣诞节

1989 年圣诞节假期，荷兰 CWI 研究所的 Guido van Rossum 想找个"有意思的度假项目"。他当时参与过一个叫 ABC 的教学语言项目，觉得 ABC 语法优雅但扩展性差；又用惯了 Unix Shell 和 C，觉得 Shell 太弱、C 太繁琐。于是他想造一门"既能像 Shell 一样快速写脚本、又能像 C 一样调用系统底层、还保持 ABC 那种可读性"的新语言。

Guido 把这门语言命名为 **Python**——不是为了纪念蟒蛇，而是因为他是英国喜剧团体 **Monty Python**（巨蟒剧团）的忠实粉丝。这也是 Python 代码里到处是"spam"、"egg"等梗的由来。

#### 2. 早期版本（1991-2000）

- **1991 年**：Python 0.9.0 公开发行，已经具备类、异常、字典、字符串格式化等核心特性。
- **1994 年**：Python 1.0，加入 lambda、map、filter、reduce（函数式特性，受 Lisp 影响）。
- **2000 年**：Python 2.0，加入垃圾回收、列表推导式（受 Haskell 影响）、Unicode 支持。Python 2 是第一代广泛流行的版本，但 Unicode 设计有缺陷（str 与 unicode 类型并存）。

#### 3. Python 2 → 3 的痛苦迁移（2008-2020）

**2008 年**：Python 3.0 发布，**故意不兼容** Python 2。主要修复：
- 字符串全面 Unicode 化（\`str\` 即 Unicode，\`bytes\` 单独类型）；
- \`print\` 从语句变函数（\`print "x"\` → \`print("x")\`）；
- 整数除法更直观（\`3/2 == 1.5\` 而非 \`1\`）。

这场迁移远比预想痛苦——大量生产代码、第三方库依赖 Python 2，迁移成本极高。社区被迫维护 Python 2 长达 12 年，直到 **2020 年 1 月 1 日** Python 2 才正式 EOL（停止维护）。这段历史给所有语言设计者一个教训：**破坏性兼容代价巨大，能避免就避免**。

#### 4. 现代 Python（3.6+）

- **3.6（2016）**：f-string、类型注解完善、async/await。
- **3.10（2021）**：结构化模式匹配 \`match/case\`（受 Rust/Scala 启发）。
- **3.11（2022）**：速度提升 10-60%，引入异常组。
- **3.12（2023）**：f-string 嵌套、类型参数语法。
- **3.13（2024）**：实验性"自由线程"（移除 GIL）、实验性 JIT 编译器。

### 二、Java 的发展历史

#### 1. 起源：1991 年 Oak 项目

1991 年，Sun Microsystems 的 James Gosling、Mike Sheridan 和 Patrick Naughton 启动了一个代号 **"Green Project"** 的内部项目，目标是给当时的"机顶盒、PDA、交互式电视"等消费电子产品写可移植的嵌入式软件。团队最初打算用 C++，但发现 C++ 在跨设备、内存安全、垃圾回收等方面不够用，于是 James Gosling  fork 出一门新语言，最初叫 **"Oak"**（因为他办公室窗外有一棵橡树）。

后来注册商标时发现"Oak"已被另一家公司占用，团队在一次咖啡馆 brainstorm 时改名为 **"Java"**——据传是源自印尼爪哇岛出产的咖啡。这也是 Java logo 是一杯热咖啡的原因。

#### 2. 1995 年正式发布

1995 年 5 月，Sun 在 SunWorld 大会上正式发布 Java 1.0，宣传口号就是 **"Write Once, Run Anywhere"**。彼时正值互联网爆发，浏览器厂商（Netscape）宣布支持 Java Applet，让 Java 一夜爆红——网页里能跑动画和小游戏，在当时是革命性的。

#### 3. 关键版本里程碑

| 版本 | 年份 | 重要特性 |
| --- | --- | --- |
| Java 1.0 | 1996 | 第一版，Applet、AWT |
| Java 1.2 | 1998 | 集合框架（Collection Framework），称为"Java 2" |
| Java 5 | 2004 | 泛型、注解、增强 for、自动装箱、枚举 |
| Java 8 | 2014 | Lambda、Stream API、Optional、新日期 API——里程碑版本 |
| Java 9 | 2017 | 模块化系统（Jigsaw）、JShell |
| Java 11 | 2018 | LTS，\`var\` 局部变量类型推断、HTTP Client |
| Java 17 | 2021 | LTS，密封类、记录类（record）、模式匹配初版 |
| Java 21 | 2023 | LTS，虚拟线程（Virtual Thread）、模式匹配完善 |

#### 4. 模块化（Jigsaw）的漫长之路

Java 9 的 **Jigsaw 项目**（JPMS，Java Platform Module System）是 Java 历史上最复杂、争议最大的改动。它给 Java 引入了"模块"概念，解决 \`rt.jar\` 过大、类路径冲突、内部 API 滥用等问题。但因为 Java 生态存量太大，大量库依赖反射访问 JDK 内部类（如 \`sun.misc.Unsafe\`），模块化强制封装会破坏这些库，导致迁移阻力极大。最终 Java 9 反复推迟发布，社区至今仍广泛使用"类路径模式"而非真正的模块化。这是 Java 历史上的"2→3 时刻"，但 Sun/Oracle 选择了更温和的兼容路径。

### 三、Python 的设计哲学：Zen of Python

Python 的设计哲学被写进了一个彩蛋——在 Python 交互环境中输入 \`import this\` 就会打印出 **"The Zen of Python"**（Python 之禅），由 Tim Peters 在 1999 年总结：

\`\`\`python
import this
# 输出（节选）：
# Beautiful is better than ugly.
# 显式优于隐式（Explicit is better than implicit.）
# 简单优于复杂（Simple is better than complex.）
# 可读性很重要（Readability counts.）
# 应该有一种——最好只有一种——明显的做法
#   （There should be one-- and preferably only one --obvious way to do it.）
# 如果实现很难解释，那它可能不是好主意
\`\`\`

几条最核心的原则：

1. **显式优于隐式**：能写清楚就别藏着。比如 Python 不允许 \`if x:\` 隐式把任意类型转 bool——虽然其实支持，但官方推荐显式 \`if x is not None:\`。
2. **可读性很重要**：缩进强制对齐，让代码"看起来"就清楚。
3. **一种明显做法**：与 Perl 的"There's More Than One Way To Do It"相反，Python 鼓励每个问题有"标准答案"。
4. **简单优于复杂，复杂优于繁杂**：能用一行说清楚就别写十行；但十行清晰胜过一行天书。

### 四、Java 的设计哲学

Java 没有像 Python 那样的"哲学宣言"，但从其设计取舍可以归纳出几条核心原则：

#### 1. Write Once, Run Anywhere（一次编写，到处运行）

通过 JVM 这一中间层，Java 字节码可以在任何装有 JVM 的平台上运行，无需重新编译。这是 Java 早期最强大的卖点，让它在企业跨平台部署中胜出。

\`\`\`java
// 同一份 .java 编译出的 .class，可以在 Windows/Linux/macOS 上跑
public class Hello {
    public static void main(String[] args) {
        System.out.println("同一份字节码，到处运行");
    }
}
\`\`\`

#### 2. 强类型与静态检查

Java 在编译期就完成类型检查，能在代码运行前抓出大量错误。这与 Python 的"运行到才报错"形成鲜明对比。

#### 3. 面向对象的纯化

Java 设计之初就规定"一切皆对象"（除了基本类型），所有方法和字段都必须存在于类中——没有"裸函数"、没有全局变量。这比 C++ 更彻底，比 Python 更严格（Python 允许模块级函数和变量）。

\`\`\`java
// Java：连一个最简单的函数都必须包在类里
public class MathUtil {
    public static int add(int a, int b) {
        return a + b;
    }
}
\`\`\`

\`\`\`python
# Python：函数可以直接定义在模块层
def add(a, b):
    return a + b
\`\`\`

#### 4. 显式优于"魔法"

Java 不喜欢"魔法"。Python 的装饰器、属性描述符、\`__getattr__\` 等元编程能力，在 Java 里几乎没有等价物。Java 觉得"看得见的代码才可靠"，宁可冗长也不要"看不见的行为"。

### 五、关键版本里程碑对照

| 时期 | Python | Java |
| --- | --- | --- |
| 1991-1995 | Python 0.9-1.0（1991-1994） | Oak 项目（1991-1994） |
| 1995-2000 | Python 1.x，缓慢积累 | Java 1.0（1995）发布，Applet 爆红 |
| 2000-2008 | Python 2.x，Web 兴起 | Java 5（2004）泛型、注解 |
| 2008-2014 | Python 3 迁移开始 | Java 8（2014）Lambda，里程碑 |
| 2014-2020 | Python 3.6+ 数据科学爆发 | Java 9-11，模块化、LTS 化 |
| 2020-2025 | Python 3.13 移除 GIL 实验 | Java 17/21 LTS，虚拟线程 |

### 六、LTS 与稳定版本策略

两门语言的版本发布策略在 2010 年后都发生了变化：

- **Python**：每年发布一个小版本（3.x），没有"LTS"概念。社区共识是"只维护最近 5 年的版本"，因为 CPython 是单一代码库，向后兼容做得好，升级成本低。
- **Java**：每 6 个月发布一个小版本，**每 3 个版本（约 18 个月）出一个 LTS**（长期支持版）。企业普遍只升级到 LTS（11、17、21）。Oracle JDK 商用收费后，大量企业转向 OpenJDK（开源版本）。

LTS 策略反映了两门语言的"用户画像"差异——Python 用户追求新特性，Java 用户追求稳定。

### 七、历史教训

两门语言的历史都给后人留下了重要教训：

1. **破坏性兼容代价巨大**：Python 2→3 用了 12 年才完成迁移，社区至今心有余悸。Java 学到了这一课，模块化、record、密封类都采用"渐进式引入"而非一刀切。
2. **生态比语言本身重要**：Python 之所以在 AI 时代胜出，不是因为语言本身多优秀，而是 NumPy/Pandas/PyTorch 生态齐全。Java 之所在企业后台稳固，是因为 Spring 生态成熟。
3. **设计哲学决定语言命运**：Python 的"可读性优先"让它在教学和科研中胜出；Java 的"工程化优先"让它在大型团队协作中胜出。没有绝对优劣，只有场景适配。

下一章我们终于要写代码了——从 Hello World 开始，看两门语言的开发环境与运行方式。
`,
  },

  // =========================================================
  // 第三章：第一个程序与开发环境
  // =========================================================
  {
    id: "pyjava-hello",
    icon: "🚀",
    group: "语言概览与基础",
    title: "第一个程序与开发环境",
    content: `## 第3章：第一个程序与开发环境

### 一、Hello World 对比

几乎所有语言教程都从 Hello World 开始。Python 和 Java 的 Hello World 差异，已经浓缩地展示了两门语言的"重量级"差异。

#### Python 版

\`\`\`python
print("Hello, World!")
\`\`\`

一行。结束。把这段代码存成 \`hello.py\`，运行 \`python hello.py\` 就能看到输出。

#### Java 版

\`\`\`java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

5 行（不算空行和括号）。文件名**必须**叫 \`Hello.java\`（与 \`public class\` 名一致），先 \`javac Hello.java\` 编译出 \`Hello.class\`，再 \`java Hello\` 运行。

#### 差异从第一行就开始

| 维度 | Python | Java |
| --- | --- | --- |
| 最小程序 | 1 行 | 1 个类 + 1 个 main 方法 |
| 文件名约束 | 任意 \`*.py\` | 必须与 \`public class\` 同名 |
| 编译步骤 | 无（解释器直接跑） | 必须 \`javac\` 编译 |
| 入口函数 | 不需要 | \`public static void main(String[] args)\` |
| 大小写 | 文件名大小写不敏感（macOS/Linux 上） | 严格大小写敏感 |

### 二、解释器 vs 编译器 + JVM

为什么 Python 一行能跑，Java 却要编译？这要从两门语言的执行模型说起。

#### Python 的执行流程

\`\`\`
源码 hello.py  →  词法分析  →  AST  →  字节码 .pyc  →  PVM 解释执行
\`\`\`

Python 把源码编译成字节码（\`.pyc\` 文件，缓存于 \`__pycache__\`），再由 **PVM**（Python Virtual Machine）逐条解释执行。整个过程对用户透明——你只看到 \`python hello.py\` 一条命令。

#### Java 的执行流程

\`\`\`
源码 Hello.java  →  javac 编译  →  Hello.class 字节码  →  JVM 执行（解释 + JIT）
\`\`\`

Java 把源码用 \`javac\` 显式编译成 \`.class\` 字节码，再由 **JVM**（Java Virtual Machine）执行。JVM 启动时是解释执行，热点代码会被 **JIT 编译器**（Just-In-Time）编译成机器码缓存，达到接近原生的性能。

#### 两者对比

| 维度 | Python | Java |
| --- | --- | --- |
| 编译产物 | \`.pyc\`（CPython 字节码） | \`.class\`（JVM 字节码） |
| 编译时机 | 运行时自动 | 显式用 \`javac\` |
| 字节码缓存 | \`__pycache__\` | \`.class\` 文件 |
| 执行方式 | 解释执行（无 JIT，3.13 实验性加入） | 解释 + JIT 混合 |
| 跨平台性 | 只要目标平台有同版本 Python | 只要目标平台有 JVM |
| 启动速度 | 快（毫秒级） | 慢（JVM 启动需 100ms-1s） |
| 长期性能 | 慢，CPU 密集场景慢 10-50 倍 | 快，JIT 优化后接近原生 |

### 三、为什么 Java 需要 main 方法而 Python 不需要

#### Java 的设计

Java 强制每个可执行程序必须有一个入口类，入口类必须有 \`public static void main(String[] args)\` 方法。这是 JVM 的契约——JVM 启动后，会查找你指定的类，调用它的 \`main\` 方法。

\`\`\`java
public class MyApp {
    public static void main(String[] args) {
        // 程序从这里开始执行
        System.out.println("args = " + Arrays.toString(args));
    }
}
\`\`\`

为什么是 \`public static\`？
- \`public\`：JVM 在外部，必须能访问。
- \`static\`：JVM 没有创建对象的能力（也不应该先创建），所以必须是静态方法。
- \`void\`：返回值无意义，JVM 不接收返回值。
- \`String[] args\`：命令行参数。

#### Python 的设计

Python 是脚本语言，**从文件第一行开始执行到最后一行**。没有"入口函数"概念。

\`\`\`python
# 这就是整个程序，从第一行开始执行
print("程序开始")
name = "Python"
print(f"Hello, {name}")
print("程序结束")
\`\`\`

但 Python 社区有个**约定**——用 \`if __name__ == "__main__":\` 包裹"直接运行时才执行的代码"。这能在文件被 import 时避免误执行：

\`\`\`python
def main():
    print("程序入口")

# 只有直接 python xxx.py 运行时才执行
# 被 import 时 __name__ 是模块名，不会执行 main()
if __name__ == "__main__":
    main()
\`\`\`

这是 Python 的"事实入口约定"，相当于 Java 的 \`main\` 方法，但更轻量。

### 四、开发环境搭建

#### Python 环境

1. **安装 Python 解释器**：从 [python.org](https://www.python.org) 下载，或用 \`brew install python\` / \`apt install python3\`。
2. **创建虚拟环境**：\`python3 -m venv .venv\` → \`source .venv/bin/activate\`。
3. **装包**：\`pip install requests\` 或现代的 \`uv add requests\`。
4. **选 IDE**：VS Code（轻量）或 PyCharm（专业）。

最小可运行项目结构：

\`\`\`
my-py-project/
├── .venv/
├── main.py
└── requirements.txt
\`\`\`

\`\`\`python
# main.py
def main():
    print("Hello from Python")

if __name__ == "__main__":
    main()
\`\`\`

#### Java 环境

1. **安装 JDK**：从 [adoptium.net](https://adoptium.net)（Eclipse Temurin，免费 OpenJDK）下载，推荐 LTS 版本（17 或 21）。
2. **配置环境变量**：\`JAVA_HOME\` 指向 JDK 安装目录，\`PATH\` 加上 \`$JAVA_HOME/bin\`。
3. **选 IDE**：**IntelliJ IDEA**（社区版免费，Java 体验最好）或 VS Code + Java 扩展。
4. **构建工具**：Maven 或 Gradle。

最小可运行项目结构（Maven）：

\`\`\`
my-java-project/
├── pom.xml
└── src/
    └── main/
        └── java/
            └── Hello.java
\`\`\`

\`\`\`java
// Hello.java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello from Java");
    }
}
\`\`\`

### 五、运行方式对比

#### Python

\`\`\`bash
# 直接运行
python hello.py

# 加参数
python hello.py --name Alice

# 让脚本可直接执行（Unix）
chmod +x hello.py
./hello.py     # 需要在文件首行加 #!/usr/bin/env python3
\`\`\`

#### Java

\`\`\`bash
# 编译 + 运行（两步）
javac Hello.java          # 生成 Hello.class
java Hello                # 运行（不加 .class 后缀）

# 加参数
java Hello --name Alice

# 打包成 jar
jar cvf hello.jar Hello.class
java -jar hello.jar       # 需要 MANIFEST.MF 指定主类

# 用 Maven 运行
mvn exec:java -Dexec.mainClass="Hello"
\`\`\`

Java 的"先编译后运行"在大型工程中有优势——编译期能发现大量错误，部署时只发 \`.class\` 字节码（不暴露源码）。但小型脚本场景下，Python 的"改完即跑"体验明显更好。

### 六、REPL：交互式环境

#### Python REPL

Python 自带交互式解释器，终端输入 \`python3\` 即可进入：

\`\`\`bash
$ python3
>>> 2 + 3
5
>>> name = "Alice"
>>> print(f"Hello, {name}")
Hello, Alice
>>> exit()
\`\`\`

Python REPL 是**日常调试、试错、学习语法的核心工具**。增强版 IPython 提供语法高亮、自动补全、魔术命令（\`%timeit\`）。

#### Java JShell

Java 9 引入 **JShell**（Java Shell），终于补上了交互式环境：

\`\`\`bash
$ jshell
|  Welcome to JShell -- Version 17
jshell> int x = 10;
x ==> 10
jshell> System.out.println("x = " + x);
x = 10
jshell> /exit
\`\`\`

JShell 比 Python REPL 稍微"重"一点——启动慢、不能直接写 \`if\` 块外的语句（需要分号）——但能直接定义类、方法，做语法实验足够用。

#### REPL 对比

| 维度 | Python REPL | Java JShell |
| --- | --- | --- |
| 引入版本 | 自 1991 年起就有 | Java 9（2017） |
| 启动速度 | 毫秒级 | 几百毫秒 |
| 语句结束 | 换行 | 分号 |
| 多行块 | 自动续行 | 需要显式开括号 |
| 增强版 | IPython | 无主流增强版 |
| 日常使用率 | 极高 | 较低 |

### 七、JVM 工作原理详解

JVM 是 Java 跨平台的核心。理解它的工作流程，有助于理解 Java 的性能、内存、GC 等所有问题。

#### 执行流程

\`\`\`
1. javac 把 Hello.java 编译成 Hello.class（字节码）
2. 启动 JVM（如 HotSpot）
3. 类加载器（ClassLoader）把 Hello.class 加载到内存
4. 字节码校验器（Verifier）检查字节码安全性
5. 解释器逐条执行字节码
6. JIT 编译器把热点代码（Hot Spot）编译成机器码缓存
7. GC 后台线程回收无用对象
\`\`\`

#### 字节码是什么

JVM 字节码是一种"虚拟指令集"，类似汇编但与具体 CPU 无关。可以用 \`javap -c Hello\` 查看：

\`\`\`bash
$ javap -c Hello
public class Hello {
  public static void main(java.lang.String[]);
    Code:
       0: getstatic     #2   // Field java/lang/System.out:Ljava/io/PrintStream;
       3: ldc           #3   // String Hello, World!
       5: invokevirtual #4   // Method java/io/PrintStream.println
       8: return
}
\`\`\`

Python 也有类似的字节码，用 \`dis\` 模块查看：

\`\`\`python
import dis
def hello(): print("Hi")
dis.dis(hello)
# 输出每条 LOAD_CONST / CALL 等指令
\`\`\`

### 八、Python 字节码（.pyc）

Python 也会编译成字节码 \`.pyc\`，只是对用户透明：

- 首次运行 \`hello.py\` → 编译成 \`.pyc\` 存到 \`__pycache__/hello.cpython-312.pyc\`。
- 再次运行 → 比较源码修改时间，未修改则直接用 \`.pyc\`，跳过编译，启动更快。
- 修改源码 → 自动重新编译。

\`.pyc\` 与 Java \`.class\` 的本质相似——都是平台无关的中间码。区别是 Python 的字节码**没有 JIT**（3.13 实验性加入），所以慢；Java 字节码有 JIT，热点代码接近原生速度。

### 九、开发环境对比总览

| 维度 | Python | Java |
| --- | --- | --- |
| 解释器/JDK | python.org / brew / apt | adoptium.net / SDKMAN |
| 包管理 | pip / uv | Maven / Gradle |
| 虚拟环境 | venv / uv venv | 不需要（JDK 全局唯一） |
| 项目结构 | 扁平，单文件也能跑 | 严格 \`src/main/java\` + 包路径 |
| 主流 IDE | VS Code / PyCharm | IntelliJ IDEA |
| 构建产物 | 直接跑 \`.py\` | \`.class\` / \`.jar\` |
| 启动速度 | 毫秒级 | 100ms - 1s（JVM 启动） |

下一章我们看两门语言的基本语法——缩进 vs 大括号、分号、注释、命名规范。
`,
  },

  // =========================================================
  // 第四章：基本语法对比
  // =========================================================
  {
    id: "pyjava-syntax",
    icon: "✍️",
    group: "语言概览与基础",
    title: "基本语法对比",
    content: `## 第4章：基本语法对比

语法是语言的"长相"。Python 和 Java 在语法层面的差异，几乎可以代表"动态脚本语言"和"静态编译语言"两类范式的典型对立。

### 一、代码块：缩进 vs 大括号

这是 Python 和 Java 最显眼的差异——**Python 用缩进表示代码块，Java 用大括号 \`{}\`**。

#### Python（缩进）

\`\`\`python
def check_score(score):
    if score >= 90:
        print("优秀")
        grade = "A"
    elif score >= 60:
        print("及格")
        grade = "B"
    else:
        print("不及格")
        grade = "F"
    return grade
\`\`\`

缩进**必须一致**（同一块内不能混用空格和 Tab），缩进错误会直接报 \`IndentationError\`。社区约定**用 4 个空格**（PEP 8）。

#### Java（大括号）

\`\`\`java
public static String checkScore(int score) {
    if (score >= 90) {
        System.out.println("优秀");
        return "A";
    } else if (score >= 60) {
        System.out.println("及格");
        return "B";
    } else {
        System.out.println("不及格");
        return "F";
    }
}
\`\`\`

大括号 \`{}\` 决定代码块，缩进只是"好看"，不影响逻辑。Java 习惯是"开括号不换行"（K&R 风格），但即便你写成一行也能跑：

\`\`\`java
if (score >= 90) { return "A"; } else if (score >= 60) { return "B"; } else { return "F"; }
\`\`\`

#### 缩进 vs 大括号的优劣

| 维度 | Python 缩进 | Java 大括号 |
| --- | --- | --- |
| **可读性** | 强制，所有人都按规范写 | 依赖开发者自觉 |
| **灵活性** | 低，强制对齐 | 高，可压缩成一行 |
| **错误率** | 缩进错误编译期就能发现 | 漏写 \`}\` 经常导致诡异错误 |
| **嵌套深度** | 一眼能看出层级 | 大括号一多容易看花眼 |
| **复制粘贴** | 容易破坏缩进 | 大括号成对，相对安全 |
| **空行** | 不影响逻辑 | 不影响逻辑 |

**经验**：Python 的强制缩进让代码天然"美观"，但遇到大段粘贴时容易出错；Java 的大括号更灵活，但乱写起来也很丑。两者各有取舍。

### 二、语句结束：换行 vs 分号

#### Python

Python 用**换行**结束语句，**不需要分号**：

\`\`\`python
x = 10
y = 20
print(x + y)
\`\`\`

如果想一行写多条语句，**可以**用分号（但不推荐）：

\`\`\`python
x = 10; y = 20; print(x + y)   # 合法但难看
\`\`\`

如果语句太长想换行，用反斜杠 \`\\\` 或括号：

\`\`\`python
# 反斜杠续行
total = 1 + 2 + 3 + \\
        4 + 5 + 6

# 括号内换行（推荐）
total = (1 + 2 + 3 +
         4 + 5 + 6)
\`\`\`

#### Java

Java 必须用**分号**结束语句：

\`\`\`java
int x = 10;
int y = 20;
System.out.println(x + y);
\`\`\`

换行不影响逻辑，可以一行写多条：

\`\`\`java
int x = 10; int y = 20; System.out.println(x + y);
\`\`\`

#### 为什么 Python 没有分号

Python 的设计取舍是：**既然换行已经足够清晰，分号就是冗余**。分号的存在源于 C/Pascal 时代的"一条语句可以跨多行"需求，而 Python 用括号续行 + 缩进解决了多行问题，分号自然成了多余的语法噪音。这也让 Python 代码看起来"更轻"。

### 三、注释

| 类型 | Python | Java |
| --- | --- | --- |
| **单行注释** | \`#\` | \`//\` |
| **多行注释** | 三引号 \`"""\`\`"""\\\`（其实是字符串字面量） | \`/* */\` |
| **文档注释** | 三引号放在函数/类开头（docstring） | \`/** */\`（Javadoc） |

#### Python 注释

\`\`\`python
# 这是单行注释
x = 10  # 行尾注释

"""
这是多行"注释"
其实是字符串字面量，但没人用它
"""

def add(a, b):
    """这是文档字符串（docstring）
    可以用 help(add) 查看"""
    return a + b
\`\`\`

#### Java 注释

\`\`\`java
// 单行注释
int x = 10;  // 行尾注释

/*
   多行注释
   可以跨多行
*/

/**
 * 这是 Javadoc 文档注释
 * 可以用 javadoc 工具生成 API 文档
 * @param a 加数
 * @param b 加数
 * @return 两数之和
 */
public static int add(int a, int b) {
    return a + b;
}
\`\`\`

Javadoc 比 Python docstring 更"正式"——有 \`@param\`、\`@return\`、\`@throws\` 等标签，能生成完整的 HTML API 文档。Python 后来引入类型注解（PEP 484），用 \`typing\` 模块补上了类型信息，但 docstring 仍是文档主力。

### 四、变量声明

这是动态类型与静态类型最直接的区别。

#### Python：直接赋值，无类型声明

\`\`\`python
x = 10            # 整数
x = "hello"       # 同一个变量可以变字符串（不推荐但合法）
x = [1, 2, 3]     # 再变列表
\`\`\`

Python 变量是"标签"，贴在对象上；变量本身没有类型，类型属于它指向的对象。

#### Java：必须声明类型

\`\`\`java
int x = 10;              // 必须声明类型
// x = "hello";          // 编译错误！类型不匹配
String s = "hello";      // 必须用新变量
List<Integer> list = new ArrayList<>();
\`\`\`

Java 10+ 引入 \`var\`（局部变量类型推断），让写法接近 Python：

\`\`\`java
var x = 10;              // 编译器推断为 int
var s = "hello";         // 推断为 String
var list = new ArrayList<Integer>();   // 推断为 ArrayList<Integer>
// x = "hello";          // 仍然报错！var 只是省略类型名，类型本身是静态的
\`\`\`

#### 对比

| 维度 | Python | Java |
| --- | --- | --- |
| 声明方式 | 直接赋值 | 必须声明类型 / \`var\` |
| 类型变化 | 允许（不推荐） | 不允许 |
| 类型检查时机 | 运行时 | 编译期 |
| 错误发现 | 运行到才报错 | 编译期就报错 |

### 五、命名规范

两门语言都有强烈的命名约定，社区执行严格。

#### Python：snake_case

| 类型 | 规范 | 示例 |
| --- | --- | --- |
| 变量/函数 | 小写 + 下划线 | \`user_name\`、\`get_user_id()\` |
| 类 | 大驼峰 | \`MyClass\`、\`HttpClient\` |
| 常量 | 全大写 + 下划线 | \`MAX_SIZE\`、\`DEFAULT_TIMEOUT\` |
| 模块 | 小写 + 下划线 | \`user_profile.py\` |
| 私有 | 前缀下划线 | \`_private_var\`、\`__name_mangled\` |
| 魔术方法 | 双下划线包裹 | \`__init__\`、\`__str__\` |

#### Java：camelCase

| 类型 | 规范 | 示例 |
| --- | --- | --- |
| 变量/方法 | 小驼峰 | \`userName\`、\`getUserId()\` |
| 类 | 大驼峰 | \`MyClass\`、\`HttpClient\` |
| 常量 | 全大写 + 下划线 | \`MAX_SIZE\`、\`DEFAULT_TIMEOUT\` |
| 包 | 全小写 | \`com.example.user\` |
| 接口 | 大驼峰 | \`Runnable\`、\`Comparable\` |
| 泛型参数 | 单个大写字母 | \`T\`、\`E\`、\`K\`、\`V\` |

#### 命名规范对比表

| 维度 | Python | Java |
| --- | --- | --- |
| 变量风格 | snake_case | camelCase |
| 类风格 | PascalCase | PascalCase（一致） |
| 常量风格 | UPPER_SNAKE | UPPER_SNAKE（一致） |
| 包/模块 | 下划线小写 | 全小写点分 |
| 私有约定 | 前缀 \`_\` | 命名约定 + \`private\` 关键字 |

经验：**Python 写起来像写英文句子，Java 写起来像写工程图纸**。

### 六、main 入口

#### Python：\`if __name__ == "__main__":\`

\`\`\`python
def main():
    print("程序入口")

if __name__ == "__main__":
    main()
\`\`\`

原理：每个 Python 模块都有 \`__name__\` 属性。直接运行时 \`__name__ == "__main__"\`；被 import 时 \`__name__\` 是模块名。这个判断让文件既能直接运行，又能作为模块被导入而不误执行入口代码。

#### Java：\`public static void main(String[] args)\`

\`\`\`java
public class App {
    public static void main(String[] args) {
        System.out.println("程序入口");
    }
}
\`\`\`

JVM 启动后查找入口类（用 \`java App\` 指定，或 jar 的 MANIFEST 中 \`Main-Class\`），调用其 \`main\` 方法。**这是 JVM 的硬契约**，方法签名错一个字都跑不起来。

#### 对比

| 维度 | Python \`__main__\` | Java \`main\` |
| --- | --- | --- |
| 强制性 | 约定（不写也能跑） | 强制（必须） |
| 参数 | \`sys.argv\` | \`String[] args\` |
| 命令行解析 | \`argparse\` 模块 | 第三方库（picocli 等） |
| 灵活性 | 高，可任意组织 | 低，签名固定 |

### 七、综合对比示例

同样的逻辑，两门语言的"长相"差异：

#### Python

\`\`\`python
# 计算斐波那契数列前 N 项
def fibonacci(n):
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    result = [0, 1]
    for i in range(2, n):
        result.append(result[i-1] + result[i-2])
    return result


if __name__ == "__main__":
    n = 10
    print(f"前 {n} 项: {fibonacci(n)}")
\`\`\`

#### Java

\`\`\`java
import java.util.ArrayList;
import java.util.List;

public class Fibonacci {
    
    // 计算斐波那契数列前 N 项
    public static List<Integer> fibonacci(int n) {
        if (n <= 0) {
            return new ArrayList<>();
        } else if (n == 1) {
            List<Integer> result = new ArrayList<>();
            result.add(0);
            return result;
        }
        
        List<Integer> result = new ArrayList<>();
        result.add(0);
        result.add(1);
        for (int i = 2; i < n; i++) {
            result.add(result.get(i - 1) + result.get(i - 2));
        }
        return result;
    }
    
    public static void main(String[] args) {
        int n = 10;
        System.out.println("前 " + n + " 项: " + fibonacci(n));
    }
}
\`\`\`

#### 差异点

- Python 14 行 vs Java 30 行——Java 多出的几乎全是类型声明、import、大括号、分号。
- Python 的列表字面量 \`[0, 1]\` 比 Java 的 \`new ArrayList<>(); add(0); add(1);\` 简洁得多。
- Python 的 f-string \`f"前 {n} 项"\` 比 Java 的字符串拼接 \`"前 " + n + " 项"\` 更直观（Java 21 终于有 \`STR."\` 模板字符串）。
- Python 不需要 \`import\` 标准库基础类型；Java 必须 import \`List\`、\`ArrayList\`。

### 八、为什么会有这些差异

语法差异背后是设计哲学的差异：

- **Python 追求"代码即文档"**：强制缩进、省略分号、列表字面量、f-string，都是为了让代码读起来像英文句子。
- **Java 追求"代码即契约"**：必须声明类型、必须用类包裹、必须写 main 签名，都是为了让编译器做更多检查，团队协作更安全。

下一章我们看基本数据类型——Python 的"万物皆对象"与 Java 的"基本类型 + 包装类"双轨制。
`,
  },

  // =========================================================
  // 第五章：基本数据类型
  // =========================================================
  {
    id: "pyjava-types-basic",
    icon: "🔢",
    group: "语言概览与基础",
    title: "基本数据类型",
    content: `## 第5章：基本数据类型

基本数据类型是语言处理"数字、文字、真假、空"的原子能力。Python 和 Java 在这里走出了完全不同的两条路——Python 主张"万物皆对象"，类型少而统一；Java 主张"性能优先"，区分基本类型和对象，用 8 种基本类型 + 包装类的"双轨制"兼顾性能与面向对象。

### 一、Python 的基本类型

Python 的"基本类型"其实都是对象（即便是 \`int\` 也有方法），共 6 大类：

| 类型 | 关键字 | 示例 | 说明 |
| --- | --- | --- | --- |
| 整数 | \`int\` | \`42\`、\`-7\`、\`0b1010\` | 任意精度，无溢出 |
| 浮点 | \`float\` | \`3.14\`、\`2e10\` | IEEE 754 双精度（64 位） |
| 字符串 | \`str\` | \`"hello"\`、\`'中文'\` | Unicode，不可变 |
| 布尔 | \`bool\` | \`True\`、\`False\` | \`int\` 的子类（True==1） |
| 空值 | \`NoneType\` | \`None\` | 表示"没有值" |
| 复数 | \`complex\` | \`3+4j\` | 数学/工程计算用，Java 没有内置 |

\`\`\`python
i = 42                  # int，任意精度
f = 3.14                # float
s = "hello"             # str
b = True                # bool
n = None                # NoneType
c = 3 + 4j              # complex

# 类型查看
print(type(i))          # <class 'int'>
print(type(s))          # <class 'str'>
\`\`\`

### 二、Java 的基本类型

Java 的"基本类型"是真正的基本类型——不是对象，存在栈上（局部变量），没有方法，共 8 种：

| 类型 | 关键字 | 位数 | 范围 | 示例 |
| --- | --- | --- | --- | --- |
| 字节 | \`byte\` | 8 | -128 ~ 127 | \`byte b = 100;\` |
| 短整 | \`short\` | 16 | -32768 ~ 32767 | \`short s = 1000;\` |
| 整数 | \`int\` | 32 | -2^31 ~ 2^31-1 | \`int i = 100000;\` |
| 长整 | \`long\` | 64 | -2^63 ~ 2^63-1 | \`long l = 100000L;\` |
| 单精度 | \`float\` | 32 | IEEE 754 | \`float f = 3.14f;\` |
| 双精度 | \`double\` | 64 | IEEE 754 | \`double d = 3.14;\` |
| 字符 | \`char\` | 16 | 0 ~ 65535（Unicode） | \`char c = 'A';\` |
| 布尔 | \`boolean\` | 1（JVM 实现） | true / false | \`boolean b = true;\` |

对应的**包装类**（Wrapper Class）放在 \`java.lang\` 包：

| 基本类型 | 包装类 |
| --- | --- |
| byte | Byte |
| short | Short |
| int | Integer |
| long | Long |
| float | Float |
| double | Double |
| char | Character |
| boolean | Boolean |

\`\`\`java
int i = 100000;
double d = 3.14;
char c = 'A';
boolean b = true;

// 包装类（对象，可以有方法、可以为 null）
Integer obj = Integer.valueOf(100);
Double dObj = 3.14;
Character cObj = 'A';
Boolean bObj = Boolean.TRUE;
\`\`\`

### 三、整数对比：任意精度 vs 固定宽度

这是 Python 和 Java 最戏剧性的差异之一。

#### Python：整数任意精度

Python 的 \`int\` 没有大小限制，会自动扩展内存：

\`\`\`python
x = 10 ** 100         # 10 的 100 次方，远超 64 位整数
print(x)
# 10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

print(x * x)          # 仍然精确，不会溢出
\`\`\`

这意味着 Python 程序员**永远不用关心整数溢出**——计算大数、密码学、组合数学时尤其方便。

#### Java：整数固定宽度

Java 的 \`int\` 是 32 位有符号整数，超过 \`2^31 - 1\`（约 21 亿）会**溢出**，且不报错：

\`\`\`java
int x = 2147483647;        // int 最大值
int y = x + 1;
System.out.println(y);     // 输出 -2147483648（溢出为最小值！）

long big = 9_223_372_036_854_775_807L;   // long 最大值
long overflow = big + 1;
System.out.println(overflow);             // 又溢出为负
\`\`\`

**Java 整数溢出是静默的**，是无数 bug 的根源。Java 8+ 引入 \`Math.addExact\` 等方法在溢出时抛异常：

\`\`\`java
try {
    int safe = Math.addExact(x, 1);   // 溢出会抛 ArithmeticException
} catch (ArithmeticException e) {
    System.out.println("溢出了！");
}
\`\`\`

如果需要任意精度，Java 要用 \`java.math.BigInteger\`：

\`\`\`java
import java.math.BigInteger;

BigInteger big = new BigInteger("10").pow(100);
System.out.println(big);          // 10 的 100 次方
System.out.println(big.multiply(big));  // 平方，仍然精确
\`\`\`

\`BigInteger\` 用起来比 Python 的 \`int\` 麻烦得多——不能用 \`+\`、\`*\`，必须用 \`.add()\`、\`.multiply()\`，因为 Java 不支持运算符重载。

#### 对比

| 维度 | Python \`int\` | Java \`int\` / \`long\` | Java \`BigInteger\` |
| --- | --- | --- | --- |
| 精度 | 任意 | 固定 32/64 位 | 任意 |
| 溢出 | 不会 | 会（静默） | 不会 |
| 运算符 | \`+\` \`*\` 等 | \`+\` \`*\` 等 | \`.add()\` \`.multiply()\` |
| 性能 | 较慢（动态分配） | 极快（栈上原生） | 慢（堆上对象） |
| 易用性 | 极高 | 中（要小心溢出） | 低（API 啰嗦） |

### 四、字符串对比

#### Python：str 不可变

\`\`\`python
s = "hello"
# s[0] = "H"          # 报错！str 不可变
s = "H" + s[1:]       # 必须创建新字符串
print(s)              # Hello
\`\`\`

Python 字符串是 Unicode，不可变。修改字符串会创建新对象。频繁拼接大字符串应该用 \`"".join(list)\` 而非 \`+=\`：

\`\`\`python
# 错误做法：每次 += 都创建新字符串，O(n^2)
result = ""
for word in ["a", "b", "c", "d"]:
    result += word

# 正确做法：用 join，O(n)
result = "".join(["a", "b", "c", "d"])
\`\`\`

#### Java：String 不可变 + StringBuilder 可变

\`\`\`java
String s = "hello";
// s[0] = "H";   // 编译错误，String 不可变
s = "H" + s.substring(1);   // 创建新对象
System.out.println(s);       // Hello
\`\`\`

Java \`String\` 也是不可变 Unicode 字符串。但 Java 提供了可变的 \`StringBuilder\`（单线程）和 \`StringBuffer\`（线程安全）：

\`\`\`java
// 错误做法：每次 + 都创建新 String
String result = "";
for (String word : new String[]{"a", "b", "c", "d"}) {
    result = result + word;    // O(n^2)
}

// 正确做法：用 StringBuilder
StringBuilder sb = new StringBuilder();
for (String word : new String[]{"a", "b", "c", "d"}) {
    sb.append(word);            // O(n)
}
String result = sb.toString();
\`\`\`

#### 字符串内存模型

| 维度 | Python str | Java String |
| --- | --- | --- |
| 不可变 | 是 | 是 |
| 内部编码 | UCS-1/UCS-2/UCS-4（PEP 393 灵活表示） | UTF-16 |
| 字符串池 | CPython 有小型字符串 intern | JVM 有字符串常量池 |
| 可变版本 | 无（用 list 拼） | StringBuilder / StringBuffer |
| 字面量语法 | \`"abc"\`、\`'abc'\`、\`"""multi"""\` | \`"abc"\`、\`"""multi"""\`（Java 15+） |
| 模板字符串 | f-string \`f"{x}"\` | 暂无（Java 21 STR 模板仍在预览） |

#### 字符串字面量示例

\`\`\`python
# Python
name = "Alice"
age = 30
msg = f"姓名：{name}，年龄：{age}"   # f-string
multi = """
多行
字符串
"""
\`\`\`

\`\`\`java
// Java
String name = "Alice";
int age = 30;
String msg = String.format("姓名：%s，年龄：%d", name, age);   // 类似 C 的 printf
// Java 15+ 文本块
String multi = """
        多行
        字符串
        """;
\`\`\`

### 五、布尔值

| 维度 | Python | Java |
| --- | --- | --- |
| 关键字 | \`True\` / \`False\`（首字母大写） | \`true\` / \`false\`（全小写） |
| 类型 | \`bool\`（\`int\` 的子类） | \`boolean\`（基本类型，非对象） |
| 真值判断 | 0/0.0/""/[]/{}/None 为假，其余为真 | **只有** \`true\` / \`false\`，不能隐式转换 |

#### Python 的"真值表"

Python 的 \`if x:\` 会对任意类型做"真值判断"：

\`\`\`python
if 0:        pass   # 假
if "":       pass   # 假（空字符串）
if []:       pass   # 假（空列表）
if None:     pass   # 假
if " ":      pass   # 真（非空字符串，即使只有空格）
if [0]:      pass   # 真（非空列表，即使元素是 0）
\`\`\`

这个特性很方便，但也容易出 bug——\`if x:\` 在 \`x\` 是 \`None\`、\`0\`、\`[]\` 时都为假，无法区分。所以 Python 推荐显式判断：\`if x is not None:\` 或 \`if len(x) > 0:\`。

#### Java 严格的布尔

Java 的 \`if\` 条件**必须是 boolean 类型**，不能是数字、对象：

\`\`\`java
int x = 1;
// if (x) { ... }        // 编译错误！必须 boolean
if (x != 0) { ... }      // 必须显式比较

String s = "hello";
// if (s) { ... }        // 编译错误！
if (s != null && !s.isEmpty()) { ... }   // 必须显式判空和判长度
\`\`\`

Java 的严格避免了 Python 那种"真假混淆"，但写起来更啰嗦。

### 六、空值：None vs null

| 维度 | Python \`None\` | Java \`null\` |
| --- | --- | --- |
| 类型 | \`NoneType\` 单例 | 字面量，无类型 |
| 判空 | \`x is None\` | \`x == null\` |
| 默认值 | 函数无返回时返回 \`None\` | 对象引用默认 \`null\` |
| 调用方法 | \`None.foo()\` 抛 \`AttributeError\` | \`null.foo()\` 抛 \`NullPointerException\` |
| 安全访问 | 无原生（用 \`or\` 短路） | Java 8+ \`Optional\`、Java 16+ \`?\` 链 |

#### Python None

\`\`\`python
x = None
if x is None:
    print("x 是空")

# 函数无 return 默认返回 None
def foo():
    pass

result = foo()
print(result is None)   # True

# 用 or 提供默认值
name = None
display = name or "匿名"   # "匿名"
\`\`\`

#### Java null

\`\`\`java
String x = null;
if (x == null) {
    System.out.println("x 是空");
}

// 对象字段默认 null
class User {
    String name;   // 默认 null
}

User u = new User();
// u.name.length();   // NullPointerException！

// Java 8 Optional 提倡显式表达"可能为空"
Optional<String> name = Optional.ofNullable(u.name);
String display = name.orElse("匿名");
\`\`\`

\`NullPointerException\`（NPE）是 Java 最臭名昭著的异常，被称为"十亿美元错误"（Tony Hoare 自承发明 null 引用是错误）。Java 8 引入 \`Optional\` 试图缓解，但旧代码大量使用 null，迁移缓慢。Python 的 \`None\` 单例设计相对安全——至少你不能给 \`None\` 赋字段。

### 七、Java 自动装箱与拆箱

Java 的"基本类型 + 包装类"双轨制带来一个问题：容器（如 \`List\`）只能放对象，不能放基本类型。这就需要"装箱"（把基本类型包成包装类）和"拆箱"（取出基本类型）。

#### 手动装箱拆箱（Java 5 之前）

\`\`\`java
List<Integer> list = new ArrayList<>();
list.add(Integer.valueOf(42));      // 手动装箱
int x = list.get(0).intValue();     // 手动拆箱
\`\`\`

#### 自动装箱拆箱（Java 5+）

\`\`\`java
List<Integer> list = new ArrayList<>();
list.add(42);                       // 自动装箱：int → Integer
int x = list.get(0);                // 自动拆箱：Integer → int
\`\`\`

#### 装箱陷阱

\`\`\`java
Integer a = 127;
Integer b = 127;
System.out.println(a == b);         // true（缓存了 -128~127）

Integer c = 128;
Integer d = 128;
System.out.println(c == d);         // false！超出缓存范围，是不同对象
System.out.println(c.equals(d));    // true（用 equals 比较）
\`\`\`

**JVM 缓存了 -128 到 127 的 Integer 对象**，所以小整数 \`==\` 比较为 true，大整数为 false——这是无数 Java bug 的来源。规则：**比较包装类永远用 \`.equals()\`**。

#### Python 没有这个问题

Python 的 \`int\` 就是对象，没有"基本 vs 包装"的分裂，也就没有装箱拆箱：

\`\`\`python
a = 127
b = 127
print(a is b)    # True（小整数缓存）

c = 1000000
d = 1000000
print(c is d)    # 不一定（仅编译期可确定的字面量会被同一化）
print(c == d)    # True（值相等）
\`\`\`

Python 也有小整数缓存（-5 到 256），但因为 \`int\` 本来就是对象，不存在"基本 vs 包装"的混淆。

### 八、类型转换

#### Python

\`\`\`python
# 显式转换
x = int("42")          # 字符串 → 整数
y = float("3.14")      # 字符串 → 浮点
s = str(42)            # 整数 → 字符串

# 隐式转换（部分场景）
result = 1 + 2.0       # int + float → float
print(result)          # 3.0
\`\`\`

#### Java

\`\`\`java
// 显式转换
int x = Integer.parseInt("42");
double y = Double.parseDouble("3.14");
String s = String.valueOf(42);
String s2 = Integer.toString(42);

// 隐式转换（拓宽，安全）
double d = 1 + 2.0;     // int + double → double

// 强制转换（窄化，可能丢精度）
int i = (int) 3.99;      // i = 3，直接截断
long big = 100_000L;
int small = (int) big;   // 可能溢出
\`\`\`

Java 的转换规则更严格——窄化必须显式 cast，编译器不让你"偷偷丢精度"。Python 没有这种 cast 语法，因为类型是动态的。

### 九、类型系统总览对比

| 维度 | Python | Java |
| --- | --- | --- |
| 基本类型数量 | 6 类（int/float/str/bool/None/complex） | 8 种基本类型 + 8 种包装类 |
| 是否对象 | 全是对象 | 基本类型不是对象，包装类是 |
| 整数精度 | 任意 | 固定（int=32, long=64） |
| 整数溢出 | 不会 | 会（静默） |
| 字符串 | 不可变 Unicode | 不可变 Unicode（UTF-16） |
| 布尔真假判断 | 任意类型（真值表） | 严格 boolean |
| 空值 | \`None\`（单例对象） | \`null\`（无类型字面量） |
| 装箱拆箱 | 不需要 | 自动装箱拆箱（有陷阱） |
| 类型转换 | 灵活，部分隐式 | 严格，窄化必须 cast |

### 十、设计取舍的总结

- **Python 的"万物皆对象"**：类型少、统一、易学，但牺牲了基本类型的性能（每个 int 都是堆上对象）。在 AI/脚本场景下，这无所谓；在高并发后台，这是性能负担。
- **Java 的"基本 + 包装"双轨制**：基本类型在栈上，性能极高；包装类提供面向对象能力。代价是开发者要理解装箱陷阱、NPE 风险，学习曲线更陡。

这种取舍贯穿两门语言的每个角落——下一章我们看变量作用域，会再次看到这种"简洁 vs 严谨"的对立。
`,
  },
];
