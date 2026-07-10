// =============================================================
// Java 交互式教程 —— 第二十二批章节（新特性与工程化组，共 15 章）
// =============================================================

export const chapters = [
  {
    id: "java-records-deep",
    group: "新特性与工程化",
    icon: "📋",
    title: "Record 深入（Java 16+）",
    content: `
# Record 深入（Java 16+）

Record 是 Java 16 正式引入的语法糖，用于声明**不可变的数据载体类**。它自动生成构造器、访问器、equals、hashCode、toString 等方法，极大减少了样板代码。

## 1. 基本语法

\`\`\`java
public record Point(int x, int y) {}  // 定义记录类 Point
\`\`\`

这一行等价于传统 Java 中几十行的 POJO：私有 final 字段、全参构造器、getter（注意是 \`x()\` 而不是 \`getX()\`）、equals/hashCode/toString。

## 2. 紧凑构造器（Compact Constructor）

当需要在构造时做参数校验，可以使用**紧凑构造器**，无需再次列出参数列表：

\`\`\`java
public record Range(int start, int end) {  // 定义记录类 Range
    public Range {
        if (start > end) {  // 条件判断：满足 start > end 时执行
            throw new IllegalArgumentException("start 不能大于 end");  // 抛出 IllegalArgumentException 异常："start 不能大于 end"
        }
    }
}
\`\`\`

在紧凑构造器中，参数名与组件名相同，赋值会在构造器末尾自动完成。

## 3. 自定义方法

Record 可以添加额外的方法、静态字段、静态方法，但**不能添加实例字段**（否则破坏不可变性）：

\`\`\`java
public record Point(int x, int y) {  // 定义记录类 Point
    public double distanceToOrigin() {  // 方法 distanceToOrigin，返回 double，无参数
        return Math.sqrt(x * x + y * y);  // 返回值：Math.sqrt(x * x + y * y)
    }
    public static Point origin() {  // 静态方法 origin，返回 Point，无参数
        return new Point(0, 0);  // 返回值：new Point(0, 0)
    }
}
\`\`\`

## 4. 实现 interface

Record 可以实现接口，常用于策略模式或领域建模：

\`\`\`java
public record Point(int x, int y) implements Comparable<Point> {  // 定义记录类 Point
    @Override  // 注解：Override
    public int compareTo(Point other) {  // 方法 compareTo，返回 int，参数：Point other
        return Integer.compare(this.x, other.x);  // 返回值：Integer.compare(this.x, other.x)
    }
}
\`\`\`

## 5. Record 组件特性

- 组件类型可以是基本类型或引用类型
- 支持泛型：\`record Pair<A, B>(A first, B second) {}\`
- 支持 record 嵌套
- 默认不可变，所有字段 final
- 不能被继承（隐式 final）

## 6. 适用场景

- DTO（数据传输对象）
- 值对象（Value Object）
- 方法返回多个值的封装
- 事件对象
- 配置项

## 7. 注意事项

- Record 的访问器没有 \`get\` 前缀，与 JavaBeans 命名不同
- Record 不能 extends 其他类（已隐式继承 \`java.lang.Record\`）
- Record 可以实现任意数量的接口
- 序列化时使用组件而非字段，更安全

Record 让"数据优先"的 Java 编程更加简洁，是现代 Java 函数式风格的重要组成。
    `,
    code: `// Record 深入演示：高级用法
public class Main {
    public static void main(String[] args) {
        // 基本使用
        Point p1 = new Point(3, 4);
        Point p2 = new Point(3, 4);
        System.out.println("点 p1 = " + p1);
        System.out.println("x = " + p1.x() + ", y = " + p1.y());
        System.out.println("p1.equals(p2) = " + p1.equals(p2));
        System.out.println("到原点距离 = " + p1.distanceToOrigin());

        // 紧凑构造器校验
        try {
            Range r = new Range(10, 5);
        } catch (IllegalArgumentException e) {
            System.out.println("Range 校验失败：" + e.getMessage());
        }
        Range valid = new Range(1, 100);
        System.out.println("有效 Range = " + valid);

        // 实现接口
        Point a = new Point(1, 2);
        Point b = new Point(3, 4);
        System.out.println("比较结果 = " + a.compareTo(b));

        // 泛型 record
        Pair<String, Integer> pair = new Pair<>("年龄", 18);
        System.out.println("Pair = " + pair);
        System.out.println("first = " + pair.first() + ", second = " + pair.second());

        // record 嵌套
        Line line = new Line(new Point(0, 0), new Point(5, 5));
        System.out.println("Line = " + line);
        System.out.println("长度 = " + line.length());

        // 静态工厂
        Point origin = Point.origin();
        System.out.println("原点 = " + origin);
    }
}

// 简单 record，含自定义方法和接口实现
record Point(int x, int y) implements Comparable<Point> {
    // 自定义方法
    public double distanceToOrigin() {
        return Math.sqrt(x * x + y * y);
    }

    // 静态工厂方法
    public static Point origin() {
        return new Point(0, 0);
    }

    // 实现接口方法
    @Override
    public int compareTo(Point other) {
        int cmp = Integer.compare(this.x, other.x);
        return cmp != 0 ? cmp : Integer.compare(this.y, other.y);
    }
}

// 紧凑构造器演示：参数校验
record Range(int start, int end) {
    public Range {
        if (start > end) {
            throw new IllegalArgumentException("start 不能大于 end");
        }
    }
}

// 泛型 record
record Pair<A, B>(A first, B second) {}

// record 嵌套
record Line(Point start, Point end) {
    public double length() {
        int dx = end.x() - start.x();
        int dy = end.y() - start.y();
        return Math.sqrt(dx * dx + dy * dy);
    }
}
`
  },
  {
    id: "java-sealed-deep",
    group: "新特性与工程化",
    icon: "🔐",
    title: "密封类深入（Java 17+）",
    content: `
# 密封类深入（Java 17+）

密封类（Sealed Class）是 Java 17 正式引入的特性，允许类声明**哪些子类可以继承自己**，从而实现对继承层次的封闭控制。

## 1. 三个关键字

- \`sealed\`：声明一个密封类/接口
- \`permits\`：显式列出允许的子类
- \`non-sealed\`：放开继承限制（任何人都可以继承）
- \`final\`：彻底封闭（不能再被继承）

\`\`\`java
public sealed interface Shape permits Circle, Square, Triangle {}  // 定义接口 Shape
\`\`\`

## 2. 子类规则

- 子类必须与密封类在**同一模块**或**同一包**中
- 子类必须显式声明为 \`final\`、\`sealed\` 或 \`non-sealed\` 之一
- 没有继承关系的类不能 extends 密封类

\`\`\`java
final class Circle implements Shape {}  // 定义最终（不可继承）类 Circle
sealed class Square implements Shape permits ColoredSquare {}  // 定义类 Square
non-sealed class Triangle implements Shape {}  // 定义类 Triangle
\`\`\`

## 3. 穷举 switch

密封类最大的价值在于配合 switch 模式匹配，编译器能进行**穷举检查**（exhaustiveness），无需 default 分支：

\`\`\`java
double area = switch (shape) {
    case Circle c -> Math.PI * c.r() * c.r();  // Lambda 表达式：实现函数式接口
    case Square s -> s.side() * s.side();  // Lambda 表达式：实现函数式接口
    case Triangle t -> 0.5 * t.base() * t.height();  // Lambda 表达式：实现函数式接口
};
\`\`\`

## 4. 与 record 配合

密封类 + record 是 Java 代数数据类型（ADT）的核心组合：

\`\`\`java
sealed interface Shape permits Circle, Square {}  // 定义接口 Shape
record Circle(double r) implements Shape {}  // 定义记录类 Circle
record Square(double side) implements Shape {}  // 定义记录类 Square
\`\`\`

这种方式让数据建模清晰、安全，编译器能保证所有情况都被处理。

## 5. 密封接口

接口也可以是 sealed，常用于：
- 定义封闭的策略集合
- 限定实现类范围
- 类型层次建模

## 6. 与模式匹配协同

Java 21 的模式匹配让密封类真正发挥威力：
- instanceof 模式匹配判断具体子类
- switch 模式匹配实现穷举
- record 解构与密封类型结合

## 7. 适用场景

- 表达固定的类型集合（如 AST 节点）
- 领域模型中的有限状态
- 替代枚举 + 数据的场景
- 安全的访问者模式实现

密封类是 Java 类型系统现代化的重要里程碑，配合 record 和模式匹配，让 Java 拥有了接近函数式语言的代数数据类型能力。
    `,
    code: `// 密封类深入演示：高级用法
public class Main {
    public static void main(String[] args) {
        Shape s1 = new Circle(2.0);
        Shape s2 = new Square(3.0);
        Shape s3 = new Triangle(4.0, 5.0);
        Shape s4 = new ColoredSquare(6.0, "红色");

        System.out.println("圆面积 = " + area(s1));
        System.out.println("正方形面积 = " + area(s2));
        System.out.println("三角形面积 = " + area(s3));
        System.out.println("彩色正方形面积 = " + area(s4));

        // 穷举 switch，无需 default
        System.out.println("描述：" + describe(s1));
        System.out.println("描述：" + describe(s4));

        // 嵌套密封层次
        System.out.println("颜色信息：" + describeColor(s4));
    }

    // 穷举 switch：编译器保证覆盖所有子类
    static double area(Shape shape) {
        return switch (shape) {
            case Circle c -> Math.PI * c.r() * c.r();
            case Square s -> s.side() * s.side();
            case Triangle t -> 0.5 * t.base() * t.height();
        };
    }

    // 嵌套 case 守卫
    static String describe(Shape shape) {
        return switch (shape) {
            case Circle c -> "圆形，半径 " + c.r();
            case Square s when s instanceof ColoredSquare cs ->
                "彩色正方形，边长 " + s.side() + "，颜色 " + cs.color();
            case Square s -> "普通正方形，边长 " + s.side();
            case Triangle t -> "三角形，底 " + t.base() + "，高 " + t.height();
        };
    }

    static String describeColor(Shape shape) {
        return switch (shape) {
            case ColoredSquare cs -> "颜色为 " + cs.color();
            default -> "无颜色";
        };
    }
}

// 密封接口，permits 列出所有允许的实现
sealed interface Shape permits Circle, Square, Triangle {}

// final 实现：彻底封闭
final class Circle implements Shape {
    private final double r;
    public Circle(double r) { this.r = r; }
    public double r() { return r; }
}

// sealed 实现：继续限制子类
sealed class Square implements Shape permits ColoredSquare {
    private final double side;
    public Square(double side) { this.side = side; }
    public double side() { return side; }
}

// Square 的子类
final class ColoredSquare extends Square {
    private final String color;
    public ColoredSquare(double side, String color) {
        super(side);
        this.color = color;
    }
    public String color() { return color; }
}

// non-sealed：放开继承限制
non-sealed class Triangle implements Shape {
    private final double base;
    private final double height;
    public Triangle(double base, double height) {
        this.base = base;
        this.height = height;
    }
    public double base() { return base; }
    public double height() { return height; }
}
`
  },
  {
    id: "java-pattern-matching",
    group: "新特性与工程化",
    icon: "🎯",
    title: "模式匹配（Java 21+）",
    content: `
# 模式匹配（Java 21+）

模式匹配是 Java 21 正式引入的重大特性，让类型检查与转换、数据解构变得简洁安全。

## 1. instanceof 模式匹配

传统写法需要先检查类型，再强制转换：

\`\`\`java
// 旧写法
if (obj instanceof String) {  // 条件判断：满足 obj instanceof String 时执行
    String s = (String) obj;  // 声明变量 s（String），初始值为 (String) obj
    System.out.println(s.length());  // 打印一行到标准输出（自动换行）
}

// 新写法：模式匹配
if (obj instanceof String s) {  // 条件判断：满足 obj instanceof String s 时执行
    System.out.println(s.length());  // 打印一行到标准输出（自动换行）
}
\`\`\`

变量 \`s\` 的作用域是 if 块内，且自动完成类型转换。

## 2. switch 模式匹配

switch 不再局限于基本类型和枚举，可以匹配任意类型：

\`\`\`java
String result = switch (obj) {
    case Integer i -> "整数：" + i;  // Lambda 表达式：实现函数式接口
    case String s -> "字符串：" + s;  // Lambda 表达式：实现函数式接口
    case null -> "空值";  // Lambda 表达式：实现函数式接口
    default -> "其他";  // Lambda 表达式：实现函数式接口
};
\`\`\`

## 3. 类型模式（Type Pattern）

直接匹配类型并绑定变量：

\`\`\`java
case Integer i -> ...  // Lambda 表达式：实现函数式接口
case List<?> l -> ...  // Lambda 表达式：实现函数式接口
\`\`\`

## 4. 守卫（Guard，when 子句）

在模式后追加条件，实现更精确的匹配：

\`\`\`java
case Integer i when i > 0 -> "正整数";  // Lambda 表达式：实现函数式接口
case Integer i when i < 0 -> "负整数";  // Lambda 表达式：实现函数式接口
case Integer i -> "零";  // Lambda 表达式：实现函数式接口
\`\`\`

## 5. 记录模式（Record Pattern）

解构 record 的组件：

\`\`\`java
record Point(int x, int y) {}  // 定义记录类 Point

switch (p) {  // switch 分支：根据 p 的值跳转
    case Point(int x, int y) -> "x=" + x + ", y=" + y;  // Lambda 表达式：实现函数式接口
}
\`\`\`

支持嵌套解构：

\`\`\`java
case Line(Point(int x1, int y1), Point(int x2, int y2)) -> ...  // Lambda 表达式：实现函数式接口
\`\`\`

## 6. null 处理

switch 模式匹配可以显式处理 null：

\`\`\`java
case null -> "传入的是 null";  // Lambda 表达式：实现函数式接口
\`\`\`

这避免了 NPE，让 null 处理更显式。

## 7. 穷举检查

配合密封类，编译器能验证所有情况是否被覆盖，无需 default。

## 8. 适用场景

- 替代繁琐的 instanceof + 强转
- 实现访问者模式
- 处理异构集合
- 解构 record 数据
- AST 处理

模式匹配让 Java 在类型安全的命令式编程上迈出重要一步，是函数式风格的关键支撑。
    `,
    code: `// 模式匹配演示
public class Main {
    public static void main(String[] args) {
        Object[] items = { 42, "hello", 3.14, null, new Point(3, 4), new Line(new Point(0, 0), new Point(1, 1)) };

        for (Object obj : items) {
            System.out.println(classify(obj));
        }

        // instanceof 模式匹配
        Object value = "Java 21";
        if (value instanceof String s && s.length() > 3) {
            System.out.println("长字符串：" + s);
        }

        // 守卫匹配
        int[] nums = { -5, 0, 10, 100 };
        for (int n : nums) {
            System.out.println(n + " -> " + describeNumber(n));
        }

        // 记录解构
        Point p = new Point(5, 12);
        System.out.println(describePoint(p));

        Line line = new Line(new Point(0, 0), new Point(3, 4));
        System.out.println(describeLine(line));
    }

    // switch 模式匹配，含 null 处理
    static String classify(Object obj) {
        return switch (obj) {
            case null -> "null 值";
            case Integer i when i > 0 -> "正整数：" + i;
            case Integer i when i < 0 -> "负整数：" + i;
            case Integer i -> "零";
            case String s -> "字符串（长度 " + s.length() + "）：" + s;
            case Double d -> "浮点数：" + d;
            case Point(int x, int y) -> "点坐标：(" + x + ", " + y + ")";
            case Line(Point(int x1, int y1), Point(int x2, int y2)) ->
                "线段：(" + x1 + "," + y1 + ") -> (" + x2 + "," + y2 + ")";
            default -> "未知类型：" + obj.getClass().getSimpleName();
        };
    }

    // 守卫演示（基元模式 case int i 为预览功能，改用 if-else 守卫）
    static String describeNumber(int n) {
        if (n < 0) return "负数";
        if (n == 0) return "零";
        if (n < 100) return "小正数";
        return "大正数";
    }

    // 记录模式解构
    static String describePoint(Object obj) {
        return switch (obj) {
            case Point(int x, int y) when x == 0 && y == 0 -> "原点";
            case Point(int x, int y) -> "点 (" + x + ", " + y + ")";
            default -> "非点对象";
        };
    }

    static String describeLine(Object obj) {
        return switch (obj) {
            case Line(Point(int x1, int y1), Point(int x2, int y2)) ->
                "线段长度 = " + Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            default -> "非线段";
        };
    }
}

// record 用于模式匹配解构
record Point(int x, int y) {}
record Line(Point start, Point end) {}
`
  },
  {
    id: "java-text-block-deep",
    group: "新特性与工程化",
    icon: "📄",
    title: "文本块深入（Java 15+）",
    content: `
# 文本块深入（Java 15+）

文本块（Text Block）让多行字符串的书写变得直观，无需繁琐的 \`\\n\` 拼接和转义。

## 1. 基本语法

用三个双引号 \`"""\` 包裹，开头的 \`"""\` 后必须换行：

\`\`\`java
String json = """
        {
            "name": "Java",
            "version": 21
        }
        """;
\`\`\`

## 2. 缩进管理（Incidental Whitespace）

Java 自动去除**附带的缩进**（incidental whitespace），保留**必要的缩进**：

- 缩进基准由**最后一行 \`"""\`** 的位置决定
- 比基准更靠右的缩进被保留
- 比基准更靠左的缩进被截断（以基准为准）

\`\`\`java
String s = """
        Hello
            World
        """;
// 结果："Hello\\n    World\\n"
\`\`\`

## 3. 转义处理

文本块内仍可使用转义序列，但字符串内的双引号无需转义：

\`\`\`java
String text = """
        他说："你好"，\\t 这是制表符
        """;
\`\`\`

## 4. 行尾续行（\\）

使用 \`\\\` 在行尾可以避免换行：

\`\`\`java
String s = """
        Hello \\
        World
        """;
// 结果："Hello World\\n"
\`\`\`

## 5. 空格处理（\\s）

\`\\s\` 表示保留一个空格，避免被自动去除：

\`\`\`java
String s = """
        name:\\s
        """;
\`\`\`

## 6. 格式化

文本块支持 \`String.format\`：

\`\`\`java
String template = """
        用户：%s
        年龄：%d
        """.formatted("张三", 18);  // 调用 """ 的 formatted 方法
\`\`\`

## 7. 字符串模板预览（Java 21 STR）

Java 21 引入字符串模板预览特性（STR 处理器），让插值更直观：

\`\`\`java
String name = "Java";  // 声明变量 name（String），初始值为 "Java"
String msg = STR."欢迎使用 \\{name} 21";  // 声明变量 msg（String），初始值为 STR."欢迎使用 \\{name} 21"
\`\`\`

注：字符串模板(STR)在 Java 21-22 为预览特性，但在 Java 23 中被撤回(JEP 465)，设计正在重新评估，目前(JDK 25)还未正式引入。使用前需确认当前 JDK 状态。

## 8. 适用场景

- JSON / XML / HTML / SQL 模板
- 多行日志
- 配置文件内容
- 代码生成器模板
- 文档字符串

## 9. 注意事项

- 开头 \`"""\` 后必须换行，否则编译错误
- 文本块编译后仍是普通 String，性能无差异
- 不能用文本块表示单个字符字面量
- 嵌套文本块需注意缩进层级

文本块让 Java 在处理多行文本时终于摆脱了"转义地狱"，是日常开发的高频特性。
    `,
    code: `// 文本块深入演示
public class Main {
    public static void main(String[] args) {
        // 1. 基本文本块
        String json = """
                {
                    "name": "Java",
                    "version": 21,
                    "features": ["record", "sealed", "pattern"]
                }
                """;
        System.out.println("=== JSON 文本块 ===");
        System.out.println(json);

        // 2. 缩进管理
        String indented = """
                第一行
                    第二行（缩进更多）
                第三行
                """;
        System.out.println("=== 缩进管理 ===");
        System.out.println(indented);

        // 3. 行尾续行
        String oneLine = """
                Java \\
                21 \\
                文本块
                """;
        System.out.println("=== 续行 ===");
        System.out.println(oneLine);

        // 4. SQL 模板
        String sql = """
                SELECT id, name, age
                FROM users
                WHERE age > 18
                ORDER BY name ASC
                """;
        System.out.println("=== SQL 模板 ===");
        System.out.println(sql);

        // 5. 格式化
        String formatted = """
                用户信息：
                  姓名：%s
                  年龄：%d
                  邮箱：%s
                """.formatted("张三", 25, "zhangsan@example.com");
        System.out.println("=== 格式化 ===");
        System.out.println(formatted);

        // 6. HTML 模板
        String html = """
                <html>
                  <body>
                    <h1>欢迎</h1>
                    <p>这是文本块生成的 HTML</p>
                  </body>
                </html>
                """;
        System.out.println("=== HTML ===");
        System.out.println(html);

        // 7. 字符串内的双引号无需转义
        String quote = """
                他说："Java 文本块真好用"
                """;
        System.out.println("=== 双引号 ===");
        System.out.println(quote);

        // 8. 比较与传统拼接
        String traditional = "{\\n" +
                "  \\"name\\": \\"Java\\"\\n" +
                "}";
        System.out.println("=== 传统拼接 ===");
        System.out.println(traditional);
        System.out.println("文本块让多行字符串更清晰！");
    }
}
`
  },
  {
    id: "java-switch-pattern",
    group: "新特性与工程化",
    icon: "🔀",
    title: "switch 模式匹配（Java 21+）",
    content: `
# switch 模式匹配（Java 21+）

switch 模式匹配是 Java 21 的核心特性，让 switch 从"值匹配"升级为"类型 + 模式匹配"，大幅提升表达能力。

## 1. 类型模式

直接匹配类型并绑定变量，无需强转：

\`\`\`java
String s = switch (obj) {
    case Integer i -> "整数：" + i;  // Lambda 表达式：实现函数式接口
    case String str -> "字符串：" + str;  // Lambda 表达式：实现函数式接口
    default -> "其他";  // Lambda 表达式：实现函数式接口
};
\`\`\`

## 2. null 处理

传统 switch 遇到 null 会抛 NPE，新模式可以显式处理：

\`\`\`java
switch (obj) {  // switch 分支：根据 obj 的值跳转
    case null -> System.out.println("空值");  // Lambda 表达式：实现函数式接口
    case String s -> System.out.println(s);  // Lambda 表达式：实现函数式接口
    default -> System.out.println("其他");  // Lambda 表达式：实现函数式接口
}
\`\`\`

## 3. 守卫（when 子句）

在模式后用 \`when\` 添加条件：

\`\`\`java
case Integer i when i > 0 -> "正整数";  // Lambda 表达式：实现函数式接口
case Integer i when i < 0 -> "负整数";  // Lambda 表达式：实现函数式接口
case Integer i -> "零";  // Lambda 表达式：实现函数式接口
\`\`\`

注意：相同类型的多个 case 必须用 \`when\` 区分，否则编译器无法判断顺序。

## 4. record 解构

switch 可以直接解构 record 组件：

\`\`\`java
record Point(int x, int y) {}  // 定义记录类 Point

switch (p) {  // switch 分支：根据 p 的值跳转
    case Point(int x, int y) -> "x=" + x + ", y=" + y;  // Lambda 表达式：实现函数式接口
}
\`\`\`

支持嵌套解构和守卫结合：

\`\`\`java
case Point(int x, int y) when x == y -> "对角点";  // Lambda 表达式：实现函数式接口
case Point(int x, int y) -> "普通点";  // Lambda 表达式：实现函数式接口
\`\`\`

## 5. 穷举检查（Exhaustiveness）

配合密封类，编译器能验证所有情况都被覆盖，无需 default：

\`\`\`java
sealed interface Shape permits Circle, Square {}  // 定义接口 Shape
// 编译器知道只有 Circle 和 Square 两种
double area = switch (shape) {
    case Circle c -> Math.PI * c.r() * c.r();  // Lambda 表达式：实现函数式接口
    case Square s -> s.side() * s.side();  // Lambda 表达式：实现函数式接口
}; // 无需 default，已穷举
\`\`\`

## 6. case 标签的语法

- 老式语法：\`case X:\` ... \`yield\` 或 \`break\`
- 新式语法：\`case X ->\` 表达式或块
- 块内使用 \`yield\` 返回值

\`\`\`java
case Integer i -> {  // Lambda 表达式：实现函数式接口
    log(i);  // 调用方法 log
    yield i * 2;
}
\`\`\`

## 7. 优先级与顺序

模式匹配按**声明顺序**判断，更具体的 case 应放在前面：

\`\`\`java
case ColoredSquare cs -> ... // 子类在前
case Square s -> ...         // 父类在后
\`\`\`

## 8. 适用场景

- 异构集合处理
- AST 遍历
- 事件分发
- 状态机实现
- 替代 if-else 链

switch 模式匹配让 Java 的控制流表达更现代，是替代复杂 if-else 链的利器。
    `,
    code: `// switch 模式匹配演示
public class Main {
    public static void main(String[] args) {
        Object[] items = {
            42, -7, 0, "hello", "", null,
            new Circle(3), new Square(4), new Rectangle(2, 5),
            new Point(3, 3), new Point(1, 2)
        };

        for (Object obj : items) {
            System.out.println(handle(obj));
        }

        // 穷举 switch 演示
        Shape[] shapes = { new Circle(2), new Square(3), new Rectangle(2, 4) };
        for (Shape s : shapes) {
            System.out.println("面积 = " + computeArea(s));
            System.out.println("描述 = " + describeShape(s));
        }
    }

    // 综合演示：null 处理 + 类型 + 守卫 + record 解构
    static String handle(Object obj) {
        return switch (obj) {
            case null -> "null 值";
            case Integer i when i > 0 -> "正整数：" + i;
            case Integer i when i < 0 -> "负整数：" + i;
            case Integer i -> "零";
            case String s when s.isEmpty() -> "空字符串";
            case String s -> "字符串：\\"" + s + "\\"";
            case Point(int x, int y) when x == y -> "对角点 (" + x + "," + y + ")";
            case Point(int x, int y) -> "普通点 (" + x + "," + y + ")";
            default -> "其他类型：" + obj.getClass().getSimpleName();
        };
    }

    // 穷举 switch：密封类无需 default
    static double computeArea(Shape shape) {
        return switch (shape) {
            case Circle c -> Math.PI * c.r() * c.r();
            case Square s -> s.side() * s.side();
            case Rectangle r -> r.w() * r.h();
        };
    }

    // 守卫 + 解构组合
    static String describeShape(Shape shape) {
        return switch (shape) {
            case Circle c when c.r() > 5 -> "大圆";
            case Circle c -> "小圆";
            case Square s when s.side() > 3 -> "大正方形";
            case Square s -> "小正方形";
            case Rectangle r when r.w() == r.h() -> "实际是正方形";
            case Rectangle r -> "长方形";
        };
    }
}

// 密封接口
sealed interface Shape permits Circle, Square, Rectangle {}
final class Circle implements Shape {
    private final double r;
    public Circle(double r) { this.r = r; }
    public double r() { return r; }
}
final class Square implements Shape {
    private final double side;
    public Square(double side) { this.side = side; }
    public double side() { return side; }
}
final class Rectangle implements Shape {
    private final double w, h;
    public Rectangle(double w, double h) { this.w = w; this.h = h; }
    public double w() { return w; }
    public double h() { return h; }
}

// record 用于解构
record Point(int x, int y) {}
`
  },
  {
    id: "java-var-deep",
    group: "新特性与工程化",
    icon: "🏷️",
    title: "var 深入（Java 10+）",
    content: `
# var 深入（Java 10+）

\`var\` 是 Java 10 引入的**局部变量类型推断**关键字，让编译器根据右侧表达式推断类型。

## 1. 基本用法

\`\`\`java
var list = new ArrayList<String>();   // 推断为 ArrayList<String>
var map = new HashMap<String, Integer>();  // 声明变量 map（var），初始值为 new HashMap<String, Integer>()
var name = "Java";  // 声明变量 name（var），初始值为 "Java"
var count = 42;  // 声明变量 count（var），初始值为 42
\`\`\`

注意：\`var\` 只能用于**局部变量**，不能用于字段、方法参数、返回值。

## 2. var 与泛型

\`var\` 推断时会保留泛型参数：

\`\`\`java
var list = new ArrayList<String>();  // ArrayList<String>
\`\`\`

但要注意"菱形推断"与 \`var\` 结合的陷阱：

\`\`\`java
var list = new ArrayList<>();  // 推断为 ArrayList<Object>，可能不是你想要的
\`\`\`

## 3. var 与 lambda

\`var\` 可以用于 lambda 参数（Java 11+）：

\`\`\`java
Function<String, Integer> f = (var s) -> s.length();  // Lambda 表达式赋值给函数式接口变量
\`\`\`

配合注解时尤其有用：

\`\`\`java
Function<String, Integer> f = (@Nonnull var s) -> s.length();  // Lambda 表达式赋值给函数式接口变量
\`\`\`

但**不能**用 \`var\` 声明 lambda 的返回类型推断变量。

## 4. var 与数组

注意：\`var\` 不能用于数组初始化器的"裸"形式：

\`\`\`java
var arr = {1, 2, 3};  // 编译错误！
var arr = new int[]{1, 2, 3};  // 正确
\`\`\`

## 5. 可读性最佳实践

### 适合使用 var 的场景

- 类型明显（\`new ArrayList<>()\`）
- 泛型嵌套复杂（\`Map<String, List<Pair<Integer, String>>>\`）
- for-each 循环变量
- try-with-resources

\`\`\`java
var stream = Files.lines(Path.of("data.txt"));  // 明显是 Stream<String>
\`\`\`

### 不适合使用 var 的场景

- 类型不直观（\`var result = process();\` —— result 是什么？）
- 推断类型与读者预期不一致
- 基本类型字面值可能引起混淆（\`var x = 0;\` 是 int 还是 long？）

\`\`\`java
var list = getList();  // 不推荐：类型不可见
List<String> list = getList();  // 推荐：清晰
\`\`\`

## 6. var 与 final

可以组合使用：

\`\`\`java
final var PI = 3.14159;  // 声明常量变量 PI（var），初始值为 3.14159
\`\`\`

## 7. var 在 for 循环中

\`\`\`java
for (var item : list) { ... }
for (var i = 0; i < 10; i++) { ... }
\`\`\`

## 8. 注意事项

- \`var\` 不是关键字，是"保留类型名"，仍可作为变量名
- 不能用 \`var\` 声明无初始化的变量
- 不能用 \`var\` 声明 null（\`var x = null;\` 编译错误）
- 推断发生在编译期，无运行时开销

var 的核心价值是减少冗余，但**不应牺牲可读性**。原则：让读者一眼看出类型时用 \`var\`，否则写明类型。
    `,
    code: `// var 深入演示
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        // 1. 基本用法
        var name = "Java 21";
        var version = 21;
        var pi = 3.14159;
        System.out.println(name + ", 版本 " + version + ", PI=" + pi);

        // 2. 集合推断
        var list = new ArrayList<String>(List.of("a", "b", "c"));
        var map = new HashMap<String, Integer>();
        map.put("one", 1);
        map.put("two", 2);
        System.out.println("list = " + list);
        System.out.println("map = " + map);

        // 3. var 与泛型（保留泛型参数）
        var stringList = new ArrayList<String>();
        stringList.add("hello");
        // stringList.add(42);  // 编译错误，类型安全
        System.out.println("stringList = " + stringList);

        // 4. var 在 for-each 中
        for (var item : list) {
            System.out.println("元素：" + item);
        }
        for (var entry : map.entrySet()) {
            System.out.println(entry.getKey() + " = " + entry.getValue());
        }

        // 5. var 与流（Stream）操作
        var stats = IntStream.range(1, 101)
                .summaryStatistics();
        System.out.println("1-100 统计：" + stats);

        // 6. var 复杂泛型场景（避免冗长）
        var nested = new HashMap<String, List<Map<String, Integer>>>();
        nested.computeIfAbsent("key", k -> new ArrayList<>())
              .add(Map.of("inner", 42));
        System.out.println("嵌套结构 = " + nested);

        // 7. var 与 final
        final var MAX_SIZE = 100;
        System.out.println("MAX_SIZE = " + MAX_SIZE);

        // 8. try-with-resources 中的 var
        // var reader = new java.io.StringReader("hello");
        // try (var r = reader) { ... }

        // 9. lambda 中的 var（Java 11+）
        java.util.function.Function<String, Integer> lengthFn = (var s) -> s.length();
        System.out.println("字符串长度 = " + lengthFn.apply("hello world"));

        // 10. 推断数组（必须显式 new）
        var arr = new int[]{1, 2, 3, 4, 5};
        var sum = Arrays.stream(arr).sum();
        System.out.println("数组求和 = " + sum);

        System.out.println("\\nvar 让代码更简洁，但请保持可读性！");
    }

    // 演示方法返回类型不能使用 var
    static List<String> getList() {
        return List.of("a", "b", "c");
    }
}
`
  },
  {
    id: "java-junit-basics",
    group: "新特性与工程化",
    icon: "🧪",
    title: "JUnit 测试基础",
    content: `
# JUnit 测试基础

JUnit 是 Java 生态最流行的单元测试框架。本节以 JUnit 5（Jupiter）为蓝本，介绍测试基础。

## 1. 核心注解

- \`@Test\`：标记一个测试方法
- \`@BeforeEach\`：每个测试方法前执行（初始化）
- \`@AfterEach\`：每个测试方法后执行（清理）
- \`@BeforeAll\`：所有测试前执行一次（静态方法）
- \`@AfterAll\`：所有测试后执行一次（静态方法）
- \`@DisplayName\`：自定义测试显示名
- \`@Disabled\`：禁用测试

\`\`\`java
class CalculatorTest {  // 定义类 CalculatorTest
    private Calculator calc;  // 声明私有变量 calc（Calculator 类型）

    @BeforeEach  // 注解：BeforeEach
    void setUp() {  // 方法 setUp，返回 void，无参数
        calc = new Calculator();  // 为 calc 赋值：new Calculator()
    }

    @Test  // 注解：Test
    @DisplayName("加法测试")  // 注解：DisplayName
    void testAdd() {  // 方法 testAdd，返回 void，无参数
        assertEquals(5, calc.add(2, 3));  // 调用 assertEquals(5, calc 的 add 方法
    }
}
\`\`\`

## 2. 断言（Assertions）

JUnit 提供丰富的断言方法：

- \`assertEquals(expected, actual)\`
- \`assertNotEquals(unexpected, actual)\`
- \`assertTrue(condition)\` / \`assertFalse(condition)\`
- \`assertNull(obj)\` / \`assertNotNull(obj)\`
- \`assertSame\` / \`assertNotSame\`（引用相等）
- \`assertArrayEquals\`
- \`assertThrows(Exception.class, () -> { ... })\`
- \`assertIterableEquals\`
- \`assertLinesMatch\`

\`\`\`java
@Test  // 注解：Test
void testDivideByZero() {  // 方法 testDivideByZero，返回 void，无参数
    assertThrows(ArithmeticException.class, () -> calc.divide(1, 0));  // Lambda 表达式：实现函数式接口
}
\`\`\`

## 3. 测试生命周期

\`\`\`java
@BeforeAll  ->  @BeforeEach  ->  @Test1  ->  @AfterEach  // Lambda 表达式：实现函数式接口
                              ->  @Test2  ->  @AfterEach  ->  @AfterAll  // Lambda 表达式：实现函数式接口
\`\`\`

- \`@BeforeAll\`/\`@AfterAll\` 用于昂贵的共享资源初始化（如数据库连接）
- \`@BeforeEach\`/\`@AfterEach\` 用于每个测试独立的资源（保持测试隔离）

## 4. 参数化测试

\`@ParameterizedTest\` 配合数据源，让一个测试方法跑多组数据：

\`\`\`java
@ParameterizedTest  // 注解：ParameterizedTest
@ValueSource(ints = {1, 2, 3, 4})  // 注解：ValueSource
void testPositive(int n) {  // 方法 testPositive，返回 void，参数：int n
    assertTrue(n > 0);  // 调用方法 assertTrue
}

@ParameterizedTest  // 注解：ParameterizedTest
@CsvSource({"1,2,3", "4,5,9"})  // 注解：CsvSource
void testAdd(int a, int b, int expected) {  // 方法 testAdd，返回 void，参数：int a, int b, int expected
    assertEquals(expected, calc.add(a, b));  // 调用 assertEquals(expected, calc 的 add 方法
}
\`\`\`

## 5. 测试组织

- 每个类一个对应的 \`XxxTest\`
- 测试方法命名：\`shouldReturnXWhenY\` 或 \`methodName_scenario_expected\`
- 测试应独立，不依赖执行顺序

## 6. AAA 模式

测试遵循 **Arrange-Act-Assert**：

\`\`\`java
@Test  // 注解：Test
void testAdd() {  // 方法 testAdd，返回 void，无参数
    // Arrange（准备）
    Calculator calc = new Calculator();  // 声明变量 calc（Calculator），初始值为 new Calculator()
    // Act（执行）
    int result = calc.add(2, 3);  // 声明变量 result（int），初始值为 calc.add(2, 3)
    // Assert（断言）
    assertEquals(5, result);  // 调用方法 assertEquals
}
\`\`\`

## 7. 测试金字塔

- 单元测试（多）：快速、隔离
- 集成测试（中）：模块间协作
- 端到端测试（少）：完整流程

## 8. 最佳实践

- 一个测试只验证一个行为
- 测试方法名清晰表达意图
- 避免 if-else 逻辑
- 使用断言而非打印
- 测试与生产代码同包不同目录

单元测试是代码质量的基石，先写测试（TDD）能让设计更解耦。
    `,
    code: `// 模拟 JUnit 风格测试（不依赖 JUnit 库）
// 用自定义注解和简易运行器演示测试概念
import java.lang.annotation.*;
import java.lang.reflect.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("=== 模拟 JUnit 测试运行 ===\\n");
        runTests(CalculatorTest.class);
    }

    // 简易测试运行器
    static void runTests(Class<?> testClass) throws Exception {
        Object instance = testClass.getDeclaredConstructor().newInstance();
        Method[] methods = testClass.getDeclaredMethods();

        // 找出 @BeforeAll 方法
        for (Method m : methods) {
            if (m.isAnnotationPresent(BeforeAll.class)) {
                m.setAccessible(true);
                m.invoke(null);
            }
        }

        int passed = 0, failed = 0;
        for (Method m : methods) {
            if (!m.isAnnotationPresent(Test.class)) continue;

            // 每个测试前调用 @BeforeEach
            for (Method before : methods) {
                if (before.isAnnotationPresent(BeforeEach.class)) {
                    before.setAccessible(true);
                    before.invoke(instance);
                }
            }

            Test ann = m.getAnnotation(Test.class);
            System.out.println("运行测试：" + (ann.value().isEmpty() ? m.getName() : ann.value()));
            try {
                m.setAccessible(true);
                m.invoke(instance);
                System.out.println("  ✓ 通过");
                passed++;
            } catch (InvocationTargetException e) {
                System.out.println("  ✗ 失败：" + e.getCause().getMessage());
                failed++;
            }

            // 每个测试后调用 @AfterEach
            for (Method after : methods) {
                if (after.isAnnotationPresent(AfterEach.class)) {
                    after.setAccessible(true);
                    after.invoke(instance);
                }
            }
        }

        // 调用 @AfterAll
        for (Method m : methods) {
            if (m.isAnnotationPresent(AfterAll.class)) {
                m.setAccessible(true);
                m.invoke(null);
            }
        }

        System.out.println("\\n=== 结果：通过 " + passed + "，失败 " + failed + " ===");
    }
}

// 自定义注解，模拟 JUnit
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Test { String value() default ""; }

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface BeforeEach {}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface AfterEach {}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface BeforeAll {}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface AfterAll {}

// 简易断言工具
class Assert {
    static void assertEquals(Object expected, Object actual) {
        if (!Objects.equals(expected, actual)) {
            throw new AssertionError("期望 " + expected + "，实际 " + actual);
        }
    }
    static void assertTrue(boolean cond) {
        if (!cond) throw new AssertionError("期望 true，实际 false");
    }
    static void assertThrows(Class<? extends Throwable> ex, Runnable action) {
        try {
            action.run();
        } catch (Throwable t) {
            if (ex.isInstance(t)) return;
            throw new AssertionError("抛出异常类型不匹配：" + t.getClass());
        }
        throw new AssertionError("未抛出期望异常 " + ex.getSimpleName());
    }
}

// 被测类
class Calculator {
    int add(int a, int b) { return a + b; }
    int divide(int a, int b) {
        if (b == 0) throw new ArithmeticException("除零");
        return a / b;
    }
}

// 测试类
class CalculatorTest {
    private Calculator calc;

    @BeforeEach
    void setUp() {
        calc = new Calculator();
        System.out.println("  [BeforeEach] 初始化 Calculator");
    }

    @AfterEach
    void tearDown() {
        System.out.println("  [AfterEach] 清理");
    }

    @BeforeAll
    static void initAll() {
        System.out.println("[BeforeAll] 全局初始化\\n");
    }

    @AfterAll
    static void cleanupAll() {
        System.out.println("\\n[AfterAll] 全局清理");
    }

    @Test("加法测试")
    void testAdd() {
        Assert.assertEquals(5, calc.add(2, 3));
        Assert.assertEquals(0, calc.add(-1, 1));
    }

    @Test("除零应抛异常")
    void testDivideByZero() {
        Assert.assertThrows(ArithmeticException.class, () -> calc.divide(1, 0));
    }

    @Test("正常除法")
    void testDivide() {
        Assert.assertEquals(2, calc.divide(10, 5));
    }
}
`
  },
  {
    id: "java-mockito-basics",
    group: "新特性与工程化",
    icon: "🎭",
    title: "Mockito 简介",
    content: `
# Mockito 简介

Mockito 是 Java 最流行的 mocking 框架，用于在单元测试中模拟依赖对象的行为，让测试聚焦于被测单元。

## 1. 为什么需要 Mock

单元测试应**隔离**被测对象。如果 \`UserService\` 依赖 \`UserRepository\`（访问数据库），测试时直接用真实仓库会：
- 速度慢（需要数据库）
- 不稳定（数据状态变化）
- 难以构造边界场景

Mock 对象提供"替身"，模拟依赖行为。

## 2. 核心 API

- \`mock(Class)\`：创建 mock 对象
- \`spy(Object)\`：创建 spy 对象（部分模拟）
- \`when(...).thenReturn(...)\`：打桩（stub）
- \`when(...).thenThrow(...)\`：模拟抛异常
- \`verify(mock)\`：验证方法是否被调用
- \`verify(mock, times(n))\`：验证调用次数

## 3. mock vs spy

- **mock**：完全模拟，所有方法返回默认值（null/0/false）
- **spy**：包装真实对象，默认调用真实方法，可选择性打桩

\`\`\`java
List<String> mockList = mock(List.class);  // 声明变量 mockList（List<String>），初始值为 mock(List.class)
mockList.add("a");                          // 不真正添加
when(mockList.size()).thenReturn(10);  // 调用 when(mockList 的 size 方法
assertEquals(10, mockList.size());  // 调用 assertEquals(10, mockList 的 size 方法

List<String> realList = new ArrayList<>();  // 声明变量 realList（List<String>），初始值为 new ArrayList<>()
List<String> spyList = spy(realList);  // 声明变量 spyList（List<String>），初始值为 spy(realList)
spyList.add("real");                        // 真实添加
assertEquals(1, spyList.size());  // 调用 assertEquals(1, spyList 的 size 方法
\`\`\`

## 4. 打桩（Stubbing）

\`\`\`java
when(repo.findById(1L)).thenReturn(new User(1, "Alice"));  // 调用 when(repo 的 findById 方法
when(repo.findById(2L)).thenThrow(new RuntimeException("不存在"));  // 调用 when(repo 的 findById 方法
when(repo.save(any(User.class))).thenReturn(true);  // 调用 when(repo 的 save 方法
\`\`\`

参数匹配器：
- \`any()\`、\`anyString()\`、\`anyInt()\`...
- \`eq(value)\`：精确匹配
- 一旦使用匹配器，所有参数都必须用匹配器

## 5. 行为验证（Verification）

\`\`\`java
verify(repo).findById(1L);                  // 验证调用过一次
verify(repo, times(2)).save(any());         // 验证调用 2 次
verify(repo, never()).delete(any());        // 验证从未调用
verify(repo, atLeastOnce()).findAll();      // 至少一次
verify(repo, timeout(100)).asyncMethod();   // 100ms 内调用
\`\`\`

## 6. 打桩 vs 验证

- **打桩**：定义 mock 在被调用时返回什么（when-then）
- **验证**：检查 mock 是否按预期被调用（verify）

两者分工不同：打桩为被测单元提供输入，验证检查被测单元的输出行为。

## 7. ArgumentCaptor

捕获方法调用的参数，便于断言：

\`\`\`java
ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);  // 声明变量 captor（ArgumentCaptor<User>），初始值为 ArgumentCaptor.forClass(User.class)
verify(repo).save(captor.capture());  // 调用 verify(repo) 的 save 方法
assertEquals("Alice", captor.getValue().getName());  // 调用 assertEquals("Alice", captor 的 getValue 方法
\`\`\`

## 8. 常见误区

- 不要 mock 值对象（用真实实例）
- 不要 mock 被测对象本身
- 优先 mock 接口而非具体类
- 避免过度 mock（如果 mock 太多，可能是设计问题）

## 9. Mockito 与 JUnit 配合

\`@ExtendWith(MockitoExtension.class)\` + \`@Mock\` + \`@InjectMocks\` 自动注入 mock。

Mockito 让单元测试真正"单元化"，是依赖隔离的关键工具。
    `,
    code: `// 模拟 Mockito 概念演示（不依赖真实 Mockito 库）
// 真实 Mockito 用 ByteBuddy 动态代理拦截方法调用，这里用简化方式演示概念
import java.util.*;
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Mockito 概念演示 ===\\n");

        // 1. mock 演示：创建 mock 并打桩
        System.out.println("--- mock 演示 ---");
        MockUserRepository mockRepo = new MockUserRepository();

        // 打桩：findById(1L) 返回 Alice（真实 Mockito: when(repo.findById(1L)).thenReturn(...)）
        mockRepo.stubFindById(1L, () -> new User(1L, "Alice"));
        // 打桩：findById(2L) 抛异常
        mockRepo.stubFindByIdThrow(2L, () -> new RuntimeException("用户不存在"));

        UserService service = new UserService(mockRepo);

        User user = service.getUser(1L);
        System.out.println("查询用户 1：" + user);
        Asserts.assertEquals("Alice", user.getName());

        try {
            service.getUser(2L);
        } catch (RuntimeException e) {
            System.out.println("查询用户 2 抛异常：" + e.getMessage());
        }

        // 验证调用：检查 findById(1L) 和 findById(2L) 是否被调用过
        mockRepo.verifyFindById(1L);
        mockRepo.verifyFindById(2L);
        mockRepo.verifyFindByIdNever(99L);
        System.out.println("验证：findById(1L) 和 findById(2L) 被调用，findById(99L) 未被调用");

        // 2. spy 演示：包装真实对象，默认调用真实方法
        System.out.println("\\n--- spy 演示 ---");
        List<String> realList = new ArrayList<>();
        SpyList<String> spyList = new SpyList<>(realList);
        spyList.add("真实数据");  // 调用真实 add
        System.out.println("spy 调用真实 add 后，size = " + spyList.size());
        // 打桩覆盖 size() 的真实行为
        spyList.stubSize(() -> 100);
        System.out.println("打桩 size() 后，size = " + spyList.size());
        System.out.println("（spy 的 add 仍调用真实方法，size 被打桩覆盖）");

        // 3. ArgumentCaptor 概念：捕获方法调用的参数
        System.out.println("\\n--- ArgumentCaptor 概念 ---");
        MockUserRepository repo2 = new MockUserRepository();
        UserService svc2 = new UserService(repo2);
        svc2.createUser("Bob");
        // 捕获 save 方法的参数
        ArgumentCaptor<User> captor = new ArgumentCaptor<>();
        captor.capture(repo2.getLastSaved());
        User captured = captor.getValue();
        System.out.println("捕获到 save 参数：" + captured);
        Asserts.assertEquals("Bob", captured.getName());
        // 验证 save 被调用
        repo2.verifySaveCalled();
        System.out.println("验证：save 被调用 1 次");
    }
}

// 被测服务
class UserService {
    private final UserRepository repo;
    public UserService(UserRepository repo) { this.repo = repo; }

    public User getUser(Long id) {
        return repo.findById(id);  // 依赖注入，便于测试隔离
    }

    public void createUser(String name) {
        repo.save(new User(System.currentTimeMillis(), name));
    }
}

// 仓库接口（生产环境用数据库实现，测试用 mock）
interface UserRepository {
    User findById(Long id);
    void save(User user);
}

// Mock 仓库：完全模拟，方法返回打桩值
class MockUserRepository implements UserRepository {
    // 存储打桩规则
    private final Map<Long, Supplier<User>> returnStubs = new HashMap<>();
    private final Map<Long, Supplier<RuntimeException>> throwStubs = new HashMap<>();
    // 记录调用历史（用于 verify）
    private final List<Long> findByIdCalls = new ArrayList<>();
    private int saveCallCount = 0;
    private User lastSaved;

    // 打桩：指定返回值
    void stubFindById(Long id, Supplier<User> stub) {
        returnStubs.put(id, stub);
    }

    // 打桩：指定抛出异常
    void stubFindByIdThrow(Long id, Supplier<RuntimeException> ex) {
        throwStubs.put(id, ex);
    }

    @Override
    public User findById(Long id) {
        findByIdCalls.add(id);  // 记录调用
        if (throwStubs.containsKey(id)) throw throwStubs.get(id).get();
        return returnStubs.getOrDefault(id, () -> null).get();
    }

    @Override
    public void save(User user) {
        saveCallCount++;
        lastSaved = user;
    }

    User getLastSaved() { return lastSaved; }

    // 验证方法
    void verifyFindById(Long id) {
        if (!findByIdCalls.contains(id)) {
            throw new AssertionError("期望 findById(" + id + ") 被调用，实际未调用");
        }
    }

    void verifyFindByIdNever(Long id) {
        if (findByIdCalls.contains(id)) {
            throw new AssertionError("期望 findById(" + id + ") 未被调用，实际被调用了");
        }
    }

    void verifySaveCalled() {
        if (saveCallCount == 0) {
            throw new AssertionError("期望 save 被调用，实际未调用");
        }
    }
}

// Spy 列表：包装真实 List，默认调用真实方法，可选择性打桩
class SpyList<E> extends java.util.AbstractList<E> {
    private final List<E> delegate;
    private Supplier<Integer> sizeStub;  // size() 的打桩

    public SpyList(List<E> real) { this.delegate = real; }

    // 打桩 size() 方法
    void stubSize(Supplier<Integer> stub) { this.sizeStub = stub; }

    @Override
    public int size() {
        // 有打桩则返回打桩值，否则调用真实方法
        return sizeStub == null ? delegate.size() : sizeStub.get();
    }

    @Override
    public E get(int index) { return delegate.get(index); }

    @Override
    public void add(int index, E element) { delegate.add(index, element); }

    @Override
    public E remove(int index) { return delegate.remove(index); }

    @Override
    public E set(int index, E element) { return delegate.set(index, element); }
}

// 参数捕获器：捕获方法调用参数，便于断言
class ArgumentCaptor<T> {
    private T captured;
    public void capture(T value) { this.captured = value; }
    public T getValue() { return captured; }
}

class User {
    private final Long id;
    private final String name;
    public User(Long id, String name) { this.id = id; this.name = name; }
    public Long getId() { return id; }
    public String getName() { return name; }
    @Override public String toString() { return "User{id=" + id + ", name='" + name + "'}"; }
}

class Asserts {
    static void assertEquals(Object expected, Object actual) {
        if (!Objects.equals(expected, actual)) {
            throw new AssertionError("期望 " + expected + "，实际 " + actual);
        }
    }
}
`
  },
  {
    id: "java-maven-gradle",
    group: "新特性与工程化",
    icon: "📦",
    title: "Maven 与 Gradle",
    content: `
# Maven 与 Gradle

构建工具是 Java 工程化的核心。Maven 和 Gradle 是当前两大主流选择。

## 1. Maven 项目结构

\`\`\`
my-app/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/        # 源代码
    │   └── resources/   # 配置文件
    └── test/
        ├── java/        # 测试代码
        └── resources/
\`\`\`

这是 Maven 约定优于配置（Convention over Configuration）的体现。

## 2. pom.xml 结构

\`\`\`xml
<project>  <!-- 项目根元素 开始 -->
    <groupId>com.example</groupId>  <!-- 组 ID：com.example -->
    <artifactId>my-app</artifactId>  <!-- 构件 ID：my-app -->
    <version>1.0.0</version>  <!-- 版本号：1.0.0 -->
    <packaging>jar</packaging>  <!-- 打包类型：jar -->

    <dependencies>  <!-- 依赖声明 开始 -->
        <dependency>  <!-- 单个依赖 开始 -->
            <groupId>junit</groupId>  <!-- 组 ID：junit -->
            <artifactId>junit</artifactId>  <!-- 构件 ID：junit -->
            <version>5.10.0</version>  <!-- 版本号：5.10.0 -->
            <scope>test</scope>  <!-- 依赖范围：test -->
        </dependency>
    </dependencies>

    <build>  <!-- 构建设置 开始 -->
        <plugins>  <!-- 插件配置 开始 -->
            <plugin>  <!-- 插件 开始 -->
                <artifactId>maven-compiler-plugin</artifactId>  <!-- 构件 ID：maven-compiler-plugin -->
                <version>3.11.0</version>  <!-- 版本号：3.11.0 -->
                <configuration>  <!-- 插件配置 开始 -->
                    <source>21</source>  <!-- 源码兼容版本：21 -->
                    <target>21</target>  <!-- 目标字节码版本：21 -->
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
\`\`\`

## 3. Maven 生命周期

Maven 有三套内置生命周期：

- **clean**：清理（pre-clean, clean, post-clean）
- **default**：构建（validate, compile, test, package, verify, install, deploy）
- **site**：生成站点文档

常用命令：
- \`mvn clean\`：清理 target
- \`mvn compile\`：编译
- \`mvn test\`：运行测试
- \`mvn package\`：打包
- \`mvn install\`：安装到本地仓库
- \`mvn deploy\`：部署到远程仓库

## 4. Gradle 项目结构

\`\`\`
my-app/
├── build.gradle      # 构建脚本（Groovy/Kotlin DSL）
├── settings.gradle   # 项目设置
└── src/
    ├── main/java/
    ├── main/resources/
    └── test/java/
\`\`\`

## 5. build.gradle 示例

\`\`\`groovy
plugins {  // plugins 块：声明要应用的 Gradle 插件
    id 'java'  // 应用 java 插件
    id 'application'  // 应用 application 插件
}

group = 'com.example'  // 设置组 ID：com.example
version = '1.0.0'  // 设置版本号：1.0.0

repositories {  // repositories 块：声明依赖来源仓库
    mavenCentral()  // 使用 Maven 中央仓库
}

dependencies {  // dependencies 块：声明项目依赖
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'  // 测试范围依赖：org.junit.jupiter:junit-jupiter:5.10.0
    implementation 'com.google.guava:guava:32.1.3-jre'  // 编译与运行时依赖：com.google.guava:guava:32.1.3-jre
}

java {  // java 块：配置 Java 工具链等
    toolchain {  // toolchain 块：指定 JDK 工具链
        languageVersion = JavaLanguageVersion.of(21)  // 设置 Java 语言版本：JavaLanguageVersion.of(21)
    }
}

application {
    mainClass = 'com.example.Main'  // 设置应用主类：com.example.Main
}
\`\`\`

## 6. Gradle 任务

Gradle 以**任务（Task）**为核心：

- \`gradle build\`：构建
- \`gradle test\`：测试
- \`gradle clean\`：清理
- \`gradle run\`：运行应用
- \`gradle tasks\`：列出所有任务

任务可自定义、有依赖关系、支持增量构建。

## 7. 依赖管理

**Scope 对比：**

| 用途 | Maven | Gradle |
|------|-------|--------|
| 编译期 | compile | implementation |
| 运行期 | runtime | runtimeOnly |
| 测试 | test | testImplementation |
| 提供 | provided | compileOnly |

## 8. 对比总结

| 维度 | Maven | Gradle |
|------|-------|--------|
| 配置语言 | XML | Groovy/Kotlin DSL |
| 灵活性 | 较低，约定强 | 高，可编程 |
| 构建速度 | 较慢 | 快（增量、缓存、守护进程） |
| 学习曲线 | 平缓 | 较陡 |
| 生态 | 成熟、广泛 | 增长快，Android 主流 |
| 多模块 | 支持 | 更擅长 |

## 9. 选择建议

- 新项目、Android、追求构建速度：**Gradle**
- 团队熟悉 XML、企业传统项目：**Maven**
- 开源库发布：两者皆可，Maven Central 通用

构建工具是工程化基础，理解其原理能极大提升开发效率。
    `,
    code: `// 演示项目结构概念（不真正调用构建工具）
import java.util.List;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Maven 与 Gradle 项目结构演示 ===\\n");

        // 模拟 Maven 项目结构
        System.out.println("--- Maven 项目结构 ---");
        Project mavenProject = Project.maven("com.example", "my-app", "1.0.0");
        mavenProject.addDependency("junit", "junit", "5.10.0", "test");
        mavenProject.addDependency("com.google.guava", "guava", "32.1.3-jre", "compile");
        mavenProject.printStructure();
        mavenProject.printPom();
        mavenProject.printLifecycle();

        System.out.println();

        // 模拟 Gradle 项目结构
        System.out.println("--- Gradle 项目结构 ---");
        Project gradleProject = Project.gradle("com.example", "my-app", "1.0.0");
        gradleProject.addDependency("org.junit.jupiter", "junit-jupiter", "5.10.0", "testImplementation");
        gradleProject.addDependency("com.google.guava", "guava", "32.1.3-jre", "implementation");
        gradleProject.printStructure();
        gradleProject.printBuildGradle();
        gradleProject.printTasks();

        // 对比
        System.out.println();
        System.out.println("--- 构建工具对比 ---");
        printComparison();
    }

    static void printComparison() {
        String[][] rows = {
            {"维度", "Maven", "Gradle"},
            {"配置语言", "XML", "Groovy/Kotlin DSL"},
            {"灵活性", "较低（约定强）", "高（可编程）"},
            {"构建速度", "较慢", "快（增量/缓存/守护）"},
            {"学习曲线", "平缓", "较陡"},
            {"Android", "不主流", "官方推荐"},
        };
        for (String[] row : rows) {
            System.out.printf("%-12s | %-20s | %s%n", row[0], row[1], row[2]);
        }
    }
}

class Project {
    private final String group, artifact, version;
    private final boolean useGradle;
    private final List<String[]> deps = new java.util.ArrayList<>();

    private Project(String group, String artifact, String version, boolean useGradle) {
        this.group = group; this.artifact = artifact; this.version = version; this.useGradle = useGradle;
    }

    static Project maven(String g, String a, String v) { return new Project(g, a, v, false); }
    static Project gradle(String g, String a, String v) { return new Project(g, a, v, true); }

    void addDependency(String g, String a, String v, String scope) {
        deps.add(new String[]{g, a, v, scope});
    }

    void printStructure() {
        System.out.println("项目目录：");
        System.out.println("  " + artifact + "/");
        System.out.println("  ├── " + (useGradle ? "build.gradle" : "pom.xml"));
        if (useGradle) System.out.println("  ├── settings.gradle");
        System.out.println("  └── src/");
        System.out.println("      ├── main/java/com/example/Main.java");
        System.out.println("      ├── main/resources/");
        System.out.println("      └── test/java/com/example/MainTest.java");
    }

    void printPom() {
        System.out.println("\\npom.xml：");
        System.out.println("<project>");
        System.out.println("  <groupId>" + group + "</groupId>");
        System.out.println("  <artifactId>" + artifact + "</artifactId>");
        System.out.println("  <version>" + version + "</version>");
        System.out.println("  <dependencies>");
        for (String[] d : deps) {
            System.out.println("    <dependency>");
            System.out.println("      <groupId>" + d[0] + "</groupId>");
            System.out.println("      <artifactId>" + d[1] + "</artifactId>");
            System.out.println("      <version>" + d[2] + "</version>");
            System.out.println("      <scope>" + d[3] + "</scope>");
            System.out.println("    </dependency>");
        }
        System.out.println("  </dependencies>");
        System.out.println("</project>");
    }

    void printBuildGradle() {
        System.out.println("\\nbuild.gradle：");
        System.out.println("plugins { id 'java' }");
        System.out.println("group = '" + group + "'");
        System.out.println("version = '" + version + "'");
        System.out.println("repositories { mavenCentral() }");
        System.out.println("dependencies {");
        for (String[] d : deps) {
            System.out.println("    " + d[3] + " '" + d[0] + ":" + d[1] + ":" + d[2] + "'");
        }
        System.out.println("}");
    }

    void printLifecycle() {
        System.out.println("\\nMaven 生命周期命令：");
        System.out.println("  mvn clean compile test package install deploy");
    }

    void printTasks() {
        System.out.println("\\nGradle 任务命令：");
        System.out.println("  gradle clean build test run");
    }
}
`
  },
  {
    id: "java-code-style",
    group: "新特性与工程化",
    icon: "📏",
    title: "代码规范",
    content: `
# 代码规范

一致的代码规范是团队协作的基础。Google Java Style 是业界广泛采用的规范之一。

## 1. 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 包名 | 全小写，不用下划线 | \`com.example.service\` |
| 类名 | UpperCamelCase | \`UserService\` |
| 方法名 | lowerCamelCase | \`getUserById\` |
| 变量名 | lowerCamelCase | \`userName\` |
| 常量 | UPPER_SNAKE_CASE | \`MAX_SIZE\` |
| 泛型参数 | 单大写字母 | \`T, E, K, V\` |

## 2. 格式化

### 缩进与空格

- 缩进用 **2 或 4 个空格**（不混用 Tab）
- 二元运算符两侧加空格：\`a + b\`
- 关键字后加空格：\`if (\`、\`for (\`
- 逗号后加空格：\`foo(a, b, c)\`

### 大括号

- K&R 风格：开括号不换行
- 即使单行语句也加大括号（避免 Apple goto fail 漏洞）

\`\`\`java
if (condition) {  // 条件判断：满足 condition 时执行
    doSomething();  // 调用方法 doSomething
} else {  // 否则分支
    doOther();  // 调用方法 doOther
}
\`\`\`

### 行长

- 一般限制 100-120 字符
- 超长换行时，运算符放在行首或行尾（团队统一）

## 3. import 顺序

Google Style 推荐顺序：

1. 静态 import
2. \`java.*\`
3. \`javax.*\`
4. \`org.*\`
5. \`com.*\`
6. 其他

每组内按字母排序，组间空行分隔。**不要使用通配符 import**（\`import java.util.*;\`）。

IDE 可自动整理。

## 4. 注释规范

### Javadoc

公共 API 必须有 Javadoc：

\`\`\`java
/**
 * 根据用户 ID 查询用户。
 *
 * @param id 用户 ID，不能为 null
 * @return 用户对象，若不存在返回 null
 * @throws IllegalArgumentException 当 id 为 null
 */
public User findById(Long id) { ... }
\`\`\`

### 行内注释

- 解释"为什么"，而非"做什么"
- 避免明显冗余的注释
- TODO/FIXME 标记需带责任人

\`\`\`java
// TODO(zhangsan): 改用缓存提升性能
\`\`\`

## 5. 变量声明

- 一行声明一个变量
- 在使用前最近的块内声明
- 优先使用 final

## 6. 方法规范

- 单一职责，方法体不宜过长（建议 < 50 行）
- 参数不宜过多（< 5 个，过多考虑用对象封装）
- 避免返回 null，用 Optional 表达可能缺失

## 7. 异常处理

- 不要捕获 \`Exception\`/\`Throwable\`，捕获具体异常
- 不要吞掉异常（空 catch 块）
- 记录日志 + 抛出或处理
- 资源用 try-with-resources

\`\`\`java
try (var reader = Files.newBufferedReader(path)) {  // try-with-resources：声明资源 var reader = Files.newBufferedReader(path)，结束自动关闭
    ...
} catch (IOException e) {  // 捕获异常 IOException e
    log.error("读取失败", e);  // 调用 log 的 error 方法
    throw new ServiceException(e);  // 抛出 ServiceException 异常：e
}
\`\`\`

## 8. Checkstyle

Checkstyle 是静态检查工具，强制执行规范：

\`\`\`xml
<plugin>  <!-- 插件 开始 -->
    <artifactId>maven-checkstyle-plugin</artifactId>  <!-- 构件 ID：maven-checkstyle-plugin -->
    <configuration>  <!-- 插件配置 开始 -->
        <configLocation>google_checks.xml</configLocation>  <!-- 配置文件路径：google_checks.xml -->
    </configuration>
</plugin>
\`\`\`

类似工具：SpotBugs（找 bug）、PMD（找坏味道）、SonarQube（综合）。

## 9. 工具链

- IDE：IntelliJ IDEA / Eclipse（内置格式化）
- 格式化：google-java-format（统一）
- 提交前：pre-commit hook 自动检查
- CI：强制 Checkstyle 通过才能合并

## 10. 团队约定

- 配置文件提交到仓库（\`.editorconfig\`、\`idea/code-style.xml\`）
- 自动化优先，减少人工争论
- 规范文档化，新人入职即遵循

代码规范的本质是**降低沟通成本**，让团队聚焦业务而非格式之争。
    `,
    code: `// 代码规范演示
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.util.Objects;

public class Main {
    // 常量命名：UPPER_SNAKE_CASE
    private static final int MAX_USER_COUNT = 1000;

    // 字段命名：lowerCamelCase
    private final UserRepository repository;

    // 构造器
    public Main(UserRepository repository) {
        this.repository = Objects.requireNonNull(repository, "repository 不能为 null");
    }

    /**
     * 根据用户 ID 查询用户。
     *
     * @param id 用户 ID，不能为 null
     * @return 用户对象，不存在则返回空 Optional
     */
    public Optional<User> findById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("id 不能为 null");
        }
        User user = repository.find(id);
        return Optional.ofNullable(user);
    }

    /**
     * 批量创建用户。
     *
     * @param names 用户名列表
     * @return 已创建的用户列表
     */
    public List<User> createUsers(List<String> names) {
        List<User> users = new ArrayList<>();
        for (String name : names) {
            if (name == null || name.isBlank()) {
                continue;  // 跳过空名
            }
            users.add(repository.save(new User(name)));
        }
        return users;
    }

    public static void main(String[] args) {
        UserRepository repo = new InMemoryUserRepository();
        Main service = new Main(repo);

        // 使用 service
        User created = repo.save(new User("张三"));
        System.out.println("已创建用户：" + created);

        Optional<User> found = service.findById(created.getId());
        found.ifPresent(u -> System.out.println("查询到：" + u));

        // 测试异常处理
        try {
            service.findById(null);
        } catch (IllegalArgumentException e) {
            System.out.println("捕获预期异常：" + e.getMessage());
        }

        System.out.println("MAX_USER_COUNT = " + MAX_USER_COUNT);
        System.out.println("\\n代码规范让代码更易读、易维护！");
    }
}

// 接口与实现分离
interface UserRepository {
    User find(Long id);
    User save(User user);
}

class InMemoryUserRepository implements UserRepository {
    private final java.util.Map<Long, User> store = new java.util.concurrent.ConcurrentHashMap<>();
    private long nextId = 1;

    @Override
    public User find(Long id) {
        return store.get(id);
    }

    @Override
    public User save(User user) {
        if (user.getId() == null) {
            user.setId(nextId++);
        }
        store.put(user.getId(), user);
        return user;
    }
}

class User {
    private Long id;
    private final String name;

    public User(String name) {
        this.name = name;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }

    @Override
    public String toString() {
        return "User{id=" + id + ", name='" + name + "'}";
    }
}
`
  },
  {
    id: "java-jshell",
    group: "新特性与工程化",
    icon: "🖥️",
    title: "JShell（Java 9+）",
    content: `
# JShell（Java 9+）

JShell 是 Java 9 引入的**REPL**（Read-Eval-Print Loop）工具，让 Java 支持交互式编程。

## 1. 启动 JShell

\`\`\`bash
$ jshell
|  欢迎使用 JShell -- 版本 21
|  要大致了解该版本, 请键入: /help intro

jshell>  # 启动 Java 交互式 REPL
\`\`\`

## 2. 表达式求值

直接输入表达式，立即看到结果：

\`\`\`
jshell> 1 + 2
$1 ==> 3

jshell> "Java".length()
$2 ==> 4
\`\`\`

结果自动绑定到变量 \`$1\`、\`$2\`，可后续引用。

## 3. 变量声明

\`\`\`
jshell> int x = 10
x ==> 10

jshell> var name = "Alice"   // 支持 var
name ==> "Alice"
\`\`\`

## 4. 方法定义

JShell 支持顶层方法（无需类包裹）：

\`\`\`
jshell> int square(int n) {
   ...>     return n * n;
   ...> }
|  已创建 方法 square(int)

jshell> square(5)
$3 ==> 25
\`\`\`

## 5. 类型定义

可定义类、接口、枚举、record：

\`\`\`
jshell> record Point(int x, int y) {}
|  已创建记录 Point

jshell> new Point(3, 4)
$4 ==> Point[x=3, y=4]
\`\`\`

## 6. 导入

\`\`\`
jshell> import java.util.stream.*

jshell> import static java.lang.Math.*
\`\`\`

查看当前导入：\`/imports\`

## 7. / 命令

| 命令 | 作用 |
|------|------|
| \`/help\` | 帮助 |
| \`/list\` | 列出所有片段 |
| \`/vars\` | 列出所有变量 |
| \`/methods\` | 列出所有方法 |
| \`/types\` | 列出所有类型 |
| \`/imports\` | 列出导入 |
| \`/edit <id>\` | 编辑片段 |
| \`/drop <id>\` | 删除片段 |
| \`/save <file>\` | 保存到文件 |
| \`/open <file>\` | 加载文件 |
| \`/reset\` | 重置状态 |
| \`/exit\` | 退出 |

## 8. 流式 API 探索

JShell 是探索 Stream API、新特性的利器：

\`\`\`
jshell> IntStream.range(1, 10).filter(n -> n % 2 == 0).sum()
$5 ==> 20

jshell> List.of("a", "b", "c").stream().map(String::toUpperCase).toList()
$6 ==> [A, B, C]
\`\`\`

## 9. 异常处理

异常会自动打印堆栈，但不会终止会话：

\`\`\`
jshell> Integer.parseInt("abc")
|  异常 java.lang.NumberFormatException: For input string: "abc"
\`\`\`

## 10. 使用场景

- **学习新特性**：快速试验 record、sealed、模式匹配
- **API 探索**：验证方法行为
- **原型设计**：快速验证算法逻辑
- **教学演示**：互动式教学
- **调试**：临时验证代码片段

## 11. 与 IDE 配合

JShell 适合小实验，复杂逻辑仍推荐 IDE。可使用 \`/save\` 保存试验结果，再粘贴到 IDE 中完善。

## 12. 进阶技巧

- 使用 \`/edit\` 在外部编辑器中修改片段
- \`/set feedback verbose\` 显示更多信息
- 自定义启动脚本：\`jshell --execution local myscript.jsh\`

JShell 让 Java 拥有了动态语言的交互体验，是学习与实验的利器。
    `,
    code: `// 演示 JShell 风格代码（在普通 Java 中模拟 REPL 片段）
public class Main {
    public static void main(String[] args) {
        System.out.println("=== JShell 风格代码演示 ===");
        System.out.println("（模拟 REPL 交互片段）\\n");

        // === 片段 1：表达式求值 ===
        System.out.println("jshell> 1 + 2");
        int $1 = 1 + 2;
        System.out.println("$1 ==> " + $1);
        System.out.println();

        // === 片段 2：方法调用 ===
        System.out.println("jshell> \\"Java\\".length()");
        int $2 = "Java".length();
        System.out.println("$2 ==> " + $2);
        System.out.println();

        // === 片段 3：变量声明 ===
        System.out.println("jshell> var name = \\"Alice\\"");
        var name = "Alice";
        System.out.println("name ==> " + name);
        System.out.println();

        // === 片段 4：方法定义与调用 ===
        System.out.println("jshell> int square(int n) { return n * n; }");
        System.out.println("jshell> square(5)");
        int $3 = square(5);
        System.out.println("$3 ==> " + $3);
        System.out.println();

        // === 片段 5：record 定义 ===
        System.out.println("jshell> record Point(int x, int y) {}");
        System.out.println("jshell> new Point(3, 4)");
        Point $4 = new Point(3, 4);
        System.out.println("$4 ==> " + $4);
        System.out.println();

        // === 片段 6：流式 API ===
        System.out.println("jshell> IntStream.range(1, 10).filter(n -> n % 2 == 0).sum()");
        int $5 = java.util.stream.IntStream.range(1, 10).filter(n -> n % 2 == 0).sum();
        System.out.println("$5 ==> " + $5);
        System.out.println();

        // === 片段 7：List 操作 ===
        System.out.println("jshell> List.of(\\"a\\", \\"b\\", \\"c\\").stream().map(String::toUpperCase).toList()");
        var $6 = java.util.List.of("a", "b", "c").stream().map(String::toUpperCase).toList();
        System.out.println("$6 ==> " + $6);
        System.out.println();

        // === 片段 8：异常处理 ===
        System.out.println("jshell> Integer.parseInt(\\"abc\\")");
        try {
            Integer.parseInt("abc");
        } catch (NumberFormatException e) {
            System.out.println("|  异常 " + e.getClass().getName() + ": " + e.getMessage());
        }
        System.out.println();

        // === 片段 9：查看所有变量 ===
        System.out.println("jshell> /vars");
        System.out.println("|    int $1 = " + $1);
        System.out.println("|    int $2 = " + $2);
        System.out.println("|    String name = \\"" + name + "\\"");
        System.out.println("|    int $3 = " + $3);
        System.out.println("|    Point $4 = " + $4);
        System.out.println("|    int $5 = " + $5);
        System.out.println("|    List $6 = " + $6);

        System.out.println("\\n=== 退出 JShell ===");
        System.out.println("jshell> /exit");
    }

    // JShell 中可定义的顶层方法
    static int square(int n) {
        return n * n;
    }
}

// JShell 中可定义的 record
record Point(int x, int y) {}
`
  },
  {
    id: "java-jmh-benchmark",
    group: "新特性与工程化",
    icon: "⏱️",
    title: "JMH 基准测试",
    content: `
# JMH 基准测试

JMH（Java Microbenchmark Harness）是 OpenJDK 提供的**微基准测试**框架，用于精确测量 Java 代码性能。

## 1. 为什么需要 JMH

手写基准测试（\`System.nanoTime\` 循环计时）有诸多陷阱：

- **JIT 优化**：死代码消除、循环展开、内联让结果失真
- **预热问题**：冷启动耗时数据污染
- **GC 干扰**：垃圾回收时机影响测量
- **CPU 缓存**：缓存命中率影响结果

JMH 专门解决这些问题，是测量 Java 性能的标准工具。

## 2. 核心注解

- \`@Benchmark\`：标记基准测试方法
- \`@Setup\`：测试前准备
- \`@State\`：声明状态对象
- \`@BenchmarkMode\`：测量模式（吞吐/平均时间）
- \`@OutputTimeUnit\`：输出时间单位
- \`@Warmup\`：预热配置
- \`@Measurement\`：测量配置
- \`@Fork\`：进程数
- \`@Threads\`：并发线程数

## 3. 基本示例

\`\`\`java
@State(Scope.Benchmark)  // 注解：State
@BenchmarkMode(Mode.AverageTime)  // 注解：BenchmarkMode
@OutputTimeUnit(TimeUnit.NANOSECONDS)  // 注解：OutputTimeUnit
public class StringBenchmark {  // 定义类 StringBenchmark

    @Benchmark  // 注解：Benchmark
    public String stringConcat() {  // 方法 stringConcat，返回 String，无参数
        return "Hello" + ", " + "World";  // 返回值："Hello" + ", " + "World"
    }

    @Benchmark  // 注解：Benchmark
    public String stringBuilder() {  // 方法 stringBuilder，返回 String，无参数
        return new StringBuilder().append("Hello").append(", ").append("World").toString();  // 返回值：new StringBuilder().append("Hello").append(", ").append("World").toString()
    }
}
\`\`\`

## 4. 测量模式

- \`Throughput\`：吞吐量（ops/s）
- \`AverageTime\`：平均耗时
- \`SampleTime\`：采样时间（分布）
- \`SingleShotTime\`：单次（冷启动）
- \`All\`：全部

## 5. 预热与测量

\`\`\`java
@Warmup(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS)  // 注解：Warmup
@Measurement(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS)  // 注解：Measurement
@Fork(1)  // 注解：Fork
\`\`\`

预热让 JIT 编译稳定，测量阶段才统计。

## 6. State 管理

\`\`\`java
@State(Scope.Benchmark)  // 所有线程共享
@State(Scope.Thread)     // 每线程一份
@State(Scope.Group)      // 线程组共享
\`\`\`

\`@Setup\`/\`@TearDown\` 在合适的级别（Trial/Iteration/Invocation）准备和清理数据。

## 7. vs System.nanoTime

\`\`\`java
// 错误示例：手写基准
long start = System.nanoTime();  // 声明变量 start（long），初始值为 System.nanoTime()
for (int i = 0; i < 1000000; i++) {  // for 循环：初始化 int i = 0；条件 i < 1000000；更新 i++
    doSomething();  // JIT 可能消除整个循环！
}
long end = System.nanoTime();  // 声明变量 end（long），初始值为 System.nanoTime()
System.out.println((end - start) / 1000000.0);  // 打印一行到标准输出（自动换行）
\`\`\`

问题：
- JIT 可能消除"死代码"
- 没有预热
- 没有 GC 隔离
- 没有 fork（JVM 状态污染）

## 8. 常见陷阱

### 死代码消除

\`\`\`java
@Benchmark  // 注解：Benchmark
public void wrong() {  // 方法 wrong，返回 void，无参数
    Math.log(42);  // 结果未使用，JIT 可能消除
}

@Benchmark  // 注解：Benchmark
public double right() {  // 方法 right，返回 double，无参数
    return Math.log(42);  // 返回值阻止消除
}
\`\`\`

JMH 提供 \`Blackhole\` 消费结果：

\`\`\`java
@Benchmark  // 注解：Benchmark
public void consume(Blackhole bh) {  // 方法 consume，返回 void，参数：Blackhole bh
    bh.consume(Math.log(42));  // 调用 bh 的 consume 方法
}
\`\`\`

### 循环内常量折叠

\`\`\`java
@Benchmark  // 注解：Benchmark
public int wrong() {  // 方法 wrong，返回 int，无参数
    int x = 0;  // 声明变量 x（int），初始值为 0
    for (int i = 0; i < 1000; i++) x += i;
    return x;  // JIT 可能常量折叠
}
\`\`\`

### 不可信的微基准

微基准测的是**孤立**的方法性能，不等于整体应用性能。微优化可能被宏观架构淹没。

## 9. 运行

通常打包成 jar 用 \`java -jar benchmarks.jar\` 运行，确保独立 JVM 环境。

## 10. 适用场景

- 比较两种实现（如 String 拼接 vs StringBuilder）
- 验证优化效果
- 测量框架开销
- 探索 JIT 行为

JMH 让"性能测试"从经验走向科学。
    `,
    code: `// 模拟 JMH 基准测试概念（不依赖真实 JMH 库）
import java.util.*;
import java.util.concurrent.TimeUnit;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== JMH 基准测试模拟 ===\\n");

        // 模拟 JMH 的预热 + 测量流程
        BenchmarkRunner runner = new BenchmarkRunner();
        runner.warmupIterations = 3;
        runner.measurementIterations = 5;

        runner.benchmark("String 拼接（+）", () -> {
            String s = "Hello";
            for (int i = 0; i < 10; i++) {
                s = s + i;
            }
            return s;
        });

        runner.benchmark("StringBuilder", () -> {
            StringBuilder sb = new StringBuilder("Hello");
            for (int i = 0; i < 10; i++) {
                sb.append(i);
            }
            return sb.toString();
        });

        runner.benchmark("ArrayList.add", () -> {
            List<Integer> list = new ArrayList<>();
            for (int i = 0; i < 1000; i++) list.add(i);
            return list;
        });

        runner.benchmark("LinkedList.add", () -> {
            List<Integer> list = new LinkedList<>();
            for (int i = 0; i < 1000; i++) list.add(i);
            return list;
        });

        runner.printResults();

        // 演示死代码消除问题
        System.out.println("\\n=== 死代码消除陷阱 ===");
        demonstrateDeadCodeElimination();

        System.out.println("\\nJMH 让性能测量更科学、更可靠！");
    }

    static void demonstrateDeadCodeElimination() {
        // 错误示例：结果未使用，JIT 可能消除
        long start = System.nanoTime();
        long sum = 0;
        for (int i = 0; i < 1000000; i++) {
            sum += Math.log(i + 1);
        }
        long end = System.nanoTime();
        System.out.println("未使用结果，耗时：" + (end - start) / 1_000_000.0 + " ms（可能被 JIT 优化）");
        System.out.println("sum = " + sum + "（这里使用 sum 防止被完全消除）");
    }
}

// 简易基准测试运行器
class BenchmarkRunner {
    int warmupIterations = 3;
    int measurementIterations = 5;
    final List<Result> results = new ArrayList<>();

    void benchmark(String name, java.util.function.Supplier<Object> task) {
        System.out.println("运行基准：" + name);

        // 预热
        for (int i = 0; i < warmupIterations; i++) {
            task.get();
        }
        System.out.println("  预热完成（" + warmupIterations + " 次）");

        // 测量
        long total = 0;
        for (int i = 0; i < measurementIterations; i++) {
            long start = System.nanoTime();
            Object result = task.get();  // 消费结果防消除
            long elapsed = System.nanoTime() - start;
            total += elapsed;
            if (result.hashCode() == Integer.MIN_VALUE) {
                System.out.println("防止消除");  // 永远不会触发
            }
        }
        double avgNanos = total / (double) measurementIterations;
        results.add(new Result(name, avgNanos));
        System.out.printf("  平均耗时：%.3f ns%n%n", avgNanos);
    }

    void printResults() {
        System.out.println("=== 汇总 ===");
        System.out.printf("%-25s | %s%n", "基准", "平均耗时(ns)");
        System.out.println("-".repeat(45));
        results.stream()
                .sorted(Comparator.comparingDouble(r -> r.avgNanos))
                .forEach(r -> System.out.printf("%-25s | %.3f%n", r.name, r.avgNanos));
    }

    static class Result {
        final String name;
        final double avgNanos;
        Result(String name, double avgNanos) {
            this.name = name;
            this.avgNanos = avgNanos;
        }
    }
}
`
  },
  {
    id: "java-debugging",
    group: "新特性与工程化",
    icon: "🐛",
    title: "调试技巧",
    content: `
# 调试技巧

调试是开发者的核心技能。掌握多种调试手段能极大提升问题定位效率。

## 1. 断点调试（IDE）

IntelliJ IDEA / Eclipse 提供强大的断点调试：

- **行断点**：执行到该行暂停
- **方法断点**：方法进入/退出暂停
- **字段断点**：字段读写时暂停
- **异常断点**：抛出指定异常时暂停

### 控制流

- **Step Over (F8)**：执行当前行，不进入方法
- **Step Into (F7)**：进入方法内部
- **Step Out (Shift+F8)**：跳出当前方法
- **Resume (F9)**：继续到下一断点
- **Run to Cursor**：运行到光标处

## 2. 条件断点

右键断点设置条件，只有满足条件才暂停：

\`\`\`
user.getId() == 100
i == 500
str.contains("error")
\`\`\`

适合循环中只在特定情况排查。

## 3. 表达式求值（Evaluate Expression）

暂停时执行任意代码：

- 查看变量值
- 修改变量
- 调用方法验证假设
- 计算复杂表达式

\`\`\`
user.getOrders().stream().mapToDouble(Order::getAmount).sum()
\`\`\`

## 4. Watch（监视）

持续监视表达式变化，每次暂停都自动求值。适合追踪关键变量。

## 5. 远程调试

### 启动远程 JVM 调试

\`\`\`bash
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005 -jar app.jar  # 运行 Java 类（启动 JVM）
\`\`\`

参数说明：
- \`server=y\`：JVM 作为调试服务端
- \`suspend=n\`：不等待调试器连接就启动
- \`address=5005\`：监听端口

### IDE 连接

IDE 中配置 Remote JVM Debug，主机端口对应，连接后即可像本地一样调试。

适用场景：
- 生产环境问题（仅限预发/灰度）
- 容器内应用
- 无法本地复现的问题

## 6. jdb（命令行调试器）

JDK 自带的命令行调试器，适合无 GUI 环境：

\`\`\`bash
$ jdb -attach 5005
> stop in MyClass.main
> run
> step
> print variableName
> cont
\`\`\`

## 7. 线程调试

### 查看线程状态

- IDE 调试器显示所有线程及当前栈
- \`jstack <pid>\` 输出线程堆栈
- \`jconsole\` / \`VisualVM\` 图形化查看

### 死锁排查

\`jstack\` 会自动检测死锁：

\`\`\`
Found one Java-level deadlock:
=============================
"Thread-1":
  waiting to lock monitor 0x... (object 0x..., a java.lang.Object),
  which is held by "Thread-2"
\`\`\`

### 并发断点

可在 \`synchronized\` 进入/退出设置断点，分析锁竞争。

## 8. 日志调试

合适的日志胜过无数次断点：

\`\`\`java
log.debug("处理用户 {}，订单数 {}", userId, orderCount);  // 调用 log 的 debug 方法
\`\`\`

- 生产可关闭（DEBUG 级别）
- 含上下文信息
- 可事后分析

## 9. 常用 JDK 工具

| 工具 | 用途 |
|------|------|
| \`jps\` | 列出 Java 进程 |
| \`jstack\` | 线程堆栈 |
| \`jmap\` | 内存映射、堆 dump |
| \`jstat\` | GC/类加载统计 |
| \`jhat\` | 分析 heap dump（已废弃） |
| \`jcmd\` | 综合诊断命令 |
| \`jconsole\` | GUI 监控 |
| \`VisualVM\` | 综合分析工具 |
| \`arthas\` | 阿里开源诊断（强烈推荐） |

## 10. 调试策略

1. **复现问题**：稳定的复现路径
2. **二分定位**：缩小怀疑范围
3. **假设验证**：提出假设，用断点/日志验证
4. **最小化**：剥离无关代码
5. **查看历史**：git log/git blame 找变更点

## 11. 高级技巧

- **Drop Frame**：回退到方法调用前（重新执行）
- **Force Return**：强制方法返回（不执行剩余）
- **Hot Swap**：修改代码后热替换（受 JVM 限制）
- **Stream 调试**：IDEA 的 Stream Trace 跟踪流操作

调试是"侦探"工作：观察、假设、验证、修正。
    `,
    code: `// 调试相关代码演示
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== 调试技巧演示 ===\\n");

        // 1. 演示条件断点场景
        System.out.println("--- 条件断点场景 ---");
        List<Integer> numbers = IntStream.range(0, 1000).boxed().toList();
        int targetIndex = findFirstBiggerThan(numbers, 500);
        System.out.println("第一个大于 500 的索引：" + targetIndex);
        // 调试时在循环内设置条件断点：value > 500

        // 2. 演示表达式求值场景
        System.out.println("\\n--- 表达式求值场景 ---");
        List<User> users = List.of(
            new User("Alice", 25),
            new User("Bob", 30),
            new User("Charlie", 35)
        );
        // 调试时可在 Evaluate 中执行：
        // users.stream().mapToInt(User::getAge).average().orElse(0)
        double avgAge = users.stream().mapToInt(User::getAge).average().orElse(0);
        System.out.println("平均年龄：" + avgAge);

        // 3. 演示线程调试场景
        System.out.println("\\n--- 线程调试场景 ---");
        Thread t1 = new Thread(() -> {
            System.out.println("  [Thread-1] 当前线程：" + Thread.currentThread().getName());
            try { Thread.sleep(100); } catch (InterruptedException e) {}
        }, "Worker-1");
        Thread t2 = new Thread(() -> {
            System.out.println("  [Thread-2] 当前线程：" + Thread.currentThread().getName());
            try { Thread.sleep(100); } catch (InterruptedException e) {}
        }, "Worker-2");
        t1.start(); t2.start();
        try { t1.join(); t2.join(); } catch (InterruptedException e) {}
        System.out.println("主线程：" + Thread.currentThread().getName());

        // 4. 演示潜在死锁场景（仅展示，不真正死锁）
        System.out.println("\\n--- 死锁排查示例代码 ---");
        demonstrateDeadLockPattern();

        // 5. 演示日志调试
        System.out.println("\\n--- 日志调试 ---");
        processOrder(new Order("A001", 199.99));

        System.out.println("\\n=== JDK 诊断工具速查 ===");
        printJdkTools();
    }

    // 适合条件断点的循环
    static int findFirstBiggerThan(List<Integer> list, int threshold) {
        for (int i = 0; i < list.size(); i++) {
            int value = list.get(i);
            // 调试技巧：在此处设置条件断点 "value > threshold"
            if (value > threshold) {
                return i;
            }
        }
        return -1;
    }

    // 演示死锁模式（不真正死锁，仅展示）
    static void demonstrateDeadLockPattern() {
        Object lockA = new Object();
        Object lockB = new Object();
        // 真实死锁代码（不要运行！）：
        // Thread t1 = new Thread(() -> {
        //     synchronized (lockA) {
        //         synchronized (lockB) { ... }
        //     }
        // });
        // Thread t2 = new Thread(() -> {
        //     synchronized (lockB) {
        //         synchronized (lockA) { ... }
        //     }
        // });
        System.out.println("死锁模式：线程1持有A等B，线程2持有B等A");
        System.out.println("排查命令：jstack <pid> 会自动检测死锁");
    }

    // 日志调试示例
    static void processOrder(Order order) {
        System.out.println("[DEBUG] 开始处理订单：" + order.getId());
        double discounted = order.getAmount() * 0.9;
        System.out.println("[DEBUG] 折扣后金额：" + discounted);
        System.out.println("[INFO] 订单 " + order.getId() + " 处理完成");
    }

    static void printJdkTools() {
        Map<String, String> tools = new LinkedHashMap<>();
        tools.put("jps", "列出 Java 进程");
        tools.put("jstack <pid>", "打印线程堆栈");
        tools.put("jmap -dump <pid>", "堆 dump");
        tools.put("jstat -gc <pid>", "GC 统计");
        tools.put("jcmd <pid> Thread.print", "线程堆栈（推荐）");
        tools.put("arthas", "阿里开源诊断神器");
        tools.forEach((k, v) -> System.out.println("  " + k + " - " + v));
    }
}

class User {
    private final String name;
    private final int age;
    public User(String name, int age) { this.name = name; this.age = age; }
    public String getName() { return name; }
    public int getAge() { return age; }
}

class Order {
    private final String id;
    private final double amount;
    public Order(String id, double amount) { this.id = id; this.amount = amount; }
    public String getId() { return id; }
    public double getAmount() { return amount; }
}
`
  },
  {
    id: "java-memory-leak",
    group: "新特性与工程化",
    icon: "💧",
    title: "内存泄漏",
    content: `
# 内存泄漏

Java 有 GC，但仍会发生**内存泄漏**——对象不再使用却无法被回收。长期运行的 JVM 应用尤其敏感。

## 1. 常见泄漏模式

### 1.1 集合持有对象引用

\`\`\`java
public class Cache {  // 定义类 Cache
    private static final Map<String, Object> CACHE = new HashMap<>();  // 声明静态常量私有变量 CACHE（Map<String, Object>），初始值为 new HashMap<>()

    public static void put(String key, Object value) {  // 静态方法 put，返回 void，参数：String key, Object value
        CACHE.put(key, value);  // 永不移除 → 泄漏
    }
}
\`\`\`

**解决**：用 \`WeakHashMap\`、\`Caffeine\`/\`Guava Cache\` 设置过期策略。

### 1.2 ThreadLocal 未清理

\`\`\`java
ThreadLocal<UserContext> ctx = new ThreadLocal<>();  // 声明变量 ctx（ThreadLocal<UserContext>），初始值为 new ThreadLocal<>()
ctx.set(new UserContext());  // 调用 ctx 的 set 方法
// 忘记 ctx.remove()，线程池中的线程长期存活 → 泄漏
\`\`\`

**解决**：使用后务必 \`remove()\`，尤其在 finally 块中。

### 1.3 监听器/回调未注销

\`\`\`java
button.addListener(myListener);  // 调用 button 的 addListener 方法
// 对象销毁时忘记 removeListener
\`\`\`

**解决**：使用弱引用监听器，或显式注销。

### 1.4 静态集合累积

\`\`\`java
public class Stats {  // 定义类 Stats
    private static final List<LogEntry> LOG = new ArrayList<>();  // 声明静态常量私有变量 LOG（List<LogEntry>），初始值为 new ArrayList<>()
    public static void add(LogEntry e) { LOG.add(e); }  // 只增不减
}
\`\`\`

**解决**：限制大小，定期清理，或用环形缓冲。

### 1.5 资源未关闭

\`\`\`java
InputStream is = new FileInputStream("file");  // 声明变量 is（InputStream），初始值为 new FileInputStream("file")
// 异常或忘记 is.close() → 文件描述符泄漏
\`\`\`

**解决**：try-with-resources。

### 1.6 内部类持有外部类

非静态内部类隐式持有外部类引用：

\`\`\`java
class Outer {  // 定义类 Outer
    class Inner { }  // 持有 Outer 引用
}
\`\`\`

如果 Inner 被长期持有，Outer 也无法回收。**解决**：用静态内部类。

## 2. 检测方法

### 2.1 监控指标

- 堆内存持续上涨不回落
- Full GC 频繁但内存不释放
- \`OutOfMemoryError: Java heap space\`

### 2.2 jstat 观察 GC

\`\`\`bash
jstat -gcutil <pid> 1000  # 查看 JVM 统计信息
\`\`\`

观察 OU（Old 区使用率）是否持续增长。

### 2.3 jmap 堆 dump

\`\`\`bash
jmap -dump:format=b,file=heap.hprof <pid>  # 导出/查看 JVM 堆信息
\`\`\`

或设置 JVM 参数自动 dump：

\`\`\`
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/log/heap.hprof
\`\`\`

### 2.4 MAT 分析

Eclipse MAT（Memory Analyzer Tool）分析 hprof：

- **Dominator Tree**：哪些对象"支配"最多内存
- **Leak Suspects Report**：自动识别泄漏嫌疑
- **Histogram**：按类统计对象数量
- **Path to GC Roots**：找出为什么对象无法回收

### 2.5 在线工具

- \`jcmd <pid> GC.class_histogram\`：对象统计
- \`jmap -histo:live <pid>\`：触发 GC 后统计
- Arthas \`dashboard\` / \`heapdump\`

## 3. 解决方案

### 3.1 弱引用/软引用

\`\`\`java
Map<String, WeakReference<Cache>> cache = new HashMap<>();  // 声明变量 cache（Map<String, WeakReference<Cache>>），初始值为 new HashMap<>()
\`\`\`

\`WeakReference\` 在 GC 时（无强引用）被回收，适合缓存。

### 3.2 缓存框架

使用 Caffeine/Guava 等成熟缓存：

\`\`\`java
Cache<String, User> cache = Caffeine.newBuilder()
    .maximumSize(1000)
    .expireAfterWrite(10, TimeUnit.MINUTES)
    .build();
\`\`\`

### 3.3 显式生命周期管理

- 注册即对应注销方法
- finally 块清理资源
- 对象池管理复用

## 4. 预防措施

1. **代码评审**：关注长生命周期对象（static、单例、缓存）
2. **try-with-resources**：所有资源统一管理
3. **ThreadLocal 模板**：finally 中 remove
4. **缓存限制**：永远设上限和过期
5. **监控告警**：堆内存趋势监控

## 5. 真实案例

- **Tomcat 重启 webapp**：ThreadLocal 未清理导致 PermGen 泄漏
- **Hibernate Session**：长时间打开导致一级缓存膨胀
- **静态 List 累积日志**：服务运行越久越慢

内存泄漏是 Java 后端最隐蔽的问题之一，预防远胜于治疗。
    `,
    code: `// 内存泄漏概念演示
import java.util.*;
import java.lang.ref.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== 内存泄漏演示 ===\\n");

        // 1. 集合持有引用（危险）
        System.out.println("--- 危险：静态 Map 累积 ---");
        demonstrateStaticMapLeak();

        // 2. WeakHashMap 演示
        System.out.println("\\n--- WeakHashMap 自动回收 ---");
        demonstrateWeakHashMap();

        // 3. ThreadLocal 泄漏场景
        System.out.println("\\n--- ThreadLocal 泄漏与清理 ---");
        demonstrateThreadLocalLeak();

        // 4. 弱引用
        System.out.println("\\n--- WeakReference 行为 ---");
        demonstrateWeakReference();

        // 5. 监听器注销
        System.out.println("\\n--- 监听器泄漏与解决 ---");
        demonstrateListenerLeak();

        // 6. 检测方法
        System.out.println("\\n=== 检测方法 ===");
        printDetectionMethods();

        System.out.println("\\n=== 解决方案 ===");
        printSolutions();
    }

    static void demonstrateStaticMapLeak() {
        // 模拟静态缓存持续增长
        Map<String, byte[]> dangerCache = new HashMap<>();
        for (int i = 0; i < 5; i++) {
            dangerCache.put("key" + i, new byte[1024]);  // 1KB
        }
        System.out.println("危险缓存大小：" + dangerCache.size() + " 项");
        System.out.println("问题：键从不移除，持续累积");
        System.out.println("解决：用 Caffeine 等设上限/过期");
    }

    static void demonstrateWeakHashMap() {
        WeakHashMap<Object, String> weakMap = new WeakHashMap<>();
        Object key = new Object();
        weakMap.put(key, "value");
        System.out.println("放入前 size = " + weakMap.size());

        key = null;  // 移除强引用
        System.gc();  // 建议 GC（不保证立即执行）
        try { Thread.sleep(100); } catch (InterruptedException e) {}

        System.out.println("GC 后 size = " + weakMap.size() + "（若为 0 说明已回收）");
    }

    static void demonstrateThreadLocalLeak() {
        ThreadLocal<byte[]> tl = new ThreadLocal<>();
        tl.set(new byte[1024]);
        System.out.println("ThreadLocal 已设置，值大小 1KB");

        // 错误：忘记清理
        // tl 中 Entry 是 WeakReference<ThreadLocal>，但 value 是强引用
        // 在线程池场景下，线程长期存活 → value 泄漏

        // 正确做法
        try {
            // 使用 tl
            byte[] value = tl.get();
            System.out.println("使用 ThreadLocal 值，长度：" + value.length);
        } finally {
            tl.remove();  // 必须清理
            System.out.println("finally 中 remove()，避免泄漏");
        }
    }

    static void demonstrateWeakReference() {
        Object obj = new Object();
        WeakReference<Object> weakRef = new WeakReference<>(obj);
        System.out.println("创建弱引用，referent 存在：" + (weakRef.get() != null));

        obj = null;
        System.gc();
        try { Thread.sleep(100); } catch (InterruptedException e) {}

        System.out.println("GC 后 referent 存在：" + (weakRef.get() != null));
        System.out.println("弱引用适合缓存：无强引用时自动回收");
    }

    static void demonstrateListenerLeak() {
        EventSource source = new EventSource();
        MyListener listener = new MyListener();

        source.addListener(listener);
        System.out.println("注册监听器，数量：" + source.listenerCount());

        // 错误：忘记注销
        // listener 对象无法被回收（被 source 持有）

        // 正确：注销
        source.removeListener(listener);
        System.out.println("注销监听器，数量：" + source.listenerCount());
        System.out.println("解决：对象销毁前显式注销");
    }

    static void printDetectionMethods() {
        String[][] methods = {
            {"jstat -gcutil <pid>", "观察 GC 和各区使用率"},
            {"jmap -dump:file=heap.hprof", "堆 dump 文件"},
            {"-XX:+HeapDumpOnOutOfMemoryError", "OOM 自动 dump"},
            {"Eclipse MAT", "分析 hprof，找泄漏嫌疑"},
            {"Arthas heapdump", "在线 dump"},
        };
        for (String[] m : methods) {
            System.out.println("  " + m[0] + " - " + m[1]);
        }
    }

    static void printSolutions() {
        String[] solutions = {
            "WeakHashMap / WeakReference 自动回收",
            "Caffeine 缓存设上限和过期",
            "ThreadLocal 在 finally 中 remove",
            "监听器配对注销方法",
            "try-with-resources 管理资源",
            "静态集合限制大小，定期清理",
        };
        for (int i = 0; i < solutions.length; i++) {
            System.out.println("  " + (i + 1) + ". " + solutions[i]);
        }
    }
}

// 模拟事件源（监听器管理）
class EventSource {
    private final List<MyListener> listeners = new ArrayList<>();

    void addListener(MyListener l) { listeners.add(l); }
    void removeListener(MyListener l) { listeners.remove(l); }
    int listenerCount() { return listeners.size(); }
}

class MyListener {}
`
  },
  {
    id: "java-best-practices",
    group: "新特性与工程化",
    icon: "✅",
    title: "Java 最佳实践总结",
    content: `
# Java 最佳实践总结

本节综合《Effective Java》要点与现代 Java（17/21）实践，梳理工程化开发的核心原则。

## 1. 不可变优先（Immutable First）

不可变对象天然**线程安全**、**易于推理**、**无副作用**。

\`\`\`java
// 推荐：不可变 record
public record Point(int x, int y) {  // 定义记录类 Point
    public Point translate(int dx, int dy) {  // 方法 translate，返回 Point，参数：int dx, int dy
        return new Point(x + dx, y + dy);  // 返回新实例
    }
}

// 不推荐：可变类
public class MutablePoint {  // 定义类 MutablePoint
    private int x, y;
    public void setX(int x) { this.x = x; }  // 可变 → 难维护
}
\`\`\`

**何时用可变**：性能敏感场景（如缓冲区、计数器），但仍优先封装。

## 2. Optional 的正确使用

Optional 用于**方法返回类型**，表达"可能无值"：

\`\`\`java
// 推荐
public Optional<User> findById(Long id) {  // 方法 findById，返回 Optional<User>，参数：Long id
    return Optional.ofNullable(map.get(id));  // 返回值：Optional.ofNullable(map.get(id))
}

// 调用方
User u = findById(1L).orElseThrow(() -> new NotFoundException());  // Lambda 表达式赋值给函数式接口变量
String name = findById(1L).map(User::getName).orElse("unknown");  // 方法引用：复用已有方法作为函数式接口实例
\`\`\`

**反模式**：
- 不要用 Optional 作为字段（设计上就别扭）
- 不要用 Optional 作为方法参数（用重载或对象）
- 不要 \`get()\` 前不检查（用 orElse/orElseThrow）

## 3. 集合初始化

优先使用不可变工厂方法：

\`\`\`java
List<String> empty = List.of();              // 空不可变
List<String> one = List.of("a");  // 声明变量 one（List<String>），初始值为 List.of("a")
List<String> multi = List.of("a", "b", "c");  // 声明变量 multi（List<String>），初始值为 List.of("a", "b", "c")
Set<Integer> set = Set.of(1, 2, 3);  // 声明变量 set（Set<Integer>），初始值为 Set.of(1, 2, 3)
Map<String, Integer> map = Map.of("a", 1, "b", 2);  // 声明变量 map（Map<String, Integer>），初始值为 Map.of("a", 1, "b", 2)
Map<String, Integer> big = Map.ofEntries(
    Map.entry("k1", 1), Map.entry("k2", 2)
);
\`\`\`

**注意**：\`Map.of\` 限制 10 对，更多用 \`Map.ofEntries\`。

## 4. 异常处理

### 区分受检/非受检

- **受检异常**：业务可恢复（如 \`IOException\`）
- **非受检异常**：编程错误（如 \`NullPointerException\`、\`IllegalArgumentException\`）

### 优先特定异常

\`\`\`java
// 不推荐
catch (Exception e) { ... }

// 推荐
catch (IOException e) { ... }
\`\`\`

### 异常链

\`\`\`java
try { ... }
catch (LowLevelException e) {  // 捕获异常 LowLevelException e
    throw new ServiceException("业务异常", e);  // 保留原因
}
\`\`\`

### 不要吞异常

\`\`\`java
// 反模式
catch (Exception e) { }  // 静默吞掉

// 正确
catch (Exception e) {  // 捕获异常 Exception e
    log.error("处理失败", e);  // 调用 log 的 error 方法
    throw new ServiceException(e);  // 抛出 ServiceException 异常：e
}
\`\`\`

## 5. 并发安全

### 优先不可变

不可变对象天然线程安全。

### 优先高层并发工具

\`\`\`java
// 推荐
ExecutorService pool = Executors.newFixedThreadPool(8);  // 声明变量 pool（ExecutorService），初始值为 Executors.newFixedThreadPool(8)
Future<Integer> f = pool.submit(() -> compute());  // Lambda 表达式赋值给函数式接口变量
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();  // 声明变量 map（ConcurrentHashMap<String, Integer>），初始值为 new ConcurrentHashMap<>()

// 谨慎：synchronized / wait-notify
\`\`\`

### 现代 Java 并发（Java 21+）

虚拟线程简化高并发：

\`\`\`java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {  // try-with-resources：声明资源 var executor = Executors.newVirtualThreadPerTaskExecutor()，结束自动关闭
    IntStream.range(0, 10000).forEach(i ->  // Lambda 表达式：实现函数式接口
        executor.submit(() -> handleRequest(i))  // Lambda 表达式：实现函数式接口
    );
}
\`\`\`

## 6. 通用原则

### 1. 单一职责

类/方法只做一件事。

### 2. 组合优于继承

继承破坏封装，优先组合：

\`\`\`java
// 不推荐
class Stack<E> extends ArrayList<E> { ... }  // 定义类 Stack

// 推荐
class Stack<E> {  // 定义类 Stack
    private final List<E> items = new ArrayList<>();  // 声明常量私有变量 items（List<E>），初始值为 new ArrayList<>()
    ...
}
\`\`\`

### 3. 面向接口编程

\`\`\`java
List<String> list = new ArrayList<>();  // 接口类型声明
\`\`\`

### 4. 最小化可访问性

- 字段优先 private
- 方法能 package-private 就不 public
- 类能 final 就 final

### 5. 重写 equals/hashCode

值对象重写 \`equals\` 必须重写 \`hashCode\`。record 自动生成，是另一优势。

## 7. 现代 Java 特性应用

- **record** 替代 POJO/Lombok @Value
- **sealed** 表达固定类型层次
- **模式匹配** 替代 instanceof + 强转链
- **var** 用于明显类型
- **文本块** 处理多行字符串
- **Stream API** 集合变换
- **Optional** 表达可空返回

## 8. 测试与文档

- 关键逻辑必须有单元测试
- 公共 API 必须有 Javadoc
- 测试覆盖核心路径，不追求 100% 覆盖率数字

## 9. 持续学习

- 阅读《Effective Java》（Joshua Bloch）
- 关注 JDK 新版本特性
- 阅读优秀开源代码（如 Spring、Guava）

最佳实践不是教条，而是经验的浓缩。理解"为什么"比记住"做什么"更重要。
    `,
    code: `// 综合演示 Java 最佳实践
import java.util.*;
import java.util.Optional;
import java.util.concurrent.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Java 最佳实践综合演示 ===\\n");

        // 1. 不可变 record
        System.out.println("--- 不可变优先 ---");
        Point p = new Point(1, 2);
        Point moved = p.translate(3, 4);
        System.out.println("原点：" + p + "，移动后：" + moved);

        // 2. Optional 正确使用
        System.out.println("\\n--- Optional 使用 ---");
        UserService service = new UserService();
        String name1 = service.findById(1L).map(User::name).orElse("未找到");
        String name2 = service.findById(99L).map(User::name).orElse("未找到");
        System.out.println("ID=1：" + name1);
        System.out.println("ID=99：" + name2);

        // 3. 不可变集合工厂
        System.out.println("\\n--- 不可变集合 ---");
        List<String> tags = List.of("java", "best-practice", "modern");
        Map<String, Integer> scores = Map.of("math", 90, "english", 85);
        System.out.println("tags = " + tags);
        System.out.println("scores = " + scores);
        // tags.add("x");  // 抛 UnsupportedOperationException

        // 4. Stream API 函数式风格
        System.out.println("\\n--- Stream 风格 ---");
        List<User> users = List.of(
            new User("Alice", 25), new User("Bob", 30),
            new User("Charlie", 35), new User("Dave", 28)
        );
        List<String> names = users.stream()
            .filter(u -> u.age() >= 28)
            .sorted(Comparator.comparing(User::name))
            .map(User::name)
            .toList();
        System.out.println("28 岁以上用户（按名排序）：" + names);

        // 5. 异常处理
        System.out.println("\\n--- 异常处理 ---");
        try {
            service.findById(99L).orElseThrow(() -> new NotFoundException("用户 99 不存在"));
        } catch (NotFoundException e) {
            System.out.println("捕获业务异常：" + e.getMessage());
        }

        // 6. 并发安全
        System.out.println("\\n--- 并发安全 ---");
        ConcurrentHashMap<String, Integer> counter = new ConcurrentHashMap<>();
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            var futures = IntStream.range(0, 100).mapToObj(i ->
                executor.submit(() -> counter.merge("key", 1, Integer::sum))
            ).toList();
            try {
                for (var f : futures) f.get();
            } catch (InterruptedException | ExecutionException e) {
                Thread.currentThread().interrupt();
                System.out.println("并发任务异常：" + e.getMessage());
            }
        }
        System.out.println("100 个虚拟线程并发自增结果：" + counter.get("key"));

        // 7. 模式匹配 + 密封类
        System.out.println("\\n--- 密封类 + 模式匹配 ---");
        List<Shape> shapes = List.of(new Circle(2), new Square(3), new Rectangle(2, 4));
        shapes.forEach(s -> System.out.println("  " + describe(s) + "，面积 = " + area(s)));

        System.out.println("\\n=== 最佳实践要点回顾 ===");
        printBestPractices();
    }

    // 穷举 switch + 模式匹配
    static String describe(Shape s) {
        return switch (s) {
            case Circle c -> "圆形（半径 " + c.r() + "）";
            case Square sq -> "正方形（边长 " + sq.side() + "）";
            case Rectangle r -> "长方形（" + r.w() + "x" + r.h() + "）";
        };
    }

    static double area(Shape s) {
        return switch (s) {
            case Circle c -> Math.PI * c.r() * c.r();
            case Square sq -> sq.side() * sq.side();
            case Rectangle r -> r.w() * r.h();
        };
    }

    static void printBestPractices() {
        String[] tips = {
            "1. 不可变优先（record）",
            "2. Optional 用于返回类型，不用作字段/参数",
            "3. 用 List.of/Set.of/Map.of 创建不可变集合",
            "4. 异常分类清晰，不吞异常",
            "5. 优先组合而非继承",
            "6. 面向接口编程",
            "7. 最小化可访问性",
            "8. 用 sealed + 模式匹配表达固定类型",
            "9. Stream + var + 文本块提升表达力",
            "10. 关键逻辑有测试，公共 API 有文档",
        };
        for (String t : tips) System.out.println("  " + t);
    }
}

// 不可变 record
record Point(int x, int y) {
    public Point translate(int dx, int dy) {
        return new Point(x + dx, y + dy);
    }
}

record User(String name, int age) {}

// 密封类层次
sealed interface Shape permits Circle, Square, Rectangle {}
record Circle(double r) implements Shape {}
record Square(double side) implements Shape {}
record Rectangle(double w, double h) implements Shape {}

// 业务异常
class NotFoundException extends RuntimeException {
    public NotFoundException(String msg) { super(msg); }
}

// 服务层
class UserService {
    private final Map<Long, User> store = Map.of(
        1L, new User("Alice", 25),
        2L, new User("Bob", 30)
    );

    // Optional 作为返回类型
    public Optional<User> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }
}
`
  }
];
