// =============================================================
// Python vs Java 语言对比教程 —— 第 3 批章节（函数与并发组，共 5 章）
// =============================================================

export const chapters = [
  {
    id: "pyjava-function",
    icon: "⚡",
    group: "函数与并发",
    title: "函数与方法",
    content: `## 第11章：函数与方法

### 一、函数定义：自由 vs 类的束缚

函数是组织代码的基本单位。Python 和 Java 在函数定义上有根本性的差异：Python 的函数是"自由"的，可以独立存在于模块顶层；而 Java 的方法必须依附于类。

**Python：函数是一等公民**

Python 用 \`def\` 关键字定义函数，函数可以定义在任何地方——模块顶层、类内部、甚至另一个函数内部。

\`\`\`python
# Python：模块顶层的独立函数
def greet(name):
    return f"Hello, {name}!"

# 函数内部定义函数（嵌套函数）
def make_multiplier(factor):
    def multiply(x):
        return x * factor
    return multiply

double = make_multiplier(2)
print(double(5))  # 输出 10
\`\`\`

**Java：方法必须在类内**

Java 是纯面向对象语言，所有方法都必须定义在类内部，没有"独立函数"的概念。

\`\`\`java
// Java：方法必须依附于类
public class Greeter {
    // 实例方法：需要通过对象调用
    public String greet(String name) {
        return "Hello, " + name + "!";
    }

    // 静态方法：可以通过类名直接调用
    public static int multiply(int x, int factor) {
        return x * factor;
    }
}

// 使用
Greeter g = new Greeter();
System.out.println(g.greet("World"));      // 输出 Hello, World!
System.out.println(Greeter.multiply(5, 2)); // 输出 10
\`\`\`

这种差异体现了两种语言的设计哲学：Python 是多范式语言，支持面向过程、面向对象、函数式；Java 从一开始就是纯面向对象的（虽然 Java 8 后加入了函数式特性）。

### 二、参数传递：灵活 vs 严谨

参数传递是两种语言差异最大的地方之一。Python 提供了极其灵活的参数机制，而 Java 则通过方法重载和可变参数来实现类似功能。

**Python：位置参数、关键字参数、默认参数、可变参数**

Python 支持四种参数传递方式：

\`\`\`python
# 1. 位置参数（按顺序传）
def add(a, b):
    return a + b

# 2. 关键字参数（按名称传，顺序可变）
def create_user(name, age, city):
    return f"{name}, {age}岁, {city}"

create_user(age=25, name="Alice", city="北京")  # 关键字参数，顺序可变

# 3. 默认参数（可省略）
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("Bob")              # 使用默认值 Hello
greet("Bob", "Hi")        # 覆盖默认值

# 4. 可变参数 *args 和 **kwargs
def sum_all(*args, **kwargs):
    total = sum(args)              # args 是元组
    print(kwargs)                  # kwargs 是字典
    return total

sum_all(1, 2, 3, name="Alice", age=25)
# args = (1, 2, 3)
# kwargs = {'name': 'Alice', 'age': 25}
\`\`\`

\`*args\` 收集多余的位置参数为元组，\`**kwargs\` 收集多余的关键字参数为字典。这种机制让 Python 函数能接受任意数量、任意形式的参数，极其灵活。

**Java：方法重载 + 可变参数**

Java 不支持关键字参数和默认参数，而是通过方法重载（Overload）实现类似功能：

\`\`\`java
public class Greeter {
    // 方法重载：同名方法，参数列表不同
    public String greet(String name) {
        return greet(name, "Hello");  // 调用下面的方法
    }

    public String greet(String name, String greeting) {
        return greeting + ", " + name + "!";
    }

    // 可变参数 varargs：类型后加 ...
    public int sumAll(int... numbers) {
        int total = 0;
        for (int n : numbers) {
            total += n;
        }
        return total;
    }
}

// 使用
Greeter g = new Greeter();
g.greet("Bob");                  // 调用第一个方法
g.greet("Bob", "Hi");           // 调用第二个方法
g.sumAll(1, 2, 3, 4, 5);        // 可变参数，返回 15
\`\`\`

**对比分析**：

| 特性 | Python | Java |
|------|--------|------|
| 关键字参数 | 支持 | 不支持 |
| 默认参数 | 直接定义 | 通过重载模拟 |
| 可变参数 | \`*args\` 和 \`**kwargs\` | 仅 \`Type... args\` |
| 参数解包 | \`func(*list, **dict)\` | 不支持 |
| 方法重载 | 不支持（用默认参数代替） | 支持 |

Java 的方法重载虽然能模拟默认参数，但每增加一个可选参数就要写一个重载方法，参数组合多时代码会爆炸。而 Python 的默认参数一行就能搞定。

### 三、返回值：多返回值 vs 单一返回

Python 支持返回多个值（本质是返回元组），Java 只能返回单个值，需要返回多个时要用对象或数组。

\`\`\`python
# Python：返回多个值（元组）
def min_max(numbers):
    return min(numbers), max(numbers)

low, high = min_max([3, 1, 4, 1, 5, 9])
print(low, high)  # 输出 1 9
\`\`\`

\`\`\`java
// Java 14 前：需要定义类或用数组
public class MinMax {
    public final int min;
    public final int max;
    public MinMax(int min, int max) {
        this.min = min;
        this.max = max;
    }
}

public MinMax minMax(int[] numbers) {
    int min = numbers[0], max = numbers[0];
    for (int n : numbers) {
        if (n < min) min = n;
        if (n > max) max = n;
    }
    return new MinMax(min, max);
}

// Java 14+：Record 简化
public record MinMax(int min, int max) {}

public MinMax minMax(int[] numbers) {
    int min = Integer.MAX_VALUE, max = Integer.MIN_VALUE;
    for (int n : numbers) {
        min = Math.min(min, n);
        max = Math.max(max, n);
    }
    return new MinMax(min, max);
}

// 使用
MinMax result = minMax(new int[]{3, 1, 4, 1, 5, 9});
System.out.println(result.min() + " " + result.max());
\`\`\`

Java 14 引入的 Record 类大大简化了多值返回的写法，但仍比 Python 的元组解包繁琐。

### 四、一等公民与高阶函数

Python 的函数是一等公民（first-class citizen）：可以赋值给变量、作为参数传递、作为返回值。Java 的方法不是一等公民，必须通过函数式接口才能实现类似功能。

\`\`\`python
# Python：函数是一等公民
def square(x):
    return x * x

# 函数赋值给变量
f = square
print(f(5))  # 输出 25

# 函数作为参数
def apply(func, value):
    return func(value)

print(apply(square, 5))  # 输出 25
\`\`\`

\`\`\`java
// Java：通过函数式接口实现
import java.util.function.Function;

public class Main {
    // 函数式接口作为参数
    public static int apply(Function<Integer, Integer> func, int value) {
        return func.apply(value);
    }

    public static void main(String[] args) {
        // 用 lambda 创建函数对象
        Function<Integer, Integer> square = x -> x * x;
        System.out.println(square.apply(5));        // 输出 25
        System.out.println(apply(square, 5));       // 输出 25
    }
}
\`\`\`

### 五、闭包

闭包是指函数捕获了其外部作用域的变量。两种语言都支持闭包，但行为不同。

\`\`\`python
# Python 闭包：捕获的是变量引用
def make_counter():
    count = 0
    def increment():
        nonlocal count   # 声明使用外部变量
        count += 1
        return count
    return increment

counter = make_counter()
print(counter())  # 1
print(counter())  # 2
\`\`\`

\`\`\`java
// Java 闭包：捕获的变量必须 effectively final
import java.util.function.Supplier;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static Supplier<Integer> makeCounter() {
        AtomicInteger count = new AtomicInteger(0);
        // Java lambda 只能捕获 effectively final 的变量
        // 要修改需用 Atomic 类型或数组
        return () -> count.incrementAndGet();
    }

    public static void main(String[] args) {
        Supplier<Integer> counter = makeCounter();
        System.out.println(counter.get());  // 1
        System.out.println(counter.get());  // 2
    }
}
\`\`\`

**关键差异**：Python 闭包可以修改外部变量（用 \`nonlocal\` 声明）；Java 闭包捕获的变量必须是 effectively final（不可修改），要修改需借助 Atomic 类型或数组容器。

### 六、装饰器 vs 注解 + AOP

装饰器是 Python 特有的强大功能，用于在不修改原函数的前提下增强其行为。Java 通过注解（Annotation）+ AOP（面向切面编程）实现类似功能。

\`\`\`python
# Python 装饰器：用 @ 语法
import time
from functools import wraps

def timing(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} 耗时 {time.time() - start:.4f} 秒")
        return result
    return wrapper

@timing
def slow_function():
    time.sleep(1)
    print("完成")

slow_function()
# 输出：
# 完成
# slow_function 耗时 1.0012 秒
\`\`\`

\`\`\`java
// Java：注解 + AOP（以 Spring 为例）
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class TimingAspect {
    @Around("@annotation(Timing)")
    public Object timing(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = pjp.proceed();
        System.out.println(pjp.getSignature().getName()
            + " 耗时 " + (System.currentTimeMillis() - start) + " 毫秒");
        return result;
    }
}

// 自定义注解
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Timing {}

// 使用
public class Service {
    @Timing
    public void slowMethod() throws InterruptedException {
        Thread.sleep(1000);
        System.out.println("完成");
    }
}
\`\`\`

**对比分析**：

- Python 装饰器是语言原生特性，语法简洁，几行代码就能实现；Java 的 AOP 需要依赖框架（如 Spring、AspectJ），配置复杂。
- Python 装饰器在运行时直接生效；Java 注解需要框架扫描和处理。
- Python 装饰器可以叠加多个，执行顺序清晰；Java 注解的 AOP 行为依赖框架实现。

### 七、小结

| 特性 | Python | Java |
|------|--------|------|
| 函数定义位置 | 任意位置 | 必须在类内 |
| 关键字参数 | 支持 | 不支持 |
| 默认参数 | 直接定义 | 通过重载 |
| 多返回值 | 元组 | 对象/Record |
| 一等公民 | 原生 | 函数式接口 |
| 闭包修改外部变量 | nonlocal | effectively final |
| 装饰器 | 原生 @decorator | 注解 + AOP |

Python 的函数设计追求灵活和简洁，适合快速开发和数据处理；Java 的方法设计追求严谨和类型安全，适合大型工程和团队协作。选择哪种语言，取决于项目需求和团队偏好。`,
  },
  {
    id: "pyjava-lambda",
    icon: "λ",
    group: "函数与并发",
    title: "Lambda 与函数式编程",
    content: `## 第12章：Lambda 与函数式编程

### 一、Lambda 表达式：单表达式 vs SAM 类型

Lambda 表达式是函数式编程的基础。Python 和 Java 都支持 lambda，但形式和限制不同。

**Python：单表达式 lambda**

Python 的 lambda 只能包含一个表达式，不能有语句（如 if/for/while 语句块）：

\`\`\`python
# Python lambda：单表达式
square = lambda x: x * x
print(square(5))  # 25

# 多参数
add = lambda x, y: x + y
print(add(3, 4))  # 7

# 条件表达式（三元运算符）
abs_val = lambda x: x if x >= 0 else -x
print(abs_val(-5))  # 5

# 不能有语句
# invalid = lambda x: if x > 0: return x  # 语法错误！
\`\`\`

**Java：基于 SAM 类型的 lambda**

Java 的 lambda 必须绑定一个函数式接口（SAM：Single Abstract Method），类型由目标上下文决定：

\`\`\`java
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        // lambda 绑定到函数式接口
        Function<Integer, Integer> square = x -> x * x;
        System.out.println(square.apply(5));  // 25

        BiFunction<Integer, Integer, Integer> add = (x, y) -> x + y;
        System.out.println(add.apply(3, 4));  // 7

        // 可以包含语句块
        Function<Integer, Integer> absVal = x -> {
            if (x >= 0) return x;
            else return -x;
        };
        System.out.println(absVal.apply(-5));  // 5
    }
}
\`\`\`

**关键差异**：

- Python lambda 只能是单表达式；Java lambda 可以包含多语句的代码块。
- Python lambda 是动态类型，无需声明类型；Java lambda 必须绑定函数式接口，类型由上下文推断。
- Python lambda 可以任意使用；Java lambda 的目标类型必须是函数式接口。

### 二、函数式接口

Java 的函数式编程建立在函数式接口之上。\`@FunctionalInterface\` 注解标记一个接口只有一个抽象方法。

\`\`\`java
// Java 核心函数式接口
import java.util.function.*;

public class FunctionalInterfaces {
    public static void main(String[] args) {
        // Runnable：无参无返回
        Runnable r = () -> System.out.println("Hello");
        r.run();

        // Supplier<T>：无参返回 T
        Supplier<String> supplier = () -> "Hello";
        System.out.println(supplier.get());

        // Consumer<T>：参 T 无返回
        Consumer<String> consumer = s -> System.out.println(s);
        consumer.accept("Hello");

        // Function<T, R>：参 T 返回 R
        Function<String, Integer> strToInt = s -> s.length();
        System.out.println(strToInt.apply("Hello"));  // 5

        // Predicate<T>：参 T 返回 boolean
        Predicate<String> isEmpty = s -> s.isEmpty();
        System.out.println(isEmpty.test(""));  // true

        // BiFunction<T, U, R>：两参返回 R
        BiFunction<Integer, Integer, Integer> max = Math::max;
        System.out.println(max.apply(3, 5));  // 5
    }
}
\`\`\`

**Python 等价物**：Python 不需要函数式接口，函数本身就是一等公民：

\`\`\`python
# Python 等价：函数直接传递
def run(func):
    func()

def supply():
    return "Hello"

def consume(s):
    print(s)

def transform(s):
    return len(s)

def predicate(s):
    return s == ""

run(lambda: print("Hello"))     # Runnable
print(supply())                  # Supplier
consume("Hello")                 # Consumer
print(transform("Hello"))        # Function
print(predicate(""))             # Predicate
\`\`\`

### 三、高阶函数对比

**Python 内建高阶函数**

\`\`\`python
numbers = [1, 2, 3, 4, 5, 6]

# map：对每个元素应用函数
squares = list(map(lambda x: x * x, numbers))
print(squares)  # [1, 4, 9, 16, 25, 36]

# filter：过滤
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)  # [2, 4, 6]

# sorted：自定义排序
words = ["banana", "apple", "cherry"]
sorted_words = sorted(words, key=lambda w: len(w))
print(sorted_words)  # ['apple', 'banana', 'cherry']

# reduce：累积
from functools import reduce
product = reduce(lambda x, y: x * y, numbers)
print(product)  # 720

# 更 Pythonic 的写法：推导式
squares = [x * x for x in numbers]
evens = [x for x in numbers if x % 2 == 0]
\`\`\`

**Java Stream API**

\`\`\`java
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6);

        // map：对每个元素应用函数
        List<Integer> squares = numbers.stream()
            .map(x -> x * x)
            .collect(Collectors.toList());
        System.out.println(squares);  // [1, 4, 9, 16, 25, 36]

        // filter：过滤
        List<Integer> evens = numbers.stream()
            .filter(x -> x % 2 == 0)
            .collect(Collectors.toList());
        System.out.println(evens);  // [2, 4, 6]

        // sorted：自定义排序
        List<String> words = List.of("banana", "apple", "cherry");
        List<String> sortedWords = words.stream()
            .sorted(Comparator.comparing(String::length))
            .collect(Collectors.toList());
        System.out.println(sortedWords);  // [apple, banana, cherry]

        // reduce：累积
        int product = numbers.stream()
            .reduce(1, (x, y) -> x * y);
        System.out.println(product);  // 720
    }
}
\`\`\`

### 四、Stream API vs 生成器表达式

Python 的生成器表达式是惰性求值的，与 Java Stream 类似：

\`\`\`python
# Python 生成器表达式（惰性）
import sys

# 列表推导式：立即计算，占用内存
squares_list = [x * x for x in range(1000000)]
print(sys.getsizeof(squares_list))  # 约 8 MB

# 生成器表达式：惰性求值，几乎不占内存
squares_gen = (x * x for x in range(1000000))
print(sys.getsizeof(squares_gen))   # 约 128 字节

# 流式处理
result = sum(x * x for x in range(1000000) if x % 2 == 0)
print(result)
\`\`\`

\`\`\`java
// Java Stream（惰性）
import java.util.stream.*;

List<Integer> squares = IntStream.range(0, 1_000_000)
    .filter(x -> x % 2 == 0)
    .map(x -> x * x)
    .boxed()
    .collect(Collectors.toList());

// 流式处理，不占中间内存
int sum = IntStream.range(0, 1_000_000)
    .filter(x -> x % 2 == 0)
    .map(x -> x * x)
    .sum();
\`\`\`

### 五、闭包变量捕获

**Python：闭包引用变量**

\`\`\`python
# Python 闭包：捕获变量引用
funcs = []
for i in range(3):
    funcs.append(lambda: i)  # 捕获的是 i 的引用，不是值

print([f() for f in funcs])  # [2, 2, 2]！都是最后一个 i

# 正确做法：用默认参数固定值
funcs = [lambda i=i: i for i in range(3)]
print([f() for f in funcs])  # [0, 1, 2]
\`\`\`

**Java：effectively final**

\`\`\`java
// Java 闭包：必须 effectively final
import java.util.*;
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        List<Supplier<Integer>> funcs = new ArrayList<>();

        // 错误：i 不是 effectively final
        // for (int i = 0; i < 3; i++) {
        //     funcs.add(() -> i);  // 编译错误！
        // }

        // 正确：用 final 变量
        for (int i = 0; i < 3; i++) {
            final int fi = i;
            funcs.add(() -> fi);
        }

        funcs.forEach(f -> System.out.println(f.get()));  // 0, 1, 2
    }
}
\`\`\`

### 六、functools 工具库

Python 的 functools 模块提供了函数式工具：

\`\`\`python
from functools import partial, lru_cache, wraps

# 1. partial：偏函数，固定部分参数
def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)
print(square(5))  # 25

# 2. lru_cache：缓存函数结果
@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(100))  # 快速计算，因为有缓存

# 3. wraps：保留原函数信息（装饰器中用）
def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
\`\`\`

\`\`\`java
// Java 等价实现
import java.util.*;
import java.util.function.*;
import java.util.concurrent.ConcurrentHashMap;

public class Main {
    // 1. 偏函数：用 lambda 固定参数
    Function<Integer, Integer> square = base -> power(base, 2);

    static int power(int base, int exponent) {
        return (int) Math.pow(base, exponent);
    }

    // 2. 缓存：手动实现
    static Map<Integer, Integer> fibCache = new ConcurrentHashMap<>();
    static int fibonacci(int n) {
        if (n < 2) return n;
        return fibCache.computeIfAbsent(n,
            k -> fibonacci(k - 1) + fibonacci(k - 2));
    }
}
\`\`\`

### 七、小结

| 特性 | Python | Java |
|------|--------|------|
| lambda 语法 | \`lambda x: expr\` | \`x -> expr\` |
| lambda 限制 | 单表达式 | 可包含语句块 |
| 类型系统 | 动态 | 静态（函数式接口） |
| 惰性序列 | 生成器表达式 | Stream |
| 缓存 | \`@lru_cache\` | 手动实现 |
| 闭包变量 | 引用（可变） | effectively final |

Python 的函数式编程更轻量灵活，适合数据处理和脚本任务；Java 的函数式编程建立在严格的类型系统上，适合大型工程的并发和流处理。两者各有优势，理解差异有助于在合适的场景选择合适的工具。`,
  },
  {
    id: "pyjava-concurrency",
    icon: "🧵",
    group: "函数与并发",
    title: "并发模型：GIL vs JVM",
    content: `## 第13章：并发模型：GIL vs JVM

### 一、Python GIL：全局解释器锁

**GIL 是什么？**

GIL（Global Interpreter Lock，全局解释器锁）是 CPython 解释器的一个实现细节。它保证同一时刻只有一个线程执行 Python 字节码。

\`\`\`python
# Python：GIL 限制多线程
import threading
import time

def cpu_heavy():
    total = 0
    for i in range(10_000_000):
        total += i
    return total

# 串行
start = time.time()
cpu_heavy()
cpu_heavy()
print(f"串行: {time.time() - start:.2f} 秒")

# 多线程（不会更快，因为 GIL）
start = time.time()
t1 = threading.Thread(target=cpu_heavy)
t2 = threading.Thread(target=cpu_heavy)
t1.start(); t2.start()
t1.join(); t2.join()
print(f"多线程: {time.time() - start:.2f} 秒")
# 串行和多线程耗时几乎相同！
\`\`\`

**为什么有 GIL？**

CPython 的内存管理使用引用计数。每个对象都有一个引用计数器，记录有多少变量指向它。当计数为 0 时，对象被回收。如果多个线程同时修改引用计数，会导致计数错误，可能提前回收或泄漏内存。

GIL 的存在让多线程无法利用多核 CPU 处理 CPU 密集型任务，但对 IO 密集型任务影响不大（因为 IO 操作会释放 GIL）。

### 二、Java JVM：真正的多线程

Java JVM 没有类似 GIL 的限制，线程可以真正并行执行：

\`\`\`java
// Java：多线程真正并行
public class Main {
    static long cpuHeavy() {
        long total = 0;
        for (int i = 0; i < 10_000_000; i++) {
            total += i;
        }
        return total;
    }

    public static void main(String[] args) throws Exception {
        // 串行
        long start = System.currentTimeMillis();
        cpuHeavy();
        cpuHeavy();
        System.out.println("串行: " + (System.currentTimeMillis() - start) + " ms");

        // 多线程（真正并行，约一半时间）
        start = System.currentTimeMillis();
        Thread t1 = new Thread(() -> cpuHeavy());
        Thread t2 = new Thread(() -> cpuHeavy());
        t1.start(); t2.start();
        t1.join(); t2.join();
        System.out.println("多线程: " + (System.currentTimeMillis() - start) + " ms");
    }
}
\`\`\`

### 三、Python threading 模块

\`\`\`python
import threading
import time

def worker(name, delay):
    for i in range(3):
        time.sleep(delay)
        print(f"{name}: {i}")

# 创建线程
t1 = threading.Thread(target=worker, args=("A", 0.5))
t2 = threading.Thread(target=worker, args=("B", 0.3))

t1.start()  # 启动线程
t2.start()

t1.join()   # 等待线程结束
t2.join()
print("所有线程完成")
\`\`\`

### 四、Java Thread / Runnable / Callable / Future

\`\`\`java
import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // 方式1：继承 Thread
        Thread t1 = new Thread() {
            public void run() {
                System.out.println("Thread 子类");
            }
        };

        // 方式2：实现 Runnable
        Thread t2 = new Thread(() -> System.out.println("Runnable"));

        // 方式3：Callable + Future（有返回值）
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<Integer> future = executor.submit(() -> {
            Thread.sleep(1000);
            return 42;
        });

        t1.start(); t2.start();
        Integer result = future.get();  // 阻塞获取结果
        System.out.println("Callable 返回: " + result);
        executor.shutdown();
    }
}
\`\`\`

### 五、Python multiprocessing：多进程绕开 GIL

\`\`\`python
from multiprocessing import Process, Pool
import time

def cpu_heavy(n):
    total = 0
    for i in range(n):
        total += i
    return total

if __name__ == "__main__":
    # 多进程：真正并行
    start = time.time()
    processes = []
    for _ in range(4):
        p = Process(target=cpu_heavy, args=(10_000_000,))
        processes.append(p)
        p.start()

    for p in processes:
        p.join()
    print(f"多进程: {time.time() - start:.2f} 秒")

    # 进程池
    with Pool(4) as pool:
        results = pool.map(cpu_heavy, [5_000_000] * 4)
    print(results)
\`\`\`

### 六、Java ExecutorService 线程池

\`\`\`java
import java.util.concurrent.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // 固定大小线程池
        ExecutorService pool = Executors.newFixedThreadPool(4);

        // 提交任务
        List<Future<Long>> futures = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            futures.add(pool.submit(() -> {
                long total = 0;
                for (int j = 0; j < 10_000_000; j++) total += j;
                return total;
            }));
        }

        // 获取结果
        for (Future<Long> f : futures) {
            System.out.println(f.get());
        }

        pool.shutdown();  // 关闭线程池
    }
}
\`\`\`

### 七、并发安全：锁

**Python Lock**

\`\`\`python
import threading

counter = 0
lock = threading.Lock()

def increment():
    global counter
    for _ in range(100000):
        with lock:  # 自动获取和释放锁
            counter += 1

threads = [threading.Thread(target=increment) for _ in range(10)]
for t in threads: t.start()
for t in threads: t.join()
print(counter)  # 1000000（加锁后正确）
\`\`\`

**Java synchronized / Lock**

\`\`\`java
import java.util.concurrent.locks.*;

public class Counter {
    private int count = 0;
    private final Lock lock = new ReentrantLock();

    // 方式1：synchronized 关键字
    public synchronized void incrementSync() {
        count++;
    }

    // 方式2：ReentrantLock
    public void incrementLock() {
        lock.lock();
        try {
            count++;
        } finally {
            lock.unlock();  // 必须在 finally 释放
        }
    }

    public int getCount() { return count; }
}
\`\`\`

### 八、Java 并发包 java.util.concurrent

\`\`\`java
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // 1. CountDownLatch：等待多个任务完成
        CountDownLatch latch = new CountDownLatch(3);
        for (int i = 0; i < 3; i++) {
            new Thread(() -> {
                System.out.println("任务完成");
                latch.countDown();
            }).start();
        }
        latch.await();  // 等待 3 个任务都完成
        System.out.println("所有任务完成");

        // 2. CyclicBarrier：线程互相等待
        CyclicBarrier barrier = new CyclicBarrier(3,
            () -> System.out.println("所有线程到达屏障"));
        for (int i = 0; i < 3; i++) {
            new Thread(() -> {
                try {
                    barrier.await();
                } catch (Exception e) {}
            }).start();
        }

        // 3. ConcurrentHashMap：线程安全的 Map
        ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
        map.put("a", 1);
        map.computeIfAbsent("b", k -> 2);

        // 4. Atomic 原子类
        AtomicInteger atomic = new AtomicInteger(0);
        atomic.incrementAndGet();
        atomic.compareAndSet(1, 10);
    }
}
\`\`\`

### 九、Java 内存模型（JMM）

Java 有严格的内存模型（JMM），定义了 happens-before 关系，保证线程间的可见性：

\`\`\`java
// happens-before 示例
public class VolatileExample {
    private volatile boolean flag = false;  // volatile 保证可见性
    private int data = 0;

    public void writer() {
        data = 42;           // 1. 写 data
        flag = true;         // 2. 写 flag（volatile）
    }

    public void reader() {
        if (flag) {           // 3. 读 flag
            int r = data;     // 4. 读 data，一定能看到 42
            // 因为 volatile 写 happens-before volatile 读
        }
    }
}
\`\`\`

### 十、小结

| 特性 | Python | Java |
|------|--------|------|
| GIL | 有（限制多线程） | 无 |
| 多线程并行 | CPU 密集型不行 | 真正并行 |
| 多进程 | multiprocessing | 需借助第三方 |
| 线程池 | ThreadPoolExecutor | ExecutorService |
| 并发安全 | Lock | synchronized/Lock/Atomic |
| 内存模型 | 无（GIL 保证） | JMM + happens-before |

**选型建议**：
- Python：IO 密集型用 threading/asyncio，CPU 密集型用 multiprocessing
- Java：CPU 密集型和 IO 密集型都可以用多线程，注意并发安全

理解 GIL 和 JVM 的差异，有助于在两种语言中正确选择并发模型，避免性能陷阱。`,
  },
  {
    id: "pyjava-async",
    icon: "⏱️",
    group: "函数与并发",
    title: "异步 IO",
    content: `## 第14章：异步 IO

### 一、为什么需要异步 IO

异步 IO 是处理高并发 IO 的一种方式。核心思想：在等待 IO 时不阻塞线程，让线程去处理其他任务，IO 完成后再回来继续。

**适用场景**：网络请求、数据库查询、文件读写等 IO 密集型任务。

### 二、Python asyncio

Python 的 asyncio 是基于协程（coroutine）的异步框架。

\`\`\`python
import asyncio
import time

# 定义协程
async def fetch_data(name, delay):
    print(f"开始获取 {name}")
    await asyncio.sleep(delay)  # 模拟 IO 等待
    print(f"完成获取 {name}")
    return f"{name} 的数据"

# 主协程
async def main():
    start = time.time()

    # 并发执行多个协程
    results = await asyncio.gather(
        fetch_data("A", 2),
        fetch_data("B", 1),
        fetch_data("C", 3)
    )

    print(f"结果: {results}")
    print(f"总耗时: {time.time() - start:.2f} 秒")  # 约 3 秒（取最长）

# 运行事件循环
asyncio.run(main())
\`\`\`

**核心概念**：

- \`async def\`：定义协程函数
- \`await\`：暂停当前协程，等待另一个协程完成
- \`asyncio.gather\`：并发执行多个协程
- \`asyncio.run\`：运行事件循环

### 三、Java 异步演进

**1. Future（Java 5）**

\`\`\`java
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        ExecutorService executor = Executors.newSingleThreadExecutor();

        // 提交任务，返回 Future
        Future<String> future = executor.submit(() -> {
            Thread.sleep(2000);
            return "结果";
        });

        // 阻塞获取结果
        String result = future.get();  // 阻塞 2 秒
        System.out.println(result);

        executor.shutdown();
    }
}
\`\`\`

Future 的局限：只能阻塞获取结果，不能链式调用、组合多个 Future。

**2. CompletableFuture（Java 8）**

\`\`\`java
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // 异步执行
        CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
            try { Thread.sleep(2000); } catch (Exception e) {}
            return "结果";
        });

        // 链式调用
        future.thenApply(s -> s + " 处理后")
              .thenAccept(System.out::println);  // 输出 "结果 处理后"

        // 组合多个 Future
        CompletableFuture<String> f1 = CompletableFuture.supplyAsync(() -> "A");
        CompletableFuture<String> f2 = CompletableFuture.supplyAsync(() -> "B");

        CompletableFuture.allOf(f1, f2).thenRun(() -> {
            System.out.println("所有任务完成");
        });

        Thread.sleep(3000);  // 等待异步任务完成
    }
}
\`\`\`

**3. 虚拟线程（Java 21）**

Java 21 引入虚拟线程（Project Loom），是异步编程的革命性进展：

\`\`\`java
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // 创建虚拟线程（轻量级，可以创建百万个）
        Thread vThread = Thread.ofVirtual().start(() -> {
            System.out.println("虚拟线程运行");
            try { Thread.sleep(1000); } catch (Exception e) {}
            System.out.println("虚拟线程完成");
        });

        vThread.join();

        // 使用虚拟线程执行器
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            // 并发执行 10000 个任务
            for (int i = 0; i < 10000; i++) {
                final int id = i;
                executor.submit(() -> {
                    Thread.sleep(1000);
                    return id;
                });
            }
        }
    }
}
\`\`\`

**虚拟线程的优势**：
- 轻量级：一个虚拟线程只占几 KB，可以创建百万个
- 同步写法：不需要 async/await，用同步代码实现异步效果
- 兼容现有 API：基于 Thread，所有现有工具都能用

### 四、Python 异步库

\`\`\`python
import asyncio
import aiohttp  # 异步 HTTP 客户端

async def fetch_url(session, url):
    async with session.get(url) as response:
        return await response.text()

async def main():
    urls = [
        "https://httpbin.org/delay/1",
        "https://httpbin.org/delay/2",
        "https://httpbin.org/delay/3"
    ]

    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        print(f"获取了 {len(results)} 个响应")

asyncio.run(main())
\`\`\`

### 五、Java 响应式编程

\`\`\`java
import reactor.core.publisher.*;
import reactor.core.scheduler.Schedulers;
import java.time.Duration;

public class Main {
    public static void main(String[] args) throws Exception {
        // Mono：0 或 1 个元素
        Mono<String> mono = Mono.fromSupplier(() -> {
            try { Thread.sleep(1000); } catch (Exception e) {}
            return "结果";
        });

        // Flux：多个元素
        Flux<Integer> flux = Flux.range(1, 5)
            .delayElements(Duration.ofMillis(500));

        // 订阅
        mono.subscribe(System.out::println);
        flux.subscribe(i -> System.out.println("收到: " + i));

        Thread.sleep(5000);
    }
}
\`\`\`

### 六、async/await 对比

**Python async/await**

\`\`\`python
async def fetch_all():
    results = []
    for url in urls:
        result = await fetch(url)  # 串行等待
        results.append(result)
    return results

# 并发执行
async def fetch_all_concurrent():
    return await asyncio.gather(*[fetch(url) for url in urls])
\`\`\`

**Java 等价（CompletableFuture）**

\`\`\`java
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.*;

// 串行
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> fetch("url1"))
    .thenCompose(r1 -> CompletableFuture.supplyAsync(() -> fetch("url2")))
    .thenCompose(r2 -> CompletableFuture.supplyAsync(() -> fetch("url3")));

// 并发
List<CompletableFuture<String>> futures = urls.stream()
    .map(url -> CompletableFuture.supplyAsync(() -> fetch(url)))
    .collect(Collectors.toList());

CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
    .thenApply(v -> futures.stream()
        .map(CompletableFuture::join)
        .collect(Collectors.toList()));
\`\`\`

### 七、Python 的"色"函数问题

Python 的 async/await 有一个著名的问题：函数被"染色"。一旦函数是 async，调用它的函数也必须 async，会污染整个调用栈。

\`\`\`python
# 同步函数
def sync_func():
    return "sync"

# 异步函数
async def async_func():
    return "async"

# 问题：同步函数不能直接调用异步函数
def caller():
    # result = async_func()  # 错误！返回 coroutine 对象
    result = asyncio.run(async_func())  # 但不能在已有事件循环中调用
    return result

# 异步函数可以调用同步函数
async def async_caller():
    result = sync_func()  # 可以
    # 但不能调用阻塞的同步函数，会阻塞事件循环
    # 需要用 run_in_executor
    result = await asyncio.to_thread(blocking_func)
    return result
\`\`\`

Java 的虚拟线程解决了这个问题：用同步代码写异步逻辑，无需 async/await，没有"染色"问题。

### 八、协程 vs 线程

| 特性 | 协程（Python asyncio） | 线程（Java） |
|------|------------------------|--------------|
| 调度 | 用户态协作式 | 内核态抢占式 |
| 切换成本 | 极低（纳秒级） | 较高（微秒级） |
| 数量上限 | 百万级 | 千级 |
| 共享内存 | 是（但 GIL 限制） | 是（需同步） |
| 编程模型 | async/await | 同步代码 |

### 九、事件循环

事件循环是异步编程的核心。Python 的 asyncio 提供了事件循环：

\`\`\`python
import asyncio

async def task1():
    print("task1 开始")
    await asyncio.sleep(1)
    print("task1 完成")

async def task2():
    print("task2 开始")
    await asyncio.sleep(1)
    print("task2 完成")

# 事件循环自动调度
asyncio.run(asyncio.gather(task1(), task2()))
\`\`\`

Java 的事件循环隐藏在 CompletableFuture 和虚拟线程背后，开发者无需直接管理。

### 十、小结

| 特性 | Python | Java |
|------|--------|------|
| 异步模型 | asyncio（协程） | CompletableFuture/响应式/虚拟线程 |
| 语法 | async/await | 链式调用/响应式 |
| 事件循环 | asyncio.run | 内置于虚拟线程 |
| "染色"问题 | 有 | 虚拟线程无 |
| 适用场景 | IO 密集型高并发 | IO 密集型高并发 |

Python 的 asyncio 适合编写高并发的网络服务，但要注意"染色"问题；Java 的虚拟线程是未来方向，能以同步代码实现异步效果，是并发编程的革命性改进。`,
  },
  {
    id: "pyjava-collections",
    icon: "📚",
    group: "函数与并发",
    title: "集合框架",
    content: `## 第15章：集合框架

### 一、Python 内建容器

Python 提供了强大的内建容器类型，无需导入：

\`\`\`python
# 1. list：有序可变
fruits = ["apple", "banana", "cherry"]
fruits.append("date")
fruits[0] = "avocado"
print(fruits)  # ['avocado', 'banana', 'cherry', 'date']

# 2. tuple：有序不可变
point = (3, 4)
x, y = point  # 解包
print(x, y)  # 3 4

# 3. dict：键值对（Python 3.7+ 有序）
person = {"name": "Alice", "age": 25}
person["city"] = "北京"
print(person)  # {'name': 'Alice', 'age': 25, 'city': '北京'}

# 4. set：无序不重复
numbers = {1, 2, 3, 3}  # 自动去重
print(numbers)  # {1, 2, 3}

# 5. frozenset：不可变 set
fs = frozenset([1, 2, 3])
\`\`\`

### 二、Java 集合框架

Java 的集合框架更复杂，针对不同场景有不同实现：

\`\`\`java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // List：有序可变
        List<String> fruits = new ArrayList<>();
        fruits.add("apple");
        fruits.add("banana");
        fruits.set(0, "avocado");
        System.out.println(fruits);  // [avocado, banana]

        // LinkedList：适合频繁插入删除
        List<String> linked = new LinkedList<>();

        // Set：不重复
        Set<Integer> numbers = new HashSet<>();
        numbers.add(1); numbers.add(2); numbers.add(3); numbers.add(3);
        System.out.println(numbers);  // [1, 2, 3]（无序）

        // TreeSet：有序
        Set<Integer> sorted = new TreeSet<>(numbers);

        // Map：键值对
        Map<String, Object> person = new HashMap<>();
        person.put("name", "Alice");
        person.put("age", 25);
        System.out.println(person);

        // TreeMap：按 key 排序
        Map<String, Integer> tree = new TreeMap<>();

        // Queue / Deque
        Deque<String> deque = new ArrayDeque<>();
        deque.addFirst("A");
        deque.addLast("B");

        // PriorityQueue：优先队列
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        pq.add(3); pq.add(1); pq.add(2);
        System.out.println(pq.poll());  // 1（最小值先出）
    }
}
\`\`\`

### 三、可变性对比

**Python：list 可变，tuple 不可变**

\`\`\`python
# tuple 不可变
t = (1, 2, 3)
# t[0] = 10  # TypeError!

# list 可变
lst = [1, 2, 3]
lst[0] = 10  # OK

# frozenset：不可变 set
fs = frozenset([1, 2, 3])
# fs.add(4)  # AttributeError!
\`\`\`

**Java：用 Collections.unmodifiableXxx 实现不可变**

\`\`\`java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> mutable = new ArrayList<>();
        mutable.add("a");

        // 不可变视图
        List<String> immutable = Collections.unmodifiableList(mutable);
        // immutable.add("b");  // UnsupportedOperationException!

        // Java 9+：List.of 创建不可变集合
        List<String> of = List.of("a", "b", "c");
        Map<String, Integer> map = Map.of("a", 1, "b", 2);

        // Java 10+：var + List.copyOf
        var copy = List.copyOf(mutable);
    }
}
\`\`\`

### 四、迭代器

**Python iter / next**

\`\`\`python
# Python 迭代器协议
class Counter:
    def __init__(self, low, high):
        self.current = low
        self.high = high

    def __iter__(self):
        return self

    def __next__(self):
        if self.current < self.high:
            num = self.current
            self.current += 1
            return num
        raise StopIteration

# 使用
for num in Counter(1, 5):
    print(num)  # 1 2 3 4

# 手动迭代
it = iter([1, 2, 3])
print(next(it))  # 1
print(next(it))  # 2
\`\`\`

**Java Iterator / Iterable**

\`\`\`java
import java.util.*;

public class Counter implements Iterable<Integer> {
    private final int low, high;

    public Counter(int low, int high) {
        this.low = low;
        this.high = high;
    }

    @Override
    public Iterator<Integer> iterator() {
        return new Iterator<>() {
            private int current = low;

            @Override
            public boolean hasNext() {
                return current < high;
            }

            @Override
            public Integer next() {
                return current++;
            }
        };
    }

    public static void main(String[] args) {
        for (int num : new Counter(1, 5)) {
            System.out.println(num);  // 1 2 3 4
        }
    }
}
\`\`\`

### 五、推导式 vs Stream collect

Python 的推导式是简洁强大的特性：

\`\`\`python
numbers = [1, 2, 3, 4, 5, 6]

# 列表推导式
squares = [x * x for x in numbers]
print(squares)  # [1, 4, 9, 16, 25, 36]

# 带条件的列表推导式
evens = [x for x in numbers if x % 2 == 0]
print(evens)  # [2, 4, 6]

# 字典推导式
square_dict = {x: x * x for x in numbers}
print(square_dict)  # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25, 6: 36}

# 集合推导式
even_set = {x for x in numbers if x % 2 == 0}
print(even_set)  # {2, 4, 6}

# 嵌套推导式
matrix = [[i * j for j in range(3)] for i in range(3)]
print(matrix)  # [[0, 0, 0], [0, 1, 2], [0, 2, 4]]
\`\`\`

Java Stream 等价：

\`\`\`java
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6);

        // 列表推导式等价
        List<Integer> squares = numbers.stream()
            .map(x -> x * x)
            .collect(Collectors.toList());

        // 带条件
        List<Integer> evens = numbers.stream()
            .filter(x -> x % 2 == 0)
            .collect(Collectors.toList());

        // 字典推导式等价
        Map<Integer, Integer> squareDict = numbers.stream()
            .collect(Collectors.toMap(x -> x, x -> x * x));

        // 集合推导式等价
        Set<Integer> evenSet = numbers.stream()
            .filter(x -> x % 2 == 0)
            .collect(Collectors.toSet());
    }
}
\`\`\`

### 六、dict vs HashMap 实现对比

**Python dict**：基于哈希表，Python 3.7+ 保证插入顺序。

\`\`\`python
# Python dict 是真正的哈希表
d = {}
d["a"] = 1
d["b"] = 2
d["c"] = 3

# 遍历（保持插入顺序）
for key, value in d.items():
    print(f"{key}: {value}")

# 字典推导式
squared = {k: v * v for k, v in d.items()}

# defaultdict：默认值字典
from collections import defaultdict
word_count = defaultdict(int)
for word in ["a", "b", "a"]:
    word_count[word] += 1
\`\`\`

**Java HashMap**：基于哈希表 + 链表/红黑树（Java 8+，链表长度超过 8 转红黑树）。

\`\`\`java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> map = new HashMap<>();
        map.put("a", 1);
        map.put("b", 2);
        map.put("c", 3);

        // 遍历（不保证顺序）
        for (Map.Entry<String, Integer> entry : map.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }

        // 有序：LinkedHashMap（按插入序）或 TreeMap（按 key 排序）
        Map<String, Integer> linked = new LinkedHashMap<>();
        Map<String, Integer> tree = new TreeMap<>();

        // computeIfAbsent：类似 Python defaultdict
        Map<String, List<Integer>> grouped = new HashMap<>();
        grouped.computeIfAbsent("a", k -> new ArrayList<>()).add(1);
    }
}
\`\`\`

### 七、性能对比

| 操作 | Python list | Java ArrayList | Python dict | Java HashMap |
|------|-------------|----------------|-------------|--------------|
| 索引访问 | O(1) | O(1) | O(1) | O(1) |
| 头部插入 | O(n) | O(n) | - | - |
| 尾部插入 | O(1) 均摊 | O(1) 均摊 | - | - |
| 查找 | O(n) | O(n) | O(1) | O(1) |
| 删除 | O(n) | O(n) | O(1) | O(1) |

**性能说明**：
- Java HashMap 在哈希冲突严重时（链表转红黑树）性能更稳定
- Python dict 在小数据量下性能优秀，3.7+ 的有序实现有额外开销
- Java ArrayList 比 Python list 内存占用更低（无类型对象开销）

### 八、常见用法对比

**Python 集合运算**

\`\`\`python
# 集合运算
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print(a | b)  # 并集 {1, 2, 3, 4, 5, 6}
print(a & b)  # 交集 {3, 4}
print(a - b)  # 差集 {1, 2}
print(a ^ b)  # 对称差 {1, 2, 5, 6}

# 字典合并（Python 3.9+）
d1 = {"a": 1}
d2 = {"b": 2}
merged = d1 | d2
print(merged)  # {'a': 1, 'b': 2}
\`\`\`

**Java 集合运算**

\`\`\`java
import java.util.*;
import java.util.stream.*;

Set<Integer> a = new HashSet<>(Set.of(1, 2, 3, 4));
Set<Integer> b = new HashSet<>(Set.of(3, 4, 5, 6));

// 并集
Set<Integer> union = new HashSet<>(a);
union.addAll(b);  // {1, 2, 3, 4, 5, 6}

// 交集
Set<Integer> intersection = new HashSet<>(a);
intersection.retainAll(b);  // {3, 4}

// 差集
Set<Integer> diff = new HashSet<>(a);
diff.removeAll(b);  // {1, 2}

// 字典合并
Map<String, Integer> d1 = new HashMap<>(Map.of("a", 1));
Map<String, Integer> d2 = Map.of("b", 2);
Map<String, Integer> merged = new HashMap<>(d1);
merged.putAll(d2);
\`\`\`

### 九、小结

| 特性 | Python | Java |
|------|--------|------|
| 内建容器 | list/tuple/dict/set | 需导入 java.util |
| 不可变集合 | tuple/frozenset | Collections.unmodifiableXxx |
| 推导式 | 原生 | Stream collect |
| 迭代器协议 | __iter__/__next__ | Iterator/Iterable |
| 有序 Map | dict（3.7+） | LinkedHashMap/TreeMap |
| 集合运算 | 运算符 \| & - ^ | 方法 addAll/retainAll |
| 字典合并 | 运算符 \| | putAll |

Python 的容器更简洁直观，适合快速开发；Java 的集合框架更全面，针对不同场景有优化实现，适合性能敏感场景。选择哪种语言，取决于项目需求、团队习惯和性能要求。`,
  },
];
