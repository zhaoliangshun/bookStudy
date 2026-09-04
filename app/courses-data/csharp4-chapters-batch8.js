// =============================================================
// C# 从入门到精通大全（全新版）—— 第 8 批章节
// 第六部分 LINQ（共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   csharp4-ch40 : 第四十章 LINQ 基础
//   csharp4-ch41 : 第四十一章 LINQ 过滤与投影
//   csharp4-ch42 : 第四十二章 LINQ 排序与分组
//   csharp4-ch43 : 第四十三章 LINQ 聚合与统计
//   csharp4-ch44 : 第四十四章 LINQ 转换与立即执行
//
// 风格：demo 驱动，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，所有示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第四十章：LINQ 基础
  // ============================================================
  {
    id: 'csharp4-ch40',
    group: '第六部分 LINQ',
    icon: '🔗',
    title: 'LINQ 基础',
    content: `## 第四十一章　LINQ 基础

LINQ（Language Integrated Query，语言集成查询）是 C# 3.0 引入的杀手锏特性。它把"查询"这种原本属于 SQL 的能力，直接嵌入到 C# 语言里，让你能用统一的方式查询对象、数据库、XML、内存数据。掌握 LINQ，是从"会写 C#"到"写得地道 C#"的分水岭。

### 一、为什么需要 LINQ ⭐

没有 LINQ 之前，要从一个列表里找出"所有偶数并按降序排序"，你得写 for 循环 + 临时 List + Sort，五六行代码。有了 LINQ，一行链式调用搞定：

\`\`\`csharp
var evens = nums.Where(n => n % 2 == 0).OrderByDescending(n => n);
\`\`\`

LINQ 的核心价值：
1. **统一查询语法**：内存对象、数据库、XML 都用同一套 API。
2. **类型安全**：编译期检查，比拼 SQL 字符串靠谱得多。
3. **可组合**：方法可以链式调用，比命令式循环更声明式。
4. **可读性高**：意图清晰，"做什么"而不是"怎么做"。

### 二、两种语法：查询表达式 vs 方法语法

LINQ 提供两种等价的写法：

**方法语法（method syntax / fluent syntax）**——基于扩展方法，最常用：

\`\`\`csharp
var result = nums.Where(n => n > 5).Select(n => n * 2);
\`\`\`

**查询表达式（query syntax）**——SQL 风格，少数场景更清晰：

\`\`\`csharp
var result = from n in nums
             where n > 5
             select n * 2;
\`\`\`

两者编译后完全等价（查询表达式会被翻译成方法调用）。**90% 的场景推荐方法语法**，因为它能链式调用所有 LINQ 操作符，而查询表达式只支持一部分（Where、Select、OrderBy、GroupBy、Join 等）。

### 三、using System.Linq

LINQ 的扩展方法定义在 \`System.Linq.Enumerable\` 静态类里。在 .NET 8 控制台项目里，\`<ImplicitUsings>enable</ImplicitUsings>\` 会自动 global using \`System.Linq\`，所以默认就能用。

如果禁用了隐式 using，需要手动写：

\`\`\`csharp
using System.Linq;  // 必须有这一行，数组/List 才有 Where/Select 等方法
\`\`\`

### 四、IEnumerable<T> vs IQueryable<T> ⭐

这是 LINQ 最容易混淆的两个接口：

| 接口 | 命名空间 | 用途 | 执行方式 |
| --- | --- | --- | --- |
| IEnumerable<T> | System.Collections.Generic | 内存集合（List、数组、字典） | 把谓词编译成委托，在内存里逐个判断 |
| IQueryable<T> | System.Linq | 远程数据源（EF Core DbSet） | 把谓词翻译成表达式树，转换为 SQL 执行 |

举个直观例子：EF Core 里 \`db.Users.Where(u => u.Age > 18)\` 是 \`IQueryable<T>\`，**这个 Where 不会把所有 User 拉到内存再过滤**，而是翻译成 \`WHERE Age > 18\` 直接在数据库执行。如果用了 \`AsEnumerable()\` 先转成 IEnumerable<T>，就变成"先拉全表再内存过滤"，性能灾难。

记忆口诀：**IEnumerable = 内存查询，IQueryable = 远程查询**。

### 五、延迟执行 vs 立即执行 ⭐⭐⭐

这是 LINQ 最重要的概念，没有之一。

**延迟执行（deferred execution）**：Where、Select、OrderBy、Skip、Take 等返回 IEnumerable<T> 的方法**不会立即执行查询**。它们只是构建了一个"查询计划"，等你真正开始遍历（foreach / ToList / First）时才执行。

\`\`\`csharp
var query = nums.Where(n => { Console.WriteLine($"检查 {n}"); return n > 5; });
// 此时还没输出任何 "检查 n"
foreach (var n in query) { }  // 这时才开始执行 Where
// 每次 foreach 都会重新执行一次！
\`\`\`

**立即执行（immediate execution）**：ToList / ToArray / Count / First / Sum / Any 等会**立即触发查询**并缓存结果。

\`\`\`csharp
var list = nums.Where(n => n > 5).ToList();  // 立即执行，list 是缓存好的 List
\`\`\`

延迟执行的好处：可以组合查询而不立即消耗资源；坏处：可能被多次执行，或者修改源数据后结果变化（"捕获陷阱"）。

### 六、Where：过滤

\`\`\`csharp
var adults = people.Where(p => p.Age >= 18);          // 方法语法
var adults2 = from p in people where p.Age >= 18 select p;  // 查询语法
\`\`\`

### 七、Select：投影

把每个元素转换成新形式：

\`\`\`csharp
var names = people.Select(p => p.Name);                  // 取名字
var dtos = people.Select(p => new { p.Name, p.Age });    // 转匿名对象
\`\`\`

### 八、OrderBy / OrderByDescending / ThenBy

\`\`\`csharp
var sorted = people.OrderBy(p => p.Age).ThenBy(p => p.Name);  // 先按年龄升序，年龄相同按名字
var desc = people.OrderByDescending(p => p.Age);              // 降序
\`\`\`

ThenBy 必须跟在 OrderBy 后面，单独使用没意义。

### 九、查询表达式 from...where...select

完整查询表达式结构：

\`\`\`csharp
var result = from p in people
             where p.Age >= 18
             orderby p.Age descending, p.Name
             select new { p.Name, p.Age };
\`\`\`

注意：查询表达式**必须以 select 或 group 结尾**。

### 十、var 推断

LINQ 查询经常返回匿名类型，必须用 var：

\`\`\`csharp
var dtos = people.Select(p => new { p.Name, IsAdult = p.Age >= 18 });
// dtos 类型是 IEnumerable<匿名类型>，无法显式写出
\`\`\`

### 十一、IQueryable 在 EF Core 中的作用简介

EF Core 的 \`DbSet<T>\` 实现 \`IQueryable<T>\`。你链式调用 Where / Select / OrderBy 时，EF Core 会把这些**表达式树**累积起来，等到 ToListAsync / FirstAsync 时再翻译成 SQL 一次性发给数据库。

\`\`\`csharp
// EF Core 示例（不在本 demo 跑）
var adults = db.Users
    .Where(u => u.Age >= 18)
    .OrderBy(u => u.Name)
    .Select(u => u.Name)
    .ToListAsync();  // 这一刻才真正发 SQL
\`\`\`

关键：**谓词里的代码会被翻译成 SQL**，所以不能在 Where 里随便调用 C# 方法（比如 \`u => MyHelper.IsValid(u)\`），EF Core 不一定能翻译。

本章 demo 用 List<int> 和 List<Product> 演示两种语法对比、Where/Select/OrderBy、var 推断，并用 yield return 自定义一个延迟执行方法让你"看见"延迟执行。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「LINQ 基础」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 - LINQ 基础演示
// 演示：查询语法 vs 方法语法、Where/Select/OrderBy、var 推断、延迟执行

using System;

using System.Collections.Generic;

using System.Linq;

var products = new List<Product>
{
    new() { Id = 1, Name = "iPhone 15", Price = 7999, Category = "手机" },
    new() { Id = 2, Name = "MacBook Air", Price = 9499, Category = "电脑" },
    new() { Id = 3, Name = "iPad Pro", Price = 6999, Category = "平板" },
    new() { Id = 4, Name = "Xiaomi 14", Price = 3999, Category = "手机" },
    new() { Id = 5, Name = "Surface Pro", Price = 8999, Category = "电脑" },
};

Console.WriteLine("=== 1. 方法语法：找出手机并按价格降序 ===");

var phonesMethod = products
    .Where(p => p.Category == "手机")        // 过滤出手机
    .OrderByDescending(p => p.Price)         // 按价格降序
    .Select(p => new { p.Name, p.Price });

foreach (var item in phonesMethod)
{
    Console.WriteLine($"  {item.Name} - ¥{item.Price}");
}

Console.WriteLine("\\n=== 2. 查询表达式：等价写法 ===");

var phonesQuery = from p in products
                  where p.Category == "手机"
                  orderby p.Price descending
                  select new { p.Name, p.Price };

foreach (var item in phonesQuery)
{
    Console.WriteLine($"  {item.Name} - ¥{item.Price}");
}

Console.WriteLine("\\n=== 3. OrderBy + ThenBy：多字段排序 ===");

var sorted = products
    .OrderBy(p => p.Category)                // 主排序：类别
    .ThenByDescending(p => p.Price);

foreach (var p in sorted) Console.WriteLine($"  {p}");

Console.WriteLine("\\n=== 4. var 推断与匿名类型 ===");

var dtos = products.Select(p => new { p.Id, p.Name, IsExpensive = p.Price > 7000 });

foreach (var d in dtos)
{
    Console.WriteLine($"  Id={d.Id}, Name={d.Name}, 昂贵={d.IsExpensive}");
}

Console.WriteLine("\\n=== 5. 延迟执行演示 ===");

Console.WriteLine("构建查询（此时不会打印任何 '检查'）...");

var query = products.Where(p =>
{
    Console.WriteLine($"  [Where 内部] 检查 {p.Name}");  // 谓词带副作用，用于观察
    return p.Price > 5000;
});

Console.WriteLine("查询已构建，但还没执行 Where 谓词");

Console.WriteLine("开始遍历：");

foreach (var p in query) Console.WriteLine($"  命中: {p.Name}");

Console.WriteLine("\\n=== 6. 延迟执行的陷阱：每次遍历都重新执行 ===");

Console.WriteLine("调用 Count（会再次触发 Where 执行）：");

int count = query.Count();

Console.WriteLine($"  共 {count} 个");

Console.WriteLine("\\n=== 7. ToList 触发立即执行 ===");

var cached = products.Where(p => p.Price > 5000).ToList();

Console.WriteLine($"cached 里有 {cached.Count} 个元素，后续访问不再重新计算");

Console.WriteLine("\\n=== 8. 自定义延迟执行方法（yield return）===");

var customQuery = MyWhere(products, p => p.Category == "电脑");

Console.WriteLine("自定义查询已构建，开始遍历：");

foreach (var p in customQuery) Console.WriteLine($"  {p}");

static IEnumerable<T> MyWhere<T>(IEnumerable<T> source, Func<T, bool> predicate)
{
    Console.WriteLine("  [MyWhere] 开始遍历源序列");
    foreach (var item in source)
    {
        Console.WriteLine($"  [MyWhere] 检查元素: {item}");
        if (predicate(item))
        {
            yield return item;  // 延迟返回，调用方拿到一个元素后继续
        }
    }
    Console.WriteLine("  [MyWhere] 遍历结束");
}

Console.WriteLine("\\n=== 9. IEnumerable vs IQueryable 说明 ===");

IEnumerable<Product> enumQuery = products.Where(p => p.Price > 5000);

Console.WriteLine($"IEnumerable 类型: {enumQuery.GetType().Name}");

Console.WriteLine("若用 EF Core 的 DbSet，Where 返回 IQueryable<T>");

Console.WriteLine("谓词会被翻译成表达式树 -> SQL，在数据库执行");

Console.WriteLine("\\n=== 10. 简单数值查询演示 ===");

int[] nums = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

var evens = from n in nums where n % 2 == 0 select n;

Console.WriteLine($"偶数（查询表达式）: {string.Join(", ", evens)}");

var squares = nums.Where(n => n > 5).Select(n => n * n);

Console.WriteLine($"大于5的平方: {string.Join(", ", squares)}");

// ============ 类型声明（必须放在所有顶级语句之后） ============

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public string Category { get; set; } = "";
    public override string ToString() => $"[{Id}] {Name} - ¥{Price:F2} ({Category})";
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第四十一章：LINQ 过滤与投影
  // ============================================================
  {
    id: 'csharp4-ch41',
    group: '第六部分 LINQ',
    icon: '🔎',
    title: 'LINQ 过滤与投影',
    content: `## 第四十二章　LINQ 过滤与投影

上一章讲了 LINQ 的"哲学"——延迟执行和两种语法。本章深入最常用的两类操作：**过滤**（把不需要的元素剔除）和**投影**（把元素转换成新形式）。这两类操作占了日常 LINQ 使用的 70% 以上。

### 一、Where 的多种重载 ⭐

\`Where\` 最常用的重载是 \`Where(predicate)\`，但还有一个**带索引的重载**：

\`\`\`csharp
// 带索引的 Where：第二个参数 int 是元素在序列中的下标
var everyOther = nums.Where((n, index) => index % 2 == 0);
// 取出下标为 0、2、4... 的元素
\`\`\`

这个重载在"取每隔一个元素"、"按下标过滤"等场景特别好用。

### 二、Select：投影 ⭐

Select 把每个元素映射成新形式，可以是属性、新对象、计算结果：

\`\`\`csharp
var names = people.Select(p => p.Name);                  // 投影成字符串
var dtos = people.Select(p => new PersonDto(p.Name));    // 投影成新对象
var indexed = people.Select((p, i) => new { Index = i, p.Name });  // 带索引
\`\`\`

### 三、SelectMany：展开嵌套集合 ⭐⭐⭐

SelectMany 是 LINQ 里最容易被忽略但最强大的操作之一。它**把嵌套集合"拍平"**：

\`\`\`csharp
class Teacher { public List<string> Students { get; set; } = new(); }

var teachers = new List<Teacher> { ... };
// 每个 Teacher 都有一个 Students 列表
// Select 返回 IEnumerable<List<string>>（嵌套）
var nested = teachers.Select(t => t.Students);
// SelectMany 返回 IEnumerable<string>（拍平）
var flat = teachers.SelectMany(t => t.Students);
\`\`\`

类比 SQL：Select 是普通查询，SelectMany 类似 \`JOIN + 取子表字段\`。

SelectMany 也有带结果选择器的重载：

\`\`\`csharp
var pairs = teachers.SelectMany(
    t => t.Students,
    (t, s) => new { Teacher = t.Name, Student = s });
\`\`\`

### 四、Distinct：去重

\`\`\`csharp
var unique = nums.Distinct();  // 去重
\`\`\`

注意：Distinct 默认用 \`EqualityComparer<T>.Default\`，对自定义类型要重写 Equals/GetHashCode 或传自定义比较器。

### 五、Skip / Take：分页神器

\`\`\`csharp
var page2 = allItems.Skip(10).Take(10);  // 跳过前10个，取接下来10个（第2页）
\`\`\`

这是分页的标准写法。在 EF Core 里，Skip + Take 会被翻译成 SQL 的 \`OFFSET ... FETCH NEXT ...\`。

### 六、SkipWhile / TakeWhile：条件跳过/取

\`\`\`csharp
var afterFirstNeg = nums.SkipWhile(n => n >= 0);  // 跳过开头所有非负数，遇到第一个负数停止跳过
var firstRun = nums.TakeWhile(n => n >= 0);       // 取开头连续的非负数
\`\`\`

注意：与 Where 不同，SkipWhile/TakeWhile 只在"开头连续"区域生效，中间出现的不影响。

### 七、Chunk（C# 8+）⭐

把序列切成固定大小的块，每块是一个数组：

\`\`\`csharp
var chunks = Enumerable.Range(1, 10).Chunk(3);
// [[1,2,3], [4,5,6], [7,8,9], [10]]
\`\`\`

批量处理场景非常实用：每 1000 条数据写一次数据库。

### 八、Zip（C# 4+，三参数版本 C# 7+）⭐

把多个序列按位置"拉链"合并：

\`\`\`csharp
var names = new[] { "Alice", "Bob", "Carol" };
var ages = new[] { 20, 30, 40 };
var zipped = names.Zip(ages, (name, age) => $"{name}-{age}");
// ["Alice-20", "Bob-30", "Carol-40"]
\`\`\`

.NET 6+ 支持三序列 Zip，返回 \`(T1, T2, T3)\` 元组：\`names.Zip(ages, scores)\`。长度不一致时按最短的截断。

### 九、OfType：按类型过滤

\`\`\`csharp
var list = new List<object> { 1, "hi", 2.5, "world", 3 };
var strings = list.OfType<string>();  // 只取 string 类型
\`\`\`

OfType 只过滤、不抛异常，遇到类型不匹配的元素直接跳过。

### 十、Cast：强制类型转换

\`\`\`csharp
var list = new ArrayList { 1, 2, 3 };
var nums = list.Cast<int>();  // 把每个元素转成 int
\`\`\`

Cast 与 OfType 区别：**Cast 遇到无法转换的元素会抛 InvalidCastException**，OfType 会跳过。优先用 OfType。

### 十一、DefaultIfEmpty：给空序列兜底

\`\`\`csharp
var empty = Array.Empty<int>();
var withDefault = empty.DefaultIfEmpty(-1);  // 空序列变成 [-1]
\`\`\`

常用于左连接（保证右侧空时也有一个 default 元素），下一章 GroupJoin 会用到。

### 十二、过滤/投影的性能注意

1. **多条件 Where 比 && 链式更清晰**：\`Where(a).Where(b)\` 与 \`Where(x => a(x) && b(x))\` 性能几乎相同，前者可读性更好（小数据量）。
2. **Select 中创建对象有成本**：大数据量投影到匿名对象会分配内存，必要时用 struct 或 record struct。
3. **延迟执行的副作用**：Where 里如果修改外部状态，每次遍历结果可能不同。

本章 demo 用学生 + 课程数据演示 Where（带索引）、Select、SelectMany（拍平课程）、Distinct、Skip/Take（分页）、Chunk、Zip（拉链合并）、OfType/Cast、DefaultIfEmpty。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「LINQ 过滤与投影」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 - LINQ 过滤与投影演示
// 演示：Where(带索引)、Select、SelectMany、Distinct、Skip/Take、SkipWhile/TakeWhile、
//       Chunk、Zip、OfType、Cast、DefaultIfEmpty

using System;

using System.Collections;

using System.Collections.Generic;

using System.Linq;

var students = new List<Student>
{
    new() { Id = 1, Name = "张三", Age = 20, Courses = { "数学", "物理", "英语" } },
    new() { Id = 2, Name = "李四", Age = 22, Courses = { "数学", "化学" } },
    new() { Id = 3, Name = "王五", Age = 19, Courses = { "物理", "英语", "生物" } },
    new() { Id = 4, Name = "赵六", Age = 21, Courses = { "数学", "物理" } },
    new() { Id = 5, Name = "钱七", Age = 20, Courses = { "化学", "生物" } },
};

Console.WriteLine("=== 1. Where：基本过滤 ===");

var adults = students.Where(s => s.Age >= 20);

foreach (var s in adults) Console.WriteLine($"  {s.Name} ({s.Age})");

Console.WriteLine("\\n=== 2. Where 带索引重载：取偶数下标的学生 ===");

var everyOther = students.Where((s, idx) => idx % 2 == 0);

foreach (var s in everyOther) Console.WriteLine($"  下标 {students.IndexOf(s)}: {s.Name}");

Console.WriteLine("\\n=== 3. Select：投影 ===");

var names = students.Select(s => s.Name);

Console.WriteLine($"  名字: {string.Join(", ", names)}");

var dtos = students.Select(s => new { s.Name, s.Age, CourseCount = s.Courses.Count });

foreach (var d in dtos) Console.WriteLine($"  {d.Name}, {d.Age}岁, {d.CourseCount}门课");

Console.WriteLine("\\n=== 4. Select 带索引 ===");

var indexed = students.Select((s, i) => $"#{i + 1} {s.Name}");

foreach (var item in indexed) Console.WriteLine($"  {item}");

Console.WriteLine("\\n=== 5. SelectMany：拍平嵌套课程列表 ===");

var nested = students.Select(s => s.Courses);

Console.WriteLine("  Select 结果（嵌套，每行是一个 List）:");

foreach (var list in nested) Console.WriteLine($"    [{string.Join(",", list)}]");

var flat = students.SelectMany(s => s.Courses);

Console.WriteLine($"  SelectMany 结果（拍平）: {string.Join(", ", flat)}");

Console.WriteLine("\\n=== 6. SelectMany 带结果选择器 ===");

var pairs = students.SelectMany(
    s => s.Courses,
    (s, course) => new { Student = s.Name, Course = course });

foreach (var p in pairs.Take(5)) Console.WriteLine($"  {p.Student} -> {p.Course}");

Console.WriteLine("\\n=== 7. Distinct：去重课程 ===");

var uniqueCourses = students.SelectMany(s => s.Courses).Distinct();

Console.WriteLine($"  所有课程: {string.Join(", ", uniqueCourses)}");

Console.WriteLine("\\n=== 8. Skip / Take：分页（每页2条）===");

int pageSize = 2;

for (int page = 0; page < 3; page++)
{
    // Skip 跳过前 N 个，Take 取接下来的 M 个
    var pageItems = students.Skip(page * pageSize).Take(pageSize);
    Console.WriteLine($"  第 {page + 1} 页: {string.Join(", ", pageItems.Select(s => s.Name))}");
}

Console.WriteLine("\\n=== 9. SkipWhile / TakeWhile ===");

int[] nums = { 1, 2, 3, -1, 4, 5, -2, 6 };

var firstRun = nums.TakeWhile(n => n > 0);

Console.WriteLine($"  TakeWhile(n>0): {string.Join(", ", firstRun)}");

var afterFirstNeg = nums.SkipWhile(n => n > 0);

Console.WriteLine($"  SkipWhile(n>0): {string.Join(", ", afterFirstNeg)}");

Console.WriteLine("\\n=== 10. Chunk（C# 8+）：分块 ===");

var chunks = Enumerable.Range(1, 10).Chunk(3);

Console.WriteLine($"  1..10 按 3 分块:");

foreach (var chunk in chunks) Console.WriteLine($"    [{string.Join(",", chunk)}]");

Console.WriteLine("\\n=== 11. Zip（C# 4+）：拉链合并 ===");

var nameList = new[] { "Alice", "Bob", "Carol" };

var ageList = new[] { 20, 30, 40 };

var zipped = nameList.Zip(ageList, (name, age) => $"{name}-{age}");

Console.WriteLine($"  两序列 Zip: {string.Join(", ", zipped)}");

var scores = new[] { 90, 85, 92 };

var triples = nameList.Zip(ageList, scores).Select(t => $"{t.First}/{t.Second}岁/{t.Third}分");

Console.WriteLine($"  三序列 Zip: {string.Join(", ", triples)}");

var extra = new[] { 1, 2, 3, 4, 5 };

var truncated = nameList.Zip(extra, (n, x) => $"{n}-{x}");

Console.WriteLine($"  长度不一致: {string.Join(", ", truncated)}");

Console.WriteLine("\\n=== 12. OfType：按类型过滤（不抛异常）===");

List<object> mixed = new() { 1, "hi", 2.5, "world", 3, true };

var onlyStrings = mixed.OfType<string>();

Console.WriteLine($"  字符串: {string.Join(", ", onlyStrings)}");

var onlyInts = mixed.OfType<int>();

Console.WriteLine($"  整数: {string.Join(", ", onlyInts)}");

Console.WriteLine("\\n=== 13. Cast：强制类型转换 ===");

ArrayList arrayList = new() { "apple", "banana", "cherry" };

var fruits = arrayList.Cast<string>();

Console.WriteLine($"  Cast 结果: {string.Join(", ", fruits)}");

Console.WriteLine("\\n=== 14. DefaultIfEmpty：空序列兜底 ===");

var empty = Array.Empty<int>();

var withDefault = empty.DefaultIfEmpty(-1);

Console.WriteLine($"  空序列 DefaultIfEmpty(-1): {string.Join(", ", withDefault)}");

var nonEmpty = new[] { 1, 2, 3 };

var nonEmptyResult = nonEmpty.DefaultIfEmpty(-1);

Console.WriteLine($"  非空序列 DefaultIfEmpty: {string.Join(", ", nonEmptyResult)}");

Console.WriteLine("\\n=== 15. 综合实战：找出选了 '数学' 的学生姓名并去重 ===");

var mathStudents = students
    .Where(s => s.Courses.Contains("数学"))  // 过滤选数学的
    .Select(s => s.Name)                      // 投影成名字
    .Distinct()                               // 去重
    .OrderBy(n => n);

Console.WriteLine($"  数学课学生: {string.Join(", ", mathStudents)}");

// ============ 类型声明（必须放在所有顶级语句之后） ============

class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Age { get; set; }
    public List<string> Courses { get; set; } = new();
    public override string ToString() => $"[{Id}] {Name}({Age}岁) 课程: {string.Join(",", Courses)}";
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第四十二章：LINQ 排序与分组
  // ============================================================
  {
    id: 'csharp4-ch42',
    group: '第六部分 LINQ',
    icon: '📊',
    title: 'LINQ 排序与分组',
    content: `## 第四十三章　LINQ 排序与分组

排序（Order）和分组（Group）是数据处理的核心操作。SQL 里你写 \`ORDER BY\` 和 \`GROUP BY\`，LINQ 里同样有 OrderBy / GroupBy，但更强大——因为 LINQ 操作的是强类型对象，分组结果是嵌套结构，可以直接遍历。

### 一、OrderBy / OrderByDescending / ThenBy / ThenByDescending ⭐

\`\`\`csharp
var sorted = people
    .OrderBy(p => p.Age)              // 主排序：年龄升序
    .ThenBy(p => p.Name)              // 次排序：名字升序
    .ThenByDescending(p => p.Id);     // 第三排序：Id 降序
\`\`\`

要点：
1. **第一个排序用 OrderBy**，后续都用 ThenBy。OrderBy 会重置排序，ThenBy 在已有排序基础上追加。
2. 升降序对应 OrderBy/OrderByDescending，ThenBy/ThenByDescending。
3. 排序是**稳定**的（LINQ to Objects 是稳定排序，相等元素保持原顺序）。

查询表达式：\`orderby p.Age, p.Name descending\`

### 二、Reverse：反转序列

\`\`\`csharp
var reversed = new[] { 1, 2, 3 }.Reverse();  // 3, 2, 1
\`\`\`

注意：Reverse 是延迟执行的，会缓冲整个序列再倒序遍历。

### 三、GroupBy：分组 ⭐⭐⭐

GroupBy 把序列按某个键分组，返回 \`IEnumerable<IGrouping<TKey, TElement>>\`：

\`\`\`csharp
var byCategory = products.GroupBy(p => p.Category);
foreach (var group in byCategory)
{
    Console.WriteLine($"{group.Key}: {group.Count()} 个");
    foreach (var p in group) Console.WriteLine($"  {p.Name}");
}
\`\`\`

\`IGrouping<TKey, TElement>\` 本身就是 \`IEnumerable<TElement>\`，可以直接遍历。Key 是分组键。

### 四、GroupBy 多键分组

要对多个字段分组，用**匿名类型**作为键：

\`\`\`csharp
var byCategoryAndPrice = products.GroupBy(p => new { p.Category, IsExpensive = p.Price > 5000 });
foreach (var g in byCategoryAndPrice)
    Console.WriteLine($"{g.Key.Category}/{g.Key.IsExpensive}: {g.Count()}");
\`\`\`

### 五、GroupBy 带元素选择器

\`\`\`csharp
// 只取名字，不取整个对象
var namesByCategory = products.GroupBy(
    p => p.Category,
    p => p.Name);
\`\`\`

还有带结果选择器的重载，可以直接把每组投影成最终形式：

\`\`\`csharp
var stats = products.GroupBy(
    p => p.Category,
    (key, group) => new { Category = key, Count = group.Count(), AvgPrice = group.Average(p => p.Price) });
\`\`\`

### 六、ToLookup：立即执行的"分组字典" ⭐

GroupBy 是延迟执行的，ToLookup 是**立即执行**的，返回 \`ILookup<TKey, TElement>\`：

\`\`\`csharp
var lookup = products.ToLookup(p => p.Category);
// lookup["手机"] 返回所有手机
\`\`\`

ILookup 类似 \`Dictionary<TKey, List<TElement>>\`，但**一个键可以对应多个值**，且查找不存在的键返回空序列而非抛异常。

### 七、Join：内连接 ⭐

Join 类似 SQL 的 INNER JOIN：

\`\`\`csharp
var result = students.Join(
    classes,
    s => s.ClassId,
    c => c.Id,
    (s, c) => new { s.Name, ClassName = c.Name });
\`\`\`

只匹配得上的元素会出现，匹配不上的丢失。

查询表达式：\`join c in classes on s.ClassId equals c.Id\`

### 八、GroupJoin：左连接 ⭐⭐

GroupJoin 类似 SQL 的 LEFT JOIN，但右侧是**分组**的：

\`\`\`csharp
var result = classes.GroupJoin(
    students,
    c => c.Id,
    s => s.ClassId,
    (c, studentGroup) => new { ClassName = c.Name, Students = studentGroup });
\`\`\`

即使班级没有学生，也会出现一项（studentGroup 为空）。

### 九、SelectMany 与 GroupJoin 区别

- **Join**：返回扁平的 (左, 右) 对，匹配不上的丢失。
- **GroupJoin**：返回 (左, 右组)，匹配不上的右侧为空组。
- **SelectMany**：从左侧"展开"到右侧，没有"匹配"概念，直接展开嵌套集合。

### 十、内连接 vs 左连接

**内连接**（Join）：只用 Join 即可。

**左连接**：用 GroupJoin + SelectMany + DefaultIfEmpty：

\`\`\`csharp
var leftJoin = classes
    .GroupJoin(
        students,
        c => c.Id,
        s => s.ClassId,
        (c, group) => new { Class = c, Students = group })
    .SelectMany(
        x => x.Students.DefaultIfEmpty(),
        (x, s) => new { ClassName = x.Class.Name, StudentName = s?.Name ?? "(无学生)" });
\`\`\`

这是 LINQ 实现 LEFT JOIN 的标准模式。

### 十一、自连接

表和自己连接，比如"员工 → 经理"（经理也是员工）：

\`\`\`csharp
var empMgr = employees.Join(
    employees,
    e => e.ManagerId,
    m => m.Id,
    (e, m) => new { Employee = e.Name, Manager = m.Name });
\`\`\`

### 十二、C# join...on...equals 语法

查询表达式里的 join：

\`\`\`csharp
var result = from s in students
             join c in classes on s.ClassId equals c.Id
             select new { s.Name, ClassName = c.Name };
\`\`\`

注意：\`on ... equals ...\`，不是 \`on ... = ...\`，且只能做等值连接（不等值连接得用 Where）。

本章 demo 演示 OrderBy/ThenBy 多字段排序、GroupBy 单键/多键/带选择器、ToLookup 立即分组、Join 内连接、GroupJoin + DefaultIfEmpty 左连接、自连接。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「LINQ 排序与分组」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 - LINQ 排序与分组演示
// 演示：OrderBy/ThenBy/Reverse、GroupBy(单键/多键/选择器)、ToLookup、
//       Join、GroupJoin、左连接、自连接

using System;

using System.Collections.Generic;

using System.Linq;

var classes = new List<ClassInfo>
{
    new() { Id = 101, Name = "一班" },
    new() { Id = 102, Name = "二班" },
    new() { Id = 103, Name = "三班" },  // 这个班没有学生，用于演示左连接
};

var students = new List<Student>
{
    new() { Id = 1, Name = "张三", Age = 20, ClassId = 101, ManagerId = 2 },
    new() { Id = 2, Name = "李四", Age = 22, ClassId = 101, ManagerId = null },
    new() { Id = 3, Name = "王五", Age = 19, ClassId = 102, ManagerId = 4 },
    new() { Id = 4, Name = "赵六", Age = 21, ClassId = 102, ManagerId = null },
    new() { Id = 5, Name = "钱七", Age = 20, ClassId = 102, ManagerId = 4 },
    new() { Id = 6, Name = "孙八", Age = 23, ClassId = 101, ManagerId = 2 },
};

Console.WriteLine("=== 1. OrderBy + ThenBy：多字段排序 ===");

var sorted = students.OrderBy(s => s.Age).ThenByDescending(s => s.Name);

foreach (var s in sorted) Console.WriteLine($"  {s}");

Console.WriteLine("\\n=== 2. Reverse：反转序列 ===");

var nums = new[] { 1, 2, 3, 4, 5 };

Console.WriteLine($"  原始: {string.Join(",", nums)}");

Console.WriteLine($"  反转: {string.Join(",", nums.Reverse())}");

Console.WriteLine("\\n=== 3. GroupBy 单键：按班级分组 ===");

var byClass = students.GroupBy(s => s.ClassId);

foreach (var g in byClass)
{
    Console.WriteLine($"  班级 {g.Key} ({g.Count()}人):");
    foreach (var s in g) Console.WriteLine($"    {s.Name}");
}

Console.WriteLine("\\n=== 4. GroupBy 多键：按 (班级, 是否成年) 分组 ===");

var byMulti = students.GroupBy(s => new { s.ClassId, IsAdult = s.Age >= 20 });

foreach (var g in byMulti)
{
    Console.WriteLine($"  班级{g.Key.ClassId}/{(g.Key.IsAdult ? "成年" : "未成年")}: {string.Join(",", g.Select(s => s.Name))}");
}

Console.WriteLine("\\n=== 5. GroupBy 带元素选择器 ===");

var namesByClass = students.GroupBy(
    s => s.ClassId,
    s => s.Name);

foreach (var g in namesByClass)
    Console.WriteLine($"  班级 {g.Key}: {string.Join(",", g)}");

Console.WriteLine("\\n=== 6. GroupBy 带结果选择器：直接算统计 ===");

var stats = students.GroupBy(
    s => s.ClassId,
    (classId, group) => new
    {
        ClassId = classId,
        Count = group.Count(),
        AvgAge = group.Average(s => s.Age),
        MaxAge = group.Max(s => s.Age)
    });

foreach (var st in stats)
    Console.WriteLine($"  班级 {st.ClassId}: {st.Count}人, 平均{st.AvgAge:F1}岁, 最大{st.MaxAge}岁");

Console.WriteLine("\\n=== 7. ToLookup：立即执行的分组查找 ===");

var lookup = students.ToLookup(s => s.ClassId);

Console.WriteLine($"  101 班学生: {string.Join(",", lookup[101].Select(s => s.Name))}");

Console.WriteLine($"  102 班学生: {string.Join(",", lookup[102].Select(s => s.Name))}");

Console.WriteLine($"  999 班学生(不存在): {string.Join(",", lookup[999].Select(s => s.Name))}");

Console.WriteLine("\\n=== 8. Join：内连接 ===");

var innerJoined = students.Join(
    classes,
    s => s.ClassId,             // 学生侧的键
    c => c.Id,                  // 班级侧的键
    (s, c) => new { s.Name, ClassName = c.Name });

foreach (var item in innerJoined)
    Console.WriteLine($"  {item.Name} -> {item.ClassName}");

Console.WriteLine("\\n=== 9. GroupJoin：左连接（带分组）===");

var groupJoined = classes.GroupJoin(
    students,
    c => c.Id,
    s => s.ClassId,
    (c, stuGroup) => new { ClassName = c.Name, Students = stuGroup });

foreach (var item in groupJoined)
{
    Console.WriteLine($"  {item.ClassName}:");
    if (!item.Students.Any())
        Console.WriteLine("    (无学生)");
    else
        foreach (var s in item.Students) Console.WriteLine($"    {s.Name}");
}

Console.WriteLine("\\n=== 10. 完整左连接：GroupJoin + SelectMany + DefaultIfEmpty ===");

var leftJoin = classes
    .GroupJoin(
        students,
        c => c.Id,
        s => s.ClassId,
        (c, group) => new { Class = c, Students = group })
    .SelectMany(
        x => x.Students.DefaultIfEmpty(),  // 空组变成 [default]，保证至少一行
        (x, s) => new { ClassName = x.Class.Name, StudentName = s?.Name ?? "(无学生)" });

foreach (var item in leftJoin)
    Console.WriteLine($"  {item.ClassName} -> {item.StudentName}");

Console.WriteLine("\\n=== 11. 自连接：员工 -> 组长 ===");

var empMgr = students.Join(
    students,
    e => e.ManagerId,        // 员工的组长 Id
    m => m.Id,                // 组长的 Id
    (e, m) => new { Employee = e.Name, Manager = m.Name });

foreach (var item in empMgr)
    Console.WriteLine($"  {item.Employee} 的组长是 {item.Manager}");

Console.WriteLine("\\n=== 12. 查询表达式 join...on...equals 语法 ===");

var queryJoin = from s in students
                join c in classes on s.ClassId equals c.Id
                select new { s.Name, ClassName = c.Name };

foreach (var item in queryJoin.Take(3))
    Console.WriteLine($"  {item.Name} -> {item.ClassName}");

Console.WriteLine("\\n=== 13. 查询表达式 group...by ===");

var queryGroup = from s in students
                 group s by s.ClassId into g
                 orderby g.Key
                 select new { ClassId = g.Key, Count = g.Count() };

foreach (var g in queryGroup)
    Console.WriteLine($"  班级 {g.ClassId}: {g.Count}人");

// ============ 类型声明（必须放在所有顶级语句之后） ============

class ClassInfo
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public override string ToString() => $"班级[{Id}]:{Name}";
}

class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Age { get; set; }
    public int ClassId { get; set; }
    public int? ManagerId { get; set; }  // 自连接用：所属组长 Id
    public override string ToString() => $"[{Id}]{Name}({Age}岁,Class={ClassId})";
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第四十三章：LINQ 聚合与统计
  // ============================================================
  {
    id: 'csharp4-ch43',
    group: '第六部分 LINQ',
    icon: '🧮',
    title: 'LINQ 聚合与统计',
    content: `## 第四十四章　LINQ 聚合与统计

聚合（Aggregation）是把一个序列"压缩"成单个值的操作。SQL 里有 COUNT/SUM/MAX/MIN/AVG，LINQ 里同样有，而且更灵活——你可以自定义聚合逻辑。

### 一、Count / LongCount ⭐

\`\`\`csharp
int count = students.Count();              // 总数
int adults = students.Count(s => s.Age >= 18);  // 带条件
long bigCount = hugeList.LongCount();      // 超过 int.MaxValue 时用
\`\`\`

Count(predicate) 等价于 \`Where(predicate).Count()\`，但更高效（少一次中间分配）。

### 二、Sum / Min / Max / Average ⭐

\`\`\`csharp
var totalPrice = products.Sum(p => p.Price);
var minAge = students.Min(s => s.Age);
var maxPrice = products.Max(p => p.Price);
var avgScore = students.Average(s => s.Score);
\`\`\`

注意：
1. Sum/Average 对**空序列**返回 0（Sum）或抛异常（Average）。空集合用 Average 会抛 InvalidOperationException，要先 Count 检查或用 DefaultIfEmpty。
2. 这些方法有 **nullable 重载**：\`nums.Max()\` 对 \`int?\` 会自动忽略 null。

### 三、Aggregate：自定义聚合 ⭐⭐⭐

Aggregate 是最强大的聚合——你可以指定任意"累积逻辑"：

\`\`\`csharp
// 无种子：第一个元素是初始值
var sum = nums.Aggregate((acc, n) => acc + n);
// 等价于 nums.Sum()
\`\`\`

带种子（seed）：

\`\`\`csharp
var sum = nums.Aggregate(0, (acc, n) => acc + n);
// 第一个参数 0 是初始累积值
\`\`\`

带种子和结果选择器：

\`\`\`csharp
var result = nums.Aggregate(
    0,
    (acc, n) => acc + n,
    acc => $"总和: {acc}");
\`\`\`

经典应用：**用 Aggregate 实现 string.Join**：

\`\`\`csharp
var csv = nums.Aggregate("", (acc, n) => acc == "" ? n.ToString() : acc + "," + n);
\`\`\`

（实际请用 string.Join，性能更好；这里只是演示 Aggregate 原理）

### 四、Any / All / Contains ⭐

\`\`\`csharp
bool hasAdult = students.Any(s => s.Age >= 18);   // 是否存在任一满足条件的
bool allAdult = students.All(s => s.Age >= 18);   // 是否全部满足
bool contains = students.Contains(specificStudent);  // 是否包含某元素
\`\`\`

要点：
1. **Any/All 是短路求值**：找到第一个满足/不满足的就停，不全遍历。
2. **空序列**：Any 返回 false，All 返回 true（数学惯例：空命题为真）。
3. **优先用 Any 而不是 Count() > 0**：Any 不需要遍历全部，Count 必须遍历。

### 五、First / FirstOrDefault / Last / LastOrDefault ⭐

\`\`\`csharp
var first = students.First();                       // 第一个，空序列抛异常
var firstAdult = students.First(s => s.Age >= 18);  // 第一个满足条件的
var firstOr = students.FirstOrDefault(s => s.Age >= 100);  // 找不到返回 default
\`\`\`

要点：
1. **First 找不到抛异常**，**FirstOrDefault 找不到返回 default**（引用类型 null，值类型 0/false）。
2. **Last / LastOrDefault** 同理，取最后一个。
3. 注意：Last 对 IEnumerable<T> 会遍历整个序列，对 IList<T> 才直接索引。

### 六、Single / SingleOrDefault ⭐

\`\`\`csharp
var s = students.Single(s => s.Id == 1);        // 必须恰好一个，否则抛异常
var s2 = students.SingleOrDefault(s => s.Id == 1);  // 0 或 1 个
\`\`\`

Single 用于"期望唯一"的场景——比如按主键查找。多于一个会抛异常，比 First 更严格、更安全。

### 七、ElementAt / ElementAtOrDefault

\`\`\`csharp
var third = students.ElementAt(2);          // 第三个（下标 2）
var maybe = students.ElementAtOrDefault(99);  // 越界返回 default
\`\`\`

### 八、SequenceEqual：序列相等

\`\`\`csharp
bool equal = a.SequenceEqual(b);  // 元素个数和顺序都相同
\`\`\`

注意：**顺序敏感**。\`{1,2,3}\` 与 \`{3,2,1}\` 不相等。

### 九、IEqualityComparer<T>：自定义比较 ⭐

很多 LINQ 方法（Distinct、GroupBy、Contains、SequenceEqual、ToDictionary 等）都有接受 \`IEqualityComparer<T>\` 的重载：

\`\`\`csharp
public class NameComparer : IEqualityComparer<Student>
{
    public bool Equals(Student? x, Student? y) => x?.Name == y?.Name;
    public int GetHashCode(Student obj) => obj.Name.GetHashCode();
}

var uniqueByName = students.Distinct(new NameComparer());
\`\`\`

也可以用 \`StringComparer.OrdinalIgnoreCase\` 做大小写不敏感比较。

### 十、分批处理 Batch

LINQ 内置没有 Batch（有 Chunk），常用 Chunk 实现：

\`\`\`csharp
var batches = source.Chunk(100);  // 每批 100 条
foreach (var batch in batches) db.BulkInsert(batch);
\`\`\`

如果是 EF Core 批量写入，建议用循环 + Skip/Take，或者第三方库。

### 十一、聚合的性能注意

1. **多遍遍历 vs 缓存**：多次 Count/Sum/Max 会多次遍历。需要多次统计时，先 ToList 缓存。
2. **LINQ to SQL 翻译**：EF Core 里 Sum/Count 会被翻译成 SQL 聚合，不会拉全表。
3. **空集合的 Average 抛异常**：永远 \`if (list.Any())\` 或用 DefaultIfEmpty 兜底。

本章 demo 演示所有聚合操作、自定义 Aggregate 实现 string.Join、IEqualityComparer 自定义比较、Chunk 分批处理。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「LINQ 聚合与统计」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 - LINQ 聚合与统计演示
// 演示：Count/Sum/Min/Max/Average、Aggregate(自定义/带种子)、Any/All/Contains、
//       First/FirstOrDefault/Last/Single、ElementAt、SequenceEqual、
//       IEqualityComparer、Chunk 批处理

using System;

using System.Collections.Generic;

using System.Linq;

var scores = new List<Score>
{
    new() { Subject = "数学", Points = 90 },
    new() { Subject = "英语", Points = 85 },
    new() { Subject = "物理", Points = 92 },
    new() { Subject = "化学", Points = 78 },
    new() { Subject = "数学", Points = 88 },  // 重复科目，演示 Distinct
};

Console.WriteLine("=== 1. Count / LongCount ===");

Console.WriteLine($"  总记录数: {scores.Count()}");

Console.WriteLine($"  优秀(>=85)数: {scores.Count(s => s.Points >= 85)}");

Console.WriteLine($"  LongCount: {scores.LongCount()}");

Console.WriteLine("\\n=== 2. Sum / Min / Max / Average ===");

Console.WriteLine($"  总分: {scores.Sum(s => s.Points)}");

Console.WriteLine($"  最低分: {scores.Min(s => s.Points)}");

Console.WriteLine($"  最高分: {scores.Max(s => s.Points)}");

Console.WriteLine($"  平均分: {scores.Average(s => s.Points):F2}");

var emptyScores = Array.Empty<Score>();

var safeAvg = emptyScores.DefaultIfEmpty(new Score { Points = 0 }).Average(s => s.Points);

Console.WriteLine($"  空集合安全平均: {safeAvg}");

int?[] nullableNums = { 1, 2, null, 4, null, 6 };

Console.WriteLine($"  nullable Count: {nullableNums.Count()}");

Console.WriteLine($"  nullable Sum: {nullableNums.Sum()}");

Console.WriteLine($"  nullable Max: {nullableNums.Max()}");

Console.WriteLine("\\n=== 3. Aggregate：自定义聚合 ===");

int[] nums = { 1, 2, 3, 4, 5 };

var sum = nums.Aggregate((acc, n) => acc + n);

Console.WriteLine($"  无种子 Aggregate 求和: {sum}");

var sumWithSeed = nums.Aggregate(0, (acc, n) => acc + n);

Console.WriteLine($"  带种子 Aggregate 求和: {sumWithSeed}");

var sumWithResult = nums.Aggregate(0, (acc, n) => acc + n, acc => $"总和={acc}");

Console.WriteLine($"  带结果选择器: {sumWithResult}");

var csv = nums.Aggregate("", (acc, n) => acc == "" ? n.ToString() : acc + "," + n);

Console.WriteLine($"  Aggregate 模拟 Join: {csv}");

var factorial = nums.Aggregate(1, (acc, n) => acc * n);

Console.WriteLine($"  1*2*3*4*5 = {factorial}");

Console.WriteLine("\\n=== 4. Any / All / Contains ===");

Console.WriteLine($"  是否有满分(>=100): {scores.Any(s => s.Points >= 100)}");

Console.WriteLine($"  是否全部及格(>=60): {scores.All(s => s.Points >= 60)}");

Console.WriteLine($"  是否存在物理: {scores.Any(s => s.Subject == "物理")}");

var specificScore = scores[0];

Console.WriteLine($"  Contains 第一个元素: {scores.Contains(specificScore)}");

Console.WriteLine("\\n=== 5. First / FirstOrDefault / Last / LastOrDefault ===");

var first = scores.First();

Console.WriteLine($"  First: {first}");

var firstMath = scores.First(s => s.Subject == "数学");

Console.WriteLine($"  First 数学: {firstMath}");

var notFound = scores.FirstOrDefault(s => s.Subject == "历史");

Console.WriteLine($"  FirstOrDefault 历史: {(notFound == null ? "null" : notFound)}");

var last = scores.Last();

Console.WriteLine($"  Last: {last}");

var lastOrDefault = scores.LastOrDefault(s => s.Points > 200);

Console.WriteLine($"  LastOrDefault >200: {(lastOrDefault == null ? "null" : lastOrDefault)}");

Console.WriteLine("\\n=== 6. Single / SingleOrDefault ===");

var singleEnglish = scores.Where(s => s.Subject == "英语").Single();

Console.WriteLine($"  Single 英语: {singleEnglish}");

var singleOr = scores.SingleOrDefault(s => s.Subject == "历史");

Console.WriteLine($"  SingleOrDefault 历史: {(singleOr == null ? "null" : singleOr)}");

try
{
    var bad = scores.Single(s => s.Subject == "数学");
}
catch (InvalidOperationException)
{
    Console.WriteLine("  Single(数学) 异常: 序列包含多个元素");
}

Console.WriteLine("\\n=== 7. ElementAt / ElementAtOrDefault ===");

Console.WriteLine($"  ElementAt(2): {scores.ElementAt(2)}");

var maybe = scores.ElementAtOrDefault(99);

Console.WriteLine($"  ElementAtOrDefault(99): {(maybe == null ? "null" : maybe)}");

Console.WriteLine("\\n=== 8. SequenceEqual：序列相等（顺序敏感）===");

int[] a = { 1, 2, 3 };

int[] b = { 1, 2, 3 };

int[] c = { 3, 2, 1 };

Console.WriteLine($"  a==b: {a.SequenceEqual(b)}");

Console.WriteLine($"  a==c: {a.SequenceEqual(c)}");

Console.WriteLine("\\n=== 9. IEqualityComparer 自定义比较 ===");

var defaultDistinct = scores.Distinct();

Console.WriteLine($"  默认 Distinct 数量: {defaultDistinct.Count()}");

var subjectDistinct = scores.Distinct(new SubjectComparer());

Console.WriteLine($"  按 Subject Distinct 数量: {subjectDistinct.Count()}");

foreach (var s in subjectDistinct) Console.WriteLine($"    {s}");

Console.WriteLine("\\n=== 10. Chunk 批处理（模拟批量写入）===");

var allIds = Enumerable.Range(1, 25);

var batches = allIds.Chunk(10);

Console.WriteLine($"  共 {allIds.Count()} 条数据，分 {batches.Count()} 批:");

foreach (var batch in batches)
{
    Console.WriteLine($"    批次 [{batch.First()}..{batch.Last()}] 共 {batch.Length} 条");
    // 模拟 db.BulkInsert(batch)
}

Console.WriteLine("\\n=== 11. 综合实战：找出每科最高分 ===");

var bestPerSubject = scores
    .GroupBy(s => s.Subject)                              // 按科目分组
    .Select(g => new { Subject = g.Key, MaxPoints = g.Max(s => s.Points) });

foreach (var bp in bestPerSubject)
    Console.WriteLine($"  {bp.Subject}: {bp.MaxPoints}");

// ============ 类型声明（必须放在所有顶级语句之后） ============

class Score
{
    public string Subject { get; set; } = "";
    public int Points { get; set; }
    public override string ToString() => $"{Subject}={Points}";
}

class SubjectComparer : IEqualityComparer<Score>
{
    // Equals：两个对象是否"相等"（用于 Distinct/Contains）
    public bool Equals(Score? x, Score? y) =>
        string.Equals(x?.Subject, y?.Subject, StringComparison.OrdinalIgnoreCase);
    // GetHashCode：相等的对象必须返回相同的哈希码
    public int GetHashCode(Score obj) =>
        StringComparer.OrdinalIgnoreCase.GetHashCode(obj.Subject);
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第四十四章：LINQ 转换与立即执行
  // ============================================================
  {
    id: 'csharp4-ch44',
    group: '第六部分 LINQ',
    icon: '🔄',
    title: 'LINQ 转换与立即执行',
    content: `## 第四十五章　LINQ 转换与立即执行

前几章学的 Where/Select/OrderBy 都是**延迟执行**——它们只是构建查询，不真正执行。本章讲"转换/收集"类方法，这些方法大多**立即执行**，把延迟查询"固化"成具体集合。掌握这一章，你就能避免 90% 的延迟执行陷阱。

### 一、ToList / ToArray ⭐

最常用的立即执行方法，把 IEnumerable<T> 收集成 List<T> 或 T[]：

\`\`\`csharp
var list = query.ToList();    // 立即执行查询，缓存结果
var arr = query.ToArray();    // 同上，返回数组
\`\`\`

调用 ToList 后，再多次访问 list 都不会重新执行查询。**这是消除延迟执行副作用的标准做法**。

### 二、ToDictionary ⭐

把序列转成字典，需要指定键选择器：

\`\`\`csharp
var dict = products.ToDictionary(p => p.Id);          // 以 Id 为键
var dict2 = products.ToDictionary(p => p.Id, p => p.Name);  // 以 Id 为键，Name 为值
\`\`\`

注意：**键不能重复**，重复会抛 ArgumentException。如果要允许重复键，用 ToLookup。

### 三、ToHashSet ⭐

去重并转成 HashSet<T>：

\`\`\`csharp
var set = nums.ToHashSet();  // 去重 + 转成 HashSet，后续 O(1) 查找
\`\`\`

适合"建立查找集合"场景，比如判断某 id 是否存在。

### 四、ToLookup ⭐

类似 ToDictionary，但**一键多值**：

\`\`\`csharp
var lookup = products.ToLookup(p => p.Category);
// lookup["手机"] 返回所有手机（IEnumerable<Product>）
\`\`\`

Lookup 是不可变的（不能 Add），查找不存在的键返回空序列而非抛异常。

### 五、ToImmutableArray 简介

System.Collections.Immutable 提供 ToImmutableArray / ToImmutableList 等，转成不可变集合。在并发场景或函数式编程里有用，需要额外 NuGet 包 \`System.Collections.Immutable\`。

### 六、AsEnumerable / AsQueryable ⭐

\`\`\`csharp
var asEnum = dbSet.AsEnumerable();      // IQueryable<T> -> IEnumerable<T>，切换到内存执行
var asQuery = list.AsQueryable();        // IEnumerable<T> -> IQueryable<T>，伪装成可查询
\`\`\`

AsEnumerable 是 EF Core 里的"逃生舱"——当你写了 LINQ 但 EF Core 翻译不了（比如调用了自定义 C# 方法），用 AsEnumerable() 切回内存执行。但要小心：**这会把数据全部拉到内存**，可能性能爆炸。

### 七、Cast / OfType（转换元素类型）

\`\`\`csharp
List<object> list = new() { 1, 2, 3 };
var ints = list.Cast<int>();        // 强转每个元素
var onlyStrings = list.OfType<string>();  // 只取 string，跳过其他
\`\`\`

### 八、Chunk（分块）

\`\`\`csharp
var chunks = nums.Chunk(10);  // 每块最多 10 个
\`\`\`

### 九、Append / Prepend ⭐

在序列末尾/开头加一个元素：

\`\`\`csharp
var withExtra = nums.Append(99);     // 末尾加 99
var withStart = nums.Prepend(0);     // 开头加 0
\`\`\`

返回新序列，不改原序列。

### 十、Concat：连接序列

\`\`\`csharp
var combined = a.Concat(b);  // a 后面接 b
\`\`\`

不去重（要 Union 才去重）。

### 十一、Union / Intersect / Except ⭐

集合运算：

\`\`\`csharp
var union = a.Union(b);          // 并集（去重）
var intersect = a.Intersect(b);  // 交集
var except = a.Except(b);        // 差集（a 中有但 b 中没有）
\`\`\`

都支持 IEqualityComparer<T> 重载。

### 十二、Distinct：去重

\`\`\`csharp
var unique = nums.Distinct();
var uniqueByName = items.Distinct(new NameComparer());
\`\`\`

### 十三、SequenceEqual

见上一章。

### 十四、Reverse

反转序列。

### 十五、Range / Repeat / Empty ⭐

生成序列的静态方法（Enumerable.Range / Repeat / Empty）：

\`\`\`csharp
var range = Enumerable.Range(1, 10);      // 1..10
var repeated = Enumerable.Repeat("hi", 3); // ["hi","hi","hi"]
var empty = Enumerable.Empty<int>();       // 空序列，类型已知
\`\`\`

Empty<T>() 经常用作"默认值"或初始累加器，避免 null 检查。

### 十六、延迟执行的陷阱 ⭐⭐⭐

**陷阱 1：捕获循环变量**

\`\`\`csharp
var queries = new List<IEnumerable<int>>();
for (int i = 0; i < 3; i++)
{
    queries.Add(nums.Where(n => n > i));  // ❌ 闭包捕获 i
}
// 遍历时 i 已经是 3，所有 query 都变成 n > 3
\`\`\`

修复：在循环内用局部变量：

\`\`\`csharp
for (int i = 0; i < 3; i++)
{
    int local = i;
    queries.Add(nums.Where(n => n > local));
}
\`\`\`

C# 5+ 对 foreach 已自动修复，但 for 循环仍需注意。

**陷阱 2：多次遍历**

\`\`\`csharp
var query = expensiveQuery();
query.Count();   // 遍历一次
query.Sum();     // 又遍历一次
query.ToList();  // 又遍历一次
// ❌ 性能差，应先 ToList 缓存
\`\`\`

**陷阱 3：源数据被修改**

\`\`\`csharp
var list = new List<int> { 1, 2, 3 };
var query = list.Where(n => n > 1);
list.Add(10);
foreach (var n in query) { }  // 包含 10！查询在遍历时才执行
\`\`\`

### 十七、立即执行方法汇总

| 方法 | 返回类型 | 说明 |
| --- | --- | --- |
| ToList | List<T> | 收集为列表 |
| ToArray | T[] | 收集为数组 |
| ToDictionary | Dictionary<K,V> | 转字典（键唯一）|
| ToHashSet | HashSet<T> | 转集合 |
| ToLookup | ILookup<K,T> | 转一对多查找 |
| Count/Sum/Min/Max/Average | 标量 | 聚合 |
| First/Last/Single | T | 取元素 |
| Any/All/Contains | bool | 判定 |
| SequenceEqual | bool | 比较 |

### 十八、IEnumerable 扩展方法原理

LINQ 的所有方法（Where/Select/...）都是 \`System.Linq.Enumerable\` 静态类里的**扩展方法**。编译器把 \`nums.Where(...)\` 翻译成 \`Enumerable.Where(nums, ...)\`。

这就是为什么 \`using System.Linq;\` 之后，数组/List/Dictionary 等都"突然有了"这些方法——扩展方法的语法糖。

对 IQueryable<T>，对应的是 \`System.Linq.Queryable\` 类，方法签名接收 \`Expression<Func<T,bool>>\`（表达式树）而非 \`Func<T,bool>\`（委托），这样 EF Core 才能把它翻译成 SQL。

本章 demo 演示 ToList/ToDictionary/ToHashSet/ToLookup/AsEnumerable/Cast/Chunk/Append/Prepend/Concat/Union/Intersect/Except/Range/Repeat/Empty，并用代码演示延迟执行陷阱。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「LINQ 转换与立即执行」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 - LINQ 转换与立即执行演示
// 演示：ToList/ToArray/ToDictionary/ToHashSet/ToLookup、AsEnumerable/AsQueryable、
//       Cast/OfType、Chunk、Append/Prepend/Concat、Union/Intersect/Except、
//       Range/Repeat/Empty、延迟执行陷阱

using System;

using System.Collections.Generic;

using System.Linq;

var products = new List<Product>
{
    new() { Id = 1, Name = "iPhone", Price = 7999, Category = "手机" },
    new() { Id = 2, Name = "MacBook", Price = 9499, Category = "电脑" },
    new() { Id = 3, Name = "iPad", Price = 6999, Category = "平板" },
    new() { Id = 4, Name = "Xiaomi", Price = 3999, Category = "手机" },
};

Console.WriteLine("=== 1. ToList / ToArray：立即执行 ===");

var query = products.Where(p => p.Price > 5000);

Console.WriteLine($"  query 类型: {query.GetType().Name} (延迟)");

var list = query.ToList();

Console.WriteLine($"  ToList 类型: {list.GetType().Name}");

var arr = query.ToArray();

Console.WriteLine($"  ToArray 长度: {arr.Length}");

Console.WriteLine("\\n=== 2. ToDictionary：转字典 ===");

var dictById = products.ToDictionary(p => p.Id);

Console.WriteLine($"  dictById[1]: {dictById[1]}");

var nameById = products.ToDictionary(p => p.Id, p => p.Name);

Console.WriteLine($"  nameById[2]: {nameById[2]}");

try
{
    var bad = products.Append(products[0]).ToDictionary(p => p.Id);
}
catch (ArgumentException)
{
    Console.WriteLine("  重复键 ToDictionary 抛 ArgumentException");
}

Console.WriteLine("\\n=== 3. ToHashSet：去重 + 转集合 ===");

int[] nums = { 1, 2, 3, 2, 1, 4, 5, 4 };

var set = nums.ToHashSet();

Console.WriteLine($"  原始: {string.Join(",", nums)}");

Console.WriteLine($"  ToHashSet: {string.Join(",", set)}");

Console.WriteLine($"  set.Contains(3): {set.Contains(3)}");

Console.WriteLine("\\n=== 4. ToLookup：一键多值查找 ===");

var lookup = products.ToLookup(p => p.Category);

Console.WriteLine($"  手机类商品: {string.Join(",", lookup["手机"].Select(p => p.Name))}");

Console.WriteLine($"  电脑类商品: {string.Join(",", lookup["电脑"].Select(p => p.Name))}");

Console.WriteLine($"  不存在的键: {string.Join(",", lookup["不存在"].Select(p => p.Name))}");

var multiKey = new[]
{
    new { Class = "A", Name = "张三" },
    new { Class = "A", Name = "李四" },
    new { Class = "B", Name = "王五" }
}

.ToLookup(x => x.Class);

Console.WriteLine($"  A 班: {string.Join(",", multiKey["A"].Select(x => x.Name))}");

Console.WriteLine("\\n=== 5. AsEnumerable / AsQueryable ===");

var asEnum = products.AsEnumerable();

Console.WriteLine($"  AsEnumerable 类型: {asEnum.GetType().Name}");

var asQuery = products.AsQueryable();

Console.WriteLine($"  AsQueryable 类型: {asQuery.GetType().Name}");

Console.WriteLine("\\n=== 6. Cast / OfType ===");

List<object> mixed = new() { 1, "hi", 2.5, "world", 3 };

var ints = mixed.OfType<int>();

Console.WriteLine($"  OfType<int>: {string.Join(",", ints)}");

var strings = mixed.OfType<string>();

Console.WriteLine($"  OfType<string>: {string.Join(",", strings)}");

var allInts = new List<object> { 1, 2, 3 }

.Cast<int>();

Console.WriteLine($"  Cast<int>: {string.Join(",", allInts)}");

Console.WriteLine("\\n=== 7. Chunk：分块 ===");

var chunks = Enumerable.Range(1, 10).Chunk(3);

Console.WriteLine($"  1..10 按 3 分块:");

foreach (var ck in chunks) Console.WriteLine($"    [{string.Join(",", ck)}]");

Console.WriteLine("\\n=== 8. Append / Prepend：追加/前插 ===");

int[] baseNums = { 2, 3, 4 };

var withEnd = baseNums.Append(5);

var withStart = baseNums.Prepend(1);

var both = baseNums.Prepend(0).Append(5);

Console.WriteLine($"  原始: {string.Join(",", baseNums)}");

Console.WriteLine($"  Append(5): {string.Join(",", withEnd)}");

Console.WriteLine($"  Prepend(1): {string.Join(",", withStart)}");

Console.WriteLine($"  Prepend(0).Append(5): {string.Join(",", both)}");

Console.WriteLine("\\n=== 9. Concat：连接（不去重）===");

int[] a = { 1, 2, 3 };

int[] b = { 3, 4, 5 };

var concat = a.Concat(b);

Console.WriteLine($"  {string.Join(",", a)} + {string.Join(",", b)} = {string.Join(",", concat)}");

Console.WriteLine("\\n=== 10. Union / Intersect / Except：集合运算 ===");

Console.WriteLine($"  Union(并集去重): {string.Join(",", a.Union(b))}");

Console.WriteLine($"  Intersect(交集): {string.Join(",", a.Intersect(b))}");

Console.WriteLine($"  Except(差集): {string.Join(",", a.Except(b))}");

Console.WriteLine("\\n=== 11. Range / Repeat / Empty ===");

var range = Enumerable.Range(1, 5);

Console.WriteLine($"  Range(1,5): {string.Join(",", range)}");

var repeated = Enumerable.Repeat("X", 3);

Console.WriteLine($"  Repeat(\\"X\\",3): {string.Join(",", repeated)}");

var empty = Enumerable.Empty<int>();

Console.WriteLine($"  Empty<int>().Count(): {empty.Count()}");

IEnumerable<int> acc = Enumerable.Empty<int>();

acc = acc.Append(1).Append(2).Append(3);

Console.WriteLine($"  Empty + Append 累加: {string.Join(",", acc)}");

Console.WriteLine("\\n=== 12. Distinct / SequenceEqual / Reverse ===");

int[] dupNums = { 1, 2, 2, 3, 3, 3, 4 };

Console.WriteLine($"  原始: {string.Join(",", dupNums)}");

Console.WriteLine($"  Distinct: {string.Join(",", dupNums.Distinct())}");

int[] x = { 1, 2, 3 };

int[] y = { 1, 2, 3 };

Console.WriteLine($"  x SequenceEqual y: {x.SequenceEqual(y)}");

Console.WriteLine($"  x Reverse: {string.Join(",", x.Reverse())}");

Console.WriteLine("\\n=== 13. 延迟执行陷阱 1：闭包捕获循环变量 ===");

int[] src = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

var queries = new List<IEnumerable<int>>();

for (int i = 0; i < 3; i++)
{
    // ❌ 闭包捕获 i，所有 query 共享一个 i
    // queries.Add(src.Where(n => n > i));
    // ✅ 修复：用局部变量
    int local = i;
    queries.Add(src.Where(n => n > local));
}

for (int i = 0; i < queries.Count; i++)
{
    Console.WriteLine($"  queries[{i}] (n > {i}): {string.Join(",", queries[i])}");
}

Console.WriteLine("\\n=== 14. 延迟执行陷阱 2：源数据被修改 ===");

var mutableList = new List<int> { 1, 2, 3 };

var delayedQuery = mutableList.Where(n => n > 1);

Console.WriteLine($"  查询构建（未执行）");

mutableList.Add(100);

mutableList.Add(200);

Console.WriteLine($"  遍历结果（含新增）: {string.Join(",", delayedQuery)}");

Console.WriteLine("\\n=== 15. 延迟执行陷阱 3：多次遍历 ===");

var expensiveQuery = products.Select(p =>
{
    Console.WriteLine($"  [遍历] {p.Name}");
    return p.Name;
});

Console.WriteLine("第一次 ToList:");

var list1 = expensiveQuery.ToList();

Console.WriteLine("第二次 ToList:");

var list2 = expensiveQuery.ToList();

Console.WriteLine("✅ 修复：先 ToList 缓存，后续访问不再重新执行");

Console.WriteLine("\\n=== 16. IEnumerable 扩展方法原理 ===");

var w = Enumerable.Where(src, n => n > 5);

Console.WriteLine($"  静态调用 Enumerable.Where: {string.Join(",", w)}");

var s = Enumerable.Select(src, n => n * 2);

Console.WriteLine($"  静态调用 Enumerable.Select: {string.Join(",", s)}");

// ============ 类型声明（必须放在所有顶级语句之后） ============

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public string Category { get; set; } = "";
    public override string ToString() => $"[{Id}]{Name} ¥{Price} ({Category})";
}
`,
    lang: 'cs',
  },
];

export { chapters };