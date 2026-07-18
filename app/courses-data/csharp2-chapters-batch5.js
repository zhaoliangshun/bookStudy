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
list.Add(1);        // int 装箱成 object（值类型→引用类型，产生堆分配）
list.Add("hello");  // string 本身就是引用类型，直接存
list.Add(3.14);

// 取出时必须强制转换，且容易写错类型
int n = (int)list[0];   // OK
int bad = (int)list[1]; // 运行时抛 InvalidCastException——编译器无法提前发现
\`\`\`

\`ArrayList\` 有三大痛点：

1. **类型不安全**：编译器无法阻止你混装不同类型，错误延迟到运行时才爆炸。
2. **装箱拆箱开销**：值类型（int、double、struct）存入 \`object\` 要装箱（复制到堆），取出要拆箱（复制回栈），产生大量 GC 压力。
3. **代码可读性差**：\`(int)list[0]\` 这种强转让人看不出容器里到底存的是什么类型。

**为什么用泛型不用 object？**
- 泛型在编译期就确定了类型 T，不需要装箱拆箱（值类型直接存，性能提升数倍）
- 编译期类型检查，类型不匹配直接编译错误，不会等到运行时才崩溃
- 代码更清晰：\`List<int>\` 一看就知道存的是整数

泛型（.NET 2.0 引入）正是为解决这些问题而生：**把类型当参数**，写一次代码，多种类型复用，且编译期就知道类型。

### 二、泛型类定义

泛型类用 \`<T>\` 声明类型参数，\`T\` 是约定俗成的占位名（可任意命名，如 TItem、TEntity）：

\`\`\`csharp
// 使用时把 T 替换成具体类型——这是可执行代码，放前面（顶级语句规则：执行代码在前，类型声明在后）
var intBox = new Box<int>(42);
var strBox = new Box<string>("hello");
intBox.Show();   // Box contains: 42
strBox.Show();   // Box contains: hello

// 为什么类型声明要放后面？
// C# 顶级语句编译后是 Program.Main() 方法，类型声明是 Program 的嵌套类。
// 嵌套类的定义顺序不影响 C# 编译器解析（多遍扫描），但 CS8803 要求：
//   1) using 指令  2) 可执行代码  3) 类型声明（class/record/struct 等）
// 这样编译器才能正确生成 Main 方法和嵌套类型。

// 一个最简单的泛型容器——类型声明放最后（CS8803 要求）
public class Box<T>
{
    public T Value { get; set; }

    public Box(T value) => Value = value;

    public void Show() => Console.WriteLine(\$"Box contains: {Value}");
}
\`\`\`

#### 多个类型参数

\`\`\`csharp
// 可执行代码在前
var p = new Pair<string, int>("age", 30);
Console.WriteLine(\$"{p.Key} = {p.Value}");  // age = 30

// Dictionary<TKey, TValue> 本质上就是一个有两个类型参数的泛型类，
// .NET BCL 内置，日常开发用得最多的泛型之一。

// 类型声明在后
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
\`\`\`

### 三、泛型方法

方法也可以单独泛型——不必让整个类泛型化。在顶级语句中，方法就是局部函数（不需要 public static 修饰符）：

\`\`\`csharp
// 调用泛型方法——可执行代码在前
Helper.Print(42);           // Type: System.Int32, Value: 42
Helper.Print("hello");      // Type: System.String, Value: hello
Helper.Print<double>(3.14); // 显式指定类型参数（当编译器无法推断时需要）

// 局部函数不需要访问修饰符，直接写即可
// T 是方法级类型参数，调用时由实参推断确定
public static class Helper
{
    public static void Print<T>(T item)
    {
        Console.WriteLine(\$"Type: {typeof(T)}, Value: {item}");
    }
}
\`\`\`

等等，上面的 Helper 是静态类。在顶级语句中，如果要定义带静态方法的工具类，需要把类声明（类型声明）放在最后。让我修正：

\`\`\`csharp
// 可执行代码在前
Helper.Print(42);
Helper.Print("hello");
Helper.Print<double>(3.14);

// 类型声明在后（静态类包含泛型方法）
public static class Helper
{
    // T 是方法级类型参数，调用时确定
    public static void Print<T>(T item)
    {
        Console.WriteLine(\$"Type: {typeof(T)}, Value: {item}");
    }
}
\`\`\`

### 四、泛型 vs object：性能对比

来看一段直观的对比——分别用 \`ArrayList\`（object）和 \`List<int>\`（泛型）存 100 万个整数：

\`\`\`csharp
using System.Diagnostics;
using System.Collections.Generic; // List<T> 所在命名空间

var sw = Stopwatch.StartNew();

// object 方式：装箱 + 拆箱——每次 Add 都把 int 复制到堆上，产生 100 万个小对象
var arrList = new System.Collections.ArrayList();
for (int i = 0; i < 1_000_000; i++) arrList.Add(i);  // 装箱：值类型→object
int sum1 = 0;
foreach (int x in arrList) sum1 += x;  // 拆箱：object→值类型
sw.Stop();
Console.WriteLine(\$"ArrayList（装箱）: {sw.ElapsedMilliseconds} ms");

sw.Restart();

// 泛型方式：零装箱——List<int> 内部直接用 int[] 存储，不需要任何装箱
var genList = new List<int>();
for (int i = 0; i < 1_000_000; i++) genList.Add(i);
int sum2 = 0;
foreach (int x in genList) sum2 += x;
sw.Stop();
Console.WriteLine(\$"List<int>（泛型）: {sw.ElapsedMilliseconds} ms");
\`\`\`

典型输出：\`ArrayList\` 比 \`List<int>\` 慢 3~5 倍，因为装箱产生了 100 万个堆对象，GC 回收压力巨大。

### 五、类型安全的真正含义

泛型的类型安全是**编译期**保证的——错误在你写代码时就被拦住，根本跑不起来：

\`\`\`csharp
using System.Collections.Generic;

var list = new List<int> { 1, 2, 3 };
list.Add(4);
// list.Add("oops");  // 编译错误！不能把 string 加进 List<int>——编译器直接拒绝

int n = list[0];  // 无需强转，编译器知道这一定是 int
\`\`\`

编译器在编译期就检查类型匹配，错误根本不会带到运行时——这是泛型相比 \`object\` 最大的优势。

### 六、实战 demo：泛型 Swap 与 Stack<T>

#### demo 1：泛型交换函数

\`\`\`csharp
// 经典入门 demo：交换两个变量——局部函数，不需要访问修饰符
// 注意 ref 关键字：参数按引用传递，方法内修改会直接影响外部变量
void Swap<T>(ref T a, ref T b)
{
    T temp = a;
    a = b;
    b = temp;
}

int x = 1, y = 2;
Swap(ref x, ref y);
Console.WriteLine(\$"x={x}, y={y}");  // x=2, y=1

string s1 = "A", s2 = "B";
Swap(ref s1, ref s2);
Console.WriteLine(\$"s1={s1}, s2={s2}");  // s1=B, s2=A
\`\`\`

如果不加 \`ref\`，Swap 就只是交换了参数的副本，外部变量完全不受影响——这是新手最容易踩的坑之一。

#### demo 2：自己实现一个泛型栈

\`\`\`csharp
using System;
using System.Collections.Generic;

// 使用自定义泛型栈——可执行代码在前
var stack = new MyStack<string>();
stack.Push("first");
stack.Push("second");
Console.WriteLine(stack.Pop());   // second（后进先出）
Console.WriteLine(stack.Peek());  // first（看栈顶但不弹出）
Console.WriteLine(stack.Count);   // 1

// 类型声明在后（CS8803：顶级语句要求可执行代码在类型声明之前）
// 泛型栈（LIFO）：Push 入栈、Pop 出栈、Peek 看栈顶
// 内部用数组实现，容量不够时自动翻倍扩容（和 List<T> 原理相同）
public class MyStack<T>
{
    private T[] _items = new T[4];  // 初始容量 4
    private int _count = 0;

    public int Count => _count;

    public void Push(T item)
    {
        if (_count == _items.Length)
        {
            // 扩容：翻倍——均摊 O(1) 的关键
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
        _items[_count] = default!;  // 释放引用，帮助 GC 回收（避免内存泄漏）
        return item;
        // default! 解释：default(T) 对引用类型返回 null，对值类型返回 0/false
        // ! 是 null 抑制运算符，告诉编译器"我知道这里可能是 null，但此处逻辑安全"
    }

    public T Peek() => _count == 0
        ? throw new InvalidOperationException("Stack is empty")
        : _items[_count - 1];
}
\`\`\`

### 七、泛型的命名约定

| 参数名 | 含义 |
|--------|------|
| \`T\` | 通用单类型参数（Type 的首字母） |
| \`TKey\`, \`TValue\` | 字典的键 / 值类型 |
| \`TInput\`, \`TOutput\` | 转换函数的输入 / 输出类型 |
| \`TResult\` | 返回值类型 |
| \`TEntity\` | ORM/仓储中的实体类型 |

约定只是约定，编译器不强制，但遵守约定能让其他开发者（包括三个月后的你）一眼看懂代码意图。

### 八、小结

- 泛型把**类型当参数**，写一次代码，多种类型复用。
- 相比 \`object\` 容器：**类型安全**（编译期检查，错误早发现）+ **零装箱**（值类型性能更好，减少 GC 压力）。
- 泛型类用 \`class Foo<T>\`，泛型方法用 \`void Bar<T>(T x)\`。
- 多类型参数用 \`<TKey, TValue>\`，命名遵循 T 前缀约定。
- \`List<T>\` / \`Dictionary<K,V>\` 等都是 BCL 内置泛型集合，下章起逐个深入。
- **C# 顶级语句规则**：using → 可执行代码（含局部函数）→ 类型声明（class/record/struct 等），顺序错了会报 CS8803。
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

泛型 \`T\` 默认"什么都能传"——但代价是：方法体内只能调用 \`object\` 上的方法（\`Equals\`、\`GetHashCode\`、\`ToString\`），无法用 \`>\` / \`<\` 比大小、无法 \`new T()\`、无法调用特定接口的方法。

约束（\`where\`）就是给 \`T\` 加限制，换取在方法体内使用更多能力的权限：

\`\`\`csharp
using System.Collections.Generic;

// 调用有约束的 Max——可执行代码在前
Console.WriteLine(Max(3, 7));             // 7（int 实现了 IComparable<int>）
Console.WriteLine(Max("apple", "banana")); // banana（字符串按字典序比较）

// 为什么需要约束？没有约束时，T 是"裸"的，编译器只当它是 object：
// if (a > b) 这样的代码无法编译，因为不是所有 T 都支持 > 运算符。
// where T : IComparable<T> 告诉编译器："T 一定实现了比较接口，放心调用 CompareTo"

// 局部泛型函数 + where 约束——局部函数不需要 public static
T Max<T>(T a, T b) where T : IComparable<T>
{
    // 因为有 IComparable<T> 约束，可以安全调用 CompareTo 方法
    return a.CompareTo(b) > 0 ? a : b;
}

// 第一个 Max（无约束）什么都干不了，删掉——只保留有约束的版本即可
\`\`\`

### 二、五种约束类型

| 约束 | 含义 | 能做什么 |
|------|------|---------|
| \`where T : class\` | 必须是引用类型（class、interface、delegate、string、数组） | 可赋值 \`null\`，可用 \`as\` / \`is\` 模式匹配 |
| \`where T : struct\` | 必须是值类型（不可为 null 的值类型，不包括 Nullable<T>） | 不可赋值 \`null\`，T? 是 Nullable<T> |
| \`where T : new()\` | 必须有公共无参构造函数 | 可以写 \`new T()\` 创建实例 |
| \`where T : 接口名\` | 必须实现指定接口 | 可以调用接口的方法 |
| \`where T : 基类名\` | 必须继承指定基类（或本身就是该类） | 可以访问基类的成员 |

#### demo：每种约束的样子

\`\`\`csharp
using System;
using System.Collections.Generic;

// 注意：这个代码块只有定义，没有调用示例。
// 顶级语句中局部函数和类型声明可以只定义不调用，但类型声明要放后面。

// 1. class 约束：T 必须是引用类型，才能返回 null（值类型不能为 null）
T? FindOrNull<T>(IList<T> list, T target) where T : class
{
    foreach (var item in list)
        if (item.Equals(target)) return item;
    return null;
}

// 2. struct 约束：T 必须是值类型，T? 就是 Nullable<T>
T? FindOrNullable<T>(IList<T> list, T target) where T : struct
{
    foreach (var item in list)
        if (item.Equals(target)) return item;
    return null;
}

// 3. new() 约束：可以 new T()——new() 约束必须放在所有约束最后
T CreateDefault<T>() where T : new()
{
    return new T();
}

// 4. 接口约束：T 必须实现 IFormattable，可以调用 ToString(format, provider)
string Describe<T>(T item) where T : IFormattable
{
    return item.ToString("G", null);
}

// 5. 基类约束：T 必须是 Animal 或其子类，可以直接访问 Name 属性
string GetName<T>(T obj) where T : Animal
{
    return obj.Name;
}

// Animal 是类型声明，放最后（被 GetName 的基类约束引用，C# 支持前向引用）
public class Animal { public string Name { get; set; } = ""; }
\`\`\`

### 三、多个约束

一个 \`T\` 可以同时满足多个约束，用逗号分隔：

\`\`\`csharp
// 只有类型定义，没有调用代码——类型声明在顶级语句中放后面也可以，
// 但这个代码块没有可执行代码，所以类声明直接在这里也没问题（因为没有可执行语句在它后面）。
// T 必须是引用类型 + 实现 IComparable<T> + 有无参构造
public class SortedFactory<T> where T : class, IComparable<T>, new()
{
    public T CreateAndCompare(T a, T b)
    {
        var fresh = new T();         // new() 约束允许我们 new T()
        return a.CompareTo(b) > 0 ? a : b;  // IComparable<T> 约束允许 CompareTo
    }
}
\`\`\`

#### 不同参数分别约束

\`\`\`csharp
using System.Collections.Generic;

// TKey 和 TValue 各自有独立的 where 子句
// 这是字典的经典 GetOrAdd 模式：键不存在就创建一个默认值加进去
TValue GetOrCreate<TKey, TValue>(
    Dictionary<TKey, TValue> dict, TKey key)
    where TKey : notnull       // notnull 约束：键不能是 null（C# 8+）
    where TValue : new()       // 值类型必须有无参构造
{
    // TryGetValue 比 ContainsKey + 索引器访问更安全：
    // 为什么？因为 ContainsKey + dict[key] 做了两次哈希查找，
    // 而 TryGetValue 只做一次，且不会在键不存在时抛 KeyNotFoundException
    if (!dict.TryGetValue(key, out var value))
    {
        value = new TValue();
        dict[key] = value;
    }
    return value;
}

// 使用示例
var dict = new Dictionary<string, int>();
var val = GetOrCreate(dict, "test");
Console.WriteLine(val);  // 0（new int() 默认值）
\`\`\`

\`notnull\` 是 C# 8+ 引入的约束，表示"不能是 null 的类型"——引用类型和值类型都行，但 nullable 引用类型（如 \`string?\`）不行。

### 四、泛型方法详解

泛型方法的类型参数可以由实参推断，也可显式指定：

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

// 使用泛型方法——可执行代码在前
var nums = new[] { 1, 2, 3 };
Console.WriteLine(ArrayHelper.FirstOrDefault(nums, -1));  // 1
Console.WriteLine(ArrayHelper.FirstOrDefault(Array.Empty<int>(), -1));  // -1

// 类型声明在后
// 静态工具类 + 泛型方法：类型参数 T 由实参自动推断
public static class ArrayHelper
{
    // 注意：IEnumerable<T> 是比 IList<T> / T[] 更通用的参数类型
    // 方法参数应尽量选最通用的接口（接受更多类型）
    public static T FirstOrDefault<T>(IEnumerable<T> source, T defaultValue)
    {
        foreach (var item in source) return item;
        return defaultValue;
    }
}
\`\`\`

注意：仅当所有类型参数都能从实参推断时才能省略 \`<T>\`；若参数列表里没有 \`T\`（比如全靠其他方式），必须显式指定。

### 五、泛型委托：Action 与 Func 简介

BCL 内置两个最常用的泛型委托，避免你每次都自己声明委托类型：

#### Action：无返回值

\`\`\`csharp
using System;

// Action        无参无返回
// Action<T>     1 参无返回
// Action<T1,T2> 2 参无返回
// ... 最多支持 16 个参数

Action<string> log = msg => Console.WriteLine(\$"[LOG] {msg}");
log("hello");  // [LOG] hello

Action<int, int> printSum = (a, b) => Console.WriteLine(a + b);
printSum(3, 5);  // 8
\`\`\`

#### Func：有返回值

\`\`\`csharp
using System;

// Func<TResult>          无参返回 TResult
// Func<T, TResult>       1 参返回 TResult
// Func<T1,T2,TResult>    2 参返回 TResult
// 最后一个类型参数永远是返回值类型

Func<int, int> square = x => x * x;
Console.WriteLine(square(5));  // 25

Func<int, int, int> add = (a, b) => a + b;
Console.WriteLine(add(3, 5));  // 8

// 用 Func 作方法参数：策略模式——把"怎么做"作为参数传进去
int Apply(int x, Func<int, int> op) => op(x);

Console.WriteLine(Apply(5, x => x * 2));   // 10
Console.WriteLine(Apply(5, x => x + 1));   // 6
\`\`\`

> ⭐ \`Action\` 和 \`Func\` 是 LINQ 和事件回调的基础，后面章节会大量用到。LINQ 的 Where/Select 等方法参数就是 Func 委托。

### 六、协变与逆变简介

泛型类型参数有 \`in\` / \`out\` 两个修饰符，控制"能否把派生类型的泛型赋给基类型的泛型"——这是高级话题，日常写业务代码很少自己定义，但理解它有助于读懂 BCL 的接口签名。

#### out（协变）：只能用作返回值

\`\`\`csharp
using System.Collections.Generic;

// IEnumerable<out T> 的 T 是协变的
// 协变：如果 string 继承自 object，那么 IEnumerable<string> 也可以当作 IEnumerable<object> 使用
IEnumerable<string> strings = new List<string> { "a", "b" };
IEnumerable<object> objects = strings;  // OK！不需要 Cast<object>()

// 为什么能安全？因为 IEnumerable 只能"产出"T，不能"消费"T——
// 你只能从里面取 string 出来，而 string 一定是 object，所以完全安全。
// 如果允许往里加 object（比如 Add(object)），那就不安全了（可能塞进去一个 int）。
\`\`\`

#### in（逆变）：只能用作参数

\`\`\`csharp
using System;

// Action<in T> 的 T 是逆变的
// 逆变：如果能处理 object，那一定能处理 string（因为 string 也是 object）
Action<object> objAction = o => Console.WriteLine(o);
Action<string> strAction = objAction;  // OK！
strAction("hello");
\`\`\`

#### 何时需要自己写 in/out

只有设计**通用接口 / 委托**时才需要考虑协变逆变。日常业务代码用 BCL 内置的 \`IEnumerable<out T>\`、\`Action<in T>\`、\`Func<in T, out TResult>\` 即可，它们都已经标好了。

### 七、实战 demo：泛型仓库模式

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

// 使用泛型仓储——可执行代码在前
var users = new Repository<User>();
users.Add(new User { Name = "Alice" });
users.Add(new User { Name = "Bob" });

foreach (var u in users.All)
    Console.WriteLine(u.Name);

// 为什么仓储模式常用泛型？因为 CRUD 逻辑（增删查改）对所有实体都一样，
// 写一个 Repository<T> 就能复用于 User、Product、Order 等所有实体，
// 不需要为每个实体写一遍几乎相同的代码。

// 类型声明在后
// 一个通用的内存仓储：约束 T 必须是 class（引用类型）+ new()（方便需要时创建实例）
public class Repository<T> where T : class, new()
{
    private readonly Dictionary<int, T> _store = new();
    private int _nextId = 1;

    public T Add(T entity)
    {
        _store[_nextId++] = entity;
        return entity;
    }

    // TryGetValue 模式：一次查找，避免重复哈希
    public T? Get(int id) => _store.TryGetValue(id, out var v) ? v : null;

    public IEnumerable<T> All => _store.Values;

    public bool Remove(int id) => _store.Remove(id);
}

public class User { public string Name { get; set; } = ""; }
\`\`\`

约束 \`class, new()\` 让我们能在需要时 \`new T()\`（虽然本例没用到，但很多仓储实现会用到——比如创建默认实例或空对象）。

### 八、小结

- 约束 \`where\` 给 \`T\` 加限制，换取能力（比较大小、new 创建、调用接口方法等）；没有约束的 T 只能当 object 用。
- 五大约束：\`class\`（引用类型） / \`struct\`（值类型） / \`new()\`（无参构造，放最后） / 接口约束 / 基类约束，多个约束逗号分隔。
- \`Action\`（无返回值）/ \`Func\`（有返回值）是 BCL 内置泛型委托，是回调与 LINQ 的基石。
- **为什么 TryGetValue 比 ContainsKey+索引器安全？** 一次查找（O(1)）vs 两次查找，且避免 KeyNotFoundException。
- 协变（\`out\`，只出不进）允许派生→基类赋值，逆变（\`in\`，只进不出）允许基类→派生赋值。
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

\`List<T>\` 是 .NET 中**用得最多**的集合，内部用数组存储，容量不够时自动翻倍扩容。它兼具数组的随机访问速度（O(1) 按索引访问）和动态增删的便利性。

> ⭐ 高频知识点：日常业务里 80% 的"列表"需求都用 \`List<T>\` 解决，是必须熟练掌握的集合。

### 二、创建 List

\`\`\`csharp
using System.Collections.Generic;
using System.Linq; // Enumerable.Repeat 需要

// 1. 空列表（初始容量 0，第一次 Add 时扩容到 4）
var list1 = new List<int>();

// 2. 集合初始化器（推荐，代码最简洁）
var list2 = new List<int> { 1, 2, 3, 4, 5 };

// 3. 从数组创建（复制数组元素，新列表和原数组互不影响）
int[] arr = { 10, 20, 30 };
var list3 = new List<int>(arr);

// 4. 指定初始容量（知道大小时强烈推荐，避免多次扩容的开销）
// 比如你确定要存 1000 个元素，直接预分配，不用一次次翻倍复制
var list4 = new List<int>(capacity: 1000);

// 5. 从其他 IEnumerable 创建（LINQ 查询结果、数组、HashSet 等都可以）
var list5 = new List<string>(Enumerable.Repeat("x", 5)); // ["x","x","x","x","x"]
\`\`\`

### 三、增删元素

#### Add / AddRange / Insert / InsertRange

\`\`\`csharp
using System.Collections.Generic;

var list = new List<string> { "a", "b", "c" };

list.Add("d");                              // 末尾添加单个元素（均摊 O(1)）
list.AddRange(new[] { "e", "f" });          // 批量添加（比一个个 Add 高效）
list.Insert(0, "first");                    // 在指定位置插入（O(n)，后面元素要移动）
list.InsertRange(1, new[] { "x", "y" });    // 批量插入（O(n)）

Console.WriteLine(string.Join(",", list));
// 输出：first,x,y,a,b,c,d,e,f
\`\`\`

**List<T> 常用方法速查：**
- \`Add(T)\`：末尾加一个
- \`AddRange(IEnumerable<T>)\`：末尾加一批
- \`Insert(int index, T)\`：指定位置插入
- \`InsertRange(int index, IEnumerable)\`：指定位置批量插入
- \`Remove(T)\`：删除第一个匹配项
- \`RemoveAt(int)\`：删除指定索引
- \`RemoveAll(Predicate<T>)\`：删除所有匹配条件的
- \`RemoveRange(int, int)\`：删除一个范围
- \`Clear()\`：清空所有元素

#### Remove / RemoveAt / RemoveAll / Clear

\`\`\`csharp
using System.Collections.Generic;

var nums = new List<int> { 1, 2, 3, 2, 4, 2, 5 };

nums.Remove(2);          // 删除第一个等于 2 的元素 → [1,3,2,4,2,5]
nums.RemoveAt(0);        // 删除索引 0 的元素 → [3,2,4,2,5]
nums.RemoveAll(n => n == 2);  // 删除所有等于 2 的元素 → [3,4,5]
nums.RemoveRange(0, 2);  // 从索引 0 开始删 2 个 → [5]
nums.Clear();            // 清空 → []
\`\`\`

**性能要点：**

- \`Add\` 均摊 O(1)（偶尔扩容时需要 O(n) 复制旧数组，但均摊下来每次是 O(1)）。
- \`Insert(0, ...)\` / \`RemoveAt(0)\` 是 O(n)——后面所有元素都要移动位置。
- \`RemoveAll\` 是 O(n) 单次遍历，比循环 Remove 高效得多。
- 频繁在头部增删：换 \`LinkedList<T>\`（但 90% 场景 List 就够了）。

### 四、访问元素

\`\`\`csharp
using System.Collections.Generic;

var list = new List<int> { 10, 20, 30, 40, 50 };

// 索引访问（O(1)，这是数组的优势）
Console.WriteLine(list[0]);    // 10（第一个）
Console.WriteLine(list[^1]);   // 50（C# 8+ 反向索引，^1 是最后一个）

// 修改元素（直接赋值）
list[0] = 100;

// Count 属性（实际元素个数，注意和 Capacity 区分）
Console.WriteLine(list.Count);  // 5

// 遍历（foreach 是最常用的遍历方式，代码清晰）
foreach (var x in list) Console.WriteLine(x);
\`\`\`

### 五、查找元素

\`\`\`csharp
using System.Collections.Generic;

var list = new List<int> { 3, 7, 2, 9, 5, 7 };

// Contains：是否存在（O(n) 遍历，底层是 Equals 比较）
Console.WriteLine(list.Contains(7));   // True

// IndexOf：第一个匹配的索引，找不到返回 -1
Console.WriteLine(list.IndexOf(7));     // 1
Console.WriteLine(list.IndexOf(99));    // -1
Console.WriteLine(list.LastIndexOf(7)); // 5（最后一个匹配的索引）

// Find 系列：用谓词（Predicate<T>，本质是 Func<T, bool>）按条件查找
// Predicate<T> 就是一个返回 bool 的委托，传入元素，返回是否匹配
var firstOver5 = list.Find(n => n > 5);          // 7（第一个满足 n>5 的）
var lastOver5 = list.FindLast(n => n > 5);       // 7（最后一个满足的）
var allOver5 = list.FindAll(n => n > 5);         // [7,9,7]（所有满足的，返回新 List）
var idx = list.FindIndex(n => n > 5);            // 1（第一个满足的索引）
var lastIdx = list.FindLastIndex(n => n > 5);    // 5
var exists = list.Exists(n => n > 100);          // False（是否存在满足条件的）
var trueForAll = list.TrueForAll(n => n > 0);    // True（是否所有元素都满足）
\`\`\`

### 六、ForEach 与 ConvertAll

\`\`\`csharp
using System;
using System.Collections.Generic;

var nums = new List<int> { 1, 2, 3, 4, 5 };

// ForEach：List<T> 自带的遍历方法（内联执行，不返回新集合）
// 注意：这是 List 的实例方法，不是 LINQ——立即执行，没有延迟
nums.ForEach(n => Console.Write(n + " "));  // 输出：1 2 3 4 5
Console.WriteLine();

// ConvertAll：元素转换（List<TOutput> 自带的方法，等价于 Select().ToList()）
// 立即执行，返回一个新的 List<TOutput>
var doubled = nums.ConvertAll(n => n * 2);       // [2,4,6,8,10]
var strs = nums.ConvertAll(n => n.ToString());  // ["1","2","3","4","5"]
\`\`\`

> 注意：\`List<T>.ForEach\` 和 \`ConvertAll\` 是 \`List<T>\` 自己的实例方法，不是 LINQ。LINQ 的 \`Select\` 是**延迟执行**的，\`ConvertAll\` 是**立即执行**的（调用时就全部转换完）。

### 七、排序

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

var nums = new List<int> { 3, 1, 4, 1, 5, 9, 2, 6 };

// 1. 默认排序（升序，原地修改原列表）
nums.Sort();
// 结果：[1,1,2,3,4,5,6,9]

// 2. 反转（原地修改）
nums.Reverse();
// 结果：[9,6,5,4,3,2,1,1]

// 3. 用 Comparison<T> 委托排序（最灵活，降序示例）
// Comparison<T> 就是 Func<T, T, int>：返回负数表示 a<b，0 相等，正数 a>b
nums.Sort((a, b) => b.CompareTo(a)); // 降序排列

// 4. 用 IComparer<T> 排序（适合需要复用的比较逻辑）
nums.Sort(new DescComparer());

// 5. 不修改原集合的排序：用 LINQ 的 OrderBy（返回新的 IEnumerable，延迟执行）
var sorted = nums.OrderBy(n => n).ToList(); // ToList() 才真正执行排序
\`\`\`

#### 对自定义类型排序

\`\`\`csharp
using System.Collections.Generic;
using System.Linq;

// 可执行代码在前——C# 支持在类型声明前使用类型（多遍编译）
var people = new List<Person>
{
    new("Bob", 25),
    new("Alice", 30),
    new("Charlie", 20)
};

// 按年龄升序（Comparison 委托方式，原地排序）
people.Sort((a, b) => a.Age.CompareTo(b.Age));

// 按 Name 字母序排序（LINQ 方式，不修改原列表，返回新列表）
var byName = people.OrderBy(p => p.Name).ToList();

foreach (var p in byName)
    Console.WriteLine(\$"{p.Name} - {p.Age}");
// Alice - 30, Bob - 25, Charlie - 20

// 类型声明在后（CS8803）
// record 是 C# 9+ 引入的不可变数据类型，自动生成 Equals/GetHashCode/ToString
// 非常适合用来表示数据载体（DTO、实体等）
public record Person(string Name, int Age);
\`\`\`

// 等等，刚才 DescComparer 类型声明还没放——让我修正上一个代码块：
\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

var nums = new List<int> { 3, 1, 4, 1, 5, 9, 2, 6 };

nums.Sort();
nums.Reverse();
nums.Sort((a, b) => b.CompareTo(a));
nums.Sort(new DescComparer());
var sorted = nums.OrderBy(n => n).ToList();
Console.WriteLine(string.Join(",", sorted));

// 类型声明在后：自定义比较器，实现 IComparer<T> 接口
// 当排序逻辑复杂或需要复用时，用 IComparer<T> 比用 Comparison 委托更清晰
public class DescComparer : IComparer<int>
{
    // Compare 返回值约定：
    //   负数 → x 应该在 y 前面
    //   0     → x 和 y 相等
    //   正数 → x 应该在 y 后面
    public int Compare(int x, int y) => y.CompareTo(x); // 交换 x,y 就是降序
}
\`\`\`

### 八、容量 Capacity

\`List<T>\` 内部维护两个数字，不要搞混：

- \`Count\`：实际存储的元素个数（你 Add 了多少个）。
- \`Capacity\`：内部数组的总长度（能存多少个才需要扩容）。

\`\`\`csharp
using System;
using System.Collections.Generic;

var list = new List<int>();
Console.WriteLine(\$"Count={list.Count}, Capacity={list.Capacity}");  // Count=0, Capacity=0

for (int i = 0; i < 5; i++) list.Add(i);
Console.WriteLine(\$"Count={list.Count}, Capacity={list.Capacity}");  // Count=5, Capacity=8
// 为什么是 8？List 的扩容策略：空→0；第一次 Add→4；满了翻倍→8,16,32...

// 主动收缩容量到刚好等于 Count（释放多余的数组空间）
// 适合列表不再增长、且会长时间持有的场景（节省内存）
list.TrimExcess();
Console.WriteLine(\$"After TrimExcess: Capacity={list.Capacity}");  // Capacity=5
\`\`\`

**经验法则：**

- 知道大致大小时，构造时传 \`capacity\` 参数预分配，避免多次扩容时的数组复制开销。
- 列表不再增长时调 \`TrimExcess()\` 释放多余内存（适合长生命周期的 List，比如缓存）。

### 九、实战 demo：学生成绩管理

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq; // Average() 是 LINQ 方法

var students = new List<Student>
{
    new("Alice", 92),
    new("Bob", 78),
    new("Charlie", 85),
    new("Diana", 96),
    new("Eve", 60)
};

// 1. 找 90 分以上的优秀学生（FindAll 返回新 List）
var top = students.FindAll(s => s.Score >= 90);
Console.WriteLine("优秀：");
top.ForEach(s => Console.WriteLine(\$"  {s.Name} - {s.Score}"));

// 2. 按分数降序排名（Sort 原地排序，Comparison 委托）
students.Sort((a, b) => b.Score.CompareTo(a.Score));
Console.WriteLine("排名：");
for (int i = 0; i < students.Count; i++)
    Console.WriteLine(\$"  #{i + 1} {students[i].Name} - {students[i].Score}");

// 3. 平均分（LINQ Average 方法，对 IEnumerable<int> 求平均）
var avg = students.ConvertAll(s => s.Score).Average();
Console.WriteLine(\$"平均分：{avg:F2}"); // F2 格式化：保留 2 位小数

// 4. 不及格名单（<60）
var failed = students.FindAll(s => s.Score < 60);
Console.WriteLine(\$"不及格：{failed.Count} 人");

// 类型声明在后
public record Student(string Name, int Score);
\`\`\`

\`Average\` 是 LINQ 扩展方法（下一批 LINQ 章节详讲），它对任何 \`IEnumerable<int>\` 都能求平均——这就是泛型 + 扩展方法的威力。

### 十、List<T> vs 数组 vs ReadOnlyCollection

| 类型 | 大小可变 | 性能 | 适用场景 |
|------|---------|------|---------|
| \`T[]\`（数组） | 否（固定长度） | 最高（栈分配或连续内存） | 大小固定、性能极度敏感的场景 |
| \`List<T>\` | 是（动态扩容） | 高（数组实现） | 通用动态列表（80% 场景选这个） |
| \`IReadOnlyList<T>\` | —（只读视图） | 同 List | 对外暴露只读数据，防止调用方修改 |
| \`ImmutableList<T>\` | 不可变（每次修改返回新列表） | 较低（树结构） | 函数式编程、多线程共享不可变状态 |

\`\`\`csharp
using System.Collections.Generic;

var list = new List<int> { 1, 2, 3 };

// 转 ReadOnlyCollection，包装一层，防止外部通过接口修改
// 注意：这是视图，不是副本——如果原 list 被修改，readOnly 也会看到变化
IReadOnlyList<int> readOnly = list.AsReadOnly();
// readOnly.Add(4);  // 编译错误！IReadOnlyList 没有 Add/Remove 方法
\`\`\`

### 十一、小结

- \`List<T>\` 是动态数组（泛型版本的 ArrayList），索引访问 O(1)，末尾增删 O(1)（均摊），中间插入/删除 O(n)。
- 增删：\`Add\` / \`AddRange\` / \`Insert\` / \`Remove\` / \`RemoveAt\` / \`RemoveAll\` / \`Clear\`。
- 查找：\`Contains\` / \`IndexOf\` / \`Find\` / \`FindAll\` / \`Exists\` / \`TrueForAll\`。
- \`ForEach\`（遍历）/ \`ConvertAll\`（转换）是 \`List<T>\` 自带方法，立即执行；LINQ 的 \`Select\` / \`Where\` 是延迟执行。
- 排序：\`Sort\`（原地修改，Comparison 委托或 IComparer<T>）或 LINQ \`OrderBy\`（返回新集合，不修改原列表）。
- 知道大小时用 \`capacity\` 预分配避免扩容开销；不再增长时用 \`TrimExcess\` 释放内存。
- 对外暴露数据优先用 \`IReadOnlyList<T>\`，比直接暴露 \`List<T>\) 更安全（调用方无法意外修改）。
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

\`Dictionary<TKey, TValue>\` 是基于哈希表实现的键值对集合，**按键查找 O(1)**（均摊常数时间）。这是 .NET 中第二常用的集合，仅次于 \`List<T>\`。

> ⭐ 高频知识点：缓存、计数、分组、配置映射、ID 索引……几乎所有"按 key 快速找 value"的场景都用 \`Dictionary\`。

### 二、创建与初始化

\`\`\`csharp
using System.Collections.Generic;

// 1. 空字典
var d1 = new Dictionary<string, int>();

// 2. 集合初始化器（推荐，C# 6+ 索引器语法，最清晰）
var d2 = new Dictionary<string, int>
{
    ["apple"] = 5,
    ["banana"] = 3,
    ["cherry"] = 8
};

// 3. 旧式初始化器（用 Add 方法）
var d3 = new Dictionary<string, int>
{
    { "apple", 5 },
    { "banana", 3 }
};

// 4. 从 IEnumerable<KeyValuePair> 创建（比如从另一个字典或 LINQ 结果创建）
var pairs = new List<KeyValuePair<string, int>>
{
    new("x", 1),
    new("y", 2)
};
var d4 = new Dictionary<string, int>(pairs);

// 5. 指定初始容量（知道大小时推荐，避免哈希桶扩容和 rehash 开销）
var d5 = new Dictionary<string, int>(capacity: 100);