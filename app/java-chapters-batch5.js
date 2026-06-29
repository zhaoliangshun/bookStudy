// =============================================================
// Java 交互式教程 —— 第五批章节（字符串与字符组，共 15 章）
// =============================================================

export const chapters = [
  {
    id: "java-string-immutable",
    group: "字符串与字符",
    icon: "🔒",
    title: "String 不可变性深入",
    content: `# String 不可变性深入

Java 中 \`String\` 类是不可变的（immutable），一旦创建，其内容就不能再改变。这是 Java 设计中最重要的一项决策，深刻影响了性能、安全与并发模型。

## 为什么设计成不可变？

### 1. 安全性
字符串广泛用于类加载、网络连接、文件路径、SQL 语句、URL 等敏感场景。如果 String 可变，攻击者可能在其被使用前修改它的内容，造成安全漏洞。例如，连接数据库前校验过的 SQL 语句若被篡改将引发注入。

### 2. 线程安全
不可变对象天生线程安全，多个线程可以同时访问同一个 String 对象而无需任何同步机制，这是并发编程的基础保证。

### 3. 缓存哈希值
String 的 \`hashCode\` 在首次计算后被缓存，因为内容不变所以哈希值也不变。频繁用作 HashMap 的 key 时性能优势明显。

### 4. 字符串常量池
不可变性使得多个引用可以安全地指向同一个字符串对象，配合常量池大幅节省内存。

## 实现原理

\`\`\`java
public final class String implements java.io.Serializable, Comparable<String>, CharSequence {
    private final char[] value;  // Java 8
    // private final byte[] value; // Java 9+ 使用 byte[] + coder
}
\`\`\`

- 类被 \`final\` 修饰，不能被继承，防止子类破坏不可变性
- 内部数组被 \`final\` 修饰，引用不能重新指向
- 没有提供任何修改数组内容的方法（所有"修改"操作都返回新对象）

## "修改"字符串的本质

所有看起来修改字符串的操作（\`concat\`、\`replace\`、\`substring\`、\`toUpperCase\`、\`+\`）实际上都是创建新的 String 对象：

\`\`\`java
String s = "hello";
s = s + " world";  // s 指向新对象，原对象不变
\`\`\`

## substring 的历史变迁

- Java 6：\`substring\` 共享原 char[]，截取大字符串片段会保持大数组不被 GC，可能内存泄漏
- Java 7+：\`substring\` 创建新数组，复制内容，避免上述问题但略慢

## 拼接的性能影响

在循环中使用 \`+\` 拼接字符串会产生大量临时对象，因为每次拼接都创建新对象。编译器虽然会自动把 \`+\` 优化为 StringBuilder，但在循环中每次迭代仍会创建新的 StringBuilder，性能很差，建议在循环中显式使用 StringBuilder。

## 不可变带来的好处总结

- 可作为常量安全共享
- 可缓存 hashCode
- 可作为 HashMap key 而无需担心被修改
- 适合做类加载器参数

## 不可变性的代价

- 每次"修改"都创建新对象，频繁拼接产生大量临时对象，GC 压力大
- 占用更多内存（同一逻辑内容可能有多个对象副本）
- 需要配合 StringBuilder 使用才能高效拼接

## 反射能否破坏不可变？

理论上可以用反射修改 String 内部的 \`value\` 数组，但这是**极不推荐**的危险操作：
- 会破坏 JVM 内部假设，导致不可预测的行为
- 缓存的 hashCode 与实际内容不一致
- 安全管理器（SecurityManager）可能阻止

Java 9+ 后内部数组改为 \`byte[]\` 并增加 \`coder\` 字段，反射破坏更复杂也更危险。

下面通过代码演示不可变性与引用变化：`,
    code: `// 演示 String 不可变性与引用变化
public class Main {
    public static void main(String[] args) {
        // 原始字符串
        String s1 = "hello";
        // 把 s1 的引用赋给 s2，二者指向同一对象
        String s2 = s1;

        System.out.println("修改前: s1 = " + s1 + ", s2 = " + s2);
        System.out.println("s1 == s2: " + (s1 == s2));

        // "修改" s1 实际上是让 s1 指向新对象，s2 仍指向原对象
        s1 = s1.concat(" world");

        System.out.println("修改后: s1 = " + s1 + ", s2 = " + s2);
        System.out.println("s1 == s2: " + (s1 == s2));

        // replace 同样返回新对象
        String original = "Java";
        String replaced = original.replace('a', 'o');
        System.out.println("original = " + original + ", replaced = " + replaced);

        // 不可变带来的哈希缓存演示
        String key = "user_001";
        int h1 = key.hashCode();
        int h2 = key.hashCode();
        System.out.println("哈希值是否相同: " + (h1 == h2));

        // 循环拼接产生大量临时对象
        long start = System.nanoTime();
        String result = "";
        for (int i = 0; i < 100; i++) {
            result = result + i;  // 每次循环都创建新对象
        }
        long end = System.nanoTime();
        System.out.println("循环拼接耗时(ns): " + (end - start));
        System.out.println("结果长度: " + result.length());
    }
}`
  },
  {
    id: "java-string-methods",
    group: "字符串与字符",
    icon: "🛠️",
    title: "String 常用方法",
    content: `# String 常用方法

\`String\` 类提供了丰富的方法来操作字符串。掌握这些方法是 Java 编程的基本功。所有"修改"类方法都返回新字符串，原字符串不变。

## 长度与索引

| 方法 | 说明 |
|------|------|
| \`length()\` | 返回 char 单元个数（非 Unicode 字符数） |
| \`charAt(int index)\` | 返回指定位置的字符，越界抛异常 |
| \`isEmpty()\` | 是否为空字符串（长度为 0） |
| \`isBlank()\` | 是否为空白（Java 11+，长度 0 或全是空白字符） |
| \`codePointCount(start, end)\` | 返回真正的 Unicode 字符数 |

## 查找与判断

| 方法 | 说明 |
|------|------|
| \`indexOf(String)\` | 从前往后查找子串首次出现位置，找不到返回 -1 |
| \`lastIndexOf(String)\` | 从后往前查找 |
| \`contains(CharSequence)\` | 是否包含子串 |
| \`startsWith(String)\` | 是否以指定前缀开头 |
| \`endsWith(String)\` | 是否以指定后缀结尾 |
| \`matches(String regex)\` | 整体是否匹配正则 |

\`indexOf\` 有多个重载，可接收 char 或 String，可指定起始位置。

## 截取与替换

| 方法 | 说明 |
|------|------|
| \`substring(int begin)\` | 从 begin 截取到末尾 |
| \`substring(int begin, int end)\` | 截取 [begin, end) |
| \`replace(char, char)\` | 字符替换 |
| \`replace(CharSequence, CharSequence)\` | 字面量替换（非正则） |
| \`replaceAll(String regex, String repl)\` | 正则替换 |
| \`replaceFirst(String regex, String repl)\` | 替换第一个匹配 |

注意 \`replace\` 不接收正则，而 \`replaceAll\` 接收正则。这是常见误区。

## 拆分与修剪

| 方法 | 说明 |
|------|------|
| \`split(String regex)\` | 按正则拆分 |
| \`split(String regex, int limit)\` | 限制拆分次数 |
| \`trim()\` | 去除首尾空白（仅 ASCII 空白） |
| \`strip()\` | 去除首尾空白（Unicode 空白，Java 11+） |
| \`stripLeading()\` / \`stripTrailing()\` | 仅去首/尾空白 |
| \`repeat(int)\` | 重复字符串（Java 11+） |
| \`lines()\` | 按行分割为 Stream（Java 11+） |

## 重要细节

- \`trim()\` 只去除 \`<= ' '\\u0020\` 的字符，而 \`strip()\` 能去除全角空格等 Unicode 空白
- \`split\` 接收的是正则表达式，特殊字符（\`.\`、\`|\`、\`$\`）需要转义
- 默认 \`split\` 会丢弃尾部空字符串，用 \`split(regex, -1)\` 保留
- 索引越界会抛出 \`StringIndexOutOfBoundsException\`

下面通过代码演示这些方法：`,
    code: `// 演示 String 各种常用方法
public class Main {
    public static void main(String[] args) {
        String s = "  Hello, Java World!  ";

        // 长度与索引
        System.out.println("length = " + s.length());
        System.out.println("charAt(3) = " + s.charAt(3));

        // 查找
        System.out.println("indexOf('o') = " + s.indexOf('o'));
        System.out.println("lastIndexOf('o') = " + s.lastIndexOf('o'));
        System.out.println("contains(\\"Java\\") = " + s.contains("Java"));
        System.out.println("startsWith(\\"  He\\") = " + s.startsWith("  He"));
        System.out.println("endsWith(\\"!  \\") = " + s.endsWith("!  "));

        // 截取
        System.out.println("substring(2, 7) = " + s.substring(2, 7));

        // 替换
        System.out.println("replace = " + s.replace('o', '0'));
        System.out.println("replaceAll = " + s.replaceAll("o", "0"));
        System.out.println("replaceFirst = " + s.replaceFirst("o", "0"));

        // 拆分
        String[] parts = "apple,banana,cherry".split(",");
        System.out.println("拆分结果:");
        for (String p : parts) {
            System.out.println("  " + p);
        }

        // 修剪
        System.out.println("trim = [" + s.trim() + "]");
        System.out.println("strip = [" + s.strip() + "]");
        String full = "\\u3000全角空格\\u3000";
        System.out.println("trim 去全角空格: [" + full.trim() + "]");
        System.out.println("strip 去全角空格: [" + full.strip() + "]");

        // 空判断
        String empty = "";
        String blank = "   ";
        System.out.println("empty.isEmpty() = " + empty.isEmpty());
        System.out.println("blank.isEmpty() = " + blank.isEmpty());
        System.out.println("blank.isBlank() = " + blank.isBlank());

        // repeat 与 lines
        System.out.println("repeat: " + "ab".repeat(3));
    }
}`
  },
  {
    id: "java-string-builder",
    group: "字符串与字符",
    icon: "🏗️",
    title: "StringBuilder 与 StringBuffer",
    content: `# StringBuilder 与 StringBuffer

由于 String 不可变，频繁拼接字符串会产生大量临时对象。Java 提供了可变的字符串序列类来解决这一问题。

## 可变字符串

\`StringBuilder\` 和 \`StringBuffer\` 都继承自 \`AbstractStringBuilder\`，内部维护一个可扩容的字符数组（Java 9+ 为 byte[]），修改操作直接在原数组上进行，不会创建新对象。

## StringBuilder vs StringBuffer

| 特性 | StringBuilder | StringBuffer |
|------|--------------|--------------|
| 线程安全 | 否 | 是（方法 synchronized） |
| 性能 | 更快 | 较慢（同步开销） |
| 引入版本 | Java 5 | Java 1.0 |
| 适用场景 | 单线程 | 多线程共享 |

绝大多数场景下单线程使用 \`StringBuilder\` 即可。即使在多线程中，通常也通过外部同步而非使用 StringBuffer。

## 常用方法

\`\`\`java
StringBuilder sb = new StringBuilder();
sb.append("hello");       // 追加
sb.insert(0, "say ");     // 在指定位置插入
sb.delete(0, 4);          // 删除 [start, end)
sb.deleteCharAt(0);       // 删除单个字符
sb.reverse();             // 反转
sb.replace(0, 5, "HELLO");// 替换区间
sb.charAt(0);             // 取字符
sb.setCharAt(0, 'H');     // 设置字符
sb.length();              // 长度
sb.capacity();            // 容量
sb.setLength(0);          // 清空（重置长度）
sb.toString();            // 转 String
sb.substring(0, 3);       // 截取返回 String
sb.appendCodePoint(0x1F600); // 追加码点（处理 emoji）
\`\`\`

## 链式调用

大多数方法返回 \`this\`，支持链式调用：

\`\`\`java
sb.append("a").append("b").append("c");
\`\`\`

## 容量与扩容

构造时可以指定初始容量，避免频繁扩容。默认容量 16，扩容策略为 \`旧容量 * 2 + 2\`（Java 9+ 略有不同）。扩容时会创建新数组并复制内容，是性能开销的主要来源。

- \`ensureCapacity(min)\`：确保容量至少为 min
- \`trimToSize()\`：将容量缩减为实际长度，节省内存

## 性能对比

在循环拼接场景下，StringBuilder 比 \`+\` 拼接快几个数量级。\`+\` 在循环中每次迭代都会被编译器翻译成 \`new StringBuilder().append(...).toString()\`，产生大量临时对象。

## 选择建议

- 单线程拼接：\`StringBuilder\`
- 多线程共享拼接：用 \`StringBuilder\` + 外部锁，或 \`StringBuffer\`
- 简单一次性拼接：直接 \`+\` 即可，编译器会优化

下面通过代码演示 StringBuilder 的操作与性能：`,
    code: `// 演示 StringBuilder 与 StringBuffer
public class Main {
    public static void main(String[] args) {
        // 创建与基本操作
        StringBuilder sb = new StringBuilder("Hello");
        System.out.println("初始: " + sb);

        // append 追加
        sb.append(", ").append("Java");
        System.out.println("追加后: " + sb);

        // insert 插入
        sb.insert(0, "Say: ");
        System.out.println("插入后: " + sb);

        // delete 删除
        sb.delete(0, 5);
        System.out.println("删除后: " + sb);

        // replace 替换区间
        sb.replace(0, 5, "HELLO");
        System.out.println("替换后: " + sb);

        // reverse 反转
        sb.reverse();
        System.out.println("反转后: " + sb);

        // 容量与长度
        StringBuilder sb2 = new StringBuilder();
        System.out.println("默认容量: " + sb2.capacity());
        System.out.println("长度: " + sb2.length());
        sb2.ensureCapacity(100);
        System.out.println("扩容后容量: " + sb2.capacity());

        // StringBuffer 线程安全
        StringBuffer buffer = new StringBuffer("thread-safe");
        System.out.println("StringBuffer: " + buffer.reverse());

        // 性能对比: + 拼接 vs StringBuilder
        final int N = 10000;

        long start1 = System.nanoTime();
        String s = "";
        for (int i = 0; i < N; i++) {
            s = s + i;
        }
        long time1 = System.nanoTime() - start1;

        long start2 = System.nanoTime();
        StringBuilder sb3 = new StringBuilder();
        for (int i = 0; i < N; i++) {
            sb3.append(i);
        }
        long time2 = System.nanoTime() - start2;

        System.out.println("+ 拼接耗时(ns): " + time1);
        System.out.println("StringBuilder 耗时(ns): " + time2);
        System.out.println("StringBuilder 快 " + (time1 * 1.0 / time2) + " 倍");
    }
}`
  },
  {
    id: "java-string-format",
    group: "字符串与字符",
    icon: "🎨",
    title: "字符串格式化",
    content: `# 字符串格式化

Java 提供了强大的字符串格式化能力，主要依托 \`String.format\`、\`System.out.printf\` 和 \`java.util.Formatter\` 类，语法类似 C 语言的 printf。

## String.format 基本用法

\`\`\`java
String s = String.format("姓名: %s, 年龄: %d", "张三", 18);
\`\`\`

## 格式说明符

完整格式：\`%[参数索引$][标志][宽度][.精度]转换符\`

### 常用转换符

| 符号 | 类型 | 示例 |
|------|------|------|
| \`%d\` | 十进制整数 | 42 |
| \`%f\` | 浮点数 | 3.140000 |
| \`%s\` | 字符串 | hello |
| \`%c\` | 字符 | A |
| \`%b\` | 布尔 | true |
| \`%x\` | 十六进制整数 | ff |
| \`%X\` | 大写十六进制 | FF |
| \`%o\` | 八进制整数 | 17 |
| \`%e\` | 科学计数法 | 1.234500e+02 |
| \`%g\` | 自动选择 %f 或 %e | 1.2345 |
| \`%h\` | 哈希码 | 1a2b3c |
| \`%%\` | 百分号本身 | % |
| \`%n\` | 平台换行符 | \\n |

## 宽度、精度与对齐

- 宽度：\`%10d\` 占 10 个字符宽度，默认右对齐
- 精度：\`%.2f\` 保留 2 位小数；\`%.3s\` 截断字符串为 3 个字符
- 左对齐：\`%-10d\` 加负号
- 补零：\`%05d\` 用 0 补齐
- 千分位：\`%,d\` 加逗号
- 正负号：\`%+d\` 显示正号
- 空格：\`% d\` 正数前补空格
- 分组：\`%,(d\` 负数用括号表示

## 参数索引

\`%1$s\` 表示第一个参数，可以重复使用同一个参数：

\`\`\`java
String.format("%1$s 喜欢 %1$s", "Java")  // Java 喜欢 Java
\`\`\`

\`<\` 表示复用上一个参数：\`%<d\`。

## printf 与 Formatter

- \`System.out.printf\` 直接输出格式化结果，返回 PrintStream
- \`Formatter\` 类可输出到任意 \`Appendable\`（文件、流、StringBuilder 等）
- \`String.format\` 内部就是用 Formatter 实现

## 日期时间格式化

\`%t\` 系列转换符用于日期时间，需要传入 \`Date\` 或 \`Calendar\` 或 \`TemporalAccessor\`：

- \`%tY\` 四位年、\`%tm\` 两位月、\`%td\` 两位日
- \`%tH\` 时、\`%tM\` 分、\`%tS\` 秒
- \`%tF\` ISO 日期（2024-01-15）
- \`%tT\` 24 小时制时间
- \`%tD\` 美式日期（01/15/24）

## Locale 的影响

格式化受 \`Locale\` 影响，如小数点符号、千分位符号、月份名称。可通过 \`String.format(locale, fmt, args)\` 指定。

例如德国用逗号作小数点，法国用空格作千分位。国际化应用务必显式传 \`Locale\`，避免在不同机器上输出不一致。

## 常见陷阱

- \`%\` 后不能直接跟数字以外的非法字符，否则抛 \`UnknownFormatConversionException\`
- 参数数量不匹配会抛 \`MissingFormatArgumentException\`
- \`%s\` 可接收任意对象（调用其 \`toString\`），\`%d\` 只能接收整型
- 浮点数默认 6 位小数

## 性能注意

\`String.format\` 每次调用都会创建 Formatter 对象，高频场景下不如直接拼接。但对可读性要求高的日志、报表场景，可读性优先于性能。

下面通过代码演示各种格式化技巧：`,
    code: `// 演示字符串格式化
import java.util.Formatter;

public class Main {
    public static void main(String[] args) {
        // 基本格式化
        String s1 = String.format("姓名: %s, 年龄: %d", "张三", 18);
        System.out.println(s1);

        // 各种转换符
        System.out.printf("整数: %d%n", 42);
        System.out.printf("浮点: %f%n", 3.14);
        System.out.printf("字符: %c%n", 'A');
        System.out.printf("布尔: %b%n", true);
        System.out.printf("十六进制: %x%n", 255);
        System.out.printf("大写十六进制: %X%n", 255);
        System.out.printf("八进制: %o%n", 15);
        System.out.printf("科学计数: %e%n", 123.45);

        // 宽度与对齐
        System.out.printf("[%10d]%n", 42);     // 右对齐，宽度 10
        System.out.printf("[%-10d]%n", 42);    // 左对齐
        System.out.printf("[%05d]%n", 42);     // 补零
        System.out.printf("[%,d]%n", 1000000); // 千分位
        System.out.printf("[%+d]%n", 42);      // 显示正号

        // 精度
        System.out.printf("圆周率: %.2f%n", 3.14159);
        System.out.printf("截断字符串: %.3s%n", "HelloJava");

        // 参数索引
        String s2 = String.format("%1$s 喜欢 %1$s，不喜欢 %2$s", "Java", "Python");
        System.out.println(s2);

        // 百分号与换行
        System.out.printf("进度: %d%%%n", 80);

        // Formatter 类
        StringBuilder sb = new StringBuilder();
        Formatter fmt = new Formatter(sb);
        fmt.format("姓名=%s; 分数=%.1f%n", "李四", 95.5);
        fmt.format("等级=%c%n", 'A');
        System.out.println(sb);

        // 日期格式化
        java.util.Date now = new java.util.Date();
        System.out.printf("ISO 日期: %tF%n", now);
        System.out.printf("时间: %tT%n", now);
        System.out.printf("美式日期: %tD%n", now);
    }
}`
  },
  {
    id: "java-string-compare",
    group: "字符串与字符",
    icon: "⚖️",
    title: "字符串比较",
    content: `# 字符串比较

字符串比较是 Java 面试的高频考点，也是实际开发中容易出错的地方。理解引用比较与内容比较的区别至关重要。

## == vs equals

- \`==\` 比较的是**引用地址**，即两个变量是否指向同一个对象
- \`equals()\` 比较的是**内容**，即字符序列是否相同

\`\`\`java
String a = "hello";
String b = "hello";
String c = new String("hello");

a == b        // true  常量池复用
a == c        // false 不同对象
a.equals(c)   // true  内容相同
\`\`\`

## equalsIgnoreCase

忽略大小写比较，对 Unicode 也有良好支持：

\`\`\`java
"Hello".equalsIgnoreCase("hello")  // true
\`\`\`

## compareTo

按字典序（Unicode 码点值）比较，返回差值：

- 返回 0：相等
- 返回负数：当前字符串在前
- 返回正数：当前字符串在后

\`compareToIgnoreCase\` 忽略大小写。对于自然语言排序，应使用 \`Collator\` 类。

## contentEquals

\`contentEquals(CharSequence)\` 可与任意 CharSequence（包括 StringBuilder、StringBuffer）比较内容，而 \`equals\` 只接受 Object：

\`\`\`java
sb.contentEquals("abc")
\`\`\`

## regionMatches

比较两个字符串指定区间的子串是否相等，可忽略大小写：

\`\`\`java
str.regionMatches(ignoreCase, toffset, other, ooffset, len)
\`\`\`

## 字符串常量池

JVM 维护一个字符串常量池（String Pool）：
- 字面量 \`"abc"\` 创建时会先在池中查找，存在则复用
- \`new String("abc")\` 会在堆上创建新对象，同时也会在池中创建（如果池中没有）

## intern 方法

\`intern()\` 返回字符串的规范表示：
- 如果池中存在等值字符串，返回池中对象
- 如果池中不存在，将当前字符串加入池中并返回

\`\`\`java
String c = new String("hello");
String d = c.intern();
c == d       // false
a == d       // true
\`\`\`

## 常见陷阱

1. 用 \`==\` 比较字符串内容（应使用 \`equals\`）
2. 拼接的字符串不在常量池中（运行期拼接不进池）
3. \`equals\` 左边可能为 null，应使用 \`"abc".equals(s)\` 而非 \`s.equals("abc")\`，避免 NPE
4. \`Objects.equals(a, b)\` 可两侧都为 null，更安全

## 大小写转换的陷阱

不同语言环境下大小写转换结果不同，最典型的是土耳其语：
- 英文 \`"I".toLowerCase()\` → \`"i"\`
- 土耳其语 \`"I".toLowerCase(Locale.forLanguageTag("tr"))\` → \`"ı"\`（无点）

涉及本地化的转换应显式指定 \`Locale\`，否则可能引发"土耳其语 i 问题"。

## 性能建议

- 大量比较时，先用 \`length()\` 过滤可加速（长度不同必不等）
- \`equals\` 内部会先比较长度再逐字符比较
- 作为 HashMap key 时，缓存的 hashCode 让 String 性能优异

下面通过代码演示各种比较方式和陷阱：`,
    code: `// 演示字符串比较与陷阱
public class Main {
    public static void main(String[] args) {
        // == 与 equals
        String a = "hello";
        String b = "hello";
        String c = new String("hello");

        System.out.println("a == b: " + (a == b));            // true 常量池
        System.out.println("a == c: " + (a == c));            // false 堆对象
        System.out.println("a.equals(c): " + a.equals(c));    // true 内容

        // equalsIgnoreCase
        System.out.println("忽略大小写: " + "Hello".equalsIgnoreCase("HELLO"));

        // compareTo
        System.out.println("apple vs banana: " + "apple".compareTo("banana"));
        System.out.println("banana vs apple: " + "banana".compareTo("apple"));
        System.out.println("apple vs apple: " + "apple".compareTo("apple"));
        System.out.println("忽略大小写比较: " + "Apple".compareToIgnoreCase("apple"));

        // contentEquals
        StringBuilder sb = new StringBuilder("hello");
        System.out.println("contentEquals: " + a.contentEquals(sb));

        // intern 方法
        String s1 = new String("java");
        String s2 = "java";
        String s3 = s1.intern();

        System.out.println("s1 == s2: " + (s1 == s2));        // false
        System.out.println("s1 == s3: " + (s1 == s3));        // false
        System.out.println("s2 == s3: " + (s2 == s3));        // true

        // 拼接陷阱
        String x = "hello world";
        String y = "hello " + "world";   // 编译期常量折叠
        String z = "hello " + "world".intern();
        System.out.println("x == y: " + (x == y));            // true
        System.out.println("x == z: " + (x == z));            // true

        // 运行期拼接不在常量池
        String part = "hello ";
        String w = part + "world";
        System.out.println("x == w: " + (x == w));            // false
        System.out.println("x == w.intern(): " + (x == w.intern())); // true

        // null 陷阱
        String maybe = null;
        // maybe.equals("abc"); // 抛 NullPointerException
        System.out.println("安全比较: " + "abc".equals(maybe)); // false
        System.out.println("Objects.equals: " + java.util.Objects.equals(maybe, "abc"));
    }
}`
  },
  {
    id: "java-text-block",
    group: "字符串与字符",
    icon: "📄",
    title: "文本块（Java 13+）",
    content: `# 文本块（Java 13+）

文本块（Text Block）是 Java 13 引入预览、Java 15 转正的多行字符串字面量，用三引号 \`"""\` 包裹，极大简化了 JSON、SQL、HTML 等多行文本的编写。

## 基本语法

\`\`\`java
String json = """
        {
            "name": "张三",
            "age": 18
        }
        """;
\`\`\`

- 以 \`"""\` 开始，后面必须换行（不能跟内容）
- 以 \`"""\` 结束，可以单独成行
- 内容中的转义字符仍然有效（\`\\n\`、\`\\t\`、\`\\"\\\`）

## 缩进管理

文本块会自动去除"公共前导空白"（incidental white space）。规则是取所有非空行（以及结束 \`"""\` 行）中最小的前导空白作为基准去除。

- 结束 \`"""\` 的位置决定保留的缩进：\`"""\` 越靠左，保留的缩进越少
- 可以用 \`stripIndent()\` 手动处理缩进
- \`translatedEscapes()\` 将转义序列翻译为实际字符

## 转义序列

文本块内仍可使用 \`\\n\`、\`\\t\`、\`\\"\\\` 等转义。新增两个特殊转义：

- \`\\\\\` 行尾续行符：取消换行，把下一行连到当前行（保留视觉换行）
- \`\\s\` 保留尾部空格（普通尾部空格会被自动去除）

## 格式化文本块

文本块可以和 \`String.format\` 结合，Java 15 新增了 \`formatted\` 实例方法：

\`\`\`java
String template = """
        姓名: %s
        年龄: %d
        """.formatted("张三", 18);
\`\`\`

\`formatted\` 等价于 \`String.format(this, args)\`。

## 与传统拼接对比

传统方式编写 JSON 需要大量转义和换行符：

\`\`\`java
String old = "{\\n" +
             "  \\"name\\": \\"张三\\"\\n" +
             "}";
\`\`\`

文本块让代码更易读、更不易出错。

## 适用场景

- 编写 SQL 语句（多行、带缩进）
- 编写 JSON / XML / HTML 模板
- 编写多行提示词（如 LLM prompt）
- 生成代码模板、配置文件
- 编写正则表达式（避免双重转义）

## 注意事项

- 文本块不是"原始字符串"，转义仍然生效
- 结束 \`"""\` 单独成行时，会在末尾添加一个换行符
- 不能用文本块表示单个 \`"""\`，需要转义
- 文本块开头的 \`"""\` 后必须换行，否则编译错误

## 与其他语言对比

- Python 的三引号字符串类似但不处理缩进
- Kotlin 也有文本块，语法一致
- Groovy 的 \`"""\` 字符串支持插值（\`$\{var}\`），Java 不支持原生插值，需配合 \`formatted\`

## 嵌套引号

文本块内可以直接使用单引号 \`"\` 和双引号 \`""\`，无需转义。只有当连续三个引号出现在行尾时才需要转义最后一个：

\`\`\`java
String s = """
        他说 "你好"
        """;
\`\`\`

## 实际开发建议

- 用文本块替代复杂的 \`+\\n\` 拼接，提升可读性
- 配合 \`formatted\` 实现模板化
- 对 SQL、HTML、JSON 等结构化文本尤其有用
- 注意检查最终字符串的缩进是否符合预期

下面通过代码演示文本块的各种用法：`,
    code: `// 演示文本块（Java 13+）
public class Main {
    public static void main(String[] args) {
        // 基本文本块 - JSON
        String json = """
                {
                    "name": "张三",
                    "age": 18,
                    "city": "北京"
                }
                """;
        System.out.println("=== JSON 文本块 ===");
        System.out.println(json);

        // SQL 语句
        String sql = """
                SELECT id, name, age
                FROM users
                WHERE age > 18
                ORDER BY name
                """;
        System.out.println("=== SQL 文本块 ===");
        System.out.println(sql);

        // HTML
        String html = """
                <html>
                    <body>
                        <h1>Hello, Java</h1>
                    </body>
                </html>
                """;
        System.out.println("=== HTML 文本块 ===");
        System.out.println(html);

        // 行尾续行符 \\
        String oneLine = """
                这是一个 \\
                被拼接成 \\
                一行的字符串
                """;
        System.out.println("=== 续行符 ===");
        System.out.println(oneLine);

        // \\s 保留尾部空格
        String withSpace = "name: 张三   \\s";
        System.out.println("=== 保留空格 ===");
        System.out.println("[" + withSpace + "]");

        // formatted 格式化
        String info = """
                === 用户信息 ===
                姓名: %s
                年龄: %d
                城市: %s
                """.formatted("李四", 25, "上海");
        System.out.println(info);

        // 对比传统字符串拼接
        String oldWay = "{\\n" +
                "  \\"name\\": \\"王五\\",\\n" +
                "  \\"age\\": 30\\n" +
                "}";
        System.out.println("=== 传统拼接 ===");
        System.out.println(oldWay);
    }
}`
  },
  {
    id: "java-regex-basics",
    group: "字符串与字符",
    icon: "🔍",
    title: "正则表达式基础",
    content: `# 正则表达式基础

Java 通过 \`java.util.regex\` 包提供正则表达式支持，核心类是 \`Pattern\` 和 \`Matcher\`。正则是文本处理的利器，但也是性能与可读性的双刃剑。

## 核心类

- \`Pattern\`：编译后的正则表达式，线程安全，可复用
- \`Matcher\`：对输入字符串执行匹配操作的引擎，非线程安全
- \`String.matches(regex)\`：便捷方法，等价于 \`Pattern.matches(regex, input)\`

## 基本匹配流程

\`\`\`java
Pattern p = Pattern.compile("\\\\d+");
Matcher m = p.matcher("12345");
boolean found = m.matches();  // 整体匹配
\`\`\`

## 字符类

| 写法 | 含义 |
|------|------|
| \`[abc]\` | a 或 b 或 c |
| \`[^abc]\` | 非 a/b/c |
| \`[a-z]\` | a 到 z |
| \`[a-zA-Z0-9]\` | 字母数字 |
| \`.\` | 任意字符（默认不含换行） |
| \`\\\\d\` | 数字 [0-9] |
| \`\\\\D\` | 非数字 |
| \`\\\\w\` | 单词字符 [a-zA-Z0-9_] |
| \`\\\\W\` | 非单词字符 |
| \`\\\\s\` | 空白字符 |
| \`\\\\S\` | 非空白 |

Java 字符串中反斜杠是转义符，所以正则的 \`\\\\d\` 在 Java 字符串中要写成 \`"\\\\\\\\d"\`（四个反斜杠）。

## 量词

| 写法 | 含义 |
|------|------|
| \`X?\` | 0 或 1 次 |
| \`X*\` | 0 或多次 |
| \`X+\` | 1 或多次 |
| \`X{n}\` | 恰好 n 次 |
| \`X{n,}\` | 至少 n 次 |
| \`X{n,m}\` | n 到 m 次 |

## 锚点

| 写法 | 含义 |
|------|------|
| \`^\` | 行开头（多行模式下匹配每行开头） |
| \`$\` | 行结尾 |
| \`\\\\b\` | 单词边界 |
| \`\\\\B\` | 非单词边界 |
| \`\\\\A\` | 输入开头 |
| \`\\\\z\` | 输入结尾 |

## 三个核心方法

- \`matches()\`：整个字符串是否匹配（从头到尾）
- \`find()\`：是否找到下一个匹配子串（部分匹配）
- \`group()\`：返回上一次匹配的子串
- \`start()\` / \`end()\`：匹配的起止位置

## 标志位

\`Pattern.compile(regex, flags)\` 可指定标志：
- \`CASE_INSENSITIVE\`：忽略大小写
- \`MULTILINE\`：多行模式
- \`DOTALL\`：\`.\` 匹配换行
- \`UNICODE_CASE\`：Unicode 大小写
- \`LITERAL\`：把模式当作字面量（特殊字符不解析）
- \`COMMENTS\`：允许模式中用 \`#\` 写注释、忽略空白

可在正则内用 \`(?i)\`、\`(?m)\`、\`(?s)\` 等内嵌标志，只影响后续部分。

## 反斜杠的双重转义

这是 Java 正则最大的痛点。正则 \`\\\\d\` 在 Java 字符串中要写成 \`"\\\\\\\\d"\`：
- Java 字符串解析：\`\\\\\\\\\` → \`\\\\\`（两个反斜杠变一个）
- 正则引擎解析：\`\\\\\` → 匹配数字

建议用 \`Pattern.compile\` 配合清晰的注释，或使用文本块（Java 13+）减少转义层级。

## 性能注意

- 频繁使用的正则应预编译为 \`static final Pattern\`
- 避免灾难性回溯（如 \`(a+)+b\` 匹配 \`aaaaaaaaaaaa\`）
- 用户输入的正则要做超时保护或限制复杂度

## String 的正则方法

- \`matches(regex)\`：整体匹配
- \`split(regex)\`：拆分
- \`replaceAll(regex, repl)\`：替换
- \`replaceFirst(regex, repl)\`：替换第一个

这些方法每次调用都重新编译正则，高频调用应改用预编译的 Pattern。

下面通过代码演示基本正则匹配：`,
    code: `// 演示正则表达式基础
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {
    public static void main(String[] args) {
        // String.matches 整体匹配
        System.out.println("12345 是数字: " + "12345".matches("\\\\d+"));
        System.out.println("12a45 是数字: " + "12a45".matches("\\\\d+"));

        // 字符类
        System.out.println("a 是元音: " + "a".matches("[aeiou]"));
        System.out.println("b 是元音: " + "b".matches("[aeiou]"));
        System.out.println("Java 是字母: " + "Java".matches("[a-zA-Z]+"));
        System.out.println("hello123 含字母数字: " + "hello123".matches("[a-zA-Z0-9]+"));

        // 量词
        System.out.println("aaa 匹配 a{3}: " + "aaa".matches("a{3}"));
        System.out.println("aaaa 匹配 a{2,3}: " + "aaaa".matches("a{2,3}"));
        System.out.println("a 匹配 a?: " + "a".matches("a?"));

        // Pattern 与 Matcher
        Pattern p = Pattern.compile("\\\\d{4}-\\\\d{2}-\\\\d{2}");
        Matcher m = p.matcher("日期 2024-01-15 和 2024-12-31");

        System.out.println("=== find 查找所有匹配 ===");
        while (m.find()) {
            System.out.println("找到: " + m.group() + " 位置: " + m.start() + "-" + m.end());
        }

        // 单词边界
        Pattern wordP = Pattern.compile("\\\\bcat\\\\b");
        Matcher wordM = wordP.matcher("a cat is not a category");
        System.out.println("=== 单词边界 ===");
        while (wordM.find()) {
            System.out.println("找到单词: " + wordM.group());
        }

        // 锚点
        System.out.println("以 Hello 开头: " + "Hello World".matches("^Hello.*"));
        System.out.println("以 World 结尾: " + "Hello World".matches(".*World$"));

        // 邮箱简单验证
        String emailRegex = "[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}";
        System.out.println("邮箱有效: " + "test@example.com".matches(emailRegex));
        System.out.println("邮箱无效: " + "not-an-email".matches(emailRegex));

        // 忽略大小写标志
        Pattern ignoreCase = Pattern.compile("java", Pattern.CASE_INSENSITIVE);
        System.out.println("忽略大小写: " + ignoreCase.matcher("JAVA").matches());
    }
}`
  },
  {
    id: "java-regex-advanced",
    group: "字符串与字符",
    icon: "🔬",
    title: "正则表达式进阶",
    content: `# 正则表达式进阶

掌握了基础匹配后，进阶内容包括分组、前瞻后顾、反向引用、替换、拆分和量词模式。

## 分组捕获

用括号 \`()\` 创建捕获组，按左括号顺序编号：

\`\`\`java
(\\\\d{4})-(\\\\d{2})-(\\\\d{2})
\`\`\`

- \`group(0)\`：整个匹配
- \`group(1)\`：第一个分组（年）
- \`group(2)\`：第二个分组（月）
- \`group(3)\`：第三个分组（日）

\`groupCount()\` 返回分组数量（不含 group 0）。

## 命名分组

\`(?<name>...)\` 创建命名组，用 \`group("name")\` 获取：

\`\`\`java
(?<year>\\\\d{4})-(?<month>\\\\d{2})
\`\`\`

## 非捕获组

\`(?:...)\` 表示非捕获组，只分组不捕获，性能更好：

\`\`\`java
(?:\\\\d{4})-(\\\\d{2})
\`\`\`

## 反向引用

\`\\\\1\`、\`\\\\2\` 引用前面的捕获组，用于匹配重复内容：

\`\`\`java
(\\\\w)\\\\1   // 匹配连续两个相同字符，如 "aa"
\`\`\`

## 前瞻后顾（Lookaround）

| 写法 | 含义 |
|------|------|
| \`X(?=Y)\` | 正向肯定前瞻：X 后面是 Y |
| \`X(?!Y)\` | 正向否定前瞻：X 后面不是 Y |
| \`(?<=Y)X\` | 正向后顾：X 前面是 Y |
| \`(?<!Y)X\` | 否定后顾：X 前面不是 Y |

前瞻后顾只判断不消费字符（零宽断言）。

## 替换

- \`replaceAll(regex, repl)\`：替换所有
- \`replaceFirst(regex, repl)\`：替换第一个
- 替换串中可用 \`$1\`、\`$2\` 引用捕获组
- \`$<name>\` 引用命名组

## split

按正则拆分字符串，可选 limit 参数限制拆分次数。limit 为负数时保留尾部空字符串。

## 三种量词模式

| 模式 | 写法 | 行为 |
|------|------|------|
| 贪婪（默认） | \`X*\` | 尽可能多匹配，会回溯 |
| 勉强（懒惰） | \`X*?\` | 尽可能少匹配 |
| 占有 | \`X*+\` | 尽可能多且不回溯 |

贪婪会回溯，占有不回溯性能更好但不一定能匹配成功。占有量词适合大文本防回溯爆炸。

## 常用预定义字符类

- \`\\\\p{Lower}\` 小写字母
- \`\\\\p{Upper}\` 大写字母
- \`\\\\p{Digit}\` 数字
- \`\\\\p{Alnum}\` 字母数字
- \`\\\\p{Han}\` 中文汉字
- \`\\\\p{Punct}\` 标点符号
- \`\\\\p{Blank}\` 空白（空格或制表符）

否定形式用大写：\`\\\\P{Han}\` 表示非汉字。

## 边界匹配进阶

- \`\\\\G\`：上一次匹配的结尾（连续匹配场景）
- \`\\\\R\`：Unicode 换行符（匹配 \\r\\n、\\n、\\r 等）
- \`\\\\z\` vs \`\\\\Z\`：\`\\\\Z\` 允许末尾有换行，\`\\\\z\` 不允许

## 替换的特殊处理

替换串中 \`\\\`\` 用于转义 \`$\`，避免被当作组引用：

\`\`\`java
"abc".replaceAll("b", "$1")  // 抛异常，$1 未定义
"abc".replaceAll("b", "\\\\$1")  // 字面替换为 $1
\`\`\`

\`Matcher.replaceAll\` 还支持 \`Function<MatchResult, String>\`（Java 9+），可动态计算替换值。

## split 的细节

- 默认丢弃尾部空字符串
- \`limit > 0\`：最多拆分 limit 段
- \`limit < 0\`：保留所有段（含尾部空串）
- \`limit == 0\`：等同默认

\`\`\`java
"a,b,,".split(",")        // ["a","b"]
"a,b,,".split(",", -1)    // ["a","b","",""]
\`\`\`

## 常见应用

- 提取信息：日期、电话、邮箱、URL
- 数据清洗：去除多余空白、统一格式
- 校验输入：密码强度、用户名规则
- 模板替换：占位符填充

## 注意事项

- 复杂正则难以维护，建议加注释（\`Pattern.COMMENTS\`）
- 用在线工具（如 regex101）调试
- 注意 Unicode 字符的码点匹配

下面通过代码演示高级正则用法：`,
    code: `// 演示正则表达式进阶
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Main {
    public static void main(String[] args) {
        // 分组捕获
        Pattern dateP = Pattern.compile("(\\\\d{4})-(\\\\d{2})-(\\\\d{2})");
        Matcher dateM = dateP.matcher("2024-01-15");
        if (dateM.matches()) {
            System.out.println("年: " + dateM.group(1));
            System.out.println("月: " + dateM.group(2));
            System.out.println("日: " + dateM.group(3));
        }

        // 命名分组
        Pattern namedP = Pattern.compile("(?<year>\\\\d{4})-(?<month>\\\\d{2})");
        Matcher namedM = namedP.matcher("2024-01");
        if (namedM.matches()) {
            System.out.println("命名组 年: " + namedM.group("year"));
            System.out.println("命名组 月: " + namedM.group("month"));
        }

        // 非捕获组
        Pattern ncP = Pattern.compile("(?:\\\\d{4})-(\\\\d{2})");
        Matcher ncM = ncP.matcher("2024-01");
        if (ncM.matches()) {
            System.out.println("非捕获组 groupCount: " + ncM.groupCount());
            System.out.println("月: " + ncM.group(1));
        }

        // 反向引用：匹配连续重复字符
        Pattern dupP = Pattern.compile("(\\\\w)\\\\1");
        Matcher dupM = dupP.matcher("aabbcde");
        System.out.println("=== 反向引用 ===");
        while (dupM.find()) {
            System.out.println("重复: " + dupM.group());
        }

        // 前瞻：匹配后面跟着数字的字母
        Pattern lookP = Pattern.compile("[a-z](?=[0-9])");
        Matcher lookM = lookP.matcher("a1 b2 c3");
        System.out.println("=== 正向前瞻 ===");
        while (lookM.find()) {
            System.out.println("匹配: " + lookM.group());
        }

        // 后顾：匹配数字后面的字母
        Pattern behindP = Pattern.compile("(?<=[0-9])[a-z]");
        Matcher behindM = behindP.matcher("1a 2b 3c");
        System.out.println("=== 正向后顾 ===");
        while (behindM.find()) {
            System.out.println("匹配: " + behindM.group());
        }

        // 替换 + 引用分组
        String masked = "13912345678".replaceAll("(\\\\d{3})\\\\d{4}(\\\\d{4})", "$1****$2");
        System.out.println("脱敏: " + masked);

        // 贪婪 vs 勉强
        String html = "<b>粗体</b><i>斜体</i>";
        System.out.println("贪婪: " + html.replaceAll("<.*>", ""));     // 全部替换为空
        System.out.println("勉强: " + html.replaceAll("<.*?>", ""));    // 只替换标签

        // 占有量词
        System.out.println("占有匹配: " + "aaaa".matches("a++a"));     // false 不回溯
        System.out.println("贪婪匹配: " + "aaaa".matches("a+a"));      // true 会回溯

        // 匹配中文（Java 正则用 \\p{IsHan} 或 \\p{script=Han} 匹配汉字）
        System.out.println("是中文: " + "汉字".matches("\\\\p{IsHan}+"));
    }
}`
  },
  {
    id: "java-string-encoding",
    group: "字符串与字符",
    icon: "🌐",
    title: "字符串与编码",
    content: `# 字符串与编码

理解字符编码是处理多语言文本、网络传输、文件读写的基础。乱码问题几乎都源于编码与解码字符集不一致。

## 常见编码

### ASCII
7 位编码，共 128 个字符，包含英文、数字、标点。一个字节足以存储。

### ISO-8859-1（Latin-1）
8 位编码，扩展 ASCII 到 256 个字符，覆盖西欧语言。每个字节对应一个字符，是单字节编码。

### Unicode
统一码，旨在收录世界上所有字符。常用 16 位（U+0000 到 U+FFFF，BMP 平面），扩展到 21 位（含补充平面，如 emoji）。

### UTF-8
变长编码（1-4 字节），兼容 ASCII，互联网主流编码：
- ASCII 字符 1 字节
- 拉丁/希腊字母 2 字节
- 中文常用 3 字节
- emoji 等 4 字节

### UTF-16
变长编码（2 或 4 字节），Java 内部使用。BMP 平面字符 2 字节，补充平面 4 字节（代理对）。

### GBK / GB2312
中文国标，2 字节表示一个汉字，无法表示 emoji。

## Java 中的编码转换

### String → byte[]

\`\`\`java
byte[] bytes = "中文".getBytes(StandardCharsets.UTF_8);
\`\`\`

### byte[] → String

\`\`\`java
String s = new String(bytes, StandardCharsets.UTF_8);
\`\`\`

\`StandardCharsets\` 提供常用字符集常量：\`UTF_8\`、\`UTF_16\`、\`ISO_8859_1\`、\`US_ASCII\`，可避免抛 checked exception。

## 乱码原因

乱码本质是**编码与解码使用了不同的字符集**：

1. 用 GBK 编码、UTF-8 解码 → 乱码
2. 用 UTF-8 编码、GBK 解码 → 乱码
3. ISO-8859-1 是单字节编码，无法表示中文，常用于"中转"但会丢失信息

## 修复乱码

如果知道原始编码，可以"先按错误编码解码回字节，再用正确编码重新解码"：

\`\`\`java
String fixed = new String(garbled.getBytes("ISO-8859-1"), "UTF-8");
\`\`\`

但前提是中转编码（如 ISO-8859-1）能无损保留字节。如果用 GBK 错误解码 UTF-8 字节后，再转回字节可能已经不可逆。

## char 与编码

Java 的 \`char\` 是 16 位 UTF-16 单元。对于 emoji 等补充平面字符，需要用代理对（两个 char）表示：
- \`String.length()\` 返回 char 单元数，不是字符数
- 应该用 \`codePointCount\` 获取真实字符数
- 用 \`codePoints()\` 流遍历所有码点

## 实践建议

- 文件、网络传输统一用 UTF-8
- 永远显式指定字符集，不依赖平台默认
- 数据库连接、HTTP 请求都要指定 charset

## BOM（字节顺序标记）

UTF-16 和部分 UTF-8 文件开头会有 BOM：
- UTF-16 LE 的 BOM 是 \`FF FE\`
- UTF-16 BE 的 BOM 是 \`FE FF\`
- UTF-8 的 BOM 是 \`EF BB BF\`（可选，不推荐）

Java 读取时需注意 BOM 会被当作普通字符，可用第三方库（如 Apache Commons IO 的 \`BOMInputStream\`）处理。

## Charset 与 CharsetEncoder

\`Charset\` 类提供更底层的编解码能力：
- \`Charset.forName("UTF-8")\`：按名称获取
- \`Charset.isSupported(name)\`：是否支持
- \`Charset.availableCharsets()\`：列出所有可用字符集

\`CharsetEncoder\` / \`CharsetDecoder\` 可精细控制编解码行为（如处理非法输入的策略：REPORT、IGNORE、REPLACE）。

## 常见乱码场景

1. 数据库 character_set 与连接字符集不一致
2. HTTP 响应未设置 \`Content-Type: charset=utf-8\`
3. 文件读写用默认字符集（跨平台不一致）
4. 网络协议字段用 ISO-8859-1 中转但未正确还原

下面通过代码演示编码转换与乱码修复：`,
    code: `// 演示字符串编码转换
import java.nio.charset.StandardCharsets;

public class Main {
    public static void main(String[] args) throws Exception {
        String chinese = "中文";

        // 不同编码下的字节数
        byte[] utf8 = chinese.getBytes(StandardCharsets.UTF_8);
        byte[] utf16 = chinese.getBytes(StandardCharsets.UTF_16);
        byte[] gbk = chinese.getBytes("GBK");
        byte[] iso = chinese.getBytes(StandardCharsets.ISO_8859_1);

        System.out.println("原文: " + chinese);
        System.out.println("UTF-8 字节数: " + utf8.length);    // 6
        System.out.println("UTF-16 字节数: " + utf16.length);  // 6(含 BOM)
        System.out.println("GBK 字节数: " + gbk.length);       // 4
        System.out.println("ISO-8859-1 字节数: " + iso.length);// 2 (丢失信息)

        // 正确解码
        String fromUtf8 = new String(utf8, StandardCharsets.UTF_8);
        String fromGbk = new String(gbk, "GBK");
        System.out.println("UTF-8 解码: " + fromUtf8);
        System.out.println("GBK 解码: " + fromGbk);

        // 乱码演示：UTF-8 字节用 GBK 解码
        String garbled = new String(utf8, "GBK");
        System.out.println("UTF-8 字节用 GBK 解码(乱码): " + garbled);

        // 修复乱码：知道是 GBK 错误解码了 UTF-8 字节
        String fixed = new String(garbled.getBytes("GBK"), StandardCharsets.UTF_8);
        System.out.println("修复乱码: " + fixed);

        // ISO-8859-1 中转修复
        String wrong = new String(utf8, StandardCharsets.ISO_8859_1);
        System.out.println("ISO-8859-1 中转(乱码): " + wrong);
        String fixed2 = new String(wrong.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8);
        System.out.println("ISO 中转修复: " + fixed2);

        // emoji 与 codePoint
        String emoji = "Java😀";
        System.out.println("=== emoji 编码 ===");
        System.out.println("length (char 单元): " + emoji.length());
        System.out.println("codePointCount (字符数): " + emoji.codePointCount(0, emoji.length()));
        System.out.println("UTF-8 字节数: " + emoji.getBytes(StandardCharsets.UTF_8).length);
        System.out.println("码点遍历:");
        emoji.codePoints().forEach(cp -> System.out.println("  U+" + Integer.toHexString(cp)));

        // 平台默认字符集
        System.out.println("默认字符集: " + java.nio.charset.Charset.defaultCharset());
    }
}`
  },
  {
    id: "java-char-class",
    group: "字符串与字符",
    icon: "🔤",
    title: "char 与 Character 类",
    content: `# char 与 Character 类

\`char\` 是 Java 八大基本类型之一，\`Character\` 是其对应的包装类。理解 char 的本质对处理字符数据至关重要。

## char 基本类型

- 16 位无符号整数，存储 UTF-16 编码单元
- 取值范围 \`\\u0000\` 到 \`\\uFFFF\`
- 字面量：\`'A'\`、\`'\\n'\`、\`'\\u4e2d'\`、\`'\\\\'\`、\`'\\''\`
- 可隐式转为 int（值为 Unicode 码点）

\`\`\`java
char c = 'A';
char n = '\\n';
char chinese = '中';
int code = c;  // char 可隐式转为 int，值为 65
\`\`\`

## Character 包装类

提供大量静态工具方法判断字符属性：

| 方法 | 说明 |
|------|------|
| \`isDigit(c)\` | 是否数字 |
| \`isLetter(c)\` | 是否字母 |
| \`isLetterOrDigit(c)\` | 是否字母或数字 |
| \`isUpperCase(c)\` | 是否大写 |
| \`isLowerCase(c)\` | 是否小写 |
| \`isWhitespace(c)\` | 是否空白 |
| \`toUpperCase(c)\` | 转大写 |
| \`toLowerCase(c)\` | 转小写 |
| \`getNumericValue(c)\` | 获取数值（如 'A' 返回 10） |
| \`digit(c, radix)\` | 指定进制下的数值 |
| \`forDigit(digit, radix)\` | 数值转字符 |
| \`isAlphabetic(c)\` | 是否字母（Unicode，比 isLetter 更宽） |
| \`getName(codePoint)\` | 获取字符名（Java 7+） |
| \`isSupplementaryCodePoint(cp)\` | 是否补充平面码点 |

## 自动装箱拆箱

\`Character ch = 'A';\` 自动装箱；\`char c = ch;\` 自动拆箱。装箱使用缓存（ASCII 范围）。

## char 运算

char 本质是整数，可以参与算术运算：

\`\`\`java
char c = 'A';
c = (char)(c + 1);  // 'B'
\`\`\`

大小写转换可以用位运算：\`c ^ 0x20\`（仅对 ASCII 字母有效，因为大小写相差 0x20）。

## 字符的 Unicode 分类

- \`Character.UnicodeBlock\`：字符所属 Unicode 块（如 CJK_UNIFIED_IDEOGRAPHS 表示中日韩汉字）
- \`Character.UnicodeScript\`：字符所属文字系统（如 HAN、LATIN）

判断中文常用 \`Character.UnicodeBlock.of(c) == CJK_UNIFIED_IDEOGRAPHS\`。

## 补充平面字符

emoji 等补充平面字符（U+10000 以上）无法用单个 char 表示，需要代理对（两个 char）：
- \`Character.isSurrogate(c)\` 判断是否代理字符
- \`Character.toCodePoint(high, low)\` 把代理对转为码点
- \`Character.toString(int codePoint)\`（Java 11+）把码点转为字符串

## 注意事项

- \`char\` 无法表示所有 Unicode 字符
- 遍历含 emoji 的字符串应用 \`codePoints()\` 而非 \`charAt\`
- 大小写转换有 locale 差异（如土耳其语的 i）

下面通过代码演示 char 与 Character 类：`,
    code: `// 演示 char 与 Character 类
public class Main {
    public static void main(String[] args) {
        // char 基本用法
        char a = 'A';
        char chinese = '中';
        char newline = '\\n';
        char unicode = '\\u4e2d';  // '中'

        System.out.println("a = " + a + ", code = " + (int) a);
        System.out.println("chinese = " + chinese + ", code = " + (int) chinese);
        System.out.println("unicode == chinese: " + (unicode == chinese));

        // char 运算
        char next = (char) (a + 1);
        System.out.println("A + 1 = " + next);
        System.out.println("大小写差值: " + ('a' - 'A'));

        // 位运算大小写转换
        char lower = (char) (a | 0x20);
        System.out.println("A 转 a: " + lower);

        // 遍历字母表
        System.out.println("=== 字母表 ===");
        for (char c = 'A'; c <= 'Z'; c++) {
            System.out.print(c);
        }
        System.out.println();

        // Character 判断方法
        System.out.println("=== Character 方法 ===");
        System.out.println("isDigit('5'): " + Character.isDigit('5'));
        System.out.println("isLetter('A'): " + Character.isLetter('A'));
        System.out.println("isLetter('中'): " + Character.isLetter('中'));
        System.out.println("isLetterOrDigit('a'): " + Character.isLetterOrDigit('a'));
        System.out.println("isUpperCase('A'): " + Character.isUpperCase('A'));
        System.out.println("isWhitespace(' '): " + Character.isWhitespace(' '));

        // 大小写转换
        System.out.println("toUpperCase('a'): " + Character.toUpperCase('a'));
        System.out.println("toLowerCase('Z'): " + Character.toLowerCase('Z'));

        // 数值与字符互转
        System.out.println("getNumericValue('A'): " + Character.getNumericValue('A'));
        System.out.println("digit('f', 16): " + Character.digit('f', 16));
        System.out.println("forDigit(15, 16): " + Character.forDigit(15, 16));

        // 判断中文
        char c = '汉';
        boolean isChinese = Character.UnicodeBlock.of(c) == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS;
        System.out.println("'汉' 是中文: " + isChinese);

        // 自动装箱拆箱
        Character boxed = 'X';
        char unboxed = boxed;
        System.out.println("装箱: " + boxed + ", 拆箱: " + unboxed);

        // 统计字符串中的字母和数字
        String s = "Java 17 是 LTS 版本 2021";
        int letters = 0, digits = 0, spaces = 0;
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (Character.isLetter(ch)) letters++;
            else if (Character.isDigit(ch)) digits++;
            else if (Character.isWhitespace(ch)) spaces++;
        }
        System.out.println("字母数: " + letters + ", 数字数: " + digits + ", 空格数: " + spaces);
    }
}`
  },
  {
    id: "java-string-joiner",
    group: "字符串与字符",
    icon: "🔗",
    title: "StringJoiner",
    content: `# StringJoiner

\`java.util.StringJoiner\` 是 Java 8 引入的工具类，用于以指定分隔符拼接字符串，比手动管理 StringBuilder 更简洁、更易读，尤其适合拼接带分隔符的列表。

## 构造方法

\`\`\`java
// 仅分隔符
StringJoiner sj = new StringJoiner(",");

// 分隔符 + 前缀 + 后缀
StringJoiner sj2 = new StringJoiner(",", "[", "]");
\`\`\`

## 常用方法

| 方法 | 说明 |
|------|------|
| \`add(CharSequence)\` | 追加元素 |
| \`merge(StringJoiner)\` | 合并另一个 StringJoiner |
| \`setEmptyValue(CharSequence)\` | 设置空时的默认值 |
| \`length()\` | 字符串长度（含前缀后缀） |
| \`toString()\` | 拼接结果 |
| \`isEmpty()\` | 是否为空（Java 21+） |

## 基本用法

\`\`\`java
StringJoiner sj = new StringJoiner(", ", "[", "]");
sj.add("apple").add("banana").add("cherry");
// [apple, banana, cherry]
\`\`\`

支持链式调用，\`add\` 返回 this。

## setEmptyValue

当 StringJoiner 没有添加任何元素时，默认返回空字符串（或仅前缀后缀 \`"[]"\`）。可以用 \`setEmptyValue\` 自定义：

\`\`\`java
StringJoiner sj = new StringJoiner(",");
sj.setEmptyValue("none");
// 输出 "none"
\`\`\`

这在数据库查询结果为空时返回默认值很有用。

## merge

合并两个 StringJoiner，被合并者的前缀后缀会被忽略，只取其内容：

\`\`\`java
sj1.merge(sj2);
\`\`\`

适合分批拼接后合并。

## String.join 静态方法

Java 8 同时提供 \`String.join\` 便捷方法：

\`\`\`java
String.join(",", "a", "b", "c");          // "a,b,c"
String.join("-", Arrays.asList("a","b")); // "a-b"
\`\`\`

\`String.join\` 内部就是用 StringJoiner 实现的，适合一次性拼接。

## 与 Stream 配合

\`Collectors.joining\` 是流式拼接的利器，内部也基于 StringJoiner：

\`\`\`java
list.stream().collect(Collectors.joining(", ", "[", "]"));
\`\`\`

三种重载：
- \`joining()\`：无分隔符
- \`joining(delimiter)\`：仅分隔符
- \`joining(delimiter, prefix, suffix)\`：分隔符+前后缀

## 适用场景

- 构造 SQL IN 子句
- 拼接日志、调试信息
- CSV 输出
- URL 参数拼接
- 集合转字符串

下面通过代码演示 StringJoiner：`,
    code: `// 演示 StringJoiner
import java.util.StringJoiner;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        // 基本用法：仅分隔符
        StringJoiner sj1 = new StringJoiner(",");
        sj1.add("apple").add("banana").add("cherry");
        System.out.println("仅分隔符: " + sj1);

        // 带前缀后缀
        StringJoiner sj2 = new StringJoiner(", ", "[", "]");
        sj2.add("apple").add("banana").add("cherry");
        System.out.println("带前后缀: " + sj2);

        // 空值默认行为
        StringJoiner sj3 = new StringJoiner(", ", "[", "]");
        System.out.println("空 joiner: [" + sj3 + "]");

        // setEmptyValue
        StringJoiner sj4 = new StringJoiner(",");
        sj4.setEmptyValue("none");
        System.out.println("空 joiner 默认值: " + sj4);

        // merge 合并
        StringJoiner base = new StringJoiner(" | ", "{", "}");
        base.add("a").add("b");
        StringJoiner extra = new StringJoiner(" ; ");
        extra.add("x").add("y");
        base.merge(extra);
        System.out.println("合并后: " + base);

        // length
        System.out.println("sj2 length: " + sj2.length());

        // String.join 静态方法
        String r1 = String.join("-", "2024", "01", "15");
        System.out.println("String.join 1: " + r1);

        List<String> list = Arrays.asList("Java", "Python", "Go");
        String r2 = String.join(", ", list);
        System.out.println("String.join 2: " + r2);

        // 与 Stream + Collectors.joining 配合
        String r3 = list.stream()
                .map(String::toUpperCase)
                .collect(Collectors.joining(" >> ", ">>>", "<<<"));
        System.out.println("Stream 拼接: " + r3);

        // 实际场景：构造 SQL IN 子句
        List<Integer> ids = Arrays.asList(1, 2, 3, 5, 8);
        String inClause = ids.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(", ", "IN (", ")"));
        System.out.println("SQL: " + inClause);

        // CSV 输出
        String csv = list.stream()
                .collect(Collectors.joining(","));
        System.out.println("CSV: " + csv);
    }
}`
  },
  {
    id: "java-string-pool",
    group: "字符串与字符",
    icon: "🏊",
    title: "字符串常量池",
    content: `# 字符串常量池

字符串常量池（String Pool / String Intern Pool）是 JVM 为优化字符串存储而设计的特殊内存区域，是理解字符串内存模型的关键。

## 池的位置

- **Java 6 及之前**：池位于方法区（PermGen），与堆分离
- **Java 7+**：池移到 Java 堆中
- **Java 8+**：方法区改为元空间（Metaspace），池仍在堆中

迁移到堆的原因：PermGen 大小固定且不易调整，大量 intern 容易 OOM；堆可以动态扩容且受 GC 管理，更灵活。

## 字面量创建

\`\`\`java
String s1 = "hello";
String s2 = "hello";
\`\`\`

JVM 在常量池中查找 \`"hello"\`：
- 不存在 → 创建对象放入池，返回引用
- 存在 → 直接返回池中引用

因此 \`s1 == s2\` 为 \`true\`，复用同一个对象。

## new String("...")

\`\`\`java
String s = new String("hello");
\`\`\`

这一行**至少创建一个对象**（堆上的新对象），**最多创建两个**（如果池中没有 \`"hello"\`，会先在池中创建，再在堆上创建）。

\`s == "hello"\` 为 \`false\`，因为 \`s\` 指向堆对象而非池中对象。

## intern 方法

\`intern()\` 主动将字符串放入池（如果不存在）并返回池中引用：

\`\`\`java
String s = new String("hello").intern();
\`\`\`

之后 \`s == "hello"\` 为 \`true\`。Java 7+ intern 不复制字符串，只存堆引用。

## 编译期常量折叠

纯字面量拼接会在编译期完成，结果放入常量池：

\`\`\`java
String s = "a" + "b";  // 编译为 "ab"，在池中
\`\`\`

\`final\` 修饰的变量也参与编译期折叠：

\`\`\`java
final String a = "a";
String s = a + "b";  // 等价于 "ab"，在池中
\`\`\`

但运行期变量拼接不会进入池：

\`\`\`java
String a = "a";
String s = a + "b";    // 不在池中，用 StringBuilder
\`\`\`

## 内存影响

- 大量重复字符串可用 \`intern\` 节省内存（如读取字典、配置）
- 但过度 intern 会让池膨胀，影响 GC
- Java 8+ 的 G1 支持 \`-XX:+UseStringDeduplication\` 自动去重，让相同内容的 String 共享底层 byte[]

## 验证方法

可用 \`==\` 验证对象是否同一引用，用 \`System.identityHashCode\` 查看对象实际地址。

## 池的底层实现

- Java 7+：池是堆中的一个哈希表（\`StringTable\`），key 是字符串的哈希，value 是引用
- 默认大小 1009（Java 7），可用 \`-XX:StringTableSize\` 调整
- 桶太少会导致哈希冲突多，intern 性能下降
- Java 8+ 桶数量默认根据内存自适应

## 与垃圾回收的关系

- Java 6：池在 PermGen，几乎不被 GC，intern 过多会 OOM
- Java 7+：池在堆中，池中引用指向的对象可被 GC（当无其他强引用时）
- 但池中"字面量"引用通常长期存在，难以回收

## 常见误区

1. "字符串池存字符串内容"——错，存的是引用
2. "intern 一定省内存"——错，过度使用反而增加池维护成本
3. "所有 String 都在池中"——错，只有字面量、常量折叠结果、intern 后的才在池中
4. "new String 一定创建两个对象"——错，只有池中不存在时才创建池中对象

## 调优参数

- \`-XX:StringTableSize\`：设置池的桶数量
- \`-XX:+PrintStringTableStatistics\`：JVM 退出时打印池统计
- \`-XX:+UseStringDeduplication\`：G1 字符串去重

下面通过代码演示字符串池行为：`,
    code: `// 演示字符串常量池行为
public class Main {
    public static void main(String[] args) {
        // 字面量：同一引用
        String s1 = "hello";
        String s2 = "hello";
        System.out.println("字面量 ==: " + (s1 == s2));   // true

        // new String：堆上新对象
        String s3 = new String("hello");
        System.out.println("字面量 vs new: " + (s1 == s3)); // false
        System.out.println("内容 equals: " + s1.equals(s3)); // true

        // new String 再 intern
        String s4 = s3.intern();
        System.out.println("intern 后 ==: " + (s1 == s4)); // true

        // 编译期常量折叠
        String s5 = "hel" + "lo";
        System.out.println("编译期折叠 ==: " + (s1 == s5)); // true

        // 运行期拼接不进池
        String part = "hel";
        String s6 = part + "lo";
        System.out.println("运行期拼接 ==: " + (s1 == s6));   // false
        System.out.println("intern 后 ==: " + (s1 == s6.intern())); // true

        // final 变量参与拼接
        final String finalPart = "hel";
        String s7 = finalPart + "lo";
        System.out.println("final 拼接 ==: " + (s1 == s7));  // true

        // new String(char[]) 不进池
        char[] chars = {'h', 'e', 'l', 'l', 'o'};
        String s8 = new String(chars);
        System.out.println("char[] 构造 ==: " + (s1 == s8));  // false

        // identityHashCode 查看对象地址
        System.out.println("s1 hash: " + System.identityHashCode(s1));
        System.out.println("s3 hash: " + System.identityHashCode(s3));
        System.out.println("s4 hash: " + System.identityHashCode(s4)); // 与 s1 相同

        // 验证池的位置（Java 7+ 在堆中）
        // 通过大量 intern 测试是否进入堆
        long before = Runtime.getRuntime().freeMemory();
        for (int i = 0; i < 100000; i++) {
            ("str" + i).intern();
        }
        long after = Runtime.getRuntime().freeMemory();
        System.out.println("intern 10w 字符串占用堆内存约: " + (before - after) + " bytes");

        // intern 在堆中：可以被 GC
        System.out.println("提示: Java 7+ 字符串池在堆中，受 GC 管理");
    }
}`
  },
  {
    id: "java-string-intern",
    group: "字符串与字符",
    icon: "🔑",
    title: "intern 方法深入",
    content: `# intern 方法深入

\`String.intern()\` 是一个原生（native）方法，返回字符串的"规范表示"，是理解字符串内存模型的关键，也是面试高频考点。

## 工作原理

1. 调用 \`intern()\` 时，JVM 查找字符串常量池
2. 如果池中存在与当前 String 内容相等的字符串，返回池中引用
3. 如果不存在：
   - **Java 6**：复制字符串到 PermGen 的池中，返回引用
   - **Java 7+**：把**堆上对象的引用**存入池中，返回该引用（不复制）

Java 7+ 的优化避免了 PermGen OOM，且让 intern 更高效——池中存的是引用而非副本。

## intern 后的 == 比较

\`\`\`java
String s1 = new String("hello");
String s2 = s1.intern();
String s3 = "hello";
System.out.println(s2 == s3);  // true
System.out.println(s1 == s2);  // false（除非池中本来就引用 s1）
\`\`\`

## 经典面试题

\`\`\`java
String s1 = new String("a") + new String("b");
// s1 指向堆上 "ab"，但池中没有 "ab"（拼接结果不进池）
String s2 = s1.intern();
// Java 7+ 池中存 s1 的引用
String s3 = "ab";
// "ab" 字面量复用池中已存在的 s1 引用
System.out.println(s1 == s2);  // true（Java 7+）
System.out.println(s2 == s3);  // true
\`\`\`

而如果先有字面量 \`"ab"\` 再拼接，结果就不同——因为池中已有 \`"ab"\` 字面量引用，intern 返回的是字面量对象而非拼接对象。

## 性能影响

- 优点：消除重复字符串，节省内存；相等比较可用 \`==\` 比哈希更快
- 缺点：intern 调用本身有开销（查表）；池膨胀可能影响 GC（虽然 Java 7+ 池在堆中可被 GC，但仍有压力）

## 使用场景

1. 读取大量重复数据（如日志、配置、字典）后 intern
2. 大量相同字符串作为 HashMap key
3. 长期运行的缓存系统、字典服务

不推荐：对一次性、短生命周期的字符串 intern，得不偿失。

## G1 字符串去重

Java 8u20+ G1 GC 支持 \`-XX:+UseStringDeduplication\`，自动让堆上内容相同的 String 共享底层 \`byte[]\`，比 intern 更安全（不改变引用，纯 GC 行为）。可用 \`-XX:StringDeduplicationAgeThreshold\` 控制去重阈值（默认 3）。

## 与 intern 的区别

- intern 改变对象引用（指向池中对象）
- G1 去重只共享 byte[]，引用不变
- G1 去重是自动的，intern 是显式的

## intern 的代价

intern 并非免费：
- 每次调用都要查哈希表，有 CPU 开销
- 池本身占用内存（哈希表结构）
- 高并发下池是全局锁竞争点（Java 7 的 StringTable 有锁）

对百万级不同字符串 intern，可能反而增加内存（池哈希表开销）和 CPU（查表）。

## 替代方案

- 手动维护 \`ConcurrentHashMap<String, String>\` 做去重缓存，可控性更强
- 用 \`WeakHashMap\` 实现可回收的去重
- 依赖 G1 去重，完全不修改代码

## 面试要点

1. \`new String("ab")\` 创建几个对象？答：1 或 2（堆 + 可能的池）
2. \`new String("a") + new String("b")\` 创建几个对象？答：多个（"a"、"b"、StringBuilder、堆上"ab"）
3. intern 在 Java 6 和 Java 7 的区别？答：6 复制到 PermGen，7 存堆引用

下面通过代码演示 intern 的效果：`,
    code: `// 演示 intern 方法深入
public class Main {
    public static void main(String[] args) {
        // 经典面试题
        String s1 = new String("a") + new String("b");
        String s2 = s1.intern();
        String s3 = "ab";
        System.out.println("=== 经典面试题 ===");
        System.out.println("s1 == s2: " + (s1 == s2));  // true (Java 7+)
        System.out.println("s2 == s3: " + (s2 == s3));  // true

        // 对比: 先有字面量
        String x1 = "xy";
        String x2 = new String("x") + new String("y");
        String x3 = x2.intern();
        System.out.println("=== 先字面量再拼接 ===");
        System.out.println("x1 == x3: " + (x1 == x3));  // true
        System.out.println("x2 == x3: " + (x2 == x3));  // false

        // intern 节省内存演示
        System.out.println("=== 内存节省演示 ===");
        int count = 100000;
        String[] without = new String[count];
        String[] withIntern = new String[count];

        // 不使用 intern
        long mem1 = Runtime.getRuntime().freeMemory();
        for (int i = 0; i < count; i++) {
            without[i] = new String("重复的字符串内容-" + (i % 100));
        }
        long mem2 = Runtime.getRuntime().freeMemory();

        // 使用 intern
        long mem3 = Runtime.getRuntime().freeMemory();
        for (int i = 0; i < count; i++) {
            withIntern[i] = ("重复的字符串内容-" + (i % 100)).intern();
        }
        long mem4 = Runtime.getRuntime().freeMemory();

        System.out.println("不用 intern 占用: " + (mem1 - mem2) + " bytes");
        System.out.println("用 intern 占用: " + (mem3 - mem4) + " bytes");

        // 用 intern 后所有相同内容指向同一对象
        System.out.println("相同内容是否同引用: " + (withIntern[0] == withIntern[100]));

        // intern 与 equals 性能对比
        String a = "performance-test";
        String b = new String(a);
        String c = b.intern();

        long start = System.nanoTime();
        for (int i = 0; i < 10000000; i++) {
            a.equals(c);
        }
        long equalsTime = System.nanoTime() - start;

        boolean same = true;
        start = System.nanoTime();
        for (int i = 0; i < 10000000; i++) {
            same = (a == c);
        }
        long refTime = System.nanoTime() - start;

        System.out.println("=== 性能对比 ===");
        System.out.println("引用相同: " + same);
        System.out.println("equals 耗时: " + equalsTime + " ns");
        System.out.println("== 耗时: " + refTime + " ns");
        System.out.println("== 比 equals 快约 " + (equalsTime * 1.0 / refTime) + " 倍");
    }
}`
  },
  {
    id: "java-string-performance",
    group: "字符串与字符",
    icon: "⚡",
    title: "字符串性能优化",
    content: `# 字符串性能优化

字符串是 Java 中使用最频繁的对象，优化字符串操作对整体性能至关重要。以下总结常见优化手段。

## 1. 拼接用 StringBuilder

循环拼接必须用 \`StringBuilder\`，编译器虽会优化 \`+\` 但每次循环仍可能创建新对象：

\`\`\`java
// 差：每次循环创建新 StringBuilder
String s = "";
for (...) s += x;

// 好：复用同一个 StringBuilder
StringBuilder sb = new StringBuilder();
for (...) sb.append(x);
\`\`\`

## 2. 预估容量

StringBuilder 默认容量 16，扩容会复制数组。预估大小可避免多次扩容：

\`\`\`java
StringBuilder sb = new StringBuilder(1024);
\`\`\`

\`ensureCapacity\` 也可在运行时调整。

## 3. 避免不必要的创建

\`\`\`java
// 差：每次调用都创建新对象
return new String("constant");

// 好：用字面量，复用池中对象
return "constant";
\`\`\`

## 4. 正则预编译

\`String.matches\`、\`String.replaceAll\` 每次都会重新编译正则。高频调用应预编译：

\`\`\`java
// 差：每次编译
str.replaceAll("\\\\d+", "");

// 好：编译一次，复用
private static final Pattern DIGITS = Pattern.compile("\\\\d+");
DIGITS.matcher(str).replaceAll("");
\`\`\`

预编译可带来数倍性能提升。

## 5. 编译期常量折叠

纯字面量表达式在编译期完成，运行期无开销：

\`\`\`java
// 编译期就是 "abc"
String s = "a" + "b" + "c";
\`\`\`

用 \`final\` 修饰的变量也会参与折叠。把不变的字符串声明为 \`static final\` 可触发折叠。

## 6. charAt vs toCharArray

遍历字符串时，\`charAt\` 比 \`toCharArray\` 略快（避免数组复制），但 \`toCharArray\` 在 JIT 优化后差距很小。注意 \`charAt\` 每次有边界检查。对超长字符串且需多次访问，转成 \`char[]\` 一次性复制可能更快。

## 7. 合理使用 intern

大量重复字符串 intern 可省内存，但要权衡池的维护成本和 GC 压力。

## 8. 字符串转数字

优先用 \`Integer.parseInt\`（返回基本类型）而非 \`Integer.valueOf\`（返回包装类，可能装箱）。

## 9. 不要用字符串做累加器

字符串不是数组，需要随机访问字符时转成 \`char[]\` 或 \`byte[]\`。频繁修改更应使用 StringBuilder。

## 10. JDK 9+ Compact Strings

JDK 9 引入 Compact Strings：纯 Latin1 字符串用 byte[] 存储，节省一半内存。可通过 \`-XX:-CompactStrings\` 关闭。大部分场景应保持开启。

## 11. String.concat

少量字符串拼接（2-3 个）时，\`concat\` 比 StringBuilder 更快（少一次方法调用开销），但拼接多于 3 个时 StringBuilder 占优。

下面通过代码演示性能优化技巧：`,
    code: `// 演示字符串性能优化
import java.util.regex.Pattern;

public class Main {
    // 预编译正则
    private static final Pattern DIGITS = Pattern.compile("\\\\d+");
    private static final Pattern EMAIL = Pattern.compile("[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+");

    public static void main(String[] args) {
        // 1. 拼接优化对比
        final int N = 10000;
        long t1 = System.nanoTime();
        String bad = "";
        for (int i = 0; i < N; i++) bad += i;
        long timeBad = System.nanoTime() - t1;

        long t2 = System.nanoTime();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < N; i++) sb.append(i);
        long timeGood = System.nanoTime() - t2;
        System.out.println("=== 拼接优化 ===");
        System.out.println("+ 拼接: " + timeBad + " ns");
        System.out.println("StringBuilder: " + timeGood + " ns");

        // 2. 预估容量
        long t3 = System.nanoTime();
        StringBuilder sbNoCap = new StringBuilder();
        for (int i = 0; i < N; i++) sbNoCap.append("x");
        long timeNoCap = System.nanoTime() - t3;

        long t4 = System.nanoTime();
        StringBuilder sbCap = new StringBuilder(N);
        for (int i = 0; i < N; i++) sbCap.append("x");
        long timeCap = System.nanoTime() - t4;
        System.out.println("=== 容量预估 ===");
        System.out.println("不预估: " + timeNoCap + " ns");
        System.out.println("预估: " + timeCap + " ns");

        // 3. 正则预编译
        String text = "abc123def456ghi789";
        int iter = 100000;
        long t5 = System.nanoTime();
        for (int i = 0; i < iter; i++) {
            text.replaceAll("\\\\d+", "");
        }
        long timeReCompile = System.nanoTime() - t5;

        long t6 = System.nanoTime();
        for (int i = 0; i < iter; i++) {
            DIGITS.matcher(text).replaceAll("");
        }
        long timePreCompile = System.nanoTime() - t6;
        System.out.println("=== 正则预编译 ===");
        System.out.println("每次编译: " + timeReCompile + " ns");
        System.out.println("预编译: " + timePreCompile + " ns");
        System.out.println("快 " + (timeReCompile * 1.0 / timePreCompile) + " 倍");

        // 4. 编译期常量折叠
        final String a = "Hello";
        final String b = " ";
        final String c = "Java";
        String folded = a + b + c;  // 编译期就是 "Hello Java"
        System.out.println("=== 常量折叠 ===");
        System.out.println("折叠结果: " + folded);
        System.out.println("与字面量同引用: " + (folded == "Hello Java"));

        // 5. parseInt vs valueOf
        long t7 = System.nanoTime();
        int sum1 = 0;
        for (int i = 0; i < iter; i++) sum1 += Integer.parseInt("123");
        long timeParse = System.nanoTime() - t7;

        long t8 = System.nanoTime();
        int sum2 = 0;
        for (int i = 0; i < iter; i++) sum2 += Integer.valueOf("123");
        long timeValueOf = System.nanoTime() - t8;
        System.out.println("=== 字符串转数字 ===");
        System.out.println("parseInt: " + timeParse + " ns");
        System.out.println("valueOf: " + timeValueOf + " ns");
    }
}`
  },
  {
    id: "java-string-conversion",
    group: "字符串与字符",
    icon: "🔄",
    title: "字符串与其他类型转换",
    content: `# 字符串与其他类型转换

字符串与基本类型、对象之间的相互转换是日常开发的高频操作。掌握正确的方法能避免性能问题与空指针异常。

## 字符串 → 基本类型

每种包装类都提供两种方法：

| 目标类型 | parse 方法 | valueOf 方法 |
|---------|-----------|-------------|
| int | \`Integer.parseInt(s)\` | \`Integer.valueOf(s)\` |
| long | \`Long.parseLong(s)\` | \`Long.valueOf(s)\` |
| double | \`Double.parseDouble(s)\` | \`Double.valueOf(s)\` |
| float | \`Float.parseFloat(s)\` | \`Float.valueOf(s)\` |
| boolean | \`Boolean.parseBoolean(s)\` | \`Boolean.valueOf(s)\` |

- \`parseXxx\` 返回基本类型，性能更好
- \`valueOf\` 返回包装类对象，可能命中缓存

注意：
- 格式错误会抛 \`NumberFormatException\`（非 checked，需自行处理）
- \`Boolean.parseBoolean\` 只有 \`"true"\`（忽略大小写）返回 true，其他一律 false，不会抛异常

## 基本类型 → 字符串

三种方式：

\`\`\`java
int n = 42;
String s1 = String.valueOf(n);  // 推荐，null 安全
String s2 = Integer.toString(n);// 直接
String s3 = "" + n;             // 简洁但略慢（编译为 StringBuilder）
\`\`\`

\`String.valueOf\` 有所有类型的重载，且处理 null 安全（返回 \`"null"\` 字符串）。

## 进制转换

\`\`\`java
Integer.toString(255, 16);   // "ff"
Integer.parseInt("ff", 16);  // 255
Integer.toBinaryString(10);  // "1010"
Integer.toOctalString(8);    // "10"
Integer.toHexString(255);    // "ff"
Integer.toString(255, 2);    // 任意进制
\`\`\`

## char[] 与 String

\`\`\`java
char[] arr = s.toCharArray();   // 复制一份
String s = new String(arr);     // 基于数组构造
String s = String.valueOf(arr); // 等价
\`\`\`

注意 \`toCharArray\` 会复制数组，频繁调用有开销。

## byte[] 与 String

通过字符集编解码：

\`\`\`java
byte[] bytes = s.getBytes(StandardCharsets.UTF_8);
String s = new String(bytes, StandardCharsets.UTF_8);
\`\`\`

务必显式指定字符集，避免依赖平台默认导致乱码。

## 对象 → 字符串

- \`String.valueOf(obj)\`：内部调用 \`obj.toString()\`，null 安全（返回 \`"null"\`）
- \`obj.toString()\`：需自己保证非 null，否则 NPE
- \`obj + ""\`：等价于 \`String.valueOf(obj)\`
- \`Objects.toString(obj, default)\`：null 时返回默认值

## 自定义对象的 toString

建议重写 \`toString\` 提供有意义的描述，便于调试日志：

\`\`\`java
@Override
public String toString() {
    return "User{name='" + name + "', age=" + age + "}";
}
\`\`\`

也可用 \`String.format\`、\`Objects.toString\` 或 Java 16+ 的 record（自动生成 toString）。

## 数组与字符串

\`Arrays.toString(arr)\` 输出数组内容，\`Arrays.deepToString(arr)\` 处理嵌套数组。直接打印数组会得到 \`[I@hashcode\` 这样的无意义结果。

下面通过代码演示各种类型转换：`,
    code: `// 演示字符串与其他类型转换
import java.nio.charset.StandardCharsets;
import java.util.Objects;
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        // 字符串 -> 基本类型
        System.out.println("=== 字符串转基本类型 ===");
        int i = Integer.parseInt("42");
        long l = Long.parseLong("9999999999");
        double d = Double.parseDouble("3.14");
        boolean b = Boolean.parseBoolean("true");
        System.out.println("int: " + i);
        System.out.println("long: " + l);
        System.out.println("double: " + d);
        System.out.println("boolean: " + b);

        // parseBoolean 的特殊行为
        System.out.println("parseBoolean('TRUE'): " + Boolean.parseBoolean("TRUE"));
        System.out.println("parseBoolean('yes'): " + Boolean.parseBoolean("yes")); // false

        // valueOf 返回包装类
        Integer boxed = Integer.valueOf("100");
        System.out.println("valueOf 返回类型是 Integer: " + (boxed instanceof Integer));

        // 基本类型 -> 字符串
        System.out.println("=== 基本类型转字符串 ===");
        String s1 = String.valueOf(42);
        String s2 = String.valueOf(3.14);
        String s3 = String.valueOf(true);
        String s4 = String.valueOf('A');
        System.out.println(s1 + " | " + s2 + " | " + s3 + " | " + s4);

        // 三种方式对比
        int n = 42;
        System.out.println(Integer.toString(n));
        System.out.println("" + n);

        // 进制转换
        System.out.println("=== 进制转换 ===");
        System.out.println("255 转 16 进制: " + Integer.toString(255, 16));
        System.out.println("ff 转 10 进制: " + Integer.parseInt("ff", 16));
        System.out.println("二进制: " + Integer.toBinaryString(10));
        System.out.println("八进制: " + Integer.toOctalString(8));
        System.out.println("十六进制: " + Integer.toHexString(255));

        // char[] 与 String
        System.out.println("=== char[] 转换 ===");
        char[] arr = "Hello".toCharArray();
        for (char c : arr) System.out.print(c + " ");
        System.out.println();
        String fromArr = new String(arr);
        String fromArr2 = String.valueOf(arr);
        System.out.println(fromArr + " | " + fromArr2);

        // byte[] 与 String
        System.out.println("=== byte[] 转换 ===");
        byte[] bytes = "中文".getBytes(StandardCharsets.UTF_8);
        System.out.println("字节数: " + bytes.length);
        String restored = new String(bytes, StandardCharsets.UTF_8);
        System.out.println("还原: " + restored);

        // 对象 toString
        System.out.println("=== 对象转字符串 ===");
        User user = new User("张三", 25);
        System.out.println("toString: " + user);
        System.out.println("valueOf(null): " + String.valueOf((Object) null));
        System.out.println("Objects.toString(null, 默认): " + Objects.toString(null, "默认值"));

        // 数组转字符串
        System.out.println("=== 数组转字符串 ===");
        int[] nums = {1, 2, 3};
        System.out.println("Arrays.toString: " + Arrays.toString(nums));

        // String.format 拼对象
        String info = String.format("用户: %s", user);
        System.out.println(info);
    }
}

// 自定义类
class User {
    private String name;
    private int age;

    User(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return "User{name='" + name + "', age=" + age + "}";
    }
}`
  }
];
