// =============================================================
// Java 交互式教程 —— 第八批章节（OOP 深入组，共 15 章）
// =============================================================

export const chapters = [
  {
    id: "java-constructors",
    group: "OOP 深入",
    icon: "🏗️",
    title: "构造方法深入",
    content: `# 构造方法深入

构造方法（Constructor）是创建对象时调用的特殊方法，用于初始化对象状态。它与类同名，没有返回类型。

## 默认构造方法

如果一个类**没有显式定义**任何构造方法，编译器会自动生成一个无参的默认构造方法：

\`\`\`java
public class Animal {
    // 编译器自动生成: public Animal() { super(); }
}
\`\`\`

一旦你定义了任何构造方法（无论是否有参），编译器就**不再**生成默认构造方法。

## 有参构造方法

通过参数为字段赋初值，使对象创建即处于合法状态：

\`\`\`java
public class Animal {
    private String name;
    public Animal(String name) {
        this.name = name;
    }
}
\`\`\`

## 构造方法重载

构造方法可以重载，提供多种创建对象的方式，提高灵活性。

## 构造方法链 this()

使用 \`this()\` 调用本类的其他构造方法，**必须放在第一行**，避免初始化逻辑重复：

\`\`\`java
public class Animal {
    private String name;
    private int age;
    public Animal() {
        this("无名", 0); // 链式调用两参构造
    }
    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }
}
\`\`\`

## 编译器生成默认构造的条件

- 类中没有任何显式构造方法时，编译器生成无参默认构造
- 一旦定义任何构造方法，编译器不再生成
- 这就是为什么 Spring、JPA 等框架要求提供无参构造的原因

## 构造方法与字段初始化顺序

字段默认值 → 字段初始化语句/初始化块 → 构造方法体。构造方法总是最后执行，可以覆盖前面的初始化。

下面通过代码演示构造方法重载与链式调用：`,
    code: `// 演示构造方法重载与链式调用 this()
public class Main {
    public static void main(String[] args) {
        // 使用不同构造方法创建对象
        Person p1 = new Person();
        Person p2 = new Person("张三");
        Person p3 = new Person("李四", 25);

        System.out.println(p1);
        System.out.println(p2);
        System.out.println(p3);

        // 统计创建的对象数量
        System.out.println("共创建对象数: " + Person.getCount());
    }
}

// 非公开辅助类
class Person {
    private String name;
    private int age;
    private static int count = 0; // 统计创建数量

    // 无参构造：通过 this() 链式调用
    public Person() {
        this("无名氏", 0);
    }

    // 单参构造：链式调用两参构造
    public Person(String name) {
        this(name, 18);
    }

    // 全参构造：真正执行初始化
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
        count++; // 每创建一个对象计数加一
    }

    public static int getCount() {
        return count;
    }

    @Override
    public String toString() {
        return "Person{name='" + name + "', age=" + age + "}";
    }
}`
  },
  {
    id: "java-this-keyword",
    group: "OOP 深入",
    icon: "👆",
    title: "this 关键字",
    content: `# this 关键字

\`this\` 是一个隐式引用，指向**当前正在调用方法的对象**本身。它在实例方法和构造方法中可用，静态方法中不能使用 \`this\`。

## this 指向当前对象

每个对象都有自己的 \`this\`，通过 \`this\` 可以访问当前对象的字段和方法：

\`\`\`java
public void show() {
    System.out.println(this.name); // this 指向调用 show 的对象
}
\`\`\`

## this.字段 vs 局部变量

当方法参数或局部变量与字段同名时，局部变量会**遮蔽**字段。此时必须用 \`this.字段\` 来访问字段：

\`\`\`java
public void setName(String name) {
    this.name = name; // this.name 是字段，name 是参数
}
\`\`\`

这是最常见的 \`this\` 用法，也是命名规范建议参数名与字段名相同的原因。

## this.方法

调用当前对象的其他实例方法，\`this.\` 通常可省略，但显式写出可提高可读性。

## this() 构造调用

在构造方法第一行用 \`this()\` 调用本类其他构造方法，减少重复代码。

## this 传参

将当前对象作为参数传递给其他方法：

\`\`\`java
public void register() {
    Manager.add(this); // 把自己交给管理器
}
\`\`\`

## this 作为返回值

实现链式调用（Builder 模式的基础）：

\`\`\`java
public Builder setName(String n) {
    this.name = n;
    return this; // 返回当前对象
}
\`\`\`

下面通过代码演示 this 的各种用法：`,
    code: `// 演示 this 关键字的各种用法
public class Main {
    public static void main(String[] args) {
        Student s = new Student("王五", 90);
        s.showInfo();
        s.register(); // 把自己作为参数传递

        // 链式调用：this 作为返回值
        Builder b = new Builder()
            .setName("赵六")
            .setAge(22);
        System.out.println(b);
    }
}

// 注册管理器
class Manager {
    static void add(Student s) {
        System.out.println("已注册学生: " + s.getName());
    }
}

class Student {
    private String name;
    private int score;

    public Student(String name, int score) {
        // this.字段 区分参数与字段
        this.name = name;
        this.score = score;
    }

    public void showInfo() {
        // this.方法 调用本类其他方法
        this.print();
    }

    private void print() {
        System.out.println("姓名: " + this.name + ", 成绩: " + this.score);
    }

    // this 作为参数传递
    public void register() {
        Manager.add(this);
    }

    public String getName() {
        return name;
    }
}

// 演示 this 作为返回值实现链式调用
class Builder {
    private String name;
    private int age;

    public Builder setName(String name) {
        this.name = name;
        return this; // 返回当前对象
    }

    public Builder setAge(int age) {
        this.age = age;
        return this;
    }

    @Override
    public String toString() {
        return "Builder{name='" + name + "', age=" + age + "}";
    }
}`
  },
  {
    id: "java-access-modifiers",
    group: "OOP 深入",
    icon: "🚧",
    title: "访问修饰符",
    content: `# 访问修饰符

Java 提供四种访问修饰符，控制类、方法、字段的可见性，是封装的核心工具。

## 四种访问级别

| 修饰符 | 同类 | 同包 | 子类 | 其他包 |
|--------|------|------|------|--------|
| \`public\` | ✅ | ✅ | ✅ | ✅ |
| \`protected\` | ✅ | ✅ | ✅ | ❌ |
| default（无修饰符） | ✅ | ✅ | ❌ | ❌ |
| \`private\` | ✅ | ❌ | ❌ | ❌ |

## 修饰符适用范围

- **类**：只能用 \`public\` 或 default（内部类可以用 private/protected）
- **方法/字段**：四种都可使用
- **局部变量**：不能使用访问修饰符

## public

对所有类可见。公共类名必须与文件名一致，一个 \`.java\` 文件只能有一个 public 类。

## protected

同包可见，且对不同包的子类可见（通过子类引用访问）。常用于希望子类继承但对外隐藏的成员。

## default（包级别）

无修饰符时默认包级别访问，仅同包可访问。这是最常被忽视的级别。

## private

仅本类可见，是最严格的访问级别。字段通常设为 private，通过 getter/setter 控制访问。

## 设计原则：最小可访问性

**成员应尽可能保持私有**。只暴露必要的方法，降低耦合，便于维护。优先级：

\`private\` → default → \`protected\` → \`public\`

只有当确实需要更广访问范围时才放宽。这是 Effective Java 中的重要原则。

下面通过代码演示各种访问修饰符：`,
    code: `// 演示访问修饰符（同文件中模拟同包访问）
public class Main {
    public static void main(String[] args) {
        Account acc = new Account("6228", 1000.0);

        // public 方法：任何地方都可访问
        acc.deposit(500.0);
        System.out.println("余额: " + acc.getBalance());

        // protected 方法：同包可访问
        acc.auditLog("存款 500");

        // default 方法：同包可访问
        acc.resetCounter();

        // private 方法：仅本类可访问，下面会编译错误
        // acc.validateAmount(100); // 错误：无法访问私有方法

        System.out.println("账号: " + acc.getAccountId());
    }
}

class Account {
    private String accountId;   // 私有字段：仅本类可见
    private double balance;     // 私有字段
    protected int counter;      // 受保护字段：同包和子类可见
    String bankName;            // 包级别字段：同包可见
    public String currency;     // 公开字段：到处可见

    public Account(String id, double initBalance) {
        this.accountId = id;
        this.balance = initBalance;
        this.currency = "CNY";
        this.bankName = "默认银行";
    }

    // public 方法：任何类可调用
    public void deposit(double amount) {
        if (validateAmount(amount)) {
            balance += amount;
            counter++;
        }
    }

    public double getBalance() {
        return balance;
    }

    public String getAccountId() {
        return accountId;
    }

    // protected 方法：同包和子类可调用
    protected void auditLog(String msg) {
        System.out.println("[审计] " + accountId + ": " + msg);
    }

    // default 方法：同包可调用
    void resetCounter() {
        counter = 0;
        System.out.println("计数器已重置");
    }

    // private 方法：仅本类可调用
    private boolean validateAmount(double amount) {
        return amount > 0;
    }
}`
  },
  {
    id: "java-encapsulation",
    group: "OOP 深入",
    icon: "🛡️",
    title: "封装深入",
    content: `# 封装深入

封装（Encapsulation）是面向对象三大特性之一，指将数据（字段）和操作数据的方法绑定在一起，并隐藏内部实现细节。

## 封装的意义

1. **数据保护**：防止外部代码随意修改内部状态，避免非法值
2. **降低耦合**：内部实现可自由变化，不影响调用方
3. **集中校验**：在 setter 中统一做数据验证
4. **灵活维护**：可后续添加日志、缓存、通知等逻辑

## getter/setter

将字段设为 \`private\`，通过 public 的 getter/setter 访问：

\`\`\`java
public class User {
    private int age;
    public int getAge() { return age; }
    public void setAge(int age) {
        if (age < 0) throw new IllegalArgumentException();
        this.age = age;
    }
}
\`\`\`

## 字段私有化

所有字段都应设为 private（或 protected），这是封装的基础。public 字段会暴露内部实现，难以维护。

## 不可变对象

不可变对象创建后状态不能改变，天生线程安全。实现要点：

- 类用 \`final\` 修饰，防止子类破坏
- 所有字段 \`private final\`
- 不提供 setter
- 通过构造方法初始化所有字段
- 若字段是可变对象，返回副本

\`\`\`java
public final class Money {
    private final int amount;
    public Money(int amount) { this.amount = amount; }
    public int getAmount() { return amount; }
}
\`\`\`

## 数据验证

在 setter 和构造方法中验证数据，保证对象始终处于合法状态，称为"失败原子性"。

## 只读/只写属性

- 只读：只提供 getter（如计算属性、不可变字段）
- 只写：只提供 setter（如密码字段）

下面通过代码演示封装与不可变对象：`,
    code: `// 演示封装与不可变对象
public class Main {
    public static void main(String[] args) {
        // 演示封装：通过 setter 进行数据验证
        Student s = new Student("小明");
        s.setAge(20);
        System.out.println(s.getName() + " 年龄: " + s.getAge());

        try {
            s.setAge(-5); // 非法值，会抛异常
        } catch (IllegalArgumentException e) {
            System.out.println("设置年龄失败: " + e.getMessage());
        }

        // 演示不可变对象
        Point p1 = new Point(3, 4);
        Point p2 = p1.translate(1, 1); // 返回新对象，原对象不变
        System.out.println("原始点: " + p1);
        System.out.println("平移后: " + p2);

        // 演示只读属性
        Circle c = new Circle(5);
        System.out.println("半径: " + c.getRadius() + ", 面积: " + c.getArea());
    }
}

class Student {
    private String name;  // 私有字段
    private int age;

    public Student(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    // setter 中进行数据验证
    public void setAge(int age) {
        if (age < 0 || age > 150) {
            throw new IllegalArgumentException("年龄必须在 0~150 之间");
        }
        this.age = age;
    }

    public int getAge() {
        return age;
    }
}

// 不可变对象：final 类 + final 字段 + 无 setter
final class Point {
    private final int x;
    private final int y;

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    // 返回新对象而非修改自身
    public Point translate(int dx, int dy) {
        return new Point(this.x + dx, this.y + dy);
    }

    public int getX() { return x; }
    public int getY() { return y; }

    @Override
    public String toString() {
        return "Point(" + x + ", " + y + ")";
    }
}

// 只读属性：只有 getter，没有 setter
class Circle {
    private final double radius;

    public Circle(double radius) {
        if (radius < 0) throw new IllegalArgumentException("半径不能为负");
        this.radius = radius;
    }

    public double getRadius() {
        return radius;
    }

    // 计算属性：只读
    public double getArea() {
        return Math.PI * radius * radius;
    }
}`
  },
  {
    id: "java-static-deep",
    group: "OOP 深入",
    icon: "⚡",
    title: "static 深入",
    content: `# static 深入

\`static\` 修饰的成员属于**类**而非某个对象，所有实例共享同一份。static 成员在类加载时初始化，生命周期与类相同。

## static 变量（类变量）

所有对象共享同一份内存，常用于计数器、配置、常量：

\`\`\`java
public class Counter {
    private static int total = 0; // 所有实例共享
    public Counter() { total++; }
}
\`\`\`

## static 方法（类方法）

不需要创建对象即可调用，如 \`Math.sqrt()\`。限制：

- 不能直接访问实例变量和实例方法（没有 this）
- 不能使用 \`this\` 和 \`super\`
- 只能访问 static 成员

## static 代码块

类加载时执行一次，用于初始化静态资源：

\`\`\`java
static {
    // 加载配置文件、初始化静态 Map 等
}
\`\`\`

## static 初始化时机

1. JVM 首次使用类时加载（创建实例、访问静态成员、子类加载等）
2. 加载时先初始化静态字段默认值
3. 按代码顺序执行静态字段初始化和 static 块
4. 仅执行一次

## static 与实例的加载顺序

类加载时：**父类静态 → 子类静态**。
创建对象时：**父类实例块/构造 → 子类实例块/构造**。
静态总是先于实例初始化。

## static 的线程安全性

- static 变量是共享资源，多线程访问需同步
- static 块由 JVM 保证只执行一次（类加载时加锁），本身线程安全
- 但 static 变量的后续读写需自行加锁或用 \`Atomic\` 类

下面通过代码演示 static 初始化顺序：`,
    code: `// 演示 static 初始化顺序
public class Main {
    // 静态字段
    private static int a = initA();
    // 静态代码块
    static {
        System.out.println("2. Main 的 static 代码块执行");
        b = 20;
    }
    private static int b;

    private static int initA() {
        System.out.println("1. Main 的 static 字段 a 初始化");
        return 10;
    }

    public static void main(String[] args) {
        System.out.println("4. main 方法开始执行");
        System.out.println("a = " + a + ", b = " + b);

        // 创建子类对象，观察加载顺序
        System.out.println("--- 创建 Child 对象 ---");
        Child c1 = new Child();
        System.out.println("--- 再创建一个 Child 对象 ---");
        Child c2 = new Child(); // 静态部分不再执行

        // 静态变量共享演示
        Counter ct1 = new Counter();
        Counter ct2 = new Counter();
        Counter ct3 = new Counter();
        System.out.println("创建对象总数: " + Counter.total);
    }
}

class Parent {
    static {
        System.out.println("3a. Parent 静态块执行");
    }

    Parent() {
        System.out.println("3c. Parent 构造方法执行");
    }
}

class Child extends Parent {
    static {
        System.out.println("3b. Child 静态块执行");
    }

    Child() {
        System.out.println("3d. Child 构造方法执行");
    }
}

class Counter {
    static int total = 0; // 所有实例共享

    public Counter() {
        total++;
    }
}`
  },
  {
    id: "java-init-blocks",
    group: "OOP 深入",
    icon: "🧱",
    title: "初始化块",
    content: `# 初始化块

初始化块（Initializer Block）是用 \`{}\` 包裹的代码，用于在构造方法执行前完成初始化逻辑。分为**实例初始化块**和**静态初始化块**。

## 实例初始化块

每次创建对象时执行，位于字段初始化之后、构造方法体之前：

\`\`\`java
public class Demo {
    {
        // 实例初始化块
        System.out.println("实例块执行");
    }
}
\`\`\`

特点：
- 每次创建对象都执行
- 多个实例块按出现顺序执行
- 用于多个构造方法的公共初始化逻辑

## 静态初始化块

类加载时执行一次，用 \`static {}\` 标识：

\`\`\`java
public class Demo {
    static {
        // 静态初始化块
        System.out.println("静态块执行");
    }
}
\`\`\`

特点：
- 仅在类加载时执行一次
- 用于初始化静态资源（配置、缓存、驱动加载）
- 多个静态块按出现顺序执行

## 执行顺序

完整顺序（创建对象时）：

1. **父类静态块**（首次加载）
2. **子类静态块**（首次加载）
3. **父类实例块 + 字段初始化**
4. **父类构造方法**
5. **子类实例块 + 字段初始化**
6. **子类构造方法**

口诀：**静态先于实例，父类先于子类，块先于构造**。

## 初始化块用途

- 提取多个构造方法的公共代码
- 初始化复杂静态资源
- 匿名内部类中（无法写构造方法）用实例块完成初始化

下面通过代码演示初始化块执行顺序：`,
    code: `// 演示初始化块执行顺序
public class Main {
    // 静态字段
    private static String s1 = initStatic("1. Main 静态字段 s1 初始化");

    // 静态初始化块
    static {
        System.out.println("2. Main 静态初始化块执行");
    }

    // 实例字段
    private String i1 = initInstance("5. Main 实例字段 i1 初始化");

    // 实例初始化块
    {
        System.out.println("6. Main 实例初始化块执行");
    }

    public Main() {
        System.out.println("7. Main 构造方法执行");
    }

    private static String initStatic(String msg) {
        System.out.println(msg);
        return "static";
    }

    private static String initInstance(String msg) {
        System.out.println(msg);
        return "instance";
    }

    public static void main(String[] args) {
        System.out.println("3. main 方法开始");
        System.out.println("--- 第一次创建 Main 对象 ---");
        new Main();
        System.out.println("--- 第二次创建 Main 对象 ---");
        new Main(); // 静态部分不再执行
        System.out.println("--- 创建 Child 对象，观察继承顺序 ---");
        new Child();
    }
}

class Parent {
    static {
        System.out.println("4a. Parent 静态块");
    }
    {
        System.out.println("4c. Parent 实例块");
    }
    Parent() {
        System.out.println("4d. Parent 构造方法");
    }
}

class Child extends Parent {
    static {
        System.out.println("4b. Child 静态块");
    }
    {
        System.out.println("4e. Child 实例块");
    }
    Child() {
        System.out.println("4f. Child 构造方法");
    }
}`
  },
  {
    id: "java-final-members",
    group: "OOP 深入",
    icon: "🔒",
    title: "final 成员",
    content: `# final 成员

\`final\` 是 Java 中表示"不可变/不可覆盖"的修饰符，可用于变量、方法、类、参数，含义随上下文而不同。

## final 字段

被 \`final\` 修饰的字段只能赋值一次，赋值后不可修改。必须满足以下任一方式初始化：

- 声明时初始化
- 实例初始化块中初始化
- 构造方法中初始化

\`\`\`java
public class Config {
    private final int timeout;
    public Config(int t) { this.timeout = t; } // 构造方法初始化
}
\`\`\`

## blank final（空白 final）

声明时未赋值的 final 字段称为 blank final，必须在构造方法或初始化块中完成赋值。这允许根据构造参数决定常量值。

## final 方法

被 \`final\` 修饰的方法**不能被子类重写**，但可以重载。用途：

- 保护核心逻辑不被修改
- 保留行为一致性（如 \`Object.getClass()\`）

## final 类

被 \`final\` 修饰的类**不能被继承**，如 \`String\`、\`Integer\`。用途：

- 保证不可变性（防止子类破坏）
- 安全考虑
- 防止设计被篡改

## final 参数

方法参数用 \`final\` 修饰后，方法内不能重新赋值该参数。常用于内部类捕获外部变量（实质上要求 effectively final）。

## final 局部变量

局部变量用 \`final\` 修饰后只能赋值一次，常用于常量定义和 Lambda/匿名类捕获。

## final 与性能

JVM 可能对 final 字段做优化（如内联常量），但不要为性能滥用 final，应以设计意图为准。

下面通过代码演示 final 的各种用法：`,
    code: `// 演示 final 各种用法
public class Main {
    public static void main(String[] args) {
        // final 类无法继承，但可以正常使用
        ImmutablePoint p = new ImmutablePoint(3, 4);
        System.out.println(p);
        // p.x = 10; // 编译错误：final 字段不可修改

        // final 字段根据构造参数决定
        Config c1 = new Config(100);
        Config c2 = new Config(200);
        System.out.println("c1 超时: " + c1.getTimeout());
        System.out.println("c2 超时: " + c2.getTimeout());

        // final 参数与 final 局部变量
        int result = calculate(5, 10);
        System.out.println("计算结果: " + result);

        // final 方法可以正常调用，但不能被子类重写
        Animal a = new Dog();
        a.breathe(); // 继承自父类的 final 方法
    }

    // final 参数：方法内不可重新赋值
    public static int calculate(final int x, final int y) {
        // x = 100; // 编译错误
        final int sum = x + y; // final 局部变量
        return sum;
    }
}

// final 类：不可继承
final class ImmutablePoint {
    private final int x;  // blank final
    private final int y;

    public ImmutablePoint(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public int getX() { return x; }
    public int getY() { return y; }

    @Override
    public String toString() {
        return "Point(" + x + ", " + y + ")";
    }
}

class Config {
    private final int timeout; // blank final，构造时初始化

    public Config(int timeout) {
        this.timeout = timeout;
    }

    public int getTimeout() {
        return timeout;
    }
}

class Animal {
    // final 方法：子类不能重写，但可以调用
    public final void breathe() {
        System.out.println("动物呼吸中...");
    }

    public void sound() {
        System.out.println("动物发声");
    }
}

class Dog extends Animal {
    // 重写非 final 方法
    @Override
    public void sound() {
        System.out.println("汪汪汪！");
    }

    // 下面会编译错误：无法重写 final 方法
    // public void breathe() { }
}`
  },
  {
    id: "java-packages",
    group: "OOP 深入",
    icon: "📦",
    title: "包与导入",
    content: `# 包与导入

包（Package）是 Java 组织类的机制，用于避免命名冲突、控制访问范围、实现逻辑分组。

## package 声明

每个 Java 文件的**第一行**（除注释外）声明所属包：

\`\`\`java
package com.example.service;
public class UserService { }
\`\`\`

包名对应目录结构：\`com/example/service/UserService.java\`。

## 包命名规范

采用**反向域名**格式，全部小写：

- \`com.google.gson\`
- \`org.apache.commons.lang3\`
- \`cn.edu.tsinghua.cs\`

避免使用 Java 保留包名（\`java.*\`、\`javax.*\`）。

## import 语句

导入其他包的类，必须放在 package 之后、类定义之前：

\`\`\`java
import java.util.List;        // 导入单个类
import java.util.*;           // 导入整个包（通配符）
import static java.lang.Math.*; // 静态导入
\`\`\`

## 同包访问

同一包中的类可以直接互相访问，无需 import，且能访问 default 成员。

## 默认包（无名包）

不声明 package 的类属于"默认包"。默认包中的类无法被其他包的类 import，仅适合小型练习，正式项目应避免。

## import 注意事项

- 通配符 \`*\` 不会递归子包
- 同名类需用全限定名区分，如 \`java.util.Date\` 和 \`java.sql.Date\`
- 静态导入可省略类名直接用静态成员

## 包的访问控制

包是 default 访问级别的边界，default 成员仅同包可见，这是封装的"包级别"形式。

下面通过代码演示包与导入概念（单文件模拟）：`,
    code: `// 演示包与导入概念（单文件模拟，实际项目应分目录）
public class Main {
    public static void main(String[] args) {
        // 使用全限定名访问工具类（模拟跨包访问）
        StringUtil util = new StringUtil();
        String reversed = util.reverse("Hello");
        System.out.println("反转结果: " + reversed);

        // 使用全限定名避免歧义（模拟 java.util.Date 与 java.sql.Date）
        // 这里用自定义的两个 Date 类演示
        MyDateA dateA = new MyDateA("2024-01-01");
        MyDateB dateB = new MyDateB(2024, 1, 1);
        System.out.println("DateA: " + dateA.format());
        System.out.println("DateB: " + dateB.format());

        // 静态导入模拟：直接调用静态方法
        int maxVal = Math.max(10, 20);
        double pi = Math.PI;
        System.out.println("max = " + maxVal + ", pi = " + pi);

        // 同包访问 default 成员
        DefaultMember demo = new DefaultMember();
        demo.show();
    }
}

// 模拟工具类（实际应放在 com.example.util 包）
class StringUtil {
    public String reverse(String s) {
        return new StringBuilder(s).reverse().toString();
    }
}

// 模拟同名类歧义（实际分属不同包）
class MyDateA {
    private String dateStr;
    public MyDateA(String s) { this.dateStr = s; }
    public String format() { return "字符串日期: " + dateStr; }
}

class MyDateB {
    private int year, month, day;
    public MyDateB(int y, int m, int d) {
        this.year = y; this.month = m; this.day = d;
    }
    public String format() { return "数值日期: " + year + "-" + month + "-" + day; }
}

// 演示包级别（default）访问
class DefaultMember {
    String name = "默认包成员"; // default 字段，同包可见

    void show() { // default 方法，同包可见
        System.out.println("访问 default 成员: " + name);
    }
}`
  },
  {
    id: "java-object-lifecycle",
    group: "OOP 深入",
    icon: "🔄",
    title: "对象生命周期",
    content: `# 对象生命周期

Java 对象从创建到被回收经历完整的生命周期：**创建 → 使用 → 不可达 → 垃圾回收**。

## 创建阶段

通过 \`new\` 关键字创建对象：

1. JVM 在堆中分配内存
2. 将字段初始化为默认值（0、null、false）
3. 执行字段初始化和实例块
4. 执行构造方法
5. 返回对象引用

\`\`\`java
Person p = new Person("张三"); // 栈变量 p 持有堆对象的引用
\`\`\`

## 使用阶段

对象被引用持有，可被访问和调用。多个引用可指向同一对象。

## 不可达阶段

当没有任何引用指向对象时，对象变为"不可达"，成为垃圾回收候选。引用消失的方式：

- 引用超出作用域（方法结束）
- 引用被置为 \`null\`
- 引用被重新赋值指向其他对象

## 垃圾回收（GC）

JVM 的垃圾回收器自动回收不可达对象，程序员**无需手动释放**。GC 时机不确定，可调用 \`System.gc()\` 建议（不保证）回收。

## finalize 方法（已废弃）

\`Object.finalize()\` 在对象被回收前调用，但**已从 Java 9 开始废弃**（Deprecated），原因：

- 执行时机不确定
- 可能导致对象"复活"
- 性能差
- 替代方案：\`try-with-resources\` 或 \`Cleaner\` API

## 引用类型

Java 提供四种引用强度，影响回收时机：

| 类型 | 特点 | 用途 |
|------|------|------|
| **Strong**（强引用） | 永不回收（只要可达） | 普通对象 |
| **Soft**（软引用） | 内存不足时回收 | 内存敏感缓存 |
| **Weak**（弱引用） | 下次 GC 就回收 | WeakHashMap、防止内存泄漏 |
| **Phantom**（虚引用） | 不影响对象生命周期，仅跟踪回收 | 资源清理跟踪 |

\`\`\`java
SoftReference<byte[]> cache = new SoftReference<>(new byte[1024]);
WeakReference<Object> weak = new WeakReference<>(new Object());
\`\`\`

下面通过代码演示对象创建与引用类型：`,
    code: `// 演示对象创建与引用类型
import java.lang.ref.SoftReference;
import java.lang.ref.WeakReference;
import java.lang.ref.PhantomReference;
import java.lang.ref.ReferenceQueue;

public class Main {
    public static void main(String[] args) {
        // 1. 强引用：普通创建
        Person p1 = new Person("张三", 25);
        Person p2 = p1; // 两个引用指向同一对象
        System.out.println("创建对象: " + p1);
        p1 = null; // p1 不再引用，但 p2 仍引用，对象不可达前不会被回收
        System.out.println("p2 仍可访问: " + p2);
        p2 = null; // 现在对象不可达，等待 GC

        // 2. 软引用：内存敏感缓存
        SoftReference<byte[]> softRef = new SoftReference<>(new byte[1024 * 100]);
        byte[] softData = softRef.get();
        System.out.println("软引用数据存在: " + (softData != null));

        // 3. 弱引用：下次 GC 回收
        WeakReference<String> weakRef = new WeakReference<>(new String("弱引用对象"));
        System.out.println("GC 前弱引用: " + weakRef.get());
        System.gc(); // 建议垃圾回收
        try { Thread.sleep(100); } catch (InterruptedException e) {}
        System.out.println("GC 后弱引用: " + weakRef.get()); // 可能为 null

        // 4. 虚引用：仅用于跟踪回收，get() 永远返回 null
        ReferenceQueue<String> queue = new ReferenceQueue<>();
        PhantomReference<String> phantomRef = new PhantomReference<>(new String("虚引用"), queue);
        System.out.println("虚引用 get(): " + phantomRef.get()); // 总是 null

        // 演示 finalize 已废弃
        OldResource res = new OldResource();
        res = null; // 不可达
        System.gc(); // finalize 可能执行但不可靠
    }
}

class Person {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return "Person{name='" + name + "', age=" + age + "}";
    }
}

// 演示已废弃的 finalize（实际项目应避免使用）
class OldResource {
    @Override
    protected void finalize() throws Throwable {
        // 已废弃，不推荐重写
        System.out.println("OldResource.finalize 被调用（不可靠）");
    }
}`
  },
  {
    id: "java-equals-hashcode",
    group: "OOP 深入",
    icon: "🔑",
    title: "equals 与 hashCode",
    content: `# equals 与 hashCode

\`equals\` 和 \`hashCode\` 是 \`Object\` 的两个核心方法，重写时必须**同时重写**，否则在 HashMap、HashSet 等基于哈希的集合中会出错。

## equals 契约

重写 \`equals\` 必须满足以下性质：

1. **自反性**：\`x.equals(x)\` 为 true
2. **对称性**：\`x.equals(y)\` 为 true 时，\`y.equals(x)\` 也为 true
3. **传递性**：\`x.equals(y)\` 且 \`y.equals(z)\` 为 true，则 \`x.equals(z)\` 为 true
4. **一致性**：多次调用结果一致（对象未修改）
5. **null 处理**：\`x.equals(null)\` 为 false

## hashCode 契约

1. 同一对象多次调用 \`hashCode\` 必须返回相同值
2. 若 \`x.equals(y)\` 为 true，则 \`x.hashCode() == y.hashCode()\` **必须**成立
3. 若 \`equals\` 不等，\`hashCode\` 可以相等（哈希冲突），但不同时性能更好

## 为什么要同时重写

如果两个对象 \`equals\` 相等但 \`hashCode\` 不同，HashMap 会把它们放到不同桶，导致：

- \`put\` 后 \`containsKey\` 返回 false
- HashSet 中出现"重复"元素

这是经典 bug 来源。

## Objects.equals 与 Objects.hash

\`java.util.Objects\` 提供安全工具方法：

\`\`\`java
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof Person)) return false;
    Person p = (Person) o;
    return age == p.age && Objects.equals(name, p.name);
}

@Override
public int hashCode() {
    return Objects.hash(name, age);
}
\`\`\`

\`Objects.equals\` 避免 NullPointerException，\`Objects.hash\` 自动组合字段。

下面通过代码演示正确的 equals/hashCode：`,
    code: `// 演示正确的 equals 与 hashCode 实现
import java.util.Objects;
import java.util.HashSet;
import java.util.Set;

public class Main {
    public static void main(String[] args) {
        Employee e1 = new Employee("E001", "张三", 5000);
        Employee e2 = new Employee("E001", "张三", 6000); // 编号相同视为同一人
        Employee e3 = new Employee("E002", "李四", 5000);

        // equals 测试
        System.out.println("e1 == e2: " + (e1 == e2));           // false：不同对象
        System.out.println("e1.equals(e2): " + e1.equals(e2));   // true：编号相同
        System.out.println("e1.equals(e3): " + e1.equals(e3));   // false
        System.out.println("e1.equals(null): " + e1.equals(null)); // false

        // hashCode 测试：equals 相等则 hashCode 必须相等
        System.out.println("e1.hashCode: " + e1.hashCode());
        System.out.println("e2.hashCode: " + e2.hashCode());
        System.out.println("hashCode 相等: " + (e1.hashCode() == e2.hashCode()));

        // HashSet 测试：依赖 equals 和 hashCode
        Set<Employee> set = new HashSet<>();
        set.add(e1);
        set.add(e2); // 应被视为重复，不会被加入
        set.add(e3);
        System.out.println("Set 大小: " + set.size()); // 应为 2
        System.out.println("包含 e2: " + set.contains(e2)); // true
    }
}

class Employee {
    private final String id;     // 编号作为业务主键
    private final String name;
    private final double salary;

    public Employee(String id, String name, double salary) {
        this.id = id;
        this.name = name;
        this.salary = salary;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;            // 自反性优化
        if (!(o instanceof Employee)) return false; // 类型检查
        Employee emp = (Employee) o;
        // 仅比较业务主键 id
        return Objects.equals(id, emp.id);
    }

    @Override
    public int hashCode() {
        // equals 用哪些字段，hashCode 就用哪些
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Employee{id='" + id + "', name='" + name + "', salary=" + salary + "}";
    }
}`
  },
  {
    id: "java-toString",
    group: "OOP 深入",
    icon: "📋",
    title: "toString 方法",
    content: `# toString 方法

\`toString\` 是 \`Object\` 类的方法，返回对象的字符串表示。合理重写它对调试、日志、打印输出非常重要。

## Object.toString 默认实现

默认返回 \`类名@十六进制哈希码\`：

\`\`\`java
public String toString() {
    return getClass().getName() + "@" + Integer.toHexString(hashCode());
}
// 输出: com.example.Person@1b6d3586
\`\`\`

这种输出对人类几乎无意义，所以通常需要重写。

## 自定义 toString

重写时应返回对象的关键字段信息，便于阅读：

\`\`\`java
@Override
public String toString() {
    return "Person{name='" + name + "', age=" + age + "}";
}
\`\`\`

## 自动调用场景

\`toString\` 会在以下情况被自动调用：

- \`System.out.println(obj)\` / \`print(obj)\`
- 字符串拼接 \`"" + obj\`
- 日志记录 \`log.info("user={}", user)\`
- 调试器中查看对象

## 字符串拼接性能

- 简单拼接用 \`+\` 即可（编译器优化）
- 循环拼接用 \`StringBuilder\`
- \`String.format\` 适合格式化但性能略差

\`\`\`java
// 简单场景
String s = "User: " + name + ", age: " + age;

// 循环场景
StringBuilder sb = new StringBuilder();
for (String item : list) {
    sb.append(item).append(", ");
}
\`\`\`

## 调试用途

良好的 toString 是调试利器。可借助 IDE 自动生成，或使用 Lombok 的 \`@ToString\` 注解简化。

注意：toString 中不要调用可能抛异常或产生副作用的方法，避免循环引用（如双向关联）导致栈溢出。

下面通过代码演示自定义 toString：`,
    code: `// 演示自定义 toString 方法
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        // 演示默认 toString（无意义）
        Object obj = new Object();
        System.out.println("默认 toString: " + obj.toString());

        // 演示自定义 toString（有意义）
        Book book = new Book("Java 核心技术", "Cay Horstmann", 89.0);
        System.out.println("直接打印: " + book); // 自动调用 toString
        System.out.println("拼接: " + "书籍信息 -> " + book);

        // 演示嵌套对象的 toString
        Library lib = new Library("市图书馆");
        lib.addBook(new Book("深入理解 JVM", "周志明", 119.0));
        lib.addBook(new Book("Effective Java", "Joshua Bloch", 99.0));
        lib.addBook(book);
        System.out.println(lib); // 自动递归调用各 Book 的 toString

        // 循环拼接用 StringBuilder
        StringBuilder sb = new StringBuilder("书名列表: ");
        for (Book b : lib.getBooks()) {
            sb.append(b.getTitle()).append(" | ");
        }
        System.out.println(sb.toString());
    }
}

class Book {
    private String title;
    private String author;
    private double price;

    public Book(String title, String author, double price) {
        this.title = title;
        this.author = author;
        this.price = price;
    }

    public String getTitle() { return title; }

    @Override
    public String toString() {
        return "Book{title='" + title + "', author='" + author + "', price=" + price + "}";
    }
}

class Library {
    private String name;
    private List<Book> books = new ArrayList<>();

    public Library(String name) {
        this.name = name;
    }

    public void addBook(Book b) {
        books.add(b);
    }

    public List<Book> getBooks() {
        return books;
    }

    @Override
    public String toString() {
        return "Library{name='" + name + "', books=" + books + "}";
    }
}`
  },
  {
    id: "java-clone",
    group: "OOP 深入",
    icon: "🖨️",
    title: "clone 与对象拷贝",
    content: `# clone 与对象拷贝

对象拷贝分为**浅拷贝**和**深拷贝**，理解它们的区别对正确处理对象复制至关重要。

## Cloneable 接口

\`Cloneable\` 是标记接口（无方法），实现它表示对象允许被克隆。配合 \`Object.clone()\` 使用：

\`\`\`java
public class Demo implements Cloneable {
    @Override
    protected Demo clone() throws CloneNotSupportedException {
        return (Demo) super.clone();
    }
}
\`\`\`

## 浅拷贝（Shallow Copy）

\`Object.clone()\` 默认是浅拷贝：

- 基本类型字段：复制值
- 引用类型字段：复制引用（指向同一对象）

修改副本的引用字段会影响原对象，这是浅拷贝的陷阱。

## 深拷贝（Deep Copy）

深拷贝递归复制所有引用对象，原对象与副本完全独立。实现方式：

1. 手动递归 clone 所有引用字段
2. 通过序列化/反序列化
3. 拷贝构造方法
4. 拷贝工厂方法

## clone 方法的问题

\`clone()\` 设计存在缺陷，Effective Java 建议避免使用：

- 需要实现 Cloneable（违反接口设计）
- \`clone()\` 是 protected，需手动提升为 public
- 浅拷贝容易引发 bug
- 构造方法不会被调用（可能破坏不变性）

## 拷贝构造方法

更推荐的拷贝方式，类型安全且清晰：

\`\`\`java
public Person(Person other) {
    this.name = other.name;
    this.address = new Address(other.address); // 深拷贝
}
\`\`\`

## 拷贝工厂

静态工厂方法提供拷贝，比构造方法更灵活：

\`\`\`java
public static Person copyOf(Person other) { ... }
\`\`\`

下面通过代码演示浅拷贝与深拷贝：`,
    code: `// 演示浅拷贝与深拷贝
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) throws CloneNotSupportedException {
        System.out.println("=== 浅拷贝演示 ===");
        Address addr = new Address("北京", "朝阳区");
        PersonShallow p1 = new PersonShallow("张三", addr);
        PersonShallow p2 = p1.clone();

        System.out.println("原对象: " + p1);
        System.out.println("副本: " + p2);
        System.out.println("地址引用相同: " + (p1.getAddress() == p2.getAddress()));

        // 修改副本的地址，原对象也受影响（浅拷贝陷阱）
        p2.getAddress().setCity("上海");
        System.out.println("修改副本后原对象: " + p1); // 城市也变了

        System.out.println("\\n=== 深拷贝演示 ===");
        Address addr2 = new Address("广州", "天河区");
        PersonDeep d1 = new PersonDeep("李四", addr2);
        PersonDeep d2 = new PersonDeep(d1); // 拷贝构造方法实现深拷贝

        System.out.println("原对象: " + d1);
        System.out.println("副本: " + d2);
        System.out.println("地址引用相同: " + (d1.getAddress() == d2.getAddress()));

        // 修改副本的地址，原对象不受影响
        d2.getAddress().setCity("深圳");
        System.out.println("修改副本后原对象: " + d1); // 不变
        System.out.println("修改副本后副本: " + d2);
    }
}

class Address {
    private String city;
    private String district;

    public Address(String city, String district) {
        this.city = city;
        this.district = district;
    }

    // 拷贝构造方法
    public Address(Address other) {
        this.city = other.city;
        this.district = other.district;
    }

    public void setCity(String city) { this.city = city; }
    public String getCity() { return city; }

    @Override
    public String toString() {
        return city + district;
    }
}

// 浅拷贝
class PersonShallow implements Cloneable {
    private String name;
    private Address address;

    public PersonShallow(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    public Address getAddress() { return address; }

    @Override
    protected PersonShallow clone() throws CloneNotSupportedException {
        return (PersonShallow) super.clone(); // 浅拷贝
    }

    @Override
    public String toString() {
        return name + " @ " + address;
    }
}

// 深拷贝：通过拷贝构造方法
class PersonDeep {
    private String name;
    private Address address;

    public PersonDeep(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    // 拷贝构造方法：递归拷贝引用对象
    public PersonDeep(PersonDeep other) {
        this.name = other.name;
        this.address = new Address(other.address); // 深拷贝
    }

    public Address getAddress() { return address; }

    @Override
    public String toString() {
        return name + " @ " + address;
    }
}`
  },
  {
    id: "java-comparable",
    group: "OOP 深入",
    icon: "📊",
    title: "Comparable 接口",
    content: `# Comparable 接口

\`Comparable\` 接口定义对象的**自然排序**规则，实现后对象可直接用 \`Collections.sort()\`、\`Arrays.sort()\` 排序。

## compareTo 方法

\`Comparable\` 只有一个方法 \`compareTo\`：

\`\`\`java
public int compareTo(T o);
\`\`\`

返回值含义：

- **负数**：当前对象 < 参数对象（排前面）
- **0**：两者相等
- **正数**：当前对象 > 参数对象（排后面）

## 自然排序

实现 \`Comparable\` 的类拥有"天然"的排序规则，如 \`String\` 按字典序、\`Integer\` 按数值、\`Date\` 按时间。

## 排序规则编写

推荐用基本类型比较，避免溢出：

\`\`\`java
public int compareTo(Person o) {
    return Integer.compare(this.age, o.age); // 推荐
    // return this.age - o.age; // 不推荐：可能溢出
}
\`\`\`

多字段比较时，按优先级逐个比较：

\`\`\`java
public int compareTo(Person o) {
    int r = this.name.compareTo(o.name); // 先按名字
    if (r != 0) return r;
    return Integer.compare(this.age, o.age); // 名字相同再按年龄
}
\`\`\`

## 与 equals 的一致性

\`compareTo\` 返回 0 时，建议 \`equals\` 也返回 true（但非强制）。不一致会影响 TreeSet、TreeMap 等基于比较的集合行为。

BigDecimal 是典型的反例：\`compareTo\` 返回 0 但 \`equals\` 返回 false（如 1.0 与 1.00）。

## Comparable vs Comparator

| 特性 | Comparable | Comparator |
|------|-----------|------------|
| 所在包 | java.lang | java.util |
| 方法 | compareTo | compare |
| 数量 | 每类一个 | 可多个 |
| 修改类 | 需要 | 不需要 |
| 适用 | 自然排序 | 自定义/临时排序 |

下面通过代码演示 Comparable 实现：`,
    code: `// 演示 Comparable 接口实现
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        List<Student> students = new ArrayList<>();
        students.add(new Student("张三", 85));
        students.add(new Student("李四", 92));
        students.add(new Student("王五", 78));
        students.add(new Student("赵六", 92));
        students.add(new Student("钱七", 85));

        System.out.println("排序前:");
        for (Student s : students) System.out.println("  " + s);

        // 使用自然排序（依赖 compareTo）
        Collections.sort(students);

        System.out.println("\\n按成绩降序排序后:");
        for (Student s : students) System.out.println("  " + s);

        // TreeSet 依赖 Comparable 去重和排序
        TreeSet<Student> set = new TreeSet<>(students);
        System.out.println("\\nTreeSet 大小: " + set.size());

        // 比较演示
        Student s1 = new Student("甲", 90);
        Student s2 = new Student("乙", 90);
        System.out.println("\\ns1.compareTo(s2): " + s1.compareTo(s2));
        System.out.println("s1.equals(s2): " + s1.equals(s2));
    }
}

class Student implements Comparable<Student> {
    private String name;
    private int score;

    public Student(String name, int score) {
        this.name = name;
        this.score = score;
    }

    // 自然排序：先按成绩降序，成绩相同按姓名升序
    @Override
    public int compareTo(Student other) {
        // 成绩降序：用 other.score - this.score（但为避免溢出用 compare）
        int r = Integer.compare(other.score, this.score);
        if (r != 0) return r;
        // 成绩相同，按姓名升序
        return this.name.compareTo(other.name);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Student)) return false;
        Student s = (Student) o;
        return score == s.score && name.equals(s.name);
    }

    @Override
    public int hashCode() {
        return name.hashCode() * 31 + score;
    }

    @Override
    public String toString() {
        return name + "(" + score + "分)";
    }
}`
  },
  {
    id: "java-oop-design",
    group: "OOP 深入",
    icon: "🧩",
    title: "OOP 设计原则",
    content: `# OOP 设计原则

SOLID 是面向对象设计的五大原则，指导写出可维护、可扩展、低耦合的代码。

## S - 单一职责原则（SRP）

一个类应该只有一个引起变化的原因，即只负责一项职责。

\`\`\`java
// 反例：一个类既处理数据又负责打印
class Report {
    void calculate() { }
    void print() { }   // 应拆分到 ReportPrinter
}
\`\`\`

好处：降低耦合，便于复用和测试。

## O - 开闭原则（OCP）

软件实体应对扩展开放，对修改关闭。通过抽象（接口/抽象类）实现，新增功能时加新类而非改老类。

\`\`\`java
interface Shape { double area(); }
class Circle implements Shape { ... }   // 新增形状不改现有代码
class Square implements Shape { ... }
\`\`\`

## L - 里氏替换原则（LSP）

子类必须能替换父类且程序行为不变。子类不应加强前置条件或削弱后置条件。

违反示例：父类鸵鸟继承鸟但不能飞。正确做法是调整继承层次（如分离"会飞的鸟"）。

## I - 接口隔离原则（ISP）

客户端不应依赖它不用的方法。接口应小而专，避免"胖接口"。

\`\`\`java
// 反例：一个接口含太多方法
interface Worker { void work(); void eat(); void sleep(); }
// 机器人实现 Worker 被迫实现 eat/sleep

// 正确：拆分为小接口
interface Workable { void work(); }
interface Eatable { void eat(); }
\`\`\`

## D - 依赖倒置原则（DIP）

高层模块不应依赖低层模块，二者都应依赖抽象。抽象不依赖细节，细节依赖抽象。

\`\`\`java
// 反例：Service 直接依赖 MySQLDao
// 正确：Service 依赖 Dao 接口，MySQLDao 实现接口
class OrderService {
    private Dao dao; // 依赖抽象
}
\`\`\`

## 实际应用

- Spring 的依赖注入是 DIP 的体现
- 策略模式是 OCP 的体现
- 适配器模式遵循 ISP

SOLID 不是教条，应结合实际权衡，避免过度设计。

下面通过代码演示 OOP 设计原则：`,
    code: `// 演示 OOP 设计原则（开闭原则 + 依赖倒置）
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        // 依赖倒置：AreaCalculator 依赖 Shape 抽象，不依赖具体形状
        List<Shape> shapes = new ArrayList<>();
        shapes.add(new Circle(3));
        shapes.add(new Rectangle(4, 5));
        shapes.add(new Triangle(6, 2));

        AreaCalculator calculator = new AreaCalculator();
        double total = calculator.totalArea(shapes);
        System.out.println("总面积: " + total);

        // 开闭原则：新增形状无需修改 AreaCalculator
        shapes.add(new Square(4));
        System.out.println("加入正方形后总面积: " + calculator.totalArea(shapes));
    }
}

// 抽象（依赖倒置的基础）
interface Shape {
    double area();
}

// 具体实现：新增形状只需新增类，不改老代码（开闭原则）
class Circle implements Shape {
    private double radius;
    public Circle(double r) { this.radius = r; }
    @Override
    public double area() { return Math.PI * radius * radius; }
    @Override
    public String toString() { return "Circle(" + radius + ")"; }
}

class Rectangle implements Shape {
    private double width, height;
    public Rectangle(double w, double h) { this.width = w; this.height = h; }
    @Override
    public double area() { return width * height; }
    @Override
    public String toString() { return "Rectangle(" + width + "," + height + ")"; }
}

class Triangle implements Shape {
    private double base, height;
    public Triangle(double b, double h) { this.base = b; this.height = h; }
    @Override
    public double area() { return 0.5 * base * height; }
    @Override
    public String toString() { return "Triangle(" + base + "," + height + ")"; }
}

class Square implements Shape {
    private double side;
    public Square(double s) { this.side = s; }
    @Override
    public double area() { return side * side; }
    @Override
    public String toString() { return "Square(" + side + ")"; }
}

// 高层模块依赖 Shape 抽象，不依赖具体类（依赖倒置原则）
class AreaCalculator {
    // 单一职责：只负责计算面积
    public double totalArea(List<Shape> shapes) {
        double sum = 0;
        for (Shape s : shapes) {
            sum += s.area();
        }
        return sum;
    }
}`
  },
  {
    id: "java-record-class",
    group: "OOP 深入",
    icon: "📋",
    title: "Record 类（Java 16+）",
    content: `# Record 类（Java 16+）

\`record\` 是 Java 16 引入的语法，用于简洁地定义**不可变数据载体**，自动生成大量样板代码。

## record 语法

\`\`\`java
public record Point(int x, int y) {}
\`\`\`

这一行等价于传统写法的：

- private final 字段 x、y
- 全参构造方法
- getter 方法 \`x()\`、\`y()\`（注意：不是 \`getX()\`）
- \`equals\`、\`hashCode\`、\`toString\`

## 自动生成的方法

record 自动生成：

- **紧凑构造方法**：接收所有组件并赋值
- **访问器方法**：\`x()\`、\`y()\` 形式（无 get 前缀）
- **equals/hashCode**：基于所有组件
- **toString**：格式如 \`Point[x=1, y=2]\`

## 紧凑构造器（Compact Constructor）

用于参数校验，无需显式赋值：

\`\`\`java
public record Range(int start, int end) {
    public Range {  // 紧凑构造器
        if (start > end) throw new IllegalArgumentException();
    }
}
\`\`\`

## 自定义方法

record 可以添加自定义方法，但不能再定义实例字段（record 隐式 final）：

\`\`\`java
public record Point(int x, int y) {
    public double distanceFromOrigin() {
        return Math.sqrt(x * x + y * y);
    }
}
\`\`\`

## record 与不可变性

record 是不可变的：

- 字段隐式 \`private final\`
- 无 setter
- 不能继承其他类（隐式继承 \`java.lang.Record\`）
- 可实现接口

## 适用场景

- 数据传输对象（DTO）
- 值对象（Value Object）
- 方法多返回值
- 不可变配置
- 事件对象

不适用：需要可变状态、复杂行为的对象（用普通类）。

## record 与 Lombok

record 是语言级支持，替代了 Lombok 的 \`@Value\` 注解，无需第三方依赖。

下面通过代码演示 record 的使用：`,
    code: `// 演示 record 类的使用（需 Java 16+）
import java.util.List;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        // 1. 基础 record：自动生成构造、访问器、toString、equals、hashCode
        Point p1 = new Point(3, 4);
        Point p2 = new Point(3, 4);
        System.out.println("p1: " + p1);            // toString
        System.out.println("x = " + p1.x());        // 访问器
        System.out.println("y = " + p1.y());
        System.out.println("p1.equals(p2): " + p1.equals(p2));
        System.out.println("hashCode 相等: " + (p1.hashCode() == p2.hashCode()));

        // 2. 紧凑构造器：参数校验
        Range range = new Range(1, 10);
        System.out.println("\\n范围: " + range);
        try {
            Range invalid = new Range(10, 1); // 校验失败
        } catch (IllegalArgumentException e) {
            System.out.println("校验失败: " + e.getMessage());
        }

        // 3. 自定义方法
        Point origin = new Point(0, 0);
        System.out.println("\\n到原点距离: " + p1.distanceFromOrigin());
        System.out.println("原点距离: " + origin.distanceFromOrigin());

        // 4. record 作为 DTO 使用
        List<UserDto> users = new ArrayList<>();
        users.add(new UserDto(1L, "张三", "zhangsan@example.com"));
        users.add(new UserDto(2L, "李四", "lisi@example.com"));
        System.out.println("\\n用户列表:");
        users.forEach(u -> System.out.println("  " + u));
    }
}

// 基础 record
record Point(int x, int y) {
    // 自定义方法
    public double distanceFromOrigin() {
        return Math.sqrt(x * x + y * y);
    }
}

// 紧凑构造器进行校验
record Range(int start, int end) {
    // 紧凑构造器：无需显式赋值，仅做校验
    public Range {
        if (start > end) {
            throw new IllegalArgumentException("start 不能大于 end");
        }
    }
}

// record 作为不可变 DTO
record UserDto(Long id, String name, String email) {
    // 可添加额外方法
    public String displayName() {
        return name + " <" + email + ">";
    }
}`
  }
];
