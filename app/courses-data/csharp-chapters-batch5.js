// =============================================================
// C# 教程 - 第五批章节（第五部分 实战与生态 + 结语，共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   csharp-ch17 : 第十七章 集合与常用类库
//   csharp-ch18 : 第十八章 文件 IO 与异常处理
//   csharp-ch19 : 第十九章 .NET 生态：NuGet、ASP.NET Core 入门
//   csharp-ch20 : 第二十章 进阶路线与最佳实践
//   csharp-end  : 结语
//
// 所有 C# 代码示例均可在交互式编辑器中运行（基于顶级语句）。
// 适用版本：C# 12 / .NET 8 LTS
// =============================================================

const chapters = [
  // ============================================================
  // 第十七章：集合与常用类库
  // ============================================================
  {
    id: 'csharp-ch17',
    group: '第五部分 实战与生态',
    icon: '📚',
    title: '集合与常用类库',
    content: `## 第十七章　集合与常用类库

### 一、集合概览

日常开发中处理"一组数据"几乎离不开集合。.NET BCL 提供了一套完整的集合类型，按用途分类：

| 集合 | 主要特性 | 适用场景 |
|------|---------|---------|
| \`List<T>\` | 动态数组，按索引访问 | 通用列表 |
| \`Dictionary<K,V>\` | 哈希表，键值对 | 按键查找 |
| \`HashSet<T>\` | 哈希集合，无重复 | 去重、集合运算 |
| \`Queue<T>\` | FIFO 队列 | 先进先出 |
| \`Stack<T>\` | LIFO 栈 | 后进先出 |
| \`LinkedList<T>\` | 双向链表 | 频繁中间插入/删除 |
| \`SortedList<K,V>\` | 有序键值对 | 需要排序的字典 |
| \`SortedSet<T>\` | 有序集合 | 自动排序的集合 |
| \`ConcurrentDictionary<K,V>\` | 线程安全字典 | 多线程并发 |
| \`ImmutableArray<T>\` | 不可变数组 | 函数式编程 |

下面挑最常用的逐个讲解。

### 二、List<T>：动态数组

\`List<T>\` 是用得最多的集合——内部用数组存储，容量不够时自动扩容（通常翻倍）。

\`\`\`csharp
var list = new List<int>();

// 添加
list.Add(1);
list.Add(2);
list.AddRange(new[] { 3, 4, 5 });

Console.WriteLine(list.Count);  // 5
Console.WriteLine(list[0]);    // 1（索引访问）

// 插入 / 删除
list.Insert(0, 0);    // 在索引 0 插入
list.RemoveAt(2);     // 删除索引 2 的元素
list.Remove(3);       // 删除第一个等于 3 的元素

// 查找
Console.WriteLine(list.Contains(4));      // True
Console.WriteLine(list.IndexOf(4));       // 索引
var found = list.Find(n => n > 2);        // 第一个满足条件的

// 遍历
foreach (var x in list) Console.WriteLine(x);

// 转数组
int[] arr = list.ToArray();

// 容量优化：知道大小时预分配
var big = new List<int>(capacity: 10000);
\`\`\`

**性能要点：**

- \`Add\` 均摊 O(1)（扩容时 O(n)，但很少发生）。
- \`Insert(0, ...)\` 和 \`RemoveAt(0)\` 是 O(n)——所有元素要移动。
- 索引访问 \`list[i]\` 是 O(1)。
- 频繁在头部插入/删除：用 \`LinkedList<T>\`。

### 三、Dictionary<TKey, TValue>：哈希字典

\`Dictionary<K,V>\` 用哈希表实现，按键查找 O(1)：

\`\`\`csharp
var dict = new Dictionary<string, int>();
dict["apple"] = 5;
dict["banana"] = 3;
dict["cherry"] = 8;

Console.WriteLine(dict["apple"]);  // 5

// 检查键是否存在
Console.WriteLine(dict.ContainsKey("banana"));  // True

// 安全访问：TryGetValue
if (dict.TryGetValue("grape", out int count))
    Console.WriteLine(count);
else
    Console.WriteLine("不存在");  // 输出

// 遍历
foreach (var kv in dict)
    Console.WriteLine($"{kv.Key} = {kv.Value}");

// 仅键 / 仅值
foreach (var key in dict.Keys) Console.WriteLine(key);
foreach (var val in dict.Values) Console.WriteLine(val);
\`\`\`

**陷阱：** \`dict[key]\` 在键不存在时抛 \`KeyNotFoundException\`。如果不确定键存在，用 \`TryGetValue\`。

#### 字典的键要求

作为键的类型必须：

1. 重写 \`Equals\` 和 \`GetHashCode\`（或用 record）。
2. **不可变**（或至少在使用过程中不变，否则哈希值改变会导致找不到）。

\`\`\`csharp
// 用 record 作为键（自动生成 Equals / GetHashCode）
var map = new Dictionary<Point, string>
{
    [new Point(0, 0)] = "原点",
    [new Point(1, 1)] = "对角点"
};
Console.WriteLine(map[new Point(1, 1)]);  // 对角点

// 类型声明在末尾
public record Point(int X, int Y);
\`\`\`

### 四、HashSet<T>：去重与集合运算

\`HashSet<T>\` 不存重复元素，提供集合运算：

\`\`\`csharp
var set = new HashSet<int> { 1, 2, 3 };
set.Add(2);  // 已存在，添加失败但也不报错
Console.WriteLine(set.Count);  // 3

// 集合运算
var a = new HashSet<int> { 1, 2, 3, 4 };
var b = new HashSet<int> { 3, 4, 5, 6 };

// 交集
a.IntersectWith(b);
Console.WriteLine(string.Join(",", a));  // 3, 4

// 并集
var c = new HashSet<int> { 1, 2 };
var d = new HashSet<int> { 2, 3 };
c.UnionWith(d);
Console.WriteLine(string.Join(",", c));  // 1, 2, 3

// 差集
var e = new HashSet<int> { 1, 2, 3 };
var f = new HashSet<int> { 2 };
e.ExceptWith(f);
Console.WriteLine(string.Join(",", e));  // 1, 3
\`\`\`

### 五、Queue<T> 与 Stack<T>

\`\`\`csharp
// Queue：先进先出
var queue = new Queue<string>();
queue.Enqueue("任务1");
queue.Enqueue("任务2");
queue.Enqueue("任务3");

Console.WriteLine(queue.Dequeue());  // 任务1（出队）
Console.WriteLine(queue.Peek());     // 任务2（看但不取）

// Stack：后进先出
var stack = new Stack<int>();
stack.Push(1);
stack.Push(2);
stack.Push(3);

Console.WriteLine(stack.Pop());  // 3（最后入的先出）
\`\`\`

#### PriorityQueue<TElement, TPriority>（.NET 6+）

\`PriorityQueue\` 是带优先级的队列：

\`\`\`csharp
var pq = new PriorityQueue<string, int>();
pq.Enqueue("普通", 5);
pq.Enqueue("紧急", 1);
pq.Enqueue("高", 3);

Console.WriteLine(pq.Dequeue());  // 紧急（优先级数字最小先出）
Console.WriteLine(pq.Dequeue());  // 高
Console.WriteLine(pq.Dequeue());  // 普通
\`\`\`

### 六、字符串：String 与 StringBuilder

\`string\` 是不可变的——每次"修改"都生成新字符串：

\`\`\`csharp
string s = "hello";
s = s + " world";  // 生成新字符串 "hello world"，旧字符串等待 GC
\`\`\`

#### 字符串常用方法

\`\`\`csharp
string s = "Hello, World!";

Console.WriteLine(s.Length);            // 13
Console.WriteLine(s.ToUpper());         // HELLO, WORLD!
Console.WriteLine(s.ToLower());         // hello, world!
Console.WriteLine(s.Substring(0, 5));   // Hello
Console.WriteLine(s.IndexOf("World"));  // 7
Console.WriteLine(s.Replace("World", "C#"));  // Hello, C#!
Console.WriteLine(s.Contains("World"));        // True
Console.WriteLine(s.StartsWith("Hello"));      // True
Console.WriteLine(s.EndsWith("!"));            // True

// 拆分与拼接
var parts = "a,b,c,d".Split(',');
Console.WriteLine(string.Join("-", parts));  // a-b-c-d

// 去空白
var trimmed = "  hello  ".Trim();  // "hello"
\`\`\`

#### 字符串格式化

\`\`\`csharp
int x = 10;
double pi = 3.14159;
DateTime now = DateTime.Now;

// 字符串插值（推荐）
Console.WriteLine($"x = {x}, pi = {pi:F2}, now = {now:yyyy-MM-dd}");

// 复合格式化
Console.WriteLine(string.Format("x = {0}, pi = {1:F2}", x, pi));
\`\`\`

#### StringBuilder：可变字符串

循环拼接字符串时，用 \`StringBuilder\`：

\`\`\`csharp
// 错误：每次拼接都生成新字符串，O(n²)
string s = "";
for (int i = 0; i < 1000; i++)
    s += i.ToString() + ",";

// 正确：StringBuilder，O(n)
var sb = new StringBuilder();
for (int i = 0; i < 1000; i++)
    sb.Append(i).Append(",");
string result = sb.ToString();
\`\`\`

\`StringBuilder\` 内部用 char 数组，扩容时翻倍，但不会每次都生成新对象。

### 七、DateTime 与 TimeSpan

\`\`\`csharp
var now = DateTime.Now;          // 本地时间
var utc = DateTime.UtcNow;       // UTC 时间
var today = DateTime.Today;       // 今天 0 点

// 构造
var birthday = new DateTime(1990, 5, 20);
var withTime = new DateTime(2026, 1, 1, 12, 30, 0);

// 格式化
Console.WriteLine(now.ToString("yyyy-MM-dd HH:mm:ss"));
Console.WriteLine(now.ToString("yyyy年M月d日"));

// 解析
var parsed = DateTime.ParseExact("2026-01-01", "yyyy-MM-dd", null);

// 加减
var tomorrow = now.AddDays(1);
var nextWeek = now.AddWeeks(1);  // 注意：没有 AddWeeks，用 AddDays(7)

// 时间差
var diff = tomorrow - now;
Console.WriteLine(diff.TotalHours);  // TimeSpan
Console.WriteLine(diff.Days);          // 整天数

// TimeSpan
var ts = TimeSpan.FromHours(2.5);
Console.WriteLine(ts);  // 02:30:00
\`\`\`

#### DateTimeOffset：带时区的时间

\`\`\`csharp
var dto = DateTimeOffset.Now;
Console.WriteLine(dto.Offset);  // +08:00（北京时间）
\`\`\`

新代码建议优先用 \`DateTimeOffset\`——它明确携带时区信息，避免 \`DateTime\` 的歧义（不知道是本地还是 UTC）。

### 八、Math 与常用静态类

\`\`\`csharp
// Math
Console.WriteLine(Math.Max(3, 5));      // 5
Console.WriteLine(Math.Min(3, 5));      // 3
Console.WriteLine(Math.Abs(-5));        // 5
Console.WriteLine(Math.Round(3.7));     // 4（默认银行家舍入）
Console.WriteLine(Math.Round(3.5));     // 4（默认银行家舍入，非 4！）
Console.WriteLine(Math.Floor(3.9));     // 3
Console.WriteLine(Math.Ceiling(3.1));   // 4
Console.WriteLine(Math.Sqrt(16));       // 4
Console.WriteLine(Math.Pow(2, 10));     // 1024
Console.WriteLine(Math.PI);             // 3.14159...

// 静态类
Console.WriteLine(string.IsNullOrEmpty(""));    // True
Console.WriteLine(string.IsNullOrWhiteSpace("   "));  // True
Console.WriteLine(string.Concat("a", "b", "c"));  // abc
\`\`\`

### 九、并发集合（System.Collections.Concurrent）

多线程场景下，普通 \`Dictionary\` / \`List\` 不安全。\`System.Collections.Concurrent\` 命名空间提供了线程安全的版本：

\`\`\`csharp
using System.Collections.Concurrent;

// ConcurrentDictionary：线程安全字典
var dict = new ConcurrentDictionary<string, int>();

// 多线程同时写
Parallel.For(0, 100, i =>
{
    dict.AddOrUpdate(
        $"item_{i % 10}",
        addValue: 1,
        updateValueFactory: (key, old) => old + 1);
});

foreach (var kv in dict)
    Console.WriteLine($"{kv.Key} = {kv.Key}");
// item_0 = 10, item_1 = 10, ... item_9 = 10

// ConcurrentQueue / ConcurrentStack / ConcurrentBag
var queue = new ConcurrentQueue<int>();
Parallel.For(0, 100, i => queue.Enqueue(i));

// BlockingCollection：阻塞式生产消费
var bc = new BlockingCollection<int>(boundedCapacity: 10);

// 生产者
Task.Run(() =>
{
    for (int i = 0; i < 100; i++)
        bc.Add(i);  // 满了会阻塞
    bc.CompleteAdding();  // 通知完成
});

// 消费者
Task.Run(() =>
{
    foreach (var item in bc.GetConsumingEnumerable())
    {
        Console.WriteLine(item);
    }
});
\`\`\`

**注意：** 不要以为"加 \`lock\` 就安全"。锁粒度太大会严重降低性能，过小会有竞态。\`ConcurrentXxx\` 内部用了细粒度锁或无锁算法，比手写 \`lock\` 更高效。

### 十、不可变集合（System.Collections.Immutable）

不可变集合（ImmutableArray、ImmutableList、ImmutableDictionary 等）一旦创建就不能修改，每次"修改"返回新实例：

\`\`\`csharp
using System.Collections.Immutable;

var arr = ImmutableArray.Create(1, 2, 3);
var arr2 = arr.Add(4);  // 返回新数组 [1,2,3,4]

Console.WriteLine(arr.Length);   // 3（原数组不变）
Console.WriteLine(arr2.Length);  // 4

// Builder：批量修改时减少分配
var builder = ImmutableArray.CreateBuilder<int>();
for (int i = 0; i < 100; i++) builder.Add(i);
var final = builder.ToImmutable();
\`\`\`

适用场景：

- 函数式编程（不可变状态）。
- 共享配置（多线程读取，没人能改）。
- 历史快照（保存"之前的状态"）。

### 十一、本章小结

- 常用集合：\`List<T>\`（通用）、\`Dictionary<K,V>\`（键值对）、\`HashSet<T>\`（去重）、\`Queue<T>\`（FIFO）、\`Stack<T>\`（LIFO）、\`PriorityQueue<T,P>\`（优先级）。
- \`string\` 不可变，循环拼接用 \`StringBuilder\`。
- \`DateTime\` / \`DateTimeOffset\` / \`TimeSpan\` 处理时间——新代码优先 \`DateTimeOffset\`。
- 多线程并发用 \`System.Collections.Concurrent\` 命名空间下的集合。
- 不可变集合适合函数式、共享配置、历史快照。
- 选择集合时关注：访问模式（按索引 / 按键 / FIFO）、是否线程安全、是否需要不可变。
`,
  },

  // ============================================================
  // 第十八章：文件 IO 与异常处理
  // ============================================================
  {
    id: 'csharp-ch18',
    group: '第五部分 实战与生态',
    icon: '📄',
    title: '文件 IO 与异常处理',
    content: `## 第十八章　文件 IO 与异常处理

### 一、异常处理基础

C# 用 \`try / catch / finally\` 处理异常：

\`\`\`csharp
try
{
    int[] arr = new int[5];
    Console.WriteLine(arr[10]);  // 越界
}
catch (IndexOutOfRangeException ex)
{
    Console.WriteLine($"索引越界: {ex.Message}");
}
catch (Exception ex)  // 兜底，但应该尽量具体
{
    Console.WriteLine($"未知异常: {ex.Message}");
}
finally
{
    // 无论是否异常都执行（清理资源）
    Console.WriteLine("finally 块");
}
\`\`\`

**异常处理的几条原则：**

1. **不要 catch 一切**：\`catch (Exception)\` 等于吞掉错误。只 catch 你能处理的异常。
2. **不要 catch 后什么都不做**：\`catch (Exception) { }\` 是反模式，问题被掩盖。
3. **finally 用于资源清理**：文件、连接、锁，必须在 finally 释放。
4. **不要用异常做控制流**：异常应该"异常"，不是常规逻辑。

### 二、Exception 的层次

\`\`\`csharp
Exception
├── SystemException
│   ├── NullReferenceException
│   ├── IndexOutOfRangeException
│   ├── InvalidOperationException
│   ├── ArgumentException
│   │   └── ArgumentNullException
│   ├── InvalidOperationException
│   ├── IOException
│   │   ├── FileNotFoundException
│   │   └── DirectoryNotFoundException
│   └── ApplicationException（已不推荐使用）
└── 自定义异常
\`\`\`

#### 自定义异常

\`\`\`csharp
// === 自定义异常使用 ===
throw new BusinessException(4001, "用户不存在");

try
{
    // 业务逻辑
}
catch (BusinessException ex)
{
    Console.WriteLine($"业务错误 {ex.ErrorCode}: {ex.Message}");
}

// 类型声明在末尾
public class BusinessException : Exception
{
    public int ErrorCode { get; }

    public BusinessException(int code, string message) : base(message)
    {
        ErrorCode = code;
    }

    public BusinessException(int code, string message, Exception inner)
        : base(message, inner)
    {
        ErrorCode = code;
    }
}
\`\`\`

**自定义异常的最佳实践：**

1. 继承 \`Exception\`（不要继承 \`ApplicationException\`，微软已不推荐）。
2. 名字以 \`Exception\` 结尾。
3. 提供 \`[Serializable]\` 特性（如果需要跨 AppDomain / 进程序列化）。
4. 实现三个标准构造函数：无参、(message)、(message, innerException)。
5. 添加业务字段（错误码、错误类型枚举等）。

### 三、using 语句：自动释放资源

实现了 \`IDisposable\` 接口的对象（如文件流、数据库连接、网络客户端）需要显式释放。C# 提供 \`using\` 语句自动调用 \`Dispose\`：

\`\`\`csharp
// 经典 using
using (var fs = new FileStream("test.txt", FileMode.Open))
{
    // 使用 fs
}  // 离开 } 自动调用 fs.Dispose()

// C# 8+ using 声明
using var fs = new FileStream("test.txt", FileMode.Open);
// 使用 fs
// 离开作用域自动 Dispose
\`\`\`

**两种 using 的区别：**

- 经典 \`using (...) {}\`：在 \`}\` 处释放，作用域明确。
- \`using var\` 声明：在作用域结束（方法/块结束）释放，作用域隐式。

新代码优先 \`using var\`，更简洁。但需要"提前释放"时仍用经典形式。

### 四、文件读写

#### File 静态类：一次性读写小文件

\`\`\`csharp
// 写入文本
File.WriteAllText("hello.txt", "Hello, World!");
File.AppendAllText("hello.txt", "\\nSecond line");
File.WriteAllLines("lines.txt", new[] { "line1", "line2", "line3" });

// 读取文本
string content = File.ReadAllText("hello.txt");
string[] lines = File.ReadAllLines("lines.txt");

// 检查存在
if (File.Exists("hello.txt"))
    Console.WriteLine("文件存在");

// 复制 / 移动 / 删除
File.Copy("hello.txt", "hello.bak.txt");
File.Move("hello.bak.txt", "backup.txt");
File.Delete("backup.txt");
\`\`\`

#### FileStream + StreamReader/Writer：大文件流式

\`\`\`csharp
// 写入
using var writer = new StreamWriter("log.txt", append: true);
writer.WriteLine($"[{DateTime.Now}] 服务启动");

// 流式读取大文件（避免一次性读入内存）
using var reader = new StreamReader("big.log");
string? line;
while ((line = reader.ReadLine()) != null)
{
    if (line.Contains("ERROR"))
        Console.WriteLine(line);
}

// 异步读写（推荐）
using var reader2 = new StreamReader("big.log");
string? line2;
while ((line2 = await reader2.ReadLineAsync()) != null)
{
    // 处理每一行
}
\`\`\`

#### File 与 FileInfo

\`File\` 是静态类，\`FileInfo\` 是实例类。多次操作同一文件用 \`FileInfo\`：

\`\`\`csharp
var fi = new FileInfo("test.txt");
Console.WriteLine(fi.Length);          // 字节数
Console.WriteLine(fi.CreationTime);   // 创建时间
Console.WriteLine(fi.Extension);     // .txt
Console.WriteLine(fi.DirectoryName);  // 所在目录

fi.CopyTo("test.bak.txt");
fi.Delete();
\`\`\`

### 五、目录操作

\`\`\`csharp
// Directory 静态类
Directory.CreateDirectory("logs/2026/01");
if (Directory.Exists("logs"))
    Console.WriteLine("目录存在");

string[] files = Directory.GetFiles("logs", "*.txt", SearchOption.AllDirectories);
string[] dirs = Directory.GetDirectories("logs");

// 路径组合
string path = Path.Combine("logs", "2026", "01", "log.txt");
Console.WriteLine(path);  // logs/2026/01/log.txt（自动处理分隔符）

// 路径操作
Console.WriteLine(Path.GetFileName(path));      // log.txt
Console.WriteLine(Path.GetFileNameWithoutExtension(path));  // log
Console.WriteLine(Path.GetExtension(path));     // .txt
Console.WriteLine(Path.GetDirectoryName(path)); // logs/2026/01
Console.WriteLine(Path.GetFullPath("test.txt"));  // 绝对路径
Console.WriteLine(Path.GetTempFileName());  // 临时文件路径

// 临时目录
Console.WriteLine(Path.GetTempPath());  // /tmp 或 C:\\Users\\...\\AppData\\Local\\Temp
\`\`\`

### 六、JSON 序列化：System.Text.Json

.NET 内置 \`System.Text.Json\` 用于 JSON 序列化（推荐）：

\`\`\`csharp
// === JSON 序列化演示 ===
// using 必须放在文件顶部（顶级语句之前）
using System.Text.Json;

// 序列化
var user = new User
{
    Id = 1,
    Name = "张三",
    Email = "zs@example.com",
    CreatedAt = DateTime.Now
};

string json = JsonSerializer.Serialize(user);
Console.WriteLine(json);
// {"Id":1,"Name":"张三","Email":"zs@example.com","CreatedAt":"2026-01-01T10:00:00"}

// 反序列化
var parsed = JsonSerializer.Deserialize<User>(json);
Console.WriteLine(parsed?.Name);  // 张三

// 集合
var users = new List<User> { user, new User { Id = 2, Name = "李四" } };
string jsonList = JsonSerializer.Serialize(users);
var parsedList = JsonSerializer.Deserialize<List<User>>(jsonList);
Console.WriteLine($"反序列化 {parsedList?.Count} 个用户");

// 类型声明在末尾
public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Email { get; set; }
    public DateTime CreatedAt { get; set; }
}
\`\`\`

#### 序列化选项

\`\`\`csharp
// === 序列化选项演示 ===
using System.Text.Json;

var u = new { Id = 1, Name = "张三", Email = (string?)null };

var options = new JsonSerializerOptions
{
    WriteIndented = true,                    // 美化输出
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,  // 驼峰命名
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull  // 忽略 null
};

string pretty = JsonSerializer.Serialize(u, options);
Console.WriteLine(pretty);
// {
//   "id": 1,
//   "name": "张三"
// }
\`\`\`

#### 常用特性

\`\`\`csharp
// === JSON 特性演示 ===
using System.Text.Json;
using System.Text.Json.Serialization;

var product = new Product
{
    Id = 1,
    Name = "蓝牙耳机",
    InternalCode = "SECRET-001",  // 会被 JsonIgnore 忽略
    Status = ProductStatus.Active
};

var opts = new JsonSerializerOptions { WriteIndented = true };
string productJson = JsonSerializer.Serialize(product, opts);
Console.WriteLine(productJson);
// {
//   "id": 1,
//   "name": "蓝牙耳机",
//   "status": "Active"
// }

// 类型声明在末尾
public class Product
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = "";

    [JsonIgnore]
    public string InternalCode { get; set; } = "";

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public ProductStatus Status { get; set; }
}

public enum ProductStatus { Active, Inactive, Discontinued }
\`\`\`

### 七、综合示例：日志系统

\`\`\`csharp
// === 日志系统使用 ===
using var logger = new FileLogger("logs/app.log");
logger.Info("服务启动");
logger.Warn("磁盘空间不足");
try
{
    throw new InvalidOperationException("测试异常");
}
catch (Exception ex)
{
    logger.Error("操作失败", ex);
}

// 类型声明在末尾
public class FileLogger : IDisposable
{
    private readonly StreamWriter _writer;
    private readonly object _lock = new();

    public FileLogger(string path)
    {
        var dir = Path.GetDirectoryName(path);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
            Directory.CreateDirectory(dir);
        _writer = new StreamWriter(path, append: true);
    }

    public void Log(string level, string message)
    {
        lock (_lock)
        {
            var line = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] [{level}] {message}";
            _writer.WriteLine(line);
            _writer.Flush();
            Console.WriteLine(line);
        }
    }

    public void Info(string message) => Log("INFO", message);
    public void Warn(string message) => Log("WARN", message);
    public void Error(string message, Exception? ex = null)
        => Log("ERROR", ex == null ? message : $"{message} | {ex}");

    public void Dispose()
    {
        _writer?.Dispose();
    }
}
\`\`\`

这个例子综合了：\`IDisposable\` + using、文件流写入、\`lock\` 线程安全、异常捕获。

### 八、本章小结

- 异常处理用 \`try / catch / finally\`，原则：只 catch 能处理的、不要吞异常、finally 释放资源。
- 自定义异常继承 \`Exception\`，名字以 \`Exception\` 结尾，提供标准构造函数和业务字段。
- \`using\` 语句自动调用 \`Dispose\`；C# 8+ 用 \`using var\` 更简洁。
- \`File\` 适合小文件一次性读写；\`FileStream\` + \`StreamReader\` 适合大文件流式处理。
- \`Path\` 类处理跨平台路径（不要硬编码 \`/\` 或 \`\\\\\`）。
- \`System.Text.Json\` 是推荐的 JSON 库，配合 \`JsonSerializerOptions\` 控制行为。
`,
  },

  // ============================================================
  // 第十九章：.NET 生态：NuGet、ASP.NET Core 入门
  // ============================================================
  {
    id: 'csharp-ch19',
    group: '第五部分 实战与生态',
    icon: '🌐',
    title: '.NET 生态：NuGet、ASP.NET Core 入门',
    content: `## 第十九章　.NET 生态：NuGet、ASP.NET Core 入门

### 一、.NET 平台全景

到 .NET 8，微软已经完成了"统一 .NET"的演进：

| 时期 | 名字 | 说明 |
|------|------|------|
| 2002-2014 | .NET Framework | 仅 Windows，闭源，最后版本 4.8.1 |
| 2016-2019 | .NET Core | 跨平台、开源，到 3.1 |
| 2019-2020 | .NET (5/6/7/8) | 统一命名，.NET 5 起合并 Core 和 Mono |

**.NET 8 LTS（长期支持版）** 是当前推荐的版本，支持到 2026 年 11 月。

#### .NET 的组成部分

\`\`\`
┌─────────────────────────────────────────┐
│ 应用层：ASP.NET Core / WPF / WinForms / MAUI / EF Core │
├─────────────────────────────────────────┤
│ BCL（基础类库）：集合 / IO / 网络 / JSON / LINQ ... │
├─────────────────────────────────────────┤
│ 运行时：CLR（GC / JIT / 异常 / 线程）            │
├─────────────────────────────────────────┤
│ 操作系统：Windows / Linux / macOS / iOS / Android │
└─────────────────────────────────────────┘
\`\`\`

### 二、CLI 工具：dotnet 命令

\`dotnet\` 命令行工具是 .NET 开发的瑞士军刀：

\`\`\`bash
# 创建项目
dotnet new console -n MyApp            # 控制台
dotnet new webapi -n MyApi             # Web API
dotnet new classlib -n MyLib           # 类库

# 运行
dotnet run                              # 编译并运行
dotnet build                            # 仅编译
dotnet publish -c Release              # 发布（Release 模式）

# 包管理
dotnet add package Newtonsoft.Json      # 添加 NuGet 包
dotnet remove package Newtonsoft.Json
dotnet restore                          # 还原依赖

# 测试
dotnet test                             # 运行测试
dotnet new xunit -n MyTests            # 创建测试项目
\`\`\`

#### 项目文件 .csproj

\`\`\`xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
  </ItemGroup>
</Project>
\`\`\`

\`ImplicitUsings\` 自动添加常用 \`using\`（System、System.Linq 等）；\`Nullable\` 开启可空引用类型检查。

### 三、NuGet：包管理

NuGet 是 .NET 的包管理器（类似 npm / pip / maven）。

#### 命令行操作

\`\`\`bash
# 搜索包
dotnet package search "json"

# 添加 / 删除
dotnet add package Newtonsoft.Json --version 13.0.3
dotnet remove package Newtonsoft.Json

# 列出已安装
dotnet list package
dotnet list package --outdated  # 查看过时版本
\`\`\`

#### 常用 NuGet 包

| 包 | 用途 |
|----|------|
| \`Newtonsoft.Json\` | 流行的 JSON 库（功能比 System.Text.Json 多） |
| \`Microsoft.EntityFrameworkCore\` | ORM（数据库访问） |
| \`Microsoft.EntityFrameworkCore.Sqlite\` | EF Core SQLite Provider |
| \`Serilog\` | 结构化日志 |
| \`AutoMapper\` | 对象映射 |
| \`Polly\` | 重试 / 熔断 / 超时 |
| \`MediatR\` | 中介者模式（CQRS） |
| \`FluentValidation\` | 强类型校验 |
| \`xunit\` / \`NUnit\` / \`MSTest\` | 单元测试 |
| \`BenchmarkDotNet\` | 性能基准测试 |

### 四、ASP.NET Core 简介

ASP.NET Core 是 .NET 的 Web 框架，跨平台、高性能、模块化。

#### 最小 API（.NET 6+）

\`\`\`csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello, World!");
app.MapGet("/user/{name}", (string name) => new { Name = name, Time = DateTime.Now });
app.MapPost("/echo", (EchoRequest req) => Results.Ok(new { Received = req.Message }));

app.Run();

public record EchoRequest(string Message);
\`\`\`

启动：\`dotnet run\`，访问 \`http://localhost:5000\`。

#### 中间件管道

\`\`\`csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// 中间件按顺序执行
app.Use(async (context, next) =>
{
    Console.WriteLine($"请求开始: {context.Request.Path}");
    await next();  // 调用下一个中间件
    Console.WriteLine($"请求结束: {context.Response.StatusCode}");
});

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Hello");

app.Run();
\`\`\`

#### 依赖注入

ASP.NET Core 内置 DI 容器：

\`\`\`csharp
// 注册服务
builder.Services.AddSingleton<ILogger, ConsoleLogger>();   // 单例
builder.Services.AddScoped<IUserRepository, UserRepo>();    // 每请求
builder.Services.AddTransient<IEmailSender, SmtpSender>(); // 每次注入都新建

// 使用：通过构造函数注入
app.MapGet("/users", (IUserRepository repo) =>
{
    return repo.FindAll();
});
\`\`\`

#### 控制器模式（MVC）

大型项目用控制器更结构化：

\`\`\`csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _repo;

    public UsersController(IUserRepository repo) => _repo = repo;

    [HttpGet]
    public IEnumerable<User> GetAll() => _repo.FindAll();

    [HttpGet("{id}")]
    public IActionResult Get(int id)
    {
        var user = _repo.Find(id);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpPost]
    public IActionResult Create([FromBody] User user)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        _repo.Add(user);
        return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
    }
}
\`\`\`

### 五、Entity Framework Core 简介

EF Core 是 .NET 官方 ORM，支持 LINQ 查询数据库：

\`\`\`csharp
public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Order> Orders { get; set; } = new();
}

public class Order
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
}

public class AppDbContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Order> Orders { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite("Data Source=app.db");
}

// 使用
using var db = new AppDbContext();
db.Database.EnsureCreated();

// 增
db.Users.Add(new User { Name = "张三" });
db.SaveChanges();

// 查
var users = db.Users.Where(u => u.Name.StartsWith("张")).ToList();
var user = db.Users.Include(u => u.Orders).First();

// 改
user.Name = "张三丰";
db.SaveChanges();

// 删
db.Users.Remove(user);
db.SaveChanges();
\`\`\`

\`Include\` 类似 SQL 的 JOIN，预加载关联数据。

### 六、常用工具：dotnet 工具

\`dotnet tool\` 是全局命令行工具：

\`\`\`bash
# 安装
dotnet tool install -g dotnet-ef       # EF Core 迁移
dotnet tool install -g dotnet-format  # 代码格式化
dotnet tool install -g dotnet-outdated  # 检查过时依赖

# 使用
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet format
\`\`\`

### 七、测试框架

#### xUnit

\`\`\`csharp
public class CalculatorTests
{
    [Fact]
    public void Add_TwoNumbers_ReturnsSum()
    {
        var calc = new Calculator();
        int result = calc.Add(3, 5);
        Assert.Equal(8, result);
    }

    [Theory]
    [InlineData(1, 2, 3)]
    [InlineData(10, 20, 30)]
    [InlineData(-1, 1, 0)]
    public void Add_MultipleCases(int a, int b, int expected)
    {
        var calc = new Calculator();
        Assert.Equal(expected, calc.Add(a, b));
    }
}
\`\`\`

运行测试：\`dotnet test\`。

### 八、本章小结

- .NET 8 LTS 是当前推荐版本，跨平台开源。
- \`dotnet\` CLI 是开发核心工具：创建、运行、构建、测试、包管理。
- NuGet 是包管理器，常用包：\`Newtonsoft.Json\`、\`EF Core\`、\`Serilog\`、\`AutoMapper\`、\`Polly\`。
- ASP.NET Core 是 Web 框架，支持最小 API（轻量）和 MVC 控制器（结构化）。
- EF Core 是 ORM，用 LINQ 查询数据库，\`Include\` 加载关联数据。
- DI 容器内置，三种生命周期：单例 / 作用域 / 瞬时。
- 测试主流用 xUnit，\`[Fact]\` 单用例，\`[Theory] + [InlineData]\` 参数化。
`,
  },

  // ============================================================
  // 第二十章：进阶路线与最佳实践
  // ============================================================
  {
    id: 'csharp-ch20',
    group: '第五部分 实战与生态',
    icon: '🚀',
    title: '进阶路线与最佳实践',
    content: `## 第二十章　进阶路线与最佳实践

### 一、C# 进阶知识点清单

本教程覆盖了 C# 入门到中级的主要内容。继续深入，有这些方向：

#### 1. 高级语言特性

- **模式匹配（Pattern Matching）**：C# 7-11 逐步增强，支持类型模式、属性模式、列表模式、\`when\` 守卫、\`and\` / \`or\` 组合。
- **\`record\` 进阶**：\`record struct\`、\`with\` 表达式内部机制、\`init\` 与不可变性。
- **源生成器（Source Generators）**：编译期生成代码，避免反射。
- **\`Span<T>\` / \`Memory<T>\`**：高性能内存操作，无 GC 分配。
- **\`ref struct\`**：栈 Only 类型，禁止装箱。
- **\`global using\`**：全局 using 指令。
- **\`file\` 修饰符**：限制类型作用域到当前文件。
- **泛型数学（Generic Math）**：\`INumber<T>\`、\`IAdditionOperators\` 等，C# 11+ 让泛型支持运算符。

#### 2. .NET 平台深度

- **CLR 内部**：GC 分代回收、JIT 编译、AOT 编译（.NET 8 Native AOT）。
- **程序集加载**：\`AssemblyLoadContext\`、插件化架构。
- **反射与表达式树**：动态类型、动态代码生成、EF Core 翻译 LINQ 为 SQL。
- **平台调用（P/Invoke）**：调用 C/C++ 库。
- **互操作**：COM、WinRT、Java（IKVM）。

#### 3. 性能与并发

- **线程池**：\`ThreadPool\`、\`ThreadPool.UnsafeQueueUserWorkItem\`。
- **\`Parallel\` 类**：\`Parallel.For\` / \`Parallel.ForEach\` / \`Parallel.Invoke\`。
- **PLINQ**：\`AsParallel()\` 并行 LINQ。
- **\`Channel<T>\`**：生产者-消费者模式（替代 \`BlockingCollection\`）。
- **\`Span<T>\` 与栈分配**：\`stackalloc\`、\`MemoryMarshal\`。
- **对象池**：\`ObjectPool<T>\`、\`ArrayPool<T>.Shared\`。
- **内存映射文件**：\`MemoryMappedFile\`。

#### 4. 工程实践

- **SOLID 原则**：单一职责、开闭、里氏替换、接口隔离、依赖倒置。
- **设计模式**：工厂、策略、观察者、装饰器、适配器、责任链。
- **架构模式**：分层、洋葱架构、CQRS、事件溯源。
- **测试**：单元测试（xUnit/NUnit）、集成测试、Mock（Moq/NSubstitute）、快照测试。
- **日志**：Serilog 结构化日志、日志聚合（Seq / ELK）。
- **配置**：\`IConfiguration\`、多环境（appsettings.json + 环境变量）。
- **DI 容器进阶**：装饰器模式、装饰器注册、scrutor 库。

### 二、C# 编码规范要点

#### 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 类、接口、方法、属性、命名空间 | PascalCase | \`UserService\`、\`IRepository\`、\`GetName\`、\`Id\` |
| 局部变量、参数 | camelCase | \`userName\`、\`itemCount\` |
| 私有字段 | \`_\` + camelCase | \`_logger\`、\`_userRepository\` |
| 接口 | \`I\` 前缀 | \`IDisposable\`、\`IRepository<T>\` |
| 异步方法 | \`Async\` 后缀 | \`GetUserAsync\` |
| 异常类 | \`Exception\` 后缀 | \`BusinessException\` |
| 泛型类型参数 | \`T\` + 描述 | \`TEntity\`、\`TKey\`、\`TResult\` |
| 布尔变量 | \`is\` / \`has\` / \`can\` 前缀 | \`isEnabled\`、\`hasPermission\` |

#### 命名空间与文件组织

\`\`\`
MyApp/
├── MyApp.Domain/              # 领域层
│   ├── Entities/
│   │   └── User.cs
│   └── Repositories/
│       └── IUserRepository.cs
├── MyApp.Application/        # 应用层
│   ├── Services/
│   │   └── UserService.cs
│   └── DTOs/
│       └── UserDto.cs
├── MyApp.Infrastructure/      # 基础设施
│   └── Persistence/
│       └── UserRepository.cs
└── MyApp.Api/                 # API 层
    └── Controllers/
        └── UsersController.cs
\`\`\`

#### 常见反模式

\`\`\`csharp
// ❌ 用 var 隐藏可读性
var data = GetData();  // 不知道是什么类型
List<User> users = GetUsers();  // ✅ 显式类型

// ✅ 当类型明显时用 var
var users = new List<User>();
var user = new User();

// ❌ 神秘数字
if (user.Status == 3) ...

// ✅ 常量或枚举
if (user.Status == UserStatus.Active) ...

// ❌ 嵌套 if
if (a)
{
    if (b)
    {
        // 主逻辑
    }
}

// ✅ 提前返回
if (!a) return;
if (!b) return;
// 主逻辑

// ❌ 字符串拼接 SQL（注入风险）
var sql = $"SELECT * FROM Users WHERE Name = '{name}'";

// ✅ 参数化
var sql = "SELECT * FROM Users WHERE Name = @name";
cmd.Parameters.AddWithValue("@name", name);
\`\`\`

### 三、性能优化清单

#### 1. 集合选择

- 频繁按索引访问：\`List<T>\` / \`Array\`。
- 频繁按键查找：\`Dictionary<K,V>\`。
- 去重：\`HashSet<T>\`。
- 频繁头部插入：\`LinkedList<T>\`。
- 不可变：\`ImmutableArray<T>\`（结构体，无分配）> \`ImmutableList<T>\`。

#### 2. 字符串

- 循环拼接：\`StringBuilder\`。
- 多次相同字符串：\`string.Intern\`（小心内存泄漏）。
- 大量字符操作：\`Span<char>\` 或 \`string.Create\`。

#### 3. 异步

- I/O 密集：\`async/await\`，不要 \`Task.Run\` 包一层。
- CPU 密集：\`Task.Run\` 放线程池。
- 高频热路径：\`ValueTask\` 替代 \`Task\`。

#### 4. 装箱拆箱

\`\`\`csharp
// ❌ 装箱
ArrayList list = new ArrayList();
list.Add(1);  // int → object 装箱

// ✅ 泛型
List<int> list = new List<int>();
list.Add(1);  // 无装箱
\`\`\`

#### 5. LINQ 性能

- 简单遍历：\`foreach\` 比 \`Select\` / \`Where\` 链快。
- 多次遍历：\`ToList\` 缓存。
- 大集合排序：\`OrderBy\` 用快速排序，O(n log n)。

#### 6. 内存分配

- 短生命周期小对象：放心分配，GC 高效。
- 长期持有大对象：考虑池化（\`ArrayPool<T>\`）。
- 高频热路径：\`Span<T>\` / \`stackalloc\` / \`ref struct\`。

### 四、学习路线建议

#### 阶段 1：语法基础（1-2 周）

- 完成 1-8 章（基础语法、控制流、方法、数组、枚举、结构体）。
- 能写控制台小程序（计算器、猜数字、文件统计）。

#### 阶段 2：面向对象（2-3 周）

- 完成 9-12 章（类、继承、接口、属性索引器）。
- 理解 OOP 四大特性，能设计简单的领域模型。
- 实战：写一个简单的银行账户系统、图书管理系统。

#### 阶段 3：高级特性（2-3 周）

- 完成 13-16 章（泛型、委托事件、LINQ、异步）。
- 能用 LINQ 处理复杂数据，能用 async/await 写并发代码。
- 实战：写一个并发爬虫、消息总线、简易 LINQ Provider。

#### 阶段 4：实战应用（3-4 周）

- 完成 17-19 章（集合、IO、ASP.NET Core、EF Core）。
- 能用 ASP.NET Core 写 RESTful API。
- 实战：写一个博客后端 API（用户、文章、评论），用 EF Core + SQLite。

#### 阶段 5：深入与专业（持续）

- CLR 内部（GC、JIT、AOT）。
- 性能优化（BenchmarkDotNet 实测）。
- 架构模式（DDD、CQRS、Event Sourcing）。
- 测试与 CI/CD（GitHub Actions、Azure DevOps）。
- 特定领域：游戏（Unity）、桌面（WPF / WinUI / MAUI）、云原生（Azure / Kubernetes）。

### 五、推荐资源

#### 官方

- **Microsoft Learn**：[https://learn.microsoft.com/dotnet](https://learn.microsoft.com/dotnet)（最权威的教程和文档）
- **.NET GitHub**：[https://github.com/dotnet](https://github.com/dotnet)（源码、issue、设计文档）
- **C# 语言规范**：[https://learn.microsoft.com/dotnet/csharp/language-reference/](https://learn.microsoft.com/dotnet/csharp/language-reference/)

#### 书籍

- **《C# in Depth》**（Jon Skeet）：深入语言特性的圣经。
- **《CLR via C#》**（Jeffrey Richter）：理解 CLR 内部机制。
- **《Pro C# 10 with .NET 6》**（Andrew Troelsen）：全面教程。
- **《Unit Testing》**（Vladimir Khorikov）：测试方法论。

#### 社区

- **Stack Overflow**：搜 \`[c#]\` 标签。
- **Reddit /r/csharp**：新闻与讨论。
- **.NET 中文社区**：博客园、InfoQ 中文站。

#### 工具

- **JetBrains Rider**：跨平台 C# IDE（推荐 macOS / Linux）。
- **Visual Studio**：Windows 上功能最全的 IDE。
- **VS Code + C# Dev Kit**：轻量级跨平台。
- **dotPeek** / **ILSpy**：反编译工具。

### 六、本章小结

- C# 12 / .NET 8 之后还有大量特性值得探索：模式匹配、源生成器、\`Span<T>\`、AOT 编译等。
- 编码规范不是教条，是协作的契约——团队一致 > 个人偏好。
- 性能优化的原则：先测量（BenchmarkDotNet），再优化，避免过早优化。
- 学习路线：语法基础 → OOP → 高级特性 → 实战应用 → 深入专业。
- 持续学习的核心：阅读官方文档、读源码、做项目、参与社区。
`,
  },

  // ============================================================
  // 结语
  // ============================================================
  {
    id: 'csharp-end',
    group: '结尾',
    icon: '🎉',
    title: '结语',
    content: `## 结语

### 一、回顾

这本 C# 教程到此结束。我们用了 20 章，覆盖了：

1. **快速上手**（第 1-4 章）：5 分钟写出第一个程序、变量与常用类型、字符串操作实战、控制流与逻辑判断。
2. **核心语法**（第 5-8 章）：方法实用技巧、集合 List 与 Dictionary、日期与时间处理、枚举与结构体。
3. **面向对象**（第 9-12 章）：类与对象入门、继承与多态、接口与抽象类、属性索引器与运算符重载。
4. **高级特性**（第 13-16 章）：泛型、委托 Lambda 与事件、LINQ、异步编程。
5. **实战与生态**（第 17-20 章）：集合与常用类库、文件 IO 与异常处理、.NET 生态、进阶路线。

### 二、C# 的核心特质

学完之后，你应该能感受到 C# 的几个鲜明特点：

- **类型安全**：从可空引用类型到泛型约束，编译器在编译期拦截大量错误。
- **生产力**：丰富的语法糖（顶级语句、记录类型、模式匹配、对象初始化器）让代码简洁而不失表达力。
- **多范式**：命令式、面向对象、函数式、动态（dynamic）都可以混合使用。
- **性能**：值类型、\`Span<T>\`、AOT 编译让 C# 在性能敏感场景也能与 C++ 接近。
- **跨平台**：.NET 8 让同一份代码在 Windows / Linux / macOS / 移动端运行。
- **生态**：ASP.NET Core、EF Core、MAUI、Unity 等覆盖了 Web、桌面、移动、游戏各领域。

### 三、下一站

教程是入门，真正的成长在"做项目"中：

- **Web 方向**：用 ASP.NET Core 写一个博客 / 论坛 / SaaS 后端，学习 RESTful、JWT、SignalR。
- **数据方向**：用 EF Core + PostgreSQL 写数据迁移脚本，学习批量操作、事务、性能优化。
- **桌面方向**：用 WPF 或 WinUI 3 写一个文件管理器 / 笔记应用，学习 MVVM、数据绑定。
- **游戏方向**：用 Unity 写一个 2D 平台跳跃游戏，学习组件系统、物理引擎、Shader。
- **跨平台移动**：用 .NET MAUI 写一个 Todo 应用，学习 XAML、平台特定代码。
- **云原生**：用 Docker 部署 ASP.NET Core，学习 Kubernetes、Helm、可观测性。

### 四、最后

编程语言只是工具，真正解决问题的是你对问题的理解和思考。C# 是一把好工具，但**写出好代码的不是语言，是写代码的人**。

希望这本教程能帮你打开 C# 与 .NET 的大门。继续写、继续读、继续造——代码会回报每一份投入。

> 愿你在每一次编译通过时感到欣喜，在每一次 Bug 解决后变得更扎实。

—— 完 ——
`,
  },
];

export { chapters };
