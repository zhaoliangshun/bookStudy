// =============================================================
// Java 交互式教程 —— 第十五批章节（泛型深入组，共 15 章）
// =============================================================

export const chapters = [
  {
    id: "java-generics-class",
    group: "泛型深入",
    icon: "📦",
    title: "泛型类",
    content: `# 泛型类

**泛型（Generics）** 是 JDK 5 引入的特性，本质是**参数化类型**：把类型当作参数传递给类、接口或方法，从而实现一份代码处理多种类型，并在编译期保证类型安全。

## 为什么需要泛型

没有泛型时，集合只能存 \`Object\`，取出来必须强转，且编译器无法发现类型错误：

\`\`\`java
List list = new ArrayList();  // 声明变量 list（List），初始值为 new ArrayList()
list.add("hello");  // 调用 list 的 add 方法
Integer n = (Integer) list.get(0); // 运行时 ClassCastException
\`\`\`

泛型把"运行时才发现的错误"提前到"编译时"：

\`\`\`java
List<String> list = new ArrayList<>();  // 声明变量 list（List<String>），初始值为 new ArrayList<>()
list.add("hello");  // 调用 list 的 add 方法
// list.add(100); // 编译错误，编译期就拒绝
String s = list.get(0); // 无需强转
\`\`\`

## 泛型类定义

在类名后用尖括号声明**类型参数（Type Parameter）**：

\`\`\`java
public class Box<T> {  // 定义类 Box
    private T item;  // 声明私有变量 item（T 类型）
    public void set(T item) { this.item = item; }
    public T get() { return item; }  // 方法 get（返回 T，无参数）：返回 item
}
\`\`\`

\`T\` 是占位符，使用时才确定具体类型。实例化时把 \`T\` 替换为真实类型。

## 类型参数命名约定

| 名称 | 含义 | 常见场景 |
|------|------|----------|
| T | Type | 任意类型 |
| E | Element | 集合元素 |
| K / V | Key / Value | Map 键值 |
| R | Result | 返回结果 |
| N | Number | 数字 |

约定俗成的单字母命名，让代码更易读。

## 多类型参数

一个类可以声明多个类型参数：

\`\`\`java
public class Pair<K, V> {  // 定义类 Pair
    private K key;  // 声明私有变量 key（K 类型）
    private V value;  // 声明私有变量 value（V 类型）
    public Pair(K key, V value) { this.key = key; this.value = value; }
}
\`\`\`

## 菱形运算符 <>

JDK 7 起支持**菱形运算符**，构造时省略类型参数，由编译器从变量声明处推断：

\`\`\`java
Box<String> box = new Box<>(); // 右边 <> 自动推断为 String
\`\`\`

## 使用泛型类

泛型类让数据结构可以"装任意类型"，而类型安全由编译器把关。下面通过 \`Box<T>\` 与 \`Pair<K,V>\` 演示泛型类的定义与使用：`,
    code: `// 演示泛型类的定义与使用
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 单类型参数泛型类 =====
        Box<String> strBox = new Box<>("Java"); // 菱形运算符推断为 String
        System.out.println("字符串盒子: " + strBox.get());

        Box<Integer> intBox = new Box<>(100);  // 推断为 Integer
        System.out.println("整数盒子: " + intBox.get());

        // 类型安全：编译期就会拒绝错误类型
        // strBox.set(123); // 编译错误：只能放 String

        // ===== 多类型参数泛型类 =====
        Pair<String, Integer> p1 = new Pair<>("age", 18);
        Pair<String, String> p2 = new Pair<>("name", "Alice");
        System.out.println(p1.getKey() + " = " + p1.getValue());
        System.out.println(p2.getKey() + " = " + p2.getValue());

        // ===== 同一个泛型类是不同的类型 =====
        Class<?> c1 = strBox.getClass();
        Class<?> c2 = intBox.getClass();
        System.out.println("Box<String> 与 Box<Integer> 同一个类: " + (c1 == c2));

        // ===== 泛型类做容器 =====
        Box<List<String>> listBox = new Box<>(Arrays.asList("a", "b", "c"));
        System.out.println("盒子里的列表: " + listBox.get());
    }
}

// 泛型类：盒子（单类型参数 T）
class Box<T> {
    private T item;
    public Box(T item) { this.item = item; }
    public T get() { return item; }
    public void set(T item) { this.item = item; }
}

// 泛型类：键值对（多类型参数 K, V）
class Pair<K, V> {
    private final K key;
    private final V value;
    public Pair(K key, V value) { this.key = key; this.value = value; }
    public K getKey() { return key; }
    public V getValue() { return value; }
}`
  },
  {
    id: "java-generics-method",
    group: "泛型深入",
    icon: "📝",
    title: "泛型方法",
    content: `# 泛型方法

**泛型方法** 是在自己声明类型参数的方法，可以位于普通类或泛型类中。类型参数的作用域仅限该方法本身。

## 定义语法

类型参数声明 \`<T>\` 放在**返回值之前**：

\`\`\`java
public static <T> T identity(T t) {
    return t;  // 返回值：t
}
\`\`\`

注意 \`<T>\` 的位置：修饰符之后、返回类型之前。这是与泛型类最大的语法区别。

## 与泛型类的区别

- 泛型类的类型参数对**整个类**的所有方法生效
- 泛型方法的类型参数**只对该方法**生效
- 泛型类中的方法若使用了新的类型参数 \`<E>\`，那它就是独立的泛型方法

## 调用方式

调用泛型方法时，类型参数可以**显式指定**，也可以让编译器**自动推断**：

\`\`\`java
// 显式指定
String s = MyUtil.<String>identity("hi");  // 声明变量 s（String），初始值为 MyUtil.<String>identity("hi")
// 自动推断（推荐）
Integer n = identity(100); // 根据实参推断 T = Integer
\`\`\`

## 可变参数泛型方法

泛型方法常与可变参数 \`T...\` 配合：

\`\`\`java
@SafeVarargs  // 注解：SafeVarargs
public static <T> List<T> toList(T... items) { ... }
\`\`\`

\`@SafeVarargs\` 抑制"堆污染"警告，表示方法不会向可变参数数组写入不安全数据。

## 多类型参数

泛型方法可声明多个类型参数：

\`\`\`java
public static <K, V> Pair<K, V> makePair(K k, V v) { ... }
\`\`\`

## 类型推断

Java 编译器会根据**实参类型**和**目标类型（返回值赋值变量）**综合推断 \`T\`，绝大多数情况下无需显式指定。Java 8+ 进一步增强了目标类型推断能力。

## 有界类型参数

用 \`<T extends X>\` 给类型参数加约束，限定 \`T\` 必须是 \`X\` 或其子类。这在泛型方法中非常常见：

\`\`\`java
// T 必须实现 Comparable<T>，才能调用 compareTo
public static <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;  // 返回值：a.compareTo(b) >= 0 ? a : b
}
\`\`\`

有了边界，方法体内就能安全调用 \`X\` 的方法。边界可以是类或接口，多个边界用 \`&\` 连接：\`<T extends Number & Comparable<T>\`。

## 应用场景

泛型方法是编写**通用工具方法**的首选手段：

- \`Collections.sort\`、\`Collections.binarySearch\` 等集合工具
- \`Optional.of\`、\`Stream.of\` 等工厂方法
- 自定义转换、聚合、校验函数

相比"参数用 \`Object\` + 强转"，泛型方法在编译期就保证类型安全，调用方无需强转，IDE 也能提供更好的提示。

下面通过几个典型泛型方法演示定义、调用与推断：`,
    code: `// 演示泛型方法的定义、调用与类型推断
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 类型推断：根据实参推断 T =====
        String s = identity("Hello");      // 推断 T = String
        Integer i = identity(100);         // 推断 T = Integer
        System.out.println("identity String: " + s);
        System.out.println("identity Integer: " + i);

        // 显式指定类型参数（推断不出时才用）
        Double d = Main.<Double>identity(3.14);
        System.out.println("identity Double: " + d);

        // ===== 可变参数泛型方法 =====
        List<Integer> nums = toList(1, 2, 3, 4);
        List<String> strs = toList("a", "b");
        System.out.println("toList Integer: " + nums);
        System.out.println("toList String: " + strs);

        // ===== 多类型参数泛型方法 =====
        Pair<String, Integer> p = makePair("score", 95);
        System.out.println(p);

        // ===== 泛型方法实现工具函数 =====
        System.out.println("第一个元素: " + firstOf(nums));
        System.out.println("数组最大值: " + max(3, 1, 2));
    }

    // <T> 在返回值前声明类型参数
    public static <T> T identity(T t) {
        return t;
    }

    // 泛型方法 + 可变参数
    @SafeVarargs
    public static <T> List<T> toList(T... items) {
        List<T> list = new ArrayList<>();
        for (T item : items) list.add(item);
        return list;
    }

    // 多类型参数泛型方法
    public static <K, V> Pair<K, V> makePair(K k, V v) {
        return new Pair<>(k, v);
    }

    // 取列表第一个元素（有界类型参数 <T>）
    public static <T> T firstOf(List<T> list) {
        return list.isEmpty() ? null : list.get(0);
    }

    // 有界类型参数：T 必须实现 Comparable<T>
    @SafeVarargs
    public static <T extends Comparable<T>> T max(T... items) {
        T m = items[0];
        for (T t : items) if (t.compareTo(m) > 0) m = t;
        return m;
    }
}

// 辅助类：键值对
class Pair<K, V> {
    private final K key;
    private final V value;
    Pair(K key, V value) { this.key = key; this.value = value; }
    public String toString() { return key + " -> " + value; }
}`
  },
  {
    id: "java-generics-interface",
    group: "泛型深入",
    icon: "🔌",
    title: "泛型接口",
    content: `# 泛型接口

**泛型接口** 与泛型类类似，在接口名后声明类型参数。它常用于定义"对某种类型进行操作"的契约。

## 定义语法

\`\`\`java
public interface Repository<T> {  // 定义接口 Repository
    void save(T entity);  // 方法 save，返回 void，参数：T entity
    T findById(int id);  // 方法 findById，返回 T，参数：int id
}
\`\`\`

## 两种实现方式

实现泛型接口时，可以**指定具体类型**，也可以**继续保留类型参数**：

\`\`\`java
// 方式一：指定具体类型
class UserRepository implements Repository<User> { ... }  // 定义类 UserRepository

// 方式二：保留类型参数（实现类本身也是泛型类）
class GenericRepo<T> implements Repository<T> { ... }  // 定义类 GenericRepo
\`\`\`

## 经典泛型接口

JDK 中大量核心接口是泛型接口：

- **\`Comparable<T>\`**：定义对象自然排序，\`compareTo(T o)\` 返回 int
- **\`Iterable<T>\`**：支持 for-each 遍历，\`iterator()\` 返回 \`Iterator<T>\`
- **\`Iterator<T>\`**：迭代器，\`hasNext()\` / \`next()\`
- **\`Comparator<T>\`**：定制排序比较器
- **\`Supplier<T>\` / \`Function<T,R>\`**：函数式接口（JDK 8+）

## Comparable<T> 的自反性

\`class X implements Comparable<X>\` 是典型写法，让 X 自己与自己比较。类型参数约束了 \`compareTo\` 的参数类型，避免传入异类对象。

## Iterable<T> 与 for-each

实现 \`Iterable<T>\` 的类可以被增强 for 循环遍历，这是 Java 语法糖的基础：

\`\`\`java
for (Integer n : new Range(1, 5)) { ... }
\`\`\`

编译器会转换为对 \`iterator()\` 的调用。

## 默认方法与泛型接口

Java 8+ 允许在接口中定义**默认方法**，泛型接口同样支持。这让接口既能定义契约，又能提供通用实现：

\`\`\`java
public interface Repository<T> {  // 定义接口 Repository
    void save(T entity);  // 方法 save，返回 void，参数：T entity
    T findById(int id);  // 方法 findById，返回 T，参数：int id
    default Optional<T> findOrEmpty(int id) {  // 方法 findOrEmpty，返回 Optional<T>，参数：int id
        return Optional.ofNullable(findById(id));  // 返回值：Optional.ofNullable(findById(id))
    }
}
\`\`\`

## 函数式接口与泛型

JDK 8 的函数式接口大量使用泛型：\`Function<T,R>\`、\`Predicate<T>\`、\`Consumer<T>\`、\`Supplier<T>\`。它们是 Stream API 与 Lambda 的基石：

\`\`\`java
Function<String, Integer> parser = Integer::parseInt;  // 方法引用：复用已有方法作为函数式接口实例
Predicate<String> nonEmpty = s -> !s.isEmpty();  // Lambda 表达式赋值给函数式接口变量
\`\`\`

## 设计意义

泛型接口让"对某种类型操作"的契约变得类型安全。\`Repository<User>\` 与 \`Repository<Order>\` 是不同的类型，编译器能区分，避免把 \`Order\` 存进 \`User\` 仓库。这是**依赖倒置**和**策略模式**中常用的抽象手段。

下面通过 \`Repository<T>\`、\`Comparable<T>\`、\`Iterable<T>\` 演示泛型接口的定义与实现：`,
    code: `// 演示泛型接口的定义与实现
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== Comparable<T>：自定义排序 =====
        List<Product> products = new ArrayList<>(Arrays.asList(
            new Product("apple", 5),
            new Product("banana", 3),
            new Product("cherry", 8)
        ));
        Collections.sort(products); // 使用 Comparable 自然排序
        System.out.println("按价格升序: " + products);

        // ===== Iterable<T>：自定义可迭代对象 =====
        Range range = new Range(1, 6);
        System.out.print("Range 遍历: ");
        for (int n : range) {
            System.out.print(n + " ");
        }
        System.out.println();

        // ===== 自定义 Repository<T> =====
        UserRepository repo = new UserRepository();
        repo.save(1, new User("Alice"));
        repo.save(2, new User("Bob"));
        System.out.println("查找用户: " + repo.findById(1));
        System.out.println("全部用户: " + repo.findAll());
    }
}

// 1. 自定义泛型接口
interface Repository<T> {
    void save(int id, T entity);
    T findById(int id);
}

// 2. 实现 Comparable<T>
class Product implements Comparable<Product> {
    String name;
    int price;
    Product(String name, int price) { this.name = name; this.price = price; }
    @Override
    public int compareTo(Product o) {
        return Integer.compare(this.price, o.price); // 按价格升序
    }
    public String toString() { return name + "(" + price + ")"; }
}

// 3. 实现 Iterable<T>
class Range implements Iterable<Integer> {
    private final int start;
    private final int end;
    Range(int start, int end) { this.start = start; this.end = end; }
    @Override
    public Iterator<Integer> iterator() {
        return new Iterator<Integer>() {
            int cur = start;
            public boolean hasNext() { return cur < end; }
            public Integer next() { return cur++; }
        };
    }
}

// 4. 实现自定义泛型接口 Repository<User>
class User {
    String name;
    User(String name) { this.name = name; }
    public String toString() { return name; }
}

class UserRepository implements Repository<User> {
    private final Map<Integer, User> store = new HashMap<>();
    public void save(int id, User entity) { store.put(id, entity); }
    public User findById(int id) { return store.get(id); }
    public Collection<User> findAll() { return store.values(); }
}`
  },
  {
    id: "java-wildcards",
    group: "泛型深入",
    icon: "❓",
    title: "通配符",
    content: `# 通配符

**通配符 \`?\`** 表示"未知类型"，配合上下界使用，让泛型 API 更灵活。它是泛型不变性（invariance）的"逃生通道"。

## 三种通配符

| 形式 | 名称 | 读写特性 |
|------|------|----------|
| \`<?>\` | 无界通配符 | 只能读 \`Object\`，不能写 |
| \`<? extends T>\` | 上界通配符 | 可读 T 及其子类，不能写 |
| \`<? super T>\` | 下界通配符 | 可写 T 及其子类，只能读 \`Object\` |

## 无界通配符 \`<?>\`

表示"任意类型的 List"，但不等于 \`List<Object>\`：

\`\`\`java
public static void printList(List<?> list) {  // 静态方法 printList，返回 void，参数：List<?> list
    for (Object o : list) System.out.println(o);  // 打印一行到标准输出（自动换行）
}
\`\`\`

\`List<Object>\` 只能接收 \`List<Object>\`（泛型不变），而 \`List<?>\` 可以接收任意 \`List<X>\`。但 \`List<?>\` **不能添加元素**（除 \`null\`），因为编译器无法保证类型安全。

## 上界 \`<? extends T>\`

\`List<? extends Number>\` 可接收 \`List<Integer>\`、\`List<Double>\`。这是**协变（covariant）**：子类型列表也是其子类。可读取 \`Number\`，但**不能写入**（除了 \`null\`）。

## 下界 \`<? super T>\`

\`List<? super Integer>\` 可接收 \`List<Integer>\`、\`List<Number>\`、\`List<Object>\`。这是**逆变（contravariant）**。可写入 \`Integer\`，但读取只能得到 \`Object\`。

## 为什么需要通配符

泛型是**不变**的：\`List<Integer>\` 不是 \`List<Number>\` 的子类。这保证了类型安全，但限制了 API 灵活性。通配符在不破坏类型安全的前提下，恢复了协变与逆变能力。

## \`<?> \` 与 \`List<Object>\` 的区别

这是初学者常混淆的点：

- \`List<Object>\`：声明列表"装 Object"，可读写任意对象，但只能接收 \`List<Object>\`（不变）
- \`List<?>\`：声明列表"装某种未知类型"，可接收任意 \`List<X>\`，但**不能写**（除 \`null\`），只能读 \`Object\`

简言之：\`List<Object>\` 是"能装任何东西的列表"，\`List<?>\` 是"装了某种东西、但不知道是什么的列表"。

## 捕获转换

编译器会把 \`List<?>\` 的元素"捕获"为某个具体但未知的类型 \`CAP#1\`。这让某些操作变得合法：

\`\`\`java
public static void swap(List<?> list, int i, int j) {  // 静态方法 swap，返回 void，参数：List<?> list, int i, int j
    swapHelper(list, i, j); // 通过辅助方法捕获通配符类型
}
private static <E> void swapHelper(List<E> list, int i, int j) {
    list.set(i, list.set(j, list.get(i))); // 合法：E 是具体类型
}
\`\`\`

这种"捕获辅助方法"模式让通配符代码也能执行需要读写的操作。

## 选择口诀 PECS

- **Producer Extends**：参数是生产者（只读）→ \`<? extends T>\`
- **Consumer Super**：参数是消费者（只写）→ \`<? super T>\`

下面通过三种通配符演示读写特性：`,
    code: `// 演示三种通配符的读写特性
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 无界通配符 <?> =====
        List<Integer> ints = Arrays.asList(1, 2, 3);
        List<String> strs = Arrays.asList("a", "b", "c");
        System.out.print("无界读 Integer 列表: ");
        printList(ints);
        System.out.print("无界读 String 列表: ");
        printList(strs);

        // ===== 上界通配符 <? extends Number>（协变，可读不可写）=====
        List<Integer> intList = Arrays.asList(10, 20, 30);
        List<Double> dblList = Arrays.asList(1.5, 2.5);
        System.out.println("sum(intList) = " + sum(intList));
        System.out.println("sum(dblList) = " + sum(dblList));

        // ===== 下界通配符 <? super Integer>（逆变，可写不可读具体类型）=====
        List<Number> numList = new ArrayList<>();
        addNumbers(numList); // 往 Number 列表里加 Integer
        System.out.println("addNumbers 后: " + numList);

        List<Object> objList = new ArrayList<>();
        addNumbers(objList); // 往 Object 列表里加 Integer
        System.out.println("addNumbers 到 Object 列表: " + objList);

        // ===== 关键对比：不变性 =====
        // List<Integer> 不是 List<Number> 的子类
        // List<Number> nums = intList; // 编译错误
        List<? extends Number> covariant = intList; // 上界实现协变
        System.out.println("协变读取: " + covariant.get(0));
    }

    // 无界通配符：接受任意类型列表，只读 Object，不能写
    public static void printList(List<?> list) {
        for (Object o : list) System.out.print(o + " ");
        System.out.println();
        // list.add("x"); // 编译错误：不能写入
    }

    // 上界通配符：生产者，可读 Number，不能写
    public static double sum(List<? extends Number> list) {
        double total = 0;
        for (Number n : list) total += n.doubleValue();
        // list.add(1); // 编译错误：不能写入
        return total;
    }

    // 下界通配符：消费者，可写 Integer，读取只能得 Object
    public static void addNumbers(List<? super Integer> list) {
        for (int i = 1; i <= 3; i++) list.add(i);
        // Integer x = list.get(0); // 编译错误：不能读取具体类型
        Object o = list.get(0); // 只能读 Object
    }
}`
  },
  {
    id: "java-upper-bounded",
    group: "泛型深入",
    icon: "⬆️",
    title: "上界通配符",
    content: `# 上界通配符

**上界通配符 \`<? extends T>\`** 限定类型必须是 \`T\` 或其子类。它实现泛型的**协变（covariance）**：\`List<Integer>\` 可以赋值给 \`List<? extends Number>\`。

## 协变

协变指"子类型列表也是父类型列表的子类"：

\`\`\`java
List<Integer> ints = ...;  // 声明变量 ints（List<Integer>），初始值为 ...
List<? extends Number> nums = ints; // OK，协变
\`\`\`

这让一个方法可以接收"任意 Number 子类的列表"，极大提升 API 通用性。

## 可读不可写

\`<? extends T>\` 是**生产者**（Producer），适合**读取**：

\`\`\`java
public static double sum(List<? extends Number> list) {  // 静态方法 sum，返回 double，参数：List<? extends Number> list
    double total = 0;  // 声明变量 total（double），初始值为 0
    for (Number n : list) total += n.doubleValue(); // 可安全读为 Number
    return total;  // 返回值：total
}
\`\`\`

但**不能写入**（除 \`null\`）：

\`\`\`java
list.add(1);    // 编译错误
list.add(1.0);  // 编译错误
\`\`\`

## 为什么不能写

编译器只知道列表"装的是某种 Number 子类"，但不知道具体是哪个。如果允许写入，就可能把 \`Double\` 塞进 \`List<Integer>\`，破坏类型安全。因此编译器一律拒绝写入。

## 为什么能读

无论列表实际装的是 \`Integer\` 还是 \`Double\`，它们都是 \`Number\`，所以一定能安全地读为 \`Number\`。这就是"协变读"安全的原因。

## 适用场景

- 需要从集合**读取**数据并当作 \`T\` 处理
- 只读遍历、求和、查找最大值等"消费数据"的操作
- 方法参数只想接受 \`T\` 的子类型集合

## 与有界类型参数的区别

\`<T extends Number>\` 和 \`<? extends Number>\` 看似相似，但用途不同：

- **\`<T extends Number>\`**：类型参数 \`T\` 在方法内可复用，表达多个参数间的类型依赖
- **\`<? extends Number>\`**：通配符，无法在方法内引用该类型，只用于"接受一族类型"

当方法只需读取、不需要在参数间传递类型时，用通配符更简洁；当需要在参数/返回值间保持类型一致时，用类型参数。

## JDK 中的例子

\`Collections.max\` 的签名就是上界通配符的经典应用：

\`\`\`java
public static <T extends Object & Comparable<? super T>> T max(Collection<? extends T> coll)
\`\`\`

参数 \`Collection<? extends T>\` 表示"读出 T 及其子类"，是典型的生产者。

## 记忆要点

> **上界 extends → 读（生产者）**

\`get\` 安全、\`add\` 不安全。下面通过求和、最大值演示上界通配符的读取能力：`,
    code: `// 演示上界通配符 <? extends T> 的协变与读取
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 协变：子类型列表可赋值给上界通配引用 =====
        List<Integer> intList = Arrays.asList(1, 2, 3, 4);
        List<Double> dblList = Arrays.asList(1.5, 2.5, 3.5);
        List<? extends Number> nums;

        nums = intList; // List<Integer> -> List<? extends Number>
        System.out.println("协变读取: " + nums.get(0));

        nums = dblList; // List<Double> -> List<? extends Number>
        System.out.println("协变读取: " + nums.get(0));

        // ===== 求和（只读操作）=====
        System.out.println("intList sum = " + sum(intList));
        System.out.println("dblList sum = " + sum(dblList));

        // ===== 求最大值 =====
        System.out.println("intList max = " + max(intList));
        System.out.println("dblList max = " + max(dblList));

        // ===== 不能写入的演示（注释为编译错误）=====
        // nums.add(1);    // 编译错误：不能写入 Integer
        // nums.add(1.0);  // 编译错误：不能写入 Double
        // nums.add(new Object()); // 编译错误
        // 唯一例外：null（但实际很少用）
    }

    // 上界通配符：协变读，可安全读为 Number
    public static double sum(List<? extends Number> list) {
        double total = 0;
        for (Number n : list) {
            total += n.doubleValue(); // 无论 Integer/Double 都是 Number
        }
        return total;
    }

    // 上界通配符配合有界类型参数：找最大值
    public static Number max(List<? extends Number> list) {
        if (list.isEmpty()) return null;
        Number m = list.get(0);
        for (Number n : list) {
            if (n.doubleValue() > m.doubleValue()) m = n;
        }
        return m;
    }

    // 复制：从生产者读出，写入消费者（PECS 完整示例）
    public static <T> void copy(List<? super T> dst, List<? extends T> src) {
        for (int i = 0; i < src.size(); i++) {
            dst.set(i, src.get(i)); // src 读、dst 写
        }
    }
}`
  },
  {
    id: "java-lower-bounded",
    group: "泛型深入",
    icon: "⬇️",
    title: "下界通配符",
    content: `# 下界通配符

**下界通配符 \`<? super T>\`** 限定类型必须是 \`T\` 或其父类。它实现泛型的**逆变（contravariance）**：\`List<Number>\` 可以赋值给 \`List<? super Integer>\`。

## 逆变

逆变指"父类型列表是子类型通配引用的子类"：

\`\`\`java
List<Number> numList = ...;  // 声明变量 numList（List<Number>），初始值为 ...
List<? super Integer> sink = numList; // OK，逆变
\`\`\`

这让一个方法可以接收"能装下 Integer 的任意列表"。

## 可写不可读（具体类型）

\`<? super T>\` 是**消费者**（Consumer），适合**写入**：

\`\`\`java
public static void addNumbers(List<? super Integer> list) {  // 静态方法 addNumbers，返回 void，参数：List<? super Integer> list
    list.add(1);  // 调用 list 的 add 方法
    list.add(2);  // 调用 list 的 add 方法
}
\`\`\`

但**读取只能得到 \`Object\`**：

\`\`\`java
Integer x = list.get(0);  // 编译错误
Object o = list.get(0);   // OK
\`\`\`

## 为什么能写

编译器知道列表"至少能装 Integer"（它是 \`Integer\` 或其父类的列表），所以往里放 \`Integer\` 一定安全。这就是"逆变写"安全的本质。

## 为什么不能读具体类型

列表可能是 \`List<Number>\` 或 \`List<Object>\`，读出的元素不一定是 \`Integer\`，所以编译器只能保证读出的是 \`Object\`。

## 适用场景

- 需要往集合**写入**数据
- 填充、追加、复制目标等"生产数据"的操作
- 方法参数想接受"能装 T 的容器"

## 与上界的对比

| 特性 | \`<? extends T>\` | \`<? super T>\` |
|------|------------------|----------------|
| 方向 | 协变（子类列表） | 逆变（父类列表） |
| 角色 | 生产者 | 消费者 |
| 读 | 可读为 \`T\` | 只能读 \`Object\` |
| 写 | 不能写 | 可写 \`T\` 及子类 |

两者互补，常常成对出现：一个方法读源、写目标，就用 \`extends\` + \`super\` 组合。

## JDK 中的例子

\`Collections.addAll\` 的签名使用了下界通配符：

\`\`\`java
public static <T> boolean addAll(Collection<? super T> c, T... elements)
\`\`\`

参数 \`Collection<? super T>\` 表示"能装下 T 的容器"，是典型的消费者。这样 \`addAll(list, "a", "b")\` 既能往 \`List<String>\` 加，也能往 \`List<Object>\` 加。

## 常见误区

- 误以为 \`<? super Integer>\` 能读出 \`Integer\`——其实只能读 \`Object\`
- 在返回值中使用下界通配符——返回 \`List<? super Integer>\` 会让调用方难以使用
- 混淆"下界"方向——\`super\` 是"父类方向"，不是"子类方向"

## 记忆要点

> **下界 super → 写（消费者）**

\`add\` 安全、\`get\` 只能得 \`Object\`。下面通过填充、复制演示下界通配符的写入能力：`,
    code: `// 演示下界通配符 <? super T> 的逆变与写入
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 逆变：父类型列表可赋值给下界通配引用 =====
        List<Number> numList = new ArrayList<>();
        List<Object> objList = new ArrayList<>();
        List<? super Integer> sink;

        sink = numList; // List<Number> -> List<? super Integer>
        sink = objList; // List<Object> -> List<? super Integer>

        // ===== 写入：可安全写入 Integer 及其子类 =====
        addNumbers(numList);
        addNumbers(objList);
        System.out.println("numList: " + numList);
        System.out.println("objList: " + objList);

        // ===== 读取只能得到 Object =====
        Object first = sink.get(0);
        System.out.println("读取为 Object: " + first);
        // Integer x = sink.get(0); // 编译错误：不能读具体类型

        // ===== 复制：源是生产者(extends)，目标是消费者(super) =====
        List<Integer> src = Arrays.asList(10, 20, 30);
        List<Number> dst = new ArrayList<>(Arrays.asList(0, 0, 0));
        copy(dst, src); // 从 src 读，写入 dst
        System.out.println("复制后 dst: " + dst);

        // ===== 计数器模式：消费者接收 =====
        List<Number> counter = new ArrayList<>();
        fill(counter, 5);
        System.out.println("填充后 counter: " + counter);
    }

    // 下界通配符：逆变写，可安全写入 Integer
    public static void addNumbers(List<? super Integer> list) {
        for (int i = 1; i <= 3; i++) {
            list.add(i); // 安全：列表至少能装 Integer
        }
    }

    // 下界通配符：填充 n 个元素
    public static void fill(List<? super Integer> list, int n) {
        for (int i = 0; i < n; i++) list.add(i);
    }

    // 复制：dst 消费(super)，src 生产(extends)
    public static <T> void copy(List<? super T> dst, List<? extends T> src) {
        for (int i = 0; i < src.size(); i++) {
            dst.set(i, src.get(i));
        }
    }
}`
  },
  {
    id: "java-pecs",
    group: "泛型深入",
    icon: "📖",
    title: "PECS 原则",
    content: `# PECS 原则

**PECS** = **P**roducer **E**xtends, **C**onsumer **S**uper。这是 Joshua Bloch 在《Effective Java》中提出的通配符选用准则，是泛型 API 设计的核心心法。

## 核心口诀

> **如果参数是生产者（只读），用 \`<? extends T>\`**
> **如果参数是消费者（只写），用 \`<? super T>\`**

## 什么叫生产者/消费者

从**方法的视角**看：

- **生产者（Producer）**：方法**从它读取**数据，它"产出"数据给方法
- **消费者（Consumer）**：方法**向它写入**数据，它"消费"方法产出的数据

## 何时用 extends

当方法只需要**读取**集合内容，不写入，就用 \`<? extends T>\`：

\`\`\`java
public static double sum(List<? extends Number> src) { ... } // 只读
\`\`\`

## 何时用 super

当方法只需要**写入**集合，不读取具体类型，就用 \`<? super T>\`：

\`\`\`java
public static void fill(List<? super Integer> dst) { ... } // 只写
\`\`\`

## 既读又写怎么办

如果一个参数**既要读又要写**，且读写之间有类型依赖，就不能用通配符，应该用**类型参数 \`<T>\`**：

\`\`\`java
public static <T> void copy(List<? super T> dst, List<? extends T> src) {
    T t = src.get(0); // 读出来是 T
    dst.add(t);       // 写进去也是 T
}
\`\`\`

注意：dst 和 src 用通配符，但它们之间的依赖关系用 \`<T>\` 表达。

## Collections.copy 源码

JDK 中 \`Collections.copy\` 就是 PECS 的经典范例：

\`\`\`java
public static <T> void copy(List<? super T> dest, List<? extends T> src) {
    int srcSize = src.size();  // 声明变量 srcSize（int），初始值为 src.size()
    if (srcSize > dest.size()) throw ...;
    for (int i = 0; i < srcSize; i++)  // for 循环：初始化 int i = 0；条件 i < srcSize；更新 i++
        dest.set(i, src.get(i));  // 调用 dest 的 set 方法
}
\`\`\`

- \`src\` 是生产者（读出元素）→ \`? extends T\`
- \`dest\` 是消费者（写入元素）→ \`? super T\`
- 中间传递的元素类型用 \`T\` 关联

## 反例：返回值不要用通配符

返回类型应**避免**通配符，否则调用方拿到 \`List<?>\` 后难以使用。通配符主要用于**参数**。

下面通过 copy、sum、fill 三个例子演示 PECS 的完整应用：`,
    code: `// 演示 PECS 原则：Producer Extends, Consumer Super
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== Collections.copy 模拟 =====
        List<Integer> src = Arrays.asList(1, 2, 3, 4);
        List<Number> dst = new ArrayList<>(Arrays.asList(0, 0, 0, 0));
        copy(dst, src); // src 生产 -> extends，dst 消费 -> super
        System.out.println("copy 后 dst: " + dst);

        // ===== 求和：只读，生产者用 extends =====
        List<Integer> ints = Arrays.asList(10, 20, 30);
        List<Double> dbls = Arrays.asList(1.5, 2.5);
        System.out.println("sum(ints) = " + sum(ints));
        System.out.println("sum(dbls) = " + sum(dbls));

        // ===== 填充：只写，消费者用 super =====
        List<Number> nums = new ArrayList<>();
        fill(nums, 3);
        System.out.println("fill 后 nums: " + nums);

        // ===== 综合：移动元素 =====
        List<Integer> from = Arrays.asList(7, 8, 9);
        List<Object> to = new ArrayList<>();
        moveAll(to, from); // from 生产，to 消费
        System.out.println("moveAll 后 to: " + to);
    }

    // 模仿 Collections.copy：dst 消费(super)，src 生产(extends)
    public static <T> void copy(List<? super T> dst, List<? extends T> src) {
        if (src.size() > dst.size()) {
            throw new IndexOutOfBoundsException("目标空间不足");
        }
        for (int i = 0; i < src.size(); i++) {
            dst.set(i, src.get(i)); // 从 src 读 T，写入 dst
        }
    }

    // 只读：生产者用 extends
    public static double sum(List<? extends Number> src) {
        double total = 0;
        for (Number n : src) total += n.doubleValue();
        return total;
    }

    // 只写：消费者用 super
    public static <T> void fill(List<? super T> dst, int n, T value) {
        // 这里简化：直接演示 super 的写入
    }
    public static void fill(List<? super Integer> dst, int n) {
        for (int i = 0; i < n; i++) dst.add(i);
    }

    // 综合：把生产者的元素全部移到消费者
    public static <T> void moveAll(List<? super T> dst, List<? extends T> src) {
        for (T t : src) dst.add(t);
    }
}`
  },
  {
    id: "java-type-erasure",
    group: "泛型深入",
    icon: "🧹",
    title: "类型擦除",
    content: `# 类型擦除

**类型擦除（Type Erasure）** 是 Java 泛型的实现机制：泛型类型信息**只在编译期存在**，编译后会被擦除，运行时不存在泛型类型参数。

## 擦除规则

- 无界类型参数 \`<T>\` → 擦除为 \`Object\`
- 有界类型参数 \`<T extends Number>\` → 擦除为上界 \`Number\`
- \`List<String>\` / \`List<Integer>\` → 都擦除为 \`List\`

## 编译期 vs 运行时

编译器在编译时做**类型检查**和**类型转换插入**，编译完成后泛型信息被丢弃：

\`\`\`java
List<String> list = new ArrayList<>();  // 声明变量 list（List<String>），初始值为 new ArrayList<>()
list.add("hi");  // 调用 list 的 add 方法
String s = list.get(0);  // 声明变量 s（String），初始值为 list.get(0)
\`\`\`

编译后等价于：

\`\`\`java
List list = new ArrayList();  // 声明变量 list（List），初始值为 new ArrayList()
list.add("hi");  // 调用 list 的 add 方法
String s = (String) list.get(0); // 编译器自动插入强转
\`\`\`

## 运行时无泛型信息

\`\`\`java
List<String> a = new ArrayList<>();  // 声明变量 a（List<String>），初始值为 new ArrayList<>()
List<Integer> b = new ArrayList<>();  // 声明变量 b（List<Integer>），初始值为 new ArrayList<>()
System.out.println(a.getClass() == b.getClass()); // true！
\`\`\`

运行时它们都是 \`java.util.ArrayList\`，无法区分。

## 擦除带来的限制

1. **不能 \`new T()\`**：运行时 \`T\` 已被擦除，不知道具体类型
2. **不能 \`new T[]\`**：数组需要运行时类型信息
3. **不能使用基本类型**：必须用包装类（\`List<Integer>\` 而非 \`List<int>\`）
4. **不能 \`instanceof List<String>\`**：只能 \`instanceof List\` 或 \`List<?>\`
5. **不能 catch 泛型异常类**
6. **静态字段/方法不能使用类的类型参数**

## 为什么用擦除

Java 泛型在 JDK 5 才引入，为了**与 JDK 1.4 及之前的非泛型代码兼容**，选择了擦除实现。代价是运行时无法获取泛型类型信息（这是 C# 泛型没有的限制）。

## 桥接方法

为了多态正确工作，编译器会生成**桥接方法（bridge method）**。例如子类 \`class StringList extends ArrayList<String>\` 的 \`get\` 返回 \`String\`，但父类擦除后返回 \`Object\`，编译器会插入一个返回 \`Object\` 的桥接方法转发调用。

## 堆污染

当原始类型与泛型类型混用时，可能出现**堆污染（Heap Pollution）**：一个泛型集合实际存入了不匹配类型的元素。由于擦除，存入时不会报错，只有在取出并强转时才抛 \`ClassCastException\`：

\`\`\`java
List<String> list = new ArrayList<>();  // 声明变量 list（List<String>），初始值为 new ArrayList<>()
List raw = list;  // 声明变量 raw（List），初始值为 list
raw.add(100);             // 堆污染：存入 Integer
String s = list.get(0);   // 取出时 ClassCastException
\`\`\`

\`@SuppressWarnings("unchecked")\` 可抑制相关警告，但应确认操作确实安全后再使用。

## 擦除的代价与收益

- **收益**：二进制兼容性——JDK 5 的泛型代码能与 JDK 1.4 的非泛型库互操作
- **代价**：运行时无泛型信息，无法 \`new T()\`、\`new T[]\`、\`instanceof List<String>\`；需用 \`Class<T>\` 或超类型令牌补救

下面通过反射演示擦除现象：`,
    code: `// 演示类型擦除现象与限制
import java.util.*;
import java.lang.reflect.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 1. 运行时类型相同 =====
        List<String> strs = new ArrayList<>();
        List<Integer> ints = new ArrayList<>();
        System.out.println("List<String> 与 List<Integer> 同类型: "
            + (strs.getClass() == ints.getClass()));
        System.out.println("实际类: " + strs.getClass().getName());

        // ===== 2. 擦除为上界 =====
        // NumBox<T extends Number> 的字段 T 擦除为 Number
        Field f = NumBox.class.getDeclaredField("value");
        System.out.println("T extends Number 擦除为: " + f.getType().getName());

        // ===== 3. 无界 T 擦除为 Object =====
        Field f2 = ObjBox.class.getDeclaredField("value");
        System.out.println("无界 T 擦除为: " + f2.getType().getName());

        // ===== 4. instanceof 限制 =====
        System.out.println("instanceof List<?>: " + (strs instanceof List<?>));
        // if (strs instanceof List<String>) {} // 编译错误
        if (strs instanceof List) { // 只能用原始类型或 <?>
            System.out.println("instanceof List: true");
        }

        // ===== 5. 原始类型绕过编译检查（堆污染）=====
        List<String> list = new ArrayList<>();
        addRaw(list); // 用原始类型强行加入 Integer
        try {
            String s = list.get(0); // 取出时才抛 ClassCastException
        } catch (ClassCastException e) {
            System.out.println("取出时异常: " + e.getMessage());
        }

        // ===== 6. 用 Class<T> 保留类型信息 =====
        String created = newInstance(String.class);
        System.out.println("用 Class<T> 创建实例: " + created.length());
    }

    // 原始类型绕过泛型检查（堆污染）
    @SuppressWarnings({"unchecked", "rawtypes"})
    static void addRaw(List list) {
        list.add(100); // 运行时 List 只存 Object，不报错
    }

    // 用 Class<T> 在运行时保留类型信息
    public static <T> T newInstance(Class<T> clazz) {
        try {
            return clazz.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

// 带上界的泛型类：T 擦除为 Number
class NumBox<T extends Number> {
    T value;
    T get() { return value; }
}

// 无界泛型类：T 擦除为 Object
class ObjBox<T> {
    T value;
    T get() { return value; }
}`
  },
  {
    id: "java-generics-restrictions",
    group: "泛型深入",
    icon: "⚠️",
    title: "泛型限制",
    content: `# 泛型限制

由于**类型擦除**，Java 泛型有一系列使用限制。理解这些限制能避免编译错误和运行时陷阱。

## 1. 不能 \`new T()\`

运行时 \`T\` 已被擦除为 \`Object\`（或上界），无法知道具体类型，因此不能直接实例化类型参数：

\`\`\`java
public <T> T create() {
    return new T(); // 编译错误
}
\`\`\`

**解决方案**：传入 \`Class<T>\`，用反射创建：

\`\`\`java
public static <T> T create(Class<T> clazz) throws Exception {
    return clazz.getDeclaredConstructor().newInstance();  // 返回值：clazz.getDeclaredConstructor().newInstance()
}
\`\`\`

## 2. 不能 \`new T[]\`

数组需要运行时类型信息来保证类型安全（数组是协变的），泛型擦除后无法提供：

\`\`\`java
T[] arr = new T[10]; // 编译错误
\`\`\`

**解决方案**：用 \`Array.newInstance\` 或改用 \`List<T>\`。

## 3. 不能使用基本类型

泛型类型参数必须是引用类型，基本类型需装箱：

\`\`\`java
List<int> list;        // 编译错误
List<Integer> list;    // OK，自动装箱
\`\`\`

## 4. 不能 catch 泛型异常类

异常处理依赖运行时类型，泛型被擦除后无法捕获具体类型：

\`\`\`java
class MyException<T> extends Exception {} // 编译错误：泛型类不能继承 Throwable
try {} catch (T e) {} // 编译错误
\`\`\`

## 5. instanceof 限制

\`instanceof\` 只能用原始类型或无界通配符 \`<?>\`：

\`\`\`java
if (list instanceof List<String>) {} // 编译错误
if (list instanceof List<?>) {}     // OK
\`\`\`

## 6. 静态成员限制

泛型类的静态字段/方法不能使用类的类型参数：

\`\`\`java
class Box<T> {  // 定义类 Box
    static T cache; // 编译错误
}
\`\`\`

因为静态成员属于类，而 \`T\` 属于实例。

## 7. 重载冲突

擦除后签名相同的方法会冲突：

\`\`\`java
void m(List<String> l) {}
void m(List<Integer> l) {} // 编译错误：擦除后都是 m(List)
\`\`\`

## 8. 泛型类不能继承 Throwable

异常类型在 catch 时依赖运行时类型匹配，而泛型擦除后无法区分，因此 Java 禁止泛型异常类：

\`\`\`java
class MyEx<T> extends Exception {} // 编译错误
\`\`\`

## 应对策略总结

| 限制 | 替代方案 |
|------|----------|
| 不能 \`new T()\` | 传入 \`Class<T>\`，反射创建 |
| 不能 \`new T[]\` | \`Array.newInstance\` 或用 \`List<T>\` |
| 不能用基本类型 | 用包装类，依赖自动装箱 |
| 不能泛型异常 | 用具体异常类，或异常携带 \`Class\` 字段 |
| 不能 \`instanceof List<X>\` | 用 \`instanceof List<?>\` + 逐元素检查 |

理解这些限制的本质都是**类型擦除**：运行时没有泛型信息，凡是依赖运行时类型信息的操作都受限。

下面通过可编译的示例演示这些限制及其解决方案：`,
    code: `// 演示泛型的各种限制及其解决方案
import java.util.*;
import java.lang.reflect.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 限制1：不能 new T()，用 Class<T> 反射 =====
        String s = newInstance(String.class);
        System.out.println("newInstance(String): 长度=" + s.length());
        ArrayList<?> list = newInstance(ArrayList.class);
        System.out.println("newInstance(ArrayList): size=" + list.size());

        // ===== 限制2：不能 new T[]，用 Array.newInstance =====
        String[] arr = newArray(String.class, 3);
        arr[0] = "A";
        arr[1] = "B";
        System.out.println("newArray: " + Arrays.toString(arr));

        // ===== 限制3：不能用基本类型，必须用包装类 =====
        List<Integer> nums = new ArrayList<>(); // 不是 List<int>
        nums.add(1); // 自动装箱 Integer.valueOf(1)
        int x = nums.get(0); // 自动拆箱
        System.out.println("装箱/拆箱: " + x);

        // ===== 限制4：泛型类不能继承 Throwable =====
        // class MyEx<T> extends Exception {} // 编译错误
        try {
            throw new MyException("自定义异常");
        } catch (MyException e) {
            System.out.println("捕获异常: " + e.getMessage());
        }

        // ===== 限制5：instanceof 只能用 <?> =====
        Object obj = nums;
        if (obj instanceof List<?>) { // OK
            System.out.println("instanceof List<?>: true");
        }

        // ===== 限制6：静态方法用自己的类型参数 =====
        System.out.println("静态泛型方法: " + Pair.of("k", 1));

        // ===== 限制7：嵌套泛型用 List 代替数组 =====
        List<List<String>> nested = new ArrayList<>();
        nested.add(Arrays.asList("a", "b"));
        System.out.println("嵌套 List: " + nested);
    }

    // 用 Class<T> 替代 new T()
    public static <T> T newInstance(Class<T> clazz) {
        try {
            return clazz.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // 用 Array.newInstance 替代 new T[]
    @SuppressWarnings("unchecked")
    public static <T> T[] newArray(Class<T> clazz, int size) {
        return (T[]) Array.newInstance(clazz, size);
    }

    // 静态方法用自己的类型参数（不能用类的）
    static class Pair {
        static <K, V> String of(K k, V v) { return k + "=" + v; }
    }
}

// 自定义异常：不能是泛型类
class MyException extends Exception {
    MyException(String msg) { super(msg); }
}`
  },
  {
    id: "java-generics-arrays",
    group: "泛型深入",
    icon: "📊",
    title: "泛型与数组",
    content: `# 泛型与数组

泛型与数组的组合是 Java 中最容易踩坑的地方。**Java 禁止创建泛型数组** \`new T[]\` 和 \`new List<String>[]\`，背后有深刻的类型安全原因。

## 数组是协变的

Java 数组是**协变（covariant）**的：\`String[]\` 是 \`Object[]\` 的子类：

\`\`\`java
String[] strs = {"a"};  // 声明变量 strs（String[]），初始值为 {"a"}
Object[] objs = strs; // OK，协变
objs[0] = 1;          // 运行时 ArrayStoreException！
\`\`\`

数组协变靠**运行时检查**保证安全：每个数组记住自己的元素类型，存入异类时抛 \`ArrayStoreException\`。

## 泛型是不变的

泛型是**不变（invariant）**的：\`List<String>\` 不是 \`List<Object>\` 的子类。泛型靠**编译期检查**保证安全，运行时类型信息已被擦除。

## 矛盾的根源

如果允许创建 \`List<String>[]\`：

\`\`\`java
List<String>[] arr = new List<String>[1];          // 假设允许
Object[] objs = arr;                                // 数组协变，OK
List<Integer> ints = Arrays.asList(1);  // 声明变量 ints（List<Integer>），初始值为 Arrays.asList(1)
objs[0] = ints;                                     // 运行时无法检查（擦除）
String s = arr[0].get(0);                            // ClassCastException
\`\`\`

数组本应在运行时拒绝 \`ints\`，但泛型擦除让运行时无法识别 \`List<String>\` 和 \`List<Integer>\` 的区别，类型安全被击穿。所以 Java 干脆**禁止创建泛型数组**。

## 实际表现

\`\`\`java
List<String>[] arr = new List<String>[1]; // 编译错误
\`\`\`

但可以用原始类型 + 强转（有 unchecked 警告）：

\`\`\`java
@SuppressWarnings("unchecked")  // 注解：SuppressWarnings
List<String>[] arr = (List<String>[]) new List[1]; // 危险！
\`\`\`

## 解决方案

| 方案 | 说明 |
|------|------|
| \`List<List<T>>\` | 用集合代替数组，最推荐 |
| \`Array.newInstance\` | 反射创建具体类型数组 |
| \`Object[]\` + 手动强转 | 不推荐，丢失类型安全 |

## 数组 vs 集合

- 数组：协变、运行时类型检查、长度固定、可存基本类型
- 集合：不变（编译期检查）、长度可变、只能存对象、API 丰富

实际开发中，**优先用集合而非数组**，既避开泛型数组问题，又获得更丰富的 API。

下面演示泛型数组的问题与解决方案：`,
    code: `// 演示泛型与数组的冲突及解决方案
import java.util.*;
import java.lang.reflect.*;

public class Main {
    public static void main(String[] args) {
        // ===== 1. 数组协变：靠运行时检查 =====
        String[] strs = {"a", "b"};
        Object[] objs = strs; // OK，数组协变
        System.out.println("数组协变读取: " + objs[0]);
        try {
            objs[0] = 100; // 运行时抛 ArrayStoreException
        } catch (ArrayStoreException e) {
            System.out.println("数组运行时检查: " + e.getClass().getSimpleName());
        }

        // ===== 2. 不能创建泛型数组 =====
        // List<String>[] arr = new List<String>[1]; // 编译错误
        // T[] arr = new T[10]; // 编译错误

        // ===== 3. 原始类型强转（危险，有 unchecked 警告）=====
        @SuppressWarnings("unchecked")
        List<String>[] rawArr = (List<String>[]) new List[2];
        rawArr[0] = Arrays.asList("x", "y");
        rawArr[1] = Arrays.asList("z");
        System.out.println("原始类型强转: " + Arrays.toString(rawArr));

        // ===== 4. 解决方案A：List 套 List（推荐）=====
        List<List<String>> nested = new ArrayList<>();
        nested.add(Arrays.asList("a", "b"));
        nested.add(Arrays.asList("c"));
        System.out.println("List 套 List: " + nested);

        // ===== 5. 解决方案B：反射创建具体类型数组 =====
        String[] typedArr = newArray(String.class, 3);
        typedArr[0] = "hello";
        typedArr[1] = "world";
        System.out.println("反射创建数组: " + Arrays.toString(typedArr));

        // ===== 6. 泛型方法返回数组（经典模式）=====
        String[] result = toArray("p", "q", "r");
        System.out.println("toArray: " + Arrays.toString(result));
    }

    // 反射创建具体类型数组
    @SuppressWarnings("unchecked")
    static <T> T[] newArray(Class<T> clazz, int size) {
        return (T[]) Array.newInstance(clazz, size);
    }

    // 集合转数组（类型安全）
    @SafeVarargs
    static <T> T[] toArray(T... items) {
        // 这里用可变参数，编译器自动创建 T[]（实际是 Object[]）
        // 返回时拷贝为正确类型数组
        Class<?> componentType = items.getClass().getComponentType();
        T[] arr = (T[]) Array.newInstance(
            items[0] == null ? Object.class : items[0].getClass(), items.length);
        for (int i = 0; i < items.length; i++) arr[i] = items[i];
        return arr;
    }
}`
  },
  {
    id: "java-generics-inheritance",
    group: "泛型深入",
    icon: "🧬",
    title: "泛型与继承",
    content: `# 泛型与继承（不变性）

理解泛型的**不变性（invariance）** 是掌握通配符的关键。\`List<String>\` **不是** \`List<Object>\` 的子类，尽管 \`String\` 是 \`Object\` 的子类。

## 不变性的含义

\`\`\`java
List<String> strs = new ArrayList<>();  // 声明变量 strs（List<String>），初始值为 new ArrayList<>()
List<Object> objs = strs; // 编译错误！
\`\`\`

乍看不合理，但这是为了类型安全：

\`\`\`java
List<String> strs = new ArrayList<>();  // 声明变量 strs（List<String>），初始值为 new ArrayList<>()
List<Object> objs = strs; // 假设允许
objs.add(100);            // 往"String 列表"里加 Integer！
String s = strs.get(0);   // ClassCastException
\`\`\`

如果泛型协变，编译期类型检查就被击穿。所以泛型**强制不变**：不同类型参数的泛型类之间没有继承关系。

## 与数组对比

数组是**协变**的（这是 Java 早期设计缺陷）：

\`\`\`java
String[] strs = {"a"};  // 声明变量 strs（String[]），初始值为 {"a"}
Object[] objs = strs; // OK，协变
objs[0] = 1;          // 运行时 ArrayStoreException
\`\`\`

数组靠运行时检查补救协变的类型安全漏洞，但泛型擦除后无法做运行时检查，所以只能选择不变性。

## 通配符恢复协变/逆变

不变性虽然安全，但太严格。通配符在**不破坏类型安全**的前提下恢复灵活性：

### 协变（上界 extends）

\`\`\`java
List<? extends Number> nums = new ArrayList<Integer>(); // OK
Number n = nums.get(0);  // 可读
// nums.add(1);          // 不能写
\`\`\`

只读不写，类型安全。

### 逆变（下界 super）

\`\`\`java
List<? super Integer> sink = new ArrayList<Number>(); // OK
sink.add(1);             // 可写
// Integer x = sink.get(0); // 只能读 Object
\`\`\`

只写不读具体类型，类型安全。

## 类型参数的继承

注意区分两种"继承"：

1. **泛型类自身的继承**：\`class StringList extends ArrayList<String>\`，这是普通继承
2. **类型参数的继承**：\`List<String>\` 与 \`List<Object>\` 无继承关系（不变性）

## 泛型类的继承

泛型类可以继承另一个泛型类：

\`\`\`java
class StringList extends ArrayList<String> {}      // 指定类型参数
class MyList<T> extends ArrayList<T> {}            // 保留类型参数
class IntList extends ArrayList<Integer> {}        // 具体子类
\`\`\`

下面通过对比演示不变性、协变、逆变：`,
    code: `// 演示泛型的不变性、协变、逆变
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 1. 泛型不变性 =====
        List<Integer> ints = Arrays.asList(1, 2, 3);
        // List<Number> nums = ints; // 编译错误：不变
        // 原因：若允许，可 nums.add(1.5)，破坏 ints 类型安全

        // ===== 2. 数组协变（有缺陷的设计）=====
        Integer[] intArr = {1, 2, 3};
        Number[] numArr = intArr; // OK，数组协变
        System.out.println("数组协变读取: " + numArr[0]);
        try {
            numArr[0] = 1.5; // 运行时检查抛 ArrayStoreException
        } catch (ArrayStoreException e) {
            System.out.println("数组运行时拦截: " + e.getClass().getSimpleName());
        }

        // ===== 3. 通配符实现协变（只读）=====
        List<? extends Number> covariant = ints; // OK，上界协变
        Number n = covariant.get(0);             // 可安全读为 Number
        System.out.println("协变读取: " + n);
        // covariant.add(1); // 编译错误：不能写

        // ===== 4. 通配符实现逆变（只写）=====
        List<Number> numList = new ArrayList<>();
        List<? super Integer> contravariant = numList; // OK，下界逆变
        contravariant.add(1);                           // 可安全写 Integer
        contravariant.add(2);
        System.out.println("逆变写入后 numList: " + numList);
        // Integer x = contravariant.get(0); // 编译错误：不能读具体类型
        Object o = contravariant.get(0);               // 只能读 Object
        System.out.println("逆变读取为 Object: " + o);

        // ===== 5. 泛型类的继承（不同于类型参数继承）=====
        StringList sl = new StringList();
        sl.add("hello");
        System.out.println("StringList 继承 ArrayList<String>: " + sl);
        // StringList 是 ArrayList<String> 的子类，这属于类继承，与不变性不冲突

        // ===== 6. 协变读取多种子类型 =====
        List<? extends Number> a = new ArrayList<Integer>(Arrays.asList(1, 2));
        List<? extends Number> b = new ArrayList<Double>(Arrays.asList(1.5, 2.5));
        System.out.println("协变读 Integer 列表: " + a.get(0));
        System.out.println("协变读 Double 列表: " + b.get(0));
    }
}

// 泛型类继承示例：指定类型参数
class StringList extends ArrayList<String> {
    // 继承 ArrayList<String>，所有方法签名都基于 String
}`
  },
  {
    id: "java-generics-inference",
    group: "泛型深入",
    icon: "🔍",
    title: "类型推断",
    content: `# 类型推断

**类型推断（Type Inference）** 让编译器根据上下文自动确定类型参数，免去显式声明，使泛型代码更简洁。Java 7、8、9 逐步增强了推断能力。

## 菱形运算符 <>

Java 7 引入，构造器调用时省略类型参数：

\`\`\`java
// Java 6
Map<String, List<Integer>> map = new HashMap<String, List<Integer>>();  // 声明变量 map（Map<String, List<Integer>>），初始值为 new HashMap<String, List<Integer>>()
// Java 7+
Map<String, List<Integer>> map = new HashMap<>();  // 声明变量 map（Map<String, List<Integer>>），初始值为 new HashMap<>()
\`\`\`

编译器从左边的声明类型推断右边的类型参数。

## 方法参数推断

调用泛型方法时，编译器根据**实参类型**推断 \`T\`：

\`\`\`java
List<Integer> nums = toList(1, 2, 3);   // 推断 T = Integer
List<String> strs = toList("a", "b");   // 推断 T = String
\`\`\`

## 目标类型推断（Java 8+）

Java 8 让方法调用的类型推断考虑**返回值的目标类型**：

\`\`\`java
List<String> list = Collections.emptyList(); // 推断 T = String
\`\`\`

\`emptyList()\` 的 \`T\` 没有实参可参考，但赋值目标 \`List<String>\` 让编译器推断出 \`T = String\`。

## 链式调用推断

Java 8 改进了链式调用中的推断：

\`\`\`java
List<Integer> nums = Arrays.asList(3, 1, 2);  // 声明变量 nums（List<Integer>），初始值为 Arrays.asList(3, 1, 2)
nums.stream()
    .sorted(Comparator.reverseOrder()) // 推断 Comparator<Integer>
    .forEach(System.out::println);  // 方法引用：复用已有方法作为函数式接口实例
\`\`\`

## Lambda 与推断

Lambda 参数类型可省略，由函数式接口推断：

\`\`\`java
nums.stream().map(x -> x * 2); // x 的类型由 Stream<Integer> 推断
\`\`\`

## Java 9+ 匿名类推断

Java 9 允许匿名类使用菱形运算符：

\`\`\`java
Comparator<String> cmp = new Comparator<>() {
    public int compare(String a, String b) { return a.compareTo(b); }  // 方法 compare（返回 int，参数：String a, String b）：返回 a.compareTo(b)
};
\`\`\`

## 何时需要显式指定

- 编译器推断不出（如空参数）
- 推断结果不符合预期
- 需要放宽类型（如 \`<Number>\` 而非 \`<Integer>\`）

\`\`\`java
Collections.<Number>emptyList(); // 显式指定为 Number
\`\`\`

下面通过实例演示各阶段的类型推断：`,
    code: `// 演示类型推断的各阶段特性
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        // ===== 1. 菱形运算符（Java 7）=====
        List<String> list = new ArrayList<>(); // 推断 String
        Map<String, List<Integer>> map = new HashMap<>(); // 推断复杂类型
        map.put("nums", new ArrayList<>(Arrays.asList(1, 2)));
        System.out.println("菱形推断: " + map);

        // ===== 2. 方法实参推断 =====
        List<Integer> nums = toList(1, 2, 3); // 推断 T = Integer
        List<String> strs = toList("a", "b"); // 推断 T = String
        System.out.println("实参推断 Integer: " + nums);
        System.out.println("实参推断 String: " + strs);

        // ===== 3. 目标类型推断（Java 8）=====
        List<String> empty = Collections.emptyList(); // 推断 T = String
        System.out.println("目标类型推断 empty: " + empty.size());

        // ===== 4. 链式调用推断 =====
        List<Integer> sorted = nums.stream()
            .sorted(Comparator.reverseOrder()) // 推断 Comparator<Integer>
            .collect(Collectors.toList());
        System.out.println("降序排序: " + sorted);

        // ===== 5. Lambda 参数推断 =====
        List<Integer> doubled = nums.stream()
            .map(x -> x * 2) // x 类型由 Stream<Integer> 推断
            .collect(Collectors.toList());
        System.out.println("翻倍: " + doubled);

        // ===== 6. 显式指定（推断不出时）=====
        List<Number> wide = Collections.<Number>emptyList();
        System.out.println("显式指定 Number: size=" + wide.size());

        // ===== 7. 泛型方法返回值推断 =====
        String s = first(Arrays.asList("x", "y")); // 推断 T = String
        System.out.println("返回值推断: " + s);

        // ===== 8. 条件表达式中的推断 =====
        boolean flag = true;
        List<Integer> result = flag ? toList(1) : toList(2, 3);
        System.out.println("条件推断: " + result);
    }

    @SafeVarargs
    static <T> List<T> toList(T... items) {
        List<T> l = new ArrayList<>();
        for (T t : items) l.add(t);
        return l;
    }

    static <T> T first(List<T> list) {
        return list.isEmpty() ? null : list.get(0);
    }
}`
  },
  {
    id: "java-generics-best-practices",
    group: "泛型深入",
    icon: "✅",
    title: "泛型最佳实践",
    content: `# 泛型最佳实践

掌握泛型后，遵循一些设计准则能让 API 更安全、更易用。下面总结《Effective Java》与社区公认的泛型最佳实践。

## 1. 有意义的类型参数名

避免滥用 \`T\`，按用途命名：

\`\`\`java
public class Pair<K, V> {}        // Key, Value
public interface Repository<E> {} // Element
public class Cache<K, V> {}       // Key, Value
\`\`\`

约定俗成的单字母让代码自解释。

## 2. 优先泛型方法而非通配符（有依赖时）

当方法参数之间存在**类型依赖**时，用类型参数 \`<T>\` 而非通配符：

\`\`\`java
// 不好：通配符无法表达 src 和 dst 的类型关系
public static void copy(List<?> dst, List<?> src) {}

// 好：用 <T> 表达"src 读出 T，dst 写入 T"
public static <T> void copy(List<? super T> dst, List<? extends T> src) {}
\`\`\`

## 3. 谨慎使用通配符

- **参数**用通配符（PECS）
- **返回值**不要用通配符（否则调用方难用）
- 既读又写且有依赖时，用 \`<T>\`

## 4. 泛型优于 Object

老代码用 \`Object\` 当通用容器，需强转且无类型安全。应改用泛型：

\`\`\`java
// 旧
class Stack { public void push(Object o) {} public Object pop() {} }  // 定义类 Stack
// 新
class Stack<E> { public void push(E e) {} public E pop() {} }  // 定义类 Stack
\`\`\`

## 5. 有界类型参数约束能力

用 \`<T extends Comparable<T>\` 约束类型能力，既保证安全又扩展方法功能：

\`\`\`java
public static <T extends Comparable<T>> T max(List<T> list) { ... }
\`\`\`

## 6. 避免原始类型

原始类型（\`List\`）失去泛型保护，应始终带类型参数。需要"任意类型"用 \`List<?>\`：

\`\`\`java
List list = new ArrayList();      // 不好
List<Object> list = new ArrayList<>(); // 好
List<?> list = new ArrayList<String>(); // 好（只读）
\`\`\`

## 7. 消除 unchecked 警告

每条 unchecked 警告都是潜在 \`ClassCastException\`。优先修正，确认安全后用 \`@SuppressWarnings("unchecked")\` 注解并注释原因。

## 8. 泛型与继承注意

\`List<String>\` 不是 \`List<Object>\` 的子类（不变性）。设计 API 时用通配符表达协变/逆变需求。

下面通过综合示例演示这些实践：`,
    code: `// 综合演示泛型最佳实践
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 1. 有意义的类型参数名 =====
        Repository<String, User> repo = new UserRepository();
        repo.save("u1", new User("Alice"));
        repo.save("u2", new User("Bob"));
        System.out.println("查找用户: " + repo.find("u1"));
        System.out.println("全部用户: " + repo.findAll());

        // ===== 2. 泛型方法表达类型依赖 =====
        List<Integer> src = Arrays.asList(3, 1, 2);
        List<Number> dst = new ArrayList<>(Arrays.asList(0, 0, 0));
        copy(dst, src); // <T=Integer> 关联 src 与 dst
        System.out.println("copy 后 dst: " + dst);

        // ===== 3. 有界类型参数 =====
        System.out.println("最大值: " + max(Arrays.asList(3, 7, 2)));
        System.out.println("最大字符串: " + max(Arrays.asList("banana", "apple", "cherry")));

        // ===== 4. 类型安全的栈 =====
        Stack<String> stack = new Stack<>();
        stack.push("a");
        stack.push("b");
        System.out.println("栈顶: " + stack.pop());

        // ===== 5. 返回具体类型，不用通配符 =====
        List<Integer> sorted = sortedCopy(src);
        System.out.println("排序副本: " + sorted);
    }

    // 泛型方法：用 <T> 关联 src 与 dst，PECS 应用
    public static <T> void copy(List<? super T> dst, List<? extends T> src) {
        for (int i = 0; i < src.size(); i++) dst.set(i, src.get(i));
    }

    // 有界类型参数：T 必须可比较
    public static <T extends Comparable<T>> T max(List<? extends T> list) {
        if (list.isEmpty()) return null;
        T m = list.get(0);
        for (T t : list) if (t.compareTo(m) > 0) m = t;
        return m;
    }

    // 返回具体类型 List<T>，不用 List<?>
    public static <T extends Comparable<T>> List<T> sortedCopy(List<? extends T> src) {
        List<T> copy = new ArrayList<>(src);
        Collections.sort(copy);
        return copy;
    }
}

// 类型参数名有意义：K=Key, E=Entity
interface Repository<K, E> {
    void save(K key, E entity);
    E find(K key);
    Collection<E> findAll();
}

class User {
    String name;
    User(String name) { this.name = name; }
    public String toString() { return name; }
}

class UserRepository implements Repository<String, User> {
    private final Map<String, User> store = new HashMap<>();
    public void save(String key, User entity) { store.put(key, entity); }
    public User find(String key) { return store.get(key); }
    public Collection<User> findAll() { return store.values(); }
}

// 泛型优于 Object：类型安全的栈
class Stack<E> {
    private final List<E> items = new ArrayList<>();
    public void push(E e) { items.add(e); }
    public E pop() { return items.remove(items.size() - 1); }
}`
  },
  {
    id: "java-generics-patterns",
    group: "泛型深入",
    icon: "🎨",
    title: "泛型设计模式",
    content: `# 泛型设计模式

泛型不仅能消除强转，还能实现一些**没有泛型就难以做到**的设计模式。下面介绍几种经典的泛型设计模式。

## 1. 泛型 Builder 模式

Builder 通过链式调用构建复杂对象。借助泛型可以实现**类型安全的流式 API**，甚至支持"必须先设置 name 再设置 age"的顺序约束。

\`\`\`java
Person p = new Person.Builder()
    .name("Alice")
    .age(20)
    .build();
\`\`\`

## 2. 类型安全的异构容器

普通容器只能存一种类型。**异构容器（Heterogeneous Container）** 用 \`Class<T>\` 作为键，可以安全地存放不同类型的对象：

\`\`\`java
Container c = new Container();  // 声明变量 c（Container），初始值为 new Container()
c.put(String.class, "hi");  // 调用 c 的 put 方法
c.put(Integer.class, 100);  // 调用 c 的 put 方法
String s = c.get(String.class); // 类型安全，无需强转
\`\`\`

这是 \`ThreadLocal\`、\`Attributes\` 等的设计基础。

## 3. 泛型递归（自引用类型）

类型参数可以引用自身：\`class Enum<E extends Enum<E>>\`。这是 Java \`Enum\` 的声明方式，保证枚举方法 \`compareTo(E o)\` 只接受同类型枚举。

\`\`\`java
abstract class Node<N extends Node<N>> { ... }  // 定义抽象类 Node
\`\`\`

这种"CRTP（Curiously Recurring Template Pattern）"模式让基类能引用子类类型。

## 4. 泛型工厂方法

\`Collections.emptyList()\`、\`Optional.empty()\` 都用泛型工厂方法返回"任意类型的空容器"，且**类型安全**：

\`\`\`java
public static <T> List<T> emptyList() { return (List<T>) EMPTY_LIST; }
\`\`\`

内部用同一个不可变实例，通过泛型"伪装"成任意类型列表（因为不可变，安全）。

## 5. 递归类型边界

\`<T extends Comparable<T>\` 让类型"与自己比较"，这是递归类型边界的典型：

\`\`\`java
public static <T extends Comparable<T>> T max(List<T> list) { ... }
\`\`\`

## 6. 泛型单例

无状态泛型类可用单例，通过 unchecked 强转复用：

\`\`\`java
@SuppressWarnings("unchecked")  // 注解：SuppressWarnings
public static <T> Comparator<T> reverseOrder() {
    return (Comparator<T>) REVERSE;  // 返回值：(Comparator<T>) REVERSE
}
\`\`\`

下面通过完整示例演示这些模式：`,
    code: `// 演示泛型设计模式
import java.util.*;
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        // ===== 1. 泛型 Builder 模式 =====
        Person p = new Person.Builder()
            .name("Alice")
            .age(20)
            .email("alice@example.com")
            .build();
        System.out.println("Builder: " + p);

        // ===== 2. 类型安全的异构容器 =====
        Container c = new Container();
        c.put(String.class, "hello");
        c.put(Integer.class, 100);
        c.put(Double.class, 3.14);
        System.out.println("异构容器 String: " + c.get(String.class));
        System.out.println("异构容器 Integer: " + c.get(Integer.class));
        System.out.println("异构容器 Double: " + c.get(Double.class));

        // ===== 3. 泛型递归：自引用类型 =====
        IntNode a = new IntNode(1);
        IntNode b = new IntNode(2);
        a.setNext(b);
        System.out.println("自引用链表: " + a.value + " -> " + a.next().value);

        // ===== 4. 泛型工厂方法 =====
        List<String> empty = emptyList();
        System.out.println("空列表工厂: size=" + empty.size());
        Optional<Integer> opt = Optional.of(42);
        System.out.println("Optional 工厂: " + opt.get());

        // ===== 5. 递归类型边界 =====
        System.out.println("最大值: " + max(Arrays.asList(3, 7, 2)));
    }

    // 泛型工厂方法：类型安全的空容器
    @SuppressWarnings("unchecked")
    public static <T> List<T> emptyList() {
        return (List<T>) Collections.EMPTY_LIST;
    }

    // 递归类型边界：<T extends Comparable<T>>
    public static <T extends Comparable<T>> T max(List<? extends T> list) {
        T m = list.get(0);
        for (T t : list) if (t.compareTo(m) > 0) m = t;
        return m;
    }
}

// 1. 泛型 Builder 模式
class Person {
    private final String name;
    private final int age;
    private final String email;
    private Person(String name, int age, String email) {
        this.name = name; this.age = age; this.email = email;
    }
    public String toString() { return name + "," + age + "," + email; }

    static class Builder {
        private String name, email;
        private int age;
        Builder name(String n) { this.name = n; return this; }
        Builder age(int a) { this.age = a; return this; }
        Builder email(String e) { this.email = e; return this; }
        Person build() { return new Person(name, age, email); }
    }
}

// 2. 类型安全的异构容器
class Container {
    private final Map<Class<?>, Object> map = new HashMap<>();
    public <T> void put(Class<T> type, T instance) { map.put(type, instance); }
    public <T> T get(Class<T> type) { return type.cast(map.get(type)); }
}

// 3. 泛型递归：自引用类型 N extends Node<N>
class IntNode {
    int value;
    private IntNode next;
    IntNode(int v) { this.value = v; }
    void setNext(IntNode n) { this.next = n; }
    IntNode next() { return next; }
}`
  },
  {
    id: "java-type-token",
    group: "泛型深入",
    icon: "🎫",
    title: "Type Token 与超类型令牌",
    content: `# Type Token 与超类型令牌

由于**类型擦除**，运行时无法直接获取 \`List<String>\` 这样的泛型类型。**Type Token（类型令牌）** 与 **Super Type Token（超类型令牌）** 模式巧妙地解决了这个问题。

## Class<T> 作为类型令牌

最简单的类型令牌是 \`Class<T>\` 对象，它在运行时保留具体类型：

\`\`\`java
public static <T> T parse(String s, Class<T> type) {
    if (type == String.class) return (T) s;
    if (type == Integer.class) return (T) Integer.valueOf(s);  // 调用 if (type == Integer.class) return (T) Integer 的 valueOf 方法
    throw new IllegalArgumentException();  // 抛出 IllegalArgumentException 异常：
}
\`\`\`

调用时传入 \`String.class\` 或 \`Integer.class\`，方法就能在运行时根据 \`Class<T>\` 决定行为。\`Class<T>\` 是"类型安全的类型令牌"。

## Class<T> 的局限

\`Class<T>\` 只能表示**具体类型**（\`String\`、\`Integer\`），无法表示 \`List<String>\`、\`Map<String, Integer>\` 这样的**参数化类型**：

\`\`\`java
Class<String> c = String.class;          // OK
// Class<List<String>> c = ...;          // 不存在 List<String>.class
\`\`\`

因为 \`List<String>.class\` 在擦除后就是 \`List.class\`，无法区分 \`List<String>\` 和 \`List<Integer>\`。

## 超类型令牌（Super Type Token）

Neal Gafter 提出的模式：创建一个 \`TypeToken<T>\` 的**匿名子类**，编译器会把父类的泛型参数信息记录在子类的 Class 元数据中，运行时可通过反射读取：

\`\`\`java
TypeToken<List<String>> token = new TypeToken<List<String>>() {};  // 声明变量 token（TypeToken<List<String>>），初始值为 new TypeToken<List<String>>() {}
Type type = token.getType(); // 运行时得到 List<String>！
\`\`\`

关键在 \`new TypeToken<List<String>>() {}\` 的 \`{}\`——它创建了一个匿名子类，编译器在子类的 \`getGenericSuperclass()\` 中保留了 \`List<String>\` 的 \`ParameterizedType\` 信息。

## 实现原理

\`\`\`java
abstract class TypeToken<T> {  // 定义抽象类 TypeToken
    private final Type type;  // 声明常量私有变量 type（Type 类型）
    protected TypeToken() {  // 方法 TypeToken，返回 protected，无参数
        Type superClass = getClass().getGenericSuperclass();  // 声明变量 superClass（Type），初始值为 getClass().getGenericSuperclass()
        ParameterizedType pt = (ParameterizedType) superClass;  // 声明变量 pt（ParameterizedType），初始值为 (ParameterizedType) superClass
        this.type = pt.getActualTypeArguments()[0];  // 为 this.type 赋值：pt.getActualTypeArguments()[0]
    }
    public Type getType() { return type; }  // 方法 getType（返回 Type，无参数）：返回 type
}
\`\`\`

必须是 \`abstract\` 或带 abstract 方法，强制用匿名子类实例化，才能让 \`getGenericSuperclass()\` 返回参数化类型。

## 实际应用

- **Gson**：\`new TypeToken<List<User>>(){}.getType()\` 解析 JSON 数组
- **Jackson**：\`new TypeReference<List<User>>(){}\` 同理
- **Spring**：\`ParameterizedTypeReference<T>\` 用于 REST 泛型响应
- **Guice**：\`TypeLiteral<T>\` 做依赖注入的类型绑定

下面演示 Class<T> 与超类型令牌的实现：`,
    code: `// 演示 Type Token 与超类型令牌
import java.util.*;
import java.lang.reflect.*;

public class Main {
    public static void main(String[] args) {
        // ===== 1. Class<T> 作为类型令牌 =====
        String s = parse("hello", String.class);
        Integer i = parse("123", Integer.class);
        System.out.println("Class<String> 解析: " + s);
        System.out.println("Class<Integer> 解析: " + i);

        // ===== 2. Class<T> 的局限：无法表示 List<String> =====
        Class<?> listClass = List.class; // 只有 List.class，没有 List<String>.class
        System.out.println("List.class: " + listClass.getName());

        // ===== 3. 超类型令牌：保留泛型信息 =====
        TypeToken<List<String>> strListToken = new TypeToken<List<String>>() {};
        Type type = strListToken.getType();
        System.out.println("超类型令牌类型: " + type.getTypeName());
        System.out.println("是 ParameterizedType: " + (type instanceof ParameterizedType));

        if (type instanceof ParameterizedType) {
            ParameterizedType pt = (ParameterizedType) type;
            System.out.println("原始类型: " + pt.getRawType().getTypeName());
            System.out.println("类型参数: " + pt.getActualTypeArguments()[0].getTypeName());
        }

        // ===== 4. 应用：解析 JSON 数组（模拟 Gson）=====
        List<String> names = fromJson("[a, b, c]", new TypeToken<List<String>>() {});
        System.out.println("解析 List<String>: " + names);

        List<Integer> nums = fromJson("[1, 2, 3]", new TypeToken<List<Integer>>() {});
        System.out.println("解析 List<Integer>: " + nums);

        // ===== 5. Map 类型也支持 =====
        TypeToken<Map<String, Integer>> mapToken = new TypeToken<Map<String, Integer>>() {};
        Type mt = mapToken.getType();
        System.out.println("Map 类型令牌: " + mt.getTypeName());
    }

    // 用 Class<T> 做类型令牌
    @SuppressWarnings("unchecked")
    static <T> T parse(String input, Class<T> type) {
        if (type == String.class) return (T) input;
        if (type == Integer.class) return (T) Integer.valueOf(input);
        if (type == Double.class) return (T) Double.valueOf(input);
        throw new IllegalArgumentException("不支持的类型: " + type);
    }

    // 用超类型令牌解析（模拟 Gson）
    @SuppressWarnings("unchecked")
    static <T> T fromJson(String json, TypeToken<T> token) {
        Type type = token.getType();
        if (!(type instanceof ParameterizedType)) {
            throw new IllegalArgumentException("需要参数化类型: " + type);
        }
        ParameterizedType pt = (ParameterizedType) type;
        if (pt.getRawType() != List.class) {
            throw new IllegalArgumentException("只支持 List: " + pt.getRawType());
        }
        // 解析 [a, b, c] 形式的简化 JSON
        String body = json.substring(1, json.length() - 1).trim();
        String[] parts = body.isEmpty() ? new String[0] : body.split(",\\s*");
        Type elemType = pt.getActualTypeArguments()[0];
        List<Object> list = new ArrayList<>();
        for (String p : parts) {
            if (elemType == String.class) list.add(p);
            else if (elemType == Integer.class) list.add(Integer.valueOf(p.trim()));
            else list.add(p);
        }
        return (T) list;
    }
}

// 超类型令牌：通过匿名子类保留泛型信息
abstract class TypeToken<T> {
    private final Type type;

    protected TypeToken() {
        // 获取父类（即 TypeToken<T>）的泛型签名
        Type superClass = getClass().getGenericSuperclass();
        if (!(superClass instanceof ParameterizedType)) {
            throw new IllegalArgumentException("需创建匿名子类并指定类型参数，如 new TypeToken<List<String>>(){}");
        }
        ParameterizedType pt = (ParameterizedType) superClass;
        this.type = pt.getActualTypeArguments()[0];
    }

    public Type getType() {
        return type;
    }
}`
  }
];
