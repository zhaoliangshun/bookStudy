// =============================================================
// C# 实战教程 - 第二批章节（第二部分核心语法，共 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   csharp-ch05 : 第五章 方法实用技巧
//   csharp-ch06 : 第六章 集合 List 与 Dictionary
//   csharp-ch07 : 第七章 日期与时间处理
//   csharp-ch08 : 第八章 枚举与结构体
//
// 风格：demo 驱动，每章直接上手写代码，多注释。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第五章：方法实用技巧
  // ============================================================
  {
    id: 'csharp-ch05',
    group: '第二部分 核心语法',
    icon: '🔧',
    title: '方法实用技巧',
    content: `## 第五章　方法实用技巧

把重复的代码抽成方法，是工程化的第一步。这一章讲方法的定义、参数传递、返回值、表达式体方法、本地函数——这些是你写任何 C# 代码都用得到的基础。

### 一、定义方法

\`\`\`csharp
// 方法语法：返回类型 方法名(参数列表) { ... return 值; }
int Add(int a, int b)
{
    int sum = a + b;
    return sum;   // 返回结果
}

// 调用
int result = Add(3, 5);
Console.WriteLine(result);  // 8

// 无返回值用 void
void SayHello(string name)
{
    Console.WriteLine($"你好，{name}！");
}

SayHello("张三");  // 你好，张三！
\`\`\`

### 二、参数传递：值传递与引用传递 ⭐

这是 C# 的一个**重点难点**。默认情况下参数是"值传递"——方法内修改不影响外部。

\`\`\`csharp
// 1. 值传递（默认）：方法内修改不影响外部
void Increment(int x)
{
    x++;  // 修改的是副本
}

int n = 10;
Increment(n);
Console.WriteLine(n);  // 10（没变）

// 2. ref 关键字：引用传递，方法内修改影响外部 ⭐
void IncrementRef(ref int x)
{
    x++;  // 修改原始变量
}

int m = 10;
IncrementRef(ref m);  // 注意调用时也要写 ref
Console.WriteLine(m);  // 11（变了）

// 3. out 关键字：输出参数，用于返回多个值 ⭐
// 调用前不需要初始化，方法内必须赋值
bool TryParseInt(string s, out int result)
{
    if (int.TryParse(s, out result))  // 这里复用系统的 TryParse
    {
        return true;
    }
    result = 0;
    return false;
}

if (TryParseInt("42", out int parsed))
{
    Console.WriteLine($"解析成功：{parsed}");  // 42
}

// 4. in 关键字：只读引用传递（避免复制大结构体，又禁止修改）
void PrintSize(in string s)
{
    Console.WriteLine(s.Length);
    // s = "x";  // 编译错误：in 参数不可修改
}
\`\`\`

> ⭐ \`ref\` 修改原值，\`out\` 返回多个值，\`in\` 只读传递大对象。\`out\` 参数是 C# 模拟"多返回值"的标准方式。

### 三、可选参数与命名参数 ⭐

\`\`\`csharp
// 可选参数：必须放在必选参数后面，必须有默认值
void CreateUser(string name, int age, string role = "user", bool active = true)
{
    Console.WriteLine($"创建用户：{name}, {age}岁, 角色={role}, 启用={active}");
}

CreateUser("张三", 25);                       // 用默认值
CreateUser("李四", 30, "admin");              // 覆盖 role
CreateUser("王五", 28, "admin", false);       // 全部覆盖

// 命名参数：用 参数名:值 的形式，可以打乱顺序
CreateUser(name: "赵六", age: 35, active: false);
CreateUser("钱七", active: false, age: 40);  // 混用：位置参数 + 命名参数
\`\`\`

> ⭐ 命名参数在调用有多个可选参数的方法时特别有用——只覆盖你关心的那一个。

### 四、params：可变参数 ⭐

\`\`\`csharp
// params 让方法接受任意数量的参数（自动包成数组）
int Sum(params int[] numbers)
{
    int total = 0;
    foreach (int n in numbers) total += n;
    return total;
}

Console.WriteLine(Sum(1, 2, 3));         // 6
Console.WriteLine(Sum(10, 20, 30, 40));  // 100
Console.WriteLine(Sum());                // 0（空数组）

// 经典应用：string.Format 就是 params
Console.WriteLine(string.Format("{0} + {1} = {2}", 1, 2, 3));
\`\`\`

### 五、表达式体方法 ⭐

对于简单的方法（单行返回），可以用 \`=>\` 简化：

\`\`\`csharp
// 传统写法
int Square(int x)
{
    return x * x;
}

// 表达式体方法：=> 后跟表达式
int Square2(int x) => x * x;

// void 方法也可以用
void Print(string s) => Console.WriteLine(s);

// 属性也可以
class Person
{
    public string Name { get; set; }
    public string Greeting => $"Hello, {Name}!";  // 只读属性
}
\`\`\`

> ⭐ 简单方法用 \`=>\` 更简洁。逻辑复杂时还是用传统 \`{ }\` 块。

### 六、方法重载

同一个方法名，不同参数列表——让 API 更直观：

\`\`\`csharp
// 重载：方法名相同，参数不同
int Add(int a, int b) => a + b;
double Add(double a, double b) => a + b;
string Add(string a, string b) => a + b;

Console.WriteLine(Add(1, 2));          // 3 (int 版本)
Console.WriteLine(Add(1.5, 2.5));      // 4 (double 版本)
Console.WriteLine(Add("Hello, ", "World"));  // Hello, World (string 版本)
\`\`\`

### 七、本地函数（Local Function）

在方法内部定义的函数——只在当前方法里可用，用于拆分复杂逻辑：

\`\`\`csharp
// 本地函数：定义在方法里，只能在方法里用
string FormatPrice(decimal price)
{
    // 本地函数：把价格转成中文大写
    string ToChinese(decimal n) => n.ToString("C");

    // 本地函数：处理折扣
    decimal ApplyDiscount(decimal original, decimal rate) => original * (1 - rate);

    decimal discounted = ApplyDiscount(price, 0.1m);
    return $"原价 {ToChinese(price)}，折后 {ToChinese(discounted)}";
}

Console.WriteLine(FormatPrice(100m));  // 原价 ¥100.00，折后 ¥90.00
\`\`\`

### 八、元组：返回多个值 ⭐

C# 7+ 的元组让方法可以返回多个值，比 \`out\` 参数更优雅：

\`\`\`csharp
// 返回元组：(类型1, 类型2, ...)
(string Name, int Age) GetUserInfo()
{
    return ("张三", 25);
}

// 调用
var user = GetUserInfo();
Console.WriteLine(user.Name);  // 张三
Console.WriteLine(user.Age);   // 25

// 解构：把元组拆成多个变量
var (name, age) = GetUserInfo();
Console.WriteLine($"{name} - {age}");

// 多返回值的实用场景：尝试解析
(bool Success, int Value) TryParse(string s)
{
    if (int.TryParse(s, out int n)) return (true, n);
    return (false, 0);
}

var (ok, val) = TryParse("42");
if (ok) Console.WriteLine($"解析成功：{val}");
\`\`\`

> ⭐ 元组比 \`out\` 参数更现代：调用链可读、可解构。需要返回 2-3 个值时优先用元组。

### 九、实战 demo：简易计算器

综合运用方法、参数、返回值，写一个支持四则运算的计算器：

\`\`\`csharp
// === 简易计算器 ===
// 演示：方法定义、switch 表达式、元组、可选参数

// 计算方法：根据操作符计算
decimal Calculate(decimal a, decimal b, string op) => op switch
{
    "+" => a + b,
    "-" => a - b,
    "*" => a * b,
    "/" => b == 0 ? throw new DivideByZeroException("除数不能为 0") : a / b,
    _ => throw new ArgumentException($"未知运算符：{op}")
};

// 格式化输出
string FormatResult(decimal a, decimal b, string op, decimal result)
{
    return $"{a} {op} {b} = {result:F2}";
}

// 批量计算（params + 元组返回）
(string Expression, decimal Result)[] BatchCalculate(
    params (decimal a, decimal b, string op)[] tasks)
{
    var results = new (string, decimal)[tasks.Length];
    for (int i = 0; i < tasks.Length; i++)
    {
        var (a, b, op) = tasks[i];
        decimal r = Calculate(a, b, op);
        results[i] = (FormatResult(a, b, op, r), r);
    }
    return results;
}

// 调用：批量计算
var tasks = new[]
{
    (10m, 5m, "+"),
    (10m, 5m, "-"),
    (10m, 5m, "*"),
    (10m, 5m, "/"),
};

var results = BatchCalculate(tasks);
Console.WriteLine("=== 计算器结果 ===");
foreach (var (expr, val) in results)
{
    Console.WriteLine(expr);
}

// 单次计算 + 异常处理
try
{
    decimal r = Calculate(10, 0, "/");
    Console.WriteLine(FormatResult(10, 0, "/", r));
}
catch (Exception ex)
{
    Console.WriteLine($"错误：{ex.Message}");
}
\`\`\`

输出：
\`\`\`
=== 计算器结果 ===
10 + 5 = 15.00
10 - 5 = 5.00
10 * 5 = 50.00
10 / 5 = 2.00
错误：除数不能为 0
\`\`\`

### 十、本章小结

- ⭐ \`ref\` 修改原值、\`out\` 输出多值、\`in\` 只读传递大对象。
- ⭐ 可选参数 + 命名参数让 API 灵活好用。
- ⭐ \`params\` 接受可变参数（如 \`int Sum(params int[] n)\`）。
- ⭐ 简单方法用 \`=>\` 表达式体，简洁。
- ⭐ 元组 \`(string Name, int Age)\` 返回多值，比 \`out\` 更优雅，可解构。
- 方法重载：同名不同参，让 API 直观。

下一章讲集合——日常开发处理数据的核心工具。`,
  },

  // ============================================================
  // 第六章：集合 List 与 Dictionary
  // ============================================================
  {
    id: 'csharp-ch06',
    group: '第二部分 核心语法',
    icon: '📚',
    title: '集合 List 与 Dictionary',
    content: `## 第六章　集合 List 与 Dictionary

数组长度固定，日常开发更常用动态集合。这一章只讲两个**最常用**的集合：\`List<T>\`（列表）和 \`Dictionary<K,V>\`（字典）——它们能解决 80% 的数据存储需求。

### 一、List<T>：动态数组 ⭐

\`\`List<T>\` 内部用数组存储，容量不够时自动扩容。是最常用的集合。

\`\`\`csharp
// 创建
var list = new List<int>();           // 空列表
var list2 = new List<int> { 1, 2, 3 }; // 初始化列表
var list3 = new List<string> { "张三", "李四" };

// 添加元素
list.Add(10);          // 末尾添加
list.Add(20);
list.AddRange(new[] { 30, 40 });  // 批量添加

// 访问元素
Console.WriteLine(list[0]);   // 10（用索引访问，从 0 开始）
Console.WriteLine(list.Count); // 4（元素数量）

// 修改元素
list[0] = 100;
Console.WriteLine(list[0]);   // 100

// 插入与删除
list.Insert(0, 999);   // 在索引 0 处插入
list.Remove(20);        // 删除第一个等于 20 的元素
list.RemoveAt(0);       // 删除指定索引的元素
list.Clear();           // 清空

// 判断包含
var fruits = new List<string> { "苹果", "香蕉", "橙子" };
Console.WriteLine(fruits.Contains("香蕉"));   // true
Console.WriteLine(fruits.Contains("西瓜"));   // false

// 查找索引
Console.WriteLine(fruits.IndexOf("橙子"));   // 2
Console.WriteLine(fruits.IndexOf("西瓜"));   // -1
\`\`\`

### 二、遍历 List ⭐

\`\`\`csharp
var nums = new List<int> { 10, 20, 30, 40, 50 };

// 方式 1：foreach（最常用）
foreach (int n in nums)
{
    Console.Write(n + " ");  // 10 20 30 40 50
}
Console.WriteLine();

// 方式 2：for（需要索引时用）
for (int i = 0; i < nums.Count; i++)
{
    Console.WriteLine($"[{i}] = {nums[i]}");
}

// 方式 3：ForEach 方法（接受 Action）
nums.ForEach(n => Console.WriteLine(n));
\`\`\`

### 三、List 实用技巧 ⭐

\`\`\`csharp
var nums = new List<int> { 5, 3, 8, 1, 9, 2 };

// 排序（原地修改）
nums.Sort();
Console.WriteLine(string.Join(", ", nums));  // 1, 2, 3, 5, 8, 9

// 反转
nums.Reverse();
Console.WriteLine(string.Join(", ", nums));  // 9, 8, 5, 3, 2, 1

// 转数组
int[] arr = nums.ToArray();

// 数组转 List
var list = new List<int>(arr);

// 取范围（类似 Python 的切片）
var sub = nums.GetRange(0, 3);  // 从索引 0 取 3 个
Console.WriteLine(string.Join(", ", sub));  // 9, 8, 5

// 自定义排序（用 Comparison）
var people = new List<(string Name, int Age)>
{
    ("张三", 25),
    ("李四", 30),
    ("王五", 20),
};
people.Sort((a, b) => a.Age.CompareTo(b.Age));  // 按年龄升序
foreach (var p in people)
{
    Console.WriteLine($"{p.Name}: {p.Age}");
}
\`\`\`

### 四、Dictionary<K,V>：键值对 ⭐

字典按键查找，时间复杂度 O(1)——**用来做"查找"最快的数据结构**。

\`\`\`csharp
// 创建
var dict = new Dictionary<string, int>();
var dict2 = new Dictionary<string, int>
{
    { "apple", 5 },
    { "banana", 3 },
};

// C# 6+ 集合初始化器（更简洁）
var dict3 = new Dictionary<string, string>
{
    ["cn"] = "中文",
    ["en"] = "英文",
    ["jp"] = "日文",
};

// 添加与修改
dict["one"] = 1;       // 添加（键不存在）或修改（键存在）
dict["two"] = 2;
dict.Add("three", 3);  // Add 方法：键已存在会抛异常

// 访问
Console.WriteLine(dict["one"]);  // 1（键不存在会抛 KeyNotFoundException）

// 安全访问（推荐）⭐
if (dict.TryGetValue("two", out int val))
{
    Console.WriteLine($"two = {val}");  // two = 2
}

// TryGetValue 失败时 val 是默认值
dict.TryGetValue("notexist", out int notFound);
Console.WriteLine(notFound);  // 0（int 默认值）

// 判断包含键
Console.WriteLine(dict.ContainsKey("one"));   // true
Console.WriteLine(dict.ContainsValue(2));      // true（按值查找，慢）

// 删除
dict.Remove("two");   // 按键删除
\`\`\`

> ⭐ **访问字典前一定要判断键是否存在**：用 \`TryGetValue\` 或 \`ContainsKey\`，直接 \`dict[key]\` 键不存在会抛异常。

### 五、遍历 Dictionary ⭐

\`\`\`csharp
var dict = new Dictionary<string, int>
{
    ["apple"] = 5,
    ["banana"] = 3,
    ["orange"] = 8,
};

// 遍历所有键值对
foreach (var kv in dict)
{
    Console.WriteLine($"{kv.Key}: {kv.Value}");
}

// 只遍历键
foreach (string key in dict.Keys)
{
    Console.WriteLine(key);
}

// 只遍历值
foreach (int value in dict.Values)
{
    Console.WriteLine(value);
}

// 解构遍历（C# 7+）
foreach (var (key, value) in dict)
{
    Console.WriteLine($"{key} = {value}");
}
\`\`\`

### 六、Dictionary 实战场景 ⭐

#### 1. 计数器

\`\`\`csharp
// 统计每个单词出现次数
string text = "the quick brown fox the lazy dog the cat";
string[] words = text.Split(' ');

var count = new Dictionary<string, int>();
foreach (string word in words)
{
    // 经典模式：键存在则 +1，不存在则设为 1
    if (count.TryGetValue(word, out int n))
    {
        count[word] = n + 1;
    }
    else
    {
        count[word] = 1;
    }
}

foreach (var (word, cnt) in count)
{
    Console.WriteLine($"{word}: {cnt}");
}
// the: 3, quick: 1, brown: 1, ...
\`\`\`

#### 2. 缓存查找

\`\`\`csharp
// 模拟缓存：键是 ID，值是数据
var cache = new Dictionary<int, string>
{
    [1] = "用户1的数据",
    [2] = "用户2的数据",
};

int userId = 2;
if (cache.TryGetValue(userId, out string data))
{
    Console.WriteLine($"命中缓存：{data}");
}
else
{
    Console.WriteLine("缓存未命中，需要查询数据库");
}
\`\`\`

#### 3. 分组

\`\`\`csharp
// 按部门分组员工
var employees = new List<(string Name, string Dept)>
{
    ("张三", "技术部"),
    ("李四", "技术部"),
    ("王五", "市场部"),
    ("赵六", "市场部"),
    ("钱七", "技术部"),
};

// 用 Dictionary 分组（第 15 章 LINQ 的 GroupBy 更简洁）
var groups = new Dictionary<string, List<string>>();
foreach (var (name, dept) in employees)
{
    if (!groups.ContainsKey(dept))
    {
        groups[dept] = new List<string>();
    }
    groups[dept].Add(name);
}

foreach (var (dept, members) in groups)
{
    Console.WriteLine($"{dept}：{string.Join(", ", members)}");
}
// 技术部：张三, 李四, 钱七
// 市场部：王五, 赵六
\`\`\`

### 七、其他常用集合简介

\`\`\`csharp
// HashSet<T>：去重利器
var set = new HashSet<int> { 1, 2, 3, 2, 1 };
Console.WriteLine(set.Count);  // 3（自动去重）
set.Add(4);
set.Add(1);   // 添加失败（已存在），返回 false

// Queue<T>：先进先出（FIFO）
var queue = new Queue<string>();
queue.Enqueue("第一个");
queue.Enqueue("第二个");
Console.WriteLine(queue.Dequeue());  // 第一个（出队）

// Stack<T>：后进先出（LIFO）
var stack = new Stack<int>();
stack.Push(1);
stack.Push(2);
Console.WriteLine(stack.Pop());  // 2（后入先出）
\`\`\`

### 八、实战 demo：购物车

综合 List + Dictionary，写一个购物车：

\`\`\`csharp
// === 购物车 ===
// 演示：List 存商品，Dictionary 做商品价格查找

// 商品价格表（Dictionary：键→值，查找快）
var priceTable = new Dictionary<string, decimal>
{
    ["苹果"] = 5.5m,
    ["香蕉"] = 3.0m,
    ["橙子"] = 4.2m,
    ["西瓜"] = 2.8m,
};

// 购物车（List：动态数组，可增删）
var cart = new List<(string Item, int Quantity)>
{
    ("苹果", 2),
    ("香蕉", 5),
    ("橙子", 3),
    ("西瓜", 1),
};

// 计算总价
decimal total = 0;
Console.WriteLine("===== 购物车 =====");
Console.WriteLine($"{"商品",-10}{"数量",6}{"单价",10}{"小计",10}");
Console.WriteLine(new string('-', 36));

foreach (var (item, qty) in cart)
{
    if (priceTable.TryGetValue(item, out decimal price))
    {
        decimal subtotal = price * qty;
        total += subtotal;
        Console.WriteLine($"{item,-10}{qty,6}{price,10:C}{subtotal,10:C}");
    }
}

Console.WriteLine(new string('-', 36));
Console.WriteLine($"{"总计",-16}{total,20:C}");

// 演示 List 操作：再加一个商品
cart.Add(("苹果", 3));
Console.WriteLine($"\\n购物车共 {cart.Count} 件商品");
\`\`\`

输出：
\`\`\`
===== 购物车 =====
商品          数量        单价        小计
------------------------------------
苹果            2     ¥5.50    ¥11.00
香蕉            5     ¥3.00    ¥15.00
橙子            3     ¥4.20    ¥12.60
西瓜            1     ¥2.80     ¥2.80
------------------------------------
总计                              ¥41.40

购物车共 5 件商品
\`\`\`

### 九、本章小结

- ⭐ \`List<T>\` 动态数组：\`Add\` 添加、\`[i]\` 访问、\`Count\` 计数、\`Contains\` 判断、\`ForEach\` 遍历。
- ⭐ \`Dictionary<K,V>\` 键值对：\`[key]\` 读写、\`TryGetValue\` 安全访问、\`ContainsKey\` 判断。
- ⭐ 访问字典前**必须判断键是否存在**，否则抛 \`KeyNotFoundException\`。
- ⭐ 元组列表 \`List<(string, int)>\` 适合存简单的结构化数据。
- \`HashSet<T>\` 去重、\`Queue<T>\` 先进先出、\`Stack<T>\` 后进先出。
- \`Sort / Reverse / ToArray / GetRange\` 是 List 常用操作。

下一章讲日期与时间——日志、定时任务、报表都离不开。`,
  },

  // ============================================================
  // 第七章：日期与时间处理
  // ============================================================
  {
    id: 'csharp-ch07',
    group: '第二部分 核心语法',
    icon: '📅',
    title: '日期与时间处理',
    content: `## 第七章　日期与时间处理

处理时间戳、格式化日期、计算时间差——是日常开发高频操作。这一章讲 \`DateTime\`、\`TimeSpan\`、\`DateTimeOffset\` 三个核心类型，以及格式化与计算技巧。

### 一、DateTime：日期时间 ⭐

\`\`\`csharp
// 获取当前时间
DateTime now = DateTime.Now;         // 本地时间（带时区）
DateTime utc = DateTime.UtcNow;      // UTC 时间（推荐存储）

Console.WriteLine(now);   // 2026-07-18 14:30:25
Console.WriteLine(utc);    // 2026-07-18 06:30:25（UTC）

// 创建指定日期
DateTime birthday = new DateTime(1998, 5, 20);          // 1998-05-20 00:00:00
DateTime meeting = new DateTime(2026, 7, 18, 14, 30, 0); // 带时分秒

// 只取日期部分
DateTime today = DateTime.Today;   // 2026-07-18 00:00:00

// 解析字符串
DateTime parsed = DateTime.Parse("2026-07-18");
DateTime parsed2 = DateTime.ParseExact("2026/07/18", "yyyy/MM/dd", null);

// 安全解析（推荐）⭐
if (DateTime.TryParse("2026-13-01", out DateTime d))
{
    Console.WriteLine(d);
}
else
{
    Console.WriteLine("日期不合法");  // 13 月不合法
}
\`\`\`

> ⭐ **存储时间用 \`DateTime.UtcNow\`（UTC），显示时间用 \`DateTime.Now\`（本地）**。这是避免时区 bug 的关键。

### 二、格式化日期 ⭐

\`\`\`csharp
DateTime now = DateTime.Now;

// 标准格式
Console.WriteLine(now.ToString("d"));    // 2026/7/18（短日期）
Console.WriteLine(now.ToString("D"));    // 2026年7月18日（长日期）
Console.WriteLine(now.ToString("t"));    // 14:30（短时间）
Console.WriteLine(now.ToString("T"));    // 14:30:25（长时间）
Console.WriteLine(now.ToString("f"));    // 2026年7月18日 14:30
Console.WriteLine(now.ToString("F"));    // 2026年7月18日 14:30:25
Console.WriteLine(now.ToString("u"));    // 2026-07-18 14:30:25Z（ISO 8601）

// 自定义格式（最常用）⭐
Console.WriteLine(now.ToString("yyyy-MM-dd"));           // 2026-07-18
Console.WriteLine(now.ToString("yyyy/MM/dd HH:mm:ss"));  // 2026/07/18 14:30:25
Console.WriteLine(now.ToString("yyyy年MM月dd日"));         // 2026年07月18日
Console.WriteLine(now.ToString("HH:mm:ss.fff"));         // 14:30:25.123（毫秒）
Console.WriteLine(now.ToString("yyyyMMddHHmmss"));       // 20260718143025（用作文件名/ID）

// 字符串插值里直接格式化
Console.WriteLine($"当前时间：{now:yyyy-MM-dd HH:mm:ss}");
\`\`\`

> ⭐ 常用格式符：\`yyyy\` 年、\`MM\` 月、\`dd\` 日、\`HH\` 时（24h）、\`mm\` 分、\`ss\` 秒、\`fff\` 毫秒、\`dddd\` 星期。

### 三、DateTime 属性

\`\`\`csharp
DateTime now = DateTime.Now;

Console.WriteLine(now.Year);       // 2026
Console.WriteLine(now.Month);      // 7
Console.WriteLine(now.Day);        // 18
Console.WriteLine(now.Hour);       // 14
Console.WriteLine(now.Minute);     // 30
Console.WriteLine(now.Second);     // 25
Console.WriteLine(now.DayOfWeek);  // Friday（星期几）
Console.WriteLine(now.DayOfYear);  // 199（一年中的第几天）

// 判断
Console.WriteLine(now.Date);         // 2026-07-18 00:00:00（只留日期）
Console.WriteLine(now.TimeOfDay);     // 14:30:25（TimeSpan 类型）
\`\`\`

### 四、日期计算与 TimeSpan ⭐

\`\`DateTime\` 之间相减得到 \`TimeSpan\`（时间间隔）。\`TimeSpan\` 也能独立使用。

\`\`\`csharp
DateTime now = DateTime.Now;
DateTime birthday = new DateTime(1998, 5, 20);

// 日期相减 → TimeSpan
TimeSpan age = now - birthday;
Console.WriteLine($"已经活了 {age.TotalDays:F0} 天");   // 总天数
Console.WriteLine($"已经活了 {age.TotalHours:F0} 小时");

// DateTime 加减（返回新对象，原对象不变）
DateTime tomorrow = now.AddDays(1);
DateTime lastWeek = now.AddDays(-7);
DateTime nextMonth = now.AddMonths(1);
DateTime nextYear = now.AddYears(1);
DateTime inTwoHours = now.AddHours(2);
DateTime in5Min = now.AddMinutes(5);

Console.WriteLine($"明天：{tomorrow:yyyy-MM-dd}");
Console.WriteLine($"上周：{lastWeek:yyyy-MM-dd}");

// === TimeSpan：时间间隔 ===
TimeSpan ts1 = TimeSpan.FromHours(2);       // 2 小时
TimeSpan ts2 = TimeSpan.FromMinutes(90);    // 90 分钟
TimeSpan ts3 = TimeSpan.FromSeconds(3661);  // 3661 秒

Console.WriteLine(ts1);             // 02:00:00
Console.WriteLine(ts2);             // 01:30:00
Console.WriteLine(ts3);             // 01:01:01

// TimeSpan 属性
Console.WriteLine(ts3.TotalHours);    // 1.0169（总小时，带小数）
Console.WriteLine(ts3.Hours);          // 1（小时部分）
Console.WriteLine(ts3.Minutes);        // 1
Console.WriteLine(ts3.Seconds);        // 1
\`\`\`

### 五、日期比较 ⭐

\`\`\`csharp
DateTime d1 = new DateTime(2026, 7, 18);
DateTime d2 = new DateTime(2026, 12, 31);

// 比较运算符
Console.WriteLine(d1 < d2);   // true
Console.WriteLine(d1 > d2);   // false
Console.WriteLine(d1 == d2);  // false

// 比较方法
Console.WriteLine(DateTime.Compare(d1, d2));  // -1（d1 早于 d2）

// 判断是否同一天
DateTime d3 = new DateTime(2026, 7, 18, 23, 59, 0);
Console.WriteLine(d1.Date == d3.Date);  // true（只比日期部分）

// 实战：判断是否过期
DateTime expireDate = DateTime.Now.AddDays(-1);
bool isExpired = DateTime.Now > expireDate;
Console.WriteLine($"已过期：{isExpired}");  // true
\`\`\`

### 六、DateTimeOffset：带时区的时间 ⭐

\`DateTime\` 不带时区信息，跨时区场景容易出错。\`DateTimeOffset\` 包含时区偏移：

\`\`\`csharp
// DateTimeOffset：时间 + 时区偏移
DateTimeOffset nowOffset = DateTimeOffset.Now;
Console.WriteLine(nowOffset);  // 2026-07-18 14:30:25+08:00

DateTimeOffset utcOffset = DateTimeOffset.UtcNow;
Console.WriteLine(utcOffset);  // 2026-07-18 06:30:25+00:00

// 转换时区（比如把 UTC 转成东八区）
DateTimeOffset utcNow = DateTimeOffset.UtcNow;
TimeZoneInfo cnZone = TimeZoneInfo.FindSystemTimeZoneById("China Standard Time");
DateTimeOffset cnTime = utcNow.ToOffset(cnZone.BaseUtcOffset);
Console.WriteLine($"北京时间：{cnTime:yyyy-MM-dd HH:mm:ss}");

// 跨时区计算用 DateTimeOffset 更安全
\`\`\`

> ⭐ **服务器后端开发推荐用 \`DateTimeOffset\`**——它明确记录时区，避免歧义。前端显示时按用户时区转换即可。

### 七、Stopwatch：性能计时 ⭐

测试代码性能、计算耗时，用 \`Stopwatch\`：

\`\`\`csharp
using System.Diagnostics;  // Stopwatch 在这个命名空间

var sw = Stopwatch.StartNew();

// 模拟耗时操作
for (int i = 0; i < 1000000; i++)
{
    _ = i * 2;
}

sw.Stop();
Console.WriteLine($"耗时：{sw.Elapsed.TotalMilliseconds:F2} ms");
Console.WriteLine($"耗时：{sw.ElapsedMilliseconds} ms（整数）");
\`\`\`

### 八、实战 demo：工龄计算器

\`\`\`csharp
using System.Diagnostics;

// === 工龄计算器 ===
// 演示：日期解析、相减、格式化

// 入职日期（模拟从数据库读取的字符串）
string joinDateStr = "2020-03-15";

// 安全解析
if (!DateTime.TryParse(joinDateStr, out DateTime joinDate))
{
    Console.WriteLine("入职日期格式错误");
    return;  // 顶级语句里的 return 会结束程序
}

DateTime now = DateTime.Now;
TimeSpan span = now - joinDate;

// 计算年月日
int years = now.Year - joinDate.Year;
int months = now.Month - joinDate.Month;
if (months < 0)
{
    years--;
    months += 12;
}

// 输出
Console.WriteLine("===== 工龄信息 =====");
Console.WriteLine($"入职日期：{joinDate:yyyy 年 MM 月 dd 日}");
Console.WriteLine($"当前日期：{now:yyyy 年 MM 月 dd 日}");
Console.WriteLine($"工龄：{years} 年 {months} 个月");
Console.WriteLine($"总天数：{span.TotalDays:F0} 天");
Console.WriteLine($"总小时：{span.TotalHours:F0} 小时");

// 判断是否达到年假标准
int annualLeave = years switch
{
    >= 10 => 10,   // 满 10 年 10 天
    >= 5 => 7,     // 满 5 年 7 天
    >= 1 => 5,      // 满 1 年 5 天
    _ => 0           // 不满 1 年无年假
};
Console.WriteLine($"年假：{annualLeave} 天");

// 测试耗时
var sw = Stopwatch.StartNew();
for (int i = 0; i < 1000; i++) _ = i * 2;
sw.Stop();
Console.WriteLine($"\\n计算耗时：{sw.Elapsed.TotalMilliseconds:F3} ms");
\`\`\`

输出：
\`\`\`
===== 工龄信息 =====
入职日期：2020 年 03 月 15 日
当前日期：2026 年 07 月 18 日
工龄：6 年 4 个月
总天数：2311 天
总小时：55464 小时
年假：7 天

计算耗时：0.012 ms
\`\`\`

### 九、本章小结

- ⭐ \`DateTime.Now\` 本地时间（显示），\`DateTime.UtcNow\` UTC 时间（存储）。
- ⭐ 格式化：\`yyyy-MM-dd HH:mm:ss\` 最常用，字符串插值里写 \`{now:格式}\`。
- ⭐ 日期相减得 \`TimeSpan\`，\`DateTime.AddDays/AddMonths/AddYears\` 做加减。
- ⭐ \`DateTime.TryParse\` 安全解析日期字符串。
- ⭐ 跨时区用 \`DateTimeOffset\`，性能计时用 \`Stopwatch\`。
- 常用属性：\`Year/Month/Day/Hour/Minute/Second/DayOfWeek\`。

下一章讲枚举与结构体——组织常量与轻量数据的工具。`,
  },

  // ============================================================
  // 第八章：枚举与结构体
  // ============================================================
  {
    id: 'csharp-ch08',
    group: '第二部分 核心语法',
    icon: '🏷️',
    title: '枚举与结构体',
    content: `## 第八章　枚举与结构体

枚举让代码用名字代替魔法数字，结构体是轻量数据容器。这两个都是组织代码的基础工具。

> **运行提示**：C# 顶级语句要求类型声明（enum/struct/record/class）放在顶级语句**之后**。下面的示例都已按"用法 → 类型声明"的顺序排列，可直接运行。

### 一、枚举：用名字代替数字 ⭐

\`\`\`csharp
// 使用枚举（顶级语句）
OrderStatus status = OrderStatus.Shipped;
Console.WriteLine(status);  // Shipped（输出名字，不是数字）

// 枚举与整数互转
int num = (int)status;       // 2
OrderStatus s = (OrderStatus)2;  // Shipped
Console.WriteLine($"编号：{num}，状态：{s}");

// 类型声明放最后
enum OrderStatus
{
    Pending,      // 0
    Processing,   // 1
    Shipped,      // 2
    Delivered,    // 3
    Cancelled     // 4
}
\`\`\`

### 二、自定义枚举值

\`\`\`csharp
// 使用
HttpStatus code = HttpStatus.NotFound;
Console.WriteLine((int)code);  // 404
Console.WriteLine(code);       // NotFound

// 类型声明
enum HttpStatus
{
    OK = 200,
    NotFound = 404,
    ServerError = 500,
    BadRequest = 400
}
\`\`\`

#### Flags 枚举：可组合的位标志 ⭐

\`\`\`csharp
// 使用：组合权限
Permissions perm = Permissions.Read | Permissions.Write;
Console.WriteLine(perm);            // Read, Write
Console.WriteLine((int)perm);       // 7

// 判断是否包含某权限（用 & 运算）
bool canWrite = (perm & Permissions.Write) == Permissions.Write;
Console.WriteLine($"能写：{canWrite}");  // true

bool canExec = perm.HasFlag(Permissions.Execute);
Console.WriteLine($"能执行：{canExec}");  // false

// 类型声明
[Flags]
enum Permissions
{
    None = 0,
    Read = 1,
    Write = 2,
    Execute = 4,
    All = Read | Write | Execute  // 7
}
\`\`\`

> ⭐ \`[Flags]\` 枚举适合表达"多个选项组合"（如权限、配置开关）。判断包含用 \`HasFlag\` 或 \`&\` 运算。

### 三、枚举实用技巧 ⭐

\`\`\`csharp
// 字符串转枚举
Color c = (Color)Enum.Parse(typeof(Color), "Green");
Console.WriteLine(c);  // Green

// 安全转换
if (Enum.TryParse<Color>("Yellow", out Color parsed))
{
    Console.WriteLine(parsed);
}
else
{
    Console.WriteLine("无效的颜色");  // 输出这个
}

// 判断是否合法枚举值
Console.WriteLine(Enum.IsDefined(typeof(Color), 5));  // false

// 获取所有枚举值
foreach (Color color in Enum.GetValues(typeof(Color)))
{
    Console.WriteLine(color);  // Red, Green, Blue
}

// 类型声明
enum Color { Red, Green, Blue }
\`\`\`

### 四、switch + 枚举：最佳搭档 ⭐

\`\`\`csharp
// 使用
OrderStatus status = OrderStatus.Processing;

// switch 处理枚举（C# 编译器会检查是否覆盖所有情况）
string msg = status switch
{
    OrderStatus.Pending    => "等待支付",
    OrderStatus.Processing => "处理中",
    OrderStatus.Shipped    => "已发货",
    OrderStatus.Delivered  => "已送达",
    OrderStatus.Cancelled  => "已取消",
    _ => throw new ArgumentOutOfRangeException(nameof(status)),
};
Console.WriteLine(msg);  // 处理中

// 类型声明
enum OrderStatus { Pending, Processing, Shipped, Delivered, Cancelled }
\`\`\`

> ⭐ 枚举 + switch 表达式是 C# 处理状态的**标准范式**——编译器会警告未覆盖的情况，避免遗漏。

### 五、struct：结构体

结构体是"值类型"的轻量数据容器——赋值时复制整个对象，不像 class 是引用。

\`\`\`csharp
// 使用
Point p1 = new Point(3, 4);
Point p2 = new Point(0, 0);
Console.WriteLine(p1);  // (3, 4)
Console.WriteLine($"距离：{p1.DistanceTo(p2):F2}");  // 5.00

// 类型声明
struct Point
{
    public int X;
    public int Y;

    // 构造函数
    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }

    // 方法
    public double DistanceTo(Point other)
    {
        int dx = X - other.X;
        int dy = Y - other.Y;
        return Math.Sqrt(dx * dx + dy * dy);
    }

    public override string ToString() => $"({X}, {Y})";
}
\`\`\`

### 六、struct vs class：什么时候用哪个 ⭐

| 维度 | struct（结构体） | class（类） |
| --- | --- | --- |
| 类型 | 值类型 | 引用类型 |
| 赋值 | 复制整个对象 | 复制引用 |
| 存储 | 通常在栈上 | 在堆上 |
| 继承 | 不能继承 | 支持继承 |
| 适用 | 小的、不可变的数据 | 复杂对象、需要继承 |

\`\`\`csharp
// struct 是值类型：赋值会复制
Point a = new Point { X = 1, Y = 2 };
Point b = a;   // 复制了一份
b.X = 100;
Console.WriteLine(a.X);  // 1（a 不受影响）

// class 是引用类型：赋值只复制引用
Person p1 = new Person { Name = "张三" };
Person p2 = p1;   // p2 和 p1 指向同一对象
p2.Name = "李四";
Console.WriteLine(p1.Name);  // 李四（p1 也变了）

// 类型声明
struct Point { public int X, Y; }
class Person { public string Name; }
\`\`\`

> ⭐ **经验法则**：小数据（< 16 字节）、不可变、不需要继承——用 \`struct\`；其他都用 \`class\`。日常开发 95% 用 \`class\`。

### 七、record：不可变数据类型（C# 9+）⭐

\`record\` 是 C# 9 引入的特殊类，专门用于"不可变数据"——写起来极简，自动生成相等比较、\`ToString\`、解构：

\`\`\`csharp
// 使用（不可变：创建后不能修改）
var p = new Person("张三", 25);
Console.WriteLine(p);  // Person { Name = 张三, Age = 25 }（自动生成 ToString）

// p.Age = 26;  // 编译错误：record 的属性是只读的

// with 表达式：基于原对象创建副本并修改某些字段 ⭐
var older = p with { Age = 26 };
Console.WriteLine(older);  // Person { Name = 张三, Age = 26 }
Console.WriteLine(p);      // Person { Name = 张三, Age = 25 }（原对象不变）

// 相等比较（基于值，不是引用）
var p2 = new Person("张三", 25);
Console.WriteLine(p == p2);  // true（值相等）

// 解构
var (name, age) = p;
Console.WriteLine($"{name}, {age}");  // 张三, 25

// 类型声明
record Person(string Name, int Age);
\`\`\`

> ⭐ \`record\` 适合做 DTO（数据传输对象）、配置、事件参数等"只读数据"。**比 class 写起来简洁得多**，且天然支持值比较。

### 八、实战 demo：订单状态机

\`\`\`csharp
// === 订单状态机 ===
// 演示：枚举 + switch + record
// 注意：顶级语句必须先于类型声明（enum/record 放最后）

// 订单状态枚举（类型声明放在文件末尾，见 ↓）
// record Order 也在末尾

// 状态转换函数（本地函数，可以放在顶级语句之前或之后）
Order Transition(Order order, OrderState newState)
{
    // 用 switch 检查转换是否合法
    bool valid = (order.State, newState) switch
    {
        (OrderState.Created, OrderState.Paid) => true,
        (OrderState.Paid, OrderState.Shipped) => true,
        (OrderState.Shipped, OrderState.Delivered) => true,
        (OrderState.Created, OrderState.Cancelled) => true,
        (OrderState.Paid, OrderState.Cancelled) => true,
        _ => false
    };

    if (!valid)
    {
        Console.WriteLine($"❌ 非法转换：{order.State} → {newState}");
        return order;  // 返回原订单
    }

    Console.WriteLine($"✅ {order.State} → {newState}");
    return order with { State = newState };  // with 创建新副本
}

// 模拟订单流程（顶级语句从这里开始执行）
var order = new Order("ORD-001", 199.50m, OrderState.Created);
Console.WriteLine(order);

order = Transition(order, OrderState.Paid);
order = Transition(order, OrderState.Shipped);
order = Transition(order, OrderState.Delivered);
order = Transition(order, OrderState.Cancelled);  // 非法：已送达不能取消

Console.WriteLine($"\\n最终状态：{order.State}");

// === 类型声明必须放在顶级语句之后 ===
enum OrderState
{
    Created,      // 已创建
    Paid,         // 已支付
    Shipped,      // 已发货
    Delivered,    // 已送达
    Cancelled     // 已取消
}

record Order(string Id, decimal Amount, OrderState State);
\`\`\`

输出：
\`\`\`
Order { Id = ORD-001, Amount = 199.50, State = Created }
✅ Created → Paid
✅ Paid → Shipped
✅ Shipped → Delivered
❌ 非法转换：Delivered → Cancelled
最终状态：Delivered
\`\`\`

### 九、本章小结

- ⭐ 枚举用名字代替数字：\`enum Status { Active, Inactive }\`，输出显示名字更直观。
- ⭐ \`[Flags]\` 枚举可组合：\`Read | Write\`，判断包含用 \`HasFlag\` 或 \`&\`。
- ⭐ 枚举 + switch 表达式是处理状态的**标准范式**。
- ⭐ \`Enum.TryParse\` 安全转换字符串到枚举。
- ⭐ struct 值类型（赋值复制），class 引用类型（赋值复制引用）。
- ⭐ \`record\` 不可变数据 + \`with\` 表达式修改副本——DTO/配置首选。

下一章进入第三部分，讲类与对象——面向对象编程的基石。`,
  },
];

export { chapters };
