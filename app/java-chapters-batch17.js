// =============================================================
// Java 交互式教程 —— 第十七批章节（多线程与并发组，共 15 章）
// =============================================================

export const chapters = [
  {
    id: "java-thread-basics",
    group: "多线程与并发",
    icon: "🧵",
    title: "线程基础",
    content: `# 线程基础

线程（Thread）是程序执行的最小单元。一个进程可包含多个线程，它们共享进程的内存空间，能并发执行不同任务。Java 从诞生起就内置了对多线程的支持。

## 创建线程的两种方式

### 方式一：继承 \`Thread\` 类

\`\`\`java
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("线程执行中: " + Thread.currentThread().getName());
    }
}
MyThread t = new MyThread();
t.start(); // 启动线程
\`\`\`

### 方式二：实现 \`Runnable\` 接口

\`\`\`java
class MyTask implements Runnable {
    @Override
    public void run() {
        System.out.println("任务执行中");
    }
}
Thread t = new Thread(new MyTask());
t.start();
\`\`\`

推荐使用 \`Runnable\`：Java 单继承，继承 Thread 后无法再继承其他类；Runnable 是接口，更灵活，且可与线程池配合。

## start() vs run()

- \`start()\`：**启动新线程**，由 JVM 调度，自动调用 run()
- \`run()\`：**普通方法调用**，在当前线程同步执行，不会创建新线程

这是新手最常犯的错误：直接调用 run() 实际是单线程执行。

## 线程命名

每个线程都有名字，便于调试。可通过构造器或 \`setName()\` 设置：

\`\`\`java
Thread t = new Thread(runnable, "worker-1");
\`\`\`

## 获取当前线程

\`\`\`java
Thread current = Thread.currentThread();
\`\`\`

## 线程优先级

\`setPriority(int)\` 范围 1-10，默认 5。优先级只是**建议**，操作系统可忽略，不能依赖优先级做正确性保证。

## 主线程

Java 程序启动时，JVM 会创建一个名为 \`main\` 的主线程执行 \`main()\` 方法。所有用户线程结束后，JVM 才退出（守护线程除外）。

## Thread 常用方法

| 方法 | 说明 |
|------|------|
| start() | 启动线程 |
| run() | 线程执行体 |
| sleep(ms) | 当前线程休眠 |
| join() | 等待线程结束 |
| getName()/setName() | 获取/设置名称 |
| currentThread() | 获取当前线程 |
| isAlive() | 线程是否存活 |

下面通过代码演示线程的创建、启动与基本操作：`,
    code: `// 演示线程的创建与启动
public class Main {
    public static void main(String[] args) throws InterruptedException {
        // ===== 方式一：继承 Thread =====
        class MyThread extends Thread {
            MyThread(String name) { super(name); }
            @Override
            public void run() {
                for (int i = 0; i < 3; i++) {
                    System.out.println(getName() + " 执行第 " + i + " 次");
                    try { Thread.sleep(5); } catch (InterruptedException e) { break; }
                }
            }
        }

        // ===== 方式二：实现 Runnable =====
        Runnable task = () -> {
            String name = Thread.currentThread().getName();
            for (int i = 0; i < 3; i++) {
                System.out.println(name + " 执行任务 " + i);
                try { Thread.sleep(5); } catch (InterruptedException e) { break; }
            }
        };

        // 启动线程
        MyThread t1 = new MyThread("线程A");
        Thread t2 = new Thread(task, "线程B");

        System.out.println("主线程: " + Thread.currentThread().getName());
        System.out.println("t1 启动前状态: " + t1.getState());

        t1.start();
        t2.start();

        System.out.println("t1 启动后状态: " + t1.getState());

        // 等待两个线程结束（join 保证输出顺序）
        t1.join();
        t2.join();
        System.out.println("t1 结束后状态: " + t1.getState());

        // ===== start vs run 演示 =====
        Thread directRun = new Thread(() -> {
            System.out.println("调用 run() 的线程: " + Thread.currentThread().getName());
        });
        directRun.run(); // 直接调用 run，在 main 线程执行
        directRun.start(); // 调用 start，在新线程执行
        directRun.join();

        // ===== 线程优先级 =====
        Thread high = new Thread(() -> System.out.println("高优先级线程"), "high");
        Thread low = new Thread(() -> System.out.println("低优先级线程"), "low");
        high.setPriority(Thread.MAX_PRIORITY); // 10
        low.setPriority(Thread.MIN_PRIORITY);  // 1
        high.start();
        low.start();
        high.join();
        low.join();

        // ===== 判断线程存活 =====
        System.out.println("t1 是否存活: " + t1.isAlive());
        System.out.println("主线程结束");
    }
}`
  },
  {
    id: "java-runnable-callable",
    group: "多线程与并发",
    icon: "📋",
    title: "Runnable 与 Callable",
    content: `# Runnable 与 Callable

\`Runnable\` 和 \`Callable\` 都是 Java 中表示"任务"的接口，但它们在返回值和异常处理上有重要区别。

## Runnable

\`\`\`java
@FunctionalInterface
public interface Runnable {
    void run(); // 无返回值，不能抛出受检异常
}
\`\`\`

- 无返回值
- 不能抛出受检异常（只能在 run 内部 try-catch）
- 从 JDK 1.0 就存在
- 可被 Thread、线程池执行

## Callable

\`\`\`java
@FunctionalInterface
public interface Callable<V> {
    V call() throws Exception; // 有返回值，可抛出异常
}
\`\`\`

- 有返回值（泛型 V）
- 可抛出受检异常
- JDK 5 引入，位于 \`java.util.concurrent\` 包
- 只能通过线程池或 FutureTask 执行

## Future 接口

\`Future\` 表示异步计算的结果：

\`\`\`java
boolean cancel(boolean mayInterrupt);
boolean isCancelled();
boolean isDone();
V get() throws InterruptedException, ExecutionException; // 阻塞获取结果
V get(long timeout, TimeUnit unit); // 带超时的获取
\`\`\`

\`get()\` 会阻塞调用线程，直到任务完成。任务抛出的异常会被包装为 \`ExecutionException\`。

## FutureTask

\`FutureTask\` 是 Future 的实现类，同时实现了 Runnable，因此可被 Thread 直接执行：

\`\`\`java
FutureTask<Integer> ft = new FutureTask<>(callable);
new Thread(ft).start();
Integer result = ft.get(); // 阻塞获取
\`\`\`

## 对比

| 特性 | Runnable | Callable |
|------|----------|----------|
| 返回值 | 无 | 有（泛型） |
| 异常 | 不能抛受检异常 | 可抛 Exception |
| 执行方式 | Thread/线程池 | 线程池/FutureTask |
| 引入版本 | JDK 1.0 | JDK 5 |

## Runnable 转 Callable

\`Executors.callable(Runnable)\` 可把 Runnable 转为 Callable（返回 null），\`Executors.callable(Runnable, result)\` 可指定固定返回值。

## 使用场景

- 仅执行副作用（如打印、写文件）→ Runnable
- 需要计算结果（如查询、计算）→ Callable
- 与线程池配合 → 两者均可，submit() 自动包装

下面通过代码演示 Runnable 与 Callable 的区别及 Future 的使用：`,
    code: `// 演示 Runnable 与 Callable 的区别
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== Runnable：无返回值 =====
        Runnable runnable = () -> {
            System.out.println("Runnable 在 " + Thread.currentThread().getName() + " 执行");
            try { Thread.sleep(10); } catch (InterruptedException e) { return; }
        };
        Thread t = new Thread(runnable, "runnable-thread");
        t.start();
        t.join();
        System.out.println("Runnable 无返回值\\n");

        // ===== Callable：有返回值 =====
        Callable<Long> callable = () -> {
            System.out.println("Callable 在 " + Thread.currentThread().getName() + " 执行");
            Thread.sleep(10);
            return System.currentTimeMillis();
        };

        // ===== FutureTask：可被 Thread 直接执行 =====
        FutureTask<Long> futureTask = new FutureTask<>(callable);
        Thread ftThread = new Thread(futureTask, "future-task-thread");
        ftThread.start();

        System.out.println("任务是否完成: " + futureTask.isDone());
        Long result = futureTask.get(); // 阻塞获取结果
        System.out.println("任务是否完成: " + futureTask.isDone());
        System.out.println("Callable 返回时间戳: " + result + "\\n");

        // ===== 线程池 submit Callable =====
        ExecutorService pool = Executors.newFixedThreadPool(2);

        Future<Long> f1 = pool.submit(() -> {
            Thread.sleep(20);
            return 100L;
        });
        Future<String> f2 = pool.submit(() -> {
            Thread.sleep(10);
            return "hello";
        });

        // 带超时的 get
        Long r1 = f1.get(1, TimeUnit.SECONDS);
        String r2 = f2.get(1, TimeUnit.SECONDS);
        System.out.println("f1 结果: " + r1);
        System.out.println("f2 结果: " + r2);

        // ===== Callable 抛异常，Future.get 包装为 ExecutionException =====
        Future<Integer> errFuture = pool.submit(() -> {
            Thread.sleep(10);
            throw new RuntimeException("计算失败");
        });
        try {
            errFuture.get();
        } catch (ExecutionException ex) {
            System.out.println("捕获异常: " + ex.getCause().getMessage());
        }

        // ===== 多个 Callable 并发，汇总结果 =====
        AtomicLong total = new AtomicLong(0);
        java.util.List<Callable<Integer>> tasks = new java.util.ArrayList<>();
        for (int i = 1; i <= 3; i++) {
            final int x = i;
            tasks.add(() -> { Thread.sleep(10); return x * 10; });
        }
        java.util.List<Future<Integer>> futures = new java.util.ArrayList<>();
        for (Callable<Integer> c : tasks) futures.add(pool.submit(c));
        for (Future<Integer> f : futures) total.addAndGet(f.get());
        System.out.println("三个任务总和: " + total.get());

        pool.shutdown();
        pool.awaitTermination(1, TimeUnit.SECONDS);
        System.out.println("线程池已关闭");
    }
}`
  },
  {
    id: "java-thread-lifecycle",
    group: "多线程与并发",
    icon: "🔄",
    title: "线程生命周期",
    content: `# 线程生命周期

Java 线程从创建到销毁，会经历多个状态。理解生命周期是掌握多线程的基础。

## 六种状态

\`Thread.State\` 枚举定义了 6 种状态：

\`\`\`java
public enum State {
    NEW,           // 新建
    RUNNABLE,      // 可运行
    BLOCKED,       // 阻塞
    WAITING,       // 无限等待
    TIMED_WAITING, // 计时等待
    TERMINATED     // 终止
}
\`\`\`

通过 \`thread.getState()\` 可获取当前状态。

## 状态转换

\`\`\`
NEW --start()--> RUNNABLE
RUNNABLE --等待锁--> BLOCKED --获得锁--> RUNNABLE
RUNNABLE --wait()/join()--> WAITING --notify()/notifyAll()--> RUNNABLE
RUNNABLE --sleep(t)/wait(t)/join(t)--> TIMED_WAITING --超时/notify--> RUNNABLE
RUNNABLE --run() 结束--> TERMINATED
\`\`\`

## 各状态详解

### NEW
线程对象已创建但未调用 start()。此时线程尚未分配 OS 线程。

### RUNNABLE
调用 start() 后进入。注意：RUNNABLE 包含"就绪"和"运行中"两种，由 OS 调度。Java 不区分这两种，统一为 RUNNABLE。线程在 I/O 阻塞（如 Socket 读）时也可能是 RUNNABLE（JVM 不感知 OS 层阻塞）。

### BLOCKED
等待获取 \`synchronized\` 监视器锁。一旦获取到锁，回到 RUNNABLE。注意：等待 \`Lock\`（如 ReentrantLock）是 WAITING 而非 BLOCKED。

### WAITING
调用以下方法进入无限等待，需被其他线程显式唤醒：

- \`Object.wait()\`（无参数）
- \`Thread.join()\`（无参数）
- \`LockSupport.park()\`

### TIMED_WAITING
带超时的等待，超时后自动唤醒：

- \`Thread.sleep(ms)\`
- \`Object.wait(ms)\`
- \`Thread.join(ms)\`
- \`LockSupport.parkNanos(ns)\`

### TERMINATED
run() 方法执行完毕（正常返回或抛出异常）。终止后不能再 start()，否则抛 \`IllegalThreadStateException\`。

## 关键区别

- **BLOCKED vs WAITING**：BLOCKED 是被动的（等锁），WAITING 是主动的（主动调用 wait/join/park）
- **WAITING vs TIMED_WAITING**：是否有超时

## 状态查看注意

线程状态是瞬时快照，调试时多次调用 getState 可能得到不同结果。生产环境监控应使用 \`jstack\`、\`ThreadMXBean\` 等工具。

下面通过代码演示各种线程状态的触发与转换：`,
    code: `// 演示线程的各种状态
import java.util.concurrent.atomic.AtomicBoolean;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        // ===== NEW：创建但未启动 =====
        Thread t = new Thread(() -> {
            try { Thread.sleep(20); } catch (InterruptedException e) { }
        }, "demo-thread");
        System.out.println("NEW 状态: " + t.getState());

        // ===== RUNNABLE：启动后 =====
        t.start();
        Thread.sleep(5); // 等待启动
        System.out.println("RUNNABLE 状态: " + t.getState());

        // ===== TIMED_WAITING：sleep =====
        Thread sleeper = new Thread(() -> {
            try { Thread.sleep(500); } catch (InterruptedException e) { }
        }, "sleeper");
        sleeper.start();
        Thread.sleep(20);
        System.out.println("sleep 中 TIMED_WAITING: " + sleeper.getState());
        sleeper.interrupt(); // 提前唤醒
        sleeper.join();

        // ===== WAITING：join 等待 =====
        Thread longTask = new Thread(() -> {
            try { Thread.sleep(100); } catch (InterruptedException e) { }
        }, "long-task");
        Thread waiter = new Thread(() -> {
            try { longTask.join(); } catch (InterruptedException e) { }
        }, "waiter");
        longTask.start();
        waiter.start();
        Thread.sleep(20);
        System.out.println("join 中 WAITING: " + waiter.getState());
        longTask.join();
        waiter.join();

        // ===== BLOCKED：等待 synchronized 锁 =====
        final Object lock = new Object();
        AtomicBoolean holdFlag = new AtomicBoolean(true);

        Thread holder = new Thread(() -> {
            synchronized (lock) {
                while (holdFlag.get()) {
                    try { Thread.sleep(50); } catch (InterruptedException e) { return; }
                }
            }
        }, "holder");

        Thread blocker = new Thread(() -> {
            synchronized (lock) {
                System.out.println("blocker 获得锁");
            }
        }, "blocker");

        holder.start();
        Thread.sleep(10); // 确保 holder 先拿到锁
        blocker.start();
        Thread.sleep(10);
        System.out.println("等锁 BLOCKED: " + blocker.getState());
        holdFlag.set(false); // 释放锁
        holder.join();
        blocker.join();

        // ===== WAITING：Object.wait =====
        Thread waiter2 = new Thread(() -> {
            synchronized (lock) {
                try { lock.wait(); } catch (InterruptedException e) { }
            }
        }, "waiter2");
        waiter2.start();
        Thread.sleep(20);
        System.out.println("wait() 中 WAITING: " + waiter2.getState());
        synchronized (lock) { lock.notify(); }
        waiter2.join();

        // ===== TERMINATED：执行完毕 =====
        Thread done = new Thread(() -> { }, "done");
        done.start();
        done.join();
        System.out.println("TERMINATED 状态: " + done.getState());

        System.out.println("主线程结束");
    }
}`
  },
  {
    id: "java-thread-interrupt",
    group: "多线程与并发",
    icon: "🛑",
    title: "线程中断",
    content: `# 线程中断

Java 没有强制停止线程的安全 API（已废弃的 \`stop()\` 会导致数据不一致）。中断（Interruption）是 Java 提供的**协作式**停止机制：一个线程向另一个线程发出"请停止"的信号，目标线程自行决定如何响应。

## 中断三方法

| 方法 | 说明 |
|------|------|
| \`thread.interrupt()\` | 设置中断标志为 true |
| \`thread.isInterrupted()\` | 查询中断标志，**不清除** |
| \`Thread.interrupted()\` | 静态方法，查询**当前线程**中断标志，并**清除** |

## 中断标志

每个线程内部有一个 boolean 中断标志。\`interrupt()\` 将其设为 true，线程可通过 \`isInterrupted()\` 检查并决定是否退出。

## 中断响应

### 1. 检查标志主动退出

\`\`\`java
while (!Thread.currentThread().isInterrupted()) {
    // 执行任务
}
\`\`\`

### 2. sleep/wait/join 抛 InterruptedException

当线程在 \`sleep\`、\`wait\`、\`join\` 等阻塞时被中断，JVM 会**清除中断标志**并抛出 \`InterruptedException\`：

\`\`\`java
try {
    Thread.sleep(1000);
} catch (InterruptedException e) {
    // 中断标志已被清除！
    // 若想向上传播中断，需重新设置：
    Thread.currentThread().interrupt();
}
\`\`\`

## 正确处理 InterruptedException

两种推荐做法：

1. **重新抛出**：方法签名声明 \`throws InterruptedException\`，让上层处理
2. **恢复中断**：catch 后调用 \`Thread.currentThread().interrupt()\`，保留中断状态

**错误做法**：catch 后什么都不做（"吞掉中断"），这会导致上层无法感知中断。

## 停止线程的正确方式

\`\`\`java
Thread t = new Thread(() -> {
    while (!Thread.currentThread().isInterrupted()) {
        try {
            Thread.sleep(50);
            // 工作...
        } catch (InterruptedException e) {
            break; // 或 interrupt() 后 break
        }
    }
});
t.start();
t.interrupt(); // 请求停止
\`\`\`

## 为什么不能用 stop()

\`Thread.stop()\` 会立即释放所有锁并终止线程，可能导致受锁保护的数据处于不一致状态。同样 \`suspend()\`（暂停但不清锁）和 \`resume()\` 也已废弃。

## 中断与 I/O

- 阻塞在 \`InputStream.read()\` 等 native I/O 上的线程，中断不一定能唤醒
- \`InterruptibleChannel\`（NIO）支持中断，会抛 \`ClosedByInterruptException\`
- \`Selector.select()\` 可被中断唤醒

下面通过代码演示中断机制与正确的停止方式：`,
    code: `// 演示线程中断机制
import java.util.concurrent.atomic.AtomicBoolean;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        // ===== 1. 主动检查中断标志退出 =====
        Thread worker1 = new Thread(() -> {
            long count = 0;
            while (!Thread.currentThread().isInterrupted()) {
                count++;
                if (count % 1_000_000 == 0) Thread.yield();
            }
            System.out.println("worker1 收到中断，退出。count=" + count);
        }, "worker1");
        worker1.start();
        Thread.sleep(20);
        worker1.interrupt(); // 发出中断信号
        worker1.join();

        // ===== 2. sleep 中被中断，抛 InterruptedException =====
        Thread sleeper = new Thread(() -> {
            try {
                System.out.println("sleeper 开始睡眠");
                Thread.sleep(1000);
                System.out.println("sleeper 正常醒来"); // 不会执行
            } catch (InterruptedException e) {
                System.out.println("sleeper 被中断，中断标志=" + Thread.currentThread().isInterrupted());
                // sleep 抛异常时已清除标志，所以这里是 false
            }
        }, "sleeper");
        sleeper.start();
        Thread.sleep(20);
        sleeper.interrupt();
        sleeper.join();

        // ===== 3. 正确恢复中断状态 =====
        Thread restorer = new Thread(() -> {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                System.out.println("restorer 捕获异常，恢复中断标志");
                Thread.currentThread().interrupt(); // 恢复中断状态
            }
            System.out.println("restorer 中断标志=" + Thread.currentThread().isInterrupted());
        }, "restorer");
        restorer.start();
        Thread.sleep(20);
        restorer.interrupt();
        restorer.join();

        // ===== 4. 封装可中断任务 =====
        Runnable interruptibleTask = () -> {
            try {
                for (int i = 0; i < 5; i++) {
                    System.out.println("任务步骤 " + i);
                    Thread.sleep(20);
                }
            } catch (InterruptedException e) {
                System.out.println("任务被中断，步骤未完成，清理资源");
                Thread.currentThread().interrupt();
            }
        };
        Thread taskThread = new Thread(interruptibleTask, "task");
        taskThread.start();
        Thread.sleep(50); // 让它执行 2 步左右
        taskThread.interrupt();
        taskThread.join();

        // ===== 5. 自定义停止标志 vs 中断 =====
        AtomicBoolean stopFlag = new AtomicBoolean(false);
        Thread custom = new Thread(() -> {
            while (!stopFlag.get()) {
                // 模拟工作
            }
            System.out.println("custom 收到自定义停止标志，退出");
        }, "custom");
        custom.start();
        Thread.sleep(20);
        stopFlag.set(true);
        custom.join();

        // ===== 6. Thread.interrupted() 静态方法会清除标志 =====
        Thread.currentThread().interrupt();
        System.out.println("第一次 interrupted(): " + Thread.interrupted()); // true，并清除
        System.out.println("第二次 interrupted(): " + Thread.interrupted()); // false

        System.out.println("主线程结束");
    }
}`
  },
  {
    id: "java-synchronized",
    group: "多线程与并发",
    icon: "🔒",
    title: "synchronized 同步",
    content: `# synchronized 同步

\`synchronized\` 是 Java 内建的线程同步机制，基于**监视器锁（Monitor Lock）**实现，保证同一时刻只有一个线程能执行被保护的代码块。

## 三种使用形式

### 1. 同步实例方法

\`\`\`java
public synchronized void method() {
    // 锁的是 this（当前实例）
}
\`\`\`

锁的是**当前对象实例**。不同实例的锁互不影响。

### 2. 同步静态方法

\`\`\`java
public static synchronized void method() {
    // 锁的是 Class 对象
}
\`\`\`

锁的是**类的 Class 对象**，所有实例共享同一把锁。

### 3. 同步代码块

\`\`\`java
synchronized (obj) {
    // 锁的是 obj
}
\`\`\`

可指定任意对象作为锁，最灵活，推荐使用。

## 锁对象的选择

- \`this\`：等价于同步实例方法
- \`ClassName.class\`：等价于同步静态方法
- 任意对象（如 \`private final Object lock = new Object()\`）：推荐，避免外部干扰

## 可重入性

synchronized 是**可重入锁**：同一线程可多次获取同一把锁，不会死锁：

\`\`\`java
synchronized (lock) {
    synchronized (lock) { // 同一线程可再次进入
        // ...
    }
}
\`\`\`

JVM 通过计数器实现：每次获取 +1，每次释放 -1，归零才真正释放锁。

## 监视器锁原理

每个 Java 对象都有一个 Monitor。synchronized 字节码使用 \`monitorenter\` 和 \`monitorexit\` 指令：

- \`monitorenter\`：尝试获取 Monitor，成功则计数+1
- \`monitorexit\`：计数-1，归零释放

同步方法的锁信息存储在方法表的 \`ACC_SYNCHRONIZED\` 标志位中，由方法调用指令隐式处理。

## 锁的内存语义

- **获取锁**：清空本地内存，从主内存重新读取
- **释放锁**：把本地内存刷新到主内存

因此 synchronized 既有互斥作用，也有**内存可见性**保证（类似 volatile）。

## 注意事项

- 不要用 String、Integer 等公共对象做锁（可能被其他代码持有，导致意外阻塞）
- 同步代码块应尽量短，减少持锁时间
- 锁对象应为 \`final\`，避免被修改导致锁失效

## synchronized vs Lock

| 特性 | synchronized | Lock |
|------|--------------|------|
| 释放锁 | 自动 | 手动 unlock |
| 可中断 | 不可 | tryLock 可超时 |
| 公平锁 | 非公平 | 可选公平 |
| 条件变量 | 一个 wait/notify | 多个 Condition |
| 性能 | JDK 6+ 优化后接近 | 灵活但稍复杂 |

下面通过代码演示 synchronized 的三种用法与可重入性：`,
    code: `// 演示 synchronized 的三种用法
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    // 共享计数器
    private int count = 0;
    private static int staticCount = 0;
    private final Object lock = new Object();
    private final AtomicInteger safeCount = new AtomicInteger(0);

    // 同步实例方法：锁 this
    public synchronized void incrementSyncMethod() {
        count++;
    }

    // 同步静态方法：锁 Class
    public static synchronized void incrementStaticSync() {
        staticCount++;
    }

    // 同步代码块：锁指定对象
    public void incrementSyncBlock() {
        synchronized (lock) {
            count++;
        }
    }

    // 可重入演示
    public synchronized void reentrantA() {
        count++; // 已持有 this 锁
        reentrantB(); // 再次获取 this 锁，可重入
    }
    public synchronized void reentrantB() {
        count++;
    }

    public static void main(String[] args) throws InterruptedException {
        Main demo = new Main();

        // ===== 1. 不加同步：多线程自增会丢失更新 =====
        Thread[] threads = new Thread[5];
        for (int i = 0; i < 5; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) demo.count++; // 非同步，有竞态
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("非同步自增 5x1000: " + demo.count + " (通常小于5000)");

        // ===== 2. 同步方法：保证原子性 =====
        demo.count = 0;
        for (int i = 0; i < 5; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) demo.incrementSyncMethod();
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("同步方法自增 5x1000: " + demo.count + " (正好5000)");

        // ===== 3. 同步代码块 =====
        demo.count = 0;
        for (int i = 0; i < 5; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) demo.incrementSyncBlock();
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("同步块自增 5x1000: " + demo.count + " (正好5000)");

        // ===== 4. 同步静态方法 =====
        for (int i = 0; i < 5; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) Main.incrementStaticSync();
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("同步静态方法 5x1000: " + Main.staticCount + " (正好5000)");

        // ===== 5. 可重入性 =====
        demo.count = 0;
        demo.reentrantA();
        System.out.println("可重入调用后 count: " + demo.count + " (A和B各+1=2)");

        // ===== 6. 同步代码块减小锁粒度 =====
        demo.count = 0;
        long start = System.nanoTime();
        for (int i = 0; i < 5; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    // 只锁关键部分，非关键部分不持锁
                    synchronized (demo.lock) {
                        demo.count++;
                    }
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        long end = System.nanoTime();
        System.out.println("细粒度锁自增 5x1000: " + demo.count + " 耗时 " + (end - start) / 1_000_000 + " ms");

        // ===== 7. 锁对象不要用 String/Integer =====
        // 错误示例说明：String 常量池导致不同代码可能锁同一对象
        System.out.println("提示: 永远不要用 String/Integer 等 public 对象作为锁");

        System.out.println("主线程结束");
    }
}`
  },
  {
    id: "java-volatile",
    group: "多线程与并发",
    icon: "⚡",
    title: "volatile 关键字",
    content: `# volatile 关键字

\`volatile\` 是 Java 的轻量级同步机制，提供**可见性**保证和**禁止指令重排序**，但**不保证原子性**。

## 两大作用

### 1. 保证可见性

Java 内存模型（JMM）中，每个线程有自己的工作内存（CPU 缓存）。普通变量的修改可能不会立即写回主内存，其他线程可能读到旧值。

\`volatile\` 变量的读写直接操作主内存：

- **写**：立即刷新到主内存，并使其他线程的本地副本失效
- **读**：强制从主内存读取最新值

\`\`\`java
private volatile boolean running = true;

// 线程A
while (running) { ... }  // 能感知到其他线程对 running 的修改

// 线程B
running = false; // 立即对线程A可见
\`\`\`

### 2. 禁止指令重排序

编译器和 CPU 为了优化性能会重排序指令，单线程下不影响结果，但多线程下可能出问题。volatile 通过**内存屏障**禁止特定重排。

经典案例：双重检查单例

\`\`\`java
class Singleton {
    private static volatile Singleton instance; // volatile 必须！
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton(); // 非原子：分配→初始化→赋值
                }
            }
        }
        return instance;
    }
}
\`\`\`

\`new Singleton()\` 分三步：1)分配内存 2)初始化 3)引用赋值。若重排为 1→3→2，其他线程可能在 3 之后、2 之前拿到未初始化的对象。volatile 禁止这种重排。

## 不保证原子性

\`volatile int count; count++;\` 不是原子操作！\`count++\` 是"读-改-写"三步，volatile 只保证每次读最新值，但两个线程可能同时读到相同值再各自+1，丢失更新。

需要原子性请用 \`synchronized\` 或 \`AtomicInteger\`。

## happens-before 关系

volatile 写 **happens-before** 后续的 volatile 读。即 volatile 写之前的所有操作，对 volatile 读之后的操作可见。这建立了跨线程的内存顺序保证。

## 适用场景

1. **状态标志位**：如 \`boolean stop\`、\`boolean ready\`
2. **双重检查锁定（DCL）单例**
3. **一次性安全发布**：对象初始化完成后发布 volatile 引用

不适合：复合操作（++、check-then-act）。

## volatile vs synchronized

| 特性 | volatile | synchronized |
|------|----------|--------------|
| 可见性 | 有 | 有 |
| 原子性 | 无 | 有 |
| 阻塞 | 不阻塞 | 阻塞 |
| 指令重排 | 禁止 | 禁止 |
| 性能 | 更轻量 | 较重 |
| 适用 | 状态标志 | 复合操作 |

## 原理

volatile 写在字节码层面有 \`ACC_VOLATILE\` 标志。JVM 通过插入内存屏障实现：
- StoreStore + StoreLoad（写之前/后）
- LoadLoad + LoadStore（读之前/后）

底层依赖 CPU 的锁指令（如 x86 的 lock 前缀）或缓存一致性协议（MESI）。

下面通过代码演示 volatile 的可见性与不保证原子性：`,
    code: `// 演示 volatile 的可见性与原子性问题
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.CountDownLatch;

public class Main {
    // volatile 保证可见性
    private volatile boolean running = true;
    // 非 volatile 对比
    private boolean plainFlag = true;
    // volatile 不保证原子性
    private volatile int volatileCount = 0;
    // AtomicInteger 保证原子性
    private final AtomicInteger atomicCount = new AtomicInteger(0);

    public static void main(String[] args) throws InterruptedException {
        Main demo = new Main();

        // ===== 1. volatile 保证可见性：停止循环 =====
        Thread worker = new Thread(() -> {
            long i = 0;
            while (demo.running) {
                i++; // 无 sleep，忙循环
            }
            System.out.println("worker 收到停止信号，退出。循环 " + i + " 次");
        }, "worker");
        worker.start();
        Thread.sleep(20);
        demo.running = false; // volatile 写，对 worker 立即可见
        worker.join();
        System.out.println("volatile 可见性: worker 已停止\\n");

        // ===== 2. volatile 不保证原子性 =====
        demo.volatileCount = 0;
        Thread[] threads = new Thread[5];
        for (int i = 0; i < 5; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    demo.volatileCount++; // 非原子，会丢失更新
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("volatile int 自增 5x1000: " + demo.volatileCount + " (通常小于5000)");

        // ===== 3. AtomicInteger 保证原子性 =====
        for (int i = 0; i < 5; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) {
                    demo.atomicCount.incrementAndGet();
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("AtomicInteger 自增 5x1000: " + demo.atomicCount.get() + " (正好5000)\\n");

        // ===== 4. 双重检查单例（volatile 必需） =====
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(5);
        AtomicInteger instanceCount = new AtomicInteger(0);
        for (int i = 0; i < 5; i++) {
            new Thread(() -> {
                try { start.await(); } catch (InterruptedException e) { return; }
                Singleton s = Singleton.getInstance();
                if (s != null) instanceCount.incrementAndGet();
                done.countDown();
            }).start();
        }
        start.countDown();
        done.await();
        System.out.println("DCL 单例获取成功线程数: " + instanceCount.get());
        System.out.println("Singleton 是否唯一: " + (Singleton.getInstance() == Singleton.getInstance()));

        // ===== 5. volatile 与普通变量的可见性差异 =====
        // 注意：非 volatile 变量可能被 JIT 优化，导致循环看不到更新。
        // 这里用 yield 避免忙循环被优化为死循环，并用带超时的 join 防止卡死。
        demo.plainFlag = false;
        Thread t2 = new Thread(() -> {
            int n = 0;
            while (!demo.plainFlag) { n++; Thread.yield(); }
            System.out.println("普通变量循环退出 (n=" + n + ")");
        }, "t2");
        t2.start();
        Thread.sleep(20);
        demo.plainFlag = true;
        t2.join(500);
        if (t2.isAlive()) {
            System.out.println("普通变量循环未退出（JIT 优化导致，non-volatile 不可见）");
        }

        System.out.println("\\n主线程结束");
    }
}

// 非公开辅助类：双重检查锁单例
class Singleton {
    private static volatile Singleton instance;
    private Singleton() { System.out.println("  Singleton 构造（仅一次）"); }
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton(); // volatile 防止指令重排
                }
            }
        }
        return instance;
    }
}`
  },
  {
    id: "java-wait-notify",
    group: "多线程与并发",
    icon: "📢",
    title: "wait/notify 机制",
    content: `# wait/notify 机制

\`wait/notify\` 是 Java 早期的线程间协作机制，定义在 \`Object\` 类上，用于实现**等待/通知**模式。

## 三个方法

| 方法 | 说明 |
|------|------|
| \`wait()\` | 当前线程释放锁并进入 WAITING，直到被 notify/notifyAll 唤醒 |
| \`wait(ms)\` | 带超时等待，超时自动唤醒 |
| \`notify()\` | 唤醒一个在此对象上等待的线程（随机选择） |
| \`notifyAll()\` | 唤醒所有在此对象上等待的线程 |

## 必须在 synchronized 中调用

wait/notify **必须**在持有对象监视器锁时调用，否则抛 \`IllegalMonitorStateException\`：

\`\`\`java
synchronized (lock) {
    while (!condition) {
        lock.wait(); // 释放 lock 的锁，进入等待
    }
    // 条件满足，执行操作
}

synchronized (lock) {
    // 改变条件
    lock.notifyAll(); // 唤醒等待者
}
\`\`\`

## wait() 的行为

1. **释放锁**：调用 wait() 会释放当前持有的锁（这是关键！）
2. **进入等待队列**：线程进入对象的 wait set
3. **被唤醒**：notify/notifyAll/interrupt/超时
4. **重新竞争锁**：被唤醒后需重新获取锁才能从 wait() 返回
5. **继续执行**：获取锁后从 wait() 后续代码继续

## 为什么用 while 而非 if（虚假唤醒）

\`\`\`java
// 错误：if
synchronized (lock) {
    if (!condition) lock.wait(); // 被唤醒后不再检查，可能条件已变
    // ...
}

// 正确：while
synchronized (lock) {
    while (!condition) lock.wait(); // 被唤醒后重新检查
    // ...
}
\`\`\`

**虚假唤醒（Spurious Wakeup）**：线程可能在没有 notify 的情况下从 wait 返回（操作系统行为）。因此必须用 while 循环重新检查条件。此外，notifyAll 唤醒多个线程时，只有一个能获取锁执行，其他线程拿到锁时条件可能已被改变。

## notify vs notifyAll

- \`notify\`：唤醒一个，开销小，但可能导致"信号丢失"（唤醒了错误的线程）
- \`notifyAll\`：唤醒所有，安全，但开销大（所有等待线程竞争锁）

一般推荐 \`notifyAll\`，除非明确只有一个等待线程且条件单一。

## 生产者-消费者模式

经典应用：

\`\`\`java
class Buffer {
    private Queue<Integer> queue = new LinkedList<>();
    private int capacity;
    public synchronized void put(int x) throws InterruptedException {
        while (queue.size() == capacity) wait(); // 满了等
        queue.offer(x);
        notifyAll(); // 通知消费者
    }
    public synchronized int take() throws InterruptedException {
        while (queue.isEmpty()) wait(); // 空了等
        int x = queue.poll();
        notifyAll(); // 通知生产者
        return x;
    }
}
\`\`\`

## wait/notify 的局限

- 必须持有锁
- 只有一个等待队列（条件）
- 无法知道剩余等待时间
- \`Condition\`（来自 Lock）提供更灵活的多条件等待

下面通过代码演示 wait/notify 与生产者-消费者：`,
    code: `// 演示 wait/notify 与生产者-消费者模式
import java.util.LinkedList;
import java.util.Queue;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        // ===== 1. 基础 wait/notify =====
        final Object lock = new Object();
        AtomicInteger message = new AtomicInteger(-1);

        Thread waiter = new Thread(() -> {
            synchronized (lock) {
                System.out.println("waiter 准备等待");
                try {
                    while (message.get() == -1) {
                        lock.wait(); // 释放锁并等待
                    }
                    System.out.println("waiter 被唤醒，收到: " + message.get());
                } catch (InterruptedException e) {
                    System.out.println("waiter 被中断");
                }
            }
        }, "waiter");

        Thread notifier = new Thread(() -> {
            synchronized (lock) {
                try { Thread.sleep(20); } catch (InterruptedException e) { return; }
                message.set(42);
                System.out.println("notifier 设置消息并 notify");
                lock.notify(); // 唤醒 waiter
            }
        }, "notifier");

        waiter.start();
        notifier.start();
        waiter.join();
        notifier.join();
        System.out.println();

        // ===== 2. 生产者-消费者 =====
        Buffer buffer = new Buffer(3);

        Runnable producer = () -> {
            for (int i = 0; i < 5; i++) {
                try {
                    buffer.put(i);
                    System.out.println(Thread.currentThread().getName() + " 生产: " + i);
                    Thread.sleep(5);
                } catch (InterruptedException e) { return; }
            }
        };

        Runnable consumer = () -> {
            for (int i = 0; i < 10; i++) { // 消费 10 个，匹配 2 个生产者各 5 个
                try {
                    int x = buffer.take();
                    System.out.println(Thread.currentThread().getName() + " 消费: " + x);
                    Thread.sleep(10);
                } catch (InterruptedException e) { return; }
            }
        };

        Thread p1 = new Thread(producer, "生产者P1");
        Thread p2 = new Thread(producer, "生产者P2");
        Thread c1 = new Thread(consumer, "消费者C1");

        p1.start();
        p2.start();
        c1.start();
        p1.join();
        p2.join();
        c1.join();
        System.out.println("生产消费完成，剩余: " + buffer.size() + "\\n");

        // ===== 3. notify vs notifyAll =====
        final Object lock2 = new Object();
        AtomicInteger wokeCount = new AtomicInteger(0);

        Runnable w = () -> {
            synchronized (lock2) {
                try { lock2.wait(); wokeCount.incrementAndGet(); } catch (InterruptedException e) { }
            }
        };
        Thread t1 = new Thread(w, "w1");
        Thread t2 = new Thread(w, "w2");
        Thread t3 = new Thread(w, "w3");
        t1.start(); t2.start(); t3.start();
        Thread.sleep(20);
        synchronized (lock2) { lock2.notify(); } // 只唤醒一个
        t1.join(50); t2.join(50); t3.join(50);
        System.out.println("notify 唤醒数量: " + wokeCount.get() + " (应为1)");

        // 剩余的用 notifyAll 唤醒
        synchronized (lock2) { lock2.notifyAll(); }
        t1.join(50); t2.join(50); t3.join(50);
        System.out.println("notifyAll 后唤醒总量: " + wokeCount.get() + " (应为3)\\n");

        // ===== 4. 带超时的 wait =====
        final Object lock3 = new Object();
        Thread timedWaiter = new Thread(() -> {
            synchronized (lock3) {
                long start = System.currentTimeMillis();
                try { lock3.wait(50); } catch (InterruptedException e) { }
                long elapsed = System.currentTimeMillis() - start;
                System.out.println("超时等待实际耗时: " + elapsed + " ms (约50ms)");
            }
        }, "timedWaiter");
        timedWaiter.start();
        timedWaiter.join();

        System.out.println("\\n主线程结束");
    }
}

// 非公开辅助类：生产者-消费者缓冲区
class Buffer {
    private final Queue<Integer> queue = new LinkedList<>();
    private final int capacity;

    Buffer(int capacity) { this.capacity = capacity; }

    public synchronized void put(int x) throws InterruptedException {
        while (queue.size() == capacity) {
            System.out.println("  缓冲区满，" + Thread.currentThread().getName() + " 等待");
            wait();
        }
        queue.offer(x);
        notifyAll(); // 通知可能等待的消费者
    }

    public synchronized int take() throws InterruptedException {
        while (queue.isEmpty()) {
            System.out.println("  缓冲区空，" + Thread.currentThread().getName() + " 等待");
            wait();
        }
        int x = queue.poll();
        notifyAll(); // 通知可能等待的生产者
        return x;
    }

    public synchronized int size() { return queue.size(); }
}`
  },
  {
    id: "java-thread-pool",
    group: "多线程与并发",
    icon: "🏊",
    title: "线程池基础",
    content: `# 线程池基础

线程池（Thread Pool）是预先创建一组可复用线程，用于执行提交的任务，避免频繁创建/销毁线程的开销。Java 通过 \`Executor\` 框架提供线程池支持。

## 为什么用线程池

1. **降低资源消耗**：线程创建/销毁有成本，复用线程减少开销
2. **提高响应速度**：任务到来直接用现有线程，无需创建
3. **便于管理**：统一控制线程数量、生命周期、任务队列
4. **防止过载**：限制最大线程数，避免创建过多线程导致系统崩溃

## Executors 工厂方法

\`java.util.concurrent.Executors\` 提供常用线程池的工厂方法：

### newFixedThreadPool(int n)

固定大小线程池，核心线程数 = 最大线程数 = n，无界队列：

\`\`\`java
ExecutorService pool = Executors.newFixedThreadPool(4);
\`\`\`

适合任务量稳定、CPU 密集型场景。

### newCachedThreadPool()

可缓存线程池，核心线程数为 0，最大线程数为 Integer.MAX_VALUE，60 秒空闲回收：

\`\`\`java
ExecutorService pool = Executors.newCachedThreadPool();
\`\`\`

适合大量短任务、I/O 密集型场景。注意：可能创建大量线程导致 OOM。

### newSingleThreadExecutor()

单线程池，只有一个线程工作，保证任务按顺序执行：

\`\`\`java
ExecutorService pool = Executors.newSingleThreadExecutor();
\`\`\`

适合需要顺序执行任务的场景。

### newScheduledThreadPool(int n)

定时/周期任务线程池：

\`\`\`java
ScheduledExecutorService pool = Executors.newScheduledThreadPool(2);
pool.schedule(task, 1, TimeUnit.SECONDS);          // 延迟执行
pool.scheduleAtFixedRate(task, 0, 1, TimeUnit.SECONDS); // 固定频率
pool.scheduleWithFixedDelay(task, 0, 1, TimeUnit.SECONDS); // 固定延迟
\`\`\`

## execute vs submit

| 方法 | 返回值 | 异常处理 |
|------|--------|----------|
| execute(Runnable) | void | 未捕获异常触发 UncaughtExceptionHandler |
| submit(Runnable/Callable) | Future | 异常封装在 Future 中，get() 时抛 ExecutionException |

\`\`\`java
pool.execute(() -> { ... });              // 无返回值
Future<?> f = pool.submit(() -> { ... }); // 返回 Future
Future<Integer> f2 = pool.submit(() -> 42); // Callable
\`\`\`

## 关闭线程池

\`\`\`java
pool.shutdown();       // 不再接受新任务，等待已提交任务完成
pool.shutdownNow();    // 尝试中断所有任务，返回未执行任务列表
pool.awaitTermination(60, TimeUnit.SECONDS); // 等待终止
\`\`\`

推荐关闭模式：

\`\`\`java
pool.shutdown();
if (!pool.awaitTermination(60, TimeUnit.SECONDS)) {
    pool.shutdownNow();
}
\`\`\`

## Executors 的隐患

阿里规范不推荐用 Executors 的工厂方法，因为：

- newFixedThreadPool/newSingleThreadExecutor：使用无界队列 \`LinkedBlockingQueue\`，可能堆积大量任务导致 OOM
- newCachedThreadPool：最大线程数无上限，可能创建大量线程导致 OOM
- newScheduledThreadPool：同样无界队列

生产环境推荐直接用 \`ThreadPoolExecutor\`（见下一章）。

下面通过代码演示各类线程池的用法：`,
    code: `// 演示各种线程池的用法
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws Exception {
        AtomicInteger counter = new AtomicInteger(0);

        // ===== 1. newFixedThreadPool：固定大小 =====
        ExecutorService fixed = Executors.newFixedThreadPool(3);
        for (int i = 0; i < 5; i++) {
            final int x = i;
            fixed.execute(() -> {
                System.out.println("fixed 任务" + x + " 在 " + Thread.currentThread().getName());
                try { Thread.sleep(10); } catch (InterruptedException e) { }
                counter.incrementAndGet();
            });
        }
        fixed.shutdown();
        fixed.awaitTermination(2, TimeUnit.SECONDS);
        System.out.println("fixed 完成 " + counter.get() + " 个任务\\n");

        // ===== 2. newCachedThreadPool：动态扩缩 =====
        counter.set(0);
        ExecutorService cached = Executors.newCachedThreadPool();
        for (int i = 0; i < 5; i++) {
            final int x = i;
            cached.execute(() -> {
                System.out.println("cached 任务" + x + " 在 " + Thread.currentThread().getName());
                try { Thread.sleep(10); } catch (InterruptedException e) { }
                counter.incrementAndGet();
            });
        }
        cached.shutdown();
        cached.awaitTermination(2, TimeUnit.SECONDS);
        System.out.println("cached 完成 " + counter.get() + " 个任务\\n");

        // ===== 3. newSingleThreadExecutor：顺序执行 =====
        counter.set(0);
        ExecutorService single = Executors.newSingleThreadExecutor();
        for (int i = 0; i < 5; i++) {
            final int x = i;
            single.execute(() -> {
                System.out.println("single 任务" + x + " 在 " + Thread.currentThread().getName());
                counter.incrementAndGet();
            });
        }
        single.shutdown();
        single.awaitTermination(2, TimeUnit.SECONDS);
        System.out.println("single 完成 " + counter.get() + " 个任务\\n");

        // ===== 4. submit 返回 Future =====
        ExecutorService pool = Executors.newFixedThreadPool(2);
        Future<Integer> future = pool.submit(() -> {
            Thread.sleep(20);
            return 100;
        });
        Future<String> future2 = pool.submit(() -> {
            Thread.sleep(10);
            return "结果";
        });
        System.out.println("Future1 结果: " + future.get());
        System.out.println("Future2 结果: " + future2.get());

        // ===== 5. execute 异常处理 =====
        Thread.setDefaultUncaughtExceptionHandler((t, e) ->
            System.out.println("捕获未处理异常 [" + t.getName() + "]: " + e.getMessage()));
        pool.execute(() -> { throw new RuntimeException("execute 抛异常"); });
        Thread.sleep(50);

        pool.shutdown();
        pool.awaitTermination(2, TimeUnit.SECONDS);
        System.out.println();

        // ===== 6. ScheduledThreadPool：定时任务 =====
        ScheduledExecutorService sched = Executors.newScheduledThreadPool(2);
        counter.set(0);
        // 延迟 50ms 执行一次
        ScheduledFuture<?> sf = sched.schedule(() -> {
            System.out.println("定时任务执行");
            counter.incrementAndGet();
        }, 50, TimeUnit.MILLISECONDS);

        sf.get(); // 等待定时任务完成
        System.out.println("定时任务完成: " + counter.get());

        // 固定延迟任务（执行 3 次后取消）
        AtomicInteger runCount = new AtomicInteger(0);
        ScheduledFuture<?> periodic = sched.scheduleWithFixedDelay(() -> {
            int n = runCount.incrementAndGet();
            System.out.println("周期任务第 " + n + " 次执行");
        }, 0, 20, TimeUnit.MILLISECONDS);

        Thread.sleep(70); // 让它跑 3-4 次
        periodic.cancel(false);
        sched.shutdown();
        sched.awaitTermination(2, TimeUnit.SECONDS);
        System.out.println("周期任务执行次数: " + runCount.get());

        // ===== 7. 优雅关闭演示 =====
        ExecutorService last = Executors.newFixedThreadPool(2);
        for (int i = 0; i < 3; i++) {
            final int x = i;
            last.submit(() -> {
                try { Thread.sleep(20); System.out.println("任务" + x + " 完成"); } catch (InterruptedException e) { }
            });
        }
        last.shutdown(); // 不再接受新任务
        System.out.println("shutdown 后是否接受任务: isShutdown=" + last.isShutdown());
        if (!last.awaitTermination(1, TimeUnit.SECONDS)) {
            List<Runnable> dropped = last.shutdownNow();
            System.out.println("强制关闭，丢弃任务: " + dropped.size());
        }
        System.out.println("是否已终止: " + last.isTerminated());
        System.out.println("\\n主线程结束");
    }
}`
  },
  {
    id: "java-executor-service",
    group: "多线程与并发",
    icon: "⚙️",
    title: "ExecutorService 详解",
    content: `# ExecutorService 详解

\`ExecutorService\` 继承自 \`Executor\`，是线程池的核心接口，提供任务提交、批量执行、关闭等高级功能。

## 任务提交

### submit

\`\`\`java
Future<?> submit(Runnable task);              // 返回 null
<T> Future<T> submit(Runnable task, T result); // 返回指定的 result
<T> Future<T> submit(Callable<T> task);       // 返回计算结果
\`\`\`

submit 总是返回 Future，即使 Runnable 也会包装为 FutureTask。

### invokeAll

批量提交 Callable，**等待全部完成**，返回 Future 列表：

\`\`\`java
List<Future<Integer>> futures = pool.invokeAll(callableList);
for (Future<Integer> f : futures) {
    System.out.println(f.get()); // 阻塞直到所有完成
}
\`\`\`

\`invokeAll(tasks, timeout, unit)\` 带超时，超时未完成的任务会被取消。

### invokeAny

批量提交 Callable，**返回最先成功完成的那个结果**，其余任务被取消：

\`\`\`java
Integer result = pool.invokeAny(callableList);
\`\`\`

适合"多个方案谁先成功用谁"的场景，如多节点查询。

## 关闭方法

### shutdown()

- 不再接受新任务
- 已提交任务继续执行
- 状态变为 \`isShutdown()=true\`

### shutdownNow()

- 不再接受新任务
- 尝试**中断**正在执行的任务（依赖任务响应中断）
- 返回等待执行的任务列表
- 状态变为 \`isShutdown()=true\`，全部结束后 \`isTerminated()=true\`

### awaitTermination(timeout, unit)

阻塞等待线程池终止，常与 shutdown 配合：

\`\`\`java
pool.shutdown();
if (!pool.awaitTermination(60, TimeUnit.SECONDS)) {
    pool.shutdownNow();
}
\`\`\`

## 状态查询

- \`isShutdown()\`：是否调用了 shutdown
- \`isTerminated()\`：是否所有任务都结束（shutdown 后才有意义）
- \`awaitTermination()\`：阻塞等待终止

## Future 的进阶用法

\`\`\`java
future.cancel(true);       // 取消任务（mayInterruptIfRunning=true 中断执行中任务）
future.isCancelled();      // 是否被取消
future.isDone();           // 是否完成（正常/异常/取消）
future.get();              // 阻塞获取
future.get(timeout, unit); // 带超时获取
\`\`\`

## 异常处理

- submit 的任务异常被封装在 Future，get() 抛 \`ExecutionException\`（getCause 获取真实异常）
- execute 的任务异常会触发 \`UncaughtExceptionHandler\`

## CompletionService

\`CompletionService\` 按**完成顺序**获取结果，而非提交顺序：

\`\`\`java
ExecutorCompletionService<Integer> cs = new ExecutorCompletionService<>(pool);
for (Callable<Integer> c : tasks) cs.submit(c);
for (int i = 0; i < n; i++) {
    Future<Integer> f = cs.take(); // 阻塞直到有任务完成
    System.out.println(f.get());
}
\`\`\`

适合"谁先完成先处理谁"的场景。

下面通过代码演示 ExecutorService 的批量提交与关闭：`,
    code: `// 演示 ExecutorService 的高级用法
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(4);

        // ===== 1. submit Runnable =====
        Future<?> f1 = pool.submit(() -> {
            try { Thread.sleep(10); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            System.out.println("Runnable 完成");
        });
        f1.get(); // 等待完成
        System.out.println("submit Runnable 返回: " + f1.get() + " (null)\\n");

        // ===== 2. submit Runnable with result =====
        String preset = "预设结果";
        Future<String> f2 = pool.submit(() -> {
            try { Thread.sleep(10); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        }, preset);
        System.out.println("submit Runnable+result 返回: " + f2.get() + "\\n");

        // ===== 3. submit Callable =====
        Future<Integer> f3 = pool.submit(() -> {
            Thread.sleep(10);
            return 42;
        });
        System.out.println("submit Callable 返回: " + f3.get() + "\\n");

        // ===== 4. invokeAll：等待全部完成 =====
        List<Callable<String>> tasks = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            final int x = i;
            tasks.add(() -> {
                Thread.sleep(20 + x * 10); // 不同耗时
                return "任务" + x + "结果";
            });
        }
        long start = System.currentTimeMillis();
        List<Future<String>> futures = pool.invokeAll(tasks);
        long elapsed = System.currentTimeMillis() - start;
        System.out.println("invokeAll 耗时 " + elapsed + " ms (约50ms，最慢任务决定):");
        for (Future<String> f : futures) System.out.println("  " + f.get());
        System.out.println();

        // ===== 5. invokeAny：返回最先完成的 =====
        List<Callable<Integer>> anyTasks = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            final int x = i;
            anyTasks.add(() -> {
                Thread.sleep(30 - x * 5); // 任务0最慢，任务3最快
                return x * 100;
            });
        }
        Integer anyResult = pool.invokeAny(anyTasks);
        System.out.println("invokeAny 返回最快完成: " + anyResult + " (应为300)\\n");

        // ===== 6. CompletionService：按完成顺序获取 =====
        ExecutorCompletionService<String> cs = new ExecutorCompletionService<>(pool);
        for (int i = 0; i < 4; i++) {
            final int x = i;
            cs.submit(() -> {
                Thread.sleep(30 - x * 5); // x=3 最快完成
                return "完成" + x;
            });
        }
        System.out.println("CompletionService 按完成顺序:");
        for (int i = 0; i < 4; i++) {
            Future<String> f = cs.poll(1, TimeUnit.SECONDS);
            if (f != null) System.out.println("  " + f.get());
        }
        System.out.println();

        // ===== 7. 带超时的 invokeAll =====
        List<Callable<String>> slowTasks = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            final int x = i;
            slowTasks.add(() -> {
                Thread.sleep(x == 0 ? 10 : 500); // 任务1、2 超时
                return "slow" + x;
            });
        }
        List<Future<String>> timed = pool.invokeAll(slowTasks, 50, TimeUnit.MILLISECONDS);
        for (int i = 0; i < timed.size(); i++) {
            Future<String> f = timed.get(i);
            System.out.println("任务" + i + " 是否取消: " + f.isCancelled());
        }
        System.out.println();

        // ===== 8. 优雅关闭 =====
        pool.shutdown();
        System.out.println("shutdown 后 isShutdown: " + pool.isShutdown());
        System.out.println("是否立即 isTerminated: " + pool.isTerminated());
        boolean term = pool.awaitTermination(1, TimeUnit.SECONDS);
        System.out.println("awaitTermination 返回: " + term);
        System.out.println("是否 isTerminated: " + pool.isTerminated());

        // ===== 9. shutdownNow 中断正在执行的任务 =====
        ExecutorService pool2 = Executors.newSingleThreadExecutor();
        AtomicInteger wasInterrupted = new AtomicInteger(0);
        pool2.submit(() -> {
            try { Thread.sleep(500); } catch (InterruptedException e) {
                wasInterrupted.set(1);
            }
        });
        Thread.sleep(20);
        List<Runnable> dropped = pool2.shutdownNow();
        pool2.awaitTermination(1, TimeUnit.SECONDS);
        System.out.println("\\nshutdownNow 中断标记: " + wasInterrupted.get() + " (应为1)");
        System.out.println("被丢弃任务数: " + dropped.size());

        System.out.println("\\n主线程结束");
    }
}`
  },
  {
    id: "java-thread-pool-executor",
    group: "多线程与并发",
    icon: "🔧",
    title: "ThreadPoolExecutor",
    content: `# ThreadPoolExecutor

\`ThreadPoolExecutor\` 是线程池的真正实现类，\`Executors\` 的工厂方法内部都是创建它。直接使用 ThreadPoolExecutor 可以精细控制线程池行为，是生产环境推荐做法。

## 七个核心参数

\`\`\`java
public ThreadPoolExecutor(
    int corePoolSize,                    // 核心线程数
    int maximumPoolSize,                 // 最大线程数
    long keepAliveTime,                  // 空闲存活时间
    TimeUnit unit,                       // 时间单位
    BlockingQueue<Runnable> workQueue,   // 任务队列
    ThreadFactory threadFactory,         // 线程工厂
    RejectedExecutionHandler handler     // 拒绝策略
)
\`\`\`

### corePoolSize
核心线程数。默认情况下核心线程不会被回收（即使空闲）。可通过 \`allowCoreThreadTimeOut(true)\` 允许回收。

### maximumPoolSize
最大线程数。当队列满且线程数 < maximumPoolSize 时，会创建新线程。

### keepAliveTime / unit
非核心线程的空闲存活时间。超过则回收。

### workQueue
任务队列，常用实现：

- \`ArrayBlockingQueue\`：有界数组队列
- \`LinkedBlockingQueue\`：链表队列（无界或可选有界）
- \`SynchronousQueue\`：不存储元素，直接交付
- \`PriorityBlockingQueue\`：优先级队列

### threadFactory
创建线程的工厂，可自定义线程名、优先级、是否守护等。

### handler
拒绝策略，见下文。

## 任务提交流程

\`\`\`
1. 当前线程数 < corePoolSize？
   → 创建新核心线程执行
2. 否则，尝试加入 workQueue
   → 入队成功，等待执行
3. 队列满，当前线程数 < maximumPoolSize？
   → 创建新非核心线程执行
4. 队列满且线程数 = maximumPoolSize
   → 执行拒绝策略
\`\`\`

注意顺序：**先核心线程，再队列，再非核心线程，最后拒绝**。这与很多人直觉相反（以为先创满线程再排队）。

## 四种拒绝策略

| 策略 | 行为 |
|------|------|
| \`AbortPolicy\`（默认） | 抛 RejectedExecutionException |
| \`CallerRunsPolicy\` | 由提交任务的线程执行该任务（降级保护） |
| \`DiscardPolicy\` | 静默丢弃新任务 |
| \`DiscardOldestPolicy\` | 丢弃队列最老的任务，再尝试提交 |

## 推荐配置

- **CPU 密集型**：corePoolSize = N + 1（N = CPU 核数）
- **I/O 密集型**：corePoolSize = 2N 或更多（线程大部分时间在等待 I/O）
- **混合型**：根据 CPU 和 I/O 占比估算

\`\`\`java
int cpu = Runtime.getRuntime().availableProcessors();
\`\`\`

队列建议**有界**，防止 OOM。拒绝策略常用 \`CallerRunsPolicy\` 实现背压。

## 自定义线程工厂

\`\`\`java
ThreadFactory factory = r -> {
    Thread t = new Thread(r);
    t.setName("biz-pool-" + t.getId());
    t.setDaemon(false);
    return t;
};
\`\`\`

## 监控方法

- \`getPoolSize()\`：当前线程数
- \`getActiveCount()\`：活跃线程数
- \`getQueue().size()\`：队列任务数
- \`getCompletedTaskCount()\`：已完成任务数

下面通过代码演示自定义线程池的配置与拒绝策略：`,
    code: `// 演示自定义 ThreadPoolExecutor
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 1. 自定义线程池 =====
        ThreadFactory factory = r -> {
            Thread t = new Thread(r);
            t.setName("biz-pool-" + t.getId());
            t.setDaemon(false);
            return t;
        };

        // 核心线程2，最大4，队列容量2
        ThreadPoolExecutor pool = new ThreadPoolExecutor(
            2, 4,
            30, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(2),
            factory,
            new ThreadPoolExecutor.AbortPolicy()
        );

        // ===== 2. 观察任务执行流程 =====
        AtomicInteger done = new AtomicInteger(0);
        Runnable task = () -> {
            String name = Thread.currentThread().getName();
            System.out.println("[" + name + "] 执行任务, 池大小=" + pool.getPoolSize()
                + " 队列=" + pool.getQueue().size());
            try { Thread.sleep(20); } catch (InterruptedException e) { return; }
            done.incrementAndGet();
        };

        // 提交 6 个任务：2 核心 + 2 队列 + 2 非核心 = 6
        for (int i = 0; i < 6; i++) {
            try {
                pool.execute(task);
                System.out.println("提交任务" + i + " 成功, 池=" + pool.getPoolSize()
                    + " 队列=" + pool.getQueue().size());
            } catch (RejectedExecutionException e) {
                System.out.println("提交任务" + i + " 被拒绝");
            }
        }

        // 等待任务完成
        Thread.sleep(200);
        System.out.println("已完成: " + done.get() + "\\n");

        // ===== 3. 拒绝策略：AbortPolicy（默认）抛异常 =====
        ThreadPoolExecutor abortPool = new ThreadPoolExecutor(
            1, 1, 0, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(1),
            new ThreadPoolExecutor.AbortPolicy()
        );
        abortPool.execute(() -> { try { Thread.sleep(30); } catch (InterruptedException e) { } });
        abortPool.execute(() -> { }); // 入队
        try {
            abortPool.execute(() -> { }); // 第3个，队列满且线程满 → 拒绝
            System.out.println("不应执行到这里");
        } catch (RejectedExecutionException e) {
            System.out.println("AbortPolicy 抛出 RejectedExecutionException");
        }
        abortPool.shutdown();
        abortPool.awaitTermination(1, TimeUnit.SECONDS);

        // ===== 4. 拒绝策略：CallerRunsPolicy 由调用者执行 =====
        ThreadPoolExecutor callerPool = new ThreadPoolExecutor(
            1, 1, 0, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(1),
            new ThreadPoolExecutor.CallerRunsPolicy()
        );
        callerPool.execute(() -> { try { Thread.sleep(20); } catch (InterruptedException e) { } });
        callerPool.execute(() -> { }); // 入队
        System.out.println("CallerRunsPolicy 前, 当前线程: " + Thread.currentThread().getName());
        callerPool.execute(() -> {
            System.out.println("CallerRunsPolicy 由 " + Thread.currentThread().getName() + " 执行");
        });
        callerPool.shutdown();
        callerPool.awaitTermination(1, TimeUnit.SECONDS);
        System.out.println();

        // ===== 5. 拒绝策略：DiscardOldestPolicy 丢弃最老的 =====
        AtomicInteger executed = new AtomicInteger(0);
        ThreadPoolExecutor discardPool = new ThreadPoolExecutor(
            1, 1, 0, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(2),
            new ThreadPoolExecutor.DiscardOldestPolicy()
        );
        discardPool.execute(() -> { try { Thread.sleep(20); } catch (InterruptedException e) { } executed.incrementAndGet(); });
        discardPool.execute(() -> { executed.incrementAndGet(); }); // 入队，将被丢弃
        discardPool.execute(() -> { executed.incrementAndGet(); }); // 入队
        discardPool.execute(() -> { executed.incrementAndGet(); }); // 丢弃最老的(任务2)，入队任务4
        discardPool.shutdown();
        discardPool.awaitTermination(1, TimeUnit.SECONDS);
        System.out.println("DiscardOldestPolicy 执行数: " + executed.get() + "\\n");

        // ===== 6. allowCoreThreadTimeOut =====
        ThreadPoolExecutor timeoutPool = new ThreadPoolExecutor(
            2, 2, 50, TimeUnit.MILLISECONDS,
            new LinkedBlockingQueue<>()
        );
        timeoutPool.allowCoreThreadTimeOut(true);
        timeoutPool.execute(() -> { try { Thread.sleep(10); } catch (InterruptedException e) { } });
        timeoutPool.execute(() -> { try { Thread.sleep(10); } catch (InterruptedException e) { } });
        System.out.println("执行中池大小: " + timeoutPool.getPoolSize());
        Thread.sleep(100);
        System.out.println("空闲后池大小: " + timeoutPool.getPoolSize() + " (核心线程被回收)");
        timeoutPool.shutdown();
        timeoutPool.awaitTermination(1, TimeUnit.SECONDS);

        // ===== 7. 监控信息 =====
        System.out.println("\\n最终池状态: 已完成=" + pool.getCompletedTaskCount()
            + " 池大小=" + pool.getPoolSize());
        pool.shutdown();
        pool.awaitTermination(1, TimeUnit.SECONDS);
        System.out.println("\\n主线程结束");
    }
}`
  },
  {
    id: "java-completable-future",
    group: "多线程与并发",
    icon: "🔗",
    title: "CompletableFuture",
    content: `# CompletableFuture

\`CompletableFuture\` 是 JDK 8 引入的异步编程利器，实现了 \`Future\` 和 \`CompletionStage\` 接口，支持链式调用、组合多个异步任务、异常处理等，是函数式异步编程的核心。

## 创建异步任务

\`\`\`java
// 有返回值
CompletableFuture<String> f1 = CompletableFuture.supplyAsync(() -> "结果");

// 无返回值
CompletableFuture<Void> f2 = CompletableFuture.runAsync(() -> System.out.println("执行"));

// 指定线程池
CompletableFuture<String> f3 = CompletableFuture.supplyAsync(() -> "x", executor);
\`\`\`

默认使用 \`ForkJoinPool.commonPool()\`，CPU 密集型任务可接受；I/O 任务建议传自定义线程池。

## 单任务转换

\`\`\`java
thenApply(fn)       // 转换结果，有返回值
thenAccept(con)     // 消费结果，无返回值
thenRun(run)        // 不关心结果，执行动作
\`\`\`

\`\`\`java
CompletableFuture<Integer> f = CompletableFuture
    .supplyAsync(() -> "42")
    .thenApply(Integer::parseInt)        // String → Integer
    .thenApply(x -> x * 2);              // 42 → 84
\`\`\`

## 组合任务

\`\`\`java
thenCompose(fn)  // 串联：前一个结果作为后一个的输入，返回新的 CompletableFuture（扁平化）
thenCombine(other, biFn) // 合并：两个任务都完成后合并结果
\`\`\`

\`thenCompose\` 类似 \`flatMap\`，避免 \`CompletableFuture<CompletableFuture<T>>\` 嵌套：

\`\`\`java
f.thenCompose(x -> CompletableFuture.supplyAsync(() -> x + 1))
\`\`\`

## 多任务协调

\`\`\`java
allOf(cf1, cf2, cf3)  // 等待全部完成，返回 CompletableFuture<Void>
anyOf(cf1, cf2, cf3)  // 任一完成即返回，返回 CompletableFuture<Object>
\`\`\`

## 异步与同步版本

每个回调方法都有三个版本：

\`\`\`java
thenApply(fn)              // 同步：在前一个任务线程或调用者线程执行
thenApplyAsync(fn)         // 异步：在 ForkJoinPool 执行
thenApplyAsync(fn, executor) // 异步：在指定线程池执行
\`\`\`

## 异常处理

\`\`\`java
exceptionally(fn)   // 仅异常时触发，返回兜底值
handle(biFn)        // 无论成功失败都触发，可访问异常
whenComplete(biCon) // 完成后触发，不能修改结果（仅副作用）
\`\`\`

\`\`\`java
CompletableFuture<Integer> f = CompletableFuture
    .supplyAsync(() -> { throw new RuntimeException("失败"); })
    .exceptionally(ex -> -1); // 异常时返回 -1
\`\`\`

## 阻塞获取

\`\`\`java
f.get();           // 阻塞获取，抛检查异常
f.join();          // 阻塞获取，异常包装为 CompletionException（非检查）
f.getNow(default); // 不阻塞，未完成返回默认值
\`\`\`

生产环境尽量避免 \`get/join\` 阻塞，链式调用让结果自动流转。

## 与 Future 对比

| 特性 | Future | CompletableFuture |
|------|--------|---------------------|
| 注册回调 | 不支持 | 支持 |
| 链式组合 | 不支持 | 支持 |
| 异常处理 | get 抛异常 | exceptionally/handle |
| 手动完成 | 不支持 | complete/completeExceptionally |

下面通过代码演示 CompletableFuture 的链式、组合与异常处理：`,
    code: `// 演示 CompletableFuture 的用法
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 1. supplyAsync + thenApply 链式 =====
        String result = CompletableFuture
            .supplyAsync(() -> {
                try { Thread.sleep(10); } catch (InterruptedException e) { }
                return "hello";
            })
            .thenApply(s -> s + " world")
            .thenApply(String::toUpperCase)
            .join();
        System.out.println("1. 链式转换: " + result);

        // ===== 2. thenAccept 消费结果 =====
        CompletableFuture<Void> f = CompletableFuture
            .supplyAsync(() -> 42)
            .thenAccept(x -> System.out.println("2. thenAccept 消费: " + x));
        f.join();

        // ===== 3. thenCompose 串联（扁平化） =====
        Integer composed = CompletableFuture
            .supplyAsync(() -> "10")
            .thenCompose(s -> CompletableFuture.supplyAsync(() -> Integer.parseInt(s) * 2))
            .join();
        System.out.println("3. thenCompose 串联: " + composed);

        // ===== 4. thenCombine 合并两个任务 =====
        String combined = CompletableFuture
            .supplyAsync(() -> { sleep(10); return "左"; })
            .thenCombine(
                CompletableFuture.supplyAsync(() -> { sleep(10); return "右"; }),
                (l, r) -> l + " + " + r
            )
            .join();
        System.out.println("4. thenCombine 合并: " + combined);

        // ===== 5. allOf 等待全部完成 =====
        AtomicInteger doneCount = new AtomicInteger(0);
        CompletableFuture<String> t1 = CompletableFuture.supplyAsync(() -> { sleep(20); doneCount.incrementAndGet(); return "A"; });
        CompletableFuture<String> t2 = CompletableFuture.supplyAsync(() -> { sleep(15); doneCount.incrementAndGet(); return "B"; });
        CompletableFuture<String> t3 = CompletableFuture.supplyAsync(() -> { sleep(10); doneCount.incrementAndGet(); return "C"; });

        CompletableFuture<Void> all = CompletableFuture.allOf(t1, t2, t3);
        all.join();
        System.out.println("5. allOf 完成，完成数: " + doneCount.get());
        System.out.println("   结果: " + t1.join() + t2.join() + t3.join());

        // ===== 6. anyOf 任一完成 =====
        long start = System.currentTimeMillis();
        CompletableFuture<Object> any = CompletableFuture.anyOf(
            CompletableFuture.supplyAsync(() -> { sleep(50); return "slow"; }),
            CompletableFuture.supplyAsync(() -> { sleep(10); return "fast"; })
        );
        Object first = any.join();
        long elapsed = System.currentTimeMillis() - start;
        System.out.println("6. anyOf 最先返回: " + first + "，耗时 " + elapsed + " ms");

        // ===== 7. 异常处理 =====
        Integer safe = CompletableFuture
            .<Integer>supplyAsync(() -> { throw new RuntimeException("计算错误"); })
            .exceptionally(ex -> {
                System.out.println("7. exceptionally 捕获: " + ex.getMessage());
                return -1;
            })
            .join();
        System.out.println("   兜底返回: " + safe);

        // ===== 8. handle 成功失败都处理 =====
        String handled = CompletableFuture
            .supplyAsync(() -> { sleep(10); return 100; })
            .handle((v, ex) -> ex != null ? "异常: " + ex.getMessage() : "成功: " + v)
            .join();
        System.out.println("8. handle 成功: " + handled);

        String handled2 = CompletableFuture
            .supplyAsync(() -> { throw new RuntimeException("失败"); })
            .handle((v, ex) -> ex != null ? "异常: " + ex.getMessage() : "成功: " + v)
            .join();
        System.out.println("   handle 失败: " + handled2);

        // ===== 9. thenApplyAsync 指定线程池 =====
        ExecutorService pool = Executors.newFixedThreadPool(2);
        String asyncResult = CompletableFuture
            .supplyAsync(() -> "data", pool)
            .thenApplyAsync(s -> s + " processed", pool)
            .thenApplyAsync(s -> s + " done", pool)
            .join();
        System.out.println("9. 指定线程池: " + asyncResult);
        pool.shutdown();
        pool.awaitTermination(1, TimeUnit.SECONDS);

        // ===== 10. 实战：多服务并行调用 =====
        long t0 = System.currentTimeMillis();
        CompletableFuture<String> userFuture = CompletableFuture.supplyAsync(() -> { sleep(20); return "用户A"; });
        CompletableFuture<String> orderFuture = CompletableFuture.supplyAsync(() -> { sleep(20); return "订单123"; });
        CompletableFuture<Integer> scoreFuture = CompletableFuture.supplyAsync(() -> { sleep(20); return 95; });

        String summary = userFuture
            .thenCombine(orderFuture, (u, o) -> u + " 的 " + o)
            .thenCombine(scoreFuture, (s, score) -> s + " 评分 " + score)
            .join();
        long total = System.currentTimeMillis() - t0;
        System.out.println("10. 并行调用结果: " + summary + "，耗时 " + total + " ms (并行约20ms)");

        System.out.println("\\n主线程结束");
    }

    private static void sleep(int ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}`
  },
  {
    id: "java-locks",
    group: "多线程与并发",
    icon: "🔑",
    title: "Lock 与 Condition",
    content: `# Lock 与 Condition

\`Lock\` 接口（JDK 5）是 synchronized 的替代方案，提供更灵活的锁控制。\`ReentrantLock\` 是其最常用的实现。

## Lock 接口

\`\`\`java
void lock();             // 阻塞获取锁
void lockInterruptibly() // 可中断地获取锁（响应 interrupt）
boolean tryLock();       // 尝试获取，立即返回
boolean tryLock(time, unit); // 带超时尝试
void unlock();           // 释放锁（必须在 finally 中调用）
Condition newCondition(); // 创建条件变量
\`\`\`

## ReentrantLock

可重入互斥锁，功能与 synchronized 类似，但更灵活：

\`\`\`java
private final ReentrantLock lock = new ReentrantLock();
public void method() {
    lock.lock();
    try {
        // 临界区
    } finally {
        lock.unlock(); // 必须在 finally 释放！
    }
}
\`\`\`

**关键**：unlock 必须在 finally 中，否则异常时锁不会释放导致死锁。这是与 synchronized（自动释放）的最大区别。

## 公平锁与非公平锁

\`\`\`java
new ReentrantLock(true);  // 公平锁：按等待顺序获取
new ReentrantLock(false); // 非公平锁（默认）：允许插队
\`\`\`

- **公平锁**：避免饥饿，但吞吐量低（线程切换开销）
- **非公平锁**：吞吐量高，但可能导致某线程长时间等待

synchronized 是非公平的。

## tryLock 非阻塞获取

\`\`\`java
if (lock.tryLock()) {
    try { /* 获得锁 */ } finally { lock.unlock(); }
} else {
    /* 未获得锁，做其他事 */
}
\`\`\`

\`tryLock(timeout)\` 带超时，避免死锁。

## Condition 条件变量

\`Condition\` 替代 \`Object.wait/notify\`，一个 Lock 可创建多个 Condition，实现精细的等待/通知：

\`\`\`java
Lock lock = new ReentrantLock();
Condition notFull = lock.newCondition();
Condition notEmpty = lock.newCondition();

// 生产者
lock.lock();
try {
    while (queue.isFull()) notFull.await(); // 等待非满
    queue.add(x);
    notEmpty.signal(); // 通知消费者
} finally { lock.unlock(); }
\`\`\`

\`await/signal/signalAll\` 必须在持有锁时调用，与 wait/notify 一致。

## Condition vs wait/notify

| 特性 | Condition | wait/notify |
|------|-----------|-------------|
| 条件数 | 多个 | 一个 |
| 关联 | Lock | synchronized |
| 超时 | 支持且更灵活 | 支持 |
| 不响应中断 | awaitUninterruptibly | 不支持 |

## ReentrantReadWriteLock

读写锁：读读共享，读写互斥，写写互斥。适合读多写少场景：

\`\`\`java
ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
rwLock.readLock().lock();  // 读锁，多线程可同时持有
rwLock.writeLock().lock(); // 写锁，独占
\`\`\`

##StampedLock（JDK 8）

乐观读锁，性能更高：

\`\`\`java
long stamp = stampedLock.tryOptimisticRead(); // 乐观读
// 读数据
if (!stampedLock.validate(stamp)) { // 校验期间是否有写
    stamp = stampedLock.readLock(); // 升级为悲观读
    try { /* 重新读 */ } finally { stampedLock.unlockRead(stamp); }
}
\`\`\`

## 锁的选择

- 简单同步 → synchronized（简洁，自动释放）
- 需要超时/中断/公平 → ReentrantLock
- 读多写少 → ReentrantReadWriteLock
- 极致读性能 → StampedLock

下面通过代码演示 ReentrantLock、tryLock、Condition 的用法：`,
    code: `// 演示 ReentrantLock 与 Condition
import java.util.LinkedList;
import java.util.Queue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 1. ReentrantLock 基本用法 =====
        ReentrantLock lock = new ReentrantLock();
        AtomicInteger count = new AtomicInteger(0);

        Runnable task = () -> {
            for (int i = 0; i < 1000; i++) {
                lock.lock();
                try {
                    count.incrementAndGet();
                } finally {
                    lock.unlock();
                }
            }
        };
        Thread[] threads = new Thread[5];
        for (int i = 0; i < 5; i++) {
            threads[i] = new Thread(task, "t" + i);
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("1. ReentrantLock 5x1000: " + count.get() + " (应为5000)");

        // ===== 2. 可重入性 =====
        lock.lock();
        try {
            System.out.println("2. 持有锁，holdCount=" + lock.getHoldCount());
            lock.lock(); // 再次获取（可重入）
            try {
                System.out.println("   再次获取，holdCount=" + lock.getHoldCount());
            } finally { lock.unlock(); }
            System.out.println("   释放一次，holdCount=" + lock.getHoldCount());
        } finally { lock.unlock(); }

        // ===== 3. tryLock 非阻塞尝试 =====
        ReentrantLock lock2 = new ReentrantLock();
        Thread holder = new Thread(() -> {
            lock2.lock();
            try { Thread.sleep(50); } catch (InterruptedException e) { } finally { lock2.unlock(); }
        }, "holder");
        holder.start();
        Thread.sleep(10); // 等 holder 拿到锁

        boolean got = lock2.tryLock();
        System.out.println("3. tryLock (锁被占用): " + got);
        boolean got2 = lock2.tryLock(100, TimeUnit.MILLISECONDS);
        System.out.println("   tryLock(100ms) 等待结果: " + got2);
        if (got2) lock2.unlock();
        holder.join();

        // ===== 4. 公平锁 vs 非公平锁 =====
        ReentrantLock fairLock = new ReentrantLock(true);
        AtomicInteger order = new AtomicInteger(0);
        Runnable fairTask = () -> {
            for (int i = 0; i < 2; i++) {
                fairLock.lock();
                try {
                    System.out.println("   公平锁获取: " + Thread.currentThread().getName()
                        + " 第" + order.incrementAndGet() + "次");
                } finally { fairLock.unlock(); }
                try { Thread.sleep(1); } catch (InterruptedException e) { }
            }
        };
        Thread f1 = new Thread(fairTask, "FairA");
        Thread f2 = new Thread(fairTask, "FairB");
        f1.start(); f2.start();
        f1.join(); f2.join();

        // ===== 5. Condition 实现生产者-消费者 =====
        ConditionBuffer buffer = new ConditionBuffer(3);
        AtomicInteger produced = new AtomicInteger(0);
        AtomicInteger consumed = new AtomicInteger(0);

        Thread producer = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                try { buffer.put(i); produced.incrementAndGet(); Thread.sleep(5); } catch (InterruptedException e) { return; }
            }
        }, "生产者");
        Thread consumer = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                try { buffer.take(); consumed.incrementAndGet(); Thread.sleep(10); } catch (InterruptedException e) { return; }
            }
        }, "消费者");
        producer.start(); consumer.start();
        producer.join(); consumer.join();
        System.out.println("5. Condition 缓冲区剩余: " + buffer.size()
            + " 生产=" + produced.get() + " 消费=" + consumed.get());

        // ===== 6. 读写锁 =====
        ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
        AtomicInteger readers = new AtomicInteger(0);
        Runnable reader = () -> {
            rwLock.readLock().lock();
            try {
                int n = readers.incrementAndGet();
                System.out.println("6. 读锁并发数: " + n);
                Thread.sleep(20);
                readers.decrementAndGet();
            } catch (InterruptedException e) { } finally { rwLock.readLock().unlock(); }
        };
        Thread r1 = new Thread(reader, "R1");
        Thread r2 = new Thread(reader, "R2");
        r1.start(); r2.start();
        r1.join(); r2.join();
        System.out.println("   读写锁: 多个读线程可同时持有读锁");

        // ===== 7. lockInterruptibly 可中断获取 =====
        ReentrantLock lock3 = new ReentrantLock();
        lock3.lock(); // 主线程持有
        AtomicInteger interrupted = new AtomicInteger(0);
        Thread waitThread = new Thread(() -> {
            try {
                lock3.lockInterruptibly();
                lock3.unlock();
            } catch (InterruptedException e) {
                interrupted.set(1);
            }
        }, "interruptible");
        waitThread.start();
        Thread.sleep(20);
        waitThread.interrupt(); // 中断等待
        waitThread.join();
        lock3.unlock();
        System.out.println("7. lockInterruptibly 响应中断: " + interrupted.get() + " (应为1)");

        System.out.println("\\n主线程结束");
    }
}

// 非公开辅助类：基于 Condition 的缓冲区
class ConditionBuffer {
    private final Queue<Integer> queue = new LinkedList<>();
    private final int capacity;
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();

    ConditionBuffer(int capacity) { this.capacity = capacity; }

    public void put(int x) throws InterruptedException {
        lock.lock();
        try {
            while (queue.size() == capacity) {
                System.out.println("  [生产者] 缓冲区满，等待");
                notFull.await();
            }
            queue.offer(x);
            System.out.println("  [生产者] 放入 " + x + "，大小=" + queue.size());
            notEmpty.signal();
        } finally { lock.unlock(); }
    }

    public int take() throws InterruptedException {
        lock.lock();
        try {
            while (queue.isEmpty()) {
                System.out.println("  [消费者] 缓冲区空，等待");
                notEmpty.await();
            }
            int x = queue.poll();
            System.out.println("  [消费者] 取出 " + x + "，大小=" + queue.size());
            notFull.signal();
            return x;
        } finally { lock.unlock(); }
    }

    public int size() {
        lock.lock();
        try { return queue.size(); } finally { lock.unlock(); }
    }
}`
  },
  {
    id: "java-atomic",
    group: "多线程与并发",
    icon: "⚛️",
    title: "原子类",
    content: `# 原子类

\`java.util.concurrent.atomic\` 包提供了一系列基于 CAS（Compare-And-Swap）的原子操作类，用于无锁线程安全编程。

## CAS 原理

CAS 是原子类的核心，是一条 CPU 原子指令（x86 的 \`cmpxchg\`）。语义：

\`\`\`
if (内存值 == 期望值) {
    内存值 = 新值;
    return true;
}
return false;
\`\`\`

整个过程不可中断。Java 通过 \`Unsafe.compareAndSwapXxx\` 调用 native 实现。

\`\`\`java
AtomicInteger ai = new AtomicInteger(0);
boolean success = ai.compareAndSet(0, 1); // 期望0，设为1，返回 true
boolean fail = ai.compareAndSet(0, 2);    // 当前是1≠0，返回 false
\`\`\`

CAS 的"硬件级锁"比 synchronized 的"操作系统级锁"轻量得多。

## 基本类型原子类

- \`AtomicInteger\`
- \`AtomicLong\`
- \`AtomicBoolean\`

常用方法：

\`\`\`java
get()                      // 读取
set(v)                     // 写入
getAndSet(v)               // 返回旧值并设置新值
getAndIncrement()          // 返回旧值并+1（i++）
incrementAndGet()          // +1 并返回新值（++i）
getAndAdd(delta)           // 返回旧值并加 delta
addAndGet(delta)           // 加 delta 并返回新值
compareAndSet(expect, update) // CAS
\`\`\`

## 引用类型原子类

- \`AtomicReference<V>\`：引用类型
- \`AtomicStampedReference<V>\`：带版本号，解决 ABA 问题
- \`AtomicMarkableReference<V>\`：带布尔标记

## 数组类型

\`AtomicIntegerArray\`、\`AtomicLongArray\`、\`AtomicReferenceArray<E>\`：对数组元素的原子操作。

## 字段更新器

\`AtomicIntegerFieldUpdater\`、\`AtomicLongFieldUpdater\`、\`AtomicReferenceFieldUpdater\`：对类的 volatile 字段做原子更新，避免每个对象都创建 Atomic 对象的开销。

\`\`\`java
class Person {
    volatile int age;
}
AtomicIntegerFieldUpdater<Person> u =
    AtomicIntegerFieldUpdater.newUpdater(Person.class, "age");
u.incrementAndGet(person);
\`\`\`

## 累加器（JDK 8+）

\`LongAdder\`、\`DoubleAdder\`：高并发下比 AtomicLong 性能更好。原理是分散热点到多个 Cell，最后求和。适合统计计数，不适合需要精确读取中间值的场景。

\`LongAccumulator\`、\`DoubleAccumulator\`：可自定义累加函数。

## ABA 问题

CAS 只比较值，若值从 A→B→A，CAS 认为没变，但实际已变化。一般场景无影响，但栈/链表操作可能出错。

解决方案：\`AtomicStampedReference\` 加版本号，每次操作版本号+1。

## 优缺点

**优点**：
- 无锁，无阻塞，性能高
- 无死锁、无优先级反转

**缺点**：
- 竞争激烈时自旋浪费 CPU
- 只能保证单个变量原子
- ABA 问题

## vs synchronized

| 场景 | 推荐 |
|------|------|
| 单个计数器 | AtomicXxx |
| 复合操作 | synchronized/Lock |
| 高并发统计 | LongAdder |
| 需要等待/通知 | Lock + Condition |

下面通过代码演示各类原子类的用法：`,
    code: `// 演示原子类的用法
import java.util.concurrent.atomic.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 1. AtomicInteger 基本操作 =====
        AtomicInteger ai = new AtomicInteger(10);
        System.out.println("1. 初始值: " + ai.get());
        System.out.println("   getAndIncrement (i++): " + ai.getAndIncrement() + " 后=" + ai.get());
        System.out.println("   incrementAndGet (++i): " + ai.incrementAndGet() + " 后=" + ai.get());
        System.out.println("   getAndAdd(5): " + ai.getAndAdd(5) + " 后=" + ai.get());
        System.out.println("   addAndGet(5): " + ai.addAndGet(5));
        System.out.println("   compareAndSet(22, 100): " + ai.compareAndSet(22, 100) + " 后=" + ai.get());
        System.out.println("   compareAndSet(22, 200): " + ai.compareAndSet(22, 200) + " 后=" + ai.get());
        System.out.println();

        // ===== 2. 多线程自增：AtomicInteger vs 普通 int =====
        AtomicInteger atomicCount = new AtomicInteger(0);
        int[] plainCount = {0};
        Thread[] threads = new Thread[5];
        for (int i = 0; i < 5; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 10000; j++) {
                    atomicCount.incrementAndGet(); // 原子安全
                    plainCount[0]++; // 非线程安全
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("2. AtomicInteger: " + atomicCount.get() + " (应为50000)");
        System.out.println("   普通 int[]: " + plainCount[0] + " (通常<50000)\\n");

        // ===== 3. AtomicReference =====
        AtomicReference<String> ref = new AtomicReference<>("A");
        System.out.println("3. AtomicReference 初始: " + ref.get());
        ref.set("B");
        System.out.println("   set('B'): " + ref.get());
        String old = ref.getAndSet("C");
        System.out.println("   getAndSet('C'): 旧=" + old + " 新=" + ref.get());
        boolean ok = ref.compareAndSet("C", "D");
        System.out.println("   CAS(C→D): " + ok + " 当前=" + ref.get());
        System.out.println();

        // ===== 4. AtomicStampedReference 解决 ABA =====
        AtomicStampedReference<Integer> stamped = new AtomicStampedReference<>(100, 0);
        int[] stampHolder = new int[1];
        Integer val = stamped.get(stampHolder);
        int stamp = stampHolder[0];
        System.out.println("4. 初始: 值=" + val + " 版本=" + stamp);

        // 模拟 ABA
        stamped.compareAndSet(100, 200, stamp, stamp + 1);
        stamped.compareAndSet(200, 100, stamp + 1, stamp + 2);
        System.out.println("   ABA 后: 值=" + stamped.getReference() + " 版本=" + stamped.getStamp());

        // 用旧版本号 CAS 会失败
        boolean success = stamped.compareAndSet(100, 300, stamp, stamp + 1);
        System.out.println("   用旧版本号 CAS 失败: " + !success);
        // 用新版本号成功
        boolean success2 = stamped.compareAndSet(100, 300, stamped.getStamp(), stamped.getStamp() + 1);
        System.out.println("   用新版本号 CAS 成功: " + success2 + " 值=" + stamped.getReference());
        System.out.println();

        // ===== 5. AtomicIntegerArray =====
        AtomicIntegerArray arr = new AtomicIntegerArray(5);
        arr.set(0, 10);
        arr.getAndIncrement(0);
        System.out.println("5. 数组[0]: " + arr.get(0));
        arr.getAndAdd(1, 5);
        System.out.println("   数组[1]: " + arr.get(1));
        System.out.println();

        // ===== 6. LongAdder 高并发累加 =====
        LongAdder adder = new LongAdder();
        for (int i = 0; i < 5; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 10000; j++) adder.increment();
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("6. LongAdder 5x10000: " + adder.sum() + " (应为50000)");

        // ===== 7. LongAccumulator 自定义累加 =====
        LongAccumulator maxAcc = new LongAccumulator(Long::max, Long.MIN_VALUE);
        long[] values = {5, 3, 8, 1, 9, 2};
        for (long v : values) maxAcc.accumulate(v);
        System.out.println("7. LongAccumulator 求最大值: " + maxAcc.get() + " (应为9)\\n");

        // ===== 8. AtomicIntegerFieldUpdater =====
        class Counter {
            volatile int count = 0;
        }
        AtomicIntegerFieldUpdater<Counter> updater =
            AtomicIntegerFieldUpdater.newUpdater(Counter.class, "count");
        Counter c = new Counter();
        updater.incrementAndGet(c);
        updater.addAndGet(c, 10);
        System.out.println("8. FieldUpdater 更新 count: " + c.count);

        // ===== 9. 性能对比：AtomicLong vs LongAdder =====
        int n = 5;
        int loop = 50000;
        AtomicLong al = new AtomicLong(0);
        long t1 = System.nanoTime();
        for (int i = 0; i < n; i++) {
            threads[i] = new Thread(() -> { for (int j = 0; j < loop; j++) al.incrementAndGet(); });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        long t2 = System.nanoTime();

        LongAdder la = new LongAdder();
        long t3 = System.nanoTime();
        for (int i = 0; i < n; i++) {
            threads[i] = new Thread(() -> { for (int j = 0; j < loop; j++) la.increment(); });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        long t4 = System.nanoTime();

        System.out.println("9. AtomicLong " + (n*loop) + " 次自增: " + (t2-t1)/1_000_000 + " ms");
        System.out.println("   LongAdder " + (n*loop) + " 次自增: " + (t4-t3)/1_000_000 + " ms");
        System.out.println("\\n主线程结束");
    }
}`
  },
  {
    id: "java-thread-local",
    group: "多线程与并发",
    icon: "📍",
    title: "ThreadLocal",
    content: `# ThreadLocal

\`ThreadLocal\` 提供线程局部变量：每个线程独立持有一份副本，互不影响，天然避免竞态条件。

## 基本用法

\`\`\`java
ThreadLocal<SimpleDateFormat> fmt = ThreadLocal.withInitial(
    () -> new SimpleDateFormat("yyyy-MM-dd"));

String s = fmt.get().format(new Date()); // 每个线程独立实例
fmt.set(new SimpleDateFormat("HH:mm"));   // 替换当前线程的副本
fmt.remove();                              // 清除当前线程的副本
\`\`\`

## 核心方法

| 方法 | 说明 |
|------|------|
| get() | 获取当前线程的副本 |
| set(v) | 设置当前线程的副本 |
| remove() | 移除当前线程的副本 |
| withInitial(supplier) | 创建带初始值的 ThreadLocal |

## 实现原理

每个 \`Thread\` 对象内部有一个 \`ThreadLocalMap\` 字段：

\`\`\`java
class Thread {
    ThreadLocal.ThreadLocalMap threadLocals;
}
\`\`\`

\`ThreadLocalMap\` 是 ThreadLocal 内部类，类似 HashMap，但：

- **Key 是 ThreadLocal 的弱引用**（WeakReference）
- **Value 是强引用**
- 采用开放寻址法解决冲突

调用 \`threadLocal.get()\` 实际是访问 \`当前线程.threadLocals.get(threadLocal)\`。

## initialValue 与 withInitial

\`\`\`java
// 方式一：继承重写
ThreadLocal<Integer> tl = new ThreadLocal<>() {
    @Override protected Integer initialValue() { return 0; }
};

// 方式二：lambda（推荐）
ThreadLocal<Integer> tl2 = ThreadLocal.withInitial(() -> 0);
\`\`\`

首次调用 get() 时若不存在，会调用 initialValue 初始化。

## 典型应用

### 1. 线程安全的 SimpleDateFormat

SimpleDateFormat 非线程安全，多线程共享会出错：

\`\`\`java
// 错误：共享实例
private static final SimpleDateFormat FMT = new SimpleDateFormat("yyyy-MM-dd");

// 正确：每线程独立实例
private static final ThreadLocal<SimpleDateFormat> FMT =
    ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));
\`\`\`

### 2. 用户上下文传递

Web 请求处理中，过滤器解析用户信息存入 ThreadLocal，后续 Service 直接取用，避免参数层层传递：

\`\`\`java
public class UserContext {
    private static final ThreadLocal<User> CURRENT = new ThreadLocal<>();
    public static User get() { return CURRENT.get(); }
    public static void set(User u) { CURRENT.set(u); }
    public static void clear() { CURRENT.remove(); }
}
\`\`\`

### 3. 数据库连接/事务

每个线程持有独立 Connection，事务互不干扰。

## 内存泄漏问题

ThreadLocalMap 的 Key 是弱引用，Value 是强引用：

- ThreadLocal 实例无强引用时，Key 被回收变为 null
- 但 Value 仍被 ThreadLocalMap 强引用，无法回收
- 线程长期存活（如线程池），Value 永不回收 → 内存泄漏

**解决**：使用完毕**务必调用 remove()**！

\`\`\`java
try {
    threadLocal.set(value);
    // 业务逻辑
} finally {
    threadLocal.remove(); // 关键！
}
\`\`\`

## InheritableThreadLocal

子线程可继承父线程的值：

\`\`\`java
InheritableThreadLocal<String> itl = new InheritableThreadLocal<>();
itl.set("父线程值");
new Thread(() -> System.out.println(itl.get())).start(); // "父线程值"
\`\`\`

但线程池中线程复用，无法继承，需用 \`TransmittableThreadLocal\`（阿里开源）。

## 使用注意

- ThreadLocal 不是为了解决共享对象的线程安全，而是避免共享
- 必须在 finally 中 remove，防止内存泄漏和线程池场景的脏数据
- 不要用 ThreadLocal 传递业务数据，应通过参数

下面通过代码演示 ThreadLocal 的用法与内存泄漏防护：`,
    code: `// 演示 ThreadLocal 的用法
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.*;

public class Main {
    // ThreadLocal 持有 SimpleDateFormat（线程安全）
    private static final ThreadLocal<SimpleDateFormat> FMT =
        ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));

    // 用户上下文
    private static final ThreadLocal<String> USER_CTX = new ThreadLocal<>();

    // 计数 ThreadLocal
    private static final ThreadLocal<Integer> COUNTER = ThreadLocal.withInitial(() -> 0);

    public static void main(String[] args) throws Exception {
        // ===== 1. 基本 get/set/remove =====
        System.out.println("1. 初始值: " + COUNTER.get());
        COUNTER.set(10);
        System.out.println("   set(10) 后: " + COUNTER.get());
        COUNTER.remove();
        System.out.println("   remove 后（回到初始值）: " + COUNTER.get());
        System.out.println();

        // ===== 2. 各线程独立副本 =====
        AtomicInteger idGen = new AtomicInteger(0);
        Thread[] threads = new Thread[3];
        for (int i = 0; i < 3; i++) {
            threads[i] = new Thread(() -> {
                int id = idGen.incrementAndGet();
                COUNTER.set(id); // 每个线程设不同值
                try { Thread.sleep(10); } catch (InterruptedException e) { }
                System.out.println("2. " + Thread.currentThread().getName() + " 的 COUNTER=" + COUNTER.get());
                COUNTER.remove();
            }, "thread-" + i);
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("   主线程 COUNTER=" + COUNTER.get() + " (各线程互不影响)\\n");

        // ===== 3. SimpleDateFormat 线程安全 =====
        Runnable formatTask = () -> {
            String s = FMT.get().format(new Date());
            System.out.println("3. " + Thread.currentThread().getName() + " 格式化: " + s);
        };
        ExecutorService pool = Executors.newFixedThreadPool(3);
        for (int i = 0; i < 3; i++) pool.execute(formatTask);
        pool.shutdown();
        pool.awaitTermination(1, TimeUnit.SECONDS);
        System.out.println();

        // ===== 4. 用户上下文传递模式 =====
        Runnable serviceTask = () -> {
            try {
                String user = USER_CTX.get();
                System.out.println("4. " + Thread.currentThread().getName() + " 处理用户: " + user);
                Thread.sleep(10);
                System.out.println("   " + Thread.currentThread().getName() + " 完成 " + user + " 的请求");
            } catch (InterruptedException e) { } finally {
                USER_CTX.remove(); // 关键：线程池场景必须清理
            }
        };
        ExecutorService pool2 = Executors.newFixedThreadPool(2);
        for (int i = 0; i < 3; i++) {
            final String user = "user" + i;
            pool2.execute(() -> {
                USER_CTX.set(user);
                try { serviceTask.run(); } finally { USER_CTX.remove(); }
            });
        }
        pool2.shutdown();
        pool2.awaitTermination(1, TimeUnit.SECONDS);
        System.out.println();

        // ===== 5. InheritableThreadLocal 子线程继承 =====
        InheritableThreadLocal<String> inheritable = new InheritableThreadLocal<>();
        inheritable.set("父线程数据");
        System.out.println("5. 父线程: " + inheritable.get());
        Thread child = new Thread(() -> {
            System.out.println("   子线程继承: " + inheritable.get());
        }, "child");
        child.start();
        child.join();
        System.out.println();

        // ===== 6. 演示线程池下 ThreadLocal 脏数据问题 =====
        ExecutorService pool3 = Executors.newFixedThreadPool(1);
        ThreadLocal<String> dirty = new ThreadLocal<>();
        // 第一个任务设置但不清理
        pool3.submit(() -> {
            dirty.set("脏数据");
            System.out.println("6. 任务1 设置脏数据");
        }).get();
        // 第二个任务读取（同一线程复用，可能读到脏数据）
        String leaked = pool3.submit(() -> dirty.get()).get();
        System.out.println("   任务2 读到: " + leaked + " (若未清理会读到脏数据!)");
        dirty.remove();
        pool3.shutdown();
        pool3.awaitTermination(1, TimeUnit.SECONDS);
        System.out.println("   教训: 线程池必须 remove()\\n");

        // ===== 7. 清理主线程的 ThreadLocal =====
        COUNTER.remove();
        USER_CTX.remove();

        System.out.println("主线程结束");
    }
}`
  },
  {
    id: "java-virtual-threads",
    group: "多线程与并发",
    icon: "🪶",
    title: "虚拟线程",
    content: `# 虚拟线程（Java 21+）

虚拟线程（Virtual Thread）是 JDK 21 正式引入的轻量级线程，由 JVM 调度而非操作系统。可轻松创建数百万个虚拟线程，极大简化高并发 I/O 编程。

## 平台线程 vs 虚拟线程

| 特性 | 平台线程 | 虚拟线程 |
|------|----------|----------|
| 实现 | 1:1 映射 OS 线程 | M:N 映射（多虚拟线程复用少量载体线程） |
| 内存 | 约 1-2 MB 栈 | 约 几 KB，按需分配 |
| 创建成本 | 高（系统调用） | 极低 |
| 数量上限 | 数千 | 数百万 |
| 调度 | OS 抢占式 | JVM 协作式 |
| 阻塞 | 阻塞 OS 线程 | 阻塞时让出载体线程（不浪费） |

## 创建虚拟线程

\`\`\`java
// 方式一：直接启动
Thread vt = Thread.startVirtualThread(() -> {
    System.out.println("虚拟线程: " + Thread.currentThread());
});

// 方式二：Builder
Thread vt2 = Thread.ofVirtual().name("my-vt").start(() -> { ... });

// 方式三：未启动
Thread vt3 = Thread.ofVirtual().unstarted(() -> { ... });
vt3.start();

// 判断是否虚拟线程
boolean isVirtual = Thread.currentThread().isVirtual();
\`\`\`

## 虚拟线程执行机制

虚拟线程运行在**载体线程（Carrier Thread）**上（来自 ForkJoinPool）。当虚拟线程执行阻塞 I/O（sleep、网络读、锁等待等）时，JVM 会**卸载（unmount）**它，让载体线程执行其他虚拟线程；I/O 完成后再**挂载（mount）**回来。

这意味着：阻塞操作不再浪费线程，可创建海量虚拟线程并发等待 I/O。

## 新每请求一线程模型

传统线程池模式下，线程数受限（如 200），高并发时请求排队。虚拟线程下可"每请求一虚拟线程"，代码写法像同步阻塞，性能接近异步回调：

\`\`\`java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    // 提交 10000 个任务，每个一个虚拟线程
    IntStream.range(0, 10000).forEach(i ->
        executor.submit(() -> {
            fetchUser(i);    // 阻塞 I/O，虚拟线程自动让出
            fetchOrder(i);   // 阻塞 I/O
            return null;
        })
    );
}
\`\`\`

代码是直观的同步写法，但底层是高并发异步执行。

## 适用场景

- **I/O 密集型**：网络请求、数据库查询、文件读写
- **高并发服务端**：每请求一虚拟线程
- **需要同步阻塞写法**：替代复杂的 CompletableFuture 链

## 不适用场景

- **CPU 密集型**：虚拟线程不增加 CPU 并行度，反而有调度开销，用平台线程池
- **需要限制并发数**：虚拟线程数量无上限，无法限制，需自行用 Semaphore
- **长时间持有 synchronized**：虚拟线程在 synchronized 块中无法卸载（JDK 21 限制），会"钉住"载体线程。建议用 ReentrantLock 替代

## 结构化并发（预览特性）

\`\`\`java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    var u = scope.fork(() -> fetchUser());
    var o = scope.fork(() -> fetchOrder());
    scope.join();              // 等待全部
    scope.throwIfFailed();     // 任一失败则抛异常
    // 全部成功，使用结果
}
\`\`\`

结构化并发让相关子任务作为整体管理：一起成功或一起失败，避免任务泄漏。（API 在不同 JDK 版本可能有变化，使用前请查阅当前版本文档。）

## 注意事项

- 虚拟线程是 **daemon** 线程（默认），主线程结束即退出
- 不要池化虚拟线程：用完即弃，创建成本极低
- ThreadLocal 在虚拟线程中慎用：百万虚拟线程各持有 ThreadLocal 副本会占用大量内存。JDK 21+ 有 \`ScopedValue\`（预览）替代
- 使用 \`Executors.newVirtualThreadPerTaskExecutor()\` 是推荐模式

下面通过代码演示虚拟线程的创建与高并发：`,
    code: `// 演示虚拟线程（Java 21+）
import java.time.Duration;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;

public class Main {
    public static void main(String[] args) throws Exception {
        // 检查是否支持虚拟线程
        boolean supported = isVirtualSupported();
        if (!supported) {
            System.out.println("当前 JDK 不支持虚拟线程，需要 Java 21+");
            System.out.println("运行平台线程模拟演示");
            runPlatformDemo();
            return;
        }
        runVirtualDemo();
    }

    private static boolean isVirtualSupported() {
        try {
            Thread.class.getMethod("ofVirtual");
            return true;
        } catch (NoSuchMethodException e) {
            return false;
        }
    }

    private static void runVirtualDemo() throws Exception {
        System.out.println("=== 虚拟线程演示 ===");
        System.out.println("主线程是否虚拟: " + Thread.currentThread().isVirtual());

        // ===== 1. 创建并启动虚拟线程 =====
        AtomicInteger done = new AtomicInteger(0);
        Thread vt = Thread.startVirtualThread(() -> {
            System.out.println("1. 虚拟线程运行: " + Thread.currentThread());
            System.out.println("   是否虚拟: " + Thread.currentThread().isVirtual());
            try { Thread.sleep(10); } catch (InterruptedException e) { }
            done.incrementAndGet();
        });
        vt.join();
        System.out.println("   完成: " + done.get() + "\\n");

        // ===== 2. Thread.ofVirtual().name().start() =====
        Thread vt2 = Thread.ofVirtual().name("my-virtual-1").start(() -> {
            System.out.println("2. 命名虚拟线程: " + Thread.currentThread().getName());
        });
        vt2.join();
        System.out.println();

        // ===== 3. 高并发：每任务一虚拟线程 =====
        long start = System.nanoTime();
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            AtomicInteger sum = new AtomicInteger(0);
            var futures = IntStream.range(0, 1000)
                .mapToObj(i -> executor.submit(() -> {
                    Thread.sleep(10); // 模拟 I/O
                    sum.incrementAndGet();
                    return i;
                }))
                .toList();
            // 等待全部完成
            for (var f : futures) f.get();
        }
        long elapsed = (System.nanoTime() - start) / 1_000_000;
        System.out.println("3. 1000 个虚拟线程各 sleep 10ms，总耗时: " + elapsed + " ms");
        System.out.println("   (并发执行，远小于 1000*10=10000ms)\\n");

        // ===== 4. 对比平台线程池处理同样任务 =====
        long start2 = System.nanoTime();
        try (var executor = Executors.newFixedThreadPool(100)) {
            var futures = IntStream.range(0, 1000)
                .mapToObj(i -> executor.submit(() -> {
                    Thread.sleep(10);
                    return i;
                }))
                .toList();
            for (var f : futures) f.get();
        }
        long elapsed2 = (System.nanoTime() - start2) / 1_000_000;
        System.out.println("4. 1000 任务用 100 平台线程池: " + elapsed2 + " ms");
        System.out.println("   (受线程数限制，约 10 批 * 10ms = 100ms)\\n");

        // ===== 5. 虚拟线程执行阻塞 I/O 不浪费载体线程 =====
        System.out.println("5. 虚拟线程阻塞时让出载体线程:");
        long start3 = System.nanoTime();
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            var f1 = executor.submit(() -> { Thread.sleep(50); return "A"; });
            var f2 = executor.submit(() -> { Thread.sleep(50); return "B"; });
            var f3 = executor.submit(() -> { Thread.sleep(50); return "C"; });
            System.out.println("   3 个虚拟线程各 sleep 50ms");
            System.out.println("   结果: " + f1.get() + f2.get() + f3.get());
        }
        long elapsed3 = (System.nanoTime() - start3) / 1_000_000;
        System.out.println("   总耗时: " + elapsed3 + " ms (并行约50ms)\\n");

        // ===== 6. 虚拟线程 + Semaphore 限流 =====
        System.out.println("6. 用 Semaphore 限制虚拟线程并发:");
        Semaphore sem = new Semaphore(3); // 最多 3 并发
        AtomicInteger active = new AtomicInteger(0);
        AtomicInteger maxActive = new AtomicInteger(0);
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            var futures = IntStream.range(0, 10).mapToObj(i -> executor.submit(() -> {
                sem.acquire();
                try {
                    int cur = active.incrementAndGet();
                    maxActive.accumulateAndGet(cur, Math::max);
                    Thread.sleep(10);
                    active.decrementAndGet();
                    return i;
                } finally { sem.release(); }
            })).toList();
            for (var f : futures) f.get();
        }
        System.out.println("   最大并发数: " + maxActive.get() + " (限制为3)\\n");

        System.out.println("虚拟线程演示结束");
    }

    private static void runPlatformDemo() throws Exception {
        // 平台线程模拟演示（兼容低版本 JDK）
        System.out.println("=== 平台线程演示（兼容模式） ===");
        AtomicInteger done = new AtomicInteger(0);
        Thread t = new Thread(() -> {
            System.out.println("1. 线程运行: " + Thread.currentThread().getName());
            try { Thread.sleep(10); } catch (InterruptedException e) { }
            done.incrementAndGet();
        }, "worker");
        t.start();
        t.join();
        System.out.println("   完成: " + done.get());

        long start = System.nanoTime();
        ExecutorService pool = Executors.newFixedThreadPool(100);
        AtomicInteger sum = new AtomicInteger(0);
        var futures = IntStream.range(0, 1000)
            .mapToObj(i -> pool.submit(() -> {
                try { Thread.sleep(10); } catch (InterruptedException e) { }
                sum.incrementAndGet();
                return i;
            }))
            .toList();
        for (var f : futures) f.get();
        pool.shutdown();
        pool.awaitTermination(1, TimeUnit.SECONDS);
        long elapsed = (System.nanoTime() - start) / 1_000_000;
        System.out.println("2. 1000 任务 100 平台线程池耗时: " + elapsed + " ms");
        System.out.println("   完成数: " + sum.get());
        System.out.println("提示: 升级到 Java 21+ 可使用虚拟线程获得更高并发");
        System.out.println("演示结束");
    }
}`
  }
];
