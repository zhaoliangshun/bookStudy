// =============================================================
// Java 交互式教程 —— 第七批章节（方法与作用域组，共 15 章）
// =============================================================

export const chapters = [
  {
    id: "java-method-basics",
    group: "方法与作用域",
    icon: "📝",
    title: "方法定义基础",
    content: `# 方法定义基础

方法是封装一段逻辑的命名代码块，是组织 Java 程序的基本单位。掌握方法的定义与调用是写出可维护代码的前提。可以说，方法是"行为"的载体，而变量是"状态"的载体，二者共同构成面向对象程序的基础。

## 方法声明语法

一个完整的方法声明包含以下部分：

\`\`\`text
[修饰符] 返回类型 方法名([参数列表]) [throws 异常] {
    方法体
}
\`\`\`

- **修饰符**：如 \`public\`、\`static\`、\`final\` 等，控制访问权限与行为
- **返回类型**：方法返回值的数据类型，无返回值用 \`void\`
- **方法名**：遵循小驼峰命名，动词开头，如 \`calculateTotal\`
- **参数列表**：可选，多个参数用逗号分隔
- **方法体**：用大括号包裹的具体逻辑

## 参数 vs 实参

要区分两个概念：
- **形参（parameter）**：方法声明中定义的变量，如 \`int x\`
- **实参（argument）**：调用时传入的具体值，如 \`add(3, 5)\` 中的 3 和 5

形参是"占位"，实参是"填入占位的值"。

## 方法签名

方法签名由**方法名 + 参数列表**组成，是编译器识别方法的依据。返回类型不属于签名，这就是为什么不能仅靠返回类型区分重载方法。

## 方法调用

调用方法时，程序跳转到方法体执行，执行完毕后返回调用处继续向下执行。静态方法通过类名调用，实例方法通过对象调用。调用时实参按位置依次赋给形参。

## return 语句

\`return\` 有两个作用：返回一个值给调用方、提前结束方法执行。\`void\` 方法中可以写不带值的 \`return;\` 用于提前退出。非 void 方法的所有执行路径都必须 return 一个值，否则编译错误。

## void 方法

不需要返回结果的方法声明为 \`void\`，例如打印日志、修改对象状态等。void 方法中不能写 \`return 值;\`，但可以写 \`return;\` 提前结束。

## 方法的意义

- **复用**：避免重复代码，一处编写处处调用
- **抽象**：隐藏实现细节，只暴露接口
- **测试**：独立的方法便于单元测试
- **可读性**：好的方法名本身就是注释，降低理解成本

## 命名建议

方法名应准确描述"做什么"，用动词开头：\`getAge\`、\`isReady\`、\`calculateTotal\`。避免 \`doSomething\`、\`process\` 这类模糊命名。单个方法建议控制在 20 行以内，职责单一。

## 小结与提示

方法是 Java 组织逻辑的基本单位，掌握它就掌握了程序结构的钥匙。定义方法需明确五要素：修饰符、返回类型、方法名、参数列表、方法体，缺一不可。形参是声明中的占位变量，实参是调用时填入的具体值；方法签名由方法名与参数列表组成，返回类型不算签名——这正是仅靠返回类型无法区分重载的根本原因。void 方法可用 \`return;\` 提前退出，非 void 方法的每条执行路径都必须返回值，否则编译报错。调用时实参按位置依次赋给形参，静态方法通过类名调用、实例方法通过对象调用。实践中应让方法职责单一、命名以动词开头、长度控制在二十行内、参数不宜超过三四个。把方法设计得像积木一样可组合、可测试，代码才能优雅地生长与演进。 此外，方法命名应使用动词开头准确描述行为，避免 \`doSomething\`、\`process\` 这类模糊命名；单个方法建议控制在二十行以内、参数不宜超过三四个，过多则说明方法承担了过多职责应考虑拆分。良好的方法设计能让代码自解释、易测试、易复用。
`,
    code: `// 演示方法的定义与调用
public class Main {
    // 无参无返回值方法
    static void printWelcome() {
        System.out.println("欢迎使用 Java 方法教程！");
    }

    // 带参有返回值方法
    static int add(int a, int b) {
        return a + b;
    }

    // 多参数方法
    static double average(double a, double b, double c) {
        return (a + b + c) / 3;
    }

    // void 方法中使用 return 提前退出
    static void checkAge(int age) {
        if (age < 0) {
            System.out.println("年龄不能为负数");
            return; // 提前结束方法
        }
        System.out.println("年龄有效：" + age);
    }

    // 返回布尔值的方法
    static boolean isEven(int n) {
        return n % 2 == 0;
    }

    public static void main(String[] args) {
        // 调用无返回值方法
        printWelcome();

        // 调用有返回值方法并用变量接收
        int sum = add(3, 5);
        System.out.println("3 + 5 = " + sum);

        // 直接在表达式中使用返回值
        System.out.println("平均值 = " + average(80, 90, 70));

        // 调用带提前退出的方法
        checkAge(18);
        checkAge(-1);

        // 在条件判断中使用返回值
        int num = 7;
        if (isEven(num)) {
            System.out.println(num + " 是偶数");
        } else {
            System.out.println(num + " 是奇数");
        }
    }
}`
  },
  {
    id: "java-method-params",
    group: "方法与作用域",
    icon: "📨",
    title: "参数传递机制",
    content: `# 参数传递机制

Java 方法参数的传递方式是理解方法行为的关键。核心结论：**Java 只有值传递**，但基本类型和引用类型的表现差异容易让人混淆。这是面试高频考点，也是日常编程容易踩坑的地方。

## 基本类型按值传递

传入方法的是实参的**副本**，方法内修改副本不影响原始变量。

\`\`\`java
void modify(int x) { x = 100; }
int a = 1; modify(a); // a 仍是 1
\`\`\`

## 引用类型按引用值传递

引用类型变量存的是对象的地址。传入方法的是**地址的副本**，因此方法内通过该地址可以修改对象内部状态，但重新赋值不会影响外部引用。

\`\`\`java
void changeName(Person p) { p.name = "新名字"; }   // 影响原对象
void replace(Person p) { p = new Person(); }        // 不影响外部引用
\`\`\`

## 可变参数 varargs

使用 \`类型... 参数名\` 定义，调用时可传任意数量参数（包括零个），方法内当作数组使用。这让 API 更灵活。

## 参数传递的底层模型

把变量想象成"盒子"：基本类型盒子里装值；引用类型盒子里装地址纸条。传参时复制的是盒子里的东西（值或地址纸条的复印件），而不是盒子本身。所以：
- 修改基本类型副本：原盒子没动
- 通过地址副本修改对象内部：原对象变了（因为副本地址也指向同一对象）
- 重新给地址副本赋值：原纸条没动

## 常见误区

1. 误以为引用类型是"按引用传递"——其实传递的是引用的副本
2. 以为方法内 \`new\` 一个新对象能替换外部变量——做不到
3. 以为 String 作为引用类型能在方法内被修改——String 不可变，任何修改都返回新对象

## 为什么 Java 选择只有值传递

值传递语义清晰、可预测：调用方不用担心方法内"偷偷"改掉自己的变量引用。虽然无法实现 swap 交换两个变量，但换来了更安全的代码。需要交换时可返回数组或对象。

## 设计建议

- 不要依赖方法修改传入的基本类型参数（做不到）
- 修改对象内部状态会带来副作用，应在方法名中体现，如 \`fill\`、\`clear\`
- 不可变参数（如 String、包装类）更安全，优先考虑

## 小结与提示

参数传递的核心结论只有一句：Java 只有值传递，没有引用传递。基本类型传的是数据的副本，方法内修改形参丝毫不影响外部；引用类型传的是地址的副本，所以能通过它修改对象内部状态，却无法让外部引用指向新对象。这个区别是面试与日常调试的高频陷阱，务必牢记"改内容可以、换引用不行"这十个字。可变参数让 API 更灵活，本质是数组，调用时可传散列参数或数组。设计方法时要避免依赖修改入参产生副作用，方法名应如实反映是否会改变对象状态，如 \`fill\`、\`clear\`、\`sort\` 暗示修改，而 \`sorted\`、\`copy\` 暗示返回新值。遇到"为什么我的变量没变"这类 bug，先回头检查是否误解了值传递语义，往往就能找到答案。 深入理解值传递还能解释一个常见现象：方法内对 String 或包装类（Integer 等）的"修改"完全不影响外部，因为它们都是不可变类型——任何修改操作都返回新对象，赋值只是让形参指向新对象、外部引用纹丝不动。把变量想象成"盒子"：基本类型盒子里装值、引用类型盒子里装地址纸条，传参时复制的始终是盒子里面的东西而非盒子本身，这一模型能帮你彻底厘清值传递的本质。需要交换两个变量时无法直接做到，可返回数组或对象、或使用原子引用类绕过限制。
`,
    code: `// 演示值传递与引用传递的差异
public class Main {
    // 基本类型：修改副本不影响原值
    static void modifyPrimitive(int x) {
        x = 999;
        System.out.println("方法内 x = " + x);
    }

    // 引用类型：通过地址修改对象内部状态
    static void modifyObject(int[] arr) {
        arr[0] = 999;
        System.out.println("方法内 arr[0] = " + arr[0]);
    }

    // 引用类型：重新赋值不影响外部引用
    static void reassignObject(int[] arr) {
        arr = new int[]{0, 0, 0};
        System.out.println("方法内重新赋值后 arr[0] = " + arr[0]);
    }

    // 可变参数
    static int sumAll(int... nums) {
        int total = 0;
        for (int n : nums) {
            total += n;
        }
        return total;
    }

    public static void main(String[] args) {
        // 演示基本类型传递
        int a = 1;
        modifyPrimitive(a);
        System.out.println("调用后 a = " + a);

        System.out.println("------");

        // 演示修改对象内部
        int[] data = {1, 2, 3};
        modifyObject(data);
        System.out.println("调用后 data[0] = " + data[0]);

        System.out.println("------");

        // 演示重新赋值不影响外部
        int[] data2 = {1, 2, 3};
        reassignObject(data2);
        System.out.println("调用后 data2[0] = " + data2[0]);

        System.out.println("------");

        // 演示可变参数
        System.out.println("sumAll() = " + sumAll());
        System.out.println("sumAll(1,2) = " + sumAll(1, 2));
        System.out.println("sumAll(1,2,3,4,5) = " + sumAll(1, 2, 3, 4, 5));
    }
}`
  },
  {
    id: "java-method-return",
    group: "方法与作用域",
    icon: "📤",
    title: "返回值详解",
    content: `# 返回值详解

方法的返回值是方法向调用方传递结果的通道。返回类型决定了方法能给出什么样的结果，也影响着方法的可用性和调用方式。

## 基本类型返回

直接返回一个基本类型值，如 \`int\`、\`double\`、\`boolean\`。这是最常见的返回形式。

## 引用类型返回

可以返回对象、数组、字符串等。注意：返回的是引用，调用方拿到引用后可以访问甚至修改对象内部状态。如果不想让外部修改，应返回副本（防御性拷贝）。

## void 返回

不返回任何值，方法执行完毕自然结束，或用 \`return;\` 提前结束。void 方法常用于执行动作（打印、修改状态、触发事件）。

## 多返回值技巧

Java 方法只能返回一个值，但有多种"曲线"方式返回多个结果：

1. **返回数组**：把多个同类型值放进数组返回，简单但不语义化
2. **返回对象**：自定义类封装多个字段，语义清晰，推荐
3. **返回 Record**：Java 16+ 的简洁数据载体，一行定义
4. **返回 Map**：键值对形式，灵活但类型不安全
5. **使用 out 参数模式**：传入可变对象，方法内填充

## return 在分支中的使用

\`return\` 常用于提前返回、分支返回不同值。注意：所有执行路径都必须有返回值（void 除外），否则编译错误。编译器会做确定性分析，无法证明所有路径都 return 就会报错。

\`\`\`java
String grade(int s) {
    if (s >= 90) return "优";
    if (s >= 60) return "及格";
    return "不及格"; // 兜底返回
}
\`\`\`

## 提前返回（卫语句）

用 return 提前处理异常情况，让主逻辑保持平铺，避免深层嵌套：

\`\`\`java
int process(int x) {
    if (x < 0) return -1;   // 卫语句
    // 主逻辑
    return x * 2;
}
\`\`\`

## 设计建议

- 方法应明确其返回意图，避免返回 \`null\`，可考虑 Optional
- 返回新对象而非内部可变字段引用，防止外部破坏封装
- 命名应体现返回内容，如 \`getMax\`、\`isReady\`、\`calculateTotal\`
- 计算方法返回结果，命令方法返回状态/void

## 小结与提示

返回值是方法交出结果的通道。基本类型直接返回数据，引用类型返回的是引用——若不想让调用方破坏内部状态，应返回防御性拷贝而非内部字段直接引用。Java 方法只能返回一个值，但通过数组、对象、Record、Map 等可"曲线"返回多个结果，其中 Record（Java 16+）最为简洁推荐，一行定义即得不可变数据载体。分支中的 \`return\` 必须覆盖所有路径，编译器会做确定性分析，无法证明全路径返回就报错。卫语句（提前 return 处理异常情况）能让主逻辑保持平铺，避免深层嵌套，是提升可读性的利器。设计上应避免返回 \`null\`，可用 \`Optional\` 表达"可能无值"，让调用方被迫处理空情况。返回新对象而非内部可变字段引用，是保护封装的常用手段。 此外，分支中的 \`return\` 必须覆盖所有执行路径，编译器会做确定性分析、无法证明全路径返回就报错；卫语句（提前 return 处理异常情况）能让主逻辑保持平铺、避免深层嵌套，是提升可读性的利器。多返回值场景推荐使用 Record（Java 16+），一行定义即得不可变数据载体，比数组更语义化、比自定义类更简洁。命令类方法（执行动作）通常返回 void 或状态码，计算类方法返回结果，命名应体现返回内容如 \`getMax\`、\`isReady\`、\`calculateTotal\`。
`,
    code: `// 演示各种返回值形式
public class Main {
    // 基本类型返回
    static int getMax(int a, int b) {
        return a > b ? a : b;
    }

    // 引用类型返回（返回新对象）
    static int[] reverse(int[] arr) {
        int[] result = new int[arr.length];
        for (int i = 0; i < arr.length; i++) {
            result[i] = arr[arr.length - 1 - i];
        }
        return result;
    }

    // 多返回值：使用数组
    static int[] divideWithRemainder(int a, int b) {
        return new int[]{a / b, a % b};
    }

    // 多返回值：使用 Record（Java 16+）
    record Result(int quotient, int remainder) {}

    static Result divide(int a, int b) {
        return new Result(a / b, a % b);
    }

    // 分支中的 return
    static String grade(int score) {
        if (score >= 90) return "优秀";
        if (score >= 80) return "良好";
        if (score >= 60) return "及格";
        return "不及格";
    }

    public static void main(String[] args) {
        System.out.println("最大值 = " + getMax(10, 20));

        int[] original = {1, 2, 3, 4, 5};
        int[] reversed = reverse(original);
        System.out.print("反转后：");
        for (int n : reversed) {
            System.out.print(n + " ");
        }
        System.out.println();

        int[] dr = divideWithRemainder(17, 5);
        System.out.println("17/5 商=" + dr[0] + " 余=" + dr[1]);

        Result r = divide(17, 5);
        System.out.println("Record: 商=" + r.quotient() + " 余=" + r.remainder());

        System.out.println("成绩 85 -> " + grade(85));
        System.out.println("成绩 50 -> " + grade(50));
    }
}`
  },
  {
    id: "java-method-overloading",
    group: "方法与作用域",
    icon: "⚖️",
    title: "方法重载",
    content: `# 方法重载

方法重载（Overloading）允许在同一个类中定义多个同名方法，只要它们的**参数列表不同**。这是实现静态多态（编译期多态）的机制，让 API 更灵活、更易用。

## 重载规则

1. **方法名必须相同**
2. **参数列表必须不同**：参数个数、类型、顺序任一不同即可
3. 返回类型、访问修饰符、抛出异常**不影响**重载（不能仅靠这些区分）
4. 可以在父类与子类之间重载

\`\`\`java
int add(int a, int b) { ... }
double add(double a, double b) { ... }   // 类型不同，合法重载
int add(int a, int b, int c) { ... }     // 个数不同，合法重载
\`\`\`

## 重载 vs 重写

二者容易混淆，但本质不同：

| 对比项 | 重载 Overload | 重写 Override |
|--------|---------------|---------------|
| 发生位置 | 同一个类 | 父子类之间 |
| 方法名 | 相同 | 相同 |
| 参数列表 | 必须不同 | 必须相同 |
| 返回类型 | 无关 | 相同或协变 |
| 绑定时机 | 编译期（静态分派）| 运行期（动态分派）|

简单记：重载是"同名不同参"，重写是"同签名改实现"。

## 重载解析

调用重载方法时，编译器按以下顺序匹配：
1. 精确类型匹配
2. 自动类型转换（ widening，如 int → long → float → double）
3. 自动装箱/拆箱（int → Integer）
4. 可变参数

如果经过这些阶段仍有多个候选，编译器会选择"最具体"的；若无法确定最具体，则报歧义错误。

## 自动类型转换与重载

当没有精确匹配时，编译器会选择"最具体"的方法。例如传 \`int\` 时优先匹配 \`int\` 参数方法，其次 \`long\`，再 \`Float\` 等。模糊匹配会编译报错。

## 参数顺序不同也算重载

\`join(String, int)\` 和 \`join(int, String)\` 是合法重载，但不推荐滥用，容易让调用者混淆参数顺序。

## 设计考虑

- 重载应保证同名方法语义一致，只是参数不同
- 避免参数数量相同、类型相近导致调用歧义
- 过度使用重载会降低可读性，必要时改名更清晰
- 重载方法之间应避免完全不同的行为，否则违背直觉

## 小结与提示

方法重载是 Java 实现编译期多态的核心机制，规则只有一条：同名方法的参数列表必须不同（个数、类型或顺序任一不同），返回类型、访问修饰符、抛出异常都不能作为区分依据——这正是仅靠返回类型无法重载的根本原因。调用时编译器按"精确匹配、自动拓宽、装箱拆箱、可变参数"四个阶段逐级解析，若仍无法确定最具体的方法则报歧义错误，因此设计重载时要避免参数类型过于接近导致调用方困惑。重载与重写常被混淆：重载发生在同一个类内、属编译期静态分派；重写发生在父子类之间、属运行期动态分派，二者本质不同切勿张冠李戴。实践中应保证同名方法语义一致、只是参数形式不同，切勿让同名方法做完全不相干的事，否则违背直觉、埋下隐患。参数顺序不同虽算合法重载，但不推荐滥用，因为调用者很容易写反顺序而产生隐蔽 bug。 总之，重载是让 API 更灵活友好的利器，但务必遵循"同名同义"的原则，让每个重载版本都做语义一致的事，配合清晰的命名与文档，才能让调用方用得放心。设计 API 时若发现重载容易引起歧义，宁可改名（如 \`valueOf\` 与 \`parse\`）也不要硬凑重载。
`,
    code: `// 演示方法重载与重载解析
public class Main {
    // 参数个数不同
    static int add(int a, int b) {
        return a + b;
    }

    static int add(int a, int b, int c) {
        return a + b + c;
    }

    // 参数类型不同
    static double add(double a, double b) {
        return a + b;
    }

    // 参数顺序不同
    static String join(String a, int b) {
        return a + b;
    }

    static String join(int a, String b) {
        return a + b;
    }

    // 重载解析演示
    static void show(int x) {
        System.out.println("int: " + x);
    }

    static void show(long x) {
        System.out.println("long: " + x);
    }

    static void show(Integer x) {
        System.out.println("Integer: " + x);
    }

    public static void main(String[] args) {
        System.out.println("add(1,2) = " + add(1, 2));
        System.out.println("add(1,2,3) = " + add(1, 2, 3));
        System.out.println("add(1.5,2.5) = " + add(1.5, 2.5));

        System.out.println("join(\\\"A\\\",1) = " + join("A", 1));
        System.out.println("join(1,\\\"B\\\") = " + join(1, "B"));

        System.out.println("------重载解析------");
        show(10);       // 精确匹配 int
        show(10L);      // 匹配 long
        show(Integer.valueOf(10)); // 匹配 Integer
    }
}`
  },
  {
    id: "java-varargs",
    group: "方法与作用域",
    icon: "📦",
    title: "可变参数 varargs",
    content: `# 可变参数 varargs

可变参数（varargs）让方法能够接受任意数量的参数，是 Java 5 引入的语法糖，让 API 更灵活。\`String.format\`、\`System.out.printf\` 等都依赖它。

## varargs 语法

在参数类型后加三个点 \`...\`：

\`\`\`java
void log(String... messages) { ... }
\`\`\`

调用时可传零个、一个或多个参数，也可以直接传一个数组。

## 本质是数组

varargs 在编译后会被转换为数组。在方法内部，可变参数就是一个数组，可以用 \`length\` 和下标访问。所以 \`int... nums\` 等价于 \`int[] nums\`，区别只在调用形式。

\`\`\`java
void log(String... msgs) {
    // msgs 实际是 String[]
    for (String m : msgs) { ... }
}
\`\`\`

## 可变参数与重载

可变参数会参与重载解析，且优先级最低（最不具体）。当存在精确匹配或普通数组匹配时，优先选择它们，避免歧义。例如同时有 \`f(int a, int b)\` 和 \`f(int... a)\`，调用 \`f(1,2)\` 会选前者。

## 可变参数位置

**每个方法最多一个可变参数，且必须放在参数列表最后**。否则编译器无法判断参数边界。例如 \`f(String prefix, String... items)\` 合法，\`f(String... items, String prefix)\` 非法。

## 传数组 vs 传可变参数

调用 varargs 方法时传数组是完全合法的，因为本质相同。但反过来不行：声明为数组的方法不能用散列参数调用。

\`\`\`java
void f(int[] a) {}
void g(int... a) {}
f(1, 2, 3);   // 编译错误
g(new int[]{1,2,3}); // 合法
\`\`\`

## 性能与注意点

- 每次调用会创建新数组，频繁调用有微小开销
- 传 \`null\` 给 varargs 会得到 \`null\` 数组（而非含一个 null 元素的数组），需小心 NPE
- 泛型 varargs 会有堆污染警告，可加 \`@SafeVarargs\` 抑制

## 适用场景

- 日志/格式化方法（不定数量参数）
- 聚合计算（求和、最大值、拼接）
- 构造集合的工厂方法：\`List.of(1,2,3)\`

## 小结与提示

可变参数（varargs）用"类型... 名"声明，本质是数组，让方法接受任意数量参数，\`String.format\`、\`printf\` 都依赖它。记住三条铁律：每个方法最多一个 varargs；必须放在参数列表末尾；传数组与传散列参数等价，但声明为数组的方法不能用散列参数调用。重载时 varargs 优先级最低，编译器优先选精确匹配或普通数组版本，避免歧义。性能上每次调用会创建新数组，高频调用有微小开销；传 \`null\` 给 varargs 会得到 \`null\` 数组而非含一个 \`null\` 的单元素数组，需警惕 NPE；泛型 varargs 有堆污染警告，可加 \`@SafeVarargs\` 抑制。合理使用 varargs 能让工厂方法（如 \`List.of\`、\`Map.of\`）与日志方法极其优雅，是现代 Java API 设计的常用手段。 使用时还需注意：传 \`null\` 给 varargs 会得到 \`null\` 数组而非含一个 \`null\` 的单元素数组，需警惕 \`NullPointerException\`；泛型 varargs 会有堆污染警告，可加 \`@SafeVarargs\` 注解抑制。每次调用都会创建新数组，高频调用有微小开销，性能敏感场景可考虑重载为固定参数版本。
`,
    code: `// 演示可变参数的使用
public class Main {
    // 可变参数求和
    static int sum(int... nums) {
        int total = 0;
        for (int n : nums) {
            total += n;
        }
        return total;
    }

    // 可变参数 + 普通参数（varargs 必须在最后）
    static String formatList(String prefix, String... items) {
        StringBuilder sb = new StringBuilder(prefix);
        for (String item : items) {
            sb.append(" [").append(item).append("]");
        }
        return sb.toString();
    }

    // 传数组给 varargs
    static int countArgs(Object... args) {
        return args.length;
    }

    public static void main(String[] args) {
        // 传零个参数
        System.out.println("sum() = " + sum());
        // 传多个参数
        System.out.println("sum(1,2,3) = " + sum(1, 2, 3));
        System.out.println("sum(1,2,3,4,5,6) = " + sum(1, 2, 3, 4, 5, 6));

        // 传数组（等价于散列参数）
        int[] arr = {10, 20, 30};
        System.out.println("sum(arr) = " + sum(arr));

        // varargs 在普通参数之后
        System.out.println(formatList("水果：", "苹果", "香蕉", "橙子"));

        // 统计参数个数
        System.out.println("参数个数 = " + countArgs("a", 1, true, 3.14));
    }
}`
  },
  {
    id: "java-recursion",
    group: "方法与作用域",
    icon: "🌀",
    title: "递归",
    content: `# 递归

递归是方法直接或间接调用自身的编程技巧。它把复杂问题分解为规模更小的同类子问题，是解决树形、分治问题的利器。递归的思维方式：先相信递归方法对更小规模是正确的，再在此基础上构建当前规模的解。

## 递归要素

每个递归方法必须包含两部分：

1. **基线条件（base case）**：递归的出口，不再调用自身，防止无限递归
2. **递归条件（recursive case）**：向基线条件逼近，调用自身处理更小规模

缺少基线条件会导致无限递归，最终栈溢出。递归条件必须让问题规模不断缩小，最终能触达基线条件。

## 经典示例：阶乘

\`n! = n * (n-1)!\`，其中 \`0! = 1\` 是基线条件。

\`\`\`java
long factorial(int n) {
    if (n <= 1) return 1;        // 基线
    return n * factorial(n - 1); // 递归
}
\`\`\`

## 经典示例：斐波那契

\`fib(n) = fib(n-1) + fib(n-2)\`，基线 \`fib(0)=0, fib(1)=1\`。朴素递归存在大量重复计算（指数级时间复杂度），可用记忆化（缓存已算结果）优化为线性。

## 递归调用栈

每次递归调用都会在栈上压入一个栈帧，保存局部变量和返回地址。递归深度过大会撑爆栈内存，抛出 \`StackOverflowError\`。可以把递归过程想象成一摞盘子：每调用一层摞一个，返回时取走一个。

## 栈溢出

JVM 默认栈大小通常为 512KB~1MB，递归深度达到上万层就可能溢出。深递归应改写为迭代，或用显式栈模拟。

## 尾递归

若递归调用是方法最后一步操作，称为尾递归。理论上可优化为循环不增长栈。**但 JVM 不做尾递归优化**，因此 Java 中尾递归仍会消耗栈，不能依赖它解决栈溢出。

## 何时用递归

- 问题本身递归定义（树、图遍历、目录扫描）
- 分治算法（归并排序、快速排序）
- 回溯问题（全排列、八皇后、迷宫）
- 简单场景优先用迭代，避免栈风险

## 递归 vs 迭代

任何递归都能改写成迭代（用循环+栈）。递归代码更简洁、更贴近问题定义；迭代效率更高、无栈风险。权衡可读性与性能做选择。

## 小结与提示

递归是把复杂问题拆成规模更小的同类子问题的编程技巧，核心要素有二：基线条件（递归出口）和递归条件（向基线逼近）。缺少基线条件会无限递归直至栈溢出，递归条件必须让问题规模不断缩小、最终触达出口。经典案例如阶乘 \`n! = n*(n-1)!\` 与斐波那契 \`fib(n)=fib(n-1)+fib(n-2)\`，但朴素斐波那契存在大量重复计算、呈指数级时间复杂度，必须用记忆化（缓存已算结果）优化为线性。每次递归调用都会在栈上压入一个栈帧保存局部变量与返回地址，深度过大会撑爆栈内存抛出 \`StackOverflowError\`，JVM 默认栈大小通常仅 512KB~1MB。理论上尾递归可优化为循环不增长栈，但 JVM 不做尾递归优化，因此 Java 中不能依赖它解决栈溢出，深递归应改写为迭代或用显式栈模拟。何时用递归？问题本身递归定义（树遍历、目录扫描）、分治算法（归并排序、快速排序）、回溯问题（全排列、八皇后）等场景最合适；简单场景优先用迭代，避免栈风险。任何递归都能改写成迭代，递归胜在简洁贴近问题定义，迭代胜在效率与无栈风险，应权衡可读性与性能做选择。 总之，递归是优雅的思维方式，但要用好它必须时刻警惕栈深度与重复计算两大陷阱——前者靠改迭代或显式栈规避，后者靠记忆化或动态规划消除。
`,
    code: `// 演示阶乘与斐波那契递归
public class Main {
    // 阶乘递归
    static long factorial(int n) {
        if (n < 0) throw new IllegalArgumentException("n 不能为负");
        if (n <= 1) return 1;          // 基线条件
        return n * factorial(n - 1);   // 递归条件
    }

    // 斐波那契递归（朴素）
    static int fib(int n) {
        if (n < 2) return n;           // 基线条件
        return fib(n - 1) + fib(n - 2);
    }

    // 斐波那契记忆化优化
    static long fibMemo(int n, long[] memo) {
        if (n < 2) return n;
        if (memo[n] != 0) return memo[n];
        memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
        return memo[n];
    }

    // 累加：演示递归调用过程
    static int sumTo(int n) {
        System.out.println("进入 sumTo(" + n + ")");
        if (n == 1) {
            System.out.println("基线条件触发，返回 1");
            return 1;
        }
        int result = n + sumTo(n - 1);
        System.out.println("sumTo(" + n + ") = " + result);
        return result;
    }

    public static void main(String[] args) {
        System.out.println("5! = " + factorial(5));
        System.out.println("fib(10) = " + fib(10));

        long[] memo = new long[50];
        System.out.println("fibMemo(45) = " + fibMemo(45, memo));

        System.out.println("------递归过程------");
        sumTo(4);
    }
}`
  },
  {
    id: "java-scope",
    group: "方法与作用域",
    icon: "👁️",
    title: "变量作用域",
    content: `# 变量作用域

作用域决定变量在何处可见、可访问。Java 的作用域规则相对严格，理解它能避免大量编译错误和逻辑 bug。作用域越小，代码越容易理解、越不容易出错。

## 块作用域

由 \`{\` 和 \`}\` 包裹的代码块构成一个作用域。在块内声明的变量，出了块就不可见。

\`\`\`java
{
    int x = 10;
}
// 这里访问不到 x
\`\`\`

if、for、while 的 \`{\}\` 都是块作用域。即使没有 \`{\}\`，\`if (cond) int x;\` 这样的单语句声明也是非法的——声明必须在一个块内。

## 方法作用域

方法的参数和在方法体内声明的变量（局部变量）从声明处到方法结束都可见。方法之间不能互相访问对方的局部变量，每个方法调用有独立的局部变量空间。

## 类作用域

实例变量和类变量在整个类内可见，所有方法都能访问。类变量还能被静态方法直接访问。实例变量在实例方法中通过隐式的 \`this\` 访问。

## 变量遮蔽 shadowing

当内部作用域声明了与外部作用域同名的变量时，内部变量"遮蔽"了外部变量，外部变量在内部不可见。这是常见的 bug 来源，应避免同名遮蔽。

\`\`\`java
class C {
    int x = 1;
    void m() {
        int x = 2; // 遮蔽了实例变量 x，this.x 仍是 1
    }
}
\`\`\`

注意：Java 不允许在同一块内重复声明同名变量，但允许内层块遮蔽外层变量（成员变量可被局部变量遮蔽）。

## 循环变量作用域

for 循环中声明的循环变量，其作用域仅限循环体及条件判断部分。每次循环迭代是同一变量被反复赋值（不是新变量）。while 循环的计数器需在循环外声明，作用域更大，需注意。

## 嵌套作用域

内层作用域可以访问外层变量，反之不行。这形成"由外向内可见"的层级结构。变量在其声明之前的位置也不可访问（声明顺序规则）。

## 作用域设计原则

- 最小作用域原则：变量声明尽量靠近首次使用处
- 避免在大的方法顶部集中声明所有变量
- 循环变量尽量在 for 头部声明，自动限定作用域
- 避免遮蔽，同名变量改用不同名字

## 小结与提示

作用域决定变量在何处可见可访问，Java 的作用域规则相对严格，理解它能避免大量编译错误与逻辑 bug。块作用域由大括号包裹构成，块内声明的变量出块即不可见；if、for、while 的花括号都是块作用域，即使没有花括号单语句声明也是非法的。方法作用域让参数与方法体内声明的局部变量从声明处到方法结束都可见，方法之间不能互相访问对方局部变量。类作用域让实例变量与类变量在整个类内可见，所有方法都能访问。变量遮蔽是常见 bug 来源：当内部作用域声明了与外部同名变量时，内部变量遮蔽外部变量，外部变量在内部不可见，应避免同名遮蔽。循环变量作用域仅限循环体及条件判断部分，for 循环每次迭代是同一变量被反复赋值而非新变量，while 循环的计数器需在循环外声明、作用域更大需注意。嵌套作用域形成"由外向内可见"的层级结构，内层可访问外层变量反之不行，变量在声明之前的位置也不可访问。设计上遵循最小作用域原则：变量声明尽量靠近首次使用处，避免在方法顶部集中声明，循环变量尽量在 for 头部声明自动限定作用域，避免遮蔽、同名变量改用不同名字。作用域越小代码越容易理解、越不容易出错。 总之，理解作用域是写出正确 Java 代码的前提，它决定了变量的可见范围与生命周期，遵循最小作用域原则能让代码更安全、更易读、更易维护。
`,
    code: `// 演示各种作用域
public class Main {
    static int classVar = 100; // 类作用域

    static void demoBlock() {
        // 块作用域演示
        if (true) {
            int blockVar = 10;
            System.out.println("块内 blockVar = " + blockVar);
            System.out.println("块内可访问 classVar = " + classVar);
        }
        // blockVar 在此处不可见
    }

    static void demoLoopScope() {
        for (int i = 0; i < 3; i++) {
            int temp = i * 10;
            System.out.println("i=" + i + ", temp=" + temp);
        }
        // i 和 temp 在此处不可见
    }

    static int outerVar = 50; // 类变量，会被局部变量遮蔽

    static void demoShadowing() {
        int outerVar = 999; // 遮蔽类变量 outerVar
        System.out.println("局部 outerVar = " + outerVar);
        System.out.println("类变量 outerVar = " + Main.outerVar);
    }

    static void demoNesting() {
        int a = 1;
        if (true) {
            int b = 2;
            System.out.println("内层可访问外层 a = " + a);
            if (true) {
                int c = 3;
                System.out.println("最内层 a+b+c = " + (a + b + c));
            }
        }
    }

    public static void main(String[] args) {
        demoBlock();
        demoLoopScope();
        demoShadowing();
        demoNesting();
    }
}`
  },
  {
    id: "java-local-vars",
    group: "方法与作用域",
    icon: "📍",
    title: "局部变量",
    content: `# 局部变量

局部变量是声明在方法、构造器或代码块内部的变量。它们的生命周期短、作用域小，是程序中最常用的变量类型。理解局部变量的特性有助于写出高效且无 bug 的代码。

## 局部变量声明

\`\`\`java
int x;
double pi = 3.14;
String name = "Tom";
\`\`\`

可一次声明多个同类型变量：\`int a, b, c;\`。建议声明时即初始化，避免使用未赋值变量。

## 必须初始化

**局部变量没有默认值**，使用前必须显式初始化，否则编译错误。这与成员变量不同（成员变量有默认值）。

\`\`\`java
int x;
System.out.println(x); // 编译错误：可能尚未初始化
\`\`\`

编译器会做定值分析，只有能证明变量在使用前一定被赋值才允许通过。例如 if 分支赋值后使用，可能因分支不可达而报错。

## 生命周期

局部变量在声明处创建，在所属块/方法结束时销毁。它们存在于**栈**上（基本类型直接存值，引用类型存地址），方法返回后立即回收，不参与垃圾回收。这使得局部变量的访问非常快。

## 栈帧

每次方法调用都会创建一个栈帧，存储该方法的局部变量、参数、返回地址。方法返回时栈帧弹出，局部变量随之消失。递归调用每层都有独立栈帧，所以递归层之间的同名局部变量互不影响。

## final 局部变量

用 \`final\` 修饰的局部变量只能赋值一次，赋值后不可更改。常用于：
- 定义常量
- Lambda 表达式捕获的变量必须 effectively final
- 防止意外修改，表明"这个值不会变"的意图

\`\`\`java
final int LIMIT = 100;
// LIMIT = 200; // 编译错误
\`\`\`

## effectively final

即使不写 \`final\`，只要变量赋值后不再改变，就是"effectively final"。Lambda 和匿名内部类只能捕获 effectively final 的局部变量。这是 Java 8 引入的概念，让代码更简洁。

## 最佳实践

- 就近声明，缩小作用域，变量声明靠近首次使用
- 声明时尽量初始化
- 不修改的变量加 \`final\` 表明意图
- 避免在一个方法中声明过多局部变量，考虑拆分方法

## 小结与提示

局部变量是声明在方法、构造器或代码块内部的变量，生命周期短、作用域小，是程序中最常用的变量类型。与成员变量最大的区别是：局部变量没有默认值，使用前必须显式初始化，否则编译错误——编译器会做定值分析，只有能证明变量在使用前一定被赋值才允许通过。局部变量在声明处创建、所属块或方法结束时销毁，存在于栈上（基本类型直接存值、引用类型存地址），方法返回后立即回收不参与垃圾回收，访问非常快。每次方法调用都会创建一个栈帧存储该方法的局部变量、参数、返回地址，方法返回时栈帧弹出局部变量随之消失；递归调用每层都有独立栈帧，所以递归层之间的同名局部变量互不影响。用 \`final\` 修饰的局部变量只能赋值一次，常用于定义常量、防止意外修改、表明"这个值不会变"的意图。即使不写 \`final\`，只要变量赋值后不再改变就是"effectively final"，Lambda 和匿名内部类只能捕获 effectively final 的局部变量，这是 Java 8 引入的概念让代码更简洁。最佳实践：就近声明缩小作用域、声明时尽量初始化、不修改的变量加 \`final\` 表明意图、避免在一个方法中声明过多局部变量而应考虑拆分方法。
`,
    code: `// 演示局部变量的特性
public class Main {
    static void demoInit() {
        int x;
        // 必须初始化后才能使用
        x = 10;
        System.out.println("初始化后 x = " + x);

        // 声明并初始化
        int y = 20;
        System.out.println("y = " + y);
    }

    static void demoFinal() {
        final double PI = 3.14159;
        // PI = 3.14; // 编译错误：final 变量不可重新赋值
        System.out.println("圆周率 = " + PI);

        // effectively final：不写 final 但只赋值一次
        int count = 0;
        Runnable r = () -> System.out.println("捕获 count = " + count);
        r.run();
    }

    static int demoStackFrame(int n) {
        // 每次调用都有独立栈帧
        int local = n * 2;
        System.out.println("栈帧内 local = " + local);
        if (n > 1) {
            return local + demoStackFrame(n - 1);
        }
        return local;
    }

    static void demoScope() {
        for (int i = 0; i < 3; i++) {
            final int step = i + 1; // final 局部变量
            System.out.println("第 " + step + " 步");
        }
    }

    public static void main(String[] args) {
        demoInit();
        demoFinal();
        System.out.println("递归累加 = " + demoStackFrame(3));
        demoScope();
    }
}`
  },
  {
    id: "java-member-vars",
    group: "方法与作用域",
    icon: "🏠",
    title: "成员变量（实例变量）",
    content: `# 成员变量（实例变量）

成员变量是声明在类内、方法外的变量，也叫实例变量（非 static）或字段。它们属于对象，每个对象有自己的一份副本，是对象"状态"的载体。

## 实例变量

\`\`\`java
class Person {
    String name;  // 实例变量
    int age;
}
\`\`\`

每个 \`Person\` 对象都有独立的 \`name\` 和 \`age\`，互不影响。修改一个对象的字段不会影响其他对象。

## 默认值

成员变量**有默认值**，无需显式初始化即可使用：

| 类型 | 默认值 |
|------|--------|
| byte/short/int/long | 0 |
| float/double | 0.0 |
| char | '\\u0000' |
| boolean | false |
| 引用类型 | null |

这是与局部变量最重要的区别——局部变量必须手动初始化，成员变量有"兜底"默认值。但依赖默认值往往是 bug 来源，建议显式初始化。

## 生命周期

实例变量随对象创建（new）而诞生，随对象被垃圾回收而消亡。它们存在于**堆**上，生命周期与对象一致。只要还有引用指向对象，实例变量就一直存在。

## 与局部变量区别

| 对比项 | 成员变量 | 局部变量 |
|--------|----------|----------|
| 位置 | 类内方法外 | 方法/块内 |
| 默认值 | 有 | 无（必须初始化）|
| 存储 | 堆 | 栈 |
| 生命周期 | 与对象相同 | 与方法调用相同 |
| 访问修饰符 | 可用 | 不可用 |

## 初始化时机

对象的实例变量按以下顺序初始化：
1. 默认值初始化（先赋予默认值，如 0、null）
2. 显式初始化（声明时赋值）
3. 构造器初始化（构造器中赋值）
4. 初始化块（按声明顺序执行）

理解顺序很重要：构造器中赋值会覆盖显式初始化的值。

## 封装建议

实例变量通常设为 \`private\`，通过 getter/setter 访问，保证数据安全。这遵循"信息隐藏"原则，外部不能直接篡改内部状态，所有修改都经过方法把关，便于校验和维护。

\`\`\`java
class Person {
    private int age;
    public void setAge(int a) { if (a >= 0) age = a; } // 校验
}
\`\`\`

## 小结与提示

成员变量（实例变量）是声明在类内方法外的变量，属于对象，每个对象有自己的一份副本，是对象"状态"的载体。与局部变量最重要的区别是：成员变量有默认值（数值类型为 0、布尔为 false、引用为 null），无需显式初始化即可使用，但依赖默认值往往是 bug 来源、建议显式初始化。实例变量随对象创建（new）而诞生、随对象被垃圾回收而消亡，存在于堆上，生命周期与对象一致。对象的实例变量按"默认值初始化、显式初始化、构造器初始化、初始化块"的顺序初始化，构造器中赋值会覆盖显式初始化的值，理解顺序很重要。每个对象有独立的实例变量副本互不影响，修改一个对象的字段不会影响其他对象。封装建议将实例变量设为 \`private\`、通过 getter/setter 访问，遵循"信息隐藏"原则，外部不能直接篡改内部状态，所有修改都经过方法把关、便于校验和维护。与局部变量对比：成员变量位于类内方法外、有默认值、存于堆、生命周期与对象相同、可用访问修饰符；局部变量位于方法或块内、无默认值必须初始化、存于栈、生命周期与方法调用相同、不可用访问修饰符。掌握二者差异是写出健壮面向对象代码的基础。
`,
    code: `// 演示成员变量（实例变量）
public class Main {
    public static void main(String[] args) {
        Person p1 = new Person();
        // 演示默认值
        System.out.println("默认值 name=" + p1.name + ", age=" + p1.age);

        Person p2 = new Person("张三", 20);
        System.out.println(p2.describe());

        p2.birthday();
        System.out.println("生日后：" + p2.describe());

        // 每个对象独立
        System.out.println("p1 age=" + p1.age + ", p2 age=" + p2.age);
    }
}

class Person {
    // 实例变量（包级可见，便于演示默认值）
    String name;       // 默认 null
    int age;           // 默认 0
    private String[] hobbies = new String[3]; // 显式初始化

    // 构造器初始化
    Person() {}

    Person(String name, int age) {
        this.name = name;
        this.age = age;
        hobbies[0] = "阅读";
    }

    // 实例方法访问实例变量
    String describe() {
        return name + "，" + age + " 岁，爱好：" + hobbies[0];
    }

    void birthday() {
        age++; // 修改自己的实例变量
    }
}`
  },
  {
    id: "java-class-vars",
    group: "方法与作用域",
    icon: "🏛️",
    title: "类变量（static）",
    content: `# 类变量（static）

类变量用 \`static\` 修饰，属于类本身而非某个对象。无论创建多少对象，类变量只有一份，被所有实例共享。它是实现"类级别状态"的手段。

## static 变量

\`\`\`java
class Counter {
    static int count = 0; // 类变量，所有实例共享
}
\`\`\`

类变量在类加载时创建，程序结束时销毁，生命周期最长——比任何对象都长。

## 类共享

所有对象访问的是同一个类变量，一个对象修改它，其他对象看到的也是修改后的值。常用于统计实例数量、全局配置、缓存、自增 ID 等。

## 访问方式

- **推荐**：\`类名.变量名\`，如 \`Counter.count\`，明确表明是类变量
- 也可通过对象访问：\`obj.count\`（不推荐，易误导成实例变量）
- 类内可直接用变量名访问

## 类变量初始化

1. 默认值（同成员变量：0、false、null）
2. 显式初始化（声明时赋值）
3. 静态初始化块：\`static { ... }\`，类加载时执行一次

静态初始化块适合做复杂初始化，如读取配置文件、加载驱动、初始化静态 Map。多个静态块按声明顺序执行。

\`\`\`java
static {
    // 类加载时执行一次
    loadConfig();
}
\`\`\`

## static import

\`import static\` 可以静态导入类的静态成员，使用时省略类名：

\`\`\`java
import static java.lang.Math.PI;
double r = 2 * PI; // 直接用 PI
\`\`\`

适合频繁使用的常量（如 \`Math.PI\`、\`Color.RED\`），但过度使用会降低可读性，看不出常量来源。

## 与实例变量对比

| 对比项 | 类变量 | 实例变量 |
|--------|--------|----------|
| 修饰符 | static | 无 |
| 归属 | 类 | 对象 |
| 份数 | 一份 | 每对象一份 |
| 访问 | 类名/对象名 | 对象名 |
| 生命周期 | 类加载到卸载 | 对象创建到回收 |

## 使用注意

类变量是全局共享状态，多线程下需注意同步。过度使用 static 会增加耦合，难以测试。能用实例变量解决就不要用类变量。

## 小结与提示

类变量用 \`static\` 修饰，属于类本身而非某个对象，无论创建多少对象类变量只有一份、被所有实例共享，是实现"类级别状态"的手段。类变量在类加载时创建、程序结束时销亡，生命周期最长——比任何对象都长。所有对象访问的是同一个类变量，一个对象修改它其他对象看到的也是修改后的值，常用于统计实例数量、全局配置、缓存、自增 ID 等。访问方式推荐用 \`类名.变量名\`（如 \`Counter.count\`）明确表明是类变量，也可通过对象访问但不推荐、易误导成实例变量。类变量初始化按"默认值、显式初始化、静态初始化块"顺序进行，静态初始化块 \`static { ... }\` 在类加载时执行一次，适合做复杂初始化如读取配置文件、加载驱动、初始化静态 Map，多个静态块按声明顺序执行。\`import static\` 可静态导入类的静态成员、使用时省略类名，适合频繁使用的常量（如 \`Math.PI\`）但过度使用会降低可读性。与实例变量对比：类变量用 static 修饰、归属类、只有一份、用类名或对象名访问、生命周期从类加载到卸载；实例变量无 static、归属对象、每对象一份、用对象名访问、生命周期从对象创建到回收。使用注意：类变量是全局共享状态、多线程下需注意同步，过度使用 static 会增加耦合难以测试，能用实例变量解决就不要用类变量。
`,
    code: `// 演示 static 类变量
public class Main {
    public static void main(String[] args) {
        // 通过类名访问
        System.out.println("初始计数 = " + Counter.getCount());

        Counter c1 = new Counter();
        Counter c2 = new Counter();
        Counter c3 = new Counter();

        System.out.println("创建 3 个后计数 = " + Counter.getCount());
        System.out.println("c1 看到的计数 = " + c1.getCount()); // 同一个值

        // 演示静态常量
        System.out.println("圆周率 = " + MathConstants.PI);
        System.out.println("圆面积 = " + (MathConstants.PI * 2 * 2));
    }
}

class Counter {
    private static int count = 0; // 类变量
    private int id;               // 实例变量

    // 静态初始化块
    static {
        System.out.println("Counter 类已加载");
    }

    Counter() {
        count++;          // 每创建一个对象，共享计数加一
        id = count;
        System.out.println("创建第 " + id + " 个 Counter");
    }

    static int getCount() {
        return count;
    }
}

class MathConstants {
    // 静态常量
    static final double PI = 3.14159265;
}`
  },
  {
    id: "java-pass-by-value",
    group: "方法与作用域",
    icon: "🔀",
    title: "参数传递机制深入",
    content: `# 参数传递机制深入

"Java 是值传递还是引用传递？"是经典面试题。准确答案：**Java 只有值传递**。但理解这一点需要厘清"值"在不同类型下的含义。很多有经验的程序员也会在这个问题上犯错。

## Java 只有值传递

方法调用时，实参的**值**被复制一份传给形参。无论基本类型还是引用类型，传递的都是"副本"，方法内的形参与外部的实参是两个独立变量。形参的改变不会影响实参变量本身。

## 基本类型副本

基本类型的"值"就是数据本身。传参时复制数据，方法内修改形参不影响外部。

\`\`\`java
void f(int x) { x = 100; }
int a = 1; f(a); // a 仍是 1
\`\`\`

## 引用类型副本

引用类型的"值"是对象的**地址**。传参时复制的是地址（一份纸条的复印件），因此形参和实参指向同一个对象。

- 修改对象内部状态：外部能看到（因为指向同一对象）
- 重新赋值形参：外部看不到（形参这张纸条换了对象，实参纸条没动）

## 修改对象内部 vs 重新赋值

这是最容易混淆的点，也是面试核心：

\`\`\`java
void modify(int[] a) { a[0] = 9; }           // 改对象内部，外部可见
void reassign(int[] a) { a = new int[]{9}; } // 换纸条，外部不可见
\`\`\`

记住：你能通过引用修改对象"里面"的东西，但不能让外部的引用变量"指向"新对象。

## 图解

把引用变量想象成"写着地址的纸条"：
- 基本类型传参：复印纸条上的数字（值），原件不变
- 引用类型传参：复印纸条本身（地址），两张纸条指向同一栋房子
  - 通过复印件进入房子装修 → 原房子也变了
  - 把复印件擦掉写新地址 → 原纸条地址没变

## 为什么 String 表现像基本类型

String 是引用类型，但不可变。任何"修改"操作（concat、replace、+）都返回新对象，原 String 不变，看起来像基本类型。所以方法内 \`s = s + "x"\` 不影响外部。

## 常见误区澄清

1. ❌ "Java 引用类型是引用传递" → ✅ 是值传递（传地址的副本）
2. ❌ "方法内 new 能替换外部变量" → ✅ 做不到
3. ❌ "Integer 能在方法内被修改" → ✅ Integer 不可变，赋值会指向新对象

## 一个推论

Java 无法实现 \`swap(a, b)\` 交换两个基本类型变量。需要交换时，返回数组或对象，或使用原子引用类。

## 小结与提示

"Java 是值传递还是引用传递"是经典面试题，准确答案只有一句：Java 只有值传递，没有引用传递。方法调用时实参的值被复制一份传给形参，无论基本类型还是引用类型传递的都是"副本"，方法内的形参与外部实参是两个独立变量，形参的改变不会影响实参变量本身。基本类型的"值"就是数据本身，传参时复制数据、方法内修改形参不影响外部；引用类型的"值"是对象的地址，传参时复制的是地址（一份纸条的复印件），因此形参和实参指向同一个对象——修改对象内部状态外部能看到（因为指向同一对象），重新赋值形参外部看不到（形参这张纸条换了对象、实参纸条没动）。这是最容易混淆的点，记住十字口诀"改内容可以、换引用不行"。String 是引用类型但不可变，任何"修改"操作都返回新对象、原 String 不变，看起来像基本类型，所以方法内 \`s = s + "x"\` 不影响外部。包装类（Integer 等）同样不可变，方法内赋值会指向新对象、不影响外部。常见误区澄清：Java 引用类型不是引用传递而是传地址的副本；方法内 new 不能替换外部变量；Integer 不能在方法内被修改。一个推论：Java 无法实现 swap 交换两个基本类型变量，需要交换时返回数组或对象或使用原子引用类。
`,
    code: `// 深入演示 Java 值传递
public class Main {
    // 基本类型：副本，修改无效
    static void tryChange(int x) {
        x = 999;
    }

    // 引用类型：修改对象内部，外部可见
    static void changeInner(int[] arr) {
        arr[0] = 999;
    }

    // 引用类型：重新赋值形参，外部不可见
    static void reassignRef(int[] arr) {
        arr = new int[]{0, 0, 0};
    }

    // String 不可变：拼接返回新对象，原字符串不变
    static void modifyString(String s) {
        s = s + " world";
        System.out.println("方法内 s = " + s);
    }

    // 包装类不可变：修改无效
    static void modifyInteger(Integer n) {
        n = 999;
    }

    public static void main(String[] args) {
        int a = 1;
        tryChange(a);
        System.out.println("基本类型 a = " + a);

        int[] arr = {1, 2, 3};
        changeInner(arr);
        System.out.println("修改内部 arr[0] = " + arr[0]);

        int[] arr2 = {1, 2, 3};
        reassignRef(arr2);
        System.out.println("重新赋值 arr2[0] = " + arr2[0]);

        String s = "hello";
        modifyString(s);
        System.out.println("外部 s = " + s);

        Integer num = 1;
        modifyInteger(num);
        System.out.println("Integer num = " + num);
    }
}`
  },
  {
    id: "java-static-methods",
    group: "方法与作用域",
    icon: "⚙️",
    title: "static 静态方法",
    content: `# static 静态方法

用 \`static\` 修饰的方法属于类本身，而非某个对象。静态方法不依赖实例就能调用，是组织工具方法的主要方式。\`Math\`、\`Arrays\`、\`Collections\` 等工具类几乎全是静态方法。

## 静态方法定义

\`\`\`java
class MathUtil {
    static int square(int x) { return x * x; }
}
\`\`\`

静态方法在类加载时就存在，无需创建对象即可使用。它不依附于任何实例。

## 直接通过类名调用

\`\`\`java
int r = MathUtil.square(5); // 推荐写法
\`\`\`

也可通过对象调用（不推荐，容易让人误以为是实例方法）。静态方法调用形式：\`类名.方法名(参数)\`。

## 不能使用 this

静态方法不属于任何对象，因此没有 \`this\` 指针。在静态方法中使用 \`this\` 会编译错误。同理也不能直接调用实例方法或访问实例变量——因为没有 \`this\`，不知道操作哪个对象。

## 不能直接访问实例变量

静态方法没有 \`this\`，无法知道该访问哪个对象的实例变量。但可以访问其他静态成员（静态变量、静态方法）。

\`\`\`java
class C {
    int instanceVar;      // 实例变量
    static int classVar;  // 类变量
    static void m() {
        // instanceVar; // 错误：无 this
        classVar = 1;     // 正确：类变量不依赖 this
    }
}
\`\`\`

实例方法则可以访问一切（实例变量、类变量、实例方法、静态方法），因为它有 \`this\`。

## 工具方法

静态方法最常见的用途是工具方法，如 \`Math.sqrt\`、\`Arrays.sort\`、\`Collections.max\`。它们不需要状态，纯粹做计算，接收参数返回结果。

## 静态方法 vs 实例方法

| 对比项 | 静态方法 | 实例方法 |
|--------|----------|----------|
| 归属 | 类 | 对象 |
| 调用 | 类名.方法() | 对象.方法() |
| this | 无 | 有 |
| 访问实例成员 | 不能 | 能 |
| 重写 | 不能（可被隐藏）| 能 |

静态方法不能被重写（override），只能被"隐藏"（hide）——子类同名同参静态方法会隐藏父类的，但多态不生效。

## 何时用静态方法

- 不依赖对象状态的工具方法（纯函数）
- 工厂方法（\`List.of\`、\`Integer.valueOf\`）
- 入口方法（main）
- 简单计算、转换、校验

## 何时避免

需要访问实例状态的方法不要写成静态。静态方法难以mock、不利于测试和扩展，过度使用会退化成"面向过程"编程。

## 小结与提示

用 \`static\` 修饰的方法属于类本身而非某个对象，不依赖实例就能调用，是组织工具方法的主要方式——\`Math\`、\`Arrays\`、\`Collections\` 等工具类几乎全是静态方法。静态方法在类加载时就存在、无需创建对象即可使用，推荐通过 \`类名.方法名(参数)\` 调用，也可通过对象调用但不推荐、容易让人误以为是实例方法。关键限制：静态方法没有 \`this\` 指针（因为它不属于任何对象），因此不能直接访问实例变量或调用实例方法——没有 \`this\` 就不知道操作哪个对象；但可以访问其他静态成员。实例方法则可以访问一切（实例变量、类变量、实例方法、静态方法），因为它有 \`this\`。静态方法不能被重写（override），只能被"隐藏"（hide）——子类同名同参静态方法会隐藏父类的，但多态不生效，这是与实例方法的重要区别。何时用静态方法？不依赖对象状态的工具方法（纯函数）、工厂方法（\`List.of\`、\`Integer.valueOf\`）、入口方法（main）、简单计算转换校验等场景最合适。何时避免？需要访问实例状态的方法不要写成静态，静态方法难以 mock、不利于测试和扩展，过度使用会退化成"面向过程"编程。
`,
    code: `// 演示静态方法与实例方法
public class Main {
    public static void main(String[] args) {
        // 通过类名调用静态方法
        System.out.println("square(5) = " + MathUtil.square(5));
        System.out.println("max(3,7) = " + MathUtil.max(3, 7));
        System.out.println("isPrime(7) = " + MathUtil.isPrime(7));

        // 实例方法必须通过对象调用
        Calculator calc = new Calculator();
        calc.value = 100;
        System.out.println("calc.doubleIt() = " + calc.doubleIt());
    }
}

class MathUtil {
    // 静态工具方法
    static int square(int x) {
        return x * x;
    }

    static int max(int a, int b) {
        return a > b ? a : b;
    }

    static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }
}

class Calculator {
    int value; // 实例变量

    // 实例方法：可访问实例变量
    int doubleIt() {
        return value * 2;
    }
}`
  },
  {
    id: "java-final-params",
    group: "方法与作用域",
    icon: "🔐",
    title: "final 参数与变量",
    content: `# final 参数与变量

\`final\` 关键字表示"不可变"的意图。用于参数和局部变量时，它禁止重新赋值，是一种保护手段和设计表达。合理使用 final 能提升代码的可读性和安全性。

## final 参数

方法参数加 \`final\` 后，方法内不能重新给该参数赋值：

\`\`\`java
void process(final int x) {
    // x = 10; // 编译错误
    System.out.println(x);
}
\`\`\`

参数本身是值传递的副本，加 \`final\` 只是防止方法内误改形参，并不能阻止修改对象内部状态。它表达的是"我不希望在这个方法里改这个入参"。

## final 局部变量

局部变量加 \`final\` 后只能赋值一次：

\`\`\`java
final int LIMIT = 100;
// LIMIT = 200; // 编译错误
\`\`\`

常用于定义局部常量，或确保变量不被后续逻辑误改。final 变量命名惯例使用全大写加下划线，如 \`MAX_SIZE\`。

## final 引用变量

关键区分：final 修饰引用类型时，**引用本身不可变**（不能再指向别的对象），但**对象内容仍可变**。

\`\`\`java
final int[] arr = {1, 2, 3};
arr[0] = 9;       // 合法：改内容
// arr = new int[5]; // 错误：改引用
\`\`\`

这是常见面试陷阱：final 不等于"对象不可变"。

## 设计意图

使用 \`final\` 参数/变量的核心意图：
1. **明确不可变**：告诉读者这个值在方法内不会变
2. **防止误改**：编译期拦截意外赋值
3. **线程安全**：final 字段有内存语义保证（构造完成后的 final 字段对所有线程可见）
4. **Lambda 捕获**：被捕获的变量必须 effectively final

## effectively final

即使不写 \`final\`，只要变量赋值后不再改变，就是"effectively final"。Lambda 和匿名内部类只能捕获 effectively final 的局部变量。这是 Java 8 引入的概念，让你不必显式写 final。

## 实际使用场景

- 匿名内部类、Lambda 表达式捕获的局部变量
- 多线程中共享的只读数据
- 工具方法中不希望被修改的入参
- 计算过程中的中间常量

## 注意点

- final 参数在 Java 中并非强制要求，团队风格不一
- 不必给每个参数都加 final，过度使用会让签名冗长
- 优先让变量 effectively final，需要时再显式标注

## 小结与提示

\`final\` 关键字表示"不可变"的意图，用于参数和局部变量时禁止重新赋值，是保护手段与设计表达。方法参数加 \`final\` 后方法内不能重新给该参数赋值，但参数本身是值传递的副本，加 \`final\` 只是防止方法内误改形参、并不能阻止修改对象内部状态，它表达的是"我不希望在这个方法里改这个入参"。局部变量加 \`final\` 后只能赋值一次，常用于定义局部常量或确保变量不被后续逻辑误改，final 变量命名惯例使用全大写加下划线（如 \`MAX_SIZE\`）。关键区分：final 修饰引用类型时引用本身不可变（不能再指向别的对象），但对象内容仍可变——这是常见面试陷阱，final 不等于"对象不可变"。使用 final 的核心意图有四：明确不可变告诉读者这个值不会变、防止误改由编译期拦截意外赋值、线程安全（final 字段有内存语义保证）、Lambda 捕获（被捕获的变量必须 effectively final）。即使不写 \`final\`，只要变量赋值后不再改变就是"effectively final"，Lambda 和匿名内部类只能捕获 effectively final 的局部变量，这是 Java 8 引入的概念让你不必显式写 final。实际使用场景包括匿名内部类与 Lambda 捕获的局部变量、多线程中共享的只读数据、工具方法中不希望被修改的入参、计算过程中的中间常量。注意：final 参数并非强制要求、团队风格不一，不必给每个参数都加 final、过度使用会让签名冗长，优先让变量 effectively final、需要时再显式标注。
`,
    code: `// 演示 final 参数与变量
public class Main {
    // final 参数：防止方法内被修改
    static int doubleIt(final int x) {
        // x = x * 2; // 编译错误：final 参数不可重新赋值
        return x * 2;
    }

    // final 引用参数：引用不可变，对象内容可变
    static void fill(final int[] arr, final int value) {
        // arr = new int[5]; // 编译错误
        for (int i = 0; i < arr.length; i++) {
            arr[i] = value; // 修改对象内容，合法
        }
    }

    // final 局部变量：常量
    static void demoLocalFinal() {
        final double TAX_RATE = 0.08;
        double price = 100.0;
        double tax = price * TAX_RATE;
        System.out.println("税额 = " + tax);
    }

    // Lambda 捕获 effectively final 变量
    static void demoLambdaCapture() {
        int base = 10; // effectively final
        Runnable r = () -> System.out.println("base + 5 = " + (base + 5));
        r.run();
    }

    public static void main(String[] args) {
        System.out.println("doubleIt(21) = " + doubleIt(21));

        int[] data = new int[3];
        fill(data, 7);
        System.out.print("填充后：");
        for (int n : data) {
            System.out.print(n + " ");
        }
        System.out.println();

        demoLocalFinal();
        demoLambdaCapture();
    }
}`
  },
  {
    id: "java-method-references",
    group: "方法与作用域",
    icon: "👉",
    title: "方法引用预热",
    content: `# 方法引用预热

方法引用（Method Reference）是 Java 8 引入的语法，用 \`::\` 操作符直接引用已有方法，是 Lambda 表达式的简写形式，让代码更简洁。它是函数式编程在 Java 中的重要工具。

## 方法引用语法 ::

\`\`\`java
类名::方法名
对象::方法名
\`\`\`

当 Lambda 表达式只是调用一个已存在的方法时，可以用方法引用替代，称为"方法引用的等价转换"。这让代码更聚焦于"做什么"而非"怎么做"。

## 静态方法引用

引用类的静态方法：\`类名::静态方法名\`

\`\`\`java
Function<Integer, Integer> f = Math::abs; // 等价 x -> Math.abs(x)
\`\`\`

## 实例方法引用

引用某个对象的实例方法：\`对象::实例方法名\`

\`\`\`java
String s = "hello";
Supplier<Integer> len = s::length; // 等价 () -> s.length()
\`\`\`

还有"类的实例方法引用"形式 \`类名::实例方法名\`，此时函数式接口的第一个参数作为接收者：

\`\`\`java
Function<String, Integer> f = String::length; // 等价 str -> str.length()
\`\`\`

## 构造器引用

引用构造器：\`类名::new\`

\`\`\`java
Supplier<ArrayList> c = ArrayList::new; // 等价 () -> new ArrayList()
\`\`\`

构造器引用根据函数式接口的参数决定调用哪个构造器（重载选择）。

## 与 Lambda 关系

方法引用是 Lambda 的语法糖，二者等价。使用原则：当 Lambda 体只调用一个方法且参数一致时，优先用方法引用，更简洁。但若 Lambda 还需额外逻辑，就用 Lambda。

| 类型 | 语法 | 等价 Lambda |
|------|------|-------------|
| 静态方法 | \`Math::abs\` | \`x -> Math.abs(x)\` |
| 实例方法（对象）| \`s::length\` | \`() -> s.length()\` |
| 实例方法（类）| \`String::length\` | \`str -> str.length()\` |
| 构造器 | \`ArrayList::new\` | \`() -> new ArrayList()\` |

## 注意

方法引用让代码简洁但需理解函数式接口。后续集合流（Stream API）中会大量使用方法引用，如 \`map(String::toUpperCase)\`、\`forEach(System.out::println)\`。掌握方法是写出优雅流式代码的前提。

## 小结与提示

方法引用（Method Reference）是 Java 8 引入的语法，用 \`::\` 操作符直接引用已有方法，是 Lambda 表达式的简写形式，让代码更简洁，是函数式编程在 Java 中的重要工具。当 Lambda 表达式只是调用一个已存在的方法时，可以用方法引用替代，称为"方法引用的等价转换"，这让代码更聚焦于"做什么"而非"怎么做"。四种形式：静态方法引用 \`类名::静态方法名\`（如 \`Math::abs\` 等价 \`x -> Math.abs(x)\`）、对象的实例方法引用 \`对象::实例方法名\`（如 \`s::length\` 等价 \`() -> s.length()\`）、类的实例方法引用 \`类名::实例方法名\`（如 \`String::length\` 等价 \`str -> str.length()\`，此时函数式接口第一个参数作为接收者）、构造器引用 \`类名::new\`（如 \`ArrayList::new\` 等价 \`() -> new ArrayList()\`，根据函数式接口参数决定调用哪个构造器）。方法引用是 Lambda 的语法糖、二者等价，使用原则：当 Lambda 体只调用一个方法且参数一致时优先用方法引用更简洁，但若 Lambda 还需额外逻辑就用 Lambda。方法引用让代码简洁但需理解函数式接口，后续集合流（Stream API）中会大量使用，如 \`map(String::toUpperCase)\`、\`forEach(System.out::println)\`，掌握方法是写出优雅流式代码的前提。
`,
    code: `// 演示方法引用的四种形式
import java.util.function.*;
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // 静态方法引用
        Function<Integer, Integer> absRef = Math::abs;
        System.out.println("abs(-5) = " + absRef.apply(-5));

        // 等价 Lambda
        Function<Integer, Integer> absLambda = x -> Math.abs(x);
        System.out.println("abs(-8) = " + absLambda.apply(-8));

        // 对象的实例方法引用
        String greeting = "Hello World";
        Supplier<Integer> lenRef = greeting::length;
        System.out.println("长度 = " + lenRef.get());

        // 类的实例方法引用
        Function<String, Integer> strLen = String::length;
        System.out.println("Java 长度 = " + strLen.apply("Java"));

        // 构造器引用
        Supplier<ArrayList<String>> factory = ArrayList::new;
        ArrayList<String> list = factory.get();
        list.add("A");
        list.add("B");
        System.out.println("列表 = " + list);

        // 方法引用简化列表转换
        List<String> names = Arrays.asList("alice", "bob", "carol");
        names.stream()
             .map(String::toUpperCase) // 方法引用
             .forEach(System.out::println); // 方法引用
    }
}`
  },
  {
    id: "java-command-args",
    group: "方法与作用域",
    icon: "💻",
    title: "命令行参数",
    content: `# 命令行参数

\`main\` 方法是 Java 程序的入口，其 \`String[] args\` 参数用于接收命令行传入的参数。掌握命令行参数处理是编写可配置程序的基础，也是开发命令行工具（CLI）的必备技能。

## main 方法 args 参数

\`\`\`java
public static void main(String[] args) { ... }
\`\`\`

\`args\` 是一个字符串数组，存放启动程序时在命令行中传入的参数。注意：**类名不计入 args**，args 从类名之后的第一个参数开始。

\`\`\`bash
java Main foo bar 123
# args = ["foo", "bar", "123"]
\`\`\`

所有参数都是字符串类型，需要手动转换为数值等其他类型。

## 解析命令行参数

常见模式：
1. **位置参数**：按顺序读取 \`args[0]\`、\`args[1]\`，简单但不灵活
2. **键值参数**：\`--name value\`，需遍历识别，可读性好
3. **标志参数**：\`--verbose\`，存在即为 true，用于开关

## 参数验证

- 检查 \`args.length\` 是否满足最小数量
- 检查数值格式（用 \`Integer.parseInt\` 捕获 \`NumberFormatException\`）
- 给出友好的用法提示（usage），告诉用户正确的调用方式

\`\`\`java
if (args.length < 1) {
    System.out.println("用法：java Main <名字>");
    return;
}
\`\`\`

## 常用模式

处理键值参数时，遍历 args 数组，遇到 \`--key\` 就取下一个元素作为值：

\`\`\`java
for (int i = 0; i < args.length; i++) {
    if ("--name".equals(args[i]) && i + 1 < args.length) {
        name = args[++i];
    }
}
\`\`\`

## 实际应用

- 命令行工具（CLI）：如 git、mvn 的子命令
- 脚本启动配置：指定环境、端口、配置文件
- 测试数据传入：跑批处理的输入参数

复杂参数解析可借助第三方库如 Apache Commons CLI、picocli，支持短选项（\`-v\`）、长选项（\`--verbose\`）、帮助文档自动生成。

## 注意事项

- 数组越界：访问 \`args[i]\` 前必须检查长度
- 类型转换：\`Integer.parseInt\` 可能抛 \`NumberFormatException\`
- 引号处理：含空格的参数需用引号包裹，shell 会处理
- 字符编码：含中文的参数注意终端编码一致

## 小结与提示

\`main\` 方法是 Java 程序的入口，其 \`String[] args\` 参数用于接收命令行传入的参数，掌握命令行参数处理是编写可配置程序的基础、也是开发命令行工具（CLI）的必备技能。注意类名不计入 args，args 从类名之后的第一个参数开始，所有参数都是字符串类型、需要手动转换为数值等其他类型。常见解析模式有三种：位置参数按顺序读取 \`args[0]\`、\`args[1]\`（简单但不灵活），键值参数 \`--name value\`（需遍历识别、可读性好），标志参数 \`--verbose\`（存在即为 true、用于开关）。参数验证要点：检查 \`args.length\` 是否满足最小数量、检查数值格式（用 \`Integer.parseInt\` 捕获 \`NumberFormatException\`）、给出友好的用法提示（usage）告诉用户正确调用方式。处理键值参数时遍历 args 数组，遇到 \`--key\` 就取下一个元素作为值，务必检查 \`i + 1 < args.length\` 防止越界。实际应用包括命令行工具（如 git、mvn 的子命令）、脚本启动配置（指定环境、端口、配置文件）、测试数据传入（跑批处理的输入参数）；复杂参数解析可借助第三方库如 Apache Commons CLI、picocli，支持短选项（\`-v\`）、长选项（\`--verbose\`）、帮助文档自动生成。注意事项：访问 \`args[i]\` 前必须检查长度防数组越界，\`Integer.parseInt\` 可能抛 \`NumberFormatException\` 需 try-catch，含空格的参数需用引号包裹由 shell 处理，含中文的参数注意终端编码一致。
`,
    code: `// 演示命令行参数处理
public class Main {
    public static void main(String[] args) {
        // 由于 IDE 运行时 args 可能为空，这里用模拟数据演示
        // 实际运行：java Main Alice 20 --verbose
        if (args.length == 0) {
            // 模拟命令行参数，便于演示
            args = new String[]{"Alice", "20", "--verbose"};
        }

        // 参数数量验证
        if (args.length < 2) {
            System.out.println("用法：java Main <名字> <年龄> [--verbose]");
            System.out.println("示例：java Main Alice 20 --verbose");
            return;
        }

        // 解析位置参数
        String name = args[0];
        int age;
        try {
            age = Integer.parseInt(args[1]);
        } catch (NumberFormatException e) {
            System.out.println("错误：年龄必须是整数，收到 " + args[1]);
            return;
        }

        // 解析标志参数
        boolean verbose = false;
        for (int i = 2; i < args.length; i++) {
            if ("--verbose".equals(args[i])) {
                verbose = true;
            }
        }

        // 业务逻辑
        System.out.println("姓名：" + name);
        System.out.println("年龄：" + age);
        if (verbose) {
            System.out.println("详细模式已开启");
            System.out.println("参数总数：" + args.length);
            for (int i = 0; i < args.length; i++) {
                System.out.println("  args[" + i + "] = " + args[i]);
            }
        }
    }
}`
  },
];
