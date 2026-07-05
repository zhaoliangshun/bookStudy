// =============================================================
// Python vs Java 语言对比教程 —— 第 2 批章节（类型系统与面向对象组，共 5 章）
// -------------------------------------------------------------
// 风格：纯阅读型教程（无代码编辑器），代码示例在 Markdown 代码块中展示。
// 转义规则：反引号写作 \`，\${ 写作 \$\{，代码围栏 \`\`\` 同样转义。
// 章节编号：第 6 ~ 10 章。
// =============================================================

export const chapters = [
  // ============================================================
  // 第 6 章：类型系统：动态 vs 静态
  // ============================================================
  {
    id: "pyjava-type-system",
    icon: "🏷️",
    group: "类型系统与面向对象",
    title: "类型系统：动态 vs 静态",
    content: `## 第6章：类型系统：动态 vs 静态

### 一、从一段同样的赋值说起

先看两段几乎一模一样的代码。Python：

\`\`\`python
x = 10          # x 现在是整数
print(type(x))  # <class 'int'>
x = "hello"     # 同一个 x，现在装字符串
print(type(x))  # <class 'str'>
\`\`\`

Java：

\`\`\`java
int x = 10;         // x 只能装 int
// x = "hello";     // 编译就报错：类型不匹配
String y = "hello"; // 想装字符串，必须另起一个变量
\`\`\`

同样是 \`x\`，在 Python 里可以一会儿装整数、一会儿装字符串；在 Java 里 \`int x\` 一旦声明就一辈子只能装整数。这背后是两套截然不同的类型系统：**Python 是动态类型，Java 是静态类型**。

### 二、动态类型：变量是"标签"

Python 的变量没有类型，**类型属于对象，不属于变量**。变量更像是一张"便利贴"，贴在哪个对象上，就代表哪个对象。你可以随时把这张便利贴撕下来，贴到另一个完全不同类型的对象上。

\`\`\`python
def process(value):
    print(value)        # 不关心 value 是什么类型，只要能 print

process(42)             # 传整数
process("hi")           # 传字符串
process([1, 2, 3])      # 传列表
\`\`\`

上面这个 \`process\` 函数没有任何类型声明，它对传入的对象只有一个要求：能被 \`print\` 出来。这种"不查身份证、只看能不能干活"的方式，就是 Python 动态类型的核心便利。

**动态类型的便利**：

- 写起来快，不用提前规划每个变量的类型；
- 同一个函数能处理多种类型，天然泛型；
- 改代码时不用到处改类型声明，重构灵活。

**动态类型的风险**：

- 类型错误要等到**运行时**才暴露——一段处理订单的函数被传进一个用户对象，只要不触发具体属性访问，就永远不报错；
- 大型项目里，没有类型提示时，光看函数签名根本不知道该传什么；
- 重命名一个字段后，IDE 不一定能帮你找到所有引用，容易漏改。

### 三、静态类型：变量是"容器"

Java 走的是另一条路：**每个变量在声明时必须确定类型，且终身不变**。变量像是一个"贴了标签的容器"，只能装对应类型的东西。编译器在编译阶段就会检查所有类型是否匹配，类型错误根本活不到运行时。

\`\`\`java
int age = 18;
String name = "Alice";
List<String> names = new ArrayList<>();
names.add("Bob");
// names.add(123);  // 编译报错：不能把 Integer 放进 List<String>
\`\`\`

**静态类型的安全**：

- 类型错误在编译期被发现，提前消除一大类 bug；
- IDE 能精准补全：敲下 \`name.\` 就知道有 \`length()\`、\`charAt()\` 等方法；
- 重构时编译器帮你校验所有调用点，改名不会漏；
- 性能更好：编译器知道确切类型，可以直接生成优化的机器码。

**静态类型的代价**：

- 声明冗长，\`Map<String, List<Integer>> map = new HashMap<>();\` 这种写法对新手不友好；
- 灵活性低，想写一个"既能处理整数又能处理字符串"的函数，得用泛型或接口绕一圈；
- 改类型时牵一发动全身，所有相关声明都要跟着改。

### 四、强类型 vs 弱类型：别搞混了

很多人会把"动态/静态"和"强/弱"混在一起，其实它们是两个独立维度：

- **动态/静态**：类型在什么时候检查（运行时 vs 编译时）。
- **强/弱**：类型检查有多严格，会不会偷偷做隐式转换。

**Python 和 Java 都是强类型语言**。它们都不会把字符串偷偷转成数字再相加：

\`\`\`python
# Python（强类型）
"3" + 5      # TypeError: can only concatenate str to str
\`\`\`

\`\`\`java
// Java（强类型）
String s = "3";
int n = 5;
// int r = s + n;   // 编译错误：String 不能和 int 相加
String r = s + n;   // 这是字符串拼接，结果 "35"，不是数学加法
\`\`\`

作为对比，JavaScript 是弱类型：\`"3" + 5\` 得到 \`"35"\`，而 \`"3" - 5\` 却得到 \`-2\`（偷偷把字符串转成数字）。Python 和 Java 都不会干这种"看心情转换"的事。

### 五、类型推断：两边都在往中间靠

有趣的是，两个阵营都在向对方靠拢：Python 加入了类型提示（type hints），Java 加入了 \`var\` 关键字。

**Python 的类型提示（type hints）**：

\`\`\`python
def greet(name: str, times: int = 1) -> str:
    return ("Hello, " + name + "! ") * times

age: int = 18
names: list[str] = ["Alice", "Bob"]
\`\`\`

注意：**类型提示只是"注释"，Python 解释器运行时并不检查**。你写 \`age: int = 18\`，然后 \`age = "hi"\`，运行时照样不报错。真正检查的是第三方工具，比如 \`mypy\`、\`pyright\`。这是一种**渐进式类型系统（gradual typing）**——你想加类型就加，不想加就不加，新老代码可以混着来。

**Java 的 var 关键字**（Java 10+）：

\`\`\`java
var age = 18;                              // 推断为 int
var names = new ArrayList<String>();       // 推断为 ArrayList<String>
var map = new HashMap<String, List<Integer>>();  // 省去重复写两遍泛型
\`\`\`

但 \`var\` 有局限：

- 只能用于**局部变量**，不能用于字段、方法参数、返回值；
- 必须有初始化值（\`var x;\` 不行，编译器无从推断）；
- 推断出的类型是"实现类型"，比如 \`var list = new ArrayList<String>();\` 得到的是 \`ArrayList\` 而不是 \`List\`，可能不是你想要的。

两边的思路殊途同归：**在保留各自核心哲学的前提下，减少冗余、增加可读性**。

### 六、鸭子类型 vs 接口

动态类型衍生出一种特有的编程风格——**鸭子类型（duck typing）**："如果它走起来像鸭子、叫起来像鸭子，那它就是鸭子。"Python 不关心对象"是什么类型"，只关心它"有哪些方法"。

\`\`\`python
class Duck:
    def quack(self): print("嘎嘎")

class Person:
    def quack(self): print("我学鸭子叫")

def make_sound(thing):
    thing.quack()   # 不检查类型，只要有 quack 方法就行

make_sound(Duck())    # 嘎嘎
make_sound(Person())  # 我学鸭子叫
\`\`\`

Java 不能这样。它要求**事先声明契约**——也就是接口。调用方必须明确参数实现某个接口：

\`\`\`java
interface Quackable {
    void quack();
}

class Duck implements Quackable {
    public void quack() { System.out.println("嘎嘎"); }
}

class Person implements Quackable {
    public void quack() { System.out.println("我学鸭子叫"); }
}

class Main {
    static void makeSound(Quackable thing) {  // 必须声明类型
        thing.quack();
    }
}
\`\`\`

鸭子类型灵活但不安全（运行时才报 \`AttributeError\`）；接口啰嗦但安全（编译期就能发现没实现契约）。后面在"协议"一章我们会看到，Python 用 \`typing.Protocol\` 把鸭子类型和静态检查结合了起来。

### 七、类型检查工具：mypy vs javac

Python 的类型检查不在语言运行时，而是交给外部工具：

\`\`\`bash
# 安装并运行 mypy
pip install mypy
mypy my_script.py
\`\`\`

\`\`\`python
# mypy 会指出这里的错误
def add(a: int, b: int) -> int:
    return a + b

add(1, 2)        # OK
add(1, "2")      # mypy 报错：Argument 2 has incompatible type "str"
\`\`\`

Java 的类型检查由编译器 \`javac\` 在编译时一步完成，不需要额外工具：

\`\`\`bash
javac Main.java   # 编译时就会报类型错误
\`\`\`

一句话总结两者的差异：

| 维度 | Python（动态） | Java（静态） |
| --- | --- | --- |
| 类型检查时机 | 运行时（可选：mypy 编译前） | 编译时（强制） |
| 变量本质 | 标签，可重新指向任意对象 | 容器，类型固定 |
| 类型声明 | 可选（type hints） | 强制 |
| 灵活性 | 高，鸭子类型 | 低，需接口/泛型 |
| 安全性 | 运行时才发现错误 | 编译时即发现 |
| IDE 支持 | 弱（无 hints 时）/ 强（有 hints） | 强 |
| 重构 | 难（运行时才知影响面） | 易（编译器帮忙校验） |

### 八、选型建议

- **脚本、原型、数据处理、小型工具**：动态类型（Python）的灵活性能极大提升效率，类型错误在小项目里成本可控。
- **大型系统、团队协作、长期维护**：静态类型（Java）的编译期检查和 IDE 重构支持，能在项目变大后显著降低维护成本。
- **折中方案**：Python 项目在中后期引入 type hints + mypy，既有动态的灵活，又有静态的安全——这正是渐进式类型的价值。

类型系统没有绝对优劣，关键是**匹配项目规模和团队成熟度**。理解两者的取舍，你才能在不同场景下做出合理选择。

## 小结

- **动态类型**：变量是标签，类型属于对象，运行时检查，灵活但有风险。
- **静态类型**：变量是容器，类型在声明时确定，编译时检查，安全但冗长。
- **强/弱**与**动/静**是两个维度，Python 和 Java 都是强类型。
- **类型推断**：Python 有 type hints（渐进式），Java 有 var（局部变量）。
- **鸭子类型 vs 接口**：Python 看行为，Java 看契约。
- **工具链**：Python 用 mypy 做可选检查，Java 用 javac 强制检查。

## 常见疑问 Q&A

**Q1：Python 加了 type hints 是不是就变成静态类型语言了？**
不是。type hints 只是"给人和工具看的注释"，Python 解释器运行时仍然不检查。是否执行检查取决于你是否运行 mypy。它是渐进式类型系统，保留动态本质的同时增加可选的静态检查能力。

**Q2：Java 的 var 会不会让 Java 变成动态类型？**
不会。var 只是"让编译器帮你推断类型"，推断完后类型仍然是确定的、静态的。\`var x = 10;\` 编译后就等价于 \`int x = 10;\`，后续 \`x = "hi"\` 依然编译报错。

**Q3：那为什么 Java 不干脆全部用 var？**
var 牺牲了"看声明就知道类型"的可读性。在字段、参数、返回值这些跨文件被引用的位置，明确写出类型对阅读者更友好。局部变量作用域小，推断出来的类型一眼能看到，所以才放开使用。

**Q4：鸭子类型和 Protocol 有什么区别？**
鸭子类型是运行时行为——只要有方法就能调用，错了运行时报错。Protocol 是静态检查工具——你声明"参数需要有这些方法"，mypy 会在编译前检查传入对象是否满足，但运行时不强制。Protocol 让鸭子类型获得了静态安全。`,
  },

  // ============================================================
  // 第 7 章：类与对象
  // ============================================================
  {
    id: "pyjava-class",
    icon: "📦",
    group: "类型系统与面向对象",
    title: "类与对象",
    content: `## 第7章：类与对象

### 一、从"造一只猫"看两边的写法

假设我们要建模一只猫：有名字、会叫。先看 Python：

\`\`\`python
class Cat:
    def __init__(self, name):
        self.name = name       # 实例属性，在构造方法里动态绑定

    def meow(self):
        print(f"{self.name}: 喵~")

c = Cat("小花")
c.meow()   # 小花: 喵~
\`\`\`

再看 Java：

\`\`\`java
public class Cat {
    private String name;       // 字段，必须在类里先声明

    public Cat(String name) {  // 构造方法，与类同名
        this.name = name;
    }

    public void meow() {
        System.out.println(name + ": 喵~");
    }
}

Cat c = new Cat("小花");
c.meow();
\`\`\`

两段代码做的事一样，但细节差异很多。下面逐一拆解。

### 二、类定义语法对比

| 方面 | Python | Java |
| --- | --- | --- |
| 关键字 | \`class Cat:\` | \`class Cat { ... }\` |
| 类体分隔 | 缩进 | 大括号 \`{}\` |
| 文件命名 | 任意，一个文件可多个类 | 一个 public 类必须独占同名 .java 文件 |
| 语句结尾 | 无分号 | 分号 \`;\` |
| 默认父类 | \`object\` | \`java.lang.Object\` |

Java 对文件结构有强约束：一个 \`.java\` 文件里只能有一个 \`public\` 类，且文件名必须和这个 public 类名一致。Python 没有这种限制，一个 \`.py\` 文件里可以放任意多个类，文件名也随意。这反映了 Java 的"严格组织"和 Python 的"灵活组织"两种哲学。

### 三、构造方法：\`__init__\` vs 同名方法

构造方法是"创建对象时自动调用的初始化逻辑"。Python 用魔法方法 \`__init__\`，Java 用与类同名的方法。

\`\`\`python
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age
\`\`\`

\`\`\`java
public class Dog {
    private String name;
    private int age;

    public Dog(String name, int age) {
        this.name = name;
        this.age = age;
    }
}
\`\`\`

几个关键差异：

1. **Python 的 \`__init__\` 不是真正的"构造器"**。真正创建对象的是 \`__new__\`，\`__init__\` 只是初始化。绝大多数情况下你只重写 \`__init__\`，对象已经由默认 \`__new__\` 创建好了。Java 的构造方法是真正"分配内存 + 初始化"一体的。
2. **Java 支持构造器重载**：可以定义多个参数不同的构造器。
3. **Python 没有重载**，但可以用默认参数、\`*args\`、\`**kwargs\` 达到类似效果。

\`\`\`java
// Java 构造器重载
public class Dog {
    public Dog(String name) { this(name, 0); }
    public Dog(String name, int age) { /* ... */ }
}
\`\`\`

\`\`\`python
# Python 用默认参数模拟
class Dog:
    def __init__(self, name, age=0):
        self.name = name
        self.age = age
\`\`\`

### 四、属性：动态绑定 vs 字段声明

这是两边**最根本**的差异之一。

**Java 字段必须在类里先声明**，每个对象能有哪些字段是编译时就定死的：

\`\`\`java
public class Person {
    private String name;   // 必须先声明
    private int age;
}
// 运行时不能给 Person 对象凭空加一个新字段
\`\`\`

**Python 的实例属性是动态绑定的**——在 \`__init__\` 里 \`self.xxx = ...\` 才真正创建属性，甚至可以在运行时给某个对象临时加属性：

\`\`\`python
class Person:
    def __init__(self, name):
        self.name = name

p = Person("Alice")
p.age = 18              # 给这个对象临时加 age 属性
print(p.age)            # 18

# 另一个对象没有 age
p2 = Person("Bob")
# print(p2.age)         # AttributeError: 'Person' object has no attribute 'age'
\`\`\`

这种动态性是 Python 灵活的根源，也是 Java 程序员初学 Python 时最不习惯的地方。它意味着**同一个类的不同对象，可能拥有不同的属性集合**。这在 Java 里完全不可能。

如果想限制 Python 对象只能有规定的属性，可以用 \`__slots__\`：

\`\`\`python
class Person:
    __slots__ = ('name', 'age')   # 只允许这两个属性
    def __init__(self, name, age):
        self.name = name
        self.age = age

p = Person("Alice", 18)
# p.email = "a@b.com"   # AttributeError
\`\`\`

\`__slots__\` 还有个副作用：节省内存、提升属性访问速度，因为它不再用字典存属性，而是用固定位置的数组。

### 五、@property vs getter/setter

Java 的标准做法是"字段私有 + getter/setter 公开"：

\`\`\`java
public class Account {
    private double balance;

    public double getBalance() { return balance; }
    public void setBalance(double b) {
        if (b < 0) throw new IllegalArgumentException("余额不能为负");
        this.balance = b;
    }
}
// 使用：acc.getBalance() / acc.setBalance(100)
\`\`\`

Python 推荐用 \`@property\` 装饰器，让"读属性"和"调方法"看起来一样自然：

\`\`\`python
class Account:
    def __init__(self):
        self._balance = 0

    @property
    def balance(self):
        return self._balance

    @balance.setter
    def balance(self, value):
        if value < 0:
            raise ValueError("余额不能为负")
        self._balance = value

# 使用：像字段一样访问
acc = Account()
acc.balance = 100        # 自动调用 setter，校验
print(acc.balance)       # 100
\`\`\`

\`@property\` 的好处是：**你可以在不改变调用方式的前提下，把一个"直接字段"升级成"带逻辑的属性"**。一开始你写 \`acc.balance\` 直接访问，后来发现需要校验，加上 \`@property\` 即可，调用方代码一行都不用改。Java 就没这么幸运——一旦字段被外部直接访问，想加校验就得改成 getter/setter，所有调用点都要跟着改。

这也是 Python 社区"宁可直接用公共属性，也不要无逻辑的 getter/setter"的原因——需要时再加 \`@property\` 即可。

### 六、self vs this：为什么 Python 要显式写 self

这是新手最常问的问题。Python 的每个实例方法第一个参数必须是 \`self\`，调用时却不用传：

\`\`\`python
class Cat:
    def meow(self):          # 定义时有 self
        print(self.name)

c = Cat("小花")
c.meow()                    # 调用时不用传 self，Python 自动把 c 作为 self
\`\`\`

Java 的 \`this\` 是隐式的，方法签名里不写，需要时直接用：

\`\`\`java
public class Cat {
    void meow() {            // 没有 this 参数
        System.out.println(this.name);
    }
}
\`\`\

为什么 Python 要"多此一举"写 \`self\`？这背后有深刻的哲学原因：

1. **"显式优于隐式"**（The Zen of Python）。Python 认为"这个方法是实例方法"这件事应该在签名上看得见，而不是靠一个隐藏的 \`this\`。
2. **方法本质是类属性中的一个函数**。\`c.meow()\` 实际上等价于 \`Cat.meow(c)\`——把实例作为第一个参数传给函数。显式的 \`self\` 让这个等价关系清晰可见。
3. **静态方法和类方法统一**。Python 用参数区分：第一个参数是实例（\`self\`）是实例方法，是类（\`cls\`）是类方法，都没有是静态方法。Java 用不同关键字区分。

\`\`\`python
class Foo:
    @staticmethod
    def static_method():        # 无 self/cls
        print("静态方法")

    @classmethod
    def class_method(cls):      # cls 是类本身
        print(f"类方法，cls={cls}")

    def instance_method(self):  # self 是实例
        print("实例方法")
\`\`\`

### 七、访问控制：约定 vs 关键字

Java 用关键字强制访问控制：

| 修饰符 | 同类 | 同包 | 子类 | 其他 |
| --- | --- | --- | --- | --- |
| \`public\` | ✓ | ✓ | ✓ | ✓ |
| \`protected\` | ✓ | ✓ | ✓ | ✗ |
| 默认（包级） | ✓ | ✓ | ✗ | ✗ |
| \`private\` | ✓ | ✗ | ✗ | ✗ |

\`\`\`java
public class User {
    private String password;     // 外部完全不可见
    protected int id;            // 子类和同包可见
    public String name;          // 完全公开
}
\`\`\`

Python **没有强制的访问控制**，靠命名约定：

- \`name\`：公共，可随意访问。
- \`_name\`：受保护，**约定**外部不直接访问（但技术上能访问）。
- \`__name\`：私有，解释器会做"名称改写"（name mangling），变成 \`_ClassName__name\`，从外部按原名访问会失败。

\`\`\`python
class User:
    def __init__(self):
        self.name = "Alice"        # 公共
        self._id = 1               # 约定受保护
        self.__password = "123"    # 名称改写

u = User()
print(u.name)            # Alice
print(u._id)             # 1（能访问，但不推荐）
# print(u.__password)    # AttributeError
print(u._User__password) # 123（绕过改写也能访问）
\`\`\`

Python 的理念是 **"我们都是成年人"（we are all consenting adults）**——既然你能拿到源码，强制禁止访问没意义，不如用约定提醒，需要时你自己负责。这和 Java 的"法律约束"形成鲜明对比。

### 八、静态成员

\`\`\`java
public class Counter {
    private static int total = 0;     // 静态字段，所有实例共享

    public Counter() { total++; }

    public static int getTotal() { return total; }   // 静态方法
}
// 调用：Counter.getTotal()，不依赖任何实例
\`\`\`

\`\`\`python
class Counter:
    total = 0                # 类属性，所有实例共享

    def __init__(self):
        Counter.total += 1

    @staticmethod
    def get_total():         # 静态方法
        return Counter.total

    @classmethod
    def get_total_cls(cls):  # 类方法
        return cls.total
\`\`\`

注意 Python 里有个经典陷阱：**实例属性会"遮蔽"同名类属性**。

\`\`\`python
class Foo:
    x = 10            # 类属性

f = Foo()
print(f.x)           # 10（找不到实例属性，回退到类属性）
f.x = 20             # 给实例动态加了 x 属性，遮蔽了类属性
print(f.x)           # 20
print(Foo.x)         # 10（类属性没变）
\`\`\`

\`f.x = 20\` 不是改类属性，而是给 \`f\` 这个对象新加了一个实例属性 \`x\`。这一点初学者很容易搞混。

### 九、方法绑定差异

Python 的方法绑定机制和 Java 不同，带来一个奇特现象——**实例方法可以从对象上"拆下来"当函数用**：

\`\`\`python
class Greeter:
    def __init__(self, name):
        self.name = name
    def hello(self):
        return f"Hi, {self.name}"

g = Greeter("Alice")
hi = g.hello        # 拆出方法，绑定到 g
print(hi())         # Hi, Alice

# 类本身也能拿到未绑定的函数
print(Greeter.hello(g))   # Hi, Alice（手动传 g 作为 self）
\`\`\`

Java 没有这种"拆方法"的概念，方法总是依附于对象或类，不能作为一等值传递（要传递得用函数式接口或方法引用 \`Greeter::hello\`）。

这种差异源于底层实现：Python 方法本质是"描述符"，访问 \`g.hello\` 时会自动把 \`g\` 绑定成第一个参数；Java 方法在 JVM 里是一段字节码，没有"未绑定函数"这种东西。

## 小结

- **类定义**：Python 缩进 + 任意文件，Java 大括号 + 文件名严格对应 public 类。
- **构造方法**：Python \`__init__\`（只初始化），Java 同名构造器（创建+初始化），Java 支持重载。
- **属性**：Python 动态绑定，可临时加属性；Java 字段必须先声明，固定不变。
- **@property vs getter/setter**：Python 用装饰器让访问像字段，Java 用方法封装字段。
- **self vs this**：Python 显式 \`self\`（哲学：显式优于隐式），Java 隐式 \`this\`。
- **访问控制**：Python 命名约定（\`_\`、\`__\`），Java 关键字强制（\`public/private/protected\`）。
- **静态成员**：Python 用类属性 + \`@staticmethod/@classmethod\`，Java 用 \`static\` 关键字。
- **方法绑定**：Python 方法可拆出当函数，Java 方法依附对象。

## 常见疑问 Q&A

**Q1：Python 为什么不像 Java 那样强制 private？**
Python 信奉"我们都是成年人"——既然能拿到源码，禁止访问没意义。强制 private 反而会让调试、mock、扩展都变困难。命名约定 \`_\` 已经足够提醒"这是内部实现，请勿依赖"。

**Q2：Java 的 getter/setter 真的有必要吗？很多 IDE 自动生成的都是无逻辑的。**
如果 getter/setter 没有任何逻辑，那确实是冗余的样板代码。Java 社区也在反思这个问题，Lombok 等工具就是为减少这种样板而生。但一旦未来需要加校验、日志、缓存，已有的 getter/setter 能直接扩展而调用方无感——这是它真正的价值。

**Q3：\`__slots__\` 应该普遍使用吗？**
不建议普遍用。它牺牲了动态性（不能加新属性、影响某些序列化、有继承限制），只换来内存和速度的小幅提升。只在"创建海量同类对象"（比如百万级数据点）这种内存敏感场景才值得用。

**Q4：Python 的 \`self\` 能改名吗？**
技术上能改成任意名字（比如 \`this\`、\`me\`），但**强烈不建议**。社区约定就是 \`self\`，改名会让别人读你的代码非常难受。这就是 Python 的"一种明显正确的方式"哲学。`,
  },

  // ============================================================
  // 第 8 章：继承与多态
  // ============================================================
  {
    id: "pyjava-inheritance",
    icon: "🔄",
    group: "类型系统与面向对象",
    title: "继承与多态",
    content: `## 第8章：继承与多态

### 一、继承的基本语法

继承是面向对象的核心机制——子类复用父类的字段和方法，并可以扩展或修改。先看两边的写法。

Python：

\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} 发出声音"

class Dog(Animal):           # Dog 继承 Animal
    def speak(self):         # 重写父类方法
        return f"{self.name}: 汪汪"

d = Dog("旺财")
print(d.speak())             # 旺财: 汪汪
\`\`\`

Java：

\`\`\`java
public class Animal {
    protected String name;
    public Animal(String name) { this.name = name; }
    public String speak() { return name + " 发出声音"; }
}

public class Dog extends Animal {       // Dog 继承 Animal
    public Dog(String name) { super(name); }   // 调用父类构造器
    @Override
    public String speak() {              // 重写父类方法
        return name + ": 汪汪";
    }
}
\`\`\`

几个一眼可见的差异：

- Python 用 \`class Dog(Animal):\`，Java 用 \`class Dog extends Animal\`。
- Python 子类构造器**必须显式调用** \`super().__init__(...)\`（否则父类初始化不会执行）；Java 子类构造器**必须**用 \`super(...)\` 调用父类构造器，且必须是构造器第一行。
- Java 用 \`@Override\` 注解标识重写（可选但推荐，编译器会校验），Python 没有这种校验。

### 二、单继承：两边都是单继承

很多人以为 Java 支持多继承，其实**Java 的类同样是单继承**——一个类只能 extends 一个父类。要实现"多继承"的效果，Java 靠接口：

\`\`\`java
class Dog extends Animal implements Runnable, Comparable<Dog> {
    // 继承一个类 + 实现多个接口
}
\`\`\`

Python 也支持类似的设计——单继承 + mixin：

\`\`\`python
class Dog(Animal, RunnableMixin, ComparableMixin):
    # 单继承 Animal，再混入多个 mixin
    pass
\`\`\

但 Python 更进一步：**它真的允许多继承**。一个类可以有多个父类，这是和 Java 最大的区别。后面会详细讲。

### 三、super() 调用对比

super 用于在子类中调用父类的方法。两边写法不同：

\`\`\`python
class Base:
    def __init__(self, x):
        self.x = x

class Derived(Base):
    def __init__(self, x, y):
        super().__init__(x)    # 调用父类构造器
        self.y = y
\`\`\`

\`\`\`java
public class Base {
    protected int x;
    public Base(int x) { this.x = x; }
}

public class Derived extends Base {
    private int y;
    public Derived(int x, int y) {
        super(x);              // 必须第一行
        this.y = y;
    }
}
\`\`\

Java 的 \`super\` 是一个关键字，调用 \`super.method()\` 直接定位到**直接父类**的方法。Python 的 \`super()\` 是个函数，它的行为**比看起来复杂得多**——在多继承里，它不一定调用"直接父类"，而是按 MRO（方法解析顺序）调用下一个类。这点稍后详述。

### 四、方法重写

Java 用 \`@Override\` 注解明确标识"我要重写父类方法"，编译器会校验：如果父类没有这个方法，编译报错。这能避免"你以为重写了，其实拼错了名字"的低级错误。

\`\`\`java
class Animal {
    public void speak() {}
}
class Dog extends Animal {
    @Override
    public void speak() {       // 拼成 spak() 会编译报错
        System.out.println("汪");
    }
}
\`\`\

Python 没有这种校验，重写就是"在子类里定义同名方法"，拼错了也不会报错——这是动态类型的常见陷阱：

\`\`\`python
class Animal:
    def speak(self):
        print("声音")

class Dog(Animal):
    def speek(self):          # 拼错了！不会报错，但 speak 没被重写
        print("汪")

Dog().speak()                 # 输出"声音"，不是"汪"
\`\`\`

补救办法是用 \`typing.override\`（Python 3.12+）装饰器，配合 mypy 检查：

\`\`\`python
from typing import override

class Dog(Animal):
    @override
    def speek(self):          # mypy 报错：父类没有 speek 方法
        print("汪")
\`\`\`

### 五、多态实现：方法表 vs MRO

多态是"同一个调用，根据对象实际类型执行不同实现"。两边都支持多态，但实现机制完全不同。

**Java 的多态基于"方法表"（vtable）**：每个类在编译时生成一张虚方法表，记录每个方法的实际入口地址。运行时根据对象的实际类型查表，直接跳转到对应方法。这是 O(1) 操作，非常快。

\`\`\`java
Animal a = new Dog("旺财");
a.speak();   // 编译时绑定 Animal.speak，运行时通过方法表跳到 Dog.speak
\`\`\

**Python 的多态基于"属性查找"**：调用 \`a.speak()\` 时，Python 沿着对象的 MRO 顺序查找 \`speak\` 属性，找到第一个就调用。查找发生在运行时，每次调用都要查一次。

\`\`\`python
a = Dog("旺财")
a.speak()   # 运行时沿 MRO 查找 speak，找到 Dog.speak 调用
\`\`\

性能上 Java 远胜 Python（直接跳转 vs 字典查找），但 Python 的灵活性更高——同一个变量可以指向任意类型的对象，只要它有 \`speak\` 方法就行，根本不需要继承关系。这就是 Python 的"鸭子类型多态"。

### 六、抽象基类

两边都有"不能实例化、只能被继承"的抽象类概念。

**Java 用 \`abstract\` 关键字**：

\`\`\`java
public abstract class Shape {
    public abstract double area();    // 抽象方法，子类必须实现
    public void describe() {          // 具体方法
        System.out.println("面积是 " + area());
    }
}
// Shape s = new Shape();   // 编译错误：不能实例化抽象类
\`\`\

**Python 用 \`abc.ABC\` 和 \`@abstractmethod\`**：

\`\`\`python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):              # 抽象方法
        ...

    def describe(self):          # 具体方法
        print(f"面积是 {self.area()}")

# Shape()   # TypeError: 不能实例化抽象类
\`\`\

注意 Python 的 ABC **运行时检查**：尝试实例化含未实现抽象方法的类会抛 \`TypeError\`。这种检查靠 \`ABCMeta\` 元类实现，是运行时行为，不是编译时。Java 的抽象类检查是编译期的。

### 七、多重继承：Python 的 C3 MRO

这是两边最大的分歧。**Python 允许多继承，Java 严禁**（类的多继承）。

先看 Python 多继承：

\`\`\`python
class A:
    def greet(self): print("A")

class B:
    def greet(self): print("B")

class C(A, B):       # C 同时继承 A 和 B
    pass

C().greet()          # 输出 A（按 MRO 顺序找）
print(C.__mro__)     # (<class 'C'>, <class 'A'>, <class 'B'>, <class 'object'>)
\`\`\

当 \`C().greet()\` 被调用时，Python 按 MRO（Method Resolution Order，方法解析顺序）查找 \`greet\`，先找到 A 就调用 A 的版本。

**MRO 用的是 C3 线性化算法**，规则大致是：从左到右、深度优先，但保证每个父类只出现一次且顺序满足"子类在父类之前"。可以查看 \`ClassName.__mro__\` 或 \`ClassName.mro()\` 看具体顺序。

**菱形继承问题**：多继承最经典的问题是"菱形继承"——两个父类继承自同一个祖父类，调用顺序怎么排？

\`\`\`python
class Base:
    def show(self): print("Base")

class A(Base):
    def show(self): print("A"); super().show()

class B(Base):
    def show(self): print("B"); super().show()

class C(A, B):
    def show(self): print("C"); super().show()

C().show()
# 输出：C A B Base
\`\`\

注意 \`super().show()\` 在 A 里调用的是 B，不是 Base！这就是 C3 MRO 的妙处——它把整个继承图线性化成一条链，\`super()\` 沿这条链走，保证每个类只被调用一次。这种"协作式多继承"是 Python 多继承能正常工作的关键。

### 八、Java 为什么禁止类多继承

Java 严格禁止类多继承（\`class C extends A, B\` 是非法的），原因主要有两个：

1. **菱形继承的复杂性**：如果 A 和 B 都有同名字段或方法，C 该继承哪一个？C++ 的多继承被广泛批评就是因为这里坑太多。
2. **构造器调用的歧义**：父类构造器该怎么排？谁先初始化？

Java 的解决方案是**接口**：接口没有字段（Java 8 之前没有方法实现），所以"多实现"不会引发字段冲突。一个类可以 implements 多个接口，但只能 extends 一个类。这样既保留了"多类型"的灵活性，又规避了多继承的复杂性。

\`\`\`java
class C extends A implements B1, B2, B3 {
    // 单继承类 + 多实现接口
}
\`\`\

Python 选择相信程序员——给你多继承的权力，但你要自己处理好菱形继承。C3 MRO 和 \`super()\` 配合，让"协作式多继承"成为可能，但理解成本不低。

### 九、Mixin 模式

Mixin 是"只提供功能、不应该是独立基类"的小型类。Python 鼓励用 mixin 组合功能，而不是用深继承树：

\`\`\`python
class JsonMixin:
    def to_json(self):
        import json
        return json.dumps(self.__dict__)

class PrintableMixin:
    def __repr__(self):
        return f"<{type(self).__name__} {self.__dict__}>"

class User(JsonMixin, PrintableMixin):    # 通过 mixin 组合功能
    def __init__(self, name, age):
        self.name = name
        self.age = age

u = User("Alice", 18)
print(u.to_json())        # {"name": "Alice", "age": 18}
print(repr(u))            # <User {'name': 'Alice', 'age': 18}>
\`\`\

Java 8 之前实现 mixin 很笨拙（要么继承要么接口+样板代码）。Java 8 引入接口默认方法后，可以用接口模拟 mixin：

\`\`\`java
interface JsonMixin {
    Map<String, Object> data();
    default String toJson() {           // 默认方法提供实现
        return data().toString();
    }
}

class User implements JsonMixin {
    public Map<String, Object> data() {
        return Map.of("name", "Alice", "age", 18);
    }
}
\`\`\

但 Java 接口 mixin 仍有局限：不能有实例字段，状态得由实现类自己存。Python 的 mixin 可以自由带状态，灵活得多。

## 小结

- **继承语法**：Python \`class Sub(Base)\`，Java \`class Sub extends Base\`。
- **单继承**：两边类都是单继承；多类型靠接口（Java）/ mixin+多继承（Python）。
- **super**：Java 直接定位父类；Python 按 C3 MRO 调用"下一个"类。
- **方法重写**：Java \`@Override\` 编译校验，Python 无校验（3.12+ 可用 \`@override\` + mypy）。
- **多态机制**：Java 方法表 O(1)，Python 运行时 MRO 查找（慢但灵活，鸭子多态）。
- **抽象类**：Java \`abstract\`（编译期检查），Python \`abc.ABC\`（运行时检查）。
- **多继承**：Python 允许，靠 C3 MRO 解决菱形问题；Java 禁止类多继承，靠接口实现多类型。
- **Mixin**：Python 灵活（可有字段），Java 8+ 用接口默认方法模拟（无字段）。

## 常见疑问 Q&A

**Q1：Python 多继承这么灵活，为什么不都用多继承？**
多继承虽然灵活，但理解成本高——MRO、super 的协作式调用、菱形继承都需要深入学习。在简单场景下，组合（has-a）比继承（is-a）更清晰。Python 社区的共识是：能用组合就别用继承，必须用继承时优先单继承 + mixin，谨慎使用真正的多继承。

**Q2：Java 接口默认方法是不是让 Java 也有了多继承？**
部分是。Java 8 之后接口可以有默认方法，一个类实现多个接口就获得了多个方法的实现，类似多继承。但接口仍然不能有实例字段，所以"状态多继承"还是不行。这是 Java 在"避免多继承复杂性"和"提供灵活性"之间的折中。

**Q3：Python 的 super() 在多继承里到底调谁？**
看 \`ClassName.__mro__\`。super 调用的是 MRO 链上"当前类的下一个"类，不一定是父类。在菱形继承里，这种机制保证每个类只被调用一次。理解这一点是写好多继承代码的关键。

**Q4：抽象类和接口怎么选？**
下一章会详细讲。简单说：有共享字段或构造逻辑用抽象类，只定义行为契约用接口。Python 还有 Protocol 这种结构化契约，介于两者之间。`,
  },

  // ============================================================
  // 第 9 章：接口、抽象类与协议
  // ============================================================
  {
    id: "pyjava-interface",
    icon: "🔗",
    group: "类型系统与面向对象",
    title: "接口、抽象类与协议",
    content: `## 第9章：接口、抽象类与协议

### 一、为什么需要"契约"

写一个排序函数，你希望它能排任何"可比较"的对象。但"可比较"是什么？你需要一种方式声明"只要对象有 \`compare\` 方法就能传给我"。这种声明就是**契约**。

Java 和 Python 都有契约机制，但实现哲学不同：

- **Java**：以**接口**和**抽象类**为核心，是**名义子类型（nominal subtyping）**——必须显式声明"我实现这个接口"才算数。
- **Python**：以**鸭子类型**为主，新近加入**协议（Protocol）**做静态检查，是**结构子类型（structural subtyping）**——只要对象有这些方法就算数，不用声明。

这一章我们深入对比这两种思路。

### 二、Java 接口

Java 的接口是最常用的契约形式。一个接口只定义方法签名（Java 8 前不能有实现），类用 \`implements\` 声明自己满足这个契约。

\`\`\`java
public interface Comparable<T> {
    int compareTo(T other);
}

public class Student implements Comparable<Student> {
    private int score;
    public Student(int score) { this.score = score; }

    @Override
    public int compareTo(Student other) {
        return Integer.compare(this.score, other.score);
    }
}

// 使用
List<Student> list = new ArrayList<>();
Collections.sort(list);    // sort 只接受 Comparable，Student 满足契约
\`\`\

Java 8 之后接口增强了不少，可以包含三种东西：

**1. 抽象方法**（必须被实现）：

\`\`\`java
interface Animal {
    String sound();        // 抽象方法
}
\`\`\

**2. 默认方法（default method）**——提供默认实现，实现类可以选择 override 或直接用：

\`\`\`java
interface Animal {
    String sound();
    default String describe() {       // 默认方法
        return "这种动物叫声是 " + sound();
    }
}

class Dog implements Animal {
    public String sound() { return "汪汪"; }
    // 不写 describe 也能用，继承自接口的默认实现
}
\`\`\

**3. 静态方法**——属于接口本身的工具方法：

\`\`\`java
interface StringUtil {
    static boolean isEmpty(String s) {
        return s == null || s.isEmpty();
    }
}
// 调用：StringUtil.isEmpty("hi")
\`\`\

### 三、函数式接口与 lambda

Java 8 引入了一个特殊概念——**函数式接口**：**只有一个抽象方法**的接口（默认方法不算）。这种接口可以用 lambda 表达式简洁地实现。

\`\`\`java
@FunctionalInterface          // 编译器校验：确实只有一个抽象方法
interface Predicate<T> {
    boolean test(T t);
}

// 用 lambda 实现函数式接口
Predicate<String> isEmpty = s -> s == null || s.isEmpty();
System.out.println(isEmpty.test(""));      // true

// 也能用方法引用
Predicate<String> isEmpty2 = String::isEmpty;
\`\`\

Java 标准库提供了大量函数式接口：\`Function<T,R>\`、\`Predicate<T>\`、\`Consumer<T>\`、\`Supplier<T>\` 等，构成了 Java 函数式编程的基础。这是 Java 在"静态类型 + 接口"框架内对函数式风格的妥协——没有真正的函数类型，但用接口模拟得足够好用。

Python 没有这种"函数式接口"概念，因为 Python 函数本就是一等公民，可以自由传递：

\`\`\`python
# Python 直接传函数，无需接口包装
def is_empty(s):
    return s is None or s == ""

names = ["", "Alice", "", "Bob"]
result = list(filter(is_empty, names))    # 直接传函数
print(result)   # ['', '']
\`\`\

### 四、Java 抽象类

抽象类用 \`abstract\` 关键字，介于"普通类"和"接口"之间：

- 可以有抽象方法（无实现，子类必须实现）；
- 可以有具体方法和字段；
- 不能被实例化；
- 类只能继承一个抽象类（单继承限制）。

\`\`\`java
public abstract class Shape {
    protected String name;
    public Shape(String name) { this.name = name; }

    public abstract double area();       // 抽象方法
    public abstract double perimeter();  // 抽象方法

    public void describe() {             // 具体方法，子类共享
        System.out.printf("%s: 面积 %.2f, 周长 %.2f%n",
            name, area(), perimeter());
    }
}

public class Circle extends Shape {
    private double r;
    public Circle(double r) { super("圆"); this.r = r; }
    public double area() { return Math.PI * r * r; }
    public double perimeter() { return 2 * Math.PI * r; }
}
\`\`\

### 五、接口 vs 抽象类：Java 怎么选

| 维度 | 接口 | 抽象类 |
| --- | --- | --- |
| 关键字 | \`interface\` | \`abstract class\` |
| 字段 | 只能是 \`public static final\` 常量 | 任意字段 |
| 构造器 | 没有 | 有 |
| 方法实现 | 默认方法 + 静态方法（Java 8+） | 抽象方法 + 具体方法 |
| 多继承 | 类可实现多个接口 | 类只能继承一个抽象类 |
| 适用场景 | 定义行为契约、跨类型协议 | 共享代码和状态、有"是不是"关系 |

经验法则：

- **"能不能做"**用接口（\`Comparable\`、\`Runnable\`、\`Serializable\`）；
- **"是什么"**用抽象类（\`AbstractList\`、\`Number\`）；
- 有共享字段或构造逻辑 → 抽象类；
- 只定义行为、需要多继承 → 接口。

Java 集合框架是好例子：\`AbstractList\` 提供了 \`List\` 接口的部分实现，\`ArrayList\` 和 \`LinkedList\` 都继承它，同时又都实现 \`List\` 接口。抽象类承担"代码复用"，接口承担"类型契约"，各司其职。

### 六、Python 抽象基类（ABC）

Python 用 \`abc\` 模块实现抽象类：

\`\`\`python
from abc import ABC, abstractmethod

class Shape(ABC):
    def __init__(self, name):
        self.name = name

    @abstractmethod
    def area(self):           # 抽象方法
        ...

    @abstractmethod
    def perimeter(self):      # 抽象方法
        ...

    def describe(self):       # 具体方法
        print(f"{self.name}: 面积 {self.area():.2f}, 周长 {self.perimeter():.2f}")

class Circle(Shape):
    def __init__(self, r):
        super().__init__("圆")
        self.r = r
    def area(self): return 3.14159 * self.r ** 2
    def perimeter(self): return 2 * 3.14159 * self.r

# Shape()   # TypeError: 不能实例化
c = Circle(3)
c.describe()   # 圆: 面积 28.27, 周长 18.85
\`\`\

注意 Python 的 ABC 检查是**运行时**的：实例化时 \`ABCMeta\` 元类会检查所有 \`@abstractmethod\` 是否都被实现。这与 Java 的编译期检查不同——Python 的"抽象"在运行到 \`__init__\` 时才暴露问题。

ABC 还支持"虚拟子类"——通过 \`register\` 让一个没有继承关系的类"声明"自己是 ABC 的子类，主要用于 \`isinstance\` 检查：

\`\`\`python
class MyList:                # 没继承 list
    def __iter__(self): ...

list.register(MyList)        # 注册为虚拟子类
print(isinstance(MyList(), list))   # True
\`\`\

### 七、Python 协议（Protocol）：结构子类型

Python 3.8 引入 \`typing.Protocol\`，这是 Python 类型系统的一次重要升级——它把"鸭子类型"和"静态检查"结合起来。

\`\`\`python
from typing import Protocol

class SupportsArea(Protocol):
    def area(self) -> float: ...    # 只定义方法签名，不实现

def print_area(obj: SupportsArea) -> None:
    print(f"面积: {obj.area()}")

class Circle:
    def area(self) -> float:        # 没声明实现任何协议
        return 3.14

class Rectangle:
    def area(self) -> float:
        return 10.0

print_area(Circle())      # mypy: OK（结构匹配）
print_area(Rectangle())   # mypy: OK
print_area(42)            # mypy: 报错（int 没有 area 方法）
\`\`\

注意 \`Circle\` 和 \`Rectangle\` **都没有显式声明\` implements SupportsArea\`**，但因为它们都有 \`area\` 方法，mypy 就认为它们满足这个协议。这就是**结构子类型**——类型匹配看"结构"（有没有这些方法），不看"名义"（有没有声明实现）。

运行时 \`print_area(42)\` 不会报错（Python 不会运行时检查 Protocol），但 mypy 在编译前会指出来。这让你**既保留鸭子类型的灵活性，又获得静态类型的安全性**。

### 八、名义子类型 vs 结构子类型

这是两种类型系统的根本差异：

- **名义子类型（Java）**：A 是 B 的子类型，**必须显式声明**（继承或实现）。光有相同方法不算数。
- **结构子类型（Python Protocol）**：A 是 B 的子类型，**只要结构匹配**（有相同方法签名）。不用声明。

看一个对比：

\`\`\`java
// Java：必须有显式声明
interface HasName { String name(); }

class User implements HasName {        // 必须写 implements
    public String name() { return "Alice"; }
}

class Product {                        // 没 implements
    public String name() { return "手机"; }
}

void printName(HasName x) { ... }
printName(new User());      // OK
// printName(new Product());  // 编译错误：Product 不是 HasName
\`\`\

\`\`\`python
# Python Protocol：只要结构匹配
from typing import Protocol

class HasName(Protocol):
    def name(self) -> str: ...

class User:                            # 无需声明
    def name(self) -> str: return "Alice"

class Product:                         # 无需声明
    def name(self) -> str: return "手机"

def print_name(x: HasName) -> None:
    print(x.name())

print_name(User())        # OK
print_name(Product())     # OK（结构匹配）
\`\`\

结构子类型的好处是**解耦**——定义协议的人不需要修改已有类，只要它们结构上匹配就能用。名义子类型的好处是**明确**——一眼能看出谁实现了什么契约。

实际工程中：

- Java 大型项目偏爱名义子类型，因为契约关系显式可控。
- Python 灵活场景偏爱结构子类型，复用已有类无需改造。

### 九、鸭子类型 vs 声明式接口

回顾 Python 三种契约方式的演化：

1. **纯鸭子类型**（最传统）：不写任何契约，运行时靠 \`AttributeError\` 报错。灵活但难维护。
2. **ABC**（抽象基类）：用 \`@abstractmethod\` 强制子类实现，运行时检查。适合"显式继承"的场景。
3. **Protocol**（协议）：静态检查结构匹配，不用继承声明。兼顾灵活和安全。

三种各有用武之地：

- 写库、给第三方扩展用 → Protocol（让别人的类无需改造就能匹配）。
- 内部代码、需要共享实现 → ABC（带具体方法的抽象基类）。
- 快速脚本、原型 → 纯鸭子类型（够用就行）。

Java 没有这种谱系，只有"接口 + 抽象类"两档。这是动态语言渐进式类型化的优势——你可以根据需要选择检查严格度。

## 小结

- **Java 接口**：契约核心，可有默认方法/静态方法（Java 8+），支持多实现。
- **Java 抽象类**：单继承，可有字段和构造器，用于共享代码。
- **函数式接口**：单抽象方法接口，配合 lambda 实现函数式编程。
- **Python ABC**：\`abc.ABC\` + \`@abstractmethod\`，运行时检查，支持虚拟子类。
- **Python Protocol**：结构子类型，mypy 静态检查，无需显式声明。
- **名义子类型 vs 结构子类型**：Java 看声明，Python Protocol 看结构。
- **选用经验**：行为契约用接口/Protocol，共享状态用抽象类/ABC。

## 常见疑问 Q&A

**Q1：Java 8 的默认方法是不是让接口和抽象类没区别了？**
还有区别。接口仍然不能有实例字段、不能有构造器，默认方法也不能访问实例状态（因为没有状态可访问）。抽象类有完整的"对象骨架"。默认方法主要是为了接口演进——给已发布的接口加方法时不破坏已有实现。

**Q2：Python 有了 Protocol，ABC 是不是过时了？**
没有。两者用途不同：Protocol 用于"结构匹配、不需继承"的场景，ABC 用于"显式继承、共享代码"的场景。如果你的抽象有具体方法需要被复用，ABC 更合适；如果只是定义一个外部契约，Protocol 更灵活。

**Q3：函数式接口为什么要限制只能有一个抽象方法？**
因为 lambda 表达式需要"自动推断"目标类型。如果一个接口有两个抽象方法，lambda \`x -> ...\` 就不知道在重写哪个。单抽象方法的限制让类型推断无歧义。\`@FunctionalInterface\` 注解让编译器帮你守住这条线。

**Q4：Java 能模拟结构子类型吗？**
很难。Java 类型系统是名义的，没有"自动结构匹配"。一个变通是用泛型 + 边界，但远不如 Protocol 自然。这也是为什么 Java 库的接口设计特别强调"早期就定义好契约"——后期很难让已有类"自动"满足新接口。`,
  },

  // ============================================================
  // 第 10 章：异常处理
  // ============================================================
  {
    id: "pyjava-exception",
    icon: "⚠️",
    group: "类型系统与面向对象",
    title: "异常处理",
    content: `## 第10章：异常处理

### 一、异常是什么，为什么要处理

程序运行时会遇到各种"非正常情况"：除以零、文件找不到、网络断开、用户输入非法。如果没有处理机制，程序要么崩溃，要么返回错误码（像 C 语言那样），调用方很容易忘记检查。

异常处理的核心思想是：**把"出错"和"处理出错"分离**——出错的地方抛出异常，处理的地方捕获异常，中间的调用栈自动传播。这样错误不会丢，也不会污染正常逻辑。

Python 和 Java 都有完善的异常机制，但细节差异很大。最大的一点：**Java 有检查异常（checked exception），Python 没有**。这个差异深刻影响了两边的代码风格。

### 二、异常体系

先看两边的异常类层次。

**Python**：

\`\`\`
BaseException
├── SystemExit              # sys.exit() 触发
├── KeyboardInterrupt       # Ctrl+C
├── GeneratorExit
└── Exception               # 所有"普通"异常的基类
    ├── StopIteration
    ├── ArithmeticError
    │   └── ZeroDivisionError
    ├── LookupError
    │   ├── IndexError
    │   └── KeyError
    ├── OSError             # 系统错误
    │   ├── FileNotFoundError
    │   └── PermissionError
    ├── ValueError
    ├── TypeError
    └── ...
\`\`\

注意：\`BaseException\` 是顶层，但**日常只应该捕获 \`Exception\`**。\`SystemExit\`、\`KeyboardInterrupt\` 这些不该被普通 \`except\` 吞掉，否则连退出都退不干净。

**Java**：

\`\`\`
Throwable
├── Error                   # 严重错误，不该捕获（如 OutOfMemoryError）
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── ...
└── Exception
    ├── RuntimeException    # 运行时异常（unchecked）
    │   ├── NullPointerException
    │   ├── IndexOutOfBoundsException
    │   │   └── ArrayIndexOutOfBoundsException
    │   ├── ClassCastException
    │   ├── IllegalArgumentException
    │   └── ArithmeticException
    ├── IOException         # 检查异常（checked）
    │   ├── FileNotFoundException
    │   └── EOFException
    ├── SQLException        # checked
    └── ...
\`\`\

Java 把 \`Exception\` 分成两类：

- **检查异常（checked）**：\`Exception\` 的子类但**不是** \`RuntimeException\` 的子类。编译器强制要求处理（try-catch 或 throws 声明）。
- **非检查异常（unchecked）**：\`RuntimeException\` 的子类和 \`Error\`。编译器不强制处理。

### 三、检查异常：Java 的特色与争议

这是两边最大的差异。Java 强制你处理检查异常：

\`\`\`java
import java.io.FileReader;

public class Main {
    public static void main(String[] args) {
        // FileReader 构造器声明 throws FileNotFoundException
        FileReader r = new FileReader("data.txt");   // 编译错误！
        // 必须二选一：
        // 1) try-catch
        // 2) 在方法签名声明 throws FileNotFoundException
    }
}
\`\`\

正确写法之一：

\`\`\`java
public static void main(String[] args) {
    try {
        FileReader r = new FileReader("data.txt");
    } catch (java.io.FileNotFoundException e) {
        System.out.println("文件不存在: " + e.getMessage());
    }
}
\`\`\

或者：

\`\`\`java
public static void main(String[] args) throws java.io.FileNotFoundException {
    FileReader r = new FileReader("data.txt");
}
\`\`\

**检查异常的好处**：

- 强制开发者面对"可能出错的情况"，不能装作没看见；
- 异常类型成为方法契约的一部分，调用方清楚知道会抛什么；
- 适合"可恢复"的错误（文件不存在、网络超时），鼓励调用方做兜底处理。

**检查异常的争议**：

- 大量样板代码，很多开发者偷懒直接 \`catch (Exception e) {}\` 吞掉，反而埋雷；
- 异常沿着调用栈向上传播时，每一层方法签名都要加 \`throws\`，重构成本高；
- 在 lambda、流式 API 中尤其笨重——\`Function<T,R>\` 的 \`R apply(T)\` 不能声明 checked 异常，导致流式代码里检查异常几乎用不了；
- 实际工程中，很多"可恢复"错误最终也被包装成运行时异常抛出。

由于这些争议，Spring、JDBC 等 framework 大量把检查异常包装成 \`RuntimeException\`。新设计的 Java 库也倾向于只用非检查异常。Python 则从一开始就没采用检查异常的设计。

### 四、try 语法对比

Python 的 \`try\` 有四个子句：

\`\`\`python
try:
    result = 10 / x
    value = data[result]
except ZeroDivisionError:
    print("除零错误")
except (KeyError, IndexError) as e:
    print(f"键/索引错误: {e}")
except Exception as e:           # 兜底
    print(f"其他错误: {e}")
else:
    print("没异常时执行")          # try 块成功才走这里
finally:
    print("一定执行")              # 不管有没有异常都执行
\`\`\

Java 的 \`try\` 只有三个子句（没有 \`else\`）：

\`\`\`java
try {
    int result = 10 / x;
    int value = data[result];
} catch (ArithmeticException e) {
    System.out.println("除零错误");
} catch (RuntimeException e) {     // 兜底，必须从小到大排
    System.out.println("其他错误: " + e.getMessage());
} finally {
    System.out.println("一定执行");
}
// Java 7+ 支持多异常合并捕获
try { ... }
catch (IOException | SQLException e) { ... }
\`\`\

几个差异：

- Python 有 \`else\` 子句——\`try\` 块没抛异常时才执行，适合放"成功后续逻辑"，把"可能出错"和"成功后续"分开。Java 没这个，得把成功逻辑直接写在 try 块里。
- Python 的 \`except\` 顺序无关"大小"，按代码顺序匹配第一个合适的；Java 的 \`catch\` 必须从子类到父类排，否则编译错误。
- Python 用 \`except X as e\` 绑定异常对象，Java 用 \`catch (X e)\`。

### 五、抛出：raise vs throw

\`\`\`python
def divide(a, b):
    if b == 0:
        raise ValueError("除数不能为零")
    return a / b
\`\`\

\`\`\`java
public double divide(double a, double b) {
    if (b == 0) {
        throw new IllegalArgumentException("除数不能为零");
    }
    return a / b;
}
\`\`\

几个细节：

- Python 用 \`raise\`，Java 用 \`throw\`。
- Python 抛"实例"或类（\`raise ValueError\` 等价于 \`raise ValueError()\`），Java 必须抛 \`new\` 出来的实例。
- Python 异常对象可以直接重新抛出：\`except Exception as e: raise\`（保留原堆栈），Java 是 \`throw e;\`（会重置堆栈起点，建议用 \`throw e;\` 在 catch 块末尾，或 \`throw new XxxException(e);\` 包装）。

### 六、自定义异常

两边都通过继承现有异常类来定义自定义异常。

\`\`\`python
class BusinessError(Exception):
    """业务逻辑异常"""
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code

# 使用
raise BusinessError(4001, "用户不存在")
\`\`\

\`\`\`java
public class BusinessError extends Exception {        // 检查异常
// public class BusinessError extends RuntimeException {  // 非检查异常
    private final int code;

    public BusinessError(int code, String message) {
        super(message);
        this.code = code;
    }

    public int getCode() { return code; }
}

// 使用
throw new BusinessError(4001, "用户不存在");
\`\`\

Python 自定义异常很简单——继承 \`Exception\`，加属性即可。Java 要决定继承 \`Exception\`（检查）还是 \`RuntimeException\`（非检查）。现代 Java 实践通常推荐继承 \`RuntimeException\`，避免检查异常的样板代码负担。

### 七、异常链：raise from vs Throwable cause

异常链是指在处理一个异常时抛出另一个异常，但保留原始异常信息。这在"低层异常包装成高层业务异常"时很有用。

\`\`\`python
try:
    data = json.loads(raw)
except json.JSONDecodeError as e:
    raise BusinessError("数据格式错误") from e    # 显式链接
\`\`\

这样最终异常的 \`__cause__\` 指向原始的 \`JSONDecodeError\`，打印堆栈时会看到：

\`\`\`
business.BusinessError: 数据格式错误

The above exception was the direct cause of the following exception:

json.JSONDecodeError: ...
\`\`\

Python 还有一种隐式链接：\`except\` 块里抛新异常时，原异常自动存到 \`__context__\`。两者的区别是 \`from\` 显式声明因果关系，\`__context__\` 是隐式的"处理时发生"关系。

Java 用 \`Throwable\` 的 \`cause\` 字段实现异常链：

\`\`\`java
try {
    JSONObject obj = new JSONObject(raw);
} catch (JSONException e) {
    throw new BusinessError("数据格式错误");   // 原异常丢了
    // 应该这样：
    // throw new BusinessError("数据格式错误", e);   // 传 cause
}

// 自定义异常要支持 cause 构造器
public class BusinessError extends RuntimeException {
    public BusinessError(String message, Throwable cause) {
        super(message, cause);
    }
}
\`\`\

Java 的异常链是构造器参数形式，必须显式传入。Python 的 \`raise from\` 是语法层面的便捷写法，更自然。但两者本质相同——把原异常作为新异常的"原因"保留下来。

### 八、with vs try-with-resources：资源管理

资源（文件、数据库连接、锁）必须保证用完释放，即使中间抛异常。两边都有专门语法。

**Python 的 \`with\` 语句**——基于"上下文管理器"协议（\`__enter__\` / \`__exit__\`）：

\`\`\`python
with open("data.txt") as f:        # __enter__ 打开文件
    content = f.read()
# 离开 with 块自动调用 __exit__，关闭文件，即使 read 抛异常

# 自定义上下文管理器
class Timer:
    def __enter__(self):
        self.start = time.time()
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"耗时 {time.time() - self.start:.3f}s")
        # 返回 False 或 None，异常继续传播
        # 返回 True，异常被吞掉（慎用）

with Timer():
    do_something()
\`\`\

\`__exit__\` 接收三个参数：异常类型、异常值、堆栈。返回 \`True\` 表示"吞掉异常"，返回 \`False\` 或 \`None\` 让异常继续传播。

**Java 的 try-with-resources**（Java 7+）——基于 \`AutoCloseable\` 接口：

\`\`\`java
try (FileReader r = new FileReader("data.txt");
     BufferedReader br = new BufferedReader(r)) {
    String content = br.readLine();
}
// 离开 try 块自动调用 r.close() 和 br.close()，即使抛异常
// 资源按声明**逆序**关闭（先关 br 再关 r）

// 自定义资源
public class Timer implements AutoCloseable {
    private final long start;
    public Timer() { this.start = System.currentTimeMillis(); }
    @Override
    public void close() {
        System.out.printf("耗时 %d ms%n", System.currentTimeMillis() - start);
    }
}

try (Timer t = new Timer()) {
    doSomething();
}
\`\`\

几个差异：

- Python \`with\` 是独立语句，可以脱离 try 用；Java try-with-resources 必须和 try 绑定。
- Python 资源管理更灵活——\`__exit__\` 能看到异常信息，能选择吞掉；Java \`close()\` 不接收异常参数，但 try-with-resources 有"异常抑制"机制：如果 try 块和 close 都抛异常，close 的异常被附加到 try 异常的 \`getSuppressed()\` 里。
- Python 有 \`contextlib.contextmanager\` 装饰器，用生成器函数简化上下文管理器的编写，非常优雅。
- Java 资源必须实现 \`AutoCloseable\`（\`close()\` 抛 \`Exception\`）或 \`Closeable\`（\`close()\` 抛 \`IOException\`）。

### 九、异常处理的最佳实践（两边通用）

1. **精确捕获，别用 \`except Exception\` / \`catch (Exception e)\` 兜底一切**。这会吞掉你没想到的 bug，让问题难定位。
2. **别吞异常**——\`except: pass\` 和 \`catch (Exception e) {}\` 是反面教材。至少要 log。
3. **用异常表示"异常情况"，不要用异常做控制流**。比如"判断元素是否在列表里"应该用 \`in\`，而不是捕获 \`IndexError\`。
4. **异常要带足够上下文**——抛出时把关键参数放进消息，方便排查。
5. **资源用 with / try-with-resources**，别手动 close。
6. **自定义异常要有清晰层次**，方便调用方按粒度捕获。

## 小结

- **异常体系**：Python \`BaseException → Exception\`；Java \`Throwable → Error/Exception\`，\`Exception\` 又分 checked / unchecked。
- **检查异常**：Java 独有，强制处理，争议大；Python 没有，靠开发者自觉。
- **try 语法**：Python 有 \`try/except/else/finally\`，Java 有 \`try/catch/finally\`，Java 7+ 支持多异常合并捕获。
- **抛出**：Python \`raise\`，Java \`throw\`。
- **自定义异常**：Python 继承 \`Exception\`，Java 继承 \`Exception\`（checked）或 \`RuntimeException\`（unchecked）。
- **异常链**：Python \`raise from\`，Java 构造器传 \`cause\`。
- **资源管理**：Python \`with\` + 上下文管理器，Java try-with-resources + \`AutoCloseable\`。

## 常见疑问 Q&A

**Q1：Java 的检查异常到底好不好？**
这是个长期争议。理论上检查异常强制处理"可恢复错误"是好事；实践中它带来大量样板代码，被滥用成 \`catch + ignore\`，在 lambda/流式 API 里几乎用不了。现代 Java 趋势是减少检查异常使用，Spring 等框架把 JDBC 的检查异常包装成 \`RuntimeException\`。新人建议：优先用 \`RuntimeException\`，只在"调用方真的应该处理"的场景用 checked。

**Q2：Python 为什么不学 Java 加检查异常？**
Python 是动态类型，没有编译期类型检查机制，"强制声明 throws"无从谈起。Python 选择用文档、type hints、约定来提示可能抛出的异常，把"是否处理"留给开发者判断。这符合 Python"相信程序员"的哲学。

**Q3：\`except Exception:\` 和 \`except:\` 有什么区别？**
\`except Exception:\` 只捕获 \`Exception\` 及其子类，不会吞掉 \`SystemExit\`、\`KeyboardInterrupt\`（这两个继承 \`BaseException\`）。\`except:\` 会捕获一切，包括 \`KeyboardInterrupt\`——这意味着按 Ctrl+C 都退不出来，非常危险。永远不要用裸 \`except:\`。

**Q4：Python 的 \`with\` 能完全替代 finally 吗？**
对于"资源释放"场景，\`with\` 比 \`finally\` 更优雅、更不容易漏。但 \`finally\` 还有其他用途——比如"无论成功失败都要执行的清理逻辑"，不一定是资源。两者各有所长，\`with\` 专注资源管理，\`finally\` 是更通用的"保证执行"机制。`,
  },
];
