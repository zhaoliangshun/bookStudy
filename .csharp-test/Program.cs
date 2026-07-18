// === 日志系统使用 ===
using var logger = new FileLogger("logs/app.log");
logger.Info("服务启动");
logger.Warn("磁盘空间不足");
try
{
    throw new InvalidOperationException("测试异常");
}
catch (Exception ex)
{
    logger.Error("操作失败", ex);
}

// 类型声明在末尾
public class FileLogger : IDisposable
{
    private readonly StreamWriter _writer;
    private readonly object _lock = new();

    public FileLogger(string path)
    {
        var dir = Path.GetDirectoryName(path);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
            Directory.CreateDirectory(dir);
        _writer = new StreamWriter(path, append: true);
    }

    public void Log(string level, string message)
    {
        lock (_lock)
        {
            var line = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] [{level}] {message}";
            _writer.WriteLine(line);
            _writer.Flush();
            Console.WriteLine(line);
        }
    }

    public void Info(string message) => Log("INFO", message);
    public void Warn(string message) => Log("WARN", message);
    public void Error(string message, Exception? ex = null)
        => Log("ERROR", ex == null ? message : $"{message} | {ex}");

    public void Dispose()
    {
        _writer?.Dispose();
    }
}
