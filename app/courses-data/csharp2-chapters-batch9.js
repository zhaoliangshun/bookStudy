// =============================================================
// C# 从入门到精通大全 - 第九批章节（第九部分 IO 与序列化，共 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   csharp2-ch43 : 第四十三章 文件与目录操作
//   csharp2-ch44 : 第四十四章 Stream 流读写
//   csharp2-ch45 : 第四十五章 JSON 序列化
//   csharp2-ch46 : 第四十六章 正则表达式
//
// 风格：demo 驱动，每章直接上手写代码，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，示例用顶级语句。
// ⭐ 标记为日常开发高频知识点；JSON 序列化是日常开发核心，重点讲解。
// 文件 IO 示例统一用 Path.GetTempPath() 写临时文件，避免沙箱权限问题。
// =============================================================

const chapters = [
  // ============================================================
  // 第四十三章：文件与目录操作
  // ============================================================
  {
    id: 'csharp2-ch43',
    group: '第九部分 IO 与序列化',
    icon: '📁',
    title: '第四十三章 文件与目录操作',
    content: `## 第四十三章　文件与目录操作

文件 IO 是程序与磁盘打交道的入口：读写配置、记录日志、批量处理。C# 在 \`System.IO\` 命名空间下提供了一整套静态类与实例类，让你不必关心底层 syscall，专注业务。

### 一、System.IO 全家福

\`\`\`csharp
using System.IO;

// 静态工具类（用得最多）
//   File        —— 文件读写/复制/删除/移动
//   Directory   —— 目录创建/删除/遍历
//   Path        —— 路径字符串拼接（不碰磁盘）

// 实例类（精细控制、多次复用）
//   FileInfo    —— 单文件的元数据 + 操作
//   DirectoryInfo—— 单目录的元数据 + 操作
\`\`\`

> ⭐ 静态类 (\`File\`/\`Directory\`/\`Path\`) 是 90% 场景的首选；只有需要对同一文件做多次操作时才用 \`FileInfo\`，省去反复校验开销。

### 二、Path 类：路径字符串处理

\`Path\` 不碰磁盘，只做字符串运算——这是它最妙的地方：跨平台、不报错。

\`\`\`csharp
using System.IO;

// 拼接路径：自动处理分隔符（Windows \\\\、Linux/OSX /）
string full = Path.Combine("/tmp", "logs", "app.log");
Console.WriteLine(full);                       // /tmp/logs/app.log

// 取文件名 / 扩展名 / 不带扩展名的文件名
Console.WriteLine(Path.GetFileName(full));        // app.log
Console.WriteLine(Path.GetExtension(full));       // .log
Console.WriteLine(Path.GetFileNameWithoutExtension(full)); // app

// 改扩展名（返回新字符串，不修改原文件）
string txt = Path.ChangeExtension(full, ".txt");
Console.WriteLine(txt);                        // /tmp/logs/app.txt

// 临时目录 / 临时文件（⭐ 演示用，避免权限问题）
string tempDir = Path.GetTempPath();           // 系统临时目录
string tempFile = Path.GetTempFileName();      // 创建一个 0 字节临时文件
Console.WriteLine($"临时目录: {tempDir}");
Console.WriteLine($"临时文件: {tempFile}");
\`\`\`

> ⭐ \`Path.Combine\` 是拼接路径的**唯一正确姿势**——别用 \`+ "/" +\`，跨平台会出 bug。

### 三、File 类：常用静态方法

\`\`\`csharp
using System.IO;

string dir = Path.GetTempPath();
string file = Path.Combine(dir, "demo.txt");

// 1. 判断文件是否存在
if (!File.Exists(file))
{
    // 2. 一次性写入全部文本（覆盖）
    File.WriteAllText(file, "第一行\\n");
}

// 3. 追加文本
File.AppendAllText(file, "第二行\\n");
File.AppendAllText(file, "第三行\\n");

// 4. 一次性读取全部文本
string content = File.ReadAllText(file);
Console.WriteLine(content);

// 5. 按行读取成数组
string[] lines = File.ReadAllLines(file);
foreach (var line in lines) Console.WriteLine($"[行] {line}");

// 6. 写入字节数组
byte[] data = System.Text.Encoding.UTF8.GetBytes("hello bytes");
string bin = Path.Combine(dir, "demo.bin");
File.WriteAllBytes(bin, data);

// 7. 复制 / 移动 / 删除
string copy = Path.Combine(dir, "demo_copy.txt");
File.Copy(file, copy, overwrite: true);        // ⭐ overwrite 必须显式传

string moved = Path.Combine(dir, "demo_moved.txt");
File.Move(copy, moved);

File.Delete(moved);
Console.WriteLine("文件操作完成");
\`\`\`

要点：
- \`WriteAllText\` / \`AppendAllText\` / \`ReadAllText\` 适合**小文件**——一次性加载到内存。
- 大文件请走下一章的 Stream，分块读写。
- \`File.Copy\` 第二参数 \`overwrite\` 默认 \`false\`，目标存在会抛异常。

### 四、FileInfo 类：实例化操作

\`\`\`csharp
using System.IO;

string file = Path.Combine(Path.GetTempPath(), "info_demo.txt");
File.WriteAllText(file, "hello");

// FileInfo 缓存元数据，多次操作同一文件时省去重复 stat
FileInfo fi = new(file);
Console.WriteLine($"大小: {fi.Length} 字节");
Console.WriteLine($"创建时间: {fi.CreationTime}");
Console.WriteLine($"最后修改: {fi.LastWriteTime}");
Console.WriteLine($"只读? {fi.IsReadOnly}");
Console.WriteLine($"扩展名: {fi.Extension}");

// 实例方法：和 File 类似，但只校验一次
fi.CopyTo(file + ".bak", overwrite: true);
fi.Delete();

// ⭐ FileInfo 懒刷新：缓存可能过期，调用 Refresh() 重新获取
fi.Refresh();
\`\`\`

> 一般规则：**单次操作用 \`File\`，多次操作同一文件用 \`FileInfo\`**。

### 五、Directory 类：目录操作

\`\`\`csharp
using System.IO;

string root = Path.Combine(Path.GetTempPath(), "demo_dir");
// 1. 创建目录（递归创建，已存在不报错）
Directory.CreateDirectory(root);
Directory.CreateDirectory(Path.Combine(root, "sub1"));
Directory.CreateDirectory(Path.Combine(root, "sub2"));

// 2. 写点文件做演示
File.WriteAllText(Path.Combine(root, "a.txt"), "A");
File.WriteAllText(Path.Combine(root, "b.log"), "B");
File.WriteAllText(Path.Combine(root, "sub1", "c.txt"), "C");

// 3. 列出当前目录所有文件
string[] files = Directory.GetFiles(root);
Console.WriteLine("根目录文件:");
foreach (var f in files) Console.WriteLine("  " + Path.GetFileName(f));

// 4. 按通配符过滤
string[] txts = Directory.GetFiles(root, "*.txt");
Console.WriteLine($"txt 文件 {txts.Length} 个");

// 5. 递归搜索所有子目录
string[] allTxt = Directory.GetFiles(root, "*.txt", SearchOption.AllDirectories);
Console.WriteLine($"递归 txt 共 {allTxt.Length} 个");

// 6. 列出子目录
string[] dirs = Directory.GetDirectories(root);
foreach (var d in dirs) Console.WriteLine("目录: " + Path.GetFileName(d));

// 7. 删除目录（递归）
Directory.Delete(root, recursive: true);
\`\`\`

要点：
- \`CreateDirectory\` 是幂等的——已存在直接返回 \`DirectoryInfo\`，不报错。
- \`SearchOption.AllDirectories\` 会抛 \`UnauthorizedAccessException\`（没权限的目录）。生产代码改用 \`EnumerateFiles\`，可逐项 try-catch。

### 六、目录遍历：用 EnumerateFiles 处理大目录

\`\`\`csharp
using System.IO;

string root = Path.Combine(Path.GetTempPath(), "demo_enum");
Directory.CreateDirectory(root);
for (int i = 0; i < 5; i++)
    File.WriteAllText(Path.Combine(root, $"f{i}.txt"), $"内容{i}");

// GetFiles：一次性返回数组，目录大时占内存
// EnumerateFiles：⭐ 惰性枚举，遍历到才读，适合大目录
foreach (var fi in new DirectoryInfo(root).EnumerateFiles("*.txt"))
{
    Console.WriteLine($"{fi.Name}  {fi.Length}B");
}

Directory.Delete(root, recursive: true);
\`\`\`

> \`EnumerateFiles\` 返回 \`IEnumerable<FileInfo>\`，可叠加 LINQ：\`EnumerateFiles().Where(f => f.Length > 100).Select(f => f.Name)\`。

### 七、实战 demo 1：日志文件写入

\`\`\`csharp
using System.IO;

string logDir = Path.Combine(Path.GetTempPath(), "myapp_logs");
Directory.CreateDirectory(logDir);
string logFile = Path.Combine(logDir, $"app_{DateTime.Now:yyyyMMdd}.log");

void Log(string msg)
{
    // 追加一行带时间戳的日志
    string line = $"[{DateTime.Now:HH:mm:ss}] {msg}";
    File.AppendAllText(logFile, line + "\\n");
    Console.WriteLine(line);
}

Log("应用启动");
Log("正在加载配置...");
Log("加载完成");
Log("应用退出");

Console.WriteLine($"日志已写入: {logFile}");
\`\`\`

### 八、实战 demo 2：批量文件重命名

\`\`\`csharp
using System.IO;

string dir = Path.Combine(Path.GetTempPath(), "rename_demo");
Directory.CreateDirectory(dir);
for (int i = 0; i < 3; i++)
    File.WriteAllText(Path.Combine(dir, $"img_{i}.tmp"), "");

// 需求：把所有 .tmp 改成 .bak，并在文件名前加日期
string date = DateTime.Now.ToString("yyyyMMdd");
foreach (var path in Directory.EnumerateFiles(dir, "*.tmp"))
{
    string dirPart = Path.GetDirectoryName(path)!;
    string name = Path.GetFileNameWithoutExtension(path);
    string newPath = Path.Combine(dirPart, $"{date}_{name}.bak");
    File.Move(path, newPath);
    Console.WriteLine($"{Path.GetFileName(path)} -> {Path.GetFileName(newPath)}");
}

Directory.Delete(dir, recursive: true);
\`\`\`

### 九、异常处理与权限

文件 IO 是「外部世界」操作——文件被占用、路径太长、权限不足……都可能抛异常：

\`\`\`csharp
using System.IO;

try
{
    string f = Path.Combine(Path.GetTempPath(), "may_fail.txt");
    File.ReadAllText(f);
}
catch (FileNotFoundException ex) { Console.WriteLine("找不到文件"); }
catch (UnauthorizedAccessException ex) { Console.WriteLine("权限不足"); }
catch (IOException ex) { Console.WriteLine($"IO 错误: {ex.Message}"); }
\`\`\`

> ⭐ 文件被其他进程占用是 Windows 上最常见的坑：写文件时另一个进程也想读，就会抛 \`IOException: 文件正由另一进程使用\`。解决办法：用 \`FileStream\` 显式控制 \`FileShare\`（下一章讲）。

### 小结

- \`Path\` 处理路径字符串，不碰磁盘——跨平台首选。
- \`File\` 静态类适合单次操作；\`FileInfo\` 适合多次操作同一文件。
- \`Directory.CreateDirectory\` 幂等；\`EnumerateFiles\` 比 \`GetFiles\` 节省内存。
- 大目录遍历用 \`Enumerate*\`，可叠加 LINQ，可逐项容错。
- 文件 IO 必做异常处理，外部世界永远不安全。
- 下一章学 Stream，进入分块读写、大文件、异步 IO 的世界。`,
  },

  // ============================================================
  // 第四十四章：Stream 流读写
  // ============================================================
  {
    id: 'csharp2-ch44',
    group: '第九部分 IO 与序列化',
    icon: '🌊',
    title: '第四十四章 Stream 流读写',
    content: `## 第四十四章　Stream 流读写

上一章 \`File.ReadAllText\` 一次性读全文——读 1MB 文件没问题，读 10GB 视频就崩了。本章学「流」（Stream）：**像水管一样，分块读写数据**，不论 1KB 还是 10TB 内存都不会爆。

### 一、Stream 抽象类

\`System.IO.Stream\` 是所有流的抽象基类，定义了流的标准接口：

\`\`\`csharp
public abstract class Stream
{
    public abstract bool CanRead { get; }
    public abstract bool CanWrite { get; }
    public abstract bool CanSeek { get; }       // 能否跳转位置
    public abstract long Length { get; }
    public abstract long Position { get; set; }

    public abstract int Read(byte[] buffer, int offset, int count);
    public abstract void Write(byte[] buffer, int offset, int count);
    public abstract long Seek(long offset, SeekOrigin origin);
    public abstract void Flush();               // 把缓冲区刷到目标
    public abstract void Close();
}
\`\`\`

为什么用流？
- **内存友好**：分块读写，1KB 缓冲区就能处理 TB 级文件。
- **统一抽象**：文件流、内存流、网络流 API 一致，换底层不用改代码。
- **支持管道**：A 流读到 B 流写到 C 流，链式处理（如压缩 + 加密 + 写文件）。

### 二、FileStream：文件流

\`\`\`csharp
using System.IO;

string file = Path.Combine(Path.GetTempPath(), "stream_demo.bin");

// 1. 写入：以字节为单位
using (var fs = new FileStream(file, FileMode.Create, FileAccess.Write))
{
    byte[] data = System.Text.Encoding.UTF8.GetBytes("Hello Stream 你好");
    fs.Write(data, 0, data.Length);
    // using 块结束自动 Dispose，等价于 fs.Close()
}

// 2. 读取：分块读
using (var fs = new FileStream(file, FileMode.Open, FileAccess.Read))
{
    byte[] buf = new byte[1024];
    int n = fs.Read(buf, 0, buf.Length);       // 返回实际读取的字节数
    string text = System.Text.Encoding.UTF8.GetString(buf, 0, n);
    Console.WriteLine($"读到 {n} 字节: {text}");
}

File.Delete(file);
\`\`\`

参数解读：
- \`FileMode\`：\`Create\`（覆盖新建）/ \`Open\`（必须存在）/ \`CreateOrCreate\` / \`Append\`。
- \`FileAccess\`：\`Read\` / \`Write\` / \`ReadWrite\`。
- \`FileShare\`：\`None\`（独占）/ \`Read\`（允许别人读）/ \`ReadWrite\`（允许别人读写）。

> ⭐ \`using\` 块是 Stream 操作的标准姿势——确保异常时也释放文件句柄。不释放会导致 Windows 上文件被锁。

### 三、using 语句与释放资源

\`Stream\` 实现了 \`IDisposable\`，必须显式释放。三种写法：

\`\`\`csharp
using System.IO;

string file = Path.Combine(Path.GetTempPath(), "using_demo.txt");

// 写法 1：经典 using 块
using (var fs = new FileStream(file, FileMode.Create))
{
    fs.WriteByte(65);  // 'A'
}

// 写法 2：⭐ C# 8+ using 声明（无大括号，作用域结束自动释放）
using var fs2 = new FileStream(file, FileMode.Append);
fs2.WriteByte(66);  // 'B'
// 当前作用域结束自动 Dispose

// 写法 3：try-finally（编译器等价展开）
FileStream? fs3 = null;
try
{
    fs3 = new FileStream(file, FileMode.Open);
    Console.WriteLine(fs3.Length);
}
finally
{
    fs3?.Dispose();
}

File.Delete(file);
\`\`\`

> ⭐ 实战推荐「写法 2」：\`using var\` 一行搞定，干净。

### 四、StreamReader / StreamWriter：文本流

直接操作字节太繁琐。\`StreamReader\`/\`StreamWriter\` 包装 \`Stream\`，提供按字符/按行读写：

\`\`\`csharp
using System.IO;

string file = Path.Combine(Path.GetTempPath(), "text_demo.txt");

// 写入多行
using (var sw = new StreamWriter(file, append: false))
{
    sw.WriteLine("第一行");
    sw.WriteLine("第二行");
    sw.WriteLine("第三行");
}

// 逐行读取（⭐ 处理大文本文件首选）
using (var sr = new StreamReader(file))
{
    string? line;
    while ((line = sr.ReadLine()) != null)
    {
        Console.WriteLine($"读到: {line}");
    }
}

// 也可以一次读完（小文件可以，大文件别这样）
using var sr2 = new StreamReader(file);
string all = sr2.ReadToEnd();
Console.WriteLine($"全文 {all.Length} 字符");

File.Delete(file);
\`\`\`

> \`StreamReader.ReadLine\` 是大日志文件分析的利器：1GB 文件一次只占一行内存。

### 五、MemoryStream：内存流

\`MemoryStream\` 把内存当成「流」来操作，常用于：序列化中间缓冲、压缩管道、图片处理。

\`\`\`csharp
using System.IO;

using var ms = new MemoryStream();
byte[] data = System.Text.Encoding.UTF8.GetBytes("Hello Memory");

ms.Write(data, 0, data.Length);

// ⭐ 写完想读：必须把 Position 重置回 0
ms.Position = 0;

byte[] buf = new byte[16];
int n = ms.Read(buf, 0, buf.Length);
Console.WriteLine($"读到 {n} 字节: {System.Text.Encoding.UTF8.GetString(buf, 0, n)}");

// 也可以直接 ToArray() 拿全部
byte[] all = ms.ToArray();
Console.WriteLine($"全部 {all.Length} 字节");
\`\`\`

要点：
- 写完读要 \`Position = 0\`——这是新手最常踩的坑。
- \`GetBuffer()\` 返回底层字节数组（可能比实际数据长）；\`ToArray()\` 返回精确长度副本。

### 六、BinaryReader / BinaryWriter：二进制读写

按基础类型（int/double/string）读写二进制文件——比文本紧凑、解析快。

\`\`\`csharp
using System.IO;

string file = Path.Combine(Path.GetTempPath(), "bin_demo.dat");

// 写入
using (var fs = new FileStream(file, FileMode.Create))
using (var bw = new BinaryWriter(fs))
{
    bw.Write(42);                 // int
    bw.Write(3.14);               // double
    bw.Write("张三");             // 字符串（带长度前缀）
    bw.Write(true);               // bool
}

// 读取（必须按写入顺序、类型对应）
using (var fs = new FileStream(file, FileMode.Open))
using (var br = new BinaryReader(fs))
{
    int age = br.ReadInt32();
    double pi = br.ReadDouble();
    string name = br.ReadString();
    bool flag = br.ReadBoolean();
    Console.WriteLine($"{name} {age} {pi} {flag}");
}

File.Delete(file);
\`\`\`

> 适合：游戏存档、自定义二进制协议、固定格式文件。要兼容文本编辑器查看就用 JSON（下一章）。

### 七、缓冲区读写：分块处理大文件

\`\`\`csharp
using System.IO;

string src = Path.Combine(Path.GetTempPath(), "big_src.bin");
string dst = Path.Combine(Path.GetTempPath(), "big_dst.bin");

// 造一个 1MB 文件做演示
File.WriteAllBytes(src, new byte[1024 * 1024]);

// ⭐ 分块复制：核心模式
using var inStream = new FileStream(src, FileMode.Open);
using var outStream = new FileStream(dst, FileMode.Create);

byte[] buffer = new byte[8192];   // 8KB 缓冲区
int bytesRead;
while ((bytesRead = inStream.Read(buffer, 0, buffer.Length)) > 0)
{
    outStream.Write(buffer, 0, bytesRead);
    // Console.WriteLine($"已复制 {outStream.Position} 字节");
}

Console.WriteLine($"复制完成: {new FileInfo(dst).Length} 字节");
File.Delete(src);
File.Delete(dst);
\`\`\`

要点：
- 缓冲区 8KB~64KB 是常见选择，太小频繁 syscall，太大没意义。
- 最后一次 \`Read\` 返回的实际字节数可能小于 \`buffer.Length\`，必须用 \`bytesRead\`。

### 八、async 流读写：不阻塞线程

文件 IO 是慢操作——同步会卡住线程。async 让线程等待时去干别的活：

\`\`\`csharp
using System.IO;

string file = Path.Combine(Path.GetTempPath(), "async_demo.txt");

// 异步写
await File.WriteAllTextAsync(file, "异步写入\\n");
await File.AppendAllTextAsync(file, "第二行\\n");

// 异步按行读
await foreach (var line in File.ReadLinesAsync(file))
{
    Console.WriteLine($"async line: {line}");
}

// 流的异步分块读
using var fs = new FileStream(file, FileMode.Open);
byte[] buf = new byte[1024];
int n = await fs.ReadAsync(buf);
Console.WriteLine($"读到 {n} 字节");

File.Delete(file);
\`\`\`

> ⭐ ASP.NET Core / WinUI 等高并发场景必须用 async——同步 IO 在线程池里会拖慢整体吞吐。

### 九、实战 demo 1：大文件复制（async 版）

\`\`\`csharp
using System.IO;

string src = Path.Combine(Path.GetTempPath(), "big.bin");
string dst = Path.Combine(Path.GetTempPath(), "big_copy.bin");

File.WriteAllBytes(src, new byte[5 * 1024 * 1024]);  // 5MB

async Task CopyAsync(string from, string to)
{
    using var inS = new FileStream(from, FileMode.Open, FileAccess.Read, FileShare.Read,
                                   bufferSize: 81920, useAsync: true);
    using var outS = new FileStream(to, FileMode.Create, FileAccess.Write, FileShare.None,
                                    bufferSize: 81920, useAsync: true);
    await inS.CopyToAsync(outS);   // ⭐ CopyToAsync 内置分块循环
}

await CopyAsync(src, dst);
Console.WriteLine($"源大小 {new FileInfo(src).Length}, 副本 {new FileInfo(dst).Length}");

File.Delete(src);
File.Delete(dst);
\`\`\`

> \`Stream.CopyToAsync\` 一行实现分块异步复制——别手写循环。

### 十、实战 demo 2：读取 CSV

\`\`\`csharp
using System.IO;

string csv = Path.Combine(Path.GetTempPath(), "users.csv");
File.WriteAllText(csv, "id,name,age\\n1,张三,28\\n2,李四,35\\n3,王五,42\\n");

// 逐行读 + 字符串拆分
using var sr = new StreamReader(csv);

string? header = sr.ReadLine();        // 第一行表头
Console.WriteLine($"表头: {header}");

while (sr.ReadLine() is { } line)
{
    var parts = line.Split(',');
    if (parts.Length == 3)
    {
        int id = int.Parse(parts[0]);
        string name = parts[1];
        int age = int.Parse(parts[2]);
        Console.WriteLine($"id={id} name={name} age={age}");
    }
}

File.Delete(csv);
\`\`\`

> 生产代码请用 \`CsvHelper\` NuGet 包处理引号、转义等细节。这里演示原理。

### 小结

- \`Stream\` 是字节级流抽象，分块读写不爆内存。
- \`FileStream\` 读磁盘、\`MemoryStream\` 读内存，API 一致。
- \`StreamReader/Writer\` 处理文本，\`BinaryReader/Writer\` 处理二进制。
- \`using\` 释放资源是铁律——\`using var\` 一行最干净。
- 大文件分块循环或 \`CopyToAsync\`；高并发场景必用 async。
- \`StreamReader.ReadLine\` 是大文本文件分析首选，一次只占一行内存。`,
  },

  // ============================================================
  // 第四十五章：JSON 序列化
  // ============================================================
  {
    id: 'csharp2-ch45',
    group: '第九部分 IO 与序列化',
    icon: '📦',
    title: '第四十五章 JSON 序列化',
    content: `## 第四十五章　JSON 序列化

JSON 是当今最通用的数据交换格式——API 响应、配置文件、NoSQL 存储全是它。.NET 8 内置 \`System.Text.Json\`，性能吊打 Newtonsoft.Json，是默认推荐方案。

### 一、System.Text.Json 入门

\`\`\`csharp
using System.Text.Json;

// 定义一个类
public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
}

var user = new User { Id = 1, Name = "张三", Email = "zs@example.com" };

// ⭐ 序列化：对象 -> JSON 字符串
string json = JsonSerializer.Serialize(user);
Console.WriteLine(json);
// {"Id":1,"Name":"张三","Email":"zs@example.com"}

// ⭐ 反序列化：JSON 字符串 -> 对象
User? parsed = JsonSerializer.Deserialize<User>(json);
Console.WriteLine($"{parsed?.Id} {parsed?.Name} {parsed?.Email}");
\`\`\`

> ⭐ \`System.Text.Json\` 是 .NET 内置的高性能 JSON 库，无需装 NuGet。默认行为：
> - 属性名原样输出（不转驼峰）。
> - 大小写敏感反序列化（\`name\` 不会自动匹配 \`Name\`）。
> - 不输出 null 值字段（除非显式配置）。

### 二、JsonSerializerOptions：常用配置

\`\`\`csharp
using System.Text.Json;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public string? Description { get; set; }   // nullable
}

var p = new Product { Id = 1, Name = "鼠标", Price = 99.5m, Description = null };

// ⭐ 推荐做法：复用同一个 Options 实例（性能）
var options = new JsonSerializerOptions
{
    WriteIndented = true,                       // 缩进美化
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,  // 驼峰命名
    DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
};

string json = JsonSerializer.Serialize(p, options);
Console.WriteLine(json);
/*
{
  "id": 1,
  "name": "鼠标",
  "price": 99.5
}
Description 为 null 被忽略
*/

var back = JsonSerializer.Deserialize<Product>(json, options);
Console.WriteLine(back?.Name);
\`\`\`

要点：
- \`JsonSerializerOptions\` 内部有缓存，**复用同一个实例**比每次 new 快得多。
- \`JsonNamingPolicy.CamelCase\` 是 Web API 默认风格（\`userName\` 而不是 \`UserName\`）。
- \`WriteIndented\` 适合调试输出，生产环境关闭省字节。

### 三、JsonPropertyName：自定义字段名

有时候 JSON 字段名和 C# 属性名就是不一致（比如对接第三方 API 用缩写）：

\`\`\`csharp
using System.Text.Json;
using System.Text.Json.Serialization;

public class ApiResponse
{
    [JsonPropertyName("user_id")]    // 序列化时输出 user_id
    public int UserId { get; set; }

    [JsonPropertyName("user_name")]
    public string UserName { get; set; } = "";

    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }
}

var r = new ApiResponse { UserId = 100, UserName = "lisi", CreatedAt = DateTime.Now };
string json = JsonSerializer.Serialize(r);
Console.WriteLine(json);
// {"user_id":100,"user_name":"lisi","created_at":"2024-01-01T12:00:00"}

// 反序列化时同样按 user_id 匹配 UserId
var back = JsonSerializer.Deserialize<ApiResponse>(json);
\`\`\`

> ⭐ \`JsonPropertyName\` 优先级高于 \`PropertyNamingPolicy\`，显式指定的字段不再走驼峰转换。

### 四、JsonIgnore：跳过字段

密码、内部状态、循环引用——不希望序列化输出：

\`\`\`csharp
using System.Text.Json;
using System.Text.Json.Serialization;

public class Account
{
    public int Id { get; set; }
    public string Name { get; set; } = "";

    [JsonIgnore]                       // 永远不输出
    public string Password { get; set; } = "";

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Phone { get; set; } // 仅 null 时不输出

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public int Age { get; set; }       // 默认值 0 时不输出
}

var a = new Account { Id = 1, Name = "wang", Password = "123456", Phone = null, Age = 0 };
Console.WriteLine(JsonSerializer.Serialize(a));
// {"Id":1,"Name":"wang"}
\`\`\`

> 安全提示：\`JsonIgnore\` 是默认推荐方式，比 \`[NonSerialized]\` 更明确。

### 五、嵌套对象与集合

JSON 天然支持嵌套，C# 直接用对象 + 集合对应：

\`\`\`csharp
using System.Text.Json;

public class Order
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public User Customer { get; set; } = new();           // 嵌套对象
    public List<OrderItem> Items { get; set; } = new();   // 集合
}

public class OrderItem
{
    public string Product { get; set; } = "";
    public int Qty { get; set; }
    public decimal Price { get; set; }
}

var order = new Order
{
    Id = 1001,
    CreatedAt = DateTime.Now,
    Customer = new User { Id = 1, Name = "张三", Email = "zs@x.com" },
    Items = new()
    {
        new() { Product = "鼠标", Qty = 2, Price = 99 },
        new() { Product = "键盘", Qty = 1, Price = 199 },
    }
};

var opts = new JsonSerializerOptions { WriteIndented = true };
string json = JsonSerializer.Serialize(order, opts);
Console.WriteLine(json);

// 反序列化：自动重建整棵对象图
var back = JsonSerializer.Deserialize<Order>(json, opts);
Console.WriteLine($"订单 {back?.Id}, 客户 {back?.Customer.Name}, 共 {back?.Items.Count} 项");
\`\`\`

> \`System.Text.Json\` 自动处理任意深度的嵌套——只要类型可序列化。

### 六、字典与多种集合

\`\`\`csharp
using System.Text.Json;

// 字典：键自动转字符串
var meta = new Dictionary<string, object>
{
    ["version"] = "1.0",
    ["count"] = 42,
    ["tags"] = new[] { "a", "b", "c" },
};
Console.WriteLine(JsonSerializer.Serialize(meta));
// {"version":"1.0","count":42,"tags":["a","b","c"]}

// 列表
var list = new List<int> { 1, 2, 3, 4, 5 };
Console.WriteLine(JsonSerializer.Serialize(list));   // [1,2,3,4,5]

// 数组
int[] arr = { 10, 20, 30 };
Console.WriteLine(JsonSerializer.Serialize(arr));    // [10,20,30]

// HashSet（输出仍是数组）
var set = new HashSet<string> { "x", "y", "z" };
Console.WriteLine(JsonSerializer.Serialize(set));
\`\`\`

> 字典的 key 必须能转字符串——\`Dictionary<int, T>\` 也会把 int key 转成 JSON 字符串。

### 七、record 类型序列化

C# 9+ 的 \`record\` 是不可变类型，序列化行为和 class 一致，但反序列化要构造函数支持：

\`\`\`csharp
using System.Text.Json;

// record 主构造函数：参数名要和属性名匹配（默认大小写不敏感也行）
public record Point(int X, int Y);

var p = new Point(3, 4);
string json = JsonSerializer.Serialize(p);
Console.WriteLine(json);                  // {"X":3,"Y":4}

var back = JsonSerializer.Deserialize<Point>(json);
Console.WriteLine(back);                  // Point { X = 3, Y = 4 }

// record with init 属性
public record UserDto(int Id, string Name)
{
    public string? Email { get; init; }
};

var u = new UserDto(1, "tom") { Email = "t@x.com" };
string j = JsonSerializer.Serialize(u);
Console.WriteLine(j);
\`\`\`

> ⭐ .NET 8 的 \`System.Text.Json\` 完美支持 record，构造函数参数会被当作属性参与序列化。

### 八、JsonDocument：低级 API

不想定义类？只想看 JSON 结构？用 \`JsonDocument\`：

\`\`\`csharp
using System.Text.Json;

string json = """
{
  "status": "ok",
  "data": {
    "users": [
      { "id": 1, "name": "张三" },
      { "id": 2, "name": "李四" }
    ]
  },
  "count": 2
}
""";

using var doc = JsonDocument.Parse(json);

// 顶层属性
string status = doc.RootElement.GetProperty("status").GetString()!;
int count = doc.RootElement.GetProperty("count").GetInt32();
Console.WriteLine($"status={status} count={count}");

// 遍历数组
foreach (var user in doc.RootElement.GetProperty("data").GetProperty("users").EnumerateArray())
{
    int id = user.GetProperty("id").GetInt32();
    string name = user.GetProperty("name").GetString()!;
    Console.WriteLine($"{id} {name}");
}
\`\`\`

> \`JsonDocument\` 适合一次性解析、不修改、用完即弃。频繁访问同一段数据请反序列化成对象。

### 九、JsonNode：可变 DOM

\`JsonNode\` 是 .NET 6+ 的可变 JSON DOM，能读能写：

\`\`\`csharp
using System.Text.Json.Nodes;

// 直接构造 JSON
var node = new JsonObject
{
    ["name"] = "demo",
    ["version"] = 1.0,
    ["tags"] = new JsonArray("a", "b", "c"),
};

// 修改
node["version"] = 2.0;
((JsonArray)node["tags"]!).Add("d");

Console.WriteLine(node.ToJsonString());
// {"name":"demo","version":2,"tags":["a","b","c","d"]}

// 解析后修改
var parsed = JsonNode.Parse("""{"x":1,"y":2}""")!;
parsed["x"] = 100;
parsed["z"] = 300;
Console.WriteLine(parsed.ToJsonString());
// {"x":100,"y":2,"z":300}
\`\`\`

### 十、实战 demo 1：配置文件读写

\`\`\`csharp
using System.IO;
using System.Text.Json;

public class AppConfig
{
    public string AppName { get; set; } = "";
    public int MaxConnections { get; set; }
    public bool Debug { get; set; }
    public List<string> AllowedHosts { get; set; } = new();
}

string cfgPath = Path.Combine(Path.GetTempPath(), "config.json");

var cfg = new AppConfig
{
    AppName = "MyService",
    MaxConnections = 100,
    Debug = true,
    AllowedHosts = new() { "a.com", "b.com" },
};

// 写入配置文件
var opts = new JsonSerializerOptions { WriteIndented = true };
await File.WriteAllTextAsync(cfgPath, JsonSerializer.Serialize(cfg, opts));
Console.WriteLine($"配置已写入: {cfgPath}");

// 读取配置文件
string json = await File.ReadAllTextAsync(cfgPath);
var loaded = JsonSerializer.Deserialize<AppConfig>(json);
Console.WriteLine($"App={loaded?.AppName}, MaxConn={loaded?.MaxConnections}, Hosts={loaded?.AllowedHosts.Count}");

File.Delete(cfgPath);
\`\`\`

### 十一、实战 demo 2：模拟 API 响应

\`\`\`csharp
using System.Text.Json;
using System.Text.Json.Serialization;

public class PagedResponse<T>
{
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int Total { get; set; }
    public List<T> Items { get; set; } = new();
}

var resp = new PagedResponse<User>
{
    Page = 1,
    PageSize = 10,
    Total = 42,
    Items = new()
    {
        new() { Id = 1, Name = "张三", Email = "zs@x.com" },
        new() { Id = 2, Name = "李四", Email = "ls@x.com" },
    }
};

// Web API 标准风格：驼峰 + 缩进
var opts = new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    WriteIndented = true,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
};

string json = JsonSerializer.Serialize(resp, opts);
Console.WriteLine(json);
File.Delete(Path.Combine(Path.GetTempPath(), "config.json"));
\`\`\`

### 小结

- \`System.Text.Json\` 是 .NET 8 内置高性能 JSON 库，无需 NuGet。
- ⭐ \`JsonSerializerOptions\` 复用、\`CamelCase\` + \`WriteIndented\` 是 Web API 标配。
- \`JsonPropertyName\` 自定义字段名；\`JsonIgnore\` 跳过字段；record 完美支持。
- 嵌套对象/集合/字典自动序列化。
- 不想定义类用 \`JsonDocument\`（只读）或 \`JsonNode\`（可变）。
- JSON 是配置文件、API 响应、NoSQL 存储的通用选择——日常开发必备技能。`,
  },

  // ============================================================
  // 第四十六章：正则表达式
  // ============================================================
  {
    id: 'csharp2-ch46',
    group: '第九部分 IO 与序列化',
    icon: '🔎',
    title: '第四十六章 正则表达式',
    content: `## 第四十六章　正则表达式

正则表达式（Regular Expression，简称 regex）是文本匹配的「瑞士军刀」——验证邮箱、提取 URL、解析日志、批量替换，一行代码搞定字符串处理逻辑。C# 的 \`System.Text.RegularExpressions.Regex\` 类提供完整支持。

### 一、Regex 类核心方法

\`\`\`csharp
using System.Text.RegularExpressions;

string input = "我的电话是 138-1234-5678，邮箱是 zs@example.com";

// 1. IsMatch：是否匹配
bool hasPhone = Regex.IsMatch(input, @"\\d{3}-\\d{4}-\\d{4}");
Console.WriteLine($"有电话? {hasPhone}");   // True

// 2. Match：返回第一个匹配
Match m = Regex.Match(input, @"\\d{3}-\\d{4}-\\d{4}");
if (m.Success)
{
    Console.WriteLine($"电话: {m.Value}");   // 138-1234-5678
    Console.WriteLine($"位置: {m.Index}");   // 起始索引
}

// 3. Matches：返回所有匹配
MatchCollection ms = Regex.Matches(input, @"[a-z]+@[a-z.]+");
foreach (Match x in ms) Console.WriteLine($"邮箱: {x.Value}");

// 4. Replace：替换
string masked = Regex.Replace(input, @"\\d{4}", "****");
Console.WriteLine(masked);   // 我的电话是 138-****-****，邮箱是 zs@example.com

// 5. Split：按模式分割
string[] parts = Regex.Split("a1b22c333", @"\\d+");
foreach (var p in parts) Console.WriteLine($"[{p}]");  // a b c (空)
\`\`\`

> ⭐ 五个方法搞定 90% 场景：\`IsMatch\` 验证、\`Match\`/Matches\` 提取、\`Replace\` 替换、\`Split\` 分割。

### 二、常用元字符

正则的灵魂是元字符——它们有特殊含义：

\`\`\`csharp
using System.Text.RegularExpressions;

// .  匹配任意单个字符（除 \\n）
Console.WriteLine(Regex.IsMatch("abc", "a.c"));     // True
Console.WriteLine(Regex.IsMatch("aXc", "a.c"));     // True

// *  前面的出现 0 次或多次
Console.WriteLine(Regex.IsMatch("aaab", "a*b"));    // True
Console.WriteLine(Regex.IsMatch("b", "a*b"));       // True（0 次）

// +  前面的出现 1 次或多次
Console.WriteLine(Regex.IsMatch("aaab", "a+b"));    // True
Console.WriteLine(Regex.IsMatch("b", "a+b"));       // False

// ?  前面的出现 0 次或 1 次
Console.WriteLine(Regex.IsMatch("color", "colou?r"));    // True
Console.WriteLine(Regex.IsMatch("colour", "colou?r"));   // True

// ^  字符串开头；$  字符串结尾
Console.WriteLine(Regex.IsMatch("hello", "^hello"));    // True
Console.WriteLine(Regex.IsMatch("hello world", "^hello$")); // False

// \\d 数字；\\D 非数字
Console.WriteLine(Regex.IsMatch("abc123", @"\\d+"));    // True

// \\w 字母数字下划线；\\W 反
Console.WriteLine(Regex.IsMatch("a_1", @"^\\w+$"));    // True

// \\s 空白；\\S 非空白
Console.WriteLine(Regex.IsMatch("a b", @"a\\sb"));     // True
\`\`\`

要点：
- C# 中正则字符串用 \`@"..."\` 逐字字符串，否则 \`\\\\d\` 要写四个反斜杠。
- \`.\` 默认不匹配换行，需要 \`RegexOptions.Singleline\` 才匹配。

### 三、字符类 [ ]：限定字符集

\`\`\`csharp
using System.Text.RegularExpressions;

// [abc]   匹配 a 或 b 或 c
Console.WriteLine(Regex.IsMatch("bat", "[bcd]at"));    // True

// [a-z]   范围：小写字母
Console.WriteLine(Regex.IsMatch("hello", "^[a-z]+$")); // True

// [^abc]  取反：不是 a/b/c
Console.WriteLine(Regex.IsMatch("xyz", "^[^abc]+$"));  // True

// [0-9a-fA-F]  十六进制字符
Console.WriteLine(Regex.IsMatch("1aF", "^[0-9a-fA-F]+$")); // True

// 实战：身份证前 17 位数字 + 末位数字或 X
bool IsIdCard(string s) => Regex.IsMatch(s, @"^\\d{17}[0-9X]$");
Console.WriteLine(IsIdCard("11010119900101001X"));  // True
\`\`\`

> 字符类里 \`.\` 失去特殊含义，就是字面「点」。\`\\d\` 在 [\`] 内仍可用。

### 四、量词 { }：精确控制次数

\`\`\`csharp
using System.Text.RegularExpressions;

// {n}   恰好 n 次
Console.WriteLine(Regex.IsMatch("123", @"^\\d{3}$"));      // True

// {n,}  至少 n 次
Console.WriteLine(Regex.IsMatch("12345", @"^\\d{3,}$"));   // True

// {n,m} n 到 m 次
Console.WriteLine(Regex.IsMatch("1234", @"^\\d{3,5}$"));   // True

// 实战：密码强度（6-18 位，必须含字母和数字）
bool StrongPwd(string s) =>
    Regex.IsMatch(s, @"^[A-Za-z0-9]{6,18}$")
    && Regex.IsMatch(s, @"[A-Za-z]")
    && Regex.IsMatch(s, @"\\d");
Console.WriteLine(StrongPwd("abc12345"));    // True
Console.WriteLine(StrongPwd("abcdef"));      // False
\`\`\`

### 五、分组 ( )：捕获子串

\`\`\`csharp
using System.Text.RegularExpressions;

string input = "2024-01-15";

// 用 () 分组：年-月-日
Match m = Regex.Match(input, @"(\\d{4})-(\\d{2})-(\\d{2})");
if (m.Success)
{
    Console.WriteLine($"完整匹配: {m.Value}");    // 2024-01-15
    Console.WriteLine($"组1（年）: {m.Groups[1].Value}");  // 2024
    Console.WriteLine($"组2（月）: {m.Groups[2].Value}");  // 01
    Console.WriteLine($"组3（日）: {m.Groups[3].Value}");  // 15
}

// 非捕获分组 (?:...)：分组但不存储，性能略好
Match m2 = Regex.Match("abc123def", @"(?:[a-z]+)(\\d+)(?:[a-z]+)");
Console.WriteLine(m2.Groups[1].Value);  // 123
\`\`\`

> \`m.Groups[0]\` 永远是完整匹配，分组索引从 1 开始。

### 六、命名分组 (?<name>...)：可读性更高

\`\`\`csharp
using System.Text.RegularExpressions;

string input = "ProductID=42, Count=10";

// 命名分组：(?<名称>模式)
Match m = Regex.Match(input, @"ProductID=(?<pid>\\d+),\\s*Count=(?<cnt>\\d+)");
if (m.Success)
{
    int pid = int.Parse(m.Groups["pid"].Value);
    int cnt = int.Parse(m.Groups["cnt"].Value);
    Console.WriteLine($"产品 {pid}, 数量 {cnt}");
}

// 替换时引用命名分组：\${name}
string replaced = Regex.Replace("2024-01-15",
    @"(?<y>\\d{4})-(?<m>\\d{2})-(?<d>\\d{2})",
    "\${m}/\${d}/\${y}");
Console.WriteLine(replaced);   // 01/15/2024
\`\`\`

> ⭐ 命名分组在解析结构化文本（日志、协议）时远比索引可读。

### 七、RegexOptions：常用选项

\`\`\`csharp
using System.Text.RegularExpressions;

// IgnoreCase：忽略大小写
Console.WriteLine(Regex.IsMatch("Hello", "hello", RegexOptions.IgnoreCase));  // True

// Multiline：^ $ 匹配每行的开头/结尾（默认只匹配整个字符串的开头/结尾）
string text = "line1\\nline2\\nline3";
var matches = Regex.Matches(text, @"^line\\w+", RegexOptions.Multiline);
Console.WriteLine($"匹配 {matches.Count} 行");  // 3

// Singleline：让 . 也匹配 \\n（默认不匹配）
string html = "<div>hello\\nworld</div>";
Match m = Regex.Match(html, @"<div>(.*?)</div>", RegexOptions.Singleline);
Console.WriteLine(m.Groups[1].Value);  // hello\\nworld

// Compiled：编译为 IL，多次调用更快（启动慢、占内存）
var compiled = new Regex(@"^\\d+$", RegexOptions.Compiled);
Console.WriteLine(compiled.IsMatch("12345"));
\`\`\`

> ⭐ 反复使用同一正则，用 \`new Regex(pattern, options)\` 实例化复用，比 \`Regex.IsMatch(s, p)\` 静态调用快（静态调用会缓存但有查找开销）。

### 八、Compiled 与超时：生产环境注意

\`\`\`csharp
using System.Text.RegularExpressions;
using System.Text.RegularExpressions.Generated;

// ⭐ .NET 7+ 源生成器：编译时生成正则代码，启动快、运行快、零反射
// 在 partial 类/方法上标注 [GeneratedRegex]
public partial class MyRegexes
{
    [GeneratedRegex(@"^\\d{4}-\\d{2}-\\d{2}$")]
    public static partial Regex DatePattern();
}

Console.WriteLine(MyRegexes.DatePattern().IsMatch("2024-01-15"));  // True

// 设置超时：防止「灾难性回溯」把 CPU 跑满
try
{
    var slow = new Regex(@"^(a+)+$", RegexOptions.None, TimeSpan.FromMilliseconds(100));
    slow.IsMatch("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaab!");   // 触发回溯
}
catch (RegexMatchTimeoutException ex)
{
    Console.WriteLine($"正则超时: {ex.Message}");
}
\`\`\`

> 生产代码**必须**给正则设超时——某些模式匹配长字符串会指数级回溯，瞬间 100% CPU。

### 九、Regex.EnumerateMatches（C# 9+）

\`Regex.Matches\` 返回集合，分配内存。\`EnumerateMatches\` 返回 \`ValueMatch\` 结构体枚举，零分配：

\`\`\`csharp
using System.Text.RegularExpressions;

string text = "电话 13812345678，备用 13987654321";

// C# 9+ 高性能 API（.NET 6+）
foreach (ValueMatch m in Regex.EnumerateMatches(text, @"1[3-9]\\d{9}"))
{
    Console.WriteLine($"位置 {m.Index}: {text.Substring(m.Index, m.Length)}");
}
\`\`\`

> \`ValueMatch\` 只有 \`Index\`/\`Length\`，不包含 \`Groups\`。需要分组时还是得用 \`Matches\`。

### 十、实战 demo 1：邮箱 / 手机号 / URL 验证

\`\`\`csharp
using System.Text.RegularExpressions;

bool IsEmail(string s) => Regex.IsMatch(s,
    @"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

bool IsPhoneCN(string s) => Regex.IsMatch(s,
    @"^1[3-9]\\d{9}$");

bool IsUrl(string s) => Regex.IsMatch(s,
    @"^https?://[A-Za-z0-9.-]+(?:/[^\s]*)?$");

Console.WriteLine(IsEmail("zs@example.com"));      // True
Console.WriteLine(IsEmail("bad-email"));            // False
Console.WriteLine(IsPhoneCN("13812345678"));        // True
Console.WriteLine(IsPhoneCN("12345678901"));        // False
Console.WriteLine(IsUrl("https://www.example.com/path?q=1"));  // True
\`\`\`

> ⚠️ 邮箱正则只是「粗略校验」，RFC 5322 完整规范太复杂。生产代码先用正则过滤明显非法，再发验证邮件确认。

### 十一、实战 demo 2：日志解析

\`\`\`csharp
using System.Text.RegularExpressions;

string[] logs = """
[2024-01-15 10:23:45] INFO  UserService - 用户 1001 登录成功
[2024-01-15 10:24:01] WARN  CacheService - 缓存命中率低 35%
[2024-01-15 10:25:30] ERROR DbService - 连接超时 timeout=3000ms
""".Split('\\n');

// 用命名分组解析日志
var pattern = new Regex(
    @"\\[(?<time>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})\\]\\s+" +
    @"(?<level>INFO|WARN|ERROR)\\s+" +
    @"(?<service>\\w+)\\s+-\\s+(?<msg>.+)");

foreach (var line in logs)
{
    Match m = pattern.Match(line);
    if (m.Success)
    {
        Console.WriteLine($"[{m.Groups["level"].Value}] " +
                          $"{m.Groups["time"].Value} " +
                          $"{m.Groups["service"].Value}: {m.Groups["msg"].Value}");
    }
}
\`\`\`

### 十二、反向引用与先行断言（进阶）

\`\`\`csharp
using System.Text.RegularExpressions;

// 反向引用 \\1：捕获组内容再次出现
Console.WriteLine(Regex.IsMatch("hello hello", @"^(\\w+) \\1$"));   // True
Console.WriteLine(Regex.IsMatch("hello world", @"^(\\w+) \\1$"));   // False

// 先行断言 (?=...)：匹配后面是 ... 的位置（不消费字符）
// 提取数字后面的字母
foreach (Match m in Regex.Matches("1a 2b 3c", @"\\d(?=[a-z])"))
    Console.WriteLine(m.Value);   // 1 2 3

// 否定先行 (?!...)：匹配后面不是 ... 的位置
foreach (Match m in Regex.Matches("a1 b2 c3", @"[a-z](?!\\d)"))
    Console.WriteLine(m.Value);   // c
\`\`\`

### 小结

- 五个核心方法：\`IsMatch\`/Match\`/Matches\`/Replace\`/Split\`。
- 元字符 \`.\` \`*\` \`+\` \`?\` \`^\` \`$\` \`\\d\` \`\\w\` \`\\s\` 是基石。
- 字符类 [\`] 限定字符集，量词 \`{}\` 控制次数，分组 \`()\` 捕获子串。
- ⭐ 命名分组 \`(?<name>...)\` 比索引可读，生产代码首选。
- \`RegexOptions\`：\`IgnoreCase\`/\`Multiline\`/\`Singleline\`/\`Compiled\`。
- .NET 7+ 用 \`[GeneratedRegex]\` 源生成器零开销编译正则。
- 生产代码必设超时，防灾难性回溯。
- \`Regex.EnumerateMatches\` 是 .NET 6+ 高性能零分配 API。
- 正则虽强但有边界：复杂 HTML/JSON 解析别用正则，用专门的解析器。`,
  },
];

export { chapters };
