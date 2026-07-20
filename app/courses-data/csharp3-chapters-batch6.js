// =============================================================
// C# 从入门到精通大全（终极版）—— 第6批章节
// 第六部分 委托事件与 LINQ（共 6 章）
// -------------------------------------------------------------
// 本批包含 6 章：
//   csharp3-ch25 : 第二十五章 委托 Delegate
//   csharp3-ch26 : 第二十六章 Lambda 表达式
//   csharp3-ch27 : 第二十七章 事件 Event
//   csharp3-ch28 : 第二十八章 LINQ 基础
//   csharp3-ch29 : 第二十九章 LINQ 进阶
//   csharp3-ch30 : 第三十章 扩展方法与函数式编程
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第二十五章：委托 Delegate
  // ============================================================
  {
    id: 'csharp3-ch25',
    group: '第六部分 委托事件与 LINQ',
    icon: '📞',
    title: '第二十五章 委托 Delegate',
    content: `## 第二十五章　委托 Delegate

委托是 C# 函数式编程的基石——把方法当作参数传递。这一章讲透委托定义、Action、Func、多播委托、匿名方法、协变逆变。

### 一、委托基础 ⭐

\`\`\`csharp
// 1. 定义委托
delegate int MathOp(int a, int b);

// 2. 静态方法
static int Add(int a, int b) => a + b;
static int Mul(int a, int b) => a * b;

// 3. 创建委托实例
MathOp op1 = new MathOp(Add);
MathOp op2 = Mul;  // 简写
Console.WriteLine($"Add: {op1(3, 5)}");  // 8
Console.WriteLine($"Mul: {op2(3, 5)}");  // 15

// 4. 委托作为方法参数
int Apply(int a, int b, MathOp op) => op(a, b);
Console.WriteLine($"Apply Add: {Apply(3, 5, Add)}");
Console.WriteLine($"Apply Mul: {Apply(3, 5, Mul)}");
\`\`\`

> ⭐ **委托 = 类型安全的函数指针**——把方法当作值传递、存储、组合。

### 二、内置委托：Action / Func / Predicate ⭐⭐

\`\`\`csharp
// Action：无返回值
Action print = () => Console.WriteLine("Hello");
Action<string> greet = name => Console.WriteLine($"Hi, {name}");
Action<int, int> sum = (a, b) => Console.WriteLine($"{a}+{b}={a + b}");

print();
greet("张三");
sum(3, 5);

// Func：有返回值，最后一个泛型是返回类型
Func<int> getNumber = () => 42;
Func<int, int> square = x => x * x;
Func<int, int, int> add = (a, b) => a + b;

Console.WriteLine($"getNumber: {getNumber()}");
Console.WriteLine($"square(5): {square(5)}");
Console.WriteLine($"add(3,5): {add(3, 5)}");

// Predicate：返回 bool
Predicate<int> isPositive = x => x > 0;
Console.WriteLine($"3 > 0: {isPositive(3)}");
Console.WriteLine($"-3 > 0: {isPositive(-3)}");
\`\`\`

> ⭐⭐ **90% 场景用 Action / Func**——覆盖几乎所有委托需求，无需自定义。

### 三、匿名方法（C# 2+）

\`\`\`csharp
// 旧写法：delegate 关键字
Func<int, int> square1 = delegate(int x) { return x * x; };

// 现代：lambda 表达式
Func<int, int> square2 = x => x * x;

Console.WriteLine(square1(5));  // 25
Console.WriteLine(square2(5));  // 25
\`\`\`

### 四、多播委托 ⭐

\`\`\`csharp
// 多播：+= 添加方法，-= 移除方法
Action logger = null!;
logger += msg => Console.WriteLine($"[INFO] {msg}");
logger += msg => Console.WriteLine($"[DEBUG] {msg}");
logger += msg => Console.WriteLine($"[ERROR] {msg}");

logger("系统启动");  // 三条都会输出

// 移除某个
logger -= msg => Console.WriteLine($"[DEBUG] {msg}");
logger("系统启动2");  // 两条输出
\`\`\`

> ⭐ **多播委托**：一个委托可绑定多个方法，按顺序调用。事件底层就是它。

### 五、委托的协变与逆变 ⭐

\`\`\`csharp
// 协变 out：返回值可以是子类
Func<object> getObject = () => "Hello";  // string → object 协变

// 逆变 in：参数可以是父类
Action<object> printObject = obj => Console.WriteLine(obj);
Action<string> printString = printObject;  // 逆变：object → string
printString("Hello");
\`\`\`

### 六、实战 demo：策略模式

\`\`\`csharp
// 策略模式：用委托实现
class Calculator {
    public int Calculate(int a, int b, Func<int, int, int> strategy) {
        return strategy(a, b);
    }
}

var calc = new Calculator();
Console.WriteLine($"加：{calc.Calculate(3, 5, (a, b) => a + b)}");
Console.WriteLine($"减：{calc.Calculate(10, 4, (a, b) => a - b)}");
Console.WriteLine($"乘：{calc.Calculate(3, 5, (a, b) => a * b)}");
Console.WriteLine($"除：{calc.Calculate(10, 2, (a, b) => b != 0 ? a / b : 0)}");
\`\`\`

### 七、实战 demo：回调函数

\`\`\`csharp
// 异步操作完成时回调
class LongTask {
    public void Run(Action<string> onComplete) {
        Console.WriteLine("开始执行...");
        System.Threading.Thread.Sleep(100);
        onComplete?.Invoke("任务完成");
    }
}

var task = new LongTask();
task.Run(result => Console.WriteLine($"回调：{result}"));
\`\`\`

### 八、小结

- ⭐ 委托 = 类型安全的函数指针。
- ⭐⭐ 90% 用 Action / Func。
- 多播：\`+=\` 加方法，\`-=\` 移除。
- 协变返回值，逆变参数。
- 委托是 lambda、事件、LINQ 的基础。`,
  },

  // ============================================================
  // 第二十六章：Lambda 表达式
  // ============================================================
  {
    id: 'csharp3-ch26',
    group: '第六部分 委托事件与 LINQ',
    icon: 'λ',
    title: '第二十六章 Lambda 表达式',
    content: `## 第二十六章　Lambda 表达式

Lambda 是 C# 函数式编程的核心——把函数写得简洁、表达力强。这一章讲透 lambda 语法、闭包、表达式树、捕获变量、Func 工厂。

### 一、Lambda 基础 ⭐⭐

\`\`\`csharp
// 1. 单参数 lambda
Func<int, int> square = x => x * x;
Console.WriteLine($"square(5): {square(5)}");

// 2. 多参数 lambda
Func<int, int, int> add = (a, b) => a + b;
Console.WriteLine($"add(3, 5): {add(3, 5)}");

// 3. 无参数
Func<int> getNumber = () => 42;
Console.WriteLine($"getNumber: {getNumber()}");

// 4. 块语法（多行）
Func<int, int> factorial = n => {
    int result = 1;
    for (int i = 2; i <= n; i++) result *= i;
    return result;
};
Console.WriteLine($"5! = {factorial(5)}");

// 5. 类型可省略
Func<int, int> triple = (int x) => x * 3;
\`\`\`

### 二、Lambda 作为参数 ⭐⭐

\`\`\`csharp
// List 的 FindAll 接受 Predicate<T>
var nums = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

// 找偶数
var evens = nums.FindAll(n => n % 2 == 0);
Console.WriteLine($"偶数：{string.Join(",", evens)}");

// Array.Find
int[] arr = { 3, 1, 4, 1, 5, 9, 2, 6 };
int firstBig = Array.Find(arr, n => n > 4);
Console.WriteLine($"第一个 > 4：{firstBig}");
\`\`\`

### 三、闭包：捕获外部变量 ⭐⭐

\`\`\`csharp
// Lambda 可捕获外部变量
int counter = 0;
Action increment = () => counter++;
increment();
increment();
increment();
Console.WriteLine($"counter: {counter}");  // 3

// ⚠️ 闭包陷阱：循环变量
var actions = new List<Action>();
for (int i = 0; i < 3; i++) {
    // 正确写法：创建临时变量
    int copy = i;
    actions.Add(() => Console.WriteLine(copy));
}

foreach (var act in actions) {
    act();  // 0 1 2
}
\`\`\`

> ⭐⭐ **闭包陷阱**：循环里捕获 for 变量，所有 lambda 共享同一个变量。用临时变量拷贝是稳妥写法。

### 四、Lambda 与委托类型 ⭐

\`\`\`csharp
// Lambda 自动适配委托类型
Action act = () => Console.WriteLine("Action");
Func<int> func = () => 42;
Predicate<int> pred = n => n > 0;

// 显式类型
Action<string> greet = (string s) => Console.WriteLine($"Hi, {s}");

// 多语句用块
Func<int, bool> isPrime = n => {
    if (n < 2) return false;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) return false;
    }
    return true;
};

Console.WriteLine($"7 is prime: {isPrime(7)}");
\`\`\`

### 五、Lambda 作为返回值（高阶函数）⭐

\`\`\`csharp
// 工厂方法：返回委托
Func<int, int> MakeMultiplier(int factor) {
    return x => x * factor;
}

var doubler = MakeMultiplier(2);
var tripler = MakeMultiplier(3);
Console.WriteLine($"doubler(5): {doubler(5)}");  // 10
Console.WriteLine($"tripler(5): {tripler(5)}");  // 15
\`\`\`

### 六、Lambda 与表达式树 ⭐

\`\`\`csharp
using System.Linq.Expressions;

// 普通 lambda：编译为委托
Func<int, int> f = x => x * x;

// 表达式树：编译为数据结构，可分析
Expression<Func<int, int>> expr = x => x * x;
Console.WriteLine($"表达式：{expr.Body}");    // x * x
Console.WriteLine($"参数：{expr.Parameters[0]}");

// 实战：动态构建查询（EF Core、SQL 生成器）
\`\`\`

### 七、实战 demo：链式数据过滤

\`\`\`csharp
int[] data = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

// 用链式 lambda 找到所有偶数中大于 3 的
var result = data
    .Where(x => x % 2 == 0)
    .Where(x => x > 3)
    .ToList();

Console.WriteLine($"结果：{string.Join(",", result)}");
\`\`\`

### 八、小结

- ⭐⭐ Lambda = 简洁的匿名函数，lambda 表达式日常 80% 场景。
- ⭐⭐ 闭包陷阱：循环变量用临时变量拷贝。
- 高阶函数：参数或返回值为函数。
- 表达式树用于 ORM 动态查询、规则引擎。
- Lambda 是 LINQ、async、事件处理器的基础。`,
  },

  // ============================================================
  // 第二十七章：事件 Event
  // ============================================================
  {
    id: 'csharp3-ch27',
    group: '第六部分 委托事件与 LINQ',
    icon: '🔔',
    title: '第二十七章 事件 Event',
    content: `## 第二十七章　事件 Event

事件是"发布-订阅"模式的核心——对象状态变化时通知其他对象。这一章讲透 event 关键字、自定义事件、EventHandler、事件标准模式、实际应用。

### 一、事件基础 ⭐⭐

\`\`\`csharp
// 发布者：拥有事件的对象
class Button {
    // event 关键字：限制只能在类内 invoke
    public event Action<string>? Clicked;

    public void Click() {
        Console.WriteLine("按钮被点击");
        Clicked?.Invoke("click event");  // 触发事件
    }
}

// 订阅者
var btn = new Button();
btn.Clicked += msg => Console.WriteLine($"  订阅者1收到：{msg}");
btn.Clicked += msg => Console.WriteLine($"  订阅者2收到：{msg}");

btn.Click();
\`\`\`

> ⭐⭐ **event 关键字**：在委托基础上加了"封装"——外部只能 \`+=\` / \`-=\`，不能 \`Invoke\`。

### 二、EventHandler 标准模式 ⭐⭐

\`\`\`csharp
// .NET 标准事件模式
public class MyEventArgs : EventArgs {
    public string Message { get; }
    public DateTime Time { get; }

    public MyEventArgs(string msg) {
        Message = msg;
        Time = DateTime.Now;
    }
}

class Publisher {
    // 事件：发送方 + 数据
    public event EventHandler<MyEventArgs>? SomethingHappened;

    public void Trigger() {
        SomethingHappened?.Invoke(this, new MyEventArgs("Hello Event"));
    }
}

var pub = new Publisher();
pub.SomethingHappened += (sender, e) => {
    Console.WriteLine($"发送方：{sender.GetType().Name}");
    Console.WriteLine($"消息：{e.Message}，时间：{e.Time:HH:mm:ss}");
};
pub.Trigger();
\`\`\`

> ⭐⭐ **\`EventHandler<TEventArgs>\`** 是 .NET 标准事件签名，所有 .NET 框架事件都用这种模式。

### 三、移除订阅

\`\`\`csharp
class Counter {
    public event Action<int>? ThresholdReached;

    public void Trigger() {
        // 模拟触发
        ThresholdReached?.Invoke(100);
    }
}

var c = new Counter();
Action<int> handler = n => Console.WriteLine($"达到：{n}");

c.ThresholdReached += handler;
c.Trigger();
c.ThresholdReached -= handler;
c.Trigger();  // 这次不会触发
\`\`\`

### 四、实战 demo：订单状态变化通知

\`\`\`csharp
class OrderEventArgs : EventArgs {
    public string OrderId { get; }
    public string Status { get; }

    public OrderEventArgs(string id, string status) {
        OrderId = id;
        Status = status;
    }
}

class Order {
    public string Id { get; }
    private string _status = "Created";

    // 事件
    public event EventHandler<OrderEventArgs>? StatusChanged;

    public Order(string id) {
        Id = id;
    }

    public string Status {
        get => _status;
        set {
            if (_status != value) {
                _status = value;
                StatusChanged?.Invoke(this, new OrderEventArgs(Id, value));
            }
        }
    }
}

var order = new Order("ORD001");
order.StatusChanged += (s, e) => {
    Console.WriteLine($"[日志] 订单 {e.OrderId} 状态：{e.Status}");
};
order.StatusChanged += (s, e) => {
    Console.WriteLine($"[通知] 发送通知给客户：订单 {e.OrderId} {e.Status}");
};

order.Status = "已支付";
order.Status = "已发货";
order.Status = "已签收";
\`\`\`

### 五、实战 demo：文件下载进度

\`\`\`csharp
class DownloadManager {
    public event Action<int>? ProgressChanged;
    public event Action? Completed;

    public void Download() {
        for (int i = 0; i <= 100; i += 10) {
            ProgressChanged?.Invoke(i);
        }
        Completed?.Invoke();
    }
}

var dm = new DownloadManager();
dm.ProgressChanged += p => Console.WriteLine($"进度：{p}%");
dm.Completed += () => Console.WriteLine("下载完成！");

dm.Download();
\`\`\`

### 六、小结

- ⭐⭐ event 关键字：委托的封装，外部只能 +=/-=。
- ⭐⭐ \`EventHandler<TEventArgs>\` 是 .NET 标准事件签名。
- 事件是"发布-订阅"模式。
- 实战：UI 事件、状态通知、日志、消息总线。`,
  },

  // ============================================================
  // 第二十八章：LINQ 基础
  // ============================================================
  {
    id: 'csharp3-ch28',
    group: '第六部分 委托事件与 LINQ',
    icon: '🔍',
    title: '第二十八章 LINQ 基础',
    content: `## 第二十八章　LINQ 基础

LINQ（Language Integrated Query）让查询成为 C# 第一公民——统一语法查询集合、数据库、XML、JSON。这一章讲透 LINQ 基础、where/select/orderby、聚合、延迟执行。

### 一、LINQ 是什么？

\`\`\`csharp
// LINQ = Language Integrated Query
// 用类似 SQL 的语法查询任何 IEnumerable 数据源

int[] nums = { 3, 1, 4, 1, 5, 9, 2, 6, 5, 3 };

// 传统写法
var evens = new List<int>();
foreach (var n in nums) {
    if (n % 2 == 0) evens.Add(n);
}

// LINQ 写法 ⭐⭐
var evensLinq = nums.Where(n => n % 2 == 0);

Console.WriteLine($"传统：{string.Join(",", evens)}");
Console.WriteLine($"LINQ：{string.Join(",", evensLinq)}");
\`\`\`

> ⭐⭐ **LINQ = 用声明式语法查询数据**——比命令式循环简洁、可读、易组合。

### 二、查询语法 vs 方法语法 ⭐

\`\`\`csharp
int[] nums = { 1, 2, 3, 4, 5 };

// 方法语法（lambda）⭐
var q1 = nums.Where(n => n > 2).Select(n => n * n);

// 查询语法（SQL 风格）
var q2 = from n in nums
         where n > 2
         select n * n;

Console.WriteLine($"方法：{string.Join(",", q1)}");
Console.WriteLine($"查询：{string.Join(",", q2)}");

// 两种语法完全等价，按习惯选 ⭐
\`\`\`

### 三、基础操作 ⭐⭐

\`\`\`csharp
int[] nums = { 3, 1, 4, 1, 5, 9, 2, 6, 5, 3 };

// Where 过滤
var bigNums = nums.Where(n => n > 3);
Console.WriteLine($"> 3：{string.Join(",", bigNums)}");

// Select 投影（转换）
var squares = nums.Select(n => n * n);
Console.WriteLine($"平方：{string.Join(",", squares)}");

// OrderBy / OrderByDescending 排序
var asc = nums.OrderBy(n => n);
var desc = nums.OrderByDescending(n => n);
Console.WriteLine($"升序：{string.Join(",", asc)}");
Console.WriteLine($"降序：{string.Join(",", desc)}");

// Distinct 去重
var distinct = nums.Distinct();
Console.WriteLine($"去重：{string.Join(",", distinct)}");

// Take / Skip 分页
var first3 = nums.Take(3);
var skip3 = nums.Skip(3);
Console.WriteLine($"前3：{string.Join(",", first3)}");
Console.WriteLine($"跳3：{string.Join(",", skip3)}");
\`\`\`

### 四、聚合函数 ⭐⭐

\`\`\`csharp
int[] nums = { 1, 2, 3, 4, 5 };

// 常用聚合
Console.WriteLine($"数量：{nums.Count()}");
Console.WriteLine($"求和：{nums.Sum()}");
Console.WriteLine($"平均：{nums.Average():F2}");
Console.WriteLine($"最大：{nums.Max()}");
Console.WriteLine($"最小：{nums.Min()}");

// 条件聚合
int sumEven = nums.Where(n => n % 2 == 0).Sum();
Console.WriteLine($"偶数和：{sumEven}");

// Aggregate 累加
int product = nums.Aggregate((a, b) => a * b);
Console.WriteLine($"乘积：{product}");

// First / Last
Console.WriteLine($"第一：{nums.First()}");
Console.WriteLine($"最后：{nums.Last()}");
Console.WriteLine($"第一个偶数：{nums.First(n => n % 2 == 0)}");
\`\`\`

### 五、Any / All / Contains ⭐⭐

\`\`\`csharp
int[] nums = { 1, 2, 3, 4, 5 };

// Any：是否有元素满足
bool hasEven = nums.Any(n => n % 2 == 0);  // True
bool hasTen = nums.Any(n => n == 10);       // False

// All：是否所有元素都满足
bool allPositive = nums.All(n => n > 0);    // True

// Contains：是否包含
bool hasThree = nums.Contains(3);  // True

Console.WriteLine($"有偶数：{hasEven}");
Console.WriteLine($"全正：{allPositive}");
Console.WriteLine($"含 3：{hasThree}");
\`\`\`

### 六、链式组合 ⭐⭐

\`\`\`csharp
int[] nums = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

// 找出所有偶数，平方，按降序，取前 3
var result = nums
    .Where(n => n % 2 == 0)         // 偶数
    .Select(n => n * n)              // 平方
    .OrderByDescending(x => x)      // 降序
    .Take(3);                        // 前 3

Console.WriteLine($"Top 3 偶数平方：{string.Join(",", result)}");
\`\`\`

> ⭐⭐ **链式 LINQ**是日常最常用写法——一行搞定复杂数据处理。

### 七、延迟执行 vs 立即执行 ⭐⭐

\`\`\`csharp
int[] nums = { 1, 2, 3, 4, 5 };

// 延迟：Where/Select/Take 等
var query = nums.Where(n => n > 2);  // 此时不执行

// 立即：Count/ToList/ToArray/First 等
int count = query.Count();           // 执行一次
var list = query.ToList();           // 再执行一次
Console.WriteLine($"数量：{count}，转 List：{string.Join(",", list)}");
\`\`\`

### 八、实战 demo：成绩分析

\`\`\`csharp
record Student(string Name, int Score, string ClassName);

var students = new List<Student> {
    new("张三", 85, "A"),
    new("李四", 92, "A"),
    new("王五", 78, "B"),
    new("赵六", 95, "B"),
    new("钱七", 60, "A"),
    new("孙八", 88, "B")
};

// 1. 找出 A 班成绩 > 80 的学生
var topA = students
    .Where(s => s.ClassName == "A" && s.Score > 80)
    .OrderByDescending(s => s.Score);
Console.WriteLine("A 班优秀：");
foreach (var s in topA) Console.WriteLine($"  {s.Name}: {s.Score}");

// 2. 各班平均分
var avgByClass = students
    .GroupBy(s => s.ClassName)
    .Select(g => new { Class = g.Key, Avg = g.Average(s => s.Score) });
Console.WriteLine("各班平均：");
foreach (var x in avgByClass) Console.WriteLine($"  {x.Class}: {x.Avg:F1}");

// 3. 总分 Top 3
var top3 = students.OrderByDescending(s => s.Score).Take(3);
Console.WriteLine("Top 3：");
foreach (var s in top3) Console.WriteLine($"  {s.Name}: {s.Score}");
\`\`\`

### 九、小结

- ⭐⭐ LINQ 用声明式语法查询数据。
- 方法语法（lambda）日常首选，查询语法（SQL）特殊场景。
- ⭐⭐ 基础：Where / Select / OrderBy / Distinct / Take / Skip。
- ⭐⭐ 聚合：Count / Sum / Average / Min / Max / Aggregate。
- 链式组合 + 延迟执行是 LINQ 强大之处。`,
  },

  // ============================================================
  // 第二十九章：LINQ 进阶
  // ============================================================
  {
    id: 'csharp3-ch29',
    group: '第六部分 委托事件与 LINQ',
    icon: '🚀',
    title: '第二十九章 LINQ 进阶',
    content: `## 第二十九章　LINQ 进阶

这一章讲透 LINQ 进阶操作——GroupBy 分组、Join 联表、聚合复杂、SelectMany 平铺、量词操作、生成操作——处理任何复杂数据场景。

### 一、GroupBy 分组 ⭐⭐

\`\`\`csharp
record Student(string Name, string Class, int Score);

var students = new List<Student> {
    new("张三", "A", 85),
    new("李四", "A", 92),
    new("王五", "B", 78),
    new("赵六", "B", 95),
    new("钱七", "A", 60),
    new("孙八", "B", 88)
};

// 按班级分组
var byClass = students.GroupBy(s => s.Class);

foreach (var group in byClass) {
    Console.WriteLine($"班级 {group.Key}：");
    foreach (var s in group) {
        Console.WriteLine($"  {s.Name}: {s.Score}");
    }
}

// 分组 + 聚合：每班统计
var stats = students.GroupBy(s => s.Class).Select(g => new {
    Class = g.Key,
    Count = g.Count(),
    Avg = g.Average(s => s.Score),
    Max = g.Max(s => s.Score),
    Min = g.Min(s => s.Score)
});

Console.WriteLine("班级统计：");
foreach (var stat in stats) {
    Console.WriteLine($"  {stat.Class}：{stat.Count}人，平均 {stat.Avg:F1}，最高 {stat.Max}，最低 {stat.Min}");
}
\`\`\`

### 二、Join 联表查询 ⭐⭐

\`\`\`csharp
record Student(int Id, string Name);
record Course(int Id, string Title, int StudentId);

var students = new List<Student> {
    new(1, "张三"),
    new(2, "李四")
};

var courses = new List<Course> {
    new(101, "数学", 1),
    new(102, "英语", 1),
    new(103, "物理", 2)
};

// Join：类似 SQL 的 INNER JOIN
var result = students.Join(
    courses,
    s => s.Id,           // 学生键
    c => c.StudentId,    // 课程外键
    (s, c) => new { s.Name, Course = c.Title }  // 结果
);

foreach (var x in result) {
    Console.WriteLine($"{x.Name} 选 {x.Course}");
}

// GroupJoin：左连接 + 分组
var grouped = students.GroupJoin(
    courses,
    s => s.Id,
    c => c.StudentId,
    (s, cs) => new { s.Name, Courses = cs.Select(c => c.Title).ToList() }
);

foreach (var x in grouped) {
    Console.WriteLine($"{x.Name}：{string.Join(",", x.Courses)}");
}
\`\`\`

### 三、SelectMany 平铺 ⭐⭐

\`\`\`csharp
// 班级 -> 学生列表：嵌套
var class1 = new {
    Name = "A",
    Students = new[] { "张三", "李四", "王五" }
};
var class2 = new {
    Name = "B",
    Students = new[] { "赵六", "钱七" }
};
var classes = new[] { class1, class2 };

// SelectMany：把嵌套平铺成一维
var allStudents = classes.SelectMany(c => c.Students);
Console.WriteLine($"所有学生：{string.Join(",", allStudents)}");

// 实战：扁平化字典值
var dict = new Dictionary<string, List<int>> {
    ["A"] = { 1, 2, 3 },
    ["B"] = { 4, 5 }
};
var allValues = dict.SelectMany(kv => kv.Value);
Console.WriteLine($"所有值：{string.Join(",", allValues)}");
\`\`\`

### 四、量词操作符 ⭐

\`\`\`csharp
int[] nums = { 1, 2, 3, 4, 5 };

// Contains / Any / All
Console.WriteLine($"包含 3：{nums.Contains(3)}");
Console.WriteLine($"有 > 10：{nums.Any(n => n > 10)}");
Console.WriteLine($"全 > 0：{nums.All(n => n > 0)}");

// SequenceEqual：序列相等
int[] a = { 1, 2, 3 };
int[] b = { 1, 2, 3 };
Console.WriteLine($"a == b：{a.SequenceEqual(b)}");  // True
\`\`\`

### 五、生成操作符

\`\`\`csharp
// Range：生成范围
var range = Enumerable.Range(1, 10);  // 1 到 10
Console.WriteLine($"Range: {string.Join(",", range)}");

// Repeat：重复元素
var repeat = Enumerable.Repeat("Hi", 3);
Console.WriteLine($"Repeat: {string.Join(",", repeat)}");

// Empty：空序列
var empty = Enumerable.Empty<int>();
Console.WriteLine($"Empty: {empty.Count()}");
\`\`\`

### 六、Set 操作符

\`\`\`csharp
int[] a = { 1, 2, 3, 4 };
int[] b = { 3, 4, 5, 6 };

Console.WriteLine($"并：{string.Join(",", a.Union(b))}");
Console.WriteLine($"交：{string.Join(",", a.Intersect(b))}");
Console.WriteLine($"差 A-B：{string.Join(",", a.Except(b))}");
Console.WriteLine($"去重：{string.Join(",", a.Distinct())}");
\`\`\`

### 七、实战 demo：销售数据多维分析

\`\`\`csharp
record Sale(string Product, string Region, decimal Amount, DateTime Date);

var sales = new List<Sale> {
    new("笔记本", "华北", 12000m, new DateTime(2026, 1, 5)),
    new("手机", "华北", 8000m, new DateTime(2026, 1, 8)),
    new("笔记本", "华南", 15000m, new DateTime(2026, 1, 10)),
    new("手机", "华南", 9000m, new DateTime(2026, 1, 12)),
    new("笔记本", "华东", 18000m, new DateTime(2026, 1, 15))
};

// 1. 各产品总销售额
var byProduct = sales.GroupBy(s => s.Product)
    .Select(g => new { Product = g.Key, Total = g.Sum(s => s.Amount) });
Console.WriteLine("产品销售：");
foreach (var x in byProduct) {
    Console.WriteLine($"  {x.Product}: ¥{x.Total:N0}");
}

// 2. 各区域平均订单金额
var byRegion = sales.GroupBy(s => s.Region)
    .Select(g => new { Region = g.Key, Avg = g.Average(s => s.Amount) });
Console.WriteLine("区域平均：");
foreach (var x in byRegion) {
    Console.WriteLine($"  {x.Region}: ¥{x.Avg:N0}");
}

// 3. 销售额 > 10000 的订单，按金额排序
var bigOrders = sales.Where(s => s.Amount > 10000).OrderByDescending(s => s.Amount);
Console.WriteLine("大额订单：");
foreach (var s in bigOrders) {
    Console.WriteLine($"  {s.Product} {s.Region}: ¥{s.Amount:N0}");
}
\`\`\`

### 八、小结

- ⭐⭐ GroupBy：分组 + 聚合。
- ⭐⭐ Join：联表查询，GroupJoin 左连接。
- ⭐⭐ SelectMany：嵌套平铺。
- 量词：Any / All / Contains。
- 元素：First / FirstOrDefault / Single。
- 集合：Union / Intersect / Except。`,
  },

  // ============================================================
  // 第三十章：扩展方法与函数式编程
  // ============================================================
  {
    id: 'csharp3-ch30',
    group: '第六部分 委托事件与 LINQ',
    icon: '🧩',
    title: '第三十章 扩展方法与函数式编程',
    content: `## 第三十章　扩展方法与函数式编程

扩展方法让你给已有类型"加方法"——LINQ 就是基于它实现的。这一章讲透扩展方法定义、this 修饰符、链式调用、函数式编程思想（Map/Filter/Reduce）。

### 一、扩展方法基础 ⭐⭐

\`\`\`csharp
// 扩展方法：给 string 加一个 WordCount 方法
static class StringExtensions {
    // this 关键字：扩展的类型
    public static int WordCount(this string s) {
        if (string.IsNullOrEmpty(s)) return 0;
        return s.Split(new[] { ' ', '\\t', '\\n' }, StringSplitOptions.RemoveEmptyEntries).Length;
    }

    public static bool IsEmail(this string s) {
        return !string.IsNullOrEmpty(s) && s.Contains('@') && s.Contains('.');
    }

    public static string Truncate(this string s, int maxLen, string suffix = "...") {
        return s.Length <= maxLen ? s : s.Substring(0, maxLen) + suffix;
    }
}

string text = "Hello World C# 教程";
Console.WriteLine($"字数：{text.WordCount()}");  // 4
Console.WriteLine($"a@b.com 是邮箱：{"a@b.com".IsEmail()}");  // True
Console.WriteLine($"截断：{"Hello World".Truncate(5)}");  // Hello...
\`\`\`

> ⭐⭐ **扩展方法** = 给已有类型加方法（无继承）。LINQ 全部基于它。

### 二、扩展方法实现原理

\`\`\`csharp
// 实际上是静态方法，编译器把 string.WordCount() 翻译成 StringExtensions.WordCount(string)
"hello".WordCount();
// 等同于
StringExtensions.WordCount("hello");

// 限制：
// 1. 必须是静态类的静态方法
// 2. 第一个参数用 this 修饰
// 3. 不能访问原类型的私有成员
\`\`\`

### 三、链式扩展方法 ⭐⭐

\`\`\`csharp
// 自定义链式调用
static class IntExtensions {
    public static int Times(this int n, Action action) {
        for (int i = 0; i < n; i++) action();
        return n;
    }
}

5.Times(() => Console.WriteLine("Hi"));  // 输出 5 次 Hi
Console.WriteLine($"返回值：{5.Times(() => { })}");  // 5

// 实战：链式字符串处理
static class ChainExtensions {
    public static string Pipe(this string s, Func<string, string> f) => f(s);
}

string result = "Hello World"
    .Pipe(s => s.ToUpper())
    .Pipe(s => s.Replace(" ", "_"))
    .Pipe(s => $"[{s}]");

Console.WriteLine($"链式：{result}");  // [HELLO_WORLD]
\`\`\`

### 四、Map / Filter / Reduce 函数式思维 ⭐

\`\`\`csharp
// Map = Select：转换
int[] nums = { 1, 2, 3, 4, 5 };
var squared = nums.Select(x => x * x);
Console.WriteLine($"Map: {string.Join(",", squared)}");

// Filter = Where：过滤
var evens = nums.Where(x => x % 2 == 0);
Console.WriteLine($"Filter: {string.Join(",", evens)}");

// Reduce = Aggregate：归约
int sum = nums.Aggregate((a, b) => a + b);
Console.WriteLine($"Reduce: {sum}");

// 链式：filter + map + reduce
int sumOfSquaresOfEvens = nums
    .Where(x => x % 2 == 0)         // filter
    .Select(x => x * x)              // map
    .Aggregate((a, b) => a + b);    // reduce
Console.WriteLine($"复合：{sumOfSquaresOfEvens}");  // 4+16 = 20
\`\`\`

> ⭐ **函数式编程思维**：数据 = 流水线，每一步是纯函数转换。LINQ 就是 C# 的函数式。

### 五、实战 demo：自定义 LINQ 风格 API

\`\`\`csharp
static class FunctionalExtensions {
    // Map：转换
    public static IEnumerable<TResult> Map<T, TResult>(this IEnumerable<T> source, Func<T, TResult> f) {
        foreach (var item in source) yield return f(item);
    }

    // Filter：过滤
    public static IEnumerable<T> Filter<T>(this IEnumerable<T> source, Func<T, bool> f) {
        foreach (var item in source) if (f(item)) yield return item;
    }

    // Reduce：归约
    public static T Reduce<T>(this IEnumerable<T> source, Func<T, T, T> f) {
        using var iter = source.GetEnumerator();
        if (!iter.MoveNext()) throw new InvalidOperationException("Empty");
        T acc = iter.Current;
        while (iter.MoveNext()) acc = f(acc, iter.Current);
        return acc;
    }
}

int[] data = { 1, 2, 3, 4, 5 };
int sum2 = data.Filter(x => x % 2 == 0).Map(x => x * x).Reduce((a, b) => a + b);
Console.WriteLine($"函数式：{sum2}");  // 4+16 = 20
\`\`\`

### 六、扩展方法 vs 继承 ⭐

\`\`\`csharp
// 扩展方法的局限：
// 1. 不能访问私有成员
// 2. 不能重写（基类方法优先于扩展）
// 3. 不能用于静态方法调用
// 4. IDE 智能提示可能分散

// 什么时候用扩展方法：
// 1. 给第三方类库加方法
// 2. 给 sealed 类加方法
// 3. 工具方法组织
\`\`\`

### 七、小结

- ⭐⭐ 扩展方法：\`this\` 修饰第一个参数，给现有类型加方法。
- ⭐ 扩展方法 = 静态方法的语法糖。
- LINQ 全基于扩展方法。
- 函数式：Map/Filter/Reduce 链式处理。
- 扩展方法不能访问私有成员，sealed 类也能扩展。`,
  },
];

export { chapters };
