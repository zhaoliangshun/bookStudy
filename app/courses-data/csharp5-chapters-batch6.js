// =============================================================
// C# 从入门到精通大全（全新版）—— 第 6 批章节
// 第四部分 泛型与集合（共 7 章）
// -------------------------------------------------------------
// 本批包含 7 章（正文讲次编号 = id + 1，因数组章占第 12 讲）：
//   csharp5-ch28 : 第二十九章 泛型基础
//   csharp5-ch29 : 第三十章 集合与 IEnumerable
//   csharp5-ch30 : 第三十一章 List 与 LinkedList
//   csharp5-ch31 : 第三十二章 Dictionary 与 HashSet
//   csharp5-ch32 : 第三十三章 Queue 与 Stack
//   csharp5-ch33 : 第三十四章 SortedList 与 SortedDictionary
//   csharp5-ch34 : 第三十五章 并发集合
//
// 风格：demo 驱动，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，所有示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第二十八章：泛型基础  // ============================================================
  {
    id: 'csharp5-ch28',
    group: '第四部分 泛型与集合',
    icon: '🎯',
    title: '泛型基础',
    content: `## 第二十九章　泛型基础

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

本章 demo 实现完整的泛型 Stack<T>，演示泛型方法 Max<T>、约束、协变逆变。

### 十三、约束一览与 Type.MakeGenericType

| 约束 | 含义 |
| --- | --- |
| \`class\` | 引用类型（含 string、接口装箱后的引用） |
| \`struct\` | 非可空值类型（**不含** \`int?\`） |
| \`class?\` / \`notnull\` | 可空引用 / 非 null |
| \`new()\` | 有无参构造（与 \`struct\` 组合时 struct 已满足） |
| \`unmanaged\` | 不含引用的非托管值类型 |
| \`enum\` / \`delegate\` | 枚举 / 委托 |
| \`T : U\` | 继承或实现 U |
| \`allows ref struct\` | C# 13 标注：允许 Span 等 |

\`IEnumerable<out T>\` 协变：\`IEnumerable<string>\` 当 \`IEnumerable<object>\`。\`Action<in T>\` 逆变：\`Action<object>\` 当 \`Action<string>\`。**可变的 \`List<T>\` 不变**，这是故意的。

运行时构造**封闭**泛型（closed generic，注意不是"闭包"closure）：\`typeof(List<>).MakeGenericType(typeof(int))\` 得到 \`List<int>\`，再 \`Activator.CreateInstance\`。源生成器能写死类型时不要走反射。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「泛型基础」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ===========================================================
// 第二十九章 泛型基础
// 演示：自写 Stack<T>、泛型方法约束、协变 out、逆变 in
// 适用：.NET 8 / C# 12 顶级语句
// 版本：泛型（C# 2）、协变/逆变（C# 4）、default! 可空压制
// 陷阱：约束决定 T 能做什么；IList<T> 既读又写所以既不能 out 也不能 in。自定义 Stack 不是线程安全的
// ===========================================================

using System;

using System.Collections;

using System.Collections.Generic;

// ---------- 1. Stack<T>：一份算法，int/string 各一份 IL，没有装箱 ----------
Console.WriteLine("=== 1. 泛型 Stack<T> 演示 ===");

var intStack = new Stack<int>();

intStack.Push(10);

intStack.Push(20);

intStack.Push(30);

Console.WriteLine($"栈大小：{intStack.Count}");

Console.WriteLine($"栈顶：{intStack.Peek()}");

Console.WriteLine($"弹出：{intStack.Pop()}");

Console.WriteLine($"弹出：{intStack.Pop()}");

var strStack = new Stack<string>();

strStack.Push("hello");

strStack.Push("world");

foreach (var s in strStack)  // IEnumerable<T>：从栈顶往下；foreach 不 Pop
    Console.WriteLine($"  遍历：{s}");

// ---------- 2. 泛型方法 Max<T> 演示 ----------
Console.WriteLine("\\n=== 2. 泛型方法 Max<T> 演示 ===");

Console.WriteLine($"Max(3, 5) = {MathHelper.Max(3, 5)}");

Console.WriteLine($"Max(\\"apple\\", \\"banana\\") = {MathHelper.Max("apple", "banana")}");

var d1 = new DateTime(2024, 1, 1);

var d2 = new DateTime(2023, 6, 15);

Console.WriteLine($"Max(日期) = {MathHelper.Max(d1, d2):yyyy-MM-dd}");

// ---------- 3. 协变 out 演示 ----------
Console.WriteLine("\\n=== 3. 协变 out 演示 ===");

IProducer<Cat> catProducer = new CatProducer();

IProducer<Animal> animalProducer = catProducer;  // out T：生产者只能「往外给」，Cat 当 Animal 安全

Animal produced = animalProducer.Produce();

Console.WriteLine($"  协变产出的对象：{produced.Name}");

// ---------- 4. 逆变 in 演示 ----------
Console.WriteLine("\\n=== 4. 逆变 in 演示 ===");

IConsumer<Animal> animalConsumer = new AnimalConsumer();

IConsumer<Cat> catConsumer = animalConsumer;  // in T：消费者只「往里收」，能收 Animal 就能收 Cat

catConsumer.Consume(new Cat("小橘"));

// ---------- 5. 反例：IList<T> 不支持协变 ----------
Console.WriteLine("\\n=== 5. 反例：IList<T> 不支持协变 ===");

Console.WriteLine("  IList<T> 不支持协变/逆变（T 同时用于读写）");

// ============ 类型声明（必须放在所有顶级语句之后） ============

public class Stack<T> : IEnumerable<T>
{
    // T[] 在 T 是引用类型时存引用；是值类型时存内联值，避免 object 装箱
    private T[] _items;   // 可变数组：本类型非线程安全，并发 Push/Pop 会损坏 _count
    private int _count;   // Count 与数组长度不是一回事，Length 是容量

    public Stack(int capacity = 4)
    {
        _items = new T[capacity];
        _count = 0;
    }

    public int Count => _count;

    public void Push(T item)
    {
        // 扩容按引用替换数组：旧数组等 GC；并发下 Resize 会丢元素
        if (_count >= _items.Length)
        {
            Array.Resize(ref _items, _items.Length * 2);
        }
        _items[_count++] = item;  // 先写入再自增；两步不是原子的
    }

    public T Pop()
    {
        if (_count == 0)
            throw new InvalidOperationException("栈为空");
        T item = _items[--_count];
        _items[_count] = default!;  // 引用类型不清空会钉住对象，值类型则写回 0
        return item;
    }

    public T Peek() => _count == 0
        ? throw new InvalidOperationException("栈为空")
        : _items[_count - 1];

    public IEnumerator<T> GetEnumerator()
    {
        // 枚举期间若 Push/Pop，会读到半新半旧状态——生产代码应做版本戳
        for (int i = _count - 1; i >= 0; i--)
            yield return _items[i];
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}

public static class MathHelper
{
    // where T : IComparable<T> —— 没有这个约束就不能调 CompareTo，会退回 object 比较
    public static T Max<T>(T a, T b) where T : IComparable<T>
    {
        // 泛型比较走 IComparable<T>，避免装箱；null 引用类型调用 CompareTo 仍可能 NRE
        return a.CompareTo(b) >= 0 ? a : b;
    }

    // 约束组合从左到右：class（引用）+ IComparable<T> + new()（必须有无参构造）
    // struct 与 class 互斥；new() 与抽象类不兼容
    public static T CreateAndCompare<T>(T a, T b)
        where T : class, IComparable<T>, new()
    {
        var instance = new T();  // 没有 new() 约束时 new T() 是编译错误
        Console.WriteLine($"  新建实例类型：{instance.GetType().Name}");
        return Max(a, b);
    }
}

public interface IProducer<out T>
{
    T Produce();  // out：T 只能出现在输出位置；写 Consume(T) 会编译失败
}

public class CatProducer : IProducer<Cat>
{
    public Cat Produce() => new Cat("小橘");
}

public interface IConsumer<in T>
{
    void Consume(T item);  // in：T 只能出现在输入位置；不能有 T 返回值
}

public class AnimalConsumer : IConsumer<Animal>
{
    public void Consume(Animal item) =>
        Console.WriteLine($"  消费动物：{item.Name}");
}

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
`,
    lang: 'cs',
  },

  // ============================================================
  // 第二十九章：集合与 IEnumerable
  // ============================================================
  {
    id: 'csharp5-ch29',
    group: '第四部分 泛型与集合',
    icon: '📚',
    title: '集合与 IEnumerable',
    content: `## 第三十章　集合与 IEnumerable

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

本章 demo 实现一个自定义 \`MyLinkedList<T>\`，演示 IEnumerable、yield return、集合初始化器、Collection 表达式。

### 十二、延迟执行陷阱、多次枚举、yield break

\`query.Where(...).Select(...)\` 在你 \`foreach\` / \`ToList\` **之前什么都不算**。数据源若是数据库或可变 List，每次枚举结果可能不同，或把 SQL 执行两遍。需要稳定快照就 \`ToArray()\`。

\`IEnumerable<T>\` 不保证能安全枚举两次（网络流、生成器）。\`IReadOnlyCollection<T>\` / \`ICollection<T>\` 带 \`Count\`；\`IReadOnlyList<T>\` 带下标。API 只要「能看几个」就暴露只读接口，不要先 \`ToList\` 再给出去除非你需要快照。

\`yield break\` 立即结束序列（0 个或提前停）。\`yield return\` 之间的代码在两次 \`MoveNext\` 之间不跑。LINQ 全部建立在这套模型上——下一章 List，再往后才是查询语法。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「集合与 IEnumerable」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ===========================================================
// 第三十章 集合与 IEnumerable
// 演示：自定义链表、yield 状态机、集合初始化器、C# 12 集合表达式、惰性求值
// 适用：.NET 8 / C# 12 顶级语句
// 版本：集合表达式 [1,2,3] 与展开 ..（C# 12）；yield（C# 2）；索引初始化器 ["k"]=v（C# 6）
// 陷阱：foreach 会改写为 using enumerator；yield 在 MoveNext 才跑。枚举中途 Add 链表，行为未定义
// ===========================================================

using System;

using System.Collections;

using System.Collections.Generic;

// ---------- 1. 集合初始化器：编译器逐个调 Add，不是原子操作 ----------
Console.WriteLine("=== 1. 自定义 MyLinkedList + yield return ===");

var list = new MyLinkedList<string> { "苹果", "香蕉", "橙子" };

list.Add("葡萄");

Console.WriteLine("正序遍历：");

foreach (var item in list)
    Console.WriteLine($"  {item}");

Console.WriteLine("反序遍历：");

foreach (var item in list.GetReverse())
    Console.WriteLine($"  {item}");

Console.WriteLine($"\\n链表大小：{list.Count}");

// ---------- 2. IEnumerable 手动迭代（foreach 的真相） ----------
Console.WriteLine("\\n=== 2. IEnumerable 手动迭代（foreach 的真相）===");

var numbers = new MyLinkedList<int> { 10, 20, 30 };

using var enumerator = numbers.GetEnumerator();
while (enumerator.MoveNext())
{
    Console.WriteLine($"  Current = {enumerator.Current}");
}

// ---------- 3. 集合初始化器 ----------
Console.WriteLine("\\n=== 3. 集合初始化器 ===");

var classic = new List<int> { 1, 2, 3, 4, 5 };

Console.WriteLine($"经典初始化器：{string.Join(", ", classic)}");

var ages = new Dictionary<string, int>
{
    ["张三"] = 25,
    ["李四"] = 30,
    ["王五"] = 28
};

foreach (var kv in ages)
    Console.WriteLine($"  {kv.Key}：{kv.Value} 岁");

// ---------- 4. C# 12 集合表达式 ----------
Console.WriteLine("\\n=== 4. C# 12 集合表达式 ===");

int[] arr = [1, 2, 3, 4, 5];

List<int> arrList = [10, 20, 30];

HashSet<int> arrSet = [100, 200, 300];

Console.WriteLine($"数组：{string.Join(", ", arr)}");

Console.WriteLine($"List：{string.Join(", ", arrList)}");

Console.WriteLine($"HashSet：{string.Join(", ", arrSet)}");

int[] part1 = [1, 2, 3];

int[] part2 = [.. part1, 4, 5];

Console.WriteLine($"展开拼接：{string.Join(", ", part2)}");

int[] empty = [];

Console.WriteLine($"空集合长度：{empty.Length}");

// ---------- 5. Array 也是集合 ----------
Console.WriteLine("\\n=== 5. Array 也是集合 ===");

int[] data = [5, 3, 8, 1, 9];

var sorted = data.OrderBy(x => x);

Console.WriteLine($"数组排序：{string.Join(", ", sorted)}");

Console.WriteLine($"数组长度：{data.Length}");

Console.WriteLine($"数组实现 IList<int>：{data is IList<int>}");

// ---------- 6. yield 惰性求值演示 ----------
Console.WriteLine("\\n=== 6. yield 惰性求值演示 ===");

var range = GetRange(0, 1_000_000);

Console.WriteLine("调用了 GetRange(0, 1000000)，但还没真正执行");

int sum = 0;

foreach (var n in range)
{
    sum += n;
    if (sum > 50) break;  // 提前退出，证明是惰性的
}

Console.WriteLine($"累加到 {sum} 就退出了，没真的遍历 100 万次");

static IEnumerable<int> GetRange(int start, int count)
{
    for (int i = 0; i < count; i++)
        yield return start + i;
}

// ============ 类型声明（必须放在所有顶级语句之后） ============

public class MyLinkedList<T> : IEnumerable<T>
{
    // 双向节点：O(1) 头尾插入；随机访问仍是 O(n)
    private class Node
    {
        public T Value;            // T 若是可变引用类型，改对象字段链表「看起来也变了」
        public Node? Next;         // 可变链接：本集合非线程安全
        public Node? Prev;

        public Node(T value) => Value = value;
    }

    private Node? _head;  // 空表时头尾都是 null
    private Node? _tail;
    private int _count;

    public int Count => _count;

    public void Add(T value)
    {
        var node = new Node(value);
        if (_tail == null)
        {
            _head = _tail = node;
        }
        else
        {
            // 三步改指针，不是原子操作；并发 Add 会丢节点或成环
            _tail.Next = node;
            node.Prev = _tail;
            _tail = node;
        }
        _count++;
    }

    // yield 让编译器生成状态机；GetEnumerator() 立刻返回，MoveNext 才走这里
    public IEnumerator<T> GetEnumerator()
    {
        Node? current = _head;
        while (current != null)
        {
            yield return current.Value;  // 枚举中途 Add：可能看到新节点，也可能跳过，未定义
            current = current.Next;
        }
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();

    public IEnumerable<T> GetReverse()
    {
        Node? current = _tail;
        while (current != null)
        {
            yield return current.Value;
            current = current.Prev;
        }
    }

    // 有 Add(T) 才能写 new MyLinkedList<int> { 1, 2, 3 } —— 这是语言约定，不是接口
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第三十章：List 与 LinkedList
  // ============================================================
  {
    id: 'csharp5-ch30',
    group: '第四部分 泛型与集合',
    icon: '📋',
    title: 'List 与 LinkedList',
    content: `## 第三十一章　List 与 LinkedList

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

本章 demo 演示 List<T> 全套 API + Find/Sort/BinarySearch + LinkedList<string> 操作。

### 十、Capacity、EnsureCapacity、Slice、Find vs LINQ

\`Count\` 是元素个数，\`Capacity\` 是内部数组长度。\`EnsureCapacity(n)\`（.NET 6+）一次扩够，循环 \`Add\` 前调用可少几次拷贝。删到很少时 \`TrimExcess\` 才收缩。

\`List<T>\` **没有**数组那种 \`Slice\` 实例方法。只读热路径用 \`CollectionsMarshal.AsSpan(list).Slice(start, length)\`（.NET 8 项目常用、零拷贝）；需要独立 \`List<T>\` 用 \`GetRange\`（拷贝）。不要写 \`list[1..3]\` 指望和数组一样——List 未实现 Slice 模式，多数 SDK 会直接编译失败。

\`Find\` / \`FindAll\` / \`Exists\` 是 List 实例方法，立刻遍历；LINQ \`FirstOrDefault\` / \`Where\` 延迟且分配迭代器。已有 List、只要一个元素，用 \`Find\` 更直接。

### 十一、LinkedListNode 什么时候才值得

只有频繁「在已知节点前/后插入删除」才用 \`LinkedList<T>\`。节点是堆对象，缓存不友好。队列/栈请用 \`Queue\`/\`Stack\`。拿到 \`LinkedListNode<T>\` 才能 O(1) 删；先 \`Find\` 再删已经是 O(n)。默认 \`List<T>\`。

### 十二、Find 与 LINQ 怎么选（一句话）

已有 \`List<T>\`、要立刻得到一个元素或空：\`Find\` / \`FindIndex\`。还要继续 Where/Select 链式：LINQ。不要 \`list.Where(x => x > 0).FirstOrDefault()\` 只为了替代 \`Find\`——多一次委托分配，读起来也不更短。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「List 与 LinkedList」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ===========================================================
// 第三十一章 List<T> 与 LinkedList<T>
// 演示：容量与 Count、原地突变 API、Find/Sort/BinarySearch、链表节点插入、头部插入性能
// 适用：.NET 8 / C# 12 顶级语句
// 版本：集合表达式 [..]（C# 12）；record 位置参数（C# 9）；BinarySearch 找不到返回按位取反插入点
// 陷阱：List 是可变的，ToArray/GetRange 才是快照。枚举时 Add/Remove 会抛 InvalidOperationException
// ===========================================================
using System;
using System.Collections.Generic;
using System.Diagnostics;

// ---------- 1. Capacity ≠ Count：预分配避免几何扩容拷贝 ----------
Console.WriteLine("=== 1. List<T> 容量与数量 ===");

// 预分配容量：避免多次扩容
var list = new List<int>(capacity: 10);
Console.WriteLine($"初始 Capacity={list.Capacity}, Count={list.Count}");

list.Add(10);
list.Add(20);
list.Add(30);
Console.WriteLine($"Add 三个元素后 Capacity={list.Capacity}, Count={list.Count}");

List<int> nums = [5, 3, 8, 1, 9, 3, 7];
Console.WriteLine($"集合表达式创建：{string.Join(", ", nums)}");

// ---------- 2. 增删改查 API ----------
Console.WriteLine("\\n=== 2. 增删改查 API ===");
// AddRange / Insert / Remove 都是原地改 nums，没有返回「新列表」
nums.AddRange([100, 200, 300]);
Console.WriteLine($"AddRange 后：{string.Join(", ", nums)}");

nums.Insert(0, 999);  // 插入点之后全部后移，O(n)
Console.WriteLine($"Insert(0, 999) 后：{string.Join(", ", nums)}");

nums.Remove(3);  // 只移除第一个匹配；找不到返回 false 不抛
Console.WriteLine($"Remove(3) 后：{string.Join(", ", nums)}");

nums.RemoveAt(0);  // 按下标；越界才抛
Console.WriteLine($"RemoveAt(0) 后：{string.Join(", ", nums)}");

int removed = nums.RemoveAll(x => x >= 100);
Console.WriteLine($"RemoveAll(>=100) 移除了 {removed} 个：{string.Join(", ", nums)}");

Console.WriteLine($"Contains(8) = {nums.Contains(8)}");
Console.WriteLine($"IndexOf(3) = {nums.IndexOf(3)}");
Console.WriteLine($"LastIndexOf(3) = {nums.LastIndexOf(3)}");

int[] arr = nums.ToArray();
Console.WriteLine($"ToArray 长度：{arr.Length}");

// ---------- 3. 遍历与转换 API ----------
Console.WriteLine("\\n=== 3. 遍历与转换 API ===");
nums.ForEach(x => Console.Write($"{x} "));
Console.WriteLine();

List<string> strList = nums.ConvertAll(x => $"[{x}]");
Console.WriteLine($"ConvertAll：{string.Join(", ", strList)}");

Console.WriteLine($"TrueForAll(>0) = {nums.TrueForAll(x => x > 0)}");

Console.WriteLine($"Exists(>5) = {nums.Exists(x => x > 5)}");

// ---------- 4. Find 系列 ----------
Console.WriteLine("\\n=== 4. Find 系列 ===");
List<Person> people =
[
    new("张三", 25),
    new("李四", 30),
    new("王五", 28),
    new("赵六", 35),
    new("钱七", 28)
];

Person? first28 = people.Find(p => p.Age == 28);
Console.WriteLine($"Find(Age==28)：{first28}");

List<Person> all28 = people.FindAll(p => p.Age == 28);
Console.WriteLine($"FindAll(Age==28)：{all28.Count} 个");

int idx = people.FindIndex(p => p.Age > 30);
Console.WriteLine($"FindIndex(Age>30)：{idx}");

Person? last28 = people.FindLast(p => p.Age == 28);
Console.WriteLine($"FindLast(Age==28)：{last28}");

// ---------- 5. Sort 与 BinarySearch ----------
Console.WriteLine("\\n=== 5. Sort 与 BinarySearch ===");
List<int> sortList = [5, 3, 8, 1, 9, 2, 7];
Console.WriteLine($"原数组：{string.Join(", ", sortList)}");

sortList.Sort();
Console.WriteLine($"Sort()：{string.Join(", ", sortList)}");

sortList.Sort((a, b) => b.CompareTo(a));  // Comparison<T> 必须满足全序，否则 Sort 行为未定义
Console.WriteLine($"Sort(降序)：{string.Join(", ", sortList)}");

sortList.Reverse();
Console.WriteLine($"Reverse：{string.Join(", ", sortList)}");

sortList.Sort();
int found = sortList.BinarySearch(7);
Console.WriteLine($"BinarySearch(7) 在排序列表中：索引 {found}");

int notFound = sortList.BinarySearch(6);
int insertAt = ~notFound;  // 未排序就 BinarySearch 会得到错误下标且不抛
Console.WriteLine($"BinarySearch(6) 找不到：返回 {notFound}，应插入到 {insertAt}");

// ---------- 6. LinkedList<T> 演示 ----------
Console.WriteLine("\\n=== 6. LinkedList<T> 演示 ===");
var ll = new LinkedList<string>();

ll.AddLast("B");
ll.AddFirst("A");
ll.AddLast("C");
Console.WriteLine($"链表：{string.Join(" -> ", ll)}");

LinkedListNode<string> nodeB = ll.Find("B")!;
ll.AddBefore(nodeB, "B-前");
ll.AddAfter(nodeB, "B-后");
Console.WriteLine($"插入后：{string.Join(" -> ", ll)}");

ll.Remove("B-前");
ll.RemoveFirst();  // 空表再 RemoveFirst 会抛
ll.RemoveLast();
Console.WriteLine($"删除后：{string.Join(" -> ", ll)}");

Console.WriteLine($"First={ll.First?.Value}, Last={ll.Last?.Value}, Count={ll.Count}");

// ---------- 7. 性能对比：头部插入 ----------
Console.WriteLine("\\n=== 7. 性能对比：头部插入 ===");
var listPerf = new List<int>();
var sw = Stopwatch.StartNew();
for (int i = 0; i < 100_000; i++)
    listPerf.Insert(0, i);  // 每次 O(n) 搬移；随机访问 List 才是强项
sw.Stop();
Console.WriteLine($"List 头部插入 10 万次：{sw.ElapsedMilliseconds} ms");

var llPerf = new LinkedList<int>();
sw.Restart();
for (int i = 0; i < 100_000; i++)
    llPerf.AddFirst(i);
sw.Stop();
Console.WriteLine($"LinkedList 头部插入 10 万次：{sw.ElapsedMilliseconds} ms");

public record Person(string Name, int Age);
`,
    lang: 'cs',
  },

  // ============================================================
  // 第三十一章：Dictionary 与 HashSet
  // ============================================================
  {
    id: 'csharp5-ch31',
    group: '第四部分 泛型与集合',
    icon: '🔑',
    title: 'Dictionary 与 HashSet',
    content: `## 第三十二章　Dictionary 与 HashSet

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

Dictionary 的公开契约**不保证**插入顺序，即使当前实现常表现为插入顺序也不应依赖。需要有序键可用 \`SortedDictionary\`；需要插入顺序可同时维护 List，或在 .NET 9+ 使用泛型 \`OrderedDictionary<TKey,TValue>\`。旧的非泛型 \`System.Collections.Specialized.OrderedDictionary\` 更早就存在，但缺少泛型类型安全。

### 八、FrozenDictionary / FrozenSet

.NET 8+ 的 \`System.Collections.Frozen\` 适合“构建一次、频繁读取”的路由表、配置映射和允许列表：

\`\`\`csharp
using System.Collections.Frozen;

FrozenDictionary<string, int> codes = source
    .ToFrozenDictionary(StringComparer.OrdinalIgnoreCase);
\`\`\`

冻结构建成本高于普通 Dictionary，之后不能修改；只有生命周期内大量查询时才可能获益。普通业务可变数据继续使用 Dictionary，不要凭名称盲目替换。

### 九、ConcurrentDictionary 简介

多线程环境下 \`Dictionary\` 不安全。用 \`ConcurrentDictionary\` 提供：

- \`TryAdd\` / \`TryUpdate\` / \`TryRemove\`
- \`GetOrAdd(key, factory)\`：不存在则用工厂创建并添加
- \`AddOrUpdate(key, addValue, updateFactory)\`：原子添加或更新

详细用法在第三十四章讲。

### 十、HashSet<T> ⭐

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

### 十一、SortedSet<T>

\`SortedSet<T>\` 是"有序的 HashSet"——基于红黑树，元素自动排序。支持 \`Min\`、\`Max\`、\`GetViewBetween\` 等有序操作。添加/查找/删除都是 O(log n)。

### 十二、Lookup<TKey, TElement>

\`Dictionary<TKey, TValue>\` 是"一对一"映射；\`ILookup<TKey, TElement>\` 是"一对多"映射——一个 key 对应多个元素。用 \`Enumerable.ToLookup\` 创建：

\`\`\`csharp
ILookup<int, Person> byAge = people.ToLookup(p => p.Age);
foreach (Person p in byAge[28])  // 所有 28 岁的人
    Console.WriteLine(p);
\`\`\`

本章 demo 演示 Dictionary 全套 API + 自定义比较器 + HashSet 集合运算。

### 十三、GetValueOrDefault、CollectionsMarshal、集合代数

\`dict.GetValueOrDefault(key)\`（.NET Core 2.0+）没有键时给 \`default\`，不会抛。与 \`TryGetValue\` 相比少一个 out，但分不清「键不存在」和「值就是 default」。

热路径批量改值可用 \`CollectionsMarshal.GetValueRefOrAddDefault\`（小心：不要在持有 ref 时再扩容字典）。只读、启动后不再改的映射用 **\`FrozenDictionary\`**（.NET 8）——创建贵、查找更快。

\`HashSet<T>\` 代数：\`UnionWith\` \`IntersectWith\` \`ExceptWith\` \`SymmetricExceptWith\`，就地改左操作数。需要新集合就先 \`new HashSet<T>(a)\` 再运算。比较器必须从一开始就定好，中途换 \`StringComparer\` 等于毁哈希。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「Dictionary 与 HashSet」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ===========================================================
// 第三十二章 Dictionary 与 HashSet
// 演示：TryGetValue、比较器、自定义 Key 的 Equals/GetHashCode、集合运算、ToLookup
// 适用：.NET 8 / C# 12 顶级语句
// 版本：索引初始化器（C# 6）、IEquatable<T>（避免 Equals 装箱）、ToLookup 一对多
// 陷阱：Dictionary 非线程安全。作为 Key 的对象 Equals 依赖的字段不能再变，否则哈希桶找不到
// ===========================================================
using System;
using System.Collections.Generic;
using System.Linq;

// ---------- 1. Add 遇重复 key 抛；索引器是 upsert，重复则覆盖 ----------
Console.WriteLine("=== 1. Dictionary 基础 ===");

var fruitCount = new Dictionary<string, int>
{
    ["apple"] = 5,
    ["banana"] = 3,
    ["orange"] = 8
};

fruitCount.Add("grape", 2);  // 重复 key 抛 ArgumentException；并发 Add 会损坏内部桶

fruitCount["apple"] = 10;  // 索引器 upsert：存在则覆盖，不存在则插入
fruitCount["mango"] = 4;   // 添加

Console.WriteLine("当前库存：");
foreach (var kv in fruitCount)
    Console.WriteLine($"  {kv.Key}：{kv.Value}");

Console.WriteLine($"总数：{fruitCount.Count}");

// ---------- 2. TryGetValue 最佳实践 ----------
Console.WriteLine("\\n=== 2. TryGetValue 最佳实践 ===");

// ContainsKey + 索引器 = 两次哈希；中间若被别的线程 Remove，第二次仍可能抛
if (fruitCount.ContainsKey("apple"))
{
    int n = fruitCount["apple"];
    Console.WriteLine($"  [反模式] apple = {n}");
}

if (fruitCount.TryGetValue("apple", out int count))
{
    Console.WriteLine($"  [推荐] apple = {count}");
}

if (!fruitCount.TryGetValue("cherry", out int missing))
{
    Console.WriteLine($"  cherry 不存在，out = {missing}");
}

try
{
    int _ = fruitCount["cherry"];
}
catch (KeyNotFoundException ex)
{
    Console.WriteLine($"  索引访问不存在的 key 抛：{ex.GetType().Name}");
}

// ---------- 3. Remove 与 Contains ----------
Console.WriteLine("\\n=== 3. Remove 与 Contains ===");
bool removed = fruitCount.Remove("banana");
Console.WriteLine($"Remove(banana) = {removed}");
Console.WriteLine($"ContainsKey(apple) = {fruitCount.ContainsKey("apple")}");
Console.WriteLine($"ContainsValue(8) = {fruitCount.ContainsValue(8)}");

Console.WriteLine($"Keys：{string.Join(", ", fruitCount.Keys)}");
Console.WriteLine($"Values：{string.Join(", ", fruitCount.Values)}");

// ---------- 4. 自定义比较器：不区分大小写的键 ----------
Console.WriteLine("\\n=== 4. 自定义比较器：不区分大小写的键 ===");
var caseInsensitive = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
caseInsensitive["Apple"] = 1;
caseInsensitive["APPLE"] = 2;  // 这会更新，不会新增
Console.WriteLine($"APPLE = {caseInsensitive["apple"]}");  // 2
Console.WriteLine($"Count = {caseInsensitive.Count}");  // 1

// ---------- 5. 自定义对象作为 Key（按 Id 判等） ----------
Console.WriteLine("\\n=== 5. 自定义对象作为 Key（按 Id 判等）===");
var personDict = new Dictionary<PersonById, string>();
var p1 = new PersonById(1, "张三");
var p2 = new PersonById(1, "张三（重名）");  // Id 相同
personDict[p1] = "员工";
personDict[p2] = "经理";  // 因为 Id 相同，会更新而不是新增
Console.WriteLine($"personDict.Count = {personDict.Count}");  // 1
Console.WriteLine($"值 = {personDict[p1]}");  // 经理

// ---------- 6. HashSet<T> 集合运算 ----------
Console.WriteLine("\\n=== 6. HashSet<T> 集合运算 ===");
var setA = new HashSet<int> { 1, 2, 3, 4, 5 };
var setB = new HashSet<int> { 4, 5, 6, 7, 8 };

Console.WriteLine($"A = {{{string.Join(", ", setA)}}}");
Console.WriteLine($"B = {{{string.Join(", ", setB)}}}");

var union = new HashSet<int>(setA);
union.UnionWith(setB);
Console.WriteLine($"A ∪ B = {{{string.Join(", ", union)}}}");

var intersect = new HashSet<int>(setA);
intersect.IntersectWith(setB);
Console.WriteLine($"A ∩ B = {{{string.Join(", ", intersect)}}}");

var except = new HashSet<int>(setA);
except.ExceptWith(setB);
Console.WriteLine($"A - B = {{{string.Join(", ", except)}}}");

var symDiff = new HashSet<int>(setA);
symDiff.SymmetricExceptWith(setB);
Console.WriteLine($"A △ B = {{{string.Join(", ", symDiff)}}}");

var subSet = new HashSet<int> { 1, 2 };
Console.WriteLine($"{{1,2}} 是 A 的子集？{subSet.IsSubsetOf(setA)}");
Console.WriteLine($"A 是 {{1,2}} 的超集？{setA.IsSupersetOf(subSet)}");
Console.WriteLine($"A 与 B 有交集？{setA.Overlaps(setB)}");

bool added = setA.Add(3);
Console.WriteLine($"Add(3) 重复添加返回：{added}");

// ---------- 7. SortedSet<T> 自动排序 ----------
Console.WriteLine("\\n=== 7. SortedSet<T> 自动排序 ===");
var sorted = new SortedSet<int> { 5, 1, 9, 3, 7, 1 };  // 重复 1 会被去重
Console.WriteLine($"SortedSet：{string.Join(", ", sorted)}");  // 1, 3, 5, 7, 9
Console.WriteLine($"Min = {sorted.Min}, Max = {sorted.Max}");

var view = sorted.GetViewBetween(3, 7);
Console.WriteLine($"GetViewBetween(3, 7)：{string.Join(", ", view)}");

// ---------- 8. ToLookup：一对多映射 ----------
Console.WriteLine("\\n=== 8. ToLookup：一对多映射 ===");
var people = new List<Person>
{
    new("张三", 25),
    new("李四", 28),
    new("王五", 28),
    new("赵六", 30),
    new("钱七", 25)
};

ILookup<int, string> byAge = people.ToLookup(p => p.Age, p => p.Name);

Console.WriteLine($"28 岁的有：{string.Join(", ", byAge[28])}");
Console.WriteLine($"25 岁的有：{string.Join(", ", byAge[25])}");

foreach (var group in byAge)
    Console.WriteLine($"  {group.Key} 岁：{string.Join(", ", group)}");

public record Person(string Name, int Age);

public sealed class PersonById : IEquatable<PersonById>
{
    public int Id { get; }
    public string Name { get; }
    public PersonById(int id, string name) { Id = id; Name = name; }

    // 泛型集合优先走 IEquatable<T>，避免 object.Equals 装箱
    public bool Equals(PersonById? other) => other is not null && other.Id == Id;
    public override bool Equals(object? obj) => obj is PersonById other && Equals(other);

    // GetHashCode 必须只依赖 Equals 用到的字段；Id 可变就不要当 Key
    public override int GetHashCode() => HashCode.Combine(Id);
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第三十二章：Queue 与 Stack
  // ============================================================
  {
    id: 'csharp5-ch32',
    group: '第四部分 泛型与集合',
    icon: '🌲',
    title: 'Queue 与 Stack',
    content: `## 第三十三章　Queue 与 Stack

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

本章 demo 演示 Queue 任务调度 + Stack 撤销操作 + PriorityQueue 优先级处理。

### 九、环形队列思想与 TryDequeue / TryPeek

\`Queue<T>\` 内部就是**环形缓冲**：head/tail 在数组上取模前进，避免每次出队都 \`Array.Copy\`。自己实现固定容量缓冲时也是 \`(_tail + 1) % cap == _head\` 判满。不要用 \`List.RemoveAt(0)\` 冒充队列——那是 O(n)。

空队列上 \`Dequeue\`/\`Peek\` 抛 \`InvalidOperationException\`。不确定是否为空（尤其并发边界）用 \`TryDequeue\` / \`TryPeek\`（自 **.NET Core 2.0** 起提供，不是「只有 .NET 6」）。

### 十、当成 IEnumerable 的坑

\`foreach (var x in queue)\` **只看看出队顺序的快照语义，不会 Dequeue**。枚举后 \`Count\` 不变。若你写了生产者循环「foreach 消费任务」，任务还在队列里。消费必须 \`while (q.TryDequeue(out var x))\`。多次 \`foreach\` 同一 Queue 会反复看见同一批元素。

多生产者多消费者、需要阻塞等待时用 \`BlockingCollection<T>\`（内部常包 \`ConcurrentQueue\`）或 \`Channel<T>\`，不要在 \`Queue<T>\` 外包一层 \`lock\` 却忘了 \`Pulse\`。

### 十一、场景对照表

| 场景 | 结构 |
| --- | --- |
| BFS、任务 FIFO、打印队列 | \`Queue<T>\` |
| 撤销、括号匹配、DFS | \`Stack<T>\` |
| 急诊、定时最近到期 | \`PriorityQueue<TElement,TPriority>\` |
| 固定槽位的缓冲/播放器 | 环形数组（或有界 Channel） |
| 跨线程交接 | \`ConcurrentQueue\` / Channel / \`BlockingCollection\` |

### 十二、优先队列不是稳定排序

\`PriorityQueue\` 同优先级元素**不保证**入队顺序。需要「同样紧急则先来先服务」请把优先级做成 \`(priority, seq)\`，\`seq\` 单调递增。\`Enqueue(elem, prio)\` 的比较器比较的是 **TPriority**，不是元素。清空用循环 Dequeue 或丢掉整个实例；没有 \`Clear\` 的旧版本要自己包一层。BFS 用 Queue，撤销用 Stack，别互相替代图个新鲜。

Channel 能替代「Queue + lock + 手动阻塞」的大多数新代码；单线程算法题继续用 Queue/Stack 即可。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「Queue 与 Stack」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ===========================================================
// 第三十三章 Queue、Stack、PriorityQueue
// 演示：FIFO 任务队列、LIFO 撤销栈、括号匹配、最小堆/最大堆、环形缓冲、BlockingCollection
// 适用：.NET 8 / C# 12 顶级语句
// 版本：PriorityQueue<TElement,TPriority>（.NET 6+）；TryDequeue（.NET Core 2.0+）；集合表达式入队（C# 12）
// 陷阱：Queue/Stack 都不是线程安全的。foreach 只是偷看，不会出队；空队列 Dequeue 抛，Try* 才返回 false
// ===========================================================
using System;
using System.Collections.Generic;

// ---------- 1. Queue：FIFO，Enqueue 入、Dequeue 出；Peek 不改集合 ----------
Console.WriteLine("=== 1. Queue<T> 任务调度 ===");

var taskQueue = new Queue<string>();

taskQueue.Enqueue("检查邮件");
taskQueue.Enqueue("编译代码");
taskQueue.Enqueue("运行测试");
taskQueue.Enqueue("部署上线");

Console.WriteLine($"队列中有 {taskQueue.Count} 个任务");
Console.WriteLine($"下一个要处理的：{taskQueue.Peek()}");  // 空队列 Peek 会抛

Console.WriteLine("\\n按顺序处理：");
while (taskQueue.Count > 0)
{
    string task = taskQueue.Dequeue();  // 出队是突变；多线程请换 ConcurrentQueue
    Console.WriteLine($"  ▶ 处理：{task}");
}

Console.WriteLine($"队列已空：{taskQueue.Count == 0}");

if (!taskQueue.TryDequeue(out var emptyTask))
    Console.WriteLine("TryDequeue 返回 false（队列为空）");

// ---------- 2. Stack<T> 撤销操作 ----------
Console.WriteLine("\\n=== 2. Stack<T> 撤销操作 ===");

var undoStack = new Stack<string>();
string currentText = "";

void PerformEdit(string action, string newText)
{
    undoStack.Push(currentText);  // 压的是旧快照；引用类型请克隆，否则弹栈拿到的是同一对象
    currentText = newText;
    Console.WriteLine($"  编辑[{action}] → \\"{currentText}\\"");
}

PerformEdit("输入 Hello", "Hello");
PerformEdit("追加 World", "Hello World");
PerformEdit("加感叹号", "Hello World!");

Console.WriteLine($"\\n当前文本：\\"{currentText}\\"");

Console.WriteLine("\\n执行撤销：");
while (undoStack.Count > 0)
{
    currentText = undoStack.Pop();
    Console.WriteLine($"  ↶ 撤销后 → \\"{currentText}\\"");
}

// ---------- 3. 括号匹配（Stack 经典应用） ----------
Console.WriteLine("\\n=== 3. 括号匹配（Stack 经典应用）===");

string expr1 = "(a+b)*[c-d]";
string expr2 = "(a+b]*[c-d)";
string expr3 = "((())";

Console.WriteLine($"\\"{expr1}\\" 匹配？{IsBracketMatched(expr1)}");
Console.WriteLine($"\\"{expr2}\\" 匹配？{IsBracketMatched(expr2)}");
Console.WriteLine($"\\"{expr3}\\" 匹配？{IsBracketMatched(expr3)}");

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
            stack.Push(c);
        }
        else if (pairs.TryGetValue(c, out char expected))
        {
            if (stack.Count == 0 || stack.Pop() != expected)
                return false;
        }
    }
    return stack.Count == 0;  // 还有剩左括号 = 未闭合
}

// ---------- 4. PriorityQueue<TElement, TPriority> ----------
Console.WriteLine("\\n=== 4. PriorityQueue<TElement, TPriority> ===");

var er = new PriorityQueue<string, int>();

er.Enqueue("感冒患者", 5);       // 普通优先级
er.Enqueue("心脏骤停", 1);       // 最高优先级
er.Enqueue("骨折患者", 3);
er.Enqueue("轻微擦伤", 8);
er.Enqueue("中风疑似", 2);

Console.WriteLine("急诊室接诊顺序：");
while (er.Count > 0)
{
    string patient = er.Dequeue();  // 同优先级不保证 FIFO；稳定排序请自己带序号
    Console.WriteLine($"  ▶ 接诊：{patient}");
}

// ---------- 5. PriorityQueue 自定义比较器（最大堆） ----------
Console.WriteLine("\\n=== 5. PriorityQueue 自定义比较器（最大堆）===");

var maxHeap = new PriorityQueue<string, int>(
    Comparer<int>.Create((a, b) => b.CompareTo(a)));
// 比较器必须稳定且反对称；返回 0 视为同优先级，不是「相等就去重」

maxHeap.Enqueue("低分任务", 10);
maxHeap.Enqueue("高分任务", 100);
maxHeap.Enqueue("中分任务", 50);

Console.WriteLine("按分数从高到低处理：");
while (maxHeap.Count > 0)
    Console.WriteLine($"  ▶ {maxHeap.Dequeue()}");

// ---------- 6. Peek 与 enqueue 模式 ----------
Console.WriteLine("\\n=== 6. Peek 与 enqueue 模式 ===");

var pq = new PriorityQueue<string, int>();
pq.Enqueue("A", 3);
pq.Enqueue("B", 1);
pq.Enqueue("C", 2);

Console.WriteLine($"Peek：{pq.Peek()}（优先级最高）");
pq.Dequeue();
Console.WriteLine($"Dequeue 后 Peek：{pq.Peek()}");

// ---------- 7. 队列容量预分配 ----------
Console.WriteLine("\\n=== 7. 队列容量预分配 ===");
var bigQueue = new Queue<int>(capacity: 1000);
for (int i = 0; i < 1000; i++)
    bigQueue.Enqueue(i);
Console.WriteLine($"预分配 1000 容量后入队 1000 个，Count = {bigQueue.Count}");

// ---------- 8. IEnumerable 不会出队 ----------
Console.WriteLine("\\n===== 8. IEnumerable 不会出队 =====");
var look = new Queue<int>([1, 2, 3]);
foreach (var n in look)
    Console.Write(n + " ");
Console.WriteLine("\\nforeach 后 Count 仍是 " + look.Count + "（没有 Dequeue）");
while (look.TryDequeue(out int n))
    Console.Write("出队 " + n + " ");
Console.WriteLine();
Console.WriteLine("空队列 TryPeek？" + look.TryPeek(out _));

// ---------- 9. 环形缓冲思想（容量 4） ----------
Console.WriteLine("\\n===== 9. 环形缓冲思想（容量 4） =====");
var ring = new int[4];
int head = 0, tail = 0, count = 0;
void RingEnqueue(int v)
{
    if (count == ring.Length) throw new InvalidOperationException("满");
    ring[tail] = v;
    tail = (tail + 1) % ring.Length;
    count++;
}
int RingDequeue()
{
    int v = ring[head];
    head = (head + 1) % ring.Length;
    count--;
    return v;
}
RingEnqueue(10); RingEnqueue(20); RingEnqueue(30);
Console.WriteLine("环形出队 " + RingDequeue() + "，再入 40 后 Count=" + count);

// ---------- 10. BlockingCollection 一句 ----------
Console.WriteLine("\\n===== 10. BlockingCollection 一句 =====");
var blocking = new System.Collections.Concurrent.BlockingCollection<int>(boundedCapacity: 2);
blocking.Add(1);
Console.WriteLine("Take=" + blocking.Take());
blocking.CompleteAdding();
`,
    lang: 'cs',
  },

  // ============================================================
  // 第三十三章：SortedList 与 SortedDictionary
  // ============================================================
  {
    id: 'csharp5-ch33',
    group: '第四部分 泛型与集合',
    icon: '🗃️',
    title: 'SortedList 与 SortedDictionary',
    content: `## 第三十四章　SortedList 与 SortedDictionary

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

\`ReadOnlyDictionary\` 是 \`Dictionary\` 的只读包装。注意 \`Dictionary\` **没有** \`AsReadOnly()\` 方法（那是 \`List<T>.AsReadOnly()\`），字典要用构造函数包装：

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

本章 demo 对比三种排序集合的性能，并演示自定义 IComparer。

### 十、先字典后排序，往往更便宜

若「大多数时间按 key 查、偶尔才要有序列表」，用 \`Dictionary\` 查询，需要展示时 \`OrderBy\` / 拷到数组 \`Array.Sort\`。\`SortedDictionary\` / \`SortedList\` 每次写入都维持有序，读多写少且**必须随时有序**才值得。

\`SortedSet<T>\` 是有序不重复集合，\`GetViewBetween\` 做范围查询。比较器 \`IComparer<T>\` 必须与相等语义一致，否则能插进「重复」。

不可变家族：\`ImmutableSortedDictionary\` / \`ImmutableSortedSet\`（\`System.Collections.Immutable\`）适合快照、多线程只读分享；每次「修改」返回新根，旧版本仍可用。不要在热循环里当可变字典用。

### 十一、四套「有序」怎么挑

| 需求 | 选择 |
| --- | --- |
| 按 key 查，偶尔排序输出 | \`Dictionary\` + 读时 \`OrderBy\` |
| 始终按 key 有序、写少 | \`SortedDictionary\`（树）或数据很少时 \`SortedList\` |
| 有序且唯一的元素 | \`SortedSet\` |
| 多线程只读快照 | \`ImmutableSortedDictionary\` / \`ImmutableSortedSet\` |

\`SortedList\` 的 key/value 是平行数组，索引访问快、中间插入慢。\`Comparer<T>.Create\` 捕获外部状态时注意不要在比较中改集合。永远让 \`Compare(a,b)==0\` 与业务「同一条」一致，否则集合会悄悄吞重复或查不到。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「SortedList 与 SortedDictionary」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ===========================================================
// 第三十四章 SortedList / SortedDictionary / SortedSet
// 演示：按键有序字典、插入查找性能、IComparer、KeyedCollection、只读包装
// 适用：.NET 8 / C# 12 顶级语句
// 版本：ReadOnlyDictionary（.NET 4.5+）；KeyedCollection 的 int 索引器与 int 键会冲突
// 陷阱：SortedList 插入是 O(n) 搬数组；数据会持续增长选 SortedDictionary。比较器把两元素判 0 视为同一元素
// ===========================================================
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;

// ---------- 1. SortedList：两根平行数组，可按键也可按下标，插入要挪位置 ----------
Console.WriteLine("=== 1. SortedList 基础 ===");

var sorted = new SortedList<string, int>
{
    ["banana"] = 3,
    ["apple"] = 5,
    ["cherry"] = 8,
    ["date"] = 2
};

Console.WriteLine("SortedList 按键升序遍历：");
foreach (var kv in sorted)
    Console.WriteLine($"  {kv.Key}：{kv.Value}");

Console.WriteLine($"\\nsorted[\\"apple\\"] = {sorted["apple"]}");   // 按键
Console.WriteLine($"Keys[0] = {sorted.Keys[0]}");                  // 按索引
Console.WriteLine($"Values[0] = {sorted.Values[0]}");              // 按索引

// ---------- 2. SortedDictionary 基础 ----------
Console.WriteLine("\\n=== 2. SortedDictionary 基础 ===");

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

// SortedDictionary 是树，没有 Keys[i]；需要下标请用 SortedList 或先 ToArray

// ---------- 3. 三种集合性能对比 ----------
Console.WriteLine("\\n=== 3. 三种集合性能对比 ===");

const int N = 10_000;
var keys = new List<int>();
var rnd = new Random(42);
for (int i = 0; i < N; i++)
    keys.Add(rnd.Next(0, N * 10));

var sl = new SortedList<int, int>();
var sw = Stopwatch.StartNew();
foreach (var k in keys)
    sl[k] = 1;  // 重复 key 会更新
sw.Stop();
Console.WriteLine($"SortedList 插入 {N} 个：{sw.ElapsedMilliseconds} ms");

var sdict = new SortedDictionary<int, int>();
sw.Restart();
foreach (var k in keys)
    sdict[k] = 1;
sw.Stop();
Console.WriteLine($"SortedDictionary 插入 {N} 个：{sw.ElapsedMilliseconds} ms");

var sset = new SortedSet<int>();
sw.Restart();
foreach (var k in keys)
    sset.Add(k);
sw.Stop();
Console.WriteLine($"SortedSet 插入 {N} 个：{sw.ElapsedMilliseconds} ms");

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

// ---------- 4. 自定义 IComparer<Person> ----------
Console.WriteLine("\\n=== 4. 自定义 IComparer<Person> ===");

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

// ---------- 5. KeyedCollection 演示 ----------
Console.WriteLine("\\n=== 5. KeyedCollection 演示 ===");

var people = new PersonCollection
{
    new(1, "张三", 25),
    new(2, "李四", 30),
    new(3, "王五", 28)
};

Console.WriteLine($"第一个元素：{((IList<PersonWithId>)people)[0]}");

Console.WriteLine($"Id=2：{people[2]}");

people.RemoveAt(0);
people.Insert(0, new(10, "张三丰", 100));  // KeyedCollection 的 int 索引器与 int 键冲突，不能直接 people[0]=
Console.WriteLine($"修改后 Id=10：{people[10]}");

// ---------- 6. ReadOnlyDictionary ----------
Console.WriteLine("\\n=== 6. ReadOnlyDictionary ===");

var source = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2 };
var readOnly = new ReadOnlyDictionary<string, int>(source);  // 包装而非拷贝：改 source 这边仍看得到

Console.WriteLine($"ReadOnlyDictionary 元素数：{readOnly.Count}");
Console.WriteLine($"readOnly[\\"a\\"] = {readOnly["a"]}");

Console.WriteLine("ReadOnlyDictionary 不支持修改（会抛 NotSupportedException）");

// ---------- 7. SortedSet 集合操作 ----------
Console.WriteLine("\\n=== 7. SortedSet 集合操作 ===");

var setA = new SortedSet<int> { 1, 3, 5, 7, 9 };
var setB = new SortedSet<int> { 2, 3, 5, 8 };

var union = setA.Union(setB);
Console.WriteLine($"A ∪ B = {{{string.Join(", ", union)}}}");

var intersect = setA.Intersect(setB);
Console.WriteLine($"A ∩ B = {{{string.Join(", ", intersect)}}}");

Console.WriteLine($"A 中 [3, 7] 范围：{{{string.Join(", ", setA.GetViewBetween(3, 7))}}}");

public record Person(string Name, int Age);

public class PersonByAgeComparer : IComparer<Person>
{
    public int Compare(Person? x, Person? y)
    {
        if (x is null && y is null) return 0;
        if (x is null) return -1;
        if (y is null) return 1;
        // Compare 返回 0 = 同一元素，SortedSet 会丢其中一个；所以年龄相同还要比姓名
        int result = x.Age.CompareTo(y.Age);
        return result != 0 ? result : x.Name.CompareTo(y.Name);
    }
}

public record PersonWithId(int Id, string Name, int Age);

public class PersonCollection : KeyedCollection<int, PersonWithId>
{
    // 键从元素提取，插入后改 item.Id 不会自动挪桶——要用 ChangeItemKey 或当不可变
    protected override int GetKeyForItem(PersonWithId item) => item.Id;
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第三十四章：并发集合
  // ============================================================
  {
    id: 'csharp5-ch34',
    group: '第四部分 泛型与集合',
    icon: '⚡',
    title: '并发集合',
    content: `## 第三十五章　并发集合

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

本章 demo 演示 BlockingCollection 生产者-消费者 + ConcurrentDictionary 并发累加 + Channel 异步管道。

### 十二、GetOrAdd 工厂竞态、Channel vs 队列、Bag vs Queue

\`ConcurrentDictionary.GetOrAdd(key, k => Create(k))\` **不保证工厂只跑一次**：两个线程可能都 Create，其中一个结果被丢掉。工厂必须可重复、无副作用（或改用 \`Lazy<T>\` 做值）。\`AddOrUpdate\` 的 update 委托也可能重试。

| | 顺序 | 阻塞 | 适用 |
| --- | --- | --- | --- |
| \`ConcurrentQueue<T>\` | FIFO | 否（Try*） | 已有自己的等待逻辑 |
| \`BlockingCollection<T>\` | 取决于内部 | \`Take\` 可阻塞 | 经典生产者-消费者 |
| \`Channel<T>\` | FIFO | \`ReadAsync\` | 异步管道，首选现代写法 |
| \`ConcurrentBag<T>\` | 无 | 否 | 线程本地囤积、不在乎顺序 |
| \`ConcurrentStack<T>\` | LIFO | 否 | 池化、撤销式并发 |

Bag 可能让你「刚 Add 的自己 Take 走」，别当任务队列。需要公平交接用 Queue/Channel。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「并发集合」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// ===========================================================
// 第三十五章 并发集合
// 演示：ConcurrentDictionary、ConcurrentQueue/Bag、BlockingCollection、Channel、锁 vs 细粒度
// 适用：.NET 8 / C# 12 顶级语句（含 await，编译器会生成 async 入口）
// 版本：Channel<T>（.NET Core 3+ / .NET 8）；ConcurrentDictionary.AddOrUpdate / GetOrAdd
// 陷阱：并发集合「单次 API」原子，不等于「先读再写」组合原子。GetOrAdd 工厂可能被调用多次
// ===========================================================
using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;

// ---------- 1. ConcurrentDictionary：单次 AddOrUpdate 原子，不要先 Contains 再赋值 ----------
Console.WriteLine("=== 1. ConcurrentDictionary 并发累加 ===");

var counts = new ConcurrentDictionary<string, int>();
var words = new[] { "apple", "banana", "apple", "cherry", "banana", "apple" };

Parallel.For(0, 10_000, i =>
{
    string word = words[i % words.Length];
    // 更新工厂可能在竞争下重试；不要在工厂里做有副作用的 IO
    counts.AddOrUpdate(word, 1, (_, old) => old + 1);
});

Console.WriteLine("单词统计（10000 次并发累加）：");
foreach (var kv in counts)
    Console.WriteLine($"  {kv.Key}：{kv.Value}");

// ---------- 2. GetOrAdd 懒加载 ----------
Console.WriteLine("\\n=== 2. GetOrAdd 懒加载 ===");

var cache = new ConcurrentDictionary<int, string>();
var tasks = new List<Task<string>>();

for (int i = 0; i < 10; i++)
{
    tasks.Add(Task.Run(() =>
        cache.GetOrAdd(1, key =>
        {
            Console.WriteLine($"  工厂被调用，key={key}");  // 竞争时工厂可能跑多次，只有一个值留下
            return $"Value-{key}";
        })));
}

await Task.WhenAll(tasks);
Console.WriteLine($"最终值：{cache[1]}");

// ---------- 3. ConcurrentQueue 与 ConcurrentBag ----------
Console.WriteLine("\\n=== 3. ConcurrentQueue 与 ConcurrentBag ===");

var cq = new ConcurrentQueue<int>();
var cb = new ConcurrentBag<int>();

Parallel.For(0, 1000, i =>
{
    cq.Enqueue(i);
    cb.Add(i);
});

Console.WriteLine($"ConcurrentQueue 元素数：{cq.Count}");
Console.WriteLine($"ConcurrentBag 元素数：{cb.Count}");

int taken = 0;
while (cq.TryDequeue(out int item))
{
    if (taken < 3) Console.WriteLine($"  出队：{item}");
    taken++;
    if (taken >= 3) break;
}

// ---------- 4. BlockingCollection 生产者-消费者 ----------
Console.WriteLine("\\n=== 4. BlockingCollection 生产者-消费者 ===");

using var bc = new BlockingCollection<int>(boundedCapacity: 5);

var producer = Task.Run(() =>
{
    for (int i = 1; i <= 20; i++)
    {
        bc.Add(i);  // 满了会阻塞等待
        Console.WriteLine($"  [生产者] 添加 {i}");
        Thread.Sleep(10);  // 模拟生产耗时
    }
    bc.CompleteAdding();  // 漏调的话消费者 foreach 会永远阻塞
    Console.WriteLine("  [生产者] 完成添加");
});

var consumer = Task.Run(() =>
{
    foreach (var item in bc.GetConsumingEnumerable())
    {
        Console.WriteLine($"  [消费者] 处理 {item}");
        Thread.Sleep(30);  // 模拟消费耗时
    }
    Console.WriteLine("  [消费者] 完成消费");
});

await Task.WhenAll(producer, consumer);
Console.WriteLine("生产者-消费者全部完成");

// ---------- 5. 多消费者 BlockingCollection ----------
Console.WriteLine("\\n=== 5. 多消费者 BlockingCollection ===");

using var bc2 = new BlockingCollection<string>(10);

var consumers = Enumerable.Range(0, 3).Select(id => Task.Run(() =>
{
    foreach (var item in bc2.GetConsumingEnumerable())
        Console.WriteLine($"  消费者 #{id} 处理：{item}");
})).ToArray();

foreach (var item in new[] { "任务A", "任务B", "任务C", "任务D", "任务E" })
    bc2.Add(item);
bc2.CompleteAdding();

await Task.WhenAll(consumers);

// ---------- 6. Channel<T> 异步管道 ----------
Console.WriteLine("\\n=== 6. Channel<T> 异步管道 ===");

var channel = Channel.CreateBounded<string>(3);

async Task ProduceAsync()
{
    for (int i = 1; i <= 5; i++)
    {
        var msg = $"消息-{i}";
        await channel.Writer.WriteAsync(msg);  // 满了会异步等待
        Console.WriteLine($"  [Writer] 写入 {msg}");
        await Task.Delay(50);
    }
    channel.Writer.Complete();  // 对偶于 BlockingCollection.CompleteAdding
}

async Task ConsumeAsync()
{
    await foreach (var item in channel.Reader.ReadAllAsync())
    {
        Console.WriteLine($"  [Reader] 读取 {item}");
        await Task.Delay(100);  // 模拟处理耗时
    }
}

await Task.WhenAll(ProduceAsync(), ConsumeAsync());
Console.WriteLine("Channel 管道完成");

// ---------- 7. 性能对比：Dictionary + lock vs ConcurrentDictionary ----------
Console.WriteLine("\\n=== 7. 性能对比：Dictionary + lock vs ConcurrentDictionary ===");

const int N = 100_000;
var plainDict = new Dictionary<int, int>();
object lockObj = new();
var concurrentDict = new ConcurrentDictionary<int, int>();

var sw = Stopwatch.StartNew();
Parallel.For(0, N, i =>
{
    lock (lockObj)  // 整表一把锁：正确但吞吐差；漏锁比慢更致命
    {
        plainDict[i] = i;
    }
});
sw.Stop();
Console.WriteLine($"Dictionary + lock 写 {N} 次：{sw.ElapsedMilliseconds} ms");

sw.Restart();
Parallel.For(0, N, i =>
{
    concurrentDict[i] = i;  // 细粒度锁，性能好
});
sw.Stop();
Console.WriteLine($"ConcurrentDictionary 写 {N} 次：{sw.ElapsedMilliseconds} ms");
`,
    lang: 'cs',
  },
];

export { chapters };
