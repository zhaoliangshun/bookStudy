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
// 定义一个考试分数变量，用于演示条件判断
int score = 75;

// if 是程序决策的起点：只有括号内条件为 true 时才会执行大括号内代码
// 为什么用大括号？即使只有一行代码也建议加，避免后续添加语句时出错
if (score >= 60)
{
    Console.WriteLine("及格了");  // 条件成立时输出
}

// 没有 else 的 if：条件为 false 时直接跳过，不执行任何操作
// 这在"只关心成功场景，失败什么都不做"时有用，比如日志记录
if (score >= 90)
{
    Console.WriteLine("优秀");  // 75 < 90，这行不会执行
}
\`\`\`

> ⭐ \`if\` 条件必须是 \`bool\` 类型，C# 不允许像 C/C++ 那样写 \`if (score)\`（隐式转 bool），必须写 \`if (score != 0)\`。这是 C# 的安全设计，避免把赋值当判断（\`if (x = 5)\` 会编译错）。

### 二、if-else if-else 链 ⭐

多个互斥分支用 \`else if\` 串联，从上到下匹配，命中一个就跳出：

\`\`\`csharp
int score = 82;

// else if 是"互斥分支"：一旦前面的条件命中，后面的分支直接跳过不判断
// 为什么要这样设计？避免重复判断、保证逻辑互斥（一个分数不可能既是优秀又是良好）
if (score >= 90)
{
    Console.WriteLine("优秀");
}
else if (score >= 80)
{
    Console.WriteLine("良好");  // 82 >= 80 命中这里，后面的 else if 不再检查
}
else if (score >= 60)
{
    Console.WriteLine("及格");
}
else
{
    // else 兜底：前面所有条件都不满足时才执行，保证总有分支处理
    Console.WriteLine("不及格");
}

// ⚠️ 顺序很重要：条件要"从严到宽"排列
// 为什么？如果先写 if (score >= 60)，82分第一步就命中，永远到不了 >= 80 的分支
\`\`\`

> ⭐ **分支顺序**：互斥条件从严到宽排列。如果先写 \`>= 60\`，\`82\` 会被它命中，永远到不了 \`>= 80\`。

### 三、嵌套 if

\`if\` 内部可以再嵌 \`if\`，但**层级太深会很难读**，超过 3 层建议改用 \`switch\` 或提前 return：

\`\`\`csharp
// 三个条件组合：是否VIP、是否成年、订单金额
bool isVip = true;
int age = 22;
double amount = 350.0;

// 嵌套 if：逐层判断，每层过滤掉一批不符合的情况
// 第一层先判断身份（VIP/非VIP），身份不同折扣体系完全不同
if (isVip)
{
    // 第二层判断年龄：未成年即使是VIP也不能下单（合规要求）
    if (age >= 18)
    {
        // 第三层判断金额：大额订单折扣力度更大
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

> 嵌套超过 3 层可读性急剧下降，能用 \`&&\` 合并就合并：\`if (isVip && age >= 18 && amount >= 300)\`。为什么？合并后逻辑一目了然，不用逐层缩进。

### 四、switch 语句：多分支等值匹配 ⭐

当条件是"变量等于某值"时，\`switch\` 比 \`if-else if\` 更清晰：

\`\`\`csharp
// 用 1-7 代表周一到周日，这是常见的编码约定
int dayOfWeek = 3;

// switch 专门处理"一个变量 vs 多个常量值"的场景
// 为什么不用 if-else if？多个 == 判断写起来啰嗦，switch 语义更清晰
switch (dayOfWeek)
{
    case 1:
        Console.WriteLine("周一：开例会");
        break;  // 每个 case 必须以 break/return/goto 结束，C# 不支持隐式贯穿
    case 2:
    case 3:
    case 4:
        // 多个 case 标签共享同一个代码块：周二、三、四都是工作日
        // 为什么允许这样？避免写三遍重复代码，这是C#对"贯穿"的唯一合法支持
        Console.WriteLine("工作日：写代码");
        break;
    case 5:
        Console.WriteLine("周五：准备周末");
        break;
    case 6:
    case 7:
        Console.WriteLine("周末：休息");
        break;
    default:
        // default 是兜底分支，类似 else
        // 为什么建议总是写 default？处理非法输入，避免遗漏情况导致程序无响应
        Console.WriteLine("非法日期");
        break;
}
\`\`\`

> ⭐ C# 的 \`switch\` **不支持隐式贯穿**——每个 \`case\` 必须以 \`break\`/\`return\`/\`goto\` 结束。为什么？C/C++ 里忘记 break 导致的bug太常见了，C#从语言层面禁止了这个坑。多个标签共享代码体是允许的（如上面的 case 2/3/4）。

### 五、switch 表达式（C# 8+）⭐

C# 8 引入的 **switch 表达式**把分支写成"输入 → 输出"的映射，比 \`switch\` 语句更紧凑：

\`\`\`csharp
int dayOfWeek = 3;

// switch 表达式是"表达式"不是"语句"：它直接返回一个值，可以赋值给变量
// 为什么用 switch 表达式？纯映射场景（输入→输出）代码量减半，没有 break 噪音
string dayType = dayOfWeek switch
{
    1 or 2 or 3 or 4 or 5 => "工作日",  // or 模式组合：匹配任意一个即可
    6 or 7 => "周末",
    _ => "非法日期"   // _ 弃元模式：匹配所有，等价于 default，必须放最后
};

Console.WriteLine($">{dayOfWeek} 是 {dayType}");  // 输出结果验证

// 用 switch 表达式做计算：折扣策略映射
// 为什么用 switch 表达式？策略表一目了然，新增折扣只需要加一行
double discount = dayOfWeek switch
{
    6 or 7 => 0.5,    // 周末流量大，半价吸引顾客
    5 => 0.8,         // 周五下班消费意愿强，8折促销
    _ => 1.0          // 工作日原价，保证利润
};
Console.WriteLine($"折扣：{discount}");
\`\`\`

> ⭐ **switch 表达式**是现代 C# 最优雅的特性之一。返回值场景下用它替代 \`switch\` 语句，代码量减半。 \`or\`/\`and\` 模式组合让条件更直观。

### 六、模式匹配与 when 子句 ⭐

\`switch\` 不仅能匹配常量，还能匹配**类型、范围、属性**，配合 \`when\` 子句加额外条件：

\`\`\`csharp
// data 是 object 类型，可以装任何类型的值（装箱）
// 为什么用 object？演示类型模式匹配：运行时才知道具体类型
object data = 42;

// 类型模式 + when 子句：先判断类型，再加额外条件
// 为什么要 when？类型匹配只能判断"是什么类型"，when 让你加任意自定义条件
string desc = data switch
{
    // 先匹配是 int，再判断是否 > 0
    int i when i > 0 => $"正整数 {i}",
    int i when i < 0 => $"负整数 {i}",
    int i => $"零 {i}",  // 前面的 when 都不满足，剩下的就是 0
    string s when s.Length > 10 => "长字符串",
    string s => $"字符串：{s}",
    null => "空值",  // 匹配 null 引用
    _ => "其他类型"
};
Console.WriteLine(desc);  // 42是正整数，输出：正整数 42

// 关系模式（C# 9+）：直接用比较运算符，不需要额外变量
int score = 85;
string grade = score switch
{
    >= 90 => "A",
    >= 80 => "B",  // 85 >= 80，命中这里（注意顺序：同样是从严到宽）
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

// ✅ 三元运算符：简单二选一场景最简洁，直接返回值
// 为什么用？一行搞定赋值，比写 if-else 少4行
string status = age >= 18 ? "成年" : "未成年";

// ❌ 嵌套三元：虽然语法合法，但可读性极差，调试困难
// 为什么不推荐？别人读代码时要从右往左心算，很容易看错
string level = age >= 60 ? "老年" : age >= 30 ? "中年" : age >= 18 ? "青年" : "少年";

// ✅ 多分支用 switch 表达式更清晰：每个分支一行，从上到下阅读
// 为什么？不用嵌套，逻辑线性排列，和我们思考顺序一致
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
// 演示：多种条件判断写法对比，不同场景选最合适的方式

// 测试数据：76分，非补考
int score = 76;
bool isMakeup = false;  // 是否补考，补考有特殊规则

// 方式 1：if-else if 链——适合需要执行多条语句、有副作用的场景
// 为什么用 if？这里只是输出，但如果要打日志、发通知、做多件事，if 更灵活
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
    Console.WriteLine("[if] 等级 C，通过");  // 76分命中这里
}
else
{
    Console.WriteLine("[if] 等级 D，需补考");
}

// 方式 2：switch 表达式——适合"输入→输出"的纯映射场景
// 为什么用 switch 表达式？只需要拿到等级值，不需要副作用时更简洁
string grade = score switch
{
    >= 90 when !isMakeup => "A",
    >= 90 => "A（补考）",  // 补考即使高分也不能评优，这是业务规则
    >= 80 => "B",
    >= 60 => "C",
    _ => "D"
};
Console.WriteLine($"[switch 表达式] 等级：{grade}");

// 方式 3：元组模式——多个条件组合判断时最清晰
// 为什么用元组模式？把(score, isMakeup)作为整体判断，比多个 && 更直观
double gpa = (score, isMakeup) switch
{
    (>= 90, false) => 4.0,   // 正常考试优秀
    (>= 80, false) => 3.0,   // 正常考试良好
    (>= 60, false) => 2.0,   // 正常考试及格，命中这里
    (>= 60, true) => 1.5,    // 补考通过GPA打折，因为是重考
    _ => 0.0                 // 不及格GPA 0
};
Console.WriteLine($"[元组模式] GPA：{gpa}");

// 方式 4：if 处理特殊动作——switch 不擅长执行副作用
// 为什么这里用 if？需要触发一个动作（自动报名补考），不只是返回值
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
// for 把"初始化、条件、步进"三要素写在一行，一眼看清循环范围
// 为什么用 for？已知次数时，循环变量生命周期清晰，出了循环就访问不到
for (int i = 1; i <= 5; i++)
{
    Console.WriteLine($"第 {i} 次");
}

// 倒序：从 10 数到 1
// 步进写 i-- 就能倒序，非常灵活
for (int i = 10; i >= 1; i--)
{
    Console.Write(i + " ");
}
Console.WriteLine();  // 输出换行，避免和后面内容混在一起

// 步进为 2：输出偶数
// 步进可以是任意增量，不只是 1
for (int i = 0; i <= 10; i += 2)
{
    Console.Write(i + " ");
}
Console.WriteLine();
\`\`\`

> ⭐ \`for\` 的三个部分都可省略，但分号不能少：\`for (;;)\` 是合法的无限循环。为什么允许省略？给高级场景留灵活性，但日常不建议这么写。循环变量 \`i\` 的作用域仅限循环体内部——这是为什么 for 里声明的变量外面访问不到，防止变量污染。

### 二、while 循环：条件未知 ⭐

\`while\` 先判断条件再执行，**适合循环次数不确定**的场景：

\`\`\`csharp
// 经典：累加，直到和达到/超过100
// 为什么用 while？不知道要加多少次才能到100，次数由运行时决定
int sum = 0, n = 1;
while (sum < 100)
{
    sum += n;
    n++;
}
// 循环结束时 sum 刚好 >= 100，n-1 是最后加的数
Console.WriteLine($"累加到 {n - 1}，总和 {sum}");

// 处理输入：直到用户输入 "exit" 才停止
// 这是服务端、命令行程序最常见的模式，因为你不知道用户什么时候退出
// string input;
// while ((input = Console.ReadLine()) != "exit") { ... }

// 条件一开始就是 false 时，循环体一次都不执行
// 为什么重要？和 do-while 的核心区别就在这里
int x = 10;
while (x < 5)
{
    Console.WriteLine("这行不会执行");  // x 初始就是 10，永远进不来
}
\`\`\`

> ⭐ \`while\` 适合"等待某条件不成立"的场景（如读文件到末尾、接收输入到特定值）。务必确保循环体内有**改变条件的代码**，否则死循环——为什么？如果条件永远是 true，循环就永远停不下来。

### 三、do-while 循环：至少执行一次

\`do-while\` 先执行一次再判断，**至少会执行一次**：

\`\`\`csharp
// 菜单循环：至少展示一次菜单给用户看
// 为什么用 do-while？菜单必须先显示出来用户才能选择，不能先判断再显示
int choice;
do
{
    Console.WriteLine("1. 开始游戏");
    Console.WriteLine("2. 设置");
    Console.WriteLine("0. 退出");
    Console.Write("请选择：");
    choice = 2;  // 模拟用户输入2，真实场景用 Console.ReadLine()
    Console.WriteLine($"选择了 {choice}");
} while (choice != 0);  // 注意 while 后面有分号！这是语法要求

// 另一个例子：从0开始累加，直到num超过5
int num = 0, total = 0;
do
{
    total += num;
    num++;
} while (num <= 5);
// 即使条件一开始不成立，do 里的代码也先跑了一遍
Console.WriteLine($"总和：{total}");  // 0+1+2+3+4+5 = 15
\`\`\`

> \`do-while\` 在 C# 里相对少用，主要场景是"至少执行一次"的菜单、输入验证。注意 \`while\` 后面有分号——为什么？语法规定，漏了会编译错。

### 四、foreach 循环：遍历集合 ⭐

\`foreach\` 是 C# **最常用**的循环，遍历集合无需关心索引：

\`\`\`csharp
// 引入集合类型的命名空间，List和Dictionary都在这里
using System.Collections.Generic;

// 遍历数组
// 为什么 foreach 是首选？不用管索引从0开始还是从1开始，不会越界
int[] nums = { 10, 20, 30, 40, 50 };
foreach (int n in nums)
{
    Console.Write(n + " ");
}
Console.WriteLine();

// 遍历字符串：字符串本质是 char 数组，所以也能 foreach
foreach (char c in "Hello")
{
    Console.Write(c + "-");
}
Console.WriteLine();

// 遍历 List<T>：最常用的动态集合
// 为什么用 List？数组大小固定，List 可以随时 Add/Remove
var names = new List<string> { "张三", "李四", "王五" };
foreach (var name in names)
{
    Console.WriteLine($"你好，{name}");
}

// 遍历 Dictionary<TKey, TValue>：键值对集合
var scores = new Dictionary<string, int>
{
    ["张三"] = 90,
    ["李四"] = 85
};
foreach (var kv in scores)
{
    // kv 是 KeyValuePair，有 Key 和 Value 两个属性
    Console.WriteLine($"{kv.Key}: {kv.Value}");
}
\`\`\`

> ⭐ **foreach 是日常开发首选**。它的优点：① 不用管索引越界；② 只读访问避免误改；③ 代码意图清晰——一看就知道"要遍历每个元素"。
>
> ⚠️ \`foreach\` 内部**不能修改集合本身**（不能增删元素），也不能修改迭代变量 \`n\`（只读）。为什么？迭代时修改集合会导致枚举器失效，C#从语言层面禁止这个坑。需要修改时用 \`for\` 配合索引。

### 五、break 与 continue ⭐

\`break\` 跳出整个循环，\`continue\` 跳过本次进入下次：

\`\`\`csharp
// break：找到目标就立刻停止，不用遍历完
// 为什么用 break？找到想要的东西后继续循环是浪费性能
for (int i = 1; i <= 10; i++)
{
    if (i % 2 == 0)
    {
        Console.WriteLine($"找到偶数：{i}");  // 第一个偶数是2
        break;  // 跳出整个for循环，后面的3-10都不看了
    }
}

// continue：跳过不符合条件的，继续下一次
// 为什么用 continue？不满足条件时本次不处理，但循环还要继续
for (int i = 1; i <= 10; i++)
{
    if (i % 2 == 0)
    {
        continue;  // 偶数跳过，直接去执行 i++ 进入下一次
    }
    Console.Write(i + " ");  // 只有奇数会走到这里
}
Console.WriteLine();

// 嵌套循环中 break 只跳出最内层
// 为什么？这是C#的设计：break 只影响它直接所在的那层循环
for (int i = 0; i < 3; i++)
{
    for (int j = 0; j < 3; j++)
    {
        if (j == 1) break;  // 只跳出内层 j 循环，外层 i 循环继续
        Console.WriteLine($"i={i}, j={j}");
    }
}
\`\`\`

> ⭐ \`break\` 和 \`continue\` 是循环控制的核心。**嵌套循环中 \`break\` 只跳出最内层**——要跳出多层可以用 \`goto\` 标签或重构为方法 \`return\`（推荐后者，goto 容易写出乱码）。

### 六、嵌套循环

\`\`\`csharp
// 打印矩形星号
// 外层循环控制"行"，内层循环控制"列"——这是嵌套循环的通用模式
for (int i = 0; i < 3; i++)       // 一共3行
{
    for (int j = 0; j < 5; j++)   // 每行5个星号
    {
        Console.Write("*");
    }
    Console.WriteLine();  // 每行打完必须换行，否则所有星号在同一行
}
// 输出：
// *****
// *****
// *****

// 嵌套循环的复杂度是 O(n*m)
// 为什么提醒这个？1000*1000就是100万次循环，数据量大时可能卡
// 优化思路：能否用算法合并成一层循环？能否用LINQ？
\`\`\`

### 七、无限循环与跳出

\`while (true)\` 或 \`for (;;)\` 是常见写法，配合 \`break\` 跳出：

\`\`\`csharp
// while(true) + break：服务端程序常用的主循环模式
// 为什么这么写？退出条件可能在循环体中间，而不是开头，写在开头不好处理
int retry = 0;
while (true)
{
    retry++;
    Console.WriteLine($"第 {retry} 次尝试");

    // 退出条件在中间：可能前面做了一些操作才知道要不要退出
    if (retry >= 3)
    {
        Console.WriteLine("达到最大重试，退出");
        break;  // 满足条件才跳出，否则一直循环
    }
}

// for (;;) 和 while(true) 完全等价，只是写法不同
// for (;;)
// {
//     // 持续接收消息、处理请求...
//     if (shouldStop) break;
// }
\`\`\`

> \`while (true)\` 配合 \`break\` 比单纯 \`while (condition)\` 更灵活——能在循环体任意位置跳出，适合复杂退出条件。

### 八、实战 demo：九九乘法表

经典面试题，用嵌套循环输出九九乘法表：

\`\`\`csharp
// === 九九乘法表 ===
// 嵌套 for：外层控制行（被乘数），内层控制列（乘数）

// i 从 1 到 9：一共9行
for (int i = 1; i <= 9; i++)
{
    // j 从 1 到 i：第 i 行有 i 个式子，这样形成三角形
    // 为什么 j <= i？九九表是下三角，第一行1个，第二行2个...第九行9个
    for (int j = 1; j <= i; j++)
    {
        // {result,-4}：左对齐，占4个字符宽度
        // 为什么要对齐？不对齐的话列歪歪扭扭，可读性差
        Console.Write($"{j}x{i}={i * j,-4}");
    }
    Console.WriteLine();  // 每行结束换行，别忘！
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
// 经典算法题，考察循环和变量更新

int a = 1, b = 1;       // 前两项初始值，斐波那契前两个数都是1
int count = 15;         // 要生成多少项
int generated = 0;

Console.Write("斐波那契前 15 项：");
while (generated < count)
{
    Console.Write(a + " ");  // 先输出当前项

    // 滚动更新：计算下一项，然后a和b都往前挪一位
    // 为什么需要临时变量next？如果直接 a = b; b = a + b; 那a已经被覆盖，b就错了
    int next = a + b;
    a = b;
    b = next;

    generated++;
}
Console.WriteLine();

// C# 7+ 优雅写法：用元组解构赋值，不用临时变量
// 为什么优雅？一行同时完成两个变量的更新，语义清晰
int x = 1, y = 1;
Console.Write("for 版本：");
for (int i = 0; i < 15; i++)
{
    Console.Write(x + " ");
    // 元组同时赋值：右边先全部算完，再一起赋值给左边
    // 避免了临时变量，也避免了"先改了a导致b算错"的问题
    (x, y) = (y, x + y);
}
Console.WriteLine();
\`\`\`

> 元组解构 \`(x, y) = (y, x + y)\` 是 C# 7+ 的优雅写法，避免引入临时变量。为什么以前不用？C# 7之前语法不支持，必须用临时变量。

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
// 在顶级语句里直接定义本地方法（C# 9+ 支持）
// 为什么用本地方法？学习阶段不用写 Program 类和 Main 方法，最简单直接
// 注意：本地函数不是类型声明，所以可以放在执行代码前面或后面，不会触发 CS8803

// 无参无返回值方法：void 表示不返回任何东西
// 什么时候用 void？只执行动作（输出、保存文件），不返回结果给调用者
void SayHello()
{
    Console.WriteLine("你好，C#！");
}

// 带参数方法：参数是方法接收的输入，让方法能处理不同数据
// 为什么要参数？没有参数的方法只能做固定的事，有参数才能复用（同一个Greet方法可以问候不同人）
void Greet(string name)
{
    Console.WriteLine($"你好，{name}！");
}

// 调用方法：方法名(参数)
// 为什么要调用？定义方法不会自动执行，必须调用才会跑里面的代码
SayHello();
Greet("张三");
Greet("李四");  // 传不同参数，复用同一个方法
\`\`\`

> ⭐ **本地函数（local function）**：C# 9+ 允许在顶级语句文件里直接写方法，不用套 \`class\`。学习阶段这样写最简洁。注意：本地函数（直接在顶级语句中定义的方法）不属于类型声明，所以位置自由，不会触发CS8803错误。

### 二、返回值 ⭐

\`void\` 表示无返回值，其他类型必须 \`return\`：

\`\`\`csharp
// 返回 int 的方法：返回类型写在方法名前面
// 为什么要返回值？方法计算出结果给调用者用，而不是只做副作用
int Add(int a, int b)
{
    return a + b;  // return 把结果返回给调用者，同时结束方法
}

// 返回 string 的方法：多个 return 是合法的
// 为什么用多个 return？提前返回能减少嵌套，代码更扁平
string GetGrade(int score)
{
    if (score >= 90) return "A";  // 满足条件直接返回，后面代码不执行
    if (score >= 60) return "B";
    return "C";  // 必须保证所有路径都有 return，否则编译错
}

// 查找类方法：找到就返回结果，找不到返回哨兵值
// 为什么用 -1 当哨兵？-1 不是合法的索引（索引从0开始），调用者能区分"没找到"
int FindFirstEven(int[] nums)
{
    foreach (var n in nums)
    {
        if (n % 2 == 0) return n;  // 找到第一个偶数立刻返回
    }
    return -1;  // 遍历完都没找到，返回-1表示不存在
}

// 调用方法并接收返回值
Console.WriteLine(Add(3, 5));              // 8：Add返回8，传给WriteLine输出
Console.WriteLine(GetGrade(85));           // B：85分对应B等级
Console.WriteLine(FindFirstEven(new[] { 1, 3, 4, 6 }));  // 4：第一个偶数是4
\`\`\`

> ⭐ 非 \`void\` 方法必须保证**所有代码路径都 \`return\`**，编译器会检查。为什么编译器要检查？防止你漏写 return 导致返回未定义值。多个 \`return\` 是合法的，提前 return 能简化嵌套（少一层大括号）。

### 三、值参数 vs ref vs out vs in ⭐

这是 C# 参数的**核心难点**。默认是"值传递"，\`ref\`/\`out\`/\`in\` 是"引用传递"：

\`\`\`csharp
// === 1. 值参数（默认）：拷贝一份传入，方法内修改不影响外部 ===
// 为什么默认是值传递？安全！方法不会意外改坏外部变量
void TryDouble(int x)
{
    x = x * 2;  // 修改的是"拷贝"，不是原来的 n
}
int n = 10;
TryDouble(n);
Console.WriteLine(n);  // 10，外面的n没变——这就是值传递的效果

// === 2. ref：双向引用，方法内修改影响外部 ===
// 为什么需要 ref？确实需要方法内修改外部变量时（比如交换两个数、Resize数组）
void DoubleByRef(ref int x)
{
    x = x * 2;  // 修改的是原变量本身，不是拷贝
}
int m = 10;
DoubleByRef(ref m);  // 调用时也必须写 ref，明确告诉读代码的人"这个参数可能被修改"
Console.WriteLine(m);  // 20，外面的m被改了！

// === 3. out：输出参数，方法必须赋值，用于返回多个值 ===
// 为什么用 out？一个方法需要返回多个结果时（比如TryParse：成功/失败 + 解析出的值）
bool TryParseInt(string s, out int result)
{
    if (int.TryParse(s, out result))
    {
        return true;   // 解析成功，result 已被赋值
    }
    result = 0;  // out 参数必须赋值！即使解析失败也要给个默认值，否则编译错
    return false;
}
// 调用时可以直接在 out 里声明变量（C# 7+ 语法）
if (TryParseInt("123", out int parsed))
{
    Console.WriteLine($"解析成功：{parsed}");  // 123
}

// === 4. in：只读引用，避免大结构体拷贝，方法内不能修改 ===
// 为什么用 in？大 struct 拷贝开销大，但又不想让方法修改它（比 ref 更安全）
void PrintSize(in int[] arr)
{
    // arr[0] = 99;  // 编译错误！in 参数不能修改引用本身（但注意：数组元素能不能改要看类型设计）
    Console.WriteLine($"数组长度：{arr.Length}");
}
int[] data = { 1, 2, 3 };
PrintSize(in data);  // 传 in 明确表示只读
\`\`\`

> ⭐ **参数传递是本章重点**：
> - **值参**（默认）：拷贝传入，方法内修改不影响外部。为什么是默认？安全优先。
> - **\`ref\`**：双向引用，调用前必须已赋值，方法内可读可写。
> - **\`out\`**：输出参数，方法内必须赋值，用于返回多值。为什么调用前不需要赋值？因为方法一定会给它赋值。
> - **\`in\`**：只读引用，避免大 struct 拷贝，方法内不能改引用。
>
> 引用类型（如数组、对象）默认值传递时，传的是引用的拷贝——方法内能改对象内容，但不能让外部变量指向新对象。

### 四、默认参数与命名参数 ⭐

\`\`\`csharp
// 默认参数：参数给个默认值，调用时可以不传
// 为什么用默认参数？避免写一堆重载（CreateUser一个参数、两个参数、三个参数的版本）
// 规则：默认参数必须从右往左连续，不能跳过——为什么？编译器没法推断你跳过的是哪个
void CreateUser(string name, int age = 18, string city = "北京")
{
    Console.WriteLine($"姓名:{name}, 年龄:{age}, 城市:{city}");
}

CreateUser("张三");                       // 只传必填的name，age和city用默认值
CreateUser("李四", 25);                   // 传name和age，city用默认
CreateUser("王五", 30, "上海");           // 三个都传，覆盖默认

// 命名参数：用 参数名:值 的形式传参，不用按顺序
// 为什么用命名参数？想跳过中间参数时很有用，或者参数多的时候明确每个值对应谁
CreateUser(name: "赵六", city: "深圳", age: 28);  // 顺序乱了也没关系，按名字匹配
CreateUser("钱七", city: "广州");         // 位置参数和命名参数可以混用，但位置参数必须在前
\`\`\`

> ⭐ **默认参数**让方法调用更灵活，避免写一堆重载。规则：① 默认值必须是常量（不能是变量）；② 从右到左连续提供，不能跳过。为什么默认值必须是常量？默认值是编译时嵌入的，不是运行时计算的。
>
> **命名参数**在调用方法参数多、想跳过中间参数时非常有用：\`CreateUser("钱七", city: "广州")\`。

### 五、params 可变参数 ⭐

\`params\` 让方法接受任意数量的同类型参数：

\`\`\`csharp
// params 必须是最后一个参数——为什么？编译器要把剩下的参数都收进数组，只能放最后
int Sum(params int[] numbers)
{
    int total = 0;
    foreach (var n in numbers) total += n;
    return total;
}

// 调用时可传任意数量（包括0个）——不用先创建数组
Console.WriteLine(Sum());              // 0个参数，返回0
Console.WriteLine(Sum(1));             // 1个参数
Console.WriteLine(Sum(1, 2, 3));       // 3个参数
Console.WriteLine(Sum(1, 2, 3, 4, 5)); // 5个参数，编译器自动帮你包装成数组

// 也可以直接传数组——两种写法完全等价
int[] arr = { 10, 20, 30 };
Console.WriteLine(Sum(arr));           // 60

// 你早就见过 params：Console.WriteLine 就是用它实现的
// Console.WriteLine("格式 {0} {1}", a, b) 中 a,b 就是 params object[] 参数
\`\`\`

> ⭐ \`params\` 让方法签名更简洁，避免写 10 个重载（Sum()、Sum(int)、Sum(int,int)...）。为什么不用直接传数组？params让调用者不用手动new数组，写起来更方便。\`Console.WriteLine\` 和 \`string.Format\` 都靠它实现可变参数。

### 六、方法重载 ⭐

同名方法参数不同（数量、类型、顺序），编译器根据调用自动选择：

\`\`\`csharp
// 三个重载：同名 Add，参数类型不同
// 为什么用重载？同一操作（加法）对不同类型逻辑相似，用同一个名字更自然
int Add(int a, int b) => a + b;                    // int加法
double Add(double a, double b) => a + b;           // double加法
string Add(string a, string b) => a + b;           // 字符串拼接（逻辑上也是"加"）

// 编译器根据实参类型自动选哪个版本——不用你手动判断类型
Console.WriteLine(Add(1, 2));          // 传int，调用int版本：3
Console.WriteLine(Add(1.5, 2.5));      // 传double，调用double版本：4
Console.WriteLine(Add("Hello", "!"));  // 传string，调用string版本：Hello!

// 参数数量不同也是重载
int Multiply(int a, int b) => a * b;
int Multiply(int a, int b, int c) => a * b * c;

Console.WriteLine(Multiply(2, 3));        // 两个参数，调用第一个：6
Console.WriteLine(Multiply(2, 3, 4));     // 三个参数，调用第二个：24

// ⚠️ 只有返回类型不同不算重载！
// int Foo(int x) 和 string Foo(int x) 会编译错误——为什么？
// 编译器只看调用时的参数，没法根据"你要不要返回值"来选版本
\`\`\`

> ⭐ **方法重载**让 API 更直观——同一操作支持多种参数类型。重载看的是**参数签名**（参数数量、类型、顺序），返回类型不同不算重载。为什么？调用时可以不接返回值（Foo(5)），编译器不知道你要哪个版本。

### 七、表达式体方法（=>）⭐

单行方法可以用 \`=>\` 简化，等价于 \`{ return ...; }\`：

\`\`\`csharp
// 传统写法：大括号 + return
int Square(int x)
{
    return x * x;
}

// 表达式体方法：=> 后面直接跟一个表达式
// 为什么用？简单方法一行搞定，少写好多大括号和return
int Square2(int x) => x * x;

// void 方法也能用表达式体——不需要return，直接跟方法调用表达式
void Print(string s) => Console.WriteLine(s);

// 带默认参数 + 表达式体也可以组合
string Greet(string name, string greeting = "你好") => $"{greeting}，{name}！";

Console.WriteLine(Square2(5));   // 25
Print("测试");                   // 测试
Console.WriteLine(Greet("张三"));         // 你好，张三！
Console.WriteLine(Greet("李四", "Hi"));   // Hi，李四！
\`\`\`

> ⭐ **表达式体方法**让简单方法一行搞定，是现代 C# 的常用写法。规则：\`=>\` 后只能是一个表达式（不能是多条语句），所以特别适合简单计算、转发调用。

### 八、本地函数

在方法内部定义的函数，作用域仅限外层方法：

\`\`\`csharp
// 外层方法：处理订单
int ProcessOrder(int orderId, int quantity)
{
    // 本地函数：计算价格——只在 ProcessOrder 里用，外面不需要访问
    // 为什么用本地函数？1) 不污染外部命名空间 2) 可以访问外层方法的局部变量
    int CalculatePrice(int qty)
    {
        int unitPrice = 100;
        if (qty > 10) unitPrice = 80;  // 批量打折：买10件以上单价80
        return qty * unitPrice;
    }

    // 另一个本地函数：打日志——同样只在 ProcessOrder 内部用
    void Log(string msg)
    {
        // 本地函数可以直接访问外层方法的 orderId 参数——这是很大的便利
        // 为什么方便？不用把orderId当参数一层层传进来
        Console.WriteLine($"[订单 {orderId}] {msg}");
    }

    int total = CalculatePrice(quantity);
    Log($"数量 {quantity}，总价 {total}");
    return total;
}

ProcessOrder(1001, 5);   // 5件不打折，总价 5*100=500
ProcessOrder(1002, 20);  // 20件打折，总价 20*80=1600
\`\`\`

> 本地函数适合"只在一个方法内复用"的小逻辑，避免污染类的外部接口。它还能访问外层方法的局部变量和参数——这叫"闭包"，为什么比私有方法方便？不用通过参数传外层上下文进来。

### 九、元组返回多值 ⭐

C# 7+ 支持方法返回元组，一次返回多个值：

\`\`\`csharp
// 返回命名元组：(最小值, 最大值, 总和)
// 为什么用元组返回多值？比out参数直观，比创建一个专门的Result类简单
(int Min, int Max, int Sum) Analyze(int[] nums)
{
    if (nums.Length == 0) return (0, 0, 0);  // 空数组返回零值

    int min = nums[0], max = nums[0], sum = 0;
    foreach (var n in nums)
    {
        if (n < min) min = n;
        if (n > max) max = n;
        sum += n;
    }
    return (min, max, sum);  // 三个值一起返回
}

int[] data = { 3, 7, 1, 9, 4 };
// 可以用 .属性名 访问每个返回值
var result = Analyze(data);
Console.WriteLine($"最小:{result.Min}, 最大:{result.Max}, 总和:{result.Sum}");

// 更优雅：解构赋值直接拆成独立变量
// 为什么解构？不用写 result. 前缀，直接用变量名更方便
var (min, max, sum) = Analyze(data);
Console.WriteLine($"{min} / {max} / {sum}");

// 经典用法：TryParse 模式——成功/失败 + 结果值
// 为什么用这种模式？比抛异常高效，返回null又丢失信息
(bool Success, int Value) TryParseSafe(string s)
{
    if (int.TryParse(s, out int v)) return (true, v);
    return (false, 0);  // 失败返回false和0
}

var (ok, val) = TryParseSafe("42");
Console.WriteLine($"成功:{ok}, 值:{val}");
\`\`\`

> ⭐ **元组返回**是 C# 替代 \`out\` 参数的优雅方案。为什么比out好？out参数不能用async/await，元组可以；out参数不能当泛型参数，元组可以。命名元组 \`(int Min, int Max)\` 让调用方能用 \`result.Min\` 访问，比 \`result.Item1\` 可读得多。

### 十、实战 demo：简易计算器

综合运用本章知识，写一个支持多种运算的计算器：

\`\`\`csharp
// === 简易计算器 ===
// 演示：方法重载、表达式体、params、元组返回、本地函数

// 方法重载版本：两个数的基本运算
// 用switch表达式实现：简洁的策略分发
double Calc(double a, double b, char op) => op switch
{
    '+' => a + b,
    '-' => a - b,
    '*' => a * b,
    '/' => b == 0 ? double.NaN : a / b,  // 除零保护：返回NaN表示错误
    _ => throw new ArgumentException($"不支持运算符 {op}")  // 不认识的运算符抛异常
};

// params重载版本：连加——为什么用重载？同名Calc，参数不同自动选择
double Calc(params double[] nums)
{
    if (nums.Length == 0) return 0;
    double total = 0;
    foreach (var n in nums) total += n;
    return total;
}

// 元组返回：除法同时返回商和余数
// 为什么返回两个值？整数除法中商和余数都是常用结果，一次返回不用调用两次
(int Quotient, int Remainder) DivMod(int a, int b)
{
    if (b == 0) throw new DivideByZeroException();  // 除零抛异常
    return (a / b, a % b);  // /是商，%是余数
}

// 带本地函数的安全开方
double SafeSqrt(double x)
{
    // 本地函数做验证——为什么用本地函数？验证逻辑只在这里用，不用暴露到外面
    bool IsValid(double v) => v >= 0;

    if (!IsValid(x)) return double.NaN;  // 负数不能开平方，返回NaN表示错误
    return Math.Sqrt(x);  // Math.Sqrt是系统提供的开方方法
}

// ===== 测试 =====
// 为什么先定义方法再执行？顶级语句中本地函数虽然位置自由，但先定义后调用更符合阅读习惯
Console.WriteLine($"3 + 5 = {Calc(3, 5, '+')}");
Console.WriteLine($"10 / 3 = {Calc(10, 3, '/'):F2}");  // :F2格式化保留2位小数

Console.WriteLine($"连加: {Calc(1, 2, 3, 4, 5)}");  // 调用params版本，1+2+3+4+5=15

var (q, r) = DivMod(17, 5);
Console.WriteLine($"17 ÷ 5 = {q} 余 {r}");  // 商3余2

Console.WriteLine($"√16 = {SafeSqrt(16)}");  // 4
Console.WriteLine($"√-4 = {SafeSqrt(-4)}");  // NaN，负数不能开平方
\`\`\`

### 十一、小结

- ⭐ 方法定义：\`返回类型 方法名(参数) { ... }\`，非 void 必须 return。
- ⭐ **参数四件套**：值参（默认拷贝）、\`ref\`（双向引用）、\`out\`（输出参数）、\`in\`（只读引用）。
- ⭐ 默认参数从右到左连续，命名参数用 \`名:值\` 跳过中间参数。
- ⭐ \`params\` 接受可变数量参数，必须是最后一个参数。
- ⭐ 方法重载看参数签名，返回类型不同不算重载。
- ⭐ 表达式体方法 \`=>\` 让单行方法更简洁。
- ⭐ **元组返回**替代 \`out\` 实现多返回值，命名元组可读性最佳。
- 💡 注意：本地函数（顶级语句中直接定义的方法）不属于类型声明，可以放在任何位置；只有 class/struct/interface/record/enum/delegate 这些类型声明需要放在执行代码之后。`,
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
// 引入集合泛型命名空间，后面要用到List
using System.Collections.Generic;

