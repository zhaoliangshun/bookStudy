// =============================================================
// Java 交互式教程 —— 第四批章节（基础深入组，共 15 章）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：JDK / JRE / JVM 深入区别
  // =========================================================
  {
    id: "java-jdk-jre-jvm",
    group: "基础深入",
    icon: "🏠",
    title: "JDK / JRE / JVM 深入区别",
    content: `## JDK、JRE、JVM：三者关系一图看懂

初学 Java 最容易混淆的三个概念就是 **JDK**、**JRE** 和 **JVM**。它们是 Java 运行体系的三个层次，彼此**层层包含**：

\`\`\`
┌─────────────────────────────────────┐
│  JDK（Java Development Kit）        │
│  ┌───────────────────────────────┐  │
│  │  JRE（Java Runtime Environment）│  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  JVM（Java Virtual Machine）│ │  │
│  │  └─────────────────────────┘  │  │
│  │  + 核心类库 rt.jar 等          │  │
│  └───────────────────────────────┘  │
│  + 开发工具 javac / java / jar ...  │
└─────────────────────────────────────┘
\`\`\`

### JVM：跨平台的基石

**JVM（Java 虚拟机）** 是一个抽象的计算机，负责把 **字节码（.class）** 翻译成当前操作系统能理解的机器指令。Java "一次编写，到处运行" 的核心就在于 JVM：同一份字节码跑在 Windows 的 JVM、Linux 的 JVM、Mac 的 JVM 上，由各自平台的 JVM 实现"本地化翻译"。**JVM 是平台相关的**（不同 OS 有不同实现），但字节码是**平台无关**的。

### JRE：运行环境

**JRE（Java 运行时环境）** = JVM + 核心类库（如 \`java.lang\`、\`java.util\`）。如果你**只是想运行** Java 程序，装 JRE 就够了。从 JDK 11 起，Oracle 不再单独提供 JRE，JDK 本身就包含运行所需的一切。

### JDK：开发工具包

**JDK（Java 开发工具包）** = JRE + 开发工具。它面向**开发者**，包含编译器 \`javac\`、运行器 \`java\`、打包工具 \`jar\`、文档工具 \`javadoc\`、调试器 \`jdb\` 等。从 JDK 10 开始引入 \`var\`，JDK 11 引入模块化成熟，LTS 版本主要有 8、11、17、21。

### HotSpot JVM 简介

Oracle/OpenJDK 默认的 JVM 实现叫 **HotSpot**，它的核心是**即时编译（JIT）**：JVM 会监测"热点代码"（频繁执行的方法/循环），用 \`C1\`（客户端编译器，快速编译）和 \`C2\`（服务端编译器，深度优化）把它们编译成高度优化的本地机器码，从而兼顾启动速度与峰值性能。

下方代码通过 \`System.getProperty\` 获取当前 Java 运行时的关键信息，帮助你直观感受 JVM/JRE/JDK 的存在。`,
    code: `// ============================================================
// 第 1 章：JDK / JRE / JVM 演示
// 通过 System.getProperty 获取 Java 运行时信息
// ============================================================

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Java 运行时环境信息 ===");

        // Java 版本（JRE 规范版本）
        System.out.println("Java 版本: " + System.getProperty("java.version"));
        // Java 运行时环境版本
        System.out.println("JRE 版本: " + System.getProperty("java.runtime.version"));
        // Java 虚拟机规范版本
        System.out.println("JVM 规范版本: " + System.getProperty("java.vm.specification.version"));
        // JVM 实现名称（HotSpot 等）
        System.out.println("JVM 实现名称: " + System.getProperty("java.vm.name"));
        // JVM 实现版本
        System.out.println("JVM 实现版本: " + System.getProperty("java.vm.version"));

        System.out.println("\\n=== 系统与平台信息 ===");
        // 当前操作系统
        System.out.println("操作系统: " + System.getProperty("os.name") + " " + System.getProperty("os.arch"));
        // Java 安装目录（JAVA_HOME）
        System.out.println("Java 安装目录: " + System.getProperty("java.home"));
        // 用户工作目录
        System.out.println("当前工作目录: " + System.getProperty("user.dir"));

        System.out.println("\\n=== 运行时内存信息（JVM 堆） ===");
        Runtime runtime = Runtime.getRuntime();
        // JVM 可用处理器核心数
        System.out.println("可用 CPU 核心数: " + runtime.availableProcessors());
        // JVM 最大可用内存（字节）
        System.out.println("最大内存 (MB): " + runtime.maxMemory() / 1024 / 1024);
        // 当前已使用内存
        long used = (runtime.totalMemory() - runtime.freeMemory()) / 1024 / 1024;
        System.out.println("已使用堆内存 (MB): " + used);
    }
}`,
  },

  // =========================================================
  // 第二章：环境搭建与工具链
  // =========================================================
  {
    id: "java-install",
    group: "基础深入",
    icon: "🔧",
    title: "环境搭建与工具链",
    content: `## 环境搭建：从安装 JDK 到运行第一个程序

要写 Java，第一步是安装 **JDK**。推荐选择 **LTS 版本**（长期支持版），如 JDK 17 或 JDK 21。下载渠道有：Oracle 官网（商用需付费）、OpenJDK（开源免费）、Adoptium / Amazon Corretto / 阿里 Dragonwell 等。本教程假设使用 OpenJDK 17。

### 配置环境变量

安装完 JDK 后，需要配置两个环境变量（macOS/Linux 一般用 \`~/.zshrc\` 或 \`~/.bashrc\`，Windows 用系统设置）：

- **\`JAVA_HOME\`**：指向 JDK 安装目录（如 \`/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home\`）。
- **\`PATH\`**：把 \`$JAVA_HOME/bin\` 追加到 \`PATH\`，这样在任意目录都能直接调用 \`javac\` / \`java\`。

验证安装：\`java -version\` 看运行时版本，\`javac -version\` 看编译器版本。

### 命令行编译运行流程

\`\`\`bash
javac Main.java      # 编译：生成 Main.class 字节码
java Main            # 运行：JVM 加载 Main 类并执行 main 方法
\`\`\`

注意 \`java\` 后跟的是**类名**，不是文件名，也不带 \`.class\` 后缀。从 JDK 11 起，单文件可以直接 \`java Main.java\` 隐式编译运行（适合写小脚本）。

### 常用 javac 编译选项

| 选项 | 作用 |
| --- | --- |
| \`-d <目录>\` | 指定输出 .class 的目录（按包结构生成子目录） |
| \`-encoding <编码>\` | 指定源文件编码（中文源码常用 \`UTF-8\`） |
| \`-sourcepath <路径>\` | 指定查找源文件的位置 |
| \`-cp / -classpath\` | 指定用户类文件或 jar 的位置 |
| \`-Xlint:all\` | 开启所有警告提示 |

### 常用 java 运行选项

| 选项 | 作用 |
| --- | --- |
| \`-cp / -classpath\` | 运行时类路径 |
| \`-Xmx512m\` | 设置堆最大内存 |
| \`-Xms256m\` | 设置堆初始内存 |
| \`-D<key>=<value>\` | 设置系统属性，可用 \`System.getProperty\` 读取 |

### IDE 选择

- **IntelliJ IDEA**：社区版免费，智能补全和重构最强，Java 开发首选。
- **Eclipse**：老牌开源 IDE，企业里仍有大量用户。
- **VS Code**：搭配 \`Extension Pack for Java\` 插件，轻量灵活。
- **命令行 + 编辑器**：理解原理的最佳方式。

下方代码模拟"编译运行"链路上能读到的几个关键系统属性，并演示 \`-D\` 自定义属性的读取。`,
    code: `// ============================================================
// 第 2 章：环境搭建与工具链演示
// 演示编译运行时可读取的系统属性（含 -D 自定义属性）
// ============================================================

public class Main {
    public static void main(String[] args) {
        System.out.println("=== 类路径相关属性 ===");
        // java.class.path 即运行时 -cp 指定的类路径
        System.out.println("类路径: " + System.getProperty("java.class.path"));
        // java.library.path 即 native 库搜索路径
        System.out.println("本地库路径: " + System.getProperty("java.library.path"));

        System.out.println("\\n=== 版本与目录 ===");
        // java.version 是运行时版本，对应 java -version 输出
        System.out.println("Java 运行版本: " + System.getProperty("java.version"));
        // java.home 对应 JAVA_HOME，JRE/JDK 安装目录
        System.out.println("JAVA_HOME: " + System.getProperty("java.home"));
        // user.dir 是当前工作目录，即启动 java 命令时所在的目录
        System.out.println("用户工作目录: " + System.getProperty("user.dir"));

        System.out.println("\\n=== 自定义属性（用 -D 设置） ===");
        // 可以用 java -Dapp.env=prod Main 设置自定义属性
        // 这里读取名为 app.env 的属性，若未设置则返回默认值 "未设置"
        String env = System.getProperty("app.env", "未设置");
        System.out.println("app.env = " + env);

        System.out.println("\\n=== 模拟编译运行链路 ===");
        // 命令行：javac -encoding UTF-8 Main.java  &&  java Main
        System.out.println("源文件编码默认: " + System.getProperty("file.encoding"));
        // 文件分隔符：Windows 是 ; Unix 是 :
        System.out.println("路径分隔符: " + System.getProperty("path.separator"));
        // 文件分隔符：Windows 是 \\\\ Unix 是 /
        System.out.println("文件分隔符: " + System.getProperty("file.separator"));
    }
}`,
  },

  // =========================================================
  // 第三章：基本语法规则
  // =========================================================
  {
    id: "java-syntax-rules",
    group: "基础深入",
    icon: "📐",
    title: "基本语法规则",
    content: `## Java 基本语法规则：写代码的"交通法规"

Java 是一门**强类型、面向对象**的语言，语法规则严格但清晰。掌握这些规则是写出可编译、可维护代码的前提。

### 大小写敏感

Java **严格区分大小写**：\`name\` 和 \`Name\` 是两个完全不同的标识符。类名 \`Student\` 和变量 \`student\` 不会冲突，但若把 \`System.out.println\` 写成 \`system.out.println\` 会直接编译失败。

### 语句以分号结尾

每条语句必须以 **分号 \`;\`** 结束。一个语句可以跨多行，但分号是语句的边界。花括号 \`{}\` 后面通常不需要分号（除了数组初始化等特殊情况）。

### 代码块用花括号

方法体、类体、控制流（\`if\`/\`for\`/\`while\`）都用 \`{}\` 包围。即使块内只有一条语句，**强烈建议也写花括号**，避免后续维护时因缩进产生歧义。

### 三种注释形式

\`\`\`java
// 单行注释：到行尾

/* 多行注释：可以跨多行，
   编译器忽略 */

/** Javadoc 注释：可被 javadoc 工具提取生成 API 文档
 *  @param name 参数说明
 */
\`\`\`

### 标识符规则

标识符（给类、方法、变量起的名字）必须满足：

1. 由**字母、数字、下划线 \`_\`、美元符 \`$\`** 组成。
2. **不能以数字开头**（\`1name\` 非法）。
3. **不能是关键字**（如 \`class\`、\`int\`）。
4. 长度无限制，但应见名知意。
5. 不能含空格、运算符等特殊字符。

### Java 关键字（部分）

\`abstract\` \`boolean\` \`break\` \`byte\` \`case\` \`catch\` \`char\` \`class\` \`const\`（保留）\`continue\` \`default\` \`do\` \`double\` \`else\` \`enum\` \`extends\` \`final\` \`finally\` \`float\` \`for\` \`goto\`（保留）\`if\` \`implements\` \`import\` \`instanceof\` \`int\` \`interface\` \`long\` \`native\` \`new\` \`package\` \`private\` \`protected\` \`public\` \`return\` \`short\` \`static\` \`strictfp\` \`super\` \`switch\` \`synchronized\` \`this\` \`throw\` \`throws\` \`transient\` \`try\` \`void\` \`volatile\` \`while\`。

注意 \`true\` / \`false\` / \`null\` 是**字面量**，不是关键字，但同样不能用作标识符。\`const\` 和 \`goto\` 是保留字，Java 没有使用它们但禁止用作标识符。

### 命名规范（社区约定，非语法强制）

- **类名/接口名**：大驼峰，如 \`StudentManager\`。
- **方法名/变量名**：小驼峰，如 \`getUserName\`、\`userName\`。
- **常量**：全大写下划线，如 \`MAX_SIZE\`、\`PI\`。
- **包名**：全小写，域名反写，如 \`com.company.project\`。

下方代码演示这些语法规则的实际应用。`,
    code: `// ============================================================
// 第 3 章：基本语法规则演示
// ============================================================

// 这是一个单文件中的辅助类：非 public，可与 Main 共存
class Helper {
    // 静态方法：演示方法命名（小驼峰）
    public static int add(int a, int b) {
        return a + b;
    }
}

public class Main {
    // 常量命名：全大写 + 下划线
    public static final int MAX_SIZE = 100;

    public static void main(String[] args) {
        // 1. 大小写敏感演示
        String name = "张三";
        String Name = "李四"; // 与 name 是两个不同变量
        System.out.println("name = " + name + ", Name = " + Name);

        // 2. 语句以分号结尾（可以跨行写，编译器只认分号）
        int sum = 1 + 2 + 3 +
                  4 + 5;
        System.out.println("跨行求和 = " + sum);

        // 3. 代码块用花括号（即使一行也建议写）
        if (sum > 10) {
            System.out.println("sum 大于 10");
        }

        // 4. 标识符规则：可含 $ 和 _
        int _count = 5;
        int $value = 10;
        int totalCount = _count + $value;
        System.out.println("totalCount = " + totalCount);

        // 5. 调用辅助类方法
        int result = Helper.add(3, 4);
        System.out.println("Helper.add(3,4) = " + result);

        // 6. 常量使用
        System.out.println("MAX_SIZE = " + MAX_SIZE);

        // 7. 多行注释示例
        /*
         * 这是一个多行注释块
         * 用于解释下面这段循环的逻辑
         */
        for (int i = 0; i < 3; i++) {
            System.out.println("循环第 " + (i + 1) + " 次");
        }
    }
}`,
  },

  // =========================================================
  // 第四章：8 种基本类型详解
  // =========================================================
  {
    id: "java-primitive-types",
    group: "基础深入",
    icon: "🔢",
    title: "8 种基本类型详解",
    content: `## Java 的 8 种基本类型

Java 是强类型语言，**基本类型（primitive types）** 是最底层、最高效的数据类型，直接存放在栈内存中（局部变量）或对象内部。Java 共有 **8 种基本类型**，分为四大类：整型、浮点型、字符型、布尔型。

### 整型（4 种）

| 类型 | 位数 | 字节 | 取值范围 | 默认值 |
| --- | --- | --- | --- | --- |
| \`byte\` | 8 | 1 | -128 ~ 127 | 0 |
| \`short\` | 16 | 2 | -32768 ~ 32767 | 0 |
| \`int\` | 32 | 4 | -2³¹ ~ 2³¹-1（约 ±21 亿） | 0 |
| \`long\` | 64 | 8 | -2⁶³ ~ 2⁶³-1（约 ±9.2×10¹⁸） | 0L |

整数字面量默认是 \`int\`，写 \`long\` 字面量要加 \`L\` 后缀（如 \`100L\`），否则大数会编译错误。

### 浮点型（2 种）

| 类型 | 位数 | 字节 | 精度 | 默认值 |
| --- | --- | --- | --- | --- |
| \`float\` | 32 | 4 | 单精度，约 6-7 位有效数字 | 0.0f |
| \`double\` | 64 | 8 | 双精度，约 15 位有效数字 | 0.0d |

浮点字面量默认是 \`double\`，写 \`float\` 要加 \`F\` 后缀。**浮点数不能精确表示某些十进制小数**（如 0.1），金融计算请用 \`BigDecimal\`。

### 字符型 char

\`char\` 是 **16 位无符号整数**（0 ~ 65535），存储一个 **UTF-16 编码单元**。它本质上是个整数，可以参与运算：\`char c = 'A'; int n = c;\` 得到 65。字符字面量用单引号：\`'A'\`、\`'中'\`、\`'\\\\n'\`。

### 布尔型 boolean

\`boolean\` 只有 \`true\` / \`false\` 两个值，默认 \`false\`。注意 Java 中**布尔不能与整数互转**（不像 C/C++ 把非零当 true），\`if (1)\` 是非法的。

### 选择建议

- 整数**默认用 \`int\`**，只有超过 21 亿才用 \`long\`；\`byte\`/\`short\` 主要用于节约内存（如大数组、IO 缓冲区）。
- 浮点**默认用 \`double\`**，\`float\` 仅在对内存/存储敏感时用。
- 涉及金钱、精度要求高的场景，**不要用浮点**，用 \`BigDecimal\`。

### 整数溢出

\`int\` 最大值加 1 会"绕回"到最小值，不会报错——这是**二进制补码溢出**的特性：

\`\`\`java
int max = Integer.MAX_VALUE; // 2147483647
int overflow = max + 1;       // -2147483648  静默溢出！
\`\`\`

下方代码演示各类型范围、默认值与溢出现象。`,
    code: `// ============================================================
// 第 4 章：8 种基本类型演示
// ============================================================

public class Main {
    // 成员变量会使用默认值（局部变量不会，必须先赋值）
    static byte defaultByte;
    static int defaultInt;
    static long defaultLong;
    static double defaultDouble;
    static boolean defaultBoolean;
    static char defaultChar;

    public static void main(String[] args) {
        System.out.println("=== 各类型取值范围 ===");
        System.out.println("byte:  " + Byte.MIN_VALUE + " ~ " + Byte.MAX_VALUE);
        System.out.println("short: " + Short.MIN_VALUE + " ~ " + Short.MAX_VALUE);
        System.out.println("int:   " + Integer.MIN_VALUE + " ~ " + Integer.MAX_VALUE);
        System.out.println("long:  " + Long.MIN_VALUE + " ~ " + Long.MAX_VALUE);
        System.out.println("float: " + Float.MIN_VALUE + " ~ " + Float.MAX_VALUE);
        System.out.println("double:" + Double.MIN_VALUE + " ~ " + Double.MAX_VALUE);
        System.out.println("char:  " + (int) Character.MIN_VALUE + " ~ " + (int) Character.MAX_VALUE);

        System.out.println("\\n=== 默认值（成员变量） ===");
        System.out.println("byte 默认值: " + defaultByte);
        System.out.println("int 默认值: " + defaultInt);
        System.out.println("long 默认值: " + defaultLong);
        System.out.println("double 默认值: " + defaultDouble);
        System.out.println("boolean 默认值: " + defaultBoolean);
        System.out.println("char 默认值(码点): " + (int) defaultChar); // 0 即空字符

        System.out.println("\\n=== 各类型赋值 ===");
        byte b = 100;                  // byte 范围内
        short s = 32000;
        int i = 2000000000;
        long l = 9000000000000L;       // long 字面量必须加 L
        float f = 3.14f;               // float 字面量必须加 F
        double d = 3.141592653589793;  // double 默认
        char c = 'A';
        boolean flag = true;
        System.out.printf("byte=%d short=%d int=%d%n", b, s, i);
        System.out.printf("long=%d float=%f double=%f%n", l, f, d);
        System.out.printf("char=%c(码点=%d) boolean=%b%n", c, (int) c, flag);

        System.out.println("\\n=== 整数溢出演示 ===");
        int max = Integer.MAX_VALUE;
        System.out.println("int 最大值: " + max);
        System.out.println("max + 1 = " + (max + 1) + "  (溢出，变成最小值)");
        // long 可以容纳更大的数，避免溢出
        long safe = (long) max + 1;
        System.out.println("用 long 安全计算: " + safe);

        System.out.println("\\n=== 字节数（位宽） ===");
        System.out.println("byte 占 " + Byte.SIZE + " 位");
        System.out.println("int 占 " + Integer.SIZE + " 位");
        System.out.println("double 占 " + Double.SIZE + " 位");
    }
}`,
  },

  // =========================================================
  // 第五章：类型转换
  // =========================================================
  {
    id: "java-type-casting",
    group: "基础深入",
    icon: "🔄",
    title: "类型转换",
    content: `## 类型转换：自动提升与强制转型

Java 是强类型语言，不同类型之间不能随意赋值。当类型不一致时，需要**类型转换**。类型转换分两种方向：** widening**（拓宽/自动转换）和 **narrowing**（收窄/强制转换）。

### 自动类型转换（ widening，隐式）

把**小范围**类型赋给**大范围**类型时，JVM 自动提升，无需任何语法：

\`\`\`java
int i = 100;
long l = i;        // int -> long，自动
double d = l;      // long -> double，自动
\`\`\`

基本类型的"拓宽"路径（从左到右自动转换）：

- \`byte\` → \`short\` → \`int\` → \`long\` → \`float\` → \`double\`
- \`char\` → \`int\`（字符参与运算时自动提升为 int）

注意 \`float\` 虽然只有 32 位，但能容纳的数值范围比 64 位 \`long\` 还大（指数表示法），所以 \`long → float\` 属于 widening，但会**丢失精度**。

### 强制类型转换（ narrowing，显式）

把**大范围**赋给**小范围**时，必须显式写 \`(目标类型)\` 强转，否则编译报错：

\`\`\`java
double d = 3.99;
int i = (int) d;   // 强转，i = 3（直接截断小数部分）
long l = 100000L;
int j = (int) l;   // 若 l 超出 int 范围，结果不可预期
\`\`\`

### 精度丢失

强转可能丢精度，分两种情况：

1. **浮点 → 整型**：直接**截断**小数部分（不是四舍五入），\`3.99 → 3\`。
2. **大整数 → 小整数**：取**低位字节**，高位丢弃，可能得到完全错误的值。

### 表达式中的自动提升

在算术表达式中，操作数会先提升到 \`int\` 再计算，这是新手常踩的坑：

\`\`\`java
byte a = 1, b = 2;
byte c = a + b;        // 编译错误！a + b 结果是 int
byte c = (byte)(a + b); // 必须强转
\`\`\`

### 常见陷阱

- \`int / int\` 结果是 \`int\`：\`5 / 2 = 2\`，不是 2.5。要得到小数，至少一个操作数是浮点：\`5 / 2.0 = 2.5\`。
- \`byte\`/\`short\`/\`char\` 参与运算**先提升为 int**。
- \`char\` 与数字运算得到 \`int\`，要赋回 \`char\` 需强转。
- 复合赋值 \`+=\` 内含隐式强转：\`b += 1;\` 等价于 \`b = (byte)(b + 1);\`。

下方代码演示自动转换、强制转换、精度丢失和表达式提升。`,
    code: `// ============================================================
// 第 5 章：类型转换演示
// ============================================================

public class Main {
    public static void main(String[] args) {
        System.out.println("=== 1. 自动类型转换（widening） ===");
        byte b = 10;
        short s = b;          // byte -> short
        int i = s;            // short -> int
        long l = i;           // int -> long
        float f = l;          // long -> float（可能丢精度）
        double d = f;         // float -> double
        System.out.printf("byte=%d -> short=%d -> int=%d%n", b, s, i);
        System.out.printf("long=%d -> float=%f -> double=%f%n", l, f, d);

        System.out.println("\\n=== 2. 强制类型转换（narrowing） ===");
        double pi = 3.14159265;
        int intPart = (int) pi;     // 强转：截断小数
        System.out.println("double " + pi + " -> int " + intPart);

        long bigLong = 100000L;
        int fromLong = (int) bigLong; // long -> int
        System.out.println("long " + bigLong + " -> int " + fromLong);

        System.out.println("\\n=== 3. 精度丢失演示 ===");
        // long -> float 可能丢精度（float 有效位数约 7 位）
        long preciseLong = 123456789L;
        float fromLong2 = preciseLong;       // 自动转换
        long back = (long) fromLong2;        // 转回来
        System.out.println("原 long: " + preciseLong);
        System.out.println("经 float 转换后: " + back + "  (精度丢失)");

        System.out.println("\\n=== 4. 表达式中的自动提升 ===");
        byte x = 1, y = 2;
        // byte z = x + y;  // 编译错误：x + y 提升为 int
        byte z = (byte) (x + y);   // 必须强转
        System.out.println("byte x + y = " + z);

        // char 参与运算提升为 int
        char ch = 'A';
        int code = ch + 1;        // 'A'(65) + 1 = 66
        char next = (char) (ch + 1); // 强转回 char
        System.out.println("'A' + 1 = int " + code + "，转 char = " + next);

        System.out.println("\\n=== 5. 整数除法陷阱 ===");
        int a = 5, c = 2;
        System.out.println("5 / 2 = " + (a / c) + "  (整数除法，结果是 int)");
        System.out.println("5 / 2.0 = " + (a / 2.0) + "  (有一个是浮点，结果是 double)");
        System.out.println("(double)5 / 2 = " + (double) a / c);

        System.out.println("\\n=== 6. 复合赋值的隐式强转 ===");
        byte m = 100;
        m += 50;   // 等价于 m = (byte)(m + 50)，会溢出
        System.out.println("100 += 50 后 byte = " + m + "  (溢出绕回)");
    }
}`,
  },

  // =========================================================
  // 第六章：包装类
  // =========================================================
  {
    id: "java-wrapper-classes",
    group: "基础深入",
    icon: "📦",
    title: "包装类",
    content: `## 包装类：让基本类型"对象化"

Java 是面向对象语言，但基本类型（\`int\`/\`double\` 等）不是对象，无法参与泛型、无法放进集合（\`List<int>\` 非法）。为此 Java 为每个基本类型提供了对应的**包装类（Wrapper Class）**，把基本值"包装"成对象。

### 基本类型与包装类对照

| 基本类型 | 包装类 | 所在包 |
| --- | --- | --- |
| \`byte\` | \`Byte\` | java.lang |
| \`short\` | \`Short\` | java.lang |
| \`int\` | \`Integer\` | java.lang |
| \`long\` | \`Long\` | java.lang |
| \`float\` | \`Float\` | java.lang |
| \`double\` | \`Double\` | java.lang |
| \`char\` | \`Character\` | java.lang |
| \`boolean\` | \`Boolean\` | java.lang |

注意 \`int\` 对应 \`Integer\`、\`char\` 对应 \`Character\`，其余都是首字母大写。

### 基本类型与包装类互转

\`\`\`java
// 装箱：基本 -> 包装
Integer a = Integer.valueOf(100);   // 推荐方式
Integer b = 100;                    // 自动装箱（语法糖）

// 拆箱：包装 -> 基本
int x = a.intValue();               // 显式拆箱
int y = a;                          // 自动拆箱
\`\`\`

### 常用方法

| 方法 | 作用 | 示例 |
| --- | --- | --- |
| \`parseInt(String)\` | 字符串转基本类型 | \`Integer.parseInt("123")\` |
| \`valueOf(String)\` | 字符串转包装类 | \`Integer.valueOf("123")\` |
| \`toString()\` | 转字符串 | \`Integer.toString(123)\` |
| \`toXxxString()\` | 转进制字符串 | \`Integer.toBinaryString(10)\` |
| \`MAX_VALUE / MIN_VALUE\` | 极值常量 | \`Integer.MAX_VALUE\` |

### IntegerCache 缓存池

为了节省内存，\`Integer\` 在加载时预先创建了 **-128 ~ 127** 范围内的对象缓存。当用 \`Integer.valueOf\` 或自动装箱得到这个范围内的值时，**返回的是同一个缓存对象**，因此 \`==\` 比较为 \`true\`；超出这个范围则会 \`new\` 新对象，\`==\` 为 \`false\`。

\`\`\`java
Integer a = 100, b = 100;   // 命中缓存，a == b 为 true
Integer c = 200, d = 200;   // 超出缓存，c == d 为 false
\`\`\`

**这是新手最容易踩的坑**：比较两个 \`Integer\` 永远用 \`equals\`，不要用 \`==\`。\`Byte\`、\`Short\`、\`Long\`、\`Character\` 也有类似缓存（Byte 全缓存，Short/Long -128~127）。

下方代码演示包装类的转换、常用方法和缓存池现象。`,
    code: `// ============================================================
// 第 6 章：包装类演示
// ============================================================

public class Main {
    public static void main(String[] args) {
        System.out.println("=== 1. 装箱与拆箱 ===");
        // 装箱：基本类型 -> 包装类
        Integer a = Integer.valueOf(100);   // 显式装箱
        Integer b = 100;                    // 自动装箱（编译为 valueOf）
        System.out.println("a = " + a + ", b = " + b);
        // 拆箱：包装类 -> 基本类型
        int x = a.intValue();               // 显式拆箱
        int y = b;                          // 自动拆箱（编译为 intValue）
        System.out.println("x = " + x + ", y = " + y);

        System.out.println("\\n=== 2. 字符串与数字互转 ===");
        // 字符串 -> 数字（最常用）
        int parsed = Integer.parseInt("42");
        double dParsed = Double.parseDouble("3.14");
        boolean bParsed = Boolean.parseBoolean("true");
        System.out.println("parseInt: " + parsed);
        System.out.println("parseDouble: " + dParsed);
        System.out.println("parseBoolean: " + bParsed);

        // 数字 -> 字符串
        String s1 = Integer.toString(255);
        String s2 = String.valueOf(3.14);
        String s3 = 100 + "";   // 简便写法（拼接空串）
        System.out.println("toString: " + s1 + ", " + s2 + ", " + s3);

        System.out.println("\\n=== 3. 进制转换 ===");
        int num = 255;
        System.out.println("十进制: " + num);
        System.out.println("二进制: " + Integer.toBinaryString(num));
        System.out.println("八进制: " + Integer.toOctalString(num));
        System.out.println("十六进制: " + Integer.toHexString(num));
        // 字符串按指定进制解析
        System.out.println("解析 \\"ff\\" 为 16 进制: " + Integer.parseInt("ff", 16));

        System.out.println("\\n=== 4. IntegerCache 缓存池 ===");
        Integer in1 = 100;   // -128~127 命中缓存
        Integer in2 = 100;
        System.out.println("100 == 100: " + (in1 == in2) + "  (命中缓存，同一对象)");

        Integer out1 = 200;  // 超出缓存范围，new 新对象
        Integer out2 = 200;
        System.out.println("200 == 200: " + (out1 == out2) + "  (超出缓存，不同对象)");
        System.out.println("200 equals 200: " + out1.equals(out2) + "  (用 equals 比较)");

        System.out.println("\\n=== 5. 各包装类的常量 ===");
        System.out.println("Integer 范围: " + Integer.MIN_VALUE + " ~ " + Integer.MAX_VALUE);
        System.out.println("Double 范围: " + Double.MIN_VALUE + " ~ " + Double.MAX_VALUE);
        System.out.println("Character 范围: " + (int) Character.MIN_VALUE + " ~ " + (int) Character.MAX_VALUE);
    }
}`,
  },

  // =========================================================
  // 第七章：自动装箱拆箱
  // =========================================================
  {
    id: "java-autoboxing",
    group: "基础深入",
    icon: "🎁",
    title: "自动装箱拆箱",
    content: `## 自动装箱与拆箱：语法糖背后的陷阱

**自动装箱（autoboxing）** 和 **自动拆箱（unboxing）** 是 Java 5 引入的语法糖，让你在基本类型和包装类之间**无缝切换**，无需手写 \`valueOf\` / \`xxxValue\`。

### 自动装箱机制

把基本类型赋给包装类引用时，编译器自动插入 \`valueOf\` 调用：

\`\`\`java
Integer a = 10;          // 等价于 Integer a = Integer.valueOf(10);
List<Integer> list = new ArrayList<>();
list.add(5);             // 等价于 list.add(Integer.valueOf(5));
\`\`\`

### 自动拆箱机制

把包装类赋给基本类型、或参与算术运算时，编译器自动插入 \`xxxValue\` 调用：

\`\`\`java
Integer a = 10;
int b = a;               // 等价于 int b = a.intValue();
int sum = a + 20;        // 先拆箱 a.intValue() + 20
\`\`\`

### 性能影响

自动装箱/拆箱在**循环**中会显著拖慢性能，因为每次都创建新对象：

\`\`\`java
// 反例：循环中频繁装箱
Integer sum = 0;
for (int i = 0; i < 1000000; i++) {
    sum += i;   // 每次都拆箱再装箱，产生大量临时对象
}

// 正解：用基本类型
int sum2 = 0;
for (int i = 0; i < 1000000; i++) {
    sum2 += i;
}
\`\`\`

### NullPointerException 陷阱

包装类是对象，可以是 \`null\`。当 \`null\` 的包装类被**自动拆箱**时，会抛出 \`NullPointerException\`：

\`\`\`java
Integer a = null;
int b = a;   // 运行时 NPE！相当于 a.intValue()，而 a 是 null
\`\`\`

这是企业代码中最常见的 NPE 来源之一。**从 Map、数据库、JSON 反序列化拿到的 Integer/Double 务必判空**。

### == vs equals

由于缓存池的存在，\`Integer\` 的 \`==\` 行为不确定（-128~127 内为 true，范围外为 false）。**包装类比较永远用 \`equals\`**：

\`\`\`java
Integer a = 127, b = 127;
a == b;          // true（命中缓存）
Integer c = 128, d = 128;
c == d;          // false（超出缓存）
c.equals(d);     // true（值比较）
\`\`\`

下方代码演示自动装箱拆箱的过程、性能差异和常见陷阱。`,
    code: `// ============================================================
// 第 7 章：自动装箱拆箱演示
// ============================================================

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== 1. 自动装箱 ===");
        Integer a = 10;          // 自动装箱 -> Integer.valueOf(10)
        Double d = 3.14;         // 自动装箱
        Boolean flag = true;     // 自动装箱
        System.out.println("装箱结果: " + a + ", " + d + ", " + flag);

        System.out.println("\\n=== 2. 自动拆箱 ===");
        int x = a;               // 自动拆箱 -> a.intValue()
        double y = d;            // 自动拆箱
        boolean z = flag;        // 自动拆箱
        System.out.println("拆箱结果: " + x + ", " + y + ", " + z);

        // 包装类参与运算会自动拆箱
        Integer m = 100, n = 200;
        int sum = m + n;         // m.intValue() + n.intValue()
        System.out.println("m + n = " + sum);

        System.out.println("\\n=== 3. 集合中的自动装箱 ===");
        List<Integer> list = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            list.add(i);          // 自动装箱：int -> Integer
        }
        int total = 0;
        for (Integer num : list) {
            total += num;         // 自动拆箱：Integer -> int
        }
        System.out.println("集合求和: " + total);

        System.out.println("\\n=== 4. 性能对比 ===");
        // 反例：循环中频繁装箱
        long start1 = System.nanoTime();
        Integer badSum = 0;
        for (int i = 0; i < 100000; i++) {
            badSum += i;          // 每次拆箱再装箱，产生大量临时对象
        }
        long time1 = System.nanoTime() - start1;

        // 正解：用基本类型
        long start2 = System.nanoTime();
        int goodSum = 0;
        for (int i = 0; i < 100000; i++) {
            goodSum += i;
        }
        long time2 = System.nanoTime() - start2;

        System.out.println("装箱循环耗时 (ns): " + time1);
        System.out.println("基本类型循环耗时 (ns): " + time2);
        System.out.println("结果相同: " + (badSum.equals(goodSum)));

        System.out.println("\\n=== 5. NPE 陷阱 ===");
        Map<String, Integer> map = new HashMap<>();
        // map 中没有 "missing" 键，get 返回 null
        Integer value = map.get("missing");
        System.out.println("get 返回: " + value);
        // 危险！若直接拆箱会 NPE
        if (value != null) {
            int v = value;        // 安全：先判空
            System.out.println("安全取值: " + v);
        } else {
            System.out.println("值为 null，跳过拆箱，避免 NPE");
        }

        System.out.println("\\n=== 6. == vs equals ===");
        Integer p = 127, q = 127;
        System.out.println("127 == 127: " + (p == q) + "  (命中缓存)");
        Integer r = 128, s = 128;
        System.out.println("128 == 128: " + (r == s) + "  (超出缓存)");
        System.out.println("128 equals 128: " + r.equals(s) + "  (始终用 equals)");
    }
}`,
  },

  // =========================================================
  // 第八章：var 关键字
  // =========================================================
  {
    id: "java-var-keyword",
    group: "基础深入",
    icon: "🏷️",
    title: "var 关键字",
    content: `## var 关键字：局部变量类型推断

**\`var\`** 是 Java 10 引入的关键字（严格说是"保留类型名"），用于**局部变量的类型推断**。它让编译器根据右侧表达式自动推断变量类型，减少样板代码，但 Java 仍是**静态类型**——类型在编译期就确定了，只是写法上省略了。

### 基本用法

\`\`\`java
// 之前
ArrayList<String> list = new ArrayList<String>();
Map<String, List<Integer>> map = new HashMap<>();

// 用 var 后
var list = new ArrayList<String>();           // 推断为 ArrayList<String>
var map = new HashMap<String, List<Integer>>(); // 推断为 HashMap<...>
var name = "Java";                              // 推断为 String
var count = 100;                                // 推断为 int（不是 Integer！）
\`\`\`

### var 的使用场景

- **右侧有明确类型时**，如 \`new\` 表达式、字面量、方法返回值明确的方法。
- **泛型嵌套很长的类型**，如 \`Map<String, List<Record>>\`，用 \`var\` 大幅简化。
- **for-each / for 循环**中的循环变量：\`for (var item : list)\`。
- **try-with-resources** 中的资源声明。

### var 的限制

\`var\` **只能用于局部变量**，有以下严格限制：

1. **不能用于字段（成员变量）**：\`private var x = 1;\` 非法。
2. **不能用于方法参数**：\`void foo(var x)\` 非法。
3. **不能用于方法返回值**：\`var foo()\` 非法。
4. **不能用于 catch 的异常变量**。
5. **声明时必须初始化**：\`var x;\` 非法（无法推断）。
6. **不能初始化为 null**：\`var x = null;\` 非法（null 无类型）。
7. **不能用于数组初始化语法**：\`var arr = {1,2,3};\` 非法（要用 \`new int[]{...}\`）。

### 可读性讨论

\`var\` 是双刃剑。合理使用能减少噪音（如冗长的泛型），但**滥用会损害可读性**——尤其是右侧是方法调用时，读者无法一眼看出类型：

\`\`\`java
var result = process(data);   // result 是什么类型？看不出来！
String result = process(data); // 显式声明更清晰
\`\`\`

社区建议：当类型**显而易见**（如 \`new\` 表达式、字面量）时用 \`var\`；当类型**需要思考才能知道**时（如方法返回值）保留显式类型。

下方代码演示 \`var\` 的正确用法、限制场景和可读性对比。`,
    code: `// ============================================================
// 第 8 章：var 关键字演示
// ============================================================

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Main {
    // 注意：var 不能用于成员字段，下面这行会编译错误：
    // private var field = 10;

    public static void main(String[] args) {
        System.out.println("=== 1. var 基本用法 ===");
        var name = "Java";            // 推断为 String
        var count = 100;              // 推断为 int（基本类型，非 Integer）
        var pi = 3.14;                // 推断为 double
        var flag = true;              // 推断为 boolean
        System.out.printf("name=%s count=%d pi=%f flag=%b%n", name, count, pi, flag);

        System.out.println("\\n=== 2. var 简化泛型声明 ===");
        // 没用 var：类型又长又重复
        Map<String, List<Integer>> oldMap = new HashMap<String, List<Integer>>();
        // 用 var：清爽
        var newMap = new HashMap<String, List<Integer>>();
        var list = new ArrayList<String>();
        list.add("hello");
        newMap.put("key", new ArrayList<>(List.of(1, 2, 3)));
        System.out.println("var Map: " + newMap);

        System.out.println("\\n=== 3. var 在 for-each 中 ===");
        var names = List.of("张三", "李四", "王五");
        for (var n : names) {         // var 推断为 String
            System.out.println("名字: " + n);
        }
        // 普通 for 循环
        for (var i = 0; i < 3; i++) { // var 推断为 int
            System.out.println("循环 i = " + i);
        }

        System.out.println("\\n=== 4. var 推断的类型 ===");
        var s = "abc";
        var i = 42;
        var arr = new int[]{1, 2, 3};
        System.out.println("s 的类型: " + s.getClass().getName());
        // 基本类型没有 getClass，用包装类获取
        System.out.println("i 是基本类型 int");
        System.out.println("arr 的类型: " + arr.getClass().getName());

        System.out.println("\\n=== 5. var 的限制示例（注释掉的都是非法的） ===");
        // var x;                       // 错：必须初始化
        // var y = null;                // 错：null 无类型
        // var z = {1, 2, 3};           // 错：数组初始化语法
        var z = new int[]{1, 2, 3};     // 对：用 new 显式
        System.out.println("数组长度: " + z.length);

        System.out.println("\\n=== 6. try-with-resources 中用 var ===");
        // 资源变量也可以用 var
        try (var reader = new java.io.StringReader("Hello var")) {
            int ch = reader.read();
            System.out.println("读取字符: " + (char) ch);
        } catch (java.io.IOException e) {
            System.out.println("IO 异常: " + e.getMessage());
        }
    }
}`,
  },

  // =========================================================
  // 第九章：常量与 final
  // =========================================================
  {
    id: "java-constants",
    group: "基础深入",
    icon: "🔒",
    title: "常量与 final",
    content: `## final 关键字：不可变的承诺

\`final\` 是 Java 中表示"最终、不可变"的关键字，可以修饰**变量、方法和类**三种对象，含义各不相同，但核心都是"一旦确定就不能再改"。

### final 变量

被 \`final\` 修饰的变量**只能赋值一次**，赋值后不可再改：

\`\`\`java
final int MAX = 100;
MAX = 200;   // 编译错误！

final double PI;
PI = 3.14;   // 允许：声明时未赋，可稍后赋一次
PI = 3.1415; // 错误：已赋过值
\`\`\`

**重要区分**：\`final\` 修饰**引用类型**时，锁定的是"引用"本身，而不是对象内容。即引用不能再指向别的对象，但对象内部仍可修改：

\`\`\`java
final List<String> list = new ArrayList<>();
list.add("a");          // 允许：修改对象内容
list = new ArrayList<>(); // 错误：引用不能改
\`\`\`

### final 方法

\`final\` 方法**不能被子类重写**（override），常用于保护核心逻辑不被篡改，也有助于内联优化：

\`\`\`java
class Parent {
    public final void coreLogic() { /* ... */ }
}
class Child extends Parent {
    public void coreLogic() { } // 编译错误：不能重写 final 方法
}
\`\`\`

### final 类

\`final\` 类**不能被继承**，如 \`String\`、\`Integer\`、\`Math\` 都是 final 类。设计为 final 通常是出于**安全性**（防止子类破坏不可变契约）和**性能**（便于优化）考虑：

\`\`\`java
public final class String { ... }   // 不能被继承
class MyString extends String { }   // 编译错误
\`\`\`

### static final 常量

\`static final\` 组合定义**类级常量**，属于类而非实例，全局唯一，命名采用**全大写 + 下划线**：

\`\`\`java
public class Math {
    public static final double PI = 3.141592653589793;
    public static final double E = 2.718281828459045;
}
\`\`\`

\`static final\` 的基本类型/String 常量在编译期会被**内联**：使用处直接替换成字面量，因此修改常量后需重新编译所有依赖方。

### final 参数

方法参数也可加 \`final\`，表示方法内不能修改该参数（主要出于设计意图表达，现代代码很少用）。

下方代码演示 final 变量、final 方法、final 类和 static final 常量的用法。`,
    code: `// ============================================================
// 第 9 章：常量与 final 演示
// ============================================================

import java.util.ArrayList;
import java.util.List;

// final 类：不能被继承
final class ImmutablePoint {
    private final int x;   // final 字段：构造后不可变
    private final int y;

    public ImmutablePoint(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public int getX() { return x; }
    public int getY() { return y; }
}

// 普通类，含 final 方法
class Animal {
    // final 方法：子类不能重写
    public final void breathe() {
        System.out.println("呼吸中...");
    }

    public void speak() {
        System.out.println("动物发声");
    }
}

class Dog extends Animal {
    @Override
    public void speak() {
        System.out.println("汪汪！");
    }
    // 不能重写 breathe()，编译会报错
}

public class Main {
    // static final 类常量：全大写 + 下划线
    public static final int MAX_RETRY = 3;
    public static final String APP_NAME = "MyApp";
    public static final double DISCOUNT = 0.85;

    public static void main(String[] args) {
        System.out.println("=== 1. static final 常量 ===");
        System.out.println("最大重试次数: " + MAX_RETRY);
        System.out.println("应用名称: " + APP_NAME);
        System.out.println("折扣: " + DISCOUNT);

        System.out.println("\\n=== 2. final 局部变量 ===");
        final int timeout = 5000;   // 只能赋值一次
        // timeout = 3000;          // 编译错误
        System.out.println("超时时间: " + timeout);

        final String config;
        config = "production";      // 声明时未赋，可稍后赋一次
        System.out.println("配置: " + config);

        System.out.println("\\n=== 3. final 修饰引用类型 ===");
        final List<String> list = new ArrayList<>();
        list.add("a");              // 允许：修改对象内容
        list.add("b");
        System.out.println("list 内容: " + list);
        // list = new ArrayList<>(); // 编译错误：引用本身不能改

        System.out.println("\\n=== 4. final 方法演示 ===");
        Dog dog = new Dog();
        dog.breathe();              // 继承自父类的 final 方法
        dog.speak();                // 子类重写的方法

        System.out.println("\\n=== 5. final 类（不可变对象） ===");
        ImmutablePoint p = new ImmutablePoint(3, 4);
        System.out.println("点坐标: (" + p.getX() + ", " + p.getY() + ")");
        // ImmutablePoint 是 final 类，无法继承
        // class SubPoint extends ImmutablePoint { }  // 编译错误

        System.out.println("\\n=== 6. JDK 中的 final 例子 ===");
        // String 是 final 类
        String s = "hello";
        System.out.println("String 是 final 类: " + (s instanceof String));
        // Math.PI 是 static final 常量
        System.out.println("Math.PI = " + Math.PI);
        System.out.println("Math.E = " + Math.E);
    }
}`,
  },

  // =========================================================
  // 第十章：注释与 Javadoc
  // =========================================================
  {
    id: "java-comments-javadoc",
    group: "基础深入",
    icon: "📖",
    title: "注释与 Javadoc",
    content: `## 注释与 Javadoc：给代码加说明，给 API 出文档

注释是写给**人**看的（编译器忽略），好的注释解释"为什么"而非"做了什么"。Java 有三种注释形式，其中 **Javadoc** 是最具特色的——它能被 \`javadoc\` 工具解析生成 HTML 格式的 API 文档。

### 三种注释形式

\`\`\`java
// 单行注释：解释一行的用途，最常用

/* 多行注释：跨多行，
   适合较长的说明 */

/** Javadoc 注释：以 /** 开头（两个星号），
 *  每个 Javadoc 注释块紧跟在一个类/方法/字段声明之前，
 *  可被 javadoc 工具提取生成 HTML 文档
 */
\`\`\`

### Javadoc 注释结构

Javadoc 以 \`/**\` 开头，以 \`*/\` 结尾，每行以 \` *\` 开头。第一段是**主描述**，空一行后是**标签段**：

\`\`\`java
/**
 * 计算两个整数的和。
 * <p>这是一个简单的加法运算，支持正负数。
 *
 * @param a 第一个加数
 * @param b 第二个加数
 * @return 两数之和
 * @throws IllegalArgumentException 如果参数为负（仅示例）
 * @since 1.0
 * @author 张三
 */
public int add(int a, int b) { ... }
\`\`\`

### 常用 Javadoc 标签

| 标签 | 作用 | 用法 |
| --- | --- | --- |
| \`@param\` | 描述方法参数 | \`@param name 参数说明\` |
| \`@return\` | 描述返回值 | \`@return 返回值说明\` |
| \`@throws\` / \`@exception\` | 描述可能抛出的异常 | \`@throws NullPointerException 当 x 为 null\` |
| \`@see\` | 引用相关内容 | \`@see #method\` / \`@see ClassName\` |
| \`@since\` | 标记从哪个版本开始有 | \`@since 1.5\` |
| \`@author\` | 作者 | \`@author 张三\` |
| \`@version\` | 版本 | \`@version 1.0\` |
| \`@deprecated\` | 标记已过时 | \`@deprecated 请用 {@link #newMethod}\` |
| \`{@link}\` | 内联链接 | \`{@link ClassName#method}\` |
| \`{@code}\` | 内联代码（等宽，不解析 HTML） | \`{@code List<String>}\` |

### 生成 API 文档

用 \`javadoc\` 命令把源码中的 Javadoc 注释提取成 HTML 文档：

\`\`\`bash
javadoc -d docs -encoding UTF-8 -charset UTF-8 Main.java
\`\`\`

\`-d docs\` 指定输出目录，\`-encoding\` 指定源码编码。生成后打开 \`docs/index.html\` 即可浏览，类似官方 API 文档的样式。

### Javadoc 的 HTML 支持

Javadoc 内容支持 HTML 标签，如 \`<p>\`（段落）、\`<b>\`（加粗）、\`<code>\`（代码）、\`<ul><li>\`（列表）。但更推荐用 \`{@code ...}\` 包裹代码，避免 \`<\`/\`>\` 被当成 HTML 解析。

下方代码展示一个带完整 Javadoc 注释的示例类。`,
    code: `// ============================================================
// 第 10 章：注释与 Javadoc 演示
// 本文件展示了完整的 Javadoc 注释写法
// 用 javadoc -d docs -encoding UTF-8 Main.java 可生成 API 文档
// ============================================================

/**
 * 计算器工具类。
 * <p>提供基本的四则运算方法，所有方法均为静态方法。
 *
 * @author 张三
 * @version 1.0
 * @since 1.0
 */
class Calculator {

    /** 圆周率常量。 */
    public static final double PI = 3.141592653589793;

    /**
     * 计算两个整数的和。
     *
     * @param a 第一个加数
     * @param b 第二个加数
     * @return 两数之和 {@code a + b}
     */
    public static int add(int a, int b) {
        return a + b;
    }

    /**
     * 计算两个整数的商。
     *
     * @param dividend 被除数
     * @param divisor  除数
     * @return 商
     * @throws ArithmeticException 当除数为 0 时抛出
     * @see #add(int, int)
     */
    public static int divide(int dividend, int divisor) {
        if (divisor == 0) {
            throw new ArithmeticException("除数不能为 0");
        }
        return dividend / divisor;
    }

    /**
     * 计算圆的面积。
     * <p>公式：{@code PI * radius * radius}
     *
     * @param radius 圆的半径，必须为非负数
     * @return 圆的面积
     * @throws IllegalArgumentException 当半径为负数时
     */
    public static double circleArea(double radius) {
        if (radius < 0) {
            throw new IllegalArgumentException("半径不能为负: " + radius);
        }
        return PI * radius * radius;
    }
}

public class Main {
    /**
     * 程序入口。
     *
     * @param args 命令行参数（本例未使用）
     */
    public static void main(String[] args) {
        // 单行注释：演示各方法
        System.out.println("=== Javadoc 示例方法调用 ===");

        /* 多行注释：
           下面分别测试加法、除法和圆面积 */
        System.out.println("add(10, 20) = " + Calculator.add(10, 20));
        System.out.println("divide(100, 4) = " + Calculator.divide(100, 4));
        System.out.printf("circleArea(2.0) = %.4f%n", Calculator.circleArea(2.0));
        System.out.println("PI = " + Calculator.PI);

        // 异常演示
        try {
            Calculator.divide(10, 0);
        } catch (ArithmeticException e) {
            System.out.println("捕获异常: " + e.getMessage());
        }
    }
}`,
  },

  // =========================================================
  // 第十一章：标识符与命名规范
  // =========================================================
  {
    id: "java-identifiers",
    group: "基础深入",
    icon: "✏️",
    title: "标识符与命名规范",
    content: `## 标识符与命名规范：让代码自带"说明书"

**标识符（identifier）** 是给 Java 中各种元素（类、方法、变量、包等）起的名字。好的命名能让代码**自解释**，差的命名会让接手者骂娘。Java 对标识符有硬性语法规则，社区还有一套被广泛遵守的命名约定。

### 标识符的语法规则（硬性）

1. 只能由 **字母、数字、下划线 \`_\`、美元符 \`$\`** 组成。
2. **不能以数字开头**（\`2name\` 非法，\`name2\` 合法）。
3. **不能是关键字或保留字**（如 \`class\`、\`int\`、\`goto\`）。
4. **不能是字面量** \`true\` / \`false\` / \`null\`。
5. 长度无上限，但应避免过长。
6. 区分大小写。

注意"字母"不只是 a-z，还包括 Unicode 字母（如中文），所以 \`int 年龄 = 18;\` 在语法上是合法的（但**强烈不推荐**用中文命名）。

### Java 关键字与保留字

关键字是被 Java 语言保留、有特殊含义的单词（如 \`class\`、\`public\`、\`static\`、\`void\`、\`if\`、\`for\` 等，共约 50 个）。保留字 \`goto\`、\`const\` 虽未被使用，但也不能用作标识符。

### 驼峰命名法

Java 社区几乎统一采用**驼峰命名法**，分两种：

- **大驼峰（PascalCase）**：每个单词首字母大写，用于**类名、接口名、枚举名、注解名**。如 \`StudentManager\`、\`Runnable\`。
- **小驼峰（camelCase）**：第一个单词首字母小写，其余首字母大写，用于**方法名、变量名**。如 \`getUserName\`、\`userName\`。

### 常量命名

常量（\`static final\`）用**全大写 + 下划线分隔**（SCREAMING_SNAKE_CASE）：

\`\`\`java
public static final int MAX_CONNECTIONS = 100;
public static final String DEFAULT_CHARSET = "UTF-8";
\`\`\`

### 包命名

包名**全小写**，不使用下划线，通常用**域名反写**开头，避免冲突：

\`\`\`java
package com.company.project.module;
\`\`\`

### 命名最佳实践

- **见名知意**：\`userName\` 远好于 \`un\`、\`x1\`。
- **避免单字母**：循环计数器 \`i\`/\`j\`/\`k\` 例外。
- **布尔变量用 is/has/can 开头**：\`isValid\`、\`hasPermission\`。
- **方法名用动词**：\`getName\`、\`calculateTotal\`、\`printReport\`。
- **避免否定**：\`isEnabled\` 好于 \`isNotDisabled\`。
- **集合用复数**：\`users\`、\`orders\`，而非 \`userList\`（除非强调类型）。

下方代码演示各种命名规范的实际应用。`,
    code: `// ============================================================
// 第 11 章：标识符与命名规范演示
// ============================================================

// 包命名：全小写，域名反写（演示用，实际需放目录结构中）
// package com.example.demo;

/**
 * 用户管理类：演示大驼峰类名
 */
class UserManager {
    // 常量：全大写 + 下划线
    public static final int MAX_USERS = 1000;
    public static final String DEFAULT_ROLE = "guest";

    // 成员变量：小驼峰
    private int currentUserCount;

    // 方法名：动词 + 小驼峰
    public void addUser(String userName) {  // 参数：小驼峰
        if (currentUserCount < MAX_USERS) {
            currentUserCount++;
            System.out.println("添加用户: " + userName);
        }
    }

    // 布尔方法用 is/has 开头
    public boolean isFull() {
        return currentUserCount >= MAX_USERS;
    }

    public int getCurrentUserCount() {
        return currentUserCount;
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("=== 1. 合法标识符演示 ===");
        // 合法：字母、数字、下划线、$
        int userName = 1;
        int user_name = 2;     // 合法但不推荐（Java 不流行下划线）
        int $count = 3;        // 合法但不推荐
        int 总数 = 4;          // 合法（Unicode）但不推荐中文
        System.out.printf("userName=%d user_name=%d $count=%d 总数=%d%n",
                userName, user_name, $count, 总数);

        System.out.println("\\n=== 2. 命名规范演示 ===");
        UserManager manager = new UserManager();
        manager.addUser("张三");
        manager.addUser("李四");
        System.out.println("当前用户数: " + manager.getCurrentUserCount());
        System.out.println("是否已满: " + manager.isFull());
        System.out.println("常量 MAX_USERS: " + UserManager.MAX_USERS);
        System.out.println("常量 DEFAULT_ROLE: " + UserManager.DEFAULT_ROLE);

        System.out.println("\\n=== 3. 循环计数器用单字母 ===");
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                System.out.printf("(%d,%d) ", i, j);
            }
            System.out.println();
        }

        System.out.println("\\n=== 4. 布尔变量命名 ===");
        boolean isValid = true;
        boolean hasPermission = false;
        boolean canWrite = true;
        System.out.printf("isValid=%b hasPermission=%b canWrite=%b%n",
                isValid, hasPermission, canWrite);

        System.out.println("\\n=== 5. 集合用复数命名 ===");
        String[] users = {"张三", "李四", "王五"};
        java.util.List<String> orders = java.util.List.of("ORD001", "ORD002");
        System.out.println("users: " + java.util.Arrays.toString(users));
        System.out.println("orders: " + orders);

        System.out.println("\\n=== 6. 非法标识符（注释掉的都是错的） ===");
        // int 2name = 1;        // 错：数字开头
        // int class = 2;        // 错：关键字
        // int goto = 3;         // 错：保留字
        // int true = 4;         // 错：字面量
        // int user-name = 5;    // 错：含连字符
        System.out.println("以上非法标识符已注释，编译通过");
    }
}`,
  },

  // =========================================================
  // 第十二章：数字字面量
  // =========================================================
  {
    id: "java-numeric-literals",
    group: "基础深入",
    icon: "🔢",
    title: "数字字面量",
    content: `## 数字字面量：怎么写一个数字

**字面量（literal）** 是源码中直接写出的常量值，如 \`42\`、\`3.14\`、\`'A'\`、\`true\`。Java 支持多种进制的数字字面量，以及一些提升可读性的语法糖。

### 整数字面量的四种进制

\`\`\`java
int dec = 100;        // 十进制（默认）
int oct = 0144;       // 八进制：以 0 开头，144(8) = 100(10)
int hex = 0x64;       // 十六进制：以 0x 开头，64(16) = 100(10)
int bin = 0b1100100;  // 二进制：以 0b 开头（Java 7+）
\`\`\`

注意八进制以 \`0\` 开头是历史包袱，容易踩坑：\`010\` 不是十进制的 10，而是 8！现代代码很少用八进制。

### 下划线分隔符（Java 7+）

长数字可以用下划线 \`_\` 分隔，提升可读性，编译器会忽略下划线：

\`\`\`java
int million = 1_000_000;          // 100 万，清晰
long creditCard = 1234_5678_9012_3456L;
double pi = 3.14_15_92_65;
\`\`\`

规则：下划线只能出现在**数字之间**，不能在开头、结尾、紧邻小数点或后缀处。

### 浮点字面量

\`\`\`java
double d1 = 3.14;       // 默认是 double
double d2 = 3.14d;      // d 后缀（可选）
double d3 = 3.14D;      // D 后缀
float f1 = 3.14f;       // float 必须加 f 或 F
float f2 = 3.14F;
\`\`\`

### 科学计数法

\`\`\`java
double speed = 3.0e8;   // 3.0 × 10^8 = 3 亿（光速）
double tiny = 1.6e-19;  // 1.6 × 10^-19（电子电量）
double e = 1E2;         // 1 × 10^2 = 100.0
\`\`\`

\`e\` 或 \`E\` 后跟整数表示 10 的幂，可以是负数。

### 整数字面量的后缀

- \`L\` 或 \`l\`：表示 \`long\`。**强烈用大写 \`L\`**，小写 \`l\` 容易和 \`1\` 混淆。
- 默认（无后缀）：\`int\`。

\`\`\`java
long big = 9000000000L;   // 超过 int 范围必须加 L
long bad = 9000000000l;   // 语法对，但 l 像 1，别这么写
\`\`\`

### 字符与布尔字面量

- 字符：\`'A'\`、\`'中'\`、\`'\\\\n'\`（转义）、\`'\\\\u4e2d'\`（Unicode 转义，表示"中"）。
- 布尔：\`true\`、\`false\`。

下方代码演示各种数字字面量的写法。`,
    code: `// ============================================================
// 第 12 章：数字字面量演示
// ============================================================

public class Main {
    public static void main(String[] args) {
        System.out.println("=== 1. 四种进制 ===");
        int dec = 100;          // 十进制
        int oct = 0144;         // 八进制（0 开头）
        int hex = 0x64;         // 十六进制（0x 开头）
        int bin = 0b1100100;    // 二进制（0b 开头，Java 7+）
        System.out.printf("十进制 100 = %d%n", dec);
        System.out.printf("八进制 0144 = %d%n", oct);
        System.out.printf("十六进制 0x64 = %d%n", hex);
        System.out.printf("二进制 0b1100100 = %d%n", bin);
        System.out.println("它们都等于 100: " + (dec == oct && oct == hex && hex == bin));

        System.out.println("\\n=== 2. 八进制陷阱 ===");
        int a = 10;     // 十进制 10
        int b = 010;    // 八进制！实际是 8
        System.out.println("10 = " + a);
        System.out.println("010 = " + b + "  (注意：0 开头是八进制)");

        System.out.println("\\n=== 3. 下划线分隔符（Java 7+） ===");
        int million = 1_000_000;
        long creditCard = 1234_5678_9012_3456L;
        double pi = 3.14_15_92_65;
        int bytes = 0b1101_0100_1011_0010;
        System.out.println("1_000_000 = " + million);
        System.out.println("信用卡号 = " + creditCard);
        System.out.println("pi = " + pi);
        System.out.println("二进制分组 = " + bytes);

        System.out.println("\\n=== 4. 浮点字面量 ===");
        double d1 = 3.14;       // 默认 double
        double d2 = 3.14d;      // d 后缀
        float f1 = 3.14f;       // float 必须加 f
        float f2 = 3.14F;       // F 后缀
        System.out.printf("double d1=%f d2=%f%n", d1, d2);
        System.out.printf("float f1=%f f2=%f%n", f1, f2);

        System.out.println("\\n=== 5. 科学计数法 ===");
        double speed = 3.0e8;       // 光速 3×10^8
        double tiny = 1.6e-19;      // 电子电量
        double big = 1E2;           // 1×10^2 = 100
        System.out.println("光速 = " + speed);
        System.out.println("电子电量 = " + tiny);
        System.out.println("1E2 = " + big);

        System.out.println("\\n=== 6. long 后缀 ===");
        long bigLong = 9_000_000_000L;   // 超过 int 范围，必须加 L
        System.out.println("90 亿 = " + bigLong);
        // int tooBig = 9000000000;       // 编译错误：超出 int 范围
        System.out.println("建议用大写 L，小写 l 容易和 1 混淆");

        System.out.println("\\n=== 7. 字符字面量 ===");
        char ch1 = 'A';
        char ch2 = '中';
        char ch3 = '\\n';                // 转义字符
        char ch4 = '\\u4e2d';            // Unicode 转义，等于 '中'
        System.out.printf("ch1=%c(%d) ch2=%c(%d)%n", ch1, (int) ch1, ch2, (int) ch2);
        System.out.println("Unicode \\\\u4e2d = " + ch4 + "，等于 ch2: " + (ch2 == ch4));
    }
}`,
  },

  // =========================================================
  // 第十三章：整数溢出与处理
  // =========================================================
  {
    id: "java-integer-overflow",
    group: "基础深入",
    icon: "⚠️",
    title: "整数溢出与处理",
    content: `## 整数溢出：悄无声息的 Bug

Java 整数类型有固定位数（\`int\` 32 位、\`long\` 64 位），表示范围有限。**超出范围时不会报错**，而是像汽车里程表一样"绕回"——这是**二进制补码**运算的特性，也是最难调试的 Bug 之一。

### 溢出现象

\`\`\`java
int max = Integer.MAX_VALUE;   // 2147483647
int overflow = max + 1;        // -2147483648  最小值！
int min = Integer.MIN_VALUE;   // -2147483648
int underflow = min - 1;       // 2147483647   最大值！
\`\`\`

正数加 1 变负数、负数减 1 变正数，这就是**静默溢出**。计算中间结果溢出往往更隐蔽：

\`\`\`java
long total = a * b * c;   // 若 a/b/c 是 int，乘法在 int 上做，已溢出！
long total = (long) a * b * c;  // 正解：先转 long
\`\`\`

### Math.xxxExact 检查方法（Java 8+）

\`java.lang.Math\` 提供了一系列 \`xxxExact\` 方法，溢出时抛出 \`ArithmeticException\` 而非静默绕回：

| 方法 | 作用 |
| --- | --- |
| \`addExact(x, y)\` | 加法，溢出抛异常 |
| \`subtractExact(x, y)\` | 减法，溢出抛异常 |
| \`multiplyExact(x, y)\` | 乘法，溢出抛异常 |
| \`incrementExact(x)\` | 自增，溢出抛异常 |
| \`decrementExact(x)\` | 自减，溢出抛异常 |
| \`negateExact(x)\` | 取反，溢出抛异常 |
| \`toIntExact(long)\` | long 转 int，溢出抛异常 |

\`\`\`java
try {
    Math.addExact(Integer.MAX_VALUE, 1);
} catch (ArithmeticException e) {
    // 捕获溢出
}
\`\`\`

### BigInteger 处理大数

当数值可能超过 \`long\` 范围（约 9.2×10¹⁸），应使用 \`java.math.BigInteger\`。它是**任意精度**的整数，用数组存储各位数字，运算不会溢出，但**速度比基本类型慢得多**：

\`\`\`java
BigInteger a = new BigInteger("99999999999999999999");
BigInteger b = new BigInteger("1");
BigInteger sum = a.add(b);   // 100000000000000000000
\`\`\`

\`BigInteger\` 是**不可变对象**，运算返回新对象，不能像 \`int\` 那样 \`a += b\`。

### 溢出检测技巧

手动检测乘法溢出：若 \`a * b\` 是否溢出，可用 \`a != 0 && (b * a) / a != b\`（要小心边界）。

### 实战建议

1. 涉及金额、计数等关键计算，优先 \`long\`，必要时 \`BigInteger\`。
2. 算术中间结果可能溢出时，用 \`Math.xxxExact\` 守卫。
3. \`int\` 相乘结果赋给 \`long\` 前，先把一个操作数转 \`long\`。
4. 测试用例要覆盖边界值（\`MAX_VALUE\`、\`MIN_VALUE\`）。

下方代码演示溢出现象、Exact 方法和 BigInteger。`,
    code: `// ============================================================
// 第 13 章：整数溢出与处理演示
// ============================================================

import java.math.BigInteger;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== 1. 整数溢出现象 ===");
        int max = Integer.MAX_VALUE;
        int min = Integer.MIN_VALUE;
        System.out.println("int 最大值: " + max);
        System.out.println("max + 1 = " + (max + 1) + "  (溢出绕回到最小值)");
        System.out.println("int 最小值: " + min);
        System.out.println("min - 1 = " + (min - 1) + "  (下溢绕回到最大值)");

        System.out.println("\\n=== 2. 中间结果溢出 ===");
        int a = 100000;
        int b = 100000;
        // 错误写法：int * int 先溢出，再赋给 long 已经晚了
        long wrong = a * b;                  // 100000 * 100000 = 10^10，超出 int 范围
        // 正确写法：先把一个操作数转成 long
        long right = (long) a * b;
        System.out.println("a = " + a + ", b = " + b);
        System.out.println("错误: a * b -> long = " + wrong + "  (已溢出)");
        System.out.println("正确: (long)a * b = " + right);

        System.out.println("\\n=== 3. Math.xxxExact 检查方法 ===");
        try {
            int result = Math.addExact(max, 1);
            System.out.println("结果: " + result);
        } catch (ArithmeticException e) {
            System.out.println("捕获加法溢出: " + e.getMessage());
        }

        try {
            int product = Math.multiplyExact(100000, 100000);
            System.out.println("乘积: " + product);
        } catch (ArithmeticException e) {
            System.out.println("捕获乘法溢出: " + e.getMessage());
        }

        try {
            long bigLong = 5000000000L;
            int truncated = Math.toIntExact(bigLong);  // 超出 int 范围
            System.out.println("截断: " + truncated);
        } catch (ArithmeticException e) {
            System.out.println("捕获 long->int 溢出: " + e.getMessage());
        }

        System.out.println("\\n=== 4. 安全计算包装方法 ===");
        // 包装 addExact，失败返回可选默认值
        int safeSum = safeAdd(max, 100, -1);
        System.out.println("安全加法 max+100: " + safeSum + "  (溢出时返回 -1)");

        System.out.println("\\n=== 5. BigInteger 处理超大整数 ===");
        BigInteger big1 = new BigInteger("99999999999999999999");
        BigInteger big2 = BigInteger.ONE;
        BigInteger sum = big1.add(big2);          // 加法
        BigInteger product = big1.multiply(big2); // 乘法
        BigInteger power = BigInteger.valueOf(2).pow(100); // 2^100
        System.out.println("大数1: " + big1);
        System.out.println("大数1 + 1 = " + sum);
        System.out.println("2^100 = " + power);
        System.out.println("2^100 的位数: " + power.toString().length());

        System.out.println("\\n=== 6. 阶乘演示（很快溢出） ===");
        long factorial = 1;
        int overflowAt = -1;
        for (int i = 1; i <= 30; i++) {
            long prev = factorial;
            factorial *= i;
            if (factorial / i != prev && overflowAt == -1) {
                overflowAt = i;
                System.out.println("long 阶乘在 i=" + i + " 处溢出！");
            }
            if (i <= 20 || overflowAt == i) {
                System.out.printf("%d! = %d%n", i, factorial);
            }
        }
    }

    /** 安全加法：溢出时返回 defaultValue */
    static int safeAdd(int x, int y, int defaultValue) {
        try {
            return Math.addExact(x, y);
        } catch (ArithmeticException e) {
            return defaultValue;
        }
    }
}`,
  },

  // =========================================================
  // 第十四章：Math 类
  // =========================================================
  {
    id: "java-math-class",
    group: "基础深入",
    icon: "🧮",
    title: "Math 类",
    content: `## Math 类：数学计算的工具箱

\`java.lang.Math\` 是一个**工具类**（全部是静态方法，构造方法私有，不能实例化），提供常用数学运算。它还有两个常量：\`Math.PI\`（圆周率）和 \`Math.E\`（自然对数底）。

### 常用方法

#### 取绝对值

\`\`\`java
Math.abs(-5);    // 5
Math.abs(-3.14); // 3.14
Math.abs(Integer.MIN_VALUE); // 负数！注意 int 最小值的 abs 仍为负（溢出）
\`\`\`

#### 最大最小值

\`\`\`java
Math.max(3, 5);     // 5
Math.min(3.5, 2.5); // 2.5
\`\`\`

#### 取整方法

| 方法 | 作用 | 示例 |
| --- | --- | --- |
| \`round(x)\` | 四舍五入 | \`Math.round(3.4)=3\`, \`Math.round(3.5)=4\` |
| \`ceil(x)\` | 向上取整 | \`Math.ceil(3.1)=4.0\` |
| \`floor(x)\` | 向下取整 | \`Math.floor(3.9)=3.0\` |

注意 \`round\` 返回 \`long\`/\`int\`，\`ceil\`/\`floor\` 返回 \`double\`。

#### 幂与开方

\`\`\`java
Math.pow(2, 10);   // 1024.0（2 的 10 次方，返回 double）
Math.sqrt(16);     // 4.0（开平方）
Math.cbrt(27);     // 3.0（开立方，Java 5+）
\`\`\`

#### 三角函数（弧度制）

\`\`\`java
Math.sin(Math.PI / 2);   // 1.0
Math.cos(0);             // 1.0
Math.toRadians(180);     // 180 度转弧度 = π
Math.toDegrees(Math.PI); // π 弧度转度 = 180
\`\`\`

#### 对数与指数

\`\`\`java
Math.log(Math.E);    // 1.0（自然对数 ln）
Math.log10(1000);    // 3.0（以 10 为底）
Math.exp(1);         // Math.E（e 的 1 次方）
\`\`\`

#### 随机数

\`\`\`java
Math.random();   // [0.0, 1.0) 的 double
// 生成 [1, 100] 的整数随机数
int r = (int)(Math.random() * 100) + 1;
\`\`\`

\`Math.random()\` 内部用 \`java.util.Random\`，更灵活的随机数生成推荐 \`ThreadLocalRandom\` 或 Java 17+ 的 \`RandomGenerator\`。

### 精确计算的注意事项

1. \`Math.round\` 对负数四舍五入的规则是"**向正无穷方向**"：\`Math.round(-2.5) = -2\`（不是 -3），因为 -2.5 到 -2 的距离更近正无穷。
2. \`Math.abs(Integer.MIN_VALUE)\` 返回负数（溢出），用 \`Math.absExact\`（Java 15+）会抛异常。
3. 浮点运算有精度误差，金融场景请用 \`BigDecimal\`。
4. \`Math.pow\` 返回 \`double\`，大整数幂运算会丢精度，用 \`BigInteger\` 或 \`Math.multiplyExact\`。

下方代码演示 Math 类的各种方法。`,
    code: `// ============================================================
// 第 14 章：Math 类演示
// ============================================================

public class Main {
    public static void main(String[] args) {
        System.out.println("=== 1. 数学常量 ===");
        System.out.println("Math.PI = " + Math.PI);
        System.out.println("Math.E = " + Math.E);

        System.out.println("\\n=== 2. 绝对值 ===");
        System.out.println("abs(-5) = " + Math.abs(-5));
        System.out.println("abs(-3.14) = " + Math.abs(-3.14));
        System.out.println("abs(7) = " + Math.abs(7));
        // 注意：Integer.MIN_VALUE 的 abs 仍为负（溢出）
        System.out.println("abs(Integer.MIN_VALUE) = " + Math.abs(Integer.MIN_VALUE) + "  (溢出！)");

        System.out.println("\\n=== 3. 最大最小值 ===");
        System.out.println("max(3, 5) = " + Math.max(3, 5));
        System.out.println("min(3.5, 2.5) = " + Math.min(3.5, 2.5));
        System.out.println("max(1, max(2, 3)) = " + Math.max(1, Math.max(2, 3)));

        System.out.println("\\n=== 4. 取整方法 ===");
        System.out.println("round(3.4) = " + Math.round(3.4));   // 3
        System.out.println("round(3.5) = " + Math.round(3.5));   // 4
        System.out.println("round(-2.5) = " + Math.round(-2.5)); // -2（向正无穷）
        System.out.println("ceil(3.1) = " + Math.ceil(3.1));     // 4.0
        System.out.println("floor(3.9) = " + Math.floor(3.9));   // 3.0

        System.out.println("\\n=== 5. 幂与开方 ===");
        System.out.println("pow(2, 10) = " + Math.pow(2, 10));   // 1024.0
        System.out.println("sqrt(16) = " + Math.sqrt(16));       // 4.0
        System.out.println("cbrt(27) = " + Math.cbrt(27));       // 3.0
        System.out.println("hypot(3, 4) = " + Math.hypot(3, 4)); // 5.0（勾股）

        System.out.println("\\n=== 6. 三角函数（弧度制） ===");
        System.out.println("sin(π/2) = " + Math.sin(Math.PI / 2)); // 1.0
        System.out.println("cos(0) = " + Math.cos(0));             // 1.0
        System.out.println("toRadians(180) = " + Math.toRadians(180)); // π
        System.out.println("toDegrees(π) = " + Math.toDegrees(Math.PI)); // 180.0

        System.out.println("\\n=== 7. 对数与指数 ===");
        System.out.println("log(E) = " + Math.log(Math.E));    // 1.0
        System.out.println("log10(1000) = " + Math.log10(1000)); // 3.0
        System.out.println("exp(1) = " + Math.exp(1));         // E

        System.out.println("\\n=== 8. 随机数 ===");
        System.out.print("3 个 [0,1) 随机数: ");
        for (int i = 0; i < 3; i++) {
            System.out.printf("%.4f ", Math.random());
        }
        System.out.println();
        // 生成 [1, 100] 整数随机数
        int r = (int) (Math.random() * 100) + 1;
        System.out.println("[1,100] 随机整数: " + r);

        System.out.println("\\n=== 9. 符号函数与拷贝符号 ===");
        System.out.println("signum(-5.0) = " + Math.signum(-5.0)); // -1.0
        System.out.println("signum(0.0) = " + Math.signum(0.0));   // 0.0
        System.out.println("signum(3.0) = " + Math.signum(3.0));   // 1.0
        // copySign(magnitude, sign)：取 magnitude 的绝对值 + sign 的符号
        System.out.println("copySign(5, -1) = " + Math.copySign(5, -1)); // -5.0
    }
}`,
  },

  // =========================================================
  // 第十五章：BigDecimal 精确计算
  // =========================================================
  {
    id: "java-bigdecimal",
    group: "基础深入",
    icon: "💰",
    title: "BigDecimal 精确计算",
    content: `## BigDecimal：金融计算的精确利器

\`float\` 和 \`double\` 用二进制浮点表示小数，**无法精确表示**像 0.1 这样的十进制小数，导致 \`0.1 + 0.2\` 得到 \`0.30000000000000004\` 而非 0.3。对于金额、利率等**精度敏感**场景，必须用 \`java.math.BigDecimal\`。

### 为什么需要 BigDecimal

\`\`\`java
System.out.println(0.1 + 0.2);   // 0.30000000000000004  错误！
System.out.println(1.0 - 0.8);   // 0.19999999999999996
\`\`\`

这种误差源于二进制无法精确表示 0.1（类似十进制无法精确表示 1/3）。在科学计算中可接受，但在金融、财务中是**事故级 Bug**。

### 创建 BigDecimal

**强烈推荐用 String 构造**，避免 \`double\` 构造把误差带进来：

\`\`\`java
BigDecimal a = new BigDecimal("0.1");          // 推荐，精确
BigDecimal b = BigDecimal.valueOf(0.1);        // 推荐，等价于 new BigDecimal(Double.toString(0.1))
BigDecimal c = new BigDecimal(0.1);            // 不推荐！仍带 double 误差
\`\`\`

### 算术运算

\`BigDecimal\` 是**不可变对象**，运算返回新对象，不能像 \`int\` 那样用 \`+\`、\`-\`：

| 运算 | 方法 |
| --- | --- |
| 加 | \`a.add(b)\` |
| 减 | \`a.subtract(b)\` |
| 乘 | \`a.multiply(b)\` |
| 除 | \`a.divide(b)\` |
| 取余 | \`a.remainder(b)\` |

**除法必须指定精度和舍入模式**，否则若结果是无限循环小数（如 1/3），会抛 \`ArithmeticException\`：

\`\`\`java
BigDecimal r = a.divide(b, 10, RoundingMode.HALF_UP); // 保留 10 位，四舍五入
\`\`\`

### 比较方法：compareTo vs equals

**这是 BigDecimal 最隐蔽的坑**：

- \`equals\` 既比值又比精度：\`new BigDecimal("1.0").equals(new BigDecimal("1.00"))\` 为 \`false\`！
- \`compareTo\` 只比值：\`new BigDecimal("1.0").compareTo(new BigDecimal("1.00"))\` 为 \`0\`（相等）。

**比较 BigDecimal 永远用 \`compareTo\`**，用 \`equals\` 会因精度差异得到错误结果。

### 精度设置与舍入模式

\`setScale\` 设置小数位数，需指定 \`RoundingMode\`：

\`\`\`java
BigDecimal price = new BigDecimal("3.14159");
price = price.setScale(2, RoundingMode.HALF_UP); // 3.14
\`\`\`

常用 \`RoundingMode\`：

| 模式 | 说明 |
| --- | --- |
| \`HALF_UP\` | 四舍五入（最常用） |
| \`HALF_EVEN\` | 银行家舍入（五取偶） |
| \`DOWN\` | 向零截断 |
| \`CEILING\` | 向正无穷 |
| \`FLOOR\` | 向负无穷 |

### 注意事项

1. **优先 String 构造**，不要用 \`double\` 构造。
2. **运算结果不可变**，必须接收返回值：\`a = a.add(b);\`。
3. **除法指定精度**，防止无限循环小数异常。
4. **比较用 compareTo**，不要用 equals。
5. 性能远低于基本类型，热路径慎用。

下方代码演示 BigDecimal 精确计算和与 double 的对比。`,
    code: `// ============================================================
// 第 15 章：BigDecimal 精确计算演示
// ============================================================

import java.math.BigDecimal;
import java.math.RoundingMode;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== 1. double 的精度问题 ===");
        // double 无法精确表示 0.1，相加产生误差
        double d1 = 0.1;
        double d2 = 0.2;
        System.out.println("0.1 + 0.2 = " + (d1 + d2));        // 0.30000000000000004
        System.out.println("1.0 - 0.8 = " + (1.0 - 0.8));       // 0.19999999999999996
        System.out.println("0.1 * 3 = " + (0.1 * 3));           // 0.30000000000000004

        System.out.println("\\n=== 2. BigDecimal 精确计算 ===");
        // 用 String 构造（推荐）
        BigDecimal a = new BigDecimal("0.1");
        BigDecimal b = new BigDecimal("0.2");
        System.out.println("0.1 + 0.2 = " + a.add(b));          // 0.3 精确
        System.out.println("1.0 - 0.8 = " + new BigDecimal("1.0").subtract(new BigDecimal("0.8")));
        System.out.println("0.1 * 3 = " + a.multiply(new BigDecimal("3")));

        System.out.println("\\n=== 3. 创建方式对比 ===");
        // String 构造：精确
        BigDecimal fromStr = new BigDecimal("0.1");
        // valueOf：内部转 String 再构造，也精确
        BigDecimal fromValueOf = BigDecimal.valueOf(0.1);
        // double 构造：把 double 的二进制误差带进来！
        BigDecimal fromDouble = new BigDecimal(0.1);
        System.out.println("new BigDecimal(\\"0.1\\") = " + fromStr);
        System.out.println("BigDecimal.valueOf(0.1) = " + fromValueOf);
        System.out.println("new BigDecimal(0.1) = " + fromDouble + "  (带误差！)");

        System.out.println("\\n=== 4. 除法与精度 ===");
        BigDecimal ten = new BigDecimal("10");
        BigDecimal three = new BigDecimal("3");
        // 不指定精度：1/3 是无限循环小数，抛 ArithmeticException
        try {
            ten.divide(three);   // 会抛异常
        } catch (ArithmeticException e) {
            System.out.println("10/3 不指定精度抛异常: " + e.getMessage());
        }
        // 正解：指定精度和舍入模式
        BigDecimal quotient = ten.divide(three, 6, RoundingMode.HALF_UP);
        System.out.println("10/3 保留 6 位四舍五入 = " + quotient);

        System.out.println("\\n=== 5. compareTo vs equals ===");
        BigDecimal x = new BigDecimal("1.0");
        BigDecimal y = new BigDecimal("1.00");
        BigDecimal z = new BigDecimal("1.00");
        System.out.println("1.0 equals 1.00: " + x.equals(y) + "  (精度不同，false！)");
        System.out.println("1.00 equals 1.00: " + y.equals(z) + "  (精度相同，true)");
        System.out.println("1.0 compareTo 1.00: " + x.compareTo(y) + "  (0 表示相等，推荐！)");
        System.out.println("比较应判断 compareTo()==0: " + (x.compareTo(y) == 0));

        System.out.println("\\n=== 6. setScale 设置精度 ===");
        BigDecimal price = new BigDecimal("3.14159");
        BigDecimal rounded2 = price.setScale(2, RoundingMode.HALF_UP);   // 3.14
        BigDecimal rounded4 = price.setScale(4, RoundingMode.HALF_UP);   // 3.1416
        System.out.println("3.14159 保留 2 位 = " + rounded2);
        System.out.println("3.14159 保留 4 位 = " + rounded4);

        System.out.println("\\n=== 7. 实战：购物车金额计算 ===");
        BigDecimal applePrice = new BigDecimal("8.50");
        BigDecimal appleQty = new BigDecimal("3");
        BigDecimal bananaPrice = new BigDecimal("3.20");
        BigDecimal bananaQty = new BigDecimal("2");
        BigDecimal appleTotal = applePrice.multiply(appleQty);
        BigDecimal bananaTotal = bananaPrice.multiply(bananaQty);
        BigDecimal grandTotal = appleTotal.add(bananaTotal);
        BigDecimal tax = grandTotal.multiply(new BigDecimal("0.08"))
                                   .setScale(2, RoundingMode.HALF_UP);
        BigDecimal finalPay = grandTotal.add(tax);
        System.out.println("苹果 8.50 × 3 = " + appleTotal);
        System.out.println("香蕉 3.20 × 2 = " + bananaTotal);
        System.out.println("小计 = " + grandTotal);
        System.out.println("税 (8%) = " + tax);
        System.out.println("应付 = " + finalPay.setScale(2, RoundingMode.HALF_UP));
    }
}`,
  },
];
