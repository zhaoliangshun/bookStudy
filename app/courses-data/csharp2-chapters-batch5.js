// =============================================================
// C# 大全 - 第五批章节（第五部分 泛型与集合，共 7 章）
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
// 顶级语句规则：using → 可执行代码（含局部函数）→ 类型声明（class/record/struct 等）
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
// 为什么类型声明要放后面？
// C# 顶级语句编译后是 Program.Main() 方法，类型声明是 Program 的嵌套类。
// CS8803 要求顺序：1) using 指令  2) 可执行代码  3) 类型声明（class/record/struct 等）
// C# 编译器是多遍扫描的，嵌套类定义顺序不影响使用，但顶级语句要求执行代码在前。

// 可执行代码在前：使用时把 T 替换成具体类型
var intBox = new Box<int>(42);
var strBox = new Box<string>("hello");
intBox.Show();   // Box contains: 42
strBox.Show();   // Box contains: hello

// 类型声明在后（CS8803 要求）
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
    public Pair(TKey key, TValue value) { Key = key; Value = value; }
}
\`\`\`

### 三、泛型方法

方法也可以单独泛型——不必让整个类泛型化。在顶级语句中，类型声明要放在可执行代码之后：

\`\`\`csharp
// 可执行代码在前：调用泛型方法
Helper.Print(42);           // Type: System.Int32, Value: 42
Helper.Print("hello");      // Type: System.String, Value: hello
Helper.Print<double>(3.14); // 显式指定类型参数（当编译器无法推断时需要）

// 类型声明在后（静态类包含泛型方法）
public static class Helper
{
    // T 是方法级类型参数，调用时由实参推断确定
    public static void Print<T>(T item)
    {
        Console.WriteLine(\$"Type: {typeof(T)}, Value: {item}");
    }
}
\`\`\`

注意：仅当所有类型参数都能从实参推断时才能省略 \`<T>\`；若参数列表里没有 \`T\`，必须显式指定。

### 四、泛型 vs object：性能对比

来看一段直观的对比——分别用 \`ArrayList\`（object）和 \`List<int>\`（泛型）存 100 万个整数：

\`\`\`csharp
using System.Diagnostics;
using System.Collections.Generic;

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
// 局部函数：不需要访问修饰符（public/private），顶级语句里直接写就是局部函数
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

// 可执行代码在前：使用自定义泛型栈
var stack = new MyStack<string>();
stack.Push("first");
stack.Push("second");
Console.WriteLine(stack.Pop());   // second（后进先出）
Console.WriteLine(stack.Peek());  // first（看栈顶但不弹出）
Console.WriteLine(stack.Count);   // 1

// 类型声明在后（CS8803）
// 泛型栈（LIFO）：Push 入栈、Pop 出栈、Peek 看栈顶
// 内部用数组实现，容量不够时自动翻倍扩容（和 List<T> 原理相同）
public class MyStack<T>
{
    private T[] _items = new T[4];
    private int _count = 0;
    public int Count => _count;

    public void Push(T item)
    {
        if (_count == _items.Length)
        {
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
        _items[_count] = default!;
        return item;
    }

    public T Peek() => _count == 0
        ? throw new InvalidOperationException("Stack is empty")
        : _items[_count - 1];
}
\`\`\`

\`default!\` 解释：\`default(T)\` 对引用类型返回 null，对值类型返回 0/false。\`!\` 是 null 抑制运算符，告诉编译器"我知道这里可能是 null，但此处逻辑安全"。

### 七、泛型的命名约定

| 参数名 | 含义 |
|--------|------|
| \`T\` | 通用单类型参数（Type 的首字母） |
| \`TKey\`, \`TValue\` | 字典的键 / 值类型 |
| \`TInput\`, \`TOutput\` | 转换函数的输入 / 输出类型 |
| \`TResult\` | 返回值类型 |
| \`TEntity\` | ORM/仓储中的实体类型 |

约定只是约定，编译器不强制，但遵守约定能让代码更易读。

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

// 可执行代码在前：调用有约束的 Max
Console.WriteLine(Max(3, 7));             // 7（int 实现了 IComparable<int>）
Console.WriteLine(Max("apple", "banana")); // banana（字符串按字典序比较）

// 为什么需要约束？没有约束时，T 是"裸"的，编译器只当它是 object，
// if (a > b) 这样的代码无法编译，因为不是所有 T 都支持 > 运算符。
// where T : IComparable<T> 告诉编译器："T 一定实现了比较接口，放心调用 CompareTo"

// 局部泛型函数 + where 约束（局部函数不需要 public static）
T Max<T>(T a, T b) where T : IComparable<T>
{
    return a.CompareTo(b) > 0 ? a : b;
}
\`\`\`

### 二、五种约束类型

| 约束 | 含义 | 能做什么 |
|------|------|---------|
| \`where T : class\` | 必须是引用类型（class、interface、delegate、string、数组） | 可赋值 \`null\`，可用 \`as\` / \`is\` 模式匹配 |
| \`where T : struct\` | 必须是值类型（不可为 null 的值类型） | 不可赋值 \`null\`，T? 是 Nullable<T> |
| \`where T : new()\` | 必须有公共无参构造函数（必须放最后） | 可以写 \`new T()\` 创建实例 |
| \`where T : 接口名\` | 必须实现指定接口 | 可以调用接口的方法 |
| \`where T : 基类名\` | 必须继承指定基类 | 可以访问基类的成员 |

#### demo：每种约束的样子

\`\`\`csharp
using System;
using System.Collections.Generic;

// 局部函数定义（可执行代码区域，局部函数顺序不影响使用）

// 1. class 约束：T 必须是引用类型，才能返回 null
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
T CreateDefault<T>() where T : new() => new T();

// 4. 接口约束：T 必须实现 IFormattable
string Describe<T>(T item) where T : IFormattable => item.ToString("G", null);

// 5. 基类约束：T 必须是 Animal 或其子类
string GetName<T>(T obj) where T : Animal => obj.Name;

// 使用示例
var animals = new List<Animal> { new Animal { Name = "Tom" } };
var found = FindOrNull(animals, new Animal { Name = "Tom" });
Console.WriteLine(found?.Name ?? "not found");

// 类型声明在后（被 GetName 的基类约束引用，C# 支持前向引用）
public class Animal { public string Name { get; set; } = ""; }
\`\`\`

### 三、多个约束

一个 \`T\` 可以同时满足多个约束，用逗号分隔：

\`\`\`csharp
// 只有类型定义，没有调用代码——没有可执行语句在类型后面，可以直接定义
public class SortedFactory<T> where T : class, IComparable<T>, new()
{
    public T CreateAndCompare(T a, T b)
    {
        var fresh = new T();         // new() 约束允许 new T()
        return a.CompareTo(b) > 0 ? a : b;  // IComparable<T> 约束允许 CompareTo
    }
}
\`\`\`

#### 不同参数分别约束

\`\`\`csharp
using System.Collections.Generic;

// TKey 和 TValue 各自有独立的 where 子句
TValue GetOrCreate<TKey, TValue>(
    Dictionary<TKey, TValue> dict, TKey key)
    where TKey : notnull
    where TValue : new()
{
    // 为什么 TryGetValue 比 ContainsKey + 索引器好？
    // 1) 一次哈希查找 vs 两次查找，性能差一倍
    // 2) 不会抛 KeyNotFoundException
    if (!dict.TryGetValue(key, out var value))
    {
        value = new TValue();
        dict[key] = value;
    }
    return value;
}

// 使用示例
var dict = new Dictionary<string, int>();
Console.WriteLine(GetOrCreate(dict, "test"));  // 0（new int() 默认值）
\`\`\`

\`notnull\` 是 C# 8+ 引入的约束，表示"不能是 null 的类型"。

### 四、泛型方法详解

泛型方法的类型参数可以由实参推断，也可显式指定：

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

// 可执行代码在前
var nums = new[] { 1, 2, 3 };
Console.WriteLine(ArrayHelper.FirstOrDefault(nums, -1));  // 1
Console.WriteLine(ArrayHelper.FirstOrDefault(Array.Empty<int>(), -1));  // -1

// 类型声明在后
public static class ArrayHelper
{
    // 方法参数选最通用的接口（IEnumerable<T>），接受更多输入类型
    public static T FirstOrDefault<T>(IEnumerable<T> source, T defaultValue)
    {
        foreach (var item in source) return item;
        return defaultValue;
    }
}
\`\`\`

### 五、泛型委托：Action 与 Func 简介

BCL 内置两个最常用的泛型委托，避免每次自己声明委托类型：

#### Action：无返回值

\`\`\`csharp
using System;

// Action        无参无返回
// Action<T>     1 参无返回
// Action<T1,T2> 2 参无返回（最多 16 个参数）

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
// 最后一个类型参数永远是返回值类型

Func<int, int> square = x => x * x;
Console.WriteLine(square(5));  // 25

Func<int, int, int> add = (a, b) => a + b;
Console.WriteLine(add(3, 5));  // 8

// 用 Func 作方法参数：策略模式
int Apply(int x, Func<int, int> op) => op(x);

Console.WriteLine(Apply(5, x => x * 2));   // 10
Console.WriteLine(Apply(5, x => x + 1));   // 6
\`\`\`

> ⭐ \`Action\` 和 \`Func\` 是 LINQ 和事件回调的基础。

### 六、协变与逆变简介

泛型类型参数有 \`in\` / \`out\` 修饰符，控制泛型类型的兼容性。这是高级话题，日常业务用 BCL 内置的即可。

#### out（协变）：只能用作返回值

\`\`\`csharp
using System.Collections.Generic;

IEnumerable<string> strings = new List<string> { "a", "b" };
IEnumerable<object> objects = strings;  // OK！协变：string→object 安全
\`\`\`

#### in（逆变）：只能用作参数

\`\`\`csharp
using System;

Action<object> objAction = o => Console.WriteLine(o);
Action<string> strAction = objAction;  // OK！逆变：能处理 object 一定能处理 string
strAction("hello");
\`\`\`

### 七、实战 demo：泛型仓库模式

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

// 可执行代码在前
var users = new Repository<User>();
users.Add(new User { Name = "Alice" });
users.Add(new User { Name = "Bob" });

foreach (var u in users.All)
    Console.WriteLine(u.Name);

// 为什么仓储模式常用泛型？CRUD 逻辑对所有实体都一样，
// 写一个 Repository<T> 就能复用于 User、Product、Order，不用重复代码。

// 类型声明在后
public class Repository<T> where T : class, new()
{
    private readonly Dictionary<int, T> _store = new();
    private int _nextId = 1;

    public T Add(T entity) { _store[_nextId++] = entity; return entity; }
    public T? Get(int id) => _store.TryGetValue(id, out var v) ? v : null;
    public IEnumerable<T> All => _store.Values;
    public bool Remove(int id) => _store.Remove(id);
}

public class User { public string Name { get; set; } = ""; }
\`\`\`

### 八、小结

- 约束 \`where\` 给 \`T\` 加限制，换取能力（比较、new、调用接口方法）；没有约束的 T 只能当 object 用。
- 五大约束：\`class\`（引用类型）/ \`struct\`（值类型）/ \`new()\`（无参构造，放最后）/ 接口 / 基类。
- \`Action\`（无返回值）/ \`Func\`（有返回值，最后一个类型参数是返回值）是 BCL 内置泛型委托。
- **为什么 TryGetValue 比 ContainsKey+索引器安全？** 一次查找（O(1)），避免 KeyNotFoundException。
- 协变（\`out\`）允许派生→基类赋值，逆变（\`in\`）允许基类→派生赋值，日常业务用内置接口即可。
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

\`List<T>\` 是 .NET 中**用得最多**的集合，内部用数组存储，容量不够时自动翻倍扩容。它兼具数组的随机访问速度（O(1) 按索引）和动态增删的便利性。

> ⭐ 日常业务里 80% 的"列表"需求都用 \`List<T>\` 解决。

### 二、创建 List

\`\`\`csharp
using System.Collections.Generic;
using System.Linq;

var list1 = new List<int>();                              // 空列表
var list2 = new List<int> { 1, 2, 3, 4, 5 };             // 集合初始化器（推荐）
int[] arr = { 10, 20, 30 };
var list3 = new List<int>(arr);                           // 从数组创建（复制元素）
var list4 = new List<int>(capacity: 1000);               // 指定初始容量（避免多次扩容）
var list5 = new List<string>(Enumerable.Repeat("x", 5)); // 从 IEnumerable 创建
\`\`\`

### 三、增删元素

#### Add / AddRange / Insert / InsertRange

\`\`\`csharp
using System.Collections.Generic;

var list = new List<string> { "a", "b", "c" };
list.Add("d");
list.AddRange(new[] { "e", "f" });
list.Insert(0, "first");
list.InsertRange(1, new[] { "x", "y" });
Console.WriteLine(string.Join(",", list));  // first,x,y,a,b,c,d,e,f
\`\`\`

**List<T> 常用方法速查：**
- \`Add\`（末尾加）/ \`AddRange\`（末尾加一批）/ \`Insert\`（指定位置插入）/ \`InsertRange\)
- \`Remove\)（删第一个匹配）/ \`RemoveAt\)（按索引删）/ \`RemoveAll\)（按条件删）/ \`RemoveRange\) / \`Clear\)

#### Remove 系列

\`\`\`csharp
using System.Collections.Generic;

var nums = new List<int> { 1, 2, 3, 2, 4, 2, 5 };
nums.Remove(2);
nums.RemoveAt(0);
nums.RemoveAll(n => n == 2);
nums.RemoveRange(0, 2);
nums.Clear();
\`\`\`

**性能要点：**
- \`Add\` 均摊 O(1)（偶尔扩容 O(n)）
- \`Insert(0)\` / \`RemoveAt(0)\` 是 O(n)，因为要移动所有元素
- 频繁头部增删：换 \`LinkedList<T>\`（但 90% 场景 List 足够）

### 四、访问元素

\`\`\`csharp
using System;
using System.Collections.Generic;

var list = new List<int> { 10, 20, 30, 40, 50 };
Console.WriteLine(list[0]);    // 10（索引访问 O(1)）
Console.WriteLine(list[^1]);   // 50（C# 8+ 反向索引）
list[0] = 100;                 // 修改
Console.WriteLine(list.Count);  // 5
foreach (var x in list) Console.WriteLine(x);
\`\`\`

### 五、查找元素

\`\`\`csharp
using System.Collections.Generic;

var list = new List<int> { 3, 7, 2, 9, 5, 7 };
Console.WriteLine(list.Contains(7));      // True
Console.WriteLine(list.IndexOf(7));        // 1
Console.WriteLine(list.LastIndexOf(7));    // 5

// Find 系列：用 Predicate<T>（本质是 Func<T, bool>）
list.Find(n => n > 5);        // 第一个满足条件的
list.FindLast(n => n > 5);    // 最后一个满足的
list.FindAll(n => n > 5);     // 所有满足的（返回新 List）
list.Exists(n => n > 100);    // 是否存在
list.TrueForAll(n => n > 0);  // 是否全部满足
\`\`\`

### 六、ForEach 与 ConvertAll

\`\`\`csharp
using System;
using System.Collections.Generic;

var nums = new List<int> { 1, 2, 3, 4, 5 };
nums.ForEach(n => Console.Write(n + " "));  // 1 2 3 4 5
Console.WriteLine();

// ConvertAll：立即执行，返回新 List（等价于 Select().ToList()）
var doubled = nums.ConvertAll(n => n * 2);
var strs = nums.ConvertAll(n => n.ToString());
\`\`\`

> 注意：\`ForEach\` / \`ConvertAll\` 是 List 自带方法，立即执行；LINQ 的 \`Select\` / \`Where\` 是延迟执行。

### 七、排序

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

var nums = new List<int> { 3, 1, 4, 1, 5, 9, 2, 6 };

nums.Sort();                               // 默认升序（原地修改）
nums.Reverse();                            // 反转（原地修改）
nums.Sort((a, b) => b.CompareTo(a));       // Comparison 委托降序
nums.Sort(new DescComparer());             // IComparer<T> 自定义比较器
var sorted = nums.OrderBy(n => n).ToList(); // LINQ OrderBy（返回新集合，不修改原列表）
Console.WriteLine(string.Join(",", sorted));

// 类型声明在后（CS8803）
public class DescComparer : IComparer<int>
{
    public int Compare(int x, int y) => y.CompareTo(x);
}
\`\`\`

#### 对自定义类型排序

\`\`\`csharp
using System.Collections.Generic;
using System.Linq;

var people = new List<Person>
{
    new("Bob", 25),
    new("Alice", 30),
    new("Charlie", 20)
};

people.Sort((a, b) => a.Age.CompareTo(b.Age));  // 按年龄升序（原地排序）
var byName = people.OrderBy(p => p.Name).ToList(); // LINQ 按名字排序（返回新列表）

foreach (var p in byName)
    Console.WriteLine(\$"{p.Name} - {p.Age}");

// 类型声明在后
public record Person(string Name, int Age);
\`\`\`

### 八、容量 Capacity

\`List<T>\` 内部维护两个值：
- \`Count\`：实际元素个数
- \`Capacity\`：内部数组总长度

\`\`\`csharp
using System;
using System.Collections.Generic;

var list = new List<int>();
Console.WriteLine(\$"Count={list.Count}, Capacity={list.Capacity}");  // 0, 0

for (int i = 0; i < 5; i++) list.Add(i);
Console.WriteLine(\$"Count={list.Count}, Capacity={list.Capacity}");  // 5, 8（扩容到 8）

list.TrimExcess();  // 收缩容量到刚好等于 Count
Console.WriteLine(\$"Capacity={list.Capacity}");  // 5
\`\`\`

**经验法则：** 知道大小时传 \`capacity\` 预分配；列表不再增长时调 \`TrimExcess()\` 释放内存。

### 九、实战 demo：学生成绩管理

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

var students = new List<Student>
{
    new("Alice", 92), new("Bob", 78), new("Charlie", 85),
    new("Diana", 96), new("Eve", 60)
};

var top = students.FindAll(s => s.Score >= 90);
Console.WriteLine("优秀：");
top.ForEach(s => Console.WriteLine(\$"  {s.Name} - {s.Score}"));

students.Sort((a, b) => b.Score.CompareTo(a.Score));
Console.WriteLine("排名：");
for (int i = 0; i < students.Count; i++)
    Console.WriteLine(\$"  #{i + 1} {students[i].Name} - {students[i].Score}");

var avg = students.ConvertAll(s => s.Score).Average();
Console.WriteLine(\$"平均分：{avg:F2}");

var failed = students.FindAll(s => s.Score < 60);
Console.WriteLine(\$"不及格：{failed.Count} 人");

// 类型声明在后
public record Student(string Name, int Score);
\`\`\`

### 十、List<T> vs 数组 vs ReadOnlyCollection

| 类型 | 大小可变 | 性能 | 适用 |
|------|---------|------|------|
| \`T[]\` | 否 | 最高 | 固定大小、性能敏感 |
| \`List<T>\` | 是 | 高 | 通用动态列表 |
| \`IReadOnlyList<T>\` | — | 同上 | 对外暴露只读视图 |
| \`ImmutableList<T>\` | 不可变 | 较低 | 函数式/多线程共享 |

\`\`\`csharp
using System.Collections.Generic;

var list = new List<int> { 1, 2, 3 };
IReadOnlyList<int> readOnly = list.AsReadOnly();  // 防止外部修改
\`\`\`

### 十一、小结

- \`List<T>\` 是动态数组，索引访问 O(1)，末尾增删 O(1)（均摊），中间 O(n)。
- 增删：\`Add/AddRange/Insert/Remove/RemoveAt/RemoveAll/Clear\`。
- 查找：\`Contains/IndexOf/Find/FindAll/Exists\`。
- \`ForEach\` / \`ConvertAll\` 是 List 方法，立即执行；LINQ 是延迟执行。
- 排序：\`Sort\`（原地）或 \`OrderBy\`（返回新集合）。
- 预分配 \`capacity\`，用完 \`TrimExcess\`。
- 对外暴露优先用 \`IReadOnlyList<T>\`。
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

\`Dictionary<TKey, TValue>\` 基于哈希表，**按键查找 O(1)**。缓存、计数、ID 索引、配置映射全靠它，是第二常用的集合。

### 二、创建与初始化

\`\`\`csharp
using System.Collections.Generic;

var d1 = new Dictionary<string, int>();
var d2 = new Dictionary<string, int> { ["apple"] = 5, ["banana"] = 3 };
var d3 = new Dictionary<string, int> { { "apple", 5 }, { "banana", 3 } };
var d4 = new Dictionary<string, int>(capacity: 100);  // 预分配容量
\`\`\`

注意：\`["key"] = value\`（索引器）键存在就覆盖；\`{ "key", value }\`（Add）键存在抛异常。

### 三、增删改

\`\`\`csharp
using System.Collections.Generic;

var dict = new Dictionary<string, int>();
dict.Add("a", 1);                // 键存在抛异常
dict["a"] = 10;                  // 覆盖或新增
dict["c"] = 30;                  // 新增
dict.Remove("b");                // 删除，返回 bool
dict.Remove("b", out var removed); // C# 6+ 同时取出被删的值
dict.Clear();
\`\`\`

**Dictionary<K,V> 常用方法速查：**
- \`Add\`（添加，重复抛异常）/ 索引器 \`[]=\`（覆盖或新增）
- \`TryGetValue\)（安全获取，推荐）/ 索引器 \`[]\`（键不存在抛异常）
- \`Remove\) / \`ContainsKey\)（O(1)）/ \`ContainsValue\)（O(n)，少用）/ \`GetValueOrDefault\)

### 四、访问与查找

#### 索引器（危险）

\`\`\`csharp
using System.Collections.Generic;

var dict = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2 };
Console.WriteLine(dict["a"]);  // 1
// Console.WriteLine(dict["z"]); // 抛 KeyNotFoundException！
\`\`\`

> ⚠️ 不确定键存在时，**永远用 TryGetValue**！

#### TryGetValue（必须掌握）

\`\`\`csharp
using System;
using System.Collections.Generic;

var dict = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2 };

// 为什么 TryGetValue 比 ContainsKey + dict[key] 好？
// 1) 一次哈希查找 vs 两次（性能差一倍）
// 2) 不会抛 KeyNotFoundException
if (dict.TryGetValue("a", out var val))
    Console.WriteLine(\$"找到了：{val}");
else
    Console.WriteLine("不存在");
\`\`\`

### 五、遍历

\`\`\`csharp
using System.Collections.Generic;

var dict = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2, ["c"] = 3 };

foreach (var kv in dict) Console.WriteLine(\$"{kv.Key} = {kv.Value}");
foreach (var key in dict.Keys) Console.WriteLine(key);
foreach (var val in dict.Values) Console.WriteLine(val);
foreach (var (key, value) in dict) Console.WriteLine(\$"{key} -> {value}"); // C# 7+ 解构
\`\`\`

> 注意：Dictionary 遍历顺序不保证是插入顺序。

### 六、键的要求

键必须：
1. 正确重写 \`Equals\` / \`GetHashCode\`（\`record\` 自动生成）
2. 不可变（作键期间不能修改，否则找不到）

#### 反面教材：可变类做键

\`\`\`csharp
using System.Collections.Generic;

var k1 = new MutableKey { Name = "x" };
var dict = new Dictionary<MutableKey, int> { [k1] = 1 };
k1.Name = "y";  // 修改了键！可能再也找不到了
Console.WriteLine("警告：永远不要用可变类型做字典键！");

public class MutableKey { public string Name { get; set; } = ""; }
\`\`\`

#### 正确做法：record 做键

\`\`\`csharp
using System.Collections.Generic;

var map = new Dictionary<PointKey, string>
{
    [new PointKey(0, 0)] = "原点",
    [new PointKey(1, 1)] = "对角"
};
Console.WriteLine(map[new PointKey(1, 1)]);  // 对角（record 按值相等）

public record PointKey(int X, int Y);
\`\`\`

#### 字符串键忽略大小写

\`\`\`csharp
using System.Collections.Generic;

var dict = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
{
    ["Apple"] = 1
};
Console.WriteLine(dict["APPLE"]);  // 1（不区分大小写）
\`\`\`

### 七、常用场景

#### 缓存模式

\`\`\`csharp
using System.Collections.Generic;

var cache = new Dictionary<string, string>();

string GetData(string key)
{
    if (cache.TryGetValue(key, out var value))
        return value;
    value = \$"computed-{key}";
    cache[key] = value;
    return value;
}

Console.WriteLine(GetData("user-1")); // 第一次：计算
Console.WriteLine(GetData("user-1")); // 第二次：缓存命中
\`\`\`

#### 计数场景

\`\`\`csharp
using System.Collections.Generic;
using System.Linq;

var words = new[] { "apple", "banana", "apple", "cherry" };
var counts = new Dictionary<string, int>();
foreach (var w in words)
    counts[w] = counts.GetValueOrDefault(w) + 1;  // 简洁写法
\`\`\`

### 八、实战 demo：单词频率统计

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

string text = "the quick brown fox the lazy dog the fox runs";
var freq = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
foreach (var word in text.Split(' '))
    freq[word] = freq.GetValueOrDefault(word) + 1;

foreach (var kv in freq.OrderByDescending(kv => kv.Value))
    Console.WriteLine(\$"{kv.Key}: {kv.Value}");
\`\`\`

### 九、并发场景：ConcurrentDictionary

多线程下用 \`ConcurrentDictionary\`（在 \`System.Collections.Concurrent\` 命名空间），普通 Dictionary 线程不安全。

### 十、小结

- Dictionary 按键查找 O(1)，是缓存/计数/索引的首选。
- **安全访问优先用 TryGetValue**（一次查找、不抛异常）。
- 键必须不可变且正确实现 Equals/GetHashCode——首选 record。
- 字符串忽略大小写用 \`StringComparer.OrdinalIgnoreCase\`。
- 计数用 \`GetValueOrDefault\` + 索引器最简洁。
- 多线程用 ConcurrentDictionary。
- \`ContainsValue\` 是 O(n)，少用。
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

### 一、HashSet<T>：去重与集合运算

\`HashSet<T>\` 基于哈希表，**不含重复元素**，Contains/Add/Remove 都是 O(1)。

\`\`\`csharp
using System.Collections.Generic;

var set = new HashSet<int> { 1, 2, 3 };
set.Add(2);  // 返回 false（已存在）
set.Add(4);  // 返回 true（添加成功）
set.Contains(3);  // True
set.Remove(2);
\`\`\`

**HashSet 核心能力：集合运算（注意：XxxWith 方法就地修改！）**

\`\`\`csharp
using System.Collections.Generic;

var a = new HashSet<int> { 1, 2, 3, 4 };
var b = new HashSet<int> { 3, 4, 5, 6 };

var union = new HashSet<int>(a); union.UnionWith(b);         // 并集
var inter = new HashSet<int>(a); inter.IntersectWith(b);     // 交集
var except = new HashSet<int>(a); except.ExceptWith(b);      // 差集
var sym = new HashSet<int>(a); sym.SymmetricExceptWith(b);  // 对称差

a.IsSubsetOf(union);    // 子集判断
a.Overlaps(b);          // 是否有交集
\`\`\`

**典型用途：一行去重**
\`\`\`csharp
var unique = new HashSet<int>(new[] { 1, 2, 2, 3, 3, 3, 4 });
\`\`\`

### 二、Queue<T>：先进先出（FIFO）

队列用于任务调度、消息处理、BFS。

\`\`\`csharp
using System;
using System.Collections.Generic;

var queue = new Queue<string>();
queue.Enqueue("task1");
queue.Enqueue("task2");
Console.WriteLine(queue.Dequeue());  // task1
Console.WriteLine(queue.Peek());     // task2（看队首不取出）
Console.WriteLine(queue.Count);      // 1
\`\`\`

#### PriorityQueue（.NET 6+）：优先级队列

\`\`\`csharp
using System.Collections.Generic;

var pq = new PriorityQueue<string, int>();
pq.Enqueue("紧急", 1);  // 优先级数字越小越先出
pq.Enqueue("普通", 5);
pq.Enqueue("高", 3);
Console.WriteLine(pq.Dequeue());  // 紧急
\`\`\`

### 三、Stack<T>：后进先出（LIFO）

栈用于撤销/重做、括号匹配、DFS、表达式求值。

\`\`\`csharp
using System;
using System.Collections.Generic;

var stack = new Stack<int>();
stack.Push(1);
stack.Push(2);
Console.WriteLine(stack.Pop());   // 3（最后入栈先出）
Console.WriteLine(stack.Peek());  // 2
\`\`\`

#### 经典应用：括号匹配

\`\`\`csharp
using System.Collections.Generic;

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

\`LinkedList<T>\` 在已知节点前后插入/删除是 O(1)，但无索引访问，且 CPU 缓存不友好。**90% 场景用 List 更快。**

\`\`\`csharp
using System;
using System.Collections.Generic;

var linked = new LinkedList<string>();
linked.AddLast("a");
linked.AddLast("b");
var nodeB = linked.Find("b");
linked.AddBefore(nodeB!, "ab");
linked.AddAfter(nodeB!, "bc");
// 没有 linked[2] 索引器！
\`\`\`

#### List vs LinkedList 选型

| 操作 | List | LinkedList |
|------|------|------------|
| 索引访问 | O(1) | O(n) |
| 末尾 Add | O(1) 均摊 | O(1) |
| 头部插入 | O(n) | O(1) |
| CPU 缓存友好 | 是 | 否 |

### 五、排序集合

\`\`\`csharp
using System;
using System.Collections.Generic;

var sset = new SortedSet<int> { 5, 1, 3, 2, 4 };  // 自动排序
var sl = new SortedList<string, int> { ["banana"] = 2, ["apple"] = 1 };
\`\`\`

### 六、实战 demo：任务调度器

\`\`\`csharp
using System;
using System.Collections.Generic;

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
        Console.WriteLine(\$"[紧急] {urgent.Dequeue()}");
    else if (normal.Count > 0)
        Console.WriteLine(\$"[普通] {normal.Dequeue()}");
}

AddTask("清理日志", false);
AddTask("修复Bug", true);
RunNext();  // [紧急] 修复Bug
RunNext();  // [普通] 清理日志
\`\`\`

### 七、小结

- \`HashSet<T>\`：去重 + 集合运算（XxxWith 就地修改），O(1) Contains。
- \`Queue<T>\` FIFO：Enqueue/Dequeue/Peek；PriorityQueue（.NET 6+）按优先级出。
- \`Stack<T>\` LIFO：Push/Pop/Peek；括号匹配、DFS。
- \`LinkedList<T>\` 双向链表：O(1) 已知节点插入，但无索引且缓存不友好——90% 用 List。
- 选集合看：访问模式、是否去重、是否排序、插入位置。
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

\`IEnumerable<T>\` 是所有可 \`foreach\` 遍历集合的"最小公约数"。

\`\`\`csharp
// 核心接口定义（类型声明）
public interface IEnumerable<out T> : IEnumerable
{
    IEnumerator<T> GetEnumerator();
}

public interface IEnumerator<out T> : IDisposable
{
    T Current { get; }
    bool MoveNext();
}
\`\`\`

\`out T\` 表示协变：\`IEnumerable<string>\` 可直接赋给 \`IEnumerable<object>\`。

### 二、foreach 本质

\`foreach\` 是语法糖，展开为 GetEnumerator + MoveNext + Current：

\`\`\`csharp
using System;
using System.Collections.Generic;

var list = new List<int> { 1, 2, 3 };
// foreach (var x in list) Console.WriteLine(x);

// 编译器展开（简化版）
using var enumerator = list.GetEnumerator();
while (enumerator.MoveNext())
{
    var x = enumerator.Current;
    Console.WriteLine(x);
}
\`\`\`

### 三、yield return：编译器自动生成状态机

\`yield return\` 让你不用手写 IEnumerator，编译器自动生成状态机类。

#### demo 1：自然数无限序列

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

IEnumerable<int> Naturals()
{
    int n = 0;
    while (true)
    {
        n++;
        yield return n;  // 返回一个值，暂停在这里
    }
}

foreach (var n in Naturals().Take(5))
    Console.WriteLine(n);  // 1 2 3 4 5
\`\`\`

#### demo 2：筛选偶数

\`\`\`csharp
using System;
using System.Collections.Generic;

IEnumerable<int> Evens(IEnumerable<int> source)
{
    foreach (var n in source)
        if (n % 2 == 0)
            yield return n;
}
\`\`\`

#### yield break：提前终止

\`\`\`csharp
IEnumerable<int> TakeUntilNegative(IEnumerable<int> source)
{
    foreach (var n in source)
    {
        if (n < 0) yield break;
        yield return n;
    }
}
\`\`\`

### 四、延迟执行（核心特性）

**yield return 延迟执行原理：**
- 调用迭代器方法时，方法体**不执行**，只创建一个状态机对象
- 每次 MoveNext() 才执行到下一个 yield return，然后冻结所有局部变量状态
- 下次 MoveNext() 从冻结处恢复执行
- 遇到 yield break 或方法结束，MoveNext 返回 false

\`\`\`csharp
using System;
using System.Collections.Generic;

IEnumerable<int> BuildWithLog()
{
    Console.WriteLine("开始");
    yield return 1;
    Console.WriteLine("产生1后");
    yield return 2;
    Console.WriteLine("产生2后");
    yield return 3;
}

var seq = BuildWithLog();  // 方法体没执行！
Console.WriteLine("开始遍历");
foreach (var x in seq)
    Console.WriteLine(\$"收到{x}");
// 输出顺序：开始遍历 → 开始 → 收到1 → 产生1后 → 收到2 → ...
\`\`\`

#### 陷阱：多次遍历会重复执行

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

IEnumerable<int> GetRandom(int count)
{
    var rng = new Random();
    for (int i = 0; i < count; i++)
        yield return rng.Next(100);
}

var seq = GetRandom(3);
Console.WriteLine(string.Join(",", seq));  // 第一次：方法执行
Console.WriteLine(string.Join(",", seq));  // 第二次：重新执行！结果不同

// 解决：物化
var materialized = GetRandom(3).ToList();  // ToList() 立即执行
\`\`\`

### 五、自定义可迭代类

\`\`\`csharp
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

var r = new Range(1, 5);
foreach (var x in r) Console.WriteLine(x);  // 1 2 3 4 5
Console.WriteLine(r.Sum());  // 15

public class Range : IEnumerable<int>
{
    private readonly int _start, _end;
    public Range(int start, int end) { _start = start; _end = end; }

    public IEnumerator<int> GetEnumerator()
    {
        for (int i = _start; i <= _end; i++)
            yield return i;  // yield 自动实现迭代器
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}
\`\`\`

### 六、方法参数选 IEnumerable 还是 IList？

**优先选最通用的接口（依赖倒置原则）：**

| 参数类型 | 场景 |
|---------|------|
| \`IEnumerable<T>\` | 只需要遍历（默认选这个） |
| \`IReadOnlyList<T>\` | 需要按索引访问且不修改 |
| \`IList<T>\` | 需要索引 + 修改 |
| \`List<T>\` | 几乎不作参数（用接口） |

### 七、延迟 vs 立即执行

**延迟执行（返回 IEnumerable）：** Where、Select、OrderBy、Take、Skip、yield 方法
**立即执行（返回结果或集合）：** ToList、ToArray、Count、Sum、First、Any、All、foreach

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

var nums = new[] { 1, 2, 3, 4, 5 };
var query = nums
    .Where(n => { Console.WriteLine(\$"filter {n}"); return n > 2; })
    .Select(n => { Console.WriteLine(\$"select {n}"); return n * 10; });

Console.WriteLine("开始遍历");
foreach (var x in query) Console.WriteLine(\$"result {x}");
// 流式处理：filter1→filter2→filter3→select3→result30→filter4→...
// 一次遍历完成 filter+select，不需要中间集合
\`\`\`

### 八、实战 demo：分页迭代器

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

IEnumerable<User> LoadUsersPaged(int pageSize)
{
    int page = 0;
    while (true)
    {
        var batch = LoadFromDb(page, pageSize);
        if (batch.Count == 0) yield break;
        foreach (var u in batch) yield return u;
        page++;
    }
}

List<User> LoadFromDb(int page, int size)
{
    if (page >= 3) return new List<User>();
    return Enumerable.Range(page * size, size)
        .Select(i => new User(i + 1, \$"user{i + 1}"))
        .ToList();
}

// Take(5) 只取 5 条，只查 2 页数据库（不是全部查完！）
foreach (var u in LoadUsersPaged(3).Take(5))
    Console.WriteLine(\$"#{u.Id} {u.Name}");

public record User(int Id, string Name);
\`\`\`

### 九、实战 demo：斐波那契数列

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

IEnumerable<int> Fibonacci()
{
    int a = 0, b = 1;
    while (true)
    {
        yield return b;
        (a, b) = (b, a + b);
    }
}

foreach (var f in Fibonacci().Take(10))
    Console.Write(f + " ");
// 1 1 2 3 5 8 13 21 34 55
\`\`\`

### 十、小结

- \`IEnumerable<T>\` 是可 foreach 集合的最小接口；foreach 是 GetEnumerator+MoveNext+Current 的语法糖。
- \`yield return\` 让编译器生成状态机，不用手写 IEnumerator；\`yield break\` 提前结束。
- **延迟执行是核心：** 调用方法不执行，遍历才执行；每次遍历重新执行（多次枚举陷阱）；不想重复用 ToList()/ToArray() 物化。
- **yield 延迟执行原理：** 状态机模式——编译器生成隐藏类保存局部变量和执行位置，每次 MoveNext 恢复。
- 方法参数优先选 \`IEnumerable<T>\`（通用）。
- LINQ 分延迟（Where/Select/OrderBy）和立即（ToList/Count/First）两类。
- 迭代器支持流式处理、无限序列、按需消费——分页查询、大文件处理利器。
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

方法只能返回一个值，但经常需要返回多个值。元组就是轻量级"多值打包"方案，不需要专门定义类型。

C# 两套元组：
- \`Tuple<T1,T2>\`（旧）：引用类型，Item1/Item2 访问，过时不要用
- **\`ValueTuple\`（C# 7+ 新）**：值类型，(a,b) 语法，支持命名，性能好——新代码用这个

### 二、ValueTuple 基础

\`\`\`csharp
using System;

(int, string) t1 = (1, "hello");  // 显式类型
var t2 = (42, "world", 3.14);      // var 推断
var point = (3, 4);
Console.WriteLine(t1.Item1);  // 1（默认字段名）
Console.WriteLine(\$"({point.Item1}, {point.Item2})");  // (3, 4)
\`\`\`

ValueTuple 是 struct（值类型），栈分配无 GC 压力，性能好。

### 三、命名元组

给字段起有意义的名字（名字只在编译期存在，不影响性能）：

\`\`\`csharp
using System;

(int X, int Y) p1 = (3, 4);
Console.WriteLine(p1.X);  // 3（有意义的名字，不是 Item1）

var p2 = (X: 3, Y: 4);   // var + 右侧命名
var mixed = (Id: 1, "Alice", Age: 30);  // 混合命名
Console.WriteLine(mixed.Item2);  // Alice（没命名的用 Item2）
\`\`\`

### 四、元组解构

把元组拆开赋给多个变量：

\`\`\`csharp
using System;

var t = (Name: "Alice", Age: 30);
var (name, age) = t;         // var 解构
(string n, int a) = t;       // 显式类型解构
var (_, ageOnly) = t;        // _ 弃元：忽略不需要的字段
Console.WriteLine(\$"{name}, {age}");
\`\`\`

### 五、元组作返回值（最常用场景）

\`\`\`csharp
using System;

(int Min, int Max) FindMinMax(int[] nums)
{
    int min = nums[0], max = nums[0];
    foreach (var n in nums)
    {
        if (n < min) min = n;
        if (n > max) max = n;
    }
    return (min, max);
}

var result = FindMinMax(new[] { 3, 1, 4, 1, 5 });
Console.WriteLine(\$"Min={result.Min}, Max={result.Max}");

var (min, max) = FindMinMax(new[] { 7, 2, 8 });  // 解构调用
Console.WriteLine(\$"{min} ~ {max}");
\`\`\`

**元组比 out 参数优势：**
1. 支持 async（out 不能用于 async）
2. 支持链式调用
3. 可用于 LINQ 投影
4. 不需要预先声明变量

\`\`\`csharp
using System;

(bool Ok, int Value) TryParseInt(string s)
{
    if (int.TryParse(s, out var n)) return (true, n);
    return (false, 0);
}

var (ok, val) = TryParseInt("123");
if (ok) Console.WriteLine(val);
\`\`\`

### 六、元组作字典键（复合键）

ValueTuple 自动实现了基于值的 Equals/GetHashCode，天然适合做复合键：

\`\`\`csharp
using System;
using System.Collections.Generic;

var sessions = new Dictionary<(int userId, string deviceId), DateTime>
{
    [(1, "mobile")] = DateTime.Now,
    [(1, "web")] = DateTime.Now.AddMinutes(-5),
};

var key = (1, "web");
if (sessions.TryGetValue(key, out var lastSeen))
    Console.WriteLine(\$"用户{key.userId}最后在线：{lastSeen:HH:mm}");
\`\`\`

**反模式：字符串拼接做键**
\`\`\`csharp
// 差：拼接字符串容易出错、性能差、可能键冲突
var bad = new Dictionary<string, DateTime>();
bad["1|web"] = DateTime.Now;

// 好：元组类型安全、无拼接错误、自动 GetHashCode
var good = new Dictionary<(int, string), DateTime>();
good[(1, "web")] = DateTime.Now;
\`\`\`

### 七、弃元 _

\`_\` 表示"不关心这个值"：

\`\`\`csharp
using System;

var (name, _) = ("Alice", 30);  // 只要 name
_ = int.TryParse("abc", out _);  // 两个返回值都忽略
\`\`\`

### 八、元组比较（C# 7.3+）

ValueTuple 支持 == / !=，按值逐字段比较：

\`\`\`csharp
using System;

var a = (1, "hello");
var b = (1, "hello");
Console.WriteLine(a == b);  // True
var named = (X: 1, Y: 2);
var unnamed = (1, 2);
Console.WriteLine(named == unnamed);  // True（名字不影响相等性）
\`\`\`

### 九、元组与 LINQ

元组常用于 LINQ 投影和多字段排序：

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

var people = new[]
{
    new { Name = "Alice", Age = 30 },
    new { Name = "Bob", Age = 25 },
};

var tuples = people.Select(p => (p.Name, p.Age)).ToList();
var sorted = people.OrderBy(p => (p.Age, p.Name)).ToList(); // 多字段排序
\`\`\`

### 十、何时用元组 vs record vs class

| 方案 | 适用场景 |
|------|---------|
| **ValueTuple** | 临时使用、方法返回值、LINQ 投影、字典复合键、短生命周期、字段 ≤4-5 个 |
| **record** | 跨方法传递、领域模型/DTO、需要语义类型名、字段较多 |
| **class** | 可变对象、有行为/继承、复杂逻辑、长生命周期实体 |

**经验法则：** 临时打包用元组；字段超过 4-5 个或跨方法传递→升级成 record。

### 十一、实战 demo：统计分析

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

(decimal Mean, decimal Median, int Range) Analyze(IEnumerable<int> nums)
{
    var list = nums.ToList();
    var sorted = list.OrderBy(x => x).ToList();
    decimal mean = (decimal)list.Sum() / list.Count;
    decimal median = list.Count % 2 == 0
        ? (sorted[list.Count / 2 - 1] + sorted[list.Count / 2]) / 2m
        : sorted[list.Count / 2];
    int range = sorted.Max() - sorted.Min();
    return (mean, median, range);
}

var (m, med, r) = Analyze(new[] { 1, 2, 3, 4, 5, 6, 7 });
Console.WriteLine(\$"均值={m:F2}, 中位数={med}, 极差={r}");
// 均值=4.00, 中位数=4, 极差=6
\`\`\`

### 十二、小结

- 新代码一律用 **ValueTuple**（\`(T1, T2)\` 语法），值类型高性能。
- 命名元组提升可读性：\`(int X, int Y) p = (3, 4)\`，名字只在编译期存在。
- 解构 \`var (a, b) = t\` 优雅；弃元 \`_\` 跳过不需要的值。
- **元组作方法返回值**是最常用场景，比 out 参数灵活（支持 async、链式、LINQ）。
- **元组作字典复合键**安全高效，比字符串拼接好 10 倍。
- C# 7.3+ 支持 == / != 按值比较。
- 临时/短生命周期 → 元组；跨方法/多字段 → record；有行为/可变 → class。
`,
  },
];

export { chapters };
