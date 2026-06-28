// =============================================================
// Java 交互式教程 —— 第十一批章节（内部类与枚举组，共 15 章）
// =============================================================

export const chapters = [
  {
    id: "java-inner-class-basics",
    group: "内部类与枚举",
    icon: "🏠",
    title: "成员内部类",
    content: `# 成员内部类

成员内部类（Member Inner Class）是直接定义在另一个类**内部**、且没有 \`static\` 修饰的类。它是最常见的内部类形式，与外部类实例紧密关联。

## 基本语法

\`\`\`java
class Outer {
    class Inner {
        // 内部类可以访问外部类的所有成员，包括 private
    }
}
\`\`\`

## 持有外部类引用

每个非静态内部类实例都**隐式持有**一个外部类实例的引用，可通过 \`Outer.this\` 显式访问：

\`\`\`java
class Outer {
    String name;
    class Inner {
        void show() {
            System.out.println(Outer.this.name); // 访问外部类字段
        }
    }
}
\`\`\`

## 创建内部类对象

必须先有外部类实例，再用 \`outer.new Inner()\` 创建：

\`\`\`java
Outer outer = new Outer();
Outer.Inner inner = outer.new Inner();
\`\`\`

## 访问外部类私有成员

内部类可直接访问外部类的 **private** 字段与方法，这是 Java 编译器通过合成"桥接"访问方法实现的。

## 字段遮蔽与 Outer.this

当内外字段同名时，内部类字段会遮蔽外部类字段，需用 \`Outer.this.字段\` 区分。

## 编译生成的 .class 文件

编译后，成员内部类生成形如 \`Outer$Inner.class\` 的文件，外部类为 \`Outer.class\`。\`$\` 符号是内部类的标志。

## 内存与性能注意

- 每个内部类实例都持有外部类引用，可能阻碍外部类被 GC 回收
- 匿名内部类常用于事件监听，需警惕内存泄漏风险

下面通过代码演示成员内部类的核心用法：`,
    code: `// 演示成员内部类
public class Main {
    public static void main(String[] args) {
        // 创建外部类对象
        Outer outer = new Outer("外部实例", 100);

        // 通过外部类对象创建内部类实例
        Outer.Inner inner = outer.new Inner();
        inner.show();
        inner.accessOuter();
    }
}

// 外部类（非公开）
class Outer {
    private String name;
    private int value;

    public Outer(String name, int value) {
        this.name = name;
        this.value = value;
    }

    // 成员内部类（非静态）
    class Inner {
        // 字段可与外部类同名，产生遮蔽
        private String name = "内部名称";

        public void show() {
            System.out.println("内部类的 name: " + this.name);
            System.out.println("外部类的 name: " + Outer.this.name);
            System.out.println("外部类的 value: " + Outer.this.value);
        }

        public void accessOuter() {
            // 直接访问外部类私有成员（用 Outer.this 区分同名字段）
            System.out.println("访问外部类私有字段: " + Outer.this.name + ", " + Outer.this.value);
            Outer.this.value++; // 修改外部类字段
            System.out.println("修改后的 value: " + Outer.this.value);
        }
    }
}`
  },
  {
    id: "java-local-class",
    group: "内部类与枚举",
    icon: "📍",
    title: "局部内部类",
    content: `# 局部内部类

局部内部类（Local Inner Class）是定义在**方法、构造器或初始化块**内部的类。它的作用域仅限于所在代码块，对外部完全隐藏。

## 基本语法

\`\`\`java
class Outer {
    void method() {
        class Local {
            // 仅在该方法内可见
        }
        Local local = new Local();
    }
}
\`\`\`

## 访问局部变量（effectively final）

局部内部类可以访问所在方法的局部变量，但该变量必须是 **effectively final**（事实上的 final，即赋值后不再改变）：

\`\`\`java
void method() {
    int base = 10; // effectively final
    class Local {
        int get() { return base; } // 合法
    }
    // base = 20; // 若取消注释，上面将编译错误
}
\`\`\`

## 为什么要求 effectively final

局部内部类对象的生命周期可能超出方法调用，编译器会把捕获的变量**复制**到内部类实例中。若变量可变，副本与原值将不一致，引发语义混乱。

## 作用域与可见性

- 局部类不能使用访问修饰符（public/private/protected）
- 可以访问外部类的所有成员
- 仅在定义它的代码块内可见，外部无法引用其类型名

## 典型使用场景

- 临时实现某个接口（如迭代器、回调），且只需使用一次
- 将辅助逻辑封装在方法内，避免污染外部类的命名空间
- 工厂方法返回一个实现了某接口的临时对象

下面通过代码演示局部内部类的定义与 effectively final 捕获：`,
    code: `// 演示局部内部类
public class Main {
    public static void main(String[] args) {
        Counter c = createCounter(10);
        System.out.println("当前值: " + c.current());
        System.out.println("增加后: " + c.increment());
        System.out.println("减少后: " + c.decrement());
    }

    // 工厂方法：返回局部内部类实例
    static Counter createCounter(int start) {
        int base = start; // effectively final 局部变量

        // 局部内部类：定义在方法内部
        class LocalCounter implements Counter {
            private int value = base; // 可以访问 effectively final 变量

            public int increment() {
                value++;
                return value;
            }

            public int decrement() {
                value--;
                return value;
            }

            public int current() {
                return value;
            }
        }

        return new LocalCounter(); // 返回局部类实例，跨越方法作用域
    }
}

// 计数器接口（非公开）
interface Counter {
    int increment();
    int decrement();
    int current();
}`
  },
  {
    id: "java-anonymous-class",
    group: "内部类与枚举",
    icon: "👤",
    title: "匿名内部类",
    content: `# 匿名内部类

匿名内部类（Anonymous Inner Class）没有名字，在创建对象的同时定义类。它通常用于**一次性**实现某个接口或继承某个类。

## 语法

\`\`\`java
new 接口名() {
    // 实现方法
};

new 父类名(参数) {
    // 重写方法
};
\`\`\`

注意末尾的 \`;\`，因为整个表达式是一个语句。

## 实现接口的匿名类

最常见的用法是为回调、监听器提供临时实现：

\`\`\`java
button.setOnClickListener(new OnClickListener() {
    @Override
    public void onClick(String source) {
        System.out.println("被点击: " + source);
    }
});
\`\`\`

## 继承类的匿名类

可以继承一个类并重写方法，常用于临时扩展：

\`\`\`java
Animal dog = new Animal("小狗") {
    @Override
    public String sound() { return "汪汪"; }
};
\`\`\`

## 事件处理中的匿名类

GUI、Android 等场景大量使用匿名类作为事件监听器，因为每个监听器逻辑往往只用到一次。

## 匿名类 vs Lambda

- 匿名类可以**有状态字段**，可以重写多个方法；Lambda 只能实现**单方法接口**
- Lambda 没有自己的 \`this\`，匿名类的 \`this\` 指向匿名类实例
- 实现单方法接口时，优先用 Lambda（更简洁）；接口有多个方法或需要字段时用匿名类

## 注意事项

- 匿名类不能有显式构造方法（没有名字），可用实例初始化块代替
- 捕获的外部变量同样必须是 effectively final

下面通过代码演示匿名类的三种典型用法：`,
    code: `// 演示匿名内部类
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "Dave");

        // 1. 匿名类实现接口（自定义比较器）
        Comparator<String> byLength = new Comparator<String>() {
            @Override
            public int compare(String a, String b) {
                return a.length() - b.length(); // 按长度排序
            }
        };
        names.sort(byLength);
        System.out.println("按长度排序: " + names);

        // 2. 匿名类直接作为参数（事件处理模拟）
        Button btn = new Button();
        btn.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(String source) {
                System.out.println("按钮被点击: " + source);
            }
        });
        btn.click(); // 触发点击

        // 3. 匿名类继承类并重写方法
        Animal dog = new Animal("小狗") {
            @Override
            public String sound() {
                return getName() + ": 汪汪汪";
            }
        };
        System.out.println(dog.sound());
    }
}

// 点击监听接口（非公开）
interface OnClickListener {
    void onClick(String source);
}

// 按钮类（非公开）
class Button {
    private OnClickListener listener;

    public void setOnClickListener(OnClickListener listener) {
        this.listener = listener;
    }

    public void click() {
        if (listener != null) {
            listener.onClick("提交按钮");
        }
    }
}

// 动物基类（非公开）
class Animal {
    private String name;

    public Animal(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public String sound() {
        return name + ": ...";
    }
}`
  },
  {
    id: "java-static-nested",
    group: "内部类与枚举",
    icon: "🏛️",
    title: "静态嵌套类",
    content: `# 静态嵌套类

静态嵌套类（Static Nested Class）是用 \`static\` 修饰的内部类。它**不持有外部类实例的引用**，行为上更像一个顶层类，只是命名上嵌套在外部类内。

## 基本语法

\`\`\`java
class Outer {
    static class Nested {
        // 不持有 Outer 实例引用
    }
}
\`\`\`

## 创建方式

不需要外部类实例，直接用 \`new Outer.Nested()\` 创建：

\`\`\`java
Outer.Nested nested = new Outer.Nested();
\`\`\`

## 与非静态内部类的区别

| 特性 | 静态嵌套类 | 非静态内部类 |
|------|-----------|-------------|
| 持有外部引用 | 否 | 是 |
| 创建对象 | 无需外部实例 | 需要外部实例 |
| 访问外部实例成员 | 不能直接访问 | 可以直接访问 |
| 内存开销 | 较小 | 较大 |

## 何时使用静态嵌套类

- 辅助类与外部类**逻辑上紧密相关**，但不依赖外部实例
- 希望把相关类组织在一起，提升封装性
- 实现 Builder 模式：Builder 不需要已构造的对象，适合用 static

## Builder 模式应用

Builder 需要在 \`build()\` 时构造外部类，但 Builder 本身不持有外部实例，因此通常声明为静态嵌套类：

\`\`\`java
class Pizza {
    private Pizza(Builder b) { ... }
    static class Builder { Pizza build() { return new Pizza(this); } }
}
\`\`\`

## 建议

《Effective Java》建议：**如果内部类不需要访问外部实例，应优先声明为静态嵌套类**，可避免不必要的引用与内存泄漏。

下面通过代码演示静态嵌套类与 Builder 模式：`,
    code: `// 演示静态嵌套类
public class Main {
    public static void main(String[] args) {
        // 不需要外部类实例即可创建静态嵌套类
        Pizza pizza = new Pizza.Builder("玛格丽特")
            .size(12)
            .extraCheese(true)
            .build();
        System.out.println(pizza);

        // 静态嵌套类常用于组织相关逻辑
        MathUtil.Pair p = MathUtil.minMax(new int[]{3, 1, 4, 1, 5, 9, 2, 6});
        System.out.println("最小: " + p.min + ", 最大: " + p.max);
    }
}

// 数学工具类（非公开）
class MathUtil {
    // 静态嵌套类：不持有外部类引用
    static class Pair {
        final int min;
        final int max;

        Pair(int min, int max) {
            this.min = min;
            this.max = max;
        }
    }

    static Pair minMax(int[] arr) {
        int mn = arr[0], mx = arr[0];
        for (int v : arr) {
            if (v < mn) mn = v;
            if (v > mx) mx = v;
        }
        return new Pair(mn, mx);
    }
}

// 披萨类（非公开）
class Pizza {
    private final String name;
    private final int size;
    private final boolean extraCheese;

    private Pizza(Builder b) {
        this.name = b.name;
        this.size = b.size;
        this.extraCheese = b.extraCheese;
    }

    @Override
    public String toString() {
        return "Pizza{name='" + name + "', size=" + size + ", extraCheese=" + extraCheese + "}";
    }

    // 静态嵌套类实现 Builder 模式
    static class Builder {
        private final String name;
        private int size = 8;
        private boolean extraCheese = false;

        public Builder(String name) {
            this.name = name;
        }

        public Builder size(int size) {
            this.size = size;
            return this;
        }

        public Builder extraCheese(boolean extra) {
            this.extraCheese = extra;
            return this;
        }

        public Pizza build() {
            return new Pizza(this);
        }
    }
}`
  },
  {
    id: "java-inner-class-use",
    group: "内部类与枚举",
    icon: "💡",
    title: "内部类的实际用途",
    content: `# 内部类的实际用途

内部类不只是语法糖，它在工程中有多重实用价值。理解这些用途有助于写出更优雅、更内聚的代码。

## 1. 封装辅助类

当一个类只为另一个类服务时，把它定义为内部类可以**隐藏实现细节**，避免污染包命名空间。例如链表的节点类、树的节点类。

## 2. 事件监听器

GUI/Android 中，监听器常以匿名内部类或成员内部类形式存在，能直接访问宿主组件的字段，简化回调逻辑。

## 3. 迭代器实现

集合框架大量使用内部类实现 \`Iterator\`，因为迭代器需要直接访问集合的内部数据结构：

\`\`\`java
class IntList {
    private int[] data;
    public Iterator<Integer> iterator() {
        return new IntIterator(); // 内部类，直接访问 data
    }
    private class IntIterator implements Iterator<Integer> { ... }
}
\`\`\`

## 4. 闭包模拟

Java 没有真正的闭包，但内部类捕获外部变量（effectively final）的行为，相当于一种"闭包"模拟——把行为与上下文一起打包传递。

## 5. 链式调用

通过返回 \`this\`，可让方法链式调用。常用于 Builder、流式 API。配合内部类可以把"可变状态"封装在内部。

## 6. 多重继承的变通

Java 类只能单继承，但一个外部类可以通过多个内部类分别继承不同类，再委托调用，模拟部分多重继承能力。

## 选择建议

- 只用一次 → 匿名内部类
- 需要复用且访问外部实例 → 成员内部类
- 不需要外部实例 → 静态嵌套类（优先）
- 仅方法内使用 → 局部内部类

下面通过代码综合演示内部类的几种典型用途：`,
    code: `// 演示内部类的实际用途
import java.util.Iterator;
import java.util.NoSuchElementException;

public class Main {
    public static void main(String[] args) {
        // 1. 迭代器实现（成员内部类访问外部类数据）
        IntList list = new IntList();
        list.add(10);
        list.add(20);
        list.add(30);

        Iterator<Integer> it = list.iterator();
        while (it.hasNext()) {
            System.out.println("元素: " + it.next());
        }

        // 2. 事件监听（匿名内部类封装回调）
        EventBus bus = new EventBus();
        bus.subscribe(new EventBus.Listener() {
            @Override
            public void onEvent(String msg) {
                System.out.println("收到事件: " + msg);
            }
        });
        bus.publish("用户登录");

        // 3. 链式调用闭包模拟
        Calculator calc = new Calculator(100);
        int result = calc.add(50).multiply(2).subtract(30).value();
        System.out.println("计算结果: " + result);
    }
}

// 自定义链表（非公开）
class IntList {
    private int[] data = new int[4];
    private int size = 0;

    public void add(int v) {
        if (size == data.length) {
            int[] newData = new int[data.length * 2];
            System.arraycopy(data, 0, newData, 0, size);
            data = newData;
        }
        data[size++] = v;
    }

    public Iterator<Integer> iterator() {
        return new IntIterator();
    }

    // 成员内部类：方便访问 data 与 size
    private class IntIterator implements Iterator<Integer> {
        private int cursor = 0;

        public boolean hasNext() {
            return cursor < size;
        }

        public Integer next() {
            if (!hasNext()) throw new NoSuchElementException();
            return data[cursor++];
        }
    }
}

// 事件总线（非公开）
class EventBus {
    interface Listener {
        void onEvent(String msg);
    }

    private Listener listener;

    public void subscribe(Listener l) {
        this.listener = l;
    }

    public void publish(String msg) {
        if (listener != null) listener.onEvent(msg);
    }
}

// 链式计算器（非公开）
class Calculator {
    private int v;

    public Calculator(int v) {
        this.v = v;
    }

    public Calculator add(int n) { v += n; return this; }
    public Calculator subtract(int n) { v -= n; return this; }
    public Calculator multiply(int n) { v *= n; return this; }
    public int value() { return v; }
}`
  },
  {
    id: "java-enum-basics",
    group: "内部类与枚举",
    icon: "📊",
    title: "枚举基础",
    content: `# 枚举基础

枚举（Enum）是 Java 5 引入的特性，用 \`enum\` 关键字定义一组**固定的命名常量**。它比传统的 \`public static final int\` 常量更安全、更强大。

## 定义枚举

\`\`\`java
enum Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}
\`\`\`

枚举常量默认是 \`public static final\`，且类型就是枚举本身。

## 枚举是类

Java 的枚举本质上是继承自 \`java.lang.Enum\` 的**最终类**。每个常量都是该类的单例实例。因此枚举可以：

- 拥有字段、方法、构造器
- 实现接口
- 定义抽象方法由常量实现

## values() 遍历

\`values()\` 返回所有常量数组（顺序为声明顺序）：

\`\`\`java
for (Day d : Day.values()) {
    System.out.println(d);
}
\`\`\`

## valueOf(String)

按名称字符串反查枚举常量，找不到会抛 \`IllegalArgumentException\`：

\`\`\`java
Day d = Day.valueOf("FRIDAY");
\`\`\`

## ordinal() 与 name()

- \`ordinal()\` 返回声明顺序（从 0 开始），但**不建议**依赖它做业务逻辑
- \`name()\` 返回常量名称字符串

## 枚举比较

枚举可用 \`==\` 比较，因为每个常量都是单例，比 \`equals\` 更简洁且安全。

## 相比 int 常量的优势

- **类型安全**：无法传入非法值
- **命名空间**：枚举常量有归属
- **可读性**：调试输出名称而非数字
- **可扩展**：可附加字段、方法

下面通过代码演示枚举的基础用法：`,
    code: `// 演示枚举基础
public class Main {
    public static void main(String[] args) {
        // 枚举常量
        Day today = Day.WEDNESDAY;
        System.out.println("今天是: " + today);
        System.out.println("序号 ordinal: " + today.ordinal());
        System.out.println("名称 name: " + today.name());

        // values() 遍历所有常量
        System.out.println("\\n所有星期:");
        for (Day d : Day.values()) {
            System.out.println(d.ordinal() + ": " + d.name());
        }

        // valueOf() 由字符串转枚举
        Day parsed = Day.valueOf("FRIDAY");
        System.out.println("\\n解析: " + parsed);

        // valueOf 不存在会抛异常
        try {
            Day.valueOf("HOLIDAY");
        } catch (IllegalArgumentException e) {
            System.out.println("非法枚举值: " + e.getMessage());
        }

        // 枚举是类，可以有字段和方法
        System.out.println("\\n季节温度:");
        for (Season s : Season.values()) {
            System.out.println(s + " 平均温度: " + s.getAvgTemp() + "°C");
        }

        // 枚举比较用 == 而非 equals
        System.out.println("\\n比较: " + (Day.MONDAY == Day.MONDAY));
    }
}

// 星期枚举（非公开）
enum Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}

// 季节枚举带字段（非公开）
enum Season {
    SPRING(15), SUMMER(28), AUTUMN(18), WINTER(5);

    private final int avgTemp;

    Season(int avgTemp) {
        this.avgTemp = avgTemp;
    }

    public int getAvgTemp() {
        return avgTemp;
    }
}`
  },
  {
    id: "java-enum-methods",
    group: "内部类与枚举",
    icon: "🛠️",
    title: "枚举方法",
    content: `# 枚举方法

由于枚举本质是类，它完全可以拥有**字段、构造器、普通方法和抽象方法**，这使得枚举能携带丰富的行为。

## 自定义方法

\`\`\`java
enum HttpStatus {
    OK(200);
    private final int code;
    HttpStatus(int code) { this.code = code; }
    public int getCode() { return code; }
}
\`\`\`

## 枚举构造器

构造器只能在枚举内部使用（默认 private），用于为每个常量初始化字段。

## 抽象方法：常量特定实现

枚举可定义抽象方法，**每个常量必须各自实现**。这是实现"常量相关行为"的强大手段：

\`\`\`java
enum Operation {
    PLUS { public double apply(double a, double b) { return a + b; } },
    MINUS { public double apply(double a, double b) { return a - b; } };
    public abstract double apply(double a, double b);
}
\`\`\`

实际上每个常量成了枚举类的一个**匿名子类实例**，可以拥有不同实现。

## 重写 toString

默认 \`toString()\` 返回常量名，可重写为更友好的描述：

\`\`\`java
@Override
public String toString() {
    return code + " " + name();
}
\`\`\`

## 静态方法

枚举也可以定义静态方法，例如根据 code 反查枚举、提供默认值等。

## 设计要点

- 把与常量强相关的逻辑**放进枚举**，而不是写一堆 if-else
- 抽象方法让每个常量各自负责自己的行为，符合开闭原则
- 字段建议设为 final，枚举本质是不可变的

下面通过代码演示枚举的自定义方法、抽象方法与 toString 重写：`,
    code: `// 演示枚举方法
public class Main {
    public static void main(String[] args) {
        // 每个常量实现抽象方法（常量特定方法）
        for (Operation op : Operation.values()) {
            System.out.printf("%s: 10 %s 3 = %.2f%n", op, op.getSymbol(), op.apply(10, 3));
        }

        // 重写 toString
        System.out.println("\\nHttpStatus 示例:");
        System.out.println(HttpStatus.OK);
        System.out.println(HttpStatus.NOT_FOUND);
        System.out.println(HttpStatus.SERVER_ERROR);

        // 自定义方法
        System.out.println("\\n是否成功: " + HttpStatus.OK.isSuccess());
        System.out.println("是否成功: " + HttpStatus.NOT_FOUND.isSuccess());
    }
}

// 运算枚举：抽象方法由每个常量实现（非公开）
enum Operation {
    PLUS("+") {
        @Override public double apply(double a, double b) { return a + b; }
    },
    MINUS("-") {
        @Override public double apply(double a, double b) { return a - b; }
    },
    TIMES("*") {
        @Override public double apply(double a, double b) { return a * b; }
    },
    DIVIDE("/") {
        @Override public double apply(double a, double b) {
            if (b == 0) throw new ArithmeticException("除零");
            return a / b;
        }
    };

    private final String symbol;

    Operation(String symbol) {
        this.symbol = symbol;
    }

    public String getSymbol() { return symbol; }

    // 抽象方法：每个常量必须实现
    public abstract double apply(double a, double b);
}

// HTTP 状态码枚举（非公开）
enum HttpStatus {
    OK(200, "成功"),
    NOT_FOUND(404, "未找到"),
    SERVER_ERROR(500, "服务器错误");

    private final int code;
    private final String message;

    HttpStatus(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() { return code; }
    public String getMessage() { return message; }

    // 自定义方法
    public boolean isSuccess() {
        return code >= 200 && code < 300;
    }

    @Override
    public String toString() {
        return code + " " + name() + " (" + message + ")";
    }
}`
  },
  {
    id: "java-enum-constructor",
    group: "内部类与枚举",
    icon: "🏗️",
    title: "枚举构造器",
    content: `# 枚举构造器

枚举构造器用于在创建枚举常量时初始化字段。它有几个**与普通类构造器不同**的重要特性。

## 构造器私有

枚举构造器**默认且只能**是 private（显式写 public/protected 会编译错误）。这保证枚举常量只能由枚举自身创建，无法外部 new。

\`\`\`java
enum Planet {
    EARTH(5.976e+24, 6.37814e6);
    private final double mass;
    private final double radius;
    Planet(double mass, double radius) { // 隐式 private
        this.mass = mass;
        this.radius = radius;
    }
}
\`\`\`

## 构造器参数

每个常量声明时可带参数，参数会传给对应构造器：

\`\`\`java
EARTH(5.976e+24, 6.37814e6)  // 调用 Planet(double, double)
\`\`\`

## 字段初始化

构造器中初始化 final 字段是最常见做法。也可在字段声明处直接赋值，或用实例初始化块。

## 构造时机

枚举常量在**类加载时**按声明顺序构造，且只构造一次。因此：

- 枚举天生**线程安全**（类加载由 JVM 保证）
- 构造器中不能访问尚未构造的常量
- 不应在构造器中做耗时操作或启动线程

## 构造器中的限制

- 不能在构造器中调用该枚举的抽象方法（常量子类尚未完成初始化）
- 不能显式调用 \`super(...)\`（Enum 的构造由 JVM 处理）

## 不可变性

枚举字段建议全部 final，使枚举常量成为**不可变单例**，可安全共享。

下面通过代码演示枚举构造器的参数传递与字段初始化：`,
    code: `// 演示枚举构造器
public class Main {
    public static void main(String[] args) {
        System.out.println("星球信息:");
        for (Planet p : Planet.values()) {
            System.out.printf("%s: 质量=%.2e 半径=%.2e 表面重力=%.4f%n",
                p, p.getMass(), p.getRadius(), p.surfaceGravity());
        }

        // 计算地球上一个 70kg 人的重量
        double weight = Planet.EARTH.surfaceWeight(70);
        System.out.printf("%n70kg 人在地球上的重量: %.2f N%n", weight);

        // 同一物体在火星上的重量
        double marsWeight = Planet.MARS.surfaceWeight(70);
        System.out.printf("70kg 人在火星上的重量: %.2f N%n", marsWeight);

        // 构造时机：枚举常量在类加载时构造
        System.out.println("\\n枚举实例的类: " + Planet.EARTH.getClass().getName());
        System.out.println("是否是 Planet 实例: " + (Planet.EARTH instanceof Planet));
    }
}

// 星球枚举（非公开）
enum Planet {
    MERCURY(3.303e+23, 2.4397e6),
    VENUS(4.869e+24, 6.0518e6),
    EARTH(5.976e+24, 6.37814e6),
    MARS(6.421e+23, 3.3972e6);

    private static final double G = 6.67300E-11; // 万有引力常数

    private final double mass;   // 质量 kg
    private final double radius; // 半径 m

    // 枚举构造器：默认 private，显式写 public 会编译错误
    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
    }

    public double getMass() { return mass; }
    public double getRadius() { return radius; }

    // 表面重力
    double surfaceGravity() {
        return G * mass / (radius * radius);
    }

    // 物体在该星球表面的重量
    double surfaceWeight(double otherMass) {
        return otherMass * surfaceGravity();
    }

    @Override
    public String toString() {
        return name() + "(" + mass + ", " + radius + ")";
    }
}`
  },
  {
    id: "java-enum-switch",
    group: "内部类与枚举",
    icon: "🔀",
    title: "枚举与 switch",
    content: `# 枚举与 switch

枚举与 \`switch\` 是天然搭档。switch 对枚举有特殊支持，能写出**类型安全且可穷举**的分支逻辑。

## 基本 switch 语句

\`\`\`java
switch (light) {
    case RED: return "停";
    case YELLOW: return "注意";
    case GREEN: return "行";
}
\`\`\`

注意：case 标签使用的是**常量名**，不能写 \`case TrafficLight.RED:\`（编译器自动推断枚举类型）。

## 穷举检查

当 switch 覆盖了枚举的所有常量时，可以**省略 default**。如果将来新增一个常量而忘记添加分支，编译器会报错（在使用 switch 表达式时），从而强制更新逻辑。这是枚举相对 int 常量的一大安全优势。

## 现代 switch 表达式（Java 14+）

switch 可作为表达式返回值，并用箭头语法 \`->\` 避免忘记 break：

\`\`\`java
String action = switch (light) {
    case RED -> "停";
    case YELLOW -> "注意";
    case GREEN -> "行";
};
\`\`\`

- 箭头分支无需 break，不会贯穿
- 多个常量可合并：\`case A, B -> ...\`
- 表达式形式必须**穷尽所有可能**（或提供 default）

## 编译器优化

switch 对枚举通常编译为**跳表**或 ordinal 数组查找，性能接近 O(1)，比 if-else 链更高效。

## 何时用 switch vs 抽象方法

- 行为简单、与外部上下文耦合 → switch
- 行为是枚举固有属性、可复用 → 抽象方法（常量特定实现）

下面通过代码演示传统 switch 与现代 switch 表达式：`,
    code: `// 演示枚举与 switch
public class Main {
    public static void main(String[] args) {
        // 传统 switch 语句
        for (TrafficLight light : TrafficLight.values()) {
            System.out.println(light + " -> " + describeLight(light));
        }

        // 现代 switch 表达式（Java 14+）
        System.out.println("\\n动作建议:");
        for (TrafficLight light : TrafficLight.values()) {
            String action = switch (light) {
                case RED -> "停车等待";
                case YELLOW -> "准备停车";
                case GREEN -> "通行";
            };
            System.out.println(light + ": " + action);
        }

        // 穷举检查：覆盖所有枚举值，无需 default
        DayType type = getDayType(Day2.SATURDAY);
        System.out.println("\\n星期六类型: " + type);
    }

    // 传统 switch
    static String describeLight(TrafficLight light) {
        switch (light) {
            case RED: return "红灯停";
            case YELLOW: return "黄灯注意";
            case GREEN: return "绿灯行";
            default: throw new IllegalArgumentException("未知: " + light);
        }
    }

    // 穷举检查：覆盖所有枚举值，无需 default
    static DayType getDayType(Day2 day) {
        return switch (day) {
            case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY -> DayType.WORKDAY;
            case SATURDAY, SUNDAY -> DayType.WEEKEND;
        };
    }
}

// 交通灯枚举（非公开）
enum TrafficLight {
    RED, YELLOW, GREEN
}

// 星期枚举（非公开）
enum Day2 {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}

// 日类型枚举（非公开）
enum DayType {
    WORKDAY, WEEKEND
}`
  },
  {
    id: "java-enumset",
    group: "内部类与枚举",
    icon: "📦",
    title: "EnumSet",
    content: `# EnumSet

\`EnumSet\` 是专为枚举设计的 \`Set\` 实现，位于 \`java.util\`。它是表示"枚举子集"最高效的方式。

## 位向量实现

EnumSet 内部用**位向量**（bit vector）存储，每个枚举常量对应一个 bit。对于 64 个以内的常量，只需一个 \`long\`。集合运算（并、交、补）退化为位运算，速度极快。

## 常用工厂方法

\`\`\`java
EnumSet.allOf(Permission.class);        // 全部
EnumSet.noneOf(Permission.class);       // 空
EnumSet.of(Permission.READ);            // 指定元素
EnumSet.of(Permission.READ, Permission.WRITE); // 多个
EnumSet.range(Permission.READ, Permission.EXECUTE); // 范围
EnumSet.complementOf(set);              // 补集
EnumSet.copyOf(collection);             // 复制
\`\`\`

## 性能优势

- \`add\`/\`remove\`/\`contains\` 时间复杂度 O(1)，且常数极小
- 内存占用远低于 HashSet
- 批量运算（addAll/retainAll）利用位运算，几乎瞬时完成

## 使用场景

- 权限系统：用户拥有哪些权限的子集
- 配置开关：启用的功能组合
- 标志位集合：替代传统的 \`int flags\` 位运算

## 与 HashSet 的区别

| 特性 | EnumSet | HashSet |
|------|---------|---------|
| 元素类型 | 必须是枚举 | 任意 |
| 实现 | 位向量 | 哈希表 |
| 性能 | 极快 | 快 |
| 迭代顺序 | 声明顺序 | 不保证 |

## 注意事项

- EnumSet 是**抽象类**，返回的是 RegularEnumSet/JumboEnumSet 等具体子类
- 不允许 null 元素

下面通过代码演示 EnumSet 的各种工厂方法与权限管理：`,
    code: `// 演示 EnumSet
import java.util.EnumSet;

public class Main {
    public static void main(String[] args) {
        // allOf: 包含所有枚举值
        EnumSet<Permission> all = EnumSet.allOf(Permission.class);
        System.out.println("所有权限: " + all);

        // noneOf: 空集合
        EnumSet<Permission> empty = EnumSet.noneOf(Permission.class);
        System.out.println("空集合: " + empty);

        // of: 指定元素
        EnumSet<Permission> readOnly = EnumSet.of(Permission.READ);
        System.out.println("只读: " + readOnly);

        // of 多个元素
        EnumSet<Permission> rw = EnumSet.of(Permission.READ, Permission.WRITE);
        System.out.println("读写: " + rw);

        // range: 范围
        EnumSet<Permission> range = EnumSet.range(Permission.READ, Permission.EXECUTE);
        System.out.println("范围 READ..EXECUTE: " + range);

        // complementOf: 补集
        EnumSet<Permission> notRw = EnumSet.complementOf(rw);
        System.out.println("读写的补集: " + notRw);

        // 模拟用户权限
        User admin = new User("管理员", EnumSet.allOf(Permission.class));
        User guest = new User("访客", EnumSet.of(Permission.READ));

        admin.checkPermission(Permission.DELETE);
        guest.checkPermission(Permission.DELETE);
        guest.checkPermission(Permission.READ);

        // 集合运算：求共同权限
        EnumSet<Permission> common = EnumSet.copyOf(admin.permissions);
        common.retainAll(guest.permissions);
        System.out.println("\\n共同权限: " + common);
    }
}

// 权限枚举（非公开）
enum Permission {
    READ, WRITE, EXECUTE, DELETE
}

// 用户类（非公开）
class User {
    String name;
    EnumSet<Permission> permissions;

    User(String name, EnumSet<Permission> permissions) {
        this.name = name;
        this.permissions = permissions;
    }

    void checkPermission(Permission p) {
        boolean has = permissions.contains(p);
        System.out.println(name + " 拥有 " + p + ": " + has);
    }
}`
  },
  {
    id: "java-enummap",
    group: "内部类与枚举",
    icon: "🗺️",
    title: "EnumMap",
    content: `# EnumMap

\`EnumMap\` 是以枚举为键的专用 \`Map\` 实现，位于 \`java.util\`。它针对枚举键做了极致优化。

## 数组实现

EnumMap 内部用一个**与枚举常量同长度的数组**存储值，键的 ordinal 直接作为数组下标。因此：

- \`get\`/\`put\`/\`containsKey\` 都是 O(1)，且常数极小
- 没有哈希计算、没有冲突、没有扩容
- 内存紧凑

## 基本用法

\`\`\`java
EnumMap<Day, String> schedule = new EnumMap<>(Day.class);
schedule.put(Day.MONDAY, "开周会");
schedule.get(Day.MONDAY); // "开周会"
\`\`\`

注意构造时必须传入枚举的 Class 对象，以便确定数组长度。

## vs HashMap

| 特性 | EnumMap | HashMap |
|------|---------|---------|
| 键类型 | 必须是枚举 | 任意 |
| 实现 | 数组 | 哈希表 |
| 性能 | 极快 | 快 |
| 迭代顺序 | 枚举声明顺序 | 不保证 |
| 内存 | 紧凑 | 较大 |

## 性能优势

- 没有 hash 计算开销
- 没有 equals 比较（直接用 == 比较 ordinal）
- 没有 resize/rehash
- 实测在枚举键场景下比 HashMap 快数倍

## 使用场景

- 配置表：每个枚举值映射一个配置
- 状态转换表：状态枚举 → 下一状态
- 权重/优先级映射
- 日志/统计：枚举 → 计数

## 注意事项

- 不允许 null 键（但允许 null 值）
- 不是线程安全的，并发场景需外部同步或用 \`Collections.synchronizedMap\`

下面通过代码演示 EnumMap 的基本用法与统计场景：`,
    code: `// 演示 EnumMap
import java.util.EnumMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        // 基本用法：枚举作为键
        EnumMap<Day3, String> schedule = new EnumMap<>(Day3.class);
        schedule.put(Day3.MONDAY, "开周会");
        schedule.put(Day3.WEDNESDAY, "代码评审");
        schedule.put(Day3.FRIDAY, "发布版本");

        System.out.println("周计划:");
        for (Map.Entry<Day3, String> e : schedule.entrySet()) {
            System.out.println("  " + e.getKey() + ": " + e.getValue());
        }

        // getOrDefault
        System.out.println("\\n周二计划: " + schedule.getOrDefault(Day3.TUESDAY, "无安排"));

        // 统计枚举出现次数
        String[] logs = {"INFO", "WARN", "ERROR", "INFO", "INFO", "ERROR", "DEBUG"};
        EnumMap<LogLevel, Integer> counts = new EnumMap<>(LogLevel.class);
        for (String s : logs) {
            LogLevel level = LogLevel.valueOf(s);
            counts.merge(level, 1, Integer::sum);
        }
        System.out.println("\\n日志统计:");
        for (LogLevel lvl : LogLevel.values()) {
            System.out.println("  " + lvl + ": " + counts.getOrDefault(lvl, 0));
        }

        // EnumMap 用数组实现，O(1) 访问
        EnumMap<Season2, Double> avgRain = new EnumMap<>(Season2.class);
        avgRain.put(Season2.SPRING, 80.0);
        avgRain.put(Season2.SUMMER, 200.0);
        avgRain.put(Season2.AUTUMN, 60.0);
        avgRain.put(Season2.WINTER, 20.0);

        double total = 0;
        for (double r : avgRain.values()) total += r;
        System.out.printf("%n全年降雨量: %.1f mm%n", total);
    }
}

// 星期枚举（非公开）
enum Day3 {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}

// 日志级别枚举（非公开）
enum LogLevel {
    DEBUG, INFO, WARN, ERROR
}

// 季节枚举（非公开）
enum Season2 {
    SPRING, SUMMER, AUTUMN, WINTER
}`
  },
  {
    id: "java-enum-singleton",
    group: "内部类与枚举",
    icon: "🔒",
    title: "枚举单例",
    content: `# 枚举单例

《Effective Java》第 3 条指出：**实现单例的最佳方式是枚举**。枚举单例能同时解决线程安全、序列化和反射攻击三大难题。

## 基本形式

\`\`\`java
public enum Singleton {
    INSTANCE;
    public void doSomething() { ... }
}
\`\`\`

使用：\`Singleton.INSTANCE.doSomething()\`。

## 线程安全

枚举常量在**类加载阶段**由 JVM 初始化，且 JVM 保证类加载线程安全。因此枚举单例天生线程安全，无需双重检查锁或同步块。

## 防序列化

普通单例实现 \`Serializable\` 后，反序列化会创建新实例破坏单例。而枚举的序列化机制**只序列化常量名**，反序列化时通过 \`valueOf\` 返回已有常量，不会创建新对象。无需实现 \`readResolve\`。

## 防反射攻击

通过反射 \`Constructor.newInstance()\` 创建枚举会抛 \`IllegalArgumentException\`，JVM 在底层阻止了枚举的反射实例化。而普通单例可通过反射破坏私有构造器。

## 对比其他实现

| 实现 | 线程安全 | 防序列化 | 防反射 | 懒加载 |
|------|---------|---------|--------|--------|
| 饿汉式 | 是 | 否 | 否 | 否 |
| 双重检查 | 是 | 否 | 否 | 是 |
| 静态内部类 | 是 | 否 | 否 | 是 |
| **枚举** | **是** | **是** | **是** | 否 |

## 局限

- 枚举单例在类加载时就初始化，**不支持懒加载**
- 不能继承其他类（枚举已默认继承 Enum）
- 若需懒加载，可用静态内部类_holder 模式

下面通过代码演示枚举单例的配置中心与线程安全计数器：`,
    code: `// 演示枚举单例
public class Main {
    public static void main(String[] args) {
        // 获取单例实例
        AppConfig config1 = AppConfig.INSTANCE;
        AppConfig config2 = AppConfig.INSTANCE;

        // 验证是同一实例
        System.out.println("同一实例: " + (config1 == config2));
        System.out.println("hashCode 一致: " + (config1.hashCode() == config2.hashCode()));

        // 使用单例
        config1.set("appName", "我的应用");
        config1.set("version", "1.0.0");
        config1.set("debug", "true");

        System.out.println("\\n应用配置:");
        System.out.println("  appName: " + config2.get("appName"));
        System.out.println("  version: " + config1.get("version"));
        System.out.println("  debug: " + config1.get("debug"));

        // 多线程安全测试
        System.out.println("\\n多线程获取计数器:");
        Runnable task = () -> {
            Counter c = Counter.INSTANCE;
            for (int i = 0; i < 1000; i++) c.increment();
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();
        try {
            t1.join();
            t2.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        System.out.println("最终计数: " + Counter.INSTANCE.getCount());
    }
}

// 枚举单例：配置中心（非公开）
enum AppConfig {
    INSTANCE; // 唯一实例

    private final java.util.HashMap<String, String> store = new java.util.HashMap<>();

    public String get(String key) {
        return store.get(key);
    }

    public void set(String key, String value) {
        store.put(key, value);
    }
}

// 枚举单例：线程安全计数器（非公开）
enum Counter {
    INSTANCE;

    private int count = 0;

    public synchronized void increment() {
        count++;
    }

    public int getCount() {
        return count;
    }
}`
  },
  {
    id: "java-enum-strategy",
    group: "内部类与枚举",
    icon: "🎯",
    title: "枚举策略模式",
    content: `# 枚举策略模式

策略模式旨在让算法可互换。用枚举实现策略模式，能让每个常量封装自己的行为，**彻底消除 if-else 链**。

## 传统痛点

\`\`\`java
// 反例：一堆 if-else，扩展需修改此处
double discount(CustomerType type, double price) {
    if (type == VIP) return price * 0.9;
    else if (type == SVIP) return price * 0.75;
    else return price;
}
\`\`\`

新增类型必须修改此方法，违反开闭原则。

## 枚举策略实现

把行为放进枚举，每个常量实现抽象方法：

\`\`\`java
enum CustomerType {
    NORMAL { public double apply(double p) { return p; } },
    VIP    { public double apply(double p) { return p * 0.9; } },
    SVIP   { public double apply(double p) { return p * 0.75; } };
    public abstract double apply(double price);
}
\`\`\`

调用方只需 \`type.apply(price)\`，新增类型只需在枚举里加一个常量，无需改动调用代码。

## 状态机

枚举策略的另一种形态是状态机：每个状态常量定义 \`next()\` 返回下一状态，把状态流转逻辑分散到各状态自身：

\`\`\`java
enum OrderState {
    PENDING { OrderState next() { return PAID; } },
    PAID    { OrderState next() { return SHIPPED; } },
    ...
}
\`\`\`

## 优势

- 消除 if-else，代码更清晰
- 新增策略/状态只改枚举，符合开闭原则
- 编译期保证每种情况都有实现
- 天生线程安全（枚举常量不可变）

## 适用场景

- 不同类型有不同计算逻辑（折扣、税率、运费）
- 状态流转、工作流
- 命令分发、操作路由

下面通过代码演示枚举策略模式与状态机：`,
    code: `// 演示枚举策略模式
public class Main {
    public static void main(String[] args) {
        // 策略模式：每个枚举常量封装不同行为，消除 if-else
        double[] prices = {100.0, 200.0, 500.0, 1000.0};

        for (CustomerType type : CustomerType.values()) {
            System.out.println("\\n" + type + " 价格:");
            for (double price : prices) {
                double finalPrice = type.applyDiscount(price);
                System.out.printf("  原价 %.2f -> 折后 %.2f (省 %.2f)%n",
                    price, finalPrice, price - finalPrice);
            }
        }

        // 状态机：订单流转
        System.out.println("\\n订单状态流转:");
        Order order = new Order();
        order.print();
        order.next(); // 待支付 -> 已支付
        order.print();
        order.next(); // 已支付 -> 已发货
        order.print();
        order.next(); // 已发货 -> 已完成
        order.print();
        order.next(); // 已完成（终态）
        order.print();
    }
}

// 客户类型策略枚举（非公开）
enum CustomerType {
    NORMAL {
        @Override public double applyDiscount(double price) { return price; }
    },
    VIP {
        @Override public double applyDiscount(double price) { return price * 0.9; }
    },
    SVIP {
        @Override public double applyDiscount(double price) { return price * 0.75; }
    };

    // 抽象策略方法：每个常量各自实现
    public abstract double applyDiscount(double price);
}

// 订单状态枚举（状态机）
enum OrderState {
    PENDING_PAYMENT {
        @Override OrderState next() { return PAID; }
        @Override String desc() { return "待支付"; }
    },
    PAID {
        @Override OrderState next() { return SHIPPED; }
        @Override String desc() { return "已支付"; }
    },
    SHIPPED {
        @Override OrderState next() { return COMPLETED; }
        @Override String desc() { return "已发货"; }
    },
    COMPLETED {
        @Override OrderState next() { return this; } // 终态
        @Override String desc() { return "已完成"; }
    };

    abstract OrderState next();
    abstract String desc();
}

// 订单类（非公开）
class Order {
    private OrderState state = OrderState.PENDING_PAYMENT;

    void next() {
        state = state.next();
    }

    void print() {
        System.out.println("订单状态: " + state.desc() + " (" + state + ")");
    }
}`
  },
  {
    id: "java-enum-interface",
    group: "内部类与枚举",
    icon: "🔌",
    title: "枚举与接口",
    content: `# 枚举与接口

虽然枚举不能继承其他类（已默认继承 \`Enum\`），但它**可以实现接口**。这为枚举带来了多态与扩展能力。

## 枚举实现接口

\`\`\`java
interface Shape { double area(double p); }

enum ShapeType implements Shape {
    CIRCLE { public double area(double r) { return Math.PI * r * r; } },
    SQUARE { public double area(double s) { return s * s; } };
}
\`\`\`

## 以接口类型引用枚举

实现接口后，可把枚举常量当作接口类型使用，实现统一处理：

\`\`\`java
Shape s = ShapeType.CIRCLE;
s.area(3);
\`\`\`

## 多枚举实现同一接口

接口可以成为**多个枚举的公共抽象**。例如不同的形状枚举、不同的支付方式枚举，都实现同一 \`Describable\` 接口，从而能被同一段代码处理。

## 接口模拟"枚举继承"

由于枚举不能继承，若想给一组枚举添加共同行为，可定义一个接口让它们都实现，再用接口统一调用。

## 抽象方法 vs 接口

- 枚举自身的抽象方法：常量必须实现，但**只能在枚举内部**使用
- 接口方法：常量可实现，且能被**外部以接口类型**调用，更灵活

## 设计要点

- 把"对外契约"放进接口，把"常量特定行为"放进枚举抽象方法
- 接口让枚举可参与更通用的多态体系
- 一个枚举可实现多个接口

下面通过代码演示枚举实现接口与统一调度：`,
    code: `// 演示枚举与接口
public class Main {
    public static void main(String[] args) {
        // 多个常量实现同一接口，统一调用
        Shape circle = ShapeType.CIRCLE;
        Shape square = ShapeType.SQUARE;

        System.out.printf("圆面积 (r=3): %.2f%n", circle.area(3));
        System.out.printf("正方形面积 (s=3): %.2f%n", square.area(3));

        // 统一处理：以接口类型引用
        Shape[] shapes = {ShapeType.CIRCLE, ShapeType.SQUARE, ShapeType.TRIANGLE};
        double param = 4;
        for (Shape s : shapes) {
            System.out.printf("%s 面积 (参数 %.1f): %.2f%n",
                ((Enum<?>) s).name(), param, s.area(param));
        }

        // 枚举实现多个接口
        System.out.println("\\n颜色分类:");
        for (ColorCategory c : ColorCategory.values()) {
            System.out.println("  " + c + " -> " + c.category() + ", 温度: " + c.warmth());
        }

        // 不同枚举统一调度（接口参数）
        printInfo(ShapeType.CIRCLE);
        printInfo(ColorCategory.RED);
    }

    // 接口参数，可接收任何实现的枚举
    static void printInfo(Describable d) {
        System.out.println("描述: " + d.describe());
    }
}

// 形状接口（非公开）
interface Shape {
    double area(double param);
}

// 形状枚举实现接口
enum ShapeType implements Shape {
    CIRCLE {
        @Override public double area(double r) { return Math.PI * r * r; }
    },
    SQUARE {
        @Override public double area(double side) { return side * side; }
    },
    TRIANGLE {
        @Override public double area(double base) { return 0.5 * base * base; } // 等腰直角
    };
}

// 可描述接口（非公开）
interface Describable {
    String describe();
}

// 颜色分类枚举实现多个接口
enum ColorCategory implements Describable {
    RED("暖色", 1.0),
    ORANGE("暖色", 0.9),
    BLUE("冷色", -0.8),
    GREEN("冷色", -0.5);

    private final String category;
    private final double warmth;

    ColorCategory(String category, double warmth) {
        this.category = category;
        this.warmth = warmth;
    }

    public String category() { return category; }
    public double warmth() { return warmth; }

    @Override
    public String describe() {
        return name() + " 属于 " + category;
    }
}`
  },
  {
    id: "java-enum-best-practices",
    group: "内部类与枚举",
    icon: "✅",
    title: "枚举最佳实践",
    content: `# 枚举最佳实践

枚举是 Java 中表达"有限常量集合"的最佳工具。掌握以下实践能写出更健壮、可维护的代码。

## 1. 用枚举代替 int 常量

\`\`\`java
// 反例
public static final int STATUS_PAID = 1;
// 正例
enum OrderStatus { PAID, SHIPPED, COMPLETED }
\`\`\`

枚举提供类型安全、命名空间、可读性，且能携带字段与方法。

## 2. 枚举与数据绑定

为枚举附加 code、label 等字段，便于与数据库、前端对接。并提供 \`fromCode()\` 反查方法，处理非法值返回 null 或抛异常。

\`\`\`java
enum OrderStatus {
    PAID(2, "已支付");
    private final int code;
    static OrderStatus fromCode(int c) { ... }
}
\`\`\`

## 3. 用 EnumSet 表示组合

权限、功能开关等"子集"用 EnumSet，比位运算 int flags 更安全、更清晰。

## 4. 用 EnumMap 做枚举键映射

枚举键映射优先用 EnumMap，性能远超 HashMap。

## 5. 枚举序列化安全

枚举序列化只存 name，反序列化通过 valueOf 还原，天生防止单例破坏与版本不一致问题。注意：**不要依赖 ordinal 序列化**，因为增删常量会改变 ordinal。

## 6. 枚举性能

- \`values()\` 每次返回**新数组**，频繁调用应缓存
- \`valueOf\` 基于 HashMap，O(1)
- switch 对枚举编译为跳表，高效

## 7. 配合 switch 实现开闭原则

把与外部上下文相关的分支用 switch 表达式（需穷举），新增常量时编译器强制更新。

## 8. 不可变与线程安全

枚举字段建议全部 final，常量本身不可变，可安全共享于多线程。

下面通过代码综合演示枚举最佳实践：`,
    code: `// 演示枚举最佳实践
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        // 1. 用枚举代替 int 常量：类型安全、有命名空间
        OrderStatus status = OrderStatus.SHIPPED;
        System.out.println("订单状态: " + status + " (code=" + status.getCode() + ")");

        // 2. 枚举与数据：通过 code 反查枚举
        OrderStatus fromCode = OrderStatus.fromCode(3);
        System.out.println("由 code=3 查得: " + fromCode);
        System.out.println("非法 code 查得: " + OrderStatus.fromCode(99));

        // 3. 枚举与 EnumSet 表示组合状态
        EnumSet<Feature> enabled = EnumSet.of(Feature.LOGIN, Feature.SEARCH, Feature.CART);
        System.out.println("\\n已启用功能: " + enabled);
        System.out.println("是否启用支付: " + enabled.contains(Feature.PAYMENT));

        // 4. 枚举与 EnumMap 做映射
        EnumMap<Priority, Integer> weights = new EnumMap<>(Priority.class);
        weights.put(Priority.LOW, 1);
        weights.put(Priority.MEDIUM, 5);
        weights.put(Priority.HIGH, 10);
        weights.put(Priority.URGENT, 100);

        System.out.println("\\n优先级权重:");
        for (Map.Entry<Priority, Integer> e : weights.entrySet()) {
            System.out.println("  " + e.getKey() + ": " + e.getValue());
        }

        // 5. 枚举序列化安全（默认按 name 序列化）
        System.out.println("\\n序列化演示:");
        System.out.println("URGENT.name(): " + Priority.URGENT.name());

        // 6. 枚举性能：values() 每次返回新数组，可缓存
        Priority[] all = Priority.values();
        System.out.println("缓存数组长度: " + all.length);

        // 7. 枚举配合 switch 实现开闭原则
        System.out.println("\\n处理优先级:");
        for (Priority p : Priority.values()) {
            handlePriority(p);
        }
    }

    // 穷举 switch，新增常量时编译器强制更新
    static void handlePriority(Priority p) {
        switch (p) {
            case URGENT -> System.out.println(p + ": 立即处理!");
            case HIGH -> System.out.println(p + ": 今天内处理");
            case MEDIUM -> System.out.println(p + ": 本周处理");
            case LOW -> System.out.println(p + ": 有空再处理");
        }
    }
}

// 订单状态枚举（非公开）
enum OrderStatus {
    PENDING(1, "待支付"),
    PAID(2, "已支付"),
    SHIPPED(3, "已发货"),
    COMPLETED(4, "已完成"),
    CANCELLED(5, "已取消");

    private final int code;
    private final String label;

    OrderStatus(int code, String label) {
        this.code = code;
        this.label = label;
    }

    public int getCode() { return code; }
    public String getLabel() { return label; }

    // 通过 code 反查枚举，处理非法值
    public static OrderStatus fromCode(int code) {
        for (OrderStatus s : values()) {
            if (s.code == code) return s;
        }
        return null;
    }
}

// 功能特性枚举（非公开）
enum Feature {
    LOGIN, SEARCH, CART, PAYMENT, ADMIN
}

// 优先级枚举（非公开）
enum Priority {
    LOW, MEDIUM, HIGH, URGENT
}`
  }
];
