// =============================================================
// Java 精简版 —— 第 3 批章节（进阶核心 4 章）
// -------------------------------------------------------------
//   js-collection : 集合框架
//   js-generics   : 泛型
//   js-stream      : Lambda 与 Stream
//   js-thread      : 多线程基础
// ============================================================

export const chapters = [
  // =========================================================
  // 第 9 章：集合框架
  // =========================================================
  {
    id: "js-collection",
    group: "进阶核心",
    icon: "📚",
    title: "集合框架",
    content: `# 集合框架

## 一、集合体系图

\`\`\`
Collection
├── List       （有序、可重复、有索引）
│   ├── ArrayList      底层数组，查询快，增删慢
│   └── LinkedList     底层双向链表，增删快，查询慢
├── Set        （无序、不可重复）
│   ├── HashSet        底层 HashMap，无序
│   └── TreeSet        底层红黑树，自动排序
└── Queue      （队列）
    ├── ArrayDeque     双端队列，推荐替代 Stack
    └── PriorityQueue  优先队列，最小堆

Map
├── HashMap          key 无序，允许 null
├── LinkedHashMap     保持插入顺序
└── TreeMap           key 自动排序
\`\`\`

## 二、Demo：List 常用操作

\`\`\`java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 1. 创建与基本操作 =====
        // 用 List.of 创建不可变 List（Java 9+）
        List<String> immutable = List.of("A", "B", "C");

        // 可变 List：用 ArrayList
        List<String> list = new ArrayList<>();
        list.add("Java");
        list.add("Python");
        list.add("Go");
        list.add(1, "Rust");       // 在索引 1 处插入
        System.out.println("list = " + list);

        // 查询
        System.out.println("size = " + list.size());
        System.out.println("第 1 个 = " + list.get(1));
        System.out.println("包含 Java? " + list.contains("Java"));

        // 修改
        list.set(0, "Java 21");
        System.out.println("修改后 = " + list);

        // 删除
        list.remove("Go");          // 按对象删
        list.remove(0);             // 按索引删
        System.out.println("删除后 = " + list);

        // ===== 2. 遍历 =====
        // for-each
        for (String s : list) {
            System.out.println(s);
        }
        // 迭代器
        Iterator<String> it = list.iterator();
        while (it.hasNext()) {
            System.out.println(it.next());
        }

        // ===== 3. 转数组 =====
        String[] arr = list.toArray(new String[0]);
        System.out.println(Arrays.toString(arr));

        // ===== 4. 排序 =====
        List<Integer> nums = new ArrayList<>(List.of(3, 1, 4, 1, 5, 9));
        // sort 接受 Comparator，这里用自然顺序
        nums.sort(null);                // 自然顺序
        System.out.println("升序: " + nums);
        nums.sort(Comparator.reverseOrder());
        System.out.println("降序: " + nums);
    }
}
\`\`\`

## 三、Demo：Map 常用操作

\`\`\`java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> scores = new HashMap<>();
        // 添加 / 修改
        scores.put("Tom", 80);
        scores.put("Jerry", 90);
        scores.put("Tom", 85);   // key 相同时覆盖
        System.out.println("scores = " + scores);

        // 查询
        System.out.println("Tom = " + scores.get("Tom"));
        System.out.println("默认值 = " + scores.getOrDefault("Lucy", 0));
        System.out.println("包含 Tom? " + scores.containsKey("Tom"));

        // ===== 1. 遍历 =====
        // 推荐：entrySet
        for (Map.Entry<String, Integer> e : scores.entrySet()) {
            System.out.println(e.getKey() + " => " + e.getValue());
        }
        // 只要 key
        for (String name : scores.keySet()) {
            System.out.println(name);
        }
        // 只要 value
        for (int score : scores.values()) {
            System.out.println(score);
        }

        // ===== 2. computeIfAbsent：不存在则计算 =====
        // 常用于缓存、统计词频
        Map<String, List<String>> map = new HashMap<>();
        // 如果 key 不存在，调用函数生成默认值并 put
        map.computeIfAbsent("grp1", k -> new ArrayList<>()).add("Tom");
        map.computeIfAbsent("grp1", k -> new ArrayList<>()).add("Jerry");
        System.out.println(map);

        // ===== 3. 统计词频（经典模式）=====
        String[] words = {"a", "b", "a", "c", "b", "a"};
        Map<String, Integer> freq = new HashMap<>();
        for (String w : words) {
            // merge：用函数把旧值与新值合并
            freq.merge(w, 1, Integer::sum);
        }
        System.out.println("词频 = " + freq);

        // ===== 4. LinkedHashMap 保持插入顺序 =====
        Map<String, Integer> linked = new LinkedHashMap<>();
        linked.put("z", 1);
        linked.put("a", 2);
        linked.put("m", 3);
        System.out.println("LinkedHashMap = " + linked);  // {z=1, a=2, m=3}
    }
}
\`\`\`

## 四、Demo：Set 与 Queue

\`\`\`java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 1. Set 去重 =====
        Set<Integer> set = new HashSet<>(Arrays.asList(1, 2, 2, 3, 3, 3));
        System.out.println("Set = " + set);  // {1, 2, 3}

        // TreeSet 自动排序
        Set<Integer> tree = new TreeSet<>(Arrays.asList(3, 1, 4, 1, 5));
        System.out.println("TreeSet = " + tree);  // [1, 3, 4, 5]

        // ===== 2. ArrayDeque 当栈/队列用 =====
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(1);
        stack.push(2);
        stack.push(3);
        System.out.println("pop = " + stack.pop());  // 3 (LIFO)

        Queue<Integer> queue = new ArrayDeque<>();
        queue.offer(1);
        queue.offer(2);
        queue.offer(3);
        System.out.println("poll = " + queue.poll());  // 1 (FIFO)

        // ===== 3. PriorityQueue 优先队列（默认最小堆）=====
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        pq.offer(3);
        pq.offer(1);
        pq.offer(4);
        // peek 取堆顶（最小值），不删除
        System.out.println("peek = " + pq.peek());   // 1
        // poll 取出堆顶
        while (!pq.isEmpty()) {
            System.out.println("poll = " + pq.poll());  // 1, 3, 4
        }

        // 最大堆：传入降序 Comparator
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
        maxHeap.addAll(Arrays.asList(3, 1, 4));
        System.out.println("max = " + maxHeap.poll());  // 4
    }
}
\`\`\`

## 五、ArrayList vs LinkedList

| | ArrayList | LinkedList |
| --- | --- | --- |
| 底层 | 数组 | 双向链表 |
| get(i) | O(1) | O(n) |
| 末尾 add | 均摊 O(1) | O(1) |
| 中间插入 | O(n) | O(n)（但找到位置后 O(1)）|
| 内存 | 紧凑 | 每节点额外指针 |

**经验：99% 场景用 \`ArrayList\`**，即使中间插入也更快（CPU 缓存友好）。

## 六、HashMap 原理速记

- JDK 8 起：数组 + 链表 + 红黑树
- 默认初始容量 16，负载因子 0.75
- 元素数 > 容量 × 0.75 时扩容到 2 倍
- 链表长度 ≥ 8 且数组 ≥ 64 时转红黑树
- key 的 hash：\`(h = key.hashCode()) ^ (h >>> 16)\`，让高位也参与运算

## 七、小结

- 99% 用 \`ArrayList\` 和 \`HashMap\`
- 用 \`computeIfAbsent\` / \`merge\` 简化 Map 操作
- \`ArrayDeque\` 替代 \`Stack\`（Stack 继承 Vector 性能差）
- \`LinkedHashMap\` 保持插入顺序，\`TreeMap\` 自动排序`,
  },

  // =========================================================
  // 第 10 章：泛型
  // =========================================================
  {
    id: "js-generics",
    group: "进阶核心",
    icon: "🎯",
    title: "泛型",
    content: `# 泛型

## 一、为什么需要泛型

\`\`\`java
// 没有泛型：用 Object 接收所有类型，丢失类型信息
List list = new ArrayList();
list.add("hello");
String s = (String) list.get(0);  // 必须强转，容易出 ClassCastException

// 有泛型：编译期就知道元素类型
List<String> list2 = new ArrayList<>();
list2.add("hello");
String s2 = list2.get(0);   // 不用强转
\`\`\`

**泛型的好处：**
1. 编译期类型检查
2. 消除强转
3. 代码复用（一个类/方法处理多种类型）

## 二、泛型类

\`\`\`java
// <T> 是类型参数，约定俗成：T Type、E Element、K Key、V Value、R Return
public class Box<T> {
    private T value;

    public Box(T value) { this.value = value; }
    public T get() { return value; }
    public void set(T value) { this.value = value; }
}

// 使用
Box<String> b1 = new Box<>("hello");
Box<Integer> b2 = new Box<>(100);

// 菱形语法：编译器从左侧推断类型（Java 7+）
Box<String> b3 = new Box<>("hi");
\`\`\`

## 三、泛型方法

\`\`\`java
public class Main {
    // <T> 写在返回值前面，声明这是一个泛型方法
    // T 类型由调用方传入的参数推断
    public static <T> T first(List<T> list) {
        if (list.isEmpty()) return null;
        return list.get(0);
    }

    public static void main(String[] args) {
        // 不用显式指定 T，编译器推断
        String s = first(List.of("a", "b"));
        Integer n = first(List.of(1, 2, 3));
        System.out.println(s + " " + n);
    }
}
\`\`\`

## 四、边界：extends 与 super

\`\`\`java
// 上界 <? extends Number>：可以是 Number 或其子类
// 只能读，不能写（编译器无法确定具体类型）
public static double sum(List<? extends Number> nums) {
    double total = 0;
    for (Number n : nums) {
        total += n.doubleValue();
    }
    return total;
}

// 下界 <? super Integer>：可能是 Integer 或其父类
// 只能写，读出来是 Object
public static void addNumbers(List<? super Integer> list, int n) {
    for (int i = 0; i < n; i++) {
        // 写入 Integer 没问题，因为 Integer 一定能赋给其父类
        list.add(i);
    }
}

public static void main(String[] args) {
    System.out.println(sum(List.of(1, 2, 3)));           // Integer
    System.out.println(sum(List.of(1.0, 2.0)));            // Double

    List<Number> nums = new ArrayList<>();
    addNumbers(nums, 3);
    System.out.println(nums);
}
\`\`\`

**PECS 原则：** Producer Extends, Consumer Super
- 从集合**读**（生产）→ \`? extends T\`
- 向集合**写**（消费）→ \`? super T\`

## 五、Demo：用泛型实现缓存

\`\`\`java
import java.util.*;
import java.util.function.Function;

public class Main {
    public static void main(String[] args) {
        // LRUCache：模拟一个简单的缓存
        Cache<String, Integer> cache = new Cache<>(3);
        cache.put("a", 1);
        cache.put("b", 2);
        cache.put("c", 3);
        cache.put("d", 4);   // 超容量，淘汰 a
        System.out.println("a = " + cache.get("a"));  // null
        System.out.println("b = " + cache.get("b"));  // 2

        // 用泛型方法计算
        List<String> names = List.of("Tom", "Jerry", "Alice");
        // map：把 List<String> 变成 List<Integer>
        List<Integer> lengths = map(names, String::length);
        System.out.println(lengths);
    }

    // 泛型方法：对列表每个元素应用函数
    public static <T, R> List<R> map(List<T> list, Function<T, R> fn) {
        List<R> result = new ArrayList<>();
        for (T t : list) {
            result.add(fn.apply(t));
        }
        return result;
    }
}

// 用 LinkedHashMap 实现一个简易 LRU 缓存
class Cache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    public Cache(int capacity) {
        // 第 3 个参数 true：按访问顺序排序（最近访问的在末尾）
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        // 返回 true 表示淘汰最旧条目
        return size() > capacity;
    }
}
\`\`\`

## 六、类型擦除

Java 泛型是**伪泛型**：编译后泛型信息被擦除，运行时 \`List<String>\` 和 \`List<Integer>\` 都是同一个 \`List\` 类。

\`\`\`java
List<String> a = new ArrayList<>();
List<Integer> b = new ArrayList<>();
// 运行时 a.getClass() == b.getClass() 都是 ArrayList.class
System.out.println(a.getClass() == b.getClass());  // true
\`\`\`

**后果：**
- 不能 \`new T()\`、\`new T[]\`、\`instanceof T\`
- 不能创建泛型数组：\`new List<String>[10]\` 编译报错
- 静态方法 / 静态字段不能使用类的类型参数

## 七、小结

- 泛型让代码类型安全、可复用
- PECS：读 extends、写 super
- Java 泛型靠类型擦除实现，运行时无类型参数信息`,
  },

  // =========================================================
  // 第 11 章：Lambda 与 Stream
  // =========================================================
  {
    id: "js-stream",
    group: "进阶核心",
    icon: "🌊",
    title: "Lambda 与 Stream",
    content: `# Lambda 与 Stream

## 一、Lambda 基础

\`(参数) -> 表达式或语句块\`

\`\`\`java
// 老写法：匿名内部类
Runnable r1 = new Runnable() {
    @Override
    public void run() {
        System.out.println("hi");
    }
};

// Lambda：类型可推断、参数可省略类型、单语句可省大括号和 return
Runnable r2 = () -> System.out.println("hi");

// 带参数
java.util.function.Function<String, Integer> len = s -> s.length();
// 单参数可省括号
java.util.function.Consumer<String> print = s -> System.out.println(s);
\`\`\`

## 二、方法引用

更简洁的 Lambda 写法，直接引用已有方法。

\`\`\`java
import java.util.*;
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        // 静态方法引用：Integer::parseInt
        Function<String, Integer> f1 = Integer::parseInt;
        System.out.println(f1.apply("42"));

        // 实例方法引用（对象实例）：sout::println
        Consumer<String> c1 = System.out::println;
        c1.accept("hello");

        // 类的实例方法引用（第一个参数是接收者）
        // String::length 等价于 s -> s.length()
        Function<String, Integer> f2 = String::length;
        System.out.println(f2.apply("hello"));

        // 构造方法引用：ArrayList::new
        Supplier<ArrayList<Integer>> s = ArrayList::new;
        ArrayList<Integer> list = s.get();
    }
}
\`\`\`

## 三、函数式接口

Lambda 的目标类型必须是**函数式接口**（只有一个抽象方法）。\`java.util.function\` 包内置常用接口：

| 接口 | 签名 | 用途 |
| --- | --- | --- |
| \`Supplier<T>\` | \`T get()\` | 生产者，无参有返回 |
| \`Consumer<T>\` | \`void accept(T)\` | 消费者，有参无返回 |
| \`Function<T,R>\` | \`R apply(T)\` | 转换 T → R |
| \`Predicate<T>\` | \`boolean test(T)\` | 判断 |
| \`BiFunction<T,U,R>\` | \`R apply(T,U)\` | 双参转换 |

## 四、Stream 流

Stream 让集合操作像写 SQL 一样：声明式、可链式、可并行。

\`\`\`java
list.stream()
    .filter(x -> x > 0)
    .map(x -> x * 2)
    .forEach(System.out::println);
\`\`\`

**关键概念：**
- Stream 是**惰性求值**的，没有终止操作不会执行
- Stream 不可复用，一个 Stream 只能消费一次
- 中间操作返回 Stream，终止操作返回结果

## 五、Demo：完整 Stream 操作

\`\`\`java
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<Person> people = List.of(
            new Person("Tom", 18, "M"),
            new Person("Jerry", 25, "M"),
            new Person("Alice", 30, "F"),
            new Person("Bob", 17, "M"),
            new Person("Carol", 28, "F")
        );

        // ===== 1. filter + forEach：筛选并遍历 =====
        // 找出所有成年男性
        people.stream()
            .filter(p -> p.age >= 18)
            .filter(p -> p.gender.equals("M"))
            .forEach(p -> System.out.println("成年男性: " + p.name));

        // ===== 2. map：转换 =====
        // 提取所有名字
        List<String> names = people.stream()
            .map(p -> p.name)
            .collect(Collectors.toList());
        System.out.println("名字: " + names);

        // ===== 3. sorted：排序 =====
        // 按年龄升序
        List<Person> byAge = people.stream()
            .sorted(Comparator.comparingInt(p -> p.age))
            .collect(Collectors.toList());
        System.out.println("按年龄: " + byAge);

        // ===== 4. distinct + limit =====
        List<Integer> nums = Stream.of(1, 2, 2, 3, 3, 3, 4, 5)
            .distinct()       // 去重
            .limit(3)          // 取前 3 个
            .collect(Collectors.toList());
        System.out.println("去重+limit: " + nums);

        // ===== 5. reduce：归约 =====
        int sum = Stream.of(1, 2, 3, 4, 5)
            .reduce(0, Integer::sum);
        System.out.println("sum = " + sum);

        // ===== 6. collect 到 Map =====
        // key=name, value=age
        Map<String, Integer> nameToAge = people.stream()
            .collect(Collectors.toMap(p -> p.name, p -> p.age));
        System.out.println(nameToAge);

        // 按 gender 分组
        Map<String, List<Person>> byGender = people.stream()
            .collect(Collectors.groupingBy(p -> p.gender));
        System.out.println("按性别分组:");
        byGender.forEach((g, ps) -> System.out.println("  " + g + ": " + ps));

        // ===== 7. 统计：count / max / sum =====
        long adultCount = people.stream().filter(p -> p.age >= 18).count();
        System.out.println("成年人数: " + adultCount);

        int totalAge = people.stream().mapToInt(p -> p.age).sum();
        System.out.println("年龄总和: " + totalAge);

        double avgAge = people.stream().mapToInt(p -> p.age).average().orElse(0);
        System.out.println("平均年龄: " + avgAge);

        // ===== 8. anyMatch / allMatch / noneMatch =====
        boolean hasMinor = people.stream().anyMatch(p -> p.age < 18);
        boolean allAdult = people.stream().allMatch(p -> p.age >= 18);
        boolean noElderly = people.stream().noneMatch(p -> p.age >= 60);
        System.out.println("有未成年? " + hasMinor);
        System.out.println("都是成年? " + allAdult);
        System.out.println("无老年? " + noElderly);

        // ===== 9. 拼接字符串 =====
        String all = people.stream()
            .map(p -> p.name)
            .collect(Collectors.joining(", ", "[", "]"));
        System.out.println(all);
    }
}

class Person {
    String name;
    int age;
    String gender;
    public Person(String name, int age, String gender) {
        this.name = name;
        this.age = age;
        this.gender = gender;
    }
    @Override
    public String toString() {
        return name + "(" + age + ")";
    }
}
\`\`\`

## 六、常见坑：peek 与惰性

\`\`\`java
// ❌ 没有 forEach 等终止操作，peek 不会执行
Stream.of(1, 2, 3).peek(System.out::println);  // 什么都不打印

// ✅ 加上终止操作才会执行中间操作
Stream.of(1, 2, 3).peek(System.out::println).count();
\`\`\`

## 七、并行流 parallelStream

\`\`\`java
// 一键并行：内部用 ForkJoinPool.commonPool()
long count = list.parallelStream()
    .filter(x -> x > 0)
    .count();
\`\`\`

**注意：** 并行流有线程开销，**数据量小（< 1万）反而更慢**；且要求操作无副作用、无顺序依赖。

## 八、小结

- Lambda = 函数式接口的实例
- 方法引用是 Lambda 的简写
- Stream 三段式：源 → 中间操作 → 终止操作
- 终止操作触发执行，没有终止操作的 Stream 不会运行
- \`groupingBy\` / \`toMap\` 是收集到 Map 的利器`,
  },

  // =========================================================
  // 第 12 章：多线程基础
  // =========================================================
  {
    id: "js-thread",
    group: "进阶核心",
    icon: "🧵",
    title: "多线程基础",
    content: `# 多线程基础

## 一、创建线程的三种方式

\`\`\`java
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 1. 继承 Thread =====
        class MyThread extends Thread {
            @Override
            public void run() {
                System.out.println("Thread: " + Thread.currentThread().getName());
            }
        }
        new MyThread().start();

        // ===== 2. 实现 Runnable（推荐：解耦任务与执行）=====
        Thread t = new Thread(() -> {
            System.out.println("Runnable: " + Thread.currentThread().getName());
        });
        t.start();

        // ===== 3. 实现 Callable + FutureTask（有返回值）=====
        Callable<Integer> task = () -> {
            Thread.sleep(100);
            return 42;
        };
        FutureTask<Integer> ft = new FutureTask<>(task);
        new Thread(ft).start();
        // get 阻塞直到任务完成
        System.out.println("Callable 返回: " + ft.get());

        // ===== 4. 用 ExecutorService 线程池（生产推荐）=====
        ExecutorService pool = Executors.newFixedThreadPool(4);
        Future<String> future = pool.submit(() -> {
            Thread.sleep(50);
            return "pool result";
        });
        System.out.println("Pool 返回: " + future.get());

        // 关闭线程池
        pool.shutdown();
    }
}
\`\`\`

**优先用线程池 \`ExecutorService\`，避免手动 new Thread**：
- 减少创建/销毁开销
- 控制最大并发数，防止资源耗尽
- 统一管理任务队列

## 二、线程同步：synchronized

多个线程同时修改共享变量会出问题，必须加锁。

\`\`\`java
public class Main {
    private static int count = 0;

    public static void main(String[] args) throws InterruptedException {
        Runnable inc = () -> {
            for (int i = 0; i < 10000; i++) {
                // synchronized 同步块：保证同一时刻只有一个线程能进入
                synchronized (Main.class) {
                    count++;
                }
            }
        };

        Thread t1 = new Thread(inc);
        Thread t2 = new Thread(inc);
        t1.start();
        t2.start();
        t1.join();   // 等待 t1 结束
        t2.join();
        // 不加锁：count 可能 < 20000
        // 加锁：count 一定是 20000
        System.out.println("count = " + count);
    }
}
\`\`\`

**synchronized 三种用法：**
- 同步方法：\`public synchronized void m()\`（锁 this）
- 同步静态方法：\`public static synchronized void m()\`（锁 Class）
- 同步块：\`synchronized(obj) { ... }\`（锁 obj）

## 三、Demo：生产者消费者（wait/notify）

\`\`\`java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // 一个有界队列，模拟生产者-消费者
        Queue<Integer> queue = new LinkedList<>();
        int maxSize = 3;

        // 生产者
        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                synchronized (queue) {
                    // 满了就等（用 while 不用 if，防止虚假唤醒）
                    while (queue.size() == maxSize) {
                        try {
                            queue.wait();
                        } catch (InterruptedException e) {}
                    }
                    queue.offer(i);
                    System.out.println("生产: " + i + ", size=" + queue.size());
                    // 唤醒所有等待的消费者
                    queue.notifyAll();
                }
            }
        }).start();

        // 消费者
        new Thread(() -> {
            while (true) {
                synchronized (queue) {
                    while (queue.isEmpty()) {
                        try {
                            queue.wait();
                        } catch (InterruptedException e) {}
                    }
                    int x = queue.poll();
                    System.out.println("消费: " + x + ", size=" + queue.size());
                    queue.notifyAll();
                    if (x == 9) break;
                }
            }
        }).start();
    }
}
\`\`\`

**关键点：**
- \`wait()\` 会释放锁并阻塞，\`notify()\` / \`notifyAll()\` 唤醒
- \`wait\` 必须在 \`synchronized\` 块里调用
- 用 \`while\` 检查条件（防止虚假唤醒）

## 四、更现代的工具：Lock 与 Condition

\`\`\`java
import java.util.concurrent.locks.*;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Queue<Integer> queue = new LinkedList<>();
        int maxSize = 3;
        ReentrantLock lock = new ReentrantLock();
        Condition notFull = lock.newCondition();
        Condition notEmpty = lock.newCondition();

        // 生产者
        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                lock.lock();
                try {
                    while (queue.size() == maxSize) {
                        try { notFull.await(); } catch (InterruptedException e) {}
                    }
                    queue.offer(i);
                    System.out.println("生产: " + i);
                    notEmpty.signal();
                } finally {
                    lock.unlock();
                }
            }
        }).start();

        // 消费者
        new Thread(() -> {
            while (true) {
                lock.lock();
                try {
                    while (queue.isEmpty()) {
                        try { notEmpty.await(); } catch (InterruptedException e) {}
                    }
                    int x = queue.poll();
                    System.out.println("消费: " + x);
                    notFull.signal();
                    if (x == 9) break;
                } finally {
                    lock.unlock();
                }
            }
        }).start();
    }
}
\`\`\`

**Lock 优势：**
- 可中断（\`lockInterruptibly\`）
- 可超时（\`tryLock(timeout)\`）
- 多 Condition（精确唤醒）

**铁律：** \`lock.unlock()\` 必须放 \`finally\` 里，否则异常会导致死锁。

## 五、并发集合

\`java.util.concurrent\` 包提供线程安全的集合，**替代 \`Collections.synchronizedXxx\`**：

| 集合 | 特点 |
| --- | --- |
| \`ConcurrentHashMap\` | 高并发 Map，分段锁 / CAS |
| \`CopyOnWriteArrayList\` | 写时复制，读多写少场景 |
| \`ConcurrentLinkedQueue\` | 无界非阻塞队列 |
| \`BlockingQueue\` | 阻塞队列，生产者消费者神器 |

\`\`\`java
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== BlockingQueue：自动阻塞 =====
        BlockingQueue<String> q = new ArrayBlockingQueue<>(2);

        // put：满了自动阻塞
        q.put("a");
        q.put("b");
        // q.put("c");  // 队列已满，会阻塞直到有空间

        // take：空了自动阻塞
        System.out.println(q.take());  // a
        System.out.println(q.take());  // b

        // ===== 用 BlockingQueue 实现生产者消费者（超简洁）=====
        BlockingQueue<Integer> queue = new LinkedBlockingQueue<>(5);

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    queue.put(i);
                    System.out.println("生产: " + i);
                } catch (InterruptedException e) {}
            }
        }).start();

        new Thread(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    int x = queue.take();
                    System.out.println("消费: " + x);
                }
            } catch (InterruptedException e) {}
        }).start();

        Thread.sleep(500);

        // ===== ConcurrentHashMap：高并发场景首选 =====
        ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
        map.put("a", 1);
        // 原子操作
        map.compute("a", (k, v) -> v + 1);
        System.out.println(map);
    }
}
\`\`\`

## 六、volatile

\`volatile\` 保证**可见性**：一个线程修改后，其他线程立即看到新值。

\`\`\`java
class Worker implements Runnable {
    // volatile：每次读都从主内存读，不用工作内存的缓存
    private volatile boolean stop = false;

    public void stop() { this.stop = true; }

    @Override
    public void run() {
        while (!stop) {
            // 如果 stop 不加 volatile，另一个线程改了 stop=true
            // 这个线程可能永远看不到，陷入死循环
        }
        System.out.println("worker stopped");
    }
}
\`\`\`

**注意：** \`volatile\` **不保证原子性**。\`count++\` 仍需要 \`synchronized\` 或 \`AtomicInteger\`。

\`\`\`java
// 原子类：用 CAS 实现无锁原子操作
AtomicInteger counter = new AtomicInteger(0);
counter.incrementAndGet();   // ++counter
counter.addAndGet(5);        // counter += 5
counter.compareAndSet(0, 1); // 如果当前值是 0 才设为 1
\`\`\`

## 七、CompletableFuture：异步编排

\`\`\`java
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // supplyAsync：异步执行有返回值的任务
        CompletableFuture<String> f1 = CompletableFuture.supplyAsync(() -> {
            try { Thread.sleep(50); } catch (InterruptedException e) {}
            return "用户数据";
        });

        // thenApply：上一步结果转成新值
        CompletableFuture<String> f2 = f1.thenApply(s -> s + " + 头像");

        // thenAccept：消费结果（无返回值）
        f2.thenAccept(System.out::println);

        // 链式调用
        CompletableFuture
            .supplyAsync(() -> 10)
            .thenApply(x -> x * 2)
            .thenApply(x -> "结果: " + x)
            .thenAccept(System.out::println);

        // 等待所有完成
        CompletableFuture<Void> all = CompletableFuture.allOf(f1, f2);
        all.join();
        System.out.println("全部完成");
    }
}
\`\`\`

\`CompletableFuture\` 比 \`Future\` 强大得多：可链式编排、组合、异常处理，是 Java 异步编程的主力。

## 八、小结

- 优先用 \`ExecutorService\` 线程池，避免裸 \`new Thread\`
- \`synchronized\` 是最简单的同步工具，复杂场景用 \`ReentrantLock\`
- 并发集合（\`ConcurrentHashMap\` / \`BlockingQueue\`）是替代手写同步的首选
- \`volatile\` 保证可见性不保证原子性，原子性用 \`AtomicXxx\`
- \`CompletableFuture\` 是异步编排的现代写法`,
  },
];
