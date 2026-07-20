// =============================================================
// C# 从入门到精通大全（终极版）—— 第4批章节
// 第四部分 数组与集合（共 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   csharp3-ch15    : 第十五章 多维数组与交错数组
//   csharp3-ch16    : 第十六章 Array 类与数组操作
//   csharp3-ch17    : 第十七章 Span<T> 与 Memory<T>
//   csharp3-ch18    : 第十八章 集合概述与 ArrayList
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第十五章：多维数组与交错数组
  // ============================================================
  {
    id: 'csharp3-ch15',
    group: '第四部分 数组与集合',
    icon: '📐',
    title: '第十五章 多维数组与交错数组',
    content: `## 第十五章　多维数组与交错数组

本章深入讲解 C# 中的多维数组（矩阵）和交错数组（数组的数组），包括声明、初始化、遍历和实际应用场景。

### 一、二维数组基础 ⭐

\`\`\`csharp
// 二维数组：类型[,] 数组名
// 可以理解为有行和列的表格/矩阵

// 声明并初始化（方式1：指定大小）
int[,] matrix = new int[3, 4];  // 3 行 4 列，所有元素初始化为 0
matrix[0, 0] = 1;   // 第 1 行第 1 列
matrix[0, 1] = 2;   // 第 1 行第 2 列
matrix[0, 2] = 3;   // 第 1 行第 3 列
matrix[0, 3] = 4;   // 第 1 行第 4 列
matrix[1, 0] = 5;   // 第 2 行第 1 列
// ... 以此类推

// 方式2：声明时直接初始化（最常用）
int[,] grid = {
    { 1, 2, 3, 4 },    // 第 1 行
    { 5, 6, 7, 8 },    // 第 2 行
    { 9, 10, 11, 12 }  // 第 3 行
};

// 访问元素：数组名[行索引, 列索引]
Console.WriteLine($"第 2 行第 3 列：{grid[1, 2]}");  // 7（索引从 0 开始）

// 获取维度信息
int rows = grid.GetLength(0);  // 获取第 0 维（行）的长度 → 3
int cols = grid.GetLength(1);  // 获取第 1 维（列）的长度 → 4
Console.WriteLine($"矩阵大小：{rows} 行 × {cols} 列");
Console.WriteLine($"总元素数：{grid.Length}");  // 3 × 4 = 12
\`\`\`

### 二、遍历二维数组

\`\`\`csharp
int[,] grid = {
    { 1, 2, 3 },
    { 4, 5, 6 },
    { 7, 8, 9 }
};

// 方式1：嵌套 for 循环（推荐，可以控制索引）
Console.WriteLine("嵌套 for 遍历：");
for (int i = 0; i < grid.GetLength(0); i++)      // 外层：遍历行
{
    for (int j = 0; j < grid.GetLength(1); j++)  // 内层：遍历列
    {
        Console.Write($"{grid[i, j],3}");  // 每个元素占 3 位，右对齐
    }
    Console.WriteLine();  // 每行结束换行
}

// 方式2：foreach 遍历（简洁，按行优先顺序）
Console.WriteLine("\\nforeach 遍历（按行优先）：");
foreach (int value in grid)  // 按行优先顺序逐一取出所有元素
{
    Console.Write($"{value} ");
}
Console.WriteLine();

// 实际场景：矩阵加法
int[,] matrixA = { { 1, 2, 3 }, { 4, 5, 6 } };
int[,] matrixB = { { 7, 8, 9 }, { 10, 11, 12 } };
int[,] sum = new int[2, 3];  // 存储结果的矩阵

for (int i = 0; i < 2; i++)
{
    for (int j = 0; j < 3; j++)
    {
        sum[i, j] = matrixA[i, j] + matrixB[i, j];  // 对应位置相加
    }
}

Console.WriteLine("\\n矩阵加法结果：");
for (int i = 0; i < 2; i++)
{
    for (int j = 0; j < 3; j++)
    {
        Console.Write($"{sum[i, j],3}");
    }
    Console.WriteLine();
}
\`\`\`

### 三、三维数组

\`\`\`csharp
// 三维数组：类型[,,] 数组名
// 可以理解为多个二维数组堆叠，如 3D 空间

// 创建 2 层 × 3 行 × 4 列的三维数组
int[,,] cube = new int[2, 3, 4];

// 初始化
int value = 1;
for (int layer = 0; layer < 2; layer++)      // 层
{
    for (int row = 0; row < 3; row++)        // 行
    {
        for (int col = 0; col < 4; col++)    // 列
        {
            cube[layer, row, col] = value++;
        }
    }
}

// 访问元素
Console.WriteLine($"cube[0, 1, 2] = {cube[0, 1, 2]}");  // 第 0 层第 1 行第 2 列

// 遍历三维数组
Console.WriteLine("\\n三维数组内容：");
for (int layer = 0; layer < cube.GetLength(0); layer++)
{
    Console.WriteLine($"--- 第 {layer} 层 ---");
    for (int row = 0; row < cube.GetLength(1); row++)
    {
        for (int col = 0; col < cube.GetLength(2); col++)
        {
            Console.Write($"{cube[layer, row, col],3}");
        }
        Console.WriteLine();
    }
}

// 实际场景：RGB 颜色空间
// 存储 RGB 值的颜色立方体（每个通道 256 级）
// byte[,,] colorSpace = new byte[256, 256, 256];  // 太大，此处仅示意
\`\`\`

### 四、交错数组（Jagged Array）⭐

\`\`\`csharp
// 交错数组：数组的数组，每一行可以有不同的长度
// 声明：类型[][] 数组名

// 创建交错数组
int[][] jagged = new int[3][];  // 3 行，每行长度未定
jagged[0] = new int[] { 1, 2, 3, 4 };       // 第 1 行有 4 个元素
jagged[1] = new int[] { 5, 6 };             // 第 2 行有 2 个元素
jagged[2] = new int[] { 7, 8, 9 };          // 第 3 行有 3 个元素

// 简写初始化
int[][] jagged2 = {
    new int[] { 1, 2, 3, 4 },
    new int[] { 5, 6 },
    new int[] { 7, 8, 9 }
};

// 访问元素：[行][列]
Console.WriteLine($"jagged[0][2] = {jagged[0][2]}");  // 3
Console.WriteLine($"jagged[1][1] = {jagged[1][1]}");  // 6

// 遍历交错数组
for (int i = 0; i < jagged.Length; i++)  // 遍历行
{
    Console.Write($"第 {i} 行（{jagged[i].Length} 个元素）：");
    for (int j = 0; j < jagged[i].Length; j++)  // 遍历每行的列
    {
        Console.Write($"{jagged[i][j]} ");
    }
    Console.WriteLine();
}

// 实际场景：存储不同学生不同数量的考试成绩
int[][] studentScores = {
    new int[] { 85, 90, 88 },               // 学生 1：3 门课
    new int[] { 92, 95, 89, 91 },           // 学生 2：4 门课
    new int[] { 78, 82 },                   // 学生 3：2 门课
    new int[] { 95, 88, 92, 96, 90 }        // 学生 4：5 门课
};

Console.WriteLine("\\n学生成绩统计：");
for (int i = 0; i < studentScores.Length; i++)
{
    double avg = studentScores[i].Average();  // 计算每个学生的平均分
    int max = studentScores[i].Max();         // 最高分
    int min = studentScores[i].Min();         // 最低分
    Console.WriteLine($"学生 {i + 1}：平均 {avg:F1}，最高 {max}，最低 {min}");
}
\`\`\`

### 五、多维数组 vs 交错数组

\`\`\`csharp
// 多维数组（矩形数组）：int[,] 每行长度相同
int[,] rectangular = {
    { 1, 2, 3 },
    { 4, 5, 6 },
    { 7, 8, 9 }
};

// 交错数组：int[][] 每行长度可以不同
int[][] jagged = {
    new int[] { 1, 2, 3 },
    new int[] { 4, 5 },
    new int[] { 6, 7, 8, 9 }
};

// 访问方式对比
int r = rectangular[1, 2];  // 多维：逗号分隔 → 6
int j = jagged[1][1];       // 交错：多个中括号 → 5

// 遍历方式对比
// 多维数组：双重 for
for (int i = 0; i < rectangular.GetLength(0); i++)
    for (int k = 0; k < rectangular.GetLength(1); k++)
        Console.Write($"{rectangular[i, k]} ");

// 交错数组：可以混合 foreach
foreach (int[] row in jagged)  // 每行是一个数组
    foreach (int item in row)  // 遍历行内元素
        Console.Write($"{item} ");
\`\`\`

| 对比维度 | 多维数组 int[,] | 交错数组 int[][] |
| --- | --- | --- |
| 内存布局 | 连续内存块 | 多块不连续内存 |
| 每行长度 | 必须相同 | 可以不同 |
| 访问速度 | 稍慢（需要计算偏移） | 稍快（CLR 优化） |
| 内存占用 | 可能更少 | 每行有额外开销 |
| 语法 | matrix[i, j] | jagged[i][j] |
| 适用场景 | 固定大小的矩阵 | 不规则数据、性能敏感 |

### 六、实际场景应用

\`\`\`csharp
// 场景1：棋盘游戏（二维数组）
char[,] chessBoard = new char[8, 8];
// 初始化棋盘
for (int i = 0; i < 8; i++)
    for (int j = 0; j < 8; j++)
        chessBoard[i, j] = (i + j) % 2 == 0 ? '□' : '■';

// 打印棋盘
Console.WriteLine("国际象棋棋盘：");
for (int i = 0; i < 8; i++)
{
    Console.Write($"  {8 - i} ");
    for (int j = 0; j < 8; j++)
    {
        Console.Write($"{chessBoard[i, j]} ");
    }
    Console.WriteLine();
}
Console.WriteLine("    a b c d e f g h");

// 场景2：图像处理（像素矩阵）
// 灰度图像：每个像素一个 byte 值
byte[,] image = {
    { 255, 200, 150, 100 },
    { 200, 180, 130, 80 },
    { 150, 130, 100, 60 }
};

// 图像亮度调整：每个像素增加 30
for (int i = 0; i < image.GetLength(0); i++)
{
    for (int j = 0; j < image.GetLength(1); j++)
    {
        // 确保不超出 byte 范围（0-255）
        image[i, j] = (byte)Math.Min(image[i, j] + 30, 255);
    }
}

// 场景3：稀疏矩阵（交错数组节省内存）
// 只存储非零行
int[][] sparseMatrix = {
    new int[] { 1, 0, 0, 5 },       // 第 1 行有 2 个非零元素
    new int[] { 0, 0, 3, 0 },       // 第 2 行有 1 个非零元素
    new int[] { 0, 7, 0, 0, 9 }     // 第 3 行有 2 个非零元素（长度不同）
};
\`\`\`

### 七、小结

| 知识点 | 关键内容 |
| --- | --- |
| 二维数组 | int[,] 矩阵，GetLength() 获取维度 |
| 遍历 | 嵌套 for（索引可控）、foreach（简洁） |
| 三维数组 | int[,,] 多层结构 |
| 交错数组 | int[][] 每行长度可不同 |
| 多维 vs 交错 | 内存布局、访问方式、适用场景不同 |
| 实用场景 | 棋盘、图像处理、稀疏矩阵 |

> 多维数组和交错数组是处理复杂数据结构的利器。下一章我们深入学习 Array 类的高级操作。`,
  },

  // ============================================================
  // 第十六章：Array 类与数组操作
  // ============================================================
  {
    id: 'csharp3-ch16',
    group: '第四部分 数组与集合',
    icon: '🔢',
    title: '第十六章 Array 类与数组操作',
    content: `## 第十六章　Array 类与数组操作

Array 类提供了丰富的静态方法用于数组操作。本章涵盖排序、搜索、复制、查找、切片等高级操作。

### 一、排序与反转 ⭐

\`\`\`csharp
// Array.Sort()：原地排序（修改原数组）
int[] numbers = { 5, 2, 8, 1, 9, 3, 7, 4, 6 };

// 升序排序
Array.Sort(numbers);  // 原地排序，不创建新数组
Console.WriteLine($"升序：{string.Join(", ", numbers)}");
// 输出：1, 2, 3, 4, 5, 6, 7, 8, 9

// 降序排序：先升序再反转
Array.Reverse(numbers);  // 反转数组
Console.WriteLine($"降序：{string.Join(", ", numbers)}");
// 输出：9, 8, 7, 6, 5, 4, 3, 2, 1

// 部分排序：Sort(数组, 起始索引, 长度)
int[] partial = { 5, 2, 8, 1, 9, 3, 7 };
Array.Sort(partial, 1, 4);  // 从索引 1 开始排序 4 个元素
Console.WriteLine($"部分排序：{string.Join(", ", partial)}");
// 输出：5, 1, 2, 8, 9, 3, 7（索引 1-4 排序了，其余不变）

// 自定义排序：使用 Comparison 委托
string[] names = { "Bob", "Alice", "Charlie", "David" };
Array.Sort(names, (a, b) => a.Length.CompareTo(b.Length));  // 按字符串长度排序
Console.WriteLine($"按长度排序：{string.Join(", ", names)}");
// 输出：Bob, Alice, David, Charlie
\`\`\`

### 二、搜索与查找

\`\`\`csharp
// BinarySearch：二分查找（要求数组已排序）
int[] sorted = { 1, 3, 5, 7, 9, 11, 13, 15 };
int searchIndex = Array.BinarySearch(sorted, 7);  // 查找 7
Console.WriteLine($"7 的索引：{searchIndex}");  // 3

// 查找不存在的元素：返回负数（按位取反后是应插入的位置）
int notFound = Array.BinarySearch(sorted, 8);
Console.WriteLine($"8 的索引：{notFound}");  // 负数，~notFound = 4（应插入在索引 4）
Console.WriteLine($"8 应插入在索引：{~notFound}");

// IndexOf / LastIndexOf：线性查找
int[] data = { 10, 20, 30, 20, 40, 20, 50 };
int first = Array.IndexOf(data, 20);        // 查找第一个 20
int last = Array.LastIndexOf(data, 20);     // 查找最后一个 20
Console.WriteLine($"第一个 20 在索引 {first}，最后一个在索引 {last}");

// Find / FindAll / FindIndex：条件查找
int[] values = { 10, 25, 30, 45, 50, 65, 70 };

// Find：查找第一个满足条件的元素
int firstEven = Array.Find(values, x => x % 2 == 0);  // 查找第一个偶数
Console.WriteLine($"第一个偶数：{firstEven}");  // 10

// FindAll：查找所有满足条件的元素
int[] allBig = Array.FindAll(values, x => x > 30);
Console.WriteLine($"大于 30：{string.Join(", ", allBig)}");  // 45, 50, 65, 70

// FindIndex：查找第一个满足条件的索引
int idx = Array.FindIndex(values, x => x > 50);
Console.WriteLine($"第一个大于 50 的索引：{idx}（值：{values[idx]}）");  // 5（65）

// FindLast：查找最后一个满足条件的元素
int lastEven = Array.FindLast(values, x => x % 2 == 0);
Console.WriteLine($"最后一个偶数：{lastEven}");  // 70

// Exists：判断是否存在满足条件的元素
bool hasBig = Array.Exists(values, x => x > 100);
Console.WriteLine($"存在大于 100 的元素吗？{hasBig}");  // False

// TrueForAll：判断所有元素是否都满足条件
bool allPositive = Array.TrueForAll(values, x => x > 0);
Console.WriteLine($"所有元素都大于 0 吗？{allPositive}");  // True
\`\`\`

### 三、复制与清空

\`\`\`csharp
// Array.Copy()：复制元素
int[] source = { 1, 2, 3, 4, 5 };
int[] dest = new int[5];

// 复制整个数组
Array.Copy(source, dest, source.Length);
Console.WriteLine($"完整复制：{string.Join(", ", dest)}");

// 部分复制：Array.Copy(源, 源起始, 目标, 目标起始, 数量)
int[] partial = new int[3];
Array.Copy(source, 1, partial, 0, 3);  // 从 source[1] 复制 3 个到 partial[0]
Console.WriteLine($"部分复制：{string.Join(", ", partial)}");  // 2, 3, 4

// Clone()：创建数组的浅拷贝
int[] source2 = { 10, 20, 30 };
int[] cloned = (int[])source2.Clone();  // 浅拷贝，新数组
cloned[0] = 999;  // 修改克隆不影响原数组
Console.WriteLine($"原数组：[{string.Join(", ", source2)}]");
Console.WriteLine($"克隆数组：[{string.Join(", ", cloned)}]");

// CopyTo()：复制到已有数组
int[] target = new int[5];
source.CopyTo(target, 0);  // 从 target[0] 开始复制
Console.WriteLine($"CopyTo：{string.Join(", ", target)}");  // 1, 2, 3, 4, 5

// ConstrainedCopy：保证复制是原子性的（要么全成功，要么全失败）
int[] safeDest = new int[5];
Array.ConstrainedCopy(source, 0, safeDest, 0, source.Length);

// Array.Clear()：清空指定范围的元素为默认值
int[] clearArr = { 1, 2, 3, 4, 5 };
Array.Clear(clearArr, 1, 3);  // 从索引 1 开始清空 3 个元素
Console.WriteLine($"清空后：{string.Join(", ", clearArr)}");  // 1, 0, 0, 0, 5
\`\`\`

### 四、Resize 与 Reverse

\`\`\`csharp
// Array.Resize()：调整数组大小（实际上是创建新数组）
int[] arr = { 1, 2, 3 };
Console.WriteLine($"原始：{string.Join(", ", arr)}");

// 扩大
Array.Resize(ref arr, 5);  // 扩大到 5 个元素，新元素为默认值
Console.WriteLine($"扩大后：{string.Join(", ", arr)}");  // 1, 2, 3, 0, 0

// 缩小
Array.Resize(ref arr, 2);  // 缩小到 2 个元素，截断多余
Console.WriteLine($"缩小后：{string.Join(", ", arr)}");  // 1, 2

// ⚠️ Resize 内部创建新数组，频繁调用影响性能
// 如果需要频繁增删，用 List<T> 代替

// Array.Reverse()：反转数组
int[] numbers = { 1, 2, 3, 4, 5 };
Array.Reverse(numbers);  // 原地反转
Console.WriteLine($"反转后：{string.Join(", ", numbers)}");  // 5, 4, 3, 2, 1

// 部分反转
int[] partial = { 1, 2, 3, 4, 5, 6, 7 };
Array.Reverse(partial, 2, 3);  // 从索引 2 开始反转 3 个元素
Console.WriteLine($"部分反转：{string.Join(", ", partial)}");  // 1, 2, 5, 4, 3, 6, 7
\`\`\`

### 五、ForEach 与 ConvertAll

\`\`\`csharp
// Array.ForEach()：对每个元素执行操作（不返回值）
int[] numbers = { 1, 2, 3, 4, 5 };
Console.Write("每个元素 ×2：");
Array.ForEach(numbers, n => Console.Write($"{n * 2} "));  // 输出 2 4 6 8 10
Console.WriteLine();

// 带索引的 ForEach 需要自己实现
Console.WriteLine("带索引的输出：");
for (int i = 0; i < numbers.Length; i++)
{
    Console.WriteLine($"  numbers[{i}] = {numbers[i]}");
}

// Array.ConvertAll()：转换每个元素并返回新数组
string[] strNumbers = Array.ConvertAll(numbers, n => n.ToString());
Console.WriteLine($"转换为字符串：{string.Join(", ", strNumbers)}");

// 实际场景：类型转换
double[] prices = { 9.99, 19.99, 29.99, 5.49 };
string[] formatted = Array.ConvertAll(prices, p => $"¥{p:F2}");
Console.WriteLine($"格式化价格：{string.Join(", ", formatted)}");

// 实际场景：条件转换
int[] scores = { 55, 72, 95, 48, 88, 63 };
string[] grades = Array.ConvertAll(scores, s => s switch
{
    >= 90 => "A",
    >= 80 => "B",
    >= 70 => "C",
    >= 60 => "D",
    _ => "F"
});
Console.WriteLine($"成绩等级：{string.Join(", ", grades)}");
\`\`\`

### 六、数组切片（C# 8+ 范围）⭐

\`\`\`csharp
// 索引（Index）：^ 从末尾开始
int[] numbers = { 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 };

// ^ 运算符：^1 是最后一个，^2 是倒数第二个
Console.WriteLine($"最后一个：{numbers[^1]}");   // 100
Console.WriteLine($"倒数第三个：{numbers[^3]}"); // 80

// 范围（Range）：.. 运算符获取子数组
// 语法：数组[起始..结束]，左闭右开 [start, end)

// 获取前 3 个
int[] first3 = numbers[..3];  // 索引 0, 1, 2
Console.WriteLine($"前 3 个：{string.Join(", ", first3)}");  // 10, 20, 30

// 获取后 3 个
int[] last3 = numbers[^3..];  // ^3 到末尾
Console.WriteLine($"后 3 个：{string.Join(", ", last3)}");  // 80, 90, 100

// 获取中间部分
int[] middle = numbers[3..7];  // 索引 3, 4, 5, 6
Console.WriteLine($"中间 4 个：{string.Join(", ", middle)}");  // 40, 50, 60, 70

// 去掉首尾
int[] trim = numbers[1..^1];  // 去掉第一个和最后一个
Console.WriteLine($"去掉首尾：{string.Join(", ", trim)}");

// 全部复制
int[] all = numbers[..];  // 等价于浅拷贝
Console.WriteLine($"全部：{string.Join(", ", all)}");

// 范围变量
Range r = 2..5;  // 定义范围
int[] sliced = numbers[r];  // 使用范围变量
Console.WriteLine($"范围变量：{string.Join(", ", sliced)}");  // 30, 40, 50

// 范围用于字符串
string text = "Hello, World!";
string sub = text[7..12];  // "World"
Console.WriteLine($"字符串切片：{sub}");
\`\`\`

### 七、小结

| 知识点 | 关键内容 |
| --- | --- |
| Sort / Reverse | 原地排序和反转 |
| BinarySearch | 二分查找，要求数组已排序 |
| IndexOf / Find | 线性查找和条件查找 |
| Copy / Clone | 数组复制 |
| Resize | 调整大小（创建新数组） |
| ForEach / ConvertAll | 遍历和转换 |
| 索引与范围 | ^ 末尾索引，.. 范围切片 |
| Clear | 清空元素为默认值 |

> Array 类提供的方法非常丰富。下一章我们学习高性能的 Span<T> 和 Memory<T>。`,
  },

  // ============================================================
  // 第十七章：Span<T> 与 Memory<T>
  // ============================================================
  {
    id: 'csharp3-ch17',
    group: '第四部分 数组与集合',
    icon: '⚡',
    title: '第十七章 Span<T> 与 Memory<T>',
    content: `## 第十七章　Span<T> 与 Memory<T>

Span<T> 和 Memory<T> 是 .NET 中的高性能内存视图，可以在不分配新内存的情况下操作数组切片。本章讲解它们的基本用法和性能优势。

### 一、Span<T> 基础 ⭐

\`\`\`csharp
// Span<T>：栈上的内存视图，可以指向数组、stackalloc、非托管内存
// 高性能：不分配堆内存，无 GC 压力

// 从数组创建 Span
int[] numbers = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
Span<int> span = numbers;  // 整个数组的 Span 视图

// 从数组切片创建 Span
Span<int> slice = numbers.AsSpan(2, 5);  // 从索引 2 开始，5 个元素：{3, 4, 5, 6, 7}

// 修改 Span 中的元素会直接影响原数组
slice[0] = 100;  // 修改 slice 的第一个元素
Console.WriteLine($"原数组[2]：{numbers[2]}");  // 100（原数组也被修改了！）

// 遍历 Span
Console.Write("Span 内容：");
foreach (int n in slice)
{
    Console.Write($"{n} ");  // 100, 4, 5, 6, 7
}
Console.WriteLine();

// Span 属性
Console.WriteLine($"Span 长度：{slice.Length}");
Console.WriteLine($"Span 是否为空：{slice.IsEmpty}");
\`\`\`

### 二、Span<T> 切片操作

\`\`\`csharp
int[] numbers = { 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 };
Span<int> span = numbers;

// Slice：创建子 Span（零分配）
Span<int> first3 = span.Slice(0, 3);     // 前 3 个：{10, 20, 30}
Span<int> last3 = span.Slice(span.Length - 3);  // 后 3 个：{80, 90, 100}
Span<int> middle = span.Slice(3, 4);     // 从索引 3 开始 4 个：{40, 50, 60, 70}

// 使用范围语法（C# 8+）
Span<int> range1 = span[..3];    // 前 3 个
Span<int> range2 = span[^3..];   // 后 3 个
Span<int> range3 = span[3..7];   // 索引 3-6

Console.WriteLine($"前 3：{string.Join(", ", range1.ToArray())}");
Console.WriteLine($"后 3：{string.Join(", ", range2.ToArray())}");
Console.WriteLine($"中间：{string.Join(", ", range3.ToArray())}");

// 链式切片
Span<int> chained = span.Slice(2).Slice(1, 3);  // 从索引 3 开始 3 个
Console.WriteLine($"链式切片：{string.Join(", ", chained.ToArray())}");  // 40, 50, 60
\`\`\`

### 三、ReadOnlySpan<T>

\`\`\`csharp
// ReadOnlySpan<T>：只读版本的 Span<T>，不能修改元素
// 可以从 string、数组等创建

// 从字符串创建（string 天然支持 ReadOnlySpan<char>）
ReadOnlySpan<char> textSpan = "Hello, World!".AsSpan();
Console.WriteLine($"字符串长度：{textSpan.Length}");

// 字符串切片不分配新字符串
ReadOnlySpan<char> world = textSpan.Slice(7, 5);  // "World"（零分配！）
Console.WriteLine($"切片：{world.ToString()}");

// 从数组创建只读视图
int[] numbers = { 1, 2, 3, 4, 5 };
ReadOnlySpan<int> readOnly = numbers;  // 隐式转换

// readOnly[0] = 100;  // 编译错误！ReadOnlySpan 不能修改
Console.WriteLine($"第一个元素：{readOnly[0]}");

// 实际场景：高效的字符串解析
ReadOnlySpan<char> input = "123,456,789".AsSpan();
int sum = 0;
// 按逗号分割并求和（零分配）
while (true)
{
    int commaIndex = input.IndexOf(',');  // 查找逗号位置
    ReadOnlySpan<char> part;
    if (commaIndex == -1)
    {
        part = input;  // 最后一部分
    }
    else
    {
        part = input[..commaIndex];  // 逗号之前的部分
        input = input[(commaIndex + 1)..];  // 剩余部分
    }
    if (int.TryParse(part, out int num))
    {
        sum += num;
    }
    if (commaIndex == -1) break;
}
Console.WriteLine($"数字和：{sum}");  // 123 + 456 + 789 = 1368
\`\`\`

### 四、stackalloc 与 Span ⭐

\`\`\`csharp
// stackalloc：在栈上分配内存，不需要 GC
// 结合 Span<T> 使用，实现零堆分配的高性能代码

// 在栈上分配数组
Span<int> stackArray = stackalloc int[10];  // 在栈上分配 10 个 int

// 初始化
for (int i = 0; i < stackArray.Length; i++)
{
    stackArray[i] = i * 10;  // 0, 10, 20, ..., 90
}

// 使用
Console.WriteLine($"栈数组内容：{string.Join(", ", stackArray.ToArray())}");

// stackalloc 的初始化器（C# 7.2+）
Span<int> initialized = stackalloc int[] { 1, 2, 3, 4, 5 };
Console.WriteLine($"初始化：{string.Join(", ", initialized.ToArray())}");

// ⚠️ stackalloc 注意事项：
// 1. 栈空间有限（通常 1MB），大数组不要用 stackalloc
// 2. stackalloc 分配的内存在方法返回时自动释放
// 3. 适合小数组（< 1024 字节）的临时操作

// 实际场景：临时缓冲区
void ProcessData(ReadOnlySpan<byte> data)
{
    // 在栈上分配临时缓冲区，避免堆分配
    Span<byte> buffer = stackalloc byte[256];
    int length = Math.Min(data.Length, buffer.Length);
    data[..length].CopyTo(buffer);  // 复制到缓冲区
    // 处理 buffer...
    Console.WriteLine($"处理了 {length} 字节");
}
ProcessData(new byte[] { 1, 2, 3, 4, 5 });
\`\`\`

### 五、Memory<T> 基础

\`\`\`csharp
// Memory<T>：堆安全的 Span<T>，可以存储在字段中、用于异步方法
// Span<T> 是 ref struct，只能在栈上；Memory<T> 没有这个限制

// 从数组创建 Memory
int[] numbers = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
Memory<int> memory = numbers;  // 整个数组的 Memory 视图

// 切片
Memory<int> slice = memory.Slice(2, 5);  // 索引 2-6：{3, 4, 5, 6, 7}

// 获取 Span（需要时再获取）
Span<int> span = slice.Span;
Console.WriteLine($"Memory 切片：{string.Join(", ", span.ToArray())}");

// Memory<T> 可以存储在字段中
class DataProcessor
{
    private Memory<byte> _buffer;  // Memory 可以存为字段（Span 不行）

    public DataProcessor(Memory<byte> buffer)
    {
        _buffer = buffer;
    }

    public void Process()
    {
        Span<byte> span = _buffer.Span;  // 使用时获取 Span
        Console.WriteLine($"处理 {span.Length} 字节");
    }
}

var processor = new DataProcessor(new byte[] { 1, 2, 3 });
processor.Process();

// ReadOnlyMemory<T>：只读版本
ReadOnlyMemory<char> textMem = "Hello, Span!".AsMemory();
Console.WriteLine($"Memory 长度：{textMem.Length}");
\`\`\`

### 六、Span<T> vs Memory<T> vs Array

\`\`\`csharp
// 性能对比：Span 操作不分配内存
int[] data = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

// 方式1：传统数组切片（分配新数组）
int[] arraySlice = data[2..7];  // 分配新数组，复制数据
Console.WriteLine($"数组切片：{string.Join(", ", arraySlice)}");

// 方式2：Span 切片（零分配，只是视图）
Span<int> spanSlice = data.AsSpan(2, 5);  // 不分配，只是指针+长度
Console.WriteLine($"Span 切片：{string.Join(", ", spanSlice.ToArray())}");

// 方式3：反转
// 传统方式：创建新数组
int[] reversed = data.Reverse().ToArray();  // 分配新数组

// Span 方式：原地反转（不分配）
Span<int> span2 = data;  // 创建视图
span2.Reverse();  // 原地反转
Console.WriteLine($"Span 反转：{string.Join(", ", data)}");

// 恢复原数组
span2.Reverse();
\`\`\`

| 特性 | Span<T> | Memory<T> | Array |
| --- | --- | --- | --- |
| 存储位置 | 仅栈 | 堆 | 堆 |
| 可作为字段 | 否 | 是 | 是 |
| 异步方法 | 否 | 是 | 是 |
| 切片开销 | 零分配 | 零分配 | 分配新数组 |
| 支持 stackalloc | 是 | 否 | 否 |
| 用途 | 高性能临时操作 | 持久化内存视图 | 通用数据存储 |

### 七、小结

| 知识点 | 关键内容 |
| --- | --- |
| Span<T> | 栈上内存视图，零分配切片 |
| ReadOnlySpan<T> | 只读版本，字符串解析利器 |
| stackalloc | 栈上分配，结合 Span 使用 |
| Memory<T> | 堆安全版本，可存字段、可异步 |
| 性能优势 | 切片不分配内存，减少 GC 压力 |
| 使用场景 | 高性能字符串处理、数据管道 |

> Span<T> 是 .NET 中高性能编程的核心工具。下一章我们学习集合概述与 ArrayList。`,
  },

  // ============================================================
  // 第十八章：集合概述与 ArrayList
  // ============================================================
  {
    id: 'csharp3-ch18',
    group: '第四部分 数组与集合',
    icon: '📚',
    title: '第十八章 集合概述与 ArrayList',
    content: `## 第十八章　集合概述与 ArrayList

集合是比数组更灵活的数据结构。本章讲解集合接口体系、ArrayList 的用法，以及为什么现代 C# 应该用泛型集合替代 ArrayList。

### 一、集合接口体系 ⭐

\`\`\`csharp
// C# 集合接口层次结构（从基础到高级）：
// IEnumerable：可枚举（最基础）
//   └── ICollection：可计数、可添加删除
//         └── IList：可索引访问
//         └── IDictionary：键值对访问

// IEnumerable<T>：最基础的集合接口，只能遍历
IEnumerable<int> numbers = new List<int> { 1, 2, 3, 4, 5 };
foreach (int n in numbers)
{
    Console.Write($"{n} ");  // 只能遍历，不能添加/删除/索引
}
Console.WriteLine();

// ICollection<T>：添加计数、添加、删除等操作
ICollection<int> collection = new List<int> { 1, 2, 3 };
Console.WriteLine($"元素数量：{collection.Count}");  // 有 Count 属性
collection.Add(4);         // 可以添加
collection.Remove(2);      // 可以删除
Console.WriteLine($"修改后：{string.Join(", ", collection)}");  // 1, 3, 4

// IList<T>：添加索引访问
IList<int> list = new List<int> { 10, 20, 30 };
Console.WriteLine($"索引 1：{list[1]}");  // 可以通过索引访问
list[1] = 25;           // 可以通过索引修改
list.Insert(1, 15);     // 可以在指定位置插入
Console.WriteLine($"修改后：{string.Join(", ", list)}");  // 10, 15, 25, 30

// 接口层次总结
// IEnumerable<T>  →  只能遍历
// ICollection<T>  →  遍历 + 计数 + 添加/删除
// IList<T>        →  遍历 + 计数 + 添加/删除 + 索引访问
// IDictionary<K,V> →  遍历 + 计数 + 键值对访问
\`\`\`

### 二、ArrayList 基础

\`\`\`csharp
// ArrayList：非泛型集合，存储 object 类型
// 可以存任意类型，但需要装箱/拆箱，性能差
// ⚠️ 新代码不推荐使用，用 List<T> 代替

using System.Collections;  // ArrayList 在 System.Collections 命名空间

// 创建 ArrayList
ArrayList arrayList = new ArrayList();  // 空集合

// 添加元素（可以添加任意类型）
arrayList.Add(42);                    // 添加 int（装箱）
arrayList.Add("Hello");               // 添加 string
arrayList.Add(3.14);                  // 添加 double（装箱）
arrayList.Add(true);                  // 添加 bool（装箱）
arrayList.Add(new DateTime(2024, 1, 1)); // 添加 DateTime

Console.WriteLine($"ArrayList 中有 {arrayList.Count} 个元素");

// 遍历 ArrayList
foreach (object item in arrayList)  // 所有元素都是 object 类型
{
    Console.WriteLine($"  {item} (类型：{item.GetType().Name})");
}

// 通过索引访问（返回 object，需要强制转换）
int first = (int)arrayList[0];  // 需要拆箱和强制转换
string second = (string)arrayList[1];

// 插入和删除
arrayList.Insert(2, "插入的元素");  // 在索引 2 处插入
arrayList.Remove(42);               // 删除值为 42 的元素
arrayList.RemoveAt(0);              // 删除索引 0 的元素

Console.WriteLine($"\\n修改后：");
foreach (object item in arrayList)
{
    Console.WriteLine($"  {item}");
}
\`\`\`

### 三、装箱与拆箱问题 ⚠️

\`\`\`csharp
// 装箱（Boxing）：值类型 → object，需要分配堆内存
// 拆箱（Unboxing）：object → 值类型，需要类型检查和内存复制

// 装箱示例
int number = 42;
object boxed = number;  // 装箱：在堆上分配内存，复制值
Console.WriteLine($"装箱后的值：{boxed}");

// 拆箱示例
object obj = 123;  // 123 被装箱存储在 object 中
int unboxed = (int)obj;  // 拆箱：从堆中取出值，需要强制转换
Console.WriteLine($"拆箱后的值：{unboxed}");

// ⚠️ 拆箱类型必须完全匹配
object obj2 = 123;  // 装箱为 int
// long l = (long)obj2;  // 运行时错误！object 内部是 int，不能拆箱为 long
int correct = (int)obj2;  // 正确：拆箱为原始类型

// ArrayList 的性能问题
ArrayList list = new ArrayList();
// 每次添加值类型都会装箱
for (int i = 0; i < 1000; i++)
{
    list.Add(i);  // 装箱 1000 次！每次分配堆内存
}

// 每次读取值类型都需要拆箱
int sum = 0;
foreach (object item in list)
{
    sum += (int)item;  // 拆箱 1000 次！
}

// 对比：泛型 List<T> 无装箱
List<int> genericList = new List<int>();
for (int i = 0; i < 1000; i++)
{
    genericList.Add(i);  // 无装箱！直接存储 int
}

int genericSum = 0;
foreach (int item in genericList)
{
    genericSum += item;  // 无拆箱！直接使用 int
}
\`\`\`

### 四、ArrayList 的其他操作

\`\`\`csharp
ArrayList list = new ArrayList { 5, 2, 8, 1, 9, 3 };

// 排序
list.Sort();  // 要求所有元素实现 IComparable 或类型一致
Console.WriteLine($"排序后：{string.Join(", ", list.ToArray())}");

// 反转
list.Reverse();
Console.WriteLine($"反转后：{string.Join(", ", list.ToArray())}");

// 查找
int index = list.IndexOf(5);  // 查找元素 5 的索引
Console.WriteLine($"5 的索引：{index}");

bool contains = list.Contains(8);  // 是否包含 8
Console.WriteLine($"包含 8：{contains}");

// 容量管理
Console.WriteLine($"元素数量：{list.Count}");
Console.WriteLine($"当前容量：{list.Capacity}");
list.TrimToSize();  // 将容量调整为实际元素数量

// 批量添加
list.AddRange(new int[] { 100, 200, 300 });  // 添加整个集合
Console.WriteLine($"批量添加后：{string.Join(", ", list.ToArray())}");

// 转换为数组
object[] array = list.ToArray();  // 返回 object[]
int[] intArray = list.Cast<int>().ToArray();  // 用 LINQ 转换为 int[]

// 清空
list.Clear();
Console.WriteLine($"清空后数量：{list.Count}");
\`\`\`

### 五、为什么现代 C# 用泛型集合替代 ArrayList

\`\`\`csharp
// ArrayList 的问题：
// 1. 类型不安全：可以存任意类型，运行时才报错
// 2. 装箱/拆箱开销：值类型需要装箱，性能差
// 3. 需要强制转换：代码可读性差
// 4. 没有编译时类型检查

// ❌ 旧式写法（ArrayList）
ArrayList oldList = new ArrayList();
oldList.Add(123);
oldList.Add("hello");  // 可以混入不同类型
// int oldValue = (int)oldList[1];  // 运行时错误！索引 1 是 string

// ✅ 现代写法（List<T>）
List<int> newList = new List<int>();
newList.Add(123);
// newList.Add("hello");  // 编译错误！类型安全
int newValue = newList[0];  // 不需要强制转换

// ArrayList vs List<T> 对比
// | 特性 | ArrayList | List<T> |
// | 类型安全 | 否 | 是 |
// | 性能 | 装箱拆箱 | 无装箱 |
// | 编译检查 | 无 | 有 |
// | 代码简洁 | 需要强制转换 | 直接使用 |
// | 推荐使用 | 仅维护旧代码 | 新项目首选 |

// 什么时候还可能需要 ArrayList？
// 1. 维护 .NET Framework 1.x/2.0 时代的旧代码
// 2. 与某些旧 COM 组件交互
// 3. 极少数的反射场景
// 新代码一律使用泛型集合！
\`\`\`

### 六、小结

| 知识点 | 关键内容 |
| --- | --- |
| 集合接口 | IEnumerable → ICollection → IList / IDictionary |
| ArrayList | 非泛型集合，存储 object，可混合类型 |
| 装箱/拆箱 | 值类型 ↔ object 转换，性能开销大 |
| 泛型集合优势 | 类型安全、无装箱、编译检查 |
| 迁移建议 | 新代码用 List<T> 替代 ArrayList |

> 理解了 ArrayList 的局限，你就明白了为什么泛型集合如此重要。下一章我们将进入第五部分——面向对象基础，学习类与对象。`,
  },
];

export { chapters };