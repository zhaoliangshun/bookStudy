// =============================================================
// C# 从入门到精通大全（终极版）—— 第14批章节
// 第十四部分 文件IO与序列化（共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   csharp3-ch73 : 第七十三章 文件读写基础
//   csharp3-ch74 : 第七十四章 Stream 体系
//   csharp3-ch75 : 第七十五章 文件系统操作
//   csharp3-ch76 : 第七十六章 JSON 序列化
//   csharp3-ch77 : 第七十七章 正则表达式
// =============================================================

const chapters = [
  // ============================================================
  // 第七十三章：文件读写基础
  // ============================================================
  {
    id: 'csharp3-ch73',
    group: '第十四部分 文件IO与序列化',
    icon: '📄',
    title: '第七十三章 文件读写基础',
    content: `## 第七十三章　文件读写基础

\`System.IO.File\` 类是 .NET 中进行文件读写的最简单入口。它提供了静态方法，适合小到中等大小文件的快速读写。

### 一、File 类：快速读写文本 ⭐⭐⭐

\`\`\`csharp
// File 类提供静态方法，无需创建 FileStream 对象
// 适合一次性读写整个文件内容

// 1. ReadAllText：读取整个文件为字符串
string content = File.ReadAllText("/tmp/demo.txt");  // 读取整个文件内容
// 如果文件不存在，抛出 FileNotFoundException
// 如果文件太大（如几百 MB），会占用大量内存，不推荐

Console.WriteLine($"文件内容: {content}");

// 2. WriteAllText：将字符串写入文件（覆盖现有内容）
File.WriteAllText("/tmp/demo.txt", "Hello, 世界!");  // 创建或覆盖文件
// 如果文件不存在，自动创建
// 如果文件存在，覆盖原有内容
// 默认使用 UTF-8 编码（无 BOM）

// 3. ReadAllLines：读取所有行，返回字符串数组
string[] lines = File.ReadAllLines("/tmp/demo.txt");  // 每行一个元素
// 适合按行处理文本文件（如 CSV、日志）
Console.WriteLine($"行数: {lines.Length}");
foreach (string line in lines)
{
    Console.WriteLine($"行: {line}");               // 逐行输出
}

// 4. WriteAllLines：将字符串数组写入文件
string[] data = { "第一行", "第二行", "第三行" };
File.WriteAllLines("/tmp/lines.txt", data);          // 每行自动添加换行
// 等价于 WriteAllText 配合 string.Join(Environment.NewLine, data)

// 5. AppendAllText：追加文本到文件末尾
File.AppendAllText("/tmp/demo.txt", "\\n追加的内容");  // 保留原有内容，末尾追加
// 如果文件不存在，自动创建
// 适合日志写入场景

// 6. ReadAllBytes：读取整个文件为字节数组
byte[] bytes = File.ReadAllBytes("/tmp/demo.txt");   // 读取二进制数据
// 适合小文件的二进制读取（如图片、小文件）
Console.WriteLine($"字节数: {bytes.Length}");

// 7. WriteAllBytes：将字节数组写入文件
byte[] data2 = { 0x48, 0x65, 0x6C, 0x6C, 0x6F };    // "Hello" 的 ASCII 码
File.WriteAllBytes("/tmp/binary.bin", data2);         // 二进制写入
\`\`\`

### 二、文件存在性检查与基本操作 ⭐⭐⭐

\`\`\`csharp
// 1. File.Exists：检查文件是否存在
string filePath = "/tmp/check.txt";

if (File.Exists(filePath))                           // 检查文件是否存在（不影响性能）
{
    Console.WriteLine($"文件存在: {filePath}");
    string content = File.ReadAllText(filePath);     // 安全读取
}
else
{
    Console.WriteLine($"文件不存在，创建新文件");
    File.WriteAllText(filePath, "新创建的文件");     // 创建文件
}

// 2. File.Delete：删除文件
if (File.Exists(filePath))
{
    File.Delete(filePath);                           // 删除文件
    Console.WriteLine($"文件已删除: {filePath}");
    // 注意：文件被删除后不可恢复（不进回收站）
}

// 3. File.Copy：复制文件
string source = "/tmp/source.txt";
string dest = "/tmp/dest.txt";
File.WriteAllText(source, "源文件内容");

if (File.Exists(dest))
{
    File.Copy(source, dest, overwrite: true);        // 覆盖目标文件
}
else
{
    File.Copy(source, dest);                         // 目标文件不存在时直接复制
}
Console.WriteLine($"文件已复制: {source} → {dest}");

// 4. File.Move：移动/重命名文件
string oldName = "/tmp/old_name.txt";
string newName = "/tmp/new_name.txt";
File.WriteAllText(oldName, "测试内容");

File.Move(oldName, newName);                         // 移动或重命名文件
Console.WriteLine($"文件已移动: {oldName} → {newName}");
// 如果目标文件已存在，抛出 IOException
// 跨磁盘移动时会先复制再删除源文件

// 5. File.GetAttributes / SetAttributes：操作文件属性
FileAttributes attrs = File.GetAttributes(newName);  // 获取文件属性
Console.WriteLine($"属性: {attrs}");

// 设置只读属性
File.SetAttributes(newName, FileAttributes.ReadOnly); // 设置为只读

// 6. File.GetCreationTime / GetLastWriteTime：获取时间信息
DateTime created = File.GetCreationTime(newName);     // 创建时间
DateTime modified = File.GetLastWriteTime(newName);   // 最后修改时间
DateTime accessed = File.GetLastAccessTime(newName);  // 最后访问时间
Console.WriteLine($"创建: {created}, 修改: {modified}, 访问: {accessed}");
\`\`\`

### 三、编码处理 ⭐⭐⭐

\`\`\`csharp
// 编码是文件读写中容易出错的地方，必须显式指定

// 1. 默认编码：UTF-8（无 BOM）
File.WriteAllText("/tmp/utf8.txt", "中文内容");      // 默认 UTF-8 无 BOM
// 在 Windows 记事本中可能显示乱码（因为无 BOM）

// 2. 显式指定 UTF-8 with BOM
File.WriteAllText("/tmp/utf8_bom.txt", "中文内容", Encoding.UTF8);  // UTF-8 with BOM
// BOM（Byte Order Mark）是文件开头的几个字节，用于标识编码

// 3. 使用其他编码
File.WriteAllText("/tmp/gbk.txt", "中文内容", Encoding.GetEncoding("GBK"));  // GBK 编码
// 需要注册编码提供者：Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

// 4. 读取时指定编码（必须与写入时一致）
string utf8Content = File.ReadAllText("/tmp/utf8.txt", Encoding.UTF8);
string gbkContent = File.ReadAllText("/tmp/gbk.txt", Encoding.GetEncoding("GBK"));

// 5. 自动检测编码（不保证 100% 准确）
// 使用 StreamReader 可以自动检测 BOM
using var reader = new StreamReader("/tmp/utf8.txt", true);  // detectEncodingFromByteOrderMarks = true
string detected = reader.ReadToEnd();
Console.WriteLine($"检测到的编码: {reader.CurrentEncoding.EncodingName}");

// 6. 常用编码对比
// | 编码 | 说明 | 适用场景 |
// |------|------|---------|
// | UTF-8 (无BOM) | 默认 | Linux/macOS/Web |
// | UTF-8 (BOM) | 带标记 | Windows 兼容 |
// | GBK/GB2312 | 中文 | 旧系统中文 |
// | ASCII | 纯英文 | 简单文本 |
// | UTF-16 | 双字节 | Windows 内部 |
\`\`\`

### 四、Path 类：路径操作 ⭐⭐⭐

\`\`\`csharp
// Path 类提供跨平台的路径操作方法
// 不要手动拼接路径字符串（如 "dir" + "\\" + "file"），用 Path 类

// 1. Path.Combine：组合路径（最重要！）
string dir = "/tmp/mydata";
string file = "data.txt";
string fullPath = Path.Combine(dir, file);           // 自动处理分隔符
Console.WriteLine($"组合路径: {fullPath}");           // /tmp/mydata/data.txt

// 多个路径段组合
string deep = Path.Combine("root", "sub", "deep", "file.txt");
Console.WriteLine($"深层路径: {deep}");              // root/sub/deep/file.txt

// 2. Path.GetExtension：获取文件扩展名
string ext = Path.GetExtension("document.pdf");      // .pdf（含点号）
Console.WriteLine($"扩展名: {ext}");

// 3. Path.GetFileName：获取文件名（含扩展名）
string name = Path.GetFileName("/tmp/data/document.pdf");  // document.pdf
Console.WriteLine($"文件名: {name}");

// 4. Path.GetFileNameWithoutExtension：获取不含扩展名的文件名
string baseName = Path.GetFileNameWithoutExtension("document.pdf");  // document
Console.WriteLine($"基础名: {baseName}");

// 5. Path.GetDirectoryName：获取目录路径
string dir2 = Path.GetDirectoryName("/tmp/data/document.pdf");  // /tmp/data
Console.WriteLine($"目录: {dir2}");

// 6. Path.GetFullPath：获取绝对路径
string absolute = Path.GetFullPath("data.txt");      // 相对于当前工作目录
Console.WriteLine($"绝对路径: {absolute}");

// 7. Path.ChangeExtension：更改扩展名
string newExt = Path.ChangeExtension("document.txt", ".pdf");  // document.pdf
Console.WriteLine($"改扩展名: {newExt}");

// 8. Path 特殊目录
string tempPath = Path.GetTempPath();                // 系统临时目录
string tempFile = Path.GetTempFileName();            // 创建临时文件（0 字节）
Console.WriteLine($"临时目录: {tempPath}");
Console.WriteLine($"临时文件: {tempFile}");

// 9. Path 无效字符检查
// Path.GetInvalidFileNameChars() 返回不能用于文件名的字符
// Path.GetInvalidPathChars() 返回不能用于路径的字符
char[] invalidFiles = Path.GetInvalidFileNameChars();
Console.WriteLine($"无效文件名字符: {string.Join(" ", invalidFiles)}");

// 10. 路径分隔符
Console.WriteLine($"目录分隔符: {Path.DirectorySeparatorChar}");    // / 或 \\
Console.WriteLine($"路径分隔符: {Path.PathSeparator}");              // : 或 ;
Console.WriteLine($"卷分隔符: {Path.VolumeSeparatorChar}");          // : 或 /
\`\`\`

### 五、异步文件读写 ⭐⭐⭐

\`\`\`csharp
// File 类提供异步版本，适合 I/O 密集型场景
// 异步方法名以 Async 结尾

// 1. ReadAllTextAsync：异步读取
async Task AsyncReadDemoAsync()
{
    string content = await File.ReadAllTextAsync("/tmp/demo.txt");
    // 异步读取，不阻塞调用线程
    Console.WriteLine($"异步读取: {content}");

    // 指定编码
    string content2 = await File.ReadAllTextAsync("/tmp/utf8.txt", Encoding.UTF8);
}

// 2. WriteAllTextAsync：异步写入
async Task AsyncWriteDemoAsync()
{
    await File.WriteAllTextAsync("/tmp/async_write.txt", "异步写入的内容");
    Console.WriteLine("异步写入完成");
}

// 3. AppendAllTextAsync：异步追加
async Task AsyncAppendDemoAsync()
{
    await File.AppendAllTextAsync("/tmp/log.txt", $"[{DateTime.Now}] 日志条目\\n");
    Console.WriteLine("异步追加完成");
}

// 4. ReadAllLinesAsync / WriteAllLinesAsync
async Task AsyncLinesDemoAsync()
{
    string[] lines = await File.ReadAllLinesAsync("/tmp/async_write.txt");
    Console.WriteLine($"异步读取 {lines.Length} 行");

    await File.WriteAllLinesAsync("/tmp/async_lines.txt", new[] { "行1", "行2" });
}

// 5. ReadAllBytesAsync / WriteAllBytesAsync
async Task AsyncBytesDemoAsync()
{
    byte[] data = await File.ReadAllBytesAsync("/tmp/binary.bin");
    Console.WriteLine($"异步读取 {data.Length} 字节");

    await File.WriteAllBytesAsync("/tmp/async_binary.bin", data);
}

await AsyncReadDemoAsync();
await AsyncWriteDemoAsync();
await AsyncAppendDemoAsync();
await AsyncLinesDemoAsync();
await AsyncBytesDemoAsync();
\`\`\`

### 六、文件读写最佳实践 ⭐⭐

\`\`\`csharp
// 1. 安全读取文件（处理异常）
async Task<string?> SafeReadFileAsync(string path)
{
    try
    {
        if (!File.Exists(path))                    // 先检查文件是否存在
        {
            Console.WriteLine($"文件不存在: {path}");
            return null;
        }
        return await File.ReadAllTextAsync(path);  // 读取文件
    }
    catch (UnauthorizedAccessException)            // 权限不足
    {
        Console.WriteLine($"没有读取权限: {path}");
        return null;
    }
    catch (IOException ex)                         // I/O 错误
    {
        Console.WriteLine($"I/O 错误: {ex.Message}");
        return null;
    }
}

// 2. 安全写入文件（原子写入）
async Task SafeWriteFileAsync(string path, string content)
{
    // 先写入临时文件，再重命名（原子操作）
    string tempFile = path + ".tmp";               // 临时文件
    try
    {
        await File.WriteAllTextAsync(tempFile, content);  // 写入临时文件
        File.Move(tempFile, path, overwrite: true);       // 原子替换
    }
    catch
    {
        // 清理临时文件
        if (File.Exists(tempFile))
            File.Delete(tempFile);
        throw;
    }
}

// 3. 大文件处理：用 Stream（不要用 ReadAllText）
// File.ReadAllText 会将整个文件加载到内存
// 对于大文件（>100MB），应该使用 FileStream 或 StreamReader
Console.WriteLine("大文件用 Stream 流式处理，避免内存溢出");
\`\`\`

### 七、关键总结

| 方法 | 用途 | 异步版本 |
| --- | --- | --- |
| \`File.ReadAllText\` | 读取所有文本 | \`ReadAllTextAsync\` |
| \`File.WriteAllText\` | 写入文本（覆盖） | \`WriteAllTextAsync\` |
| \`File.ReadAllLines\` | 读取所有行 | \`ReadAllLinesAsync\` |
| \`File.WriteAllLines\` | 写入多行 | \`WriteAllLinesAsync\` |
| \`File.AppendAllText\` | 追加文本 | \`AppendAllTextAsync\` |
| \`File.ReadAllBytes\` | 读取所有字节 | \`ReadAllBytesAsync\` |
| \`File.Exists\` | 检查文件是否存在 | - |
| \`File.Delete\` | 删除文件 | - |
| \`File.Copy\` | 复制文件 | - |
| \`File.Move\` | 移动/重命名 | - |
| \`Path.Combine\` | 组合路径 | - |
| \`Path.GetExtension\` | 获取扩展名 | - |

**最佳实践**：
1. 始终用 \`Path.Combine\` 拼接路径，不要手动拼接
2. 显式指定编码，避免乱码
3. 操作前检查 \`File.Exists\`
4. 大文件用 Stream，小文件用 File 静态方法
5. 使用异步版本（\`...Async\`）避免阻塞
6. 原子写入：先写临时文件再重命名

`,
  },

  // ============================================================
  // 第七十四章：Stream 体系
  // ============================================================
  {
    id: 'csharp3-ch74',
    group: '第十四部分 文件IO与序列化',
    icon: '🌊',
    title: '第七十四章 Stream 体系',
    content: `## 第七十四章　Stream 体系

Stream 是 .NET I/O 的核心抽象，表示字节序列。FileStream、MemoryStream、NetworkStream 等都是 Stream 的子类。

### 一、Stream 基类：核心概念 ⭐⭐⭐

\`\`\`csharp
// Stream 是所有流的抽象基类
// 核心属性：CanRead、CanWrite、CanSeek、Length、Position
// 核心方法：Read、Write、Seek、Flush、Dispose

// 1. Stream 基础属性
async Task StreamBasicsAsync()
{
    // 创建一个文件流演示
    string path = "/tmp/stream_demo.bin";
    await using var fs = new FileStream(path, FileMode.Create, FileAccess.ReadWrite);

    Console.WriteLine($"CanRead: {fs.CanRead}");       // 是否可读
    Console.WriteLine($"CanWrite: {fs.CanWrite}");     // 是否可写
    Console.WriteLine($"CanSeek: {fs.CanSeek}");       // 是否可定位
    Console.WriteLine($"Length: {fs.Length}");         // 流的字节长度
    Console.WriteLine($"Position: {fs.Position}");     // 当前读写位置

    // 写入数据
    byte[] data = Encoding.UTF8.GetBytes("Hello, Stream!");
    await fs.WriteAsync(data);                         // 异步写入
    // 写入后 Position 移动到数据末尾

    Console.WriteLine($"写入后 Position: {fs.Position}");  // 等于 data.Length

    // 定位到开头
    fs.Seek(0, SeekOrigin.Begin);                      // 移动到开头
    // SeekOrigin.Begin: 从开头算起
    // SeekOrigin.Current: 从当前位置算起
    // SeekOrigin.End: 从末尾算起

    // 读取数据
    byte[] buffer = new byte[data.Length];             // 准备缓冲区
    int bytesRead = await fs.ReadAsync(buffer);        // 读取到缓冲区
    string readBack = Encoding.UTF8.GetString(buffer); // 解码
    Console.WriteLine($"读取: {readBack}");
}
await StreamBasicsAsync();

// 2. Stream 的同步方法
// Read(byte[] buffer, int offset, int count)
// Write(byte[] buffer, int offset, int count)
// 异步版本：ReadAsync / WriteAsync（推荐）
\`\`\`

### 二、FileStream：文件流 ⭐⭐⭐

\`\`\`csharp
// FileStream 提供对文件的底层读写操作
// 比 File 静态方法更灵活，支持分块读写、定位等

// 1. 创建 FileStream
async Task FileStreamDemoAsync()
{
    string path = "/tmp/filestream_demo.txt";

    // 方式一：构造函数（推荐使用 using 确保释放）
    await using (var fs = new FileStream(path, FileMode.Create, FileAccess.Write))
    {
        byte[] data = Encoding.UTF8.GetBytes("Hello from FileStream!");
        await fs.WriteAsync(data);                   // 写入
    }

    // 方式二：File.Open 静态方法
    await using var fs2 = File.Open(path, FileMode.Open, FileAccess.Read);
    using var reader = new StreamReader(fs2);
    string content = await reader.ReadToEndAsync();
    Console.WriteLine($"读取: {content}");

    // 方式三：File.Create（创建新文件）
    using var fs3 = File.Create("/tmp/create_demo.txt");
    byte[] init = Encoding.UTF8.GetBytes("初始内容");
    fs3.Write(init);

    // 方式四：File.OpenRead / File.OpenWrite（快捷方式）
    using var readStream = File.OpenRead(path);      // 只读
    using var writeStream = File.OpenWrite(path);    // 只写
}

// 2. FileMode 选项
// | FileMode | 说明 |
// |----------|------|
// | CreateNew | 创建新文件，存在则抛异常 |
// | Create | 创建或覆盖 |
// | Open | 打开现有文件，不存在则抛异常 |
// | OpenOrCreate | 打开或创建 |
// | Truncate | 打开并清空内容 |
// | Append | 打开并定位到末尾 |

// 3. FileAccess 选项
// FileAccess.Read：只读
// FileAccess.Write：只写
// FileAccess.ReadWrite：读写

// 4. FileShare 选项（控制其他进程的访问权限）
// FileShare.None：其他进程不能访问
// FileShare.Read：其他进程可以读
// FileShare.Write：其他进程可以写
// FileShare.ReadWrite：其他进程可以读写
// FileShare.Delete：其他进程可以删除

await FileStreamDemoAsync();
\`\`\`

### 三、MemoryStream：内存流 ⭐⭐⭐

\`\`\`csharp
// MemoryStream 将数据存储在内存中（字节数组）
// 适合临时数据、测试、序列化等场景

// 1. 创建 MemoryStream
async Task MemoryStreamDemoAsync()
{
    // 创建空内存流
    using var ms = new MemoryStream();

    // 写入数据
    byte[] data = Encoding.UTF8.GetBytes("内存中的字符串");
    await ms.WriteAsync(data);                       // 写入内存

    Console.WriteLine($"写入后长度: {ms.Length}");

    // 重置位置到开头
    ms.Position = 0;                                 // 或 ms.Seek(0, SeekOrigin.Begin)

    // 读取数据
    var reader = new StreamReader(ms);               // 用 StreamReader 读取
    string content = await reader.ReadToEndAsync();
    Console.WriteLine($"读取: {content}");

    // 2. 从现有字节数组创建 MemoryStream
    byte[] existing = { 1, 2, 3, 4, 5 };
    using var ms2 = new MemoryStream(existing);       // 从字节数组创建
    Console.WriteLine($"长度: {ms2.Length}");          // 5

    // 3. 获取内部字节数组
    using var ms3 = new MemoryStream();
    ms3.Write(new byte[] { 10, 20, 30 });
    byte[] buffer = ms3.ToArray();                   // 获取所有字节的副本
    Console.WriteLine($"ToArray: [{string.Join(", ", buffer)}]");

    // 4. TryGetBuffer：获取内部缓冲区（无需复制）
    if (ms3.TryGetBuffer(out ArraySegment<byte> segment))
    {
        Console.WriteLine($"内部缓冲区: 偏移={segment.Offset}, 长度={segment.Count}");
    }

    // 5. MemoryStream 适用场景
    // - 在内存中处理二进制数据（如图片处理）
    // - 序列化/反序列化（如将对象序列化到内存再发送）
    // - 单元测试（模拟 Stream）
    // - 临时数据缓冲
}
await MemoryStreamDemoAsync();
\`\`\`

### 四、StreamReader / StreamWriter ⭐⭐⭐

\`\`\`csharp
// StreamReader 和 StreamWriter 是文本流的读写器
// 它们封装了 Stream，提供字符级别的读写

// 1. StreamWriter：写入文本
async Task StreamWriterDemoAsync()
{
    string path = "/tmp/streamwriter_demo.txt";

    // 创建 StreamWriter
    await using (var writer = new StreamWriter(path, append: false, Encoding.UTF8))
    {
        await writer.WriteLineAsync("第一行文本");   // 写入一行（自动添加换行）
        await writer.WriteLineAsync("第二行文本");
        await writer.WriteAsync("没有换行的文本");   // 写入不换行
        await writer.FlushAsync();                   // 强制刷新缓冲区到磁盘
    }
    Console.WriteLine("StreamWriter 写入完成");

    // 2. StreamReader：读取文本
    using var reader = new StreamReader(path, Encoding.UTF8);

    // 读取全部
    string all = await reader.ReadToEndAsync();
    Console.WriteLine($"全部内容:\\n{all}");
    reader.DiscardBufferedData();                    // 重置读取位置
    reader.BaseStream.Seek(0, SeekOrigin.Begin);     // 重新定位

    // 逐行读取
    string? line;
    while ((line = await reader.ReadLineAsync()) != null)
    {
        Console.WriteLine($"行: {line}");
    }

    // 3. 从 Stream 创建 Reader/Writer
    // 可以包装任何 Stream（如 FileStream、MemoryStream、NetworkStream）
    using var ms = new MemoryStream();
    using var sw = new StreamWriter(ms, Encoding.UTF8, leaveOpen: true);
    sw.Write("内存中的文本");
    sw.Flush();
    ms.Position = 0;

    using var sr = new StreamReader(ms);
    string text = sr.ReadToEnd();
    Console.WriteLine($"从 MemoryStream 读取: {text}");
}
await StreamWriterDemoAsync();
\`\`\`

### 五、BinaryReader / BinaryWriter ⭐⭐

\`\`\`csharp
// BinaryReader / BinaryWriter 用于读写二进制格式数据
// 适合读写基本类型（int、float、double 等）的二进制表示

// 1. BinaryWriter：写入二进制数据
async Task BinaryWriterDemoAsync()
{
    string path = "/tmp/binary_demo.dat";

    await using (var fs = new FileStream(path, FileMode.Create))
    using (var writer = new BinaryWriter(fs, Encoding.UTF8))
    {
        writer.Write(42);                            // 写入 int（4 字节）
        writer.Write(3.14f);                         // 写入 float（4 字节）
        writer.Write(3.141592653589793);             // 写入 double（8 字节）
        writer.Write(true);                          // 写入 bool（1 字节）
        writer.Write("Hello, Binary!");              // 写入字符串（长度前缀 + 字节）
        writer.Write(new byte[] { 1, 2, 3, 4 });    // 写入字节数组
    }
    Console.WriteLine($"BinaryWriter 写入完成，文件大小: {new FileInfo(path).Length} 字节");

    // 2. BinaryReader：读取二进制数据
    await using (var fs = new FileStream(path, FileMode.Open))
    using (var reader = new BinaryReader(fs, Encoding.UTF8))
    {
        int intVal = reader.ReadInt32();              // 读取 int（必须按写入顺序读取）
        float floatVal = reader.ReadSingle();         // 读取 float
        double doubleVal = reader.ReadDouble();       // 读取 double
        bool boolVal = reader.ReadBoolean();          // 读取 bool
        string strVal = reader.ReadString();          // 读取字符串
        byte[] bytes = reader.ReadBytes(4);           // 读取 4 个字节

        Console.WriteLine($"int: {intVal}");
        Console.WriteLine($"float: {floatVal}");
        Console.WriteLine($"double: {doubleVal}");
        Console.WriteLine($"bool: {boolVal}");
        Console.WriteLine($"string: {strVal}");
        Console.WriteLine($"bytes: [{string.Join(", ", bytes)}]");
    }
}
await BinaryWriterDemoAsync();

// 3. BinaryWriter 注意事项
// - 读取顺序必须与写入顺序完全一致
// - 字符串使用长度前缀编码（7位编码的长度 + UTF-8 字节）
// - 不适合跨平台（不同平台字节序可能不同）
// - 适合自定义二进制格式、游戏存档等场景
\`\`\`

### 六、BufferedStream：缓冲流 ⭐⭐

\`\`\`csharp
// BufferedStream 为底层 Stream 添加缓冲，减少系统调用次数
// 适合频繁小数据读写的场景

// 1. 基本用法
async Task BufferedStreamDemoAsync()
{
    string path = "/tmp/buffered_demo.txt";

    // 创建带缓冲的文件流
    await using (var fs = new FileStream(path, FileMode.Create))
    using (var bs = new BufferedStream(fs, bufferSize: 8192))  // 8KB 缓冲区
    {
        // 多次小写入会被缓冲，然后批量写入磁盘
        for (int i = 0; i < 1000; i++)
        {
            byte[] data = Encoding.UTF8.GetBytes($"行 {i}\\n");
            await bs.WriteAsync(data);               // 先写入缓冲区
        }
        // Flush 强制将缓冲区内容写入底层 Stream
        await bs.FlushAsync();                       // 刷新缓冲区
    }
    Console.WriteLine("BufferedStream 写入完成");

    // 2. 性能对比
    // 无缓冲：每次 Write 都是一次系统调用（开销大）
    // 有缓冲：积累到缓冲区大小后再一次系统调用（开销小）

    // 3. 注意
    // - FileStream 内部已有缓冲，不需要额外包装 BufferedStream
    // - BufferedStream 主要用于包装无缓冲的 Stream（如 NetworkStream）
    // - 默认缓冲区大小 4096 字节
}
\`\`\`

### 七、CryptoStream：加密流 ⭐⭐

\`\`\`csharp
// CryptoStream 用于加密/解密数据流
// 配合加密算法（如 AES）实现数据加密

// 1. AES 加密文件
async Task CryptoStreamEncryptDemoAsync()
{
    string inputFile = "/tmp/plain.txt";
    string encryptedFile = "/tmp/encrypted.bin";

    // 创建 AES 加密器
    using var aes = System.Security.Cryptography.Aes.Create();
    aes.GenerateKey();                               // 生成随机密钥
    aes.GenerateIV();                                // 生成随机 IV（初始化向量）

    // 写入明文
    await File.WriteAllTextAsync(inputFile, "这是机密内容！");

    // 加密
    await using (var fsInput = File.OpenRead(inputFile))
    using (var encryptor = aes.CreateEncryptor())    // 创建加密器
    await using (var fsOutput = File.Create(encryptedFile))
    using (var cryptoStream = new CryptoStream(fsOutput, encryptor, CryptoStreamMode.Write))
    {
        await fsInput.CopyToAsync(cryptoStream);     // 读明文 → 加密 → 写密文
    }
    Console.WriteLine($"加密完成，密文大小: {new FileInfo(encryptedFile).Length} 字节");

    // 2. 解密
    string decryptedFile = "/tmp/decrypted.txt";
    await using (var fsEncrypted = File.OpenRead(encryptedFile))
    using (var decryptor = aes.CreateDecryptor())    // 创建解密器
    await using (var fsDecrypted = File.Create(decryptedFile))
    using (var cryptoStream = new CryptoStream(fsEncrypted, decryptor, CryptoStreamMode.Read))
    {
        await cryptoStream.CopyToAsync(fsDecrypted); // 读密文 → 解密 → 写明文
    }

    string decrypted = await File.ReadAllTextAsync(decryptedFile);
    Console.WriteLine($"解密结果: {decrypted}");

    // 密钥和 IV 需要安全保存（这里仅演示）
    Console.WriteLine($"密钥: {Convert.ToBase64String(aes.Key)}");
    Console.WriteLine($"IV: {Convert.ToBase64String(aes.IV)}");
}
await CryptoStreamEncryptDemoAsync();
\`\`\`

### 八、Stream 的 CopyToAsync ⭐⭐

\`\`\`csharp
// CopyToAsync 是复制流内容的最简单方式
// 内部自动分配缓冲区，从源流读取并写入目标流

// 1. 基本用法
async Task CopyToDemoAsync()
{
    string source = "/tmp/source_data.bin";
    string dest = "/tmp/copy_data.bin";

    // 创建源文件
    byte[] largeData = new byte[1024 * 1024];        // 1MB 数据
    Random.Shared.NextBytes(largeData);
    await File.WriteAllBytesAsync(source, largeData);

    // 复制文件
    await using (var srcStream = File.OpenRead(source))
    await using (var destStream = File.Create(dest))
    {
        await srcStream.CopyToAsync(destStream);     // 一行代码完成复制
    }
    Console.WriteLine($"复制完成: {new FileInfo(dest).Length} 字节");

    // 2. 带进度报告的复制
    async Task CopyWithProgressAsync(string src, string dst)
    {
        await using var srcStream = File.OpenRead(src);
        await using var dstStream = File.Create(dst);

        long totalBytes = srcStream.Length;
        byte[] buffer = new byte[8192];              // 8KB 缓冲区
        long copied = 0;
        int bytesRead;

        while ((bytesRead = await srcStream.ReadAsync(buffer)) > 0)
        {
            await dstStream.WriteAsync(buffer.AsMemory(0, bytesRead));
            copied += bytesRead;
            double progress = (double)copied / totalBytes * 100;
            Console.WriteLine($"\\r进度: {progress:F1}%");
        }
        Console.WriteLine("\\n复制完成!");
    }

    // 3. Stream 的 Dispose 模式
    // Stream 实现了 IAsyncDisposable，推荐使用 await using
    // await using (var stream = File.OpenRead(path))
    // {
    //     // 使用流
    // } // 自动异步释放
}
await CopyToDemoAsync();
\`\`\`

### 九、关键总结

| 类 | 用途 | 特点 |
| --- | --- | --- |
| \`Stream\` | 抽象基类 | 所有流的基类 |
| \`FileStream\` | 文件流 | 读写文件 |
| \`MemoryStream\` | 内存流 | 读写内存 |
| \`StreamReader\` | 文本读取器 | 从 Stream 读取字符 |
| \`StreamWriter\` | 文本写入器 | 向 Stream 写入字符 |
| \`BinaryReader\` | 二进制读取器 | 读取基本类型 |
| \`BinaryWriter\` | 二进制写入器 | 写入基本类型 |
| \`BufferedStream\` | 缓冲流 | 减少系统调用 |
| \`CryptoStream\` | 加密流 | 加密/解密数据 |

**最佳实践**：
1. 使用 \`using\` 或 \`await using\` 确保 Stream 正确释放
2. 大文件用 Stream 分块读写，避免用 \`ReadAllText\`
3. 文本操作用 \`StreamReader/StreamWriter\`
4. 二进制操作用 \`BinaryReader/BinaryWriter\`
5. 复制流用 \`CopyToAsync\`
6. 推荐使用异步方法（\`...Async\`）

`,
  },

  // ============================================================
  // 第七十五章：文件系统操作
  // ============================================================
  {
    id: 'csharp3-ch75',
    group: '第十四部分 文件IO与序列化',
    icon: '📁',
    title: '第七十五章 文件系统操作',
    content: `## 第七十五章　文件系统操作

本章讲解目录操作、文件信息、驱动器信息和文件系统监控。\`Directory\`、\`DirectoryInfo\`、\`FileInfo\`、\`DriveInfo\` 和 \`FileSystemWatcher\` 是核心类。

### 一、Directory 类：目录操作 ⭐⭐⭐

\`\`\`csharp
// Directory 提供静态方法操作目录
// 与 File 类类似，适合简单操作

// 1. CreateDirectory：创建目录
string dirPath = "/tmp/mydemo";

if (!Directory.Exists(dirPath))                    // 检查目录是否存在
{
    Directory.CreateDirectory(dirPath);             // 创建目录
    // 如果父目录不存在，会自动创建所有父目录
    Console.WriteLine($"目录已创建: {dirPath}");
}

// 创建嵌套目录（自动创建父目录）
string nested = "/tmp/mydemo/sub1/sub2";
Directory.CreateDirectory(nested);                 // 自动创建 /tmp/mydemo/sub1 和 sub2
Console.WriteLine($"嵌套目录已创建: {nested}");

// 2. Delete：删除目录
string tempDir = "/tmp/temp_delete";
Directory.CreateDirectory(tempDir);

// 删除空目录
Directory.Delete(tempDir);                         // 只删除空目录，非空抛异常
Console.WriteLine($"空目录已删除");

// 删除非空目录（递归删除）
string dirWithFiles = "/tmp/temp_with_files";
Directory.CreateDirectory(dirWithFiles);
File.WriteAllText(Path.Combine(dirWithFiles, "test.txt"), "test");
Directory.Delete(dirWithFiles, recursive: true);   // 递归删除所有内容
Console.WriteLine($"非空目录已递归删除");

// 3. GetFiles：获取目录中的文件
string searchDir = "/tmp";
string[] files = Directory.GetFiles(searchDir);    // 获取所有文件
Console.WriteLine($"/tmp 下有 {files.Length} 个文件");

// 按模式过滤
string[] txtFiles = Directory.GetFiles(searchDir, "*.txt");  // 只获取 .txt 文件
Console.WriteLine($"*.txt 文件: {txtFiles.Length} 个");

// 4. GetDirectories：获取子目录
string[] subDirs = Directory.GetDirectories(searchDir);
Console.WriteLine($"子目录: {subDirs.Length} 个");

// 5. GetFileSystemEntries：获取文件和目录
string[] entries = Directory.GetFileSystemEntries(searchDir, "*.json");
Console.WriteLine($"json 条目: {entries.Length} 个");

// 6. GetCurrentDirectory / SetCurrentDirectory
string currentDir = Directory.GetCurrentDirectory();  // 获取当前工作目录
Console.WriteLine($"当前工作目录: {currentDir}");

// 7. Move：移动目录
string srcDir = "/tmp/move_src";
string dstDir = "/tmp/move_dst";
Directory.CreateDirectory(srcDir);
Directory.Move(srcDir, dstDir);                    // 移动/重命名目录
Console.WriteLine($"目录已移动: {srcDir} → {dstDir}");

// 8. EnumerateFiles：延迟枚举（适合大目录）
// 与 GetFiles 不同，EnumerateFiles 是延迟执行的
// 目录很大时，EnumerateFiles 内存占用更小
foreach (string file in Directory.EnumerateFiles("/tmp", "*.log"))
{
    Console.WriteLine($"枚举: {file}");             // 逐文件处理，不一次性加载全部
}
Console.WriteLine("EnumerateFiles 逐文件处理，内存友好");
\`\`\`

### 二、DirectoryInfo 类：面向对象的目录操作 ⭐⭐⭐

\`\`\`csharp
// DirectoryInfo 是 Directory 的面向对象版本
// 提供实例方法，可以缓存目录信息，避免重复路径解析

// 1. 创建 DirectoryInfo
var dirInfo = new DirectoryInfo("/tmp/dirinfo_demo");

if (!dirInfo.Exists)                               // 检查目录是否存在
{
    dirInfo.Create();                              // 创建目录
    Console.WriteLine($"目录已创建: {dirInfo.FullName}");
}

// 2. 获取目录属性
Console.WriteLine($"名称: {dirInfo.Name}");          // 目录名（不含路径）
Console.WriteLine($"完整路径: {dirInfo.FullName}");   // 完整路径
Console.WriteLine($"父目录: {dirInfo.Parent?.Name}"); // 父目录
Console.WriteLine($"根目录: {dirInfo.Root.Name}");     // 根目录
Console.WriteLine($"创建时间: {dirInfo.CreationTime}"); // 创建时间
Console.WriteLine($"最后修改: {dirInfo.LastWriteTime}");
Console.WriteLine($"属性: {dirInfo.Attributes}");

// 3. 获取子目录和文件
DirectoryInfo[] subDirs = dirInfo.GetDirectories();  // 获取子目录
FileInfo[] files = dirInfo.GetFiles();               // 获取文件
Console.WriteLine($"子目录: {subDirs.Length}, 文件: {files.Length}");

// 按模式过滤
FileInfo[] txtFiles = dirInfo.GetFiles("*.txt");     // 只获取 .txt 文件
DirectoryInfo[] sub2Dirs = dirInfo.GetDirectories("sub*");  // 匹配 sub 开头的目录

// 4. 递归搜索
// SearchOption.AllDirectories 递归搜索所有子目录
FileInfo[] allTxtFiles = dirInfo.GetFiles("*.txt", SearchOption.AllDirectories);
Console.WriteLine($"递归搜索 *.txt: {allTxtFiles.Length} 个");

// 5. 创建子目录
var subDir = dirInfo.CreateSubdirectory("child");    // 创建子目录
Console.WriteLine($"子目录已创建: {subDir.FullName}");

// 6. 删除
// dirInfo.Delete(recursive: true);  // 递归删除

// 7. DirectoryInfo vs Directory
// | Directory | DirectoryInfo |
// |-----------|---------------|
// | 静态方法 | 实例方法 |
// | 每次调用都解析路径 | 缓存路径信息 |
// | 适合单次操作 | 适合多次操作同一目录 |
Console.WriteLine("DirectoryInfo 适合多次操作同一目录，避免重复路径解析");
\`\`\`

### 三、FileInfo 类：文件信息 ⭐⭐⭐

\`\`\`csharp
// FileInfo 是 File 的面向对象版本
// 提供文件属性查询和操作方法

// 1. 创建 FileInfo
string filePath = "/tmp/fileinfo_demo.txt";
File.WriteAllText(filePath, "FileInfo 演示内容");

var fileInfo = new FileInfo(filePath);

// 2. 获取文件属性
Console.WriteLine($"文件名: {fileInfo.Name}");          // fileinfo_demo.txt
Console.WriteLine($"完整路径: {fileInfo.FullName}");
Console.WriteLine($"扩展名: {fileInfo.Extension}");     // .txt
Console.WriteLine($"目录: {fileInfo.DirectoryName}");   // /tmp
Console.WriteLine($"大小: {fileInfo.Length} 字节");      // 文件大小
Console.WriteLine($"创建时间: {fileInfo.CreationTime}");
Console.WriteLine($"最后修改: {fileInfo.LastWriteTime}");
Console.WriteLine($"最后访问: {fileInfo.LastAccessTime}");
Console.WriteLine($"只读: {fileInfo.IsReadOnly}");
Console.WriteLine($"属性: {fileInfo.Attributes}");

// 3. 文件操作
// 复制到新位置
string copyPath = "/tmp/fileinfo_copy.txt";
FileInfo copied = fileInfo.CopyTo(copyPath, overwrite: true);  // 复制文件
Console.WriteLine($"复制到: {copied.FullName}");

// 移动到新位置
string movePath = "/tmp/fileinfo_moved.txt";
fileInfo.MoveTo(movePath);                         // 移动/重命名文件
Console.WriteLine($"移动到: {movePath}");

// 移动到新位置后，fileInfo 对象会更新
// 注意：MoveTo 后原始 FileInfo 对象仍然可用，但指向新路径

// 4. 打开文件流
var movedFile = new FileInfo(movePath);
using (var stream = movedFile.OpenRead())          // 以只读方式打开
{
    using var reader = new StreamReader(stream);
    Console.WriteLine($"内容: {reader.ReadToEnd()}");
}

using (var stream = movedFile.OpenWrite())         // 以只写方式打开（覆盖）
{
    using var writer = new StreamWriter(stream);
    writer.Write("新内容");
}

// 5. 删除
movedFile.Delete();                                 // 删除文件
\`\`\`

### 四、DriveInfo：驱动器信息 ⭐⭐

\`\`\`csharp
// DriveInfo 获取系统驱动器的信息

// 1. 获取所有驱动器
DriveInfo[] drives = DriveInfo.GetDrives();         // 获取所有逻辑驱动器

foreach (var drive in drives)
{
    Console.WriteLine($"驱动器: {drive.Name}");       // 如 /, C:\\
    Console.WriteLine($"  类型: {drive.DriveType}");   // Fixed, Removable, CDRom, Network
    Console.WriteLine($"  格式: {drive.DriveFormat}"); // NTFS, FAT32, apfs, ext4
    Console.WriteLine($"  就绪: {drive.IsReady}");

    if (drive.IsReady)
    {
        Console.WriteLine($"  卷标: {drive.VolumeLabel}");
        Console.WriteLine($"  总大小: {drive.TotalSize / (1024 * 1024 * 1024)} GB");
        Console.WriteLine($"  可用空间: {drive.AvailableFreeSpace / (1024 * 1024 * 1024)} GB");
        Console.WriteLine($"  总可用: {drive.TotalFreeSpace / (1024 * 1024 * 1024)} GB");
    }
}

// 2. 获取特定驱动器
var rootDrive = new DriveInfo("/");                // Unix 根目录
// var cDrive = new DriveInfo("C:");                // Windows C 盘

if (rootDrive.IsReady)
{
    double freePercent = (double)rootDrive.AvailableFreeSpace / rootDrive.TotalSize * 100;
    Console.WriteLine($"根目录可用空间: {freePercent:F1}%");
}

// 3. DriveType 枚举
// | 类型 | 说明 |
// |------|------|
// | Unknown | 未知 |
// | NoRootDirectory | 无根目录 |
// | Removable | 可移动（U盘） |
// | Fixed | 固定磁盘 |
// | Network | 网络驱动器 |
// | CDRom | 光驱 |
// | Ram | RAM 磁盘 |
\`\`\`

### 五、FileSystemWatcher：文件系统监控 ⭐⭐⭐

\`\`\`csharp
// FileSystemWatcher 监控文件系统的变化（创建、修改、删除、重命名）
// 适合自动备份、日志监控、文件同步等场景

// 1. 基本用法
async Task FileSystemWatcherDemoAsync()
{
    string watchDir = "/tmp/watcher_demo";
    Directory.CreateDirectory(watchDir);

    using var watcher = new FileSystemWatcher(watchDir)
    {
        // 配置监控
        NotifyFilter = NotifyFilters.FileName        // 文件名变化
                     | NotifyFilters.DirectoryName    // 目录名变化
                     | NotifyFilters.LastWrite        // 最后写入时间
                     | NotifyFilters.Size,            // 文件大小变化

        Filter = "*.*",                              // 监控所有文件类型
        // Filter = "*.txt",                          // 只监控 .txt 文件
        IncludeSubdirectories = true,                // 是否包含子目录
        EnableRaisingEvents = true,                  // 启用事件（必须）
        InternalBufferSize = 64 * 1024               // 缓冲区大小（默认 8KB）
    };

    // 注册事件处理器
    watcher.Created += (sender, e) =>
    {
        Console.WriteLine($"[创建] {e.FullPath}");   // 文件/目录创建
    };

    watcher.Changed += (sender, e) =>
    {
        Console.WriteLine($"[修改] {e.FullPath} ({e.ChangeType})");  // 文件修改
    };

    watcher.Deleted += (sender, e) =>
    {
        Console.WriteLine($"[删除] {e.FullPath}");   // 文件/目录删除
    };

    watcher.Renamed += (sender, e) =>
    {
        Console.WriteLine($"[重命名] {e.OldFullPath} → {e.FullPath}");  // 重命名
    };

    watcher.Error += (sender, e) =>
    {
        Console.WriteLine($"[错误] {e.GetException().Message}");  // 缓冲区溢出等
    };

    // 触发一些文件变化
    Console.WriteLine("\\n开始监控，进行文件操作...");
    string testFile = Path.Combine(watchDir, "test.txt");
    File.WriteAllText(testFile, "初始内容");          // 触发 Created
    await Task.Delay(100);
    File.WriteAllText(testFile, "修改内容");          // 触发 Changed
    await Task.Delay(100);
    File.Move(testFile, Path.Combine(watchDir, "renamed.txt"));  // 触发 Renamed
    await Task.Delay(100);
    File.Delete(Path.Combine(watchDir, "renamed.txt"));  // 触发 Deleted
    await Task.Delay(500);

    Console.WriteLine("\\n监控演示完成");
}
await FileSystemWatcherDemoAsync();

// 2. FileSystemWatcher 注意事项
// - 短时间内大量变化可能导致缓冲区溢出（Error 事件）
// - 文件修改可能触发多个 Changed 事件
// - 事件在 ThreadPool 线程上触发，注意线程安全
// - 部分操作（如临时文件模式）可能触发多次事件
// - IncludeSubdirectories 会增加监控开销
\`\`\`

### 六、关键总结

| 类 | 用途 | 静态/实例 |
| --- | --- | --- |
| \`Directory\` | 目录操作 | 静态方法 |
| \`DirectoryInfo\` | 目录信息与操作 | 实例方法 |
| \`File\` | 文件读写 | 静态方法 |
| \`FileInfo\` | 文件信息与操作 | 实例方法 |
| \`DriveInfo\` | 驱动器信息 | 静态+实例 |
| \`FileSystemWatcher\` | 文件系统监控 | 事件驱动 |

**最佳实践**：
1. 单次操作用 \`Directory\`/\`File\` 静态方法
2. 多次操作用 \`DirectoryInfo\`/\`FileInfo\` 实例
3. 大目录用 \`EnumerateFiles\` 而非 \`GetFiles\`（内存友好）
4. 递归删除用 \`Delete(path, recursive: true)\`
5. \`FileSystemWatcher\` 注意缓冲区大小和事件频率
6. \`DriveInfo\` 检查 \`IsReady\` 后再访问属性

`,
  },

  // ============================================================
  // 第七十六章：JSON 序列化
  // ============================================================
  {
    id: 'csharp3-ch76',
    group: '第十四部分 文件IO与序列化',
    icon: '📋',
    title: '第七十六章 JSON 序列化',
    content: `## 第七十六章　JSON 序列化

\`System.Text.Json\` 是 .NET 内置的高性能 JSON 库，替代了 Newtonsoft.Json。本章讲解 JSON 序列化/反序列化的核心用法。

### 一、JsonSerializer.Serialize / Deserialize ⭐⭐⭐

\`\`\`csharp
// 1. 定义数据模型
record Person(string Name, int Age, string[]? Hobbies = null);
record Address(string Street, string City, string Country);

// 2. Serialize：将对象序列化为 JSON 字符串
var person = new Person("张三", 30, new[] { "编程", "阅读", "跑步" });
string json = JsonSerializer.Serialize(person);    // 默认序列化
Console.WriteLine($"序列化: {json}");
// 输出: {"Name":"张三","Age":30,"Hobbies":["编程","阅读","跑步"]}

// 3. Deserialize：将 JSON 字符串反序列化为对象
string jsonString = @"{""Name"":""李四"",""Age"":25,""Hobbies"":[""音乐"",""旅行""]}";
Person? deserialized = JsonSerializer.Deserialize<Person>(jsonString);
Console.WriteLine($"反序列化: Name={deserialized?.Name}, Age={deserialized?.Age}");

// 4. 文件序列化
async Task SerializeToFileAsync()
{
    var data = new Person("王五", 28, new[] { "摄影" });
    string filePath = "/tmp/person.json";

    // 写入文件
    using var stream = File.Create(filePath);
    await JsonSerializer.SerializeAsync(stream, data);  // 异步序列化到流
    Console.WriteLine("序列化到文件完成");

    // 从文件读取
    using var readStream = File.OpenRead(filePath);
    Person? loaded = await JsonSerializer.DeserializeAsync<Person>(readStream);
    Console.WriteLine($"从文件读取: {loaded?.Name}");
}
await SerializeToFileAsync();

// 5. Utf8JsonWriter：高性能写入
// 直接写入 UTF-8 字节，性能最高
using var ms = new MemoryStream();
using var writer = new Utf8JsonWriter(ms);
writer.WriteStartObject();                         // 开始对象
writer.WriteString("name", "张三");                // 写入字符串
writer.WriteNumber("age", 30);                     // 写入数字
writer.WriteStartArray("hobbies");                 // 开始数组
writer.WriteStringValue("编程");                   // 写入数组元素
writer.WriteStringValue("阅读");
writer.WriteEndArray();                            // 结束数组
writer.WriteEndObject();                           // 结束对象
writer.Flush();

string manualJson = Encoding.UTF8.GetString(ms.ToArray());
Console.WriteLine($"手动写入: {manualJson}");
\`\`\`

### 二、JsonSerializerOptions：配置选项 ⭐⭐⭐

\`\`\`csharp
// JsonSerializerOptions 控制序列化/反序列化的行为

// 1. 常用配置
var options = new JsonSerializerOptions
{
    // 命名策略：将 C# 属性名转为 camelCase
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    // Person.Name → "name", Person.Age → "age"

    // 格式化输出（缩进）
    WriteIndented = true,                          // 美化 JSON 输出

    // 忽略 null 值
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,

    // 允许 JSON 中的注释和尾随逗号
    ReadCommentHandling = JsonCommentHandling.Skip,
    AllowTrailingCommas = true,

    // 属性名大小写不敏感
    PropertyNameCaseInsensitive = true,

    // 编码器（控制特殊字符转义）
    Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,

    // 最大深度
    MaxDepth = 64
};

var person = new Person("张三", 30, null);         // Hobbies 为 null
string json = JsonSerializer.Serialize(person, options);
Console.WriteLine($"自定义选项:\\n{json}");
// 输出（camelCase，缩进，不输出 null）:
// {
//   "name": "张三",
//   "age": 30
// }

// 2. 属性级别控制（使用特性）
// [JsonPropertyName("full_name")]：自定义 JSON 属性名
// [JsonIgnore]：忽略该属性
// [JsonExtensionData]：捕获未知 JSON 属性

// 3. 全局默认选项
// 在 ASP.NET Core 中配置：
// services.ConfigureHttpJsonOptions(o => { ... });
// services.Configure<JsonSerializerOptions>(o => { ... });
\`\`\`

### 三、JsonDocument：只读 JSON 解析 ⭐⭐⭐

\`\`\`csharp
// JsonDocument 是高性能的只读 JSON 解析器
// 适合一次性解析 JSON 结构，不需要映射到具体类型

// 1. 基本用法
string json = @"
{
    ""name"": ""张三"",
    ""age"": 30,
    ""address"": {
        ""city"": ""北京"",
        ""street"": ""长安街""
    },
    ""hobbies"": [""编程"", ""阅读"", ""跑步""]
}";

using JsonDocument doc = JsonDocument.Parse(json);  // 解析 JSON
JsonElement root = doc.RootElement;                 // 获取根元素

// 2. 读取属性
string name = root.GetProperty("name").GetString()!;  // 获取字符串
int age = root.GetProperty("age").GetInt32();          // 获取整数
Console.WriteLine($"Name: {name}, Age: {age}");

// 3. 读取嵌套对象
JsonElement address = root.GetProperty("address");
string city = address.GetProperty("city").GetString()!;
Console.WriteLine($"City: {city}");

// 4. 读取数组
JsonElement hobbies = root.GetProperty("hobbies");
foreach (JsonElement hobby in hobbies.EnumerateArray())  // 遍历数组
{
    Console.WriteLine($"  爱好: {hobby.GetString()}");
}

// 5. 安全读取（TryGetProperty）
if (root.TryGetProperty("email", out JsonElement emailElement))
{
    Console.WriteLine($"Email: {emailElement.GetString()}");
}
else
{
    Console.WriteLine("Email 属性不存在");
}

// 6. 值类型检查
if (root.TryGetProperty("age", out JsonElement ageElem))
{
    if (ageElem.ValueKind == JsonValueKind.Number)
    {
        Console.WriteLine($"Age 是数字: {ageElem.GetInt32()}");
    }
}

// 7. JsonDocument 适用场景
// - 快速读取 JSON 中的特定字段
// - 不需要完整映射到 C# 对象
// - 需要高性能只读解析
// 注意：JsonDocument 是 disposable，需要 using
\`\`\`

### 四、JsonNode：可修改的 JSON DOM ⭐⭐⭐

\`\`\`csharp
// JsonNode 是 .NET 6+ 引入的可修改 JSON 文档对象模型
// 与 JsonDocument 不同，JsonNode 是可变的

// 1. 解析 JSON 为 JsonNode
string json = @"
{
    ""name"": ""张三"",
    ""age"": 30,
    ""hobbies"": [""编程"", ""阅读""]
}";

JsonNode? root = JsonNode.Parse(json);              // 解析 JSON

// 2. 读取属性
string name = (string)root!["name"]!;               // 索引器访问
int age = (int)root["age"]!;
Console.WriteLine($"Name: {name}, Age: {age}");

// 3. 修改属性
root["age"] = 31;                                   // 修改年龄
root["email"] = "zhangsan@example.com";             // 添加新属性
Console.WriteLine($"修改后: {root.ToJsonString()}");

// 4. 读取和修改数组
JsonArray hobbies = (JsonArray)root["hobbies"]!;
hobbies.Add("跑步");                                // 添加元素
// hobbies.RemoveAt(0);                              // 移除元素
Console.WriteLine($"爱好: {string.Join(", ", hobbies.Select(h => (string)h!))}");

// 5. 创建新的 JsonObject
var newObj = new JsonObject
{
    ["title"] = "Hello",
    ["count"] = 42,
    ["tags"] = new JsonArray("tag1", "tag2")
};
Console.WriteLine($"新对象: {newObj.ToJsonString()}");

// 6. JsonNode 适用场景
// - 需要修改 JSON 结构
// - 动态构建 JSON
// - 需要读写兼备的 JSON 操作
// 性能低于 JsonDocument，但更灵活
\`\`\`

### 五、自定义转换器 ⭐⭐⭐

\`\`\`csharp
// 自定义转换器让你控制特定类型的序列化/反序列化逻辑

// 1. 场景：将 DateTime 序列化为 Unix 时间戳
class UnixTimestampConverter : JsonConverter<DateTime>
{
    // 序列化：DateTime → Unix 时间戳（long）
    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        long unixTimestamp = new DateTimeOffset(value).ToUnixTimeSeconds();
        writer.WriteNumberValue(unixTimestamp);      // 写入数字
    }

    // 反序列化：Unix 时间戳 → DateTime
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        long unixTimestamp = reader.GetInt64();
        return DateTimeOffset.FromUnixTimeSeconds(unixTimestamp).DateTime;
    }
}

// 2. 使用自定义转换器
var options = new JsonSerializerOptions();
options.Converters.Add(new UnixTimestampConverter());

var obj = new { Name = "测试", CreatedAt = DateTime.Now };
string json = JsonSerializer.Serialize(obj, options);
Console.WriteLine($"Unix 时间戳: {json}");
// {"Name":"测试","CreatedAt":1752600000}

// 3. 在属性上使用 JsonConverter 特性
// class MyClass
// {
//     [JsonConverter(typeof(UnixTimestampConverter))]
//     public DateTime CreatedAt { get; set; }
// }

// 4. 场景：自定义枚举序列化
// 将枚举序列化为描述字符串
enum OrderStatus
{
    Pending,
    Shipped,
    Delivered,
    Cancelled
}

class EnumDescriptionConverter<T> : JsonConverter<T> where T : Enum
{
    public override T Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        string? value = reader.GetString();
        return (T)Enum.Parse(typeof(T), value!, ignoreCase: true);
    }

    public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString().ToLower());
    }
}

// 5. 自定义转换器适用场景
// - 特殊日期格式（如 Unix 时间戳、自定义格式）
// - 枚举映射（如字符串 ↔ 数字）
// - 多态序列化（基类/接口序列化）
// - 加密/解密字段
// - 兼容旧版 JSON 格式
\`\`\`

### 六、JSON 序列化最佳实践 ⭐⭐

\`\`\`csharp
// 1. 使用 System.Text.Json 源生成器（AOT 友好）
// 在 .NET 8 中，推荐使用源生成器提高性能
// [JsonSerializable(typeof(Person))]
// internal partial class MyJsonContext : JsonSerializerContext { }

// 使用源生成器序列化
// string json = JsonSerializer.Serialize(person, MyJsonContext.Default.Person);

// 2. 处理循环引用
// System.Text.Json 默认不支持循环引用
// 需要设置 ReferenceHandler
var options = new JsonSerializerOptions
{
    ReferenceHandler = ReferenceHandler.Preserve    // 保留引用（生成 $id/$ref）
    // ReferenceHandler = ReferenceHandler.IgnoreCycles  // 忽略循环引用（.NET 6+）
};

// 3. 选择正确的 API
// | 场景 | 推荐 API |
// |------|---------|
// | 简单序列化 | JsonSerializer.Serialize |
// | 只读解析 | JsonDocument |
// | 动态修改 | JsonNode |
// | 高性能写入 | Utf8JsonWriter |
// | 文件流 | SerializeAsync/DeserializeAsync |
// | AOT 编译 | 源生成器 JsonSerializerContext |

// 4. 性能注意事项
// - 重用 JsonSerializerOptions 实例
// - 使用 Stream 版本的 SerializeAsync/DeserializeAsync
// - 大 JSON 用 Utf8JsonReader/Utf8JsonWriter
// - 源生成器比反射更快

Console.WriteLine("System.Text.Json 性能优于 Newtonsoft.Json");
Console.WriteLine("推荐使用源生成器（AOT 友好）");
\`\`\`

### 七、关键总结

| API | 用途 | 特点 |
| --- | --- | --- |
| \`JsonSerializer.Serialize\` | 对象 → JSON 字符串 | 简单直接 |
| \`JsonSerializer.Deserialize\` | JSON 字符串 → 对象 | 简单直接 |
| \`JsonSerializerOptions\` | 配置序列化行为 | 命名、缩进、null 处理 |
| \`JsonDocument\` | 只读解析 | 高性能，不可变 |
| \`JsonNode\` | 可修改 DOM | 灵活，可变 |
| \`Utf8JsonWriter\` | 高性能写入 | 最高性能 |
| \`Utf8JsonReader\` | 高性能读取 | 最高性能 |
| 自定义转换器 | 特殊类型序列化 | 完全控制 |
| 源生成器 | AOT 兼容 | 高性能，无反射 |

**最佳实践**：
1. 优先使用 \`System.Text.Json\`（不需要 Newtonsoft.Json）
2. 重用 \`JsonSerializerOptions\` 实例
3. 大文件用 \`SerializeAsync\`/\`DeserializeAsync\`
4. 只读解析用 \`JsonDocument\`
5. 需要修改 JSON 用 \`JsonNode\`
6. AOT 场景用源生成器
7. 特殊类型用自定义转换器

`,
  },

  // ============================================================
  // 第七十七章：正则表达式
  // ============================================================
  {
    id: 'csharp3-ch77',
    group: '第十四部分 文件IO与序列化',
    icon: '🔍',
    title: '第七十七章 正则表达式',
    content: `## 第七十七章　正则表达式

正则表达式是字符串模式匹配的利器。\`System.Text.RegularExpressions.Regex\` 类提供了丰富的正则操作。

### 一、Regex 类基础 ⭐⭐⭐

\`\`\`csharp
// Regex 类提供正则表达式的匹配、替换、分割等操作

// 1. IsMatch：检查是否匹配
string text = "我的邮箱是 zhangsan@example.com，电话是 138-1234-5678";

bool hasEmail = Regex.IsMatch(text, @"\\w+@\\w+\\.\\w+");  // 是否包含邮箱格式
Console.WriteLine($"包含邮箱? {hasEmail}");                  // true

bool hasPhone = Regex.IsMatch(text, @"\\d{3}-\\d{4}-\\d{4}");  // 是否包含手机号
Console.WriteLine($"包含手机号? {hasPhone}");                 // true

// 2. Match：获取第一个匹配
Match match = Regex.Match(text, @"\\w+@\\w+\\.\\w+");      // 获取第一个匹配
if (match.Success)
{
    Console.WriteLine($"匹配值: {match.Value}");              // zhangsan@example.com
    Console.WriteLine($"索引: {match.Index}");                // 起始位置
    Console.WriteLine($"长度: {match.Length}");               // 匹配长度
}

// 3. Matches：获取所有匹配
string numbers = "1, 22, 333, 4444, 55555";
MatchCollection matches = Regex.Matches(numbers, @"\\d+");  // 匹配所有数字
Console.WriteLine($"找到 {matches.Count} 个数字:");
foreach (Match m in matches)
{
    Console.WriteLine($"  {m.Value}");                        // 1, 22, 333, 4444, 55555
}

// 4. Replace：替换匹配内容
string original = "我的电话是 138-1234-5678 和 139-8765-4321";
string masked = Regex.Replace(original, @"\\d{3}-\\d{4}-\\d{4}", "***-****-****");
Console.WriteLine($"脱敏后: {masked}");                       // 我的电话是 ***-****-**** 和 ***-****-****

// 使用 MatchEvaluator 动态替换
string replaced = Regex.Replace(original, @"\\d+", match =>
{
    return new string('*', match.Value.Length);              // 数字长度等量替换
});
Console.WriteLine($"动态替换: {replaced}");

// 5. Split：按正则分割
string csv = "张三,李四,王五,赵六";
string[] parts = Regex.Split(csv, @",\\s*");                 // 按逗号分割（忽略空格）
Console.WriteLine($"分割结果: [{string.Join(" | ", parts)}]");

// 6. RegexOptions：正则选项
// RegexOptions.IgnoreCase：忽略大小写
// RegexOptions.Multiline：多行模式（^$ 匹配行首尾，而非字符串首尾）
// RegexOptions.Singleline：单行模式（. 匹配换行符）
// RegexOptions.Compiled：编译正则（提高运行时性能，增加启动时间）
// RegexOptions.RightToLeft：从右到左匹配
// RegexOptions.ECMAScript：ECMAScript 兼容模式
\`\`\`

### 二、正则表达式基础语法 ⭐⭐⭐

\`\`\`csharp
// 正则表达式由普通字符和元字符组成

// 1. 锚点（Anchors）
// ^ ：字符串开头
// $ ：字符串结尾
// \\b ：单词边界
// \\B ：非单词边界

Console.WriteLine("=== 锚点 ===");
Console.WriteLine(Regex.IsMatch("hello world", @"^hello"));   // true（以 hello 开头）
Console.WriteLine(Regex.IsMatch("hello world", @"world$"));   // true（以 world 结尾）
Console.WriteLine(Regex.IsMatch("hello world", @"^hello$"));  // false（不以 hello 结尾）
Console.WriteLine(Regex.IsMatch("hello world", @"\\bworld\\b")); // true（world 是独立单词）
Console.WriteLine(Regex.IsMatch("helloworld", @"\\bworld\\b"));  // false（world 不是独立单词）

// 2. 字符类（Character Classes）
// \\d ：数字 [0-9]
// \\D ：非数字
// \\w ：单词字符 [a-zA-Z0-9_]
// \\W ：非单词字符
// \\s ：空白字符（空格、制表符、换行）
// \\S ：非空白字符
// \\p{L} ：Unicode 字母
// \\p{IsCJKUnifiedIdeographs}：中文字符

Console.WriteLine("\\n=== 字符类 ===");
Console.WriteLine(Regex.IsMatch("123", @"^\\d+$"));           // true（纯数字）
Console.WriteLine(Regex.IsMatch("abc", @"^\\w+$"));           // true（单词字符）
Console.WriteLine(Regex.IsMatch("a c", @"\\s"));              // true（包含空白）
Console.WriteLine(Regex.IsMatch("中文", @"\\p{IsCJKUnifiedIdeographs}+"));  // true（中文）

// 3. 量词（Quantifiers）
// * ：0 次或多次
// + ：1 次或多次
// ? ：0 次或 1 次
// {n} ：恰好 n 次
// {n,} ：至少 n 次
// {n,m} ：n 到 m 次

Console.WriteLine("\\n=== 量词 ===");
Console.WriteLine(Regex.IsMatch("", @"^\\d*$"));              // true（0 个数字）
Console.WriteLine(Regex.IsMatch("123", @"^\\d+$"));           // true（1 个以上）
Console.WriteLine(Regex.IsMatch("123", @"^\\d{3}$"));         // true（恰好 3 个）
Console.WriteLine(Regex.IsMatch("12345", @"^\\d{3,5}$"));     // true（3-5 个）
Console.WriteLine(Regex.IsMatch("", @"^\\d?$"));              // true（0 或 1 个）

// 4. 分组（Groups）
// (...) ：捕获分组
// (?:...) ：非捕获分组
// (?<name>...) ：命名分组
// \\1, \\2 ：反向引用

Console.WriteLine("\\n=== 分组 ===");
string email = "zhangsan@example.com";
Match emailMatch = Regex.Match(email, @"^(\\w+)@(\\w+)\\.(\\w+)$");
// 分组 1：用户名，分组 2：域名，分组 3：顶级域名
Console.WriteLine($"用户名: {emailMatch.Groups[1].Value}");   // zhangsan
Console.WriteLine($"域名: {emailMatch.Groups[2].Value}");     // example
Console.WriteLine($"顶级域: {emailMatch.Groups[3].Value}");   // com

// 命名分组
Match namedMatch = Regex.Match(email, @"^(?<user>\\w+)@(?<domain>\\w+)\\.(?<tld>\\w+)$");
Console.WriteLine($"user: {namedMatch.Groups["user"].Value}");    // zhangsan
Console.WriteLine($"domain: {namedMatch.Groups["domain"].Value}"); // example
Console.WriteLine($"tld: {namedMatch.Groups["tld"].Value}");       // com

// 反向引用：匹配重复字符
Console.WriteLine(Regex.IsMatch("hello", @"(\\w)\\1"));       // true（ll 是重复字符）
Console.WriteLine(Regex.IsMatch("world", @"(\\w)\\1"));       // false（没有重复字符）
\`\`\`

### 三、常用正则模式 ⭐⭐⭐

\`\`\`csharp
// 1. 邮箱验证
string emailPattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
Console.WriteLine($"邮箱验证:");
Console.WriteLine($"  zhangsan@example.com: {Regex.IsMatch("zhangsan@example.com", emailPattern)}");  // true
Console.WriteLine($"  invalid-email: {Regex.IsMatch("invalid-email", emailPattern)}");                // false

// 2. 手机号验证（中国）
string phonePattern = @"^1[3-9]\\d{9}$";
Console.WriteLine($"手机号验证:");
Console.WriteLine($"  13812345678: {Regex.IsMatch("13812345678", phonePattern)}");  // true
Console.WriteLine($"  12345678901: {Regex.IsMatch("12345678901", phonePattern)}");  // false

// 3. URL 验证
string urlPattern = @"^https?://[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-.,@?^=%&:/~+#]*[\\w\\-@?^=%&/~+#])?$";
Console.WriteLine($"URL 验证:");
Console.WriteLine($"  https://www.example.com: {Regex.IsMatch("https://www.example.com", urlPattern)}");  // true
Console.WriteLine($"  not-a-url: {Regex.IsMatch("not-a-url", urlPattern)}");  // false

// 4. 身份证号（18 位）
string idPattern = @"^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$";
Console.WriteLine($"身份证验证:");
Console.WriteLine($"  valid: {Regex.IsMatch("110101199001011234", idPattern)}");  // true

// 5. IP 地址
string ipPattern = @"^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$";
Console.WriteLine($"IP 验证:");
Console.WriteLine($"  192.168.1.1: {Regex.IsMatch("192.168.1.1", ipPattern)}");    // true
Console.WriteLine($"  999.999.999.999: {Regex.IsMatch("999.999.999.999", ipPattern)}");  // false

// 6. 日期格式（YYYY-MM-DD）
string datePattern = @"^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$";
Console.WriteLine($"日期验证:");
Console.WriteLine($"  2026-07-18: {Regex.IsMatch("2026-07-18", datePattern)}");  // true
Console.WriteLine($"  2026-13-01: {Regex.IsMatch("2026-13-01", datePattern)}");  // false

// 7. 密码强度（至少 8 位，包含大小写字母和数字）
string passwordPattern = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$";
Console.WriteLine($"密码验证:");
Console.WriteLine($"  Abc12345: {Regex.IsMatch("Abc12345", passwordPattern)}");    // true
Console.WriteLine($"  abc123: {Regex.IsMatch("abc123", passwordPattern)}");        // false（不够 8 位，无大写）

// 8. 提取中文
string chinesePattern = @"[\\u4e00-\\u9fff]+";
string mixed = "Hello 世界 你好 World";
MatchCollection chineseMatches = Regex.Matches(mixed, chinesePattern);
Console.WriteLine($"中文提取: {string.Join(", ", chineseMatches.Select(m => m.Value))}");  // 世界, 你好
\`\`\`

### 四、RegexOptions 详解 ⭐⭐

\`\`\`csharp
// 1. IgnoreCase：忽略大小写
string text = "Hello World";
Console.WriteLine($"忽略大小写: {Regex.IsMatch(text, @"hello", RegexOptions.IgnoreCase)}");  // true
Console.WriteLine($"区分大小写: {Regex.IsMatch(text, @"hello")}");  // false

// 2. Multiline：多行模式
// ^ 和 $ 匹配每行的开头和结尾（而非整个字符串的开头和结尾）
string multiLine = "第一行\\n第二行\\n第三行";
MatchCollection lineMatches = Regex.Matches(multiLine, @"^第.行$", RegexOptions.Multiline);
Console.WriteLine($"多行匹配: {lineMatches.Count} 行");  // 3 行

// 3. Singleline：单行模式
// . 匹配包括换行符在内的所有字符
string withNewline = "hello\\nworld";
Console.WriteLine($"单行模式: {Regex.IsMatch(withNewline, @"hello.world", RegexOptions.Singleline)}");  // true
Console.WriteLine($"默认模式: {Regex.IsMatch(withNewline, @"hello.world")}");  // false（. 不匹配换行）

// 4. Compiled：编译正则表达式
// 适合频繁使用的正则，提高运行时性能
// 但会增加启动时间和内存占用
var compiledRegex = new Regex(@"\\d+", RegexOptions.Compiled);
Console.WriteLine($"编译正则: {compiledRegex.IsMatch("123")}");  // true

// 5. 组合选项
var combinedOptions = RegexOptions.IgnoreCase | RegexOptions.Multiline | RegexOptions.Compiled;
var regex = new Regex(@"^hello", combinedOptions);

// 6. 内联选项
// 可以在正则表达式内部使用 (?i) 等设置选项
// (?i)：忽略大小写
// (?m)：多行模式
// (?s)：单行模式
// (?i-m)：启用忽略大小写，禁用多行模式
Console.WriteLine($"内联忽略大小写: {Regex.IsMatch("HELLO", @"(?i)hello")}");  // true
\`\`\`

### 五、正则表达式实战 ⭐⭐⭐

\`\`\`csharp
// 1. 提取 URL 中的域名
string ExtractDomain(string url)
{
    var match = Regex.Match(url, @"https?://([^/]+)");
    return match.Success ? match.Groups[1].Value : "";
}
Console.WriteLine($"域名: {ExtractDomain("https://www.example.com/path?q=1")}");  // www.example.com

// 2. 格式化数字（每三位加逗号）
string FormatNumber(string number)
{
    return Regex.Replace(number, @"(\\d)(?=(\\d{3})+(?!\\d))", "$1,");
}
Console.WriteLine($"格式化: {FormatNumber("1234567890")}");  // 1,234,567,890

// 3. HTML 标签清理
string StripHtml(string html)
{
    return Regex.Replace(html, @"<[^>]+>", "");  // 移除所有 HTML 标签
}
Console.WriteLine($"清理 HTML: {StripHtml("<p>Hello <b>World</b></p>")}");  // Hello World

// 4. 驼峰转下划线
string CamelToSnake(string camelCase)
{
    return Regex.Replace(camelCase, @"([a-z])([A-Z])", "$1_$2").ToLower();
}
Console.WriteLine($"驼峰转下划线: {CamelToSnake("userNameAndAge")}");  // user_name_and_age

// 5. 验证并提取 JSON 中的字段（简单场景）
string ExtractJsonField(string json, string field)
{
    var match = Regex.Match(json, @$"""{field}"":\s*""([^""]*)""");  // 匹配字符串值
    return match.Success ? match.Groups[1].Value : "";
}
Console.WriteLine($"提取 JSON: {ExtractJsonField(@"{\\"name\\":\\"张三\\",\\"age\\":30}", "name")}");  // 张三

// 6. 日志解析
string ParseLogLine(string logLine)
{
    // 格式: [2026-07-18 14:30:00] [ERROR] 错误信息
    var pattern = @"\\[(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})\\] \\[(\\w+)\\] (.+)";
    var match = Regex.Match(logLine, pattern);
    if (match.Success)
    {
        return $"时间: {match.Groups[1].Value}, 级别: {match.Groups[2].Value}, 消息: {match.Groups[3].Value}";
    }
    return "解析失败";
}
Console.WriteLine(ParseLogLine("[2026-07-18 14:30:00] [ERROR] 数据库连接失败"));
\`\`\`

### 六、何时使用/避免正则 ⭐⭐

\`\`\`csharp
// ✅ 适合使用正则的场景：
// 1. 模式匹配和验证（邮箱、手机号、URL 等）
// 2. 文本提取（从 HTML 中提取链接、从日志中提取关键信息）
// 3. 字符串替换（脱敏、格式化）
// 4. 字符串分割（复杂分隔符）

// ❌ 不适合使用正则的场景：
// 1. 解析 HTML/XML（使用 HtmlAgilityPack 或 System.Xml）
//    HTML 不是正则语言，嵌套标签无法用正则可靠解析
// 2. 解析 JSON（使用 JsonSerializer 或 JsonDocument）
// 3. 复杂的业务逻辑（正则难以维护和调试）
// 4. 简单的字符串操作（用 IndexOf、Contains、Replace 等更快）

// 性能提示：
// 1. 重用 Regex 实例（不要每次创建新的 Regex 对象）
// 2. 使用 RegexOptions.Compiled 编译频繁使用的正则
// 3. 使用 [GeneratedRegex] 源生成器（.NET 7+）
// 4. 避免回溯爆炸（如 (a*)* 对 "aaaaaaaaaaaaaaaaaaaaab" 匹配）
// 5. 超时设置：new Regex(pattern, RegexOptions.None, TimeSpan.FromSeconds(1))
\`\`\`

### 七、关键总结

| 方法 | 用途 |
| --- | --- |
| \`Regex.IsMatch\` | 检查是否匹配 |
| \`Regex.Match\` | 获取第一个匹配 |
| \`Regex.Matches\` | 获取所有匹配 |
| \`Regex.Replace\` | 替换匹配内容 |
| \`Regex.Split\` | 按正则分割 |

**基础语法**：
| 元字符 | 含义 |
| --- | --- |
| \`^\` | 开头 |
| \`$\` | 结尾 |
| \`\\d\` | 数字 |
| \`\\w\` | 单词字符 |
| \`\\s\` | 空白 |
| \`*\` | 0 次或多次 |
| \`+\` | 1 次或多次 |
| \`?\` | 0 次或 1 次 |
| \`{n,m}\` | n 到 m 次 |
| \`()\` | 分组 |
| \`[]\` | 字符类 |

**最佳实践**：
1. 重用 Regex 实例，避免反复创建
2. 频繁使用的正则用 \`RegexOptions.Compiled\`
3. .NET 7+ 使用 \`[GeneratedRegex]\` 源生成器
4. 不要用正解析 HTML/XML/JSON
5. 简单的字符串操作用 string 方法更高效
6. 添加超时防止回溯爆炸

`,
  },
  {
    id: 'csharp3-ch78',
    group: '第十四部分 文件IO与序列化',
    icon: '🔤',
    title: '第七十八章 文本编码与字符集',
    content: `## 第七十八章　文本编码与字符集

文件读写涉及字节与字符的转换，编码（Encoding）就是这套规则。本章深入讲解 ASCII、UTF-8、UTF-16、GB2312 等常见编码，C# 中 \`System.Text.Encoding\` 的使用方式，以及乱码问题的根因与解决方案。

### 一、为什么需要编码 ⭐⭐⭐

计算机只认识字节（数字），不认识字符。把字符转成字节的规则就是编码。

\`\`\`csharp
// 字符 'A' 在不同编码下的字节表示
// ASCII 编码:   0x41（1 字节）
// UTF-8 编码:   0x41（1 字节，与 ASCII 兼容）
// UTF-16 编码:  0x0041（2 字节）
// GB2312 编码:  0x41（1 字节）

// 中文字符 '中' 在不同编码下
// UTF-8:        E4 B8 AD（3 字节）
// UTF-16:       4E2D（2 字节）
// GB2312/GBK:   D6 D0（2 字节）

using System.Text;
Console.OutputEncoding = Encoding.UTF8;

Console.WriteLine($"UTF-8  编码中字: {BitConverter.ToString(Encoding.UTF8.GetBytes("中"))}");
Console.WriteLine($"UTF-16 编码中字: {BitConverter.ToString(Encoding.Unicode.GetBytes("中"))}");
Console.WriteLine($"GBK    编码中字: {BitConverter.ToString(Encoding.GetEncoding("GBK").GetBytes("中"))}");
\`\`\`

### 二、常见编码速查 ⭐⭐⭐

| 编码 | 特点 | 适用场景 |
| --- | --- | --- |
| ASCII | 7 位，128 字符 | 英文字符 |
| UTF-8 | 变长 1-4 字节，ASCII 兼容 | ⭐ Web、文件、网络（默认） |
| UTF-16 (Unicode) | 2 或 4 字节 | Windows API、.NET 内部 |
| UTF-32 | 固定 4 字节 | 处理大量 BMP 字符 |
| GB2312 | 简体中文 2 字节 | 旧中文系统 |
| GBK | GB2312 超集 | 简体中文 Windows |
| GB18030 | GBK 超集，包含全部 Unicode | 中国国家标准 |
| Big5 | 繁体中文 | 台湾、香港 |
| Shift-JIS | 日文 | 日本 |
| EUC-KR | 韩文 | 韩国 |
| ISO-8859-1 | 西欧 | 旧 HTTP/邮件 |
| Windows-1252 | 西欧含特殊字符 | Windows 西欧 |

### 三、.NET 中的 Encoding 类 ⭐⭐⭐

\`\`\`csharp
// 1. 获取编码实例
Encoding utf8 = Encoding.UTF8;             // 推荐：UTF-8 with BOM
Encoding utf8NoBom = new UTF8Encoding(false); // UTF-8 无 BOM
Encoding unicode = Encoding.Unicode;      // UTF-16 LE（.NET 默认）
Encoding ascii = Encoding.ASCII;
Encoding latin1 = Encoding.Latin1;         // ISO-8859-1

// 2. 编码/解码
string text = "你好，世界！Hello, World!";
byte[] bytes = utf8.GetBytes(text);     // 字符串 → 字节
string decoded = utf8.GetString(bytes); // 字节 → 字符串
Console.WriteLine($"UTF-8 字节数: {bytes.Length}");

// 3. 获取所有支持的编码
Console.WriteLine($"系统共支持 {Encoding.GetEncodings().Length} 种编码");

// 4. 通过代码页获取
Encoding gbk = Encoding.GetEncoding(936);  // 936 = GBK
\`\`\`

### 四、StreamReader / StreamWriter 的编码 ⭐⭐⭐

\`\`\`csharp
// 默认 UTF-8 with BOM
using (var sw = new StreamWriter("utf8.txt"))
{
    sw.WriteLine("UTF-8 with BOM");
}

// 显式 UTF-8 without BOM
using (var sw = new StreamWriter("utf8-nobom.txt", false, new UTF8Encoding(false)))
{
    sw.WriteLine("UTF-8 without BOM");
}

// 读取时必须指定相同编码，否则会乱码
string content;
using (var sr = new StreamReader("utf8.txt", Encoding.UTF8))
{
    content = sr.ReadToEnd();
}
Console.WriteLine(content);
\`\`\`

### 五、乱码问题排查 ⭐⭐⭐

\`\`\`csharp
// 场景：用 UTF-8 写文件，用 GBK 读文件 → 乱码
// "中" 的 UTF-8 字节是 E4 B8 AD，GBK 解析为 "涓"

// 解决：读写都用相同编码
string chinese = "中文测试";

// 错误：用 UTF-8 写，GBK 读
File.WriteAllText("wrong.txt", chinese, Encoding.UTF8);
string garbled = File.ReadAllText("wrong.txt", Encoding.GetEncoding("GBK"));
Console.WriteLine($"乱码: {garbled}");  // 输出乱码

// 正确：用 UTF-8 写，UTF-8 读
File.WriteAllText("correct.txt", chinese, Encoding.UTF8);
string correct = File.ReadAllText("correct.txt", Encoding.UTF8);
Console.WriteLine($"正确: {correct}");  // 正常显示

// 检测文件编码：读取 BOM 头
byte[] bom = File.ReadAllBytes("correct.txt").Take(3).ToArray();
if (bom.SequenceEqual(new byte[] { 0xEF, 0xBB, 0xBF }))
    Console.WriteLine("UTF-8 with BOM");
else if (bom.SequenceEqual(new byte[] { 0xFF, 0xFE }))
    Console.WriteLine("UTF-16 LE");
\`\`\`

### 六、BOM（字节顺序标记）⭐⭐

\`\`\`csharp
// BOM = Byte Order Mark，文件开头的特殊字节标识编码
// UTF-8 with BOM:    EF BB BF
// UTF-16 LE with BOM: FF FE
// UTF-16 BE with BOM: FE FF
// UTF-32 LE with BOM: FF FE 00 00

// .NET 的 Encoding.UTF8 默认带 BOM
// Web 和 Unix 工具通常不要 BOM
// 建议：跨平台文件用 UTF-8 without BOM
Encoding utf8NoBom = new UTF8Encoding(encoderShouldEmitUTF8Identifier: false);
File.WriteAllText("nobom.txt", "test", utf8NoBom);

// PowerShell / cat 工具可能因为 BOM 报错："锘縖est"
// 解决：保存为 UTF-8 without BOM
\`\`\`

### 七、跨平台编码实践 ⭐⭐

\`\`\`csharp
// 1. 配置文件用 UTF-8（不要 GBK）
Encoding configEncoding = Encoding.UTF8;
File.WriteAllText("appsettings.json", "{\"name\":\"张三\"}", configEncoding);

// 2. CSV 文件：UTF-8 with BOM，让 Excel 正确识别中文
Encoding csvEncoding = new UTF8Encoding(true);
File.WriteAllText("data.csv", "名称,年龄\n张三,25\n李四,30", csvEncoding);

// 3. 日志文件：UTF-8 without BOM，方便 Linux 工具处理
Encoding logEncoding = new UTF8Encoding(false);
File.WriteAllText("app.log", "用户登录\n", logEncoding);
\`\`\`

### 八、最佳实践

- ⭐ **默认用 UTF-8**（带或不带 BOM 看场景），不要用 GBK。
- ⭐ 跨平台文件用 **UTF-8 without BOM**，配置文件用 UTF-8。
- ⭐ CSV / Excel 用 **UTF-8 with BOM** 让 Excel 正确识别。
- ⭐ HTTP / JSON 全部用 **UTF-8**（RFC 8259 规定）。
- ⭐ 避免用 \`Encoding.Default\`（跟随系统，可能 GBK）。
- ⭐ 读取外部文件时 **显式指定编码**，不要依赖默认值。

### 九、小结

- ⭐ **UTF-8 是事实标准**，日常开发首选。
- ⭐ 乱码 = 读和写用了不同编码，永远 100% 是这个问题。
- ⭐ C# 字符串内部用 UTF-16，但 I/O 默认 UTF-8。
- ⭐ 跨平台项目：写代码全部用 UTF-8，配置文件 .editorconfig 强制 UTF-8。
- ⭐ 处理 BOM 头时，UTF-8 BOM 是 3 字节 \`EF BB BF\`。`,
  },
];

export { chapters };