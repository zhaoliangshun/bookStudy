// =============================================================
// C# 从入门到精通大全（全新版）—— 第 10 批章节
// 第八部分 文件 IO 与序列化（共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   csharp4-ch51 : 第五十一章 文件与目录
//   csharp4-ch52 : 第五十二章 流与读写器
//   csharp4-ch53 : 第五十三章 JSON 序列化
//   csharp4-ch54 : 第五十四章 XML 与 CSV 处理
//   csharp4-ch55 : 第五十五章 高性能 IO 与管道
//
// 风格：demo 驱动，注释详尽，循序渐进。
// 适用版本：.NET 8 LTS / C# 12，所有示例用顶级语句。
// 沙箱注意：所有文件 IO 演示均使用 Path.GetTempPath() 临时目录，
//           并在 finally 中清理，避免污染环境。
// =============================================================

const chapters = [
  // ============================================================
  // 第五十一章：文件与目录
  // ============================================================
  {
    id: 'csharp4-ch51',
    group: '第八部分 文件 IO 与序列化',
    icon: '📁',
    title: '文件与目录',
    content: `## 第五十二章　文件与目录

文件 IO 是日常开发中最常见的任务之一：读配置、写日志、处理上传、生成报表。C# 在 \`System.IO\` 命名空间下提供了一整套 API，从「一次性读写」到「流式处理」再到「零拷贝高性能」一应俱全。本章先讲最常用的文件与目录操作。

### 一、为什么有这么多 API？⭐

你可能会疑惑：读个文件而已，为什么 .NET 提供了 \`File\`、\`FileInfo\`、\`FileStream\`、\`StreamReader\`、\`RandomAccess\` 这么多方式？答案是它们各自面向不同的场景：

| API | 场景 | 特点 |
| --- | --- | --- |
| \`File\` 静态类 | 小文件一次性读写 | 简单、内部自动开闭流 |
| \`FileInfo\` 实例类 | 多次操作同一文件 | 缓存元数据、避免重复路径解析 |
| \`FileStream\` | 大文件流式处理 | 可控缓冲、可定位、可异步 |
| \`StreamReader\` | 按行读写文本 | 自动处理编码 |
| \`RandomAccess\` | 高性能零拷贝 | 基于 SafeFileHandle，.NET 6+ |

选对工具，事半功倍。

### 二、File 静态类：一次性 API

\`File\` 是静态类，所有方法都是「打开 → 操作 → 关闭」一步到位，最适合小文件。

\`\`\`csharp
// 文本读写
File.WriteAllText("a.txt", "hello");          // 覆盖写入
File.AppendAllText("a.txt", "\\nworld");       // 追加写入
string text = File.ReadAllText("a.txt");       // 一次性读全部文本
string[] lines = File.ReadAllLines("a.txt");   // 按行读成数组

// 二进制读写
File.WriteAllBytes("b.bin", new byte[] { 1, 2, 3 });
byte[] bytes = File.ReadAllBytes("b.bin");

// 文件操作
File.Exists("a.txt");          // 是否存在
File.Copy("a.txt", "a.bak");   // 复制（默认不覆盖）
File.Move("a.txt", "a.old");   // 移动/重命名
File.Delete("a.txt");          // 删除（不存在不报错）
\`\`\`

⚠ 注意：\`File.Copy\` 默认不允许覆盖目标，需要传 \`overwrite: true\` 才能覆盖已存在文件。

### 三、FileInfo 实例类：缓存元数据

\`FileInfo\` 是实例类，构造时会**缓存**文件元数据（大小、创建时间等），适合对同一文件做多次查询或操作。

\`\`\`csharp
FileInfo fi = new FileInfo("a.txt");
long size = fi.Length;             // 文件大小（字节）
DateTime created = fi.CreationTime;
DateTime modified = fi.LastWriteTime;
FileAttributes attr = fi.Attributes;  // 只读、隐藏等
fi.IsReadOnly = true;              // 设置只读
fi.Refresh();                      // 强制刷新缓存
fi.CopyTo("a.bak", overwrite: true);
fi.MoveTo("a.old");
fi.Delete();
\`\`\`

**File vs FileInfo 怎么选？**
- 单次操作 → \`File\`（更简洁）
- 同一文件多次操作 → \`FileInfo\`（避免重复路径解析、缓存元数据）

### 四、Directory 静态类

\`\`\`csharp
Directory.CreateDirectory("a/b/c");          // 递归创建所有父目录
Directory.Exists("a/b/c");
string[] files = Directory.GetFiles("a");     // 当前目录所有文件
string[] dirs = Directory.GetDirectories("a"); // 所有子目录

// 搜索模式 + 递归
string[] csFiles = Directory.GetFiles(
    "a", "*.cs", SearchOption.AllDirectories);

// EnumerateFiles：延迟枚举，大目录更省内存
foreach (string f in Directory.EnumerateFiles("a", "*", SearchOption.AllDirectories))
{
    Console.WriteLine(f);
}

Directory.Move("a", "a_renamed");  // 移动/重命名目录
Directory.Delete("a", recursive: true);  // 递归删除
\`\`\`

\`GetFiles\` 与 \`EnumerateFiles\` 的区别：前者一次性返回数组（占内存），后者是 \`IEnumerable<string>\` 按需枚举（省内存）。目录很大时一定用 \`Enumerate\` 系列。

### 五、DirectoryInfo 实例类

与 \`FileInfo\` 类似，\`DirectoryInfo\` 提供实例方法：

\`\`\`csharp
DirectoryInfo di = new DirectoryInfo("a");
di.Create();                                  // 创建
di.CreateSubdirectory("sub");                  // 创建子目录
FileInfo[] files = di.GetFiles();              // 子文件
DirectoryInfo[] subDirs = di.GetDirectories(); // 子目录
di.MoveTo("a_renamed");
di.Delete(recursive: true);
\`\`\`

### 六、Path 类：跨平台路径处理

\`Path\` 是处理路径字符串的瑞士军刀，**不会真正访问文件系统**，只是字符串操作。

\`\`\`csharp
Path.Combine("a", "b", "c.txt");        // 拼接（用平台分隔符）
Path.Join("a", "b", "c.txt");           // 拼接（.NET Core 2.1+）
Path.GetFileName("a/b/c.txt");          // "c.txt"
Path.GetFileNameWithoutExtension(...);  // "c"
Path.GetExtension("c.txt");             // ".txt"
Path.GetDirectoryName("a/b/c.txt");     // "a/b"
Path.ChangeExtension("c.txt", ".bak");  // "c.bak"
Path.GetTempPath();                     // 系统临时目录
Path.GetTempFileName();                 // 创建空文件并返回路径
Path.GetRandomFileName();               // 随机文件名（不创建文件）
\`\`\`

**Path.Combine vs Path.Join 的关键区别**：如果中间参数是绝对路径（如 \`"/root"\`），\`Combine\` 会丢弃前面的部分，\`Join\` 不会。所以拼接可能含绝对路径的片段时用 \`Join\` 更安全。

### 七、跨平台路径分隔符

Windows 用 \`\\\`，Linux/macOS 用 \`/\`。**永远不要硬编码分隔符**，要么用 \`Path.Combine\`/\`Path.Join\`，要么用 \`Path.DirectorySeparatorChar\`。.NET 还允许在 Windows 上使用 \`/\`，所以代码里写 \`"a/b/c"\` 通常也能跑，但保险起见用 \`Path\` 类。

### 八、长路径支持

Windows 默认路径长度上限是 260 字符。.NET Core 3.0+ 在 Windows 上自动启用长路径支持（需应用清单配置），超过 260 字符的路径在 .NET 8 上一般无需特殊处理。Linux/macOS 没有此限制。

### 九、本章小结

- 小文件读写 → \`File\` 静态方法
- 多次操作同一文件 → \`FileInfo\`
- 目录遍历大 → \`Directory.Enumerate*\`
- 路径拼接 → \`Path.Combine\` / \`Path.Join\`，绝不硬编码 \`\\\` 或 \`/\`

下一章我们深入 \`Stream\` 体系，处理大文件和流式数据。

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「文件与目录」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 —— 文件与目录 API 全套演示
using System;
using System.IO;
using System.Text;

// === 1. Path 类：路径字符串处理（不访问文件系统）===
string tempRoot = Path.Combine(Path.GetTempPath(), "csharp4-ch51-demo");  // 跨平台拼接
string subDir = Path.Join(tempRoot, "logs", "2026");  // Join 不会被绝对路径截断
string sampleFile = Path.Combine(subDir, "note.txt");

Console.WriteLine($"临时根目录: {tempRoot}");
Console.WriteLine($"文件名: {Path.GetFileName(sampleFile)}");                 // note.txt
Console.WriteLine($"扩展名: {Path.GetExtension(sampleFile)}");               // .txt
Console.WriteLine($"不含扩展名: {Path.GetFileNameWithoutExtension(sampleFile)}"); // note
Console.WriteLine($"目录部分: {Path.GetDirectoryName(sampleFile)}");
Console.WriteLine($"改扩展名: {Path.ChangeExtension(sampleFile, ".bak")}");  // 返回新字符串
Console.WriteLine($"随机文件名: {Path.GetRandomFileName()}");  // 不创建文件
Console.WriteLine($"平台分隔符: '{Path.DirectorySeparatorChar}'");

try
{
    // === 2. Directory 类：目录操作 ===
    if (!Directory.Exists(subDir))
    {
        // CreateDirectory 递归创建所有不存在的父目录
        DirectoryInfo created = Directory.CreateDirectory(subDir);
        Console.WriteLine($"\\n已创建目录: {created.FullName}");
    }

    // === 3. File 类：一次性文本读写 ===
    File.WriteAllText(sampleFile, "第一行内容\\n", Encoding.UTF8);          // 覆盖写入
    File.AppendAllText(sampleFile, "第二行内容\\n");                         // 追加
    File.AppendAllLines(sampleFile, new[] { "第三行", "第四行" });           // 追加多行

    Console.WriteLine($"\\n文件存在? {File.Exists(sampleFile)}");

    string allText = File.ReadAllText(sampleFile);                          // 一次性读取
    Console.WriteLine("--- ReadAllText ---");
    Console.WriteLine(allText.Trim());

    string[] lines = File.ReadAllLines(sampleFile);                         // 按行读
    Console.WriteLine($"共 {lines.Length} 行");

    // 二进制读写
    string binFile = Path.Combine(subDir, "data.bin");
    File.WriteAllBytes(binFile, new byte[] { 0x01, 0x02, 0x03, 0xFF });
    byte[] bytes = File.ReadAllBytes(binFile);
    Console.WriteLine($"\\n二进制文件大小: {bytes.Length} 字节");

    // Copy / Move / Delete
    string copyPath = Path.Combine(subDir, "note-copy.txt");
    File.Copy(sampleFile, copyPath, overwrite: true);   // 第二参数允许覆盖
    Console.WriteLine($"复制后 copy 存在? {File.Exists(copyPath)}");

    // === 4. FileInfo 类：实例方法 + 缓存元数据 ===
    FileInfo fi = new FileInfo(sampleFile);
    Console.WriteLine($"\\n--- FileInfo 元数据 ---");
    Console.WriteLine($"文件名: {fi.Name}");
    Console.WriteLine($"完整路径: {fi.FullName}");
    Console.WriteLine($"大小: {fi.Length} 字节");
    Console.WriteLine($"创建时间: {fi.CreationTime:O}");
    Console.WriteLine($"最后修改: {fi.LastWriteTime:O}");
    Console.WriteLine($"只读? {fi.IsReadOnly}");
    Console.WriteLine($"扩展名: {fi.Extension}");
    Console.WriteLine($"所在目录: {fi.DirectoryName}");

    // FileInfo 实例方法
    FileInfo fiCopy = fi.CopyTo(Path.Combine(subDir, "from-fileinfo.txt"), overwrite: true);
    Console.WriteLine($"FileInfo.CopyTo: {fiCopy.Exists}");

    // === 5. DirectoryInfo 类 ===
    DirectoryInfo parentDir = new DirectoryInfo(tempRoot);
    Console.WriteLine($"\\n--- DirectoryInfo ---");
    Console.WriteLine($"目录名: {parentDir.Name}");
    Console.WriteLine($"父目录: {parentDir.Parent?.FullName}");
    Console.WriteLine($"是否存在: {parentDir.Exists}");
    Console.WriteLine($"创建时间: {parentDir.CreationTime:O}");

    // GetFiles：返回当前目录及子目录所有文件
    Console.WriteLine("\\n子文件列表（递归）:");
    foreach (FileInfo f in parentDir.GetFiles("*", SearchOption.AllDirectories))
    {
        Console.WriteLine($"  {f.FullName} ({f.Length} B)");
    }

    // GetDirectories：返回子目录
    Console.WriteLine("子目录列表:");
    foreach (DirectoryInfo d in parentDir.GetDirectories())
    {
        Console.WriteLine($"  {d.Name}");
    }

    // EnumerateFiles：延迟枚举，大目录更省内存
    Console.WriteLine("EnumerateFiles（延迟枚举）:");
    int fileCount = 0;
    foreach (FileInfo f in parentDir.EnumerateFiles("*", SearchOption.AllDirectories))
    {
        fileCount++;
    }
    Console.WriteLine($"  共 {fileCount} 个文件");

    // === 6. 设置文件属性 ===
    fi.Attributes |= FileAttributes.ReadOnly;  // 设为只读
    Console.WriteLine($"\\n设只读后 Attributes: {fi.Attributes}");
    fi.Attributes &= ~FileAttributes.ReadOnly; // 取消只读
    Console.WriteLine($"取消只读后 Attributes: {fi.Attributes}");
}
finally
{
    // 清理：递归删除整个临时目录树
    if (Directory.Exists(tempRoot))
    {
        Directory.Delete(tempRoot, recursive: true);
        Console.WriteLine($"\\n已清理临时目录: {tempRoot}");
    }
}`,
    lang: 'cs',
  },

  // ============================================================
  // 第五十二章：流与读写器
  // ============================================================
  {
    id: 'csharp4-ch52',
    group: '第八部分 文件 IO 与序列化',
    icon: '🌊',
    title: '流与读写器',
    content: `## 第五十三章　流与读写器

上一章的 \`File.ReadAllText\` 一次性把整个文件读进内存——文件小没问题，但如果是 10GB 的日志文件呢？应用直接 OOM 崩溃。这时候就需要**流（Stream）**：把数据看作连续的字节序列，按需读写一小块。

### 一、Stream 抽象类 ⭐

\`System.IO.Stream\` 是所有流的抽象基类，定义了流的核心契约：

| 属性 | 含义 |
| --- | --- |
| \`CanRead\` | 是否可读 |
| \`CanWrite\` | 是否可写 |
| \`CanSeek\` | 是否可定位（移动读写指针）|
| \`Position\` | 当前读写位置 |
| \`Length\` | 流的总长度 |
| \`CanTimeout\` | 是否支持超时 |

| 方法 | 含义 |
| --- | --- |
| \`Read(buf, offset, count)\` | 读字节到缓冲区，返回实际读取数 |
| \`Write(buf, offset, count)\` | 写缓冲区数据 |
| \`ReadByte()\` / \`WriteByte(b)\` | 读写单字节 |
| \`Seek(offset, origin)\` | 移动指针 |
| \`Flush()\` | 把缓冲区刷到下游 |
| \`CopyTo(other)\` / \`CopyToAsync\` | 把当前流复制到另一流 |
| \`SetLength(len)\` | 设置流长度 |

### 二、FileStream：文件流

\`FileStream\` 把文件包装成流，构造函数极其灵活：

\`\`\`csharp
new FileStream(
    path,
    FileMode.Create,         // 创建/打开/截断/追加
    FileAccess.Write,        // 读/写/读写
    FileShare.Read,          // 其他进程的共享权限
    bufferSize: 4096,        // 缓冲区大小
    FileOptions.Asynchronous // 启用异步 IO
);
\`\`\`

**FileMode 枚举**：
- \`CreateNew\`：新建，已存在则抛异常
- \`Create\`：新建，已存在则覆盖
- \`Open\`：打开，不存在则抛异常
- \`OpenOrCreate\`：打开或新建
- \`Truncate\`：打开并截断为 0 字节
- \`Append\`：打开并定位到末尾（只能写）

**FileShare 枚举**：控制其他进程能否同时读写——这是文件锁的关键。比如日志写入时设 \`FileShare.Read\`，允许其他进程读取但不能写。

### 三、MemoryStream：内存流

数据存在内存中的字节数组里，没有文件 IO 开销。适合：
- 序列化中间缓冲
- 图片缩放、压缩解压
- 不想落地的临时数据

\`\`\`csharp
using MemoryStream ms = new MemoryStream();
ms.Write(data, 0, data.Length);
ms.Position = 0;  // 写完读取前归零指针
byte[] all = ms.ToArray();  // 复制成新数组
\`\`\`

### 四、BufferedStream：缓冲流

包装其他流，给没有缓冲的流加上缓冲，减少 IO 次数。\`FileStream\` 自带缓冲，所以包装 \`FileStream\` 意义不大；包装 \`NetworkStream\` 才有用。

### 五、StreamReader / StreamWriter：按行读写文本

直接操作字节流很麻烦——还要自己处理编码、换行符。\`StreamReader\`/\`StreamWriter\` 把流包装成「文本流」，自动处理 UTF-8 等编码。

\`\`\`csharp
using StreamWriter sw = new StreamWriter("log.txt", append: true, Encoding.UTF8);
sw.WriteLine("写入一行");
sw.Flush();  // 主动刷缓冲

using StreamReader sr = new StreamReader("log.txt", Encoding.UTF8);
string? line;
while ((line = sr.ReadLine()) != null)
    Console.WriteLine(line);

// 一次性读完
string all = sr.ReadToEnd();
\`\`\`

**LeaveOpen 参数**：默认 Dispose 时会关闭底层流。如果你希望保留底层流（比如同一个 \`FileStream\` 多次包装），传 \`leaveOpen: true\`。

### 六、BinaryReader / BinaryWriter：二进制读写

把基础类型（int、double、string 等）按二进制格式读写。常用于自定义文件格式、网络协议。

\`\`\`csharp
using BinaryWriter bw = new BinaryWriter(fs);
bw.Write(42);            // 4 字节 int
bw.Write(3.14);          // 8 字节 double
bw.Write("hello");       // 长度前缀字符串
bw.Write(new byte[]{1,2,3});

using BinaryReader br = new BinaryReader(fs);
int n = br.ReadInt32();
double d = br.ReadDouble();
string s = br.ReadString();
byte[] arr = br.ReadBytes(3);
\`\`\`

⚠ **读取顺序必须和写入顺序完全一致**，否则数据错乱。

### 七、StringReader / StringWriter

把字符串当作流来读写，不需要文件 IO。适合解析多行文本、生成文本模板。

\`\`\`csharp
using StringReader sr = new StringReader("a\\nb\\nc");
string? line;
while ((line = sr.ReadLine()) != null) { /* ... */ }

using StringWriter sw = new StringWriter();
sw.WriteLine("生成 {0}", 123);
string result = sw.ToString();
\`\`\`

### 八、using 语句与释放资源

流持有非托管资源（文件句柄），**必须释放**。C# 提供两种语法：

\`\`\`csharp
// 老语法：using 语句块
using (FileStream fs = new FileStream(...))
{
    // ...
}  // 块结束自动 Dispose

// 新语法（C# 8+）：using 声明，超出作用域自动 Dispose
using FileStream fs = new FileStream(...);
// ...
\`\`\`

**最佳实践**：
1. 任何 \`Stream\` / \`StreamReader\` / \`BinaryReader\` 都用 \`using\` 包起来
2. 异步优先：\`ReadAsync\`/\`WriteAsync\`/\`CopyToAsync\`（下一章细讲）
3. 写入后别忘了 \`Flush\` 或让 Dispose 触发 flush

### 九、本章小结

- 大文件、网络数据 → \`Stream\` 体系
- 文本读写 → \`StreamReader\`/\`StreamWriter\`
- 二进制协议 → \`BinaryReader\`/\`BinaryWriter\`
- 内存缓冲 → \`MemoryStream\`
- **务必 using**，避免资源泄漏

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「流与读写器」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 —— 流与读写器全套演示
using System;
using System.IO;
using System.Text;

string tempFile = Path.Combine(Path.GetTempPath(), "csharp4-ch52-demo.txt");
string binFile = Path.Combine(Path.GetTempPath(), "csharp4-ch52-demo.bin");

try
{
    // === 1. FileStream + StreamWriter：按行写入 ===
    // 构造参数：路径、FileMode、FileAccess、FileShare、缓冲大小、FileOptions
    using FileStream fs = new FileStream(
        tempFile,
        FileMode.Create,              // 创建（已存在则覆盖）
        FileAccess.Write,             // 写权限
        FileShare.Read,               // 其他进程只读共享
        bufferSize: 4096,
        options: FileOptions.Asynchronous  // 启用异步 IO
    );

    // StreamWriter 包装 FileStream，按文本行写入
    // leaveOpen: true 表示 Dispose StreamWriter 时不关闭底层 FileStream
    using (StreamWriter sw = new StreamWriter(fs, Encoding.UTF8, bufferSize: 1024, leaveOpen: true))
    {
        sw.WriteLine("第一行：流写入测试");
        sw.WriteLine("第二行：C# 12 顶级语句");
        sw.WriteLine($"第三行：写入时间 {DateTime.Now:O}");
        sw.Flush();  // 把缓冲区数据主动刷到底层流
    }
    fs.Dispose();  // 显式关闭 FileStream（leaveOpen 时需要手动关）

    // === 2. StreamReader：按行读取 ===
    using (FileStream fsRead = new FileStream(tempFile, FileMode.Open, FileAccess.Read, FileShare.Read))
    using (StreamReader sr = new StreamReader(fsRead, Encoding.UTF8))
    {
        Console.WriteLine("--- StreamReader 逐行读取 ---");
        while (sr.Peek() >= 0)  // Peek 返回下一字符但不消费，-1 表示结束
        {
            string? line = sr.ReadLine();
            Console.WriteLine($"  {line}");
        }

        // Stream 属性演示
        Console.WriteLine($"CanRead: {fsRead.CanRead}");
        Console.WriteLine($"CanWrite: {fsRead.CanWrite}");
        Console.WriteLine($"CanSeek: {fsRead.CanSeek}");
        Console.WriteLine($"Length: {fsRead.Length}, Position: {fsRead.Position}");
    }

    // === 3. Stream 基础操作：ReadByte / WriteByte / Seek / CopyTo ===
    using (FileStream fs2 = new FileStream(tempFile, FileMode.Open, FileAccess.ReadWrite))
    {
        Console.WriteLine("\\n--- Stream 字节操作 ---");
        // Seek：移动读写指针
        fs2.Seek(0, SeekOrigin.Begin);
        int firstByte = fs2.ReadByte();  // 读一个字节，到末尾返回 -1
        Console.WriteLine($"首字节: 0x{firstByte:X2} ('{(char)firstByte}')");

        // 直接设置 Position
        fs2.Position = 0;
        byte[] buffer = new byte[32];
        int read = fs2.Read(buffer, 0, buffer.Length);  // 读到 buffer
        Console.WriteLine($"读取 {read} 字节: {Encoding.UTF8.GetString(buffer, 0, read).TrimEnd()}");

        // CopyTo：把当前流复制到另一个流
        using MemoryStream ms = new MemoryStream();
        fs2.Position = 0;
        fs2.CopyTo(ms);  // 同步复制
        Console.WriteLine($"CopyTo 后内存流长度: {ms.Length}");

        // CopyToAsync：异步复制（推荐用于 IO 密集场景）
        using MemoryStream ms2 = new MemoryStream();
        fs2.Position = 0;
        fs2.CopyToAsync(ms2).Wait();
        Console.WriteLine($"CopyToAsync 后内存流长度: {ms2.Length}");
    }

    // === 4. BinaryWriter / BinaryReader：二进制读写 ===
    using (FileStream bfs = new FileStream(binFile, FileMode.Create, FileAccess.Write))
    using (BinaryWriter bw = new BinaryWriter(bfs, Encoding.UTF8))
    {
        bw.Write(42);                              // Int32：4 字节
        bw.Write(3.14);                            // Double：8 字节
        bw.Write(true);                            // Boolean：1 字节
        bw.Write("你好 BinaryWriter");             // 长度前缀字符串
        bw.Write(new byte[] { 1, 2, 3, 4, 5 });    // 字节数组
        bw.Flush();
    }

    using (FileStream bfs = new FileStream(binFile, FileMode.Open, FileAccess.Read))
    using (BinaryReader br = new BinaryReader(bfs, Encoding.UTF8))
    {
        Console.WriteLine("\\n--- BinaryReader 读取（必须按写入顺序）---");
        int n = br.ReadInt32();
        double d = br.ReadDouble();
        bool b = br.ReadBoolean();
        string s = br.ReadString();
        byte[] arr = br.ReadBytes(5);
        Console.WriteLine($"int={n}, double={d}, bool={b}");
        Console.WriteLine($"string={s}, bytes=[{string.Join(",", arr)}]");
    }

    // === 5. MemoryStream：内存流 ===
    using (MemoryStream ms = new MemoryStream())
    {
        byte[] data = Encoding.UTF8.GetBytes("Hello MemoryStream");
        ms.Write(data, 0, data.Length);
        ms.Position = 0;  // 写完读取前归零指针

        byte[] readBuf = new byte[ms.Length];
        ms.Read(readBuf, 0, readBuf.Length);
        Console.WriteLine($"\\nMemoryStream 内容: {Encoding.UTF8.GetString(readBuf)}");

        // ToArray：把整个流复制为新数组（即使 Position 不为 0 也返回全部）
        byte[] allBytes = ms.ToArray();
        Console.WriteLine($"ToArray 长度: {allBytes.Length}");
    }

    // === 6. StringReader / StringWriter：字符串作为流 ===
    string multiLine = "姓名:张三\\n年龄:28\\n城市:北京";
    using StringReader stringReader = new StringReader(multiLine);
    Console.WriteLine("\\n--- StringReader ---");
    string? line2;
    while ((line2 = stringReader.ReadLine()) != null)
    {
        Console.WriteLine($"  {line2}");
    }

    using StringWriter stringWriter = new StringWriter();
    stringWriter.WriteLine("由 StringWriter 生成");
    stringWriter.WriteLine("支持格式化: {0:N2}", 12345.6789);
    Console.WriteLine($"\\nStringWriter 输出:\\n{stringWriter}");

    // === 7. FileShare 演示：共享读写 ===
    // 第一个进程以 FileShare.ReadWrite 打开，允许其他进程同时读写
    using (FileStream sharedFs = new FileStream(
        tempFile, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
    {
        Console.WriteLine("\\n以共享模式打开文件成功");
        Console.WriteLine($"共享流 Position: {sharedFs.Position}");
    }
}
finally
{
    if (File.Exists(tempFile)) File.Delete(tempFile);
    if (File.Exists(binFile)) File.Delete(binFile);
    Console.WriteLine("\\n已清理临时文件");
}`,
    lang: 'cs',
  },

  // ============================================================
  // 第五十三章：JSON 序列化
  // ============================================================
  {
    id: 'csharp4-ch53',
    group: '第八部分 文件 IO 与序列化',
    icon: '📝',
    title: 'JSON 序列化',
    content: `## 第五十四章　JSON 序列化

JSON 是现代 API 的事实标准——REST 接口、配置文件、NoSQL 数据库，到处都是。.NET 8 内置 \`System.Text.Json\`，性能比 Newtonsoft.Json 快 2-5 倍，且支持 AOT。本章系统讲透 JSON 处理的方方面面。

### 一、System.Text.Json vs Newtonsoft.Json ⭐

| 对比项 | System.Text.Json | Newtonsoft.Json |
| --- | --- | --- |
| 性能 | 快 2-5 倍 | 基准 |
| 内置 | .NET 8 自带 | 需 NuGet |
| AOT | 支持（Source Generator）| 不支持 |
| 功能 | 略少，但够用 | 功能最全 |
| 默认行为 | 严格（区分大小写、不允许多余字段）| 宽松 |

新项目优先 \`System.Text.Json\`，仅在需要特殊功能（如复杂的动态 JSON）时才考虑 Newtonsoft。

### 二、基础：Serialize / Deserialize

\`\`\`csharp
public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public Address? Home { get; set; }
}
public class Address
{
    public string City { get; set; } = "";
}

User u = new User { Id = 1, Name = "张三", Home = new Address { City = "北京" } };

// 序列化
string json = JsonSerializer.Serialize(u);

// 反序列化
User? parsed = JsonSerializer.Deserialize<User>(json);
\`\`\`

默认行为：属性名原样输出（PascalCase）、不缩进、严格大小写。

### 三、JsonSerializerOptions

\`\`\`csharp
var options = new JsonSerializerOptions
{
    WriteIndented = true,                                    // 美化缩进
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,  // 属性名转 camelCase
    PropertyNameCaseInsensitive = true,                      // 反序列化大小写不敏感
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,  // null 不输出
    AllowTrailingCommas = true,                              // 允许尾随逗号
    ReadCommentHandling = JsonCommentHandling.Skip,          // 跳过注释
    WriteIndented = true,
};
options.Converters.Add(new JsonStringEnumConverter());  // 枚举转字符串
\`\`\`

⚠ 建议把 \`JsonSerializerOptions\` 做成单例缓存复用，每次 \`new\` 会重新解析特性、影响性能。

### 四、常用特性

| 特性 | 作用 |
| --- | --- |
| \`[JsonPropertyName("email")]\` | 指定 JSON 字段名 |
| \`[JsonIgnore]\` | 序列化时忽略 |
| \`[JsonConverter(typeof(X))]\` | 字段级指定 converter |
| \`[JsonNumberHandling(AllowReadingFromString)]\` | 数字字段允许从字符串读 |
| \`[JsonExtensionData("Extra")]\` | 多余字段塞进字典 |
| \`[JsonRequired]\` | 反序列化时必须存在 |

### 五、JsonSerializerContext：Source Generator

普通反射序列化在 AOT 场景（如 Native AOT 发布）会失败。Source Generator 在**编译时**生成序列化代码，启动更快、内存更省、支持 AOT。

\`\`\`csharp
[JsonSourceGenerationOptions(WriteIndented = true)]
[JsonSerializable(typeof(User))]
[JsonSerializable(typeof(List<User>))]
public partial class AppJsonContext : JsonSerializerContext { }

// 使用
string json = JsonSerializer.Serialize(user, AppJsonContext.Default.User);
\`\`\`

### 六、动态 JSON：JsonNode / JsonObject / JsonArray

不预定义类型，直接动态访问：

\`\`\`csharp
JsonNode node = JsonNode.Parse(jsonString)!;
string name = (string)node["name"]!;
int age = (int)node["age"]!;
string city = (string)node["home"]?["city"]!;  // 嵌套访问

// 构造动态 JSON
JsonObject obj = new JsonObject
{
    ["product"] = "Book",
    ["price"] = 99.5,
    ["tags"] = new JsonArray("a", "b"),
};
obj["inStock"] = true;
string json = obj.ToJsonString();
\`\`\`

### 七、JsonDocument：只读解析

比 \`JsonNode\` 更省内存（不会为每个节点创建对象），适合「只读不改」的解析：

\`\`\`csharp
using JsonDocument doc = JsonDocument.Parse(json);
JsonElement root = doc.RootElement;
string name = root.GetProperty("name").GetString()!;
foreach (JsonElement tag in root.GetProperty("tags").EnumerateArray())
    Console.WriteLine(tag.GetString());
\`\`\`

注意：\`JsonElement\` 的生命周期绑定 \`JsonDocument\`，离开 \`using\` 后访问会抛异常。需要保留时调用 \`Clone()\`。

### 八、Utf8JsonReader / Utf8JsonWriter：低级 API

直接操作 UTF-8 字节，零分配、零字符串拷贝。适合超高吞吐场景（数据库、消息队列）。

\`\`\`csharp
using MemoryStream ms = new();
using Utf8JsonWriter writer = new(ms);
writer.WriteStartObject();
writer.WriteString("name", "张三");
writer.WriteNumber("age", 28);
writer.WriteEndObject();
writer.Flush();
\`\`\`

### 九、自定义 JsonConverter<T\`

处理内置不支持的类型，或自定义格式。比如让 \`DateTime\` 只输出日期：

\`\`\`csharp
public class DateOnlyConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader r, Type t, JsonSerializerOptions o)
        => DateTime.Parse(r.GetString()!);
    public override void Write(Utf8JsonWriter w, DateTime v, JsonSerializerOptions o)
        => w.WriteStringValue(v.ToString("yyyy-MM-dd"));
}

// 注册：options.Converters.Add(new DateOnlyConverter());
// 或字段级：[JsonConverter(typeof(DateOnlyConverter))]
\`\`\`

### 十、循环引用与多态

**循环引用**：对象互相引用会导致 \`StackOverflow\`。.NET 8 提供两种策略：

\`\`\`csharp
new JsonSerializerOptions
{
    ReferenceHandler = ReferenceHandler.Preserve  // 输出 $id/$ref 元数据
    // 或 ReferenceHandler.IgnoreCycles  // 检测到循环时输出 null
};
\`\`\`

**多态**：基类序列化时输出派生类信息：

\`\`\`csharp
[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(Dog), "dog")]
[JsonDerivedType(typeof(Cat), "cat")]
public abstract class Animal { }
\`\`\`

序列化时自动加 \`"type": "dog"\`，反序列化时根据该字段创建正确类型。

### 十一、本章小结

- 简单场景 → \`JsonSerializer.Serialize/Deserialize\`
- 性能 + AOT → \`JsonSerializerContext\`
- 动态 JSON → \`JsonNode\` / \`JsonDocument\`
- 极致性能 → \`Utf8JsonReader/Writer\`
- 自定义格式 → \`JsonConverter<T>\`

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「JSON 序列化」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 —— System.Text.Json 全套演示
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using System.Text;
using System.IO;

// === 顶级语句区 ===
User user = new User
{
    Id = 1001,
    Name = "张三",
    Email = "zhangsan@example.com",
    Password = "should-not-serialize",  // 会被 JsonIgnore 忽略
    Age = 28,
    Home = new Address { City = "北京", ZipCode = "100000" },
    Tags = new List<string> { "vip", "active" },
    CreatedAt = new DateTime(2026, 7, 19),
};

// === 1. JsonSerializerOptions 基础配置 ===
JsonSerializerOptions options = new JsonSerializerOptions
{
    WriteIndented = true,                                    // 美化缩进
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,       // camelCase
    PropertyNameCaseInsensitive = true,                      // 反序列化大小写不敏感
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,  // null 不输出
    AllowTrailingCommas = true,
    ReadCommentHandling = JsonCommentHandling.Skip,
};
options.Converters.Add(new DateOnlyConverter());  // 注册自定义 converter

// === 2. 序列化 ===
string json = JsonSerializer.Serialize(user, options);
Console.WriteLine("--- 序列化结果 ---");
Console.WriteLine(json);

// === 3. 反序列化（含数字从字符串读取）===
string jsonInput = """
{
  "id": 2002,
  "name": "李四",
  "email": "lisi@example.com",
  "age": "35",
  "home": { "city": "上海", "zipCode": "200000" },
  "tags": ["normal"],
  "createdAt": "2026-08-01"
}
""";
User? user2 = JsonSerializer.Deserialize<User>(jsonInput, options);
Console.WriteLine("\\n--- 反序列化结果 ---");
Console.WriteLine($"Id={user2?.Id}, Name={user2?.Name}, Age={user2?.Age}");
Console.WriteLine($"City={user2?.Home.City}, ZipCode={user2?.Home.ZipCode}");

// === 4. Source Generator 路径（AOT 友好，性能最高）===
string jsonSG = JsonSerializer.Serialize(user, AppJsonContext.Default.User);
Console.WriteLine("\\n--- Source Generator 序列化 ---");
Console.WriteLine(jsonSG);

User? userSG = JsonSerializer.Deserialize(jsonSG, AppJsonContext.Default.User);
Console.WriteLine($"SG 反序列化: {userSG?.Name}");

// === 5. JsonNode：动态访问 JSON（无需预定义类型）===
Console.WriteLine("\\n--- JsonNode 动态访问 ---");
JsonNode node = JsonNode.Parse(jsonInput)!;
Console.WriteLine($"name = {node?["name"]?.AsValue()}");
Console.WriteLine($"age = {node?["age"]?.AsValue()}");
Console.WriteLine($"home.city = {node?["home"]?["city"]?.AsValue()}");

// 构造动态 JSON
JsonObject dynObj = new JsonObject
{
    ["product"] = "Book",
    ["price"] = 99.5,
    ["tags"] = new JsonArray("csharp", "programming"),
    ["inStock"] = true,
};
dynObj["discount"] = 0.8;
Console.WriteLine($"动态 JSON: {dynObj.ToJsonString()}");

// === 6. JsonDocument：只读解析（比 JsonNode 更省内存）===
Console.WriteLine("\\n--- JsonDocument 只读解析 ---");
using (JsonDocument doc = JsonDocument.Parse(jsonInput))
{
    JsonElement root = doc.RootElement;
    Console.WriteLine($"id = {root.GetProperty("id").GetInt32()}");
    Console.WriteLine($"name = {root.GetProperty("name").GetString()}");
    Console.WriteLine("tags 数组:");
    foreach (JsonElement tag in root.GetProperty("tags").EnumerateArray())
    {
        Console.WriteLine($"  - {tag.GetString()}");
    }
    // TryGetProperty：避免抛异常
    if (root.TryGetProperty("missing", out JsonElement missing))
        Console.WriteLine($"missing exists: {missing}");
    else
        Console.WriteLine("missing 字段不存在");
}

// === 7. Utf8JsonWriter：低级 API，最高性能 ===
Console.WriteLine("\\n--- Utf8JsonWriter 低级 API ---");
using MemoryStream ms = new MemoryStream();
using Utf8JsonWriter writer = new Utf8JsonWriter(ms, new JsonWriterOptions { Indented = true });
writer.WriteStartObject();
writer.WriteString("event", "user.signup");
writer.WriteNumber("userId", 9999);
writer.WriteStartArray("features");
writer.WriteStringValue("auth");
writer.WriteStringValue("profile");
writer.WriteEndArray();
writer.WriteNull("deprecated");
writer.WriteEndObject();
writer.Flush();
Console.WriteLine(Encoding.UTF8.GetString(ms.ToArray()));

// === 8. 循环引用处理 ===
Console.WriteLine("\\n--- 循环引用处理 ---");
Node a = new Node { Name = "A" };
Node b = new Node { Name = "B" };
a.Next = b;
b.Next = a;  // 循环
JsonSerializerOptions cycleOpts = new JsonSerializerOptions
{
    ReferenceHandler = ReferenceHandler.IgnoreCycles,  // 检测到循环输出 null
    WriteIndented = true,
};
string cycleJson = JsonSerializer.Serialize(a, cycleOpts);
Console.WriteLine(cycleJson);

// === 类型定义区 ===
public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = "";

    [JsonPropertyName("email")]  // JSON 字段名小写
    public string Email { get; set; } = "";

    [JsonIgnore]  // 序列化时忽略
    public string Password { get; set; } = "";

    [JsonNumberHandling(JsonNumberHandling.AllowReadingFromString)]
    public int Age { get; set; }  // 允许从字符串读数字

    public Address Home { get; set; } = new();
    public List<string> Tags { get; set; } = new();

    [JsonConverter(typeof(DateOnlyConverter))]  // 字段级 converter
    public DateTime CreatedAt { get; set; }
}

public class Address
{
    public string City { get; set; } = "";
    public string ZipCode { get; set; } = "";
}

// 自定义 Converter：DateTime 只输出日期
public class DateOnlyConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return DateTime.Parse(reader.GetString()!);  // 解析 "yyyy-MM-dd"
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString("yyyy-MM-dd"));  // 只写日期
    }
}

// Source Generator Context（编译时生成，AOT 友好）
[JsonSourceGenerationOptions(WriteIndented = true, PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
[JsonSerializable(typeof(User))]
[JsonSerializable(typeof(List<User>))]
public partial class AppJsonContext : JsonSerializerContext { }

// 循环引用测试类型
public class Node
{
    public string Name { get; set; } = "";
    public Node? Next { get; set; }
}`,
    lang: 'cs',
  },

  // ============================================================
  // 第五十四章：XML 与 CSV 处理
  // ============================================================
  {
    id: 'csharp4-ch54',
    group: '第八部分 文件 IO 与序列化',
    icon: '🔧',
    title: 'XML 与 CSV 处理',
    content: `## 第五十五章　XML 与 CSV 处理

虽然 JSON 已经是主流，但 XML 仍广泛存在于配置文件（.csproj、web.config）、SOAP 协议、Office 文档（.docx 本质是 XML）、SVG 图形等场景。CSV 则是数据导出/导入最简单的格式。本章讲透这两类数据处理。

### 一、XML 处理的几种方式 ⭐

| API | 风格 | 适用场景 |
| --- | --- | --- |
| \`XmlDocument\` | DOM（文档对象模型）| 需要随机修改 XML 节点 |
| \`XDocument\` / \`XElement\` | LINQ to XML | 推荐！创建、查询、修改都方便 |
| \`XmlReader\` / \`XmlWriter\` | 流式 | 大文件、高性能、低内存 |
| \`XmlSerializer\` | 对象绑定 | 配置文件、协议序列化 |

新代码**优先 \`XDocument\`**，老旧 DOM 用 \`XmlDocument\`，超大文件用 \`XmlReader\`。

### 二、XDocument / XElement：函数式构建

\`XDocument\` 是 LINQ to XML 的核心，构建 XML 像写 HTML 一样直观：

\`\`\`csharp
XDocument doc = new XDocument(
    new XDeclaration("1.0", "utf-8", "yes"),
    new XElement("Library",
        new XAttribute("version", "2.0"),
        new XElement("Book",
            new XElement("Title", "C# 入门"),
            new XElement("Price", "99.5"),
            new XAttribute("isbn", "978-0001")
        )
    )
);
doc.Save("lib.xml");
\`\`\`

这种「构造函数嵌套」叫**函数式构建**，比 \`XmlDocument\` 的 \`CreateElement\` + \`AppendChild\` 简洁太多。

### 三、XDocument 查询（LINQ to XML）

\`\`\`csharp
XDocument loaded = XDocument.Load("lib.xml");

// Descendants：递归找所有 Book
var books = loaded.Descendants("Book");

// LINQ 查询
var expensive = from b in loaded.Descendants("Book")
                where (decimal)b.Element("Price") > 100
                select (string)b.Element("Title");

// 单个元素
string? title = loaded.Descendants("Title").FirstOrDefault()?.Value;

// 属性
string? isbn = book.Attribute("isbn")?.Value;
\`\`\`

### 四、XPath 查询

XDocument 也支持 XPath（需要 \`using System.Xml.XPath;\`）：

\`\`\`csharp
var results = loaded.XPathSelectElements("/Library/Book[Price>100]");
var titles = loaded.XPathSelectElements("//Title");
\`\`\`

XPath 适合复杂查询，但 LINQ 通常更易读。

### 五、XDocument 修改

\`\`\`csharp
XElement book = loaded.Descendants("Book").First();
book.Element("Price")!.Value = "109.0";   // 修改值
book.Add(new XElement("Stock", 100));      // 添加子节点
book.Attribute("isbn")!.Remove();          // 删除属性
book.SetElementValue("Price", 109.0);      // 安全修改
\`\`\`

### 六、XmlReader / XmlWriter：流式

处理超大 XML（>100MB）时，\`XDocument.Load\` 会把整个文档读进内存。用 \`XmlReader\` 流式读、\`XmlWriter\` 流式写，内存恒定：

\`\`\`csharp
using XmlReader reader = XmlReader.Create("big.xml");
while (reader.Read())
{
    if (reader.NodeType == XmlNodeType.Element && reader.Name == "Book")
    {
        string title = reader.ReadElementContentAsString();
        // 处理单条记录
    }
}

using XmlWriter writer = XmlWriter.Create("out.xml", new XmlWriterOptions { Indent = true });
writer.WriteStartDocument();
writer.WriteStartElement("Root");
writer.WriteElementString("Name", "张三");
writer.WriteEndElement();
writer.WriteEndDocument();
\`\`\`

### 七、XmlSerializer：对象 ↔ XML

把对象直接序列化成 XML，适合配置文件、SOAP 协议：

\`\`\`csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    [XmlAttribute] public string Code { get; set; } = "";  // 输出为属性
    [XmlIgnore] public string Secret { get; set; } = "";    // 忽略
}

var serializer = new XmlSerializer(typeof(Product));
using FileStream fs = File.Create("p.xml");
serializer.Serialize(fs, product);
\`\`\`

### 八、CSV 处理：纯原生方案

CSV 最简单——逗号分隔，行分隔。但坑在「字段内含逗号、引号、换行」需要转义。

**简单方案**（适合规整数据）：

\`\`\`csharp
// 写
File.WriteAllLines("data.csv", records.Select(r => $"{r.Id},{r.Name},{r.Score}"));

// 读
foreach (string line in File.ReadAllLines("data.csv").Skip(1))  // 跳过表头
{
    string[] parts = line.Split(',');
    int id = int.Parse(parts[0]);
    string name = parts[1];
}
\`\`\`

⚠ \`Split(',')\` 不处理引号转义。生产环境推荐用 **CsvHelper**：

\`\`\`bash
dotnet add package CsvHelper
\`\`\`

\`\`\`csharp
using CsvHelper;
using var writer = new StreamWriter("data.csv");
using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
csv.WriteRecords(records);
\`\`\`

CsvHelper 自动处理引号、转义、表头映射、类型转换，是 .NET 生态最成熟的 CSV 库。

### 九、System.Text.Json vs Newtonsoft.Json

| 维度 | System.Text.Json | Newtonsoft.Json |
| --- | --- | --- |
| 性能 | 快 2-5 倍 | 基准 |
| AOT | ✅ 支持 | ❌ |
| 内置 | .NET 8 自带 | NuGet |
| 灵活度 | 中等 | 最灵活 |
| 推荐 | 新项目 | 老项目、特殊需求 |

### 十、本章小结

- 新写 XML → \`XDocument\`（函数式构建 + LINQ 查询）
- 大 XML → \`XmlReader\` / \`XmlWriter\` 流式
- 配置绑定 → \`XmlSerializer\`
- 简单 CSV → \`Split(',')\`；生产 → \`CsvHelper\`

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「XML 与 CSV 处理」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 —— XML 与 CSV 处理全套演示
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Xml;
using System.Xml.Linq;
using System.Xml.Serialization;
using System.Xml.XPath;

string xmlFile = Path.Combine(Path.GetTempPath(), "csharp4-ch54-demo.xml");
string csvFile = Path.Combine(Path.GetTempPath(), "csharp4-ch54-demo.csv");

try
{
    // === 1. XDocument：函数式构建 XML（推荐方式）===
    XDocument doc = new XDocument(
        new XDeclaration("1.0", "utf-8", "yes"),
        new XElement("Library",
            new XAttribute("version", "2.0"),
            new XAttribute("updated", DateTime.Now.ToString("O")),
            new XElement("Book",
                new XElement("Title", "C# 入门到精通"),
                new XElement("Author", "张三"),
                new XElement("Price", "99.5"),
                new XAttribute("isbn", "978-0001")
            ),
            new XElement("Book",
                new XElement("Title", ".NET 性能优化"),
                new XElement("Author", "李四"),
                new XElement("Price", "129.0"),
                new XAttribute("isbn", "978-0002")
            ),
            new XElement("Book",
                new XElement("Title", "ASP.NET Core 实战"),
                new XElement("Author", "王五"),
                new XElement("Price", "89.0"),
                new XAttribute("isbn", "978-0003")
            )
        )
    );
    doc.Save(xmlFile);
    Console.WriteLine($"XML 已保存: {xmlFile}");

    // === 2. XDocument 查询（LINQ to XML）===
    XDocument loaded = XDocument.Load(xmlFile);
    Console.WriteLine("\\n--- 所有书籍 ---");
    foreach (var book in loaded.Descendants("Book"))
    {
        Console.WriteLine($"  {book.Element("Title")?.Value} | {book.Element("Author")?.Value} | ¥{book.Element("Price")?.Value} | ISBN:{book.Attribute("isbn")?.Value}");
    }

    // LINQ 查询：价格大于 100 的书
    var expensive = from b in loaded.Descendants("Book")
                    where decimal.Parse(b.Element("Price")!.Value) > 100
                    select new
                    {
                        Title = (string)b.Element("Title")!,
                        Price = (decimal)b.Element("Price")!
                    };
    Console.WriteLine("\\n--- 价格 > 100 ---");
    foreach (var b in expensive)
        Console.WriteLine($"  {b.Title}: ¥{b.Price}");

    // === 3. XPath 查询（适合复杂路径）===
    Console.WriteLine("\\n--- XPath 查询 ---");
    var xpathResults = loaded.XPathSelectElements("/Library/Book[Price>100]");
    foreach (var b in xpathResults)
        Console.WriteLine($"  XPath: {b.Element("Title")?.Value}");

    var allTitles = loaded.XPathSelectElements("//Title");
    Console.WriteLine($"XPath //Title 共 {allTitles.Count()} 个");

    // === 4. XDocument.Parse：从字符串解析 ===
    string xmlString = """<Person><Name>赵六</Name><Age>40</Age><City>广州</City></Person>""";
    XElement person = XElement.Parse(xmlString);
    Console.WriteLine($"\\nParse 结果: {person.Element("Name")?.Value}, {person.Element("Age")?.Value}岁");

    // === 5. XDocument 修改 ===
    XElement firstBook = loaded.Descendants("Book").First();
    firstBook.Element("Price")!.Value = "109.0";        // 修改值
    firstBook.Add(new XElement("Stock", 50));            // 添加子节点
    firstBook.SetAttributeValue("onSale", "true");       // 添加属性
    loaded.Save(xmlFile);
    Console.WriteLine("\\n--- 修改后第一本书 ---");
    Console.WriteLine(firstBook.ToString());

    // === 6. XmlReader：流式读取（高性能、低内存）===
    Console.WriteLine("\\n--- XmlReader 流式读取 ---");
    using (XmlReader reader = XmlReader.Create(xmlFile))
    {
        while (reader.Read())
        {
            // 只关心 Element 节点
            if (reader.NodeType == XmlNodeType.Element)
            {
                if (reader.Name == "Title")
                {
                    string title = reader.ReadElementContentAsString();
                    Console.WriteLine($"  Title: {title}");
                }
                else if (reader.Name == "Book")
                {
                    string? isbn = reader.GetAttribute("isbn");
                    Console.WriteLine($"  [Book] isbn={isbn}");
                }
            }
        }
    }

    // === 7. XmlWriter：流式写入 ===
    string xmlWriterFile = Path.Combine(Path.GetTempPath(), "csharp4-ch54-writer.xml");
    XmlWriterSettings ws = new XmlWriterSettings
    {
        Indent = true,
        Encoding = System.Text.Encoding.UTF8,
    };
    using (XmlWriter xw = XmlWriter.Create(xmlWriterFile, ws))
    {
        xw.WriteStartDocument();
        xw.WriteStartElement("Catalog");
        xw.WriteStartElement("Item");
        xw.WriteAttributeString("id", "1");
        xw.WriteElementString("Name", "商品A");
        xw.WriteElementString("Price", "19.9");
        xw.WriteEndElement();
        xw.WriteEndElement();
        xw.WriteEndDocument();
    }
    Console.WriteLine($"\\nXmlWriter 写入完成");
    File.Delete(xmlWriterFile);

    // === 8. XmlSerializer：对象 ↔ XML ===
    var product = new Product
    {
        Id = 1,
        Name = "机械键盘",
        Code = "KB-001",
        Price = 299.0m,
        Secret = "should-not-serialize"
    };
    var serializer = new XmlSerializer(typeof(Product));
    string xmlSerFile = Path.Combine(Path.GetTempPath(), "csharp4-ch54-ser.xml");
    using (FileStream fs = File.Create(xmlSerFile))
    {
        serializer.Serialize(fs, product);
    }
    Console.WriteLine($"\\n--- XmlSerializer ---");
    Console.WriteLine(File.ReadAllText(xmlSerFile));

    using (FileStream fs = File.OpenRead(xmlSerFile))
    {
        var p = (Product?)serializer.Deserialize(fs);
        Console.WriteLine($"反序列化: Id={p?.Id}, Name={p?.Name}, Code={p?.Code}, Price={p?.Price}");
    }
    File.Delete(xmlSerFile);

    // === 9. CSV 读写：纯原生方案 ===
    var students = new List<Student>
    {
        new(1, "张三", 90.5),
        new(2, "李四", 85.0),
        new(3, "王五", 92.3),
    };

    // 写 CSV：手动拼接表头 + 数据行
    var lines = new List<string> { "Id,Name,Score" };
    foreach (var s in students)
    {
        // 注意：含逗号/引号的字段需要加引号转义，这里演示简单场景
        lines.Add($"{s.Id},{s.Name},{s.Score.ToString(CultureInfo.InvariantCulture)}");
    }
    File.WriteAllLines(csvFile, lines);
    Console.WriteLine($"\\n--- CSV 已写入: {csvFile} ---");

    // 读 CSV：跳过表头后 Split 解析
    Console.WriteLine("--- 读取 CSV ---");
    string[] csvLines = File.ReadAllLines(csvFile);
    foreach (string line in csvLines.Skip(1))  // 跳过表头
    {
        string[] parts = line.Split(',');
        int id = int.Parse(parts[0]);
        string name = parts[1];
        double score = double.Parse(parts[2], CultureInfo.InvariantCulture);
        Console.WriteLine($"  Id={id}, Name={name}, Score={score:F1}");
    }

    Console.WriteLine("\\n注意：Split 方案不处理引号转义，生产环境推荐 CsvHelper 库");
}
finally
{
    if (File.Exists(xmlFile)) File.Delete(xmlFile);
    if (File.Exists(csvFile)) File.Delete(csvFile);
    Console.WriteLine("\\n已清理临时文件");
}

// === 类型定义区 ===
public class Product
{
    public int Id { get; set; }

    [XmlElement("ProductName")]  // 自定义 XML 元素名
    public string Name { get; set; } = "";

    [XmlAttribute]  // 输出为 XML 属性而非元素
    public string Code { get; set; } = "";

    public decimal Price { get; set; }

    [XmlIgnore]  // 序列化时忽略
    public string Secret { get; set; } = "";
}

public record Student(int Id, string Name, double Score);`,
    lang: 'cs',
  },

  // ============================================================
  // 第五十五章：高性能 IO 与管道
  // ============================================================
  {
    id: 'csharp4-ch55',
    group: '第八部分 文件 IO 与序列化',
    icon: '⚡',
    title: '高性能 IO 与管道',
    content: `## 第五十六章　高性能 IO 与管道

前几章的 API 够用 90% 场景。但当你处理 GB 级文件、万级并发、毫秒级延迟时，就需要本章的高级技巧：异步 IO、内存池、Span、Pipelines、内存映射。

### 一、异步文件 IO ⭐

同步 IO 会阻塞线程，高并发下线程池被耗尽。异步 IO 让线程在等待磁盘时去处理其他任务。

\`\`\`csharp
// 异步一次性 API
string text = await File.ReadAllTextAsync("big.txt");
string[] lines = await File.ReadAllLinesAsync("big.txt");
byte[] bytes = await File.ReadAllBytesAsync("big.bin");
await File.WriteAllTextAsync("out.txt", "content");
await File.AppendAllLinesAsync("log.txt", new[] { "line1", "line2" });

// 流式异步
using FileStream fs = new FileStream("big.txt", FileMode.Open,
    FileAccess.Read, FileShare.Read, 4096, FileOptions.Asynchronous);
using StreamReader sr = new StreamReader(fs);
string? line;
while ((line = await sr.ReadLineAsync()) != null)
    ProcessLine(line);
\`\`\`

⚠ **关键**：构造 \`FileStream\` 时一定要传 \`FileOptions.Asynchronous\`，否则 \`ReadAsync\` 实际是「同步读 + 假装异步」，反而更慢。

### 二、ArrayPool<T>：避免分配

每次 \`new byte[4096]\` 都会在堆上分配 4KB，频繁分配触发 GC。\`ArrayPool\` 是共享的数组池：

\`\`\`csharp
byte[] buffer = ArrayPool<byte>.Shared.Rent(4096);  // 租用（可能比请求大）
try
{
    int read = await fs.ReadAsync(buffer.AsMemory(0, 4096));
    // 使用 buffer...
}
finally
{
    ArrayPool<byte>.Shared.Return(buffer);  // 必须归还，否则内存泄漏
}
\`\`\`

⚠ 注意：
1. \`Rent(4096)\` 返回的数组可能 **大于** 4096，使用时只用前 4096 字节
2. \`Return\` 后**绝对不能**再访问该数组
3. 嵌套调用要小心，避免在不同线程间共享租用数组

### 三、Span<byte> / Memory<byte>：零拷贝切片

\`Span<T>\` 是连续内存的「视图」，切片不复制数据，零开销：

\`\`\`csharp
byte[] data = new byte[100];
Span<byte> all = data;                    // 数组 → Span，零拷贝
Span<byte> first10 = all.Slice(0, 10);    // 切片，零拷贝
ReadOnlySpan<byte> ro = all;              // 只读视图

// 从 Stream 异步读到 Memory
Memory<byte> mem = buffer.AsMemory(0, 4096);
int read = await fs.ReadAsync(mem);

// Span 不能跨 await，Memory 可以
\`\`\`

**Span vs Memory**：
- \`Span<T>\`：栈上结构，**不能**作为字段、不能跨 \`await\`、不能装箱
- \`Memory<T>\`：堆上结构，可以跨 \`await\`、可以作字段

### 四、RandomAccess：零拷贝文件 IO（.NET 6+）

\`FileStream\` 内部有缓冲，每次 \`Read\` 都过缓冲。如果只想读指定位置的数据，\`RandomAccess\` 直接调用操作系统 API，无缓冲：

\`\`\`csharp
using SafeFileHandle handle = File.OpenHandle("big.bin",
    FileMode.Open, FileAccess.Read, FileShare.Read, FileOptions.Asynchronous);

long length = RandomAccess.GetLength(handle);
int read = await RandomAccess.ReadAsync(handle, buffer.AsMemory(0, 4096), offset: 1024);
await RandomAccess.WriteAsync(handle, data, offset: 0);
\`\`\`

适合：数据库实现、按需读取大文件指定区段、并发读不同位置。

### 五、System.IO.Pipelines：高性能管道

\`Pipe\` 是为高吞吐 IO 设计的「生产者-消费者」模型。生产者写数据到 \`PipeWriter\`，消费者从 \`PipeReader\` 读，自动管理缓冲区：

\`\`\`csharp
Pipe pipe = new Pipe();

// 生产者：从网络/文件读数据
async Task Producer()
{
    PipeWriter writer = pipe.Writer;
    Memory<byte> buf = writer.GetMemory(4096);
    int read = await stream.ReadAsync(buf);
    writer.Advance(read);              // 告诉 writer 写入了多少
    await writer.FlushAsync();         // 通知 reader
    await writer.CompleteAsync();      // 通知 EOF
}

// 消费者：处理数据
async Task Consumer()
{
    while (true)
    {
        ReadResult result = await pipe.Reader.ReadAsync();
        ReadOnlySequence<byte> buffer = result.Buffer;
        // 处理 buffer...
        pipe.Reader.AdvanceTo(buffer.End);
        if (result.IsCompleted) break;
    }
    await pipe.Reader.CompleteAsync();
}
\`\`\`

Pipelines 的核心优势：
1. **零拷贝**：消费者直接读生产者的缓冲区
2. **自动扩容**：缓冲不够会自动续接，形成 \`ReadOnlySequence<byte>\`
3. **背压**：消费者慢时生产者会被 \`FlushAsync\` 阻塞

ASP.NET Core、Kestrel 内部都用 Pipelines，性能比传统 \`Stream\` 高 30%+。

### 六、SequenceReader<T>：解析二进制协议

\`ReadOnlySequence<byte>\` 可能跨多个缓冲区，手动解析很麻烦。\`SequenceReader\` 提供游标式 API：

\`\`\`csharp
SequenceReader<byte> reader = new SequenceReader<byte>(buffer);
reader.TryReadBigEndian(out int messageId);    // 读 4 字节大端 int
reader.TryReadBigEndian(out int length);
reader.TryReadExact(length, out var payload);  // 读指定字节数
\`\`\`

### 七、Parallel.ForEach：并行处理大文件

把大文件分块，多线程并行处理：

\`\`\`csharp
Parallel.For(0, chunkCount, i =>
{
    long offset = i * chunkSize;
    // 用 RandomAccess 并行读不同区段
    RandomAccess.Read(handle, buffer, offset);
    Process(buffer);
});
\`\`\`

⚠ 注意：并行写同一文件需要用锁或分区写入，避免数据错乱。

### 八、内存映射文件 MemoryMappedFile

把文件映射到进程虚拟内存，访问像访问数组一样快，适合大文件随机访问（如数据库）：

\`\`\`csharp
using MemoryMappedFile mmf = MemoryMappedFile.CreateFromFile("big.bin", FileMode.Open);
using MemoryMappedAccessor accessor = mmf.CreateViewAccessor(offset: 0, size: 1024);
accessor.Read(0, out int value);
accessor.Write(0, 42);
accessor.Flush();
\`\`\`

优势：操作系统负责分页，不需要手动管理缓冲；多个进程可共享同一段映射做进程间通信。

### 九、本章小结

- 异步优先 + \`FileOptions.Asynchronous\`
- 频繁分配 → \`ArrayPool<T>.Shared\`
- 零拷贝 → \`Span<T>\` / \`Memory<T>\`
- 零拷贝文件 → \`RandomAccess\`
- 极高吞吐 → \`System.IO.Pipelines\`
- 大文件随机访问 → \`MemoryMappedFile\`

### 练习

1. 改一改本章 demo 里的输入数据，再点运行，确认输出按你的预期变化。
2. 合上示例，用「高性能 IO 与管道」里最核心的 1～2 个 API 自己写一个更短的版本，对照原 demo。
`,
    code: `// C# 12 顶级语句 —— 高性能 IO 与管道演示
using System;
using System.Buffers;
using System.IO;
using System.IO.MemoryMappedFiles;
using System.Linq;
using Microsoft.Win32.SafeHandles;
using System.Text;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;

string tempFile = Path.Combine(Path.GetTempPath(), "csharp4-ch55-demo.bin");

try
{
    // === 1. 准备测试文件：写入约 1MB 数据 ===
    // 用 ArrayPool 租用缓冲区，避免 GC 压力
    using (FileStream fs = File.Create(tempFile))
    {
        byte[] buffer = ArrayPool<byte>.Shared.Rent(4096);  // 租用 4KB
        try
        {
            // 填充测试数据
            for (int i = 0; i < buffer.Length; i++)
                buffer[i] = (byte)(i % 256);

            // 写入约 1MB（256 次 * 4KB）
            for (int i = 0; i < 256; i++)
                fs.Write(buffer, 0, buffer.Length);
        }
        finally
        {
            // 必须归还，否则内存泄漏
            ArrayPool<byte>.Shared.Return(buffer);
        }
    }
    Console.WriteLine($"测试文件: {tempFile}");
    Console.WriteLine($"文件大小: {new FileInfo(tempFile).Length / 1024} KB");

    // === 2. ArrayPool + Span 异步读取 ===
    await ReadWithArrayPoolAsync(tempFile);

    // === 3. RandomAccess API（.NET 6+，零拷贝）===
    await ReadWithRandomAccessAsync(tempFile);

    // === 4. 管道式生产者/消费者（教学对照 System.IO.Pipelines） ===
    await UsePipeAsync(tempFile);

    // === 5. File.ReadAllBytesAsync：简单异步读 ===
    byte[] allBytes = await File.ReadAllBytesAsync(tempFile);
    Console.WriteLine($"\\n--- ReadAllBytesAsync ---");
    Console.WriteLine($"读取 {allBytes.Length} 字节");

    // === 6. Parallel.ForEach 并行处理大文件块 ===
    await ProcessLargeFileInParallelAsync(tempFile);

    // === 7. 内存映射文件 MemoryMappedFile ===
    UseMemoryMappedFile(tempFile);
}
finally
{
    if (File.Exists(tempFile)) File.Delete(tempFile);
    Console.WriteLine("\\n已清理临时文件");
}

// === 局部函数定义区 ===

// 使用 ArrayPool + Span 异步读取
async Task ReadWithArrayPoolAsync(string path)
{
    Console.WriteLine("\\n--- ArrayPool + Span 异步读取 ---");
    // 注意 FileOptions.Asynchronous 是关键，否则 ReadAsync 是假异步
    using FileStream fs = new FileStream(path, FileMode.Open, FileAccess.Read,
        FileShare.Read, bufferSize: 4096, FileOptions.Asynchronous);

    byte[] buffer = ArrayPool<byte>.Shared.Rent(8192);  // 租用 8KB（可能更大）
    try
    {
        int totalRead = 0;
        int read;
        // 循环读取直到 EOF
        while ((read = await fs.ReadAsync(buffer.AsMemory(0, 8192))) > 0)
        {
            totalRead += read;
        }
        Console.WriteLine($"  共读取 {totalRead} 字节（{totalRead / 1024} KB）");
    }
    finally
    {
        // 归还后绝对不能再访问 buffer
        ArrayPool<byte>.Shared.Return(buffer);
    }
}

// 使用 RandomAccess API（.NET 6+，基于 SafeFileHandle）
async Task ReadWithRandomAccessAsync(string path)
{
    Console.WriteLine("\\n--- RandomAccess API ---");
    // OpenHandle 返回 SafeFileHandle，没有 FileStream 的缓冲开销
    using SafeFileHandle handle = File.OpenHandle(path, FileMode.Open,
        FileAccess.Read, FileShare.Read, FileOptions.Asynchronous);

    long fileLength = RandomAccess.GetLength(handle);
    Console.WriteLine($"  文件长度: {fileLength} 字节");

    byte[] buffer = ArrayPool<byte>.Shared.Rent(4096);
    try
    {
        // 从指定偏移读取（无缓冲，零拷贝）
        long offset = 0;
        int totalRead = 0;
        while (offset < fileLength)
        {
            int read = await RandomAccess.ReadAsync(handle, buffer.AsMemory(0, 4096), offset);
            if (read == 0) break;
            totalRead += read;
            offset += read;
        }
        Console.WriteLine($"  RandomAccess 共读取 {totalRead} 字节");

        // 也可以读指定位置的一段
        int partial = await RandomAccess.ReadAsync(handle, buffer.AsMemory(0, 16), fileLength - 16);
        Console.WriteLine($"  读取末尾 {partial} 字节: [{string.Join(",", buffer.Take(partial))}]");
    }
    finally
    {
        ArrayPool<byte>.Shared.Return(buffer);
    }
}

// 管道演示：生产者写文件数据，消费者统计字节数
// 沙箱控制台项目不引用 System.IO.Pipelines 包，用 Channel 表达同样的「写端 / 读端 / Complete」模型
async Task UsePipeAsync(string path)
{
    Console.WriteLine("\\n--- 管道（Channel，对照 System.IO.Pipelines） ---");
    var channel = Channel.CreateBounded<byte[]>(new BoundedChannelOptions(8)
    {
        FullMode = BoundedChannelFullMode.Wait
    });

    Task writerTask = Task.Run(async () =>
    {
        using FileStream fs = File.OpenRead(path);
        byte[] buffer = ArrayPool<byte>.Shared.Rent(4096);
        try
        {
            int read;
            while ((read = await fs.ReadAsync(buffer.AsMemory(0, 4096))) > 0)
            {
                var chunk = new byte[read];
                Array.Copy(buffer, 0, chunk, 0, read);
                await channel.Writer.WriteAsync(chunk);
            }
            channel.Writer.Complete();
        }
        catch (Exception ex)
        {
            channel.Writer.Complete(ex);
        }
        finally
        {
            ArrayPool<byte>.Shared.Return(buffer);
        }
    });

    long totalBytes = 0;
    await foreach (var chunk in channel.Reader.ReadAllAsync())
        totalBytes += chunk.Length;
    await writerTask;
    Console.WriteLine($"  管道共传输 {totalBytes} 字节（{totalBytes / 1024} KB）");
}

// Parallel.For 并行处理大文件
async Task ProcessLargeFileInParallelAsync(string path)
{
    Console.WriteLine("\\n--- Parallel.For 并行处理 ---");
    long fileLength = new FileInfo(path).Length;
    long chunkSize = 64 * 1024;  // 64KB 一块
    int chunkCount = (int)((fileLength + chunkSize - 1) / chunkSize);

    long totalProcessed = 0;

    // 用 RandomAccess 并行读不同区段
    using SafeFileHandle handle = File.OpenHandle(path, FileMode.Open,
        FileAccess.Read, FileShare.Read, FileOptions.Asynchronous);

    // Parallel.For 自动分配任务到线程池
    Parallel.For(0, chunkCount, i =>
    {
        long offset = i * chunkSize;
        int size = (int)Math.Min(chunkSize, fileLength - offset);
        byte[] buffer = ArrayPool<byte>.Shared.Rent(size);
        try
        {
            // 同步读取（Parallel 已经并行）
            RandomAccess.Read(handle, buffer.AsSpan(0, size), offset);
            // 线程安全累加
            Interlocked.Add(ref totalProcessed, size);
        }
        finally
        {
            ArrayPool<byte>.Shared.Return(buffer);
        }
    });

    Console.WriteLine($"  并行处理 {totalProcessed} 字节，分 {chunkCount} 块");
    await Task.CompletedTask;
}

// 内存映射文件：大文件随机访问
void UseMemoryMappedFile(string path)
{
    Console.WriteLine("\\n--- MemoryMappedFile ---");
    using MemoryMappedFile mmf = MemoryMappedFile.CreateFromFile(
        path, FileMode.Open, mapName: null, capacity: 0,
        MemoryMappedFileAccess.Read);
    // 创建只读视图，访问前 1024 字节
    using MemoryMappedViewAccessor accessor = mmf.CreateViewAccessor(offset: 0, size: 1024, access: MemoryMappedFileAccess.Read);
    // 读取第 0 字节的值
    accessor.Read(0, out byte firstByte);
    Console.WriteLine($"  首字节: 0x{firstByte:X2}");

    // 读取第 100 位置的 byte
    accessor.Read(100, out byte b100);
    Console.WriteLine($"  第 100 字节: 0x{b100:X2}");

    // 批量读取前 4 字节作为 int
    accessor.Read(0, out int firstInt);
    Console.WriteLine($"  前 4 字节作为 int: {firstInt}");
}`,
    lang: 'cs',
  },
];

export { chapters };
