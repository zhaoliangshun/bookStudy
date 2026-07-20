// =============================================================
// C# 从入门到精通大全（终极版）—— 第8批章节
// 第八部分 泛型（共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   csharp3-ch38 : 第三十八章 泛型基础
//   csharp3-ch39 : 第三十九章 泛型约束
//   csharp3-ch40 : 第四十章 泛型类与泛型方法实战
//   csharp3-ch41 : 第四十一章 泛型接口与泛型委托
//   csharp3-ch42 : 第四十二章 协变与逆变
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第三十八章：泛型基础
  // ============================================================
  {
    id: 'csharp3-ch38',
    group: '第八部分 泛型',
    icon: '🧬',
    title: '第三十八章 泛型基础',
    content: `## 第三十八章　泛型基础

泛型（Generics）是 C# 最强大的特性之一，让你编写类型安全、可复用的代码。通过泛型，你可以定义一个"模板"，在使用时再指定具体类型，避免了装箱拆箱和类型转换。

### 一、为什么需要泛型

没有泛型时，我们需要为每种类型写重复代码，或用 \`object\` 牺牲类型安全：

\`\`\`csharp
// 问题：没有泛型时，代码重复或类型不安全

// 方案A：为每种类型写重复代码（糟糕）
class IntStack
{
    private int[] _items = new int[10];
    private int _count = 0;
    public void Push(int item) { _items[_count++] = item; }
    public int Pop() { return _items[--_count]; }
}

class StringStack
{
    private string[] _items = new string[10];
    private int _count = 0;
    public void Push(string item) { _items[_count++] = item; }
    public string Pop() { return _items[--_count]; }
}

// 方案B：用 object 但失去类型安全，有装箱开销（糟糕）
class ObjectStack
{
    private object[] _items = new object[10];
    private int _count = 0;
    public void Push(object item) { _items[_count++] = item; }
    public object Pop() { return _items[--_count]; }
}

// 使用 object 版本的问题
var objStack = new ObjectStack();
objStack.Push(42);           // 装箱：int → object
objStack.Push("hello");      // 混入不同类型
int num = (int)objStack.Pop(); // 拆箱：需要强制转换，可能抛异常
// int wrong = (int)objStack.Pop(); // 运行时异常！"hello" 不能转 int
\`\`\`

### 二、泛型类

泛型类用 \`<T>\` 定义类型参数，使用时指定具体类型：

\`\`\`csharp
// 泛型栈：一个类解决所有类型
class Stack<T>  // T 是类型参数（Type Parameter），习惯用 T 命名
{
    private T[] _items = new T[10];  // 类型参数用作字段类型
    private int _count = 0;

    // 类型参数用作方法参数类型
    public void Push(T item)
    {
        _items[_count++] = item;  // 无装箱，类型安全
    }

    // 类型参数用作返回值类型
    public T Pop()
    {
        return _items[--_count];  // 无拆箱，类型安全
    }

    public int Count => _count;
    public bool IsEmpty => _count == 0;
}

// 创建具体类型的栈
var intStack = new Stack<int>();      // T 被替换为 int
intStack.Push(10);
intStack.Push(20);
intStack.Push(30);
// intStack.Push("hello");  // 编译错误！类型不匹配
Console.WriteLine($"弹出：{intStack.Pop()}");  // 30（无需类型转换）

var stringStack = new Stack<string>();  // T 被替换为 string
stringStack.Push("Hello");
stringStack.Push("World");
Console.WriteLine($"弹出：{stringStack.Pop()}");  // World
\`\`\`

### 三、泛型方法

方法也可以独立定义泛型，不依赖泛型类：

\`\`\`csharp
// 泛型方法：交换两个值
void Swap<T>(ref T a, ref T b)
{
    T temp = a;  // 临时变量保存 a
    a = b;       // b 赋值给 a
    b = temp;    // 临时变量赋值给 b
}

int x = 10, y = 20;
Console.WriteLine($"交换前：x={x}, y={y}");
Swap<int>(ref x, ref y);  // 显式指定类型参数
Console.WriteLine($"交换后：x={x}, y={y}");

// 类型推断：编译器自动推断类型参数
string s1 = "Hello", s2 = "World";
Swap(ref s1, ref s2);  // 省略 <string>，编译器自动推断
Console.WriteLine($"s1={s1}, s2={s2}");

// 泛型方法：查找数组中的最大值
T FindMax<T>(T[] items) where T : IComparable<T>
{
    if (items.Length == 0)
        throw new ArgumentException("数组不能为空");

    T max = items[0];  // 假设第一个元素最大
    for (int i = 1; i < items.Length; i++)
    {
        // CompareTo 返回正数表示 this > other
        if (items[i].CompareTo(max) > 0)
            max = items[i];  // 更新最大值
    }
    return max;
}

int[] numbers = { 3, 7, 1, 9, 4, 6 };
int maxInt = FindMax(numbers);
Console.WriteLine($"最大整数：{maxInt}");  // 9

string[] names = { "Alice", "Bob", "Charlie", "David" };
string maxName = FindMax(names);
Console.WriteLine($"最大字符串：{maxName}");  // David（按字母顺序）
\`\`\`

### 四、泛型接口

\`\`\`csharp
// 泛型接口：定义泛型契约
interface IRepository<T>
{
    void Add(T item);         // 添加实体
    T? GetById(int id);      // 根据ID获取实体
    IEnumerable<T> GetAll(); // 获取所有实体
    void Update(T item);     // 更新实体
    void Delete(int id);     // 删除实体
}

// 泛型接口实现
class UserRepository : IRepository<string>
{
    private Dictionary<int, string> _users = new Dictionary<int, string>();

    public void Add(string item)
    {
        _users[_users.Count + 1] = item;  // 简单实现：自增ID
        Console.WriteLine($"添加用户：{item}");
    }

    public string? GetById(int id)
    {
        return _users.TryGetValue(id, out string? user) ? user : null;
    }

    public IEnumerable<string> GetAll()
    {
        return _users.Values;  // 返回所有用户名
    }

    public void Update(string item)
    {
        Console.WriteLine($"更新用户：{item}");
    }

    public void Delete(int id)
    {
        _users.Remove(id);
        Console.WriteLine($"删除用户 ID={id}");
    }
}

var userRepo = new UserRepository();
userRepo.Add("张三");
userRepo.Add("李四");
Console.WriteLine($"用户1：{userRepo.GetById(1)}");
\`\`\`

### 五、类型参数命名约定

| 约定 | 含义 | 示例 |
| --- | --- | --- |
| \`T\` | 通用类型（Type） | \`List<T>\` |
| \`TKey\` | 键类型 | \`Dictionary<TKey, TValue>\` |
| \`TValue\` | 值类型 | \`Dictionary<TKey, TValue>\` |
| \`TResult\` | 返回结果类型 | \`Func<T, TResult>\` |
| \`TElement\` | 元素类型 | \`IEnumerable<TElement>\` |
| \`TSource\` | 源类型 | LINQ 扩展方法 |

### 六、泛型的优势

\`\`\`csharp
// 泛型对比：性能与类型安全

// 1. 类型安全：编译时检查
List<int> numbers = new List<int>();
numbers.Add(42);
// numbers.Add("hello");  // 编译错误！类型不匹配

// 2. 无装箱/拆箱：性能更好
List<int> genericList = new List<int>();
ArrayList nonGenericList = new ArrayList();

// 测量：泛型 vs 非泛型
var sw = System.Diagnostics.Stopwatch.StartNew();
for (int i = 0; i < 10000000; i++)
    genericList.Add(i);  // 无装箱
sw.Stop();
Console.WriteLine($"泛型 List<int>：{sw.ElapsedMilliseconds}ms");

sw.Restart();
for (int i = 0; i < 10000000; i++)
    nonGenericList.Add(i);  // 每次都装箱！
sw.Stop();
Console.WriteLine($"非泛型 ArrayList：{sw.ElapsedMilliseconds}ms");

// 3. 代码复用：一份代码，多种类型
void PrintCollection<T>(IEnumerable<T> items)
{
    foreach (T item in items)
        Console.Write($"{item} ");
    Console.WriteLine();
}

PrintCollection(new int[] { 1, 2, 3 });
PrintCollection(new string[] { "a", "b", "c" });
PrintCollection(new List<double> { 1.1, 2.2, 3.3 });
\`\`\`

### 七、小结

- ⭐ 泛型让你编写类型安全、可复用的代码，避免装箱/拆箱和类型转换。
- ⭐ 泛型类用 \`<T>\` 定义，使用时指定具体类型参数。
- ⭐ 泛型方法可以独立定义，编译器通常能自动推断类型参数。
- ⭐ 泛型接口定义类型安全的契约，实现类指定具体类型。
- ⭐ 泛型是 .NET 集合框架的基础，\`List<T>\`、\`Dictionary<TKey, TValue>\` 等都是泛型类型。`,
  },

  // ============================================================
  // 第三十九章：泛型约束
  // ============================================================
  {
    id: 'csharp3-ch39',
    group: '第八部分 泛型',
    icon: '🔒',
    title: '第三十九章 泛型约束',
    content: `## 第三十九章　泛型约束

泛型约束（Generic Constraints）通过 \`where\` 关键字限制类型参数，让编译器知道类型参数具备哪些能力，从而在泛型方法中调用特定方法或访问特定属性。

### 一、where T : struct（值类型约束）

限制类型参数必须是值类型：

\`\`\`csharp
// 值类型约束：T 必须是值类型
class ValueTypeProcessor<T> where T : struct
{
    // 可以安全使用 default(T)（值类型的默认值不是 null）
    public T Default => default;  // 0 或 false 等

    // 可以为 null 检查（Nullable<T>）
    public bool IsDefault(T value)
    {
        return value.Equals(default(T));  // 值类型可以安全比较
    }
}

var intProcessor = new ValueTypeProcessor<int>();
Console.WriteLine($"默认值：{intProcessor.Default}");  // 0
Console.WriteLine($"0 是默认值：{intProcessor.IsDefault(0)}");  // True

// var stringProcessor = new ValueTypeProcessor<string>();  // 编译错误！string 不是值类型

// 实际应用：确保类型参数不能为 null
T? GetFirstOrNull<T>(T[] items) where T : struct
{
    // 值类型约束下，T? 是 Nullable<T>
    return items.Length > 0 ? items[0] : null;
}
\`\`\`

### 二、where T : class（引用类型约束）

限制类型参数必须是引用类型：

\`\`\`csharp
// 引用类型约束：T 必须是 class
class ReferenceTypeProcessor<T> where T : class
{
    // 可以与 null 比较
    public bool IsNull(T? item)
    {
        return item == null;  // 引用类型可以为 null
    }

    // 可以安全使用 as 运算符
    public T? TryConvert(object obj)
    {
        return obj as T;  // as 运算符要求引用类型
    }
}

var stringProcessor = new ReferenceTypeProcessor<string>();
Console.WriteLine($"null 检查：{stringProcessor.IsNull(null)}");  // True

// 实际应用：确保可以比较 null
T? FindByName<T>(IEnumerable<T> items, Func<T, string> nameSelector, string name)
    where T : class
{
    foreach (T item in items)
    {
        if (nameSelector(item) == name)
            return item;
    }
    return null;  // 返回 null 需要引用类型约束
}
\`\`\`

### 三、where T : new()（无参构造函数约束）

\`\`\`csharp
// new() 约束：T 必须有公共无参构造函数
class Factory<T> where T : new()
{
    // 可以在泛型方法中创建 T 的实例
    public T Create()
    {
        return new T();  // 调用无参构造函数
    }

    public T[] CreateArray(int count)
    {
        T[] items = new T[count];
        for (int i = 0; i < count; i++)
            items[i] = new T();  // 每个元素都调用构造函数
        return items;
    }
}

// 有公共无参构造函数的类
class Product
{
    public string Name { get; set; } = "";
    public Product() { }  // 公共无参构造函数
}

var factory = new Factory<Product>();
Product product = factory.Create();  // 自动调用 new Product()
Console.WriteLine($"创建产品：{product.Name}");

Product[] products = factory.CreateArray(3);
Console.WriteLine($"创建了 {products.Length} 个产品");

// class NoDefaultCtor { public NoDefaultCtor(int x) { } }
// var fail = new Factory<NoDefaultCtor>();  // 编译错误！没有无参构造函数
\`\`\`

### 四、where T : BaseClass（基类约束）

\`\`\`csharp
// 基类约束：T 必须是指定基类或其派生类
class Animal
{
    public string Name { get; set; } = "";
    public virtual void Speak() => Console.WriteLine($"{Name} 发出声音");
}

class Dog : Animal
{
    public override void Speak() => Console.WriteLine($"{Name}：汪汪汪！");
    public void Fetch() => Console.WriteLine($"{Name} 去捡球");
}

class Cat : Animal
{
    public override void Speak() => Console.WriteLine($"{Name}：喵喵喵！");
}

// 基类约束：T 必须是 Animal 或其子类
class AnimalShelter<T> where T : Animal, new()
{
    private List<T> _animals = new List<T>();

    public T Adopt(string name)
    {
        T animal = new T();  // new() 约束允许创建实例
        animal.Name = name;  // 基类约束允许访问 Animal 的属性
        _animals.Add(animal);
        return animal;
    }

    public void MakeAllSpeak()
    {
        foreach (T animal in _animals)
        {
            animal.Speak();  // 可以调用 Animal 的方法
        }
    }
}

var dogShelter = new AnimalShelter<Dog>();
Dog dog = dogShelter.Adopt("旺财");
dog.Fetch();  // 可以调用 Dog 特有的方法
dogShelter.MakeAllSpeak();

var catShelter = new AnimalShelter<Cat>();
catShelter.Adopt("咪咪");
catShelter.MakeAllSpeak();
\`\`\`

### 五、where T : IInterface（接口约束）

\`\`\`csharp
// 接口约束：T 必须实现指定接口
interface IEntity
{
    int Id { get; set; }
    DateTime CreatedAt { get; set; }
}

class User : IEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Username { get; set; } = "";
}

class Product : IEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
}

// 通用仓储：约束 T 必须实现 IEntity 和有 new()
class GenericRepository<T> where T : IEntity, new()
{
    private List<T> _items = new List<T>();
    private int _nextId = 1;

    public T Add(Action<T> configure)
    {
        T item = new T();  // new() 约束
        item.Id = _nextId++;  // IEntity 约束允许访问 Id
        item.CreatedAt = DateTime.Now;  // IEntity 约束允许访问 CreatedAt
        configure(item);  // 自定义配置
        _items.Add(item);
        return item;
    }

    public T? GetById(int id)
    {
        return _items.FirstOrDefault(i => i.Id == id);  // IEntity 约束允许访问 Id
    }

    public IEnumerable<T> GetAll() => _items;
}

var userRepo = new GenericRepository<User>();
userRepo.Add(u => u.Username = "zhangsan");
userRepo.Add(u => u.Username = "lisi");

foreach (var user in userRepo.GetAll())
    Console.WriteLine($"用户：{user.Username}（ID={user.Id}）");
\`\`\`

### 六、多重约束与特殊约束

\`\`\`csharp
// 多重约束：同时应用多个约束
class AdvancedProcessor<T> where T : class, IComparable<T>, new()
{
    // 约束组合：引用类型 + 可比较 + 有构造函数
    public T CreateAndCompare(T other)
    {
        T instance = new T();  // new() 约束
        int result = instance.CompareTo(other);  // IComparable<T> 约束
        Console.WriteLine($"比较结果：{result}");
        return instance;
    }
}

// unmanaged 约束：T 必须是非托管类型（简单值类型）
unsafe void ProcessUnmanaged<T>(T[] data) where T : unmanaged
{
    // 可以使用 sizeof(T) 和指针操作
    Console.WriteLine($"类型大小：{sizeof(T)} 字节");
    Console.WriteLine($"元素数量：{data.Length}");
}

ProcessUnmanaged(new int[] { 1, 2, 3 });     // 4 字节
ProcessUnmanaged(new double[] { 1.0, 2.0 }); // 8 字节
// ProcessUnmanaged(new string[] { "a" });   // 编译错误！string 不是非托管类型

// notnull 约束：T 不能为 null
T EnsureNotNull<T>(T value) where T : notnull
{
    // 编译器保证 T 不能为 null
    return value;
}

// default 关键字：获取类型参数的默认值
T GetDefault<T>()
{
    // default(T) 或 default：引用类型返回 null，值类型返回 0/false
    return default;
}

Console.WriteLine($"int 默认值：{GetDefault<int>()}");  // 0
Console.WriteLine($"string 默认值：{GetDefault<string>() == null}");  // True
\`\`\`

### 七、约束速查表

| 约束 | 含义 | 允许的操作 |
| --- | --- | --- |
| \`where T : struct\` | 值类型 | default(T) 非 null，可比较 |
| \`where T : class\` | 引用类型 | 可为 null，as 转换 |
| \`where T : new()\` | 有无参构造函数 | new T() 创建实例 |
| \`where T : BaseClass\` | 指定基类 | 访问基类成员 |
| \`where T : IInterface\` | 指定接口 | 调用接口方法 |
| \`where T : unmanaged\` | 非托管类型 | sizeof(T)，指针操作 |
| \`where T : notnull\` | 不能为 null | 编译器保证非空 |

### 八、小结

- ⭐ 泛型约束用 \`where T : 约束\` 限制类型参数的能力范围。
- ⭐ \`struct\` 约束值类型，\`class\` 约束引用类型，\`new()\` 约束可实例化。
- ⭐ 基类约束允许访问基类成员，接口约束允许调用接口方法。
- ⭐ 可以组合多个约束，用逗号分隔。
- ⭐ \`unmanaged\` 约束用于高性能场景，\`notnull\` 约束保证非空。`,
  },

  // ============================================================
  // 第四十章：泛型类与泛型方法实战
  // ============================================================
  {
    id: 'csharp3-ch40',
    group: '第八部分 泛型',
    icon: '🏗️',
    title: '第四十章 泛型类与泛型方法实战',
    content: `## 第四十章　泛型类与泛型方法实战

这一章通过实际项目场景，展示泛型在真实开发中的强大应用。从通用仓储到工厂模式，泛型让代码复用达到新高度。

### 一、构建通用仓储（Repository Pattern）

\`\`\`csharp
// 通用仓储模式：一份代码处理所有实体类型
interface IEntity
{
    int Id { get; set; }
}

class User : IEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
}

class Order : IEntity
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = "";
    public decimal TotalAmount { get; set; }
}

// 通用仓储：处理所有 IEntity 类型
class Repository<T> where T : IEntity
{
    private List<T> _items = new List<T>();  // 内部存储
    private int _nextId = 1;                 // 自增ID

    // 添加实体
    public T Add(T item)
    {
        item.Id = _nextId++;  // 自动分配ID
        _items.Add(item);
        return item;
    }

    // 根据ID查找
    public T? GetById(int id)
    {
        return _items.FirstOrDefault(i => i.Id == id);
    }

    // 获取所有
    public List<T> GetAll()
    {
        return _items.ToList();  // 返回副本，保护内部数据
    }

    // 更新实体
    public bool Update(T updated)
    {
        int index = _items.FindIndex(i => i.Id == updated.Id);
        if (index < 0) return false;
        _items[index] = updated;  // 替换
        return true;
    }

    // 删除实体
    public bool Delete(int id)
    {
        int removed = _items.RemoveAll(i => i.Id == id);
        return removed > 0;
    }

    // 条件查询
    public List<T> Find(Func<T, bool> predicate)
    {
        return _items.Where(predicate).ToList();
    }

    // 统计
    public int Count => _items.Count;
}

// 使用通用仓储
var userRepo = new Repository<User>();
userRepo.Add(new User { Name = "张三", Email = "zhangsan@example.com" });
userRepo.Add(new User { Name = "李四", Email = "lisi@example.com" });

var orderRepo = new Repository<Order>();
orderRepo.Add(new Order { CustomerName = "张三", TotalAmount = 299.99m });
orderRepo.Add(new Order { CustomerName = "李四", TotalAmount = 599.99m });

Console.WriteLine("所有用户：");
foreach (var u in userRepo.GetAll())
    Console.WriteLine($"  ID={u.Id}, 姓名={u.Name}, 邮箱={u.Email}");

Console.WriteLine("\\n所有订单：");
foreach (var o in orderRepo.GetAll())
    Console.WriteLine($"  ID={o.Id}, 客户={o.CustomerName}, 金额={o.TotalAmount:C}");
\`\`\`

### 二、通用工具类

\`\`\`csharp
// 通用工具类：各种实用泛型方法
static class GenericUtils
{
    // 深拷贝列表
    public static List<T> CloneList<T>(List<T> source) where T : ICloneable
    {
        List<T> result = new List<T>(source.Count);
        foreach (T item in source)
        {
            // Clone() 返回 object，需要显式转换
            result.Add((T)item.Clone());
        }
        return result;
    }

    // 安全获取字典值
    public static TValue? GetOrDefault<TKey, TValue>(
        Dictionary<TKey, TValue> dict, TKey key)
    {
        return dict.TryGetValue(key, out TValue? value) ? value : default;
    }

    // 将列表转换为只读集合
    public static IReadOnlyList<T> AsReadOnly<T>(IEnumerable<T> source)
    {
        return source.ToList().AsReadOnly();  // 返回只读包装
    }

    // 合并两个字典
    public static Dictionary<TKey, TValue> Merge<TKey, TValue>(
        Dictionary<TKey, TValue> first,
        Dictionary<TKey, TValue> second) where TKey : notnull
    {
        var result = new Dictionary<TKey, TValue>(first);
        foreach (var kvp in second)
        {
            result[kvp.Key] = kvp.Value;  // 覆盖或添加
        }
        return result;
    }

    // 分页
    public static (List<T> Items, int TotalPages) Paginate<T>(
        IEnumerable<T> source, int page, int pageSize)
    {
        var items = source.ToList();  // 转为列表
        int totalPages = (int)Math.Ceiling((double)items.Count / pageSize);
        int skip = (page - 1) * pageSize;
        var pageItems = items.Skip(skip).Take(pageSize).ToList();
        return (pageItems, totalPages);
    }
}

// 使用通用工具
var dict = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2 };
Console.WriteLine($"key 'a'：{GenericUtils.GetOrDefault(dict, "a")}");  // 1
Console.WriteLine($"key 'c'：{GenericUtils.GetOrDefault(dict, "c")}");  // 0

var numbers = Enumerable.Range(1, 100);
var (pageItems, totalPages) = GenericUtils.Paginate(numbers, 3, 10);
Console.WriteLine($"第3页，共{totalPages}页：{string.Join(", ", pageItems)}");
\`\`\`

### 三、泛型工厂模式

\`\`\`csharp
// 泛型工厂：根据类型创建对象
static class GenericFactory
{
    // 简单工厂：创建带默认配置的对象
    public static T Create<T>(Action<T>? configure = null) where T : new()
    {
        T instance = new T();  // 创建实例
        configure?.Invoke(instance);  // 应用配置
        return instance;
    }

    // 注册型工厂：预注册类型映射
    private static Dictionary<Type, Func<object>> _registry = new();

    // 注册创建函数
    public static void Register<T>(Func<T> creator)
    {
        _registry[typeof(T)] = () => creator()!;
    }

    // 解析（创建）对象
    public static T Resolve<T>()
    {
        if (_registry.TryGetValue(typeof(T), out var creator))
            return (T)creator();
        throw new InvalidOperationException($"未注册类型 {typeof(T).Name}");
    }
}

// 使用简单工厂
class ServiceConfig
{
    public string Url { get; set; } = "";
    public int Timeout { get; set; } = 30;
}

var config = GenericFactory.Create<ServiceConfig>(cfg =>
{
    cfg.Url = "https://api.example.com";
    cfg.Timeout = 60;
});
Console.WriteLine($"URL={config.Url}, 超时={config.Timeout}秒");

// 使用注册型工厂
GenericFactory.Register(() => new ServiceConfig
{
    Url = "https://default.example.com",
    Timeout = 30
});

var defaultConfig = GenericFactory.Resolve<ServiceConfig>();
Console.WriteLine($"默认URL={defaultConfig.Url}, 超时={defaultConfig.Timeout}秒");
\`\`\`

### 四、泛型方法类型推断

\`\`\`csharp
// 类型推断：编译器根据参数自动推断类型参数
static class GenericInference
{
    // 方法签名中类型参数出现在参数位置
    public static T First<T>(IEnumerable<T> source)
    {
        return source.First();  // 返回类型从参数推断
    }

    // 多个类型参数：从不同参数推断
    public static TResult Transform<T, TResult>(T input, Func<T, TResult> transform)
    {
        return transform(input);  // TResult 从 transform 的返回值推断
    }

    // 链式转换
    public static T Chain<T>(T initial, params Func<T, T>[] transforms)
    {
        T current = initial;
        foreach (var transform in transforms)
            current = transform(current);  // 依次应用转换
        return current;
    }
}

// 类型推断示例
var numbers = new[] { 1, 2, 3, 4, 5 };
int first = GenericInference.First(numbers);  // T 推断为 int
Console.WriteLine($"第一个：{first}");

// 多元类型推断
string result = GenericInference.Transform(42, n => $"数字：{n}");
// T 推断为 int，TResult 推断为 string
Console.WriteLine(result);

// 链式转换
int final = GenericInference.Chain(10,
    x => x + 5,      // 加5
    x => x * 2,      // 乘2
    x => x - 3       // 减3
);
Console.WriteLine($"链式转换：10 → {final}");  // (10+5)*2-3 = 27
\`\`\`

### 五、实战：缓存管理器

\`\`\`csharp
// 泛型缓存管理器：统一管理不同类型的数据缓存
class CacheManager<TKey, TValue> where TKey : notnull
{
    private Dictionary<TKey, CacheEntry> _cache = new();
    private TimeSpan _defaultExpiration;

    class CacheEntry
    {
        public TValue Value { get; }
        public DateTime ExpiresAt { get; }

        public CacheEntry(TValue value, TimeSpan expiration)
        {
            Value = value;
            ExpiresAt = DateTime.Now.Add(expiration);  // 计算过期时间
        }

        public bool IsExpired => DateTime.Now > ExpiresAt;
    }

    public CacheManager(TimeSpan defaultExpiration)
    {
        _defaultExpiration = defaultExpiration;
    }

    // 获取或添加缓存
    public TValue GetOrAdd(TKey key, Func<TValue> factory)
    {
        return GetOrAdd(key, factory, _defaultExpiration);
    }

    public TValue GetOrAdd(TKey key, Func<TValue> factory, TimeSpan expiration)
    {
        // 检查缓存是否有效
        if (_cache.TryGetValue(key, out var entry) && !entry.IsExpired)
        {
            Console.WriteLine($"缓存命中：{key}");
            return entry.Value;
        }

        // 缓存未命中或过期，创建新值
        Console.WriteLine($"缓存未命中：{key}，创建新值");
        TValue value = factory();
        _cache[key] = new CacheEntry(value, expiration);
        return value;
    }

    // 清除过期缓存
    public int Cleanup()
    {
        var expiredKeys = _cache
            .Where(kvp => kvp.Value.IsExpired)
            .Select(kvp => kvp.Key)
            .ToList();

        foreach (var key in expiredKeys)
            _cache.Remove(key);

        Console.WriteLine($"清理了 {expiredKeys.Count} 个过期缓存");
        return expiredKeys.Count;
    }

    public int Count => _cache.Count;
}

// 使用缓存管理器
var cache = new CacheManager<string, int>(TimeSpan.FromSeconds(5));

// 第一次访问：缓存未命中，执行工厂方法
int value1 = cache.GetOrAdd("userCount", () =>
{
    Console.WriteLine("  从数据库查询用户数量...");
    return 100;  // 模拟数据库查询
});

// 第二次访问：缓存命中，直接返回
int value2 = cache.GetOrAdd("userCount", () =>
{
    Console.WriteLine("  从数据库查询用户数量...");
    return 100;
});

Console.WriteLine($"缓存条目数：{cache.Count}");
\`\`\`

### 六、小结

- ⭐ 泛型仓储模式一份代码处理所有实体类型，减少重复。
- ⭐ 泛型工具类提供类型安全的通用方法，如分页、合并、克隆。
- ⭐ 泛型工厂模式支持类型安全的对象创建，配合依赖注入使用。
- ⭐ 编译器能根据参数自动推断类型参数，代码更简洁。
- ⭐ 泛型约束确保类型参数具备所需能力，在编译时就能发现错误。`,
  },

  // ============================================================
  // 第四十一章：泛型接口与泛型委托
  // ============================================================
  {
    id: 'csharp3-ch41',
    group: '第八部分 泛型',
    icon: '🔌',
    title: '第四十一章 泛型接口与泛型委托',
    content: `## 第四十一章　泛型接口与泛型委托

.NET 提供了丰富的泛型接口和泛型委托，它们是 LINQ、集合框架和事件系统的基础。掌握这些内置泛型类型，能大幅提升你的开发效率。

### 一、IComparable\<T\>：类型安全比较

\`\`\`csharp
// IComparable<T>：实现类型安全的排序
class Score : IComparable<Score>
{
    public string Player { get; }
    public int Points { get; }
    public DateTime AchievedAt { get; }

    public Score(string player, int points, DateTime achievedAt)
    {
        Player = player;
        Points = points;
        AchievedAt = achievedAt;
    }

    // 实现 CompareTo：按分数降序，分数相同按时间升序
    public int CompareTo(Score? other)
    {
        if (other == null) return 1;

        // 先按分数降序比较（反转符号）
        int pointsCompare = other.Points.CompareTo(Points);
        if (pointsCompare != 0) return pointsCompare;

        // 分数相同，按时间升序（先达到的排前面）
        return AchievedAt.CompareTo(other.AchievedAt);
    }

    public override string ToString() => $"{Player}: {Points}分 ({AchievedAt:yyyy-MM-dd})";
}

var scores = new List<Score>
{
    new Score("张三", 95, new DateTime(2024, 3, 15)),
    new Score("李四", 95, new DateTime(2024, 3, 10)),
    new Score("王五", 88, new DateTime(2024, 3, 12)),
    new Score("赵六", 100, new DateTime(2024, 3, 14))
};

scores.Sort();  // 使用 IComparable<Score> 排序
Console.WriteLine("排行榜：");
foreach (var s in scores)
    Console.WriteLine($"  {s}");
\`\`\`

### 二、IEquatable\<T\>：类型安全相等比较

\`\`\`csharp
// IEquatable<T>：避免装箱，提供类型安全的相等比较
class Employee : IEquatable<Employee>
{
    public string Id { get; }
    public string Name { get; }

    public Employee(string id, string name)
    {
        Id = id;
        Name = name;
    }

    // 类型安全的 Equals：避免装箱
    public bool Equals(Employee? other)
    {
        if (other is null) return false;
        if (ReferenceEquals(this, other)) return true;
        return Id == other.Id;  // 按工号判断相等
    }

    // 重写 object.Equals：委托给 IEquatable<T>.Equals
    public override bool Equals(object? obj)
    {
        return Equals(obj as Employee);  // 委托给类型安全版本
    }

    // 重写 GetHashCode：与 Equals 保持一致
    public override int GetHashCode() => Id.GetHashCode();

    // 重载 == 运算符
    public static bool operator ==(Employee? left, Employee? right)
    {
        if (left is null) return right is null;
        return left.Equals(right);
    }

    public static bool operator !=(Employee? left, Employee? right)
        => !(left == right);
}

var emp1 = new Employee("E001", "张三");
var emp2 = new Employee("E001", "张三（别名）");
var emp3 = new Employee("E002", "李四");

Console.WriteLine($"emp1 == emp2: {emp1 == emp2}");  // True（同工号）
Console.WriteLine($"emp1 == emp3: {emp1 == emp3}");  // False（不同工号）

// IEquatable<T> 在字典中的性能优势
var dict = new Dictionary<Employee, string>();
dict[emp1] = "部门A";
Console.WriteLine($"emp2 的部门：{dict[emp2]}");  // 部门A（同工号匹配）
\`\`\`

### 三、IEnumerable\<T\> 与 IEnumerator\<T\>

\`\`\`csharp
// IEnumerable<T>：可枚举的集合
// IEnumerator<T>：枚举器，遍历集合

// 自定义可枚举集合
class Countdown : IEnumerable<int>
{
    private int _start;

    public Countdown(int start)
    {
        _start = start;
    }

    // 实现 IEnumerable<int>.GetEnumerator()
    public IEnumerator<int> GetEnumerator()
    {
        // 返回自定义枚举器
        return new CountdownEnumerator(_start);
    }

    // 显式实现非泛型版本（兼容旧代码）
    System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }

    // 自定义枚举器
    private class CountdownEnumerator : IEnumerator<int>
    {
        private int _current;
        private int _start;

        public CountdownEnumerator(int start)
        {
            _start = start;
            _current = start + 1;  // 初始位置在第一个元素之前
        }

        public int Current => _current;

        object System.Collections.IEnumerator.Current => Current;

        public bool MoveNext()
        {
            _current--;  // 递减
            return _current >= 0;  // 直到 0
        }

        public void Reset()
        {
            _current = _start + 1;
        }

        public void Dispose() { }
    }
}

// 使用自定义集合
var countdown = new Countdown(5);
Console.WriteLine("倒计时：");
foreach (int n in countdown)
    Console.Write($"{n} ");  // 5 4 3 2 1 0
Console.WriteLine();
\`\`\`

### 四、泛型委托

\`\`\`csharp
// .NET 内置泛型委托

// 1. Action<T>：无返回值的方法
// Action, Action<T>, Action<T1,T2>... 最多 16 个参数
Action<string> log = message => Console.WriteLine($"[日志] {message}");
log("系统启动");  // 输出：[日志] 系统启动

Action<string, int> progress = (task, percent) =>
    Console.WriteLine($"{task}：进度 {percent}%");
progress("下载文件", 75);

// 2. Func<T, TResult>：有返回值的方法
// Func<TResult>, Func<T, TResult>, Func<T1,T2,TResult>... 最多 16 个参数
Func<int, int, int> add = (a, b) => a + b;
Console.WriteLine($"10 + 20 = {add(10, 20)}");

Func<string, int> getLength = s => s.Length;
Console.WriteLine($"\"Hello\" 长度：{getLength("Hello")}");

// 3. Predicate<T>：返回 bool 的方法（等价于 Func<T, bool>）
Predicate<int> isEven = n => n % 2 == 0;
Console.WriteLine($"10 是偶数：{isEven(10)}");  // True

// 4. Comparison<T>：比较两个值的方法
Comparison<string> compareByLength = (a, b) => a.Length.CompareTo(b.Length);
string[] words = { "apple", "kiwi", "banana", "grape" };
Array.Sort(words, compareByLength);
Console.WriteLine($"按长度排序：{string.Join(", ", words)}");
// kiwi, grape, apple, banana
\`\`\`

### 五、EventHandler\<T\>

\`\`\`csharp
// EventHandler<TEventArgs>：泛型事件处理委托
// 自定义事件参数类
class OrderEventArgs : EventArgs
{
    public string OrderId { get; }
    public decimal Amount { get; }
    public DateTime Timestamp { get; }

    public OrderEventArgs(string orderId, decimal amount)
    {
        OrderId = orderId;
        Amount = amount;
        Timestamp = DateTime.Now;
    }
}

class OrderService
{
    // 使用 EventHandler<T> 声明事件
    public event EventHandler<OrderEventArgs>? OrderCreated;

    public void CreateOrder(string orderId, decimal amount)
    {
        Console.WriteLine($"创建订单：{orderId}，金额 {amount:C}");

        // 触发事件：通知所有订阅者
        OrderCreated?.Invoke(this, new OrderEventArgs(orderId, amount));
    }
}

class NotificationService
{
    public void OnOrderCreated(object? sender, OrderEventArgs e)
    {
        Console.WriteLine($"[通知服务] 订单 {e.OrderId} 已创建，金额 {e.Amount:C}");
    }
}

class LogService
{
    public void OnOrderCreated(object? sender, OrderEventArgs e)
    {
        Console.WriteLine($"[日志服务] {e.Timestamp:HH:mm:ss} - 订单 {e.OrderId}");
    }
}

var orderService = new OrderService();
var notification = new NotificationService();
var log = new LogService();

// 订阅事件
orderService.OrderCreated += notification.OnOrderCreated;
orderService.OrderCreated += log.OnOrderCreated;

// 触发事件
orderService.CreateOrder("ORD-001", 299.99m);
\`\`\`

### 六、小结

- ⭐ \`IComparable<T>\` 实现类型安全的排序，无需装箱。
- ⭐ \`IEquatable<T>\` 提供类型安全的相等比较，提升字典性能。
- ⭐ \`IEnumerable<T>\`/\`IEnumerator<T>\` 是 LINQ 和 foreach 的基础。
- ⭐ \`Action<T>\` 表示无返回值的方法，\`Func<T, TResult>\` 表示有返回值的方法。
- ⭐ \`Predicate<T>\` 等价于 \`Func<T, bool>\`，\`Comparison<T>\` 用于自定义排序。
- ⭐ \`EventHandler<TEventArgs>\` 是标准的事件处理委托模式。`,
  },

  // ============================================================
  // 第四十二章：协变与逆变
  // ============================================================
  {
    id: 'csharp3-ch42',
    group: '第八部分 泛型',
    icon: '↔️',
    title: '第四十二章 协变与逆变',
    content: `## 第四十二章　协变与逆变

协变（Covariance）和逆变（Contravariance）是泛型接口和委托中的高级特性，让你在特定场景下进行更灵活的类型转换。理解它们需要先掌握一个关键概念：类型参数的安全使用方向。

### 一、核心概念

- **协变（out）**：允许将更具体的类型赋值给更通用的类型。如 \`IEnumerable<string>\` → \`IEnumerable<object>\`。
- **逆变（in）**：允许将更通用的类型赋值给更具体的类型。如 \`Action<object>\` → \`Action<string>\`。
- **不变（Invariant）**：不允许任何类型转换。如 \`List<T>\`。

### 二、协变（out 关键字）

协变用于"输出"位置——类型参数只作为返回值或只读属性：

\`\`\`csharp
// 协变示例：IEnumerable<T> 用 out T 标记
// interface IEnumerable<out T> { ... }

// 协变允许：子类型集合赋值给父类型集合
IEnumerable<string> strings = new List<string> { "Hello", "World" };
IEnumerable<object> objects = strings;  // 协变：string → object
// 这是安全的，因为 IEnumerable<T> 只"输出" T

foreach (object obj in objects)
    Console.WriteLine(obj);  // 安全：每个 string 都是 object

// 自定义协变接口
interface IProducer<out T>  // out 关键字标记协变
{
    T Produce();  // T 只出现在输出位置（返回值）
    // void Consume(T item);  // 编译错误！out 类型参数不能作为输入参数
}

class StringProducer : IProducer<string>
{
    public string Produce() => "Hello from StringProducer";
}

// 协变：IProducer<string> 可以赋值给 IProducer<object>
IProducer<string> stringProducer = new StringProducer();
IProducer<object> objectProducer = stringProducer;  // 协变转换
object result = objectProducer.Produce();  // 返回 string，可以隐式转为 object
Console.WriteLine(result);
\`\`\`

### 三、逆变（in 关键字）

逆变用于"输入"位置——类型参数只作为方法参数：

\`\`\`csharp
// 逆变示例：Action<T> 用 in T 标记
// delegate void Action<in T>(T obj);

// 逆变允许：接受父类型的委托可以接受子类型
Action<object> objectAction = obj => Console.WriteLine($"处理：{obj}");
Action<string> stringAction = objectAction;  // 逆变：object → string
// 这是安全的：能处理 object 的方法，肯定也能处理 string

stringAction("Hello");  // 输出：处理：Hello

// 自定义逆变接口
interface IConsumer<in T>  // in 关键字标记逆变
{
    void Consume(T item);  // T 只出现在输入位置（方法参数）
    // T Produce();  // 编译错误！in 类型参数不能作为返回值
}

class ObjectConsumer : IConsumer<object>
{
    public void Consume(object item)
    {
        Console.WriteLine($"消费：{item}");
    }
}

// 逆变：IConsumer<object> 可以赋值给 IConsumer<string>
IConsumer<object> objConsumer = new ObjectConsumer();
IConsumer<string> strConsumer = objConsumer;  // 逆变转换
strConsumer.Consume("Hello");  // 安全：能处理 object 的方法也能处理 string
\`\`\`

### 四、内置协变与逆变类型

\`\`\`csharp
// === 协变接口 ===
// IEnumerable<out T>
IEnumerable<string> names = new List<string> { "张三", "李四" };
IEnumerable<object> objects = names;  // 协变 OK

// IReadOnlyList<out T>
IReadOnlyList<string> readOnlyNames = new List<string> { "A", "B" };
IReadOnlyList<object> readOnlyObjects = readOnlyNames;  // 协变 OK

// === 逆变接口 ===
// IComparer<in T>
IComparer<object> objectComparer = Comparer<object>.Default;
IComparer<string> stringComparer = objectComparer;  // 逆变 OK

// === 协变委托 ===
// Func<out TResult>
Func<string> getString = () => "Hello";
Func<object> getObject = getString;  // 协变 OK

// === 逆变委托 ===
// Action<in T>
Action<object> objectAction = obj => Console.WriteLine(obj);
Action<string> stringAction = objectAction;  // 逆变 OK

// === 协变 + 逆变组合 ===
// Func<in T, out TResult>
Func<object, string> func1 = obj => obj.ToString() ?? "";
Func<string, object> func2 = func1;  // 逆变T(in) + 协变TResult(out)
\`\`\`

### 五、何时使用协变与逆变

\`\`\`csharp
// 协变使用场景：只读集合、工厂、数据源
interface IReadOnlyRepository<out T>
{
    T? GetById(int id);
    IEnumerable<T> GetAll();
    // 不能有 Add、Update 等方法（T 作为输入参数）
}

class User
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}

class AdminUser : User
{
    public string Role { get; set; } = "";
}

class UserRepository : IReadOnlyRepository<User>
{
    private List<User> _users = new()
    {
        new User { Id = 1, Name = "张三" },
        new AdminUser { Id = 2, Name = "管理员", Role = "SuperAdmin" }
    };

    public User? GetById(int id) => _users.FirstOrDefault(u => u.Id == id);
    public IEnumerable<User> GetAll() => _users;
}

// 协变：IReadOnlyRepository<User> 可以赋值给 IReadOnlyRepository<object>
IReadOnlyRepository<User> userRepo = new UserRepository();
IReadOnlyRepository<object> objRepo = userRepo;  // 协变

// 逆变使用场景：比较器、处理器、消费者
interface IEventHandler<in T>
{
    void Handle(T eventData);
    // 不能返回 T（T 不能出现在输出位置）
}

class LogEvent
{
    public string Message { get; set; } = "";
}

class ErrorEvent : LogEvent
{
    public string StackTrace { get; set; } = "";
}

class LogEventHandler : IEventHandler<LogEvent>
{
    public void Handle(LogEvent eventData)
    {
        Console.WriteLine($"[日志] {eventData.Message}");
    }
}

// 逆变：IEventHandler<LogEvent> 可以赋值给 IEventHandler<ErrorEvent>
IEventHandler<LogEvent> logHandler = new LogEventHandler();
IEventHandler<ErrorEvent> errorHandler = logHandler;  // 逆变
errorHandler.Handle(new ErrorEvent { Message = "错误", StackTrace = "..." });
\`\`\`

### 六、不变（Invariant）——为什么 List\<T\> 不是协变

\`\`\`csharp
// List<T> 是不变的：T 既作为输入又作为输出
// 如果 List<T> 是协变的，会导致类型安全问题：

// 假设 List<T> 是协变的（实际不是！）
// List<string> strings = new List<string> { "Hello" };
// List<object> objects = strings;  // 假设允许
// objects.Add(42);  // 添加 int 到 string 列表！
// string s = strings[1];  // 运行时异常！42 不是 string

// 因此 List<T> 是不变的——这是类型安全的要求

// 正确做法：用只读接口（如 IEnumerable<T>）实现协变
IEnumerable<string> stringList = new List<string> { "Hello", "World" };
IEnumerable<object> objectList = stringList;  // 安全：只读，不能添加
\`\`\`

### 七、协变逆变速查表

| 类型 | 变体 | 类型参数 | 说明 |
| --- | --- | --- | --- |
| \`IEnumerable<T>\` | 协变 | \`out T\` | 只读集合 |
| \`IReadOnlyList<T>\` | 协变 | \`out T\` | 只读列表 |
| \`IComparer<T>\` | 逆变 | \`in T\` | 比较器 |
| \`IEqualityComparer<T>\` | 逆变 | \`in T\` | 相等比较器 |
| \`Action<T>\` | 逆变 | \`in T\` | 无返回值委托 |
| \`Func<TResult>\` | 协变 | \`out TResult\` | 有返回值委托 |
| \`Func<T, TResult>\` | 逆变+协变 | \`in T, out TResult\` | 参数逆变，返回值协变 |
| \`EventHandler<T>\` | 逆变 | \`in T\` | 事件处理 |
| \`List<T>\` | 不变 | 无 | 可读写集合 |
| \`Dictionary<TKey,TValue>\` | 不变 | 无 | 键值对集合 |

### 八、小结

- ⭐ 协变（\`out\`）允许将子类型集合赋值给父类型集合，只用于输出位置。
- ⭐ 逆变（\`in\`）允许将父类型委托赋值给子类型委托，只用于输入位置。
- ⭐ \`IEnumerable<T>\` 是协变的，\`Action<T>\` 是逆变的。
- ⭐ 可读写的集合（如 \`List<T>\`）是不变的，这是类型安全的要求。
- ⭐ 定义泛型接口时，考虑使用 \`out\` 或 \`in\` 增加灵活性。`,
  },
  {
    id: 'csharp3-ch43',
    group: '第八部分 泛型',
    icon: '⚡',
    title: '第四十三章 泛型性能与最佳实践',
    content: `## 第四十三章　泛型性能与最佳实践

泛型不仅能提升代码复用与类型安全，还能在运行时获得更好的性能。本章用具体数据展示泛型 vs 非泛型的性能差异，讲解泛型缓存、值类型装箱拆箱、泛型特化等高级话题，并总结日常开发中的最佳实践。

### 一、泛型 vs object：性能对比

\`object\` 类型在操作值类型时会发生装箱，泛型则不会。

\`\`\`csharp
using System.Diagnostics;

// 非泛型版本：用 ArrayList（存放 object）
var listObj = new System.Collections.ArrayList();
// JIT 会对每个值类型进行装箱（boxing）
for (int i = 0; i < 1_000_000; i++) listObj.Add(i);

// 泛型版本：用 List<int>
var listGen = new List<int>();
// 不装箱，直接写入预分配的 int[] 数组
for (int i = 0; i < 1_000_000; i++) listGen.Add(i);

var sw1 = Stopwatch.StartNew();
long sum1 = 0;
foreach (var x in listObj) sum1 += (int)x;  // 每次循环都拆箱
sw1.Stop();

var sw2 = Stopwatch.StartNew();
long sum2 = 0;
foreach (var x in listGen) sum2 += x;        // 无拆箱
sw2.Stop();

Console.WriteLine($"ArrayList (object): {sw1.ElapsedMilliseconds} ms, sum={sum1}");
Console.WriteLine($"List<int>  (泛型)  : {sw2.ElapsedMilliseconds} ms, sum={sum2}");
// 典型输出：泛型版本快 3-5 倍
\`\`\`

### 二、避免装箱的几种场景

\`\`\`csharp
// 1. 用 List<int> 代替 ArrayList，避免值类型装箱
List<int> ids = new() { 1, 2, 3 };
// ids.Add(4) 不装箱

// 2. 用 Dictionary<string, int> 代替 Hashtable（string 也避免拆箱）
Dictionary<string, int> ages = new() { ["Tom"] = 18 };
int tomAge = ages["Tom"];  // 不拆箱

// 3. 用泛型委托 Func<int, int> 代替 Delegate
Func<int, int> doubler = x => x * 2;  // 不装箱
int r = doubler(21);

// 4. 用 Nullable<T> 代替魔术值
int? maybe = null;       // 不装箱（Nullable<int> 是值类型）
int actual = maybe ?? 0;
\`\`\`

### 三、值类型 vs 引用类型的泛型特化

JIT 编译器会为值类型泛型参数生成"特化代码"，每个值类型一份；引用类型则共享代码。

\`\`\`csharp
// 演示：List<int> 和 List<long> 是不同的 JIT 代码
// 但 List<string> 和 List<object> 共享同一份代码（都是引用类型）

// 实际意义：值类型用泛型零开销，引用类型几乎无差异
static void Process<T>(T item)
{
    // typeof(T) 在 IL 层面是未知的
    // 运行时通过反射：typeof(T).IsValueType
    Console.WriteLine(typeof(T).IsValueType ? "值类型" : "引用类型");
}
Process(42);        // 输出：值类型
Process("hello");   // 输出：引用类型
\`\`\`

### 四、泛型集合的内存布局

\`\`\`csharp
// List<T> 内部：T[] _items（连续内存）
// 优点：缓存友好，遍历快
// 缺点：中间插入 O(n)

// LinkedList<T> 内部：双向链表节点
// 优点：插入删除 O(1)
// 缺点：不连续内存，缓存不友好

// 演示 List<T> 容量增长
var list = new List<int>();
for (int i = 0; i < 10; i++)
{
    list.Add(i);
    Console.WriteLine($"Count={list.Count,2}  Capacity={list.Capacity,2}");
}
// 输出：1,2,4,4,8,8,8,8,16,16（容量翻倍策略）
\`\`\`

### 五、泛型缓存：避免重复创建对象

\`\`\`csharp
// 场景：频繁创建同一 key 的对象 → 用 Dictionary 缓存
// 注意：ConcurrentDictionary 提供线程安全版本
class UserService
{
    private readonly Dictionary<int, User> _cache = new();
    private readonly object _lock = new();

    public User GetOrCreate(int id)
    {
        if (_cache.TryGetValue(id, out var u)) return u;
        lock (_lock)  // 双重检查锁
        {
            if (!_cache.TryGetValue(id, out u))
            {
                u = new User { Id = id, Name = $"User-{id}" };
                _cache[id] = u;
            }
        }
        return u;
    }
}
record User { public int Id; public string Name = ""; }

var svc = new UserService();
Console.WriteLine(svc.GetOrCreate(1).Name);  // 第一次创建
Console.WriteLine(svc.GetOrCreate(1).Name);  // 命中缓存
\`\`\`

### 六、泛型与依赖注入

依赖注入（DI）容器底层重度依赖泛型。

\`\`\`csharp
// 简化版 DI 容器（只演示核心原理）
class Container
{
    private readonly Dictionary<Type, Func<object>> _regs = new();

    public void Register<T>(Func<T> factory) where T : class
        => _regs[typeof(T)] = () => factory()!;

    public T Resolve<T>() where T : class
    {
        if (_regs.TryGetValue(typeof(T), out var f)) return (T)f();
        throw new InvalidOperationException($"未注册 {typeof(T).Name}");
    }
}

var c = new Container();
c.Register<Random>(() => new Random());
c.Register<DateTime>(() => DateTime.Now);
Console.WriteLine(c.Resolve<Random>().Next(100));
Console.WriteLine(c.Resolve<DateTime>().ToString("HH:mm:ss"));
\`\`\`

### 七、泛型常用 API 速查

| API | 用途 |
| --- | --- |
| \`List<T>\` | 动态数组，日常首选 |
| \`Dictionary<TKey, TValue>\` | 哈希表，O(1) 查找 |
| \`HashSet<T>\` | 不重复集合，O(1) 查找 |
| \`Queue<T>\` | 先进先出 |
| \`Stack<T>\` | 后进先出 |
| \`LinkedList<T>\` | 双向链表 |
| \`ObservableCollection<T>\` | WPF/集合变化通知 |
| \`ConcurrentDictionary<TKey, TValue>\` | 线程安全字典 |
| \`ImmutableList<T>\` | 不可变列表 |
| \`Span<T>\` | 栈上连续内存（高性能） |

### 八、最佳实践清单

- ⭐ **优先用泛型集合**（\`List<T>\` 代替 \`ArrayList\`），避免装箱。
- ⭐ **方法能用泛型就别用 \`object\`**，类型安全且更快。
- ⭐ **泛型约束越精确越好**（\`where T : IComparable<T>\`），让编译器能优化。
- ⭐ **避免过度抽象**：3 个相似类不必抽泛型基类；3 个泛型方法值得抽。
- ⭐ **缓存常用实例**：用 \`Dictionary<TKey, TValue>\` 或 \`ConcurrentDictionary\` 缓存工厂结果。
- ⭐ **大型对象考虑池化**：用 \`ArrayPool<T>\` 复用缓冲区（见第六十章）。
- ⭐ **用 \`IEnumerable<T>\` 接收集合**：依赖抽象，便于测试和链式 LINQ。
- ⭐ **泛型静态字段每个 T 一份**：\`class Foo<T> { static int _count; }\` 在 \`Foo<int>\` 和 \`Foo<string>\` 中是不同字段。

### 九、常见陷阱

- ⚠️ \`==\` 对引用类型比较引用，对值类型比较值。泛型中应用 \`EqualityComparer<T>.Default.Equals(x, y)\`。
- ⚠️ \`default(T)\` 对引用类型返回 \`null\`，对值类型返回零值。配合可空类型时用 \`T?\`。
- ⚠️ 泛型不能用于 \`catch\` 子句（\`catch (T)\` 不允许），但 \`throw\` 可以。
- ⚠️ 静态成员按"封闭构造类型"区分：\`Foo<int>.Counter\` 和 \`Foo<string>.Counter\` 是独立字段。

### 十、小结

- ⭐ 泛型比 \`object\` 快 3-5 倍，主要因为避免了装箱拆箱。
- ⭐ 值类型泛型会被 JIT 特化，引用类型泛型共享代码。
- ⭐ \`List<T>\` / \`Dictionary<TKey, TValue>\` 是日常开发 90% 的场景首选。
- ⭐ 缓存、DI、池化等高级模式都重度依赖泛型。
- ⭐ 精确的泛型约束 + 适当的抽象 = 既类型安全又高性能。`,
  },
];

export { chapters };