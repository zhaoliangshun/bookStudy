// =============================================================
// Java 交互式教程 —— 第十二批章节（异常处理深入组，共 15 章）
// =============================================================

export const chapters = [
  {
    id: "java-exception-hierarchy",
    group: "异常处理深入",
    icon: "🌳",
    title: "异常体系",
    content: `# 异常体系

Java 异常体系是一个以 \`Throwable\` 为根的类层次结构，所有错误和异常都派生自它。理解这棵树是掌握异常处理的前提。

## 顶层结构

\`\`\`
Throwable
├── Error          // 严重错误，程序不应捕获
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── ...
└── Exception      // 程序可处理的异常
    ├── RuntimeException   // Unchecked
    │   ├── NullPointerException
    │   ├── ClassCastException
    │   └── ...
    └── 其他 Exception      // Checked
        ├── IOException
        └── SQLException
\`\`\`

## Error

\`Error\` 表示 JVM 级别的严重问题，例如内存溢出、栈溢出。这类问题程序通常无法恢复，**不应该**用 try-catch 捕获，而应从配置或逻辑上规避。

## Exception

\`Exception\` 是程序级别的异常，分两类：

- **Checked Exception**：继承自 \`Exception\` 但**不**继承 \`RuntimeException\`，编译期强制处理（try-catch 或 throws）。
- **Unchecked Exception**：继承自 \`RuntimeException\`，编译器不强制处理，通常是程序逻辑错误。

## RuntimeException

\`RuntimeException\` 是 Unchecked 异常的基类。常见的有 \`NullPointerException\`、\`IllegalArgumentException\`、\`ArrayIndexOutOfBoundsException\` 等，它们通常表示编程错误，应在代码层面修复而非捕获。

## 为什么这样设计

Checked 异常用于表示可恢复的业务异常（如文件不存在、网络中断），强制调用者处理；Unchecked 异常用于表示编程错误，避免到处写 try-catch。

## isAssignableFrom 判断继承

通过反射的 \`isAssignableFrom\` 可以判断异常类型之间的继承关系，用于区分 Checked 与 Unchecked。

## Throwable 的常用方法

\`Throwable\` 提供了访问异常信息的方法：

- \`getMessage()\`：获取异常的详细消息字符串
- \`getLocalizedMessage()\`：本地化消息（默认同 getMessage）
- \`getStackTrace()\`：返回堆栈跟踪数组 \`StackTraceElement[]\`
- \`printStackTrace()\`：把异常和堆栈打印到标准错误流
- \`getCause()\`：获取底层原因异常（异常链）
- \`initCause(Throwable)\`：设置原因异常

## 栈轨迹

每个异常都携带创建时的调用栈快照，从抛出点向上回溯到 \`main\`。阅读堆栈时**从上往下**看，最顶部是异常发生的确切位置，下方是调用链。\`at\` 行包含类名、方法名、文件名和行号，是排查问题的关键线索。

下面通过代码演示异常体系的判断：`,
    code: `// 演示 Java 异常体系的判断
public class Main {
    public static void main(String[] args) {
        Class<?> throwable = Throwable.class;
        Class<?> error = Error.class;
        Class<?> exception = Exception.class;
        Class<?> runtime = RuntimeException.class;

        // 判断继承关系
        System.out.println("Error 是 Throwable 的子类: " + throwable.isAssignableFrom(error));
        System.out.println("Exception 是 Throwable 的子类: " + throwable.isAssignableFrom(exception));
        System.out.println("RuntimeException 是 Exception 的子类: " + exception.isAssignableFrom(runtime));

        // 区分 Checked 与 Unchecked
        System.out.println("IOException 是 Checked: " + isChecked(java.io.IOException.class));
        System.out.println("NullPointerException 是 Unchecked: " + !isChecked(NullPointerException.class));
        System.out.println("Error 不算 Checked: " + !isChecked(Error.class));

        // 演示抛出运行时异常
        try {
            throw new RuntimeException("运行时异常示例");
        } catch (RuntimeException e) {
            System.out.println("捕获运行时异常: " + e.getMessage());
        }
    }

    // 判断是否为 Checked 异常：是 Exception 的子类，但不是 RuntimeException 的子类
    static boolean isChecked(Class<?> clazz) {
        return Exception.class.isAssignableFrom(clazz)
            && !RuntimeException.class.isAssignableFrom(clazz);
    }
}`
  },
  {
    id: "java-checked-unchecked",
    group: "异常处理深入",
    icon: "✅",
    title: "Checked vs Unchecked 异常",
    content: `# Checked vs Unchecked 异常

Java 异常最核心的设计就是区分 **Checked** 和 **Unchecked** 两种异常，它们的处理策略截然不同。

## Checked 异常

继承自 \`Exception\`（但不是 \`RuntimeException\`）的异常是 Checked 异常。编译器在**编译期**检查调用者是否处理了它们：

\`\`\`java
public void readFile(String path) throws IOException {
    // 必须声明 throws 或在方法内 try-catch
    FileInputStream fis = new FileInputStream(path);
}
\`\`\`

调用方必须二选一：
- 用 try-catch 捕获
- 用 throws 继续向上声明

## Unchecked 异常

继承自 \`RuntimeException\` 的异常是 Unchecked 异常，编译器**不强制**处理：

\`\`\`java
public int divide(int a, int b) {
    if (b == 0) throw new ArithmeticException("除数为零"); // 无需声明 throws
    return a / b;
}
\`\`\`

## 设计哲学

- **Checked**：表示可恢复的外部条件，调用者应该处理（如 IO 失败、网络中断）。强制处理让 API 契约更清晰。
- **Unchecked**：表示编程错误或不可恢复的状态（如空指针、参数非法）。捕获它们通常没有意义。

## 何时用哪种

| 场景 | 选择 |
|------|------|
| 文件/网络/数据库 IO 失败 | Checked |
| 业务规则违反（余额不足） | 看情况，常自定义 Checked |
| 参数非法、空指针 | Unchecked |
| 不可恢复的系统故障 | Error 或 Unchecked |

## 接口中的 throws

接口方法声明的 throws 是契约的一部分。实现类必须遵守：可以声明更窄或相同的 Checked 异常，但不能更宽。设计接口时要慎重选择 Checked 还是 Unchecked，因为它会强制所有实现者和调用者处理。这也是很多现代接口倾向于 Unchecked 的原因。

## Checked 异常的争议

Checked 异常虽然保证了健壮性，但也带来"异常吞咽"（catch 后什么都不做）和层级污染问题。现代框架（如 Spring）倾向于将 Checked 包装为 Unchecked。

## 传播与处理策略

Checked 异常沿调用栈向上传播，每一层要么 catch 要么 throws。如果一路声明到 \`main\` 方法仍未处理，程序会终止并打印堆栈。因此 Checked 异常会"污染"中间层的方法签名，这是它最大的争议点。

## Unchecked 的优势

Unchecked 异常可以"穿透"不关心的中间层，只在真正需要处理的地方 catch。这让分层代码更干净，业务层不必为底层 IO 异常逐层声明 throws。这也是 Spring、Hibernate 等框架把 Checked 包装为 Unchecked 的原因。

## 一个经验法则

如果调用者能从异常中**有意义地恢复**，用 Checked；如果异常表示编程错误或调用者**无能为力**，用 Unchecked。当拿不准时，倾向于 Unchecked，让代码更简洁。

下面通过代码对比两种异常的处理方式：`,
    code: `// 对比 Checked 与 Unchecked 异常的处理方式
import java.io.FileInputStream;
import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        // Unchecked 异常：编译器不强制处理
        try {
            int result = divide(10, 0);
            System.out.println(result);
        } catch (ArithmeticException e) {
            System.out.println("捕获 Unchecked 异常: " + e.getMessage());
        }

        // Checked 异常：必须处理
        try {
            readFile("not_exist.txt");
        } catch (IOException e) {
            System.out.println("捕获 Checked 异常: " + e.getMessage());
        }
    }

    // Unchecked 异常：无需声明 throws
    static int divide(int a, int b) {
        if (b == 0) {
            throw new ArithmeticException("除数不能为零");
        }
        return a / b;
    }

    // Checked 异常：必须声明 throws
    static void readFile(String path) throws IOException {
        // FileInputStream 构造方法抛出 Checked IOException
        try (FileInputStream fis = new FileInputStream(path)) {
            // 读取文件内容（此处省略）
        }
    }
}`
  },
  {
    id: "java-try-catch-finally",
    group: "异常处理深入",
    icon: "🛡️",
    title: "try-catch-finally 深入",
    content: `# try-catch-finally 深入

\`try-catch-finally\` 是 Java 异常处理的基础结构。理解 \`finally\` 的执行时机和陷阱对写出健壮代码至关重要。

## 基本结构

\`\`\`java
try {
    // 可能抛出异常的代码
} catch (SomeException e) {
    // 处理异常
} finally {
    // 无论是否发生异常都会执行
}
\`\`\`

\`finally\` 块用于资源清理，保证在 return、break、continue 甚至异常未捕获时都能执行。

## finally 执行时机

- try 块正常执行完 → finally 执行
- try 抛出异常被 catch 捕获 → finally 执行
- try 抛出异常未被捕获 → finally 仍会执行（然后异常继续传播）
- try 中 return → finally 在 return **之后、返回之前**执行

## finally 中 return 的陷阱

**不要在 finally 中 return**！它会吞掉 try 中的异常，并覆盖 try 的返回值：

\`\`\`java
public int demo() {
    try {
        throw new RuntimeException("出错了");
    } finally {
        return 100; // 异常被吞，方法返回 100
    }
}
\`\`\`

调用者看不到任何异常，这是非常隐蔽的 bug。

## try-finally（无 catch）

可以只有 try-finally 而没有 catch，常用于资源清理，异常会继续向上传播。

## System.exit 与 finally

如果 try 块中调用了 \`System.exit()\`，JVM 直接退出，**finally 不会执行**。同理，被 \`kill -9\` 强杀或 OOM 也会跳过 finally。因此 finally 不是"绝对保证"，仅适用于正常的控制流。对于必须执行的清理（如删除临时文件），可注册 \`Runtime.addShutdownHook\` 作为兜底。

## finally 中的异常

finally 块自己抛出的异常会**覆盖** try 块的异常向上传播，导致 try 的真实原因丢失。这也是推荐用 try-with-resources 的原因之一——它通过 \`addSuppressed\` 把 close 的异常附加而非覆盖。

## try-with-resources 替代

Java 7+ 推荐用 try-with-resources 替代 try-finally 关闭资源，更简洁且能正确处理异常抑制。

## catch 块的顺序

多个 catch 块按**从上到下**匹配，先匹配的先执行。因此子类型异常必须写在父类型之前，否则编译错误：

\`\`\`java
try { ... }
catch (SQLException e) { ... }   // 子类在前
catch (Exception e) { ... }       // 父类在后
\`\`\`

## try 块的变量作用域

try、catch、finally 各自是独立作用域。在 try 内声明的变量，catch 和 finally **无法访问**。需要跨块共享的变量应声明在 try 之外，并在使用前初始化。

## 嵌套 try

try 可以嵌套，内层未捕获的异常会交给外层处理。但嵌套过深会降低可读性，通常应通过方法拆分来简化结构，让每层职责单一。

下面通过代码演示 finally 的各种陷阱：`,
    code: `// 演示 finally 执行时机与 return 陷阱
public class Main {
    public static void main(String[] args) {
        // 1. 正常情况 finally 执行
        System.out.println("test1 返回: " + test1());

        // 2. try 中 return，finally 仍执行
        System.out.println("test2 返回: " + test2());

        // 3. finally 中 return 覆盖 try 的返回值（陷阱！）
        System.out.println("test3 返回: " + test3());

        // 4. finally 中 return 吞掉异常（陷阱！）
        System.out.println("test4 返回: " + test4());
    }

    // 正常流程
    static int test1() {
        try {
            return 1;
        } finally {
            System.out.println("  test1 finally 执行");
        }
    }

    // try 返回前 finally 已执行
    static int test2() {
        int x = 1;
        try {
            return x;
        } finally {
            x = 2; // 注意：不会影响已计算的返回值
            System.out.println("  test2 finally 执行, x=" + x);
        }
    }

    // 陷阱：finally 的 return 覆盖 try 的返回值
    static int test3() {
        try {
            return 1;
        } finally {
            return 2; // 实际返回 2
        }
    }

    // 陷阱：finally 的 return 吞掉异常
    static int test4() {
        try {
            throw new RuntimeException("test4 抛出的异常");
        } finally {
            return -1; // 异常被吞，调用者看不到
        }
    }
}`
  },
  {
    id: "java-throw-throws",
    group: "异常处理深入",
    icon: "📤",
    title: "throw 与 throws",
    content: `# throw 与 throws

\`throw\` 和 \`throws\` 是 Java 异常机制的两个关键字，名字相似但作用完全不同。

## throw：抛出异常

\`throw\` 用于在方法体内**主动抛出**一个异常实例：

\`\`\`java
public void setAge(int age) {
    if (age < 0) {
        throw new IllegalArgumentException("年龄不能为负: " + age);
    }
    this.age = age;
}
\`\`\`

throw 后必须跟一个 \`Throwable\` 实例（异常对象），一次只能抛一个。

## throws：声明异常

\`throws\` 用于方法签名上**声明**该方法可能抛出的异常，通知调用者处理：

\`\`\`java
public void readFile(String path) throws IOException {
    // 方法体
}
\`\`\`

可以声明多个异常，用逗号分隔：\`throws IOException, SQLException\`。

## 两者的区别

| | throw | throws |
|---|-------|--------|
| 位置 | 方法体内 | 方法签名上 |
| 跟什么 | 异常对象（实例） | 异常类（可多个） |
| 作用 | 真正抛出异常 | 声明可能抛出 |
| 一次几个 | 一个 | 多个 |

## 异常类型选择

抛出异常时要选择语义最准确的类型：
- 参数非法 → \`IllegalArgumentException\`
- 状态非法 → \`IllegalStateException\`
- 空指针 → \`NullPointerException\`
- 不支持的操作 → \`UnsupportedOperationException\`

## 重新抛出

catch 块中可以重新抛出当前异常，或包装后抛出：

\`\`\`java
try {
    // ...
} catch (IOException e) {
    throw e; // 重新抛出
}
\`\`\`

## throws 与方法重写

子类重写父类方法时，throws 声明的 Checked 异常不能比父类**更宽**：

- 子类可以不声明异常
- 子类可以声明与父类相同的 Checked 异常
- 子类可以声明父类异常的**子类**
- 子类**不能**声明父类没有的、更宽的 Checked 异常

这是为了保证多态调用时的异常安全。Unchecked 异常不受此限制。

\`\`\`java
class Parent {
    void doWork() throws IOException { }
}
class Child extends Parent {
    @Override
    void doWork() throws FileNotFoundException { } // 合法：子类异常
    // void doWork() throws Exception { } // 编译错误：更宽
}
\`\`\`

## 多异常的抛出

一次只能 throw 一个异常，不能同时抛多个。如果需要表达"多个问题"，可以把后续问题作为主异常的 suppressed exception（\`addSuppressed\`），或包装成一个聚合异常。这在参数校验（一次报告多个字段错误）场景很有用。

## 异常对象的复用

\`throw\` 抛出的异常对象会重新填充堆栈（除非重写 \`fillInStackTrace\`），所以同一异常对象重复抛出时，堆栈会反映最后一次抛出的位置，而非首次创建的位置。

下面通过代码演示 throw/throws 的用法：`,
    code: `// 演示 throw 与 throws 的用法
import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        // 1. 演示 throw 抛出异常
        try {
            setAge(-5);
        } catch (IllegalArgumentException e) {
            System.out.println("捕获参数异常: " + e.getMessage());
        }

        // 2. 演示 throws 声明的 Checked 异常
        try {
            findUserById(0);
        } catch (IOException e) {
            System.out.println("捕获 IO 异常: " + e.getMessage());
        }

        // 3. 演示重新抛出
        try {
            riskyOperation();
        } catch (Exception e) {
            System.out.println("最终捕获: " + e.getClass().getSimpleName());
        }
    }

    // throw 抛出 Unchecked 异常，无需 throws
    static void setAge(int age) {
        if (age < 0) {
            throw new IllegalArgumentException("年龄不能为负: " + age);
        }
        System.out.println("年龄设置为: " + age);
    }

    // throws 声明 Checked 异常，调用者必须处理
    static void findUserById(long id) throws IOException {
        if (id <= 0) {
            throw new IOException("用户 ID 无效: " + id);
        }
        System.out.println("找到用户: " + id);
    }

    // 重新抛出异常
    static void riskyOperation() throws IOException {
        try {
            throw new IOException("底层 IO 错误");
        } catch (IOException e) {
            System.out.println("记录日志后重新抛出: " + e.getMessage());
            throw e; // 重新抛出
        }
    }
}`
  },
  {
    id: "java-custom-exception",
    group: "异常处理深入",
    icon: "🎨",
    title: "自定义异常",
    content: `# 自定义异常

Java 内置异常类覆盖了通用场景，但业务中常需要**自定义异常**来表达特定业务错误，让异常更有语义。

## 继承哪个类

- 继承 \`Exception\` → 自定义 **Checked** 异常（强制调用者处理）
- 继承 \`RuntimeException\` → 自定义 **Unchecked** 异常（调用者可选处理）

现代实践多倾向继承 \`RuntimeException\`，避免 Checked 异常的层级污染。

## 基本结构

\`\`\`java
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}
\`\`\`

提供两个构造方法：一个只传消息，一个传消息+原因（用于异常链）。

## 添加业务字段

自定义异常可以携带业务相关字段，便于上层处理：

\`\`\`java
public class InsufficientBalanceException extends RuntimeException {
    private final long userId;
    private final double balance;
    private final double amount;
    // ...
}
\`\`\`

## 异常信息设计

- 消息要**详细且可读**，包含关键上下文
- 不要泄露敏感信息（密码、密钥）
- 消息应是问题陈述，而非解决方案
- 提供可搜索的关键字，便于排查

## 命名规范

异常类名应以 \`Exception\` 结尾，如 \`UserNotFoundException\`、\`InvalidTokenException\`，让人一看就知道含义。

## 提供 serialVersionUID

自定义异常通常间接实现 \`Serializable\`（因为 Throwable 实现了），建议显式声明 \`serialVersionUID\`，避免序列化/反序列化时因版本不一致而失败：

\`\`\`java
public class BusinessException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    // ...
}
\`\`\`

## 异常层级设计

大型系统应建立**异常层级**而非一堆平铺的异常类。先定义一个业务异常基类，再派生具体异常：

\`\`\`
RuntimeException
└── BusinessException
    ├── UserNotFoundException
    ├── InsufficientBalanceException
    └── InvalidTokenException
\`\`\`

这样上层可以用 \`catch (BusinessException e)\` 统一处理所有业务异常，又能针对具体子类做精细化处理。

## 构造方法的建议

至少提供：消息、消息+cause 两个构造方法，方便不同场景使用。无参构造信息不足，一般不推荐。

下面定义一组自定义业务异常：`,
    code: `// 演示自定义异常的定义与使用
public class Main {
    public static void main(String[] args) {
        // 测试余额不足异常
        try {
            withdraw(1001L, 100.0, 150.0);
        } catch (InsufficientBalanceException e) {
            System.out.println("捕获业务异常: " + e.getMessage());
            System.out.println("  用户ID: " + e.getUserId());
            System.out.println("  当前余额: " + e.getBalance());
        }

        // 测试用户未找到异常
        try {
            findUser(0L);
        } catch (UserNotFoundException e) {
            System.out.println("捕获: " + e.getMessage() + ", errorCode=" + e.getErrorCode());
        }
    }

    // 模拟取款
    static void withdraw(long userId, double balance, double amount) {
        if (amount > balance) {
            throw new InsufficientBalanceException(userId, balance, amount);
        }
        System.out.println("取款成功: " + amount);
    }

    // 模拟查找用户
    static void findUser(long userId) {
        if (userId <= 0) {
            throw new UserNotFoundException(userId);
        }
    }
}

// 余额不足异常（Unchecked），携带业务字段
class InsufficientBalanceException extends RuntimeException {
    private final long userId;
    private final double balance;
    private final double amount;

    public InsufficientBalanceException(long userId, double balance, double amount) {
        super(String.format("用户 %d 余额不足: 余额 %.2f, 需要 %.2f", userId, balance, amount));
        this.userId = userId;
        this.balance = balance;
        this.amount = amount;
    }

    public long getUserId() { return userId; }
    public double getBalance() { return balance; }
    public double getAmount() { return amount; }
}

// 用户未找到异常，携带错误码
class UserNotFoundException extends RuntimeException {
    private final int errorCode;

    public UserNotFoundException(long userId) {
        super("用户不存在: id=" + userId);
        this.errorCode = 40401;
    }

    public int getErrorCode() { return errorCode; }
}`
  },
  {
    id: "java-try-with-resources",
    group: "异常处理深入",
    icon: "📦",
    title: "try-with-resources（Java 7+）",
    content: `# try-with-resources（Java 7+）

\`try-with-resources\` 是 Java 7 引入的语法糖，用于**自动关闭**实现了 \`AutoCloseable\` 的资源，替代繁琐的 try-finally。

## 基本语法

\`\`\`java
try (BufferedReader br = new BufferedReader(new FileReader("file.txt"))) {
    System.out.println(br.readLine());
} // br 自动关闭，无需 finally
\`\`\`

资源在 try 块结束时自动调用 \`close()\`，即使发生异常也会关闭。

## AutoCloseable 接口

任何实现 \`java.lang.AutoCloseable\`（或 \`Closeable\`）的类都能用作 try-with-resources 资源：

\`\`\`java
public class MyResource implements AutoCloseable {
    @Override
    public void close() throws Exception {
        // 清理逻辑
    }
}
\`\`\`

## 多资源关闭顺序

可以在一个 try 中声明多个资源，用分号分隔。关闭顺序与声明顺序**相反**（后声明的先关闭）：

\`\`\`java
try (ResourceA a = new ResourceA();
     ResourceB b = new ResourceB()) {
    // 使用资源
} // 关闭顺序: b -> a
\`\`\`

## 异常抑制

如果 try 块和 close() 都抛出异常，try 块的异常会抛出，close() 的异常通过 \`addSuppressed\` 附加，可通过 \`getSuppressed()\` 获取，不会丢失。

## Java 9+ 的 effectively final 改进

Java 9 起，如果资源变量是 effectively final 的，可以直接引用已有变量，无需在 try 中重新声明：

\`\`\`java
BufferedReader br = new BufferedReader(new FileReader("f.txt"));
try (br) { // Java 9+ 直接使用
    // ...
}
\`\`\`

## 与 try-finally 的对比

传统 try-finally 关闭资源代码冗长，且容易出错（忘记关闭、close 自身抛异常会掩盖原异常）。try-with-resources 自动处理这些：

\`\`\`java
// 旧写法：冗长且 close 的异常会掩盖 try 的异常
BufferedReader br = null;
try {
    br = new BufferedReader(new FileReader("f.txt"));
    // 使用 br
} finally {
    if (br != null) try { br.close(); } catch (IOException ignored) {}
}
\`\`\`

## 自定义资源类

实现 \`AutoCloseable\` 时，\`close()\` 方法应该**幂等**（多次调用安全）且尽量不抛异常。如果关闭确实可能失败，抛出异常让调用者知晓。

## 资源声明的限制

try 头部声明的资源变量是隐式 final 的，不能在 try 块内重新赋值，否则编译错误。这保证了关闭的始终是最初打开的资源。

下面通过代码演示 try-with-resources：`,
    code: `// 演示 try-with-resources 自动关闭资源
public class Main {
    public static void main(String[] args) {
        // 1. 单资源自动关闭
        System.out.println("=== 单资源 ===");
        try (MyResource r1 = new MyResource("R1")) {
            System.out.println("使用 R1");
        } // 自动调用 close

        // 2. 多资源，关闭顺序与声明相反
        System.out.println("\\n=== 多资源 ===");
        try (MyResource a = new MyResource("A");
             MyResource b = new MyResource("B")) {
            System.out.println("使用 A 和 B");
        } // 关闭顺序: B -> A

        // 3. 异常抑制：try 抛异常 + close 抛异常
        System.out.println("\\n=== 异常抑制 ===");
        try {
            try (MyResource r = new MyResource("R", true)) {
                System.out.println("try 块抛出异常");
                throw new RuntimeException("try 块的异常");
            } // close 也抛异常
        } catch (Exception e) {
            System.out.println("主异常: " + e.getMessage());
            for (Throwable suppressed : e.getSuppressed()) {
                System.out.println("被抑制异常: " + suppressed.getMessage());
            }
        }
    }
}

// 自定义可关闭资源
class MyResource implements AutoCloseable {
    private final String name;
    private final boolean failOnClose;

    public MyResource(String name) {
        this(name, false);
    }

    public MyResource(String name, boolean failOnClose) {
        this.name = name;
        this.failOnClose = failOnClose;
        System.out.println("  打开资源: " + name);
    }

    @Override
    public void close() {
        System.out.println("  关闭资源: " + name);
        if (failOnClose) {
            throw new RuntimeException("关闭 " + name + " 时出错");
        }
    }
}`
  },
  {
    id: "java-multi-catch",
    group: "异常处理深入",
    icon: "⚡",
    title: "multi-catch（Java 7+）",
    content: `# multi-catch（Java 7+）

\`multi-catch\` 是 Java 7 引入的语法，允许一个 \`catch\` 块同时捕获多种异常类型，用 \`|\` 分隔，减少重复代码。

## 基本语法

\`\`\`java
try {
    // ...
} catch (IOException | SQLException e) {
    // 同时处理两种异常
    logger.error("IO 或 SQL 错误", e);
}
\`\`\`

相比写两个 catch 块做相同处理，multi-catch 更简洁。

## 类型不能有继承关系

multi-catch 中的异常类型**不能**存在父子关系，否则编译错误：

\`\`\`java
// 编译错误：IOException 是 Exception 的子类
catch (IOException | Exception e) { }
\`\`\`

因为如果存在继承关系，子类型是冗余的，编译器会提示。

## 异常变量的类型

multi-catch 中异常变量 \`e\` 的类型是这些异常的**最近公共父类**，且被视为 \`final\`，不能在 catch 块内重新赋值：

\`\`\`java
catch (IOException | SQLException e) {
    e = new IOException(); // 编译错误：final
}
\`\`\`

## 优缺点

**优点**：
- 消除重复的 catch 块
- 代码更简洁、更易维护

**缺点**：
- 不能对不同异常做不同处理（需要时还是得分开写）
- 异常变量是 final 的

## 何时使用

当多种异常的处理逻辑**完全相同**时使用 multi-catch；如果需要区分处理，仍应分开 catch。

## catch 块顺序仍需注意

multi-catch 与普通 catch 一起使用时，仍要遵循"子类在前"规则。如果 multi-catch 已经捕获了某类型，后续 catch 不能再捕获其子类型，否则编译错误（不可达代码）。

## 字节码层面

multi-catch 在字节码层面并非真正的"多类型捕获"，编译器会生成对每种类型的 \`instanceof\` 判断，跳转到同一处理代码。运行时 \`e\` 的静态类型是公共父类，但动态类型仍是实际抛出的异常类。

## multi-catch 与 finally 配合

multi-catch 可以和 finally 一起使用，组成完整的异常处理结构：

\`\`\`java
try {
    // 可能抛 IOException 或 SQLException
} catch (IOException | SQLException e) {
    // 统一处理
} finally {
    // 资源清理
}
\`\`\`

## 实际应用场景

multi-catch 最常见的场景是处理多种"等价"的失败：例如解析配置时，文件找不到（\`IOException\`）和格式错误（\`JSONException\`）对用户的处理方式相同——都回退到默认配置。这时用一个 multi-catch 统一处理，代码最简洁。

## 不能动态构造类型

multi-catch 的异常类型列表是**编译期常量**，不能运行时动态指定。如果需要根据条件捕获不同异常，只能用多个 if-else 配合 catch 父类，失去了 multi-catch 的类型精确性。

## 替代方案对比

- 多个 catch 块：可对不同异常做不同处理，但重复代码多
- multi-catch：处理相同时最简洁
- catch 父类（如 \`catch (Exception e)\`）：能捕获更多但过于宽泛，不推荐

下面通过代码演示 multi-catch：`,
    code: `// 演示 multi-catch 同时捕获多种异常
import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        // 测试不同输入触发不同异常
        String[] inputs = {"io", "sql", "runtime", "ok"};
        for (String input : inputs) {
            process(input);
        }
    }

    static void process(String input) {
        try {
            switch (input) {
                case "io":
                    throw new IOException("IO 错误");
                case "sql":
                    throw new SQLException("SQL 错误");
                case "runtime":
                    throw new IllegalArgumentException("参数错误");
                default:
                    System.out.println("处理成功: " + input);
            }
        } catch (IOException | SQLException e) {
            // multi-catch：两种异常统一处理
            // e 的类型是 IOException 和 SQLException 的公共父类 Exception
            System.out.println("multi-catch 捕获 [" + e.getClass().getSimpleName() + "]: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            // 单独处理运行时异常
            System.out.println("单独捕获 [" + e.getClass().getSimpleName() + "]: " + e.getMessage());
        }
    }
}

// 自定义 SQL 异常（模拟 java.sql.SQLException）
class SQLException extends Exception {
    public SQLException(String message) {
        super(message);
    }
}`
  },
  {
    id: "java-exception-chain",
    group: "异常处理深入",
    icon: "🔗",
    title: "异常链",
    content: `# 异常链

**异常链**（Exception Chaining）指在捕获一个异常后，将其作为另一个异常的 **cause**（原因）抛出，从而保留原始的异常堆栈信息。

## 为什么需要异常链

分层架构中，底层异常（如 SQLException）不应直接暴露给上层。但直接抛弃会**丢失根因**。异常链让新异常承载业务语义，同时保留底层堆栈。

## 两种方式

**1. 构造方法传递**

\`\`\`java
public ServiceException(String message, Throwable cause) {
    super(message, cause); // 把底层异常作为 cause
}
\`\`\`

**2. initCause 方法**

\`\`\`java
ServiceException e = new ServiceException("服务异常");
e.initCause(originalException);
throw e;
\`\`\`

推荐用构造方法，更简洁。

## 异常包装

异常链本质是"包装"：用新异常包装旧异常，新异常决定对外语义，旧异常保留细节。

\`\`\`java
try {
    userDao.findById(id); // 抛 SQLException
} catch (SQLException e) {
    throw new UserNotFoundException("用户不存在", e); // 包装
}
\`\`\`

## 保留原始堆栈

打印包装异常时，堆栈会包含 "Caused by:" 部分，显示原始异常的完整调用栈：

\`\`\`
ServiceException: 服务异常
    at ...
Caused by: java.sql.SQLException: 连接失败
    at ...
\`\`\`

## 堆栈打印的 Caused by

\`printStackTrace()\` 会自动递归打印 cause 链，每一层以 "Caused by:" 开头，直到没有 cause 为止。日志框架同样会输出完整链路。所以只要正确设置了 cause，排查时就能一次看到从业务异常到根因的全貌，无需手动拼接。

## getCause()

通过 \`Throwable.getCause()\` 可以获取原始异常，便于程序化处理或日志记录。

## 异常链的层次

异常链可以多层嵌套：A caused by B caused by C。\`getCause()\` 只返回直接原因，要拿到根因需要循环遍历：

\`\`\`java
Throwable root = e;
while (root.getCause() != null) {
    root = root.getCause();
}
System.out.println("根因: " + root);
\`\`\`

## 何时使用异常链

- 分层架构中跨层抛出时（DAO→Service→Controller）
- 包装第三方异常为自定义异常时
- 想保留底层堆栈又想表达业务语义时

## 何时不需要

同层内重新抛出**同一个异常**（\`throw e\`）时不需要包装，原异常的堆栈已经完整。只有当抛出**新异常**时才需要把原异常作为 cause。

## initCause 与构造方法

\`initCause\` 最多只能调用一次，重复调用会抛 \`IllegalStateException\`。构造方法 \`super(message, cause)\` 内部也是调用 initCause，所以两者二选一，不要重复设置。

下面通过代码演示异常链的构建与解析：`,
    code: `// 演示异常链的构建与解析
public class Main {
    public static void main(String[] args) {
        try {
            serviceLayer();
        } catch (ServiceException e) {
            System.out.println("顶层异常: " + e.getMessage());

            // 获取根因
            Throwable cause = e.getCause();
            if (cause != null) {
                System.out.println("根因异常: " + cause.getClass().getSimpleName()
                    + " - " + cause.getMessage());
            }

            // 完整打印堆栈，会显示 "Caused by:"
            System.out.println("\\n完整堆栈:");
            e.printStackTrace(System.out);
        }
    }

    // 顶层服务层
    static void serviceLayer() throws ServiceException {
        try {
            dataAccessLayer();
        } catch (DataAccessException e) {
            // 用构造方法包装，保留 cause
            throw new ServiceException("查询用户服务失败", e);
        }
    }

    // 数据访问层
    static void dataAccessLayer() throws DataAccessException {
        try {
            connectDatabase(); // 模拟底层异常
        } catch (java.sql.SQLException e) {
            DataAccessException dae = new DataAccessException("数据库访问失败");
            dae.initCause(e); // 用 initCause 设置 cause
            throw dae;
        }
    }

    // 模拟底层 SQL 异常
    static void connectDatabase() throws java.sql.SQLException {
        throw new java.sql.SQLException("连接超时: localhost:3306");
    }
}

// 业务服务异常
class ServiceException extends Exception {
    public ServiceException(String message) {
        super(message);
    }
    public ServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}

// 数据访问异常
class DataAccessException extends Exception {
    public DataAccessException(String message) {
        super(message);
    }
}`
  },
  {
    id: "java-exception-translation",
    group: "异常处理深入",
    icon: "🔄",
    title: "异常转换",
    content: `# 异常转换

**异常转换**（Exception Translation）指在分层架构中，把底层异常**转换**为对应层的语义异常，让每层只暴露属于自己的异常类型。

## 为什么需要转换

分层架构中，如果上层直接处理底层异常，会造成**耦合**：

- 业务层不该知道 \`SQLException\` 的细节
- 表现层不该知道 \`ServiceException\` 的细节
- 底层异常信息可能泄露技术栈（不安全）

异常转换让每层维护自己的异常体系。

## 转换方式

**1. 异常包装（推荐）**：用异常链把底层异常作为 cause

\`\`\`java
try {
    userDao.findById(id);
} catch (SQLException e) {
    throw new UserNotFoundException("用户不存在: " + id, e);
}
\`\`\`

**2. 重新抛出无 cause**：丢弃底层异常（不推荐，丢失根因）

\`\`\`java
} catch (SQLException e) {
    throw new UserNotFoundException("用户不存在"); // 丢失根因
}
\`\`\`

## 分层架构中的转换

\`\`\`
DAO 层        SQLException  →  DataAccessException
Service 层    DataAccessException  →  BusinessException
Controller 层  BusinessException  →  错误响应
\`\`\`

每层 catch 本层不关心的异常，转换为本层语义异常抛出。

## 转换 vs 直接抛出

- **转换**：跨层边界时，把技术异常转为业务异常
- **直接抛出**：同层内异常可以继续传播

## 转换的位置选择

异常转换应在**层与层的边界**进行，而非每层都转。通常在 Service 层把 DAO 的技术异常转为业务异常，Controller 层把业务异常转为 HTTP 响应。如果每层都做一次转换，反而增加复杂度且容易丢失信息。

## 转换与日志的配合

转换点通常是记录日志的好位置：catch 底层异常时，先 log（带完整堆栈），再抛出转换后的业务异常（带 cause）。这样既不丢失底层信息，又让上层用业务语义处理。注意只在这一处记录，避免重复。

## Spring 的异常转换

Spring 的 \`DataAccessException\` 体系就是把各种底层异常（SQLException、JPA 异常）统一转换为 unchecked 的 \`DataAccessException\`，是异常转换的经典范例。

## 转换时的信息保留

转换异常时应**始终保留 cause**，除非有安全顾虑（如避免泄露 SQL 细节给前端）。日志中可以打印完整链路，但返回给用户的错误信息应脱敏。

## 何时不需要转换

- 同层内异常可以直接传播
- 已经是业务语义的异常不需要再转
- Unchecked 异常通常可以直接穿透到顶层统一处理

## 统一异常处理器

Web 应用常在 Controller 层用 \`@ControllerAdvice\`（Spring）做统一异常处理：把各种业务异常转换为 HTTP 响应。这样业务代码只管抛异常，异常到响应的映射集中在一处，符合异常转换的思想。

## 避免异常吞咽

转换时千万不要 \`catch (Exception e) { throw new XxxException("出错了"); }\` 丢弃 cause，这会让排查变成噩梦。至少 log 一下原异常，或把它作为 cause 传递。

下面通过代码演示分层架构中的异常转换：`,
    code: `// 演示分层架构中的异常转换
public class Main {
    public static void main(String[] args) {
        UserController controller = new UserController();

        // 正常情况
        System.out.println("=== 正常请求 ===");
        controller.getUser(1L);

        // 异常情况：触发转换链
        System.out.println("\\n=== 异常请求 ===");
        controller.getUser(999L);
    }
}

// 表现层：把业务异常转为响应
class UserController {
    private final UserService service = new UserService();

    void getUser(long id) {
        try {
            String user = service.findById(id);
            System.out.println("响应: {status:200, data:" + user + "}");
        } catch (BusinessException e) {
            System.out.println("响应: {status:" + e.getCode() + ", error:" + e.getMessage() + "}");
            // 记录根因供排查
            if (e.getCause() != null) {
                System.out.println("  (根因: " + e.getCause().getMessage() + ")");
            }
        }
    }
}

// 业务层：把数据访问异常转为业务异常
class UserService {
    private final UserDao dao = new UserDao();

    String findById(long id) throws BusinessException {
        try {
            return dao.findById(id);
        } catch (DataAccessException e) {
            // 异常转换：技术异常 → 业务异常（保留 cause）
            throw new UserNotFoundException("用户不存在: " + id, e);
        }
    }
}

// 数据访问层：抛出技术异常
class UserDao {
    String findById(long id) throws DataAccessException {
        if (id == 999L) {
            // 模拟底层查询失败
            throw new DataAccessException("数据库查询超时");
        }
        return "User-" + id;
    }
}

// 数据访问异常（技术异常）
class DataAccessException extends Exception {
    public DataAccessException(String message) { super(message); }
}

// 业务异常基类
class BusinessException extends Exception {
    private final int code;
    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
    public BusinessException(int code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
    public int getCode() { return code; }
}

// 用户未找到异常
class UserNotFoundException extends BusinessException {
    public UserNotFoundException(String message, Throwable cause) {
        super(404, message, cause);
    }
}`
  },
  {
    id: "java-exception-best-practices",
    group: "异常处理深入",
    icon: "✅",
    title: "异常最佳实践",
    content: `# 异常最佳实践

良好的异常处理能让代码更健壮、更易排查。以下是社区总结的关键实践。

## 1. 不要忽略异常

**反例**：

\`\`\`java
try {
    // ...
} catch (SomeException e) {
    // 空的 catch 块，异常被吞
}
\`\`\`

至少要记录日志或重新抛出。空 catch 会让问题悄无声息地隐藏。

## 2. 不要 catch Throwable

\`Throwable\` 是所有异常和 Error 的父类。catch 它会捕获 \`Error\`（如 \`OutOfMemoryError\`），这些是 JVM 级问题，不应被业务捕获。

\`\`\`java
catch (Throwable t) { ... } // 反例
\`\`\`

应捕获具体的 \`Exception\` 或更具体的子类。

## 3. 异常信息要详细

**反例**：\`throw new IllegalArgumentException("error");\`

**正例**：\`throw new IllegalArgumentException("年龄必须为正数, 实际值: " + age);\`

消息要包含上下文：参数值、状态、操作，便于排查。

## 4. 尽早抛出

参数校验应在方法入口尽早失败，避免错误传播：

\`\`\`java
public void transfer(long from, long to, double amount) {
    if (amount <= 0) throw new IllegalArgumentException("金额必须为正");
    if (from == to) throw new IllegalArgumentException("转账双方相同");
    // ...
}
\`\`\`

## 5. 异常 vs 返回码

异常用于**异常**情况，正常流程不要用异常控制：

- 调用前可检查的条件 → 用返回值或 if（如 \`map.containsKey\`）
- 不可预知的失败 → 用异常（如 IO 错误）

用异常控制流程性能差且可读性差。

## 6. 捕获具体异常

不要一股脑 \`catch (Exception e)\`，应捕获最具体的类型，让其他异常继续传播。

## 7. 不要在 finally 中 return

会吞掉异常和覆盖返回值（见 try-catch-finally 一章）。

## 8. 不要捕获后抛出更宽的异常

\`\`\`java
// 反例：丢失原始异常类型和堆栈
} catch (IOException e) {
    throw new Exception("IO 失败"); // cause 丢失
}
\`\`\`

要么重新抛出原异常，要么用异常链包装保留 cause。

## 9. 异常文档化

公共方法可能抛出的 Checked 异常应在 Javadoc 中用 \`@throws\` 说明，包括抛出条件。Unchecked 异常虽不强制，但重要的也应文档化，方便调用者理解契约：

\`\`\`java
/**
 * @throws IllegalArgumentException 如果 age 为负
 * @throws UserNotFoundException 如果用户不存在
 */
\`\`\`

## 10. 优先使用标准异常

Java 已有丰富异常类，优先复用（如 \`IllegalArgumentException\`、\`IllegalStateException\`），而非动辄自定义。只在需要表达特定业务语义时才自定义。

下面通过代码演示最佳实践与反例对比：`,
    code: `// 演示异常处理最佳实践
public class Main {
    public static void main(String[] args) {
        // 1. 详细异常信息
        try {
            setAge(-1);
        } catch (IllegalArgumentException e) {
            System.out.println("[实践1] " + e.getMessage());
        }

        // 2. 尽早抛出
        try {
            transfer(1001, 1001, -50);
        } catch (IllegalArgumentException e) {
            System.out.println("[实践2] " + e.getMessage());
        }

        // 3. 捕获具体异常而非 Throwable
        try {
            parseNumber("abc");
        } catch (NumberFormatException e) {
            System.out.println("[实践3] 捕获具体异常: " + e.getMessage());
        }

        // 4. 异常不用于正常流程控制
        System.out.println("[实践4] 安全解析: " + safeParse("123"));
        System.out.println("[实践4] 非法输入: " + safeParse("xyz"));
    }

    // 实践1：异常信息要详细，包含上下文
    static void setAge(int age) {
        if (age < 0) {
            throw new IllegalArgumentException("年龄必须为非负整数, 实际值: " + age);
        }
        if (age > 150) {
            throw new IllegalArgumentException("年龄超出合理范围, 实际值: " + age);
        }
    }

    // 实践2：尽早抛出，参数校验前置
    static void transfer(long from, long to, double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("转账金额必须为正, 实际: " + amount);
        }
        if (from == to) {
            throw new IllegalArgumentException("收款方不能是付款方: " + from);
        }
        System.out.println("转账: " + from + " -> " + to + ", 金额: " + amount);
    }

    // 实践3：捕获具体异常
    static int parseNumber(String s) {
        return Integer.parseInt(s); // 抛 NumberFormatException
    }

    // 实践4：用返回值而非异常处理可预期的"失败"
    static Integer safeParse(String s) {
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException e) {
            // 记录后返回 null，而非让异常传播
            return null;
        }
    }
}`
  },
  {
    id: "java-common-exceptions",
    group: "异常处理深入",
    icon: "⚠️",
    title: "常见异常",
    content: `# 常见异常

Java 运行时常见异常多为 \`RuntimeException\` 子类，理解它们的原因和修复方式能显著提升排错能力。

## NullPointerException（NPE）

最常见异常。访问 \`null\` 引用的成员时抛出：

\`\`\`java
String s = null;
s.length(); // NPE
\`\`\`

**修复**：使用前判空，或用 \`Optional\`，或启用 Java 14+ 的 helpful NPE 信息。

## ArrayIndexOutOfBoundsException

数组下标越界：

\`\`\`java
int[] arr = new int[3];
arr[3] = 1; // 越界
\`\`\`

**修复**：访问前检查 \`index < arr.length\`。

## ClassCastException

类型转换失败：

\`\`\`java
Object o = "hello";
Integer i = (Integer) o; // ClassCastException
\`\`\`

**修复**：转换前用 \`instanceof\` 检查，或用泛型避免强转。

## ArithmeticException

算术错误，最典型是整数除零：

\`\`\`java
int x = 1 / 0; // ArithmeticException
\`\`\`

注意：浮点数除零不会抛异常（结果是 Infinity）。**修复**：除法前检查除数。

## NumberFormatException

字符串转数字格式错误：

\`\`\`java
Integer.parseInt("abc"); // NumberFormatException
\`\`\`

**修复**：先用正则校验，或捕获后处理。

## IllegalArgumentException / IllegalStateException

\`IllegalArgumentException\` 表示参数非法，\`IllegalStateException\` 表示对象状态不合法（如重复关闭资源、未初始化就调用），均由代码主动抛出。

## 总结

| 异常 | 典型原因 | 修复 |
|------|---------|------|
| NullPointerException | 访问 null | 判空/Optional |
| ArrayIndexOutOfBounds | 数组越界 | 检查长度 |
| ClassCastException | 错误强转 | instanceof/泛型 |
| ArithmeticException | 整数除零 | 检查除数 |
| NumberFormatException | 数字格式错 | 校验格式 |

## ConcurrentModificationException

在用 foreach 遍历集合时直接修改集合会抛此异常：

\`\`\`java
for (String s : list) {
    if (s.equals("x")) list.remove(s); // 抛异常
}
\`\`\`

**修复**：用 \`Iterator.remove()\`，或 Java 8+ 的 \`list.removeIf(...)\`。

## UnsupportedOperationException

对不支持的操作调用时抛出，如对 \`Collections.unmodifiableList\` 返回的列表调用 \`add\`：

\`\`\`java
List<String> list = Collections.unmodifiableList(new ArrayList<>());
list.add("x"); // UnsupportedOperationException
\`\`\`

这通常表示用法错误，而非可恢复的失败。

## 异常的根因排查

遇到陌生异常时：先看异常**类型**和**消息**，再看**堆栈第一行**（异常发生位置），最后沿调用栈向上理解上下文。善用 IDE 的"点击堆栈跳转"能快速定位源码。

下面通过代码演示这些异常及其修复：`,
    code: `// 演示常见运行时异常及修复方式
public class Main {
    public static void main(String[] args) {
        // 1. NullPointerException
        System.out.println("=== NullPointerException ===");
        String s = null;
        // 修复：判空
        int len = (s == null) ? 0 : s.length();
        System.out.println("安全长度: " + len);

        // 2. ArrayIndexOutOfBoundsException
        System.out.println("\\n=== ArrayIndexOutOfBoundsException ===");
        int[] arr = {1, 2, 3};
        int idx = 3;
        if (idx >= 0 && idx < arr.length) {
            System.out.println("arr[" + idx + "] = " + arr[idx]);
        } else {
            System.out.println("索引 " + idx + " 越界, 数组长度 " + arr.length);
        }

        // 3. ClassCastException
        System.out.println("\\n=== ClassCastException ===");
        Object o = "hello";
        // 修复：instanceof 检查
        if (o instanceof Integer) {
            System.out.println("是 Integer: " + o);
        } else {
            System.out.println("不是 Integer, 实际类型: " + o.getClass().getSimpleName());
        }

        // 4. ArithmeticException
        System.out.println("\\n=== ArithmeticException ===");
        int a = 10, b = 0;
        // 修复：检查除数
        if (b != 0) {
            System.out.println(a + " / " + b + " = " + (a / b));
        } else {
            System.out.println("除数不能为零");
        }

        // 5. NumberFormatException
        System.out.println("\\n=== NumberFormatException ===");
        String numStr = "12a3";
        try {
            int n = Integer.parseInt(numStr);
            System.out.println("解析成功: " + n);
        } catch (NumberFormatException e) {
            System.out.println("数字格式错误: \\"" + numStr + "\\" 不是合法整数");
        }
    }
}`
  },
  {
    id: "java-exception-performance",
    group: "异常处理深入",
    icon: "⚡",
    title: "异常性能",
    content: `# 异常性能

异常虽然强大，但**创建和抛出异常有性能开销**，主要来自堆栈跟踪的填充。理解这一点能避免性能陷阱。

## 异常的两大开销

**1. 异常对象创建**

创建异常时会调用 \`fillInStackTrace()\`，遍历调用栈生成堆栈信息，开销随栈深度增加。

**2. 堆栈展开**

抛出异常时 JVM 需要展开调用栈寻找 handler，这个过程也有成本。

## 不要用异常控制流程

**反例**：用异常结束循环

\`\`\`java
try {
    int i = 0;
    while (true) {
        process(arr[i++]); // 靠 ArrayIndexOutOfBounds 退出
    }
} catch (ArrayIndexOutOfBoundsException e) { }
\`\`\`

这比正常 \`for\` 循环慢几个数量级。

## fillInStackTrace 优化

如果不需要堆栈信息（如用于流程控制的高频异常），可重写 \`fillInStackTrace\` 返回空堆栈：

\`\`\`java
public class FastException extends RuntimeException {
    @Override
    public synchronized Throwable fillInStackTrace() {
        return this; // 跳过堆栈填充
    }
}
\`\`\`

这能极大减少创建开销，但要权衡可调试性。

## 堆栈深度影响

栈越深，\`fillInStackTrace\` 越慢。深嵌套调用中抛异常比浅调用更贵。

## 性能测试思路

可以用 \`System.nanoTime()\` 对比"正常返回"与"抛异常"在循环中的耗时差异，通常抛异常慢 100 倍以上。

## 结论

- 异常用于**异常情况**，开销可以接受
- 不要用于正常流程控制
- 高频场景如需异常，考虑重写 \`fillInStackTrace\`

## 栈深度的影响

\`fillInStackTrace\` 的开销与调用栈深度成正比。在深层递归或长调用链中抛异常，比浅调用贵得多。因此框架代码（栈深）中滥用异常代价更大。

## JVM 的优化：OmitStackTraceInFastThrow

HotSpot JVM 有个优化 \`-XX:+OmitStackTraceInFastThrow\`（默认开启）：当同一个异常在同一个位置被频繁抛出时，JVM 会**停止填充堆栈**，直接返回预分配的无堆栈异常对象。这能大幅提升性能，但会丢失堆栈信息。

所以线上偶发的"空堆栈异常"常常是这个优化导致的。要查看完整堆栈，需要重启或等待 JIT 重新编译。

## 异常创建 vs 抛出

创建异常对象（\`new Exception()\`）本身就要 \`fillInStackTrace\`，是主要开销；而 \`throw\` 只是改变控制流。所以"预创建异常对象复用"并不能省下堆栈填充的开销——除非像 \`FastException\` 那样重写 \`fillInStackTrace\`。

## 异常抑制的性能

try-with-resources 中如果 try 和 close 都抛异常，会调用 \`addSuppressed\`。这个操作很轻量（只是把异常存进数组），相比异常创建本身的开销可以忽略。所以不必担心 try-with-resources 的异常抑制带来额外性能负担。

## 实际建议

业务代码不必过度担心异常性能——异常本就用于异常路径。只在**热点循环**和**高频路径**中避免用异常控制流程。

下面通过代码演示异常性能影响：`,
    code: `// 演示异常的性能开销
public class Main {
    public static void main(String[] args) {
        final int N = 100_000;

        // 1. 正常返回（基准）
        long t1 = System.nanoTime();
        for (int i = 0; i < N; i++) {
            normalReturn();
        }
        long normalTime = System.nanoTime() - t1;

        // 2. 抛普通异常（填充堆栈）
        long t2 = System.nanoTime();
        for (int i = 0; i < N; i++) {
            try {
                throwSlow();
            } catch (SlowException e) {
                // 捕获
            }
        }
        long slowTime = System.nanoTime() - t2;

        // 3. 抛快速异常（不填充堆栈）
        long t3 = System.nanoTime();
        for (int i = 0; i < N; i++) {
            try {
                throwFast();
            } catch (FastException e) {
                // 捕获
            }
        }
        long fastTime = System.nanoTime() - t3;

        System.out.println("循环次数: " + N);
        System.out.println("正常返回耗时:   " + (normalTime / 1_000_000) + " ms");
        System.out.println("普通异常耗时:   " + (slowTime / 1_000_000) + " ms");
        System.out.println("快速异常耗时:   " + (fastTime / 1_000_000) + " ms");
        System.out.println();
        System.out.println("普通异常 / 正常: " + (slowTime / Math.max(normalTime, 1)) + " 倍");
        System.out.println("快速异常 / 正常: " + (fastTime / Math.max(normalTime, 1)) + " 倍");
        System.out.println();
        System.out.println("结论: 异常创建有显著开销, 不应用于流程控制");
    }

    static void normalReturn() {}

    static void throwSlow() {
        throw new SlowException();
    }

    static void throwFast() {
        throw new FastException();
    }
}

// 普通异常：会填充堆栈
class SlowException extends RuntimeException {}

// 快速异常：跳过堆栈填充
class FastException extends RuntimeException {
    @Override
    public synchronized Throwable fillInStackTrace() {
        return this; // 不填充堆栈
    }
}`
  },
  {
    id: "java-assertions",
    group: "异常处理深入",
    icon: "🔍",
    title: "断言（assert）",
    content: `# 断言（assert）

\`assert\` 是 Java 1.4 引入的关键字，用于在代码中表达**不变式假设**。断言失败抛出 \`AssertionError\`。

## 基本语法

\`\`\`java
assert 条件;
assert 条件 : 详细信息;
\`\`\`

- 形式一：条件为 false 时抛 \`AssertionError\`
- 形式二：附带详细信息，便于排查

\`\`\`java
assert x >= 0 : "x 不能为负, 实际: " + x;
\`\`\`

## 默认关闭

断言**默认是关闭的**，需要在运行时用 \`-ea\`（enable assertions）开启：

\`\`\`bash
java -ea MyApp
java -ea:com.example... MyApp  # 只对某包开启
\`\`\`

未开启时，assert 语句被跳过，**零开销**。

## 断言 vs 异常

| | assert | 异常 |
|---|--------|------|
| 用途 | 检查内部不变式 | 处理可预期的失败 |
| 启用 | 默认关闭，需 -ea | 始终启用 |
| 抛出 | AssertionError（Error） | 各种 Exception |
| 恢复 | 不应恢复 | 可恢复 |
| 对象 | 开发者 | 调用者/用户 |

## 使用场景

- **私有方法的前置条件**：检查参数是否符合内部契约
- **不变式检查**：方法执行后状态应满足的条件
- **不可达分支**：\`default: assert false;\`

## 不应使用断言

- **公共 API 参数校验**：应抛 \`IllegalArgumentException\`（断言可能被关闭）
- **有副作用的逻辑**：\`assert list.remove(x)\` 会导致开启/关闭时行为不一致
- **生产环境的关键校验**：断言可能被关闭

## 生产环境

生产环境通常**关闭**断言（默认），关键校验用异常。断言主要用于开发和测试阶段捕获编程错误。

## 断言的编译与运行

assert 是关键字，编译器会生成对应的字节码。运行时若未启用 \`-ea\`，JVM 会跳过 assert 语句，几乎零开销。这就是断言适合开发期、可安全留在生产代码中的原因。

## 断言参数校验的反例

\`\`\`java
public void setAge(int age) {
    assert age >= 0 : "年龄不能为负"; // 反例：公共 API 不应用断言
    this.age = age;
}
\`\`\`

因为生产环境关闭断言后，非法参数会悄悄通过，导致后续更难排查的 bug。公共 API 校验必须用 \`if + throw\`。

## 断言与单元测试

单元测试框架（JUnit 的 \`assertEquals\` 等）内部也是基于断言思想，但它们是**始终启用**的方法调用，与 assert 关键字不同，不会因 \`-ea\` 关闭而失效。生产代码用 assert 关键字，测试代码用框架断言。

## 断言失败是 Error

\`AssertionError\` 继承自 \`Error\` 而非 \`Exception\`，表示不应恢复的编程错误。所以不要 catch \`AssertionError\` 来"处理"断言失败——那违背了断言的初衷，失败应当让程序停止并暴露问题。

## 启用断言的方式

- \`java -ea MyApp\`：全局启用
- \`java -ea:com.example... MyApp\`：只对某包启用
- \`java -da:com.example... MyApp\`：对某包禁用（-da = disable）

下面通过代码演示断言：`,
    code: `// 演示断言的使用
public class Main {
    public static void main(String[] args) {
        // 检查断言是否启用
        boolean assertionsEnabled = false;
        assert assertionsEnabled = true; // 副作用赋值
        System.out.println("断言是否启用: " + assertionsEnabled);

        if (!assertionsEnabled) {
            System.out.println("(提示: 用 java -ea Main 启用断言后再运行)");
        }

        // 1. 简单断言
        int x = 10;
        assert x > 0 : "x 必须为正, 实际: " + x;
        System.out.println("x = " + x + " (断言通过)");

        // 2. 私有方法的前置条件检查
        double result = sqrt(16.0);
        System.out.println("sqrt(16) = " + result);

        // 3. 不可达分支
        String day = "MON";
        int hours = workHours(day);
        System.out.println(day + " 工作时长: " + hours + "h");
    }

    // 私有方法用断言检查前置条件
    private static double sqrt(double value) {
        // 内部不变式: 参数必须非负
        assert value >= 0 : "sqrt 参数不能为负: " + value;
        return Math.sqrt(value);
    }

    // 不可达分支用断言
    private static int workHours(String day) {
        switch (day) {
            case "MON":
            case "TUE":
            case "WED":
            case "THU":
            case "FRI":
                return 8;
            case "SAT":
            case "SUN":
                return 0;
            default:
                assert false : "未知星期: " + day;
                return -1; // 不会执行
        }
    }
}`
  },
  {
    id: "java-exception-logging",
    group: "异常处理深入",
    icon: "📝",
    title: "异常日志",
    content: `# 异常日志

异常日志是排查问题的关键线索。正确记录异常能极大缩短排障时间。

## 异常堆栈打印

最基本的方式是 \`printStackTrace()\`，但生产环境应使用日志框架：

\`\`\`java
// 反例：直接打印
e.printStackTrace();

// 正例：用日志框架
logger.error("操作失败, userId={}", userId, e);
\`\`\`

\`printStackTrace\` 输出到 stderr，不受日志级别控制，生产环境不推荐。

## Logger 记录异常

日志框架（SLF4J、Log4j、JUL 等）记录异常时，**把异常对象作为最后一个参数**，无需占位符：

\`\`\`java
logger.error("查询用户失败, id={}", id, e); // e 自动记录堆栈
\`\`\`

错误写法：\`logger.error("失败: " + e)\` 或 \`logger.error(e.getMessage())\` 都会**丢失堆栈**。

## 异常信息格式

好的异常日志包含：
- **做什么**：操作描述（"查询用户"）
- **关键参数**：userId、请求 ID
- **结果**：失败原因
- **完整堆栈**：异常对象

\`\`\`java
logger.error("查询用户失败, userId={}, requestId={}", userId, reqId, e);
\`\`\`

## 不要重复记录

同一异常在多层被 catch 时，容易重复记录。原则：**只在一处记录**（通常是最高层 catch），其他层重新抛出。

\`\`\`java
// 错误：每层都记录
} catch (Exception e) {
    logger.error("DAO 层错误", e);
    throw e;
}
// ... 上层又记录一次
\`\`\`

## 上下文信息

异常发生时的上下文（用户、请求、参数）对排查至关重要。用 MDC（Mapped Diagnostic Context）关联请求链路：

\`\`\`java
MDC.put("requestId", uuid);
try { ... } finally { MDC.clear(); }
\`\`\`

## 日志级别选择

- \`ERROR\`：系统级故障、需要人工介入（如数据库连不上）
- \`WARN\`：可恢复的异常、潜在问题（如重试成功的请求）
- \`INFO\`：关键业务节点

异常通常记 \`ERROR\` 或 \`WARN\`，但不要把预期内的业务异常（如"用户不存在"）记成 ERROR——那只是正常业务流，记 INFO 或 WARN 即可，避免告警噪音。

## 异常的脱敏

异常消息和堆栈可能包含敏感信息（SQL 语句、用户数据、内部路径）。返回给前端的错误信息要脱敏，完整堆栈只记日志。可以用自定义异常的 errorCode + 用户友好消息对外，堆栈对内。

## 避免日志和异常重复输出

如果异常会被重新抛出并由上层记录，本层就**不要重复记录**。或者本层记录后不再抛出（即"处理"了异常）。既记录又抛出，会导致同一异常在日志里出现多次，污染排查。

## 异常的 toString

\`Throwable.toString()\` 返回"异常类名: 消息"，比 \`getMessage()\` 多了类名，便于快速识别异常类型。日志中传入异常对象（而非 getMessage）会自动包含完整堆栈，是最佳实践。

## 关联 ID

为每个请求生成唯一 \`requestId\`（或 \`traceId\`），放入 MDC。这样同一请求产生的所有日志（包括异常）都能通过 requestId 串联，是分布式系统排障的基础。

下面通过代码演示异常日志的最佳实践：`,
    code: `// 演示异常日志的最佳实践
import java.util.logging.Level;
import java.util.logging.Logger;

public class Main {
    private static final Logger logger = Logger.getLogger(Main.class.getName());

    public static void main(String[] args) {
        // 1. 正确记录异常（带上下文 + 完整堆栈）
        try {
            findUser(999L);
        } catch (UserNotFoundException e) {
            // 把异常作为最后参数，自动记录堆栈
            logger.log(Level.SEVERE, "查询用户失败, userId=999, 操作=主流程", e);
            System.out.println("已记录异常日志 (见上方 SEVERE 输出)");
        }

        // 2. 反例对比：丢失堆栈
        System.out.println("\\n--- 反例对比 ---");
        try {
            findUser(888L);
        } catch (UserNotFoundException e) {
            // 反例1：只记 message，丢失堆栈
            logger.severe("查询失败: " + e.getMessage());
            // 反例2：printStackTrace 不受日志级别控制
            // e.printStackTrace();
            System.out.println("(反例: 仅记录 message, 丢失堆栈)");
        }

        // 3. 模拟带上下文的日志
        System.out.println("\\n--- 带上下文日志 ---");
        String requestId = "req-" + System.currentTimeMillis();
        try {
            findUser(777L);
        } catch (UserNotFoundException e) {
            logger.log(Level.WARNING,
                "请求处理异常, requestId=" + requestId + ", userId=777", e);
        }
    }

    static void findUser(long id) throws UserNotFoundException {
        if (id > 100) {
            throw new UserNotFoundException("用户不存在: " + id);
        }
    }
}

// 自定义异常
class UserNotFoundException extends Exception {
    public UserNotFoundException(String message) {
        super(message);
    }
}`
  },
  {
    id: "java-exception-testing",
    group: "异常处理深入",
    icon: "🧪",
    title: "异常测试",
    content: `# 异常测试

测试异常行为是单元测试的重要部分。需要验证：异常**类型**、**消息**、**上下文字段**都符合预期。

## JUnit 5 assertThrows

最推荐的方式，简洁且能拿到异常对象做进一步断言：

\`\`\`java
IllegalArgumentException e = assertThrows(
    IllegalArgumentException.class,
    () -> service.setAge(-1)
);
assertEquals("年龄不能为负", e.getMessage());
\`\`\`

\`assertThrows\` 返回抛出的异常，便于验证消息和字段。

## try-catch 测试模式（传统）

JUnit 4 时代常用，较啰嗦：

\`\`\`java
try {
    service.setAge(-1);
    fail("应抛出异常");
} catch (IllegalArgumentException e) {
    assertEquals("年龄不能为负", e.getMessage());
}
\`\`\`

注意 \`fail()\` 必不可少，否则异常未抛出时测试仍会通过。

## 异常消息验证

只验证异常类型不够，还应验证消息：

\`\`\`java
assertTrue(e.getMessage().contains("年龄"));
\`\`\`

消息验证能确保异常携带了正确上下文。

## 测试自定义异常字段

自定义异常携带业务字段时，验证字段值：

\`\`\`java
InsufficientBalanceException e = assertThrows(
    InsufficientBalanceException.class,
    () -> account.withdraw(150)
);
assertEquals(100.0, e.getBalance(), 0.01);
\`\`\`

## 测试异常链

验证 cause 是否正确传递：

\`\`\`java
ServiceException e = assertThrows(ServiceException.class, () -> service.call());
assertNotNull(e.getCause());
assertTrue(e.getCause() instanceof SQLException);
\`\`\`

## 不要测试未抛出

不要用 \`assertDoesNotThrow\` 包裹正常流程，直接调用即可——无异常自然通过。

## 测试异常时验证无副作用

抛异常的方法可能已经修改了部分状态。测试时除了验证异常，还应验证副作用是否符合预期（如"转账失败时余额不应变化"）：

\`\`\`java
try {
    account.withdraw(200);
    fail();
} catch (InsufficientBalanceException e) {
    assertEquals(100.0, account.getBalance()); // 余额不变
}
\`\`\`

## 超时与异常

对于可能阻塞的代码，结合 \`assertTimeoutPreemptively\`（JUnit 5）测试：超时也算一种"异常"。注意超时是在独立线程执行的，被中断的线程可能仍在运行，断言时不要依赖其状态。

## 测试异常消息的灵活性

异常消息可能随版本变化，过度精确的断言（\`assertEquals("精确字符串")\`）会让测试脆弱。推荐用 \`contains\` 检查关键部分，如 \`assertTrue(e.getMessage().contains("余额"))\`，既验证语义又容忍措辞调整。

## 异常测试的反模式

- 只断言 \`assertThrows\` 不验证消息——无法发现异常信息丢失
- 用 \`try-catch-fail\` 忘记写 \`fail()\`——异常未抛时测试误判通过
- 在 \`@Test(expected=...)\`（JUnit 4）中无法验证异常细节——已不推荐

下面通过代码演示异常测试模式：`,
    code: `// 演示异常测试模式（含简化的断言工具）
public class Main {
    // 简化的断言工具，模拟 JUnit 的 assertThrows
    interface ThrowingRunnable {
        void run() throws Exception;
    }

    @SuppressWarnings("unchecked")
    static <T extends Throwable> T assertThrows(Class<T> expectedType, ThrowingRunnable runnable) {
        try {
            runnable.run();
        } catch (Throwable t) {
            if (expectedType.isInstance(t)) {
                return (T) t;
            }
            throw new AssertionError("期望 " + expectedType.getSimpleName()
                + ", 实际抛出 " + t.getClass().getSimpleName(), t);
        }
        throw new AssertionError("期望抛出 " + expectedType.getSimpleName() + ", 但未抛出任何异常");
    }

    static void assertEquals(Object expected, Object actual) {
        if (!expected.equals(actual)) {
            throw new AssertionError("期望: " + expected + ", 实际: " + actual);
        }
    }

    static void assertTrue(boolean condition, String msg) {
        if (!condition) throw new AssertionError(msg);
    }

    static void assertNotNull(Object o) {
        if (o == null) throw new AssertionError("期望非 null");
    }

    public static void main(String[] args) {
        BankService service = new BankService();

        // 1. 验证异常类型与消息
        System.out.println("=== 测试1: 异常类型与消息 ===");
        IllegalArgumentException e1 = assertThrows(
            IllegalArgumentException.class,
            () -> service.deposit(-100)
        );
        assertEquals("存款金额必须为正: -100.0", e1.getMessage());
        System.out.println("通过: " + e1.getMessage());

        // 2. 验证自定义异常字段
        System.out.println("\\n=== 测试2: 自定义异常字段 ===");
        InsufficientBalanceException e2 = assertThrows(
            InsufficientBalanceException.class,
            () -> service.withdraw(150)
        );
        assertEquals(100.0, e2.getBalance());
        assertEquals(150.0, e2.getAmount());
        System.out.println("通过: 余额=" + e2.getBalance() + ", 请求=" + e2.getAmount());

        // 3. 验证异常链（cause）
        System.out.println("\\n=== 测试3: 异常链 ===");
        ServiceException e3 = assertThrows(
            ServiceException.class,
            () -> service.queryFromDb()
        );
        assertNotNull(e3.getCause());
        assertTrue(e3.getCause() instanceof java.sql.SQLException,
            "cause 应为 SQLException");
        System.out.println("通过: cause=" + e3.getCause().getClass().getSimpleName());

        System.out.println("\\n所有异常测试通过!");
    }
}

// 被测服务
class BankService {
    private double balance = 100.0;

    void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("存款金额必须为正: " + amount);
        }
        balance += amount;
    }

    void withdraw(double amount) {
        if (amount > balance) {
            throw new InsufficientBalanceException(balance, amount);
        }
        balance -= amount;
    }

    void queryFromDb() throws ServiceException {
        try {
            throw new java.sql.SQLException("连接失败");
        } catch (java.sql.SQLException e) {
            throw new ServiceException("数据库查询失败", e);
        }
    }
}

// 自定义异常
class InsufficientBalanceException extends RuntimeException {
    private final double balance;
    private final double amount;
    InsufficientBalanceException(double balance, double amount) {
        super(String.format("余额不足: 余额 %.2f, 请求 %.2f", balance, amount));
        this.balance = balance;
        this.amount = amount;
    }
    public double getBalance() { return balance; }
    public double getAmount() { return amount; }
}

class ServiceException extends Exception {
    public ServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}`
  }
];
