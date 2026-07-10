// =============================================================
// C# 教程 - 第四批章节（第四部分 高级特性，共 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   csharp-ch13 : 第十三章 泛型——类型安全的复用
//   csharp-ch14 : 第十四章 委托与事件——函数式回调
//   csharp-ch15 : 第十五章 LINQ——查询的艺术
//   csharp-ch16 : 第十六章 异步编程——async/await 与 Task
//
// 所有 C# 代码示例均可在交互式编辑器中运行（基于顶级语句）。
// 适用版本：C# 12 / .NET 8 LTS
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

### 一、为什么需要泛型

先看一个"没有泛型"的痛点。假设要写一个"栈"数据结构：

\`\`\`csharp
// 方案一：为每种类型写一个栈
public class IntStack
{
    private int[] _items = new int[100];
    public void Push(int x) { /* ... */ }
    public int Pop() { /* ... */ return 0; }
}

public class StringStack
{
    private string[] _items = new string[100];
    public void Push(string x) { /* ... */ }
    public string Pop() { /* ... */ return null; }
}

// 方案二：用 object（统一类型）
public class ObjectStack
{
    private object[] _items = new object[100];
    public void Push(object x) { /* ... */ }
    public object Pop() { /* ... */ return null; }
}

var s = new ObjectStack();
s.Push("hello");
string str = (string)s.Pop();  // 装箱 + 拆箱 + 类型转换
// s.Push(123);
// string str2 = (string)s.Pop();  // 运行时崩溃：InvalidCastException
\`\`\`

\`object\` 方案有两个严重问题：

1. **类型不安全**：编译期无法发现"把 int 当 string"的错误。
2. **性能损失**：值类型要装箱（boxing）放进 object，取出时要拆箱（unboxing），产生额外内存分配和拷贝。

泛型（Generics）就是为了解决这两个问题而生的。

### 二、泛型类

泛型类在类名后用 \`<T>\` 声明类型参数：

\`\`\`csharp
public class Stack<T>
{
    private T[] _items = new T[4];
    public int Count { get; private set; }

    public void Push(T item)
    {
        if (Count == _items.Length)
        {
            Array.Resize(ref _items, _items.Length * 2);
        }
        _items[Count++] = item;
    }

    public T Pop()
    {
        if (Count == 0)
            throw new InvalidOperationException("栈为空");
        T item = _items[--Count];
        _items[Count] = default(T);  // 清空引用
        return item;
    }

    public T Peek() => Count > 0 ? _items[Count - 1] : throw new InvalidOperationException("栈为空");
}

// 使用
var intStack = new Stack<int>();
intStack.Push(1);
intStack.Push(2);
Console.WriteLine(intStack.Pop());  // 2

var strStack = new Stack<string>();
strStack.Push("hello");
Console.WriteLine(strStack.Pop());  // hello

// var s = new Stack<int>(); s.Push("x");  // 编译错误：string 不是 int
\`\`\`

**\`T\` 是什么？**

\`T\` 是"类型参数"（type parameter）——一个占位符，等用户实例化时再确定具体类型。\`Stack<int>\` 中的 \`int\` 是"类型实参"。可以理解为：编译器会为每种值类型生成一份特化代码（避免装箱），引用类型共享一份代码。

**泛型命名约定：**

- 单参数：\`T\`（如 \`List<T>\`）
- 多参数：\`TKey\`、\`TValue\`（如 \`Dictionary<TKey, TValue>\`）
- 约束意义：\`TSource\`、\`TResult\`（如 LINQ 的 \`Select<T, TResult>\`）

### 三、泛型方法

方法也可以是泛型，类型参数写在方法名后：

\`\`\`csharp
public static class ArrayUtil
{
    // 泛型方法
    public static T[] Reverse<T>(T[] source)
    {
        T[] result = new T[source.Length];
        for (int i = 0; i < source.Length; i++)
            result[i] = source[source.Length - 1 - i];
        return result;
    }

    // 多类型参数
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

var arr = new[] { 1, 2, 3, 4 };
var reversed = ArrayUtil.Reverse(arr);  // 推断为 int[]
Console.WriteLine(string.Join(",", reversed));  // 4,3,2,1

var d = ArrayUtil.ToDict(new[] { "a", "b" }, new[] { 1, 2 });
// { "a": 1, "b": 2 }
\`\`\`

调用时一般可以省略类型参数，编译器根据实参推断。无法推断时显式写出 \`<int>\` 等。

### 四、泛型接口

接口也可以是泛型。.NET BCL 里有大量泛型接口：

\`\`\`csharp
public interface IComparable<T>
{
    int CompareTo(T other);
}

public interface IEquatable<T>
{
    bool Equals(T other);
}

public interface IEnumerable<T> : IEnumerable
{
    IEnumerator<T> GetEnumerator();
}

public interface ICollection<T> : IEnumerable<T>
{
    int Count { get; }
    void Add(T item);
    bool Remove(T item);
    void Clear();
    bool Contains(T item);
}

public interface IList<T> : ICollection<T>
{
    T this[int index] { get; set; }
    int IndexOf(T item);
    void Insert(int index, T item);
    void RemoveAt(int index);
}
\`\`\`

**非泛型 vs 泛型接口：**

- 非泛型 \`IEnumerable\`：基于 \`object\`，需装箱/拆箱。
- 泛型 \`IEnumerable<T>\`：类型安全、无装箱。

新代码都应优先使用泛型版本。

### 五、泛型委托

委托也可以是泛型，.NET 内置三个最常用的：

\`\`\`csharp
public delegate void Action();                          // 无参无返回
public delegate void Action<T>(T obj);                  // 一参无返回
public delegate void Action<T1, T2>(T1 a, T2 b);       // 两参无返回

public delegate TResult Func<TResult>();                // 无参返回 TResult
public delegate TResult Func<T, TResult>(T obj);        // 一参返回 TResult

public delegate bool Predicate<T>(T obj);               // 一参返回 bool
\`\`\`

实际开发中几乎不需要自定义泛型委托——\`Action\` 和 \`Func\` 已经覆盖绝大多数场景。

### 六、类型约束：where

泛型默认可以填**任何类型**，但有时需要约束——比如"必须是引用类型"、"必须有无参构造"、"必须实现某个接口"。

\`\`\`csharp
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

public interface IEntity { int Id { get; } }

public class User : IEntity { public int Id { get; set; } public string Name { get; set; } = ""; }
public class Order : IEntity { public int Id { get; set; } }

var userRepo = new Repository<User>();
var u = userRepo.Create();  // new User()
Console.WriteLine(userRepo.GetId(u));  // 0
\`\`\`

**多参数约束：**

\`\`\`csharp
public static TTarget Convert<TSource, TTarget>(TSource source)
    where TSource : class
    where TTarget : class, new()
{
    // ...
    return new TTarget();
}
\`\`\`

约束让泛型方法可以使用约束类型的成员（如 \`entity.Id\`），否则编译器只知道 \`T\` 是 \`object\`，访问不了任何属性。

### 七、泛型类型推断

C# 编译器可以根据方法实参推断类型参数：

\`\`\`csharp
public static T Max<T>(T a, T b) where T : IComparable<T>
    => a.CompareTo(b) >= 0 ? a : b;

// 显式写出类型参数
int m1 = Max<int>(3, 5);

// 推断（推荐）
int m2 = Max(3, 5);
string s = Max("apple", "banana");  // 推断为 string
\`\`\`

但有时无法推断（如返回类型不参与推断），需要显式：

\`\`\`csharp
// 第一个参数 IEnumerable<TSource>，第二个 Func<TSource, TResult>
// TSource 能从 source 推断，TResult 不能，必须显式
public static IEnumerable<TResult> Select<TSource, TResult>(
    IEnumerable<TSource> source, Func<TSource, TResult> selector);

// 调用
var names = users.Select<User, string>(u => u.Name);
// 但 LINQ 实际签名巧妙，selector 的参数能推断出 TSource，返回值能推断 TResult
// 所以实际调用：var names = users.Select(u => u.Name);  // 自动推断
\`\`\`

### 八、协变（out）与逆变（in）

泛型类型参数默认"不变"——\`IEnumerable<Dog>\` 不能赋给 \`IEnumerable<Animal>\`，即使 Dog 是 Animal 的子类。这是因为类型安全无法同时保证读和写两个方向：

- 读场景：\`IEnumerable<Dog>\` → \`IEnumerable<Animal>\` 安全（拿到的是 Dog，可以当 Animal 用）。
- 写场景：\`IList<Animal>\` → \`IList<Dog>\` 不安全（可能写入了 Cat）。

C# 用 \`out\` 和 \`in\` 显式标注方向：

- \`out T\`（协变）：只能用作输出（返回值/属性 get），不能用作输入（参数）。
- \`in T\`（逆变）：只能用作输入，不能用作输出。

\`\`\`csharp
// 协变示例
public interface IEnumerable<out T>  // out 表示协变
{
    IEnumerator<T> GetEnumerator();
}

IEnumerable<Dog> dogs = new List<Dog>();
IEnumerable<Animal> animals = dogs;  // OK：协变

// 逆变示例
public interface IComparer<in T>  // in 表示逆变
{
    int Compare(T x, T y);
}

IComparer<Animal> animalComparer = Comparer<Animal>.Default;
IComparer<Dog> dogComparer = animalComparer;  // OK：逆变
\`\`\`

**记忆口诀：**

- \`out\` = 输出 = 协变 = 子→父（\`IEnumerable<Dog>\` → \`IEnumerable<Animal>\`）
- \`in\` = 输入 = 逆变 = 父→子（\`IComparer<Animal>\` → \`IComparer<Dog>\`）

业务代码很少自己写协变/逆变，但理解了能读懂 .NET BCL 的接口设计。

### 九、泛型缓存（静态字段）

泛型类的静态字段是**每个类型参数一份**的——可以用来做"按类型缓存"：

\`\`\`csharp
public class TypeCache<T>
{
    public static int Counter = 0;  // 每种 T 一份
    public static DateTime CreatedAt = DateTime.Now;
}

TypeCache<int>.Counter++;
TypeCache<int>.Counter++;
TypeCache<string>.Counter++;
Console.WriteLine(TypeCache<int>.Counter);     // 2
Console.WriteLine(TypeCache<string>.Counter);   // 1
\`\`\`

这个特性被广泛用于：

- **对象池**：\`ObjectPool<T>\` 每种类型一个池。
- **单例**：\`Singleton<T>\` 每种类型一个实例。
- **类型元数据缓存**：反射信息缓存，避免重复计算。

### 十、综合示例：泛型仓储

\`\`\`csharp
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

public class InMemoryRepository<T> : IRepository<T> where T : class, IEntity, new()
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

// 使用
var userRepo = new InMemoryRepository<User>();
userRepo.Add(new User { Name = "张三" });
userRepo.Add(new User { Name = "李四" });

foreach (var u in userRepo.FindAll())
    Console.WriteLine($"{u.Id} - {u.Name}");
// 1 - 张三
// 2 - 李四

var found = userRepo.Find(1);
if (found != null)
{
    found.Name = "张三丰";
    userRepo.Update(found);
}

Console.WriteLine(userRepo.Find(1)?.Name);  // 张三丰
\`\`\`

这个例子综合了：泛型类、泛型接口、泛型约束（\`class, IEntity, new()\`）、面向接口编程。

### 十一、本章小结

- 泛型解决"类型安全 + 复用"的矛盾：一份代码适用多种类型，且编译期保证类型安全。
- 泛型可应用于类、方法、接口、委托。
- \`where\` 关键字约束类型参数（struct/class/new()/接口/基类）。
- \`out\` 协变 / \`in\` 逆变让泛型反映继承关系，常用于接口设计。
- 泛型静态字段"按类型一份"是高级但实用的特性。
- 实战场景：泛型集合（List<T>, Dictionary<K,V>）、泛型仓储、泛型工厂、泛型缓存。
`,
  },

  // ============================================================
  // 第十四章：委托与事件——函数式回调
  // ============================================================
  {
    id: 'csharp-ch14',
    group: '第四部分 高级特性',
    icon: '📡',
    title: '委托与事件——函数式回调',
    content: `## 第十四章　委托与事件——函数式回调

### 一、回调问题

编程中经常遇到"某个时机要执行某段代码"的场景：

- 按钮被点击时执行某段逻辑。
- 数据加载完成时通知调用方。
- 温度变化时触发监听者。

这种"我把一段代码交给你，你到时机时调用我"的模式叫**回调**（callback）。C++ 用函数指针、Java 用接口匿名类、JavaScript 用闭包。C# 用**委托**（delegate）。

### 二、委托：方法的类型

委托本质是"方法的类型签名"。声明委托就像声明一个"方法类型"：

\`\`\`csharp
// 声明：委托类型 MathOp，接受两个 int，返回 int
public delegate int MathOp(int a, int b);

// 委托实例：可以指向任何签名匹配的方法
public class Calculator
{
    public static int Add(int a, int b) => a + b;
    public static int Subtract(int a, int b) => a - b;
    public static int Multiply(int a, int b) => a * b;
}

MathOp op = Calculator.Add;       // 把方法赋给委托
Console.WriteLine(op(3, 5));       // 8 —— 像调用方法一样用

op = Calculator.Subtract;
Console.WriteLine(op(3, 5));       // -2
\`\`\`

**委托变量就是一个"方法的引用"**，可以赋值、传递、调用。把方法当数据用——这是函数式编程的基础。

### 三、Action 与 Func：内置委托类型

C# 内置了两个常用泛型委托，覆盖绝大多数场景，几乎不需要自定义：

- \`Action\`：无返回值。\`Action\`、\`Action<T>\`、\`Action<T1,T2>\` ...（最多 16 个参数）。
- \`Func\`：有返回值。\`Func<TResult>\`、\`Func<T, TResult>\`、\`Func<T1, T2, TResult>\` ...（最后一个类型参数是返回类型）。

\`\`\`csharp
// Action
Action<string> log = msg => Console.WriteLine($"[LOG] {msg}");
log("hello");

Action<int, int> printSum = (a, b) => Console.WriteLine(a + b);
printSum(3, 5);

// Func
Func<int, int, int> add = (a, b) => a + b;
Console.WriteLine(add(3, 5));  // 8

Func<int, bool> isEven = n => n % 2 == 0;
Console.WriteLine(isEven(4));  // True

Func<string> getTimestamp = () => DateTime.Now.ToString("HH:mm:ss");
Console.WriteLine(getTimestamp());
\`\`\`

**注意 Func 的参数顺序：** 最后一个类型参数是返回类型。如 \`Func<int, string>\` 是"接收 int，返回 string"。

### 四、Lambda 表达式

Lambda 是声明委托变量的最简洁语法。\`=>\` 读作"映射到"。

\`\`\`csharp
// 完整形式
Func<int, int> square = (int x) => { return x * x; };

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

Console.WriteLine(factorial(5));  // 120
\`\`\`

**闭包（Closure）：** Lambda 可以捕获外部变量：

\`\`\`csharp
int multiplier = 10;
Func<int, int> scale = x => x * multiplier;
Console.WriteLine(scale(5));  // 50

multiplier = 100;
Console.WriteLine(scale(5));  // 500 —— 捕获的是变量本身，不是值快照
\`\`\`

**陷阱：** 循环里捕获循环变量要小心（C# 5+ 已修复 foreach 的常见问题，但 for 循环仍需注意）：

\`\`\`csharp
// 错误：所有 Lambda 捕获同一个 i
var actions = new List<Action>();
for (int i = 0; i < 3; i++)
{
    actions.Add(() => Console.WriteLine(i));
}
foreach (var a in actions) a();
// 3 3 3 —— 全部打印 3，因为循环结束 i = 3

// 正确：在循环内创建局部变量
var actions2 = new List<Action>();
for (int i = 0; i < 3; i++)
{
    int local = i;  // 每次循环新的变量
    actions2.Add(() => Console.WriteLine(local));
}
foreach (var a in actions2) a();
// 0 1 2
\`\`\`

### 五、多播委托（MulticastDelegate）

委托可以"+"组合多个方法，调用时全部依次执行：

\`\`\`csharp
Action<string> log = msg => Console.WriteLine($"[Console] {msg}");
log += msg => Console.WriteLine($"[File] {msg} log appended");
log += msg => Console.WriteLine($"[DB] {msg} saved");

log("hello");
// [Console] hello
// [File] hello log appended
// [DB] hello saved

log -= msg => Console.WriteLine($"[File] {msg} log appended");  // 移除（lambda 不能这样移除，需保存引用）
\`\`\`

**注意：** Lambda 表达式每次创建都是新实例，\`-=\` 不能移除 Lambda。要正确移除，需要把方法保存为命名方法或委托变量：

\`\`\`csharp
void FileLog(string msg) => Console.WriteLine($"[File] {msg}");

Action<string> log = Console.WriteLine;
log += FileLog;  // 命名方法
log("hello");
log -= FileLog;  // 可以正确移除
\`\`\`

多播委托的返回值：返回类型不为 void 时，多播只返回**最后一个**方法的结果，前面的被丢弃。所以多播一般用 \`void\` 或 \`event\`。

### 六、事件（event）：发布订阅模式

事件是委托的"安全封装"。直接暴露委托字段有问题：外部可以随便改、可以清空、可以伪造调用。事件关键字 \`event\` 限制了外部只能 \`+=\` 和 \`-=\`，不能直接赋值或调用。

\`\`\`csharp
public class Button
{
    // 1. 声明事件
    public event Action? Clicked;

    // 或者带 EventArgs 的标准事件
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

// 订阅
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
// btn.Clicked();      // 编译错误：事件不能在外部触发
\`\`\`

**事件 vs 委托字段的对比：**

| 维度 | 委托字段 | event |
|------|---------|-------|
| 外部赋值 | 可以（会覆盖订阅者） | 不可以 |
| 外部调用 | 可以 | 不可以 |
| 外部 += / -= | 可以 | 可以 |
| 类内部触发 | 任意位置 | 任意位置 |
| 类似于 | public 字段 | 属性（封装字段） |

**事件的标准模式：** .NET 的事件设计约定：

\`\`\`csharp
// 1. 事件参数继承 EventArgs
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

// 2. 发布者
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
                // 3. 触发事件（保护虚方法，子类可拦截）
                OnTemperatureChanged(new TemperatureChangedEventArgs(old, value));
            }
        }
    }

    // 4. 事件声明
    public event EventHandler<TemperatureChangedEventArgs>? TemperatureChanged;

    // 5. 触发方法（protected virtual 让子类可改写）
    protected virtual void OnTemperatureChanged(TemperatureChangedEventArgs e)
    {
        TemperatureChanged?.Invoke(this, e);
    }
}

// 6. 订阅者
var t = new Thermometer();
t.TemperatureChanged += (sender, e) =>
    Console.WriteLine($"温度变化：{e.OldValue} → {e.NewValue}");

t.Temperature = 25.5m;
t.Temperature = 30.0m;
// 温度变化：0 → 25.5
// 温度变化：25.5 → 30.0
\`\`\`

### 七、Func 与 Lambda 的实战

#### 1. 高阶函数

接收函数作为参数或返回函数的方法叫"高阶函数"：

\`\`\`csharp
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

var nums = new[] { 1, 2, 3, 4, 5, 6 };
var evens = EnumerableExt.MyWhere(nums, n => n % 2 == 0);
var squares = EnumerableExt.MySelect(evens, n => n * n);
var sum = EnumerableExt.MyAggregate(squares, (a, b) => a + b);
Console.WriteLine(sum);  // 4 + 16 + 36 = 56
\`\`\`

这就是 LINQ 的核心实现思路——把"对集合的操作"拆成一组高阶函数，每个接受一个函数参数。

#### 2. 策略模式

\`\`\`csharp
public class PriceCalculator
{
    public Func<decimal, decimal> DiscountStrategy { get; set; } = _ => 0;

    public decimal Calculate(decimal price)
    {
        var discount = DiscountStrategy(price);
        return price - discount;
    }
}

var calc = new PriceCalculator();

// 不同策略
calc.DiscountStrategy = price => price > 100 ? price * 0.1m : 0;  // 满 100 打 9 折
Console.WriteLine(calc.Calculate(150));  // 135

calc.DiscountStrategy = price => price * 0.2m;  // 一律 8 折
Console.WriteLine(calc.Calculate(150));  // 120
\`\`\`

#### 3. 回调通知

\`\`\`csharp
public class DataLoader
{
    public Action<string>? OnProgress { get; set; }
    public Action<Exception>? OnError { get; set; }
    public Action<byte[]>? OnComplete { get; set; }

    public void Load(string url)
    {
        try
        {
            OnProgress?.Invoke("开始加载");
            // ... 模拟加载
            Thread.Sleep(100);
            OnProgress?.Invoke("加载 50%");
            Thread.Sleep(100);
            OnProgress?.Invoke("加载完成");
            OnComplete?.Invoke(new byte[] { 1, 2, 3 });
        }
        catch (Exception ex)
        {
            OnError?.Invoke(ex);
        }
    }
}

var loader = new DataLoader();
loader.OnProgress = msg => Console.WriteLine($"[进度] {msg}");
loader.OnError = ex => Console.WriteLine($"[错误] {ex.Message}");
loader.OnComplete = data => Console.WriteLine($"[完成] 收到 {data.Length} 字节");
loader.Load("http://example.com/file");
\`\`\`

### 八、委托的演变：从 delegate 到 Lambda

C# 经历了几个阶段：

\`\`\`csharp
// C# 1.0：命名方法
delegate(int x) { return x * x; }  // 不支持匿名
Func<int, int> f1 = Calculator.Square;

// C# 2.0：匿名方法
Func<int, int> f2 = delegate(int x) { return x * x; };

// C# 3.0：Lambda 表达式（推荐）
Func<int, int> f3 = x => x * x;

// C# 7+：本地函数（适合需要复用或递归的场景）
int Square(int x) => x * x;
Func<int, int> f4 = Square;
\`\`\`

**本地函数 vs Lambda 的选择：**

- 一次性使用、传递给高阶函数：Lambda 更简洁。
- 多处复用、需要递归、需要参数校验：本地函数更清晰、性能更好（不需要捕获闭包）。

### 九、综合示例：消息总线

\`\`\`csharp
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

var bus = new EventBus();
bus.Subscribe("user.created", u => Console.WriteLine($"[邮件] 欢迎新用户 {u}"));
bus.Subscribe("user.created", u => Console.WriteLine($"[分析] 记录用户注册事件 {u}"));
bus.Subscribe("order.paid", o => Console.WriteLine($"[库存] 扣减库存: {o}"));

bus.Publish("user.created", "张三");
// [邮件] 欢迎新用户 张三
// [分析] 记录用户注册事件 张三

bus.Publish("order.paid", "订单 #1001");
// [库存] 扣减库存: 订单 #1001
\`\`\`

事件总线是解耦系统组件的常用模式——发布者只管发，订阅者只管收，互不感知。

### 十、本章小结

- 委托是"方法的类型"，让方法可以像数据一样传递。
- \`Action\` 和 \`Func\` 是内置泛型委托，覆盖绝大多数场景。
- Lambda 表达式是声明委托变量的最简洁语法。
- 闭包让 Lambda 捕获外部变量——但要注意循环捕获的陷阱。
- 多播委托让一个委托变量持有多个方法，调用时全部执行。
- 事件（\`event\`）是委托的安全封装，外部只能订阅/退订，不能赋值或触发。
- 标准事件模式：\`EventArgs\` 子类 + \`EventHandler<TArgs>\` + \`OnXxx\` 保护虚方法。
- 实战：高阶函数、策略模式、回调通知、消息总线。
`,
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

### 一、LINQ 是什么

LINQ（Language Integrated Query，语言集成查询）是 C# 3.0 引入的特性，让"查询数据"成为语言一等公民。一句话概括：**用统一的语法查询任何可枚举的数据源**。

\`\`\`csharp
// 查询 List
var users = new List<User> { /* ... */ };
var adults = users.Where(u => u.Age >= 18)
                  .OrderBy(u => u.Name)
                  .Select(u => u.Name);

// 查询数组
var nums = new[] { 1, 2, 3, 4, 5 };
var evens = nums.Where(n => n % 2 == 0);

// 查询数据库（EF Core）
// var users = dbContext.Users.Where(u => u.Age >= 18).ToList();
\`\`\`

**LINQ 的两大优势：**

1. **统一语法**：对象、数据库、XML、JSON 都用同样的查询方式。
2. **类型安全**：编译期检查，重构友好，不是字符串 SQL。

### 二、两种语法：方法语法与查询表达式

LINQ 有两种写法，等价但风格不同。

#### 方法语法（Fluent API）

\`\`\`csharp
var result = users
    .Where(u => u.Age >= 18)
    .OrderBy(u => u.Name)
    .Select(u => u.Name);
\`\`\`

#### 查询表达式（Query Expression）

\`\`\`csharp
var result = from u in users
            where u.Age >= 18
            orderby u.Name
            select u.Name;
\`\`\`

两种语法完全等价，编译后都变成同样的方法调用。**实际开发中方法语法更常见**（IDE 提示更友好，链式调用更直观），查询表达式在复杂 join/group 时偶尔更易读。

### 三、常用 LINQ 操作符

#### 1. 过滤：Where

\`\`\`csharp
var nums = new[] { 1, 2, 3, 4, 5, 6 };
var evens = nums.Where(n => n % 2 == 0);  // 2, 4, 6

// 带索引的 Where（C# 也能拿到索引）
var evenIndex = nums.Where((n, i) => i % 2 == 0);  // 1, 3, 5（索引为偶数的元素）
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
\`\`\`

#### 3. 排序：OrderBy / ThenBy

\`\`\`csharp
var sorted = users
    .OrderBy(u => u.Age)           // 主排序（升序）
    .ThenBy(u => u.Name);          // 次排序

var desc = users
    .OrderByDescending(u => u.Age) // 降序
    .ThenByDescending(u => u.Name);

// Reverse：反转
var reversed = nums.Reverse();
\`\`\`

#### 4. 聚合：Count, Sum, Average, Min, Max, Aggregate

\`\`\`csharp
var nums = new[] { 1, 2, 3, 4, 5 };

Console.WriteLine(nums.Count());          // 5
Console.WriteLine(nums.Sum());            // 15
Console.WriteLine(nums.Average());        // 3
Console.WriteLine(nums.Min());            // 1
Console.WriteLine(nums.Max());            // 5

// Aggregate：自定义聚合
var product = nums.Aggregate((a, b) => a * b);  // 120
var sum = nums.Aggregate(0, (acc, n) => acc + n);  // 15，带种子

// 字符串拼接
var words = new[] { "Hello", "World", "LINQ" };
var sentence = words.Aggregate((a, b) => $"\\"{a}\\" + \\"{b}\\"");
\`\`\`

#### 5. 分组：GroupBy

\`\`\`csharp
var users = new[]
{
    new { Name = "张三", Dept = "工程", Age = 25 },
    new { Name = "李四", Dept = "工程", Age = 30 },
    new { Name = "王五", Dept = "市场", Age = 28 },
    new { Name = "赵六", Dept = "市场", Age = 22 }
};

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

// 分组后投影
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

// Join（类似 SQL INNER JOIN）
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

// 分页
var page2 = nums.Skip(10).Take(10);  // 第 2 页，每页 10 条

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
Console.WriteLine(nums.Single());         // 异常：序列有多于一个元素

// 找不到返回默认值
Console.WriteLine(nums.FirstOrDefault(n => n > 5));   // 0（int 默认）
Console.WriteLine(nums.ElementAtOrDefault(10));         // 0

// 检查存在
Console.WriteLine(nums.Contains(2));      // True
Console.WriteLine(nums.Any(n => n > 2));   // True
Console.WriteLine(nums.Any());             // True（非空）
Console.WriteLine(nums.All(n => n > 0));  // True（全部满足）
\`\`\`

**\`First\` vs \`Single\` 的区别：**

- \`First\`：返回第一个匹配元素，没有抛异常。
- \`Single\`：返回**唯一**一个匹配元素，多个或没有都抛异常。用于"明确知道只有一个"的场景（如按 ID 查询）。

### 四、延迟执行（Deferred Execution）

LINQ 查询的执行是**延迟的**——定义查询时不执行，真正消费（如 \`ToList\`、\`foreach\`）时才执行：

\`\`\`csharp
var nums = new List<int> { 1, 2, 3 };

// 定义查询，不执行
var query = nums.Where(n => n > 1);

nums.Add(4);  // 之后再添加
nums.Add(5);

// 这时才执行，看到的是 1, 2, 3, 4, 5
foreach (var n in query)
    Console.WriteLine(n);
// 2, 3, 4, 5
\`\`\`

**好处：** 可以组合多个查询而不立即执行，最终一次遍历完成。

**陷阱：** 多次遍历会多次执行。如果不想重复执行，用 \`ToList\` / \`ToArray\` 缓存结果：

\`\`\`csharp
var query = nums.Where(n => n > 1).ToList();  // 立即执行，缓存到 List
\`\`\`

#### 立即执行的操作符

\`ToList\`、\`ToArray\`、\`ToDictionary\`、\`ToLookup\`、\`Count\`、\`Sum\`、\`First\`、\`Aggregate\` 等返回单值或集合的操作符会立即执行查询。

### 五、LINQ to Objects vs LINQ to Entities

\`IEnumerable<T>\` 上的 LINQ（LINQ to Objects）在内存中执行。EF Core 的 \`IQueryable<T>\` 上的 LINQ（LINQ to Entities）会被翻译成 SQL 在数据库执行：

\`\`\`csharp
// 内存执行
List<User> users = GetUsersFromMemory();
var adults = users.Where(u => u.Age >= 18).ToList();

// 数据库执行
// dbContext.Users.Where(u => u.Age >= 18) 翻译成：
// SELECT * FROM Users WHERE Age >= 18
\`\`\`

**重要陷阱：** 数据库 LINQ 不能用任意 C# 方法，只能翻译成 SQL 的子集。比如：

\`\`\`csharp
// 报错：CustomMethod 无法翻译成 SQL
var result = dbContext.Users.Where(u => CustomMethod(u)).ToList();

// 正确：把可翻译部分留在数据库，不可翻译部分 ToList 后在内存做
var all = dbContext.Users.ToList();
var result = all.Where(u => CustomMethod(u)).ToList();
\`\`\`

### 六、综合示例：日志分析

\`\`\`csharp
public record LogEntry(DateTime Time, string Level, string Message);

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

foreach (var x in byLevel)
    Console.WriteLine($"{x.Level}: {x.Count}");
// INFO: 4
// WARN: 2
// ERROR: 2

// 2. 找出所有 ERROR，按时间排序
var errors = logs.Where(l => l.Level == "ERROR")
    .OrderBy(l => l.Time);

Console.WriteLine("\\n所有 ERROR:");
foreach (var e in errors)
    Console.WriteLine($"  [{e.Time:HH:mm:ss}] {e.Message}");

// 3. 每小时的错误率
var hourlyStats = logs
    .GroupBy(l => l.Time.ToString("yyyy-MM-dd HH:00"))
    .Select(g => new
    {
        Hour = g.Key,
        Total = g.Count(),
        Errors = g.Count(l => l.Level == "ERROR"),
        ErrorRate = (double)g.Count(l => l.Level == "ERROR") / g.Count()
    });

Console.WriteLine("\\n小时统计:");
foreach (var s in hourlyStats)
    Console.WriteLine($"  {s.Hour}: {s.Total} 条, 错误 {s.Errors}, 率 {s.ErrorRate:P}");

// 4. 连续 WARN 之后是否跟着 ERROR？（窗口分析）
var withNext = logs.Zip(logs.Skip(1), (curr, next) => new { Curr = curr, Next = next });
var warningsFollowedByError = withNext
    .Where(x => x.Curr.Level == "WARN" && x.Next.Level == "ERROR")
    .Select(x => x.Curr);

Console.WriteLine("\\n连续 WARN 后跟 ERROR:");
foreach (var w in warningsFollowedByError)
    Console.WriteLine($"  [{w.Time:HH:mm:ss}] {w.Message}");
\`\`\`

这个例子展示了 LINQ 在数据分析领域的强大威力——简洁、可读、类型安全。

### 七、本章小结

- LINQ 用统一语法查询任何可枚举数据，类型安全，编译期检查。
- 两种语法等价：方法语法（链式调用）更常用，查询表达式复杂场景偶尔更清晰。
- 常用操作符：\`Where\`（过滤）、\`Select\`（投影）、\`OrderBy\`（排序）、\`GroupBy\`（分组）、\`Join\`（连接）、\`Distinct\` / \`Skip\` / \`Take\`（去重分页）、\`Count\` / \`Sum\` / \`Aggregate\`（聚合）。
- \`First\` 返回第一个，\`Single\` 要求唯一——按场景选择。
- LINQ 是**延迟执行**的，定义时不执行，消费时才执行。需要立即结果用 \`ToList\` / \`ToArray\`。
- \`IEnumerable<T>\` 在内存执行，\`IQueryable<T>\` 翻译成 SQL 在数据库执行——后者受限于 SQL 表达能力。
`,
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

### 一、为什么需要异步

I/O 操作（网络请求、文件读写、数据库查询）非常慢——CPU 一次内存读取几纳秒，一次网络请求要几十毫秒，差千万倍。同步等待时，线程被阻塞，什么都做不了：

\`\`\`csharp
// 同步：等待时线程被阻塞
public string Download(string url)
{
    var client = new HttpClient();
    string content = client.GetStringAsync(url).Result;  // 阻塞当前线程
    return content;
}

// 1000 个请求 = 1000 个线程同时等待 = 服务器线程池耗尽
\`\`\`

异步编程的核心思想：**I/O 等待时释放当前线程去做别的，等结果回来再继续**。C# 用 \`Task\` 和 \`async/await\` 实现这一点。

### 二、Task：异步操作的"凭证"

\`Task\` 代表"一个未来会完成的操作"。它有泛型版本 \`Task<T>\`（带返回值）和非泛型版本 \`Task\`（无返回值）。

\`\`\`csharp
// 同步方法
int ComputeSum(int n)
{
    int sum = 0;
    for (int i = 1; i <= n; i++) sum += i;
    return sum;
}

// 异步方法（返回 Task<int>）
Task<int> ComputeSumAsync(int n)
{
    return Task.Run(() =>
    {
        int sum = 0;
        for (int i = 1; i <= n; i++) sum += i;
        return sum;
    });
}

// 调用
Task<int> task = ComputeSumAsync(100);
// 这里可以做其他事
int result = task.Result;  // 阻塞等待（不推荐，下面用 await）
Console.WriteLine(result);  // 5050
\`\`\`

**\`Task.Run\` vs \`async\`：**

- \`Task.Run\`：把 CPU 密集工作放到线程池执行。
- \`async\`：标记方法是异步的，配合 \`await\` 等待 I/O 完成而不阻塞线程。

### 三、async/await：异步的优雅写法

\`async/await\` 让异步代码写起来像同步代码一样直观：

\`\`\`csharp
public async Task<string> DownloadAsync(string url)
{
    var client = new HttpClient();
    string content = await client.GetStringAsync(url);  // 等待时不阻塞线程
    return content.ToUpper();
}

// 调用
string result = await DownloadAsync("https://example.com");
Console.WriteLine(result);
\`\`\`

**关键点：**

1. \`async\` 修饰符标记方法为异步。
2. 方法返回类型必须是 \`Task\`、\`Task<T>\` 或 \`ValueTask\`。
3. \`await\` 等待一个 \`Task\`，期间释放线程做别的事，完成后继续。
4. \`await\` 只能在 \`async\` 方法里使用。

#### 执行流程图解

\`\`\`
async Task<int> GetDataAsync()
{
    Console.WriteLine("A: 同步执行");
    int x = await FetchAsync();   // ← 这里释放线程
    Console.WriteLine("C: 结果回来后继续");
    return x + 1;
}

调用方：
Console.WriteLine("调用前");
var task = GetDataAsync();       // 同步执行到 await 处
Console.WriteLine("B: 调用方继续做别的");
int result = await task;          // 等待结果
Console.WriteLine("D: 完成");
\`\`\`

输出顺序：调用前 → A → B → ...（异步等待）→ C → D

**\`await\` 不阻塞线程**——它把方法的剩余部分注册为 \`Task\` 的"延续"，然后立即返回控制权给调用方。这是异步的核心机制。

### 四、async 方法的约定

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
public async Task RiskyAsync()
{
    await Task.Delay(100);
    throw new InvalidOperationException("出错了");
}

// 调用
try
{
    await RiskyAsync();
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"捕获: {ex.Message}");
}
\`\`\`

**\`async void\` 的陷阱：** 异常无法被 \`await\` 捕获，会直接终止进程（除非订阅 \`TaskScheduler.UnobservedTaskException\`）。所以禁止在事件处理器以外用 \`async void\`。

### 五、并行多个异步操作

#### Task.WhenAll：等待全部完成

\`\`\`csharp
public async Task<string[]> DownloadMultipleAsync(string[] urls)
{
    var tasks = urls.Select(url => new HttpClient().GetStringAsync(url));
    string[] results = await Task.WhenAll(tasks);
    return results;
}

// 调用：3 个请求并行，总耗时约等于最慢的一个
var urls = new[]
{
    "https://example.com/1",
    "https://example.com/2",
    "https://example.com/3"
};
var contents = await DownloadMultipleAsync(urls);
\`\`\`

\`WhenAll\` 让多个独立异步操作并行执行——这是异步的最大价值之一。如果一个个 \`await\`，总耗时是各操作耗时之和；用 \`WhenAll\` 则是最大值。

#### Task.WhenAny：等待任意一个完成

\`\`\`csharp
// 多个数据源，谁先返回用谁
public async Task<string> GetFastestAsync()
{
    var task1 = FetchFromSource1Async();
    var task2 = FetchFromSource2Async();
    var task3 = FetchFromSource3Async();

    Task<string> firstDone = await Task.WhenAny(task1, task2, task3);
    return await firstDone;
}
\`\`\`

#### Task.WhenEach（.NET 6+）

\`\`\`csharp
var tasks = new[] { task1, task2, task3 };
await foreach (var completed in Task.WhenEach(tasks))
{
    Console.WriteLine($"完成: {completed.Result}");
}
\`\`\`

### 六、取消：CancellationToken

异步操作应该支持取消——用户取消请求、超时、不再需要结果。C# 用 \`CancellationToken\` 实现协作式取消：

\`\`\`csharp
public async Task<string> DownloadAsync(string url, CancellationToken ct = default)
{
    var client = new HttpClient();
    // 传递 token 给底层 API
    return await client.GetStringAsync(url, ct);
}

// 调用
using var cts = new CancellationTokenSource();

// 5 秒后自动取消
cts.CancelAfter(TimeSpan.FromSeconds(5));

try
{
    string content = await DownloadAsync("https://example.com", cts.Token);
    Console.WriteLine(content);
}
catch (OperationCanceledException)
{
    Console.WriteLine("操作被取消");
}
\`\`\`

**协作式取消：** 调用方发出取消信号，被调用方需要主动检查 \`ct.IsCancellationRequested\` 或调用 \`ct.ThrowIfCancellationRequested()\`。不会强制终止线程——这是为了安全释放资源。

\`\`\`csharp
public async Task ProcessAsync(int[] data, CancellationToken ct)
{
    foreach (var item in data)
    {
        ct.ThrowIfCancellationRequested();  // 每次循环检查
        await ProcessItemAsync(item, ct);
    }
}
\`\`\`

### 七、Task.Run：CPU 密集型异步

\`Task.Run\` 把 CPU 密集工作放到线程池执行，让 UI 线程不被阻塞：

\`\`\`csharp
// UI 线程阻塞（错误示范）
private void OnClick(object sender, EventArgs e)
{
    // 大计算阻塞 UI，界面卡死
    int result = HeavyCompute(1_000_000);
    label.Text = result.ToString();
}

// 异步版（正确）
private async void OnClick(object sender, EventArgs e)
{
    // 重活放到线程池
    int result = await Task.Run(() => HeavyCompute(1_000_000));
    label.Text = result.ToString();  // 回到 UI 线程更新
}
\`\`\`

**注意：** \`Task.Run\` 不适合 I/O 密集型——I/O 本身就是异步的，用 \`Task.Run\` 包一层只会浪费线程池资源。直接 \`await\` 异步 API 即可。

### 八、ValueTask：避免分配

\`Task\` 是引用类型，每次都要分配。如果方法经常同步完成（如缓存命中），用 \`ValueTask\` 减少分配：

\`\`\`csharp
public async ValueTask<int> GetAsync(int key)
{
    if (_cache.TryGetValue(key, out int cached))
        return cached;  // 同步完成，无分配

    int value = await LoadFromDbAsync(key);
    _cache[key] = value;
    return value;
}
\`\`\`

\`ValueTask\` 是结构体，同步完成时不分配堆内存。但 \`ValueTask\` 不能多次 \`await\`，不能存到字段——这些约束让 \`ValueTask\` 不适合所有场景。**默认用 \`Task\`，性能敏感时再换 \`ValueTask\`**。

### 九、异步编程的常见陷阱

#### 1. async void

\`\`\`csharp
// 错误
public async void DoSomething()
{
    await Task.Delay(1000);
    throw new Exception("boom");  // 无法被 await 捕获，可能崩进程
}

// 正确：用 async Task，调用方 await
public async Task DoSomethingAsync()
{
    await Task.Delay(1000);
    throw new Exception("boom");
}
\`\`\`

唯一例外：事件处理器必须 \`async void\`。

#### 2. .Result / .Wait() / .GetAwaiter().GetResult()

\`\`\`csharp
// 错误：阻塞等待
public void Caller()
{
    var task = SomeAsync();
    var result = task.Result;  // 阻塞线程，可能死锁（尤其在 UI / ASP.NET 经典上下文）
}

// 正确：一路 async/await 到底
public async Task CallerAsync()
{
    var result = await SomeAsync();
}
\`\`\`

**死锁原理：** UI / ASP.NET 经典有"同步上下文"（SynchronizationContext），\`await\` 后的延续要回到原上下文。如果原线程被 \`.Result\` 阻塞，延续等不到上下文 → 死锁。控制台程序无此上下文所以不出现，但不建议依赖这个细节。

#### 3. 不必要的 async

\`\`\`csharp
// 错误：方法体只有一个 await
public async Task<string> GetAsync()
{
    return await SomeOtherAsync();
}

// 正确：直接返回 Task，少一层状态机
public Task<string> GetAsync()
{
    return SomeOtherAsync();
}
\`\`\`

例外：如果方法体里 \`await\` 后还有逻辑、或需要捕获异常，还是要 \`async\`。

#### 4. 忘记 await

\`\`\`csharp
// 错误：fire-and-forget，异常无人处理
public void Caller()
{
    _ = SomeAsync();  // 没 await，异常无法捕获
}

// 正确
public async Task CallerAsync()
{
    await SomeAsync();
}
\`\`\`

确实需要 fire-and-forget 时，自己处理异常：

\`\`\`csharp
public void FireAndForget()
{
    _ = Task.Run(async () =>
    {
        try { await SomeAsync(); }
        catch (Exception ex) { Console.WriteLine(ex); }
    });
}
\`\`\`

### 十、综合示例：并发爬虫

\`\`\`csharp
public class Crawler
{
    private readonly HttpClient _client = new();

    public async Task<Dictionary<string, int>> CrawlAsync(
        string[] urls, int maxConcurrency, CancellationToken ct)
    {
        var results = new Dictionary<string, int>();
        var semaphore = new SemaphoreSlim(maxConcurrency);  // 限制并发数
        var tasks = urls.Select(async url =>
        {
            await semaphore.WaitAsync(ct);
            try
            {
                ct.ThrowIfCancellationRequested();
                string content = await _client.GetStringAsync(url, ct);
                lock (results)
                {
                    results[url] = content.Length;
                }
                Console.WriteLine($"完成: {url} ({content.Length} 字符)");
            }
            finally
            {
                semaphore.Release();
            }
        });
        await Task.WhenAll(tasks);
        return results;
    }
}

// 使用
var crawler = new Crawler();
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
try
{
    var urls = new[]
    {
        "https://example.com/1",
        "https://example.com/2",
        "https://example.com/3",
        "https://example.com/4",
        "https://example.com/5",
    };
    var results = await crawler.CrawlAsync(urls, maxConcurrency: 3, cts.Token);
    foreach (var kv in results)
        Console.WriteLine($"{kv.Key}: {kv.Value} 字符");
}
catch (OperationCanceledException)
{
    Console.WriteLine("超时取消");
}
\`\`\`

这个例子综合了：\`async/await\`、\`Task.WhenAll\`、\`SemaphoreSlim\` 限制并发、\`CancellationToken\` 超时取消、并发安全的字典更新（lock）。

### 十一、本章小结

- 异步编程解决"I/O 等待时线程浪费"的问题，让一个线程能服务多个并发请求。
- \`Task\` 代表异步操作；\`async/await\` 让异步代码像同步代码一样直观。
- \`Task.WhenAll\` 等待全部完成，\`Task.WhenAny\` 等待任一完成。
- \`CancellationToken\` 实现协作式取消，所有公开异步方法都应接受 \`CancellationToken\`。
- \`Task.Run\` 适合 CPU 密集，I/O 密集直接 \`await\` 异步 API。
- 常见陷阱：\`async void\`、\`.Result\`、不必要 \`async\`、忘记 \`await\`。
- 实战：\`WhenAll\` 并行多请求、\`SemaphoreSlim\` 限流、超时取消。
`,
  },
];

export { chapters };
