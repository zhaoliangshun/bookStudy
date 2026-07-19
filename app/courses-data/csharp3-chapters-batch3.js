// =============================================================
// C# 从入门到精通大全（终极版）—— 第3批章节
// 第三部分 方法与函数（共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   csharp3-ch10    : 第十章 方法基础
//   csharp3-ch11    : 第十一章 方法参数进阶
//   csharp3-ch12    : 第十二章 方法重载与可选参数
//   csharp3-ch13    : 第十三章 局部函数与表达式体
//   csharp3-ch14    : 第十四章 递归与算法初探
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第十章：方法基础
  // ============================================================
  {
    id: 'csharp3-ch10',
    group: '第三部分 方法与函数',
    icon: '🔧',
    title: '第十章 方法基础',
    content: `## 第十章　方法基础

方法（函数）是代码复用的基本单元。本章讲解方法的定义、调用、返回值、签名以及表达式体方法。

### 一、方法定义 ⭐⭐

\`\`\`csharp
// 方法的基本结构：
// 返回值类型 方法名(参数类型 参数名, ...) { 方法体 }

// 示例1：无参数无返回值的方法
void SayHello()
{
    Console.WriteLine("Hello, World!");
    Console.WriteLine("欢迎学习 C# 方法！");
}
// 调用方法
SayHello();  // 输出两行欢迎信息

// 示例2：带参数的方法
void Greet(string name, int age)
{
    // 参数 name：要问候的人名
    // 参数 age：年龄
    Console.WriteLine($"你好，{name}！");
    Console.WriteLine($"你今年 {age} 岁");
}
Greet("张三", 25);  // 传入实参
Greet("李四", 30);  // 可以多次调用，传入不同参数

// 示例3：有返回值的方法
int Add(int a, int b)
{
    int result = a + b;  // 计算结果
    return result;       // 返回结果给调用者
}
int sum = Add(10, 20);  // 接收返回值
Console.WriteLine($"10 + 20 = {sum}");  // 30
\`\`\`

### 二、void 与 return ⭐

\`\`\`csharp
// void 方法：不返回任何值
void PrintMessage(string message)
{
    Console.WriteLine(message);
    // 可以写 return; 但不返回值
    if (string.IsNullOrEmpty(message))
    {
        return;  // 提前退出，不执行后续代码
    }
    Console.WriteLine($"消息长度：{message.Length}");
}
PrintMessage("你好");  // 正常输出
PrintMessage("");      // 提前退出，只输出空行

// 有返回值的方法：必须 return 一个值
// 返回值类型可以是任意类型：int、string、bool、自定义类型等
bool IsEven(int number)
{
    return number % 2 == 0;  // 直接返回表达式结果
}
Console.WriteLine($"4 是偶数吗？{IsEven(4)}");  // True
Console.WriteLine($"7 是偶数吗？{IsEven(7)}");  // False

// 返回 string 的方法
string GetGreeting(string name, string timeOfDay)
{
    return $"早上好，{name}！";  // 直接返回字符串
}
Console.WriteLine(GetGreeting("张三", "早上"));

// 返回 bool 的方法（常用于验证）
bool IsValidAge(int age)
{
    return age >= 0 && age <= 150;  // 年龄在合理范围内
}
\`\`\`

### 三、方法调用

\`\`\`csharp
// 方法调用就是执行方法体中的代码
// 调用时传给方法的实际值叫"实参"（argument）
// 方法定义时声明的变量叫"形参"（parameter）

// 基本调用：方法名(实参1, 实参2, ...)
int result = Add(5, 3);  // 5 和 3 是实参，传给形参 a 和 b

// 调用 void 方法
PrintHeader("用户列表");

// 调用返回值可以忽略（不推荐，但合法）
Add(10, 20);  // 返回值被丢弃

// 方法调用作为表达式的一部分
int total = Add(10, 20) * 2;  // (10+20) * 2 = 60
Console.WriteLine($"总计：{total}");

// 方法调用作为参数传给另一个方法
Console.WriteLine($"计算结果：{Add(100, 200)}");  // 300

// 方法调用链
int final = Add(Add(1, 2), Add(3, 4));  // (1+2) + (3+4) = 10
Console.WriteLine($"最终结果：{final}");

// 辅助方法定义
int Add(int a, int b) => a + b;
void PrintHeader(string title)
{
    Console.WriteLine($"\\n==== {title} ====");
}
\`\`\`

### 四、方法签名

\`\`\`csharp
// 方法签名由方法名 + 参数类型和顺序组成
// 返回值类型不属于签名，不能靠返回值区分重载

// 不同的签名（合法）
void Process(int a) { }           // 签名为 Process(int)
void Process(string a) { }        // 签名为 Process(string)
void Process(int a, int b) { }    // 签名为 Process(int, int)
void Process(int a, string b) { } // 签名为 Process(int, string)
void Process(string a, int b) { } // 签名为 Process(string, int)（顺序不同）

// 非法：只有返回值不同
// int GetValue() { return 0; }
// string GetValue() { return ""; }  // 编译错误！签名相同

// 方法签名是方法重载的基础
// 调用时编译器根据实参类型和数量匹配最合适的方法
Process(42);           // 调用 Process(int)
Process("hello");      // 调用 Process(string)
Process(10, 20);       // 调用 Process(int, int)
Process(10, "hello");  // 调用 Process(int, string)
Process("hello", 10);  // 调用 Process(string, int)
\`\`\`

### 五、表达式体方法（Expression-bodied Methods）⭐

\`\`\`csharp
// 表达式体方法：当方法体只有一个 return 语句时，可以用 => 简化
// 语法：返回值类型 方法名(参数) => 表达式;

// 传统写法（多行方法体）
int Add_Traditional(int a, int b)
{
    return a + b;  // 方法体只有这一行 return
}

// 表达式体写法（简洁优雅）
int Add_Expression(int a, int b) => a + b;  // 一行搞定！

// 更多示例
double Square(double x) => x * x;          // 计算平方
bool IsPositive(int n) => n > 0;           // 判断正数
string FullName(string first, string last) => $"{first} {last}";  // 拼接姓名

// void 方法也可以用表达式体
void Log(string msg) => Console.WriteLine($"[LOG] {msg}");

// 使用表达式体方法
Console.WriteLine($"3 + 5 = {Add_Expression(3, 5)}");
Console.WriteLine($"4 的平方 = {Square(4)}");
Console.WriteLine($"-5 是正数吗？{IsPositive(-5)}");
Console.WriteLine(FullName("张", "三"));
Log("操作完成");
\`\`\`

### 六、方法放置 ⭐

\`\`\`csharp
// 在顶级语句中，方法可以定义在文件中的任何位置
// 但通常放在使用它的代码之前或之后都可以

// 在顶级语句中，方法可以定义在调用之后
// 编译器会自动处理顺序
int result = Multiply(6, 7);  // 调用在后面定义的方法
Console.WriteLine($"6 × 7 = {result}");

// 方法定义（可以放在调用的下面）
int Multiply(int a, int b) => a * b;

// 实际项目的组织方式：
// 在 class 中，方法通常按以下顺序排列：
// 1. 构造函数
// 2. 公共方法（public）
// 3. 私有方法（private）
// 4. 辅助方法

// 在顶级语句中，可以按逻辑分组：
// ===== 主程序 =====
Console.WriteLine("程序开始");
DoWork();
Console.WriteLine("程序结束");

// ===== 业务方法 =====
void DoWork()
{
    // 业务逻辑
    var data = GetData();
    ProcessData(data);
    DisplayResult(data);
}

// ===== 数据方法 =====
string[] GetData() => new[] { "数据1", "数据2", "数据3" };
void ProcessData(string[] data) { /* 处理逻辑 */ }
void DisplayResult(string[] data) => Console.WriteLine(string.Join(", ", data));
\`\`\`

### 七、实战 demo：工具方法集

\`\`\`csharp
// 综合运用：一组实用的工具方法
// 这些方法体现了"高内聚、低耦合"的设计思想

// ===== 数学工具 =====
double CalculateCircleArea(double radius) => Math.PI * radius * radius;
double CalculateRectangleArea(double width, double height) => width * height;
bool IsPrime(int number)
{
    // 判断一个数是否为质数
    if (number < 2) return false;  // 小于 2 的不是质数
    for (int i = 2; i <= Math.Sqrt(number); i++)  // 只需检查到平方根
    {
        if (number % i == 0) return false;  // 能被整除，不是质数
    }
    return true;  // 没有因子，是质数
}

// ===== 字符串工具 =====
string Truncate(string text, int maxLength)
{
    // 截断字符串到指定长度，超出部分用 ... 表示
    if (string.IsNullOrEmpty(text)) return text ?? "";
    return text.Length <= maxLength ? text : text[..maxLength] + "...";
}
string ReverseString(string s)
{
    // 反转字符串
    char[] chars = s.ToCharArray();
    Array.Reverse(chars);
    return new string(chars);
}

// ===== 验证工具 =====
bool IsValidEmail(string email)
{
    // 简单邮箱格式验证
    return !string.IsNullOrEmpty(email) &&
           email.Contains('@') &&
           email.Contains('.') &&
           email.IndexOf('@') < email.LastIndexOf('.');
}

// 测试工具方法
Console.WriteLine($"圆面积（半径5）：{CalculateCircleArea(5):F2}");
Console.WriteLine($"矩形面积：{CalculateRectangleArea(4, 6)}");
Console.WriteLine($"7 是质数吗？{IsPrime(7)}");
Console.WriteLine($"9 是质数吗？{IsPrime(9)}");
Console.WriteLine($"截断：{Truncate("这是一段很长的文本需要截断", 10)}");
Console.WriteLine($"反转：{ReverseString("Hello C#")}");
Console.WriteLine($"邮箱验证：{IsValidEmail("test@example.com")}");
Console.WriteLine($"邮箱验证：{IsValidEmail("invalid-email")}");
\`\`\`

### 八、小结

| 知识点 | 关键内容 |
| --- | --- |
| 方法定义 | 返回值类型 + 方法名 + 参数 + 方法体 |
| void 方法 | 无返回值，可用 return 提前退出 |
| 有返回值 | 必须 return 一个值 |
| 方法签名 | 方法名 + 参数类型和顺序（不含返回值） |
| 表达式体 | => 箭头简化单行返回方法 |
| 方法放置 | 顶级语句中任意位置，class 中按访问级别排列 |

> 方法是代码复用的基石。下一章我们将深入方法参数，学习 ref、out、params 等高级传参方式。`,
  },

  // ============================================================
  // 第十一章：方法参数进阶
  // ============================================================
  {
    id: 'csharp3-ch11',
    group: '第三部分 方法与函数',
    icon: '📥',
    title: '第十一章 方法参数进阶',
    content: `## 第十一章　方法参数进阶

本章讲解 C# 方法参数的高级用法：值传递 vs 引用传递、ref、out、in、params、命名参数、可选参数等。

### 一、值传递 vs 引用传递 ⭐

\`\`\`csharp
// 默认情况下，所有参数都是按值传递（pass by value）
// 值类型：传递的是值的副本，方法内修改不影响原始变量
// 引用类型：传递的是引用的副本，但两个引用指向同一个对象

// 值类型传值：不影响原始变量
void ModifyValue(int x)
{
    x = 100;  // 修改的是副本，不影响原始变量
    Console.WriteLine($"方法内 x = {x}");  // 100
}
int number = 10;
ModifyValue(number);
Console.WriteLine($"方法外 number = {number}");  // 10（未改变！）

// 引用类型传值：指向同一个对象
void ModifyArray(int[] arr)
{
    arr[0] = 999;  // 修改的是同一个数组对象
    Console.WriteLine($"方法内 arr[0] = {arr[0]}");  // 999
}
int[] numbers = { 1, 2, 3 };
ModifyArray(numbers);
Console.WriteLine($"方法外 numbers[0] = {numbers[0]}");  // 999（被改变了！）

// ⚠️ 引用类型传值，修改引用本身不影响原始变量
void ReassignArray(int[] arr)
{
    arr = new int[] { 100, 200, 300 };  // 只改变副本引用，不影响原始变量
    Console.WriteLine($"方法内 arr = [{string.Join(", ", arr)}]");
}
int[] data = { 1, 2, 3 };
ReassignArray(data);
Console.WriteLine($"方法外 data = [{string.Join(", ", data)}]");  // 仍是 [1, 2, 3]
\`\`\`

### 二、ref 参数（引用传递）⭐

\`\`\`csharp
// ref：将参数按引用传递，方法内修改会影响原始变量
// 调用时必须在实参前加 ref 关键字
// 传入的变量必须在调用前初始化

// 交换两个变量的值（经典用法）
void Swap(ref int a, ref int b)
{
    int temp = a;  // 临时保存 a 的值
    a = b;         // 把 b 赋给 a
    b = temp;      // 把临时值赋给 b
}
int x = 10, y = 20;
Console.WriteLine($"交换前：x={x}, y={y}");
Swap(ref x, ref y);  // 调用时加 ref
Console.WriteLine($"交换后：x={x}, y={y}");  // x=20, y=10

// ref 参数修改结构体
void Increment(ref int value)
{
    value++;  // 直接修改原始变量
}
int count = 5;
Increment(ref count);
Console.WriteLine($"自增后：{count}");  // 6

// ref 引用类型参数：可以修改引用本身
void ReassignRef(ref int[] arr)
{
    arr = new int[] { 100, 200, 300 };  // 修改引用本身
}
int[] data = { 1, 2, 3 };
ReassignRef(ref data);  // 传递引用
Console.WriteLine($"重新赋值后：[{string.Join(", ", data)}]");  // [100, 200, 300]

// ⚠️ ref 和 out 的区别：
// ref：变量必须在调用前初始化
// out：变量不需要在调用前初始化，但必须在方法内赋值
\`\`\`

### 三、out 参数 ⭐

\`\`\`csharp
// out：用于从方法返回多个值
// 调用时必须在实参前加 out 关键字
// 方法内必须给 out 参数赋值
// 变量不需要在调用前初始化

// 返回多个值
void GetMinMax(int[] numbers, out int min, out int max)
{
    min = numbers[0];  // 必须给 out 参数赋值
    max = numbers[0];
    foreach (int n in numbers)
    {
        if (n < min) min = n;
        if (n > max) max = n;
    }
}
int[] scores = { 85, 92, 78, 95, 88 };
GetMinMax(scores, out int lowest, out int highest);  // C# 7+ 内联声明
Console.WriteLine($"最低分：{lowest}，最高分：{highest}");

// TryParse 模式就是 out 的经典用法
Console.Write("请输入一个整数：");
string? input = Console.ReadLine();
if (int.TryParse(input, out int number))  // TryParse 内部用 out 返回解析结果
{
    Console.WriteLine($"解析成功：{number}");
}
else
{
    Console.WriteLine("解析失败");
}

// 除法运算：同时返回商和余数
bool SafeDivide(int a, int b, out int quotient, out int remainder)
{
    quotient = 0;
    remainder = 0;
    if (b == 0)
    {
        return false;  // 除数为零，返回 false
    }
    quotient = a / b;      // 商
    remainder = a % b;     // 余数
    return true;           // 计算成功
}

if (SafeDivide(17, 5, out int q, out int r))
{
    Console.WriteLine($"17 ÷ 5 = {q} 余 {r}");  // 17 ÷ 5 = 3 余 2
}
else
{
    Console.WriteLine("除法错误");
}
\`\`\`

### 四、in 参数（只读引用传递）

\`\`\`csharp
// in：只读引用传递，方法内不能修改参数
// 适用于大型结构体，避免复制开销
// 调用时 in 关键字可省略（编译器自动识别）

// 大型结构体示例
struct LargeStruct
{
    public int A, B, C, D, E, F, G, H, I, J;
    public int Sum() => A + B + C + D + E + F + G + H + I + J;
}

// in 参数：只读引用，避免复制 40 字节
void PrintSum(in LargeStruct data)
{
    // data.A = 100;  // 编译错误！in 参数是只读的
    Console.WriteLine($"总和：{data.Sum()}");
}

var large = new LargeStruct { A = 1, B = 2, C = 3, D = 4, E = 5 };
PrintSum(large);         // in 可以省略
PrintSum(in large);      // 也可以显式写

// 性能对比：in 避免复制大型结构体
// 对于小型值类型（int、double 等），in 反而可能降低性能
// 因为引用传递需要解引用，开销比直接复制大
\`\`\`

### 五、params 关键字 ⭐

\`\`\`csharp
// params：允许方法接收可变数量的参数
// 参数必须是数组类型，且是方法签名中的最后一个参数
// 调用时可以不传、传一个、传多个，编译器自动打包成数组

// 计算任意数量数字的总和
int Sum(params int[] numbers)
{
    int total = 0;
    foreach (int n in numbers)
    {
        total += n;
    }
    return total;
}

// 多种调用方式
Console.WriteLine($"Sum() = {Sum()}");                  // 不传参数 → 0
Console.WriteLine($"Sum(1) = {Sum(1)}");                // 传 1 个 → 1
Console.WriteLine($"Sum(1,2,3) = {Sum(1, 2, 3)}");     // 传 3 个 → 6
Console.WriteLine($"Sum(1,2,3,4,5) = {Sum(1, 2, 3, 4, 5)}"); // 传 5 个 → 15

// 也可以直接传数组
int[] array = { 10, 20, 30 };
Console.WriteLine($"Sum(array) = {Sum(array)}");  // 60

// 实际场景：格式化输出
void PrintList(string title, params string[] items)
{
    Console.WriteLine($"\\n=== {title} ===");
    foreach (string item in items)
    {
        Console.WriteLine($"  - {item}");
    }
}
PrintList("水果", "苹果", "香蕉", "西瓜", "葡萄");
PrintList("任务", "完成作业", "买菜", "锻炼");

// 多类型参数：params 必须是最后一个
void Log(string level, params object[] messages)
{
    Console.Write($"[{level}] ");
    foreach (var msg in messages)
    {
        Console.Write($"{msg} ");
    }
    Console.WriteLine();
}
Log("INFO", "用户", "张三", "登录成功");
Log("ERROR", "数据库连接失败", 500, DateTime.Now);
\`\`\`

### 六、命名参数 ⭐

\`\`\`csharp
// 命名参数：调用时用 参数名:值 的方式传递
// 好处：可以不按顺序传参、提高可读性

void CreateUser(string name, int age, string city, bool isVIP = false)
{
    Console.WriteLine($"创建用户：{name}，{age}岁，{city}，{(isVIP ? "VIP" : "普通")}");
}

// 按位置传参（传统方式）
CreateUser("张三", 25, "北京", true);

// 命名参数：可以不按顺序，可读性更好
CreateUser(name: "李四", age: 30, city: "上海", isVIP: false);
CreateUser(city: "广州", name: "王五", age: 28, isVIP: true);  // 顺序任意

// 混合使用：位置参数在前，命名参数在后
CreateUser("赵六", 35, city: "深圳");  // 省略了 isVIP，使用默认值

// 命名参数提高可读性
CalculateDiscount(price: 100, isVIP: true, couponCode: "SAVE20");
// 比 CalculateDiscount(100, true, "SAVE20") 更清晰

double CalculateDiscount(double price, bool isVIP, string couponCode)
{
    double discount = isVIP ? 0.8 : 0.95;
    if (couponCode == "SAVE20") discount -= 0.2;
    return price * discount;
}
\`\`\`

### 七、可选参数（默认值）

\`\`\`csharp
// 可选参数：在参数列表中为参数指定默认值
// 调用时可以省略该参数，使用默认值
// 可选参数必须放在所有必选参数之后

// 带默认值的参数
void SendMessage(string message, string level = "INFO", bool showTime = true)
{
    // level 默认 "INFO"，showTime 默认 true
    string time = showTime ? $"[{DateTime.Now:HH:mm:ss}] " : "";
    Console.WriteLine($"{time}[{level}] {message}");
}

// 调用时可以省略可选参数
SendMessage("系统启动");                    // 使用全部默认值
SendMessage("文件保存成功", "SUCCESS");     // 自定义 level
SendMessage("数据库错误", "ERROR", false);  // 自定义所有参数
SendMessage("用户登录", showTime: false);   // 命名参数跳过中间的 level

// 实际场景：生成文件名
string GenerateFileName(string prefix, string extension = "txt", int counter = 1)
{
    return $"{prefix}_{counter:D4}.{extension}";  // D4：补零到 4 位
}
Console.WriteLine(GenerateFileName("report"));                // report_0001.txt
Console.WriteLine(GenerateFileName("data", "csv"));           // data_0001.csv
Console.WriteLine(GenerateFileName("log", "log", 42));        // log_0042.log
\`\`\`

### 八、参数规则总结

\`\`\`csharp
// 参数顺序规则：
// 1. 必选参数在前
// 2. 可选参数（有默认值）在后
// 3. params 参数在最后

// 合法示例
void Example(int required, string optional = "default", params int[] extra)
{
    Console.WriteLine($"必选：{required}，可选：{optional}，额外：{extra.Length} 个");
}

Example(10);                           // 只传必选
Example(10, "自定义");                  // 传必选 + 可选
Example(10, extra: 1, 2, 3);           // 命名参数 + params
Example(10, "自定义", 1, 2, 3, 4, 5);  // 全部传参

// 非法写法
// void Bad1(params int[] nums, string name);     // params 必须在最后
// void Bad2(string optional = "a", int required); // 可选参数必须在必选之后
// void Bad3(ref int a, params int[] b);           // ref + params 不能同时使用
\`\`\`

| 参数修饰符 | 作用 | 调用时要求 | 方法内要求 |
| --- | --- | --- | --- |
| 无修饰符 | 值传递 | 提供值 | 可读可写，不影响原始变量 |
| \`ref\` | 引用传递 | 变量必须初始化，加 ref | 可读可写，影响原始变量 |
| \`out\` | 输出参数 | 变量可不初始化，加 out | 必须赋值 |
| \`in\` | 只读引用 | 调用时可省略 in | 只读，不能修改 |
| \`params\` | 可变参数 | 零个或多个参数 | 当作数组使用 |

### 九、小结

| 知识点 | 关键内容 |
| --- | --- |
| 值传递 | 默认方式，不影响原始变量 |
| ref | 引用传递，双向修改 |
| out | 输出参数，返回多个值 |
| in | 只读引用，性能优化 |
| params | 可变数量参数 |
| 命名参数 | 参数名:值，提高可读性 |
| 可选参数 | 默认值，可省略 |
| 参数顺序 | 必选 → 可选 → params |

> 参数传递是方法设计的核心。下一章我们将学习方法重载与可选参数的最佳实践。`,
  },

  // ============================================================
  // 第十二章：方法重载与可选参数
  // ============================================================
  {
    id: 'csharp3-ch12',
    group: '第三部分 方法与函数',
    icon: '🔄',
    title: '第十二章 方法重载与可选参数',
    content: `## 第十二章　方法重载与可选参数

方法重载让同一个方法名可以处理不同类型或数量的参数。本章讲解重载规则、重载决策、以及何时用重载 vs 可选参数。

### 一、方法重载基础 ⭐

\`\`\`csharp
// 方法重载：同一个类中可以有多个同名方法
// 条件：参数类型、数量或顺序不同（签名不同）
// 返回值类型不能用于区分重载

// 打印不同类型的数据
void Print(int value)
{
    Console.WriteLine($"整数：{value}");
}

void Print(string value)
{
    Console.WriteLine($"字符串：{value}");
}

void Print(double value)
{
    Console.WriteLine($"浮点数：{value:F2}");
}

void Print(bool value)
{
    Console.WriteLine($"布尔值：{value}");
}

// 调用时编译器根据参数类型自动选择匹配的方法
Print(42);              // 调用 Print(int)
Print("Hello");         // 调用 Print(string)
Print(3.14159);         // 调用 Print(double)
Print(true);            // 调用 Print(bool)
\`\`\`

### 二、参数数量重载

\`\`\`csharp
// 通过不同参数数量进行重载
int Add(int a, int b)
{
    return a + b;
}

int Add(int a, int b, int c)
{
    return a + b + c;
}

int Add(int a, int b, int c, int d)
{
    return a + b + c + d;
}

Console.WriteLine($"Add(1, 2) = {Add(1, 2)}");           // 3
Console.WriteLine($"Add(1, 2, 3) = {Add(1, 2, 3)}");     // 6
Console.WriteLine($"Add(1, 2, 3, 4) = {Add(1, 2, 3, 4)}"); // 10

// 实际场景：格式化日期
string FormatDate(DateTime date) => date.ToString("yyyy-MM-dd");
string FormatDate(DateTime date, string format) => date.ToString(format);
string FormatDate(int year, int month, int day) => new DateTime(year, month, day).ToString("yyyy-MM-dd");

Console.WriteLine(FormatDate(DateTime.Now));              // 2024-01-15
Console.WriteLine(FormatDate(DateTime.Now, "yyyy年MM月dd日")); // 2024年01月15日
Console.WriteLine(FormatDate(2024, 1, 15));              // 2024-01-15
\`\`\`

### 三、重载决策（Overload Resolution）

\`\`\`csharp
// 编译器如何选择重载方法？
// 规则：选择"最匹配"的版本，原则是转换最少

void Show(int x) => Console.WriteLine($"int: {x}");
void Show(double x) => Console.WriteLine($"double: {x}");
void Show(string x) => Console.WriteLine($"string: {x}");

Show(10);           // 精确匹配 int → 调用 Show(int)
Show(3.14);         // 精确匹配 double → 调用 Show(double)
Show("hello");      // 精确匹配 string → 调用 Show(string)

// 隐式转换匹配
Show(10f);          // float 可隐式转换为 double，调用 Show(double)
Show('A');          // char 可隐式转换为 int，调用 Show(int)

// 重载决策的优先级：
// 1. 精确匹配（类型完全相同）
// 2. 隐式转换（如 float → double）
// 3. 装箱转换（值类型 → object）
// 4. params 数组

// 歧义重载（编译错误）
void Process(int a, double b) => Console.WriteLine("int, double");
void Process(double a, int b) => Console.WriteLine("double, int");

Process(1, 2.0);   // 明确：int, double
Process(1.0, 2);   // 明确：double, int
// Process(1, 2);  // 歧义！两个重载都能匹配，编译器无法选择
\`\`\`

### 四、重载 vs 可选参数

\`\`\`csharp
// 问题：何时用重载，何时用可选参数？

// 场景1：参数有合理的默认值 → 用可选参数
void LogMessage(string message, string level = "INFO", bool showTime = true)
{
    string time = showTime ? $"[{DateTime.Now:HH:mm:ss}] " : "";
    Console.WriteLine($"{time}[{level}] {message}");
}
// 调用简单
LogMessage("系统启动");
LogMessage("文件保存", "SUCCESS");
LogMessage("错误", "ERROR", false);

// 场景2：不同参数组合含义不同 → 用重载
void Search(string keyword)
{
    Console.WriteLine($"全文搜索：{keyword}");
}
void Search(string keyword, string category)
{
    Console.WriteLine($"分类搜索：{category} > {keyword}");
}
void Search(string keyword, DateTime fromDate, DateTime toDate)
{
    Console.WriteLine($"日期范围搜索：{keyword}（{fromDate:d} 到 {toDate:d}）");
}

Search("C#");
Search("C#", "编程");
Search("C#", DateTime.Now.AddDays(-7), DateTime.Now);

// 场景3：参数类型不同 → 用重载
void Display(int value) => Console.WriteLine($"数值：{value}");
void Display(string value) => Console.WriteLine($"文本：{value}");
void Display(DateTime value) => Console.WriteLine($"日期：{value:yyyy-MM-dd}");

// 场景4：需要完全不同的实现逻辑 → 用重载
void SaveToFile(string path, string content)
{
    Console.WriteLine($"保存文本到文件：{path}");
    // 文本文件写入逻辑
}
void SaveToFile(string path, byte[] data)
{
    Console.WriteLine($"保存二进制到文件：{path}（{data.Length} 字节）");
    // 二进制文件写入逻辑
}
\`\`\`

| 场景 | 推荐方式 | 原因 |
| --- | --- | --- |
| 参数有合理默认值 | 可选参数 | 简洁，减少方法数量 |
| 不同参数类型 | 重载 | 类型不同，必须重载 |
| 不同参数组合含义不同 | 重载 | 语义清晰 |
| 实现逻辑完全不同 | 重载 | 便于维护 |
| 同一逻辑的变体 | 可选参数 | 避免代码重复 |

### 五、重载最佳实践

\`\`\`csharp
// 1. 重载链：多个重载相互调用，减少重复代码
// 最完整的版本作为核心实现，其他重载调用它

// 核心方法（参数最多）
string FormatMessage(string text, string prefix, string suffix, bool uppercase)
{
    string result = $"{prefix}{text}{suffix}";
    return uppercase ? result.ToUpper() : result;
}

// 简化重载 → 调用核心方法
string FormatMessage(string text, string prefix, string suffix)
    => FormatMessage(text, prefix, suffix, false);  // 默认不大写

string FormatMessage(string text, string prefix)
    => FormatMessage(text, prefix, "", false);  // 默认无后缀

string FormatMessage(string text)
    => FormatMessage(text, "", "", false);  // 默认无前缀无后缀

// 使用
Console.WriteLine(FormatMessage("hello"));                    // hello
Console.WriteLine(FormatMessage("hello", "[", "]"));         // [hello]
Console.WriteLine(FormatMessage("hello", "[", "]", true));   // [HELLO]

// 2. 避免过多重载（3-5 个为宜）
// 3. 确保重载行为一致，不要让用户感到意外
// 4. 如果可选参数能满足需求，优先用可选参数
\`\`\`

### 六、小结

| 知识点 | 关键内容 |
| --- | --- |
| 重载定义 | 同名方法，参数类型/数量/顺序不同 |
| 重载决策 | 精确匹配 > 隐式转换 > 装箱 > params |
| 重载 vs 可选参数 | 类型不同→重载，默认值→可选参数 |
| 重载链 | 核心方法 + 简化重载，减少重复 |
| 最佳实践 | 3-5 个重载为宜，行为一致 |

> 重载和可选参数让 API 设计更灵活。下一章我们学习局部函数与表达式体。`,
  },

  // ============================================================
  // 第十三章：局部函数与表达式体
  // ============================================================
  {
    id: 'csharp3-ch13',
    group: '第三部分 方法与函数',
    icon: '📐',
    title: '第十三章 局部函数与表达式体',
    content: `## 第十三章　局部函数与表达式体

局部函数是定义在方法内部的函数，表达式体是简化语法。本章涵盖局部函数、静态局部函数、表达式体方法/属性/构造函数。

### 一、局部函数基础 ⭐

\`\`\`csharp
// 局部函数：定义在另一个方法内部的函数
// 作用域仅限于外层方法，外部无法访问
// 适合封装只在一个方法中使用的辅助逻辑

void ProcessOrder(int orderId)
{
    Console.WriteLine($"开始处理订单 {orderId}");

    // 局部函数：验证订单
    bool ValidateOrder(int id)
    {
        // 验证逻辑：订单 ID 必须大于 0
        return id > 0;
    }

    // 局部函数：计算折扣
    double CalculateDiscount(double amount, int itemCount)
    {
        // 根据金额和数量计算折扣
        if (amount > 1000) return 0.15;  // 大额订单 85 折
        if (itemCount > 10) return 0.10;  // 大量商品 9 折
        return 0;  // 无折扣
    }

    if (!ValidateOrder(orderId))
    {
        Console.WriteLine("订单验证失败");
        return;
    }

    double amount = 1500;
    int items = 15;
    double discount = CalculateDiscount(amount, items);
    double final = amount * (1 - discount);
    Console.WriteLine($"折扣：{discount:P0}，最终金额：{final:C}");
}

ProcessOrder(1001);

// 局部函数可以访问外层方法的变量和参数
void SearchInList(string keyword)
{
    List<string> data = new() { "C#编程", "Java编程", "Python编程", "C#高级" };

    // 局部函数可以访问 keyword 和 data
    bool Match(string item)
    {
        return item.Contains(keyword);  // 访问外层参数
    }

    var results = data.Where(Match);  // 使用局部函数作为过滤条件
    Console.WriteLine($"搜索 '{keyword}' 的结果：{string.Join(", ", results)}");
}
SearchInList("C#");
\`\`\`

### 二、静态局部函数（C# 8+）

\`\`\`csharp
// 静态局部函数：加 static 关键字
// 不能访问外层方法的变量，只能访问自己的参数和静态成员
// 好处：更安全（不会意外修改外层变量）、性能更好（无闭包开销）

void ProcessData(int[] numbers)
{
    int threshold = 50;  // 外层变量

    // 非静态局部函数：可以访问 threshold
    bool IsAboveThreshold(int n)
    {
        return n > threshold;  // 访问外层变量
    }

    // 静态局部函数：不能访问 threshold
    // 必须通过参数传递需要的数据
    static bool IsEven(int n)
    {
        return n % 2 == 0;  // 只能访问自己的参数
    }

    static bool IsInRange(int n, int min, int max)
    {
        return n >= min && n <= max;  // 所有数据通过参数传入
    }

    // 使用
    var aboveThreshold = numbers.Where(IsAboveThreshold);
    var evenNumbers = numbers.Where(IsEven);
    var inRange = numbers.Where(n => IsInRange(n, 30, 70));

    Console.WriteLine($"大于 {threshold}：{string.Join(", ", aboveThreshold)}");
    Console.WriteLine($"偶数：{string.Join(", ", evenNumbers)}");
    Console.WriteLine($"30-70 之间：{string.Join(", ", inRange)}");
}

ProcessData(new[] { 10, 25, 42, 55, 68, 73, 90 });

// ⚠️ 非静态局部函数会捕获外层变量（闭包），有额外内存开销
// 如果不需要访问外层变量，始终加 static
\`\`\`

### 三、表达式体方法（回顾与进阶）

\`\`\`csharp
// 表达式体方法：用 => 简化单行方法
// 适用于 getter、简单计算、转换、验证等

// 传统写法 vs 表达式体
int Add_Traditional(int a, int b) { return a + b; }
int Add_Expression(int a, int b) => a + b;

// 各种表达式体方法
double CircleArea(double r) => Math.PI * r * r;           // 计算
bool IsValid(string s) => !string.IsNullOrEmpty(s);       // 验证
string ToUpperFirst(string s) => char.ToUpper(s[0]) + s[1..]; // 转换
DateTime Tomorrow() => DateTime.Now.AddDays(1);           // 无参方法

// 表达式体方法可以调用其他方法
double CylinderVolume(double r, double h) => CircleArea(r) * h;

// 多行逻辑不适合表达式体，用传统写法
string GetGrade(int score)
{
    // 多分支逻辑，传统写法更清晰
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
}
\`\`\`

### 四、表达式体属性

\`\`\`csharp
// 在类和记录中，属性可以用表达式体
// 但本章聚焦于方法，这里简要展示

// 示例：Person 类
class Person
{
    public string FirstName { get; set; }
    public string LastName { get; set; }

    // 表达式体属性：只读计算属性
    public string FullName => $"{FirstName} {LastName}";

    // 表达式体属性：带逻辑
    public string DisplayName => string.IsNullOrEmpty(FullName) ? "匿名" : FullName;

    // 表达式体方法
    public bool HasName() => !string.IsNullOrEmpty(FirstName);
}

var person = new Person { FirstName = "张", LastName = "三" };
Console.WriteLine(person.FullName);    // 张 三
Console.WriteLine(person.DisplayName); // 张 三
\`\`\`

### 五、局部函数 vs 私有方法 vs Lambda

\`\`\`csharp
// 何时用局部函数、何时用私有方法、何时用 Lambda？

// 1. 局部函数：只在当前方法中使用，需要访问外层变量
void ProcessWithLocalFunction(int[] data)
{
    int multiplier = 2;

    // 局部函数：逻辑只在这里用，且需要访问 multiplier
    int Transform(int x) => x * multiplier;

    var results = data.Select(Transform);
    Console.WriteLine($"变换结果：{string.Join(", ", results)}");
}
ProcessWithLocalFunction(new[] { 1, 2, 3, 4, 5 });

// 2. 私有方法：被多个方法共用，逻辑通用
// （在类中定义）
// private bool IsValid(string s) => !string.IsNullOrEmpty(s);

// 3. Lambda：简单的单次使用逻辑
int[] numbers = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
var even = numbers.Where(n => n % 2 == 0);  // Lambda 简单明了
Console.WriteLine($"偶数：{string.Join(", ", even)}");

// 对比表
// | 特性 | 局部函数 | 私有方法 | Lambda |
// | 作用域 | 当前方法 | 整个类 | 当前表达式 |
// | 访问外层变量 | 可以 | 不可以 | 可以 |
// | 递归 | 支持 | 支持 | 不支持 |
// | 泛型 | 支持 | 支持 | 不支持 |
// | 迭代器 | 支持 | 支持 | 不支持 |
// | 命名 | 有名字 | 有名字 | 匿名 |
\`\`\`

### 六、实战 demo：迭代器局部函数

\`\`\`csharp
// 局部函数的一个强大用法：封装迭代器逻辑
// yield return 不能在 Lambda 中使用，但可以在局部函数中使用

// 斐波那契数列生成器
IEnumerable<int> Fibonacci(int count)
{
    // 局部函数封装迭代逻辑
    return Generate();

    IEnumerable<int> Generate()
    {
        int a = 0, b = 1;
        for (int i = 0; i < count; i++)
        {
            yield return a;  // 局部函数支持 yield return
            int temp = a;
            a = b;
            b = temp + b;
        }
    }
}

Console.WriteLine("斐波那契数列前 10 项：");
foreach (int n in Fibonacci(10))
{
    Console.Write($"{n} ");  // 0 1 1 2 3 5 8 13 21 34
}
Console.WriteLine();

// 带验证的序列生成
IEnumerable<int> EvenNumbers(int max)
{
    if (max < 0)
        throw new ArgumentException("max 不能为负数");  // 参数验证立即执行

    return Generate();  // 延迟执行

    static IEnumerable<int> Generate()
    {
        for (int i = 0; i <= max; i += 2)
        {
            yield return i;
        }
    }
}

Console.WriteLine("偶数序列：");
foreach (int n in EvenNumbers(20))
{
    Console.Write($"{n} ");  // 0 2 4 6 8 10 12 14 16 18 20
}
\`\`\`

### 七、小结

| 知识点 | 关键内容 |
| --- | --- |
| 局部函数 | 方法内定义，只在该方法中使用 |
| 静态局部函数 | 加 static，不捕获外层变量 |
| 表达式体方法 | => 简化单行方法 |
| 表达式体属性 | => 计算属性 |
| 局部函数 vs Lambda | 局部函数支持递归/泛型/yield |
| 迭代器局部函数 | yield return 只能在局部函数中使用 |

> 局部函数让代码组织更灵活。下一章我们学习递归与算法初探。`,
  },

  // ============================================================
  // 第十四章：递归与算法初探
  // ============================================================
  {
    id: 'csharp3-ch14',
    group: '第三部分 方法与函数',
    icon: '🌀',
    title: '第十四章 递归与算法初探',
    content: `## 第十四章　递归与算法初探

递归是函数调用自身的编程技巧，能优雅地解决许多问题。本章讲解递归原理、经典算法、递归与迭代的对比，以及注意事项。

### 一、递归基础 ⭐

\`\`\`csharp
// 递归：方法直接或间接调用自身
// 两个必要条件：
// 1. 基准条件（Base Case）：终止递归的条件
// 2. 递归条件（Recursive Case）：将问题分解为更小的子问题

// 最简单的递归：倒计时
void Countdown(int n)
{
    if (n <= 0)                     // 基准条件：递归终止
    {
        Console.WriteLine("发射！");
        return;
    }
    Console.WriteLine(n);           // 打印当前数字
    Countdown(n - 1);               // 递归条件：用更小的 n 调用自身
}
Countdown(5);
// 输出：5 4 3 2 1 发射！

// 递归调用栈示意（Countdown(3)）：
// Countdown(3) → Console.WriteLine(3) → Countdown(2)
// Countdown(2) → Console.WriteLine(2) → Countdown(1)
// Countdown(1) → Console.WriteLine(1) → Countdown(0)
// Countdown(0) → 基准条件，返回
// 返回 Countdown(1) → 返回 Countdown(2) → 返回 Countdown(3) → 结束
\`\`\`

### 二、经典递归：阶乘

\`\`\`csharp
// 阶乘：n! = n × (n-1) × (n-2) × ... × 1
// 数学定义：0! = 1, n! = n × (n-1)!

// 递归实现
long Factorial(int n)
{
    if (n < 0)
        throw new ArgumentException("阶乘只定义非负整数");

    if (n == 0) return 1;          // 基准条件：0! = 1
    return n * Factorial(n - 1);   // 递归条件：n! = n × (n-1)!
}

// 测试
for (int i = 0; i <= 10; i++)
{
    Console.WriteLine($"{i}! = {Factorial(i)}");
}

// 递归过程（Factorial(4)）：
// Factorial(4) = 4 × Factorial(3)
//              = 4 × 3 × Factorial(2)
//              = 4 × 3 × 2 × Factorial(1)
//              = 4 × 3 × 2 × 1 × Factorial(0)
//              = 4 × 3 × 2 × 1 × 1
//              = 24

// 迭代实现对比
long FactorialIterative(int n)
{
    if (n < 0)
        throw new ArgumentException("阶乘只定义非负整数");

    long result = 1;
    for (int i = 2; i <= n; i++)
    {
        result *= i;
    }
    return result;
}
\`\`\`

### 三、经典递归：斐波那契数列

\`\`\`csharp
// 斐波那契数列：F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)
// 数列：0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...

// 递归实现（直观但效率低）
long Fibonacci(int n)
{
    if (n < 0)
        throw new ArgumentException("n 必须非负");

    if (n == 0) return 0;          // 基准条件 1
    if (n == 1) return 1;          // 基准条件 2
    return Fibonacci(n - 1) + Fibonacci(n - 2);  // 递归条件
}

// 测试
Console.WriteLine("斐波那契数列（递归）：");
for (int i = 0; i <= 15; i++)
{
    Console.Write($"{Fibonacci(i)} ");
}
Console.WriteLine();

// ⚠️ 递归斐波那契的效率问题：
// Fibonacci(5) 会重复计算 Fibonacci(3) 两次
// Fibonacci(40) 可能需要几秒才能完成
// 时间复杂度：O(2^n)，非常低效

// 优化：带缓存的递归（记忆化）
long FibonacciMemoized(int n, Dictionary<int, long>? memo = null)
{
    memo ??= new Dictionary<int, long>();  // 初始化缓存

    if (memo.ContainsKey(n))              // 如果已经计算过
        return memo[n];                    // 直接返回缓存结果

    if (n == 0) return 0;
    if (n == 1) return 1;

    long result = FibonacciMemoized(n - 1, memo) + FibonacciMemoized(n - 2, memo);
    memo[n] = result;                     // 存入缓存
    return result;
}

Console.WriteLine($"Fibonacci(40) with memo = {FibonacciMemoized(40)}");  // 瞬间完成
\`\`\`

### 四、经典递归：二分查找 ⭐

\`\`\`csharp
// 二分查找：在有序数组中查找目标值
// 每次将搜索范围缩小一半，时间复杂度 O(log n)

int BinarySearch(int[] sortedArray, int target, int left, int right)
{
    if (left > right)                    // 基准条件：搜索范围为空
        return -1;                       // 未找到

    int mid = left + (right - left) / 2; // 计算中间位置（避免溢出）

    if (sortedArray[mid] == target)      // 基准条件：找到目标
        return mid;

    if (sortedArray[mid] > target)       // 目标在左半部分
        return BinarySearch(sortedArray, target, left, mid - 1);  // 递归左半部分

    return BinarySearch(sortedArray, target, mid + 1, right);     // 递归右半部分
}

// 测试
int[] sortedData = { 1, 3, 5, 7, 9, 11, 13, 15, 17, 19 };
int target = 13;
int index = BinarySearch(sortedData, target, 0, sortedData.Length - 1);
Console.WriteLine($"在有序数组中查找 {target}：索引 = {index}，值 = {sortedData[index]}");

// 查找过程（查找 13）：
// 范围 [0, 9]，mid = 4，arr[4] = 9 < 13 → 搜索右半部分 [5, 9]
// 范围 [5, 9]，mid = 7，arr[7] = 15 > 13 → 搜索左半部分 [5, 6]
// 范围 [5, 6]，mid = 5，arr[5] = 11 < 13 → 搜索右半部分 [6, 6]
// 范围 [6, 6]，mid = 6，arr[6] = 13 == 13 → 找到！返回 6

// 迭代实现对比
int BinarySearchIterative(int[] arr, int target)
{
    int left = 0, right = arr.Length - 1;
    while (left <= right)
    {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] > target)
            right = mid - 1;
        else
            left = mid + 1;
    }
    return -1;
}
\`\`\`

### 五、经典递归：树遍历

\`\`\`csharp
// 树节点定义
class TreeNode
{
    public int Value { get; set; }
    public TreeNode? Left { get; set; }
    public TreeNode? Right { get; set; }

    public TreeNode(int value) => Value = value;
}

// 构建示例树
//        5
//       / \
//      3   8
//     / \   \
//    1   4   10
TreeNode root = new(5)
{
    Left = new(3) { Left = new(1), Right = new(4) },
    Right = new(8) { Right = new(10) }
};

// 前序遍历：根 → 左 → 右
void PreOrder(TreeNode? node)
{
    if (node == null) return;           // 基准条件：空节点
    Console.Write($"{node.Value} ");    // 访问根节点
    PreOrder(node.Left);                // 递归遍历左子树
    PreOrder(node.Right);               // 递归遍历右子树
}
Console.Write("前序遍历：");
PreOrder(root);
Console.WriteLine("  （5 3 1 4 8 10）");

// 中序遍历：左 → 根 → 右
void InOrder(TreeNode? node)
{
    if (node == null) return;
    InOrder(node.Left);
    Console.Write($"{node.Value} ");
    InOrder(node.Right);
}
Console.Write("中序遍历：");
InOrder(root);
Console.WriteLine("  （1 3 4 5 8 10）");

// 后序遍历：左 → 右 → 根
void PostOrder(TreeNode? node)
{
    if (node == null) return;
    PostOrder(node.Left);
    PostOrder(node.Right);
    Console.Write($"{node.Value} ");
}
Console.Write("后序遍历：");
PostOrder(root);
Console.WriteLine("  （1 4 3 10 8 5）");

// 计算树的高度
int TreeHeight(TreeNode? node)
{
    if (node == null) return 0;         // 空树高度为 0
    int leftHeight = TreeHeight(node.Left);
    int rightHeight = TreeHeight(node.Right);
    return 1 + Math.Max(leftHeight, rightHeight);
}
Console.WriteLine($"树的高度：{TreeHeight(root)}");  // 3
\`\`\`

### 六、递归 vs 迭代

\`\`\`csharp
// 阶乘：递归 vs 迭代
long FactorialRecursive(int n)
    => n <= 1 ? 1 : n * FactorialRecursive(n - 1);

long FactorialIterative(int n)
{
    long result = 1;
    for (int i = 2; i <= n; i++)
        result *= i;
    return result;
}

// 斐波那契：递归 vs 迭代
long FibRecursive(int n)  // 低效 O(2^n)
    => n <= 1 ? n : FibRecursive(n - 1) + FibRecursive(n - 2);

long FibIterative(int n)  // 高效 O(n)
{
    if (n <= 1) return n;
    long a = 0, b = 1;
    for (int i = 2; i <= n; i++)
    {
        long temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}
\`\`\`

| 对比维度 | 递归 | 迭代 |
| --- | --- | --- |
| 代码简洁性 | 更简洁，接近数学定义 | 有时更啰嗦 |
| 可读性 | 树/图等递归结构更直观 | 线性问题更直观 |
| 性能 | 函数调用开销大 | 通常更快 |
| 内存 | 调用栈可能溢出 | 通常内存更少 |
| 调试 | 调用栈深，调试困难 | 调试相对简单 |

### 七、栈溢出与尾递归

\`\`\`csharp
// 递归的风险：每次递归调用都会在调用栈上增加一帧
// 递归过深会导致 StackOverflowException

// 计算递归深度限制
void TestRecursionDepth(int depth)
{
    try
    {
        TestRecursionDepth(depth + 1);
    }
    catch (StackOverflowException)
    {
        Console.WriteLine($"递归深度约 {depth} 时栈溢出");
        // 注意：StackOverflowException 通常无法被捕获（.NET Core 3+）
        // 这里只是示意
    }
}

// 尾递归：递归调用是方法的最后一个操作
// 理论上可以被编译器优化为迭代，但 C# 编译器目前不保证尾递归优化

// 普通递归（不是尾递归）
long Factorial(int n)
    => n <= 1 ? 1 : n * Factorial(n - 1);  // 乘法在递归调用之后

// 尾递归形式（参数累积结果）
long FactorialTail(int n, long accumulator = 1)
    => n <= 1 ? accumulator : FactorialTail(n - 1, n * accumulator);

// 虽然 C# 不保证尾递归优化，但尾递归代码更清晰
// 对于深度递归，建议改用迭代实现

// 避免栈溢出的方法：
// 1. 改用迭代实现
// 2. 使用尾递归 + 手动优化
// 3. 使用显式栈（Stack<T>）模拟递归
\`\`\`

### 八、实战 demo：汉诺塔

\`\`\`csharp
// 汉诺塔问题：经典递归问题
// 将 n 个盘子从 A 柱移到 C 柱，每次只能移动一个，大盘不能放小盘上

void Hanoi(int n, char from, char to, char aux)
{
    if (n == 1)  // 基准条件：只有一个盘子
    {
        Console.WriteLine($"移动盘子 1 从 {from} 到 {to}");
        return;
    }

    // 步骤 1：将 n-1 个盘子从 from 移到 aux（借助 to）
    Hanoi(n - 1, from, aux, to);

    // 步骤 2：将最大的盘子从 from 移到 to
    Console.WriteLine($"移动盘子 {n} 从 {from} 到 {to}");

    // 步骤 3：将 n-1 个盘子从 aux 移到 to（借助 from）
    Hanoi(n - 1, aux, to, from);
}

Console.WriteLine("汉诺塔 3 层解法：");
Hanoi(3, 'A', 'C', 'B');
// 输出：
// 移动盘子 1 从 A 到 C
// 移动盘子 2 从 A 到 B
// 移动盘子 1 从 C 到 B
// 移动盘子 3 从 A 到 C
// 移动盘子 1 从 B 到 A
// 移动盘子 2 从 B 到 C
// 移动盘子 1 从 A 到 C

// 汉诺塔的时间复杂度：O(2^n)
// 移动 n 个盘子需要 2^n - 1 步
int steps = (int)Math.Pow(2, 3) - 1;
Console.WriteLine($"3 层汉诺塔需要 {steps} 步");
\`\`\`

### 九、小结

| 知识点 | 关键内容 |
| --- | --- |
| 递归原理 | 基准条件 + 递归条件 |
| 阶乘 | n! = n × (n-1)!，基准 0! = 1 |
| 斐波那契 | F(n) = F(n-1) + F(n-2)，注意性能 |
| 二分查找 | 每次减半，O(log n) |
| 树遍历 | 前序/中序/后序遍历 |
| 递归 vs 迭代 | 递归简洁，迭代高效 |
| 栈溢出 | 递归过深导致，注意深度控制 |
| 尾递归 | 累积参数，C# 不保证优化 |

> 递归是一种强大的思维方式。下一章我们将进入第四部分——数组与集合，学习多维数组和高级集合操作。`,
  },
];

export { chapters };