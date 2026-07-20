// =============================================================
// C# 从入门到精通大全 - 第六批章节（第六部分 委托事件与 LINQ，共 6 章）
// -------------------------------------------------------------
// 本批包含 6 章：
//   csharp2-ch27 : 第二十七章 委托 Delegate
//   csharp2-ch28 : 第二十八章 事件 Event
//   csharp2-ch29 : 第二十九章 Lambda 表达式
//   csharp2-ch30 : 第三十章 LINQ 查询表达式
//   csharp2-ch31 : 第三十一章 LINQ 方法语法进阶
//   csharp2-ch32 : 第三十二章 扩展方法
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// ⭐ 标记为日常开发高频知识点；LINQ 章节为 C# 日常开发核心技能，重点讲解。
// =============================================================

const chapters = [
  // ============================================================
  // 第二十七章：委托 Delegate
  // ============================================================
  {
    id: 'csharp2-ch27',
    group: '第六部分 委托事件与 LINQ',
    icon: '📡',
    title: '第二十七章 委托 Delegate',
    content: `## 第二十七章　委托 Delegate

委托是 C# 的「类型安全函数指针」——把方法当数据传来传去。它是事件、Lambda、LINQ 的基石，搞懂委托才能搞懂后面所有功能。

### 一、为什么需要委托

先看一个最朴素的场景：你写了一个排序方法，但「排序规则」想交给调用者决定。

\`\`\`csharp
// 没有 delegate 的写法：规则写死，每次改规则都要改方法
void PrintSorted(int[] nums, bool ascending)
{
    Array.Sort(nums);
    if (!ascending) Array.Reverse(nums);
    foreach (var n in nums) Console.Write(n + " ");
    Console.WriteLine();
}
\`\`\`

如果将来又要「按绝对值」「按奇偶」……每加一种规则就得改方法。**委托就是把"规则"参数化**——把方法当参数传。

### 二、定义委托：delegate 关键字

\`\`\`csharp
using System;

// 局部函数：顶级语句中可以直接定义方法，不用放在类里
int Add(int a, int b) => a + b;
int Sub(int a, int b) => a - b;
int Mul(int a, int b) => a * b;

// 委托变量装方法（Func/Action 是内置委托，这里自定义 delegate 演示原理）
MathOp op = Add;
Console.WriteLine(op(3, 4));      // 7

op = Sub;
Console.WriteLine(op(3, 4));      // -1

op = Mul;
Console.WriteLine(op(3, 4));      // 12

// 【委托原理】为什么 delegate 是类型声明，必须放可执行代码之后？
// delegate 关键字在编译时会生成一个完整的类（继承自 MulticastDelegate），
// 它属于"类型定义"而非"执行语句"。C# 顶级语句要求：
//   using 指令 → 可执行代码 → 类型声明（class/delegate/struct/interface/record/enum）
// 局部函数（上面的 Add/Sub/Mul）是方法级成员，可以在可执行代码前后任意位置。
delegate int MathOp(int a, int b);
\`\`\`

要点：
- \`delegate int MathOp(int a, int b);\` 声明「方法签名」——返回 int、两个 int 参数。
- 委托变量能装任何匹配签名的方法。
- 调用委托变量就像调用方法：\`op(3, 4)\`。

> ⭐ 委托 = 类型安全的函数指针：编译器保证你只能装匹配签名的方法，传错就编译失败。

### 三、内置委托：Action 与 Func

实际开发 95% 不需要自定义 \`delegate\`，.NET 内置两个泛型委托覆盖一切场景：

\`\`\`csharp
// Action<T>：无返回值（void）
Action<string> log = msg => Console.WriteLine($"[LOG] {msg}");
log("启动服务");
log("处理完成");

// Action 无参数版本
Action sayHi = () => Console.WriteLine("Hi!");
sayHi();

// Action<T1, T2>：两个参数
Action<string, int> printUser = (name, age) =>
    Console.WriteLine($"{name} - {age}");
printUser("张三", 28);

// Func<T, TResult>：有返回值
// Func<int, int>：传入 int，返回 int
Func<int, int> square = x => x * x;
Console.WriteLine(square(5));     // 25

// Func<string, int>：传入 string，返回 int
Func<string, int> len = s => s.Length;
Console.WriteLine(len("hello"));  // 5

// Func 不带参数：Func<int>
Func<int> rollDice = () => Random.Shared.Next(1, 7);
Console.WriteLine(rollDice());
\`\`\`

记忆口诀：
- **Action**：干完就走，不返回。最多 16 个参数。
- **Func**：最后那个类型是返回值。最多 16 个参数。

> ⭐ 面试点：\`Action\` 返回 void，\`Func\` 必须有返回值。\`Func<int>\` 表示「返回 int 不带参」，\`Func<int,string>\` 表示「传入 int 返回 string」。

### 四、Predicate<T>：谓词委托

专门表示「返回 bool」的判断函数，常用于集合查找。

\`\`\`csharp
// Predicate<T> 等价于 Func<T, bool>
Predicate<int> isEven = n => n % 2 == 0;
Predicate<string> isLong = s => s.Length > 10;

Console.WriteLine(isEven(4));      // True
Console.WriteLine(isLong("hi"));  // False

// List 的 Find/FindAll 接受 Predicate
var nums = new List<int> { 1, 2, 3, 4, 5, 6 };
int firstEven = nums.Find(isEven);             // 2
var allEven = nums.FindAll(isEven);            // [2,4,6]
\`\`\`

### 五、多播委托：+ / += / -= ⭐

一个委托变量能装多个方法，调用时按顺序全部执行——叫「多播」。

\`\`\`csharp
void Greet1() => Console.WriteLine("你好");
void Greet2() => Console.WriteLine("Hello");
void Greet3() => Console.WriteLine("こんにちは");

Action greet = Greet1;
greet += Greet2;     // 追加
greet += Greet3;
greet();             // 三行都打印

greet -= Greet2;     // 移除
greet();             // 只剩 Greet1 和 Greet3
\`\`\`

注意：
- \`+=\` 返回**新委托对象**，不是修改原委托（委托是不可变的）。
- \`-=\` 移除时按签名匹配，移除最后一个匹配项。
- 同一方法可加多次，调用就执行多次。
- 多播委托调用拿不到各方法的返回值（只能拿到最后一个），所以**有返回值的委托别用多播**。

### 六、委托做参数：回调模式 ⭐

这是委托最经典的用途——把"做什么"作为参数传进来。

\`\`\`csharp
// 框架方法：它不知道"怎么处理"，只管流程
void Process(int[] data, Func<int, int> transform)
{
    for (int i = 0; i < data.Length; i++)
        data[i] = transform(data[i]);
}

// 调用方决定具体规则
var nums = new[] { 1, 2, 3, 4, 5 };

Process(nums, x => x * 10);    // 每个元素 ×10
Console.WriteLine(string.Join(",", nums));   // 10,20,30,40,50

Process(nums, x => x + 1);     // 每个元素 +1
Console.WriteLine(string.Join(",", nums));   // 11,21,31,41,51
\`\`\`

这就是 LINQ 的核心思路——\`Select\`、\`Where\` 等都接受委托参数，规则由你决定。

### 七、委托实战 demo：策略模式

把不同算法包成委托，运行时切换策略：

\`\`\`csharp
decimal ApplyDiscount(decimal price, Func<decimal, decimal> strategy) => strategy(price);

var strategies = new Dictionary<string, Func<decimal, decimal>>
{
    ["normal"]  = p => p,
    ["vip"]     = p => p * 0.8m,
    ["svip"]    = p => p * 0.6m,
    ["coupon"]  = p => p - 50 > 0 ? p - 50 : 0
};

decimal price = 200m;
foreach (var kv in strategies)
    Console.WriteLine($"{kv.Key,-7}: {ApplyDiscount(price, kv.Value)}");
// normal : 200
// vip    : 160
// svip   : 120
// coupon : 150
\`\`\`

### 小结

- 委托是「类型安全函数指针」，把方法当数据传递。
- 99% 用 \`Action\`（无返回）和 \`Func\`（有返回）两个内置泛型委托。
- \`Predicate<T>\` 等价于 \`Func<T, bool>\`，专用于判断。
- \`+=\` / \`-=\` 实现多播——一个委托调用多个方法。
- **委托做参数** = 回调模式 = 策略模式 = LINQ 的根基。
- 自定义 \`delegate\` 只在需要给类型起语义化名字时才用。`,
  },

  // ============================================================
  // 第二十八章：事件 Event
  // ============================================================
  {
    id: 'csharp2-ch28',
    group: '第六部分 委托事件与 LINQ',
    icon: '🎉',
    title: '第二十八章 事件 Event',
    content: `## 第二十八章　事件 Event

事件 = 受限的委托。「发布者」触发，「订阅者」响应。GUI 按钮、消息总线、状态变更通知都靠它。

### 一、最朴素的需求：状态变化通知

假设有个温度计，温度超过阈值要通知报警器：

\`\`\`csharp
class Thermometer
{
    private int _temp;
    public int Temperature
    {
        get => _temp;
        set
        {
            _temp = value;
            // 这里要"通知"外部——但 Thermometer 不知道谁在监听
        }
    }
}
\`\`\`

问题：温度计怎么"通知"外界？**最直接的做法是暴露一个委托字段**。

### 二、用委托字段实现：能跑但有坑

\`\`\`csharp
using System;

var t = new Thermometer();
t.OnChanged = temp => Console.WriteLine($"温度更新: {temp}°C");  // 订阅（用=覆盖）
t.Temperature = 30;   // 输出: 温度更新: 30°C

// 坑1：外部可以"覆盖"所有订阅者——用=直接赋值，之前的订阅全没了
t.OnChanged = temp => Console.WriteLine("我被替换了");
t.Temperature = 40;    // 只输出: 我被替换了

// 坑2：外部甚至能直接触发事件——发布者和订阅者的权限边界被打破
t.OnChanged?.Invoke(999);  // 温度计没变，却"假装"通知了

// 【发布订阅模式问题】为什么公开委托字段不好？
// 1. 封装性差：外部可以用=覆盖整个订阅链，而不是+=追加
// 2. 安全性差：外部可以随便Invoke触发，只有发布者自己才应该触发
// 3. 这就是 event 关键字要解决的问题——给委托加"访问控制"
class Thermometer
{
    public Action<int>? OnChanged;   // 公开委托字段（没有event保护）

    private int _temp;
    public int Temperature
    {
        get => _temp;
        set
        {
            _temp = value;
            OnChanged?.Invoke(value);  // 触发通知
        }
    }
}
\`\`\`

问题：
1. 外部能覆盖整个订阅列表（用 \`=\` 而非 \`+=\`）。
2. 外部能直接调 \`Invoke\` 触发事件——只有发布者本人应该触发。

\`event\` 关键字就是为解决这两个坑而生。

### 三、event 关键字 ⭐

\`\`\`csharp
using System;

var t = new Thermometer();
t.OnChanged += temp => Console.WriteLine($"订阅1: {temp}°C");
t.OnChanged += temp => Console.WriteLine($"订阅2: {temp}°C");

// t.OnChanged = ...      // 编译错误：事件只能出现在 += 或 -= 左侧
// t.OnChanged.Invoke(5); // 编译错误：事件只能由发布者触发

t.Temperature = 30;   // 两条订阅都打印

// 【为什么用event关键字？】
// event 本质是给委托字段加了一层"访问封装"：
// 1. 外部代码：只能用 += / -= 来订阅/退订，不能用=赋值覆盖，不能Invoke触发
// 2. 类内部代码：可以正常Invoke，也可以赋值（通常在构造函数里初始化）
// 这就像给委托加了个"只写追加"的属性，完美实现发布-订阅的权限边界：
//   发布者（类内部）→ 持有触发权
//   订阅者（外部）→ 只能订阅/退订，不能干涉其他订阅者，也不能越权触发
class Thermometer
{
    // 加 event 关键字：限制外部只能 += / -=，不能 = 或 Invoke
    public event Action<int>? OnChanged;

    private int _temp;
    public int Temperature
    {
        get => _temp;
        set
        {
            _temp = value;
            OnChanged?.Invoke(value);   // 只有类内部能 Invoke
        }
    }
}
\`\`\`

要点：
- \`event\` 加在委托字段上，外部只能 \`+=\` / \`-=\`，无法覆盖、无法触发。
- 内部（类自己的方法）才能调 \`Invoke\` 触发。
- \`= null\` 判空时用 \`?.Invoke()\` 安全触发。

> ⭐ 事件 vs 普通委托：事件是"封装"的委托——订阅者只能订阅/退订，不能改不能触发。这就是封装的价值。

### 四、发布订阅模式

标准的发布订阅模式分两个角色：

\`\`\`csharp
using System;

// 2. 订阅者：注册 + 响应（先写可执行代码）
var btn = new Button();
btn.Clicked += () => Console.WriteLine("处理1: 提交表单");
btn.Clicked += () => Console.WriteLine("处理2: 写日志");
btn.Clicked += () => Console.WriteLine("处理3: 弹通知");

btn.Click();
// 按钮被点击
// 处理1: 提交表单
// 处理2: 写日志
// 处理3: 弹通知

// 退订：必须保存委托引用才能移除，匿名Lambda无法单独移除
Action handler = () => Console.WriteLine("临时订阅");
btn.Clicked += handler;
btn.Clicked -= handler;

// 【发布订阅模式核心】松耦合的本质
// 发布者（Button）根本不知道有谁订阅了它——它只负责"触发事件"
// 订阅者只负责"响应事件"，互不影响，也不依赖发布者的内部实现
// 这就是事件的精髓：对象之间通过事件通信，而不是直接引用彼此
class Button
{
    public event Action? Clicked;

    public void Click()
    {
        Console.WriteLine("按钮被点击");
        Clicked?.Invoke();   // 通知所有订阅者（内部触发，外部无权调用）
    }
}
\`\`\`

发布者根本不知道有谁订阅——这是**松耦合**，发布者跟订阅者解耦。

### 五、标准事件模式：sender + EventArgs ⭐

.NET 事件约定俗成的签名：\`void Handler(object sender, EventArgs e)\`

- \`sender\`：触发事件的对象（通常是 \`object\`）。
- \`e\`：事件参数，继承 \`EventArgs\`。

\`\`\`csharp
using System;

// 4. 订阅：可执行代码在前
var t = new Thermometer();
t.TempChanged += (sender, e) =>
{
    // sender 是触发事件的对象，用!表示断言不为null
    var thermo = (Thermometer)sender!;
    Console.WriteLine($"[{thermo.GetHashCode():X}] {e.OldTemp}°C → {e.NewTemp}°C (Δ{e.Delta})");
};

t.Temperature = 25;
t.Temperature = 30;

// 【标准事件模式约定】为什么用 object sender + EventArgs e？
// 这是 .NET 的统一约定：所有事件处理器签名一致，便于通用处理
// - sender: 谁触发了事件（发布者自己），类型object是为了统一所有发布者
// - e: 事件参数，继承自 EventArgs，携带事件相关数据
// EventHandler<T> 等价于 delegate void EventHandler<TEventArgs>(object sender, TEventArgs e);
// 好处：不用为每个事件自定义 delegate 类型，统一签名

// 自定义事件参数类：携带事件上下文数据
class TemperatureChangedEventArgs : EventArgs
{
    public int OldTemp { get; }
    public int NewTemp { get; }
    public int Delta => NewTemp - OldTemp;

    public TemperatureChangedEventArgs(int oldTemp, int newTemp)
    {
        OldTemp = oldTemp;
        NewTemp = newTemp;
    }
}

// 发布者
class Thermometer
{
    private int _temp;
    public int Temperature
    {
        get => _temp;
        set
        {
            int old = _temp;
            _temp = value;
            // 触发标准事件：this是发布者自己，new事件参数携带数据
            TempChanged?.Invoke(this, new TemperatureChangedEventArgs(old, value));
        }
    }

    // EventHandler<T> 是 .NET 内置的事件委托，不用自定义delegate
    public event EventHandler<TemperatureChangedEventArgs>? TempChanged;
}
\`\`\`

\`EventHandler<T>\` 等价于：
\`\`\`csharp
delegate void EventHandler<TEventArgs>(object sender, TEventArgs e);
\`\`\`

> ⭐ 标准 .NET 事件签名（背下来）：
> \`public event EventHandler<T>? XxxChanged;\` 其中 \`T : EventArgs\`。

### 六、事件 vs 委托

| 维度 | 委托字段 | 事件 event |
| --- | --- | --- |
| 外部赋值 | 可以 \`=\` | 不行，只能 \`+=\` / \`-=\` |
| 外部触发 | 可以 \`Invoke\` | 不行，仅类内部触发 |
| 接口声明 | 不能 | 可以 |
| 用途 | 普通回调 | 发布订阅 |

简单说：**事件 = 受控委托**。

### 七、实战 demo：按钮点击 + 温度报警

\`\`\`csharp
using System;

// 模拟 GUI 按钮系统 - 可执行代码
var form = new FormButton("SaveBtn");
var alarm = new AlarmSystem();
form.Click += alarm.OnButtonClick;  // 方法组转换，直接传实例方法
form.Click += (s, e) => Console.WriteLine($"  日志：保存按钮被点");
form.SimulateClick();

Console.WriteLine();

// 温度报警：超过 50°C 触发
var sensor = new TempSensor();
sensor.Overheated += (s, t) => Console.WriteLine($"  ⚠️ 警告：温度 {t}°C 超阈值！");
sensor.SetTemp(30);   // 无报警
sensor.SetTemp(60);   // 触发报警

// ---------- 类型声明放最后 ----------
class FormButton
{
    public string Name { get; }
    public event EventHandler<EventArgs>? Click;

    public FormButton(string name) => Name = name;

    public void SimulateClick()
    {
        Console.WriteLine($"[{Name}] 收到点击");
        Click?.Invoke(this, EventArgs.Empty);  // EventArgs.Empty 表示无参数
    }
}

class AlarmSystem
{
    // 订阅方法：签名必须匹配 EventHandler<EventArgs>
    public void OnButtonClick(object? sender, EventArgs e)
    {
        var btn = (FormButton)sender!;
        Console.WriteLine($"  报警系统：响应 {btn.Name} 点击");
    }
}

class TempSensor
{
    // 这里用 int 直接作事件参数（简单场景可以不用自定义EventArgs）
    public event EventHandler<int>? Overheated;

    public void SetTemp(int t)
    {
        Console.WriteLine($"温度: {t}°C");
        if (t > 50) Overheated?.Invoke(this, t);
    }
}
\`\`\`

### 小结

- 事件是"受限的委托"：外部只能 \`+=\` / \`-=\`，不能覆盖、不能触发。
- 发布订阅模式：发布者触发，订阅者响应，松耦合。
- 标准 .NET 事件签名：\`event EventHandler<T>? XxxChanged\`，其中 \`T : EventArgs\`。
- 自定义 \`EventArgs\` 携带事件相关数据（旧值、新值、附加信息）。
- 事件 vs 委托：事件封装了触发权限，适合"对外通知"场景；委托适合普通回调。`,
  },

  // ============================================================
  // 第二十九章：Lambda 表达式
  // ============================================================
  {
    id: 'csharp2-ch29',
    group: '第六部分 委托事件与 LINQ',
    icon: 'λ',
    title: '第二十九章 Lambda 表达式',
    content: `## 第二十九章　Lambda 表达式

Lambda 是「匿名方法的语法糖」——让你不用单独声明一个方法，直接在调用处写函数体。它是委托、事件、LINQ 的日常写法。

### 一、从委托到 Lambda 的演化

\`\`\`csharp
Func<int, int> f;

// 1. 命名方法：最古老
int DoubleIt(int x) => x * 2;
f = DoubleIt;

// 2. 匿名方法：C# 2.0 的写法（已过时，不推荐）
f = delegate(int x) { return x * 2; };

// 3. Lambda 表达式：现代写法 ⭐
f = x => x * 2;

Console.WriteLine(f(5));   // 10
\`\`\`

\`x => x * 2\` 读作「x 映射到 x*2」。Lambda 让"定义函数"变得像写表达式一样自然。

### 二、Lambda 语法 ⭐

格式：\`参数 => 表达式或语句块\`

\`\`\`csharp
// 无参数：用 () 占位
Action greet = () => Console.WriteLine("Hi");

// 一个参数：可省略 ()
Func<int, int> square = x => x * x;

// 多个参数：必须用 ()
Func<int, int, int> add = (a, b) => a + b;

// 显式类型：偶尔为了可读性或消除重载歧义
Func<int, int> sq = (int x) => x * x;

// 返回值为 void
Action<string> log = msg => Console.WriteLine($"[INFO] {msg}");
\`\`\`

记忆：\`=>\` 左边是参数，右边是函数体。\`=>\` 读作「goes to」。

### 三、表达式 Lambda vs 语句 Lambda

两种写法：

\`\`\`csharp
// 1. 表达式 Lambda：右边是单个表达式，自动 return
Func<int, int> f1 = x => x * 2;            // 等价 x => { return x * 2; }

// 2. 语句 Lambda：右边是 {} 语句块，必须显式 return
Func<int, int> f2 = x =>
{
    if (x < 0) return 0;
    var result = x * 2;
    return result;
};

Console.WriteLine(f1(5));   // 10
Console.WriteLine(f2(-3));  // 0
Console.WriteLine(f2(7));   // 14
\`\`\`

经验：能用表达式 Lambda 就用——更短更清晰。逻辑复杂（多分支、多步）才用语句 Lambda。

### 四、闭包：捕获外部变量 ⭐

Lambda 可以"看到"它外面定义的变量——这叫**闭包**。

\`\`\`csharp
using System;

int multiplier = 10;
Func<int, int> scale = x => x * multiplier;

Console.WriteLine(scale(5));   // 50

multiplier = 100;               // 改了外部变量
Console.WriteLine(scale(5));   // 500 —— 注意：Lambda 用的是"当前"的值！

// 【闭包为什么会捕获变量而不是值？】
// Lambda 编译后会生成一个隐藏的类，把捕获的外部变量作为该类的字段。
// 上面的代码大致编译成：
//   class Closure { public int multiplier; public int Scale(int x) => x * multiplier; }
//   var closure = new Closure();
//   closure.multiplier = 10;
//   Func<int,int> scale = closure.Scale;
// 所以你改 multiplier 实际上是改 closure.multiplier 字段，调用时当然读最新值。
// 这就是为什么"闭包延长变量生命周期"——变量被搬到闭包对象上，只要委托活着，对象就不被GC。
\`\`\`

关键点：
- Lambda 捕获的是**变量本身（引用）**，不是变量当时的值的拷贝。
- 外部变量改变，Lambda 之后调用时拿到的是新值。
- 闭包延长了局部变量的生命周期——它不会按方法退出就被 GC 回收，只要 Lambda 还活着。

#### 经典陷阱：循环变量捕获

\`\`\`csharp
using System;
using System.Collections.Generic;

var actions = new List<Action>();

// C# 5+ 中 for 循环每次迭代的 i 都是独立副本（已修复老版本的坑）
for (int i = 0; i < 3; i++)
{
    // 如果你要兼容老版本/确保安全，可在循环内显式复制：int copy = i;
    actions.Add(() => Console.Write(i + " "));
}
foreach (var a in actions) a();   // C# 5+ 输出 "0 1 2 "
Console.WriteLine();

// foreach 循环从 C# 5 开始每次迭代也是独立变量，天然安全
var more = new List<Action>();
foreach (var j in new[] { 10, 20, 30 })
{
    more.Add(() => Console.Write(j + " "));
}
foreach (var a in more) a();   // "10 20 30 "
Console.WriteLine();

// 【老版本为什么会输出"3 3 3"？】
// C# 4及之前，for循环的i只在循环外声明一次，所有闭包共享同一个i变量；
// 循环结束后i=3，调用委托时读到的都是同一个i=3。
// C# 5 修复了这个设计问题：把每次迭代的循环变量"提升"为独立副本，闭包各捕各的。
\`\`\`

> ⭐ 闭包陷阱：循环变量在 C# 5 之后 foreach 会自动每次复制；for 循环若担心可显式 \`int copy = i;\`。

### 五、Lambda 作参数：LINQ 的灵魂

Lambda 最常见用法：传给 LINQ 方法，描述「怎么筛选/转换」。

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

var nums = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

// Where 接受 Func<T, bool>（谓词），过滤符合条件的元素
// 注意：此时只是"定义查询"，不会立刻执行——LINQ延迟执行特性
var evens = nums.Where(n => n % 2 == 0);
Console.WriteLine(string.Join(",", evens));   // 2,4,6,8,10（枚举时才真正执行）

// Select 接受 Func<T, TResult>，投影/转换每个元素
var squares = nums.Select(n => n * n);
Console.WriteLine(string.Join(",", squares));   // 1,4,9,16,25,36,49,64,81,100

// OrderBy 接受 Func<T, TKey>，按 key 排序
var byRemainder = nums.OrderBy(n => n % 3);
Console.WriteLine(string.Join(",", byRemainder));
\`\`\`

没有 Lambda，LINQ 根本没法用——每个查询都得单独写个方法。

### 六、常用场景 demo ⭐

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

// 1. List<T>.Find / FindAll：用 Predicate<T>（返回bool的委托）
var users = new List<User>
{
    new("张三", 28),
    new("李四", 35),
    new("王五", 22),
    new("赵六", 40)
};

var firstOver30 = users.Find(u => u.Age > 30);          // 李四（第一个匹配）
var allOver30 = users.FindAll(u => u.Age > 30);          // [李四, 赵六]（所有匹配）
int idx = users.FindIndex(u => u.Name == "王五");          // 2（索引从0开始）
bool hasOld = users.Exists(u => u.Age >= 40);             // true（是否存在）
var young = users.FindAll(u => u.Age < 30);              // [张三, 王五]

// 2. List<T>.Sort：用 Comparison<T>（返回int：负/0/正表示小于/等于/大于）
users.Sort((a, b) => a.Age.CompareTo(b.Age));            // 按年龄升序

// 3. List<T>.ForEach：Action<T>（无返回值的委托）
users.ForEach(u => Console.WriteLine(u));

// 4. Dictionary 转换：ToDictionary 立即执行，把LINQ结果物化成字典
var nameToAge = users.ToDictionary(u => u.Name, u => u.Age);

// 5. 字符串处理：Split后Trim，最后ToList()立即执行避免延迟查询问题
var names = "Zhang San, Li Si, Wang Wu";
var parts = names.Split(',').Select(s => s.Trim()).ToList();
Console.WriteLine(string.Join("|", parts));   // Zhang San|Li Si|Wang Wu

// record 是类型声明，放所有可执行代码之后（C# 顶级语句要求：类型在执行代码后）
// record 是不可变的数据类型，适合存数据，编译器自动生成构造函数/Equals/ToString等
record User(string Name, int Age);
\`\`\`

### 七、方法组转换

当你想传一个已有的命名方法，可以省略参数，直接写方法名——叫「方法组转换」。

\`\`\`csharp
int Square(int x) => x * x;

// 完整写法
Func<int, int> f1 = x => Square(x);
// 方法组转换：等价但更短
Func<int, int> f2 = Square;

// LINQ 里也很常见
var nums = new[] { "1", "2", "3", "-4" };
var ints = nums.Select(int.Parse).ToList();           // 方法组
Console.WriteLine(string.Join(",", ints));            // 1,2,3,-4

// Console.WriteLine 也是方法组
new[] { 1, 2, 3 }.ToList().ForEach(Console.WriteLine);
\`\`\`

> 方法组转换让代码更紧凑，但只有签名完全匹配时才能用。

### 八、Lambda 实战 demo：简易计算器

\`\`\`csharp
var ops = new Dictionary<string, Func<double, double, double>>
{
    ["+"] = (a, b) => a + b,
    ["-"] = (a, b) => a - b,
    ["*"] = (a, b) => a * b,
    ["/"] = (a, b) => b == 0 ? double.NaN : a / b
};

double Calc(double a, string op, double b) =>
    ops.TryGetValue(op, out var fn) ? fn(a, b) : throw new ArgumentException($"未知运算符 {op}");

Console.WriteLine(Calc(10, "+", 3));   // 13
Console.WriteLine(Calc(10, "*", 3));   // 30
Console.WriteLine(Calc(10, "/", 4));   // 2.5

// 加新运算符只改字典，不改 Calc 函数
ops["^"] = Math.Pow;
Console.WriteLine(Calc(2, "^", 10));   // 1024
\`\`\`

### 小结

- Lambda 是匿名方法的语法糖：\`参数 => 表达式或语句块\`。
- 表达式 Lambda 短小直接，语句 Lambda 处理复杂逻辑。
- **闭包**捕获外部变量——是变量本身，不是当时的值。
- Lambda 当参数 = LINQ 的灵魂，描述「筛选/转换/排序规则」。
- 方法组转换：\`Func<int,int> f = Square;\` 等价 \`f = x => Square(x)\`，但更紧凑。
- Lambda 让代码"就地写规则"，不必为每个小函数单独命名。`,
  },

  // ============================================================
  // 第三十章：LINQ 查询表达式
  // ============================================================
  {
    id: 'csharp2-ch30',
    group: '第六部分 委托事件与 LINQ',
    icon: '🔍',
    title: '第三十章 LINQ 查询表达式',
    content: `## 第三十章　LINQ 查询表达式

LINQ（Language Integrated Query，语言集成查询）是 C# 最强特性之一——用统一语法查询任何数据源：集合、数据库、XML、JSON……日常开发**几乎每段业务代码都在用**。

> ⭐ LINQ 是 C# 日常开发核心技能，本章起后面几章都是重点，多写多练。

### 一、LINQ 是什么

一句话：**用 SQL 风格的语法查询内存中的集合**。

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

// 没有 LINQ：找出偶数并排序，得手动循环
var nums = new[] { 5, 2, 8, 1, 9, 4, 7, 6 };
var result = new List<int>();
foreach (var n in nums)
    if (n % 2 == 0) result.Add(n);
result.Sort();
Console.WriteLine(string.Join(",", result));   // 2,4,6,8

// 有 LINQ：一行搞定（查询表达式语法）
// 注意：这里只是"定义查询"，还没真正执行——LINQ延迟执行
var result2 = from n in nums
             where n % 2 == 0
             orderby n
             select n;
Console.WriteLine(string.Join(",", result2));  // 2,4,6,8（此时foreach枚举才真正执行）
\`\`\`

LINQ 的价值：
1. **统一语法**：集合、数据库、XML 都用同一套查询语法。
2. **类型安全**：编译期检查，类型错了编译失败。
3. **可读性强**：声明式——说"要什么"而不是"怎么做"。
4. **可组合**：链式调用，层层精炼数据。

### 二、查询表达式语法 ⭐

类似 SQL 的语法，关键字：\`from\` / \`where\` / \`select\` / \`orderby\` / \`group\` / \`join\` / \`into\` / \`let\`。

\`\`\`csharp
var students = new[]
{
    new { Name = "张三", Age = 20, Score = 85, Class = "A" },
    new { Name = "李四", Age = 22, Score = 92, Class = "A" },
    new { Name = "王五", Age = 19, Score = 78, Class = "B" },
    new { Name = "赵六", Age = 21, Score = 88, Class = "B" },
    new { Name = "钱七", Age = 23, Score = 95, Class = "A" }
};

// 1. 基本：from + where + select
var topStudents = from s in students
                  where s.Score >= 85
                  select s;

foreach (var s in topStudents)
    Console.WriteLine($"{s.Name} - {s.Score}");
// 张三 - 85 / 李四 - 92 / 赵六 - 88 / 钱七 - 95
\`\`\`

注意：**必须以 \`from\` 开头、\`select\` 或 \`group\` 结尾**——这跟 SQL 顺序不同。

### 三、orderby：排序

\`\`\`csharp
// 按 Score 升序
var asc = from s in students
          orderby s.Score
          select s.Name;

// 按 Score 降序
var desc = from s in students
           orderby s.Score descending
           select s.Name;

// 多字段排序：先按 Class 升序，再按 Score 降序
var multi = from s in students
            orderby s.Class, s.Score descending
            select $"{s.Class} - {s.Name}({s.Score})";

foreach (var s in multi) Console.WriteLine(s);
// A - 钱七(95) / A - 李四(92) / A - 张三(85)
// B - 赵六(88) / B - 王五(78)
\`\`\`

### 四、group：分组

\`\`\`csharp
// 按 Class 分组
var byClass = from s in students
             group s by s.Class;

foreach (var g in byClass)
{
    Console.WriteLine($"班级 {g.Key}:");
    foreach (var s in g)
        Console.WriteLine($"  {s.Name} - {s.Score}");
}
// 班级 A: 张三/李四/钱七
// 班级 B: 王五/赵六

// 分组时做聚合：求各班平均分
var avg = from s in students
          group s by s.Class into g
          select new { Class = g.Key, Avg = g.Average(x => x.Score), Count = g.Count() };

foreach (var x in avg)
    Console.WriteLine($"{x.Class}: 平均 {x.Avg:F1}, {x.Count} 人");
// A: 平均 90.7, 3 人
// B: 平均 83.0, 2 人
\`\`\`

\`group X by Y\`：把 X 按 Y 的值分组，结果每组是个 \`IGrouping<TKey, T>\`，\`.Key\` 是分组键，本身可枚举拿组内元素。

### 五、join：连接 ⭐

类似 SQL JOIN，把两个集合按某个键关联。

\`\`\`csharp
var orders = new[]
{
    new { OrderId = 1, CustomerId = 100, Amount = 200 },
    new { OrderId = 2, CustomerId = 101, Amount = 350 },
    new { OrderId = 3, CustomerId = 100, Amount = 80 }
};

var customers = new[]
{
    new { Id = 100, Name = "张三" },
    new { Id = 101, Name = "李四" },
    new { Id = 102, Name = "王五" }   // 这个没订单
};

// inner join：只匹配上的
var orderWithCustomer = from o in orders
                        join c in customers on o.CustomerId equals c.Id
                        select new { o.OrderId, c.Name, o.Amount };

foreach (var x in orderWithCustomer)
    Console.WriteLine($"订单 {x.OrderId} - {x.Name} - ¥{x.Amount}");
// 订单 1 - 张三 - ¥200
// 订单 2 - 李四 - ¥350
// 订单 3 - 张三 - ¥80
\`\`\`

要点：
- \`join b in B on a.key equals b.key\`：必须用 \`equals\`，不是 \`==\`。
- 内连接——只输出能匹配上的行。

### 六、group join：左外连接

\`\`\`csharp
// 想列出所有客户，没订单的显示空
var customerOrders = from c in customers
                     join o in orders on c.Id equals o.CustomerId into cos
                     select new
                     {
                         c.Name,
                         Orders = cos,
                         Total = cos.Sum(o => o.Amount)
                     };

foreach (var x in customerOrders)
    Console.WriteLine($"{x.Name}: {x.Orders.Count()} 单, 合计 ¥{x.Total}");
// 张三: 2 单, 合计 ¥280
// 李四: 1 单, 合计 ¥350
// 王五: 0 单, 合计 ¥0
\`\`\`

\`into\` 把匹配结果"打包"成组——即便没匹配到也会得到空组（而不是过滤掉），这就是左外连接的效果。

### 七、let：临时变量

\`\`\`csharp
// 用 let 保存中间结果
var query = from s in students
            let grade = s.Score >= 90 ? "A" : s.Score >= 80 ? "B" : "C"
            select new { s.Name, Grade = grade };

foreach (var x in query)
    Console.WriteLine($"{x.Name}: {x.Grade}");
\`\`\`

\`let\` 避免在 select 里反复写复杂表达式，让查询更清晰。

### 八、LINQ to Objects：能查的对象

LINQ 操作的是「实现了 \`IEnumerable<T>\` 的对象」——所有集合都能用：

\`\`\`csharp
// 数组
int[] arr = { 3, 1, 4, 1, 5, 9, 2, 6 };
var evens = from n in arr where n % 2 == 0 select n;

// List
var list = new List<string> { "apple", "banana", "cherry" };
var longs = from s in list where s.Length > 5 select s;

// Dictionary
var dict = new Dictionary<string, int> { ["a"] = 1, ["b"] = 2 };
var pairs = from kv in dict where kv.Value > 1 select kv.Key;

// 字符串（按字符枚举）
var chars = from c in "Hello, World!" where char.IsUpper(c) select c;
Console.WriteLine(string.Join("", chars));   // HW
\`\`\`

### 九、延迟执行 vs 立即执行 ⭐

这是 LINQ **最关键的概念之一**。

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

var nums = new List<int> { 1, 2, 3, 4, 5 };

// 查询变量本身不立刻执行——只是保存了"查询逻辑"（一个IEnumerable迭代器）
// 此时没有任何循环、没有任何过滤发生，evens只是一个"待执行的查询计划"
var evens = from n in nums where n % 2 == 0 select n;

// 此时往 nums 加数据——因为查询还没执行，之后枚举时会看到新数据
nums.Add(6);
nums.Add(8);

// 这时才真正执行——foreach触发迭代器，逐个元素判断where条件
// 所以会看到 2,4,6,8（包括后加的）
foreach (var n in evens) Console.Write(n + " ");
Console.WriteLine();
\`\`\`

**延迟执行（Deferred Execution）**：
- \`Where\` / \`Select\` / \`OrderBy\` / \`GroupBy\` / \`Join\` 等返回 \`IEnumerable<T>\` 的方法，只定义查询，不立刻执行。
- 每次枚举（\`foreach\`、\`ToList()\`、\`Count()\` 等）才开始真正遍历源集合、应用筛选/投影逻辑。
- **为什么要延迟？**：因为可以把多个查询组合起来，最后一次遍历完成所有操作，减少中间集合分配；也能反映源集合最新数据。
- 陷阱：每次枚举都重算——如果你遍历两次，就会执行两次筛选/排序逻辑，大数据量下性能差。

**立即执行（Eager Execution）**：
- \`ToList\` / \`ToArray\` / \`ToDictionary\` / \`ToLookup\`：立刻执行查询，把结果物化成集合缓存起来。
- \`First\` / \`FirstOrDefault\` / \`Single\` / \`Count\` / \`Sum\` / \`Average\` / \`Any\` / \`All\`：这些聚合/取元素方法必须立刻执行才能得到结果。
- **为什么要ToList()？**：当你想"冻结"查询结果、避免重复计算、或者之后源集合会变化但你要当时的快照时，用ToList()立即执行。

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

var nums2 = new List<int> { 1, 2, 3, 4, 5 };
// .ToList() 立即执行查询：遍历nums2，把偶数读出来，存到新的List<int>里
var evens2 = (from n in nums2 where n % 2 == 0 select n).ToList();

nums2.Add(6);    // 此时再加，只影响nums2，evens2已经是独立的List副本了
foreach (var n in evens2) Console.Write(n + " ");   // 2 4 —— 没有 6
Console.WriteLine();
\`\`\`

> ⭐ 经验：
> - 想立刻拿到结果 / 避免重复计算：\`ToList()\` / \`ToArray()\`。
> - 想反映数据变化：保持延迟，每次 \`foreach\` 重算。
> - 永远别把延迟查询变量当"集合"用——它会反复执行！

### 十、查询表达式 vs 方法语法

\`\`\`csharp
// 查询表达式
var q1 = from s in students
         where s.Score >= 85
         orderby s.Score descending
         select s.Name;

// 方法语法（更常用）
var q2 = students
    .Where(s => s.Score >= 85)
    .OrderByDescending(s => s.Score)
    .Select(s => s.Name);

// 两者等价，结果一样
\`\`\`

实际开发里**方法语法更常用**——简洁、链式、可读性好。下一章专门讲方法语法。

但有些操作（如 \`join\`、\`let\`、\`group ... into\`）查询表达式更直观，所以两种语法都要会。

### 十一、实战 demo：数据分析

\`\`\`csharp
var sales = new[]
{
    new { Date = "2026-01-01", Product = "键盘", Amount = 200, Region = "华东" },
    new { Date = "2026-01-01", Product = "鼠标", Amount = 80, Region = "华东" },
    new { Date = "2026-01-02", Product = "键盘", Amount = 200, Region = "华北" },
    new { Date = "2026-01-02", Product = "显示器", Amount = 1500, Region = "华东" },
    new { Date = "2026-01-03", Product = "键盘", Amount = 200, Region = "华东" },
};

// 各区域销售额排行
var regionRank = from s in sales
                 group s by s.Region into g
                 let total = g.Sum(x => x.Amount)
                 orderby total descending
                 select new { Region = g.Key, Total = total };

Console.WriteLine("区域销售排行:");
foreach (var x in regionRank)
    Console.WriteLine($"  {x.Region}: ¥{x.Total}");

// 各产品销量统计
var productStat = from s in sales
                 group s by s.Product into g
                 select new
                 {
                     Product = g.Key,
                     Count = g.Count(),
                     Revenue = g.Sum(x => x.Amount)
                 };

Console.WriteLine("产品统计:");
foreach (var x in productStat)
    Console.WriteLine($"  {x.Product}: {x.Count} 单, ¥{x.Revenue}");
\`\`\`

### 小结

- LINQ = 统一的查询语法，查集合/数据库/XML 都用同一套。
- 查询表达式：\`from\` 开头，\`select\` / \`group\` 结尾。
- \`orderby\` 排序、\`group by\` 分组、\`join\` 连接、\`let\` 临时变量。
- **延迟执行 vs 立即执行**：\`Where\`/\`Select\` 延迟，\`ToList\`/\`Count\`/\`Sum\` 立即。
- 查询表达式 vs 方法语法：等价，方法语法更常用，查询语法处理 join/group 更直观。
- 下一章专门讲方法语法的全部常用方法。`,
  },

  // ============================================================
  // 第三十一章：LINQ 方法语法进阶
  // ============================================================
  {
    id: 'csharp2-ch31',
    group: '第六部分 委托事件与 LINQ',
    icon: '⚙️',
    title: '第三十一章 LINQ 方法语法进阶',
    content: `## 第三十一章　LINQ 方法语法进阶

上一章学了查询表达式，这章讲日常开发**真正用得多**的方法语法——链式调用，每个方法都是扩展方法，配上 Lambda 描述规则。

> ⭐ 本章是 C# 日常开发**最核心**的章节，每个方法都得会用，多写多练。

### 准备数据

后面 demo 都基于这组数据：

\`\`\`csharp
using System;
using System.Collections.Generic;

// 可执行代码：创建产品列表（注意：这里用到Product类型，但类型声明在后面，C#编译器支持前向引用）
var products = new List<Product>
{
    new(1, "键盘",  200, "外设", 50),
    new(2, "鼠标",  120, "外设", 80),
    new(3, "显示器", 1500, "外设", 20),
    new(4, "耳机",  350, "音频", 60),
    new(5, "音箱",  600, "音频", 30),
    new(6, "麦克风", 280, "音频", 15),
    new(7, "USB线",  25,  "线材", 200),
    new(8, "HDMI线", 45,  "线材", 150)
};

// 类型声明（record）放所有可执行代码之后，符合 CS8803 顶级语句规则
record Product(int Id, string Name, decimal Price, string Category, int Stock);
\`\`\`

### 一、Where：过滤 ⭐

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

// 价格 > 200（Where延迟执行，ToList()立即执行并缓存结果，ForEach遍历输出）
var high = products.Where(p => p.Price > 200);
high.ToList().ForEach(p => Console.WriteLine($"  {p.Name} - ¥{p.Price}"));

// 复合条件（&& 表示"且"，|| 表示"或"）
var cheapAudio = products.Where(p => p.Category == "音频" && p.Price < 400);

// Where的重载：第二个参数是索引（0开始），取第0、2、4...个元素
var everyOther = products.Where((p, i) => i % 2 == 0);

// 注：本代码块复用前面"准备数据"的 products 和 Product 类型，独立运行需补充定义
\`\`\`

### 二、Select：投影 ⭐

\`\`\`csharp
// 取名字
var names = products.Select(p => p.Name);
Console.WriteLine(string.Join(",", names));

// 转匿名对象：只取关心的字段
var brief = products.Select(p => new { p.Name, p.Price });
foreach (var x in brief) Console.WriteLine($"{x.Name} ¥{x.Price}");

// 计算新字段
var withTotal = products.Select(p => new
{
    p.Name,
    p.Price,
    TotalValue = p.Price * p.Stock
});
\`\`\`

### 三、OrderBy / OrderByDescending / ThenBy：排序 ⭐

\`\`\`csharp
// 按 Price 升序
var asc = products.OrderBy(p => p.Price);

// 降序
var desc = products.OrderByDescending(p => p.Price);

// 多字段：先按 Category 升序，再按 Price 降序
var multi = products
    .OrderBy(p => p.Category)
    .ThenByDescending(p => p.Price);

// 自定义比较器
var byNameLength = products.OrderBy(p => p.Name.Length);

// Reverse：反转
var reversed = products.OrderBy(p => p.Price).Reverse();
\`\`\`

\`ThenBy\` 必须接在 \`OrderBy\` 后面——它表示「次要排序键」。

### 四、GroupBy：分组 ⭐

\`\`\`csharp
// 按分类分组
var byCategory = products.GroupBy(p => p.Category);

foreach (var g in byCategory)
{
    Console.WriteLine($"【{g.Key}】共 {g.Count()} 件, 合计 ¥{g.Sum(p => p.Price)}");
    foreach (var p in g) Console.WriteLine($"  - {p.Name} ¥{p.Price}");
}

// 分组后投影成新结构
var categoryStats = products
    .GroupBy(p => p.Category)
    .Select(g => new
    {
        Category = g.Key,
        Count = g.Count(),
        AvgPrice = g.Average(p => p.Price),
        TotalStock = g.Sum(p => p.Stock)
    });

foreach (var x in categoryStats)
    Console.WriteLine($"{x.Category}: {x.Count}件, 均价¥{x.AvgPrice:F1}, 库存{x.TotalStock}");
\`\`\`

### 五、Join：连接 ⭐

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

// 可执行代码：创建订单列表
var orders = new List<Order>
{
    new(1, 1, 2),    // 订单1: 键盘2个
    new(2, 3, 1),    // 订单2: 显示器1个
    new(3, 1, 1),    // 订单3: 键盘1个
    new(4, 4, 3),    // 订单4: 耳机3个
};

// 内连接：Join方法语法（方法语法比查询表达式更常用Join）
// 参数：外表、外键选择器、主键选择器、结果投影
var orderDetails = orders.Join(
    products,
    o => o.ProductId,     // 订单表的外键
    p => p.Id,            // 产品表的主键
    (o, p) => new { o.OrderId, p.Name, p.Price, o.Qty, Subtotal = p.Price * o.Qty }
);

foreach (var x in orderDetails)
    Console.WriteLine($"订单{x.OrderId}: {x.Name} × {x.Qty} = ¥{x.Subtotal}");

// 多表连接：链式调用——Join后继续GroupBy、Select，一气呵成
var more = orders
    .Join(products, o => o.ProductId, p => p.Id, (o, p) => new { o.OrderId, p.Name, p.Category, o.Qty })
    .GroupBy(x => x.Category)
    .Select(g => new { Category = g.Key, TotalQty = g.Sum(x => x.Qty) });

// 类型声明放最后：Order记录类型
// 注：本代码块复用前面"准备数据"的 products 和 Product 类型，独立运行需补充定义
record Order(int OrderId, int ProductId, int Qty);
\`\`\`

### 六、SelectMany：扁平化 ⭐

把"集合的集合"摊平。常用于一对多关系。

\`\`\`csharp
var departments = new[]
{
    new { Name = "技术部", Members = new[] { "张三", "李四", "王五" } },
    new { Name = "市场部", Members = new[] { "赵六", "钱七" } }
};

// 不要 SelectMany 时：拿到的是数组的数组
var nested = departments.Select(d => d.Members);   // IEnumerable<string[]>

// SelectMany：摊平成所有人
var allMembers = departments.SelectMany(d => d.Members);
Console.WriteLine(string.Join(", ", allMembers));   // 张三, 李四, 王五, 赵六, 钱七

// 带部门信息：每个 (部门, 成员) 配对
var pairs = departments.SelectMany(
    d => d.Members,
    (d, m) => new { Department = d.Name, Member = m }
);
foreach (var x in pairs)
    Console.WriteLine($"{x.Department}: {x.Member}");
\`\`\`

### 七、Distinct：去重

\`\`\`csharp
// 简单去重
var nums = new[] { 1, 2, 2, 3, 3, 3, 4 };
var unique = nums.Distinct();                  // 1,2,3,4

// 自定义比较器（按某字段去重）
var distinctCategories = products
    .Select(p => p.Category)
    .Distinct();                                // 外设, 音频, 线材

// 自定义相等比较：用 GroupBy + First 实现"按字段去重"
var distinctByPrice = products
    .GroupBy(p => p.Category)
    .Select(g => g.First());                   // 每个分类只留第一个

// .NET 9 引入了 DistinctBy，简化上面写法（C# 12 暂无，可手写扩展或用上面 GroupBy 套路）
\`\`\`

### 八、Take / Skip：分页 ⭐

\`\`\`csharp
var sorted = products.OrderByDescending(p => p.Price).ToList();

// 取前 3
var top3 = sorted.Take(3);

// 跳过前 3，取剩下
var rest = sorted.Skip(3);

// 分页：第 2 页（每页 3 个，跳过 3 个取 3 个）
int page = 2, size = 3;
var page2 = sorted.Skip((page - 1) * size).Take(size);

// TakeLast / SkipLast：从尾部
var last2 = sorted.TakeLast(2);

// TakeWhile / SkipWhile：条件满足就取/跳
var takeCheap = products
    .OrderBy(p => p.Price)
    .TakeWhile(p => p.Price < 300);
\`\`\`

### 九、First / FirstOrDefault / Single / SingleOrDefault ⭐

\`\`\`csharp
// First：取第一个；没元素抛异常
var first = products.First();
var firstCheap = products.First(p => p.Price < 100);   // USB线

// FirstOrDefault：取第一个；没元素返回 default（引用类型 null）
var maybe = products.FirstOrDefault(p => p.Price > 9999);
Console.WriteLine(maybe is null ? "没找到" : maybe.Name);   // 没找到

// Single：必须恰好一个；多了少了都抛异常
// SingleOrDefault：必须 0 或 1 个；多了抛异常
var only = products.SingleOrDefault(p => p.Id == 1);     // 键盘

// 经验：90% 用 FirstOrDefault；确保唯一用 Single(OrDefault)
\`\`\`

> ⭐ 面试常考：\`First\` 没元素抛 \`InvalidOperationException\`，\`FirstOrDefault\` 返回 default——查数据用 \`FirstOrDefault\` 安全。

### 十、Any / All / Contains / Count ⭐

\`\`\`csharp
// Any：有没有任意一个满足
bool hasExpensive = products.Any(p => p.Price > 1000);   // true
bool anyEmpty = products.Any(p => p.Stock == 0);          // false

// All：是否全部满足
bool allInStock = products.All(p => p.Stock > 0);         // true

// Contains：是否包含某元素
bool hasKeyboard = products.Select(p => p.Name).Contains("键盘");  // true

// Count：计数
int total = products.Count();
int expensive = products.Count(p => p.Price >= 500);
int longNamed = products.Count(p => p.Name.Length > 2);
\`\`\`

注意 \`Count()\` 会遍历；如果只判断"有没有"，用 \`Any()\` 更快（找到一个就返回）。

### 十一、Sum / Average / Min / Max：聚合 ⭐

\`\`\`csharp
var totalValue = products.Sum(p => p.Price * p.Stock);   // 总库存价值
var avgPrice = products.Average(p => p.Price);
var minPrice = products.Min(p => p.Price);
var maxPrice = products.Max(p => p.Price);

// 也能直接对数字集合
var nums = new[] { 1, 2, 3, 4, 5 };
Console.WriteLine($"Sum={nums.Sum()}, Avg={nums.Average()}, Min={nums.Min()}, Max={nums.Max()}");

// Aggregate：自定义聚合
var concat = products.Select(p => p.Name).Aggregate((a, b) => a + ", " + b);
Console.WriteLine(concat);   // 键盘, 鼠标, 显示器, ...

// Aggregate 求积
var product = nums.Aggregate(1, (acc, n) => acc * n);
Console.WriteLine(product);   // 120 (5!)
\`\`\`

### 十二、ToDictionary / ToList / ToArray / ToLookup

\`\`\`csharp
// ToDictionary：转字典
var dict = products.ToDictionary(p => p.Id);
Console.WriteLine(dict[3].Name);    // 显示器

// 自定义值
var nameToPrice = products.ToDictionary(p => p.Name, p => p.Price);

// ToList / ToArray：立即执行，缓存结果
var list = products.Where(p => p.Price > 200).ToList();
var arr = products.Where(p => p.Price > 200).ToArray();

// ToLookup：一对多字典（一个 key 对应多个值）
var byCat = products.ToLookup(p => p.Category);
foreach (var g in byCat["外设"])
    Console.WriteLine(g.Name);
\`\`\`

### 十三、其他常用：Zip / Chunk / Union / Intersect / Except

\`\`\`csharp
// Zip：两个序列配对
var names = new[] { "张三", "李四", "王五" };
var ages = new[] { 20, 25, 30 };
var pairs = names.Zip(ages, (n, a) => $"{n}({a}岁)");
Console.WriteLine(string.Join(", ", pairs));

// Chunk：分块（.NET 6+）
var chunks = nums.Chunk(2);
foreach (var c in chunks) Console.WriteLine(string.Join(",", c));

// 集合操作
var a = new[] { 1, 2, 3, 4, 5 };
var b = new[] { 3, 4, 5, 6, 7 };
Console.WriteLine(string.Join(",", a.Union(b)));       // 1,2,3,4,5,6,7 并集
Console.WriteLine(string.Join(",", a.Intersect(b)));   // 3,4,5 交集
Console.WriteLine(string.Join(",", a.Except(b)));      // 1,2   差集
\`\`\`

### 十四、综合实战：电商数据统计

\`\`\`csharp
// 1. 各分类库存价值排行
var categoryValue = products
    .GroupBy(p => p.Category)
    .Select(g => new
    {
        Category = g.Key,
        Items = g.Count(),
        StockValue = g.Sum(p => p.Price * p.Stock)
    })
    .OrderByDescending(x => x.StockValue);

Console.WriteLine("分类库存价值排行:");
foreach (var x in categoryValue)
    Console.WriteLine($"  {x.Category}: {x.Items}件, 价值 ¥{x.StockValue}");

// 2. 找出比平均价贵的商品
var avg = products.Average(p => p.Price);
var aboveAvg = products
    .Where(p => p.Price > avg)
    .OrderByDescending(p => p.Price)
    .Select(p => $"{p.Name} ¥{p.Price}");
Console.WriteLine($"高于均价(¥{avg:F1})的:");
foreach (var x in aboveAvg) Console.WriteLine($"  {x}");

// 3. 库存预警：库存 < 20 的商品
var warnings = products
    .Where(p => p.Stock < 20)
    .Select(p => $"⚠️ {p.Name} 库存仅 {p.Stock}");
foreach (var w in warnings) Console.WriteLine(w);

// 4. 每个分类最贵的商品
var topPerCategory = products
    .GroupBy(p => p.Category)
    .Select(g => new
    {
        Category = g.Key,
        TopProduct = g.OrderByDescending(p => p.Price).First()
    });
foreach (var x in topPerCategory)
    Console.WriteLine($"{x.Category} 最贵: {x.TopProduct.Name} ¥{x.TopProduct.Price}");

// 5. 分页展示
int pageSize = 3, pageNum = 2;
var page = products
    .OrderBy(p => p.Id)
    .Skip((pageNum - 1) * pageSize)
    .Take(pageSize)
    .Select(p => $"#{p.Id} {p.Name}");
Console.WriteLine($"第 {pageNum} 页:");
foreach (var x in page) Console.WriteLine($"  {x}");
\`\`\`

### 小结

- \`Where\` 过滤、\`Select\` 投影、\`OrderBy/ThenBy\` 排序——三大基础。
- \`GroupBy\` 分组、\`Join\` 连接、\`SelectMany\` 扁平化——关系数据操作。
- \`Distinct\` 去重、\`Take/Skip\` 分页——结果精修。
- \`First/SingleOrDefault\` 取元素——查数据用 \`FirstOrDefault\` 最安全。
- \`Any/All/Contains/Count\` 判断、\`Sum/Average/Min/Max\` 聚合——常用统计。
- \`ToDictionary/ToList/ToArray\` 立即执行——把延迟查询物化成集合。
- **链式调用**是 LINQ 的精髓：\`Where().OrderBy().Select().ToList()\` 一气呵成。
- 写 LINQ 时多用 \`var\`、链式换行——可读性远高于查询表达式。`,
  },

  // ============================================================
  // 第三十二章：扩展方法
  // ============================================================
  {
    id: 'csharp2-ch32',
    group: '第六部分 委托事件与 LINQ',
    icon: '🔌',
    title: '第三十二章 扩展方法',
    content: `## 第三十二章　扩展方法

扩展方法让你**给已有类型"添加"方法，而不修改源码**——不用继承、不用改类。LINQ 那 50+ 方法全是扩展方法。

### 一、为什么需要扩展方法

场景：你想给 \`string\` 加个 \`Reverse()\` 方法，但 \`string\` 是 .NET 框架的类，你改不了源码。

\`\`\`csharp
using System;

// 可执行代码：调用静态工具方法
string s = "hello";
string r = StringUtils.ReverseStr(s);   // 调用方式啰嗦：StringUtils.方法名(对象)
Console.WriteLine(r);   // olleh

// static class 是类型声明，放可执行代码之后
// 传统写法：写一个静态工具类，把方法都放里面
static class StringUtils
{
    public static string ReverseStr(string s)
    {
        var chars = s.ToCharArray();
        Array.Reverse(chars);
        return new string(chars);
    }
}
\`\`\`

有了扩展方法，能像调用实例方法一样写：

\`\`\`csharp
string s = "hello";
string r = s.Reverse();    // 像是 string 自带的方法
\`\`\`

### 二、定义扩展方法：this 关键字 ⭐

三个规则：**静态类 + 静态方法 + 第一个参数前加 \`this\`**。

\`\`\`csharp
using System;
using System.Linq;

// 使用：扩展方法的调用方式像实例方法，但本质是语法糖
string name = "hello";
Console.WriteLine(name.Reverse());      // olleh → 编译器翻译成 StringExtensions.Reverse(name)
Console.WriteLine(name.Repeat(3));      // hellohellohello

string? maybe = null;
Console.WriteLine(maybe.IsNullOrEmpty());   // True —— 注意即使 null 也能调，因为本质是静态方法调用！

// 【this关键字原理】为什么第一个参数加this就"变成"了扩展方法？
// this 告诉编译器：这是一个扩展方法，它"附加"到第一个参数的类型上。
// 编译器做了两个工作：
//   1. 把 s.Reverse() 翻译成 StringExtensions.Reverse(s)（静态调用）
//   2. 在 Visual Studio / Rider 智能提示里，把 Reverse 显示为 string 的方法
// 三个规则必须同时满足：
//   - 必须在 static class 里（非静态类编译错误）
//   - 方法本身必须是 static
//   - 第一个参数必须带 this，且是你要扩展的类型
public static class StringExtensions
{
    // 扩展 string 类型：this string s 表示"把这个方法扩展给string"
    public static string Reverse(this string s)
    {
        var chars = s.ToCharArray();
        Array.Reverse(chars);
        return new string(chars);
    }

    // 扩展方法可以有额外参数：第一个this参数是被扩展对象，后面是普通参数
    public static string Repeat(this string s, int count)
    {
        return string.Concat(Enumerable.Repeat(s, count));
    }

    // 可以扩展可空类型：this string? s 表示即使 s 是 null 也能调用
    public static bool IsNullOrEmpty(this string? s) => string.IsNullOrEmpty(s);
}
\`\`\`

要点：
- 第一个参数带 \`this\` 的就是扩展方法。\`this string s\` 表示「扩展 \`string\` 类型」。
- 调用时**不必传第一个参数**——它就是被扩展的那个对象。
- 即使对象是 \`null\`，扩展方法也能调用（因为本质是静态调用）。

### 三、调用语法

\`\`\`csharp
using System;

// 两种调用方式都行：实例方法风格是语法糖，最终都翻译成静态调用
int n = 7;
Console.WriteLine(n.IsPrime());           // 实例方法风格（推荐，更自然）
Console.WriteLine(IntExtensions.IsPrime(n)); // 底层：静态方法风格（最终编译成这样）

// 链式调用：每个扩展方法返回值类型可以继续调用该类型的扩展方法
Console.WriteLine(5.Square().Square());   // 625 = (5²)² = 25²，链式调用让代码流畅

// 类型声明放最后
public static class IntExtensions
{
    // 扩展 int 类型：判断素数
    public static bool IsPrime(this int n)
    {
        if (n < 2) return false;
        for (int i = 2; i * i <= n; i++)
            if (n % i == 0) return false;
        return true;
    }

    // 扩展 int 类型：平方
    public static int Square(this int n) => n * n;
}
\`\`\`

### 四、LINQ 就是扩展方法 ⭐

回头看你前面写的 LINQ：

\`\`\`csharp
var nums = new[] { 1, 2, 3, 4, 5 };
var evens = nums.Where(n => n % 2 == 0);     // Where 是扩展方法
var doubled = nums.Select(n => n * 2);        // Select 是扩展方法
var first = nums.First();                     // First 是扩展方法
\`\`\`

这些方法定义在 \`System.Linq.Enumerable\` 静态类里，全是扩展方法，扩展 \`IEnumerable<T>\`：

\`\`\`csharp
namespace System.Linq
{
    public static class Enumerable
    {
        public static IEnumerable<T> Where<T>(this IEnumerable<T> source, Func<T, bool> predicate) { ... }
        public static IEnumerable<TResult> Select<T, TResult>(this IEnumerable<T> source, Func<T, TResult> selector) { ... }
        // ... 50+ 个方法
    }
}
\`\`\`

\`using System.Linq;\` 后，所有 \`IEnumerable<T>\`（数组、List、Dictionary 的 keys/values……）都"自动"有了几十个方法——这就是扩展方法的威力。

### 五、常用自定义扩展

#### 1. 字符串扩展

\`\`\`csharp
using System;
using System.Linq;

// 直接在字符串实例上调用扩展方法，就像它是string原生方法一样
Console.WriteLine("Hello, World!".Truncate(5));     // Hello…
Console.WriteLine("hello world".ToTitleCase());     // Hello World
Console.WriteLine("你好".IsChinese());             // True

// 类型声明放最后：常用字符串扩展方法
public static class StringExtensions
{
    // 截断到指定长度，超出加省略号
    public static string Truncate(this string s, int maxLen)
    {
        if (s.Length <= maxLen) return s;
        return s[..maxLen] + "…";
    }

    // 转为标题大小写：每个单词首字母大写
    public static string ToTitleCase(this string s)
    {
        if (string.IsNullOrEmpty(s)) return s;
        var words = s.Split(' ');
        for (int i = 0; i < words.Length; i++)
        {
            var w = words[i];
            if (w.Length > 0)
                words[i] = char.ToUpper(w[0]) + w[1..];
        }
        return string.Join(' ', words);
    }

    // 是否包含中文字符（Unicode范围判断）
    public static bool IsChinese(this string s) =>
        s.Any(c => c >= '\u4e00' && c <= '\u9fff');
}
\`\`\`

#### 2. 集合扩展

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

// 可执行代码：使用集合扩展方法
var nums = new[] { 1, 2, 3, 4 };
Console.WriteLine(nums.JoinStr(", "));              // 1, 2, 3, 4
nums.ForEach(n => Console.Write(n + " "));         // 1 2 3 4
Console.WriteLine();

List<int>? empty = null;
Console.WriteLine(empty.IsNullOrEmpty());          // True（null也安全调用）

// 类型声明放最后：集合扩展方法
public static class CollectionExtensions
{
    // 判断集合是否为null或空：IEnumerable<T>? 表示可以接受null
    public static bool IsNullOrEmpty<T>(this IEnumerable<T>? source) =>
        source is null || !source.Any();

    // 拼接字符串：把集合元素用分隔符连起来，省去每次写string.Join
    public static string JoinStr<T>(this IEnumerable<T> source, string sep) =>
        string.Join(sep, source);

    // 给IEnumerable<T>加ForEach：List有ForEach，但IEnumerable没有，这里扩展一个
    public static void ForEach<T>(this IEnumerable<T> source, Action<T> action)
    {
        foreach (var item in source) action(item);
    }
}
\`\`\`

#### 3. 数字扩展

\`\`\`csharp
using System;

// 使用数字扩展
Console.WriteLine(5.Between(1, 10));      // True：5在1-10之间
Console.WriteLine(15.Clamp(1, 10));       // 10：Clamp把值限制在范围内，超出则取边界
Console.WriteLine(1234567.89m.ToMoney()); // 1,234,567.89：格式化为千分位货币格式

// 类型声明放最后：数字扩展方法
public static class NumberExtensions
{
    // 判断数值是否在闭区间[min, max]内
    public static bool Between(this int n, int min, int max) => n >= min && n <= max;

    // 把数值限制在[min, max]区间：小于min返回min，大于max返回max，否则返回原值
    public static int Clamp(this int n, int min, int max) =>
        Math.Max(min, Math.Min(max, n));

    // 千分位格式：decimal用ToString("N2")格式化为两位小数、千分位分隔
    public static string ToMoney(this decimal d) => d.ToString("N2");
}
\`\`\`

### 六、实战 demo：日志扩展

\`\`\`csharp
using System;
using System.Collections.Generic;
using System.Linq;

// 用法：Dump 返回自己，便于链式调用调试
var nums = new[] { 1, 2, 3, 4, 5 };
var evens = nums
    .Where(n => n % 2 == 0)
    .DumpEach("偶数")           // 中间结果直接打印，且不中断链式（yield return延迟）
    .Select(n => n * n)
    .ToList();

42.Dump("答案");                // [答案] 42

// 类型声明放最后：调试用扩展方法
public static class LoggerExtensions
{
    // Dump：打印对象并返回对象本身，支持链式
    public static T Dump<T>(this T obj, string? label = null)
    {
        if (label is not null) Console.Write($"[{label}] ");
        Console.WriteLine(obj?.ToString() ?? "null");
        return obj;   // 返回自己，便于在链式中间插入调试
    }

    // DumpEach：逐个打印集合元素，用yield return保持延迟执行特性
    // 注意：必须用yield return才能不破坏LINQ的延迟执行——每次枚举才打印
    public static IEnumerable<T> DumpEach<T>(this IEnumerable<T> source, string? label = null)
    {
        if (label is not null) Console.WriteLine($"=== {label} ===");
        foreach (var item in source)
        {
            Console.WriteLine(item);
            yield return item;   // yield return 保持延迟，不立即执行
        }
    }
}
\`\`\`

### 七、扩展方法注意事项 ⭐

#### 1. 不能扩展"实例方法已有的同名同签名"

\`\`\`csharp
public static class BadExtensions
{
    // string 已有 ToString()，扩展同名会冲突——但实例方法优先
    public static string ToString(this string s) => "自定义";
}
// 调用时实例方法优先，扩展被忽略
\`\`\`

**经验法则**：扩展方法优先级低于实例方法——同名时实例方法胜出。

#### 2. 必须在静态类、静态方法里

\`\`\`csharp
// ❌ 错：不能放在普通类
class Foo
{
    public static string Reverse(this string s) { ... }   // 编译错误
}

// ✅ 对：必须在 static class
static class StringExt
{
    public static string Reverse(this string s) { ... }
}
\`\`\`

#### 3. 必须有 using 命名空间

扩展方法只在 \`using\` 了对应命名空间后才"可见"。

\`\`\`csharp
using System;
using MyApp.Utils;   // using必须放最前面，引入命名空间后扩展方法才可见

// 可执行代码：using命名空间后才能用扩展方法
string s = "hello";
string reversed = s.Reverse();   // 如果没有using MyApp.Utils，这行编译报错
Console.WriteLine(reversed);

// 类型/命名空间声明放最后（namespace也是类型级声明，必须放可执行代码之后）
namespace MyApp.Utils
{
    public static class StringExtensions
    {
        public static string Reverse(this string s)
        {
            var chars = s.ToCharArray();
            Array.Reverse(chars);
            return new string(chars);
        }
    }
}
\`\`\`

#### 4. 扩展 null 也能调

\`\`\`csharp
string? s = null;
s.Reverse();   // 不抛 NullReferenceException（因为是静态调用）
// 但 Reverse 内部如果访问 s，会抛 NullReferenceException
\`\`\`

#### 5. 别滥用——扩展方法不是"什么都加"

适合扩展的场景：
- 给第三方库或框架类型加工具方法（如 \`string\`、\`IEnumerable\`）。
- 给接口加默认行为（接口的"默认实现"）。
- 业务里常用的格式化、转换。

不适合：
- 业务核心逻辑——应该放领域类里。
- 频繁修改的方法——继承或部分类更合适。
- 跟现有方法重名——会让人困惑。

### 八、扩展方法 vs 继承 vs 部分类

| 方式 | 适用场景 | 修改原类型？ |
| --- | --- | --- |
| 扩展方法 | 给已存在类型（包括 sealed）加方法 | 不修改 |
| 继承 | 派生类加新行为 | 不修改基类 |
| 部分类 partial | 同一程序集内拆分类定义 | 修改（同一类） |
| 接口默认方法 | 给接口加默认实现 | 修改接口 |

### 小结

- 扩展方法 = 静态类 + 静态方法 + 第一个参数带 \`this\`。
- 调用时像实例方法，本质是静态调用。
- **LINQ 那 50+ 方法全是扩展方法**，扩展 \`IEnumerable<T>\`。
- 常用于：字符串工具、集合工具、数字格式化、日志调试。
- 注意：实例方法优先；必须 using 命名空间；扩展方法不修改原类型。
- 别滥用——核心业务逻辑还是放类里，扩展方法用于"工具"。`,
  },
];

export { chapters };
