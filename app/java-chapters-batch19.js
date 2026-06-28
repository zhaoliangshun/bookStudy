// =============================================================
// Java 交互式教程 —— 第十九批章节（反射与注解组，共 15 章）
// =============================================================

export const chapters = [
  {
    id: "java-reflection-basics",
    group: "反射与注解",
    icon: "🪞",
    title: "反射基础",
    content: `# 反射基础

**反射**（Reflection）是 Java 在运行时检视类、接口、字段和方法的能力。通过反射，程序可在运行时动态获取类型信息、创建对象、调用方法、修改字段——这一切无需在编译时知道具体类型。

## Class 对象

每个被加载的类在 JVM 中都有一个唯一的 \`Class\` 对象，它是反射的入口。基本类型和关键字 \`void\` 也有对应的 \`Class\` 对象（如 \`int.class\`）。

\`\`\`java
Class<?> clazz = String.class;
\`\`\`

## 获取 Class 的三种方式

1. **类字面常量**：编译期已知，最安全高效
\`\`\`java
Class<?> c1 = String.class;
\`\`\`

2. **对象 getClass()**：运行时已知实例
\`\`\`java
String s = "hello";
Class<?> c2 = s.getClass();
\`\`\`

3. **Class.forName()**：通过全限定名字符串动态加载
\`\`\`java
Class<?> c3 = Class.forName("java.lang.String");
\`\`\`

三种方式获取的是同一个 Class 对象（类在 JVM 中只加载一次）。

## 基本类型与数组

\`\`\`java
Class<?> intClass = int.class;        // 基本类型
Class<?> intArrayClass = int[].class; // 数组
\`\`\`

基本类型的包装类有 \`TYPE\` 常量指向对应基本类型：\`Integer.TYPE == int.class\`。

## getName / getSimpleName / getCanonicalName

- \`getName()\`：全限定名，数组用特殊表示（\`[Ljava.lang.String;\`）
- \`getSimpleName()\`：简单名（不含包名）
- \`getCanonicalName()\`：规范化名（数组用 \`java.lang.String[]\`）

## 反射的用途

- **框架**：Spring IoC 根据配置实例化 Bean
- **ORM**：Hibernate 反射读写实体字段
- **序列化**：Jackson/Gson 反射读取对象转 JSON
- **动态代理**：AOP、RPC 远程调用
- **测试框架**：JUnit 反射调用 @Test 标注的方法
- **注解处理**：运行时读取注解实现配置

## 代价

反射功能强大但有代价：性能开销（方法查找、参数装箱、安全检查）、破坏封装（可访问 private 成员）、编译期类型检查丢失、重构不友好（字符串类名容易出错）。

## Class 对象的生命周期

Class 对象在类首次被使用时由类加载器创建，整个 JVM 生命周期内唯一。触发类加载的方式包括：访问静态字段、调用静态方法、\`new\` 实例、\`Class.forName\`、类字面常量（编译期已知，仅准备不初始化）。

\`\`\`java
// 类字面常量不会触发静态块初始化
Class<?> c = User.class;        // 不执行 static {}
Class.forName("User");          // 执行 static {}
\`\`\`

理解这一点有助于排查反射导致的类初始化副作用。

## 反射 vs 直接编码

直接编码在编译期确定类型，性能最优、类型安全；反射在运行期动态决定，灵活但有开销。框架层用反射吸收变化，业务层尽量用直接编码。当反射使用过度时，代码可读性和可维护性都会下降。

下面通过代码演示获取 Class 对象的各种方式：`,
    code: `// 演示获取 Class 对象的三种方式及常用方法
import java.util.*;

public class Main {
    public static void main(String[] args) throws ClassNotFoundException {
        // ===== 方式一：类字面常量（编译期已知）=====
        Class<?> c1 = String.class;
        System.out.println("方式一 String.class: " + c1.getName());

        // ===== 方式二：对象.getClass() =====
        String s = "hello";
        Class<?> c2 = s.getClass();
        System.out.println("方式二 getClass(): " + c2.getName());

        // ===== 方式三：Class.forName 全限定名 =====
        Class<?> c3 = Class.forName("java.lang.String");
        System.out.println("方式三 forName: " + c3.getName());

        // 三种方式得到同一个 Class 对象
        System.out.println("c1 == c2: " + (c1 == c2));
        System.out.println("c1 == c3: " + (c1 == c3));

        // ===== 基本类型与数组的 Class =====
        Class<?> intClass = int.class;
        Class<?> strArrayClass = String[].class;
        Class<?> voidClass = void.class;
        System.out.println("\\nint.class: " + intClass.getName());
        System.out.println("void.class: " + voidClass.getName());
        System.out.println("Integer.TYPE == int.class: " + (Integer.TYPE == int.class));

        // ===== getName / getSimpleName / getCanonicalName =====
        System.out.println("\\n--- 名称对比 ---");
        System.out.println("String[].getName(): " + strArrayClass.getName());
        System.out.println("String[].getSimpleName(): " + strArrayClass.getSimpleName());
        System.out.println("String[].getCanonicalName(): " + strArrayClass.getCanonicalName());

        // ===== 自定义类的 Class =====
        Class<?> myClass = Person.class;
        System.out.println("\\nPerson.getName(): " + myClass.getName());
        System.out.println("Person.getSimpleName(): " + myClass.getSimpleName());
        System.out.println("Person.getCanonicalName(): " + myClass.getCanonicalName());

        // ===== 类的基本信息 =====
        System.out.println("\\n--- 类信息 ---");
        System.out.println("是接口? " + myClass.isInterface());
        System.out.println("是数组? " + myClass.isArray());
        System.out.println("是基本类型? " + myClass.isPrimitive());
        System.out.println("修饰符: " + java.lang.reflect.Modifier.toString(myClass.getModifiers()));
        System.out.println("包名: " + myClass.getPackage().getName());
        System.out.println("父类: " + myClass.getSuperclass().getName());

        // ===== 通过实例获取 Class =====
        List<String> list = new ArrayList<>();
        System.out.println("\\nArrayList 实际类型: " + list.getClass().getName());
        System.out.println("List 接口类型: " + List.class.getName());
    }

    // 自定义类用于反射演示
    static class Person {
        private String name;
        private int age;
        public Person(String name, int age) { this.name = name; this.age = age; }
        public String greet() { return "Hi, I'm " + name; }
    }
}`
  },
  {
    id: "java-reflection-fields",
    group: "反射与注解",
    icon: "📋",
    title: "获取字段",
    content: `# 获取字段

反射操作字段是 ORM、序列化框架的核心能力。\`java.lang.reflect.Field\` 类代表一个字段，提供读取和修改字段值的能力。

## getDeclaredFields vs getFields

- \`getFields()\`：返回所有 **public** 字段，包括继承自父类的
- \`getDeclaredFields()\`：返回本类**声明的所有**字段（含 private、protected），不包括继承的

\`\`\`java
Field[] publicFields = clazz.getFields();
Field[] allFields = clazz.getDeclaredFields();
\`\`\`

类似地有 \`getField(String)\` 和 \`getDeclaredField(String)\` 按名获取。

## 读取与设置字段值

\`\`\`java
Field f = clazz.getDeclaredField("name");
Object value = f.get(instance);   // 读取
f.set(instance, newValue);        // 设置
\`\`\`

对于基本类型字段，使用 \`getInt/setInt\`、\`getDouble/setDouble\` 等专用方法，避免装箱开销。

## private 字段：setAccessible

访问 private 字段需先调用 \`setAccessible(true)\` 取消访问检查，否则抛 \`IllegalAccessException\`：

\`\`\`java
Field privateField = clazz.getDeclaredField("secret");
privateField.setAccessible(true);
Object secretValue = privateField.get(instance);
\`\`\`

## 修改字段值

反射不仅能读，还能写，包括 private 字段和 final 字段（final 字段修改需注意 JIT 优化可能内联值，不一定生效）。

## 字段元信息

- \`getType()\`：字段类型的 Class
- \`getModifiers()\`：修饰符（public/private/static/final 等）
- \`getName()\`：字段名
- \`get(Object)\`：获取实例字段值（静态字段传 null）

## 警告

反射修改 private 字段破坏封装，可能导致框架内部状态被破坏、安全管理器拒绝、与 JIT 内联优化冲突（尤其 final 字段）。ORM 框架（Hibernate、MyBatis）大量使用反射读写实体字段，将数据库行映射为对象。

## 类型转换与基本类型

\`Field.get\` 返回 \`Object\`，基本类型字段会被装箱。读取基本类型应优先用 \`getInt\`/\`getLong\`/\`getDouble\` 等专用方法，避免手动拆箱与 \`NullPointerException\`。写入同理：\`setInt\`/\`setDouble\` 直接传基本类型，无需装箱。

## 反射与泛型

泛型在运行时被**擦除**，反射获取的字段类型是擦除后的原始类型（如 \`List<String>\` 字段的 \`getType()\` 返回 \`List\`，\`getGenericType()\` 才返回带泛型的 \`ParameterizedType\`）。ORM、序列化框架常借助 \`getGenericType\` 处理泛型集合。

## 继承字段的处理

\`getDeclaredFields\` 不返回继承字段。若需遍历所有字段（含父类），需沿 \`getSuperclass()\` 递归向上收集：

\`\`\`java
for (Class<?> c = clazz; c != null; c = c.getSuperclass()) {
    for (Field f : c.getDeclaredFields()) { ... }
}
\`\`\`

JPA、Gson 等都这样做以覆盖父类字段。

下面通过代码演示反射操作字段：`,
    code: `// 演示反射操作字段
import java.lang.reflect.*;

public class Main {
    public static void main(String[] args) throws Exception {
        Person p = new Person("Alice", 30);
        System.out.println("原始对象: " + p);

        Class<?> clazz = p.getClass();

        // ===== getDeclaredFields：所有声明字段（含 private）=====
        System.out.println("\\n--- getDeclaredFields ---");
        for (Field f : clazz.getDeclaredFields()) {
            System.out.println("  " + Modifier.toString(f.getModifiers())
                + " " + f.getType().getSimpleName() + " " + f.getName());
        }

        // ===== getFields：仅 public 字段（含继承）=====
        System.out.println("\\n--- getFields (仅 public) ---");
        for (Field f : clazz.getFields()) {
            System.out.println("  " + f.getName());
        }

        // ===== 读取 private 字段（需 setAccessible）=====
        Field nameField = clazz.getDeclaredField("name");
        nameField.setAccessible(true);  // private 字段需取消访问检查
        String name = (String) nameField.get(p);
        System.out.println("\\n读取 name: " + name);

        // ===== 读取 private int 字段（专用 getInt）=====
        Field ageField = clazz.getDeclaredField("age");
        ageField.setAccessible(true);
        int age = ageField.getInt(p);
        System.out.println("读取 private age: " + age);

        // ===== 修改字段值 =====
        nameField.set(p, "Bob");
        ageField.setInt(p, 25);
        System.out.println("修改后: " + p);

        // ===== 静态字段访问（传 null 作为 obj）=====
        Field countField = clazz.getDeclaredField("count");
        countField.setAccessible(true);
        System.out.println("静态字段 count: " + countField.get(null));
        countField.setInt(null, 99);
        System.out.println("修改后 count: " + Person.count);

        // ===== 修改 final 字段（演示，实际不推荐）=====
        Field piField = clazz.getDeclaredField("PI");
        piField.setAccessible(true);
        System.out.println("final PI 原值: " + piField.getDouble(null));

        // ===== 通过反射批量输出字段值 =====
        System.out.println("\\n--- 批量反射输出 ---");
        for (Field f : clazz.getDeclaredFields()) {
            f.setAccessible(true);
            try {
                Object v = f.get(p);
                System.out.println("  " + f.getName() + " = " + v);
            } catch (Exception e) {
                System.out.println("  " + f.getName() + " 无法读取");
            }
        }
    }

    static class Person {
        public static int count = 0;
        public static final double PI = 3.14;
        private String name;
        private int age;

        public Person(String name, int age) {
            this.name = name;
            this.age = age;
            count++;
        }

        public String toString() {
            return "Person{name='" + name + "', age=" + age + "}";
        }
    }
}`
  },
  {
    id: "java-reflection-methods",
    group: "反射与注解",
    icon: "🔧",
    title: "获取方法",
    content: `# 获取方法

\`java.lang.reflect.Method\` 代表类的方法，反射能在运行时获取方法并动态调用，这是动态代理、测试框架、RPC 调用的基础。

## getDeclaredMethods vs getMethods

- \`getMethods()\`：所有 **public** 方法，包括继承自父类和接口的（如 Object 的方法）
- \`getDeclaredMethods()\`：本类**声明的所有**方法（含 private），不包括继承的

\`\`\`java
Method[] all = clazz.getMethods();           // 公有方法（含继承）
Method[] mine = clazz.getDeclaredMethods();  // 本类声明
Method m = clazz.getDeclaredMethod("setName", String.class); // 指定参数类型
\`\`\`

## Method.invoke

调用方法使用 \`invoke(Object obj, Object... args)\`：
- 实例方法：obj 为接收者
- 静态方法：obj 传 null
- 返回值装箱为 Object，void 返回 null

\`\`\`java
Method greet = clazz.getDeclaredMethod("greet");
String result = (String) greet.invoke(instance);
\`\`\`

## 参数类型

通过 \`getMethod(name, parameterTypes...)\` 精确匹配重载方法，参数类型必须严格匹配：

\`\`\`java
Method setAge = clazz.getDeclaredMethod("setAge", int.class);
setAge.invoke(p, 20);
\`\`\`

## 动态调用

反射调用最大的价值是**运行时决定**调用哪个方法，常用于：解析 XML/JSON 配置中的方法名、框架根据注解分发调用、RPC 客户端根据接口签名调用远端。

## private 方法

调用 private 方法需 \`setAccessible(true)\`：

\`\`\`java
Method privateMethod = clazz.getDeclaredMethod("secret");
privateMethod.setAccessible(true);
privateMethod.invoke(instance);
\`\`\`

## 异常处理

\`invoke\` 抛出的方法异常会被包装为 \`InvocationTargetException\`，需用 \`getCause()\` 获取真实异常：

\`\`\`java
try { method.invoke(obj); }
catch (InvocationTargetException e) {
    Throwable real = e.getCause(); // 真实业务异常
}
\`\`\`

## 方法元信息

- \`getReturnType()\`：返回类型（Class，泛型擦除后）
- \`getGenericReturnType()\`：带泛型的返回类型
- \`getParameterTypes()\`：形参类型数组
- \`getModifiers()\`：修饰符
- \`getAnnotations()\`：方法上的注解

## 可变参数方法

可变参数在反射中以**数组类型**出现。例如 \`sum(int... nums)\` 的参数类型是 \`int[].class\`，调用时需包装：

\`\`\`java
Method sum = clazz.getMethod("sum", int[].class);
sum.invoke(obj, new Object[]{ new int[]{1, 2, 3} });
\`\`\`

外层 \`Object[]\` 是 invoke 的可变参数容器，内层 \`int[]\` 才是实际参数。

## 重载方法的选择

反射按**参数类型严格匹配**选择重载，不会自动拆装箱或向上转型。若参数类型传错（如把 \`Integer.class\` 当 \`int.class\`），会抛 \`NoSuchMethodException\`。匹配含基本类型的重载需显式用 \`int.class\` 而非 \`Integer.class\`。

下面通过代码演示反射调用方法：`,
    code: `// 演示反射调用方法
import java.lang.reflect.*;

public class Main {
    public static void main(String[] args) throws Exception {
        Calculator calc = new Calculator(10);
        Class<?> clazz = calc.getClass();

        // ===== getDeclaredMethods：本类声明的方法 =====
        System.out.println("--- 本类声明的方法 ---");
        for (Method m : clazz.getDeclaredMethods()) {
            System.out.println("  " + Modifier.toString(m.getModifiers())
                + " " + m.getReturnType().getSimpleName()
                + " " + m.getName()
                + "(" + paramsToString(m.getParameterTypes()) + ")");
        }

        // ===== getMethods：含继承的 public 方法 =====
        System.out.println("\\n--- public 方法数量 (含继承): " + clazz.getMethods().length);

        // ===== 调用无参方法 =====
        Method getValue = clazz.getDeclaredMethod("getValue");
        int v = (int) getValue.invoke(calc);
        System.out.println("\\ngetValue(): " + v);

        // ===== 调用带参方法（重载匹配）=====
        Method add = clazz.getDeclaredMethod("add", int.class);
        int r1 = (int) add.invoke(calc, 5);
        System.out.println("add(5): " + r1);

        // 字符串参数版本（重载）
        Method addStr = clazz.getDeclaredMethod("add", String.class);
        String r2 = (String) addStr.invoke(calc, "5");
        System.out.println("add(\\"5\\"): " + r2);

        // ===== 调用静态方法（obj 传 null）=====
        Method staticMethod = clazz.getDeclaredMethod("description");
        String desc = (String) staticMethod.invoke(null);
        System.out.println("static description(): " + desc);

        // ===== 调用 private 方法（setAccessible）=====
        Method secret = clazz.getDeclaredMethod("secret");
        secret.setAccessible(true);
        String sr = (String) secret.invoke(calc);
        System.out.println("private secret(): " + sr);

        // ===== 调用可变参数方法 =====
        Method sum = clazz.getDeclaredMethod("sum", int[].class);
        int s = (int) sum.invoke(calc, new Object[]{new int[]{1, 2, 3, 4}});
        System.out.println("sum(1,2,3,4): " + s);

        // ===== 捕获方法抛出的异常 =====
        Method risky = clazz.getDeclaredMethod("risky", int.class);
        risky.setAccessible(true);
        try {
            risky.invoke(calc, -1);
        } catch (InvocationTargetException e) {
            System.out.println("捕获业务异常: " + e.getCause());
        }
    }

    static String paramsToString(Class<?>[] params) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < params.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(params[i].getSimpleName());
        }
        return sb.toString();
    }

    // 计算器类
    static class Calculator {
        private int value;
        public Calculator(int value) { this.value = value; }
        public int getValue() { return value; }
        public int add(int n) { return value + n; }
        public String add(String n) { return "结果: " + (value + Integer.parseInt(n)); }
        public static String description() { return "一个简单的计算器"; }
        private String secret() { return "私有秘密: value=" + value; }
        public int sum(int... nums) {
            int total = 0;
            for (int n : nums) total += n;
            return total;
        }
        private void risky(int n) {
            if (n < 0) throw new IllegalArgumentException("n 不能为负数: " + n);
        }
    }
}`
  },
  {
    id: "java-reflection-constructors",
    group: "反射与注解",
    icon: "🏗️",
    title: "获取构造器",
    content: `# 获取构造器

\`java.lang.reflect.Constructor\` 代表类的构造器，反射可在运行时动态创建对象，无需 \`new\` 关键字。这是 Spring IoC、依赖注入框架的基础。

## getDeclaredConstructors

返回本类**所有声明**的构造器（含 private）：

\`\`\`java
Constructor<?>[] ctors = clazz.getDeclaredConstructors();
\`\`\`

\`getConstructors()\` 仅返回 public 构造器。按参数类型获取：

\`\`\`java
Constructor<?> c = clazz.getDeclaredConstructor(String.class, int.class);
\`\`\`

## Constructor.newInstance

通过构造器创建实例：

\`\`\`java
Constructor<?> c = clazz.getDeclaredConstructor(String.class);
Object obj = c.newInstance("hello");
\`\`\`

相比 \`Class.newInstance()\`（已废弃），\`Constructor.newInstance\` 优势：支持带参构造器、支持调用 private 构造器（配合 setAccessible）、正确处理构造器异常。

## 动态创建对象

\`\`\`java
Class<?> clazz = Class.forName("com.example.User");
Object user = clazz.getDeclaredConstructor(String.class).newInstance("Alice");
\`\`\`

框架根据配置的类名创建对象，无需在编译期依赖具体类。

## 私有构造器

单例模式常把构造器设为 private，反射可绕过：

\`\`\`java
Constructor<?> c = Singleton.class.getDeclaredConstructor();
c.setAccessible(true);
Singleton instance = c.newInstance();
\`\`\`

这也是为什么单例要防范反射攻击（枚举单例天然安全）。

## 参数类型

构造器参数必须按声明顺序传入，类型要兼容（基本类型需装箱或用对应 class）。框架扫描构造器注入依赖时，会按参数类型从容器查找。

## 应用

- **Spring**：根据 XML/注解配置实例化 Bean
- **序列化**：反序列化时创建对象
- **DI 容器**：扫描构造器注入依赖
- **JPA**：实体类需有无参构造器（反射创建）

## 构造器元信息

- \`getParameterTypes()\`：形参类型数组
- \`getParameterCount()\`：参数个数
- \`getModifiers()\`：修饰符
- \`getAnnotation\`：构造器上的注解（如 Spring 的 \`@Autowired\`）
- \`getExceptionTypes()\`：声明的受检异常

## 基本类型参数匹配

反射匹配构造器时需注意基本类型：\`int.class.isInstance(Integer.valueOf(1))\` 返回 **false**，因为 \`int.class\` 是基本类型，\`isInstance\` 仅对引用类型有效。匹配含基本类型参数的构造器时，需将基本类型转为包装类再判断，或直接用 \`int.class\` 作为 \`getDeclaredConstructor\` 的参数。

## @Autowired 构造器注入

Spring 推荐构造器注入依赖。当类有多个构造器时，标注 \`@Autowired\` 的构造器被选中；只有一个构造器时可省略注解。框架通过反射扫描构造器与参数类型，从容器中查找对应 Bean 完成注入。

下面通过代码演示反射创建对象：`,
    code: `// 演示反射创建对象
import java.lang.reflect.*;

public class Main {
    public static void main(String[] args) throws Exception {
        Class<User> clazz = User.class;

        // ===== 查看所有构造器 =====
        System.out.println("--- 所有声明构造器 ---");
        for (Constructor<?> c : clazz.getDeclaredConstructors()) {
            System.out.println("  " + Modifier.toString(c.getModifiers())
                + " " + c.getName()
                + "(" + paramsToString(c.getParameterTypes()) + ")");
        }

        // ===== 调用无参构造器 =====
        Constructor<?> noArg = clazz.getDeclaredConstructor();
        User u1 = (User) noArg.newInstance();
        System.out.println("\\n无参构造: " + u1);

        // ===== 调用带参构造器 =====
        Constructor<?> twoArg = clazz.getDeclaredConstructor(String.class, int.class);
        User u2 = (User) twoArg.newInstance("Alice", 30);
        System.out.println("带参构造: " + u2);

        // ===== 调用 private 构造器（绕过单例）=====
        Constructor<?> privateCtor = Singleton.class.getDeclaredConstructor();
        privateCtor.setAccessible(true);
        Singleton s1 = (Singleton) privateCtor.newInstance();
        Singleton s2 = (Singleton) privateCtor.newInstance();
        System.out.println("\\n反射创建 Singleton1: " + s1.getInstanceId());
        System.out.println("反射创建 Singleton2: " + s2.getInstanceId());
        System.out.println("单例被攻破? " + (s1 != Singleton.getInstance()));

        // ===== 通过类名动态创建（模拟框架）=====
        String className = "Main$User";
        Class<?> dynamicClass = Class.forName(className);
        Constructor<?> dc = dynamicClass.getDeclaredConstructor(String.class, int.class);
        Object dynamicUser = dc.newInstance("Bob", 25);
        System.out.println("\\n动态创建: " + dynamicUser);

        // ===== 参数数量未知时遍历匹配 =====
        Object[] initArgs = {"Carol", 28};
        User matched = createInstance(clazz, initArgs);
        System.out.println("按参数匹配创建: " + matched);

        System.out.println("\\n推荐 Constructor.newInstance，可处理异常和 private");
    }

    // 按参数个数和类型匹配构造器（处理基本类型装箱）
    @SuppressWarnings("unchecked")
    static <T> T createInstance(Class<T> clazz, Object[] args) throws Exception {
        for (Constructor<?> c : clazz.getDeclaredConstructors()) {
            Class<?>[] params = c.getParameterTypes();
            if (params.length != args.length) continue;
            boolean match = true;
            for (int i = 0; i < params.length; i++) {
                // 基本类型需用包装类判断 isInstance（int.class.isInstance(Integer) 为 false）
                Class<?> checkType = params[i].isPrimitive() ? wrapperOf(params[i]) : params[i];
                if (!checkType.isInstance(args[i])) { match = false; break; }
            }
            if (match) {
                c.setAccessible(true);
                return (T) c.newInstance(args);
            }
        }
        throw new NoSuchMethodException("无匹配构造器");
    }

    // 基本类型对应的包装类
    static Class<?> wrapperOf(Class<?> primitive) {
        if (primitive == int.class) return Integer.class;
        if (primitive == long.class) return Long.class;
        if (primitive == double.class) return Double.class;
        if (primitive == boolean.class) return Boolean.class;
        if (primitive == float.class) return Float.class;
        if (primitive == short.class) return Short.class;
        if (primitive == byte.class) return Byte.class;
        if (primitive == char.class) return Character.class;
        return primitive;
    }

    static String paramsToString(Class<?>[] params) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < params.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(params[i].getSimpleName());
        }
        return sb.toString();
    }

    // 用户类
    static class User {
        private String name;
        private int age;
        public User() { this.name = "匿名"; this.age = 0; }
        public User(String name, int age) { this.name = name; this.age = age; }
        private User(String name) { this.name = name; this.age = -1; }
        public String toString() { return "User{name='" + name + "', age=" + age + "}"; }
    }

    // 单例类
    static class Singleton {
        private static Singleton instance = new Singleton();
        private String id;
        private Singleton() { this.id = "SINGLETON-" + System.nanoTime(); }
        public static Singleton getInstance() { return instance; }
        public String getInstanceId() { return id; }
    }
}`
  },
  {
    id: "java-dynamic-proxy",
    group: "反射与注解",
    icon: "🎭",
    title: "动态代理",
    content: `# 动态代理

**动态代理**（Dynamic Proxy）是 JDK 提供的运行时生成代理类的机制，可在不修改源码的情况下为接口方法增加额外逻辑（日志、事务、权限等），是 AOP 的底层基础。

## Proxy.newProxyInstance

\`\`\`java
Object proxy = Proxy.newProxyInstance(
    loader,                       // 类加载器
    new Class[]{IFace.class},     // 代理的接口
    handler                       // 调用处理器
);
\`\`\`

代理类在运行时由 JVM 动态生成，实现指定接口，把方法调用转发给 InvocationHandler。

## InvocationHandler

调用处理器，所有方法调用都会进入 \`invoke\`：

\`\`\`java
interface InvocationHandler {
    Object invoke(Object proxy, Method method, Object[] args) throws Throwable;
}
\`\`\`

在 \`invoke\` 中可做前置/后置处理：

\`\`\`java
public Object invoke(Object proxy, Method method, Object[] args) {
    // 前置增强（日志、权限检查）
    Object result = method.invoke(target, args); // 委托真实对象
    // 后置增强（日志、事务提交）
    return result;
}
\`\`\`

## 动态代理原理

- JVM 在运行时生成字节码，创建实现指定接口的代理类（类名类似 \`$Proxy0\`）
- 代理类的方法体调用 InvocationHandler.invoke
- 代理类缓存于 ClassLoader，相同接口组合只生成一次

## 限制：只能代理接口

JDK 动态代理**只能代理接口**，不能代理类。若需代理类，使用 CGLib（通过生成子类）。这也是 Spring AOP 默认对接口用 JDK 代理、对类用 CGLib 的原因。

## AOP 基础

AOP（面向切面编程）的核心：将横切关注点（日志、事务、安全）从业务代码分离。动态代理是实现 AOP 的常见手段：
- **前置通知**：方法执行前
- **后置通知**：方法执行后
- **环绕通知**：包裹方法执行
- **异常通知**：方法抛异常时

Spring AOP、MyBatis Mapper、RPC Stub 都基于动态代理。

## 性能

动态代理每次方法调用都经过 \`invoke\`，有反射开销。生产中常用 CGLib 或字节码增强（ByteBuddy、ASM）提升性能。

## InvocationHandler 的设计要点

- **避免在 invoke 中调用 proxy 的方法**：会触发无限递归（proxy 的方法再次进入 invoke）。如需访问目标，调用 \`target\` 而非 \`proxy\`。
- **过滤 Object 方法**：\`toString\`、\`hashCode\`、\`equals\` 也会进入 invoke，需特殊处理避免日志/事务逻辑误触发。
- **线程安全**：handler 通常被多个线程共享，内部状态需线程安全。

## 多接口代理

\`Proxy.newProxyInstance\` 可同时实现多个接口：

\`\`\`java
Proxy.newProxyInstance(loader, new Class[]{A.class, B.class}, handler);
\`\`\`

代理对象可强转为任一接口。Spring 的 Bean 代理常组合多个接口（业务接口 + Advised）。

## 与 CGLib 的选择

接口存在优先用 JDK 动态代理（零依赖、JDK 原生）；无接口或需拦截类方法用 CGLib。Spring Boot 2.x+ 默认强制 CGLib 以避免代理类型转换问题。

下面通过代码演示动态代理：`,
    code: `// 演示动态代理
import java.lang.reflect.*;

public class Main {
    public static void main(String[] args) {
        // ===== 创建真实对象 =====
        UserService realService = new UserServiceImpl();

        // ===== 创建日志代理 =====
        UserService logProxy = (UserService) Proxy.newProxyInstance(
            Main.class.getClassLoader(),
            new Class[]{UserService.class},
            new LoggingHandler(realService)
        );

        System.out.println("=== 通过日志代理调用 ===");
        User u = logProxy.findById(42);
        logProxy.save(u);

        // ===== 通用代理：可代理任意接口 =====
        System.out.println("\\n=== 通用代理（带计时）===");
        UserService txProxy = wrap(realService, "事务");
        txProxy.findById(1);

        // ===== 查看代理类的真实类型 =====
        System.out.println("\\n=== 代理类信息 ===");
        System.out.println("代理类名: " + logProxy.getClass().getName());
        System.out.println("是 Proxy 子类? " + Proxy.isProxyClass(logProxy.getClass()));
        InvocationHandler h = Proxy.getInvocationHandler(logProxy);
        System.out.println("InvocationHandler: " + h.getClass().getSimpleName());

        // ===== 通过代理实现权限校验 =====
        System.out.println("\\n=== 权限校验代理 ===");
        UserService authProxy = wrap(realService, "权限");
        authProxy.delete(99);
    }

    // 通用包装方法：创建带前缀日志的代理
    @SuppressWarnings("unchecked")
    static <T> T wrap(T target, String tag) {
        return (T) Proxy.newProxyInstance(
            target.getClass().getClassLoader(),
            target.getClass().getInterfaces(),
            (proxy, method, args) -> {
                System.out.println("[" + tag + "] 进入 " + method.getName());
                long start = System.nanoTime();
                try {
                    Object result = method.invoke(target, args);
                    System.out.println("[" + tag + "] " + method.getName() + " 返回: " + result);
                    return result;
                } catch (InvocationTargetException e) {
                    System.out.println("[" + tag + "] " + method.getName() + " 抛异常: " + e.getCause());
                    throw e.getCause();
                } finally {
                    System.out.println("[" + tag + "] 退出 " + method.getName()
                        + " 用时 " + (System.nanoTime() - start) / 1000 + " μs");
                }
            }
        );
    }

    // 调用处理器：日志记录
    static class LoggingHandler implements InvocationHandler {
        private final Object target;
        LoggingHandler(Object target) { this.target = target; }
        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            System.out.println("[LOG] 调用 " + method.getName()
                + (args != null && args.length > 0 ? " 参数=" + args[0] : ""));
            Object result = method.invoke(target, args);
            System.out.println("[LOG] " + method.getName() + " 完成");
            return result;
        }
    }

    // 接口与实现
    interface UserService {
        User findById(int id);
        void save(User u);
        void delete(int id);
    }

    static class UserServiceImpl implements UserService {
        public User findById(int id) {
            System.out.println("  >> 查询用户 id=" + id);
            return new User(id, "user-" + id);
        }
        public void save(User u) { System.out.println("  >> 保存用户 " + u); }
        public void delete(int id) { System.out.println("  >> 删除用户 id=" + id); }
    }

    static class User {
        int id; String name;
        User(int id, String name) { this.id = id; this.name = name; }
        public String toString() { return "User[" + id + "," + name + "]"; }
    }
}`
  },
  {
    id: "java-annotation-basics",
    group: "反射与注解",
    icon: "🏷️",
    title: "注解基础",
    content: `# 注解基础

**注解**（Annotation）是 Java 5 引入的元数据机制，用于为代码附加标记信息，可被编译器或运行时工具读取处理。注解本身不直接影响业务逻辑，需通过工具/框架赋予意义。

## @Override

标注方法重写父类（或实现接口）方法。编译器检查方法签名是否真的覆盖，避免笔误：

\`\`\`java
@Override
public String toString() { return "..."; }
\`\`\`

若方法名拼错（如 \`tostring\`），编译器报错。这是最常用的编译期注解。

## @Deprecated

标记已过时元素，调用方会收到编译警告。可附带说明（Java 9+）：

\`\`\`java
@Deprecated(since = "9", forRemoval = true)
public void oldMethod() { }
\`\`\`

\`forRemoval = true\` 表示未来会移除，强烈不建议使用。

## @SuppressWarnings

抑制编译警告：

\`\`\`java
@SuppressWarnings("unchecked")
List list = new ArrayList();
\`\`\`

常用 key：\`unchecked\`（泛型未检查）、\`deprecation\`（过时）、\`rawtypes\`、\`unused\`、\`all\`。

## 注解的作用

- **编译检查**：如 @Override 让编译器校验
- **代码生成**：如 Lombok @Data 自动生成 getter/setter
- **运行时处理**：如 Spring @Autowired 注入依赖
- **文档生成**：如 Javadoc 读取 @Deprecated
- **配置替代**：注解替代 XML 配置（Spring Boot）

## 元注解

定义注解时用元注解修饰：\`@Target\`（可应用目标）、\`@Retention\`（保留策略）、\`@Documented\`（纳入 Javadoc）、\`@Inherited\`（子类继承）。

## 注解保留策略

| 策略 | 说明 | 可读时机 |
|------|------|---------|
| \`SOURCE\` | 仅源码，编译后丢弃 | 编译期（如 @Override） |
| \`CLASS\` | 保留到 class 文件，JVM 不加载（默认） | 字节码工具 |
| \`RUNTIME\` | 保留到运行时，可反射读取 | 运行时（如 Spring） |

注解框架（Spring、JUnit）几乎都用 \`RUNTIME\`，以便反射读取。

## 内置注解一览

Java 内置注解分两类：**编译相关**（\`@Override\`、\`@SuppressWarnings\`、\`@Deprecated\`、\`@FunctionalInterface\`、\`@SafeVarargs\`）和**元注解**（\`@Target\`、\`@Retention\`、\`@Documented\`、\`@Inherited\`、\`@Repeatable\`）。\`@FunctionalInterface\` 标注函数式接口（仅一个抽象方法），编译器校验；\`@SafeVarargs\` 抑制泛型可变参数的 unchecked 警告（仅用于 final/static/private 方法或构造器）。

## 注解 vs 注释 vs 接口

注释（\`//\`、\`/* */\`）编译时丢弃，仅供人阅读；注解是结构化元数据，可被工具/反射读取；接口是行为契约，需实现。注解不参与方法分发，但可作为框架识别的标记。

## 注解的演进

Java 5 引入注解；Java 8 增加 \`@Repeatable\`（重复注解）与类型注解（\`TYPE_USE\`）；Java 9 模块系统支持 \`provides ... with ...\` 声明服务；Java 16 引入 record 类减少对 Lombok 的依赖。注解已成为现代 Java 框架的核心配置手段。

下面通过代码演示内置注解：`,
    code: `// 演示内置注解
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // ===== @Deprecated 警告演示 =====
        OldAPI api = new OldAPI();
        api.oldMethod();           // 会有过时警告
        api.deprecatedMethod2();   // forRemoval 警告更强

        // ===== @SuppressWarnings 抑制警告 =====
        @SuppressWarnings("unchecked")
        List<String> list = new ArrayList(); // 未指定泛型，但抑制了警告
        list.add("hello");
        System.out.println("list: " + list);

        @SuppressWarnings({"unchecked", "rawtypes"})
        Map map = new HashMap();
        map.put("k", 1);
        System.out.println("map: " + map);

        // ===== @Override 保证重写正确 =====
        Animal dog = new Dog();
        System.out.println(dog.sound());

        Animal cat = new Cat();
        System.out.println(cat.sound());

        // ===== 查看类的 @Deprecated 信息 =====
        Class<?> clazz = OldAPI.class;
        if (clazz.isAnnotationPresent(Deprecated.class)) {
            Deprecated d = clazz.getAnnotation(Deprecated.class);
            System.out.println("\\nOldAPI 已过时: since=" + d.since()
                + ", forRemoval=" + d.forRemoval());
        }

        // 检查方法上的 @Deprecated
        for (var m : clazz.getDeclaredMethods()) {
            if (m.isAnnotationPresent(Deprecated.class)) {
                System.out.println("方法过时: " + m.getName());
            }
        }
    }

    // ===== @Override 演示 =====
    static abstract class Animal {
        abstract String sound();
    }
    static class Dog extends Animal {
        @Override
        String sound() { return "汪汪"; }
    }
    static class Cat extends Animal {
        @Override   // 若拼错方法名，编译器会报错
        String sound() { return "喵喵"; }
    }

    // ===== @Deprecated 演示 =====
    @Deprecated(since = "1.8", forRemoval = true)
    static class OldAPI {
        @Deprecated
        public void oldMethod() {
            System.out.println("调用过时方法 oldMethod");
        }

        @Deprecated(since = "9", forRemoval = true)
        public void deprecatedMethod2() {
            System.out.println("调用即将移除的方法 deprecatedMethod2");
        }

        public void newMethod() {
            System.out.println("新方法，请使用这个");
        }
    }
}`
  },
  {
    id: "java-custom-annotation",
    group: "反射与注解",
    icon: "✏️",
    title: "自定义注解",
    content: `# 自定义注解

使用 \`@interface\` 关键字定义注解。自定义注解本身只是元数据，需配合元注解和处理器才能发挥作用。

## @interface 定义

\`\`\`java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface MyAnnotation {
    String value();
}
\`\`\`

注解属性以**无参方法**形式声明，返回类型限于：基本类型、String、Class、枚举、注解、以及它们的数组。

## 元注解

- \`@Target\`：可标注的目标（TYPE/FIELD/METHOD/CONSTRUCTOR/PARAMETER 等）
- \`@Retention\`：保留策略（SOURCE/CLASS/RUNTIME）
- \`@Documented\`：纳入 Javadoc
- \`@Inherited\`：子类自动继承该注解（仅对类有效）
- \`@Repeatable\`：可重复标注（Java 8+）

## 注解属性

\`\`\`java
@interface Test {
    String name();
    int timeout() default 0;        // 默认值
    String[] tags() default {};     // 数组属性
}
\`\`\`

- 无默认值的属性使用时必须显式提供
- \`value()\` 是特殊属性，单值时可省略名字：\`@Test("x")\`
- 数组单元素可省略花括号：\`@Test(tags = "a")\`

## 默认值

\`\`\`java
@interface Cache {
    int ttl() default 60;
    boolean enabled() default true;
}
\`\`\`

默认值不能为 \`null\`，需用特殊标记（如空字符串、-1）表示无。

## 使用示例

\`\`\`java
@Cache(ttl = 120)
public User getUser(int id) { ... }
\`\`\`

## 注解的注解

注解属性类型可以是另一个注解，构建复杂元数据。Web 框架（Spring MVC、JAX-RS）大量用注解描述路由、参数绑定、权限等。

## value 属性的省略规则

当注解只需一个属性且名为 \`value\` 时，使用时可省略属性名：

\`\`\`java
@Table("t_user")           // 等价 @Table(value = "t_user")
@Cache(ttl = 60)           // 非 value 属性必须写名字
\`\`\`

多属性时若也写 value，需显式：\`@MyAnno(value = "x", count = 2)\`。

## 反射读取自定义注解

定义 \`@Retention(RUNTIME)\` 后，可通过反射读取：

\`\`\`java
if (method.isAnnotationPresent(MyAnno.class)) {
    MyAnno a = method.getAnnotation(MyAnno.class);
    String v = a.value();
}
\`\`\`

这是 Spring、JUnit 等框架识别注解的通用模式。

## 实战案例

- **JUnit \`@Test\`**：标记测试方法，\`expected\`/\`timeout\` 属性配置行为
- **Spring \`@RequestMapping\`**：\`path\`、\`method\`、\`params\` 描述 HTTP 路由
- **JPA \`@Entity\`/\`@Column\`**：描述实体与数据库映射
- **Validation \`@NotNull\`/\`@Size\`**：声明式参数校验

下面通过代码演示自定义注解：`,
    code: `// 演示自定义注解
import java.lang.annotation.*;
import java.util.Arrays;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 使用自定义注解 =====
        MethodInfo info = Main.class.getMethod("greet").getAnnotation(MethodInfo.class);
        System.out.println("--- 读取方法注解 ---");
        System.out.println("author: " + info.author());
        System.out.println("version: " + info.version());
        System.out.println("tags: " + Arrays.toString(info.tags()));

        // ===== @Repeatable 重复注解 =====
        System.out.println("\\n--- 重复注解 ---");
        Schedule[] schedules = Task.class.getAnnotationsByType(Schedule.class);
        for (Schedule s : schedules) {
            System.out.println("定时: " + s.cron() + " (" + s.desc() + ")");
        }

        // ===== @Inherited 测试 =====
        System.out.println("\\n--- @Inherited 测试 ---");
        System.out.println("Child 有 @InheritedAnno? "
            + Child.class.isAnnotationPresent(InheritedAnno.class));
        System.out.println("Child 有 @NonInheritedAnno? "
            + Child.class.isAnnotationPresent(NonInheritedAnno.class));

        // ===== @Target 限制：下面这行如果取消注释会编译失败 =====
        // @MethodInfo(author="x") int x;  // 错误：@MethodInfo 只能用于方法

        // ===== 注解属性的默认值 =====
        Cache c = Main.class.getMethod("getServiceMethod").getAnnotation(Cache.class);
        System.out.println("\\n--- 默认值 ---");
        System.out.println("ttl: " + c.ttl() + ", enabled: " + c.enabled());
    }

    @MethodInfo(author = "张三", version = 1.0, tags = {"core", "demo"})
    public static String greet() { return "hello"; }

    @Cache(ttl = 120)
    public static String getServiceMethod() { return "service"; }

    // ===== 元注解 + 自定义注解 =====
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    @interface MethodInfo {
        String author();
        double version() default 1.0;
        String[] tags() default {};
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    @interface Cache {
        int ttl() default 60;
        boolean enabled() default true;
    }

    // ===== @Repeatable：可重复注解 =====
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    @interface Schedules {
        Schedule[] value();
    }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    @Repeatable(Schedules.class)
    @interface Schedule {
        String cron();
        String desc() default "";
    }

    @Schedule(cron = "0 0 * * *", desc = "每天零点")
    @Schedule(cron = "0 * * * *", desc = "每小时")
    static class Task { }

    // ===== @Inherited 测试 =====
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    @Inherited
    @interface InheritedAnno { }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    @interface NonInheritedAnno { }

    @InheritedAnno
    @NonInheritedAnno
    static class Parent { }
    static class Child extends Parent { }
}`
  },
  {
    id: "java-annotation-processing",
    group: "反射与注解",
    icon: "⚙️",
    title: "注解处理",
    content: `# 注解处理

定义注解后，需通过**处理器**读取并赋予实际意义。处理时机分两类：编译时（APT）和运行时（反射）。

## 反射读取注解

仅 \`@Retention(RUNTIME)\` 的注解可被反射读取：

\`\`\`java
if (method.isAnnotationPresent(MyAnno.class)) {
    MyAnno a = method.getAnnotation(MyAnno.class);
    String value = a.value();
}
\`\`\`

常用 API：
- \`isAnnotationPresent(Class)\`：是否标注
- \`getAnnotation(Class)\`：获取单个（含继承的 @Inherited）
- \`getAnnotations()\`：获取全部
- \`getAnnotationsByType(Class)\`：支持 @Repeatable
- \`getDeclaredAnnotation(Class)\`：仅本类声明（不含继承）

## 注解处理器（APT）

Annotation Processing Tool 在**编译期**扫描注解，生成新代码或检查约束。Java 6 起内置 \`javax.annotation.processing.Processor\`：

\`\`\`java
@SupportedAnnotationTypes("com.example.MyAnno")
public class MyProcessor extends AbstractProcessor {
    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment env) {
        // 生成代码、检查约束
        return true;
    }
}
\`\`\`

## 编译时处理优势

- **零运行时开销**：生成的代码直接编译进 class
- **类型安全**：生成的代码编译期校验
- **提前报错**：注解约束不满足时编译失败

典型应用：**Lombok**（编译时生成 getter/setter/构造器）、**Dagger / Hilt**（依赖注入代码生成）、**ButterKnife / ViewBinding**（视图绑定）、**MapStruct**（对象映射代码生成）。

## 运行时 vs 编译时

| 维度 | 运行时反射 | 编译时 APT |
|------|----------|-----------|
| 性能 | 有反射开销 | 零开销 |
| 灵活性 | 高（可动态） | 低（编译期固定） |
| 启动速度 | 慢（需扫描） | 快 |
| 调试 | 反射栈难追踪 | 普通代码 |
| 典型 | Spring | Lombok、Dagger |

## 注册处理器

APT 需在 \`META-INF/services/javax.annotation.processing.Processor\` 中注册实现类，编译器会自动加载（或通过 \`@AutoService\` 自动生成）。

## 处理轮次与 Filer

\`process\` 方法可能被调用**多轮**：第一轮处理源码中的注解，若处理器生成了带注解的新源码，会触发下一轮。每轮通过 \`RoundEnvironment\` 获取当前被注解的元素，最后一轮 \`processingOver()\` 为 true 表示处理结束。

生成代码用 \`Filer\`（\`processingEnv.getFiler()\`）创建源文件、类文件或资源文件：

\`\`\`java
JavaFileObject file = filer.createSourceFile("com.example.Generated");
try (Writer w = file.openWriter()) { w.write("package com.example; class Generated {}"); }
\`\`\`

\`Filer\` 保证生成路径正确，避免覆盖手动编写的源码。

## 运行时处理器实战

运行时反射处理注解的典型流程：扫描类的成员 → 检查注解 → 执行增强逻辑。下面三个实战案例覆盖了主流用法：**测试运行器**（JUnit 风格）、**路由分发器**（Spring MVC 风格）、**ORM 映射**（Hibernate 风格）。三者都通过 \`isAnnotationPresent\` + \`getAnnotation\` 读取元数据，反射驱动行为。

下面通过代码演示反射读取注解并执行：`,
    code: `// 演示反射读取注解并执行（测试运行器 + 路由分发 + ORM 映射）
import java.lang.annotation.*;
import java.lang.reflect.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 扫描类上的方法注解并执行 =====
        System.out.println("--- 测试运行器（反射读取注解）---");
        runTests(TestSuite.class);

        // ===== 模拟路由分发 =====
        System.out.println("\\n--- 路由分发器 ---");
        Dispatcher disp = new Dispatcher();
        disp.dispatch("GET", "/users");
        disp.dispatch("POST", "/users");
        disp.dispatch("DELETE", "/users/1");
        disp.dispatch("PUT", "/unknown");

        // ===== 读取类/字段注解（ORM 映射）=====
        System.out.println("\\n--- ORM 映射读取 ---");
        Table tableAnno = Entity.class.getAnnotation(Table.class);
        System.out.println("表名: " + tableAnno.value());
        for (Field f : Entity.class.getDeclaredFields()) {
            if (f.isAnnotationPresent(Column.class)) {
                Column col = f.getAnnotation(Column.class);
                System.out.println("  字段 " + f.getName()
                    + " -> 列 " + col.name() + (col.pk() ? " (主键)" : ""));
            }
        }
    }

    // ===== 简易测试运行器 =====
    static void runTests(Class<?> clazz) throws Exception {
        Object instance = clazz.getDeclaredConstructor().newInstance();
        int passed = 0, failed = 0;
        for (Method m : clazz.getDeclaredMethods()) {
            if (m.isAnnotationPresent(MyTest.class)) {
                MyTest t = m.getAnnotation(MyTest.class);
                System.out.println("运行 " + m.getName() + " (超时=" + t.timeout() + "ms)");
                m.setAccessible(true);
                long start = System.currentTimeMillis();
                try {
                    m.invoke(instance);
                    long cost = System.currentTimeMillis() - start;
                    if (t.timeout() > 0 && cost > t.timeout()) {
                        System.out.println("  ✗ 超时 (" + cost + "ms)");
                        failed++;
                    } else {
                        System.out.println("  ✓ 通过 (" + cost + "ms)");
                        passed++;
                    }
                } catch (InvocationTargetException e) {
                    System.out.println("  ✗ 失败: " + e.getCause());
                    failed++;
                }
            }
        }
        System.out.println("总计: " + passed + " 通过, " + failed + " 失败");
    }

    // ===== 注解定义 =====
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    @interface MyTest { long timeout() default 0; }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    @interface Route { String method(); String path(); }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    @interface Table { String value(); }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.FIELD)
    @interface Column { String name(); boolean pk() default false; }

    // ===== 测试用例类 =====
    static class TestSuite {
        @MyTest
        void testAdd() { if (1 + 1 != 2) throw new AssertionError("加法错误"); }
        @MyTest(timeout = 100)
        void testFast() throws InterruptedException { Thread.sleep(10); }
        @MyTest
        void testFail() { throw new RuntimeException("故意失败"); }
    }

    // ===== 路由控制器 =====
    static class Dispatcher {
        public void dispatch(String method, String path) {
            for (Method m : this.getClass().getDeclaredMethods()) {
                if (m.isAnnotationPresent(Route.class)) {
                    Route r = m.getAnnotation(Route.class);
                    if (r.method().equals(method) && r.path().equals(path)) {
                        try { m.invoke(this); return; }
                        catch (Exception e) { System.out.println("调用失败: " + e.getCause()); return; }
                    }
                }
            }
            System.out.println("无匹配路由: " + method + " " + path);
        }
        @Route(method = "GET", path = "/users")
        void listUsers() { System.out.println("返回用户列表"); }
        @Route(method = "POST", path = "/users")
        void createUser() { System.out.println("创建用户"); }
        @Route(method = "DELETE", path = "/users/1")
        void deleteUser() { System.out.println("删除用户 1"); }
    }

    // ===== ORM 实体类 =====
    @Table("t_user")
    static class Entity {
        @Column(name = "id", pk = true)
        private Long id;
        @Column(name = "user_name")
        private String name;
    }
}`
  },
  {
    id: "java-meta-annotations",
    group: "反射与注解",
    icon: "📌",
    title: "元注解详解",
    content: `# 元注解详解

**元注解**（Meta-Annotation）是标注注解的注解，定义注解的元信息。\`java.lang.annotation\` 包提供五个标准元注解。

## @Target 元素类型

限制注解可标注的位置，值为 \`ElementType[]\`：

| 元素类型 | 可标注位置 |
|---------|-----------|
| \`TYPE\` | 类、接口、注解、枚举 |
| \`FIELD\` | 字段（含枚举常量） |
| \`METHOD\` | 方法 |
| \`PARAMETER\` | 方法参数 |
| \`CONSTRUCTOR\` | 构造器 |
| \`LOCAL_VARIABLE\` | 局部变量 |
| \`ANNOTATION_TYPE\` | 注解类型 |
| \`PACKAGE\` | 包 |
| \`TYPE_PARAMETER\`（Java 8） | 类型参数 \`<T>\` |
| \`TYPE_USE\`（Java 8） | 类型使用处 |
| \`MODULE\`（Java 9） | 模块 |

不写 @Target 则可标注任意位置。

## @Retention 保留策略

\`\`\`java
@Retention(RetentionPolicy.RUNTIME)  // SOURCE / CLASS / RUNTIME
\`\`\`

- \`SOURCE\`：编译期丢弃（如 @Override、@SuppressWarnings）
- \`CLASS\`：写入 class 但 JVM 不加载（默认，字节码工具用）
- \`RUNTIME\`：运行时可通过反射读取（框架注解必备）

## @Documented

标记注解会出现在 Javadoc 中。默认注解不出现在文档里：

\`\`\`java
@Documented
public @interface ApiStatus { }
\`\`\`

## @Inherited

类注解可被子类继承（仅对 \`@Target(TYPE)\` 有效，接口不继承）：

\`\`\`java
@Inherited @Target(ElementType.TYPE)
public @interface Entity { }

@Entity class Parent {}
class Child extends Parent {}  // Child 自动有 @Entity
\`\`\`

注意：仅类继承有效，接口实现不继承；方法、字段注解不继承。

## @Repeatable（Java 8）

允许同一位置重复标注同一注解，需配套容器注解：

\`\`\`java
@Repeatable(Schedules.class)
public @interface Schedule { String cron(); }

public @interface Schedules { Schedule[] value(); }

@Schedule(cron = "0 0 * * *")
@Schedule(cron = "0 * * * *")
class Task {}
\`\`\`

反射读取时用 \`getAnnotationsByType(Schedule.class)\` 直接获取数组，容器注解被自动展开。

## 组合使用

自定义注解通常组合多个元注解：

\`\`\`java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Transactional { }
\`\`\`

合理使用元注解是定义规范注解的关键。

下面通过代码演示元注解：`,
    code: `// 演示元注解
import java.lang.annotation.*;
import java.lang.reflect.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        Class<?> marker = MainMarker.class;

        // ===== @Target 限制演示 =====
        System.out.println("--- @Target 限制 ---");
        // @MethodOnly 只能用于方法
        MethodOnly mo = Main.class.getMethod("annotatedMethod").getAnnotation(MethodOnly.class);
        System.out.println("方法注解: " + mo.value());

        // ===== @Retention 验证：RUNTIME 可读，SOURCE 不可读 =====
        System.out.println("\\n--- @Retention ---");
        boolean hasRuntime = marker.isAnnotationPresent(RuntimeVisible.class);
        boolean hasSource = marker.isAnnotationPresent(SourceOnly.class);
        System.out.println("RUNTIME 注解可读? " + hasRuntime);
        System.out.println("SOURCE 注解可读? " + hasSource + " (编译期已丢弃)");

        // ===== @Inherited 测试 =====
        System.out.println("\\n--- @Inherited ---");
        System.out.println("Parent 标注: " + Parent.class.isAnnotationPresent(InheritedMark.class));
        System.out.println("Child 自动继承: " + Child.class.isAnnotationPresent(InheritedMark.class));

        // ===== @Documented 不影响运行时，仅影响 Javadoc =====
        System.out.println("\\n--- @Documented ---");
        System.out.println("@DocumentedAnno 存在: " + marker.isAnnotationPresent(DocumentedAnno.class));

        // ===== @Repeatable =====
        System.out.println("\\n--- @Repeatable ---");
        // getAnnotation 取容器，getAnnotationsByType 取实际重复注解
        System.out.println("getAnnotation(Schedule): "
            + (Job.class.getAnnotation(Schedule.class) == null ? "无 (需用容器)" : "有"));
        Schedule[] arr = Job.class.getAnnotationsByType(Schedule.class);
        System.out.println("getAnnotationsByType 数量: " + arr.length);
        for (Schedule s : arr) System.out.println("  " + s.cron());

        // ===== TYPE_USE：标注类型使用处（Java 8+）=====
        System.out.println("\\n--- @TYPE_USE ---");
        List<@NonNull String> safeList = new ArrayList<>();
        System.out.println("类型注解可用: " + safeList);
    }

    @MethodOnly("用于方法")
    public static void annotatedMethod() { }

    // ===== 元注解定义 =====
    @Target(ElementType.METHOD)
    @Retention(RetentionPolicy.RUNTIME)
    @interface MethodOnly { String value(); }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    @interface RuntimeVisible { }

    @Retention(RetentionPolicy.SOURCE)
    @Target(ElementType.TYPE)
    @interface SourceOnly { }

    @Documented
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    @interface DocumentedAnno { }

    @Inherited
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    @interface InheritedMark { }

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    @interface Schedules { Schedule[] value(); }

    @Repeatable(Schedules.class)
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    @interface Schedule { String cron(); }

    @Target(ElementType.TYPE_USE)
    @Retention(RetentionPolicy.RUNTIME)
    @interface NonNull { }

    // ===== 使用注解的类 =====
    @RuntimeVisible
    @SourceOnly
    @DocumentedAnno
    public static class MainMarker { }

    @InheritedMark
    static class Parent { }
    static class Child extends Parent { }

    @Schedule(cron = "0 0 * * *")
    @Schedule(cron = "0 * * * *")
    @Schedule(cron = "0 0 0 * *")
    static class Job { }
}`
  },
  {
    id: "java-reflection-performance",
    group: "反射与注解",
    icon: "⚡",
    title: "反射性能",
    content: `# 反射性能

反射比直接调用慢，主要因为：方法查找、参数装箱、安全检查、JIT 难以内联。但合理优化可显著缩小差距。

## 反射开销来源

1. **方法/字段查找**：每次按名称匹配 Method/Field 对象
2. **参数装箱**：基本类型参数装箱为 Integer/Double
3. **访问检查**：每次 invoke 检查访问权限
4. **方法分发**：通过 JNI/native 调用，难以内联
5. **JIT 优化受限**：反射调用点对编译器不透明

## setAccessible 优化

\`setAccessible(true)\` 跳过访问检查，提升约 20-30% 性能：

\`\`\`java
Method m = clazz.getMethod("foo");
m.setAccessible(true);  // 跳过权限检查
\`\`\`

## Method 缓存

避免每次 \`getMethod\`，缓存 Method 对象复用：

\`\`\`java
private static final Method FOO = initMethod();  // 类加载时查找一次
\`\`\`

后续直接 \`FOO.invoke(...)\`。这是 Spring、Hibernate 等框架的标准做法。

## 直接调用 vs 反射调用

\`\`\`java
// 直接调用
obj.doSomething();
// 反射调用
method.invoke(obj);
\`\`\`

反射通常慢数倍到数十倍（看场景），但**绝对值**往往可接受。对于高频热点路径才需优化。

## 性能对比策略

- **直接调用**：基准
- **反射 + 缓存 + setAccessible**：优化反射
- **MethodHandle**（Java 7+）：可被 JIT 内联，性能接近直接调用
- **LambdaMetafactory**（Java 8+）：将 Method 转为 Lambda，性能最佳

## MethodHandle 简介

\`\`\`java
MethodHandles.Lookup lookup = MethodHandles.lookup();
MethodHandle mh = lookup.findVirtual(clazz, "foo", MethodType.methodType(void.class));
mh.invoke(obj);  // 可被 JIT 内联
\`\`\`

\`invokeExact\` 性能接近直接调用，但类型检查严格。

## 优化建议

1. 缓存 Method/Field 对象
2. \`setAccessible(true)\`
3. 高频场景用 MethodHandle 或 LambdaMetafactory
4. 不要在循环里反复查找 Method
5. 能用接口/泛型避免反射就不用

## LambdaMetafactory

Java 8 引入 \`LambdaMetafactory\` 可将 \`MethodHandle\` 转为函数式接口实例，调用开销接近直接调用。它是 \`MethodHandle\` 之上的封装，JIT 能将其完全内联：

\`\`\`java
CallSite site = LambdaMetafactory.metafactory(
    lookup, "apply", MethodType.methodType(Function.class),
    MethodType.methodType(Object.class, Object.class), handle, MethodType.methodType(int.class, int.class));
Function<Integer, Integer> fn = (Function<Integer, Integer>) site.getTarget().invoke();
\`\`\`

Spring 在反射频繁的热点路径上也用类似机制提速。使用门槛较高，仅在性能瓶颈明确时引入。

## JIT 与反射

JIT 编译器对反射调用点不透明，难以内联优化。预热（warmup）让 JIT 识别热点后，反射性能会趋于稳定。测试反射性能时务必先预热再计时，否则数据偏差很大。生产环境中，反射方法在 JIT 编译后通常能进入 C2 优化，差距缩小到 2-5 倍以内。

## 性能优化决策树

判断是否需要优化反射：先测量（JMH 基准测试）→ 确认是热点（占运行时间显著比例）→ 逐步优化（缓存 → setAccessible → MethodHandle → LambdaMetafactory）→ 再测量验证收益。多数业务场景下，反射开销远小于 IO/网络，无需优化。

下面通过代码演示反射性能对比与优化：`,
    code: `// 演示反射性能对比与优化
import java.lang.reflect.*;
import java.lang.invoke.*;

public class Main {
    // 缓存 Method 对象与 MethodHandle（类加载时查找一次）
    static final Method CACHED_METHOD;
    static final MethodHandle CACHED_HANDLE;
    static {
        try {
            CACHED_METHOD = Worker.class.getDeclaredMethod("compute", int.class);
            CACHED_METHOD.setAccessible(true);
            MethodHandles.Lookup lookup = MethodHandles.lookup();
            CACHED_HANDLE = lookup.findVirtual(Worker.class, "compute",
                MethodType.methodType(int.class, int.class));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static void main(String[] args) throws Throwable {
        Worker worker = new Worker();
        int n = 100_000;
        int warmup = 10_000;

        // 预热（让 JIT 编译）
        for (int i = 0; i < warmup; i++) {
            worker.compute(i);
            CACHED_METHOD.invoke(worker, i);
            CACHED_HANDLE.invoke(worker, i);
        }

        // ===== 直接调用 =====
        long t1 = System.nanoTime();
        long sum1 = 0;
        for (int i = 0; i < n; i++) sum1 += worker.compute(i);
        long t2 = System.nanoTime();
        System.out.println("直接调用: " + (t2 - t1) / 1_000_000 + " ms, sum=" + sum1);

        // ===== 反射（每次查找 Method）=====
        long t3 = System.nanoTime();
        long sum2 = 0;
        for (int i = 0; i < n; i++) {
            Method m = worker.getClass().getDeclaredMethod("compute", int.class);
            sum2 += (int) m.invoke(worker, i);
        }
        long t4 = System.nanoTime();
        System.out.println("反射(每次查找): " + (t4 - t3) / 1_000_000 + " ms, sum=" + sum2);

        // ===== 反射 + 缓存 + setAccessible =====
        long t5 = System.nanoTime();
        long sum3 = 0;
        for (int i = 0; i < n; i++) sum3 += (int) CACHED_METHOD.invoke(worker, i);
        long t6 = System.nanoTime();
        System.out.println("反射(缓存+setAccessible): " + (t6 - t5) / 1_000_000 + " ms, sum=" + sum3);

        // ===== 不 setAccessible 的反射 =====
        Method noAccessible = Worker.class.getDeclaredMethod("compute", int.class);
        long t7 = System.nanoTime();
        long sum4 = 0;
        for (int i = 0; i < n; i++) sum4 += (int) noAccessible.invoke(worker, i);
        long t8 = System.nanoTime();
        System.out.println("反射(无setAccessible): " + (t8 - t7) / 1_000_000 + " ms, sum=" + sum4);

        // ===== MethodHandle =====
        long t9 = System.nanoTime();
        long sum5 = 0;
        for (int i = 0; i < n; i++) sum5 += (int) CACHED_HANDLE.invoke(worker, i);
        long t10 = System.nanoTime();
        System.out.println("MethodHandle: " + (t10 - t9) / 1_000_000 + " ms, sum=" + sum5);

        // ===== 性能对比小结 =====
        System.out.println("\\n性能对比 (基准=直接调用):");
        long base = t2 - t1;
        System.out.printf("  直接调用:        %.2fx%n", 1.0);
        System.out.printf("  反射(每次查找):  %.2fx%n", (double)(t4 - t3) / base);
        System.out.printf("  反射(缓存):      %.2fx%n", (double)(t6 - t5) / base);
        System.out.printf("  MethodHandle:    %.2fx%n", (double)(t10 - t9) / base);
    }

    static class Worker {
        public int compute(int x) { return x * x + x; }
    }
}`
  },
  {
    id: "java-reflection-security",
    group: "反射与注解",
    icon: "🔐",
    title: "反射与安全",
    content: `# 反射与安全

反射可绕过访问控制（访问 private、调用非导出 API），带来安全风险。Java 通过 SecurityManager 和模块系统限制反射。

## SecurityManager

Java 9 之前，SecurityManager 控制反射权限。访问 private 需 \`ReflectPermission("suppressAccessChecks")\`：

\`\`\`java
System.setSecurityManager(new SecurityManager());
Field f = clazz.getDeclaredField("secret");
f.setAccessible(true);  // 无权限时抛 SecurityException
\`\`\`

Java 17 起 SecurityManager 被标记废弃，未来移除。Applet、Java Web Start 时代的安全模型逐渐淡出。

## 模块系统限制

Java 9 引入模块系统后，反射被严格限制。即使 \`setAccessible(true)\`，访问其他模块的非导出包也会抛 \`InaccessibleObjectException\`：

\`\`\`
Unable to make field private final java.lang.String accessible:
module java.base does not "opens java.lang" to module my.app
\`\`\`

## --add-opens

通过启动参数开放包给指定模块：

\`\`\`
--add-opens java.base/java.lang=ALL-UNNAMED
--add-opens java.base/java.util=ALL-UNNAMED
\`\`\`

常用于让旧反射代码（如深拷贝、序列化库）在新 JDK 上运行。

## opens 声明

模块描述符 \`module-info.java\` 中声明开放：

\`\`\`java
module my.app {
    opens com.example.entities to spring.core, hibernate.core;
}
\`\`\`

仅向指定模块开放，最小化暴露面。

## 反射的权限控制

- **public 成员**：任何模块可反射访问
- **非 public 成员**：需目标模块 open 对应包
- **JDK 内部 API**：默认不开放，需 --add-opens
- **sun.misc.Unsafe 等敏感 API**：极难访问

## 常见问题

Spring/Hibernate 在 Java 9+ 报 \`InaccessibleObjectException\`，解决：框架升级到支持模块的版本、临时用 \`--add-opens\` 开放、实体包加 \`opens\` 声明。

## 反射攻击防御

- 单例防御：枚举单例天然防反射
- 序列化：\`readResolve\` 防止反序列化创建新实例
- 安全框架：用模块封装敏感类

## 模块边界与反射

模块系统下，反射的访问控制变为双层：**Java 语言层**（public/private）与**模块层**（exports/opens）。即使成员是 public，若所在包未 \`exports\`，其他模块也无法反射访问。而 \`opens\` 专门授权反射访问（含 private），\`exports\` 仅授权编译期访问。框架（Spring、Hibernate）需要 \`opens\` 而非 \`exports\` 实体包。

## sun.misc.Unsafe 与深度反射

\`sun.misc.Unsafe\` 提供绕过 JVM 安全的直接内存操作，反射访问它在高版本 JDK 受严格限制（需 \`--add-opens java.base/jdk.internal.misc=ALL-UNNAMED\`）。Netty、Cassandra 等高性能库依赖 Unsafe 做堆外内存管理。Java 9+ 提供 \`VarHandle\` 作为安全替代，推荐新代码使用。

## 安全审计建议

- 避免对不可信输入的类名做 \`Class.forName\`（可加载任意类）
- 限制 \`setAccessible\` 范围，仅在可信边界内使用
- 模块化敏感代码，用 \`opens\` 精确授权
- 监控反射创建对象的调用栈，记录异常访问

下面通过代码演示反射安全相关特性：`,
    code: `// 演示反射安全相关特性
import java.lang.reflect.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 访问 private 字段（同模块内可 setAccessible）=====
        SecretHolder holder = new SecretHolder("密码123");
        Class<?> clazz = holder.getClass();
        Field secretField = clazz.getDeclaredField("secret");
        secretField.setAccessible(true);
        System.out.println("反射读取 private: " + secretField.get(holder));

        // 访问 private final 字段（演示，实际不推荐）
        Field piField = clazz.getDeclaredField("PI");
        piField.setAccessible(true);
        System.out.println("final PI 原值: " + piField.getDouble(holder));
        // 注意：final 字段修改可能因 JIT 内联而不生效

        // ===== 模块系统：尝试访问 JDK 内部（会失败）=====
        System.out.println("\\n--- 尝试访问 JDK 内部（演示模块限制）---");
        try {
            Class<?> strClass = String.class;
            Field valueField = strClass.getDeclaredField("value");
            valueField.setAccessible(true);
            System.out.println("成功访问 String.value（已 --add-opens 或旧 JDK）");
        } catch (InaccessibleObjectException e) {
            System.out.println("被模块系统阻止: " + e.getMessage());
            System.out.println("解决：--add-opens java.base/java.lang=ALL-UNNAMED");
        } catch (NoSuchFieldException e) {
            System.out.println("字段不存在（JDK 版本差异）: " + e.getMessage());
        }

        // ===== SecurityManager 状态（Java 17 前有效）=====
        System.out.println("\\n--- SecurityManager 状态 ---");
        SecurityManager sm = System.getSecurityManager();
        System.out.println("当前 SecurityManager: " + (sm == null ? "无" : sm.getClass().getName()));
        System.out.println("Java 17+ SecurityManager 已废弃");

        // ===== 枚举单例防反射攻击 =====
        System.out.println("\\n--- 枚举单例防反射 ---");
        System.out.println("INSTANCE1 == INSTANCE2: "
            + (EnumSingleton.INSTANCE == EnumSingleton.INSTANCE));
        Constructor<?> enumCtor = EnumSingleton.class.getDeclaredConstructors()[0];
        enumCtor.setAccessible(true);
        System.out.println("枚举构造器存在，但反射 newInstance 会抛异常（天然防护）");

        // ===== 普通单例可被反射攻破 =====
        System.out.println("\\n--- 普通单例可被攻破 ---");
        LazySingleton s1 = LazySingleton.getInstance();
        Constructor<?> c = LazySingleton.class.getDeclaredConstructor();
        c.setAccessible(true);
        LazySingleton s2 = (LazySingleton) c.newInstance();
        System.out.println("s1 == s2: " + (s1 == s2) + " (反射创建了新实例)");
    }

    static class SecretHolder {
        private String secret;
        public static final double PI = 3.14159;
        public SecretHolder(String s) { this.secret = s; }
    }

    enum EnumSingleton { INSTANCE; }

    static class LazySingleton {
        private static final LazySingleton INSTANCE = new LazySingleton();
        private LazySingleton() { }
        public static LazySingleton getInstance() { return INSTANCE; }
    }
}`
  },
  {
    id: "java-reflection-patterns",
    group: "反射与注解",
    icon: "🎨",
    title: "反射设计模式",
    content: `# 反射设计模式

反射让代码在运行时灵活适配类型与配置，是框架设计的核心工具。常见模式包括反射工厂、依赖注入、ORM 映射、JSON 序列化、配置驱动。

## 反射工厂

根据类名/类型动态创建对象，避免硬编码 if-else：

\`\`\`java
Object create(String className) throws Exception {
    return Class.forName(className).getDeclaredConstructor().newInstance();
}
\`\`\`

注册表 + 反射工厂是 SPI、插件系统的常见结构。

## 依赖注入

容器扫描字段/构造器的 @Autowired，反射注入实例：

\`\`\`java
for (Field f : clazz.getDeclaredFields()) {
    if (f.isAnnotationPresent(Autowired.class)) {
        f.setAccessible(true);
        f.set(instance, container.get(f.getType()));
    }
}
\`\`\`

Spring 的 @Autowired、@Resource 都基于此机制。

## ORM 映射

将数据库行映射到对象：根据 @Column 注解读取字段名，反射设置属性：

\`\`\`java
while (rs.next()) {
    Object entity = clazz.getDeclaredConstructor().newInstance();
    for (Field f : clazz.getDeclaredFields()) {
        Column col = f.getAnnotation(Column.class);
        f.set(entity, rs.getObject(col.name()));
    }
}
\`\`\`

Hibernate、MyBatis 都这么做。

## JSON 序列化

遍历字段，反射读取值并输出为 JSON 字符串：

\`\`\`java
for (Field f : clazz.getDeclaredFields()) {
    f.setAccessible(true);
    json.put(f.getName(), f.get(obj));
}
\`\`\`

Gson、Jackson 内部用反射（也用代码生成提速）。

## 配置驱动

从 properties/yaml 读取类名和方法名，反射加载执行：

\`\`\`java
String handler = props.getProperty("request.handler");
Object obj = Class.forName(handler).getDeclaredConstructor().newInstance();
\`\`\`

实现"配置即行为"，无需改代码即可切换实现。

## 模式权衡

反射模式带来灵活性，但代价：性能开销、编译期检查丢失、重构困难（类名字符串）、错误延迟到运行时。框架会缓存反射元数据、用代理/代码生成缓解性能问题。

## 应用实例

- **Spring**：IoC + AOP 全靠反射
- **MyBatis**：Mapper 接口动态代理 + 反射映射
- **JUnit**：@Test 反射调用测试方法
- **Jackson**：反射序列化/反序列化

下面通过代码演示反射工厂、依赖注入、ORM 映射、JSON 序列化：`,
    code: `// 演示反射设计模式：反射工厂 + 依赖注入 + ORM 映射 + JSON 序列化
import java.lang.annotation.*;
import java.lang.reflect.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        // ===== 1. 反射工厂 =====
        System.out.println("=== 反射工厂 ===");
        Map<String, String> registry = new HashMap<>();
        registry.put("json", "Main$JsonFormatter");
        registry.put("xml", "Main$XmlFormatter");
        Formatter fmt = (Formatter) create(registry.get("json"));
        System.out.println(fmt.format("hello"));
        Formatter fmt2 = (Formatter) create(registry.get("xml"));
        System.out.println(fmt2.format("hello"));

        // ===== 2. 简易依赖注入容器 =====
        System.out.println("\\n=== 依赖注入容器 ===");
        Container container = new Container();
        container.register(UserService.class);
        UserService svc = container.get(UserService.class);
        svc.print();

        // ===== 3. ORM 映射（模拟数据库行映射）=====
        System.out.println("\\n=== ORM 映射 ===");
        Map<String, Object> row = new HashMap<>();
        row.put("id", 1);
        row.put("user_name", "Alice");
        UserEntity entity = mapRow(row, UserEntity.class);
        System.out.println("映射结果: " + entity);

        // ===== 4. 简易 JSON 序列化 =====
        System.out.println("\\n=== JSON 序列化 ===");
        UserEntity u = new UserEntity();
        u.id = 42; u.name = "Bob";
        System.out.println(toJson(u));
    }

    // ===== 反射工厂 =====
    static Object create(String className) throws Exception {
        return Class.forName(className).getDeclaredConstructor().newInstance();
    }

    // ===== 依赖注入容器 =====
    static class Container {
        Map<Class<?>, Object> beans = new HashMap<>();
        void register(Class<?> clazz) throws Exception {
            Object obj = clazz.getDeclaredConstructor().newInstance();
            // 注入字段
            for (Field f : clazz.getDeclaredFields()) {
                if (f.isAnnotationPresent(Inject.class)) {
                    f.setAccessible(true);
                    Object dep = beans.get(f.getType());
                    if (dep == null) {
                        register(f.getType());  // 递归注册依赖
                        dep = beans.get(f.getType());
                    }
                    f.set(obj, dep);
                }
            }
            beans.put(clazz, obj);
        }
        @SuppressWarnings("unchecked")
        <T> T get(Class<T> clazz) { return (T) beans.get(clazz); }
    }

    // ===== ORM 行映射 =====
    static <T> T mapRow(Map<String, Object> row, Class<T> clazz) throws Exception {
        T obj = clazz.getDeclaredConstructor().newInstance();
        for (Field f : clazz.getDeclaredFields()) {
            Column col = f.getAnnotation(Column.class);
            if (col != null) {
                f.setAccessible(true);
                Object val = row.get(col.name());
                if (val != null) f.set(obj, val);
            }
        }
        return obj;
    }

    // ===== 简易 JSON 序列化 =====
    static String toJson(Object obj) throws Exception {
        StringBuilder sb = new StringBuilder("{");
        Field[] fields = obj.getClass().getDeclaredFields();
        for (int i = 0; i < fields.length; i++) {
            fields[i].setAccessible(true);
            sb.append("\\"").append(fields[i].getName()).append("\\": ");
            Object v = fields[i].get(obj);
            if (v instanceof String) sb.append("\\"").append(v).append("\\"");
            else sb.append(v);
            if (i < fields.length - 1) sb.append(", ");
        }
        return sb.append("}").toString();
    }

    // ===== 注解定义 =====
    @Retention(RetentionPolicy.RUNTIME) @Target(ElementType.FIELD)
    @interface Inject { }
    @Retention(RetentionPolicy.RUNTIME) @Target(ElementType.FIELD)
    @interface Column { String name(); }

    // ===== 示例类 =====
    interface Formatter { String format(String s); }
    static class JsonFormatter implements Formatter {
        public String format(String s) { return "{\\"msg\\":\\"" + s + "\\"}"; }
    }
    static class XmlFormatter implements Formatter {
        public String format(String s) { return "<msg>" + s + "</msg>"; }
    }

    static class UserRepository { public String find() { return "user-from-db"; } }
    static class UserService {
        @Inject private UserRepository repo;
        void print() { System.out.println("UserService 调用 repo: " + repo.find()); }
    }

    static class UserEntity {
        @Column(name = "id") public Integer id;
        @Column(name = "user_name") public String name;
        public String toString() { return "UserEntity{id=" + id + ", name='" + name + "'}"; }
    }
}`
  },
  {
    id: "java-lombok-principles",
    group: "反射与注解",
    icon: "🥢",
    title: "Lombok 原理",
    content: `# Lombok 原理

**Lombok** 通过编译期注解处理修改 AST（抽象语法树），自动生成 getter/setter/构造器/equals/hashCode 等样板代码，让 Java 类保持简洁。

## 注解处理器（APT）

Lombok 实现了 \`javax.annotation.processing.Processor\`，在编译期扫描 \`@Data\`、\`@Getter\` 等注解，**直接修改 AST** 注入方法节点：

\`\`\`java
@Data
public class User {
    private String name;
    private int age;
}
\`\`\`

编译后 \`User.class\` 已包含 getter、setter、equals、hashCode、toString、构造器。

## 编译时修改 AST

普通 APT 只能**生成新类**（如 Dagger 生成 Factory），不能修改被注解的类本身。Lombok 利用非公开 API（\`JavacProcessingEnvironment\`、\`JCTree\`）直接修改语法树，是"hack"行为。

这也是 Lombok 受争议的原因：依赖 JDK 内部 API（新 JDK 可能破坏）、IDE 需安装 Lombok 插件、与其他 AST 工具（MapStruct、IDE 检查）可能冲突。

## 常用注解

| 注解 | 生成内容 |
|------|---------|
| \`@Getter / @Setter\` | getter/setter |
| \`@ToString\` | toString |
| \`@EqualsAndHashCode\` | equals + hashCode |
| \`@NoArgsConstructor\` | 无参构造器 |
| \`@RequiredArgsConstructor\` | final 字段构造器 |
| \`@AllArgsConstructor\` | 全参构造器 |
| \`@Data\` | 上述组合（除全参构造器） |
| \`@Builder\` | 链式 Builder |
| \`@Slf4j\` | 日志字段 \`log\` |
| \`@Value\` | 不可变值类 |

## @Builder 示例

\`\`\`java
@Builder
public class User {
    private String name;
    private int age;
}
// 使用
User u = User.builder().name("Alice").age(30).build();
\`\`\`

## 优缺点

**优点**：消除样板代码提升可读性、修改字段自动更新方法、与 IDE 良好集成。
**缺点**：隐式生成代码调试需了解、依赖 JDK 内部 API、团队需统一引入、Java 14+ record 部分替代。

## 替代方案

- **Record**（Java 14+）：不可变数据类，原生语法
- **IDE 生成**：手动生成 getter/setter
- **Kotlin**：data class 原生支持

## Lombok 与 Record 对比

\`record\` 是 Java 16 正式引入的原生语法，自动生成构造器、访问器（\`x()\` 而非 \`getX()\`）、equals、hashCode、toString。相比 Lombok \`@Value\`，record 无需第三方依赖、JVM 原生支持、与模式匹配契合。但 record 是**不可变**的，需可变字段时仍需 Lombok 或手写。两者并非互斥：DTO 用 record，可变实体用 Lombok 是常见组合。

## val 与 var

Lombok 的 \`val\` 声明最终局部变量并自动推断类型（\`val list = new ArrayList<String>();\`）。Java 10+ 引入原生 \`var\`（仅类型推断，非 final），部分替代 \`val\`。两者差异：Lombok \`val\` 是 final，Java \`var\` 不是。

## 团队实践建议

引入 Lombok 需团队达成共识：所有成员 IDE 装插件、构建工具加依赖、CI 环境统一版本。注意 Lombok 与某些 AST 处理器（如 MapStruct 旧版、IDE 静态分析）可能冲突，升级 JDK 时需验证兼容性。新项目优先考虑 record + 手写或 IDE 生成，降低对非公开 API 的依赖。

下面通过代码模拟 Lombok 的效果（手写等价代码）：`,
    code: `// 模拟 Lombok @Data / @Builder / @Slf4j 效果（手写等价代码）
import java.util.Objects;

public class Main {
    public static void main(String[] args) {
        // ===== 使用 @Builder 风格 =====
        User u1 = User.builder().name("Alice").age(30).email("a@x.com").build();
        System.out.println("Builder 创建: " + u1);

        // getter / setter（@Data 生成）
        u1.setAge(31);
        System.out.println("getName: " + u1.getName());
        System.out.println("getAge: " + u1.getAge());

        // toString / equals / hashCode（@Data 生成）
        User u2 = User.builder().name("Alice").age(31).email("a@x.com").build();
        System.out.println("equals: " + u1.equals(u2));
        System.out.println("hashCode 相同: " + (u1.hashCode() == u2.hashCode()));

        // ===== @Slf4j 风格日志 =====
        System.out.println("\\n--- @Slf4j 风格日志 ---");
        UserService svc = new UserService();
        svc.process("订单");

        // ===== 对比 record（Java 16+，原生不可变数据类）=====
        System.out.println("\\n--- record 对比 ---");
        Point p = new Point(3, 4);
        System.out.println("record: " + p);
        System.out.println("record.x: " + p.x());
        System.out.println("record equals: " + p.equals(new Point(3, 4)));
    }

    // ===== 手写 @Data + @Builder + @Slf4j 等价类 =====
    static class User {
        private String name;
        private int age;
        private String email;

        // 私有构造器，通过 Builder 创建
        private User() { }

        // @Getter
        public String getName() { return name; }
        public int getAge() { return age; }
        public String getEmail() { return email; }

        // @Setter
        public void setName(String name) { this.name = name; }
        public void setAge(int age) { this.age = age; }
        public void setEmail(String email) { this.email = email; }

        // @ToString
        public String toString() {
            return "User(name=" + name + ", age=" + age + ", email=" + email + ")";
        }

        // @EqualsAndHashCode
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof User)) return false;
            User u = (User) o;
            return age == u.age
                && Objects.equals(name, u.name)
                && Objects.equals(email, u.email);
        }
        public int hashCode() { return Objects.hash(name, age, email); }

        // @Builder
        public static UserBuilder builder() { return new UserBuilder(); }
        static class UserBuilder {
            private String name; private int age; private String email;
            public UserBuilder name(String n) { this.name = n; return this; }
            public UserBuilder age(int a) { this.age = a; return this; }
            public UserBuilder email(String e) { this.email = e; return this; }
            public User build() {
                User u = new User();
                u.name = name; u.age = age; u.email = email;
                return u;
            }
        }
    }

    // ===== @Slf4j 等价：类内日志字段 =====
    static class UserService {
        // @Slf4j 注入的等价字段（简化版用 System.out）
        private static final java.util.function.Consumer<String> log = msg ->
            System.out.println("[LOG " + System.currentTimeMillis() + "] " + msg);

        void process(String task) {
            log.accept("开始处理: " + task);
            // 业务逻辑
            log.accept("完成: " + task);
        }
    }

    // ===== record（Java 16+）原生替代 Lombok 部分功能 =====
    record Point(int x, int y) { }
}`
  },
  {
    id: "java-spi-mechanism",
    group: "反射与注解",
    icon: "🔌",
    title: "SPI 机制",
    content: `# SPI 机制

**SPI**（Service Provider Interface）是 Java 的服务发现机制，让框架定义接口、由第三方提供实现，运行时按需加载。它实现"接口与实现分离"的解耦。

## ServiceLoader

\`java.util.ServiceLoader\` 是 SPI 核心入口：

\`\`\`java
ServiceLoader<Driver> loaders = ServiceLoader.load(Driver.class);
for (Driver d : loaders) { ... }
\`\`\`

\`ServiceLoader.load\` 通过当前线程的 ClassLoader 加载 \`META-INF/services/接口全限定名\` 文件，逐行读取实现类，反射实例化。

## META-INF/services

约定目录：\`META-INF/services/\`，文件名为接口全限定名，内容为实现类的全限定名（每行一个）：

\`\`\`
META-INF/services/java.sql.Driver
内容：
com.mysql.cj.jdbc.Driver
\`\`\`

## 接口与实现分离

- **API 模块**：定义接口（如 \`java.sql.Driver\`）
- **实现模块**：依赖 API 模块，提供实现，并在 \`META-INF/services\` 注册
- **调用方**：只依赖 API，运行时由 ServiceLoader 找实现

这种分离让调用方无需硬编码实现类，更换实现只需替换 jar。

## JDBC 中的 SPI

\`\`\`java
// 调用方代码不出现具体驱动类名
Connection conn = DriverManager.getConnection("jdbc:mysql://localhost/db", "user", "pwd");
\`\`\`

\`DriverManager\` 初始化时通过 ServiceLoader 加载所有 \`java.sql.Driver\` 实现。引入 mysql-connector jar 即自动注册，无需 \`Class.forName("com.mysql.cj.jdbc.Driver")\`（JDBC 4.0+）。

## SLF4J 中的 SPI

SLF4J 定义日志 API，实际绑定（logback、log4j2、simple）通过 SPI 机制查找 \`org.slf4j.spi.SLF4JServiceProvider\`。引入不同 binding 即切换日志实现，业务代码不变。

## SPI 特点

- **延迟加载**：迭代时才实例化（Lazy）
- **无依赖注入**：实现类需有无参构造器
- **无配置**：仅靠文件约定
- **Java 9 模块**：可用 \`provides ... with ...\` 替代 services 文件

## 与 Spring / Dubbo SPI 区别

- **Java SPI**：一次性加载所有实现，无依赖注入
- **Dubbo SPI**：按 key 加载单个实现，支持 IoC/AOP
- **Spring**：BeanFactory 本身是更强大的 SPI 实现

## ServiceLoader 的迭代器

\`ServiceLoader\` 实现 \`Iterable\`，但**延迟实例化**：每次 \`iterator().next()\` 才反射创建下一个实现。这意味着未迭代的实现不会被加载，可节省启动开销。但若实现初始化失败（构造器抛异常），异常会在迭代时才暴露。可用 \`stream()\`（Java 9+）获取 \`ServiceLoader.Provider\`，先检查类型再实例化，更可控。

## 模块化 SPI

Java 9 模块系统用 \`provides ... with ...\` 替代 services 文件：

\`\`\`java
module my.app {
    requires java.sql;
    provides java.sql.Driver with com.example.MyDriver;
}
\`\`\`

模块描述符中声明，编译器校验实现类存在且实现接口，比纯文本 services 文件更安全。非模块化 jar 仍用 \`META-INF/services\`，两者兼容。

## SPI 的局限

- 无依赖注入：实现需自行获取依赖，无法像 Spring 那样自动装配
- 无配置：无法指定优先级、参数，需额外约定
- 全量加载：无法按需加载单个实现（Dubbo SPI 解决此问题）
- 错误处理弱：实现加载失败仅记录日志，不阻断

下面通过代码演示 SPI 机制：`,
    code: `// 演示 SPI 机制：手写简易 ServiceLoader + 使用标准 ServiceLoader
import java.util.*;
import java.sql.Driver;

public class Main {
    public static void main(String[] args) {
        // ===== 1. 使用标准 ServiceLoader 加载已注册的服务 =====
        System.out.println("=== ServiceLoader 加载 java.sql.Driver ===");
        ServiceLoader<Driver> drivers = ServiceLoader.load(Driver.class);
        int count = 0;
        for (Driver d : drivers) {
            System.out.println("  驱动: " + d.getClass().getName());
            count++;
        }
        System.out.println("共加载 " + count + " 个 Driver 实现（classpath 无驱动则为 0）");

        // ===== 2. 手写简易 SPI 加载器 =====
        System.out.println("\\n=== 手写 SPI 加载器 ===");
        // 模拟 META-INF/services/my.app.Formatter 文件内容
        String servicesContent = "Main$UpperFormatter\\nMain$StarFormatter\\n# 这是一行注释\\nMain$BrokenImpl";
        List<Formatter> formatters = loadServices(Formatter.class, servicesContent);
        String input = "hello spi";
        for (Formatter f : formatters) {
            System.out.println("  " + f.getClass().getSimpleName() + ": " + f.format(input));
        }

        // ===== 3. 接口与实现分离的解耦演示 =====
        System.out.println("\\n=== 解耦调用（调用方只依赖接口）===");
        for (Formatter f : formatters) {
            useFormatter(f, "world");
        }

        // ===== 4. 模拟切换实现（仅换 services 文件内容）=====
        System.out.println("\\n=== 模拟切换实现 ===");
        String onlyUpper = "Main$UpperFormatter";
        List<Formatter> upperOnly = loadServices(Formatter.class, onlyUpper);
        System.out.println("切换后可用实现数: " + upperOnly.size() + " (业务代码不变)");
    }

    // 手写 SPI 加载器：读取服务文件，反射实例化
    @SuppressWarnings("unchecked")
    static <T> List<T> loadServices(Class<T> serviceIfce, String fileContent) {
        List<T> result = new ArrayList<>();
        for (String line : fileContent.split("\\n")) {
            line = line.trim();
            if (line.isEmpty() || line.startsWith("#")) continue;
            try {
                Class<?> impl = Class.forName(line);
                if (serviceIfce.isAssignableFrom(impl)) {
                    result.add((T) impl.getDeclaredConstructor().newInstance());
                    System.out.println("  [加载成功] " + line);
                } else {
                    System.out.println("  [非接口实现] " + line);
                }
            } catch (Exception e) {
                System.out.println("  [加载失败] " + line + " - " + e.getClass().getSimpleName());
            }
        }
        return result;
    }

    // 调用方只依赖接口
    static void useFormatter(Formatter f, String s) {
        System.out.println("  调用结果: " + f.format(s));
    }

    // ===== SPI 接口 =====
    interface Formatter { String format(String s); }

    // ===== SPI 实现类（实际需在 META-INF/services 中注册）=====
    static class UpperFormatter implements Formatter {
        public String format(String s) { return s.toUpperCase(); }
    }
    static class StarFormatter implements Formatter {
        public String format(String s) { return "*** " + s + " ***"; }
    }
}`
  },
  {
    id: "java-proxy-patterns",
    group: "反射与注解",
    icon: "🕵️",
    title: "代理模式对比",
    content: `# 代理模式对比

代理模式为目标对象提供代理，控制访问、增强功能。Java 实现代理有三种主流方式：静态代理、JDK 动态代理、CGLib。

## 静态代理

手动编写代理类，实现与目标相同的接口：

\`\`\`java
class UserServiceProxy implements UserService {
    private UserService target;
    public void save(User u) {
        log("before");
        target.save(u);
        log("after");
    }
}
\`\`\`

优点：简单、无运行时开销。缺点：接口每加一个方法，代理类都要改；接口多时代码爆炸。

## JDK 动态代理

运行时生成实现指定接口的代理类：

\`\`\`java
UserService proxy = (UserService) Proxy.newProxyInstance(
    loader, new Class[]{UserService.class}, handler);
\`\`\`

优点：一个 handler 可代理任意接口；缺点：**只能代理接口**，目标类必须实现接口。

## CGLib 简介

通过**生成子类**实现代理，无需接口：

\`\`\`java
Enhancer e = new Enhancer();
e.setSuperclass(UserService.class);
e.setCallback(methodInterceptor);
UserService proxy = (UserService) e.create();
\`\`\`

CGLib 用 ASM 生成字节码，性能优秀。Spring AOP 对类默认用 CGLib。限制：final 类、private 方法无法代理。

## 三者对比

| 维度 | 静态代理 | JDK 动态代理 | CGLib |
|------|---------|------------|-------|
| 实现方式 | 手写 | 运行时生成接口实现 | 运行时生成子类 |
| 是否需接口 | 需 | 需 | 不需 |
| 性能 | 最快 | 中 | 接近直接调用 |
| 灵活性 | 低 | 高 | 高 |
| 依赖 | 无 | JDK 自带 | 第三方库 |
| final 限制 | 无 | 无 | final 类/方法不可代理 |

## 应用场景

- **AOP**：Spring AOP（事务、日志、权限）
- **RPC**：远程调用本地存根（Dubbo、Feign）
- **ORM**：懒加载（Hibernate 关联对象代理）
- **缓存**：方法结果缓存
- **权限**：方法级权限校验
- **MyBatis**：Mapper 接口动态代理

## 代理模式本质

代理在"调用方"与"目标"之间插入一层，对调用方透明地完成增强。这是面向切面编程（AOP）的实现基础。

## 代理的选择策略

实际项目按场景选型：**Spring AOP** 默认 CGLib（接口存在时也用，避免代理类型转换问题）；**MyBatis Mapper** 用 JDK 动态代理（Mapper 是接口，无实现类）；**Dubbo/Feign** 用 JDK 动态代理生成远程存根；**Hibernate 懒加载** 用 CGLib 或 Javassist 代理实体子类。原则：目标有接口且需轻量代理用 JDK，目标无接口或需拦截 protected/包级方法用 CGLib。

## Javassist 与 ByteBuddy

除 CGLib 外，\`Javassist\` 和 \`ByteBuddy\` 是更现代的字节码增强库。Javassist 提供类 Java 源码的 API，学习成本低；ByteBuddy（CGLib 作者新作）API 流畅、性能好，Spring Framework 6 已切换到 ByteBuddy。它们都能在运行时生成代理类，比 CGLib 更灵活。

## 代理的坑

- **自调用失效**：目标类内部 \`this.method()\` 不经过代理，AOP 增强（如事务）失效。解决：通过代理对象调用（注入自身代理）或用 AopContext.currentProxy()。
- **final 方法**：CGLib 无法代理 final 方法（静默跳过增强），JDK 代理的 final 方法同理。
- **equals/hashCode**：代理对象的 equals 比较需特殊处理，否则比较的是代理而非目标。
- **序列化**：代理对象默认不可序列化，需实现 Serializable 或用 Spring 的 SerializableProxy。

下面通过代码演示静态代理与 JDK 动态代理：`,
    code: `// 演示静态代理与 JDK 动态代理
import java.lang.reflect.*;
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        // ===== 1. 静态代理 =====
        System.out.println("=== 静态代理 ===");
        UserService real = new UserServiceImpl();
        UserService staticProxy = new StaticUserServiceProxy(real);
        staticProxy.save("Alice");
        staticProxy.delete(1);

        // ===== 2. JDK 动态代理 =====
        System.out.println("\\n=== JDK 动态代理 ===");
        UserService dynamicProxy = (UserService) Proxy.newProxyInstance(
            Main.class.getClassLoader(),
            new Class[]{UserService.class},
            new GenericHandler(real)
        );
        dynamicProxy.save("Bob");
        dynamicProxy.delete(2);
        System.out.println("代理类: " + dynamicProxy.getClass().getName());

        // ===== 3. 同一 handler 代理不同接口 =====
        System.out.println("\\n=== 一个 handler 代理多接口 ===");
        OrderService orderProxy = (OrderService) Proxy.newProxyInstance(
            Main.class.getClassLoader(),
            new Class[]{OrderService.class},
            new GenericHandler(new OrderServiceImpl())
        );
        orderProxy.create("order-001");

        // ===== 4. 代理类信息 =====
        System.out.println("\\n=== 代理类分析 ===");
        System.out.println("是 Proxy 子类: " + Proxy.isProxyClass(dynamicProxy.getClass()));
        Class<?>[] ifaces = dynamicProxy.getClass().getInterfaces();
        System.out.println("代理实现的接口: " + Arrays.toString(ifaces));
        System.out.println("代理父类: " + dynamicProxy.getClass().getSuperclass().getName());

        // ===== 5. 总结 =====
        System.out.println("\\n=== 总结 ===");
        System.out.println("静态代理: 每个方法手写转发，接口变化需改代理类");
        System.out.println("动态代理: 一个 handler 处理所有方法，接口变化无需改");
        System.out.println("CGLib: 通过生成子类代理类（无接口），需第三方库");
    }

    // ===== 接口 =====
    interface UserService {
        void save(String name);
        void delete(int id);
    }
    interface OrderService {
        void create(String orderId);
    }

    // ===== 真实实现 =====
    static class UserServiceImpl implements UserService {
        public void save(String name) { System.out.println("  保存用户: " + name); }
        public void delete(int id) { System.out.println("  删除用户: " + id); }
    }
    static class OrderServiceImpl implements OrderService {
        public void create(String orderId) { System.out.println("  创建订单: " + orderId); }
    }

    // ===== 静态代理（手写转发）=====
    static class StaticUserServiceProxy implements UserService {
        private final UserService target;
        StaticUserServiceProxy(UserService t) { this.target = t; }
        public void save(String name) {
            System.out.println("[静态] before save");
            target.save(name);
            System.out.println("[静态] after save");
        }
        public void delete(int id) {
            System.out.println("[静态] before delete");
            target.delete(id);
            System.out.println("[静态] after delete");
        }
    }

    // ===== 动态代理通用 handler =====
    static class GenericHandler implements InvocationHandler {
        private final Object target;
        GenericHandler(Object t) { this.target = t; }
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            System.out.println("[动态] before " + method.getName());
            long start = System.nanoTime();
            try {
                Object result = method.invoke(target, args);
                System.out.println("[动态] after " + method.getName() + " (用时 "
                    + (System.nanoTime() - start) / 1000 + " μs)");
                return result;
            } catch (InvocationTargetException e) {
                System.out.println("[动态] 异常 " + method.getName() + ": " + e.getCause());
                throw e.getCause();
            }
        }
    }
}`
  }
];
