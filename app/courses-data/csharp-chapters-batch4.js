// =============================================================
// C# 实战教程 - 第四批章节（第四部分 高级特性，共 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   csharp-ch13 : 第十三章 泛型——类型安全的复用
//   csharp-ch14 : 第十四章 委托、Lambda 与事件——函数式回调
//   csharp-ch15 : 第十五章 LINQ——查询的艺术
//   csharp-ch16 : 第十六章 异步编程——async/await 与 Task
//
// 风格：demo 驱动，每章直接上手写代码，多注释。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// 代码示例顺序：使用代码在前 → 类型声明在末尾（沙箱可运行）
// =============================================================

const chapters = [
  // ============================================================
  // 第十三章：泛型——类型安全的复用
  // ============================================================
  {
    id: 'csharp-ch13',
    group: '第四部分 高级特性',
    icon: '🧩',
    title: '泛型——类型安全的复用',
    content: `## 第十三章　泛型——类型安全的复用

泛型是 C# 的核心特性之一——一份代码适用多种类型，且编译期保证类型安全。日常开发中 \`List<T>\`、\`Dictionary<K,V>\` 都是泛型。这一章讲清楚泛型的概念、用法和实战模式。

### 一、为什么需要泛型

先看"没有泛型"的痛点。假设要写一个"栈"数据结构：

- 方案一：为每种类型写一个栈（\`IntStack\`、\`StringStack\`...）——代码重复。
- 方案二：用 \`object\`（统一类型）——类型不安全、有装箱开销。

\`\`\`csharp
// === object 方案的问题演示 ===
// ObjectStack 用 object 存任何类型，但取出时要强转，且会装箱
var s = new ObjectStack();
s.Push("hello");
string str = (string)s.Pop();  // 装箱 + 拆箱 + 类型转换
Console.WriteLine(str);  // hello

// 如果不小心存了 int 当 string 取，运行时崩溃
// s.Push(123);
// string str2 = (string)s.Pop();  // 运行时：InvalidCastException

// 类型声明在末尾
public class ObjectStack
{
    private object[] _items = new object[100];
    public void Push(object x) { /* 简化实现 */ }
    public object Pop() { return null!; }  // 简化实现
}
\`\`\`

\`object\` 方案有两个严重问题：

1. **类型不安全**：编译期无法发现"把 int 当 string"的错误。
2. **性能损失**：值类型要装箱（boxing）放进 object，取出时要拆箱（unboxing），产生额外内存分配和拷贝。

泛型（Generics）就是为了解决这两个问题而生的。

### 二、泛型类 ⭐

泛型类在类名后用 \`<T>\` 声明类型参数。下面写一个完整可运行的泛型栈：

\`\`\`csharp
// === 泛型栈的使用 ===
// int 栈：类型安全，无装箱
var intStack = new Stack<int>();
intStack.Push(1);
intStack.Push(2);
intStack.Push(3);
Console.WriteLine(intStack.Count);   // 3
Console.WriteLine(intStack.Pop());   // 3（后进先出）
Console.WriteLine(intStack.Peek());  // 2（看但不取）

// string 栈：同样的代码，不同类型
var strStack = new Stack<string>();
strStack.Push("hello");
strStack.Push("world");
Console.WriteLine(strStack.Pop());   // world

// var bad = new Stack<int>(); bad.Push("x");
// ↑ 编译错误：string 不是 int——这就是类型安全

// 泛型类声明在末尾
public class Stack<T>
{
    private T[] _items = new T[4];  // 用数组存储，初始容量 4
    public int Count { get; private set; }  // 元素数量（只读对外）

    public void Push(T item)
    {
        // 容量不够时翻倍扩容
        if (Count == _items.Length)
        {
            Array.Resize(ref _items, _items.Length * 2);
        }
        _items[Count++] = item;  // 存入并递增计数
    }

    public T Pop()
    {
        if (Count == 0)
            throw new InvalidOperationException("栈为空");
        T item = _items[--Count];  // 先递减再取
        _items[Count] = default(T)!;  // 清空引用，让 GC 回收
        return item;
    }

    public T Peek() => Count > 0
        ? _items[Count - 1]
        : throw new InvalidOperationException("栈为空");
}
\`\`\`

**\`T\` 是什么？**

\`T\` 是"类型参数"（type parameter）——一个占位符，等用户实例化时再确定具体类型。\`Stack<int>\` 中的 \`int\` 是"类型实参"。可以理解为：编译器会为每种值类型生成一份特化代码（避免装箱），引用类型共享一份代码。

**泛型命名约定：**

- 单参数：\`T\`（如 \`List<T>\`）
- 多参数：\`TKey\`、\`TValue\`（如 \`Dictionary<TKey, TValue>\`）
- 约束意义：\`TSource\`、\`TResult\`（如 LINQ 的 \`Select<T, TResult>\`）

### 三、泛型方法

方法也可以是泛型，类型参数写在方法名后。调用时一般可以省略类型参数，编译器根据实参推断：

\`\`\`csharp
// === 泛型方法使用 ===
var arr = new[] { 1, 2, 3, 4 };
var reversed = Reverse(arr);  // 推断为 int[]
Console.WriteLine(string.Join(",", reversed));  // 4,3,2,1

// 多类型参数：把两个序列配对成字典
var d = ToDict(new[] { "a", "b" }, new[] { 1, 2 });
foreach (var kv in d)
    Console.WriteLine($"{kv.Key}={kv.Value}");  // a=1, b=2

// 泛型方法（放在静态类里，声明在末尾）
public static class ArrayUtil
{
    // 泛型方法：反转数组
    public static T[] Reverse<T>(T[] source)
    {
        T[] result = new T[source.Length];
        for (int i = 0; i < source.Length; i++)
            result[i] = source[source.Length - 1 - i];
        return result;
    }

    // 多类型参数：keys + values → Dictionary
    public static Dictionary<TKey, TValue> ToDict<TKey, TValue>(
        IEnumerable<TKey> keys, IEnumerable<TValue> values)
    {
        var dict = new Dictionary<TKey, TValue>();
        using var ek = keys.GetEnumerator();
        using var ev = values.GetEnumerator();
        while (ek.MoveNext() && ev.MoveNext())
            dict[ek.Current] = ev.Current;
        return dict;
    }
}
\`\`\`

### 四、泛型接口

接口也可以是泛型。.NET BCL 里有大量泛型接口（\`IComparable<T>\`、\`IEnumerable<T>\`、\`IList<T>\` 等）。下面演示如何自定义泛型接口并实现：

\`\`\`csharp
// === 使用泛型接口 ===
var repo = new InMemoryRepository<User>();
repo.Add(new User { Name = "张三" });
repo.Add(new User { Name = "李四" });

foreach (var u in repo.FindAll())
    Console.WriteLine($"{u.Id} - {u.Name}");  // 1-张三, 2-李四

var found = repo.Find(1);
if (found != null)
{
    found.Name = "张三丰";
    repo.Update(found);
}
Console.WriteLine(repo.Find(1)?.Name);  // 张三丰

// 接口与类声明在末尾
public interface IEntity { int Id { get; set; } }

public interface IRepository<T> where T : IEntity
{
    T? Find(int id);
    IEnumerable<T> FindAll();
    void Add(T entity);
    void Update(T entity);
    void Delete(int id);
}

public class User : IEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}

public class InMemoryRepository<T> : IRepository<T>
    where T : class, IEntity, new()  // 约束：引用类型 + 实现 IEntity + 有无参构造
{
    private readonly Dictionary<int, T> _store = new();
    private int _nextId = 1;

    public T? Find(int id) => _store.TryGetValue(id, out var e) ? e : null;
    public IEnumerable<T> FindAll() => _store.Values;
    public void Add(T entity)
    {
        entity.Id = _nextId++;
        _store[entity.Id] = entity;
    }
    public void Update(T entity) => _store[entity.Id] = entity;
    public void Delete(int id) => _store.Remove(id);
}
\`\`\`

**非泛型 vs 泛型接口：**

- 非泛型 \`IEnumerable\`：基于 \`object\`，需装箱/拆箱。
- 泛型 \`IEnumerable<T>\`：类型安全、无装箱。

新代码都应优先使用泛型版本。

### 五、泛型委托

委托也可以是泛型，.NET 内置三个最常用的，几乎不需要自定义：

\`\`\`csharp
// === 内置泛型委托的使用 ===
// Action：无返回值
Action<string> log = msg => Console.WriteLine($"[LOG] {msg}");
log("hello");

Action<int, int> printSum = (a, b) => Console.WriteLine(a + b);
printSum(3, 5);

// Func：有返回值（最后一个类型参数是返回类型）
Func<int, int, int> add = (a, b) => a + b;
Console.WriteLine(add(3, 5));  // 8

Func<int, bool> isEven = n => n % 2 == 0;
Console.WriteLine(isEven(4));  // True

// Predicate：返回 bool（等价于 Func<T, bool>）
Predicate<int> isPositive = n => n > 0;
Console.WriteLine(isPositive(5));  // True
\`\`\`

> ⭐ 实际开发中几乎不需要自定义泛型委托——\`Action\` 和 \`Func\` 已经覆盖绝大多数场景。

### 六、类型约束：where ⭐

泛型默认可以填**任何类型**，但有时需要约束——比如"必须是引用类型"、"必须有无参构造"、"必须实现某个接口"。

\`\`\`csharp
// === 类型约束演示 ===
var userRepo = new Repository<User>();
var u = userRepo.Create();  // 因为约束了 new()，所以可以 new
Console.WriteLine(userRepo.GetId(u));  // 0

// 类型声明在末尾
public interface IEntity { int Id { get; } }

public class User : IEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}

public class Repository<T> where T : class, IEntity, new()
{
    // where T : struct        —— 值类型
    // where T : class         —— 引用类型
    // where T : class?        —— 可空引用类型
    // where T : new()         —— 有无参 public 构造函数
    // where T : IEntity       —— 实现 IEntity 接口
    // where T : BaseClass     —— 继承 BaseClass
    // where T : notnull       —— 不可空（C# 8+）

    public T Create() => new T();   // 因为约束了 new()，所以可以 new
    public int GetId(T entity) => entity.Id;  // 因为约束了 IEntity
}
\`\`\`

约束让泛型方法可以使用约束类型的成员（如 \`entity.Id\`），否则编译器只知道 \`T\` 是 \`object\`，访问不了任何属性。

### 七、泛型类型推断

C# 编译器可以根据方法实参推断类型参数：

\`\`\`csharp
// === 类型推断演示 ===
// Max 方法约束了 T : IComparable<T>，所以能用 CompareTo
int m1 = Max(3, 5);          // 推断为 int
string s = Max("apple", "banana");  // 推断为 string
Console.WriteLine(m1);       // 5
Console.WriteLine(s);        // banana

// 本地函数（顶级语句中可以直接定义函数）
int Max<T>(T a, T b) where T : IComparable<T>
    => a.CompareTo(b) >= 0 ? a : b;
\`\`\`

有时无法推断（如返回类型不参与推断），需要显式写出类型参数：

\`\`\`csharp
// 显式写出类型参数
var nums = new[] { 1, 2, 3 };
// Select 的 TResult 无法从 source 推断，需要显式
var names = nums.Select<int, string>(n => $"数字{n}");
foreach (var name in names) Console.WriteLine(name);
// 数字1, 数字2, 数字3

// 简化的 Select 实现（演示用）
public static IEnumerable<TResult> Select<TSource, TResult>(
    IEnumerable<TSource> source, Func<TSource, TResult> selector)
{
    foreach (var item in source)
        yield return selector(item);
}
\`\`\`

### 八、协变（out）与逆变（in）

泛型类型参数默认"不变"——\`IEnumerable<Dog>\` 不能赋给 \`IEnumerable<Animal>\`，即使 Dog 是 Animal 的子类。这是因为类型安全无法同时保证读和写两个方向：

- 读场景：\`IEnumerable<Dog>\` → \`IEnumerable<Animal>\` 安全（拿到的是 Dog，可以当 Animal 用）。
- 写场景：\`IList<Animal>\` → \`IList<Dog>\` 不安全（可能写入了 Cat）。

C# 用 \`out\` 和 \`in\` 显式标注方向：

- \`out T\`（协变）：只能用作输出（返回值/属性 get），不能用作输入（参数）。
- \`in T\`（逆变）：只能用作输入，不能用作输出。

\`\`\`csharp
// === 协变（out）演示 ===
// IEnumerable<out T>：T 只能用作返回值
var dogs = new List<Dog> { new Dog(), new Dog() };
IEnumerable<Animal> animals = dogs;  // OK：协变，Dog → Animal

// === 逆变（in）演示 ===
// IComparer<in T>：T 只能用作参数
IComparer<Animal> animalComparer = Comparer<Animal>.Default;
IComparer<Dog> dogComparer = animalComparer;  // OK：逆变，Animal → Dog

// 类型声明在末尾
public class Animal { }
public class Dog : Animal { }
\`\`\`

**记忆口诀：**

- \`out\` = 输出 = 协变 = 子→父（\`IEnumerable<Dog>\` → \`IEnumerable<Animal>\`）
- \`in\` = 输入 = 逆变 = 父→子（\`IComparer<Animal>\` → \`IComparer<Dog>\`）

业务代码很少自己写协变/逆变，但理解了能读懂 .NET BCL 的接口设计。

### 九、泛型缓存（静态字段）

泛型类的静态字段是**每个类型参数一份**的——可以用来做"按类型缓存"：

\`\`\`csharp
// === 泛型静态字段：每个 T 一份 ===
TypeCache<int>.Counter++;
TypeCache<int>.Counter++;
TypeCache<string>.Counter++;

Console.WriteLine(TypeCache<int>.Counter);     // 2
Console.WriteLine(TypeCache<string>.Counter);   // 1
Console.WriteLine(TypeCache<int>.CreatedAt);    // 创建时间

// 类型声明在末尾
public class TypeCache<T>
{
    public static int Counter = 0;  // 每种 T 一份
    public static DateTime CreatedAt = DateTime.Now;
}
\`\`\`

这个特性被广泛用于：

- **对象池**：\`ObjectPool<T>\` 每种类型一个池。
- **单例**：\`Singleton<T>\` 每种类型一个实例。
- **类型元数据缓存**：反射信息缓存，避免重复计算。

### 十、实战 demo：泛型仓储

把本章学的综合起来，写一个完整的泛型仓储模式（业务开发常见）：

\`\`\`csharp
// === 泛型仓储使用 ===
var userRepo = new InMemoryRepository<User>();
userRepo.Add(new User { Name = "张三" });
userRepo.Add(new User { Name = "李四" });
userRepo.Add(new User { Name = "王五" });

Console.WriteLine($"共 {userRepo.FindAll().Count()} 个用户");
foreach (var u in userRepo.FindAll())
    Console.WriteLine($"  {u.Id} - {u.Name}");

// 更新
var first = userRepo.Find(1);
if (first != null)
{
    first.Name = "张三丰";
    userRepo.Update(first);
}
Console.WriteLine($"更新后：{userRepo.Find(1)?.Name}");

// 删除
userRepo.Delete(2);
Console.WriteLine($"删除后剩 {userRepo.FindAll().Count()} 个");

// 类型声明在末尾
public interface IEntity { int Id { get; set; } }

public interface IRepository<T> where T : IEntity
{
    T? Find(int id);
    IEnumerable<T> FindAll();
    void Add(T entity);
    void Update(T entity);
    void Delete(int id);
}

public class User : IEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}

public class InMemoryRepository<T> : IRepository<T>
    where T : class, IEntity, new()
{
    private readonly Dictionary<int, T> _store = new();
    private int _nextId = 1;

    public T? Find(int id) => _store.TryGetValue(id, out var e) ? e : null;
    public IEnumerable<T> FindAll() => _store.Values;
    public void Add(T entity)
    {
        entity.Id = _nextId++;
        _store[entity.Id] = entity;
    }
    public void Update(T entity) => _store[entity.Id] = entity;
    public void Delete(int id) => _store.Remove(id);
}
\`\`\`

这个例子综合了：泛型类、泛型接口、泛型约束（\`class, IEntity, new()\`）、面向接口编程。

### 十一、本章小结

- ⭐ 泛型解决"类型安全 + 复用"的矛盾：一份代码适用多种类型，且编译期保证类型安全。
- ⭐ 泛型可应用于类、方法、接口、委托。
- ⭐ \`where\` 关键字约束类型参数（\`struct\`/\`class\`/\`new()\`/接口/基类）。
- \`out\` 协变 / \`in\` 逆变让泛型反映继承关系，常用于接口设计。
- 泛型静态字段"按类型一份"是高级但实用的特性。
- 实战场景：泛型集合（\`List<T>\`, \`Dictionary<K,V>\`）、泛型仓储、泛型工厂、泛型缓存。

下一章讲委托、Lambda 与事件——C# 函数式编程的基础。`,
  },

  // ============================================================
  // 第十四章：委托、Lambda 与事件——函数式回调
  // ============================================================
  {
    id: 'csharp-ch14',
    group: '第四部分 高级特性',
    icon: '📡',
    title: '委托、Lambda 与事件——函数式回调',
    content: `## 第十四章　委托、Lambda 与事件——函数式回调

编程中经常遇到"某个时机要执行某段代码"的场景——按钮点击、数据加载完成、温度变化。C# 用**委托**（delegate）和**事件**（event）实现回调机制。这一章讲清楚委托、Lambda、事件三大核心。

### 一、委托：方法的类型 ⭐

委托本质是"方法的类型签名"。声明委托就像声明一个"方法类型"，把方法当数据用——这是函数式编程的基础。

\`\`\`csharp
// === 自定义委托使用 ===
MathOp op = Calculator.Add;       // 把方法赋给委托
Console.WriteLine(op(3, 5));       // 8

op = Calculator.Subtract;          // 换一个方法
Console.WriteLine(op(3, 5));       // -2

op = Calculator.Multiply;
Console.WriteLine(op(3, 5));       // 15

// 类型声明在末尾
public delegate int MathOp(int a, int b);

public class Calculator
{
    public static int Add(int a, int b) => a + b;
    public static int Subtract(int a, int b) => a - b;
    public static int Multiply(int a, int b) => a * b;
}
\`\`\`

**委托变量就是一个"方法的引用"**，可以赋值、传递、调用。

### 二、Action 与 Func：内置泛型委托 ⭐

C# 内置了两个常用泛型委托，覆盖绝大多数场景，几乎不需要自定义：

- \`Action\`：无返回值。\`Action\`、\`Action<T>\`、\`Action<T1,T2>\` ...（最多 16 个参数）。
- \`Func\`：有返回值。\`Func<TResult>\`、\`Func<T, TResult>\`、\`Func<T1, T2, TResult>\` ...（最后一个类型参数是返回类型）。

\`\`\`csharp
// === Action：无返回值 ===
Action<string> log = msg => Console.WriteLine($"[LOG] {msg}");
log("hello");  // [LOG] hello

Action<int, int> printSum = (a, b) => Console.WriteLine(a + b);
printSum(3, 5);  // 8

// === Func：有返回值 ===
Func<int, int, int> add = (a, b) => a + b;
Console.WriteLine(add(3, 5));  // 8

Func<int, bool> isEven = n => n % 2 == 0;
Console.WriteLine(isEven(4));  // True

Func<string> getTimestamp = () => DateTime.Now.ToString("HH:mm:ss");
Console.WriteLine(getTimestamp());
\`\`\`

> ⭐ **注意 Func 的参数顺序**：最后一个类型参数是返回类型。如 \`Func<int, string>\` 是"接收 int，返回 string"。

### 三、Lambda 表达式 ⭐

Lambda 是声明委托变量的最简洁语法。\`=>\` 读作"映射到"。

\`\`\`csharp
// === Lambda 的几种形式 ===

// 完整形式（带类型、带 return）
Func<int, int> square1 = (int x) => { return x * x; };

// 类型推断（推荐）
Func<int, int> square2 = (x) => x * x;

// 单参数省略括号
Func<int, int> square3 = x => x * x;

// 无参数
Func<int> getDefault = () => 42;

// 多语句
Func<int, int> factorial = n =>
{
    int result = 1;
    for (int i = 2; i <= n; i++) result *= i;
    return result;
};

Console.WriteLine(square3(5));      // 25
Console.WriteLine(factorial(5));    // 120
\`\`\`

#### 闭包（Closure）：捕获外部变量

Lambda 可以捕获外部变量，这是函数式编程的精髓：

\`\`\`csharp
// === 闭包演示 ===
int multiplier = 10;
Func<int, int> scale = x => x * multiplier;
Console.WriteLine(scale(5));  // 50

multiplier = 100;  // 改外部变量
Console.WriteLine(scale(5));  // 500 —— 捕获的是变量本身，不是值快照
\`\`\`

#### ⚠️ 循环捕获的陷阱

\`\`\`csharp
// === 错误：所有 Lambda 捕获同一个 i ===
var actions = new List<Action>();
for (int i = 0; i < 3; i++)
{
    actions.Add(() => Console.WriteLine(i));
}
foreach (var a in actions) a();
// 输出：3 3 3 —— 全部打印 3，因为循环结束 i = 3

// === 正确：在循环内创建局部变量 ===
var actions2 = new List<Action>();
for (int i = 0; i < 3; i++)
{
    int local = i;  // 每次循环新的变量
    actions2.Add(() => Console.WriteLine(local));
}
foreach (var a in actions2) a();
// 输出：0 1 2
\`\`\`

### 四、多播委托（MulticastDelegate）

委托可以 \`+\` 组合多个方法，调用时全部依次执行：

\`\`\`csharp
// === 多播委托 ===
Action<string> log = msg => Console.WriteLine($"[Console] {msg}");
log += msg => Console.WriteLine($"[File] {msg} log appended");
log += msg => Console.WriteLine($"[DB] {msg} saved");

log("hello");
// [Console] hello
// [File] hello log appended
// [DB] hello saved
\`\`\`

**注意：** Lambda 表达式每次创建都是新实例，\`-=\` 不能移除 Lambda。要正确移除，需要把方法保存为命名方法或委托变量：

\`\`\`csharp
// === 正确移除多播委托 ===
void FileLog(string msg) => Console.WriteLine($"[File] {msg}");

Action<string> log = Console.WriteLine;
log += FileLog;  // 命名方法
log("hello");
// hello
// [File] hello

log -= FileLog;  // 可以正确移除
log("world");
// world
\`\`\`

多播委托的返回值：返回类型不为 void 时，多播只返回**最后一个**方法的结果，前面的被丢弃。所以多播一般用 \`void\` 或 \`event\`。

### 五、事件（event）：发布订阅模式 ⭐

事件是委托的"安全封装"。直接暴露委托字段有问题：外部可以随便改、可以清空、可以伪造调用。事件关键字 \`event\` 限制了外部只能 \`+=\` 和 \`-=\`，不能直接赋值或调用。

\`\`\`csharp
// === 事件使用 ===
var btn = new Button();
btn.Clicked += () => Console.WriteLine("处理1：响应点击");
btn.Clicked += () => Console.WriteLine("处理2：记录日志");
btn.ClickedDetailed += (sender, e) =>
    Console.WriteLine($"点击坐标 ({e.X}, {e.Y})");

btn.SimulateClick();
// 按钮被点击
// 处理1：响应点击
// 处理2：记录日志
// 点击坐标 (100, 200)

// btn.Clicked = null;  // 编译错误：事件不能在外部赋值
// btn.Clicked();       // 编译错误：事件不能在外部触发

// 类型声明在末尾
public class Button
{
    // 1. 声明事件
    public event Action? Clicked;

    // 带 EventArgs 的标准事件
    public event EventHandler<ClickEventArgs>? ClickedDetailed;

    public void SimulateClick()
    {
        Console.WriteLine("按钮被点击");
        Clicked?.Invoke();  // 触发事件（注意 null 检查）
        ClickedDetailed?.Invoke(this, new ClickEventArgs { X = 100, Y = 200 });
    }
}

public class ClickEventArgs : EventArgs
{
    public int X { get; set; }
    public int Y { get; set; }
}
\`\`\`

**事件 vs 委托字段的对比：**

| 维度 | 委托字段 | event |
|------|---------|-------|
| 外部赋值 | 可以（会覆盖订阅者） | 不可以 |
| 外部调用 | 可以 | 不可以 |
| 外部 += / -= | 可以 | 可以 |
| 类内部触发 | 任意位置 | 任意位置 |
| 类似于 | public 字段 | 属性（封装字段） |

### 六、事件的标准模式 ⭐

.NET 的事件设计有标准约定，下面是一个完整的"温度变化"事件示例：

\`\`\`csharp
// === 标准事件模式使用 ===
var t = new Thermometer();
t.TemperatureChanged += (sender, e) =>
    Console.WriteLine($"温度变化：{e.OldValue} → {e.NewValue}");

t.Temperature = 25.5m;
t.Temperature = 30.0m;
// 温度变化：0 → 25.5
// 温度变化：25.5 → 30.0

// 类型声明在末尾
public class TemperatureChangedEventArgs : EventArgs
{
    public decimal OldValue { get; }
    public decimal NewValue { get; }
    public TemperatureChangedEventArgs(decimal old, decimal @new)
    {
        OldValue = old;
        NewValue = @new;
    }
}

public class Thermometer
{
    private decimal _temp;
    public decimal Temperature
    {
        get => _temp;
        set
        {
            if (_temp != value)
            {
                var old = _temp;
                _temp = value;
                OnTemperatureChanged(new TemperatureChangedEventArgs(old, value));
            }
        }
    }

    public event EventHandler<TemperatureChangedEventArgs>? TemperatureChanged;

    // protected virtual 让子类可改写
    protected virtual void OnTemperatureChanged(TemperatureChangedEventArgs e)
    {
        TemperatureChanged?.Invoke(this, e);
    }
}
\`\`\`

**事件标准模式的要点：**

1. 事件参数继承 \`EventArgs\`，命名以 \`EventArgs\` 结尾。
2. 事件类型用 \`EventHandler<TArgs>\`。
3. 触发方法用 \`protected virtual\`，命名以 \`On\` 开头。

### 七、高阶函数：函数作为参数

接收函数作为参数或返回函数的方法叫"高阶函数"——这是 LINQ 的核心思路：

\`\`\`csharp
// === 自己实现 LINQ 的核心方法 ===
var nums = new[] { 1, 2, 3, 4, 5, 6 };
var evens = MyWhere(nums, n => n % 2 == 0);       // 过滤偶数
var squares = MySelect(evens, n => n * n);          // 平方
var sum = MyAggregate(squares, (a, b) => a + b);    // 求和

Console.WriteLine(sum);  // 4 + 16 + 36 = 56

// 高阶函数实现（静态类放末尾）
public static class EnumerableExt
{
    public static IEnumerable<T> MyWhere<T>(IEnumerable<T> source, Func<T, bool> predicate)
    {
        foreach (var item in source)
            if (predicate(item))
                yield return item;
    }

    public static IEnumerable<TResult> MySelect<T, TResult>(
        IEnumerable<T> source, Func<T, TResult> selector)
    {
        foreach (var item in source)
            yield return selector(item);
    }

    public static T MyAggregate<T>(IEnumerable<T> source, Func<T, T, T> func)
    {
        using var e = source.GetEnumerator();
        if (!e.MoveNext()) throw new InvalidOperationException();
        T result = e.Current;
        while (e.MoveNext()) result = func(result, e.Current);
        return result;
    }
}
\`\`\`

这就是 LINQ 的核心实现思路——把"对集合的操作"拆成一组高阶函数，每个接受一个函数参数。

### 八、实战 demo：策略模式

策略模式用委托实现，比继承更灵活：

\`\`\`csharp
// === 策略模式：动态切换折扣策略 ===
var calc = new PriceCalculator();

// 满 100 打 9 折
calc.DiscountStrategy = price => price > 100 ? price * 0.1m : 0;
Console.WriteLine(calc.Calculate(150));  // 135（150 - 15）
Console.WriteLine(calc.Calculate(80));   // 80（不满 100，无折扣）

// 一律 8 折
calc.DiscountStrategy = price => price * 0.2m;
Console.WriteLine(calc.Calculate(150));  // 120（150 - 30）

// 类型声明在末尾
public class PriceCalculator
{
    public Func<decimal, decimal> DiscountStrategy { get; set; } = _ => 0;

    public decimal Calculate(decimal price)
    {
        var discount = DiscountStrategy(price);
        return price - discount;
    }
}
\`\`\`

### 九、实战 demo：事件总线（发布订阅解耦）

事件总线是解耦系统组件的常用模式——发布者只管发，订阅者只管收，互不感知：

\`\`\`csharp
// === 事件总线使用 ===
var bus = new EventBus();
bus.Subscribe("user.created", u => Console.WriteLine($"[邮件] 欢迎新用户 {u}"));
bus.Subscribe("user.created", u => Console.WriteLine($"[分析] 记录用户注册事件 {u}"));
bus.Subscribe("order.paid", o => Console.WriteLine($"[库存] 扣减库存: {o}"));

bus.Publish("user.created", "张三");
// [邮件] 欢迎新用户 张三
// [分析] 记录用户注册事件 张三

bus.Publish("order.paid", "订单 #1001");
// [库存] 扣减库存: 订单 #1001

// 类型声明在末尾
public class EventBus
{
    private readonly Dictionary<string, List<Action<object>>> _handlers = new();

    public void Subscribe(string topic, Action<object> handler)
    {
        if (!_handlers.TryGetValue(topic, out var list))
        {
            list = new List<Action<object>>();
            _handlers[topic] = list;
        }
        list.Add(handler);
    }

    public void Publish(string topic, object payload)
    {
        if (_handlers.TryGetValue(topic, out var list))
        {
            foreach (var h in list)
            {
                try { h(payload); }
                catch (Exception ex) { Console.WriteLine($"处理失败: {ex.Message}"); }
            }
        }
    }
}
\`\`\`

### 十、委托的演变：从 delegate 到 Lambda

C# 经历了几个阶段，理解演变有助于看懂老代码：

\`\`\`csharp
// C# 1.0：命名方法
int Square(int x) => x * x;
Func<int, int> f1 = Square;

// C# 2.0：匿名方法（已不推荐）
Func<int, int> f2 = delegate(int x) { return x * x; };

// C# 3.0：Lambda 表达式（推荐）⭐
Func<int, int> f3 = x => x * x;

// 输出对比
Console.WriteLine(f1(5));  // 25
Console.WriteLine(f2(5));  // 25
Console.WriteLine(f3(5));  // 25
\`\`\`

**本地函数 vs Lambda 的选择：**

- 一次性使用、传递给高阶函数：Lambda 更简洁。
- 多处复用、需要递归、需要参数校验：本地函数更清晰、性能更好（不需要捕获闭包）。

### 十一、本章小结

- ⭐ 委托是"方法的类型"，让方法可以像数据一样传递。
- ⭐ \`Action\`（无返回）和 \`Func\`（有返回）是内置泛型委托，覆盖绝大多数场景。
- ⭐ Lambda 表达式（\`x => x * x\`）是声明委托变量的最简洁语法。
- 闭包让 Lambda 捕获外部变量——但要注意循环捕获的陷阱。
- 多播委托用 \`+\` / \`+=\` 组合多个方法。
- ⭐ 事件（\`event\`）是委托的安全封装：外部只能 \`+=\` / \`-=\`，不能赋值或触发。
- 事件标准模式：\`EventArgs\` + \`EventHandler<T>\` + \`protected virtual OnXxx\`。
- 实战模式：高阶函数、策略模式、事件总线。

下一章讲 LINQ——C# 查询数据的优雅语法。`,
  },

  // ============================================================
  // 第十五章：LINQ——查询的艺术
  // ============================================================
  {
    id: 'csharp-ch15',
    group: '第四部分 高级特性',
    icon: '🔗',
    title: 'LINQ——查询的艺术',
    content: `## 第十五章　LINQ——查询的艺术

LINQ（Language Integrated Query，语言集成查询）是 C# 3.0 引入的特性，让"查询数据"成为语言一等公民。一句话概括：**用统一的语法查询任何可枚举的数据源**。这一章是日常开发最常用的高级特性。

### 一、LINQ 是什么 ⭐

\`\`\`csharp
// === LINQ 一览 ===
// 查询数组
var nums = new[] { 1, 2, 3, 4, 5, 6 };
var evens = nums.Where(n => n % 2 == 0);
Console.WriteLine(string.Join(",", evens));  // 2,4,6

// 查询匿名对象集合
var users = new[]
{
    new { Name = "张三", Age = 25 },
    new { Name = "李四", Age = 17 },
    new { Name = "王五", Age = 30 }
};
var adults = users.Where(u => u.Age >= 18)
                  .OrderBy(u => u.Name)
                  .Select(u => u.Name);
foreach (var name in adults)
    Console.WriteLine(name);  // 张三, 王五
\`\`\`

**LINQ 的两大优势：**

1. **统一语法**：对象、数据库、XML、JSON 都用同样的查询方式。
2. **类型安全**：编译期检查，重构友好，不是字符串 SQL。

### 二、两种语法：方法语法与查询表达式

LINQ 有两种写法，等价但风格不同。

\`\`\`csharp
// 准备数据
var users = new[]
{
    new { Name = "张三", Age = 25 },
    new { Name = "李四", Age = 30 },
    new { Name = "王五", Age = 17 }
};

// 方法语法（Fluent API，推荐）⭐
var result1 = users
    .Where(u => u.Age >= 18)
    .OrderBy(u => u.Name)
    .Select(u => u.Name);

// 查询表达式（Query Expression）
var result2 = from u in users
              where u.Age >= 18
              orderby u.Name
              select u.Name;

// 两种语法完全等价
Console.WriteLine(string.Join(",", result1));  // 张三,王五
Console.WriteLine(string.Join(",", result2));  // 张三,王五
\`\`\`

**实际开发中方法语法更常见**（IDE 提示更友好，链式调用更直观），查询表达式在复杂 join/group 时偶尔更易读。

### 三、常用 LINQ 操作符 ⭐

#### 1. 过滤：Where

\`\`\`csharp
var nums = new[] { 1, 2, 3, 4, 5, 6 };
var evens = nums.Where(n => n % 2 == 0);  // 2, 4, 6

// 带索引的 Where（第二个参数是索引）
var evenIndex = nums.Where((n, i) => i % 2 == 0);  // 1, 3, 5
\`\`\`

#### 2. 投影：Select

\`\`\`csharp
var users = new[]
{
    new { Name = "张三", Age = 25 },
    new { Name = "李四", Age = 30 }
};

// 投影到单个字段
var names = users.Select(u => u.Name);  // "张三", "李四"

// 投影到新对象
var dtos = users.Select(u => new { u.Name, IsAdult = u.Age >= 18 });

// SelectMany：把嵌套集合"摊平"
var orders = new[]
{
    new { Customer = "A", Items = new[] { "item1", "item2" } },
    new { Customer = "B", Items = new[] { "item3" } }
};
var allItems = orders.SelectMany(o => o.Items);  // item1, item2, item3
Console.WriteLine(string.Join(",", allItems));
\`\`\`

#### 3. 排序：OrderBy / ThenBy

\`\`\`csharp
var users = new[]
{
    new { Name = "张三", Age = 25 },
    new { Name = "李四", Age = 30 },
    new { Name = "王五", Age = 25 }
};

// 多字段排序
var sorted = users
    .OrderBy(u => u.Age)           // 主排序（升序）
    .ThenBy(u => u.Name);          // 次排序

// 降序
var desc = users
    .OrderByDescending(u => u.Age)
    .ThenByDescending(u => u.Name);

foreach (var u in sorted)
    Console.WriteLine($"{u.Age} {u.Name}");
// 25 张三
// 25 王五
// 30 李四

// Reverse：反转
var nums = new[] { 1, 2, 3 };
var reversed = nums.Reverse();
\`\`\`

#### 4. 聚合：Count, Sum, Average, Min, Max, Aggregate

\`\`\`csharp
var nums = new[] { 1, 2, 3, 4, 5 };

Console.WriteLine(nums.Count());   // 5
Console.WriteLine(nums.Sum());    // 15
Console.WriteLine(nums.Average()); // 3
Console.WriteLine(nums.Min());    // 1
Console.WriteLine(nums.Max());    // 5

// Aggregate：自定义聚合
var product = nums.Aggregate((a, b) => a * b);  // 120（5! = 1*2*3*4*5）
Console.WriteLine(product);

// 带种子的 Aggregate
var sum = nums.Aggregate(10, (acc, n) => acc + n);  // 25（10+1+2+3+4+5）
Console.WriteLine(sum);

// 字符串拼接
var words = new[] { "Hello", "World", "LINQ" };
var sentence = words.Aggregate((a, b) => $"{a} {b}");
Console.WriteLine(sentence);  // Hello World LINQ
\`\`\`

#### 5. 分组：GroupBy ⭐

\`\`\`csharp
var users = new[]
{
    new { Name = "张三", Dept = "工程", Age = 25 },
    new { Name = "李四", Dept = "工程", Age = 30 },
    new { Name = "王五", Dept = "市场", Age = 28 },
    new { Name = "赵六", Dept = "市场", Age = 22 }
};

// 按部门分组
var byDept = users.GroupBy(u => u.Dept);
foreach (var g in byDept)
{
    Console.WriteLine($"\\"{g.Key}\\" 部门 {g.Count()} 人");
    foreach (var u in g)
        Console.WriteLine($"  - {u.Name} ({u.Age})");
}
// "工程" 部门 2 人
//   - 张三 (25)
//   - 李四 (30)
// "市场" 部门 2 人
//   - 王五 (28)
//   - 赵六 (22)

// 分组后投影统计
var stats = users.GroupBy(u => u.Dept)
    .Select(g => new
    {
        Dept = g.Key,
        Count = g.Count(),
        AvgAge = g.Average(u => u.Age),
        Names = string.Join(", ", g.Select(u => u.Name))
    });

foreach (var s in stats)
    Console.WriteLine($"{s.Dept}: {s.Count} 人, 平均 {s.AvgAge:F1}, [{s.Names}]");
\`\`\`

#### 6. 连接：Join / GroupJoin

\`\`\`csharp
// === Join（类似 SQL INNER JOIN）===
var users = new[]
{
    new { Id = 1, Name = "张三" },
    new { Id = 2, Name = "李四" }
};
var orders = new[]
{
    new { Id = 101, UserId = 1, Amount = 100 },
    new { Id = 102, UserId = 1, Amount = 200 },
    new { Id = 103, UserId = 2, Amount = 50 }
};

var userOrders = users.Join(orders,
    u => u.Id,           // 外部键选择器
    o => o.UserId,       // 内部键选择器
    (u, o) => new { u.Name, o.Id, o.Amount });

foreach (var x in userOrders)
    Console.WriteLine($"{x.Name}: 订单 {x.Id} = {x.Amount}");
// 张三: 订单 101 = 100
// 张三: 订单 102 = 200
// 李四: 订单 103 = 50
\`\`\`

#### 7. 去重 / 分页：Distinct / Take / Skip

\`\`\`csharp
var nums = new[] { 1, 2, 2, 3, 3, 3, 4 };
var distinct = nums.Distinct();  // 1, 2, 3, 4
Console.WriteLine(string.Join(",", distinct));

// 分页：跳过前 10 条，取 10 条
var page2 = nums.Skip(10).Take(10);

// 前 N 个
var first3 = nums.Take(3);  // 1, 2, 2

// 跳过直到条件不满足
var skipWhile = nums.SkipWhile(n => n < 3);  // 3, 3, 3, 4

// 取直到条件不满足
var takeWhile = nums.TakeWhile(n => n < 3);  // 1, 2
\`\`\`

#### 8. 元素访问：First / Single / ElementAt

\`\`\`csharp
var nums = new[] { 1, 2, 3 };

// 找不到抛异常
Console.WriteLine(nums.First());          // 1
Console.WriteLine(nums.First(n => n > 2));  // 3

// 找不到返回默认值
Console.WriteLine(nums.FirstOrDefault(n => n > 5));   // 0（int 默认）
Console.WriteLine(nums.ElementAtOrDefault(10));         // 0

// 检查存在
Console.WriteLine(nums.Contains(2));        // True
Console.WriteLine(nums.Any(n => n > 2));    // True
Console.WriteLine(nums.Any());              // True（非空）
Console.WriteLine(nums.All(n => n > 0));    // True（全部满足）

// Single：要求序列只有一个元素
// Console.WriteLine(nums.Single());  // 异常：序列有多于一个元素
var onlyOne = new[] { 42 }.Single();  // 42
Console.WriteLine(onlyOne);
\`\`\`

**\`First\` vs \`Single\` 的区别：**

- \`First\`：返回第一个匹配元素，没有抛异常。
- \`Single\`：返回**唯一**一个匹配元素，多个或没有都抛异常。用于"明确知道只有一个"的场景（如按 ID 查询）。

### 四、延迟执行（Deferred Execution）⭐

LINQ 查询的执行是**延迟的**——定义查询时不执行，真正消费（如 \`ToList\`、\`foreach\`）时才执行：

\`\`\`csharp
var nums = new List<int> { 1, 2, 3 };

// 定义查询，不执行
var query = nums.Where(n => n > 1);

nums.Add(4);  // 之后再添加
nums.Add(5);

// 这时才执行，看到的是 1, 2, 3, 4, 5
foreach (var n in query)
    Console.WriteLine(n);  // 2, 3, 4, 5
\`\`\`

**好处：** 可以组合多个查询而不立即执行，最终一次遍历完成。

**陷阱：** 多次遍历会多次执行。如果不想重复执行，用 \`ToList\` / \`ToArray\` 缓存结果：

\`\`\`csharp
var nums = new[] { 1, 2, 3, 4, 5 };
// 立即执行，缓存到 List
var cached = nums.Where(n => n > 1).ToList();
Console.WriteLine(string.Join(",", cached));  // 2, 3, 4, 5
\`\`\`

#### 立即执行的操作符

\`ToList\`、\`ToArray\`、\`ToDictionary\`、\`ToLookup\`、\`Count\`、\`Sum\`、\`First\`、\`Aggregate\` 等返回单值或集合的操作符会立即执行查询。

### 五、LINQ to Objects vs LINQ to Entities

\`IEnumerable<T>\` 上的 LINQ（LINQ to Objects）在内存中执行。EF Core 的 \`IQueryable<T>\` 上的 LINQ（LINQ to Entities）会被翻译成 SQL 在数据库执行：

\`\`\`csharp
// === 内存执行（LINQ to Objects）===
var users = new[] { 1, 2, 3, 4, 5 };
var adults = users.Where(n => n >= 3).ToList();
Console.WriteLine(string.Join(",", adults));  // 3, 4, 5

// === 数据库执行（LINQ to Entities，需要 EF Core）===
// dbContext.Users.Where(u => u.Age >= 18)
// 翻译成：SELECT * FROM Users WHERE Age >= 18
\`\`\`

> ⚠️ **重要陷阱：** 数据库 LINQ 不能用任意 C# 方法，只能翻译成 SQL 的子集。把不可翻译部分 \`ToList\` 后在内存做。

### 六、实战 demo：日志分析

下面用 LINQ 分析一段日志数据，展示它在数据分析领域的强大威力：

\`\`\`csharp
// === 日志分析综合示例 ===
var logs = new List<LogEntry>
{
    new(DateTime.Parse("2026-01-01 10:00:00"), "INFO", "服务启动"),
    new(DateTime.Parse("2026-01-01 10:01:00"), "INFO", "请求 #1 进入"),
    new(DateTime.Parse("2026-01-01 10:01:30"), "ERROR", "数据库连接失败"),
    new(DateTime.Parse("2026-01-01 10:02:00"), "WARN", "请求超时，重试 1/3"),
    new(DateTime.Parse("2026-01-01 10:02:30"), "WARN", "请求超时，重试 2/3"),
    new(DateTime.Parse("2026-01-01 10:03:00"), "ERROR", "请求 #1 失败"),
    new(DateTime.Parse("2026-01-01 10:05:00"), "INFO", "请求 #2 进入"),
    new(DateTime.Parse("2026-01-01 10:05:30"), "INFO", "请求 #2 完成"),
};

// 1. 各级别日志数量
var byLevel = logs.GroupBy(l => l.Level)
    .Select(g => new { Level = g.Key, Count = g.Count() })
    .OrderByDescending(x => x.Count);

Console.WriteLine("=== 各级别日志数量 ===");
foreach (var x in byLevel)
    Console.WriteLine($"{x.Level}: {x.Count}");
// INFO: 4
// WARN: 2
// ERROR: 2

// 2. 找出所有 ERROR，按时间排序
Console.WriteLine("\\n=== 所有 ERROR ===");
var errors = logs.Where(l => l.Level == "ERROR").OrderBy(l => l.Time);
foreach (var e in errors)
    Console.WriteLine($"  [{e.Time:HH:mm:ss}] {e.Message}");

// 3. 每小时的统计
Console.WriteLine("\\n=== 小时统计 ===");
var hourlyStats = logs
    .GroupBy(l => l.Time.ToString("yyyy-MM-dd HH:00"))
    .Select(g => new
    {
        Hour = g.Key,
        Total = g.Count(),
        Errors = g.Count(l => l.Level == "ERROR"),
        ErrorRate = (double)g.Count(l => l.Level == "ERROR") / g.Count()
    });

foreach (var s in hourlyStats)
    Console.WriteLine($"  {s.Hour}: {s.Total} 条, 错误 {s.Errors}, 率 {s.ErrorRate:P}");

// 4. 连续 WARN 之后是否跟着 ERROR？（用 Zip 做窗口分析）
Console.WriteLine("\\n=== 连续 WARN 后跟 ERROR ===");
var withNext = logs.Zip(logs.Skip(1), (curr, next) => new { Curr = curr, Next = next });
var warningsFollowedByError = withNext
    .Where(x => x.Curr.Level == "WARN" && x.Next.Level == "ERROR")
    .Select(x => x.Curr);

foreach (var w in warningsFollowedByError)
    Console.WriteLine($"  [{w.Time:HH:mm:ss}] {w.Message}");

// 类型声明在末尾
public record LogEntry(DateTime Time, string Level, string Message);
\`\`\`

这个例子展示了 LINQ 在数据分析领域的强大威力——简洁、可读、类型安全。

### 七、本章小结

- ⭐ LINQ 用统一语法查询任何可枚举数据，类型安全，编译期检查。
- ⭐ 两种语法等价：方法语法（链式调用）更常用，查询表达式复杂场景偶尔更清晰。
- ⭐ 常用操作符：\`Where\`（过滤）、\`Select\`（投影）、\`OrderBy\`（排序）、\`GroupBy\`（分组）、\`Join\`（连接）、\`Distinct\` / \`Skip\` / \`Take\`（去重分页）、\`Count\` / \`Sum\` / \`Aggregate\`（聚合）。
- \`First\` 返回第一个，\`Single\` 要求唯一——按场景选择。
- ⭐ LINQ 是**延迟执行**的，定义时不执行，消费时才执行。需要立即结果用 \`ToList\` / \`ToArray\`。
- \`IEnumerable<T>\` 在内存执行，\`IQueryable<T>\` 翻译成 SQL 在数据库执行——后者受限于 SQL 表达能力。

下一章讲异步编程——I/O 密集场景的核心能力。`,
  },

  // ============================================================
  // 第十六章：异步编程——async/await 与 Task
  // ============================================================
  {
    id: 'csharp-ch16',
    group: '第四部分 高级特性',
    icon: '⚡',
    title: '异步编程——async/await 与 Task',
    content: `## 第十六章　异步编程——async/await 与 Task

I/O 操作（网络请求、文件读写、数据库查询）非常慢——CPU 一次内存读取几纳秒，一次网络请求要几十毫秒，差千万倍。异步编程让 I/O 等待时释放线程去做别的，是高并发应用的核心能力。

### 一、为什么需要异步

同步等待时，线程被阻塞，什么都做不了：

\`\`\`csharp
// === 同步：等待时线程被阻塞（不推荐）===
string DownloadSync(string url)
{
    // .Result 会阻塞当前线程，1000 个请求 = 1000 个线程同时等待
    var client = new HttpClient();
    string content = client.GetStringAsync(url).Result;
    return content;
}

// 演示调用（实际不执行，避免沙箱网络限制）
Console.WriteLine("同步模式：线程被阻塞，效率低");
\`\`\`

异步编程的核心思想：**I/O 等待时释放当前线程去做别的，等结果回来再继续**。C# 用 \`Task\` 和 \`async/await\` 实现这一点。

### 二、Task：异步操作的"凭证" ⭐

\`Task\` 代表"一个未来会完成的操作"。它有泛型版本 \`Task<T>\`（带返回值）和非泛型版本 \`Task\`（无返回值）。

\`\`\`csharp
// === Task 基础使用 ===
// 异步方法（返回 Task<int>）
Task<int> task = ComputeSumAsync(100);

// 这里可以做其他事（模拟）
Console.WriteLine("任务已启动，等待中...");

// 阻塞等待结果（仅演示，实际用 await）
int result = task.Result;
Console.WriteLine($"结果：{result}");  // 5050

// 本地函数：异步方法
Task<int> ComputeSumAsync(int n)
{
    return Task.Run(() =>
    {
        int sum = 0;
        for (int i = 1; i <= n; i++) sum += i;
        return sum;
    });
}
\`\`\`

**\`Task.Run\` vs \`async\`：**

- \`Task.Run\`：把 CPU 密集工作放到线程池执行。
- \`async\`：标记方法是异步的，配合 \`await\` 等待 I/O 完成而不阻塞线程。

### 三、async/await：异步的优雅写法 ⭐

\`async/await\` 让异步代码写起来像同步代码一样直观：

\`\`\`csharp
// === async/await 演示 ===
// 顶级语句中可以用 await（C# 7.1+ 支持）
string result = await DownloadAsync("https://example.com");
Console.WriteLine(result.Length > 0 ? "下载成功" : "下载失败");

// 本地函数：async 方法
async Task<string> DownloadAsync(string url)
{
    var client = new HttpClient();
    // await 等待时不阻塞线程
    string content = await client.GetStringAsync(url);
    return content.ToUpper();
}
\`\`\`

**关键点：**

1. \`async\` 修饰符标记方法为异步。
2. 方法返回类型必须是 \`Task\`、\`Task<T>\` 或 \`ValueTask\`。
3. \`await\` 等待一个 \`Task\`，期间释放线程做别的事，完成后继续。
4. \`await\` 只能在 \`async\` 方法里使用（顶级语句也支持）。

#### 执行流程图解

\`\`\`
async Task<int> GetDataAsync()
{
    Console.WriteLine("A: 同步执行");
    int x = await FetchAsync();   // ← 这里释放线程
    Console.WriteLine("C: 结果回来后继续");
    return x + 1;
}

// 调用方：
Console.WriteLine("调用前");
var task = GetDataAsync();       // 同步执行到 await 处
Console.WriteLine("B: 调用方继续做别的");
int result = await task;          // 等待结果
Console.WriteLine("D: 完成");
\`\`\`

输出顺序：调用前 → A → B → ...（异步等待）→ C → D

**\`await\` 不阻塞线程**——它把方法的剩余部分注册为 \`Task\` 的"延续"，然后立即返回控制权给调用方。这是异步的核心机制。

### 四、实战 demo：异步模拟

下面用一个简单的异步示例演示 \`async/await\` 的执行流程（不依赖网络，可在沙箱运行）：

\`\`\`csharp
// === 异步执行流程演示 ===
Console.WriteLine("1. 主线程开始");

// 启动异步方法
var task = DoWorkAsync();
Console.WriteLine("3. 主线程继续做别的事...");

// 等待异步方法完成
await task;
Console.WriteLine("5. 全部完成");

// 本地函数：模拟异步工作
async Task DoWorkAsync()
{
    Console.WriteLine("2. 异步工作开始");
    await Task.Delay(100);  // 模拟 I/O 等待（100ms）
    Console.WriteLine("4. 异步工作完成");
}
\`\`\`

输出：

\`\`\`
1. 主线程开始
2. 异步工作开始
3. 主线程继续做别的事...
4. 异步工作完成
5. 全部完成
\`\`\`

### 五、async 方法的约定 ⭐

#### 命名约定

异步方法名以 \`Async\` 结尾（如 \`ReadAsync\`、\`SendAsync\`）。

#### 返回类型

- \`Task<T>\`：返回值类型 T。
- \`Task\`：无返回值。
- \`ValueTask<T>\`：值类型版本，减少分配（适合热路径）。
- \`void\`：**仅用于事件处理器**，其他地方不要用 \`async void\`。

#### 异常处理

\`async\` 方法里的异常会被捕获并放进返回的 \`Task\` 里。调用方 \`await\` 时重新抛出：

\`\`\`csharp
// === async 异常处理 ===
try
{
    await RiskyAsync();
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"捕获: {ex.Message}");  // 捕获: 出错了
}

// 本地函数
async Task RiskyAsync()
{
    await Task.Delay(10);
    throw new InvalidOperationException("出错了");
}
\`\`\`

> ⚠️ **\`async void\` 的陷阱**：异常无法被 \`await\` 捕获，会直接终止进程（除非订阅 \`TaskScheduler.UnobservedTaskException\`）。所以禁止在事件处理器以外用 \`async void\`。

### 六、并行多个异步操作 ⭐

#### Task.WhenAll：等待全部完成

\`\`\`csharp
// === 并行执行多个异步任务 ===
var tasks = new[]
{
    FetchAsync("源1", 100),
    FetchAsync("源2", 50),
    FetchAsync("源3", 80)
};

// 并行执行，总耗时约等于最慢的一个（100ms）
string[] results = await Task.WhenAll(tasks);
foreach (var r in results)
    Console.WriteLine(r);

// 本地函数
async Task<string> FetchAsync(string name, int delayMs)
{
    await Task.Delay(delayMs);  // 模拟 I/O
    return $"{name} 完成（耗时 {delayMs}ms）";
}
\`\`\`

\`WhenAll\` 让多个独立异步操作并行执行——这是异步的最大价值之一。如果一个个 \`await\`，总耗时是各操作耗时之和；用 \`WhenAll\` 则是最大值。

#### Task.WhenAny：等待任意一个完成

\`\`\`csharp
// === 多个数据源，谁先返回用谁 ===
var task1 = FetchAsync("源1", 100);
var task2 = FetchAsync("源2", 50);
var task3 = FetchAsync("源3", 80);

Task<string> firstDone = await Task.WhenAny(task1, task2, task3);
string result = await firstDone;
Console.WriteLine($"最快返回：{result}");

// 本地函数
async Task<string> FetchAsync(string name, int delayMs)
{
    await Task.Delay(delayMs);
    return name;
}
\`\`\`

### 七、取消：CancellationToken ⭐

异步操作应该支持取消——用户取消请求、超时、不再需要结果。C# 用 \`CancellationToken\` 实现协作式取消：

\`\`\`csharp
// === CancellationToken 演示 ===
using var cts = new CancellationTokenSource();

// 5 秒后自动取消（这里设短一点便于演示）
cts.CancelAfter(TimeSpan.FromMilliseconds(50));

try
{
    await LongWorkAsync(cts.Token);
    Console.WriteLine("工作完成");
}
catch (OperationCanceledException)
{
    Console.WriteLine("操作被取消（超时）");
}

// 本地函数：支持取消的异步方法
async Task LongWorkAsync(CancellationToken ct)
{
    for (int i = 0; i < 100; i++)
    {
        ct.ThrowIfCancellationRequested();  // 每次循环检查
        await Task.Delay(10, ct);  // 传递 token 给底层 API
    }
}
\`\`\`

**协作式取消：** 调用方发出取消信号，被调用方需要主动检查 \`ct.IsCancellationRequested\` 或调用 \`ct.ThrowIfCancellationRequested()\`。不会强制终止线程——这是为了安全释放资源。

### 八、Task.Run：CPU 密集型异步

\`Task.Run\` 把 CPU 密集工作放到线程池执行，让 UI 线程不被阻塞：

\`\`\`csharp
// === CPU 密集型任务 ===
Console.WriteLine("开始计算...");
int result = await Task.Run(() => HeavyCompute(1_000_000));
Console.WriteLine($"结果：{result}");

// 本地函数：CPU 密集计算
int HeavyCompute(int n)
{
    int sum = 0;
    for (int i = 1; i <= n; i++) sum += i;
    return sum;
}
\`\`\`

> ⚠️ **注意：** \`Task.Run\` 不适合 I/O 密集型——I/O 本身就是异步的，用 \`Task.Run\` 包一层只会浪费线程池资源。直接 \`await\` 异步 API 即可。

### 九、ValueTask：避免分配

\`Task\` 是引用类型，每次都要分配。如果方法经常同步完成（如缓存命中），用 \`ValueTask\` 减少分配：

\`\`\`csharp
// === ValueTask 演示 ===
var cache = new Dictionary<int, int>();

// 缓存命中时同步完成，无堆分配
int v1 = await GetAsync(1);  // 未命中，从"数据库"加载
Console.WriteLine(v1);  // 100
int v2 = await GetAsync(1);  // 命中，同步返回
Console.WriteLine(v2);  // 100

// 本地函数：使用 ValueTask
async ValueTask<int> GetAsync(int key)
{
    if (cache.TryGetValue(key, out int cached))
        return cached;  // 同步完成，无分配

    await Task.Delay(10);  // 模拟从数据库加载
    int value = key * 100;
    cache[key] = value;
    return value;
}
\`\`\`

\`ValueTask\` 是结构体，同步完成时不分配堆内存。但 \`ValueTask\` 不能多次 \`await\`，不能存到字段——这些约束让 \`ValueTask\` 不适合所有场景。**默认用 \`Task\`，性能敏感时再换 \`ValueTask\`**。

### 十、异步编程的常见陷阱 ⚠️

#### 1. async void

\`\`\`csharp
// === 错误示范 ===
async void DoSomethingBad()
{
    await Task.Delay(100);
    throw new Exception("boom");  // 无法被 await 捕获，可能崩进程
}

// === 正确：用 async Task ===
async Task DoSomethingAsync()
{
    await Task.Delay(100);
    throw new Exception("boom");
}

try
{
    await DoSomethingAsync();
}
catch (Exception ex)
{
    Console.WriteLine($"捕获：{ex.Message}");
}
\`\`\`

唯一例外：事件处理器必须 \`async void\`。

#### 2. .Result / .Wait() 阻塞等待

\`\`\`csharp
// === 错误：阻塞等待 ===
int Bad()
{
    var task = SomeAsync();
    return task.Result;  // 阻塞线程，可能死锁
}

// === 正确：一路 async/await 到底 ===
async Task<int> GoodAsync()
{
    return await SomeAsync();
}

// 本地函数
async Task<int> SomeAsync()
{
    await Task.Delay(10);
    return 42;
}

Console.WriteLine(await GoodAsync());  // 42
\`\`\`

**死锁原理：** UI / ASP.NET 经典有"同步上下文"（SynchronizationContext），\`await\` 后的延续要回到原上下文。如果原线程被 \`.Result\` 阻塞，延续等不到上下文 → 死锁。控制台程序无此上下文所以不出现，但不建议依赖这个细节。

#### 3. 不必要的 async

\`\`\`csharp
// === 错误：方法体只有一个 await ===
async Task<string> BadAsync()
{
    return await SomeAsync();
}

// === 正确：直接返回 Task，少一层状态机 ===
Task<string> GoodAsync()
{
    return SomeAsync();
}

// 本地函数
Task<string> SomeAsync() => Task.FromResult("hello");

Console.WriteLine(await GoodAsync());
\`\`\`

例外：如果方法体里 \`await\` 后还有逻辑、或需要捕获异常，还是要 \`async\`。

#### 4. 忘记 await

\`\`\`csharp
// === 错误：fire-and-forget，异常无人处理 ===
// _ = SomeAsync();  // 没 await，异常无法捕获

// === 正确 ===
await SomeAsync();

// 本地函数
async Task SomeAsync()
{
    await Task.Delay(10);
    Console.WriteLine("done");
}
\`\`\`

确实需要 fire-and-forget 时，自己处理异常：

\`\`\`csharp
// === 安全的 fire-and-forget ===
FireAndForget();

void FireAndForget()
{
    _ = Task.Run(async () =>
    {
        try
        {
            await Task.Delay(10);
            Console.WriteLine("后台任务完成");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"异常：{ex.Message}");
        }
    });
}
\`\`\`

### 十一、实战 demo：并发任务处理

下面用一个完整的示例演示 \`async/await\`、\`Task.WhenAll\`、\`SemaphoreSlim\` 限流、\`CancellationToken\` 超时取消的综合应用：

\`\`\`csharp
// === 并发任务处理（限流 + 超时取消）===
using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(500));

try
{
    var tasks = new[]
    {
        ProcessAsync("任务1", 50),
        ProcessAsync("任务2", 100),
        ProcessAsync("任务3", 80),
        ProcessAsync("任务4", 200),
        ProcessAsync("任务5", 60)
    };

    var results = await Task.WhenAll(tasks);
    Console.WriteLine($"完成 {results.Length} 个任务");
    foreach (var r in results)
        Console.WriteLine($"  - {r}");
}
catch (OperationCanceledException)
{
    Console.WriteLine("超时取消");
}

// 本地函数：模拟异步任务
async Task<string> ProcessAsync(string name, int delayMs)
{
    await Task.Delay(delayMs);
    return $"{name} 完成（耗时 {delayMs}ms）";
}
\`\`\`

### 十二、本章小结

- ⭐ 异步编程解决"I/O 等待时线程浪费"的问题，让一个线程能服务多个并发请求。
- ⭐ \`Task\` 代表异步操作；\`async/await\` 让异步代码像同步代码一样直观。
- ⭐ \`Task.WhenAll\` 等待全部完成，\`Task.WhenAny\` 等待任一完成。
- ⭐ \`CancellationToken\` 实现协作式取消，所有公开异步方法都应接受 \`CancellationToken\`。
- \`Task.Run\` 适合 CPU 密集，I/O 密集直接 \`await\` 异步 API。
- ⚠️ 常见陷阱：\`async void\`、\`.Result\`、不必要 \`async\`、忘记 \`await\`。
- 实战：\`WhenAll\` 并行多请求、\`SemaphoreSlim\` 限流、超时取消。

下一章进入实战应用部分，讲集合类库与文件 IO。`,
  },
];

export { chapters };
