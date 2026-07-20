// =============================================================
// C# 从入门到精通大全（全新版）—— 第 6 批章节
// 第四部分 泛型与集合（共 7 章）
// -------------------------------------------------------------
// 本批包含 7 章：
//   csharp4-ch28 : 第二十八章 泛型基础
//   csharp4-ch29 : 第二十九章 集合与 IEnumerable
//   csharp4-ch30 : 第三十章 List 与 LinkedList
//   csharp4-ch31 : 第三十一章 Dictionary 与 HashSet
//   csharp4-ch32 : 第三十二章 Queue 与 Stack
//   csharp4-ch33 : 第三十三章 SortedList 与 SortedDictionary
//   csharp4-ch34 : 第三十四章 并发集合
//
// 风格：demo 驱动，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，所有示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第二十八章：泛型基础
  // ============================================================
  {
    id: 'csharp4-ch28',
    group: '第四部分 泛型与集合',
    icon: '🎯',
    title: '泛型基础',
    content: `## 第二十八章　泛型基础

泛型（Generic）是 C# 2.0 引入的重量级特性，它把"类型"当作参数，让你写一份代码就能用于多种类型，同时保留类型安全和性能。没有泛型的世界几乎不可想象。

### 一、为什么需要泛型 ⭐

想象你要写一个"栈"数据结构，能存 int、能存 string、能存 Person。在泛型出现之前只有两条路：

1. 为每种类型写一个版本（IntStack、StringStack、PersonStack...）——代码重复到爆炸。
2. 写一个 \`ObjectStack\`，元素类型用 \`object\`——能存任何东西，但有两个致命问题：
   - **装箱拆箱**：值类型（int 等）转 object 要装箱（在堆上分配），取出来要拆箱，性能损耗巨大。
   - **类型不安全**：你能往"应该是 int 的栈"里塞一个 string，编译时不报错，运行时炸。

泛型一出现，两个问题同时解决：

\`\`\`csharp
Stack<int>    ints = new();   // 只能存 int，没有装箱
Stack<string> strs = new();   // 只能存 string
ints.Push(42);
// ints.Push("hello");  // ❌ 编译错误，类型安全
\`\`\`

### 二、泛型类声明

用 \`<T>\` 声明一个类型参数，T 可以在类内任何地方当作真实类型使用：

\`\`\`csharp
class Stack<T>
{
    private T[] _items = new T[4];
    private int _count = 0;

    public void Push(T item) => _items[_count++] = item;
    public T Pop() => _items[--_count];
}
\`\`\`

实例化时用 \`<具体类型>\` 指定 T 是什么：\`new Stack<int>()\`。

### 三、泛型方法

泛型不仅能用在类上，也能单独用在方法上。方法名后跟 \`<T>\`：

\`\`\`csharp
T Max<T>(T a, T b) where T : IComparable<T> =>
    a.CompareTo(b) >= 0 ? a : b;
\`\`\`

调用时通常可以省略类型参数，编译器会根据实参推断：\`Max(3, 5)\` 自动推断 T = int。

### 四、泛型接口

\`IRepository<T>\`、\`IList<T>\`、\`IEnumerable<T>\` 都是泛型接口。它们让"集合能存什么"成为接口契约的一部分：

\`\`\`csharp
interface IRepository<T>
{
    void Add(T item);
    T Get(int id);
    IEnumerable<T> GetAll();
}
\`\`\`

### 五、类型参数命名约定

虽然 T 可以叫任何名字，但社区有约定俗成的命名：

| 命名 | 含义 |
| --- | --- |
| T | 通用单一类型参数 |
| TKey | 字典的键类型 |
| TValue | 字典的值类型 |
| TInput / TOutput | 委托/转换器的输入输出 |
| TElement | 集合中的元素类型 |

### 六、泛型字段与泛型属性

类级别的泛型参数 T 可以直接用作字段和属性类型：

\`\`\`csharp
class Box<T>
{
    public T Value { get; set; }   // 泛型属性
    private T _default = default;  // 泛型字段，default 给默认值
}
\`\`\`

\`default(T)\` 或 \`default\` 返回 T 的默认值（引用类型为 null，值类型为 0/false）。

### 七、泛型委托简介

\`Action<T>\`、\`Func<T, TResult>\`、\`Predicate<T>\` 都是泛型委托，是 LINQ 和异步编程的基石。你也可以自定义：

\`\`\`csharp
delegate T Transformer<T>(T input);
\`\`\`

### 八、泛型约束（where）

如果不加约束，T 只能调用 \`object\` 的方法（ToString、Equals 等）。要让 T "能比较、能 new、是引用类型"，必须用 \`where\` 约束：

| 约束 | 含义 |
| --- | --- |
| \`where T : class\` | T 必须是引用类型 |
| \`where T : struct\` | T 必须是值类型（不可为 null） |
| \`where T : new()\` | T 必须有无参公共构造函数 |
| \`where T : IComparable<T>\` | T 必须实现该接口 |
| \`where T : BaseClass\` | T 必须继承 BaseClass |
| \`where T : notnull\` | T 不可为 null |

### 九、约束组合

\`\`\`csharp
class Factory<T> where T : class, IComparable<T>, new()
{
    public T Create() => new T();
}
\`\`\`

多个约束用逗号分隔。注意 \`new()\` 必须放在最后。

### 十、多个类型参数

\`Dictionary<TKey, TValue>\` 就有两个。你可以定义任意多个，但超过 2 个就该想想设计是否合理了。

### 十一、泛型与继承

- \`List<int>\` 和 \`List<string>\` 是**两个完全不同的类型**，互相不能赋值。
- 派生类可以指定基类的类型参数：\`class IntStack : Stack<int> { }\`。
- 派生类也可以继续保持泛型：\`class MyStack<T> : Stack<T> { }\`。

### 十二、协变 out 与逆变 in

这是泛型最精妙的部分。默认情况下 \`IList<Cat>\` 不能赋值给 \`IList<Animal>\`——因为如果可以，你就能往里塞 Dog，类型安全就崩了。但对于"只读"和"只写"的接口可以放宽：

- **协变（out）**：\`IEnumerable<out T>\` 只能"产出" T，不能"消费" T。所以 \`IEnumerable<Cat>\` 可以赋值给 \`IEnumerable<Animal>\`。
- **逆变（in）**：\`Action<in T>\` 只能"消费" T，不能"产出" T。所以 \`Action<Animal>\` 可以赋值给 \`Action<Cat>\`（一个能处理任何动物的处理器当然能处理猫）。

记忆口诀：**out 用于读（产出），in 用于写（消费）**。

本章 demo 实现完整的泛型 Stack<T>，演示泛型方法 Max<T>、约束、协变逆变。`,
    code: `// C# 12 顶级语句 - 泛型基础演示
// 实现：泛型 Stack<T>、泛型方法 Max<T>、协变 out / 逆变 in

using System;
using System.Collections;
using System.Collections.Generic;

// === 1. 泛型类 Stack<T> ===
// T 是类型参数，可在类内任意位置当作真实类型使用
public class Stack<T>
{
    // 泛型字段：用 T 作为元素类型
    private T[] _items;   // 内部数组存储元素
    private int _count;   // 当前元素数量

    // 构造函数：初始化容量
    public Stack(int capacity = 4)
    {
        _items = new T[capacity];
        _count = 0;
    }

    // 泛型属性：返回当前元素数
    public int Count => _count;

    // Push 方法：参数类型为 T
    public void Push(T item)
    {
        // 容量不够时扩容（×2）
        if (_count >= _items.Length)
        {
            Array.Resize(ref _items, _items.Length * 2);
        }
        _items[_count++] = item;  // 存入并自增
    }

    // Pop 方法：返回类型为 T
    public T Pop()
    {
        if (_count == 0)
            throw new InvalidOperationException("栈为空");
        // --_count 先减再用作索引
        T item = _items[--_count];
        _items[_count] = default!;  // 清空引用，让 GC 回收
        return item;
    }

    // Peek：查看栈顶但不弹出
    public T Peek() => _count == 0
        ? throw new InvalidOperationException("栈为空")
        : _items[_count - 1];

    // 实现 IEnumerable<T> 让 Stack 可被 foreach
    public IEnumerator<T> GetEnumerator()
    {
        // 从栈顶到栈底枚举
        for (int i = _count - 1; i >= 0; i--)
            yield return _items[i];
    }

    // 显式实现非泛型版本（兼容老代码）
    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}

// === 2. 泛型方法 Max<T> ===
// where T : IComparable<T> 约束 T 必须可比较
public static class MathHelper
{
    public static T Max<T>(T a, T b) where T : IComparable<T>
    {
        // CompareTo: 返回 <0 表示 a<b，==0 表示相等，>0 表示 a>b
        return a.CompareTo(b) >= 0 ? a : b;
    }

    // 多个类型参数 + 约束组合：T 必须是引用类型 + 可比较 + 有无参构造
    public static T CreateAndCompare<T>(T a, T b)
        where T : class, IComparable<T>, new()
    {
        var instance = new T();  // new() 约束允许直接 new T()
        Console.WriteLine($"  新建实例类型：{instance.GetType().Name}");
        return Max(a, b);
    }
}

// === 3. 协变 out / 逆变 in 演示 ===
// 协变：接口用 out 修饰 T，表示 T 只能作为返回值（产出）
public interface IProducer<out T>
{
    T Produce();
}

public class CatProducer : IProducer<Cat>
{
    public Cat Produce() => new Cat("小橘");
}

// 逆变：接口用 in 修饰 T，表示 T 只能作为参数（消费）
public interface IConsumer<in T>
{
    void Consume(T item);
}

public class AnimalConsumer : IConsumer<Animal>
{
    public void Consume(Animal item) =>
        Console.WriteLine($"  消费动物：{item.Name}");
}

// 基类与派生类
public class Animal
{
    public string Name { get; }
    public Animal(string name) => Name = name;
    public override string ToString() => Name;
}

public class Cat : Animal
{
    public Cat(string name) : base(name) { }
}

// === 4. 顶级语句：演示各种用法 ===
Console.WriteLine("=== 1. 泛型 Stack<T> 演示 ===");

// 创建 int 栈：T=int 是值类型直接存，没有装箱
var intStack = new Stack<int>();
intStack.Push(10);
intStack.Push(20);
intStack.Push(30);
Console.WriteLine($"栈大小：{intStack.Count}");
Console.WriteLine($"栈顶：{intStack.Peek()}");
Console.WriteLine($"弹出：{intStack.Pop()}");
Console.WriteLine($"弹出：{intStack.Pop()}");

// 创建 string 栈
var strStack = new Stack<string>();
strStack.Push("hello");
strStack.Push("world");
// strStack.Push(42);  // ❌ 编译错误，类型安全
foreach (var s in strStack)  // 用 IEnumerable<T> 遍历
    Console.WriteLine($"  遍历：{s}");

Console.WriteLine("\\n=== 2. 泛型方法 Max<T> 演示 ===");
// 类型推断：Max(3, 5) 自动推断 T=int
Console.WriteLine($"Max(3, 5) = {MathHelper.Max(3, 5)}");
// 字符串比较（按字典序）
Console.WriteLine($"Max(\\"apple\\", \\"banana\\") = {MathHelper.Max("apple", "banana")}");
// 日期比较
var d1 = new DateTime(2024, 1, 1);
var d2 = new DateTime(2023, 6, 15);
Console.WriteLine($"Max(日期) = {MathHelper.Max(d1, d2):yyyy-MM-dd}");

Console.WriteLine("\\n=== 3. 协变 out 演示 ===");
// 协变：IProducer<Cat> 可以赋值给 IProducer<Animal>
// 因为 IProducer 只"产出" T，Cat 产出者产出 Cat 也是 Animal
IProducer<Cat> catProducer = new CatProducer();
IProducer<Animal> animalProducer = catProducer;  // ✅ 协变合法
Animal produced = animalProducer.Produce();
Console.WriteLine($"  协变产出的对象：{produced.Name}");

Console.WriteLine("\\n=== 4. 逆变 in 演示 ===");
// 逆变：IConsumer<Animal> 可以赋值给 IConsumer<Cat>
// 因为 IConsumer 只"消费" T，能处理 Animal 的消费者当然能处理 Cat
IConsumer<Animal> animalConsumer = new AnimalConsumer();
IConsumer<Cat> catConsumer = animalConsumer;  // ✅ 逆变合法
catConsumer.Consume(new Cat("小橘"));

Console.WriteLine("\\n=== 5. 反例：IList<T> 不支持协变 ===");
// IList<T> 的 T 既用于读又用于写，所以既不是 out 也不是 in
// IList<Cat> cats = new List<Cat>();
// IList<Animal> animals = cats;  // ❌ 编译错误
// 否则：animals.Add(new Dog()) 就能把 Dog 塞进 Cat 列表，类型安全崩塌
Console.WriteLine("  IList<T> 不支持协变/逆变（T 同时用于读写）");`,
    lang: 'cs',
  },

  // ============================================================
  // 第二十九章：集合与 IEnumerable
  // ============================================================
  {
    id: 'csharp4-ch29',
    group: '第四部分 泛型与集合',
    icon: '📚',
    title: '集合与 IEnumerable',
    content: `## 第二十九章　集合与 IEnumerable

数组是最基础的集合，但容量固定。真实开发中我们更需要能动态扩容、能遍历、能查询的"集合类型"。C# 的集合体系围绕 \`IEnumerable\` 接口构建，理解它就理解了一切集合的本质。

### 一、集合的概念

"集合"是一个宽泛的词，指"一组对象的容器"。C# 在 \`System.Collections\` 和 \`System.Collections.Generic\` 命名空间下提供了大量集合类型：

- **顺序集合**：List、LinkedList、Array
- **键值集合**：Dictionary、SortedList、SortedDictionary
- **集合运算**：HashSet、SortedSet
- **专用集合**：Queue、Stack、PriorityQueue

它们都实现某个统一接口，所以可以用同一套方式操作。

### 二、IEnumerable 与 IEnumerator ⭐

\`IEnumerable\` 是所有集合的根接口。它的定义极其简单：

\`\`\`csharp
public interface IEnumerable
{
    IEnumerator GetEnumerator();  // 返回一个迭代器
}
\`\`\`

\`IEnumerator\` 是真正的迭代器，有三个成员：

\`\`\`csharp
public interface IEnumerator
{
    bool MoveNext();   // 移到下一个元素，返回是否还有
    object Current { get; }  // 当前元素
    void Reset();      // 重置到起点
}
\`\`\`

\`foreach\` 语法糖本质上就是：调用 GetEnumerator，循环 MoveNext，读取 Current。所以**任何实现了 IEnumerable 的类型都能被 foreach**。

\`IEnumerable<T>\` 是泛型版本，避免了 object 装箱，是现代 C# 的首选。

### 三、迭代器 yield return

实现 IEnumerable 最方便的方式是 \`yield return\`。编译器会自动生成状态机：

\`\`\`csharp
public IEnumerable<int> GetNumbers()
{
    for (int i = 0; i < 3; i++)
        yield return i;  // 每次循环"产出"一个值
}
\`\`\`

\`yield return\` 是**惰性求值**的——调用 GetNumbers 不会立即执行循环，而是在每次 MoveNext 时才执行到下一个 yield。这种特性是 LINQ 延迟执行的基石。

### 四、ICollection 接口

\`ICollection<T>\` 在 IEnumerable 之上增加了"集合基础操作"：

\`\`\`csharp
public interface ICollection<T> : IEnumerable<T>
{
    int Count { get; }
    bool IsReadOnly { get; }
    void Add(T item);
    bool Remove(T item);
    void Clear();
    bool Contains(T item);
    void CopyTo(T[] array, int arrayIndex);
}
\`\`\`

### 五、IList 接口

\`IList<T>\` 在 ICollection 之上增加了"按索引访问"：

\`\`\`csharp
public interface IList<T> : ICollection<T>
{
    T this[int index] { get; set; }  // 索引器
    int IndexOf(T item);
    void Insert(int index, T item);
    void RemoveAt(int index);
}
\`\`\`

\`List<T>\` 是它最经典的实现。

### 六、IDictionary 接口

\`\`\`csharp
public interface IDictionary<TKey, TValue> :
    ICollection<KeyValuePair<TKey, TValue>>,
    IEnumerable<KeyValuePair<TKey, TValue>>
{
    TValue this[TKey key] { get; set; }
    ICollection<TKey> Keys { get; }
    ICollection<TValue> Values { get; }
    void Add(TKey key, TValue value);
    bool ContainsKey(TKey key);
    bool Remove(TKey key);
    bool TryGetValue(TKey key, out TValue value);
}
\`\`\`

### 七、集合初始化器

C# 3+ 支持在创建集合时一次性填入元素：

\`\`\`csharp
var list = new List<int> { 1, 2, 3, 4, 5 };
var dict = new Dictionary<string, int>
{
    ["apple"] = 5,
    ["banana"] = 3
};
\`\`\`

只要类型实现了 IEnumerable 且有 \`Add\` 方法就能用这种语法。

### 八、集合表达式（C# 12 新语法）⭐

C# 12 引入了更简洁的 \`[]\` 语法：

\`\`\`csharp
int[] arr = [1, 2, 3];
List<int> list = [1, 2, 3];
HashSet<int> set = [1, 2, 3];

// 展开运算符 ..
int[] a = [1, 2];
int[] b = [.. a, 3, 4];  // [1, 2, 3, 4]
\`\`\`

编译器根据左侧类型自动推断右侧构造哪种集合。这是 C# 12 最重要的语法糖之一。

### 九、集合与 LINQ 的关系

\`IEnumerable<T>\` 是 LINQ 的扩展方法挂载点。\`Where\`、\`Select\`、\`OrderBy\` 这些 LINQ 方法本质上是 \`IEnumerable<T>\` 的扩展方法。所以**只要实现 IEnumerable<T>，就能用 LINQ**。后续章节会专门讲 LINQ。

### 十、Array 也是集合

\`int[]\` 实现了 \`IEnumerable<int>\`、\`IList<int>\`，所以它也是集合。但数组长度固定，不能 Add/Remove（这些方法会抛 NotSupportedException）。Array 还实现了 \`ICollection\` 和 \`IList\` 的非泛型版本，以兼容老代码。

### 十一、其他集合类型

- **StringCollection**：\`System.Collections.Specialized\` 下的老古董，专门存 string，现在已被 \`List<string>\` 取代。
- **NameValueCollection**：存键值对（都为 string），同一键可有多值。已被 \`Dictionary<string, List<string>>\` 取代。
- **BitArray**：位数组，用于位运算密集场景。

本章 demo 实现一个自定义 \`MyLinkedList<T>\`，演示 IEnumerable、yield return、集合初始化器、Collection 表达式。`,
    code: `// C# 12 顶级语句 - 集合与 IEnumerable 演示
// 实现：MyLinkedList<T> : IEnumerable<T>、yield return、集合初始化器、Collection 表达式

using System;
using System.Collections;
using System.Collections.Generic;

// === 1. 自定义双向链表 MyLinkedList<T> ===
// 实现 IEnumerable<T> 让它可以被 foreach
public class MyLinkedList<T> : IEnumerable<T>
{
    // 链表节点：内部类
    private class Node
    {
        public T Value;            // 节点值
        public Node? Next;         // 下一个节点
        public Node? Prev;         // 上一个节点

        public Node(T value) => Value = value;
    }

    private Node? _head;  // 头节点
    private Node? _tail;  // 尾节点
    private int _count;   // 节点数

    public int Count => _count;

    // 添加到尾部
    public void Add(T value)
    {
        var node = new Node(value);
        if (_tail == null)
        {
            // 第一个节点：既是头也是尾
            _head = _tail = node;
        }
        else
        {
            // 接到尾节点后
            _tail.Next = node;
            node.Prev = _tail;
            _tail = node;
        }
        _count++;
    }

    // 实现 IEnumerable<T>.GetEnumerator
    // 用 yield return 编写迭代器：编译器自动生成状态机
    public IEnumerator<T> GetEnumerator()
    {
        // 从头遍历到尾，每次 yield 一个 Value
        Node? current = _head;
        while (current != null)
        {
            yield return current.Value;  // 产出当前节点的值
            current = current.Next;       // 移到下一个
        }
        // yield return 是惰性求值：调用方每次 MoveNext 才执行到这里
    }

    // 显式实现非泛型 IEnumerable（兼容老代码）
    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();

    // 反向遍历：演示 yield 的灵活性
    public IEnumerable<T> GetReverse()
    {
        Node? current = _tail;
        while (current != null)
        {
            yield return current.Value;
            current = current.Prev;
        }
    }

    // 支持 Add 方法后，就可以用集合初始化器语法
    // var list = new MyLinkedList<int> { 1, 2, 3 };
}

// === 2. 顶级语句演示 ===
Console.WriteLine("=== 1. 自定义 MyLinkedList + yield return ===");

// 集合初始化器：因为实现了 Add 方法，可以用 { } 语法
var list = new MyLinkedList<string> { "苹果", "香蕉", "橙子" };
list.Add("葡萄");  // 也可以单独 Add

// foreach 会自动调用 GetEnumerator
Console.WriteLine("正序遍历：");
foreach (var item in list)
    Console.WriteLine($"  {item}");

// 用 GetReverse 自定义迭代器
Console.WriteLine("反序遍历：");
foreach (var item in list.GetReverse())
    Console.WriteLine($"  {item}");

Console.WriteLine($"\\n链表大小：{list.Count}");

Console.WriteLine("\\n=== 2. IEnumerable 手动迭代（foreach 的真相）===");
// 手动调用 GetEnumerator / MoveNext / Current
// 这就是 foreach 背后做的事
var numbers = new MyLinkedList<int> { 10, 20, 30 };
using var enumerator = numbers.GetEnumerator();
while (enumerator.MoveNext())
{
    Console.WriteLine($"  Current = {enumerator.Current}");
}

Console.WriteLine("\\n=== 3. 集合初始化器 ===");
// 经典 { } 语法（C# 3+）
var classic = new List<int> { 1, 2, 3, 4, 5 };
Console.WriteLine($"经典初始化器：{string.Join(", ", classic)}");

// 字典初始化器（索引语法）
var ages = new Dictionary<string, int>
{
    ["张三"] = 25,
    ["李四"] = 30,
    ["王五"] = 28
};
foreach (var kv in ages)
    Console.WriteLine($"  {kv.Key}：{kv.Value} 岁");

Console.WriteLine("\\n=== 4. C# 12 集合表达式 ===");
// C# 12 新语法：[] 集合表达式
int[] arr = [1, 2, 3, 4, 5];
List<int> arrList = [10, 20, 30];
HashSet<int> arrSet = [100, 200, 300];

Console.WriteLine($"数组：{string.Join(", ", arr)}");
Console.WriteLine($"List：{string.Join(", ", arrList)}");
Console.WriteLine($"HashSet：{string.Join(", ", arrSet)}");

// 展开运算符 ..：把一个集合"展开"到另一个
int[] part1 = [1, 2, 3];
int[] part2 = [.. part1, 4, 5];  // 等价于 [1, 2, 3, 4, 5]
Console.WriteLine($"展开拼接：{string.Join(", ", part2)}");

// 空集合
int[] empty = [];
Console.WriteLine($"空集合长度：{empty.Length}");

Console.WriteLine("\\n=== 5. Array 也是集合 ===");
// 数组实现 IList<T>、IEnumerable<T>
int[] data = [5, 3, 8, 1, 9];
// 数组可以用 LINQ（因为实现了 IEnumerable<int>）
var sorted = data.OrderBy(x => x);
Console.WriteLine($"数组排序：{string.Join(", ", sorted)}");
Console.WriteLine($"数组长度：{data.Length}");
Console.WriteLine($"数组实现 IList<int>：{data is IList<int>}");

Console.WriteLine("\\n=== 6. yield 惰性求值演示 ===");
// 调用 GetRange 不会立即生成所有数
var range = GetRange(0, 1_000_000);
Console.WriteLine("调用了 GetRange(0, 1000000)，但还没真正执行");
// 直到 foreach 才开始执行
int sum = 0;
foreach (var n in range)
{
    sum += n;
    if (sum > 50) break;  // 提前退出，证明是惰性的
}
Console.WriteLine($"累加到 {sum} 就退出了，没真的遍历 100 万次");

// 本地函数：用 yield return 生成范围
static IEnumerable<int> GetRange(int start, int count)
{
    for (int i = 0; i < count; i++)
        yield return start + i;
}`,
    lang: 'cs',
  },

  // ============================================================
  // 第三十章：List 与 LinkedList
  // ============================================================
  {
    id: 'csharp4-ch30',
    group: '第四部分 泛型与集合',
    icon: '📋',
    title: 'List 与 LinkedList',
    content: `## 第三十章　List 与 LinkedList

\`List<T>\` 是 C# 中使用频率最高的集合，没有之一。它本质是"可自动扩容的数组"，提供了丰富的增删改查 API。\`LinkedList<T>\` 则是双向链表，适合频繁在中间插入/删除的场景。两者各有用武之地。

### 一、List<T> 详解 ⭐

\`List<T>\` 内部维护一个 \`T[]\` 数组，当容量不够时自动扩容（默认翻倍）。它的特点：

- 按索引访问 O(1)
- 末尾 Add O(1) 均摊
- 中间 Insert/Remove O(n)
- 内存连续，缓存友好

### 二、容量 Capacity vs 数量 Count

- **Capacity**：内部数组实际长度（已分配但未必都用）。
- **Count**：实际存储的元素数量。

\`\`\`csharp
var list = new List<int>(capacity: 100);  // 一开始就分配 100 容量
list.Add(1);
// Capacity=100, Count=1
\`\`\`

如果你大概知道要存多少元素，**预分配容量**能避免多次扩容（每次扩容要新建数组并复制），性能提升明显。

### 三、基础增删改查 API

| 方法 | 说明 |
| --- | --- |
| \`Add(item)\` | 末尾添加 |
| \`AddRange(IEnumerable<T>)\` | 批量添加 |
| \`Insert(index, item)\` | 指定位置插入 |
| \`InsertRange(index, collection)\` | 批量插入 |
| \`Remove(item)\` | 移除第一个等于 item 的元素 |
| \`RemoveAt(index)\` | 按索引移除 |
| \`RemoveRange(index, count)\` | 批量移除 |
| \`RemoveAll(predicate)\` | 按条件移除所有匹配 |
| \`Clear()\` | 清空 |
| \`Contains(item)\` | 是否包含 |
| \`IndexOf(item)\` | 查找索引，找不到返回 -1 |
| \`this[index]\` | 索引读写 |
| \`ToArray()\` | 拷贝出新数组 |

### 四、遍历与转换 API

| 方法 | 说明 |
| --- | --- |
| \`ForEach(Action<T>)\` | 对每个元素执行操作 |
| \`ConvertAll<TOutput>(Converter<T, TOutput>)\` | 元素类型转换 |
| \`TrueForAll(Predicate<T>)\` | 是否所有元素都满足条件 |
| \`Exists(Predicate<T>)\` | 是否存在满足条件的元素 |
| \`Find(Predicate<T>)\` | 找第一个匹配 |
| \`FindAll(Predicate<T>)\` | 找所有匹配 |
| \`FindIndex(Predicate<T>)\` | 找第一个匹配的索引 |
| \`FindLast(Predicate<T>)\` | 找最后一个匹配 |

### 五、排序与查找

| 方法 | 说明 |
| --- | --- |
| \`Sort()\` | 原地升序排序 |
| \`Sort(Comparison<T>)\` | 用自定义比较器排序 |
| \`Sort(IComparer<T>)\` | 用 IComparer 排序 |
| \`Reverse()\` | 原地反转 |
| \`BinarySearch(item)\` | 二分查找（必须先排序） |

**重要**：\`BinarySearch\` 要求列表已排序，否则结果不可预测。它返回的索引可能是负数（按位取反后是应插入位置）。

### 六、LinkedList<T> 节点概念

\`LinkedList<T>\` 是双向链表，每个元素是 \`LinkedListNode<T>\`：

\`\`\`csharp
var ll = new LinkedList<string>();
ll.AddLast("a");
ll.AddLast("b");
LinkedListNode<string> node = ll.Find("a")!;
ll.AddAfter(node, "c");  // 在 a 后面插入 c
\`\`\`

特点：

- 任意位置插入/删除 O(1)（前提：已有节点引用）
- 按索引访问 O(n)（没有索引概念）
- 内存不连续，每个节点额外存前后指针

### 七、LinkedList<T> API

| 方法 | 说明 |
| --- | --- |
| \`AddFirst(T)\` / \`AddLast(T)\` | 头部/尾部添加 |
| \`AddBefore(node, T)\` / \`AddAfter(node, T)\` | 节点前后插入 |
| \`Remove(T)\` / \`Remove(node)\` / \`RemoveFirst()\` / \`RemoveLast()\` | 各种删除 |
| \`Find(T)\` / \`FindLast(T)\` | 查找节点 |
| \`First\` / \`Last\` | 头尾节点 |
| \`Count\` | 节点数 |

### 八、循环链表

\`LinkedList<T>\` 本身不是循环的（Last.Next == null）。要实现循环链表需要自己包装：让尾节点的 Next 指回头节点。但这会破坏枚举契约（死循环），所以一般只用于特定算法。

### 九、List vs LinkedList 性能对比

| 操作 | List<T> | LinkedList<T> |
| --- | --- | --- |
| 索引访问 \`list[i]\` | O(1) | O(n) |
| 末尾 Add | O(1) 均摊 | O(1) |
| 头部 Insert | O(n) | O(1) |
| 中间 Insert（已知节点） | O(n) | O(1) |
| 中间 Insert（按索引） | O(n) | O(n)（找节点慢） |
| 内存 | 连续，紧凑 | 每节点额外 16+ 字节 |
| 缓存命中 | 好 | 差 |

**结论**：99% 场景用 \`List<T>\`。只有当你需要频繁在头尾或已知节点前后插入/删除时，才考虑 \`LinkedList<T>\`。

本章 demo 演示 List<T> 全套 API + Find/Sort/BinarySearch + LinkedList<string> 操作。`,
    code: `// C# 12 顶级语句 - List<T> 与 LinkedList<T> 演示
using System;
using System.Collections.Generic;
using System.Diagnostics;

Console.WriteLine("=== 1. List<T> 容量与数量 ===");

// 预分配容量：避免多次扩容
var list = new List<int>(capacity: 10);
Console.WriteLine($"初始 Capacity={list.Capacity}, Count={list.Count}");

// 添加元素
list.Add(10);
list.Add(20);
list.Add(30);
Console.WriteLine($"Add 三个元素后 Capacity={list.Capacity}, Count={list.Count}");

// 用 C# 12 集合表达式创建
List<int> nums = [5, 3, 8, 1, 9, 3, 7];
Console.WriteLine($"集合表达式创建：{string.Join(", ", nums)}");

Console.WriteLine("\\n=== 2. 增删改查 API ===");
// AddRange：批量添加
nums.AddRange([100, 200, 300]);
Console.WriteLine($"AddRange 后：{string.Join(", ", nums)}");

// Insert：指定位置插入
nums.Insert(0, 999);  // 在索引 0 插入
Console.WriteLine($"Insert(0, 999) 后：{string.Join(", ", nums)}");

// Remove：移除第一个匹配
nums.Remove(3);  // 移除第一个 3
Console.WriteLine($"Remove(3) 后：{string.Join(", ", nums)}");

// RemoveAt：按索引移除
nums.RemoveAt(0);  // 移除索引 0
Console.WriteLine($"RemoveAt(0) 后：{string.Join(", ", nums)}");

// RemoveAll：按条件移除
int removed = nums.RemoveAll(x => x >= 100);
Console.WriteLine($"RemoveAll(>=100) 移除了 {removed} 个：{string.Join(", ", nums)}");

// Contains / IndexOf
Console.WriteLine($"Contains(8) = {nums.Contains(8)}");
Console.WriteLine($"IndexOf(3) = {nums.IndexOf(3)}");
Console.WriteLine($"LastIndexOf(3) = {nums.LastIndexOf(3)}");

// ToArray：拷贝出新数组
int[] arr = nums.ToArray();
Console.WriteLine($"ToArray 长度：{arr.Length}");

Console.WriteLine("\\n=== 3. 遍历与转换 API ===");
// ForEach：对每个元素执行操作
nums.ForEach(x => Console.Write($"{x} "));
Console.WriteLine();

// ConvertAll：元素类型转换
List<string> strList = nums.ConvertAll(x => $"[{x}]");
Console.WriteLine($"ConvertAll：{string.Join(", ", strList)}");

// TrueForAll：是否所有元素都满足
Console.WriteLine($"TrueForAll(>0) = {nums.TrueForAll(x => x > 0)}");

// Exists：是否存在
Console.WriteLine($"Exists(>5) = {nums.Exists(x => x > 5)}");

Console.WriteLine("\\n=== 4. Find 系列 ===");
List<Person> people =
[
    new("张三", 25),
    new("李四", 30),
    new("王五", 28),
    new("赵六", 35),
    new("钱七", 28)
];

// Find：找第一个匹配
Person? first28 = people.Find(p => p.Age == 28);
Console.WriteLine($"Find(Age==28)：{first28}");

// FindAll：找所有匹配
List<Person> all28 = people.FindAll(p => p.Age == 28);
Console.WriteLine($"FindAll(Age==28)：{all28.Count} 个");

// FindIndex：找第一个匹配的索引
int idx = people.FindIndex(p => p.Age > 30);
Console.WriteLine($"FindIndex(Age>30)：{idx}");

// FindLast：找最后一个匹配
Person? last28 = people.FindLast(p => p.Age == 28);
Console.WriteLine($"FindLast(Age==28)：{last28}");

Console.WriteLine("\\n=== 5. Sort 与 BinarySearch ===");
List<int> sortList = [5, 3, 8, 1, 9, 2, 7];
Console.WriteLine($"原数组：{string.Join(", ", sortList)}");

// Sort()：升序排序
sortList.Sort();
Console.WriteLine($"Sort()：{string.Join(", ", sortList)}");

// Sort(Comparison<T>)：用 lambda 自定义排序
sortList.Sort((a, b) => b.CompareTo(a));  // 降序
Console.WriteLine($"Sort(降序)：{string.Join(", ", sortList)}");

// Reverse：反转
sortList.Reverse();
Console.WriteLine($"Reverse：{string.Join(", ", sortList)}");

// BinarySearch：必须先排序
sortList.Sort();
int found = sortList.BinarySearch(7);
Console.WriteLine($"BinarySearch(7) 在排序列表中：索引 {found}");

// 找不到时返回的是"按位取反的插入位置"
int notFound = sortList.BinarySearch(6);
int insertAt = ~notFound;  // ~ 是按位取反，得到应插入位置
Console.WriteLine($"BinarySearch(6) 找不到：返回 {notFound}，应插入到 {insertAt}");

Console.WriteLine("\\n=== 6. LinkedList<T> 演示 ===");
var ll = new LinkedList<string>();

// AddFirst / AddLast
ll.AddLast("B");
ll.AddFirst("A");
ll.AddLast("C");
Console.WriteLine($"链表：{string.Join(" -> ", ll)}");

// 在节点前后插入
LinkedListNode<string> nodeB = ll.Find("B")!;
ll.AddBefore(nodeB, "B-前");
ll.AddAfter(nodeB, "B-后");
Console.WriteLine($"插入后：{string.Join(" -> ", ll)}");

// Remove / RemoveFirst / RemoveLast
ll.Remove("B-前");
ll.RemoveFirst();  // 移除 A
ll.RemoveLast();   // 移除 C
Console.WriteLine($"删除后：{string.Join(" -> ", ll)}");

Console.WriteLine($"First={ll.First?.Value}, Last={ll.Last?.Value}, Count={ll.Count}");

Console.WriteLine("\\n=== 7. 性能对比：头部插入 ===");
// List 头部插入 O(n)
var listPerf = new List<int>();
var sw = Stopwatch.StartNew();
for (int i = 0; i < 100_000; i++)
    listPerf.Insert(0, i);  // 每次都要整体后移
sw.Stop();
Console.WriteLine($"List 头部插入 10 万次：{sw.ElapsedMilliseconds} ms");

// LinkedList 头部插入 O(1)
var llPerf = new LinkedList<int>();
sw.Restart();
for (int i = 0; i < 100_000; i++)
    llPerf.AddFirst(i);
sw.Stop();
Console.WriteLine($"LinkedList 头部插入 10 万次：{sw.ElapsedMilliseconds} ms");

// 类型定义
public record Person(string Name, int Age);`,
    lang: 'cs',
  },

  // ============================================================
  // 第三十一章：Dictionary 与 HashSet
  // ============================================================
  {
    id: 'csharp4-ch31',
    group: '第四部分 泛型与集合',
    icon: '🔑',
    title: 'Dictionary 与 HashSet',
    content: `## 第三十一章　Dictionary 与 HashSet

\`Dictionary<TKey, TValue>\` 是 C# 中最常用的键值对集合，相当于 Python 的 dict、Java 的 HashMap。\`HashSet<T>\` 是不重复元素的集合，相当于"只有 key 没有 value"的 Dictionary。它们都基于哈希表实现，提供 O(1) 的查找性能。

### 一、Dictionary<TKey, TValue> ⭐

\`\`\`csharp
var dict = new Dictionary<string, int>();
dict["apple"] = 5;        // 添加或更新
int n = dict["apple"];    // 读取
\`\`\`

底层是哈希表：通过 key 的 \`GetHashCode()\` 计算桶位置，再用 \`Equals\` 解决冲突。所以**正确的 GetHashCode + Equals 实现至关重要**。

### 二、键的唯一性

同一个 key 只能存在一个。重复 Add 同一 key 会抛 \`ArgumentException\`；但用索引器赋值 (\`dict[key] = value\`) 是"upsert"——存在则更新，不存在则添加。

### 三、常用 API

| 方法/属性 | 说明 |
| --- | --- |
| \`Add(key, value)\` | 添加，重复 key 抛异常 |
| \`Remove(key)\` | 移除，返回是否成功 |
| \`ContainsKey(key)\` | 是否包含 key |
| \`ContainsValue(value)\` | 是否包含 value（O(n) 线性查找） |
| \`TryGetValue(key, out value)\` | 安全获取，避免异常 |
| \`this[key]\` | 索引访问，key 不存在抛 KeyNotFoundException |
| \`Keys\` / \`Values\` | 键集合 / 值集合 |
| \`Count\` | 元素数 |
| \`Clear()\` | 清空 |

### 四、TryGetValue：避免异常的最佳实践

\`\`\`csharp
// ❌ 不推荐：key 不存在会抛异常
if (dict.ContainsKey("apple"))
{
    int n = dict["apple"];
}

// ✅ 推荐：一次哈希查找搞定
if (dict.TryGetValue("apple", out int n))
{
    Console.WriteLine(n);
}
\`\`\`

第一种写法要查两次哈希（ContainsKey 一次，\`[]\` 一次），第二种只查一次。

### 五、KeyValuePair 结构

遍历 Dictionary 时每个元素是 \`KeyValuePair<TKey, TValue>\`：

\`\`\`csharp
foreach (var kv in dict)
{
    Console.WriteLine($"{kv.Key} = {kv.Value}");
}
\`\`\`

### 六、键的相等性与自定义比较器

默认用 \`EqualityComparer<TKey>.Default\`，它调用 key 的 \`Equals\` 和 \`GetHashCode\`。如果你想用自定义相等规则（比如不区分大小写的字符串），可以在构造函数传 \`IEqualityComparer<TKey>\`：

\`\`\`csharp
var dict = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
dict["Apple"] = 1;
Console.WriteLine(dict["APPLE"]);  // 1，键不区分大小写
\`\`\`

### 七、遍历顺序

Dictionary 的遍历顺序**不保证**是插入顺序（理论上基于哈希桶顺序，但实现会变）。如果你需要按插入顺序遍历，用 \`List<KeyValuePair>\` 或在 .NET 8+ 使用新的 \`OrderedDictionary\`。

### 八、ConcurrentDictionary 简介

多线程环境下 \`Dictionary\` 不安全。用 \`ConcurrentDictionary\` 提供：

- \`TryAdd\` / \`TryUpdate\` / \`TryRemove\`
- \`GetOrAdd(key, factory)\`：不存在则用工厂创建并添加
- \`AddOrUpdate(key, addValue, updateFactory)\`：原子添加或更新

详细用法在第三十四章讲。

### 九、HashSet<T> ⭐

\`HashSet<T>\` 是"集合运算"专用的容器——元素不重复，支持并集、交集、差集等操作：

\`\`\`csharp
var a = new HashSet<int> { 1, 2, 3, 4 };
var b = new HashSet<int> { 3, 4, 5, 6 };
a.IntersectWith(b);  // a 变成 {3, 4}
\`\`\`

| 方法 | 说明 |
| --- | --- |
| \`Add(item)\` | 添加，已存在返回 false |
| \`Remove(item)\` | 移除 |
| \`Contains(item)\` | 是否包含（O(1)） |
| \`UnionWith(other)\` | 并集 |
| \`IntersectWith(other)\` | 交集 |
| \`ExceptWith(other)\` | 差集（从当前集合移除 other 中的元素） |
| \`SymmetricExceptWith(other)\` | 对称差集（只保留"独占"的元素） |
| \`IsSubsetOf(other)\` | 是否子集 |
| \`IsSupersetOf(other)\` | 是否超集 |
| \`Overlaps(other)\` | 是否有交集 |

### 十、SortedSet<T>

\`SortedSet<T>\` 是"有序的 HashSet"——基于红黑树，元素自动排序。支持 \`Min\`、\`Max\`、\`GetViewBetween\` 等有序操作。添加/查找/删除都是 O(log n)。

### 十一、Lookup<TKey, TElement>

\`Dictionary<TKey, TValue>\` 是"一对一"映射；\`ILookup<TKey, TElement>\` 是"一对多"映射——一个 key 对应多个元素。用 \`Enumerable.ToLookup\` 创建：

\`\`\`csharp
ILookup<int, Person> byAge = people.ToLookup(p => p.Age);
foreach (Person p in byAge[28])  // 所有 28 岁的人
    Console.WriteLine(p);
\`\`\`

本章 demo 演示 Dictionary 全套 API + 自定义比较器 + HashSet 集合运算。`,
    code: `// C# 12 顶级语句 - Dictionary 与 HashSet 演示
using System;
using System.Collections.Generic;
using System.Linq;

Console.WriteLine("=== 1. Dictionary 基础 ===");

// 集合初始化器
var fruitCount = new Dictionary<string, int>
{
    ["apple"] = 5,
    ["banana"] = 3,
    ["orange"] = 8
};

// Add：添加（重复 key 抛异常）
fruitCount.Add("grape", 2);

// 索引器：upsert（存在则更新，不存在则添加）
fruitCount["apple"] = 10;  // 更新
fruitCount["mango"] = 4;   // 添加

// 遍历 KeyValuePair
Console.WriteLine("当前库存：");
foreach (var kv in fruitCount)
    Console.WriteLine($"  {kv.Key}：{kv.Value}");

Console.WriteLine($"总数：{fruitCount.Count}");

Console.WriteLine("\\n=== 2. TryGetValue 最佳实践 ===");

// ❌ 反模式：两次哈希查找
if (fruitCount.ContainsKey("apple"))
{
    int n = fruitCount["apple"];
    Console.WriteLine($"  [反模式] apple = {n}");
}

// ✅ 推荐：一次查找
if (fruitCount.TryGetValue("apple", out int count))
{
    Console.WriteLine($"  [推荐] apple = {count}");
}

// key 不存在时返回 false，out 参数是 default
if (!fruitCount.TryGetValue("cherry", out int missing))
{
    Console.WriteLine($"  cherry 不存在，out = {missing}");
}

// 索引访问：不存在抛异常
try
{
    int _ = fruitCount["cherry"];
}
catch (KeyNotFoundException ex)
{
    Console.WriteLine($"  索引访问不存在的 key 抛：{ex.GetType().Name}");
}

Console.WriteLine("\\n=== 3. Remove 与 Contains ===");
bool removed = fruitCount.Remove("banana");
Console.WriteLine($"Remove(banana) = {removed}");
Console.WriteLine($"ContainsKey(apple) = {fruitCount.ContainsKey("apple")}");
Console.WriteLine($"ContainsValue(8) = {fruitCount.ContainsValue(8)}");

// Keys / Values 集合
Console.WriteLine($"Keys：{string.Join(", ", fruitCount.Keys)}");
Console.WriteLine($"Values：{string.Join(", ", fruitCount.Values)}");

Console.WriteLine("\\n=== 4. 自定义比较器：不区分大小写的键 ===");
// StringComparer.OrdinalIgnoreCase 让字符串键不区分大小写
var caseInsensitive = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
caseInsensitive["Apple"] = 1;
caseInsensitive["APPLE"] = 2;  // 这会更新，不会新增
Console.WriteLine($"APPLE = {caseInsensitive["apple"]}");  // 2
Console.WriteLine($"Count = {caseInsensitive.Count}");  // 1

Console.WriteLine("\\n=== 5. 自定义对象作为 Key（按 Id 判等）===");
// PersonById 重写了 Equals 和 GetHashCode，让 Dictionary 按 Id 判等
var personDict = new Dictionary<PersonById, string>();
var p1 = new PersonById(1, "张三");
var p2 = new PersonById(1, "张三（重名）");  // Id 相同
personDict[p1] = "员工";
personDict[p2] = "经理";  // 因为 Id 相同，会更新而不是新增
Console.WriteLine($"personDict.Count = {personDict.Count}");  // 1
Console.WriteLine($"值 = {personDict[p1]}");  // 经理

Console.WriteLine("\\n=== 6. HashSet<T> 集合运算 ===");
var setA = new HashSet<int> { 1, 2, 3, 4, 5 };
var setB = new HashSet<int> { 4, 5, 6, 7, 8 };

Console.WriteLine($"A = {{{string.Join(", ", setA)}}}");
Console.WriteLine($"B = {{{string.Join(", ", setB)}}}");

// UnionWith：并集（A ∪ B）
var union = new HashSet<int>(setA);
union.UnionWith(setB);
Console.WriteLine($"A ∪ B = {{{string.Join(", ", union)}}}");

// IntersectWith：交集（A ∩ B）
var intersect = new HashSet<int>(setA);
intersect.IntersectWith(setB);
Console.WriteLine($"A ∩ B = {{{string.Join(", ", intersect)}}}");

// ExceptWith：差集（A - B）
var except = new HashSet<int>(setA);
except.ExceptWith(setB);
Console.WriteLine($"A - B = {{{string.Join(", ", except)}}}");

// SymmetricExceptWith：对称差集（只在 A 或只在 B 中）
var symDiff = new HashSet<int>(setA);
symDiff.SymmetricExceptWith(setB);
Console.WriteLine($"A △ B = {{{string.Join(", ", symDiff)}}}");

// 子集 / 超集判断
var subSet = new HashSet<int> { 1, 2 };
Console.WriteLine($"{{1,2}} 是 A 的子集？{subSet.IsSubsetOf(setA)}");
Console.WriteLine($"A 是 {{1,2}} 的超集？{setA.IsSupersetOf(subSet)}");
Console.WriteLine($"A 与 B 有交集？{setA.Overlaps(setB)}");

// Add 重复元素返回 false
bool added = setA.Add(3);
Console.WriteLine($"Add(3) 重复添加返回：{added}");

Console.WriteLine("\\n=== 7. SortedSet<T> 自动排序 ===");
var sorted = new SortedSet<int> { 5, 1, 9, 3, 7, 1 };  // 重复 1 会被去重
Console.WriteLine($"SortedSet：{string.Join(", ", sorted)}");  // 1, 3, 5, 7, 9
Console.WriteLine($"Min = {sorted.Min}, Max = {sorted.Max}");

// GetViewBetween：取范围内的视图
var view = sorted.GetViewBetween(3, 7);
Console.WriteLine($"GetViewBetween(3, 7)：{string.Join(", ", view)}");

Console.WriteLine("\\n=== 8. ToLookup：一对多映射 ===");
var people = new List<Person>
{
    new("张三", 25),
    new("李四", 28),
    new("王五", 28),
    new("赵六", 30),
    new("钱七", 25)
};

// ToLookup：按年龄分组，一个 key 对应多个值
ILookup<int, string> byAge = people.ToLookup(p => p.Age, p => p.Name);

Console.WriteLine($"28 岁的有：{string.Join(", ", byAge[28])}");
Console.WriteLine($"25 岁的有：{string.Join(", ", byAge[25])}");

foreach (var group in byAge)
    Console.WriteLine($"  {group.Key} 岁：{string.Join(", ", group)}");

// 类型定义
public record Person(string Name, int Age);

// 自定义作为 Dictionary Key 的类：重写 Equals 和 GetHashCode 让按 Id 判等
public class PersonById
{
    public int Id { get; }
    public string Name { get; }
    public PersonById(int id, string name) { Id = id; Name = name; }

    // 重写 Equals：只按 Id 比较
    public override bool Equals(object? obj) =>
        obj is PersonById other && other.Id == Id;

    // 重写 GetHashCode：必须与 Equals 一致（Id 相同的对象哈希码必须相同）
    public override int GetHashCode() => Id;
}`,
    lang: 'cs',
  },

  // ============================================================
  // 第三十二章：Queue 与 Stack
  // ============================================================
  {
    id: 'csharp4-ch32',
    group: '第四部分 泛型与集合',
    icon: '🌲',
    title: 'Queue 与 Stack',
    content: `## 第三十二章　Queue 与 Stack

\`Queue<T>\` 是先进先出（FIFO）队列，\`Stack<T>\` 是后进先出（LIFO）栈。它们在算法和工程中无处不在：任务调度、撤销重做、广度/深度优先搜索。\`PriorityQueue<TElement, TPriority>\` 是 .NET 6 引入的优先队列，能按优先级出队。

### 一、Queue<T>：先进先出 FIFO ⭐

想象排队买饭：先到的人先打到饭。\`Queue<T>\` 就是这种"排队"模型。

\`\`\`csharp
var queue = new Queue<string>();
queue.Enqueue("任务1");  // 入队（排到末尾）
queue.Enqueue("任务2");
string first = queue.Dequeue();  // 出队（从头部取）—— "任务1"
\`\`\`

底层是环形数组（circular array），头部和尾部用指针在数组内循环移动，避免频繁搬移数据。

### 二、Queue<T> API

| 方法/属性 | 说明 |
| --- | --- |
| \`Enqueue(item)\` | 入队，加到尾部 |
| \`Dequeue()\` | 出队，从头部取（队空抛异常） |
| \`Peek()\` | 查看头部但不取出 |
| \`TryDequeue(out item)\` | 安全出队（.NET 6+） |
| \`TryPeek(out item)\` | 安全查看 |
| \`Contains(item)\` | 是否包含 |
| \`Clear()\` | 清空 |
| \`ToArray()\` | 拷贝为数组 |
| \`Count\` | 元素数 |

\`Dequeue\` 在队空时抛 \`InvalidOperationException\`。在多线程或不确定状态下用 \`TryDequeue\` 更安全。

### 三、Stack<T>：后进先出 LIFO ⭐

想象一摞盘子：最后放上去的最先拿下来。\`Stack<T>\` 就是"摞盘子"模型。

\`\`\`csharp
var stack = new Stack<int>();
stack.Push(1);  // 压栈
stack.Push(2);
int top = stack.Pop();  // 弹栈 —— 2
\`\`\`

底层是动态数组，Push/Pop 都在尾部操作，O(1) 均摊。

### 四、Stack<T> API

| 方法 | 说明 |
| --- | --- |
| \`Push(item)\` | 压栈 |
| \`Pop()\` | 弹栈（栈空抛异常） |
| \`Peek()\` | 查看栈顶 |
| \`TryPop(out item)\` | 安全弹栈 |
| \`Contains(item)\` | 是否包含 |
| \`Clear()\` | 清空 |
| \`ToArray()\` | 拷贝为数组 |

### 五、应用场景

**Queue 适合**：

- 任务调度器：先到的任务先执行
- 消息队列：FIFO 处理
- BFS（广度优先搜索）：节点按层处理
- 缓冲池：生产者-消费者模型

**Stack 适合**：

- 撤销/重做（Undo/Redo）：每次操作压栈，撤销时弹栈
- 函数调用栈：方法调用层级
- DFS（深度优先搜索）：回溯算法
- 表达式求值：后缀表达式、括号匹配
- 浏览器前进/后退

### 六、PriorityQueue<TElement, TPriority>（.NET 6+）⭐

普通 Queue 是 FIFO，但有时你需要"VIP 优先"。\`PriorityQueue\` 让每个元素带一个优先级，出队时优先级最小的先出（默认是最小堆）。

\`\`\`csharp
var pq = new PriorityQueue<string, int>();
pq.Enqueue("普通任务", 5);
pq.Enqueue("紧急任务", 1);
pq.Enqueue("低优任务", 10);
string next = pq.Dequeue();  // "紧急任务"（优先级 1 最小）
\`\`\`

底层是**最小堆**（min-heap），基于数组实现：

- Enqueue / Dequeue 都是 O(log n)
- Peek 是 O(1)

如果想要最大堆，让优先级取负数，或自定义 \`IComparer<T>\`。

### 七、ConcurrentQueue / ConcurrentStack

多线程环境下用 \`ConcurrentQueue<T>\` 和 \`ConcurrentStack<T>\`，它们是无锁（lock-free）实现，性能比加锁的普通 Queue 高得多。详细在第三十四章讲。

### 八、与 LinkedList 对比

| 特性 | Queue / Stack | LinkedList |
| --- | --- | --- |
| 访问模式 | 只能从一端 | 任意位置 |
| 内存 | 紧凑数组 | 每节点额外指针 |
| API | Enqueue/Dequeue/Push/Pop | AddFirst/RemoveLast 等 |
| 适用 | 单端操作 | 双端或中间操作 |

如果只是 FIFO 或 LIFO，**用 Queue/Stack 比 LinkedList 更高效**（内存紧凑、缓存友好）。

本章 demo 演示 Queue 任务调度 + Stack 撤销操作 + PriorityQueue 优先级处理。`,
    code: `// C# 12 顶级语句 - Queue、Stack、PriorityQueue 演示
using System;
using System.Collections.Generic;

Console.WriteLine("=== 1. Queue<T> 任务调度 ===");

// 模拟任务队列：先到的任务先处理
var taskQueue = new Queue<string>();

// 入队：模拟任务到来
taskQueue.Enqueue("检查邮件");
taskQueue.Enqueue("编译代码");
taskQueue.Enqueue("运行测试");
taskQueue.Enqueue("部署上线");

Console.WriteLine($"队列中有 {taskQueue.Count} 个任务");
Console.WriteLine($"下一个要处理的：{taskQueue.Peek()}");  // 查看不取出

// 出队：FIFO 处理
Console.WriteLine("\\n按顺序处理：");
while (taskQueue.Count > 0)
{
    string task = taskQueue.Dequeue();  // 出队
    Console.WriteLine($"  ▶ 处理：{task}");
}

Console.WriteLine($"队列已空：{taskQueue.Count == 0}");

// TryDequeue：安全出队
if (!taskQueue.TryDequeue(out var emptyTask))
    Console.WriteLine("TryDequeue 返回 false（队列为空）");

Console.WriteLine("\\n=== 2. Stack<T> 撤销操作 ===");

// 模拟文本编辑器的撤销栈
var undoStack = new Stack<string>();
string currentText = "";

// 每次操作前把当前状态压栈
void PerformEdit(string action, string newText)
{
    undoStack.Push(currentText);  // 保存旧状态
    currentText = newText;
    Console.WriteLine($"  编辑[{action}] → \\"{currentText}\\"");
}

PerformEdit("输入 Hello", "Hello");
PerformEdit("追加 World", "Hello World");
PerformEdit("加感叹号", "Hello World!");

Console.WriteLine($"\\n当前文本：\\"{currentText}\\"");

// 撤销：弹栈恢复
Console.WriteLine("\\n执行撤销：");
while (undoStack.Count > 0)
{
    currentText = undoStack.Pop();
    Console.WriteLine($"  ↶ 撤销后 → \\"{currentText}\\"");
}

Console.WriteLine("\\n=== 3. 括号匹配（Stack 经典应用）===");

// 用栈检查括号是否匹配
string expr1 = "(a+b)*[c-d]";
string expr2 = "(a+b]*[c-d)";
string expr3 = "((())";

Console.WriteLine($"\\"{expr1}\\" 匹配？{IsBracketMatched(expr1)}");
Console.WriteLine($"\\"{expr2}\\" 匹配？{IsBracketMatched(expr2)}");
Console.WriteLine($"\\"{expr3}\\" 匹配？{IsBracketMatched(expr3)}");

// 本地函数：用 Stack 检查括号匹配
static bool IsBracketMatched(string expr)
{
    var stack = new Stack<char>();
    var pairs = new Dictionary<char, char>
    {
        [')'] = '(',
        [']'] = '[',
        ['}'] = '{'
    };

    foreach (char c in expr)
    {
        if (c == '(' || c == '[' || c == '{')
        {
            stack.Push(c);  // 左括号压栈
        }
        else if (pairs.TryGetValue(c, out char expected))
        {
            // 右括号：检查栈顶是否匹配
            if (stack.Count == 0 || stack.Pop() != expected)
                return false;
        }
    }
    return stack.Count == 0;  // 栈空才算完全匹配
}

Console.WriteLine("\\n=== 4. PriorityQueue<TElement, TPriority> ===");

// 模拟急诊室：按病情优先级处理病人
// 优先级数字越小越紧急（默认最小堆）
var er = new PriorityQueue<string, int>();

er.Enqueue("感冒患者", 5);       // 普通优先级
er.Enqueue("心脏骤停", 1);       // 最高优先级
er.Enqueue("骨折患者", 3);
er.Enqueue("轻微擦伤", 8);
er.Enqueue("中风疑似", 2);

Console.WriteLine("急诊室接诊顺序：");
while (er.Count > 0)
{
    string patient = er.Dequeue();  // 优先级最小的先出
    Console.WriteLine($"  ▶ 接诊：{patient}");
}

Console.WriteLine("\\n=== 5. PriorityQueue 自定义比较器（最大堆）===");

// 默认是最小堆，想要最大堆：用自定义比较器反转
var maxHeap = new PriorityQueue<string, int>(
    Comparer<int>.Create((a, b) => b.CompareTo(a)));
// 比较器返回 b - a，让大值"更小"，从而大值先出

maxHeap.Enqueue("低分任务", 10);
maxHeap.Enqueue("高分任务", 100);
maxHeap.Enqueue("中分任务", 50);

Console.WriteLine("按分数从高到低处理：");
while (maxHeap.Count > 0)
    Console.WriteLine($"  ▶ {maxHeap.Dequeue()}");

Console.WriteLine("\\n=== 6. Peek 与 enqueue 模式 ===");

var pq = new PriorityQueue<string, int>();
pq.Enqueue("A", 3);
pq.Enqueue("B", 1);
pq.Enqueue("C", 2);

// Peek：查看但不取出，总是返回优先级最高的
Console.WriteLine($"Peek：{pq.Peek()}（优先级最高）");
pq.Dequeue();
Console.WriteLine($"Dequeue 后 Peek：{pq.Peek()}");

Console.WriteLine("\\n=== 7. 队列容量预分配 ===");
// 与 List 类似，Queue 也能预分配容量
var bigQueue = new Queue<int>(capacity: 1000);
for (int i = 0; i < 1000; i++)
    bigQueue.Enqueue(i);
Console.WriteLine($"预分配 1000 容量后入队 1000 个，Count = {bigQueue.Count}");`,
    lang: 'cs',
  },

  // ============================================================
  // 第三十三章：SortedList 与 SortedDictionary
  // ============================================================
  {
    id: 'csharp4-ch33',
    group: '第四部分 泛型与集合',
    icon: '🗃️',
    title: 'SortedList 与 SortedDictionary',
    content: `## 第三十三章　SortedList 与 SortedDictionary

当字典需要"按键排序"时，就要用到 \`SortedList\` 或 \`SortedDictionary\`。它们都实现 \`IDictionary\`，但底层实现完全不同，性能特性也大相径庭。

### 一、SortedList<TKey, TValue>

\`SortedList\` 内部用**两个并行数组**存储 key 和 value，按键已排序。每次 Add 都要找到正确位置插入（二分查找 + 数组搬移）。

特点：

- 查找 O(log n)（二分查找，因为有序）
- 插入/删除 O(n)（要搬移数组）
- 内存紧凑（数组，缓存友好）
- 按 index 也能访问（额外提供 \`Keys[i]\` / \`Values[i]\`）

### 二、SortedDictionary<TKey, TValue>

\`SortedDictionary\` 内部用**红黑树**（Red-Black Tree）存储，每个节点存一个 KeyValuePair。

特点：

- 查找 O(log n)
- 插入/删除 O(log n)（只需调整树指针）
- 内存较松散（每节点额外指针）
- 不能按 index 访问

### 三、性能对比 ⭐

| 操作 | SortedList | SortedDictionary |
| --- | --- | --- |
| 查找 | O(log n) | O(log n) |
| 插入 | O(n) | O(log n) |
| 删除 | O(n) | O(log n) |
| 内存 | 紧凑 | 松散（每节点额外指针） |
| 按索引访问 | ✅ O(1) | ❌ 不支持 |
| 遍历顺序 | 升序 | 升序 |

**选择建议**：

- 数据基本不变，需要快速查找 + 按索引访问 → \`SortedList\`
- 频繁插入删除 → \`SortedDictionary\`
- 既要排序又要 O(1) 查找 → 没这种好事，妥协吧（或维护一个 Dictionary + List）

### 四、SortedSet<T>

\`SortedSet<T>\` 是基于红黑树的有序集合（没有 value）。提供 \`Min\`、\`Max\`、\`GetViewBetween\` 等操作。性能与 SortedDictionary 类似。

### 五、自定义比较器 IComparer<T>

默认情况下排序集合用 \`Comparer<T>.Default\`（调用 \`IComparable<T>.CompareTo\`）。如果想自定义排序规则（比如按年龄而非姓名），传入 \`IComparer<T>\`：

\`\`\`csharp
public class PersonByAgeComparer : IComparer<Person>
{
    public int Compare(Person? a, Person? b) =>
        a is null ? -1 : b is null ? 1 : a.Age.CompareTo(b.Age);
}

var sorted = new SortedSet<Person>(new PersonByAgeComparer());
\`\`\`

### 六、KeyedCollection<TKey, TValue>

\`KeyedCollection\` 是一个有趣的抽象类：它既是 list（按索引访问）又是 dictionary（按键访问）。键从元素本身提取：

\`\`\`csharp
class PersonCollection : KeyedCollection<int, Person>
{
    protected override int GetKeyForItem(Person item) => item.Id;
}
\`\`\`

适用场景：当你有一个对象集合，需要既能按索引遍历又能按某个属性快速查找时。但实际开发中用得不多，通常 \`List + Dictionary\` 组合更直观。

### 七、历史遗留类型

- **NameValueCollection**：\`System.Collections.Specialized\` 下，存 string-string 键值对，同一 key 可多值。已被 \`Dictionary<string, List<string>>\` 取代。
- **StringDictionary**：强类型 string-string 字典（泛型出现前的产物）。已被 \`Dictionary<string, string>\` 取代。
- **ListDictionary**：用单链表实现的小字典，元素少时比哈希表快。已被 \`Dictionary\` 取代。
- **HybridDictionary**：少时用 ListDictionary，多时切换到 Hashtable。已被 \`Dictionary\` 取代。

新代码**不要用这些**，统一用泛型版本。

### 八、ReadOnlyDictionary<T>

\`ReadOnlyDictionary\` 是 \`Dictionary\` 的只读包装。用 \`AsReadOnly()\` 创建：

\`\`\`csharp
var dict = new Dictionary<string, int>();
var readOnly = new ReadOnlyDictionary<string, int>(dict);
// readOnly.Add(...) 会抛 NotSupportedException
\`\`\`

用于"对外暴露不可变视图"的 API 设计。

### 九、不可变集合简介

\`System.Collections.Immutable\` 命名空间提供真正的不可变集合：\`ImmutableList\`、\`ImmutableDictionary\`、\`ImmutableArray\`、\`ImmutableHashSet\` 等。

特点：

- 任何"修改"操作都返回新集合（共享结构，O(log n)）
- 天然线程安全
- 适合函数式编程、配置缓存、快照

\`\`\`csharp
var list = ImmutableList<int>.Empty;
var list2 = list.Add(1);  // 返回新集合，list 不变
\`\`\`

详细在第三十四章讲。

本章 demo 对比三种排序集合的性能，并演示自定义 IComparer。`,
    code: `// C# 12 顶级语句 - SortedList、SortedDictionary、SortedSet 演示
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;

Console.WriteLine("=== 1. SortedList 基础 ===");

// SortedList：内部两个并行数组，按键排序
var sorted = new SortedList<string, int>
{
    ["banana"] = 3,
    ["apple"] = 5,
    ["cherry"] = 8,
    ["date"] = 2
};

// 遍历是按键升序
Console.WriteLine("SortedList 按键升序遍历：");
foreach (var kv in sorted)
    Console.WriteLine($"  {kv.Key}：{kv.Value}");

// 可以按键和按索引两种方式访问
Console.WriteLine($"\\nsorted[\\"apple\\"] = {sorted["apple"]}");   // 按键
Console.WriteLine($"Keys[0] = {sorted.Keys[0]}");                  // 按索引
Console.WriteLine($"Values[0] = {sorted.Values[0]}");              // 按索引

Console.WriteLine("\\n=== 2. SortedDictionary 基础 ===");

// SortedDictionary：内部红黑树，按键排序
var sd = new SortedDictionary<string, int>
{
    ["banana"] = 3,
    ["apple"] = 5,
    ["cherry"] = 8,
    ["date"] = 2
};

Console.WriteLine("SortedDictionary 按键升序遍历：");
foreach (var kv in sd)
    Console.WriteLine($"  {kv.Key}：{kv.Value}");

// 注意：SortedDictionary 不能按索引访问
// sd.Keys[0]  // ❌ 编译错误

Console.WriteLine("\\n=== 3. 三种集合性能对比 ===");

const int N = 10_000;
var keys = new List<int>();
var rnd = new Random(42);
for (int i = 0; i < N; i++)
    keys.Add(rnd.Next(0, N * 10));

// 测试 SortedList 插入性能
var sl = new SortedList<int, int>();
var sw = Stopwatch.StartNew();
foreach (var k in keys)
    sl[k] = 1;  // 重复 key 会更新
sw.Stop();
Console.WriteLine($"SortedList 插入 {N} 个：{sw.ElapsedMilliseconds} ms");

// 测试 SortedDictionary 插入性能
var sdict = new SortedDictionary<int, int>();
sw.Restart();
foreach (var k in keys)
    sdict[k] = 1;
sw.Stop();
Console.WriteLine($"SortedDictionary 插入 {N} 个：{sw.ElapsedMilliseconds} ms");

// 测试 SortedSet 插入性能
var sset = new SortedSet<int>();
sw.Restart();
foreach (var k in keys)
    sset.Add(k);
sw.Stop();
Console.WriteLine($"SortedSet 插入 {N} 个：{sw.ElapsedMilliseconds} ms");

// 查找性能对比
sw.Restart();
for (int i = 0; i < N; i++)
    _ = sl.ContainsKey(keys[i]);
sw.Stop();
Console.WriteLine($"\\nSortedList 查找 {N} 次：{sw.ElapsedMilliseconds} ms");

sw.Restart();
for (int i = 0; i < N; i++)
    _ = sdict.ContainsKey(keys[i]);
sw.Stop();
Console.WriteLine($"SortedDictionary 查找 {N} 次：{sw.ElapsedMilliseconds} ms");

Console.WriteLine("\\n=== 4. 自定义 IComparer<Person> ===");

// 自定义比较器：按年龄排序
var personSet = new SortedSet<Person>(new PersonByAgeComparer())
{
    new("张三", 30),
    new("李四", 25),
    new("王五", 35),
    new("赵六", 28)
};

Console.WriteLine("按年龄排序：");
foreach (var p in personSet)
    Console.WriteLine($"  {p}");

Console.WriteLine($"最小年龄：{personSet.Min}");
Console.WriteLine($"最大年龄：{personSet.Max}");

Console.WriteLine("\\n=== 5. KeyedCollection 演示 ===");

var people = new PersonCollection
{
    new(1, "张三", 25),
    new(2, "李四", 30),
    new(3, "王五", 28)
};

// 既能按索引访问（List 特性）
Console.WriteLine($"索引 0：{people[0]}");

// 又能按键访问（Dictionary 特性）
Console.WriteLine($"Id=2：{people[2]}");

// 修改元素时键会自动更新
people[0] = new(10, "张三丰", 100);
Console.WriteLine($"修改后 Id=10：{people[10]}");

Console.WriteLine("\\n=== 6. ReadOnlyDictionary ===");

var source = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2 };
var readOnly = new ReadOnlyDictionary<string, int>(source);

Console.WriteLine($"ReadOnlyDictionary 元素数：{readOnly.Count}");
Console.WriteLine($"readOnly[\\"a\\"] = {readOnly["a"]}");

// 尝试修改会抛异常
Console.WriteLine("ReadOnlyDictionary 不支持修改（会抛 NotSupportedException）");

Console.WriteLine("\\n=== 7. SortedSet 集合操作 ===");

var setA = new SortedSet<int> { 1, 3, 5, 7, 9 };
var setB = new SortedSet<int> { 2, 3, 5, 8 };

// 创建副本避免修改原集合
var union = setA.Union(setB);
Console.WriteLine($"A ∪ B = {{{string.Join(", ", union)}}}");

var intersect = setA.Intersect(setB);
Console.WriteLine($"A ∩ B = {{{string.Join(", ", intersect)}}}");

// GetViewBetween：取范围内视图（SortedSet 特有）
Console.WriteLine($"A 中 [3, 7] 范围：{{{string.Join(", ", setA.GetViewBetween(3, 7))}}}");

// 类型定义
public record Person(string Name, int Age);

// 自定义比较器：按年龄排序
public class PersonByAgeComparer : IComparer<Person>
{
    public int Compare(Person? x, Person? y)
    {
        if (x is null && y is null) return 0;
        if (x is null) return -1;
        if (y is null) return 1;
        // 先按年龄，年龄相同按姓名（保证"不同对象"不被视为相等）
        int result = x.Age.CompareTo(y.Age);
        return result != 0 ? result : x.Name.CompareTo(y.Name);
    }
}

// PersonWithId：带 Id 的 Person
public record PersonWithId(int Id, string Name, int Age);

// KeyedCollection：既是 List 又是 Dictionary
public class PersonCollection : KeyedCollection<int, PersonWithId>
{
    // 从元素中提取 key
    protected override int GetKeyForItem(PersonWithId item) => item.Id;
}`,
    lang: 'cs',
  },

  // ============================================================
  // 第三十四章：并发集合
  // ============================================================
  {
    id: 'csharp4-ch34',
    group: '第四部分 泛型与集合',
    icon: '⚡',
    title: '并发集合',
    content: `## 第三十四章　并发集合

多线程环境下，普通 \`List\`、\`Dictionary\`、\`Queue\` 都不安全。即使你加了 \`lock\`，性能也很差。.NET 提供了一套专门的并发集合，基于无锁（lock-free）或细粒度锁实现，能高效支持多线程读写。

### 一、为什么需要并发集合 ⭐

普通集合的问题：

- **数据竞争**：两个线程同时 \`Add\`，可能丢失其中一个。
- **枚举异常**：foreach 时另一线程修改，抛 \`InvalidOperationException\`。
- **死锁**：lock 用不当，多个线程互相等待。

加锁能解决，但锁是"重量级"操作：线程切换、缓存失效、争用等待。并发集合通过**无锁算法（CAS）**或**细粒度分段锁**避免大部分锁争用。

### 二、ConcurrentQueue<T>

无锁的 FIFO 队列。API 与 \`Queue<T>\` 类似但都线程安全：

\`\`\`csharp
var q = new ConcurrentQueue<int>();
q.Enqueue(1);
q.TryDequeue(out int item);  // 不抛异常
\`\`\`

注意：没有 \`Dequeue\` 方法（会抛异常），统一用 \`TryDequeue\`。

### 三、ConcurrentStack<T>

无锁的 LIFO 栈。

\`\`\`csharp
var s = new ConcurrentStack<int>();
s.Push(1);
s.TryPop(out int item);
\`\`\`

### 四、ConcurrentDictionary<TKey, TValue> ⭐

细粒度锁的并发字典。读操作完全无锁，写操作只锁单个桶（segment）。提供原子方法：

| 方法 | 说明 |
| --- | --- |
| \`TryAdd(key, value)\` | 尝试添加，已存在返回 false |
| \`TryGetValue(key, out value)\` | 尝试获取 |
| \`TryUpdate(key, newValue, comparisonValue)\` | CAS 更新（值匹配才更新） |
| \`TryRemove(key, out value)\` | 尝试移除 |
| \`GetOrAdd(key, value)\` | 不存在则添加，返回当前值 |
| \`GetOrAdd(key, factory)\` | 不存在则用工厂创建 |
| \`AddOrUpdate(key, addValue, updateFactory)\` | 原子添加或更新 |

\`GetOrAdd\` 和 \`AddOrUpdate\` 是并发编程的"杀手锏"：

\`\`\`csharp
// 计数器：原子地"加 1 或更新"
counts.AddOrUpdate(word, 1, (_, old) => old + 1);
\`\`\`

### 五、ConcurrentBag<T>

无序的并发包，适合"同一个线程频繁添加，多线程偶尔读取"的场景。它的设计让同一线程的添加操作几乎无锁。API：\`Add\`、\`TryTake\`、\`TryPeek\`。

无序意味着遍历顺序与添加顺序无关。适合"并行处理后收集结果"。

### 六、BlockingCollection<T> ⭐

经典**生产者-消费者模式**的核心。它包装一个 \`IProducerConsumerCollection<T>\`（默认是 \`ConcurrentQueue<T>\`），并添加"阻塞"和"限界"功能：

- \`Add(item)\`：满了就阻塞等待
- \`Take()\`：空了就阻塞等待
- \`CompleteAdding()\`：通知"不再添加"
- \`IsCompleted\`：是否已完成且为空

\`\`\`csharp
var bc = new BlockingCollection<int>(boundedCapacity: 10);
// 生产者线程
Task.Run(() => { for (int i = 0; i < 100; i++) bc.Add(i); bc.CompleteAdding(); });
// 消费者线程
foreach (var item in bc.GetConsumingEnumerable())
    Console.WriteLine(item);  // 自动等到 CompleteAdding 且空了才结束
\`\`\`

### 七、IProducerConsumerCollection<T> 接口

所有"能用于生产者-消费者"的集合都实现这个接口：\`ConcurrentQueue\`、\`ConcurrentStack\`、\`ConcurrentBag\`。\`BlockingCollection\` 接受任何实现此接口的集合作为底层存储。

### 八、Channel<T>（.NET Core 2.1+）⭐

\`System.Threading.Channels\` 是更现代的异步管道原语。相比 \`BlockingCollection\`（同步阻塞），Channel 支持 \`async/await\`：

\`\`\`csharp
var channel = Channel.CreateBounded<int>(100);
// 生产者
await channel.Writer.WriteAsync(42);
// 消费者
await foreach (var item in channel.Reader.ReadAllAsync())
    Console.WriteLine(item);
\`\`\`

适合"异步数据流"场景：HTTP 请求流式处理、消息队列消费、响应式编程。

### 九、Partitioner 与 OrderablePartitioner

\`Partitioner\` 把数据切成多份给 Parallel.ForEach / PLINQ 用。对于"数组这种已知范围的数据"，用 \`Partitioner.Create(0, N)\` 比默认按元素分块更高效。\`OrderablePartitioner\` 额外保留元素原始索引。

### 十、并行计算与集合选择

| 场景 | 推荐 |
| --- | --- |
| 多线程入队出队 | ConcurrentQueue |
| 多线程 push/pop | ConcurrentStack |
| 多线程读写键值 | ConcurrentDictionary |
| 多线程无序收集 | ConcurrentBag |
| 生产者-消费者（同步） | BlockingCollection |
| 生产者-消费者（异步） | Channel<T> |
| 并行 LINQ | PLINQ + Partitioner |

### 十一、不可变集合简介

不可变集合（\`ImmutableList\`、\`ImmutableDictionary\` 等）是另一种"线程安全"思路：集合永远不变，"修改"返回新集合。配合 \`With\` 系列方法可以做"快照式"更新。

并发集合 vs 不可变集合：

- **并发集合**：可变，多线程高效读写
- **不可变集合**：不可变，多线程自然安全，但写性能较差（每次复制）

本章 demo 演示 BlockingCollection 生产者-消费者 + ConcurrentDictionary 并发累加 + Channel 异步管道。`,
    code: `// C# 12 顶级语句 - 并发集合演示
using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;

Console.WriteLine("=== 1. ConcurrentDictionary 并发累加 ===");

// 模拟：多个线程并发统计单词频次
var counts = new ConcurrentDictionary<string, int>();
var words = new[] { "apple", "banana", "apple", "cherry", "banana", "apple" };

// 模拟多个线程同时处理不同单词
Parallel.For(0, 10_000, i =>
{
    string word = words[i % words.Length];
    // AddOrUpdate：原子地"添加或更新"
    // 参数 1：键
    // 参数 2：如果键不存在，用的初始值
    // 参数 3：如果键存在，用工厂计算新值
    counts.AddOrUpdate(word, 1, (_, old) => old + 1);
});

Console.WriteLine("单词统计（10000 次并发累加）：");
foreach (var kv in counts)
    Console.WriteLine($"  {kv.Key}：{kv.Value}");

Console.WriteLine("\\n=== 2. GetOrAdd 懒加载 ===");

// GetOrAdd：原子地"获取或创建"，常用于懒加载
var cache = new ConcurrentDictionary<int, string>();
var tasks = new List<Task<string>>();

// 10 个线程同时尝试"创建 key=1 的对象"
for (int i = 0; i < 10; i++)
{
    tasks.Add(Task.Run(() =>
        cache.GetOrAdd(1, key =>
        {
            Console.WriteLine($"  工厂被调用，key={key}");
            return $"Value-{key}";
        })));
}

await Task.WhenAll(tasks);
Console.WriteLine($"最终值：{cache[1]}");

Console.WriteLine("\\n=== 3. ConcurrentQueue 与 ConcurrentBag ===");

var cq = new ConcurrentQueue<int>();
var cb = new ConcurrentBag<int>();

// 并发入队
Parallel.For(0, 1000, i =>
{
    cq.Enqueue(i);
    cb.Add(i);
});

Console.WriteLine($"ConcurrentQueue 元素数：{cq.Count}");
Console.WriteLine($"ConcurrentBag 元素数：{cb.Count}");

// TryDequeue：安全出队
int taken = 0;
while (cq.TryDequeue(out int item))
{
    if (taken < 3) Console.WriteLine($"  出队：{item}");
    taken++;
    if (taken >= 3) break;
}

Console.WriteLine("\\n=== 4. BlockingCollection 生产者-消费者 ===");

// 创建有界 BlockingCollection（容量 5）
using var bc = new BlockingCollection<int>(boundedCapacity: 5);

// 生产者：1 个线程生产数据
var producer = Task.Run(() =>
{
    for (int i = 1; i <= 20; i++)
    {
        bc.Add(i);  // 满了会阻塞等待
        Console.WriteLine($"  [生产者] 添加 {i}");
        Thread.Sleep(10);  // 模拟生产耗时
    }
    bc.CompleteAdding();  // 通知：不再添加了
    Console.WriteLine("  [生产者] 完成添加");
});

// 消费者：1 个线程消费数据
var consumer = Task.Run(() =>
{
    // GetConsumingEnumerable：自动等待并枚举
    // 直到 CompleteAdding 被调用且集合空了才结束
    foreach (var item in bc.GetConsumingEnumerable())
    {
        Console.WriteLine($"  [消费者] 处理 {item}");
        Thread.Sleep(30);  // 模拟消费耗时
    }
    Console.WriteLine("  [消费者] 完成消费");
});

await Task.WhenAll(producer, consumer);
Console.WriteLine("生产者-消费者全部完成");

Console.WriteLine("\\n=== 5. 多消费者 BlockingCollection ===");

using var bc2 = new BlockingCollection<string>(10);

// 3 个消费者并发处理
var consumers = Enumerable.Range(0, 3).Select(id => Task.Run(() =>
{
    foreach (var item in bc2.GetConsumingEnumerable())
        Console.WriteLine($"  消费者 #{id} 处理：{item}");
})).ToArray();

// 生产者
foreach (var item in new[] { "任务A", "任务B", "任务C", "任务D", "任务E" })
    bc2.Add(item);
bc2.CompleteAdding();

await Task.WhenAll(consumers);

Console.WriteLine("\\n=== 6. Channel<T> 异步管道 ===");

// 创建有界 Channel：容量 3
var channel = Channel.CreateBounded<string>(3);

// 异步生产者
async Task ProduceAsync()
{
    for (int i = 1; i <= 5; i++)
    {
        var msg = $"消息-{i}";
        await channel.Writer.WriteAsync(msg);  // 满了会异步等待
        Console.WriteLine($"  [Writer] 写入 {msg}");
        await Task.Delay(50);
    }
    channel.Writer.Complete();  // 通知：不再写入
}

// 异步消费者
async Task ConsumeAsync()
{
    // ReadAllAsync：异步枚举，直到 Writer.Complete 且缓冲区空
    await foreach (var item in channel.Reader.ReadAllAsync())
    {
        Console.WriteLine($"  [Reader] 读取 {item}");
        await Task.Delay(100);  // 模拟处理耗时
    }
}

// 同时启动生产者和消费者
await Task.WhenAll(ProduceAsync(), ConsumeAsync());
Console.WriteLine("Channel 管道完成");

Console.WriteLine("\\n=== 7. 性能对比：Dictionary + lock vs ConcurrentDictionary ===");

const int N = 100_000;
var plainDict = new Dictionary<int, int>();
object lockObj = new();
var concurrentDict = new ConcurrentDictionary<int, int>();

// 普通 Dictionary + lock
var sw = Stopwatch.StartNew();
Parallel.For(0, N, i =>
{
    lock (lockObj)  // 每次都加锁，性能差
    {
        plainDict[i] = i;
    }
});
sw.Stop();
Console.WriteLine($"Dictionary + lock 写 {N} 次：{sw.ElapsedMilliseconds} ms");

// ConcurrentDictionary
sw.Restart();
Parallel.For(0, N, i =>
{
    concurrentDict[i] = i;  // 细粒度锁，性能好
});
sw.Stop();
Console.WriteLine($"ConcurrentDictionary 写 {N} 次：{sw.ElapsedMilliseconds} ms");`,
    lang: 'cs',
  },
];

export { chapters };
