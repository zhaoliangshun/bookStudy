// =============================================================
// C# 从入门到精通大全（全新版）—— 第 11 批章节
// 第九部分 反射与特性（共 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   csharp4-ch56 : 第五十六章 反射基础
//   csharp4-ch57 : 第五十七章 反射高级应用
//   csharp4-ch58 : 第五十八章 特性 Attribute
//   csharp4-ch59 : 第五十九章 源生成器简介
//
// 风格：demo 驱动，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，所有示例用顶级语句。
// 沙箱注意：所有示例避免外部依赖，可独立运行。
// =============================================================

const chapters = [
  // ============================================================
  // 第五十六章：反射基础
  // ============================================================
  {
    id: 'csharp4-ch56',
    group: '第九部分 反射与特性',
    icon: '🔍',
    title: '反射基础',
    content: `## 第五十六章　反射基础

反射（Reflection）是 .NET 提供的一种「在运行时检查类型信息」的能力。你可以把它想象成一面「镜子」——程序运行起来之后，还能照见自己的结构：有哪些字段、哪些方法、特性是什么。本章带你从零理解反射的核心 API。

### 一、为什么需要反射？⭐

普通代码里，类型在编译期就确定了：\`Person p = new Person();\` 编译器知道 \`p\` 是 \`Person\`。但在很多场景下，类型要到运行时才知道：

- **序列化/反序列化**：JSON 库拿到任意对象都要遍历它的属性。
- **ORM**：把数据库行映射到任意实体类。
- **依赖注入容器**：根据字符串名/类型动态创建对象。
- **插件系统**：运行时加载外部 DLL，调用其中类型。
- **测试框架**：发现带有 \`[Test]\` 特性的方法并执行。

这些场景都需要反射——**在运行时获取类型元数据、动态调用成员**。

### 二、Type 类：类型的「身份证」

反射的入口是 \`System.Type\`。每个 .NET 类型在运行时都有一个对应的 \`Type\` 对象，记录了它的全部信息：名字、基类、接口、成员、特性等。

获取 \`Type\` 有三种主要方式：

\`\`\`csharp
// 1. 编译时已知：用 typeof
Type t1 = typeof(Person);

// 2. 运行时从实例获取
Person p = new Person();
Type t2 = p.GetType();

// 3. 用完全限定名（字符串）查询
Type? t3 = Type.GetType("MyApp.Person, MyApp");
\`\`\`

三者的区别：

| 方式 | 时机 | 输入 | 适用 |
| --- | --- | --- | --- |
| \`typeof(T)\` | 编译期 | 类型参数 | 已知类型，最高性能 |
| \`obj.GetType()\` | 运行时 | 实例 | 已有对象，想知道实际类型 |
| \`Type.GetType(name)\` | 运行时 | 字符串名 | 动态加载（注意要带程序集名） |

⚠ 注意：\`Type.GetType(string)\` 默认只在当前程序集和 mscorlib 里找，找其他程序集的类型需要带「, 程序集名」后缀。

### 三、Type 的常用属性

\`Type\` 有几十个属性，常用如下：

\`\`\`csharp
Type t = typeof(Person);
t.Name;            // "Person"（不含命名空间）
t.FullName;        // "MyApp.Person"（含命名空间）
t.Namespace;       // "MyApp"
t.BaseType;        // typeof(object) 之类
t.IsClass;         // true（class，含 record）
t.IsInterface;     // 是否 interface
t.IsEnum;          // 是否枚举
t.IsArray;         // 是否数组
t.IsValueType;     // 是否值类型
t.IsPrimitive;     // 是否基元（int/bool/byte 等）
t.IsAbstract;      // 是否 abstract 或 static
t.IsSealed;        // 是否 sealed
t.IsGenericType;   // 是否泛型（开放或封闭）
t.IsPublic;        // 是否 public
t.IsNested;        // 是否嵌套类型
\`\`\`

记住一组对照：\`IsClass\` vs \`IsValueType\`、\`IsAbstract\` vs \`IsSealed\`、\`IsGenericType\` vs \`IsGenericTypeDefinition\`（后者是「未填充类型参数」的开放泛型，比如 \`List<>\`）。

### 四、获取成员：GetMembers 一网打尽

\`Type.GetMembers()\` 返回 \`MemberInfo[]\`，包含所有公开成员：字段、属性、方法、构造、事件、嵌套类型……

\`\`\`csharp
foreach (MemberInfo m in typeof(Person).GetMembers())
    Console.WriteLine($"{m.MemberType,-12} {m.Name}");
\`\`\`

\`MemberInfo\` 是抽象基类，子类对应不同成员：

| 子类 | 对应成员 | 常用方法 |
| --- | --- | --- |
| \`FieldInfo\` | 字段 | \`GetValue\`/\`SetValue\` |
| \`PropertyInfo\` | 属性 | \`GetValue\`/\`SetValue\`、\`GetGetMethod\` |
| \`MethodInfo\` | 方法 | \`Invoke\`、\`GetParameters\` |
| \`ConstructorInfo\` | 构造函数 | \`Invoke\` |
| \`EventInfo\` | 事件 | \`AddEventHandler\`/\`RemoveEventHandler\` |

也可以用专用方法精确获取某一类成员：

\`\`\`csharp
FieldInfo[] fields = t.GetFields();
PropertyInfo[] props = t.GetProperties();
MethodInfo[] methods = t.GetMethods();
ConstructorInfo[] ctors = t.GetConstructors();
EventInfo[] events = t.GetEvents();
\`\`\`

### 五、BindingFlags：精确控制查询

默认 \`GetMembers\` 只返回 public 成员。要拿到 private/instance/static，必须传 \`BindingFlags\`：

\`\`\`csharp
var flags = BindingFlags.Public | BindingFlags.NonPublic
          | BindingFlags.Instance | BindingFlags.Static;
MethodInfo[] all = t.GetMethods(flags);
\`\`\`

⚠ 注意：传任意 \`BindingFlags\` 时若没包含 \`Public\` 或 \`NonPublic\`，会得到空数组——这是个常见坑。要查询必须**显式列出要查的范围**。

\`BindingFlags\` 还可以指定：

- \`DeclaredOnly\`：只看本类声明的，不看继承的。
- \`IgnoreCase\`：名字大小写不敏感。
- \`FlattenHierarchy\`：包含 public 静态成员的继承链。

### 六、读写属性与字段

\`\`\`csharp
Person p = new Person { Name = "Tom", Age = 20 };
PropertyInfo nameProp = typeof(Person).GetProperty("Name")!;

// 读
string name = (string)nameProp.GetValue(p)!;

// 写
nameProp.SetValue(p, "Jerry");
\`\`\`

字段同理：\`FieldInfo.GetValue\` / \`FieldInfo.SetValue\`。索引属性传 \`index\` 参数：\`prop.GetValue(list, new object[] { 0 })\`。

### 七、调用方法

\`\`\`csharp
MethodInfo greet = typeof(Person).GetMethod("Greet")!;
greet.Invoke(p, null);                          // 无参方法
greet.Invoke(p, new object[] { "Hi" });          // 带参方法
\`\`\`

调用静态方法时第一个参数传 \`null\`。泛型方法需先 \`MakeGenericMethod\` 填充类型参数。

### 八、获取特性

特性（详见第五十八章）通过 \`GetCustomAttribute\` 读取：

\`\`\`csharp
[Serializable]
public class Person { }

SerializableAttribute? attr = typeof(Person)
    .GetCustomAttribute<SerializableAttribute>();
bool isSerializable = Attribute.IsDefined(typeof(Person), typeof(SerializableAttribute));
\`\`\`

### 九、本章小结

- 反射入口：\`typeof\` / \`GetType()\` / \`Type.GetType(name)\`
- \`Type\` 一堆 \`Is*\` 属性分类类型
- \`GetMembers\` 一网打尽，专用 \`GetFields/Properties/Methods\` 更精确
- \`BindingFlags\` 控制查询范围（public/private/static/instance）
- \`FieldInfo/PropertyInfo\` 用 \`GetValue/SetValue\` 动态读写
- \`MethodInfo.Invoke\` 动态调用方法
- \`GetCustomAttribute<T>\` 读取特性`,
    code: `// C# 12 顶级语句 —— 反射基础演示
using System;
using System.Reflection;
using System.Text;

// === 1. 定义一个完整的 Person 类，演示用反射照见其结构 ===
public class Person
{
    // 实例字段（public / private 各一个）
    public string Name;
    private int _secret = 42;

    // 自动属性
    public int Age { get; set; }
    public string? Email { get; set; }

    // 静态字段
    public static string Species = "Homo Sapiens";

    // 事件
    public event EventHandler? NameChanged;

    // 构造函数：无参 + 带参
    public Person() { Name = "Anonymous"; Age = 0; }
    public Person(string name, int age) { Name = name; Age = age; }

    // 方法：无参 / 带参 / 静态 / 泛型 / 私有
    public void Greet() => Console.WriteLine($"Hi, I'm {Name}.");
    public string Greet(string prefix) => $"{prefix}, I'm {Name}.";
    public static string CreateLabel(Person p) => $"[Label] {p.Name}/{p.Age}";
    public T Echo<T>(T value) => value;
    private void Whisper() => Console.WriteLine("psst ...");
}

// === 2. 获取 Type 的三种方式 ===
Type t1 = typeof(Person);                            // 编译期已知
Person sample = new Person("Tom", 20);
Type t2 = sample.GetType();                          // 从实例获取
Type? t3 = Type.GetType("Person");                   // 按名字查找（当前程序集）
Console.WriteLine($"typeof   => {t1.FullName}");
Console.WriteLine($"GetType  => {t2.FullName}");
Console.WriteLine($"Type.Get => {(t3?.FullName ?? "<null>")}");

// === 3. Type 的常用属性 ===
Console.WriteLine("\\n--- Type 属性 ---");
Console.WriteLine($"Name           = {t1.Name}");
Console.WriteLine($"FullName       = {t1.FullName}");
Console.WriteLine($"Namespace      = {t1.Namespace}");
Console.WriteLine($"BaseType       = {t1.BaseType?.Name}");
Console.WriteLine($"IsClass        = {t1.IsClass}");
Console.WriteLine($"IsValueType    = {t1.IsValueType}");
Console.WriteLine($"IsAbstract     = {t1.IsAbstract}");
Console.WriteLine($"IsSealed       = {t1.IsSealed}");
Console.WriteLine($"IsSerializable = {t1.IsSerializable}");

// === 4. GetMembers：列出所有 public 成员 ===
Console.WriteLine("\\n--- 所有 public 成员 ---");
foreach (MemberInfo m in t1.GetMembers())
    Console.WriteLine($"  {m.MemberType,-15} {m.Name}");

// === 5. BindingFlags：连 private/static 一起列出 ===
Console.WriteLine("\\n--- 含 private/static 的字段 ---");
BindingFlags allFlags = BindingFlags.Public | BindingFlags.NonPublic
                      | BindingFlags.Instance | BindingFlags.Static;
foreach (FieldInfo f in t1.GetFields(allFlags))
    Console.WriteLine($"  {f.FieldType.Name,-10} {f.Name} (Static={f.IsStatic}, Private={f.IsPrivate})");

// === 6. 用反射创建实例、调用方法 ===
Console.WriteLine("\\n--- 动态创建 + 调用方法 ---");
object? instance = Activator.CreateInstance(t1, new object[] { "Alice", 25 });
Console.WriteLine($"实例化结果: {instance}");

// 读写字段
FieldInfo? nameField = t1.GetField("Name");
if (nameField != null && instance != null)
{
    string oldName = (string)nameField.GetValue(instance)!;
    Console.WriteLine($"字段 Name 旧值: {oldName}");
    nameField.SetValue(instance, "Bob");
    Console.WriteLine($"字段 Name 新值: {nameField.GetValue(instance)}");
}

// 读写属性
PropertyInfo? ageProp = t1.GetProperty("Age");
if (ageProp != null && instance != null)
{
    Console.WriteLine($"属性 Age 旧值: {ageProp.GetValue(instance)}");
    ageProp.SetValue(instance, 30);
    Console.WriteLine($"属性 Age 新值: {ageProp.GetValue(instance)}");
}

// 调用无参方法
MethodInfo? greet1 = t1.GetMethod("Greet", Type.EmptyTypes);
greet1?.Invoke(instance, null);

// 调用带参方法
MethodInfo? greet2 = t1.GetMethod("Greet", new[] { typeof(string) });
string? result = (string?)greet2?.Invoke(instance, new object[] { "Hey" });
Console.WriteLine($"带参方法返回: {result}");

// 调用静态方法
MethodInfo? labelMethod = t1.GetMethod("CreateLabel", BindingFlags.Public | BindingFlags.Static);
string? label = (string?)labelMethod?.Invoke(null, new object?[] { instance });
Console.WriteLine($"静态方法返回: {label}");

// === 7. 调用泛型方法（先 MakeGenericMethod 再 Invoke）===
Console.WriteLine("\\n--- 泛型方法 ---");
MethodInfo? echoOpen = t1.GetMethod("Echo");
if (echoOpen != null)
{
    MethodInfo echoInt = echoOpen.MakeGenericMethod(typeof(int));
    int echoed = (int)echoInt.Invoke(instance, new object[] { 999 })!;
    Console.WriteLine($"Echo<int>(999) = {echoed}");

    MethodInfo echoStr = echoOpen.MakeGenericMethod(typeof(string));
    string echoedStr = (string)echoStr.Invoke(instance, new object[] { "hello" })!;
    Console.WriteLine($"Echo<string>(\\"hello\\") = {echoedStr}");
}

// === 8. 调用私有方法（BindingFlags.NonPublic）===
Console.WriteLine("\\n--- 私有方法 ---");
MethodInfo? whisper = t1.GetMethod("Whisper", BindingFlags.NonPublic | BindingFlags.Instance);
whisper?.Invoke(instance, null);

// === 9. 获取并触发事件 ===
Console.WriteLine("\\n--- 事件 ---");
EventInfo? nameChangedEvent = t1.GetEvent("NameChanged");
Console.WriteLine($"事件 NameChanged 类型: {nameChangedEvent?.EventHandlerType?.Name}");

// 给事件挂一个处理器
EventHandler handler = (s, e) => Console.WriteLine("  -> NameChanged 触发！");
nameChangedEvent?.AddEventHandler(instance, handler);
// 反射方式触发：通过 OnXxx 受保护方法，或者直接用反射获取 backing field
FieldInfo? eventField = t1.GetField("NameChanged", BindingFlags.NonPublic | BindingFlags.Instance);
if (eventField?.GetValue(instance) is EventHandler del)
    del.Invoke(instance, EventArgs.Empty);

// === 10. 获取构造函数列表 ===
Console.WriteLine("\\n--- 构造函数 ---");
foreach (ConstructorInfo ctor in t1.GetConstructors())
{
    ParameterInfo[] ps = ctor.GetParameters();
    string paramStr = string.Join(", ", ps.Select(p => $"{p.ParameterType.Name} {p.Name}"));
    Console.WriteLine($"  .ctor({paramStr})");
}

// === 11. 检查特性 ===
Console.WriteLine("\\n--- 特性检查 ---");
bool hasSerializable = Attribute.IsDefined(t1, typeof(SerializableAttribute));
Console.WriteLine($"Person 带 [Serializable] 特性? {hasSerializable}");
`,
    lang: 'cs',
  },

  // ============================================================
  // 第五十七章：反射高级应用
  // ============================================================
  {
    id: 'csharp4-ch57',
    group: '第九部分 反射与特性',
    icon: '🛠️',
    title: '反射高级应用',
    content: `## 第五十七章　反射高级应用

上一章我们学会了「照镜子」，本章把它用起来——动态创建对象、加载程序集、生成委托、运行时 IL、写一个迷你依赖注入容器。

### 一、Activator：动态创建实例 ⭐

\`System.Activator\` 是反射创建实例最常用的工具，比 \`ConstructorInfo.Invoke\` 更简洁：

\`\`\`csharp
// 1. 无参构造
object obj = Activator.CreateInstance(typeof(Person))!;

// 2. 带参构造
object obj2 = Activator.CreateInstance(typeof(Person), "Tom", 20)!;

// 3. 泛型版本（编译期类型检查）
Person p = Activator.CreateInstance<Person>();

// 4. 创建泛型类型实例：先 MakeGenericType 填充
Type openList = typeof(List<>);
Type intList = openList.MakeGenericType(typeof(int));
object list = Activator.CreateInstance(intList)!;
\`\`\`

⚠ 注意：\`Activator.CreateInstance<T>()\` 要求 \`T\` 有公共无参构造，否则抛 \`MissingMethodException\`。

### 二、Assembly：动态加载程序集

反射不仅能查当前程序集，还能动态加载外部 DLL：

\`\`\`csharp
// 按程序集名（已知引用或 GAC）加载
Assembly a1 = Assembly.Load(new AssemblyName("System.Text.Json"));

// 按文件路径加载
Assembly a2 = Assembly.LoadFrom("/path/MyPlugin.dll");

// 仅加载不锁定文件（不影响再次编译）
Assembly a3 = Assembly.LoadFrom("/path/MyPlugin.dll");

// 加载字节数组（来自网络/资源）
Assembly a4 = Assembly.Load(bytes);
\`\`\`

三者的区别：

| 方法 | 输入 | 是否锁定文件 | 用途 |
| --- | --- | --- | --- |
| \`Assembly.Load(name)\` | 程序集名 | 否 | 已知依赖项 |
| \`Assembly.LoadFrom(path)\` | 路径 | 是 | 插件加载 |
| \`Assembly.LoadFile(path)\` | 路径 | 否（独立加载上下文） | 工具/分析 |
| \`Assembly.Load(bytes)\` | 字节流 | 否 | 资源嵌入、热更新 |

⚠ 注意：\`LoadFrom\` 和 \`LoadFile\` 是不同的加载上下文，可能导致同类型在不同上下文中「不相等」——这是插件系统最容易踩的坑。

### 三、MakeGenericType：开放类型 → 封闭类型

\`Dictionary<,>\` 是「开放类型」（Open Type），无法实例化。需要填充类型参数变成「封闭类型」（Closed Type）：

\`\`\`csharp
Type openDict = typeof(Dictionary<,>);
Type closedDict = openDict.MakeGenericType(typeof(string), typeof(Person));
// 等价于 typeof(Dictionary<string, Person>)
object dict = Activator.CreateInstance(closedDict)!;
\`\`\`

调用泛型方法用 \`MethodInfo.MakeGenericMethod\`：

\`\`\`csharp
MethodInfo open = typeof(Array).GetMethod("Empty")!;
MethodInfo closed = open.MakeGenericMethod(typeof(int));
int[] empty = (int[])closed.Invoke(null, null)!;
\`\`\`

### 四、Delegate.CreateDelegate：反射变委托，性能 100 倍

直接用 \`MethodInfo.Invoke\` 每次都做参数装箱、安全检查，慢且开销大。如果方法签名固定，可以转成委托：

\`\`\`csharp
MethodInfo mi = typeof(Person).GetMethod("Greet", new[] { typeof(string) })!;
Func<Person, string, string> fn = (Func<Person, string, string>)
    Delegate.CreateDelegate(typeof(Func<Person, string, string>), mi);

string result = fn(p, "Hi");  // 调用方式跟普通委托一样快
\`\`\`

把反射方法缓存为委托是高性能反射的标准套路。

### 五、DynamicMethod：运行时生成方法

\`System.Reflection.Emit.DynamicMethod\` 允许你在运行时「拼」出一个方法，比 \`MethodInfo.Invoke\` 快得多，且无需编译期知道签名：

\`\`\`csharp
DynamicMethod dm = new DynamicMethod("Add", typeof(int),
    new[] { typeof(int), typeof(int) });
ILGenerator il = dm.GetILGenerator();
il.Emit(OpCodes.Ldarg_0);   // 加载第 1 个参数
il.Emit(OpCodes.Ldarg_1);   // 加载第 2 个参数
il.Emit(OpCodes.Add);       // 相加
il.Emit(OpCodes.Ret);       // 返回
var addFn = (Func<int, int, int>)dm.CreateDelegate(typeof(Func<int, int, int>));
int sum = addFn(3, 4);  // 7
\`\`\`

⚠ 注意：IL Emit 是高级特性，写错 IL 容易让 CLR 直接崩溃，调试起来很痛苦。生产环境优先考虑 **表达式树** 或 **源生成器**。

### 六、Emit 程序集：运行时造类型

.NET 6+ 提供了 \"可收集\" 的 \`AssemblyBuilder\`，让运行时动态生成类型且可被回收：

\`\`\`csharp
// .NET 6+ 推荐方式
AssemblyName an = new AssemblyName("MyDynamicAssembly");
AssemblyBuilder ab = AssemblyBuilder.DefineDynamicAssembly(an, AssemblyBuilderAccess.Run);
ModuleBuilder mb = ab.DefineDynamicModule("Main");
TypeBuilder tb = mb.DefineType("HelloType", TypeAttributes.Public);

// 添加方法
MethodBuilder meth = tb.DefineMethod("SayHello",
    MethodAttributes.Public, typeof(string), Type.EmptyTypes);
ILGenerator il = meth.GetILGenerator();
il.Emit(OpCodes.Ldstr, "Hello");
il.Emit(OpCodes.Ret);

Type builtType = tb.CreateType()!;
object instance = Activator.CreateInstance(builtType)!;
string? greeting = (string?)builtType.GetMethod("SayHello")!.Invoke(instance, null);
\`\`\`

\`AssemblyBuilder.Save\` 在 .NET Core/.NET 5+ 长期不可用，.NET 9 才重新支持——多数场景只用来运行，不需要持久化。

### 七、实战：迷你依赖注入容器

理解了上面这些 API，就能写一个简化版的 DI 容器：注册接口→实现，按需解析。

\`\`\`csharp
public class Container
{
    private Dictionary<Type, Type> _map = new();
    public void Register<TService, TImpl>() where TImpl : TService
        => _map[typeof(TService)] = typeof(TImpl);
    public TService Resolve<TService>() => (TService)Resolve(typeof(TService));
    public object Resolve(Type service)
    {
        Type impl = _map[service];
        ConstructorInfo ctor = impl.GetConstructors()[0];
        object[] args = ctor.GetParameters()
            .Select(p => Resolve(p.ParameterType)).ToArray();
        return Activator.CreateInstance(impl, args)!;
    }
}
\`\`\`

实际框架（Microsoft.Extensions.DependencyInjection）还支持：生命周期（单例/作用域/瞬时）、构造函数选择策略、循环依赖检测、编译期优化（用 IL 或表达式树缓存构造）。

### 八、本章小结

- 创建实例：\`Activator.CreateInstance\` / \`ConstructorInfo.Invoke\`
- 加载程序集：\`Assembly.Load\` / \`LoadFrom\` / \`LoadFile\` / \`Load(bytes)\`
- 开放类型 → 封闭类型：\`MakeGenericType\` / \`MakeGenericMethod\`
- 反射调用慢：\`MethodInfo.Invoke\`；想快：\`Delegate.CreateDelegate\` 或 \`DynamicMethod\`
- 运行时造类型：\`AssemblyBuilder\` / \`TypeBuilder\` / \`ILGenerator\`
- 实战模式：DI 容器、ORM 映射、序列化器`,
    code: `// C# 12 顶级语句 —— 反射高级应用演示
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Reflection.Emit;

// === 1. 定义一个带依赖关系的演示类型 ===
public interface ILogger
{
    void Log(string message);
}
public class ConsoleLogger : ILogger
{
    public ConsoleLogger() { }
    public void Log(string message) => Console.WriteLine($"[LOG] {message}");
}
public class UserService
{
    private readonly ILogger _logger;
    // 构造函数依赖 ILogger，DI 容器要能找到它
    public UserService(ILogger logger) { _logger = logger; }
    public void Greet(string name) => _logger.Log($"Hello {name}");
}

// === 2. Activator.CreateInstance：四种姿势 ===
Console.WriteLine("--- Activator.CreateInstance ---");
object? a = Activator.CreateInstance(typeof(ConsoleLogger));
object? b = Activator.CreateInstance(typeof(ConsoleLogger), nonPublic: false); // 仅 public 构造
ConsoleLogger c = Activator.CreateInstance<ConsoleLogger>();
Console.WriteLine($"a => {a}");
Console.WriteLine($"b => {b}");
Console.WriteLine($"c => {c}");

// === 3. MakeGenericType：开放 → 封闭 ===
Console.WriteLine("\\n--- MakeGenericType ---");
Type openList = typeof(List<>);
Console.WriteLine($"开放类型: {openList.FullName} (IsGenericTypeDefinition={openList.IsGenericTypeDefinition})");
Type closedList = openList.MakeGenericType(typeof(int));
Console.WriteLine($"封闭类型: {closedList.FullName} (IsConstructedGenericType={closedList.IsConstructedGenericType})");

// 创建实例并调用 Add
object listInstance = Activator.CreateInstance(closedList)!;
MethodInfo? addMethod = closedList.GetMethod("Add");
addMethod?.Invoke(listInstance, new object[] { 100 });
addMethod?.Invoke(listInstance, new object[] { 200 });
Console.WriteLine($"反射调用 Add 两次后 Count = {closedList.GetProperty("Count")!.GetValue(listInstance)}");

// === 4. MakeGenericMethod：调用泛型方法 ===
Console.WriteLine("\\n--- MakeGenericMethod ---");
// 用 Array.Empty<T>() 做演示
MethodInfo openEmpty = typeof(Array).GetMethod("Empty")!;
MethodInfo closedEmpty = openEmpty.MakeGenericMethod(typeof(string));
string[] emptyArr = (string[])closedEmpty.Invoke(null, null)!;
Console.WriteLine($"Array.Empty<string>() 长度 = {emptyArr.Length}");

// === 5. Delegate.CreateDelegate：把 MethodInfo 变委托（高性能反射）===
Console.WriteLine("\\n--- Delegate.CreateDelegate ---");
MethodInfo? logMethod = typeof(ConsoleLogger).GetMethod("Log", new[] { typeof(string) })!;
// Action<ConsoleLogger, string>：实例方法转委托，第一个参数是 this
var logAction = (Action<ConsoleLogger, string>)
    Delegate.CreateDelegate(typeof(Action<ConsoleLogger, string>), logMethod);
ConsoleLogger logger = new();
logAction(logger, "由委托调用 Log");  // 跟普通方法调用一样快
Console.WriteLine($"委托类型: {logAction.GetType().Name}, Target: {logAction.Target ?? "<static>"}");

// === 6. DynamicMethod：运行时拼出加法 ===
Console.WriteLine("\\n--- DynamicMethod 实现加法 ---");
DynamicMethod dm = new DynamicMethod("Add", typeof(int),
    new[] { typeof(int), typeof(int) }, typeof(object).Module);
ILGenerator il = dm.GetILGenerator();
il.Emit(OpCodes.Ldarg_0);    // 加载参数 0（int a）
il.Emit(OpCodes.Ldarg_1);    // 加载参数 1（int b）
il.Emit(OpCodes.Add);        // 栈顶两数相加，结果入栈
il.Emit(OpCodes.Ret);        // 返回栈顶值
var addFn = (Func<int, int, int>)dm.CreateDelegate(typeof(Func<int, int, int>));
Console.WriteLine($"Add(3, 4) = {addFn(3, 4)}");
Console.WriteLine($"Add(100, 200) = {addFn(100, 200)}");

// === 7. Emit 程序集：运行时造一个带方法的类型 ===
Console.WriteLine("\\n--- AssemblyBuilder / TypeBuilder ---");
AssemblyName an = new AssemblyName("DynamicLib");
AssemblyBuilder ab = AssemblyBuilder.DefineDynamicAssembly(an, AssemblyBuilderAccess.Run);
ModuleBuilder mb = ab.DefineDynamicModule("Main");
TypeBuilder tb = mb.DefineType("HelloType", TypeAttributes.Public | TypeAttributes.Class);

// 添加方法 SayHello() -> string
MethodBuilder meth = tb.DefineMethod("SayHello",
    MethodAttributes.Public, typeof(string), Type.EmptyTypes);
ILGenerator il2 = meth.GetILGenerator();
il2.Emit(OpCodes.Ldstr, "Hello from dynamically generated type!");
il2.Emit(OpCodes.Ret);

Type builtType = tb.CreateType()!;
object builtInstance = Activator.CreateInstance(builtType)!;
string? greeting = (string?)builtType.GetMethod("SayHello")!.Invoke(builtInstance, null);
Console.WriteLine($"动态类型实例方法返回: {greeting}");

// === 8. 迷你依赖注入容器：完整演示 ===
Console.WriteLine("\\n--- 迷你 DI 容器 ---");
Container container = new();
container.Register<ILogger, ConsoleLogger>();
container.Register<UserService, UserService>();

// 检查注册表
Console.WriteLine($"注册项: {container.Describe()}");

// 解析 UserService，容器会自动找它的构造函数依赖 ILogger
UserService svc = container.Resolve<UserService>();
svc.Greet("Reflection DI");

// === 9. 反射缓存优化：避免每次都遍历成员 ===
Console.WriteLine("\\n--- 反射缓存模式 ---");
ReflectionCache<Person> cache = new();
Person p = new Person("Cache", 18);
for (int i = 0; i < 3; i++)
{
    string name = cache.GetField(p, "Name");
    Console.WriteLine($"  第 {i + 1} 次读取 Name = {name}（缓存命中等同于直接字段读取）");
}

// ====================================================
// 局部类型定义
// ====================================================
public class Person
{
    public string Name;
    public int Age { get; set; }
    public Person() { Name = "?"; Age = 0; }
    public Person(string name, int age) { Name = name; Age = age; }
    public void Greet() => Console.WriteLine($"Hi, I'm {Name}.");
}

// 迷你依赖注入容器
public class Container
{
    private readonly Dictionary<Type, Type> _map = new();

    // 注册接口 -> 实现类型
    public void Register<TService, TImpl>() where TImpl : TService
        => _map[typeof(TService)] = typeof(TImpl);

    // 解析类型，自动构造依赖
    public TService Resolve<TService>() => (TService)Resolve(typeof(TService));

    public object Resolve(Type service)
    {
        if (!_map.TryGetValue(service, out Type? impl))
            throw new InvalidOperationException($"未注册类型: {service.FullName}");
        // 找第一个构造函数（实际 DI 容器会按参数最多/最长匹配策略选择）
        ConstructorInfo ctor = impl.GetConstructors()[0];
        // 递归解析每个构造参数
        object[] args = ctor.GetParameters()
            .Select(p => Resolve(p.ParameterType))
            .ToArray();
        return Activator.CreateInstance(impl, args)!;
    }

    public string Describe() => string.Join(", ", _map.Select(kv => $"{kv.Key.Name}->{kv.Value.Name}"));
}

// 反射缓存：把 FieldInfo 缓存起来，避免每次 GetField 都重新查找
public class ReflectionCache<T>
{
    private readonly Dictionary<string, FieldInfo> _fields = new();

    public ReflectionCache()
    {
        // 一次性把所有 public 实例字段缓存起来
        foreach (FieldInfo f in typeof(T).GetFields(BindingFlags.Public | BindingFlags.Instance))
            _fields[f.Name] = f;
    }

    public TResult? GetField<TResult>(T instance, string fieldName)
    {
        FieldInfo? fi = _fields.TryGetValue(fieldName, out FieldInfo? f) ? f : null;
        return fi == null ? default : (TResult?)fi.GetValue(instance);
    }

    public string GetField(T instance, string fieldName)
    {
        FieldInfo? fi = _fields.TryGetValue(fieldName, out FieldInfo? f) ? f : null;
        return fi == null ? "<null>" : fi.GetValue(instance)?.ToString() ?? "<null>";
    }
}`,
    lang: 'cs',
  },

  // ============================================================
  // 第五十八章：特性 Attribute
  // ============================================================
  {
    id: 'csharp4-ch58',
    group: '第九部分 反射与特性',
    icon: '🏷️',
    title: '特性 Attribute',
    content: `## 第五十八章　特性 Attribute

如果说反射是「照镜子」，特性就是「贴标签」——你可以给类、方法、字段、程序集等贴上任意标签，让反射读取它们来驱动各种行为：序列化字段映射、ORM 表/列名、单元测试发现、API 路由注册、参数校验……

### 一、什么是特性？⭐

特性（Attribute）是一种「**附加在代码元素上的元数据**」，编译后会写入程序集的元数据表里，可在运行时通过反射读取。

特性本质上是一个**继承自 \`System.Attribute\` 的类**。使用时用方括号 \`[]\`：

\`\`\`csharp
[Obsolete("请用 NewMethod")]
public void OldMethod() { }
\`\`\`

这里 \`ObsoleteAttribute\` 就是特性类。C# 允许省略后缀 \`Attribute\`，所以 \`[Obsolete(...)]\` 和 \`[ObsoleteAttribute(...)]\` 等价。

### 二、AttributeUsage：约束特性可贴的目标

自定义特性必须用 \`[AttributeUsage]\` 声明能贴到哪些目标上：

\`\`\`csharp
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class MyAttr : Attribute { }
\`\`\`

\`AttributeTargets\` 是枚举，常用值：

| 值 | 可贴位置 |
| --- | --- |
| \`Class\` / \`Struct\` / \`Enum\` / \`Interface\` | 类型 |
| \`Method\` / \`Property\` / \`Field\` / \`Event\` | 成员 |
| \`Constructor\` / \`Parameter\` / \`ReturnValue\` | 构造/参数/返回值 |
| \`Assembly\` / \`Module\` | 整个程序集/模块 |
| \`All\` | 所有 |

\`AttributeUsage\` 还有两个关键命名参数：

- \`AllowMultiple = true\`：允许同一目标贴多次（默认 false）。
- \`Inherited = true\`：子类是否继承父类贴的特性（默认 true）。

\`\`\`csharp
[AttributeUsage(AttributeTargets.Method, AllowMultiple = true, Inherited = false)]
public class RetryAttribute : Attribute { ... }
\`\`\`

### 三、特性参数：位置参数 vs 命名参数

特性的「构造函数」参数叫**位置参数**，必须按顺序传；「可读写属性」作为**命名参数**，用 \`key = value\` 传：

\`\`\`csharp
public class ColumnAttribute : Attribute
{
    public string Name { get; set; }      // 命名参数
    public int MaxLength { get; set; }    // 命名参数
    public ColumnAttribute(string name)   // 位置参数
    {
        Name = name;
    }
}

// 使用
[Column("user_name", MaxLength = 50)]
public string UserName { get; set; }
\`\`\`

⚠ 注意：命名参数必须放在位置参数后面；特性构造参数和属性的类型必须是**常量类型**（基本类型、string、enum、Type、一维数组），不能传对象实例。

### 四、自定义特性：完整示例

下面我们定义 ORM 用的三个特性：

\`\`\`csharp
[AttributeUsage(AttributeTargets.Class)]
public class TableAttribute : Attribute
{
    public string Name { get; }
    public TableAttribute(string name) => Name = name;
}

[AttributeUsage(AttributeTargets.Property)]
public class ColumnAttribute : Attribute
{
    public string Name { get; }
    public ColumnAttribute(string name) => Name = name;
}

[AttributeUsage(AttributeTargets.Property)]
public class MaxLengthAttribute : Attribute
{
    public int Length { get; }
    public MaxLengthAttribute(int length) => Length = length;
}
\`\`\`

应用到一个 \`User\` 类：

\`\`\`csharp
[Table("users")]
public class User
{
    [Column("id")]
    public int Id { get; set; }

    [Column("user_name"), MaxLength(50)]
    public string Name { get; set; }

    [Column("email"), MaxLength(120)]
    public string Email { get; set; }
}
\`\`\`

### 五、读取特性：GetCustomAttribute

特性贴上去后，运行时通过反射读取：

\`\`\`csharp
// 检查是否定义
bool defined = Attribute.IsDefined(typeof(User), typeof(TableAttribute));

// 读取单个特性
TableAttribute? attr = typeof(User).GetCustomAttribute<TableAttribute>();
string tableName = attr?.Name ?? typeof(User).Name;

// 读取多个（AllowMultiple=true 时用）
MaxLengthAttribute? maxLen = prop.GetCustomAttribute<MaxLengthAttribute>();
\`\`\`

\`Attribute.GetCustomAttributes\` 和 \`MemberInfo.GetCustomAttributes\` 的区别：前者是静态方法，可以查 \`ParameterInfo\`、\`Assembly\`、\`Module\` 等所有目标，后者是实例方法。

### 六、内置特性盘点

.NET 内置了很多常用特性：

| 特性 | 作用 |
| --- | --- |
| \`[Obsolete]\` | 标记已过时，编译器产生警告/错误 |
| \`[Conditional("DEBUG")]\` | 仅在指定编译符号下保留方法调用 |
| \`[Serializable]\` / \`[NonSerialized]\` | 标记可序列化 / 排除字段 |
| \`[STAThread]\` | 主线程为 COM 单线程单元 |
| \`[DllImport]\` | P/Invoke 调用本机 DLL |
| \`[Flags]\` | 标记枚举为位标志 |
| \`[DebuggerDisplay]\` | 调试器变量显示格式 |
| \`[DefaultValue]\` | 设计器默认值 |
| \`[Required]\` | 数据标注：必填校验 |
| \`[JsonPropertyName]\` | System.Text.Json 字段映射 |
| \`[JsonProperty]\` | Newtonsoft.Json 字段映射 |

\`[Conditional]\` 特别有趣：它**不删方法**，但**删调用点**：

\`\`\`csharp
[Conditional("DEBUG")]
public static void Log(string msg) { ... }

// Release 编译时下面这行调用会整个被编译器删除
Log("debug info");
\`\`\`

### 七、特性继承

\`AttributeUsage(Inherited = true)\` 时，子类继承父类贴的特性。但默认只对「类层级」生效，方法重写时特性是否继承要看具体 API。

\`\`\`csharp
[MyAttr(Inherited = true)]
public class Base { }
public class Derived : Base { }  // Derived 也能 GetCustomAttribute<MyAttr>()
\`\`\`

⚠ 注意：\`Inherited\` 对 \`AttributeTargets.Method\` 的影响：若子类 override 父方法，新方法上**不自动继承**特性，需要手动重贴。

### 八、用特性驱动 SQL 生成

ORM 的核心就是把「特性元数据」翻译成 SQL：

\`\`\`csharp
string BuildInsert<T>(T entity)
{
    Type t = typeof(T);
    TableAttribute? tbl = t.GetCustomAttribute<TableAttribute>();
    string tableName = tbl?.Name ?? t.Name;

    var columns = new List<string>();
    var values = new List<string?>();
    foreach (PropertyInfo p in t.GetProperties())
    {
        ColumnAttribute? col = p.GetCustomAttribute<ColumnAttribute>();
        if (col == null) continue;
        columns.Add(col.Name);
        object? val = p.GetValue(entity);
        values.Add(val is string s ? $"'{s}'" : val?.ToString() ?? "NULL");
    }
    return $"INSERT INTO {tableName} ({string.Join(",", columns)}) VALUES ({string.Join(",", values)})";
}
\`\`\`

执行后得到形如 \`INSERT INTO users (id,user_name,email) VALUES (1,'Tom','tom@x.com')\` 的 SQL。

### 九、本章小结

- 特性 = 继承 \`Attribute\` 的类，用 \`[]\` 贴标签
- \`[AttributeUsage]\` 限定目标 + AllowMultiple + Inherited
- 位置参数（构造函数）+ 命名参数（属性）
- 反射读取：\`GetCustomAttribute<T>\` / \`GetCustomAttributes\` / \`Attribute.IsDefined\`
- 内置常用：\`Obsolete\` / \`Conditional\` / \`Flags\` / \`JsonPropertyName\` ……
- 实战：ORM 表名/列名映射、序列化字段名、API 路由、单元测试发现`,
    code: `// C# 12 顶级语句 —— 特性 Attribute 演示
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;

// === 1. 自定义三个 ORM 特性 ===

// [Table(name)]：标记类对应的数据库表名
[AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
public class TableAttribute : Attribute
{
    public string Name { get; }
    // 位置参数：构造函数参数
    public TableAttribute(string name) => Name = name;
}

// [Column(name)]：标记属性对应的数据库列名
[AttributeUsage(AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
public class ColumnAttribute : Attribute
{
    public string Name { get; }
    public bool IsPrimaryKey { get; set; }  // 命名参数
    public bool IsRequired { get; set; }    // 命名参数
    public ColumnAttribute(string name) => Name = name;
}

// [MaxLength(length)]：标记字段最大长度（用于校验/生成 DDL）
[AttributeUsage(AttributeTargets.Property, AllowMultiple = false, Inherited = true)]
public class MaxLengthAttribute : Attribute
{
    public int Length { get; }
    public MaxLengthAttribute(int length) => Length = length;
}

// === 2. 应用特性到 User 实体 ===
[Table("users")]
public class User
{
    [Column("id", IsPrimaryKey = true)]
    public int Id { get; set; }

    [Column("user_name", IsRequired = true), MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [Column("email", IsRequired = true), MaxLength(120)]
    public string Email { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    // 没有 [Column]，会被 ORM 忽略
    public string? Computed => $"{Name}<{Email}>";
}

// 一个未贴 [Table] 的类，演示默认行为
public class Product
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
}

// === 3. 读取特性元数据 ===
Console.WriteLine("=== 读取 User 类型元数据 ===");
Type userType = typeof(User);

// 3.1 类级别的 [Table]
TableAttribute? tbl = userType.GetCustomAttribute<TableAttribute>();
string tableName = tbl?.Name ?? userType.Name;
Console.WriteLine($"表名: {tableName}");

// 3.2 遍历属性，读取 [Column] 和 [MaxLength]
foreach (PropertyInfo prop in userType.GetProperties())
{
    ColumnAttribute? col = prop.GetCustomAttribute<ColumnAttribute>();
    if (col == null)
    {
        Console.WriteLine($"  {prop.Name,-12} -> [忽略]");
        continue;
    }
    MaxLengthAttribute? max = prop.GetCustomAttribute<MaxLengthAttribute>();
    string flags = (col.IsPrimaryKey ? "PK " : "") + (col.IsRequired ? "必填 " : "");
    Console.WriteLine($"  {prop.Name,-12} -> 列 {col.Name,-12} 类型 {prop.PropertyType.Name,-8} {flags}{(max != null ? "max=" + max.Length : "")}");
}

// 3.3 用 Attribute.IsDefined 检查
Console.WriteLine($"\\nUser 是否带 [Table]：{Attribute.IsDefined(userType, typeof(TableAttribute))}");
Console.WriteLine($"Product 是否带 [Table]：{Attribute.IsDefined(typeof(Product), typeof(TableAttribute))}");

// === 4. 根据特性生成 INSERT SQL ===
User u = new User
{
    Id = 1,
    Name = "Tom",
    Email = "tom@example.com",
    CreatedAt = DateTime.Now,
};
string insertSql = SqlBuilder.BuildInsert(u);
Console.WriteLine($"\\n生成的 INSERT SQL:\\n  {insertSql}");

// === 5. 根据特性生成 CREATE TABLE DDL ===
string ddl = SqlBuilder.BuildCreateTable(typeof(User));
Console.WriteLine($"\\n生成的 DDL:\\n{ddl}");

// === 6. 演示内置特性：Obsolete / Conditional / Flags ===
Console.WriteLine("\\n=== 内置特性演示 ===");

// 6.1 [Obsolete] 让编译器产生警告/错误
ObsoleteMethodInfo();

// 6.2 [Flags] 枚举位运算
[Flags]
enum Permission
{
    None = 0,
    Read = 1,
    Write = 2,
    Execute = 4,
    All = Read | Write | Execute
}
Permission p = Permission.Read | Permission.Write;
Console.WriteLine($"权限: {p}（包含 Read? {p.HasFlag(Permission.Read)}, Execute? {p.HasFlag(Permission.Execute)}）");

// 6.3 [Conditional("DEBUG")]：仅在 DEBUG 编译符号下保留调用
Log("Debug 模式可见");
Log("Release 模式编译时这行被删除");

// === 7. 模拟 [JsonPropertyName] 类似的字段映射 ===
Console.WriteLine("\\n=== 模拟 JSON 字段映射 ===");
Dictionary<string, object?> json = new()
{
    ["user_name"] = "Alice",
    ["email"] = "alice@x.com",
    ["unknown_field"] = 999,
};
User? parsed = MapFromJson<User>(json);
Console.WriteLine($"映射结果: Id={parsed?.Id}, Name={parsed?.Name}, Email={parsed?.Email}");

// ====================================================
// 局部函数与工具类
// ====================================================
#pragma warning disable CS0618 // 抑制 Obsolete 警告以便演示
static void ObsoleteMethodInfo()
{
    Type t = typeof(ObsoleteDemo);
    foreach (MethodInfo m in t.GetMethods())
    {
        ObsoleteAttribute? obs = m.GetCustomAttribute<ObsoleteAttribute>();
        if (obs != null)
            Console.WriteLine($"  [Obsolete] {m.Name}: {obs.Message} (IsError={obs.IsError})");
    }
}
#pragma warning restore CS0618

// 一个用来演示 [Obsolete] 的类
public static class ObsoleteDemo
{
    [Obsolete("请改用 NewMethod()", error: false)]
    public static void OldMethod() { }

    [Obsolete("严禁使用", error: true)]
    public static void VeryOldMethod() { }

    public static void NewMethod() { }
}

// 通用 SQL 生成器
public static class SqlBuilder
{
    // 生成 INSERT 语句
    public static string BuildInsert<T>(T entity)
    {
        Type t = typeof(T);
        // 1. 获取表名
        TableAttribute? tblAttr = t.GetCustomAttribute<TableAttribute>();
        string tableName = tblAttr?.Name ?? t.Name;

        // 2. 遍历属性收集列名和值
        List<string> cols = new();
        List<string> vals = new();
        foreach (PropertyInfo p in t.GetProperties())
        {
            ColumnAttribute? colAttr = p.GetCustomAttribute<ColumnAttribute>();
            if (colAttr == null) continue;
            cols.Add(colAttr.Name);
            object? val = p.GetValue(entity);
            vals.Add(FormatValue(val));
        }
        return $"INSERT INTO {tableName} ({string.Join(", ", cols)}) VALUES ({string.Join(", ", vals)});";
    }

    // 生成 CREATE TABLE 语句
    public static string BuildCreateTable(Type t)
    {
        TableAttribute? tblAttr = t.GetCustomAttribute<TableAttribute>();
        string tableName = tblAttr?.Name ?? t.Name;

        StringBuilder sb = new();
        sb.AppendLine($"CREATE TABLE {tableName} (");
        List<string> colDefs = new();
        foreach (PropertyInfo p in t.GetProperties())
        {
            ColumnAttribute? colAttr = p.GetCustomAttribute<ColumnAttribute>();
            if (colAttr == null) continue;
            MaxLengthAttribute? maxAttr = p.GetCustomAttribute<MaxLengthAttribute>();
            string type = MapToSqlType(p.PropertyType, maxAttr?.Length);
            string extras = "";
            if (colAttr.IsPrimaryKey) extras += " PRIMARY KEY";
            if (colAttr.IsRequired) extras += " NOT NULL";
            colDefs.Add($"  {colAttr.Name} {type}{extras}");
        }
        sb.Append(string.Join(",\\n", colDefs));
        sb.AppendLine("\\n);");
        return sb.ToString();
    }

    // C# 类型 -> SQL 类型（简化版）
    private static string MapToSqlType(Type t, int? maxLen)
    {
        if (t == typeof(int) || t == typeof(long)) return "INTEGER";
        if (t == typeof(DateTime)) return "DATETIME";
        if (t == typeof(bool)) return "BOOLEAN";
        if (t == typeof(string)) return maxLen.HasValue ? $"VARCHAR({maxLen})" : "TEXT";
        return "TEXT";
    }

    // 把值格式化为 SQL 字面量
    private static string FormatValue(object? val)
    {
        return val switch
        {
            null => "NULL",
            string s => $"'{s.Replace("'", "''")}'",  // 转义单引号，防止 SQL 注入
            DateTime dt => $"'{dt:yyyy-MM-dd HH:mm:ss}'",
            bool b => b ? "1" : "0",
            _ => val.ToString()!,
        };
    }
}

// 简易的 [Conditional("DEBUG")] 方法
[System.Diagnostics.Conditional("DEBUG")]
static void Log(string message)
{
    Console.WriteLine($"  [LOG] {message}");
}

// 从字典映射到对象：模拟 JSON 反序列化
static T? MapFromJson<T>(Dictionary<string, object?> json) where T : new()
{
    T obj = new T();
    Type t = typeof(T);
    foreach (PropertyInfo p in t.GetProperties())
    {
        ColumnAttribute? col = p.GetCustomAttribute<ColumnAttribute>();
        if (col == null) continue;
        if (json.TryGetValue(col.Name, out object? val) && val != null)
        {
            // 简化：直接转换
            object? converted = Convert.ChangeType(val, p.PropertyType);
            p.SetValue(obj, converted);
        }
    }
    return obj;
}`,
    lang: 'cs',
  },

  // ============================================================
  // 第五十九章：源生成器简介
  // ============================================================
  {
    id: 'csharp4-ch59',
    group: '第九部分 反射与特性',
    icon: '✨',
    title: '源生成器简介',
    content: `## 第五十九章　源生成器简介

反射虽然强大，但有三个问题：**慢**（运行时查元数据）、**AOT 不友好**（NativeAOT 会修剪掉「看似没用」的元数据）、**无法静态分析**（编译器看不见你的意图）。源生成器（Source Generator）正是为了解决这些问题而生——它在**编译期**生成代码，零运行时开销。

### 一、源生成器是什么？⭐

源生成器（Source Generators，C# 9+ 引入）是一种**编译器插件**：编译器在编译过程中调用你的生成器代码，生成器可以读取语法树，向编译过程「注入」新的 C# 源代码，这些代码和源码一起编译。

核心特点：

- **编译时执行**：生成的代码直接进入程序集，零运行时开销。
- **只读语法树**：生成器**不能修改**现有代码，只能新增。
- **可调试**：生成的代码可设为输出到文件，方便调试。
- **AOT 友好**：所有逻辑都在编译期完成，运行时不需要反射。

### 二、ISourceGenerator vs IIncrementalGenerator

.NET 6+ 推出了**增量源生成器**（\`IIncrementalGenerator\`），它是初代 \`ISourceGenerator\` 的升级版：

| 维度 | \`ISourceGenerator\` | \`IIncrementalGenerator\` |
| --- | --- | --- |
| 推出版本 | C# 9 / .NET 5 | C# 9 / .NET 6+ |
| 增量缓存 | 否（每次重算） | 是（基于管线缓存） |
| 性能 | 较慢 | 显著更快 |
| 推荐使用 | 否（已过时） | 是 |

初代生成器在「\`IncrementalInit\`」每变更一次就全部重跑，性能很差。增量生成器采用 **管线 + 缓存** 模型：输入分阶段处理，每阶段都缓存，只有真正变更的部分才会重新计算。

### 三、源生成器 vs 反射

| 维度 | 反射 | 源生成器 |
| --- | --- | --- |
| 时机 | 运行时 | 编译期 |
| 性能 | 慢（每调用查元数据） | 零运行时成本 |
| AOT 兼容 | 差（会被修剪） | 完美兼容 NativeAOT |
| 调试 | 困难 | 简单（生成代码可看） |
| 复杂度 | 简单 | 较高（要懂 Roslyn API） |
| 适用场景 | 动态插件、运行时发现 | 静态已知、性能敏感 |

⚠ 注意：源生成器**不能替代**所有反射场景。运行时加载外部 DLL、根据字符串名动态调用方法这类场景，源生成器搞不定。

### 四、JsonSerializerContext：开箱即用的源生成器 ⭐

\`System.Text.Json\` 在 .NET 6+ 提供了 \`JsonSerializerContext\`，让序列化代码在**编译期**生成，避免运行时反射，且 NativeAOT 友好。

定义：

\`\`\`csharp
[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
[JsonSerializable(typeof(Person))]
[JsonSerializable(typeof(List<Person>))]
internal partial class MyJsonContext : JsonSerializerContext
{
}
\`\`\`

\`partial\` 关键字是关键——编译器会**生成另一半** partial 类，包含所有序列化代码。使用：

\`\`\`csharp
// 老方式：运行时反射
string json = JsonSerializer.Serialize(p);

// 新方式：用生成上下文
string json = JsonSerializer.Serialize(p, MyJsonContext.Default.Person);
\`\`\`

新方式不仅更快，还**完全不需要反射**——所有元数据访问在编译期完成。

### 五、增量生成器骨架

完整的源生成器实现需要：

1. 引用 \`Microsoft.CodeAnalysis.CSharp\` NuGet 包（ Roslyn 编译器 API）。
2. 实现 \`IIncrementalGenerator\` 接口。
3. 注册一个 \`ForAttributeWithMetadataName\` 或语法过滤的管线。
4. 输出 \`SourceProductionContext.AddSource\` 注入新源文件。

骨架伪代码（无法在顶级语句里运行，需要单独项目）：

\`\`\`csharp
[Generator]
public class MyGenerator : IIncrementalGenerator
{
    public void Initialize(IncrementalGeneratorInitializationContext context)
    {
        // 找到所有带 [MyAttr] 的类
        var pipeline = context.SyntaxProvider
            .ForAttributeWithMetadataName(
                "MyApp.MyAttrAttribute",
                predicate: (node, _) => node is ClassDeclarationSyntax,
                transform: (ctx, _) => (INamedTypeSymbol)ctx.TargetSymbol)
            .Where(t => t is not null);

        // 注册输出：基于这些类型生成代码
        context.RegisterSourceOutput(pipeline, (spc, type) =>
        {
            string code = GenerateCodeFor(type);
            spc.AddSource($"{type.Name}.g.cs", code);
        });
    }
}
\`\`\`

⚠ 注意：本项目不能引用 Roslyn 包（它属于编译器扩展项目），所以本章代码用「伪代码」演示生成器实现，配合一个真实的 \`JsonSerializerContext\` 例子让你感受实际效果。

### 六、ForAttributeWithMetadataName：特性驱动生成

这是 .NET 6+ 增量生成器最常用的 API：找出所有贴了某个特性的目标，对它们生成代码。典型场景：

- **\`System.Text.Json\`**：贴 \`[JsonSerializable]\` 生成序列化代码。
- **\`System.Runtime.InteropServices\`**：贴 \`[LibraryImport]\` 生成 P/Invoke 代码（替代 \`[DllImport]\`）。
- **ASP.NET Core**：贴 \`[Route]\` / \`[HttpGet]\` 自动生成路由表。
- **社区 MVVM Toolkit\`**：贴 \`[ObservableProperty]\` 生成属性包装代码。

### 七、PostInitializationOutput：启动期注入代码

除了「按需生成」，源生成器还可以在「启动期」注入一些**全局代码**（不依赖语法分析）：

\`\`\`csharp
context.RegisterPostInitializationOutput(ctx =>
{
    ctx.AddSource("InitHelper.g.cs", "namespace MyApp { public static class InitHelper {} }");
});
\`\`\`

这种代码是「静态」的，不基于用户代码变化，适合注入辅助扩展方法。

### 八、源生成器的调试

调试生成器的代码：

1. 在生成器项目里 \`launchSettings.json\` 指定 \`dotnet\` 作为可执行文件，参数为目标项目编译命令。
2. 用 \`Debugger.Launch()\` 在生成器内部触发断点。
3. 或在目标项目里启用 \`EmitCompilerGeneratedFiles\`，把生成的 \`.g.cs\` 输出到 \`obj/Generated\` 目录直接查看。

\`\`\`xml
<PropertyGroup>
  <EmitCompilerGeneratedFiles>true</EmitCompilerGeneratedFiles>
  <CompilerGeneratedFilesOutputPath>Generated</CompilerGeneratedFilesOutputPath>
</PropertyGroup>
\`\`\`

### 九、NativeAOT 与 Trimming 简介

**NativeAOT**（.NET 8 起正式支持）：把 .NET 程序**直接编译为原生机器码**，运行时不需要 JIT，启动极快、内存占用小，部署为单文件。

**Trimming（修剪）**：发布时移除「未被引用」的代码与元数据，缩小体积。反射会因为「静态分析看不见动态访问」而被修剪掉，运行时报 \`MissingMetadataException\`。

要让代码 NativeAOT 友好：

- 用 \`[DynamicallyAccessedMembers]\` 显式标注反射访问的范围。
- 优先用源生成器替代反射（如 \`JsonSerializerContext\`）。
- 避免 \`Type.GetType(string)\` 这类纯动态查找。

### 十、本章小结

- 源生成器 = 编译期生成代码的「编译器插件」
- 增量版 \`IIncrementalGenerator\` 性能远好于初代 \`ISourceGenerator\`
- \`JsonSerializerContext\` 是最常用的开箱即用生成器
- \`ForAttributeWithMetadataName\` 是特性驱动生成的入口
- \`PostInitializationOutput\` 注入启动期静态代码
- NativeAOT + Trimming 是 .NET 性能与体积的终极武器
- 反射 → 源生成器是 .NET 演进的核心方向之一`,
    code: `// C# 12 顶级语句 —— 源生成器演示
// 注意：本 demo 演示【运行时可见的部分】，即 JsonSerializerContext 实战。
// 真正的源生成器实现（IIncrementalGenerator）以注释伪代码形式给出。
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

// === 1. 定义要序列化的类型 ===
public class Person
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public DateTime BirthDate { get; set; }
    public List<string> Tags { get; set; } = new();
}

public class Order
{
    public int OrderId { get; set; }
    public decimal Total { get; set; }
    public Person? Customer { get; set; }
}

// === 2. 定义 JsonSerializerContext（编译期生成序列化代码）===
// 标记 partial：编译器/源生成器会自动生成另一半类
[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,  // 属性名 camelCase
    WriteIndented = true,                                    // 输出缩进
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]  // 忽略 null
[JsonSerializable(typeof(Person))]
[JsonSerializable(typeof(Order))]
[JsonSerializable(typeof(List<Person>))]
[JsonSerializable(typeof(List<Order>))]
internal partial class AppJsonContext : JsonSerializerContext
{
    // 生成器会自动实现 JsonSerializerContext 的抽象成员
    // 提供静态属性 Default，里面包含 Default.Person / Default.Order 等
}

// === 3. 演示：用源生成器上下文序列化 ===
Console.WriteLine("=== JsonSerializerContext 演示 ===");
Person p = new Person
{
    Id = 1,
    Name = "Tom",
    BirthDate = new DateTime(1990, 1, 1),
    Tags = new List<string> { "vip", "active" },
};

// 3.1 用源生成器上下文序列化（运行时无反射）
string json = JsonSerializer.Serialize(p, AppJsonContext.Default.Person);
Console.WriteLine($"序列化 Person:\\n{json}");

// 3.2 反序列化
Person? p2 = JsonSerializer.Deserialize(json, AppJsonContext.Default.Person);
Console.WriteLine($"反序列化结果: Id={p2?.Id}, Name={p2?.Name}, Tags=[{string.Join(",", p2?.Tags ?? new List<string>())}]");

// 3.3 序列化集合
List<Person> people = new() { p, new Person { Id = 2, Name = "Jerry" } };
string listJson = JsonSerializer.Serialize(people, AppJsonContext.Default.ListPerson);
Console.WriteLine($"\\n序列化 List<Person>:\\n{listJson}");

// === 4. 对比：反射序列化 vs 源生成器序列化 ===
Console.WriteLine("\\n=== 反射 vs 源生成器对比 ===");
Order order = new Order
{
    OrderId = 100,
    Total = 199.99m,
    Customer = p,
};

// 4.1 反射方式（默认）：运行时查元数据
string jsonReflect = JsonSerializer.Serialize(order);
Console.WriteLine($"反射方式: {jsonReflect}");

// 4.2 源生成器方式：编译期已生成
string jsonGen = JsonSerializer.Serialize(order, AppJsonContext.Default.Order);
Console.WriteLine($"源生成器: {jsonGen}");

// === 5. 模拟「特性驱动源生成器」的使用效果 ===
Console.WriteLine("\\n=== 模拟特性驱动生成（伪代码展示）===");
// 假设我们有一个 [AutoToString] 特性
// 源生成器会在编译期扫描所有贴这个特性的类，自动为它们生成 ToString() 方法
[AutoToString]
public class Product
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public decimal Price { get; set; }
}

Product prod = new Product { Id = 42, Title = "Phone", Price = 4999m };
// 以下方法在「真实源生成器」场景下由编译器自动生成，本 demo 用手写版本模拟
Console.WriteLine(prod.ToString());

// === 6. 源生成器实现伪代码（注释展示）===
Console.WriteLine("\\n=== 源生成器骨架伪代码 ===");
Console.WriteLine(@"// 单独项目里实现（需引用 Microsoft.CodeAnalysis.CSharp 包）
using Microsoft.CodeAnalysis;

[Generator]
public class AutoToStringGenerator : IIncrementalGenerator
{
    public void Initialize(IncrementalGeneratorInitializationContext context)
    {
        // 1. 启动期注入 [AutoToString] 特性定义
        context.RegisterPostInitializationOutput(ctx =>
        {
            ctx.AddSource(""AutoToStringAttribute.g.cs"", @""
namespace System {
    [AttributeUsage(AttributeTargets.Class)]
    public class AutoToStringAttribute : Attribute {}
}"");
        });

        // 2. 管线：找出所有贴 [AutoToString] 的类
        var pipeline = context.SyntaxProvider
            .ForAttributeWithMetadataName(
                ""System.AutoToStringAttribute"",
                predicate: (node, _) => node is ClassDeclarationSyntax,
                transform: (ctx, _) => (ClassDeclarationSyntax)ctx.TargetNode)
            .Where(c => c is not null);

        // 3. 注册输出：为每个类生成 ToString() 方法
        context.RegisterSourceOutput(pipeline, (spc, classDecl) =>
        {
            string ns = classDecl.FirstAncestorOrSelf<BaseNamespaceDeclarationSyntax>()?.Name.ToString() ?? ""System"";
            string name = classDecl.Identifier.Text;
            string code = $@""
namespace {ns}
{{
    public partial class {name}
    {{
        public override string ToString()
        {{
            return $""[{name}]"";
        }}
    }}
}}"";
            spc.AddSource($""{name}.AutoToString.g.cs"", code);
        });
    }
}");

// ====================================================
// 局部函数和类型定义
// ====================================================

// 模拟源生成器会自动生成的 [AutoToString] 特性
[AttributeUsage(AttributeTargets.Class)]
public class AutoToStringAttribute : Attribute { }

// 由于本 demo 没有 Roslyn 包，手写一个 partial 类模拟源生成器输出
// 真实场景下：上面 Product 类贴了 [AutoToString]，源生成器会自动生成下半部分
public partial class Product
{
    // 这个方法是「源生成器输出」的模拟版本
    public override string ToString()
    {
        return $"[Product Id={Id}, Title={Title}, Price={Price}]";
    }
}`,
    lang: 'cs',
  },
];

export { chapters };
