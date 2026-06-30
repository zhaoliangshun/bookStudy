// =============================================================
// Java 交互式教程 —— 第十八批章节（Lambda 与 Stream 组，共 15 章）
// =============================================================

export const chapters = [
  {
    id: "java-lambda-syntax",
    group: "Lambda 与 Stream",
    icon: "⚡",
    title: "Lambda 语法",
    content: `# Lambda 语法

Lambda 表达式是 Java 8 引入的核心特性，它允许将**函数作为参数**传递，使代码更简洁、更具表达力。Lambda 本质上是**函数式接口**的匿名实现。

## 基本语法

\`\`\`
(参数列表) -> 表达式或语句块
\`\`\`

由三部分组成：
- **参数列表**：括在圆括号中，可为空
- **箭头 \`->\`**：分隔参数与主体
- **主体**：表达式或代码块

## 无参数 Lambda

\`\`\`java
Runnable r = () -> System.out.println("Hello");
\`\`\`

## 单参数 Lambda

单个参数时可省略括号：

\`\`\`java
Consumer<String> c = s -> System.out.println(s);
\`\`\`

## 多参数 Lambda

\`\`\`java
BinaryOperator<Integer> add = (a, b) -> a + b;
\`\`\`

## 表达式体 vs 代码块体

表达式体无需 \`return\`，结果自动返回：

\`\`\`java
Function<Integer, Integer> sq = x -> x * x;
\`\`\`

代码块体需显式 \`return\`：

\`\`\`java
Function<Integer, Integer> sq2 = x -> {
    int r = x * x;
    return r;
};
\`\`\`

## 类型推断

编译器根据**目标类型**（函数式接口的抽象方法签名）推断参数类型，通常无需声明：

\`\`\`java
// 推断 a, b 为 Integer
BinaryOperator<Integer> add = (a, b) -> a + b;
// 显式类型（少数歧义场景）
BinaryOperator<Integer> add2 = (Integer a, Integer b) -> a + b;
\`\`\`

## 函数式接口

Lambda 的目标类型必须是**函数式接口**——只有一个抽象方法的接口。可使用 \`@FunctionalInterface\` 注解标注（非强制，但编译器会校验）。

\`\`\`java
@FunctionalInterface
interface Greeter { void greet(String name); }
\`\`\`

## 访问外部变量

Lambda 可访问外部**事实最终**变量（不再修改的局部变量）、实例字段、静态字段。访问局部变量时要求其事实最终，以保证线程安全。

## this 引用

Lambda 中的 \`this\` 指向**外围类实例**，而非 Lambda 自身——这与匿名内部类不同，后者 \`this\` 指向匿名类实例。

下面通过代码演示各种 Lambda 形式：`,
    code: `// 演示各种 Lambda 表达式形式
import java.util.function.*;

public class Main {
    // 自定义函数式接口
    @FunctionalInterface
    interface Greeter { void greet(String name); }

    public static void main(String[] args) {
        // ===== 无参数 Lambda =====
        Runnable r = () -> System.out.println("Hello, Lambda!");
        r.run();

        // ===== 单参数 Lambda（省略括号）=====
        Consumer<String> printer = s -> System.out.println("打印: " + s);
        printer.accept("世界");

        // ===== 多参数 Lambda =====
        BinaryOperator<Integer> add = (a, b) -> a + b;
        System.out.println("1 + 2 = " + add.apply(1, 2));

        // ===== 表达式体 =====
        Function<Integer, Integer> square = x -> x * x;
        System.out.println("3 的平方 = " + square.apply(3));

        // ===== 代码块体（显式 return）=====
        Function<Integer, Integer> factorial = n -> {
            int result = 1;
            for (int i = 2; i <= n; i++) result *= i;
            return result;
        };
        System.out.println("5! = " + factorial.apply(5));

        // ===== 类型推断（无需声明类型）=====
        Predicate<String> isEmpty = s -> s.isEmpty();
        System.out.println("空串判断: " + isEmpty.test(""));

        // ===== 自定义函数式接口 =====
        Greeter g = name -> System.out.println("你好, " + name + "!");
        g.greet("张三");

        // ===== 访问事实最终变量 =====
        final int factor = 10;
        Function<Integer, Integer> multiply = x -> x * factor;
        System.out.println("5 * 10 = " + multiply.apply(5));

        // ===== this 指向外围类 =====
        new Main().demoThis();

        // ===== 作为方法参数传递 =====
        int result = compute(4, x -> x * x + 1);
        System.out.println("4^2 + 1 = " + result);
    }

    // 接收函数式接口作为参数
    static int compute(int n, Function<Integer, Integer> f) {
        return f.apply(n);
    }

    void demoThis() {
        // this 指向 Main 实例，而非 Lambda 对象
        Runnable r = () -> System.out.println("this = " + this.getClass().getSimpleName());
        r.run();
    }
}`
  },
  {
    id: "java-method-reference",
    group: "Lambda 与 Stream",
    icon: "👉",
    title: "方法引用",
    content: `# 方法引用

**方法引用**（Method Reference）是 Lambda 的语法糖，当 Lambda 体仅仅是调用某个已有方法时，可用方法引用替代，使代码更简洁。它使用双冒号 \`::\` 操作符。

## 四种方法引用

| 类型 | 语法 | 等价 Lambda |
|------|------|-------------|
| 静态方法引用 | \`类名::静态方法\` | \`x -> 类名.方法(x)\` |
| 实例方法引用（特定对象） | \`对象::方法\` | \`x -> 对象.方法(x)\` |
| 类名::实例方法 | \`类名::实例方法\` | \`(obj, x) -> obj.方法(x)\` |
| 构造器引用 | \`类名::new\` | \`x -> new 类名(x)\` |

## 静态方法引用

\`\`\`java
Function<String, Integer> parser = Integer::parseInt;
// 等价: s -> Integer.parseInt(s)
\`\`\`

## 实例方法引用（特定对象）

引用某个具体对象的方法：

\`\`\`java
String prefix = "Hello, ";
Function<String, String> greeter = prefix::concat;
\`\`\`

## 类名::实例方法

这是最特殊的形式。当方法引用的目标是实例方法，却以类名作为限定符时，**第一个参数会成为接收者**：

\`\`\`java
BiFunction<String, String, Boolean> contains = String::contains;
// 等价: (str, sub) -> str.contains(sub)
\`\`\`

常见于集合元素的方法调用：

\`\`\`java
list.forEach(System.out::println);
\`\`\`

## 构造器引用

引用构造器，返回新对象：

\`\`\`java
Supplier<List<String>> factory = ArrayList::new;
// 等价: () -> new ArrayList<>()
\`\`\`

带参数的构造器引用需匹配目标函数式接口的签名：

\`\`\`java
Function<String, StringBuilder> sbFactory = StringBuilder::new;
\`\`\`

## 选择方法引用还是 Lambda

当 Lambda 体只有一行方法调用时，优先用方法引用，更清晰；当需要参数变换、组合逻辑或字面值时，仍用 Lambda。

\`\`\`java
// 用方法引用
list.stream().map(String::toUpperCase);
// 用 Lambda（需额外处理）
list.stream().map(s -> s.trim().toLowerCase());
\`\`\`

下面通过代码演示四种方法引用：`,
    code: `// 演示方法引用的四种形式
import java.util.*;
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        // ===== 静态方法引用：类名::静态方法 =====
        Function<String, Integer> parser = Integer::parseInt;
        System.out.println("解析数字: " + parser.apply("123"));

        // ===== 实例方法引用（特定对象）：对象::方法 =====
        String prefix = "Hello, ";
        Function<String, String> greeter = prefix::concat;
        System.out.println(greeter.apply("World"));

        // System.out 是一个对象
        Consumer<String> outPrinter = System.out::println;
        outPrinter.accept("通过 System.out::println 输出");

        // ===== 类名::实例方法（第一个参数成为接收者）=====
        BiFunction<String, String, Boolean> contains = String::contains;
        System.out.println("是否包含: " + contains.apply("hello world", "world"));

        Function<String, String> upper = String::toUpperCase;
        System.out.println("转大写: " + upper.apply("abc"));

        // ===== 构造器引用：类名::new =====
        Supplier<List<String>> listFactory = ArrayList::new;
        List<String> list = listFactory.get();
        list.add("A");
        list.add("B");
        System.out.println("构造器引用创建 List: " + list);

        // 带参数的构造器引用
        Function<String, StringBuilder> sbFactory = StringBuilder::new;
        StringBuilder sb = sbFactory.apply("init");
        sb.append("-end");
        System.out.println("带参构造器: " + sb);

        // ===== 在 Stream 中使用方法引用 =====
        List<String> names = Arrays.asList("alice", "bob", "carol");
        names.stream()
             .map(String::toUpperCase)       // 类名::实例方法
             .forEach(System.out::println);  // 实例方法引用

        // ===== 方法引用 vs Lambda 对比 =====
        // 两者等价，方法引用更简洁
        Function<Integer, String> viaRef = String::valueOf;
        Function<Integer, String> viaLambda = i -> String.valueOf(i);
        System.out.println("引用: " + viaRef.apply(99) + ", Lambda: " + viaLambda.apply(99));
    }
}`
  },
  {
    id: "java-function-interface",
    group: "Lambda 与 Stream",
    icon: "🔄",
    title: "Function 接口",
    content: `# Function 接口

\`Function<T, R>\` 是 \`java.util.function\` 包中最核心的函数式接口，表示一个**接收参数 T、返回结果 R** 的函数。它的抽象方法是 \`R apply(T t)\`。

## 基本用法

\`\`\`java
Function<String, Integer> len = s -> s.length();
int n = len.apply("hello"); // 5
\`\`\`

## andThen：先应用后链式

\`andThen(after)\` 返回一个新 Function，先执行当前函数，再执行 \`after\`：

\`\`\`java
Function<Integer, Integer> addOne = x -> x + 1;
Function<Integer, Integer> timesTwo = x -> x * 2;
Function<Integer, Integer> f = addOne.andThen(timesTwo); // (x+1)*2
\`\`\`

## compose：先组合后应用

\`compose(before)\` 相反，先执行 \`before\`，再执行当前函数：

\`\`\`java
Function<Integer, Integer> f = addOne.compose(timesTwo); // (x*2)+1
\`\`\`

## andThen vs compose 方向

- \`andThen\`：**this → after**，数据从左向右流
- \`compose\`：**before → this**，从右向左组合

## BiFunction<T, U, R>

接收两个参数，返回一个结果：

\`\`\`java
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
add.apply(2, 3); // 5
\`\`\`

BiFunction 只支持 \`andThen\`，不支持 \`compose\`。

## UnaryOperator<T>

\`Function<T, T>\` 的子接口，参数与返回类型相同：

\`\`\`java
UnaryOperator<Integer> negate = x -> -x;
\`\`\`

## BinaryOperator<T>

\`BiFunction<T, T, T>\` 的子接口，两参同类型，返回同类型。常用于 \`reduce\`：

\`\`\`java
BinaryOperator<Integer> sum = (a, b) -> a + b;
\`\`\`

\`BinaryOperator.minBy\` / \`maxBy\` 提供基于比较器的便捷工厂。

## 原始类型特化

为避免装箱开销，提供 \`IntFunction\`、\`ToIntFunction\`、\`IntToLongFunction\` 等众多原始类型变体。

下面通过代码演示 Function 系列接口：`,
    code: `// 演示 Function 系列接口
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        // ===== 基本用法 =====
        Function<String, Integer> len = String::length;
        System.out.println("字符串长度: " + len.apply("hello"));

        // ===== andThen：先应用，后链式 =====
        Function<Integer, Integer> addOne = x -> x + 1;
        Function<Integer, Integer> timesTwo = x -> x * 2;
        Function<Integer, Integer> addThenMul = addOne.andThen(timesTwo);
        System.out.println("(3+1)*2 = " + addThenMul.apply(3)); // 8

        // ===== compose：先组合，后应用 =====
        Function<Integer, Integer> mulThenAdd = addOne.compose(timesTwo);
        System.out.println("(3*2)+1 = " + mulThenAdd.apply(3)); // 7

        // ===== 多级链式 =====
        Function<Integer, Integer> pipeline = x -> x + 1;
        pipeline = pipeline.andThen(x -> x * 2).andThen(x -> x - 3);
        System.out.println("((5+1)*2)-3 = " + pipeline.apply(5)); // 9

        // ===== BiFunction =====
        BiFunction<String, Integer, String> repeat = (s, n) -> s.repeat(n);
        System.out.println("重复: " + repeat.apply("ab", 3));

        // BiFunction 只支持 andThen
        BiFunction<Integer, Integer, Integer> adder = (a, b) -> a + b;
        BiFunction<Integer, Integer, Integer> plusHundred = adder.andThen(x -> x + 100);
        System.out.println("(2+3)+100 = " + plusHundred.apply(2, 3));

        // ===== UnaryOperator：参数与返回同类型 =====
        UnaryOperator<String> trimUpper = s -> s.trim().toUpperCase();
        System.out.println("一元操作: " + trimUpper.apply("  hello  "));

        // ===== BinaryOperator：两参同类型，返回同类型 =====
        BinaryOperator<Integer> sum = (a, b) -> a + b;
        System.out.println("求和: " + sum.apply(10, 20));

        // minBy / maxBy
        BinaryOperator<Integer> min = BinaryOperator.minBy(Integer::compare);
        BinaryOperator<Integer> max = BinaryOperator.maxBy(Integer::compare);
        System.out.println("最小: " + min.apply(7, 3) + ", 最大: " + max.apply(7, 3));

        // ===== 原始类型特化 =====
        IntFunction<String> intToStr = i -> "数字=" + i;
        System.out.println(intToStr.apply(42));

        ToIntFunction<String> strLen = String::length;
        System.out.println("ToIntFunction 长度: " + strLen.applyAsInt("abcde"));
    }
}`
  },
  {
    id: "java-consumer-interface",
    group: "Lambda 与 Stream",
    icon: "📥",
    title: "Consumer 接口",
    content: `# Consumer 接口

\`Consumer<T>\` 表示一个**接收参数 T 但不返回结果**的操作（消费者），抽象方法为 \`void accept(T t)\`。常用于副作用操作，如打印、日志、修改对象等。

## 基本用法

\`\`\`java
Consumer<String> printer = s -> System.out.println(s);
printer.accept("Hello");
\`\`\`

## andThen：链式消费

\`andThen\` 将多个 Consumer 串联，按顺序依次执行：

\`\`\`java
Consumer<String> c1 = s -> System.out.println("c1: " + s);
Consumer<String> c2 = s -> System.out.println("c2: " + s);
Consumer<String> combined = c1.andThen(c2);
combined.accept("Hi"); // 先 c1 后 c2
\`\`\`

执行顺序是从左到右，与前一个 Consumer 的结果无关（因为 Consumer 无返回值）。

## BiConsumer<T, U>

接收两个参数的消费者：

\`\`\`java
BiConsumer<String, Integer> kv = (k, v) -> System.out.println(k + "=" + v);
kv.accept("age", 18);
\`\`\`

常用于遍历 Map：

\`\`\`java
map.forEach((k, v) -> System.out.println(k + "->" + v));
\`\`\`

## 消费者模式

Consumer 是**消费者模式**的核心：一个对象接收数据并执行某种动作，而不返回结果。典型场景：

- 事件回调
- 日志记录
- 数据验证（仅记录错误）
- 集合遍历 \`forEach\`

## forEach 的本质

\`Iterable.forEach(Consumer)\`、\`Stream.forEach(Consumer)\` 都接受 Consumer：

\`\`\`java
list.forEach(System.out::println);
\`\`\`

## 原始类型特化

\`IntConsumer\`、\`LongConsumer\`、\`DoubleConsumer\` 避免装箱。

## 副作用注意

Consumer 本质上**依赖副作用**，过度使用会使代码难以追踪。在 Stream 中应尽量避免在中间操作里使用有副作用的 Consumer（如修改外部状态），仅在终端操作（如 \`forEach\`）使用。

下面通过代码演示 Consumer 系列接口：`,
    code: `// 演示 Consumer 系列接口
import java.util.*;
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        // ===== 基本用法 =====
        Consumer<String> printer = s -> System.out.println("收到: " + s);
        printer.accept("Hello");

        // ===== andThen：链式消费 =====
        Consumer<String> step1 = s -> System.out.println("[step1] " + s);
        Consumer<String> step2 = s -> System.out.println("[step2] " + s);
        Consumer<String> step3 = s -> System.out.println("[step3] " + s);
        step1.andThen(step2).andThen(step3).accept("数据");

        System.out.println("----");

        // ===== BiConsumer：接收两个参数 =====
        BiConsumer<String, Integer> kv = (k, v) -> System.out.println(k + " = " + v);
        kv.accept("age", 18);

        // 遍历 Map
        Map<String, Integer> scores = new LinkedHashMap<>();
        scores.put("语文", 90);
        scores.put("数学", 95);
        scores.forEach((k, v) -> System.out.println(k + " -> " + v));

        // ===== forEach 的本质 =====
        List<String> names = Arrays.asList("Alice", "Bob", "Carol");
        names.forEach(name -> System.out.print(name + " "));
        System.out.println();

        // ===== 消费者模式：日志记录 =====
        List<String> logs = new ArrayList<>();
        Consumer<String> logger = logs::add;
        logger.accept("启动系统");
        logger.accept("加载配置");
        logger.accept("运行任务");
        System.out.println("日志: " + logs);

        // ===== 自定义方法接收 Consumer =====
        process("重要消息", s -> System.out.println("处理: " + s));

        // ===== 原始类型特化 =====
        IntConsumer intPrinter = x -> System.out.println("int = " + x);
        intPrinter.accept(42);

        // ===== 条件消费 =====
        Consumer<Integer> safePrint = n -> {
            if (n != null) System.out.println("值=" + n);
        };
        safePrint.accept(100);
    }

    // 接收 Consumer 作为参数
    static void process(String data, Consumer<String> action) {
        action.accept(data);
    }
}`
  },
  {
    id: "java-supplier-interface",
    group: "Lambda 与 Stream",
    icon: "📤",
    title: "Supplier 接口",
    content: `# Supplier 接口

\`Supplier<T>\` 是**无参数、返回 T 类型结果**的函数式接口（供应商），抽象方法为 \`T get()\`。与 \`Function\` 不同，它不接收输入，只负责"生产"结果。

## 基本用法

\`\`\`java
Supplier<Double> random = () -> Math.random();
double r = random.get();
\`\`\`

## 工厂模式

Supplier 天然契合**工厂模式**，将对象创建延迟到调用时：

\`\`\`java
Supplier<List<String>> listFactory = ArrayList::new;
List<String> list = listFactory.get();
\`\`\`

每次调用 \`get()\` 都会创建新实例。

## 惰性求值

Supplier 是实现**惰性求值**的关键工具——把昂贵计算包装在 Supplier 中，仅在真正需要时执行：

\`\`\`java
Supplier<Heavy> lazy = () -> createHeavyObject();
// 此处不执行
Heavy h = lazy.get(); // 真正执行
\`\`\`

Java 标准库中 \`Optional.orElseGet(Supplier)\`、参数化日志等均利用惰性求值避免不必要的计算。

## 供应商模式

Supplier 作为"数据源"被反复调用以产生序列，例如：

\`\`\`java
Stream.generate(() -> Math.random()).limit(5);
\`\`\`

## 缓存计算结果

可用 Supplier 配合 memoization 缓存结果（首次计算后缓存），避免重复求值：

\`\`\`java
Supplier<Expensive> memo = memoize(() -> computeExpensive());
\`\`\`

## BooleanSupplier 与原始特化

\`BooleanSupplier\` 返回 \`boolean\`，常用于条件判断的惰性求值；另有 \`IntSupplier\`、\`LongSupplier\`、\`DoubleSupplier\` 避免装箱。

## Supplier vs 工厂方法

Supplier 更轻量、可组合，常作为函数参数传递；工厂方法通常定义在类中、命名固定。两者可结合：方法返回 Supplier，由调用方决定何时执行。

下面通过代码演示 Supplier 接口：`,
    code: `// 演示 Supplier 接口
import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        // ===== 基本用法 =====
        Supplier<Double> random = Math::random;
        System.out.println("随机数: " + random.get());

        // ===== 工厂模式：延迟创建对象 =====
        Supplier<List<String>> listFactory = ArrayList::new;
        List<String> l1 = listFactory.get();
        List<String> l2 = listFactory.get();
        System.out.println("是否同一对象: " + (l1 == l2)); // false
        l1.add("A");
        System.out.println("l1: " + l1 + ", l2: " + l2);

        // ===== 惰性求值 =====
        Supplier<String> lazy = () -> {
            System.out.println("  (执行了昂贵计算)");
            return "计算结果";
        };
        System.out.println("定义 Supplier，尚未执行");
        String result = lazy.get(); // 此处才执行
        System.out.println("得到: " + result);

        // ===== 配合 Optional 实现惰性默认值 =====
        // orElse 直接求值，orElseGet 惰性求值
        String value = findMaybe().orElseGet(() -> {
            System.out.println("  (生成默认值)");
            return "默认";
        });
        System.out.println("Optional 结果: " + value);

        // ===== Stream.generate 生成无限流 =====
        List<Integer> nums = Stream.generate(() -> (int)(Math.random() * 100))
                                    .limit(5)
                                    .collect(Collectors.toList());
        System.out.println("5 个随机数: " + nums);

        // ===== 计数器 Supplier（有状态）=====
        int[] counter = {0};
        Supplier<Integer> counterSupplier = () -> ++counter[0];
        System.out.println(counterSupplier.get());
        System.out.println(counterSupplier.get());
        System.out.println(counterSupplier.get());

        // ===== BooleanSupplier =====
        BooleanSupplier isPositive = () -> new Random().nextInt() > 0;
        System.out.println("是否为正: " + isPositive.getAsBoolean());

        // ===== 简单 memoization =====
        Supplier<Long> memoized = memoize(() -> {
            System.out.println("  (首次计算时间戳)");
            return System.currentTimeMillis();
        });
        System.out.println("第一次: " + memoized.get());
        System.out.println("第二次(缓存): " + memoized.get());
    }

    static Optional<String> findMaybe() {
        return Optional.empty();
    }

    // 简单的记忆化封装
    static <T> Supplier<T> memoize(Supplier<T> original) {
        return new Supplier<T>() {
            T value;
            boolean computed = false;
            public T get() {
                if (!computed) { value = original.get(); computed = true; }
                return value;
            }
        };
    }
}`
  },
  {
    id: "java-predicate-interface",
    group: "Lambda 与 Stream",
    icon: "🔍",
    title: "Predicate 接口",
    content: `# Predicate 接口

\`Predicate<T>\` 表示一个**返回 boolean 的断言函数**，抽象方法为 \`boolean test(T t)\`。它是过滤、条件判断的核心抽象。

## 基本用法

\`\`\`java
Predicate<String> isEmpty = String::isEmpty;
boolean b = isEmpty.test(""); // true
\`\`\`

## 逻辑组合

Predicate 提供三个默认方法实现逻辑运算：

- \`and(Predicate)\`：逻辑与
- \`or(Predicate)\`：逻辑或
- \`negate()\`：逻辑非

\`\`\`java
Predicate<Integer> positive = x -> x > 0;
Predicate<Integer> even = x -> x % 2 == 0;
Predicate<Integer> posEven = positive.and(even); // 正且偶
Predicate<Integer> notEven = even.negate();       // 非偶
\`\`\`

组合时按短路求值。

## isEqual

静态方法 \`Predicate.isEqual(target)\` 返回基于 \`Objects.equals\` 的相等性断言：

\`\`\`java
Predicate<String> isHello = Predicate.isEqual("Hello");
\`\`\`

## BiPredicate<T, U>

接收两个参数的断言：

\`\`\`java
BiPredicate<String, Integer> lenAtLeast = (s, n) -> s.length() >= n;
\`\`\`

## 过滤逻辑组合

Predicate 最常见的用途是组合多个过滤条件，用于 \`Stream.filter\` 或 \`Collection.removeIf\`：

\`\`\`java
list.stream().filter(isAdult.and(isActive)).collect(...);
\`\`\`

通过组合，可以构建复杂的查询表达式，避免大量嵌套 if。

## not（Java 11+）

Java 11 引入 \`Predicate.not(predicate)\`，等价于 \`negate()\` 但更易读：

\`\`\`java
Predicate.not(String::isBlank)
\`\`\`

## 原始类型特化

\`IntPredicate\`、\`LongPredicate\`、\`DoublePredicate\` 避免装箱。

下面通过代码演示 Predicate 接口：`,
    code: `// 演示 Predicate 接口
import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        // ===== 基本用法 =====
        Predicate<String> isEmpty = String::isEmpty;
        System.out.println("空串? " + isEmpty.test(""));
        System.out.println("abc 空? " + isEmpty.test("abc"));

        // ===== 逻辑组合 =====
        Predicate<Integer> positive = x -> x > 0;
        Predicate<Integer> even = x -> x % 2 == 0;
        Predicate<Integer> positiveAndEven = positive.and(even);
        Predicate<Integer> positiveOrEven = positive.or(even);
        Predicate<Integer> notEven = even.negate();

        System.out.println("6 正且偶? " + positiveAndEven.test(6));
        System.out.println("-2 正或偶? " + positiveOrEven.test(-2));
        System.out.println("3 非偶? " + notEven.test(3));

        // ===== isEqual =====
        Predicate<String> isHello = Predicate.isEqual("Hello");
        System.out.println("等于 Hello? " + isHello.test("Hello"));
        System.out.println("等于 Hello? " + isHello.test("Hi"));

        // ===== BiPredicate =====
        BiPredicate<String, Integer> lenAtLeast = (s, n) -> s.length() >= n;
        System.out.println("长度>=3? " + lenAtLeast.test("hello", 3));

        // ===== 过滤逻辑组合 =====
        List<Integer> nums = Arrays.asList(-2, -1, 0, 1, 2, 3, 4, 5, 6);
        List<Integer> result = nums.stream()
            .filter(positive.and(even))
            .collect(Collectors.toList());
        System.out.println("正且偶: " + result);

        // 多条件链式
        Predicate<Integer> between = x -> x >= 2 && x <= 5;
        List<Integer> mid = nums.stream().filter(between).collect(Collectors.toList());
        System.out.println("2~5 之间: " + mid);

        // ===== negate 反转 =====
        List<Integer> odds = nums.stream().filter(even.negate()).collect(Collectors.toList());
        System.out.println("奇数: " + odds);

        // ===== 自定义方法接收 Predicate =====
        List<String> words = Arrays.asList("a", "bb", "ccc", "dddd");
        List<String> longWords = filter(words, s -> s.length() >= 3);
        System.out.println("长单词: " + longWords);

        // ===== Java 11+ not（用 negate 模拟兼容）=====
        Predicate<String> notBlank = ((Predicate<String>) s -> s.isBlank()).negate();
        System.out.println("非空白? " + notBlank.test("x"));

        // ===== removeIf =====
        List<Integer> mutable = new ArrayList<>(nums);
        mutable.removeIf(x -> x < 0);
        System.out.println("移除负数后: " + mutable);
    }

    static <T> List<T> filter(List<T> src, Predicate<T> p) {
        List<T> out = new ArrayList<>();
        for (T t : src) if (p.test(t)) out.add(t);
        return out;
    }
}`
  },
  {
    id: "java-optional",
    group: "Lambda 与 Stream",
    icon: "📦",
    title: "Optional",
    content: `# Optional

\`Optional<T>\` 是一个**容器对象**，可能包含非 null 的值，也可能为空。它用于显式表达"结果可能不存在"，迫使调用方处理空值情况，从而减少 \`NullPointerException\`。

## 创建 Optional

- \`Optional.of(value)\`：value 不能为 null，否则抛 NPE
- \`Optional.ofNullable(value)\`：value 可为 null，null 时返回空 Optional
- \`Optional.empty()\`：显式空 Optional

\`\`\`java
Optional<String> a = Optional.of("x");        // 非 null
Optional<String> b = Optional.ofNullable(null); // 可为空
\`\`\`

## 获取值与默认值

- \`get()\`：有值返回，无值抛 \`NoSuchElementException\`（慎用）
- \`orElse(other)\`：无值返回 other（**立即求值**）
- \`orElseGet(Supplier)\`：无值调用 Supplier（**惰性求值**）
- \`orElseThrow()\`：无值抛异常

\`\`\`java
String v = maybe.orElse("默认");
String v2 = maybe.orElseGet(() -> expensiveDefault());
\`\`\`

\`orElse\` 与 \`orElseGet\` 的关键区别：前者**无论是否有值都会计算**默认值，后者**仅在无值时**计算。

## 转换：map / flatMap

- \`map(Function)\`：有值时转换，无值返回空 Optional
- \`flatMap(Function)\`：转换函数本身返回 Optional，避免嵌套

\`\`\`java
opt.map(String::length);              // Optional<Integer>
opt.flatMap(s -> maybe(s));           // 不产生 Optional<Optional<T>>
\`\`\`

## 过滤：filter

\`filter(Predicate)\` 有值且满足条件时保留，否则返回空：

\`\`\`java
opt.filter(s -> s.length() > 3);
\`\`\`

## 判断：isPresent / ifPresent

- \`isPresent()\`：返回是否有值
- \`ifPresent(Consumer)\`：有值时执行消费

\`\`\`java
if (opt.isPresent()) { ... }
opt.ifPresent(v -> use(v));
\`\`\`

Java 9+ 提供 \`ifPresentOrElse(Consumer, Runnable)\` 处理两种情况。

## 避免的反模式

- 不要用 Optional 作为字段或方法参数（设计为返回类型）
- 不要 \`get()\` 后立即使用，应优先用 \`map\`/\`orElse\`/\`ifPresent\`
- 不要用 \`isPresent() + get()\` 替代简单的 null 检查（失去意义）

下面通过代码演示 Optional：`,
    code: `// 演示 Optional 的使用
import java.util.*;
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        // ===== 创建 Optional =====
        Optional<String> present = Optional.of("Hello");
        Optional<String> empty = Optional.empty();
        Optional<String> nullable = Optional.ofNullable(null);

        System.out.println("present: " + present);
        System.out.println("empty: " + empty);
        System.out.println("nullable: " + nullable);

        // ===== orElse / orElseGet =====
        String v1 = empty.orElse("默认值");
        String v2 = empty.orElseGet(() -> "惰性默认值");
        System.out.println("orElse: " + v1 + ", orElseGet: " + v2);

        // orElse 与 orElseGet 的区别
        String v3 = present.orElse(createDefault());          // 即使有值也会调用
        String v4 = present.orElseGet(() -> createDefault()); // 有值则不调用
        System.out.println("v3=" + v3 + ", v4=" + v4);

        // ===== map 转换 =====
        Optional<Integer> len = present.map(String::length);
        System.out.println("长度: " + len.orElse(-1));

        Optional<Integer> emptyLen = empty.map(String::length);
        System.out.println("空Optional长度: " + emptyLen.orElse(-1));

        // ===== flatMap 避免嵌套 =====
        Optional<String> upper = present.flatMap(s -> Optional.of(s.toUpperCase()));
        System.out.println("flatMap 大写: " + upper);

        // ===== filter 过滤 =====
        Optional<String> filtered = present.filter(s -> s.length() > 3);
        System.out.println("长度>3: " + filtered);

        Optional<String> filteredOut = present.filter(s -> s.length() > 100);
        System.out.println("长度>100: " + filteredOut);

        // ===== isPresent / ifPresent =====
        System.out.println("present 是否有值: " + present.isPresent());
        present.ifPresent(s -> System.out.println("消费: " + s));

        // Java 9+ ifPresentOrElse
        empty.ifPresentOrElse(
            s -> System.out.println("有值: " + s),
            () -> System.out.println("无值，执行 else 分支")
        );

        // ===== orElseThrow =====
        String must = present.orElseThrow();
        System.out.println("orElseThrow: " + must);

        try {
            empty.orElseThrow(() -> new RuntimeException("值不存在"));
        } catch (RuntimeException e) {
            System.out.println("捕获: " + e.getMessage());
        }

        // ===== 实际场景：查找用户 =====
        String name = findUser(1).map(User::getName).orElse("匿名");
        System.out.println("用户名: " + name);

        String name2 = findUser(99).map(User::getName).orElse("匿名");
        System.out.println("用户名: " + name2);
    }

    static String createDefault() {
        System.out.println("  (调用 createDefault)");
        return "默认";
    }

    static Optional<User> findUser(int id) {
        if (id == 1) return Optional.of(new User("张三"));
        return Optional.empty();
    }

    static class User {
        String name;
        User(String name) { this.name = name; }
        String getName() { return name; }
    }
}`
  },
  {
    id: "java-stream-create",
    group: "Lambda 与 Stream",
    icon: "🌊",
    title: "Stream 创建",
    content: `# Stream 创建

\`Stream\` 是 Java 8 引入的**对集合和数组进行函数式操作的抽象**。它不是数据结构，而是描述了对数据的一系列操作流水线。Stream 是**一次性**的，只能消费一次。

## Stream.of

通过显式列举元素创建：

\`\`\`java
Stream<String> s = Stream.of("a", "b", "c");
\`\`\`

也可创建空流 \`Stream.empty()\`。

## Collection.stream

最常见的来源——任何 Collection 都可转为流：

\`\`\`java
List<Integer> list = Arrays.asList(1, 2, 3);
Stream<Integer> s = list.stream();
\`\`\`

## Arrays.stream

从数组创建流，支持基本类型数组（返回 \`IntStream\` 等）：

\`\`\`java
int[] arr = {1, 2, 3};
IntStream is = Arrays.stream(arr);
\`\`\`

## Stream.generate

接收 Supplier 生成**无限流**，必须配合 \`limit\` 截断：

\`\`\`java
Stream<Double> randoms = Stream.generate(Math::random).limit(5);
\`\`\`

## Stream.iterate

\`iterate(seed, next)\` 生成无限流，每次根据前一个值计算下一个：

\`\`\`java
Stream<Integer> naturals = Stream.iterate(1, n -> n + 1).limit(10);
\`\`\`

Java 9+ 重载 \`iterate(seed, hasNext, next)\` 可带终止条件。

## IntStream.range / rangeClosed

生成整数范围流：

\`\`\`java
IntStream.range(1, 5)       // 1,2,3,4（不含 5）
IntStream.rangeClosed(1, 5) // 1,2,3,4,5（含 5）
\`\`\`

## 其他创建方式

- \`BufferedReader.lines()\`：文件行流
- \`Pattern.splitAsStream()\`：分隔流
- \`Stream.concat(a, b)\`：连接两个流

## 流的特质

- **不存储数据**：流从源拉取数据，本身不持有
- **函数式**：不修改源
- **惰性**：中间操作不立即执行
- **一次性**：消费后不能再用

下面通过代码演示 Stream 的多种创建方式：`,
    code: `// 演示 Stream 的多种创建方式
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        // ===== Stream.of =====
        Stream<String> s1 = Stream.of("a", "b", "c");
        System.out.println("Stream.of: " + s1.collect(Collectors.toList()));

        // Stream.of 单元素
        Stream<Integer> single = Stream.of(42);
        System.out.println("单元素: " + single.findFirst().get());

        // 空流
        Stream<Object> empty = Stream.empty();
        System.out.println("空流数量: " + empty.count());

        // ===== Collection.stream =====
        List<Integer> list = Arrays.asList(1, 2, 3, 4, 5);
        System.out.println("List 流求和: " + list.stream().mapToInt(Integer::intValue).sum());

        Set<String> set = new HashSet<>(Arrays.asList("x", "y"));
        System.out.println("Set 流: " + set.stream().collect(Collectors.toList()));

        // ===== Arrays.stream =====
        String[] arr = {"甲", "乙", "丙"};
        System.out.println("数组流: " + Arrays.stream(arr).collect(Collectors.joining(",")));

        // 基本类型数组 → IntStream
        int[] nums = {10, 20, 30};
        System.out.println("IntStream 求和: " + Arrays.stream(nums).sum());

        // 数组的一部分
        System.out.println("子数组流求和: " + Arrays.stream(nums, 1, 3).sum()); // 20+30

        // ===== Stream.generate =====
        List<Double> randoms = Stream.generate(Math::random)
                                     .limit(3)
                                     .collect(Collectors.toList());
        System.out.println("3 个随机: " + randoms);

        // ===== Stream.iterate =====
        List<Integer> naturals = Stream.iterate(1, n -> n + 1)
                                       .limit(5)
                                       .collect(Collectors.toList());
        System.out.println("前 5 个自然数: " + naturals);

        // 2 的幂次
        List<Integer> powers = Stream.iterate(1, n -> n * 2)
                                     .limit(6)
                                     .collect(Collectors.toList());
        System.out.println("2 的幂次: " + powers);

        // Java 9+ iterate 带终止条件
        List<Integer> under10 = Stream.iterate(1, n -> n < 10, n -> n + 1)
                                      .collect(Collectors.toList());
        System.out.println("小于 10 的自然数: " + under10);

        // ===== IntStream.range / rangeClosed =====
        System.out.println("range(1,5) 求和: " + IntStream.range(1, 5).sum());      // 1+2+3+4=10
        System.out.println("rangeClosed(1,5) 求和: " + IntStream.rangeClosed(1, 5).sum()); // 15

        // ===== Stream.concat =====
        Stream<String> a = Stream.of("A", "B");
        Stream<String> b = Stream.of("C", "D");
        System.out.println("concat: " + Stream.concat(a, b).collect(Collectors.toList()));

        // ===== Builder 创建 =====
        Stream<String> built = Stream.<String>builder()
                                     .add("一").add("二").add("三").build();
        System.out.println("builder: " + built.collect(Collectors.toList()));
    }
}`
  },
  {
    id: "java-stream-intermediate",
    group: "Lambda 与 Stream",
    icon: "⚙️",
    title: "中间操作",
    content: `# 中间操作

Stream 操作分为**中间操作**和**终端操作**。中间操作返回新 Stream，可链式调用；它们都是**惰性**的，直到终端操作触发才真正执行。

## filter

过滤满足条件的元素：

\`\`\`java
stream.filter(x -> x > 0)
\`\`\`

## map

一对一转换：

\`\`\`java
stream.map(String::length)
\`\`\`

## flatMap

一对多展开，将流"拍平"。常用于嵌套集合：

\`\`\`java
list.stream().flatMap(l -> l.stream()) // List<List> → 单层流
\`\`\`

与 \`map\` 的区别：\`map\` 产生 \`Stream<Stream<T>>\`，\`flatMap\` 把内层流元素直接并入外层。

## sorted

排序。无参版本要求元素实现 \`Comparable\`；带参版本接收 \`Comparator\`：

\`\`\`java
stream.sorted()
stream.sorted(Comparator.reverseOrder())
\`\`\`

\`sorted\` 是**有状态**的中间操作，需要缓冲全部元素。

## distinct

去重，基于 \`equals/hashCode\`：

\`\`\`java
stream.distinct()
\`\`\`

## limit / skip

- \`limit(n)\`：取前 n 个
- \`skip(n)\`：跳过前 n 个

常用于分页。

## peek

为每个元素执行一个动作（Consumer），返回原流。主要用于**调试**：

\`\`\`java
stream.peek(System.out::println).map(...)
\`\`\`

注意：由于惰性求值，\`peek\` 只有在终端操作触发时才执行，且可能因短路而不执行所有元素。

## 惰性求值的意义

中间操作不立即执行，带来两个好处：

1. **性能**：可融合为单次遍历，避免多次循环
2. **短路**：终端操作若提前结束，未涉及的元素不会被处理

\`\`\`java
// 仅遍历到第一个匹配元素即停止
list.stream().filter(x -> x > 5).findFirst();
\`\`\`

## 有状态 vs 无状态

- **无状态**：filter、map、flatMap、peek——可逐元素处理
- **有状态**：sorted、distinct、limit、skip——需看到更多元素

有状态操作可能破坏短路优化，需缓冲数据。

下面通过代码演示各种中间操作：`,
    code: `// 演示 Stream 的中间操作
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        // ===== filter =====
        List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5, 6);
        List<Integer> evens = nums.stream().filter(n -> n % 2 == 0).collect(Collectors.toList());
        System.out.println("偶数: " + evens);

        // ===== map =====
        List<String> words = Arrays.asList("apple", "bee", "cat");
        List<Integer> lens = words.stream().map(String::length).collect(Collectors.toList());
        System.out.println("长度: " + lens);

        // ===== flatMap =====
        List<List<Integer>> nested = Arrays.asList(
            Arrays.asList(1, 2), Arrays.asList(3, 4), Arrays.asList(5));
        List<Integer> flat = nested.stream()
            .flatMap(Collection::stream)
            .collect(Collectors.toList());
        System.out.println("拍平: " + flat);

        // 字符串拆分展开
        List<String> sentences = Arrays.asList("hello world", "java stream");
        List<String> allWords = sentences.stream()
            .flatMap(s -> Arrays.stream(s.split(" ")))
            .collect(Collectors.toList());
        System.out.println("展开单词: " + allWords);

        // ===== sorted =====
        List<Integer> unsorted = Arrays.asList(5, 2, 8, 1, 9);
        System.out.println("升序: " + unsorted.stream().sorted().collect(Collectors.toList()));
        System.out.println("降序: " + unsorted.stream().sorted(Comparator.reverseOrder()).collect(Collectors.toList()));

        // 按字段排序
        List<String> names = Arrays.asList("Carol", "Alice", "Bob");
        System.out.println("名字排序: " + names.stream().sorted().collect(Collectors.toList()));

        // ===== distinct =====
        List<Integer> dups = Arrays.asList(1, 2, 2, 3, 3, 3, 4);
        System.out.println("去重: " + dups.stream().distinct().collect(Collectors.toList()));

        // ===== limit / skip =====
        List<Integer> range1 = nums.stream().limit(3).collect(Collectors.toList());
        List<Integer> range2 = nums.stream().skip(2).collect(Collectors.toList());
        List<Integer> page = nums.stream().skip(2).limit(2).collect(Collectors.toList());
        System.out.println("limit 3: " + range1);
        System.out.println("skip 2: " + range2);
        System.out.println("分页(2,2): " + page);

        // ===== peek 调试 =====
        System.out.println("peek 调试:");
        List<Integer> peeked = nums.stream()
            .peek(n -> System.out.println("  原始: " + n))
            .filter(n -> n > 2)
            .peek(n -> System.out.println("  过滤后: " + n))
            .map(n -> n * 10)
            .peek(n -> System.out.println("  映射后: " + n))
            .collect(Collectors.toList());
        System.out.println("结果: " + peeked);

        // ===== 链式组合 =====
        List<String> result = words.stream()
            .filter(w -> w.length() > 3)
            .map(String::toUpperCase)
            .sorted()
            .collect(Collectors.toList());
        System.out.println("链式: " + result);

        // ===== 短路：findFirst 触发时 filter 不会处理所有元素 =====
        Optional<Integer> first = nums.stream()
            .filter(n -> { System.out.println("  检查 " + n); return n > 3; })
            .findFirst();
        System.out.println("第一个 >3: " + first.get());
    }
}`
  },
  {
    id: "java-stream-terminal",
    group: "Lambda 与 Stream",
    icon: "🏁",
    title: "终端操作",
    content: `# 终端操作

终端操作会触发流的实际计算，并产生一个**非 Stream 的结果**（值、集合或副作用）。每个 Stream 只能有一个终端操作，调用后流即被消费。

## forEach

对每个元素执行动作（Consumer），无返回值：

\`\`\`java
stream.forEach(System.out::println);
\`\`\`

## collect

将流元素收集到集合或其他结构，是最强大的终端操作：

\`\`\`java
stream.collect(Collectors.toList());
\`\`\`

详见 collect 章节。

## reduce

归约为单个值，详见 reduce 章节。

## count

返回元素数量：

\`\`\`java
long n = stream.count();
\`\`\`

## min / max

返回 Optional，基于比较器：

\`\`\`java
stream.min(Comparator.naturalOrder());
stream.max(Comparator.comparingInt(...));
\`\`\`

## 匹配：anyMatch / allMatch / noneMatch

- \`anyMatch(Predicate)\`：任一匹配即返回 true（短路）
- \`allMatch(Predicate)\`：全部匹配才返回 true（短路）
- \`noneMatch(Predicate)\`：全部不匹配才返回 true（短路）

\`\`\`java
boolean hasNeg = nums.stream().anyMatch(x -> x < 0);
\`\`\`

## 查找：findFirst / findAny

- \`findFirst()\`：返回第一个元素（顺序保证）
- \`findAny()\`：返回任意元素（并行流中更高效）

\`\`\`java
Optional<Integer> first = stream.filter(...).findFirst();
\`\`\`

两者都返回 \`Optional<T>\`。

## 聚合：sum / average / summaryStatistics

数值流（IntStream 等）提供便捷聚合：

\`\`\`java
int sum = intStream.sum();
OptionalDouble avg = intStream.average();
IntSummaryStatistics stat = intStream.summaryStatistics();
\`\`\`

## toArray

收集为数组：

\`\`\`java
String[] arr = stream.toArray(String[]::new);
\`\`\`

## 短路

\`anyMatch\`、\`allMatch\`、\`noneMatch\`、\`findFirst\`、\`findAny\`、\`limit\` 等是短路操作，可在未遍历完所有元素时提前结束。

下面通过代码演示各种终端操作：`,
    code: `// 演示 Stream 的终端操作
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = Arrays.asList(3, 1, 4, 1, 5, 9, 2, 6);

        // ===== forEach =====
        System.out.print("forEach: ");
        nums.stream().forEach(n -> System.out.print(n + " "));
        System.out.println();

        // ===== count =====
        System.out.println("count: " + nums.stream().count());

        // ===== min / max =====
        System.out.println("min: " + nums.stream().min(Integer::compare).get());
        System.out.println("max: " + nums.stream().max(Integer::compare).get());

        // ===== 匹配 =====
        System.out.println("有大于5? " + nums.stream().anyMatch(n -> n > 5));
        System.out.println("全为正? " + nums.stream().allMatch(n -> n > 0));
        System.out.println("无负数? " + nums.stream().noneMatch(n -> n < 0));

        // ===== 查找 =====
        System.out.println("第一个偶数: " + nums.stream().filter(n -> n % 2 == 0).findFirst().get());
        System.out.println("任一大于8: " + nums.stream().filter(n -> n > 8).findAny().get());

        // ===== reduce =====
        int sum = nums.stream().reduce(0, Integer::sum);
        System.out.println("reduce 求和: " + sum);

        // ===== collect toList =====
        List<Integer> sorted = nums.stream().sorted().collect(Collectors.toList());
        System.out.println("排序后收集: " + sorted);

        // ===== toArray =====
        Integer[] arr = nums.stream().toArray(Integer[]::new);
        System.out.println("toArray: " + Arrays.toString(arr));

        // ===== 数值流聚合 =====
        IntSummaryStatistics stat = nums.stream().mapToInt(Integer::intValue).summaryStatistics();
        System.out.println("统计: count=" + stat.getCount()
            + ", sum=" + stat.getSum()
            + ", min=" + stat.getMin()
            + ", max=" + stat.getMax()
            + ", avg=" + stat.getAverage());

        // ===== sum / average =====
        int s = nums.stream().mapToInt(Integer::intValue).sum();
        double avg = nums.stream().mapToInt(Integer::intValue).average().orElse(0);
        System.out.println("sum=" + s + ", avg=" + avg);

        // ===== 短路演示 =====
        System.out.println("短路 anyMatch:");
        boolean found = nums.stream()
            .peek(n -> System.out.println("  检查 " + n))
            .anyMatch(n -> n > 5);
        System.out.println("结果: " + found);

        // ===== noneMatch =====
        boolean noZero = nums.stream().noneMatch(n -> n == 0);
        System.out.println("无 0? " + noZero);

        // ===== collect 求字符串连接 =====
        String joined = nums.stream().map(String::valueOf).collect(Collectors.joining("-"));
        System.out.println("连接: " + joined);
    }
}`
  },
  {
    id: "java-stream-reduce",
    group: "Lambda 与 Stream",
    icon: "📉",
    title: "reduce 归约",
    content: `# reduce 归约

\`reduce\` 是 Stream 的核心终端操作之一，将流中所有元素**反复组合**为单一结果。它体现了"归约"思想——从多个值得到一个值。

## 形式一：reduce(BinaryOperator)

返回 \`Optional<T>\`，因为没有初始值，空流无法产生结果：

\`\`\`java
Optional<Integer> sum = stream.reduce((a, b) -> a + b);
\`\`\`

BinaryOperator 是 BiFunction<T, T, T> 的子接口，两个参数和返回值同类型。

## 形式二：reduce(identity, accumulator)

提供**初始值** identity，返回 \`T\`（非 Optional）。空流时返回 identity：

\`\`\`java
int sum = stream.reduce(0, (a, b) -> a + b);
\`\`\`

identity 必须满足：对于任意 x，\`accumulator(identity, x) == x\`（即 identity 是累加的"零元"），否则结果不正确。

## 形式三：reduce(identity, accumulator, combiner)

用于**并行流**，当累加器类型与流元素类型不同时，需要 combiner 合并部分结果：

\`\`\`java
int sum = stream.reduce(0, (acc, s) -> acc + s.length(), Integer::sum);
\`\`\`

此处 acc 是 Integer，s 是 String，accumulator 累加字符串长度，combiner 合并多个 Integer 部分和。

## 归约与可变归约

\`reduce\` 适合**不可变**归约（每次产生新值）；若需可变容器（如 ArrayList），应使用 \`collect\`，性能更好。

\`\`\`java
// 不推荐：用 reduce 拼接 List
// 推荐：用 collect
stream.collect(Collectors.toList());
\`\`\`

## 典型应用

- 求和、求积：\`reduce(0, Integer::sum)\`
- 求最大/最小：\`reduce(Integer::max)\`
- 字符串拼接：\`reduce("", (a, b) -> a + b)\`
- 计算阶乘：\`IntStream.rangeClosed(1, n).reduce(1, (a, b) -> a * b)\`

## 并行归约

并行流中，reduce 会分片并行计算再合并。形式三的 combiner 必须满足**结合律**（associative），否则结果不确定。

\`\`\`java
int sum = list.parallelStream().reduce(0, Integer::sum, Integer::sum);
\`\`\`

减法、除法不满足结合律，不能用于并行 reduce。

下面通过代码演示 reduce 的三种形式：`,
    code: `// 演示 reduce 归约操作
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5);

        // ===== 形式一：reduce(BinaryOperator) → Optional =====
        Optional<Integer> sum1 = nums.stream().reduce((a, b) -> a + b);
        System.out.println("求和(Optional): " + sum1.orElse(0));

        Optional<Integer> product1 = nums.stream().reduce((a, b) -> a * b);
        System.out.println("求积(Optional): " + product1.orElse(0));

        Optional<Integer> max1 = nums.stream().reduce(Integer::max);
        System.out.println("最大值: " + max1.orElse(Integer.MIN_VALUE));

        // 空流 → Optional.empty()
        Optional<Integer> empty = new ArrayList<Integer>().stream().reduce(Integer::sum);
        System.out.println("空流 reduce: " + empty);

        // ===== 形式二：reduce(identity, accumulator) → T =====
        int sum2 = nums.stream().reduce(0, Integer::sum);
        System.out.println("带初始值求和: " + sum2);

        int product2 = nums.stream().reduce(1, (a, b) -> a * b);
        System.out.println("阶乘 5!: " + product2);

        // 空流返回 identity
        int emptySum = new ArrayList<Integer>().stream().reduce(100, Integer::sum);
        System.out.println("空流返回 identity: " + emptySum);

        // ===== 形式三：reduce(identity, accumulator, combiner) =====
        // 累加字符串长度（acc 与元素类型不同）
        List<String> words = Arrays.asList("apple", "bee", "cat");
        int totalLen = words.stream().reduce(0, (acc, str) -> acc + str.length(), Integer::sum);
        System.out.println("字符串总长度: " + totalLen);

        // ===== 字符串拼接 =====
        String concat = words.stream().reduce("", (a, b) -> a + b);
        System.out.println("拼接: " + concat);

        String concat2 = words.stream().reduce("", (a, b) -> a.isEmpty() ? b : a + "," + b);
        System.out.println("逗号拼接: " + concat2);

        // ===== 计算阶乘 =====
        int factorial = IntStream.rangeClosed(1, 5).reduce(1, (a, b) -> a * b);
        System.out.println("1~5 阶乘: " + factorial);

        // ===== 并行归约（形式三）=====
        int parallelSum = IntStream.rangeClosed(1, 100).parallel()
                                   .reduce(0, Integer::sum);
        System.out.println("并行求和 1..100: " + parallelSum);

        List<Integer> big = IntStream.rangeClosed(1, 1000).boxed().collect(Collectors.toList());
        int parallelSum2 = big.parallelStream().reduce(0, Integer::sum, Integer::sum);
        System.out.println("并行求和 1..1000: " + parallelSum2);

        // ===== 求最长字符串 =====
        Optional<String> longest = words.stream().reduce((a, b) -> a.length() >= b.length() ? a : b);
        System.out.println("最长单词: " + longest.orElse(""));

        // ===== 统计偶数个数 =====
        long evenCount = nums.stream().reduce(0, (acc, n) -> acc + (n % 2 == 0 ? 1 : 0), Integer::sum);
        System.out.println("偶数个数: " + evenCount);
    }
}`
  },
  {
    id: "java-stream-collect",
    group: "Lambda 与 Stream",
    icon: "📦",
    title: "collect 收集",
    content: `# collect 收集

\`collect\` 是 Stream 最灵活的终端操作，将流元素**可变归约**为集合、字符串或其他结构。它接收一个 \`Collector\`，由 \`Collectors\` 工具类提供常用实现。

## 基本形式

\`\`\`java
<R, A> R collect(Collector<? super T, A, R> collector);
\`\`\`

也可直接使用三参数形式 \`collect(supplier, accumulator, combiner)\`，但通常用预定义 Collector 更简洁。

## Collectors.toList / toSet

收集为 List 或 Set：

\`\`\`java
stream.collect(Collectors.toList());
stream.collect(Collectors.toSet());
\`\`\`

Java 16+ 可直接 \`Stream.toList()\`（返回不可修改 List）。

## Collectors.toMap

收集为 Map，需提供 key 和 value 的映射函数：

\`\`\`java
stream.collect(Collectors.toMap(User::getId, User::getName));
\`\`\`

默认遇重复 key 抛异常，可提供合并函数：

\`\`\`java
Collectors.toMap(User::getCity, User::getName, (a, b) -> a + "," + b);
\`\`\`

可指定 Map 实现：

\`\`\`java
Collectors.toMap(k -> k, v -> v, (a, b) -> a, LinkedHashMap::new);
\`\`\`

## Collectors.joining

字符串拼接，可加分隔符、前后缀：

\`\`\`java
stream.collect(Collectors.joining(", ", "[", "]"));
\`\`\`

## Collectors.groupingBy

按分类函数分组，返回 \`Map<K, List<T>>\`：

\`\`\`java
stream.collect(Collectors.groupingBy(User::getCity));
\`\`\`

可指定下游 Collector，例如计数：

\`\`\`java
Collectors.groupingBy(User::getCity, Collectors.counting());
\`\`\`

## Collectors.partitioningBy

按 Predicate 分为 true/false 两组：

\`\`\`java
stream.collect(Collectors.partitioningBy(x -> x > 0));
\`\`\`

返回 \`Map<Boolean, List<T>>\`。

## Collectors.counting / summingInt / averagingInt

常用下游 Collector：
- \`counting()\`：计数
- \`summingInt\` / \`summingLong\` / \`summingDouble\`：求和
- \`averagingInt\` 等：平均
- \`summarizingInt\`：综合统计

## Collectors.mapping

对分组内元素再映射后收集：

\`\`\`java
groupingBy(User::getCity, mapping(User::getName, toList()));
\`\`\`

下面通过代码演示常用 Collector：`,
    code: `// 演示 collect 与常用 Collector
import java.util.*;
import java.util.stream.*;
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Alice", "Bob", "Carol", "Andrew", "Anna");

        // ===== toList / toSet =====
        List<String> list = names.stream().collect(Collectors.toList());
        System.out.println("toList: " + list);

        Set<Character> firstLetters = names.stream()
            .map(s -> s.charAt(0))
            .collect(Collectors.toSet());
        System.out.println("首字母集合: " + firstLetters);

        // 指定 List 实现
        LinkedList<String> linked = names.stream()
            .collect(Collectors.toCollection(LinkedList::new));
        System.out.println("LinkedList: " + linked.getClass().getSimpleName());

        // ===== toMap =====
        Map<String, Integer> nameLen = names.stream()
            .collect(Collectors.toMap(Function.identity(), String::length, (a, b) -> a));
        System.out.println("名字→长度: " + nameLen);

        // 重复 key 合并
        Map<Character, String> byFirst = names.stream()
            .collect(Collectors.toMap(s -> s.charAt(0), Function.identity(), (a, b) -> a + "," + b));
        System.out.println("按首字母分组(合并): " + byFirst);

        // ===== joining =====
        String joined = names.stream().collect(Collectors.joining(", "));
        System.out.println("连接: " + joined);

        String decorated = names.stream().collect(Collectors.joining("-", "[", "]"));
        System.out.println("带前后缀: " + decorated);

        // ===== groupingBy =====
        Map<Character, List<String>> grouped = names.stream()
            .collect(Collectors.groupingBy(s -> s.charAt(0)));
        System.out.println("分组: " + grouped);

        // 分组 + 计数
        Map<Character, Long> counts = names.stream()
            .collect(Collectors.groupingBy(s -> s.charAt(0), Collectors.counting()));
        System.out.println("分组计数: " + counts);

        // 分组 + joining
        Map<Character, String> joinedByGroup = names.stream()
            .collect(Collectors.groupingBy(s -> s.charAt(0),
                Collectors.mapping(Function.identity(), Collectors.joining(","))));
        System.out.println("分组拼接: " + joinedByGroup);

        // ===== partitioningBy =====
        Map<Boolean, List<String>> partitioned = names.stream()
            .collect(Collectors.partitioningBy(s -> s.length() > 4));
        System.out.println("长度>4: " + partitioned.get(true));
        System.out.println("长度<=4: " + partitioned.get(false));

        // 分区 + 计数
        Map<Boolean, Long> partCount = names.stream()
            .collect(Collectors.partitioningBy(s -> s.length() > 4, Collectors.counting()));
        System.out.println("分区计数: " + partCount);

        // ===== 统计类下游 Collector =====
        IntSummaryStatistics stat = names.stream()
            .collect(Collectors.summarizingInt(String::length));
        System.out.println("名字长度统计: " + stat);

        double avgLen = names.stream().collect(Collectors.averagingInt(String::length));
        System.out.println("平均长度: " + avgLen);

        // ===== 数值流与 collect 配合 =====
        List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5);
        Map<String, List<Integer>> byParity = nums.stream()
            .collect(Collectors.groupingBy(n -> n % 2 == 0 ? "偶" : "奇"));
        System.out.println("按奇偶分组: " + byParity);
    }
}`
  },
  {
    id: "java-parallel-stream",
    group: "Lambda 与 Stream",
    icon: "🔀",
    title: "并行流",
    content: `# 并行流

并行流将流操作拆分为多个子任务，在**多核 CPU** 上并行执行，可加速大数据量处理。底层使用 Java 7 引入的 \`ForkJoinPool.commonPool()\`。

## 创建并行流

- \`collection.parallelStream()\`：从集合创建
- \`stream.parallel()\`：将顺序流转为并行流
- \`parallelStream().sequential()\`：可转回顺序流

\`\`\`java
list.parallelStream().filter(...).collect(...);
list.stream().parallel().map(...).collect(...);
\`\`\`

## 执行机制

并行流采用 **Fork-Join** 模式：
1. **Fork**：把数据源拆分为多个子任务
2. 并行执行各子任务
3. **Join**：合并子任务结果

对于 \`ArrayList\`、数组、\`IntStream.range\` 等**可分割**源，拆分高效；对于 \`LinkedList\`、\`Stream.iterate\` 等，拆分代价高，并行可能更慢。

## ForkJoinPool

默认使用公共 ForkJoinPool，并行度默认为 \`CPU 核数 - 1\`。可通过 \`-Djava.util.concurrent.ForkJoinPool.common.parallelism=N\` 调整。

所有并行流共享公共池，长任务可能阻塞其他并行流，因此**避免在并行流中执行阻塞 I/O**。

## 线程安全要求

- **源**：流操作不应修改源（避免干扰）
- **中间操作**：必须无状态、无副作用
- **可变归约**：使用 \`collect\` 而非 \`reduce\` 拼接可变容器
- **共享可变状态**：绝对禁止在 lambda 中修改共享变量

\`\`\`java
// 错误：共享 ArrayList 非线程安全
List<Integer> result = new ArrayList<>();
stream.parallel().forEach(result::add); // 数据丢失、异常
// 正确：使用 collect
stream.parallel().collect(Collectors.toList());
\`\`\`

## 顺序保证

- \`forEach\` 在并行流中**不保证顺序**，可用 \`forEachOrdered\` 保持相遇顺序
- \`collect\`、\`reduce\` 等结果与顺序无关（只要满足结合律）
- 排序、limit 等**有状态**操作在并行流中代价较高

## 何时使用并行流

适合：
- 数据量大（通常 > 10000 元素）
- 每个元素计算开销大
- 操作可独立并行（无共享状态）
- 任务是非阻塞的 CPU 密集型

不适合：
- 数据量小（拆分开销 > 收益）
- 顺序流很快的场景
- 涉及 I/O、锁、阻塞
- 需要严格顺序

## 性能测量

并行流加速比受多种因素影响，务必用 \`System.nanoTime()\` 或 JMH 实测，不要凭直觉假设。

下面通过代码演示并行流：`,
    code: `// 演示并行流
import java.util.*;
import java.util.stream.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) {
        // 创建大数据集
        List<Integer> big = IntStream.rangeClosed(1, 10_000_000).boxed().collect(Collectors.toList());

        // ===== 顺序流求和 =====
        long t1 = System.nanoTime();
        long sum1 = big.stream().mapToLong(Integer::longValue).sum();
        long t2 = System.nanoTime();
        System.out.println("顺序流求和: " + sum1 + " 用时 " + (t2 - t1) / 1_000_000 + " ms");

        // ===== 并行流求和 =====
        long t3 = System.nanoTime();
        long sum2 = big.parallelStream().mapToLong(Integer::longValue).sum();
        long t4 = System.nanoTime();
        System.out.println("并行流求和: " + sum2 + " 用时 " + (t4 - t3) / 1_000_000 + " ms");

        // ===== parallel() 转换 =====
        boolean isParallel = big.stream().parallel().isParallel();
        System.out.println("parallel() 后是否并行: " + isParallel);

        // ===== forEach 顺序不保证 =====
        System.out.print("并行 forEach 顺序: ");
        IntStream.range(1, 6).parallel().forEach(i -> System.out.print(i + " "));
        System.out.println();

        System.out.print("forEachOrdered 保持顺序: ");
        IntStream.range(1, 6).parallel().forEachOrdered(i -> System.out.print(i + " "));
        System.out.println();

        // ===== 线程安全：使用 collect 而非共享状态 =====
        List<Integer> safe = IntStream.range(0, 1000).parallel()
            .boxed().collect(Collectors.toList());
        System.out.println("collect 安全收集数量: " + safe.size());

        // ===== 查看并行度 =====
        System.out.println("公共池并行度: " + ForkJoinPool.commonPool().getParallelism());
        System.out.println("可用处理器: " + Runtime.getRuntime().availableProcessors());

        // ===== 并行流中查看执行线程 =====
        Set<String> threads = ConcurrentHashMap.newKeySet();
        IntStream.range(0, 100).parallel().forEach(i -> threads.add(Thread.currentThread().getName()));
        System.out.println("参与执行的线程数: " + threads.size());

        // ===== 不适合并行的场景：小数据 =====
        List<Integer> small = Arrays.asList(1, 2, 3, 4, 5);
        long t5 = System.nanoTime();
        small.stream().mapToInt(Integer::intValue).sum();
        long t6 = System.nanoTime();
        long t7 = System.nanoTime();
        small.parallelStream().mapToInt(Integer::intValue).sum();
        long t8 = System.nanoTime();
        System.out.println("小数据 顺序: " + (t6 - t5) / 1000 + " μs, 并行: " + (t8 - t7) / 1000 + " μs (并行可能更慢)");

        // ===== 适合并行：CPU 密集计算（素数统计）=====
        List<Integer> range = IntStream.rangeClosed(2, 1_000_000).boxed().collect(Collectors.toList());
        long t9 = System.nanoTime();
        long count = range.parallelStream().filter(Main::isPrime).count();
        long t10 = System.nanoTime();
        System.out.println("100万内素数个数: " + count + " 并行用时 " + (t10 - t9) / 1_000_000 + " ms");
    }

    // 简单素数判断
    static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; (long) i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }
}`
  },
  {
    id: "java-collectors-advanced",
    group: "Lambda 与 Stream",
    icon: "🧰",
    title: "Collectors 高级",
    content: `# Collectors 高级

除了基础 Collector，\`Collectors\` 还提供强大组合工具，实现复杂的多级分组、映射、归约等。

## 多级 groupingBy

\`groupingBy\` 的下游 Collector 可以是另一个 \`groupingBy\`，实现**多级分组**：

\`\`\`java
// 先按部门分组，再按职级分组
Map<String, Map<String, List<Employee>>> result =
    emps.stream().collect(
        Collectors.groupingBy(Employee::getDept,
            Collectors.groupingBy(Employee::getLevel)));
\`\`\`

通过组合，可表达任意层级的分类。

## mapping

对分组内的元素先**映射**，再交给下游 Collector 收集：

\`\`\`java
groupingBy(Employee::getDept,
    mapping(Employee::getName, toList()));
\`\`\`

避免在分组前对原流做 map（那样会丢失用于分组的字段）。

## reducing

在分组内进行归约。三参形式提供 identity、累加器、合并器：

\`\`\`java
groupingBy(Employee::getDept,
    reducing(0, Employee::getSalary, Integer::sum));
\`\`\`

与 \`summingInt\` 等专用 Collector 类似，但更通用。

## collectingAndThen

在收集完成后对结果做**最终转换**：

\`\`\`java
collectingAndThen(toList(), Collections::unmodifiableList);
\`\`\`

常用于将分组结果转为不可变集合，或求每组最大值等。

## filtering（Java 9+）

在分组内**过滤**元素：

\`\`\`java
groupingBy(Employee::getDept,
    filtering(e -> e.getSalary() > 5000, toList()));
\`\`\`

注意与流级 \`filter\` 的区别：流级 filter 会移除整个元素，导致该组消失；分组内 filtering 保留分组，仅过滤组内元素。

## flatMapping（Java 9+）

在分组内 flatMap，处理嵌套结构：

\`\`\`java
groupingBy(..., flatMapping(e -> e.getTags().stream(), toList()));
\`\`\`

## teeing（Java 12+）

\`teeing(c1, c2, merger)\` 让流同时通过**两个 Collector**，再合并结果。一次遍历完成多重统计：

\`\`\`java
// 一次遍历同时求平均值和最大值
Result r = stream.collect(
    Collectors.teeing(
        Collectors.averagingInt(Employee::getSalary),
        Collectors.maxBy(comparingInt(Employee::getSalary)),
        (a, optMax) -> new Result(a, optMax.get().getSalary())));
\`\`\`

避免遍历流两次，提升性能。

## 自定义 Collector

实现 \`Collector\` 接口（supplier、accumulator、combiner、finisher、characteristics）可创建自定义归约逻辑，复用性强。

下面通过代码演示高级 Collectors：`,
    code: `// 演示高级 Collectors
import java.util.*;
import java.util.stream.*;
import java.util.function.*;
import java.util.Comparator;

public class Main {
    // 统计结果容器
    static class Stat {
        double avg; int max;
        Stat(double avg, int max) { this.avg = avg; this.max = max; }
        public String toString() { return "Stat{avg=" + avg + ", max=" + max + "}"; }
    }
    static class SumCount {
        int sum; long count;
        SumCount(int sum, long count) { this.sum = sum; this.count = count; }
        public String toString() { return "SumCount{sum=" + sum + ", count=" + count + "}"; }
    }

    public static void main(String[] args) {
        List<Emp> emps = Arrays.asList(
            new Emp("Alice", "工程", "P5", 8000),
            new Emp("Bob", "工程", "P6", 12000),
            new Emp("Carol", "工程", "P5", 8500),
            new Emp("Dave", "销售", "P5", 6000),
            new Emp("Eve", "销售", "P6", 9000),
            new Emp("Frank", "销售", "P5", 5500)
        );

        // ===== 多级 groupingBy =====
        Map<String, Map<String, List<Emp>>> multi = emps.stream()
            .collect(Collectors.groupingBy(Emp::getDept,
                Collectors.groupingBy(Emp::getLevel)));
        System.out.println("多级分组:");
        multi.forEach((dept, levels) -> {
            System.out.println("  " + dept + ":");
            levels.forEach((lvl, list) ->
                System.out.println("    " + lvl + " -> "
                    + list.stream().map(Emp::getName).collect(Collectors.joining(","))));
        });

        // ===== mapping =====
        Map<String, List<String>> nameByDept = emps.stream()
            .collect(Collectors.groupingBy(Emp::getDept,
                Collectors.mapping(Emp::getName, Collectors.toList())));
        System.out.println("按部门映射名字: " + nameByDept);

        // ===== reducing =====
        Map<String, Integer> sumSalary = emps.stream()
            .collect(Collectors.groupingBy(Emp::getDept,
                Collectors.reducing(0, Emp::getSalary, Integer::sum)));
        System.out.println("部门薪资总和: " + sumSalary);

        // ===== collectingAndThen =====
        // 求每个部门薪资最高者
        Map<String, Emp> topByDept = emps.stream()
            .collect(Collectors.groupingBy(Emp::getDept,
                Collectors.collectingAndThen(
                    Collectors.maxBy(Comparator.comparingInt(Emp::getSalary)),
                    Optional::get)));
        System.out.println("部门最高薪:");
        topByDept.forEach((d, e) -> System.out.println("  " + d + " -> " + e.getName() + "(" + e.getSalary() + ")"));

        // 转不可变 List
        List<String> unmod = emps.stream()
            .map(Emp::getName)
            .collect(Collectors.collectingAndThen(Collectors.toList(), Collections::unmodifiableList));
        System.out.println("不可变列表: " + unmod);

        // ===== filtering (Java 9+) =====
        Map<String, List<Emp>> highPaid = emps.stream()
            .collect(Collectors.groupingBy(Emp::getDept,
                Collectors.filtering(e -> e.getSalary() > 7000, Collectors.toList())));
        System.out.println("高薪过滤(分组内): " + highPaid);

        // ===== groupingBy + counting =====
        Map<String, Long> countByDept = emps.stream()
            .collect(Collectors.groupingBy(Emp::getDept, Collectors.counting()));
        System.out.println("部门人数: " + countByDept);

        // ===== groupingBy + averagingInt =====
        Map<String, Double> avgByDept = emps.stream()
            .collect(Collectors.groupingBy(Emp::getDept, Collectors.averagingInt(Emp::getSalary)));
        System.out.println("部门平均薪资: " + avgByDept);

        // ===== teeing (Java 12+): 一次遍历求平均与最大 =====
        Stat stat = emps.stream().collect(Collectors.teeing(
            Collectors.averagingInt(Emp::getSalary),
            Collectors.maxBy(Comparator.comparingInt(Emp::getSalary)),
            (a, optMax) -> new Stat(a, optMax.get().getSalary())
        ));
        System.out.println("全员统计: " + stat);

        // teeing: 一次遍历求总和与计数
        SumCount sc = emps.stream().collect(Collectors.teeing(
            Collectors.summingInt(Emp::getSalary),
            Collectors.counting(),
            SumCount::new
        ));
        System.out.println("薪资统计: " + sc);
    }

    // 员工类
    static class Emp {
        String name, dept, level;
        int salary;
        Emp(String name, String dept, String level, int salary) {
            this.name = name; this.dept = dept; this.level = level; this.salary = salary;
        }
        String getName() { return name; }
        String getDept() { return dept; }
        String getLevel() { return level; }
        int getSalary() { return salary; }
    }
}`
  },
  {
    id: "java-stream-tips",
    group: "Lambda 与 Stream",
    icon: "💡",
    title: "Stream 技巧与陷阱",
    content: `# Stream 技巧与陷阱

Stream 虽强大，但有不少陷阱。理解它们能写出更可靠、更高效的代码。

## 流只能消费一次

Stream 是**一次性**的，终端操作后即被关闭，再次使用会抛 \`IllegalStateException\`：

\`\`\`java
Stream<Integer> s = Stream.of(1, 2, 3);
s.count();
s.findFirst(); // 抛异常
\`\`\`

需要多次遍历应从源重新创建流，或先 collect 为集合。

## 避免副作用

中间操作（map、filter 等）中的 lambda 必须**无状态、无副作用**。修改外部可变状态会导致：
- 并行流下数据竞争
- 顺序不确定
- 难以调试

\`\`\`java
// 错误：在 filter 中修改外部 List
// 正确：用 collect
List<Integer> evens = stream.filter(n -> n%2==0).collect(toList());
\`\`\`

## 短路操作

\`anyMatch\`、\`allMatch\`、\`noneMatch\`、\`findFirst\`、\`findAny\`、\`limit\` 是短路操作，可不遍历完所有元素。但 \`sorted\`、\`distinct\` 等有状态操作会缓冲全部元素，破坏短路收益。

## peek 用于调试

\`peek\` 主要用于**调试**流流水线，查看中间状态：

\`\`\`java
stream.peek(x -> System.out.println("after filter: " + x))
      .map(...)
      .collect(...);
\`\`\`

注意：惰性求值下，没有终端操作 peek 不执行；短路操作下 peek 也可能不执行所有元素。**生产环境避免**用 peek 处理业务逻辑。

## 性能考虑

- 简单循环用 \`for\` 可能更快（无流开销）
- 大数据量 CPU 密集可考虑并行流
- 装箱开销大时优先用原始类型流（IntStream 等）
- 避免在流中调用阻塞 I/O

## 何时不用 Stream

- 需要修改元素本身（引用副作用）——用 for-each 更清晰
- 复杂控制流（break/continue/return）——传统循环
- 需要访问索引——用 for
- 异常处理复杂——Stream lambda 不能抛受检异常
- 性能极致敏感——for 循环更可控

## 流不能抛受检异常

Stream 的函数式接口方法都不声明受检异常。若需在流中调用抛受检异常的方法，必须包装为非受检或 try-catch：

\`\`\`java
stream.map(s -> { try { return read(s); } catch (IOException e) { throw new UncheckedIOException(e); } })
\`\`\`

## 常见误区

- 误以为 \`forEach\` 保证顺序（并行流不保证）
- 误用 \`reduce\` 拼接 List（应 collect）
- 在 \`forEach\` 中修改源集合（ConcurrentModificationException）
- 把流当作集合存储（流不存储数据）

下面通过代码演示这些陷阱：`,
    code: `// 演示 Stream 的技巧与陷阱
import java.util.*;
import java.util.stream.*;
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        // ===== 陷阱1：流只能消费一次 =====
        Stream<Integer> s1 = Stream.of(1, 2, 3);
        System.out.println("第一次 count: " + s1.count());
        try {
            s1.findFirst(); // 抛异常
        } catch (IllegalStateException e) {
            System.out.println("捕获: 流已消费 - " + e.getClass().getSimpleName());
        }

        // 正确：每次重新创建流
        Supplier<Stream<Integer>> streamSupplier = () -> Stream.of(1, 2, 3);
        System.out.println("可重用: " + streamSupplier.get().count() + ", " + streamSupplier.get().findFirst().get());

        // ===== 陷阱2：避免副作用 =====
        List<Integer> src = Arrays.asList(1, 2, 3, 4, 5);
        // 正确做法：用 collect 而非修改外部集合
        List<Integer> good = src.stream().filter(n -> n % 2 == 0).collect(Collectors.toList());
        System.out.println("正确收集偶数: " + good);

        // ===== 短路操作演示 =====
        System.out.print("短路 anyMatch: ");
        boolean found = IntStream.range(1, 1000).peek(n -> System.out.print(n + " "))
            .anyMatch(n -> n > 5);
        System.out.println();
        System.out.println("结果: " + found + " (未遍历完)");

        // ===== peek 调试 =====
        System.out.println("peek 调试:");
        List<String> upper = src.stream()
            .peek(n -> System.out.println("  原始: " + n))
            .map(n -> n * 10)
            .peek(n -> System.out.println("  映射: " + n))
            .map(Object::toString)
            .collect(Collectors.toList());
        System.out.println("结果: " + upper);

        // ===== peek 无终端不执行 =====
        System.out.println("无终端操作 peek 不执行:");
        Stream.of(1, 2, 3).peek(n -> System.out.println("  不会打印 " + n));
        System.out.println("(上面没有输出说明惰性)");

        // ===== 性能：原始类型流避免装箱 =====
        long t1 = System.nanoTime();
        long sum1 = IntStream.rangeClosed(1, 1_000_000).sum();
        long t2 = System.nanoTime();
        long t3 = System.nanoTime();
        long sum2 = Stream.iterate(1, n -> n + 1).limit(1_000_000).mapToInt(Integer::intValue).sum();
        long t4 = System.nanoTime();
        System.out.println("IntStream: " + (t2 - t1) / 1_000_000 + " ms, 装箱流: " + (t4 - t3) / 1_000_000 + " ms");

        // ===== 受检异常包装 =====
        List<String> data = Arrays.asList("a", "b", "c");
        List<String> processed = data.stream()
            .map(Main::safeRead)
            .collect(Collectors.toList());
        System.out.println("包装异常后: " + processed);

        // ===== 何时不用 Stream：需要索引 =====
        List<String> indexed = new ArrayList<>();
        for (int i = 0; i < src.size(); i++) {
            indexed.add(i + ":" + src.get(i));
        }
        System.out.println("带索引(用for): " + indexed);

        // Stream 也能做但稍复杂
        List<String> indexed2 = IntStream.range(0, src.size())
            .mapToObj(i -> i + ":" + src.get(i))
            .collect(Collectors.toList());
        System.out.println("带索引(用Stream): " + indexed2);
    }

    // 模拟抛受检异常的方法，包装为非受检
    static String safeRead(String s) {
        try {
            return readThrows(s);
        } catch (java.io.IOException e) {
            throw new java.io.UncheckedIOException(e);
        }
    }

    static String readThrows(String s) throws java.io.IOException {
        return s.toUpperCase();
    }
}`
  }
];
