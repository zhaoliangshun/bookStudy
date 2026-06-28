// =============================================================
// Java 交互式教程 —— 第三批章节（进阶组，共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//  11. java-generics  — 泛型
//  12. java-io        — 文件与 I/O
//  13. java-threads   — 多线程基础
//  14. java-lambda    — Lambda 与函数式编程
//  15. java-stream    — Stream API
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（本批为"进阶"）
//   content : Markdown 格式的详细讲解（文字量大，含大量 demo）
//   code    : 可运行、带详细中文注释的 Java 示例代码
//
// 代码运行环境约束：
//   - 用 javac 编译、java 运行，各 10 秒超时
//   - public class 必须为 Main（API 自动提取类名）
//   - 辅助类用非 public 形式定义在同一文件
//   - 通过 System.out 输出结果
// =============================================================

export const chapters = [
  // =========================================================
  // 第十一章：泛型
  // =========================================================
  {
    id: "java-generics",
    group: "进阶",
    icon: "🎯",
    title: "泛型",
    content: `## 泛型：让类型参数化的强大机制

**泛型（Generics）** 是 Java 5 引入的一项重要特性，它的本质是**参数化类型**（Parameterized Types）。通俗地说，泛型允许我们在定义类、接口和方法时，把"类型"本身当作一个"参数"来使用——也就是先不指定具体类型，而是用一个占位符（如 \`T\`）来代替，等到真正使用时再把具体类型填进去。这样同一段代码就可以适配多种数据类型，既保证了**类型安全**，又实现了**代码复用**。

### 为什么需要泛型？

在泛型出现之前，Java 程序员要让一个容器存放任意类型的对象，只能用 \`Object\` 作为元素类型（因为 \`Object\` 是所有类的父类）。但这种做法有两个严重的问题：

\`\`\`java
// 泛型之前的写法：用 Object 存放任意类型
List list = new ArrayList();
list.add("hello");
list.add(123);          // 编译通过，但把字符串和数字混在一起

String s = (String) list.get(1);  // 运行时抛出 ClassCastException！
\`\`\`

问题一：**类型不安全**。编译器无法帮你检查存入的类型是否合法，什么都能往里塞。问题二：**强制转换繁琐且容易出错**。每次取出元素都要显式转换，一旦类型不匹配就会在运行时崩溃。泛型正是为了解决这两个痛点而生：把**运行时的错误提前到编译期**，让编译器替你把关。

\`\`\`java
// 使用泛型后：明确声明只能放 String
List<String> list = new ArrayList<>();
list.add("hello");
list.add(123);          // 编译错误！编译器直接拒绝
String s = list.get(0); // 无需强转
\`\`\`

### 泛型的三大形态

| 形态 | 语法 | 说明 |
| --- | --- | --- |
| 泛型类 | \`class Box<T> { ... }\` | 类级别的类型参数，整个类内部可用 |
| 泛型方法 | \`<T> T foo(T x)\` | 方法级别的类型参数，调用时推断 |
| 泛型接口 | \`interface Comparable<T>\` | 接口级别的类型参数，实现时指定 |

### 类型参数的命名约定

虽然类型参数可以取任意名字，但社区有一套**约定俗成的单字母命名**，便于阅读：

| 参数 | 含义 | 典型场景 |
| --- | --- | --- |
| \`T\` | Type（类型） | 通用类型参数 |
| \`E\` | Element（元素） | 集合中的元素 |
| \`K\` / \`V\` | Key / Value | 映射（Map）的键和值 |
| \`R\` | Result（结果） | 函数式接口的返回值 |
| \`N\` | Number（数字） | 数字相关泛型 |

### 有界类型参数（Bounded Type Parameters）

有时候我们希望类型参数不是"任意类型"，而是某个类（或接口）的子类型。这时可以用 \`<T extends 上界>\` 来约束：

\`\`\`java
// T 必须是 Number 或其子类，因此可以安全调用 Number 的方法
class NumberBox<T extends Number> {
    private T value;
    public double doubleValue() { return value.doubleValue(); }
}
\`\`\`

\`extends\` 在这里既表示"继承类"也表示"实现接口"——无论上界是类还是接口，都统一用 \`extends\` 关键字。还可以同时约束多个上界：\`<T extends Comparable & Serializable>\`。

### 通配符与 PECS 原则

通配符 \`?\` 表示"未知类型"，配合 \`extends\` / \`super\` 形成上界通配符和下界通配符。Joshua Bloch 在《Effective Java》中总结了著名的 **PECS 原则**（Producer Extends, Consumer Super）：

- **\`? extends T\`（上界通配符）**：作为**生产者**向外提供数据，适合**读取**，不适合写入（除 null 外）。例如 \`Box<? extends Number>\` 可以装 Integer、Double，读取出来是 Number。
- **\`? super T\`（下界通配符）**：作为**消费者**接收数据，适合**写入**，读取只能得到 Object。例如 \`Box<? super Integer>\` 可以装 Integer，但容器实际可能是 \`Box<Number>\` 或 \`Box<Object>\`。

\`\`\`java
// 上界：从盒子里读取数字
double sum(Box<? extends Number> box) { return box.get().doubleValue(); }
// 下界：往盒子里写入 Integer
void fill(Box<? super Integer> box, Integer v) { box.set(v); }
\`\`\`

### 类型擦除（Type Erasure）

Java 的泛型是通过**类型擦除**实现的：泛型类型信息只存在于**编译期**，编译后会擦除掉类型参数，替换为上界（默认是 \`Object\`）。这意味着 \`Box<String>\` 和 \`Box<Integer>\` 在运行时其实是**同一个类** \`Box\`。

类型擦除带来一些**限制**：

1. 不能用基本类型作类型参数：\`List<int>\` 非法，要用 \`List<Integer>\`。
2. 运行时无法用 \`instanceof\` 判断泛型类型：\`x instanceof List<String>\` 非法。
3. 不能直接 \`new T()\`、\`new T[]\`：类型参数在运行时不存在。
4. 静态字段/方法不能使用类的类型参数。
5. 泛型类不能同时继承 \`Throwable\`：不能创建泛型异常。

### 小结

泛型是 Java 类型系统的基石之一。它让我们写出**更通用、更安全、更易读**的代码。掌握泛型类、泛型方法、通配符和 PECS 原则，是阅读 Java 集合框架源码（如 \`Collections\`、\`Stream\`）的前提。下方代码演示了一个 \`Box<T>\` 泛型类、有界类型参数、泛型方法以及上/下界通配符的综合用法。`,
    code: `// ============================================================
// 第 11 章：泛型（Generics）演示
// ============================================================

// 泛型盒子类：T 是类型参数，可以装任意类型的值
class Box<T> {
    private T value;

    public void set(T value) {
        this.value = value;
    }

    public T get() {
        return value;
    }
}

// 有界类型参数：T 必须是 Number 或其子类
class NumberBox<T extends Number> {
    private T value;

    public NumberBox(T value) {
        this.value = value;
    }

    // 因为 T extends Number，可以安全调用 Number 的方法
    public double doubleValue() {
        return value.doubleValue();
    }

    public T get() {
        return value;
    }
}

public class Main {
    // 泛型方法：<T> 声明类型参数，编译器根据参数推断 T 的具体类型
    public static <T> Box<T> createBox(T value) {
        Box<T> box = new Box<>();
        box.set(value);
        return box;
    }

    // 上界通配符 ? extends Number：生产者，适合读取
    public static double sumOf(Box<? extends Number> box) {
        return box.get().doubleValue();
    }

    // 下界通配符 ? super Integer：消费者，适合写入
    public static void fillBox(Box<? super Integer> box, Integer value) {
        box.set(value);
    }

    public static void main(String[] args) {
        // 1. 泛型类的基本使用
        Box<String> strBox = new Box<>();
        strBox.set("Hello 泛型");
        System.out.println("字符串盒子: " + strBox.get());

        Box<Integer> intBox = new Box<>();
        intBox.set(100);
        System.out.println("整数盒子: " + intBox.get());

        // 2. 泛型方法：类型由参数自动推断
        Box<Double> dBox = createBox(3.14);
        System.out.println("泛型方法创建: " + dBox.get());

        // 3. 有界类型参数
        NumberBox<Integer> numBox = new NumberBox<>(42);
        System.out.println("有界类型 doubleValue: " + numBox.doubleValue());

        // 4. 上界通配符演示（PECS：Producer Extends）
        Box<Integer> intBox2 = new Box<>();
        intBox2.set(88);
        System.out.println("sumOf (上界通配符): " + sumOf(intBox2));

        // 5. 下界通配符演示（PECS：Consumer Super）
        Box<Number> numGenericBox = new Box<>();
        fillBox(numGenericBox, 999);
        System.out.println("fillBox (下界通配符): " + numGenericBox.get());

        // 6. 类型擦除的体现：运行时 Box<String> 与 Box<Integer> 是同一个类
        System.out.println("strBox 运行时类: " + strBox.getClass().getName());
        System.out.println("intBox 运行时类: " + intBox.getClass().getName());
        System.out.println("二者是否同一个类: " + (strBox.getClass() == intBox.getClass()));
    }
}`,
  },

  // =========================================================
  // 第十二章：文件与 I/O
  // =========================================================
  {
    id: "java-io",
    group: "进阶",
    icon: "📂",
    title: "文件与 I/O",
    content: `## 文件与 I/O：与外部世界交换数据

程序运行在内存中，但数据往往需要**持久化到磁盘**、**从网络读取**、或者**输出到控制台**。**I/O（Input/Output，输入/输出）** 就是程序与外部世界（文件、网络、键盘、屏幕等）交换数据的机制。Java 在 \`java.io\` 和 \`java.nio.file\` 两个包中提供了极其丰富的 I/O 工具，几乎能应对所有场景。

### I/O 的两大维度

理解 Java I/O，要先抓住两个核心维度：

| 维度 | 选项一 | 选项二 | 说明 |
| --- | --- | --- | --- |
| 数据单位 | **字节流**（byte） | **字符流**（char） | 字节流处理任意二进制；字符流处理文本，自动处理编码 |
| 方向 | **输入**（Input/Reader） | **输出**（Output/Writer） | 读进来 vs 写出去 |

由此衍生出四大家族：\`InputStream\` / \`OutputStream\`（字节流）和 \`Reader\` / \`Writer\`（字符流），它们都是**抽象基类**。

### 字节流：InputStream 与 OutputStream

字节流以**字节（8 位）**为单位读写数据，适合处理**图片、视频、压缩包**等二进制数据。最基础的字节流是逐字节读写的，效率较低，因此实践中常配合**缓冲流**使用。

\`\`\`java
// 写入字节数据
ByteArrayOutputStream out = new ByteArrayOutputStream();
out.write("你好".getBytes(StandardCharsets.UTF_8));
byte[] bytes = out.toByteArray();

// 读取字节数据
InputStream in = new ByteArrayInputStream(bytes);
int b;
while ((b = in.read()) != -1) { /* 处理每个字节 */ }
\`\`\`

### 字符流：Reader 与 Writer

字符流以**字符（16 位）**为单位，内部会处理**字符编码**（如 UTF-8、GBK），适合处理**纯文本**。\`InputStreamReader\` 是字节流到字符流的"桥梁"，必须指定编码：

\`\`\`java
// 字节流 -> 字符流，指定 UTF-8 编码
Reader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
\`\`\`

### 缓冲流：BufferedReader / BufferedWriter

每次读写一个字节/字符都要和底层资源交互，开销巨大。**缓冲流**在内部分配一块缓冲区，减少实际 I/O 次数，大幅提升性能。\`BufferedReader\` 还提供 \`readLine()\` 方法，可以**按行读取**文本，非常实用。

\`\`\`java
try (BufferedReader br = new BufferedReader(new InputStreamReader(in, UTF_8))) {
    String line;
    while ((line = br.readLine()) != null) { System.out.println(line); }
}
\`\`\`

### try-with-resources 自动关闭

I/O 资源（流、连接）用完必须关闭，否则会**资源泄漏**。Java 7 引入的 **try-with-resources** 语法让这一过程变得优雅：只要把资源声明放在 \`try\` 的括号里，无论是否抛异常，JVM 都会在结束时**自动调用 \`close()\`**。实现 \`AutoCloseable\` 接口的对象都能用这个语法。

\`\`\`java
try (BufferedReader br = new BufferedReader(...)) {
    // 使用 br
} // 自动关闭，无需 finally
\`\`\`

### NIO 与 Files / Path

Java 7 引入的 **NIO.2**（\`java.nio.file\` 包）提供了更现代的文件 API。\`Path\` 表示路径（取代旧的 \`File\`），\`Files\` 工具类提供大量静态方法，让文件操作变得**一行搞定**：

\`\`\`java
Path p = Paths.get("docs", "readme.txt");
List<String> lines = Files.readAllLines(p);           // 一次读完所有行
Files.write(p, "内容".getBytes(UTF_8));               // 写入字节
Files.copy(src, dest);                                 // 复制文件
Files.exists(p);                                       // 判断是否存在
\`\`\`

### 字节流 vs 字符流 vs NIO

| 特性 | 字节流 | 字符流 | NIO Files |
| --- | --- | --- | --- |
| 数据单位 | 字节（byte） | 字符（char） | 高层封装 |
| 适用场景 | 二进制数据 | 文本数据 | 文件操作 |
| 编码处理 | 手动 | 自动 | 自动 |
| 推荐度 | 底层 | 文本流 | 现代首选 |

### 小结

Java I/O 体系庞大，但核心思路清晰：**字节流处理二进制，字符流处理文本，缓冲流提升性能，NIO 提供现代 API，try-with-resources 保证资源释放**。下方代码在不实际写文件的前提下（沙箱环境），用内存中的 \`ByteArrayStream\` 演示了字节流读写、字符流的 \`BufferedReader\` 按行读取、\`BufferedWriter\` 写入、以及 \`Path\` 的路径操作。`,
    code: `// ============================================================
// 第 12 章：文件与 I/O 演示（内存中操作，不实际写文件）
// ============================================================
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) throws IOException {
        String text = "Java I/O 学习\\n字节流与字符流\\nBufferedReader 提升效率";

        // 1. 字节流：把字符串编码为字节写入内存缓冲区
        ByteArrayOutputStream byteOut = new ByteArrayOutputStream();
        byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
        byteOut.write(bytes);
        byte[] byteArray = byteOut.toByteArray();
        System.out.println("字节流写入字节数: " + byteArray.length);

        // 2. 字节输入流读取并复制
        InputStream byteIn = new ByteArrayInputStream(byteArray);
        ByteArrayOutputStream copyOut = new ByteArrayOutputStream();
        byte[] buffer = new byte[16];
        int n;
        while ((n = byteIn.read(buffer)) != -1) {
            copyOut.write(buffer, 0, n);
        }
        System.out.println("字节流读回: " + new String(copyOut.toByteArray(), StandardCharsets.UTF_8));

        // 3. 字符流：用 Reader + BufferedReader 按行读取（try-with-resources 自动关闭）
        ByteArrayInputStream rawIn = new ByteArrayInputStream(byteArray);
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(rawIn, StandardCharsets.UTF_8))) {
            String line;
            System.out.println("--- 逐行读取 ---");
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        }

        // 4. 字符流写入内存（BufferedWriter + StringWriter）
        StringWriter sw = new StringWriter();
        try (BufferedWriter writer = new BufferedWriter(sw)) {
            writer.write("第一行");
            writer.newLine();
            writer.write("第二行");
        }
        System.out.println("--- BufferedWriter 输出 ---");
        System.out.println(sw.toString());

        // 5. NIO Path 演示（仅构造路径，不实际访问文件系统）
        Path p1 = Paths.get("docs", "notes", "readme.txt");
        System.out.println("Path: " + p1);
        System.out.println("文件名: " + p1.getFileName());
        System.out.println("父路径: " + p1.getParent());
        System.out.println("根路径: " + p1.getRoot());
        System.out.println("绝对路径: " + p1.toAbsolutePath());

        // 6. 模拟 Files API 的字符串与字节互转回环
        List<String> lines = new ArrayList<>();
        lines.add("标题：Java NIO");
        lines.add("内容：Files 类提供静态方法");
        String joined = String.join("\\n", lines);
        byte[] fileBytes = joined.getBytes(StandardCharsets.UTF_8);
        String roundTrip = new String(fileBytes, StandardCharsets.UTF_8);
        System.out.println("--- 模拟 Files 读写回环 ---");
        System.out.println(roundTrip);
    }
}`,
  },

  // =========================================================
  // 第十三章：多线程基础
  // =========================================================
  {
    id: "java-threads",
    group: "进阶",
    icon: "🧵",
    title: "多线程基础",
    content: `## 多线程基础：让程序同时做多件事

现代 CPU 都是多核的，如果程序只能串行执行，就会浪费大量算力。**多线程（Multithreading）** 让一个进程内同时运行多个执行流，从而**充分利用 CPU、提升吞吐量、改善响应性**。Java 从设计之初就把多线程作为一等公民，提供了从底层 \`Thread\` 到高层 \`CompletableFuture\` 的完整工具链。

### 进程与线程

- **进程（Process）**：操作系统资源分配的基本单位，每个进程有独立的内存空间。启动一个 Java 程序就是启动一个 JVM 进程。
- **线程（Thread）**：CPU 调度的基本单位，同一进程内的线程**共享堆内存**，但各自有独立的**栈**和**程序计数器**。线程间通信成本远低于进程间通信。

### 创建线程的两种方式

**方式一：实现 \`Runnable\` 接口**（推荐）。\`Runnable\` 只有一个 \`run()\` 方法，与继承 \`Thread\` 相比，它不影响类的继承体系，更适合配合线程池使用。

\`\`\`java
Runnable task = () -> { System.out.println("运行中: " + Thread.currentThread().getName()); };
new Thread(task, "my-thread").start();
\`\`\`

**方式二：继承 \`Thread\` 类**，重写 \`run()\` 方法。这种方式限制类不能继承其他类，扩展性差。

注意：调用 \`start()\` 才会启动新线程并执行 \`run()\`；直接调用 \`run()\` 只是普通方法调用，不会新开线程。

### 线程的生命周期

一个线程从创建到消亡，会经历若干状态（定义在 \`Thread.State\` 枚举中）：

| 状态 | 说明 |
| --- | --- |
| \`NEW\` | 已创建但未调用 \`start()\` |
| \`RUNNABLE\` | 已启动，正在 JVM 中执行（可能占用 CPU 或等待 CPU） |
| \`BLOCKED\` | 等待获取锁（synchronized） |
| \`WAITING\` | 无限期等待（如 \`wait()\`、\`join()\`） |
| \`TIMED_WAITING\` | 限时等待（如 \`sleep(ms)\`、\`join(ms)\`） |
| \`TERMINATED\` | \`run()\` 执行完毕，线程结束 |

### 线程安全与 synchronized

多个线程**共享**同一份数据时，如果不加保护，就会出现**竞态条件（Race Condition）**。例如 \`count++\` 看似一行，实际是"读—改—写"三步，多线程交错执行会导致丢失更新。\`synchronized\` 关键字提供**互斥锁**，保证同一时刻只有一个线程进入被保护的代码块/方法：

\`\`\`java
public synchronized void increment() { count++; }
\`\`\`

### volatile 关键字

\`volatile\` 保证变量的**可见性**：一个线程修改后，其他线程立即可见。但它**不保证原子性**，适合"一写多读"的标志位场景。\`synchronized\` 既保证可见性也保证原子性，但开销更大。

### wait / notify：线程间协作

\`wait()\` 让当前线程释放锁并进入等待；\`notify()\` / \`notifyAll()\` 唤醒等待的线程。它们必须在 \`synchronized\` 块内调用，是经典的**生产者—消费者**模型基础。现代代码更推荐用 \`java.util.concurrent\` 中的 \`BlockingQueue\` 等高级工具。

### 线程池：ExecutorService

直接 \`new Thread()\` 有诸多弊端：创建/销毁开销大、无法控制数量（可能耗尽资源）、缺乏统一管理。**线程池**预先创建一批线程复用，通过任务队列调度，是生产环境的标准做法：

\`\`\`java
ExecutorService pool = Executors.newFixedThreadPool(4);
pool.submit(() -> { /* 任务 */ });
pool.shutdown(); // 优雅关闭
\`\`\`

\`Executors\` 提供了几种常用线程池：\`newFixedThreadPool\`（固定大小）、\`newCachedThreadPool\`（按需创建）、\`newSingleThreadExecutor\`（单线程串行）。不过阿里巴巴规范建议用 \`ThreadPoolExecutor\` 显式构造，避免无界队列导致的 OOM。

### CompletableFuture 简介

Java 8 引入的 \`CompletableFuture\` 支持异步编程与链式回调，能优雅地表达"先做 A，再做 B，失败则走 C"的逻辑，比 \`Future\` 的 \`get()\` 阻塞式获取强大得多。

### 小结

多线程是 Java 进阶的硬核主题。理解**线程创建、生命周期、synchronized/volatile 的区别、线程池的使用**是第一步。下方代码演示了用 \`Runnable\` 启动线程、\`synchronized\` 计数器、以及 \`ExecutorService\` 线程池的基本用法。`,
    code: `// ============================================================
// 第 13 章：多线程基础演示
// ============================================================
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

// 共享计数器，使用 synchronized 保证线程安全
class Counter {
    private int count = 0;

    // 同步方法：同一时刻只有一个线程能进入
    public synchronized void increment() {
        count++;
    }

    public synchronized int get() {
        return count;
    }
}

// 简单的 Runnable 任务
class PrintTask implements Runnable {
    private final String name;

    public PrintTask(String name) {
        this.name = name;
    }

    @Override
    public void run() {
        for (int i = 1; i <= 3; i++) {
            System.out.println(name + " 第 " + i + " 次，线程: " + Thread.currentThread().getName());
            try {
                Thread.sleep(50); // 模拟耗时操作
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return;
            }
        }
    }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        // 1. 方式：实现 Runnable，交给 Thread 启动
        Thread t1 = new Thread(new PrintTask("任务A"));
        Thread t2 = new Thread(new PrintTask("任务B"));
        t1.start();
        t2.start();
        t1.join(); // 等待 t1 结束
        t2.join(); // 等待 t2 结束
        System.out.println("--- 两个线程执行完毕 ---");

        // 2. synchronized 同步演示：5 个线程各自加 1000
        Counter counter = new Counter();
        Thread[] threads = new Thread[5];
        for (int i = 0; i < 5; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    counter.increment();
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        System.out.println("同步计数器最终值（期望 5000）: " + counter.get());

        // 3. ExecutorService 线程池
        ExecutorService pool = Executors.newFixedThreadPool(3);
        AtomicInteger total = new AtomicInteger(0);
        for (int i = 1; i <= 6; i++) {
            final int taskId = i;
            pool.submit(() -> {
                System.out.println("线程池任务 " + taskId + " 由 " + Thread.currentThread().getName() + " 处理");
                total.incrementAndGet();
            });
        }
        pool.shutdown(); // 不再接受新任务
        pool.awaitTermination(5, TimeUnit.SECONDS); // 等待所有任务完成
        System.out.println("线程池完成任务数: " + total.get());

        // 4. 查看当前线程与运行环境信息
        System.out.println("主线程名称: " + Thread.currentThread().getName());
        System.out.println("CPU 核心数: " + Runtime.getRuntime().availableProcessors());
    }
}`,
  },

  // =========================================================
  // 第十四章：Lambda 与函数式编程
  // =========================================================
  {
    id: "java-lambda",
    group: "进阶",
    icon: "⚡",
    title: "Lambda 与函数式编程",
    content: `## Lambda 与函数式编程：把"行为"当作数据传递

**Lambda 表达式** 是 Java 8 引入的重磅特性，它让 Java 第一次拥有了**简洁的函数式编程**能力。简单说，Lambda 是一段**没有名字的函数**（匿名函数），可以像数据一样被传递、赋值、组合。在 Lambda 出现之前，要把"一段行为"传给方法，只能写冗长的**匿名内部类**；Lambda 让同样的逻辑用一行代码就能表达。

### Lambda 的语法

Lambda 的基本形式是 \`参数 -> 表达式/语句\`：

\`\`\`java
(int a, int b) -> a + b          // 有类型声明
(a, b) -> a + b                  // 类型推断
a -> a * 2                       // 单参数可省括号
() -> System.out.println("hi")   // 无参数
(x, y) -> { int r = x + y; return r; } // 多条语句需花括号和 return
\`\`\`

### 函数式接口（Functional Interface）

Lambda 不能孤立存在，它的类型必须是一个**函数式接口**——即**有且只有一个抽象方法**的接口。\`@FunctionalInterface\` 注解用于编译期检查（可选）。Java 内置了一组常用函数式接口，几乎覆盖所有常见场景：

| 接口 | 签名 | 含义 | 示例 |
| --- | --- | --- | --- |
| \`Function<T,R>\` | \`R apply(T)\` | 接收 T 返回 R | \`String -> Integer\` |
| \`Consumer<T>\` | \`void accept(T)\` | 消费 T，无返回 | 打印日志 |
| \`Supplier<T>\` | \`T get()\` | 无参，返回 T | 生成随机数 |
| \`Predicate<T>\` | \`boolean test(T)\` | 断言 T | 判断是否为偶数 |
| \`BiFunction<T,U,R>\` | \`R apply(T,U)\` | 双参返回 R | 两个数相加 |

### 方法引用（Method Reference）

当 Lambda 体只是调用某个已存在的方法时，可以用 **方法引用 \`::\`** 进一步简化，让代码更易读。四种形式：

\`\`\`java
MathOperation op = (a, b) -> Math.max(a, b); // Lambda
MathOperation op2 = Math::max;                // 静态方法引用
names.forEach(s -> System.out.println(s));    // Lambda
names.forEach(System.out::println);           // 实例方法引用（特定对象）
Supplier<ArrayList> s = ArrayList::new;       // 构造方法引用
\`\`\`

### 函数组合

函数式接口提供了 \`andThen\`、\`compose\`、\`and\`、\`or\`、\`negate\` 等组合方法，让我们像搭积木一样拼接小函数成大逻辑：

\`\`\`java
Function<Integer, Integer> f = x -> x + 1;
Function<Integer, Integer> g = x -> x * 2;
Function<Integer, Integer> fg = f.andThen(g); // 先 f 后 g：(x+1)*2
\`\`\`

### 闭包（Closure）

Lambda 可以访问它**外部作用域**的变量，这种能力叫**闭包**。被捕获的局部变量必须是 **effectively final**（即事实上不可变，即使没写 \`final\`）。这是为了保证线程安全——如果变量可变，多线程下 Lambda 捕获的"快照"会不一致。

\`\`\`java
int base = 100; // effectively final
Function<Integer, Integer> adder = x -> x + base; // 闭包捕获 base
\`\`\`

### Lambda 的优势

1. **简洁**：消除匿名内部类的样板代码。
2. **行为参数化**：把"做什么"作为参数传递，灵活组合。
3. **与 Stream 配合**：是 Stream API 的基石（\`map\`、\`filter\` 都接收函数式接口）。

### 小结

Lambda + 函数式接口是 Java 8 最重要的现代化特性之一，它彻底改变了 Java 的编程风格。掌握 \`Function\`/\`Consumer\`/\`Supplier\`/\`Predicate\` 四大接口和方法引用，是学习 Stream API 的前置条件。下方代码演示了 Lambda 语法、方法引用、四大函数式接口、函数组合和闭包。`,
    code: `// ============================================================
// 第 14 章：Lambda 与函数式编程演示
// ============================================================
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;

// 自定义函数式接口：只有一个抽象方法
@FunctionalInterface
interface MathOperation {
    int operate(int a, int b);
}

public class Main {
    public static void main(String[] args) {
        // 1. Lambda 基本语法
        MathOperation add = (a, b) -> a + b;
        MathOperation sub = (a, b) -> a - b;
        MathOperation mul = (a, b) -> a * b;
        System.out.println("加法: " + add.operate(10, 5));
        System.out.println("减法: " + sub.operate(10, 5));
        System.out.println("乘法: " + mul.operate(10, 5));

        // 2. 方法引用 ::
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
        System.out.println("--- 方法引用遍历 ---");
        names.forEach(System.out::println);

        // 3. Function<T, R>：接收 T 返回 R，可用 andThen 组合
        Function<String, Integer> strToInt = Integer::parseInt;
        Function<Integer, String> intToStr = x -> "数字是 " + x;
        Function<String, String> pipeline = strToInt.andThen(intToStr);
        System.out.println("Function 组合: " + pipeline.apply("42"));

        // 4. Consumer<T>：接收 T 无返回（消费），支持 andThen 链式
        Consumer<String> printer = s -> System.out.println("消费: " + s);
        printer.accept("Hello Lambda");
        Consumer<String> upper = s -> System.out.println("大写: " + s.toUpperCase());
        printer.andThen(upper).accept("world");

        // 5. Supplier<T>：无参返回 T（生产）
        Supplier<Double> randomSupplier = Math::random;
        System.out.println("Supplier 产生随机数: " + randomSupplier.get());

        // 6. Predicate<T>：接收 T 返回 boolean（断言），支持 and/or/negate
        Predicate<Integer> isEven = n -> n % 2 == 0;
        Predicate<Integer> isPositive = n -> n > 0;
        Predicate<Integer> isPositiveEven = isPositive.and(isEven);
        System.out.println("4 是否为正偶数: " + isPositiveEven.test(4));
        System.out.println("-2 是否为正偶数: " + isPositiveEven.test(-2));
        System.out.println("3 是否为奇数: " + isEven.negate().test(3));

        // 7. 闭包：Lambda 捕获外部变量（必须 effectively final）
        int base = 100; // effectively final
        Function<Integer, Integer> adder = x -> x + base;
        System.out.println("闭包加法 100+23: " + adder.apply(23));

        // 8. 综合应用：用 Lambda 过滤并处理列表
        List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5, 6);
        List<Integer> result = new ArrayList<>();
        nums.stream()
            .filter(isEven)
            .map(n -> n * n)
            .forEach(result::add);
        System.out.println("偶数的平方: " + result);
    }
}`,
  },

  // =========================================================
  // 第十五章：Stream API
  // =========================================================
  {
    id: "java-stream",
    group: "进阶",
    icon: "🌊",
    title: "Stream API",
    content: `## Stream API：声明式的集合处理流水线

**Stream API** 是 Java 8 引入的集合处理利器，它让你用**声明式**（描述"要什么"而不是"怎么做"）的方式处理数据。一个 Stream 是一条**处理流水线**：数据从源头流入，经过若干**中间操作**加工，最后由一个**终端操作**触发真正执行并产出结果。Stream 不是数据结构，也不存储数据，它更像一个"管道"。

### Stream 的三步走

1. **创建**：从集合、数组、值或生成函数得到一个 Stream。
2. **中间操作**：\`filter\`、\`map\`、\`sorted\`、\`flatMap\` 等，返回新 Stream，可以链式调用。它们是**惰性**的——在终端操作触发前不会执行。
3. **终端操作**：\`collect\`、\`forEach\`、\`reduce\`、\`count\` 等，触发整条流水线执行，产出结果。一个 Stream 只能消费一次。

### 创建 Stream 的常见方式

\`\`\`java
List<Integer> list = Arrays.asList(1, 2, 3);
Stream<Integer> s1 = list.stream();              // 从集合
Stream<Integer> s2 = Stream.of(1, 2, 3);         // 直接给定值
Stream<Integer> s3 = Stream.generate(() -> 0).limit(3); // 生成
\`\`\`

### 中间操作

| 操作 | 作用 | 示例 |
| --- | --- | --- |
| \`filter\` | 过滤 | \`.filter(n -> n > 0)\` |
| \`map\` | 一对一映射 | \`.map(String::length)\` |
| \`flatMap\` | 一对多扁平化 | \`.flatMap(List::stream)\` |
| \`sorted\` | 排序 | \`.sorted()\` / \`.sorted(comparator)\` |
| \`distinct\` | 去重 | \`.distinct()\` |
| \`limit\` / \`skip\` | 截取/跳过 | \`.limit(10)\` |

\`flatMap\` 是相对高级的操作：当每个元素本身又是一个集合时，它把所有子集合"拍平"成一个流。

### 终端操作

| 操作 | 作用 | 示例 |
| --- | --- | --- |
| \`collect\` | 收集成集合/Map | \`.collect(Collectors.toList())\` |
| \`reduce\` | 归约成单个值 | \`.reduce(0, Integer::sum)\` |
| \`count\` | 计数 | \`.count()\` |
| \`forEach\` | 遍历消费 | \`.forEach(System.out::println)\` |
| \`anyMatch\` / \`allMatch\` | 匹配判断 | \`.anyMatch(n -> n > 5)\` |

### Collectors 工具类

\`Collectors\` 提供丰富的收集器：\`toList\`、\`toSet\`、\`toMap\`、\`joining\`（字符串拼接）、\`groupingBy\`（分组）、\`partitioningBy\`（分区）、\`counting\`、\`summarizingInt\` 等。

\`\`\`java
// 按首字母分组
Map<Character, List<String>> g = words.stream().collect(Collectors.groupingBy(w -> w.charAt(0)));
// 拼接字符串
String s = list.stream().map(String::valueOf).collect(Collectors.joining(", "));
\`\`\`

### 并行流（parallelStream）

只需把 \`stream()\` 换成 \`parallelStream()\`，Stream 就会在内部用 \`ForkJoinPool\` **自动并行**处理。对于大数据量、计算密集的任务能显著提速。但要注意：并行不总是更快（有线程调度开销），且要求操作**无状态、无副作用**，否则结果不可预测。

### Optional：更安全的空值处理

\`Optional<T>\` 是一个容器对象，要么包含一个非空值，要么为空。它强迫你**显式处理"可能为空"的情况**，避免臭名昭著的 \`NullPointerException\`。常用方法：\`isPresent()\`、\`get()\`、\`orElse(默认值)\`、\`map()\`、\`filter()\`、\`ifPresent()\`。

\`\`\`java
Optional<String> opt = Optional.ofNullable(getName());
String name = opt.map(String::toUpperCase).orElse("UNKNOWN");
\`\`\`

### 小结

Stream API 把"对集合做各种变换"这件事从命令式的 for 循环解放出来，变成了可读性极高的**流水线声明**。配合 Lambda、方法引用和 Collectors，几行代码就能完成过滤、映射、分组、归约等复杂操作。下方代码演示了 filter/map/sorted/flatMap/reduce/collect/并行流以及 Optional 的综合用法。`,
    code: `// ============================================================
// 第 15 章：Stream API 与 Optional 演示
// ============================================================
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = Arrays.asList(5, 2, 8, 1, 9, 3, 7, 4, 6);

        // 1. 创建 Stream 的几种方式
        List<Integer> fromList = nums.stream().collect(Collectors.toList());
        List<Integer> fromOf = Stream.of(1, 2, 3).collect(Collectors.toList());
        List<Integer> fromGenerate = Stream.generate(() -> 0).limit(3).collect(Collectors.toList());
        System.out.println("集合创建: " + fromList);
        System.out.println("Stream.of 创建: " + fromOf);
        System.out.println("generate 创建: " + fromGenerate);

        // 2. filter 过滤：选出偶数
        List<Integer> evens = nums.stream()
            .filter(n -> n % 2 == 0)
            .collect(Collectors.toList());
        System.out.println("偶数: " + evens);

        // 3. map 映射：每个数乘以 10
        List<Integer> mapped = nums.stream()
            .map(n -> n * 10)
            .collect(Collectors.toList());
        System.out.println("乘以 10: " + mapped);

        // 4. sorted 排序（升序 / 降序）
        List<Integer> sorted = nums.stream().sorted().collect(Collectors.toList());
        List<Integer> desc = nums.stream().sorted((a, b) -> b - a).collect(Collectors.toList());
        System.out.println("升序排序: " + sorted);
        System.out.println("降序排序: " + desc);

        // 5. flatMap 扁平化：把嵌套列表拍平
        List<List<Integer>> nested = Arrays.asList(
            Arrays.asList(1, 2),
            Arrays.asList(3, 4),
            Arrays.asList(5, 6)
        );
        List<Integer> flat = nested.stream()
            .flatMap(List::stream)
            .collect(Collectors.toList());
        System.out.println("flatMap 扁平化: " + flat);

        // 6. reduce 归约
        int sum = nums.stream().reduce(0, Integer::sum);
        Optional<Integer> max = nums.stream().reduce(Integer::max);
        System.out.println("总和 reduce: " + sum);
        System.out.println("最大值 reduce: " + max.orElse(-1));

        // 7. count 统计
        long count = nums.stream().filter(n -> n > 4).count();
        System.out.println("大于 4 的个数: " + count);

        // 8. Collectors.groupingBy 分组
        List<String> words = Arrays.asList("apple", "bat", "cat", "ant", "banana");
        System.out.println("--- 按首字母分组 ---");
        System.out.println(words.stream().collect(Collectors.groupingBy(w -> w.charAt(0))));

        // 9. Collectors.joining 拼接字符串
        String joined = words.stream().collect(Collectors.joining(", ", "[", "]"));
        System.out.println("joining: " + joined);

        // 10. 并行流
        long parallelSum = nums.parallelStream().reduce(0, Integer::sum);
        System.out.println("并行流求和: " + parallelSum);

        // 11. Optional 的使用
        Optional<String> present = Optional.of("Java");
        Optional<String> empty = Optional.empty();
        System.out.println("--- Optional ---");
        System.out.println("是否存在: " + present.isPresent());
        System.out.println("获取值: " + present.get());
        System.out.println("默认值: " + empty.orElse("默认"));
        System.out.println("map 转换: " + present.map(String::toUpperCase).orElse("空"));

        // 12. 综合链式操作：大于 4 的偶数，排序后用 - 拼接
        String result = nums.stream()
            .filter(n -> n > 4)
            .filter(n -> n % 2 == 0)
            .sorted()
            .map(Object::toString)
            .collect(Collectors.joining("-"));
        System.out.println("综合链式操作: " + result);
    }
}`,
  },
];
