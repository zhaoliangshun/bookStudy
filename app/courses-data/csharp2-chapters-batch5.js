// =============================================================
// C# 从入门到精通大全 —— 第五批章节（第五部分 泛型与集合，共 7 章）
// -------------------------------------------------------------
// 本批包含 7 章：
//   csharp2-ch20 : 第二十章 泛型入门
//   csharp2-ch21 : 第二十一章 泛型约束与方法
//   csharp2-ch22 : 第二十二章 List<T> 集合
//   csharp2-ch23 : 第二十三章 Dictionary 字典
//   csharp2-ch24 : 第二十四章 HashSet / Queue / Stack / LinkedList
//   csharp2-ch25 : 第二十五章 IEnumerable 与迭代器
//   csharp2-ch26 : 第二十六章 元组与 ValueTuple
//
// 所有 C# 代码示例均可在交互式编辑器中运行（基于顶级语句）。
// 适用版本：.NET 8 LTS / C# 12
// =============================================================

const chapters = [
  // ============================================================
  // 第二十章：泛型入门
  // ============================================================
  {
    id: 'csharp2-ch20',
    group: '第五部分 泛型与集合',
    icon: '🎯',
    title: '泛型入门',
    content: `## 第二十章　泛型入门

### 一、为什么需要泛型

在没有泛型的年代（.NET 1.0），通用容器靠 \`ArrayList\` 实现——它存的是 \`object\`：

\`\`\`csharp
var list = new System.Collections.ArrayList();
list.Add(1);        // int 装箱成 object
list.Add("hello");  // string 也是 object
list.Add(3.14);

// 取出时必须强制转换，且容易写错类型
int n = (int)list[0];   // OK
int bad = (int)list[1]; // 运行时抛 InvalidCastException
\`\`\`

\`ArrayList\` 有三大痛点：

1. **类型不安全**：编译器无法阻止你混装不同类型，错误延迟到运行时。
2. **装箱拆箱开销**：值类型（int、double、struct）存入 \`object\` 要装箱，取出要拆箱，产生大量内存分配。
3. **代码可读性差**：\`(int)list[0]\` 这种强转让人看不出容器里到底是什么。

泛型（.NET 2.0 引入）正是为解决这些问题而生：**把类型当参数**，写一次代码，多种类型复用，且编译期就知道类型。

### 二、泛型类定义

泛型类用 \`<T>\` 声明类型参数，\`T\` 是约定俗成的占位名（可任意）：

\`\`\`csharp
// 一个最简单的泛型容器
public class Box<T>
{
    public T Value { get; set; }

    public Box(T value) => Value = value;

    public void Show() => Console.WriteLine($"Box contains: {Value}");
}

// 使用时把 T 替换成具体类型
var intBox = new Box<int>(42);
var strBox = new Box<string>("hello");
intBox.Show();   // Box contains: 42
strBox.Show();   // Box contains: hello
\`\`\`

#### 多个类型参数

\`\`\`csharp
public class Pair<TKey, TValue>
{
    public TKey Key { get; }
    public TValue Value { get; }

    public Pair(TKey key, TValue value)
    {
        Key = key;
        Value = value;
    }
}

var p = new Pair<string, int>("age", 30);
Console.WriteLine($"{p.Key} = {p.Value}");  // age = 30
\`\`\`

\`Dictionary<TKey, TValue>\` 本质上就是一个有两个类型参数的泛型类。

### 三、泛型方法

方法也可以单独泛型——不必让整个类泛型化：

\`\`\`csharp
public class Helper
{
    // T 是方法级类型参数，调用时确定
    public static void Print<T>(T item)
    {
        Console.WriteLine($"Type: {typeof(T)}, Value: {item}");
    }
}

Helper.Print(42);           // Type: System.Int32, Value: 42
Helper.Print("hello");      // Type: System.String, Value: hello
Helper.Print<double>(3.14); // 显式指定类型参数
\`\`\`

### 四、泛型 vs object：性能对比

来看一段直观的对比——分别用 \`ArrayList\`（object）和 \`List<int>\`（泛型）存 100 万个整数：

\`\`\`csharp
using System.Diagnostics;

var sw = Stopwatch.StartNew();

// object 方式：装箱 + 拆箱
var arrList = new System.Collections.ArrayList();
for (int i = 0; i < 1_000_000; i++) arrList.Add(i);  // 装箱
int sum1 = 0;
foreach (int x in arrList) sum1 += x;  // 拆箱
sw.Stop();
Console.WriteLine($"ArrayList: {sw.ElapsedMilliseconds} ms");

sw.Restart();

// 泛型方式：零装箱
var genList = new List<int>();
for (int i = 0; i < 1_000_000; i++) genList.Add(i);
int sum2 = 0;
foreach (int x in genList) sum2 += x;
sw.Stop();
Console.WriteLine($"List<int>: {sw.ElapsedMilliseconds} ms");
\`\`\`

典型输出：\`ArrayList\` 比 \`List<int>\` 慢 3~5 倍，因为装箱产生了 100 万个堆对象。

### 五、类型安全的真正含义

泛型的类型安全是**编译期**保证的：

\`\`\`csharp
var list = new List<int> { 1, 2, 3 };
list.Add(4);
// list.Add("oops");  // 编译错误！不能把 string 加进 List<int>

int n = list[0];  // 无需强转
\`\`\`

编译器在编译期就检查类型匹配，错误根本不会带到运行时——这是泛型相比 \`object\` 最大的优势。

### 六、实战 demo：泛型 Swap 与 Stack<T>

#### demo 1：泛型交换函数

\`\`\`csharp
// 经典入门 demo：交换两个变量
public static void Swap<T>(ref T a, ref T b)
{
    T temp = a;
    a = b;
    b = temp;
}

int x = 1, y = 2;
Swap(ref x, ref y);
Console.WriteLine($"x={x}, y={y}");  // x=2, y=1

string s1 = "A", s2 = "B";
Swap(ref s1, ref s2);
Console.WriteLine($"s1={s1}, s2={s2}");  // s1=B, s2=A
\`\`\`

注意 \`ref\` 关键字——参数按引用传递，方法内修改会影响外部变量。如果不加 \`ref\`，Swap 就只是一次无效的局部交换。

#### demo 2：自己实现一个泛型栈

\`\`\`csharp
public class MyStack<T>
{
    private T[] _items = new T[4];
    private int _count = 0;

    public int Count => _count;

    public void Push(T item)
    {
        if (_count == _items.Length)
        {
            // 扩容：翻倍
            var newArr = new T[_items.Length * 2];
            Array.Copy(_items, newArr, _count);
            _items = newArr;
        }
        _items[_count++] = item;
    }

    public T Pop()
    {
        if (_count == 0) throw new InvalidOperationException("Stack is empty");
        T item = _items[--_count];
        _items[_count] = default!;  // 释放引用，避免泄漏
        return item;
    }

    public T Peek() => _count == 0
        ? throw new InvalidOperationException("Stack is empty")
        : _items[_count - 1];
}

// 使用
var stack = new MyStack<string>();
stack.Push("first");
stack.Push("second");
Console.WriteLine(stack.Pop());   // second
Console.WriteLine(stack.Peek());  // first
Console.WriteLine(stack.Count);   // 1
\`\`\`

注意 \`default!\` —— \`default(T)\` 对引用类型返回 \`null\`，对值类型返回默认值（0、false 等）。 \`!\` 表示告诉编译器"我知道这可能是 null，但此处安全"（null 抑制运算符）。

### 七、泛型的命名约定

| 参数名 | 含义 |
|--------|------|
| \`T\` | 通用单类型参数 |
| \`TKey\`, \`TValue\` | 字典的键 / 值类型 |
| \`TInput\`, \`TOutput\` | 转换函数的输入 / 输出 |
| \`TResult\` | 返回值类型 |

约定只是约定，编译器不强制，但遵守约定能让代码更易读。

### 八、小结

- 泛型把**类型当参数**，写一次代码，多种类型复用。
- 相比 \`object\` 容器：**类型安全**（编译期检查）+ **零装箱**（值类型性能更好）。
- 泛型类用 \`class Foo<T>\`，泛型方法用 \`void Bar<T>(T x)\`。
- 多类型参数用 \`<TKey, TValue>\`，命名遵循约定。
- \`List<T>\` / \`Dictionary<K,V>\` 等都是 BCL 内置泛型集合，下章起逐个深入。
`,
  },

  // ============================================================
  // 第二十一章：泛型约束与方法
  // ============================================================
  {
    id: 'csharp2-ch21',
    group: '第五部分 泛型与集合',
    icon: '🔗',
    title: '泛型约束与方法',
    content: `## 第二十一章　泛型约束与方法

### 一、为什么需要约束

泛型 \`T\` 默认"什么都能传"——但代价是：方法体内只能调用 \`object\` 上的方法（\`Equals\`、\`GetHashCode\`、\`ToString\`），无法用 \`>\` 比大小、无法 \`new T()\`、无法调用特定接口。

约束（\`where\`）就是给 \`T\` 加限制，换取更多能力：

\`\`\`csharp
// 没有约束：T 是 object，啥都干不了
public static T Max<T>(T a, T b)
{
    // if (a > b) ...  // 编译错误！T 不一定支持 >
    return a;
}

// 加约束：T 必须实现 IComparable<T>
public static T Max<T>(T a, T b) where T : IComparable<T>
{
    return a.CompareTo(b) > 0 ? a : b;
}

Console.WriteLine(Max(3, 7));             // 7
Console.WriteLine(Max("apple", "banana")); // banana（按字典序）
\`\`\`

### 二、五种约束类型

| 约束 | 含义 | 能做什么 |
|------|------|---------|
| \`where T : class\` | 必须是引用类型 | 可赋值 \`null\`，可用 \`as\` / \`is\` |
| \`where T : struct\` | 必须是值类型（不可为 null） | 不可赋值 \`null\` |
| \`where T : new()\` | 必须有无参公共构造函数 | 可 \`new T()\` |
| \`where T : 接口名\` | 必须实现某接口 | 可调用接口方法 |
| \`where T : 基类名\` | 必须继承某基类 | 可调用基类成员 |

#### demo：每种约束的样子

\`\`\`csharp
// 1. class 约束：T 必须是引用类型
public static T? FindOrNull<T>(IList<T> list, T target) where T : class
{
    foreach (var item in list)
        if (item.Equals(target)) return item;
    return null;  // 引用类型才能返回 null
}

// 2. struct 约束：T 必须是值类型
public static T? FindOrNullable<T>(IList<T> list, T target) where T : struct
{
    foreach (var item in list)
        if (item.Equals(target)) return item;
    return null;  // T? 是 Nullable<T>，值类型才能这样
}

// 3. new() 约束：可以 new T()
public static T CreateDefault<T>() where T : new()
{
    return new T();  // 调用无参构造
}

// 4. 接口约束
public static string Describe<T>(T item) where T : IFormattable
{
    return item.ToString("G", null);  // 可调用接口方法
}

// 5. 基类约束
public static string GetName<T>(T obj) where T : Animal
{
    return obj.Name;  // 可访问基类属性
}

public class Animal { public string Name { get; set; } = ""; }
\`\`\`

### 三、多个约束

一个 \`T\` 可以同时满足多个约束，用逗号分隔：

\`\`\`csharp
// T 必须是引用类型 + 实现 IComparable<T> + 有无参构造
public class SortedFactory<T> where T : class, IComparable<T>, new()
{
    public T CreateAndCompare(T a, T b)
    {
        var fresh = new T();         // 因为有 new() 约束
        return a.CompareTo(b) > 0 ? a : b;  // 因为有 IComparable<T> 约束
    }
}
\`\`\`

#### 不同参数分别约束

\`\`\`csharp
// TKey 和 TValue 各自有约束
public static TValue GetOrCreate<TKey, TValue>(
    Dictionary<TKey, TValue> dict, TKey key)
    where TKey : notnull
    where TValue : new()
{
    if (!dict.TryGetValue(key, out var value))
    {
        value = new TValue();
        dict[key] = value;
    }
    return value;
}
\`\`\`

\`notnull\` 是 .NET 8 引入的约束，表示"不能是 null 的类型"——引用类型和值类型都行，但 nullable 引用类型（如 \`string?\`）不行。

### 四、泛型方法详解

泛型方法的类型参数可以由实参推断，也可显式指定：

\`\`\`csharp
public static class ArrayHelper
{
    // 类型参数 T 由实参推断
    public static T FirstOrDefault<T>(IEnumerable<T> source, T defaultValue)
    {
        foreach (var item in source) return item;
        return defaultValue;
    }
}

var nums = new[] { 1, 2, 3 };
Console.WriteLine(ArrayHelper.FirstOrDefault(nums, -1));  // 1
Console.WriteLine(ArrayHelper.FirstOrDefault(Array.Empty<int>(), -1));  // -1
\`\`\`

注意：仅当所有类型参数都能从实参推断时才能省略 \`<T>\`；若参数列表里没有 \`T\`（比如全靠约束），必须显式指定。

### 五、泛型委托：Action 与 Func 简介

BCL 内置两个最常用的泛型委托，避免你每次都自己声明：

#### Action：无返回值

\`\`\`csharp
// Action        无参无返回
// Action<T>     1 参无返回
// Action<T1,T2> 2 参无返回
// ... 最多 16 参

Action<string> log = msg => Console.WriteLine($"[LOG] {msg}");
log("hello");

Action<int, int> printSum = (a, b) => Console.WriteLine(a + b);
printSum(3, 5);
\`\`\`

#### Func：有返回值

\`\`\`csharp
// Func<TResult>          无参返回 TResult
// Func<T, TResult>       1 参返回 TResult
// Func<T1,T2,TResult>    2 参返回 TResult

Func<int, int> square = x => x * x;
Console.WriteLine(square(5));  // 25

Func<int, int, int> add = (a, b) => a + b;
Console.WriteLine(add(3, 5));  // 8

// 用 Func 作方法参数：策略模式
public static int Apply(int x, Func<int, int> op) => op(x);

Console.WriteLine(Apply(5, x => x * 2));   // 10
Console.WriteLine(Apply(5, x => x + 1));   // 6
\`\`\`

> ⭐ \`Action\` 和 \`Func\` 是 LINQ 和事件回调的基础，后面章节会大量用到。

### 六、协变与逆变简介

泛型类型参数有 \`in\` / \`out\` 两个修饰符，控制"能否把派生类型的泛型赋给基类型的泛型"：

#### out（协变）：只能用作返回

\`\`\`csharp
// IEnumerable<out T> 的 T 是协变的
IEnumerable<string> strings = new List<string> { "a", "b" };
IEnumerable<object> objects = strings;  // OK！string 是 object 的子类
\`\`\`

因为 \`IEnumerable<out T>\` 的 \`T\` 标了 \`out\`，只能"产出"T，不能"消费"T——所以从里面拿出来的 \`string\` 一定是 \`object\`，安全。

#### in（逆变）：只能用作参数

\`\`\`csharp
// Action<in T> 的 T 是逆变的
Action<object> objAction = o => Console.WriteLine(o);
Action<string> strAction = objAction;  // OK！能处理 object 的也能处理 string
\`\`\`

#### 何时需要自己写

只有设计**通用接口 / 委托**时才需要考虑协变逆变。日常业务代码用 BCL 内置的 \`IEnumerable<out T>\`、\`Action<in T>\`、\`Func<in T, out TResult>\` 即可，它们都标好了。

### 七、实战 demo：泛型仓库模式

\`\`\`csharp
// 一个通用的内存仓储：约束 T 必须 new()，方便外部创建
public class Repository<T> where T : class, new()
{
    private readonly Dictionary<int, T> _store = new();
    private int _nextId = 1;

    public T Add(T entity)
    {
        _store[_nextId++] = entity;
        return entity;
    }

    public T? Get(int id) => _store.TryGetValue(id, out var v) ? v : null;

    public IEnumerable<T> All => _store.Values;

    public bool Remove(int id) => _store.Remove(id);
}

// 用法：把任何类扔进去
var users = new Repository<User>();
users.Add(new User { Name = "Alice" });
users.Add(new User { Name = "Bob" });

foreach (var u in users.All)
    Console.WriteLine(u.Name);

public class User { public string Name { get; set; } = ""; }
\`\`\`

约束 \`class, new()\` 让我们能在需要时 \`new T()\`（虽然本例没用到，但很多仓储实现会用到——比如默认值创建）。

### 八、小结

- 约束 \`where\` 给 \`T\` 加限制，换取能力（比较、new、调用接口方法）。
- 五大约束：\`class\` / \`struct\` / \`new()\` / 接口 / 基类，可组合。
- \`Action\` / \`Func\` 是 BCL 内置泛型委托，是回调与 LINQ 的基石。
- 协变（\`out\`）允许派生→基类赋值，逆变（\`in\`）允许基类→派生赋值。
- 设计通用框架时才需要自己写协变逆变；日常业务直接用内置的即可。
`,
  },

  // ============================================================
  // 第二十二章：List<T> 集合
  // ============================================================
  {
    id: 'csharp2-ch22',
    group: '第五部分 泛型与集合',
    icon: '📋',
    title: 'List<T> 集合',
    content: `## 第二十二章　List<T> 集合

### 一、List<T> 是什么

\`List<T>\` 是 .NET 中**用得最多**的集合，内部用数组存储，容量不够时自动扩容（翻倍）。它兼具数组的随机访问速度（O(1)）和动态增删的便利性。

> ⭐ 高频知识点：日常业务里 80% 的"列表"需求都用 \`List<T>\` 解决，是必须熟练掌握的集合。

### 二、创建 List

\`\`\`csharp
// 1. 空列表
var list1 = new List<int>();

// 2. 集合初始化器（推荐）
var list2 = new List<int> { 1, 2, 3, 4, 5 };

// 3. 从数组创建
int[] arr = { 10, 20, 30 };
var list3 = new List<int>(arr);

// 4. 指定初始容量（知道大小时推荐，避免多次扩容）
var list4 = new List<int>(capacity: 1000);

// 5. 从其他 IEnumerable 创建
var list5 = new List<string>(Enumerable.Repeat("x", 5));
\`\`\`

### 三、增删元素

#### Add / AddRange / Insert / InsertRange

\`\`\`csharp
var list = new List<string> { "a", "b", "c" };

list.Add("d");                              // 末尾添加
list.AddRange(new[] { "e", "f" });          // 批量添加
list.Insert(0, "first");                    // 在指定位置插入
list.InsertRange(1, new[] { "x", "y" });    // 批量插入

Console.WriteLine(string.Join(",", list));
// first,x,y,a,b,c,d,e,f
\`\`\`

#### Remove / RemoveAt / RemoveAll / Clear

\`\`\`csharp
var nums = new List<int> { 1, 2, 3, 2, 4, 2, 5 };

nums.Remove(2);          // 删除第一个等于 2 的元素 → [1,3,2,4,2,5]
nums.RemoveAt(0);        // 删除索引 0 的元素
nums.RemoveAll(n => n == 2);  // 删除所有等于 2 的元素
nums.RemoveRange(0, 2);  // 从索引 0 开始删 2 个
nums.Clear();            // 清空
\`\`\`

**性能要点：**

- \`Add\` 均摊 O(1)（偶尔扩容时 O(n)）。
- \`Insert(0, ...)\` / \`RemoveAt(0)\` 是 O(n)——后面所有元素都要移动。
- \`RemoveAll\` 是 O(n)。
- 频繁在头部增删：换 \`LinkedList<T>\`。

### 四、访问元素

\`\`\`csharp
var list = new List<int> { 10, 20, 30, 40, 50 };

// 索引访问（O(1)）
Console.WriteLine(list[0]);    // 10
Console.WriteLine(list[^1]);   // 50（C# 8+ 反向索引）

// 修改
list[0] = 100;

// Count 属性
Console.WriteLine(list.Count);  // 5

// 遍历
foreach (var x in list) Console.WriteLine(x);
\`\`\`

### 五、查找元素

\`\`\`csharp
var list = new List<int> { 3, 7, 2, 9, 5, 7 };

// Contains：是否存在
Console.WriteLine(list.Contains(7));   // True

// IndexOf：第一个匹配的索引，找不到返回 -1
Console.WriteLine(list.IndexOf(7));     // 1
Console.WriteLine(list.IndexOf(99));    // -1
Console.WriteLine(list.LastIndexOf(7)); // 5

// Find 系列：用谓词（Predicate<T>，本质是 Func<T, bool>）
var firstOver5 = list.Find(n => n > 5);          // 7（第一个满足的）
var lastOver5 = list.FindLast(n => n > 5);       // 7（最后一个满足的）
var allOver5 = list.FindAll(n => n > 5);         // [7,9,5,7]
var idx = list.FindIndex(n => n > 5);            // 1
var lastIdx = list.FindLastIndex(n => n > 5);    // 5
var exists = list.Exists(n => n > 100);          // False
var trueForAll = list.TrueForAll(n => n > 0);    // True
\`\`\`

### 六、ForEach 与 ConvertAll

\`\`\`csharp
var nums = new List<int> { 1, 2, 3, 4, 5 };

// ForEach：内联遍历（不返回新集合）
nums.ForEach(n => Console.Write(n + " "));  // 1 2 3 4 5

// ConvertAll：元素转换（等价于 Select 的就地版本）
var doubled = nums.ConvertAll(n => n * 2);       // [2,4,6,8,10]
var strs = nums.ConvertAll(n => n.ToString());  // ["1","2",...]
\`\`\`

> 注意：\`List<T>.ForEach\` 是 \`List<T>\` 自己的方法，不是 LINQ。LINQ 的 \`Select\` 是延迟执行的，\`ConvertAll\` 是立即执行的。

### 七、排序

\`\`\`csharp
var nums = new List<int> { 3, 1, 4, 1, 5, 9, 2, 6 };

// 1. 默认排序（升序，原地修改）
nums.Sort();
// [1,1,2,3,4,5,6,9]

// 2. 反转
nums.Reverse();

// 3. 用 Comparison<T> 排序（降序）
nums.Sort((a, b) => b.CompareTo(a));

// 4. 用 IComparer<T> 排序（自定义比较器）
public class DescComparer : IComparer<int>
{
    public int Compare(int x, int y) => y.CompareTo(x);
}
nums.Sort(new DescComparer());

// 5. 不修改原集合的排序：OrderBy（LINQ，返回新集合）
var sorted = nums.OrderBy(n => n).ToList();
\`\`\`

#### 对自定义类型排序

\`\`\`csharp
var people = new List<Person>
{
    new("Bob", 25),
    new("Alice", 30),
    new("Charlie", 20)
};

// 按年龄升序
people.Sort((a, b) => a.Age.CompareTo(b.Age));

// 按 Name 排序（LINQ 更简洁）
var byName = people.OrderBy(p => p.Name).ToList();

public record Person(string Name, int Age);
\`\`\`

### 八、容量 Capacity

\`List<T>\` 内部维护两个数字：

- \`Count\`：实际元素数。
- \`Capacity\`：内部数组长度。

\`\`\`csharp
var list = new List<int>();
Console.WriteLine($"Count={list.Count}, Capacity={list.Capacity}");  // 0, 0

for (int i = 0; i < 5; i++) list.Add(i);
Console.WriteLine($"Count={list.Count}, Capacity={list.Capacity}");  // 5, 8（扩容到 8）

// 主动收缩容量到刚好等于 Count
list.TrimExcess();
Console.WriteLine($"Capacity={list.Capacity}");  // 5
\`\`\`

**经验法则：**

- 知道大致大小时，构造时传 \`capacity\`，避免多次扩容。
- 不再增长时调 \`TrimExcess()\` 释放多余内存（适合长生命周期的 List）。

### 九、实战 demo：学生成绩管理

\`\`\`csharp
var students = new List<Student>
{
    new("Alice", 92),
    new("Bob", 78),
    new("Charlie", 85),
    new("Diana", 96),
    new("Eve", 60)
};

// 1. 找最高分
var top = students.FindAll(s => s.Score >= 90);
Console.WriteLine("优秀：");
top.ForEach(s => Console.WriteLine($"  {s.Name} - {s.Score}"));

// 2. 按分数降序
students.Sort((a, b) => b.Score.CompareTo(a.Score));
Console.WriteLine("排名：");
for (int i = 0; i < students.Count; i++)
    Console.WriteLine($"  #{i + 1} {students[i].Name} - {students[i].Score}");

// 3. 平均分
var avg = students.ConvertAll(s => s.Score).Average();
Console.WriteLine($"平均分：{avg:F2}");

// 4. 不及格名单
var failed = students.FindAll(s => s.Score < 60);
Console.WriteLine($"不及格：{failed.Count} 人");

public record Student(string Name, int Score);
\`\`\`

\`Average\` 是 LINQ 扩展方法（下一批章节详讲），这里先借用——它对 \`IEnumerable<int>\` 求平均。

### 十、List<T> vs 数组 vs ReadOnlyCollection

| 类型 | 大小可变 | 性能 | 适用 |
|------|---------|------|------|
| \`T[]\` | 否 | 最高 | 固定大小、性能敏感 |
| \`List<T>\` | 是 | 高 | 通用动态列表 |
| \`IReadOnlyList<T>\` | — | 同上 | 对外暴露只读视图 |
| \`ImmutableList<T>\` | 不可变（每次返回新） | 较低 | 函数式 / 共享不可变状态 |

\`\`\`csharp
var list = new List<int> { 1, 2, 3 };

// 转 ReadonlyCollection，防止外部修改
IReadOnlyList<int> readOnly = list.AsReadOnly();
\`\`\`

### 十一、小结

- \`List<T>\` 是动态数组，索引访问 O(1)，末尾增删 O(1)，中间增删 O(n)。
- 增删用 \`Add\` / \`Insert\` / \`Remove\` / \`RemoveAll\`，查找用 \`Contains\` / \`IndexOf\` / \`Find\` 系列。
- \`ForEach\` / \`ConvertAll\` 是 \`List<T>\` 自带方法，立即执行；LINQ 的 \`Select\` 是延迟执行。
- 排序用 \`Sort\`（原地）或 \`OrderBy\`（返回新集合）。
- 知道大小时用 \`capacity\` 预分配，避免反复扩容。
- 对外暴露 \`IReadOnlyList<T>\` 比直接暴露 \`List<T>\` 更安全。
`,
  },

  // ============================================================
  // 第二十三章：Dictionary 字典
  // ============================================================
  {
    id: 'csharp2-ch23',
    group: '第五部分 泛型与集合',
    icon: '🗂️',
    title: 'Dictionary 字典',
    content: `## 第二十三章　Dictionary 字典

### 一、Dictionary 是什么

\`Dictionary<TKey, TValue>\` 是基于哈希表实现的键值对集合，**按键查找 O(1)**。这是 .NET 中第二常用的集合，仅次于 \`List<T>\`。

> ⭐ 高频知识点：缓存、计数、分组、配置映射……几乎所有"按 key 找 value"的场景都用 \`Dictionary\`。

### 二、创建与初始化

\`\`\`csharp
// 1. 空字典
var d1 = new Dictionary<string, int>();

// 2. 集合初始化器（推荐）
var d2 = new Dictionary<string, int>
{
    ["apple"] = 5,
    ["banana"] = 3,
    ["cherry"] = 8
};

// 3. 旧式初始化器（用 Add）
var d3 = new Dictionary<string, int>
{
    { "apple", 5 },
    { "banana", 3 }
};

// 4. 从 IEnumerable<KeyValuePair> 创建
var pairs = new List<KeyValuePair<string, int>>
{
    new("x", 1),
    new("y", 2)
};
var d4 = new Dictionary<string, int>(pairs);

// 5. 指定初始容量（知道大小时推荐）
var d5 = new Dictionary<string, int>(capacity: 100);
\`\`\`

注意 \`["key"] = value\` 与 \`{ "key", value }\` 的区别：前者是索引器语法（.NET 6+ 推荐），后者调用 \`Add\` 方法——后者在键重复时会抛异常。

### 三、增删改

\`\`\`csharp
var dict = new Dictionary<string, int>();

// 增：Add（键已存在会抛异常）
dict.Add("a", 1);
dict.Add("b", 2);
// dict.Add("a", 99);  // 抛 ArgumentException

// 改：索引器（键不存在则新增）
dict["a"] = 10;
dict["c"] = 30;  // 新增

// 删
dict.Remove("b");      // 返回 bool 表示是否删成功
dict.Remove("b", out var removedVal);  // 同时取出被删的值

// 清空
dict.Clear();
\`\`\`

### 四、访问与查找

#### 索引器访问

\`\`\`csharp
var dict = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2 };

// 索引器：键不存在会抛 KeyNotFoundException
Console.WriteLine(dict["a"]);  // 1
// Console.WriteLine(dict["z"]);  // 抛异常
\`\`\`

> ⚠ 陷阱：\`dict[key]\` 在键不存在时抛 \`KeyNotFoundException\`。如果不确定键是否存在，**永远优先用 \`TryGetValue\`**。

#### ContainsKey / ContainsValue

\`\`\`csharp
Console.WriteLine(dict.ContainsKey("a"));   // True
Console.WriteLine(dict.ContainsValue(2));   // True
\`\`\`

注意：\`ContainsKey\` 是 O(1)（哈希查找），\`ContainsValue\` 是 O(n)（要遍历所有值）。所以用字典查找"值是否存在"是反模式——你应该反向建一个 \`Dictionary<值, 键>\`。

#### TryGetValue：安全的访问方式

\`\`\`csharp
if (dict.TryGetValue("a", out int val))
    Console.WriteLine($"找到了：{val}");
else
    Console.WriteLine("不存在");

// C# 7+ 模式匹配写法（推荐）
if (dict.TryGetValue("a", out var v))
    Console.WriteLine(v);
\`\`\`

### 五、遍历

\`\`\`csharp
var dict = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2, ["c"] = 3 };

// 1. 遍历 KeyValuePair
foreach (var kv in dict)
    Console.WriteLine($"{kv.Key} = {kv.Value}");

// 2. 仅遍历键
foreach (var key in dict.Keys)
    Console.WriteLine(key);

// 3. 仅遍历值
foreach (var val in dict.Values)
    Console.WriteLine(val);

// 4. 解构遍历（C# 7+）
foreach (var (key, value) in dict)
    Console.WriteLine($"{key} -> {value}");
\`\`\`

**重要：** 字典的遍历顺序**不保证**是插入顺序。如果需要按插入顺序遍历，.NET 9 有 \`OrderedDictionary\`，旧版本可以用 \`List<KeyValuePair>\` 辅助。

### 六、键必须唯一

\`\`\`csharp
var dict = new Dictionary<string, int>();
dict["a"] = 1;
dict["a"] = 2;  // 不是错误，是覆盖
Console.WriteLine(dict["a"]);  // 2

dict.Add("a", 3);  // 抛异常：键已存在
\`\`\`

### 七、键的要求

作为键的类型必须：

1. **重写 \`Equals\` 和 \`GetHashCode\`**（或用 \`record\`）。
2. **不可变**（或至少在使用过程中不变，否则哈希值改变会导致找不到）。

#### 反面教材：用可变类做键

\`\`\`csharp
public class MutableKey
{
    public string Name { get; set; }
    // 没重写 Equals/GetHashCode，默认按引用比较
}

var k1 = new MutableKey { Name = "x" };
var dict = new Dictionary<MutableKey, int> { [k1] = 1 };
k1.Name = "y";  // 修改了！
// dict[k1] 现在找不到了，因为哈希值变了（如果重写了的话）
// 即使没重写，按引用也能找到，但语义上已经乱了
\`\`\`

#### 正确做法：用 record

\`\`\`csharp
public record PointKey(int X, int Y);

var map = new Dictionary<PointKey, string>
{
    [new PointKey(0, 0)] = "原点",
    [new PointKey(1, 1)] = "对角"
};

Console.WriteLine(map[new PointKey(1, 1)]);  // 对角
// 即便新建一个 PointKey(1, 1)，record 也按值相等
\`\`\`

\`record\` 自动生成基于值的 \`Equals\` / \`GetHashCode\`，是做字典键的首选。

#### 字符串做键的特殊注意

字符串做键没问题，但要小心**大小写**：

\`\`\`csharp
var dict = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
{
    ["Apple"] = 1
};
Console.WriteLine(dict["APPLE"]);  // 1，不区分大小写
\`\`\`

构造时传 \`StringComparer\` 是优雅处理大小写的方式。

### 八、常用场景

#### 场景 1：缓存

\`\`\`csharp
var cache = new Dictionary<string, string>();

string GetData(string key)
{
    if (cache.TryGetValue(key, out var value))
        return value;  // 命中缓存

    // 模拟昂贵计算
    value = $"computed-{key}";
    cache[key] = value;
    return value;
}
\`\`\`

#### 场景 2：计数 / 分组

\`\`\`csharp
var words = new[] { "apple", "banana", "apple", "cherry", "banana", "apple" };
var counts = new Dictionary<string, int>();

foreach (var w in words)
{
    // 经典写法
    if (!counts.TryGetValue(w, out var c))
        c = 0;
    counts[w] = c + 1;
}

// 更简洁：TryGetValue 模式 + 索引器
foreach (var w in words)
    counts[w] = counts.GetValueOrDefault(w) + 1;

foreach (var kv in counts)
    Console.WriteLine($"{kv.Key}: {kv.Value}");
// apple: 3, banana: 2, cherry: 1
\`\`\`

\`GetValueOrDefault\` 是 .NET Core 引入的便捷方法，不存在时返回默认值（不抛异常）。

#### 场景 3：配置映射

\`\`\`csharp
var config = new Dictionary<string, object>
{
    ["host"] = "localhost",
    ["port"] = 8080,
    ["debug"] = true
};

string host = (string)config["host"];
int port = (int)config["port"];
\`\`\`

### 九、实战 demo：单词频率统计

\`\`\`csharp
string text = "the quick brown fox the lazy dog the fox runs";

var freq = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
foreach (var word in text.Split(' '))
{
    freq[word] = freq.GetValueOrDefault(word) + 1;
}

// 按频率降序输出
foreach (var kv in freq.OrderByDescending(kv => kv.Value))
    Console.WriteLine($"{kv.Key}: {kv.Value}");

// 输出：
// the: 3
// fox: 2
// quick: 1
// brown: 1
// ...
\`\`\`

\`OrderByDescending\` 是 LINQ 方法，这里用来对字典按值排序。

### 十、并发场景：ConcurrentDictionary

多线程下 \`Dictionary\` 不安全，要用 \`ConcurrentDictionary\`：

\`\`\`csharp
var cd = new System.Collections.Concurrent.ConcurrentDictionary<string, int>();

// 原子的 GetOrAdd
cd.GetOrAdd("a", _ => ExpensiveCompute("a"));

// 原子的 AddOrUpdate
cd.AddOrUpdate("a", 1, (_, old) => old + 1);
\`\`\`

并发主题在后续"异步与并发"部分详讲。

### 十一、小结

- \`Dictionary<K,V>\` 按键查找 O(1)，是缓存 / 计数 / 配置映射的首选。
- 增改用索引器 \`dict[key] = value\`，删用 \`Remove\`。
- 安全访问用 \`TryGetValue\`，避免 \`KeyNotFoundException\`。
- 键必须重写 \`Equals\` / \`GetHashCode\` 且不可变——首选 \`record\`。
- 字符串做键可传 \`StringComparer.OrdinalIgnoreCase\` 处理大小写。
- 多线程用 \`ConcurrentDictionary\`。
- 计数场景用 \`GetValueOrDefault\` + 索引器最简洁。
`,
  },

  // ============================================================
  // 第二十四章：HashSet / Queue / Stack / LinkedList
  // ============================================================
  {
    id: 'csharp2-ch24',
    group: '第五部分 泛型与集合',
    icon: '📚',
    title: 'HashSet / Queue / Stack / LinkedList',
    content: `## 第二十四章　HashSet / Queue / Stack / LinkedList

除了 \`List<T>\` 和 \`Dictionary<K,V>\`，BCL 还提供了若干专用集合。本章挑最常用的 4 个讲透。

### 一、HashSet<T>：去重与集合运算

\`HashSet<T>\` 是基于哈希的集合，**不存重复元素**，查找 / 增删都是 O(1)。

#### 创建与基本操作

\`\`\`csharp
var set = new HashSet<int> { 1, 2, 3 };

set.Add(2);  // 已存在，添加失败但不报错，返回 false
set.Add(4);  // 添加成功，返回 true
Console.WriteLine(set.Count);  // 4

Console.WriteLine(set.Contains(3));  // True
set.Remove(2);
\`\`\`

#### 集合运算（核心能力）

\`\`\`csharp
var a = new HashSet<int> { 1, 2, 3, 4 };
var b = new HashSet<int> { 3, 4, 5, 6 };

// 1. 并集：a ∪ b（修改 a 本身）
var union = new HashSet<int>(a);
union.UnionWith(b);
Console.WriteLine(string.Join(",", union));  // 1,2,3,4,5,6

// 2. 交集：a ∩ b
var inter = new HashSet<int>(a);
inter.IntersectWith(b);
Console.WriteLine(string.Join(",", inter));  // 3,4

// 3. 差集：a - b
var except = new HashSet<int>(a);
except.ExceptWith(b);
Console.WriteLine(string.Join(",", except));  // 1,2

// 4. 对称差：a △ b（只在一个集合里的）
var sym = new HashSet<int>(a);
sym.SymmetricExceptWith(b);
Console.WriteLine(string.Join(",", sym));  // 1,2,5,6

// 5. 判断关系
Console.WriteLine(a.IsSubsetOf(union));     // True
Console.WriteLine(inter.IsSupersetOf(a));   // False
Console.WriteLine(a.Overlaps(b));           // True（有交集）
\`\`\`

**注意：** 所有 \`XxxWith\` 方法都是**就地修改**当前集合。要保留原集合，先 \`new HashSet<T>(a)\` 复制一份。

#### 典型用途：去重

\`\`\`csharp
var nums = new[] { 1, 2, 2, 3, 3, 3, 4 };
var unique = new HashSet<int>(nums);
Console.WriteLine(string.Join(",", unique));  // 1,2,3,4

// 一行去重
var distinct = new HashSet<string>(File.ReadAllLines("log.txt"));
\`\`\`

### 二、Queue<T>：先进先出

\`Queue<T>\` 是 FIFO（First In First Out）队列，常用于任务调度、消息处理。

\`\`\`csharp
var queue = new Queue<string>();

// 入队
queue.Enqueue("task1");
queue.Enqueue("task2");
queue.Enqueue("task3");

// 出队（FIFO）
Console.WriteLine(queue.Dequeue());  // task1
Console.WriteLine(queue.Dequeue());  // task2

// 看队首但不取出
Console.WriteLine(queue.Peek());  // task3

// 其他
Console.WriteLine(queue.Count);   // 1
Console.WriteLine(queue.Contains("task3"));  // True

// 遍历（不消费）
queue.Enqueue("a");
queue.Enqueue("b");
foreach (var item in queue) Console.WriteLine(item);  // task3, a, b
\`\`\`

#### 遍历顺序

\`Queue\` 遍历是**入队顺序**（FIFO），与出队顺序一致。

#### PriorityQueue<TElement, TPriority>（.NET 6+）

带优先级的队列，优先级小的先出：

\`\`\`csharp
var pq = new PriorityQueue<string, int>();
pq.Enqueue("普通", 5);
pq.Enqueue("紧急", 1);
pq.Enqueue("高", 3);

Console.WriteLine(pq.Dequeue());  // 紧急（优先级 1）
Console.WriteLine(pq.Dequeue());  // 高（优先级 3）
Console.WriteLine(pq.Dequeue());  // 普通（优先级 5）
\`\`\`

\`PriorityQueue\` 内部用最小堆实现，出队 O(log n)。

### 三、Stack<T>：后进先出

\`Stack<T>\` 是 LIFO（Last In First Out）栈，常用于撤销 / 重做、表达式求值、DFS。

\`\`\`csharp
var stack = new Stack<int>();

// 入栈
stack.Push(1);
stack.Push(2);
stack.Push(3);

// 出栈（LIFO）
Console.WriteLine(stack.Pop());  // 3
Console.WriteLine(stack.Peek());  // 2（看但不取）

// 其他
Console.WriteLine(stack.Count);  // 2
Console.WriteLine(stack.Contains(1));  // True

// 遍历（LIFO 顺序）
stack.Push(4);
stack.Push(5);
foreach (var item in stack) Console.WriteLine(item);  // 5, 4, 2, 1
\`\`\`

#### 经典应用：括号匹配

\`\`\`csharp
bool IsValid(string s)
{
    var stack = new Stack<char>();
    var pairs = new Dictionary<char, char> { [')'] = '(', [']'] = '[', ['}'] = '{' };
    foreach (var c in s)
    {
        if (c == '(' || c == '[' || c == '{') stack.Push(c);
        else if (pairs.TryGetValue(c, out var open))
        {
            if (stack.Count == 0 || stack.Pop() != open) return false;
        }
    }
    return stack.Count == 0;
}

Console.WriteLine(IsValid("([{}])"));  // True
Console.WriteLine(IsValid("([)]"));    // False
\`\`\`

### 四、LinkedList<T>：双向链表

\`LinkedList<T>\` 是双向链表，每个节点存前后指针。**适合频繁在中间插入 / 删除**，但随机访问 O(n)。

\`\`\`csharp
var linked = new LinkedList<string>();
linked.AddLast("a");
linked.AddLast("b");
linked.AddLast("c");

// 在节点前 / 后插入
var nodeB = linked.Find("b");
linked.AddBefore(nodeB!, "ab");
linked.AddAfter(nodeB!, "bc");

// 遍历
foreach (var item in linked) Console.WriteLine(item);
// a, ab, b, bc, c

// 删除
linked.Remove("ab");
linked.Remove(linked.First);  // 删头节点
\`\`\`

注意 \`LinkedList<T>\` 没有 \`this[index]\`——\`linked[2]\` 编译错误。要按索引访问得自己遍历。

#### List<T> vs LinkedList<T>

| 操作 | List<T> | LinkedList<T> |
|------|---------|---------------|
| 索引访问 \`list[i]\` | O(1) | O(n) |
| 末尾 \`Add\` | O(1) 均摊 | O(1) |
| 头部插入 | O(n) | O(1) |
| 中间插入（已知节点） | O(n) | O(1) |
| 内存开销 | 小（数组） | 大（每节点 2 指针） |

**经验：** 90% 的场景用 \`List<T>\` 就够。只有"频繁在头部或中间插入删除"且对 O(n) 移动敏感时，才考虑 \`LinkedList\`。

### 五、SortedSet<T> 与 SortedList<K,V> 简介

#### SortedSet<T>：自动排序的集合

\`\`\`csharp
var sset = new SortedSet<int> { 5, 1, 3, 2, 4 };
foreach (var x in sset) Console.Write(x + " ");  // 1 2 3 4 5（自动有序）

// 集合运算（结果也保持有序）
sset.Add(3);  // 已存在，不加
Console.WriteLine(sset.Min);  // 1
Console.WriteLine(sset.Max);  // 5
\`\`\`

内部用红黑树，增删查都是 O(log n)。

#### SortedList<K,V> 和 SortedDictionary<K,V>

两者都按 key 排序，区别在内部实现：

| 类型 | 内部 | 查找 | 增删 |
|------|------|------|------|
| \`SortedList<K,V>\` | 两个排序数组 | O(log n)（二分） | O(n)（要移动） |
| \`SortedDictionary<K,V>\` | 红黑树 | O(log n) | O(log n) |

**选择：** 数据基本不变但要频繁查找 → \`SortedList\`；频繁增删 → \`SortedDictionary\`。

\`\`\`csharp
var sl = new SortedList<string, int>
{
    ["banana"] = 2,
    ["apple"] = 1,
    ["cherry"] = 3
};

foreach (var kv in sl)
    Console.WriteLine($"{kv.Key} = {kv.Value}");
// apple, banana, cherry（按键排序）
\`\`\`

### 六、实战 demo：任务调度器

\`\`\`csharp
// 模拟任务队列：紧急任务插队，普通任务 FIFO
var urgent = new PriorityQueue<string, int>();
var normal = new Queue<string>();

void AddTask(string name, bool isUrgent)
{
    if (isUrgent) urgent.Enqueue(name, 0);
    else normal.Enqueue(name);
}

void RunNext()
{
    if (urgent.Count > 0)
        Console.WriteLine($"[紧急] 执行：{urgent.Dequeue()}");
    else if (normal.Count > 0)
        Console.WriteLine($"[普通] 执行：{normal.Dequeue()}");
    else
        Console.WriteLine("无任务");
}

AddTask("清理日志", false);
AddTask("修复Bug#1", true);  // 紧急
AddTask("写文档", false);
AddTask("修复Bug#2", true);  // 紧急

RunNext();  // [紧急] 修复Bug#1
RunNext();  // [紧急] 修复Bug#2
RunNext();  // [普通] 清理日志
RunNext();  // [普通] 写文档
\`\`\`

### 七、实战 demo：用 HashSet 做权限校验

\`\`\`csharp
var adminPerms = new HashSet<string> { "read", "write", "delete", "manage" };
var userPerms = new HashSet<string> { "read", "write" };

bool CanDo(HashSet<string> userHas, string action) => userHas.Contains(action);

Console.WriteLine(CanDo(userPerms, "read"));    // True
Console.WriteLine(CanDo(userPerms, "delete"));  // False

// 提升权限：合并
userPerms.UnionWith(new[] { "delete" });
Console.WriteLine(CanDo(userPerms, "delete"));  // True

// 求交集：共同拥有的权限
var common = new HashSet<string>(adminPerms);
common.IntersectWith(userPerms);
Console.WriteLine($"共同权限：{string.Join(",", common)}");  // read,write,delete
\`\`\`

### 八、小结

- \`HashSet<T>\` 去重 + 集合运算（并 / 交 / 差 / 对称差），所有 \`XxxWith\` 方法就地修改。
- \`Queue<T>\` FIFO，\`Enqueue\` / \`Dequeue\`；带优先级用 \`PriorityQueue\`（.NET 6+）。
- \`Stack<T>\` LIFO，\`Push\` / \`Pop\`；典型应用括号匹配、DFS。
- \`LinkedList<T>\` 双向链表，头部 / 中间插入 O(1)，但无索引访问——只在特定场景用。
- \`SortedSet\` / \`SortedList\` / \`SortedDictionary\` 自动排序，按场景选实现。
- 选集合看：访问模式（索引 / 键 / FIFO / LIFO）、是否去重、是否需要有序。
`,
  },

  // ============================================================
  // 第二十五章：IEnumerable 与迭代器
  // ============================================================
  {
    id: 'csharp2-ch25',
    group: '第五部分 泛型与集合',
    icon: '🔄',
    title: 'IEnumerable 与迭代器',
    content: `## 第二十五章　IEnumerable 与迭代器

### 一、IEnumerable 接口

\`IEnumerable<T>\` 是 .NET 集合世界的"最小公约数"——所有可被 \`foreach\` 遍历的类型都实现它。

\`\`\`csharp
// IEnumerable<T> 的核心定义（简化版）
public interface IEnumerable<out T> : IEnumerable
{
    IEnumerator<T> GetEnumerator();
}

public interface IEnumerator<out T> : IDisposable, IEnumerator
{
    T Current { get; }
    bool MoveNext();
    void Reset();
}
\`\`\`

注意 \`out T\`——\`IEnumerable<T>\` 的 \`T\` 是协变的，所以 \`IEnumerable<string>\` 可以赋给 \`IEnumerable<object>\`。

### 二、foreach 的本质

\`\`\`foreach\` 是语法糖，编译器会展开成调用 \`GetEnumerator\` + \`MoveNext\` + \`Current\` 的循环：

\`\`\`csharp
// 你写的
foreach (var x in list)
    Console.WriteLine(x);

// 编译器展开的（简化版）
using var enumerator = list.GetEnumerator();
while (enumerator.MoveNext())
{
    var x = enumerator.Current;
    Console.WriteLine(x);
}
\`\`\`

理解这一点很重要——下面要讲的 \`yield return\` 就是利用这个机制。

### 三、迭代器：yield return

\`yield return\` 让你**不用手写 IEnumerator**，编译器自动生成状态机：

#### demo 1：生成自然数序列

\`\`\`csharp
IEnumerable<int> Naturals()
{
    int n = 0;
    while (true)
    {
        n++;
        yield return n;  // 每次迭代返回一个值
    }
}

// 用 Take 取前 5 个（无限序列也能用）
foreach (var n in Naturals().Take(5))
    Console.WriteLine(n);  // 1 2 3 4 5
\`\`\`

#### demo 2：自定义遍历逻辑

\`\`\`csharp
IEnumerable<int> Evens(IEnumerable<int> source)
{
    foreach (var n in source)
    {
        if (n % 2 == 0)
            yield return n;  // 只返回偶数
    }
}

var nums = new[] { 1, 2, 3, 4, 5, 6 };
foreach (var e in Evens(nums))
    Console.WriteLine(e);  // 2 4 6
\`\`\`

#### yield break：提前结束

\`\`\`csharp
IEnumerable<int> TakeUntilNegative(IEnumerable<int> source)
{
    foreach (var n in source)
    {
        if (n < 0) yield break;  // 遇到负数就停止
        yield return n;
    }
}

var data = new[] { 1, 2, 3, -1, 4, 5 };
foreach (var x in TakeUntilNegative(data))
    Console.WriteLine(x);  // 1 2 3
\`\`\`

### 四、延迟执行（核心特性）

\`yield return\` 产生的迭代器是**延迟执行**的——直到你真正开始遍历，方法体才会运行：

\`\`\`csharp
IEnumerable<int> BuildWithLog()
{
    Console.WriteLine("开始构建");
    yield return 1;
    Console.WriteLine("产生 1 后");
    yield return 2;
    Console.WriteLine("产生 2 后");
    yield return 3;
}

Console.WriteLine("--- 调用方法 ---");
var seq = BuildWithLog();  // 注意：方法体没执行！
Console.WriteLine("--- 开始遍历 ---");
foreach (var x in seq)
    Console.WriteLine($"  收到 {x}");

// 输出：
// --- 调用方法 ---
// --- 开始遍历 ---
// 开始构建
//   收到 1
// 产生 1 后
//   收到 2
// 产生 2 后
//   收到 3
\`\`\`

**关键理解：** 调用 \`BuildWithLog()\` 只是创建了一个"迭代器对象"，方法体一句都没执行。每次 \`MoveNext\` 才执行到下一个 \`yield return\`。

#### 陷阱：延迟执行可能多次执行

\`\`\`csharp
IEnumerable<int> GetRandom(int count)
{
    var rng = new Random();
    for (int i = 0; i < count; i++)
        yield return rng.Next(100);
}

var seq = GetRandom(3);

// 第一次遍历
Console.WriteLine(string.Join(",", seq));  // 比如 42,17,83

// 第二次遍历——重新执行！结果不同
Console.WriteLine(string.Join(",", seq));  // 比如 5,91,28
\`\`\`

如果不想重复执行，用 \`ToList()\` / \`ToArray()\` 物化：

\`\`\`csharp
var materialized = GetRandom(3).ToList();
Console.WriteLine(string.Join(",", materialized));  // 固定
Console.WriteLine(string.Join(",", materialized));  // 同上
\`\`\`

### 五、自定义可迭代类

让一个类实现 \`IEnumerable<T>\`，就能用 \`foreach\`：

\`\`\`csharp
public class Range : IEnumerable<int>
{
    private readonly int _start, _end;

    public Range(int start, int end)
    {
        _start = start;
        _end = end;
    }

    // 用 yield return 实现迭代器
    public IEnumerator<int> GetEnumerator()
    {
        for (int i = _start; i <= _end; i++)
            yield return i;
    }

    // 显式实现非泛型版本（通常这样写）
    System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator()
        => GetEnumerator();
}

// 使用
var r = new Range(1, 5);
foreach (var x in r) Console.WriteLine(x);  // 1 2 3 4 5

// 也能传给 LINQ
Console.WriteLine(r.Sum());  // 15
Console.WriteLine(r.Average());  // 3
\`\`\`

C# 8+ 还可以用迭代器方法返回 \`IEnumerable\`，不需要写完整接口实现——更简洁。

### 六、IEnumerable vs IList：参数选哪个

写方法参数时，**优先选最通用的 \`IEnumerable<T>\`**：

\`\`\`csharp
// 差：限定 List<T>，调用方必须传 List
public int Sum(List<int> nums) { ... }

// 差：限定 int[]，调用方必须传数组
public int Sum(int[] nums) { ... }

// 好：IEnumerable<int>，数组、List、HashSet、LINQ 结果都能传
public int Sum(IEnumerable<int> nums) { ... }
\`\`\`

#### 何时用更具体的类型？

| 类型 | 何时作为参数 |
|------|------------|
| \`IEnumerable<T>\` | 只需要遍历（默认选这个） |
| \`IReadOnlyList<T>\` | 需要按索引访问且不修改 |
| \`IList<T>\` | 需要按索引访问且会修改 |
| \`List<T>\` | 几乎不用作参数（用接口替代） |
| \`ICollection<T>\` | 需要 Count / Add / Remove 但不需要索引 |

\`\`\`csharp
// 需要索引但不能修改
public int GetMiddle(IReadOnlyList<int> items)
    => items[items.Count / 2];

// 调用方：数组和 List 都能传
Console.WriteLine(GetMiddle(new[] { 1, 2, 3 }));     // 2
Console.WriteLine(GetMiddle(new List<int> { 1, 2, 3, 4 }));  // 3（取索引 2）
\`\`\`

### 七、迭代器方法 vs 物化方法

**延迟执行的方法**（返回 IEnumerable / IQueryable）：

- LINQ 的 \`Where\` / \`Select\` / \`OrderBy\` / \`Take\` 等
- 自己用 \`yield return\` 写的方法
- \`Enumerable.Range\` / \`Enumerable.Repeat\`

**立即执行的方法**（强制求值）：

- \`ToList()\` / \`ToArray()\` / \`ToDictionary()\` / \`ToHashSet()\`
- \`Count()\` / \`Sum()\` / \`Average()\` / \`First()\` / \`Any()\` / \`All()\`
- \`foreach\` 遍历

\`\`\`csharp
var nums = new[] { 1, 2, 3, 4, 5 };

// 延迟：构建查询，不执行
var query = nums
    .Where(n => { Console.WriteLine($"filter {n}"); return n > 2; })
    .Select(n => { Console.WriteLine($"select {n}"); return n * 10; });

Console.WriteLine("--- 开始遍历 ---");
foreach (var x in query)
    Console.WriteLine($"  result {x}");

// 输出顺序很有意思：filter 1 → filter 2 → filter 3 → select 3 → result 30 → filter 4 → select 4 → ...
\`\`\`

这种"流水线"式的执行是 LINQ 高效的根源——一次遍历同时完成 filter + select，不需要中间集合。

### 八、实战 demo：分页迭代器

\`\`\`csharp
// 模拟从数据库分页读取
IEnumerable<User> LoadUsersPaged(int pageSize)
{
    int page = 0;
    while (true)
    {
        Console.WriteLine($"  [DB] 加载第 {page + 1} 页");
        var batch = LoadFromDb(page, pageSize);  // 假装查 DB
        if (batch.Count == 0) yield break;
        foreach (var u in batch) yield return u;
        page++;
    }
}

List<User> LoadFromDb(int page, int size)
{
    // 模拟：第 3 页之后没数据
    if (page >= 3) return new List<User>();
    return Enumerable.Range(page * size, size)
                     .Select(i => new User(i + 1, $"user{i + 1}"))
                     .ToList();
}

// 使用：只取前 5 个，DB 只查了 1 次
foreach (var u in LoadUsersPaged(pageSize: 3).Take(5))
    Console.WriteLine($"#{u.Id} {u.Name}");

public record User(int Id, string Name);
\`\`\`

延迟执行的威力：虽然 \`LoadUsersPaged\` 是"无限"循环，但 \`Take(5)\` 让它查完 1 页（3 条）不够，再查 1 页（共 6 条）拿到 5 条后就停止——只查了 2 次数据库，没有把所有数据全捞出来。

### 九、实战 demo：斐波那契数列

\`\`\`csharp
IEnumerable<int> Fibonacci()
{
    int a = 0, b = 1;
    while (true)
    {
        yield return b;
        (a, b) = (b, a + b);  // C# 7+ 元组解构赋值
    }
}

// 前 10 个斐波那契数
foreach (var f in Fibonacci().Take(10))
    Console.Write(f + " ");
// 1 1 2 3 5 8 13 21 34 55
\`\`\`

无限序列 + \`Take\`，优雅得像数学定义。

### 十、小结

- \`IEnumerable<T>\` 是集合的最小公约数，所有 \`foreach\` 都靠它。
- \`foreach\` 是 \`GetEnumerator\` + \`MoveNext\` + \`Current\` 的语法糖。
- \`yield return\` 让你写迭代器不用手写状态机，且天然支持无限序列。
- **延迟执行**是核心特性：调用方法不立即执行，遍历才执行；多次遍历会多次执行。
- 不想重复执行就 \`ToList()\` / \`ToArray()\` 物化。
- 方法参数优先选 \`IEnumerable<T>\`，需要索引选 \`IReadOnlyList<T>\`。
- LINQ 的 \`Where\` / \`Select\` 等是延迟执行，\`ToList\` / \`Count\` 等是立即执行。
`,
  },

  // ============================================================
  // 第二十六章：元组与 ValueTuple
  // ============================================================
  {
    id: 'csharp2-ch26',
    group: '第五部分 泛型与集合',
    icon: '🎁',
    title: '元组与 ValueTuple',
    content: `## 第二十六章　元组与 ValueTuple

### 一、元组解决什么问题

方法只能返回一个值，但有时你想返回多个——比如 \`TryParse\` 返回 \`bool\` 表示成功，还要带出解析结果。元组就是"把多个值打包"的轻量方案。

C# 有两套元组：

- **Tuple<T1, T2, ...>**（旧，.NET 4）：引用类型，用 \`Item1\` / \`Item2\` 访问，笨重。
- **ValueTuple**（新，C# 7+）：值类型，\`(\` ... \`)\` 语法，可命名，性能好——**新代码一律用这个**。

### 二、Tuple 类（旧，了解即可）

\`\`\`csharp
// 引用类型元组，用 Tuple.Create
var t = Tuple.Create(1, "hello", 3.14);
Console.WriteLine(t.Item1);  // 1
Console.WriteLine(t.Item2);  // hello
Console.WriteLine(t.Item3);  // 3.14

// 缺点：Item1/Item2 无语义、引用类型有装箱开销、不可变
// 现代 C# 不推荐用，了解即可
\`\`\`

### 三、ValueTuple 值元组：( 语法

C# 7+ 引入的 \`(\` \`)\` 语法是 \`ValueTuple\` 的语法糖：

\`\`\`csharp
// 直接构造
(int, string) t1 = (1, "hello");
Console.WriteLine(t1.Item1);  // 1
Console.WriteLine(t1.Item2);  // hello

// 用 var 推断
var t2 = (42, "world", 3.14);
Console.WriteLine(t2.Item3);  // 3.14

// 两个值
var point = (3, 4);
Console.WriteLine($"({point.Item1}, {point.Item2})");
\`\`\`

底层是 \`ValueTuple<int, string>\` 结构体——**值类型**，分配在栈上（不逃逸时），无 GC 压力。

### 四、命名元组

\`Item1\` / \`Item2\` 没语义，可以给字段命名：

\`\`\`csharp
// 声明时命名
(int X, int Y) p1 = (3, 4);
Console.WriteLine(p1.X);  // 3
Console.WriteLine(p1.Y);  // 4

// 用 var + 右侧命名（name: 语法）
var p2 = (X: 3, Y: 4);
Console.WriteLine(p2.X);  // 3

// 混合命名
var mixed = (Id: 1, "Alice", Age: 30);
Console.WriteLine(mixed.Id);     // 1
Console.WriteLine(mixed.Item2);  // Alice（没命名的还是 Item2）
Console.WriteLine(mixed.Age);    // 30
\`\`\`

注意：命名的字段名只在编译期存在，运行时仍是 \`Item1\` / \`Item2\`（通过 \`ToString\` 能看到）。所以命名不影响性能，只影响可读性。

### 五、元组解构

把元组"拆开"赋给多个变量：

\`\`\`csharp
var t = (Name: "Alice", Age: 30);

// 解构
(string name, int age) = t;
Console.WriteLine($"{name}, {age}");

// 用 var
var (name2, age2) = t;
Console.WriteLine($"{name2}, {age2}");

// 跳过某些值：弃元 _
var (_, age3) = t;
Console.WriteLine($"age = {age3}");
\`\`\`

### 六、元组作返回值（多返回值）

这是元组最常见的用法——方法返回多个值，不需要专门定义 class / record：

\`\`\`csharp
// 返回最小值和最大值
(int Min, int Max) FindMinMax(int[] nums)
{
    if (nums.Length == 0) throw new ArgumentException("empty");
    int min = nums[0], max = nums[0];
    foreach (var n in nums)
    {
        if (n < min) min = n;
        if (n > max) max = n;
    }
    return (min, max);  // 命名元组
}

// 调用
var result = FindMinMax(new[] { 3, 1, 4, 1, 5, 9, 2, 6 });
Console.WriteLine($"Min={result.Min}, Max={result.Max}");  // Min=1, Max=9

// 解构调用
var (min, max) = FindMinMax(new[] { 7, 2, 8 });
Console.WriteLine($"{min} ~ {max}");  // 2 ~ 8
\`\`\`

对比 \`TryParse\` 的旧设计（需要 \`out\` 参数）：

\`\`\`csharp
// 旧风格：out 参数
bool ok = int.TryParse("123", out int n);

// 元组风格：更优雅
(bool Ok, int Value) TryParseInt(string s)
{
    if (int.TryParse(s, out var n)) return (true, n);
    return (false, 0);
}

var (ok2, n2) = TryParseInt("123");
if (ok2) Console.WriteLine(n2);
\`\`\`

元组风格比 \`out\` 更易链式调用、更易做异步（\`out\` 不能用于 \`async\` 方法）。

### 七、元组作字典键

元组天然适合做复合键：

\`\`\`csharp
// 用 (userId, deviceId) 作键
var sessions = new Dictionary<(int userId, string deviceId), DateTime>
{
    [(1, "mobile")] = DateTime.Now,
    [(1, "web")] = DateTime.Now.AddMinutes(-5),
    [(2, "mobile")] = DateTime.Now.AddHours(-1)
};

// 查询
if (sessions.TryGetValue((1, "web"), out var lastSeen))
    Console.WriteLine($"用户 1 的 web 最后在线：{lastSeen}");
\`\`\`

\`ValueTuple\` 自动实现了 \`Equals\` / \`GetHashCode\`（基于所有字段），所以可以直接做字典键——比自定义 \`record\` 更轻。

#### 对比：用字符串拼接做键（反模式）

\`\`\`csharp
// 差：拼接字符串，容易碰撞、性能差
var bad = new Dictionary<string, DateTime>();
bad["1|web"] = DateTime.Now;
bad["1|mobile"] = DateTime.Now;

// 好：元组键
var good = new Dictionary<(int, string), DateTime>();
good[(1, "web")] = DateTime.Now;
\`\`\`

### 八、弃元 _

\`_\` 是弃元占位符，表示"这个值我不关心"：

\`\`\`csharp
var (name, _) = ("Alice", 30);  // 只要 name

// 多次弃元
var (_, _, c) = (1, 2, 3);  // 只要第三个

// 调用方法时弃掉不用的返回
_ = SomeMethodThatReturnsIntButICareOnlyAboutSideEffect();

// 风格统一：_ 是合法的变量名，但作为弃元时编译器特殊处理（不会警告未使用）
\`\`\`

注意：\`_\` 在不同上下文含义略有不同——作为元组解构的弃元时，可以重复使用 \`_\` 表示多个弃元；作为独立赋值目标时，每次都是新的弃元。

### 九、元组比较

元组重载了 \`==\` 和 \`!=\`（C# 7.3+），按值比较：

\`\`\`csharp
var a = (1, "hello");
var b = (1, "hello");
var c = (1, "world");

Console.WriteLine(a == b);  // True
Console.WriteLine(a == c);  // False
Console.WriteLine(a != c);  // True

// 嵌套元组也能比较
var x = ((1, 2), "a");
var y = ((1, 2), "a");
Console.WriteLine(x == y);  // True
\`\`\`

### 十、元组与 LINQ

LINQ 中元组常用于临时投影：

\`\`\`csharp
var people = new[]
{
    new { Name = "Alice", Age = 30 },
    new { Name = "Bob", Age = 25 },
    new { Name = "Charlie", Age = 35 }
};

// 投影成元组（比匿名类型更通用，能跨方法传递）
var tuples = people.Select(p => (p.Name, p.Age)).ToList();
foreach (var t in tuples)
    Console.WriteLine($"{t.Name}: {t.Age}");

// 用元组做多字段排序
var sorted = people
    .OrderBy(p => (p.Age, p.Name))  // 先按 Age，再按 Name
    .ToList();
\`\`\`

### 十一、何时用元组 vs record vs class

| 方案 | 适用 |
|------|------|
| \`ValueTuple\` | 方法内 / 临时 / 短生命周期的多值组合，特别是返回值 |
| \`record\` | 跨方法的领域模型，需要语义清晰的类型 |
| \`class\` | 可变、有行为、需要继承的复杂对象 |

**经验：** 元组是"快速临时打包"，record 是"正式的数据类型"。一旦元组开始到处传递、字段超过 4-5 个，就升级成 record。

### 十二、实战 demo：统计结果

\`\`\`csharp
// 返回一组数字的统计信息
(decimal Mean, decimal Median, int Range) Analyze(IEnumerable<int> nums)
{
    var list = nums.ToList();
    if (list.Count == 0) throw new ArgumentException("empty");

    var sorted = list.OrderBy(x => x).ToList();
    decimal mean = (decimal)list.Sum() / list.Count;
    decimal median = list.Count % 2 == 0
        ? (sorted[list.Count / 2 - 1] + sorted[list.Count / 2]) / 2m
        : sorted[list.Count / 2];
    int range = sorted.Max() - sorted.Min();

    return (mean, median, range);
}

var (mean, median, range) = Analyze(new[] { 1, 2, 3, 4, 5, 6, 7 });
Console.WriteLine($"均值={mean:F2}, 中位数={median}, 极差={range}");
// 均值=4.00, 中位数=4, 极差=6
\`\`\`

### 十三、实战 demo：双字典反向查找

\`\`\`csharp
// 用元组做复合键：找"用户 + 日期"对应的访问数
var visits = new Dictionary<(int UserId, DateOnly Date), int>
{
    [(1, new DateOnly(2026, 1, 1))] = 5,
    [(1, new DateOnly(2026, 1, 2))] = 8,
    [(2, new DateOnly(2026, 1, 1))] = 3,
};

// 查询
var key = (1, new DateOnly(2026, 1, 2));
if (visits.TryGetValue(key, out var count))
    Console.WriteLine($"用户 {key.UserId} 在 {key.Date} 访问 {count} 次");

// 按用户聚合（用 LINQ）
var byUser = visits
    .GroupBy(kv => kv.Key.UserId)
    .Select(g => (UserId: g.Key, Total: g.Sum(kv => kv.Value)))
    .ToList();

foreach (var (userId, total) in byUser)
    Console.WriteLine($"用户 {userId} 总访问 {total} 次");
\`\`\`

### 十四、小结

- 元组是"多值打包"的轻量方案；新代码一律用 \`ValueTuple\`（\`(T1, T2)\` 语法），不要用旧的 \`Tuple\` 类。
- 字段命名提升可读性：\`(int X, int Y) p = (3, 4);\`，运行时仍是 \`Item1\` / \`Item2\`。
- 解构 \`var (a, b) = t;\` 是元组的优雅用法；弃元 \`_\` 跳过不需要的值。
- **元组作方法返回值**是最常见用法，比 \`out\` 参数更易链式 / 异步。
- **元组作字典键**适合复合键，自动 \`Equals\` / \`GetHashCode\`，比字符串拼接安全。
- 元组比较按值（C# 7.3+），嵌套也行。
- 字段超过 4-5 个或开始跨方法传递时，升级成 \`record\`。
`,
  },
];

export { chapters };
