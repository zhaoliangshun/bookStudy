// =============================================================
// C# 从入门到精通大全（终极版）—— 第2批章节
// 第二部分 控制流（共 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   csharp3-ch06    : 第六章 条件判断
//   csharp3-ch07    : 第七章 循环语句
//   csharp3-ch08    : 第八章 跳转语句
//   csharp3-ch09    : 第九章 数组基础
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第六章：条件判断
  // ============================================================
  {
    id: 'csharp3-ch06',
    group: '第二部分 控制流',
    icon: '🔀',
    title: '第六章 条件判断',
    content: `## 第六章　条件判断

条件判断是程序的"大脑"，让代码能根据不同的情况执行不同的逻辑。本章涵盖 if/else、switch 语句、switch 表达式和模式匹配。

### 一、if / else 基础 ⭐

\`\`\`csharp
// if 语句的基本结构：if (条件) { 为真时执行的代码 }
// 条件必须是 bool 类型（true 或 false）
int age = 20;

if (age >= 18)  // 判断年龄是否大于等于 18
{
    Console.WriteLine("你是成年人，可以进入");
    Console.WriteLine("请遵守规则");
}

// 如果只有一行代码，可以省略花括号（但不推荐）
if (age >= 18)
    Console.WriteLine("成年人");
else
    Console.WriteLine("未成年人");
\`\`\`

### 二、else 与 else if 阶梯 ⭐

\`\`\`csharp
// if-else：二选一执行
int score = 75;

if (score >= 60)
{
    Console.WriteLine("及格了！");
}
else
{
    Console.WriteLine("不及格，需要补考");
}

// else if 阶梯：多条件判断，从上到下依次检查
// 第一个为 true 的条件分支执行，后续分支不再检查
score = 85;

if (score >= 90)
{
    Console.WriteLine("等级：优秀");
}
else if (score >= 80)
{
    Console.WriteLine("等级：良好");  // 85 >= 80 为 true，执行这里
}
else if (score >= 70)
{
    Console.WriteLine("等级：中等");  // 不会执行，因为上面的分支已经匹配
}
else if (score >= 60)
{
    Console.WriteLine("等级：及格");
}
else
{
    Console.WriteLine("等级：不及格");
}

// 实际场景：根据年龄段推荐不同内容
int age = 25;
if (age < 12)
    Console.WriteLine("推荐：儿童频道");
else if (age < 18)
    Console.WriteLine("推荐：青少年频道");
else if (age < 60)
    Console.WriteLine("推荐：综合频道");
else
    Console.WriteLine("推荐：养生频道");
\`\`\`

### 三、嵌套 if

\`\`\`csharp
// if 里面可以再嵌套 if，处理多层条件
// 但嵌套过深会降低可读性，建议不超过 3 层

bool isLoggedIn = true;
bool isVIP = true;
int age = 20;

if (isLoggedIn)  // 第一层：是否登录
{
    Console.WriteLine("用户已登录");

    if (isVIP)  // 第二层：是否 VIP
    {
        Console.WriteLine("VIP 用户，享受所有特权");

        if (age >= 18)  // 第三层：是否成年
        {
            Console.WriteLine("成年 VIP，可访问所有内容");
        }
        else
        {
            Console.WriteLine("未成年 VIP，部分内容受限");
        }
    }
    else
    {
        Console.WriteLine("普通用户，功能有限");
    }
}
else
{
    Console.WriteLine("请先登录");
}

// 优化：用提前返回（early return）减少嵌套
// 先处理不满足条件的情况，减少嵌套层级
if (!isLoggedIn)
{
    Console.WriteLine("请先登录");
    return;  // 提前返回，不需要 else
}
if (!isVIP)
{
    Console.WriteLine("普通用户，功能有限");
    return;
}
Console.WriteLine("VIP 用户，享受所有特权");
\`\`\`

### 四、三元运算符复习

\`\`\`csharp
// 三元运算符是 if-else 的表达式写法
// 语法：条件 ? 真值 : 假值

int score = 85;
string result = score >= 60 ? "及格" : "不及格";  // 简洁的二选一
Console.WriteLine(result);

// 嵌套三元：不推荐超过两层（可读性差）
string grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 60 ? "C" : "D";

// 实际场景：根据条件选择默认值
string name = null;
string display = name ?? "匿名用户";  // null 合并运算符也是一种条件判断
Console.WriteLine(display);
\`\`\`

### 五、switch 语句（传统形式）⭐

\`\`\`csharp
// switch 语句：根据一个值的不同情况执行不同分支
// 比一长串 else if 更清晰，适合枚举值、状态码等场景

int day = 3;
string dayName;

switch (day)  // 检查 day 的值
{
    case 1:                         // 当 day == 1
        dayName = "星期一";
        break;                      // 必须有 break，防止贯穿
    case 2:                         // 当 day == 2
        dayName = "星期二";
        break;
    case 3:                         // 当 day == 3
        dayName = "星期三";
        break;
    case 4:
        dayName = "星期四";
        break;
    case 5:
        dayName = "星期五";
        break;
    case 6:
    case 7:                         // 多个 case 可以共享同一个分支
        dayName = "周末";
        break;
    default:                        // 所有 case 都不匹配时执行
        dayName = "无效日期";
        break;
}
Console.WriteLine($"第 {day} 天是 {dayName}");

// 实际场景：菜单选择
Console.WriteLine("请选择操作：");
Console.WriteLine("1. 新建  2. 打开  3. 保存  4. 退出");
Console.Write("> ");
string? input = Console.ReadLine();

switch (input)
{
    case "1":
        Console.WriteLine("执行新建操作");
        break;
    case "2":
        Console.WriteLine("执行打开操作");
        break;
    case "3":
        Console.WriteLine("执行保存操作");
        break;
    case "4":
        Console.WriteLine("退出程序");
        break;
    default:
        Console.WriteLine("无效选择，请重新输入");
        break;
}
\`\`\`

### 六、switch 表达式（C# 8+）⭐⭐

\`\`\`csharp
// switch 表达式：比 switch 语句更简洁，返回值
// 语法：值 switch { 模式 => 结果, 模式 => 结果, ... }
// 每个分支用 => 箭头，不需要 break

int day = 3;

// 传统 switch 语句需要 20+ 行
// switch 表达式只需 5 行，且直接返回值
string dayName = day switch
{
    1 => "星期一",       // 数字 1 匹配时返回 "星期一"
    2 => "星期二",
    3 => "星期三",
    4 => "星期四",
    5 => "星期五",
    6 or 7 => "周末",    // or 模式：匹配 6 或 7
    _ => "无效日期"       // _ 丢弃模式：匹配所有剩余情况（类似 default）
};
Console.WriteLine(dayName);

// 实际场景：成绩等级转换
int score = 85;
string grade = score switch
{
    >= 90 => "A",        // 关系模式：>= 90
    >= 80 => "B",        // 注意：switch 表达式从上到下匹配，第一个匹配的分支生效
    >= 70 => "C",
    >= 60 => "D",
    _ => "F"
};
Console.WriteLine($"成绩 {score} 等级 {grade}");

// 实际场景：HTTP 状态码描述
int statusCode = 404;
string message = statusCode switch
{
    200 => "OK - 请求成功",
    301 => "Moved Permanently - 永久重定向",
    400 => "Bad Request - 请求错误",
    401 => "Unauthorized - 未授权",
    403 => "Forbidden - 禁止访问",
    404 => "Not Found - 未找到",
    500 => "Internal Server Error - 服务器内部错误",
    _ => $"未知状态码：{statusCode}"
};
Console.WriteLine(message);
\`\`\`

### 七、switch 模式匹配 ⭐⭐

\`\`\`csharp
// C# 的 switch 支持强大的模式匹配，可以匹配类型、属性、关系等

// 类型模式：根据对象类型执行不同逻辑
object obj = "Hello";
string description = obj switch
{
    int i => $"整数：{i}",           // 类型模式：匹配 int 类型
    string s => $"字符串：{s}",       // 类型模式：匹配 string 类型
    double d => $"浮点数：{d:F2}",
    bool b => $"布尔值：{b}",
    null => "空值",
    _ => "未知类型"
};
Console.WriteLine(description);

// 属性模式：根据对象属性匹配
// 定义一个简单的记录类型
var person = new { Name = "张三", Age = 25, City = "北京" };

string personDesc = person switch
{
    { Age: >= 60 } => "老年人",       // 属性模式：Age >= 60
    { Age: >= 18, City: "北京" } => "北京成年人",
    { Age: >= 18 } => "成年人",
    { Age: < 18 } => "未成年人",
    _ => "未知"
};
Console.WriteLine(personDesc);

// 元组模式：同时匹配多个值
int x = 1, y = 0;
string position = (x, y) switch
{
    (0, 0) => "原点",
    (0, _) => "Y 轴上",       // _ 匹配任意值
    (_, 0) => "X 轴上",
    (> 0, > 0) => "第一象限",
    (< 0, > 0) => "第二象限",
    (< 0, < 0) => "第三象限",
    (> 0, < 0) => "第四象限",
    _ => "未知位置"
};
Console.WriteLine($"({x}, {y}) 在 {position}");
\`\`\`

### 八、when 守卫子句

\`\`\`csharp
// when：在 case 后面添加额外条件
// 只在模式匹配且 when 条件为 true 时才进入该分支

int age = 25;
bool hasLicense = true;

string canDrive = age switch
{
    < 18 => "年龄太小，不能开车",
    >= 18 when hasLicense => "有驾照，可以开车",  // when 添加额外条件
    >= 18 when !hasLicense => "成年但无驾照，不能开车",
    _ => "情况未知"
};
Console.WriteLine(canDrive);

// 传统 switch 语句中的 when
object obj = 100;
switch (obj)
{
    case int i when i > 0:
        Console.WriteLine($"正整数：{i}");
        break;
    case int i when i < 0:
        Console.WriteLine($"负整数：{i}");
        break;
    case int i:
        Console.WriteLine($"零");
        break;
    case string s when s.Length > 10:
        Console.WriteLine($"长字符串（{s.Length} 字符）");
        break;
    case string s:
        Console.WriteLine($"短字符串：{s}");
        break;
    default:
        Console.WriteLine("其他类型");
        break;
}
\`\`\`

| 条件判断方式 | 语法 | 适用场景 |
| --- | --- | --- |
| if/else | \`if (条件) { }\` | 简单条件判断 |
| else if 阶梯 | 多个 if/else 串联 | 多条件互斥判断 |
| 三元运算符 | \`条件 ? 真 : 假\` | 简单的二选一赋值 |
| switch 语句 | \`switch (值) { case ... }\` | 单值多分支（传统风格） |
| switch 表达式 | \`值 switch { ... }\` | 简洁返回值（C# 8+） |
| 模式匹配 | 类型/属性/关系模式 | 复杂条件匹配（C# 7+） |

### 九、小结

| 知识点 | 关键内容 |
| --- | --- |
| if/else | 基本条件判断，条件必须是 bool |
| else if 阶梯 | 多条件互斥，从上到下匹配 |
| 嵌套 if | 多层条件，避免超过 3 层 |
| 三元运算符 | 简洁二选一，是表达式 |
| switch 语句 | 单值多分支，需要 break |
| switch 表达式 | 简洁返回值，C# 8+ |
| 模式匹配 | 类型/属性/关系/元组模式 |
| when 守卫 | case 后附加条件 |

> 条件判断是程序逻辑的核心。下一章我们将学习循环，让代码能重复执行。`,
  },

  // ============================================================
  // 第七章：循环语句
  // ============================================================
  {
    id: 'csharp3-ch07',
    group: '第二部分 控制流',
    icon: '🔁',
    title: '第七章 循环语句',
    content: `## 第七章　循环语句

循环让程序能重复执行一段代码，直到满足条件。本章覆盖 for、while、do-while、foreach 四种循环，以及嵌套循环和性能优化。

### 一、for 循环 ⭐⭐

\`\`\`csharp
// for 循环结构：for (初始化; 条件; 迭代) { 循环体 }
// 三部分可以省略，但分号不能省

// 基本用法：输出 1 到 5
for (int i = 1;     // 初始化：定义一个循环变量 i，初始值为 1
     i <= 5;        // 条件：每次循环前检查，为 true 则继续，false 则退出
     i++)           // 迭代：每次循环结束后执行，i 自增 1
{
    Console.WriteLine($"第 {i} 次循环");
}
// 执行顺序：初始化 → 条件检查 → 循环体 → 迭代 → 条件检查 → ...

// 倒序循环：从 5 到 1
for (int i = 5; i >= 1; i--)
{
    Console.WriteLine($"倒计时：{i}");
}
Console.WriteLine("发射！");

// 步长不为 1：输出 0, 2, 4, 6, 8, 10
for (int i = 0; i <= 10; i += 2)  // 每次加 2
{
    Console.Write($"{i} ");
}
Console.WriteLine();

// 多个变量：同时控制两个变量
for (int i = 0, j = 10; i < j; i++, j--)
{
    Console.WriteLine($"i={i}, j={j}");
}

// 实际场景：计算 1+2+...+100
int sum = 0;  // 累加器，初始为 0
for (int i = 1; i <= 100; i++)
{
    sum += i;  // 等价于 sum = sum + i
}
Console.WriteLine($"1 到 100 的和 = {sum}");  // 5050
\`\`\`

### 二、while 循环 ⭐⭐

\`\`\`csharp
// while 循环：先检查条件，再执行循环体
// 适合"不知道循环次数，但知道终止条件"的场景

// 基本用法：输出 1 到 5
int i = 1;            // 在循环外初始化
while (i <= 5)        // 每次循环前检查条件
{
    Console.WriteLine($"while 循环第 {i} 次");
    i++;              // 在循环体内更新变量
}

// 实际场景：用户输入验证，一直询问直到输入正确
string? input;
int number;
do
{
    Console.Write("请输入一个 1-100 之间的整数：");
    input = Console.ReadLine();
} while (input == null || !int.TryParse(input, out number) || number < 1 || number > 100);
Console.WriteLine($"你输入了：{number}");

// 实际场景：猜数字游戏
int target = 42;  // 目标数字
int guess = 0;
int attempts = 0;

Console.WriteLine("猜数字游戏：1-100 之间");
while (guess != target)
{
    attempts++;
    Console.Write($"第 {attempts} 次猜测：");
    string? guessStr = Console.ReadLine();
    if (int.TryParse(guessStr, out guess))
    {
        if (guess > target)
            Console.WriteLine("太大了！");
        else if (guess < target)
            Console.WriteLine("太小了！");
    }
}
Console.WriteLine($"恭喜！你用了 {attempts} 次猜对了！");
\`\`\`

### 三、do-while 循环

\`\`\`csharp
// do-while：先执行循环体，再检查条件
// 与 while 的区别：do-while 至少执行一次循环体

// 基本用法
int i = 1;
do
{
    Console.WriteLine($"do-while 第 {i} 次");
    i++;
} while (i <= 5);  // 注意：这里有分号！

// 对比 while 和 do-while
// while：可能一次都不执行（条件一开始就为 false）
int count = 0;
while (count > 0)  // 条件为 false，循环体不执行
{
    Console.WriteLine("while 不会执行");
}

// do-while：至少执行一次
count = 0;
do
{
    Console.WriteLine("do-while 至少执行一次");  // 会输出
} while (count > 0);  // 条件为 false，但循环体已经执行了一次

// 实际场景：菜单循环（至少显示一次菜单）
string? choice;
do
{
    Console.Clear();
    Console.WriteLine("========== 主菜单 ==========");
    Console.WriteLine("1. 查看余额");
    Console.WriteLine("2. 存款");
    Console.WriteLine("3. 取款");
    Console.WriteLine("4. 退出");
    Console.Write("请选择：");
    choice = Console.ReadLine();

    switch (choice)
    {
        case "1":
            Console.WriteLine("余额：¥1000.00");
            break;
        case "2":
            Console.WriteLine("存款操作");
            break;
        case "3":
            Console.WriteLine("取款操作");
            break;
        case "4":
            Console.WriteLine("感谢使用，再见！");
            break;
        default:
            Console.WriteLine("无效选择");
            break;
    }

    if (choice != "4")
    {
        Console.WriteLine("按任意键继续...");
        Console.ReadKey(true);
    }
} while (choice != "4");
\`\`\`

### 四、foreach 循环 ⭐⭐

\`\`\`csharp
// foreach：遍历集合/数组中的每个元素
// 最简单、最安全的遍历方式，不会越界

// 遍历数组
int[] numbers = { 10, 20, 30, 40, 50 };
foreach (int num in numbers)  // 依次取出数组中每个元素赋给 num
{
    Console.WriteLine($"当前元素：{num}");
}

// 遍历字符串（字符串是字符集合）
string text = "Hello C#";
foreach (char c in text)  // 依次取出每个字符
{
    Console.Write($"{c} ");  // H e l l o   C #
}
Console.WriteLine();

// 遍历列表
var names = new List<string> { "张三", "李四", "王五", "赵六" };
foreach (string name in names)
{
    Console.WriteLine($"欢迎，{name}！");
}

// ⚠️ foreach 中不能修改集合元素
// 但可以修改引用类型元素的属性
var people = new List<Person>
{
    new Person("张三", 20),
    new Person("李四", 25)
};
foreach (var p in people)
{
    p.Age++;  // 可以修改元素的属性（引用类型）
    Console.WriteLine($"{p.Name} 明年 {p.Age} 岁");
}

// 辅助类型定义
record Person(string Name, int Age);
\`\`\`

### 五、嵌套循环

\`\`\`csharp
// 循环里面套循环：外层每执行一次，内层执行完整一轮
// 常用于处理二维数据、排列组合等

// 乘法口诀表（9x9）
Console.WriteLine("========== 九九乘法表 ==========");
for (int i = 1; i <= 9; i++)        // 外层：控制行（被乘数）
{
    for (int j = 1; j <= i; j++)    // 内层：控制列（乘数）
    {
        Console.Write($"{j}×{i}={i * j,2}  ");  // {i*j,2} 右对齐 2 位
    }
    Console.WriteLine();  // 每行结束后换行
}

// 三角形图案
Console.WriteLine("\\n========== 星号三角形 ==========");
int rows = 5;
for (int i = 1; i <= rows; i++)     // 外层：控制行数
{
    // 内层1：打印空格（左对齐形成三角形）
    for (int j = 1; j <= rows - i; j++)
    {
        Console.Write(" ");
    }
    // 内层2：打印星号
    for (int k = 1; k <= 2 * i - 1; k++)
    {
        Console.Write("*");
    }
    Console.WriteLine();
}

// 实际场景：遍历二维数组
int[,] matrix = {
    { 1, 2, 3 },
    { 4, 5, 6 },
    { 7, 8, 9 }
};
for (int i = 0; i < matrix.GetLength(0); i++)      // 外层：行
{
    for (int j = 0; j < matrix.GetLength(1); j++)  // 内层：列
    {
        Console.Write($"{matrix[i, j],3}");  // 每个元素占 3 位
    }
    Console.WriteLine();
}
\`\`\`

### 六、循环控制流

\`\`\`csharp
// break：立即退出循环
for (int i = 1; i <= 10; i++)
{
    if (i == 5)
    {
        Console.WriteLine("遇到 5，退出循环");
        break;  // 立即跳出循环，不再执行后续迭代
    }
    Console.WriteLine(i);
}
// 输出：1 2 3 4 遇到 5，退出循环

// continue：跳过本次循环剩余代码，进入下一次迭代
for (int i = 1; i <= 10; i++)
{
    if (i % 2 == 0)  // 如果是偶数
    {
        continue;  // 跳过 Console.WriteLine，进入下一次循环
    }
    Console.WriteLine(i);  // 只输出奇数：1 3 5 7 9
}

// 实际场景：查找第一个满足条件的元素
int[] scores = { 55, 72, 48, 95, 63, 88 };
int firstHighScore = -1;
foreach (int s in scores)
{
    if (s >= 90)
    {
        firstHighScore = s;
        break;  // 找到第一个高分就停止，不需要继续遍历
    }
}
Console.WriteLine($"第一个 90 分以上的成绩：{firstHighScore}");
\`\`\`

### 七、循环性能提示

\`\`\`csharp
// 1. 减少循环内的重复计算
// 不好的写法：每次循环都计算 array.Length
int[] array = new int[1000];
for (int i = 0; i < array.Length; i++)  // Length 每次都要读取
{
    array[i] = i;
}

// 好的写法：提前缓存长度
int len = array.Length;  // 只计算一次
for (int i = 0; i < len; i++)
{
    array[i] = i;
}

// 2. 避免在循环内创建大量临时对象
// 不好的写法
for (int i = 0; i < 10000; i++)
{
    string s = $"Item {i}";  // 每次循环创建新字符串
}

// 好的写法：用 StringBuilder
var sb = new System.Text.StringBuilder();
for (int i = 0; i < 10000; i++)
{
    sb.Append("Item ").Append(i);
}
string result = sb.ToString();

// 3. 选择合适的循环类型
// foreach：最简单、最安全，推荐用于遍历集合
// for：需要索引操作时使用
// while：循环次数不确定时使用
\`\`\`

| 循环类型 | 语法 | 适用场景 | 特点 |
| --- | --- | --- | --- |
| \`for\` | \`for(初始化;条件;迭代)\` | 循环次数确定 | 紧凑，索引可控 |
| \`while\` | \`while(条件)\` | 循环次数不确定 | 先判断后执行 |
| \`do-while\` | \`do{ }while(条件);\` | 至少执行一次 | 先执行后判断 |
| \`foreach\` | \`foreach(var x in 集合)\` | 遍历集合/数组 | 简洁安全 |

### 八、小结

| 知识点 | 关键内容 |
| --- | --- |
| for 循环 | 初始化/条件/迭代，适合已知次数 |
| while 循环 | 先判断后执行，适合未知次数 |
| do-while | 先执行后判断，至少执行一次 |
| foreach | 遍历集合，最简单安全 |
| 嵌套循环 | 外层行内层列，多维数据处理 |
| break | 立即退出循环 |
| continue | 跳过本次，进入下一次迭代 |
| 性能 | 缓存长度、避免循环内创建对象 |

> 循环是编程中最常用的结构之一。下一章我们深入跳转语句，学习 break、continue、return、goto 的更多用法。`,
  },

  // ============================================================
  // 第八章：跳转语句
  // ============================================================
  {
    id: 'csharp3-ch08',
    group: '第二部分 控制流',
    icon: '↗️',
    title: '第八章 跳转语句',
    content: `## 第八章　跳转语句

跳转语句改变程序执行流程，让代码可以从一个位置"跳"到另一个位置。本章涵盖 break、continue、return、goto 以及提前退出模式。

### 一、break 语句 ⭐

\`\`\`csharp
// break：立即退出当前循环或 switch 语句
// 用在循环中：退出循环
// 用在 switch 中：退出 switch 块

// 场景1：在找到目标后立即退出循环
int[] numbers = { 3, 7, 12, 8, 15, 9, 21 };
int target = 15;
bool found = false;

for (int i = 0; i < numbers.Length; i++)
{
    Console.WriteLine($"正在检查索引 {i}：{numbers[i]}");
    if (numbers[i] == target)
    {
        Console.WriteLine($"找到了！目标 {target} 在索引 {i} 处");
        found = true;
        break;  // 找到后立即退出循环，不再检查后续元素
    }
}
if (!found)
    Console.WriteLine($"未找到目标 {target}");

// 场景2：break 只退出最内层循环
for (int i = 1; i <= 3; i++)
{
    Console.WriteLine($"外层循环 i={i}");
    for (int j = 1; j <= 3; j++)
    {
        if (j == 2)
        {
            Console.WriteLine("  内层 break！");
            break;  // 只退出内层循环，外层继续
        }
        Console.WriteLine($"  内层循环 j={j}");
    }
}
// 输出：
// 外层循环 i=1
//   内层循环 j=1
//   内层 break！
// 外层循环 i=2
//   内层循环 j=1
//   内层 break！
\`\`\`

### 二、continue 语句 ⭐

\`\`\`csharp
// continue：跳过当前循环迭代的剩余代码，立即进入下一次迭代
// 与 break 不同，continue 不会退出循环，只跳过当前这一次

// 场景1：跳过不需要处理的元素
Console.WriteLine("输出 1-20 中的奇数（跳过偶数）：");
for (int i = 1; i <= 20; i++)
{
    if (i % 2 == 0)  // 如果是偶数
    {
        continue;  // 跳过，不输出
    }
    Console.Write($"{i} ");  // 只输出奇数
}
Console.WriteLine();

// 场景2：数据过滤处理
string[] names = { "张三", "", "李四", "  ", "王五", null, "赵六" };
int validCount = 0;
foreach (string? name in names)
{
    if (string.IsNullOrWhiteSpace(name))  // 跳过空值和空白
    {
        continue;  // 不处理空名字
    }
    validCount++;
    Console.WriteLine($"处理用户：{name.Trim()}");  // 处理有效名字
}
Console.WriteLine($"有效用户数：{validCount}");

// 场景3：while 循环中使用 continue
// ⚠️ 注意：continue 在 while 中要确保迭代变量被更新，否则会死循环
int i = 0;
while (i < 10)
{
    i++;  // 迭代变量必须在 continue 之前更新
    if (i % 3 == 0)
    {
        continue;  // 跳过 3 的倍数
    }
    Console.Write($"{i} ");  // 输出：1 2 4 5 7 8 10
}
\`\`\`

### 三、return 语句 ⭐⭐

\`\`\`csharp
// return：从方法中返回，并可选择返回值
// 在顶级语句中，return 会结束程序

// 场景1：void 方法中提前返回
void ProcessOrder(int quantity)
{
    if (quantity <= 0)
    {
        Console.WriteLine("订单数量无效，取消处理");
        return;  // 提前返回，不执行后续代码
    }
    if (quantity > 100)
    {
        Console.WriteLine("订单数量过大，需要审核");
        return;
    }
    // 正常处理逻辑
    Console.WriteLine($"正在处理 {quantity} 件商品...");
    Console.WriteLine("订单处理完成");
}

ProcessOrder(0);    // 数量无效，提前返回
ProcessOrder(5);    // 正常处理
ProcessOrder(200);  // 数量过大，提前返回

// 场景2：有返回值的方法
double CalculateDiscount(double price, bool isVIP)
{
    if (price <= 0)
    {
        return 0;  // 无效价格，返回 0
    }

    if (isVIP)
    {
        return price * 0.8;  // VIP 打 8 折
    }

    return price * 0.95;  // 普通用户打 95 折
}

Console.WriteLine($"VIP 折扣价：{CalculateDiscount(100, true):C}");
Console.WriteLine($"普通折扣价：{CalculateDiscount(100, false):C}");

// 场景3：三元运算符风格简化
string GetGrade(int score)
{
    if (score < 0 || score > 100)
        return "无效分数";  // 提前返回处理异常输入

    return score >= 90 ? "A" : score >= 80 ? "B" : score >= 60 ? "C" : "D";
}

Console.WriteLine(GetGrade(85));   // B
Console.WriteLine(GetGrade(-10));  // 无效分数
\`\`\`

### 四、goto 语句

\`\`\`csharp
// goto：跳转到指定标签位置
// ⚠️ goto 通常被认为是不良实践，但某些场景下很有用
// 如：跳出多层嵌套循环、switch case 贯穿（C# 中不推荐）

// 场景1：跳出多层嵌套循环（goto 的合法用途）
for (int i = 1; i <= 5; i++)
{
    for (int j = 1; j <= 5; j++)
    {
        for (int k = 1; k <= 5; k++)
        {
            if (i * j * k > 100)
            {
                Console.WriteLine($"找到：i={i}, j={j}, k={k}, 乘积={i * j * k}");
                goto ExitAllLoops;  // 直接跳出所有循环
            }
        }
    }
}
ExitAllLoops:  // 标签定义（后面跟冒号）
Console.WriteLine("已退出所有循环");

// 场景2：switch 中的 goto case（贯穿到另一个 case）
int option = 1;
switch (option)
{
    case 1:
        Console.WriteLine("选项 1：执行初始化");
        goto case 3;  // 跳转到 case 3 继续执行
    case 2:
        Console.WriteLine("选项 2：执行配置");
        break;
    case 3:
        Console.WriteLine("选项 3：执行启动");
        break;
    default:
        Console.WriteLine("未知选项");
        break;
}
// 输出：
// 选项 1：执行初始化
// 选项 3：执行启动

// ⚠️ goto 使用原则：
// 1. 不要用 goto 代替正常流程控制（if/while/for）
// 2. 跳出多层嵌套循环是可以接受的用法
// 3. 大多数情况下，重构代码比用 goto 更好
\`\`\`

### 五、提前退出模式（Early Return）

\`\`\`csharp
// 提前退出（Early Return / Guard Clause）：
// 先处理异常情况并返回，减少嵌套层级
// 这是推荐的编码模式，比深层嵌套更清晰

// ❌ 不好的写法：深层嵌套
string GetAccessLevel_Bad(string user, bool isLoggedIn, bool isVIP, bool isAdmin)
{
    string level;
    if (isLoggedIn)
    {
        if (isAdmin)
        {
            level = "管理员";
        }
        else
        {
            if (isVIP)
            {
                level = "VIP 用户";
            }
            else
            {
                level = "普通用户";
            }
        }
    }
    else
    {
        level = "游客";
    }
    return level;
}

// ✅ 好的写法：提前退出，减少嵌套
string GetAccessLevel_Good(string user, bool isLoggedIn, bool isVIP, bool isAdmin)
{
    if (!isLoggedIn)
        return "游客";  // 提前返回，不需要 else

    if (isAdmin)
        return "管理员";  // 提前返回

    if (isVIP)
        return "VIP 用户";  // 提前返回

    return "普通用户";  // 默认情况
}

// 实际场景：输入验证
void SaveUser(string? name, int? age, string? email)
{
    // 所有验证都用提前返回，代码清晰
    if (string.IsNullOrWhiteSpace(name))
    {
        Console.WriteLine("错误：姓名不能为空");
        return;
    }

    if (age == null || age < 0 || age > 150)
    {
        Console.WriteLine("错误：年龄无效");
        return;
    }

    if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
    {
        Console.WriteLine("错误：邮箱格式无效");
        return;
    }

    // 所有验证通过，执行保存
    Console.WriteLine($"保存用户：{name}, {age}岁, {email}");
    Console.WriteLine("保存成功！");
}

SaveUser("张三", 25, "zhangsan@example.com");  // 成功
SaveUser("", 25, "test@test.com");              // 姓名无效
SaveUser("李四", -1, "test@test.com");          // 年龄无效
\`\`\`

### 六、小结

| 跳转语句 | 作用 | 使用场景 |
| --- | --- | --- |
| \`break\` | 退出循环或 switch | 找到目标、提前终止 |
| \`continue\` | 跳过本次迭代 | 过滤不需要的元素 |
| \`return\` | 退出方法 | 提前返回、异常处理 |
| \`goto\` | 跳转到标签 | 跳出多层循环（慎用） |
| Early Return | 提前退出模式 | 减少嵌套、提高可读性 |

> 跳转语句让程序流程控制更加灵活。下一章我们将学习数组——C# 中最基本的数据结构。`,
  },

  // ============================================================
  // 第九章：数组基础
  // ============================================================
  {
    id: 'csharp3-ch09',
    group: '第二部分 控制流',
    icon: '📊',
    title: '第九章 数组基础',
    content: `## 第九章　数组基础

数组是存储相同类型元素的固定大小集合。本章涵盖一维数组的声明、初始化、访问、遍历、常用方法、多维数组和交错数组。

### 一、数组声明与初始化 ⭐

\`\`\`csharp
// 方式1：声明后逐个赋值
int[] numbers1 = new int[5];  // 创建长度为 5 的整数数组，默认值都是 0
numbers1[0] = 10;  // 第一个元素（索引从 0 开始）
numbers1[1] = 20;
numbers1[2] = 30;
numbers1[3] = 40;
numbers1[4] = 50;

// 方式2：声明时用集合初始化器
int[] numbers2 = new int[] { 10, 20, 30, 40, 50 };  // 显式指定类型和长度

// 方式3：简化写法（最常用）
int[] numbers3 = { 10, 20, 30, 40, 50 };  // 编译器自动推断类型和长度

// 方式4：var 推断
var numbers4 = new[] { 10, 20, 30, 40, 50 };  // 编译器推断为 int[]

// 方式5：默认值初始化
int[] zeros = new int[100];  // 100 个元素，都是 0
bool[] flags = new bool[10];  // 10 个元素，都是 false
string[] names = new string[5];  // 5 个元素，都是 null

// 特殊：空数组
int[] empty = Array.Empty<int>();  // 推荐方式
int[] empty2 = new int[0];         // 也合法
int[] empty3 = { };                // C# 12 集合表达式
\`\`\`

### 二、访问数组元素

\`\`\`csharp
// 通过索引访问元素：数组名[索引]
// 索引从 0 开始，最后一个元素的索引是 Length - 1
int[] scores = { 85, 92, 78, 95, 88 };

// 读取元素
int first = scores[0];    // 第一个元素：85
int last = scores[4];     // 最后一个元素：88（索引 = 5 - 1 = 4）
Console.WriteLine($"第一个：{first}，最后一个：{last}");

// 修改元素
scores[2] = 80;           // 将第三个元素（索引 2）从 78 改为 80
Console.WriteLine($"修改后：{scores[2]}");

// 获取数组长度
Console.WriteLine($"数组长度：{scores.Length}");  // 5

// 获取最后一个元素（通用方式）
int lastElement = scores[scores.Length - 1];  // 使用 Length - 1 获取最后一个
Console.WriteLine($"最后一个：{lastElement}");

// 索引变量
for (int i = 0; i < scores.Length; i++)
{
    Console.WriteLine($"scores[{i}] = {scores[i]}");
}

// ⚠️ 索引越界会抛出 IndexOutOfRangeException
// scores[10] = 100;  // 编译通过但运行时崩溃！索引超出范围
\`\`\`

### 三、使用 foreach 遍历数组 ⭐

\`\`\`csharp
int[] numbers = { 10, 20, 30, 40, 50 };

// foreach：最简单的遍历方式，不会越界
foreach (int num in numbers)  // 依次取出每个元素
{
    Console.WriteLine($"元素值：{num}");
}

// 综合示例：计算平均值
int[] scores = { 85, 92, 78, 95, 88 };
int sum = 0;
foreach (int score in scores)
{
    sum += score;  // 累加每个分数
}
double average = (double)sum / scores.Length;  // 注意转为 double 避免整数除法
Console.WriteLine($"总分：{sum}，平均分：{average:F1}");

// foreach vs for 选择
// foreach：不需要索引时用，简洁安全
// for：需要索引、需要修改元素时用

// 示例：用 for 遍历并修改元素
for (int i = 0; i < scores.Length; i++)
{
    scores[i] += 5;  // 每人加 5 分（foreach 不能这样做）
    Console.WriteLine($"调整后 scores[{i}] = {scores[i]}");
}
\`\`\`

### 四、数组常用方法 ⭐⭐

\`\`\`csharp
int[] numbers = { 5, 2, 8, 1, 9, 3, 7 };

// --- Array.Sort()：对数组排序（原地排序，修改原数组）---
Array.Sort(numbers);  // 升序排序
Console.WriteLine($"排序后：{string.Join(", ", numbers)}");  // 1, 2, 3, 5, 7, 8, 9

// --- Array.Reverse()：反转数组 ---
Array.Reverse(numbers);  // 反转为降序
Console.WriteLine($"反转后：{string.Join(", ", numbers)}");  // 9, 8, 7, 5, 3, 2, 1

// --- Array.IndexOf()：查找元素首次出现的位置 ---
int[] data = { 10, 20, 30, 20, 40 };
int index = Array.IndexOf(data, 20);  // 查找 20 首次出现的位置
Console.WriteLine($"20 首次出现在索引 {index}");  // 1
int lastIndex = Array.LastIndexOf(data, 20);  // 查找最后一次出现的位置
Console.WriteLine($"20 最后出现在索引 {lastIndex}");  // 3

// 未找到返回 -1
int notFound = Array.IndexOf(data, 999);
Console.WriteLine($"999 的索引：{notFound}");  // -1

// --- Array.Copy()：复制数组 ---
int[] source = { 1, 2, 3, 4, 5 };
int[] dest = new int[5];
Array.Copy(source, dest, source.Length);  // 复制全部元素
Console.WriteLine($"复制后：{string.Join(", ", dest)}");

// 部分复制
int[] partial = new int[3];
Array.Copy(source, 1, partial, 0, 3);  // 从 source[1] 复制 3 个到 partial[0]
Console.WriteLine($"部分复制：{string.Join(", ", partial)}");  // 2, 3, 4

// --- Array.Resize()：调整数组大小 ---
int[] arr = { 1, 2, 3 };
Array.Resize(ref arr, 5);  // 扩大到 5，新元素为默认值 0
Console.WriteLine($"扩容后：{string.Join(", ", arr)}");  // 1, 2, 3, 0, 0

Array.Resize(ref arr, 2);  // 缩小到 2，截断多余元素
Console.WriteLine($"缩容后：{string.Join(", ", arr)}");  // 1, 2

// --- Array.Find() / FindAll()：条件查找 ---
int[] values = { 10, 25, 30, 45, 50, 65, 70 };

// Find：查找第一个满足条件的元素
int firstEven = Array.Find(values, x => x % 2 == 0);  // 查找第一个偶数
Console.WriteLine($"第一个偶数：{firstEven}");  // 10

// FindAll：查找所有满足条件的元素
int[] allBig = Array.FindAll(values, x => x > 30);  // 查找所有大于 30 的数
Console.WriteLine($"大于 30：{string.Join(", ", allBig)}");  // 45, 50, 65, 70

// FindIndex：查找第一个满足条件的索引
int idx = Array.FindIndex(values, x => x > 50);  // 第一个大于 50 的索引
Console.WriteLine($"第一个大于 50 的索引：{idx}");  // 5

// --- Array.ForEach()：对每个元素执行操作 ---
Array.ForEach(values, x => Console.Write($"{x * 2} "));  // 每个元素乘以 2 输出
Console.WriteLine();

// --- Array.Clear()：清空数组 ---
int[] clearArr = { 1, 2, 3, 4, 5 };
Array.Clear(clearArr, 1, 3);  // 从索引 1 开始清除 3 个元素为默认值
Console.WriteLine($"清除后：{string.Join(", ", clearArr)}");  // 1, 0, 0, 0, 5
\`\`\`

### 五、多维数组

\`\`\`csharp
// 二维数组：矩阵/表格数据
// 声明：类型[,] 数组名 = new 类型[行数, 列数]

// 初始化二维数组
int[,] matrix = new int[3, 4]  // 3 行 4 列
{
    { 1, 2, 3, 4 },
    { 5, 6, 7, 8 },
    { 9, 10, 11, 12 }
};

// 简化写法
int[,] matrix2 = {
    { 1, 2, 3 },
    { 4, 5, 6 },
    { 7, 8, 9 }
};

// 访问元素：[行索引, 列索引]
Console.WriteLine($"第 2 行第 3 列：{matrix2[1, 2]}");  // 6

// 获取维度大小
int rows = matrix2.GetLength(0);  // 行数：3
int cols = matrix2.GetLength(1);  // 列数：3
Console.WriteLine($"矩阵大小：{rows} × {cols}");

// 遍历二维数组
Console.WriteLine("遍历矩阵：");
for (int i = 0; i < matrix2.GetLength(0); i++)       // 遍历行
{
    for (int j = 0; j < matrix2.GetLength(1); j++)   // 遍历列
    {
        Console.Write($"{matrix2[i, j],4}");  // 每个元素占 4 位
    }
    Console.WriteLine();
}

// 三维数组
int[,,] cube = new int[2, 3, 4];  // 2 层 × 3 行 × 4 列
cube[0, 0, 0] = 1;  // 第一层第一行第一列
Console.WriteLine($"三维数组总元素数：{cube.Length}");  // 2*3*4 = 24
\`\`\`

### 六、交错数组（数组的数组）

\`\`\`csharp
// 交错数组：每个元素本身是一个数组，各行的长度可以不同
// 声明：类型[][] 数组名 = new 类型[行数][]

// 创建交错数组
int[][] jagged = new int[3][];  // 3 行的交错数组
jagged[0] = new int[] { 1, 2, 3 };       // 第 1 行有 3 个元素
jagged[1] = new int[] { 4, 5 };          // 第 2 行有 2 个元素
jagged[2] = new int[] { 6, 7, 8, 9 };    // 第 3 行有 4 个元素

// 简写初始化
int[][] jagged2 = {
    new int[] { 1, 2, 3 },
    new int[] { 4, 5 },
    new int[] { 6, 7, 8, 9 }
};

// 访问元素：[行索引][列索引]
Console.WriteLine($"jagged[0][1] = {jagged[0][1]}");  // 2
Console.WriteLine($"jagged[2][3] = {jagged[2][3]}");  // 9

// 遍历交错数组
for (int i = 0; i < jagged.Length; i++)  // 遍历行
{
    Console.Write($"第 {i} 行：");
    for (int j = 0; j < jagged[i].Length; j++)  // 遍历每行的列
    {
        Console.Write($"{jagged[i][j]} ");
    }
    Console.WriteLine();
}

// 实际场景：存储不同长度的学生成绩
int[][] studentScores = {
    new int[] { 85, 90, 88 },           // 学生 1 有 3 门课成绩
    new int[] { 92, 95, 89, 91 },       // 学生 2 有 4 门课成绩
    new int[] { 78, 82 },               // 学生 3 有 2 门课成绩
    new int[] { 95, 88, 92, 96, 90 }    // 学生 4 有 5 门课成绩
};

for (int i = 0; i < studentScores.Length; i++)
{
    double avg = studentScores[i].Average();  // LINQ 求平均
    Console.WriteLine($"学生 {i + 1} 平均分：{avg:F1}");
}
\`\`\`

### 七、数组索引与范围（C# 8+）⭐

\`\`\`csharp
// 索引（Index）：^ 运算符，从末尾开始计数
// ^1 表示最后一个元素，^2 表示倒数第二个
int[] numbers = { 10, 20, 30, 40, 50 };

// 末尾索引
Console.WriteLine($"最后一个：{numbers[^1]}");  // 50（等价于 numbers[4]）
Console.WriteLine($"倒数第二个：{numbers[^2]}");  // 40（等价于 numbers[3]）

// 范围（Range）：.. 运算符，获取子数组
// 语法：数组[起始..结束]，左闭右开[start, end)
int[] slice1 = numbers[1..4];    // 索引 1, 2, 3 → {20, 30, 40}
Console.WriteLine($"切片 1..4：{string.Join(", ", slice1)}");

int[] slice2 = numbers[..3];     // 从开头到索引 3（不含）→ {10, 20, 30}
Console.WriteLine($"切片 ..3：{string.Join(", ", slice2)}");

int[] slice3 = numbers[2..];     // 从索引 2 到末尾 → {30, 40, 50}
Console.WriteLine($"切片 2..：{string.Join(", ", slice3)}");

int[] slice4 = numbers[..];      // 全部元素 → {10, 20, 30, 40, 50}
Console.WriteLine($"切片 ..：{string.Join(", ", slice4)}");

// 结合末尾索引
int[] slice5 = numbers[^3..^0];  // 倒数第 3 到末尾 → {30, 40, 50}
Console.WriteLine($"切片 ^3..^0：{string.Join(", ", slice5)}");

// 实际场景：获取前 N 个元素
int[] top3 = numbers[..3];  // 前 3 个
Console.WriteLine($"前 3 个：{string.Join(", ", top3)}");

// 实际场景：去掉首尾元素
int[] middle = numbers[1..^1];  // 去掉第一个和最后一个
Console.WriteLine($"去掉首尾：{string.Join(", ", middle)}");
\`\`\`

### 八、数组边界与安全

\`\`\`csharp
// 数组边界检查
int[] arr = { 1, 2, 3, 4, 5 };

// 安全访问：先检查索引
int index = 10;
if (index >= 0 && index < arr.Length)
{
    Console.WriteLine($"安全访问：{arr[index]}");
}
else
{
    Console.WriteLine($"索引 {index} 超出范围（0-{arr.Length - 1}）");
}

// 使用 ElementAtOrDefault 安全访问（需要 LINQ）
// using System.Linq;
int safe = arr.ElementAtOrDefault(10);  // 越界返回 0（默认值），不抛异常
Console.WriteLine($"安全访问结果：{safe}");

// 多维数组的边界
int[,] matrix = { { 1, 2 }, { 3, 4 }, { 5, 6 } };
Console.WriteLine($"Rank（维度数）：{matrix.Rank}");         // 2
Console.WriteLine($"总长度：{matrix.Length}");               // 6
Console.WriteLine($"第 0 维长度：{matrix.GetLength(0)}");    // 3 行
Console.WriteLine($"第 1 维长度：{matrix.GetLength(1)}");    // 2 列
Console.WriteLine($"下界：{matrix.GetLowerBound(0)}");       // 0（默认从 0 开始）
Console.WriteLine($"上界：{matrix.GetUpperBound(0)}");       // 2
\`\`\`

### 九、小结

| 知识点 | 关键内容 |
| --- | --- |
| 数组声明 | new int[n]、初始化器语法 |
| 访问元素 | 数组名[索引]，索引从 0 开始 |
| 遍历 | for（需要索引）、foreach（简洁） |
| 常用方法 | Sort、Reverse、IndexOf、Copy、Resize、Find |
| 多维数组 | int[,] 矩阵，GetLength() 获取维度 |
| 交错数组 | int[][] 数组的数组，各行长度可不同 |
| 索引与范围 | ^ 末尾索引、.. 范围切片（C# 8+） |
| 边界安全 | Length 检查、ElementAtOrDefault |

> 数组是最基础的数据结构。下一章我们将进入第三部分——方法与函数，学习如何组织和复用代码。`,
  },
];

export { chapters };