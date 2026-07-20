// =============================================================
// C# 从入门到精通大全（终极版）—— 第10批章节
// 第十部分 委托、事件与 Lambda（共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   csharp3-ch50 : 第五十章 委托基础
//   csharp3-ch51 : 第五十一章 Action、Func 与 Predicate
//   csharp3-ch52 : 第五十二章 Lambda 表达式
//   csharp3-ch53 : 第五十三章 事件
//   csharp3-ch54 : 第五十四章 闭包与变量捕获
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第四十九章：委托基础
  // ============================================================
  {
    id: 'csharp3-ch50',
    group: '第十部分 委托、事件与 Lambda',
    icon: '🎯',
    title: '第五十章 委托基础',
    content: `## 第五十章　委托基础

委托（Delegate）是 C# 中类型安全的方法引用——你可以把它理解为一个变量，这个变量存储的是"方法的地址"。委托是事件和 Lambda 的基础。

### 一、委托定义与实例化

委托用 \`delegate\` 关键字定义，声明了方法的签名（返回类型和参数）：

\`\`\`csharp
// 定义委托类型：声明方法签名
// 返回类型 + 委托名 + 参数列表
delegate int MathOperation(int a, int b);  // 接受两个 int，返回 int

// 定义符合委托签名的方法
int Add(int a, int b)
{
    return a + b;  // 加法
}

int Subtract(int a, int b)
{
    return a - b;  // 减法
}

int Multiply(int a, int b)
{
    return a * b;  // 乘法
}

// 实例化委托：将方法赋值给委托变量
MathOperation op = Add;  // 委托变量指向 Add 方法
// 等价于：MathOperation op = new MathOperation(Add);

// 调用委托：像调用方法一样
int result = op(10, 5);  // 实际调用的是 Add(10, 5)
Console.WriteLine($"Add(10, 5) = {result}");  // 15

// 委托变量可以重新指向另一个方法
op = Subtract;
Console.WriteLine($"Subtract(10, 5) = {op(10, 5)}");  // 5

op = Multiply;
Console.WriteLine($"Multiply(10, 5) = {op(10, 5)}");  // 50
\`\`\`

### 二、多播委托（Multicast Delegate）

委托可以绑定多个方法，调用时依次执行：

\`\`\`csharp
// 定义无参数无返回值的委托
delegate void LogDelegate(string message);

void LogToConsole(string message)
{
    Console.WriteLine($"[控制台] {message}");
}

void LogToFile(string message)
{
    Console.WriteLine($"[文件] {message}");  // 模拟文件日志
}

void LogToDatabase(string message)
{
    Console.WriteLine($"[数据库] {message}");  // 模拟数据库日志
}

// 多播委托：用 + 或 += 组合多个方法
LogDelegate logger = LogToConsole;  // 第一个方法
logger += LogToFile;                // 添加第二个方法
logger += LogToDatabase;            // 添加第三个方法

// 调用一次委托，所有方法依次执行
Console.WriteLine("=== 多播委托调用 ===");
logger("系统启动通知");

// 用 - 或 -= 移除方法
logger -= LogToFile;
Console.WriteLine("\\n=== 移除文件日志后 ===");
logger("用户登录通知");

// 获取调用列表
Delegate[] delegates = logger.GetInvocationList();
Console.WriteLine($"\\n委托链中有 {delegates.Length} 个方法");
\`\`\`

### 三、委托作为方法参数

委托作为参数是实现回调模式的核心方式：

\`\`\`csharp
// 委托作为参数：实现策略模式和回调
delegate bool FilterDelegate(int number);

// 过滤方法：接受委托参数决定过滤逻辑
List<int> FilterNumbers(List<int> numbers, FilterDelegate filter)
{
    List<int> result = new List<int>();
    foreach (int n in numbers)
    {
        if (filter(n))  // 调用委托判断是否保留
            result.Add(n);
    }
    return result;
}

// 定义不同的过滤策略
bool IsEven(int n) => n % 2 == 0;      // 偶数
bool IsOdd(int n) => n % 2 != 0;       // 奇数
bool IsGreaterThan5(int n) => n > 5;   // 大于5

var numbers = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

// 传入不同的过滤策略
var evens = FilterNumbers(numbers, IsEven);
Console.WriteLine($"偶数：{string.Join(", ", evens)}");

var odds = FilterNumbers(numbers, IsOdd);
Console.WriteLine($"奇数：{string.Join(", ", odds)}");

var large = FilterNumbers(numbers, IsGreaterThan5);
Console.WriteLine($"大于5：{string.Join(", ", large)}");

// 实际应用：自定义排序
delegate int CompareDelegate<T>(T a, T b);

void Sort<T>(List<T> items, CompareDelegate<T> compare)
{
    // 简单冒泡排序
    for (int i = 0; i < items.Count - 1; i++)
    {
        for (int j = 0; j < items.Count - 1 - i; j++)
        {
            if (compare(items[j], items[j + 1]) > 0)
            {
                (items[j], items[j + 1]) = (items[j + 1], items[j]);  // 交换
            }
        }
    }
}
\`\`\`

### 四、匿名方法

匿名方法允许你内联定义委托，无需单独声明方法：

\`\`\`csharp
// 匿名方法：用 delegate 关键字直接定义方法体
// 语法：delegate(参数) { 方法体 }

// 传统方式：需要先定义方法，再赋值
delegate int Operation(int a, int b);

// 匿名方法方式：无需单独定义方法
Operation op = delegate(int a, int b)
{
    return a * a + b * b;  // 计算平方和
};

Console.WriteLine($"匿名方法：{op(3, 4)}");  // 25

// 匿名方法捕获外部变量
int factor = 10;
Operation multiplyWithFactor = delegate(int a, int b)
{
    return (a + b) * factor;  // 使用外部变量 factor
};

Console.WriteLine($"带捕获：{multiplyWithFactor(3, 4)}");  // 70

factor = 5;  // 修改捕获的变量
Console.WriteLine($"修改后：{multiplyWithFactor(3, 4)}");  // 35（使用最新值）

// 使用匿名方法过滤
List<int> Filter(List<int> items, Predicate<int> predicate)
{
    return items.Where(i => predicate(i)).ToList();
}

var numbers = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
var result = Filter(numbers, delegate(int n) { return n > 5 && n % 2 == 0; });
Console.WriteLine($"大于5的偶数：{string.Join(", ", result)}");  // 6, 8, 10
\`\`\`

### 五、委托调用列表

\`\`\`csharp
// 委托调用列表：查看委托链中所有方法
delegate void NotifyDelegate(string message);

void Notify1(string msg) => Console.WriteLine($"通知1：{msg}");
void Notify2(string msg) => Console.WriteLine($"通知2：{msg}");
void Notify3(string msg) => Console.WriteLine($"通知3：{msg}");

NotifyDelegate notify = Notify1;
notify += Notify2;
notify += Notify3;

// 获取调用列表
Delegate[] list = notify.GetInvocationList();
Console.WriteLine($"委托链中有 {list.Length} 个方法：");
foreach (Delegate d in list)
{
    Console.WriteLine($"  方法：{d.Method.Name}");
}

// 逐个调用委托链中的方法
Console.WriteLine("\\n逐个调用：");
foreach (NotifyDelegate d in list)
{
    d("逐个调用测试");  // 每个方法独立调用
}
\`\`\`

### 六、小结

- ⭐ 委托是类型安全的方法引用，用 \`delegate\` 关键字定义。
- ⭐ 多播委托用 \`+=\` 组合多个方法，调用时依次执行。
- ⭐ 委托作为参数是回调模式和策略模式的基础。
- ⭐ 匿名方法用 \`delegate(参数) { }\` 内联定义，无需单独声明方法。
- ⭐ \`GetInvocationList()\` 获取委托链中的所有方法。`,
  },

  // ============================================================
  // 第五十章：Action、Func 与 Predicate
  // ============================================================
  {
    id: 'csharp3-ch51',
    group: '第十部分 委托、事件与 Lambda',
    icon: '⚡',
    title: '第五十一章 Action、Func 与 Predicate',
    content: `## 第五十一章　Action、Func 与 Predicate

.NET 提供了三个内置泛型委托类型，覆盖了日常开发 99% 的委托场景。你几乎不需要自定义委托——用 \`Action\`、\`Func\` 或 \`Predicate\` 就够了。

### 一、Action：无返回值的委托

\`Action\` 代表无返回值的方法，支持 0 到 16 个参数：

\`\`\`csharp
// Action：无参数，无返回值
Action sayHello = () => Console.WriteLine("Hello, World!");
sayHello();

// Action<T>：1 个参数，无返回值
Action<string> print = message => Console.WriteLine($"输出：{message}");
print("这是一条消息");

// Action<T1, T2>：2 个参数，无返回值
Action<string, int> repeat = (text, count) =>
{
    for (int i = 0; i < count; i++)
        Console.WriteLine($"{i + 1}. {text}");
};
repeat("C# Action", 3);

// Action<T1, T2, T3>：3 个参数
Action<string, int, bool> displayInfo = (name, age, isActive) =>
{
    Console.WriteLine($"姓名：{name}");
    Console.WriteLine($"年龄：{age}");
    Console.WriteLine($"活跃：{isActive}");
};
displayInfo("张三", 28, true);

// 实际应用：日志记录器
Action<string, string> logger = (level, message) =>
{
    Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] [{level}] {message}");
};

logger("INFO", "系统启动成功");
logger("ERROR", "数据库连接失败");
logger("WARN", "内存使用率超过 80%");
\`\`\`

### 二、Func：有返回值的委托

\`Func\` 代表有返回值的方法，最后一个类型参数是返回类型，最多 16 个参数：

\`\`\`csharp
// Func<TResult>：无参数，返回 TResult
Func<int> getRandomNumber = () => new Random().Next(1, 100);
Console.WriteLine($"随机数：{getRandomNumber()}");

// Func<T, TResult>：1 个参数，返回 TResult
Func<int, int> square = x => x * x;
Console.WriteLine($"5 的平方：{square(5)}");  // 25

// Func<T1, T2, TResult>：2 个参数，返回 TResult
Func<int, int, int> add = (a, b) => a + b;
Console.WriteLine($"10 + 20 = {add(10, 20)}");

Func<int, int, bool> isGreater = (a, b) => a > b;
Console.WriteLine($"10 > 5：{isGreater(10, 5)}");  // True

// Func<T1, T2, T3, TResult>：3 个参数
Func<double, double, double, double> average = (a, b, c) => (a + b + c) / 3;
Console.WriteLine($"平均值：{average(85, 92, 78):F2}");  // 85.00

// 实际应用：数学计算器
Dictionary<string, Func<int, int, int>> calculator = new()
{
    ["+"] = (a, b) => a + b,
    ["-"] = (a, b) => a - b,
    ["*"] = (a, b) => a * b,
    ["/"] = (a, b) => b != 0 ? a / b : throw new DivideByZeroException()
};

Console.WriteLine($"10 + 5 = {calculator["+"](10, 5)}");
Console.WriteLine($"10 * 5 = {calculator["*"](10, 5)}");
\`\`\`

### 三、Predicate：返回 bool 的委托

\`Predicate<T>\` 等价于 \`Func<T, bool>\`，专门用于判断条件：

\`\`\`csharp
// Predicate<T>：接受 T，返回 bool
// 等价于 Func<T, bool>，但语义更清晰

Predicate<int> isEven = n => n % 2 == 0;
Predicate<int> isPositive = n => n > 0;
Predicate<int> isPrime = n =>
{
    if (n < 2) return false;
    for (int i = 2; i <= Math.Sqrt(n); i++)
        if (n % i == 0) return false;
    return true;
};

Console.WriteLine($"10 是偶数：{isEven(10)}");      // True
Console.WriteLine($"-5 是正数：{isPositive(-5)}");   // False
Console.WriteLine($"17 是质数：{isPrime(17)}");      // True

// Predicate 与 List<T> 方法配合
List<int> numbers = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

// FindAll 接受 Predicate<T>
List<int> evens = numbers.FindAll(isEven);
Console.WriteLine($"偶数：{string.Join(", ", evens)}");

// Exists 接受 Predicate<T>
bool hasLarge = numbers.Exists(n => n > 8);
Console.WriteLine($"存在大于8的数：{hasLarge}");

// TrueForAll 接受 Predicate<T>
bool allPositive = numbers.TrueForAll(n => n > 0);
Console.WriteLine($"全部为正数：{allPositive}");

// 组合 Predicate
Predicate<int> isEvenAndPositive = n => isEven(n) && isPositive(n);
Console.WriteLine($"6 是偶正数：{isEvenAndPositive(6)}");  // True
\`\`\`

### 四、委托组合（+/- 运算符）

\`\`\`csharp
// 委托组合：用 + 和 - 运算符组合/分解委托
Action<string> log1 = msg => Console.WriteLine($"[控制台] {msg}");
Action<string> log2 = msg => Console.WriteLine($"[文件] {msg}");
Action<string> log3 = msg => Console.WriteLine($"[数据库] {msg}");

// 组合委托
Action<string> combined = log1 + log2;
combined += log3;  // 等价于 combined = combined + log3

Console.WriteLine("组合委托调用：");
combined("系统消息");

// 移除委托
combined -= log2;
Console.WriteLine("\\n移除文件日志后：");
combined("系统消息");

// 检查委托链
Delegate[] invocationList = combined.GetInvocationList();
Console.WriteLine($"\\n委托链中有 {invocationList.Length} 个方法");

// Func 也可以组合（但只有最后一个返回值有效）
Func<int, int> f1 = x => x + 1;
Func<int, int> f2 = x => x * 2;
Func<int, int> f3 = x => x * x;

Func<int, int> pipeline = f1 + f2 + f3;
// 组合调用时，所有方法都执行，但只返回最后一个的结果
int result = pipeline(5);
Console.WriteLine($"\\nFunc 组合结果：{result}");  // 25（f3 的结果）
// 注意：f1(5)=6, f2(5)=10, f3(5)=25，返回 25
\`\`\`

### 五、内置委托速查

| 委托 | 签名 | 用途 |
| --- | --- | --- |
| \`Action\` | \`void()\` | 无参无返回值 |
| \`Action<T>\` | \`void(T)\` | 1 参数无返回值 |
| \`Action<T1,T2>\` | \`void(T1,T2)\` | 2 参数无返回值 |
| \`Func<TResult>\` | \`TResult()\` | 无参有返回值 |
| \`Func<T,TResult>\` | \`TResult(T)\` | 1 参数有返回值 |
| \`Func<T1,T2,TResult>\` | \`TResult(T1,T2)\` | 2 参数有返回值 |
| \`Predicate<T>\` | \`bool(T)\` | 条件判断 |
| \`Comparison<T>\` | \`int(T,T)\` | 比较两个值 |
| \`EventHandler<T>\` | \`void(object,T)\` | 事件处理 |

### 六、小结

- ⭐ \`Action\` 代表无返回值的方法，支持 0-16 个参数。
- ⭐ \`Func\` 代表有返回值的方法，最后一个类型参数是返回类型。
- ⭐ \`Predicate<T>\` 等价于 \`Func<T, bool>\`，用于条件判断。
- ⭐ 用 \`+=\` 和 \`-=\` 组合和分解委托。
- ⭐ 内置委托覆盖了 99% 的场景，无需自定义委托类型。`,
  },

  // ============================================================
  // 第五十一章：Lambda 表达式
  // ============================================================
  {
    id: 'csharp3-ch52',
    group: '第十部分 委托、事件与 Lambda',
    icon: 'λ',
    title: '第五十二章 Lambda 表达式',
    content: `## 第五十二章　Lambda 表达式

Lambda 表达式是 C# 中最常用的特性之一——它让你用极简的语法创建匿名方法。Lambda 是 LINQ 的基石，也是函数式编程风格在 C# 中的核心体现。

### 一、Lambda 语法基础

Lambda 表达式用 \`=>\` 运算符（读作"goes to"）分隔参数和方法体：

\`\`\`csharp
// Lambda 语法：(参数) => 表达式或语句块

// 表达式 Lambda：单行，返回表达式结果
Func<int, int> square = x => x * x;  // 参数 x，返回 x * x
Console.WriteLine($"5 的平方：{square(5)}");  // 25

// 语句 Lambda：多行代码块
Func<int, int, int> max = (a, b) =>
{
    // 方法体中可以有多条语句
    Console.WriteLine($"比较 {a} 和 {b}");
    return a > b ? a : b;  // 返回较大值
};
Console.WriteLine($"较大值：{max(10, 20)}");

// 无参数 Lambda：用空括号
Action greet = () => Console.WriteLine("你好，世界！");
greet();

// 单个参数可省略括号
Action<string> print = message => Console.WriteLine(message);
print("单参数 Lambda");

// 多个参数必须用括号
Func<int, int, int> add = (x, y) => x + y;
Console.WriteLine($"10 + 20 = {add(10, 20)}");

// 指定参数类型（通常不需要，编译器推断）
Func<int, int, int> explicitAdd = (int x, int y) => x + y;
\`\`\`

### 二、表达式 Lambda vs 语句 Lambda

\`\`\`csharp
// 表达式 Lambda：简洁，适合单行逻辑
Func<int, bool> isEven = n => n % 2 == 0;
Func<string, int> length = s => s.Length;
Func<double, double, double> hypotenuse = (a, b) => Math.Sqrt(a * a + b * b);

Console.WriteLine($"10 是偶数：{isEven(10)}");
Console.WriteLine($"\"Hello\" 长度：{length("Hello")}");
Console.WriteLine($"斜边长度：{hypotenuse(3, 4):F2}");  // 5.00

// 语句 Lambda：适合多行逻辑，需要 return
Func<int[], (int, int)> findMinMax = numbers =>
{
    if (numbers.Length == 0)
        throw new ArgumentException("数组不能为空");

    int min = numbers[0];
    int max = numbers[0];

    foreach (int n in numbers)
    {
        if (n < min) min = n;
        if (n > max) max = n;
    }

    return (min, max);  // 返回元组
};

int[] data = { 3, 7, 1, 9, 4, 6, 8, 2, 5 };
var (min, max) = findMinMax(data);
Console.WriteLine($"最小值：{min}，最大值：{max}");
\`\`\`

### 三、Lambda 与集合操作

\`\`\`csharp
// Lambda 在 LINQ 和集合操作中无处不在
List<int> numbers = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

// Where：过滤
var evens = numbers.Where(n => n % 2 == 0);
Console.WriteLine($"偶数：{string.Join(", ", evens)}");

// Select：投影
var squares = numbers.Select(n => n * n);
Console.WriteLine($"平方：{string.Join(", ", squares)}");

// FindAll：查找所有
var largeNumbers = numbers.FindAll(n => n > 5);
Console.WriteLine($"大于5：{string.Join(", ", largeNumbers)}");

// Sort：自定义排序
var names = new List<string> { "banana", "Apple", "cherry", "Date" };
names.Sort((a, b) => string.Compare(a, b, StringComparison.OrdinalIgnoreCase));
Console.WriteLine($"忽略大小写排序：{string.Join(", ", names)}");

// GroupBy：分组
var words = new List<string> { "apple", "banana", "apricot", "blueberry", "cherry" };
var groups = words.GroupBy(w => w[0]);  // 按首字母分组
Console.WriteLine("\\n按首字母分组：");
foreach (var group in groups)
{
    Console.WriteLine($"  {group.Key}：{string.Join(", ", group)}");
}
\`\`\`

### 四、捕获变量（闭包简介）

\`\`\`csharp
// Lambda 可以捕获外部变量（闭包）
int factor = 10;

// 这个 Lambda 捕获了 factor
Func<int, int> multiply = x => x * factor;

Console.WriteLine($"factor=10：{multiply(5)}");  // 50

// 修改捕获的变量会影响 Lambda 的行为
factor = 20;
Console.WriteLine($"factor=20：{multiply(5)}");  // 100（使用最新值！）

// 注意：Lambda 捕获的是变量，不是值
// 这意味着如果在循环中创建 Lambda，所有 Lambda 共享同一个变量
List<Action> actions = new List<Action>();
for (int i = 0; i < 3; i++)
{
    actions.Add(() => Console.WriteLine(i));  // 捕获的是变量 i
}

Console.WriteLine("\\n循环捕获陷阱：");
foreach (var action in actions)
{
    action();  // 输出 3, 3, 3（不是 0, 1, 2）！
}

// 解决：在循环内创建局部变量副本
List<Action> fixedActions = new List<Action>();
for (int i = 0; i < 3; i++)
{
    int copy = i;  // 创建局部副本
    fixedActions.Add(() => Console.WriteLine(copy));
}

Console.WriteLine("\\n修复后：");
foreach (var action in fixedActions)
{
    action();  // 输出 0, 1, 2 ✓
}
\`\`\`

### 五、静态 Lambda（C# 9+）

\`\`\`csharp
// 静态 Lambda：不能捕获任何变量，性能更好
// 使用 static 关键字标记

// 普通 Lambda：可以捕获变量
int factor = 10;
Func<int, int> normal = n => n * factor;  // 捕获了 factor

// 静态 Lambda：不能引用外部变量
Func<int, int> staticLambda = static n => n * 2;  // 不捕获任何变量
// Func<int, int> bad = static n => n * factor;  // 编译错误！不能捕获 factor

Console.WriteLine($"静态 Lambda：{staticLambda(5)}");  // 10

// 静态 Lambda 的优势：
// 1. 不会意外捕获变量，减少闭包开销
// 2. 编译器可以更好地优化
// 3. 避免闭包导致的内存泄漏
\`\`\`

### 六、Lambda 表达式树

\`\`\`csharp
// Lambda 表达式树：将 Lambda 表示为数据结构
// 用于 LINQ to SQL、Entity Framework 等场景

// 普通 Lambda 编译为委托
Func<int, bool> isEvenDelegate = n => n % 2 == 0;

// 表达式树 Lambda：用 Expression<T> 包装
System.Linq.Expressions.Expression<Func<int, bool>> isEvenExpr = n => n % 2 == 0;

// 表达式树可以被分析、转换
Console.WriteLine($"表达式树：{isEvenExpr}");  // n => (n % 2) == 0
Console.WriteLine($"表达式类型：{isEvenExpr.Body.GetType().Name}");

// 编译表达式树为委托
Func<int, bool> compiled = isEvenExpr.Compile();
Console.WriteLine($"编译后执行：{compiled(10)}");  // True

// 手动构建表达式树
using System.Linq.Expressions;

// 构建 x => x + 1 的表达式树
ParameterExpression param = Expression.Parameter(typeof(int), "x");
BinaryExpression body = Expression.Add(param, Expression.Constant(1));
Expression<Func<int, int>> addOneExpr = Expression.Lambda<Func<int, int>>(body, param);

Console.WriteLine($"手动构建：{addOneExpr}");  // x => (x + 1)
Console.WriteLine($"执行：{addOneExpr.Compile()(5)}");  // 6
\`\`\`

### 七、Lambda 最佳实践

\`\`\`csharp
// 1. 简单逻辑用表达式 Lambda，复杂逻辑用语句 Lambda
// 好：简洁清晰
var adults = people.Where(p => p.Age >= 18);

// 避免：过于复杂的 Lambda
// var result = data.Where(x => x.A > 0 && x.B < 100 && x.C.Contains("key")...);

// 2. 重用 Lambda
Func<int, bool> isPrime = n =>
{
    if (n < 2) return false;
    for (int i = 2; i <= Math.Sqrt(n); i++)
        if (n % i == 0) return false;
    return true;
};

// 多次使用同一个 Lambda
Console.WriteLine($"17 是质数：{isPrime(17)}");
Console.WriteLine($"20 是质数：{isPrime(20)}");

// 3. 方法组转换（更简洁）
List<string> names = new List<string> { "Alice", "Bob", "Charlie" };
names.ForEach(Console.WriteLine);  // 方法组，等价于 n => Console.WriteLine(n)
\`\`\`

### 八、小结

- ⭐ Lambda 表达式用 \`=>\` 分隔参数和方法体，是创建匿名方法的简洁语法。
- ⭐ 表达式 Lambda 适合单行逻辑，语句 Lambda 适合多行逻辑。
- ⭐ Lambda 可以捕获外部变量（闭包），但注意循环中的捕获陷阱。
- ⭐ 静态 Lambda（\`static\`）不能捕获变量，性能更好。
- ⭐ 表达式树（\`Expression<T>\`）将 Lambda 表示为数据结构，是 LINQ to SQL 的基础。`,
  },

  // ============================================================
  // 第五十三章：事件
  // ============================================================
  {
    id: 'csharp3-ch53',
    group: '第十部分 委托、事件与 Lambda',
    icon: '📡',
    title: '第五十三章 事件',
    content: `## 第五十三章　事件

事件（Event）是 C# 中实现观察者模式（发布-订阅）的核心机制。它基于委托，但提供了更安全的封装——外部只能订阅和取消订阅，不能直接触发事件。

### 一、事件基础

事件用 \`event\` 关键字声明，必须是委托类型：

\`\`\`csharp
// 定义事件发布者
class Button
{
    // 声明事件：event + 委托类型 + 事件名
    // 事件是基于委托的封装
    public event Action? Clicked;  // Action 委托类型的事件

    public string Text { get; set; } = "按钮";

    // 触发事件的方法（通常命名为 On + 事件名）
    // 约定为 protected virtual，允许子类重写
    public void Click()
    {
        Console.WriteLine($"{Text} 被点击了");
        // 触发事件：?.Invoke 安全调用（避免 null 引用）
        // 如果有订阅者，通知它们；没有则跳过
        Clicked?.Invoke();
    }
}

// 使用事件
var button = new Button { Text = "确定" };

// 订阅事件：用 += 运算符
button.Clicked += () => Console.WriteLine("  事件处理：保存数据");
button.Clicked += () => Console.WriteLine("  事件处理：关闭窗口");

// 触发事件
button.Click();

// 取消订阅：用 -= 运算符
// button.Clicked -= handler;
\`\`\`

### 二、EventHandler 与 EventArgs

标准事件模式使用 \`EventHandler\` 委托和 \`EventArgs\` 参数：

\`\`\`csharp
// 标准事件模式：EventHandler 和 EventArgs
// sender：事件的发送者（通常用 this）
// EventArgs：事件参数（包含事件相关信息）

class Order
{
    public string OrderId { get; }
    public decimal Amount { get; }

    public Order(string orderId, decimal amount)
    {
        OrderId = orderId;
        Amount = amount;
    }
}

class OrderProcessor
{
    // 使用 EventHandler 声明事件
    // EventHandler 签名：void(object? sender, EventArgs e)
    public event EventHandler? OrderCreated;

    // 触发事件
    protected virtual void OnOrderCreated(Order order)
    {
        Console.WriteLine($"创建订单：{order.OrderId}，金额 {order.Amount:C}");
        // 触发事件，传递 sender 和 EventArgs
        OrderCreated?.Invoke(this, EventArgs.Empty);
    }

    public void CreateOrder(Order order)
    {
        // 处理订单逻辑...
        OnOrderCreated(order);  // 通知订阅者
    }
}

var processor = new OrderProcessor();

// 订阅标准事件
processor.OrderCreated += (sender, e) =>
{
    Console.WriteLine($"[监听器] 收到事件，发送者：{sender?.GetType().Name}");
};

processor.CreateOrder(new Order("ORD-001", 299.99m));
\`\`\`

### 三、EventHandler\<TEventArgs\> 与自定义事件参数

\`\`\`csharp
// 自定义事件参数类：继承 EventArgs
class OrderEventArgs : EventArgs
{
    public string OrderId { get; }
    public decimal Amount { get; }
    public DateTime Timestamp { get; }

    public OrderEventArgs(string orderId, decimal amount)
    {
        OrderId = orderId;
        Amount = amount;
        Timestamp = DateTime.Now;
    }
}

class OrderService
{
    // 使用 EventHandler<T> 声明泛型事件
    public event EventHandler<OrderEventArgs>? OrderCreated;

    public void CreateOrder(string orderId, decimal amount)
    {
        Console.WriteLine($"创建订单：{orderId}，金额 {amount:C}");

        // 触发事件：传递自定义事件参数
        OrderCreated?.Invoke(this, new OrderEventArgs(orderId, amount));
    }
}

// 邮件通知服务
class EmailService
{
    public void OnOrderCreated(object? sender, OrderEventArgs e)
    {
        Console.WriteLine($"[邮件服务] 发送订单确认邮件：订单 {e.OrderId}");
        Console.WriteLine($"[邮件服务] 金额：{e.Amount:C}");
        Console.WriteLine($"[邮件服务] 时间：{e.Timestamp:yyyy-MM-dd HH:mm:ss}");
    }
}

// 短信通知服务
class SmsService
{
    public void OnOrderCreated(object? sender, OrderEventArgs e)
    {
        if (e.Amount > 1000)
        {
            Console.WriteLine($"[短信服务] 大额订单提醒：订单 {e.OrderId}，金额 {e.Amount:C}");
        }
    }
}

// 使用
var orderService = new OrderService();
var emailService = new EmailService();
var smsService = new SmsService();

// 订阅事件
orderService.OrderCreated += emailService.OnOrderCreated;
orderService.OrderCreated += smsService.OnOrderCreated;

// 触发
orderService.CreateOrder("ORD-001", 299.99m);
Console.WriteLine();
orderService.CreateOrder("ORD-002", 5000m);
\`\`\`

### 四、事件最佳实践

\`\`\`csharp
// 事件设计最佳实践
class TemperatureSensor
{
    private double _temperature;

    // 最佳实践1：使用 EventHandler<T> 而非裸露委托
    public event EventHandler<TemperatureChangedEventArgs>? TemperatureChanged;

    public double Temperature
    {
        get => _temperature;
        set
        {
            if (Math.Abs(_temperature - value) > 0.01)
            {
                double oldTemp = _temperature;
                _temperature = value;
                // 最佳实践2：在 OnXxx 方法中触发事件
                OnTemperatureChanged(oldTemp, _temperature);
            }
        }
    }

    // 最佳实践3：触发方法为 protected virtual
    protected virtual void OnTemperatureChanged(double oldTemp, double newTemp)
    {
        // 最佳实践4：先复制事件引用，避免竞态条件
        var handler = TemperatureChanged;
        handler?.Invoke(this, new TemperatureChangedEventArgs(oldTemp, newTemp));
    }
}

class TemperatureChangedEventArgs : EventArgs
{
    public double OldTemperature { get; }
    public double NewTemperature { get; }
    public double Change => NewTemperature - OldTemperature;

    public TemperatureChangedEventArgs(double oldTemp, double newTemp)
    {
        OldTemperature = oldTemp;
        NewTemperature = newTemp;
    }
}

var sensor = new TemperatureSensor();
sensor.TemperatureChanged += (sender, e) =>
{
    Console.WriteLine($"温度变化：{e.OldTemperature:F1}°C → {e.NewTemperature:F1}°C");
    Console.WriteLine($"变化量：{e.Change:F1}°C");

    if (e.NewTemperature > 30)
        Console.WriteLine("  警告：温度过高！");
};

sensor.Temperature = 25.5;
sensor.Temperature = 32.0;
sensor.Temperature = 32.0;  // 温度未变化，不触发事件
\`\`\`

### 五、INotifyPropertyChanged 接口

\`\`\`csharp
// INotifyPropertyChanged：数据绑定和 MVVM 的核心接口
using System.ComponentModel;

class Person : INotifyPropertyChanged
{
    private string _name = "";
    private int _age;

    // 实现 INotifyPropertyChanged 的事件
    public event PropertyChangedEventHandler? PropertyChanged;

    public string Name
    {
        get => _name;
        set
        {
            if (_name != value)
            {
                _name = value;
                // 通知属性已变更
                OnPropertyChanged(nameof(Name));
            }
        }
    }

    public int Age
    {
        get => _age;
        set
        {
            if (_age != value)
            {
                _age = value;
                OnPropertyChanged(nameof(Age));
            }
        }
    }

    // 触发属性变更通知
    protected void OnPropertyChanged(string propertyName)
    {
        // PropertyChangedEventArgs 携带属性名
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}

var person = new Person();

// 订阅属性变更通知
person.PropertyChanged += (sender, e) =>
{
    Console.WriteLine($"属性 '{e.PropertyName}' 已变更");
};

person.Name = "张三";
person.Age = 28;
person.Name = "李四";
\`\`\`

### 六、事件 vs 委托

| 特性 | 事件（event） | 委托（delegate） |
| --- | --- | --- |
| 外部调用 | 外部不能直接调用 | 外部可以直接调用 |
| 外部赋值 | 外部不能用 = 赋值 | 外部可以用 = 赋值 |
| 外部清空 | 外部不能设为 null | 外部可以设为 null |
| 封装性 | 高（发布者控制触发） | 低（谁都可以调用） |
| 使用场景 | 发布-订阅模式 | 回调、策略模式 |

### 七、小结

- ⭐ 事件基于委托，用 \`event\` 关键字声明，外部只能订阅/取消订阅。
- ⭐ 标准事件模式使用 \`EventHandler\` 或 \`EventHandler<TEventArgs>\`。
- ⭐ 触发事件前先复制引用（\`var handler = Event;\`），避免竞态条件。
- ⭐ 触发方法命名 \`OnXxx\`，设为 \`protected virtual\` 允许子类重写。
- ⭐ \`INotifyPropertyChanged\` 是数据绑定和 MVVM 的核心接口。`,
  },

  // ============================================================
  // 第五十三章：闭包与变量捕获
  // ============================================================
  {
    id: 'csharp3-ch54',
    group: '第十部分 委托、事件与 Lambda',
    icon: '🔐',
    title: '第五十四章 闭包与变量捕获',
    content: `## 第五十四章　闭包与变量捕获

闭包（Closure）是 Lambda 表达式和匿名方法捕获外部变量的机制。理解闭包的工作原理，能帮你避免常见的陷阱，写出正确的异步和回调代码。

### 一、闭包机制

当 Lambda 引用外部变量时，编译器会创建一个闭包类来"捕获"这些变量：

\`\`\`csharp
// 闭包：Lambda 捕获了外部变量 factor
int factor = 10;

// 编译器实际生成的代码类似于：
// class Closure { public int factor; }
// Closure c = new Closure { factor = 10 };
// Func<int, int> multiply = x => x * c.factor;

Func<int, int> multiply = x => x * factor;

Console.WriteLine($"factor=10：{multiply(5)}");  // 50

// 修改捕获的变量：Lambda 会看到最新值
factor = 20;
Console.WriteLine($"factor=20：{multiply(5)}");  // 100

// 关键：Lambda 捕获的是变量，不是变量的值
// factor 改变了，multiply 的行为也随之改变
\`\`\`

### 二、捕获变量的生命周期

\`\`\`csharp
// 闭包延长了被捕获变量的生命周期
Func<int> CreateCounter()
{
    int count = 0;  // 局部变量，正常情况下方法返回后释放

    // 返回一个捕获了 count 的 Lambda
    return () =>
    {
        count++;  // count 的生命周期被延长了
        return count;
    };
}

// CreateCounter 返回后，count 变量应该被销毁
// 但由于闭包捕获了它，count 被保留在堆上
var counter = CreateCounter();

Console.WriteLine($"第1次调用：{counter()}");  // 1
Console.WriteLine($"第2次调用：{counter()}");  // 2
Console.WriteLine($"第3次调用：{counter()}");  // 3

// 每个闭包有自己独立的捕获变量
var counter2 = CreateCounter();
Console.WriteLine($"\\n新计数器：{counter2()}");  // 1（独立）
Console.WriteLine($"旧计数器：{counter()}");      // 4（继续累加）
\`\`\`

### 三、闭包陷阱：foreach 循环

\`\`\`csharp
// 陷阱1：foreach 循环中的闭包（C# 5 之前）
// C# 5+ 已修复：foreach 每次迭代创建新的变量副本

List<Action> actions = new List<Action>();
string[] names = { "张三", "李四", "王五" };

foreach (string name in names)
{
    // C# 5+：每次迭代 name 是新的变量，因此安全
    actions.Add(() => Console.WriteLine(name));
}

Console.WriteLine("foreach 闭包：");
foreach (var action in actions)
{
    action();  // 张三, 李四, 王五 ✓（C# 5+ 正确）
}

// 陷阱2：for 循环中的闭包（仍然存在！）
List<Action> forActions = new List<Action>();
for (int i = 0; i < 3; i++)
{
    // i 是同一个变量，所有 Lambda 共享
    forActions.Add(() => Console.WriteLine(i));
}

Console.WriteLine("\\nfor 循环闭包陷阱：");
foreach (var action in forActions)
{
    action();  // 3, 3, 3（不是 0, 1, 2）！
}

// 修复：在循环内创建局部变量副本
List<Action> fixedActions = new List<Action>();
for (int i = 0; i < 3; i++)
{
    int copy = i;  // 创建局部副本
    fixedActions.Add(() => Console.WriteLine(copy));
}

Console.WriteLine("\\n修复后：");
foreach (var action in fixedActions)
{
    action();  // 0, 1, 2 ✓
}
\`\`\`

### 四、闭包陷阱：异步操作

\`\`\`csharp
// 陷阱：异步操作中的闭包捕获
// 模拟异步操作
async Task ProcessItemsAsync()
{
    List<Task> tasks = new List<Task>();

    for (int i = 0; i < 3; i++)
    {
        // 错误：i 被所有 Task 共享
        // 当 Task 执行时，i 已经是 3 了
        tasks.Add(Task.Run(() =>
        {
            Console.WriteLine($"处理项目 {i}");  // 可能输出 3, 3, 3
        }));
    }

    await Task.WhenAll(tasks);
}

// 修复：创建局部副本
async Task ProcessItemsFixedAsync()
{
    List<Task> tasks = new List<Task>();

    for (int i = 0; i < 3; i++)
    {
        int itemId = i;  // 局部副本，每个 Task 独立
        tasks.Add(Task.Run(() =>
        {
            Console.WriteLine($"处理项目 {itemId}");  // 输出 0, 1, 2
        }));
    }

    await Task.WhenAll(tasks);
}

// 同步执行验证
Console.WriteLine("同步模拟：");
List<Action> syncActions = new List<Action>();
for (int i = 0; i < 3; i++)
{
    int copy = i;
    syncActions.Add(() => Console.WriteLine($"项目 {copy}"));
}
foreach (var action in syncActions)
    action();  // 项目 0, 项目 1, 项目 2
\`\`\`

### 五、避免闭包导致的内存泄漏

\`\`\`csharp
// 闭包可能导致内存泄漏：长生命周期对象持有短生命周期对象的引用
class ResourceManager
{
    private List<Action> _cleanupActions = new List<Action>();

    // 注册资源：捕获了大型对象
    public void RegisterResource(byte[] largeData)
    {
        // 闭包捕获了 largeData，只要 _cleanupActions 存在，largeData 就不会被 GC
        _cleanupActions.Add(() =>
        {
            Console.WriteLine($"清理资源，大小：{largeData.Length} 字节");
            // largeData 被闭包持有，无法被 GC 回收
        });
    }

    // 清理：释放闭包引用
    public void Cleanup()
    {
        _cleanupActions.Clear();  // 释放所有闭包引用
        Console.WriteLine("所有资源已清理");
    }
}

var manager = new ResourceManager();
byte[] data = new byte[1024 * 1024];  // 1 MB 数据
manager.RegisterResource(data);

// 即使 data = null，闭包仍然持有原始数组的引用
data = null;
GC.Collect();  // 大数组仍不会被回收（被闭包引用）

manager.Cleanup();  // 清理后，数组才可以被回收

// 最佳实践：使用弱引用或及时取消订阅
// 1. 及时取消事件订阅
// 2. 使用 IDisposable 模式清理
// 3. 避免长期持有带捕获的委托
\`\`\`

### 六、静态 Lambda 避免闭包

\`\`\`csharp
// 静态 Lambda：不捕获任何变量，避免闭包开销
// 性能更好，且不会意外捕获变量

int factor = 10;

// 普通 Lambda：捕获了 factor（有闭包）
Func<int, int> normal = n => n * factor;

// 静态 Lambda：不能引用外部变量
Func<int, int> staticLambda = static n => n * 2;
// Func<int, int> error = static n => n * factor;  // 编译错误！

// 静态 Lambda 的优势：
// 1. 零分配：不需要创建闭包对象
// 2. 不会被意外捕获变量
// 3. 更安全：不会导致内存泄漏

// 使用场景：纯函数、不依赖外部状态的 Lambda
List<int> numbers = new List<int> { 1, 2, 3, 4, 5 };
var doubled = numbers.Select(static n => n * 2);  // 静态 Lambda
Console.WriteLine($"翻倍：{string.Join(", ", doubled)}");
\`\`\`

### 七、闭包最佳实践汇总

| 问题 | 原因 | 解决方案 |
| --- | --- | --- |
| for 循环捕获 | 循环变量被共享 | 在循环内创建局部副本 |
| 异步捕获 | Task 延迟执行 | 使用局部变量副本 |
| 内存泄漏 | 闭包持有对象引用 | 及时取消订阅，使用弱引用 |
| 意外捕获 | 忘记 Lambda 引用外部变量 | 使用静态 Lambda |
| 性能开销 | 每次创建闭包对象 | 用静态 Lambda 或方法组 |

### 八、小结

- ⭐ 闭包是 Lambda 捕获外部变量的机制，编译器会创建闭包类。
- ⭐ 闭包捕获的是变量，不是变量的值——变量变化会影响 Lambda 行为。
- ⭐ 闭包会延长被捕获变量的生命周期，可能导致内存泄漏。
- ⭐ for 循环中创建 Lambda 需要用局部副本避免共享陷阱。
- ⭐ 静态 Lambda（\`static\`）不捕获变量，性能更好，更安全。`,
  },
];

export { chapters };