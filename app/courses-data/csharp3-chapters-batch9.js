// =============================================================
// C# 从入门到精通大全（终极版）—— 第9批章节
// 第九部分 集合框架（共 6 章）
// -------------------------------------------------------------
// 本批包含 6 章：
//   csharp3-ch44 : 第四十四章 List<T> 完全指南
//   csharp3-ch44 : 第四十四章 Dictionary<TKey, TValue>
//   csharp3-ch45 : 第四十六章 HashSet<T> 与 SortedSet<T>
//   csharp3-ch46 : 第四十六章 Queue<T>、Stack<T> 与 LinkedList<T>
//   csharp3-ch47 : 第四十七章 迭代器与 yield
//   csharp3-ch49 : 第四十九章 不可变集合与并发集合
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第四十四章：List<T> 完全指南
  // ============================================================
  {
    id: 'csharp3-ch44',
    group: '第九部分 集合框架',
    icon: '📋',
    title: '第四十四章 List<T> 完全指南',
    content: `## 第四十四章　List\<T\> 完全指南

\`List<T>\` 是 C# 中最常用的集合类型——动态数组，大小可自动扩展，支持索引访问、增删改查、排序和搜索。它是日常开发的第一选择。

### 一、List\<T\> 创建与初始化

\`\`\`csharp
// === 创建 List<T> ===
// 方式1：空列表
List<int> numbers = new List<int>();

// 方式2：指定初始容量（减少扩容次数）
List<int> withCapacity = new List<int>(100);  // 预分配 100 个位置

// 方式3：从集合初始化
List<string> names = new List<string> { "张三", "李四", "王五" };

// 方式4：从数组创建
int[] array = { 1, 2, 3, 4, 5 };
List<int> fromArray = new List<int>(array);

// 方式5：集合表达式（C# 12）
List<int> collectionExpr = [10, 20, 30, 40, 50];

// 查看属性
Console.WriteLine($"元素数量：{fromArray.Count}");   // 5
Console.WriteLine($"当前容量：{fromArray.Capacity}"); // 可能大于 5
\`\`\`

### 二、Add / AddRange 添加元素

\`\`\`csharp
List<string> fruits = new List<string>();

// Add：添加单个元素到末尾
fruits.Add("苹果");   // 苹果
fruits.Add("香蕉");   // 苹果, 香蕉
fruits.Add("橙子");   // 苹果, 香蕉, 橙子

// AddRange：批量添加（从另一个集合）
string[] moreFruits = { "葡萄", "西瓜", "芒果" };
fruits.AddRange(moreFruits);  // 苹果, 香蕉, 橙子, 葡萄, 西瓜, 芒果

Console.WriteLine($"水果列表：{string.Join(", ", fruits)}");
Console.WriteLine($"共 {fruits.Count} 种水果");

// 添加重复元素
fruits.Add("苹果");  // 允许重复
Console.WriteLine($"添加重复后：{string.Join(", ", fruits)}");
\`\`\`

### 三、Insert / InsertRange 插入元素

\`\`\`csharp
List<int> numbers = new List<int> { 10, 20, 40, 50 };

// Insert：在指定索引插入元素（后面的元素后移）
numbers.Insert(2, 30);  // 在索引 2 插入 30
Console.WriteLine($"插入后：{string.Join(", ", numbers)}");  // 10, 20, 30, 40, 50

// InsertRange：批量插入
int[] inserted = { 25, 26, 27 };
numbers.InsertRange(3, inserted);  // 在索引 3 插入 3 个元素
Console.WriteLine($"批量插入后：{string.Join(", ", numbers)}");
// 10, 20, 30, 25, 26, 27, 40, 50

// 在开头插入
numbers.Insert(0, 0);
Console.WriteLine($"开头插入：{string.Join(", ", numbers)}");
// 0, 10, 20, 30, 25, 26, 27, 40, 50
\`\`\`

### 四、Remove / RemoveAt / RemoveAll 删除元素

\`\`\`csharp
List<string> items = new List<string> { "A", "B", "C", "D", "B", "E", "B" };

// Remove：删除第一个匹配的元素（按值删除）
bool removed = items.Remove("B");  // 删除第一个 "B"
Console.WriteLine($"删除第一个 B：{string.Join(", ", items)}，成功={removed}");

// RemoveAt：删除指定索引的元素
items.RemoveAt(2);  // 删除索引 2（原来是 "D"）
Console.WriteLine($"删除索引2：{string.Join(", ", items)}");

// RemoveAll：删除所有匹配的元素（使用谓词）
int removedCount = items.RemoveAll(x => x == "B");  // 删除所有 "B"
Console.WriteLine($"删除了 {removedCount} 个 B：{string.Join(", ", items)}");

// RemoveRange：删除范围内的元素
List<int> nums = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8 };
nums.RemoveRange(2, 3);  // 从索引 2 开始删除 3 个元素
Console.WriteLine($"删除范围后：{string.Join(", ", nums)}");  // 1, 2, 6, 7, 8

// Clear：清空所有元素
items.Clear();
Console.WriteLine($"清空后数量：{items.Count}");  // 0
\`\`\`

### 五、Contains / IndexOf / Find / FindAll 查找元素

\`\`\`csharp
List<string> names = new List<string> { "张三", "李四", "王五", "赵六", "张三丰" };

// Contains：检查是否包含某个元素
bool hasZhang = names.Contains("张三");  // 使用默认相等比较器
Console.WriteLine($"包含张三：{hasZhang}");  // True

// IndexOf：查找第一个匹配元素的索引
int index = names.IndexOf("张三");  // 从前往后找
Console.WriteLine($"张三首次出现索引：{index}");  // 0

int lastIndex = names.LastIndexOf("张三");  // 从后往前找
Console.WriteLine($"张三最后出现索引：{lastIndex}");  // 0

// IndexOf 指定起始位置
int searchFrom = names.IndexOf("张三", 1);  // 从索引 1 开始找
Console.WriteLine($"从索引1找张三：{searchFrom}");  // -1（找不到）

// Find：查找第一个匹配元素（使用谓词）
string? found = names.Find(n => n.StartsWith("张"));
Console.WriteLine($"第一个姓张的：{found}");  // 张三

// FindAll：查找所有匹配元素
List<string> allZhang = names.FindAll(n => n.StartsWith("张"));
Console.WriteLine($"所有姓张的：{string.Join(", ", allZhang)}");  // 张三, 张三丰

// FindIndex：查找第一个匹配的索引
int zhangIndex = names.FindIndex(n => n.Contains("五"));
Console.WriteLine($"包含'五'的索引：{zhangIndex}");  // 2

// Exists：判断是否存在匹配元素
bool exists = names.Exists(n => n.Length == 3);
Console.WriteLine($"存在3字名：{exists}");  // True
\`\`\`

### 六、Sort 排序

\`\`\`csharp
// === 默认排序 ===
List<int> numbers = new List<int> { 5, 2, 8, 1, 9, 3 };
numbers.Sort();  // 默认升序
Console.WriteLine($"升序：{string.Join(", ", numbers)}");  // 1, 2, 3, 5, 8, 9

// 降序：先升序再反转
numbers.Reverse();
Console.WriteLine($"降序：{string.Join(", ", numbers)}");  // 9, 8, 5, 3, 2, 1

// === 自定义排序：使用 Comparison<T> ===
List<string> names = new List<string> { "banana", "Apple", "cherry", "Date" };

// 按长度排序
names.Sort((a, b) => a.Length.CompareTo(b.Length));
Console.WriteLine($"按长度：{string.Join(", ", names)}");

// 不区分大小写排序
names.Sort(StringComparer.OrdinalIgnoreCase);
Console.WriteLine($"忽略大小写：{string.Join(", ", names)}");

// 复杂对象排序
class Product
{
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public override string ToString() => $"{Name}(¥{Price}, 库存{Stock})";
}

List<Product> products = new List<Product>
{
    new Product { Name = "键盘", Price = 299, Stock = 50 },
    new Product { Name = "鼠标", Price = 149, Stock = 100 },
    new Product { Name = "显示器", Price = 1999, Stock = 20 }
};

// 按价格排序
products.Sort((a, b) => a.Price.CompareTo(b.Price));
Console.WriteLine("按价格排序：");
products.ForEach(p => Console.WriteLine($"  {p}"));
\`\`\`

### 七、BinarySearch 二分查找

\`\`\`csharp
// BinarySearch：前提是列表已排序，O(log n) 时间复杂度
List<int> sorted = new List<int> { 10, 20, 30, 40, 50, 60, 70, 80, 90 };

// 查找存在的元素
int idx = sorted.BinarySearch(50);
Console.WriteLine($"50 的索引：{idx}");  // 4

// 查找不存在的元素：返回负数（按位取反后是插入位置）
int notFound = sorted.BinarySearch(55);
Console.WriteLine($"55 的索引：{notFound}");  // -6（插入位置是 5）

// 通过取反获取插入位置
int insertPos = ~notFound;
Console.WriteLine($"55 应插入位置：{insertPos}");  // 5

// 如果列表未排序，BinarySearch 结果不可靠！
List<int> unsorted = new List<int> { 5, 2, 8, 1 };
// int bad = unsorted.BinarySearch(5);  // 结果不可靠！
\`\`\`

### 八、容量管理

\`\`\`csharp
// 容量管理：了解 Capacity 和 Count 的区别
List<int> list = new List<int>();

Console.WriteLine($"初始容量：{list.Capacity}");  // 0

// 添加元素时容量自动增长（通常翻倍）
for (int i = 0; i < 10; i++)
{
    list.Add(i);
    Console.WriteLine($"Count={list.Count}, Capacity={list.Capacity}");
}

// TrimExcess：将容量削减到实际元素数量
list.TrimExcess();
Console.WriteLine($"TrimExcess 后容量：{list.Capacity}");  // 等于 Count

// 预分配容量：避免多次扩容（性能优化）
List<int> optimized = new List<int>(10000);  // 预分配 10000
Console.WriteLine($"预分配容量：{optimized.Capacity}");  // 10000

// EnsureCapacity：确保容量至少为指定值
list.EnsureCapacity(100);
Console.WriteLine($"确保容量后：{list.Capacity}");  // >= 100
\`\`\`

### 九、List\<T\> 性能要点

| 操作 | 时间复杂度 | 说明 |
| --- | --- | --- |
| 索引访问 \`[i]\` | O(1) | 直接访问 |
| Add（末尾添加） | O(1)* | 均摊 O(1)，扩容时 O(n) |
| Insert（中间插入） | O(n) | 需要移动元素 |
| RemoveAt（中间删除） | O(n) | 需要移动元素 |
| Contains | O(n) | 线性搜索 |
| Sort | O(n log n) | 快速排序 |
| BinarySearch | O(log n) | 前提是已排序 |

### 十、小结

- ⭐ \`List<T>\` 是动态数组，最常用的集合类型，支持索引访问。
- ⭐ Add 添加末尾，Insert 插入指定位置，Remove 删除元素。
- ⭐ Find/FindAll 用谓词查找，Sort 排序，BinarySearch 二分查找。
- ⭐ 预分配容量（Capacity）可减少扩容开销，提升性能。
- ⚠️ Insert 和 RemoveAt 在中间位置操作是 O(n)，大量操作考虑用 LinkedList。`,
  },

  // ============================================================
  // 第四十五章：Dictionary<TKey, TValue>
  // ============================================================
  {
    id: 'csharp3-ch45',
    group: '第九部分 集合框架',
    icon: '📖',
    title: '第四十五章 Dictionary<TKey, TValue>',
    content: `## 第四十五章　Dictionary\<TKey, TValue\>

\`Dictionary<TKey, TValue>\` 是键值对集合，基于哈希表实现，提供 O(1) 的查找、添加和删除性能。它是配置管理、缓存、索引查询等场景的核心数据结构。

### 一、创建与添加

\`\`\`csharp
// === 创建 Dictionary ===
// 方式1：空字典
Dictionary<string, int> scores = new Dictionary<string, int>();

// 方式2：集合初始化器
Dictionary<string, string> capitals = new Dictionary<string, string>
{
    ["中国"] = "北京",
    ["日本"] = "东京",
    ["韩国"] = "首尔"
};

// 方式3：指定比较器（不区分大小写）
Dictionary<string, int> caseInsensitive = new Dictionary<string, int>(
    StringComparer.OrdinalIgnoreCase);

// === Add：添加键值对 ===
scores.Add("张三", 95);   // 添加成功
scores.Add("李四", 88);

// scores.Add("张三", 100);  // 抛出 ArgumentException！键重复

// === TryAdd：尝试添加（C# 7+，推荐） ===
bool added = scores.TryAdd("张三", 100);  // 返回 false，不会抛异常
Console.WriteLine($"添加张三：{added}");  // False

// === 索引器赋值：添加或更新 ===
scores["王五"] = 92;       // 键不存在，添加
scores["张三"] = 100;      // 键已存在，更新
Console.WriteLine($"张三的成绩：{scores["张三"]}");  // 100
\`\`\`

### 二、访问与查找

\`\`\`csharp
Dictionary<string, int> scores = new Dictionary<string, int>
{
    ["张三"] = 95,
    ["李四"] = 88,
    ["王五"] = 92
};

// === 索引器访问：键不存在抛异常 ===
Console.WriteLine($"张三：{scores["张三"]}");  // 95
// Console.WriteLine(scores["赵六"]);  // KeyNotFoundException！

// === TryGetValue：安全访问（推荐） ===
if (scores.TryGetValue("李四", out int score))
{
    Console.WriteLine($"李四的成绩：{score}");  // 88
}
else
{
    Console.WriteLine("李四不在字典中");
}

// === ContainsKey：检查键是否存在 ===
bool hasZhang = scores.ContainsKey("张三");
Console.WriteLine($"包含张三：{hasZhang}");  // True

// === ContainsValue：检查值是否存在 ===
bool hasScore92 = scores.ContainsValue(92);
Console.WriteLine($"有人考92分：{hasScore92}");  // True

// === GetValueOrDefault：获取值或默认值（C# 7+） ===
int wangScore = scores.GetValueOrDefault("王五", 0);  // 存在，返回 92
int zhaoScore = scores.GetValueOrDefault("赵六", 0);  // 不存在，返回 0
Console.WriteLine($"王五：{wangScore}，赵六：{zhaoScore}");
\`\`\`

### 三、删除与修改

\`\`\`csharp
Dictionary<string, int> inventory = new Dictionary<string, int>
{
    ["键盘"] = 50,
    ["鼠标"] = 100,
    ["显示器"] = 20
};

// Remove：删除指定键
bool removed = inventory.Remove("鼠标");
Console.WriteLine($"删除鼠标：{removed}");  // True

// Remove 带 out 参数：获取被删除的值
if (inventory.Remove("显示器", out int removedCount))
{
    Console.WriteLine($"删除了显示器，原库存：{removedCount}");  // 20
}

// 修改值：直接通过索引器赋值
inventory["键盘"] = 45;  // 库存减少 5 个
Console.WriteLine($"键盘新库存：{inventory["键盘"]}");

// Clear：清空字典
// inventory.Clear();
\`\`\`

### 四、遍历字典

\`\`\`csharp
Dictionary<string, decimal> prices = new Dictionary<string, decimal>
{
    ["键盘"] = 299m,
    ["鼠标"] = 149m,
    ["显示器"] = 1999m,
    ["耳机"] = 399m
};

// 遍历键值对
Console.WriteLine("=== 遍历键值对 ===");
foreach (KeyValuePair<string, decimal> kvp in prices)
{
    Console.WriteLine($"  {kvp.Key}：¥{kvp.Value}");
}

// 遍历键
Console.WriteLine("\\n=== 遍历键 ===");
foreach (string key in prices.Keys)
{
    Console.WriteLine($"  {key}");
}

// 遍历值
Console.WriteLine("\\n=== 遍历值 ===");
foreach (decimal value in prices.Values)
{
    Console.WriteLine($"  ¥{value}");
}

// 遍历并修改
Console.WriteLine("\\n=== 遍历并打折 ===");
foreach (string key in prices.Keys.ToList())  // ToList() 创建副本避免修改异常
{
    prices[key] = prices[key] * 0.9m;  // 打 9 折
}
foreach (var kvp in prices)
    Console.WriteLine($"  {kvp.Key}：¥{kvp.Value:F2}");
\`\`\`

### 五、自定义键类型

\`\`\`csharp
// 自定义类型作为字典键：必须重写 Equals 和 GetHashCode
class Person
{
    public string Id { get; }
    public string Name { get; }

    public Person(string id, string name)
    {
        Id = id;
        Name = name;
    }

    // 重写 Equals：按 Id 判断相等
    public override bool Equals(object? obj)
    {
        return obj is Person other && Id == other.Id;
    }

    // 重写 GetHashCode：必须与 Equals 一致
    public override int GetHashCode() => Id.GetHashCode();

    public override string ToString() => $"{Name}({Id})";
}

var personDict = new Dictionary<Person, string>();
var p1 = new Person("P001", "张三");
var p2 = new Person("P001", "张三（别名）");  // 同 ID

personDict[p1] = "部门A";
Console.WriteLine($"p2 的部门：{personDict[p2]}");  // 部门A（同 ID 匹配）

// 使用 IEqualityComparer 自定义比较规则
class PersonNameComparer : IEqualityComparer<Person>
{
    public bool Equals(Person? x, Person? y)
    {
        if (x == null || y == null) return false;
        return x.Name == y.Name;  // 按 Name 比较
    }

    public int GetHashCode(Person obj)
    {
        return obj.Name.GetHashCode();
    }
}

var nameDict = new Dictionary<Person, string>(new PersonNameComparer());
nameDict[p1] = "部门A";
\`\`\`

### 六、SortedDictionary\<TKey, TValue\>

\`\`\`csharp
// SortedDictionary：按键排序的字典，基于红黑树
// 优势：按键有序遍历，O(log n) 查找
// 劣势：插入/删除 O(log n)，比 Dictionary O(1) 慢

SortedDictionary<string, int> sorted = new SortedDictionary<string, int>
{
    ["banana"] = 10,
    ["apple"] = 5,
    ["cherry"] = 8,
    ["date"] = 3
};

// 自动按键排序输出
Console.WriteLine("按键排序：");
foreach (var kvp in sorted)
    Console.WriteLine($"  {kvp.Key}：{kvp.Value}");
// apple: 5, banana: 10, cherry: 8, date: 3

// 范围查询
Console.WriteLine($"\\n首元素：{sorted.First().Key}");  // apple
Console.WriteLine($"末元素：{sorted.Last().Key}");      // date
\`\`\`

### 七、Dictionary vs SortedDictionary 对比

| 特性 | Dictionary\<TKey,TValue\> | SortedDictionary\<TKey,TValue\> |
| --- | --- | --- |
| 底层结构 | 哈希表 | 红黑树 |
| 查找 | O(1) | O(log n) |
| 插入 | O(1)* | O(log n) |
| 删除 | O(1) | O(log n) |
| 遍历顺序 | 无序 | 按键排序 |
| 内存占用 | 较大 | 较小 |
| 适用场景 | 快速查找，不关心顺序 | 需要按键有序遍历 |

### 八、小结

- ⭐ \`Dictionary<TKey, TValue>\` 基于哈希表，O(1) 查找，日常最常用。
- ⭐ \`TryGetValue\` 安全访问，\`ContainsKey\` 检查键是否存在。
- ⭐ 自定义键类型必须重写 \`Equals\` 和 \`GetHashCode\`。
- ⭐ \`SortedDictionary\` 按键有序，适合需要按键排序遍历的场景。
- ⚠️ 遍历时不能修改字典，需要先 \`ToList()\` 创建副本。`,
  },

  // ============================================================
  // 第四十六章：HashSet<T> 与 SortedSet<T>
  // ============================================================
  {
    id: 'csharp3-ch46',
    group: '第九部分 集合框架',
    icon: '📊',
    title: '第四十六章 HashSet<T> 与 SortedSet<T>',
    content: `## 第四十六章　HashSet\<T\> 与 SortedSet\<T\>

\`HashSet<T>\` 是不包含重复元素的集合，基于哈希表实现。它提供高效的集合运算（并集、交集、差集），是去重、成员关系检查等场景的最佳选择。

### 一、HashSet 创建与基本操作

\`\`\`csharp
// 创建 HashSet
HashSet<int> numbers = new HashSet<int> { 1, 2, 3, 4, 5 };

// Add：添加元素，返回是否成功添加
bool added = numbers.Add(6);    // True（添加成功）
bool dup = numbers.Add(3);      // False（重复元素，添加失败）
Console.WriteLine($"添加6：{added}，添加3：{dup}");

// Remove：删除元素
bool removed = numbers.Remove(2);
Console.WriteLine($"删除2：{removed}");  // True

// Contains：检查是否包含
bool has3 = numbers.Contains(3);
Console.WriteLine($"包含3：{has3}");  // True

// Count：元素数量
Console.WriteLine($"元素数量：{numbers.Count}");

// 遍历
Console.WriteLine("元素：");
foreach (int n in numbers)
    Console.Write($"{n} ");  // 顺序不定
Console.WriteLine();
\`\`\`

### 二、集合运算：并集、交集、差集

\`\`\`csharp
HashSet<int> setA = new HashSet<int> { 1, 2, 3, 4, 5 };
HashSet<int> setB = new HashSet<int> { 4, 5, 6, 7, 8 };

// === UnionWith：并集（A ∪ B） ===
// 修改 setA，将 setB 中不在 setA 的元素加入
HashSet<int> union = new HashSet<int>(setA);
union.UnionWith(setB);
Console.WriteLine($"并集：{string.Join(", ", union)}");  // 1, 2, 3, 4, 5, 6, 7, 8

// === IntersectWith：交集（A ∩ B） ===
// 修改 setA，只保留同时在 setB 中的元素
HashSet<int> intersection = new HashSet<int>(setA);
intersection.IntersectWith(setB);
Console.WriteLine($"交集：{string.Join(", ", intersection)}");  // 4, 5

// === ExceptWith：差集（A - B） ===
// 修改 setA，移除 setB 中存在的元素
HashSet<int> difference = new HashSet<int>(setA);
difference.ExceptWith(setB);
Console.WriteLine($"差集(A-B)：{string.Join(", ", difference)}");  // 1, 2, 3

// === SymmetricExceptWith：对称差集（A △ B） ===
// 修改 setA，保留只在其中一个集合存在的元素
HashSet<int> symmetric = new HashSet<int>(setA);
symmetric.SymmetricExceptWith(setB);
Console.WriteLine($"对称差集：{string.Join(", ", symmetric)}");  // 1, 2, 3, 6, 7, 8
\`\`\`

### 三、子集与超集检查

\`\`\`csharp
HashSet<int> large = new HashSet<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
HashSet<int> small = new HashSet<int> { 2, 4, 6, 8 };
HashSet<int> other = new HashSet<int> { 2, 4, 6, 8, 11 };

// IsSubsetOf：子集（small 的所有元素都在 large 中）
Console.WriteLine($"small 是 large 的子集：{small.IsSubsetOf(large)}");  // True

// IsSupersetOf：超集（large 包含 small 的所有元素）
Console.WriteLine($"large 是 small 的超集：{large.IsSupersetOf(small)}");  // True

// IsProperSubsetOf：真子集（子集且不相等）
HashSet<int> equal = new HashSet<int> { 1, 2, 3 };
Console.WriteLine($"equal 是 equal 的真子集：{equal.IsProperSubsetOf(equal)}");  // False

// Overlaps：有重叠（至少一个公共元素）
Console.WriteLine($"small 和 other 有重叠：{small.Overlaps(other)}");  // True（2,4,6,8）

// SetEquals：集合相等（元素完全相同）
HashSet<int> copy = new HashSet<int> { 8, 2, 6, 4 };  // 顺序无关
Console.WriteLine($"small 和 copy 相等：{small.SetEquals(copy)}");  // True
\`\`\`

### 四、HashSet 实际应用

\`\`\`csharp
// 应用1：去重
string[] words = { "apple", "banana", "apple", "cherry", "banana", "date" };
HashSet<string> unique = new HashSet<string>(words);
Console.WriteLine($"去重后：{string.Join(", ", unique)}");  // apple, banana, cherry, date

// 应用2：查找两个列表的共同元素
List<int> list1 = new List<int> { 1, 2, 3, 4, 5 };
List<int> list2 = new List<int> { 4, 5, 6, 7, 8 };

HashSet<int> common = new HashSet<int>(list1);
common.IntersectWith(list2);
Console.WriteLine($"共同元素：{string.Join(", ", common)}");  // 4, 5

// 应用3：排除黑名单
HashSet<string> blacklist = new HashSet<string> { "spam", "bot", "fake" };
List<string> users = new List<string> { "alice", "spam", "bob", "bot", "charlie" };

var validUsers = users.Where(u => !blacklist.Contains(u)).ToList();
Console.WriteLine($"有效用户：{string.Join(", ", validUsers)}");  // alice, bob, charlie

// 应用4：高效去重并计数
string[] votes = { "Alice", "Bob", "Alice", "Charlie", "Bob", "Alice" };
HashSet<string> candidates = new HashSet<string>(votes);
Console.WriteLine($"候选人数：{candidates.Count}");  // 3
\`\`\`

### 五、SortedSet\<T\>

\`\`\`csharp
// SortedSet：自动排序的集合，基于红黑树
SortedSet<int> sorted = new SortedSet<int> { 5, 2, 8, 1, 9, 3 };

// 自动排序
Console.WriteLine($"排序集合：{string.Join(", ", sorted)}");  // 1, 2, 3, 5, 8, 9

// 支持所有 HashSet 的集合运算
SortedSet<int> other = new SortedSet<int> { 3, 5, 7, 9, 11 };
sorted.IntersectWith(other);
Console.WriteLine($"交集：{string.Join(", ", sorted)}");  // 3, 5, 9

// 范围操作
SortedSet<int> numbers = new SortedSet<int> { 1, 3, 5, 7, 9, 11, 13, 15 };

// GetViewBetween：获取范围内的子集视图
var range = numbers.GetViewBetween(5, 11);
Console.WriteLine($"5-11 范围：{string.Join(", ", range)}");  // 5, 7, 9, 11

// Min / Max
Console.WriteLine($"最小值：{numbers.Min}");  // 1
Console.WriteLine($"最大值：{numbers.Max}");  // 15

// 反向遍历
Console.WriteLine("反向遍历：");
foreach (int n in numbers.Reverse())
    Console.Write($"{n} ");  // 15, 13, 11, 9, 7, 5, 3, 1
Console.WriteLine();
\`\`\`

### 六、HashSet vs SortedSet vs List

| 特性 | HashSet\<T\> | SortedSet\<T\> | List\<T\> |
| --- | --- | --- | --- |
| 重复元素 | 不允许 | 不允许 | 允许 |
| 查找 | O(1) | O(log n) | O(n) |
| 插入 | O(1) | O(log n) | O(1)* 或 O(n) |
| 排序 | 无序 | 自动排序 | 需手动排序 |
| 集合运算 | 原生支持 | 原生支持 | 需 LINQ |
| 索引访问 | 不支持 | 不支持 | 支持 |
| 内存 | 中等 | 中等 | 较少 |

### 七、小结

- ⭐ \`HashSet<T>\` 是无序不重复集合，O(1) 查找和插入。
- ⭐ 集合运算：\`UnionWith\`（并集）、\`IntersectWith\`（交集）、\`ExceptWith\`（差集）。
- ⭐ \`IsSubsetOf\`/\`IsSupersetOf\`/\`Overlaps\`/\`SetEquals\` 检查集合关系。
- ⭐ \`SortedSet<T>\` 自动排序，支持范围查询，适合需要有序集合的场景。
- ⭐ 去重、成员检查、集合运算选 HashSet，需要索引访问选 List。`,
  },

  // ============================================================
  // 第四十七章：Queue<T>、Stack<T> 与 LinkedList<T>
  // ============================================================
  {
    id: 'csharp3-ch47',
    group: '第九部分 集合框架',
    icon: '📊',
    title: '第四十七章 Queue<T>、Stack<T> 与 LinkedList<T>',
    content: `## 第四十七章　Queue\<T\>、Stack\<T\> 与 LinkedList\<T\>

这三种集合各有特殊的数据结构和访问模式。Queue 是 FIFO（先进先出），Stack 是 LIFO（后进先出），LinkedList 是双向链表——适合频繁插入/删除的场景。

### 一、Queue\<T\>：先进先出队列

\`\`\`csharp
// Queue：先进先出（FIFO），像排队一样
Queue<string> queue = new Queue<string>();

// Enqueue：入队（添加到队尾）
queue.Enqueue("任务1");
queue.Enqueue("任务2");
queue.Enqueue("任务3");
Console.WriteLine($"队列中有 {queue.Count} 个任务");

// Peek：查看队首元素但不移除
string first = queue.Peek();
Console.WriteLine($"队首：{first}");  // 任务1

// Dequeue：出队（移除并返回队首元素）
string processed = queue.Dequeue();
Console.WriteLine($"处理：{processed}");  // 任务1
Console.WriteLine($"剩余：{queue.Count} 个任务");  // 2

// TryDequeue：安全出队（C# 7+）
if (queue.TryDequeue(out string? next))
{
    Console.WriteLine($"安全出队：{next}");  // 任务2
}

// TryPeek：安全查看队首
if (queue.TryPeek(out string? peek))
{
    Console.WriteLine($"队首：{peek}");  // 任务3
}

// 实际应用：任务调度器
Queue<string> taskQueue = new Queue<string>();
taskQueue.Enqueue("下载图片");
taskQueue.Enqueue("处理图片");
taskQueue.Enqueue("上传结果");

Console.WriteLine("\\n处理任务队列：");
while (taskQueue.Count > 0)
{
    string task = taskQueue.Dequeue();
    Console.WriteLine($"  正在执行：{task}");
}
\`\`\`

### 二、Stack\<T\>：后进先出栈

\`\`\`csharp
// Stack：后进先出（LIFO），像一叠盘子
Stack<string> stack = new Stack<string>();

// Push：入栈（压入栈顶）
stack.Push("页面1");
stack.Push("页面2");
stack.Push("页面3");

// Peek：查看栈顶元素但不移除
string top = stack.Peek();
Console.WriteLine($"栈顶：{top}");  // 页面3

// Pop：出栈（移除并返回栈顶元素）
string popped = stack.Pop();
Console.WriteLine($"弹出：{popped}");  // 页面3
Console.WriteLine($"剩余：{stack.Count} 个元素");  // 2

// TryPop：安全出栈
if (stack.TryPop(out string? result))
{
    Console.WriteLine($"安全出栈：{result}");  // 页面2
}

// TryPeek：安全查看栈顶
if (stack.TryPeek(out string? peek))
{
    Console.WriteLine($"栈顶：{peek}");  // 页面1
}

// 实际应用1：浏览器后退功能
Stack<string> history = new Stack<string>();
history.Push("首页");
history.Push("产品列表");
history.Push("产品详情");

Console.WriteLine("\\n浏览器后退：");
Console.WriteLine($"当前页面：{history.Pop()}");  // 产品详情
Console.WriteLine($"后退到：{history.Pop()}");    // 产品列表
Console.WriteLine($"再后退：{history.Pop()}");    // 首页

// 实际应用2：括号匹配检查
bool IsBalanced(string expression)
{
    Stack<char> brackets = new Stack<char>();
    foreach (char ch in expression)
    {
        if (ch == '(' || ch == '[' || ch == '{')
            brackets.Push(ch);  // 左括号入栈
        else if (ch == ')' || ch == ']' || ch == '}')
        {
            if (brackets.Count == 0) return false;  // 没有匹配的左括号
            char open = brackets.Pop();
            // 检查括号类型是否匹配
            if ((ch == ')' && open != '(') ||
                (ch == ']' && open != '[') ||
                (ch == '}' && open != '{'))
                return false;
        }
    }
    return brackets.Count == 0;  // 所有括号都匹配
}

Console.WriteLine($"\\n括号匹配：{IsBalanced("{[()]}")}");   // True
Console.WriteLine($"括号匹配：{IsBalanced("{[(])}")}");   // False
\`\`\`

### 三、LinkedList\<T\>：双向链表

\`\`\`csharp
// LinkedList<T>：双向链表，每个节点指向前后节点
// 优势：O(1) 插入/删除（已知节点位置）
// 劣势：O(n) 随机访问，内存开销大

LinkedList<string> linkedList = new LinkedList<string>();

// AddFirst：添加到头部
linkedList.AddFirst("C");

// AddLast：添加到尾部
linkedList.AddLast("D");

// 获取首尾节点
LinkedListNode<string>? first = linkedList.First;
LinkedListNode<string>? last = linkedList.Last;
Console.WriteLine($"首节点：{first?.Value}，尾节点：{last?.Value}");

// AddBefore：在指定节点前插入
linkedList.AddBefore(last!, "B");

// AddAfter：在指定节点后插入
linkedList.AddAfter(first!, "A");

Console.WriteLine("链表内容：");
foreach (string item in linkedList)
    Console.Write($"{item} ");  // C, A, B, D
Console.WriteLine();

// 通过节点操作：高效插入/删除
LinkedListNode<string>? nodeB = linkedList.Find("B");
if (nodeB != null)
{
    linkedList.AddBefore(nodeB, "X");  // 在 B 前面插入 X
    linkedList.AddAfter(nodeB, "Y");   // 在 B 后面插入 Y
    linkedList.Remove(nodeB);          // 删除 B 节点
}

Console.WriteLine("操作后：");
foreach (string item in linkedList)
    Console.Write($"{item} ");  // C, A, X, Y, D
Console.WriteLine();

// 实际应用：LRU 缓存（最近最少使用）
class LRUCache<K, V> where K : notnull
{
    private int _capacity;
    private Dictionary<K, LinkedListNode<(K key, V value)>> _dict = new();
    private LinkedList<(K key, V value)> _list = new();

    public LRUCache(int capacity) { _capacity = capacity; }

    public V? Get(K key)
    {
        if (!_dict.TryGetValue(key, out var node))
            return default;

        // 移动到链表头部（最近使用）
        _list.Remove(node);
        _list.AddFirst(node);
        return node.Value.value;
    }
}
\`\`\`

### 四、Queue vs Stack vs LinkedList 对比

| 特性 | Queue\<T\> | Stack\<T\> | LinkedList\<T\> |
| --- | --- | --- | --- |
| 访问模式 | FIFO（先进先出） | LIFO（后进先出） | 双向链表 |
| 添加/移除 | Enqueue/Dequeue | Push/Pop | AddFirst/Last, Remove |
| 中间插入/删除 | 不支持 | 不支持 | O(1)（已知节点） |
| 索引访问 | 不支持 | 不支持 | O(n) |
| 典型场景 | 任务队列、消息队列 | 撤销操作、函数调用栈 | 频繁插入/删除的列表 |

### 五、何时使用哪个

\`\`\`csharp
// 场景选择指南：

// Queue：按顺序处理任务
// → 消息队列、任务调度、BFS 遍历

// Stack：后进先出
// → 撤销操作、浏览器后退、表达式求值、DFS 遍历

// LinkedList：频繁在中间插入/删除
// → LRU 缓存、实现其他数据结构

// 一般场景：
// → 大多数情况用 List<T> 就够了
// → 需要索引访问 + 频繁末尾操作 → List<T>
// → 需要频繁头部操作 → Queue<T> 或 LinkedList<T>
// → 需要频繁中间插入/删除 → LinkedList<T>
\`\`\`

### 六、小结

- ⭐ \`Queue<T>\` 是 FIFO 队列，\`Enqueue\` 入队，\`Dequeue\` 出队。
- ⭐ \`Stack<T>\` 是 LIFO 栈，\`Push\` 入栈，\`Pop\` 出栈。
- ⭐ \`LinkedList<T>\` 是双向链表，O(1) 插入/删除（已知节点），O(n) 随机访问。
- ⭐ 大多数场景用 \`List<T>\`，特殊访问模式才用 Queue/Stack/LinkedList。`,
  },

  // ============================================================
  // 第四十八章：迭代器与 yield
  // ============================================================
  {
    id: 'csharp3-ch48',
    group: '第九部分 集合框架',
    icon: '🔄',
    title: '第四十八章 迭代器与 yield',
    content: `## 第四十八章　迭代器与 yield

\`yield return\` 是 C# 最优雅的特性之一，让你用极少代码实现自定义迭代器。它支持延迟执行（Lazy Evaluation），只在需要时才生成下一个元素。

### 一、IEnumerator 与 IEnumerable 基础

\`\`\`csharp
// foreach 底层原理：编译器将 foreach 转为对 IEnumerator 的调用
List<int> numbers = new List<int> { 1, 2, 3, 4, 5 };

// foreach 实际上是：
// 1. 获取枚举器
IEnumerator<int> enumerator = numbers.GetEnumerator();
// 2. 循环调用 MoveNext()
while (enumerator.MoveNext())
{
    // 3. 通过 Current 获取当前元素
    int current = enumerator.Current;
    Console.Write($"{current} ");
}
Console.WriteLine();
// 结论：foreach 只是语法糖，底层是 IEnumerator 的 MoveNext/Current
\`\`\`

### 二、yield return 基础

\`\`\`csharp
// yield return：让编译器自动生成迭代器代码
// 方法返回 IEnumerable<T> 或 IEnumerator<T>

// 简单迭代器：生成数字序列
IEnumerable<int> CountTo(int max)
{
    for (int i = 1; i <= max; i++)
    {
        yield return i;  // 每次 yield return 产生一个元素
    }
    // 方法执行到这里结束，迭代完成
}

Console.WriteLine("计数到5：");
foreach (int n in CountTo(5))
    Console.Write($"{n} ");  // 1 2 3 4 5
Console.WriteLine();

// 多个 yield return：按顺序产生元素
IEnumerable<string> GetNames()
{
    yield return "张三";
    yield return "李四";
    yield return "王五";
}

Console.WriteLine("姓名列表：");
foreach (string name in GetNames())
    Console.Write($"{name} ");  // 张三 李四 王五
Console.WriteLine();
\`\`\`

### 三、yield break 提前终止

\`\`\`csharp
// yield break：提前终止迭代
IEnumerable<int> GetPositiveNumbers(int[] numbers)
{
    foreach (int n in numbers)
    {
        if (n <= 0)
            yield break;  // 遇到非正数，停止迭代
        yield return n;
    }
}

int[] data = { 3, 7, 1, -1, 9, 4 };  // 遇到 -1 停止
Console.WriteLine("正数序列：");
foreach (int n in GetPositiveNumbers(data))
    Console.Write($"{n} ");  // 3 7 1（遇到 -1 停止）
Console.WriteLine();

// 实际应用：分页获取数据
IEnumerable<T> Paginate<T>(IEnumerable<T> source, int pageSize)
{
    int count = 0;
    foreach (T item in source)
    {
        if (count >= pageSize)
            yield break;  // 达到页大小，停止
        yield return item;
        count++;
    }
}

var allItems = Enumerable.Range(1, 20);
Console.WriteLine("\\n第1页（每页5条）：");
foreach (int n in Paginate(allItems, 5))
    Console.Write($"{n} ");  // 1 2 3 4 5
Console.WriteLine();
\`\`\`

### 四、延迟执行（Deferred Execution）

\`\`\`csharp
// 延迟执行：迭代器方法在调用时并不执行，在遍历时才执行
IEnumerable<int> GenerateNumbers()
{
    Console.WriteLine("开始生成数字...");
    for (int i = 1; i <= 3; i++)
    {
        Console.WriteLine($"  生成 {i}");
        yield return i;
    }
    Console.WriteLine("生成完毕");
}

Console.WriteLine("调用 GenerateNumbers()...");
var generator = GenerateNumbers();  // 这里不会执行方法体！
Console.WriteLine("方法已调用，但尚未执行");

Console.WriteLine("\\n开始遍历：");
foreach (int n in generator)  // 这里才开始执行方法体
{
    Console.WriteLine($"  消费 {n}");
}

// 注意：每次遍历都会重新执行迭代器方法
Console.WriteLine("\\n第二次遍历：");
foreach (int n in generator)  // 重新执行！
{
    Console.WriteLine($"  消费 {n}");
}
\`\`\`

### 五、自定义迭代器

\`\`\`csharp
// 自定义迭代器：实现 IEnumerable<T>
class FibonacciSequence : IEnumerable<int>
{
    private int _count;

    public FibonacciSequence(int count)
    {
        _count = count;
    }

    public IEnumerator<int> GetEnumerator()
    {
        int a = 0, b = 1;
        for (int i = 0; i < _count; i++)
        {
            yield return b;  // 返回当前斐波那契数
            int next = a + b;  // 计算下一个
            a = b;
            b = next;
        }
    }

    System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator()
    {
        return GetEnumerator();
    }
}

Console.WriteLine("斐波那契数列（前10个）：");
var fib = new FibonacciSequence(10);
foreach (int n in fib)
    Console.Write($"{n} ");  // 1 1 2 3 5 8 13 21 34 55
Console.WriteLine();
\`\`\`

### 六、迭代器方法带参数

\`\`\`csharp
// 迭代器方法可以接受参数，实现灵活的数据生成
IEnumerable<int> Range(int start, int count)
{
    for (int i = 0; i < count; i++)
    {
        yield return start + i;  // 从 start 开始，生成 count 个递增数
    }
}

Console.WriteLine("Range(10, 5)：");
foreach (int n in Range(10, 5))
    Console.Write($"{n} ");  // 10 11 12 13 14
Console.WriteLine();

// 带条件的迭代器
IEnumerable<T> Filter<T>(IEnumerable<T> source, Func<T, bool> predicate)
{
    foreach (T item in source)
    {
        if (predicate(item))
            yield return item;  // 只返回满足条件的元素
    }
}

int[] numbers = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
var evenNumbers = Filter(numbers, n => n % 2 == 0);
Console.WriteLine("\\n偶数：");
foreach (int n in evenNumbers)
    Console.Write($"{n} ");  // 2 4 6 8 10
Console.WriteLine();

// 实际应用：读取大文件的行（延迟加载）
IEnumerable<string> ReadLines(string filePath)
{
    using var reader = new StreamReader(filePath);
    string? line;
    while ((line = reader.ReadLine()) != null)
    {
        yield return line;  // 逐行返回，不一次性加载全部
    }
}
// 使用：foreach (string line in ReadLines("large.txt"))
\`\`\`

### 七、yield return vs 返回 List

\`\`\`csharp
// 对比：yield return vs 返回 List
// 返回 List：立即计算所有元素，占用内存
IEnumerable<int> GetEvenNumbersList(int max)
{
    List<int> result = new List<int>();
    for (int i = 1; i <= max; i++)
    {
        if (i % 2 == 0)
            result.Add(i);  // 全部计算并存储
    }
    return result;
}

// yield return：延迟计算，按需生成
IEnumerable<int> GetEvenNumbersYield(int max)
{
    for (int i = 1; i <= max; i++)
    {
        if (i % 2 == 0)
            yield return i;  // 需要时才计算，不存储全部
    }
}

// 场景：只需要前 3 个偶数
var listVersion = GetEvenNumbersList(1000000).Take(3);  // 计算了 100 万个！
var yieldVersion = GetEvenNumbersYield(1000000).Take(3); // 只计算到第 6 个

// 结论：yield return 在只需要部分结果时效率远高于返回 List
\`\`\`

### 八、小结

- ⭐ \`yield return\` 让编译器自动生成迭代器，极大简化代码。
- ⭐ \`yield break\` 提前终止迭代。
- ⭐ 迭代器方法支持延迟执行：调用时不执行，遍历时才执行。
- ⭐ 每次遍历迭代器都会重新执行方法体（除非缓存结果）。
- ⭐ 处理大数据集时，yield return 比返回 List 更节省内存。
- ⚠️ 迭代器方法中不能使用 \`ref\` 或 \`out\` 参数。`,
  },

  // ============================================================
  // 第四十九章：不可变集合与并发集合
  // ============================================================
  {
    id: 'csharp3-ch49',
    group: '第九部分 集合框架',
    icon: '🔒',
    title: '第四十九章 不可变集合与并发集合',
    content: `## 第四十九章　不可变集合与并发集合

不可变集合（Immutable Collections）创建后不可修改，所有"修改"操作都返回新集合，是线程安全的。并发集合（Concurrent Collections）专为多线程设计，无需手动加锁。

### 一、为什么需要不可变集合

\`\`\`csharp
// 问题：可变集合在共享时可能被意外修改
List<int> shared = new List<int> { 1, 2, 3 };

void BadModify()
{
    shared.Add(4);  // 意外修改了共享数据！
}

// 不可变集合：任何修改都返回新集合，原集合不变
// 需要 NuGet：System.Collections.Immutable
// using System.Collections.Immutable;

// ImmutableList.Create 创建不可变列表
var immutable = System.Collections.Immutable.ImmutableList.Create(1, 2, 3);
var modified = immutable.Add(4);  // 返回新集合，immutable 不变

Console.WriteLine($"原始：{string.Join(", ", immutable)}");  // 1, 2, 3
Console.WriteLine($"修改后：{string.Join(", ", modified)}");  // 1, 2, 3, 4
\`\`\`

### 二、ImmutableList\<T\>

\`\`\`csharp
// ImmutableList：不可变列表，基于 AVL 树
// 注意：需要 NuGet 包 System.Collections.Immutable

// 创建
var list = System.Collections.Immutable.ImmutableList.Create(1, 2, 3);

// Add：添加元素，返回新列表
var list2 = list.Add(4);
Console.WriteLine($"Add 后：{string.Join(", ", list2)}");

// Insert：插入元素
var list3 = list2.Insert(1, 99);  // 在索引 1 插入 99
Console.WriteLine($"Insert 后：{string.Join(", ", list3)}");

// Remove：删除元素
var list4 = list3.Remove(99);
Console.WriteLine($"Remove 后：{string.Join(", ", list4)}");

// RemoveAt：按索引删除
var list5 = list4.RemoveAt(2);
Console.WriteLine($"RemoveAt 后：{string.Join(", ", list5)}");

// SetItem：修改指定索引的元素
var list6 = list5.SetItem(0, 100);
Console.WriteLine($"SetItem 后：{string.Join(", ", list6)}");

// 原列表始终不变
Console.WriteLine($"原始列表不变：{string.Join(", ", list)}");  // 1, 2, 3
\`\`\`

### 三、ImmutableDictionary\<TKey, TValue\>

\`\`\`csharp
// 创建不可变字典
var dict = System.Collections.Immutable.ImmutableDictionary.Create<string, int>()
    .Add("张三", 95)
    .Add("李四", 88);

// 添加键值对
var dict2 = dict.Add("王五", 92);
Console.WriteLine($"添加后：{dict2["王五"]}");

// 修改值
var dict3 = dict2.SetItem("张三", 100);
Console.WriteLine($"修改后：张三={dict3["张三"]}");

// 删除键
var dict4 = dict3.Remove("李四");
Console.WriteLine($"删除后包含李四：{dict4.ContainsKey("李四")}");  // False

// 原始字典不变
Console.WriteLine($"原始张三：{dict["张三"]}");  // 95
\`\`\`

### 四、ImmutableHashSet 与 ImmutableArray

\`\`\`csharp
// ImmutableHashSet：不可变哈希集合
var set = System.Collections.Immutable.ImmutableHashSet.Create(1, 2, 3);
var set2 = set.Add(4);       // 返回新集合
var set3 = set2.Remove(2);   // 返回新集合
Console.WriteLine($"原始集合：{string.Join(", ", set)}");  // 1, 2, 3

// ImmutableArray：不可变数组，性能最优
var arr = System.Collections.Immutable.ImmutableArray.Create(1, 2, 3, 4, 5);
var arr2 = arr.Add(6);  // 返回新 ImmutableArray
Console.WriteLine($"原始数组：{string.Join(", ", arr)}");  // 1, 2, 3, 4, 5

// 遍历
foreach (int n in arr2)
    Console.Write($"{n} ");  // 1, 2, 3, 4, 5, 6
Console.WriteLine();
\`\`\`

### 五、ConcurrentDictionary\<TKey, TValue\>

\`\`\`csharp
// ConcurrentDictionary：线程安全的字典
// 使用 System.Collections.Concurrent
using System.Collections.Concurrent;

var concurrentDict = new ConcurrentDictionary<string, int>();

// TryAdd：尝试添加（线程安全）
bool added = concurrentDict.TryAdd("张三", 95);
Console.WriteLine($"添加张三：{added}");  // True

// 重复添加失败
bool dup = concurrentDict.TryAdd("张三", 100);
Console.WriteLine($"重复添加：{dup}");  // False

// GetOrAdd：获取或添加
int score1 = concurrentDict.GetOrAdd("李四", key => 88);
Console.WriteLine($"李四：{score1}");  // 88

// 再次获取：返回已有值
int score2 = concurrentDict.GetOrAdd("李四", key => 100);
Console.WriteLine($"李四(再次)：{score2}");  // 88（已存在，不更新）

// AddOrUpdate：添加或更新
int score3 = concurrentDict.AddOrUpdate(
    "张三",           // 键
    100,              // 添加时的值
    (key, old) => old + 5  // 更新时的操作：旧值 + 5
);
Console.WriteLine($"张三(更新后)：{score3}");  // 100

// TryRemove：安全删除
if (concurrentDict.TryRemove("张三", out int removed))
{
    Console.WriteLine($"删除了张三：{removed}");
}

// 遍历
concurrentDict["王五"] = 92;
foreach (var kvp in concurrentDict)
{
    Console.WriteLine($"  {kvp.Key}：{kvp.Value}");
}
\`\`\`

### 六、ConcurrentQueue 与 ConcurrentBag

\`\`\`csharp
// ConcurrentQueue：线程安全队列
var queue = new ConcurrentQueue<int>();

// Enqueue：入队
queue.Enqueue(1);
queue.Enqueue(2);
queue.Enqueue(3);

// TryDequeue：安全出队
if (queue.TryDequeue(out int result))
{
    Console.WriteLine($"出队：{result}");  // 1
}

// TryPeek：安全查看队首
if (queue.TryPeek(out int peek))
{
    Console.WriteLine($"队首：{peek}");  // 2
}

// ConcurrentBag：线程安全的无序集合（适合生产者-消费者模式）
var bag = new ConcurrentBag<int>();

// Add：添加元素
bag.Add(10);
bag.Add(20);
bag.Add(30);

// TryTake：取出元素
if (bag.TryTake(out int taken))
{
    Console.WriteLine($"取出：{taken}");  // 30（LIFO 风格）
}

// 多线程场景：生产者-消费者
var workItems = new ConcurrentQueue<string>();
// 生产者线程：workItems.Enqueue("task");
// 消费者线程：workItems.TryDequeue(out var task);
\`\`\`

### 七、BlockingCollection\<T\>

\`\`\`csharp
// BlockingCollection：带阻塞/限界功能的线程安全集合
// 生产者-消费者模式的标准实现

// 创建有界集合（最多 3 个元素）
var blocking = new BlockingCollection<int>(boundedCapacity: 3);

// 生产者任务
Task producer = Task.Run(() =>
{
    for (int i = 1; i <= 5; i++)
    {
        blocking.Add(i);  // 如果集合满了，会阻塞等待
        Console.WriteLine($"生产者：添加 {i}");
        Thread.Sleep(100);  // 模拟工作
    }
    blocking.CompleteAdding();  // 标记完成添加
});

// 消费者任务
Task consumer = Task.Run(() =>
{
    // GetConsumingEnumerable：阻塞遍历，直到 CompleteAdding 被调用
    foreach (int item in blocking.GetConsumingEnumerable())
    {
        Console.WriteLine($"  消费者：处理 {item}");
        Thread.Sleep(200);  // 模拟处理时间
    }
    Console.WriteLine("  消费者：处理完毕");
});

Task.WaitAll(producer, consumer);
\`\`\`

### 八、并发集合速查表

| 集合 | 非并发版本 | 适用场景 |
| --- | --- | --- |
| \`ConcurrentDictionary<TKey,TValue>\` | \`Dictionary<TKey,TValue>\` | 多线程读写的键值对 |
| \`ConcurrentQueue<T>\` | \`Queue<T>\` | 多线程生产者-消费者（FIFO） |
| \`ConcurrentStack<T>\` | \`Stack<T>\` | 多线程 LIFO 操作 |
| \`ConcurrentBag<T>\` | 无（无序） | 同一线程生产消费 |
| \`BlockingCollection<T>\` | 无 | 带阻塞/限界的生产者-消费者 |

### 九、小结

- ⭐ 不可变集合创建后不可修改，修改操作返回新集合，天然线程安全。
- ⭐ \`ImmutableList\`/\`ImmutableDictionary\`/\`ImmutableHashSet\` 基于持久化数据结构。
- ⭐ \`ConcurrentDictionary\` 线程安全字典，\`GetOrAdd\`/\`AddOrUpdate\` 原子操作。
- ⭐ \`ConcurrentQueue\` 线程安全队列，\`ConcurrentBag\` 无序线程安全集合。
- ⭐ \`BlockingCollection\` 带阻塞/限界功能，是生产者-消费者模式的标准实现。`,
  },
];

export { chapters };