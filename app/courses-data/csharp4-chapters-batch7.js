// =============================================================
// C# 从入门到精通大全（全新版）—— 第 7 批章节
// 第五部分 委托、事件与 Lambda（共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   csharp4-ch35 : 第三十五章 委托
//   csharp4-ch36 : 第三十六章 Lambda 表达式
//   csharp4-ch37 : 第三十七章 事件
//   csharp4-ch38 : 第三十八章 表达式树
//   csharp4-ch39 : 第三十九章 函数式编程基础
//
// 风格：demo 驱动，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，所有示例用顶级语句。
// =============================================================

const chapters = [
  // ============================================================
  // 第三十五章：委托
  // ============================================================
  {
    id: 'csharp4-ch35',
    group: '第五部分 委托、事件与 Lambda',
    icon: '📞',
    title: '委托',
    content: `## 第三十五章　委托

委托（delegate）是 C# 中「类型安全的函数指针」。它让你可以把方法当作数据传递、存储、调用——这是回调、事件、LINQ、异步等高级特性的基石。

### 一、为什么需要委托 ⭐

普通方法调用是「直接」的：写 \`DoSomething()\` 编译器就跳到 \`DoSomething\` 执行。但很多时候你想「间接」调用：让别人决定调用哪个方法。比如：
- 排序时让调用方传入「比较函数」（\`List<T>.Sort(Comparison<T>)\`）。
- 按钮点击时让 UI 框架回调你写的「点击处理函数」。
- LINQ 中 \`Where(predicate)\` 让你传入「过滤条件函数」。

这些场景都需要「把方法当成参数传」。委托就是承载这个能力的类型。

### 二、delegate 关键字：自定义委托

声明委托用 \`delegate\` 关键字，看起来像方法签名加个分号：

\`\`\`csharp
// 声明一个委托类型：接收 int，返回 int
delegate int Transformer(int x);
\`

这表示「Transformer 是一个类型，它的实例可以指向任何『接收 int 返回 int』的方法」。委托类型和类一样，是一种自定义类型。

### 三、实例化委托

委托实例化有几种等价写法：

\`\`\`csharp
int Square(int x) => x * x;        // 局部函数

Transformer t1 = new Transformer(Square);   // 显式构造（旧写法）
Transformer t2 = Square;                    // 方法组转换（推荐）
Transformer t3 = x => x * x;                // Lambda（下章详解）
\`

方法组转换：直接把方法名赋给委托变量，编译器自动包装。这是最常用的方式。

### 四、调用委托

委托变量就像普通方法一样调用：

\`\`\`csharp
Transformer t = Square;
int result = t(5);   // 等价于 Square(5)，结果 25
\`

也可以用 \`t.Invoke(5)\` 显式调用——两者等价。

### 五、委托的签名匹配

委托类型只关心**参数列表和返回类型**，不关心方法名、所属类、访问修饰符。只要签名匹配，就能赋值：

\`\`\`csharp
int Add(int a, int b) => a + b;
Func<int, int, int> f = Add;   // ✅ 签名匹配：两个 int 参数，返回 int
\`

注意：参数名可以不同（\`a, b\` vs \`x, y\`），只看类型和顺序。但 ref/out/in 修饰符必须一致。

### 六、多播委托：组合 + 与移除 - ⭐

委托支持「+」运算：把多个委托拼成一个，调用时按顺序全部调用。这叫**多播委托（multicast delegate）**。

\`\`\`csharp
void Hi() => Console.WriteLine("Hi");
void Bye() => Console.WriteLine("Bye");

Action a = Hi;
a += Bye;    // 现在调用 a 会先 Hi 后 Bye
a -= Hi;     // 移除 Hi，只剩 Bye
\`

注意：
- 多播委托的返回值是「最后一个方法的返回值」，前面的返回值被丢弃。所以多播委托通常返回 void。
- \`+=\` / \`-=\` 是语法糖，等价于 \`Delegate.Combine\` / \`Delegate.Remove\`。
- 移除不存在的委托不报错，是 no-op。

### 七、GetInvocationList

多播委托内部是一个委托链表。\`GetInvocationList()\` 返回这个链表的副本，让你可以单独调用每个：

\`\`\`csharp
foreach (Action handler in a.GetInvocationList())
{
    try { handler(); }
    catch (Exception ex) { /* 单个处理器抛异常不影响其他 */ }
}
\`

这是处理「多播中某个方法抛异常」的关键技巧。

### 八、内置泛型委托：Action / Func / Predicate ⭐

C# 内置了三组泛型委托，覆盖几乎所有场景，几乎不用再自定义委托：

| 委托 | 签名 | 用途 |
| --- | --- | --- |
| \`Action\` | 无参无返回 | 简单回调 |
| \`Action<T>\` | 一个参数无返回 | 处理单个值 |
| \`Action<T1,T2>\` | 两个参数无返回 | 处理两个值 |
| \`Action<T1...T16>\` | 最多 16 个参数 | 处理多参数 |
| \`Func<TResult>\` | 无参返回 TResult | 惰性求值 |
| \`Func<T,TResult>\` | 一个参数返回 TResult | 转换 |
| \`Func<T1,T2,TResult>\` | 两参返回 TResult | 二元运算 |
| \`Predicate<T>\` | 一个参数返回 bool | 判断/过滤 |
| \`Comparison<T>\` | 两个 T 返回 int | 排序比较 |
| \`Converter<TInput,TOutput>\` | TInput 转 TOutput | 集合转换 |

\`\`\`csharp
Func<int, int> square = x => x * x;            // 转换
Action<string> log = msg => Console.WriteLine(msg);  // 副作用
Predicate<int> isEven = n => n % 2 == 0;       // 判断
Comparison<string> byLen = (a, b) => a.Length - b.Length;  // 比较
\`

记住：**90% 的场景用 Action 和 Func 就够了**。只有当委托类型名本身能表达语义（如 \`MouseEventHandler\`）时才自定义。

### 九、委托作为方法参数：回调模式

委托最经典的用法是「回调」：把委托当参数传给某个方法，让该方法在合适时机调用它。

\`\`\`csharp
void Process(int[] data, Func<int, int> transform)
{
    for (int i = 0; i < data.Length; i++)
        data[i] = transform(data[i]);
}

int[] nums = { 1, 2, 3 };
Process(nums, x => x * 10);   // 把每个数乘 10
\`

\`Array.ForEach\`、\`List<T>.ConvertAll\`、\`List<T>.FindAll\` 等都是这个模式。

### 十、委托作为返回值

方法也可以返回委托——这是「工厂模式」的函数式版本：

\`\`\`csharp
Func<int, int> GetMultiplier(int factor) => x => x * factor;

var triple = GetMultiplier(3);
Console.WriteLine(triple(10));   // 30
\`

返回的委托「捕获」了 \`factor\`，形成了闭包（下章详解）。

### 十一、委托与泛型协作

泛型方法 + 委托参数是 LINQ 的核心模式：

\`\`\`csharp
T Accumulate<T>(IEnumerable<T> source, Func<T, T, T> func, T seed)
{
    T acc = seed;
    foreach (var x in source) acc = func(acc, x);
    return acc;
}
\`

这就是 \`Aggregate\` 的简化版。

### 十二、委托的逆变与协变（C# 4+）

委托支持泛型参数的协变（返回类型）和逆变（参数类型）：

\`\`\`csharp
Action<object> objAction = o => Console.WriteLine(o);
Action<string> strAction = objAction;   // ✅ 逆变：string 可转 object
\`

这让你可以更灵活地复用委托。

### 十三、委托 vs 接口 vs 虚方法

什么时候用委托？什么时候用接口？

| 方案 | 适用场景 |
| --- | --- |
| 委托 | 单方法回调、策略模式、LINQ 风格 |
| 接口 | 多方法契约、有状态的策略对象 |
| 虚方法 | 类内可重写的钩子 |

经验：**单方法优先用委托**。它更轻量、更函数式、和 LINQ 配合更好。

### 十四、委托底层原理（简介）

委托本质是一个继承自 \`System.MulticastDelegate\` 的类型，内部维护：
- \`Target\`：方法所属对象（静态方法为 null）。
- \`Method\`：方法的 \`MethodInfo\`（反射元数据）。
- \`_invocationList\`：多播时的链表。

调用委托 (\`t(5)\`) 编译成 \`t.Invoke(5)\`，运行时根据 Target/Method 调用真正的方法。

本章 demo 演示：自定义委托、方法组转换、多播 +/-、GetInvocationList、Action/Func/Predicate/Comparison/Converter 全套、回调模式、委托返回值。`,
    code: `// C# 12 顶级语句 - 委托完整演示
// 演示：自定义委托、方法组转换、多播、GetInvocationList、
//       Action/Func/Predicate/Comparison/Converter、回调模式、返回委托

using System;
using System.Collections.Generic;

// === 1. 自定义委托类型 ===
// 声明一个委托：接收 int 返回 int（类似函数指针的类型签名）
delegate int Transformer(int x);

// === 2. 自定义带多个参数的委托 ===
delegate void LogHandler(string message, DateTime time);

// === 3. 一些静态方法和实例方法，用于演示委托赋值 ===
static class MathOps
{
    public static int Square(int x) => x * x;        // 静态方法
    public static int Cube(int x) => x * x * x;      // 静态方法
    public static int Negate(int x) => -x;           // 静态方法
}

// === 4. 实例方法演示：委托可以指向实例方法 ===
class Calculator
{
    public int Offset { get; }
    public Calculator(int offset) => Offset = offset;

    // 实例方法：用 this.Offset 偏移
    public int AddOffset(int x) => x + Offset;
}

// === 5. 用委托作为参数：经典回调模式 ===
// transform 是委托参数，调用方决定如何变换
static void TransformArray(int[] data, Transformer transform)
{
    for (int i = 0; i < data.Length; i++)
    {
        data[i] = transform(data[i]);   // 调用委托，等价于 transform.Invoke(data[i])
    }
}

// === 6. 返回委托的方法：工厂模式函数式版本 ===
// 返回一个「乘以 factor」的委托
static Transformer GetMultiplier(int factor) => x => x * factor;

// === 7. 自定义类，用于演示 Comparison<T> ===
class Person
{
    public string Name { get; set; } = "";
    public int Age { get; set; }
    public override string ToString() => $"{Name}({Age}岁)";
}

// === 8. 顶级语句：运行所有演示 ===
Console.WriteLine("=== 1. 自定义委托与方法组转换 ===");

// 方法组转换：直接把方法名赋给委托变量（编译器自动包装）
Transformer t1 = MathOps.Square;
Transformer t2 = MathOps.Cube;

// 调用委托：像调用普通方法一样
Console.WriteLine($"Square(5) = {t1(5)}");   // 25
Console.WriteLine($"Cube(5) = {t2(5)}");     // 125

// 也可以用 Invoke 显式调用
Console.WriteLine($"t1.Invoke(10) = {t1.Invoke(10)}");  // 100

Console.WriteLine("\\n=== 2. 实例方法委托 ===");
var calc = new Calculator(100);
Transformer t3 = calc.AddOffset;   // 委托绑定实例方法 + this
Console.WriteLine($"AddOffset(5) = {t3(5)}");   // 105

// 委托的 Target 和 Method 属性
Console.WriteLine($"t3.Target = {t3.Target}");          // Calculator 实例
Console.WriteLine($"t3.Method = {t3.Method.Name}");     // AddOffset
Console.WriteLine($"t1.Target = {t1.Target}");           // null（静态方法）

Console.WriteLine("\\n=== 3. 多播委托：+ 和 - ===");
Action greet1 = () => Console.WriteLine("  你好");
Action greet2 = () => Console.WriteLine("  世界");
Action greet3 = () => Console.WriteLine("  !");

// 用 + 组合多个委托
Action all = greet1 + greet2 + greet3;
Console.WriteLine("调用组合后的 all：");
all();   // 依次执行 greet1, greet2, greet3

// += 与 -=（语法糖）
Action chain = greet1;
chain += greet2;
chain += greet3;
chain += greet1;   // 同一个委托可以多次添加，会被调用多次
Console.WriteLine("\\n+= 后调用 chain：");
chain();

chain -= greet1;   // 移除一个 greet1（如果链中有多个，只移除一个）
Console.WriteLine("\\n-= greet1 后调用 chain：");
chain();

Console.WriteLine("\\n=== 4. GetInvocationList：单独处理每个委托 ===");
ActionWithError();
void ActionWithError()
{
    Action risky = null;
    risky += () => Console.WriteLine("  [1] 安全执行");
    risky += () => throw new InvalidOperationException("故意抛异常");
    risky += () => Console.WriteLine("  [3] 应该执行（如果用 try/catch）");

    // 直接调用：抛异常后停止
    Console.WriteLine("直接调用（异常会中断）：");
    try { risky(); }
    catch (Exception ex) { Console.WriteLine($"  捕获异常: {ex.Message}"); }

    // 用 GetInvocationList 单独调用：异常不影响其他
    Console.WriteLine("用 GetInvocationList 单独调用：");
    foreach (Action handler in risky.GetInvocationList())
    {
        try { handler(); }
        catch (Exception ex) { Console.WriteLine($"  单个处理器异常: {ex.Message}"); }
    }
}

Console.WriteLine("\\n=== 5. 内置泛型委托：Action 系列 ===");
Action sayHello = () => Console.WriteLine("  Hello!");
Action<string> log = msg => Console.WriteLine($"  [LOG] {msg}");
Action<int, int> addAndPrint = (a, b) => Console.WriteLine($"  {a} + {b} = {a + b}");

sayHello();
log("这是一条日志");
addAndPrint(3, 5);

Console.WriteLine("\\n=== 6. 内置泛型委托：Func 系列 ===");
Func<int> randomNum = () => Random.Shared.Next(1, 100);
Func<int, int> squareFunc = x => x * x;
Func<int, int, int> maxFunc = (a, b) => Math.Max(a, b);
Func<int, int, int, int> sumThree = (a, b, c) => a + b + c;

Console.WriteLine($"  随机数: {randomNum()}");
Console.WriteLine($"  Square(7) = {squareFunc(7)}");
Console.WriteLine($"  Max(3, 9) = {maxFunc(3, 9)}");
Console.WriteLine($"  Sum(1, 2, 3) = {sumThree(1, 2, 3)}");

Console.WriteLine("\\n=== 7. 内置泛型委托：Predicate<T> ===");
Predicate<int> isEven = n => n % 2 == 0;
Predicate<int> isPositive = n => n > 0;
Predicate<string> isLongEnough = s => s.Length >= 5;

Console.WriteLine($"  4 是偶数: {isEven(4)}");
Console.WriteLine($"  7 是偶数: {isEven(7)}");
Console.WriteLine($"  'hello' 长度>=5: {isLongEnough("hello")}");
Console.WriteLine($"  'hi' 长度>=5: {isLongEnough("hi")}");

// List<T>.FindAll 内部用 Predicate<T>
var numbers = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
var evens = numbers.FindAll(isEven);
Console.WriteLine($"  偶数: {string.Join(", ", evens)}");

Console.WriteLine("\\n=== 8. Comparison<T>：自定义排序 ===");
var people = new List<Person>
{
    new() { Name = "张三", Age = 30 },
    new() { Name = "李四", Age = 25 },
    new() { Name = "王五", Age = 35 },
};

// Comparison<T> 委托：自定义排序规则
Comparison<Person> byAge = (a, b) => a.Age.CompareTo(b.Age);
Comparison<Person> byNameDesc = (a, b) => string.Compare(b.Name, a.Name, StringComparison.Ordinal);

people.Sort(byAge);
Console.WriteLine("  按年龄升序：");
foreach (var p in people) Console.WriteLine($"    {p}");

people.Sort(byNameDesc);
Console.WriteLine("  按名字降序：");
foreach (var p in people) Console.WriteLine($"    {p}");

Console.WriteLine("\\n=== 9. Converter<TInput, TOutput>：集合转换 ===");
Converter<Person, string> toName = p => p.Name;
Converter<int, string> intToHex = n => $"0x{n:X}";

var names = people.ConvertAll(toName);
Console.WriteLine($"  名字列表: {string.Join(", ", names)}");

var ints = new List<int> { 255, 16, 255 };
var hexs = ints.ConvertAll(intToHex);
Console.WriteLine($"  十六进制: {string.Join(", ", hexs)}");

Console.WriteLine("\\n=== 10. 回调模式：委托作为方法参数 ===");
int[] data = { 1, 2, 3, 4, 5 };
Console.WriteLine($"  原始: {string.Join(", ", data)}");

// 传入不同的 Transformer，得到不同的变换结果
TransformArray(data, MathOps.Square);
Console.WriteLine($"  平方后: {string.Join(", ", data)}");

TransformArray(data, MathOps.Negate);
Console.WriteLine($"  取反后: {string.Join(", ", data)}");

// 用 Lambda 内联
TransformArray(data, x => x + 100);
Console.WriteLine($"  加 100 后: {string.Join(", ", data)}");

Console.WriteLine("\\n=== 11. 委托作为返回值：工厂模式 ===");
var triple = GetMultiplier(3);   // 返回一个委托
var quintuple = GetMultiplier(5);
Console.WriteLine($"  triple(10) = {triple(10)}");     // 30
Console.WriteLine($"  quintuple(10) = {quintuple(10)}"); // 50

Console.WriteLine("\\n=== 12. 多播委托返回值陷阱 ===");
Func<int> f1 = () => 1;
Func<int> f2 = () => 2;
Func<int> f3 = () => 3;
Func<int> multi = f1 + f2 + f3;
Console.WriteLine($"  多播调用返回值: {multi()}");   // 只返回最后一个：3
Console.WriteLine("  提示：多播委托只用最后一个返回值，前面的被丢弃");

// 要拿到所有返回值，用 GetInvocationList
foreach (Func<int> f in multi.GetInvocationList())
{
    Console.WriteLine($"    handler 返回: {f()}");
}

Console.WriteLine("\\n=== 13. 协变与逆变 ===");
Action<object> objAction = o => Console.WriteLine($"  打印对象: {o}");
// 逆变：Action<object> 可以赋给 Action<string>（参数 string 能转 object）
Action<string> strAction = objAction;
strAction("hello");

Func<string> strFunc = () => "hello";
// 协变：Func<string> 可以赋给 Func<object>（返回 string 能转 object）
Func<object> objFunc = strFunc;
Console.WriteLine($"  通过 Func<object> 调用: {objFunc()}");`,
    lang: 'cs',
  },

  // ============================================================
  // 第三十六章：Lambda 表达式
  // ============================================================
  {
    id: 'csharp4-ch36',
    group: '第五部分 委托、事件与 Lambda',
    icon: 'ƛ',
    title: 'Lambda 表达式',
    content: `## 第三十六章　Lambda 表达式

Lambda 表达式是 C# 3.0 引入的「匿名函数」语法。它让你在不写独立方法的情况下，直接在调用处定义一个函数。Lambda 是 LINQ、事件、异步、函数式编程的核心载体。

### 一、Lambda 演算简介

Lambda 源自 Church 的 λ 演算（1930s），是「函数即数据」思想的数学基础。在编程语言中，Lambda 表示「一个没有名字的函数，可以作为值传递」。C# 把这一思想融入了委托系统，让函数成为一等公民。

### 二、Lambda 语法 ⭐

Lambda 用 \`=>\`（箭头）分隔参数和函数体：

\`\`\`csharp
(参数列表) => 表达式;            // 表达式 Lambda
(参数列表) => { 语句; };          // 语句 Lambda
\`

示例：

\`\`\`csharp
x => x * x;                      // 单参数可省括号
(x, y) => x + y;                 // 多参数
() => 42;                        // 无参数
(x, y) => { var s = x + y; return s * 2; };  // 语句块
\`

注意：语句 Lambda 必须用 \`return\` 返回值；表达式 Lambda 自动返回表达式的值。

### 三、Lambda 与匿名方法对比

C# 2.0 的「匿名方法」是 Lambda 的前身：

\`\`\`csharp
// 旧：匿名方法（delegate 关键字）
Func<int, int> old = delegate(int x) { return x * x; };

// 新：Lambda（更简洁）
Func<int, int> new = x => x * x;
\`

匿名方法已经过时，新代码一律用 Lambda。Lambda 在可读性、类型推断、表达式树支持上都更优。

### 四、Lambda 类型推断 ⭐

Lambda 没有显式类型，类型由「目标委托类型」决定：

\`\`\`csharp
Func<int, int> f1 = x => x * 2;        // x 是 int，返回 int
Func<string, int> f2 = s => s.Length;  // s 是 string，返回 int
Action<double> a = d => Console.WriteLine(d);  // d 是 double
\`

编译器根据委托的签名推断参数类型和返回类型。这是 Lambda 简洁的关键。

### 五、Lambda 与委托

Lambda 本质是「委托的语法糖」——它会被编译成一个委托实例（或表达式树，见后）。所以 Lambda 可以赋给任何委托类型变量：

\`\`\`csharp
Func<int, int> f = x => x + 1;
Predicate<int> p = n => n > 0;
Action a = () => Console.WriteLine("hi");
\`

### 六、闭包：捕获外部变量 ⭐

Lambda 可以「看到」并使用外层作用域的变量。这种能力叫**闭包（closure）**：

\`\`\`csharp
int factor = 10;
Func<int, int> multiply = x => x * factor;   // 捕获 factor

Console.WriteLine(multiply(5));   // 50
factor = 20;
Console.WriteLine(multiply(5));   // 100！捕获的是变量，不是值
\`

要点：**Lambda 捕获的是变量本身，不是变量当时的值**。修改变量后，Lambda 看到的是新值。这是因为编译器把捕获的变量提升到一个「闭包对象」里。

### 七、捕获陷阱：for 循环中的捕获 ⚠️

经典的闭包陷阱：

\`\`\`csharp
var actions = new List<Action>();
for (int i = 0; i < 3; i++)
{
    actions.Add(() => Console.WriteLine(i));
}
foreach (var a in actions) a();   // 输出 3 3 3（不是 0 1 2！）
\`

原因：所有 Lambda 共享同一个 \`i\` 变量，循环结束时 \`i = 3\`，所以全打印 3。

修复：在循环内拷贝一份：

\`\`\`csharp
for (int i = 0; i < 3; i++)
{
    int local = i;   // 每次迭代新建一个变量
    actions.Add(() => Console.WriteLine(local));
}
// 现在输出 0 1 2
\`

C# 5+ 之后，\`foreach\` 中的循环变量会被自动拷贝（每个 Lambda 捕获不同的副本），但 \`for\` 仍然有此问题，必须手动拷贝。

### 八、表达式 Lambda vs 语句 Lambda

\`\`\`csharp
// 表达式 Lambda：单表达式，自动返回
Func<int, int> expr = x => x * x;

// 语句 Lambda：用 { } 包多条语句，必须 return
Func<int, int> stmt = x =>
{
    var sq = x * x;
    return sq + 1;
};
\`

表达式 Lambda 更简洁，且**可以转换为表达式树**（见下章）。语句 Lambda 只能转为委托。

### 九、Lambda 作为参数：LINQ 风格 ⭐

LINQ 大量使用 Lambda 作为参数：

\`\`\`csharp
var nums = new[] { 1, 2, 3, 4, 5 };

var evens = nums.Where(n => n % 2 == 0);                  // 过滤
var squared = nums.Select(n => n * n);                     // 映射
var sorted = nums.OrderBy(n => n);                          // 排序
var sum = nums.Aggregate((acc, n) => acc + n);             // 聚合
var found = nums.First(n => n > 3);                        // 查找
\`

Lambda 让 LINQ 读起来像 SQL 一样自然。

### 十、Lambda 与表达式树 Expression<T>

Lambda 不仅能转为委托，还能转为「表达式树」——一种数据结构表示：

\`\`\`csharp
// 委托：可执行
Func<int, int> f = x => x * 2;

// 表达式树：数据结构（不可执行，但可分析、可翻译）
Expression<Func<int, int>> expr = x => x * 2;

// 编译成委托后可执行
var compiled = expr.Compile();
Console.WriteLine(compiled(5));   // 10
\`

表达式树是 EF Core、IQueryable 翻译 LINQ 为 SQL 的核心机制。下一章详解。

### 十一、Lambda 中的弃元 _

从 C# 9 起，\`_\` 可以作为「弃元」（discard）——表示「我不在乎这个参数」：

\`\`\`csharp
Action<int, int> a = (_, y) => Console.WriteLine(y);   // 忽略第一个参数
\`

注意：多个 \`_\` 不会冲突，因为它们都是弃元。但如果方法只有一个 \`_\` 参数，会被当成普通变量名（向后兼容）。

### 十二、Lambda 的演进：自然类型（C# 10+）⭐

C# 10 之前，\`var f = x => x * 2;\` 编译错误——因为 Lambda 没有自然类型，无法推断。

C# 10 引入**自然类型**：当 Lambda 赋给 \`var\` 时，编译器会构造一个匹配的 \`Func\` 或 \`Action\`：

\`\`\`csharp
var f = (int x) => x * 2;        // Func<int, int>
var g = (string s) => s.Length;  // Func<string, int>
var h = () => 42;                // Func<int>
\`

注意：必须显式标注参数类型，否则编译器无法推断（\`var f = x => x * 2;\` 仍然报错）。

### 十三、Lambda 的其他改进

- **C# 10**：允许 Lambda 显式声明返回类型：\`var f = int (int x) => x * 2;\`
- **C# 10**：允许 Lambda 加特性：\`var f = [Plain] (int x) => x;\`
- **C# 11**：允许 Lambda 参数加 \`ref\`/\`out\`/\`in\` 修饰符。
- **C# 11**：放宽了方法组到委托的转换规则。

### 十四、Lambda 与 async

Lambda 可以是 async 的：

\`\`\`csharp
Func<string, Task> download = async url =>
{
    var client = new HttpClient();
    var html = await client.GetStringAsync(url);
    Console.WriteLine(html.Length);
};
\`

这是异步编程的基础（见异步章节）。

### 十五、Lambda 性能提示

- Lambda 编译成委托实例，调用开销很小（一个间接调用）。
- 闭包会创建额外的「闭包对象」，增加 GC 压力——热路径上慎用。
- 捕获 \`this\` 会延长对象生命周期，可能造成内存泄漏（事件订阅未取消时）。

### 十六、Lambda 的本质

Lambda 不是一个独立的「函数值类型」，而是：
- 赋给委托变量时 → 编译成一个委托实例。
- 赋给 \`Expression<T>\` 时 → 编译成表达式树数据结构。

C# 的「函数」必须依附于委托或表达式树，没有像 F# 那样独立的函数类型。

本章 demo 演示：Lambda 各种形式、闭包、捕获陷阱、LINQ 中 Lambda、表达式树 Expression<T>、自然类型、弃元。`,
    code: `// C# 12 顶级语句 - Lambda 表达式完整演示
// 演示：表达式/语句 Lambda、闭包、捕获陷阱、
//       LINQ 中的 Lambda、表达式树、自然类型、弃元

using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

// === 1. 表达式 Lambda：单表达式，自动返回 ===
Func<int, int> square = x => x * x;                  // 单参数省括号
Func<int, int, int> add = (a, b) => a + b;          // 多参数
Func<int> fortyTwo = () => 42;                       // 无参数
Func<string, string> toUpper = s => s.ToUpper();

Console.WriteLine("=== 1. 表达式 Lambda ===");
Console.WriteLine($"  Square(5) = {square(5)}");
Console.WriteLine($"  Add(3, 4) = {add(3, 4)}");
Console.WriteLine($"  fortyTwo() = {fortyTwo()}");
Console.WriteLine($"  toUpper('hi') = {toUpper("hi")}");

Console.WriteLine("\\n=== 2. 语句 Lambda：用 { } 包多条语句，必须 return ===");
Func<int, string> describe = x =>
{
    if (x < 0) return "负数";
    if (x == 0) return "零";
    return "正数";
};
Console.WriteLine($"  -5: {describe(-5)}");
Console.WriteLine($"  0: {describe(0)}");
Console.WriteLine($"  7: {describe(7)}");

Console.WriteLine("\\n=== 3. 类型推断：编译器根据委托类型推断参数 ===");
// 同一个 Lambda x => x*2，赋给不同委托，x 的类型不同
Func<int, int> intDoubler = x => x * 2;       // x 是 int
Func<double, double> dblDoubler = x => x * 2; // x 是 double
Func<string, int> strLen = s => s.Length;     // s 是 string
Console.WriteLine($"  int 5 * 2 = {intDoubler(5)}");
Console.WriteLine($"  double 2.5 * 2 = {dblDoubler(2.5)}");
Console.WriteLine($"  'hello' 长度 = {strLen("hello")}");

Console.WriteLine("\\n=== 4. 闭包：捕获外部变量 ===");
int factor = 10;
Func<int, int> multiplier = x => x * factor;   // 捕获 factor
Console.WriteLine($"  factor=10, multiplier(5) = {multiplier(5)}");   // 50

// 修改捕获的变量：Lambda 看到新值
factor = 20;
Console.WriteLine($"  factor=20, multiplier(5) = {multiplier(5)}");  // 100

// 捕获引用类型：Lambda 看到对象内部的变化
var list = new List<int> { 1, 2, 3 };
Func<int> getCount = () => list.Count;
Console.WriteLine($"  初始 list.Count = {getCount()}");
list.Add(4);
Console.WriteLine($"  Add 后 list.Count = {getCount()}");

Console.WriteLine("\\n=== 5. 捕获陷阱：for 循环中的捕获 ===");
// ❌ 陷阱：所有 Lambda 共享同一个 i，循环结束时 i=3
var badActions = new List<Action>();
for (int i = 0; i < 3; i++)
{
    badActions.Add(() => Console.Write(i + " "));
}
Console.Write("  错误版本: ");
foreach (var a in badActions) a();   // 输出 3 3 3
Console.WriteLine();

// ✅ 修复：每次迭代拷贝一份
var goodActions = new List<Action>();
for (int i = 0; i < 3; i++)
{
    int local = i;   // 每次迭代创建新变量
    goodActions.Add(() => Console.Write(local + " "));
}
Console.Write("  修复版本: ");
foreach (var a in goodActions) a();   // 输出 0 1 2
Console.WriteLine();

// ✅ C# 5+ foreach 自动拷贝循环变量
var foreachActions = new List<Action>();
foreach (var item in new[] { 10, 20, 30 })
{
    foreachActions.Add(() => Console.Write(item + " "));
}
Console.Write("  foreach 版本: ");
foreach (var a in foreachActions) a();   // 输出 10 20 30
Console.WriteLine();

Console.WriteLine("\\n=== 6. Lambda 作为 LINQ 参数 ===");
var nums = new[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

// Where: 过滤
var evens = nums.Where(n => n % 2 == 0);
Console.WriteLine($"  偶数: {string.Join(", ", evens)}");

// Select: 映射
var squares = nums.Select(n => n * n);
Console.WriteLine($"  平方: {string.Join(", ", squares)}");

// OrderBy: 排序
var desc = nums.OrderByDescending(n => n);
Console.WriteLine($"  降序: {string.Join(", ", desc)}");

// First/Single/Any/All：用 Lambda 表达条件
Console.WriteLine($"  第一个 > 5: {nums.First(n => n > 5)}");
Console.WriteLine($"  是否有 > 8: {nums.Any(n => n > 8)}");
Console.WriteLine($"  是否全为正: {nums.All(n => n > 0)}");

// Aggregate：累积
var sum = nums.Aggregate((acc, n) => acc + n);
Console.WriteLine($"  累积和: {sum}");

// 链式调用：Lambda 让 LINQ 像流水线
var result = nums
    .Where(n => n % 2 == 0)       // 取偶数
    .Select(n => n * 10)          // 乘 10
    .OrderByDescending(n => n)     // 降序
    .Take(2);                       // 取前两个
Console.WriteLine($"  链式: {string.Join(", ", result)}");

Console.WriteLine("\\n=== 7. 表达式树 Expression<T> ===");
// Lambda 赋给 Expression<Func<>> 会编译成「表达式树」数据结构
Expression<Func<int, int>> expr = x => x * 2 + 1;

// 看看表达式树长什么样
Console.WriteLine($"  表达式树: {expr}");
Console.WriteLine($"  Body: {expr.Body}");
Console.WriteLine($"  Body 类型: {expr.Body.NodeType}");   // Add
Console.WriteLine($"  参数: {expr.Parameters[0]}");

// 编译成委托后才能执行
var compiled = expr.Compile();
Console.WriteLine($"  编译后执行: compiled(5) = {compiled(5)}");   // 11

Console.WriteLine("\\n=== 8. 自然类型（C# 10+）：var + Lambda ===");
// C# 10+：用 var 接收 Lambda，参数需显式标注类型
var multiply = (int a, int b) => a * b;
var greet = (string name) => $"Hello, {name}!";
var noop = () => Console.WriteLine("  noop");

Console.WriteLine($"  multiply(3, 4) = {multiply(3, 4)}");
Console.WriteLine($"  greet('C#') = {greet("C#")}");
Console.Write("  noop: "); noop();

// 显式返回类型（C# 10+）
var parse = int (string s) => int.Parse(s);
Console.WriteLine($"  parse('123') = {parse("123")}");

Console.WriteLine("\\n=== 9. 弃元 _：忽略不关心的参数 ===");
// 弃元表示「这个参数我不在乎」
Action<int, int> printSecond = (_, y) => Console.WriteLine($"  只看第二个: {y}");
printSecond(100, 200);

Func<int, int, int, int> onlyThird = (_, _, z) => z;
Console.WriteLine($"  onlyThird(1, 2, 3) = {onlyThird(1, 2, 3)}");

// 多个 _ 不冲突：因为都是弃元
Action<int, int, int> multi = (_, _, _) => Console.WriteLine("  三个参数都不在乎");
multi(1, 2, 3);

Console.WriteLine("\\n=== 10. Lambda 与匿名方法对比 ===");
// 旧：匿名方法（已不推荐）
Func<int, int> oldStyle = delegate(int x) { return x * x; };
// 新：Lambda（推荐）
Func<int, int> newStyle = x => x * x;
Console.WriteLine($"  匿名方法: {oldStyle(5)}");
Console.WriteLine($"  Lambda: {newStyle(5)}");

Console.WriteLine("\\n=== 11. 闭包实战：生成器函数 ===");
// 用闭包实现一个计数器
Func<int> makeCounter()
{
    int count = 0;   // 闭包变量
    return () => ++count;
}

var counter1 = makeCounter();
var counter2 = makeCounter();   // 独立的闭包，互不影响
Console.WriteLine($"  counter1: {counter1()}, {counter1()}, {counter1()}");
Console.WriteLine($"  counter2: {counter2()}, {counter2()}");

Console.WriteLine("\\n=== 12. 高阶函数：接收函数参数，返回函数 ===");
// 接收一个函数，返回它的「组合版本」
Func<int, int> compose(Func<int, int> f, Func<int, int> g)
    => x => f(g(x));

var doubleIt = (int x) => x * 2;
var plusOne = (int x) => x + 1;
var doubleThenPlusOne = compose(plusOne, doubleIt);   // x => (x*2) + 1
Console.WriteLine($"  doubleThenPlusOne(5) = {doubleThenPlusOne(5)}");   // 11

Console.WriteLine("\\n=== 13. 性能提示：闭包对象 ===");
// 闭包会创建额外对象
int captured = 42;
Func<int, int> withClosure = x => x + captured;   // 创建闭包对象，多一次间接
Func<int, int> noClosure = x => x + 42;           // 静态委托，无闭包
Console.WriteLine($"  withClosure(8) = {withClosure(8)}");
Console.WriteLine($"  noClosure(8) = {noClosure(8)}");
Console.WriteLine("  提示：热路径上避免不必要的闭包");`,
    lang: 'cs',
  },

  // ============================================================
  // 第三十七章：事件
  // ============================================================
  {
    id: 'csharp4-ch37',
    group: '第五部分 委托、事件与 Lambda',
    icon: '🎬',
    title: '事件',
    content: `## 第三十七章　事件

事件（event）是基于委托的「发布订阅」模式：一个对象状态变化时通知其他对象。它是 GUI 框架、消息总线、响应式编程的基础。

### 一、为什么需要事件 ⭐

假设你写一个按钮类，希望点击时通知外部代码。你可能会暴露一个委托：

\`\`\`csharp
class Button
{
    public Action Clicked;   // ❌ 暴露委托
}

var btn = new Button();
btn.Clicked = MyHandler;   // 调用方覆盖了之前的订阅！
btn.Clicked = OtherHandler; // 之前的 MyHandler 丢了
\`

问题：
1. 外部可以**覆盖**其他订阅者（用 \`=\` 而不是 \`+=\`）。
2. 外部可以**直接触发**事件（\`btn.Clicked()\`），破坏发布者的封装。
3. 没有线程安全保护。

\`event\` 关键字就是为解决这些问题而生。

### 二、event 关键字 ⭐

\`event\` 是一个修饰委托字段的特殊关键字，给委托加了**封装**：

\`\`\`csharp
class Button
{
    public event Action Clicked;   // ✅ 加 event

    public void Click()
    {
        Clicked?.Invoke();   // ✅ 只有类自己能触发
    }
}

var btn = new Button();
btn.Clicked += MyHandler;   // ✅ 只能 += / -=
// btn.Clicked = MyHandler;   // ❌ 编译错误：不能覆盖
// btn.Clicked();             // ❌ 编译错误：外部不能触发
\`

\`event\` 的本质：一个「只允许 += / -=」的委托字段，且只能在声明它的类内部触发。

### 三、EventHandler 与 EventHandler<T> ⭐

.NET 的事件约定：事件委托签名是 \`(object? sender, EventArgs e) => void\`。两个内置委托：

- \`EventHandler\`：无自定义数据，用 \`EventArgs.Empty\`。
- \`EventHandler<TEventArgs>\`：带自定义数据，TEventArgs 必须派生自 \`EventArgs\`。

\`\`\`csharp
public event EventHandler? Clicked;                       // 无数据
public event EventHandler<ClickArgs>? Clicked;             // 带数据
\`

第一个参数 \`sender\` 是触发事件的对象（通常是 this），让订阅者能区分是谁触发的事件。

### 四、自定义 EventArgs

要传递事件相关数据，定义一个 \`EventArgs\` 子类：

\`\`\`csharp
class ClickArgs : EventArgs
{
    public int X { get; init; }
    public int Y { get; init; }
    public DateTimeOffset Time { get; init; } = DateTimeOffset.Now;
}
\`

约定：用 \`init\` 或只读属性，事件数据应该是不可变的。

### 五、订阅与取消订阅 ⭐

\`\`\`csharp
btn.Clicked += OnClick;     // 订阅
btn.Clicked -= OnClick;     // 取消订阅
\`

要点：
- \`+=\` / \`-=\` 是线程安全的（编译器生成 \`add\` / \`remove\` 访问器，用 \`Interlocked.CompareExchange\`）。
- 同一个处理器订阅两次，会被调用两次。
- \`-=\` 一个未订阅的处理器是 no-op，不报错。
- 取消订阅很重要：否则订阅者无法被 GC 回收（事件持有订阅者引用）。

### 六、触发事件：OnXxx 模式 ⭐

.NET 约定：在类内部用 \`protected virtual void OnXxx(EventArgs e)\` 方法触发事件：

\`\`\`csharp
class Button
{
    public event EventHandler? Clicked;

    protected virtual void OnClicked(EventArgs e)
    {
        Clicked?.Invoke(this, e);   // null 安全：只有有订阅者才触发
    }

    public void SimulateClick() => OnClicked(EventArgs.Empty);
}
\`

好处：
- 派生类可以重写 \`OnClicked\` 来拦截或自定义事件触发。
- 集中触发逻辑，避免到处写 \`Clicked?.Invoke()\`。
- 子类不订阅事件也能响应（直接 override OnClicked）。

### 七、event vs 普通委托：封装性对比 ⭐

| 对比项 | public 委托字段 | public event |
| --- | --- | --- |
| 外部覆盖 (=) | ✅ | ❌（只能 +=/-=） |
| 外部触发 (Invoke) | ✅ | ❌（只有声明类能触发） |
| 线程安全 | ❌（自己保证） | ✅（编译器自动加锁） |
| 接口声明 | ❌（字段不能在接口） | ✅（事件可在接口中声明） |

\`event\` 是「封装后的委托」，仅此而已。如果不需要外部订阅，就用普通委托；需要发布订阅模式，就用 event。

### 八、事件访问器 add / remove

像属性有 get/set，事件也有 add/remove。默认的 \`event\` 自动生成这两个访问器。你也可以手写：

\`\`\`csharp
class MyPublisher
{
    private EventHandler? _myEvent;
    public event EventHandler MyEvent
    {
        add => _myEvent += value;
        remove => _myEvent -= value;
    }
}
\`

手写访问器的场景：
- 显式实现接口事件。
- 自定义线程安全策略。
- 加日志/监控订阅情况。

### 九、事件与线程安全

默认的 \`event\` 使用的 \`+=\` / \`-=\` 是线程安全的（用 \`Interlocked.CompareExchange\`）。但**触发事件不是原子的**：

\`\`\`csharp
// ❌ 不安全：在 null 检查和 Invoke 之间，订阅者可能取消订阅
if (Clicked != null)
    Clicked(this, e);

// ✅ 安全：拷贝到局部变量
var handler = Clicked;
if (handler != null)
    handler(this, e);

// ✅ 更简洁：null 条件运算符
Clicked?.Invoke(this, e);
\`

\`Clicked?.Invoke()\` 编译后等价于「拷贝 + null 检查 + 调用」，是推荐写法。

### 十、INotifyPropertyChanged 实战 ⭐

WPF/UWP/MAUI 数据绑定的核心接口：

\`\`\`csharp
class Product : INotifyPropertyChanged
{
    private decimal _price;
    public decimal Price
    {
        get => _price;
        set
        {
            if (_price != value)
            {
                _price = value;
                OnPropertyChanged(nameof(Price));
            }
        }
    }

    public event PropertyChangedEventHandler? PropertyChanged;
    protected void OnPropertyChanged(string name)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}
\`

UI 框架订阅 \`PropertyChanged\` 事件，属性变化时自动刷新界面。

### 十一、事件链式触发

事件可以触发事件，形成链：

\`\`\`csharp
class Order { public event EventHandler? Placed; ... }
class Inventory { public event EventHandler? Reserved; ... }

order.Placed += (s, e) => inventory.Reserve(...);   // 订单触发库存
\`

注意：链式触发要小心循环，A 触发 B，B 又触发 A，会无限递归。

### 十二、事件内存泄漏陷阱 ⚠️

事件持有订阅者的**强引用**。如果订阅者不取消订阅，发布者会一直引用它，导致订阅者无法被 GC 回收——这就是常见的事件内存泄漏。

解决：
1. 在订阅者的 \`Dispose\` 中 \`-=\`。
2. 用弱事件模式（\`WeakReference\` 或 \`WeakEventManager\`）。
3. 用 \`IObservable<T>\` / \`Subject<T>\`（Reactive Extensions）替代。

### 十三、事件 vs 接口回调

事件是「松耦合」的回调：发布者不依赖订阅者类型。接口回调是「紧耦合」：发布者必须知道订阅者实现的接口。

- 用事件：当订阅者**数量不定、动态变化、互不相关**时。
- 用接口：当订阅者**数量固定、有共同契约**时。

### 十四、事件溯源（Event Sourcing）简介

更高级的模式：把所有状态变化记录为不可变事件序列，重建状态时回放事件。这是 DDD（领域驱动设计）和事件溯源架构的核心。C# 中可以用 \`MediatR\`、\`EventStore\` 等库支持。

本章 demo 演示：完整的 Publisher/Subscriber 事件系统、自定义 EventArgs、订阅/触发、OnXxx 模式、INotifyPropertyChanged、事件访问器、内存泄漏示意。`,
    code: `// C# 12 顶级语句 - 事件完整演示
// 演示：event 关键字、EventHandler、自定义 EventArgs、OnXxx 模式、
//       INotifyPropertyChanged、事件访问器、线程安全触发

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;

// === 1. 自定义 EventArgs：携带点击坐标 ===
class ClickEventArgs : EventArgs
{
    public int X { get; init; }      // init 保证不可变
    public int Y { get; init; }
    public DateTimeOffset Time { get; init; } = DateTimeOffset.Now;

    public override string ToString() => $"({X}, {Y}) @ {Time:HH:mm:ss}";
}

// === 2. 事件发布者：Button 类 ===
class Button
{
    // 1) 字段式事件：编译器自动生成 add/remove 访问器
    public event EventHandler<ClickEventArgs>? Clicked;

    // 2) OnXxx 模式：protected virtual，子类可重写
    protected virtual void OnClicked(ClickEventArgs e)
    {
        // null 条件运算符：只有有订阅者才触发（线程安全写法）
        Clicked?.Invoke(this, e);
    }

    // 模拟用户点击
    public void SimulateClick(int x, int y)
    {
        Console.WriteLine($"  [Button] 触发点击 ({x}, {y})");
        OnClicked(new ClickEventArgs { X = x, Y = y });
    }
}

// === 3. 订阅者：UI 通知器 ===
class UINotifier
{
    public string Name { get; }

    public UINotifier(string name) => Name = name;

    // 事件处理器方法：签名必须匹配 EventHandler<ClickEventArgs>
    public void OnButtonClicked(object? sender, ClickEventArgs e)
    {
        Console.WriteLine($"    [{Name}] 收到点击事件: sender={sender?.GetType().Name}, e={e}");
    }
}

// === 4. 手写事件访问器：add/remove ===
class ObservableValue<T>
{
    private T _value = default!;
    private EventHandler<T>? _valueChanged;   // 私有委托字段

    public T Value
    {
        get => _value;
        set
        {
            if (!EqualityComparer<T>.Default.Equals(_value, value))
            {
                _value = value;
                OnValueChanged();
            }
        }
    }

    // 手写事件访问器：可以加日志、监控等
    public event EventHandler<T> ValueChanged
    {
        add
        {
            Console.WriteLine($"    [ObservableValue] 新订阅者加入");
            _valueChanged += value;
        }
        remove
        {
            Console.WriteLine($"    [ObservableValue] 订阅者移除");
            _valueChanged -= value;
        }
    }

    protected virtual void OnValueChanged()
    {
        _valueChanged?.Invoke(this, _value);
    }
}

// === 5. INotifyPropertyChanged 实战：可观察的产品 ===
class Product : INotifyPropertyChanged
{
    private string _name = "";
    private decimal _price;

    public string Name
    {
        get => _name;
        set
        {
            if (_name != value)
            {
                _name = value;
                OnPropertyChanged();   // 用 [CallerMemberName] 自动获取属性名
            }
        }
    }

    public decimal Price
    {
        get => _price;
        set
        {
            if (_price != value)
            {
                _price = value;
                OnPropertyChanged();
            }
        }
    }

    // INotifyPropertyChanged 接口要求的事件
    public event PropertyChangedEventHandler? PropertyChanged;

    // [CallerMemberName]：编译器自动填入调用方的方法/属性名
    protected virtual void OnPropertyChanged([CallerMemberName] string? propertyName = null)
    {
        // 线程安全触发：null 条件运算符
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}

// === 6. 事件链：订单触发库存 ===
class Order
{
    public int OrderId { get; }
    public Order(int id) => OrderId = id;

    public event EventHandler? Placed;

    public void Place()
    {
        Console.WriteLine($"  [Order] 订单 #{OrderId} 已下达");
        Placed?.Invoke(this, EventArgs.Empty);
    }
}

class Inventory
{
    public void Reserve(object? sender, EventArgs e)
    {
        var order = (Order)sender!;
        Console.WriteLine($"  [Inventory] 已为订单 #{order.OrderId} 预留库存");
    }
}

// === 7. 顶级语句：运行所有演示 ===
Console.WriteLine("=== 1. 基本 event + 自定义 EventArgs ===");
var button = new Button();

var notifier1 = new UINotifier("Logger");
var notifier2 = new UINotifier("Analytics");

// 订阅：用 += 注册多个处理器
button.Clicked += notifier1.OnButtonClicked;
button.Clicked += notifier2.OnButtonClicked;

// 触发
button.SimulateClick(10, 20);
button.SimulateClick(100, 200);

// 取消订阅
button.Clicked -= notifier1.OnButtonClicked;
Console.WriteLine("  取消订阅 notifier1 后:");
button.SimulateClick(50, 50);

Console.WriteLine("\\n=== 2. event 与普通委托的区别演示 ===");
Console.WriteLine("  event 关键字限制了外部行为:");
Console.WriteLine("    - 只能 += / -=（不能直接 =）");
Console.WriteLine("    - 只能在类内部触发（外部不能 btn.Clicked()）");
Console.WriteLine("    - 自动线程安全的订阅/取消订阅");

Console.WriteLine("\\n=== 3. 手写事件访问器 add/remove ===");
var obs = new ObservableValue<int>();

EventHandler<int> handler1 = (s, v) => Console.WriteLine($"    Handler1: value = {v}");
EventHandler<int> handler2 = (s, v) => Console.WriteLine($"    Handler2: value = {v}");

Console.WriteLine("  订阅 handler1:");
obs.ValueChanged += handler1;

Console.WriteLine("  订阅 handler2:");
obs.ValueChanged += handler2;

Console.WriteLine("  设置 Value = 42:");
obs.Value = 42;

Console.WriteLine("  取消订阅 handler1:");
obs.ValueChanged -= handler1;

Console.WriteLine("  设置 Value = 99:");
obs.Value = 99;

Console.WriteLine("\\n=== 4. INotifyPropertyChanged 实战 ===");
var product = new Product { Name = "鼠标", Price = 99.9m };

// 订阅 PropertyChanged 事件（模拟 UI 数据绑定）
product.PropertyChanged += (s, e) =>
{
    var p = (Product)s!;
    var value = e.PropertyName switch
    {
        nameof(Product.Name) => (object)p.Name,
        nameof(Product.Price) => p.Price,
        _ => "(unknown)"
    };
    Console.WriteLine($"  [UI] 属性 {e.PropertyName} 变为: {value}");
};

Console.WriteLine("  修改 Name:");
product.Name = "机械键盘";
Console.WriteLine("  修改 Price:");
product.Price = 299.5m;
Console.WriteLine("  修改为相同 Price（不触发）:");
product.Price = 299.5m;
Console.WriteLine("  再次修改 Price:");
product.Price = 199.0m;

Console.WriteLine("\\n=== 5. 事件链式触发 ===");
var order = new Order(20250719001);
var inventory = new Inventory();

// 订阅：订单下达 -> 库存预留
order.Placed += inventory.Reserve;
order.Placed += (s, e) => Console.WriteLine($"  [Email] 发送订单确认邮件");
order.Placed += (s, e) => Console.WriteLine($"  [Payment] 触发扣款");

order.Place();

Console.WriteLine("\\n=== 6. 多个订阅者全部触发 ===");
var btn2 = new Button();
int count = 0;
btn2.Clicked += (s, e) => count++;
btn2.Clicked += (s, e) => count++;
btn2.Clicked += (s, e) => count++;

btn2.SimulateClick(1, 1);
Console.WriteLine($"  3 个处理器各 ++count，count = {count}");

Console.WriteLine("\\n=== 7. OnXxx 模式：派生类重写 ===");
class CustomButton : Button
{
    // 重写 OnClicked：在事件触发前/后插入自定义逻辑
    protected override void OnClicked(ClickEventArgs e)
    {
        Console.WriteLine($"    [CustomButton] 拦截事件，触发前 e={e}");
        base.OnClicked(e);   // 调用基类：真正触发事件
        Console.WriteLine($"    [CustomButton] 事件已触发");
    }
}

var customBtn = new CustomButton();
customBtn.Clicked += (s, e) => Console.WriteLine($"    [订阅者] 收到 {e}");
customBtn.SimulateClick(5, 5);

Console.WriteLine("\\n=== 8. 事件内存泄漏示意 ===");
Console.WriteLine("  事件持有订阅者的强引用，订阅者不取消订阅会导致内存泄漏:");
Console.WriteLine("  - 解决方案 1：在订阅者 Dispose 中 -= 取消订阅");
Console.WriteLine("  - 解决方案 2：使用 WeakReference 或 WeakEventManager");
Console.WriteLine("  - 解决方案 3：使用 IObservable<T> / Reactive Extensions");

Console.WriteLine("\\n=== 9. 线程安全的事件触发 ===");
Console.WriteLine("  ❌ 不安全写法（旧代码常见）:");
Console.WriteLine("    if (Clicked != null) { Clicked(this, e); }  // 检查与调用之间订阅者可能 -= ");
Console.WriteLine("  ✅ 安全写法 1：拷贝局部变量");
Console.WriteLine("    var handler = Clicked; if (handler != null) handler(this, e);");
Console.WriteLine("  ✅ 安全写法 2：null 条件运算符（推荐）");
Console.WriteLine("    Clicked?.Invoke(this, e);  // 编译器自动拷贝");

Console.WriteLine("\\n=== 10. 事件 vs 接口回调 ===");
Console.WriteLine("  事件：松耦合，发布者无需知道订阅者类型，订阅者动态增减");
Console.WriteLine("  接口：紧耦合，发布者必须知道订阅者实现的接口");
Console.WriteLine("  选择：动态多订阅者用 event，固定契约用接口");`,
    lang: 'cs',
  },

  // ============================================================
  // 第三十八章：表达式树
  // ============================================================
  {
    id: 'csharp4-ch38',
    group: '第五部分 委托、事件与 Lambda',
    icon: '🌳',
    title: '表达式树',
    content: `## 第三十八章　表达式树

表达式树（Expression Tree）是把代码当数据的一种结构。它把 Lambda 表达式表示为一棵「抽象语法树」节点，让你可以分析、修改、翻译它。这是 LINQ Provider、EF Core SQL 翻译、动态查询的基础。

### 一、Expression<TDelegate> ⭐

\`Expression<TDelegate>\` 是一种特殊类型，让 Lambda 编译成数据结构而不是可执行委托：

\`\`\`csharp
// 委托：可执行
Func<int, int> f = x => x * 2;

// 表达式树：数据结构（不可执行，但可分析）
Expression<Func<int, int>> expr = x => x * 2;

// 编译成委托后才能执行
var compiled = expr.Compile();
Console.WriteLine(compiled(5));   // 10
\`

同一个 Lambda 语法，赋给 \`Func<>\` 编译成委托，赋给 \`Expression<Func<>>\` 编译成数据。这是 C# 编译器的特殊处理。

### 二、Expression 与 Func 的区别 ⭐

| 对比项 | Func<T,TResult> | Expression<Func<T,TResult>> |
| --- | --- | --- |
| 本质 | 可执行的委托 | 数据结构（AST） |
| 能否直接调用 | ✅ | ❌（要 Compile） |
| 能否分析结构 | ❌ | ✅ |
| 能否翻译成 SQL | ❌ | ✅ |
| 性能 | 高 | 低（解析有开销） |
| 用途 | 执行函数 | 分析、翻译、动态生成 |

经验：**只需要执行就用 Func，需要分析或翻译就用 Expression**。

### 三、Expression 静态构造方法

表达式树可以手动用 \`Expression\` 类的静态方法构建：

\`\`\`csharp
// 手动构建 x => x + 1
var param = Expression.Parameter(typeof(int), "x");                  // 参数 x
var one = Expression.Constant(1, typeof(int));                        // 常量 1
var body = Expression.Add(param, one);                                // x + 1
var lambda = Expression.Lambda<Func<int, int>>(body, param);         // x => x + 1

var f = lambda.Compile();
Console.WriteLine(f(5));   // 6
\`

常用静态方法：
- \`Parameter\`：参数
- \`Constant\`：常量
- \`Add\` / \`Subtract\` / \`Multiply\` / \`Divide\` / \`Modulo\`：算术
- \`Equal\` / \`NotEqual\` / \`GreaterThan\` / \`LessThan\`：比较
- \`And\` / \`Or\` / \`Not\`：逻辑
- \`AndAlso\` / \`OrElse\`：短路逻辑
- \`Call\`：方法调用
- \`Property\` / \`Field\`：成员访问
- \`Lambda\`：包装成 Lambda
- \`Condition\`：三元运算
- \`New\` / \`MemberInit\`：构造对象

### 四、Compile()：编译成委托

\`Compile()\` 把表达式树编译成 IL 委托，可以执行：

\`\`\`csharp
var compiled = expr.Compile();   // 编译一次
compiled(5);                      // 多次调用
\`

注意：编译有开销，应该缓存编译结果。每次 \`Compile()\` 都会生成新的 IL。

### 五、ExpressionVisitor：遍历表达式树 ⭐

\`ExpressionVisitor\` 是表达式树的「访问者模式」基类，让你可以遍历并修改表达式树：

\`\`\`csharp
class MyVisitor : ExpressionVisitor
{
    public override Expression Visit(Expression node)
    {
        Console.WriteLine($"访问节点: {node.NodeType}");
        return base.Visit(node);
    }
}
\`

遍历是递归的：访问 \`x + 1\` 会先访问 \`x\`，再访问 \`1\`，最后访问 \`+\`。

### 六、表达式树用于 LINQ Provider

\`IQueryable<T>\` 持有一棵表达式树，可以被 LINQ Provider（如 EF Core）翻译成 SQL：

\`\`\`csharp
var query = db.Users.Where(u => u.Age > 18).OrderBy(u => u.Name);
// 这里 u => u.Age > 18 是 Expression<Func<User, bool>>，不是 Func<User, bool>
// EF Core 把它翻译成: SELECT * FROM Users WHERE Age > 18 ORDER BY Name
\`

为什么必须用 \`Expression\`？因为 \`Func<User, bool>\` 不能翻译成 SQL（它是已编译的 IL 代码），而 \`Expression\` 是数据结构，可以分析。

### 七、表达式树用于动态查询（EF Core PredicateBuilder）⭐

动态拼接查询条件是表达式树的杀手级应用：

\`\`\`csharp
// 需求：根据用户输入动态构造 where 条件
Expression<Func<User, bool>> predicate = u => true;

if (filterByAge)
    predicate = predicate.And(u => u.Age > 18);   // 拼接条件
if (filterByName)
    predicate = predicate.And(u => u.Name.Contains("张"));

var result = db.Users.Where(predicate).ToList();
\`

这需要「合并两个表达式」的辅助方法（\`PredicateBuilder\`）。开源库如 LinqKit 提供了这个能力。

### 八、表达式树的限制 ⚠️

表达式树有语法限制：
- **不能有语句体**：\`(int x) => { return x; }\` 不能作为 \`Expression\`（只能作为 \`Func\`）。
- **不能赋值**：\`x = 5\` 不行。
- **不能用 ref/out 参数**。
- **不能包含 try/catch/for/while** 等语句（C# 4 之前完全不行，C# 4+ 部分支持，但很少用）。

只能用「表达式」语法。如果需要语句，可以手动构建 \`Expression\` 节点。

### 九、Dynamic LINQ 简介

微软的 \`System.Linq.Dynamic.Core\` 库允许你用字符串写查询：

\`\`\`csharp
var query = db.Users.Where("Age > 18 and Name.Contains(\\"张\\")");
\`

它内部把字符串解析成表达式树。适合 UI 动态查询场景，但有 SQL 注入风险，要谨慎使用。

### 十、表达式树在元编程中的应用

表达式树可以动态生成代码，是「轻量级元编程」工具：

\`\`\`csharp
// 动态生成属性的 getter
var paramObj = Expression.Parameter(typeof(object), "obj");
var cast = Expression.Convert(paramObj, typeof(Product));
var prop = Expression.Property(cast, "Price");
var castResult = Expression.Convert(prop, typeof(object));
var lambda = Expression.Lambda<Func<object, object>>(castResult, paramObj);
var getter = lambda.Compile();

var price = getter(someProduct);
\`

这比 \`反射\` 快得多（编译后是直接调用），是 ORM、序列化库的常用技巧。

### 十一、表达式树 vs 反射 vs Emit

三种动态代码技术：

| 技术 | 性能 | 灵活度 | 复杂度 |
| --- | --- | --- | --- |
| 反射 | 慢 | 中 | 低 |
| 表达式树 Compile | 快 | 中 | 中 |
| ReflectionEmit | 最快 | 高 | 高 |

经验：需要中等灵活度 + 高性能时，优先用表达式树。需要极致性能或运行时生成完整类时，用 Emit。

### 十二、表达式树的 ToString

\`Expression\` 重写了 \`ToString\`，会输出可读的字符串表示：

\`\`\`csharp
Expression<Func<int, int, bool>> e = (x, y) => x + y > 10;
Console.WriteLine(e);   // (x, y) => (x + y) > 10
\`

调试时很有用。

### 十三、表达式树与 F# 对比

F# 的「代码引用」（Quotation）类似 C# 的表达式树，但更强大：可以表示语句、模式匹配等。C# 的表达式树限制更多，主要用于 LINQ。

### 十四、表达式树的演进

- C# 3.0：引入 \`Expression<TDelegate>\`，仅支持表达式 Lambda。
- C# 4.0：扩展支持部分语句（赋值、条件等），但很少用。
- .NET 4：加入 \`ExpressionVisitor\`。
- 现代 C#：表达式树主要用于 LINQ Provider 和动态查询。

本章 demo 演示：手动构建 \`(x, y) => x + y > 10\` 表达式树、Compile 执行、ExpressionVisitor 遍历、动态查询示意。`,
    code: `// C# 12 顶级语句 - 表达式树完整演示
// 演示：Expression<T>、静态构造方法、Compile()、ExpressionVisitor、
//       动态构建 (x, y) => x + y > 10、动态查询示意

using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

// === 1. Expression<Func<>> 与 Func<> 的区别 ===
Console.WriteLine("=== 1. Expression vs Func ===");

// Func：编译成可执行的委托
Func<int, int> func = x => x * 2;
Console.WriteLine($"  Func 直接调用: func(5) = {func(5)}");

// Expression<Func<>>：编译成数据结构（AST）
Expression<Func<int, int>> expr = x => x * 2;
Console.WriteLine($"  Expression.ToString(): {expr}");
Console.WriteLine($"  Expression.Body: {expr.Body}");
Console.WriteLine($"  Expression.Body 类型: {expr.Body.NodeType}");   // Multiply
Console.WriteLine($"  Expression 参数: {expr.Parameters[0]}");

// Expression 不能直接调用，要先 Compile
// Console.WriteLine(expr(5));  // ❌ 编译错误：不能调用 Expression
var compiled = expr.Compile();
Console.WriteLine($"  Expression.Compile()(5) = {compiled(5)}");

Console.WriteLine("\\n=== 2. 手动构建 x => x + 1 表达式树 ===");

// 步骤 1：声明参数
ParameterExpression paramX = Expression.Parameter(typeof(int), "x");

// 步骤 2：常量
ConstantExpression constant1 = Expression.Constant(1, typeof(int));

// 步骤 3：构造 x + 1
BinaryExpression addExpr = Expression.Add(paramX, constant1);

// 步骤 4：包装成 Lambda
Expression<Func<int, int>> lambda =
    Expression.Lambda<Func<int, int>>(addExpr, paramX);

Console.WriteLine($"  手动构建的 Lambda: {lambda}");
Console.WriteLine($"  Body: {lambda.Body}");
Console.WriteLine($"  Body.NodeType: {lambda.Body.NodeType}");   // Add
Console.WriteLine($"  Body.Left: {((BinaryExpression)lambda.Body).Left}");
Console.WriteLine($"  Body.Right: {((BinaryExpression)lambda.Body).Right}");

// 编译并执行
var compiledLambda = lambda.Compile();
Console.WriteLine($"  执行 compiledLambda(10) = {compiledLambda(10)}");

Console.WriteLine("\\n=== 3. 手动构建 (x, y) => x + y > 10 表达式树 ===");

// 两个参数
ParameterExpression px = Expression.Parameter(typeof(int), "x");
ParameterExpression py = Expression.Parameter(typeof(int), "y");

// x + y
BinaryExpression sum = Expression.Add(px, py);

// 常量 10
ConstantExpression ten = Expression.Constant(10, typeof(int));

// (x + y) > 10
BinaryExpression greaterThan = Expression.GreaterThan(sum, ten);

// 包装成 Lambda
Expression<Func<int, int, bool>> checkExpr =
    Expression.Lambda<Func<int, int, bool>>(greaterThan, px, py);

Console.WriteLine($"  手动构建: {checkExpr}");
Console.WriteLine($"  Body: {checkExpr.Body}");

// 编译并执行
var checkFunc = checkExpr.Compile();
Console.WriteLine($"  checkFunc(3, 5) = {checkFunc(3, 5)}");   // (3+5)>10 = false
Console.WriteLine($"  checkFunc(7, 8) = {checkFunc(7, 8)}");   // (7+8)>10 = true
Console.WriteLine($"  checkFunc(5, 5) = {checkFunc(5, 5)}");   // (5+5)>10 = false

Console.WriteLine("\\n=== 4. ExpressionVisitor：遍历表达式树 ===");

// 自定义访问者：打印每个节点
class PrintingVisitor : ExpressionVisitor
{
    private int _depth = 0;

    public override Expression Visit(Expression node)
    {
        if (node == null) return node!;

        // 缩进表示层级
        string indent = new string(' ', _depth * 2);
        Console.WriteLine($"  {indent}{node.NodeType}: {node}");

        _depth++;
        base.Visit(node);   // 递归访问子节点
        _depth--;
        return node;
    }
}

// 测试访问者
Expression<Func<int, int, bool>> complexExpr = (x, y) => x * 2 + y > 10;
Console.WriteLine($"  遍历表达式: {complexExpr}");
Console.WriteLine("  树结构:");
var visitor = new PrintingVisitor();
visitor.Visit(complexExpr.Body);

Console.WriteLine("\\n=== 5. ExpressionVisitor：修改表达式树 ===");

// 把所有 > 比较改成 >=
class GreaterToGreaterEqualVisitor : ExpressionVisitor
{
    protected override Expression VisitBinary(BinaryExpression node)
    {
        // 先递归处理子节点
        var left = Visit(node.Left);
        var right = Visit(node.Right);

        // 如果当前节点是 >，改成 >=
        if (node.NodeType == ExpressionType.GreaterThan)
        {
            return Expression.GreaterThanOrEqual(left, right);
        }
        return node.Update(left, node.Conversion, right);
    }
}

Expression<Func<int, int, bool>> originalExpr = (x, y) => x + y > 10;
Console.WriteLine($"  原表达式: {originalExpr}");

var modifier = new GreaterToGreaterEqualVisitor();
Expression newBody = modifier.Visit(originalExpr.Body);
Expression<Func<int, int, bool>> modifiedExpr =
    Expression.Lambda<Func<int, int, bool>>(newBody, originalExpr.Parameters);
Console.WriteLine($"  修改后:   {modifiedExpr}");

var origFunc = originalExpr.Compile();
var modiFunc = modifiedExpr.Compile();
Console.WriteLine($"  原函数(5, 5) = {origFunc(5, 5)}");   // (5+5)>10 = false
Console.WriteLine($"  改后(5, 5) = {modiFunc(5, 5)}");    // (5+5)>=10 = true

Console.WriteLine("\\n=== 6. 动态拼接查询条件（PredicateBuilder 思路） ===");

// 简化版 PredicateBuilder：合并两个 Expression<Func<T, bool>>
static class PredicateBuilder
{
    public static Expression<Func<T, bool>> True<T>() => f => true;
    public static Expression<Func<T, bool>> False<T>() => f => false;

    public static Expression<Func<T, bool>> And<T>(
        this Expression<Func<T, bool>> first, Expression<Func<T, bool>> second)
    {
        // 把 second 的参数替换成 first 的参数
        var param = first.Parameters[0];
        var visitor = new ParameterReplaceVisitor(second.Parameters[0], param);
        var body = Expression.AndAlso(first.Body, visitor.Visit(second.Body));
        return Expression.Lambda<Func<T, bool>>(body, param);
    }
}

class ParameterReplaceVisitor : ExpressionVisitor
{
    private readonly ParameterExpression _oldParam;
    private readonly ParameterExpression _newParam;

    public ParameterReplaceVisitor(ParameterExpression oldParam, ParameterExpression newParam)
    {
        _oldParam = oldParam;
        _newParam = newParam;
    }

    protected override Expression VisitParameter(ParameterExpression node)
        => node == _oldParam ? _newParam : node;
}

// 测试动态查询
class User
{
    public string Name { get; set; } = "";
    public int Age { get; set; }
    public bool IsActive { get; set; }
    public override string ToString() => $"{Name}({Age}岁, {(IsActive ? "在职" : "离职")})";
}

var users = new List<User>
{
    new() { Name = "张三", Age = 30, IsActive = true },
    new() { Name = "李四", Age = 25, IsActive = false },
    new() { Name = "张五", Age = 35, IsActive = true },
    new() { Name = "王六", Age = 28, IsActive = true },
};

// 动态构造条件：所有用户都符合（true）
Expression<Func<User, bool>> predicate = PredicateBuilder.True<User>();

// 加入「年龄 > 26」条件
predicate = predicate.And(u => u.Age > 26);
Console.WriteLine($"  条件1 (Age>26): {predicate}");

// 加入「名字包含张」条件
predicate = predicate.And(u => u.Name.Contains("张"));
Console.WriteLine($"  条件2 (+含张): {predicate}");

// 编译执行
var predFunc = predicate.Compile();
var matched = users.Where(predFunc).ToList();
Console.WriteLine($"  匹配结果:");
foreach (var u in matched) Console.WriteLine($"    {u}");

Console.WriteLine("\\n=== 7. 动态生成属性的 getter ===");

// 用 Expression 比 反射 快得多：编译成 IL 委托
class PropertyAccessorFactory
{
    public static Func<object, object?> CreateGetter(Type targetType, string propertyName)
    {
        // 参数：object obj
        var paramObj = Expression.Parameter(typeof(object), "obj");
        // 转换为目标类型
        var cast = Expression.Convert(paramObj, targetType);
        // 访问属性
        var prop = Expression.Property(cast, propertyName);
        // 把结果转成 object
        var castResult = Expression.Convert(prop, typeof(object));
        // 编译成委托
        return Expression.Lambda<Func<object, object?>>(castResult, paramObj).Compile();
    }
}

var product = new { Name = "键盘", Price = 199.0 };
var nameGetter = PropertyAccessorFactory.CreateGetter(product.GetType(), "Name");
var priceGetter = PropertyAccessorFactory.CreateGetter(product.GetType(), "Price");
Console.WriteLine($"  Product.Name = {nameGetter(product)}");
Console.WriteLine($"  Product.Price = {priceGetter(product)}");

Console.WriteLine("\\n=== 8. 表达式树的 ToString 调试 ===");
Expression<Func<int, bool>> debugExpr = x => x > 0 && x < 100;
Console.WriteLine($"  {debugExpr}");
Console.WriteLine($"  Body: {debugExpr.Body}");
Console.WriteLine($"  NodeType: {debugExpr.Body.NodeType}");

// 解析各个部分
var body = (BinaryExpression)debugExpr.Body;
Console.WriteLine($"  Left: {body.Left} ({body.Left.NodeType})");
Console.WriteLine($"  Right: {body.Right} ({body.Right.NodeType})");

Console.WriteLine("\\n=== 9. 表达式树的限制 ===");
Console.WriteLine("  ❌ 语句 Lambda 不能作为 Expression:");
Console.WriteLine("     Expression<Func<int, int>> bad = x => { return x; };  // 编译错误");
Console.WriteLine("  ✅ 必须是表达式 Lambda:");
Console.WriteLine("     Expression<Func<int, int>> good = x => x;  // OK");
Console.WriteLine("  ❌ 不能有赋值、try/catch、for 等（C# 4+ 限制支持，少用）");

Console.WriteLine("\\n=== 10. Compile 性能提示 ===");
Console.WriteLine("  Expression.Compile() 有开销，应该缓存编译结果:");
Console.WriteLine("    var compiled = expr.Compile();        // 编译一次");
Console.WriteLine("    for (int i = 0; i < N; i++) compiled(i);  // 多次复用");

// 缓存示例
Expression<Func<int, int>> cachedExpr = x => x * x + 1;
var cachedCompiled = cachedExpr.Compile();   // 编译一次
int sum = 0;
for (int i = 0; i < 1000; i++) sum += cachedCompiled(i);   // 复用
Console.WriteLine($"  缓存编译，1000 次调用，sum = {sum}");`,
    lang: 'cs',
  },

  // ============================================================
  // 第三十九章：函数式编程基础
  // ============================================================
  {
    id: 'csharp4-ch39',
    group: '第五部分 委托、事件与 Lambda',
    icon: '⚡',
    title: '函数式编程基础',
    content: `## 第三十九章　函数式编程基础

C# 虽然是面向对象语言，但多年来吸收了大量函数式编程特性：LINQ、Lambda、模式匹配、record、不可变集合等。本章介绍函数式编程的核心思想，并演示如何在 C# 中实践。

### 一、函数式编程的核心思想 ⭐

函数式编程（Functional Programming, FP）的三大支柱：
1. **纯函数**：相同的输入永远产生相同的输出，没有副作用。
2. **不可变性**：数据创建后不再修改，要变化就创建新副本。
3. **函数是一等公民**：函数可以赋值、传递、返回，像数据一样操作。

FP 的好处：
- 代码更容易推理和测试（无副作用）。
- 天然并发友好（不可变数据无竞态）。
- 组合性强（小函数拼成大函数）。

### 二、高阶函数：Map / Filter / Reduce ⭐

「高阶函数」是接收函数作为参数或返回函数的函数。三大经典高阶函数：

| 函数 | C# 等价 | 作用 |
| --- | --- | --- |
| Map | Select | 对每个元素变换 |
| Filter | Where | 按条件过滤 |
| Reduce / Fold | Aggregate | 累积成单个值 |

\`\`\`csharp
var nums = new[] { 1, 2, 3, 4, 5 };

var squared = nums.Select(x => x * x);                  // Map
var evens = nums.Where(x => x % 2 == 0);                // Filter
var sum = nums.Aggregate(0, (acc, x) => acc + x);      // Reduce
\`

这三个函数是函数式思维的入门钥匙：**几乎所有数据处理都能用它们的组合表达**。

### 三、纯函数与副作用

纯函数：「同样的输入 → 同样的输出，且不改变外部状态」。

\`\`\`csharp
// ✅ 纯函数
int Add(int a, int b) => a + b;

// ❌ 不纯：依赖外部状态
int _count = 0;
int Next() => ++_count;   // 同样的输入（无）产生不同输出

// ❌ 不纯：修改了入参
void Reset(List<int> list) => list.Clear();
\`

实践中追求「**业务逻辑用纯函数，副作用集中在边界**」（IO、DB、UI）。这是架构层面的 FP 思想。

### 四、不可变性 ⭐

不可变数据创建后不能修改。要"变化"就创建新副本：

\`\`\`csharp
// record 自动提供不可变性 + With 表达式
record Point(int X, int Y);

var p1 = new Point(1, 2);
var p2 = p1 with { X = 10 };   // 新对象，p1 不变
\`

不可变性的好处：
- 共享无需拷贝（多线程安全）。
- 引用相等就是值相等。
- 历史可追溯（适合事件溯源）。

C# 9+ 的 \`record\`、\`init\` 属性、\`ImmutableArray<T>\` 等都是不可变性的支持。

### 五、函数组合 ⭐

把多个函数串联成新函数：

\`\`\`csharp
Func<int, int> f = x => x + 1;        // +1
Func<int, int> g = x => x * 2;        // *2
Func<int, int> fg = x => f(g(x));     // 先 *2 再 +1

// 通用组合器
Func<T, T> Compose<T>(Func<T, T> f, Func<T, T> g) => x => f(g(x));
\`

组合是 FP 的核心思想：**用小函数拼出大逻辑**，比继承更灵活。

### 六、柯里化（Currying）与部分应用

柯里化：把「接收多个参数的函数」转成「一系列接收单个参数的函数」。

\`\`\`csharp
// 普通：两个参数
Func<int, int, int> add = (a, b) => a + b;
add(1, 2);   // 3

// 柯里化：返回函数的函数
Func<int, Func<int, int>> curriedAdd = a => b => a + b;
var addOne = curriedAdd(1);   // 部分应用：固定第一个参数
addOne(2);   // 3
addOne(5);   // 6
\`

部分应用：固定一部分参数，得到接收剩余参数的新函数。这是函数复用的高级技巧。

### 七、闭包实战

闭包（Closure）让函数捕获外部变量，形成「有状态的函数」：

\`\`\`csharp
Func<int, int> MakeAdder(int n) => x => x + n;
var add10 = MakeAdder(10);
add10(5);   // 15
\`

闭包本质是 FP 的「部分应用」机制：\`MakeAdder(10)\` 固定了 \`n=10\`，返回 \`x => x + 10\`。

### 八、Memoization：记忆化 ⭐

记忆化：缓存函数的计算结果，下次相同输入直接返回缓存。

\`\`\`csharp
Func<int, int> slow = n => { /* 耗时计算 */ return n * n; };
var memoized = Memoize(slow);

static Func<T, TResult> Memoize<T, TResult>(Func<T, TResult> f)
    where T : notnull
{
    var cache = new Dictionary<T, TResult>();
    return arg =>
    {
        if (cache.TryGetValue(arg, out var result)) return result;
        return cache[arg] = f(arg);
    };
}
\`

适合纯函数 + 重复调用 + 计算开销大的场景。注意：线程不安全版本，多线程下要用 \`ConcurrentDictionary\`。

### 九、Option<T> / Maybe 模式 ⭐

FP 中避免 null 的方案：用 \`Option<T>\` 显式表示「可能没有值」：

\`\`\`csharp
Option<int> FindUser(int id) =>
    db.TryFind(id) is { } u ? Some(u.Age) : None<int>();
\`

\`Option<T>\` 是「有值」或「无值」的容器。要么是 \`Some(value)\`，要么是 \`None\`。强迫调用方处理「无值」情况，避免 \`NullReferenceException\`。

C# 中没有内置 \`Option\`，但可以用 \`Nullable<T>\`（值类型）或自定义 \`Option<T>\`（引用类型）模拟。\`#nullable enable\` 也是部分缓解方案。

### 十、Result<T, TError> / Either 模式

FP 处理错误的方案：用 \`Result<T, TError>\` 代替抛异常：

\`\`\`csharp
Result<User, string> FindUser(int id)
{
    if (id < 0) return Error<User, string>("id 不能为负");
    if (db.TryFind(id) is not { } u) return Error<User, string>("未找到");
    return Ok<User, string>(u);
}
\`

调用方必须显式处理成功和失败两种情况，比 \`try/catch\` 更明确。这是「铁路式编程」（Railway Oriented Programming）的核心思想。

### 十一、Railway Oriented Programming

把正常路径和错误路径当作两条铁轨，用 \`Bind\` / \`Map\` 自动切换：

\`\`\`csharp
var result = FindUser(id)
    .Map(u => u.Email)
    .Bind(email => SendEmail(email));
\`

每个步骤成功就继续走，失败就直接跳到终点（短路）。代码读起来像线性流水线，没有 \`if/else\` 嵌套。

### 十二、C# 与 F# 对比

| 特性 | C# | F# |
| --- | --- | --- |
| 默认不可变 | 否（mutable 默认） | 是（immutable 默认） |
| 类型推断 | 弱（显式标注多） | 强（自动推断） |
| 模式匹配 | C# 7+ 支持 | 一等公民 |
| 区分联合（DU） | 无（用接口/继承模拟） | 原生支持 |
| 柯里化 | 需手动 | 默认 |
| 副作用管理 | 程序员自律 | 计算表达式 |

F# 是 .NET 平台的 ML 系函数式语言，更纯粹。C# 借鉴了 F# 不少特性。

### 十三、LanguageExt 库简介

\`LanguageExt\` 是 .NET 上最流行的函数式库，提供了：
- \`Option<T>\`、\`Either<L, R>\`、\`Try<T>\`、\`Validation<T>\`
- 不可变列表 \`Lst<T>\`、\`Map<K, V>\`
- 柯里化、组合、单子（Monad）工具

如果你想在 C# 中重度使用 FP，LanguageExt 是首选。但注意它会显著改变代码风格，团队接受度是问题。

### 十四、纯函数式 vs 多范式

C# 是多范式语言：OOP + FP + 命令式混用。实践建议：
- 数据建模用 \`record\`（不可变值类型）。
- 业务逻辑用纯函数（静态方法 + Lambda）。
- IO/DB/UI 用类封装副作用。
- 复杂数据流用 LINQ（map/filter/reduce）。

不要为了 FP 而 FP——合适的场景才用。

### 十五、函数式测试的优势

纯函数的测试是「输入 → 输出」对，无需 mock：
- 同样的输入永远同样的输出。
- 无外部状态，无需 setup/teardown。
- 易于属性测试（property-based testing）。

这是 FP 在工业界被重视的重要原因。

本章 demo 演示：Memoize、Compose、Option<T>、Result<T, TError>，并用它们重写一个查找用户的方法。`,
    code: `// C# 12 顶级语句 - 函数式编程基础演示
// 演示：Map/Filter/Reduce、纯函数、函数组合、柯里化、Memoize、
//       Option<T>、Result<T, TError>、Railway Oriented Programming

using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;

// === 1. 高阶函数：Map / Filter / Reduce 演示 ===
Console.WriteLine("=== 1. Map / Filter / Reduce ===");

var nums = new[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

// Map: 对每个元素变换
var squares = nums.Select(x => x * x);
Console.WriteLine($"  Map (平方): {string.Join(", ", squares)}");

// Filter: 按条件过滤
var evens = nums.Where(x => x % 2 == 0);
Console.WriteLine($"  Filter (偶数): {string.Join(", ", evens)}");

// Reduce: 累积成单个值
var sum = nums.Aggregate(0, (acc, x) => acc + x);
Console.WriteLine($"  Reduce (求和): {sum}");

// 组合：取出偶数 → 平方 → 求和
var pipeline = nums.Where(x => x % 2 == 0).Select(x => x * x).Sum();
Console.WriteLine($"  组合 (偶数平方求和): {pipeline}");

Console.WriteLine("\\n=== 2. 纯函数 vs 不纯函数 ===");

// ✅ 纯函数：相同输入永远相同输出，无副作用
static int Add(int a, int b) => a + b;

// ❌ 不纯：依赖外部状态
static int _counter = 0;
static int Next() => ++_counter;

Console.WriteLine($"  Add(1, 2) = {Add(1, 2)}");
Console.WriteLine($"  Add(1, 2) = {Add(1, 2)}  (相同)");
Console.WriteLine($"  Next() = {Next()}");
Console.WriteLine($"  Next() = {Next()}  (不同！有状态)");

Console.WriteLine("\\n=== 3. 不可变性演示 ===");

// record 提供不可变性 + With 表达式
record Point(int X, int Y);

var p1 = new Point(1, 2);
var p2 = p1 with { X = 10 };   // 创建新副本，p1 不变
Console.WriteLine($"  原始: {p1}");
Console.WriteLine($"  副本: {p2}");

// 不可变集合
var immutableList = ImmutableList.Create(1, 2, 3);
var added = immutableList.Add(4);   // 返回新列表，原列表不变
Console.WriteLine($"  原列表: {string.Join(", ", immutableList)}");
Console.WriteLine($"  Add 后新列表: {string.Join(", ", added)}");

Console.WriteLine("\\n=== 4. 函数组合 Compose ===");

// 通用组合器：先执行 g，再执行 f
static Func<T, T> Compose<T>(Func<T, T> f, Func<T, T> g) => x => f(g(x));

Func<int, int> doubleIt = x => x * 2;
Func<int, int> addOne = x => x + 1;

// 组合：先 *2 再 +1
Func<int, int> doubleThenAdd = Compose(addOne, doubleIt);
Console.WriteLine($"  doubleThenAdd(5) = {doubleThenAdd(5)}");   // (5*2)+1 = 11

// 组合：先 +1 再 *2
Func<int, int> addThenDouble = Compose(doubleIt, addOne);
Console.WriteLine($"  addThenDouble(5) = {addThenDouble(5)}");   // (5+1)*2 = 12

// 多步组合：先 +1，再 *2，再 -3
Func<int, int> pipeline2 = Compose(x => x - 3, Compose(doubleIt, addOne));
Console.WriteLine($"  +1 -> *2 -> -3, (5) = {pipeline2(5)}");   // ((5+1)*2)-3 = 9

Console.WriteLine("\\n=== 5. 柯里化与部分应用 ===");

// 普通加法：两个参数
Func<int, int, int> add = (a, b) => a + b;
Console.WriteLine($"  add(2, 3) = {add(2, 3)}");

// 柯里化版本：返回函数的函数
Func<int, Func<int, int>> curriedAdd = a => b => a + b;
var add5 = curriedAdd(5);   // 部分应用：固定第一个参数为 5
Console.WriteLine($"  curriedAdd(5)(3) = {curriedAdd(5)(3)}");
Console.WriteLine($"  add5(10) = {add5(10)}");
Console.WriteLine($"  add5(20) = {add5(20)}");

// 三参数柯里化
Func<int, Func<int, Func<int, int>>> curriedAdd3 =
    a => b => c => a + b + c;
var add10Then20 = curriedAdd3(10)(20);   // 固定前两个
Console.WriteLine($"  curriedAdd3(10)(20)(30) = {curriedAdd3(10)(20)(30)}");
Console.WriteLine($"  add10Then20(5) = {add10Then20(5)}");

Console.WriteLine("\\n=== 6. Memoization：记忆化 ===");

// 模拟耗时计算
static int SlowSquare(int n)
{
    Thread.Sleep(100);   // 模拟耗时
    return n * n;
}

// 通用 Memoize 包装器
static Func<T, TResult> Memoize<T, TResult>(Func<T, TResult> f)
    where T : notnull
{
    var cache = new Dictionary<T, TResult>();
    return arg =>
    {
        if (cache.TryGetValue(arg, out var result))
        {
            Console.WriteLine($"    [Cache 命中] {arg}");
            return result;
        }
        Console.WriteLine($"    [Cache 未命中] {arg}, 计算中...");
        return cache[arg] = f(arg);
    };
}

var memoizedSquare = Memoize<int, int>(SlowSquare);

Console.WriteLine("  第一次调用（计算）:");
var sw = System.Diagnostics.Stopwatch.StartNew();
Console.WriteLine($"    memoizedSquare(5) = {memoizedSquare(5)}");
Console.WriteLine($"    耗时: {sw.ElapsedMilliseconds} ms");

Console.WriteLine("  第二次调用（缓存）:");
sw.Restart();
Console.WriteLine($"    memoizedSquare(5) = {memoizedSquare(5)}");
Console.WriteLine($"    耗时: {sw.ElapsedMilliseconds} ms");

Console.WriteLine("  调用不同参数:");
Console.WriteLine($"    memoizedSquare(6) = {memoizedSquare(6)}");

Console.WriteLine("\\n=== 7. Option<T> 类型 ===");

// 自定义 Option<T> 模拟 Maybe
readonly struct Option<T>
{
    public bool HasValue { get; }
    public T Value { get; }
    private Option(T value) { Value = value; HasValue = true; }
    public static Option<T> Some(T value) => new(value);
    public static Option<T> None() => default;
    public override string ToString() => HasValue ? $"Some({Value})" : "None";
}

static Option<T> Some<T>(T value) => Option<T>.Some(value);
static Option<T> None<T>() => Option<T>.None();

// Option 扩展：Map 和 Bind
static class OptionExt
{
    public static Option<TResult> Map<T, TResult>(this Option<T> opt, Func<T, TResult> f)
        => opt.HasValue ? Some(f(opt.Value)) : None<TResult>();

    public static Option<TResult> Bind<T, TResult>(this Option<T> opt, Func<T, Option<TResult>> f)
        => opt.HasValue ? f(opt.Value) : None<TResult>();

    public static T ValueOr<T>(this Option<T> opt, T defaultValue)
        => opt.HasValue ? opt.Value : defaultValue;
}

// 模拟数据查找
static Option<string> FindUserById(int id)
    => id switch
    {
        1 => Some("张三"),
        2 => Some("李四"),
        _ => None<string>()
    };

static Option<string> GetEmail(string name)
    => name switch
    {
        "张三" => Some("zhangsan@example.com"),
        "李四" => Some("lisi@example.com"),
        _ => None<string>()
    };

Console.WriteLine($"  FindUserById(1) = {FindUserById(1)}");
Console.WriteLine($"  FindUserById(99) = {FindUserById(99)}");

// 用 Map 链式处理 Option
var email1 = FindUserById(1).Map(name => name.ToUpper());
Console.WriteLine($"  id=1 名字转大写: {email1}");

var email2 = FindUserById(1).Bind(GetEmail);
Console.WriteLine($"  id=1 邮箱: {email2}");

var email3 = FindUserById(99).Bind(GetEmail);
Console.WriteLine($"  id=99 邮箱: {email3}");   // None 短路

// ValueOr 提供默认值
var name = FindUserById(99).ValueOr("(未知用户)");
Console.WriteLine($"  id=99 或默认: {name}");

Console.WriteLine("\\n=== 8. Result<T, TError> 类型 ===");

// 自定义 Result 模拟 Either
readonly struct Result<T, TError>
{
    public bool IsOk { get; }
    public T Value { get; }
    public TError Error { get; }
    private Result(T value) { Value = value; Error = default!; IsOk = true; }
    private Result(TError error) { Error = error; Value = default!; IsOk = false; }
    public static Result<T, TError> Ok(T value) => new(value);
    public static Result<T, TError> Err(TError error) => new(error);
    public override string ToString() => IsOk ? $"Ok({Value})" : $"Err({Error})";
}

static Result<T, TError> Ok<T, TError>(T value) => Result<T, TError>.Ok(value);
static Result<T, TError> Err<T, TError>(TError error) => Result<T, TError>.Err(error);

// Result 扩展：Railway Oriented Programming
static class ResultExt
{
    public static Result<TResult, TError> Map<T, TResult, TError>(
        this Result<T, TError> r, Func<T, TResult> f)
        => r.IsOk ? Ok<TResult, TError>(f(r.Value)) : Err<TResult, TError>(r.Error);

    public static Result<TResult, TError> Bind<T, TResult, TError>(
        this Result<T, TError> r, Func<T, Result<TResult, TError>> f)
        => r.IsOk ? f(r.Value) : Err<TResult, TError>(r.Error);
}

// 用 Result 重写查找用户的方法
static Result<User, string> FindUser(int id)
{
    if (id < 0) return Err<User, string>("ID 不能为负数");
    if (id == 1) return Ok<User, string>(new User(1, "张三", 30));
    if (id == 2) return Ok<User, string>(new User(2, "李四", 25));
    return Err<User, string>($"未找到 ID={id} 的用户");
}

static Result<string, string> ValidateAge(User user)
    => user.Age >= 18
        ? Ok<string, string>($"{user.Name} 已成年")
        : Err<string, string>($"{user.Name} 未成年");

record User(int Id, string Name, int Age);

Console.WriteLine("  查找合法用户:");
var r1 = FindUser(1).Bind(ValidateAge);
Console.WriteLine($"    FindUser(1).Bind(ValidateAge) = {r1}");

Console.WriteLine("  查找未成年用户:");
var r2 = FindUser(2).Bind(ValidateAge);
Console.WriteLine($"    FindUser(2).Bind(ValidateAge) = {r2}");

Console.WriteLine("  查找不存在的用户:");
var r3 = FindUser(99).Bind(ValidateAge);
Console.WriteLine($"    FindUser(99).Bind(ValidateAge) = {r3}");   // 错误短路

Console.WriteLine("  查找负 ID:");
var r4 = FindUser(-1).Bind(ValidateAge);
Console.WriteLine($"    FindUser(-1).Bind(ValidateAge) = {r4}");

Console.WriteLine("\\n=== 9. Railway Oriented Programming：流水线 ===");

// 完整流水线：查找 -> 验证 -> 转换
static Result<string, string> ProcessUser(int id)
    => FindUser(id)
        .Bind(ValidateAge)
        .Map(msg => $"处理完成: {msg}");

Console.WriteLine($"  ProcessUser(1) = {ProcessUser(1)}");
Console.WriteLine($"  ProcessUser(2) = {ProcessUser(2)}");
Console.WriteLine($"  ProcessUser(99) = {ProcessUser(99)}");

Console.WriteLine("\\n=== 10. 闭包实战：生成器 ===");

// 用闭包模拟有状态的函数
static Func<int> MakeCounter(int start, int step)
{
    int current = start - step;
    return () => current += step;
}

var counter1 = MakeCounter(0, 1);
var counter2 = MakeCounter(100, 10);

Console.WriteLine($"  counter1: {counter1()}, {counter1()}, {counter1()}");
Console.WriteLine($"  counter2: {counter2()}, {counter2()}, {counter2()}");
Console.WriteLine("  两个闭包互不影响，各自维护状态");

Console.WriteLine("\\n=== 11. 不可变数据流处理 ===");

// 用纯函数处理不可变数据
record OrderLine(string Product, int Quantity, decimal Price);

static ImmutableList<OrderLine> AddLine(ImmutableList<OrderLine> lines, OrderLine line)
    => lines.Add(line);

static ImmutableList<OrderLine> RemoveLine(ImmutableList<OrderLine> lines, string product)
    => lines.RemoveAll(l => l.Product == product).ToImmutableList();

static decimal Total(ImmutableList<OrderLine> lines)
    => lines.Sum(l => l.Quantity * l.Price);

var order = ImmutableList.Create<OrderLine>();
order = AddLine(order, new OrderLine("键盘", 1, 199m));
order = AddLine(order, new OrderLine("鼠标", 2, 50m));
order = AddLine(order, new OrderLine("显示器", 1, 999m));
Console.WriteLine($"  订单明细:");
foreach (var line in order)
    Console.WriteLine($"    {line.Product} x {line.Quantity} = {line.Quantity * line.Price:C}");
Console.WriteLine($"  总计: {Total(order):C}");

order = RemoveLine(order, "鼠标");
Console.WriteLine($"  移除鼠标后总计: {Total(order):C}");

Console.WriteLine("\\n=== 12. 函数式 vs 命令式对比 ===");

Console.WriteLine("  命令式风格（强调步骤）:");
Console.WriteLine("    var sum = 0;");
Console.WriteLine("    for (int i = 0; i < nums.Length; i++)");
Console.WriteLine("        if (nums[i] % 2 == 0) sum += nums[i] * nums[i];");

Console.WriteLine("  函数式风格（强调做什么）:");
Console.WriteLine("    var sum = nums.Where(n => n % 2 == 0).Select(n => n*n).Sum();");

Console.WriteLine("\\n=== 13. C# 函数式生态简介 ===");
Console.WriteLine("  LanguageExt：.NET 最流行的 FP 库");
Console.WriteLine("    - Option<T>, Either<L,R>, Try<T>, Validation<T>");
Console.WriteLine("    - 不可变集合 Lst<T>, Map<K,V>");
Console.WriteLine("    - Monad 工具：Bind, Map, Apply");
Console.WriteLine("  CSharpFunctionalExtensions：轻量级 Result<T,E>");
Console.WriteLine("  Optional：简单的 Option<T> 实现");
Console.WriteLine("  Reactive Extensions (Rx)：基于 IObservable<T> 的响应式编程");

Console.WriteLine("\\n=== 14. 实践建议 ===");
Console.WriteLine("  1. 数据建模用 record（不可变）");
Console.WriteLine("  2. 业务逻辑用纯函数（static + Lambda）");
Console.WriteLine("  3. 副作用集中在边界（IO/DB/UI）");
Console.WriteLine("  4. 复杂数据流用 LINQ（map/filter/reduce）");
Console.WriteLine("  5. 错误处理考虑 Result<T,E> 替代异常");
Console.WriteLine("  6. 不要为 FP 而 FP：合适场景才用");`,
    lang: 'cs',
  },
];

export { chapters };
