// =============================================================
// Java 交互式教程 —— 第九批章节（继承与多态深入组，共 15 章）
// =============================================================

export const chapters = [
  {
    id: "java-extends-deep",
    group: "继承与多态深入",
    icon: "🔗",
    title: "extends 深入",
    content: `# extends 深入

Java 使用 \`extends\` 关键字实现类的继承，子类可以获得父类的成员并扩展功能。继承是面向对象的核心特性之一，但 Java 在继承上有一些重要限制。

## 单继承限制

Java 类**只支持单继承**：一个类最多只能有一个直接父类。这与 C++ 的多继承不同，目的是简化对象模型、避免"菱形继承"的复杂性。要实现类似多继承的效果，可以使用接口（一个类可实现多个接口）。

\`\`\`java
class Dog extends Animal { }      // 合法
// class Dog extends Animal, Mammal { } // 编译错误：只能单继承
\`\`\`

## 子类继承父类哪些成员

并非所有成员都会被子类继承：

- **public / protected 成员**：继承，子类可直接访问
- **默认（包级）成员**：同包时继承，跨包不继承
- **private 成员**：**不继承**（子类无法直接访问，但可通过继承的 public 方法间接访问）。注意 private 字段实际存在于子类对象内存中，只是不可见
- **构造方法**：**不继承**，因为构造方法名必须与类名相同，子类有自己的构造方法
- **静态成员**：属于类级别，子类可访问（严格说是"共享"而非"继承"）

## 继承层次

继承可以形成多层层次结构，例如 \`Object → Animal → Dog → Puppy\`。子类不仅继承直接父类，还间接继承所有祖先类的可继承成员。

## Object 是根类

所有类都隐式或显式地继承 \`java.lang.Object\`。如果一个类没有用 \`extends\` 声明父类，编译器会自动让它继承 \`Object\`。因此 \`Object\` 的方法（\`toString\`、\`equals\`、\`hashCode\` 等）对每个类都可用。

\`\`\`java
class A { }            // 等价于 class A extends Object { }
Object o = new A();    // 任何对象都可赋给 Object 引用
\`\`\`

## 构造方法与继承

构造方法虽然不继承，但子类构造方法必须通过 \`super()\` 调用父类构造方法完成父类部分初始化。如果子类构造方法首行没有显式 \`super()\`，编译器会自动插入无参 \`super()\`。这意味着父类必须有无参构造，否则子类构造必须显式调用父类的有参构造：

\`\`\`java
class Animal {
    public Animal(String name) { }  // 只有有参构造
}
class Dog extends Animal {
    public Dog() {
        super("无名"); // 必须显式调用，否则编译错误
    }
}
\`\`\`

## 多层继承层次

继承可形成多层链：\`Object → Animal → Mammal → Dog\`。子类对象包含所有祖先类的字段，构造时从最顶层 \`Object\` 开始逐层向下初始化，保证每一层在使用前已就绪。

## 何时使用继承

只有当存在真正的 is-a（是一个）关系时才用继承。如果只是想复用代码，组合（has-a）往往更合适。滥用继承会导致层次臃肿、父子类强耦合、父类内部变化波及子类。继承应当用于"特化"而非"复用"。

例如"汽车是一个交通工具"适合继承，"汽车有一个发动机"适合组合。判断标准：能否说"B 是一个 A"且 B 在任何 A 出现的地方都能无差别使用（里氏替换原则）。

下面通过代码演示继承关系与成员可见性：`,
    code: `// 演示继承关系：子类继承父类的哪些成员
public class Main {
    public static void main(String[] args) {
        Dog dog = new Dog("旺财", 3, "金毛");
        dog.showInfo();   // 调用继承自父类的方法
        dog.bark();       // 子类特有方法
        dog.eat();        // 重写的方法

        // 所有类的根类都是 Object
        System.out.println("运行时类: " + dog.getClass().getName());
        System.out.println("是 Object 吗: " + (dog instanceof Object));
        System.out.println("是 Animal 吗: " + (dog instanceof Animal));
    }
}

// 父类（隐式继承 Object）
class Animal {
    private String name;          // private：不继承（子类不可直接访问）
    protected int age;            // protected：继承
    String type = "动物";         // 默认包级：继承

    // 构造方法：不继承
    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {     // public 方法：继承
        return name;
    }

    public void eat() {           // 可被重写
        System.out.println(getName() + " 正在吃东西");
    }
}

// 子类：单继承
class Dog extends Animal {
    private String breed;

    public Dog(String name, int age, String breed) {
        super(name, age);         // 必须调用父类构造
        this.breed = breed;
    }

    public void bark() {
        // System.out.println(name); // 编译错误：name 是 private
        System.out.println(getName() + " 汪汪叫"); // 通过继承的 getter 访问
    }

    @Override
    public void eat() {
        System.out.println(getName() + " 在啃骨头");
    }

    public void showInfo() {
        System.out.println("名字: " + getName() + ", 年龄: " + age + ", 品种: " + breed);
    }
}`
  },
  {
    id: "java-super-keyword",
    group: "继承与多态深入",
    icon: "⬆️",
    title: "super 关键字",
    content: `# super 关键字

\`super\` 是一个隐式引用，指向**当前对象的父类部分**。它用于在子类中访问父类的字段、方法和构造方法，解决继承带来的同名遮蔽问题。

## super.字段

当子类定义了与父类同名的字段（字段隐藏）时，用 \`super.字段\` 访问父类字段：

\`\`\`java
class Parent { String name = "父"; }
class Child extends Parent {
    String name = "子";
    void show() {
        System.out.println(name);        // 子
        System.out.println(super.name);  // 父
    }
}
\`\`\`

## super.方法()

子类重写父类方法后，若想调用父类被重写的版本，使用 \`super.方法()\`。这在扩展父类功能时非常常见——先执行父类逻辑，再添加子类逻辑。

## super() 构造调用

在子类构造方法中，可以用 \`super(参数)\` 调用父类的构造方法。**必须放在构造方法的第一行**。如果子类构造方法没有显式调用 \`super()\`，编译器会自动插入无参的 \`super()\`（前提是父类有无参构造）。

\`\`\`java
class Child extends Parent {
    public Child() {
        super();        // 显式调用父类无参构造，必须第一行
        // 其他初始化
    }
}
\`\`\`

## super 链

构造方法调用会沿继承链向上传递，直到 \`Object\` 的构造方法。即创建子类对象时，会先执行最顶层父类的构造方法，逐层向下执行。这保证父类部分先被正确初始化。

## super 与 this 对比

| 特性 | this | super |
|------|------|-------|
| 指向 | 当前对象 | 父类对象部分 |
| 访问字段 | 本类字段 | 父类字段（绕过隐藏） |
| 调用方法 | 本类方法 | 父类被重写方法 |
| 构造调用 | this() 调本类构造 | super() 调父类构造 |
| 是否为真实引用 | 是 | 不是（编译期指示） |

## super() 的使用规则

- \`super()\` 必须是构造方法的**第一条语句**（与 \`this()\` 一样）
- \`super()\` 与 \`this()\` 不能同时出现在同一构造方法中
- 若子类构造未显式调用 \`super()\` 或 \`this()\`，编译器自动插入无参 \`super()\`
- 父类若没有无参构造，子类必须显式调用父类的有参构造

## super 链与构造顺序

创建子类对象时，构造调用沿继承链向上传递：先执行 \`Object\` 构造，再逐层向下执行各父类构造，最后执行子类构造体。这保证父类字段在子类方法使用前已初始化。

\`\`\`java
new Dog() 的执行顺序:
Object() → Animal() → Mammal() → Dog()
\`\`\`

## super 不是真实引用

与 \`this\` 不同，\`super\` 并非一个真实的对象引用，而是编译器的一个指示：告诉编译器"按父类的方式来解析字段/方法"。因此 \`super.super\` 非法——不能跳级访问祖父类，这会破坏封装。

下面通过代码演示 super 的各种用法：`,
    code: `// 演示 super 关键字的各种用法
public class Main {
    public static void main(String[] args) {
        Manager m = new Manager("张三", 8000, 2000);
        m.introduce();      // 调用本类方法，内部使用 super.字段和 super.方法
        System.out.println("总薪资: " + m.totalSalary());

        // 验证构造方法链：父类构造先执行
        System.out.println("\\n--- 创建对象时构造链顺序 ---");
        Child c = new Child();
    }
}

// 父类
class Employee {
    String name = "员工";       // 父类字段
    int salary;

    public Employee() {
        System.out.println("Employee 无参构造");
    }

    public Employee(String name, int salary) {
        System.out.println("Employee 有参构造");
        this.name = name;
        this.salary = salary;
    }

    public void work() {
        System.out.println(name + " 正在工作");
    }
}

// 子类
class Manager extends Employee {
    String name = "经理";       // 隐藏父类 name 字段
    int bonus;

    public Manager(String name, int salary, int bonus) {
        super(name, salary);    // 必须第一行：调用父类有参构造
        this.bonus = bonus;
        System.out.println("Manager 构造完成");
    }

    public void introduce() {
        System.out.println("this.name = " + this.name);     // 子类字段
        System.out.println("super.name = " + super.name);   // 父类字段
        super.work();           // 调用父类方法
        work();                 // 调用本类方法
    }

    @Override
    public void work() {
        System.out.println(super.name + " 正在管理团队");
    }

    public int totalSalary() {
        return super.salary + this.bonus; // salary 继承自父类
    }
}

// 用于演示构造链
class Parent {
    public Parent() { System.out.println("Parent 构造"); }
}

class Child extends Parent {
    public Child() {
        // 编译器自动插入 super();
        System.out.println("Child 构造");
    }
}`
  },
  {
    id: "java-override-rules",
    group: "继承与多态深入",
    icon: "📝",
    title: "方法重写规则",
    content: `# 方法重写规则

方法重写（Override）是指子类重新定义从父类继承的实例方法，以提供特定实现。重写是多态的基础。

## @Override 注解

\`@Override\` 是一个编译期注解，标注一个方法意图重写父类方法。它的作用：

- 让编译器检查方法签名是否真的重写了父类方法（避免拼写错误导致"重载"而非"重写"）
- 提高代码可读性，明确表达重写意图
- 父类方法签名变化时及时报错

**强烈建议**每次重写都加上 \`@Override\`。

## 重写规则

1. **方法签名相同**：方法名和参数列表必须与父类一致
2. **返回类型协变**：子类重写方法的返回类型可以是父类返回类型的子类型（协变返回）。例如父类返回 \`Animal\`，子类可返回 \`Dog\`
3. **不能降低可见性**：父类 protected 方法，子类可重写为 public，但不能改为 private
4. **不能抛出更宽的检查异常**：子类重写方法抛出的检查异常必须是父类方法声明异常的子类或相同，不能抛出更宽的异常。不检查异常（RuntimeException）无此限制
5. **不能重写 final 方法**、**不能重写 static 方法**（static 方法是隐藏而非重写）
6. **不能重写 private 方法**（private 不继承，谈不上重写）

## 重写 vs 隐藏

- **实例方法重写（Override）**：基于运行时类型动态分派，体现多态
- **静态方法隐藏（Hide）**：基于编译时类型静态绑定，不体现多态

\`\`\`java
class Parent {
    static void s() { System.out.println("父静态"); }
    void i() { System.out.println("父实例"); }
}
class Child extends Parent {
    static void s() { System.out.println("子静态"); } // 隐藏
    void i() { System.out.println("子实例"); }        // 重写
}
Parent p = new Child();
p.s(); // 父静态（隐藏，看编译类型）
p.i(); // 子实例（重写，看运行类型）
\`\`\`

## 访问修饰符与异常的细节

访问修饰符只能**放宽**不能收紧：父类 protected → 子类 public 合法；父类 public → 子类 protected 非法。

检查异常只能**收窄**不能放宽：父类声明 \`throws IOException\`，子类可声明 \`throws FileNotFoundException\`（更窄）或抛更少异常，但不能声明 \`throws Exception\`（更宽）。RuntimeException 不受此限制，因为它是非检查异常。

\`\`\`java
class Parent {
    protected void work() throws IOException { }
}
class Child extends Parent {
    @Override
    public void work() throws FileNotFoundException { } // 放宽可见 + 收窄异常
}
\`\`\`

## 不能重写的情况

- **final 方法**：禁止重写，保证行为不变
- **private 方法**：对子类不可见，子类同名方法是全新方法而非重写
- **static 方法**：隐藏（hide）而非重写（override），基于编译类型绑定
- **字段**：隐藏而非重写，不参与多态

下面通过代码演示方法重写规则：`,
    code: `// 演示方法重写规则与协变返回
public class Main {
    public static void main(String[] args) {
        Animal a = new Dog();
        a.speak();              // 动态分派：调用 Dog 的 speak

        // 协变返回类型
        AnimalFactory factory = new DogFactory();
        Animal animal = factory.create(); // 返回 Dog，赋给 Animal
        System.out.println("工厂创建: " + animal.getClass().getSimpleName());

        // 重写 vs 隐藏
        System.out.println("\\n--- 静态隐藏 vs 实例重写 ---");
        Base b = new Sub();
        b.staticMethod();       // 隐藏：调用 Base 的静态方法
        b.instanceMethod();     // 重写：调用 Sub 的实例方法
    }
}

// 演示协变返回类型
class Animal {
    public Animal create() {
        return new Animal();
    }
    public void speak() {
        System.out.println("动物发出声音");
    }
}

class Dog extends Animal {
    @Override
    // 协变返回：父类返回 Animal，子类返回 Dog（Animal 的子类）
    public Dog create() {
        return new Dog();
    }

    @Override
    public void speak() {
        System.out.println("狗汪汪叫");
    }
}

// 工厂演示协变
class AnimalFactory {
    public Animal create() { return new Animal(); }
}
class DogFactory extends AnimalFactory {
    @Override
    public Dog create() { return new Dog(); } // 协变返回
}

// 演示重写 vs 隐藏
class Base {
    public static void staticMethod() {
        System.out.println("Base 静态方法");
    }
    public void instanceMethod() {
        System.out.println("Base 实例方法");
    }
}

class Sub extends Base {
    public static void staticMethod() {
        System.out.println("Sub 静态方法（隐藏，非重写）");
    }
    @Override
    public void instanceMethod() {
        System.out.println("Sub 实例方法（重写）");
    }
}`
  },
  {
    id: "java-polymorphism",
    group: "继承与多态深入",
    icon: "🎭",
    title: "多态机制",
    content: `# 多态机制

多态（Polymorphism）指同一消息发送给不同对象时，产生不同的行为。Java 的多态主要通过**动态绑定**实现：运行时根据对象的实际类型决定调用哪个方法。

## 虚方法调用

在 Java 中，实例方法默认是"虚方法"（除非是 final 或 private）。当通过父类引用调用一个被重写的方法时，JVM 在运行时根据对象的**实际类型**查找并调用对应的方法实现，这就是动态分派。

\`\`\`java
Animal a = new Dog();
a.speak(); // 运行时调用 Dog.speak()，而非 Animal.speak()
\`\`\`

## 多态三要素

实现多态需要三个条件：

1. **继承**：子类继承父类（或实现接口）
2. **重写**：子类重写父类的方法
3. **父类引用指向子类对象**：\`Parent p = new Child();\`（向上转型）

## 运行时类型判断

每个对象在运行时都知道自己的真实类型。\`getClass()\` 返回运行时类，\`instanceof\` 可判断是否属于某类型。JVM 的方法表（vtable）就是基于运行时类型进行方法分派的。

## 多态的威力

- **统一接口，多种实现**：用父类类型统一管理不同子类对象
- **开闭原则**：新增子类无需修改调用方代码
- **解耦**：调用方只依赖抽象，不依赖具体实现
- **集合统一处理**：可把不同子类放入 \`List<Parent>\` 统一遍历

\`\`\`java
List<Shape> shapes = List.of(new Circle(), new Square());
shapes.forEach(Shape::draw); // 各自画出，体现多态
\`\`\`

## 动态分派的底层原理

JVM 为每个类维护一张**虚方法表（vtable）**，记录该类各虚方法实际指向的字节码。当通过引用调用虚方法时，JVM 先根据对象的运行时类型找到对应的 vtable，再查表确定实际执行的方法。这种查表机制让多态的运行开销很小（通常只是几次数组访问）。

\`\`\`java
Animal a = new Dog();
a.speak(); // JVM 查 Dog 的 vtable，定位到 Dog.speak
\`\`\`

## 运行时类型 vs 编译时类型

- **编译时类型**：变量声明的类型，决定能调用哪些方法（编译期检查）
- **运行时类型**：对象实际的类型，决定虚方法调用哪个实现（运行期分派）

\`a\` 的编译时类型是 \`Animal\`，运行时类型是 \`Dog\`。编译器只允许调用 \`Animal\` 定义的方法；运行时 JVM 根据 \`Dog\` 分派。

## 多态的局限

多态只适用于**实例方法**。静态方法、字段访问都基于编译时类型绑定，不参与动态分派。在构造方法中调用可重写方法也容易引发问题（详见"多态陷阱"一章）。

## 多态的代价

多态带来灵活性，但也有开销：每次虚方法调用需查 vtable，无法被 JIT 内联（除非 JIT 通过类型继承分析确信只有一个实现）。不过现代 JVM 的逃逸分析和内联缓存让这个开销在绝大多数场景可忽略。不应为性能放弃多态，而应在热点路径实测后再优化。

实际上，多态带来的设计收益远超其性能成本：可扩展性、可维护性、可测试性都因多态而大幅提升。优先写出清晰、灵活的代码，性能问题出现后再针对性优化。

多态是设计模式（工厂、策略、模板方法等）的基石。下面通过代码演示多态机制：`,
    code: `// 演示多态机制：同一调用，不同行为
public class Main {
    public static void main(String[] args) {
        // 父类引用指向子类对象（向上转型）
        Shape[] shapes = {
            new Circle(3),
            new Rectangle(4, 5),
            new Triangle(6, 8)
        };

        // 多态：同样调用 area()，实际执行各自的实现
        double total = 0;
        for (Shape s : shapes) {
            s.draw();                       // 多态调用
            total += s.area();              // 多态调用
        }
        System.out.println("总面积: " + total);

        // 统一处理，无需关心具体类型
        printInfo(new Circle(10));
        printInfo(new Rectangle(2, 3));
    }

    // 参数为父类类型，可接收任何子类
    public static void printInfo(Shape s) {
        System.out.println(s.getClass().getSimpleName() + " 面积 = " + s.area());
    }
}

// 父类
abstract class Shape {
    public abstract double area();   // 抽象方法，子类必须重写

    public void draw() {
        System.out.println("绘制 " + getClass().getSimpleName() + "，面积 = " + area());
    }
}

// 子类：圆形
class Circle extends Shape {
    private double radius;
    public Circle(double radius) { this.radius = radius; }

    @Override
    public double area() {
        return Math.PI * radius * radius;
    }
}

// 子类：矩形
class Rectangle extends Shape {
    private double width, height;
    public Rectangle(double w, double h) { this.width = w; this.height = h; }

    @Override
    public double area() {
        return width * height;
    }
}

// 子类：三角形
class Triangle extends Shape {
    private double base, height;
    public Triangle(double b, double h) { this.base = b; this.height = h; }

    @Override
    public double area() {
        return 0.5 * base * height;
    }
}`
  },
  {
    id: "java-upcasting",
    group: "继承与多态深入",
    icon: "⬆️",
    title: "向上转型",
    content: `# 向上转型

向上转型（Upcasting）是指把子类类型的引用转换为父类类型，是 Java 中**自动进行**的隐式类型转换。

## 子类→父类自动转型

由于子类对象"是一个"父类对象（is-a 关系），把子类引用赋给父类变量是天然安全的，无需显式转换：

\`\`\`java
Animal a = new Dog();   // 向上转型，自动完成
Object o = "hello";     // String 向上转型为 Object
\`\`\`

## 安全性

向上转型是**完全安全**的：子类必然包含父类的所有可继承成员，因此通过父类引用调用的方法/字段一定存在。编译器在编译期就能保证类型安全，不会抛出 \`ClassCastException\`。

## 访问限制

向上转型后，**只能访问父类定义的成员**，子类特有的成员被"隐藏"：

- 可访问：父类的字段和方法（包括被子类重写的）
- 不可访问：子类新增的字段和方法

\`\`\`java
Animal a = new Dog();
a.eat();     // 可访问（父类定义）
// a.bark(); // 编译错误：父类没有 bark()
\`\`\`

## 多态基础

向上转型是多态的前提。只有把子类对象当作父类类型使用，再通过动态绑定调用被子类重写的方法，才能体现多态。设计模式中大量使用向上转型，让调用方依赖抽象而非具体。

\`\`\`java
List<Animal> zoo = new ArrayList<>();
zoo.add(new Dog());   // 向上转型
zoo.add(new Cat());
zoo.forEach(Animal::eat); // 多态调用
\`\`\`

## 向上转型到接口

子类实现接口后，也可向上转型为接口类型。这是面向接口编程的基础，调用方依赖接口而非实现类：

\`\`\`java
interface Runnable { void run(); }
class Task implements Runnable { public void run() { } }
Runnable r = new Task();   // 向上转型为接口
\`\`\`

## 方法参数中的向上转型

方法参数声明为父类类型时，可接收任何子类对象，这是多态最常见的应用场景。调用时实参自动向上转型：

\`\`\`java
void process(Shape s) { s.draw(); }   // 可接收任何 Shape 子类
process(new Circle());                 // Circle 自动转型为 Shape
\`\`\`

## 为什么向上转型是安全的

子类一定拥有父类的全部可继承成员，所以用父类引用访问一定不会"找不到"成员。编译器在编译期就能保证类型安全，运行时不会抛 \`ClassCastException\`。这也是向上转型可自动进行的原因。

## 向上转型与向下转型的对比

向上转型是安全的、自动的、无风险的；向下转型是不安全的、需显式的、有 \`ClassCastException\` 风险的。设计良好的代码应尽量依赖向上转型（多态），减少向下转型。当频繁需要向下转型时，通常说明抽象层次不够，应重新审视父类/接口的设计。

简言之：**能向上就不向下**。向上转型让代码依赖抽象而非具体，是开闭原则、依赖倒置原则等设计原则落地的前提。

向上转型不会改变对象本身，只改变引用的"视角"。对象运行时类型始终不变，\`a.getClass()\` 仍返回 \`Dog\`。下面通过代码演示向上转型：`,
    code: `// 演示向上转型：子类引用转为父类类型
public class Main {
    public static void main(String[] args) {
        // 向上转型：自动完成
        Vehicle v = new Car("红色", 4);
        v.run();              // 多态：调用 Car 的 run
        v.describe();         // 多态：调用 Car 的 describe

        // 访问限制：只能访问父类成员
        // v.wheels;          // 编译错误：wheels 是子类特有
        // v.openDoor();      // 编译错误：openDoor 是子类特有

        // 对象运行时类型不变
        System.out.println("编译时类型: Vehicle");
        System.out.println("运行时类型: " + v.getClass().getSimpleName());

        // 向上转型到 Object（所有类的根）
        Object obj = new Car("黑色", 2);
        System.out.println("是 Car 吗: " + (obj instanceof Car));

        // 多态基础：统一用父类类型处理
        Vehicle[] fleet = {
            new Car("白", 4),
            new Bicycle(),
            new Car("蓝", 2)
        };
        for (Vehicle vehicle : fleet) {
            vehicleService(vehicle); // 统一接口处理
        }
    }

    // 参数为父类类型，可接收任何子类
    public static void vehicleService(Vehicle v) {
        System.out.print("保养: ");
        v.run();
    }
}

// 父类
class Vehicle {
    protected String color;

    public Vehicle(String color) {
        this.color = color;
    }

    public void run() {
        System.out.println(color + " 交通工具在行驶");
    }

    public void describe() {
        System.out.println("颜色: " + color);
    }
}

// 子类：汽车
class Car extends Vehicle {
    private int wheels;

    public Car(String color, int wheels) {
        super(color);
        this.wheels = wheels;
    }

    public void openDoor() {        // 子类特有方法
        System.out.println("开门");
    }

    @Override
    public void run() {
        System.out.println(color + " " + wheels + "轮汽车飞驰");
    }

    @Override
    public void describe() {
        System.out.println("汽车[颜色=" + color + ", 轮数=" + wheels + "]");
    }
}

// 子类：自行车
class Bicycle extends Vehicle {
    public Bicycle() {
        super("绿色");
    }

    @Override
    public void run() {
        System.out.println("自行车骑行中");
    }
}`
  },
  {
    id: "java-downcasting",
    group: "继承与多态深入",
    icon: "⬇️",
    title: "向下转型",
    content: `# 向下转型

向下转型（Downcasting）是把父类类型的引用强制转换为子类类型，需要**显式**写出目标类型，且存在运行时风险。

## 父类→子类强制转型

当需要访问子类特有成员时，必须把父类引用转回子类类型：

\`\`\`java
Animal a = new Dog();  // 向上转型
Dog d = (Dog) a;       // 向下转型，显式
d.bark();              // 现在可访问子类特有方法
\`\`\`

## ClassCastException

如果对象的**实际运行时类型**与目标类型不匹配，向下转型会抛出 \`ClassCastException\`：

\`\`\`java
Animal a = new Cat();
Dog d = (Dog) a;   // 运行时抛出 ClassCastException
\`\`\`

编译器只检查类型是否在继承链上（\`Animal\` 和 \`Dog\` 有继承关系），无法判断运行时实际类型，因此这类错误只能运行时暴露。

## 向下转型失败的根本原因

Java 是强类型语言，编译期类型检查保证语法合法性，但对象的实际类型只有运行时才确定。向下转型的合法性取决于对象**创建时的类型**，而非引用变量的类型。编译器无法静态判断转型是否成立，因此交给 JVM 在运行时校验，不匹配就抛 \`ClassCastException\`。

## 向下转型的两种场景

1. **安全场景**：先用 \`instanceof\` 确认类型，再转型
2. **不安全场景**：盲目转型，依赖"我确信它是某种类型"的假设，极易出错

\`\`\`java
// 安全
if (obj instanceof Dog d) { d.bark(); }
// 不安全（除非有绝对把握）
Dog d = (Dog) obj; // 若 obj 不是 Dog，运行时崩溃
\`\`\`

## instanceof 检查

向下转型前应使用 \`instanceof\` 检查对象真实类型，避免异常：

\`\`\`java
if (a instanceof Dog) {
    Dog d = (Dog) a;
    d.bark();
}
\`\`\`

## 模式匹配 instanceof（Java 16+）

Java 16 引入 \`instanceof\` 模式匹配，省去显式转型：

\`\`\`java
if (a instanceof Dog d) {   // d 已自动绑定且类型为 Dog
    d.bark();               // 无需 (Dog) a
}
\`\`\`

## 何时需要向下转型

通常在以下情况需要向下转型：

- 访问子类特有方法（父类未定义）
- 处理 \`Object\` 类型参数（如旧版 API）
- 从集合取出元素（泛型前）

但频繁向下转型往往是**设计问题**的信号——说明抽象不够。更好的做法是在父类/接口中定义足够的方法，或使用访问者模式、方法重载等避免转型。

## 避免向下转型的设计

\`\`\`java
// 反模式：依赖转型调用子类方法
for (Animal a : zoo) {
    if (a instanceof Dog d) d.bark();
    else if (a instanceof Cat c) c.meow();
}
// 更好：在父类定义 speak()，子类各自实现
for (Animal a : zoo) { a.speak(); } // 多态，无需转型
\`\`\`

模式匹配让代码更简洁、更安全，是现代 Java 推荐写法。下面通过代码演示向下转型与 instanceof：`,
    code: `// 演示向下转型与 instanceof 检查
public class Main {
    public static void main(String[] args) {
        Object[] items = { "hello", 42, 3.14, "world", 100 };

        // 1. 不安全的向下转型会抛异常
        Object obj = "test";
        try {
            Integer num = (Integer) obj; // 实际是 String，转型失败
        } catch (ClassCastException e) {
            System.out.println("转型失败: " + e.getMessage());
        }

        // 2. 安全做法：instanceof 检查后再转型
        for (Object item : items) {
            if (item instanceof String) {
                String s = (String) item;      // 安全向下转型
                System.out.println("字符串: " + s + " (长度 " + s.length() + ")");
            } else if (item instanceof Integer) {
                Integer i = (Integer) item;
                System.out.println("整数: " + i + " (平方 " + (i * i) + ")");
            }
        }

        // 3. 模式匹配 instanceof（Java 16+）：无需显式转型
        Animal[] zoo = { new Dog(), new Cat(), new Dog() };
        for (Animal a : zoo) {
            if (a instanceof Dog d) {          // d 自动绑定
                d.bark();
            } else if (a instanceof Cat c) {   // c 自动绑定
                c.meow();
            }
        }
    }
}

class Animal {
    public void eat() { System.out.println("吃东西"); }
}

class Dog extends Animal {
    public void bark() { System.out.println("汪汪!"); }
}

class Cat extends Animal {
    public void meow() { System.out.println("喵~"); }
}`
  },
  {
    id: "java-instanceof-pattern",
    group: "继承与多态深入",
    icon: "🔍",
    title: "instanceof 与模式匹配",
    content: `# instanceof 与模式匹配

\`instanceof\` 运算符用于在运行时判断对象是否属于某个类型（含子类型）。Java 16 引入的**模式匹配**版本让类型判断与变量绑定一步完成，大幅简化代码。

## 传统 instanceof

传统写法需要先判断类型，再显式转型：

\`\`\`java
if (obj instanceof String) {
    String s = (String) obj;   // 重复写 String
    System.out.println(s.length());
}
\`\`\`

这种写法繁琐且容易出错：类型名写了两次，转型容易遗漏。

## instanceof 模式匹配（Java 16+）

模式匹配把类型判断与变量绑定合并：

\`\`\`java
if (obj instanceof String s) {
    System.out.println(s.length());  // s 已是 String 类型
}
\`\`\`

- \`s\` 称为**绑定变量**（binding variable）
- 当匹配成功，\`s\` 自动被赋值为转型后的对象
- 当匹配失败，\`s\` 不在作用域内

## 绑定变量的作用域

绑定变量的作用域由**流敏感分析**决定，只在能确保匹配成功的代码路径中有效：

\`\`\`java
if (!(obj instanceof String s)) {
    return;   // 此处 s 不可用
}
// 此处 s 可用，因为上面 return 保证匹配成功
\`\`\`

## 在条件中使用

模式匹配可与 \`&&\`、\`||\` 结合，实现简洁的类型处理逻辑：

\`\`\`java
if (obj instanceof String s && s.length() > 5) {
    System.out.println("长字符串: " + s);
}
\`\`\`

## 流敏感的作用域

绑定变量的作用域由编译器**流敏感分析**决定。编译器只在能确定匹配成功的路径上才让变量可用：

\`\`\`java
if (!(obj instanceof String s)) {
    // s 不可用
    return;
}
// s 可用：上面 return 保证了匹配成功
System.out.println(s.length());
\`\`\`

## null 处理

\`instanceof\` 对 \`null\` 总是返回 \`false\`，模式匹配也不例外。因此模式匹配天然是空安全的——不需要额外判空：

\`\`\`java
String s = null;
if (s instanceof String str) {  // false，str 不绑定
    // 不会进入
}
\`\`\`

## 展望：switch 模式匹配（Java 21）

Java 21 将模式匹配扩展到 \`switch\`，配合密封类可实现穷举式类型处理，编译器保证覆盖所有情况：

\`\`\`java
String desc = switch (shape) {
    case Circle c    -> "圆";
    case Square s    -> "方";
    case Triangle t  -> "三角";
    // 无需 default
};
\`\`\`

模式匹配 instanceof 是 Java 走向模式匹配（pattern matching）的第一步，配合密封类和 switch 模式匹配（Java 21），可写出非常优雅的类型处理代码。下面通过代码演示：`,
    code: `// 演示 instanceof 与模式匹配
public class Main {
    public static void main(String[] args) {
        Object[] data = { "hello", 42, 3.14, true, new int[]{1, 2} };

        // 1. 传统 instanceof 写法
        System.out.println("--- 传统写法 ---");
        for (Object o : data) {
            processTraditional(o);
        }

        // 2. 模式匹配写法（Java 16+）
        System.out.println("\\n--- 模式匹配写法 ---");
        for (Object o : data) {
            processPattern(o);
        }

        // 3. 在条件表达式中使用绑定变量
        System.out.println("\\n--- 条件中使用 ---");
        for (Object o : data) {
            describe(o);
        }
    }

    // 传统写法：判断 + 显式转型
    static void processTraditional(Object o) {
        if (o instanceof String) {
            String s = (String) o;
            System.out.println("字符串: " + s);
        } else if (o instanceof Integer) {
            Integer i = (Integer) o;
            System.out.println("整数: " + i);
        } else if (o instanceof Double) {
            Double d = (Double) o;
            System.out.println("浮点: " + d);
        } else {
            System.out.println("其他: " + o.getClass().getSimpleName());
        }
    }

    // 模式匹配写法：一步到位
    static void processPattern(Object o) {
        if (o instanceof String s) {
            System.out.println("字符串(长" + s.length() + "): " + s);
        } else if (o instanceof Integer i) {
            System.out.println("整数: " + i);
        } else if (o instanceof Double d) {
            System.out.println("浮点: " + d);
        } else {
            System.out.println("其他: " + o.getClass().getSimpleName());
        }
    }

    // 在条件中结合使用
    static void describe(Object o) {
        if (o instanceof String s && s.length() > 3) {
            System.out.println("长字符串: " + s);
        } else if (o instanceof String s) {
            System.out.println("短字符串: " + s);
        } else if (!(o instanceof Number)) {
            System.out.println("非数字: " + o);
        } else if (o instanceof Integer i && i > 10) {
            System.out.println("大整数: " + i);
        }
    }
}`
  },
  {
    id: "java-final-class",
    group: "继承与多态深入",
    icon: "🚫",
    title: "final 类与方法",
    content: `# final 类与方法

\`final\` 关键字用于类和方法时，分别禁止继承和重写，是控制扩展性的重要手段。

## final 类不可继承

被 \`final\` 修饰的类**不能被任何类继承**。Java 标准库中许多核心类是 final：

- \`String\`：保证不可变性，防止子类破坏
- \`Integer\`、\`Long\` 等包装类
- \`Math\`、\`Scanner\` 等

\`\`\`java
final class Config { }
// class SubConfig extends Config { } // 编译错误
\`\`\`

## final 方法不可重写

被 \`final\` 修饰的实例方法**不能被子类重写**，但可以重载。常用于保护核心逻辑、保证行为一致性：

\`\`\`java
class Base {
    public final void validate() { /* 核心校验逻辑 */ }
}
class Sub extends Base {
    // public void validate() { } // 编译错误：不能重写 final 方法
}
\`\`\`

## 设计原因

1. **保证不可变性**：final 类配合 final 字段，确保对象状态不可变（如 String），可安全共享、作为 Map 键
2. **安全性**：防止恶意子类篡改敏感行为（如安全框架中的校验方法）
3. **契约固定**：确保某些方法行为不被改变（如 \`Object.getClass()\` 是 final）
4. **API 稳定**：库作者明确表示某类不应被扩展

## 性能优化（JIT 内联）

JIT 编译器可以对 final 方法做**内联优化**：因为 final 方法不会被重写，调用目标唯一，JIT 可将方法体直接嵌入调用处，省去方法调用开销。final 类的所有方法默认可视为内联候选。

不过现代 JVM 的"类型继承关系分析（CHA）"已能对非 final 方法做投机优化，因此**不应仅为性能滥用 final**，应以设计意图为首要考虑。

## 不可变对象设计

final 类是构建**不可变对象**的关键一环。不可变对象天然线程安全、可安全共享、可作为可靠的 Map 键。设计要点：

1. 类声明为 \`final\`（防止子类破坏不可变性）
2. 所有字段 \`private final\`
3. 不提供 setter 方法
4. 若字段是可变对象引用，构造时防御性拷贝

\`\`\`java
public final class Complex {
    private final double re, im;
    public Complex(double re, double im) { this.re = re; this.im = im; }
    public Complex add(Complex o) { return new Complex(re + o.re, im + o.im); }
}
\`\`\`

## 何时使用 final

- 不可变值类型（如金额、坐标、颜色）→ final 类
- 安全敏感的校验方法 → final 方法
- 框架中不应被改写的模板方法 → final 方法
- 工具类（只有静态方法）→ final 类 + 私有构造

## final 与 abstract 互斥

\`final\` 与 \`abstract\` 不能同时使用：abstract 要求子类实现，final 禁止子类重写，两者矛盾。同理 final 方法也不能是 abstract。下面通过代码演示：`,
    code: `// 演示 final 类与 final 方法
public class Main {
    public static void main(String[] args) {
        // final 类无法继承，但正常使用
        Money price = new Money(99, 50);
        Money total = price.add(new Money(0, 50));
        System.out.println("总价: " + total);  // 100.00

        // final 方法可正常调用，但不能被子类重写
        Account acc = new SavingsAccount("张三", 1000);
        acc.display();   // 调用 final 方法
        acc.withdraw(200); // 调用可重写方法

        // final 类作为不可变值对象
        Money m1 = new Money(10, 0);
        Money m2 = new Money(10, 0);
        System.out.println("金额相等: " + m1.equals(m2));
    }
}

// final 类：不可继承，保证不可变性
final class Money {
    private final int yuan;      // final 字段：不可变
    private final int fen;

    public Money(int yuan, int fen) {
        if (fen >= 100) { yuan += fen / 100; fen = fen % 100; }
        this.yuan = yuan;
        this.fen = fen;
    }

    // 返回新对象，不改自身（不可变）
    public Money add(Money other) {
        return new Money(this.yuan + other.yuan, this.fen + other.fen);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Money m)) return false;
        return yuan == m.yuan && fen == m.fen;
    }

    @Override
    public String toString() {
        return String.format("%d.%02d", yuan, fen);
    }
}

// 演示 final 方法
class Account {
    protected String owner;
    protected double balance;

    public Account(String owner, double balance) {
        this.owner = owner;
        this.balance = balance;
    }

    // final 方法：核心逻辑不可被重写
    public final void display() {
        System.out.println("账户[" + owner + "] 余额: " + balance);
    }

    // 非final方法：可被子类重写
    public void withdraw(double amount) {
        balance -= amount;
        System.out.println("取款 " + amount + "，剩 " + balance);
    }
}

class SavingsAccount extends Account {
    public SavingsAccount(String owner, double balance) {
        super(owner, balance);
    }

    @Override
    public void withdraw(double amount) {
        if (balance - amount < 0) {
            System.out.println("余额不足");
            return;
        }
        super.withdraw(amount);
    }
}`
  },
  {
    id: "java-object-methods",
    group: "继承与多态深入",
    icon: "🎯",
    title: "Object 类方法",
    content: `# Object 类方法

\`java.lang.Object\` 是所有类的根类，定义了一组所有对象共有的方法。理解这些方法的契约（contract）是写好 Java 程序的基础。

## Object 的方法清单

| 方法 | 作用 |
|------|------|
| \`toString()\` | 返回对象的字符串表示 |
| \`equals(Object)\` | 判断是否逻辑相等 |
| \`hashCode()\` | 返回哈希码 |
| \`getClass()\` | 返回运行时类（final） |
| \`clone()\` | 浅拷贝（需实现 Cloneable） |
| \`wait()\` / \`wait(long)\` / \`wait(long,int)\` | 线程等待（final，配合 synchronized） |
| \`notify()\` / \`notifyAll()\` | 唤醒等待线程（final，配合 synchronized） |
| \`finalize()\` | GC 回收前调用（已废弃，Java 9+ 标记 Deprecated） |

## toString()

默认返回 \`类名@哈希十六进制\`，应重写为有意义的描述。打印对象、字符串拼接时会自动调用。

## equals() 与 hashCode()

\`equals\` 默认比较引用（==）。重写 \`equals\` 时**必须同时重写 \`hashCode\`**，遵守契约：相等的对象必须有相等的哈希码，否则会破坏 \`HashMap\`、\`HashSet\` 等基于哈希的容器。

equals 契约：自反性、对称性、传递性、一致性、非空性。

\`\`\`java
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof MyClass)) return false;
    MyClass that = (MyClass) o;
    return Objects.equals(field, that.field);
}
@Override
public int hashCode() { return Objects.hash(field); }
\`\`\`

## getClass()

返回对象的运行时 \`Class\` 对象，是 final 方法（不可重写）。常用于反射、类型判断。

## clone()

浅拷贝：复制对象本身，但引用类型字段仍指向同一对象。深拷贝需手动处理。现代代码更推荐用拷贝构造或工厂方法，而非 \`clone\`。

## equals 的五个契约

1. **自反性**：\`x.equals(x)\` 为 true
2. **对称性**：\`x.equals(y)\` 为 true 则 \`y.equals(x)\` 为 true
3. **传递性**：\`x.equals(y)\` 且 \`y.equals(z)\` 为 true，则 \`x.equals(z)\` 为 true
4. **一致性**：多次调用结果不变（对象未修改时）
5. **非空性**：\`x.equals(null)\` 为 false

## wait / notify 简介

\`wait()\`、\`notify()\`、\`notifyAll()\` 是线程间通信的基础，**必须在 synchronized 块中调用**，否则抛 \`IllegalMonitorStateException\`。它们是 final 方法，不可重写。典型用于生产者-消费者模式。

\`\`\`java
synchronized (lock) {
    while (!condition) lock.wait();   // 释放锁并等待
    // 条件满足，执行操作
    lock.notifyAll();                  // 唤醒等待线程
}
\`\`\`

## finalize() 已废弃

\`finalize()\` 在 GC 回收对象前调用，但执行时机不确定、可能不执行，且性能差。Java 9 起标记为 \`@Deprecated\`，Java 18 起标记为 \`@Deprecated(forRemoval=true)\`。替代方案是 \`AutoCloseable\` + try-with-resources 显式释放资源。

下面通过代码演示 Object 方法的重写：`,
    code: `// 演示 Object 类方法的重写
public class Main {
    public static void main(String[] args) {
        Point p1 = new Point(3, 4);
        Point p2 = new Point(3, 4);
        Point p3 = new Point(5, 6);

        // 1. toString
        System.out.println("toString: " + p1);
        System.out.println("默认: " + new Object());

        // 2. equals
        System.out.println("p1.equals(p2): " + p1.equals(p2)); // true
        System.out.println("p1.equals(p3): " + p1.equals(p3)); // false
        System.out.println("p1.equals(null): " + p1.equals(null)); // false

        // 3. hashCode 契约：equals 相等则 hashCode 必相等
        System.out.println("p1.hashCode = " + p1.hashCode());
        System.out.println("p2.hashCode = " + p2.hashCode());
        System.out.println("hashCode 相等: " + (p1.hashCode() == p2.hashCode()));

        // 4. getClass 返回运行时类
        System.out.println("运行时类: " + p1.getClass().getName());
        System.out.println("p1 与 p2 同类: " + (p1.getClass() == p2.getClass()));

        // 5. 作为 HashMap 键（依赖 equals/hashCode）
        java.util.Map<Point, String> map = new java.util.HashMap<>();
        map.put(p1, "原点附近");
        System.out.println("查 p2: " + map.get(p2)); // 依赖 hashCode/equals
    }
}

class Point {
    private int x;
    private int y;

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    // 重写 toString：有意义的描述
    @Override
    public String toString() {
        return "(" + x + ", " + y + ")";
    }

    // 重写 equals：逻辑相等
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;              // 自反性优化
        if (!(o instanceof Point p)) return false; // 类型检查 + 模式匹配
        return x == p.x && y == p.y;
    }

    // 重写 hashCode：与 equals 一致
    @Override
    public int hashCode() {
        return java.util.Objects.hash(x, y);
    }
}`
  },
  {
    id: "java-abstract-class",
    group: "继承与多态深入",
    icon: "📐",
    title: "抽象类深入",
    content: `# 抽象类深入

抽象类（abstract class）用 \`abstract\` 修饰，用于为子类定义通用模板，本身不能实例化。它介于具体类与接口之间。

## abstract 关键字

\`abstract\` 可修饰类和方法：

- **抽象类**：不能直接 \`new\`，必须由子类继承后实例化
- **抽象方法**：只有声明没有实现，由子类提供实现

\`\`\`java
abstract class Shape {
    abstract double area();   // 抽象方法：无方法体
    void info() { ... }       // 具体方法：有实现
}
\`\`\`

## 抽象方法

抽象方法用 \`abstract\` 声明，以分号结尾，没有方法体。子类必须实现所有抽象方法（除非子类也是抽象类）。抽象方法不能是 \`private\`（否则子类无法实现）、不能是 \`final\`（矛盾）、不能是 \`static\`（静态方法属于类，无重写概念）。

## 抽象类不能实例化

\`new Shape()\` 会编译错误。但可以有构造方法，供子类构造时调用（通过 \`super()\`）。可以声明抽象类类型的变量，引用子类实例：

\`\`\`java
Shape s = new Circle();  // 合法：父类引用指向子类对象
\`\`\`

## 抽象类 vs 具体类

| 特性 | 具体类 | 抽象类 |
|------|--------|--------|
| 实例化 | 可直接 new | 不可 new |
| 抽象方法 | 不能有 | 可有可无 |
| 构造方法 | 有 | 有（供子类调用） |
| 字段/具体方法 | 有 | 有 |
| 用途 | 创建对象 | 定义模板/部分实现 |

## 模板方法模式

抽象类最常见的用途是模板方法模式：在抽象类中定义算法骨架（具体方法），把可变步骤声明为抽象方法交由子类实现。这实现了"不变的部分封装，可变的部分延迟到子类"。

## 抽象类 vs 接口

Java 8 后接口也可有默认方法，两者界限模糊，但仍有区别：

| 特性 | 抽象类 | 接口 |
|------|--------|------|
| 多继承 | 单继承 | 可多实现 |
| 字段 | 可有实例字段 | 只能有静态常量 |
| 构造方法 | 有 | 无 |
| 状态 | 可维护对象状态 | 无状态 |
| 默认方法 | 普通方法 | \`default\` 方法 |

## 何时使用抽象类

- 需要共享**字段**或**状态**时
- 需要提供**构造方法**初始化时
- 需要**模板方法**（final 定义流程）时
- 子类间有大量**共同代码**可提取时

而接口更适合定义"能力契约"（如 \`Comparable\`、\`Iterable\`），允许跨继承树复用。

## 抽象类的构造方法

虽然抽象类不能实例化，但**可以有构造方法**，且子类构造时会通过 \`super()\` 调用它。构造方法通常声明为 \`protected\`，表明仅供子类使用。构造方法中应避免调用可被子类重写的方法（多态陷阱）：

\`\`\`java
abstract class Shape {
    protected String name;
    protected Shape(String name) { this.name = name; } // 供子类调用
    abstract double area();
}
\`\`\`

## 默认行为与强制实现

抽象类可同时提供**默认实现**（具体方法）和**强制实现**（抽象方法）。这让父类能控制哪些行为固定、哪些由子类决定，是模板方法模式的基础。Java 8 的接口默认方法也提供了类似能力，但接口无法维护实例状态。

抽象类可包含字段、构造方法、具体方法、抽象方法、静态成员，比接口（Java 8 前）更强大。下面通过代码演示：`,
    code: `// 演示抽象类与模板方法模式
public class Main {
    public static void main(String[] args) {
        // 抽象类不能实例化
        // Vehicle v = new Vehicle("X"); // 编译错误

        // 通过子类实例化
        Vehicle car = new Car("奔驰");
        Vehicle bike = new Bicycle("捷安特");

        car.start();    // 模板方法
        bike.start();

        // 抽象类引用，多态调用
        System.out.println("\\n--- 统一处理 ---");
        for (Vehicle v : new Vehicle[]{car, bike}) {
            v.run();
        }
    }
}

// 抽象类：定义模板
abstract class Vehicle {
    protected String name;

    public Vehicle(String name) {
        this.name = name;
    }

    // 模板方法：算法骨架，final 防止子类篡改流程
    public final void start() {
        System.out.println("=== 启动 " + name + " ===");
        igniteEngine();      // 抽象步骤：子类实现
        checkSafety();       // 具体步骤：父类实现
        move();              // 抽象步骤：子类实现
        System.out.println(name + " 已就绪");
    }

    // 抽象方法：子类必须实现
    protected abstract void igniteEngine();
    protected abstract void move();

    // 具体方法：所有子类共用
    protected void checkSafety() {
        System.out.println("  安全检查通过");
    }

    public abstract void run();
}

// 子类：汽车
class Car extends Vehicle {
    public Car(String name) { super(name); }

    @Override
    protected void igniteEngine() {
        System.out.println("  点火启动发动机");
    }

    @Override
    protected void move() {
        System.out.println("  挂挡起步");
    }

    @Override
    public void run() {
        System.out.println(name + " 在公路行驶");
    }
}

// 子类：自行车
class Bicycle extends Vehicle {
    public Bicycle(String name) { super(name); }

    @Override
    protected void igniteEngine() {
        System.out.println("  无引擎，人力驱动");
    }

    @Override
    protected void move() {
        System.out.println("  踩踏板");
    }

    @Override
    public void run() {
        System.out.println(name + " 在自行车道骑行");
    }
}`
  },
  {
    id: "java-template-method",
    group: "继承与多态深入",
    icon: "📋",
    title: "模板方法模式",
    content: `# 模板方法模式

模板方法模式（Template Method）是一种行为型设计模式：在父类定义算法骨架，将某些步骤延迟到子类实现，使得子类可在不改变算法结构的情况下重定义特定步骤。

## 抽象类定义算法骨架

父类用一个**模板方法**（通常是 final 方法）定义算法的执行流程，按顺序调用若干"步骤方法"。这些步骤中，固定的部分直接实现，可变的部分声明为抽象方法。

\`\`\`java
abstract class Game {
    final void play() {        // 模板方法
        init();
        startPlay();
        endPlay();
    }
    abstract void init();
    abstract void startPlay();
    void endPlay() { System.out.println("结束"); }
}
\`\`\`

## 子类实现具体步骤

子类通过重写抽象步骤方法提供具体实现，但**不能改变算法流程**（因为模板方法是 final）。

## hook 方法（钩子方法）

钩子方法是模板方法模式的重要扩展：父类提供一个**默认空实现**的方法，子类可选择重写来影响模板流程。模板方法在关键点调用钩子，由子类决定是否"挂钩"：

\`\`\`java
abstract class Workflow {
    final void run() {
        prepare();
        if (shouldCache()) {   // 钩子：子类可覆盖决定是否缓存
            cache();
        }
        execute();
    }
    boolean shouldCache() { return false; }  // 默认钩子
    ...
}
\`\`\`

## 好莱坞原则

模板方法模式体现"好莱坞原则"：**Don't call us, we'll call you**（别调用我们，我们会调用你）。父类（高层组件）主动调用子类（低层组件）的方法，而非反过来。子类只需实现被调用的步骤，控制权在父类。

## 优点

- 避免重复代码：公共流程集中在父类
- 便于扩展：新增子类只需实现步骤，不改流程
- 控制反转：父类掌控算法结构

## 模板方法 vs 策略模式

模板方法用**继承**复用算法骨架，子类重写个别步骤；策略模式用**组合**替换整个算法。模板方法适用于"流程固定、步骤可变"的场景，策略模式适用于"整体算法可替换"的场景。

## 实际应用

模板方法在框架中无处不在：

- \`AbstractList\` 定义列表操作骨架，子类实现 \`get\`、\`size\`
- \`HttpServlet\` 的 \`service()\` 分发到 \`doGet\`、\`doPost\`
- \`InputStream\` 的 \`read(byte[])\` 基于抽象 \`read()\` 实现
- Spring 的 \`JdbcTemplate\`、\`RestTemplate\`

## 钩子方法的三种形式

1. **条件钩子**：返回 boolean 控制流程（如 \`shouldCache()\`）
2. **空钩子**：默认空实现，子类选择性覆盖添加额外行为
3. **扩展钩子**：在模板关键点提供"扩展点"，子类可挂钩额外逻辑

钩子方法让子类在不改变算法结构的前提下影响流程，是模板方法模式灵活性的关键来源。

下面通过代码实现模板方法模式：`,
    code: `// 实现模板方法模式：数据导出流程
public class Main {
    public static void main(String[] args) {
        System.out.println("=== CSV 导出 ===");
        DataExporter csv = new CsvExporter();
        csv.export();

        System.out.println("\\n=== JSON 导出 ===");
        DataExporter json = new JsonExporter();
        json.export();

        System.out.println("\\n=== 加密 JSON 导出（使用钩子）===");
        DataExporter secure = new SecureJsonExporter();
        secure.export();
    }
}

// 抽象模板类
abstract class DataExporter {
    // 模板方法：final 保证流程不可改
    public final void export() {
        openSource();
        String data = readData();
        if (shouldEncrypt()) {      // 钩子方法
            data = encrypt(data);
        }
        String formatted = format(data);
        write(formatted);
        closeSource();
    }

    // 具体步骤：所有子类共用
    private void openSource() {
        System.out.println("  打开数据源");
    }

    private void closeSource() {
        System.out.println("  关闭数据源");
    }

    // 抽象步骤：子类必须实现
    protected abstract String readData();
    protected abstract String format(String data);

    // 默认实现：子类可覆盖
    protected void write(String content) {
        System.out.println("  写入文件: " + content);
    }

    // 钩子方法：默认不加密，子类可覆盖
    protected boolean shouldEncrypt() {
        return false;
    }

    // 加密逻辑：子类可选择性使用
    protected String encrypt(String data) {
        return "[加密]" + data + "[/加密]";
    }
}

// 子类：CSV 导出
class CsvExporter extends DataExporter {
    @Override
    protected String readData() {
        return "id,name,age";
    }

    @Override
    protected String format(String data) {
        return "CSV: " + data;
    }
}

// 子类：JSON 导出
class JsonExporter extends DataExporter {
    @Override
    protected String readData() {
        return "{name:张三}";
    }

    @Override
    protected String format(String data) {
        return "JSON: " + data;
    }
}

// 子类：加密 JSON 导出（使用钩子启用加密）
class SecureJsonExporter extends DataExporter {
    @Override
    protected String readData() {
        return "{secret:数据}";
    }

    @Override
    protected String format(String data) {
        return "JSON: " + data;
    }

    // 覆盖钩子：启用加密
    @Override
    protected boolean shouldEncrypt() {
        return true;
    }
}`
  },
  {
    id: "java-polymorphism-pitfalls",
    group: "继承与多态深入",
    icon: "⚠️",
    title: "多态陷阱",
    content: `# 多态陷阱

多态虽强大，但有几个常被忽略的陷阱，理解它们能避免隐蔽的 bug。

## 构造方法中调用可重写方法

在父类构造方法中调用可被子类重写的方法是**危险**的：此时子类构造方法尚未执行，子类字段尚未初始化，但动态分派会调用子类的方法，导致方法访问到未初始化的字段。

\`\`\`java
class Base {
    public Base() { init(); }          // 陷阱：调用可重写方法
}
class Sub extends Base {
    int x = 10;
    void init() { System.out.println(x); } // 输出 0，而非 10！
}
\`\`\`

原因：\`new Sub()\` 时先执行 \`Base\` 构造，此时 \`x\` 默认值为 0；\`Sub\` 的字段初始化语句 \`x = 10\` 还没执行。这是 Effective Java 明确警告的陷阱。

## 静态方法不参与多态

静态方法基于**编译时类型**绑定（静态绑定），不参与动态分派：

\`\`\`java
Base b = new Sub();
b.staticMethod(); // 调用 Base 的静态方法，而非 Sub
\`\`\`

## 字段不参与多态

字段访问也是**静态绑定**的，基于编译时类型。子类若定义同名字段（字段隐藏），通过父类引用访问的是父类字段：

\`\`\`java
class Base { String name = "父"; }
class Sub extends Base { String name = "子"; }
Base b = new Sub();
System.out.println(b.name); // 输出 "父"！
\`\`\`

## 多态与 equals

重写 \`equals\` 时要注意对称性：\`a.equals(b)\` 与 \`b.equals(a)\` 必须一致。继承层次中重写 equals 很容易破坏对称性（Effective Java 建议：无法在不违背对称性的前提下扩展可实例化类并添加新字段，应优先组合）。

## 总结

- 构造方法中只调用 final 或 private 方法
- 不要依赖静态方法的多态
- 避免字段隐藏
- 谨慎在继承层次中重写 equals

## 解决方案

针对上述陷阱的最佳实践：

- **构造方法陷阱**：构造方法中只调用 \`private\` 或 \`final\` 方法（这些不会被重写），或在构造后显式调用 \`init()\` 方法
- **静态方法**：通过类名调用静态方法（\`Sub.staticMethod()\`），而非实例引用，避免误导
- **字段隐藏**：避免在子类定义与父类同名的字段；若必须，用不同的命名
- **equals 对称性**：用组合代替继承来扩展可实例化类并添加字段；或用 \`getClass()\` 而非 \`instanceof\` 比较（但会牺牲 LSP）

## 字段隐藏的危害

字段隐藏是最隐蔽的陷阱：同名字段在不同引用类型下返回不同值，极易引发难以排查的 bug：

\`\`\`java
class Base { int val = 1; }
class Sub extends Base { int val = 2; }
Sub s = new Sub();
System.out.println(s.val);       // 2（子类字段）
Base b = s;
System.out.println(b.val);       // 1（父类字段）！同一对象不同值
\`\`\`

下面通过代码演示这些陷阱：`,
    code: `// 演示多态陷阱
public class Main {
    public static void main(String[] args) {
        // 1. 陷阱：构造方法中调用可重写方法
        System.out.println("--- 陷阱1：构造中调用可重写方法 ---");
        new Derived();   // 输出 0 而非 42

        // 2. 陷阱：静态方法不参与多态
        System.out.println("\\n--- 陷阱2：静态方法不参与多态 ---");
        Base2 b = new Derived2();
        b.showStatic();   // 调用 Base2 的静态方法
        b.showInstance(); // 调用 Derived2 的实例方法（多态）

        // 3. 陷阱：字段不参与多态
        System.out.println("\\n--- 陷阱3：字段不参与多态 ---");
        Base3 b3 = new Derived3();
        System.out.println("b3.name = " + b3.name);       // 父类字段
        Derived3 d3 = (Derived3) b3;
        System.out.println("d3.name = " + d3.name);       // 子类字段

        // 4. 陷阱：重写方法时字段已初始化才安全
        System.out.println("\\n--- 正确做法：使用 init 方法显式调用 ---");
        SafeBase sb = new SafeDerived();
        sb.init();   // 字段已初始化，输出正确值
    }
}

// 陷阱1：构造方法调用可重写方法
class Base1 {
    public Base1() {
        System.out.println("Base1 构造开始");
        init();   // 陷阱：动态分派到子类，但子类字段未初始化
        System.out.println("Base1 构造结束");
    }
    void init() { System.out.println("Base.init"); }
}
class Derived extends Base1 {
    int x = 42;   // 字段初始化在父类构造之后才执行
    @Override
    void init() {
        System.out.println("Derived.init, x = " + x); // x 是 0，不是 42
    }
}

// 陷阱2：静态方法
class Base2 {
    public static void showStatic() { System.out.println("Base2 静态"); }
    public void showInstance() { System.out.println("Base2 实例"); }
}
class Derived2 extends Base2 {
    public static void showStatic() { System.out.println("Derived2 静态"); }
    @Override
    public void showInstance() { System.out.println("Derived2 实例"); }
}

// 陷阱3：字段隐藏
class Base3 { String name = "父类字段"; }
class Derived3 extends Base3 { String name = "子类字段"; }

// 正确做法
class SafeBase {
    public SafeBase() { System.out.println("构造完成"); }
    public void init() { System.out.println("SafeBase.init"); }
}
class SafeDerived extends SafeBase {
    int x = 42;
    @Override
    public void init() {
        System.out.println("SafeDerived.init, x = " + x); // x 是 42
    }
}`
  },
  {
    id: "java-inheritance-vs-composition",
    group: "继承与多态深入",
    icon: "⚖️",
    title: "继承 vs 组合",
    content: `# 继承 vs 组合

继承和组合都是复用代码的方式，但它们的适用场景和代价差异巨大。Effective Java 建议：**优先使用组合而非继承**。

## is-a vs has-a

- **继承表达 is-a（是一个）**：\`Dog is an Animal\`，Dog 继承 Animal
- **组合表达 has-a（有一个）**：\`Car has an Engine\`，Car 包含 Engine 字段

选择依据：只有当存在真正的"是一个"关系，且子类真的能替换父类时，才用继承。

## 继承的破坏封装性

继承会破坏封装：子类依赖父类的**实现细节**，而非公开 API。父类内部实现变化可能导致子类失效。例如：

- 父类新增方法可能与子类方法冲突
- 父类方法实现改变可能破坏子类假设
- 子类可能误用受保护的字段

\`\`\`java
class InstrumentedHashSet<E> extends HashSet<E> {
    private int addCount = 0;
    @Override public boolean add(E e) { addCount++; return super.add(e); }
    @Override public boolean addAll(Collection<E> c) {
        addCount += c.size();
        return super.addAll(c);  // 陷阱：HashSet.addAll 内部会调用 add，导致重复计数
    }
}
\`\`\`

## 组合的优势

组合（在一个类中持有另一个类的引用，通过转发调用）更灵活、更安全：

- **不破坏封装**：只依赖公开 API
- **运行时可替换**：可动态更换被组合对象
- **不受实现变化影响**：父类内部实现变化不影响组合方
- **可组合多个对象**：不受单继承限制

\`\`\`java
// 组合：转发实现计数
class InstrumentedSet<E> {
    private final Set<E> set;        // 组合
    private int addCount = 0;
    public InstrumentedSet(Set<E> s) { this.set = s; }
    public boolean add(E e) { addCount++; return set.add(e); }
    public boolean addAll(Collection<E> c) {
        addCount += c.size();
        return set.addAll(c);  // 转发，不重复计数
    }
}
\`\`\`

## 装饰器模式：组合的典范

装饰器模式是组合 + 接口的经典应用：用包装类（组合）逐层添加功能，而非继承扩展。Java I/O 库就是典型：

\`\`\`java
// 装饰器：组合而非继承
InputStream in = new BufferedInputStream(new FileInputStream("f.txt"));
\`\`\`

每个装饰器持有一个被装饰对象（组合），实现同一接口，在调用前后添加逻辑。相比继承，装饰器可在运行时灵活叠加，不受单继承限制。

## 转发类（Forwarding）

组合常配合转发实现：包装类实现接口，将调用转发给内部对象。这隔离了实现变化，符合"针对接口编程"：

\`\`\`java
class ForwardingSet<E> implements Set<E> {
    private final Set<E> s;           // 组合
    public ForwardingSet(Set<E> s) { this.s = s; }
    public boolean add(E e) { return s.add(e); }  // 转发
    // ... 其他方法转发
}
\`\`\`

## 何时继承是合适的

继承在以下场景仍然合适：

- 真正的 is-a 关系（\`ArrayList is a List\` 的实现）
- 子类与父类在同一作者控制下（同包、同框架）
- 父类设计为可继承（文档化的扩展点、protected 钩子）
- 需要参与多态分派

只有当类需要参与多态、真正满足 is-a 关系时才用继承。否则用组合 + 接口实现更灵活的设计。下面通过代码演示继承陷阱与组合优势：`,
    code: `// 演示继承陷阱与组合优势
public class Main {
    public static void main(String[] args) {
        // 1. 继承的陷阱：重复计数
        System.out.println("--- 继承方式的陷阱 ---");
        InstrumentedHashSetBad<String> bad = new InstrumentedHashSetBad<>();
        bad.addAll(java.util.List.of("a", "b", "c"));
        System.out.println("期望计数 3，实际: " + bad.getAddCount()); // 输出 6

        // 2. 组合的优势：正确计数
        System.out.println("\\n--- 组合方式 ---");
        InstrumentedSetGood<String> good = new InstrumentedSetGood<>(new java.util.HashSet<>());
        good.addAll(java.util.List.of("a", "b", "c"));
        System.out.println("期望计数 3，实际: " + good.getAddCount()); // 输出 3

        // 3. 组合的灵活性：可替换内部实现
        System.out.println("\\n--- 组合可替换内部实现 ---");
        InstrumentedSetGood<String> treeBased = new InstrumentedSetGood<>(new java.util.TreeSet<>());
        treeBased.add("z");
        treeBased.add("a");
        System.out.println("计数: " + treeBased.getAddCount());
    }
}

// 继承方式：存在重复计数陷阱
class InstrumentedHashSetBad<E> extends java.util.HashSet<E> {
    private int addCount = 0;

    @Override
    public boolean add(E e) {
        addCount++;
        return super.add(e);
    }

    @Override
    public boolean addAll(java.util.Collection<? extends E> c) {
        addCount += c.size();
        return super.addAll(c);  // 父类 addAll 内部会调 add，导致重复计数
    }

    public int getAddCount() { return addCount; }
}

// 组合方式：通过转发，避免依赖父类实现
class InstrumentedSetGood<E> {
    private final java.util.Set<E> set;   // 组合：持有 Set 引用
    private int addCount = 0;

    public InstrumentedSetGood(java.util.Set<E> set) {
        this.set = set;
    }

    public boolean add(E e) {
        addCount++;
        return set.add(e);   // 转发
    }

    public boolean addAll(java.util.Collection<? extends E> c) {
        addCount += c.size();
        boolean modified = false;
        for (E e : c) {
            if (set.add(e)) modified = true;  // 直接调用 set.add，不调自身 add
        }
        return modified;
    }

    public int getAddCount() { return addCount; }

    // 转发其他方法（示例）
    public int size() { return set.size(); }
    public boolean contains(Object o) { return set.contains(o); }
}`
  },
  {
    id: "java-liskov",
    group: "继承与多态深入",
    icon: "📏",
    title: "里氏替换原则",
    content: `# 里氏替换原则

里氏替换原则（Liskov Substitution Principle, LSP）是面向对象设计的核心原则之一，由 Barbara Liskov 提出：**所有引用父类的地方必须能透明地使用子类对象**，且程序行为不变。

## 子类型必须能替换父类型

LSP 要求子类对象在任何使用父类对象的地方都能正常工作，调用方无需知道实际是子类。这是"是一个"关系的真正含义——不是语法上的继承，而是行为上的可替换。

## 违反 LSP 的典型情况

1. **子类抛出父类未声明的新异常**：调用方无法预期
2. **子类加强了前置条件**：拒绝父类接受的输入
3. **子类削弱了后置条件**：返回不满足父类契约的结果
4. **子类改变了副作用**：父类无副作用，子类引入副作用

## 契约一致性

子类必须遵守父类的方法契约（契约式设计）：

- **前置条件**：子类不能比父类更严格（不能拒绝父类接受的输入）
- **后置条件**：子类不能比父类更宽松（不能返回父类不允许的结果）
- **不变式**：子类必须维持父类的不变式

## 正方形-长方形问题

经典反例：从直觉上"正方形是一个长方形"，但若 \`Square extends Rectangle\`：

- \`Rectangle.setwidth(5).setHeight(3)\` 期望面积 15
- \`Square\` 重写 setter 保持等边，导致 \`setWidth(5).setHeight(3)\` 后边长都变 3，面积是 9 而非 15

正方形违反了长方形"宽高可独立变化"的契约，因此不能作为长方形的子类型。正确做法是用组合或共同抽象基类。

## 契约式设计（DbC）

LSP 的理论基础是契约式设计。每个方法都有契约：

- **前置条件**：调用前必须满足的条件（参数约束）
- **后置条件**：返回后必须满足的条件（返回值约束、状态变化）
- **不变式**：对象生命周期内始终成立的条件

子类重写方法时：**前置条件不能加强**（不能拒绝父类接受的输入），**后置条件不能削弱**（不能返回父类不允许的结果），**不变式必须维持**。

## 另一个违反 LSP 的例子

\`Stack extends ArrayList\` 是常见错误：\`ArrayList\` 允许按索引任意访问，而 \`Stack\` 应只允许栈顶操作。若 Stack 继承 ArrayList，调用方可通过 \`get(index)\` 绕过栈语义，破坏 LSP。正确做法是用组合（Stack 内部持有 ArrayList）。

## 如何判断是否满足 LSP

问自己：**子类对象能否在父类出现的任何地方无差别地使用？** 如果调用方需要知道实际是子类才能正确工作，就违反了 LSP。

## LSP 与契约的关系

LSP 本质上是要求子类**不违背父类的契约**。语法上继承只要类型兼容即可，但语义上子类必须遵守父类承诺的行为规范。这是"行为子类型"而非"语法子类型"的概念。一个经典的检查方法：写出父类的所有方法契约（前置条件、后置条件、不变式），逐一验证子类是否满足。

## LSP 与开闭原则

LSP 是开闭原则（OCP）的基础。只有子类能无差别替换父类，调用方才能依赖父类抽象而不修改代码（对扩展开放、对修改关闭）。若 LSP 被破坏，调用方不得不加入 \`instanceof\` 分支处理特例子类，开闭原则也随之瓦解。

违反 LSP 会导致调用方必须知道具体子类型才能正确工作，破坏多态，增加耦合。遵守 LSP 才能让继承真正发挥作用。下面通过代码演示 LSP：`,
    code: `// 演示里氏替换原则（LSP）
public class Main {
    public static void main(String[] args) {
        // 1. 遵守 LSP：子类可替换父类
        System.out.println("--- 遵守 LSP ---");
        Rectangle r = new Rectangle(4, 5);
        System.out.println("矩形面积: " + r.area());
        testRectangle(r);

        // 2. 违反 LSP：正方形继承长方形
        System.out.println("\\n--- 违反 LSP：正方形 ---");
        Rectangle square = new BadSquare(5);
        System.out.println("初始面积: " + square.area());
        // 调用方假设宽高独立，但正方形破坏了契约
        square.setWidth(4);
        square.setHeight(5);
        System.out.println("期望面积 20，实际: " + square.area()); // 25，违反契约

        // 3. 正确设计：提取共同抽象，不强行继承
        System.out.println("\\n--- 正确设计 ---");
        Shape rect = new RectangleShape(4, 5);
        Shape sq = new SquareShape(5);
        System.out.println("矩形面积: " + rect.area());
        System.out.println("正方形面积: " + sq.area());
    }

    // 调用方代码：依赖 Rectangle 的契约（宽高独立）
    static void testRectangle(Rectangle r) {
        int oldHeight = r.getHeight();
        r.setWidth(10);
        if (r.getHeight() != oldHeight) {
            System.out.println("LSP 违反：改宽影响了高！");
        } else {
            System.out.println("LSP 正常：宽高独立");
        }
    }
}

// 长方形：宽高可独立变化
class Rectangle {
    protected int width;
    protected int height;

    public Rectangle(int w, int h) { this.width = w; this.height = h; }
    public int getWidth() { return width; }
    public int getHeight() { return height; }
    public void setWidth(int w) { this.width = w; }
    public void setHeight(int h) { this.height = h; }
    public int area() { return width * height; }
}

// 违反 LSP：正方形强行继承长方形
class BadSquare extends Rectangle {
    public BadSquare(int side) { super(side, side); }

    @Override
    public void setWidth(int w) {
        this.width = w;
        this.height = w;   // 破坏契约：改宽同时改高
    }

    @Override
    public void setHeight(int h) {
        this.width = h;    // 破坏契约：改高同时改宽
        this.height = h;
    }
}

// 正确设计：共同抽象，不强行继承
abstract class Shape {
    public abstract int area();
}

class RectangleShape extends Shape {
    private int width, height;
    public RectangleShape(int w, int h) { this.width = w; this.height = h; }
    @Override public int area() { return width * height; }
}

class SquareShape extends Shape {
    private int side;
    public SquareShape(int side) { this.side = side; }
    @Override public int area() { return side * side; }
}`
  },
  {
    id: "java-sealed-classes",
    group: "继承与多态深入",
    icon: "🔐",
    title: "密封类（Java 17+）",
    content: `# 密封类（Java 17+）

密封类（sealed class）是 Java 17 正式引入的特性，允许类作者**精确控制**哪些类可以继承自己，弥补了"任意类都能继承"和"final 完全禁止继承"之间的空白。

## sealed 关键字

用 \`sealed\` 修饰类，并通过 \`permits\` 子句显式列出允许继承的子类：

\`\`\`java
public sealed class Shape permits Circle, Square, Triangle { }
\`\`\`

\`Shape\` 只能被 \`Circle\`、\`Square\`、\`Triangle\` 继承，其他类试图继承会编译错误。

## permits 子句

- \`permits\` 列出允许的子类，子类必须与密封类在同一模块或包中
- 如果子类与密封类在同一文件，可省略 \`permits\`（编译器自动推断）
- 列出的子类必须**显式声明**自己是 \`final\`、\`sealed\` 或 \`non-sealed\` 之一

## non-sealed

被 \`permits\` 的子类有三种选择：

- \`final\`：该子类不能再被继承（终止继承链）
- \`sealed\`：继续密封，需进一步 permits
- \`non-sealed\`：开放继承，任意类可继承（恢复普通行为）

\`\`\`java
sealed class Shape permits Circle, Square, Triangle {}
final class Circle extends Shape {}        // 终止
non-sealed class Square extends Shape {}   // 开放，可被任意继承
sealed class Triangle extends Shape permits EquilateralTriangle {}
\`\`\`

## 密封类的用途：穷举模式匹配

密封类最大的价值是与模式匹配配合，实现**穷举**（exhaustive）。因为编译器知道所有子类，switch 表达式覆盖所有情况后无需 default：

\`\`\`java
double area = switch (shape) {
    case Circle c    -> Math.PI * c.r() * c.r();
    case Square s    -> s.side() * s.side();
    case Triangle t  -> 0.5 * t.base() * t.height();
    // 无需 default，编译器保证穷举
};
\`\`\`

这保证了类型安全：新增子类时编译器会提示所有未覆盖的 switch。

## 代数数据类型（ADT）

密封类让 Java 能够表达**代数数据类型**：一组封闭的类型，每个类型有固定的结构。这是函数式编程的核心概念。例如"形状要么是圆、要么是方、要么是三角"，用密封类可精确表达这种"或"关系：

\`\`\`java
sealed interface Shape permits Circle, Square, Triangle {}
\`\`\`

## 密封接口

密封不仅适用于类，也适用于接口。密封接口常用于定义领域状态的封闭集合（如状态机、AST 节点类型、配置选项）。

## 与枚举的区别

枚举（enum）是实例固定的单类型；密封类是**类型**固定的多类型层次。枚举的每个实例结构相同，密封类的每个子类型可有不同字段和行为。当需要"有限种类型、各自不同结构"时，密封类比枚举更合适。

## 迁移与兼容性

将普通类改为密封类是**源不兼容**的变更（原有子类若不在 permits 列表会编译失败）。因此设计新 API 时应尽早考虑是否密封。框架作者常用密封类锁定扩展点，配合模式匹配提供类型安全的处理逻辑。

密封类实现了"封闭的继承层次"，常用于领域建模（如状态机、AST 节点、配置类型），是函数式编程中代数数据类型（ADT）在 Java 的体现。下面通过代码演示：`,
    code: `// 演示密封类（Java 17+）
public class Main {
    public static void main(String[] args) {
        Shape[] shapes = {
            new Circle(3),
            new Square(4),
            new Triangle(6, 8)
        };

        // 利用密封类 + switch 模式匹配穷举处理
        for (Shape s : shapes) {
            System.out.println(describe(s));
        }

        // 状态机示例
        System.out.println("\\n--- 状态机 ---");
        NetworkState state = new Connected();
        System.out.println(state + " -> " + state.next());
    }

    // 密封类 + 模式匹配：编译器保证穷举
    static String describe(Shape s) {
        return switch (s) {
            case Circle c    -> "圆形，半径 " + c.radius() + "，面积 " + c.area();
            case Square sq   -> "正方形，边长 " + sq.side() + "，面积 " + sq.area();
            case Triangle t  -> "三角形，面积 " + t.area();
            // 无需 default：编译器已知所有子类
        };
    }
}

// 密封类：限定继承层次
sealed abstract class Shape permits Circle, Square, Triangle {
    public abstract double area();
}

// final 子类：终止继承链
final class Circle extends Shape {
    private final double radius;
    public Circle(double r) { this.radius = r; }
    public double radius() { return radius; }
    @Override public double area() { return Math.PI * radius * radius; }
}

final class Square extends Shape {
    private final double side;
    public Square(double s) { this.side = s; }
    public double side() { return side; }
    @Override public double area() { return side * side; }
}

final class Triangle extends Shape {
    private final double base, height;
    public Triangle(double b, double h) { this.base = b; this.height = h; }
    @Override public double area() { return 0.5 * base * height; }
}

// 密封接口示例：网络状态机
sealed interface NetworkState permits Connected, Disconnected, Reconnecting {
    NetworkState next();
}

final class Connected implements NetworkState {
    @Override public NetworkState next() { return new Disconnected(); }
    @Override public String toString() { return "已连接"; }
}

final class Disconnected implements NetworkState {
    @Override public NetworkState next() { return new Reconnecting(); }
    @Override public String toString() { return "已断开"; }
}

final class Reconnecting implements NetworkState {
    @Override public NetworkState next() { return new Connected(); }
    @Override public String toString() { return "重连中"; }
}`
  }
];
