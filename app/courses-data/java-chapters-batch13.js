// =============================================================
// Java 交互式教程 —— 第十三批章节（集合框架深入组，共 15 章）
// =============================================================

export const chapters = [
  {
    id: "java-collection-hierarchy",
    group: "集合框架深入",
    icon: "🌳",
    title: "集合框架概览",
    content: `# 集合框架概览

Java 集合框架（Java Collections Framework，JCF）是一套统一的容器 API，用于存储和操作一组对象。它位于 \`java.util\` 包下，是 Java 开发中使用最频繁的基础设施。

## 集合 vs 数组

数组长度固定、类型单一、功能有限；集合长度可变、API 丰富：

\`\`\`java
String[] arr = new String[3];       // 固定长度
List<String> list = new ArrayList<>(); // 动态扩容
\`\`\`

数组可以存基本类型，集合只能存对象（基本类型需装箱为包装类）。

## 两大顶层接口：Collection 与 Map

集合框架的根接口是 **Collection** 和 **Map**。Collection 单列存放元素，Map 双列存放键值对。

Collection 继承自 \`Iterable\`，因此所有 Collection 都可被 for-each 遍历。

## Collection 体系

- **List**：有序、可重复，按索引访问。代表：ArrayList、LinkedList。
- **Set**：无序（部分实现有序）、不可重复。代表：HashSet、TreeSet、LinkedHashSet。
- **Queue**：队列，FIFO 为主。代表：ArrayDeque、LinkedList。
- **Deque**：双端队列，两端均可入队出队，可作栈使用。

## Map 体系

Map 不属于 Collection，但属于集合框架的一部分：

- **HashMap**：哈希表，无序，最常用。
- **LinkedHashMap**：维护插入/访问顺序。
- **TreeMap**：基于红黑树，按键排序。

## Iterable 接口

\`Iterable\` 是 for-each 语法的基础，实现该接口即可被增强 for 循环遍历：

\`\`\`java
for (String s : list) { // 编译器通过 Iterable 生成迭代代码
    System.out.println(s);  // 打印一行到标准输出（自动换行）
}
\`\`\`

\`Iterable\` 的 \`iterator()\` 返回 \`Iterator\`，这是集合遍历的统一抽象。

## 选择指南

- 频繁随机访问 → ArrayList
- 频繁头尾增删 → ArrayDeque / LinkedList
- 去重 → HashSet（快）/ TreeSet（有序）
- 键值映射 → HashMap（无序）/ TreeMap（有序键）
- 线程安全 → ConcurrentHashMap / CopyOnWriteArrayList
- LRU 缓存 → LinkedHashMap（accessOrder）

下面通过代码演示集合体系的整体结构：`,
    code: `// 演示 Java 集合框架的整体体系结构
import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) {
        // ===== Collection 体系 =====
        // List：有序可重复
        List<String> list = new ArrayList<>(Arrays.asList("A", "B", "A"));
        System.out.println("List(可重复): " + list);

        // Set：不可重复
        Set<String> set = new HashSet<>(Arrays.asList("A", "B", "A"));
        System.out.println("Set(去重): " + set);

        // Queue：先进先出队列
        Queue<String> queue = new LinkedList<>();
        queue.offer("甲");
        queue.offer("乙");
        System.out.println("Queue 出队: " + queue.poll());

        // Deque：双端队列，可当栈
        Deque<String> stack = new ArrayDeque<>();
        stack.push("第一");
        stack.push("第二");
        System.out.println("Deque 出栈: " + stack.pop());

        // ===== Map 体系 =====
        Map<String, Integer> hashMap = new HashMap<>();
        hashMap.put("apple", 3);
        hashMap.put("banana", 5);
        System.out.println("HashMap: " + hashMap);

        // 按键排序的 Map
        Map<String, Integer> treeMap = new TreeMap<>(hashMap);
        System.out.println("TreeMap(按 key 排序): " + treeMap);

        // 维护插入顺序的 Map
        Map<String, Integer> linkedMap = new LinkedHashMap<>(hashMap);
        System.out.println("LinkedHashMap(插入顺序): " + linkedMap);

        // ===== Iterable 与 for-each =====
        // 所有 Collection 都是 Iterable
        Iterable<String> it = list;
        for (String s : it) {
            System.out.print(s + " ");
        }
        System.out.println();

        // ===== 线程安全集合示例 =====
        List<Integer> syncList = new CopyOnWriteArrayList<>();
        syncList.add(1);
        syncList.add(2);
        System.out.println("线程安全 List: " + syncList);

        // ===== 集合 vs 数组对比 =====
        String[] array = {"X", "Y"};
        System.out.println("数组长度固定: " + array.length);
        list.add("Z"); // 集合可动态扩容
        System.out.println("List 动态长度: " + list.size());
    }
}`
  },
  {
    id: "java-list-interface",
    group: "集合框架深入",
    icon: "📋",
    title: "List 接口",
    content: `# List 接口

\`List\` 是 Collection 的子接口，表示**有序、可重复**的序列。它通过整数索引访问元素，索引从 0 开始。

## 核心特性

- **有序**：保留元素的插入顺序
- **可重复**：允许相同元素多次出现
- **索引访问**：可通过下标精确定位元素
- **可包含 null**：允许多个 null

## 主要方法

\`\`\`java
boolean add(E e);              // 末尾追加
void add(int index, E e);      // 在指定位置插入
E get(int index);              // 按索引读取
E set(int index, E e);         // 替换指定位置元素，返回旧值
E remove(int index);           // 按索引删除
int indexOf(Object o);         // 第一次出现的索引，找不到返回 -1
int lastIndexOf(Object o);     // 最后一次出现的索引
List<E> subList(int from, int to); // 子列表（视图）
\`\`\`

## add(int, E) 与 set(int, E) 区别

\`add(index, e)\` 在该位置**插入**，原位置及之后元素后移；\`set(index, e)\` 是**替换**，不改变列表长度。

## subList 注意事项

\`subList\` 返回的是**原列表的视图**，对子列表的修改会反映到原列表，反之亦然。若原列表结构发生改变（增删），子列表将失效并抛出 \`ConcurrentModificationException\`。

## ArrayList vs LinkedList 选择

| 场景 | 推荐 |
|------|------|
| 随机访问 get/set 频繁 | ArrayList |
| 末尾增删为主 | ArrayList |
| 频繁在头部插入删除 | LinkedList |
| 需要当队列/双端队列使用 | LinkedList / ArrayDeque |
| 内存敏感 | ArrayList（连续内存更紧凑） |

绝大多数业务场景下 **ArrayList 是首选**。LinkedList 仅在头尾频繁增删时有优势，但其节点对象开销大、缓存不友好，实际使用中常常不如 ArrayList。

下面通过代码演示 List 的常用操作：`,
    code: `// 演示 List 接口的常用操作
import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>(Arrays.asList("Java", "Python", "Go"));

        // 末尾追加
        list.add("Rust");
        System.out.println("追加后: " + list);

        // 指定位置插入，原元素后移
        list.add(1, "C++");
        System.out.println("索引1插入: " + list);

        // 按索引读取
        System.out.println("get(2) = " + list.get(2));

        // 替换指定位置元素
        String old = list.set(0, "Java 17");
        System.out.println("set 替换旧值: " + old + " -> " + list);

        // 按索引删除
        list.remove(3);
        System.out.println("删除索引3: " + list);

        // indexOf / lastIndexOf
        list.add("Java 17");
        System.out.println("第一次出现: " + list.indexOf("Java 17"));
        System.out.println("最后一次出现: " + list.lastIndexOf("Java 17"));

        // subList 视图
        List<String> sub = list.subList(0, 2);
        System.out.println("子列表: " + sub);
        sub.set(0, "Java 21"); // 修改子列表会影响原列表
        System.out.println("修改子列表后原列表: " + list);

        // ===== ArrayList vs LinkedList 性能对比 =====
        List<Integer> array = new ArrayList<>();
        List<Integer> linked = new LinkedList<>();

        long t1 = System.nanoTime();
        for (int i = 0; i < 100000; i++) array.add(i);
        long t2 = System.nanoTime();
        for (int i = 0; i < 100000; i++) linked.add(i);
        long t3 = System.nanoTime();
        System.out.println("ArrayList 末尾追加10w: " + (t2 - t1) / 1_000_000 + " ms");
        System.out.println("LinkedList 末尾追加10w: " + (t3 - t2) / 1_000_000 + " ms");

        // 随机访问性能
        long t4 = System.nanoTime();
        array.get(50000);
        long t5 = System.nanoTime();
        linked.get(50000);
        long t6 = System.nanoTime();
        System.out.println("ArrayList 随机访问: " + (t5 - t4) + " ns");
        System.out.println("LinkedList 随机访问: " + (t6 - t5) + " ns");
    }
}`
  },
  {
    id: "java-arraylist",
    group: "集合框架深入",
    icon: "📊",
    title: "ArrayList 深入",
    content: `# ArrayList 深入

\`ArrayList\` 是基于**动态数组**实现的 List，是 Java 中最常用的集合之一。它通过数组存储元素，在容量不足时自动扩容。

## 底层结构

\`\`\`java
transient Object[] elementData; // 真正存储元素的数组
private int size;               // 实际元素个数
\`\`\`

数组与 size 分离：\`elementData.length\` 是当前容量，\`size\` 是实际元素数。

## 初始容量

- 无参构造：JDK 8 起使用**空数组** \`DEFAULTCAPACITY_EMPTY_ELEMENTDATA\`，首次 add 时才扩容到 10
- 指定容量：\`new ArrayList<>(100)\` 直接创建容量 100 的数组
- 从集合构造：按集合大小初始化

**预知元素数量时建议指定初始容量**，避免多次扩容复制。

## 扩容机制

当 \`size + 1 > elementData.length\` 时触发扩容：

1. 计算新容量：\`newCapacity = oldCapacity + (oldCapacity >> 1)\`，即 **1.5 倍**
2. 调用 \`Arrays.copyOf\` 将旧元素拷贝到新数组
3. 旧数组等待 GC

\`\`\`java
int newCapacity = oldCapacity + (oldCapacity >> 1); // 扩容 1.5 倍
\`\`\`

扩容是 O(n) 操作，但均摊后 add 仍为 O(1)。

## 性能特征

| 操作 | 时间复杂度 |
|------|-----------|
| 末尾 add | 均摊 O(1) |
| 中间 add/remove | O(n) |
| get/set | O(1) |
| contains | O(n) |

随机访问 O(1) 是 ArrayList 的最大优势，因为它直接通过数组下标取值。

## 序列化

\`elementData\` 用 \`transient\` 修饰，不参与默认序列化。ArrayList 自定义 \`writeObject/readObject\`，只序列化 \`size\` 范围内的元素，避免序列化末尾的 null 占位，节省空间。

## 非线程安全

ArrayList **非线程安全**。多线程并发修改可能导致数据错乱、\`ArrayIndexOutOfBoundsException\` 或 \`ConcurrentModificationException\`。可使用：

- \`Collections.synchronizedList\` 包装
- \`CopyOnWriteArrayList\`（写时复制，读多写少场景）

下面通过代码演示 ArrayList 的容量与扩容行为：`,
    code: `// 演示 ArrayList 的容量、扩容与随机访问特性
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // 无参构造：首次 add 前是空数组（容量 0），首次 add 后扩到 10
        ArrayList<Integer> list = new ArrayList<>();
        System.out.println("新建后 size: " + list.size() + "（内部容量为 0，首次 add 才分配）");
        list.add(1);
        System.out.println("首次 add 后 size: " + list.size() + "（内部容量扩到 10）");

        // 指定初始容量
        ArrayList<Integer> list2 = new ArrayList<>(100);
        System.out.println("指定容量100, size: " + list2.size() + "（内部容量为 100）");

        // 演示 1.5 倍扩容：默认容量 10，填满后扩到 15
        ArrayList<Integer> list3 = new ArrayList<>();
        list3.add(1); // 容量从 0 扩到 10
        System.out.println("首次 add 后 size: " + list3.size() + "（容量 10）");
        for (int i = 0; i < 9; i++) list3.add(i); // 填满 10
        System.out.println("填满10后 size: " + list3.size() + "（容量仍为 10）");
        list3.add(99); // 触发再次扩容，10 -> 15
        System.out.println("再次扩容后 size: " + list3.size() + "（容量 10*1.5=15）");

        // 随机访问 O(1)
        List<Integer> big = new ArrayList<>();
        for (int i = 0; i < 1_000_000; i++) big.add(i);
        long t1 = System.nanoTime();
        int x = big.get(500_000);
        long t2 = System.nanoTime();
        System.out.println("100w 元素 get(500000): " + (t2 - t1) + " ns (O(1))");

        // 中间插入 O(n)
        long t3 = System.nanoTime();
        big.add(500_000, -1);
        long t4 = System.nanoTime();
        System.out.println("100w 元素中间插入: " + (t4 - t3) / 1_000_000 + " ms (O(n))");

        // ensureCapacity 手动预分配（减少扩容次数）
        ArrayList<Integer> list4 = new ArrayList<>();
        list4.ensureCapacity(10000);
        System.out.println("ensureCapacity(10000) 后 size: " + list4.size() + "（预分配容量 10000）");

        // trimToSize 回收多余空间
        list4.add(1);
        list4.trimToSize();
        System.out.println("trimToSize 后 size: " + list4.size() + "（容量缩减到 1）");

        // 说明：ArrayList 内部用 Object[] elementData 存储元素，
        // 容量(capacity) >= size，扩容公式为 newCapacity = oldCapacity + oldCapacity >> 1（即 1.5 倍）。
        // Java 16+ 限制了对 ArrayList 内部字段的反射访问，因此这里通过 size 和说明演示容量行为。
    }
}`
  },
  {
    id: "java-linkedlist",
    group: "集合框架深入",
    icon: "🔗",
    title: "LinkedList 深入",
    content: `# LinkedList 深入

\`LinkedList\` 是基于**双向链表**实现的 List，同时实现了 \`Deque\` 接口，可作为列表、队列、双端队列或栈使用。

## 底层结构

每个元素封装为 \`Node\` 节点，包含前后指针：

\`\`\`java
private static class Node<E> {  // 定义类 Node
    E item;  // 声明变量 item（E 类型）
    Node<E> next;  // 声明变量 next（Node<E> 类型）
    Node<E> prev;  // 声明变量 prev（Node<E> 类型）
}
\`\`\`

链表维护 \`first\`（头节点）和 \`last\`（尾节点）指针，size 记录元素数。

## 性能特征

| 操作 | 时间复杂度 |
|------|-----------|
| 头部 add/remove | O(1) |
| 尾部 add/remove | O(1) |
| 中间 add/remove（已知节点） | O(1) |
| get/set | O(n)，需从头遍历 |
| contains | O(n) |

链表增删只需修改指针，但**随机访问必须从头遍历**，这是 LinkedList 最大的性能短板。

## 双端操作 O(1)

\`addFirst\`、\`addLast\`、\`removeFirst\`、\`removeLast\`、\`getFirst\`、\`getLast\` 都是 O(1)，因此 LinkedList 适合做队列和栈。

## Deque 实现

LinkedList 实现了 \`Deque\`，提供完整的双端队列和栈方法：

- 栈：\`push\` / \`pop\` / \`peek\`
- 队列：\`offer\` / \`poll\` / \`peek\`
- 双端：\`offerFirst\` / \`offerLast\` / \`pollFirst\` / \`pollLast\`

## 与 ArrayList 对比

- **内存开销**：LinkedList 每个元素多一个 Node 对象（约 24 字节），内存占用大
- **缓存友好性**：节点分散在堆中，CPU 缓存命中率低
- **随机访问**：LinkedList O(n)，ArrayList O(1)
- **头尾增删**：LinkedList O(1)，ArrayList 头部增删 O(n)

实际开发中，**ArrayList 几乎总是更好的默认选择**。需要频繁头尾增删时，\`ArrayDeque\` 通常比 LinkedList 更快（数组实现 + 缓存友好）。

## 适用场景

- 需要一个 List 同时充当队列/栈
- 元素数量小、频繁头尾增删
- 教学/算法题中模拟链表结构

下面通过代码演示 LinkedList 的链表特性与双端操作：`,
    code: `// 演示 LinkedList 的双向链表特性与 Deque 操作
import java.util.*;

public class Main {
    public static void main(String[] args) {
        LinkedList<String> list = new LinkedList<>(Arrays.asList("B", "C"));

        // 头尾操作 O(1)
        list.addFirst("A");
        list.addLast("D");
        System.out.println("头尾插入后: " + list);
        System.out.println("getFirst: " + list.getFirst());
        System.out.println("getLast: " + list.getLast());

        // 作为栈使用（后进先出）
        LinkedList<Integer> stack = new LinkedList<>();
        stack.push(1);
        stack.push(2);
        stack.push(3);
        System.out.println("栈顶 pop: " + stack.pop()); // 3
        System.out.println("栈: " + stack);

        // 作为队列使用（先进先出）
        LinkedList<Integer> queue = new LinkedList<>();
        queue.offer(10);
        queue.offer(20);
        queue.offer(30);
        System.out.println("队首 poll: " + queue.poll()); // 10
        System.out.println("队列: " + queue);

        // 双端队列操作
        LinkedList<String> deque = new LinkedList<>();
        deque.offerFirst("中");
        deque.offerFirst("前");
        deque.offerLast("后");
        System.out.println("Deque: " + deque);
        System.out.println("pollFirst: " + deque.pollFirst());
        System.out.println("pollLast: " + deque.pollLast());

        // ===== 性能对比：头部插入 =====
        List<Integer> arrayList = new ArrayList<>();
        LinkedList<Integer> linkedList = new LinkedList<>();

        long t1 = System.nanoTime();
        for (int i = 0; i < 50000; i++) arrayList.add(0, i);
        long t2 = System.nanoTime();
        for (int i = 0; i < 50000; i++) linkedList.add(0, i);
        long t3 = System.nanoTime();
        System.out.println("头部插入5w次 ArrayList: " + (t2 - t1) / 1_000_000 + " ms");
        System.out.println("头部插入5w次 LinkedList: " + (t3 - t2) / 1_000_000 + " ms");

        // ===== 性能对比：随机访问 =====
        long t4 = System.nanoTime();
        arrayList.get(25000);
        long t5 = System.nanoTime();
        linkedList.get(25000);
        long t6 = System.nanoTime();
        System.out.println("get(25000) ArrayList: " + (t5 - t4) + " ns");
        System.out.println("get(25000) LinkedList: " + (t6 - t5) + " ns");
    }
}`
  },
  {
    id: "java-vector-stack",
    group: "集合框架深入",
    icon: "📚",
    title: "Vector 与 Stack",
    content: `# Vector 与 Stack

\`Vector\` 和 \`Stack\` 是 Java 早期（JDK 1.0）提供的集合类，现已**不推荐使用**。理解它们的缺陷有助于选型。

## Vector

Vector 是一个**线程安全**的动态数组，与 ArrayList 功能几乎相同，区别在于：

| 特性 | Vector | ArrayList |
|------|--------|-----------|
| 线程安全 | 是（方法 synchronized） | 否 |
| 扩容倍数 | 2 倍 | 1.5 倍 |
| 性能 | 较差（锁开销） | 更好 |
| 引入版本 | JDK 1.0 | JDK 1.2 |

\`\`\`java
public synchronized boolean add(E e) { ... } // 每个方法都加 synchronized
\`\`\`

## 为什么 Vector 过时

1. **粗粒度锁**：每个方法都加 \`synchronized\`，即使读操作也加锁，并发性能差
2. **复合操作不安全**：\`if (!isEmpty()) get(0)\` 仍可能抛异常，方法级同步无法保护复合操作
3. **设计陈旧**：继承自古老 API，与 Collections Framework 风格不一致

## Stack

\`Stack\` 继承自 \`Vector\`，提供 push/pop/peek 等栈操作：

\`\`\`java
public class Stack<E> extends Vector<E> { ... }  // 定义类 Stack
\`\`\`

这本身就是一个**设计错误**：栈应该是组合而非继承 Vector。Stack 因此"是"一个 Vector，暴露了 Vector 的所有方法，破坏了栈的封装性。

## 替代方案

- 替代 Vector：\`Collections.synchronizedList(new ArrayList<>())\` 或 \`CopyOnWriteArrayList\`（读多写少）
- 替代 Stack：\`ArrayDeque\`（基于数组的双端队列，作栈使用更快）

\`\`\`java
Deque<Integer> stack = new ArrayDeque<>();  // 声明变量 stack（Deque<Integer>），初始值为 new ArrayDeque<>()
stack.push(1); stack.push(2);  // 调用 stack 的 push 方法
stack.pop(); // 推荐用法
\`\`\`

ArrayDeque 比Stack 更快的原因：
- 数组实现，缓存友好
- 不需要 synchronized 锁开销
- 没有继承 Vector 的历史包袱

## 遗留接口 Enumeration

Vector 的 \`elements()\` 返回 \`Enumeration\`，这是 Iterator 的前身，现已不推荐使用，应改用 \`iterator()\` 或 for-each。

下面通过代码演示 Vector/Stack 的用法与缺陷：`,
    code: `// 演示 Vector 与 Stack 的用法，及现代替代方案
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== Vector 基本用法（不推荐新代码使用） =====
        Vector<String> vector = new Vector<>();
        vector.add("Java");
        vector.add("Python");
        vector.add("Go");
        System.out.println("Vector: " + vector);
        System.out.println("Vector size: " + vector.size());

        // Vector 的 Enumeration（遗留接口）
        Enumeration<String> e = vector.elements();
        System.out.print("Enumeration 遍历: ");
        while (e.hasMoreElements()) {
            System.out.print(e.nextElement() + " ");
        }
        System.out.println();

        // ===== Stack 基本用法（不推荐新代码使用） =====
        Stack<Integer> stack = new Stack<>();
        stack.push(10);
        stack.push(20);
        stack.push(30);
        System.out.println("Stack: " + stack);
        System.out.println("peek: " + stack.peek()); // 查看栈顶不弹出
        System.out.println("pop: " + stack.pop());   // 弹出栈顶
        System.out.println("pop 后: " + stack);
        System.out.println("search(10) 位置: " + stack.search(10)); // 从栈顶数起

        // Stack 的设计缺陷：它继承了 Vector，所以也能调用 Vector 的方法
        stack.add(0, 99); // 在栈底插入，破坏栈语义
        System.out.println("Stack 可被当作 Vector 误用: " + stack);

        // ===== 现代替代方案 =====
        // 替代 Vector：CopyOnWriteArrayList（读多写少）或 synchronizedList
        List<String> syncList = Collections.synchronizedList(new ArrayList<>());
        syncList.add("线程安全");
        System.out.println("synchronizedList: " + syncList);

        // 替代 Stack：ArrayDeque
        Deque<Integer> modernStack = new ArrayDeque<>();
        modernStack.push(10);
        modernStack.push(20);
        modernStack.push(30);
        System.out.println("ArrayDeque 作栈: " + modernStack);
        System.out.println("pop: " + modernStack.pop());

        // ===== 性能对比：Stack vs ArrayDeque 作栈 =====
        int count = 1_000_000;
        Stack<Integer> oldStack = new Stack<>();
        ArrayDeque<Integer> newStack = new ArrayDeque<>();

        long t1 = System.nanoTime();
        for (int i = 0; i < count; i++) oldStack.push(i);
        for (int i = 0; i < count; i++) oldStack.pop();
        long t2 = System.nanoTime();

        for (int i = 0; i < count; i++) newStack.push(i);
        for (int i = 0; i < count; i++) newStack.pop();
        long t3 = System.nanoTime();

        System.out.println("Stack push/pop 100w: " + (t2 - t1) / 1_000_000 + " ms");
        System.out.println("ArrayDeque push/pop 100w: " + (t3 - t2) / 1_000_000 + " ms");
    }
}`
  },
  {
    id: "java-set-interface",
    group: "集合框架深入",
    icon: "🎯",
    title: "Set 接口",
    content: `# Set 接口

\`Set\` 是 Collection 的子接口，表示**不可重复**的元素集合。它不保证顺序（除非实现类特别声明），且最多包含一个 null。

## 核心特性

- **不可重复**：相同元素只能存在一份（由 equals/hashCode 判定）
- **无索引**：没有 get(index) 方法，无法按位置访问
- **至多一个 null**：部分实现（如 TreeSet）不允许 null

## 主要方法

Set 继承自 Collection，没有额外新增方法，但语义上要求**不重复**：

\`\`\`java
boolean add(E e);          // 添加，若已存在则返回 false 且不修改
boolean remove(Object o);  // 删除
boolean contains(Object o);// 判断是否包含
int size();                // 元素个数
\`\`\`

add 返回值很关键：true 表示新增成功，false 表示元素已存在。

## 三大实现对比

| 实现 | 底层 | 顺序 | 性能 | null |
|------|------|------|------|------|
| HashSet | 哈希表 | 无序 | O(1) 增删查 | 允许 1 个 |
| LinkedHashSet | 哈希表+链表 | 插入顺序 | O(1) | 允许 1 个 |
| TreeSet | 红黑树 | 自然/比较器排序 | O(log n) | 不允许 |

## 选择指南

- **需要最快性能、不关心顺序** → HashSet（默认首选）
- **需要保留插入顺序** → LinkedHashSet
- **需要排序遍历** → TreeSet
- **元素是枚举** → EnumSet（最高效的 Set）
- **线程安全** → Collections.synchronizedSet 或 CopyOnWriteArraySet

## 相等性判定

Set 通过 \`equals()\` 判定重复。若使用 HashSet/LinkedHashSet，还必须保证 **hashCode 一致**：

\`\`\`java
// 两个 equals 相等的对象必须有相同的 hashCode
if (a.equals(b)) assert a.hashCode() == b.hashCode();  // 调用 if (a 的 equals 方法
\`\`\`

违反此约定会导致 HashSet 中出现"重复"元素。

## 与 List 互转

\`\`\`java
List<String> list = new ArrayList<>(set);    // Set 转 List
Set<String> set = new HashSet<>(list);       // List 转 Set（自动去重）
\`\`\`

下面通过代码演示 Set 接口的使用：`,
    code: `// 演示 Set 接口的去重特性与三大实现对比
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 基本去重 =====
        Set<String> set = new HashSet<>();
        System.out.println("add Java: " + set.add("Java"));    // true
        System.out.println("add Python: " + set.add("Python"));// true
        System.out.println("add Java again: " + set.add("Java")); // false 重复
        System.out.println("Set: " + set);
        System.out.println("contains Python: " + set.contains("Python"));
        set.remove("Python");
        System.out.println("remove 后: " + set);

        // ===== 三大实现顺序对比 =====
        Set<String> hashSet = new HashSet<>(Arrays.asList("Banana", "Apple", "Cherry"));
        Set<String> linkedHashSet = new LinkedHashSet<>(Arrays.asList("Banana", "Apple", "Cherry"));
        Set<String> treeSet = new TreeSet<>(Arrays.asList("Banana", "Apple", "Cherry"));
        System.out.println("HashSet(无序): " + hashSet);
        System.out.println("LinkedHashSet(插入顺序): " + linkedHashSet);
        System.out.println("TreeSet(排序): " + treeSet);

        // ===== 应用：统计唯一单词 =====
        String text = "to be or not to be that is the question";
        String[] words = text.split(" ");
        Set<String> unique = new HashSet<>(Arrays.asList(words));
        System.out.println("唯一单词数: " + unique.size());
        System.out.println("唯一单词: " + unique);

        // ===== 应用：求交集/并集/差集 =====
        Set<Integer> a = new HashSet<>(Arrays.asList(1, 2, 3, 4));
        Set<Integer> b = new HashSet<>(Arrays.asList(3, 4, 5, 6));

        Set<Integer> union = new HashSet<>(a);
        union.addAll(b); // 并集
        System.out.println("并集: " + union);

        Set<Integer> inter = new HashSet<>(a);
        inter.retainAll(b); // 交集
        System.out.println("交集: " + inter);

        Set<Integer> diff = new HashSet<>(a);
        diff.removeAll(b); // 差集
        System.out.println("差集(a-b): " + diff);

        // ===== List 去重 =====
        List<String> dup = Arrays.asList("A", "B", "A", "C", "B");
        List<String> dedup = new ArrayList<>(new LinkedHashSet<>(dup));
        System.out.println("去重并保序: " + dedup);

        // ===== 性能对比 =====
        int n = 100000;
        long t1 = System.nanoTime();
        Set<Integer> hs = new HashSet<>();
        for (int i = 0; i < n; i++) hs.add(i);
        long t2 = System.nanoTime();
        Set<Integer> ts = new TreeSet<>();
        for (int i = 0; i < n; i++) ts.add(i);
        long t3 = System.nanoTime();
        System.out.println("HashSet 插入10w: " + (t2 - t1) / 1_000_000 + " ms");
        System.out.println("TreeSet 插入10w: " + (t3 - t2) / 1_000_000 + " ms");
    }
}`
  },
  {
    id: "java-hashset",
    group: "集合框架深入",
    icon: "#️⃣",
    title: "HashSet 深入",
    content: `# HashSet 深入

\`HashSet\` 是 Set 最常用的实现，基于 \`HashMap\` 实现，提供 O(1) 平均时间复杂度的增删查操作。

## 底层实现

HashSet 内部维护一个 \`HashMap\`，元素作为 Map 的 **key** 存储，所有 value 都是同一个 \`PRESENT\` 占位对象：

\`\`\`java
private transient HashMap<E,Object> map;  // 声明私有变量 map（HashMap<E,Object> 类型）
private static final Object PRESENT = new Object();  // 声明静态常量私有变量 PRESENT（Object），初始值为 new Object()

public boolean add(E e) {  // 方法 add，返回 boolean，参数：E e
    return map.put(e, PRESENT) == null;  // 返回值：map.put(e, PRESENT) == null
}
\`\`\`

因此理解 HashSet 等同于理解 HashMap 的 key 部分。

## 哈希表原理

1. 计算 key 的 hashCode
2. 通过 \`hash = (h = key.hashCode()) ^ (h >>> 16)\` 扰动，减少碰撞
3. 通过 \`index = (n - 1) & hash\` 定位桶（n 为数组长度，必须是 2 的幂）
4. 桶内若为链表则遍历比较，链表长度 ≥ 8 且数组长度 ≥ 64 时转红黑树

## 负载因子 0.75

\`DEFAULT_LOAD_FACTOR = 0.75\`，当 \`size > capacity * 0.75\` 时触发扩容（容量翻倍）。

- 0.75 是**时间与空间**的折中：太小浪费空间，太大冲突多查询慢
- 默认初始容量 16，扩容后 32、64、128...

可通过构造器指定初始容量与负载因子：
\`\`\`java
new HashSet<>(initialCapacity, loadFactor);  // 创建 HashSet<> 对象
\`\`\`

## equals 与 hashCode 契约

HashSet 判重依赖两个方法，必须**同时满足**：

1. **一致性**：多次调用 hashCode 返回相同值
2. **equals 相等则 hashCode 必相等**：否则两个"相等"的对象会落入不同桶，导致重复
3. **hashCode 相等 equals 不必相等**：这是哈希碰撞，正常现象

\`\`\`java
// 正确实现
@Override public boolean equals(Object o) { ... }
@Override public int hashCode() { ... } // 基于 equals 涉及的字段计算
\`\`\`

## 为什么不能修改参与哈希的字段

若将元素加入 HashSet 后**修改了参与 hashCode 计算的字段**，元素会"丢失"——它还在集合中，但 contains 返回 false，remove 也找不到。

## 性能特征

| 操作 | 平均 | 最坏（全碰撞） |
|------|------|----------------|
| add | O(1) | O(log n)（树化后） |
| remove | O(1) | O(log n) |
| contains | O(1) | O(log n) |

下面通过代码演示 HashSet 的哈希原理与 equals/hashCode 契约：`,
    code: `// 演示 HashSet 的去重原理与 equals/hashCode 契约
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 基本 API =====
        HashSet<String> set = new HashSet<>();
        Collections.addAll(set, "Java", "Go", "Rust", "Python");
        System.out.println("Set: " + set);
        System.out.println("size: " + set.size());
        System.out.println("contains Java: " + set.contains("Java"));

        // ===== 自定义对象去重：依赖 equals/hashCode =====
        Set<Person> people = new HashSet<>();
        people.add(new Person("张三", 25));
        people.add(new Person("张三", 25)); // equals 相同，去重
        people.add(new Person("李四", 30));
        System.out.println("去重后人数: " + people.size());
        System.out.println("包含张三: " + people.contains(new Person("张三", 25)));

        // ===== 演示：修改参与哈希的字段导致元素"丢失" =====
        Person p = new Person("王五", 20);
        Set<Person> set2 = new HashSet<>();
        set2.add(p);
        System.out.println("修改前 contains: " + set2.contains(p)); // true
        p.age = 21; // 修改了参与 hashCode 的字段
        System.out.println("修改后 contains: " + set2.contains(p)); // false! 元素丢失
        System.out.println("但 set 仍包含 p（size=1）: " + (set2.size() == 1));

        // ===== 负载因子与扩容演示 =====
        HashSet<Integer> big = new HashSet<>();
        long t1 = System.nanoTime();
        for (int i = 0; i < 1_000_000; i++) big.add(i);
        long t2 = System.nanoTime();
        System.out.println("插入 100w 整数耗时: " + (t2 - t1) / 1_000_000 + " ms");
        System.out.println("contains 查找: " + big.contains(999_999));

        // ===== 应用：判断数组是否有重复 =====
        int[] arr = {1, 2, 3, 4, 5, 3};
        Set<Integer> seen = new HashSet<>();
        boolean hasDup = false;
        for (int x : arr) {
            if (!seen.add(x)) { hasDup = true; break; }
        }
        System.out.println("数组是否有重复: " + hasDup);
    }
}

// 非公开辅助类：正确实现 equals/hashCode
class Person {
    String name;
    int age;
    Person(String name, int age) { this.name = name; this.age = age; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Person)) return false;
        Person p = (Person) o;
        return age == p.age && Objects.equals(name, p.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }

    @Override
    public String toString() {
        return "Person{" + name + ", " + age + "}";
    }
}`
  },
  {
    id: "java-treeset",
    group: "集合框架深入",
    icon: "🌲",
    title: "TreeSet 深入",
    content: `# TreeSet 深入

\`TreeSet\` 是基于 **红黑树**（Red-Black Tree）实现的有序 Set，元素按自然顺序或指定 Comparator 排序，增删查时间复杂度为 O(log n)。

## 底层实现

TreeSet 内部维护一个 \`TreeMap\`，元素作为 Map 的 key，value 是 \`PRESENT\` 占位对象，与 HashSet 类似：

\`\`\`java
private transient NavigableMap<E,Object> m;  // 声明私有变量 m（NavigableMap<E,Object> 类型）
\`\`\`

红黑树是自平衡二叉搜索树，保证左右子树高度差不超过 2 倍，避免退化为链表。

## 排序方式

TreeSet 必须能比较元素，有两种方式：

1. **自然排序**：元素实现 \`Comparable<T>\` 接口
2. **比较器排序**：构造时传入 \`Comparator<T>\`

\`\`\`java
new TreeSet<>();                     // 自然排序
new TreeSet<>(Comparator.reverseOrder()); // 比较器排序
\`\`\`

若元素未实现 Comparable 且未提供 Comparator，添加元素时抛出 \`ClassCastException\`。

## 有序遍历

TreeSet 维护元素顺序，遍历时**升序输出**：

\`\`\`java
for (Integer x : treeSet) { ... } // 升序
\`\`\`

## NavigableSet 导航方法

TreeSet 实现了 \`NavigableSet\`，提供丰富的导航查询：

\`\`\`java
E first();              // 最小元素
E last();               // 最大元素
E lower(E e);           // 小于 e 的最大元素
E higher(E e);          // 大于 e 的最小元素
E floor(E e);           // 小于等于 e 的最大元素
E ceiling(E e);         // 大于等于 e 的最小元素
SortedSet<E> subSet(E from, E to);   // 子集 [from, to)
SortedSet<E> headSet(E to);          // 小于 to 的子集
SortedSet<E> tailSet(E from);        // 大于等于 from 的子集
\`\`\`

这些方法非常适合"范围查询"和"最接近元素"场景。

## 时间复杂度

| 操作 | 复杂度 |
|------|--------|
| add/remove/contains | O(log n) |
| first/last | O(log n)（JDK 实现缓存了端点） |
| lower/higher/floor/ceiling | O(log n) |
| 遍历 | O(n) 升序 |

## 注意事项

- **不允许 null**：因为 null 无法与任何元素比较
- **不可修改影响排序的字段**：会导致树结构损坏，遍历异常
- **非线程安全**

## 适用场景

- 需要有序集合（如排行榜、按时间排序的事件）
- 需要范围查询（如找出 [a, b] 区间内的元素）
- 需要快速找前驱/后继

下面通过代码演示 TreeSet 的排序与导航功能：`,
    code: `// 演示 TreeSet 的红黑树排序与 NavigableSet 导航方法
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 自然排序（升序） =====
        TreeSet<Integer> nums = new TreeSet<>(Arrays.asList(50, 20, 80, 10, 30, 60, 90));
        System.out.println("TreeSet(升序): " + nums);
        System.out.println("first(最小): " + nums.first());
        System.out.println("last(最大): " + nums.last());

        // ===== 导航方法 =====
        System.out.println("lower(50) 小于50的最大: " + nums.lower(50));   // 30
        System.out.println("higher(50) 大于50的最小: " + nums.higher(50)); // 60
        System.out.println("floor(55) <=55的最大: " + nums.floor(55));     // 50
        System.out.println("ceiling(55) >=55的最小: " + nums.ceiling(55)); // 60

        // ===== 范围查询 =====
        System.out.println("subSet(20, 80) [20,80): " + nums.subSet(20, 80));
        System.out.println("headSet(50) <50: " + nums.headSet(50));
        System.out.println("tailSet(50) >=50: " + nums.tailSet(50));

        // ===== 降序遍历 =====
        System.out.println("降序遍历: " + nums.descendingSet());

        // ===== 比较器排序（降序） =====
        TreeSet<Integer> desc = new TreeSet<>(Comparator.reverseOrder());
        Collections.addAll(desc, 50, 20, 80, 10);
        System.out.println("降序 TreeSet: " + desc);

        // ===== 自定义对象排序 =====
        TreeSet<Student> students = new TreeSet<>();
        students.add(new Student("张三", 85));
        students.add(new Student("李四", 92));
        students.add(new Student("王五", 78));
        System.out.println("按分数升序: " + students);

        // ===== 应用：动态维护排行榜 Top3 =====
        TreeSet<Integer> scores = new TreeSet<>(Comparator.reverseOrder());
        Collections.addAll(scores, 88, 95, 76, 90, 82, 99, 70);
        // 降序 TreeSet：第一个元素最大，直接取前 3 个
        System.out.println("Top3 分数: " + scores.toArray()[0]
            + ", " + scores.toArray()[1] + ", " + scores.toArray()[2]);

        // ===== pollFirst/pollLast 弹出端点 =====
        TreeSet<Integer> pq = new TreeSet<>(Arrays.asList(5, 1, 3));
        System.out.println("pollFirst(最小): " + pq.pollFirst());
        System.out.println("pollLast(最大): " + pq.pollLast());
        System.out.println("剩余: " + pq);

        // ===== 性能：插入 10w 元素 =====
        long t1 = System.nanoTime();
        TreeSet<Integer> big = new TreeSet<>();
        for (int i = 0; i < 100_000; i++) big.add(i);
        long t2 = System.nanoTime();
        System.out.println("TreeSet 插入10w: " + (t2 - t1) / 1_000_000 + " ms (O(log n))");
    }
}

// 非公开辅助类：实现 Comparable
class Student implements Comparable<Student> {
    String name;
    int score;
    Student(String name, int score) { this.name = name; this.score = score; }

    @Override
    public int compareTo(Student o) {
        return Integer.compare(this.score, o.score); // 按分数升序
    }

    @Override
    public String toString() {
        return name + "(" + score + ")";
    }
}`
  },
  {
    id: "java-map-interface",
    group: "集合框架深入",
    icon: "🗺️",
    title: "Map 接口",
    content: `# Map 接口

\`Map\` 是集合框架中表示**键值对映射**的顶层接口。它不属于 Collection，但属于集合框架的一部分。每个 key 最多映射一个 value。

## 核心特性

- **键唯一**：一个 key 只能对应一个 value
- **值可重复**：不同 key 可映射相同 value
- **至多一个 null 键**（HashMap 允许，TreeMap 不允许）
- **多个 null 值**（HashMap/LinkedHashMap 允许）

## 主要方法

\`\`\`java
V put(K key, V value);          // 添加/覆盖，返回旧值
V get(Object key);              // 取值，不存在返回 null
V getOrDefault(K, V);           // 不存在返回默认值（JDK 8）
V remove(Object key);           // 删除，返回旧值
boolean containsKey(Object k);  // 是否包含 key
boolean containsValue(Object v);// 是否包含 value
int size();                     // 键值对数
Set<K> keySet();                // 所有 key 的 Set 视图
Collection<V> values();         // 所有 value 的集合视图
Set<Map.Entry<K,V>> entrySet(); // 所有键值对的 Set 视图
\`\`\`

## 三大视图

Map 提供三种视图集合，它们都是**底层 Map 的视图**，修改视图会影响 Map：

- \`keySet()\`：所有键
- \`values()\`：所有值
- \`entrySet()\`：所有键值对（最常用于遍历）

\`\`\`java
for (Map.Entry<String, Integer> e : map.entrySet()) {
    System.out.println(e.getKey() + "=" + e.getValue());  // 打印一行到标准输出（自动换行）
}
\`\`\`

## 三大实现对比

| 实现 | 顺序 | 性能 | null 键 |
|------|------|------|---------|
| HashMap | 无序 | O(1) | 允许 1 个 |
| LinkedHashMap | 插入/访问顺序 | O(1) | 允许 1 个 |
| TreeMap | 按键排序 | O(log n) | 不允许 |

## HashMap vs TreeMap 选择

- **默认用 HashMap**：性能最好，覆盖 95% 场景
- **需要按键排序遍历** → TreeMap
- **需要保留插入顺序**（如 JSON 序列化） → LinkedHashMap
- **高并发场景** → ConcurrentHashMap

## Entry 方法（JDK 8+）

\`\`\`java
V putIfAbsent(K, V);           // 仅当 key 不存在时插入
V compute(K, BiFunction);      // 根据 key 和旧值计算新值
V merge(K, V, BiFunction);     // 合并值
void forEach(BiConsumer);      // 遍历
\`\`\`

下面通过代码演示 Map 接口的常用操作：`,
    code: `// 演示 Map 接口的核心方法与三大视图
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> scores = new HashMap<>();
        scores.put("张三", 90);
        scores.put("李四", 85);
        scores.put("王五", 95);
        System.out.println("Map: " + scores);

        // get / getOrDefault
        System.out.println("get 张三: " + scores.get("张三"));
        System.out.println("get 赵六(不存在): " + scores.get("赵六"));
        System.out.println("getOrDefault: " + scores.getOrDefault("赵六", 0));

        // put 覆盖，返回旧值
        Integer old = scores.put("张三", 100);
        System.out.println("覆盖张三旧值: " + old + " 新值: " + scores.get("张三"));

        // containsKey / containsValue
        System.out.println("containsKey 李四: " + scores.containsKey("李四"));
        System.out.println("containsValue 95: " + scores.containsValue(95));

        // 三大视图
        System.out.println("keySet: " + scores.keySet());
        System.out.println("values: " + scores.values());
        System.out.println("entrySet: " + scores.entrySet());

        // entrySet 遍历（推荐）
        System.out.print("entrySet 遍历: ");
        for (Map.Entry<String, Integer> e : scores.entrySet()) {
            System.out.print(e.getKey() + "=" + e.getValue() + " ");
        }
        System.out.println();

        // ===== HashMap vs TreeMap vs LinkedHashMap 顺序对比 =====
        Map<String, Integer> hash = new HashMap<>();
        Map<String, Integer> linked = new LinkedHashMap<>();
        Map<String, Integer> tree = new TreeMap<>();
        String[] keys = {"banana", "apple", "cherry"};
        for (String k : keys) {
            hash.put(k, 1); linked.put(k, 1); tree.put(k, 1);
        }
        System.out.println("HashMap: " + hash);
        System.out.println("LinkedHashMap: " + linked);
        System.out.println("TreeMap: " + tree);

        // ===== JDK 8+ 方法 =====
        Map<String, Integer> counts = new HashMap<>();
        // putIfAbsent：不存在才插入
        counts.putIfAbsent("a", 1);
        counts.putIfAbsent("a", 2); // 已存在，不覆盖
        System.out.println("putIfAbsent 后 a=" + counts.get("a")); // 1

        // merge：单词计数经典用法
        String text = "to be or not to be";
        Map<String, Integer> wordCount = new HashMap<>();
        for (String w : text.split(" ")) {
            wordCount.merge(w, 1, Integer::sum);
        }
        System.out.println("单词计数: " + wordCount);

        // compute：根据旧值计算新值
        wordCount.compute("to", (k, v) -> v == null ? 1 : v + 100);
        System.out.println("compute 后 to=" + wordCount.get("to"));

        // forEach + lambda
        System.out.print("forEach: ");
        scores.forEach((k, v) -> System.out.print(k + ":" + v + " "));
        System.out.println();

        // remove 返回旧值
        Integer removed = scores.remove("王五");
        System.out.println("remove 王五 旧值: " + removed + " 剩余 size=" + scores.size());
    }
}`
  },
  {
    id: "java-hashmap",
    group: "集合框架深入",
    icon: "⚡",
    title: "HashMap 深入",
    content: `# HashMap 深入

\`HashMap\` 是 Java 中最重要的集合类之一，基于 **数组 + 链表 + 红黑树** 实现，提供 O(1) 平均时间的增删查。

## 底层结构

JDK 8 起，HashMap 由三部分组成：

1. **哈希桶数组** \`Node[] table\`：主结构，长度为 2 的幂
2. **链表**：哈希冲突时，桶内用链表存储多个节点
3. **红黑树**：链表长度 ≥ 8 且数组长度 ≥ 64 时，链表转红黑树，避免退化查询

\`\`\`java
static class Node<K,V> {  // 定义类 Node
    final int hash;  // 声明常量变量 hash（int 类型）
    final K key;  // 声明常量变量 key（K 类型）
    V value;  // 声明变量 value（V 类型）
    Node<K,V> next;  // 声明变量 next（Node<K,V> 类型）
}
\`\`\`

## 哈希计算

\`\`\`java
static final int hash(Object key) {  // 静态方法 hash，返回 int，参数：Object key
    int h;  // 声明变量 h（int 类型）
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);  // 返回值：(key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16)
}
\`\`\`

高 16 位与低 16 位异或（扰动），让高位也参与桶定位，减少碰撞。桶下标计算：

\`\`\`java
int index = (n - 1) & hash; // n 是数组长度，必须是 2 的幂
\`\`\`

用位运算代替取模，更快。

## 扩容机制

- **初始容量** 16，**负载因子** 0.75
- 当 \`size > capacity * 0.75\` 时触发扩容，容量**翻倍**
- 扩容后元素重新分布：要么留在原位，要么移动到"原位 + 旧容量"位置

扩容是 O(n) 操作，但均摊后 put 仍为 O(1)。

## 链表转红黑树条件

满足两个条件才树化：
- 链表长度 **≥ 8**（\`TREEIFY_THRESHOLD\`）
- 数组长度 **≥ 64**（\`MIN_TREEIFY_CAPACITY\`）

否则只是扩容。退化条件：节点数 ≤ 6（\`UNTREEIFY_THRESHOLD\`）。

## 线程不安全

HashMap **多线程下不安全**，可能出现：
- 数据丢失
- 死循环（JDK 7 扩容时链表成环，JDK 8 已修复但仍会数据错乱）
- \`ConcurrentModificationException\`

并发场景应使用 \`ConcurrentHashMap\`。

## 关键参数

| 参数 | 默认值 | 含义 |
|------|--------|------|
| 初始容量 | 16 | 桶数组初始长度 |
| 负载因子 | 0.75 | size/capacity 阈值 |
| 树化阈值 | 8 | 链表转树 |
| 解树化阈值 | 6 | 树转链表 |
| 最小树化容量 | 64 | 树化时数组最小长度 |

## 性能特征

| 操作 | 平均 | 最坏 |
|------|------|------|
| put/get/remove | O(1) | O(log n)（树化后） |

下面通过代码演示 HashMap 的哈希分布与扩容行为：`,
    code: `// 演示 HashMap 的底层结构、哈希计算与扩容行为
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 基本 API =====
        HashMap<String, Integer> map = new HashMap<>();
        map.put("apple", 3);
        map.put("banana", 5);
        map.put("cherry", 2);
        System.out.println("HashMap: " + map);
        System.out.println("get apple: " + map.get("apple"));

        // ===== 桶分布与扩容说明 =====
        // HashMap 默认初始容量 16，负载因子 0.75，size > 16*0.75=12 时扩容（翻倍）
        HashMap<Integer, String> test = new HashMap<>();
        for (int i = 0; i < 16; i++) test.put(i, "v" + i);
        System.out.println("插入16个元素后 size: " + test.size() + "（容量 16，已触发扩容到 32）");

        test.put(16, "v16");
        System.out.println("插入17个元素后 size: " + test.size() + "（容量 32）");

        // ===== 允许 null 键和多个 null 值 =====
        HashMap<String, String> nullMap = new HashMap<>();
        nullMap.put(null, "null键的值");
        nullMap.put("a", null);
        nullMap.put("b", null); // 多个 null 值
        System.out.println("null 键值: " + nullMap.get(null));
        System.out.println("允许多个 null 值: " + nullMap);

        // ===== 实际应用：词频统计 =====
        String text = "the quick brown fox the lazy dog the end";
        HashMap<String, Integer> freq = new HashMap<>();
        for (String w : text.split(" ")) {
            freq.merge(w, 1, Integer::sum);
        }
        System.out.println("词频: " + freq);
        System.out.println("the 出现次数: " + freq.get("the"));

        // ===== 哈希冲突演示：构造相同桶下标的键 =====
        // 字符串 "Aa" 和 "BB" 在 Java 中 hashCode 相同
        System.out.println("\\"Aa\\".hashCode() = " + "Aa".hashCode());
        System.out.println("\\"BB\\".hashCode() = " + "BB".hashCode());
        HashMap<String, Integer> collision = new HashMap<>();
        collision.put("Aa", 1);
        collision.put("BB", 2); // 哈希冲突，落入同一桶
        System.out.println("哈希冲突后仍可正常工作: " + collision);

        // ===== 性能测试 =====
        int n = 1_000_000;
        long t1 = System.nanoTime();
        HashMap<Integer, String> big = new HashMap<>();
        for (int i = 0; i < n; i++) big.put(i, "v" + i);
        long t2 = System.nanoTime();
        long t3 = System.nanoTime();
        big.get(n - 1);
        long t4 = System.nanoTime();
        System.out.println("HashMap 插入100w: " + (t2 - t1) / 1_000_000 + " ms");
        System.out.println("HashMap get 单次: " + (t4 - t3) + " ns");

        // ===== 指定初始容量减少扩容 =====
        HashMap<Integer, String> pre = new HashMap<>(2_000_000); // 预分配
        long t5 = System.nanoTime();
        for (int i = 0; i < n; i++) pre.put(i, "v" + i);
        long t6 = System.nanoTime();
        System.out.println("预分配容量插入100w: " + (t6 - t5) / 1_000_000 + " ms");

        // 说明：HashMap 内部用 Node[] table 存储桶数组，Java 16+ 限制了对内部字段的反射访问。
        // 扩容阈值 = 容量 * 负载因子(默认 0.75)，超过阈值触发扩容，容量翻倍。
    }
}`
  },
  {
    id: "java-treemap",
    group: "集合框架深入",
    icon: "🎄",
    title: "TreeMap 深入",
    content: `# TreeMap 深入

\`TreeMap\` 是基于 **红黑树** 实现的有序 Map，键按自然顺序或指定 Comparator 排列，增删查时间复杂度为 O(log n)。

## 底层结构

\`\`\`java
static final class Entry<K,V> implements Map.Entry<K,V> {  // 定义最终（不可继承）类 Entry
    K key;  // 声明变量 key（K 类型）
    V value;  // 声明变量 value（V 类型）
    Entry<K,V> left, right, parent;
    boolean color; // 红黑树颜色
}
\`\`\`

红黑树是自平衡二叉搜索树，通过颜色约束和旋转操作保证树高 ≈ log n。

## 排序方式

TreeMap 必须能比较键，两种方式：

1. **自然排序**：键实现 \`Comparable<T>\`
2. **比较器排序**：构造时传入 \`Comparator<T>\`

\`\`\`java
new TreeMap<>();                              // 自然排序
new TreeMap<>(Comparator.reverseOrder());     // 降序
new TreeMap<>(Comparator.comparingInt(k -> k.length())); // 自定义
\`\`\`

键未实现 Comparable 且无 Comparator 时，put 抛 \`ClassCastException\`。

## 有序遍历

TreeMap 维护键的顺序，遍历 entrySet 时**升序输出**：

\`\`\`java
for (Map.Entry<K,V> e : treeMap.entrySet()) { ... } // 按 key 升序
\`\`\`

## NavigableMap 导航方法

TreeMap 实现了 \`NavigableMap\`，提供强大的范围查询：

\`\`\`java
K firstKey();           // 最小键
K lastKey();            // 最大键
Map.Entry<K,V> firstEntry();  // 方法 firstEntry，返回 Map.Entry<K,V>，无参数
K lowerKey(K);          // 小于 key 的最大键
K higherKey(K);         // 大于 key 的最小键
K floorKey(K);          // <= key 的最大键
K ceilingKey(K);        // >= key 的最小键
SortedMap<K,V> subMap(K, K);   // [fromKey, toKey)
SortedMap<K,V> headMap(K);     // < toKey
SortedMap<K,V> tailMap(K);     // >= fromKey
\`\`\`

## 时间复杂度

| 操作 | 复杂度 |
|------|--------|
| put/get/remove | O(log n) |
| firstKey/lastKey | O(log n)（缓存） |
| lower/higher/floor/ceiling | O(log n) |
| 遍历 | O(n) 升序 |

## 注意事项

- **不允许 null 键**：null 无法比较
- **非线程安全**：并发可用 \`Collections.synchronizedSortedMap\` 或 \`ConcurrentSkipListMap\`
- **修改影响排序的键字段**会破坏树结构

## 适用场景

- 按键排序的字典（如时间戳 → 事件）
- 范围查询（如找出某个时间段内的所有记录）
- 需要找最接近某个键的元素
- 实现一致性哈希环

下面通过代码演示 TreeMap 的排序与导航功能：`,
    code: `// 演示 TreeMap 的红黑树排序与范围查询
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 自然排序（按 key 升序） =====
        TreeMap<Integer, String> map = new TreeMap<>();
        map.put(50, "Fifty");
        map.put(20, "Twenty");
        map.put(80, "Eighty");
        map.put(10, "Ten");
        map.put(30, "Thirty");
        System.out.println("TreeMap(升序): " + map);

        // ===== 端点查询 =====
        System.out.println("firstKey: " + map.firstKey());
        System.out.println("lastKey: " + map.lastKey());
        System.out.println("firstEntry: " + map.firstEntry());

        // ===== 导航查询 =====
        System.out.println("lowerKey(50) <50的最大键: " + map.lowerKey(50));  // 30
        System.out.println("higherKey(50) >50的最小键: " + map.higherKey(50));// 80
        System.out.println("floorKey(55) <=55: " + map.floorKey(55));         // 50
        System.out.println("ceilingKey(55) >=55: " + map.ceilingKey(55));     // 80

        // ===== 范围查询 =====
        System.out.println("subMap(20, 80) [20,80): " + map.subMap(20, 80));
        System.out.println("headMap(30) <30: " + map.headMap(30));
        System.out.println("tailMap(50) >=50: " + map.tailMap(50));

        // ===== 降序遍历 =====
        System.out.println("降序: " + map.descendingMap());

        // ===== 字符串键按长度排序（比较器） =====
        TreeMap<String, Integer> byLength = new TreeMap<>(Comparator.comparingInt(String::length));
        byLength.put("Java", 4);
        byLength.put("Go", 2);
        byLength.put("Python", 6);
        System.out.println("按长度排序: " + byLength);

        // ===== 应用：按时间戳存储事件，查询区间 =====
        TreeMap<Long, String> events = new TreeMap<>();
        events.put(1000L, "登录");
        events.put(2000L, "下单");
        events.put(3000L, "支付");
        events.put(4000L, "发货");
        events.put(5000L, "签收");

        // 查询 [2000, 4000) 时间段的事件
        System.out.println("2s-4s 之间事件: " + events.subMap(2000L, 4000L));
        // 查询 3000ms 之前的所有事件
        System.out.println("3s 之前事件: " + events.headMap(3000L));
        // 找出第一个 >= 3500 的事件
        System.out.println(">=3500 最早事件: " + events.ceilingEntry(3500L));

        // ===== pollFirstEntry / pollLastEntry 弹出端点 =====
        TreeMap<Integer, String> pq = new TreeMap<>(map);
        System.out.println("pollFirstEntry: " + pq.pollFirstEntry());
        System.out.println("pollLastEntry: " + pq.pollLastEntry());

        // ===== 性能对比 =====
        int n = 100_000;
        long t1 = System.nanoTime();
        TreeMap<Integer, String> tree = new TreeMap<>();
        for (int i = 0; i < n; i++) tree.put(i, "v");
        long t2 = System.nanoTime();
        HashMap<Integer, String> hash = new HashMap<>();
        for (int i = 0; i < n; i++) hash.put(i, "v");
        long t3 = System.nanoTime();
        System.out.println("TreeMap 插入10w: " + (t2 - t1) / 1_000_000 + " ms (O(log n))");
        System.out.println("HashMap 插入10w: " + (t3 - t2) / 1_000_000 + " ms (O(1))");
    }
}`
  },
  {
    id: "java-linkedhashmap",
    group: "集合框架深入",
    icon: "📎",
    title: "LinkedHashMap",
    content: `# LinkedHashMap

\`LinkedHashMap\` 是 HashMap 的子类，在哈希表基础上额外维护一条**双向链表**，记录元素的插入顺序或访问顺序。

## 底层结构

\`\`\`java
static class Entry<K,V> extends HashMap.Node<K,V> {  // 定义类 Entry
    Entry<K,V> before, after; // 链表前驱后继
}
\`\`\`

每个节点除哈希表的 next 指针外，还有 before/after 指针串联所有节点，形成一条贯穿所有元素的链表。

## 两种顺序模式

通过 \`accessOrder\` 参数控制：

- **false（默认）**：按**插入顺序**，先 put 的在前
- **true**：按**访问顺序**，最近访问（get/put）的移到链表尾部

\`\`\`java
new LinkedHashMap<>(16, 0.75f, false); // 插入顺序（默认）
new LinkedHashMap<>(16, 0.75f, true);  // 访问顺序
\`\`\`

## 性能

与 HashMap 几乎相同，O(1) 增删查，仅多一次链表指针维护的开销，可忽略。

## 应用一：保留插入顺序

需要"先插入先输出"的场景，如 JSON 序列化、配置项展示：

\`\`\`java
Map<String, Object> config = new LinkedHashMap<>();  // 声明变量 config（Map<String, Object>），初始值为 new LinkedHashMap<>()
config.put("name", "app");  // 调用 config 的 put 方法
config.put("version", "1.0");  // 调用 config 的 put 方法
// 遍历时保持 name → version 顺序
\`\`\`

## 应用二：LRU 缓存

利用 accessOrder=true，配合重写 \`removeEldestEntry\` 可实现 **LRU（最近最少使用）缓存**：

\`\`\`java
class LruCache<K,V> extends LinkedHashMap<K,V> {  // 定义类 LruCache
    private final int capacity;  // 声明常量私有变量 capacity（int 类型）
    LruCache(int capacity) {
        super(capacity, 0.75f, true); // accessOrder=true
        this.capacity = capacity;  // 为 this.capacity 赋值：capacity
    }
    @Override  // 注解：Override
    protected boolean removeEldestEntry(Map.Entry<K,V> eldest) {  // 方法 removeEldestEntry，返回 boolean，参数：Map.Entry<K,V> eldest
        return size() > capacity; // 超容量时淘汰最久未访问的
    }
}
\`\`\`

每次 get/put 都会把元素移到链表尾部，链表头部即"最久未访问"。当 size 超过容量时，HashMap 的 afterNodeInsertion 会调用 removeEldestEntry，若返回 true 则删除链表头部节点。

## 注意事项

- **非线程安全**：并发场景可用 \`Collections.synchronizedMap\` 包装
- **内存开销略大**：每个节点多两个指针
- **accessOrder 模式下 get 会修改结构**：因此迭代时 get 可能抛 ConcurrentModificationException

## 适用场景

- 需要保留插入顺序的 Map（默认）
- 实现 LRU 缓存
- 配置/属性表，按定义顺序展示

下面通过代码演示 LinkedHashMap 的两种顺序模式与 LRU 缓存实现：`,
    code: `// 演示 LinkedHashMap 的插入顺序、访问顺序与 LRU 缓存
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 插入顺序（默认） =====
        LinkedHashMap<String, Integer> insertOrder = new LinkedHashMap<>();
        insertOrder.put("banana", 1);
        insertOrder.put("apple", 2);
        insertOrder.put("cherry", 3);
        // 访问元素不影响顺序
        insertOrder.get("banana");
        System.out.println("插入顺序: " + insertOrder);

        // ===== 访问顺序 =====
        LinkedHashMap<String, Integer> accessOrder = new LinkedHashMap<>(16, 0.75f, true);
        accessOrder.put("banana", 1);
        accessOrder.put("apple", 2);
        accessOrder.put("cherry", 3);
        System.out.println("访问前: " + accessOrder);
        accessOrder.get("banana"); // banana 移到末尾
        System.out.println("get(banana) 后: " + accessOrder);
        accessOrder.put("apple", 20); // apple 移到末尾
        System.out.println("put(apple) 后: " + accessOrder);

        // ===== LRU 缓存实现 =====
        LruCache<String, Integer> lru = new LruCache<>(3);
        lru.put("A", 1);
        lru.put("B", 2);
        lru.put("C", 3);
        System.out.println("初始: " + lru);
        lru.get("A"); // 访问 A，A 移到末尾，B 变最旧
        System.out.println("get(A) 后: " + lru);
        lru.put("D", 4); // 超容量，淘汰最旧的 B
        System.out.println("put(D) 后(淘汰B): " + lru);
        System.out.println("contains B? " + lru.containsKey("B")); // false

        // ===== 应用：配置项保序 =====
        Map<String, Object> config = new LinkedHashMap<>();
        config.put("host", "localhost");
        config.put("port", 8080);
        config.put("debug", true);
        System.out.println("配置（保序）:");
        config.forEach((k, v) -> System.out.println("  " + k + " = " + v));

        // ===== 性能对比 =====
        int n = 1_000_000;
        long t1 = System.nanoTime();
        Map<Integer, String> hash = new HashMap<>();
        for (int i = 0; i < n; i++) hash.put(i, "v");
        long t2 = System.nanoTime();
        Map<Integer, String> linked = new LinkedHashMap<>();
        for (int i = 0; i < n; i++) linked.put(i, "v");
        long t3 = System.nanoTime();
        System.out.println("HashMap 插入100w: " + (t2 - t1) / 1_000_000 + " ms");
        System.out.println("LinkedHashMap 插入100w: " + (t3 - t2) / 1_000_000 + " ms");
    }
}

// 非公开辅助类：基于 LinkedHashMap 的 LRU 缓存
class LruCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    LruCache(int capacity) {
        super(capacity, 0.75f, true); // accessOrder = true
        this.capacity = capacity;
    }

    // 当插入新元素后调用，返回 true 则删除最旧的（链表头部）元素
    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }
}`
  },
  {
    id: "java-iterator",
    group: "集合框架深入",
    icon: "🔄",
    title: "Iterator 迭代器",
    content: `# Iterator 迭代器

\`Iterator\` 是集合遍历的统一抽象。所有 Collection 都通过 \`iterator()\` 返回一个 Iterator，提供" hasNext → next "的遍历模式。

## 核心方法

\`\`\`java
boolean hasNext();  // 是否还有下一个元素
E next();           // 返回下一个元素，越界抛 NoSuchElementException
void remove();      // 删除上一次 next 返回的元素（可选操作）
\`\`\`

## 基本用法

\`\`\`java
Iterator<String> it = list.iterator();  // 声明变量 it（Iterator<String>），初始值为 list.iterator()
while (it.hasNext()) {  // while 循环：当 it.hasNext() 为真时重复执行
    String s = it.next();  // 声明变量 s（String），初始值为 it.next()
    System.out.println(s);  // 打印一行到标准输出（自动换行）
}
\`\`\`

for-each 语法糖本质上就是调用 Iterator，编译器自动展开为上面的形式。

## fail-fast 机制

Java 集合（ArrayList、HashMap 等）大多采用 **fail-fast**：迭代器在创建时记录"修改次数"\`modCount\`，每次 next/checkForComodination 比较当前 modCount 与初始值，若不一致说明集合结构被外部修改，立即抛出 \`ConcurrentModificationException\`。

\`\`\`java
// 错误：遍历时直接调用 list.remove 会触发 fail-fast
for (String s : list) {  // 增强 for：遍历 list，每次取一个元素 s
    if (s.equals("x")) list.remove(s); // 抛 ConcurrentModificationException!
}
\`\`\`

## 遍历时安全删除

必须使用 **Iterator.remove()**，它会同时更新迭代器内部状态和集合，不触发 fail-fast：

\`\`\`java
Iterator<String> it = list.iterator();  // 声明变量 it（Iterator<String>），初始值为 list.iterator()
while (it.hasNext()) {  // while 循环：当 it.hasNext() 为真时重复执行
    if (it.next().equals("x")) it.remove(); // 安全
}
\`\`\`

注意：remove() 必须在 next() 之后调用，否则抛 \`IllegalStateException\`。

## ListIterator

\`ListIterator\` 是 Iterator 的子接口，**仅适用于 List**，提供双向遍历和修改：

\`\`\`java
boolean hasPrevious();  // 方法 hasPrevious，返回 boolean，无参数
E previous();           // 前驱
int nextIndex();        // 下一个索引
void add(E e);          // 在当前位置插入
void set(E e);          // 替换上次 next/previous 返回的元素
\`\`\`

可用于从后向前遍历、在遍历中插入元素。

## fail-fast vs fail-safe

- **fail-fast**（ArrayList、HashMap）：直接操作底层结构，检测到修改立即抛异常
- **fail-safe**（CopyOnWriteArrayList、ConcurrentHashMap）：遍历副本或弱一致性视图，不抛异常但可能看不到最新修改

## 注意事项

- Iterator 是**一次性**的，遍历完需重新获取
- remove 是可选操作，部分实现（如不可变列表）抛 UnsupportedOperationException
- 多线程遍历需外部同步或使用并发集合

下面通过代码演示 Iterator 的用法与 fail-fast 机制：`,
    code: `// 演示 Iterator 与 ListIterator 的用法及 fail-fast 机制
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

public class Main {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>(Arrays.asList("A", "B", "C", "D", "E"));

        // ===== 基本 Iterator 遍历 =====
        Iterator<String> it = list.iterator();
        System.out.print("Iterator 遍历: ");
        while (it.hasNext()) {
            System.out.print(it.next() + " ");
        }
        System.out.println();

        // ===== 使用 Iterator.remove 安全删除 =====
        Iterator<String> it2 = list.iterator();
        while (it2.hasNext()) {
            String s = it2.next();
            if (s.equals("C") || s.equals("E")) {
                it2.remove(); // 安全删除
            }
        }
        System.out.println("删除 C/E 后: " + list);

        // ===== fail-fast 演示：遍历时直接 remove 会抛异常 =====
        List<String> failList = new ArrayList<>(Arrays.asList("1", "2", "3"));
        try {
            for (String s : failList) {
                if (s.equals("2")) failList.remove(s); // 触发 fail-fast
            }
        } catch (ConcurrentModificationException ex) {
            System.out.println("捕获 fail-fast: ConcurrentModificationException");
        }

        // ===== fail-safe：CopyOnWriteArrayList 遍历时修改不抛异常 =====
        CopyOnWriteArrayList<String> safeList = new CopyOnWriteArrayList<>(Arrays.asList("x", "y", "z"));
        for (String s : safeList) {
            if (s.equals("y")) safeList.remove(s); // 不抛异常
        }
        System.out.println("fail-safe 删除后: " + safeList);

        // ===== ListIterator：双向遍历与修改 =====
        List<String> llist = new ArrayList<>(Arrays.asList("甲", "乙", "丙"));
        ListIterator<String> li = llist.listIterator();

        // 正向遍历
        System.out.print("正向: ");
        while (li.hasNext()) {
            System.out.print(li.next() + " ");
        }
        System.out.println();

        // 反向遍历
        System.out.print("反向: ");
        while (li.hasPrevious()) {
            System.out.print(li.previous() + " ");
        }
        System.out.println();

        // 在遍历中 set 替换
        ListIterator<String> li2 = llist.listIterator();
        while (li2.hasNext()) {
            String s = li2.next();
            if (s.equals("乙")) li2.set("Bee"); // 替换
        }
        System.out.println("set 替换后: " + llist);

        // 在遍历中 add 插入
        ListIterator<String> li3 = llist.listIterator();
        while (li3.hasNext()) {
            String s = li3.next();
            if (s.equals("Bee")) li3.add("插入项"); // 在 Bee 后插入
        }
        System.out.println("add 插入后: " + llist);

        // ===== Iterable 自定义：实现一个简单迭代器 =====
        Range range = new Range(1, 5);
        System.out.print("自定义 Range 迭代: ");
        for (int x : range) {
            System.out.print(x + " ");
        }
        System.out.println();
    }
}

// 非公开辅助类：实现 Iterable 的范围类
class Range implements Iterable<Integer> {
    private final int start;
    private final int end;

    Range(int start, int end) {
        this.start = start;
        this.end = end;
    }

    @Override
    public Iterator<Integer> iterator() {
        return new Iterator<Integer>() {
            private int cur = start;

            @Override
            public boolean hasNext() {
                return cur < end;
            }

            @Override
            public Integer next() {
                if (!hasNext()) throw new NoSuchElementException();
                return cur++;
            }
        };
    }
}`
  },
  {
    id: "java-collections-utils",
    group: "集合框架深入",
    icon: "🧰",
    title: "Collections 工具类",
    content: `# Collections 工具类

\`java.util.Collections\` 是一个**工具类**（全静态方法），提供对集合的常用操作：排序、查找、混排、不可变包装、线程安全包装等。

## 排序与顺序

\`\`\`java
Collections.sort(list);                       // 自然排序（原地）
Collections.sort(list, comparator);           // 比较器排序
Collections.reverse(list);                    // 反转
Collections.shuffle(list);                    // 随机混排
Collections.shuffle(list, random);            // 指定随机源
Collections.swap(list, i, j);                 // 交换两个位置
Collections.rotate(list, distance);           // 旋转（循环移位）
\`\`\`

sort 底层使用 \`List.sort\` → \`Arrays.sort\`（TimSort，O(n log n) 稳定排序）。

## 查找与统计

\`\`\`java
Collections.binarySearch(sortedList, key);    // 二分查找，返回索引（要求已排序）
Collections.max(coll);                        // 最大值
Collections.max(coll, comparator);  // 调用 Collections 的 max 方法
Collections.min(coll);                        // 最小值
Collections.frequency(coll, obj);             // 元素出现次数
Collections.disjoint(c1, c2);                 // 两集合是否无交集
Collections.indexOfSubList(src, target);      // 子列表首次出现位置
\`\`\`

## 填充与复制

\`\`\`java
Collections.fill(list, obj);      // 用 obj 填充整个列表
Collections.copy(dest, src);      // 复制 src 到 dest（dest 需 >= src 长度）
Collections.replaceAll(list, old, new); // 替换所有 old 为 new
\`\`\`

## 不可变包装

将可变集合包装为**不可变视图**，任何修改操作抛 \`UnsupportedOperationException\`：

\`\`\`java
Collections.unmodifiableList(list);  // 调用 Collections 的 unmodifiableList 方法
Collections.unmodifiableSet(set);  // 调用 Collections 的 unmodifiableSet 方法
Collections.unmodifiableMap(map);  // 调用 Collections 的 unmodifiableMap 方法
\`\`\`

注意：这只是视图，原集合修改仍会反映到视图。JDK 9+ 推荐用 \`List.of()\`、\`Map.of()\` 创建真正不可变集合。

## 线程安全包装

\`\`\`java
Collections.synchronizedList(list);  // 调用 Collections 的 synchronizedList 方法
Collections.synchronizedSet(set);  // 调用 Collections 的 synchronizedSet 方法
Collections.synchronizedMap(map);  // 调用 Collections 的 synchronizedMap 方法
\`\`\`

每个方法都加 synchronized 锁，复合操作仍需手动同步。高并发推荐 \`ConcurrentHashMap\`、\`CopyOnWriteArrayList\`。

## 单元素与空集合

\`\`\`java
Collections.singletonList(obj);  // 单元素不可变 List
Collections.singleton(obj);      // 单元素 Set
Collections.singletonMap(k, v);  // 单元素 Map
Collections.emptyList();         // 空不可变 List
Collections.emptySet();  // 调用 Collections 的 emptySet 方法
Collections.emptyMap();  // 调用 Collections 的 emptyMap 方法
\`\`\`

返回不可变实例，避免返回 null，是良好实践。

## 其他

- \`Collections.addAll(coll, elems)\`：批量添加
- \`Collections.checkedList(list, type)\`：运行时类型检查的包装（防御泛型污染）

下面通过代码演示 Collections 工具类的常用方法：`,
    code: `// 演示 Collections 工具类的常用方法
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 排序与顺序操作 =====
        List<Integer> nums = new ArrayList<>(Arrays.asList(5, 2, 8, 1, 9, 3));
        Collections.sort(nums);
        System.out.println("升序: " + nums);
        Collections.reverse(nums);
        System.out.println("反转: " + nums);
        Collections.shuffle(nums);
        System.out.println("混排: " + nums);
        Collections.sort(nums);
        Collections.swap(nums, 0, nums.size() - 1);
        System.out.println("交换首尾: " + nums);
        Collections.rotate(nums, 2);
        System.out.println("旋转2位: " + nums);

        // ===== 查找与统计 =====
        Collections.sort(nums);
        System.out.println("排序后: " + nums);
        int idx = Collections.binarySearch(nums, 5);
        System.out.println("二分查找5的索引: " + idx);
        System.out.println("max: " + Collections.max(nums));
        System.out.println("min: " + Collections.min(nums));

        List<String> words = Arrays.asList("a", "b", "a", "c", "a");
        System.out.println("frequency(a): " + Collections.frequency(words, "a"));
        System.out.println("disjoint([a],[x]): " + Collections.disjoint(
            Arrays.asList("a"), Arrays.asList("x")));

        // ===== 填充与复制 =====
        List<String> fill = new ArrayList<>(Arrays.asList("1", "2", "3"));
        Collections.fill(fill, "X");
        System.out.println("fill: " + fill);
        List<String> src = Arrays.asList("A", "B", "C");
        List<String> dest = new ArrayList<>(Arrays.asList("", "", "", ""));
        Collections.copy(dest, src);
        System.out.println("copy 后 dest: " + dest);

        List<String> rep = new ArrayList<>(Arrays.asList("a", "b", "a"));
        Collections.replaceAll(rep, "a", "Z");
        System.out.println("replaceAll: " + rep);

        // ===== 不可变包装 =====
        List<String> mutable = new ArrayList<>(Arrays.asList("X", "Y"));
        List<String> immutable = Collections.unmodifiableList(mutable);
        System.out.println("不可变视图: " + immutable);
        try {
            immutable.add("Z"); // 抛异常
        } catch (UnsupportedOperationException ex) {
            System.out.println("不可变 List 添加被拒绝");
        }
        // 注意：原集合修改会反映到视图
        mutable.add("Z");
        System.out.println("原集合修改后视图: " + immutable);

        // ===== 线程安全包装 =====
        List<String> syncList = Collections.synchronizedList(new ArrayList<>());
        syncList.add("线程安全");
        System.out.println("synchronizedList: " + syncList);

        // ===== 单元素与空集合 =====
        List<String> one = Collections.singletonList("唯一");
        System.out.println("singletonList: " + one);
        Set<Integer> empty = Collections.emptySet();
        System.out.println("emptySet size: " + empty.size());

        // ===== addAll 批量添加 =====
        List<String> batch = new ArrayList<>();
        Collections.addAll(batch, "甲", "乙", "丙", "丁");
        System.out.println("addAll: " + batch);

        // ===== 应用：扑克牌洗牌 =====
        List<Integer> deck = new ArrayList<>();
        for (int i = 1; i <= 13; i++) deck.add(i);
        Collections.shuffle(deck);
        System.out.println("洗牌后前5张: " + deck.subList(0, 5));
        Collections.sort(deck);
        System.out.println("排序后: " + deck);
    }
}`
  },
  {
    id: "java-collection-traversal",
    group: "集合框架深入",
    icon: "🏃",
    title: "集合遍历方式",
    content: `# 集合遍历方式

Java 提供多种集合遍历方式，各有适用场景。掌握它们的差异有助于写出更高效、更安全的代码。

## 方式一：for-each（增强 for 循环）

\`\`\`java
for (String s : list) {  // 增强 for：遍历 list，每次取一个元素 s
    System.out.println(s);  // 打印一行到标准输出（自动换行）
}
\`\`\`

底层调用 Iterator，语法简洁。**不能在遍历时修改集合**（会抛 ConcurrentModificationException）。

## 方式二：Iterator

\`\`\`java
Iterator<String> it = list.iterator();  // 声明变量 it（Iterator<String>），初始值为 list.iterator()
while (it.hasNext()) {  // while 循环：当 it.hasNext() 为真时重复执行
    String s = it.next();  // 声明变量 s（String），初始值为 it.next()
    if (s.isEmpty()) it.remove(); // 唯一能在遍历时安全删除的方式
}
\`\`\`

适合需要遍历中删除元素的场景。

## 方式三：ListIterator（仅 List）

支持双向遍历和 set/add 修改：

\`\`\`java
ListIterator<String> li = list.listIterator();  // 声明变量 li（ListIterator<String>），初始值为 list.listIterator()
while (li.hasNext()) {  // while 循环：当 li.hasNext() 为真时重复执行
    String s = li.next();  // 声明变量 s（String），初始值为 li.next()
    li.set(s.toUpperCase()); // 替换
}
\`\`\`

## 方式四：经典 for + 索引（仅 List）

\`\`\`java
for (int i = 0; i < list.size(); i++) {  // for 循环：初始化 int i = 0；条件 i < list.size()；更新 i++
    System.out.println(list.get(i));  // 打印一行到标准输出（自动换行）
}
\`\`\`

仅 ArrayList 高效（O(1) get），LinkedList 会退化为 O(n²)。可在遍历时通过 set 修改，但删除需注意索引回退。

## 方式五：forEach + lambda（JDK 8+）

\`\`\`java
list.forEach(s -> System.out.println(s));  // Lambda 表达式：实现函数式接口
\`\`\`

内部迭代，简洁优雅。Map 也有 \`forEach((k, v) -> ...)\`。

## 方式六：Stream（JDK 8+）

\`\`\`java
list.stream().filter(s -> s.length() > 3).forEach(System.out::println);  // Lambda 表达式：实现函数式接口
\`\`\`

支持过滤、映射、聚合等链式操作，函数式风格。可并行：\`list.parallelStream()\`。

## 性能对比

| 方式 | ArrayList | LinkedList | 备注 |
|------|-----------|------------|------|
| for-each / Iterator | 快 | 快 | 通用推荐 |
| 索引 for | 快 O(n) | 慢 O(n²) | 仅适合随机访问列表 |
| forEach lambda | 快 | 快 | 内部迭代，可能被优化 |
| Stream | 略慢 | 略慢 | 适合复杂处理 |

## 遍历时修改集合

- **for-each**：禁止修改，抛 ConcurrentModificationException
- **Iterator.remove()**：唯一安全删除方式
- **Stream**：源集合不可修改，但可生成新集合
- **CopyOnWriteArrayList**：遍历时修改不抛异常（fail-safe）

## Map 遍历

\`\`\`java
// 推荐：entrySet
for (Map.Entry<K,V> e : map.entrySet()) { ... }
// JDK 8+
map.forEach((k, v) -> ...);  // Lambda 表达式：实现函数式接口
// 仅需 key
for (K k : map.keySet()) { ... }
\`\`\`

entrySet 一次拿到键值对，避免重复 get，性能最佳。

## 选择建议

- 简单遍历 → for-each 或 forEach
- 需要删除 → Iterator.remove
- 需要索引 → 索引 for（仅 ArrayList）
- 复杂处理（过滤/映射/聚合） → Stream
- Map 遍历 → entrySet 或 forEach

下面通过代码演示各种遍历方式及其性能对比：`,
    code: `// 演示集合的各种遍历方式及性能对比
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

public class Main {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>();
        for (int i = 0; i < 10; i++) list.add(i);

        // ===== 方式一：for-each =====
        System.out.print("for-each: ");
        for (int x : list) System.out.print(x + " ");
        System.out.println();

        // ===== 方式二：Iterator =====
        System.out.print("Iterator: ");
        Iterator<Integer> it = list.iterator();
        while (it.hasNext()) System.out.print(it.next() + " ");
        System.out.println();

        // ===== 方式三：索引 for =====
        System.out.print("索引 for: ");
        for (int i = 0; i < list.size(); i++) System.out.print(list.get(i) + " ");
        System.out.println();

        // ===== 方式四：forEach + lambda =====
        System.out.print("forEach: ");
        list.forEach(x -> System.out.print(x + " "));
        System.out.println();

        // ===== 方式五：Stream =====
        System.out.print("Stream(偶数): ");
        list.stream().filter(x -> x % 2 == 0).forEach(x -> System.out.print(x + " "));
        System.out.println();

        // ===== 方式六：ListIterator 双向遍历 =====
        List<Integer> llist = new ArrayList<>(list);
        ListIterator<Integer> li = llist.listIterator(llist.size());
        System.out.print("ListIterator 反向: ");
        while (li.hasPrevious()) System.out.print(li.previous() + " ");
        System.out.println();

        // ===== 遍历时安全删除（Iterator.remove） =====
        List<String> strs = new ArrayList<>(Arrays.asList("a", "", "b", "", "c"));
        Iterator<String> si = strs.iterator();
        while (si.hasNext()) {
            if (si.next().isEmpty()) si.remove();
        }
        System.out.println("删除空字符串后: " + strs);

        // ===== 遍历时修改：fail-safe（CopyOnWriteArrayList） =====
        CopyOnWriteArrayList<String> cow = new CopyOnWriteArrayList<>(Arrays.asList("1", "2", "3"));
        for (String s : cow) {
            if (s.equals("2")) cow.remove(s); // 不抛异常
        }
        System.out.println("CopyOnWrite 删除后: " + cow);

        // ===== Map 遍历 =====
        Map<String, Integer> map = new HashMap<>();
        map.put("apple", 3);
        map.put("banana", 5);
        // entrySet（推荐）
        System.out.print("entrySet: ");
        for (Map.Entry<String, Integer> e : map.entrySet()) {
            System.out.print(e.getKey() + "=" + e.getValue() + " ");
        }
        System.out.println();
        // forEach
        System.out.print("Map forEach: ");
        map.forEach((k, v) -> System.out.print(k + ":" + v + " "));
        System.out.println();

        // ===== 性能对比 =====
        int n = 1_000_000;
        List<Integer> big = new ArrayList<>();
        for (int i = 0; i < n; i++) big.add(i);

        long t1 = System.nanoTime();
        long sum1 = 0;
        for (int x : big) sum1 += x;
        long t2 = System.nanoTime();

        long t3 = System.nanoTime();
        long sum2 = 0;
        for (int i = 0; i < big.size(); i++) sum2 += big.get(i);
        long t4 = System.nanoTime();

        long t5 = System.nanoTime();
        long sum3 = big.stream().mapToLong(Integer::longValue).sum();
        long t6 = System.nanoTime();

        long t7 = System.nanoTime();
        final long[] sum4 = {0};
        big.forEach(x -> sum4[0] += x);
        long t8 = System.nanoTime();

        System.out.println("for-each 求和: " + sum1 + " 耗时 " + (t2 - t1) / 1_000_000 + " ms");
        System.out.println("索引 for 求和: " + sum2 + " 耗时 " + (t4 - t3) / 1_000_000 + " ms");
        System.out.println("Stream 求和: " + sum3 + " 耗时 " + (t6 - t5) / 1_000_000 + " ms");
        System.out.println("forEach 求和: " + sum4[0] + " 耗时 " + (t8 - t7) / 1_000_000 + " ms");

        // ===== LinkedList 索引遍历陷阱 =====
        List<Integer> linked = new LinkedList<>();
        for (int i = 0; i < 10000; i++) linked.add(i);
        long t9 = System.nanoTime();
        long s = 0;
        for (int i = 0; i < linked.size(); i++) s += linked.get(i); // O(n²) 慢!
        long t10 = System.nanoTime();
        System.out.println("LinkedList 索引遍历1w: " + (t10 - t9) / 1_000_000 + " ms (O(n²) 慎用)");
    }
}`
  }
];
