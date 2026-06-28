// =============================================================
// Java 交互式教程 —— 第二十批章节（高级主题组，共 15 章）
// =============================================================

export const chapters = [
  {
    id: "java-jvm-architecture",
    group: "高级主题",
    icon: "🏠",
    title: "JVM 架构",
    content: `# JVM 架构

Java 虚拟机（JVM）是 Java "一次编写、到处运行" 的基石。它是一个**抽象计算机**，负责将字节码翻译为底层机器指令并执行。JVM 架构由三大子系统构成。

## 三大子系统

### 1. 类加载器子系统

负责从磁盘、网络或内存中**加载字节码**，并将其转换为 JVM 内部的运行时数据结构。包含三个阶段：加载、链接（验证/准备/解析）、初始化。

### 2. 运行时数据区

JVM 在执行期间管理的内存区域，分为两类：

- **线程共享**：方法区（元空间）、堆——所有线程可访问
- **线程私有**：虚拟机栈、本地方法栈、程序计数器——每个线程独占

### 3. 执行引擎

负责执行字节码，包含：
- **解释器**：逐条解释字节码，启动快但慢
- **JIT 编译器**（Just-In-Time）：将热点代码编译为本地机器码，提升长期运行性能
- **垃圾回收器**（GC）：自动回收堆中无用对象

## JVM 内存模型

\`\`\`
┌─────────────────────────────────────┐
│       运行时数据区                    │
├──────────────┬──────────────────────┤
│  线程私有     │   线程共享            │
│  ─────────   │   ─────────         │
│  程序计数器   │   方法区(元空间)      │
│  虚拟机栈     │   堆(新生代/老年代)   │
│  本地方法栈   │                      │
└──────────────┴──────────────────────┘
\`\`\`

## 线程共享 vs 线程私有

| 区域 | 共享性 | 存储内容 | 异常类型 |
|------|--------|----------|----------|
| 堆 | 共享 | 对象实例、数组 | OutOfMemoryError |
| 方法区 | 共享 | 类信息、常量、静态变量 | OutOfMemoryError |
| 虚拟机栈 | 私有 | 栈帧(局部变量、操作数栈) | StackOverflowError / OOM |
| 程序计数器 | 私有 | 当前指令地址 | 不会 OOM |
| 本地方法栈 | 私有 | Native 方法调用 | StackOverflowError / OOM |

## JIT 编译

HotSpot JVM 采用**解释器 + JIT 编译器**混合模式。热点探测（方法调用计数、回边计数）触发编译，编译后的代码缓存于 CodeCache。

## 类加载器层次

- **Bootstrap ClassLoader**：加载核心 JDK 类（\`java.lang.*\` 等），C++ 实现
- **Platform ClassLoader**（Java 9+，原 Extension）：加载平台扩展模块
- **Application ClassLoader**：加载应用 classpath 上的类
- **自定义 ClassLoader**：用户扩展，实现特殊加载逻辑

下面通过代码演示如何获取 JVM 运行时信息：`,
    code: `// 演示获取 JVM 运行时信息
import java.lang.management.*;

public class Main {
    public static void main(String[] args) {
        // ===== Runtime：JVM 运行时核心 =====
        Runtime rt = Runtime.getRuntime();

        // 处理器数量
        System.out.println("可用处理器: " + rt.availableProcessors());

        // 内存信息（字节）
        long max = rt.maxMemory();
        long total = rt.totalMemory();
        long free = rt.freeMemory();
        long used = total - free;
        System.out.println("最大堆内存: " + toMB(max) + " MB");
        System.out.println("当前堆总量: " + toMB(total) + " MB");
        System.out.println("已用堆内存: " + toMB(used) + " MB");
        System.out.println("空闲堆内存: " + toMB(free) + " MB");

        // ===== ManagementFactory：JVM 详细信息 =====
        // JVM 版本与名称
        RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();
        System.out.println("\\nJVM 名称: " + runtimeBean.getVmName());
        System.out.println("JVM 版本: " + runtimeBean.getVmVersion());
        System.out.println("JVM 厂商: " + runtimeBean.getVmVendor());
        System.out.println("启动参数: " + runtimeBean.getInputArguments());
        System.out.println("运行时长(ms): " + runtimeBean.getUptime());

        // 类加载器信息
        ClassLoader cl = Main.class.getClassLoader();
        while (cl != null) {
            System.out.println("类加载器: " + cl.getClass().getName());
            cl = cl.getParent();
        }
        System.out.println("顶层类加载器: Bootstrap（C++ 实现，Java 中为 null）");

        // 内存池（堆各区域）
        System.out.println("\\n内存池列表:");
        for (MemoryPoolMXBean pool : ManagementFactory.getMemoryPoolMXBeans()) {
            System.out.println("  " + pool.getName()
                + " [" + pool.getType() + "]"
                + " 已用=" + toMB(pool.getUsage().getUsed()) + " MB");
        }

        // 垃圾回收器
        System.out.println("\\n垃圾回收器:");
        for (GarbageCollectorMXBean gc : ManagementFactory.getGarbageCollectorMXBeans()) {
            System.out.println("  " + gc.getName()
                + " 收集次数=" + gc.getCollectionCount()
                + " 累计耗时(ms)=" + gc.getCollectionTime());
        }

        // 系统属性
        System.out.println("\\n关键系统属性:");
        System.out.println("java.version: " + System.getProperty("java.version"));
        System.out.println("java.home: " + System.getProperty("java.home"));
        System.out.println("os.name: " + System.getProperty("os.name"));
        System.out.println("user.dir: " + System.getProperty("user.dir"));

        // 手动触发 GC（仅建议，不保证立即执行）
        System.out.println("\\n调用 System.gc()");
        long before = rt.totalMemory() - rt.freeMemory();
        System.gc();
        long after = rt.totalMemory() - rt.freeMemory();
        System.out.println("GC 前后已用内存差: " + toMB(before - after) + " MB");
    }

    // 字节转 MB
    static String toMB(long bytes) {
        return String.format("%.2f", bytes / 1024.0 / 1024.0);
    }
}`
  },
  {
    id: "java-class-loading",
    group: "高级主题",
    icon: "📚",
    title: "类加载机制",
    content: `# 类加载机制

类加载是 JVM 将字节码（.class 文件）转换为内部 \`Class\` 对象的过程。它遵循严格的**生命周期**与**双亲委派模型**。

## 类加载生命周期

\`\`\`
加载 → 链接 → 初始化 → 使用 → 卸载
         │
         ├── 验证
         ├── 准备
         └── 解析
\`\`\`

### 加载（Loading）

通过类全限定名获取字节码二进制流，转为方法区的运行时数据结构，并在堆中生成 \`Class\` 对象作为访问入口。

### 链接（Linking）

- **验证**：检查字节码格式、元数据、字节码、符号引用的正确性，确保 JVM 安全
- **准备**：为**静态变量**分配内存并赋**零值**（非代码中的初始值），\`static final\` 常量在此阶段赋实际值
- **解析**：将常量池中的**符号引用**替换为**直接引用**

### 初始化（Initialization）

执行类构造器 \`<clinit>\`——合并所有 \`static\` 块和静态变量赋值。JVM 保证 \`<clinit>\` 线程安全。触发时机：
- new 实例化、访问静态字段、调用静态方法
- 反射调用（\`Class.forName\`）
- 子类初始化触发父类初始化
- 主类（含 main 的类）启动

## 双亲委派模型

加载类时**优先委派父加载器**，父加载器无法加载时子加载器才尝试：

\`\`\`
自定义 CL → Application CL → Platform CL → Bootstrap CL
     ↑                                              │
     └────────── 无法加载则回退 ──────────────────┘
\`\`\`

**意义**：防止核心类被篡改（如自定义 \`java.lang.String\` 会被 Bootstrap 加载的官方版本覆盖），保证类型一致性。

\`\`\`java
ClassLoader cl = String.class.getClassLoader(); // null（Bootstrap）
\`\`\`

## 自定义类加载器

继承 \`ClassLoader\`，重写 \`findClass\`：

\`\`\`java
class MyClassLoader extends ClassLoader {
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] data = loadClassData(name);
        return defineClass(name, data, 0, data.length);
    }
}
\`\`\`

典型应用：热部署、字节码加密、隔离加载（Tomcat 各 webapp 独立类加载器）。

## 打破双亲委派

重写 \`loadClass\`（而非 \`findClass\`）可绕过委派，如 OSGi、Tomcat 的 webapp 加载器。需谨慎，可能破坏核心类一致性。

下面通过代码演示类加载过程：`,
    code: `// 演示类加载机制
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 类加载器层次 =====
        ClassLoader appCl = Main.class.getClassLoader();
        System.out.println("Main 的类加载器: " + appCl);
        System.out.println("  父加载器: " + appCl.getParent());
        System.out.println("  祖父加载器: " + appCl.getParent().getParent());
        System.out.println("  (Bootstrap 为 null)");

        // 核心类由 Bootstrap 加载
        ClassLoader strCl = String.class.getClassLoader();
        System.out.println("String 的类加载器: " + strCl + " (Bootstrap)");

        // ===== 触发类初始化的时机 =====
        System.out.println("\\n--- 触发初始化 ---");
        System.out.println("访问静态字段前...");
        int v = Config.VALUE; // 触发 Config 类初始化
        System.out.println("Config.VALUE = " + v);

        // ===== Class.forName 触发初始化 =====
        Class<?> c = Class.forName("Main$Config");
        System.out.println("forName 加载的类: " + c.getName());

        // 不初始化的加载：ClassLoader.loadClass
        ClassLoader cl = Main.class.getClassLoader();
        Class<?> c2 = cl.loadClass("Main$Config"); // 不触发 <clinit>
        System.out.println("loadClass 加载: " + c2.getName());

        // ===== 自定义类加载器 =====
        System.out.println("\\n--- 自定义类加载器 ---");
        CustomClassLoader myCl = new CustomClassLoader();
        // 这里加载 Main 的内部类作为演示（实际可加载任意字节码）
        Class<?> loaded = myCl.loadClass("Main$Config");
        System.out.println("自定义加载的类: " + loaded.getName());
        System.out.println("加载器: " + loaded.getClassLoader());

        // 同一类被不同加载器加载会产生不同 Class 对象
        Class<?> byApp = appCl.loadClass("Main$Config");
        System.out.println("两个 Class 是否相同: " + (loaded == byApp));
        System.out.println("两个加载器是否相同: " + (loaded.getClassLoader() == byApp.getClassLoader()));

        // ===== 类初始化顺序 =====
        System.out.println("\\n--- 初始化顺序 ---");
        new Child();
    }

    // 配置类：演示初始化触发
    static class Config {
        static {
            System.out.println("  [Config 静态块执行]");
        }
        static int VALUE = 42;
    }

    // 父子类初始化顺序演示
    static class Parent {
        static { System.out.println("  父类静态块"); }
        { System.out.println("  父类实例块"); }
        Parent() { System.out.println("  父类构造器"); }
    }
    static class Child extends Parent {
        static { System.out.println("  子类静态块"); }
        { System.out.println("  子类实例块"); }
        Child() { System.out.println("  子类构造器"); }
    }

    // 自定义类加载器
    static class CustomClassLoader extends ClassLoader {
        @Override
        protected Class<?> findClass(String name) throws ClassNotFoundException {
            // 实际场景应从文件/网络读取字节码
            // 这里演示委托给父类加载
            return getParent().loadClass(name);
        }
    }
}`
  },
  {
    id: "java-memory-areas",
    group: "高级主题",
    icon: "🧠",
    title: "内存区域",
    content: `# 内存区域

JVM 运行时数据区分为五大区域，各有不同生命周期和异常类型。理解它们是排查 OOM、StackOverflow 的基础。

## 五大内存区域

### 1. 堆（Heap）

- **共享**：所有线程共享
- **作用**：存储对象实例和数组，是 GC 主战场
- **分代**：新生代（Eden + Survivor0 + Survivor1）+ 老年代
- **异常**：\`OutOfMemoryError: Java heap space\`

\`\`\`java
Object o = new Object(); // 分配在堆
\`\`\`

### 2. 方法区 / 元空间（Method Area / Metaspace）

- **共享**：所有线程共享
- **作用**：类信息、常量池、静态变量、JIT 编译后的代码
- **演进**：JDK 7 前称"永久代"（PermGen），JDK 8+ 改为"元空间"（使用本地内存）
- **异常**：\`OutOfMemoryError: Metaspace\`

### 3. 虚拟机栈（VM Stack）

- **私有**：每个线程独有
- **作用**：存储**栈帧**——每次方法调用创建一个栈帧，包含局部变量表、操作数栈、动态链接、方法出口
- **异常**：\`StackOverflowError\`（栈深度超限）、\`OutOfMemoryError\`（无法扩展）

\`\`\`java
void recursive() { recursive(); } // 无递归终止 → StackOverflowError
\`\`\`

### 4. 本地方法栈（Native Method Stack）

与虚拟机栈类似，但服务于 Native 方法（\`native\` 修饰）。HotSpot 将二者合并实现。

### 5. 程序计数器（PC Register）

- **私有**：线程独占
- **作用**：记录当前线程执行的字节码地址，分支/循环/异常/恢复都依赖它
- **唯一不会 OOM 的区域**

## OOM 类型速查

| 错误信息 | 区域 | 典型原因 |
|----------|------|----------|
| Java heap space | 堆 | 对象过多、内存泄漏 |
| GC overhead limit exceeded | 堆 | GC 回收效率低 |
| Metaspace | 方法区 | 动态生成类过多 |
| Direct buffer memory | 直接内存 | NIO Buffer 未释放 |
| unable to create new native thread | 系统 | 线程数超限 |
| StackOverflowError | 栈 | 递归过深 |

## 对象在堆中的布局

对象头（Mark Word + 类型指针）+ 实例数据 + 对齐填充。压缩指针（\`-XX:+UseCompressedOops\`）可减小占用。

## 栈帧结构

\`\`\`
┌────────────────┐
│ 局部变量表      │ ← 方法参数、局部变量
│ 操作数栈        │ ← 计算中间结果
│ 动态链接        │ ← 指向运行时常量池
│ 方法返回地址    │ ← 调用者下一条指令
└────────────────┘
\`\`\`

下面通过代码演示内存区域与 OOM 类型：`,
    code: `// 演示内存区域与 OOM 类型
import java.util.*;
import java.lang.management.*;

public class Main {
    public static void main(String[] args) {
        // ===== 堆：对象分配 =====
        System.out.println("--- 堆内存 ---");
        Runtime rt = Runtime.getRuntime();
        System.out.println("堆总量: " + mb(rt.totalMemory()) + " MB");
        System.out.println("堆最大: " + mb(rt.maxMemory()) + " MB");

        // 创建对象会消耗堆
        List<byte[]> list = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            list.add(new byte[1024 * 1024]); // 1MB
        }
        System.out.println("分配 5MB 后已用: " + mb(rt.totalMemory() - rt.freeMemory()) + " MB");

        // ===== 方法区：类信息 =====
        System.out.println("\\n--- 方法区(元空间) ---");
        for (MemoryPoolMXBean pool : ManagementFactory.getMemoryPoolMXBeans()) {
            if (pool.getName().toLowerCase().contains("metaspace")
                || pool.getName().toLowerCase().contains("perm")) {
                System.out.println("名称: " + pool.getName());
                System.out.println("已用: " + mb(pool.getUsage().getUsed()) + " MB");
                System.out.println("最大: " + mb(pool.getUsage().getMax()) + " MB");
            }
        }

        // ===== 程序计数器：当前线程执行位置 =====
        System.out.println("\\n--- 程序计数器 ---");
        System.out.println("当前线程: " + Thread.currentThread().getName());
        // PC 不可直接读取，但通过线程栈可观察
        System.out.println("栈深度: " + Thread.currentThread().getStackTrace().length);

        // ===== 虚拟机栈：方法调用 =====
        System.out.println("\\n--- 虚拟机栈 ---");
        System.out.println("递归调用演示栈帧:");
        factorial(5);

        // StackOverflowError 演示（注释以避免崩溃）
        try {
            infiniteRecursion(0);
        } catch (StackOverflowError e) {
            System.out.println("捕获 StackOverflowError: 递归过深");
        }

        // ===== 模拟堆 OOM（注释以避免崩溃）=====
        // List<int[]> leak = new ArrayList<>();
        // while (true) leak.add(new int[1000000]); // OutOfMemoryError: Java heap space

        // ===== 直接内存 =====
        System.out.println("\\n--- 直接内存 ---");
        java.nio.ByteBuffer direct = java.nio.ByteBuffer.allocateDirect(1024 * 1024);
        System.out.println("分配 1MB 直接内存: " + direct);

        // ===== 线程私有区域 =====
        System.out.println("\\n--- 线程私有区域 ---");
        Thread t = new Thread(() -> {
            int local = 100; // 存储在虚拟机栈的局部变量表
            System.out.println("子线程局部变量: " + local);
            System.out.println("子线程栈帧: " + Arrays.toString(Thread.currentThread().getStackTrace()));
        }, "worker-1");
        t.start();
        try { t.join(); } catch (InterruptedException e) {}

        // ===== 内存区域总结 =====
        System.out.println("\\n--- 内存区域总结 ---");
        System.out.println("线程共享: 堆 + 方法区(元空间)");
        System.out.println("线程私有: 虚拟机栈 + 本地方法栈 + 程序计数器");
        System.out.println("程序计数器是唯一不会 OOM 的区域");
    }

    // 递归演示虚拟机栈
    static int factorial(int n) {
        System.out.println("  factorial(" + n + ") 栈帧");
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }

    // 无限递归（演示 StackOverflowError）
    static int infiniteRecursion(int n) {
        return infiniteRecursion(n + 1);
    }

    static String mb(long bytes) {
        return String.format("%.2f MB", bytes / 1024.0 / 1024.0);
    }
}`
  },
  {
    id: "java-gc-basics",
    group: "高级主题",
    icon: "🗑️",
    title: "垃圾回收基础",
    content: `# 垃圾回收基础

垃圾回收（Garbage Collection, GC）自动管理堆内存，释放不再被引用的对象，避免手动 \`free\` 造成的内存泄漏与悬空指针。

## 判断对象存活

### 引用计数法（已弃用）

给对象加引用计数，引用 +1，断开 -1，为 0 则回收。**无法解决循环引用**，JVM 不采用。

### 可达性分析（JVM 实际采用）

从 **GC Roots** 出发，沿引用链遍历，**不可达**的对象即为可回收对象。

\`\`\`
GC Roots
   ↓
   A → B → C  (可达)
   D → E      (不可达，可回收)
\`\`\`

## GC Roots

可作为 GC Roots 的对象：
- 虚拟机栈中的**局部变量**（方法参数、局部变量）
- 方法区中的**静态变量**
- 方法区中的**常量**引用
- 本地方法栈中 JNI 引用的对象
- 活跃线程
- 同步锁持有的对象

## 四种引用

| 引用类型 | 回收时机 | 用途 |
|----------|----------|------|
| 强引用（Strong） | 永不回收（除非置 null） | 普通赋值 |
| 软引用（Soft） | 内存不足时回收 | 缓存 |
| 弱引用（Weak） | 下次 GC 即回收 | WeakHashMap |
| 虚引用（Phantom） | 随时可回收，仅跟踪回收 | 跟踪对象销毁 |

\`\`\`java
SoftReference<byte[]> cache = new SoftReference<>(new byte[1024]);
WeakReference<Object> weak = new WeakReference<>(new Object());
\`\`\`

## GC 算法

### 标记-清除（Mark-Sweep）

标记所有可回收对象，然后清除。**缺点**：产生内存碎片。

### 标记-复制（Copying）

将存活对象复制到另一半区域，清空原区域。**优点**：无碎片，分配快。**缺点**：可用内存减半。适合**新生代**（存活率低）。

### 标记-整理（Mark-Compact）

标记后将存活对象向一端移动，清除边界外内存。**优点**：无碎片。**缺点**：移动开销大。适合**老年代**。

## 分代收集

JVM 将堆分为**新生代**（Eden + 2 个 Survivor）与**老年代**：
- 新生代用复制算法（存活少）
- 老年代用标记-整理或标记-清除（存活多）

\`\`\`
新生代                老年代
┌─────┬────┬────┐    ┌──────────────┐
│Eden │S0  │S1  │    │              │
└─────┴────┴────┘    └──────────────┘
   Minor GC           Major/Full GC
\`\`\`

## Stop-The-World（STW）

GC 时需暂停所有应用线程，称为 STW。STW 时间长短直接影响应用响应。现代 GC（G1、ZGC）致力于降低 STW。

## 对象晋升

对象先在 Eden 分配，Minor GC 后存活进入 Survivor，**多次存活**（默认 15 次，\`-XX:MaxTenuringThreshold\`）晋升老年代。大对象直接进老年代（\`-XX:PretenureSizeThreshold\`）。

下面通过代码演示 GC 行为：`,
    code: `// 演示 GC 行为
import java.util.*;
import java.lang.ref.*;

public class Main {
    public static void main(String[] args) {
        // ===== 可达性分析：对象置 null 后可被回收 =====
        System.out.println("--- 可达性分析 ---");
        Runtime rt = Runtime.getRuntime();
        System.out.println("初始已用: " + mb(rt.totalMemory() - rt.freeMemory()));

        byte[] big = new byte[10 * 1024 * 1024]; // 10MB
        System.out.println("分配 10MB 后: " + mb(rt.totalMemory() - rt.freeMemory()));

        big = null; // 断开引用，对象变为不可达
        System.gc(); // 建议 GC
        System.out.println("置 null + GC 后: " + mb(rt.totalMemory() - rt.freeMemory()));

        // ===== 四种引用类型 =====
        System.out.println("\\n--- 四种引用 ---");

        // 强引用：永不回收
        Object strong = new Object();
        System.out.println("强引用: " + strong);

        // 软引用：内存不足时回收
        SoftReference<byte[]> soft = new SoftReference<>(new byte[5 * 1024 * 1024]);
        System.gc();
        System.out.println("软引用 GC 后: " + (soft.get() != null ? "存活" : "回收"));

        // 弱引用：下次 GC 即回收
        WeakReference<Object> weak = new WeakReference<>(new Object());
        System.out.println("弱引用 GC 前: " + (weak.get() != null ? "存活" : "回收"));
        System.gc();
        System.out.println("弱引用 GC 后: " + (weak.get() != null ? "存活" : "回收"));

        // 虚引用：随时回收，get() 永远返回 null
        ReferenceQueue<Object> queue = new ReferenceQueue<>();
        PhantomReference<Object> phantom = new PhantomReference<>(new Object(), queue);
        System.out.println("虚引用 get(): " + phantom.get() + " (永远为 null)");

        // ===== WeakHashMap：键为弱引用 =====
        System.out.println("\\n--- WeakHashMap ---");
        WeakHashMap<Object, String> whm = new WeakHashMap<>();
        Object key = new Object();
        whm.put(key, "value");
        System.out.println("GC 前 size: " + whm.size());
        key = null;
        System.gc();
        System.out.println("GC 后 size: " + whm.size());

        // ===== 分代演示：对象晋升 =====
        System.out.println("\\n--- 对象分配演示 ---");
        List<Object> oldGen = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            // 短命对象：Minor GC 后被回收
            byte[] temp = new byte[1024];
        }
        // 长命对象：进入老年代
        for (int i = 0; i < 10; i++) {
            oldGen.add(new byte[1024 * 100]); // 100KB
        }
        System.out.println("长命对象数: " + oldGen.size());

        // ===== finalize 方法（已废弃，仅演示）=====
        System.out.println("\\n--- finalize 演示（已废弃）---");
        for (int i = 0; i < 3; i++) {
            new FinalizeDemo(i);
        }
        System.gc();
        try { Thread.sleep(100); } catch (InterruptedException e) {}

        System.out.println("\\nGC 触发后内存: " + mb(rt.totalMemory() - rt.freeMemory()));
    }

    static String mb(long bytes) {
        return String.format("%.2f MB", bytes / 1024.0 / 1024.0);
    }

    // 演示 finalize（Java 9+ 已废弃，不推荐使用）
    static class FinalizeDemo {
        int id;
        FinalizeDemo(int id) { this.id = id; }
        @Override
        protected void finalize() throws Throwable {
            System.out.println("  FinalizeDemo[" + id + "] 被回收");
        }
    }
}`
  },
  {
    id: "java-gc-collectors",
    group: "高级主题",
    icon: "🚛",
    title: "GC 收集器",
    content: `# GC 收集器

不同 GC 收集器在**吞吐量**、**延迟**、**内存占用**间权衡。JDK 版本演进中，收集器不断优化 STW 时间。

## 收集器演进

\`\`\`
Serial → Parallel → CMS → G1 → ZGC / Shenandoah
\`\`\`

## 主要收集器

### Serial / Serial Old

- **单线程**回收，STW 期间串行工作
- 适合**客户端**、小堆应用
- 新生代用复制算法，老年代用标记-整理
- 参数：\`-XX:+UseSerialGC\`

### Parallel Scavenge / Parallel Old

- **多线程**回收，关注**吞吐量**（垃圾收集时间占比低）
- JDK 8 默认
- 适合**后台计算**、批处理
- 参数：\`-XX:+UseParallelGC\`

### CMS（Concurrent Mark Sweep）

- **老年代**收集器，**并发**标记清除，低停顿
- 已在 JDK 9 标记废弃，JDK 14 移除
- 阶段：初始标记（STW）→ 并发标记 → 重新标记（STW）→ 并发清除
- 缺点：内存碎片、浮动垃圾、Concurrent Mode Failure

### G1（Garbage First）

- JDK 9+ 默认，适合**大堆**（>6GB）
- 将堆分为多个 **Region**（1-32MB），混合回收
- 可预测停顿：\`-XX:MaxGCPauseMillis=200\`
- 名称来源：优先回收垃圾最多的 Region
- 参数：\`-XX:+UseG1GC\`

\`\`\`
G1 堆布局：
┌────┬────┬────┬────┬────┬────┐
│ E  │ S  │ O  │ E  │ O  │ H  │  E=Eden S=Survivor O=Old H=Humongous
├────┼────┼────┼────┼────┼────┤
│ O  │ E  │ O  │ S  │ E  │ O  │
└────┴────┴────┴────┴────┴────┘
\`\`\`

### ZGC

- JDK 11（实验），JDK 15 转正
- **着色指针** + **读屏障**实现并发整理
- 停顿 < 10ms，与堆大小无关
- 支持 TB 级堆
- 参数：\`-XX:+UseZGC\`

### Shenandoah

- Red Hat 主导，JDK 12 引入
- **Brooks 转发指针**实现并发整理
- 停顿与堆大小无关
- 参数：\`-XX:+UseShenandoahGC\`

## 对比表

| 收集器 | 算法 | 停顿 | 适合场景 | JDK |
|--------|------|------|----------|-----|
| Serial | 复制/整理 | 长 | 客户端 | - |
| Parallel | 复制/整理 | 中 | 吞吐优先 | 8 默认 |
| CMS | 标记清除 | 短 | 低延迟 | 移除 |
| G1 | 分区复制/整理 | 短可控 | 大堆低延迟 | 9+ 默认 |
| ZGC | 着色指针 | <10ms | 超大堆低延迟 | 15+ |
| Shenandoah | 转发指针 | <10ms | 大堆低延迟 | 15+ |

## 选择指南

- **小堆 / 客户端**：Serial
- **吞吐优先 / 批处理**：Parallel
- **一般服务（默认）**：G1
- **超低延迟 / 大堆**：ZGC 或 Shenandoah

下面通过代码演示获取 GC 收集器信息：`,
    code: `// 演示获取 GC 收集器信息
import java.lang.management.*;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 当前 GC 收集器 =====
        System.out.println("--- 当前垃圾回收器 ---");
        for (GarbageCollectorMXBean gc : ManagementFactory.getGarbageCollectorMXBeans()) {
            System.out.println("名称: " + gc.getName());
            System.out.println("  收集次数: " + gc.getCollectionCount());
            System.out.println("  累计耗时(ms): " + gc.getCollectionTime());
            System.out.println("  内存池: " + Arrays.toString(gc.getMemoryPoolNames()));
        }

        // ===== 通过 JVM 参数判断收集器 =====
        System.out.println("\\n--- JVM 启动参数 ---");
        RuntimeMXBean rt = ManagementFactory.getRuntimeMXBean();
        List<String> args2 = rt.getInputArguments();
        boolean useG1 = false, useZGC = false, useParallel = false, useSerial = false;
        for (String a : args2) {
            if (a.contains("UseG1GC")) useG1 = true;
            if (a.contains("UseZGC")) useZGC = true;
            if (a.contains("UseParallelGC")) useParallel = true;
            if (a.contains("UseSerialGC")) useSerial = true;
            if (a.startsWith("-XX:") && a.contains("GC")) {
                System.out.println("  " + a);
            }
        }
        System.out.println("启动参数列表: " + args2);

        // ===== 内存池（不同收集器结构不同）=====
        System.out.println("\\n--- 内存池（反映收集器类型）---");
        for (MemoryPoolMXBean pool : ManagementFactory.getMemoryPoolMXBeans()) {
            MemoryUsage u = pool.getUsage();
            System.out.println(pool.getName() + " [" + pool.getType() + "]");
            System.out.println("  已用: " + mb(u.getUsed())
                + ", 已提交: " + mb(u.getCommitted())
                + ", 最大: " + mb(u.getMax()));
        }

        // ===== 模拟 GC 行为 =====
        System.out.println("\\n--- 触发 GC 观察 ---");
        Runtime runtime = Runtime.getRuntime();
        System.out.println("GC 前: 已用=" + mb(runtime.totalMemory() - runtime.freeMemory()));

        // 创建大量短命对象（触发 Minor GC）
        for (int i = 0; i < 100_000; i++) {
            byte[] tmp = new byte[100];
        }

        System.out.println("分配后: 已用=" + mb(runtime.totalMemory() - runtime.freeMemory()));
        System.gc();
        System.out.println("System.gc() 后: 已用=" + mb(runtime.totalMemory() - runtime.freeMemory()));

        // ===== 收集器选择建议 =====
        System.out.println("\\n--- 收集器选择建议 ---");
        System.out.println("小堆(<2G): Serial 或 Parallel");
        System.out.println("吞吐优先: Parallel (-XX:+UseParallelGC)");
        System.out.println("一般服务: G1 (JDK 9+ 默认)");
        System.out.println("超低延迟大堆: ZGC (-XX:+UseZGC)");
        System.out.println("超低延迟大堆: Shenandoah (-XX:+UseShenandoahGC)");
    }

    static String mb(long bytes) {
        if (bytes < 0) return "未定义";
        return String.format("%.2f MB", bytes / 1024.0 / 1024.0);
    }
}`
  },
  {
    id: "java-jvm-tuning",
    group: "高级主题",
    icon: "🔧",
    title: "JVM 调优",
    content: `# JVM 调优

JVM 调优通过设置**堆大小**、**GC 策略**、**JIT** 等参数，平衡吞吐量、延迟与内存占用。调优前先**度量**，找到瓶颈再调。

## 堆大小参数

| 参数 | 含义 |
|------|------|
| \`-Xms<size>\` | 初始堆大小（如 \`-Xms512m\`） |
| \`-Xmx<size>\` | 最大堆大小（如 \`-Xmx2g\`） |
| \`-Xmn<size>\` | 新生代大小 |
| \`-XX:NewRatio=n\` | 老年代:新生代 = n:1 |
| \`-XX:SurvivorRatio=n\` | Eden:Survivor = n:1 |
| \`-XX:MetaspaceSize=<size>\` | 元空间初始大小 |
| \`-XX:MaxMetaspaceSize=<size>\` | 元空间最大 |

\`\`\`
java -Xms2g -Xmx2g -Xmn1g -XX:+UseG1GC -jar app.jar
\`\`\`

**生产建议**：\`-Xms\` 与 \`-Xmx\` 设为相同，避免堆动态扩缩的开销。

## 线程栈大小

\`-Xss<size>\` 设置每个线程栈大小，默认 512KB~1MB。栈越大能支持的递归越深，但能创建的线程数越少。

## GC 参数

### 通用

- \`-XX:+UseG1GC\`：启用 G1
- \`-XX:MaxGCPauseMillis=<ms>\`：目标最大停顿（G1/ZGC）
- \`-XX:ParallelGCThreads=<n>\`：GC 线程数
- \`-XX:ConcGCThreads=<n>\`：并发 GC 线程数

### G1 专属

- \`-XX:G1HeapRegionSize=<size>\`：Region 大小（1-32MB）
- \`-XX:InitiatingHeapOccupancyPercent=<n>\`：触发并发标记的堆占用阈值（默认 45）

### 日志

JDK 9+ 统一日志格式：

\`\`\`
-Xlog:gc*=info:file=gc.log:time,uptime:filecount=5,filesize=10m
\`\`\`

## JIT 参数

- \`-XX:+TieredCompilation\`：分层编译（默认开启）
- \`-XX:CompileThreshold=<n>\`：方法调用次数阈值触发编译

## 性能监控

- **jstat**：GC 统计
- **jmap**：堆内存分析
- **jstack**：线程栈
- **JConsole / VisualVM / Arthas**：可视化与在线诊断
- **GC 日志分析**：GCViewer、gceasy.io

## 调优策略

### 1. 先确定目标

- 吞吐优先：减少 GC 总时间
- 延迟优先：缩短单次 STW
- 内存优先：控制堆占用

### 2. 度量现状

收集 GC 日志、监控指标，定位问题：频繁 Full GC？单次 STW 过长？内存泄漏？

### 3. 调整参数

- 堆不足 → 增大 \`-Xmx\`
- Full GC 频繁 → 调大新生代 / 改用 G1
- STW 过长 → 切换 ZGC / Shenandoah
- 内存泄漏 → jmap dump + MAT 分析

### 4. 验证

调整后再次度量，对比指标，迭代优化。

## 常见陷阱

- 盲目调大堆：GC 停顿反而变长
- 忽视 GC 日志：调优无依据
- 滥用 \`System.gc()\`：触发意外 Full GC
- 堆外内存泄漏：直接内存、线程、JNI

下面通过代码演示 JVM 参数读取：`,
    code: `// 演示读取 JVM 参数
import java.lang.management.*;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Runtime rt = Runtime.getRuntime();
        RuntimeMXBean rtMx = ManagementFactory.getRuntimeMXBean();

        // ===== 堆内存参数 =====
        System.out.println("--- 堆内存配置 ---");
        System.out.println("初始堆(-Xms): " + mb(rt.totalMemory()));
        System.out.println("最大堆(-Xmx): " + mb(rt.maxMemory()));
        System.out.println("当前空闲: " + mb(rt.freeMemory()));
        System.out.println("已用: " + mb(rt.totalMemory() - rt.freeMemory()));

        // ===== 启动参数 =====
        System.out.println("\\n--- JVM 启动参数 ---");
        List<String> jvmArgs = rtMx.getInputArguments();
        if (jvmArgs.isEmpty()) {
            System.out.println("（使用默认参数）");
        } else {
            for (String a : jvmArgs) {
                System.out.println("  " + a);
            }
        }

        // ===== 关键参数解读 =====
        System.out.println("\\n--- 关键参数解读 ---");
        boolean hasXmx = false, hasXms = false, hasG1 = false;
        for (String a : jvmArgs) {
            if (a.startsWith("-Xmx")) { hasXmx = true; System.out.println("最大堆: " + a.substring(4)); }
            if (a.startsWith("-Xms")) { hasXms = true; System.out.println("初始堆: " + a.substring(4)); }
            if (a.contains("UseG1GC")) { hasG1 = true; System.out.println("使用 G1 收集器"); }
            if (a.contains("UseZGC")) System.out.println("使用 ZGC 收集器");
            if (a.contains("UseParallelGC")) System.out.println("使用 Parallel 收集器");
        }
        if (!hasXmx) System.out.println("未显式设置 -Xmx，使用默认值");
        if (!hasXms) System.out.println("未显式设置 -Xms，使用默认值");

        // ===== 内存池（反映 NewRatio / SurvivorRatio）=====
        System.out.println("\\n--- 内存池分布 ---");
        long eden = 0, survivor = 0, old = 0;
        for (MemoryPoolMXBean pool : ManagementFactory.getMemoryPoolMXBeans()) {
            String name = pool.getName().toLowerCase();
            long used = pool.getUsage().getUsed();
            if (name.contains("eden")) { eden = used; System.out.println("Eden: " + mb(used)); }
            else if (name.contains("survivor")) { survivor = used; System.out.println("Survivor: " + mb(used)); }
            else if (name.contains("old") || name.contains("tenured")) { old = used; System.out.println("Old: " + mb(used)); }
        }
        if (eden + survivor > 0) {
            System.out.println("新生代合计: " + mb(eden + survivor));
            System.out.println("老年代: " + mb(old));
        }

        // ===== 线程栈大小估算 =====
        System.out.println("\\n--- 线程信息 ---");
        ThreadMXBean threadMx = ManagementFactory.getThreadMXBean();
        System.out.println("活动线程数: " + threadMx.getThreadCount());
        System.out.println("峰值线程数: " + threadMx.getPeakThreadCount());
        System.out.println("守护线程数: " + threadMx.getDaemonThreadCount());

        // ===== 调优建议 =====
        System.out.println("\\n--- 调优建议 ---");
        System.out.println("1. -Xms 与 -Xmx 设为相同，避免动态扩缩");
        System.out.println("2. 通过 GC 日志判断是否需要调优");
        System.out.println("3. 大堆优先 G1，超低延迟用 ZGC");
        System.out.println("4. 调整后必须重新度量验证");
    }

    static String mb(long bytes) {
        if (bytes < 0) return "未定义";
        return String.format("%.2f MB", bytes / 1024.0 / 1024.0);
    }
}`
  },
  {
    id: "java-jvm-tools",
    group: "高级主题",
    icon: "🛠️",
    title: "JVM 工具",
    content: `# JVM 工具

JDK 自带丰富的诊断工具，配合可视化工具（JConsole、VisualVM、Arthas）可排查性能、内存、死锁等问题。

## 命令行工具

### jps

列出运行中的 Java 进程及其主类与参数：

\`\`\`bash
jps -lvm
# 12345 com.example.Main -Xmx2g
\`\`\`

### jstat

监控 GC 与类加载统计：

\`\`\`bash
jstat -gc <pid> 1000 10  # 每秒一次，共 10 次
\`\`\`

输出列：S0C/S1C（Survivor 容量）、EC（Eden）、OC（Old）、MC（元空间）、YGC/YGCT（Minor GC 次数/耗时）、FGC/FGCT（Full GC）。

### jmap

堆内存分析：

\`\`\`bash
jmap -heap <pid>            # 堆配置与使用
jmap -histo <pid>           # 对象统计（按大小排序）
jmap -histo:live <pid>      # 仅存活对象（触发 GC）
jmap -dump:format=b,file=heap.hprof <pid>  # 导出堆 dump
\`\`\`

### jstack

线程栈快照，排查死锁、阻塞：

\`\`\`bash
jstack <pid>
jstack -l <pid>   # 包含锁信息
\`\`\`

死锁检测：搜索 \`BLOCKED\` 状态线程与 \`- waiting to lock\` 链。

### jcmd

JDK 8+ 推荐，统一命令入口：

\`\`\`bash
jcmd <pid> VM.flags           # 查看 JVM 参数
jcmd <pid> Thread.print       # 等价 jstack
jcmd <pid> GC.heap_info       # 堆信息
jcmd <pid> GC.class_histogram # 对象统计
jcmd <pid> GC.heap_dump dump.hprof
jcmd <pid> VM.system_properties
\`\`\`

## 可视化工具

### JConsole

JDK 自带，基于 JMX，监控内存、线程、类、MBean，支持远程连接。

### VisualVM

集成 jstat/jmap/jstack，可视化堆 dump、CPU/内存采样、插件生态丰富。

### Arthas

阿里开源，**在线诊断**神器，无需重启应用：
- \`dashboard\`：实时面板
- \`thread\`：线程情况，\`thread -b\` 找阻塞
- \`jad\`：反编译类
- \`watch\`：方法调用观测
- \`trace\`：方法调用链耗时
- \`profiler\`：火焰图

## 诊断思路

### CPU 飙高

1. \`top\` 找到高 CPU Java 进程
2. \`top -Hp <pid>\` 找到高 CPU 线程
3. \`printf "%x\\n" <tid>\` 转十六进制
4. \`jstack <pid> | grep <hex>\` 定位栈

### 内存泄漏

1. \`jstat -gc\` 观察 Old 区持续增长
2. \`jmap -histo:live\` 看对象排行
3. \`jmap -dump\` 导出，MAT 分析支配树（Dominator Tree）

### 死锁

1. \`jstack -l <pid>\` 搜索 \`Found .* deadlock\`
2. 分析锁等待链

### 频繁 GC

1. \`jstat -gc\` 观察 YGC/FGC 频率
2. 判断是新生代过小还是内存泄漏
3. 调整 \`-Xmn\` 或切换收集器

## 程序内诊断

通过 \`ManagementFactory\` 在程序内获取诊断信息，集成到监控。

下面通过代码演示获取运行时诊断信息：`,
    code: `// 演示获取运行时诊断信息（模拟 jstat/jstack/jmap）
import java.lang.management.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        // 模拟工作负载
        Thread worker = new Thread(() -> {
            List<byte[]> data = new ArrayList<>();
            for (int i = 0; i < 50; i++) {
                data.add(new byte[1024 * 100]); // 100KB
                try { Thread.sleep(50); } catch (InterruptedException e) {}
            }
        }, "worker-thread");
        worker.start();

        // ===== 类似 jps：进程信息 =====
        System.out.println("--- 进程信息(jps 等价) ---");
        RuntimeMXBean rt = ManagementFactory.getRuntimeMXBean();
        System.out.println("PID: " + rt.getName().split("@")[0]);
        System.out.println("主机: " + rt.getName().split("@")[1]);
        System.out.println("主类: " + System.getProperty("sun.java.command", "未知"));

        // ===== 类似 jstat：GC 统计 =====
        System.out.println("\\n--- GC 统计(jstat 等价) ---");
        for (GarbageCollectorMXBean gc : ManagementFactory.getGarbageCollectorMXBeans()) {
            System.out.println(gc.getName() + ":");
            System.out.println("  收集次数: " + gc.getCollectionCount());
            System.out.println("  累计耗时(ms): " + gc.getCollectionTime());
        }

        // ===== 类似 jmap -heap：堆使用 =====
        System.out.println("\\n--- 堆使用(jmap -heap 等价) ---");
        MemoryMXBean mem = ManagementFactory.getMemoryMXBean();
        MemoryUsage heap = mem.getHeapMemoryUsage();
        System.out.println("堆已用: " + mb(heap.getUsed()) + " / 已提交: " + mb(heap.getCommitted())
            + " / 最大: " + mb(heap.getMax()));
        MemoryUsage nonHeap = mem.getNonHeapMemoryUsage();
        System.out.println("非堆已用: " + mb(nonHeap.getUsed()));

        System.out.println("对象 finalize 队列: " + mem.getObjectPendingFinalizationCount());

        // 内存池细节
        System.out.println("\\n内存池:");
        for (MemoryPoolMXBean pool : ManagementFactory.getMemoryPoolMXBeans()) {
            MemoryUsage u = pool.getUsage();
            System.out.printf("  %-25s 已用=%s 已提交=%s 最大=%s%n",
                pool.getName(), mb(u.getUsed()), mb(u.getCommitted()), mb(u.getMax()));
        }

        // ===== 类似 jstack：线程快照 =====
        System.out.println("\\n--- 线程快照(jstack 等价) ---");
        ThreadMXBean threadMx = ManagementFactory.getThreadMXBean();
        System.out.println("活动线程: " + threadMx.getThreadCount());
        System.out.println("峰值线程: " + threadMx.getPeakThreadCount());
        System.out.println("守护线程: " + threadMx.getDaemonThreadCount());

        // 检测死锁
        long[] deadlocks = threadMx.findDeadlockedThreads();
        System.out.println("死锁线程: " + (deadlocks == null ? "无" : Arrays.toString(deadlocks)));

        // 打印所有线程状态
        System.out.println("\\n线程状态:");
        for (ThreadInfo info : threadMx.getThreadInfo(threadMx.getAllThreadIds(), 5)) {
            System.out.println("  " + info.getThreadName() + " [" + info.getThreadState() + "]");
        }

        // ===== 类加载统计 =====
        System.out.println("\\n--- 类加载统计 ---");
        ClassLoadingMXBean clMx = ManagementFactory.getClassLoadingMXBean();
        System.out.println("已加载类: " + clMx.getLoadedClassCount());
        System.out.println("累计加载: " + clMx.getTotalLoadedClassCount());
        System.out.println("累计卸载: " + clMx.getUnloadedClassCount());

        // ===== 编译统计 =====
        System.out.println("\\n--- JIT 编译统计 ---");
        CompilationMXBean compMx = ManagementFactory.getCompilationMXBean();
        System.out.println("JIT 编译器: " + compMx.getName());
        System.out.println("累计编译耗时(ms): " + compMx.getTotalCompilationTime());

        // ===== 操作系统信息 =====
        System.out.println("\\n--- 操作系统信息 ---");
        OperatingSystemMXBean osMx = ManagementFactory.getOperatingSystemMXBean();
        System.out.println("OS: " + osMx.getName() + " " + osMx.getVersion());
        System.out.println("架构: " + osMx.getArch());
        System.out.println("CPU 核数: " + osMx.getAvailableProcessors());
        System.out.println("系统负载: " + String.format("%.2f", osMx.getSystemLoadAverage()));

        worker.join();
    }

    static String mb(long bytes) {
        if (bytes < 0) return "未定义";
        return String.format("%.2f MB", bytes / 1024.0 / 1024.0);
    }
}`
  },
  {
    id: "java-network-basics",
    group: "高级主题",
    icon: "🌐",
    title: "网络编程基础",
    content: `# 网络编程基础

Java 网络编程核心位于 \`java.net\` 包，提供 IP 地址、URL、Socket 等抽象。

## TCP vs UDP

| 特性 | TCP | UDP |
|------|-----|-----|
| 连接 | 面向连接（三次握手） | 无连接 |
| 可靠性 | 可靠（重传、排序） | 不可靠 |
| 顺序 | 保证顺序 | 不保证 |
| 速度 | 较慢 | 快 |
| 头开销 | 大（20+ 字节） | 小（8 字节） |
| 应用 | HTTP、SSH、邮件 | DNS、视频流、游戏 |

## InetAddress

表示 IP 地址，封装主机名与 IP：

\`\`\`java
InetAddress addr = InetAddress.getByName("www.example.com");
String ip = addr.getHostAddress();
\`\`\`

- \`InetAddress.getByName(host)\`：根据主机名查找
- \`InetAddress.getLocalHost()\`：本机地址
- \`InetAddress.getAllByName(host)\`：一个主机可能多个 IP

\`Inet4Address\` / \`Inet6Address\` 分别表示 IPv4 / IPv6。

## URL 与 URI

- **URI**：统一资源标识符，仅标识
- **URL**：统一资源定位符，URI 子集，包含访问协议

\`\`\`java
URL url = new URL("https://example.com/path?q=1");
String protocol = url.getProtocol(); // https
String host = url.getHost();
int port = url.getPort();           // -1 表示默认端口
String path = url.getPath();
String query = url.getQuery();
\`\`\`

## URLConnection

URL 的通用连接抽象，支持 HTTP、FTP 等：

\`\`\`java
URLConnection conn = url.openConnection();
conn.setConnectTimeout(5000);
conn.setReadTimeout(10000);
InputStream in = conn.getInputStream();
\`\`\`

\`HttpURLConnection\` 是 HTTP 专用子类，支持方法、Header、状态码。

## Socket 通信模型

### TCP Socket

\`\`\`
服务器                          客户端
ServerSocket(8080)              Socket(host, 8080)
   │ accept() ──────────────────→ 连接
   │ ←────────────────────────  数据
   │ ────────────────────────→  数据
   │ close()                    close()
\`\`\`

服务器端：

\`\`\`java
try (ServerSocket server = new ServerSocket(8080);
     Socket client = server.accept()) {
    BufferedReader in = new BufferedReader(
        new InputStreamReader(client.getInputStream()));
    String line = in.readLine();
}
\`\`\`

客户端：

\`\`\`java
try (Socket socket = new Socket("localhost", 8080)) {
    PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
    out.println("Hello");
}
\`\`\`

### UDP Socket

使用 \`DatagramSocket\` 与 \`DatagramPacket\`：

\`\`\`java
DatagramSocket socket = new DatagramSocket();
byte[] data = "Hello".getBytes();
DatagramPacket packet = new DatagramPacket(data, data.length,
    InetAddress.getByName("localhost"), 9090);
socket.send(packet);
\`\`\`

## 多客户端服务器

为每个连接创建线程或使用线程池：

\`\`\`java
ExecutorService pool = Executors.newFixedThreadPool(10);
while (true) {
    Socket client = server.accept();
    pool.submit(() -> handle(client));
}
\`\`\`

## 注意事项

- 端口范围 0-65535，0-1023 为系统保留
- 资源必须关闭（try-with-resources）
- 设置合理超时避免阻塞
- 大数据用缓冲流包装

下面通过代码演示 InetAddress 与网络基础：`,
    code: `// 演示网络编程基础
import java.net.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== InetAddress：IP 地址 =====
        System.out.println("--- InetAddress ---");
        InetAddress local = InetAddress.getLocalHost();
        System.out.println("本机主机名: " + local.getHostName());
        System.out.println("本机 IP: " + local.getHostAddress());
        System.out.println("是否可达(1s): " + local.isReachable(1000));

        // 通过主机名查询
        InetAddress[] all = InetAddress.getAllByName("localhost");
        System.out.println("localhost 所有地址:");
        for (InetAddress a : all) {
            System.out.println("  " + a + " (IPv4: " + (a instanceof Inet4Address) + ")");
        }

        // 回环地址
        InetAddress loop = InetAddress.getLoopbackAddress();
        System.out.println("回环地址: " + loop);

        // ===== URL：统一资源定位符 =====
        System.out.println("\\n--- URL 解析 ---");
        URL url = new URL("https://www.example.com:443/path/to/page?key=value&lang=zh#section");
        System.out.println("协议: " + url.getProtocol());
        System.out.println("主机: " + url.getHost());
        System.out.println("端口: " + url.getPort() + " (默认-1)");
        System.out.println("默认端口: " + url.getDefaultPort());
        System.out.println("路径: " + url.getPath());
        System.out.println("查询: " + url.getQuery());
        System.out.println("引用: " + url.getRef());
        System.out.println("权威: " + url.getAuthority());

        // URI 与 URL 区别
        URI uri = URI.create("mailto:user@example.com");
        System.out.println("URI scheme: " + uri.getScheme() + " (URI 不一定是 URL)");

        // ===== NetworkInterface：网络接口 =====
        System.out.println("\\n--- NetworkInterface ---");
        Enumeration<NetworkInterface> nics = NetworkInterface.getNetworkInterfaces();
        while (nics.hasMoreElements()) {
            NetworkInterface nic = nics.nextElement();
            System.out.println("接口: " + nic.getName() + " (" + nic.getDisplayName() + ")");
            System.out.println("  是否启用: " + nic.isUp() + ", 回环: " + nic.isLoopback());
            Enumeration<InetAddress> addrs = nic.getInetAddresses();
            while (addrs.hasMoreElements()) {
                System.out.println("  地址: " + addrs.nextElement().getHostAddress());
            }
        }

        // ===== TCP Socket 通信演示（本地回环）=====
        System.out.println("\\n--- TCP Socket 演示 ---");
        // 启动服务器线程
        Thread server = new Thread(() -> {
            try (ServerSocket ss = new ServerSocket(0)) { // 0 表示自动分配端口
                int port = ss.getLocalPort();
                System.out.println("服务器监听端口: " + port);
                try (Socket client = ss.accept();
                     BufferedReader in = new BufferedReader(
                         new InputStreamReader(client.getInputStream()));
                     PrintWriter out = new PrintWriter(client.getOutputStream(), true)) {
                    String msg = in.readLine();
                    System.out.println("服务器收到: " + msg);
                    out.println("Echo: " + msg);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        server.start();
        Thread.sleep(200); // 等服务器启动

        // 客户端连接（使用固定端口演示，实际中应获取动态端口）
        try (ServerSocket probe = new ServerSocket(18080)) {
            Thread client = new Thread(() -> {
                try (Socket s = new Socket("localhost", 18080);
                     PrintWriter out = new PrintWriter(s.getOutputStream(), true);
                     BufferedReader in = new BufferedReader(
                         new InputStreamReader(s.getInputStream()))) {
                    out.println("Hello, Server!");
                    System.out.println("客户端收到: " + in.readLine());
                } catch (IOException e) {
                    e.printStackTrace();
                }
            });
            // 简化：直接演示 Datagram
        }

        // ===== UDP 演示（DatagramSocket）=====
        System.out.println("\\n--- UDP Datagram 演示 ---");
        try (DatagramSocket ds = new DatagramSocket()) {
            String msg = "UDP 你好";
            byte[] data = msg.getBytes("UTF-8");
            DatagramPacket packet = new DatagramPacket(
                data, data.length,
                InetAddress.getByName("localhost"), 19090);
            ds.send(packet);
            System.out.println("已发送 UDP 数据包: " + msg + " (" + data.length + " 字节)");
        }

        System.out.println("\\n端口范围: 0-65535，0-1023 为系统保留端口");
    }
}`
  },
  {
    id: "java-http-client",
    group: "高级主题",
    icon: "📡",
    title: "HttpClient",
    content: `# HttpClient（Java 11+）

Java 11 引入的现代 HTTP 客户端 \`java.net.http.HttpClient\`，支持 HTTP/1.1、HTTP/2、WebSocket，原生异步，替代老旧的 \`HttpURLConnection\`。

## 三大核心类

### HttpClient

客户端实例，配置连接池、协议版本、重定向、代理等：

\`\`\`java
HttpClient client = HttpClient.newBuilder()
    .version(HttpClient.Version.HTTP_2)
    .connectTimeout(Duration.ofSeconds(10))
    .followRedirects(HttpClient.Redirect.NORMAL)
    .build();
\`\`\`

- 单例可复用，线程安全
- 默认 HTTP/2（不支持时自动降级到 1.1）
- 内置连接池

### HttpRequest

请求构建器：

\`\`\`java
HttpRequest req = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/data"))
    .timeout(Duration.ofSeconds(30))
    .header("Content-Type", "application/json")
    .GET()
    .build();
\`\`\`

便捷方法：\`GET()\`、\`POST(body)\`、\`PUT(body)\`、\`DELETE()\`。

BodyPublisher 提供请求体：
- \`BodyPublishers.ofString(s)\`
- \`BodyPublishers.ofByteArray(arr)\`
- \`BodyPublishers.ofFile(path)\`
- \`BodyPublishers.noBody()\`

### HttpResponse

响应封装，包含状态码、Header、Body：

\`\`\`java
HttpResponse<String> resp = client.send(req, BodyHandlers.ofString());
int status = resp.statusCode();
String body = resp.body();
\`\`\`

BodyHandler 决定如何处理响应体：
- \`BodyHandlers.ofString()\`：字符串
- \`BodyHandlers.ofByteArray()\`：字节数组
- \`BodyHandlers.ofFile(path)\`：直接写文件
- \`BodyHandlers.ofInputStream()\`：输入流
- \`BodyHandlers.discarding()\`：丢弃（仅关心状态码）

## 同步请求

\`send\` 阻塞直到响应返回：

\`\`\`java
HttpResponse<String> resp = client.send(req, BodyHandlers.ofString());
\`\`\`

## 异步请求

\`sendAsync\` 返回 \`CompletableFuture\`，非阻塞：

\`\`\`java
client.sendAsync(req, BodyHandlers.ofString())
      .thenApply(HttpResponse::body)
      .thenAccept(System.out::println);
\`\`\`

可链式组合多个异步请求，提升吞吐。

## 示例：GET 请求

\`\`\`java
HttpRequest req = HttpRequest.newBuilder()
    .uri(URI.create("https://httpbin.org/get"))
    .GET().build();
HttpResponse<String> resp = client.send(req, BodyHandlers.ofString());
\`\`\`

## 示例：POST JSON

\`\`\`java
String json = "{\\"name\\":\\"Tom\\"}";
HttpRequest req = HttpRequest.newBuilder()
    .uri(URI.create("https://httpbin.org/post"))
    .header("Content-Type", "application/json")
    .POST(BodyPublishers.ofString(json))
    .build();
\`\`\`

## 设置 Header

\`\`\`java
.header("Authorization", "Bearer xxx")
.headers("Accept", "application/json", "User-Agent", "MyApp")
\`\`\`

## 超时

- \`HttpClient.connectTimeout\`：连接超时
- \`HttpRequest.timeout\`：整个请求超时

## vs HttpURLConnection

| 特性 | HttpURLConnection | HttpClient |
|------|-------------------|------------|
| 协议 | HTTP/1.1 | HTTP/1.1、HTTP/2 |
| 异步 | 否（需手写线程） | 原生 CompletableFuture |
| API | 古老、繁琐 | 现代 Builder |
| 连接池 | 弱 | 内置 |
| WebSocket | 不支持 | 支持 |

下面通过代码演示 HttpClient（仅构造，不实际请求）：`,
    code: `// 演示 HttpClient（仅构造，不实际请求）
import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 构建 HttpClient =====
        System.out.println("--- HttpClient 构建 ---");
        HttpClient client = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();
        System.out.println("协议版本: " + client.version());
        System.out.println("连接超时: " + client.connectTimeout().orElse(Duration.ZERO));
        System.out.println("重定向策略: " + client.followRedirects());

        // 默认配置的便捷创建
        HttpClient defaultClient = HttpClient.newHttpClient();
        System.out.println("默认客户端: " + defaultClient.getClass().getSimpleName());

        // ===== 构建 GET 请求 =====
        System.out.println("\\n--- GET 请求构建 ---");
        HttpRequest getReq = HttpRequest.newBuilder()
            .uri(URI.create("https://httpbin.org/get"))
            .timeout(Duration.ofSeconds(30))
            .header("Accept", "application/json")
            .header("User-Agent", "Java-HttpClient-Demo")
            .GET()
            .build();
        System.out.println("方法: " + getReq.method());
        System.out.println("URI: " + getReq.uri());
        System.out.println("超时: " + getReq.timeout().orElse(Duration.ZERO));
        System.out.println("Headers: " + getReq.headers().map());

        // ===== 构建 POST 请求 =====
        System.out.println("\\n--- POST 请求构建 ---");
        String json = "{\\"name\\":\\"Tom\\",\\"age\\":18}";
        HttpRequest postReq = HttpRequest.newBuilder()
            .uri(URI.create("https://httpbin.org/post"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();
        System.out.println("方法: " + postReq.method());
        System.out.println("Body 存在: " + postReq.bodyPublisher().isPresent());

        // 不同 BodyPublisher
        HttpRequest.BodyPublisher noBody = HttpRequest.BodyPublishers.noBody();
        HttpRequest.BodyPublisher strBody = HttpRequest.BodyPublishers.ofString("hello");
        HttpRequest.BodyPublisher bytesBody = HttpRequest.BodyPublishers.ofByteArray(new byte[]{1, 2, 3});
        System.out.println("noBody 内容长度: " + noBody.contentLength());
        System.out.println("strBody 内容长度: " + strBody.contentLength());
        System.out.println("bytesBody 内容长度: " + bytesBody.contentLength());

        // ===== BodyHandler 选项 =====
        System.out.println("\\n--- BodyHandler 选项 ---");
        System.out.println("ofString: 响应体为字符串");
        System.out.println("ofByteArray: 响应体为字节数组");
        System.out.println("ofFile(path): 直接写入文件");
        System.out.println("ofInputStream: 输入流(适合大响应)");
        System.out.println("discarding: 丢弃响应体(仅关心状态码)");

        // ===== 异步 API 演示（不实际发送）=====
        System.out.println("\\n--- 异步 API 说明 ---");
        System.out.println("sendAsync 返回 CompletableFuture<HttpResponse<T>>");
        System.out.println("可链式: thenApply / thenAccept / exceptionally");
        System.out.println("示例: client.sendAsync(req, ofString()).thenApply(HttpResponse::body)");

        // ===== 模拟异步链（不发送真实请求）=====
        System.out.println("\\n--- 模拟 CompletableFuture 链 ---");
        CompletableFuture<String> fakeFuture = CompletableFuture.supplyAsync(() -> {
            // 模拟响应体
            return "{\\"status\\":\\"ok\\"}";
        }).thenApply(body -> "收到: " + body)
          .thenApply(s -> s.toUpperCase())
          .exceptionally(ex -> "出错: " + ex.getMessage());

        String result = fakeFuture.get(5, TimeUnit.SECONDS);
        System.out.println("异步结果: " + result);

        // ===== 多请求并行说明 =====
        System.out.println("\\n--- 多请求并行 ---");
        System.out.println("多个 sendAsync 可用 CompletableFuture.allOf 等待全部完成");
        System.out.println("HttpClient 内置连接池，无需手动管理");

        // ===== WebSocket 支持 =====
        System.out.println("\\n--- WebSocket ---");
        System.out.println("HttpClient 支持 WebSocket:");
        System.out.println("  client.newWebSocketBuilder().buildAsync(uri, listener)");

        // 客户端可复用
        System.out.println("\\nHttpClient 线程安全，建议单例复用");
        System.out.println("默认 HTTP/2，服务器不支持时自动降级到 HTTP/1.1");
    }
}`
  },
  {
    id: "java-jdbc-basics",
    group: "高级主题",
    icon: "🗄️",
    title: "JDBC 基础",
    content: `# JDBC 基础

JDBC（Java Database Connectivity）是 Java 访问关系数据库的标准 API，位于 \`java.sql\` 与 \`javax.sql\` 包。

## 核心接口

| 接口 | 作用 |
|------|------|
| \`DriverManager\` | 管理驱动、获取连接 |
| \`Connection\` | 数据库连接 |
| \`Statement\` | 静态 SQL 执行 |
| \`PreparedStatement\` | 预编译 SQL（防注入） |
| \`CallableStatement\` | 调用存储过程 |
| \`ResultSet\` | 查询结果集 |

## 连接流程

\`\`\`java
// 1. 加载驱动（JDBC 4.0+ 自动加载，可省略）
Class.forName("com.mysql.cj.jdbc.Driver");

// 2. 获取连接
Connection conn = DriverManager.getConnection(
    "jdbc:mysql://localhost:3306/db?useSSL=false", "user", "pwd");

// 3. 创建 Statement
Statement stmt = conn.createStatement();

// 4. 执行 SQL
ResultSet rs = stmt.executeQuery("SELECT * FROM users");

// 5. 处理结果
while (rs.next()) {
    int id = rs.getInt("id");
    String name = rs.getString("name");
}

// 6. 释放资源
rs.close(); stmt.close(); conn.close();
\`\`\`

## URL 格式

\`\`\`
jdbc:<驱动>:<子协议>//<host>:<port>/<database>?<参数>
\`\`\`

示例：
- MySQL：\`jdbc:mysql://localhost:3306/test\`
- PostgreSQL：\`jdbc:postgresql://localhost:5432/test\`
- Oracle：\`jdbc:oracle:thin:@localhost:1521:xe\`
- H2：\`jdbc:h2:mem:test\`

## CRUD 操作

### 查询（Read）

\`\`\`java
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery("SELECT * FROM users");
\`\`\`

### 插入（Create）

\`\`\`java
int rows = stmt.executeUpdate(
    "INSERT INTO users(name, age) VALUES('Tom', 18)");
\`\`\`

\`executeUpdate\` 返回受影响行数，用于 INSERT/UPDATE/DELETE。

### 更新与删除

\`\`\`java
stmt.executeUpdate("UPDATE users SET age=20 WHERE id=1");
stmt.executeUpdate("DELETE FROM users WHERE id=1");
\`\`\`

## PreparedStatement（推荐）

预编译 SQL，**防止 SQL 注入**，提升性能（可复用执行计划）：

\`\`\`java
PreparedStatement ps = conn.prepareStatement(
    "SELECT * FROM users WHERE name = ? AND age > ?");
ps.setString(1, name);   // 索引从 1 开始
ps.setInt(2, 18);
ResultSet rs = ps.executeQuery();
\`\`\`

**永远不要用字符串拼接 SQL**——会导致注入漏洞：

\`\`\`java
// 危险！SQL 注入
String sql = "SELECT * FROM users WHERE name='" + userInput + "'";
\`\`\`

## 事务管理

默认自动提交。手动事务：

\`\`\`java
conn.setAutoCommit(false);
try {
    // 多条 SQL
    stmt1.executeUpdate();
    stmt2.executeUpdate();
    conn.commit();
} catch (SQLException e) {
    conn.rollback();
}
\`\`\`

设置隔离级别：\`conn.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED)\`。

## ResultSet 类型

- **TYPE_FORWARD_ONLY**：只能向前（默认）
- **TYPE_SCROLL_INSENSITIVE**：可滚动，不感知数据库变化
- **TYPE_SCROLL_SENSITIVE**：可滚动，感知变化

并发模式：\`CONCUR_READ_ONLY\`（默认）、\`CONCUR_UPDATABLE\`。

## 资源管理

try-with-resources 自动关闭：

\`\`\`java
try (Connection c = ...;
     PreparedStatement ps = ...;
     ResultSet rs = ...) {
    // 使用
}
\`\`\`

## 连接池

直接 \`DriverManager\` 每次创建连接开销大，生产环境使用连接池：
- HikariCP（性能最佳，推荐）
- Druid（阿里开源，监控强）
- DBCP / c3p0（较老）

下面通过代码演示 JDBC 概念（不实际连接数据库）：`,
    code: `// 演示 JDBC 概念（不实际连接数据库）
import java.sql.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== JDBC API 概览 =====
        System.out.println("--- JDBC 核心接口 ---");
        System.out.println("DriverManager: 管理驱动、获取连接");
        System.out.println("Connection: 数据库连接");
        System.out.println("Statement / PreparedStatement / CallableStatement");
        System.out.println("ResultSet: 查询结果集");

        // ===== 驱动加载 =====
        System.out.println("\\n--- 驱动加载 ---");
        // JDBC 4.0+ 通过 ServiceLoader 自动加载，通常无需 Class.forName
        try {
            Class.forName("org.h2.Driver");
            System.out.println("已加载 H2 驱动");
        } catch (ClassNotFoundException e) {
            System.out.println("H2 驱动未找到（演示，可忽略）");
        }

        // 已注册驱动列表
        System.out.println("\\n已注册驱动:");
        Enumeration<Driver> drivers = DriverManager.getDrivers();
        while (drivers.hasMoreElements()) {
            Driver d = drivers.nextElement();
            System.out.println("  " + d.getClass().getName() + " v" + d.getMajorVersion());
        }

        // ===== 连接 URL 格式 =====
        System.out.println("\\n--- 连接 URL 格式 ---");
        System.out.println("jdbc:<驱动>:<子协议>//<host>:<port>/<db>?<参数>");
        System.out.println("MySQL:    jdbc:mysql://localhost:3306/test");
        System.out.println("PostgreSQL: jdbc:postgresql://localhost:5432/test");
        System.out.println("Oracle:   jdbc:oracle:thin:@localhost:1521:xe");
        System.out.println("H2 内存:  jdbc:h2:mem:test");

        // ===== 使用 H2 内存数据库实际演示（如可用）=====
        System.out.println("\\n--- 尝试使用 H2 内存数据库 ---");
        try (Connection conn = DriverManager.getConnection("jdbc:h2:mem:testdb", "sa", "")) {
            System.out.println("连接成功: " + conn);
            System.out.println("自动提交: " + conn.getAutoCommit());
            System.out.println("隔离级别: " + conn.getTransactionIsolation()
                + " (" + isolationName(conn.getTransactionIsolation()) + ")");

            // 建表
            try (Statement stmt = conn.createStatement()) {
                stmt.executeUpdate(
                    "CREATE TABLE users (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50), age INT)");
                System.out.println("\\n创建表 users");

                // 插入（Statement，仅演示，生产用 PreparedStatement）
                int rows = stmt.executeUpdate(
                    "INSERT INTO users(name, age) VALUES('Tom', 18)");
                System.out.println("插入 " + rows + " 行");

                // PreparedStatement 防注入
                try (PreparedStatement ps = conn.prepareStatement(
                        "INSERT INTO users(name, age) VALUES(?, ?)")) {
                    ps.setString(1, "Jerry");  // 索引从 1 开始
                    ps.setInt(2, 20);
                    ps.executeUpdate();
                    ps.setString(1, "Alice");
                    ps.setInt(2, 22);
                    ps.executeUpdate();
                    System.out.println("PreparedStatement 插入 2 行");
                }

                // 查询
                try (ResultSet rs = stmt.executeQuery("SELECT * FROM users")) {
                    System.out.println("\\n查询结果:");
                    ResultSetMetaData meta = rs.getMetaData();
                    int colCount = meta.getColumnCount();
                    for (int i = 1; i <= colCount; i++) {
                        System.out.print(meta.getColumnName(i) + "\\t");
                    }
                    System.out.println();
                    while (rs.next()) {
                        System.out.println(rs.getInt("id") + "\\t"
                            + rs.getString("name") + "\\t" + rs.getInt("age"));
                    }
                }

                // 更新
                int updated = stmt.executeUpdate("UPDATE users SET age=25 WHERE name='Tom'");
                System.out.println("\\n更新 " + updated + " 行");

                // 删除
                int deleted = stmt.executeUpdate("DELETE FROM users WHERE age>20");
                System.out.println("删除 " + deleted + " 行");
            }

            // 事务演示
            System.out.println("\\n--- 事务演示 ---");
            conn.setAutoCommit(false);
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO users(name, age) VALUES(?, ?)")) {
                ps.setString(1, "Tx1"); ps.setInt(2, 30); ps.executeUpdate();
                ps.setString(1, "Tx2"); ps.setInt(2, 31); ps.executeUpdate();
                conn.commit();
                System.out.println("事务提交成功");
            } catch (SQLException e) {
                conn.rollback();
                System.out.println("事务回滚: " + e.getMessage());
            } finally {
                conn.setAutoCommit(true);
            }

            // 最终查询
            try (Statement s = conn.createStatement();
                 ResultSet rs = s.executeQuery("SELECT COUNT(*) FROM users")) {
                rs.next();
                System.out.println("最终用户数: " + rs.getInt(1));
            }

        } catch (SQLException e) {
            System.out.println("H2 不可用，仅演示概念: " + e.getMessage());
        }

        System.out.println("\\n生产建议: 使用 HikariCP 连接池 + PreparedStatement");
    }

    static String isolationName(int level) {
        switch (level) {
            case Connection.TRANSACTION_NONE: return "NONE";
            case Connection.TRANSACTION_READ_UNCOMMITTED: return "READ_UNCOMMITTED";
            case Connection.TRANSACTION_READ_COMMITTED: return "READ_COMMITTED";
            case Connection.TRANSACTION_REPEATABLE_READ: return "REPEATABLE_READ";
            case Connection.TRANSACTION_SERIALIZABLE: return "SERIALIZABLE";
            default: return "UNKNOWN";
        }
    }
}`
  },
  {
    id: "java-date-time",
    group: "高级主题",
    icon: "📅",
    title: "日期时间 API",
    content: `# 日期时间 API（java.time）

Java 8 引入 \`java.time\` 包，取代老旧的 \`Date\`、\`Calendar\`。新 API **不可变**、**线程安全**、**清晰建模**，借鉴 Joda-Time。

## 核心类

| 类 | 表示 | 示例 |
|----|------|------|
| \`LocalDate\` | 日期（无时间） | 2024-01-15 |
| \`LocalTime\` | 时间（无日期） | 14:30:00 |
| \`LocalDateTime\` | 日期+时间（无时区） | 2024-01-15T14:30 |
| \`Instant\` | 时间戳（UTC） | 2024-01-15T06:30:00Z |
| \`ZonedDateTime\` | 带时区日期时间 | 2024-01-15T14:30+08:00[Asia/Shanghai] |
| \`Duration\` | 时间长度（小时/分/秒） | PT1H30M |
| \`Period\` | 日期跨度（年/月/日） | P1Y2M3D |
| \`DateTimeFormatter\` | 格式化/解析 | yyyy-MM-dd |

## LocalDate

\`\`\`java
LocalDate today = LocalDate.now();
LocalDate birthday = LocalDate.of(1990, 5, 20);
LocalDate parsed = LocalDate.parse("2024-01-15");
\`\`\`

操作：
- \`plusDays(n)\` / \`minusDays(n)\`
- \`plusMonths(n)\` / \`plusYears(n)\`
- \`getYear()\` / \`getMonthValue()\` / \`getDayOfWeek()\`
- \`isBefore(other)\` / \`isAfter(other)\`
- \`withYear(y)\` / \`withMonth(m)\`

## LocalTime

\`\`\`java
LocalTime now = LocalTime.now();
LocalTime time = LocalTime.of(14, 30, 0);
\`\`\`

## LocalDateTime

\`\`\`java
LocalDateTime dt = LocalDateTime.of(2024, 1, 15, 14, 30);
LocalDateTime now = LocalDateTime.now();
\`\`\`

## Instant

时间线上的瞬时点（UTC），适合**时间戳**：

\`\`\`java
Instant now = Instant.now();
long epochSec = now.getEpochSecond();
long epochMilli = now.toEpochMilli();
\`\`\`

与 \`Date\` 互转：
\`\`\`java
Date d = Date.from(instant);
Instant i = d.toInstant();
\`\`\`

## Duration 与 Period

**Duration**：基于时间（小时/分/秒/纳秒）

\`\`\`java
Duration d = Duration.between(t1, t2);
long minutes = d.toMinutes();
\`\`\`

**Period**：基于日期（年/月/日）

\`\`\`java
Period p = Period.between(birthday, today);
int years = p.getYears();
\`\`\`

## DateTimeFormatter

线程安全（不同于 \`SimpleDateFormat\`）：

\`\`\`java
DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy年MM月dd日 HH:mm:ss");
String s = dt.format(fmt);
LocalDateTime parsed = LocalDateTime.parse(s, fmt);
\`\`\`

内置格式：\`ISO_LOCAL_DATE\`、\`ISO_DATE_TIME\` 等。

## ZonedDateTime

\`\`\`java
ZonedDateTime shanghai = ZonedDateTime.now(ZoneId.of("Asia/Shanghai"));
ZonedDateTime ny = shanghai.withZoneSameInstant(ZoneId.of("America/New_York"));
\`\`\`

时区转换、夏令时处理由 \`ZoneId\` 完成。

## 不可变性

所有 \`java.time\` 类**不可变**，修改方法返回**新对象**：

\`\`\`java
LocalDate tomorrow = today.plusDays(1); // today 不变
\`\`\`

天然线程安全。

## 与老 API 互转

\`\`\`java
// Date ↔ Instant
Date d = Date.from(Instant.now());
Instant i = d.toInstant();

// Calendar ↔ Instant
Calendar c = Calendar.getInstance();
Instant ci = c.toInstant();
\`\`\`

## 常用模式

- 业务日期用 \`LocalDate\`
- 时间戳用 \`Instant\`
- 跨时区用 \`ZonedDateTime\`
- 格式化始终用 \`DateTimeFormatter\`

下面通过代码演示日期时间 API：`,
    code: `// 演示 java.time 日期时间 API
import java.time.*;
import java.time.format.*;
import java.time.temporal.*;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== LocalDate =====
        System.out.println("--- LocalDate ---");
        LocalDate today = LocalDate.now();
        LocalDate birthday = LocalDate.of(1990, 5, 20);
        LocalDate parsed = LocalDate.parse("2024-01-15");
        System.out.println("今天: " + today);
        System.out.println("生日: " + birthday);
        System.out.println("明天: " + today.plusDays(1));
        System.out.println("上月同日: " + today.minusMonths(1));
        System.out.println("年份: " + today.getYear() + ", 月: " + today.getMonthValue()
            + ", 日: " + today.getDayOfMonth() + ", 星期: " + today.getDayOfWeek());
        System.out.println("是否闰年: " + today.isLeapYear());
        System.out.println("本月天数: " + today.lengthOfMonth());

        // ===== LocalTime =====
        System.out.println("\\n--- LocalTime ---");
        LocalTime now = LocalTime.now();
        LocalTime meeting = LocalTime.of(14, 30, 0);
        System.out.println("现在: " + now);
        System.out.println("会议: " + meeting);
        System.out.println("2 小时后: " + now.plusHours(2));
        System.out.println("秒数: " + now.toSecondOfDay());

        // ===== LocalDateTime =====
        System.out.println("\\n--- LocalDateTime ---");
        LocalDateTime dt = LocalDateTime.of(2024, 1, 15, 14, 30, 0);
        System.out.println("日期时间: " + dt);
        System.out.println("当前: " + LocalDateTime.now());

        // ===== Instant =====
        System.out.println("\\n--- Instant ---");
        Instant instant = Instant.now();
        System.out.println("UTC 时间戳: " + instant);
        System.out.println("Unix 秒: " + instant.getEpochSecond());
        System.out.println("Unix 毫秒: " + instant.toEpochMilli());
        // 与 System.currentTimeMillis 一致
        System.out.println("System.currentTimeMillis: " + System.currentTimeMillis());

        // ===== Duration =====
        System.out.println("\\n--- Duration ---");
        LocalTime t1 = LocalTime.of(9, 0);
        LocalTime t2 = LocalTime.of(17, 30);
        Duration dur = Duration.between(t1, t2);
        System.out.println("9:00 到 17:30");
        System.out.println("  小时: " + dur.toHours());
        System.out.println("  分钟: " + dur.toMinutes());
        System.out.println("  秒: " + dur.toSeconds());
        System.out.println("  ISO: " + dur);

        // ===== Period =====
        System.out.println("\\n--- Period ---");
        Period age = Period.between(birthday, today);
        System.out.println("生日 " + birthday + " 到 " + today);
        System.out.println("  年: " + age.getYears());
        System.out.println("  月: " + age.getMonths());
        System.out.println("  日: " + age.getDays());
        System.out.println("  ISO: " + age);

        // 计算天数差
        long daysBetween = ChronoUnit.DAYS.between(birthday, today);
        System.out.println("  总天数: " + daysBetween);

        // ===== DateTimeFormatter =====
        System.out.println("\\n--- DateTimeFormatter ---");
        DateTimeFormatter fmt1 = DateTimeFormatter.ofPattern("yyyy年MM月dd日 HH:mm:ss");
        DateTimeFormatter fmt2 = DateTimeFormatter.ofPattern("yyyy/MM/dd");
        DateTimeFormatter fmt3 = DateTimeFormatter.ISO_LOCAL_DATE;
        System.out.println("中文格式: " + dt.format(fmt1));
        System.out.println("斜线格式: " + dt.format(fmt2));
        System.out.println("ISO 格式: " + dt.format(fmt3));

        // 解析
        String dateStr = "2024年06月15日 10:30:00";
        LocalDateTime parsed2 = LocalDateTime.parse(dateStr, fmt1);
        System.out.println("解析后: " + parsed2);

        // ===== ZonedDateTime =====
        System.out.println("\\n--- ZonedDateTime ---");
        ZonedDateTime shanghai = ZonedDateTime.now(ZoneId.of("Asia/Shanghai"));
        ZonedDateTime ny = shanghai.withZoneSameInstant(ZoneId.of("America/New_York"));
        ZonedDateTime london = shanghai.withZoneSameInstant(ZoneId.of("Europe/London"));
        System.out.println("上海: " + shanghai);
        System.out.println("纽约: " + ny);
        System.out.println("伦敦: " + london);

        // 可用时区
        System.out.println("\\n部分时区:");
        ZoneId.getAvailableZoneIds().stream()
            .filter(z -> z.startsWith("Asia"))
            .limit(5)
            .forEach(z -> System.out.println("  " + z));

        // ===== 与老 API 互转 =====
        System.out.println("\\n--- 与老 API 互转 ---");
        Date oldDate = new Date();
        Instant fromOld = oldDate.toInstant();
        LocalDateTime ldt = LocalDateTime.ofInstant(fromOld, ZoneId.systemDefault());
        System.out.println("Date: " + oldDate);
        System.out.println("转换 LocalDateTime: " + ldt);
        System.out.println("转回 Date: " + Date.from(ldt.atZone(ZoneId.systemDefault()).toInstant()));

        // ===== 不可变性演示 =====
        System.out.println("\\n--- 不可变性 ---");
        LocalDate base = LocalDate.of(2024, 1, 1);
        LocalDate modified = base.plusDays(10);
        System.out.println("原对象: " + base + " (不变)");
        System.out.println("新对象: " + modified);
    }
}`
  },
  {
    id: "java-i18n",
    group: "高级主题",
    icon: "🌍",
    title: "国际化",
    content: `# 国际化（i18n）

国际化（Internationalization，i18n）让应用适配不同**语言**与**地区**。Java 提供完整的 i18n 支持，核心位于 \`java.util\` 与 \`java.text\` 包。

## Locale

\`Locale\` 表示特定语言+地区的组合：

\`\`\`java
Locale zhCN = new Locale("zh", "CN"); // 中文-中国
Locale enUS = Locale.US;              // 英文-美国
Locale japan = Locale.JAPAN;          // 日文-日本
\`\`\`

- **语言**：ISO 639（zh、en、ja、fr）
- **国家/地区**：ISO 3166（CN、US、JP、FR）
- **变体**：可选（如传统拼音）

Java 19+ 引入 BCP 47 兼容的 \`Locale.LanguageRange\`。

## ResourceBundle

按 Locale 加载**资源包**，命名约定：

\`\`\`
messages.properties         # 默认
messages_zh.properties      # 中文
messages_zh_CN.properties   # 中文-中国
messages_en_US.properties   # 英文-美国
\`\`\`

加载时按"最具体→最通用"查找：

\`\`\`java
ResourceBundle bundle = ResourceBundle.getBundle("messages", locale);
String greeting = bundle.getString("greeting");
\`\`\`

资源文件内容：

\`\`\`properties
# messages_zh_CN.properties
greeting=你好
farewell=再见
\`\`\`

## MessageFormat

动态参数化消息：

\`\`\`properties
welcome=欢迎，{0}！您有 {1} 条新消息。
\`\`\`

\`\`\`java
String pattern = bundle.getString("welcome");
String msg = MessageFormat.format(pattern, "张三", 5);
// 欢迎，张三！您有 5 条新消息。
\`\`\`

支持参数类型与格式：
- \`{0,number,currency}\`：货币
- \`{0,date,short}\`：日期
- \`{0,choice,0#无|1#一条|1<{0}条}\`：选择

## NumberFormat

按地区格式化数字、货币、百分比：

\`\`\`java
NumberFormat nf = NumberFormat.getCurrencyInstance(Locale.US);
String s = nf.format(1234.56); // $1,234.56

NumberFormat cnCurrency = NumberFormat.getCurrencyInstance(Locale.CHINA);
cnCurrency.format(1234.56); // ￥1,234.56
\`\`\`

- \`getNumberInstance\`：通用数字
- \`getIntegerInstance\`：整数
- \`getPercentInstance\`：百分比

## DateFormat / DateTimeFormatter

按地区格式化日期：

\`\`\`java
DateFormat df = DateFormat.getDateInstance(DateFormat.LONG, Locale.US);
df.format(new Date()); // January 15, 2024
\`\`\`

Java 8+ 也可用 \`DateTimeFormatter.ofLocalizedDate\`：

\`\`\`java
DateTimeFormatter f = DateTimeFormatter.ofLocalizedDate(FormatStyle.LONG)
    .withLocale(Locale.US);
\`\`\`

## 多语言支持架构

1. **提取字符串**：所有用户可见文本从代码移至资源文件
2. **绑定 Locale**：根据用户偏好/请求头选择 Locale
3. **格式化数值日期**：使用 NumberFormat/DateFormat
4. **复数处理**：ChoiceFormat 或 ICU MessageFormat

## 默认 Locale

\`\`\`java
Locale.setDefault(Locale.US);
Locale current = Locale.getDefault();
\`\`\`

Web 应用应从 \`Accept-Language\` 头解析：

\`\`\`java
Locale userLocale = request.getLocale();
\`\`\`

## 资源文件编码

Java 9+ \`PropertyResourceBundle\` 默认 UTF-8（之前需 \`native2ascii\` 转码）。

## 陷阱

- 字符串硬编码：难以维护，必须提取
- 资源 key 缺失：\`ResourceBundle\` 抛 \`MissingResourceException\`
- 忽略地区差异：日期/数字格式错误显示

下面通过代码演示国际化：`,
    code: `// 演示国际化
import java.util.*;
import java.text.*;
import java.time.*;
import java.time.format.*;

public class Main {
    public static void main(String[] args) {
        // ===== Locale =====
        System.out.println("--- Locale ---");
        Locale zhCN = Locale.SIMPLIFIED_CHINESE;
        Locale enUS = Locale.US;
        Locale japan = Locale.JAPAN;
        Locale france = Locale.FRANCE;
        System.out.println("中文(中国): " + zhCN + " 展示名: " + zhCN.getDisplayName(zhCN));
        System.out.println("英文(美国): " + enUS);
        System.out.println("日文(日本): " + japan);
        System.out.println("法文(法国): " + france);

        // 当前默认 Locale
        System.out.println("默认 Locale: " + Locale.getDefault());

        // ===== 模拟 ResourceBundle（运行时构建）=====
        System.out.println("\\n--- ResourceBundle 模拟 ---");
        // 实际从 messages_xx.properties 文件加载
        // 这里用 ListResourceBundle 内联演示
        ResourceBundle bundle = getResourceBundle(zhCN);
        System.out.println("中文 greeting: " + bundle.getString("greeting"));
        System.out.println("中文 farewell: " + bundle.getString("farewell"));

        ResourceBundle bundleEn = getResourceBundle(enUS);
        System.out.println("英文 greeting: " + bundleEn.getString("greeting"));
        System.out.println("英文 farewell: " + bundleEn.getString("farewell"));

        // ===== MessageFormat =====
        System.out.println("\\n--- MessageFormat ---");
        String zhPattern = "欢迎，{0}！您有 {1} 条新消息。";
        String enPattern = "Welcome, {0}! You have {1} new messages.";
        System.out.println(MessageFormat.format(zhPattern, "张三", 5));
        System.out.println(MessageFormat.format(enPattern, "Tom", 3));

        // 带格式的 MessageFormat
        String pattern = "于 {0,date,long} 读取 {1,number,currency}";
        String msg = MessageFormat.format(pattern, new Date(), 1234.56);
        System.out.println("格式化消息: " + msg);

        // ChoiceFormat：复数处理
        System.out.println("\\n--- ChoiceFormat 复数 ---");
        MessageFormat plural = new MessageFormat(
            "{0,choice,0#无消息|1#一条消息|1<{0} 条消息}", enUS);
        for (int n : new int[]{0, 1, 5}) {
            System.out.println(n + " → " + plural.format(new Object[]{n}));
        }

        // ===== NumberFormat =====
        System.out.println("\\n--- NumberFormat ---");
        double num = 1234567.89;

        // 通用数字
        NumberFormat usNum = NumberFormat.getNumberInstance(enUS);
        NumberFormat cnNum = NumberFormat.getNumberInstance(zhCN);
        System.out.println("数字(美): " + usNum.format(num));
        System.out.println("数字(中): " + cnNum.format(num));

        // 货币
        NumberFormat usCur = NumberFormat.getCurrencyInstance(enUS);
        NumberFormat cnCur = NumberFormat.getCurrencyInstance(zhCN);
        NumberFormat jpCur = NumberFormat.getCurrencyInstance(japan);
        System.out.println("货币(美): " + usCur.format(num));
        System.out.println("货币(中): " + cnCur.format(num));
        System.out.println("货币(日): " + jpCur.format(num));

        // 百分比
        NumberFormat usPct = NumberFormat.getPercentInstance(enUS);
        System.out.println("百分比(美): " + usPct.format(0.875));

        // ===== DateFormat / DateTimeFormatter =====
        System.out.println("\\n--- 日期格式化 ---");
        Date now = new Date();
        DateFormat usLong = DateFormat.getDateInstance(DateFormat.LONG, enUS);
        DateFormat cnLong = DateFormat.getDateInstance(DateFormat.LONG, zhCN);
        DateFormat jpLong = DateFormat.getDateInstance(DateFormat.LONG, japan);
        System.out.println("日期(美): " + usLong.format(now));
        System.out.println("日期(中): " + cnLong.format(now));
        System.out.println("日期(日): " + jpLong.format(now));

        // java.time 版本
        LocalDate today = LocalDate.now();
        DateTimeFormatter usFmt = DateTimeFormatter
            .ofLocalizedDate(FormatStyle.LONG).withLocale(enUS);
        DateTimeFormatter cnFmt = DateTimeFormatter
            .ofLocalizedDate(FormatStyle.LONG).withLocale(zhCN);
        System.out.println("LocalDate(美): " + today.format(usFmt));
        System.out.println("LocalDate(中): " + today.format(cnFmt));

        // 自定义格式
        DateTimeFormatter custom = DateTimeFormatter.ofPattern("yyyy年MM月dd日 EEEE", zhCN);
        System.out.println("自定义(中): " + today.format(custom));

        // ===== Collator：本地化排序 =====
        System.out.println("\\n--- Collator 本地化排序 ---");
        String[] names = {"Zara", "张三", "李四", "Alice", "王五"};
        Collator collator = Collator.getInstance(zhCN);
        Arrays.sort(names, collator);
        System.out.println("中文排序: " + Arrays.toString(names));

        System.out.println("\\n最佳实践: 字符串全部提取到资源文件，使用 Locale 驱动格式化");
    }

    // 模拟不同语言的资源包
    static ResourceBundle getResourceBundle(Locale locale) {
        if (locale.getLanguage().equals("zh")) {
            return new ListResourceBundle() {
                protected Object[][] getContents() {
                    return new Object[][] {
                        {"greeting", "你好"},
                        {"farewell", "再见"}
                    };
                }
            };
        } else {
            return new ListResourceBundle() {
                protected Object[][] getContents() {
                    return new Object[][] {
                        {"greeting", "Hello"},
                        {"farewell", "Goodbye"}
                    };
                }
            };
        }
    }
}`
  },
  {
    id: "java-module-system",
    group: "高级主题",
    icon: "🧩",
    title: "模块系统",
    content: `# 模块系统（Java 9+）

Java 9 引入 **JPMS**（Java Platform Module System，Project Jigsaw），通过 \`module-info.java\` 显式声明模块依赖与导出，提升封装性与可维护性。

## module-info.java

模块描述文件，位于源码根目录：

\`\`\`java
module com.example.app {
    requires java.sql;
    requires transitive com.example.core;
    exports com.example.app.api;
    opens com.example.app.model to com.fasterxml.jackson.databind;
    uses com.example.app.spi.Service;
    provides com.example.app.spi.Service with com.example.app.impl.ServiceImpl;
}
\`\`\`

## 关键指令

### requires

声明依赖其他模块：

\`\`\`java
requires java.sql;
\`\`\`

### requires transitive

传递依赖——依赖本模块的模块**自动**获得该依赖：

\`\`\`java
requires transitive com.example.core;
\`\`\`

### exports

导出包，允许其他模块访问：

\`\`\`java
exports com.example.app.api;
\`\`\`

未导出的包对其他模块**完全不可见**（强封装）。

### opens

运行时反射访问（编译期仍不可见）。常用于框架（Spring、Jackson）：

\`\`\`java
opens com.example.app.model to com.fasterxml.jackson.databind;
\`\`\`

\`opens ... to\` 限定特定模块；\`opens\` 不带 to 对所有模块开放。

### uses / provides

服务机制（SPI）：
- \`uses\`：声明消费的服务接口
- \`provides X with Y\`：提供实现

\`ServiceLoader\` 自动发现模块路径上的实现。

## 模块化设计

### 优势

- **强封装**：仅导出包对外可见，内部实现隐藏
- **可靠配置**：启动时校验依赖完整性，避免 ClassNotFound
- **解耦**：明确依赖边界
- **更小的部署**：jlink 创建定制 JRE

### 命名约定

模块名采用**反向 DNS**：\`com.example.app\`，与包名一致便于管理。

## 模块类型

- **命名模块**：含 \`module-info.java\`，参与模块图
- **未命名模块**（unnamed）：无 module-info 的 jar，放入 classpath
- **自动模块**（automatic）：jar 放入 module path 但无 module-info，模块名取自 MANIFEST.MF

## vs classpath

| 特性 | classpath | module path |
|------|-----------|-------------|
| 可见性 | 全部公开 | 仅导出包 |
| 依赖 | 无显式声明 | requires 显式 |
| 启动校验 | 无 | 校验完整性 |
| 冲突 | jar hell | 模块不可重复 |

## 模块化命令

编译：

\`\`\`bash
javac -d out --module-source-path src $(find src -name "*.java")
\`\`\`

运行：

\`\`\`bash
java --module-path out -m com.example.app/com.example.app.Main
\`\`\`

打包：

\`\`\`bash
jar --create --file app.jar --main-class com.example.app.Main -C out .
\`\`\`

## jlink

创建包含模块的**定制 JRE**：

\`\`\`bash
jlink --module-path out --add-modules com.example.app --output myjre
\`\`\`

生成的 JRE 仅含所需模块，体积小，适合容器部署。

## 迁移策略

1. **不修改**：旧 jar 放 classpath，作为未命名模块运行
2. **自动模块**：jar 放 module path，无 module-info
3. **完全模块化**：添加 module-info

## 常见问题

- **IllegalAccessError**：未导出/opens 反射访问被拒
- **ModuleNotFoundException**：requires 的模块缺失
- **反射框架不兼容**：需 opens 对应包

下面通过代码演示模块系统概念（在单文件中说明）：`,
    code: `// 演示模块系统概念（单文件中说明，实际需多模块项目）
import java.lang.module.*;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== 当前模块信息 =====
        System.out.println("--- 当前模块系统 ---");
        Module module = Main.class.getModule();
        System.out.println("模块名: " + module.getName().orElse("(未命名模块)"));
        System.out.println("是否命名模块: " + module.isNamed());
        System.out.println("类加载器: " + Main.class.getClassLoader());

        // ===== module-info.java 示例说明 =====
        System.out.println("\\n--- module-info.java 示例 ---");
        System.out.println("/*");
        System.out.println("module com.example.app {");
        System.out.println("    requires java.sql;                       // 依赖 java.sql 模块");
        System.out.println("    requires transitive com.example.core;    // 传递依赖");
        System.out.println("    exports com.example.app.api;             // 导出 API 包");
        System.out.println("    opens com.example.app.model to          // 反射开放");
        System.out.println("        com.fasterxml.jackson.databind;");
        System.out.println("    uses com.example.app.spi.Service;       // 声明消费的服务");
        System.out.println("    provides com.example.app.spi.Service    // 提供服务实现");
        System.out.println("        with com.example.app.impl.ServiceImpl;");
        System.out.println("}");
        System.out.println("*/");

        // ===== 关键指令说明 =====
        System.out.println("\\n--- 关键指令 ---");
        System.out.println("requires M        依赖模块 M");
        System.out.println("requires transitive M  传递依赖，依赖方自动获得 M");
        System.out.println("exports P         导出包 P，对外可见");
        System.out.println("opens P to M      反射开放 P 给 M（编译期不可见）");
        System.out.println("uses S            声明消费服务 S");
        System.out.println("provides S with Impl  提供服务 S 的实现 Impl");

        // ===== 系统模块 =====
        System.out.println("\\n--- 系统模块 ---");
        ModuleLayer bootLayer = ModuleLayer.boot();
        Set<Module> systemModules = new TreeSet<>(Comparator.comparing(m -> m.getName().orElse("")));
        for (Module m : bootLayer.modules()) {
            systemModules.add(m);
        }
        System.out.println("引导层模块数: " + systemModules.size());
        System.out.println("部分系统模块:");
        systemModules.stream()
            .filter(m -> m.getName().isPresent())
            .map(Module::getName)
            .filter(n -> n.startsWith("java."))
            .limit(10)
            .forEach(n -> System.out.println("  " + n));

        // ===== 模块描述信息 =====
        System.out.println("\\n--- 模块描述示例 ---");
        Optional<Module> sqlModule = systemModules.stream()
            .filter(m -> m.getName().equals("java.sql"))
            .findFirst();
        if (sqlModule.isPresent()) {
            ModuleDescriptor desc = sqlModule.get().getDescriptor();
            System.out.println("模块: " + desc.name());
            System.out.println("版本: " + desc.version().orElse(null));
            System.out.println("requires: " + desc.requires());
            System.out.println("exports: " + desc.exports());
            System.out.println("uses: " + desc.uses());
        }

        // ===== ServiceLoader 演示（SPI）=====
        System.out.println("\\n--- ServiceLoader SPI 演示 ---");
        // 查找 CharsetProvider
        ServiceLoader<java.nio.charset.spi.CharsetProvider> loaders =
            ServiceLoader.load(java.nio.charset.spi.CharsetProvider.class);
        System.out.println("CharsetProvider 数量: " + loaders.stream().count());
        System.out.println("uses/provides 实现模块化服务的发现机制");

        // ===== classpath vs module path =====
        System.out.println("\\n--- classpath vs module path ---");
        System.out.println("classpath:");
        System.out.println("  - 所有类公开可见");
        System.out.println("  - 无依赖声明");
        System.out.println("  - jar hell 问题");
        System.out.println("module path:");
        System.out.println("  - 仅导出包可见");
        System.out.println("  - requires 显式声明");
        System.out.println("  - 启动时校验完整性");

        // ===== jlink 说明 =====
        System.out.println("\\n--- jlink 定制 JRE ---");
        System.out.println("jlink --module-path mods --add-modules com.example.app --output myjre");
        System.out.println("生成仅含所需模块的小型 JRE，适合容器部署");

        // ===== 反射访问检查 =====
        System.out.println("\\n--- 反射访问说明 ---");
        System.out.println("未命名模块可访问所有模块");
        System.out.println("命名模块反射访问其他模块需对方 exports 或 opens");
        System.out.println("框架（Spring/Jackson）依赖 opens 指令进行反射");

        System.out.println("\\n模块迁移策略:");
        System.out.println("1. classpath（未命名模块，最简单）");
        System.out.println("2. automatic module（jar 入 module path，无 module-info）");
        System.out.println("3. 完全模块化（添加 module-info.java）");
    }
}`
  },
  {
    id: "java-logging",
    group: "高级主题",
    icon: "📝",
    title: "日志",
    content: `# 日志

日志是排查问题、监控运行的核心手段。Java 自带 \`java.util.logging\`（JUL），生态中 Log4j、SLF4J/Logback 更常用。

## java.util.logging（JUL）

JDK 内置日志框架，无需额外依赖。

### Logger

获取日志器：

\`\`\`java
Logger logger = Logger.getLogger("com.example.Main");
\`\`\`

命名层级化，父级配置影响子级。

### 日志级别

\`Level\` 从高到低：

\`\`\`
SEVERE (1000) > WARNING (900) > INFO (800)
> CONFIG (700) > FINE (500) > FINER (400) > FINEST (300)
\`\`\`

低于设定级别的日志被丢弃。使用：

\`\`\`java
logger.severe("严重错误");
logger.warning("警告");
logger.info("信息");
logger.fine("调试");  // 需设置 level=FINE 才输出
\`\`\`

### Handler

日志输出目的地：
- \`ConsoleHandler\`：控制台（默认）
- \`FileHandler\`：文件
- \`StreamHandler\`：任意流
- \`SocketHandler\`：网络

\`\`\`java
Logger logger = Logger.getLogger("demo");
logger.addHandler(new FileHandler("app.log"));
logger.setUseParentHandlers(false); // 关闭父 handler
\`\`\`

### Formatter

格式化日志记录：
- \`SimpleFormatter\`：纯文本（默认）
- \`XMLFormatter\`：XML

自定义 Formatter：

\`\`\`java
class MyFormatter extends Formatter {
    public String format(LogRecord record) {
        return record.getLevel() + ": " + record.getMessage() + "\\n";
    }
}
\`\`\`

### Filter

按条件过滤日志记录，实现 \`Filter\` 接口。

## 配置文件

\`logging.properties\`：

\`\`\`properties
handlers=java.util.logging.ConsoleHandler
.level=INFO
java.util.logging.ConsoleHandler.level=INFO
java.util.logging.ConsoleHandler.formatter=java.util.logging.SimpleFormatter
java.util.logging.SimpleFormatter.format=%1$tY-%1$tm-%1$td %1$tH:%1$tM:%1$tS %4$s %2$s %5$s%6$s%n
\`\`\`

启动加载：\`java -Djava.util.logging.config.file=logging.properties\`

## 参数化日志

避免不必要的字符串拼接：

\`\`\`java
// 字符串拼接（即使不输出也拼接）
logger.info("用户 " + name + " 登录");

// 参数化（仅需要输出时才格式化）
logger.log(Level.INFO, "用户 {0} 登录", name);
\`\`\`

## 异常日志

\`\`\`java
try {
    // ...
} catch (IOException e) {
    logger.log(Level.SEVERE, "读取失败", e); // 第二参数为异常
}
\`\`\`

## vs Log4j / SLF4J

| 特性 | JUL | Log4j 1/2 | SLF4J + Logback |
|------|-----|-----------|------------------|
| 依赖 | 无（JDK 内置） | 需引入 | 需引入 |
| 性能 | 中 | 高 | 高 |
| 配置 | properties | xml/properties | xml/groovy |
| 占位符 | {0} | {} | {} |
| 异步 | 弱 | 强 | 强 |
| 生态 | 弱 | 强 | 强 |

**生产推荐**：SLF4J 作门面 + Logback/Log4j2 实现。

## SLF4J 示例

\`\`\`java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

Logger logger = LoggerFactory.getLogger(Main.class);
logger.info("用户 {} 登录", name);
\`\`\`

SLF4J 是**门面**，绑定不同实现（Logback、Log4j2、JUL）。

## 日志最佳实践

1. **使用参数化日志**：\`logger.info("x={}", x)\` 而非拼接
2. **不要打印敏感信息**：密码、token、身份证等
3. **合理分级**：ERROR（异常）/ WARN（告警）/ INFO（关键流程）/ DEBUG（调试）
4. **不要在循环中打大量日志**：影响性能
5. **异常必须带堆栈**：\`logger.error("失败", e)\`
6. **避免 System.out**：用日志框架
7. **结构化日志**：JSON 格式便于采集分析

## MDC

SLF4J MDC（Mapped Diagnostic Context）支持线程上下文日志：

\`\`\`java
MDC.put("userId", "123");
logger.info("操作"); // 输出含 userId
MDC.remove("userId");
\`\`\`

下面通过代码演示 JUL 日志：`,
    code: `// 演示 java.util.logging（JUL）
import java.util.logging.*;
import java.io.*;

public class Main {
    private static final Logger logger = Logger.getLogger(Main.class.getName());

    public static void main(String[] args) throws IOException {
        // ===== 默认日志输出 =====
        System.out.println("--- 默认日志 ---");
        logger.severe("严重错误信息");
        logger.warning("警告信息");
        logger.info("普通信息");
        // 以下默认不输出（默认级别 INFO）
        logger.config("配置信息");
        logger.fine("调试信息");
        logger.finer("更细调试");
        logger.finest("最细调试");

        // ===== 修改日志级别 =====
        System.out.println("\\n--- 调整级别为 FINE ---");
        logger.setLevel(Level.FINE);
        Logger root = Logger.getLogger("");
        for (Handler h : root.getHandlers()) {
            h.setLevel(Level.FINE);
        }
        logger.fine("现在 FINE 也会输出了");

        // ===== 参数化日志 =====
        System.out.println("\\n--- 参数化日志 ---");
        String user = "张三";
        int count = 5;
        logger.log(Level.INFO, "用户 {0} 有 {1} 条消息", new Object[]{user, count});

        // ===== 异常日志 =====
        System.out.println("\\n--- 异常日志 ---");
        try {
            int x = 10 / 0;
        } catch (ArithmeticException e) {
            logger.log(Level.SEVERE, "计算失败: 除零错误", e);
        }

        // ===== 自定义 Handler：输出到文件 =====
        System.out.println("\\n--- FileHandler ---");
        FileHandler fileHandler = new FileHandler("app.log", true);
        fileHandler.setFormatter(new SimpleFormatter());
        logger.addHandler(fileHandler);
        logger.info("这条日志会同时输出到控制台和文件");
        fileHandler.close();

        // ===== 自定义 Formatter =====
        System.out.println("\\n--- 自定义 Formatter ---");
        ConsoleHandler customHandler = new ConsoleHandler();
        customHandler.setFormatter(new Formatter() {
            @Override
            public String format(LogRecord record) {
                return String.format("[%s] [%s] %s - %s%n",
                    record.getInstant(),
                    record.getLevel(),
                    record.getSourceClassName(),
                    record.getMessage());
            }
        });
        customHandler.setLevel(Level.ALL);
        Logger customLogger = Logger.getLogger("custom");
        customLogger.setUseParentHandlers(false); // 不使用父 handler
        customLogger.addHandler(customHandler);
        customLogger.setLevel(Level.ALL);
        customLogger.info("使用自定义 Formatter 输出");

        // ===== Logger 层级 =====
        System.out.println("\\n--- Logger 层级 ---");
        Logger parent = Logger.getLogger("com.example");
        Logger child = Logger.getLogger("com.example.service");
        parent.info("父级日志");
        child.info("子级日志（继承父级配置）");

        // ===== Filter 自定义过滤 =====
        System.out.println("\\n--- Filter 过滤 ---");
        Logger filterLogger = Logger.getLogger("filtered");
        filterLogger.setFilter(record -> {
            // 只输出包含 "重要" 的消息
            return record.getMessage() != null && record.getMessage().contains("重要");
        });
        filterLogger.setUseParentHandlers(false);
        ConsoleHandler fh = new ConsoleHandler();
        fh.setLevel(Level.ALL);
        filterLogger.addHandler(fh);
        filterLogger.info("这是一般消息");      // 被过滤
        filterLogger.info("这是重要消息");      // 通过

        // ===== 日志级别说明 =====
        System.out.println("\\n--- 日志级别 ---");
        System.out.println("SEVERE  (1000): 严重错误，影响业务");
        System.out.println("WARNING (900):  警告，可继续运行");
        System.out.println("INFO    (800):  关键业务信息");
        System.out.println("CONFIG  (700):  配置信息");
        System.out.println("FINE    (500):  调试信息");
        System.out.println("FINER   (400):  详细调试");
        System.out.println("FINEST  (300):  最详细调试");

        // ===== 最佳实践说明 =====
        System.out.println("\\n--- 最佳实践 ---");
        System.out.println("1. 使用参数化日志避免不必要拼接");
        System.out.println("2. 不要打印密码、token 等敏感信息");
        System.out.println("3. 异常日志必须带堆栈");
        System.out.println("4. 合理分级，避免日志爆炸");
        System.out.println("5. 生产环境推荐 SLF4J + Logback/Log4j2");
    }
}`
  },
  {
    id: "java-misc-utils",
    group: "高级主题",
    icon: "🧰",
    title: "工具类杂项",
    content: `# 工具类杂项

Java 标准库提供众多实用工具类，本节速览最常用者。

## Objects

\`java.util.Objects\` 提供空安全工具：

\`\`\`java
Objects.requireNonNull(obj, "obj 不能为 null");  // 为 null 抛 NPE
Objects.equals(a, b);      // 空安全 equals
Objects.hash(a, b, c);     // 多字段 hashCode
Objects.toString(obj, "默认值"); // 空安全 toString
\`\`\`

## UUID

生成唯一标识：

\`\`\`java
UUID uuid = UUID.randomUUID();          // 随机 UUID
UUID fromStr = UUID.fromString("...");  // 从字符串解析
\`\`\`

128 位，版本 4 随机。适合去重 ID、会话 ID。注意：随机 UUID **不保证全局有序**。

## Random / ThreadLocalRandom

\`\`\`java
Random r = new Random();
r.nextInt(100);    // [0, 100)
r.nextDouble();
r.nextBoolean();
\`\`\`

\`ThreadLocalRandom\` 多线程下更高效：

\`\`\`java
ThreadLocalRandom.current().nextInt(0, 100);
\`\`\`

\`SecureRandom\` 用于安全场景（密码、token）。

## Timer / ScheduledExecutorService

定时任务：

\`\`\`java
Timer timer = new Timer();
timer.schedule(task, delay);            // 延迟执行
timer.scheduleAtFixedRate(task, d, p);  // 固定频率
\`\`\`

推荐 \`ScheduledExecutorService\`（更灵活、异常处理更好）：

\`\`\`java
ScheduledExecutorService ses = Executors.newScheduledThreadPool(2);
ses.scheduleAtFixedRate(task, 0, 1, TimeUnit.SECONDS);
\`\`\`

## Formatter

\`String.format\` / \`Formatter\` 提供类似 C 的格式化：

\`\`\`java
String s = String.format("姓名: %s, 年龄: %d, 体重: %.2f", "Tom", 18, 65.5);
\`\`\`

常用转换符：
- \`%s\` 字符串
- \`%d\` 整数
- \`%f\` 浮点
- \`%x\` 十六进制
- \`%n\` 换行
- \`%-10s\` 左对齐宽度 10
- \`%08d\` 补零宽度 8

## Base64

\`java.util.Base64\`（Java 8+）：

\`\`\`java
String encoded = Base64.getEncoder().encodeToString("hello".getBytes());
byte[] decoded = Base64.getDecoder().decode(encoded);

// URL 安全（替换 +/）
Base64.getUrlEncoder().encodeToString(data);
// MIME（每 76 字符换行）
Base64.getMimeEncoder().encodeToString(data);
\`\`\`

## Arrays

\`\`\`java
Arrays.sort(arr);
Arrays.binarySearch(arr, key);
Arrays.copyOf(arr, n);
Arrays.fill(arr, val);
Arrays.equals(a, b);
Arrays.asList(1, 2, 3);   // 固定大小 List
Arrays.toString(arr);
\`\`\`

\`Arrays.stream(arr)\` 转流。

## Collections

\`\`\`java
Collections.sort(list);
Collections.reverse(list);
Collections.shuffle(list);
Collections.max(list);
Collections.frequency(list, obj);
Collections.emptyList();
Collections.synchronizedList(list);  // 同步包装
Collections.unmodifiableList(list);  // 不可变
\`\`\`

## StringJoiner

\`\`\`java
StringJoiner sj = new StringJoiner(", ", "[", "]");
sj.add("a").add("b").add("c");
// [a, b, c]
\`\`\`

## StringTokenizer

按分隔符切分字符串（比 \`split\` 更高效，但功能弱）：

\`\`\`java
StringTokenizer st = new StringTokenizer("a,b,c", ",");
while (st.hasMoreTokens()) st.nextToken();
\`\`\`

## HexFormat（Java 17+）

十六进制与字节互转：

\`\`\`java
HexFormat hex = HexFormat.of();
String s = hex.formatHex(new byte[]{1, 2, 255}); // "0102ff"
byte[] b = hex.parseHex("0102ff");
\`\`\`

## Optional

\`Optional\` 包装可能为空的返回值，详见 Stream 章节。

## Comparator

\`\`\`java
Comparator<Person> byAge = Comparator.comparingInt(Person::getAge);
Comparator<Person> byName = Comparator.comparing(Person::getName);
Comparator<Person> combined = byAge.thenComparing(byName);
\`\`\`

下面通过代码演示各种工具类：`,
    code: `// 演示各种常用工具类
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.*;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

public class Main {
    public static void main(String[] args) {
        // ===== Objects =====
        System.out.println("--- Objects ---");
        System.out.println("equals(null, null): " + Objects.equals(null, null));
        System.out.println("equals(null, x): " + Objects.equals(null, "x"));
        System.out.println("toString(null, 默认): " + Objects.toString(null, "默认"));
        System.out.println("hashCode(1, 2, 3): " + Objects.hash(1, 2, 3));
        try {
            Objects.requireNonNull(null, "参数不能为 null");
        } catch (NullPointerException e) {
            System.out.println("requireNonNull 抛出: " + e.getMessage());
        }

        // ===== UUID =====
        System.out.println("\\n--- UUID ---");
        UUID uuid1 = UUID.randomUUID();
        UUID uuid2 = UUID.randomUUID();
        System.out.println("UUID1: " + uuid1);
        System.out.println("UUID2: " + uuid2);
        System.out.println("是否相等: " + uuid1.equals(uuid2));
        UUID parsed = UUID.fromString(uuid1.toString());
        System.out.println("解析后相等: " + uuid1.equals(parsed));
        System.out.println("版本: " + uuid1.version() + " (4=随机)");

        // ===== Random / ThreadLocalRandom / SecureRandom =====
        System.out.println("\\n--- Random ---");
        Random r = new Random();
        System.out.print("Random(100内): ");
        for (int i = 0; i < 5; i++) System.out.print(r.nextInt(100) + " ");
        System.out.println();

        System.out.print("ThreadLocalRandom: ");
        for (int i = 0; i < 5; i++) {
            System.out.print(ThreadLocalRandom.current().nextInt(0, 100) + " ");
        }
        System.out.println();

        SecureRandom sr = new SecureRandom();
        byte[] token = new byte[16];
        sr.nextBytes(token);
        System.out.println("SecureRandom token(前8字节): "
            + Arrays.toString(Arrays.copyOf(token, 8)));

        // 高斯分布
        System.out.println("高斯分布(均0): " + r.nextGaussian());

        // ===== Timer / ScheduledExecutorService =====
        System.out.println("\\n--- Timer / ScheduledExecutorService ---");
        // Timer 演示
        Timer timer = new Timer();
        timer.schedule(new TimerTask() {
            int count = 0;
            public void run() {
                System.out.println("  Timer 任务 #" + (++count));
                if (count >= 2) {
                    timer.cancel();
                }
            }
        }, 50, 50);

        // ScheduledExecutorService 演示
        ScheduledExecutorService ses = Executors.newScheduledThreadPool(1);
        ScheduledFuture<?> future = ses.scheduleAtFixedRate(() -> {
            System.out.println("  Scheduled 任务: " + System.currentTimeMillis() % 10000);
        }, 0, 50, TimeUnit.MILLISECONDS);

        try { Thread.sleep(180); } catch (InterruptedException e) {}
        future.cancel(false);
        ses.shutdown();
        try { Thread.sleep(50); } catch (InterruptedException e) {}

        // ===== Formatter / String.format =====
        System.out.println("\\n--- Formatter ---");
        String s1 = String.format("姓名: %s, 年龄: %d", "Tom", 18);
        String s2 = String.format("体重: %.2f, 进度: %d%%", 65.5, 80);
        String s3 = String.format("|%-10s|%10s|", "左对齐", "右对齐");
        String s4 = String.format("补零: %08d", 42);
        String s5 = String.format("十六进制: %x / %#x", 255, 255);
        System.out.println(s1);
        System.out.println(s2);
        System.out.println(s3);
        System.out.println(s4);
        System.out.println(s5);

        // ===== Base64 =====
        System.out.println("\\n--- Base64 ---");
        String text = "Hello, 世界!";
        byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
        String encoded = Base64.getEncoder().encodeToString(bytes);
        System.out.println("原文: " + text);
        System.out.println("Base64: " + encoded);
        byte[] decoded = Base64.getDecoder().decode(encoded);
        System.out.println("解码: " + new String(decoded, StandardCharsets.UTF_8));

        // URL 安全变体
        String urlEnc = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        System.out.println("URL 安全: " + urlEnc);

        // ===== Arrays =====
        System.out.println("\\n--- Arrays ---");
        int[] arr = {5, 2, 8, 1, 9};
        Arrays.sort(arr);
        System.out.println("排序: " + Arrays.toString(arr));
        System.out.println("二分查找 8: 索引 " + Arrays.binarySearch(arr, 8));
        int[] copy = Arrays.copyOf(arr, 3);
        System.out.println("前 3 个: " + Arrays.toString(copy));
        int[] filled = new int[5];
        Arrays.fill(filled, 7);
        System.out.println("填充: " + Arrays.toString(filled));

        // ===== Collections =====
        System.out.println("\\n--- Collections ---");
        List<Integer> list = new ArrayList<>(Arrays.asList(3, 1, 4, 1, 5, 9, 2, 6));
        Collections.sort(list);
        System.out.println("排序: " + list);
        Collections.reverse(list);
        System.out.println("反转: " + list);
        Collections.shuffle(list);
        System.out.println("打乱: " + list);
        System.out.println("最大: " + Collections.max(list));
        System.out.println("1 出现次数: " + Collections.frequency(list, 1));

        List<Integer> unmod = Collections.unmodifiableList(new ArrayList<>(list));
        System.out.println("不可变 List: " + unmod);

        // ===== StringJoiner =====
        System.out.println("\\n--- StringJoiner ---");
        StringJoiner sj = new StringJoiner(", ", "[", "]");
        sj.add("Java").add("Python").add("Go");
        System.out.println("拼接: " + sj);
        String joined = list.stream().map(String::valueOf).collect(Collectors.joining("-"));
        System.out.println("Stream joining: " + joined);

        // ===== StringTokenizer =====
        System.out.println("\\n--- StringTokenizer ---");
        String csv = "张三,李四,王五";
        StringTokenizer st = new StringTokenizer(csv, ",");
        while (st.hasMoreTokens()) {
            System.out.println("  " + st.nextToken());
        }

        // ===== Comparator =====
        System.out.println("\\n--- Comparator ---");
        List<Person> people = Arrays.asList(
            new Person("Tom", 25), new Person("Jerry", 30), new Person("Alice", 25));
        // 按年龄再按姓名
        people.stream().sorted(Comparator
            .comparingInt(Person::getAge)
            .thenComparing(Person::getName))
            .forEach(System.out::println);

        // 自然序反转
        List<Integer> nums = new ArrayList<>(Arrays.asList(3, 1, 4, 1, 5));
        nums.sort(Comparator.reverseOrder());
        System.out.println("降序: " + nums);

        // ===== HexFormat (Java 17+) =====
        System.out.println("\\n--- HexFormat ---");
        try {
            java.util.HexFormat hex = java.util.HexFormat.of();
            String hexStr = hex.formatHex(new byte[]{1, 2, 15, (byte) 255});
            System.out.println("字节转十六进制: " + hexStr);
            byte[] parsed = hex.parseHex(hexStr);
            System.out.println("十六进制转字节: " + Arrays.toString(parsed));
            // 带分隔符
            java.util.HexFormat hexDelim = java.util.HexFormat.ofDelimiter("-");
            System.out.println("带分隔: " + hexDelim.formatHex(new byte[]{1, 2, 3}));
        } catch (NoClassDefFoundError e) {
            System.out.println("HexFormat 需要 Java 17+");
        }

        System.out.println("\\n更多工具: Optional / Stream / Collectors 参见相关章节");
    }

    static class Person {
        String name; int age;
        Person(String name, int age) { this.name = name; this.age = age; }
        String getName() { return name; }
        int getAge() { return age; }
        public String toString() { return name + "(" + age + ")"; }
    }
}`
  }
];
