// =============================================================
// Java 精简版 —— 第 1 批章节（基础语法 4 章）
// -------------------------------------------------------------
//   js-basic       : 基础语法与数据类型
//   js-string      : 字符串与 StringBuilder
//   js-controlflow: 条件、循环与 switch
//   js-exception   : 异常处理与 try-with-resources
// ============================================================

export const chapters = [
  // =========================================================
  // 第 1 章：基础语法与数据类型
  // =========================================================
  {
    id: "js-basic",
    group: "基础语法",
    icon: "🌱",
    title: "基础语法与数据类型",
    content: `# 基础语法与数据类型

## 一、Java 程序骨架

每个 Java 程序都从 \`public class Main\` 开始，入口是 \`main\` 方法。

\`\`\`java
// public class: 类声明，类名必须与文件名一致
// Main: 类名（文件必须叫 Main.java）
public class Main {
    // main 方法：JVM 入口，固定签名
    // String[] args: 命令行参数数组
    public static void main(String[] args) {
        System.out.println("Hello Java");
    }
}
\`\`\`

**关键点：**
- \`public static void main(String[] args)\` 是固定签名，缺一不可
- \`System.out.println\` 换行输出，\`System.out.print\` 不换行
- 每条语句以 \`;\` 结尾

## 二、8 种基本类型

Java 是**强类型语言**，每个变量必须先声明类型。

| 类型 | 位数 | 默认值 | 范围 |
| --- | --- | --- | --- |
| byte | 8 | 0 | -128 ~ 127 |
| short | 16 | 0 | -32768 ~ 32767 |
| int | 32 | 0 | -2³¹ ~ 2³¹-1 |
| long | 64 | 0L | -2⁶³ ~ 2⁶³-1 |
| float | 32 | 0.0f | 单精度 |
| double | 64 | 0.0d | 双精度 |
| char | 16 | '\\u0000' | 0 ~ 65535 |
| boolean | - | false | true / false |

**重点：** 默认整数字面量是 \`int\`，小数是 \`double\`。给 \`long\` 赋大数要加 \`L\`，给 \`float\` 赋值要加 \`f\`。

## 三、Demo：类型与字面量

\`\`\`java
public class Main {
    public static void main(String[] args) {
        // ===== 1. 整数类型 =====
        // 字面量 100 默认是 int，赋给 long 自动 widening
        int a = 100;
        // 20_0000_0000 超过 int 范围，必须加 L
        long big = 20_0000_0000L;
        System.out.println("a = " + a);
        System.out.println("big = " + big);

        // ===== 2. 浮点类型 =====
        // 3.14 默认是 double，赋给 float 要加 f
        double d = 3.14;
        float f = 3.14f;
        System.out.println("d = " + d);
        System.out.println("f = " + f);

        // ===== 3. char 与 int 互转 =====
        char c = 'A';
        // char 本质是 16 位无符号整数
        int code = c;        // widening: 65
        char next = (char)(c + 1);  // narrowing: 需强制转换
        System.out.println("A 的码点 = " + code);
        System.out.println("下一个字符 = " + next);

        // ===== 4. boolean =====
        boolean ok = true;
        if (ok) System.out.println("通过");

        // ===== 5. 类型转换陷阱 =====
        // int / int 结果仍是 int，会截断小数部分
        int x = 5, y = 2;
        System.out.println("5 / 2 = " + (x / y));        // 2
        // 至少有一方是 double 才会得到 2.5
        System.out.println("5 / 2.0 = " + (x / (double)y));  // 2.5
    }
}
\`\`\`

## 四、var 局部变量推断（Java 10+）

\`\`\`java
var list = new java.util.ArrayList<String>();  // 编译期推断为 ArrayList<String>
var name = "Tom";  // String
\`\`\`

注意：\`var\` 只能用于**局部变量**，不能用于字段、方法参数、返回值。编译期确定类型，不影响性能。

## 五、小结

- 8 种基本类型 + 强类型，类型转换要小心截断
- 整数默认 int、小数默认 double
- Java 10+ 可用 \`var\` 简化局部变量声明`,
  },

  // =========================================================
  // 第 2 章：字符串与 StringBuilder
  // =========================================================
  {
    id: "js-string",
    group: "基础语法",
    icon: "🔤",
    title: "字符串与 StringBuilder",
    content: `# 字符串与 StringBuilder

## 一、String 是不可变对象

Java 的 \`String\` 一旦创建就**不可改变**。任何"修改"操作都会生成新对象。

\`\`\`java
String s = "abc";
s = s + "def";   // 不是修改 s，而是新建 "abcdef" 让 s 指向它
\`\`\`

**好处：** 线程安全、可缓存 hash、可安全做 Map 的 key。

## 二、字符串常量池

\`\`\`java
// 字面量优先复用常量池里的对象
String a = "hello";
String b = "hello";
System.out.println(a == b);     // true，同一对象

// new 一定在堆里创建新对象
String c = new String("hello");
System.out.println(a == c);      // false
System.out.println(a.equals(c)); // true，内容相等
\`\`\`

**规则：** 永远用 \`.equals()\` 比较字符串内容，不要用 \`==\`（除非确定想比较引用）。

## 三、Demo：常用 API

\`\`\`java
public class Main {
    public static void main(String[] args) {
        String s = "Hello, Java";

        // ===== 1. 长度、索引、子串 =====
        System.out.println("长度: " + s.length());
        System.out.println("第 7 个字符: " + s.charAt(7));
        // substring(begin, end)：左闭右开
        System.out.println("子串 [0..5): " + s.substring(0, 5));

        // ===== 2. 查找 =====
        System.out.println("Java 位置: " + s.indexOf("Java"));
        System.out.println("是否以 Hello 开头: " + s.startsWith("Hello"));

        // ===== 3. 大小写转换 =====
        System.out.println("大写: " + s.toUpperCase());
        System.out.println("小写: " + s.toLowerCase());

        // ===== 4. 分割与连接 =====
        String[] parts = "a,b,c".split(",");
        // String.join: 用指定分隔符连接
        System.out.println(String.join("-", parts));

        // ===== 5. 格式化 =====
        // %d 整数 %s 字符串 %.2f 浮点 2 位小数
        String fmt = String.format("name=%s, age=%d, pi=%.2f", "Tom", 18, 3.14159);
        System.out.println(fmt);

        // ===== 6. 去空白 =====
        // strip() 处理 Unicode 空白，trim() 只处理 ASCII 空白
        System.out.println("[" + "  hi  ".strip() + "]");
    }
}
\`\`\`

## 四、StringBuilder：可变字符串

频繁拼接字符串时，\`+\` 会创建大量临时对象，性能差。用 \`StringBuilder\` 在原对象上修改。

\`\`\`java
public class Main {
    public static void main(String[] args) {
        // 频繁修改用 StringBuilder，避免每次拼接都 new String
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < 5; i++) {
            // append 直接在原 char[] 上扩容，不新建对象
            sb.append(i).append(",");
        }
        // 删掉最后一个多余的逗号
        sb.deleteCharAt(sb.length() - 1);
        String result = sb.toString();
        System.out.println(result);

        // 链式调用：每个方法都返回 this
        String msg = new StringBuilder()
            .append("用户 ")
            .append("Tom")
            .append(" 登录")
            .toString();
        System.out.println(msg);
    }
}
\`\`\`

**单线程用 \`StringBuilder\`，多线程用 \`StringBuffer\`**（同步，性能差一点）。

## 五、字符串与数字互转

\`\`\`java
// 字符串 → 数字
int n = Integer.parseInt("123");
double d = Double.parseDouble("3.14");

// 数字 → 字符串
String s1 = String.valueOf(123);
String s2 = Integer.toString(123);
String s3 = 123 + "";   // 简便写法
\`\`\`

## 六、小结

- String 不可变，\`+\` 拼接会建新对象
- 比较内容用 \`equals\`，不用 \`==\`
- 频繁拼接用 \`StringBuilder\`
- \`Integer.parseInt\` / \`String.valueOf\` 实现字符串与数字互转`,
  },

  // =========================================================
  // 第 3 章：条件、循环与 switch
  // =========================================================
  {
    id: "js-controlflow",
    group: "基础语法",
    icon: "🔀",
    title: "条件、循环与 switch",
    content: `# 条件、循环与 switch

## 一、条件语句

\`\`\`java
int score = 85;

if (score >= 90) {
    System.out.println("A");
} else if (score >= 80) {
    System.out.println("B");
} else if (score >= 60) {
    System.out.println("C");
} else {
    System.out.println("F");
}
\`\`\`

**三元运算符：** \`条件 ? 值1 : 值2\`

\`\`\`java
String level = (score >= 60) ? "及格" : "不及格";
\`\`\`

## 二、switch 表达式（Java 14+）

Java 14 起 switch 升级为表达式，可用 \`->\` 箭头语法，**自动不穿透**，可直接返回值。

\`\`\`java
public class Main {
    public static void main(String[] args) {
        String day = "MON";

        // 老写法：必须 break，否则穿透
        switch (day) {
            case "SAT":
            case "SUN":
                System.out.println("周末");
                break;
            default:
                System.out.println("工作日");
        }

        // 新写法（Java 14+）：箭头语法 + yield 返回值
        String type = switch (day) {
            case "SAT", "SUN" -> "周末";
            default -> "工作日";
        };
        System.out.println("type = " + type);

        // 复杂分支用 yield 返回值
        int num = 3;
        String evenOrOdd = switch (num) {
            case 2, 4, 6, 8 -> "偶数";
            case 1, 3, 5, 7 -> "奇数";
            default -> {
                // 多条语句时用 yield 显式返回
                String r = "未知：" + num;
                yield r;
            }
        };
        System.out.println(evenOrOdd);
    }
}
\`\`\`

## 三、for 循环

\`\`\`java
public class Main {
    public static void main(String[] args) {
        // 普通 for
        int sum = 0;
        for (int i = 1; i <= 10; i++) {
            sum += i;
        }
        System.out.println("1+2+...+10 = " + sum);

        // 增强 for（遍历集合/数组）
        int[] arr = {10, 20, 30};
        for (int x : arr) {
            System.out.println("元素: " + x);
        }

        // 遍历 List
        java.util.List<String> list = java.util.List.of("A", "B", "C");
        for (String s : list) {
            System.out.println(s);
        }
    }
}
\`\`\`

## 四、while 与 do-while

\`\`\`java
// while：先判断后执行
int i = 0;
while (i < 3) {
    System.out.println("while " + i);
    i++;
}

// do-while：先执行后判断，至少跑一次
int j = 0;
do {
    System.out.println("do " + j);
    j++;
} while (j < 0);  // 即使条件不成立，也跑一次
\`\`\`

## 五、break / continue / 标签

\`\`\`java
public class Main {
    public static void main(String[] args) {
        // break 跳出循环
        for (int i = 0; i < 5; i++) {
            if (i == 3) break;
            System.out.println("i=" + i);
        }

        // continue 跳过本次
        for (int i = 0; i < 5; i++) {
            if (i % 2 == 0) continue;
            System.out.println("奇数: " + i);
        }

        // 标签：直接跳出多层循环
        outer:
        for (int x = 0; x < 3; x++) {
            for (int y = 0; y < 3; y++) {
                if (x == 1 && y == 1) break outer;
                System.out.println("(" + x + "," + y + ")");
            }
        }
    }
}
\`\`\`

## 六、小结

- switch 表达式（Java 14+）简洁不穿透，可用 \`yield\` 返回
- 增强 for 用于遍历集合/数组
- \`break label\` 可跳出多层循环（少用，可读性差）`,
  },

  // =========================================================
  // 第 4 章：异常处理与 try-with-resources
  // =========================================================
  {
    id: "js-exception",
    group: "基础语法",
    icon: "⚠️",
    title: "异常处理与 try-with-resources",
    content: `# 异常处理与 try-with-resources

## 一、异常体系

\`\`\`
Throwable
├── Error            → JVM 错误（OOM、StackOverflow），不要 catch
└── Exception
    ├── RuntimeException  → 未受检异常（NullPointerException 等）
    └── 其他 Exception   → 受检异常（IOException 等），必须处理
\`\`\`

**受检异常**（checked）：编译器强制要求 \`try-catch\` 或 \`throws\` 声明。
**未受检异常**（unchecked / \`RuntimeException\`）：编译器不强制，常见：\`NullPointerException\`、\`IndexOutOfBoundsException\`、\`IllegalArgumentException\`。

## 二、try-catch-finally

\`\`\`java
public class Main {
    public static void main(String[] args) {
        try {
            int[] arr = new int[3];
            // 越界访问
            System.out.println(arr[5]);
        } catch (ArrayIndexOutOfBoundsException e) {
            // 捕获具体异常
            System.out.println("数组越界: " + e.getMessage());
        } catch (Exception e) {
            // 父类异常放后面
            System.out.println("其他异常: " + e);
        } finally {
            // 无论是否异常都会执行（清理资源、关连接）
            System.out.println("finally 执行");
        }
    }
}
\`\`\`

**注意：**
- catch 顺序：子类在前，父类在后
- finally 一定执行（即使 try 里 return 了，先执行 finally 再返回）

## 三、throws 与 throw

\`\`\`java
public class Main {

    // throws: 方法签名声明可能抛出的受检异常
    // 调用者必须处理或继续声明
    static void readFile() throws java.io.IOException {
        // throw: 主动抛出异常对象
        if (true) {
            throw new java.io.IOException("文件不存在");
        }
    }

    public static void main(String[] args) {
        try {
            readFile();
        } catch (java.io.IOException e) {
            System.out.println("捕获到: " + e.getMessage());
        }
    }
}
\`\`\`

## 四、自定义异常

\`\`\`java
// 自定义业务异常：继承 RuntimeException 即为未受检异常
class BizException extends RuntimeException {
    public BizException(String msg) {
        super(msg);
    }
}

public class Main {
    static void withdraw(int amount) {
        if (amount <= 0) {
            // 抛自定义异常
            throw new BizException("取款金额必须 > 0");
        }
        System.out.println("取款 " + amount);
    }

    public static void main(String[] args) {
        try {
            withdraw(-100);
        } catch (BizException e) {
            System.out.println("业务异常: " + e.getMessage());
        }
    }
}
\`\`\`

## 五、try-with-resources（Java 7+）

实现 \`AutoCloseable\` 的资源（IO 流、DB 连接等）可自动关闭，告别手写 \`finally\` 关闭。

\`\`\`java
import java.io.*;

public class Main {
    public static void main(String[] args) {
        // 资源声明在 try() 里，无论是否异常都会自动 close()
        try (BufferedReader br = new BufferedReader(new StringReader("line1\\nline2"))) {
            String line;
            while ((line = br.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException e) {
            System.out.println("读取异常: " + e.getMessage());
        }
        // 到这里 br 已自动关闭，无需 finally

        // 多个资源用分号隔开，关闭顺序与声明顺序相反
        try (StringReader r1 = new StringReader("A");
             StringReader r2 = new StringReader("B")) {
            System.out.println("r1: " + (char) r1.read());
            System.out.println("r2: " + (char) r2.read());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
\`\`\`

## 六、异常链与多异常捕获

\`\`\`java
// 多异常一起捕获（类型互不相关）
try {
    // ...
} catch (IOException | SQLException e) {
    // e 隐式 final，不能再赋值
    System.out.println(e.getMessage());
}

// 异常链：低层异常包装成高层异常
try {
    // ...
} catch (IOException cause) {
    // 把 cause 作为新异常的原因
    throw new RuntimeException("读取配置失败", cause);
}
\`\`\`

## 七、小结

- 受检异常必须 \`try-catch\` 或 \`throws\`，未受检异常不强制
- finally 一定执行，资源关闭优先用 try-with-resources
- 自定义异常继承 \`RuntimeException\` 更常用
- 多异常用 \`|\` 合并捕获`,
  },
];
