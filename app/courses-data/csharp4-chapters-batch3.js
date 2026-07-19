// =============================================================
// C# 从入门到精通大全（全新版）—— 第3批章节
// 第二部分 核心语法 下（共 6 章）
// -------------------------------------------------------------
// 本批包含 6 章：
//   csharp4-ch12 : 第十二章 控制流
//   csharp4-ch13 : 第十三章 枚举类型
//   csharp4-ch14 : 第十四章 元组与解构
//   csharp4-ch15 : 第十五章 模式匹配
//   csharp4-ch16 : 第十六章 可空值类型
//   csharp4-ch17 : 第十七章 可空引用类型
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，所有示例使用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第十二章：控制流
  // ============================================================
  {
    id: 'csharp4-ch12',
    group: '第二部分 核心语法',
    icon: '🔀',
    title: '控制流',
    content: `## 第十二章　控制流

控制流（Control Flow）是程序执行的"指挥棒"——它决定哪段代码先执行、哪段后执行、哪段重复执行。C# 的控制流语句丰富而成熟：从最经典的 \`if\` 到现代的 \`switch 表达式\`、\`模式匹配\`，覆盖了几乎所有日常开发场景。

### 一、if / else if / else ⭐⭐⭐

最基础的分支语句，当条件为 true 时执行对应代码块。

\`\`\`csharp
int score = 85;
if (score >= 90)
{
    Console.WriteLine("优秀");
}
else if (score >= 60)
{
    Console.WriteLine("及格");
}
else
{
    Console.WriteLine("不及格");
}
\`\`\`

注意：
- 条件表达式必须是 \`bool\` 类型，**不能用整数代替**（与 C/C++ 不同，\`if (x)\` 不合法）
- 即使只有一行代码，也强烈建议使用大括号 \`{}\`，避免日后维护出错
- \`else if\` 可以串联任意多个分支

### 二、三元运算符 ?: ⭐⭐

适用于"二选一"的简洁表达式，常用于赋值。

\`\`\`csharp
int age = 20;
string category = age >= 18 ? "成年" : "未成年";
\`\`\`

可嵌套但不宜过深，超过两层建议改用 \`if-else\` 或 \`switch 表达式\`。

### 三、经典 switch 语句 ⭐⭐⭐

针对"一个变量、多个离散值"的场景，比 \`if-else\` 链更清晰。

\`\`\`csharp
int day = 3;
switch (day)
{
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
        Console.WriteLine("工作日");
        break;                 // 必须 break，C# 不允许隐式贯穿
    case 6:
    case 7:
        Console.WriteLine("周末");
        break;
    default:
        Console.WriteLine("无效");
        break;
}
\`\`\`

要点：
- 每个 \`case\` 必须以 \`break\`、\`return\`、\`goto\` 或 \`throw\` 结尾，**不允许隐式贯穿**（空 case 标签连续除外）
- \`default\` 处理未匹配的情况，建议始终存在

### 四、switch 表达式（C# 8+）⭐⭐⭐

现代 C# 推荐用法：用 \`=>\` 表达分支结果，配合模式匹配极其优雅。

\`\`\`csharp
int day = 3;
string type = day switch
{
    1 or 2 or 3 or 4 or 5 => "工作日",   // 逻辑模式 or
    6 or 7 => "周末",
    _ => "无效"                           // _ 表示弃元，等价于 default
};
\`\`\`

### 五、模式匹配 switch（C# 7+）⭐⭐⭐

\`switch\` 不再局限于常量，可以匹配**类型**、**属性**、**关系**等。

\`\`\`csharp
object obj = "hello";
string desc = obj switch
{
    int i when i > 0 => $"正整数 {i}",     // when 子句附加条件
    int i => $"整数 {i}",                   // 类型模式
    string s => $"字符串：{s}",             // 类型模式 + 变量绑定
    null => "空",
    _ => "其他"
};
\`\`\`

### 六、for 循环 ⭐⭐⭐

适用于"已知次数"的循环。

\`\`\`csharp
for (int i = 0; i < 5; i++)
{
    Console.WriteLine(i);
}
\`\`\`

三段式：\`初始化\`、\`条件\`、\`迭代\`，任一段都可省略。

### 七、foreach 循环 ⭐⭐⭐

遍历集合元素，**最常用**的循环形式。

\`\`\`csharp
string[] names = { "张三", "李四", "王五" };
foreach (string name in names)
{
    Console.WriteLine(name);
}
\`\`\`

\`foreach\` 是只读遍历，无法修改集合本身；其底层依赖 \`IEnumerable\`/\`IEnumerator\`，即"迭代器模式"。

### 八、while / do-while ⭐⭐

适用于"未知次数"的循环。

\`\`\`csharp
// while：先判断后执行
int n = 5;
while (n > 0) { Console.WriteLine(n--); }

// do-while：先执行后判断，至少执行一次
int m = 0;
do { Console.WriteLine(m++); } while (m < 3);
\`\`\`

### 九、break / continue / return ⭐⭐⭐

- \`break\`：跳出当前循环
- \`continue\`：跳过本次，进入下一次循环
- \`return\`：直接退出整个方法

\`\`\`csharp
for (int i = 0; i < 10; i++)
{
    if (i == 3) continue;     // 跳过 3
    if (i == 7) break;        // 到 7 终止
    Console.WriteLine(i);     // 输出 0 1 2 4 5 6
}
\`\`\`

### 十、goto（知道即可）⭐

\`goto\` 是最早的跳转语句，C# 保留了它但**几乎不推荐使用**——它会让代码难以维护。唯一可接受的场景是在 \`switch\` 中跳转到其他 \`case\` 标签，或用于跳出深层嵌套循环。日常开发请用结构化语句替代。

### 十一、嵌套循环与标签 ⭐⭐

多重循环中，\`break\` 默认只跳出最内层。要跳出外层需要使用"标签"。

\`\`\`csharp
outer:                                  // 定义标签
for (int i = 0; i < 3; i++)
{
    for (int j = 0; j < 3; j++)
    {
        if (i == 1 && j == 1) goto outer;  // 直接跳到外层标签
        Console.WriteLine($"i={i}, j={j}");
    }
}
\`\`\`

更优雅的做法是把外层循环抽成方法，用 \`return\` 退出。

### 十二、迭代器模式简介 ⭐⭐

\`foreach\` 背后是 \`IEnumerator\` 接口：\`MoveNext()\` 推进、\`Current\` 取当前值。自定义类型实现 \`IEnumerable\` 即可被 \`foreach\` 遍历，这叫"迭代器模式"。配合 \`yield return\` 可以非常简洁地实现惰性序列——后续章节会专门讲解。

### 十三、when 关键字 ⭐⭐

\`when\` 用于在 \`case\` 上附加条件过滤，让模式匹配更精确。

\`\`\`csharp
int score = 85;
string grade = score switch
{
    int s when s >= 90 => "A",
    int s when s >= 80 => "B",
    int s when s >= 60 => "C",
    _ => "F"
};
\`\`\`

C# 9 之后更推荐用**关系模式** \`>= 90\` 直接写，但 \`when\` 在复杂条件下仍很有用。

### 十四、小结

| 语句 | 适用场景 | 备注 |
| --- | --- | --- |
| if-else | 范围判断、复杂条件 | 最通用 |
| switch 语句 | 离散值匹配 | 经典语法 |
| switch 表达式 | 值映射、模式匹配 | 现代 C# 首选 |
| ?: | 二选一赋值 | 简洁但不宜嵌套 |
| for | 已知次数循环 | 三段式 |
| foreach | 集合遍历 | 只读，最常用 |
| while | 先判后执行 | 可能 0 次 |
| do-while | 先执行后判 | 至少 1 次 |
| break/continue | 循环控制 | break 跳出，continue 跳过 |

> 控制流是程序骨架。下一章我们学习"枚举类型"——把一组相关常量组织成可读性极强的命名集合。`,
    code: `// ========================================
// 第十二章 控制流 —— 成绩等级评定程序
// 演示：if-else、switch、switch 表达式、
//       for、foreach、while、break/continue、when
// ========================================
using System;
using System.Collections.Generic;

// ---------- 1. if-else 链：基础评级 ----------
char GradeByIf(int score)
{
    if (score < 0 || score > 100)              // 输入合法性校验
        return '?';                            // 非法返回 ?
    else if (score >= 90) return 'A';          // 90+ 为 A
    else if (score >= 80) return 'B';          // 80+ 为 B
    else if (score >= 70) return 'C';          // 70+ 为 C
    else if (score >= 60) return 'D';          // 60+ 为 D
    else return 'F';                           // 不及格
}

// ---------- 2. 经典 switch 语句 ----------
string CommentBySwitch(char grade)
{
    switch (grade)                             // 根据 grade 分支
    {
        case 'A':                              // 优秀
            return "表现非常优秀，继续保持！";
        case 'B':                              // 良好
            return "表现良好，仍有提升空间。";
        case 'C':                              // 中等
            return "成绩中等，需要更加努力。";
        case 'D':                              // 及格
            return "刚好及格，警告！";
        case 'F':                              // 不及格
            return "不及格，请认真复习。";
        default:                               // 其他情况
            return "未知等级";
    }
}

// ---------- 3. switch 表达式（C# 8+）+ when 关键字 ----------
string GradeBySwitchExpr(int score) => score switch
{
    < 0 or > 100 => "无效分数",                // 逻辑模式 or + 关系模式
    >= 90 => "A",                              // 关系模式
    >= 80 and < 90 => "B",                     // 逻辑模式 and
    int s when s >= 70 => "C",                 // when 子句演示
    int s when s >= 60 => "D",
    _ => "F"                                   // 弃元，等价 default
};

// ---------- 4. for 循环 + break + continue ----------
void PrintPassScores(int[] scores)
{
    Console.WriteLine("---- 及格分数列表 ----");
    for (int i = 0; i < scores.Length; i++)    // 经典 for
    {
        int s = scores[i];
        if (s < 0) continue;                   // 跳过负数（脏数据）
        if (s == 999) break;                   // 遇到 999 提前终止
        if (s >= 60)
            Console.WriteLine($"  第{i + 1}个：{s} ✓");
    }
}

// ---------- 5. foreach 遍历 ----------
void PrintAllGrades(int[] scores)
{
    Console.WriteLine("---- 全部成绩 ----");
    int passCount = 0, failCount = 0;          // 统计计数器
    foreach (int s in scores)                  // 只读遍历
    {
        char g = GradeByIf(s);                 // 复用上面的方法
        Console.WriteLine($"  分数 {s,3} => 等级 {g}");
        if (g == 'F') failCount++; else passCount++;
    }
    Console.WriteLine($"  统计：及格 {passCount} 人，不及格 {failCount} 人");
}

// ---------- 6. while 循环：找到第一个不及格的人 ----------
int? FirstFailIndex(int[] scores)
{
    int i = 0;
    while (i < scores.Length)                  // 先判断后执行
    {
        if (scores[i] < 60) return i;         // 找到就返回索引
        i++;
    }
    return null;                               // 全部及格
}

// ---------- 7. do-while：至少问一次 ----------
void AskUntilValid()
{
    string? input;
    do
    {
        Console.Write("请输入 y 继续：");
        input = Console.ReadLine();
    } while (input != "y");                    // 直到输入 y 才退出
    Console.WriteLine("已确认！");
}

// ---------- 主流程 ----------
int[] scores = { 95, 82, 73, 64, 55, -1, 88, 999, 40 };

Console.WriteLine("== 1. if-else 单个评级 ==");
Console.WriteLine($"95 -> {GradeByIf(95)}");
Console.WriteLine($"55 -> {GradeByIf(55)}");

Console.WriteLine("\\n== 2. switch 表达式评级 ==");
foreach (int s in new[] { 95, 85, 75, 65, 50, -5 })
    Console.WriteLine($"  {s,3} -> {GradeBySwitchExpr(s)}");

Console.WriteLine("\\n== 3. switch 语句评语 ==");
Console.WriteLine($"A: {CommentBySwitch('A')}");
Console.WriteLine($"F: {CommentBySwitch('F')}");

Console.WriteLine("\\n== 4. for + break/continue ==");
PrintPassScores(scores);

Console.WriteLine("\\n== 5. foreach 全量统计 ==");
PrintAllGrades(scores);

Console.WriteLine("\\n== 6. while 找首个不及格 ==");
int? idx = FirstFailIndex(scores);
Console.WriteLine(idx is null ? "  全部及格" : $"  第 {idx + 1} 个不及格");

Console.WriteLine("\\n== 7. 三元运算符 + 嵌套 ==");
int avg = 75;
string label = avg >= 90 ? "优" : avg >= 60 ? "良" : "差";
Console.WriteLine($"  平均分 {avg} -> {label}");

Console.WriteLine("\\n本程序演示完毕！");
`,
    lang: 'cs',
  },

  // ============================================================
  // 第十三章：枚举类型
  // ============================================================
  {
    id: 'csharp4-ch13',
    group: '第二部分 核心语法',
    icon: '🎯',
    title: '枚举类型',
    content: `## 第十三章　枚举类型

枚举（Enum）是一种**值类型**，用于把一组相关的命名常量组织在一起。它让代码告别"魔法数字"，可读性大幅提升。C# 的枚举功能完备：支持指定底层类型、位标志（Flags）、字符串互转、模式匹配等。

### 一、枚举声明 ⭐⭐⭐

\`\`\`csharp
enum Color { Red, Green, Blue }
\`\`\`

默认从 0 开始递增：\`Red=0\`、\`Green=1\`、\`Blue=2\`。也可显式指定：

\`\`\`csharp
enum Color { Red = 1, Green = 2, Blue = 4 }
\`\`\`

### 二、默认底层类型 int ⭐⭐

枚举的底层默认是 \`int\`，但可以指定为其他整型：\`byte\`、\`sbyte\`、\`short\`、\`ushort\`、\`int\`、\`uint\`、\`long\`、\`ulong\`。

\`\`\`csharp
enum Permission : byte { None = 0, Read = 1, Write = 2, Execute = 4 }
\`\`\`

指定 \`byte\` 可节省内存，常用于位标志枚举。

### 三、获取枚举值 ⭐⭐

\`\`\`csharp
Color c = Color.Green;
int v = (int)c;        // 1
Color back = (Color)1; // Green
\`\`\`

枚举与底层整型之间通过**强制转换**互相赋值。

### 四、枚举与字符串互转 ⭐⭐⭐

\`\`\`csharp
// 枚举 -> 字符串
Color c = Color.Red;
string s = c.ToString();   // "Red"

// 字符串 -> 枚举（解析）
Color parsed = (Color)Enum.Parse(typeof(Color), "Green");

// 更安全：TryParse，失败返回 false
if (Enum.TryParse<Color>("Blue", out Color result))
    Console.WriteLine(result);
\`\`\`

\`Enum.Parse\` 失败会抛异常，建议日常使用 \`Enum.TryParse\`。这两个方法还支持 \`ignoreCase\` 参数：\`Enum.TryParse("red", true, out Color r)\`。

### 五、Enum.GetNames / Enum.GetValues ⭐⭐⭐

遍历枚举所有成员，常用于生成下拉选项、文档输出。

\`\`\`csharp
foreach (string name in Enum.GetNames(typeof(Color)))
    Console.WriteLine(name);

foreach (Color c in Enum.GetValues<Color>())   // 泛型版本（C# 8+ 更简洁）
    Console.WriteLine($"{c} = {(int)c}");
\`\`\`

### 六、Flags 特性（位枚举）⭐⭐⭐

当枚举需要"组合"时，加 \`[Flags]\` 特性，并用 2 的幂作为值：

\`\`\`csharp
[Flags]
enum FileAccess { None = 0, Read = 1, Write = 2, Execute = 4 }

FileAccess myAccess = FileAccess.Read | FileAccess.Write;  // 组合：Read+Write = 3
\`\`\`

\`[Flags]\` 让 \`ToString()\` 输出 "Read, Write" 而非 "3"，并支持 \`HasFlag\`。

### 七、位运算组合 ⭐⭐

\`\`\`csharp
FileAccess a = FileAccess.Read | FileAccess.Write;   // 按位或：组合
FileAccess b = a & ~FileAccess.Write;                // 清除 Write
bool hasRead = (a & FileAccess.Read) != 0;           // 测试是否包含
\`\`\`

| 运算 | 含义 |
| --- | --- |
| \`a | b\` | 添加权限 |
| \`a & ~b\` | 移除权限 |
| \`a & b\` | 测试交集 |
| \`a ^ b\` | 切换权限 |

### 八、HasFlag 方法 ⭐⭐

\`\`\`csharp
FileAccess a = FileAccess.Read | FileAccess.Write;
bool canRead = a.HasFlag(FileAccess.Read);   // true
\`\`\`

\`HasFlag\` 比 \`&\` 更易读，但性能稍差（涉及装箱），高热路径仍建议用 \`&\`。

### 九、枚举最佳实践 ⭐⭐⭐

1. **值为 0 的成员要表示"无"**：\`None = 0\`，避免默认值意外等于某个有效选项
2. **位枚举必须用 2 的幂**：1、2、4、8、16...，并加 \`[Flags]\`
3. **不要把枚举当整数滥用**：保持类型安全
4. **校验外部输入**：用 \`Enum.IsDefined\` 检查值是否合法

\`\`\`csharp
if (!Enum.IsDefined(typeof(Color), 999))
    Console.WriteLine("非法值");
\`\`\`

### 十、枚举与 switch 表达式 ⭐⭐⭐

枚举是 \`switch 表达式\` 的最佳搭档——编译器会**警告未覆盖的分支**，是"穷尽匹配"的保证。

\`\`\`csharp
string Describe(Color c) => c switch
{
    Color.Red   => "热情似火",
    Color.Green => "生机盎然",
    Color.Blue  => "深邃宁静",
    _ => "未知色彩"
};
\`\`\`

### 十一、小结

| 知识点 | 关键内容 |
| --- | --- |
| 声明 | \`enum Name { A, B, C }\` |
| 底层类型 | 默认 int，可指定 byte/short/long 等 |
| 互转 | \`ToString\` / \`Enum.Parse\` / \`Enum.TryParse\` |
| 遍历 | \`Enum.GetNames\` / \`Enum.GetValues\` |
| 位枚举 | \`[Flags]\` + 2 的幂 + \`HasFlag\` |
| 校验 | \`Enum.IsDefined\` 防止非法值 |
| 模式匹配 | switch 表达式穷尽匹配 |

> 枚举是消除魔法数字的利器。下一章学习"元组与解构"——多值返回的优雅方案。`,
    code: `// ========================================
// 第十三章 枚举类型 —— 完整演示
// 普通枚举、Flags 位枚举、字符串互转、
// Enum.GetValues、HasFlag、switch 表达式
// ========================================
using System;

// ---------- 1. 普通枚举：默认底层 int ----------
enum WeekDay { Monday = 1, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday }
// Monday=1, Tuesday=2, ..., Sunday=7

// ---------- 2. 指定底层类型为 byte ----------
enum Priority : byte { Low = 1, Normal = 2, High = 3, Critical = 4 }

// ---------- 3. Flags 位枚举 ----------
[Flags]                                        // 关键特性
enum FileAccess { None = 0, Read = 1, Write = 2, Execute = 4 }
// 值为 2 的幂才能正确组合

// ---------- 4. switch 表达式与枚举 ----------
string DescribeWeekDay(WeekDay d) => d switch
{
    WeekDay.Monday => "周一：开始工作",
    WeekDay.Tuesday => "周二：进入状态",
    WeekDay.Wednesday => "周三：进度过半",
    WeekDay.Thursday => "周四：冲刺中",
    WeekDay.Friday => "周五：即将解放",
    WeekDay.Saturday => "周六：休息日",
    WeekDay.Sunday => "周日：充电日",
    _ => "未知"                                  // 兜底
};

// ---------- 主流程 ----------
Console.WriteLine("==== 1. 普通枚举基础 ====");
WeekDay today = WeekDay.Wednesday;
Console.WriteLine($"今天：{today}");             // ToString() -> "Wednesday"
Console.WriteLine($"整数值：{(int)today}");       // 强转获取底层数值 -> 3
WeekDay fromInt = (WeekDay)5;                   // 整数 -> 枚举
Console.WriteLine($"5 -> {fromInt}");

Console.WriteLine("\\n==== 2. 字符串 <-> 枚举 ====");
// 枚举转字符串
string name = today.ToString();
Console.WriteLine($"ToString: {name}");

// Enum.Parse：解析字符串（区分大小写，失败抛异常）
WeekDay parsed = (WeekDay)Enum.Parse(typeof(WeekDay), "Friday");
Console.WriteLine($"Parse 'Friday': {parsed}");

// Enum.TryParse：安全解析，不抛异常
if (Enum.TryParse<WeekDay>("sunday", ignoreCase: true, out WeekDay result))
    Console.WriteLine($"TryParse 'sunday'(忽略大小写): {result}");
else
    Console.WriteLine("解析失败");

// Enum.IsDefined：检查值是否合法
Console.WriteLine($"999 合法吗？{Enum.IsDefined(typeof(WeekDay), 999)}");
Console.WriteLine($"3 合法吗？{Enum.IsDefined(typeof(WeekDay), 3)}");

Console.WriteLine("\\n==== 3. Enum.GetNames / GetValues ====");
Console.WriteLine("WeekDay 所有成员名：");
foreach (string n in Enum.GetNames(typeof(WeekDay)))
    Console.WriteLine($"  - {n}");

Console.WriteLine("Priority 所有成员（名 + 值）：");
foreach (Priority p in Enum.GetValues<Priority>())  // 泛型版本，无需 typeof
    Console.WriteLine($"  {p} = {(byte)p}");

Console.WriteLine("\\n==== 4. byte 底层类型 ====");
Priority pri = Priority.High;
byte priValue = (byte)pri;                       // 转换为 byte
Console.WriteLine($"{pri} 底层值 = {priValue}");

Console.WriteLine("\\n==== 5. Flags 位枚举 ====");
// 组合：读 + 写
FileAccess myAccess = FileAccess.Read | FileAccess.Write;
Console.WriteLine($"Read | Write = {myAccess}"); // [Flags] 让 ToString 输出 "Read, Write"
Console.WriteLine($"整数值 = {(int)myAccess}");   // 3 = 1 | 2

// HasFlag：判断是否包含某权限
Console.WriteLine($"包含 Read? {myAccess.HasFlag(FileAccess.Read)}");
Console.WriteLine($"包含 Execute? {myAccess.HasFlag(FileAccess.Execute)}");

// 位运算：移除 Write
FileAccess onlyRead = myAccess & ~FileAccess.Write;
Console.WriteLine($"移除 Write 后：{onlyRead}");

// 位运算：切换 Execute
FileAccess toggled = myAccess ^ FileAccess.Execute;
Console.WriteLine($"切换 Execute 后：{toggled}");

// 判断"无"
FileAccess empty = FileAccess.None;
Console.WriteLine($"None == 0? {(int)empty == 0}");

Console.WriteLine("\\n==== 6. switch 表达式 ====");
foreach (WeekDay d in new[] { WeekDay.Monday, WeekDay.Saturday, WeekDay.Sunday })
    Console.WriteLine($"  {d}: {DescribeWeekDay(d)}");

Console.WriteLine("\\n==== 7. 遍历 Flags 枚举所有单值 ====");
Console.WriteLine("FileAccess 单值列表：");
foreach (FileAccess f in Enum.GetValues<FileAccess>())
    if (f != FileAccess.None && !f.ToString().Contains(","))  // 只输出单值
        Console.WriteLine($"  {f} = {(int)f}");

Console.WriteLine("\\n枚举演示完毕！");
`,
    lang: 'cs',
  },

  // ============================================================
  // 第十四章：元组与解构
  // ============================================================
  {
    id: 'csharp4-ch14',
    group: '第二部分 核心语法',
    icon: '📦',
    title: '元组与解构',
    content: `## 第十四章　元组与解构

元组（Tuple）让你"一次返回多个值"而不必定义专门的类。C# 7 引入的 **ValueTuple** 是值类型的轻量元组，配合元组字面量、解构语法，让多值处理变得极其自然。

### 一、Tuple vs ValueTuple ⭐⭐

| 类型 | 引入版本 | 类型性质 | 元素访问 | 推荐 |
| --- | --- | --- | --- | --- |
| \`System.Tuple\` | C# 4 | 引用类型（堆） | \`Item1\`/\`Item2\` 固定名 | ❌ 旧代码才用 |
| \`System.ValueTuple\` | C# 7+ | 值类型（栈） | 可自定义名字 | ✅ 现代首选 |

旧 \`Tuple\` 是引用类型，每次都要 \`new\`；新 \`ValueTuple\` 是结构体，配合 \`(\` \`)\` 字面量语法极其简洁。

### 二、元组字面量 ⭐⭐⭐

\`\`\`csharp
var t = (1, "张三");                  // 元组字面量
Console.WriteLine(t.Item1);           // 1
Console.WriteLine(t.Item2);           // "张三"
\`\`\`

### 三、元素命名：Item1 vs 自定义名字 ⭐⭐⭐

\`\`\`csharp
var p = (Age: 25, Name: "李四");      // 左侧命名
Console.WriteLine(p.Age);             // 25
Console.WriteLine(p.Name);            // "李四"
Console.WriteLine(p.Item1);           // 25（Item1 仍然可用）

// 类型上也可命名
(int Age, string Name) person = (30, "王五");
Console.WriteLine(person.Name);
\`\`\`

注意：元素名是**编译期**信息，运行时通过反射只能看到 \`Item1\`/\`Item2\`。

### 四、元组解构 Deconstruct ⭐⭐⭐

把元组"拆开"赋值给多个变量：

\`\`\`csharp
var t = (1, "张三", true);
(int id, string name, bool active) = t;     // 解构
\`\`\`

任何类型只要提供 \`Deconstruct\` 方法就能被解构：

\`\`\`csharp
class Point
{
    public int X { get; set; }
    public int Y { get; set; }
    public void Deconstruct(out int x, out int y) { x = X; y = Y; }
}

Point p = new() { X = 3, Y = 4 };
var (x, y) = p;                              // 调用 Deconstruct
\`\`\`

### 五、元组作为方法返回值 ⭐⭐⭐

元组最常见的用途：**多返回值**。

\`\`\`csharp
(string, bool) FindUser(int id)
{
    if (id == 1) return ("张三", true);
    return ("", false);
}

var (name, found) = FindUser(1);
\`\`\`

比 \`out\` 参数更优雅，调用点不需要先声明变量。

### 六、元组作为参数 ⭐⭐

\`\`\`csharp
void Print((string Name, int Age) p)
{
    Console.WriteLine($"{p.Name}, {p.Age}");
}
Print(("赵六", 28));
\`\`\`

### 七、discard _（弃元）⭐⭐⭐

不需要的元素用 \`_\` 丢弃：

\`\`\`csharp
var (_, name) = FindUser(1);     // 只要 name，丢弃 bool
\`\`\`

### 八、元组比较 ⭐⭐

元组支持 \`==\` 和 \`!=\`，按元素逐个比较（C# 7.3+）。

\`\`\`csharp
var a = (1, "x");
var b = (1, "x");
Console.WriteLine(a == b);       // True
\`\`\`

### 九、元组与 out 参数对比 ⭐⭐

| 维度 | 元组 | out 参数 |
| --- | --- | --- |
| 调用体验 | 一步到位 | 需先声明变量 |
| 数量限制 | 任意 | 任意 |
| 类型安全 | ✅ 强类型 | ✅ 强类型 |
| 性能 | 值类型，无 GC | 类似 |
| 兼容性 | C# 7+ | 全版本 |

现代 C# 推荐用元组替代多 \`out\` 参数。\`TryXxx\` 模式因历史原因保留 \`out\`，但新代码也可以这样写：

\`\`\`csharp
(bool Ok, int Value) TryParse(string s)
{
    return int.TryParse(s, out int v) ? (true, v) : (false, 0);
}
\`\`\`

### 十、record 与元组对比 ⭐⭐

\`record\`（C# 9+）也是表达"数据组合"的方式，区别：

- **元组**：临时、轻量、无身份，适合内部传递
- **record**：有名字、有身份、可序列化、支持继承接口，适合 API 边界

\`\`\`csharp
public record Person(string Name, int Age);   // 有类型名，可做参数类型
\`\`\`

### 十一、小结

| 知识点 | 关键内容 |
| --- | --- |
| ValueTuple | C# 7+ 值类型元组，首选 |
| 字面量 | \`(1, "x")\` |
| 命名 | \`(Age: 1, Name: "x")\` |
| 解构 | \`var (a, b) = t;\` |
| 多返回值 | \`(string, bool) Foo()\` |
| 弃元 | \`_\` |
| 比较 | \`a == b\` 逐元素 |
| Deconstruct | 自定义类型也能解构 |

> 元组让多值处理极其轻量。下一章学习 C# 最优雅的特性——"模式匹配"。`,
    code: `// ========================================
// 第十四章 元组与解构 —— 完整演示
// 元组创建、解构、多返回值、Deconstruct、
// 弃元、比较、与 out 对比
// ========================================
using System;
using System.Collections.Generic;

// ---------- 1. 元组字面量 ----------
void TupleBasics()
{
    Console.WriteLine("== 1. 元组字面量 ==");
    var t = (1, "张三");                       // 推断为 (int, string)
    Console.WriteLine($"  Item1 = {t.Item1}"); // 默认名字 Item1
    Console.WriteLine($"  Item2 = {t.Item2}");

    // 自定义元素名
    var p = (Age: 25, Name: "李四");
    Console.WriteLine($"  Age = {p.Age}, Name = {p.Name}");
    Console.WriteLine($"  Item1 仍可用：{p.Item1}"); // Item1 == Age

    // 类型签名中命名
    (int Age, string Name) person = (30, "王五");
    Console.WriteLine($"  {person.Name}, {person.Age} 岁");
}

// ---------- 2. 元组作为方法返回值（多返回值） ----------
(string Name, bool Found) FindUser(int id)
{
    if (id == 1) return ("张三", true);        // 命中
    if (id == 2) return ("李四", true);
    return ("", false);                        // 未找到
}

// ---------- 3. 元组替代 out 参数 ----------
(bool Ok, int Value) TryParseInt(string s)
{
    if (int.TryParse(s, out int v)) return (true, v);
    return (false, 0);
}

// ---------- 4. 元组作为参数 ----------
void PrintPerson((string Name, int Age) p)
{
    Console.WriteLine($"  {p.Name}, {p.Age} 岁");
}

// ---------- 5. 自定义 Deconstruct ----------
class Point
{
    public int X { get; set; }
    public int Y { get; set; }
    public Point(int x, int y) { X = x; Y = y; }

    // 提供 Deconstruct 即可被解构
    public void Deconstruct(out int x, out int y)
    {
        x = X;
        y = Y;
    }
}

class Range
{
    public int Min { get; set; }
    public int Max { get; set; }
    public Range(int min, int max) { Min = min; Max = max; }

    public void Deconstruct(out int min, out int max)
    {
        min = Min;
        max = Max;
    }
}

// ---------- 6. 元组比较 ----------
void TupleComparison()
{
    Console.WriteLine("== 6. 元组比较 ==");
    var a = (1, "x");
    var b = (1, "x");
    var c = (2, "x");
    Console.WriteLine($"  (1,'x') == (1,'x') ? {a == b}");   // True
    Console.WriteLine($"  (1,'x') == (2,'x') ? {a == c}");   // False
}

// ---------- 主流程 ----------
TupleBasics();

Console.WriteLine("\\n== 2. 多返回值 ==");
var (name, found) = FindUser(2);               // 解构返回值
Console.WriteLine($"  id=2 -> name={name}, found={found}");

var (_, notFound) = FindUser(99);              // 弃元 _ 丢弃 name
Console.WriteLine($"  id=99 -> found={notFound}");

Console.WriteLine("\\n== 3. 替代 out ==");
var (ok, val) = TryParseInt("42");
Console.WriteLine($"  '42' -> ok={ok}, val={val}");
var (ok2, val2) = TryParseInt("abc");
Console.WriteLine($"  'abc' -> ok={ok2}, val={val2}");

Console.WriteLine("\\n== 4. 元组作参数 ==");
PrintPerson(("赵六", 28));

Console.WriteLine("\\n== 5. 自定义 Deconstruct ==");
Point pt = new Point(3, 4);
var (px, py) = pt;                             // 解构 Point
Console.WriteLine($"  Point -> ({px}, {py})");

Range r = new Range(10, 100);
var (min, max) = r;
Console.WriteLine($"  Range -> [{min}, {max}]");

TupleComparison();

Console.WriteLine("\\n== 7. 元组列表（替代临时类型） ==");
List<(string Name, int Score)> list = new()
{
    ("张三", 90),
    ("李四", 85),
    ("王五", 60)
};
foreach (var (n, s) in list)                   // foreach 中直接解构
    Console.WriteLine($"  {n}: {s}");

Console.WriteLine("\\n元组演示完毕！");
`,
    lang: 'cs',
  },

  // ============================================================
  // 第十五章：模式匹配
  // ============================================================
  {
    id: 'csharp4-ch15',
    group: '第二部分 核心语法',
    icon: '🧩',
    title: '模式匹配',
    content: `## 第十五章　模式匹配

模式匹配（Pattern Matching）是现代 C# 最优雅的特性之一。它从 C# 7 起步，到 C# 12 已经发展成一套完整的"数据形状描述"语法——让你像写正则一样匹配数据的结构和值。

### 一、模式匹配演进 ⭐⭐

| 版本 | 关键能力 |
| --- | --- |
| C# 7 | \`is\` 类型模式、switch 中的模式、\`when\` |
| C# 8 | switch 表达式、属性模式、位置模式 |
| C# 9 | 关系模式（\`>\` \`<\`）、逻辑模式（\`and\`/\`or\`/\`not\`） |
| C# 10 | 嵌套属性扩展 |
| C# 11 | 列表模式 \`[a, b, ..]\`、\`var\` 模式扩展 |
| C# 12 | 列表模式改进、跨模式组合 |

### 二、is 类型模式 ⭐⭐⭐

\`\`\`csharp
object o = "hello";
if (o is string s)                  // 类型检查 + 变量绑定
    Console.WriteLine(s.Length);
\`\`\`

\`o is string s\` 一次完成"类型判断 + 赋值"，比旧写法 \`if (o is string) { var s = (string)o; }\` 简洁太多。

### 三、switch 表达式 ⭐⭐⭐

\`\`\`csharp
int n = 5;
string label = n switch
{
    1 or 2 => "small",              // 逻辑模式
    3 or 4 or 5 => "mid",
    _ => "large"
};
\`\`\`

### 四、类型模式 ⭐⭐⭐

\`\`\`csharp
string Describe(object o) => o switch
{
    int i => $"整数：{i}",
    string s => $"字符串：{s}",
    bool b => $"布尔：{b}",
    null => "null",
    _ => "其他类型"
};
\`\`\`

### 五、属性模式 {Prop: value} ⭐⭐⭐

匹配对象属性的"形状"：

\`\`\`csharp
class Person { public string Name { get; set; } public int Age { get; set; } }

string Describe(Person p) => p switch
{
    { Age: < 18 } => "未成年",
    { Age: >= 60 } => "老年",
    { Name: "Admin" } => "管理员",
    _ => "普通用户"
};
\`\`\`

可嵌套：\`{ Address: { City: "北京" } }\`。

### 六、位置模式 ⭐⭐

基于 \`Deconstruct\` 的位置匹配：

\`\`\`csharp
class Point { public int X, Y; public void Deconstruct(out int x, out int y) => (x, y) = (X, Y); }

string Where(Point p) => p switch
{
    (0, 0) => "原点",
    (0, _) => "Y 轴",
    (_, 0) => "X 轴",
    (var x, var y) => $"({x},{y})"
};
\`\`\`

### 七、when 子句 ⭐⭐

给 case 附加任意条件：

\`\`\`csharp
int score = 85;
string grade = score switch
{
    int s when s >= 90 => "A",
    int s when s >= 80 => "B",
    _ => "C"
};
\`\`\`

C# 9+ 用关系模式更简洁：\`>= 90 => "A"\`。

### 八、关系模式（C# 9+）⭐⭐⭐

\`\`\`csharp
string Level(int n) => n switch
{
    < 0 => "负数",
    0 => "零",
    > 0 and < 10 => "小正数",
    >= 10 => "大正数"
};
\`\`\`

### 九、逻辑模式（C# 9+）⭐⭐⭐

\`and\`、\`or\`、\`not\` 三个组合器：

\`\`\`csharp
bool IsVowel(char c) => c is 'a' or 'e' or 'i' or 'o' or 'u';
bool IsNotnull(object o) => o is not null;
\`\`\`

可加括号改变优先级：\`(> 0 and < 10) or (> 100 and < 200)\`。

### 十、列表模式（C# 11+）⭐⭐

匹配数组/列表的"形状"：

\`\`\`csharp
int[] arr = { 1, 2, 3, 4 };
string desc = arr switch
{
    [] => "空数组",
    [var single] => $"单元素：{single}",
    [var a, var b] => $"两元素：{a},{b}",
    [var first, .., var last] => $"首={first}, 尾={last}",   // .. 切片
    _ => "其他"
};
\`\`\`

\`..\` 是切片，可绑定：\`[var first, .. var middle, var last]\`。

### 十一、弃元 _ 与 var 模式 ⭐⭐

- \`_\`：匹配任意值，**丢弃**
- \`var\`：匹配任意值，**绑定到变量**

\`\`\`csharp
object o = 42;
if (o is var x)              // 总是 true，x 接住 o（包括 null）
    Console.WriteLine(x);
\`\`\`

### 十二、模式匹配 vs if-else ⭐⭐

| 维度 | if-else | 模式匹配 |
| --- | --- | --- |
| 可读性 | 多条件易乱 | 表达力强，结构清晰 |
| 类型解构 | 需手动强转 | 一步到位 |
| 穷尽性 | 无保证 | switch 表达式对枚举有警告 |
| 灵活度 | 任意条件 | 受模式语法约束 |

模式匹配不是要"消灭" if-else，而是**让分支表达更贴合数据形状**。

### 十三、小结

| 模式 | 示例 |
| --- | --- |
| 类型 | \`is int x\` |
| 属性 | \`{ Age: > 18 }\` |
| 位置 | \`(0, 0)\` |
| 关系 | \`>= 90\` |
| 逻辑 | \`and\`/\`or\`/\`not\` |
| 列表 | \`[a, b, ..]\` |
| 弃元 | \`_\` |
| var | \`is var x\` |

> 模式匹配是现代 C# 的灵魂。下一章学习"可空值类型"——优雅地处理"可能没有值"的场景。`,
    code: `// ========================================
// 第十五章 模式匹配 —— 完整演示
// 类型模式、属性模式、位置模式、when、
// 关系模式、逻辑模式、列表模式
// ========================================
using System;
using System.Collections.Generic;

// ---------- 用于演示的类型 ----------
class Person
{
    public string Name { get; set; } = "";
    public int Age { get; set; }
    public string? City { get; set; }
    public void Deconstruct(out string name, out int age)
    {
        name = Name;
        age = Age;
    }
}

class Point
{
    public int X { get; set; }
    public int Y { get; set; }
    public Point(int x, int y) { X = x; Y = y; }
    public void Deconstruct(out int x, out int y) { x = X; y = Y; }
}

// ---------- 1. is 类型模式 ----------
void TypePatternIs()
{
    Console.WriteLine("== 1. is 类型模式 ==");
    object o = "hello C#";
    if (o is string s)                        // 类型检查 + 绑定
        Console.WriteLine($"  是字符串，长度 {s.Length}");
    else
        Console.WriteLine("  不是字符串");

    object n = 42;
    if (n is int i && i > 0)                  // 类型 + 条件组合
        Console.WriteLine($"  正整数：{i}");
}

// ---------- 2. switch 表达式 + 类型模式 ----------
string DescribeType(object o) => o switch
{
    int i => $"整数：{i}",                     // 类型 + 绑定
    string s => $"字符串：{s}",                // 类型 + 绑定
    bool b => $"布尔：{b}",
    double d => $"双精度：{d:F2}",
    null => "null！",                          // 匹配 null
    _ => "未知类型"                            // 弃元兜底
};

// ---------- 3. 属性模式 ----------
string DescribePerson(Person p) => p switch
{
    null => "空对象",                          // 防御 null
    { Name: "Admin" } => "管理员",             // 属性匹配
    { Age: < 18 } => "未成年",                 // 属性 + 关系
    { Age: >= 60 } => "老年",
    { Age: >= 18, City: "北京" } => "北京成年人",  // 多属性
    { City: null } => "无城市信息",            // 属性为 null
    _ => "普通人"
};

// ---------- 4. 位置模式 ----------
string WherePoint(Point p) => p switch
{
    (0, 0) => "原点",                          // 字面位置
    (0, _) => "Y 轴",                          // _ 弃元
    (_, 0) => "X 轴",
    (var x, var y) when x == y => "对角线",    // when 子句
    (var x, var y) => $"普通点 ({x},{y})"      // var 绑定
};

// ---------- 5. 关系模式 + 逻辑模式 ----------
string Grade(int score) => score switch
{
    < 0 or > 100 => "无效分数",                // or 逻辑模式
    >= 90 => "A",
    >= 80 and < 90 => "B",                     // and 逻辑模式
    >= 70 and < 80 => "C",
    >= 60 and < 70 => "D",
    not 0 => "F (非零)",                       // not 逻辑模式
    0 => "零分"
};

bool IsVowel(char c) => c is 'a' or 'e' or 'i' or 'o' or 'u';

// ---------- 6. 列表模式（C# 11+） ----------
string DescribeArray(int[] arr) => arr switch
{
    [] => "空数组",                            // 空模式
    [var single] => $"单元素：{single}",       // 1 个元素
    [var a, var b] => $"两元素：{a}, {b}",     // 2 个
    [var first, _, _, var last] => $"4 元素：首={first} 尾={last}",
    [var first, .. var middle, var last] => $"首={first} 中间{middle.Length}个 尾={last}",
    _ => "其他"
};

// ---------- 主流程 ----------
TypePatternIs();

Console.WriteLine("\\n== 2. switch + 类型模式 ==");
foreach (object o in new object[] { 42, "hi", true, 3.14, null, new List<int>() })
    Console.WriteLine($"  {o ?? "null"} -> {DescribeType(o)}");

Console.WriteLine("\\n== 3. 属性模式 ==");
var people = new[]
{
    new Person { Name = "Admin", Age = 30 },
    new Person { Name = "小明", Age = 12 },
    new Person { Name = "老王", Age = 65 },
    new Person { Name = "张三", Age = 25, City = "北京" },
    new Person { Name = "李四", Age = 30, City = null },
    null!
};
foreach (var p in people)
    Console.WriteLine($"  -> {DescribePerson(p)}");

Console.WriteLine("\\n== 4. 位置模式 + when ==");
foreach (var pt in new[] { new Point(0,0), new Point(0,5), new Point(3,0), new Point(4,4), new Point(1,2) })
    Console.WriteLine($"  ({pt.X},{pt.Y}) -> {WherePoint(pt)}");

Console.WriteLine("\\n== 5. 关系 + 逻辑模式 ==");
foreach (int s in new[] { 95, 85, 75, 65, 50, 0, -5, 200 })
    Console.WriteLine($"  {s,4} -> {Grade(s)}");

Console.WriteLine($"  'a' 是元音？{IsVowel('a')}");
Console.WriteLine($"  'x' 是元音？{IsVowel('x')}");

Console.WriteLine("\\n== 6. 列表模式 ==");
int[][] arrays =
{
    Array.Empty<int>(),
    new[] { 7 },
    new[] { 1, 2 },
    new[] { 1, 2, 3, 4 },
    new[] { 10, 20, 30, 40, 50 }
};
foreach (var arr in arrays)
    Console.WriteLine($"  [{string.Join(",", arr)}] -> {DescribeArray(arr)}");

Console.WriteLine("\\n== 7. 嵌套属性模式 ==");
Person person = new() { Name = "Alice", Age = 28, City = "上海" };
string label = person switch
{
    { Name: "Admin" } => "管理员账号",
    { Age: < 18, City: not null } => "未成年（已知城市）",
    { Age: >= 18, City: "上海" or "北京" } => "一线城市成年人",
    _ => "其他"
};
Console.WriteLine($"  Alice -> {label}");

Console.WriteLine("\\n模式匹配演示完毕！");
`,
    lang: 'cs',
  },

  // ============================================================
  // 第十六章：可空值类型
  // ============================================================
  {
    id: 'csharp4-ch16',
    group: '第二部分 核心语法',
    icon: '❓',
    title: '可空值类型',
    content: `## 第十六章　可空值类型

值类型（\`int\`、\`bool\`、\`DateTime\` 等）默认**不能为 null**。但现实世界的数据常常"可能没有值"——比如数据库中的 NULL、JSON 中缺失的字段、未填写的表单。C# 用 \`Nullable<T>\` 解决这个问题。

### 一、Nullable<T> 结构 ⭐⭐

\`Nullable<T>\` 是一个泛型结构，内部封装一个 \`T\` 和一个 \`bool\` 标志：

\`\`\`csharp
Nullable<int> n = null;        // 显式写法
int? m = null;                 // 语法糖，等价
\`\`\`

\`int?\` 就是 \`Nullable<int>\` 的简写，是最常见的可空值类型。

### 二、int? 语法 ⭐⭐⭐

\`\`\`csharp
int? a = null;
int? b = 42;

int? c = 10;
int? d = c;                    // 可空之间赋值
\`\`\`

### 三、HasValue / Value ⭐⭐⭐

\`\`\`csharp
int? x = 5;
if (x.HasValue)
    Console.WriteLine(x.Value);   // 5

int? y = null;
Console.WriteLine(y.HasValue);    // False
// Console.WriteLine(y.Value);    // ❌ 抛 InvalidOperationException
\`\`\`

\`Value\` 在 \`HasValue\` 为 false 时访问会抛异常——**永远先检查 \`HasValue\`** 或用 \`??\` 兜底。

### 四、GetValueOrDefault ⭐⭐

安全取值，避免异常：

\`\`\`csharp
int? n = null;
int v1 = n.GetValueOrDefault();       // 0（默认值）
int v2 = n.GetValueOrDefault(-1);     // -1（自定义默认值）
\`\`\`

### 五、?? 运算符（null 合并）⭐⭐⭐

\`a ?? b\`：如果 \`a\` 为 null，返回 \`b\`，否则返回 \`a\`。

\`\`\`csharp
int? age = null;
int actualAge = age ?? 18;            // 18
\`\`\`

\`??\` 是处理可空类型**最常用**的运算符，比 \`GetValueOrDefault\` 更通用（也能用于可空引用类型）。

### 六、??= 复合赋值（C# 8+）⭐⭐

\`a ??= b\`：如果 \`a\` 为 null，把 \`b\` 赋给 \`a\`。

\`\`\`csharp
int? value = null;
value ??= 100;                        // 现在 value = 100
value ??= 200;                        // 不变，仍是 100
\`\`\`

常用于"惰性初始化"和"缓存填充"。

### 七、可空类型与运算符（lifted operators）⭐⭐

当运算符作用于可空类型时，编译器自动"提升"运算：

\`\`\`csharp
int? a = 5, b = 3;
int? sum = a + b;        // 8
int? diff = a - b;       // 2

int? x = null, y = 10;
int? r1 = x + y;         // null（任一为 null 结果为 null）
int? r2 = x * y;         // null
\`\`\`

规则：**任一操作数为 null，结果为 null**。

### 八、可空 bool 的特殊语义 ⭐⭐

\`bool?\` 有三种状态：\`true\`、\`false\`、\`null\`，类似 SQL 的三值逻辑。

\`\`\`csharp
bool? a = null, b = true;
bool? and = a & b;       // null（不能确定）
bool? or = a | b;        // true（b 为 true）
\`\`\`

| a | b | a & b | a | b |
| --- | --- | --- | --- |
| true | null | null | true |
| false | null | false | null |
| null | null | null | null |

在 \`if\` 条件中**不能直接用 \`bool?\`**，必须显式判断 \`== true\`。

### 九、可空类型作为参数 ⭐⭐

\`\`\`csharp
void PrintAge(int? age)
{
    string label = age.HasValue ? $"年龄 {age}" : "未填写";
    Console.WriteLine(label);
}
PrintAge(25);     // 年龄 25
PrintAge(null);   // 未填写
\`\`\`

### 十、可空类型与装箱 ⭐⭐

\`\`\`csharp
int? n = null;
object o = n;            // 装箱为 null（不是 Nullable<int> 的箱子）
Console.WriteLine(o == null);   // True

int? m = 5;
object o2 = m;           // 装箱为 int（5），不是 Nullable<int>
Console.WriteLine(o2.GetType());  // System.Int32
\`\`\`

可空类型装箱时，**null 装成 null，有值则装箱内部值**。这是为了与数据库和反射良好配合。

### 十一、与数据库/JSON 反序列化场景 ⭐⭐⭐

这是可空值类型**最重要的实战场景**：

- 数据库字段允许 NULL → 实体属性用 \`int?\`/\`DateTime?\`/\`decimal?\`
- JSON 中字段可能缺失 → DTO 属性用可空类型，反序列化时缺失字段为 null

\`\`\`csharp
class UserDto
{
    public string Name { get; set; } = "";
    public int? Age { get; set; }            // 可空，JSON 缺失时为 null
    public DateTime? LastLogin { get; set; } // 可空，从未登录过为 null
}
\`\`\`

### 十二、小结

| 知识点 | 关键内容 |
| --- | --- |
| 语法 | \`int?\` = \`Nullable<int>\` |
| 取值 | \`HasValue\` + \`Value\` |
| 默认值 | \`GetValueOrDefault()\` / \`GetValueOrDefault(x)\` |
| 合并 | \`a ?? b\` |
| 复合赋值 | \`a ??= b\` |
| 运算 | 提升运算符，任一 null 结果 null |
| 三值 bool | \`bool?\` 有 \`true\`/\`false\`/\`null\` |
| 装箱 | null 装成 null，有值装箱内部值 |
| 实战 | DB NULL、JSON 缺失字段 |

> 可空值类型是"现实数据"的桥梁。下一章学习"可空引用类型"——C# 8 引入的引用类型 null 安全机制。`,
    code: `// ========================================
// 第十六章 可空值类型 —— 完整演示
// int? 操作、?? / ??=、提升运算符、
// 可空 bool、装箱、JSON/DB 场景
// ========================================
using System;
using System.Text.Json;

// ---------- 1. 基础：声明与取值 ----------
void Basics()
{
    Console.WriteLine("== 1. 声明与取值 ==");
    int? a = null;                            // 可空 int，初始为 null
    int? b = 42;                              // 有值 42

    Console.WriteLine($"  a.HasValue = {a.HasValue}");  // False
    Console.WriteLine($"  b.HasValue = {b.HasValue}");  // True
    Console.WriteLine($"  b.Value = {b.Value}");        // 42

    // 错误示范（被注释）：
    // Console.WriteLine(a.Value);  // ❌ 会抛 InvalidOperationException

    // 安全取值
    int safeA = a.GetValueOrDefault();        // 默认 0
    int safeA2 = a.GetValueOrDefault(-1);     // 自定义默认 -1
    int safeB = b.GetValueOrDefault(-1);      // 42
    Console.WriteLine($"  a 默认值：{safeA} / {safeA2}");
    Console.WriteLine($"  b 默认值：{safeB}");
}

// ---------- 2. ?? 运算符 ----------
void NullCoalescing()
{
    Console.WriteLine("\\n== 2. ?? 运算符 ==");
    int? age = null;
    int actualAge = age ?? 18;                // age 为 null，取 18
    Console.WriteLine($"  age ?? 18 = {actualAge}");

    int? score = 90;
    int actualScore = score ?? 60;            // score 有值，取 90
    Console.WriteLine($"  score ?? 60 = {actualScore}");

    // 链式 ??
    string? name = null;
    string? displayName = null;
    string final = name ?? displayName ?? "匿名";
    Console.WriteLine($"  链式 ?? = {final}");
}

// ---------- 3. ??= 复合赋值 ----------
void NullCoalescingAssignment()
{
    Console.WriteLine("\\n== 3. ??= 复合赋值 ==");
    int? value = null;
    value ??= 100;                            // null 时赋 100
    Console.WriteLine($"  首次 ??= 后：{value}");  // 100
    value ??= 200;                            // 已有值，不变
    Console.WriteLine($"  二次 ??= 后：{value}");  // 100

    // 惰性初始化模式
    string? cache = null;
    cache ??= ExpensiveCompute();             // 首次调用计算
    cache ??= ExpensiveCompute();             // 二次不调用
    Console.WriteLine($"  缓存：{cache}");
}

string ExpensiveCompute()
{
    Console.WriteLine("  [执行了一次耗时计算]");
    return "CachedData";
}

// ---------- 4. 提升运算符 ----------
void LiftedOperators()
{
    Console.WriteLine("\\n== 4. 提升运算符 ==");
    int? a = 10, b = 3;
    Console.WriteLine($"  {a} + {b} = {a + b}");   // 13
    Console.WriteLine($"  {a} - {b} = {a - b}");   // 7
    Console.WriteLine($"  {a} * {b} = {a * b}");   // 30

    int? x = null, y = 5;
    Console.WriteLine($"  null + 5 = {x + y}");    // null
    Console.WriteLine($"  null * 5 = {x * y}");    // null
    Console.WriteLine($"  null < 5 ? {(x < y)}");   // False（比较 null 不抛异常）

    // 比较运算：null 与任何数比较都是 false
    int? m = null, n = 10;
    Console.WriteLine($"  null > 10 ? {m > n}");    // False
    Console.WriteLine($"  null <= 10 ? {m <= n}");  // False
}

// ---------- 5. 可空 bool 三值逻辑 ----------
void NullableBool()
{
    Console.WriteLine("\\n== 5. 可空 bool ==");
    bool? t = true, f = false, n = null;

    Console.WriteLine($"  null & true = {n & t}");   // null
    Console.WriteLine($"  null | true = {n | t}");   // true
    Console.WriteLine($"  null & false = {n & f}");  // false
    Console.WriteLine($"  null | false = {n | f}");  // null
    Console.WriteLine($"  !null = {!n}");            // null

    // if 中不能直接用 bool?，必须 == true
    bool? flag = null;
    if (flag == true)                          // 显式判断
        Console.WriteLine("  flag 为 true");
    else if (flag == false)
        Console.WriteLine("  flag 为 false");
    else
        Console.WriteLine("  flag 为 null（未知）");
}

// ---------- 6. 装箱行为 ----------
void Boxing()
{
    Console.WriteLine("\\n== 6. 装箱 ==");
    int? withValue = 99;
    int? withoutValue = null;

    object o1 = withValue;                     // 装箱为 int
    object o2 = withoutValue;                  // 装箱为 null

    Console.WriteLine($"  有值装箱类型：{o1?.GetType().Name}");  // Int32
    Console.WriteLine($"  无值装箱是否 null：{o2 == null}");      // True

    // 拆箱回可空
    int? back = (int?)o1;
    Console.WriteLine($"  拆箱回来：{back}");
}

// ---------- 7. JSON 反序列化场景 ----------
void JsonScenario()
{
    Console.WriteLine("\\n== 7. JSON 反序列化 ==");
    string json1 = "{\\"Name\\":\\"张三\\",\\"Age\\":25,\\"LastLogin\\":\\"2024-01-01\\"}";
    string json2 = "{\\"Name\\":\\"李四\\"}";  // 缺少 Age 和 LastLogin

    UserDto u1 = JsonSerializer.Deserialize<UserDto>(json1)!;
    UserDto u2 = JsonSerializer.Deserialize<UserDto>(json2)!;

    Console.WriteLine($"  {u1.Name}, Age={u1.Age}, LastLogin={u1.LastLogin}");
    Console.WriteLine($"  {u2.Name}, Age={u2.Age?.ToString() ?? "未填写"}, LastLogin={u2.LastLogin?.ToString() ?? "从未"}");
}

class UserDto
{
    public string Name { get; set; } = "";
    public int? Age { get; set; }              // 可空，JSON 缺失时为 null
    public DateTime? LastLogin { get; set; }   // 可空，从未登录为 null
}

// ---------- 主流程 ----------
Basics();
NullCoalescing();
NullCoalescingAssignment();
LiftedOperators();
NullableBool();
Boxing();
JsonScenario();

Console.WriteLine("\\n可空值类型演示完毕！");
`,
    lang: 'cs',
  },

  // ============================================================
  // 第十七章：可空引用类型
  // ============================================================
  {
    id: 'csharp4-ch17',
    group: '第二部分 核心语法',
    icon: '🛡️',
    title: '可空引用类型',
    content: `## 第十七章　可空引用类型

C# 8 引入的 **NRT（Nullable Reference Types）** 是 C# 历史上最重要的安全特性之一。它让"可能为 null 的引用类型"在**编译期**就被检测出来，把可怕的 \`NullReferenceException\` 消灭在编码阶段。

### 一、为什么需要 NRT ⭐⭐⭐

\`null\` 是计算机科学界"十亿美元错误"。在传统 C# 中，所有引用类型（\`string\`、\`object\`、自定义类）都可以为 null，编译器不警告——你永远不知道一个 \`string\` 是不是 null，只能到处防御性检查。

NRT 把引用类型分成两种：
- \`string\`：**不可空**（编译器保证不为 null）
- \`string?\`：**可空**（可能为 null，使用前必须检查）

### 二、启用 NRT ⭐⭐⭐

在 \`.csproj\` 中开启：

\`\`\`xml
<PropertyGroup>
  <Nullable>enable</Nullable>
</PropertyGroup>
\`\`\`

或针对单文件：在文件顶部加 \`#nullable enable\`。.NET 6+ 的新项目模板**默认开启**。

### 三、string vs string? ⭐⭐⭐

\`\`\`csharp
string name = "张三";        // 不可空，必须有值
string? maybeName = null;   // 可空，允许 null
\`\`\`

警告规则：
- 把 \`null\` 赋给 \`string\` → ⚠️ 警告
- 把 \`string?\` 直接当 \`string\` 用 → ⚠️ 警告
- 解引用（访问属性/方法）未检查的可空 → ⚠️ 警告

### 四、编译器警告示例 ⭐⭐⭐

\`\`\`csharp
#nullable enable

string a = null;            // ⚠️ 警告 CS8600
string? b = null;           // ✅ 无警告

int len = b.Length;         // ⚠️ 警告 CS8602：可能为 null
if (b != null)
    len = b.Length;         // ✅ 编译器知道已检查
\`\`\`

### 五、! 运算符（null 抑制）⭐⭐

\`!\` 告诉编译器："我知道这里不为 null，别警告"。

\`\`\`csharp
string? input = GetUserInput();
string name = input!;       // 强制抑制警告，自负责任
\`\`\`

⚠️ \`!\` **不改变运行时行为**，只是消除警告。如果运行时真的是 null，照样抛 \`NullReferenceException\`。只在"你确信不为 null 但编译器推断不出来"时用。

### 六、null 检查 ArgumentNullException.ThrowIfNull ⭐⭐⭐

.NET 6+ 提供的简洁 null 检查：

\`\`\`csharp
void Process(string name)
{
    ArgumentNullException.ThrowIfNull(name);  // null 时抛 ArgumentNullException
    Console.WriteLine(name.Length);
}
\`\`\`

比旧写法 \`if (name == null) throw new ArgumentNullException(nameof(name));\` 简洁得多，且性能更好。

### 七、可空注解 vs 可空警告 ⭐⭐

NRT 分两层：

- **可空注解**（annotation）：\`string?\` 这个类型声明本身
- **可空警告**（warning）：解引用未检查的可空

可以分别控制：

\`\`\`xml
<Nullable>annotations</Nullable>   <!-- 只开启注解，不报警 -->
<Nullable>warnings</Nullable>      <!-- 只警告，不要求注解 -->
<Nullable>enable</Nullable>        <!-- 两者都开 -->
\`\`\`

### 八、MemberNotNull 特性 ⭐⭐

告诉编译器："这个方法执行后，该成员保证不为 null"。

\`\`\`csharp
class Service
{
    private string _config;

    [MemberNotNull(nameof(_config))]
    private void Init()
    {
        _config = LoadConfig();
    }
}
\`\`\`

常用于构造函数调用的初始化方法，消除"构造函数未初始化字段"的警告。

### 九、MaybeNull / NotNull 特性 ⭐⭐

用于方法签名上，表达"运行时行为"与"签名注解"的差异：

- \`[MaybeNull]\`：返回类型标注非空，但实际可能返回 null
- \`[NotNull]\`：参数标注可空，但方法返回后保证不为 null

\`\`\`csharp
// 查找失败返回 null（即使返回类型是 T）
[return: MaybeNull]
T Find<T>(IEnumerable<T> source);

// 参数传入后保证不为 null（如 TryGet 模式）
bool TryGet([NotNullWhen(true)] out string? value);
\`\`\`

实际开发中 \`[NotNullWhen(true)]\`、\`[MemberNotNullWhen]\` 等变体更常用。

### 十、与 JSON 反序列化结合 ⭐⭐⭐

DTO 中**必填字段**用非空、**可选字段**用可空：

\`\`\`csharp
class UserDto
{
    public string Name { get; set; } = "";       // 必填
    public string? Email { get; set; }           // 可选
    public int Age { get; set; }                 // 必填
}
\`\`\`

注意：反序列化时如果 JSON 缺失 \`Name\`，C# 会用默认值 \`""\`（而非 null），不会抛异常。这是属性初始化器的功劳。如果想要更严格，可以用 \`required\` 关键字（C# 11+）。

### 十一、最佳实践 ⭐⭐⭐

1. **新项目默认开启 NRT**：从源头杜绝 null 隐患
2. **API 边界用非空**：参数和返回值尽量非空，可空在内部传播
3. **公共方法入口检查 null**：\`ArgumentNullException.ThrowIfNull\`
4. **少用 ! 运算符**：除非真的确信，否则用显式检查
5. **数据库实体用可空**：DB 字段允许 NULL 时必须用 \`int?\`/\`string?\`

### 十二、小结

| 知识点 | 关键内容 |
| --- | --- |
| 启用 | \`<Nullable>enable</Nullable>\` 或 \`#nullable enable\` |
| 注解 | \`string\`（非空）vs \`string?\`（可空） |
| 警告 | CS8600/CS8602 等 |
| 抑制 | \`!\` 运算符（运行时不改变） |
| 检查 | \`ArgumentNullException.ThrowIfNull\` |
| 特性 | \`MemberNotNull\`/\`MaybeNull\`/\`NotNullWhen\` |
| 实战 | DTO 必填非空、可选可空 |

> NRT 是现代 C# 工程化的基石。掌握它，你的代码就能在编译期消灭绝大多数空指针异常。`,
    code: `// ========================================
// 第十七章 可空引用类型 —— 完整演示
// 文件级启用 NRT、警告、! 运算符、
// ArgumentNullException.ThrowIfNull、
// MemberNotNull、JSON 场景
// ========================================
#nullable enable                                // 文件级启用 NRT

using System;
using System.Collections.Generic;
using System.Text.Json;

// ---------- 1. 基础：string vs string? ----------
void Basics()
{
    Console.WriteLine("== 1. string vs string? ==");

    string name = "张三";                       // 非空引用类型
    string? maybeName = null;                   // 可空引用类型

    Console.WriteLine($"  name = {name}");
    Console.WriteLine($"  maybeName = {maybeName?.ToString() ?? "null"}");

    // 编译器警告演示（注释保留）：
    // string bad = null;        // ⚠️ CS8600：无法将 null 转换为非空
    // int len = maybeName.Length; // ⚠️ CS8602：可能为 null

    // 正确做法：先检查再用
    if (maybeName != null)
    {
        int len = maybeName.Length;            // ✅ 编译器已确认非空
        Console.WriteLine($"  长度 = {len}");
    }
}

// ---------- 2. ! 运算符（null 抑制） ----------
void NullSuppression()
{
    Console.WriteLine("\\n== 2. ! 运算符 ==");
    string? input = GetMaybeNull();

    // 使用 ! 抑制警告（你确信不为 null）
    string forced = input!;                    // 编译器不再警告
    Console.WriteLine($"  使用 ! 后：{forced}");

    // 但更安全的做法仍是显式检查
    if (input is not null)
    {
        Console.WriteLine($"  显式检查后长度：{input.Length}");
    }
}

string? GetMaybeNull() => "实际有值";          // 模拟可能返回 null 的方法

// ---------- 3. ArgumentNullException.ThrowIfNull ----------
class UserService
{
    private readonly string _connectionString;

    public UserService(string connectionString)
    {
        // .NET 6+ 简洁写法
        ArgumentNullException.ThrowIfNull(connectionString);
        _connectionString = connectionString;
    }

    public void ProcessUser(string name, string? email)
    {
        ArgumentNullException.ThrowIfNull(name);    // 必填检查
        // email 可空，不检查

        Console.WriteLine($"  处理用户：{name}, 邮箱：{email ?? "未提供"}");
    }
}

// ---------- 4. MemberNotNull 特性 ----------
class ConfigLoader
{
    private string _config = null!;            // null! 表示"先置 null，后续一定初始化"

    public ConfigLoader()
    {
        Initialize();                          // 调用初始化方法
        Console.WriteLine($"  配置已加载：{_config.Length} 字符");
    }

    [MemberNotNull(nameof(_config))]           // 告诉编译器：调用后 _config 非空
    private void Initialize()
    {
        _config = "server=localhost;db=test";  // 真实场景从文件读取
    }
}

// ---------- 5. NotNullWhen / MaybeNull 特性 ----------
class Repository
{
    // TryGet 模式：返回 true 时 value 保证非空
    public bool TryGet(int id, [NotNullWhen(true)] out string? value)
    {
        if (id == 1) { value = "张三"; return true; }
        value = null;                          // 失败时 value 为 null
        return false;
    }

    // Find 模式：返回类型标注非空，但实际可能 null
    [return: MaybeNull]
    public string FindName(int id)
    {
        if (id == 1) return "张三";
        return null!;                          // 实际返回 null
    }
}

// ---------- 6. JSON 反序列化场景 ----------
class UserDto
{
    public string Name { get; set; } = "";     // 必填，初始化器防止 null
    public string? Email { get; set; }         // 可选
    public int Age { get; set; }               // 必填
}

// ---------- 主流程 ----------
Basics();

NullSuppression();

Console.WriteLine("\\n== 3. ArgumentNullException.ThrowIfNull ==");
var svc = new UserService("Server=db;");
svc.ProcessUser("张三", "zhangsan@example.com");
svc.ProcessUser("李四", null);

try
{
    // 传入 null 触发异常
    var bad = new UserService(null!);          // ! 抑制警告，但运行时仍抛异常
}
catch (ArgumentNullException ex)
{
    Console.WriteLine($"  捕获异常：{ex.GetType().Name} - 参数 {ex.ParamName}");
}

Console.WriteLine("\\n== 4. MemberNotNull ==");
var cfg = new ConfigLoader();

Console.WriteLine("\\n== 5. NotNullWhen / MaybeNull ==");
var repo = new Repository();
if (repo.TryGet(1, out string? foundName))
{
    // 这里 foundName 被推断为 string（非空），因为 [NotNullWhen(true)]
    Console.WriteLine($"  找到：{foundName}, 长度 {foundName.Length}");
}
else
{
    Console.WriteLine("  未找到");
}

string? maybeName = repo.FindName(2);
Console.WriteLine($"  FindName(2) = {maybeName?.ToString() ?? "null"}");

Console.WriteLine("\\n== 6. JSON 反序列化 ==");
string json1 = "{\\"Name\\":\\"张三\\",\\"Email\\":\\"a@b.com\\",\\"Age\\":25}";
string json2 = "{\\"Name\\":\\"李四\\",\\"Age\\":30}";  // 缺 Email

UserDto u1 = JsonSerializer.Deserialize<UserDto>(json1)!;
UserDto u2 = JsonSerializer.Deserialize<UserDto>(json2)!;

Console.WriteLine($"  u1: {u1.Name}, {u1.Email ?? "无邮箱"}, {u1.Age}");
Console.WriteLine($"  u2: {u2.Name}, {u2.Email?.ToString() ?? "无邮箱"}, {u2.Age}");
Console.WriteLine($"  u1.Name 是 null? {u1.Name is null}");  // False

Console.WriteLine("\\n== 7. 警告 vs 注解 ==");
// 演示编译期行为（注释保留）：
// string x = null;          // ⚠️ CS8600 注解警告
// string? y = null;
// _ = y.Length;             // ⚠️ CS8602 解引用警告
Console.WriteLine("  启用 NRT 后，上述写法在编译期就会被标记。");

Console.WriteLine("\\n可空引用类型演示完毕！");
`,
    lang: 'cs',
  },
];

export { chapters };
