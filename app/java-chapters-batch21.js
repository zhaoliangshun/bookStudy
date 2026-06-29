// =============================================================
// Java 交互式教程 —— 第二十一批章节（设计模式组，共 15 章）
// =============================================================

export const chapters = [
  {
    id: "java-singleton",
    group: "设计模式",
    icon: "🔒",
    title: "单例模式",
    content: `# 单例模式

单例模式（Singleton）保证一个类**只有一个实例**，并提供全局访问点。它是最简单也最常被误用的设计模式之一。

## 适用场景

- 全局配置管理
- 日志器、线程池、缓存
- 数据库连接池
- 需要共享的唯一资源

## 饿汉式

在类加载时即创建实例，基于类加载机制保证线程安全：

\`\`\`java
public class Singleton {
    private static final Singleton INSTANCE = new Singleton();
    private Singleton() {}
    public static Singleton getInstance() { return INSTANCE; }
}
\`\`\`

优点：实现简单、线程安全。缺点：类加载即初始化，可能浪费资源。

## 懒汉式

延迟初始化，首次调用时创建。但需处理线程安全：

\`\`\`java
public static synchronized Singleton getInstance() {
    if (instance == null) instance = new Singleton();
    return instance;
}
\`\`\`

\`synchronized\` 保证线程安全，但每次调用都同步，性能差。

## 双重检查锁（DCL）

经典写法，结合两次检查与 \`volatile\`：

\`\`\`java
if (instance == null) {
    synchronized (Singleton.class) {
        if (instance == null) instance = new Singleton();
    }
}
\`\`\`

\`volatile\` 防止指令重排序——\`new\` 操作非原子，可能先分配内存赋值再初始化，导致其他线程拿到未初始化对象。

## 静态内部类

利用类加载机制实现惰性初始化与线程安全，推荐写法：

\`\`\`java
public class Singleton {
    private Singleton() {}
    private static class Holder { static final Singleton INSTANCE = new Singleton(); }
    public static Singleton getInstance() { return Holder.INSTANCE; }
}
\`\`\`

\`Holder\` 只在 \`getInstance\` 首次调用时加载，天然线程安全且延迟初始化。

## 枚举单例

最简洁、最安全的实现，Effective Java 推荐：

\`\`\`java
public enum Singleton { INSTANCE; }
\`\`\`

枚举天然单例，且**自动防御反射攻击与序列化问题**。

## 序列化问题

实现 \`Serializable\` 的单例需重写 \`readResolve\`，否则反序列化会创建新对象破坏单例：

\`\`\`java
private Object readResolve() { return getInstance(); }
\`\`\`

枚举单例天然无此问题。

## 防御反射攻击

私有构造器可被反射 \`setAccessible(true)\` 绕过。可在构造器中检查并抛异常，或直接用枚举。

下面通过代码演示各种单例实现：`,
    code: `// 演示各种单例模式实现
import java.io.*;

public class Main {
    public static void main(String[] args) {
        // ===== 饿汉式 =====
        EagerSingleton e1 = EagerSingleton.getInstance();
        EagerSingleton e2 = EagerSingleton.getInstance();
        System.out.println("饿汉式相同? " + (e1 == e2));

        // ===== 懒汉式（线程安全）=====
        LazySingleton l1 = LazySingleton.getInstance();
        LazySingleton l2 = LazySingleton.getInstance();
        System.out.println("懒汉式相同? " + (l1 == l2));

        // ===== 双重检查锁 =====
        DCLSingleton d1 = DCLSingleton.getInstance();
        DCLSingleton d2 = DCLSingleton.getInstance();
        System.out.println("DCL 相同? " + (d1 == d2));

        // ===== 静态内部类 =====
        InnerSingleton i1 = InnerSingleton.getInstance();
        InnerSingleton i2 = InnerSingleton.getInstance();
        System.out.println("静态内部类相同? " + (i1 == i2));

        // ===== 枚举单例 =====
        EnumSingleton en1 = EnumSingleton.INSTANCE;
        EnumSingleton en2 = EnumSingleton.INSTANCE;
        System.out.println("枚举单例相同? " + (en1 == en2));
        en1.doSomething();

        // ===== 枚举单例的序列化安全性 =====
        EnumSingleton original = EnumSingleton.INSTANCE;
        EnumSingleton restored = serializeAndRestore(original);
        System.out.println("枚举序列化后相同? " + (original == restored));
    }

    // 模拟序列化与反序列化
    @SuppressWarnings("unchecked")
    static <T extends Serializable> T serializeAndRestore(T obj) {
        try {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            ObjectOutputStream oos = new ObjectOutputStream(bos);
            oos.writeObject(obj);
            oos.close();
            ByteArrayInputStream bis = new ByteArrayInputStream(bos.toByteArray());
            ObjectInputStream ois = new ObjectInputStream(bis);
            return (T) ois.readObject();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

// 饿汉式：类加载即创建
class EagerSingleton {
    private static final EagerSingleton INSTANCE = new EagerSingleton();
    private EagerSingleton() {}
    public static EagerSingleton getInstance() { return INSTANCE; }
}

// 懒汉式：同步方法保证线程安全
class LazySingleton {
    private static LazySingleton instance;
    private LazySingleton() {}
    public static synchronized LazySingleton getInstance() {
        if (instance == null) instance = new LazySingleton();
        return instance;
    }
}

// 双重检查锁 + volatile
class DCLSingleton {
    private static volatile DCLSingleton instance;
    private DCLSingleton() {}
    public static DCLSingleton getInstance() {
        if (instance == null) {
            synchronized (DCLSingleton.class) {
                if (instance == null) instance = new DCLSingleton();
            }
        }
        return instance;
    }
}

// 静态内部类：延迟加载 + 线程安全
class InnerSingleton {
    private InnerSingleton() {}
    private static class Holder {
        static final InnerSingleton INSTANCE = new InnerSingleton();
    }
    public static InnerSingleton getInstance() { return Holder.INSTANCE; }
}

// 枚举单例：最佳实践，天然防御反射与序列化
enum EnumSingleton implements Serializable {
    INSTANCE;
    public void doSomething() {
        System.out.println("枚举单例执行操作");
    }
}`
  },
  {
    id: "java-factory-pattern",
    group: "设计模式",
    icon: "🏭",
    title: "工厂模式",
    content: `# 工厂模式

工厂模式将**对象的创建与使用分离**，由工厂负责创建对象，调用方无需关心创建细节。它分为三种：简单工厂、工厂方法、抽象工厂。

## 简单工厂

又称静态工厂方法。一个工厂类根据参数返回不同实例：

\`\`\`java
class ShapeFactory {
    static Shape create(String type) {
        if ("circle".equals(type)) return new Circle();
        if ("square".equals(type)) return new Square();
        throw new IllegalArgumentException("未知类型");
    }
}
\`\`\`

优点：简单。缺点：新增产品需修改工厂，违反**开闭原则**。

## 工厂方法

定义创建对象的接口，由子类决定实例化哪个类。每个产品对应一个工厂：

\`\`\`java
interface ShapeFactory { Shape create(); }
class CircleFactory implements ShapeFactory { public Shape create() { return new Circle(); } }
class SquareFactory implements ShapeFactory { public Shape create() { return new Square(); } }
\`\`\`

符合开闭原则——新增产品只需新增工厂类，无需修改现有代码。但类数量增加。

## 抽象工厂

创建**一系列相关**产品。接口定义多个创建方法，每个具体工厂生产一套产品族：

\`\`\`java
interface GUIFactory {
    Button createButton();
    TextField createTextField();
}
class WindowsFactory implements GUIFactory { ... }
class MacFactory implements GUIFactory { ... }
}
\`\`\`

适用于产品族场景，如跨平台 UI（Windows/Mac 风格的按钮、文本框配套）。

## 三者区别

| 模式 | 工厂数量 | 产品结构 | 开闭原则 |
|------|---------|---------|---------|
| 简单工厂 | 1 个 | 单一产品 | 违反 |
| 工厂方法 | 多个 | 单一产品 | 遵守 |
| 抽象工厂 | 多个 | 产品族 | 横向扩展遵守，纵向新增违反 |

## 适用场景

- 创建过程复杂（依赖配置、需初始化）
- 调用方不应知道具体类名
- 需要灵活切换产品族
- 框架扩展点（如 SPI、Spring BeanFactory）

## 与 new 的区别

直接 \`new\` 耦合具体类；工厂解耦，调用方依赖抽象。当创建逻辑简单时不必过度使用工厂。

下面通过代码演示三种工厂模式：`,
    code: `// 演示三种工厂模式
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 简单工厂 =====
        Shape s1 = SimpleFactory.create("circle");
        Shape s2 = SimpleFactory.create("square");
        s1.draw();
        s2.draw();

        // ===== 工厂方法 =====
        ShapeFactory f1 = new CircleFactory();
        ShapeFactory f2 = new SquareFactory();
        f1.create().draw();
        f2.create().draw();

        // ===== 抽象工厂：跨平台 UI =====
        GUIFactory win = new WindowsFactory();
        GUIFactory mac = new MacFactory();

        Application winApp = new Application(win);
        winApp.render();

        Application macApp = new Application(mac);
        macApp.render();
    }
}

// ===== 产品接口 =====
interface Shape { void draw(); }
class Circle implements Shape {
    public void draw() { System.out.println("画圆形"); }
}
class Square implements Shape {
    public void draw() { System.out.println("画方形"); }
}

// ===== 简单工厂 =====
class SimpleFactory {
    static Shape create(String type) {
        switch (type) {
            case "circle": return new Circle();
            case "square": return new Square();
            default: throw new IllegalArgumentException("未知类型: " + type);
        }
    }
}

// ===== 工厂方法 =====
interface ShapeFactory { Shape create(); }
class CircleFactory implements ShapeFactory {
    public Shape create() { return new Circle(); }
}
class SquareFactory implements ShapeFactory {
    public Shape create() { return new Square(); }
}

// ===== 抽象工厂：产品族 =====
interface Button { void click(); }
interface TextField { void input(); }

class WindowsButton implements Button {
    public void click() { System.out.println("Windows 风格按钮被点击"); }
}
class WindowsTextField implements TextField {
    public void input() { System.out.println("Windows 风格文本框输入"); }
}
class MacButton implements Button {
    public void click() { System.out.println("Mac 风格按钮被点击"); }
}
class MacTextField implements TextField {
    public void input() { System.out.println("Mac 风格文本框输入"); }
}

// 抽象工厂接口
interface GUIFactory {
    Button createButton();
    TextField createTextField();
}

class WindowsFactory implements GUIFactory {
    public Button createButton() { return new WindowsButton(); }
    public TextField createTextField() { return new WindowsTextField(); }
}

class MacFactory implements GUIFactory {
    public Button createButton() { return new MacButton(); }
    public TextField createTextField() { return new MacTextField(); }
}

// 客户端：依赖抽象工厂，不关心具体平台
class Application {
    private Button button;
    private TextField textField;
    Application(GUIFactory factory) {
        this.button = factory.createButton();
        this.textField = factory.createTextField();
    }
    void render() {
        button.click();
        textField.input();
    }
}`
  },
  {
    id: "java-builder-pattern",
    group: "设计模式",
    icon: "🏗️",
    title: "建造者模式",
    content: `# 建造者模式

建造者模式将复杂对象的**构建与表示分离**，使同样的构建过程可以创建不同表示。常用于构建参数多、可选参数多的对象。

## 问题：构造器膨胀

当一个类有很多可选参数时，构造器组合爆炸：

\`\`\`java
new User("张三", 25, "北京", null, null, "13800000000", null);
\`\`\`

难以记忆参数顺序，可读性差。常见替代是 JavaBean 风格 setter，但允许对象在构建过程中处于不完整状态。

## Builder 模式

通过链式调用逐步设置参数，最后 \`build()\` 生成不可变对象：

\`\`\`java
User u = new User.Builder("张三", 25)
    .city("北京")
    .phone("13800000000")
    .build();
\`\`\`

优点：
- 参数可读性强（命名方法）
- 构建过程与表示分离
- 生成的对象不可变、线程安全
- 可校验参数一致性

## 不可变对象

Builder 模式常配合不可变对象——所有字段 \`final\`，构造后不可修改。不可变对象天然线程安全，无需同步。

## 经典实现

\`\`\`java
public class User {
    private final String name;
    private final int age;
    private User(Builder b) { this.name = b.name; this.age = b.age; }
    public static class Builder {
        private String name; private int age;
        public Builder(String name, int age) { this.name = name; this.age = age; }
        public Builder city(String c) { return this; }
        public User build() { return new User(this); }
    }
}
\`\`\`

## vs 构造方法

| 方式 | 可读性 | 不可变性 | 参数校验 |
|------|-------|---------|---------|
| 多参构造 | 差 | 是 | 构造时 |
| JavaBean setter | 好 | 否 | 分散 |
| Builder | 好 | 是 | build 时 |

## Lombok @Builder

Lombok 自动生成 Builder：

\`\`\`java
@Builder
public class User { private String name; private int age; }
\`\`\`

一行注解即可使用 \`User.builder().name("张三").age(25).build()\`，大幅减少样板代码。

## 适用场景

- 参数多（≥4 个）且多为可选
- 需要不可变对象
- 构建步骤复杂需分步
- 需要校验参数组合

## 与工厂模式区别

工厂关注**创建哪种**对象；Builder 关注**如何一步步构建**一个复杂对象。

下面通过代码演示建造者模式：`,
    code: `// 演示建造者模式
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 经典 Builder 模式 =====
        User u1 = new User.Builder("张三", 25)
            .city("北京")
            .phone("13800000000")
            .email("zhangsan@x.com")
            .build();
        System.out.println("用户1: " + u1);

        // 仅必填参数
        User u2 = new User.Builder("李四", 30).build();
        System.out.println("用户2: " + u2);

        // ===== 不可变对象：修改返回新实例 =====
        User u3 = u1.withCity("上海");
        System.out.println("原城市: " + u1.getCity() + ", 新对象城市: " + u3.getCity());

        // ===== 简化 Builder（内部类）=====
        Pizza p = new Pizza.Builder()
            .size(12)
            .cheese(true)
            .pepperoni(true)
            .build();
        System.out.println("披萨: " + p);

        // ===== 校验示例 =====
        try {
            new User.Builder("", -1).build();
        } catch (IllegalArgumentException e) {
            System.out.println("校验失败: " + e.getMessage());
        }
    }
}

// 经典 Builder 模式：构建不可变对象
class User {
    // 必填
    private final String name;
    private final int age;
    // 可选
    private final String city;
    private final String phone;
    private final String email;

    private User(Builder b) {
        // 构建时校验
        if (b.name == null || b.name.isEmpty()) throw new IllegalArgumentException("姓名不能为空");
        if (b.age < 0 || b.age > 150) throw new IllegalArgumentException("年龄非法");
        this.name = b.name;
        this.age = b.age;
        this.city = b.city;
        this.phone = b.phone;
        this.email = b.email;
    }

    String getName() { return name; }
    int getAge() { return age; }
    String getCity() { return city; }
    String getPhone() { return phone; }
    String getEmail() { return email; }

    // 修改返回新实例（不可变对象常用方式）
    User withCity(String newCity) {
        return new Builder(this).city(newCity).build();
    }

    public String toString() {
        return String.format("User{name=%s, age=%d, city=%s, phone=%s, email=%s}",
            name, age, city, phone, email);
    }

    // Builder 内部类
    static class Builder {
        private String name;
        private int age;
        private String city;
        private String phone;
        private String email;

        public Builder(String name, int age) {
            this.name = name;
            this.age = age;
        }

        // 从已有对象构建（用于 withXxx）
        Builder(User u) {
            this.name = u.name;
            this.age = u.age;
            this.city = u.city;
            this.phone = u.phone;
            this.email = u.email;
        }

        Builder city(String c) { this.city = c; return this; }
        Builder phone(String p) { this.phone = p; return this; }
        Builder email(String e) { this.email = e; return this; }

        User build() { return new User(this); }
    }
}

// 简化 Builder：全部可选，链式调用
class Pizza {
    private final int size;
    private final boolean cheese;
    private final boolean pepperoni;
    private final boolean mushroom;

    private Pizza(Builder b) {
        this.size = b.size;
        this.cheese = b.cheese;
        this.pepperoni = b.pepperoni;
        this.mushroom = b.mushroom;
    }

    public String toString() {
        return String.format("Pizza{size=%d, cheese=%s, pepperoni=%s, mushroom=%s}",
            size, cheese, pepperoni, mushroom);
    }

    static class Builder {
        private int size = 8;            // 默认值
        private boolean cheese = false;
        private boolean pepperoni = false;
        private boolean mushroom = false;

        Builder size(int s) { this.size = s; return this; }
        Builder cheese(boolean c) { this.cheese = c; return this; }
        Builder pepperoni(boolean p) { this.pepperoni = p; return this; }
        Builder mushroom(boolean m) { this.mushroom = m; return this; }

        Pizza build() { return new Pizza(this); }
    }
}`
  },
  {
    id: "java-prototype-pattern",
    group: "设计模式",
    icon: "📋",
    title: "原型模式",
    content: `# 原型模式

原型模式通过**复制已有实例**来创建新对象，而非通过 \`new\`。适用于创建成本高的对象（如数据库查询、网络请求结果）。

## Cloneable 接口

Java 提供 \`Cloneable\` 标记接口与 \`Object.clone()\` 方法：

\`\`\`java
class Person implements Cloneable {
    String name;
    protected Person clone() throws CloneNotSupportedException {
        return (Person) super.clone();
    }
}
\`\`\`

\`clone()\` 是浅拷贝——基本类型复制值，引用类型复制引用。

## 浅拷贝 vs 深拷贝

- **浅拷贝**：复制对象本身，引用字段仍指向同一对象。修改引用字段会影响原对象。
- **深拷贝**：递归复制所有引用对象，完全独立。

\`\`\`java
// 浅拷贝：address 字段共享
Person p2 = p1.clone(); // p1.address == p2.address

// 深拷贝：address 也复制
Person p3 = p1.deepClone(); // p1.address != p3.address
\`\`\`

## clone 的陷阱

- \`clone()\` 不调用构造器，可能破坏不变性
- \`final\` 字段无法在 \`clone\` 中重新赋值
- 浅拷贝导致引用共享，引发隐蔽 bug
- Joshua Bloch 建议**避免使用 clone**，改用拷贝构造器或工厂

## 拷贝构造器

更推荐的复制方式：

\`\`\`java
class Person {
    Person(Person other) { this.name = other.name; this.address = new Address(other.address); }
}
\`\`\`

清晰、类型安全、可处理 final 字段。

## 序列化实现深拷贝

将对象序列化为字节再反序列化，得到完全独立的深拷贝：

\`\`\`java
ByteArrayOutputStream bos = new ByteArrayOutputStream();
new ObjectOutputStream(bos).writeObject(original);
Object copy = new ObjectInputStream(new ByteArrayInputStream(bos.toByteArray())).readObject();
\`\`\`

简单通用，但性能较差，要求所有字段实现 \`Serializable\`。

## 适用场景

- 创建成本高（需查库、计算）
- 需要保留对象状态快照
- 防止修改影响原对象
- 配置模板复制

## 注意事项

- 深拷贝要递归处理所有引用字段
- 注意循环引用导致的死循环
- 序列化方式注意 \`transient\` 字段不会被复制

下面通过代码演示原型模式与拷贝方式：`,
    code: `// 演示原型模式与浅/深拷贝
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 浅拷贝演示 =====
        Address addr1 = new Address("北京", "长安街");
        Person p1 = new Person("张三", addr1);
        Person p2 = p1.clone();

        System.out.println("=== 浅拷贝 ===");
        System.out.println("p1 == p2? " + (p1 == p2));            // false 不同对象
        System.out.println("p1.address == p2.address? " + (p1.address == p2.address)); // true 共享引用

        // 修改 p2 的地址，影响 p1
        p2.address.city = "上海";
        System.out.println("修改 p2 地址后 p1.city = " + p1.address.city); // 上海！被污染

        // ===== 深拷贝（手动）=====
        Address addr2 = new Address("广州", "天河路");
        Person p3 = new Person("李四", addr2);
        Person p4 = p3.deepClone();

        System.out.println("\\n=== 深拷贝（手动）===");
        System.out.println("p3.address == p4.address? " + (p3.address == p4.address)); // false 独立

        p4.address.city = "深圳";
        System.out.println("修改 p4 后 p3.city = " + p3.address.city); // 广州 不受影响

        // ===== 拷贝构造器 =====
        Person p5 = new Person(p3);
        System.out.println("\\n=== 拷贝构造器 ===");
        System.out.println("p5 = " + p5);
        p5.address.city = "杭州";
        System.out.println("修改 p5 后 p3.city = " + p3.address.city); // 广州 独立

        // ===== 序列化实现深拷贝 =====
        Address addr3 = new Address("成都", "春熙路");
        Person p6 = new Person("王五", addr3);
        Person p7 = serializeCopy(p6);

        System.out.println("\\n=== 序列化深拷贝 ===");
        System.out.println("p6 == p7? " + (p6 == p7));             // false
        System.out.println("p6.address == p7.address? " + (p6.address == p7.address)); // false
        System.out.println("p7 = " + p7);
    }

    // 序列化实现深拷贝
    @SuppressWarnings("unchecked")
    static <T extends Serializable> T serializeCopy(T obj) throws Exception {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try (ObjectOutputStream oos = new ObjectOutputStream(bos)) {
            oos.writeObject(obj);
        }
        try (ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(bos.toByteArray()))) {
            return (T) ois.readObject();
        }
    }
}

class Person implements Cloneable, Serializable {
    String name;
    Address address;

    Person(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    // 拷贝构造器（深拷贝）
    Person(Person other) {
        this.name = other.name;
        this.address = new Address(other.address);  // 复制引用对象
    }

    // 浅拷贝
    @Override
    protected Person clone() throws CloneNotSupportedException {
        return (Person) super.clone();
    }

    // 深拷贝（手动）
    Person deepClone() throws CloneNotSupportedException {
        Person copy = (Person) super.clone();
        copy.address = new Address(this.address);  // 深拷贝引用
        return copy;
    }

    public String toString() {
        return "Person{name=" + name + ", address=" + address + "}";
    }
}

class Address implements Serializable {
    String city;
    String street;

    Address(String city, String street) {
        this.city = city;
        this.street = street;
    }

    // 拷贝构造器
    Address(Address other) {
        this.city = other.city;
        this.street = other.street;
    }

    public String toString() {
        return city + " " + street;
    }
}`
  },
  {
    id: "java-adapter-pattern",
    group: "设计模式",
    icon: "🔌",
    title: "适配器模式",
    content: `# 适配器模式

适配器模式将一个类的接口**转换为客户期望的另一个接口**，使原本不兼容的类能协同工作。它扮演"转换插头"的角色。

## 适用场景

- 复用已有类，但接口不匹配
- 统一多个第三方库的接口
- 旧系统升级，接口迁移
- 类的接口不匹配调用方需求

## 类适配器

通过**多重继承**（Java 中即继承被适配类 + 实现目标接口）实现。Java 不支持多继承，所以被适配类通常是需要适配的现有类：

\`\`\`java
class Adapter extends Adaptee implements Target {
    public void request() { specificRequest(); }
}
\`\`\`

缺点：Java 单继承限制了灵活性，且要求被适配类可继承。

## 对象适配器

通过**组合**持有被适配对象，实现目标接口。更灵活，推荐使用：

\`\`\`java
class Adapter implements Target {
    private Adaptee adaptee;
    public void request() { adaptee.specificRequest(); }
}
\`\`\`

可适配被适配类的子类，符合组合优于继承原则。

## 接口适配器

当接口有多个方法，但只需实现部分时，用一个**抽象空实现类**作为中间层，子类按需重写：

\`\`\`java
abstract class EmptyListener implements MouseListener {
    public void mouseClicked(MouseEvent e) {}
    public void mousePressed(MouseEvent e) {}
    // ... 其他空实现
}
\`\`\`

Java 中 \`MouseAdapter\`、\`WindowAdapter\` 即此模式，避免实现所有方法。

## 实际应用

- \`java.util.Arrays.asList()\`：数组适配为 List
- \`java.io.InputStreamReader\`：字节流适配为字符流
- \`java.util.Collections.enumeration()\`：Collection 适配为 Enumeration
- Spring MVC \`HandlerAdapter\`：适配不同类型 Controller

## 与装饰器、代理的区别

- **适配器**：转换接口，改变接口
- **装饰器**：增强功能，不改变接口
- **代理**：控制访问，不改变接口

## 优点

- 单一职责：接口转换逻辑独立
- 开闭原则：不修改原有类
- 复用性：让不兼容类协作

下面通过代码演示三种适配器：`,
    code: `// 演示适配器模式（三种形式）
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 对象适配器：日志系统对接 =====
        // 旧日志库只能输出到文件，新系统要求 LogTarget 接口
        LoggerClient client = new LoggerClient();
        LogTarget adapter = new LoggerAdapter(client);
        adapter.log("系统启动");   // 通过适配器调用旧库
        adapter.log("处理请求");

        // ===== 类适配器：电压转换 =====
        // 手机需要 5V（Target），市电 220V（Adaptee）
        USB5V usb = new PowerAdapter();
        usb.supply5V();

        // ===== 接口适配器：只实现需要的方法 =====
        // 只关心点击事件，无需实现全部 MouseListener 方法
        SimpleMouseListener listener = new SimpleMouseListener() {
            @Override
            public void mouseClicked(String e) {
                System.out.println("处理点击: " + e);
            }
        };
        listener.mouseClicked("双击");
        // 其他方法为空实现，无需关心

        // ===== JDK 中的适配器 =====
        // Arrays.asList：数组适配为 List
        String[] arr = {"a", "b", "c"};
        List<String> list = Arrays.asList(arr);
        System.out.println("数组适配为 List: " + list);

        // Enumeration 适配（老接口）
        Vector<String> v = new Vector<>(Arrays.asList("x", "y"));
        Enumeration<String> en = v.elements();
        System.out.print("Enumeration: ");
        while (en.hasMoreElements()) System.out.print(en.nextElement() + " ");
        System.out.println();
    }
}

// ===== 对象适配器示例 =====
// 目标接口（新系统期望）
interface LogTarget { void log(String msg); }

// 被适配者（旧日志库，接口不匹配）
class LoggerClient {
    void writeToFile(String level, String msg) {
        System.out.println("[文件日志] " + level + ": " + msg);
    }
}

// 适配器：组合持有被适配者
class LoggerAdapter implements LogTarget {
    private LoggerClient client;
    LoggerAdapter(LoggerClient client) { this.client = client; }
    public void log(String msg) {
        client.writeToFile("INFO", msg);  // 转换调用
    }
}

// ===== 类适配器示例 =====
// 目标接口
interface USB5V { void supply5V(); }

// 被适配者：220V 市电
class Power220V {
    void supply220V() { System.out.println("提供 220V 交流电"); }
}

// 类适配器：继承被适配者 + 实现目标接口
class PowerAdapter extends Power220V implements USB5V {
    public void supply5V() {
        supply220V();
        System.out.println("降压转换为 5V 直流电");
    }
}

// ===== 接口适配器示例 =====
// 完整接口有多个方法
interface MouseListener {
    void mouseClicked(String e);
    void mousePressed(String e);
    void mouseReleased(String e);
    void mouseEntered(String e);
    void mouseExited(String e);
}

// 抽象空实现类（接口适配器）
abstract class SimpleMouseListener implements MouseListener {
    public void mouseClicked(String e) {}
    public void mousePressed(String e) {}
    public void mouseReleased(String e) {}
    public void mouseEntered(String e) {}
    public void mouseExited(String e) {}
}`
  },
  {
    id: "java-decorator-pattern",
    group: "设计模式",
    icon: "🎨",
    title: "装饰器模式",
    content: `# 装饰器模式

装饰器模式**动态地给对象添加职责**，相比继承更灵活。它通过包装原对象，在调用前后增加新行为。

## 核心结构

- **Component**：组件接口，定义共同行为
- **ConcreteComponent**：具体组件，被装饰的原始对象
- **Decorator**：装饰器基类，持有 Component 引用，实现同接口
- **ConcreteDecorator**：具体装饰器，添加新行为

\`\`\`java
interface Coffee { double cost(); }
class SimpleCoffee implements Coffee { public double cost() { return 10; } }
abstract class CoffeeDecorator implements Coffee { protected Coffee coffee; }
class MilkDecorator extends CoffeeDecorator {
    public double cost() { return coffee.cost() + 2; }
}
\`\`\`

## 装饰器链

装饰器可层层包装，形成链：

\`\`\`java
Coffee c = new MilkDecorator(new SugarDecorator(new SimpleCoffee()));
\`\`\`

每层装饰器在调用 \`coffee.cost()\` 前后增加自己的逻辑。

## vs 继承

| 方面 | 继承 | 装饰器 |
|------|------|--------|
| 扩展时机 | 编译时 | 运行时 |
| 灵活性 | 类爆炸 | 可组合 |
| 修改原对象 | 否 | 否 |
| 多重组合 | 难 | 易 |

继承是静态的，每多一个特性就多一个子类；装饰器可在运行时任意组合。

## Java I/O 中的装饰器

\`java.io\` 包是装饰器的经典应用：

\`\`\`java
InputStream in = new BufferedInputStream(new FileInputStream("a.txt"));
Reader r = new InputStreamReader(new FileInputStream("a.txt"), "UTF-8");
BufferedReader br = new BufferedReader(new FileReader("a.txt"));
\`\`\`

- \`FileInputStream\`：具体组件，读字节
- \`BufferedInputStream\`：装饰器，增加缓冲
- \`DataInputStream\`：装饰器，增加读基本类型功能

## 适用场景

- 动态添加/撤销功能
- 不希望用继承扩展（类爆炸）
- 功能可任意组合（如配料、权限、日志）
- 增强而非改变接口

## 注意事项

- 装饰器与被装饰者**实现同一接口**
- 装饰器需**委托**被装饰者的方法
- 多层装饰会创建多个对象，调试时注意调用栈
- 装饰器不应改变接口，否则变成适配器

下面通过代码演示装饰器模式与 Java I/O 应用：`,
    code: `// 演示装饰器模式
import java.io.*;

public class Main {
    public static void main(String[] args) {
        // ===== 咖啡装饰器 =====
        Coffee c1 = new SimpleCoffee();
        System.out.println(c1.getDescription() + " = ¥" + c1.cost());

        // 加牛奶
        Coffee c2 = new MilkDecorator(new SimpleCoffee());
        System.out.println(c2.getDescription() + " = ¥" + c2.cost());

        // 加糖
        Coffee c3 = new SugarDecorator(new SimpleCoffee());
        System.out.println(c3.getDescription() + " = ¥" + c3.cost());

        // 多重装饰：牛奶 + 糖 + 摩卡
        Coffee c4 = new MochaDecorator(
                        new MilkDecorator(
                            new SugarDecorator(new SimpleCoffee())));
        System.out.println(c4.getDescription() + " = ¥" + c4.cost());

        // ===== 文本装饰器：动态添加功能 =====
        TextProcessor tp = new UpperCaseDecorator(
                               new TrimDecorator(new PlainText()));
        String result = tp.process("  hello world  ");
        System.out.println("文本处理结果: [" + result + "]");

        // ===== Java I/O 中的装饰器 =====
        // 字节流套缓冲
        String data = "Hello, 装饰器模式!";
        try {
            // 写入
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            BufferedOutputStream bos = new BufferedOutputStream(baos);
            bos.write(data.getBytes("UTF-8"));
            bos.close();

            // 读取：FileInputStream -> BufferedInputStream -> DataInputStream
            ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
            BufferedInputStream bis = new BufferedInputStream(bais);
            DataInputStream dis = new DataInputStream(bis);

            byte[] buf = new byte[data.getBytes("UTF-8").length];
            dis.readFully(buf);
            System.out.println("I/O 装饰器读取: " + new String(buf, "UTF-8"));
            dis.close();
        } catch (IOException e) {
            System.out.println("IO异常: " + e.getMessage());
        }
    }
}

// ===== 组件接口 =====
interface Coffee {
    double cost();
    String getDescription();
}

// 具体组件
class SimpleCoffee implements Coffee {
    public double cost() { return 10; }
    public String getDescription() { return "咖啡"; }
}

// 装饰器基类
abstract class CoffeeDecorator implements Coffee {
    protected Coffee coffee;
    CoffeeDecorator(Coffee coffee) { this.coffee = coffee; }
}

// 具体装饰器：牛奶
class MilkDecorator extends CoffeeDecorator {
    MilkDecorator(Coffee c) { super(c); }
    public double cost() { return coffee.cost() + 2; }
    public String getDescription() { return coffee.getDescription() + " + 牛奶"; }
}

// 具体装饰器：糖
class SugarDecorator extends CoffeeDecorator {
    SugarDecorator(Coffee c) { super(c); }
    public double cost() { return coffee.cost() + 1; }
    public String getDescription() { return coffee.getDescription() + " + 糖"; }
}

// 具体装饰器：摩卡
class MochaDecorator extends CoffeeDecorator {
    MochaDecorator(Coffee c) { super(c); }
    public double cost() { return coffee.cost() + 3; }
    public String getDescription() { return coffee.getDescription() + " + 摩卡"; }
}

// ===== 文本处理装饰器 =====
interface TextProcessor { String process(String text); }

class PlainText implements TextProcessor {
    public String process(String text) { return text; }
}

abstract class TextDecorator implements TextProcessor {
    protected TextProcessor wrapped;
    TextDecorator(TextProcessor w) { this.wrapped = w; }
}

class TrimDecorator extends TextDecorator {
    TrimDecorator(TextProcessor w) { super(w); }
    public String process(String text) {
        return wrapped.process(text).trim();  // 先委托再增强
    }
}

class UpperCaseDecorator extends TextDecorator {
    UpperCaseDecorator(TextProcessor w) { super(w); }
    public String process(String text) {
        return wrapped.process(text).toUpperCase();
    }
}`
  },
  {
    id: "java-proxy-pattern",
    group: "设计模式",
    icon: "🕵️",
    title: "代理模式",
    content: `# 代理模式

代理模式为其他对象提供**代理以控制访问**。代理对象与被代理对象实现同一接口，客户端通过代理间接访问真实对象。

## 代理类型

- **远程代理**：为远程对象提供本地代表（如 RMI、RPC stub）
- **虚拟代理**：延迟创建开销大的对象（如图片懒加载）
- **保护代理**：控制访问权限（如权限校验）
- **智能引用代理**：在访问时附加操作（如引用计数、缓存、日志）

## 静态代理

手动编写代理类，编译期确定：

\`\`\`java
class ServiceProxy implements Service {
    private Service real;
    public void doWork() {
        logBefore();
        real.doWork();    // 委托
        logAfter();
    }
}
\`\`\`

缺点：每个接口都要写代理类，重复代码多。

## 动态代理

运行时生成代理类，无需手写。Java 提供两种：

### JDK 动态代理

基于接口，使用 \`Proxy.newProxyInstance\` 和 \`InvocationHandler\`：

\`\`\`java
Service proxy = (Service) Proxy.newProxyInstance(
    loader, new Class[]{Service.class},
    (p, method, args) -> {
        // 增强逻辑
        return method.invoke(real, args);
    });
\`\`\`

要求被代理类实现接口。

### CGLIB 动态代理

基于继承，通过生成子类实现代理，无需接口。Spring AOP 默认优先用 JDK 代理，无接口时回退 CGLIB。

## AOP 应用

Spring AOP 基于动态代理实现横切关注点：

- 事务管理：\`@Transactional\`
- 日志记录
- 性能监控
- 权限校验
- 缓存

代理在方法调用前后织入增强逻辑，业务代码保持纯粹。

## vs 装饰器

- **代理**：控制访问，强调"代替"，客户端通常不知有代理
- **装饰器**：增强功能，强调"添加"，客户端主动组合

## 适用场景

- 需要在访问对象前后增强
- 远程对象本地化
- 延迟初始化开销大对象
- 权限控制
- 框架级横切关注点（AOP）

下面通过代码演示静态代理与 JDK 动态代理：`,
    code: `// 演示代理模式
import java.lang.reflect.*;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 静态代理：日志增强 =====
        UserService real = new UserServiceImpl();
        UserService staticProxy = new UserServiceProxy(real);
        System.out.println("=== 静态代理 ===");
        staticProxy.save("张三");
        staticProxy.find(1);

        // ===== JDK 动态代理：通用日志代理 =====
        System.out.println("\\n=== JDK 动态代理 ===");
        UserService dynamicProxy = (UserService) Proxy.newProxyInstance(
            Main.class.getClassLoader(),
            new Class[]{UserService.class},
            new LoggingHandler(real));
        dynamicProxy.save("李四");
        dynamicProxy.find(2);

        // ===== 动态代理：性能监控 =====
        System.out.println("\\n=== 性能监控代理 ===");
        UserService perfProxy = (UserService) Proxy.newProxyInstance(
            Main.class.getClassLoader(),
            new Class[]{UserService.class},
            new PerformanceHandler(real));
        perfProxy.find(99);

        // ===== 虚拟代理：懒加载 =====
        System.out.println("\\n=== 虚拟代理 ===");
        Image img = new ImageProxy("big.jpg");
        System.out.println("代理创建完成（图片未加载）");
        img.display();  // 首次显示才真正加载
        img.display();  // 第二次直接显示

        // ===== 保护代理：权限校验 =====
        System.out.println("\\n=== 保护代理 ===");
        UserService adminProxy = (UserService) Proxy.newProxyInstance(
            Main.class.getClassLoader(),
            new Class[]{UserService.class},
            new AuthHandler(real, "admin"));
        adminProxy.save("王五");

        UserService guestProxy = (UserService) Proxy.newProxyInstance(
            Main.class.getClassLoader(),
            new Class[]{UserService.class},
            new AuthHandler(real, "guest"));
        try {
            guestProxy.save("赵六");
        } catch (RuntimeException e) {
            System.out.println("拦截: " + e.getMessage());
        }
    }
}

// 接口与实现
interface UserService {
    void save(String name);
    String find(int id);
}

class UserServiceImpl implements UserService {
    public void save(String name) {
        System.out.println("  保存用户: " + name);
    }
    public String find(int id) {
        System.out.println("  查询用户 id=" + id);
        return "User" + id;
    }
}

// ===== 静态代理 =====
class UserServiceProxy implements UserService {
    private UserService target;
    UserServiceProxy(UserService target) { this.target = target; }
    public void save(String name) {
        System.out.println("[静态代理] 调用前");
        target.save(name);
        System.out.println("[静态代理] 调用后");
    }
    public String find(int id) {
        System.out.println("[静态代理] 调用前");
        String r = target.find(id);
        System.out.println("[静态代理] 调用后");
        return r;
    }
}

// ===== JDK 动态代理：日志 =====
class LoggingHandler implements InvocationHandler {
    private Object target;
    LoggingHandler(Object target) { this.target = target; }
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("[日志] 调用 " + method.getName() + " 参数: " + Arrays.toString(args));
        Object result = method.invoke(target, args);
        System.out.println("[日志] " + method.getName() + " 返回: " + result);
        return result;
    }
}

// ===== 性能监控代理 =====
class PerformanceHandler implements InvocationHandler {
    private Object target;
    PerformanceHandler(Object target) { this.target = target; }
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        long start = System.nanoTime();
        Object result = method.invoke(target, args);
        long cost = System.nanoTime() - start;
        System.out.println("[性能] " + method.getName() + " 耗时 " + cost / 1000 + " μs");
        return result;
    }
}

// ===== 保护代理：权限校验 =====
class AuthHandler implements InvocationHandler {
    private Object target;
    private String role;
    AuthHandler(Object target, String role) { this.target = target; this.role = role; }
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        if ("save".equals(method.getName()) && !"admin".equals(role)) {
            throw new RuntimeException("权限不足: " + role + " 不能调用 " + method.getName());
        }
        System.out.println("[权限] " + role + " 允许调用 " + method.getName());
        return method.invoke(target, args);
    }
}

// ===== 虚拟代理：懒加载 =====
interface Image { void display(); }

class RealImage implements Image {
    private String filename;
    RealImage(String filename) {
        this.filename = filename;
        System.out.println("  从磁盘加载图片: " + filename);
    }
    public void display() { System.out.println("  显示图片: " + filename); }
}

class ImageProxy implements Image {
    private String filename;
    private RealImage real;  // 懒加载
    ImageProxy(String filename) { this.filename = filename; }
    public void display() {
        if (real == null) real = new RealImage(filename);  // 首次访问才创建
        real.display();
    }
}`
  },
  {
    id: "java-observer-pattern",
    group: "设计模式",
    icon: "👁️",
    title: "观察者模式",
    content: `# 观察者模式

观察者模式定义对象间**一对多依赖**：当一个对象状态变化时，所有依赖者得到通知并自动更新。又称发布-订阅（Publish-Subscribe）。

## 核心角色

- **Subject（主题/被观察者）**：持有观察者列表，状态变化时通知
- **Observer（观察者）**：定义更新接口
- **ConcreteSubject / ConcreteObserver**：具体实现

\`\`\`java
interface Observer { void update(String event); }
class Subject {
    List<Observer> observers = new ArrayList<>();
    void attach(Observer o) { observers.add(o); }
    void notify(String e) { for (Observer o : observers) o.update(e); }
}
\`\`\`

## 推模式 vs 拉模式

- **推模式**：Subject 将数据主动推给 Observer，调用 \`update(data)\`。简单直接，但可能传递冗余数据。
- **拉模式**：Subject 只通知"有变化"，Observer 调用 Subject 的 getter 自取所需。灵活，但需多次调用。

## Java 内置支持

\`java.util.Observable\`（已废弃）与 \`Observer\` 接口。Java 9 起废弃，原因：\`Observable\` 是类而非接口，且 \`notifyObservers\` 同步持有锁，易死锁。

推荐使用：

- \`java.beans.PropertyChangeListener\`：基于属性变化事件
- \`java.util.concurrent.Flow\`：响应式流（Java 9+）
- 第三方：RxJava、Reactor、Guava EventBus

## PropertyChangeListener

\`\`\`java
bean.addPropertyChangeListener(evt -> {
    System.out.println("属性 " + evt.getPropertyName() + " 变化");
});
\`\`\`

更现代、解耦的属性监听方式。

## vs 发布订阅

严格意义上：
- **观察者模式**：Subject 直接持有 Observer 引用，直接调用。耦合较紧。
- **发布订阅**：有中间 Broker（事件总线），发布者与订阅者互不感知。更解耦。

实际常混用。

## 适用场景

- 事件驱动系统（GUI 点击、按钮事件）
- 数据绑定（MVC 中 Model 通知 View）
- 消息广播
- 响应式编程
- 监听器机制（Spring ApplicationListener）

## 注意事项

- 避免循环依赖导致通知风暴
- 通知顺序通常不保证
- 异步通知需考虑线程安全
- 观察者持有 Subject 引用易致内存泄漏，应及时注销

下面通过代码演示观察者模式与 PropertyChangeListener：`,
    code: `// 演示观察者模式
import java.util.*;
import java.beans.*;

public class Main {
    public static void main(String[] args) {
        // ===== 自定义观察者模式：新闻订阅 =====
        System.out.println("=== 自定义观察者 ===");
        NewsSubject news = new NewsSubject();
        Observer reader1 = new NewsReader("张三");
        Observer reader2 = new NewsReader("李四");
        news.attach(reader1);
        news.attach(reader2);

        news.publish("Java 21 正式发布");
        news.publish("Spring Boot 4 支持虚拟线程");

        // 取消订阅
        news.detach(reader1);
        news.publish("仅李四会收到这条");

        // ===== 推模式 vs 拉模式 =====
        System.out.println("\\n=== 拉模式 ===");
        WeatherStation station = new WeatherStation();
        PullObserver display = new PullDisplay();
        station.attach(display);
        station.setMeasurements(28, 65);

        // ===== PropertyChangeListener =====
        System.out.println("\\n=== PropertyChangeListener ===");
        Person person = new Person();
        // 添加监听器
        person.addPropertyChangeListener("name", evt -> {
            System.out.println("姓名变化: " + evt.getOldValue() + " -> " + evt.getNewValue());
        });
        person.addPropertyChangeListener("age", evt -> {
            System.out.println("年龄变化: " + evt.getOldValue() + " -> " + evt.getNewValue());
        });
        // 触发属性变化
        person.setName("王五");
        person.setAge(30);
        person.setAge(31);

        // ===== 事件总线（简化版发布订阅）=====
        System.out.println("\\n=== 事件总线 ===");
        EventBus bus = new EventBus();
        bus.subscribe(String.class, e -> System.out.println("收到字符串: " + e));
        bus.subscribe(Integer.class, e -> System.out.println("收到整数: " + e));
        bus.publish("Hello");
        bus.publish(42);
    }
}

// ===== 自定义观察者模式 =====
interface Observer { void update(String event); }

class NewsSubject {
    private List<Observer> observers = new ArrayList<>();
    void attach(Observer o) { observers.add(o); }
    void detach(Observer o) { observers.remove(o); }
    void publish(String news) {
        System.out.println("发布新闻: " + news);
        for (Observer o : observers) o.update(news);
    }
}

class NewsReader implements Observer {
    private String name;
    NewsReader(String name) { this.name = name; }
    public void update(String event) {
        System.out.println("  " + name + " 收到: " + event);
    }
}

// ===== 拉模式示例 =====
interface PullObserver { void update(WeatherStation s); }

class WeatherStation {
    private List<PullObserver> observers = new ArrayList<>();
    private int temperature;
    private int humidity;
    void attach(PullObserver o) { observers.add(o); }
    void setMeasurements(int t, int h) {
        this.temperature = t;
        this.humidity = h;
        for (PullObserver o : observers) o.update(this);  // 仅通知，不传数据
    }
    int getTemperature() { return temperature; }
    int getHumidity() { return humidity; }
}

class PullDisplay implements PullObserver {
    public void update(WeatherStation s) {
        // 拉模式：自行获取需要的数据
        System.out.println("  显示: 温度=" + s.getTemperature() + "°C, 湿度=" + s.getHumidity() + "%");
    }
}

// ===== PropertyChangeListener =====
class Person {
    private PropertyChangeSupport pcs = new PropertyChangeSupport(this);
    private String name;
    private int age;

    void addPropertyChangeListener(String prop, PropertyChangeListener l) {
        pcs.addPropertyChangeListener(prop, l);
    }

    public void setName(String name) {
        String old = this.name;
        this.name = name;
        pcs.firePropertyChange("name", old, name);
    }
    public void setAge(int age) {
        int old = this.age;
        this.age = age;
        pcs.firePropertyChange("age", old, age);
    }
}

// ===== 简化事件总线 =====
class EventBus {
    private Map<Class<?>, List<java.util.function.Consumer<Object>>> subs = new HashMap<>();

    <T> void subscribe(Class<T> type, java.util.function.Consumer<T> handler) {
        subs.computeIfAbsent(type, k -> new ArrayList<>())
            .add(o -> handler.accept(type.cast(o)));
    }

    void publish(Object event) {
        List<java.util.function.Consumer<Object>> handlers = subs.get(event.getClass());
        if (handlers != null) {
            for (java.util.function.Consumer<Object> h : handlers) h.accept(event);
        }
    }
}`
  },
  {
    id: "java-strategy-pattern",
    group: "设计模式",
    icon: "🎯",
    title: "策略模式",
    content: `# 策略模式

策略模式定义一系列算法，**将每个算法封装**起来并使它们可互换。客户端可在运行时选择不同策略，而不影响调用方。

## 核心结构

- **Strategy**：策略接口，定义算法方法
- **ConcreteStrategy**：具体策略实现
- **Context**：上下文，持有策略引用，委托执行

\`\`\`java
interface SortStrategy { void sort(int[] arr); }
class BubbleSort implements SortStrategy { ... }
class QuickSort implements SortStrategy { ... }
class Sorter {
    private SortStrategy strategy;
    void setStrategy(SortStrategy s) { this.strategy = s; }
    void sort(int[] arr) { strategy.sort(arr); }
}
\`\`\`

## 消除 if-else

策略模式常用于消除冗长的条件分支：

\`\`\`java
// 反例
if (type.equals("A")) doA();
else if (type.equals("B")) doB();
else if (type.equals("C")) doC();

// 策略模式
Map<String, Strategy> map = Map.of("A", new StrategyA(), "B", new StrategyB());
map.get(type).execute();
\`\`\`

将分支逻辑转化为**策略表**，新增策略只需加表项，符合开闭原则。

## Lambda 简化

当策略接口是函数式接口时，无需写策略类，直接用 lambda：

\`\`\`java
sorter.setStrategy(arr -> { /* 快排实现 */ });
\`\`\`

Java 8 后许多策略模式场景被 lambda + 方法引用取代，更简洁。

## 实际应用

- \`Comparator\`：不同的排序策略
- \`ThreadPoolExecutor\` 拒绝策略：AbortPolicy、CallerRunsPolicy、DiscardPolicy
- Spring \`Resource\`：不同资源加载策略
- 支付方式选择（支付宝/微信/银行卡）
- 路由策略

## 与状态模式区别

- **策略模式**：客户端**主动选择**策略，策略间无关联
- **状态模式**：对象**自动切换**状态，状态间有转换关系

## 适用场景

- 多种算法可互换
- 需运行时切换行为
- 消除条件分支
- 算法需独立变化

## 优点

- 开闭原则：新增策略不改原有代码
- 避免多重条件判断
- 算法可复用
- 切换灵活

## 缺点

- 策略类增多
- 客户端需了解策略差异

下面通过代码演示策略模式与 lambda 简化：`,
    code: `// 演示策略模式
import java.util.*;
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        int[] data = {5, 2, 8, 1, 9, 3};

        // ===== 经典策略模式：排序 =====
        Sorter sorter = new Sorter();

        sorter.setStrategy(new BubbleSort());
        sorter.sort(Arrays.copyOf(data, data.length));

        sorter.setStrategy(new QuickSort());
        sorter.sort(Arrays.copyOf(data, data.length));

        // ===== 策略表消除 if-else：支付 =====
        System.out.println("\\n=== 支付策略 ===");
        PaymentContext ctx = new PaymentContext();
        ctx.pay("alipay", 100);
        ctx.pay("wechat", 200);
        ctx.pay("card", 300);
        ctx.pay("btc", 500);  // 不支持

        // ===== Lambda 简化策略 =====
        System.out.println("\\n=== Lambda 策略 ===");
        List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5, 6);

        // 用 lambda 表达不同过滤策略
        System.out.println("偶数: " + filter(nums, n -> n % 2 == 0));
        System.out.println("大于3: " + filter(nums, n -> n > 3));
        System.out.println("正数: " + filter(nums, n -> n > 0));

        // 用方法引用
        System.out.println("排序（自然）: " + sortStrategy(nums, Comparator.naturalOrder()));
        System.out.println("排序（逆序）: " + sortStrategy(nums, Comparator.reverseOrder()));

        // ===== 折扣策略 =====
        System.out.println("\\n=== 折扣策略 ===");
        double price = 100;
        System.out.println("原价: " + price);
        System.out.println("九折: " + applyDiscount(price, p -> p * 0.9));
        System.out.println("满100减20: " + applyDiscount(price, p -> p >= 100 ? p - 20 : p));
        System.out.println("VIP 八折: " + applyDiscount(price, p -> p * 0.8));
    }

    // 通用过滤策略
    static <T> List<T> filter(List<T> list, Predicate<T> strategy) {
        List<T> result = new ArrayList<>();
        for (T t : list) if (strategy.test(t)) result.add(t);
        return result;
    }

    // 通用排序策略
    static <T> List<T> sortStrategy(List<T> list, Comparator<T> strategy) {
        List<T> copy = new ArrayList<>(list);
        copy.sort(strategy);
        return copy;
    }

    // 折扣策略
    static double applyDiscount(double price, UnaryOperator<Double> strategy) {
        return strategy.apply(price);
    }
}

// ===== 策略接口与实现 =====
interface SortStrategy { void sort(int[] arr); }

class BubbleSort implements SortStrategy {
    public void sort(int[] arr) {
        for (int i = 0; i < arr.length; i++)
            for (int j = 0; j < arr.length - i - 1; j++)
                if (arr[j] > arr[j + 1]) {
                    int t = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = t;
                }
        System.out.println("冒泡排序: " + Arrays.toString(arr));
    }
}

class QuickSort implements SortStrategy {
    public void sort(int[] arr) {
        Arrays.sort(arr);  // 简化演示，实际为快排
        System.out.println("快速排序: " + Arrays.toString(arr));
    }
}

// 上下文
class Sorter {
    private SortStrategy strategy;
    void setStrategy(SortStrategy s) { this.strategy = s; }
    void sort(int[] arr) { strategy.sort(arr); }
}

// ===== 支付策略表 =====
interface PaymentStrategy { void pay(double amount); }

class AlipayStrategy implements PaymentStrategy {
    public void pay(double amount) { System.out.println("支付宝支付: ¥" + amount); }
}
class WechatStrategy implements PaymentStrategy {
    public void pay(double amount) { System.out.println("微信支付: ¥" + amount); }
}
class CardStrategy implements PaymentStrategy {
    public void pay(double amount) { System.out.println("银行卡支付: ¥" + amount); }
}

class PaymentContext {
    private Map<String, PaymentStrategy> strategies = new HashMap<>();

    PaymentContext() {
        strategies.put("alipay", new AlipayStrategy());
        strategies.put("wechat", new WechatStrategy());
        strategies.put("card", new CardStrategy());
    }

    void pay(String type, double amount) {
        PaymentStrategy s = strategies.get(type);
        if (s != null) s.pay(amount);
        else System.out.println("不支持的支付方式: " + type);
    }
}`
  },
  {
    id: "java-template-pattern",
    group: "设计模式",
    icon: "📋",
    title: "模板方法模式",
    content: `# 模板方法模式

模板方法模式在父类定义算法**骨架**，将某些步骤延迟到子类实现。子类可在不改变算法结构的情况下重定义特定步骤。

## 核心结构

- **AbstractClass**：抽象类，定义模板方法（算法骨架）与抽象步骤
- **ConcreteClass**：子类，实现具体步骤

\`\`\`java
abstract class Game {
    // 模板方法：定义流程，final 防止子类修改结构
    public final void play() {
        initialize();
        startPlay();
        endPlay();
    }
    protected abstract void initialize();
    protected abstract void startPlay();
    protected void endPlay() { System.out.println("结束游戏"); }  // 可选重写
}
\`\`\`

模板方法通常用 \`final\` 修饰，防止子类破坏算法结构。

## 好莱坞原则

"不要给我们打电话，我们会给你打电话"——父类主动调用子类方法，而非子类调用父类。控制反转体现在父类掌控流程，子类只填充细节。

## 钩子方法

抽象类提供默认实现的空方法，子类**可选**重写以影响流程：

\`\`\`java
abstract class Workflow {
    public final void run() {
        step1();
        if (needStep2()) step2();  // 钩子控制是否执行
        step3();
    }
    protected boolean needStep2() { return true; }  // 默认 true，子类可改
}
\`\`\`

钩子让子类在不变更模板结构的前提下影响行为。

## vs 策略模式

- **模板方法**：基于继承，子类实现具体步骤，结构固定
- **策略模式**：基于组合，整体算法可替换，结构灵活

## 适用场景

- 算法骨架固定，部分步骤可变
- 框架定义流程，子类实现细节
- 避免代码重复（公共部分提到父类）

## 实际应用

- \`AbstractList\` 提供 List 骨架，子类实现 \`get\`、\`size\`
- \`HttpServlet\`：\`service\` 方法分发到 \`doGet\`、\`doPost\`
- Spring \`JdbcTemplate\`：固定流程，回调提供 SQL
- \`AbstractApplicationContext\`：refresh 流程

## 优点

- 避免代码重复
- 算法结构稳定
- 子类扩展灵活

## 缺点

- 每个实现都要一个子类，类数量增多
- 父类修改影响所有子类

下面通过代码演示模板方法模式与钩子方法：`,
    code: `// 演示模板方法模式
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 经典模板方法：游戏流程 =====
        System.out.println("=== 足球游戏 ===");
        Game football = new FootballGame();
        football.play();

        System.out.println("\\n=== 篮球游戏 ===");
        Game basketball = new BasketballGame();
        basketball.play();

        // ===== 钩子方法：工作流 =====
        System.out.println("\\n=== 标准工作流 ===");
        Workflow standard = new StandardWorkflow();
        standard.run();

        System.out.println("\\n=== 简化工作流（钩子跳过）===");
        Workflow simple = new SimpleWorkflow();
        simple.run();

        // ===== 数据迁移模板 =====
        System.out.println("\\n=== 数据迁移 ===");
        DataMigrator csvMigrator = new CsvMigrator();
        csvMigrator.migrate();

        System.out.println();
        DataMigrator dbMigrator = new DbMigrator();
        dbMigrator.migrate();
    }
}

// ===== 模板方法：游戏流程 =====
abstract class Game {
    // 模板方法：final 防止子类修改结构
    public final void play() {
        initialize();      // 步骤1
        startPlay();       // 步骤2
        endPlay();         // 步骤3
    }

    protected abstract void initialize();
    protected abstract void startPlay();

    // 公共实现，子类可直接复用
    protected void endPlay() {
        System.out.println("结束游戏");
    }
}

class FootballGame extends Game {
    protected void initialize() { System.out.println("足球游戏：准备足球场"); }
    protected void startPlay() { System.out.println("足球游戏：开始踢球"); }
}

class BasketballGame extends Game {
    protected void initialize() { System.out.println("篮球游戏：准备篮球场"); }
    protected void startPlay() { System.out.println("篮球游戏：开始投篮"); }
    protected void endPlay() {  // 重写
        System.out.println("篮球游戏：吹哨结束");
    }
}

// ===== 钩子方法：工作流 =====
abstract class Workflow {
    public final void run() {
        step1();
        if (needStep2()) {   // 钩子控制
            step2();
        }
        step3();
    }

    protected abstract void step1();
    protected abstract void step2();
    protected abstract void step3();

    // 钩子方法：默认需要 step2
    protected boolean needStep2() { return true; }
}

class StandardWorkflow extends Workflow {
    protected void step1() { System.out.println("步骤1: 校验数据"); }
    protected void step2() { System.out.println("步骤2: 处理业务"); }
    protected void step3() { System.out.println("步骤3: 写入日志"); }
}

class SimpleWorkflow extends Workflow {
    protected void step1() { System.out.println("步骤1: 简单校验"); }
    protected void step2() { System.out.println("步骤2: 跳过"); }
    protected void step3() { System.out.println("步骤3: 完成"); }
    @Override
    protected boolean needStep2() { return false; }  // 钩子：跳过 step2
}

// ===== 数据迁移模板 =====
abstract class DataMigrator {
    // 模板方法：固定流程
    public final void migrate() {
        connect();
        List<String> data = extract();
        List<String> transformed = transform(data);
        load(transformed);
        disconnect();
    }

    protected abstract void connect();
    protected abstract List<String> extract();
    protected abstract void load(List<String> data);

    // 公共转换逻辑
    protected List<String> transform(List<String> data) {
        List<String> result = new ArrayList<>();
        for (String d : data) result.add(d.trim().toUpperCase());
        return result;
    }

    protected void disconnect() { System.out.println("断开连接"); }
}

class CsvMigrator extends DataMigrator {
    protected void connect() { System.out.println("连接 CSV 文件"); }
    protected List<String> extract() {
        System.out.println("读取 CSV 数据");
        return Arrays.asList("  alice ", " bob ", "  carol");
    }
    protected void load(List<String> data) {
        System.out.println("写入数据库: " + data);
    }
}

class DbMigrator extends DataMigrator {
    protected void connect() { System.out.println("连接源数据库"); }
    protected List<String> extract() {
        System.out.println("查询数据库");
        return Arrays.asList("  张三 ", " 李四 ");
    }
    protected List<String> transform(List<String> data) {
        // 重写转换逻辑
        List<String> result = new ArrayList<>();
        for (String d : data) result.add("[DB]" + d.trim());
        return result;
    }
    protected void load(List<String> data) {
        System.out.println("写入目标数据库: " + data);
    }
}`
  },
  {
    id: "java-chain-pattern",
    group: "设计模式",
    icon: "🔗",
    title: "责任链模式",
    content: `# 责任链模式

责任链模式将请求沿**处理者链**传递，每个处理者决定处理或将请求传给下一个。发送者无需知道哪个处理者最终处理。

## 核心结构

- **Handler**：抽象处理者，持有下一个处理者引用，定义处理方法
- **ConcreteHandler**：具体处理者，决定处理或转发

\`\`\`java
abstract class Handler {
    protected Handler next;
    Handler setNext(Handler n) { this.next = n; return n; }
    abstract void handle(Request req);
}
\`\`\`

链的组装通常在客户端完成，按需串联。

## 处理逻辑

每个处理者：
1. 判断能否处理——能则处理，可选终止链
2. 不能则传给下一个

\`\`\`java
void handle(Request req) {
    if (canHandle(req)) {
        doHandle(req);
    } else if (next != null) {
        next.handle(req);
    } else {
        // 链末尾无人处理
    }
}
\`\`\`

## 实际应用

- **Servlet Filter**：\`FilterChain\` 串联多个过滤器，请求/响应依次经过
- **Spring Interceptor**：\`HandlerInterceptor\` 链
- **Netty Pipeline**：\`ChannelHandler\` 链处理网络事件
- **日志框架**：日志级别链（DEBUG → INFO → WARN → ERROR）
- **审批流程**：金额分级审批（组长→经理→总监）
- **Spring Security FilterChain**：安全过滤链

## vs 装饰器

- **责任链**：处理者可中断链，请求最终被一个处理者处理
- **装饰器**：每层都执行，层层增强

## 优点

- 解耦发送者与接收者
- 链可动态调整（增删处理者）
- 符合开闭原则
- 职责单一

## 缺点

- 请求可能无人处理
- 调试困难（不知实际经过哪些处理者）
- 链过长影响性能

## 纯与不纯责任链

- **纯责任链**：处理者要么全处理要么全转发，只有一个处理者处理
- **不纯责任链**：处理者可部分处理后继续传递（如过滤器增强后传递）

Servlet Filter 即不纯责任链，每个 Filter 处理后调用 \`chain.doFilter\` 继续传递。

下面通过代码演示责任链模式：`,
    code: `// 演示责任链模式
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 审批流程：金额分级 =====
        System.out.println("=== 报销审批 ===");
        Approver leader = new Leader("组长");
        Approver manager = new Manager("经理");
        Approver director = new Director("总监");
        Approver ceo = new CEO("CEO");

        // 组装链
        leader.setNext(manager);
        manager.setNext(director);
        director.setNext(ceo);

        leader.approve(500);     // 组长处理
        leader.approve(5000);    // 经理处理
        leader.approve(20000);   // 总监处理
        leader.approve(100000);  // CEO 处理
        leader.approve(500000);  // 无人能处理

        // ===== 过滤器链：请求处理 =====
        System.out.println("\\n=== 过滤器链 ===");
        FilterChain chain = new FilterChain();
        chain.addFilter(new AuthFilter())
             .addFilter(new LogFilter())
             .addFilter(new EncodingFilter());

        Request req = new Request("用户=张三; 内容=你好");
        Response resp = new Response();
        chain.doFilter(req, resp);
        System.out.println("最终请求: " + req.data);
        System.out.println("最终响应: " + resp.data);

        // ===== 日志级别链 =====
        System.out.println("\\n=== 日志链 ===");
        Logger logger = new ConsoleLogger(LogLevel.DEBUG);
        Logger infoLogger = new ConsoleLogger(LogLevel.INFO);
        Logger errorLogger = new ConsoleLogger(LogLevel.ERROR);
        logger.setNext(infoLogger);
        infoLogger.setNext(errorLogger);

        logger.log(LogLevel.DEBUG, "调试信息");
        logger.log(LogLevel.INFO, "普通信息");
        logger.log(LogLevel.ERROR, "错误信息");
    }
}

// ===== 责任链：报销审批 =====
abstract class Approver {
    protected Approver next;
    protected String name;
    Approver(String name) { this.name = name; }
    Approver setNext(Approver next) { this.next = next; return next; }
    abstract void approve(double amount);
}

class Leader extends Approver {
    Leader(String name) { super(name); }
    void approve(double amount) {
        if (amount <= 1000) {
            System.out.println(name + " 批准报销: ¥" + amount);
        } else if (next != null) {
            next.approve(amount);
        }
    }
}

class Manager extends Approver {
    Manager(String name) { super(name); }
    void approve(double amount) {
        if (amount <= 10000) {
            System.out.println(name + " 批准报销: ¥" + amount);
        } else if (next != null) {
            next.approve(amount);
        }
    }
}

class Director extends Approver {
    Director(String name) { super(name); }
    void approve(double amount) {
        if (amount <= 50000) {
            System.out.println(name + " 批准报销: ¥" + amount);
        } else if (next != null) {
            next.approve(amount);
        }
    }
}

class CEO extends Approver {
    CEO(String name) { super(name); }
    void approve(double amount) {
        if (amount <= 200000) {
            System.out.println(name + " 批准报销: ¥" + amount);
        } else {
            System.out.println("无人能批准: ¥" + amount + "（超出权限）");
        }
    }
}

// ===== 过滤器链（不纯责任链）=====
class Request { String data; Request(String d) { this.data = d; } }
class Response { String data = ""; }

interface Filter {
    void doFilter(Request req, Response resp, FilterChain chain);
}

class FilterChain {
    private List<Filter> filters = new ArrayList<>();
    private int index = 0;

    FilterChain addFilter(Filter f) { filters.add(f); return this; }

    void doFilter(Request req, Response resp) {
        if (index < filters.size()) {
            Filter f = filters.get(index++);
            f.doFilter(req, resp, this);
        }
    }
}

class AuthFilter implements Filter {
    public void doFilter(Request req, Response resp, FilterChain chain) {
        System.out.println("[Auth] 鉴权前: " + req.data);
        req.data += " | 已鉴权";
        chain.doFilter(req, resp);  // 传递给下一个
        resp.data = "[Auth]" + resp.data;  // 响应回程处理
    }
}

class LogFilter implements Filter {
    public void doFilter(Request req, Response resp, FilterChain chain) {
        System.out.println("[Log] 记录请求");
        chain.doFilter(req, resp);
        System.out.println("[Log] 记录响应");
    }
}

class EncodingFilter implements Filter {
    public void doFilter(Request req, Response resp, FilterChain chain) {
        System.out.println("[Encoding] 设置 UTF-8");
        req.data += " | UTF-8";
        chain.doFilter(req, resp);
        resp.data = "响应内容";
    }
}

// ===== 日志级别链 =====
enum LogLevel { DEBUG, INFO, WARN, ERROR }

abstract class Logger {
    protected LogLevel level;
    protected Logger next;
    Logger(LogLevel level) { this.level = level; }
    Logger setNext(Logger next) { this.next = next; return next; }
    void log(LogLevel level, String msg) {
        if (this.level.ordinal() <= level.ordinal()) {
            write(level, msg);
        }
        if (next != null) next.log(level, msg);
    }
    protected abstract void write(LogLevel level, String msg);
}

class ConsoleLogger extends Logger {
    ConsoleLogger(LogLevel level) { super(level); }
    protected void write(LogLevel level, String msg) {
        System.out.println("[" + level + "] " + msg);
    }
}`
  },
  {
    id: "java-command-pattern",
    group: "设计模式",
    icon: "🎮",
    title: "命令模式",
    content: `# 命令模式

命令模式将**请求封装为对象**，包含请求的接收者和参数。这使得请求可被排队、记录、撤销、重做。

## 核心角色

- **Command**：命令接口，声明 \`execute()\`
- **ConcreteCommand**：具体命令，持有接收者引用
- **Receiver**：接收者，实际执行业务
- **Invoker**：调用者，触发命令
- **Client**：创建命令并组装

\`\`\`java
interface Command { void execute(); }
class LightOnCommand implements Command {
    private Light light;
    public void execute() { light.on(); }
}
class RemoteControl {
    private Command command;
    void setCommand(Command c) { this.command = c; }
    void press() { command.execute(); }
}
\`\`\`

## 解耦调用者与接收者

调用者只需知道 \`execute()\`，不关心具体接收者和操作。例如遥控器按钮与电器解耦——同一按钮可绑定不同电器命令。

## 撤销操作

为 Command 增加 \`undo()\` 方法，调用者记录历史命令栈：

\`\`\`java
interface Command {
    void execute();
    void undo();
}

// 撤销栈
Stack<Command> history;
void undo() { history.pop().undo(); }
\`\`\`

实现撤销需在执行前保存状态，或在 undo 中执行反向操作。

## 宏命令

组合多个命令一次性执行：

\`\`\`java
class MacroCommand implements Command {
    List<Command> commands;
    void execute() { for (Command c : commands) c.execute(); }
}
\`\`\`

可批量执行一组操作，如"一键回家模式"（开灯+开空调+拉窗帘）。

## 实际应用

- GUI 按钮、菜单项动作
- 事务管理：每个操作封装为命令，支持回滚
- 任务队列：命令序列化后异步执行
- Runnable / Callable：本质是命令模式
- 文本编辑器撤销/重做

## vs 策略模式

- **命令模式**：封装请求，关注"做什么"，可撤销排队
- **策略模式**：封装算法，关注"怎么做"，可替换

## 适用场景

- 需要撤销/重做
- 请求需排队、延迟执行
- 操作需记录日志
- 调用者与接收者解耦
- 支持宏操作

## 优点

- 解耦调用者与接收者
- 易扩展新命令
- 支持撤销、队列、日志

## 缺点

- 命令类增多

下面通过代码演示命令模式与撤销操作：`,
    code: `// 演示命令模式
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 基础命令：遥控灯 =====
        System.out.println("=== 遥控器控制灯 ===");
        Light light = new Light();
        Command lightOn = new LightOnCommand(light);
        Command lightOff = new LightOffCommand(light);

        RemoteControl remote = new RemoteControl();
        remote.setCommand(lightOn);
        remote.pressButton();   // 开灯
        remote.setCommand(lightOff);
        remote.pressButton();   // 关灯

        // ===== 撤销操作 =====
        System.out.println("\\n=== 撤销操作 ===");
        RemoteControlWithUndo undoRemote = new RemoteControlWithUndo();
        undoRemote.setCommand(new LightOnCommand(light));
        undoRemote.pressButton();
        undoRemote.setCommand(new LightOffCommand(light));
        undoRemote.pressButton();
        System.out.println("--撤销--");
        undoRemote.pressUndo();  // 撤销关灯 → 灯亮
        undoRemote.pressUndo();  // 撤销开灯 → 灯灭

        // ===== 文本编辑器：撤销/重做 =====
        System.out.println("\\n=== 文本编辑器 ===");
        TextEditor editor = new TextEditor();
        editor.execute(new InsertCommand(editor, "Hello"));
        editor.execute(new InsertCommand(editor, " World"));
        System.out.println("内容: " + editor.getText());

        editor.undo();
        System.out.println("撤销后: " + editor.getText());
        editor.redo();
        System.out.println("重做后: " + editor.getText());

        // ===== 宏命令 =====
        System.out.println("\\n=== 宏命令：回家模式 ===");
        AirConditioner ac = new AirConditioner();
        Curtain curtain = new Curtain();

        List<Command> homeCommands = Arrays.asList(
            new LightOnCommand(light),
            new ACOnCommand(ac),
            new CurtainCloseCommand(curtain)
        );
        MacroCommand homeMode = new MacroCommand(homeCommands);
        homeMode.execute();

        System.out.println("--离家模式（撤销宏）--");
        homeMode.undo();
    }
}

// ===== 接收者：电器 =====
class Light {
    private boolean on = false;
    void on() { on = true; System.out.println("灯亮了"); }
    void off() { on = false; System.out.println("灯灭了"); }
    boolean isOn() { return on; }
}

class AirConditioner {
    void on() { System.out.println("空调开启"); }
    void off() { System.out.println("空调关闭"); }
}

class Curtain {
    void close() { System.out.println("窗帘关闭"); }
    void open() { System.out.println("窗帘打开"); }
}

// ===== 命令接口 =====
interface Command {
    void execute();
    void undo();
}

// 具体命令：开灯
class LightOnCommand implements Command {
    private Light light;
    LightOnCommand(Light light) { this.light = light; }
    public void execute() { light.on(); }
    public void undo() { light.off(); }
}

class LightOffCommand implements Command {
    private Light light;
    LightOffCommand(Light light) { this.light = light; }
    public void execute() { light.off(); }
    public void undo() { light.on(); }
}

class ACOnCommand implements Command {
    private AirConditioner ac;
    ACOnCommand(AirConditioner ac) { this.ac = ac; }
    public void execute() { ac.on(); }
    public void undo() { ac.off(); }
}

class CurtainCloseCommand implements Command {
    private Curtain curtain;
    CurtainCloseCommand(Curtain curtain) { this.curtain = curtain; }
    public void execute() { curtain.close(); }
    public void undo() { curtain.open(); }
}

// 宏命令
class MacroCommand implements Command {
    private List<Command> commands;
    MacroCommand(List<Command> commands) { this.commands = commands; }
    public void execute() {
        System.out.println("[宏] 执行组合命令");
        for (Command c : commands) c.execute();
    }
    public void undo() {
        System.out.println("[宏] 撤销组合命令（逆序）");
        for (int i = commands.size() - 1; i >= 0; i--) commands.get(i).undo();
    }
}

// ===== 调用者：遥控器 =====
class RemoteControl {
    private Command command;
    void setCommand(Command c) { this.command = c; }
    void pressButton() { command.execute(); }
}

class RemoteControlWithUndo {
    private Command command;
    private Deque<Command> history = new ArrayDeque<>();
    void setCommand(Command c) { this.command = c; }
    void pressButton() {
        command.execute();
        history.push(command);
    }
    void pressUndo() {
        if (!history.isEmpty()) history.pop().undo();
    }
}

// ===== 文本编辑器撤销/重做 =====
class TextEditor {
    private StringBuilder text = new StringBuilder();
    private Deque<Command> undoStack = new ArrayDeque<>();
    private Deque<Command> redoStack = new ArrayDeque<>();

    void insert(String s) { text.append(s); }
    void delete(int length) {
        int start = text.length() - length;
        if (start >= 0) text.delete(start, text.length());
    }
    String getText() { return text.toString(); }

    void execute(Command c) {
        c.execute();
        undoStack.push(c);
        redoStack.clear();
    }
    void undo() {
        if (!undoStack.isEmpty()) {
            Command c = undoStack.pop();
            c.undo();
            redoStack.push(c);
        }
    }
    void redo() {
        if (!redoStack.isEmpty()) {
            Command c = redoStack.pop();
            c.execute();
            undoStack.push(c);
        }
    }
}

class InsertCommand implements Command {
    private TextEditor editor;
    private String text;
    InsertCommand(TextEditor editor, String text) {
        this.editor = editor;
        this.text = text;
    }
    public void execute() { editor.insert(text); }
    public void undo() { editor.delete(text.length()); }
}`
  },
  {
    id: "java-state-pattern",
    group: "设计模式",
    icon: "🔄",
    title: "状态模式",
    content: `# 状态模式

状态模式允许对象在**内部状态改变时改变其行为**。对象看起来似乎修改了它的类。将状态相关行为封装到独立状态类中。

## 核心结构

- **Context**：上下文，持有当前状态，将行为委托给状态对象
- **State**：状态接口，声明状态相关行为
- **ConcreteState**：具体状态，实现特定状态下的行为

\`\`\`java
interface State { void handle(Context ctx); }

class Context {
    private State state;
    void setState(State s) { this.state = s; }
    void request() { state.handle(this); }  // 委托给状态
}
\`\`\`

## 状态转换

状态对象在处理请求时可**改变上下文的状态**，从而切换行为：

\`\`\`java
class ConcreteStateA implements State {
    public void handle(Context ctx) {
        System.out.println("状态A处理");
        ctx.setState(new ConcreteStateB());  // 转换到B
    }
}
\`\`\`

## vs 策略模式

结构相似，但意图不同：

| 方面 | 状态模式 | 策略模式 |
|------|---------|---------|
| 意图 | 状态驱动行为变化 | 算法可互换 |
| 切换 | 状态自动转换 | 客户端主动选择 |
| 关系 | 状态间知晓彼此 | 策略互相独立 |
| 生命周期 | 状态随对象生命周期 | 策略一次一用 |

策略是"我能选择算法"，状态是"我的状态决定行为"。

## 消除条件分支

不用状态模式时，行为中充斥状态判断：

\`\`\`java
// 反例
void handle() {
    if (state == OPEN) { ... }
    else if (state == CLOSED) { ... }
    else if (state == LOCKED) { ... }
}
\`\`\`

状态模式将每个分支提取为状态类，新增状态只需新增类。

## 状态机

状态模式天然适合**有限状态机**（FSM）：

- 订单状态：待支付 → 已支付 → 已发货 → 已签收
- 文档审批：草稿 → 审核中 → 已发布
- 线程状态：新建 → 就绪 → 运行 → 阻塞 → 终止

每个状态定义允许的转换与对应行为。

## 适用场景

- 行为随状态变化
- 代码有大量状态判断分支
- 状态转换规则复杂
- 实现状态机

## 优点

- 消除条件分支
- 状态扩展容易（开闭原则）
- 状态逻辑集中管理
- 状态转换显式

## 缺点

- 状态类增多
- 状态转换分散在各状态类中，难以全局把握

下面通过代码演示状态模式：`,
    code: `// 演示状态模式
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 订单状态机 =====
        System.out.println("=== 订单状态流转 ===");
        Order order = new Order("ORD-001");
        order.pay();       // 待支付 → 已支付
        order.cancel();    // 已支付不可取消
        order.ship();      // 已支付 → 已发货
        order.deliver();   // 已发货 → 已签收
        order.refund();    // 已签收不可退款

        // 重新演示
        System.out.println("\\n=== 新订单 ===");
        Order order2 = new Order("ORD-002");
        order2.cancel();   // 待支付可取消
        order2.pay();      // 已取消不可支付

        // ===== 自动售货机 =====
        System.out.println("\\n=== 自动售货机 ===");
        VendingMachine vm = new VendingMachine();
        vm.insertCoin();   // 投币
        vm.turnCrank();    // 转动手柄出货
        vm.insertCoin();   // 再次投币
        vm.ejectCoin();    // 退币
        vm.turnCrank();    // 无币转手柄无效

        // ===== 文档审批 =====
        System.out.println("\\n=== 文档审批 ===");
        Document doc = new Document("需求文档");
        doc.publish();     // 草稿 → 审核中
        doc.publish();     // 审核中 → 已发布
        doc.edit();        // 已发布 → 草稿
        doc.archive();     // 草稿 → 归档
        doc.publish();     // 归档不可发布
    }
}

// ===== 订单状态 =====
interface OrderState {
    void pay(Order order);
    void cancel(Order order);
    void ship(Order order);
    void deliver(Order order);
    void refund(Order order);
    String getName();
}

class Order {
    private String id;
    private OrderState state;

    Order(String id) {
        this.id = id;
        this.state = new PendingState();
    }

    void setState(OrderState s) {
        this.state = s;
        System.out.println("  状态变为: " + s.getName());
    }

    String getId() { return id; }
    String getStateName() { return state.getName(); }

    void pay() { System.out.println("支付(" + id + ", " + state.getName() + ")"); state.pay(this); }
    void cancel() { System.out.println("取消(" + id + ", " + state.getName() + ")"); state.cancel(this); }
    void ship() { System.out.println("发货(" + id + ", " + state.getName() + ")"); state.ship(this); }
    void deliver() { System.out.println("签收(" + id + ", " + state.getName() + ")"); state.deliver(this); }
    void refund() { System.out.println("退款(" + id + ", " + state.getName() + ")"); state.refund(this); }
}

class PendingState implements OrderState {
    public void pay(Order o) { o.setState(new PaidState()); }
    public void cancel(Order o) { o.setState(new CancelledState()); }
    public void ship(Order o) { System.out.println("  错误: 未支付不能发货"); }
    public void deliver(Order o) { System.out.println("  错误: 未支付不能签收"); }
    public void refund(Order o) { System.out.println("  错误: 未支付无需退款"); }
    public String getName() { return "待支付"; }
}

class PaidState implements OrderState {
    public void pay(Order o) { System.out.println("  错误: 已支付"); }
    public void cancel(Order o) { System.out.println("  错误: 已支付不可取消，请申请退款"); }
    public void ship(Order o) { o.setState(new ShippedState()); }
    public void deliver(Order o) { System.out.println("  错误: 未发货不能签收"); }
    public void refund(Order o) { o.setState(new RefundedState()); }
    public String getName() { return "已支付"; }
}

class ShippedState implements OrderState {
    public void pay(Order o) { System.out.println("  错误: 已支付"); }
    public void cancel(Order o) { System.out.println("  错误: 已发货不可取消"); }
    public void ship(Order o) { System.out.println("  错误: 已发货"); }
    public void deliver(Order o) { o.setState(new DeliveredState()); }
    public void refund(Order o) { System.out.println("  错误: 已发货，需拒收后退款"); }
    public String getName() { return "已发货"; }
}

class DeliveredState implements OrderState {
    public void pay(Order o) { System.out.println("  错误: 已完成"); }
    public void cancel(Order o) { System.out.println("  错误: 已签收不可取消"); }
    public void ship(Order o) { System.out.println("  错误: 已签收"); }
    public void deliver(Order o) { System.out.println("  错误: 已签收"); }
    public void refund(Order o) { System.out.println("  错误: 已签收，请走售后流程"); }
    public String getName() { return "已签收"; }
}

class CancelledState implements OrderState {
    public void pay(Order o) { System.out.println("  错误: 订单已取消"); }
    public void cancel(Order o) { System.out.println("  错误: 已取消"); }
    public void ship(Order o) { System.out.println("  错误: 订单已取消"); }
    public void deliver(Order o) { System.out.println("  错误: 订单已取消"); }
    public void refund(Order o) { System.out.println("  错误: 订单已取消"); }
    public String getName() { return "已取消"; }
}

class RefundedState implements OrderState {
    public void pay(Order o) { System.out.println("  错误: 已退款"); }
    public void cancel(Order o) { System.out.println("  错误: 已退款"); }
    public void ship(Order o) { System.out.println("  错误: 已退款"); }
    public void deliver(Order o) { System.out.println("  错误: 已退款"); }
    public void refund(Order o) { System.out.println("  错误: 已退款"); }
    public String getName() { return "已退款"; }
}

// ===== 自动售货机状态 =====
interface VendingState {
    void insertCoin(VendingMachine vm);
    void ejectCoin(VendingMachine vm);
    void turnCrank(VendingMachine vm);
    void dispense(VendingMachine vm);
}

class VendingMachine {
    private VendingState state;
    VendingMachine() { this.state = new NoCoinState(); }
    void setState(VendingState s) { this.state = s; }
    void insertCoin() { System.out.print("投币 -> "); state.insertCoin(this); }
    void ejectCoin() { System.out.print("退币 -> "); state.ejectCoin(this); }
    void turnCrank() { System.out.print("转手柄 -> "); state.turnCrank(this); }
    void dispense() { state.dispense(this); }
}

class NoCoinState implements VendingState {
    public void insertCoin(VendingMachine vm) { System.out.println("投币成功"); vm.setState(new HasCoinState()); }
    public void ejectCoin(VendingMachine vm) { System.out.println("无币可退"); }
    public void turnCrank(VendingMachine vm) { System.out.println("请先投币"); }
    public void dispense(VendingMachine vm) { System.out.println("请先投币"); }
}

class HasCoinState implements VendingState {
    public void insertCoin(VendingMachine vm) { System.out.println("已有币，勿重复投币"); }
    public void ejectCoin(VendingMachine vm) { System.out.println("退币成功"); vm.setState(new NoCoinState()); }
    public void turnCrank(VendingMachine vm) { System.out.println("出货中..."); vm.setState(new SoldState()); vm.dispense(); }
    public void dispense(VendingMachine vm) { System.out.println("请先转手柄"); }
}

class SoldState implements VendingState {
    public void insertCoin(VendingMachine vm) { System.out.println("请稍候"); }
    public void ejectCoin(VendingMachine vm) { System.out.println("已出货，无法退币"); }
    public void turnCrank(VendingMachine vm) { System.out.println("已转一次"); }
    public void dispense(VendingMachine vm) { System.out.println("商品掉落"); vm.setState(new NoCoinState()); }
}

// ===== 文档审批状态 =====
interface DocState { void edit(Document d); void publish(Document d); void archive(Document d); String name(); }

class Document {
    private String title;
    private DocState state;
    Document(String title) { this.title = title; this.state = new DraftState(); }
    void setState(DocState s) { this.state = s; System.out.println("  " + title + " 状态: " + s.name()); }
    void edit() { System.out.print("编辑 -> "); state.edit(this); }
    void publish() { System.out.print("发布 -> "); state.publish(this); }
    void archive() { System.out.print("归档 -> "); state.archive(this); }
}

class DraftState implements DocState {
    public void edit(Document d) { System.out.println("编辑草稿"); }
    public void publish(Document d) { d.setState(new ReviewState()); }
    public void archive(Document d) { d.setState(new ArchivedState()); }
    public String name() { return "草稿"; }
}

class ReviewState implements DocState {
    public void edit(Document d) { System.out.println("审核中不可编辑"); }
    public void publish(Document d) { d.setState(new PublishedState()); }
    public void archive(Document d) { System.out.println("审核中不可归档"); }
    public String name() { return "审核中"; }
}

class PublishedState implements DocState {
    public void edit(Document d) { System.out.println("转为草稿编辑"); d.setState(new DraftState()); }
    public void publish(Document d) { System.out.println("已发布"); }
    public void archive(Document d) { d.setState(new ArchivedState()); }
    public String name() { return "已发布"; }
}

class ArchivedState implements DocState {
    public void edit(Document d) { System.out.println("归档不可编辑"); }
    public void publish(Document d) { System.out.println("归档不可发布"); }
    public void archive(Document d) { System.out.println("已归档"); }
    public String name() { return "已归档"; }
}`
  },
  {
    id: "java-iterator-pattern",
    group: "设计模式",
    icon: "🔄",
    title: "迭代器模式",
    content: `# 迭代器模式

迭代器模式提供一种方法**顺序访问聚合对象中的元素**，而不暴露其内部表示。将遍历逻辑从聚合对象中分离。

## 核心接口

- **Iterator**：迭代器，提供 \`hasNext()\`、\`next()\`、\`remove()\`
- **Iterable**：可迭代对象，提供 \`iterator()\` 返回迭代器
- **Aggregate**：聚合接口

\`\`\`java
interface Iterator<E> {
    boolean hasNext();
    E next();
    default void remove() { throw new UnsupportedOperationException(); }
}

interface Iterable<E> {
    Iterator<E> iterator();
}
\`\`\`

## Java 集合框架

\`java.util.Iterator\` 与 \`java.lang.Iterable\` 是 Java 内置实现。所有 Collection 都是 Iterable，可用增强 for 循环：

\`\`\`java
for (String s : list) { ... }  // 编译器转为 Iterator 调用
\`\`\`

## 增强 for 循环

只要实现 \`Iterable\` 即可使用增强 for：

\`\`\`java
for (Item item : myCollection) { ... }
\`\`\`

Java 编译器将其转为：

\`\`\`java
Iterator<Item> it = myCollection.iterator();
while (it.hasNext()) { Item item = it.next(); ... }
\`\`\`

## 自定义迭代器

为自定义数据结构实现迭代器，封装遍历细节：

\`\`\`java
class MyList<T> implements Iterable<T> {
    public Iterator<T> iterator() {
        return new Iterator<T>() {
            public boolean hasNext() { ... }
            public T next() { ... }
        };
    }
}
\`\`\`

## fail-fast 机制

Java 集合迭代器多为 fail-fast——检测到结构性修改（增删）时立即抛 \`ConcurrentModificationException\`，通过 \`modCount\` 实现：

\`\`\`java
List<String> list = new ArrayList<>(...);
for (String s : list) {
    list.remove(s);  // 抛 ConcurrentModificationException
}
\`\`\`

正确删除方式：使用迭代器的 \`remove()\`，或 Java 8 \`removeIf\`。

## fail-safe 迭代器

\`CopyOnWriteArrayList\`、\`ConcurrentHashMap\` 等并发集合的迭代器是 fail-safe——遍历的是副本或弱一致快照，不抛异常，但可能不反映最新修改。

## forEach 与 Lambda

Java 8 起 \`Iterable\` 提供 \`forEach(Consumer)\`：

\`\`\`java
list.forEach(s -> System.out.println(s));
\`\`\`

更简洁，但无法在遍历中删除元素。

## 适用场景

- 统一遍历不同聚合结构
- 不暴露内部表示
- 支持多种遍历方式（前序、后序、广度）
- 并发遍历

## 优点

- 单一职责：聚合管存储，迭代器管遍历
- 开闭原则：新增聚合或迭代器互不影响
- 统一遍历接口

下面通过代码演示迭代器模式与自定义迭代器：`,
    code: `// 演示迭代器模式
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        // ===== 自定义链表迭代器 =====
        System.out.println("=== 自定义链表 ===");
        MyLinkedList<String> list = new MyLinkedList<>();
        list.add("甲");
        list.add("乙");
        list.add("丙");

        // 使用迭代器遍历
        Iterator<String> it = list.iterator();
        while (it.hasNext()) {
            System.out.println("  " + it.next());
        }

        // 增强 for 循环（依赖 Iterable）
        for (String s : list) {
            System.out.println("  for: " + s);
        }

        // forEach + lambda
        list.forEach(s -> System.out.println("  forEach: " + s));

        // ===== 自定义二叉树迭代器（中序遍历）=====
        System.out.println("\\n=== 二叉树中序遍历 ===");
        BinaryTree<Integer> tree = new BinaryTree<>();
        tree.add(5);
        tree.add(3);
        tree.add(8);
        tree.add(1);
        tree.add(4);
        for (Integer n : tree) {
            System.out.println("  " + n);
        }

        // ===== 过滤迭代器（装饰器思想）=====
        System.out.println("\\n=== 过滤迭代器 ===");
        List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5, 6);
        Iterator<Integer> evenIt = new FilterIterator<>(nums.iterator(), n -> n % 2 == 0);
        System.out.print("偶数: ");
        while (evenIt.hasNext()) System.out.print(evenIt.next() + " ");
        System.out.println();

        // ===== fail-fast 演示 =====
        System.out.println("\\n=== fail-fast ===");
        List<String> alist = new ArrayList<>(Arrays.asList("a", "b", "c", "d"));
        try {
            for (String s : alist) {
                if ("b".equals(s)) alist.remove(s);  // 抛异常
            }
        } catch (ConcurrentModificationException e) {
            System.out.println("捕获并发修改异常: " + e.getClass().getSimpleName());
        }

        // 正确删除：迭代器 remove
        alist = new ArrayList<>(Arrays.asList("a", "b", "c", "d"));
        Iterator<String> ait = alist.iterator();
        while (ait.hasNext()) {
            if ("b".equals(ait.next())) ait.remove();
        }
        System.out.println("迭代器删除后: " + alist);

        // removeIf（推荐）
        alist = new ArrayList<>(Arrays.asList("a", "b", "c", "d"));
        alist.removeIf("b"::equals);
        System.out.println("removeIf 后: " + alist);

        // ===== fail-safe：CopyOnWriteArrayList =====
        System.out.println("\\n=== fail-safe ===");
        List<String> cowList = new CopyOnWriteArrayList<>(Arrays.asList("x", "y", "z"));
        for (String s : cowList) {
            if ("y".equals(s)) cowList.add("w");  // 不抛异常
            System.out.println("  遍历: " + s);
        }
        System.out.println("最终: " + cowList);
    }
}

// ===== 自定义链表（实现 Iterable）=====
class MyLinkedList<T> implements Iterable<T> {
    private Node<T> head;
    private int size;

    static class Node<T> {
        T data;
        Node<T> next;
        Node(T d) { this.data = d; }
    }

    void add(T item) {
        Node<T> node = new Node<>(item);
        if (head == null) head = node;
        else {
            Node<T> cur = head;
            while (cur.next != null) cur = cur.next;
            cur.next = node;
        }
        size++;
    }

    int size() { return size; }

    public Iterator<T> iterator() {
        return new Iterator<T>() {
            private Node<T> current = head;
            private Node<T> lastReturned;
            private Node<T> prev;

            public boolean hasNext() { return current != null; }

            public T next() {
                if (!hasNext()) throw new NoSuchElementException();
                T data = current.data;
                prev = lastReturned;
                lastReturned = current;
                current = current.next;
                return data;
            }

            public void remove() {
                if (lastReturned == null) throw new IllegalStateException();
                if (lastReturned == head) {
                    head = head.next;
                } else {
                    prev.next = current;
                }
                lastReturned = null;
                size--;
            }
        };
    }
}

// ===== 二叉树（中序遍历迭代器）=====
class BinaryTree<T extends Comparable<T>> implements Iterable<T> {
    private Node<T> root;

    static class Node<T> {
        T data;
        Node<T> left, right;
        Node(T d) { this.data = d; }
    }

    void add(T item) { root = add(root, item); }

    private Node<T> add(Node<T> node, T item) {
        if (node == null) return new Node<>(item);
        if (item.compareTo(node.data) < 0) node.left = add(node.left, item);
        else node.right = add(node.right, item);
        return node;
    }

    // 中序遍历迭代器：用栈模拟递归
    public Iterator<T> iterator() {
        return new InOrderIterator(root);
    }

    class InOrderIterator implements Iterator<T> {
        private Deque<Node<T>> stack = new ArrayDeque<>();

        InOrderIterator(Node<T> root) {
            pushLeft(root);
        }

        private void pushLeft(Node<T> node) {
            while (node != null) {
                stack.push(node);
                node = node.left;
            }
        }

        public boolean hasNext() { return !stack.isEmpty(); }

        public T next() {
            if (!hasNext()) throw new NoSuchElementException();
            Node<T> node = stack.pop();
            pushLeft(node.right);
            return node.data;
        }
    }
}

// ===== 过滤迭代器 =====
class FilterIterator<T> implements Iterator<T> {
    private Iterator<T> inner;
    private Predicate<T> predicate;
    private T nextItem;
    private boolean hasNextItem = false;

    FilterIterator(Iterator<T> inner, Predicate<T> predicate) {
        this.inner = inner;
        this.predicate = predicate;
        advance();
    }

    private void advance() {
        hasNextItem = false;
        while (inner.hasNext()) {
            T item = inner.next();
            if (predicate.test(item)) {
                nextItem = item;
                hasNextItem = true;
                return;
            }
        }
    }

    public boolean hasNext() { return hasNextItem; }

    public T next() {
        if (!hasNextItem) throw new NoSuchElementException();
        T result = nextItem;
        advance();
        return result;
    }
}`
  },
  {
    id: "java-visitor-pattern",
    group: "设计模式",
    icon: "👋",
    title: "访问者模式",
    content: `# 访问者模式

访问者模式将**操作从对象结构中分离**出来，使可在不改变元素类的前提下定义新操作。适合数据结构稳定但操作频繁变化的场景。

## 核心角色

- **Visitor**：访问者接口，为每种元素类型声明 \`visit\` 方法
- **ConcreteVisitor**：具体访问者，实现各 \`visit\` 方法
- **Element**：元素接口，声明 \`accept(Visitor)\`
- **ConcreteElement**：具体元素，\`accept\` 调用 \`visitor.visit(this)\`
- **ObjectStructure**：对象结构，枚举元素

\`\`\`java
interface Visitor {
    void visit(Book book);
    void visit(Fruit fruit);
}

interface Item {
    void accept(Visitor v);
}

class Book implements Item {
    public void accept(Visitor v) { v.visit(this); }  // 双重分派
}
\`\`\`

## 双重分派

访问者模式的核心是**双重分派**：

1. 第一重：调用 \`element.accept(visitor)\`，根据元素实际类型选择具体 \`accept\`
2. 第二重：在 \`accept\` 内调用 \`visitor.visit(this)\`，\`this\` 的静态类型决定调用哪个 \`visit\` 重载

\`\`\`java
// accept 内：visitor.visit(this) 中 this 的静态类型是 Book
// 编译期即确定调用 visit(Book)
\`\`\`

Java 是单分派语言——方法调用根据运行时对象类型分派，但**参数类型在编译期静态绑定**。双重分派模拟了多分派。

## 数据结构与操作分离

当数据结构（元素类型）稳定，但操作经常新增时，访问者模式避免每次加操作都修改所有元素类：

- 新增操作 = 新增 Visitor
- 新增元素类型 = 修改所有 Visitor（违反开闭原则）

## 适用场景

- 编译器 AST 遍历（类型检查、代码生成、优化各为 Visitor）
- 文档导出（PDF、HTML、XML 各为 Visitor）
- 报表生成（不同报表遍历相同数据结构）
- 数据结构稳定，操作多变

## 优点

- 操作集中管理，易扩展新操作
- 相关行为聚集在 Visitor 中
- 累积状态：Visitor 可在遍历过程中累积信息

## 缺点

- 增加元素类型困难（需改所有 Visitor）
- 违反依赖倒置：Visitor 依赖具体元素类
- 元素需暴露内部细节给 Visitor

## 实际应用

- ASM 字节码库：ClassVisitor、MethodVisitor
- Java AWT 事件分发
- Apache Calcite 关系代数优化

下面通过代码演示访问者模式与双重分派：`,
    code: `// 演示访问者模式
import java.util.*;
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        // ===== 购物车：不同访问者实现不同计算 =====
        System.out.println("=== 购物车 ===");
        List<Item> cart = Arrays.asList(
            new Book("Java编程思想", 99.0, 1),
            new Fruit("苹果", 8.5, 2.0),
            new Book("Effective Java", 89.0, 1),
            new Fruit("香蕉", 5.0, 1.5)
        );

        // 访问者1：计算总价
        TotalPriceVisitor totalVisitor = new TotalPriceVisitor();
        for (Item item : cart) item.accept(totalVisitor);
        System.out.println("总价: ¥" + totalVisitor.getTotal());

        // 访问者2：打印明细
        System.out.println("\\n-- 明细 --");
        DetailVisitor detailVisitor = new DetailVisitor();
        for (Item item : cart) item.accept(detailVisitor);

        // 访问者3：按类别统计
        System.out.println("\\n-- 类别统计 --");
        CategoryStatVisitor statVisitor = new CategoryStatVisitor();
        for (Item item : cart) item.accept(statVisitor);
        statVisitor.printReport();

        // ===== AST 访问者：表达式求值与打印 =====
        System.out.println("\\n=== AST 表达式 ===");
        // 表达式: (1 + 2) * 3
        Expr expr = new MultiplyExpr(
            new AddExpr(new NumberExpr(1), new NumberExpr(2)),
            new NumberExpr(3));

        // 求值访问者
        EvalVisitor eval = new EvalVisitor();
        expr.accept(eval);
        System.out.println("(1+2)*3 = " + eval.getResult());

        // 打印访问者
        PrintVisitor printer = new PrintVisitor();
        expr.accept(printer);
        System.out.println("表达式: " + printer.getExpression());
    }
}

// ===== 元素接口 =====
interface Item { void accept(Visitor v); }

// 访问者接口：为每种元素声明 visit 方法
interface Visitor {
    void visit(Book book);
    void visit(Fruit fruit);
}

// 具体元素：书
class Book implements Item {
    String name;
    double price;
    int quantity;
    Book(String name, double price, int qty) {
        this.name = name; this.price = price; this.quantity = qty;
    }
    double cost() { return price * quantity; }
    public void accept(Visitor v) { v.visit(this); }  // 双重分派
}

// 具体元素：水果（按重量计价）
class Fruit implements Item {
    String name;
    double pricePerKg;
    double weight;
    Fruit(String name, double pricePerKg, double weight) {
        this.name = name; this.pricePerKg = pricePerKg; this.weight = weight;
    }
    double cost() { return pricePerKg * weight; }
    public void accept(Visitor v) { v.visit(this); }
}

// 具体访问者：计算总价
class TotalPriceVisitor implements Visitor {
    private double total = 0;
    public void visit(Book book) { total += book.cost(); }
    public void visit(Fruit fruit) { total += fruit.cost(); }
    double getTotal() { return total; }
}

// 具体访问者：打印明细
class DetailVisitor implements Visitor {
    public void visit(Book book) {
        System.out.printf("书: %s x%d 单价¥%.2f = ¥%.2f%n",
            book.name, book.quantity, book.price, book.cost());
    }
    public void visit(Fruit fruit) {
        System.out.printf("水果: %s %.1fkg ¥%.2f/kg = ¥%.2f%n",
            fruit.name, fruit.weight, fruit.pricePerKg, fruit.cost());
    }
}

// 具体访问者：按类别统计
class CategoryStatVisitor implements Visitor {
    private double bookTotal = 0, fruitTotal = 0;
    private int bookCount = 0, fruitCount = 0;
    public void visit(Book book) { bookTotal += book.cost(); bookCount++; }
    public void visit(Fruit fruit) { fruitTotal += fruit.cost(); fruitCount++; }
    void printReport() {
        System.out.printf("书籍: %d 件, 合计 ¥%.2f%n", bookCount, bookTotal);
        System.out.printf("水果: %d 种, 合计 ¥%.2f%n", fruitCount, fruitTotal);
    }
}

// ===== AST 表达式访问者 =====
abstract class Expr {
    abstract void accept(ExprVisitor v);
}

class NumberExpr extends Expr {
    int value;
    NumberExpr(int v) { this.value = v; }
    void accept(ExprVisitor v) { v.visit(this); }
}

class AddExpr extends Expr {
    Expr left, right;
    AddExpr(Expr l, Expr r) { this.left = l; this.right = r; }
    void accept(ExprVisitor v) { v.visit(this); }
}

class MultiplyExpr extends Expr {
    Expr left, right;
    MultiplyExpr(Expr l, Expr r) { this.left = l; this.right = r; }
    void accept(ExprVisitor v) { v.visit(this); }
}

// 表达式访问者接口
interface ExprVisitor {
    void visit(NumberExpr e);
    void visit(AddExpr e);
    void visit(MultiplyExpr e);
}

// 求值访问者
class EvalVisitor implements ExprVisitor {
    private Deque<Integer> stack = new ArrayDeque<>();
    public void visit(NumberExpr e) { stack.push(e.value); }
    public void visit(AddExpr e) {
        e.right.accept(this);
        e.left.accept(this);
        stack.push(stack.pop() + stack.pop());
    }
    public void visit(MultiplyExpr e) {
        e.right.accept(this);
        e.left.accept(this);
        stack.push(stack.pop() * stack.pop());
    }
    int getResult() { return stack.pop(); }
}

// 打印访问者
class PrintVisitor implements ExprVisitor {
    private StringBuilder sb = new StringBuilder();
    public void visit(NumberExpr e) { sb.append(e.value); }
    public void visit(AddExpr e) {
        sb.append("(");
        e.left.accept(this);
        sb.append(" + ");
        e.right.accept(this);
        sb.append(")");
    }
    public void visit(MultiplyExpr e) {
        sb.append("(");
        e.left.accept(this);
        sb.append(" * ");
        e.right.accept(this);
        sb.append(")");
    }
    String getExpression() { return sb.toString(); }
}`
  }
];
