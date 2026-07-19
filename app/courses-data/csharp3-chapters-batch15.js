// =============================================================
// C# 从入门到精通大全（终极版）—— 第15批章节
// 第十五部分 工程化实战 + 结尾（共 8 章）
// -------------------------------------------------------------
// 本批包含 8 章：
//   csharp3-ch79 : 第七十九章 命名空间与程序集
//   csharp3-ch80 : 第八十章 反射
//   csharp3-ch81 : 第八十一章 特性 (Attribute)
//   csharp3-ch82 : 第八十二章 模式匹配
//   csharp3-ch83 : 第八十三章 综合项目：命令行工具
//   csharp3-ch84 : 第八十四章 综合项目：数据处理引擎
//   csharp3-ch85 : 第八十五章 综合项目：Web API 客户端
//   csharp3-ch86 : 第八十六章 结语与进阶方向
// =============================================================

const chapters = [
  // ============================================================
  // 第七十九章：命名空间与程序集
  // ============================================================
  {
    id: 'csharp3-ch79',
    group: '第十五部分 工程化实战',
    icon: '📦',
    title: '第七十九章 命名空间与程序集',
    content: `## 第七十九章　命名空间与程序集

命名空间用于组织代码，程序集是 .NET 中的部署单元。理解它们有助于构建大型项目。

### 一、命名空间声明 ⭐⭐⭐

\`\`\`csharp
// 命名空间用于避免类型名称冲突，逻辑上组织代码
// 命名空间可以嵌套

// 1. 传统命名空间声明
namespace MyCompany.MyProject.Data
{
    public class UserRepository
    {
        public void Save(string name)
        {
            Console.WriteLine($"保存用户: {name}");
        }
    }
}

// 2. 使用命名空间中的类型
// 全限定名
var repo = new MyCompany.MyProject.Data.UserRepository();
repo.Save("张三");

// 使用 using 指令简化
using MyCompany.MyProject.Data;
var repo2 = new UserRepository();                  // 不需要全限定名

// 3. 文件作用域命名空间（C# 10+，推荐）
// namespace MyCompany.MyProject.Services;
// 后续所有代码都属于此命名空间，无需缩进
// 一个文件只能有一个文件作用域命名空间

// 4. 命名空间嵌套
namespace Outer
{
    namespace Inner
    {
        public class NestedClass
        {
            public static void Hello() => Console.WriteLine("嵌套命名空间");
        }
    }
}

// 等价于 namespace Outer.Inner { ... }
Outer.Inner.NestedClass.Hello();
\`\`\`

### 二、using 指令 ⭐⭐⭐

\`\`\`csharp
// using 指令的 5 种用法

// 1. using 命名空间（传统用法）
using System;
using System.Collections.Generic;

// 2. using static：导入静态成员（C# 6+）
using static System.Math;                          // 导入 Math 的所有静态方法
using static System.Console;                       // 导入 Console 的静态方法

// 现在可以直接使用
WriteLine($"PI = {PI}");                           // 无需 Math.PI、Console.WriteLine
WriteLine($"Sqrt(16) = {Sqrt(16)}");              // 无需 Math.Sqrt

// 3. using alias：命名空间别名
using IO = System.IO;                              // 命名空间别名
var file = IO.File.ReadAllText("/tmp/test.txt");

// 4. using alias：类型别名
using StringList = System.Collections.Generic.List<string>;  // 类型别名
StringList list = new() { "a", "b", "c" };
WriteLine($"StringList: {string.Join(", ", list)}");

// 5. global using：全局 using（C# 10+）
// 在 GlobalUsings.cs 或 Program.cs 中声明
// global using System;
// global using System.Collections.Generic;
// 项目中的所有文件自动拥有这些 using
// 减少重复 using 声明

// 6. implicit usings：隐式 using（.NET 6+）
// 项目文件中 <ImplicitUsings>enable</ImplicitUsings>
// 自动添加常用的 global using（如 System、System.Linq 等）
WriteLine("隐式 using 在 .NET 6+ 中默认启用");
\`\`\`

### 三、程序集基础 ⭐⭐⭐

\`\`\`csharp
// 程序集（Assembly）是 .NET 的部署和版本控制单元
// 一个 .csproj 项目编译后生成一个程序集（.dll 或 .exe）

// 1. 获取当前程序集信息
var assembly = System.Reflection.Assembly.GetExecutingAssembly();
Console.WriteLine($"程序集名称: {assembly.GetName().Name}");
Console.WriteLine($"版本: {assembly.GetName().Version}");
Console.WriteLine($"位置: {assembly.Location}");

// 2. 程序集引用
// 在 .csproj 中添加引用：
// <ItemGroup>
//   <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
//   <ProjectReference Include="..\\MyLib\\MyLib.csproj" />
// </ItemGroup>

// 3. 程序集属性（通常在 AssemblyInfo.cs 或 .csproj 中设置）
// [assembly: AssemblyVersion("1.0.0.0")]
// [assembly: AssemblyFileVersion("1.0.0.0")]
// [assembly: AssemblyInformationalVersion("1.0.0-beta1")]

// 4. 查看已加载的程序集
var assemblies = AppDomain.CurrentDomain.GetAssemblies();
foreach (var asm in assemblies.Take(5))
{
    Console.WriteLine($"  已加载: {asm.GetName().Name}");
}
Console.WriteLine($"共加载 {assemblies.Length} 个程序集");
\`\`\`

### 四、internal 修饰符 ⭐⭐⭐

\`\`\`csharp
// internal 限制类型只能在同一个程序集内访问
// 这是 .NET 中封装的关键机制

// 在 MyLib.csproj 中：
// public class PublicClass { }      // 任何程序集都可以访问
// internal class InternalClass { }  // 只能在同一程序集内访问
// class DefaultClass { }            // 默认是 internal

// 1. internal 的用途
// - 隐藏实现细节
// - 避免 API 污染
// - 保持向后兼容性

// 2. InternalsVisibleTo：允许特定程序集访问 internal 成员
// 在 AssemblyInfo.cs 或 .csproj 中：
// [assembly: InternalsVisibleTo("MyTests")]
// 这样测试项目可以访问被测试项目的 internal 类型

// 3. 强命名程序集需要完整公钥
// [assembly: InternalsVisibleTo("MyTests, PublicKey=...")]

Console.WriteLine("internal: 同一程序集内可见");
Console.WriteLine("InternalsVisibleTo: 允许测试项目访问 internal");
\`\`\`

### 五、项目结构最佳实践 ⭐⭐

\`\`\`csharp
// 典型 .NET 解决方案结构
// Solution (.sln)
// ├── src/
// │   ├── MyApp.Web/          (ASP.NET Core Web 项目)
// │   ├── MyApp.Application/  (应用层，业务逻辑)
// │   ├── MyApp.Domain/       (领域层，实体和接口)
// │   └── MyApp.Infrastructure/(基础设施层，数据访问)
// └── tests/
//     ├── MyApp.UnitTests/
//     └── MyApp.IntegrationTests/

// 命名空间约定：
// - 公司名.项目名.层名.模块名
// - 如: MyCompany.MyApp.Application.Services.UserService
// - 命名空间应与文件夹结构一致

// 文件作用域命名空间（C# 10+）：
// namespace MyApp.Infrastructure.Data;
// 一个文件只包含一个命名空间，简洁

Console.WriteLine("项目结构: src/ + tests/");
Console.WriteLine("命名空间: 公司.项目.层.模块");
Console.WriteLine("一个文件一个命名空间（C# 10+）");
\`\`\`

### 六、关键总结

| 概念 | 说明 |
| --- | --- |
| \`namespace\` | 组织类型，避免名称冲突 |
| 文件作用域命名空间 | C# 10+，一个文件一个命名空间 |
| \`using\` | 导入命名空间 |
| \`using static\` | 导入静态成员 |
| \`global using\` | 全局 using（C# 10+） |
| 程序集 | .dll/.exe，部署单元 |
| \`internal\` | 同一程序集内可见 |
| \`InternalsVisibleTo\` | 允许外部程序集访问 internal |

**最佳实践**：
1. 命名空间与文件夹结构一致
2. C# 10+ 使用文件作用域命名空间
3. 使用 \`global using\` 减少重复
4. \`internal\` 隐藏实现细节
5. 测试项目用 \`InternalsVisibleTo\` 访问 internal

`,
  },

  // ============================================================
  // 第八十章：反射
  // ============================================================
  {
    id: 'csharp3-ch80',
    group: '第十五部分 工程化实战',
    icon: '🔍',
    title: '第八十章 反射',
    content: `## 第八十章　反射

反射是运行时检查类型元数据、动态创建对象和调用方法的机制。框架（ASP.NET Core、EF Core）大量使用反射。

### 一、Type 基础 ⭐⭐⭐

\`\`\`csharp
// Type 类是反射的核心，表示类型的元数据

// 1. 获取 Type 的三种方式
// 方式一：typeof 运算符（编译时已知类型）
Type stringType = typeof(string);                  // 获取 string 的 Type
Console.WriteLine($"类型名: {stringType.Name}");    // String
Console.WriteLine($"全名: {stringType.FullName}");  // System.String
Console.WriteLine($"命名空间: {stringType.Namespace}");

// 方式二：GetType() 实例方法（运行时获取）
object obj = "hello";
Type objType = obj.GetType();                      // 获取运行时类型
Console.WriteLine($"运行时类型: {objType.Name}");   // String

// 方式三：Type.GetType() 静态方法（通过字符串名称）
Type? intType = Type.GetType("System.Int32");       // 需要完整名称
Console.WriteLine($"通过名称: {intType?.Name}");    // Int32

// 2. Type 的属性
Type personType = typeof(Person);
Console.WriteLine($"IsClass: {personType.IsClass}");          // 是否为类
Console.WriteLine($"IsValueType: {personType.IsValueType}");  // 是否为值类型
Console.WriteLine($"IsAbstract: {personType.IsAbstract}");    // 是否抽象
Console.WriteLine($"IsPublic: {personType.IsPublic}");        // 是否公开
Console.WriteLine($"IsGenericType: {personType.IsGenericType}"); // 是否泛型
Console.WriteLine($"BaseType: {personType.BaseType?.Name}");  // 基类

// 3. 获取类型成员
// GetProperties：获取属性
// GetMethods：获取方法
// GetFields：获取字段
// GetConstructors：获取构造函数
// GetEvents：获取事件
// GetInterfaces：获取实现的接口
\`\`\`

### 二、获取属性和方法 ⭐⭐⭐

\`\`\`csharp
// 定义示例类型
class Person
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    private int _age;

    public int GetAge() => _age;
    public void SetAge(int age) => _age = age;
    private void SecretMethod() => Console.WriteLine("私有方法");
}

// 1. GetProperties：获取属性
Type personType = typeof(Person);
PropertyInfo[] props = personType.GetProperties();  // 获取所有公开属性
Console.WriteLine("属性:");
foreach (PropertyInfo prop in props)
{
    Console.WriteLine($"  {prop.PropertyType.Name} {prop.Name} (可读:{prop.CanRead}, 可写:{prop.CanWrite})");
}

// 获取特定属性
PropertyInfo? nameProp = personType.GetProperty("Name");
if (nameProp != null)
{
    Console.WriteLine($"Name 属性类型: {nameProp.PropertyType.Name}");
}

// 2. GetMethods：获取方法
MethodInfo[] methods = personType.GetMethods(
    BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly);
// DeclaredOnly：只获取在此类型中声明的方法（不含继承的）
Console.WriteLine("\\n方法:");
foreach (MethodInfo method in methods)
{
    Console.WriteLine($"  {method.ReturnType.Name} {method.Name}()");
}

// 3. 获取私有成员（使用 BindingFlags）
MethodInfo[] allMethods = personType.GetMethods(
    BindingFlags.Public | BindingFlags.NonPublic |  // 公开+私有
    BindingFlags.Instance | BindingFlags.Static);
Console.WriteLine($"\\n所有方法 (含私有): {allMethods.Length} 个");

// 4. GetFields：获取字段
FieldInfo[] fields = personType.GetFields(
    BindingFlags.NonPublic | BindingFlags.Instance);
Console.WriteLine("\\n私有字段:");
foreach (FieldInfo field in fields)
{
    Console.WriteLine($"  {field.FieldType.Name} {field.Name}");
}
\`\`\`

### 三、动态创建对象和调用方法 ⭐⭐⭐

\`\`\`csharp
// 1. Activator.CreateInstance：动态创建对象
Type personType = typeof(Person);

// 创建实例（调用无参构造函数）
object? personObj = Activator.CreateInstance(personType);
Console.WriteLine($"创建实例: {personObj?.GetType().Name}");

// 2. 设置属性值
PropertyInfo? nameProp = personType.GetProperty("Name");
nameProp?.SetValue(personObj, "张三");             // 设置属性值
Console.WriteLine($"Name: {nameProp?.GetValue(personObj)}");  // 获取属性值

// 3. 调用方法
MethodInfo? setAgeMethod = personType.GetMethod("SetAge");
setAgeMethod?.Invoke(personObj, new object[] { 30 });  // 调用 SetAge(30)

MethodInfo? getAgeMethod = personType.GetMethod("GetAge");
int age = (int)getAgeMethod?.Invoke(personObj, null)!;  // 调用 GetAge()
Console.WriteLine($"Age: {age}");

// 4. 调用私有方法（反射可以绕过访问限制）
MethodInfo? secretMethod = personType.GetMethod(
    "SecretMethod",
    BindingFlags.NonPublic | BindingFlags.Instance);
secretMethod?.Invoke(personObj, null);             // 输出: 私有方法
// 注意：调用私有方法是不推荐的做法，仅用于特殊场景

// 5. 带参数的构造函数
// 假设有 public Person(string name, int age)
// ConstructorInfo? ctor = personType.GetConstructor(new[] { typeof(string), typeof(int) });
// object? person = ctor?.Invoke(new object[] { "李四", 25 });
\`\`\`

### 四、程序集加载 ⭐⭐

\`\`\`csharp
// 1. 获取当前程序集
var currentAssembly = System.Reflection.Assembly.GetExecutingAssembly();
Console.WriteLine($"当前程序集: {currentAssembly.GetName().Name}");

// 2. 获取程序集中的类型
Type[] types = currentAssembly.GetTypes();
Console.WriteLine($"当前程序集中的类型: {types.Length} 个");
foreach (Type t in types.Take(5))
{
    Console.WriteLine($"  {t.FullName}");
}

// 3. 从程序集获取特定类型
Type? personType = currentAssembly.GetType("Person");  // 需要完整命名空间路径
Console.WriteLine($"找到类型: {personType?.Name}");

// 4. 加载外部程序集
// Assembly externalAssembly = Assembly.LoadFrom("/path/to/MyLib.dll");
// Type[] externalTypes = externalAssembly.GetTypes();

// 5. 获取入口程序集
var entryAssembly = System.Reflection.Assembly.GetEntryAssembly();
Console.WriteLine($"入口程序集: {entryAssembly?.GetName().Name}");

// 6. 获取所有已加载的程序集（包括依赖）
var loadedAssemblies = AppDomain.CurrentDomain.GetAssemblies();
Console.WriteLine($"已加载程序集: {loadedAssemblies.Length} 个");
\`\`\`

### 五、反射的性能与注意事项 ⭐⭐

\`\`\`csharp
// 1. 反射的性能开销
// 反射比直接调用慢 10-100 倍，原因：
// - 需要查找元数据
// - 方法调用需要装箱拆箱
// - 安全检查

// 2. 性能对比
var sw = System.Diagnostics.Stopwatch.StartNew();

// 直接调用（快）
for (int i = 0; i < 100000; i++)
{
    var p = new Person();
    p.SetAge(i);
}
sw.Stop();
Console.WriteLine($"直接调用: {sw.ElapsedMilliseconds}ms");

// 反射调用（慢）
var personType = typeof(Person);
var method = personType.GetMethod("SetAge")!;
sw.Restart();
for (int i = 0; i < 100000; i++)
{
    var obj = Activator.CreateInstance(personType);
    method.Invoke(obj, new object[] { i });
}
sw.Stop();
Console.WriteLine($"反射调用: {sw.ElapsedMilliseconds}ms");

// 3. 优化方案
// a) 缓存 Type 和 MethodInfo（避免重复查找）
// b) 使用委托缓存（Delegate.CreateDelegate）
// c) 使用表达式树（Expression Tree）编译为委托
// d) 使用源生成器（Source Generator）替代运行时反射

// 4. 何时使用反射
// ✅ 适合：框架开发、ORM、序列化、依赖注入容器
// ❌ 不适合：性能敏感的代码、业务逻辑
Console.WriteLine("反射适合框架层，不适合性能敏感的业务代码");
\`\`\`

### 六、关键总结

| 方法/类 | 用途 |
| --- | --- |
| \`typeof(T)\` | 获取编译时已知类型的 Type |
| \`obj.GetType()\` | 获取运行时类型的 Type |
| \`Type.GetType(name)\` | 通过字符串名称获取 Type |
| \`Activator.CreateInstance\` | 动态创建对象 |
| \`GetProperties()\` | 获取属性 |
| \`GetMethods()\` | 获取方法 |
| \`GetFields()\` | 获取字段 |
| \`MethodInfo.Invoke\` | 动态调用方法 |
| \`Assembly.GetTypes()\` | 获取程序集中的所有类型 |

**最佳实践**：
1. 缓存反射结果（Type、MethodInfo 等），避免重复查找
2. 性能敏感场景用委托或表达式树替代反射
3. 能用泛型就不用反射
4. 私有成员访问只在特殊场景使用
5. \`BindingFlags\` 精确控制搜索范围

`,
  },

  // ============================================================
  // 第八十章：特性 (Attribute)
  // ============================================================
  {
    id: 'csharp3-ch81',
    group: '第十五部分 工程化实战',
    icon: '🏷️',
    title: '第八十一章 特性 (Attribute)',
    content: `## 第八十一章　特性 (Attribute)

特性为代码元素（类、方法、属性等）添加元数据。框架大量使用特性进行配置（如 \`[HttpGet]\`、\`[FromBody]\`）。

### 一、使用内置特性 ⭐⭐⭐

\`\`\`csharp
// .NET 提供了大量内置特性

// 1. [Obsolete]：标记已过时
class LegacyApi
{
    [Obsolete("请使用 NewMethod() 替代")]          // 编译时警告
    public void OldMethod()
    {
        Console.WriteLine("旧方法（不推荐使用）");
    }

    [Obsolete("此方法已废弃", error: true)]         // 编译时错误
    public void DeprecatedMethod()
    {
        Console.WriteLine("已废弃方法");
    }

    public void NewMethod()
    {
        Console.WriteLine("新方法（推荐使用）");
    }
}

// 2. [CallerMemberName] / [CallerFilePath] / [CallerLineNumber]
// 自动获取调用者信息（编译时填充）
class Logger
{
    // 调用者信息特性会自动填充参数值
    public static void Log(
        string message,
        [System.Runtime.CompilerServices.CallerMemberName] string memberName = "",  // 调用方法名
        [System.Runtime.CompilerServices.CallerFilePath] string filePath = "",      // 源文件路径
        [System.Runtime.CompilerServices.CallerLineNumber] int lineNumber = 0)      // 行号
    {
        Console.WriteLine($"[{Path.GetFileName(filePath)}:{lineNumber}] {memberName}: {message}");
    }
}

class MyService
{
    public void DoWork()
    {
        Logger.Log("开始工作");                    // 自动填充调用者信息
        // 输出: [Program.cs:42] DoWork: 开始工作
    }
}

new MyService().DoWork();

// 3. [Conditional]：条件编译
#define DEBUG  // 或通过项目配置定义

class DebugHelper
{
    [System.Diagnostics.Conditional("DEBUG")]       // 只在 DEBUG 模式下编译
    public static void DebugLog(string message)
    {
        Console.WriteLine($"[DEBUG] {message}");
    }
}

DebugHelper.DebugLog("调试信息");                  // Release 模式下不编译此调用

// 4. 其他常用特性
// [Serializable] - 标记可序列化
// [Flags] - 枚举可作为位标志
// [DebuggerDisplay] - 自定义调试器显示
// [EditorBrowsable] - 控制 IntelliSense 可见性
// [MethodImpl(MethodImplOptions.AggressiveInlining)] - 建议内联
\`\`\`

### 二、自定义特性 ⭐⭐⭐

\`\`\`csharp
// 1. 定义自定义特性
// 特性类必须以 Attribute 结尾
[AttributeUsage(
    AttributeTargets.Class |                       // 可用于类
    AttributeTargets.Method |                      // 和方法
    AttributeTargets.Property,                     // 和属性
    AllowMultiple = true,                          // 允许多次应用
    Inherited = true)]                             // 允许子类继承
public class AuthorAttribute : Attribute            // 继承 Attribute
{
    public string Name { get; }                     // 作者名
    public string Email { get; set; } = "";         // 邮箱（可选）
    public string Version { get; set; } = "1.0";    // 版本（可选）

    // 构造函数参数是必填的
    public AuthorAttribute(string name)
    {
        Name = name;
    }
}

// 2. 使用自定义特性
[Author("张三", Email = "zhangsan@example.com", Version = "2.0")]
[Author("李四")]                                    // 允许多次应用
public class MyService
{
    [Author("王五")]
    public void ProcessData()
    {
        Console.WriteLine("处理数据...");
    }
}

// 3. 定义更多自定义特性
[AttributeUsage(AttributeTargets.Method)]
public class LogExecutionAttribute : Attribute
{
    public bool IncludeArguments { get; set; } = false;
    public LogLevel Level { get; set; } = LogLevel.Info;
}

public enum LogLevel { Debug, Info, Warning, Error }
\`\`\`

### 三、读取特性（反射） ⭐⭐⭐

\`\`\`csharp
// 通过反射读取特性

// 1. 读取类上的特性
Type serviceType = typeof(MyService);

// 获取特定特性
AuthorAttribute? author = serviceType.GetCustomAttribute<AuthorAttribute>();
if (author != null)
{
    Console.WriteLine($"作者: {author.Name}");
    Console.WriteLine($"邮箱: {author.Email}");
    Console.WriteLine($"版本: {author.Version}");
}

// 获取所有 AuthorAttribute（AllowMultiple = true）
var allAuthors = serviceType.GetCustomAttributes<AuthorAttribute>();
Console.WriteLine($"作者数量: {allAuthors.Count()}");
foreach (var a in allAuthors)
{
    Console.WriteLine($"  - {a.Name} ({a.Email})");
}

// 2. 读取方法上的特性
MethodInfo? method = serviceType.GetMethod("ProcessData");
if (method != null)
{
    var methodAuthor = method.GetCustomAttribute<AuthorAttribute>();
    if (methodAuthor != null)
    {
        Console.WriteLine($"方法作者: {methodAuthor.Name}");
    }
}

// 3. 检查特性是否存在
bool hasAuthor = serviceType.IsDefined(typeof(AuthorAttribute), inherit: true);
Console.WriteLine($"有 Author 特性? {hasAuthor}");

// 4. 读取所有特性
object[] allAttributes = serviceType.GetCustomAttributes(inherit: true);
Console.WriteLine($"类型上的特性: {allAttributes.Length} 个");
foreach (var attr in allAttributes)
{
    Console.WriteLine($"  {attr.GetType().Name}");
}
\`\`\`

### 四、特性实战：验证框架 ⭐⭐

\`\`\`csharp
// 构建一个简单的验证框架

// 1. 定义验证特性
[AttributeUsage(AttributeTargets.Property)]
abstract class ValidationAttribute : Attribute
{
    public abstract string? Validate(object? value, string propertyName);
}

[AttributeUsage(AttributeTargets.Property)]
class RequiredAttribute : ValidationAttribute
{
    public override string? Validate(object? value, string propertyName)
    {
        if (value == null || (value is string s && string.IsNullOrWhiteSpace(s)))
        {
            return $"{propertyName} 是必填项";
        }
        return null;
    }
}

[AttributeUsage(AttributeTargets.Property)]
class RangeAttribute : ValidationAttribute
{
    public int Min { get; set; }
    public int Max { get; set; }

    public override string? Validate(object? value, string propertyName)
    {
        if (value is int intVal)
        {
            if (intVal < Min || intVal > Max)
            {
                return $"{propertyName} 必须在 {Min} 到 {Max} 之间";
            }
        }
        return null;
    }
}

// 2. 使用验证特性
class User
{
    [Required]
    public string Name { get; set; } = "";

    [Range(Min = 1, Max = 120)]
    public int Age { get; set; }
}

// 3. 验证器
class Validator
{
    public static List<string> Validate(object obj)
    {
        var errors = new List<string>();
        var type = obj.GetType();

        foreach (var prop in type.GetProperties())
        {
            foreach (var attr in prop.GetCustomAttributes<ValidationAttribute>())
            {
                var value = prop.GetValue(obj);
                string? error = attr.Validate(value, prop.Name);
                if (error != null)
                {
                    errors.Add(error);
                }
            }
        }
        return errors;
    }
}

// 4. 测试验证
var user = new User { Name = "", Age = 150 };
var errors = Validator.Validate(user);
Console.WriteLine("验证结果:");
foreach (var error in errors)
{
    Console.WriteLine($"  ❌ {error}");
}
// 输出:
//   ❌ Name 是必填项
//   ❌ Age 必须在 1 到 120 之间
\`\`\`

### 五、关键总结

| 特性 | 用途 |
| --- | --- |
| \`[Obsolete]\` | 标记过时 API |
| \`[CallerMemberName]\` | 获取调用方法名 |
| \`[CallerFilePath]\` | 获取源文件路径 |
| \`[CallerLineNumber]\` | 获取调用行号 |
| \`[Conditional]\` | 条件编译 |
| \`[AttributeUsage]\` | 控制特性的使用范围 |
| 自定义特性 | 添加自定义元数据 |
| \`GetCustomAttribute\<T\>()\` | 读取特性 |

**最佳实践**：
1. 特性类以 \`Attribute\` 结尾
2. 使用 \`[AttributeUsage]\` 限制适用范围
3. 必填参数放在构造函数中
4. 可选参数使用属性
5. 通过反射读取特性（缓存结果）
6. 特性用于声明式编程，不适合复杂逻辑

`,
  },

  // ============================================================
  // 第八十二章：模式匹配
  // ============================================================
  {
    id: 'csharp3-ch82',
    group: '第十五部分 工程化实战',
    icon: '🎯',
    title: '第八十二章 模式匹配',
    content: `## 第八十二章　模式匹配

C# 7+ 的模式匹配大幅增强了类型检查和条件分支的能力。C# 12 进一步扩展了模式匹配的语法。

### 一、类型模式与常量模式 ⭐⭐⭐

\`\`\`csharp
// 模式匹配让条件判断更简洁、更安全

// 1. 类型模式（Type Pattern）
// 检查对象是否为特定类型，并安全转换
object[] items = { 42, "hello", 3.14, true, null };

foreach (object item in items)
{
    // 类型模式：is 运算符 + 变量声明
    if (item is int number)                         // 检查是否为 int，并赋值给 number
    {
        Console.WriteLine($"整数: {number * 2}");   // 直接使用 number
    }
    else if (item is string text && text.Length > 3) // 类型模式 + 条件
    {
        Console.WriteLine($"长字符串: {text.ToUpper()}");
    }
    else if (item is double d)
    {
        Console.WriteLine($"浮点数: {d}");
    }
    else if (item is null)                          // 常量模式匹配 null
    {
        Console.WriteLine("null 值");
    }
    else
    {
        Console.WriteLine($"其他类型: {item.GetType().Name}");
    }
}

// 2. 常量模式（Constant Pattern）
// 匹配特定常量值
int score = 85;
string grade = score switch                        // switch 表达式
{
    100 => "满分",
    >= 90 => "A",                                  // 关系模式
    >= 80 => "B",
    >= 70 => "C",
    >= 60 => "D",
    _ => "F"                                       // 弃元模式（默认）
};
Console.WriteLine($"分数 {score} 等级: {grade}");

// 3. 否定模式（not）
object? value = null;
if (value is not null)                             // 不是 null
{
    Console.WriteLine("非空值");
}
else
{
    Console.WriteLine("是 null");
}

// 4. 逻辑模式（and / or）
int age = 25;
if (age is >= 18 and <= 60)                       // 逻辑与
{
    Console.WriteLine("成年人");
}

char ch = 'A';
if (ch is 'A' or 'B' or 'C')                      // 逻辑或
{
    Console.WriteLine("字母 A、B 或 C");
}
\`\`\`

### 二、属性模式与位置模式 ⭐⭐⭐

\`\`\`csharp
// 1. 属性模式（Property Pattern）
// 匹配对象的属性值

record Person(string Name, int Age, string? City = null);

Person person = new("张三", 30, "北京");

// 属性模式匹配
string description = person switch
{
    { Age: <= 12 } => "儿童",                     // 属性 Age <= 12
    { Age: <= 18 } => "青少年",                   // 属性 Age <= 18
    { City: "北京" or "上海" } => "一线城市居民",  // 属性 City 匹配多个值
    { Name: var name, Age: > 60 } => $"长者: {name}", // 提取属性值
    _ => "其他"
};
Console.WriteLine($"{person.Name}: {description}");

// 嵌套属性模式
record Address(string Street, string City);
record Employee(string Name, Address Address);

var emp = new Employee("李四", new Address("长安街", "北京"));

string location = emp switch
{
    { Address: { City: "北京" } } => "北京办公室",  // 嵌套匹配
    { Address: { City: "上海" } } => "上海办公室",
    _ => "其他地点"
};
Console.WriteLine($"{emp.Name}: {location}");

// 2. 位置模式（Positional Pattern）
// 用于解构元组或 record
var point = (X: 10, Y: 20);
string quadrant = point switch
{
    ( > 0, > 0) => "第一象限",                    // 位置模式匹配元组
    ( < 0, > 0) => "第二象限",
    ( < 0, < 0) => "第三象限",
    ( > 0, < 0) => "第四象限",
    (0, 0) => "原点",
    _ => "坐标轴上"
};
Console.WriteLine($"({point.X}, {point.Y}): {quadrant}");

// 3. 位置模式匹配 record
Person p = new("王五", 25);
string result = p switch
{
    ("王五", _) => "找到王五",                     // 位置模式：Name 匹配
    (_, >= 60) => "长者",
    (var name, var age) => $"{name}, {age}岁"      // 提取所有字段
};
Console.WriteLine(result);
\`\`\`

### 三、列表模式 ⭐⭐⭐

\`\`\`csharp
// 列表模式（List Pattern）是 C# 11 引入的
// 用于匹配数组、列表等集合的结构

// 1. 基本列表模式
int[] numbers = { 1, 2, 3 };

string desc = numbers switch
{
    [] => "空数组",                                // 匹配空数组
    [1, 2, 3] => "恰好是 [1, 2, 3]",               // 匹配确切元素
    [1, ..] => "以 1 开头",                        // 切片模式：匹配开头
    [.., 3] => "以 3 结尾",                        // 切片模式：匹配结尾
    [1, .., 3] => "以 1 开头，3 结尾",             // 切片模式：匹配两端
    [_, _, _] => "恰好 3 个元素",                  // 任意 3 个元素
    _ => "其他"
};
Console.WriteLine($"[1,2,3]: {desc}");

// 2. 切片模式详细
int[] arr = { 1, 2, 3, 4, 5 };

string pattern = arr switch
{
    [1, .. var middle, 5] => $"中间部分: [{string.Join(", ", middle)}]",
    [..] => "普通数组"
};
Console.WriteLine(pattern);  // 中间部分: [2, 3, 4]

// 3. 列表模式实战：解析简单命令
string[] ParseCommand(string input)
{
    return input.Split(' ', StringSplitOptions.RemoveEmptyEntries);
}

string ExecuteCommand(string[] args)
{
    return args switch
    {
        ["help"] => "显示帮助信息",
        ["help", var cmd] => $"显示 {cmd} 命令的帮助",
        ["list", ..] => "列出所有项目",
        ["add", var name, var age] => $"添加用户: {name}, 年龄: {age}",
        ["delete", var id] => $"删除用户: {id}",
        [] => "请输入命令",
        _ => $"未知命令: {string.Join(" ", args)}"
    };
}

Console.WriteLine(ExecuteCommand(ParseCommand("help")));        // 显示帮助信息
Console.WriteLine(ExecuteCommand(ParseCommand("add alice 30"))); // 添加用户: alice, 年龄: 30
Console.WriteLine(ExecuteCommand(ParseCommand("delete 100")));   // 删除用户: 100
\`\`\`

### 四、switch 表达式进阶 ⭐⭐⭐

\`\`\`csharp
// switch 表达式是 switch 语句的简洁替代

// 1. 基本 switch 表达式
int dayOfWeek = 3;
string dayName = dayOfWeek switch
{
    1 => "星期一",
    2 => "星期二",
    3 => "星期三",
    4 => "星期四",
    5 => "星期五",
    6 => "星期六",
    7 => "星期日",
    _ => "无效日期"
};
Console.WriteLine($"星期 {dayOfWeek}: {dayName}");

// 2. switch 表达式 + 属性模式
object shape = new Circle(5);

double area = shape switch
{
    Circle { Radius: var r } => Math.PI * r * r,  // 属性模式 + 变量提取
    Rectangle { Width: var w, Height: var h } => w * h,
    Triangle { Base: var b, Height: var h } => b * h / 2,
    null => 0,
    _ => throw new ArgumentException("未知形状")
};
Console.WriteLine($"面积: {area:F2}");

// 3. switch 表达式 + 元组模式
string Compare(int a, int b) => (a, b) switch
{
    ( > 0, > 0) => "两个都大于 0",
    ( < 0, < 0) => "两个都小于 0",
    (0, 0) => "两个都是 0",
    (var x, var y) when x > y => $"{x} > {y}",
    (var x, var y) when x < y => $"{x} < {y}",
    _ => "相等"
};
Console.WriteLine(Compare(5, 3));  // 5 > 3

// 4. 守卫子句（when）
int temperature = 35;
string weather = temperature switch
{
    < 0 => "严寒",
    <= 10 => "寒冷",
    <= 25 => "舒适",
    <= 35 => "温暖",
    > 35 when temperature < 40 => "炎热",         // 守卫子句
    _ => "酷热"
};
Console.WriteLine($"{temperature}°C: {weather}");

record Circle(double Radius);
record Rectangle(double Width, double Height);
record Triangle(double Base, double Height);
\`\`\`

### 五、关键总结

| 模式 | 语法 | 用途 |
| --- | --- | --- |
| 类型模式 | \`x is int n\` | 类型检查 + 转换 |
| 常量模式 | \`x is 42\` / \`x is null\` | 匹配常量 |
| 属性模式 | \`{ Age: > 18 }\` | 匹配对象属性 |
| 位置模式 | \`("张三", 30)\` | 匹配元组/record |
| 关系模式 | \`> 10\`, \`<= 100\` | 数值比较 |
| 逻辑模式 | \`and\`, \`or\`, \`not\` | 逻辑组合 |
| 列表模式 | \`[1, .., 9]\` | 匹配集合结构 |
| 弃元模式 | \`_\` | 匹配任意值 |
| 守卫子句 | \`when condition\` | 附加条件 |

**最佳实践**：
1. switch 表达式优先于 switch 语句（更简洁）
2. 属性模式替代多层 if-else
3. 列表模式用于命令解析、集合验证
4. 守卫子句处理复杂条件
5. 模式匹配让代码更声明式、更易读

`,
  },

  // ============================================================
  // 第八十三章：综合项目：命令行工具
  // ============================================================
  {
    id: 'csharp3-ch83',
    group: '第十五部分 工程化实战',
    icon: '🛠️',
    title: '第八十三章 综合项目：命令行工具',
    content: `## 第八十三章　综合项目：命令行工具

本章构建一个完整的命令行文件处理工具，综合运用文件 I/O、JSON、命令行参数解析、异步编程等知识。

### 一、项目概述与架构

\`\`\`csharp
// 项目名称: FileTool
// 功能: 文件批量处理工具
// 命令:
//   filetool list <path> [--filter pattern]     // 列出文件
//   filetool search <path> <keyword>            // 搜索文件内容
//   filetool rename <path> <old> <new>          // 批量重命名
//   filetool stats <path>                       // 文件统计
//   filetool config --set <key> <value>         // 配置管理

// 架构:
// Program.cs (入口) → CommandDispatcher (命令分发) → Commands (各命令)
//                                                 → Config (配置管理)
//                                                 → Utils (工具类)

// ===== 完整代码 =====

// ---------- Config.cs ----------
// 配置管理类
public class AppConfig
{
    private static readonly string ConfigPath =
        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".filetool.json");

    public Dictionary<string, string> Settings { get; set; } = new();

    // 加载配置
    public static AppConfig Load()
    {
        if (File.Exists(ConfigPath))
        {
            string json = File.ReadAllText(ConfigPath);
            return JsonSerializer.Deserialize<AppConfig>(json) ?? new AppConfig();
        }
        return new AppConfig();
    }

    // 保存配置
    public void Save()
    {
        var options = new JsonSerializerOptions { WriteIndented = true };
        string json = JsonSerializer.Serialize(this, options);
        File.WriteAllText(ConfigPath, json);
    }

    // 获取设置
    public string Get(string key, string defaultValue = "")
    {
        return Settings.TryGetValue(key, out var value) ? value : defaultValue;
    }

    // 设置配置
    public void Set(string key, string value)
    {
        Settings[key] = value;
        Save();
    }
}

// ---------- FileUtils.cs ----------
// 文件操作工具类
public static class FileUtils
{
    // 获取文件大小的人类可读格式
    public static string FormatSize(long bytes)
    {
        string[] units = { "B", "KB", "MB", "GB", "TB" };
        int unitIndex = 0;
        double size = bytes;
        while (size >= 1024 && unitIndex < units.Length - 1)
        {
            size /= 1024;
            unitIndex++;
        }
        return $"{size:F1} {units[unitIndex]}";
    }

    // 安全枚举文件（处理权限错误）
    public static IEnumerable<string> EnumerateFilesSafe(
        string path, string pattern = "*", bool recursive = false)
    {
        try
        {
            var option = recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly;
            return Directory.EnumerateFiles(path, pattern, option);
        }
        catch (UnauthorizedAccessException)
        {
            Console.WriteLine($"警告: 无法访问 {path}");
            return Enumerable.Empty<string>();
        }
        catch (DirectoryNotFoundException)
        {
            Console.WriteLine($"错误: 目录不存在 {path}");
            return Enumerable.Empty<string>();
        }
    }

    // 搜索文件内容
    public static async Task<List<(string File, int Line, string Content)>> SearchContentAsync(
        string path, string keyword, string pattern = "*")
    {
        var results = new List<(string, int, string)>();
        var files = EnumerateFilesSafe(path, pattern);

        foreach (var file in files)
        {
            try
            {
                string[] lines = await File.ReadAllLinesAsync(file);
                for (int i = 0; i < lines.Length; i++)
                {
                    if (lines[i].Contains(keyword, StringComparison.OrdinalIgnoreCase))
                    {
                        results.Add((file, i + 1, lines[i]));
                    }
                }
            }
            catch (IOException) { /* 跳过无法读取的文件 */ }
        }
        return results;
    }
}

// ---------- Commands.cs ----------
// 命令处理类
public static class Commands
{
    // list 命令：列出文件
    public static void ListFiles(string path, string? filter = null)
    {
        string pattern = filter ?? "*";
        var files = FileUtils.EnumerateFilesSafe(path, pattern).ToList();

        if (files.Count == 0)
        {
            Console.WriteLine($"在 {path} 中没有找到匹配 '{pattern}' 的文件");
            return;
        }

        Console.WriteLine($"\\n目录: {path}");
        Console.WriteLine($"模式: {pattern}");
        Console.WriteLine($"找到 {files.Count} 个文件\\n");
        Console.WriteLine($"{"大小",-10} {"修改时间",-20} 文件名");
        Console.WriteLine(new string('-', 70));

        long totalSize = 0;
        foreach (var file in files.OrderBy(f => f))
        {
            var info = new FileInfo(file);
            totalSize += info.Length;
            Console.WriteLine($"{FileUtils.FormatSize(info.Length),-10} " +
                $"{info.LastWriteTime:yyyy-MM-dd HH:mm}   {info.Name}");
        }
        Console.WriteLine(new string('-', 70));
        Console.WriteLine($"总计: {files.Count} 个文件, {FileUtils.FormatSize(totalSize)}");
    }

    // search 命令：搜索文件内容
    public static async Task SearchFilesAsync(string path, string keyword)
    {
        Console.WriteLine($"搜索 '{keyword}' 在 {path}...\\n");
        var results = await FileUtils.SearchContentAsync(path, keyword);

        if (results.Count == 0)
        {
            Console.WriteLine("未找到匹配内容");
            return;
        }

        Console.WriteLine($"找到 {results.Count} 处匹配:\\n");
        foreach (var (file, line, content) in results)
        {
            // 高亮关键字
            string highlighted = content.Replace(keyword,
                $"\\u001b[33m{keyword}\\u001b[0m",  // ANSI 黄色
                StringComparison.OrdinalIgnoreCase);
            Console.WriteLine($"  {Path.GetFileName(file)}:{line}: {highlighted.Trim()}");
        }
    }

    // rename 命令：批量重命名
    public static void RenameFiles(string path, string oldPattern, string newPattern)
    {
        var files = FileUtils.EnumerateFilesSafe(path, $"*{oldPattern}*").ToList();

        if (files.Count == 0)
        {
            Console.WriteLine($"没有找到包含 '{oldPattern}' 的文件");
            return;
        }

        Console.WriteLine($"将重命名 {files.Count} 个文件:");
        Console.WriteLine($"  模式: *{oldPattern}* → *{newPattern}*\\n");

        foreach (var file in files)
        {
            string dir = Path.GetDirectoryName(file)!;
            string name = Path.GetFileNameWithoutExtension(file);
            string ext = Path.GetExtension(file);
            string newName = name.Replace(oldPattern, newPattern);
            string newPath = Path.Combine(dir, newName + ext);

            Console.WriteLine($"  {Path.GetFileName(file)} → {Path.GetFileName(newPath)}");
            File.Move(file, newPath);
        }
        Console.WriteLine($"\\n重命名完成!");
    }

    // stats 命令：文件统计
    public static void FileStats(string path)
    {
        var files = FileUtils.EnumerateFilesSafe(path, "*", recursive: true).ToList();

        if (files.Count == 0)
        {
            Console.WriteLine($"目录 {path} 中没有文件");
            return;
        }

        long totalSize = 0;
        var extCounts = new Dictionary<string, (int Count, long Size)>();

        foreach (var file in files)
        {
            var info = new FileInfo(file);
            totalSize += info.Length;
            string ext = info.Extension.ToLower();
            if (string.IsNullOrEmpty(ext)) ext = "(无扩展名)";

            if (!extCounts.ContainsKey(ext))
                extCounts[ext] = (0, 0);
            extCounts[ext] = (extCounts[ext].Count + 1, extCounts[ext].Size + info.Length);
        }

        Console.WriteLine($"\\n=== 文件统计: {path} ===\\n");
        Console.WriteLine($"总文件数: {files.Count}");
        Console.WriteLine($"总大小: {FileUtils.FormatSize(totalSize)}");
        Console.WriteLine($"平均大小: {FileUtils.FormatSize(files.Count > 0 ? totalSize / files.Count : 0)}");
        Console.WriteLine($"\\n按扩展名统计:\\n");
        Console.WriteLine($"{"扩展名",-15} {"数量",-8} {"大小",-12} {"占比"}");
        Console.WriteLine(new string('-', 50));

        foreach (var (ext, (count, size)) in extCounts.OrderByDescending(x => x.Value.Size))
        {
            double percent = (double)size / totalSize * 100;
            Console.WriteLine($"{ext,-15} {count,-8} {FileUtils.FormatSize(size),-12} {percent:F1}%");
        }
    }
}

// ---------- CommandDispatcher.cs ----------
// 命令分发器
public static class CommandDispatcher
{
    public static async Task DispatchAsync(string[] args)
    {
        if (args.Length == 0)
        {
            ShowHelp();
            return;
        }

        string command = args[0].ToLower();

        switch (command)
        {
            case "list":
                if (args.Length < 2) { Console.WriteLine("用法: filetool list <path> [--filter pattern]"); return; }
                string filter = args.Length > 3 && args[2] == "--filter" ? args[3] : null;
                Commands.ListFiles(args[1], filter);
                break;

            case "search":
                if (args.Length < 3) { Console.WriteLine("用法: filetool search <path> <keyword>"); return; }
                await Commands.SearchFilesAsync(args[1], args[2]);
                break;

            case "rename":
                if (args.Length < 4) { Console.WriteLine("用法: filetool rename <path> <old> <new>"); return; }
                Commands.RenameFiles(args[1], args[2], args[3]);
                break;

            case "stats":
                if (args.Length < 2) { Console.WriteLine("用法: filetool stats <path>"); return; }
                Commands.FileStats(args[1]);
                break;

            case "config":
                if (args.Length >= 4 && args[1] == "--set")
                {
                    var config = AppConfig.Load();
                    config.Set(args[2], args[3]);
                    Console.WriteLine($"配置已保存: {args[2]} = {args[3]}");
                }
                else if (args.Length >= 3 && args[1] == "--get")
                {
                    var config = AppConfig.Load();
                    Console.WriteLine($"{args[2]} = {config.Get(args[2])}");
                }
                else
                {
                    Console.WriteLine("用法: filetool config --set <key> <value>");
                    Console.WriteLine("      filetool config --get <key>");
                }
                break;

            default:
                Console.WriteLine($"未知命令: {command}");
                ShowHelp();
                break;
        }
    }

    static void ShowHelp()
    {
        Console.WriteLine(@"
=== FileTool - 文件批量处理工具 ===

用法:
  filetool list <path> [--filter pattern]   列出文件
  filetool search <path> <keyword>          搜索文件内容
  filetool rename <path> <old> <new>        批量重命名
  filetool stats <path>                     文件统计
  filetool config --set <key> <value>       设置配置
  filetool config --get <key>               获取配置

示例:
  filetool list /tmp --filter *.txt
  filetool search /tmp error
  filetool rename /tmp old new
  filetool stats /tmp
");
    }
}

// ---------- Program.cs (入口) ----------
// 顶级语句入口
// 实际使用时取消注释：
// if (args.Length == 0)
// {
//     args = new[] { "stats", "/tmp" };  // 默认演示
// }
// Console.WriteLine("=== FileTool v1.0 ===\\n");
// await CommandDispatcher.DispatchAsync(args);

Console.WriteLine("FileTool 命令行工具已就绪");
Console.WriteLine("命令: list, search, rename, stats, config");
\`\`\`

### 二、关键架构设计

| 组件 | 职责 |
| --- | --- |
| \`Program.cs\` | 入口，命令行参数解析 |
| \`CommandDispatcher\` | 命令分发，路由 |
| \`Commands\` | 各命令的实现 |
| \`AppConfig\` | 配置管理（JSON 文件） |
| \`FileUtils\` | 文件操作工具类 |

### 三、关键总结

- 综合运用了文件 I/O、JSON、异步编程、命令行解析
- 模块化设计：每个命令独立实现
- 错误处理：权限错误、文件不存在等
- 进度显示：搜索结果高亮、统计格式化
- 配置管理：持久化到 JSON 文件

`,
  },

  // ============================================================
  // 第八十四章：综合项目：数据处理引擎
  // ============================================================
  {
    id: 'csharp3-ch84',
    group: '第十五部分 工程化实战',
    icon: '⚙️',
    title: '第八十四章 综合项目：数据处理引擎',
    content: `## 第八十四章　综合项目：数据处理引擎

本章构建一个通用的数据处理引擎：读取 CSV / JSON-Lines / 文本，按规则转换后输出为另一种格式。综合运用文件 I/O、序列化、集合、Linq 管道、反射插件等知识。

### 一、项目概述

\`\`\`csharp
// 项目名称: DataEngine
// 功能: 通用数据处理引擎
// 输入: CSV / JSON-Lines / 文本文件
// 输出: CSV / JSON / 控制台
// 特性:
//   - 插件式转换器（反射加载）
//   - 管道式处理（多步转换）
//   - 错误隔离（单行失败不影响整体）
//   - 进度报告与统计
\`\`\`

### 二、核心类型定义

\`\`\`csharp
// ---------- DataRecord.cs ----------
// 一行数据：键值对字典，按列名访问
public sealed class DataRecord
{
    public Dictionary<string, string> Fields { get; }
    public int LineNumber { get; }

    public DataRecord(int lineNumber)
    {
        Fields = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        LineNumber = lineNumber;
    }

    public string? Get(string column) => Fields.TryGetValue(column, out var v) ? v : null;

    // 强类型取值（int/long/double/DateTime 等）
    public T? Get<T>(string column) where T : struct
    {
        var raw = Get(column);
        if (string.IsNullOrWhiteSpace(raw)) return null;
        try { return (T)Convert.ChangeType(raw, typeof(T)); }
        catch { return null; }
    }

    public override string ToString() =>
        string.Join(", ", Fields.Select(kv => $"{kv.Key}={kv.Value}"));
}

// ---------- 接口 ----------
public interface IDataReader
{
    string Name { get; }
    IReadOnlyList<string> Columns { get; }
    IEnumerable<DataRecord> Read();
}

public interface IDataTransformer
{
    string Name { get; }
    DataRecord Transform(DataRecord input);
}

public interface IDataWriter
{
    void Write(IEnumerable<DataRecord> records, IReadOnlyList<string> columns);
}
\`\`\`

### 三、内置 Reader

\`\`\`csharp
// ---------- CsvReader.cs ----------
// 支持双引号转义、内嵌逗号
public sealed class CsvReader : IDataReader
{
    public string Name => "CSV";
    public IReadOnlyList<string> Columns { get; private set; } = Array.Empty<string>();
    private readonly string _path;
    public CsvReader(string path) { _path = path; }

    public IEnumerable<DataRecord> Read()
    {
        var lines = File.ReadAllLines(_path);
        if (lines.Length == 0) yield break;

        // 第一行作为列名
        Columns = ParseLine(lines[0]).ToArray();
        for (int i = 1; i < lines.Length; i++)
        {
            var raw = lines[i];
            if (string.IsNullOrWhiteSpace(raw)) continue;
            var rec = new DataRecord(i + 1);
            var cells = ParseLine(raw);
            for (int c = 0; c < Columns.Count; c++)
                rec.Fields[Columns[c]] = c < cells.Count ? cells[c] : "";
            yield return rec;
        }
    }

    private static List<string> ParseLine(string line)
    {
        var result = new List<string>();
        var cur = new System.Text.StringBuilder();
        bool inQuote = false;
        for (int i = 0; i < line.Length; i++)
        {
            char ch = line[i];
            if (inQuote)
            {
                if (ch == '"')
                {
                    if (i + 1 < line.Length && line[i + 1] == '"') { cur.Append('"'); i++; }
                    else inQuote = false;
                }
                else cur.Append(ch);
            }
            else
            {
                if (ch == ',') { result.Add(cur.ToString()); cur.Clear(); }
                else if (ch == '"') inQuote = true;
                else cur.Append(ch);
            }
        }
        result.Add(cur.ToString());
        return result;
    }
}

// ---------- JsonLinesReader.cs ----------
public sealed class JsonLinesReader : IDataReader
{
    public string Name => "JSON-Lines";
    public IReadOnlyList<string> Columns { get; private set; } = Array.Empty<string>();
    private readonly string _path;
    public JsonLinesReader(string path) { _path = path; }

    public IEnumerable<DataRecord> Read()
    {
        var seen = new List<string>();
        int line = 0;
        foreach (var raw in File.ReadAllLines(_path))
        {
            line++;
            if (string.IsNullOrWhiteSpace(raw)) continue;
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(raw);
                var rec = new DataRecord(line);
                foreach (var prop in doc.RootElement.EnumerateObject())
                {
                    if (!seen.Contains(prop.Name)) seen.Add(prop.Name);
                    rec.Fields[prop.Name] = prop.Value.ValueKind switch
                    {
                        System.Text.Json.JsonValueKind.String => prop.Value.GetString() ?? "",
                        System.Text.Json.JsonValueKind.Number => prop.Value.GetRawText(),
                        System.Text.Json.JsonValueKind.True => "true",
                        System.Text.Json.JsonValueKind.False => "false",
                        System.Text.Json.JsonValueKind.Null => "",
                        _ => prop.Value.GetRawText()
                    };
                }
                yield return rec;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"[JsonLinesReader] 第{line}行解析失败: {ex.Message}");
            }
        }
        Columns = seen;
    }
}
\`\`\`

### 四、内置 Writer

\`\`\`csharp
// ---------- CsvWriter.cs ----------
public sealed class CsvWriter : IDataWriter
{
    private readonly TextWriter _tw;
    public CsvWriter(TextWriter tw) { _tw = tw; }
    public void Write(IEnumerable<DataRecord> records, IReadOnlyList<string> columns)
    {
        _tw.WriteLine(string.Join(",", columns.Select(Escape)));
        foreach (var r in records)
            _tw.WriteLine(string.Join(",", columns.Select(c => Escape(r.Get(c) ?? ""))));
    }
    private static string Escape(string s)
    {
        if (s.Contains(',') || s.Contains('"') || s.Contains('\\n'))
            return "\"" + s.Replace("\"", "\"\"") + "\"";
        return s;
    }
}

// ---------- JsonArrayWriter.cs ----------
public sealed class JsonArrayWriter : IDataWriter
{
    private readonly TextWriter _tw;
    public JsonArrayWriter(TextWriter tw) { _tw = tw; }
    public void Write(IEnumerable<DataRecord> records, IReadOnlyList<string> columns)
    {
        _tw.Write('[');
        bool first = true;
        foreach (var r in records)
        {
            if (!first) _tw.Write(',');
            first = false;
            _tw.Write('{');
            bool firstField = true;
            foreach (var c in columns)
            {
                if (!firstField) _tw.Write(',');
                firstField = false;
                _tw.Write(System.Text.Json.JsonSerializer.Serialize(c));
                _tw.Write(':');
                _tw.Write(System.Text.Json.JsonSerializer.Serialize(r.Get(c) ?? ""));
            }
            _tw.Write('}');
        }
        _tw.Write(']');
    }
}
\`\`\`

### 五、内置转换器

\`\`\`csharp
// ---------- Transformers/UpperCaseTransformer.cs ----------
public sealed class UpperCaseTransformer : IDataTransformer
{
    private readonly string _column;
    public UpperCaseTransformer(string column) { _column = column; }
    public string Name => $"Upper({_column})";
    public DataRecord Transform(DataRecord input)
    {
        var v = input.Get(_column);
        if (v != null) input.Fields[_column] = v.ToUpperInvariant();
        return input;
    }
}

// ---------- Transformers/RenameTransformer.cs ----------
public sealed class RenameTransformer : IDataTransformer
{
    private readonly string _from, _to;
    public RenameTransformer(string from, string to) { _from = from; _to = to; }
    public string Name => $"Rename({_from}->{_to})";
    public DataRecord Transform(DataRecord input)
    {
        if (input.Fields.Remove(_from, out var v)) input.Fields[_to] = v;
        return input;
    }
}

// ---------- Transformers/FilterTransformer.cs ----------
public sealed class FilterTransformer : IDataTransformer
{
    private readonly Func<DataRecord, bool> _pred;
    private readonly string _name;
    public FilterTransformer(string name, Func<DataRecord, bool> pred) { _name = name; _pred = pred; }
    public string Name => $"Filter({_name})";
    public DataRecord Transform(DataRecord input) => _pred(input) ? input : null!;
}

// ---------- Transformers/ComputeTransformer.cs ----------
public sealed class ComputeTransformer : IDataTransformer
{
    private readonly string _newColumn;
    private readonly Func<DataRecord, string> _fn;
    public ComputeTransformer(string newColumn, Func<DataRecord, string> fn) { _newColumn = newColumn; _fn = fn; }
    public string Name => $"Compute({_newColumn})";
    public DataRecord Transform(DataRecord input)
    {
        input.Fields[_newColumn] = _fn(input);
        return input;
    }
}
\`\`\`

### 六、流水线引擎

\`\`\`csharp
// ---------- Pipeline.cs ----------
public sealed class Pipeline
{
    private readonly List<IDataTransformer> _steps = new();
    public IReadOnlyList<IDataTransformer> Steps => _steps;
    public Pipeline Add(IDataTransformer step) { _steps.Add(step); return this; }

    public IEnumerable<DataRecord> Run(IEnumerable<DataRecord> input)
    {
        var current = input;
        foreach (var step in _steps)
        {
            current = current.Select(r =>
            {
                try { return step.Transform(r); }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"[Pipeline] 第{r.LineNumber}行 在 {step.Name} 失败: {ex.Message}");
                    return null!;
                }
            }).Where(r => r != null);
        }
        return current;
    }
}

// ---------- DataEngine.cs ----------
public sealed class DataEngine
{
    public int TotalRead { get; private set; }
    public int TotalWritten { get; private set; }
    public int TotalErrors { get; private set; }

    public void Run(IDataReader reader, Pipeline pipeline, IDataWriter writer, IReadOnlyList<string>? outputColumns = null)
    {
        Console.WriteLine($"[Engine] 读取源: {reader.Name}");

        // 物化两遍：第一遍拿行数，第二遍真正处理
        var materialized = reader.Read().ToList();
        TotalRead = materialized.Count;
        Console.WriteLine($"[Engine] 读取完成: {TotalRead} 行");

        var processed = pipeline.Run(materialized).ToList();
        TotalWritten = processed.Count;
        TotalErrors = TotalRead - TotalWritten;
        Console.WriteLine($"[Engine] 处理完成: 输出 {TotalWritten} 行（{TotalErrors} 行被过滤或失败）");

        var cols = outputColumns ?? reader.Columns;
        writer.Write(processed, cols);
        Console.WriteLine("[Engine] 写出完成");
    }
}
\`\`\`

### 七、反射插件加载（可选）

\`\`\`csharp
// ---------- PluginLoader.cs ----------
public static class PluginLoader
{
    public static IEnumerable<IDataTransformer> LoadFrom(string dir)
    {
        if (!Directory.Exists(dir)) yield break;
        foreach (var dll in Directory.GetFiles(dir, "*.dll"))
        {
            if (dll.Contains("DataEngine")) continue;
            System.Reflection.Assembly? asm = null;
            try { asm = System.Reflection.Assembly.LoadFrom(dll); }
            catch { continue; }
            foreach (var t in asm.GetTypes())
            {
                if (typeof(IDataTransformer).IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract)
                {
                    if (Activator.CreateInstance(t) is IDataTransformer trans)
                        yield return trans;
                }
            }
        }
    }
}
\`\`\`

### 八、调用示例

\`\`\`csharp
// ---------- Program.cs ----------
// 演示：读取用户 CSV，筛选活跃用户，把用户名转大写，再加一列 "等级"
// 输出为 JSON 数组

// 准备测试数据
var src = Path.Combine(Path.GetTempPath(), "users.csv");
File.WriteAllText(src, "id,name,age,active\\n1,Alice,30,true\\n2,bob,25,false\\n3,Carol,28,true\\n");

var reader = new CsvReader(src);
var pipeline = new Pipeline()
    .Add(new FilterTransformer("active=true",
        r => string.Equals(r.Get("active"), "true", StringComparison.OrdinalIgnoreCase)))
    .Add(new UpperCaseTransformer("name"))
    .Add(new ComputeTransformer("level", r => int.Parse(r.Get("age")!) >= 30 ? "VIP" : "普通"));

var outPath = Path.Combine(Path.GetTempPath(), "users.json");
using var tw = new StreamWriter(outPath);
var writer = new JsonArrayWriter(tw);

new DataEngine().Run(reader, pipeline, writer, new[] { "id", "name", "age", "level" });

Console.WriteLine();
Console.WriteLine("=== 输出文件内容 ===");
Console.WriteLine(File.ReadAllText(outPath));

File.Delete(src);
File.Delete(outPath);
\`\`\`

### 九、关键总结

- **接口分层**：Reader / Transformer / Writer 三个接口让流水线易于扩展
- **错误隔离**：用 try-catch + null 标记，让单行失败不影响整体
- **可组合性**：每个 Transformer 只关心单行转换，组合后能力倍增
- **反射插件**：让用户在不改源码的情况下扩展处理能力
- **实用价值**：CSV / JSON / 日志清洗 / API 数据预处理都能复用这套引擎
`,
  },

  // ============================================================
  // 第八十五章：综合项目：Web API 客户端
  // ============================================================
  {
    id: 'csharp3-ch85',
    group: '第十五部分 工程化实战',
    icon: '🌐',
    title: '第八十五章 综合项目：Web API 客户端',
    content: `## 第八十五章　综合项目：Web API 客户端

本章构建一个完整的 Web API 客户端，综合运用 HttpClient、JSON、异步编程、重试、缓存、限流等知识。

### 一、项目概述

\`\`\`csharp
// 项目名称: ApiClient
// 功能: 通用的 REST API 客户端
// 特性:
//   - 重试机制（指数退避）
//   - 限流保护
//   - 响应缓存
//   - 异步操作
//   - 完整的错误处理

// ===== 完整代码 =====

// ---------- 模型定义 ----------
public record User(int Id, string Name, string Email, string? Phone = null);
public record Post(int Id, int UserId, string Title, string Body);
public record Comment(int Id, int PostId, string Name, string Email, string Body);

// 通用 API 响应
public record ApiResponse<T>(bool Success, T? Data, string? ErrorMessage, int StatusCode);

// ---------- RetryPolicy.cs ----------
// 重试策略
public class RetryPolicy
{
    public int MaxRetries { get; init; } = 3;       // 最大重试次数
    public TimeSpan InitialDelay { get; init; } = TimeSpan.FromSeconds(1); // 初始延迟
    public double BackoffMultiplier { get; init; } = 2.0; // 退避倍数
    public TimeSpan MaxDelay { get; init; } = TimeSpan.FromSeconds(30); // 最大延迟

    // 计算第 n 次重试的延迟时间
    public TimeSpan GetDelay(int retryCount)
    {
        // 指数退避: delay = min(initialDelay * multiplier^retryCount, maxDelay)
        double delayMs = InitialDelay.TotalMilliseconds * Math.Pow(BackoffMultiplier, retryCount);
        return TimeSpan.FromMilliseconds(Math.Min(delayMs, MaxDelay.TotalMilliseconds));
    }

    // 判断是否应该重试
    public bool ShouldRetry(int retryCount, HttpStatusCode? statusCode, Exception? exception)
    {
        // 超过最大重试次数
        if (retryCount >= MaxRetries) return false;

        // 这些状态码通常不应该重试
        if (statusCode.HasValue)
        {
            return statusCode.Value switch
            {
                HttpStatusCode.BadRequest => false,  // 400：请求错误
                HttpStatusCode.Unauthorized => false, // 401：未授权
                HttpStatusCode.Forbidden => false,   // 403：禁止
                HttpStatusCode.NotFound => false,    // 404：不存在
                HttpStatusCode.Conflict => false,    // 409：冲突
                _ => true                            // 其他可重试
            };
        }

        // 网络异常通常可重试
        return exception is HttpRequestException or TaskCanceledException or IOException;
    }
}

// ---------- RateLimiter.cs ----------
// 限流器（令牌桶算法）
public class RateLimiter
{
    private readonly int _maxRequests;              // 最大请求数
    private readonly TimeSpan _window;              // 时间窗口
    private readonly Queue<DateTime> _requestTimes = new(); // 请求时间队列
    private readonly object _lock = new();

    public RateLimiter(int maxRequests, TimeSpan window)
    {
        _maxRequests = maxRequests;
        _window = window;
    }

    // 等待直到可以发送请求
    public async Task WaitForSlotAsync(CancellationToken cancellationToken = default)
    {
        while (true)
        {
            cancellationToken.ThrowIfCancellationRequested();

            DateTime now = DateTime.UtcNow;
            TimeSpan? waitTime = null;

            lock (_lock)
            {
                // 清理过期的请求记录
                while (_requestTimes.Count > 0 && now - _requestTimes.Peek() > _window)
                {
                    _requestTimes.Dequeue();
                }

                // 如果还有可用槽位
                if (_requestTimes.Count < _maxRequests)
                {
                    _requestTimes.Enqueue(now);
                    return;                          // 可以发送请求
                }

                // 计算需要等待的时间
                DateTime oldest = _requestTimes.Peek();
                waitTime = _window - (now - oldest);
            }

            if (waitTime.HasValue && waitTime.Value > TimeSpan.Zero)
            {
                await Task.Delay(waitTime.Value, cancellationToken);
            }
        }
    }
}

// ---------- ResponseCache.cs ----------
// 简单的内存缓存
public class ResponseCache
{
    private readonly ConcurrentDictionary<string, CacheEntry> _cache = new();
    private readonly TimeSpan _defaultTtl;

    public ResponseCache(TimeSpan? defaultTtl = null)
    {
        _defaultTtl = defaultTtl ?? TimeSpan.FromMinutes(5);
    }

    // 获取缓存
    public bool TryGet<T>(string key, out T? value)
    {
        if (_cache.TryGetValue(key, out var entry))
        {
            if (DateTime.UtcNow < entry.ExpiresAt)
            {
                value = (T)entry.Value;
                return true;
            }
            // 缓存过期，移除
            _cache.TryRemove(key, out _);
        }
        value = default;
        return false;
    }

    // 设置缓存
    public void Set<T>(string key, T value, TimeSpan? ttl = null)
    {
        var entry = new CacheEntry(value!, DateTime.UtcNow.Add(ttl ?? _defaultTtl));
        _cache[key] = entry;
    }

    // 清除缓存
    public void Clear() => _cache.Clear();

    private record CacheEntry(object Value, DateTime ExpiresAt);
}

// ---------- ApiClient.cs ----------
// 核心 API 客户端
public class ApiClient : IDisposable
{
    private readonly HttpClient _httpClient;
    private readonly RetryPolicy _retryPolicy;
    private readonly RateLimiter? _rateLimiter;
    private readonly ResponseCache? _cache;
    private readonly JsonSerializerOptions _jsonOptions;

    public ApiClient(ApiClientOptions options)
    {
        _httpClient = new HttpClient(new SocketsHttpHandler
        {
            PooledConnectionLifetime = TimeSpan.FromMinutes(5),
            MaxConnectionsPerServer = options.MaxConnectionsPerServer
        })
        {
            BaseAddress = options.BaseAddress,
            Timeout = options.Timeout,
            DefaultRequestHeaders =
            {
                { "User-Agent", options.UserAgent },
                { "Accept", "application/json" }
            }
        };

        // 添加认证头
        if (!string.IsNullOrEmpty(options.ApiKey))
        {
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {options.ApiKey}");
        }

        _retryPolicy = options.RetryPolicy ?? new RetryPolicy();
        _rateLimiter = options.RateLimiter;
        _cache = options.EnableCache ? new ResponseCache(options.CacheTtl) : null;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    // GET 请求（带重试、限流、缓存）
    public async Task<ApiResponse<T>> GetAsync<T>(
        string path,
        bool useCache = true,
        CancellationToken cancellationToken = default)
    {
        // 检查缓存
        if (useCache && _cache != null && _cache.TryGet<T>(path, out var cached))
        {
            return new ApiResponse<T>(true, cached, null, 200);
        }

        return await ExecuteWithRetryAsync<T>(
            () => SendRequestAsync<T>(HttpMethod.Get, path, null, cancellationToken),
            path, useCache, cancellationToken);
    }

    // POST 请求
    public async Task<ApiResponse<T>> PostAsync<T>(
        string path, object body, CancellationToken cancellationToken = default)
    {
        return await ExecuteWithRetryAsync<T>(
            () => SendRequestAsync<T>(HttpMethod.Post, path, body, cancellationToken),
            null, false, cancellationToken);
    }

    // PUT 请求
    public async Task<ApiResponse<T>> PutAsync<T>(
        string path, object body, CancellationToken cancellationToken = default)
    {
        return await ExecuteWithRetryAsync<T>(
            () => SendRequestAsync<T>(HttpMethod.Put, path, body, cancellationToken),
            null, false, cancellationToken);
    }

    // DELETE 请求
    public async Task<ApiResponse<bool>> DeleteAsync(
        string path, CancellationToken cancellationToken = default)
    {
        return await ExecuteWithRetryAsync<bool>(
            () => SendRequestAsync<bool>(HttpMethod.Delete, path, null, cancellationToken),
            null, false, cancellationToken);
    }

    // 发送请求
    private async Task<ApiResponse<T>> SendRequestAsync<T>(
        HttpMethod method, string path, object? body, CancellationToken ct)
    {
        // 限流等待
        if (_rateLimiter != null)
        {
            await _rateLimiter.WaitForSlotAsync(ct);
        }

        using var request = new HttpRequestMessage(method, path);

        // 序列化请求体
        if (body != null)
        {
            string json = JsonSerializer.Serialize(body, _jsonOptions);
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");
        }

        using var response = await _httpClient.SendAsync(request, ct);
        string responseBody = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            return new ApiResponse<T>(false, default, responseBody, (int)response.StatusCode);
        }

        if (typeof(T) == typeof(bool))
        {
            return new ApiResponse<T>(true, (T)(object)true, null, (int)response.StatusCode);
        }

        T? data = JsonSerializer.Deserialize<T>(responseBody, _jsonOptions);
        return new ApiResponse<T>(true, data, null, (int)response.StatusCode);
    }

    // 重试执行
    private async Task<ApiResponse<T>> ExecuteWithRetryAsync<T>(
        Func<Task<ApiResponse<T>>> action, string? cacheKey, bool useCache, CancellationToken ct)
    {
        int retryCount = 0;
        while (true)
        {
            try
            {
                var result = await action();

                // 成功响应，缓存结果
                if (result.Success && useCache && _cache != null && cacheKey != null)
                {
                    _cache.Set(cacheKey, result.Data);
                }

                // 如果不需要重试，直接返回
                if (result.Success || !_retryPolicy.ShouldRetry(retryCount, (HttpStatusCode)result.StatusCode, null))
                {
                    return result;
                }
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                if (!_retryPolicy.ShouldRetry(retryCount, null, ex))
                {
                    return new ApiResponse<T>(false, default, ex.Message, 0);
                }
            }

            // 指数退避等待
            retryCount++;
            TimeSpan delay = _retryPolicy.GetDelay(retryCount);
            Console.WriteLine($"重试 {retryCount}/{_retryPolicy.MaxRetries}，等待 {delay.TotalSeconds:F1}s...");
            await Task.Delay(delay, ct);
        }
    }

    public void Dispose()
    {
        _httpClient.Dispose();
    }
}

// ---------- ApiClientOptions.cs ----------
public class ApiClientOptions
{
    public required Uri BaseAddress { get; init; }   // 基础地址
    public string UserAgent { get; init; } = "ApiClient/1.0"; // User-Agent
    public string? ApiKey { get; init; }             // API 密钥
    public TimeSpan Timeout { get; init; } = TimeSpan.FromSeconds(30); // 超时
    public int MaxConnectionsPerServer { get; init; } = 10; // 最大连接数
    public RetryPolicy? RetryPolicy { get; init; }   // 重试策略
    public RateLimiter? RateLimiter { get; init; }    // 限流器
    public bool EnableCache { get; init; } = true;   // 启用缓存
    public TimeSpan? CacheTtl { get; init; }          // 缓存过期时间
}

// ---------- 使用示例 ----------
async Task DemoUsageAsync()
{
    // 创建客户端
    var options = new ApiClientOptions
    {
        BaseAddress = new Uri("https://jsonplaceholder.typicode.com/"),
        UserAgent = "MyApp/1.0",
        Timeout = TimeSpan.FromSeconds(10),
        RetryPolicy = new RetryPolicy
        {
            MaxRetries = 3,
            InitialDelay = TimeSpan.FromSeconds(1),
            BackoffMultiplier = 2.0
        },
        RateLimiter = new RateLimiter(10, TimeSpan.FromSeconds(1)), // 每秒 10 次
        EnableCache = true,
        CacheTtl = TimeSpan.FromMinutes(5)
    };

    using var client = new ApiClient(options);

    // GET 请求
    var userResponse = await client.GetAsync<User>("/users/1");
    if (userResponse.Success)
    {
        Console.WriteLine($"用户: {userResponse.Data?.Name} ({userResponse.Data?.Email})");
    }
    else
    {
        Console.WriteLine($"错误: {userResponse.ErrorMessage}");
    }

    // POST 请求
    var newPost = new { title = "新文章", body = "文章内容", userId = 1 };
    var postResponse = await client.PostAsync<Post>("/posts", newPost);
    if (postResponse.Success)
    {
        Console.WriteLine($"创建文章: ID={postResponse.Data?.Id}, Title={postResponse.Data?.Title}");
    }

    Console.WriteLine("ApiClient 演示完成");
}

// await DemoUsageAsync();
Console.WriteLine("ApiClient 已就绪，功能: GET/POST/PUT/DELETE + 重试 + 限流 + 缓存");
\`\`\`

### 二、架构设计

| 组件 | 职责 |
| --- | --- |
| \`ApiClient\` | 核心 HTTP 客户端 |
| \`RetryPolicy\` | 指数退避重试 |
| \`RateLimiter\` | 令牌桶限流 |
| \`ResponseCache\` | 内存缓存 |
| \`ApiClientOptions\` | 配置选项 |
| \`ApiResponse\<T\>\` | 统一响应模型 |

### 三、关键总结

- 综合运用 HttpClient、JSON、异步编程
- 指数退避重试策略（避免服务端雪崩）
- 令牌桶限流（保护 API 配额）
- 内存缓存减少重复请求
- 模块化设计，易于扩展
- 统一错误处理和响应模型

`,
  },

  // ============================================================
  // 第八十六章：结语与进阶方向
  // ============================================================
  {
    id: 'csharp3-ch86',
    group: '结尾',
    icon: '🏁',
    title: '第八十六章 结语与进阶方向',
    content: `## 第八十六章　结语与进阶方向

恭喜你完成了 C# 从入门到精通的学习之旅！本章回顾所学内容，并指明进阶方向。

### 一、你已经掌握的内容

回顾 85 章的学习，你已经掌握了：

| 部分 | 内容 |
| --- | --- |
| 第一部分 | 基础语法：变量、类型、运算符、控制流 |
| 第二部分 | 面向对象：类、继承、接口、多态 |
| 第三部分 | 高级类型：泛型、委托、事件、Lambda |
| 第四部分 | LINQ：查询语法、方法语法、聚合操作 |
| 第五部分 | 集合与数据结构：List、Dictionary、HashSet |
| 第六部分 | 异常处理与调试：try-catch、日志、调试技巧 |
| 第七部分 | 字符串与正则：StringBuilder、编码、Regex |
| 第八部分 | 日期时间：DateTime、TimeSpan、时区 |
| 第九部分 | 网络编程：HttpClient、Uri、Socket |
| 第十部分 | 文件 I/O：File、Stream、序列化 |
| 第十一部分 | 多线程与异步：Task、async/await、Parallel |
| 第十二部分 | 高级特性：反射、特性、模式匹配 |
| 第十三部分 | 异步编程：async/await、Task、并发集合、CancellationToken |
| 第十四部分 | 文件 IO 与序列化：File、Stream、JSON、正则 |
| 第十五部分 | 工程化实战：命名空间、反射、特性、模式匹配、综合项目 |

### 二、C# 生态系统

\`\`\`csharp
// C# 是 .NET 生态的核心语言，周边生态非常丰富

// 1. Web 开发
// - ASP.NET Core：高性能 Web 框架
// - ASP.NET Core Minimal API：轻量级 API
// - Blazor：用 C# 写前端（WebAssembly/Server）
// - SignalR：实时通信

// 2. 数据访问
// - Entity Framework Core：ORM 框架
// - Dapper：轻量级 ORM
// - ADO.NET：底层数据库访问

// 3. 桌面/移动
// - MAUI：跨平台桌面+移动（Windows/macOS/iOS/Android）
// - WPF：Windows 桌面应用
// - WinForms：经典 Windows 桌面应用
// - Avalonia：跨平台桌面 UI

// 4. 游戏开发
// - Unity：游戏引擎，C# 是主要脚本语言
// - Godot：开源游戏引擎，也支持 C#
// - MonoGame：跨平台游戏框架

// 5. 云计算与微服务
// - .NET Aspire：云原生开发框架
// - Azure Functions：无服务器计算
// - Orleans：分布式 Actor 模型
// - gRPC：高性能 RPC 框架

// 6. 人工智能/机器学习
// - ML.NET：.NET 原生机器学习框架
// - Semantic Kernel：AI 编排框架
// - OpenAI C# SDK
// - TorchSharp：PyTorch 的 .NET 绑定
\`\`\`

### 三、进阶学习路线

#### 1. ASP.NET Core 深入

\`\`\`csharp
// ASP.NET Core 是 .NET 生态中最重要的工作负载
// 推荐学习路径：

// 入门：
// - Minimal API 构建 RESTful 服务
// - 依赖注入 (DI) 容器
// - 中间件管道
// - 配置管理 (appsettings.json)

// 进阶：
// - MVC 模式与控制器
// - 模型绑定与验证
// - 认证与授权 (JWT, OAuth2)
// - Entity Framework Core 集成
// - 日志与监控 (Serilog, OpenTelemetry)

// 高级：
// - 微服务架构
// - gRPC 服务
// - 消息队列 (RabbitMQ, Kafka)
// - 分布式缓存 (Redis)
// - 容器化部署 (Docker, Kubernetes)
\`\`\`

#### 2. Entity Framework Core

\`\`\`csharp
// EF Core 是 .NET 的 ORM 框架
// 推荐学习内容：

// - Code First 迁移
// - LINQ 查询（已掌握）
// - 关系映射（一对多、多对多）
// - 性能优化（N+1 问题、Include、AsNoTracking）
// - 原始 SQL 查询
// - 并发控制（乐观锁）
// - 数据库提供器（SQL Server、PostgreSQL、SQLite）
\`\`\`

#### 3. Blazor 前端开发

\`\`\`csharp
// Blazor 让你用 C# 写前端，无需 JavaScript

// Blazor Server：
// - 实时 SignalR 连接
// - 适合内网应用
// - 组件化开发

// Blazor WebAssembly：
// - 在浏览器中运行 .NET
// - 适合 PWA 和离线应用
// - 需要下载 .NET 运行时

// Blazor Hybrid (MAUI)：
// - 嵌入原生应用
// - 共享 UI 组件
\`\`\`

### 四、学习资源推荐

\`\`\`csharp
// 官方资源
// - Microsoft Learn (learn.microsoft.com)：官方教程
// - .NET 文档 (docs.microsoft.com/dotnet)：API 参考
// - .NET Blog (devblogs.microsoft.com/dotnet)：最新动态
// - .NET YouTube (youtube.com/dotnet)：官方视频

// 社区资源
// - Stack Overflow：问答社区
// - GitHub：开源项目
// - Reddit r/csharp 和 r/dotnet
// - .NET Conf：年度开发者大会

// 书籍推荐
// - 《C# in Depth》 by Jon Skeet
// - 《CLR via C#》 by Jeffrey Richter
// - 《Pro ASP.NET Core》系列
// - 《Concurrency in C# Cookbook》

// 实践建议
// 1. 每天写代码，保持手感
// 2. 参与开源项目，阅读优质代码
// 3. 写博客/笔记，教是最好的学
// 4. 关注 .NET 新版本特性
// 5. 构建真实的项目，而非玩具项目
\`\`\`

### 五、.NET 的未来

\`\`\`csharp
// .NET 的发展方向
// 1. .NET 9, 10, ...：每年 11 月发布新版本
// 2. Native AOT：更小的体积，更快的启动
// 3. .NET Aspire：云原生开发新时代
// 4. AI 集成：Semantic Kernel、ML.NET 持续进化
// 5. 跨平台持续增强：MAUI、Blazor
// 6. 性能持续优化：JIT、GC、PGO 改进

// C# 语言演进
// - C# 12：主构造函数、集合表达式、ref readonly
// - C# 13（预览）：params 增强、扩展类型
// - 未来： discriminated unions、类型类等

// 保持学习
// 技术行业变化很快，但基础原理是通用的
// 你已掌握的 C# 基础将成为你学习任何新技术的坚实基石
\`\`\`

### 六、最后的鼓励

作为本教程的作者，我想对你说：

1. **学无止境**：85 章只是开始，真正的精通来自实践
2. **动手实践**：将学到的知识应用到真实项目中
3. **阅读源码**：阅读优秀开源项目的代码是提升最快的方式
4. **分享知识**：写博客、做分享，别人会帮你发现盲点
5. **保持好奇**：技术不断演进，保持学习的心态

C# 是一门优雅而强大的语言，.NET 是一个充满活力的生态系统。你已经打下了坚实的基础，接下来就是不断实践、不断探索。

祝你在 C# 和 .NET 的道路上越走越远，编写出优雅、高效、可靠的代码！

**感谢你的学习，我们江湖再见！**

`,
  },
];

export { chapters };