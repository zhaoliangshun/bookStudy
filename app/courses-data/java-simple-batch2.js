// =============================================================
// Java 精简版 —— 第 2 批章节（面向对象 4 章）
// -------------------------------------------------------------
//   js-class      : 类与对象
//   js-extend     : 继承与多态
//   js-interface  : 接口与抽象类
//   js-inner-enum : 内部类、枚举与注解
// ============================================================

export const chapters = [
  // =========================================================
  // 第 5 章：类与对象
  // =========================================================
  {
    id: "js-class",
    group: "面向对象",
    icon: "📦",
    title: "类与对象",
    content: `# 类与对象

## 一、类的结构

\`\`\`java
public class Person {
    // ===== 1. 字段（实例变量）=====
    // private: 外部不能直接访问，必须通过方法
    private String name;
    private int age;

    // ===== 2. 构造方法 =====
    // 无参构造：默认会自动生成，但写了有参构造后就不再自动生成
    public Person() {
        // this() 调用另一个构造方法，必须在第一行
        this("匿名", 0);
    }

    // 有参构造
    public Person(String name, int age) {
        // this.name 表示当前对象的字段，区别于参数 name
        this.name = name;
        this.age = age;
    }

    // ===== 3. 方法 =====
    public void sayHi() {
        System.out.println("Hi, 我是 " + name + ", " + age + " 岁");
    }

    // ===== 4. getter / setter =====
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
}
\`\`\`

**关键点：**
- \`private\` 字段 + \`public\` getter/setter 是 Java 标准封装模式
- \`this\` 指当前对象，\`this()\` 调用本类其他构造方法
- 不写构造方法会自动生成无参构造；写了任何一个构造方法后，无参构造就不再自动生成

## 二、static：属于类而不是对象

\`\`\`java
public class Main {
    public static void main(String[] args) {
        Counter c1 = new Counter();
        Counter c2 = new Counter();
        c1.increment();
        c1.increment();
        c2.increment();
        // count 是 static，所有实例共享
        System.out.println("总数: " + Counter.count);  // 3
    }
}

class Counter {
    // static 字段：属于类，所有实例共享一份
    static int count = 0;
    // static final：常量，命名全大写
    public static final double PI = 3.14159;

    void increment() {
        count++;   // 等价于 Counter.count++
    }
}
\`\`\`

**static 方法：** 直接用 \`类名.方法名()\` 调用，不能用 \`this\`，不能直接访问实例字段。

\`\`\`java
class MathUtil {
    public static int square(int x) { return x * x; }
}

// 调用：MathUtil.square(5)
\`\`\`

## 三、Demo：封装一个 BankAccount

\`\`\`java
public class Main {
    public static void main(String[] args) {
        BankAccount acc = new BankAccount("Tom", 1000);
        acc.deposit(500);
        acc.withdraw(200);
        acc.withdraw(-50);   // 触发参数校验
        System.out.println(acc);  // 调用 toString
    }
}

class BankAccount {
    private String owner;
    private double balance;

    public BankAccount(String owner, double balance) {
        this.owner = owner;
        this.balance = balance;
    }

    // 存款
    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("存款金额必须 > 0");
        }
        balance += amount;
    }

    // 取款
    public void withdraw(double amount) {
        if (amount <= 0) {
            System.out.println("取款失败：金额必须 > 0");
            return;
        }
        if (amount > balance) {
            System.out.println("取款失败：余额不足");
            return;
        }
        balance -= amount;
    }

    // toString：打印对象时自动调用
    @Override
    public String toString() {
        return "BankAccount{owner=" + owner + ", balance=" + balance + "}";
    }
}
\`\`\`

## 四、访问修饰符

| 修饰符 | 同类 | 同包 | 子类 | 其他 |
| --- | --- | --- | --- | --- |
| public | ✓ | ✓ | ✓ | ✓ |
| protected | ✓ | ✓ | ✓ | ✗ |
| (default) | ✓ | ✓ | ✗ | ✗ |
| private | ✓ | ✗ | ✗ | ✗ |

\`(default)\` 不写修饰符，仅同包可见。

## 五、小结

- 封装：\`private\` 字段 + \`public\` 方法
- \`static\` 属于类，所有实例共享
- \`this()\` 调本类构造方法，\`this.\` 区分字段与参数
- 不写构造方法时自动生成无参构造`,
  },

  // =========================================================
  // 第 6 章：继承与多态
  // =========================================================
  {
    id: "js-extend",
    group: "面向对象",
    icon: "🧬",
    title: "继承与多态",
    content: `# 继承与多态

## 一、extends：单继承

Java 类只能继承**一个**父类（单继承），用 \`extends\` 关键字。

\`\`\`java
class Animal {
    String name;
    public Animal(String name) { this.name = name; }
    public void eat() {
        System.out.println(name + " 在吃东西");
    }
}

// Dog 继承 Animal，自动获得 name 字段和 eat() 方法
class Dog extends Animal {
    public Dog(String name) {
        // super() 调用父类构造方法，必须放第一行
        super(name);
    }
    // 子类特有方法
    public void bark() {
        System.out.println(name + ": 汪汪汪");
    }
}
\`\`\`

**规则：**
- 子类构造方法必须先调用 \`super(...)\`（不写编译器自动加无参 \`super()\`）
- 子类不能访问父类的 \`private\` 成员
- Java 所有类的根父类是 \`Object\`

## 二、方法重写 @Override

\`\`\`java
class Animal {
    public void speak() {
        System.out.println("...");
    }
}

class Cat extends Animal {
    // @Override 是注解，让编译器帮你检查是否真的重写了父类方法
    @Override
    public void speak() {
        System.out.println("喵喵");
    }
}
\`\`\`

**重写规则：**
- 方法签名必须相同（方法名 + 参数列表）
- 返回类型可以是父类返回类型的子类型（协变返回）
- 访问权限**不能更严**（父 public 子不能 protected）
- 抛出异常**不能更宽**（父不 throws 子不能 throws 受检异常）

## 三、多态：父类引用指向子类对象

\`\`\`java
public class Main {
    public static void main(String[] args) {
        // 父类引用指向子类对象
        Animal a1 = new Dog("小黑");
        Animal a2 = new Cat("咪咪");

        // 调用的是子类重写后的 speak()，这就是多态
        a1.speak();
        a2.speak();

        // 统一用父类类型接收，遍历
        Animal[] animals = { new Dog("A"), new Cat("B") };
        for (Animal a : animals) {
            a.speak();
        }
    }
}
\`\`\`

**多态三要素：**
1. 继承（父类 / 接口）
2. 重写（子类覆盖父类方法）
3. 父类引用指向子类对象

## 四、instanceof 与强转

\`\`\`java
Animal a = new Dog("Tom");

// 旧写法：先 instanceof 再强转
if (a instanceof Dog) {
    Dog d = (Dog) a;
    d.bark();
}

// Java 16+ 模式匹配：类型匹配后直接绑定变量
if (a instanceof Dog d) {
    d.bark();
}
\`\`\`

## 五、Object 的核心方法

所有类都继承 \`Object\`，重点重写两个：\`equals\` 和 \`hashCode\`。

\`\`\`java
class Person {
    String name;
    int age;
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // 重写 equals：定义"什么算相等"
    @Override
    public boolean equals(Object o) {
        // 1. 同一对象
        if (this == o) return true;
        // 2. null 或类型不匹配
        if (o == null || getClass() != o.getClass()) return false;
        Person p = (Person) o;
        return age == p.age && name.equals(p.name);
    }

    // 重写 hashCode：equals 相等的对象必须 hash 相等
    // 用 Objects.hash 自动算（推荐）
    @Override
    public int hashCode() {
        return java.util.Objects.hash(name, age);
    }
}
\`\`\`

**铁律：** 重写 \`equals\` 必须重写 \`hashCode\`，否则 HashMap / HashSet 会出 bug。

## 六、final

- \`final class\`：不能被继承（如 \`String\`、\`Integer\`）
- \`final void method()\`：不能被重写
- \`final int x = 1\`：变量只能赋值一次（常量）

## 七、小结

- 单继承，子类用 \`super\` 调父类构造和方法
- 多态：父类引用指向子类对象，调子类重写的方法
- 重写 \`equals\` 必须重写 \`hashCode\`
- \`final\` 阻止继承 / 重写 / 重新赋值`,
  },

  // =========================================================
  // 第 7 章：接口与抽象类
  // =========================================================
  {
    id: "js-interface",
    group: "面向对象",
    icon: "🔌",
    title: "接口与抽象类",
    content: `# 接口与抽象类

## 一、interface：契约

接口定义"能做什么"，不关心"怎么做"。

\`\`\`java
// 接口：定义抽象方法的契约
interface Flyable {
    // 抽象方法：无方法体
    void fly();

    // 默认方法（Java 8+）：有默认实现，子类可重写也可不重写
    default void land() {
        System.out.println("降落...");
    }

    // 静态方法（Java 8+）：用接口名直接调
    static Flyable noop() {
        return () -> System.out.println("不会飞");
    }
}

// 类实现接口，必须实现所有抽象方法
class Bird implements Flyable {
    @Override
    public void fly() {
        System.out.println("鸟在飞");
    }
}
\`\`\`

**接口的特点：**
- 字段默认 \`public static final\`（常量）
- 方法默认 \`public abstract\`（除非 default / static / private）
- 一个类可以 \`implements\` **多个**接口（解决单继承问题）

## 二、Demo：多接口实现

\`\`\`java
public class Main {
    public static void main(String[] args) {
        Duck d = new Duck();
        d.fly();
        d.swim();

        // 用接口类型接收
        Flyable f = new Duck();
        f.fly();
        f.land();

        // 静态方法直接调
        Flyable.noop().fly();
    }
}

interface Flyable {
    void fly();
    default void land() {
        System.out.println("降落...");
    }
    static Flyable noop() {
        return () -> System.out.println("不会飞");
    }
}

interface Swimmer {
    void swim();
}

// Duck 同时实现两个接口
class Duck implements Flyable, Swimmer {
    @Override
    public void fly() {
        System.out.println("鸭子扑棱扑棱飞");
    }
    @Override
    public void swim() {
        System.out.println("鸭子在水里游");
    }
}
\`\`\`

## 三、抽象类 abstract

抽象类**不能实例化**，可以包含抽象方法和具体方法。

\`\`\`java
abstract class Shape {
    // 抽象方法：子类必须实现
    public abstract double area();

    // 具体方法：子类可直接复用
    public void describe() {
        // 调用子类实现的 area()
        System.out.println("面积 = " + area());
    }
}

class Circle extends Shape {
    private double r;
    public Circle(double r) { this.r = r; }

    @Override
    public double area() {
        return Math.PI * r * r;
    }
}

public class Main {
    public static void main(String[] args) {
        Shape s = new Circle(2);
        s.describe();
    }
}
\`\`\`

## 四、接口 vs 抽象类

| | 接口 | 抽象类 |
| --- | --- | --- |
| 关系 | \`implements\` | \`extends\` |
| 数量 | 多实现 | 单继承 |
| 字段 | 只能 \`public static final\` 常量 | 任意字段 |
| 构造方法 | 没有 | 有 |
| 状态 | 无状态 | 可有状态（字段）|
| 适用场景 | 定义能力契约 | 共享代码 + 模板方法 |

**经验：**
- 想"能做什么"（能力）→ 用接口
- 想"是什么"（本质）+ 共享代码 → 用抽象类

## 五、default 方法的冲突

类继承多个接口，且接口有同名 default 方法时，必须手动解决冲突。

\`\`\`java
interface A {
    default void hello() { System.out.println("A"); }
}
interface B {
    default void hello() { System.out.println("B"); }
}

class C implements A, B {
    // 必须重写，否则编译错误
    @Override
    public void hello() {
        // 显式指定调用哪个接口的 default
        A.super.hello();
    }
}
\`\`\`

## 六、函数式接口

**只有一个抽象方法**的接口叫函数式接口，可用 \`@FunctionalInterface\` 注解校验。

\`\`\`java
@FunctionalInterface
interface Comparator<T> {
    int compare(T a, T b);
    // 可以有多个 default / static 方法
    default Comparator<T> reversed() {
        return (a, b) -> -compare(a, b);
    }
}
\`\`\`

是 Lambda 表达式的基础（下章讲）。

## 七、小结

- 接口 = 能力契约，可多实现，有 default / static / private 方法
- 抽象类 = 模板，单继承，可有字段和构造方法
- 函数式接口（单抽象方法）是 Lambda 的基础`,
  },

  // =========================================================
  // 第 8 章：内部类、枚举与注解
  // =========================================================
  {
    id: "js-inner-enum",
    group: "面向对象",
    icon: "🎨",
    title: "内部类、枚举与注解",
    content: `# 内部类、枚举与注解

## 一、四种内部类

\`\`\`java
public class Outer {
    private int x = 10;

    // 1. 成员内部类：持有外部类的引用
    class Inner {
        void show() {
            // 可直接访问外部类的 private 字段
            System.out.println("x = " + x);
        }
    }

    // 2. 静态内部类：不持有外部类引用
    static class StaticInner {
        void show() {
            // 只能访问外部类的 static 成员
            System.out.println("静态内部类");
        }
    }

    // 3. 局部内部类：定义在方法里
    public void method() {
        class Local {
            void show() { System.out.println("局部内部类"); }
        }
        new Local().show();
    }

    // 4. 匿名内部类：一次性实现接口/继承类
    private Runnable r = new Runnable() {
        @Override
        public void run() {
            System.out.println("匿名内部类");
        }
    };
}
\`\`\`

**经验：**
- 静态内部类最常用（如 \`Map.Entry\`、\`Builder\`），不持外部引用
- 匿名内部类现在基本被 Lambda 取代
- 成员内部类少用，容易内存泄漏

## 二、Demo：用静态内部类实现 Builder 模式

\`\`\`java
public class Main {
    public static void main(String[] args) {
        User u = new User.Builder()
            .name("Tom")
            .age(18)
            .email("tom@x.com")
            .build();
        System.out.println(u);
    }
}

class User {
    private String name;
    private int age;
    private String email;

    private User(String name, int age, String email) {
        this.name = name;
        this.age = age;
        this.email = email;
    }

    // 静态内部类实现 Builder
    public static class Builder {
        private String name;
        private int age;
        private String email;

        public Builder name(String n) { this.name = n; return this; }
        public Builder age(int a) { this.age = a; return this; }
        public Builder email(String e) { this.email = e; return this; }

        public User build() {
            return new User(name, age, email);
        }
    }

    @Override
    public String toString() {
        return "User{name=" + name + ", age=" + age + ", email=" + email + "}";
    }
}
\`\`\`

## 三、枚举 enum

枚举是一种特殊的类，每个枚举常量都是它的单例实例。

\`\`\`java
enum Color {
    RED, GREEN, BLUE
}

// 可以有字段、构造方法、方法
enum Status {
    // 每个枚举常量都调用对应的构造方法
    ACTIVE(1, "激活"),
    INACTIVE(0, "未激活"),
    BANNED(-1, "封禁");

    private final int code;
    private final String desc;

    // 构造方法只能是 private（默认就是 private）
    Status(int code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public int getCode() { return code; }
    public String getDesc() { return desc; }

    // 每个常量可以重写方法（更灵活）
    public boolean isActive() { return this == ACTIVE; }
}

public class Main {
    public static void main(String[] args) {
        Status s = Status.ACTIVE;
        System.out.println(s + ": code=" + s.getCode() + ", desc=" + s.getDesc());

        // values()：返回所有枚举常量
        for (Status st : Status.values()) {
            System.out.println(st + " ordinal=" + st.ordinal());
        }

        // valueOf：字符串转枚举
        Status t = Status.valueOf("BANNED");
        System.out.println(t.getDesc());

        // switch 里可直接用枚举常量
        switch (s) {
            case ACTIVE -> System.out.println("激活中");
            case INACTIVE -> System.out.println("未激活");
            case BANNED -> System.out.println("已封禁");
        }
    }
}
\`\`\`

## 四、枚举实现单例

\`\`\`java
enum Singleton {
    INSTANCE;  // 唯一实例

    public void doSomething() {
        System.out.println("do something");
    }
}

// 使用：Singleton.INSTANCE.doSomething()
\`\`\`

枚举单例线程安全，防反射攻击，是《Effective Java》推荐写法。

## 五、注解

注解是给程序元素贴的"标签"，编译期或运行期被读取。

\`\`\`java
import java.lang.annotation.*;

// 自定义注解
@Retention(RetentionPolicy.RUNTIME)  // 保留到运行期，反射可读
@Target(ElementType.METHOD)           // 只能用于方法
@interface MyAnnotation {
    String value() default "";
    int priority() default 0;
}

class Foo {
    @MyAnnotation(value = "test", priority = 1)
    @Override  // 内置注解：标记重写父类方法
    public String toString() {
        return "Foo";
    }

    @Deprecated  // 标记已过时，调用会编译警告
    public void oldMethod() {}
}
\`\`\`

**常用内置注解：**
- \`@Override\`：标记重写父类方法，编译器校验
- \`@Deprecated\`：标记已过时
- \`@SuppressWarnings("unchecked")\`：抑制警告

**元注解（修饰注解的注解）：**
- \`@Retention\`：保留策略（SOURCE / CLASS / RUNTIME）
- \`@Target\`：能用在哪里（TYPE / METHOD / FIELD...）
- \`@Inherited\`：子类是否继承此注解

## 六、小结

- 优先用静态内部类，少用成员内部类
- 枚举是天然的线程安全单例，可加字段/方法/构造器
- 注解 = 元数据标签，配合反射可实现 IoC、序列化等框架功能`,
  },
];
