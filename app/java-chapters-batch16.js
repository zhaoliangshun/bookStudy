// =============================================================
// Java 交互式教程 —— 第十六批章节（I/O 与 NIO 组，共 15 章）
// =============================================================

export const chapters = [
  {
    id: "java-io-overview",
    group: "I/O 与 NIO",
    icon: "🌊",
    title: "I/O 流概览",
    content: `# I/O 流概览

Java I/O（Input/Output）是处理数据传输的基础 API，位于 \`java.io\` 包下。它以"流（Stream）"为核心抽象，将数据的读写统一为一系列方法调用，是文件操作、网络通信、序列化的底层基础。

## 流的分类

按**数据单位**划分：

- **字节流**：以 byte（8 位）为单位，可读写任意二进制数据。抽象基类：\`InputStream\` / \`OutputStream\`。
- **字符流**：以 char（16 位）为单位，专门处理文本，内部涉及字符编码。抽象基类：\`Reader\` / \`Writer\`。

按**流向**划分：

- **输入流**：把数据从数据源读入程序。
- **输出流**：把数据从程序写到目的地。

按**角色**划分：

- **节点流**：直接连接数据源/目的地，如 \`FileInputStream\`、\`ByteArrayInputStream\`、\`StringReader\`。
- **处理流**：包装在节点流之上，提供增强功能，如 \`BufferedInputStream\`、\`DataInputStream\`、\`PrintWriter\`。

## 装饰器模式

Java I/O 大量使用**装饰器模式**：处理流通过构造函数接收一个底层流，并在此基础上扩展功能，而不改变核心接口。

\`\`\`java
InputStream in = new BufferedInputStream(   // 处理流：缓冲
    new FileInputStream("a.txt"));          // 节点流：文件
\`\`\`

层层包装，每一层增加一种能力（缓冲、基本类型读写、对象序列化等）。这也是 I/O 类数量繁多的原因——通过组合而非继承实现灵活扩展。

## 字节流 vs 字符流

| 特性 | 字节流 | 字符流 |
|------|--------|--------|
| 单位 | byte（8 位） | char（16 位） |
| 适用 | 二进制（图片、视频、压缩包） | 文本 |
| 编码 | 不涉及编码转换 | 涉及字符编码 |
| 基类 | InputStream/OutputStream | Reader/Writer |
| 出现版本 | JDK 1.0 | JDK 1.1 |

## 关键约定

- 流使用后必须**关闭**，否则会泄漏系统资源。推荐 try-with-resources 自动关闭。
- 关闭外层处理流会**级联关闭**内层节点流。
- 读取到末尾时，\`read()\` 返回 -1（字节流读单字节为 int，字符流同理）。
- 字节流 \`read()\` 返回 0~255 的 int；写入时取低 8 位。

## 流的选择指南

- 读二进制文件 → \`FileInputStream\` + \`BufferedInputStream\`
- 读文本文件 → \`FileReader\` 或 \`InputStreamReader\` + \`BufferedReader\`
- 写日志 → \`PrintWriter\` / \`PrintStream\`
- 存储对象 → \`ObjectOutputStream\`
- 读写基本类型 → \`DataInputStream\` / \`DataOutputStream\`

下面通过代码演示 I/O 体系的整体结构：`,
    code: `// 演示 Java I/O 体系的整体结构（使用内存流，不依赖文件系统）
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 节点流：ByteArrayInputStream（内存字节流） =====
        byte[] src = "Hello, Java I/O".getBytes("UTF-8");
        InputStream nodeIn = new ByteArrayInputStream(src);
        // 逐字节读取
        int b;
        System.out.print("字节流读取: ");
        while ((b = nodeIn.read()) != -1) {
            System.out.print((char) b);
        }
        System.out.println();

        // ===== 处理流：DataInputStream 包装节点流 =====
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        DataOutputStream dos = new DataOutputStream(baos);
        dos.writeUTF("数据流");
        dos.writeInt(2024);
        dos.writeDouble(3.14);
        dos.flush();

        // 读取：DataInputStream 包装 ByteArrayInputStream
        DataInputStream dis = new DataInputStream(
            new ByteArrayInputStream(baos.toByteArray()));
        System.out.println("UTF: " + dis.readUTF());
        System.out.println("Int: " + dis.readInt());
        System.out.println("Double: " + dis.readDouble());

        // ===== 字符流：StringReader/StringWriter =====
        StringReader sr = new StringReader("字符流测试");
        StringWriter sw = new StringWriter();
        int ch;
        while ((ch = sr.read()) != -1) {
            sw.write(ch);
        }
        System.out.println("字符流复制: " + sw.toString());

        // ===== 装饰器模式：BufferedReader 包装 StringReader =====
        BufferedReader br = new BufferedReader(new StringReader("第一行\\n第二行"));
        String line;
        System.out.println("缓冲流按行读:");
        while ((line = br.readLine()) != null) {
            System.out.println("  -> " + line);
        }

        // ===== PrintStream 演示 =====
        PrintStream ps = new PrintStream(new ByteArrayOutputStream());
        ps.println("打印流输出");
        System.out.println("PrintStream 是 System.out 的类型: " + (System.out instanceof PrintStream));

        // ===== try-with-resources 自动关闭 =====
        try (InputStream in = new ByteArrayInputStream("自动关闭".getBytes("UTF-8"))) {
            System.out.println("try-with-resources 读取首字节: " + (char) in.read());
        } // 自动调用 close()
    }
}`
  },
  {
    id: "java-byte-streams",
    group: "I/O 与 NIO",
    icon: "📄",
    title: "字节流",
    content: `# 字节流

字节流以 **byte** 为单位读写数据，是 Java I/O 最底层的流。它适合处理所有类型的数据（文本、图片、视频、压缩包），不涉及任何字符编码转换。

## 顶层抽象类

\`\`\`java
public abstract class InputStream  { abstract int read(); ... }
public abstract class OutputStream { abstract void write(int b); ... }
\`\`\`

\`read()\` 返回 0~255 的 int（读到末尾返回 -1）；\`write(int b)\` 写入参数的低 8 位。

## 常用实现

| 类 | 说明 |
|----|------|
| \`FileInputStream\` / \`FileOutputStream\` | 读写文件 |
| \`ByteArrayInputStream\` / \`ByteArrayOutputStream\` | 读写内存字节数组 |
| \`FilterInputStream\` / \`FilterOutputStream\` | 处理流的基类 |
| \`BufferedInputStream\` / \`BufferedOutputStream\` | 缓冲 |
| \`DataInputStream\` / \`DataOutputStream\` | 基本类型读写 |
| \`ObjectInputStream\` / \`ObjectOutputStream\` | 对象序列化 |

## 核心方法

\`\`\`java
int read();                   // 读一个字节
int read(byte[] b);           // 读入数组，返回实际读到的字节数
int read(byte[] b, int off, int len); // 读入数组指定区间
void write(int b);            // 写一个字节
void write(byte[] b);         // 写整个数组
void write(byte[] b, int off, int len); // 写数组指定区间
void flush();                 // 刷新缓冲区
void close();                 // 关闭流
\`\`\`

## 批量读取 vs 单字节读取

单字节 \`read()\` 每次调用都触发一次底层 I/O，性能极差。**批量读取**（传入 byte\[\]）可显著减少 I/O 次数：

\`\`\`java
byte[] buf = new byte[1024];
int n;
while ((n = in.read(buf)) != -1) {
    out.write(buf, 0, n); // 只写实际读到的字节数
}
\`\`\`

注意 \`write(buf, 0, n)\` 中 \`n\` 是实际读取数，最后一次读取可能不足数组长度。

## ByteArrayOutputStream

\`ByteArrayOutputStream\` 是一个可变长的字节缓冲区，\`toByteArray()\` 取出全部数据，\`toString(charset)\` 转成字符串，常用于在内存中累积数据。

## 字节流读文本的注意事项

字节流读文本时不会自动解码，需手动指定字符集：

\`\`\`java
String s = new String(bytes, "UTF-8");
\`\`\`

否则会使用平台默认编码，导致乱码。处理文本优先用字符流。

下面通过内存流演示字节流的常用操作：`,
    code: `// 演示字节流的常用操作（使用内存流）
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 写入：ByteArrayOutputStream =====
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        // 写单个字节
        baos.write(72);  // 'H'
        baos.write(73);  // 'I'
        // 写字节数组
        baos.write(", 字节流".getBytes("UTF-8"));
        // 写数组的一部分
        byte[] part = "ABCDEF".getBytes("UTF-8");
        baos.write(part, 2, 3); // 写 CDE
        baos.flush();
        System.out.println("写入结果: " + baos.toString("UTF-8"));

        // ===== 读取：ByteArrayInputStream =====
        byte[] data = baos.toByteArray();
        ByteArrayInputStream bais = new ByteArrayInputStream(data);

        // 单字节读取
        System.out.print("单字节读取前2个: ");
        System.out.print((char) bais.read());
        System.out.println((char) bais.read());

        // 批量读取
        byte[] buf = new byte[8];
        int n = bais.read(buf);
        System.out.println("批量读取 " + n + " 字节: " + new String(buf, 0, n, "UTF-8"));

        // 继续读取剩余
        int total = 0;
        byte[] bigBuf = new byte[1024];
        while ((n = bais.read(bigBuf)) != -1) {
            total += n;
        }
        System.out.println("剩余字节总数: " + total);
        System.out.println("读取到末尾返回: " + bais.read()); // -1

        // ===== 复制流：经典模板 =====
        ByteArrayOutputStream copy = new ByteArrayOutputStream();
        bais = new ByteArrayInputStream(data); // 重置输入流
        byte[] buffer = new byte[4];
        int len;
        while ((len = bais.read(buffer)) != -1) {
            copy.write(buffer, 0, len); // 只写实际读到的
        }
        System.out.println("复制结果: " + copy.toString("UTF-8"));

        // ===== write(int b) 只写低 8 位 =====
        ByteArrayOutputStream test = new ByteArrayOutputStream();
        test.write(0x1FF); // 511 = 0x1FF，只写低 8 位 = 0xFF
        byte[] result = test.toByteArray();
        System.out.printf("write(511) 实际写入: 0x%02X (=%d)%n",
            result[0] & 0xFF, result[0] & 0xFF);

        // ===== available() 返回可读字节数 =====
        bais = new ByteArrayInputStream(data);
        System.out.println("available: " + bais.available());
    }
}`
  },
  {
    id: "java-char-streams",
    group: "I/O 与 NIO",
    icon: "🔤",
    title: "字符流",
    content: `# 字符流

字符流以 **char**（16 位 Unicode）为单位读写数据，专为处理文本设计。它在字节流之上增加了**字符编码/解码**能力，能正确处理中文等多字节字符。

## 顶层抽象类

\`\`\`java
public abstract class Reader  { abstract int read(); ... }
public abstract class Writer { abstract void write(char[] c, int off, int len); ... }
\`\`\`

\`read()\` 返回 0~65535 的 int（读到末尾返回 -1）。

## 常用实现

| 类 | 说明 |
|----|------|
| \`FileReader\` / \`FileWriter\` | 读写文件（使用默认编码） |
| \`StringReader\` / \`StringWriter\` | 读写字符串 |
| \`InputStreamReader\` / \`OutputStreamWriter\` | 字节流↔字符流桥梁，可指定编码 |
| \`BufferedReader\` / \`BufferedWriter\` | 缓冲，支持按行读写 |
| \`PrintWriter\` | 打印各种类型 |

## 桥梁流：InputStreamReader

\`InputStreamReader\` 是字节流到字符流的桥梁，构造时**必须指定字符集**：

\`\`\`java
Reader r = new InputStreamReader(
    new FileInputStream("a.txt"), StandardCharsets.UTF_8);
\`\`\`

\`FileReader\` 本质上是 \`InputStreamReader\` 的子类，但 JDK 11 前不支持指定编码，容易导致乱码。**推荐显式使用 \`InputStreamReader\`**。

## 字符编码

字符流内部维护一个解码器，将字节按指定编码转成 char。常见编码：

- **UTF-8**：变长 1~4 字节，兼容 ASCII，最通用。
- **UTF-16**：定长 2 或 4 字节，Java char 内部即 UTF-16。
- **GBK**：中文编码，2 字节表示一个汉字。
- **ISO-8859-1**：单字节，无法表示中文。

## 字符流 vs 字节流

| 场景 | 推荐 |
|------|------|
| 读文本 | 字符流（自动解码） |
| 读二进制 | 字节流 |
| 网络文本协议 | 字符流 + 缓冲 |
| 复制任意文件 | 字节流 |

## 核心方法

\`\`\`java
int read();                        // 读一个字符
int read(char[] cbuf);             // 读入字符数组
void write(String str);            // 写字符串（Writer 特有）
void write(int c);                 // 写一个字符
void flush();                      // 刷新缓冲
\`\`\`

## Writer 的 flush

\`BufferedWriter\` 等带缓冲的 Writer，数据先写入内存缓冲，必须 \`flush()\` 或 \`close()\` 才会真正写出。try-with-resources 关闭时会自动 flush。

下面通过 StringReader/StringWriter 演示字符流的常用操作：`,
    code: `// 演示字符流的常用操作（使用内存字符流）
import java.io.*;
import java.nio.charset.StandardCharsets;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== StringReader / StringWriter =====
        String text = "Java 字符流，处理中文很方便。\\n第二行内容。";
        StringReader sr = new StringReader(text);
        StringWriter sw = new StringWriter();

        // 逐字符读取并写出
        int ch;
        while ((ch = sr.read()) != -1) {
            sw.write(ch);
        }
        System.out.println("逐字符复制: " + sw.toString());

        // ===== 批量读取 char[] =====
        sr = new StringReader(text);
        char[] buf = new char[10];
        StringBuilder sb = new StringBuilder();
        int n;
        while ((n = sr.read(buf)) != -1) {
            sb.append(buf, 0, n); // 只追加实际读到的
        }
        System.out.println("批量读取: " + sb.toString());

        // ===== InputStreamReader：字节流 → 字符流 =====
        byte[] bytes = "UTF-8 编码的中文".getBytes(StandardCharsets.UTF_8);
        Reader isr = new InputStreamReader(
            new ByteArrayInputStream(bytes), StandardCharsets.UTF_8);
        char[] cbuf = new char[1024];
        int len = isr.read(cbuf);
        System.out.println("字节流转字符流: " + new String(cbuf, 0, len));

        // ===== OutputStreamWriter：字符流 → 字节流 =====
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Writer osw = new OutputStreamWriter(baos, StandardCharsets.UTF_8);
        osw.write("中文内容");
        osw.flush(); // 必须 flush
        byte[] out = baos.toByteArray();
        System.out.println("字符流转字节流字节数: " + out.length);
        System.out.println("还原: " + new String(out, StandardCharsets.UTF_8));

        // ===== Writer.write 的多种重载 =====
        StringWriter w = new StringWriter();
        w.write("字符串");
        w.write('，');
        w.write(new char[]{'字', '符', '数', '组'});
        w.write("部分字符串".toCharArray(), 2, 2); // 字符串
        w.append("追加"); // append 返回 Writer，可链式
        System.out.println("Writer 多种写法: " + w.toString());

        // ===== 编码不同导致字节数不同 =====
        String cn = "中文";
        System.out.println("UTF-8 字节数: " + cn.getBytes(StandardCharsets.UTF_8).length);   // 6
        System.out.println("UTF-16 字节数: " + cn.getBytes(StandardCharsets.UTF_16).length); // 6
        System.out.println("GBK 字节数: " + cn.getBytes("GBK").length);                      // 4
    }
}`
  },
  {
    id: "java-buffered-streams",
    group: "I/O 与 NIO",
    icon: "🛡️",
    title: "缓冲流",
    content: `# 缓冲流

缓冲流（Buffered Stream）是典型的**处理流**，在节点流外层套一层缓冲区，减少实际 I/O 次数，大幅提升读写性能。

## 工作原理

普通流每次 \`read()\`/\`write()\` 都直接操作底层资源（磁盘/网络），开销大。缓冲流内部维护一个**字节数组缓冲区**（默认 8KB）：

- **读取**：一次性从底层读满缓冲区，后续 \`read()\` 直接从内存数组取。
- **写入**：先写到内存缓冲区，缓冲区满或调用 \`flush()\` 时才真正写出。

## 四个缓冲流类

| 类 | 说明 |
|----|------|
| \`BufferedInputStream\` | 缓冲字节输入流 |
| \`BufferedOutputStream\` | 缓冲字节输出流 |
| \`BufferedReader\` | 缓冲字符输入流，支持 \`readLine()\` |
| \`BufferedWriter\` | 缓冲字符输出流，支持 \`newLine()\` |

## BufferedReader.readLine()

\`readLine()\` 一次读一行文本，返回不含换行符的 \`String\`，读到末尾返回 \`null\`：

\`\`\`java
BufferedReader br = new BufferedReader(new FileReader("a.txt"));
String line;
while ((line = br.readLine()) != null) {
    System.out.println(line);
}
\`\`\`

这是读文本的**最佳实践**，比逐字符读取快得多。

## BufferedWriter.newLine()

\`newLine()\` 写入平台相关的换行符（Windows 是 \`\\r\\n\`，Linux 是 \`\\n\`），比硬编码 \`\\n\` 更跨平台。

## 缓冲区大小

构造时可指定缓冲区大小：

\`\`\`java
new BufferedInputStream(in, 16 * 1024); // 16KB
\`\`\`

默认 8KB 对大多数场景足够。增大缓冲区能略微提升大文件读取性能，但收益递减。

## 性能对比

读取一个 1MB 文件：

- 单字节 \`read()\`：约 100 万次系统调用，极慢。
- 批量 \`read(byte[])\`：数百次调用，快。
- \`BufferedInputStream\`：自动批量，最快且最简洁。

## 注意事项

- **必须 flush 或 close**：缓冲区的数据不会自动写出。
- 关闭外层缓冲流会自动关闭内层节点流。
- \`BufferedOutputStream\` 的 \`flush()\` 会强制把缓冲区写到底层流。

## mark / reset

\`BufferedInputStream\` 支持 \`mark()\` / \`reset()\`，可在缓冲区范围内回退重新读：

\`\`\`java
in.mark(1024);  // 标记位置，允许回读 1024 字节
... 读取 ...
in.reset();     // 回到 mark 处
\`\`\`

下面通过内存流演示缓冲流的用法与性能优势：`,
    code: `// 演示缓冲流的用法与性能优势（使用内存流）
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 准备测试数据 =====
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10000; i++) {
            sb.append("第 ").append(i).append(" 行测试数据\\n");
        }
        byte[] data = sb.toString().getBytes("UTF-8");

        // ===== BufferedReader.readLine() 按行读 =====
        BufferedReader br = new BufferedReader(
            new InputStreamReader(new ByteArrayInputStream(data), "UTF-8"));
        String line;
        int lineCount = 0;
        while ((line = br.readLine()) != null) {
            lineCount++;
        }
        System.out.println("读取行数: " + lineCount);
        System.out.println("首行: " + br.toString().substring(0, 20) + "...");

        // 重新读首行
        br = new BufferedReader(
            new InputStreamReader(new ByteArrayInputStream(data), "UTF-8"));
        System.out.println("首行内容: " + br.readLine());

        // ===== BufferedWriter + StringWriter =====
        StringWriter sw = new StringWriter();
        BufferedWriter bw = new BufferedWriter(sw);
        bw.write("第一行");
        bw.newLine(); // 平台换行符
        bw.write("第二行");
        bw.newLine();
        bw.write("第三行");
        bw.flush(); // 必须 flush
        System.out.println("BufferedWriter 输出:");
        System.out.println(sw.toString());

        // ===== BufferedInputStream mark/reset =====
        BufferedInputStream bis = new BufferedInputStream(
            new ByteArrayInputStream("ABCDEF".getBytes("UTF-8")));
        System.out.print("读取: " + (char) bis.read());
        System.out.println((char) bis.read());
        bis.mark(100); // 标记当前位置
        System.out.println("标记后读: " + (char) bis.read() + (char) bis.read());
        bis.reset(); // 回到标记处
        System.out.println("reset 后重新读: " + (char) bis.read() + (char) bis.read());

        // ===== 性能对比：单字节读 vs 缓冲读 =====
        // 单字节读
        long t1 = System.nanoTime();
        InputStream raw = new ByteArrayInputStream(data);
        while (raw.read() != -1) { }
        long t2 = System.nanoTime();

        // 缓冲读（单字节调用，但内部批量）
        long t3 = System.nanoTime();
        BufferedInputStream bufIn = new BufferedInputStream(
            new ByteArrayInputStream(data));
        while (bufIn.read() != -1) { }
        long t4 = System.nanoTime();

        // 批量读
        long t5 = System.nanoTime();
        InputStream raw2 = new ByteArrayInputStream(data);
        byte[] buf = new byte[8192];
        while (raw2.read(buf) != -1) { }
        long t6 = System.nanoTime();

        System.out.println("单字节读: " + (t2 - t1) / 1_000_000 + " ms");
        System.out.println("缓冲单字节读: " + (t4 - t3) / 1_000_000 + " ms");
        System.out.println("批量读: " + (t6 - t5) / 1_000_000 + " ms");

        // ===== 自定义缓冲区大小 =====
        BufferedInputStream big = new BufferedInputStream(
            new ByteArrayInputStream(data), 64 * 1024); // 64KB
        System.out.println("大缓冲区读取首字节: " + big.read());
    }
}`
  },
  {
    id: "java-print-stream",
    group: "I/O 与 NIO",
    icon: "🖨️",
    title: "打印流",
    content: `# 打印流

打印流（PrintStream / PrintWriter）是唯一**不会抛出 IOException** 的流，专为方便输出而设计。它提供丰富的 \`print\` / \`println\` / \`printf\` 方法，是日常日志输出的首选。

## 两个类

| 类 | 说明 |
|----|------|
| \`PrintStream\` | 字节打印流，\`System.out\` 就是它的实例 |
| \`PrintWriter\` | 字符打印流，支持 Writer 和 OutputStream |

二者 API 几乎一致，区别在于 \`PrintStream\` 操作字节，\`PrintWriter\` 操作字符。**推荐使用 PrintWriter**，它能正确处理字符编码。

## 核心方法

\`\`\`java
void print(boolean b);     // 不换行
void println(String x);    // 输出后换行
void printf(String fmt, Object... args); // 格式化输出
void flush();              // 刷新
\`\`\`

\`println()\` 重载了所有基本类型和 Object，自动调用 \`String.valueOf()\`。

## System.out 与 System.err

\`System.out\` 和 \`System.err\` 都是 \`PrintStream\`：

\`\`\`java
System.out.println("标准输出");
System.err.println("错误输出"); // 通常显示为红色
\`\`\`

可通过 \`System.setOut(new PrintStream(...))\` 重定向输出。

## 自动刷新

构造时可开启**自动刷新**（autoFlush）：

\`\`\`java
new PrintWriter(new FileWriter("log.txt"), true); // true 开启自动刷新
\`\`\`

开启后，每次 \`println\` / \`printf\` / \`write(String)\` 都会自动调用 \`flush()\`。**注意 \`print()\` 不会触发自动刷新**。

## 异常吞没

打印流**不抛出 IOException**，内部错误通过 \`checkError()\` 检查：

\`\`\`java
PrintWriter pw = new PrintWriter(...);
pw.println(data);
if (pw.checkError()) { // 返回是否发生过错误
    // 处理错误
}
\`\`\`

这是为了在 \`System.out.println\` 时不必 try-catch，但也意味着**错误可能被静默吞没**，生产环境慎用。

## printf 格式化

\`printf\` 使用 \`Formatter\` 语法：

| 占位符 | 含义 |
|--------|------|
| \`%d\` | 整数 |
| \`%f\` | 浮点数 |
| \`%s\` | 字符串 |
| \`%n\` | 平台换行符 |
| \`%.2f\` | 保留 2 位小数 |
| \`%10d\` | 右对齐宽度 10 |
| \`%-10s\` | 左对齐宽度 10 |

下面通过代码演示打印流的各种用法：`,
    code: `// 演示打印流的常用操作
import java.io.*;
import java.util.Locale;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== PrintStream 基础 =====
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintStream ps = new PrintStream(baos, true, "UTF-8"); // 自动刷新

        // print / println 各种类型
        ps.print("字符串 ");
        ps.print(42);
        ps.print(' ');
        ps.print(3.14);
        ps.print(' ');
        ps.println(true);
        ps.println(new int[]{1, 2, 3}); // 调用 toString
        System.out.println("PrintStream 输出:");
        System.out.print(baos.toString("UTF-8"));

        // ===== printf 格式化 =====
        ByteArrayOutputStream baos2 = new ByteArrayOutputStream();
        PrintStream ps2 = new PrintStream(baos2, true, "UTF-8");
        ps2.printf("姓名: %s, 年龄: %d%n", "张三", 25);
        ps2.printf("价格: %.2f 元%n", 19.999);
        ps2.printf("右对齐: [%10d]%n", 42);
        ps2.printf("左对齐: [%-10d]%n", 42);
        ps2.printf("十六进制: 0x%x = 0X%X%n", 255, 255);
        ps2.printf("八进制: %o%n", 64);
        ps2.printf("千位分隔: %,d%n", 1234567890);
        ps2.printf("科学计数: %e%n", 123456.789);
        ps2.printf(Locale.US, "英文数字: %,.2f%n", 1234567.89);
        System.out.println("printf 格式化:");
        System.out.print(baos2.toString("UTF-8"));

        // ===== PrintWriter（字符打印流） =====
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw, true); // 自动刷新
        pw.println("PrintWriter 行1");
        pw.printf("格式化: %d + %d = %d%n", 1, 2, 3);
        pw.append("追加内容");
        System.out.println("PrintWriter 输出:");
        System.out.println(sw.toString());

        // ===== System.out 就是 PrintStream =====
        System.out.println("System.out 类型: " + System.out.getClass().getName());
        System.out.println("System.out 是 PrintStream: " + (System.out instanceof PrintStream));

        // ===== 重定向输出 =====
        PrintStream oldOut = System.out;
        ByteArrayOutputStream redirect = new ByteArrayOutputStream();
        System.setOut(new PrintStream(redirect, true, "UTF-8"));
        System.out.println("这行被重定向到内存");
        System.out.println("看不到这行在控制台");
        System.setOut(oldOut); // 恢复
        System.out.println("重定向捕获的内容: " + redirect.toString("UTF-8").replace("\\n", " | "));

        // ===== checkError 检查错误 =====
        // 故意对一个已关闭的流写入，触发错误
        StringWriter closed = new StringWriter();
        closed.close();
        PrintWriter pw2 = new PrintWriter(closed);
        pw2.println("写入已关闭的流");
        System.out.println("是否发生错误: " + pw2.checkError());

        // ===== println(Object) 自动 toString =====
        pw2 = new PrintWriter(new StringWriter());
        pw2.println(new Object() {
            @Override public String toString() { return "自定义对象"; }
        });
    }
}`
  },
  {
    id: "java-serialization",
    group: "I/O 与 NIO",
    icon: "💾",
    title: "对象序列化",
    content: `# 对象序列化

序列化（Serialization）是将对象转换为字节序列的过程，反序列化（Deserialization）则相反。Java 通过 \`Serializable\` 接口提供内置序列化机制。

## Serializable 接口

\`Serializable\` 是一个**标记接口**（无方法），实现它表示该类可被序列化：

\`\`\`java
public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    private String name;
    private int age;
}
\`\`\`

## serialVersionUID

每个可序列化类应有 \`serialVersionUID\` 字段，用于**版本控制**。反序列化时 JVM 会比对版本号，不一致则抛出 \`InvalidClassException\`。

- 显式声明：\`private static final long serialVersionUID = 1L;\`
- 不声明：编译器自动生成（基于类结构），**类改动后变化，导致旧数据无法反序列化**。

**强烈建议显式声明**。

## ObjectOutputStream / ObjectInputStream

\`\`\`java
// 序列化
ObjectOutputStream oos = new ObjectOutputStream(out);
oos.writeObject(user);

// 反序列化
ObjectInputStream ois = new ObjectInputStream(in);
User u = (User) ois.readObject();
\`\`\`

## transient 关键字

\`transient\` 修饰的字段**不会被序列化**，常用于敏感信息（密码）或可派生字段：

\`\`\`java
transient String password; // 不会被保存
\`\`\`

反序列化后，transient 字段为类型默认值（引用为 null，基本类型为 0）。

## 序列化陷阱

1. **静态字段不序列化**：static 属于类，不属于对象。
2. **引用对象必须也可序列化**：否则抛 \`NotSerializableException\`。
3. **循环引用**：序列化机制能处理，通过引用图跟踪。
4. **安全风险**：反序列化可执行任意代码（漏洞高发区），生产环境慎用 Java 原生序列化。
5. **单例破坏**：反序列化会创建新对象，破坏单例。可用 \`readResolve()\` 修复。

## 自定义序列化

实现 \`writeObject\` / \`readObject\` 私有方法可自定义序列化逻辑，或实现 \`Externalizable\` 接口完全控制：

\`\`\`java
private void writeObject(ObjectOutputStream oos) throws IOException {
    oos.defaultWriteObject(); // 默认逻辑
    oos.writeObject(encrypt(password)); // 自定义加密
}
\`\`\`

## 替代方案

Java 原生序列化效率低、不安全、跨语言差。现代项目多用 **JSON**（Jackson、Gson）、**Protobuf**、**Kryo** 等。

下面通过内存流演示序列化的完整流程：`,
    code: `// 演示对象序列化（使用内存流）
import java.io.*;

public class Main {
    // 可序列化类：必须实现 Serializable
    static class User implements Serializable {
        private static final long serialVersionUID = 1L;
        private String name;
        private int age;
        private transient String password; // 不序列化
        private static String company = "ACME"; // 静态不序列化

        public User(String name, int age, String password) {
            this.name = name;
            this.age = age;
            this.password = password;
        }

        @Override
        public String toString() {
            return "User{name='" + name + "', age=" + age +
                   ", password='" + password + "', company=" + company + "}";
        }
    }

    // 演示单例被序列化破坏
    static class Singleton implements Serializable {
        private static final long serialVersionUID = 1L;
        private static final Singleton INSTANCE = new Singleton();
        private Singleton() {}
        public static Singleton getInstance() { return INSTANCE; }

        // 修复单例破坏：返回已有实例
        private Object readResolve() {
            return INSTANCE;
        }
    }

    public static void main(String[] args) throws Exception {
        // ===== 序列化到内存 =====
        User user = new User("张三", 30, "secret123");
        System.out.println("原始对象: " + user);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(baos);
        oos.writeObject(user);
        oos.flush();
        byte[] bytes = baos.toByteArray();
        System.out.println("序列化字节数: " + bytes.length);

        // ===== 反序列化 =====
        ObjectInputStream ois = new ObjectInputStream(
            new ByteArrayInputStream(bytes));
        User restored = (User) ois.readObject();
        System.out.println("反序列化后: " + restored);
        System.out.println("password 字段为 null: " + (restored.password == null));

        // ===== 序列化多个对象 =====
        ByteArrayOutputStream baos2 = new ByteArrayOutputStream();
        ObjectOutputStream oos2 = new ObjectOutputStream(baos2);
        oos2.writeObject(new User("甲", 10, "p1"));
        oos2.writeObject(new User("乙", 20, "p2"));
        oos2.writeObject(null); // 写入 null 作为结束标记
        oos2.flush();

        ObjectInputStream ois2 = new ObjectInputStream(
            new ByteArrayInputStream(baos2.toByteArray()));
        Object obj;
        int count = 0;
        while ((obj = ois2.readObject()) != null) {
            count++;
            System.out.println("对象 " + count + ": " + obj);
        }
        System.out.println("共读取 " + count + " 个对象");

        // ===== 引用共享：同一对象序列化两次只存一份 =====
        ByteArrayOutputStream baos3 = new ByteArrayOutputStream();
        ObjectOutputStream oos3 = new ObjectOutputStream(baos3);
        User shared = new User("共享", 1, "x");
        oos3.writeObject(shared);
        oos3.writeObject(shared); // 同一引用
        oos3.flush();
        ObjectInputStream ois3 = new ObjectInputStream(
            new ByteArrayInputStream(baos3.toByteArray()));
        User u1 = (User) ois3.readObject();
        User u2 = (User) ois3.readObject();
        System.out.println("两次反序列化是否同一对象: " + (u1 == u2));

        // ===== 单例破坏与修复 =====
        ByteArrayOutputStream baos4 = new ByteArrayOutputStream();
        new ObjectOutputStream(baos4).writeObject(Singleton.getInstance());
        ObjectInputStream ois4 = new ObjectInputStream(
            new ByteArrayInputStream(baos4.toByteArray()));
        Singleton s = (Singleton) ois4.readObject();
        System.out.println("反序列化后仍是同一单例: " + (s == Singleton.getInstance()));
    }
}`
  },
  {
    id: "java-data-stream",
    group: "I/O 与 NIO",
    icon: "📊",
    title: "DataInputStream/DataOutputStream",
    content: `# DataInputStream / DataOutputStream

\`DataInputStream\` 和 \`DataOutputStream\` 是处理流，用于读写 **Java 基本类型**和 **UTF 字符串**，保证数据在二进制层面的精确性。

## 适用场景

当你需要把 int、double、boolean 等基本类型以**二进制格式**写入流，并精确读回时使用。常用于：

- 自定义二进制文件格式
- 网络协议的数据包
- 高效存储数值数据（比文本省空间）

## 核心方法

\`\`\`java
// DataOutputStream 写入
void writeInt(int v);        // 4 字节
void writeLong(long v);      // 8 字节
void writeDouble(double v);  // 8 字节
void writeBoolean(boolean v);// 1 字节
void writeChar(int v);       // 2 字节
void writeByte(int v);       // 1 字节
void writeShort(int v);      // 2 字节
void writeFloat(float v);    // 4 字节
void writeUTF(String s);     // 变长 UTF-8 编码

// DataInputStream 读取（必须与写入顺序一致）
int readInt();
long readLong();
double readDouble();
boolean readBoolean();
String readUTF();
\`\`\`

## writeUTF 不是标准 UTF-8

\`writeUTF\` 使用的是 Java 专有的** modified UTF-8**：前 2 字节是长度，且 \`\\u0000\` 用 2 字节编码，与标准 UTF-8 不兼容。只能用 \`readUTF\` 配对读取。

## 读写顺序必须一致

Data 流是**顺序读写**，读取顺序必须与写入顺序完全一致，否则数据错乱：

\`\`\`java
dos.writeInt(100);
dos.writeUTF("hello");
dos.writeDouble(3.14);
// 读取时必须：readInt → readUTF → readDouble
\`\`\`

## 字节序

Data 流使用**大端序（Big-Endian）**，高位字节在前。这与网络字节序一致，但与 x86 CPU（小端）相反。

## 与字节流配合

Data 流通常包装在缓冲流外：

\`\`\`java
DataOutputStream dos = new DataOutputStream(
    new BufferedOutputStream(new FileOutputStream("data.bin")));
\`\`\`

## 读取到末尾

\`readInt()\` 等方法在读到流末尾时抛出 \`EOFException\`（而非返回 -1），可用此异常判断结束：

\`\`\`java
try {
    while (true) {
        int v = dis.readInt();
    }
} catch (EOFException e) {
    // 读完了
}
\`\`\`

下面通过内存流演示 Data 流的读写：`,
    code: `// 演示 DataInputStream / DataOutputStream 的读写
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 写入基本类型 =====
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        DataOutputStream dos = new DataOutputStream(baos);

        dos.writeInt(2024);
        dos.writeLong(9999999999L);
        dos.writeDouble(3.141592653589793);
        dos.writeFloat(2.71828f);
        dos.writeBoolean(true);
        dos.writeByte(0xFF);
        dos.writeShort(32000);
        dos.writeChar('中');
        dos.writeUTF("Java Data 流");
        dos.writeChars("AB"); // 每个字符 2 字节，无长度前缀
        dos.flush();

        byte[] data = baos.toByteArray();
        System.out.println("写入总字节数: " + data.length);

        // ===== 按相同顺序读取 =====
        DataInputStream dis = new DataInputStream(new ByteArrayInputStream(data));
        System.out.println("int: " + dis.readInt());
        System.out.println("long: " + dis.readLong());
        System.out.println("double: " + dis.readDouble());
        System.out.println("float: " + dis.readFloat());
        System.out.println("boolean: " + dis.readBoolean());
        System.out.println("byte: " + (dis.readByte() & 0xFF));
        System.out.println("short: " + dis.readShort());
        System.out.println("char: " + dis.readChar());
        System.out.println("UTF: " + dis.readUTF());
        System.out.println("chars: " + dis.readChar() + dis.readChar());

        // ===== 大端序演示 =====
        ByteArrayOutputStream baos2 = new ByteArrayOutputStream();
        DataOutputStream dos2 = new DataOutputStream(baos2);
        dos2.writeInt(0x12345678);
        byte[] bytes = baos2.toByteArray();
        System.out.print("0x12345678 的字节序: ");
        for (byte b : bytes) {
            System.out.printf("%02X ", b & 0xFF);
        }
        System.out.println("(大端序)");

        // ===== 批量读写：用 EOFException 判断结束 =====
        ByteArrayOutputStream baos3 = new ByteArrayOutputStream();
        DataOutputStream dos3 = new DataOutputStream(baos3);
        int[] nums = {10, 20, 30, 40, 50};
        for (int n : nums) {
            dos3.writeInt(n);
        }
        dos3.flush();

        DataInputStream dis3 = new DataInputStream(
            new ByteArrayInputStream(baos3.toByteArray()));
        int sum = 0, count = 0;
        try {
            while (true) {
                sum += dis3.readInt();
                count++;
            }
        } catch (EOFException e) {
            System.out.println("读取 " + count + " 个 int，总和: " + sum);
        }

        // ===== writeUTF 与标准 UTF-8 的区别 =====
        String s = "A";
        System.out.println("标准 UTF-8 字节: " + s.getBytes("UTF-8").length); // 1
        ByteArrayOutputStream utf = new ByteArrayOutputStream();
        new DataOutputStream(utf).writeUTF(s);
        System.out.println("writeUTF 字节: " + utf.size()); // 3（2字节长度 + 1字节A）

        // ===== 读写循环：批量写入后批量读回 =====
        ByteArrayOutputStream baos4 = new ByteArrayOutputStream();
        DataOutputStream dos4 = new DataOutputStream(baos4);
        String[] names = {"张三", "李四", "王五"};
        for (String name : names) {
            dos4.writeUTF(name);
        }
        dos4.flush();
        DataInputStream dis4 = new DataInputStream(
            new ByteArrayInputStream(baos4.toByteArray()));
        System.out.print("读回名字: ");
        for (int i = 0; i < names.length; i++) {
            System.out.print(dis4.readUTF() + " ");
        }
        System.out.println();
    }
}`
  },
  {
    id: "java-random-access",
    group: "I/O 与 NIO",
    icon: "🎲",
    title: "RandomAccessFile",
    content: `# RandomAccessFile

\`RandomAccessFile\` 支持在文件任意位置读写，不像普通流只能顺序读写。它通过**文件指针**定位，是断点续传、索引文件、数据库实现的基础。

## 构造与模式

\`\`\`java
RandomAccessFile raf = new RandomAccessFile("data.dat", "rw");
\`\`\`

模式参数：

| 模式 | 说明 |
|------|------|
| \`r\` | 只读，文件必须存在 |
| \`rw\` | 读写，文件不存在则创建 |
| \`rws\` | 读写，每次写入同步刷盘（内容+元数据） |
| \`rwd\` | 读写，每次写入同步刷盘（仅内容） |

## 文件指针

RandomAccessFile 内部维护一个 **文件指针**，记录当前读写位置：

\`\`\`java
long getFilePointer();  // 获取当前位置
void seek(long pos);    // 跳转到指定位置
long length();          // 文件总长度
int skipBytes(int n);   // 向前跳 n 字节
\`\`\`

每次读写后，指针自动后移。读取 4 字节 int 后指针 +4。

## 读写方法

支持与 DataInput/DataOutput 相同的方法：

\`\`\`java
int readInt();          // 读 4 字节 int
void writeInt(int v);   // 写 4 字节 int
String readUTF();
void writeUTF(String s);
// ... readLong/writeLong/readDouble 等
\`\`\`

## 典型应用

1. **断点续传**：记录已下载位置，\`seek\` 到该位置继续写。
2. **索引文件**：固定长度记录，通过 \`seek(index * recordSize)\` 随机访问。
3. **数据库存储**：B+ 树节点定位。
4. **文件分割/合并**：分段读写。

## 修改文件中间内容

\`seek\` 到中间位置写入会**覆盖**原有字节，不会插入或删除。若要插入，需手动移动后续数据：

\`\`\`java
// 在 pos 处插入数据：先读取 pos 之后所有内容，写入新数据，再追加原内容
\`\`\`

## 与 NIO 的关系

JDK 1.4+ 的 NIO \`FileChannel\` 提供了类似能力且性能更好，\`RandomAccessFile.getChannel()\` 可获取 Channel。新项目优先考虑 NIO。

## 注意事项

- \`seek\` 频繁跳转会降低性能，适合定位次数少、读写量大的场景。
- \`rws\` / \`rwd\` 模式性能较差，仅在数据安全要求高时使用。
- 关闭流后文件指针失效。

下面用内存模拟随机访问的核心概念：`,
    code: `// 用内存模拟 RandomAccessFile 的随机访问概念
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 用 ByteArrayOutputStream 模拟可定位的文件 =====
        // RandomAccessFile 真实使用：new RandomAccessFile("data.dat", "rw")
        // 这里用内存流演示概念

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        DataOutputStream dos = new DataOutputStream(baos);

        // 写入 5 条定长记录：每条 = 4字节int + 8字节long = 12字节
        int[] ids = {1001, 1002, 1003, 1004, 1005};
        long[] values = {111L, 222L, 333L, 444L, 555L};
        for (int i = 0; i < ids.length; i++) {
            dos.writeInt(ids[i]);
            dos.writeLong(values[i]);
        }
        dos.flush();
        byte[] data = baos.toByteArray();
        System.out.println("文件总长度: " + data.length + " 字节");
        System.out.println("每条记录: 12 字节，共 5 条");

        // ===== 模拟 seek 读取第 3 条记录（索引 2） =====
        int recordSize = 12;
        int targetIndex = 2;
        int targetPos = targetIndex * recordSize; // seek 位置

        ByteArrayInputStream bais = new ByteArrayInputStream(data);
        long skipped = bais.skip(targetPos); // 模拟 seek
        System.out.println("跳过 " + skipped + " 字节（模拟 seek 到 " + targetPos + "）");

        DataInputStream dis = new DataInputStream(bais);
        int id = dis.readInt();
        long value = dis.readLong();
        System.out.println("第 " + targetIndex + " 条记录: id=" + id + ", value=" + value);

        // ===== 模拟修改某条记录（覆盖写） =====
        // 在真实 RandomAccessFile 中：raf.seek(pos); raf.writeInt(newId);
        int modifyIndex = 1;
        int modifyPos = modifyIndex * recordSize;
        int newId = 9999;
        long newValue = 8888L;

        // 用字节数组手动覆盖
        ByteArrayOutputStream temp = new ByteArrayOutputStream();
        DataOutputStream tempDos = new DataOutputStream(temp);
        tempDos.writeInt(newId);
        tempDos.writeLong(newValue);
        byte[] newRecord = temp.toByteArray();

        // 复制原数组并覆盖指定区间
        byte[] modified = data.clone();
        System.arraycopy(newRecord, 0, modified, modifyPos, recordSize);
        System.out.println("修改第 " + modifyIndex + " 条记录后，重新读取:");
        ByteArrayInputStream bais2 = new ByteArrayInputStream(modified);
        bais2.skip(modifyPos);
        DataInputStream dis2 = new DataInputStream(bais2);
        System.out.println("  id=" + dis2.readInt() + ", value=" + dis2.readLong());

        // ===== 模拟追加写入 =====
        // 真实：raf.seek(raf.length()); raf.writeInt(...);
        ByteArrayOutputStream appended = new ByteArrayOutputStream();
        appended.write(modified);
        DataOutputStream appDos = new DataOutputStream(appended);
        appDos.writeInt(1006);
        appDos.writeLong(666L);
        System.out.println("追加后总长度: " + appended.size() + " 字节（" +
            appended.size() / recordSize + " 条记录）");

        // ===== 读取所有记录 =====
        ByteArrayInputStream all = new ByteArrayInputStream(appended.toByteArray());
        DataInputStream allDis = new DataInputStream(all);
        System.out.println("所有记录:");
        int recordCount = appended.size() / recordSize;
        for (int i = 0; i < recordCount; i++) {
            System.out.println("  [" + i + "] id=" + allDis.readInt() +
                ", value=" + allDis.readLong());
        }

        // ===== 演示 getFilePointer 概念 =====
        System.out.println("读取过程中位置变化:");
        ByteArrayInputStream ptr = new ByteArrayInputStream(data);
        DataInputStream ptrDis = new DataInputStream(ptr);
        System.out.println("  初始位置: 0");
        ptrDis.readInt();
        System.out.println("  读 int 后: 4");
        ptrDis.readLong();
        System.out.println("  读 long 后: 12");
    }
}`
  },
  {
    id: "java-file-class",
    group: "I/O 与 NIO",
    icon: "📁",
    title: "File 类",
    content: `# File 类

\`java.io.File\` 表示文件或目录的**路径抽象**，可查询属性、创建/删除文件、遍历目录，但不能读写文件内容。

## 构造方法

\`\`\`java
new File("a.txt");              // 相对路径
new File("/tmp", "a.txt");      // 父目录 + 子路径
new File(new File("/tmp"), "a.txt");
\`\`\`

路径分隔符跨平台不同，建议用 \`File.separator\`（Windows 是 \`\\\`，Linux 是 \`/\`）。

## 路径查询

\`\`\`java
String getName();        // 文件名
String getParent();      // 父目录
String getPath();        // 路径字符串
String getAbsolutePath();// 绝对路径
String getCanonicalPath();// 规范化绝对路径（解算 . 和 ..）
\`\`\`

\`getCanonicalPath()\` 会解析 \`.\` 和 \`..\`，是最规范的路径表示。

## 存在性与类型

\`\`\`java
boolean exists();        // 是否存在
boolean isFile();        // 是否是文件
boolean isDirectory();   // 是否是目录
boolean isHidden();      // 是否隐藏
\`\`\`

## 文件属性

\`\`\`java
long length();           // 文件大小（字节）
long lastModified();     // 最后修改时间（毫秒）
boolean canRead();       // 可读
boolean canWrite();      // 可写
boolean canExecute();    // 可执行
\`\`\`

## 创建与删除

\`\`\`java
boolean createNewFile(); // 创建空文件
boolean mkdir();         // 创建一级目录
boolean mkdirs();        // 创建多级目录
boolean delete();        // 删除文件或空目录
\`\`\`

\`mkdirs()\` 会创建所有不存在的父目录，是最常用的建目录方法。

## 目录遍历

\`\`\`java
String[] list();                 // 列出子文件名
String[] list(FilenameFilter);   // 过滤
File[] listFiles();              // 列出 File 对象
File[] listFiles(FileFilter);    // 过滤
\`\`\`

## 递归遍历

遍历目录树是常见操作：

\`\`\`java
void listAll(File dir) {
    File[] files = dir.listFiles();
    if (files != null) {
        for (File f : files) {
            if (f.isDirectory()) listAll(f); // 递归
            else System.out.println(f);
        }
    }
}
\`\`\`

## File 的局限

- 方法返回 boolean 而非抛异常，**失败原因不明**。
- \`rename\` 跨文件系统不可靠。
- 无法获取文件所有者、权限详情（需 NIO）。

JDK 7+ 推荐用 \`java.nio.file.Path\` + \`Files\` 替代 File，API 更完善。

下面演示 File 类的路径操作（不实际写盘）：`,
    code: `// 演示 File 类的路径操作（仅路径抽象，不实际写盘）
import java.io.File;

public class Main {
    public static void main(String[] args) {
        // ===== 路径构造 =====
        File f1 = new File("docs/guide/readme.md");
        File f2 = new File("/home", "user/file.txt");
        File f3 = new File(new File("/var/log"), "app.log");

        System.out.println("=== 路径信息 ===");
        System.out.println("f1.getName(): " + f1.getName());
        System.out.println("f1.getParent(): " + f1.getParent());
        System.out.println("f1.getPath(): " + f1.getPath());
        System.out.println("f1.getAbsolutePath(): " + f1.getAbsolutePath());

        // ===== 跨平台分隔符 =====
        System.out.println("\\n=== 分隔符 ===");
        System.out.println("separator: " + File.separator);
        System.out.println("pathSeparator: " + File.pathSeparator);
        // 推荐写法
        File cross = new File("data" + File.separator + "file.db");
        System.out.println("跨平台路径: " + cross.getPath());

        // ===== 相对路径与绝对路径 =====
        File rel = new File("./test/../data/./file.txt");
        File abs = new File("/var/./log/../tmp/file.txt");
        System.out.println("\\n=== 路径规范化 ===");
        System.out.println("相对 getPath: " + rel.getPath());
        System.out.println("相对 getAbsolutePath: " + rel.getAbsolutePath());
        // getCanonicalPath 会解析 . 和 ..
        try {
            System.out.println("rel 规范化: " + rel.getCanonicalPath());
            System.out.println("abs 规范化: " + abs.getCanonicalPath());
        } catch (Exception e) {
            System.out.println("规范化失败: " + e.getMessage());
        }

        // ===== exists / isFile / isDirectory =====
        System.out.println("\\n=== 存在性检查 ===");
        File fake = new File("nonexistent/file.txt");
        System.out.println("fake.exists(): " + fake.exists());
        System.out.println("fake.isFile(): " + fake.isFile());
        System.out.println("fake.isDirectory(): " + fake.isDirectory());

        // ===== listFiles 模拟（对不存在的目录返回 null） =====
        File emptyDir = new File("/this/does/not/exist");
        File[] children = emptyDir.listFiles();
        System.out.println("\\n=== 目录遍历 ===");
        System.out.println("不存在目录 listFiles: " + (children == null ? "null" : children.length));

        // ===== FileFilter / FilenameFilter 过滤 =====
        File dir = new File("/tmp");
        File[] txtFiles = dir.listFiles((d, name) -> name.endsWith(".txt"));
        System.out.println("过滤 .txt 文件: " + (txtFiles == null ? "目录不存在" : txtFiles.length));

        File[] filtered = dir.listFiles(file -> file.isFile() && file.length() > 1024);
        System.out.println("大于1KB的文件: " + (filtered == null ? "目录不存在" : filtered.length));

        // ===== 递归遍历目录树（模拟） =====
        System.out.println("\\n=== 递归遍历（模拟虚拟目录树） ===");
        // 由于沙箱无文件系统，用路径字符串模拟结构
        String[] mockTree = {
            "project/src/Main.java",
            "project/src/Util.java",
            "project/src/test/T1.java",
            "project/src/test/T2.java",
            "project/lib/a.jar",
            "project/README.md"
        };
        System.out.println("模拟项目文件列表:");
        for (String path : mockTree) {
            File file = new File(path);
            int depth = countSlash(path);
            for (int i = 0; i < depth; i++) System.out.print("  ");
            System.out.println(file.getName());
        }

        // ===== 临时文件目录与属性 =====
        System.out.println("\\n=== 系统属性 ===");
        System.out.println("java.io.tmpdir: " + System.getProperty("java.io.tmpdir"));
        System.out.println("user.dir: " + System.getProperty("user.dir"));
        System.out.println("user.home: " + System.getProperty("user.home"));
    }

    // 计算路径深度（用于缩进显示）
    static int countSlash(String path) {
        int count = 0;
        for (char c : path.toCharArray()) {
            if (c == '/' || c == '\\\\') count++;
        }
        return count;
    }
}`
  },
  {
    id: "java-nio-path",
    group: "I/O 与 NIO",
    icon: "🛤️",
    title: "Path 与 Paths",
    content: `# Path 与 Paths

\`java.nio.file.Path\` 是 JDK 7 引入的路径抽象，替代旧版 \`File\`。它功能更强、跨平台一致、与 \`Files\` 工具类配合，是现代 Java 文件操作的标准 API。

## 创建 Path

\`\`\`java
import java.nio.file.Path;
import java.nio.file.Paths;

Path p1 = Paths.get("a.txt");
Path p2 = Paths.get("/home", "user", "file.txt"); // 可变参数拼接
Path p3 = FileSystems.getDefault().getPath("/tmp/x");
\`\`\`

\`Paths.get()\` 是 \`FileSystems.getDefault().getPath()\` 的快捷方式。

## Path vs File

| 特性 | File | Path |
|------|------|------|
| 引入版本 | JDK 1.0 | JDK 7 |
| 方法返回 | boolean | 抛异常（信息明确） |
| 符号链接 | 不支持 | 支持 |
| 文件属性 | 基础 | 完整（属性视图） |
| 性能 | 较慢 | 较快 |
| 互转 | \`file.toPath()\` | \`path.toFile()\` |

## 路径信息查询

\`\`\`java
Path p = Paths.get("/home/user/docs/file.txt");

p.getFileName();     // file.txt
p.getParent();       // /home/user/docs
p.getRoot();         // /
p.getNameCount();    // 4（user/docs/file.txt 拆为4段，Windows 盘符算根）
p.getName(0);        // home
p.subpath(0, 2);     // home/user
p.isAbsolute();      // true
p.toAbsolutePath();  // 绝对路径
p.toUri();           // file:///home/user/docs/file.txt
\`\`\`

## 路径拼接 resolve

\`resolve\` 拼接路径，相当于 \`new File(parent, child)\`：

\`\`\`java
Path base = Paths.get("/home/user");
Path full = base.resolve("docs/file.txt"); // /home/user/docs/file.txt
\`\`\`

若参数是绝对路径，则直接返回该绝对路径：

\`\`\`java
base.resolve("/etc"); // 返回 /etc（覆盖 base）
\`\`\`

## 路径相对化 relativize

\`relativize\` 计算从一条路径到另一条路径的相对路径：

\`\`\`java
Path a = Paths.get("/home/user/docs");
Path b = Paths.get("/home/user/images");
a.relativize(b); // ../images
\`\`\`

要求两条路径都是绝对或都是相对。

## 规范化 normalize

\`normalize\` 消除冗余的 \`.\` 和 \`..\`：

\`\`\`java
Paths.get("/a/b/../c/./d").normalize(); // /a/c/d
\`\`\`

## 兄弟路径 resolveSibling

\`resolveSibling\` 替换文件名，常用于改后缀：

\`\`\`java
Path p = Paths.get("/data/file.txt");
p.resolveSibling("file.bak"); // /data/file.bak
\`\`\`

下面演示 Path 的各种操作：`,
    code: `// 演示 Path 与 Paths 的路径操作
import java.nio.file.*;
import java.io.File;

public class Main {
    public static void main(String[] args) {
        // ===== 创建 Path =====
        Path p1 = Paths.get("docs/guide/readme.md");
        Path p2 = Paths.get("home", "user", "file.txt"); // 可变参数拼接
        Path p3 = Paths.get("/var/log/app.log"); // 绝对路径

        System.out.println("=== 创建 Path ===");
        System.out.println("p1: " + p1);
        System.out.println("p2: " + p2);
        System.out.println("p3: " + p3);

        // ===== 路径信息查询 =====
        System.out.println("\\n=== p3 路径信息 ===");
        System.out.println("getFileName: " + p3.getFileName());
        System.out.println("getParent: " + p3.getParent());
        System.out.println("getRoot: " + p3.getRoot());
        System.out.println("getNameCount: " + p3.getNameCount());
        System.out.println("getName(0): " + p3.getName(0));
        System.out.println("getName(1): " + p3.getName(1));
        System.out.println("subpath(0, 2): " + p3.subpath(0, 2));
        System.out.println("isAbsolute: " + p3.isAbsolute());
        System.out.println("toAbsolutePath: " + p1.toAbsolutePath());
        System.out.println("toUri: " + p3.toUri());

        // ===== resolve 拼接路径 =====
        System.out.println("\\n=== resolve 拼接 ===");
        Path base = Paths.get("/home/user");
        System.out.println("resolve('docs/file.txt'): " + base.resolve("docs/file.txt"));
        System.out.println("resolve('docs').resolve('file.txt'): " +
            base.resolve("docs").resolve("file.txt"));
        // 绝对路径会覆盖
        System.out.println("resolve('/etc') 绝对路径覆盖: " + base.resolve("/etc"));
        // resolveSibling 替换同级文件
        Path file = Paths.get("/data/report.csv");
        System.out.println("resolveSibling('report.bak'): " + file.resolveSibling("report.bak"));

        // ===== relativize 相对路径 =====
        System.out.println("\\n=== relativize ===");
        Path a = Paths.get("/home/user/docs");
        Path b = Paths.get("/home/user/images");
        System.out.println("docs -> images: " + a.relativize(b));
        System.out.println("images -> docs: " + b.relativize(a));
        Path c = Paths.get("/home/user/docs/a.txt");
        Path d = Paths.get("/home/user/docs/sub/b.txt");
        System.out.println("a.txt -> b.txt: " + c.relativize(d));

        // ===== normalize 规范化 =====
        System.out.println("\\n=== normalize ===");
        Path messy = Paths.get("/a/b/../c/./d/../e");
        System.out.println("原始: " + messy);
        System.out.println("规范化: " + messy.normalize());
        Path withDot = Paths.get("./config/./settings.properties");
        System.out.println("原始: " + withDot);
        System.out.println("规范化: " + withDot.normalize());

        // ===== Path 与 File 互转 =====
        System.out.println("\\n=== Path ↔ File 互转 ===");
        Path path = Paths.get("/tmp/test.txt");
        File fileObj = path.toFile(); // Path → File
        System.out.println("Path → File: " + fileObj);
        Path back = fileObj.toPath(); // File → Path
        System.out.println("File → Path: " + back);
        System.out.println("互转后相等: " + path.equals(back));

        // ===== startsWith / endsWith =====
        System.out.println("\\n=== 前缀后缀匹配 ===");
        Path p = Paths.get("/home/user/docs/readme.md");
        System.out.println("startsWith('/home'): " + p.startsWith("/home"));
        System.out.println("startsWith('/home/user'): " + p.startsWith("/home/user"));
        System.out.println("endsWith('readme.md'): " + p.endsWith("readme.md"));
        System.out.println("endsWith('docs/readme.md'): " + p.endsWith("docs/readme.md"));

        // ===== 比较路径 =====
        System.out.println("\\n=== 比较 ===");
        Path x = Paths.get("/tmp/a.txt");
        Path y = Paths.get("/tmp/a.txt");
        Path z = Paths.get("/tmp/./a.txt");
        System.out.println("x.equals(y): " + x.equals(y)); // true
        System.out.println("x.equals(z.normalize()): " + x.equals(z.normalize())); // true
    }
}`
  },
  {
    id: "java-nio-files",
    group: "I/O 与 NIO",
    icon: "📂",
    title: "Files 工具类",
    content: `# Files 工具类

\`java.nio.file.Files\` 是与 \`Path\` 配套的工具类，提供大量静态方法操作文件和目录。相比传统 I/O，它**一行代码完成读写**，异常信息明确，是现代 Java 文件操作的核心。

## 一行读写文件

\`\`\`java
// 读取所有行（返回 List<String>）
List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);

// 读取所有字节
byte[] bytes = Files.readAllBytes(path);

// 写入字符串
Files.write(path, "内容".getBytes(StandardCharsets.UTF_8));

// 写入行（自动加换行）
Files.write(path, lines, StandardCharsets.UTF_8);
\`\`\`

注意：\`readAllLines\` 会把整个文件读入内存，**大文件用 \`Files.lines()\`** 返回 Stream 按行流式处理。

## 文件操作

\`\`\`java
Files.exists(path);              // 是否存在
Files.createFile(path);          // 创建空文件
Files.createDirectory(path);     // 创建目录（父目录必须存在）
Files.createDirectories(path);   // 创建多级目录
Files.copy(src, dst);            // 复制
Files.move(src, dst);            // 移动/重命名
Files.delete(path);              // 删除（不存在则抛异常）
Files.deleteIfExists(path);      // 删除（不存在则跳过）
\`\`\`

## 复制选项

\`copy\` 可带选项：

\`\`\`java
Files.copy(src, dst, StandardCopyOption.REPLACE_EXISTING); // 覆盖
Files.copy(src, dst, StandardCopyOption.COPY_ATTRIBUTES); // 复制属性
\`\`\`

## 文件属性

\`\`\`java
Files.size(path);                // 大小
Files.getLastModifiedTime(path); // 修改时间
Files.isReadable(path);
Files.isWritable(path);
Files.isHidden(path);
Files.isDirectory(path);
Files.isRegularFile(path);
\`\`\`

## 遍历目录

\`\`\`java
// list：列出一层（不递归）
try (Stream<Path> s = Files.list(dir)) {
    s.forEach(System.out::println);
}

// walk：递归遍历
try (Stream<Path> s = Files.walk(dir, maxDepth)) {
    s.filter(Files::isRegularFile).forEach(...);
}
\`\`\`

\`walk\` 返回的 Stream 必须用 try-with-resources 关闭。

## 与传统 I/O 对比

| 操作 | 传统 I/O | Files |
|------|----------|-------|
| 读文本 | FileReader + BufferedReader 多行 | \`Files.readAllLines\` 一行 |
| 写文本 | FileWriter 多行 | \`Files.write\` 一行 |
| 复制 | 自写循环 | \`Files.copy\` 一行 |
| 删除目录树 | 递归删除 | \`Files.walkFileTree\` |

## 新旧 API 互转

\`Path.toFile()\` 和 \`File.toPath()\` 可互相转换，便于渐进式迁移。

下面演示 Files API 的路径相关操作：`,
    code: `// 演示 Files 工具类的 API（路径操作为主，沙箱不实际写盘）
import java.nio.file.*;
import java.nio.file.attribute.*;
import java.io.IOException;
import java.util.*;
import java.nio.charset.StandardCharsets;

public class Main {
    public static void main(String[] args) throws IOException {
        // ===== 路径存在性检查 =====
        Path fake = Paths.get("/this/path/does/not/exist");
        System.out.println("=== 存在性 ===");
        System.out.println("exists: " + Files.exists(fake));
        System.out.println("notExists: " + Files.notExists(fake));
        System.out.println("isDirectory: " + Files.isDirectory(fake));
        System.out.println("isRegularFile: " + Files.isRegularFile(fake));

        // ===== 属性查询（对不存在路径返回 false / 抛异常） =====
        System.out.println("\\n=== 属性查询 ===");
        // isReadable / isWritable 对不存在路径返回 false
        System.out.println("isReadable: " + Files.isReadable(fake));
        System.out.println("isWritable: " + Files.isWritable(fake));
        System.out.println("isExecutable: " + Files.isExecutable(fake));
        System.out.println("isHidden: " + Files.isHidden(fake));

        // ===== 模拟读写：用 byte[] 演示 Files.write/readAllBytes 的数据流 =====
        // 真实代码：
        //   Files.write(path, bytes);
        //   byte[] data = Files.readAllBytes(path);
        // 这里演示等价的内存操作
        System.out.println("\\n=== 模拟 Files.write / readAllBytes ===");
        String content = "Hello, Files API\\n第二行\\n第三行";
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        System.out.println("写入字节数: " + bytes.length);

        // 模拟 readAllLines
        List<String> lines = Arrays.asList(content.split("\\\\n"));
        System.out.println("readAllLines 行数: " + lines.size());
        for (int i = 0; i < lines.size(); i++) {
            System.out.println("  [" + i + "] " + lines.get(i));
        }

        // ===== Files.copy 的选项 =====
        System.out.println("\\n=== 复制选项 ===");
        System.out.println("REPLACE_EXISTING: " + StandardCopyOption.REPLACE_EXISTING);
        System.out.println("COPY_ATTRIBUTES: " + StandardCopyOption.COPY_ATTRIBUTES);
        System.out.println("ATOMIC_MOVE: " + StandardCopyOption.ATOMIC_MOVE);

        // ===== Path 比较与工具方法 =====
        System.out.println("\\n=== 工具方法 ===");
        Path p1 = Paths.get("/tmp/a.txt");
        Path p2 = Paths.get("/tmp/b.txt");
        // 真实代码：Files.copy(p1, p2, StandardCopyOption.REPLACE_EXISTING)
        System.out.println("p1 vs p2: " + p1 + " != " + p2);

        // ===== 演示 Files.lines 的流式处理（模拟） =====
        System.out.println("\\n=== 模拟 Files.lines 流式处理 ===");
        // 真实代码：
        //   try (Stream<String> s = Files.lines(path)) {
        //       s.filter(line -> line.contains("Java")).forEach(System.out::println);
        //   }
        List<String> mockLines = Arrays.asList(
            "Java is great",
            "Python is simple",
            "Java has Streams",
            "Go is fast"
        );
        long javaCount = mockLines.stream()
            .filter(l -> l.contains("Java"))
            .count();
        System.out.println("含 Java 的行数: " + javaCount);
        mockLines.stream()
            .filter(l -> l.length() > 15)
            .forEach(l -> System.out.println("  长行: " + l));

        // ===== 模拟 walk 遍历目录树 =====
        System.out.println("\\n=== 模拟 Files.walk 遍历 ===");
        String[] mockTree = {
            "project/src/Main.java",
            "project/src/Util.java",
            "project/src/test/T1.java",
            "project/lib/a.jar",
            "project/README.md"
        };
        System.out.println("所有文件:");
        for (String path : mockTree) {
            Path filePath = Paths.get(path);
            System.out.println("  " + filePath + " (depth=" + filePath.getNameCount() + ")");
        }
        System.out.println(".java 文件:");
        for (String path : mockTree) {
            if (path.endsWith(".java")) {
                System.out.println("  " + Paths.get(path).getFileName());
            }
        }

        // ===== 创建临时路径（不实际创建） =====
        System.out.println("\\n=== 临时目录路径 ===");
        String tmpDir = System.getProperty("java.io.tmpdir");
        Path tmpPath = Paths.get(tmpDir, "myapp_" + System.currentTimeMillis() + ".tmp");
        System.out.println("临时文件路径: " + tmpPath);
        System.out.println("唯一文件名: " + tmpPath.getFileName());

        // ===== 文件扩展名操作 =====
        System.out.println("\\n=== 扩展名操作 ===");
        Path doc = Paths.get("report.2024.final.pdf");
        String fileName = doc.getFileName().toString();
        int dotIdx = fileName.lastIndexOf('.');
        System.out.println("文件名: " + fileName);
        System.out.println("扩展名: " + (dotIdx > 0 ? fileName.substring(dotIdx) : "(无)"));
        System.out.println("主名: " + (dotIdx > 0 ? fileName.substring(0, dotIdx) : fileName));
    }
}`
  },
  {
    id: "java-nio-buffer",
    group: "I/O 与 NIO",
    icon: "🧊",
    title: "Buffer",
    content: `# Buffer

\`java.nio.Buffer\` 是 NIO 的核心组件之一，是一个**容器对象**，用于存储特定基本类型的数据。它是 Channel 读写数据的中介。

## Buffer 类型

对应每种基本类型（除 boolean）：

\`ByteBuffer\`、\`CharBuffer\`、\`ShortBuffer\`、\`IntBuffer\`、\`LongBuffer\`、\`FloatBuffer\`、\`DoubleBuffer\`。

最常用的是 \`ByteBuffer\`。

## 三个核心指针

Buffer 通过三个指针管理数据：

- **capacity**：容量，创建后不变。
- **position**：当前位置，下一个要读/写的索引。
- **limit**：限制，第一个不应读/写的索引。

关系：\`0 <= position <= limit <= capacity\`。

## 状态切换

Buffer 有**写模式**和**读模式**两种状态：

**写模式**：\`position\` 指向下一个写入位置，\`limit = capacity\`。
\`\`\`
写入数据 → position 前移
\`\`\`

**flip()**：从写切换到读，\`limit = position\`，\`position = 0\`。
\`\`\`
[已写数据][空余空间]  →  [已写数据成为可读]
 position                 position=0, limit=写入量
\`\`\`

**读模式**：\`position\` 从 0 开始读，到 \`limit\` 停止。

## 核心方法

\`\`\`java
Buffer allocate(int capacity);  // 分配（静态）
Buffer put(x);                  // 写入
x get();                        // 读取
Buffer flip();                  // 写→读切换
Buffer rewind();               // position=0，不改变 limit（重新读）
Buffer clear();                // 清空（position=0, limit=capacity，数据未删）
Buffer compact();              // 压缩未读数据到开头，切换到写模式
\`\`\`

## flip vs rewind vs clear

| 方法 | position | limit | 用途 |
|------|----------|-------|------|
| \`flip()\` | 0 | 旧 position | 写完准备读 |
| \`rewind()\` | 0 | 不变 | 重新读已读数据 |
| \`clear()\` | 0 | capacity | 清空准备重新写 |
| \`compact()\` | 未读数 | capacity | 保留未读，继续写 |

## 直接缓冲区

\`ByteBuffer.allocateDirect(capacity)\` 分配**直接缓冲区**，内存在堆外，减少一次内核到用户空间的拷贝，适合大文件 I/O。但分配/释放开销大，适合长期复用。

\`allocate()\` 分配堆缓冲区，普通场景够用。

## mark / reset

\`mark()\` 记录当前位置，\`reset()\` 恢复到 mark 处。

下面演示 Buffer 的完整操作流程：`,
    code: `// 演示 Buffer 的完整操作流程
import java.nio.*;

public class Main {
    public static void main(String[] args) {
        // ===== 分配 Buffer =====
        ByteBuffer buf = ByteBuffer.allocate(10); // 容量 10
        System.out.println("=== 初始状态 ===");
        printState(buf, "初始");

        // ===== 写入数据 =====
        System.out.println("\\n=== 写入数据 ===");
        buf.put((byte) 1);
        buf.put((byte) 2);
        buf.put((byte) 3);
        buf.put((byte) 4);
        printState(buf, "写入4个后");

        buf.put((byte) 5);
        buf.put((byte) 6);
        printState(buf, "写入6个后");

        // ===== flip：写→读切换 =====
        System.out.println("\\n=== flip 切换为读模式 ===");
        buf.flip();
        printState(buf, "flip 后");

        // ===== 读取数据 =====
        System.out.println("\\n=== 读取数据 ===");
        System.out.println("get: " + buf.get());
        System.out.println("get: " + buf.get());
        printState(buf, "读取2个后");

        // ===== mark / reset =====
        System.out.println("\\n=== mark / reset ===");
        buf.mark(); // 标记当前位置（position=2）
        System.out.println("get: " + buf.get()); // 读第3个
        System.out.println("get: " + buf.get()); // 读第4个
        printState(buf, "又读2个");
        buf.reset(); // 回到 mark 处
        printState(buf, "reset 后");
        System.out.println("重新 get: " + buf.get()); // 又读到第3个

        // ===== rewind：重新读 =====
        System.out.println("\\n=== rewind 重新读 ===");
        buf.rewind();
        printState(buf, "rewind 后");
        System.out.println("从头 get: " + buf.get());

        // ===== clear：清空准备重新写 =====
        System.out.println("\\n=== clear 清空 ===");
        buf.clear();
        printState(buf, "clear 后");
        // 注意：数据仍在，只是 position=0, limit=capacity
        System.out.println("clear 后 get(0) 仍有旧数据: " + buf.get(0));

        // ===== compact：保留未读，继续写 =====
        System.out.println("\\n=== compact 演示 ===");
        buf.clear();
        buf.put((byte) 10);
        buf.put((byte) 20);
        buf.put((byte) 30);
        buf.put((byte) 40);
        buf.flip();
        buf.get(); // 读走 1 个（10）
        buf.get(); // 读走 1 个（20）
        printState(buf, "读走2个后");
        buf.compact(); // 未读的 30,40 压到开头
        printState(buf, "compact 后");
        buf.put((byte) 50); // 继续写
        buf.put((byte) 60);
        printState(buf, "继续写入后");

        // ===== 批量读写 =====
        System.out.println("\\n=== 批量读写 ===");
        ByteBuffer buf2 = ByteBuffer.allocate(10);
        buf2.put(new byte[]{1, 2, 3, 4, 5});
        buf2.flip();
        byte[] dst = new byte[3];
        buf2.get(dst); // 批量读3个
        System.out.println("批量读取: " + Arrays2.toString(dst));
        System.out.println("剩余可读: " + buf2.remaining());

        // ===== 直接缓冲区 =====
        System.out.println("\\n=== 直接缓冲区 ===");
        ByteBuffer direct = ByteBuffer.allocateDirect(1024);
        System.out.println("isDirect: " + direct.isDirect());
        System.out.println("isReadOnly: " + direct.isReadOnly());
        ByteBuffer heap = ByteBuffer.allocate(1024);
        System.out.println("heap isDirect: " + heap.isDirect());

        // ===== 其他类型 Buffer =====
        System.out.println("\\n=== IntBuffer ===");
        IntBuffer ib = IntBuffer.allocate(5);
        ib.put(100);
        ib.put(200);
        ib.put(300);
        ib.flip();
        while (ib.hasRemaining()) {
            System.out.print(ib.get() + " ");
        }
        System.out.println();

        // ===== CharBuffer 支持 CharSequence =====
        System.out.println("\\n=== CharBuffer ===");
        CharBuffer cb = CharBuffer.wrap("Hello");
        while (cb.hasRemaining()) {
            System.out.print(cb.get());
        }
        System.out.println();
    }

    static void printState(ByteBuffer buf, String label) {
        System.out.printf("  %s: position=%d, limit=%d, capacity=%d, remaining=%d%n",
            label, buf.position(), buf.limit(), buf.capacity(), buf.remaining());
    }
}

// 简单的数组工具（避免导入 java.util.Arrays）
class Arrays2 {
    static String toString(byte[] arr) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(arr[i]);
        }
        return sb.append("]").toString();
    }
}`
  },
  {
    id: "java-nio-channel",
    group: "I/O 与 NIO",
    icon: "📡",
    title: "Channel",
    content: `# Channel

\`Channel\` 是 NIO 的数据传输通道，类似流但功能更强：支持**双向读写**、**非阻塞模式**、配合 \`Buffer\` 使用，是 NIO 的核心。

## Channel vs Stream

| 特性 | Stream | Channel |
|------|--------|---------|
| 方向 | 单向（输入或输出） | 双向（可读可写） |
| 阻塞 | 阻塞 | 支持非阻塞 |
| 配合 | byte/char 直接读写 | 必须配合 Buffer |
| 零拷贝 | 不支持 | 支持 transferTo 等 |

## 主要 Channel 类型

| 类 | 说明 |
|----|------|
| \`FileChannel\` | 文件通道，从文件读写 |
| \`SocketChannel\` | TCP 客户端通道 |
| \`ServerSocketChannel\` | TCP 服务端通道 |
| \`DatagramChannel\` | UDP 通道 |
| \`Pipe.SinkChannel\` / \`Pipe.SourceChannel\` | 管道通道 |

## FileChannel 获取

\`\`\`java
// 从流获取
FileChannel ch = new FileInputStream("a.txt").getChannel();
FileChannel ch = new RandomAccessFile("a.txt", "rw").getChannel();
// JDK 7+ 直接打开
FileChannel ch = FileChannel.open(path, StandardOpenOption.READ);
\`\`\`

## 读写：必须用 Buffer

\`\`\`java
ByteBuffer buf = ByteBuffer.allocate(1024);
int n = channel.read(buf);  // 读到 Buffer
buf.flip();
channel.write(buf);         // 从 Buffer 写
\`\`\`

\`read\` 返回读取的字节数，返回 -1 表示到达末尾。

## transferTo / transferFrom：零拷贝

\`transferTo\` 直接在两个 Channel 间传输数据，可能不经过用户空间（操作系统直接复制），性能极高：

\`\`\`java
srcChannel.transferTo(0, srcChannel.size(), dstChannel);
// 等价于
dstChannel.transferFrom(srcChannel, 0, srcChannel.size());
\`\`\`

这是大文件复制的**最佳方式**。

## 位置与大小

\`\`\`java
long position();           // 当前位置
long size();               // 文件大小
channel.position(100);     // 跳转
\`\`\`

## 非阻塞模式

FileChannel **不支持非阻塞**。只有网络 Channel（SocketChannel 等）支持：

\`\`\`java
socketChannel.configureBlocking(false); // 非阻塞
\`\`\`

非阻塞模式配合 \`Selector\` 实现 I/O 多路复用，这是 NIO 高并发的关键。

## force：强制刷盘

\`channel.force(true)\` 强制将数据写入磁盘（类似 \`fsync\`），参数为 true 表示连元数据也刷。

下面通过内存演示 Channel 的核心操作：`,
    code: `// 演示 Channel 的核心操作（使用内存临时文件）
import java.nio.*;
import java.nio.channels.*;
import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.io.IOException;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        // ===== 用临时文件演示 FileChannel（沙箱通常允许临时目录） =====
        Path tmp1 = Files.createTempFile("nio-demo1-", ".dat");
        Path tmp2 = Files.createTempFile("nio-demo2-", ".dat");
        tmp1.toFile().deleteOnExit();
        tmp2.toFile().deleteOnExit();

        // ===== 写入：Buffer → Channel =====
        System.out.println("=== 写入数据 ===");
        try (FileChannel ch = FileChannel.open(tmp1,
                StandardOpenOption.WRITE)) {
            ByteBuffer buf = ByteBuffer.allocate(1024);
            buf.put("Hello, NIO Channel".getBytes(StandardCharsets.UTF_8));
            buf.put("\\n第二行".getBytes(StandardCharsets.UTF_8));
            buf.flip(); // 写模式 → 读模式，准备给 channel 读
            int written = ch.write(buf);
            System.out.println("写入字节数: " + written);
            ch.force(true); // 强制刷盘
        }

        // ===== 读取：Channel → Buffer =====
        System.out.println("\\n=== 读取数据 ===");
        try (FileChannel ch = FileChannel.open(tmp1, StandardOpenOption.READ)) {
            System.out.println("文件大小: " + ch.size() + " 字节");
            ByteBuffer buf = ByteBuffer.allocate(1024);
            int n = ch.read(buf);
            System.out.println("读取字节数: " + n);
            buf.flip();
            byte[] data = new byte[buf.remaining()];
            buf.get(data);
            System.out.println("内容: " + new String(data, StandardCharsets.UTF_8));
        }

        // ===== transferTo：零拷贝复制 =====
        System.out.println("\\n=== transferTo 零拷贝 ===");
        try (FileChannel src = FileChannel.open(tmp1, StandardOpenOption.READ);
             FileChannel dst = FileChannel.open(tmp2,
                StandardOpenOption.WRITE)) {
            long transferred = src.transferTo(0, src.size(), dst);
            System.out.println("传输字节数: " + transferred);
        }
        // 验证复制结果
        System.out.println("目标文件大小: " + Files.size(tmp2));

        // ===== position 跳转读取 =====
        System.out.println("\\n=== position 跳转 ===");
        try (FileChannel ch = FileChannel.open(tmp1, StandardOpenOption.READ)) {
            ch.position(7); // 跳过 "Hello, "
            ByteBuffer buf = ByteBuffer.allocate(10);
            ch.read(buf);
            buf.flip();
            byte[] part = new byte[buf.remaining()];
            buf.get(part);
            System.out.println("从位置7读取: " + new String(part, StandardCharsets.UTF_8));
        }

        // ===== 批量小 Buffer 读取（循环） =====
        System.out.println("\\n=== 循环读取 ===");
        try (FileChannel ch = FileChannel.open(tmp1, StandardOpenOption.READ)) {
            ByteBuffer buf = ByteBuffer.allocate(8); // 小缓冲区
            StringBuilder sb = new StringBuilder();
            while (ch.read(buf) != -1) {
                buf.flip();
                while (buf.hasRemaining()) {
                    sb.append((char) buf.get()); // 简化：按字节转 char
                }
                buf.clear();
            }
            System.out.println("循环读取内容(ASCII部分): " + sb.toString().split("\\\\n")[0]);
        }

        // ===== Channel 双向：读写同一文件 =====
        System.out.println("\\n=== 读写同一 Channel ===");
        Path tmp3 = Files.createTempFile("rw-", ".dat");
        tmp3.toFile().deleteOnExit();
        try (FileChannel ch = FileChannel.open(tmp3,
                StandardOpenOption.READ, StandardOpenOption.WRITE)) {
            ByteBuffer w = ByteBuffer.wrap("ABCDEFGH".getBytes(StandardCharsets.UTF_8));
            ch.write(w);
            ch.position(0); // 回到开头读
            ByteBuffer r = ByteBuffer.allocate(4);
            ch.read(r);
            r.flip();
            byte[] first = new byte[r.remaining()];
            r.get(first);
            System.out.println("写入后读前4字节: " + new String(first, StandardCharsets.UTF_8));
        }

        // ===== 演示 Channel 是双向的（Stream 是单向） =====
        System.out.println("\\n=== Channel 双向特性 ===");
        try (FileChannel ch = FileChannel.open(tmp3,
                StandardOpenOption.READ, StandardOpenOption.WRITE)) {
            System.out.println("isOpen: " + ch.isOpen());
            System.out.println("position: " + ch.position());
            System.out.println("size: " + ch.size());
        }

        System.out.println("\\n=== 清理临时文件 ===");
        Files.deleteIfExists(tmp1);
        Files.deleteIfExists(tmp2);
        Files.deleteIfExists(tmp3);
        System.out.println("临时文件已删除");
    }
}`
  },
  {
    id: "java-char-encoding",
    group: "I/O 与 NIO",
    icon: "🌐",
    title: "字符编码深入",
    content: `# 字符编码深入

字符编码是计算机表示文字的方式。理解编码是避免乱码、正确处理多语言文本的基础。

## 常见编码

| 编码 | 字节长度 | 说明 |
|------|----------|------|
| **ASCII** | 1 字节 | 128 个字符，英文+控制符 |
| **ISO-8859-1** | 1 字节 | 256 个字符，西欧语言，**不支持中文** |
| **GBK** | 1~2 字节 | 中文，2 字节表示汉字 |
| **GB18030** | 1~4 字节 | 国家标准，兼容 GBK |
| **UTF-8** | 1~4 字节 | 变长，兼容 ASCII，最通用 |
| **UTF-16** | 2 或 4 字节 | Java char 内部即 UTF-16 |
| **UTF-32** | 4 字节 | 定长，少用 |

## UTF-8 编码规则

| Unicode 范围 | 字节数 | 格式 |
|--------------|--------|------|
| U+0000~U+007F | 1 | 0xxxxxxx |
| U+0080~U+07FF | 2 | 110xxxxx 10xxxxxx |
| U+0800~U+FFFF | 3 | 1110xxxx 10xxxxxx 10xxxxxx |
| U+10000+ | 4 | 11110xxx ... |

ASCII 字符在 UTF-8 中仍是 1 字节，因此英文文本 UTF-8 节省空间。中文是 3 字节。

## Java 中的编码

Java \`char\` 是 16 位，内部用 UTF-16 存储。字符串与字节互转时必须指定编码：

\`\`\`java
byte[] bytes = "中文".getBytes(StandardCharsets.UTF_8);
String s = new String(bytes, StandardCharsets.UTF_8);
\`\`\`

## StandardCharsets

\`java.nio.charset.StandardCharsets\` 提供常量，**推荐使用**：

\`\`\`java
StandardCharsets.UTF_8
StandardCharsets.UTF_16
StandardCharsets.ISO_8859_1
StandardCharsets.US_ASCII
\`\`\`

避免使用字符串 "UTF-8"（拼写错会抛异常），常量更安全且编译期检查。

## 乱码原因

1. **编码解码不一致**：用 GBK 编码，用 UTF-8 解码。
2. **不支持某字符**：用 ISO-8859-1 编码中文（丢失信息）。
3. **默认编码差异**：不同 JVM 默认编码可能不同。

\`new String(bytes)\` 不指定编码会用**平台默认编码**，是乱码高发原因。**永远显式指定编码**。

## 乱码排查

\`\`\`java
// 假设原本是 UTF-8，被错误用 ISO-8859-1 解码
String wrong = new String(utf8Bytes, "ISO-8859-1");
// 修复：先按 ISO-8859-1 还原字节，再用 UTF-8 解码
String right = new String(wrong.getBytes("ISO-8859-1"), "UTF-8");
\`\`\`

## Charset 类

\`Charset\` 可查询编码信息：

\`\`\`java
Charset.defaultCharset();         // 平台默认
Charset.isSupported("UTF-8");     // 是否支持
Charset.availableCharsets();      // 所有可用编码
\`\`\`

下面演示编码转换与乱码修复：`,
    code: `// 演示字符编码转换与乱码修复
import java.nio.charset.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        String text = "Hello 中文";

        // ===== 不同编码的字节长度 =====
        System.out.println("=== 编码字节长度对比 ===");
        System.out.println("原文: " + text);
        System.out.println("UTF-8: " + text.getBytes(StandardCharsets.UTF_8).length + " 字节");
        System.out.println("UTF-16: " + text.getBytes(StandardCharsets.UTF_16).length + " 字节");
        System.out.println("GBK: " + text.getBytes("GBK").length + " 字节");
        System.out.println("ISO-8859-1: " + text.getBytes(StandardCharsets.ISO_8859_1).length + " 字节 (中文丢失)");
        System.out.println("US-ASCII: " + text.getBytes(StandardCharsets.US_ASCII).length + " 字节 (中文变?)");

        // ===== UTF-8 字节序列查看 =====
        System.out.println("\\n=== UTF-8 字节序列 ===");
        byte[] utf8 = "中文".getBytes(StandardCharsets.UTF_8);
        System.out.print("'中文' UTF-8 字节: ");
        for (byte b : utf8) {
            System.out.printf("%02X ", b & 0xFF);
        }
        System.out.println("(共 " + utf8.length + " 字节，每字3字节)");

        byte[] gbk = "中文".getBytes("GBK");
        System.out.print("'中文' GBK 字节: ");
        for (byte b : gbk) {
            System.out.printf("%02X ", b & 0xFF);
        }
        System.out.println("(共 " + gbk.length + " 字节，每字2字节)");

        // ===== 编码 → 解码（正确） =====
        System.out.println("\\n=== 正确编解码 ===");
        byte[] encoded = "测试文本".getBytes(StandardCharsets.UTF_8);
        String decoded = new String(encoded, StandardCharsets.UTF_8);
        System.out.println("UTF-8 编码后解码: " + decoded);

        // ===== 乱码场景：UTF-8 用 ISO-8859-1 解码 =====
        System.out.println("\\n=== 乱码场景 ===");
        String garbled = new String(encoded, StandardCharsets.ISO_8859_1);
        System.out.println("UTF-8 字节用 ISO-8859-1 解码: " + garbled);

        // ===== 修复乱码 =====
        System.out.println("\\n=== 修复乱码 ===");
        // 原理：ISO-8859-1 是单字节无损编码，可还原原始字节
        byte[] restored = garbled.getBytes(StandardCharsets.ISO_8859_1);
        String fixed = new String(restored, StandardCharsets.UTF_8);
        System.out.println("修复后: " + fixed);
        System.out.println("修复成功: " + fixed.equals("测试文本"));

        // ===== 不可逆乱码：UTF-8 用 GBK 解码 =====
        System.out.println("\\n=== 不可逆乱码 ===");
        String gbkWrong = new String(encoded, "GBK");
        System.out.println("UTF-8 字节用 GBK 解码: " + gbkWrong);
        // 尝试修复
        try {
            String fix2 = new String(gbkWrong.getBytes("GBK"), StandardCharsets.UTF_8);
            System.out.println("尝试修复: " + fix2);
            System.out.println("修复成功: " + fix2.equals("测试文本"));
        } catch (Exception e) {
            System.out.println("修复失败: " + e.getMessage());
        }

        // ===== 平台默认编码 =====
        System.out.println("\\n=== 默认编码 ===");
        System.out.println("file.encoding: " + System.getProperty("file.encoding"));
        System.out.println("defaultCharset: " + Charset.defaultCharset());
        System.out.println("sun.jnu.encoding: " + System.getProperty("sun.jnu.encoding"));

        // ===== 查询支持的编码 =====
        System.out.println("\\n=== 常用编码支持情况 ===");
        String[] encodings = {"UTF-8", "GBK", "GB18030", "Big5", "ISO-8859-1", "Shift_JIS"};
        for (String enc : encodings) {
            System.out.println("  " + enc + ": " + (Charset.isSupported(enc) ? "支持" : "不支持"));
        }

        // ===== Charset 编解码器 =====
        System.out.println("\\n=== Charset 编解码 ===");
        Charset utf8cs = StandardCharsets.UTF_8;
        System.out.println("displayName: " + utf8cs.displayName());
        System.out.println("aliases: " + utf8cs.aliases());

        // ===== 中文标点符号编码 =====
        System.out.println("\\n=== 标点符号编码 ===");
        String[] puncts = {"，", "。", "！", "？", "、"};
        for (String p : puncts) {
            byte[] bs = p.getBytes(StandardCharsets.UTF_8);
            System.out.printf("'%s' → %d 字节%n", p, bs.length);
        }
    }
}`
  },
  {
    id: "java-io-performance",
    group: "I/O 与 NIO",
    icon: "⚡",
    title: "I/O 性能",
    content: `# I/O 性能

I/O 是程序性能瓶颈的高发区。掌握 I/O 调优技巧，能让程序吞吐量提升数倍甚至数十倍。

## 1. 使用缓冲区

**最重要的一条**：批量读写远快于单字节读写。

\`\`\`java
// 慢：每字节一次系统调用
int b;
while ((b = in.read()) != -1) { ... }

// 快：批量读取
byte[] buf = new byte[8192];
int n;
while ((n = in.read(buf)) != -1) { ... }

// 最简洁：直接用 BufferedInputStream 包装
BufferedInputStream bis = new BufferedInputStream(in);
\`\`\`

默认缓冲区 8KB，大文件可适当增大到 64KB，但收益递减。

## 2. NIO vs IO

| 特性 | 传统 IO | NIO |
|------|---------|-----|
| 模式 | 阻塞、流式 | 可非阻塞、缓冲区 |
| 适合 | 连接少、数据大 | 连接多、数据小 |
| 复制大文件 | Buffered + 循环 | \`transferTo\` 零拷贝 |
| 网络高并发 | 一连接一线程 | Selector 多路复用 |

**大文件复制优先用 \`FileChannel.transferTo\`**，可能实现零拷贝。

## 3. 零拷贝

传统复制经过 4 次拷贝：磁盘→内核→用户→内核→磁盘。零拷贝技术（\`transferTo\`、\`mmap\`）减少拷贝次数：

- \`transferTo\`：内核空间直接复制，不经过用户空间。
- \`mmap\`（内存映射）：文件映射到内存，读写像访问数组。

\`\`\`java
// 零拷贝
src.transferTo(0, src.size(), dst);

// 内存映射
MappedByteBuffer mbb = fileChannel.map(
    FileChannel.MapMode.READ_ONLY, 0, fileChannel.size());
\`\`\`

## 4. 内存映射文件

\`MappedByteBuffer\` 将文件映射到内存，适合**大文件随机读写**（如数据库）。读取时不经过系统调用，速度极快，但映射大文件占虚拟内存。

## 5. 合理的缓冲区大小

| 缓冲区 | 适用 |
|--------|------|
| 4KB | 小文件 |
| 8KB（默认） | 通用 |
| 64KB | 大文件 |
| 1MB+ | 极大文件，收益递减 |

## 6. 减少对象创建

- 复用 \`ByteBuffer\`，不要每次新建。
- 复用流对象（如日志的 Writer）。
- 大量小对象用对象池。

## 7. 流式处理大文件

不要 \`readAllBytes\` 把大文件全读进内存，用流式处理：

\`\`\`java
// 大文件行处理
try (Stream<String> s = Files.lines(path)) {
    s.filter(...).forEach(...);
}

// Buffer 循环读
ByteBuffer buf = ByteBuffer.allocate(8192);
while (channel.read(buf) != -1) { ... }
\`\`\`

## 8. try-with-resources

确保流及时关闭，避免资源泄漏导致性能下降。

## 9. 异步 I/O

JDK 7+ 的 \`AsynchronousFileChannel\` 支持异步读写，配合 Future/Callback 不阻塞线程，适合高并发场景。

下面演示 I/O 性能对比与技巧：`,
    code: `// 演示 I/O 性能对比与优化技巧
import java.io.*;
import java.nio.*;
import java.nio.channels.*;
import java.nio.file.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // 准备测试数据：1MB 文本
        StringBuilder sb = new StringBuilder();
        String line = "这是测试数据行，用于性能测试。This is a test line for performance.\\n";
        int targetSize = 1024 * 1024; // 1MB
        while (sb.length() < targetSize) {
            sb.append(line);
        }
        byte[] data = sb.toString().getBytes(StandardCharsets.UTF_8);
        System.out.println("测试数据大小: " + data.length / 1024 + " KB");

        // ===== 性能对比1：单字节读 vs 批量读 vs 缓冲读 =====
        System.out.println("\\n=== 读取 1MB 数据性能对比 ===");

        // 单字节读（最慢）
        long t1 = System.nanoTime();
        InputStream is1 = new ByteArrayInputStream(data);
        while (is1.read() != -1) { }
        long t2 = System.nanoTime();

        // 批量读 8KB
        long t3 = System.nanoTime();
        InputStream is2 = new ByteArrayInputStream(data);
        byte[] buf8k = new byte[8192];
        while (is2.read(buf8k) != -1) { }
        long t4 = System.nanoTime();

        // 缓冲流单字节读
        long t5 = System.nanoTime();
        BufferedInputStream bis = new BufferedInputStream(new ByteArrayInputStream(data));
        while (bis.read() != -1) { }
        long t6 = System.nanoTime();

        // 批量读 64KB
        long t7 = System.nanoTime();
        InputStream is3 = new ByteArrayInputStream(data);
        byte[] buf64k = new byte[65536];
        while (is3.read(buf64k) != -1) { }
        long t8 = System.nanoTime();

        System.out.println("单字节读:     " + (t2 - t1) / 1_000_000 + " ms");
        System.out.println("批量读 8KB:   " + (t4 - t3) / 1_000_000 + " ms");
        System.out.println("缓冲流单字节: " + (t6 - t5) / 1_000_000 + " ms");
        System.out.println("批量读 64KB:  " + (t8 - t7) / 1_000_000 + " ms");
        System.out.println("单字节比批量慢 " + (t2 - t1) / Math.max(1, t4 - t3) + " 倍");

        // ===== 性能对比2：Buffer 操作 =====
        System.out.println("\\n=== ByteBuffer 操作 ===");
        ByteBuffer heapBuf = ByteBuffer.allocate(data.length);
        long t9 = System.nanoTime();
        heapBuf.put(data);
        heapBuf.flip();
        byte[] out1 = new byte[heapBuf.remaining()];
        heapBuf.get(out1);
        long t10 = System.nanoTime();
        System.out.println("HeapBuffer 复制 " + data.length + " 字节: " + (t10 - t9) / 1_000_000 + " ms");

        ByteBuffer directBuf = ByteBuffer.allocateDirect(data.length);
        long t11 = System.nanoTime();
        directBuf.put(data);
        directBuf.flip();
        byte[] out2 = new byte[directBuf.remaining()];
        directBuf.get(out2);
        long t12 = System.nanoTime();
        System.out.println("DirectBuffer 复制 " + data.length + " 字节: " + (t12 - t11) / 1_000_000 + " ms");
        System.out.println("数据一致: " + Arrays.equals(out1, out2));

        // ===== 文件复制对比（用临时文件） =====
        System.out.println("\\n=== 文件复制性能对比 ===");
        Path src = Files.createTempFile("perf-src-", ".dat");
        Path dst1 = Files.createTempFile("perf-dst1-", ".dat");
        Path dst2 = Files.createTempFile("perf-dst2-", ".dat");
        Files.write(src, data);
        src.toFile().deleteOnExit();
        dst1.toFile().deleteOnExit();
        dst2.toFile().deleteOnExit();

        // 传统 IO 复制
        long t13 = System.nanoTime();
        try (InputStream in = new BufferedInputStream(Files.newInputStream(src));
             OutputStream out = new BufferedOutputStream(Files.newOutputStream(dst1))) {
            byte[] b = new byte[8192];
            int n;
            while ((n = in.read(b)) != -1) {
                out.write(b, 0, n);
            }
        }
        long t14 = System.nanoTime();

        // NIO transferTo 零拷贝
        long t15 = System.nanoTime();
        try (FileChannel srcCh = FileChannel.open(src, StandardOpenOption.READ);
             FileChannel dstCh = FileChannel.open(dst2, StandardOpenOption.WRITE)) {
            srcCh.transferTo(0, srcCh.size(), dstCh);
        }
        long t16 = System.nanoTime();

        System.out.println("传统 IO 复制: " + (t14 - t13) / 1_000_000 + " ms");
        System.out.println("NIO transferTo: " + (t16 - t15) / 1_000_000 + " ms");
        System.out.println("复制后大小一致: " + (Files.size(dst1) == Files.size(dst2)));

        // ===== 内存映射文件 =====
        System.out.println("\\n=== 内存映射文件 MappedByteBuffer ===");
        try (FileChannel ch = FileChannel.open(src, StandardOpenOption.READ)) {
            MappedByteBuffer mbb = ch.map(FileChannel.MapMode.READ_ONLY, 0, ch.size());
            System.out.println("映射大小: " + mbb.capacity() + " 字节");
            System.out.println("isLoaded: " + mbb.isLoaded());
            // 读取前100字节
            byte[] first = new byte[100];
            mbb.get(first);
            System.out.println("前100字节预览: " + new String(first, StandardCharsets.UTF_8).substring(0, 30) + "...");

            // 随机访问性能
            long t17 = System.nanoTime();
            long sum = 0;
            for (int i = 0; i < 10000; i++) {
                sum += mbb.get(i % mbb.capacity());
            }
            long t18 = System.nanoTime();
            System.out.println("随机访问1万次: " + (t18 - t17) / 1000 + " 微秒");
        }

        // ===== 流式处理行 =====
        System.out.println("\\n=== 流式处理（模拟 Files.lines） ===");
        long t19 = System.nanoTime();
        long lineCount = 0;
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(new ByteArrayInputStream(data), StandardCharsets.UTF_8))) {
            String l;
            while ((l = br.readLine()) != null) {
                lineCount++;
            }
        }
        long t20 = System.nanoTime();
        System.out.println("行数: " + lineCount);
        System.out.println("按行读取耗时: " + (t20 - t19) / 1_000_000 + " ms");

        // 清理
        Files.deleteIfExists(src);
        Files.deleteIfExists(dst1);
        Files.deleteIfExists(dst2);

        System.out.println("\\n=== I/O 调优总结 ===");
        System.out.println("1. 必须用缓冲区（BufferedXxx 或 byte[] 批量）");
        System.out.println("2. 大文件复制用 transferTo 零拷贝");
        System.out.println("3. 大文件随机访问用 MappedByteBuffer");
        System.out.println("4. 流式处理避免 readAllBytes 占满内存");
        System.out.println("5. 复用 Buffer/Stream 对象");
        System.out.println("6. try-with-resources 确保关闭");
    }
}`
  }
];
