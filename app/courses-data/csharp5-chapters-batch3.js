// =============================================================
// C# 从入门到精通大全（全新版）—— 第3批章节
// 第二部分 核心语法 下（共 6 章）
// -------------------------------------------------------------
// 本批包含 6 章：
//   csharp5-ch12 : 第十三章 控制流
//   csharp5-ch13 : 第十四章 枚举类型
//   csharp5-ch14 : 第十五章 元组与解构
//   csharp5-ch15 : 第十六章 模式匹配
//   csharp5-ch16 : 第十七章 可空值类型
//   csharp5-ch17 : 第十八章 可空引用类型
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，所有示例使用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第十二章：控制流
  // ============================================================
  {
    id: 'csharp5-ch12',
    group: '第二部分 核心语法',
    icon: '🔀',
    title: '控制流',
    content: `## 第十三章　控制流

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

### 十四、不要用异常当控制流；yield 只是指针

\`try / catch\` 用来处理失败，不要用 \`throw\` 代替 \`break\` 或返回值。异常分配栈、打断内联，热循环里比 \`if\` 慢几个数量级。可预期的「没有下一个」用 \`false\` / \`null\` / \`Try*\`。

\`yield return\` 把方法变成状态机，**现在**只记住：它延迟执行，每次 \`MoveNext\` 才跑到下一个 yield。真正讲迭代器与 LINQ 延迟坑在集合章。这里记住：控制流章节的 \`return\` 会立刻离开方法；迭代器里的 \`yield break\` 才是「结束序列」。

### 十五、小结

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

> 控制流是程序骨架。下一章我们学习"枚举类型"——把一组相关常量组织成可读性极强的命名集合。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「控制流」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// 第十三章 控制流 —— 可在 .NET 8 / C# 12 控制台直接运行
// 本 demo 用成绩评级串起 if/else、经典 switch、switch 表达式、
// for/foreach/while/do、break/continue。条件必须是 bool，不能写 if (score)。
// 版本：switch 表达式、or/and/关系模式是 C# 8–9；when 从 C# 7 起可用。
// 陷阱：经典 switch 禁止隐式贯穿；foreach 变量是拷贝；continue 跳过本轮而非终止。
using System;
using System.Collections.Generic;

// ---------- 1. if-else：自上而下，先命中先走 ----------
char GradeByIf(int score)
{
    if (score < 0 || score > 100)              // 必须 bool；C/C++ 那套 if (x) 在这里非法
        return '?';                            // 非法分数单独符号，避免混进 F
    else if (score >= 90) return 'A';          // 顺序很重要：先 90 再 80，反过来会全进 B
    else if (score >= 80) return 'B';
    else if (score >= 70) return 'C';
    else if (score >= 60) return 'D';
    else return 'F';
}

// ---------- 2. 经典 switch：每个 case 必须 break/return/throw ----------
string CommentBySwitch(char grade)
{
    switch (grade)                             // 匹配的是值，不是范围（范围请用表达式 + 关系模式）
    {
        case 'A':                              // 空 case 连续才允许贯穿到下一个
            return "表现非常优秀，继续保持！";
        case 'B':
            return "表现良好，仍有提升空间。";
        case 'C':
            return "成绩中等，需要更加努力。";
        case 'D':
            return "刚好及格，警告！";
        case 'F':
            return "不及格，请认真复习。";
        default:                               // 建议始终写，吞掉意外输入
            return "未知等级";
    }
}

// ---------- 3. switch 表达式（C# 8）：必须穷尽，用 _ 兜底 ----------
string GradeBySwitchExpr(int score) => score switch
{
    < 0 or > 100 => "无效分数",                // C# 9 关系 + or；从上到下，没有 fall-through
    >= 90 => "A",
    >= 80 and < 90 => "B",                     // and 收窄区间，避免和上一行重叠
    int s when s >= 70 => "C",                 // when 可写任意条件，但关系模式更短
    int s when s >= 60 => "D",
    _ => "F"                                   // 弃元 = default；对 object 几乎总要有
};

// ---------- 4. for + continue 跳过本轮，break 离开循环 ----------
void PrintPassScores(int[] scores)
{
    Console.WriteLine("---- 及格分数列表 ----");
    for (int i = 0; i < scores.Length; i++)    // 三段都可省略；条件必须是 bool
    {
        int s = scores[i];
        if (s < 0) continue;                   // 脏数据：进入下一轮，i 仍会递增
        if (s == 999) break;                   // 哨兵：后面的 40 不会被处理
        if (s >= 60)
            Console.WriteLine($"  第{i + 1}个：{s} ✓");
    }
}

// ---------- 5. foreach：只读遍历，改元素请用 for ----------
void PrintAllGrades(int[] scores)
{
    Console.WriteLine("---- 全部成绩 ----");
    int passCount = 0, failCount = 0, invalidCount = 0;   // 同类型才可一行声明多个
    foreach (int s in scores)                  // s 是拷贝；数组不会被这个循环改结构
    {
        char g = GradeByIf(s);
        Console.WriteLine($"  分数 {s,3} => 等级 {g}");
        if (g == '?') invalidCount++;          // 非法不能算进不及格，否则统计撒谎
        else if (g == 'F') failCount++;
        else passCount++;
    }
    Console.WriteLine($"  统计：及格 {passCount} 人，不及格 {failCount} 人，非法 {invalidCount} 人");
}

// ---------- 6. while：先判断；可能一次都不进 ----------
int? FirstFailIndex(int[] scores)
{
    int i = 0;
    while (i < scores.Length)
    {
        if (scores[i] < 60) return i;         // 找到立刻返回；后面的不及格不再看
        i++;
    }
    return null;                               // 用 int? 表达「没有」，别用 -1 魔法数
}

// ---------- 7. do-while：至少执行一次，适合「先读再判」 ----------
void AskUntilValid(string[] simulated)
{
    // 沙箱没有 Console.ReadLine，用序列模拟；真实代码里要防无限循环
    int k = 0;
    string? input;
    do
    {
        input = k < simulated.Length ? simulated[k++] : "y";
        Console.WriteLine($"请输入 y 继续：{input}");
    } while (input != "y");
    Console.WriteLine("已确认！");
}

// ---------- 主流程 ----------
int[] scores = { 95, 82, 73, 64, 55, -1, 88, 999, 40 };  // 含非法与哨兵，专门喂给 break/continue

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
string label = avg >= 90 ? "优" : avg >= 60 ? "良" : "差";  // 超过两层请改 switch 表达式
Console.WriteLine($"  平均分 {avg} -> {label}");

Console.WriteLine("\\n本程序演示完毕！");
`,
    lang: 'cs',
  },

  // ============================================================
  // 第十三章：枚举类型
  // ============================================================
  {
    id: 'csharp5-ch13',
    group: '第二部分 核心语法',
    icon: '🎯',
    title: '枚举类型',
    content: `## 第十四章　枚举类型

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

foreach (Color c in Enum.GetValues<Color>())   // 泛型版本（.NET 5+ 提供的泛型重载，更简洁）
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

### 十一、必须有 none = 0；IsDefined 的陷阱

\`[Flags]\` 枚举**一定**要有 \`None = 0\`。\`HasFlag(None)\` 对任何值都为 true（零是任何位的子集），用它判断「无标志」应写 \`value == None\`。

\`Enum.IsDefined(typeof(Color), 42)\` **不能**当业务校验：

- 对 Flags，组合值（\`Read | Write = 3\`）常常 \`IsDefined\` 为 false，其实合法。
- 它看的是「有没有这个底层数字的命名成员」，不看你是否愿意接受过时值。
- 反射 + 装箱，热路径很贵。Flags 校验应自己做位掩码：\`(value & ~AllBits) == 0\`。

### 十二、持久化：存名字还是存数字

\`ToString()\` / \`Enum.Parse<T>("Red")\` 用的是**成员名**。存数据库若存 \`0/1/2\`，以后在中间插入成员会把旧数据读错；存字符串名更稳，但重命名会破。约定：对外契约用稳定名字或显式指定底层值且**只追加、不改旧数字**。\`TryParse\` 失败不要静默落到 default(0)。

### 十三、小结

| 知识点 | 关键内容 |
| --- | --- |
| 声明 | \`enum Name { A, B, C }\` |
| 底层类型 | 默认 int，可指定 byte/short/long 等 |
| 互转 | \`ToString\` / \`Enum.Parse\` / \`Enum.TryParse\` |
| 遍历 | \`Enum.GetNames\` / \`Enum.GetValues\` |
| 位枚举 | \`[Flags]\` + 2 的幂 + \`HasFlag\` |
| 校验 | \`Enum.IsDefined\` 防止非法值 |
| 模式匹配 | switch 表达式穷尽匹配 |

> 枚举是消除魔法数字的利器。下一章学习"元组与解构"——多值返回的优雅方案。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「枚举类型」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// 第十四章 枚举 —— 可在 .NET 8 / C# 12 控制台直接运行
// 本 demo 覆盖命名常量、底层整型、Parse/TryParse、GetValues、
// [Flags] 位组合、HasFlag、switch 穷尽匹配。
// 陷阱：未声明的整型仍能强制转进枚举；IsDefined 对 Flags 组合值常为 false。
// 版本：Enum.GetValues<T> 泛型重载是 .NET 5+；HasFlag 易读但热路径会装箱。

using System;

// ---------- 1. switch 表达式：给枚举加成员时编译器会提醒未覆盖 ----------
string DescribeWeekDay(WeekDay d) => d switch
{
    WeekDay.Monday => "周一：开始工作",
    WeekDay.Tuesday => "周二：进入状态",
    WeekDay.Wednesday => "周三：进度过半",
    WeekDay.Thursday => "周四：冲刺中",
    WeekDay.Friday => "周五：即将解放",
    WeekDay.Saturday => "周六：休息日",
    WeekDay.Sunday => "周日：充电日",
    _ => "未知"                                  // 强制转换来的非法值会落到这里
};

// ---------- 2. 普通枚举：强制转换不校验 ----------
Console.WriteLine("==== 1. 普通枚举基础 ====");

WeekDay today = WeekDay.Wednesday;

Console.WriteLine($"今天：{today}");  // ToString 默认打成员名，不是数字

Console.WriteLine($"整数值：{(int)today}");

WeekDay fromInt = (WeekDay)5;  // 强制转换不校验；5 刚好是 Friday，999 也能转进去

Console.WriteLine($"5 -> {fromInt}");

// ---------- 3. Parse 会抛；TryParse / IsDefined 的边界 ----------
Console.WriteLine("\\n==== 2. 字符串 <-> 枚举 ====");

string name = today.ToString();

Console.WriteLine($"ToString: {name}");

WeekDay parsed = (WeekDay)Enum.Parse(typeof(WeekDay), "Friday");  // 失败抛异常，输入场景慎用

Console.WriteLine($"Parse 'Friday': {parsed}");

if (Enum.TryParse<WeekDay>("sunday", ignoreCase: true, out WeekDay result))  // 失败不抛
    Console.WriteLine($"TryParse 'sunday'(忽略大小写): {result}");
else
    Console.WriteLine("解析失败");

Console.WriteLine($"999 合法吗？{Enum.IsDefined(typeof(WeekDay), 999)}");  // 只问「有没有这个命名成员」

Console.WriteLine($"3 合法吗？{Enum.IsDefined(typeof(WeekDay), 3)}");  // Wednesday=3，true；Flags 组合值常 false

// ---------- 4. 遍历成员：优先泛型 GetValues<T> ----------
Console.WriteLine("\\n==== 3. Enum.GetNames / GetValues ====");

Console.WriteLine("WeekDay 所有成员名：");

foreach (string n in Enum.GetNames(typeof(WeekDay)))
    Console.WriteLine($"  - {n}");

Console.WriteLine("Priority 所有成员（名 + 值）：");

foreach (Priority p in Enum.GetValues<Priority>())  // .NET 5+ 泛型，少一次装箱
    Console.WriteLine($"  {p} = {(byte)p}");

// ---------- 5. 指定底层类型：互转宽度要对 ----------
Console.WriteLine("\\n==== 4. byte 底层类型 ====");

Priority pri = Priority.High;

byte priValue = (byte)pri;  // 底层不是 int 时，互转要写对宽度

Console.WriteLine($"{pri} 底层值 = {priValue}");

// ---------- 6. Flags：2 的幂 + None=0 ----------
Console.WriteLine("\\n==== 5. Flags 位枚举 ====");

FileAccess myAccess = FileAccess.Read | FileAccess.Write;  // 按位或组合；值必须是 2 的幂

Console.WriteLine($"Read | Write = {myAccess}");  // [Flags] 让 ToString 打出 "Read, Write" 而不是 3

Console.WriteLine($"整数值 = {(int)myAccess}");

Console.WriteLine($"包含 Read? {myAccess.HasFlag(FileAccess.Read)}");  // 易读；热路径用 (x & flag) == flag

Console.WriteLine($"包含 Execute? {myAccess.HasFlag(FileAccess.Execute)}");

FileAccess onlyRead = myAccess & ~FileAccess.Write;  // 清掉某一位

Console.WriteLine($"移除 Write 后：{onlyRead}");

FileAccess toggled = myAccess ^ FileAccess.Execute;  // 异或：有则去、无则加

Console.WriteLine($"切换 Execute 后：{toggled}");

FileAccess empty = FileAccess.None;

Console.WriteLine($"None == 0? {(int)empty == 0}");  // Flags 必须有 None=0；HasFlag(None) 对任何值都是 true

// ---------- 7. switch 穷尽 + 过滤 Flags 单值 ----------
Console.WriteLine("\\n==== 6. switch 表达式 ====");

foreach (WeekDay d in new[] { WeekDay.Monday, WeekDay.Saturday, WeekDay.Sunday })
    Console.WriteLine($"  {d}: {DescribeWeekDay(d)}");

Console.WriteLine("\\n==== 7. 遍历 Flags 枚举所有单值 ====");

Console.WriteLine("FileAccess 单值列表：");

foreach (FileAccess f in Enum.GetValues<FileAccess>())
    if (f != FileAccess.None && !f.ToString().Contains(","))  // 组合值的 ToString 带逗号；正式代码用位运算过滤
        Console.WriteLine($"  {f} = {(int)f}");

Console.WriteLine("\\n枚举演示完毕！");

// ---------- 类型声明（必须放在所有顶级语句之后） ----------

enum WeekDay { Monday = 1, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday }  // 未写的依次 +1；0 没有成员

enum Priority : byte { Low = 1, Normal = 2, High = 3, Critical = 4 }  // 指定底层省空间；不要从 0 以外的「有效业务值」当 default

[Flags]
enum FileAccess { None = 0, Read = 1, Write = 2, Execute = 4 }  // 持久化只追加、不改旧数字
`,
    lang: 'cs',
  },

  // ============================================================
  // 第十四章：元组与解构
  // ============================================================
  {
    id: 'csharp5-ch14',
    group: '第二部分 核心语法',
    icon: '📦',
    title: '元组与解构',
    content: `## 第十五章　元组与解构

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

元组支持 \`==\` 和 \`!=\`，按元素逐个比较（\`==\`/\`!=\` 运算符是 **C# 9.0** 引入；C# 7.3 及更早只能用 \`Equals\` 做值比较）。

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

### 十一、名字会被擦掉；嵌套与相等

\`(int X, int Y)\` 的 \`X/Y\` 只是编译期语法糖，IL 里仍是 \`Item1/Item2\`。**作为公开 API**（库、JSON、反射）时，调用方可能只看见 Item1——需要稳定名字请用 \`record\` 或具名类型。

弃元：\`var (_, y) = point;\` 只要第二个。元组可嵌套：\`(string name, (int x, int y) pos)\`。

\`ValueTuple\` 按字段值相等（\`Equals\` / \`==\`）；旧 \`Tuple<T>\` 也按值相等，但是 class，还有 null。\`ValueTuple\` 是 struct，默认不是 null（除非 \`ValueTuple<...>?\`）。跨语言 / 旧 API 才用 \`Tuple.Create\`。

### 十二、公开 API 与序列化注意

把元组当方法返回值在**模块内部**很爽；一旦变成 public，调用方会依赖 \`Item1\` 或你此刻写的名字，重构就会破。JSON 序列化 \`ValueTuple\` 通常得到 \`{"Item1":1,"Item2":2}\`，不是 \`{"X":1,"Y":2}\`。跨进程、跨语言、要文档化的返回值，升级成 \`record Point(int X, int Y)\`。

元组 \`==\` 是逐字段；含引用元素时只比较那些引用是否相等（string 有重载所以比内容）。嵌套元组相等是递归的。需要自定义比较请不要硬拧元组，换类型。

内部助手方法返回 \`(bool ok, T value)\` 完全合理；一旦跨过程序集边界，就升级成具名类型。

### 十三、小结

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

> 元组让多值处理极其轻量。下一章学习 C# 最优雅的特性——"模式匹配"。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「元组与解构」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// 第十五章 元组与解构 —— 可在 .NET 8 / C# 12 控制台直接运行
// 本 demo 覆盖 ValueTuple 字面量、元素命名（编译期糖）、多返回值、
// Deconstruct、弃元、== 比较、foreach 解构。
// 陷阱：名字运行时是 Item1/Item2；公开 API 和 JSON 不要用元组。
// 版本：ValueTuple 语法 C# 7；元组 == / != 是 C# 9。

using System;

using System.Collections.Generic;

// ---------- 1. 字面量与命名：名字是编译期糖 ----------
void TupleBasics()
{
    Console.WriteLine("== 1. 元组字面量 ==");
    var t = (1, "张三");                       // 推断为 ValueTuple<int,string>，值类型
    Console.WriteLine($"  Item1 = {t.Item1}"); // 没写名字时只能 ItemN
    Console.WriteLine($"  Item2 = {t.Item2}");

    // 自定义名只存在于编译期，反射/序列化仍是 Item1
    var p = (Age: 25, Name: "李四");
    Console.WriteLine($"  Age = {p.Age}, Name = {p.Name}");
    Console.WriteLine($"  Item1 仍可用：{p.Item1}"); // Item1 == Age，两套名字同一字段

    // 类型签名中命名，调用方也能用 Age/Name
    (int Age, string Name) person = (30, "王五");
    Console.WriteLine($"  {person.Name}, {person.Age} 岁");
}

(string Name, bool Found) FindUser(int id)
{
    if (id == 1) return ("张三", true);        // 多返回值，比一串 out 清晰
    if (id == 2) return ("李四", true);
    return ("", false);                        // 失败时约定空串+false，别只看 Name
}

(bool Ok, int Value) TryParseInt(string s)
{
    if (int.TryParse(s, out int v)) return (true, v);  // 内部仍可用经典 Try 模式
    return (false, 0);
}

void PrintPerson((string Name, int Age) p)
{
    Console.WriteLine($"  {p.Name}, {p.Age} 岁");
}

// ---------- 6. 元组 == 逐字段（C# 9） ----------
void TupleComparison()
{
    Console.WriteLine("== 6. 元组比较 ==");
    var a = (1, "x");
    var b = (1, "x");
    var c = (2, "x");
    Console.WriteLine($"  (1,'x') == (1,'x') ? {a == b}");   // C# 9 起逐字段 ==；string 比内容
    Console.WriteLine($"  (1,'x') == (2,'x') ? {a == c}");   // False
}

TupleBasics();

// ---------- 2. 多返回值与弃元 ----------
Console.WriteLine("\\n== 2. 多返回值 ==");

var (name, found) = FindUser(2);  // 解构赋值，一次拆开

Console.WriteLine($"  id=2 -> name={name}, found={found}");

var (_, notFound) = FindUser(99);  // _ 弃元：只要第二个

Console.WriteLine($"  id=99 -> found={notFound}");

// ---------- 3. 用元组替代一串 out ----------
Console.WriteLine("\\n== 3. 替代 out ==");

var (ok, val) = TryParseInt("42");

Console.WriteLine($"  '42' -> ok={ok}, val={val}");

var (ok2, val2) = TryParseInt("abc");

Console.WriteLine($"  'abc' -> ok={ok2}, val={val2}");  // 失败时 Value=0，必须先看 Ok

// ---------- 4. 元组作参数：名字按形参签名对齐 ----------
Console.WriteLine("\\n== 4. 元组作参数 ==");

PrintPerson(("赵六", 28));  // 字面量实参，名字按形参签名对齐

// ---------- 5. 自定义 Deconstruct ----------
Console.WriteLine("\\n== 5. 自定义 Deconstruct ==");

Point pt = new Point(3, 4);

var (px, py) = pt;  // 编译器找 Deconstruct(out, out)

Console.WriteLine($"  Point -> ({px}, {py})");

Range r = new Range(10, 100);  // 注意：与 System.Range（C# 8 索引范围）同名，这里是演示用 class

var (min, max) = r;

Console.WriteLine($"  Range -> [{min}, {max}]");

TupleComparison();

// ---------- 7. 内部列表可用元组；跨边界请用 record ----------
Console.WriteLine("\\n== 7. 元组列表（替代临时类型） ==");

List<(string Name, int Score)> list = new()
{
    ("张三", 90),
    ("李四", 85),
    ("王五", 60)
};

foreach (var (n, s) in list)                   // foreach 直接解构；跨程序集请换成 record
    Console.WriteLine($"  {n}: {s}");

Console.WriteLine("\\n元组演示完毕！");

// ---------- 类型声明（必须放在所有顶级语句之后） ----------

class Point
{
    public int X { get; set; }
    public int Y { get; set; }
    public Point(int x, int y) { X = x; Y = y; }

    // 约定名字 Deconstruct + out 参数，即可被 var (x,y) = obj 调用
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
`,
    lang: 'cs',
  },

  // ============================================================
  // 第十五章：模式匹配
  // ============================================================
  {
    id: 'csharp5-ch15',
    group: '第二部分 核心语法',
    icon: '🧩',
    title: '模式匹配',
    content: `## 第十六章　模式匹配

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

### 十三、穷尽性：编译器能帮你挡到哪

\`switch\` 表达式必须覆盖所有可能，否则 \`CS8509\`。对 enum，加新成员会在这里报红——这是件好事。对 \`object\` / 接口，编译器不知道未来会有哪些实现，必须写 \`_\`。

列表模式 \`[first, .. var rest]\`、关系模式 \`> 0 and < 10\`、属性模式 \`{ Name: "a" }\`、\`var\` 模式（总是匹配并绑定）、弃元 \`_\` 可以组合。\`var\` **不会**检查 null（引用类型时 \`var x\` 接受 null）；要排除 null 用 \`string s\` 类型模式。

写模式时先想「哪条会先命中」：从上到下，没有 fall-through。把具体模式放前面，\`_\` 永远在最后。

### 十四、写模式时的两个习惯

第一，把**会抛或会分配**的计算放进 \`when\` 右边之前先用类型模式收窄。第二，对 bool / enum 尽量写穷尽分支，少用 \`_\` 吞掉新增情况。列表模式匹配空数组用 \`[]\`，单元素 \`[var x]\`，其余 \`[_, ..]\`。这 30 秒的穷尽性，能挡住一整类线上 bug。

### 十五、小结

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

> 模式匹配是现代 C# 的灵魂。下一章学习"可空值类型"——优雅地处理"可能没有值"的场景。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「模式匹配」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// 第十六章 模式匹配 —— 可在 .NET 8 / C# 12 控制台直接运行
// 本 demo 覆盖 is 类型模式、switch 表达式、属性/位置/关系/逻辑/列表模式。
// 版本：is 类型 C# 7；switch 表达式/属性/位置 C# 8；关系与 and/or/not C# 9；列表 C# 11。
// 陷阱：从上到下先命中先生效；var 模式接受 null；object 必须写 _ 才能穷尽。

using System;

using System.Collections.Generic;

// ---------- 1. is 类型模式：判断与绑定一次完成 ----------
void TypePatternIs()
{
    Console.WriteLine("== 1. is 类型模式 ==");
    object o = "hello C#";
    if (o is string s)                        // 判断 + 绑定；s 作用域只在 if 内
        Console.WriteLine($"  是字符串，长度 {s.Length}");
    else
        Console.WriteLine("  不是字符串");

    object n = 42;
    if (n is int i && i > 0)                  // 短路：不是 int 就不会读 i
        Console.WriteLine($"  正整数：{i}");
}

// ---------- 2. switch 表达式 + 类型 / null / 弃元 ----------
string DescribeType(object o) => o switch
{
    int i => $"整数：{i}",                     // 装箱的 int 也能拆出来
    string s => $"字符串：{s}",
    bool b => $"布尔：{b}",
    double d => $"双精度：{d:F2}",
    null => "null！",                          // 必须单独写，否则 null 进 _
    _ => "未知类型"                            // 接口/object 编译器不知道还有哪些实现
};

// ---------- 3. 属性模式：按对象形状分支 ----------
string DescribePerson(Person p) => p switch
{
    null => "空对象",                          // 引用模式先挡 null，避免解引用
    { Name: "Admin" } => "管理员",             // 属性模式：只看形状
    { Age: < 18 } => "未成年",                 // 属性 + 关系
    { Age: >= 60 } => "老年",
    { Age: >= 18, City: "北京" } => "北京成年人",  // 多属性是 and
    { City: null } => "无城市信息",
    _ => "普通人"
};

// ---------- 4. 位置模式依赖 Deconstruct；when 写额外条件 ----------
string WherePoint(Point p) => p switch
{
    (0, 0) => "原点",                          // 位置模式依赖 Deconstruct
    (0, _) => "Y 轴",                          // _ 丢弃不需要的分量
    (_, 0) => "X 轴",
    (var x, var y) when x == y => "对角线",    // when 写关系模式表达不了的条件
    (var x, var y) => $"普通点 ({x},{y})"      // var 总匹配；具体模式必须写在前面
};

// ---------- 5. 关系与逻辑模式（C# 9） ----------
string Grade(int score) => score switch
{
    < 0 or > 100 => "无效分数",                // or 连接两个关系
    >= 90 => "A",
    >= 80 and < 90 => "B",                     // and 收窄；顺序仍是上到下
    >= 70 and < 80 => "C",
    >= 60 and < 70 => "D",
    not 0 => "F (非零)",                       // not 在 0 之前会把 0 以外全吃掉
    0 => "零分"
};

bool IsVowel(char c) => c is 'a' or 'e' or 'i' or 'o' or 'u';  // 常量 or；大小写要自己补

// ---------- 6. 列表模式（C# 11）：匹配长度与切片 ----------
string DescribeArray(int[] arr) => arr switch
{
    [] => "空数组",                            // C# 11 列表模式
    [var single] => $"单元素：{single}",
    [var a, var b] => $"两元素：{a}, {b}",
    [var first, _, _, var last] => $"4 元素：首={first} 尾={last}",
    [var first, .. var middle, var last] => $"首={first} 中间{middle.Length}个 尾={last}",  // .. 切片可绑定
    _ => "其他"
};

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
    null!  // 故意喂 null，看第一支 case
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
    { Age: >= 18, City: "上海" or "北京" } => "一线城市成年人",  // 属性里再套 or
    _ => "其他"
};

Console.WriteLine($"  Alice -> {label}");

Console.WriteLine("\\n模式匹配演示完毕！");

// ---------- 类型声明（必须放在所有顶级语句之后） ----------

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
    public void Deconstruct(out int x, out int y) { x = X; y = Y; }  // 位置模式 (x, y) 靠它
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第十六章：可空值类型
  // ============================================================
  {
    id: 'csharp5-ch16',
    group: '第二部分 核心语法',
    icon: '❓',
    title: '可空值类型',
    content: `## 第十七章　可空值类型

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

### 十二、\`== null\` vs HasValue，以及装箱再提醒

对 \`int? n\`：

- \`n.HasValue\` / \`n is not null\` / \`n != null\` 在语言里被抬成同一类判断，可读性选团队风格。
- \`n == 0\` 在 \`n\` 为 null 时是 **false**（lifted operator：任一操作数为 null，关系/相等结果是 false，\`== null\` 除外）。
- \`n.Value\` 在没有值时抛 \`InvalidOperationException\`；更稳的是 \`GetValueOrDefault()\` 或 \`n ?? fallback\`。

装箱：\`(object)n\` 在 \`n\` 为 null 时得到 **真正的 null**（不是 boxed Nullable），\`HasValue=true\` 时盒子里是 \`T\` 本身。所以 \`object o = (int?)3; o is int\` 为 true。不要对 \`Nullable<T>\` 做 \`is Nullable<int>\` 指望还能看见外壳。

### 十三、小结

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

> 可空值类型是"现实数据"的桥梁。下一章学习"可空引用类型"——C# 8 引入的引用类型 null 安全机制。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「可空值类型」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// 第十七章 可空值类型 —— 可在 .NET 8 / C# 12 控制台直接运行
// 本 demo 覆盖 int?、HasValue/Value、?? / ??=、提升运算符、bool? 三值、装箱、JSON 缺失字段。
// 陷阱：.Value 无值时抛；提升运算任一 null 则结果 null；插值打印 null 是空串。
// 版本：??= 是 C# 8。int? 就是 Nullable<int>。

using System;
using System.Diagnostics.CodeAnalysis;

using System.Text.Json;

// ---------- 1. HasValue / Value / GetValueOrDefault ----------
void Basics()
{
    Console.WriteLine("== 1. 声明与取值 ==");
    int? a = null;                            // Nullable<int>：多一个 HasValue 标志
    int? b = 42;                              // 有值时 Value 才安全

    Console.WriteLine($"  a.HasValue = {a.HasValue}");  // False
    Console.WriteLine($"  b.HasValue = {b.HasValue}");  // True
    Console.WriteLine($"  b.Value = {b.Value}");        // 无值时抛 InvalidOperationException

    // 错误示范（被注释）：
    // Console.WriteLine(a.Value);  // 会抛 InvalidOperationException

    // GetValueOrDefault 不抛；无参得到 T 的 default（int 是 0，可能和真 0 分不清）
    int safeA = a.GetValueOrDefault();
    int safeA2 = a.GetValueOrDefault(-1);     // 业务上更常给一个哨兵
    int safeB = b.GetValueOrDefault(-1);      // 有值则返回 42
    Console.WriteLine($"  a 默认值：{safeA} / {safeA2}");
    Console.WriteLine($"  b 默认值：{safeB}");
}

// ---------- 2. ?? 只认 null ----------
void NullCoalescing()
{
    Console.WriteLine("\\n== 2. ?? 运算符 ==");
    int? age = null;
    int actualAge = age ?? 18;                // 只认 null，0 不会触发
    Console.WriteLine($"  age ?? 18 = {actualAge}");

    int? score = 90;
    int actualScore = score ?? 60;            // 有值走左边
    Console.WriteLine($"  score ?? 60 = {actualScore}");

    // 链式：第一个非 null 胜出；也能用于 string?
    string? name = null;
    string? displayName = null;
    string final = name ?? displayName ?? "匿名";
    Console.WriteLine($"  链式 ?? = {final}");
}

// ---------- 3. ??= 惰性赋值（C# 8） ----------
void NullCoalescingAssignment()
{
    Console.WriteLine("\\n== 3. ??= 复合赋值 ==");
    int? value = null;
    value ??= 100;                            // 仅当 null 才写；左侧只求值一次
    Console.WriteLine($"  首次 ??= 后：{value}");  // 100
    value ??= 200;                            // 已有值，右边不跑
    Console.WriteLine($"  二次 ??= 后：{value}");  // 100

    // 惰性初始化：第二次 ??= 不会再调用工厂
    string? cache = null;
    cache ??= ExpensiveCompute();
    cache ??= ExpensiveCompute();
    Console.WriteLine($"  缓存：{cache}");
}

string ExpensiveCompute()
{
    Console.WriteLine("  [执行了一次耗时计算]");
    return "CachedData";
}

// ---------- 4. 提升运算符：一侧 null，算术结果 null ----------
void LiftedOperators()
{
    Console.WriteLine("\\n== 4. 提升运算符 ==");
    int? a = 10, b = 3;
    Console.WriteLine($"  {a} + {b} = {a + b}");   // 两边都有值才运算
    Console.WriteLine($"  {a} - {b} = {a - b}");
    Console.WriteLine($"  {a} * {b} = {a * b}");

    int? x = null, y = 5;
    // 可空算术结果为 null 时，插值输出空串而不是 "null"
    Console.WriteLine($"  null + 5 = {x + y ?? -1}（用 ?? 才能看出是 null）");
    Console.WriteLine($"  null * 5 = {(x * y)?.ToString() ?? "null"}");
    Console.WriteLine($"  null < 5 ? {(x < y)}");   // 提升关系：任一 null → false（== null 除外）

    int? m = null, n = 10;
    Console.WriteLine($"  null > 10 ? {m > n}");    // False，不是 SQL 那种 UNKNOWN
    Console.WriteLine($"  null <= 10 ? {m <= n}");  // 同样 False
}

// ---------- 5. bool? 三值逻辑；if 不能直接吃 ----------
void NullableBool()
{
    Console.WriteLine("\\n== 5. 可空 bool ==");
    bool? t = true, f = false, n = null;

    Console.WriteLine($"  null & true = {n & t}");   // 三值：& 遇 null 常为 null（插值打空）
    Console.WriteLine($"  null | true = {n | t}");   // true：或只要一侧 true 就能定
    Console.WriteLine($"  null & false = {n & f}");  // false：与只要一侧 false 就能定
    Console.WriteLine($"  null | false = {n | f}");  // null
    Console.WriteLine($"  !null = {!n}");            // null

    // if 条件必须是 bool，不能直接写 if (flag)
    bool? flag = null;
    if (flag == true)
        Console.WriteLine("  flag 为 true");
    else if (flag == false)
        Console.WriteLine("  flag 为 false");
    else
        Console.WriteLine("  flag 为 null（未知）");
}

// ---------- 6. 可空装箱：有值装成 T，无值装成真正的 null ----------
void Boxing()
{
    Console.WriteLine("\\n== 6. 装箱 ==");
    int? withValue = 99;
    int? withoutValue = null;

    object o1 = withValue;                     // 有值：盒子里是 Int32，不是 Nullable<int>
    object o2 = withoutValue;                  // 无值：得到真正的 null，不是空盒子

    Console.WriteLine($"  有值装箱类型：{o1?.GetType().Name}");  // Int32
    Console.WriteLine($"  无值装箱是否 null：{o2 == null}");      // True

    int? back = (int?)o1;  // 拆回可空；o1 is int 也为 true
    Console.WriteLine($"  拆箱回来：{back}");
}

// ---------- 7. JSON 缺字段保持 null，不要用 0 表示「没填」 ----------
void JsonScenario()
{
    Console.WriteLine("\\n== 7. JSON 反序列化 ==");
    string json1 = "{\\"Name\\":\\"张三\\",\\"Age\\":25,\\"LastLogin\\":\\"2024-01-01\\"}";
    string json2 = "{\\"Name\\":\\"李四\\"}";  // 缺字段 → 可空属性保持 null，不会当 0

    UserDto u1 = JsonSerializer.Deserialize<UserDto>(json1)!;
    UserDto u2 = JsonSerializer.Deserialize<UserDto>(json2)!;

    Console.WriteLine($"  {u1.Name}, Age={u1.Age}, LastLogin={u1.LastLogin}");
    Console.WriteLine($"  {u2.Name}, Age={u2.Age?.ToString() ?? "未填写"}, LastLogin={u2.LastLogin?.ToString() ?? "从未"}");
}

Basics();

NullCoalescing();

NullCoalescingAssignment();

LiftedOperators();

NullableBool();

Boxing();

JsonScenario();

Console.WriteLine("\\n可空值类型演示完毕！");

// ============ 类型声明（必须放在所有顶级语句之后） ============

class UserDto
{
    public string Name { get; set; } = "";
    public int? Age { get; set; }              // DB/JSON NULL 用 T?，不要用 0 表示缺失
    public DateTime? LastLogin { get; set; }   // 从未登录是 null，不是 DateTime.MinValue
}
`,
    lang: 'cs',
  },

  // ============================================================
  // 第十七章：可空引用类型
  // ============================================================
  {
    id: 'csharp5-ch17',
    group: '第二部分 核心语法',
    icon: '🛡️',
    title: '可空引用类型',
    content: `## 第十八章　可空引用类型

C# 8 引入的 **NRT（Nullable Reference Types）** 是 C# 历史上最重要的安全特性之一。它让"可能为 null 的引用类型"在**编译期**就被检测出来，把可怕的 \`NullReferenceException\` 消灭在编码阶段。

### 一、为什么需要 NRT ⭐⭐⭐

\`null\` 是计算机科学界"十亿美元错误"。在传统 C# 中，所有引用类型（\`string\`、\`object\`、自定义类）都可以为 null，编译器不警告——你永远不知道一个 \`string\` 是不是 null，只能到处防御性检查。

NRT 把引用类型分成两种：
- \`string\`：注解为不可空，编译器通过警告帮助发现 null 流入；它不是运行时保证，反射、反序列化、旧代码或 \`null!\` 仍可能产生 null
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

### 十二、注解、\`!\` 纪律、\`T?\` 与分析边界

- **MaybeNull / NotNull / NotNullWhen / MaybeNullWhen**：告诉编译器「签名骗了你」。例如 \`bool TryGet(out T value)\` 应 \`[NotNullWhen(true)]\`。没有注解时，泛型 \`T\` 默认是「也许 null」还是「非 null」取决于约束。
- **\`T?\`**：\`T\` 是 class 时表示可空引用；\`T\` 是 struct 时表示 \`Nullable<T>\`。无约束泛型里的 \`T?\` 是「可空注解」，不是双重包装。
- **\`!\`（null-forgiving）**：关闭**这一处**警告，不生成运行时检查。只用在你刚刚证明过非 null 的地方（或对接老 API）。禁止 \`GetUser()!.Name!.Trim()\` 一路感叹号。
- **分析器不是证明器**：字段跨方法赋值、并发写入、反序列化、反射 set，编译器都可能漏。公共入口仍要 \`ArgumentNullException.ThrowIfNull\`。

### 十三、小结

| 知识点 | 关键内容 |
| --- | --- |
| 启用 | \`<Nullable>enable</Nullable>\` 或 \`#nullable enable\` |
| 注解 | \`string\`（非空）vs \`string?\`（可空） |
| 警告 | CS8600/CS8602 等 |
| 抑制 | \`!\` 运算符（运行时不改变） |
| 检查 | \`ArgumentNullException.ThrowIfNull\` |
| 特性 | \`MemberNotNull\`/\`MaybeNull\`/\`NotNullWhen\` |
| 实战 | DTO 必填非空、可选可空 |

> NRT 是现代 C# 工程化的基石。掌握它，你的代码就能在编译期消灭绝大多数空指针异常。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「可空引用类型」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// 第十八章 可空引用类型 —— 可在 .NET 8 / C# 12 控制台直接运行
// NRT 是编译期注解：string 与 string? 运行时仍是同一个引用类型，IL 里没有「非空指针」。
// 启用后警告帮你找 NRE；! 只是闭嘴，不会在运行期插入检查。
// 版本：NRT 是 C# 8；ThrowIfNull 是 .NET 6。JSON 反序列化仍可能给你 null，注解挡不住。
#nullable enable                                // 本文件启用；项目级也可在 csproj 写 <Nullable>enable</Nullable>

using System;

using System.Collections.Generic;

using System.Diagnostics.CodeAnalysis;

using System.Text.Json;

// ---------- 1. string vs string?：只是注解，运行时同一类型 ----------
void Basics()
{
    Console.WriteLine("== 1. string vs string? ==");

    string name = "张三";                       // 注解：调用方不该传 null；编译器会警告 name = null
    string? maybeName = null;                   // 注解：允许 null，用之前要 ?. 或 is { } 检查

    Console.WriteLine($"  name = {name}");
    Console.WriteLine($"  maybeName = {maybeName?.ToString() ?? "null"}");

    // 下面两行若取消注释，编译器会警告，运行时第二行会 NRE
    // string bad = null;        // CS8600：无法将 null 转换为非空
    // int len = maybeName.Length; // CS8602：解引用可能为 null

    // 流分析：!= null 之后 maybeName 被收窄为 string
    if (maybeName != null)
    {
        int len = maybeName.Length;            // 此处不再警告
        Console.WriteLine($"  长度 = {len}");
    }
}

// ---------- 2. ! 只消警告，不插运行时检查 ----------
void NullSuppression()
{
    Console.WriteLine("\\n== 2. ! 运算符 ==");
    string? input = GetMaybeNull();

    string forced = input!;                    // 你向编译器担保；真 null 仍 NRE
    Console.WriteLine($"  使用 ! 后：{forced}");

    if (input is not null)  // C# 9；比 != null 更能挡住重载 == 的类型
    {
        Console.WriteLine($"  显式检查后长度：{input.Length}");
    }
}

string? GetMaybeNull() => "实际有值";  // 签名说可空，实现这次碰巧非空——调用方仍须检查

Basics();

NullSuppression();

// ---------- 3. 公共入口：注解不够，还要 ThrowIfNull ----------
Console.WriteLine("\\n== 3. ArgumentNullException.ThrowIfNull ==");

var svc = new UserService("Server=db;");

svc.ProcessUser("张三", "zhangsan@example.com");

svc.ProcessUser("李四", null);  // email 是 string?，合法；name 不能为 null

try
{
    var bad = new UserService(null!);          // ! 让编译通过；ThrowIfNull 仍会在运行时拦住
}
catch (ArgumentNullException ex)
{
    Console.WriteLine($"  捕获异常：{ex.GetType().Name} - 参数 {ex.ParamName}");
}

// ---------- 4. MemberNotNull：辅助方法赋值也要告诉分析器 ----------
Console.WriteLine("\\n== 4. MemberNotNull ==");

var cfg = new ConfigLoader();  // 构造函数调 Initialize，靠特性告诉分析器字段已赋值

// ---------- 5. NotNullWhen / MaybeNull：签名与运行时不一致时用特性 ----------
Console.WriteLine("\\n== 5. NotNullWhen / MaybeNull ==");

var repo = new Repository();

if (repo.TryGet(1, out string? foundName))
{
    // true 分支里 foundName 被 [NotNullWhen(true)] 收窄成非空
    Console.WriteLine($"  找到：{foundName}, 长度 {foundName.Length}");
}
else
{
    Console.WriteLine("  未找到");
}

string? maybeName = repo.FindName(2);

Console.WriteLine($"  FindName(2) = {maybeName?.ToString() ?? "null"}");

// ---------- 6. JSON：反序列化绕过构造函数，注解挡不住 ----------
Console.WriteLine("\\n== 6. JSON 反序列化 ==");

string json1 = "{\\"Name\\":\\"张三\\",\\"Email\\":\\"a@b.com\\",\\"Age\\":25}";

string json2 = "{\\"Name\\":\\"李四\\",\\"Age\\":30}";  // 缺 Email → null，缺 Name 则用 = "" 初始化器

UserDto u1 = JsonSerializer.Deserialize<UserDto>(json1)!;  // Deserialize 返回 T?，! 是你的担保

UserDto u2 = JsonSerializer.Deserialize<UserDto>(json2)!;

Console.WriteLine($"  u1: {u1.Name}, {u1.Email ?? "无邮箱"}, {u1.Age}");

Console.WriteLine($"  u2: {u2.Name}, {u2.Email?.ToString() ?? "无邮箱"}, {u2.Age}");

Console.WriteLine($"  u1.Name 是 null? {u1.Name is null}");  // 初始化器挡了缺字段，挡不住 JSON 显式 null

// ---------- 7. 分析器不是证明器 ----------
Console.WriteLine("\\n== 7. 警告 vs 注解 ==");

Console.WriteLine("  启用 NRT 后，上述写法在编译期就会被标记。");

Console.WriteLine("\\n可空引用类型演示完毕！");

// ---------- 类型声明（必须放在所有顶级语句之后） ----------

class UserService
{
    private readonly string _connectionString;

    public UserService(string connectionString)
    {
        ArgumentNullException.ThrowIfNull(connectionString);  // .NET 6+；公共入口不要只靠注解
        _connectionString = connectionString;
    }

    public void ProcessUser(string name, string? email)
    {
        ArgumentNullException.ThrowIfNull(name);    // 必填：注解 + 运行时双保险
        // email 可空，用 ?? 展示即可

        Console.WriteLine($"  处理用户：{name}, 邮箱：{email ?? "未提供"}");
    }
}

class ConfigLoader
{
    private string _config = null!;            // 对分析器说「构造结束前会赋值」；并发/反射仍可能空

    public ConfigLoader()
    {
        Initialize();
        Console.WriteLine($"  配置已加载：{_config.Length} 字符");
    }

    [MemberNotNull(nameof(_config))]           // 没有这个特性，构造函数会报「未赋值」
    private void Initialize()
    {
        _config = "server=localhost;db=test";
    }
}

class Repository
{
    public bool TryGet(int id, [NotNullWhen(true)] out string? value)
    {
        if (id == 1) { value = "张三"; return true; }
        value = null;                          // false 时允许 null；调用方必须先看返回值
        return false;
    }

    [return: MaybeNull]
    public string FindName(int id)  // 签名写 string 方便泛型，MaybeNull 承认其实可能空
    {
        if (id == 1) return "张三";
        return null!;                          // 无 MaybeNull 时这里会警告
    }
}

class UserDto
{
    public string Name { get; set; } = "";     // 必填字段给初始化器；更严可用 C# 11 required
    public string? Email { get; set; }         // 可选
    public int Age { get; set; }               // 值类型缺字段得 0，和「没填」分不清时请用 int?
}
`,
    lang: 'cs',
  },
];

export { chapters };
