// =============================================================
// C# 交互式教程 - 第二批章节（第二部分 语法进阶，共 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   csharp-ch05 : 第五章 控制流——条件与循环
//   csharp-ch06 : 第六章 方法——函数式基础
//   csharp-ch07 : 第七章 数组与字符串
//   csharp-ch08 : 第八章 枚举与结构体
// =============================================================

const chapters = [
  // ============================================================
  // 第五章：控制流
  // ============================================================
  {
    id: 'csharp-ch05',
    group: '第二部分 语法进阶',
    icon: '🔀',
    title: '控制流——条件与循环',
    content: `## 第五章　控制流——条件与循环

控制流决定代码"按什么顺序执行"。这一章讲条件分支（if、switch）、循环（for、while、foreach）、跳转（break、continue、return）。

### 一、if-else 条件

#### 1. 基本语法

\`\`\`csharp
int age = 18;

if (age >= 18)
{
    Console.WriteLine("成年");
}
else if (age >= 13)
{
    Console.WriteLine("青少年");
}
else
{
    Console.WriteLine("儿童");
}
\`\`\`

#### 2. 三元运算符 ?:

\`\`\`csharp
int age = 20;
string status = age >= 18 ? "成年" : "未成年";
Console.WriteLine(status);  // 成年
\`\`\`

#### 3. 模式匹配（C# 7+）

C# 7 引入强大的模式匹配：

\`\`\`csharp
object obj = "hello";

if (obj is string s)
{
    Console.WriteLine($"字符串：{s}");
}
else if (obj is int n)
{
    Console.WriteLine($"整数：{n}");
}
\`\`\`

### 二、switch 语句

#### 1. 传统 switch

\`\`\`csharp
int day = 3;
switch (day)
{
    case 1:
        Console.WriteLine("周一");
        break;
    case 2:
        Console.WriteLine("周二");
        break;
    case 3:
        Console.WriteLine("周三");
        break;
    case 4:
    case 5:
        Console.WriteLine("周四周五");  // 多个 case 共享
        break;
    default:
        Console.WriteLine("周末");
        break;
}
\`\`\`

**注意**：C# 的 switch 必须有 \`break\` 或 \`return\`，不能像 C/C++ 那样"贯穿"（除非 case 为空）。

#### 2. switch 表达式（C# 8+）

更现代的写法：

\`\`\`csharp
int day = 3;
string name = day switch
{
    1 => "周一",
    2 => "周二",
    3 => "周三",
    4 => "周四",
    5 => "周五",
    _ => "周末"  // _ 是弃元，表示其他
};
Console.WriteLine(name);  // 周三
\`\`\`

#### 3. 模式匹配 switch（C# 8+）

\`\`\`csharp
object obj = 42;
string desc = obj switch
{
    int n when n > 0 => "正整数",
    int n when n < 0 => "负整数",
    int => "零",
    string s => $"字符串：{s}",
    null => "null",
    _ => "其他类型"
};
\`\`\`

### 三、for 循环

#### 1. 基本 for

\`\`\`csharp
for (int i = 0; i < 5; i++)
{
    Console.WriteLine($"i = {i}");
}
\`\`\`

输出：
\`\`\`
i = 0
i = 1
i = 2
i = 3
i = 4
\`\`\`

#### 2. 倒序

\`\`\`csharp
for (int i = 5; i > 0; i--)
{
    Console.WriteLine(i);
}
\`\`\`

#### 3. 步长

\`\`\`csharp
for (int i = 0; i < 20; i += 3)
{
    Console.WriteLine(i);  // 0, 3, 6, 9, ..., 18
}
\`\`\`

### 四、while 与 do-while

#### 1. while

\`\`\`csharp
int n = 0;
while (n < 5)
{
    Console.WriteLine(n);
    n++;
}
\`\`\`

**注意**：先判断条件，可能一次都不执行。

#### 2. do-while

\`\`\`csharp
int n = 0;
do
{
    Console.WriteLine(n);
    n++;
} while (n < 5);
\`\`\`

**注意**：先执行一次，再判断条件，至少执行一次。

### 五、foreach 循环

遍历集合最常用：

\`\`\`csharp
string[] names = { "张三", "李四", "王五" };
foreach (string name in names)
{
    Console.WriteLine(name);
}

// 遍历数字集合
int[] numbers = { 1, 2, 3, 4, 5 };
foreach (int n in numbers)
{
    Console.WriteLine(n * n);  // 1, 4, 9, 16, 25
}
\`\`\`

**注意**：foreach 是只读的，不能修改集合元素。

### 六、跳转语句

#### 1. break

跳出当前循环：

\`\`\`csharp
for (int i = 0; i < 10; i++)
{
    if (i == 5) break;  // i = 5 时跳出
    Console.WriteLine(i);  // 0-4
}
\`\`\`

#### 2. continue

跳过本次循环，进入下一次：

\`\`\`csharp
for (int i = 0; i < 10; i++)
{
    if (i % 2 == 0) continue;  // 跳过偶数
    Console.WriteLine(i);  // 1, 3, 5, 7, 9
}
\`\`\`

#### 3. return

退出方法：

\`\`\`csharp
int FindFirst(int[] arr, int target)
{
    for (int i = 0; i < arr.Length; i++)
    {
        if (arr[i] == target) return i;
    }
    return -1;  // 没找到
}
\`\`\`

#### 4. goto（不推荐）

C# 支持 goto 但不推荐使用，破坏代码可读性。

### 七、循环综合示例

下面示例演示各种循环：

\`\`\`csharp
using System;

// 1. for 循环：打印九九乘法表
Console.WriteLine("=== 九九乘法表 ===");
for (int i = 1; i <= 9; i++)
{
    for (int j = 1; j <= i; j++)
    {
        Console.Write($"{j}×{i}={i * j}\\t");
    }
    Console.WriteLine();
}

// 2. while 循环：计算 1+2+...+100
Console.WriteLine("\\n=== 1 到 100 求和 ===");
int sum = 0;
int n = 1;
while (n <= 100)
{
    sum += n;
    n++;
}
Console.WriteLine($"1+2+...+100 = {sum}");  // 5050

// 3. foreach：遍历数组
Console.WriteLine("\\n=== foreach 遍历 ===");
string[] fruits = { "苹果", "香蕉", "橙子" };
foreach (string fruit in fruits)
{
    Console.WriteLine($"水果：{fruit}");
}

// 4. switch 表达式：根据分数评级
Console.WriteLine("\\n=== 分数评级 ===");
int score = 85;
string grade = score switch
{
    >= 90 => "优秀",
    >= 80 => "良好",
    >= 70 => "中等",
    >= 60 => "及格",
    _ => "不及格"
};
Console.WriteLine($"分数 {score}：{grade}");

// 5. continue 跳过偶数
Console.WriteLine("\\n=== 1-10 中的奇数 ===");
for (int i = 1; i <= 10; i++)
{
    if (i % 2 == 0) continue;
    Console.Write($"{i} ");
}
Console.WriteLine();
\`\`\`

运行输出：
\`\`\`
=== 九九乘法表 ===
1×1=1
1×2=2	2×2=4
...

=== 1 到 100 求和 ===
1+2+...+100 = 5050

=== foreach 遍历 ===
水果：苹果
水果：香蕉
水果：橙子

=== 分数评级 ===
分数 85：良好

=== 1-10 中的奇数 ===
1 3 5 7 9
\`\`\`

### 八、本章小结

- 条件分支：\`if-else if-else\` 和 \`switch\`。
- 三元运算符 \`?:\` 适合简单二选一。
- 模式匹配：\`is\` 检查 + 转换，\`switch\` 表达式更现代。
- 循环：\`for\`（确定次数）、\`while\`（条件循环）、\`do-while\`（至少一次）、\`foreach\`（遍历集合）。
- 跳转：\`break\`（跳出）、\`continue\`（跳过）、\`return\`（退出方法）。
- switch 表达式（C# 8+）是现代写法，比传统 switch 简洁。

下一章讲方法——把代码"打包"成可复用的单元。`,
  },

  // ============================================================
  // 第六章：方法
  // ============================================================
  {
    id: 'csharp-ch06',
    group: '第二部分 语法进阶',
    icon: '🔧',
    title: '方法——函数式基础',
    content: `## 第六章　方法——函数式基础

方法是"打包好的代码块"，可以被反复调用。这一章讲方法的定义、参数、返回值、重载、Lambda 表达式。

### 一、方法定义

#### 1. 基本语法

\`\`\`csharp
[访问修饰符] [static] 返回类型 方法名(参数列表)
{
    方法体
    return 返回值;
}
\`\`\`

示例：

\`\`\`csharp
public static int Add(int a, int b)
{
    return a + b;
}

// 调用
int sum = Add(3, 5);
Console.WriteLine(sum);  // 8
\`\`\`

#### 2. void 方法（无返回值）

\`\`\`csharp
public static void Greet(string name)
{
    Console.WriteLine($"Hello, {name}!");
}

Greet("张三");  // Hello, 张三!
\`\`\`

#### 3. 表达式体方法（C# 6+）

单行方法可以用 \`=>\` 简写：

\`\`\`csharp
public static int Add(int a, int b) => a + b;
public static void Greet(string name) => Console.WriteLine($"Hello, {name}!");
\`\`\`

### 二、参数

#### 1. 值参数（默认）

参数被复制到方法内：

\`\`\`csharp
void Increment(int x)
{
    x++;  // 不影响外部
}

int n = 5;
Increment(n);
Console.WriteLine(n);  // 5
\`\`\`

#### 2. 引用参数 ref

参数按引用传递，方法内修改影响外部：

\`\`\`csharp
void Increment(ref int x)
{
    x++;
}

int n = 5;
Increment(ref n);  // 必须加 ref
Console.WriteLine(n);  // 6
\`\`\`

#### 3. 输出参数 out

类似 ref，但调用前无需初始化，方法内必须赋值：

\`\`\`csharp
bool TryParse(string s, out int result)
{
    if (int.TryParse(s, out result))
        return true;
    result = 0;
    return false;
}

// 调用
if (TryParse("123", out int n))
{
    Console.WriteLine(n);  // 123
}
\`\`\`

#### 4. in 参数（C# 7+）

按引用传递但只读，避免复制大结构体：

\`\`\`csharp
void Process(in BigStruct data)
{
    // data 只读，不能修改
}
\`\`\`

#### 5. 参数数组 params

允许不定数量参数：

\`\`\`csharp
int Sum(params int[] numbers)
{
    int sum = 0;
    foreach (int n in numbers) sum += n;
    return sum;
}

Console.WriteLine(Sum(1, 2, 3));       // 6
Console.WriteLine(Sum(1, 2, 3, 4, 5));  // 15
\`\`\`

#### 6. 默认参数

\`\`\`csharp
void Greet(string name, string greeting = "Hello")
{
    Console.WriteLine($"{greeting}, {name}!");
}

Greet("张三");                  // Hello, 张三!
Greet("李四", "Hi");            // Hi, 李四!
Greet("王五", greeting: "你好");  // 命名参数
\`\`\`

#### 7. 命名参数

\`\`\`csharp
void PrintInfo(string name, int age, string city)
{
    Console.WriteLine($"{name}, {age}岁, {city}");
}

PrintInfo(name: "张三", age: 25, city: "北京");
PrintInfo(city: "上海", name: "李四", age: 30);  // 顺序可变
\`\`\`

### 三、方法重载

同名方法，参数不同（数量、类型、顺序）：

\`\`\`csharp
int Add(int a, int b) => a + b;
double Add(double a, double b) => a + b;
string Add(string a, string b) => a + b;

Console.WriteLine(Add(1, 2));        // 3 (int)
Console.WriteLine(Add(1.5, 2.5));    // 4 (double)
Console.WriteLine(Add("Hello", " World"));  // Hello World
\`\`\`

**注意**：返回类型不同不算重载，参数必须不同。

### 四、局部函数（C# 7+）

在方法内定义函数：

\`\`\`csharp
int Factorial(int n)
{
    int Helper(int k)
    {
        return k <= 1 ? 1 : k * Helper(k - 1);
    }
    return Helper(n);
}

Console.WriteLine(Factorial(5));  // 120
\`\`\`

### 五、Lambda 表达式（C# 3+）

匿名函数的简洁写法：

\`\`\`csharp
// Func<T, TResult> 委托
Func<int, int, int> add = (a, b) => a + b;
Console.WriteLine(add(3, 5));  // 8

// 单参数可省略括号
Func<int, int> square = x => x * x;
Console.WriteLine(square(5));  // 25

// 无参数
Func<string> getMessage = () => "Hello";
Console.WriteLine(getMessage());

// Action 无返回值
Action<string> print = s => Console.WriteLine(s);
print("World");
\`\`\`

Lambda 在 LINQ 中大量使用，后续章节详细讲。

### 六、ref 返回（C# 7+）

方法可以返回引用：

\`\`\`csharp
ref int Find(int[] arr, int target)
{
    for (int i = 0; i < arr.Length; i++)
    {
        if (arr[i] == target)
            return ref arr[i];  // 返回引用
    }
    throw new Exception("Not found");
}

int[] nums = { 1, 2, 3, 4, 5 };
ref int item = ref Find(nums, 3);
item = 99;  // 直接修改数组中的元素
Console.WriteLine(nums[2]);  // 99
\`\`\`

### 七、元组与多返回值（C# 7+）

C# 7+ 支持元组，方法可返回多个值：

\`\`\`csharp
(string Name, int Age) GetPerson()
{
    return ("张三", 25);
}

var p = GetPerson();
Console.WriteLine(p.Name);  // 张三
Console.WriteLine(p.Age);   // 25

// 解构
var (name, age) = GetPerson();
\`\`\`

### 八、方法综合示例

\`\`\`csharp
using System;

// 1. 基本方法
int Add(int a, int b) => a + b;

// 2. 默认参数 + 命名参数
void Greet(string name, string greeting = "Hello") =>
    Console.WriteLine($"{greeting}, {name}!");

// 3. params 参数数组
int Sum(params int[] numbers)
{
    int sum = 0;
    foreach (int n in numbers) sum += n;
    return sum;
}

// 4. out 参数
bool TryDivide(int a, int b, out int result)
{
    if (b == 0)
    {
        result = 0;
        return false;
    }
    result = a / b;
    return true;
}

// 5. 元组返回
(string, int) GetPerson() => ("张三", 25);

// 6. 方法重载
string Format(int n) => $"整数：{n}";
string Format(double d) => $"浮点：{d:F2}";

// 测试
Console.WriteLine($"Add(3, 5) = {Add(3, 5)}");

Greet("张三");
Greet("李四", "Hi");
Greet("王五", greeting: "你好");

Console.WriteLine($"Sum(1,2,3,4,5) = {Sum(1, 2, 3, 4, 5)}");

if (TryDivide(10, 3, out int quotient))
    Console.WriteLine($"10 / 3 = {quotient}");

var (name, age) = GetPerson();
Console.WriteLine($"姓名：{name}, 年龄：{age}");

Console.WriteLine(Format(42));
Console.WriteLine(Format(3.14159));
\`\`\`

输出：
\`\`\`
Add(3, 5) = 8
Hello, 张三!
Hi, 李四!
你好, 王五!
Sum(1,2,3,4,5) = 15
10 / 3 = 3
姓名：张三, 年龄：25
整数：42
浮点：3.14
\`\`\`

### 九、本章小结

- 方法定义：\`[修饰符] 返回类型 方法名(参数) { ... }\`。
- void 方法无返回值，表达式体方法用 \`=>\` 简写。
- 参数类型：值（默认）、\`ref\`（引用）、\`out\`（输出）、\`in\`（只读引用）、\`params\`（不定参数）、默认参数。
- 命名参数让调用更清晰：\`Method(name: "张三")\`。
- 方法重载：同名不同参数（数量、类型）。
- 局部函数：方法内定义函数。
- Lambda：\`(a, b) => a + b\`，配合 \`Func\`/\`Action\` 委托。
- 元组返回多值：\`(string, int) GetPerson() => ("张三", 25);\`。
- C# 7+ 支持 \`ref\` 返回、\`out\` 参数声明在调用处。

下一章讲数组与字符串——最常用的数据容器和文本处理。`,
  },

  // ============================================================
  // 第七章：数组与字符串
  // ============================================================
  {
    id: 'csharp-ch07',
    group: '第二部分 语法进阶',
    icon: '📚',
    title: '数组与字符串',
    content: `## 第七章　数组与字符串

数组和字符串是编程中最常用的数据容器。这一章讲数组的声明、访问、遍历，字符串的常用操作。

### 一、数组（Array）

#### 1. 声明与初始化

\`\`\`csharp
// 1. 声明并指定大小
int[] nums = new int[5];  // {0, 0, 0, 0, 0}

// 2. 声明并初始化
int[] nums2 = new int[] { 1, 2, 3, 4, 5 };

// 3. 简写
int[] nums3 = { 1, 2, 3, 4, 5 };

// 4. var 推断
var nums4 = new[] { 1, 2, 3 };  // int[]
\`\`\`

#### 2. 访问与修改

\`\`\`csharp
int[] nums = { 10, 20, 30, 40, 50 };
Console.WriteLine(nums[0]);  // 10
nums[0] = 99;
Console.WriteLine(nums[0]);  // 99
Console.WriteLine(nums.Length);  // 5
\`\`\`

#### 3. 遍历

\`\`\`csharp
int[] nums = { 1, 2, 3, 4, 5 };

// for
for (int i = 0; i < nums.Length; i++)
{
    Console.WriteLine(nums[i]);
}

// foreach
foreach (int n in nums)
{
    Console.WriteLine(n);
}
\`\`\`

#### 4. 多维数组

\`\`\`csharp
// 二维数组
int[,] matrix = new int[3, 3];
matrix[0, 0] = 1;
matrix[1, 1] = 2;

// 初始化
int[,] matrix2 = {
    { 1, 2, 3 },
    { 4, 5, 6 },
    { 7, 8, 9 }
};

// 访问
Console.WriteLine(matrix2[1, 2]);  // 6
\`\`\`

#### 5. 数组常用方法

\`\`\`csharp
int[] nums = { 5, 3, 8, 1, 9, 2 };

Array.Sort(nums);  // 排序：{1, 2, 3, 5, 8, 9}
Array.Reverse(nums);  // 反转
Array.Clear(nums, 0, 2);  // 前 2 个清零
int index = Array.IndexOf(nums, 8);  // 查找
int[] copy = new int[6];
Array.Copy(nums, copy, nums.Length);  // 复制
\`\`\`

#### 6. 数组的局限

- 大小固定，不能动态扩容。
- 插入删除效率低（O(n)）。

需要动态集合，用 \`List<T>\`、\`Dictionary<K,V>\`（后续章节讲）。

### 二、字符串（string）

#### 1. 基本操作

\`\`\`csharp
string s = "Hello, World!";

Console.WriteLine(s.Length);          // 13 长度
Console.WriteLine(s[0]);             // H 索引访问
Console.WriteLine(s.ToUpper());       // HELLO, WORLD!
Console.WriteLine(s.ToLower());        // hello, world!
Console.WriteLine(s.Trim());          // 去首尾空格
Console.WriteLine(s.Substring(0, 5)); // Hello 子串
Console.WriteLine(s.IndexOf("World")); // 7 查找
Console.WriteLine(s.Replace("World", "C#"));  // Hello, C#!
Console.WriteLine(s.Contains("Hello"));  // True
Console.WriteLine(s.StartsWith("Hello")); // True
Console.WriteLine(s.EndsWith("!"));       // True
\`\`\`

#### 2. 字符串拼接

\`\`\`csharp
string a = "Hello";
string b = "World";

// + 拼接
string c = a + ", " + b + "!";

// 字符串插值（推荐）
string d = $"{a}, {b}!";

// string.Concat
string e = string.Concat(a, ", ", b, "!");

// string.Join
string[] words = { "Hello", "World" };
string f = string.Join(", ", words);  // "Hello, World"
\`\`\`

#### 3. 字符串比较

\`\`\`csharp
string s1 = "Hello";
string s2 = "hello";

Console.WriteLine(s1 == s2);  // False（区分大小写）
Console.WriteLine(s1.Equals(s2, StringComparison.OrdinalIgnoreCase));  // True
Console.WriteLine(string.Compare(s1, s2, StringComparison.OrdinalIgnoreCase) == 0);  // True
\`\`\`

#### 4. 字符串分割与连接

\`\`\`csharp
// 分割
string csv = "张三,李四,王五";
string[] names = csv.Split(',');
foreach (string name in names)
    Console.WriteLine(name);

// 连接
string[] parts = { "2024", "01", "15" };
string date = string.Join("-", parts);  // "2024-01-15"
\`\`\`

#### 5. 字符串格式化

\`\`\`csharp
// 字符串插值（推荐）
int x = 42;
string s1 = $"值是 {x}";

// 复合格式化
string s2 = string.Format("值是 {0}", x);

// 格式化数字
decimal price = 99.99m;
Console.WriteLine($"{price:C}");   // ¥99.99（货币）
Console.WriteLine($"{price:F2}");  // 99.99（两位小数）
Console.WriteLine($"{0.1234:P}");  // 12.34%（百分比）

// 日期格式化
DateTime now = DateTime.Now;
Console.WriteLine($"{now:yyyy-MM-dd}");  // 2024-01-15
Console.WriteLine($"{now:HH:mm:ss}");    // 14:30:00
\`\`\`

#### 6. StringBuilder

频繁拼接字符串时，用 \`StringBuilder\` 性能更好：

\`\`\`csharp
using System.Text;

var sb = new StringBuilder();
for (int i = 0; i < 1000; i++)
{
    sb.Append($"行 {i}\\n");
}
string result = sb.ToString();
\`\`\`

> **何时用 StringBuilder**：循环中拼接大量字符串。
> **何时用普通 string**：少量拼接、字符串插值。

#### 7. 字符串的不可变性

string 是不可变的——每次"修改"都创建新对象：

\`\`\`csharp
string s = "Hello";
s += " World";  // 创建新对象，原对象等待 GC
\`\`\`

这就是循环拼接慢的原因——产生大量临时字符串。

### 三、字符串数组综合示例

\`\`\`csharp
using System;
using System.Text;

// 1. 数组操作
Console.WriteLine("=== 数组操作 ===");
int[] nums = { 5, 3, 8, 1, 9, 2, 7, 4, 6 };
Console.WriteLine($"原数组：{string.Join(", ", nums)}");

Array.Sort(nums);
Console.WriteLine($"排序后：{string.Join(", ", nums)}");

Console.WriteLine($"最大值：{nums[^1]}");  // C# 8+ 倒数索引
Console.WriteLine($"最小值：{nums[0]}");
Console.WriteLine($"总和：{nums.Sum()}");  // LINQ，后续章节讲

// 2. 字符串操作
Console.WriteLine("\\n=== 字符串操作 ===");
string text = "Hello, World!";

Console.WriteLine($"原文：{text}");
Console.WriteLine($"长度：{text.Length}");
Console.WriteLine($"大写：{text.ToUpper()}");
Console.WriteLine($"小写：{text.ToLower()}");
Console.WriteLine($"反转：{new string(text.Reverse().ToArray())}");
Console.WriteLine($"包含 'World'：{text.Contains("World")}");
Console.WriteLine($"替换：{text.Replace("World", "C#")}");

// 3. 字符串分割
Console.WriteLine("\\n=== 字符串分割 ===");
string csv = "张三,李四,王五,赵六";
string[] names = csv.Split(',');
for (int i = 0; i < names.Length; i++)
{
    Console.WriteLine($"  {i + 1}. {names[i]}");
}

// 4. StringBuilder
Console.WriteLine("\\n=== StringBuilder ===");
var sb = new StringBuilder();
sb.AppendLine("第一行");
sb.AppendLine("第二行");
sb.Append("第三行");
Console.WriteLine(sb.ToString());

// 5. 字符串插值格式化
Console.WriteLine("\\n=== 格式化 ===");
decimal price = 1234.56m;
DateTime now = DateTime.Now;
Console.WriteLine($"价格：{price:C}");
Console.WriteLine($"百分比：{0.1234:P}");
Console.WriteLine($"当前时间：{now:yyyy-MM-dd HH:mm:ss}");
\`\`\`

输出：
\`\`\`
=== 数组操作 ===
原数组：5, 3, 8, 1, 9, 2, 7, 4, 6
排序后：1, 2, 3, 4, 5, 6, 7, 8, 9
最大值：9
最小值：1
总和：45

=== 字符串操作 ===
原文：Hello, World!
长度：13
大写：HELLO, WORLD!
小写：hello, world!
反转：!dlroW ,olleH
包含 'World'：True
替换：Hello, C#!

=== 字符串分割 ===
  1. 张三
  2. 李四
  3. 王五
  4. 赵六

=== StringBuilder ===
第一行
第二行
第三行

=== 格式化 ===
价格：¥1,234.56
百分比：12.34%
当前时间：2024-01-15 14:30:00
\`\`\`

### 四、本章小结

- 数组声明：\`int[] nums = { 1, 2, 3 };\`，大小固定。
- 访问：\`nums[i]\`，长度 \`nums.Length\`。
- 多维数组：\`int[,] matrix\`，访问 \`matrix[i, j]\`。
- Array 类：\`Sort\`、\`Reverse\`、\`IndexOf\`、\`Copy\`、\`Clear\`。
- 字符串基本操作：\`Length\`、\`ToUpper\`、\`ToLower\`、\`Trim\`、\`Substring\`、\`IndexOf\`、\`Replace\`、\`Contains\`。
- 字符串拼接：\`+\`、\`$\\"\\"\`插值（推荐）、\`string.Concat\`、\`string.Join\`。
- 字符串比较：\`==\`、\`Equals\`、\`string.Compare\`，注意大小写敏感性。
- 字符串不可变——循环拼接用 \`StringBuilder\`。
- 字符串格式化：\`{price:C}\`（货币）、\`{price:F2}\`（小数）、\`{date:yyyy-MM-dd}\`（日期）。

下一章讲枚举与结构体——值类型的核心。`,
  },

  // ============================================================
  // 第八章：枚举与结构体
  // ============================================================
  {
    id: 'csharp-ch08',
    group: '第二部分 语法进阶',
    icon: '📐',
    title: '枚举与结构体',
    content: `## 第八章　枚举与结构体

枚举和结构体是 C# 的两种值类型，常用于组织相关数据。这一章讲它们的定义、使用、与类的区别。

### 一、枚举（enum）

#### 1. 基本枚举

\`\`\`csharp
enum Color
{
    Red,
    Green,
    Blue
}

// 使用
Color c = Color.Red;
Console.WriteLine(c);  // Red
\`\`\`

枚举本质是整数，默认从 0 开始：

\`\`\`csharp
Console.WriteLine((int)Color.Red);    // 0
Console.WriteLine((int)Color.Green);  // 1
Console.WriteLine((int)Color.Blue);   // 2
\`\`\`

#### 2. 指定值

\`\`\`csharp
enum HttpStatus
{
    OK = 200,
    NotFound = 404,
    ServerError = 500
}

HttpStatus status = HttpStatus.NotFound;
Console.WriteLine((int)status);  // 404
\`\`\`

#### 3. 标志枚举（Flags）

\`\`\`csharp
[Flags]
enum Permissions
{
    None = 0,
    Read = 1,
    Write = 2,
    Execute = 4,
    All = Read | Write | Execute
}

Permissions p = Permissions.Read | Permissions.Write;
Console.WriteLine(p);  // Read, Write
Console.WriteLine((p & Permissions.Read) != 0);  // True，包含 Read
\`\`\`

#### 4. 枚举常用方法

\`\`\`csharp
Color c = Color.Red;

// 转字符串
string s = c.ToString();  // "Red"

// 字符串转枚举
Color parsed = (Color)Enum.Parse(typeof(Color), "Green");
// 或泛型版本（.NET 5+ / C# 9+）
Color parsed2 = Enum.Parse<Color>("Blue");

// 检查是否定义
bool isDefined = Enum.IsDefined(typeof(Color), 5);  // False

// 获取所有值
Color[] all = (Color[])Enum.GetValues(typeof(Color));
\`\`\`

### 二、结构体（struct）

#### 1. 基本结构体

\`\`\`csharp
struct Point
{
    public int X;
    public int Y;

    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }

    public override string ToString() => $"({X}, {Y})";
}

// 使用
Point p = new Point(3, 4);
Console.WriteLine(p);  // (3, 4)
\`\`\`

#### 2. 结构体 vs 类

| 特性 | struct（结构体） | class（类） |
| --- | --- | --- |
| 类型 | 值类型 | 引用类型 |
| 存储 | 栈（通常） | 堆 |
| 赋值 | 复制值 | 复制引用 |
| 继承 | 不能继承（只能实现接口） | 可以继承 |
| 默认值 | 默认构造（字段归零） | null |
| 适用 | 小型数据（点、颜色、复数） | 复杂对象 |

\`\`\`csharp
struct Point
{
    public int X, Y;
}

Point p1 = new Point { X = 1, Y = 2 };
Point p2 = p1;  // 复制值
p2.X = 99;
Console.WriteLine(p1.X);  // 1，p1 不变（值类型）
\`\`\`

#### 3. readonly struct（C# 7+）

不可变结构体，性能更好：

\`\`\`csharp
public readonly struct Vector
{
    public double X { get; }
    public double Y { get; }
    public double Z { get; }

    public Vector(double x, double y, double z)
    {
        X = x; Y = y; Z = z;
    }

    public double Length => Math.Sqrt(X * X + Y * Y + Z * Z);
}

var v = new Vector(1, 2, 3);
Console.WriteLine(v.Length);  // 3.7416...
\`\`\`

#### 4. 结构体的适用场景

- 小型数据（< 16 字节）。
- 逻辑上是值类型（点、颜色、日期、复数）。
- 不需要继承。
- 高性能场景（避免堆分配）。

**例子**：\`System.Drawing.Point\`、\`DateTime\`、\`TimeSpan\`、\`Guid\` 都是结构体。

#### 5. record struct（C# 10+）

C# 10 引入 record struct，结合值语义和不可变性：

\`\`\`csharp
public record struct Point(int X, int Y);

var p1 = new Point(1, 2);
var p2 = new Point(1, 2);
Console.WriteLine(p1 == p2);  // True，基于值相等
\`\`\`

### 三、枚举与结构体综合示例

\`\`\`csharp
using System;

// 1. 枚举：星期
enum DayOfWeek
{
    Monday = 1,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday
}

// 2. 枚举：权限标志
[Flags]
enum Permission
{
    None = 0,
    Read = 1,
    Write = 2,
    Execute = 4,
    All = Read | Write | Execute
}

// 3. 结构体：点
struct Point
{
    public int X;
    public int Y;

    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }

    public double DistanceTo(Point other)
    {
        int dx = X - other.X;
        int dy = Y - other.Y;
        return Math.Sqrt(dx * dx + dy * dy);
    }

    public override string ToString() => $"({X}, {Y})";
}

// 4. readonly struct：矩形
public readonly struct Rectangle
{
    public double Width { get; }
    public double Height { get; }

    public Rectangle(double width, double height)
    {
        Width = width;
        Height = height;
    }

    public double Area => Width * Height;
    public double Perimeter => 2 * (Width + Height);
}

// 测试
Console.WriteLine("=== 枚举示例 ===");
DayOfWeek today = DayOfWeek.Wednesday;
Console.WriteLine($"今天是：{today}");
Console.WriteLine($"编号：{(int)today}");

// 遍历所有枚举值
Console.WriteLine("\\n所有星期：");
foreach (DayOfWeek day in Enum.GetValues(typeof(DayOfWeek)))
{
    Console.WriteLine($"  {day} = {(int)day}");
}

// 标志枚举
Console.WriteLine("\\n=== 标志枚举 ===");
Permission myPermission = Permission.Read | Permission.Write;
Console.WriteLine($"权限：{myPermission}");
Console.WriteLine($"可以读？{(myPermission & Permission.Read) != 0}");
Console.WriteLine($"可以执行？{(myPermission & Permission.Execute) != 0}");

// 结构体
Console.WriteLine("\\n=== 结构体示例 ===");
Point p1 = new Point(0, 0);
Point p2 = new Point(3, 4);
Console.WriteLine($"点 p1：{p1}");
Console.WriteLine($"点 p2：{p2}");
Console.WriteLine($"距离：{p1.DistanceTo(p2):F2}");

// 值类型赋值
Point p3 = p2;
p3.X = 99;
Console.WriteLine($"修改 p3.X 后：");
Console.WriteLine($"  p2 = {p2}");  // (3, 4)
Console.WriteLine($"  p3 = {p3}");  // (99, 4)

// readonly struct
Console.WriteLine("\\n=== readonly struct ===");
Rectangle rect = new Rectangle(5, 3);
Console.WriteLine($"矩形 {rect.Width}x{rect.Height}");
Console.WriteLine($"面积：{rect.Area}");
Console.WriteLine($"周长：{rect.Perimeter}");
\`\`\`

输出：
\`\`\`
=== 枚举示例 ===
今天是：Wednesday
编号：3

所有星期：
  Monday = 1
  Tuesday = 2
  Wednesday = 3
  Thursday = 4
  Friday = 5
  Saturday = 6
  Sunday = 7

=== 标志枚举 ===
权限：Read, Write
可以读？True
可以执行？False

=== 结构体示例 ===
点 p1：(0, 0)
点 p2：(3, 4)
距离：5.00
修改 p3.X 后：
  p2 = (3, 4)
  p3 = (99, 4)

=== readonly struct ===
矩形 5x3
面积：15
周长：16
\`\`\`

### 四、本章小结

- 枚举 \`enum\`：命名一组整数常量，默认从 0 开始，可指定值。
- \`[Flags]\` 标志枚举支持位运算组合。
- 枚举方法：\`ToString\`、\`Enum.Parse\`、\`Enum.IsDefined\`、\`Enum.GetValues\`。
- 结构体 \`struct\` 是值类型，赋值复制值，不能继承。
- struct vs class：struct 适合小型数据，class 适合复杂对象。
- \`readonly struct\`（C# 7+）不可变结构体，性能更好。
- \`record struct\`（C# 10+）值类型 + 不可变 + 值相等。
- 常用结构体：\`Point\`、\`DateTime\`、\`TimeSpan\`、\`Guid\`。

下一部分讲面向对象——C# 最核心的编程范式。`,
  },
];

export { chapters };
