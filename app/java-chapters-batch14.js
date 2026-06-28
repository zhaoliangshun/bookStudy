// =============================================================
// Java 交互式教程 —— 第十四批章节（集合进阶组，共 15 章）
// =============================================================

export const chapters = [
  {
    id: "java-hashmap-internals",
    group: "集合进阶",
    icon: "🔬",
    title: "HashMap 原理",
    content: `# HashMap 原理

\`HashMap\` 是 Java 中使用最广泛的哈希表实现。理解其内部结构有助于编写高效代码并避开常见陷阱。

## 内部结构

Java 8+ 的 HashMap 由 **数组 + 链表 + 红黑树** 三种结构组合而成：

- 主结构是一个 \`Node[] table\`，称为桶数组（bucket array）。
- 每个桶存放一个链表头节点；哈希冲突的元素挂在同一桶的链表上。
- 当链表长度 ≥ 8 且数组容量 ≥ 64 时，链表转换为**红黑树**，避免极端情况下退化为 O(n) 查找。
- 当红黑树节点数 ≤ 6 时，会退化回链表。

## hash 计算与桶定位

\`\`\`java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
\`\`\`

HashMap 将 hashCode 的高 16 位与低 16 位异或，称为**扰动函数**，目的是让高位也参与桶定位，减少冲突。

桶下标计算：\`index = (n - 1) & hash\`，其中 n 是数组长度（始终为 2 的幂）。这种位运算等价于取模，但更快。

## 链表转树与树转链表

- **链表 → 树**：链表长度 ≥ 8 且 table.length ≥ 64（否则只触发扩容）。
- **树 → 链表**：节点数 ≤ 6 时退化。阈值用 8 和 6 形成滞后区间，避免频繁在临界点来回切换。

## 扩容机制

当 \`size > capacity * loadFactor\`（默认 0.75）时触发扩容：

1. 新容量为旧容量的 2 倍。
2. 遍历旧桶，对每个节点重新计算位置。由于容量翻倍，元素要么留在原索引，要么迁移到 \`原索引 + 旧容量\` 的位置。
3. 红黑树会被拆分，若拆分后节点 ≤ 6 则退化为链表。

## put 流程

1. 计算 key 的 hash 与桶下标。
2. 桶为空 → 直接放入新节点。
3. 桶非空 → 遍历链表/树，若 key 相等则覆盖旧值；否则尾插（Java 8 采用尾插法，避免死循环）。
4. 检查是否需要扩容或树化。

## null 键与 null 值

HashMap 允许最多一个 null 键（hash 为 0，固定放在第 0 个桶）和多个 null 值。

下面通过反射窥探 HashMap 的内部状态：`,
    code: `// 演示 HashMap 的内部行为：桶数组、链表与树化
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) throws Exception {
        // HashMap 的内部桶数组在 Java 8+ 中字段名为 "table"
        Map<String, Integer> map = new HashMap<>(4);

        // 故意构造哈希冲突：让多个 key 落到同一桶
        // 这些字符串经过扰动后 hashCode 模运算结果接近，便于观察链表
        for (int i = 0; i < 8; i++) {
            map.put("key" + i, i);
        }

        System.out.println("map.size = " + map.size());

        // 通过反射读取桶数组长度（capacity）
        Field tableField = HashMap.class.getDeclaredField("table");
        tableField.setAccessible(true);
        Object[] table = (Object[]) tableField.get(map);
        System.out.println("桶数组长度 capacity = " + (table == null ? 0 : table.length));

        // 统计每个桶的链表/树长度
        if (table != null) {
            for (int i = 0; i < table.length; i++) {
                Object node = table[i];
                int count = 0;
                boolean isTree = false;
                while (node != null) {
                    count++;
                    // 红黑树节点类型为 TreeNode，是 Node 的子类
                    if (node.getClass().getSimpleName().equals("TreeNode")) {
                        isTree = true;
                    }
                    // 通过 next 字段遍历链表
                    Field nextField = node.getClass().getSuperclass().getDeclaredField("next");
                    nextField.setAccessible(true);
                    node = nextField.get(node);
                }
                if (count > 0) {
                    System.out.println("桶[" + i + "] 元素数 = " + count + (isTree ? " (已树化)" : " (链表)"));
                }
            }
        }

        // 演示 null 键：固定放在 hash=0 的桶
        map.put(null, 100);
        System.out.println("null 键的值 = " + map.get(null));

        // 演示覆盖：相同 key 会替换 value
        map.put("key0", 999);
        System.out.println("key0 覆盖后 = " + map.get("key0"));
        System.out.println("size 仍为 = " + map.size());
    }
}`
  },
  {
    id: "java-load-factor",
    group: "集合进阶",
    icon: "⚖️",
    title: "负载因子与调优",
    content: `# 负载因子与调优

\`loadFactor\`（负载因子）是 HashMap 控制空间与时间平衡的关键参数。

## 默认值

\`\`\`java
static final int DEFAULT_INITIAL_CAPACITY = 16;
static final float DEFAULT_LOAD_FACTOR = 0.75f;
\`\`\`

默认容量 16，默认负载因子 0.75。当 \`size > capacity * loadFactor\` 时触发扩容。

## 为什么是 0.75

这是时间和空间的折中：

- **值越小**（如 0.5）：冲突少、查找快，但空间浪费大，频繁扩容。
- **值越大**（如 1.0）：空间利用率高，但冲突增多，链表变长，查找变慢。

0.75 是经验上的最佳平衡点。同时，0.75 还能让 \`capacity * loadFactor\` 始终为整数（当 capacity 为 2 的幂时）。

## 初始容量设置

如果能预估元素数量，应在创建时指定初始容量，避免多次扩容（rehash 开销大）：

\`\`\`java
// 预计放 100 个元素，0.75 负载因子
// 为避免触发扩容，容量应满足 capacity * 0.75 >= 100
int cap = (int) (100 / 0.75f) + 1;
Map<String, String> map = new HashMap<>(cap);
\`\`\`

注意：HashMap 构造器接收的 initialCapacity 不一定是最终的容量，内部会调整为 2 的幂。

## rehash 过程

扩容时所有元素都需要重新计算桶位置：

1. 新建一个 2 倍大的数组。
2. 遍历旧数组每个桶的每个节点。
3. 由于新容量是旧容量的 2 倍，\`(newCap - 1) & hash\` 比旧索引多了一个高位 bit。元素要么留在原位，要么迁移到 \`原索引 + 旧容量\`。

这一过程是 O(n) 的，频繁扩容会显著影响性能。

## 调优建议

- **数据量大且可预估** → 显式指定初始容量。
- **内存敏感、查找频繁** → 可适当降低负载因子（如 0.5），但通常不建议。
- **绝大多数场景** → 保持默认 0.75 即可。
- **不要轻易设为 1.0** → 冲突率显著上升，可能退化为链表遍历。

下面通过实验观察容量变化：`,
    code: `// 演示 HashMap 容量、负载因子与扩容行为
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

public class Main {
    // 通过反射获取 HashMap 当前桶数组长度
    static int capacity(Map<?, ?> map) throws Exception {
        Field f = HashMap.class.getDeclaredField("table");
        f.setAccessible(true);
        Object[] table = (Object[]) f.get(map);
        return table == null ? 0 : table.length;
    }

    public static void main(String[] args) throws Exception {
        // 1) 默认配置：初始容量 16，负载因子 0.75
        Map<Integer, String> m1 = new HashMap<>();
        System.out.println("默认初始容量 = " + capacity(m1)); // 还未分配，0
        m1.put(1, "a");
        System.out.println("首次 put 后容量 = " + capacity(m1)); // 16

        // 当 size > 16 * 0.75 = 12 时触发扩容
        for (int i = 0; i < 12; i++) {
            m1.put(i, "v");
        }
        System.out.println("放 12 个元素后容量 = " + capacity(m1)); // 16，未扩容
        m1.put(100, "v");
        System.out.println("放 13 个元素后容量 = " + capacity(m1)); // 32，已扩容

        // 2) 指定初始容量与负载因子
        // 容量 64，负载因子 1.0 → size > 64 才扩容
        Map<Integer, String> m2 = new HashMap<>(64, 1.0f);
        System.out.println("自定义初始容量 = " + capacity(m2)); // 64
        for (int i = 0; i < 64; i++) {
            m2.put(i, "v");
        }
        System.out.println("放 64 个元素后容量 = " + capacity(m2)); // 64，未扩容
        m2.put(100, "v");
        System.out.println("放 65 个元素后容量 = " + capacity(m2)); // 128，扩容

        // 3) 预估容量的建议公式
        int expected = 1000;
        int suggested = (int) (expected / 0.75f) + 1;
        System.out.println("预计 1000 元素，建议初始容量 = " + suggested);

        // 4) 负载因子过小：空间浪费
        Map<Integer, String> m3 = new HashMap<>(16, 0.5f);
        for (int i = 0; i < 9; i++) {
            m3.put(i, "v");
        }
        System.out.println("0.5 负载因子放 9 个元素后容量 = " + capacity(m3)); // 32，提前扩容
    }
}`
  },
  {
    id: "java-concurrent-hashmap",
    group: "集合进阶",
    icon: "🔀",
    title: "ConcurrentHashMap",
    content: `# ConcurrentHashMap

\`ConcurrentHashMap\` 是线程安全的 HashMap，专为高并发场景设计。

## 为什么不用 HashMap + synchronized

- \`Hashtable\` 对整个表加锁，并发度极低，已不推荐使用。
- \`Collections.synchronizedMap\` 同样是对整个 Map 加一把锁，多线程读写串行。
- \`ConcurrentHashMap\` 通过细粒度锁实现高并发。

## Java 7：分段锁（Segment）

Java 7 的 ConcurrentHashMap 采用 **Segment[]** 数组，每个 Segment 是一个独立的小 HashMap，自带一把锁。默认 16 个 Segment，理论并发度 16。不同 Segment 的写操作互不影响。

## Java 8+：CAS + synchronized

Java 8 抛弃了 Segment，结构与 HashMap 类似（数组 + 链表 + 红黑树），但加锁粒度细化到**桶级别**：

- 写操作：对桶的首节点用 \`synchronized\` 加锁，只锁定一个桶。
- 部分无竞争场景使用 CAS（如空桶插入）。
- 读操作 \`get\` 完全不加锁，依赖 \`volatile\` 保证可见性。

## put 流程

1. 计算 hash，定位桶。
2. 桶为空 → CAS 写入（无锁）。
3. 桶非空 → synchronized 锁住首节点，遍历链表/树插入或覆盖。
4. 检查是否需要扩容（多线程协助扩容）。

## get 流程

1. 计算 hash，定位桶。
2. 直接读 volatile 数组与节点字段，不加锁。
3. 由于节点 value 是 volatile 的，可见性有保障。

## 与 synchronizedMap 对比

| 特性 | ConcurrentHashMap | synchronizedMap |
|------|-------------------|-----------------|
| 读并发 | 完全并发 | 加锁串行 |
| 写并发 | 桶级锁，高并发 | 全局锁，串行 |
| null 键/值 | 不允许 | 允许 |
| 迭代器 | 弱一致性 | 快照（需同步） |

## 注意：不允许 null

ConcurrentHashMap 不允许 null 键和 null 值。这是因为多线程环境下，\`get(key)\` 返回 null 时无法区分"不存在"还是"值为 null"。

下面演示并发写入：`,
    code: `// 演示 ConcurrentHashMap 的线程安全与并发写入
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Main {
    public static void main(String[] args) throws Exception {
        Map<String, Integer> map = new ConcurrentHashMap<>();

        // 1) 基本操作
        map.put("a", 1);
        map.put("b", 2);
        System.out.println("get(a) = " + map.get("a"));

        // 原子操作：putIfAbsent 仅在不存在时放入
        map.putIfAbsent("a", 100);
        System.out.println("putIfAbsent 后 a = " + map.get("a")); // 仍为 1

        // 原子累加 compute
        map.compute("a", (k, v) -> v == null ? 1 : v + 10);
        System.out.println("compute 后 a = " + map.get("a")); // 11

        // 2) 多线程并发写入，验证线程安全
        final int threads = 100;
        final int perThread = 1000;
        ExecutorService pool = Executors.newFixedThreadPool(10);
        CountDownLatch latch = new CountDownLatch(threads);

        for (int t = 0; t < threads; t++) {
            final int base = t * perThread;
            pool.submit(() -> {
                try {
                    for (int i = 0; i < perThread; i++) {
                        map.put("k" + (base + i), 1);
                    }
                } finally {
                    latch.countDown();
                }
            });
        }
        latch.await();
        pool.shutdown();

        System.out.println("并发写入后 size = " + map.size());
        System.out.println("预期 size = " + (threads * perThread + 3)); // +3 是前面的 a/b

        // 3) 读操作不加锁，遍历为弱一致性
        for (Map.Entry<String, Integer> e : map.entrySet()) {
            if (e.getKey().equals("a")) {
                System.out.println("遍历时找到 a = " + e.getValue());
                break;
            }
        }

        // 4) 不允许 null：以下代码会抛出 NullPointerException
        try {
            map.put(null, 1);
        } catch (NullPointerException e) {
            System.out.println("put(null) 抛出: " + e.getClass().getSimpleName());
        }
        try {
            map.put("x", null);
        } catch (NullPointerException e) {
            System.out.println("put(null value) 抛出: " + e.getClass().getSimpleName());
        }
    }
}`
  },
  {
    id: "java-copy-on-write",
    group: "集合进阶",
    icon: "📋",
    title: "CopyOnWriteArrayList",
    content: `# CopyOnWriteArrayList

\`CopyOnWriteArrayList\` 是线程安全的 List 实现，采用**写时复制**（Copy-On-Write）策略，特别适合**读多写少**的场景。

## 核心思想

- **读操作不加锁**：直接读取内部数组的引用，性能极高。
- **写操作加锁 + 复制**：每次写（add/set/remove）都先获取锁，复制一份新数组，在新数组上修改，最后把内部引用指向新数组。

\`\`\`java
public boolean add(E e) {
    synchronized (lock) {
        Object[] elements = getArray();
        Object[] newElements = Arrays.copyOf(elements, elements.length + 1);
        newElements[elements.length] = e;
        setArray(newElements);
        return true;
    }
}
\`\`\`

## 读操作无锁

\`get\` 直接返回数组对应位置的元素，不加任何锁，所以读性能与普通 ArrayList 相当甚至更好（无竞争）。

## 适用场景

- **配置列表**：启动后基本不变，偶尔更新。
- **监听器列表**：事件分发时遍历，注册/注销频率低。
- **白名单/黑名单**：读频繁，写罕见。

## 与 synchronizedList 对比

| 特性 | CopyOnWriteArrayList | synchronizedList |
|------|---------------------|------------------|
| 读性能 | 极高（无锁） | 一般（加锁） |
| 写性能 | 差（复制整个数组） | 一般（加锁） |
| 写时开销 | O(n) 内存复制 | O(n) 移动元素 |
| 迭代器 | 快照，不抛 CME | 需同步，可能抛 CME |
| 适用 | 读多写少 | 读写均衡 |

## 迭代器快照

CopyOnWriteArrayList 的迭代器在创建时**快照**一份当前数组引用，之后即使原列表被修改，迭代器看到的仍是旧快照，不会抛 \`ConcurrentModificationException\`。这也意味着迭代期间无法反映最新修改。

## 缺点

- 写操作内存开销大：每次写都复制整个数组。
- 数据弱一致性：读到的可能是旧数据。
- 不适合写频繁场景。

下面演示其行为：`,
    code: `// 演示 CopyOnWriteArrayList 的写时复制特性
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Main {
    public static void main(String[] args) throws Exception {
        List<Integer> list = new CopyOnWriteArrayList<>();

        // 1) 基本操作
        list.add(1);
        list.add(2);
        list.add(3);
        System.out.println("初始: " + list);

        // 2) 迭代器快照：迭代期间修改不影响当前迭代
        list.add(4); // 此处先添加
        for (Integer x : list) {
            System.out.print(x + " ");
            if (x == 2) {
                list.add(99); // 迭代中修改，不影响本次迭代
            }
        }
        System.out.println();
        System.out.println("迭代后列表: " + list); // 99 已加入

        // 3) 多线程并发读：完全无锁，性能高
        ExecutorService pool = Executors.newFixedThreadPool(4);
        CountDownLatch latch = new CountDownLatch(4);
        long start = System.nanoTime();
        for (int t = 0; t < 4; t++) {
            pool.submit(() -> {
                try {
                    long sum = 0;
                    for (int i = 0; i < 1_000_000; i++) {
                        sum += list.get(list.size() - 1);
                    }
                    System.out.println("线程读取完成 sum=" + sum);
                } finally {
                    latch.countDown();
                }
            });
        }
        latch.await();
        long end = System.nanoTime();
        System.out.println("4 线程各读 100w 次耗时: " + (end - start) / 1_000_000 + " ms");
        pool.shutdown();

        // 4) 写开销大：每次 add 都复制整个数组
        List<Integer> bigList = new CopyOnWriteArrayList<>();
        long t1 = System.nanoTime();
        for (int i = 0; i < 10000; i++) {
            bigList.add(i);
        }
        long t2 = System.nanoTime();
        System.out.println("CopyOnWrite 写入 1w 次耗时: " + (t2 - t1) / 1_000_000 + " ms");

        // 对比 ArrayList
        java.util.List<Integer> arrList = new java.util.ArrayList<>();
        long t3 = System.nanoTime();
        for (int i = 0; i < 10000; i++) {
            arrList.add(i);
        }
        long t4 = System.nanoTime();
        System.out.println("ArrayList 写入 1w 次耗时: " + (t4 - t3) / 1_000_000 + " ms");

        // 5) remove 同样需要复制
        bigList.remove(0);
        System.out.println("remove 后 size = " + bigList.size());
    }
}`
  },
  {
    id: "java-blocking-queue",
    group: "集合进阶",
    icon: "🚧",
    title: "BlockingQueue",
    content: `# BlockingQueue

\`BlockingQueue\` 是一个**阻塞队列**接口，位于 \`java.util.concurrent\` 包，是实现生产者-消费者模式的核心工具。

## 阻塞操作

BlockingQueue 提供四类操作，每种操作在"队列满/空"时行为不同：

| 操作 | 抛异常 | 返回特殊值 | 阻塞 | 超时 |
|------|--------|-----------|------|------|
| 入队 | \`add\` | \`offer\` | \`put\` | \`offer(e, time)\` |
| 出队 | \`remove\` | \`poll\` | \`take\` | \`poll(time)\` |
| 查看队头 | \`element\` | \`peek\` | - | - |

- \`put\`：队列满时阻塞直到有空间。
- \`take\`：队列空时阻塞直到有元素。

## 主要实现

- **ArrayBlockingQueue**：基于数组的有界阻塞队列，FIFO，容量固定。
- **LinkedBlockingQueue**：基于链表的阻塞队列，可选有界（默认 \`Integer.MAX_VALUE\`，慎用无界）。
- **SynchronousQueue**：容量为 0，每个 put 必须等待一个 take。
- **PriorityBlockingQueue**：支持优先级的无界阻塞队列。
- **DelayQueue**：元素到期才能取出。

## ArrayBlockingQueue vs LinkedBlockingQueue

| 特性 | ArrayBlockingQueue | LinkedBlockingQueue |
|------|-------------------|---------------------|
| 底层 | 数组 | 链表 |
| 容量 | 必须指定 | 可选，默认超大 |
| 锁 | 单把锁 | 两把锁（头尾分离） |
| 内存 | 连续紧凑 | 节点对象开销 |

## 生产者-消费者模式

这是 BlockingQueue 最经典的应用：

- 生产者线程调用 \`put\` 放入任务。
- 消费者线程调用 \`take\` 取出任务处理。
- 队列自动协调两者速度差异。

## 注意事项

- **避免无界队列**：LinkedBlockingQueue 默认容量是 \`Integer.MAX_VALUE\`，任务堆积会导致 OOM。
- **公平性**：ArrayBlockingQueue 可选公平锁，但吞吐量会下降。
- **不支持 null**：所有 BlockingQueue 都不允许 null 元素。

下面演示生产者-消费者：`,
    code: `// 演示 BlockingQueue 实现生产者-消费者模式
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws Exception {
        // 容量为 5 的有界阻塞队列
        BlockingQueue<String> queue = new ArrayBlockingQueue<>(5);
        AtomicInteger produced = new AtomicInteger();
        AtomicInteger consumed = new AtomicInteger();

        ExecutorService pool = Executors.newFixedThreadPool(4);

        // 2 个生产者
        for (int p = 0; p < 2; p++) {
            final int id = p;
            pool.submit(() -> {
                try {
                    for (int i = 0; i < 10; i++) {
                        String item = "P" + id + "-" + i;
                        queue.put(item); // 队列满时阻塞
                        produced.incrementAndGet();
                        System.out.println("生产: " + item + " (队列=" + queue.size() + ")");
                        Thread.sleep(50);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        // 2 个消费者
        for (int c = 0; c < 2; c++) {
            final int id = c;
            pool.submit(() -> {
                try {
                    for (int i = 0; i < 10; i++) {
                        String item = queue.take(); // 队列空时阻塞
                        consumed.incrementAndGet();
                        System.out.println("  消费者" + id + " 处理: " + item);
                        Thread.sleep(80);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        pool.shutdown();
        pool.awaitTermination(10, TimeUnit.SECONDS);

        System.out.println("总计生产 = " + produced.get());
        System.out.println("总计消费 = " + consumed.get());
        System.out.println("队列剩余 = " + queue.size());

        // 演示 offer 与 poll 的超时版本
        BlockingQueue<String> q2 = new ArrayBlockingQueue<>(2);
        q2.offer("a");
        q2.offer("b");
        // 队列已满，offer 立即返回 false
        boolean ok = q2.offer("c");
        System.out.println("满队列 offer 立即返回: " + ok);
        // 超时 offer：等待 100ms 仍满则放弃
        boolean ok2 = q2.offer("c", 100, TimeUnit.MILLISECONDS);
        System.out.println("超时 offer 返回: " + ok2);

        // 空队列 take 阻塞，poll 超时返回 null
        BlockingQueue<String> q3 = new ArrayBlockingQueue<>(2);
        String r = q3.poll(100, TimeUnit.MILLISECONDS);
        System.out.println("空队列超时 poll 返回: " + r);
    }
}`
  },
  {
    id: "java-priority-queue",
    group: "集合进阶",
    icon: "📊",
    title: "PriorityQueue",
    content: `# PriorityQueue

\`PriorityQueue\` 是基于**堆**的优先队列，出队顺序由元素优先级决定，而非插入顺序。

## 堆实现

PriorityQueue 内部是一个**二叉小顶堆**，用数组存储：

- 父节点索引 i，左孩子 \`2i+1\`，右孩子 \`2i+2\`。
- 默认情况下父节点 ≤ 子节点（自然排序），队头是最小元素。
- 入队 \`add/offer\`：将元素加到末尾，再**上浮**（siftUp）调整。
- 出队 \`poll\`：取出堆顶，把末尾元素移到堆顶，再**下沉**（siftDown）调整。

## 排序方式

- **自然排序**：元素需实现 \`Comparable\`，如 Integer 默认升序（队头最小）。
- **Comparator 排序**：构造时传入 \`Comparator\`，灵活定制优先级。

\`\`\`java
// 小顶堆：队头是最小值
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
// 大顶堆：队头是最大值
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
\`\`\`

## 出队顺序

\`peek()\` 查看队头（不删除），\`poll()\` 取出并删除队头。每次 poll 都取出当前堆中最小（或按 Comparator 最优先）的元素。

## 与 TreeSet 的区别

| 特性 | PriorityQueue | TreeSet |
|------|---------------|---------|
| 底层 | 堆（数组） | 红黑树 |
| 是否有序遍历 | 否（只有队头最小） | 是（按顺序遍历） |
| 是否允许重复 | 是 | 否 |
| 是否允许 null | 否 | 否 |
| 复杂度 | offer/poll O(log n) | add/remove O(log n) |
| 取最小 | O(1) peek | O(1) first |

PriorityQueue 适合"只需取最值"的场景；TreeSet 适合需要整体有序遍历且去重的场景。

## 注意事项

- **不允许 null**。
- **不是线程安全**：多线程使用 \`PriorityBlockingQueue\`。
- **iterator() 不保证顺序**：迭代顺序是数组顺序，并非排序顺序。需要排序输出应逐个 poll。
- **删除非队头元素**：O(n) 查找 + O(log n) 调整。

## 典型应用

- Top K 问题：维护大小为 K 的堆。
- 任务调度：按优先级取出任务。
- Dijkstra 最短路径：按距离取最近节点。

下面演示用法：`,
    code: `// 演示 PriorityQueue 的堆行为与优先级出队
import java.util.Comparator;
import java.util.PriorityQueue;
import java.util.Queue;

public class Main {
    public static void main(String[] args) {
        // 1) 默认小顶堆：队头是最小值
        Queue<Integer> minHeap = new PriorityQueue<>();
        minHeap.offer(5);
        minHeap.offer(1);
        minHeap.offer(8);
        minHeap.offer(3);
        minHeap.offer(2);
        System.out.print("小顶堆出队顺序: ");
        while (!minHeap.isEmpty()) {
            System.out.print(minHeap.poll() + " ");
        }
        System.out.println();

        // 2) 大顶堆：队头是最大值
        Queue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
        maxHeap.addAll(java.util.Arrays.asList(5, 1, 8, 3, 2));
        System.out.print("大顶堆出队顺序: ");
        while (!maxHeap.isEmpty()) {
            System.out.print(maxHeap.poll() + " ");
        }
        System.out.println();

        // 3) 自定义对象 + Comparator
        Queue<Task> tasks = new PriorityQueue<>(Comparator.comparingInt(t -> t.priority));
        tasks.offer(new Task("写文档", 3));
        tasks.offer(new Task("修 Bug", 1));
        tasks.offer(new Task("发版本", 2));
        System.out.println("按优先级处理任务:");
        while (!tasks.isEmpty()) {
            Task t = tasks.poll();
            System.out.println("  优先级 " + t.priority + ": " + t.name);
        }

        // 4) Top K 问题：找出前 3 大的元素
        int[] data = {3, 1, 5, 7, 2, 9, 4, 8, 6};
        int k = 3;
        // 维护大小为 K 的小顶堆，堆顶是当前第 K 大
        Queue<Integer> topK = new PriorityQueue<>(k);
        for (int x : data) {
            if (topK.size() < k) {
                topK.offer(x);
            } else if (x > topK.peek()) {
                topK.poll();
                topK.offer(x);
            }
        }
        System.out.println("Top " + k + " 元素: " + topK);

        // 5) peek 不删除队头
        Queue<Integer> q = new PriorityQueue<>();
        q.offer(10);
        q.offer(20);
        System.out.println("peek = " + q.peek() + ", size = " + q.size());

        // 6) 迭代器不保证顺序
        Queue<Integer> q2 = new PriorityQueue<>();
        q2.addAll(java.util.Arrays.asList(5, 1, 3));
        System.out.println("迭代器顺序（非排序）: " + q2);
    }

    // 非公开辅助类
    static class Task {
        String name;
        int priority;
        Task(String name, int priority) {
            this.name = name;
            this.priority = priority;
        }
    }
}`
  },
  {
    id: "java-array-deque",
    group: "集合进阶",
    icon: "🎴",
    title: "ArrayDeque",
    content: `# ArrayDeque

\`ArrayDeque\` 是基于**可扩展循环数组**的双端队列（Deque），既可当队列，也可当栈，性能优于 \`LinkedList\` 和遗留的 \`Stack\`。

## 双端操作

ArrayDeque 在两端都能高效地入队/出队，所有操作均为均摊 O(1)：

- 队首：\`addFirst\` / \`offerFirst\` / \`removeFirst\` / \`pollFirst\` / \`peekFirst\` / \`getFirst\`
- 队尾：\`addLast\` / \`offerLast\` / \`removeLast\` / \`pollLast\` / \`peekLast\` / \`getLast\`

## 当栈使用

\`push\` 等价于 \`addFirst\`，\`pop\` 等价于 \`removeFirst\`，\`peek\` 等价于 \`peekFirst\`。所以 ArrayDeque 是推荐的栈实现。

## 当队列使用

\`offer\` = \`offerLast\`（入队尾），\`poll\` = \`pollFirst\`（出队首），形成 FIFO。

## 循环数组原理

内部用一个 \`Object[] elements\` 和两个指针 \`head\`、\`tail\`：

- 入队首：head 向前移动（\`(head - 1) & (elements.length - 1)\`）。
- 入队尾：tail 向后移动。
- 当 head 和 tail 相遇时，扩容为 2 倍并重新排列元素。

由于容量始终为 2 的幂，取模用位运算 \`& (len - 1)\`，非常高效。

## vs LinkedList

| 特性 | ArrayDeque | LinkedList |
|------|-----------|-----------|
| 底层 | 循环数组 | 双向链表 |
| 随机访问 | 不支持（O(n)） | O(n) |
| 内存 | 紧凑连续 | 每节点额外开销 |
| 栈/队列性能 | 优（缓存友好） | 略差 |
| null 元素 | 不允许 | 允许 |

## vs 遗留 Stack

\`java.util.Stack\` 继承自 \`Vector\`，每个方法都加锁，性能差，且设计不合理（继承而非组合）。**官方推荐用 \`ArrayDeque\` 替代 Stack**。

## 注意事项

- **不允许 null**：与大多数 Queue 实现一致。
- **非线程安全**：多线程用 \`ConcurrentLinkedDeque\` 或加锁。
- **不要用索引访问**：ArrayDeque 不实现 \`List\`，无法 \`get(i)\`。

下面演示用法：`,
    code: `// 演示 ArrayDeque 作为栈、队列与双端队列
import java.util.ArrayDeque;
import java.util.Deque;

public class Main {
    public static void main(String[] args) {
        // 1) 作为栈使用（LIFO）
        Deque<String> stack = new ArrayDeque<>();
        stack.push("第一");
        stack.push("第二");
        stack.push("第三");
        System.out.print("栈出栈顺序: ");
        while (!stack.isEmpty()) {
            System.out.print(stack.pop() + " ");
        }
        System.out.println();

        // 2) 作为队列使用（FIFO）
        Deque<String> queue = new ArrayDeque<>();
        queue.offer("甲");
        queue.offer("乙");
        queue.offer("丙");
        System.out.print("队列出队顺序: ");
        while (!queue.isEmpty()) {
            System.out.print(queue.poll() + " ");
        }
        System.out.println();

        // 3) 双端操作
        Deque<Integer> dq = new ArrayDeque<>();
        dq.addFirst(2);
        dq.addFirst(1);
        dq.addLast(3);
        dq.addLast(4);
        System.out.println("双端队列: " + dq); // [1, 2, 3, 4]
        System.out.println("首元素 peekFirst = " + dq.peekFirst());
        System.out.println("尾元素 peekLast = " + dq.peekLast());
        System.out.println("removeFirst = " + dq.removeFirst());
        System.out.println("removeLast = " + dq.removeLast());
        System.out.println("剩余: " + dq);

        // 4) 性能对比：ArrayDeque 栈 vs LinkedList 栈
        int n = 1_000_000;
        Deque<Integer> ad = new ArrayDeque<>();
        long t1 = System.nanoTime();
        for (int i = 0; i < n; i++) ad.push(i);
        for (int i = 0; i < n; i++) ad.pop();
        long t2 = System.nanoTime();
        System.out.println("ArrayDeque push/pop " + n + " 次: " + (t2 - t1) / 1_000_000 + " ms");

        Deque<Integer> ll = new java.util.LinkedList<>();
        long t3 = System.nanoTime();
        for (int i = 0; i < n; i++) ll.push(i);
        for (int i = 0; i < n; i++) ll.pop();
        long t4 = System.nanoTime();
        System.out.println("LinkedList push/pop " + n + " 次: " + (t4 - t3) / 1_000_000 + " ms");

        // 5) 不允许 null
        try {
            new ArrayDeque<>().push(null);
        } catch (NullPointerException e) {
            System.out.println("push(null) 抛出: " + e.getClass().getSimpleName());
        }
    }
}`
  },
  {
    id: "java-enum-map-set",
    group: "集合进阶",
    icon: "🎯",
    title: "EnumMap 与 EnumSet",
    content: `# EnumMap 与 EnumSet

当键（或元素）是**枚举类型**时，使用 \`EnumMap\` 和 \`EnumSet\` 比普通 HashMap/HashSet 性能更好、内存更省。

## EnumMap

\`EnumMap<K extends Enum<K>, V>\` 是专门为枚举键设计的 Map：

- 内部用一个**数组**存储值，数组长度等于枚举常量个数。
- 通过枚举的 \`ordinal()\`（声明顺序）作为数组下标，O(1) 访问。
- **没有 hash 计算、没有冲突、没有扩容**。

\`\`\`java
enum Color { RED, GREEN, BLUE }
EnumMap<Color, String> map = new EnumMap<>(Color.class);
map.put(Color.RED, "红");
\`\`\`

构造时必须传入枚举的 Class 对象，以便确定数组大小。

## EnumSet

\`EnumSet<E extends Enum<E>>\` 是专门为枚举元素设计的 Set：

- 当枚举常量数 ≤ 64 时，内部用 **long 位向量**实现（每个枚举常量占 1 bit）。
- 当枚举常量数 > 64 时，内部用 long[] 数组实现。
- \`add\`/\`remove\`/\`contains\` 都是位运算，极快。

\`\`\`java
EnumSet<Color> set = EnumSet.of(Color.RED, Color.GREEN);
EnumSet<Color> all = EnumSet.allOf(Color.class);
EnumSet<Color> none = EnumSet.noneOf(Color.class);
\`\`\`

## 性能优势

| 操作 | EnumMap/Set | HashMap/Set |
|------|-------------|-------------|
| 查找 | O(1) 数组下标 | O(1) hash + 比较 |
| 内存 | 紧凑数组 | 桶 + 节点对象 |
| hash 计算 | 无 | 有 |
| 冲突 | 无 | 可能有 |

## 使用场景

- **状态机**：用 EnumMap 表示状态转移表。
- **配置映射**：枚举常量到配置值。
- **标志位**：用 EnumSet 替代位标志（更类型安全）。
- **枚举分组**：EnumSet 的范围操作 \`range\`。

## 不可变性

- EnumMap 是可变的。
- EnumSet 通过 \`Collections.unmodifiableSet\` 包装可获得不可变视图。

## 注意

- 键/元素必须为同一枚举类型。
- 不允许 null 键（EnumMap 的 null 键会抛 NPE）。
- EnumSet 是抽象类，实际返回 RegularEnumSet 或 JumboEnumSet。

下面演示用法：`,
    code: `// 演示 EnumMap 与 EnumSet 的高效用法
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;

public class Main {
    // 定义枚举
    enum Color { RED, GREEN, BLUE, YELLOW }
    enum Permission { READ, WRITE, EXECUTE, DELETE }

    public static void main(String[] args) {
        // 1) EnumMap 基本用法
        Map<Color, String> colorNames = new EnumMap<>(Color.class);
        colorNames.put(Color.RED, "红色");
        colorNames.put(Color.GREEN, "绿色");
        colorNames.put(Color.BLUE, "蓝色");
        System.out.println("EnumMap: " + colorNames);
        System.out.println("RED 对应: " + colorNames.get(Color.RED));

        // 2) EnumMap 用于状态转移表
        Map<Color, Color> nextColor = new EnumMap<>(Color.class);
        nextColor.put(Color.RED, Color.GREEN);
        nextColor.put(Color.GREEN, Color.BLUE);
        nextColor.put(Color.BLUE, Color.RED);
        Color current = Color.RED;
        System.out.print("状态循环: ");
        for (int i = 0; i < 6; i++) {
            System.out.print(current + " ");
            current = nextColor.get(current);
        }
        System.out.println();

        // 3) EnumSet 各种工厂方法
        EnumSet<Color> all = EnumSet.allOf(Color.class);
        System.out.println("allOf: " + all);

        EnumSet<Color> none = EnumSet.noneOf(Color.class);
        System.out.println("noneOf: " + none);

        EnumSet<Color> of = EnumSet.of(Color.RED, Color.BLUE);
        System.out.println("of(RED, BLUE): " + of);

        // 范围：from RED to BLUE（按声明顺序）
        EnumSet<Color> range = EnumSet.range(Color.RED, Color.BLUE);
        System.out.println("range(RED, BLUE): " + range);

        // 补集
        EnumSet<Color> complement = EnumSet.complementOf(of);
        System.out.println("complementOf(RED, BLUE): " + complement);

        // 4) EnumSet 作为权限标志位
        EnumSet<Permission> userPerm = EnumSet.of(Permission.READ);
        EnumSet<Permission> adminPerm = EnumSet.allOf(Permission.class);
        System.out.println("用户权限: " + userPerm);
        System.out.println("管理员权限: " + adminPerm);

        // 集合运算
        EnumSet<Permission> canDo = EnumSet.copyOf(userPerm);
        canDo.retainAll(adminPerm); // 交集
        System.out.println("用户实际能做: " + canDo);

        // 添加权限
        userPerm.add(Permission.WRITE);
        System.out.println("赋写权限后: " + userPerm);

        // 5) EnumMap 的 keySet 顺序与枚举声明顺序一致
        for (Color c : colorNames.keySet()) {
            System.out.println("枚举顺序遍历: " + c + " -> " + colorNames.get(c));
        }
    }
}`
  },
  {
    id: "java-immutable-collections",
    group: "集合进阶",
    icon: "🔒",
    title: "不可变集合",
    content: `# 不可变集合

不可变（immutable）集合一旦创建就**不能修改**，任何修改操作都会抛出 \`UnsupportedOperationException\`。它们线程安全、内存高效、可放心共享。

## 两种创建方式

### 1. Collections.unmodifiableXXX（包装视图）

\`\`\`java
List<String> mutable = new ArrayList<>(...);
List<String> view = Collections.unmodifiableList(mutable);
\`\`\`

返回的是原集合的**只读视图**：通过 view 不能修改，但通过原 mutable 仍可修改，且 view 会反映这些变化。这不是真正的不可变。

### 2. List.of / Set.of / Map.of（Java 9+，真正不可变）

\`\`\`java
List<String> list = List.of("a", "b", "c");
Set<Integer> set = Set.of(1, 2, 3);
Map<String, Integer> map = Map.of("a", 1, "b", 2);
\`\`\`

这些方法返回**真正不可变**的集合，背后没有可变原集合，是定长、紧凑的实现。

## 不可变集合特性

- **修改抛异常**：\`add\`/\`remove\`/\`set\`/\`clear\` 等抛 \`UnsupportedOperationException\`。
- **不允许 null**：\`List.of(null)\` 抛 NPE。
- **Set.of / Map.of 不允许重复**：重复元素抛 \`IllegalArgumentException\`。
- **序列化友好**：内部实现紧凑。
- **线程安全**：无需同步即可多线程共享。

## Map.ofEntries

\`Map.of\` 最多只能传 10 对键值对。键值对更多时使用 \`Map.ofEntries\`：

\`\`\`java
Map<String, Integer> m = Map.ofEntries(
    Map.entry("a", 1),
    Map.entry("b", 2),
    Map.entry("c", 3)
);
\`\`\`

## List.of vs Arrays.asList

| 特性 | List.of | Arrays.asList |
|------|---------|---------------|
| 可变性 | 完全不可变 | 可 set，不可 add/remove |
| null 元素 | 不允许 | 允许 |
| 底层 | 专用不可变实现 | 包装传入数组 |

\`Arrays.asList\` 返回的是**固定大小**的列表，可以修改元素（\`set\`），但不能增删。它包装的是原数组，对列表的 set 会反映到数组。

## 适用场景

- 配置常量、常量列表。
- 方法返回值，防止调用方修改内部状态。
- 多线程共享的只读数据。
- 作为 Map 的键或 Set 的元素（不可变才安全）。

## 从可变转不可变

\`\`\`java
List<String> copy = List.copyOf(mutableList); // Java 10+
\`\`\`

\`List.copyOf\` / \`Set.copyOf\` / \`Map.copyOf\` 会创建不可变副本（若已是不可变则直接返回）。

下面演示行为差异：`,
    code: `// 演示不可变集合的创建与特性
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // 1) Collections.unmodifiableList：视图，原集合变它会变
        List<String> mutable = new ArrayList<>(Arrays.asList("a", "b"));
        List<String> view = Collections.unmodifiableList(mutable);
        mutable.add("c");
        System.out.println("原集合修改后，视图也变: " + view);

        // 通过视图修改会抛异常
        try {
            view.add("d");
        } catch (UnsupportedOperationException e) {
            System.out.println("unmodifiableList.add 抛出: " + e.getClass().getSimpleName());
        }

        // 2) List.of：真正不可变
        List<String> immutable = List.of("x", "y", "z");
        System.out.println("List.of: " + immutable);
        try {
            immutable.add("w");
        } catch (UnsupportedOperationException e) {
            System.out.println("List.of.add 抛出: " + e.getClass().getSimpleName());
        }
        try {
            immutable.set(0, "X");
        } catch (UnsupportedOperationException e) {
            System.out.println("List.of.set 抛出: " + e.getClass().getSimpleName());
        }

        // 3) Set.of 不允许重复
        try {
            Set.of(1, 2, 2);
        } catch (IllegalArgumentException e) {
            System.out.println("Set.of 重复元素抛出: " + e.getClass().getSimpleName());
        }

        // 4) 不允许 null
        try {
            List.of((String) null);
        } catch (NullPointerException e) {
            System.out.println("List.of(null) 抛出: " + e.getClass().getSimpleName());
        }

        // 5) Map.of 与 Map.ofEntries
        Map<String, Integer> small = Map.of("a", 1, "b", 2);
        System.out.println("Map.of: " + small);
        Map<String, Integer> big = Map.ofEntries(
            Map.entry("a", 1),
            Map.entry("b", 2),
            Map.entry("c", 3),
            Map.entry("d", 4)
        );
        System.out.println("Map.ofEntries: " + big);

        // 6) List.of vs Arrays.asList
        List<String> asList = Arrays.asList("p", "q");
        asList.set(0, "P"); // 允许 set
        System.out.println("Arrays.asList.set 后: " + asList);
        try {
            asList.add("r"); // 不允许 add
        } catch (UnsupportedOperationException e) {
            System.out.println("Arrays.asList.add 抛出: " + e.getClass().getSimpleName());
        }

        // 7) copyOf：从可变创建不可变副本
        List<String> copy = List.copyOf(mutable);
        System.out.println("List.copyOf: " + copy);
        try {
            copy.add("z");
        } catch (UnsupportedOperationException e) {
            System.out.println("copyOf.add 抛出: " + e.getClass().getSimpleName());
        }
    }
}`
  },
  {
    id: "java-collection-factory",
    group: "集合进阶",
    icon: "🏭",
    title: "集合工厂方法",
    content: `# 集合工厂方法（Java 9+）

Java 9 引入了简洁的集合工厂方法 \`List.of\`、\`Set.of\`、\`Map.of\`，用于创建**不可变**集合。

## 工厂方法一览

\`\`\`java
List.of(e1, e2, ...)          // 不可变 List
Set.of(e1, e2, ...)           // 不可变 Set
Map.of(k1, v1, k2, v2, ...)   // 不可变 Map，最多 10 对
Map.ofEntries(entry(k1,v1), ...) // 任意数量的 Map
\`\`\`

每个方法都有 0~10 个参数的重载版本（Map 是 0~10 对）。这种设计避免了 varargs 造成的数组分配。

## 不可变特性

工厂方法返回的集合都是**不可变**的：

- 不能 add / remove / set / clear。
- 修改抛 \`UnsupportedOperationException\`。
- 不允许 null 元素。
- Set.of / Map.of 不允许重复（重复抛 \`IllegalArgumentException\`）。

## vs Arrays.asList

| 特性 | List.of | Arrays.asList |
|------|---------|---------------|
| 可变性 | 完全不可变 | 可 set 不可 add/remove |
| null | 不允许 | 允许 |
| 底层 | 专用紧凑实现 | 包装原数组 |
| 与原数组关系 | 无关 | 共享底层数组 |

\`Arrays.asList("a","b")\` 包装传入的数组，对列表的 set 会修改原数组；\`List.of\` 则创建独立的不可变列表。

## vs new ArrayList

| 特性 | List.of | new ArrayList |
|------|---------|---------------|
| 可变性 | 不可变 | 可变 |
| 添加元素 | 抛异常 | 可 add |
| 内存 | 紧凑 | 包含扩容余量 |
| 适用 | 常量、只读 | 需要修改 |

需要修改时仍应使用 \`new ArrayList\`，但可以用 \`List.copyOf\` 或 \`new ArrayList<>(List.of(...))\` 包装。

## Map.of 的限制

\`Map.of\` 最多 10 对键值对。超过用 \`Map.ofEntries\`：

\`\`\`java
Map<String, Integer> m = Map.ofEntries(
    Map.entry("a", 1),
    Map.entry("b", 2),
    // ... 更多
);
\`\`\`

\`Map.entry(k, v)\` 创建一个不可变的 Entry 对象。

## 适用场景

- 配置常量：\`private static final List<String> NAMES = List.of("a","b");\`
- 测试数据：快速构造小集合。
- 方法参数：传入只读集合。
- 返回值：返回不可变结果防止篡改。

## 注意

- 工厂方法返回的具体类型未公开，不要依赖具体类。
- 空集合：\`List.of()\` 返回单例空集合 \`Collections.emptyList()\` 类似的高效实现。
- 集合元素本身若是可变对象，集合不可变不等于内容不可变。

下面演示用法：`,
    code: `// 演示 Java 9+ 集合工厂方法
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // 1) List.of 创建不可变 List
        List<String> langs = List.of("Java", "Kotlin", "Scala");
        System.out.println("List.of: " + langs);

        // 2) Set.of 创建不可变 Set
        Set<Integer> nums = Set.of(1, 2, 3, 4);
        System.out.println("Set.of: " + nums);

        // 3) Map.of 创建不可变 Map（最多 10 对）
        Map<String, Integer> prices = Map.of(
            "apple", 5,
            "banana", 3,
            "cherry", 10
        );
        System.out.println("Map.of: " + prices);

        // 4) Map.ofEntries 处理更多键值对
        Map<String, Integer> scores = Map.ofEntries(
            Map.entry("Alice", 90),
            Map.entry("Bob", 85),
            Map.entry("Carol", 92),
            Map.entry("Dave", 78),
            Map.entry("Eve", 88)
        );
        System.out.println("Map.ofEntries: " + scores);

        // 5) 不可变特性：修改抛异常
        try {
            langs.add("Python");
        } catch (UnsupportedOperationException e) {
            System.out.println("List.of.add 抛出: " + e.getClass().getSimpleName());
        }
        try {
            nums.remove(1);
        } catch (UnsupportedOperationException e) {
            System.out.println("Set.of.remove 抛出: " + e.getClass().getSimpleName());
        }
        try {
            prices.put("date", 8);
        } catch (UnsupportedOperationException e) {
            System.out.println("Map.of.put 抛出: " + e.getClass().getSimpleName());
        }

        // 6) 不允许 null
        try {
            List.of((String) null);
        } catch (NullPointerException e) {
            System.out.println("List.of(null) 抛出: " + e.getClass().getSimpleName());
        }

        // 7) Set.of 不允许重复
        try {
            Set.of(1, 1, 2);
        } catch (IllegalArgumentException e) {
            System.out.println("Set.of 重复抛出: " + e.getClass().getSimpleName());
        }

        // 8) 从不可变 List 转为可变 ArrayList
        List<String> mutable = new ArrayList<>(langs);
        mutable.add("Python");
        System.out.println("转为可变后: " + mutable);

        // 9) 配置常量典型用法
        // private static final List<String> SUPPORTED = List.of("jpg", "png", "gif");
        List<String> supported = List.of("jpg", "png", "gif");
        System.out.println("是否支持 jpg: " + supported.contains("jpg"));

        // 10) 空集合
        List<Object> empty = List.of();
        System.out.println("空 List size = " + empty.size());

        // 11) 与 Arrays.asList 对比
        String[] arr = {"a", "b"};
        List<String> asList = Arrays.asList(arr);
        asList.set(0, "A"); // 允许
        System.out.println("Arrays.asList set 后原数组: " + arr[0]); // A
        // List.of 不会影响原数组
    }
}`
  },
  {
    id: "java-comparator",
    group: "集合进阶",
    icon: "📊",
    title: "Comparator 详解",
    content: `# Comparator 详解

\`Comparator\` 是排序的策略接口，Java 8 为其加入了大量流畅的链式方法，让排序逻辑简洁可读。

## 核心方法

\`\`\`java
Comparator<T> comparing(Function<T, U> keyExtractor)
Comparator<T> comparingInt(ToIntFunction<T> keyExtractor)
Comparator<T> reversed()
Comparator<T> thenComparing(Comparator<T> other)
Comparator<T> nullsFirst(Comparator<T> real)
Comparator<T> nullsLast(Comparator<T> real)
\`\`\`

## comparing：按属性提取排序

\`\`\`java
Comparator<Person> byAge = Comparator.comparing(Person::getAge);
\`\`\`

\`comparing\` 接收一个函数，提取排序键，要求键类型实现 \`Comparable\`。基本类型有 \`comparingInt\`、\`comparingLong\`、\`comparingDouble\`，避免装箱。

## thenComparing：多字段链式排序

\`\`\`java
Comparator<Person> c = Comparator
    .comparing(Person::getAge)
    .thenComparing(Person::getName);
\`\`\`

先按 age 排，age 相同时按 name 排。可以链式拼接多个 \`thenComparing\`。

## reversed：逆序

\`\`\`java
Comparator<Person> descAge = Comparator.comparing(Person::getAge).reversed();
\`\`\`

注意 \`reversed\` 反转**前面整个**比较器链。

## naturalOrder / reverseOrder

\`\`\`java
Comparator<String> nat = Comparator.naturalOrder();   // 自然升序
Comparator<String> rev = Comparator.reverseOrder();   // 自然降序
\`\`\`

## nullsFirst / nullsLast：处理 null

\`\`\`java
Comparator<String> safe = Comparator.nullsFirst(Comparator.naturalOrder());
\`\`\`

将 null 排在最前/最后，避免排序时抛 NPE。内部比较器处理非 null 元素。

## lambda 简化

Comparator 是函数式接口，可用 lambda 直接实现：

\`\`\`java
Comparator<Person> c = (a, b) -> a.age - b.age;
\`\`\`

但 \`comparing\` 方法链更可读，推荐优先使用方法引用风格。

## 注意事项

- **比较结果必须对称、传递**：违反会破坏 TreeSet/TreeMap。
- **避免减法溢出**：\`(a, b) -> a - b\` 在基本类型可能溢出，应使用 \`Integer.compare(a, b)\` 或 \`comparingInt\`。
- **与 equals 一致性**：TreeSet 用 compare 判等，若 compare 返回 0 视为相同元素。如果 compare 不与 equals 一致，可能违反 Set 语义。

下面演示链式排序：`,
    code: `// 演示 Comparator 的链式排序与各种用法
import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Person> people = new ArrayList<>(Arrays.asList(
            new Person("Alice", 30, 5000),
            new Person("Bob", 25, 6000),
            new Person("Carol", 30, 5500),
            new Person("Dave", 25, 6000),
            new Person("Eve", 28, 0)
        ));

        // 1) comparing 按单字段排序
        people.sort(Comparator.comparing(Person::getAge));
        System.out.println("按 age 升序: " + people);

        // 2) reversed 逆序
        people.sort(Comparator.comparing(Person::getAge).reversed());
        System.out.println("按 age 降序: " + people);

        // 3) thenComparing 多字段：age 升序，age 相同按 name 升序
        people.sort(Comparator.comparing(Person::getAge)
                .thenComparing(Person::getName));
        System.out.println("age 升序 + name 升序: " + people);

        // 4) comparingInt 避免装箱
        people.sort(Comparator.comparingInt(Person::getAge)
                .thenComparingInt(Person::getSalary).reversed());
        System.out.println("age 升序 + salary 降序: " + people);

        // 5) nullsFirst / nullsLast 处理 null
        List<String> names = new ArrayList<>(Arrays.asList("Bob", null, "Alice", null, "Carol"));
        names.sort(Comparator.nullsFirst(Comparator.naturalOrder()));
        System.out.println("null 在前 + 自然序: " + names);
        names.sort(Comparator.nullsLast(Comparator.reverseOrder()));
        System.out.println("null 在后 + 逆序: " + names);

        // 6) naturalOrder / reverseOrder
        List<Integer> ints = new ArrayList<>(Arrays.asList(3, 1, 4, 1, 5, 9, 2, 6));
        ints.sort(Comparator.naturalOrder());
        System.out.println("naturalOrder: " + ints);
        ints.sort(Comparator.reverseOrder());
        System.out.println("reverseOrder: " + ints);

        // 7) lambda 简化
        people.sort((a, b) -> Integer.compare(a.age, b.age));
        System.out.println("lambda 按 age: " + people);

        // 8) 多字段链式（含 reversed 注意点）
        // age 升序，salary 降序（仅 salary 反转）
        people.sort(Comparator.comparing(Person::getAge)
                .thenComparing(Person::getSalary, Comparator.reverseOrder()));
        System.out.println("age 升 + salary 降（仅 salary 反转）: " + people);

        // 9) 注意：减法可能溢出，应使用 Integer.compare
        // 错误写法（演示用，请勿模仿）：
        // Comparator<Person> bad = (a, b) -> a.age - b.age;
    }

    static class Person {
        String name;
        int age;
        int salary;
        Person(String name, int age, int salary) {
            this.name = name; this.age = age; this.salary = salary;
        }
        String getName() { return name; }
        int getAge() { return age; }
        int getSalary() { return salary; }
        @Override
        public String toString() {
            return name + "(" + age + "," + salary + ")";
        }
    }
}`
  },
  {
    id: "java-collection-sorting",
    group: "集合进阶",
    icon: "📈",
    title: "集合排序",
    content: `# 集合排序

Java 提供多种排序方式，理解其差异有助于在不同场景选择合适方案。

## 两种主要 API

### 1. Collections.sort(list)

\`\`\`java
Collections.sort(list);                 // 自然排序
Collections.sort(list, comparator);     // 指定 Comparator
\`\`\`

\`Collections.sort\` 是静态方法，对 List 原地排序。

### 2. list.sort(comparator)（Java 8+）

\`\`\`java
list.sort(Comparator.naturalOrder());
list.sort(Comparator.comparing(Person::getAge));
\`\`\`

\`List.sort\` 是接口默认方法，更面向对象。两者底层都调用 \`Arrays.sort\`，性能一致。

## 自然排序

元素需实现 \`Comparable<T>\` 接口，重写 \`compareTo\`：

\`\`\`java
class Person implements Comparable<Person> {
    public int compareTo(Person o) { return Integer.compare(age, o.age); }
}
\`\`\`

- 返回负数：this < o
- 返回 0：this == o
- 返回正数：this > o

常用类（String、Integer、LocalDate 等）已实现 Comparable。

## Comparator 排序

临时或多种排序规则用 Comparator：

\`\`\`java
list.sort(Comparator.comparing(Person::getName).reversed());
\`\`\`

## 逆序

\`\`\`java
list.sort(Comparator.reverseOrder());                 // 自然序逆序
list.sort(Comparator.comparing(Person::getAge).reversed()); // 按字段逆序
\`\`\`

## 多字段排序

\`\`\`java
list.sort(Comparator.comparing(Person::getDept)
        .thenComparing(Person::getSalary, Comparator.reverseOrder()));
\`\`\`

先按部门升序，部门相同按薪资降序。

## 排序算法

Java 的 \`List.sort\` 内部将 List 转为数组，调用 \`Arrays.sort\`：

- 对象数组：使用 **TimSort**（归并排序的优化），稳定，O(n log n)。
- 基本类型数组：使用**双轴快速排序**，不稳定但更快。

## Stream 排序

\`stream.sorted()\` 返回新的有序流，不修改原集合：

\`\`\`java
List<Person> sorted = list.stream()
    .sorted(Comparator.comparing(Person::getAge))
    .collect(Collectors.toList());
\`\`\`

## 注意事项

- **只能排序 List**：Set 无序，TreeSet 在插入时排序；Queue 不支持排序。
- **稳定性**：TimSort 是稳定排序，相等元素保持原顺序。
- **原地修改**：\`List.sort\` 修改原列表，不返回新列表。
- **null 元素**：自然排序遇到 null 会抛 NPE，需用 \`nullsFirst\`。

下面演示各种排序：`,
    code: `// 演示集合排序的各种方式
import java.util.*;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        // 1) 自然排序：元素实现 Comparable
        List<Integer> nums = new ArrayList<>(Arrays.asList(5, 2, 8, 1, 9, 3));
        Collections.sort(nums);
        System.out.println("自然序: " + nums);

        // 2) List.sort + Comparator
        nums.sort(Comparator.reverseOrder());
        System.out.println("逆序: " + nums);

        // 3) 字符串排序
        List<String> names = new ArrayList<>(Arrays.asList("Charlie", "Alice", "Bob", "dave"));
        names.sort(Comparator.naturalOrder());
        System.out.println("字符串自然序（区分大小写）: " + names);
        names.sort(String.CASE_INSENSITIVE_ORDER);
        System.out.println("不区分大小写: " + names);

        // 4) 自定义对象自然排序
        List<Student> students = new ArrayList<>(Arrays.asList(
            new Student("Alice", 90),
            new Student("Bob", 85),
            new Student("Carol", 92)
        ));
        Collections.sort(students); // 使用 Student 的 compareTo
        System.out.println("按分数（Comparable）: " + students);

        // 5) 多字段排序：先按 grade 升序，grade 相同按 name 升序
        List<Student> s2 = new ArrayList<>(Arrays.asList(
            new Student("Zoe", 85),
            new Student("Alice", 90),
            new Student("Bob", 85),
            new Student("Carol", 90)
        ));
        s2.sort(Comparator.comparing(Student::getScore)
                .thenComparing(Student::getName));
        System.out.println("多字段排序: " + s2);

        // 6) Stream sorted 返回新集合
        List<Student> sorted = s2.stream()
            .sorted(Comparator.comparing(Student::getName).reversed())
            .collect(Collectors.toList());
        System.out.println("Stream 排序（不改原集合）: " + sorted);
        System.out.println("原集合未变: " + s2.get(0).name);

        // 7) null 处理
        List<String> withNull = new ArrayList<>(Arrays.asList("b", null, "a", null, "c"));
        withNull.sort(Comparator.nullsFirst(Comparator.naturalOrder()));
        System.out.println("null 在前: " + withNull);

        // 8) 稳定性测试：相等元素保持原顺序
        List<Student> stab = new ArrayList<>(Arrays.asList(
            new Student("A1", 80),
            new Student("A2", 80),
            new Student("A3", 80)
        ));
        stab.sort(Comparator.comparing(Student::getScore));
        System.out.println("稳定排序保持原序: " + stab);

        // 9) 部分排序：subList 排序
        List<Integer> sub = new ArrayList<>(Arrays.asList(9, 7, 5, 3, 1, 2, 4, 6, 8));
        sub.subList(0, 5).sort(Comparator.naturalOrder());
        System.out.println("前半段排序: " + sub);
    }

    static class Student implements Comparable<Student> {
        String name;
        int score;
        Student(String name, int score) { this.name = name; this.score = score; }
        int getScore() { return score; }
        String getName() { return name; }
        @Override
        public int compareTo(Student o) {
            return Integer.compare(this.score, o.score); // 升序
        }
        @Override
        public String toString() { return name + ":" + score; }
    }
}`
  },
  {
    id: "java-collection-search",
    group: "集合进阶",
    icon: "🔎",
    title: "集合查找",
    content: `# 集合查找

不同集合类型的查找方式与性能差异显著，理解其原理有助于选择正确方法。

## 线性查找：contains / indexOf

- \`List.contains(o)\`：线性扫描，O(n)。
- \`List.indexOf(o)\`：返回第一次出现的索引，O(n)。
- \`Set.contains(o)\`：HashSet O(1)，TreeSet O(log n)。
- \`Map.containsKey(k)\` / \`Map.containsValue(v)\`：前者 O(1)（HashMap），后者 O(n)。

## 二分查找：Collections.binarySearch

\`\`\`java
int idx = Collections.binarySearch(sortedList, key);
\`\`\`

**前提：列表必须已按升序排序**（自然序或 Comparator 序）。

- 找到：返回元素索引（≥0）。
- 未找到：返回 \`-(插入点 + 1)\`，插入点是 key 应插入的位置。
- 时间复杂度 O(log n)。

使用 Comparator 时需传入与排序相同的 Comparator：

\`\`\`java
int idx = Collections.binarySearch(list, key, comparator);
\`\`\`

## Stream 查找

\`\`\`java
boolean found = list.stream().anyMatch(x -> x > 10);
Optional<Integer> first = list.stream().filter(x -> x > 10).findFirst();
\`\`\`

Stream 查找是线性扫描，但表达力强、可链式操作。

## 性能对比

| 操作 | ArrayList | LinkedList | HashSet | TreeSet | HashMap |
|------|-----------|-----------|---------|---------|---------|
| contains | O(n) | O(n) | O(1) | O(log n) | - |
| containsKey | - | - | - | - | O(1) |
| containsValue | - | - | - | - | O(n) |
| indexOf | O(n) | O(n) | - | - | - |
| binarySearch | O(log n) | O(n) | - | - | - |

## 选择指南

- **频繁按值查找** → 用 HashSet/HashMap，O(1)。
- **有序列表按值查找** → 先排序，用 \`binarySearch\`，O(log n)。
- **查找满足条件的元素** → Stream + filter。
- **按 key 查找** → HashMap，O(1)。
- **范围查找** → TreeMap 的 \`subMap\`/\`headMap\`/\`tailMap\`，或 TreeSet 的对应方法。

## 注意事项

- **binarySearch 前必须排序**：未排序结果未定义。
- **LinkedList 不适合 binarySearch**：虽然算法是 O(log n) 比较，但随机访问是 O(n)，总复杂度 O(n log n)。
- **containsValue 性能差**：HashMap 的 containsValue 是 O(n)，避免在性能敏感场景使用。
- **TreeSet 范围查找高效**：\`subSet(from, to)\` 是 O(log n)。

下面演示各种查找：`,
    code: `// 演示集合查找的各种方法与性能
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // 1) List 的 contains / indexOf
        List<String> list = new ArrayList<>(Arrays.asList("apple", "banana", "cherry", "date"));
        System.out.println("contains banana: " + list.contains("banana"));
        System.out.println("indexOf cherry: " + list.indexOf("cherry"));
        System.out.println("indexOf grape (不存在): " + list.indexOf("grape"));

        // 2) Set 的 contains：O(1)
        Set<String> set = new HashSet<>(list);
        System.out.println("Set.contains banana: " + set.contains("banana"));

        // 3) Map 的查找
        Map<String, Integer> map = new HashMap<>();
        map.put("apple", 5);
        map.put("banana", 3);
        System.out.println("containsKey apple: " + map.containsKey("apple"));
        System.out.println("containsValue 3: " + map.containsValue(3));
        System.out.println("containsValue 99: " + map.containsValue(99));

        // 4) 二分查找：必须先排序
        List<Integer> sorted = new ArrayList<>(Arrays.asList(1, 3, 5, 7, 9, 11, 13, 15));
        int idx = Collections.binarySearch(sorted, 7);
        System.out.println("binarySearch 7: 索引=" + idx);
        int notFound = Collections.binarySearch(sorted, 8);
        System.out.println("binarySearch 8（不存在）: " + notFound + "（插入点=" + (-notFound - 1) + "）");

        // 5) 自定义对象二分查找（需按同 Comparator 排序）
        List<Point> points = new ArrayList<>(Arrays.asList(
            new Point(1, 1), new Point(3, 3), new Point(5, 5), new Point(7, 7)
        ));
        Comparator<Point> cmp = Comparator.comparingInt(p -> p.x);
        points.sort(cmp);
        int pi = Collections.binarySearch(points, new Point(5, 0), cmp);
        System.out.println("Point x=5 索引: " + pi);

        // 6) Stream 查找
        List<Integer> data = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        boolean anyBig = data.stream().anyMatch(x -> x > 8);
        System.out.println("anyMatch > 8: " + anyBig);
        Optional<Integer> first = data.stream().filter(x -> x > 5).findFirst();
        System.out.println("findFirst > 5: " + first.orElse(-1));
        long count = data.stream().filter(x -> x % 2 == 0).count();
        System.out.println("偶数个数: " + count);

        // 7) TreeSet 范围查找
        TreeSet<Integer> tree = new TreeSet<>(Arrays.asList(1, 3, 5, 7, 9, 11, 13));
        System.out.println("subSet(3, 9): " + tree.subSet(3, 9));   // [3,5,7]
        System.out.println("headSet(7): " + tree.headSet(7));       // [1,3,5]
        System.out.println("tailSet(7): " + tree.tailSet(7));       // [7,9,11,13]
        System.out.println("ceiling(6): " + tree.ceiling(6));       // 7
        System.out.println("floor(6): " + tree.floor(6));           // 5

        // 8) 性能对比：List.contains vs Set.contains
        Set<Integer> bigSet = new HashSet<>();
        List<Integer> bigList = new ArrayList<>();
        for (int i = 0; i < 100000; i++) {
            bigSet.add(i);
            bigList.add(i);
        }
        long t1 = System.nanoTime();
        for (int i = 0; i < 10000; i++) bigSet.contains(99999);
        long t2 = System.nanoTime();
        long t3 = System.nanoTime();
        for (int i = 0; i < 10000; i++) bigList.contains(99999);
        long t4 = System.nanoTime();
        System.out.println("HashSet contains 1w 次: " + (t2 - t1) / 1_000_000 + " ms");
        System.out.println("ArrayList contains 1w 次: " + (t4 - t3) / 1_000_000 + " ms");
    }

    static class Point {
        int x, y;
        Point(int x, int y) { this.x = x; this.y = y; }
        @Override
        public String toString() { return "(" + x + "," + y + ")"; }
    }
}`
  },
  {
    id: "java-collection-conversion",
    group: "集合进阶",
    icon: "🔄",
    title: "集合转换",
    content: `# 集合转换

实际开发中经常需要在不同集合类型之间转换，掌握常用模式能显著提升编码效率。

## List ↔ Set

\`\`\`java
// List 转 Set（去重）
Set<String> set = new HashSet<>(list);
Set<String> linked = new LinkedHashSet<>(list); // 保留顺序
Set<String> sorted = new TreeSet<>(list);        // 排序

// Set 转 List
List<String> list = new ArrayList<>(set);
\`\`\`

构造器接收 Collection 是最通用的转换方式。

## Map → List

\`\`\`java
// Map 的 key/value/entry 转 List
List<K> keys = new ArrayList<>(map.keySet());
List<V> values = new ArrayList<>(map.values());
List<Map.Entry<K, V>> entries = new ArrayList<>(map.entrySet());
\`\`\`

## 数组 ↔ 集合

\`\`\`java
// 数组转 List
List<String> list = Arrays.asList(array);       // 固定大小，共享数组
List<String> list = new ArrayList<>(Arrays.asList(array)); // 可变
List<String> list = List.of(array);             // 不可变（Java 9+）

// 集合转数组
String[] arr = list.toArray(new String[0]);     // 推荐
String[] arr = list.toArray(String[]::new);     // 方法引用（Java 11+）
\`\`\`

**注意 \`Arrays.asList\` 的陷阱**：返回的 List 固定大小，不能 add/remove；且与原数组共享数据，set 会修改原数组。需要可变 List 应包装一层 \`new ArrayList<>(...)\`。

## Stream 转换

Stream 是灵活的转换工具：

\`\`\`java
// List 转 Map
Map<String, Integer> map = list.stream()
    .collect(Collectors.toMap(Person::getName, Person::getAge));

// List 分组
Map<String, List<Person>> grouped = list.stream()
    .collect(Collectors.groupingBy(Person::getDept));

// List 转 Map（处理重复 key）
Map<String, Integer> map = list.stream()
    .collect(Collectors.toMap(Person::getName, Person::getAge, (a, b) -> a));

// Map 转 List
List<Person> people = map.entrySet().stream()
    .map(e -> new Person(e.getKey(), e.getValue()))
    .collect(Collectors.toList());
\`\`\`

## 常用模式

### 去重保序

\`\`\`java
List<String> unique = new ArrayList<>(new LinkedHashSet<>(list));
\`\`\`

### List 转以某字段为 key 的 Map

\`\`\`java
Map<Integer, Person> byId = list.stream()
    .collect(Collectors.toMap(Person::getId, p -> p));
\`\`\`

### Map 按 value 排序

\`\`\`java
Map<String, Integer> sorted = map.entrySet().stream()
    .sorted(Map.Entry.comparingByValue())
    .collect(Collectors.toMap(
        Map.Entry::getKey, Map.Entry::getValue,
        (a, b) -> a, LinkedHashMap::new));
\`\`\`

## 注意事项

- **类型擦除**：\`toArray()\` 不带参数返回 \`Object[]\`，不能直接强转 \`String[]\`。
- **不可变集合**：\`List.of\` 转出的 List 不能修改。
- **toMap 重复 key**：会抛 \`IllegalStateException\`，需提供合并函数。
- **修改视图**：\`subList\`、\`entrySet\`、\`keySet\` 是视图，修改会影响原集合。

下面演示常用转换：`,
    code: `// 演示集合之间的常用转换
import java.util.*;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        // 1) List 转 Set（去重）
        List<String> list = Arrays.asList("a", "b", "a", "c", "b");
        Set<String> hashSet = new HashSet<>(list);
        System.out.println("HashSet 去重: " + hashSet);
        Set<String> linkedSet = new LinkedHashSet<>(list); // 保留顺序
        System.out.println("LinkedHashSet 保序去重: " + linkedSet);

        // 2) Set 转 List
        List<String> fromSet = new ArrayList<>(linkedSet);
        System.out.println("Set 转 List: " + fromSet);

        // 3) Map 转 List
        Map<String, Integer> map = new HashMap<>();
        map.put("a", 1); map.put("b", 2); map.put("c", 3);
        List<String> keys = new ArrayList<>(map.keySet());
        List<Integer> values = new ArrayList<>(map.values());
        List<Map.Entry<String, Integer>> entries = new ArrayList<>(map.entrySet());
        System.out.println("keys: " + keys + ", values: " + values);
        System.out.println("entries: " + entries);

        // 4) 数组转 List
        String[] arr = {"x", "y", "z"};
        List<String> asList = Arrays.asList(arr); // 固定大小
        System.out.println("Arrays.asList: " + asList);
        List<String> mutable = new ArrayList<>(Arrays.asList(arr)); // 可变
        mutable.add("w");
        System.out.println("可变 List: " + mutable);

        // 5) 集合转数组
        List<String> l = Arrays.asList("a", "b", "c");
        String[] array1 = l.toArray(new String[0]); // 推荐写法
        String[] array2 = l.toArray(String[]::new); // Java 11+
        System.out.println("toArray: " + Arrays.toString(array1));

        // 6) Stream: List 转 Map
        List<Employee> emps = Arrays.asList(
            new Employee(1, "Alice", "IT"),
            new Employee(2, "Bob", "HR"),
            new Employee(3, "Carol", "IT")
        );
        Map<Integer, String> idToName = emps.stream()
            .collect(Collectors.toMap(Employee::getId, Employee::getName));
        System.out.println("id→name: " + idToName);

        // 7) Stream: 分组
        Map<String, List<Employee>> byDept = emps.stream()
            .collect(Collectors.groupingBy(Employee::getDept));
        System.out.println("按部门分组: " + byDept);

        // 8) Stream: 处理重复 key
        List<Employee> dup = Arrays.asList(
            new Employee(1, "A", "IT"),
            new Employee(1, "B", "HR")
        );
        Map<Integer, String> merged = dup.stream()
            .collect(Collectors.toMap(Employee::getId, Employee::getName, (a, b) -> a + "," + b));
        System.out.println("合并重复 key: " + merged);

        // 9) Map 按 value 排序转 LinkedHashMap
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Alice", 90); scores.put("Bob", 85); scores.put("Carol", 95);
        Map<String, Integer> sorted = scores.entrySet().stream()
            .sorted(Map.Entry.comparingByValue())
            .collect(Collectors.toMap(
                Map.Entry::getKey, Map.Entry::getValue,
                (a, b) -> a, LinkedHashMap::new));
        System.out.println("按分数排序: " + sorted);

        // 10) Map 转 List of 对象
        List<Employee> fromMap = map.entrySet().stream()
            .map(e -> new Employee(0, e.getKey(), e.getValue() + ""))
            .collect(Collectors.toList());
        System.out.println("Map 转 List: " + fromMap);
    }

    static class Employee {
        int id; String name; String dept;
        Employee(int id, String name, String dept) {
            this.id = id; this.name = name; this.dept = dept;
        }
        int getId() { return id; }
        String getName() { return name; }
        String getDept() { return dept; }
        @Override
        public String toString() { return id + ":" + name + "(" + dept + ")"; }
    }
}`
  },
  {
    id: "java-collection-performance",
    group: "集合进阶",
    icon: "⚡",
    title: "集合性能",
    content: `# 集合性能

选择合适的集合类型对性能至关重要。下表总结常用操作的时间复杂度，并给出选择指南。

## 时间复杂度表

| 操作 | ArrayList | LinkedList | ArrayDeque | HashSet | TreeSet | HashMap | TreeMap |
|------|-----------|-----------|-----------|---------|---------|---------|---------|
| add(尾) | O(1)* | O(1) | O(1) | O(1) | O(log n) | O(1) | O(log n) |
| add(头) | O(n) | O(1) | O(1) | - | - | - | - |
| add(中) | O(n) | O(n)** | - | - | - | - | - |
| remove(索引) | O(n) | O(n)** | - | - | - | - | - |
| get(i) | O(1) | O(n) | O(n) | - | - | - | - |
| contains | O(n) | O(n) | O(n) | O(1) | O(log n) | - | - |
| get/put key | - | - | - | - | - | O(1) | O(log n) |

\* ArrayList 的 add 末尾为均摊 O(1)，扩容时为 O(n)。
\** LinkedList 的 add/remove 在已知 Node 时为 O(1)，但按索引访问是 O(n)。

## 选择指南

### List 选择

- **首选 ArrayList**：随机访问 O(1)，内存紧凑，缓存友好。
- **避免 LinkedList**：除非需要在头部频繁增删，且能直接持有 Node。即便如此，ArrayDeque 通常更优。
- **预知容量**：\`new ArrayList<>(expectedSize)\` 避免多次扩容。

### Set 选择

- **去重，无序** → HashSet，O(1)。
- **去重 + 有序** → TreeSet，O(log n)。
- **去重 + 保留插入顺序** → LinkedHashSet。

### Map 选择

- **通用** → HashMap。
- **需要按键排序** → TreeMap。
- **保留插入/访问顺序** → LinkedHashMap（LRU 用 accessOrder=true）。
- **并发** → ConcurrentHashMap。

### Queue 选择

- **栈** → ArrayDeque。
- **FIFO 队列** → ArrayDeque。
- **阻塞队列** → ArrayBlockingQueue / LinkedBlockingQueue。
- **优先级** → PriorityQueue。

## 性能优化建议

### 1. 设置初始容量

\`\`\`java
List<String> list = new ArrayList<>(10000);
Map<String, String> map = new HashMap<>(16384); // 10000/0.75+1
\`\`\`

避免多次扩容（每次扩容复制整个数组）。

### 2. 避免自动装箱

\`\`\`java
// 慢：每次 put 都装箱
Map<Integer, String> map = new HashMap<>();
for (int i = 0; i < 1000000; i++) map.put(i, "v");

// 快：使用专门库（如 Eclipse Collections、Trove）的 IntObjectHashMap
\`\`\`

基本类型集合考虑第三方库，或用数组。

### 3. 增强 for 与索引

- ArrayList：for-each 与索引性能相当。
- LinkedList：**绝对避免**索引循环（O(n²)），用 for-each 或迭代器。

### 4. 并发考虑

- 单线程：普通集合。
- 高并发读：CopyOnWriteArrayList、ConcurrentHashMap。
- 高并发读写：ConcurrentHashMap、ConcurrentLinkedQueue。
- **不要**用 \`Collections.synchronizedXXX\` 包裹后再多线程遍历，性能差且易错。

### 5. 批量操作

\`addAll\`、\`removeAll\`、\`retainAll\` 比循环单个 add/remove 高效。

下面通过代码对比常见性能差异：`,
    code: `// 演示集合性能差异与优化建议
import java.util.*;

public class Main {
    public static void main(String[] args) {
        int n = 100_000;

        // 1) ArrayList vs LinkedList 头部插入
        List<Integer> arrList = new ArrayList<>();
        List<Integer> linkList = new LinkedList<>();
        long t1 = System.nanoTime();
        for (int i = 0; i < n; i++) arrList.add(0, i); // 头部插入 O(n)
        long t2 = System.nanoTime();
        for (int i = 0; i < n; i++) linkList.add(0, i); // 头部插入 O(1)
        long t3 = System.nanoTime();
        System.out.println("ArrayList 头部插 " + n + ": " + (t2 - t1) / 1_000_000 + " ms");
        System.out.println("LinkedList 头部插 " + n + ": " + (t3 - t2) / 1_000_000 + " ms");

        // 2) 索引遍历：ArrayList vs LinkedList
        List<Integer> a1 = new ArrayList<>();
        List<Integer> l1 = new LinkedList<>();
        for (int i = 0; i < 50000; i++) { a1.add(i); l1.add(i); }
        long t4 = System.nanoTime();
        long sum1 = 0;
        for (int i = 0; i < 50000; i++) sum1 += a1.get(i); // O(1)
        long t5 = System.nanoTime();
        long sum2 = 0;
        for (int i = 0; i < 50000; i++) sum2 += l1.get(i); // O(n) 每次
        long t6 = System.nanoTime();
        System.out.println("ArrayList 索引遍历 5w: " + (t5 - t4) / 1_000_000 + " ms");
        System.out.println("LinkedList 索引遍历 5w: " + (t6 - t5) / 1_000_000 + " ms (O(n²) 慎用)");

        // 3) for-each 遍历：两者性能接近
        long t7 = System.nanoTime();
        long s3 = 0;
        for (int x : l1) s3 += x;
        long t8 = System.nanoTime();
        System.out.println("LinkedList for-each 遍历 5w: " + (t8 - t7) / 1_000_000 + " ms (O(n))");

        // 4) HashSet vs ArrayList 查找
        Set<Integer> set = new HashSet<>();
        List<Integer> list = new ArrayList<>();
        for (int i = 0; i < 100000; i++) { set.add(i); list.add(i); }
        long t9 = System.nanoTime();
        for (int i = 0; i < 10000; i++) set.contains(99999); // O(1)
        long t10 = System.nanoTime();
        for (int i = 0; i < 10000; i++) list.contains(99999); // O(n)
        long t11 = System.nanoTime();
        System.out.println("HashSet contains 1w 次: " + (t10 - t9) / 1_000_000 + " ms");
        System.out.println("ArrayList contains 1w 次: " + (t11 - t10) / 1_000_000 + " ms");

        // 5) 初始容量对 HashMap 的影响
        int count = 1_000_000;
        long t12 = System.nanoTime();
        Map<Integer, String> m1 = new HashMap<>(); // 默认 16，多次扩容
        for (int i = 0; i < count; i++) m1.put(i, "v");
        long t13 = System.nanoTime();
        Map<Integer, String> m2 = new HashMap<>(count * 4 / 3 + 1); // 预设容量
        for (int i = 0; i < count; i++) m2.put(i, "v");
        long t14 = System.nanoTime();
        System.out.println("HashMap 默认容量 put " + count + ": " + (t13 - t12) / 1_000_000 + " ms");
        System.out.println("HashMap 预设容量 put " + count + ": " + (t14 - t13) / 1_000_000 + " ms");

        // 6) 自动装箱开销演示
        long t15 = System.nanoTime();
        Map<Integer, String> m3 = new HashMap<>(count * 4 / 3 + 1);
        for (int i = 0; i < count; i++) m3.put(Integer.valueOf(i), "v"); // 显式装箱
        long t16 = System.nanoTime();
        System.out.println("显式装箱 put " + count + ": " + (t16 - t15) / 1_000_000 + " ms (与自动装箱相同)");

        System.out.println("结论: ArrayList 随机访问优, HashSet 查找优, 预设容量避免扩容");
    }
}`
  }
];