// === 1. 声明 + 指定大小 ===
// 只指定长度，元素自动初始化为默认值（int是0，引用类型是null）
int[] nums = new int[5];
Console.WriteLine(string.Join(", ", nums));  // 输出：0, 0, 0, 0, 0

// === 2. 声明 + 列表初始化 ===
// 为什么用这种？创建数组时就知道初始值
int[] scores = new int[] { 90, 85, 78, 92, 67 };
string[] names = new string[] { "张三", "李四", "王五" };

// === 3. 简化写法（最常用）⭐ ===
// C#编译器能推断类型，不用写 new int[]
int[] arr = { 1, 2, 3, 4, 5 };
string[] langs = { "C#", "Java", "Python" };

// === 4. 用 var 推断 ===
var doubles = new[] { 1.1, 2.2, 3.3 };     // 推断为 double[]
var mixed = new[] { 1, 2, 3.0 };            // 有int有double，推断为double[]（自动类型提升）

// === 5. 长度与访问 ===
// Length属性获取数组长度——为什么用属性而不是方法？这是设计约定：状态用属性，动作用方法
Console.WriteLine(\$"长度: {arr.Length}");  // 5
Console.WriteLine(\$"第一个: {arr[0]}");    // 1，索引从0开始
Console.WriteLine(\$"最后: {arr[^1]}");     // 5，C# 8+ 反向索引：^1表示倒数第一个
arr[0] = 100;  // 通过索引赋值修改元素
Console.WriteLine(arr[0]);                  // 100
\`\`\`

> ⭐ **数组声明最常用**：\`int[] arr = { 1, 2, 3 };\`。注意 C# 的方括号跟在类型后（\`int[]\`），不是变量后（\`int arr[]\`）——为什么？C#设计上类型信息放一起，int[] 整体是"int数组类型"。
>
> ⭐ **反向索引 \`[^1]\`**（C# 8+）：\`arr[^1]\` 等价 \`arr[arr.Length - 1]\`，从末尾倒数。为什么设计这个语法？写arr[^1]比算Length-1简洁，而且不容易off-by-one错误。

### 二、数组遍历 ⭐

\`\`\`csharp
int[] nums = { 10, 20, 30, 40, 50 };

// 方式 1：foreach（首选，只读）⭐
// 为什么首选foreach？不用管索引，不会越界，不会写错循环条件
foreach (var n in nums)
{
    Console.Write(n + " ");
}
Console.WriteLine();

// 方式 2：for + 索引（需要修改元素或需要索引时）
// 什么时候用for？需要修改元素值、需要知道当前索引位置时
for (int i = 0; i < nums.Length; i++)
{
    nums[i] *= 2;  // 每个元素翻倍——foreach不能修改，必须用for
}
Console.WriteLine(string.Join(", ", nums));  // 20, 40, 60, 80, 100

// 方式 3：用 Range 切片（C# 8+）⭐
// 切片创建新数组，不影响原数组——为什么用切片？需要取子数组时不用手写循环复制
int[] data = { 1, 2, 3, 4, 5, 6, 7, 8 };
int[] first3 = data[0..3];   // [1, 2, 3]：从索引0开始，到索引3之前（不包含3）
int[] last2 = data[^2..];    // [7, 8]：从倒数第2个开始到最后
int[] middle = data[2..5];   // [3, 4, 5]：从2到5之前
int[] all = data[..];        // 全部：省略起点就是0，省略终点就是末尾
Console.WriteLine(string.Join(", ", first3));
Console.WriteLine(string.Join(", ", last2));
\`\`\`

> ⭐ **Range 切片**（C# 8+）\`data[1..4]\` 是数组切片的优雅写法。为什么左闭右开？和数学区间、其他语言（Python、Go）保持一致，而且 end - start = 切片长度。

### 三、二维数组 [,] ⭐

二维数组是**矩形结构**——每行长度相同，用 \`[,]\` 声明：

\`\`\`csharp
// === 声明 + 初始化 ===
// 3行4列，所有元素默认0
int[,] matrix = new int[3, 4];

// 声明时直接赋值：嵌套大括号，每行一个大括号
int[,] grid = {
    { 1, 2, 3, 4 },
    { 5, 6, 7, 8 },
    { 9, 10, 11, 12 }
};

// 访问：matrix[行, 列]——逗号分隔，不是两个方括号
// 为什么用[,]而不是[][]？二维数组是矩形内存块，访问更快
Console.WriteLine(grid[0, 0]);  // 1：左上角
Console.WriteLine(grid[2, 3]);  // 12：右下角
grid[1, 2] = 99;  // 修改元素

// 维度信息
Console.WriteLine(\$"总元素数: {grid.Length}");      // 12：3*4=12
Console.WriteLine(\$"维度数: {grid.Rank}");           // 2：二维
Console.WriteLine(\$"行数: {grid.GetLength(0)}");    // 3：第0维长度
Console.WriteLine(\$"列数: {grid.GetLength(1)}");    // 4：第1维长度

// 遍历二维数组：嵌套for
// 为什么不能用foreach？foreach会按顺序遍历所有元素，但你不知道是第几行第几列
for (int i = 0; i < grid.GetLength(0); i++)         // 外层遍历行
{
    for (int j = 0; j < grid.GetLength(1); j++)     // 内层遍历列
    {
        Console.Write(\$"{grid[i, j],4}");  // ,4表示占4位宽度，对齐
    }
    Console.WriteLine();
}
\`\`\`

> ⭐ **二维数组 \`[,]\`** 是连续矩形内存，适合矩阵、棋盘、表格数据。为什么GetLength(0)是行？维度顺序和声明一致：[行, 列]，第0维是行，第1维是列。注意和 \`Length\`（总元素数）区分。

### 四、锯齿数组 [][]

锯齿数组是"数组的数组"——每行长度可以不同：

\`\`\`csharp
// === 锯齿数组：每行长度不同 ===
// 先创建"行数组"，有3行，但每行目前是null
int[][] jagged = new int[3][];

// 每行必须单独初始化——因为长度可以不一样
jagged[0] = new int[] { 1, 2 };         // 第一行2个元素
jagged[1] = new int[] { 3, 4, 5, 6 };   // 第二行4个元素
jagged[2] = new int[] { 7, 8, 9 };      // 第三行3个元素

// 简化声明：直接写嵌套的new[]
int[][] jagged2 = {
    new[] { 1, 2 },
    new[] { 3, 4, 5, 6 },
    new[] { 7, 8, 9 }
};

// 访问：jagged[行][列]——两个方括号，不是逗号
// 为什么是两个方括号？因为本质是"数组的数组"，先选一行（得到一个数组），再选列
Console.WriteLine(jagged[1][2]);  // 5：第二行（索引1）的第三个元素（索引2）

// 遍历锯齿数组
for (int i = 0; i < jagged.Length; i++)
{
    // 注意：内层循环用 jagged[i].Length，不是固定值——每行长度不一样
    for (int j = 0; j < jagged[i].Length; j++)
    {
        Console.Write(jagged[i][j] + " ");
    }
    Console.WriteLine();
}
\`\`\`

> **二维数组 \`[,]\` vs 锯齿数组 \`[][]\`**：
> - \`[,]\` 矩形，内存连续，每行等长，适合矩阵（数学计算）。
> - \`[][]\` 数组的数组，每行可变长，灵活但内存不连续（每行是独立数组）。
> - 日常开发 \`[][]\` 更常见——为什么？真实数据往往不规则（比如一个班学生的选课数每个人不一样）。

### 五、Array 类常用方法 ⭐

\`Array\` 是所有数组的基类，提供大量静态方法：

\`\`\`csharp
int[] nums = { 5, 3, 8, 1, 9, 2, 7 };

// === 1. Sort 排序 ⭐ ===
// 为什么是静态方法？Array.Sort是工具方法，对传入的数组原地排序
Array.Sort(nums);
Console.WriteLine(string.Join(", ", nums));  // 1, 2, 3, 5, 7, 8, 9

// === 2. Reverse 反转 ===
Array.Reverse(nums);  // 同样是原地修改
Console.WriteLine(string.Join(", ", nums));  // 9, 8, 7, 5, 3, 2, 1

// === 3. Find / FindAll 查找 ===
int[] data = { 12, 25, 8, 33, 17, 40 };

int firstOver20 = Array.Find(data, x => x > 20);          // 找第一个满足条件的：25
int[] allOver20 = Array.FindAll(data, x => x > 20);       // 找所有满足条件的：[25, 33, 40]
int idx = Array.FindIndex(data, x => x > 20);             // 找第一个的索引：1
bool hasBig = Array.Exists(data, x => x > 30);            // 是否存在：true

Console.WriteLine(\$"第一个>20: {firstOver20}");
Console.WriteLine(\$"所有>20: {string.Join(",", allOver20)}");

// === 4. IndexOf 查找索引 ===
int[] arr = { 10, 20, 30, 20, 50 };
int index = Array.IndexOf(arr, 20);        // 1：从前向后找第一个20
int lastIdx = Array.LastIndexOf(arr, 20);  // 3：从后向前找第一个20

// === 5. Resize 改变大小 ===
// 为什么要Resize？数组创建时大小固定，Resize能重新分配
int[] small = { 1, 2, 3 };
Array.Resize(ref small, 5);   // 扩到5个元素，新增位置默认0
Console.WriteLine(string.Join(", ", small));  // 1, 2, 3, 0, 0
Array.Resize(ref small, 2);   // 缩到2个元素，后面的被截断
Console.WriteLine(string.Join(", ", small));  // 1, 2
// 为什么要ref？因为Resize可能创建新数组，需要把引用传进去才能改外面的变量

// === 6. Copy / CopyTo 拷贝 ===
int[] src = { 1, 2, 3, 4, 5 };
int[] dst = new int[5];
Array.Copy(src, dst, 3);     // 从src拷贝前3个元素到dst
Console.WriteLine(string.Join(", ", dst));  // 1, 2, 3, 0, 0

int[] dst2 = new int[5];
src.CopyTo(dst2, 0);         // 实例方法：把src全部拷贝到dst2，从索引0开始放
Console.WriteLine(string.Join(", ", dst2));

// === 7. Clear 清空 ===
Array.Clear(dst2);           // 把所有元素设为默认值（int是0，引用类型是null）
Console.WriteLine(string.Join(", ", dst2));  // 0, 0, 0, 0, 0

// === 8. BinarySearch 二分查找（需先排序）===
// 为什么必须先排序？二分查找的前提是有序，否则结果不对
int[] sorted = { 1, 3, 5, 7, 9, 11 };
int found = Array.BinarySearch(sorted, 7);
Console.WriteLine(\$"7 的索引: {found}");  // 3：有序数组查找O(log n)，比遍历O(n)快
\`\`\`

> ⭐ \`Array.Sort\`、\`Array.Find\`/\`FindAll\`、\`Array.IndexOf\`、\`Array.Copy\` 是高频方法。日常开发虽然更多用 \`List\`/\`LINQ\`，但底层都靠 \`Array\` 类支撑——为什么要学Array？理解底层才能写出高效代码。

### 六、数组作为参数与返回值 ⭐

\`\`\`csharp
// 引入集合泛型命名空间，要用到List
using System.Collections.Generic;

// === 1. 数组作参数（默认传引用的拷贝，能改内容）===
// 数组是引用类型，传参时传的是引用的拷贝
// 这意味着：方法内能修改数组元素，但不能让外面的变量指向新数组
void DoubleAll(int[] arr)
{
    for (int i = 0; i < arr.Length; i++)
    {
        arr[i] *= 2;  // 修改的是原数组的元素——因为引用指向同一块内存
    }
}

int[] nums = { 1, 2, 3 };
DoubleAll(nums);
Console.WriteLine(string.Join(", ", nums));  // 2, 4, 6：原数组被修改了

// === 2. params 数组作参数（前面讲过，这里复习）===
int Max(params int[] nums)
{
    int max = nums[0];
    foreach (var n in nums)
        if (n > max) max = n;
    return max;
}
Console.WriteLine(Max(3, 7, 2, 9, 5));  // 9

// === 3. 返回数组 ===
// 为什么返回数组而不是逗号分隔字符串？数组可以继续遍历、做LINQ操作
int[] GetEvenNumbers(int max)
{
    var list = new List<int>();  // 先用List动态收集，因为不知道有多少个
    for (int i = 0; i <= max; i += 2)
        list.Add(i);
    return list.ToArray();  // 最后转成数组返回
}

int[] evens = GetEvenNumbers(10);
Console.WriteLine(string.Join(", ", evens));  // 0, 2, 4, 6, 8, 10

// === 4. in 修饰符：保护数组引用不被重新赋值 ===
// 注意：in保护的是"引用本身"不能改，不是保护"数组元素"不能改
void PrintArray(in int[] arr)
{
    // arr = new int[10];  // 编译错误！in参数不能重新赋值
    // arr[0] = 99;        // 但元素可以改——in只保护引用，不保护对象内容
    Console.WriteLine(\$"长度 {arr.Length}, 首个 {arr[0]}");
}

// === 5. 返回多维数组 ===
int[,] CreateMatrix(int rows, int cols)
{
    int[,] m = new int[rows, cols];
    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++)
            m[i, j] = i * cols + j + 1;  // 按行顺序填充：1,2,3,4,5,6...
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

> ⭐ 数组作为参数传递时传的是"引用的拷贝"——方法内能改元素内容，但不能让外部变量指向新数组（除非用 \`ref\`）。为什么这么设计？既方便方法修改数据，又避免意外把整个数组替换掉。

### 七、实战 demo：学生成绩统计

综合运用本章知识，写一个完整的学生成绩统计程序：

\`\`\`csharp
// === 学生成绩统计系统 ===
// 演示：一维数组、二维数组、Array方法、数组作参数返回
// 注意：这里的方法都是本地函数，不是类型声明，所以可以放在执行代码前面
// 如果有class/struct等类型声明，必须放在所有执行代码之后（CS8803规则）

// 学生姓名数组：一维字符串数组
string[] students = { "张三", "李四", "王五", "赵六", "钱七" };

// 二维数组：每个学生3门课成绩 [学生索引, 科目索引]
// 为什么用二维数组？表格数据用二维数组最直接
int[,] scores = {
    { 85, 92, 78 },   // 张三：语文85，数学92，英语78
    { 76, 88, 90 },   // 李四
    { 92, 95, 89 },   // 王五
    { 65, 72, 80 },   // 赵六
    { 88, 91, 85 }    // 钱七
};

// 方法1：计算每个学生的平均分，返回数组
// 为什么返回数组？5个学生就有5个平均分，一一对应
double[] GetAverages(int[,] scores)
{
    int studentCount = scores.GetLength(0);
    int subjectCount = scores.GetLength(1);
    double[] averages = new double[studentCount];  // 返回数组长度和学生数一致

    for (int i = 0; i < studentCount; i++)
    {
        int sum = 0;
        for (int j = 0; j < subjectCount; j++)
            sum += scores[i, j];
        averages[i] = (double)sum / subjectCount;  // 转double避免整数除法
    }
    return averages;
}

// 方法2：找出最高平均分的学生，返回(索引, 分数)元组
// 为什么返回索引而不是姓名？索引可以用来查names数组，更通用
(int Index, double Score) FindTopStudent(string[] students, double[] averages)
{
    int topIndex = 0;  // 先假设第一个是最高分
    for (int i = 1; i < averages.Length; i++)
        if (averages[i] > averages[topIndex])
            topIndex = i;  // 发现更高分就更新索引
    return (topIndex, averages[topIndex]);
}

// 方法3：按平均分降序排序，返回排名索引数组
// 为什么返回索引数组而不是直接排序姓名？保持原始数据顺序不变
int[] GetRanking(double[] averages)
{
    // 初始化索引数组：0,1,2,3,4——不直接改原数组，只排序索引
    int[] indices = new int[averages.Length];
    for (int i = 0; i < indices.Length; i++) indices[i] = i;

    // 用Array.Sort的自定义比较：按averages的值降序排列indices
    // 为什么这样排序？这是"索引排序"技巧，排序索引不会打乱原始数据
    Array.Sort(indices, (a, b) => averages[b].CompareTo(averages[a]));
    return indices;
}

// ===== 执行统计 =====
// 调用方法拿到结果
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
    Console.WriteLine(\$"{averages[i],8:F1}");  // :F1保留1位小数
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
- 日常开发更多用 \`List<T>\`（大小可变），但数组是所有集合的底层基石。
- ⚠️ **顶级语句规则提醒**：using 指令放最前面；本地函数（直接在顶级语句定义的方法）位置自由；但如果有 class/struct/interface/record/enum/delegate 类型声明，必须放在所有可执行代码之后，否则 CS8803 编译错误。`,
  },
];

export { chapters };
