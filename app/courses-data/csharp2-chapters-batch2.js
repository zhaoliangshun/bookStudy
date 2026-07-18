// =============================================================
// C# 从入门到精通大全 - 第二批章节（第二部分 控制流与方法，共 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   csharp2-ch06 : 第六章 条件判断 if 与 switch
//   csharp2-ch07 : 第七章 循环 for / while / foreach
//   csharp2-ch08 : 第八章 方法与参数详解
//   csharp2-ch09 : 第九章 数组与多维数组
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第六章：条件判断 if 与 switch
  // ============================================================
  {
    id: 'csharp2-ch06',
    group: '第二部分 控制流与方法',
    icon: '🔀',
    title: '第六章 条件判断 if 与 switch',
    content: `## 第六章　条件判断 if 与 switch

条件判断是程序的"决策中枢"——根据不同状态走不同分支。这一章覆盖 \`if\` 家族、\`switch\` 语句、\`switch\` 表达式、模式匹配与 \`when\` 子句，学完你能写出任何复杂度的分支逻辑。

### 一、if 语句：最基础的条件 ⭐

\`\`\`csharp
int score = 75;

// 最简形式：条件为 true 才执行
if (score >= 60)
{
    Console.WriteLine("及格了");  // 输出
}

// 条件为 false 什么都不做，没有 else 时直接跳过
if (score >= 90)
{
    Console.WriteLine("优秀");
}
\`\`\`

> ⭐ \`if\` 条件必须是 \`bool\` 类型，C# 不允许像 C/C++ 那样写 \`if (score)\`（隐式转 bool），必须写 \`if (score != 0)\`。这是 C# 的安全设计。

### 二、if-else if-else 链 ⭐

多个互斥分支用 \`else if\` 串联，从上到下匹配，命中一个就跳出：

\`\`\`csharp
int score = 82;

// 互斥分支：命中一个就跳出，后面的不再判断
if (score >= 90)
{
    Console.WriteLine("优秀");
}
else if (score >= 80)
{
    Console.WriteLine("良好");  // 命中这里，输出
}
else if (score >= 60)
{
    Console.WriteLine("及格");
}
else
{
    Console.WriteLine("不及格");
}

// ⚠️ 注意顺序：条件应从严到宽，否则会被宽松条件提前命中
// 错误示范：if (score >= 60) 先命中，永远到不了 >= 80
\`\`\`

> ⭐ **分支顺序**：互斥条件从严到宽排列。如果先写 \`>= 60\`，\`82\` 会被它命中，永远到不了 \`>= 80\`。

### 三、嵌套 if

\`if\` 内部可以再嵌 \`if\`，但**层级太深会很难读**，超过 3 层建议改用 \`switch\` 或提前 return：

\`\`\`csharp
bool isVip = true;
int age = 22;
double amount = 350.0;

// 嵌套 if：先判 VIP，再判金额
if (isVip)
{
    if (age >= 18)
    {
        if (amount >= 300)
        {
            Console.WriteLine("VIP 大额订单，享 7 折");
        }
        else
        {
            Console.WriteLine("VIP 普通订单，享 9 折");
        }
    }
    else
    {
        Console.WriteLine("VIP 未成年，无法下单");
    }
}
else
{
    Console.WriteLine("非 VIP，原价");
}
\`\`\`

> 嵌套超过 3 层可读性急剧下降，能用 \`&&\` 合并就合并：\`if (isVip && age >= 18 && amount >= 300)\`。

### 四、switch 语句：多分支等值匹配 ⭐

当条件是"变量等于某值"时，\`switch\` 比 \`if-else if\` 更清晰：

\`\`\`csharp
int dayOfWeek = 3;  // 1=周一 ... 7=周日

switch (dayOfWeek)
{
    case 1:
        Console.WriteLine("周一：开例会");
        break;  // 每个 case 必须 break/return/goto，不能贯穿
    case 2:
    case 3:
    case 4:
        Console.WriteLine("工作日：写代码");  // 多个 case 共享一段代码
        break;
    case 5:
        Console.WriteLine("周五：准备周末");
        break;
    case 6:
    case 7:
        Console.WriteLine("周末：休息");
        break;
    default:  // 所有 case 都不匹配时执行
        Console.WriteLine("非法日期");
        break;
}
\`\`\`

> ⭐ C# 的 \`switch\` **不支持隐式贯穿**——每个 \`case\` 必须以 \`break\`/\`return\`/\`goto\` 结束。多个标签共享代码体是允许的（如上面的 case 2/3/4）。

### 五、switch 表达式（C# 8+）⭐

C# 8 引入的 **switch 表达式**把分支写成"输入 → 输出"的映射，比 \`switch\` 语句更紧凑：

\`\`\`csharp
int dayOfWeek = 3;

// switch 表达式：=> 左边是模式，右边是结果
string dayType = dayOfWeek switch
{
    1 or 2 or 3 or 4 or 5 => "工作日",  // or 组合模式
    6 or 7 => "周末",
    _ => "非法日期"   // _ 是弃元模式，等价于 default
};

Console.WriteLine($">{dayOfWeek} 是 {dayType}");  // 工作日

// 用 switch 表达式做计算
double discount = dayOfWeek switch
{
    6 or 7 => 0.5,    // 周末半价
    5 => 0.8,         // 周五 8 折
    _ => 1.0          // 其他原价
};
Console.WriteLine($"折扣：{discount}");
\`\`\`

> ⭐ **switch 表达式**是现代 C# 最优雅的特性之一。返回值场景下用它替代 \`switch\` 语句，代码量减半。 \`or\`/\`and\` 模式组合让条件更直观。

### 六、模式匹配与 when 子句 ⭐

\`switch\` 不仅能匹配常量，还能匹配**类型、范围、属性**，配合 \`when\` 子句加额外条件：

\`\`\`csharp
object data = 42;  // 装箱的整数

// 类型模式：匹配变量类型
string desc = data switch
{
    int i when i > 0 => $"正整数 {i}",
    int i when i < 0 => $"负整数 {i}",
    int i => $"零 {i}",
    string s when s.Length > 10 => "长字符串",
    string s => $"字符串：{s}",
    null => "空值",
    _ => "其他类型"
};
Console.WriteLine(desc);  // 正整数 42

// 关系模式（C# 9+）：直接写比较
int score = 85;
string grade = score switch
{
    >= 90 => "A",
    >= 80 => "B",  // 命中
    >= 70 => "C",
    >= 60 => "D",
    _ => "F"
};
Console.WriteLine($"等级：{grade}");  // B
\`\`\`

> ⭐ **模式匹配**是 C# 7 起逐步强化的能力，到 C# 12 已经非常强大。\`when\` 子句给 \`case\` 加任意额外条件，灵活度堪比 \`if\`。

### 七、三元运算符 vs if-else

简单二选一用三元 \`? :\`，复杂逻辑用 \`if\`：

\`\`\`csharp
int age = 20;

// ✅ 简单二选一：三元更简洁
string status = age >= 18 ? "成年" : "未成年";

// ❌ 嵌套三元：可读性差，慎用
string level = age >= 60 ? "老年" : age >= 30 ? "中年" : age >= 18 ? "青年" : "少年";

// ✅ 多分支用 switch 表达式更清晰
string level2 = age switch
{
    >= 60 => "老年",
    >= 30 => "中年",
    >= 18 => "青年",
    _ => "少年"
};
Console.WriteLine($">{status}，{level2}");
\`\`\`

### 八、实战 demo：成绩等级判定系统

综合运用 \`if\`、\`switch\` 表达式、模式匹配，写一个完整的成绩判定程序：

\`\`\`csharp
// === 成绩等级判定系统 ===
// 演示：多种条件判断写法对比

int score = 76;
bool isMakeup = false;  // 是否补考

// 方式 1：if-else if 链（适合需要执行多条语句的场景）
if (score >= 90 && !isMakeup)
{
    Console.WriteLine("[if] 等级 A，可评优");
}
else if (score >= 80)
{
    Console.WriteLine("[if] 等级 B");
}
else if (score >= 60)
{
    Console.WriteLine("[if] 等级 C，通过");  // 命中
}
else
{
    Console.WriteLine("[if] 等级 D，需补考");
}

// 方式 2：switch 表达式（适合"输入→输出"映射）
string grade = score switch
{
    >= 90 when !isMakeup => "A",
    >= 90 => "A（补考）",  // 补考最高记 A
    >= 80 => "B",
    >= 60 => "C",
    _ => "D"
};
Console.WriteLine($"[switch 表达式] 等级：{grade}");

// 方式 3：综合判定 —— GPA 计算
double gpa = (score, isMakeup) switch
{
    (>= 90, false) => 4.0,
    (>= 80, false) => 3.0,
    (>= 60, false) => 2.0,  // 命中
    (>= 60, true) => 1.5,   // 补考通过 GPA 较低
    _ => 0.0
};
Console.WriteLine($"[元组模式] GPA：{gpa}");

// 方式 4：用 if 处理特殊逻辑（switch 不擅长副作用）
if (score < 60 && !isMakeup)
{
    Console.WriteLine("警告：成绩不及格，已自动报名补考");
}
\`\`\`

输出：
\`\`\`
[if] 等级 C，通过
[switch 表达式] 等级：C
[元组模式] GPA：2.0
\`\`\`

### 九、小结

- ⭐ \`if\` 条件必须是 \`bool\`，分支顺序从严到宽。
- ⭐ \`switch\` 语句适合多值等值匹配，\`case\` 必须以 \`break\` 结束。
- ⭐ **switch 表达式**（C# 8+）让分支写成"输入→输出"映射，\`or\`/\`and\` 组合模式很优雅。
- ⭐ **模式匹配** + \`when\` 子句支持类型、范围、属性匹配，灵活度极高。
- 嵌套 \`if\` 超 3 层建议重构，简单二选一用三元，多分支映射用 switch 表达式。`,
  },

  // ============================================================
  // 第七章：循环 for / while / foreach
  // ============================================================
  {
    id: 'csharp2-ch07',
    group: '第二部分 控制流与方法',
    icon: '🔁',
    title: '第七章 循环 for / while / foreach',
    content: `## 第七章　循环 for / while / foreach

循环让程序能重复执行一段代码。这一章覆盖 \`for\`、\`while\`、\`do-while\`、\`foreach\` 四种循环，以及 \`break\`/\`continue\` 控制流，最后用九九乘法表和斐波那契数列做综合实战。

### 一、for 循环：已知次数 ⭐

\`for\` 适合**循环次数已知**的场景。结构：\`for (初始化; 条件; 步进)\`：

\`\`\`csharp
// 基础：输出 1~5
for (int i = 1; i <= 5; i++)
{
    Console.WriteLine($"第 {i} 次");
}

// 倒序：从 10 数到 1
for (int i = 10; i >= 1; i--)
{
    Console.Write(i + " ");
}
Console.WriteLine();  // 10 9 8 7 6 5 4 3 2 1

// 步进为 2：输出偶数
for (int i = 0; i <= 10; i += 2)
{
    Console.Write(i + " ");  // 0 2 4 6 8 10
}
Console.WriteLine();
\`\`\`

> ⭐ \`for\` 的三个部分都可省略，但分号不能少：\`for (;;)\` 是合法的无限循环。循环变量 \`i\` 的作用域仅限循环体内部。

### 二、while 循环：条件未知 ⭐

\`while\` 先判断条件再执行，**适合循环次数不确定**的场景：

\`\`\`csharp
// 经典：累加到 100
int sum = 0, n = 1;
while (sum < 100)
{
    sum += n;
    n++;
}
Console.WriteLine($"累加到 {n - 1}，总和 {sum}");  // 累加到 14，总和 105

// 处理输入：直到用户输入 "exit"
// string input;
// while ((input = Console.ReadLine()) != "exit") { ... }

// 条件为 false 一次都不执行
int x = 10;
while (x < 5)
{
    Console.WriteLine("这行不会执行");
}
\`\`\`

> ⭐ \`while\` 适合"等待某条件不成立"的场景（如读文件到末尾、接收输入到特定值）。务必确保循环体内有**改变条件的代码**，否则死循环。

### 三、do-while 循环：至少执行一次

\`do-while\` 先执行一次再判断，**至少会执行一次**：

\`\`\`csharp
// 菜单循环：至少展示一次菜单
int choice;
do
{
    Console.WriteLine("1. 开始游戏");
    Console.WriteLine("2. 设置");
    Console.WriteLine("0. 退出");
    Console.Write("请选择：");
    choice = 2;  // 模拟用户输入
    Console.WriteLine($"选择了 {choice}");
} while (choice != 0);

// 经典用法：先执行再判断是否继续
int num = 0, total = 0;
do
{
    total += num;
    num++;
} while (num <= 5);
Console.WriteLine($"总和：{total}");  // 0+1+2+3+4+5 = 15
\`\`\`

> \`do-while\` 在 C# 里相对少用，主要场景是"至少执行一次"的菜单、输入验证。注意 \`while\` 后面有分号。

### 四、foreach 循环：遍历集合 ⭐

\`foreach\` 是 C# **最常用**的循环，遍历集合无需关心索引：

\`\`\`csharp
// 遍历数组
int[] nums = { 10, 20, 30, 40, 50 };
foreach (int n in nums)
{
    Console.Write(n + " ");  // 10 20 30 40 50
}
Console.WriteLine();

// 遍历字符串（字符串是字符序列）
foreach (char c in "Hello")
{
    Console.Write(c + "-");  // H-e-l-l-o-
}
Console.WriteLine();

// 遍历 List
var names = new List<string> { "张三", "李四", "王五" };
foreach (var name in names)
{
    Console.WriteLine($"你好，{name}");
}

// 遍历 Dictionary
var scores = new Dictionary<string, int>
{
    ["张三"] = 90,
    ["李四"] = 85
};
foreach (var kv in scores)
{
    Console.WriteLine($"{kv.Key}: {kv.Value}");
}
\`\`\`

> ⭐ **foreach 是日常开发首选**。它的优点：① 不用管索引越界；② 只读访问避免误改；③ 代码意图清晰。
>
> ⚠️ \`foreach\` 内部**不能修改集合本身**（不能增删元素），也不能修改迭代变量 \`n\`（只读）。需要修改时用 \`for\` 配合索引。

### 五、break 与 continue ⭐

\`break\` 跳出整个循环，\`continue\` 跳过本次进入下次：

\`\`\`csharp
// break：找到第一个偶数就停
for (int i = 1; i <= 10; i++)
{
    if (i % 2 == 0)
    {
        Console.WriteLine($"找到偶数：{i}");  // 找到偶数：2
        break;  // 跳出整个循环
    }
}

// continue：跳过偶数，只输出奇数
for (int i = 1; i <= 10; i++)
{
    if (i % 2 == 0)
    {
        continue;  // 跳过本次，进入下次
    }
    Console.Write(i + " ");  // 1 3 5 7 9
}
Console.WriteLine();

// 嵌套循环中 break 只跳出最内层
for (int i = 0; i < 3; i++)
{
    for (int j = 0; j < 3; j++)
    {
        if (j == 1) break;  // 只跳出内层 j 循环
        Console.WriteLine($"i={i}, j={j}");
    }
}
\`\`\`

> ⭐ \`break\` 和 \`continue\` 是循环控制的核心。**嵌套循环中 \`break\` 只跳出最内层**——要跳出多层可以用 \`goto\` 标签或重构为方法 \`return\`。

### 六、嵌套循环

\`\`\`csharp
// 打印矩形星号
for (int i = 0; i < 3; i++)       // 行
{
    for (int j = 0; j < 5; j++)   // 列
    {
        Console.Write("*");
    }
    Console.WriteLine();  // 换行
}
// 输出：
// *****
// *****
// *****

// 嵌套循环的复杂度是 O(n*m)，注意性能
// 数据量大时考虑能否用 LINQ 或单层循环替代
\`\`\`

### 七、无限循环与跳出

\`while (true)\` 或 \`for (;;)\` 是常见写法，配合 \`break\` 跳出：

\`\`\`csharp
// while(true) + break：服务端常用模式
int retry = 0;
while (true)
{
    retry++;
    Console.WriteLine($"第 {retry} 次尝试");

    if (retry >= 3)
    {
        Console.WriteLine("达到最大重试，退出");
        break;
    }
}

// for (;;) 等价 while(true)
// for (;;)
// {
//     // 持续接收消息...
//     if (shouldStop) break;
// }
\`\`\`

> \`while (true)\` 配合 \`break\` 比单纯 \`while (condition)\` 更灵活——能在循环体任意位置跳出，适合复杂退出条件。

### 八、实战 demo：九九乘法表

经典面试题，用嵌套循环输出九九乘法表：

\`\`\`csharp
// === 九九乘法表 ===
// 嵌套 for：外层控制行，内层控制列

for (int i = 1; i <= 9; i++)        // 行：被乘数
{
    for (int j = 1; j <= i; j++)    // 列：乘数，只到 i 形成三角形
    {
        // {j}x{i}={result,-4}：左对齐占 4 字符，对齐美观
        Console.Write($"{j}x{i}={i * j,-4}");
    }
    Console.WriteLine();  // 每行结束换行
}
\`\`\`

输出（节选）：
\`\`\`
1x1=1
1x2=2   2x2=4
1x3=3   2x3=6   3x3=9
...
1x9=9   2x9=18  3x9=27  4x9=36  5x9=45  6x9=54  7x9=63  8x9=72  9x9=81
\`\`\`

### 九、实战 demo：斐波那契数列

斐波那契：每一项等于前两项之和（1, 1, 2, 3, 5, 8, 13, ...）：

\`\`\`csharp
// === 斐波那契数列 ===
// 用 while 循环生成前 15 项

int a = 1, b = 1;       // 前两项
int count = 15;         // 生成数量
int generated = 0;

Console.Write("斐波那契前 15 项：");
while (generated < count)
{
    Console.Write(a + " ");

    // 滚动更新：a 取 b 的值，b 取 a+b 的值
    int next = a + b;
    a = b;
    b = next;

    generated++;
}
Console.WriteLine();
// 输出：1 1 2 3 5 8 13 21 34 55 89 144 233 377 610

// 用 for 写法
int x = 1, y = 1;
Console.Write("for 版本：");
for (int i = 0; i < 15; i++)
{
    Console.Write(x + " ");
    (x, y) = (y, x + y);  // 元组解构赋值，一行搞定交换
}
Console.WriteLine();
\`\`\`

> 元组解构 \`(x, y) = (y, x + y)\` 是 C# 7+ 的优雅写法，避免引入临时变量。

### 十、小结

- ⭐ \`for\` 适合已知次数，\`while\` 适合条件未知，\`do-while\` 至少执行一次。
- ⭐ **\`foreach\` 是日常首选**——遍历集合无需索引，只读安全。
- ⭐ \`break\` 跳出整个循环，\`continue\` 跳过本次；嵌套循环 \`break\` 只跳出最内层。
- 嵌套循环复杂度 O(n*m)，数据量大时考虑用 LINQ 或单层循环替代。
- \`while (true)\` + \`break\` 适合复杂退出条件的服务端循环。`,
  },

  // ============================================================
  // 第八章：方法与参数详解
  // ============================================================
  {
    id: 'csharp2-ch08',
    group: '第二部分 控制流与方法',
    icon: '🛠️',
    title: '第八章 方法与参数详解',
    content: `## 第八章　方法与参数详解

方法是代码复用的最小单元。这一章覆盖方法定义、返回值、四类参数（值参/\`ref\`/\`out\`/\`in\`）、默认参数、\`params\`、方法重载、表达式体方法、本地函数、元组返回。学完你能写出参数灵活、复用性高的方法。

### 一、方法定义与调用 ⭐

\`\`\`csharp
// 在顶级语句里直接定义方法（C# 9+ 支持）
// 语法：返回类型 方法名(参数列表) { 方法体 }

// 无参无返回
void SayHello()
{
    Console.WriteLine("你好，C#！");
}

// 带参方法
void Greet(string name)
{
    Console.WriteLine($"你好，{name}！");
}

// 调用
SayHello();
Greet("张三");
Greet("李四");
\`\`\`

> ⭐ **方法定义在顶级语句里**：C# 9+ 允许在顶级语句文件里直接写方法，不用套 \`class\`。学习阶段这样写最简洁。

### 二、返回值 ⭐

\`void\` 表示无返回值，其他类型必须 \`return\`：

\`\`\`csharp
// 返回 int
int Add(int a, int b)
{
    return a + b;
}

// 返回 string
string GetGrade(int score)
{
    if (score >= 90) return "A";
    if (score >= 60) return "B";
    return "C";  // 必须保证所有路径都 return
}

// 多个 return：找到就返回，找不到返回默认值
int FindFirstEven(int[] nums)
{
    foreach (var n in nums)
    {
        if (n % 2 == 0) return n;
    }
    return -1;  // 没找到返回 -1
}

Console.WriteLine(Add(3, 5));              // 8
Console.WriteLine(GetGrade(85));           // B
Console.WriteLine(FindFirstEven(new[] { 1, 3, 4, 6 }));  // 4
\`\`\`

> ⭐ 非 \`void\` 方法必须保证**所有代码路径都 \`return\`**，编译器会检查。多个 \`return\` 是合法的，提前 return 能简化嵌套。

### 三、值参数 vs ref vs out vs in ⭐

这是 C# 参数的**核心难点**。默认是"值传递"，\`ref\`/\`out\`/\`in\` 是"引用传递"：

\`\`\`csharp
// === 1. 值参数（默认）：拷贝一份传入，方法内修改不影响外部 ===
void TryDouble(int x)
{
    x = x * 2;  // 修改的是拷贝
}
int n = 10;
TryDouble(n);
Console.WriteLine(n);  // 10，没变

// === 2. ref：双向引用，方法内修改影响外部 ===
void DoubleByRef(ref int x)
{
    x = x * 2;
}
int m = 10;
DoubleByRef(ref m);  // 调用时要写 ref
Console.WriteLine(m);  // 20，变了

// === 3. out：输出参数，方法必须赋值，用于返回多个值 ===
bool TryParseInt(string s, out int result)
{
    if (int.TryParse(s, out result))
    {
        return true;
    }
    result = 0;  // out 参数必须赋值
    return false;
}
if (TryParseInt("123", out int parsed))
{
    Console.WriteLine($"解析成功：{parsed}");  // 123
}

// === 4. in：只读引用，避免大结构体拷贝，方法内不能修改 ===
// 适合传递大 struct（如矩阵、向量）
void PrintSize(in int[] arr)
{
    // arr[0] = 99;  // 错误！in 参数不能修改
    Console.WriteLine($"数组长度：{arr.Length}");
}
int[] data = { 1, 2, 3 };
PrintSize(in data);
\`\`\`

> ⭐ **参数传递是本章重点**：
> - **值参**（默认）：拷贝传入，方法内修改不影响外部。
> - **\`ref\`**：双向引用，调用前必须已赋值，方法内可读可写。
> - **\`out\`**：输出参数，方法内必须赋值，用于返回多值。
> - **\`in\`**：只读引用，避免大 struct 拷贝，方法内不能改。
>
> 引用类型（如数组、对象）默认值传递时，传的是引用的拷贝——方法内能改对象内容，但不能让外部变量指向新对象。

### 四、默认参数与命名参数 ⭐

\`\`\`csharp
// 默认参数：从右到左连续提供
void CreateUser(string name, int age = 18, string city = "北京")
{
    Console.WriteLine($"姓名:{name}, 年龄:{age}, 城市:{city}");
}

CreateUser("张三");                       // 用全部默认
CreateUser("李四", 25);                   // 部分覆盖
CreateUser("王五", 30, "上海");           // 全部传入

// 命名参数：用 参数名:值 传参，顺序可变
CreateUser(name: "赵六", city: "深圳", age: 28);
CreateUser("钱七", city: "广州");         // 混用：位置参数 + 命名参数
\`\`\`

> ⭐ **默认参数**让方法调用更灵活，避免写一堆重载。规则：① 默认值必须是常量；② 从右到左连续提供，不能跳过。
>
> **命名参数**在调用方法参数多、想跳过中间参数时非常有用：\`CreateUser("钱七", city: "广州")\`。

### 五、params 可变参数 ⭐

\`params\` 让方法接受任意数量的同类型参数：

\`\`\`csharp
// params 必须是最后一个参数
int Sum(params int[] numbers)
{
    int total = 0;
    foreach (var n in numbers) total += n;
    return total;
}

// 调用时可传任意数量
Console.WriteLine(Sum());              // 0
Console.WriteLine(Sum(1));             // 1
Console.WriteLine(Sum(1, 2, 3));       // 6
Console.WriteLine(Sum(1, 2, 3, 4, 5)); // 15

// 也可以传数组
int[] arr = { 10, 20, 30 };
Console.WriteLine(Sum(arr));           // 60

// 经典用法：Console.WriteLine 就是 params
// Console.WriteLine("格式 {0} {1}", a, b) 的 a, b 就是 params object[]
\`\`\`

> ⭐ \`params\` 让方法签名更简洁，避免写 10 个重载。\`Console.WriteLine\` 和 \`string.Format\` 都靠它实现可变参数。

### 六、方法重载 ⭐

同名方法参数不同（数量、类型、顺序），编译器根据调用自动选择：

\`\`\`csharp
// 三个重载：参数类型不同
int Add(int a, int b) => a + b;
double Add(double a, double b) => a + b;
string Add(string a, string b) => a + b;

Console.WriteLine(Add(1, 2));          // int 版本：3
Console.WriteLine(Add(1.5, 2.5));      // double 版本：4
Console.WriteLine(Add("Hello", "!"));  // string 版本：Hello!

// 参数数量不同
int Multiply(int a, int b) => a * b;
int Multiply(int a, int b, int c) => a * b * c;

Console.WriteLine(Multiply(2, 3));        // 6
Console.WriteLine(Multiply(2, 3, 4));     // 24

// ⚠️ 返回类型不同不算重载
// int Foo(int x) 和 string Foo(int x) 会编译错误
\`\`\`

> ⭐ **方法重载**让 API 更直观——同一操作支持多种参数类型。重载看的是**参数签名**，返回类型不同不算重载。

### 七、表达式体方法（=>）⭐

单行方法可以用 \`=>\` 简化，等价于 \`{ return ...; }\`：

\`\`\`csharp
// 传统写法
int Square(int x)
{
    return x * x;
}

// 表达式体方法：=> 后跟一个表达式
int Square2(int x) => x * x;

// void 方法也能用 =>
void Print(string s) => Console.WriteLine(s);

// 带默认参数 + 表达式体
string Greet(string name, string greeting = "你好") => $"{greeting}，{name}！";

Console.WriteLine(Square2(5));   // 25
Print("测试");                   // 测试
Console.WriteLine(Greet("张三"));         // 你好，张三！
Console.WriteLine(Greet("李四", "Hi"));   // Hi，李四！
\`\`\`

> ⭐ **表达式体方法**让简单方法一行搞定，是现代 C# 的常用写法。规则：\`=>\` 后只能是一个表达式，不能多条语句。

### 八、本地函数

在方法内部定义的函数，作用域仅限外层方法：

\`\`\`csharp
// 本地函数：在外层方法内定义，仅外层可见
int ProcessOrder(int orderId, int quantity)
{
    // 本地函数：只在 ProcessOrder 内可用
    int CalculatePrice(int qty)
    {
        int unitPrice = 100;
        if (qty > 10) unitPrice = 80;  // 批量折扣
        return qty * unitPrice;
    }

    // 本地函数：日志记录
    void Log(string msg)
    {
        Console.WriteLine($"[订单 {orderId}] {msg}");
    }

    int total = CalculatePrice(quantity);
    Log($"数量 {quantity}，总价 {total}");
    return total;
}

ProcessOrder(1001, 5);   // 总价 500
ProcessOrder(1002, 20);  // 总价 1600
\`\`\`

> 本地函数适合"只在一个方法内复用"的小逻辑，避免污染类的外部接口。它还能访问外层方法的局部变量。

### 九、元组返回多值 ⭐

C# 7+ 支持方法返回元组，一次返回多个值：

\`\`\`csharp
// 返回 (最小值, 最大值, 总和)
(int Min, int Max, int Sum) Analyze(int[] nums)
{
    if (nums.Length == 0) return (0, 0, 0);

    int min = nums[0], max = nums[0], sum = 0;
    foreach (var n in nums)
    {
        if (n < min) min = n;
        if (n > max) max = n;
        sum += n;
    }
    return (min, max, sum);  // 命名元组返回
}

int[] data = { 3, 7, 1, 9, 4 };
var result = Analyze(data);
Console.WriteLine($"最小:{result.Min}, 最大:{result.Max}, 总和:{result.Sum}");
// 最小:1, 最大:9, 总和:24

// 解构：直接拆成变量
var (min, max, sum) = Analyze(data);
Console.WriteLine($"{min} / {max} / {sum}");

// 经典用法：TryParse 模式
(bool Success, int Value) TryParseSafe(string s)
{
    if (int.TryParse(s, out int v)) return (true, v);
    return (false, 0);
}

var (ok, val) = TryParseSafe("42");
Console.WriteLine($"成功:{ok}, 值:{val}");  // 成功:True, 值:42
\`\`\`

> ⭐ **元组返回**是 C# 替代 \`out\` 参数的优雅方案。命名元组 \`(int Min, int Max)\` 让调用方能用 \`result.Min\` 访问，比 \`result.Item1\` 可读得多。

### 十、实战 demo：简易计算器

综合运用本章知识，写一个支持多种运算的计算器：

\`\`\`csharp
// === 简易计算器 ===
// 演示：方法重载、表达式体、params、元组返回、本地函数

// 方法重载：基础运算
double Calc(double a, double b, char op) => op switch
{
    '+' => a + b,
    '-' => a - b,
    '*' => a * b,
    '/' => b == 0 ? double.NaN : a / b,
    _ => throw new ArgumentException($"不支持运算符 {op}")
};

// params 可变参数：连加
double Calc(params double[] nums)
{
    if (nums.Length == 0) return 0;
    double total = 0;
    foreach (var n in nums) total += n;
    return total;
}

// 元组返回：除法同时返回商和余数
(int Quotient, int Remainder) DivMod(int a, int b)
{
    if (b == 0) throw new DivideByZeroException();
    return (a / b, a % b);
}

// 本地函数示例：带验证的运算
double SafeSqrt(double x)
{
    // 本地函数：验证输入
    bool IsValid(double v) => v >= 0;

    if (!IsValid(x)) return double.NaN;
    return Math.Sqrt(x);
}

// 测试
Console.WriteLine($"3 + 5 = {Calc(3, 5, '+')}");
Console.WriteLine($"10 / 3 = {Calc(10, 3, '/'):F2}");

Console.WriteLine($"连加: {Calc(1, 2, 3, 4, 5)}");  // 15

var (q, r) = DivMod(17, 5);
Console.WriteLine($"17 ÷ 5 = {q} 余 {r}");  // 3 余 2

Console.WriteLine($"√16 = {SafeSqrt(16)}");  // 4
Console.WriteLine($"√-4 = {SafeSqrt(-4)}");  // NaN
\`\`\`

### 十一、小结

- ⭐ 方法定义：\`返回类型 方法名(参数) { ... }\`，非 void 必须 return。
- ⭐ **参数四件套**：值参（默认拷贝）、\`ref\`（双向引用）、\`out\`（输出参数）、\`in\`（只读引用）。
- ⭐ 默认参数从右到左连续，命名参数用 \`名:值\` 跳过中间参数。
- ⭐ \`params\` 接受可变数量参数，必须是最后一个参数。
- ⭐ 方法重载看参数签名，返回类型不同不算重载。
- ⭐ 表达式体方法 \`=>\` 让单行方法更简洁。
- ⭐ **元组返回**替代 \`out\` 实现多返回值，命名元组可读性最佳。`,
  },

  // ============================================================
  // 第九章：数组与多维数组
  // ============================================================
  {
    id: 'csharp2-ch09',
    group: '第二部分 控制流与方法',
    icon: '📊',
    title: '第九章 数组与多维数组',
    content: `## 第九章　数组与多维数组

数组是 C# 里最基础的集合类型——固定大小、类型统一、连续内存。这一章覆盖一维数组、二维数组 \`[,]\`、锯齿数组 \`[][]\`、\`Array\` 类常用方法，以及数组作为参数和返回值的实战。

### 一、一维数组声明与初始化 ⭐

\`\`\`csharp
// === 1. 声明 + 指定大小 ===
int[] nums = new int[5];  // 长度 5，默认值 0
Console.WriteLine(string.Join(", ", nums));  // 0, 0, 0, 0, 0

// === 2. 声明 + 列表初始化 ===
int[] scores = new int[] { 90, 85, 78, 92, 67 };
string[] names = new string[] { "张三", "李四", "王五" };

// === 3. 简化写法（最常用）⭐ ===
int[] arr = { 1, 2, 3, 4, 5 };
string[] langs = { "C#", "Java", "Python" };

// === 4. 用 var 推断 ===
var doubles = new[] { 1.1, 2.2, 3.3 };     // double[]
var mixed = new[] { 1, 2, 3.0 };            // 推断为 double[]（有 double）

// === 5. 长度与访问 ===
Console.WriteLine(\$"长度: {arr.Length}");  // 5
Console.WriteLine(\$"第一个: {arr[0]}");    // 1
Console.WriteLine(\$"最后: {arr[^1]}");     // 5（C# 8+ 反向索引）
arr[0] = 100;
Console.WriteLine(arr[0]);                  // 100
\`\`\`

> ⭐ **数组声明最常用**：\`int[] arr = { 1, 2, 3 };\`。注意 C# 的方括号跟在类型后（\`int[]\`），不是变量后（\`int arr[]\`）。
>
> ⭐ **反向索引 \`[^1]\`**（C# 8+）：\`arr[^1]\` 等价 \`arr[arr.Length - 1]\`，从末尾倒数。

### 二、数组遍历 ⭐

\`\`\`csharp
int[] nums = { 10, 20, 30, 40, 50 };

// 方式 1：foreach（首选，只读）⭐
foreach (var n in nums)
{
    Console.Write(n + " ");
}
Console.WriteLine();  // 10 20 30 40 50

// 方式 2：for + 索引（需要修改元素或索引时）
for (int i = 0; i < nums.Length; i++)
{
    nums[i] *= 2;  // 每个元素翻倍
}
Console.WriteLine(string.Join(", ", nums));  // 20, 40, 60, 80, 100

// 方式 3：用 Range 切片（C# 8+）⭐
int[] data = { 1, 2, 3, 4, 5, 6, 7, 8 };
int[] first3 = data[0..3];   // [1, 2, 3]  范围 0~2
int[] last2 = data[^2..];    // [7, 8]     最后 2 个
int[] middle = data[2..5];   // [3, 4, 5]  范围 2~4
int[] all = data[..];        // 全部
Console.WriteLine(string.Join(", ", first3));
Console.WriteLine(string.Join(", ", last2));
\`\`\`

> ⭐ **Range 切片**（C# 8+）\`data[1..4]\` 是数组切片的优雅写法。\`..\` 是范围运算符，\`[^1]\` 是反向索引。

### 三、二维数组 [,] ⭐

二维数组是**矩形结构**——每行长度相同，用 \`[,]\` 声明：

\`\`\`csharp
// === 声明 + 初始化 ===
// 3 行 4 列
int[,] matrix = new int[3, 4];

// 列表初始化
int[,] grid = {
    { 1, 2, 3, 4 },
    { 5, 6, 7, 8 },
    { 9, 10, 11, 12 }
};

// 访问：matrix[行, 列]
Console.WriteLine(grid[0, 0]);  // 1
Console.WriteLine(grid[2, 3]);  // 12
grid[1, 2] = 99;

// 维度信息
Console.WriteLine(\$"总元素数: {grid.Length}");      // 12
Console.WriteLine(\$"维度数: {grid.Rank}");           // 2
Console.WriteLine(\$"行数: {grid.GetLength(0)}");    // 3
Console.WriteLine(\$"列数: {grid.GetLength(1)}");    // 4

// 遍历二维数组
for (int i = 0; i < grid.GetLength(0); i++)         // 行
{
    for (int j = 0; j < grid.GetLength(1); j++)     // 列
    {
        Console.Write(\$"{grid[i, j],4}");
    }
    Console.WriteLine();
}
\`\`\`

> ⭐ **二维数组 \`[,]\`** 是连续矩形内存，适合矩阵、棋盘、表格数据。\`GetLength(0)\` 拿行数，\`GetLength(1)\` 拿列数，注意和 \`Length\`（总元素数）区分。

### 四、锯齿数组 [][]

锯齿数组是"数组的数组"——每行长度可以不同：

\`\`\`csharp
// === 锯齿数组：每行长度不同 ===
int[][] jagged = new int[3][];  // 3 行，每行待定

// 每行单独初始化
jagged[0] = new int[] { 1, 2 };
jagged[1] = new int[] { 3, 4, 5, 6 };
jagged[2] = new int[] { 7, 8, 9 };

// 简化声明
int[][] jagged2 = {
    new[] { 1, 2 },
    new[] { 3, 4, 5, 6 },
    new[] { 7, 8, 9 }
};

// 访问：jagged[行][列]
Console.WriteLine(jagged[1][2]);  // 5

// 遍历锯齿数组
for (int i = 0; i < jagged.Length; i++)
{
    for (int j = 0; j < jagged[i].Length; j++)  // 每行长度不同
    {
        Console.Write(jagged[i][j] + " ");
    }
    Console.WriteLine();
}
\`\`\`

> **二维数组 \`[,]\` vs 锯齿数组 \`[][]\`**：
> - \`[,]\` 矩形，内存连续，每行等长，适合矩阵。
> - \`[][]\` 数组的数组，每行可变长，灵活但内存不连续。
> - 日常开发 \`[][]\` 更常见，因为数据往往不规则。

### 五、Array 类常用方法 ⭐

\`Array\` 是所有数组的基类，提供大量静态方法：

\`\`\`csharp
int[] nums = { 5, 3, 8, 1, 9, 2, 7 };

// === 1. Sort 排序 ⭐ ===
Array.Sort(nums);
Console.WriteLine(string.Join(", ", nums));  // 1, 2, 3, 5, 7, 8, 9

// === 2. Reverse 反转 ===
Array.Reverse(nums);
Console.WriteLine(string.Join(", ", nums));  // 9, 8, 7, 5, 3, 2, 1

// === 3. Find / FindAll 查找 ===
int[] data = { 12, 25, 8, 33, 17, 40 };

int firstOver20 = Array.Find(data, x => x > 20);          // 25
int[] allOver20 = Array.FindAll(data, x => x > 20);       // [25, 33, 40]
int idx = Array.FindIndex(data, x => x > 20);             // 1
bool hasBig = Array.Exists(data, x => x > 30);            // true

Console.WriteLine(\$"第一个>20: {firstOver20}");
Console.WriteLine(\$"所有>20: {string.Join(",", allOver20)}");

// === 4. IndexOf 查找索引 ===
int[] arr = { 10, 20, 30, 20, 50 };
int index = Array.IndexOf(arr, 20);   // 1（第一个匹配）
int lastIdx = Array.LastIndexOf(arr, 20);  // 3

// === 5. Resize 改变大小 ===
int[] small = { 1, 2, 3 };
Array.Resize(ref small, 5);   // 扩到 5，新增位默认 0
Console.WriteLine(string.Join(", ", small));  // 1, 2, 3, 0, 0
Array.Resize(ref small, 2);   // 缩到 2
Console.WriteLine(string.Join(", ", small));  // 1, 2

// === 6. Copy / CopyTo 拷贝 ===
int[] src = { 1, 2, 3, 4, 5 };
int[] dst = new int[5];
Array.Copy(src, dst, 3);     // 拷贝前 3 个
Console.WriteLine(string.Join(", ", dst));  // 1, 2, 3, 0, 0

int[] dst2 = new int[5];
src.CopyTo(dst2, 0);         // 全部拷贝到 dst2 从 0 开始
Console.WriteLine(string.Join(", ", dst2));

// === 7. Clear 清空 ===
Array.Clear(dst2);           // 全部清 0
Console.WriteLine(string.Join(", ", dst2));  // 0, 0, 0, 0, 0

// === 8. BinarySearch 二分查找（需先排序）===
int[] sorted = { 1, 3, 5, 7, 9, 11 };
int found = Array.BinarySearch(sorted, 7);
Console.WriteLine(\$"7 的索引: {found}");  // 3
\`\`\`

> ⭐ \`Array.Sort\`、\`Array.Find\`/\`FindAll\`、\`Array.IndexOf\`、\`Array.Copy\` 是高频方法。日常开发虽然更多用 \`List\`/\`LINQ\`，但底层都靠 \`Array\` 类支撑。

### 六、数组作为参数与返回值 ⭐

\`\`\`csharp
// === 1. 数组作参数（默认传引用的拷贝，能改内容）===
void DoubleAll(int[] arr)
{
    for (int i = 0; i < arr.Length; i++)
    {
        arr[i] *= 2;  // 修改的是原数组内容
    }
}

int[] nums = { 1, 2, 3 };
DoubleAll(nums);
Console.WriteLine(string.Join(", ", nums));  // 2, 4, 6

// === 2. params 数组作参数 ===
int Max(params int[] nums)
{
    int max = nums[0];
    foreach (var n in nums)
        if (n > max) max = n;
    return max;
}
Console.WriteLine(Max(3, 7, 2, 9, 5));  // 9

// === 3. 返回数组 ===
int[] GetEvenNumbers(int max)
{
    var list = new List<int>();
    for (int i = 0; i <= max; i += 2)
        list.Add(i);
    return list.ToArray();  // List 转数组
}

int[] evens = GetEvenNumbers(10);
Console.WriteLine(string.Join(", ", evens));  // 0, 2, 4, 6, 8, 10

// === 4. in 修饰符：避免大数组拷贝（引用本身不拷贝）===
void PrintArray(in int[] arr)
{
    // arr = new int[10];  // 错误！in 不能重新赋值
    // arr[0] = 99;        // 但元素仍可改（in 只保护引用本身）
    Console.WriteLine(\$"长度 {arr.Length}, 首个 {arr[0]}");
}

// === 5. 返回多维数组 ===
int[,] CreateMatrix(int rows, int cols)
{
    int[,] m = new int[rows, cols];
    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++)
            m[i, j] = i * cols + j + 1;
    return m;
}

int[,] mat = CreateMatrix(2, 3);
for (int i = 0; i < mat.GetLength(0); i++)
{
    for (int j = 0; j < mat.GetLength(1); j++)
        Console.Write(\$"{mat[i, j],3}");
    Console.WriteLine();
}
// 输出：
//   1  2  3
//   4  5  6
\`\`\`

> ⭐ 数组作为参数传递时传的是"引用的拷贝"——方法内能改元素内容，但不能让外部变量指向新数组（除非用 \`ref\`）。

### 七、实战 demo：学生成绩统计

综合运用本章知识，写一个完整的学生成绩统计程序：

\`\`\`csharp
// === 学生成绩统计系统 ===
// 演示：一维数组、二维数组、Array 方法、数组作参数返回

// 学生姓名数组
string[] students = { "张三", "李四", "王五", "赵六", "钱七" };

// 二维数组：每个学生 3 门课成绩 [学生, 科目]
int[,] scores = {
    { 85, 92, 78 },   // 张三
    { 76, 88, 90 },   // 李四
    { 92, 95, 89 },   // 王五
    { 65, 72, 80 },   // 赵六
    { 88, 91, 85 }    // 钱七
};

// 计算每个学生的平均分（返回数组）
double[] GetAverages(int[,] scores)
{
    int studentCount = scores.GetLength(0);
    int subjectCount = scores.GetLength(1);
    double[] averages = new double[studentCount];

    for (int i = 0; i < studentCount; i++)
    {
        int sum = 0;
        for (int j = 0; j < subjectCount; j++)
            sum += scores[i, j];
        averages[i] = (double)sum / subjectCount;
    }
    return averages;
}

// 找出最高平均分的学生（返回索引和分数）
(int Index, double Score) FindTopStudent(string[] students, double[] averages)
{
    int topIndex = 0;
    for (int i = 1; i < averages.Length; i++)
        if (averages[i] > averages[topIndex])
            topIndex = i;
    return (topIndex, averages[topIndex]);
}

// 排序并返回排名索引（按平均分降序）
int[] GetRanking(double[] averages)
{
    int[] indices = new int[averages.Length];
    for (int i = 0; i < indices.Length; i++) indices[i] = i;

    // 用 Array.Sort 自定义比较：按 averages 降序排索引
    Array.Sort(indices, (a, b) => averages[b].CompareTo(averages[a]));
    return indices;
}

// 执行统计
double[] averages = GetAverages(scores);
var (topIdx, topScore) = FindTopStudent(students, averages);
int[] ranking = GetRanking(averages);

// 输出结果
Console.WriteLine("=== 成绩统计表 ===");
Console.WriteLine(\$"{"学生",-6}{"语文",6}{"数学",6}{"英语",6}{"平均分",8}");
for (int i = 0; i < students.Length; i++)
{
    Console.Write(\$"{students[i],-6}");
    for (int j = 0; j < scores.GetLength(1); j++)
        Console.Write(\$"{scores[i, j],6}");
    Console.WriteLine(\$"{averages[i],8:F1}");
}

Console.WriteLine();
Console.WriteLine(\$"🏆 最高分: {students[topIdx]} - {topScore:F1}");

Console.WriteLine("\\n=== 排行榜 ===");
for (int rank = 0; rank < ranking.Length; rank++)
{
    int idx = ranking[rank];
    Console.WriteLine(\$"第 {rank + 1} 名: {students[idx]} ({averages[idx]:F1})");
}
\`\`\`

输出（节选）：
\`\`\`
=== 成绩统计表 ===
学生  语文  数学  英语    平均分
张三    85    92    78    85.0
李四    76    88    90    84.7
王五    92    95    89    92.0
赵六    65    72    80    72.3
钱七    88    91    85    88.0

🏆 最高分: 王五 - 92.0

=== 排行榜 ===
第 1 名: 王五 (92.0)
第 2 名: 钱七 (88.0)
...
\`\`\`

### 八、小结

- ⭐ 一维数组声明：\`int[] arr = { 1, 2, 3 };\`，反向索引 \`arr[^1]\`、切片 \`arr[1..4]\` 是 C# 8+ 新语法。
- ⭐ **二维数组 \`[,]\`** 是矩形结构，\`GetLength(0)\`/\`GetLength(1)\` 取行列数。
- **锯齿数组 \`[][]\`** 每行长度可变，灵活但内存不连续。
- ⭐ \`Array\` 类常用：\`Sort\` 排序、\`Reverse\` 反转、\`Find\`/\`FindAll\` 查找、\`IndexOf\`、\`Resize\`、\`Copy\`、\`BinarySearch\`。
- ⭐ 数组作参数传的是"引用的拷贝"——能改内容不能换引用。
- 日常开发更多用 \`List<T>\`（大小可变），但数组是所有集合的底层基石。`,
  },
];

export { chapters };
