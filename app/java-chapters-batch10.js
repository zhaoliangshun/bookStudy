// =============================================================
// Java 交互式教程 —— 第十批章节（接口与抽象类深入组，共 15 章）
// =============================================================

export const chapters = [
  {
    id: "java-interface-basics",
    group: "接口与抽象类深入",
    icon: "🔌",
    title: "接口定义与实现",
    content: `# 接口定义与实现

接口（Interface）是 Java 中定义抽象行为的契约。它通过 \`interface\` 关键字声明，描述"能做什么"，而不关心"怎么做"。

## interface 关键字

使用 \`interface\` 声明一个接口，接口中的方法默认是 \`public abstract\` 的：

\`\`\`java
public interface Flyable {  // 定义接口 Flyable
    void fly(); // 隐式 public abstract
}
\`\`\`

## 接口方法的四种形式

Java 8 之后，接口可以包含四种方法：

- **抽象方法**：\`void fly();\`，没有方法体，由实现类提供
- **default 方法**：\`default void desc() {}\`，有默认实现
- **static 方法**：\`static Flight of() {}\`，属于接口本身
- **private 方法**：\`private void helper() {}\`，Java 9+，内部复用

## 接口字段 public static final

接口中的字段**隐式**为 \`public static final\`，即常量。无论是否显式写出这些修饰符，编译器都会自动加上：

\`\`\`java
public interface Constants {  // 定义接口 Constants
    int MAX = 100; // 等价于 public static final int MAX = 100;
}
\`\`\`

接口字段必须在声明时初始化，因为它是 final 的。

## implements 实现接口

类使用 \`implements\` 关键字实现接口，必须实现所有抽象方法（除非该类是抽象类）：

\`\`\`java
public class Bird implements Flyable {  // 定义类 Bird
    public void fly() { System.out.println("鸟儿飞翔"); }  // 打印一行到标准输出（自动换行）
}
\`\`\`

实现方法必须显式声明 \`public\`，因为接口方法都是 public 的，访问权限不能缩小。

## 接口与抽象类的本质区别

接口是"能力契约"，抽象类是"模板抽象"。一个类可以实现多个接口，但只能继承一个类。下面通过代码演示接口定义与实现：`,
    code: `// 演示接口的定义与实现
public class Main {
    public static void main(String[] args) {
        Bird bird = new Bird("麻雀");
        bird.fly();
        bird.desc();
        System.out.println("最大飞行高度: " + Flyable.MAX_ALTITUDE);

        // 通过接口类型引用实现类对象
        Flyable flyable = new Bird("老鹰");
        flyable.fly();
    }
}

// 定义接口
interface Flyable {
    // 接口字段：隐式 public static final
    int MAX_ALTITUDE = 10000;

    // 抽象方法：隐式 public abstract
    void fly();

    // default 方法
    default void desc() {
        System.out.println("这是一种可以飞行的生物");
    }
}

// 实现接口
class Bird implements Flyable {
    private String name;

    public Bird(String name) {
        this.name = name;
    }

    // 实现抽象方法，必须 public
    @Override
    public void fly() {
        System.out.println(name + " 正在飞翔，最高可达 " + MAX_ALTITUDE + " 米");
    }
}`
  },
  {
    id: "java-default-methods",
    group: "接口与抽象类深入",
    icon: "✨",
    title: "default 默认方法",
    content: `# default 默认方法

Java 8 引入了 \`default\` 方法，允许接口提供方法的默认实现。这是接口演化的重要里程碑，解决了"向已发布接口添加方法会破坏实现类"的难题。

## default 方法语法

在方法返回类型前加 \`default\` 关键字，并提供方法体：

\`\`\`java
public interface Vehicle {  // 定义接口 Vehicle
    default void start() {  // 方法 start，返回 void，无参数
        System.out.println("启动引擎");  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

## 默认实现的好处

- 实现类**可以直接使用**默认实现，无需重复编写
- 实现类可以**重写**默认方法，提供自定义行为
- 为接口添加新方法时，旧实现类无需修改即可编译

## 多继承冲突解决

当一个类同时实现两个接口，且两个接口有**相同签名**的 default 方法时，会产生冲突。Java 强制要求实现类必须重写该方法来解决冲突：

\`\`\`java
interface A { default void hi() { System.out.println("A"); } }  // 定义接口 A
interface B { default void hi() { System.out.println("B"); } }  // 定义接口 B
class C implements A, B {  // 定义类 C
    public void hi() {  // 方法 hi，返回 void，无参数
        A.super.hi(); // 显式选择调用哪个接口的默认方法
    }
}
\`\`\`

## 升级接口

default 方法让接口可以向后兼容地演化。例如 Java 8 给 \`Collection\` 接口添加了 \`stream()\`、\`forEach()\` 等 default 方法，所有现有实现类无需修改就获得了这些能力。

下面通过代码演示 default 方法的定义、继承与重写：`,
    code: `// 演示 default 默认方法
public class Main {
    public static void main(String[] args) {
        Vehicle car = new Car();
        car.start();   // 使用默认实现
        car.stop();    // 使用默认实现
        car.honk();    // 实现类重写

        Vehicle bike = new Bike();
        bike.start();  // 重写后的实现
        bike.stop();   // 默认实现
    }
}

// 接口提供默认方法
interface Vehicle {
    default void start() {
        System.out.println("车辆启动引擎");
    }

    default void stop() {
        System.out.println("车辆熄火");
    }

    void honk(); // 抽象方法，由实现类提供
}

// 实现类直接使用默认方法
class Car implements Vehicle {
    @Override
    public void honk() {
        System.out.println("汽车鸣笛：嘀嘀嘀");
    }
}

// 实现类重写默认方法
class Bike implements Vehicle {
    @Override
    public void start() {
        System.out.println("自行车踩踏启动");
    }

    @Override
    public void honk() {
        System.out.println("自行车按铃：叮铃铃");
    }
}`
  },
  {
    id: "java-static-interface",
    group: "接口与抽象类深入",
    icon: "⚙️",
    title: "接口 static 方法",
    content: `# 接口 static 方法

Java 8 允许在接口中定义 \`static\` 方法。静态方法属于接口本身，通过接口名调用，常用于工具方法和工厂方法。

## static 方法定义

使用 \`static\` 关键字定义，必须有方法体：

\`\`\`java
public interface StringUtil {  // 定义接口 StringUtil
    static boolean isEmpty(String s) {  // 静态方法 isEmpty，返回 boolean，参数：String s
        return s == null || s.length() == 0;  // 返回值：s == null || s.length() == 0
    }
}
\`\`\`

## 通过接口名调用

接口静态方法**不能**通过实现类名或实例调用，只能通过接口名调用。这避免了实现类与接口静态方法的歧义：

\`\`\`java
StringUtil.isEmpty(""); // 正确
// someImpl.isEmpty(""); // 错误，不能通过实例或实现类调用
\`\`\`

## 工厂方法模式

接口静态方法常用于工厂方法，封装对象创建逻辑：

\`\`\`java
public interface Point {  // 定义接口 Point
    static Point of(int x, int y) { return new PointImpl(x, y); }  // 方法 of（返回 Point，参数：int x, int y）：返回 new PointImpl(x, y)
}
\`\`\`

这样调用方不需要知道具体实现类，只与接口打交道。

## 接口工具方法

Java 8 把许多工具方法放到了接口里，例如 \`Comparator.comparing()\`、\`Stream.of()\`。这比把工具方法放到单独的工具类更内聚。

## 与类静态方法的区别

- 接口静态方法**不能被继承**，子接口也不会拥有它
- 类静态方法可以通过子类名调用（虽然不推荐）
- 接口静态方法本质上就是挂在接口命名空间下的工具方法

下面通过代码演示接口静态方法的定义和调用：`,
    code: `// 演示接口 static 方法
public class Main {
    public static void main(String[] args) {
        // 通过接口名调用静态方法
        System.out.println("空字符串: " + Validator.isEmpty(""));
        System.out.println("null: " + Validator.isEmpty(null));
        System.out.println("abc: " + Validator.isEmpty("abc"));

        // 工厂方法创建对象
        Point p1 = Point.of(3, 4);
        Point p2 = Point.origin();
        System.out.println(p1);
        System.out.println(p2);
        System.out.println("p1 到原点距离: " + p1.distanceTo(p2));
    }
}

// 工具方法接口
interface Validator {
    static boolean isEmpty(String s) {
        return s == null || s.length() == 0;
    }

    static boolean isPositive(int n) {
        return n > 0;
    }
}

// 接口静态方法作为工厂
interface Point {
    int getX();
    int getY();

    // 工厂方法
    static Point of(int x, int y) {
        return new PointImpl(x, y);
    }

    static Point origin() {
        return new PointImpl(0, 0);
    }

    default double distanceTo(Point other) {
        int dx = this.getX() - other.getX();
        int dy = this.getY() - other.getY();
        return Math.sqrt(dx * dx + dy * dy);
    }
}

// 非公开实现类
class PointImpl implements Point {
    private final int x;
    private final int y;

    PointImpl(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override public int getX() { return x; }
    @Override public int getY() { return y; }

    @Override
    public String toString() {
        return "Point(" + x + ", " + y + ")";
    }
}`
  },
  {
    id: "java-private-interface",
    group: "接口与抽象类深入",
    icon: "🔒",
    title: "接口 private 方法",
    content: `# 接口 private 方法

Java 9 引入了接口的 \`private\` 方法，用于在接口内部复用代码，减少 default 方法之间的重复逻辑。

## private 方法

普通的 private 方法只能被**同一个接口的 default 方法**调用，不能被实现类或子接口继承：

\`\`\`java
public interface Logger {  // 定义接口 Logger
    default void logInfo(String msg) { write("INFO", msg); }
    default void logError(String msg) { write("ERROR", msg); }
    private void write(String level, String msg) { /* 共享逻辑 */ }
}
\`\`\`

## private static 方法

\`private static\` 方法可以被接口的 static 方法和其他 private static 方法调用，用于 static 方法之间的代码复用：

\`\`\`java
public interface Calculator {  // 定义接口 Calculator
    static int square(int n) { return times(n, n); }  // 方法 square（返回 int，参数：int n）：返回 times(n, n)
    private static int times(int a, int b) { return a * b; }  // 方法 times（返回 int，参数：int a, int b）：返回 a * b
}
\`\`\`

## 代码复用

在 Java 9 之前，多个 default 方法共享逻辑只能复制粘贴或放到另一个工具类。private 方法让接口自身可以内聚地组织共享代码。

## 减少重复

- private 方法：服务于 default 方法的实例逻辑
- private static 方法：服务于 static 方法的工具逻辑
- 两者都不能被外部访问，保证了封装性

## 使用限制

- private 方法**必须有方法体**，不能是抽象的
- 不能在 private 方法上使用 \`default\` 或 \`static\` 之外的修饰符
- private 方法不能被子接口继承，也不会"冲突"

下面通过代码演示 private 方法在接口中的复用：`,
    code: `// 演示接口 private 方法
public class Main {
    public static void main(String[] args) {
        Logger logger = new ConsoleLogger();
        logger.logInfo("应用启动");
        logger.logWarn("内存偏高");
        logger.logError("数据库连接失败");

        // 调用接口静态方法
        System.out.println("5 的平方: " + MathUtil.square(5));
        System.out.println("3 的立方: " + MathUtil.cube(3));
    }
}

// 接口 private 方法复用 default 逻辑
interface Logger {
    default void logInfo(String msg) {
        write("INFO", msg); // 调用 private 方法
    }

    default void logWarn(String msg) {
        write("WARN", msg);
    }

    default void logError(String msg) {
        write("ERROR", msg);
    }

    // private 方法：复用日志格式化逻辑
    private void write(String level, String msg) {
        String line = "[" + level + "] " + java.time.LocalTime.now() + " - " + msg;
        System.out.println(line);
    }
}

// 接口 private static 方法复用 static 逻辑
interface MathUtil {
    static int square(int n) {
        return times(n, n); // 调用 private static
    }

    static int cube(int n) {
        return times(times(n, n), n);
    }

    // private static 方法：复用乘法逻辑
    private static int times(int a, int b) {
        return a * b;
    }
}

class ConsoleLogger implements Logger {
    // 直接使用接口的 default 方法，无需重复实现
}`
  },
  {
    id: "java-multi-interface",
    group: "接口与抽象类深入",
    icon: "🔗",
    title: "多接口实现",
    content: `# 多接口实现

Java 不支持类的多继承（一个类只能有一个父类），但允许一个类**实现多个接口**。这既获得了多继承的好处，又避免了状态多继承带来的复杂性。

## 一个类实现多个接口

使用逗号分隔多个接口：

\`\`\`java
public class SmartPhone implements Callable, Photoable, Webable {  // 定义类 SmartPhone
    // 必须实现所有接口的抽象方法
}
\`\`\`

实现类必须实现所有接口的所有抽象方法，否则必须声明为抽象类。

## 接口继承接口

接口之间用 \`extends\` 继承，且可以**继承多个**父接口：

\`\`\`java
interface Worker extends Readable, Writable { }  // 定义接口 Worker
\`\`\`

子接口继承所有父接口的抽象方法和 default 方法。

## 多重继承的冲突

当多个接口有相同签名的 default 方法时，实现类必须重写解决冲突（详见 \`java-default-conflict\` 章节）。对于抽象方法，重名不会冲突——只要签名相同，实现一次即可。

## 钻石问题

接口多继承的"钻石问题"（A → B, A → C, B+C → D）在 Java 中通过规则解决：
- 如果 B 和 C 都有同名 default 方法，D 必须重写
- 如果只有 A 有 default 方法，B 和 C 都没有重写，D 直接继承 A 的版本

接口没有实例字段（只有常量），所以不存在"状态钻石问题"，这是 Java 接口可以多继承而类不行的根本原因。

下面通过代码演示多接口实现：`,
    code: `// 演示一个类实现多个接口
public class Main {
    public static void main(String[] args) {
        SmartPhone phone = new SmartPhone("Pixel");
        phone.call("10086");
        phone.takePhoto();
        phone.browse("https://example.com");
        phone.recharge();

        // 用不同接口类型引用同一对象
        Callable c = phone;
        c.call("110");
    }
}

interface Callable {
    void call(String number);
}

interface Photoable {
    void takePhoto();
    default void takeSelfie() {
        System.out.println("前置摄像头自拍");
    }
}

interface Webable {
    void browse(String url);
}

interface Chargeable {
    void recharge();
    default void batteryStatus() {
        System.out.println("电池正常");
    }
}

// 一个类实现多个接口
class SmartPhone implements Callable, Photoable, Webable, Chargeable {
    private String model;

    public SmartPhone(String model) {
        this.model = model;
    }

    @Override
    public void call(String number) {
        System.out.println(model + " 正在拨打 " + number);
    }

    @Override
    public void takePhoto() {
        System.out.println(model + " 拍照");
    }

    @Override
    public void browse(String url) {
        System.out.println(model + " 浏览 " + url);
    }

    @Override
    public void recharge() {
        System.out.println(model + " 充电中");
    }
}`
  },
  {
    id: "java-interface-inheritance",
    group: "接口与抽象类深入",
    icon: "🧬",
    title: "接口继承",
    content: `# 接口继承

接口可以继承接口，且支持**多重继承**。通过 \`extends\` 关键字，子接口可以组合多个父接口的契约。

## extends 多个接口

接口的 \`extends\` 可以列出多个父接口，用逗号分隔：

\`\`\`java
interface ReadWrite extends Readable, Writable { }  // 定义接口 ReadWrite
\`\`\`

这与类不同——类的 \`extends\` 只能有一个父类。

## 接口层次

接口继承形成层次结构。实现类必须实现**整条继承链**上的所有抽象方法：

\`\`\`java
interface Reader { void open(); void read(); }  // 定义接口 Reader
interface Writer { void write(String s); }  // 定义接口 Writer
interface ReadWriter extends Reader, Writer { } // 组合接口
\`\`\`

实现 \`ReadWrite\` 的类要实现 \`open\`、\`read\`、\`write\` 三个方法。

## 重新声明父接口方法

子接口可以重新声明父接口的方法（例如改变文档或加注解），但这不会"覆盖"——它仍然是同一个抽象方法：

\`\`\`java
interface Base { void doWork(); }  // 定义接口 Base
interface Sub extends Base {  // 定义接口 Sub
    @Override  // 注解：Override
    void doWork(); // 重新声明，仍然是抽象方法
}
\`\`\`

## 接口设计原则

- **组合优于分层**：接口继承应反映真正的"是"关系
- **避免过深层次**：层次过深会难以维护
- **小接口组合**：用多个小接口组合成大接口，符合 ISP 原则

## default 方法的继承

子接口会继承父接口的 default 方法，也可以重写它。如果多个父接口有冲突的 default 方法，子接口必须重写解决冲突。

下面通过代码演示接口继承：`,
    code: `// 演示接口继承
public class Main {
    public static void main(String[] args) {
        FileManager fm = new FileManager();
        fm.open();
        fm.read();
        fm.write("hello");
        fm.close();
        fm.flush(); // 继承自父接口的 default 方法
    }
}

// 基础接口：读
interface Reader {
    void open();
    void read();
    default void flush() {
        System.out.println("刷新读取缓冲区");
    }
}

// 基础接口：写
interface Writer {
    void write(String content);
    default void flush() {
        System.out.println("刷新写入缓冲区");
    }
}

// 子接口继承多个父接口，并重写冲突的 default 方法
interface ReadWriter extends Reader, Writer {
    void close();

    // 解决两个父接口 flush 冲突
    @Override
    default void flush() {
        System.out.println("刷新读写缓冲区");
    }
}

// 实现类需实现整条继承链的抽象方法
class FileManager implements ReadWriter {
    @Override
    public void open() {
        System.out.println("打开文件");
    }

    @Override
    public void read() {
        System.out.println("读取文件内容");
    }

    @Override
    public void write(String content) {
        System.out.println("写入文件: " + content);
    }

    @Override
    public void close() {
        System.out.println("关闭文件");
    }
}`
  },
  {
    id: "java-marker-interface",
    group: "接口与抽象类深入",
    icon: "🏷️",
    title: "标记接口",
    content: `# 标记接口

标记接口（Marker Interface）是**没有任何方法**的接口，仅用于"标记"一个类具有某种属性。JVM 或框架通过 \`instanceof\` 检查标记来决定行为。

## 无方法接口

\`\`\`java
public interface Serializable { } // 没有任何方法
\`\`\`

实现这个接口的类，相当于声明"我可以被序列化"。

## 标记用途

标记接口的典型用途：
- \`java.io.Serializable\`：标记可序列化
- \`java.lang.Cloneable\`：标记可调用 \`clone()\`
- \`java.util.RandomAccess\`：标记列表支持快速随机访问

例如 \`ObjectOutputStream\` 检查对象是否是 \`Serializable\`：

\`\`\`java
if (obj instanceof Serializable) {  // 条件判断：满足 obj instanceof Serializable 时执行
    // 序列化
} else {  // 否则分支
    throw new NotSerializableException();  // 抛出 NotSerializableException 异常：
}
\`\`\`

## vs 注解

现代 Java 更倾向用**注解**（Annotation）替代标记接口：
- 注解更灵活，可带参数
- 注解可作用于字段、方法等，不只是类型
- 但标记接口有编译期类型检查的优势（\`instanceof\` 是类型安全的）

## 现代 Java 中的替代

Java 16+ 的 **密封接口**（sealed）和**记录类**（record）提供了新的方式表达受限类型集合。但对于"标记"语义，标记接口依然简单有效。

## 何时用标记接口

- 当需要类型检查时（编译器帮你检查）
- 当标记是类的本质属性，而非配置时

下面通过代码演示标记接口：`,
    code: `// 演示标记接口
public class Main {
    public static void main(String[] args) {
        User user = new User("张三", 25);
        Product product = new Product("手机", 2999.0);

        // 序列化检查
        serialize(user);    // User 实现了 Serializable
        serialize(product); // Product 没实现，抛异常或跳过

        // 克隆检查
        tryClone(user);
    }

    static void serialize(Object obj) {
        if (obj instanceof Serializable) {
            System.out.println("序列化对象: " + obj);
        } else {
            System.out.println("无法序列化: " + obj.getClass().getSimpleName());
        }
    }

    static void tryClone(Object obj) {
        if (obj instanceof Cloneable) {
            System.out.println(obj.getClass().getSimpleName() + " 支持克隆");
        } else {
            System.out.println(obj.getClass().getSimpleName() + " 不支持克隆");
        }
    }
}

// 自定义标记接口：无任何方法
interface Serializable { }
interface Cloneable { }

// 实现标记接口，表明可序列化
class User implements Serializable, Cloneable {
    private String name;
    private int age;

    public User(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return "User{name='" + name + "', age=" + age + "}";
    }
}

// 不实现任何标记接口
class Product {
    private String name;
    private double price;

    public Product(String name, double price) {
        this.name = name;
        this.price = price;
    }

    @Override
    public String toString() {
        return "Product{name='" + name + "', price=" + price + "}";
    }
}`
  },
  {
    id: "java-functional-interface",
    group: "接口与抽象类深入",
    icon: "⚡",
    title: "函数式接口",
    content: `# 函数式接口

函数式接口（Functional Interface）是**只有一个抽象方法**的接口，是 Java Lambda 表达式的类型基础。

## @FunctionalInterface 注解

使用 \`@FunctionalInterface\` 注解标记函数式接口，编译器会检查是否符合规范：

\`\`\`java
@FunctionalInterface  // 注解：FunctionalInterface
public interface Runnable {  // 定义接口 Runnable
    void run();  // 方法 run，返回 void，无参数
}
\`\`\`

注解是可选的，但加上后如果违反规则，编译器会报错。

## 单抽象方法（SAM）

函数式接口只能有**一个抽象方法**。但可以有：
- 任意数量的 default 方法
- 任意数量的 static 方法
- 任意数量的 private 方法（Java 9+）

\`Object\` 类的方法（如 \`equals\`、\`toString\`）不计入抽象方法数量。

## 默认方法不计

下面这个接口仍是函数式接口，因为只有 \`apply\` 一个抽象方法：

\`\`\`java
@FunctionalInterface  // 注解：FunctionalInterface
interface Function<T, R> {  // 定义接口 Function
    R apply(T t);  // 方法 apply，返回 R，参数：T t
    default <V> Function<V, R> compose(Function<V, T> before) { ... }
}
\`\`\`

## lambda 转换

函数式接口的实例可以用 lambda 表达式创建：

\`\`\`java
Runnable r = () -> System.out.println("hi");  // Lambda 表达式赋值给函数式接口变量
Comparator<Integer> c = (a, b) -> a - b;  // Lambda 表达式赋值给函数式接口变量
\`\`\`

lambda 的参数类型和返回类型必须与接口的抽象方法签名匹配。

## 标准函数式接口

\`java.util.function\` 包提供了 43 个标准函数式接口，主要分四类：
- **Function<T,R>**：有输入有输出 \`R apply(T)\`
- **Predicate<T>**：断言 \`boolean test(T)\`
- **Consumer<T>**：消费 \`void accept(T)\`
- **Supplier<T>**：提供 \`T get()\`

还有 \`BiFunction\`、\`UnaryOperator\`、\`BinaryOperator\` 等变体。优先使用标准接口，避免自定义。

下面通过代码演示函数式接口的定义和使用：`,
    code: `// 演示函数式接口
public class Main {
    public static void main(String[] args) {
        // 使用 lambda 创建函数式接口实例
        Calculator add = (a, b) -> a + b;
        Calculator mul = (a, b) -> a * b;
        System.out.println("3 + 5 = " + add.calc(3, 5));
        System.out.println("3 * 5 = " + mul.calc(3, 5));

        // 使用 Predicate 断言
        java.util.function.Predicate<Integer> isEven = n -> n % 2 == 0;
        System.out.println("4 是偶数: " + isEven.test(4));
        System.out.println("7 是偶数: " + isEven.test(7));

        // 使用 Consumer 消费
        java.util.function.Consumer<String> printer = s -> System.out.println(">> " + s);
        printer.accept("Hello Lambda");

        // 使用 Supplier 提供
        java.util.function.Supplier<Double> random = () -> Math.random();
        System.out.println("随机数: " + random.get());

        // 方法引用
        java.util.function.Function<String, Integer> parser = Integer::parseInt;
        System.out.println("解析 42: " + parser.apply("42"));
    }
}

// 自定义函数式接口
@FunctionalInterface
interface Calculator {
    int calc(int a, int b);

    // default 方法不影响函数式接口性质
    default Calculator andThen(Calculator after) {
        return (a, b) -> after.calc(this.calc(a, b), 0);
    }
}`
  },
  {
    id: "java-abstract-vs-interface",
    group: "接口与抽象类深入",
    icon: "⚖️",
    title: "抽象类 vs 接口",
    content: `# 抽象类 vs 接口

抽象类和接口都用于抽象，但定位不同：抽象类是"是什么"（is-a），接口是"能做什么"（can-do）。

## 对比表

| 特性 | 抽象类 | 接口 |
|------|--------|------|
| 多继承 | 单继承（一个父类） | 多实现（多个接口） |
| 状态（实例字段） | 有，可以有状态 | 无，只有常量 |
| 构造方法 | 有 | 无 |
| 访问修饰符 | 任意 | public（默认） |
| 方法修饰符 | 任意 | public/default/static/private |
| 字段 | 任意类型 | public static final 常量 |
| static 初始化块 | 有 | 无 |
| 演化 | 加新方法破坏子类 | 加 default 方法不破坏 |

## 何时用抽象类

- 多个类有**共享状态**（实例字段）和共享代码
- 需要**构造方法**初始化
- 需要 **protected** 成员
- 类层次明显，"is-a" 关系清晰

例如 \`AbstractList\` 提供 \`List\` 的骨架实现，包含共享字段和方法。

## 何时用接口

- 定义**类型契约**，多个不相关类都可实现
- 需要**多重继承**能力
- 想要**弱耦合**的抽象
- Java 8 后 default 方法让接口也能提供代码

## 设计决策

- 默认优先用接口：更灵活，支持多实现
- 只有当确实需要共享状态或构造逻辑时，才用抽象类
- 经典模式：接口 + 抽象类骨架（如 \`List\` + \`AbstractList\`）
- 抽象类可以**实现接口**，提供部分实现

## Java 8 后的模糊地带

default 方法让接口有了代码，模糊了与抽象类的界限。但接口**仍然不能有实例字段**，这是根本区别。

下面通过代码对比抽象类和接口的使用：`,
    code: `// 对比演示抽象类与接口
public class Main {
    public static void main(String[] args) {
        Dog dog = new Dog("旺财", 3);
        dog.eat();
        dog.sleep();
        dog.makeSound();
        System.out.println(dog.getName() + " " + dog.getAge() + " 岁");

        // 接口类型引用
        Swimmable swimmer = dog;
        swimmer.swim();
    }
}

// 接口：定义"能做什么"的能力契约
interface Swimmable {
    void swim();
    default void float_() {
        System.out.println("漂浮在水面上");
    }
}

// 抽象类：定义"是什么"的共享骨架
abstract class Animal {
    // 抽象类可以有实例字段（状态）
    private String name;
    private int age;

    // 抽象类可以有构造方法
    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // 抽象方法：子类必须实现
    public abstract void makeSound();

    // 具体方法：子类共享
    public void eat() {
        System.out.println(name + " 正在进食");
    }

    public void sleep() {
        System.out.println(name + " 正在睡觉");
    }

    // protected 方法，子类可见
    protected String getName() { return name; }
    protected int getAge() { return age; }
}

// 子类继承抽象类并实现接口
class Dog extends Animal implements Swimmable {
    public Dog(String name, int age) {
        super(name, age);
    }

    @Override
    public void makeSound() {
        System.out.println(getName() + " 汪汪叫");
    }

    @Override
    public void swim() {
        System.out.println(getName() + " 狗刨式游泳");
    }
}`
  },
  {
    id: "java-interface-design",
    group: "接口与抽象类深入",
    icon: "🎨",
    title: "接口设计原则",
    content: `# 接口设计原则

好的接口设计决定了系统的扩展性和可维护性。本章介绍几条核心原则。

## ISP 接口隔离

接口隔离原则（Interface Segregation Principle）：**客户端不应该被迫依赖它不使用的方法**。多个专用接口优于一个胖接口：

\`\`\`java
// 不好：胖接口
interface Worker { void read(); void write(); void delete(); }  // 定义接口 Worker

// 好：拆分
interface Reader { void read(); }  // 定义接口 Reader
interface Writer { void write(); }  // 定义接口 Writer
interface Deleter { void delete(); }  // 定义接口 Deleter
\`\`\`

只读类实现 \`Reader\` 即可，不会被强迫实现 \`write\` 和 \`delete\`。

## 小接口优于大接口

小接口职责单一，易于实现、组合和测试。Java 8 的标准函数式接口（\`Function\`、\`Predicate\` 等）都是单方法小接口。

## 面向接口编程

"面向接口编程，而不是面向实现编程"。变量类型、参数类型、返回类型都应尽量用接口：

\`\`\`java
List<String> list = new ArrayList<>(); // 接口类型引用实现类
\`\`\`

这样切换实现只需改一行，例如从 \`ArrayList\` 换成 \`LinkedList\`。

## 依赖倒置

依赖倒置原则（DIP）：高层模块不应依赖低层模块，二者都应依赖抽象。通过接口实现解耦：

\`\`\`java
class OrderService {  // 定义类 OrderService
    private final Payment payment; // 依赖接口而非具体类
    public OrderService(Payment payment) { this.payment = payment; }
}
\`\`\`

\`OrderService\` 不关心支付是支付宝还是微信，只依赖 \`Payment\` 接口。这让系统可扩展、可测试（mock）。

## 接口设计要点

- 命名清晰：能力接口用 \`-able\`（\`Comparable\`），角色接口用名词
- 单一职责：一个接口只表达一种能力
- 不要预设实现：接口不应包含与实现相关的字段或方法
- 谨慎加 default 方法：只为向后兼容添加，不要变成实现堆放地

下面通过代码演示接口设计原则：`,
    code: `// 演示接口设计原则
public class Main {
    public static void main(String[] args) {
        // 面向接口编程
        Payment alipay = new AlipayPayment();
        Payment wechat = new WechatPayment();

        OrderService service1 = new OrderService(alipay);
        OrderService service2 = new OrderService(wechat);

        service1.checkout(99.9);
        service2.checkout(49.5);

        // 接口隔离：只读视图
        ReadOnlyList<String> view = new SimpleList<>();
        // view.add("x"); // 编译错误，只读接口没有 add
        System.out.println("只读视图大小: " + view.size());
    }
}

// 依赖倒置：高层依赖接口
interface Payment {
    void pay(double amount);
}

class OrderService {
    private final Payment payment; // 依赖抽象接口

    public OrderService(Payment payment) {
        this.payment = payment;
    }

    public void checkout(double amount) {
        System.out.println("订单结算: " + amount);
        payment.pay(amount);
    }
}

// 接口实现可替换
class AlipayPayment implements Payment {
    @Override
    public void pay(double amount) {
        System.out.println("支付宝支付 " + amount + " 元");
    }
}

class WechatPayment implements Payment {
    @Override
    public void pay(double amount) {
        System.out.println("微信支付 " + amount + " 元");
    }
}

// 接口隔离：只读接口
interface ReadOnlyList<T> {
    T get(int index);
    int size();
}

// 完整接口继承只读接口
interface MutableList<T> extends ReadOnlyList<T> {
    void add(T item);
}

class SimpleList<T> implements MutableList<T> {
    private final java.util.List<T> data = new java.util.ArrayList<>();

    @Override
    public T get(int index) { return data.get(index); }
    @Override
    public int size() { return data.size(); }
    @Override
    public void add(T item) { data.add(item); }
}`
  },
  {
    id: "java-default-conflict",
    group: "接口与抽象类深入",
    icon: "⚔️",
    title: "默认方法冲突",
    content: `# 默认方法冲突解决

当一个类实现了多个接口，而这些接口有**相同签名**的 default 方法时，会产生冲突。Java 编译器强制要求实现类解决冲突。

## 两个接口相同 default 方法

\`\`\`java
interface A { default void hi() { System.out.println("A"); } }  // 定义接口 A
interface B { default void hi() { System.out.println("B"); } }  // 定义接口 B
\`\`\`

直接 \`class C implements A, B\` 会编译错误，因为编译器不知道用哪个 \`hi()\`。

## 解决方案一：override

实现类重写冲突方法：

\`\`\`java
class C implements A, B {  // 定义类 C
    @Override  // 注解：Override
    public void hi() {  // 方法 hi，返回 void，无参数
        System.out.println("C 自己的实现");  // 打印一行到标准输出（自动换行）
    }
}
\`\`\`

## 解决方案二：调用指定接口

使用 \`接口名.super.方法名()\` 调用某个接口的默认实现：

\`\`\`java
class C implements A, B {  // 定义类 C
    @Override  // 注解：Override
    public void hi() {  // 方法 hi，返回 void，无参数
        A.super.hi(); // 选择 A 的版本
    }
}
\`\`\`

## 类 vs 接口冲突

如果**类**（父类）的实例方法和接口的 default 方法同名，**类方法优先**（"类赢"规则）：

\`\`\`java
class P { public void hi() { System.out.println("P"); } }  // 定义类 P
interface I { default void hi() { System.out.println("I"); } }  // 定义接口 I
class C extends P implements I { } // 调用 hi() 输出 "P"
\`\`\`

这是因为类有真实状态，接口没有，类优先保证语义清晰。

## 编译错误示例

不解决冲突直接编译会报错：
\`Error: class C inherits unrelated defaults for hi() from types A and B\`

下面通过代码演示各种冲突场景及解决方案：`,
    code: `// 演示默认方法冲突解决
public class Main {
    public static void main(String[] args) {
        System.out.println("--- 场景1: 重写冲突方法 ---");
        new SolutionOverride().hi();

        System.out.println("--- 场景2: 选择指定接口 ---");
        new SolutionSelectA().hi();
        new SolutionSelectB().hi();

        System.out.println("--- 场景3: 类方法优先于接口 default ---");
        new ChildClass().hi();
    }
}

interface A {
    default void hi() {
        System.out.println("A 的 hi");
    }
}

interface B {
    default void hi() {
        System.out.println("B 的 hi");
    }
}

// 方案1：完全重写
class SolutionOverride implements A, B {
    @Override
    public void hi() {
        System.out.println("自己的 hi");
    }
}

// 方案2：选择 A 的默认实现
class SolutionSelectA implements A, B {
    @Override
    public void hi() {
        A.super.hi();
    }
}

// 方案2：选择 B 的默认实现
class SolutionSelectB implements A, B {
    @Override
    public void hi() {
        B.super.hi();
    }
}

// 场景3：父类方法 vs 接口 default，类优先
class Parent {
    public void hi() {
        System.out.println("父类的 hi");
    }
}

class ChildClass extends Parent implements A {
    // 无需重写，父类的 hi 自动优先于接口 A 的 default
}`
  },
  {
    id: "java-sealed-interface",
    group: "接口与抽象类深入",
    icon: "🔐",
    title: "密封接口",
    content: `# 密封接口（Java 17+）

密封接口（Sealed Interface）通过 \`sealed\` 和 \`permits\` 关键字**限制**哪些类/接口可以实现它，形成封闭的类型集合。

## sealed 接口

\`\`\`java
public sealed interface Shape permits Circle, Square, Triangle { }  // 定义接口 Shape
\`\`\`

\`permits\` 子句列出所有允许的实现类。任何不在列表中的类都无法实现该接口。

## permits 实现类

被 \`permits\` 的类必须显式声明为以下三者之一：
- \`final\`：不能再被继承
- \`sealed\`：继续限制子类
- \`non-sealed\`：开放继承（回到普通类）

\`\`\`java
public final class Circle implements Shape { }  // 定义最终（不可继承）类 Circle
public sealed class Square implements Shape permits BigSquare, SmallSquare { }  // 定义类 Square
public non-sealed class Triangle implements Shape { } // 任意类可继承
\`\`\`

## 与 record 配合

\`record\` 隐式 final，非常适合作为密封接口的实现，简洁地表达代数数据类型：

\`\`\`java
sealed interface Shape permits Circle, Square {}  // 定义接口 Shape
record Circle(double r) implements Shape {}  // 定义记录类 Circle
record Square(double side) implements Shape {}  // 定义记录类 Square
\`\`\`

## 穷举 switch

密封接口让编译器能**穷举**所有可能类型，配合 Java 17+ 的模式匹配 \`switch\` 实现完整覆盖检查：

\`\`\`java
double area = switch (shape) {
    case Circle c -> Math.PI * c.r() * c.r();  // Lambda 表达式：实现函数式接口
    case Square s -> s.side() * s.side();  // Lambda 表达式：实现函数式接口
    // 无需 default，编译器知道已穷举
};
\`\`\`

如果将来新增一个 \`Triangle\` 到 \`permits\`，所有 \`switch\` 编译失败，强制处理新类型——这正是密封接口的核心价值。

下面通过代码演示密封接口与穷举 switch：`,
    code: `// 演示密封接口（Java 17+）
public class Main {
    public static void main(String[] args) {
        Shape[] shapes = {
            new Circle(2.0),
            new Square(3.0),
            new Rectangle(2.0, 4.0)
        };

        for (Shape s : shapes) {
            System.out.println(s + " 面积 = " + area(s) + ", 周长 = " + perimeter(s));
        }
    }

    // 穷举 switch：编译器知道所有可能类型
    static double area(Shape s) {
        return switch (s) {
            case Circle c -> Math.PI * c.radius() * c.radius();
            case Square sq -> sq.side() * sq.side();
            case Rectangle r -> r.width() * r.height();
        };
    }

    static double perimeter(Shape s) {
        return switch (s) {
            case Circle c -> 2 * Math.PI * c.radius();
            case Square sq -> 4 * sq.side();
            case Rectangle r -> 2 * (r.width() + r.height());
        };
    }
}

// 密封接口：限制实现类
sealed interface Shape permits Circle, Square, Rectangle {
}

// record 隐式 final，完美配合密封接口
record Circle(double radius) implements Shape {
    @Override
    public String toString() {
        return "Circle(r=" + radius + ")";
    }
}

record Square(double side) implements Shape {
    @Override
    public String toString() {
        return "Square(side=" + side + ")";
    }
}

record Rectangle(double width, double height) implements Shape {
    @Override
    public String toString() {
        return "Rectangle(" + width + "x" + height + ")";
    }
}`
  },
  {
    id: "java-adapter-pattern-interface",
    group: "接口与抽象类深入",
    icon: "🔌",
    title: "适配器模式（接口实战）",
    content: `# 适配器模式

适配器模式（Adapter Pattern）将一个类的接口转换成客户端期望的另一个接口，让原本不兼容的类可以一起工作。

## 类适配器

通过**多重继承**实现（Java 中通过继承类 + 实现接口）。适配器继承被适配类，同时实现目标接口：

\`\`\`java
class Adapter extends Adaptee implements Target { }  // 定义类 Adapter
\`\`\`

Java 中较少用，因为要求被适配类可继承且不希望覆盖其行为。

## 对象适配器

通过**组合**实现，更灵活。适配器持有一个被适配对象的引用，把目标接口的方法委托给它：

\`\`\`java
class Adapter implements Target {  // 定义类 Adapter
    private final Adaptee adaptee;  // 声明常量私有变量 adaptee（Adaptee 类型）
    public void request() { adaptee.specificRequest(); }
}
\`\`\`

对象适配器是更推荐的方式，符合"组合优于继承"原则。

## 接口适配器（抽象类）

当一个接口有**很多方法**，但实现类只关心其中几个时，可以提供一个**抽象适配器类**，提供所有方法的空实现。实现类继承它，只重写需要的方法：

\`\`\`java
abstract class MouseAdapter implements MouseListener {  // 定义抽象类 MouseAdapter
    public void mouseClicked(MouseEvent e) { }
    public void mousePressed(MouseEvent e) { }
    // ... 其他空实现
}
\`\`\`

这是 GUI 编程中 \`MouseAdapter\`、\`WindowAdapter\` 的设计思路。

## 实际应用

- \`java.io.InputStreamReader\`：把 \`InputStream\`（字节）适配成 \`Reader\`（字符）
- \`Arrays.asList()\`：把数组适配成 \`List\`
- 老系统集成：新接口适配遗留 API

下面通过代码实现三种适配器：`,
    code: `// 演示适配器模式
public class Main {
    public static void main(String[] args) {
        System.out.println("--- 对象适配器 ---");
        // 旧打印机只能打印英文，用适配器让它支持中文
        OldPrinter oldPrinter = new OldPrinter();
        Printer adapter = new PrinterAdapter(oldPrinter);
        adapter.print("你好，世界");
        adapter.print("Hello World");

        System.out.println("--- 接口适配器 ---");
        // 只关心点击事件，用抽象适配器避免实现所有方法
        MouseListener listener = new SimpleMouseListener();
        listener.onMove(10, 20);   // 空实现
        listener.onClick(5, 5);    // 实际处理
    }
}

// 目标接口：客户端期望的接口
interface Printer {
    void print(String message);
}

// 被适配者：旧的英文打印机
class OldPrinter {
    void printEnglish(String text) {
        System.out.println("[OldPrinter] " + text);
    }
}

// 对象适配器：组合被适配者
class PrinterAdapter implements Printer {
    private final OldPrinter oldPrinter;

    public PrinterAdapter(OldPrinter oldPrinter) {
        this.oldPrinter = oldPrinter;
    }

    @Override
    public void print(String message) {
        // 简单处理：中文转拼音占位，实际场景可调用翻译服务
        String translated = message.contains("你好") ? "NiHao" : message;
        oldPrinter.printEnglish(translated);
    }
}

// 多方法接口
interface MouseListener {
    void onClick(int x, int y);
    void onMove(int x, int y);
    void onDown(int x, int y);
    void onUp(int x, int y);
}

// 接口适配器：抽象类提供空实现
abstract class MouseAdapter implements MouseListener {
    @Override public void onClick(int x, int y) { }
    @Override public void onMove(int x, int y) { }
    @Override public void onDown(int x, int y) { }
    @Override public void onUp(int x, int y) { }
}

// 实现类只关心点击，其他默认空实现
class SimpleMouseListener extends MouseAdapter {
    @Override
    public void onClick(int x, int y) {
        System.out.println("鼠标点击: (" + x + ", " + y + ")");
    }
}`
  },
  {
    id: "java-strategy-pattern-interface",
    group: "接口与抽象类深入",
    icon: "🎯",
    title: "策略模式（接口实战）",
    content: `# 策略模式

策略模式（Strategy Pattern）定义一系列算法，把它们封装成独立的策略对象，使算法可以互换，而不影响使用算法的客户端。

## 策略接口

定义一个统一的策略接口：

\`\`\`java
interface SortStrategy {  // 定义接口 SortStrategy
    void sort(int[] arr);  // 方法 sort，返回 void，参数：int[] arr
}
\`\`\`

## 具体策略

每个算法实现策略接口，成为可替换的策略：

\`\`\`java
class BubbleSort implements SortStrategy { ... }  // 定义类 BubbleSort
class QuickSort implements SortStrategy { ... }  // 定义类 QuickSort
\`\`\`

## 上下文

上下文持有策略引用，把工作委托给策略：

\`\`\`java
class Sorter {  // 定义类 Sorter
    private SortStrategy strategy;  // 声明私有变量 strategy（SortStrategy 类型）
    public void setStrategy(SortStrategy s) { this.strategy = s; }
    public void sort(int[] arr) { strategy.sort(arr); }
}
\`\`\`

客户端在运行时切换策略，上下文无需修改——符合开闭原则。

## lambda 简化策略模式

Java 8 之前，每个策略需要一个类。有了 lambda，单方法策略接口可以**直接用 lambda 传入**，大大简化：

\`\`\`java
sorter.setStrategy(arr -> { /* 排序逻辑 */ });  // Lambda 表达式：实现函数式接口
\`\`\`

策略模式本质上是函数式接口的应用，所以 Java 中很多策略场景直接用 \`Comparator\`、\`Function\` 等标准接口。

## 实际应用

- \`Collections.sort(list, comparator)\`：\`Comparator\` 就是排序策略
- \`ThreadPoolExecutor\` 的 \`RejectedExecutionHandler\`：拒绝策略
- Spring 的 \`Resource\`：不同资源加载策略
- 支付系统：不同支付渠道作为策略

策略模式 vs 状态模式：策略由客户端选择，状态由对象自身根据状态切换。

下面通过代码实现策略模式及 lambda 简化：`,
    code: `// 演示策略模式
public class Main {
    public static void main(String[] args) {
        int[] data = {5, 2, 8, 1, 9, 3};

        // 传统策略模式
        Sorter sorter = new Sorter();
        sorter.setStrategy(new BubbleSort());
        sorter.sort(data.clone());

        sorter.setStrategy(new QuickSort());
        sorter.sort(data.clone());

        // lambda 简化：无需定义策略类
        sorter.setStrategy(arr -> {
            System.out.println("Lambda 策略：选择排序");
            int[] a = arr.clone();
            for (int i = 0; i < a.length; i++) {
                int min = i;
                for (int j = i + 1; j < a.length; j++) {
                    if (a[j] < a[min]) min = j;
                }
                int t = a[i]; a[i] = a[min]; a[min] = t;
            }
            System.out.println("结果: " + java.util.Arrays.toString(a));
        });
        sorter.sort(data.clone());

        // 实际应用：Comparator 就是排序策略
        java.util.List<Integer> list = java.util.Arrays.asList(5, 2, 8, 1, 9);
        list.sort((a, b) -> b - a); // 降序策略
        System.out.println("降序: " + list);
    }
}

// 策略接口
interface SortStrategy {
    void sort(int[] arr);
}

// 具体策略：冒泡排序
class BubbleSort implements SortStrategy {
    @Override
    public void sort(int[] arr) {
        System.out.println("策略：冒泡排序");
        int[] a = arr.clone();
        for (int i = 0; i < a.length; i++) {
            for (int j = 0; j < a.length - i - 1; j++) {
                if (a[j] > a[j + 1]) {
                    int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                }
            }
        }
        System.out.println("结果: " + java.util.Arrays.toString(a));
    }
}

// 具体策略：快速排序
class QuickSort implements SortStrategy {
    @Override
    public void sort(int[] arr) {
        System.out.println("策略：快速排序");
        int[] a = arr.clone();
        quickSort(a, 0, a.length - 1);
        System.out.println("结果: " + java.util.Arrays.toString(a));
    }

    private void quickSort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int p = a[hi], i = lo - 1;
        for (int j = lo; j < hi; j++) {
            if (a[j] <= p) {
                i++;
                int t = a[i]; a[i] = a[j]; a[j] = t;
            }
        }
        int t = a[i + 1]; a[i + 1] = a[hi]; a[hi] = t;
        quickSort(a, lo, i);
        quickSort(a, i + 2, hi);
    }
}

// 上下文
class Sorter {
    private SortStrategy strategy;

    public void setStrategy(SortStrategy strategy) {
        this.strategy = strategy;
    }

    public void sort(int[] arr) {
        if (strategy == null) throw new IllegalStateException("未设置策略");
        strategy.sort(arr);
    }
}`
  },
  {
    id: "java-interface-best-practices",
    group: "接口与抽象类深入",
    icon: "✅",
    title: "接口最佳实践",
    content: `# 接口最佳实践

本章总结接口设计的实践经验，帮助你写出可维护、可演化的接口。

## 命名规范

- 能力接口用 \`-able\` 后缀：\`Comparable\`、\`Runnable\`、\`Iterable\`
- 角色接口用名词：\`List\`、\`Map\`、\`Repository\`
- 工厂接口可用 \`Factory\`、\`Provider\`、\`Supplier\`
- 避免在接口名加 \`I\` 前缀（如 \`IUser\`），这是 .NET 风格

## 接口大小

接口应该**小而专注**。一个接口超过 5 个方法就要警惕。多个小接口可以组合使用（ISP）。

## 不要过度设计

不要为每个类都抽接口。"为未来可能"而抽象，往往是 YAGNI（You Aren't Gonna Need It）。**只在有多个实现或需要解耦时才引入接口**。

## 接口演化策略

发布接口后修改要谨慎：
- **加抽象方法**：破坏所有实现类，应避免
- **加 default 方法**：相对安全，但仍可能影响已有实现的语义
- **加 static 方法**：完全安全，不影响实现类
- **删除方法**：破坏二进制兼容，避免

版本化的接口演化可通过新接口（如 \`Repository2\`）或 default 方法渐进推进。

## 版本兼容

- 公开 API 的接口一旦发布，签名就**冻结**了
- 修改参数类型、返回类型都会破坏调用方
- 新功能优先用 default 方法扩展，而非改抽象方法
- 必要时用 \`@Deprecated\` 标记旧方法，引导迁移

## 其他要点

- 接口字段命名用全大写下划线：\`MAX_VALUE\`
- 不要在接口里放工具常量（用类或枚举）
- 谨慎使用 default 方法继承，避免实现类意外行为
- 函数式接口加 \`@FunctionalInterface\` 注解
- 优先复用 JDK 标准函数式接口

下面通过代码综合演示接口最佳实践：`,
    code: `// 综合演示接口最佳实践
public class Main {
    public static void main(String[] args) {
        // 面向接口编程
        UserRepository repo = new InMemoryUserRepository();

        UserService service = new UserService(repo);
        service.register("u1", "张三");
        service.register("u2", "李四");
        System.out.println("用户列表: " + service.listNames());
        System.out.println("查找 u1: " + service.findName("u1"));

        // 演示接口演化：新增的 default 方法不破坏旧实现
        repo.backup(); // 新加的 default 方法

        // 标准函数式接口 + 方法引用
        java.util.function.Function<User, String> nameExtractor = User::name;
        System.out.println("提取名字: " + nameExtractor.apply(new User("x", "王五")));
    }
}

// 接口命名规范：角色接口用名词
interface UserRepository {
    void save(User user);
    User findById(String id);
    java.util.List<User> findAll();

    // 接口演化：用 default 方法添加新功能，不破坏现有实现
    default void backup() {
        System.out.println("[默认备份] 仓库未实现自定义备份");
    }
}

// 接口隔离：只读视图
interface ReadOnlyUserRepository {
    User findById(String id);
}

// 简单 record 作为数据载体
record User(String id, String name) { }

// 具体实现：非公开
class InMemoryUserRepository implements UserRepository {
    private final java.util.Map<String, User> store = new java.util.HashMap<>();

    @Override
    public void save(User user) {
        store.put(user.id(), user);
    }

    @Override
    public User findById(String id) {
        return store.get(id);
    }

    @Override
    public java.util.List<User> findAll() {
        return new java.util.ArrayList<>(store.values());
    }

    // 重写 default 方法提供真实实现
    @Override
    public void backup() {
        System.out.println("[InMemory] 备份 " + store.size() + " 个用户到内存快照");
    }
}

// 依赖倒置：服务层依赖接口
class UserService {
    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    public void register(String id, String name) {
        repo.save(new User(id, name));
        System.out.println("注册用户: " + name);
    }

    public String findName(String id) {
        User u = repo.findById(id);
        return u == null ? null : u.name();
    }

    public java.util.List<String> listNames() {
        return repo.findAll().stream().map(User::name).toList();
    }
}`
  }
];
