// =============================================================
// Java 交互式教程 —— 第二批章节（面向对象组，共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   6. java-oop-basics    — 面向对象基础
//   7. java-inheritance   — 继承与多态
//   8. java-interfaces    — 接口与抽象类
//   9. java-exceptions    — 异常处理
//  10. java-collections   — 集合框架
// =============================================================

export const chapters = [
  // =========================================================
  // 第六章：面向对象基础
  // =========================================================
  {
    id: "java-oop-basics",
    group: "面向对象",
    icon: "🏛️",
    title: "面向对象基础",
    content: `## 面向对象基础

**面向对象编程**（Object-Oriented Programming, OOP）是 Java 最核心的编程思想。它通过"类"和"对象"来组织代码，把现实世界中的事物抽象为程序中的实体。Java 是一门"纯度较高"的面向对象语言——几乎所有代码都必须写在类里面（基本类型除外）。

面向对象有三大（或四大）基本特征：**封装**、**继承**、**多态**（再加上**抽象**）。本章先打牢基础：理解类与对象、属性与方法、构造方法、this、访问修饰符、封装、static 以及方法重载，为后续章节做准备。

### 一、类与对象

**类（Class）是模板，对象（Object）是实例。** 可以把类想象成"图纸"，对象想象成按图纸造出来的"房子"。一张图纸可以造出很多房子，它们结构相同但各自独立。

| 概念 | 说明 | 举例 |
| --- | --- | --- |
| **类** | 对一类事物的抽象描述，定义属性和行为 | \`Student\` 类 |
| **对象** | 类的具体实例，占用内存空间 | \`new Student("张三", 20)\` |
| **实例化** | 通过 \`new\` 创建对象的过程 | \`Student s = new Student(...)\` |

\`\`\`java
// 定义一个类
class Student {
    String name;   // 属性
    int age;
    void study() { // 方法
        System.out.println(name + "正在学习");
    }
}
// 创建并使用对象
Student s = new Student();
s.name = "张三";
s.study();
\`\`\`

### 二、属性与方法

- **属性**（字段 / 成员变量）：描述对象的**状态**，写在类中方法外。有默认值（int 为 0，引用类型为 null）。
- **方法**：描述对象的**行为**。由方法签名（名称 + 参数列表）和方法体组成。

\`\`\`java
class Student {
    String name;          // 实例属性
    int score;
    // 实例方法：访问实例属性
    int addScore(int n) {
        score += n;
        return score;
    }
}
\`\`\`

### 三、构造方法

构造方法（Constructor）是一种特殊的方法，用于**在创建对象时初始化对象**。它有四个特点：

1. **方法名与类名完全相同**。
2. **没有返回值类型**（连 \`void\` 都不写）。
3. 在 \`new\` 对象时**自动调用**，且只调用一次。
4. 可以**重载**（多个构造方法，参数不同）。

如果你没有写任何构造方法，编译器会自动生成一个无参构造方法；一旦你写了有参构造方法，编译器就**不再**生成无参构造方法，需要时必须手动声明。

### 四、this 关键字

\`this\` 代表**当前对象的引用**，常用于三种场景：

| 用法 | 说明 | 示例 |
| --- | --- | --- |
| \`this.属性\` | 区分成员变量与参数（参数同名时） | \`this.name = name;\` |
| \`this(参数)\` | 调用本类的另一个构造方法（必须在第一行） | \`this("无名", 0);\` |
| \`return this\` | 返回当前对象，支持链式调用 | \`return this;\` |

### 五、访问修饰符

Java 提供四种访问修饰符，控制成员的**可见范围**，是实现封装的关键：

| 修饰符 | 同一个类 | 同一个包 | 子类 | 其他包 |
| --- | --- | --- | --- | --- |
| **public** | ✅ | ✅ | ✅ | ✅ |
| **protected** | ✅ | ✅ | ✅ | ❌ |
| **default**（不写） | ✅ | ✅ | ❌ | ❌ |
| **private** | ✅ | ❌ | ❌ | ❌ |

经验法则：**字段一般设为 private，方法一般设为 public**，只暴露必要的接口。

### 六、封装（Encapsulation）

封装就是**隐藏对象内部的实现细节，对外提供统一的访问接口**。好处是：外部不能随意修改内部状态，可以在 setter 中加入校验逻辑，保证数据的合法性。

\`\`\`java
class Student {
    private int age; // 私有属性，外部不可直接访问
    public int getAge() { return age; }       // getter
    public void setAge(int age) {             // setter 带校验
        if (age < 0 || age > 150) return;     // 非法值被拒绝
        this.age = age;
    }
}
\`\`\`

### 七、static 关键字

\`static\` 修饰的成员**属于类本身，而不属于某个对象**，所有对象共享同一份数据。

- **静态变量**：所有实例共享，内存中只有一份。
- **静态方法**：可以通过类名直接调用（推荐），但在静态方法中**不能直接访问实例成员**（因为没有 \`this\`）。
- **静态常量**：\`public static final\` 组合，常用于定义全局常量。

\`\`\`java
class Student {
    static int total = 0;             // 静态变量：统计总人数
    public static final String SCHOOL = "编程大学"; // 静态常量
    public Student() { total++; }     // 每创建一个对象，总数加 1
    public static int getTotal() { return total; } // 静态方法
}
// 通过类名访问静态成员
System.out.println(Student.getTotal());
\`\`\`

### 八、方法重载（Overloading）

方法重载指在**同一个类中**定义多个**同名但参数列表不同**的方法。它让同一行为可以用不同的参数调用，提升代码可读性。

重载的判定规则：
- **方法名必须相同**。
- **参数列表必须不同**（参数个数、类型或顺序不同）。
- **与返回值类型无关**（仅返回值不同不算重载）。

\`\`\`java
class Calculator {
    int add(int a, int b) { return a + b; }
    double add(double a, double b) { return a + b; } // 参数类型不同
    int add(int a, int b, int c) { return a + b + c; } // 参数个数不同
}
\`\`\`

> 注意区分**重载（Overload）**与**重写（Override）**：重载发生在**同一个类的同名方法**之间，重写发生在**父子类**之间，将在下一章详细讲解。

下面通过一个完整的 \`Student\` 类演示以上所有知识点：创建对象、构造方法重载、this 调用、封装的 getter/setter、static 统计与方法重载。`,
    code: `// ============================================================
// 第六章代码演示：面向对象基础 —— Student 类
// ============================================================
public class Main {
    public static void main(String[] args) {
        // 创建对象：使用 new 关键字调用构造方法
        Student s1 = new Student("张三", 20);
        Student s2 = new Student("李四");

        // 通过 setter 修改私有属性（封装的体现）
        s2.setAge(22);

        // 调用重载的 introduce 方法
        s1.introduce();
        s2.introduce();
        s1.introduce("同学们"); // 重载版本：带问候对象

        // 访问静态成员：推荐通过类名访问
        System.out.println("当前学生总数:" + Student.getTotal());

        // 调用静态方法
        Student.printSchool();
    }
}

// 学生类：演示封装、构造方法重载、this、static、方法重载
class Student {
    // 私有属性：对外隐藏，体现封装
    private String name;
    private int age;

    // 静态属性：属于类，所有对象共享同一份数据
    private static int total = 0;
    // 静态常量：学校名称
    public static final String SCHOOL = "编程大学";

    // 构造方法重载之一：无参构造
    public Student() {
        this("无名", 0); // this(...) 调用本类另一个构造方法，必须在第一行
    }

    // 构造方法重载之二：带姓名和年龄
    public Student(String name, int age) {
        this.name = name; // this.name 区分成员变量与参数
        this.age = age;
        total++;          // 每创建一个对象，总数加 1
    }

    // 构造方法重载之三：只传姓名，年龄给默认值
    public Student(String name) {
        this(name, 18);
    }

    // getter / setter：提供对私有属性受控的访问
    public String getName() { return name; }
    public int getAge() { return age; }
    public void setAge(int age) {
        // 在 setter 中加入校验逻辑，保证数据合法性
        if (age < 0 || age > 150) {
            System.out.println("年龄不合法，保持原值");
            return;
        }
        this.age = age;
    }

    // 方法重载之一：无参介绍
    public void introduce() {
        System.out.println("我是" + name + "，今年" + age + "岁。");
    }

    // 方法重载之二：带问候对象，参数列表不同
    public void introduce(String to) {
        System.out.println("你好" + to + "！我是" + name + "，今年" + age + "岁。");
    }

    // 静态方法：只能访问静态成员，不能直接访问实例成员
    public static int getTotal() {
        return total;
    }

    // 静态方法：通过类名直接调用
    public static void printSchool() {
        System.out.println("学校:" + SCHOOL);
    }
}`,
  },

  // =========================================================
  // 第七章：继承与多态
  // =========================================================
  {
    id: "java-inheritance",
    group: "面向对象",
    icon: "🔗",
    title: "继承与多态",
    content: `## 继承与多态

**继承（Inheritance）** 是面向对象的第二大特征，它允许一个类（子类）获得另一个类（父类）的属性和方法，从而实现**代码复用**和**层次化建模**。**多态（Polymorphism）** 则让同一调用在不同对象上表现出不同行为，是面向对象灵活性的核心来源。

### 一、extends 关键字

Java 使用 \`extends\` 关键字表示继承。子类自动获得父类**非 private** 的成员。

\`\`\`java
class Animal {           // 父类
    String name;
    void eat() { System.out.println(name + "吃东西"); }
}
class Dog extends Animal { // 子类继承父类
    void fetch() { System.out.println(name + "捡飞盘"); }
}
\`\`\`

要点：
- Java 是**单继承**：一个类只能 \`extends\` 一个直接父类。
- 所有类的"根"是 \`java.lang.Object\`，没显式继承时默认继承 Object。
- 构造方法**不会被继承**，但子类构造方法会先调用父类构造方法。

### 二、super 关键字

\`super\` 指向**父类对象**的引用，主要用途：

| 用法 | 说明 |
| --- | --- |
| \`super.属性\` / \`super.方法()\` | 调用父类被覆盖的成员 |
| \`super(参数)\` | 调用父类构造方法，必须是子类构造方法的**第一条语句** |

子类构造方法若没有显式调用 \`super(...)\`，编译器会自动插入 \`super()\`（无参父类构造方法）。因此父类最好保留一个无参构造方法。

### 三、方法重写（@Override）

**重写（Override）** 指子类重新定义从父类继承的方法，运行时根据**实际对象类型**调用对应版本（动态绑定）。

重写规则（"两同两小一大"）：
- **方法名相同**、**参数列表相同**。
- 返回值类型**小于等于**父类（协变返回类型）。
- 抛出异常**小于等于**父类。
- 访问权限**大于等于**父类（不能比父类更严格）。

\`@Override\` 是一个注解，**强制编译器检查**这是否为一个合法的重写，防止拼写错误把"重写"变成"新方法"。建议重写时总是加上。

> **重载 vs 重写**：重载（Overload）发生在**同类同名不同参**，编译时决定；重写（Override）发生在**父子类同名同参**，运行时决定。

### 四、多态：向上转型与向下转型

**多态**的前提：继承 + 重写 + 父类引用指向子类对象。

- **向上转型**（隐式）：子类对象赋值给父类引用。安全，但只能调用父类声明的方法。
- **向下转型**（显式强转）：把父类引用转回子类类型，可调用子类特有方法。**必须先判断** \`instanceof\`，否则可能抛 \`ClassCastException\`。

\`\`\`java
Animal a = new Dog();   // 向上转型
a.eat();                // 调用继承自父类的方法
if (a instanceof Dog) { // 安全判断
    Dog d = (Dog) a;    // 向下转型
    d.fetch();          // 调用子类特有方法
}
\`\`\`

多态的核心价值：**让代码可以面向抽象编程**，新增子类不需要修改调用方代码（开闭原则）。

### 五、final 关键字

\`final\` 表示"最终的、不可变"，可修饰三种目标：

| 修饰目标 | 含义 | 示例 |
| --- | --- | --- |
| **类** | 不能被继承 | \`final class String\` |
| **方法** | 不能被子类重写 | \`public final void show()\` |
| **变量** | 只能赋值一次（常量） | \`final int MAX = 100;\` |

\`final\` 修饰引用类型变量时，引用本身不可变（不能指向新对象），但对象内部状态仍可修改。

### 六、Object 类常用方法

\`Object\` 是所有类的祖先，几个最常用的方法建议重写：

| 方法 | 默认行为 | 重写建议 |
| --- | --- | --- |
| \`toString()\` | 返回"类名@哈希十六进制" | 返回有意义的描述字符串 |
| \`equals(Object)\` | 比较引用地址（==） | 比较逻辑内容是否相等 |
| \`hashCode()\` | 基于地址的整数 | **与 equals 保持一致**：两个 equals 相等的对象必须返回相同 hashCode |

> **契约**：重写 \`equals\` 必须同时重写 \`hashCode\`，否则在 HashMap/HashSet 中会出现"相等却存不进/取不出"的诡异 bug。

下面用 Animal / Dog / Cat 的例子演示继承、super、@Override、多态与 Object 方法重写。`,
    code: `// ============================================================
// 第七章代码演示：继承与多态 —— Animal / Dog / Cat
// ============================================================
public class Main {
    public static void main(String[] args) {
        // 向上转型：子类对象赋值给父类引用（多态的前提）
        Animal a1 = new Dog("旺财", 3);
        Animal a2 = new Cat("咪咪", 2);

        // 动态绑定：运行时根据实际对象类型调用重写的方法
        a1.speak(); // 实际调用 Dog 的 speak
        a2.speak(); // 实际调用 Cat 的 speak

        // 调用从父类继承的普通方法
        a1.eat();
        a2.eat();

        // 向下转型：需强制转换，建议先用 instanceof 判断
        if (a1 instanceof Dog) {
            Dog d = (Dog) a1;
            d.fetch(); // 调用 Dog 特有的方法
        }

        // Object 方法演示：toString / equals / hashCode
        Dog dog1 = new Dog("旺财", 3);
        Dog dog2 = new Dog("旺财", 3);
        System.out.println("toString:" + dog1);
        System.out.println("两个对象是否相等:" + dog1.equals(dog2));
        System.out.println("hashCode 是否一致:" + (dog1.hashCode() == dog2.hashCode()));
    }
}

// 父类 Animal（若用 final 修饰则不能被继承，此处不修饰以便演示）
class Animal {
    protected String name; // protected：子类可以访问
    protected int age;

    // 父类构造方法
    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // 普通方法：子类可直接使用或重写
    public void eat() {
        System.out.println(name + "正在吃东西");
    }

    // 可被子类重写的方法
    public void speak() {
        System.out.println(name + "发出声音");
    }

    // 重写 Object.toString，返回有意义的描述
    @Override
    public String toString() {
        return "Animal{name=" + name + ", age=" + age + "}";
    }
}

// 子类 Dog：使用 extends 继承 Animal
class Dog extends Animal {
    public Dog(String name, int age) {
        super(name, age); // super 调用父类构造方法，必须放在第一行
    }

    // 方法重写：使用 @Override 注解，强制编译器检查
    @Override
    public void speak() {
        System.out.println(name + "说：汪汪汪！");
    }

    // Dog 特有的方法
    public void fetch() {
        System.out.println(name + "在捡飞盘");
    }

    // 重写 equals：基于名字和年龄判断逻辑是否相等
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;              // 同一个对象
        if (!(obj instanceof Dog)) return false;   // 类型不符
        Dog other = (Dog) obj;                     // 安全向下转型
        return this.age == other.age && this.name.equals(other.name);
    }

    // 重写 hashCode：与 equals 保持一致（相等的对象必须返回相同哈希）
    @Override
    public int hashCode() {
        return name.hashCode() * 31 + age;
    }
}

// 子类 Cat：同样继承 Animal
class Cat extends Animal {
    public Cat(String name, int age) {
        super(name, age);
    }

    @Override
    public void speak() {
        System.out.println(name + "说：喵喵喵！");
    }
}`,
  },

  // =========================================================
  // 第八章：接口与抽象类
  // =========================================================
  {
    id: "java-interfaces",
    group: "面向对象",
    icon: "🔌",
    title: "接口与抽象类",
    content: `## 接口与抽象类

**抽象**是面向对象的第四大特征。Java 提供两种实现抽象的机制：**抽象类（abstract class）** 和 **接口（interface）**。它们都能定义"规范"而不提供完整实现，但在设计意图和能力上有重要差别。

### 一、抽象类与 abstract 关键字

用 \`abstract\` 修饰的类是抽象类，它**不能被实例化**，只能被继承。抽象类可以包含：

- 普通字段和普通方法（有实现）。
- **抽象方法**（\`abstract\` 修饰，只有声明没有方法体），子类必须实现（除非子类也是抽象类）。

\`\`\`java
abstract class Shape {
    String name;
    // 抽象方法：只有声明，没有方法体
    abstract double area();
    // 普通方法：子类可直接继承
    void show() { System.out.println(name + ":" + area()); }
}
\`\`\`

### 二、接口与 interface 关键字

接口是一组行为规范的集合，使用 \`interface\` 定义。传统接口中的方法默认是 \`public abstract\`（即抽象方法），字段默认是 \`public static final\`（即常量）。

\`\`\`java
interface Comparable {
    int compareTo(Object other); // 隐式 public abstract
    int MAX = 100;               // 隐式 public static final
}
\`\`\`

类使用 \`implements\` 实现接口，**必须实现接口的所有抽象方法**。一个类可以同时 \`extends\` 一个父类并 \`implements\` 多个接口。

### 三、接口与抽象类的区别

这是面试和设计中都极重要的问题，对比如下：

| 维度 | 抽象类 | 接口 |
| --- | --- | --- |
| **关键字** | \`abstract class\` | \`interface\` |
| **继承关系** | 单继承（一个子类只能有一个父类） | 多实现（一个类可实现多个接口） |
| **构造方法** | 有 | 无 |
| **字段** | 可有各种类型字段 | 只能是 \`public static final\` 常量 |
| **方法** | 可有抽象和具体方法 | Java 8 前全为抽象方法 |
| **访问修饰符** | 任意 | 默认 public |
| **设计语义** | "是什么"（is-a，身份关系） | "能做什么"（can-do，能力契约） |

经验：当多个类有**共同字段和部分公共实现**时用抽象类；当需要定义**跨类型的行为契约**时用接口。

### 四、default 方法（Java 8+）

Java 8 允许在接口中用 \`default\` 修饰方法并提供默认实现。它的主要目的是**向后兼容**——为已有接口添加方法时，不必强迫所有实现类都修改。

\`\`\`java
interface Comparable {
    int compareTo(Object other);
    // default 方法：有方法体，实现类可直接使用或覆盖
    default void describe() {
        System.out.println("可比较对象");
    }
}
\`\`\`

当一个类实现的多个接口有同名 default 方法时，会引发**冲突**，必须在子类中显式重写解决。

### 五、接口中的 static 方法（Java 8+）

接口也可以定义 \`static\` 方法，属于接口本身，通过**接口名**调用，常用于放置工具方法。

\`\`\`java
interface Comparable {
    static void printVersion() { System.out.println("v1.0"); }
}
Comparable.printVersion(); // 通过接口名调用
\`\`\`

### 六、多接口实现

Java 虽然单继承类，但可以**实现多个接口**，这是 Java 解决"多重继承"问题的方式，既获得多继承的灵活性又避免了"菱形继承"带来的复杂度。

\`\`\`java
class Circle extends Shape implements Comparable, Drawable {
    // 同时继承抽象类并实现两个接口
}
\`\`\`

### 七、函数式接口（@FunctionalInterface）

**函数式接口**指**有且仅有一个抽象方法**的接口（default、static 方法不计）。它可以用 \`@FunctionalInterface\` 注解标注，是 Lambda 表达式的基础。

\`\`\`java
@FunctionalInterface
interface Runnable {
    void run();
}
// 用 Lambda 创建实例
Runnable r = () -> System.out.println("运行");
\`\`\`

\`@FunctionalInterface\` 让编译器强制校验"只有一个抽象方法"，防止后续误添加方法破坏函数式语义。JDK 中常见的函数式接口有 \`Runnable\`、\`Comparator\`、\`Callable\` 以及 \`java.util.function\` 包下的 \`Function\`、\`Predicate\`、\`Consumer\`、\`Supplier\` 等。

下面通过自定义 \`Comparable\` 接口与 \`Shape\` 抽象类，演示接口实现、抽象类继承、default 方法、static 方法与多接口组合。`,
    code: `// ============================================================
// 第八章代码演示：接口与抽象类
// ============================================================
public class Main {
    public static void main(String[] args) {
        // 1. 接口实现类的使用：向上转型为接口类型
        Comparable c1 = new Student("张三", 90);
        Comparable c2 = new Student("李四", 85);
        int result = c1.compareTo(c2);
        if (result > 0) {
            System.out.println("张三分数更高");
        } else if (result < 0) {
            System.out.println("李四分数更高");
        } else {
            System.out.println("两人分数相同");
        }

        // 2. 抽象类的使用：通过具体子类实例化
        Shape circle = new Circle(5);
        Shape rect = new Rectangle(4, 6);
        circle.showInfo();
        rect.showInfo();

        // 3. 调用接口的 static 方法（通过接口名）
        Comparable.printVersion();

        // 4. 调用接口的 default 方法
        Student s = new Student("王五", 70);
        s.describe();
    }
}

// 自定义接口 Comparable：演示抽象方法 + default 方法 + static 方法
interface Comparable {
    // 抽象方法：实现类必须实现（隐式 public abstract）
    int compareTo(Object other);

    // default 方法（Java 8+）：提供默认实现，可被实现类覆盖
    default void describe() {
        System.out.println("这是一个可比较的对象");
    }

    // static 方法（Java 8+）：通过接口名调用的工具方法
    static void printVersion() {
        System.out.println("Comparable 接口 v1.0");
    }
}

// 抽象类 Shape：演示 abstract 类与 abstract 方法
abstract class Shape {
    protected String name;

    public Shape(String name) {
        this.name = name;
    }

    // 抽象方法：子类必须实现
    public abstract double area();

    // 普通方法：子类可直接继承使用
    public void showInfo() {
        System.out.println(name + "的面积是:" + String.format("%.2f", area()));
    }
}

// Circle 继承抽象类 Shape 并实现接口 Comparable（继承 + 多接口组合）
class Circle extends Shape implements Comparable {
    private double radius;

    public Circle(double radius) {
        super("圆形"); // 调用父类构造方法
        this.radius = radius;
    }

    // 实现抽象类中的抽象方法
    @Override
    public double area() {
        return Math.PI * radius * radius;
    }

    // 实现接口中的抽象方法：按面积比较
    @Override
    public int compareTo(Object other) {
        if (other instanceof Shape) {
            double diff = this.area() - ((Shape) other).area();
            return diff > 0 ? 1 : (diff < 0 ? -1 : 0);
        }
        return 0;
    }
}

// Rectangle 同样继承 Shape 并实现 Comparable
class Rectangle extends Shape implements Comparable {
    private double width;
    private double height;

    public Rectangle(double width, double height) {
        super("矩形");
        this.width = width;
        this.height = height;
    }

    @Override
    public double area() {
        return width * height;
    }

    @Override
    public int compareTo(Object other) {
        if (other instanceof Shape) {
            double diff = this.area() - ((Shape) other).area();
            return diff > 0 ? 1 : (diff < 0 ? -1 : 0);
        }
        return 0;
    }
}

// Student 实现接口 Comparable，演示覆盖 default 方法
class Student implements Comparable {
    private String name;
    private int score;

    public Student(String name, int score) {
        this.name = name;
        this.score = score;
    }

    // 实现接口抽象方法：按分数比较
    @Override
    public int compareTo(Object other) {
        if (other instanceof Student) {
            return this.score - ((Student) other).score;
        }
        return 0;
    }

    // 覆盖接口的 default 方法，提供更具体的描述
    @Override
    public void describe() {
        System.out.println("学生" + name + "，分数" + score);
    }
}`,
  },

  // =========================================================
  // 第九章：异常处理
  // =========================================================
  {
    id: "java-exceptions",
    group: "面向对象",
    icon: "⚠️",
    title: "异常处理",
    content: `## 异常处理

**异常（Exception）** 是程序运行时出现的非正常情况。良好的异常处理能让程序在出错时**优雅降级**而不是直接崩溃。Java 采用"异常对象 + try-catch 机制"来处理错误，这是一套类型安全的错误处理体系，比返回错误码更结构化。

### 一、异常体系结构

Java 所有异常的根类是 \`java.lang.Throwable\`，它有两个重要分支：

| 分支 | 含义 | 示例 |
| --- | --- | --- |
| **Error** | 严重错误，程序通常无法恢复 | \`OutOfMemoryError\`、\`StackOverflowError\` |
| **Exception** | 程序可处理的异常 | \`NullPointerException\`、\`IOException\` |

\`Exception\` 又分两类：

- **受检异常（Checked Exception）**：继承 \`Exception\` 但非 \`RuntimeException\`，**编译器强制处理**（必须 try-catch 或 throws），如 \`IOException\`、\`SQLException\`。
- **非受检异常（Unchecked Exception）**：继承 \`RuntimeException\`，编译器**不强制处理**，通常是编程错误，如 \`NullPointerException\`、\`ArithmeticException\`。

### 二、常见异常一览

| 异常 | 触发场景 |
| --- | --- |
| \`NullPointerException\` | 对 null 引用调用方法/字段 |
| \`ArrayIndexOutOfBoundsException\` | 数组下标越界 |
| \`ArithmeticException\` | 算术错误，如除以零（整数） |
| \`ClassCastException\` | 错误的类型转换 |
| \`NumberFormatException\` | 字符串转数字失败 |
| \`IllegalArgumentException\` | 传入非法参数 |
| \`IOException\` | 输入输出错误（受检） |

### 三、try-catch-finally

异常处理的基本结构：

\`\`\`java
try {
    // 可能抛出异常的代码
} catch (SpecificException e) {
    // 捕获并处理特定异常
} catch (Exception e) {
    // 捕获更通用的异常（必须放在后面）
} finally {
    // 无论是否异常都会执行（常用于释放资源）
}
\`\`\`

规则：
- **catch 顺序从具体到一般**，父类异常不能写在子类前面。
- **finally 总会执行**（即使 try 中 return），除非 \`System.exit()\` 或 JVM 崩溃。
- \`finally\` 中的 return 会"吞掉" try 中的 return 和异常，应避免在 finally 中 return。

### 四、throw 与 throws

两者都和异常抛出有关，但用法不同：

| 关键字 | 作用位置 | 含义 |
| --- | --- | --- |
| \`throw\` | 方法体内 | **主动抛出**一个异常对象 |
| \`throws\` | 方法签名上 | **声明**本方法可能抛出的受检异常，交给调用者处理 |

\`\`\`java
// throws 声明可能抛出的受检异常
public void readFile(String path) throws IOException { ... }
// throw 主动抛出
if (age < 0) throw new IllegalArgumentException("年龄非法");
\`\`\`

### 五、自定义异常

业务中常通过继承 \`Exception\`（受检）或 \`RuntimeException\`（非受检）来定义自己的异常类，让错误信息更贴合业务语义。

\`\`\`java
class InvalidAgeException extends Exception {
    public InvalidAgeException(String msg) { super(msg); }
}
\`\`\`

### 六、multi-catch（Java 7+）

当多种异常处理方式相同时，可以用 \`|\` 合并捕获，减少重复代码：

\`\`\`java
try { ... }
catch (NullPointerException | ArithmeticException e) {
    // e 隐式为 final，不可重新赋值
}
\`\`\`

### 七、try-with-resources（Java 7+）

对于实现了 \`AutoCloseable\` 接口的资源（文件、数据库连接、Socket 等），可以使用 **try-with-resources** 语法，**自动调用 close()**，无论是否发生异常都会关闭，比手写 finally 更安全简洁。

\`\`\`java
try (MyResource res = new MyResource("文件.txt")) {
    res.doWork();
} // 此处自动调用 res.close()
\`\`\`

相比手写 finally 的优势：
- **自动关闭**，不会忘记释放资源。
- **异常抑制**：如果 try 块和 close 都抛异常，close 的异常会被自动抑制并加到 try 异常的 \`getSuppressed()\` 中。
- 多个资源可在 \`try(...)\` 中用分号声明，**关闭顺序与声明顺序相反**。

### 八、异常处理最佳实践

1. **捕获你能处理的异常**，不要为捕获而捕获空 catch。
2. **不要用异常控制流程**，异常开销比条件判断大得多。
3. 受检异常用于**可恢复**情况，非受检异常用于**编程错误**。
4. 自定义异常提供**有意义的错误信息**，便于排查。
5. 优先使用 try-with-resources 管理资源。

下面代码演示 try-catch-finally、multi-catch、自定义异常与 try-with-resources。`,
    code: `// ============================================================
// 第九章代码演示：异常处理
// ============================================================
public class Main {
    public static void main(String[] args) {
        // ---- 1. try-catch-finally 基本结构 ----
        System.out.println("===== 1. try-catch-finally =====");
        try {
            int[] arr = new int[3];
            arr[5] = 10; // 数组越界访问，抛出异常
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("捕获到越界异常:" + e.getMessage());
        } finally {
            // finally 块无论是否发生异常都会执行
            System.out.println("finally 块总是执行");
        }

        // ---- 2. multi-catch 多异常合并捕获 ----
        System.out.println("\\n===== 2. multi-catch =====");
        try {
            String s = null;
            s.length(); // 对 null 调用方法，抛出空指针异常
        } catch (NullPointerException | ArithmeticException e) {
            // 多种异常用 | 合并，处理方式相同
            System.out.println("捕获到异常:" + e.getClass().getSimpleName());
        }

        // ---- 3. 自定义异常与 throw / throws ----
        System.out.println("\\n===== 3. 自定义异常 =====");
        try {
            checkAge(-5); // 调用声明了 throws 的方法
        } catch (InvalidAgeException e) {
            System.out.println("捕获自定义异常:" + e.getMessage());
        }

        // ---- 4. try-with-resources 自动关闭资源 ----
        System.out.println("\\n===== 4. try-with-resources =====");
        // 资源对象在 try 结束时自动调用 close()，无需手写 finally
        try (MyResource res = new MyResource("文件.txt")) {
            res.doWork();
        } catch (Exception e) {
            System.out.println("处理资源使用中的异常:" + e.getMessage());
        }

        System.out.println("程序正常结束");
    }

    // throws 声明可能抛出的受检异常，交由调用者处理
    public static void checkAge(int age) throws InvalidAgeException {
        if (age < 0) {
            // throw 主动抛出一个异常对象
            throw new InvalidAgeException("年龄不能为负数:" + age);
        }
        System.out.println("年龄合法:" + age);
    }
}

// 自定义受检异常：继承 Exception
class InvalidAgeException extends Exception {
    public InvalidAgeException(String message) {
        // 调用父类构造方法保存错误信息
        super(message);
    }
}

// 自定义资源类：实现 AutoCloseable 以支持 try-with-resources
class MyResource implements AutoCloseable {
    private String name;

    public MyResource(String name) {
        this.name = name;
        System.out.println("打开资源:" + name);
    }

    public void doWork() {
        System.out.println("使用资源:" + name + " 进行工作");
    }

    // try-with-resources 会自动调用此方法关闭资源
    @Override
    public void close() {
        System.out.println("自动关闭资源:" + name);
    }
}`,
  },

  // =========================================================
  // 第十章：集合框架
  // =========================================================
  {
    id: "java-collections",
    group: "面向对象",
    icon: "🗃️",
    title: "集合框架",
    content: `## 集合框架

**Java 集合框架（Java Collections Framework, JCF）** 是一组用来存储和操作对象的数据结构。与数组相比，集合**容量可动态变化**，并提供丰富的增删改查算法。它位于 \`java.util\` 包下，是 Java 工程中最常用的 API 之一。

### 一、集合体系总览

集合框架的两大根接口是 \`Collection\` 和 \`Map\`：

| 接口 | 特点 | 主要实现 |
| --- | --- | --- |
| **List** | 有序、可重复、可通过索引访问 | \`ArrayList\`、\`LinkedList\` |
| **Set** | 无序（或有序）、不可重复 | \`HashSet\`、\`TreeSet\`、\`LinkedHashSet\` |
| **Queue/Deque** | 队列/双端队列 | \`ArrayDeque\`、\`LinkedList\` |
| **Map** | 键值对，键不可重复 | \`HashMap\`、\`TreeMap\`、\`LinkedHashMap\` |

\`Collection\` 接口继承自 \`Iterable\`，所以所有集合都支持增强 for 循环和迭代器。

### 二、List 接口

\`List\` 是**有序、可重复**的集合，可按索引精确访问。

| 实现 | 底层结构 | 特点 | 适用场景 |
| --- | --- | --- | --- |
| **ArrayList** | 动态数组 | 随机访问快 O(1)，插入删除慢 O(n) | 读多写少 |
| **LinkedList** | 双向链表 | 插入删除快 O(1)，随机访问慢 O(n) | 频繁增删 |

\`\`\`java
List<String> list = new ArrayList<>();
list.add("Java");          // 末尾添加
list.add(0, "Go");         // 指定位置插入
list.set(1, "Python3");    // 修改元素
list.remove(0);            // 按索引删除
String s = list.get(0);    // 按索引获取
int size = list.size();    // 元素个数
\`\`\`

### 三、Set 接口

\`Set\` 是**不可重复**的集合，常用于去重。

| 实现 | 特点 |
| --- | --- |
| **HashSet** | 基于 HashMap，无序，查找 O(1)，最常用 |
| **TreeSet** | 基于红黑树，元素自然排序或自定义排序 |
| **LinkedHashSet** | 保留插入顺序 |

判断重复的依据：先调 \`hashCode()\`，哈希相同再调 \`equals()\`。因此**存入 Set 的对象需正确重写 hashCode 和 equals**。

### 四、Map 接口

\`Map\` 是**键值对**映射，键不可重复，一个键最多对应一个值。

| 实现 | 特点 |
| --- | --- |
| **HashMap** | 基于哈希表，无序，允许一个 null 键和多个 null 值，最常用 |
| **TreeMap** | 基于红黑树，键自然排序或自定义排序 |
| **LinkedHashMap** | 保留插入顺序（或访问顺序） |

\`\`\`java
Map<String, Integer> map = new HashMap<>();
map.put("Java", 1995);          // 添加/覆盖键值对
int year = map.get("Java");     // 按 key 取值
map.remove("Java");             // 删除
map.containsKey("Java");        // 是否包含 key
map.keySet();                   // 所有键
map.values();                   // 所有值
\`\`\`

### 五、Iterator 迭代器

\`Iterator\` 是遍历集合的统一工具，比索引遍历更通用，且支持**安全删除**元素。所有 \`Collection\` 都可通过 \`iterator()\` 获取迭代器。

\`\`\`java
Iterator<String> it = list.iterator();
while (it.hasNext()) {        // 是否还有下一个
    String s = it.next();     // 取下一个
    if (s.isEmpty()) it.remove(); // 安全删除当前元素
}
\`\`\`

> 注意：在增强 for 循环中直接调集合的 \`remove\` 会抛 \`ConcurrentModificationException\`，必须用迭代器的 \`remove()\`。

### 六、Collections 工具类

\`java.util.Collections\`（注意带 s）是操作集合的**工具类**，提供静态方法：

| 方法 | 作用 |
| --- | --- |
| \`sort(list)\` | 对 List 排序 |
| \`reverse(list)\` | 反转顺序 |
| \`shuffle(list)\` | 随机打乱 |
| \`max/min(coll)\` | 求最大/最小 |
| \`frequency(coll, obj)\` | 统计元素出现次数 |
| \`unmodifiableList(...)\` | 返回不可修改的视图 |

### 七、泛型简介

**泛型（Generics）** 让集合能指定元素类型，带来两大好处：
1. **编译期类型检查**：错误类型在编译时就被发现，避免运行时 \`ClassCastException\`。
2. **消除强制转换**：取元素时无需手动 cast。

\`\`\`java
// 不用泛型（不推荐）
List list = new ArrayList();
list.add("abc");
Integer n = (Integer) list.get(0); // 运行时 ClassCastException

// 使用泛型（推荐）
List<String> list2 = new ArrayList<>();
list2.add("abc");
// list2.add(123); // 编译报错，类型安全
String s = list2.get(0); // 无需强转
\`\`\`

注意：JDK 7 起支持"菱形语法"\`new ArrayList<>()\`，右侧尖括号可留空。

下面代码演示 ArrayList、HashMap、HashSet 的增删改查与多种遍历方式。`,
    code: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

// ============================================================
// 第十章代码演示：集合框架 —— ArrayList / HashSet / HashMap
// ============================================================
public class Main {
    public static void main(String[] args) {
        // ---- 1. ArrayList：有序、可重复、动态数组 ----
        System.out.println("===== 1. ArrayList =====");
        List<String> list = new ArrayList<>(); // 菱形语法，类型安全
        list.add("Java");
        list.add("Python");
        list.add("Go");
        list.add("Java");           // List 允许重复元素
        System.out.println("初始列表:" + list);

        // 修改元素：按索引
        list.set(1, "Python3");
        // 删除元素：按对象
        list.remove("Go");
        System.out.println("修改删除后:" + list);
        System.out.println("第 0 个元素:" + list.get(0));
        System.out.println("列表大小:" + list.size());

        // 遍历方式一：增强 for 循环（底层用迭代器）
        System.out.print("遍历结果:");
        for (String s : list) {
            System.out.print(s + " ");
        }
        System.out.println();

        // ---- 2. HashSet：无序、不可重复 ----
        System.out.println("\\n===== 2. HashSet =====");
        Set<Integer> set = new HashSet<>();
        set.add(10);
        set.add(20);
        set.add(10);                 // 重复元素不会被加入
        set.add(30);
        System.out.println("集合内容:" + set);
        System.out.println("包含 20 吗:" + set.contains(20));
        set.remove(10);              // 删除元素
        System.out.println("删除 10 后:" + set);
        System.out.println("集合大小:" + set.size());

        // ---- 3. HashMap：键值对，键不可重复 ----
        System.out.println("\\n===== 3. HashMap =====");
        Map<String, Integer> map = new HashMap<>();
        map.put("Java", 1995);
        map.put("Python", 1991);
        map.put("Go", 2009);
        map.put("Java", 1996);       // 键重复，新值覆盖旧值
        System.out.println("映射内容:" + map);
        System.out.println("Java 创建年份:" + map.get("Java"));
        System.out.println("键集合:" + map.keySet());
        System.out.println("值集合:" + map.values());

        // 遍历方式：通过 entrySet 同时拿到键和值
        System.out.println("遍历映射:");
        for (Map.Entry<String, Integer> entry : map.entrySet()) {
            System.out.println("  " + entry.getKey() + " -> " + entry.getValue());
        }

        // ---- 4. 泛型简介：编译期类型安全 ----
        System.out.println("\\n===== 4. 泛型优势 =====");
        // 指定元素类型为 Integer，编译器会检查类型，避免运行时异常
        List<Integer> nums = new ArrayList<>();
        nums.add(1);
        nums.add(2);
        // nums.add("三"); // 编译报错，类型安全
        int sum = 0;
        for (int n : nums) {         // 自动拆箱，Integer -> int
            sum += n;
        }
        System.out.println("求和结果:" + sum);
    }
}`,
  },
];
