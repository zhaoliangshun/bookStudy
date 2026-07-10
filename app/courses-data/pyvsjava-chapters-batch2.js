// =============================================================
// Python vs Java 深度对比 —— 第 2 批
// -------------------------------------------------------------
// 转义规则：content 内部反引号写作 \`，${ 写作 \$\{
// =============================================================

export const chapters = [
  {
    id: "pyvsjava-type-system",
    icon: "🔧",
    title: "类型系统总览：动态 vs 静态",
    group: "语法与类型",
    content: `# 类型系统总览：动态 vs 静态

## 一、类型系统：编程语言最根本的分歧

如果让我用一句话区分 Python 和 Java，那就是：**Python 是动态类型，Java 是静态类型**。这条分水岭几乎决定了两门语言在编译器、IDE、性能、重构、团队协作上的所有差异。

但"动态 vs 静态"只是冰山一角。类型系统还有好几条正交的维度：

| 维度 | Python | Java |
|------|--------|------|
| 静态/动态 | 动态 | 静态 |
| 强/弱 | 强类型 | 强类型 |
| 名义/结构 | 名义类型（但鸭子类型补足） | 名义类型 |
| 类型推断 | 类型提示（可选、不强制） | var + 泛型推断（编译期） |
| 检查时机 | 运行时 | 编译期 + 运行时（泛型擦除） |
| 空安全 | 无（None 是对象） | 无原生空安全（Optional 是补救） |

本章我们逐一拆解这些维度，让你看清两门语言"骨子里的不同"。

## 二、动态类型的本质：变量是标签

Python 中，**变量没有类型，对象才有类型**。变量只是一个"名字标签"，贴在某个对象上。同一个标签可以今天贴整数、明天贴字符串。

\`\`\`python
x = 42          # x 贴在 int 对象 42 上
print(type(x))  # <class 'int'>

x = "hello"     # 同一个 x，现在贴在 str 对象上
print(type(x))  # <class 'str'>

x = [1, 2, 3]   # 现在贴在 list 上
print(type(x))  # <class 'list'>
\`\`\`

这段代码在 Python 里完全合法。**类型属于值，不属于变量**。用内存图理解就是：变量名 → 指针 → 对象，对象自己带着类型标签。

你可以用 \`id()\` 看变量指向的对象地址：

\`\`\`python
x = 42
print(id(x))   # 某个内存地址

x = "hello"
print(id(x))   # 另一个地址（42 还在，但 x 不再指向它）
\`\`\`

这种设计的代价是：**编译器/解释器无法在执行前知道 x 到底是什么**，所以 IDE 的自动补全、类型检查都得靠"猜测"或可选的类型提示。

## 三、静态类型的本质：变量是容器

Java 走了完全相反的路：**变量是一个有类型的容器，只能装对应类型的值**。

\`\`\`java
int x = 42;
// x = "hello";  // 编译错误：类型不匹配
System.out.println(x);
\`\`\`

这里 \`x\` 在声明时就确定了类型 \`int\`，编译器在编译期就检查所有赋值是否合法。如果类型不匹配，**代码根本编译不过**。

\`\`\`java
String s = "hello";
// s = 42;  // 编译错误
Object o = 42;   // 合法：int 自动装箱为 Integer，向上转型为 Object
o = "hello";     // 合法：String 也是 Object
\`\`\`

Java 的变量声明是 \`类型 变量名 = 值;\`，类型写在左边，像一个"容器规格说明"。

### 静态类型的好处

1. **编译期就能发现错误**：\`String s = 42;\` 在你按编译键的那一刻就报错，不用等到运行。
2. **IDE 重构可靠**：Rename、Extract Method 等重构操作能精确分析所有引用。
3. **性能更好**：JVM 知道每个变量的确切类型，可以生成优化的机器码。
4. **团队协作友好**：接口契约明确，大型团队不会因为"这个函数返回啥"而踩坑。

### 静态类型的代价

1. **代码啰嗦**：\`Map<String, List<Integer>> map = new HashMap<>();\` 比 \`map = {}\` 长得多。
2. **灵活性低**：想写一个"能接受任意类型"的函数，得用泛型或 Object。
3. **原型开发慢**：快速验证想法时，类型声明是负担。

## 四、强类型 vs 弱类型：都是强类型

很多人混淆"动态/静态"和"强/弱"。这是两个正交维度：

- **强/弱**：类型错误会不会被"悄悄"自动转换。
- **动态/静态**：类型检查在运行时还是编译期。

**Python 和 Java 都是强类型**。它们都不会把 \`"3" + 5\` 偷偷算成 \`8\` 或 \`"35"\`。

\`\`\`python
# Python：强类型，不偷偷转换
"3" + 5      # TypeError: can only concatenate str (not "int") to str
\`\`\`

\`\`\`java
// Java：强类型，编译就报错
String s = "3";
// int result = s + 5;  // 编译错误
int result = Integer.parseInt(s) + 5;  // 必须显式转换
\`\`\`

对比弱类型语言 JavaScript：

\`\`\`javascript
// JavaScript：弱类型，偷偷转换
"3" + 5    // "35"（字符串拼接）
"3" - 5    // -2（数值减法）
\`\`\`

Python 和 Java 都不会犯这种"看着像 bug 但其实是 feature"的错误。**强类型是好事**——它让你对自己的代码有信心。

| 语言 | 动态/静态 | 强/弱 | \`"3" + 5\` 结果 |
|------|----------|-------|----------------|
| Python | 动态 | 强 | TypeError |
| Java | 静态 | 强 | 编译错误 |
| JavaScript | 动态 | 弱 | "35" |
| C | 静态 | 弱 | 取决于上下文（可能溢出） |

## 五、类型检查时机：运行时 vs 编译期

Python 的类型检查发生在**运行时**。当执行到 \`x.foo()\` 这一行时，解释器才去看 \`x\` 指向的对象有没有 \`foo\` 方法。没有就抛 \`AttributeError\`。

\`\`\`python
def broken():
    return 42 + "hello"  # 这行不执行就不会报错

print("start")
# broken()  # 取消注释才会抛 TypeError
print("end")
\`\`\`

Java 的类型检查发生在**编译期**。javac 在生成字节码前就检查所有类型。

\`\`\`java
public class Broken {
    public static int broken() {
        // return 42 + "hello";  // 编译错误：不兼容的类型
        return 42;
    }
}
\`\`\`

这意味着 Java 的错误"更早暴露"——你写完代码点编译就知道了，不用等运行。但 Python 的好处是：**你可以写"暂时不正确"的代码**，只要那部分不被执行，程序就能跑。这在原型阶段很方便。

### 泛型擦除：Java 的运行时盲点

值得注意的是，Java 的泛型在运行时是**擦除**的（Type Erasure）。\`List<String>\` 和 \`List<Integer>\` 在运行时都是 \`List\`。

\`\`\`java
List<String> strings = new ArrayList<>();
List<Integer> numbers = new ArrayList<>();
// 编译期：strings 和 numbers 类型不同，不能互相赋值
// 运行时：都是 ArrayList，反射能绕过

// 通过反射可以"骗过"编译器
java.lang.reflect.Method add = ArrayList.class.getMethod("add", Object.class);
add.invoke(numbers, "oops");  // 运行时成功，但取出时 ClassCastException
\`\`\`

Python 没有这个问题——因为运行时才检查，根本没有"擦除"的概念。

## 六、类型推断：可选提示 vs 编译期推断

### Python：类型提示（可选）

Python 3.5+ 引入了类型提示（PEP 484），但**它是可选的、不强制、运行时不检查**。

\`\`\`python
def greet(name: str, times: int = 1) -> str:
    return ("Hello, " + name + "! ") * times

# 类型提示只是"建议"，运行时不检查
greet("Alice", 3)        # 合法
greet("Alice", "three")  # 也"合法"——运行时才报错（如果真的出错）
\`\`\`

你需要用 \`mypy\`、\`pyright\` 等静态检查工具来真正利用类型提示：

\`\`\`bash
# 用 mypy 检查
mypy my_script.py
# error: Argument 2 to "greet" has incompatible type "str"; expected "int"
\`\`\`

类型提示的价值在于：**文档化 + IDE 补全 + 可选的静态检查**。但它不会改变 Python 动态类型的本质。

\`\`\`python
from typing import List, Dict, Optional, Union

def process(items: List[int], config: Dict[str, str]) -> Optional[int]:
    if not items:
        return None
    return sum(items)

# 复杂类型
def parse(data: Union[str, bytes]) -> Dict[str, int]:
    ...
\`\`\`

### Java：var 与编译期推断

Java 10 引入了 \`var\`（局部变量类型推断），**编译期推断，本质还是静态类型**。

\`\`\`java
// Java 10+：var 让编译器推断类型
var list = new ArrayList<String>();   // 编译器推断为 ArrayList<String>
var map = new HashMap<String, Integer>();  // 推断为 HashMap<String, Integer>
var name = "Alice";  // 推断为 String

// 等价于
ArrayList<String> list2 = new ArrayList<>();
HashMap<String, Integer> map2 = new HashMap<>();
String name2 = "Alice";
\`\`\`

关键区别：

| 特性 | Python 类型提示 | Java var |
|------|----------------|----------|
| 强制性 | 可选 | 仅局部变量可用 |
| 检查时机 | 运行时（工具静态检查） | 编译期 |
| 改变语言本质 | 否（仍是动态） | 否（仍是静态） |
| 适用范围 | 函数签名、变量 | 仅局部变量 |

**var 不是动态类型**。它只是让你少写一遍类型名，类型本身在编译期就确定了，之后不能变。

\`\`\`java
var x = 42;     // x 推断为 int
// x = "hello"; // 编译错误：类型不匹配
\`\`\`

对比 Python：

\`\`\`python
x: int = 42     # 类型提示是 int
x = "hello"     # 完全合法！类型提示不限制运行时
\`\`\`

这就是本质区别：**Java 的 var 是"省略"，Python 的类型提示是"建议"**。

## 七、鸭子类型 vs 接口

### Python：鸭子类型

Python 的名言："如果它走起来像鸭子，叫起来像鸭子，那它就是鸭子。"

\`\`\`python
class Duck:
    def quack(self): print("Quack!")
    def walk(self): print("Waddle waddle")

class Person:
    def quack(self): print("I'm pretending to be a duck!")
    def walk(self): print("I'm walking like a duck")

def make_duck_sound(duck_like):
    duck_like.quack()  # 不关心类型，只关心有没有 quack 方法

make_duck_sound(Duck())    # Quack!
make_duck_sound(Person())  # I'm pretending to be a duck!
\`\`\`

\`make_duck_sound\` 不检查参数类型，只检查"有没有 quack 方法"。这就是**结构类型**的体现——类型由它的结构（方法/属性）决定，不由它的名字决定。

鸭子类型的优点：**灵活、解耦**。你不需要为了复用 \`make_duck_sound\` 而让 Person 继承 Duck。

鸭子类型的缺点：**错误延迟到运行时**。如果传入的对象没有 \`quack\`，运行时才报 \`AttributeError\`。

### Java：接口（名义类型）

Java 用**接口**实现多态。类型由"它声明实现了什么接口"决定，这是**名义类型**。

\`\`\`java
interface Quackable {
    void quack();
}

class Duck implements Quackable {
    public void quack() { System.out.println("Quack!"); }
}

class Person implements Quackable {
    public void quack() { System.out.println("I'm pretending..."); }
}

class Frog {  // 也有 quack 方法，但没实现 Quackable 接口
    public void quack() { System.out.println("Ribbit... I mean Quack!"); }
}

public class Main {
    static void makeSound(Quackable q) {  // 参数必须是 Quackable
        q.quack();
    }

    public static void main(String[] args) {
        makeSound(new Duck());    // OK
        makeSound(new Person());  // OK
        // makeSound(new Frog()); // 编译错误：Frog 不是 Quackable
    }
}
\`\`\`

即使 \`Frog\` 有 \`quack\` 方法，因为它没有 \`implements Quackable\`，编译器拒绝它。**Java 关心"你是谁"，不关心"你能做什么"**。

| 维度 | Python 鸭子类型 | Java 接口 |
|------|----------------|----------|
| 类型判断依据 | 结构（有没有方法） | 名义（有没有声明） |
| 错误暴露时机 | 运行时 | 编译期 |
| 灵活性 | 高 | 中 |
| 安全性 | 低 | 高 |
| 解耦程度 | 高（无需共同基类） | 中（需共同接口） |

### Python 也能用 ABC 模拟接口

如果你想要 Java 风格的"接口契约"，Python 可以用 \`abc.ABC\`：

\`\`\`python
from abc import ABC, abstractmethod

class Quackable(ABC):
    @abstractmethod
    def quack(self): pass

class Duck(Quackable):
    def quack(self): print("Quack!")

# Duck()  # 必须实现 quack 才能实例化，否则 TypeError
duck = Duck()
\`\`\`

但这是"可选的纪律"，不是强制的。

## 八、协变与逆变

这是类型系统的高级话题，但理解它能解释很多"为什么编译器拒绝我"。

**协变（Covariance）**：如果 \`Dog\` 是 \`Animal\` 的子类，那 \`List<Dog>\` 也是 \`List<Animal>\` 的子类吗？

**逆变（Contravariance）**：如果 \`Dog\` 是 \`Animal\` 的子类，那 \`Consumer<Animal>\` 是 \`Consumer<Dog>\` 的子类吗？

### Java 的协变逆变

Java 数组是**协变**的（这是个设计缺陷）：

\`\`\`java
Animal[] animals = new Dog[10];  // 合法！数组协变
animals[0] = new Cat();  // 运行时 ArrayStoreException！
\`\`\`

Java 泛型是**不变**的（为了安全）：

\`\`\`java
// List<Dog> dogs = new ArrayList<Animal>();  // 编译错误
// List<Animal> animals = new ArrayList<Dog>();  // 编译错误
\`\`\`

但可以用通配符：

\`\`\`java
// 协变：? extends
List<? extends Animal> animals = new ArrayList<Dog>();  // 合法
// animals.add(new Dog());  // 编译错误：不能写入（除了 null）

// 逆变：? super
List<? super Dog> dogs = new ArrayList<Animal>();  // 合法
dogs.add(new Dog());  // 合法：可以写入 Dog
// Dog d = dogs.get(0);  // 编译错误：不能读取为 Dog（只能读为 Object）
\`\`\`

这就是著名的 **PECS 原则**：Producer Extends, Consumer Super。

### Python 的协变逆变

Python 用 \`typing\` 模块标注协变逆变，但**运行时不检查**，靠 mypy 等工具：

\`\`\`python
from typing import TypeVar, Generic, List

T_co = TypeVar('T_co', covariant=True)        # 协变
T_contra = TypeVar('T_contra', contravariant=True)  # 逆变

class Producer(Generic[T_co]):       # 协变：Producer[Dog] 是 Producer[Animal] 子类
    def get(self) -> T_co: ...

class Consumer(Generic[T_contra]):   # 逆变：Consumer[Animal] 是 Consumer[Dog] 子类
    def put(self, item: T_contra) -> None: ...

# mypy 检查
def feed(consumer: Consumer[Dog]):
    consumer.put(Dog())

c: Consumer[Animal] = Consumer()
feed(c)  # 合法：Consumer[Animal] 是 Consumer[Dog] 的子类型（逆变）
\`\`\`

但记住，**Python 运行时不强制这些**。你完全可以传错类型，运行时才报错。这是 Python 类型系统的"软约束"本质。

## 九、空值与空安全

### Python：None 是对象

Python 的 \`None\` 是 \`NoneType\` 的唯一实例，它**是一个对象**。

\`\`\`python
x = None
print(type(x))      # <class 'NoneType'>
print(x is None)    # True

# None 没有属性，访问会报错
# x.foo()  # AttributeError: 'NoneType' object has no attribute 'foo'

# 但你可以给变量重新赋值
x = 42
print(x)  # 42
\`\`\`

### Java：null 是空引用

Java 的 \`null\` 是一个特殊的"空引用"，**它不属于任何类型**（除了 String s = null; 这种"可空引用"）。

\`\`\`java
String s = null;
// s.length();  // NullPointerException！
\`\`\`

Java 的 \`null\` 是著名的"十亿美元错误"（Tony Hoare 的自嘲）。它导致无数 NPE。

\`\`\`java
String name = getUserName();  // 可能返回 null
// 不检查就用，可能 NPE
if (name != null) {
    System.out.println(name.length());
}

// Java 8+ Optional 是补救方案
Optional<String> optName = getOptionalName();
optName.ifPresent(n -> System.out.println(n.length()));
\`\`\`

| 维度 | Python None | Java null |
|------|------------|-----------|
| 本质 | NoneType 的单例对象 | 空引用 |
| 类型 | 有类型（NoneType） | 无类型（任何引用都能为 null） |
| 访问属性 | AttributeError | NullPointerException |
| 空安全 | 无原生支持 | Optional（补救） |

Python 的好处是：\`None\` 是个"正常对象"，你可以用 \`is None\` 干净地判断。Java 的 \`null\` 可以赋给任何引用类型，到处都是 NPE 风险。

## 十、一句话总结

| 维度 | Python | Java |
|------|--------|------|
| 类型系统 | 动态、强类型、名义+鸭子 | 静态、强类型、名义 |
| 变量本质 | 标签（贴在对象上） | 容器（有固定类型） |
| 检查时机 | 运行时 | 编译期（泛型运行时擦除） |
| 类型推断 | 类型提示（可选、运行时不查） | var（编译期推断） |
| 多态机制 | 鸭子类型（结构） | 接口（名义） |
| 协变逆变 | typing 标注（软约束） | 通配符 PECS（硬约束） |
| 空值 | None（对象） | null（空引用） |

Python 用"运行时检查 + 可选提示"换取灵活性，适合原型、脚本、数据科学；Java 用"编译期检查 + 严格契约"换取安全性，适合大型工程、团队协作。**没有谁更好，只有谁更适合你的场景**。

---

> **下一章**：深入基础类型——Python 的任意精度 int vs Java 的 32 位 int，Python 的 Unicode str vs Java 的 String+char，以及 None 与 null 那些不得不说的故事。`,
  },
  {
    id: "pyvsjava-basic-types",
    icon: "🔢",
    title: "基础类型深度对比",
    group: "语法与类型",
    content: `# 基础类型深度对比

## 一、整数：任意精度 vs 固定宽度

### Python：任意精度 int

Python 的 \`int\` 是**任意精度**的。你想算多大就多大，永远不会溢出。

\`\`\`python
# Python：任意精度
big = 10 ** 100  # googol
print(big)
# 10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000

# 阶乘，毫无压力
import math
print(math.factorial(100))
# 93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000

# 位运算
print(2 ** 64)        # 18446744073709551616
print(2 ** 64 + 1)    # 18446744073709551617
\`\`\`

Python 的 \`int\` 内部用一个"数字数组"表示，自动扩展。代价是：**运算比固定宽度整数慢**。每次大数运算都要分配内存、处理进位。

### Java：固定宽度 int/long

Java 有多种整数类型，固定宽度：

| 类型 | 位数 | 范围 |
|------|------|------|
| byte | 8 | -128 到 127 |
| short | 16 | -32768 到 32767 |
| int | 32 | -2^31 到 2^31-1（约 ±21 亿） |
| long | 64 | -2^63 到 2^63-1（约 ±9.2 × 10^18） |

\`\`\`java
int a = 2147483647;  // int 最大值
a = a + 1;           // 溢出！变成 -2147483648
System.out.println(a);  // -2147483648

long big = 9223372036854775807L;  // long 最大值，注意 L 后缀
big = big + 1;        // 溢出！
System.out.println(big);  // -9223372036854775808
\`\`\`

**Java 的整数会溢出，而且静默溢出**——不报错，直接"环绕"。这是无数 bug 的根源。

\`\`\`java
// 经典溢出 bug
int factorial = 1;
for (int i = 1; i <= 20; i++) {
    factorial *= i;
    System.out.println(i + "! = " + factorial);
}
// 13! 开始溢出，结果变成错的
\`\`\`

如果需要任意精度，Java 用 \`BigInteger\`：

\`\`\`java
import java.math.BigInteger;

BigInteger big = new BigInteger("10").pow(100);
System.out.println(big);

BigInteger fact = BigInteger.ONE;
for (int i = 1; i <= 100; i++) {
    fact = fact.multiply(BigInteger.valueOf(i));
}
System.out.println(fact);
\`\`\`

注意 \`BigInteger\` 用方法调用（\`add\`、\`multiply\`），不能用 \`+\`、\`*\` 运算符。**Java 不支持运算符重载**，所以大数运算写起来很啰嗦。

| 维度 | Python int | Java int/long |
|------|-----------|---------------|
| 精度 | 任意 | 固定（32/64 位） |
| 溢出 | 不会 | 会（静默环绕） |
| 字面量 | 100, 0x64, 0b1100100 | 100, 100L, 0x64 |
| 大数运算 | 直接 \`+\` \`*\` | BigInteger + 方法调用 |
| 性能 | 较慢（动态） | 快（原生） |
| 下划线分隔 | 1_000_000 | 1_000_000（Java 7+） |

## 二、浮点数：统一 vs 分层

### Python：只有 float（双精度）

Python 只有一种浮点类型 \`float\`，**本质是 C 的 double**（64 位 IEEE 754）。

\`\`\`python
x = 3.14
y = 2.0
z = x + y
print(z)  # 5.140000000000001（浮点精度问题）

# 科学计数法
e = 1.5e10
print(e)  # 15000000000.0

# 浮点精度问题
print(0.1 + 0.2)  # 0.30000000000000004
print(0.1 + 0.2 == 0.3)  # False
\`\`\`

如果需要高精度，用 \`decimal\` 模块：

\`\`\`python
from decimal import Decimal, getcontext

getcontext().prec = 50
a = Decimal("0.1")
b = Decimal("0.2")
print(a + b)  # 0.3（精确）
print(a + b == Decimal("0.3"))  # True

# 适合财务计算
price = Decimal("19.99")
tax = Decimal("0.08")
total = price * (1 + tax)
print(total)  # 21.5892
\`\`\`

### Java：float 和 double

Java 有两种浮点：\`float\`（32 位）和 \`double\`（64 位）。

\`\`\`java
float f = 3.14f;   // 注意 f 后缀，float 是 32 位
double d = 3.14;   // 默认是 double，64 位

System.out.println(0.1 + 0.2);  // 0.30000000000000004
System.out.println(0.1 + 0.2 == 0.3);  // false

// 高精度用 BigDecimal
import java.math.BigDecimal;

BigDecimal a = new BigDecimal("0.1");
BigDecimal b = new BigDecimal("0.2");
System.out.println(a.add(b));  // 0.3
System.out.println(a.add(b).equals(new BigDecimal("0.3")));  // true

// 注意：用 String 构造，别用 double
BigDecimal wrong = new BigDecimal(0.1);  // 不精确！
BigDecimal right = new BigDecimal("0.1");  // 精确
\`\`\`

**重要陷阱**：\`new BigDecimal(0.1)\` 会引入 double 的精度误差，必须用 \`new BigDecimal("0.1")\`。这是 Java 财务代码的经典坑。

| 维度 | Python float | Java double |
|------|-------------|-------------|
| 精度 | 64 位（双精度） | 64 位（双精度） |
| 单精度 | 无（都是 double） | float（32 位） |
| 高精度 | decimal.Decimal | BigDecimal |
| 字面量 | 3.14, 1.5e10 | 3.14, 3.14f, 1.5e10 |

## 三、布尔类型：True/False vs true/false

### Python：bool 是 int 的子类

Python 的 \`bool\` 是 \`int\` 的子类！\`True == 1\`，\`False == 0\`。

\`\`\`python
print(True == 1)      # True
print(False == 0)     # True
print(True + True)    # 2（可以参与算术！）
print(sum([True, False, True, True]))  # 3

# 真值测试
if []: print("空列表是 False")  # 不会打印
if [0]: print("非空列表是 True")  # 会打印
if 0: print("0 是 False")  # 不会打印
if "": print("空字符串是 False")  # 不会打印
\`\`\`

Python 的"假值"包括：\`None\`、\`False\`、0、0.0、空字符串、空列表、空字典、空集合等。其他都是真值。

### Java：独立的 boolean

Java 的 \`boolean\` 是独立类型，**不能和整数互转**。

\`\`\`java
boolean b = true;
// int x = b;  // 编译错误：类型不兼容
// if (1) { }  // 编译错误：必须是 boolean

// 只能用 true/false
if (true) { System.out.println("yes"); }

// 真值测试：必须是布尔表达式
int count = 0;
// if (count) { }  // 编译错误
if (count != 0) { }  // 正确
\`\`\`

Java 的严格性避免了 \`if (x = 5)\` 这种 bug（赋值当判断），因为赋值结果是 int 不是 boolean。

| 维度 | Python bool | Java boolean |
|------|------------|--------------|
| 类型关系 | int 的子类 | 独立类型 |
| True/False | True/False（首字母大写） | true/false（小写） |
| 与整数互转 | 可以（True==1） | 不可以 |
| 真值测试 | 多种"假值" | 必须 boolean 表达式 |

## 四、字符串：统一 Unicode vs String+char

### Python：str 是不可变 Unicode

Python 3 的 \`str\` 是**不可变的 Unicode 序列**。没有"字符"类型，单个字符就是长度为 1 的字符串。

\`\`\`python
s = "Hello, 世界"
print(len(s))  # 8（按 Unicode 码点计）

# 不可变
# s[0] = "h"  # TypeError: 'str' object does not support item assignment

# 单字符就是字符串
c = "A"
print(type(c))  # <class 'str'>
print(c == "A")  # True

# Unicode 原生支持
emoji = "🎉🚀"
print(len(emoji))  # 2
print(emoji[0])    # 🎉

# 多种字符串
raw = r"C:\\Users\\name"  # 原始字符串
multi = """多行
字符串"""
fstr = f"Hello {s}"  # f-string
\`\`\`

Python 字符串的 \`len()\` 返回**字符数**（Unicode 码点数），不是字节数。

\`\`\`python
s = "中"
print(len(s))           # 1（一个字符）
print(len(s.encode()))  # 3（UTF-8 编码 3 字节）
\`\`\`

### Java：String 不可变 + char 基本类型

Java 的 \`String\` 也是不可变的，但它有独立的 \`char\` 类型（16 位 UTF-16 单元）。

\`\`\`java
String s = "Hello, 世界";
System.out.println(s.length());  // 8（UTF-16 单元数，多数情况等于字符数）

// char 是基本类型
char c = 'A';  // 单引号
System.out.println((int) c);  // 65
char chin = '中';
System.out.println((int) chin);  // 20013

// String 用双引号
String str = "A";

// 不可变
// s[0] = "h";  // String 没有这种语法
\`\`\`

**Java 的 char 陷阱**：因为 char 是 16 位，无法表示所有 Unicode（如 emoji 需要 surrogate pair）。

\`\`\`java
String emoji = "🎉";
System.out.println(emoji.length());  // 2！surrogate pair 占 2 个 char
System.out.println(emoji.codePointCount(0, emoji.length()));  // 1（真正的字符数）

char first = emoji.charAt(0);  // 是 surrogate 的一半，不是 emoji
\`\`\`

这是 Java 的历史包袱——Java 设计 char 时 Unicode 还只有 65536 个字符（BMP），后来扩展到 100 万+，char 就不够用了。Python 3 没有这个问题。

### 字符串拼接

\`\`\`python
# Python：多种方式
parts = ["Hello", "World"]
s = " ".join(parts)  # 推荐
s = "Hello" + " " + "World"
s = f"Hello World"
\`\`\`

\`\`\`java
// Java：StringBuilder 推荐（循环中）
StringBuilder sb = new StringBuilder();
for (String part : parts) {
    sb.append(part);
}
String result = sb.toString();

// 简单拼接
String s = "Hello" + " " + "World";

// Java 也支持类似 f-string 的格式化（Java 15+）
String name = "Alice";
String greeting = "Hello %s".formatted(name);
\`\`\`

| 维度 | Python str | Java String |
|------|-----------|-------------|
| 可变性 | 不可变 | 不可变 |
| 字符类型 | 无（单字符是 str） | char（16 位） |
| 长度含义 | Unicode 码点数 | UTF-16 单元数 |
| Unicode 支持 | 原生完整 | surrogate pair 处理麻烦 |
| 字面量 | "..." '...' """...""" | "..." |
| 字符字面量 | 无 | 'A' |

## 五、None vs null：对象 vs 空引用

这是两门语言最微妙的基础类型差异之一。

### Python：None 是对象

Python 的 \`None\` 是 \`NoneType\` 的唯一实例，**它是一个真正的对象**。

\`\`\`python
x = None
print(type(x))        # <class 'NoneType'>
print(x is None)      # True（用 is 判断，不用 ==）
print(None == None)   # True（但推荐用 is）

# None 有自己的方法吗？几乎没有
# None.foo()  # AttributeError

# None 可以放进容器
items = [1, None, "two", None, 3]
print(items.count(None))  # 2

# 函数默认返回 None
def do_nothing():
    pass
print(do_nothing())  # None
\`\`\`

\`None\` 用 \`is\` 判断而不是 \`==\`，因为 \`is\` 比较身份（是不是同一个对象），\`None\` 是单例。

### Java：null 是空引用

Java 的 \`null\` 是一个特殊的字面量，表示"不指向任何对象"。

\`\`\`java
String s = null;
System.out.println(s == null);  // true

// 任何引用类型都可以是 null
Integer x = null;
List<String> list = null;
Object o = null;

// 访问 null 的成员：NPE
// s.length();  // NullPointerException

// null 不能放进基本类型
// int i = null;  // 编译错误
int i = 0;  // 基本类型不能为 null
\`\`\`

Java 的 \`null\` 可以赋给任何引用类型，但**不能赋给基本类型**。这是基本类型和包装类型的差异之一。

| 维度 | Python None | Java null |
|------|------------|-----------|
| 本质 | NoneType 单例对象 | 空引用字面量 |
| 类型 | NoneType | 无类型（任何引用都可 null） |
| 判断 | \`is None\` | \`== null\` |
| 访问成员 | AttributeError | NullPointerException |
| 能否进容器 | 能 | 能（引用类型容器） |
| 基本类型 | 无此概念 | 基本类型不能为 null |

## 六、Java 基本类型 vs 包装类型

Java 独有的"基本类型 vs 包装类型"是 Python 没有的概念，这是 Java 性能与面向对象妥协的产物。

### 基本类型 vs 包装类型

\`\`\`java
// 基本类型（栈上，固定大小，默认值 0）
int a = 42;
boolean b = true;
char c = 'A';
double d = 3.14;

// 包装类型（堆上，对象，默认值 null）
Integer aObj = 42;      // 或 Integer.valueOf(42)
Boolean bObj = true;
Character cObj = 'A';
Double dObj = 3.14;

// 区别
int x = 0;
Integer y = null;  // 包装类型可以为 null

// 集合只能装包装类型
// List<int> list = new ArrayList<>();  // 编译错误
List<Integer> list = new ArrayList<>();  // 正确
\`\`\`

### 自动装箱拆箱

Java 5+ 引入自动装箱（autoboxing）和拆箱（unboxing）：

\`\`\`java
Integer a = 42;      // 自动装箱：int → Integer
int b = a;           // 自动拆箱：Integer → int

// 但有陷阱！
Integer x = 127;
Integer y = 127;
System.out.println(x == y);  // true（缓存了 -128 到 127）

Integer p = 128;
Integer q = 128;
System.out.println(p == q);  // false！超出缓存范围，是不同对象
System.out.println(p.equals(q));  // true（用 equals 比较）

// 拆箱 NPE
Integer n = null;
// int v = n;  // NullPointerException！自动拆箱 null
\`\`\`

**Integer 缓存陷阱**：\`Integer\` 缓存了 -128 到 127 的值，这个范围内 \`==\` 比较为 true，超出就 false。无数 bug 来自用 \`==\` 比较 Integer。

\`\`\`java
// 错误写法
if (a == b) { }  // 可能因缓存失效而 false

// 正确写法
if (a != null && a.equals(b)) { }
// 或用 Objects.equals
if (Objects.equals(a, b)) { }
\`\`\`

### Python 没有这个问题

Python 的 \`int\` 既是"基本"又是"对象"，统一处理，没有装箱拆箱：

\`\`\`python
a = 127
b = 127
print(a is b)  # True（小整数缓存）

p = 128
q = 128
print(p is q)  # True 或 False 取决于实现，但用 == 永远正确
print(p == q)  # True

# 但 Python 习惯用 == 比较值，用 is 比较身份
# 没有装箱拆箱的概念
\`\`\`

| 维度 | Python int | Java int/Integer |
|------|-----------|------------------|
| 统一性 | 统一（都是对象） | 分裂（基本 + 包装） |
| 装箱拆箱 | 无 | 有（自动） |
| 缓存范围 | -5 到 256（小整数） | -128 到 127（Integer） |
| 集合存储 | 直接存 | 必须用包装类型 |
| null 支持 | 无（用 None） | 包装类型可为 null |
| 性能 | 较慢 | 基本类型快，包装类型慢 |

## 七、类型转换

### Python：显式且简单

\`\`\`python
# 显式转换
s = "42"
n = int(s)       # 42
f = float(s)     # 42.0
b = bool(s)      # True（非空字符串为真）

n = 3.99
i = int(n)       # 3（截断，不是四舍五入）
s = str(n)       # "3.99"

# 字符串格式化
price = 19.99
print(f"价格: {price:.2f}")  # 价格: 19.99
\`\`\`

### Java：区分窄化与拓宽

\`\`\`java
// 拓宽转换（隐式，安全）
int i = 42;
long l = i;          // int → long，自动
double d = l;        // long → double，自动

// 窄化转换（显式，可能丢失）
double d = 3.99;
int i = (int) d;     // 3（截断）
long l = 1000000L;
short s = (short) l; // 可能溢出

// 字符串转数字
String str = "42";
int n = Integer.parseInt(str);     // 可能 NumberFormatException
double f = Double.parseDouble("3.14");

// 数字转字符串
String s1 = String.valueOf(42);
String s2 = Integer.toString(42);
String s3 = "" + 42;
\`\`\`

## 八、一句话总结

| 维度 | Python | Java |
|------|--------|------|
| 整数 | 任意精度 int | int/long 固定宽度 |
| 浮点 | float（64位）+ Decimal | float/double + BigDecimal |
| 布尔 | bool 是 int 子类 | 独立 boolean |
| 字符串 | str（Unicode，无 char） | String + char（UTF-16） |
| 空 | None（对象） | null（空引用） |
| 基本/包装 | 无此区分 | 基本类型 + 包装类型 + 装箱 |
| 溢出 | 不会 | 会（静默环绕） |
| 类型转换 | 显式简单 | 拓宽隐式/窄化显式 |

Python 的基础类型"统一而简单"，一个 \`int\` 包打天下；Java 的基础类型"分层而高效"，但带来装箱、溢出、char 编码等历史包袱。**简单 vs 高效，这是两门语言永恒的权衡**。

---

> **下一章**：进入容器与集合的世界——Python 的 list/dict/set 字面量 vs Java 的 ArrayList/HashMap/HashSet，以及列表推导式与 Stream API 的对决。`,
  },
  {
    id: "pyvsjava-collections",
    icon: "📚",
    title: "容器与集合",
    group: "语法与类型",
    content: `# 容器与集合

## 一、字面量语法：简洁 vs 工厂方法

这是 Python 和 Java 在日常编码中最直观的差异。Python 用**字面量**创建集合，Java 用**工厂方法**。

### Python：字面量

\`\`\`python
# 列表
fruits = ["apple", "banana", "cherry"]

# 字典
prices = {"apple": 5, "banana": 3, "cherry": 8}

# 集合
unique = {1, 2, 3, 3}  # {1, 2, 3}

# 元组
point = (3, 4)

# 空容器
empty_list = []
empty_dict = {}
empty_set = set()  # 注意：{} 是空 dict 不是空 set
empty_tuple = ()
\`\`\`

Python 的字面量极其简洁，一行搞定。这种简洁深刻影响了 Python 的代码风格——你随处可见内联的 \`[1, 2, 3]\` 和 \`{"key": "value"}\`。

### Java：工厂方法（Java 9+）

Java 9 之前，创建不可变集合很啰嗦：

\`\`\`java
// Java 8 及之前
List<String> fruits = new ArrayList<>();
fruits.add("apple");
fruits.add("banana");
fruits.add("cherry");

// 或者用 Arrays.asList（固定大小，可改元素不能增删）
List<String> fruits2 = Arrays.asList("apple", "banana", "cherry");

// 不可变
List<String> immutable = Collections.unmodifiableList(fruits);
\`\`\`

Java 9+ 引入了 \`List.of()\`、\`Set.of()\`、\`Map.of()\`：

\`\`\`java
// Java 9+：不可变集合
List<String> fruits = List.of("apple", "banana", "cherry");
Set<Integer> unique = Set.of(1, 2, 3);
Map<String, Integer> prices = Map.of("apple", 5, "banana", 3);

// 超过 10 对的 Map 用 Map.ofEntries
Map<String, Integer> big = Map.ofEntries(
    Map.entry("a", 1),
    Map.entry("b", 2),
    Map.entry("c", 3)
);

// 可变集合还是要 new
List<String> mutable = new ArrayList<>(List.of("a", "b", "c"));
\`\`\`

注意：\`List.of()\` 创建的是**不可变**集合，而 Python 的 \`[...]\` 创建的是**可变**列表。

| 维度 | Python 字面量 | Java 工厂方法 |
|------|-------------|--------------|
| 列表 | \`[1, 2, 3]\` | \`List.of(1, 2, 3)\` |
| 集合 | \`{1, 2, 3}\` | \`Set.of(1, 2, 3)\` |
| 字典 | \`{"a": 1}\` | \`Map.of("a", 1)\` |
| 默认可变性 | 可变 | 不可变 |
| 简洁度 | 极简 | 较繁 |

## 二、List vs ArrayList

### Python list

Python 的 \`list\` 是动态数组，类似 Java 的 \`ArrayList\`，但**能装任意类型**的元素。

\`\`\`python
fruits = ["apple", "banana", "cherry"]

# 访问
print(fruits[0])      # apple
print(fruits[-1])     # cherry（负索引）

# 切片
print(fruits[0:2])    # ['apple', 'banana']
print(fruits[::-1])   # 反转

# 增删
fruits.append("date")
fruits.insert(0, "apricot")
fruits.remove("banana")  # 按值删
popped = fruits.pop()     # 弹出末尾

# 查询
print(len(fruits))
print("apple" in fruits)
print(fruits.index("cherry"))  # 索引

# 混合类型（Python 特有）
mixed = [1, "two", 3.0, [4, 5]]
\`\`\`

### Java ArrayList

Java 的 \`ArrayList\` 只能装**指定类型**（泛型）。

\`\`\`java
import java.util.ArrayList;
import java.util.List;

List<String> fruits = new ArrayList<>();
fruits.add("apple");
fruits.add("banana");
fruits.add("cherry");

// 访问
System.out.println(fruits.get(0));  // apple
// fruits.get(-1);  // 越界异常，没有负索引

// 增删
fruits.add("date");
fruits.add(0, "apricot");
fruits.remove("banana");  // 按对象删
String popped = fruits.remove(fruits.size() - 1);  // 弹出末尾

// 查询
System.out.println(fruits.size());
System.out.println(fruits.contains("apple"));
System.out.println(fruits.indexOf("cherry"));

// 不能混合类型
// fruits.add(42);  // 编译错误
\`\`\`

| 操作 | Python list | Java ArrayList |
|------|-------------|----------------|
| 创建 | \`[]\` / \`list()\` | \`new ArrayList<>()\` |
| 访问 | \`lst[i]\` / \`lst[-1]\` | \`lst.get(i)\` |
| 切片 | \`lst[a:b]\` | \`subList(a, b)\` |
| 添加 | \`append()\` / \`insert()\` | \`add()\` |
| 删除 | \`remove()\` / \`pop()\` | \`remove()\` / \`remove(idx)\` |
| 长度 | \`len(lst)\` | \`lst.size()\` |
| 包含 | \`x in lst\` | \`lst.contains(x)\` |
| 混合类型 | 可以 | 不可以（泛型） |

### 不可变 List

\`\`\`python
# Python：tuple 是不可变序列
point = (3, 4)
# point[0] = 5  # TypeError

# 或者用 frozenset（但那是集合）
# 想要不可变 list，只能用 tuple 或第三方库
\`\`\`

\`\`\`java
// Java：List.of() 或 Collections.unmodifiableList
List<String> immutable = List.of("a", "b", "c");
// immutable.add("d");  // UnsupportedOperationException

List<String> mutable = new ArrayList<>(immutable);
mutable.add("d");  // OK
\`\`\`

## 三、Dict vs HashMap

### Python dict

Python 的 \`dict\` 是**有序**（3.7+ 保证插入顺序）的哈希表，键可以是任意可哈希类型。

\`\`\`python
prices = {"apple": 5, "banana": 3, "cherry": 8}

# 访问
print(prices["apple"])     # 5
print(prices.get("grape", 0))  # 0（不存在返回默认值）
# prices["grape"]  # KeyError（不存在抛异常）

# 增删改
prices["date"] = 6
prices["apple"] = 7
del prices["banana"]
prices.pop("cherry", None)

# 遍历
for key, value in prices.items():
    print(f"{key}: {value}")

# 字典推导式
squared = {k: v ** 2 for k, v in prices.items()}

# 键可以是任意可哈希类型
d = {1: "one", "two": 2, (3, 4): "point"}
# d = {[1, 2]: "list"}  # TypeError：list 不可哈希
\`\`\`

### Java HashMap

Java 的 \`HashMap\` **不保证顺序**（想有序用 \`LinkedHashMap\`），键必须是对象且正确实现了 \`hashCode\` 和 \`equals\`。

\`\`\`java
import java.util.HashMap;
import java.util.Map;

Map<String, Integer> prices = new HashMap<>();
prices.put("apple", 5);
prices.put("banana", 3);
prices.put("cherry", 8);

// 访问
System.out.println(prices.get("apple"));        // 5
System.out.println(prices.getOrDefault("grape", 0));  // 0

// 增删改
prices.put("date", 6);
prices.put("apple", 7);
prices.remove("banana");

// 遍历
for (Map.Entry<String, Integer> entry : prices.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}

// Java 8+ forEach
prices.forEach((k, v) -> System.out.println(k + ": " + v));

// 键必须是对象，且实现 hashCode/equals
Map<List<Integer>, String> map = new HashMap<>();  // List 可以，但 hashCode 是基于内容的
\`\`\`

**Java 的 LinkedHashMap**（有序）：

\`\`\`java
Map<String, Integer> ordered = new LinkedHashMap<>();
ordered.put("apple", 5);
ordered.put("banana", 3);
// 遍历时按插入顺序
\`\`\`

| 操作 | Python dict | Java HashMap |
|------|-------------|--------------|
| 创建 | \`{}\` / \`dict()\` | \`new HashMap<>()\` |
| 访问 | \`d[k]\` / \`d.get(k, default)\` | \`d.get(k)\` / \`getOrDefault(k, def)\` |
| 设置 | \`d[k] = v\` | \`d.put(k, v)\` |
| 删除 | \`del d[k]\` / \`d.pop(k)\` | \`d.remove(k)\` |
| 遍历 | \`for k, v in d.items()\` | \`for (Entry e : d.entrySet())\` |
| 有序性 | 3.7+ 保证插入顺序 | 不保证（用 LinkedHashMap） |
| 键类型 | 任意可哈希 | 任意对象（需 hashCode/equals） |

## 四、Set vs HashSet

### Python set

\`\`\`python
unique = {1, 2, 3, 3}  # {1, 2, 3}
unique.add(4)
unique.discard(10)  # 不存在不报错
# unique.remove(10)  # 不存在会 KeyError

# 集合运算
a = {1, 2, 3}
b = {2, 3, 4}
print(a | b)   # 并集 {1, 2, 3, 4}
print(a & b)   # 交集 {2, 3}
print(a - b)   # 差集 {1}
print(a ^ b)   # 对称差 {1, 4}

# 不可变集合
frozen = frozenset([1, 2, 3])
\`\`\`

### Java HashSet

\`\`\`java
import java.util.HashSet;
import java.util.Set;

Set<Integer> unique = new HashSet<>();
unique.add(1);
unique.add(2);
unique.add(3);
unique.add(3);  // 不会重复添加
unique.remove(10);  // 不存在不报错

// 集合运算（需手动实现或用 Guava）
Set<Integer> a = new HashSet<>(Set.of(1, 2, 3));
Set<Integer> b = new HashSet<>(Set.of(2, 3, 4));

// 并集
Set<Integer> union = new HashSet<>(a);
union.addAll(b);  // {1, 2, 3, 4}

// 交集
Set<Integer> inter = new HashSet<>(a);
inter.retainAll(b);  // {2, 3}

// 差集
Set<Integer> diff = new HashSet<>(a);
diff.removeAll(b);  // {1}
\`\`\`

Python 的集合运算符 \`| & - ^\` 比 Java 的 \`addAll/retainAll/removeAll\` 直观得多。这是 Python "应该有一种明显的方式"哲学的体现。

## 五、Tuple vs Java（无原生 tuple）

### Python tuple

Python 的 \`tuple\` 是不可变序列，用途广泛：

\`\`\`python
# 创建
point = (3, 4)
single = (42,)  # 单元素 tuple，注意逗号
empty = ()

# 解包
x, y = point
a, b, c = 1, 2, 3

# 多返回值
def min_max(lst):
    return min(lst), max(lst)

lo, hi = min_max([3, 1, 4, 1, 5])

# tuple 可以当 dict 的 key
locations = {(3, 4): "A", (5, 6): "B"}

# 命名元组
from collections import namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(p.x, p.y)  # 3 4
\`\`\`

### Java：没有原生 tuple

Java 没有原生的 tuple 类型。常见的替代方案：

\`\`\`java
// 1. 用数组（类型不安全）
Object[] tuple = {3, 4};
int x = (int) tuple[0];

// 2. 用 Record（Java 16+）
record Point(int x, int y) {}
Point p = new Point(3, 4);
System.out.println(p.x() + " " + p.y());

// 3. 用 Pair（Apache Commons 或 javafx）
// Pair<Integer, Integer> point = new Pair<>(3, 4);

// 4. 多返回值：用类或 Map
class MinMax {
    int min;
    int max;
    MinMax(int min, int max) { this.min = min; this.max = max; }
}

MinMax result = findMinMax(new int[]{3, 1, 4, 1, 5});
\`\`\`

Java 14+ 的 \`Record\` 是最接近 tuple 的方案，但它是**具名的**（每个字段有名字），比 Python tuple 更安全但更啰嗦。

## 六、可变 vs 不可变集合

### Python

\`\`\`python
# 可变
lst = [1, 2, 3]
dct = {"a": 1}
st = {1, 2, 3}

# 不可变
tpl = (1, 2, 3)
fst = frozenset({1, 2, 3})
# 不可变 dict 没有，但可以用 MappingProxyType
from types import MappingProxyType
d = {"a": 1}
read_only = MappingProxyType(d)
# read_only["b"] = 2  # TypeError
\`\`\`

### Java

\`\`\`java
// 不可变（Java 9+）
List<Integer> list = List.of(1, 2, 3);
Set<Integer> set = Set.of(1, 2, 3);
Map<String, Integer> map = Map.of("a", 1);

// 可变
List<Integer> mutable = new ArrayList<>(List.of(1, 2, 3));
Set<Integer> mutableSet = new HashSet<>(Set.of(1, 2, 3));

// 不可变包装
List<Integer> wrapped = Collections.unmodifiableList(mutable);
\`\`\`

Java 的默认 \`List.of()\` 是不可变的，这和 Python 相反——Python 字面量默认可变。

## 七、推导式 vs Stream API

### Python 推导式

Python 的**列表推导式**是处理集合的杀手锏，简洁强大：

\`\`\`python
# 列表推导式
squares = [x ** 2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
pairs = [(x, y) for x in range(3) for y in range(3) if x != y]

# 字典推导式
word_len = {w: len(w) for w in ["hello", "world"]}
# {'hello': 5, 'world': 5}

# 集合推导式
unique_lens = {len(w) for w in ["a", "bb", "ccc", "a"]}
# {1, 2, 3}

# 生成器表达式（惰性）
total = sum(x ** 2 for x in range(1000000))  # 不占内存
\`\`\`

Python 推导式的可读性极高，几乎像数学公式。这是 Python 的标志性特性。

### Java Stream API

Java 8+ 的 Stream API 是函数式风格的集合处理：

\`\`\`java
import java.util.stream.*;
import java.util.List;

// 列表推导式等价
List<Integer> squares = IntStream.range(0, 10)
    .map(x -> x * x)
    .boxed()
    .collect(Collectors.toList());

List<Integer> evens = IntStream.range(0, 20)
    .filter(x -> x % 2 == 0)
    .boxed()
    .collect(Collectors.toList());

// Map 推导式
Map<String, Integer> wordLen = Stream.of("hello", "world")
    .collect(Collectors.toMap(w -> w, String::length));

// Set 推导式
Set<Integer> uniqueLens = Stream.of("a", "bb", "ccc", "a")
    .map(String::length)
    .collect(Collectors.toSet());

// 生成器等价（惰性流）
int total = IntStream.range(0, 1000000)
    .map(x -> x * x)
    .sum();
\`\`\`

对比同样的"筛选并转换"任务：

\`\`\`python
# Python
result = [x.upper() for x in words if len(x) > 3]
\`\`\`

\`\`\`java
// Java
List<String> result = words.stream()
    .filter(w -> w.length() > 3)
    .map(String::toUpperCase)
    .collect(Collectors.toList());
\`\`\`

Java Stream 功能更强大（支持并行 \`parallelStream\`），但语法更啰嗦。Python 推导式更简洁，但功能稍弱（没有内置并行）。

| 维度 | Python 推导式 | Java Stream |
|------|-------------|-------------|
| 语法 | \`[f(x) for x in lst if cond]\` | \`stream().map().filter().collect()\` |
| 惰性 | 生成器表达式 | Stream 本身惰性 |
| 并行 | 不支持（手动） | \`parallelStream()\` |
| 可读性 | 极高 | 中等 |
| 输出类型 | 列表/字典/集合 | 需 collect 决定 |

## 八、排序对比

### Python 排序

\`\`\`python
# sorted 返回新列表
nums = [3, 1, 4, 1, 5, 9, 2, 6]
print(sorted(nums))              # [1, 1, 2, 3, 4, 5, 6, 9]
print(sorted(nums, reverse=True))  # 降序

# list.sort 原地排序
nums.sort()

# 按key排序
words = ["banana", "apple", "cherry"]
print(sorted(words, key=len))     # 按长度
print(sorted(words, key=str.lower))  # 忽略大小写

# 复杂排序
students = [("Alice", 85), ("Bob", 92), ("Charlie", 78)]
print(sorted(students, key=lambda s: s[1], reverse=True))
# [('Bob', 92), ('Alice', 85), ('Charlie', 78)]

# 多字段排序
sorted(students, key=lambda s: (-s[1], s[0]))  # 分数降序，姓名升序
\`\`\`

### Java 排序

\`\`\`java
import java.util.*;

List<Integer> nums = new ArrayList<>(List.of(3, 1, 4, 1, 5, 9, 2, 6));
nums.sort(Comparator.naturalOrder());  // 原地排序
nums.sort(Comparator.reverseOrder());  // 降序

List<Integer> sorted = nums.stream()
    .sorted()
    .collect(Collectors.toList());  // 新列表

// 按 key 排序
List<String> words = new ArrayList<>(List.of("banana", "apple", "cherry"));
words.sort(Comparator.comparingInt(String::length));  // 按长度
words.sort(String.CASE_INSENSITIVE_ORDER);  // 忽略大小写

// 复杂排序
record Student(String name, int score) {}
List<Student> students = List.of(
    new Student("Alice", 85),
    new Student("Bob", 92),
    new Student("Charlie", 78)
);
students.stream()
    .sorted(Comparator.comparingInt(Student::score).reversed())
    .forEach(System.out::println);

// 多字段排序
students.stream()
    .sorted(Comparator.comparingInt(Student::score).reversed()
        .thenComparing(Student::name))
    .collect(Collectors.toList());
\`\`\`

Python 的 \`key=lambda\` 比 Java 的 \`Comparator.comparing\` 简洁，特别是多字段排序时。

## 九、一句话总结

| 维度 | Python | Java |
|------|--------|------|
| 字面量 | \`[] {} {,}\` | \`List.of() Set.of() Map.of()\` |
| 默认可变性 | 可变 | 不可变（of 系列） |
| List | list | ArrayList |
| Dict | dict（有序） | HashMap（无序）/ LinkedHashMap |
| Set | set | HashSet |
| Tuple | tuple（原生） | Record（具名） |
| 推导式 | 列表/字典/集合推导式 | Stream API |
| 排序 | \`sorted(key=)\` | \`Comparator.comparing()\` |
| 集合运算 | \`| & - ^\` | addAll/retainAll/removeAll |

Python 的集合"简洁而统一"，字面量+推导式让数据处理如丝般顺滑；Java 的集合"严谨而分层"，泛型+不可变+Stream 让大型工程更安全。**简洁 vs 严谨，依然是永恒的权衡**。

---

> **下一章**：深入函数——Python 的一等公民函数 vs Java 的方法为主，Lambda、闭包、装饰器与注解的对决。`,
  },
  {
    id: "pyvsjava-functions",
    icon: "⚡",
    title: "函数：一等公民 vs 方法为主",
    group: "语法与类型",
    content: `# 函数：一等公民 vs 方法为主

## 一、函数的地位：一等公民 vs 必须依附类

这是 Python 和 Java 在函数设计上最根本的差异。

### Python：函数是一等公民

Python 的函数是**一等公民**（first-class citizen）：可以赋值给变量、作为参数传递、作为返回值、存进数据结构。函数本身就是对象。

\`\`\`python
# 函数是对象
def greet(name):
    return f"Hello, {name}!"

print(type(greet))    # <class 'function'>
print(greet)          # <function greet at 0x...>

# 赋值给变量
say_hello = greet
print(say_hello("Alice"))  # Hello, Alice!

# 存进列表
funcs = [greet, str.upper, len]
print(funcs[0]("Bob"))  # Hello, Bob!

# 作为参数
def apply(func, value):
    return func(value)

print(apply(greet, "Charlie"))  # Hello, Charlie!
print(apply(len, "hello"))      # 5
\`\`\`

Python 的函数可以**独立存在**，不需要依附任何类。这让函数式编程风格非常自然。

### Java：方法必须依附类

Java 的方法**必须定义在类里**，没有"独立函数"的概念。即使是 \`main\` 也要套在 \`class\` 里。

\`\`\`java
public class Utils {
    // 方法必须属于类
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }

    public static void main(String[] args) {
        System.out.println(greet("Alice"));

        // 方法引用：可以把方法当作函数式接口
        java.util.function.Function<String, String> greeter = Utils::greet;
        System.out.println(greeter.apply("Bob"));
    }
}
\`\`\`

Java 想把方法"当值"传递，必须借助**函数式接口**（Functional Interface）或 Lambda：

\`\`\`java
import java.util.function.Function;

public class Main {
    public static void main(String[] args) {
        // Lambda 赋值给 Function 接口
        Function<String, String> greet = name -> "Hello, " + name + "!";
        System.out.println(greet.apply("Alice"));

        // 存进列表
        java.util.List<Function<String, String>> funcs = java.util.List.of(
            greet,
            String::toUpperCase,
            s -> String.valueOf(s.length())
        );
        System.out.println(funcs.get(0).apply("Bob"));

        // 作为参数
        System.out.println(apply(greet, "Charlie"));
    }

    static String apply(Function<String, String> func, String value) {
        return func.apply(value);
    }
}
\`\`\`

| 维度 | Python 函数 | Java 方法 |
|------|-----------|----------|
| 独立性 | 可独立存在 | 必须在类里 |
| 一等公民 | 是 | 借助函数式接口 |
| 赋值给变量 | 直接 \`f = func\` | 需函数式接口 |
| 作为参数 | 直接传 | 需函数式接口/Lambda |
| 作为返回值 | 直接 return | 需函数式接口 |
| 类型 | function | 函数式接口类型 |

## 二、def vs 方法定义

### Python def

\`\`\`python
def add(a, b):
    """两数相加（文档字符串）"""
    return a + b

# 类型提示（可选）
def add_typed(a: int, b: int) -> int:
    return a + b

# 调用
print(add(1, 2))        # 位置参数
print(add(b=2, a=1))    # 关键字参数
\`\`\`

Python 的 \`def\` 简洁直接，参数可以有类型提示但不强制。

### Java 方法

\`\`\`java
public class Calculator {
    // 静态方法
    public static int add(int a, int b) {
        return a + b;
    }

    // 实例方法
    public int multiply(int a, int b) {
        return a * b;
    }

    public static void main(String[] args) {
        System.out.println(add(1, 2));  // 静态调用

        Calculator calc = new Calculator();
        System.out.println(calc.multiply(3, 4));  // 实例调用
    }
}
\`\`\`

Java 必须明确静态/实例方法，参数类型必须声明。

## 三、Lambda：单表达式 vs 函数式接口

### Python Lambda

Python 的 \`lambda\` 只能是**单个表达式**，不能有语句（不能赋值、不能 try/except）。

\`\`\`python
# 单表达式 lambda
add = lambda a, b: a + b
print(add(2, 3))  # 5

# 常用于排序、过滤等
students = [("Alice", 85), ("Bob", 92)]
students.sort(key=lambda s: s[1])

# 不能有语句
# lambda x: x += 1; return x  # 语法错误
\`\`\`

Python 的 lambda 受限较多，复杂逻辑应该用 \`def\`。Python 社区的共识是：**lambda 用于简单的内联回调，复杂逻辑用 def**。

### Java Lambda

Java 的 Lambda 可以是**表达式**也可以是**语句块**，且必须实现某个函数式接口。

\`\`\`java
import java.util.function.*;

// 表达式 Lambda
Function<Integer, Integer> square = x -> x * x;

// 语句块 Lambda（可以有复杂逻辑）
Function<Integer, Integer> complex = x -> {
    int result = x * 2;
    result += 10;
    return result;
};

// 多参数
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;

// 无参数
Supplier<String> greet = () -> "Hello!";

// 消费者
Consumer<String> printer = s -> System.out.println(s);

// 谓词
Predicate<Integer> isEven = x -> x % 2 == 0;

System.out.println(square.apply(5));  // 25
System.out.println(add.apply(2, 3));  // 5
\`\`\`

Java 的函数式接口种类繁多（\`Function\`、\`Consumer\`、\`Supplier\`、\`Predicate\`、\`BiFunction\` 等），每种有特定签名。这比 Python 的"任意函数"更啰嗦，但更类型安全。

| 维度 | Python lambda | Java Lambda |
|------|-------------|-------------|
| 语法 | \`lambda x: expr\` | \`(x) -> expr\` 或 \`(x) -> { stmts }\` |
| 函数体 | 单表达式 | 表达式或语句块 |
| 依赖 | 无 | 函数式接口 |
| 类型 | function | 函数式接口类型 |
| 复杂逻辑 | 不支持（用 def） | 支持（语句块） |

## 四、高阶函数：map/filter/reduce vs Stream

### Python 内置高阶函数

\`\`\`python
nums = [1, 2, 3, 4, 5]

# map
squares = list(map(lambda x: x ** 2, nums))
# [1, 4, 9, 16, 25]

# filter
evens = list(filter(lambda x: x % 2 == 0, nums))
# [2, 4]

# reduce（需导入）
from functools import reduce
total = reduce(lambda a, b: a + b, nums)
# 15

# 但 Python 社区更推荐推导式
squares = [x ** 2 for x in nums]
evens = [x for x in nums if x % 2 == 0]
total = sum(nums)
\`\`\`

Python 虽然有 \`map/filter/reduce\`，但社区更偏爱**推导式**——可读性更高。

### Java Stream API

\`\`\`java
import java.util.*;
import java.util.stream.*;

List<Integer> nums = List.of(1, 2, 3, 4, 5);

// map
List<Integer> squares = nums.stream()
    .map(x -> x * x)
    .collect(Collectors.toList());
// [1, 4, 9, 16, 25]

// filter
List<Integer> evens = nums.stream()
    .filter(x -> x % 2 == 0)
    .collect(Collectors.toList());
// [2, 4]

// reduce
int total = nums.stream()
    .reduce(0, Integer::sum);
// 15

// 链式操作
List<Integer> result = nums.stream()
    .filter(x -> x % 2 == 1)        // 奇数
    .map(x -> x * x)                // 平方
    .sorted()
    .collect(Collectors.toList());
// [1, 9, 25]

// 并行流
int parallelSum = nums.parallelStream()
    .mapToInt(Integer::intValue)
    .sum();
\`\`\`

Java Stream 的优势是**链式调用**和**并行**（\`parallelStream\`），但语法比 Python 推导式啰嗦。

## 五、闭包对比

### Python 闭包

Python 闭包**捕获变量本身**（按引用），可以修改外层变量。

\`\`\`python
def make_counter():
    count = 0
    def increment():
        nonlocal count  # 用 nonlocal 修改外层变量
        count += 1
        return count
    return increment

counter = make_counter()
print(counter())  # 1
print(counter())  # 2
print(counter())  # 3
\`\`\`

Python 闭包捕获的是**变量引用**，所以可以"记住"状态。这是 Python 装饰器能工作的基础。

**陷阱**：在循环里创建闭包，所有闭包共享同一个变量：

\`\`\`python
funcs = []
for i in range(3):
    funcs.append(lambda: i)  # 所有 lambda 都引用同一个 i
print([f() for f in funcs])  # [2, 2, 2]！不是 [0, 1, 2]

# 修复：用默认参数捕获当前值
funcs = [lambda i=i: i for i in range(3)]
print([f() for f in funcs])  # [0, 1, 2]
\`\`\`

### Java 闭包

Java 闭包要求捕获的变量是 **effectively final**（事实上的 final，不能修改）。

\`\`\`java
import java.util.function.Supplier;
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        // 简单闭包
        String prefix = "Hello, ";
        Supplier<String> greeter = () -> prefix + "World!";
        System.out.println(greeter.get());

        // 闭包不能修改外层变量
        // int count = 0;
        // Runnable inc = () -> count++;  // 编译错误：count 必须 final

        // 用数组或对象绕过
        int[] count = {0};
        Supplier<Integer> counter = () -> {
            count[0]++;
            return count[0];
        };
        System.out.println(counter.get());  // 1
        System.out.println(counter.get());  // 2

        // 循环闭包没有 Python 那个问题（每次循环变量是 effectively final）
        List<Supplier<Integer>> funcs = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            final int fi = i;  // 必须捕获副本
            funcs.add(() -> fi);
        }
        for (Supplier<Integer> f : funcs) {
            System.out.println(f.get());  // 0, 1, 2
        }
    }
}
\`\`\`

Java 的 \`effectively final\` 限制是为了避免并发问题和代码可读性。它让你**无法**写出 Python 那种"共享变量"的闭包，但也少了灵活性。

| 维度 | Python 闭包 | Java 闭包 |
|------|-----------|----------|
| 捕获方式 | 变量引用 | effectively final 副本 |
| 修改外层变量 | 可以（nonlocal） | 不可以 |
| 循环闭包 | 共享变量陷阱 | 必须显式捕获副本 |
| 状态保持 | 容易（直接 nonlocal） | 需用数组/对象绕过 |

## 六、默认参数 vs 重载/Builder

### Python 默认参数

Python 原生支持默认参数：

\`\`\`python
def greet(name, greeting="Hello", punctuation="!"):
    return f"{greeting}, {name}{punctuation}"

print(greet("Alice"))                      # Hello, Alice!
print(greet("Bob", "Hi"))                  # Hi, Bob!
print(greet("Charlie", punctuation="."))   # Hello, Charlie.
print(greet("Dave", greeting="Hey"))       # Hey, Dave!
\`\`\`

**陷阱**：默认参数只计算一次！

\`\`\`python
# 危险：可变默认参数
def add_item(item, lst=[]):  # 错误！
    lst.append(item)
    return lst

print(add_item(1))  # [1]
print(add_item(2))  # [1, 2]！不是 [2]

# 正确：用 None
def add_item_safe(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst
\`\`\`

### Java：无默认参数

Java **没有默认参数**，用方法重载或 Builder 模式替代。

\`\`\`java
// 方法重载
public class Greeter {
    public String greet(String name) {
        return greet(name, "Hello", "!");
    }
    public String greet(String name, String greeting) {
        return greet(name, greeting, "!");
    }
    public String greet(String name, String greeting, String punctuation) {
        return greeting + ", " + name + punctuation;
    }
}

// Builder 模式（参数多时）
public class GreetingBuilder {
    private String name;
    private String greeting = "Hello";
    private String punctuation = "!";

    public GreetingBuilder name(String name) { this.name = name; return this; }
    public GreetingBuilder greeting(String g) { this.greeting = g; return this; }
    public GreetingBuilder punctuation(String p) { this.punctuation = p; return this; }

    public String build() {
        return greeting + ", " + name + punctuation;
    }
}

// 使用
String msg = new GreetingBuilder()
    .name("Alice")
    .greeting("Hi")
    .build();
\`\`\`

方法重载在参数组合多时会产生"组合爆炸"（3 个可选参数 = 8 个重载）。Builder 模式更优雅但代码量大。

## 七、可变参数 *args/**kwargs vs varargs

### Python *args 和 **kwargs

Python 的可变参数极其灵活：

\`\`\`python
def func(*args, **kwargs):
    print(f"位置参数: {args}")    # tuple
    print(f"关键字参数: {kwargs}")  # dict

func(1, 2, 3, name="Alice", age=30)
# 位置参数: (1, 2, 3)
# 关键字参数: {'name': 'Alice', 'age': 30}

# 实际应用：灵活的函数签名
def connect(host, port=80, **options):
    timeout = options.get("timeout", 30)
    retry = options.get("retry", 3)
    print(f"{host}:{port} timeout={timeout} retry={retry}")

connect("example.com", timeout=60, retry=5)

# 解包调用
config = {"host": "example.com", "port": 8080, "timeout": 60}
connect(**config)
\`\`\`

\`*args\` 收集额外位置参数为 tuple，\`**kwargs\` 收集额外关键字参数为 dict。这让 Python 函数能设计出极其灵活的接口。

### Java varargs

Java 只有 varargs（可变位置参数），没有 \`**kwargs\` 等价物。

\`\`\`java
public class Utils {
    // varargs：本质是数组
    public static int sum(int... nums) {
        int total = 0;
        for (int n : nums) total += n;
        return total;
    }

    public static void main(String[] args) {
        System.out.println(sum(1, 2, 3));       // 6
        System.out.println(sum(1, 2, 3, 4, 5)); // 15

        // 传数组
        int[] arr = {1, 2, 3};
        System.out.println(sum(arr));  // 6
    }
}

// 想要 kwargs 效果，用 Map 或 Builder
public static void connect(String host, int port, Map<String, Object> options) {
    int timeout = (int) options.getOrDefault("timeout", 30);
    int retry = (int) options.getOrDefault("retry", 3);
    System.out.println(host + ":" + port + " timeout=" + timeout);
}
\`\`\`

Java varargs 只能放在参数列表最后，且类型固定。Python 的 \`**kwargs\` 让函数接口设计自由得多。

| 维度 | Python | Java |
|------|--------|------|
| 可变位置参数 | \`*args\`（tuple） | \`Type... args\`（数组） |
| 可变关键字参数 | \`**kwargs\`（dict） | 无（用 Map 替代） |
| 类型安全 | 弱（动态） | 强（固定类型） |
| 灵活性 | 极高 | 中等 |

## 八、装饰器 vs 注解 + AOP

### Python 装饰器

Python 的装饰器是**高阶函数**，直接修改/增强函数行为，**运行时生效**。

\`\`\`python
import time
from functools import wraps

# 计时装饰器
def timing(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} 耗时 {time.time() - start:.4f}s")
        return result
    return wrapper

@timing
def slow_function():
    time.sleep(1)
    return "done"

slow_function()
# slow_function 耗时 1.0012s

# 等价于
# slow_function = timing(slow_function)

# 带参数的装饰器
def repeat(times):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"Hello, {name}")

greet("Alice")  # 打印 3 次
\`\`\`

Python 装饰器**强大且直观**——它就是普通的函数，能做任何事。

### Java 注解 + AOP

Java 的注解本身**只是元数据**，不直接改变行为。要实现装饰器效果，需要：

1. **注解 + 反射**（自己处理）
2. **AOP 框架**（如 Spring AOP）
3. **代码生成**（如 Lombok）

\`\`\`java
import java.lang.annotation.*;
import java.lang.reflect.*;

// 定义注解
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Timing {
}

// 用反射处理
class Service {
    @Timing
    public void slowMethod() throws InterruptedException {
        Thread.sleep(1000);
        System.out.println("done");
    }
}

public class Main {
    public static void main(String[] args) throws Exception {
        Service service = new Service();
        for (Method m : Service.class.getDeclaredMethods()) {
            if (m.isAnnotationPresent(Timing.class)) {
                long start = System.currentTimeMillis();
                m.invoke(service);
                System.out.println(m.getName() + " 耗时 " + (System.currentTimeMillis() - start) + "ms");
            }
        }
    }
}
\`\`\`

Spring AOP 的方式（伪代码）：

\`\`\`java
@Aspect
@Component
public class TimingAspect {
    @Around("@annotation(Timing)")
    public Object time(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = pjp.proceed();
        System.out.println(pjp.getSignature() + " 耗时 " + (System.currentTimeMillis() - start) + "ms");
        return result;
    }
}

@Service
class MyService {
    @Timing
    public void doWork() { ... }
}
\`\`\`

| 维度 | Python 装饰器 | Java 注解 + AOP |
|------|-------------|----------------|
| 本质 | 高阶函数 | 元数据 + 处理框架 |
| 生效时机 | 运行时（直接） | 需框架/反射处理 |
| 灵活性 | 极高 | 中等（受框架约束） |
| 学习成本 | 低 | 高（需懂 AOP） |
| 应用场景 | 通用 | 主要在企业框架 |

## 九、一句话总结

| 维度 | Python | Java |
|------|--------|------|
| 函数地位 | 一等公民 | 必须依附类 |
| Lambda | 单表达式 | 函数式接口（可语句块） |
| 高阶函数 | map/filter/reduce + 推导式 | Stream API |
| 闭包 | 捕获变量引用（可改） | effectively final（不可改） |
| 默认参数 | 原生支持 | 重载/Builder 替代 |
| 可变参数 | *args + **kwargs | varargs（仅位置） |
| 装饰器 | 高阶函数，直观强大 | 注解 + AOP，需框架 |

Python 的函数设计"灵活而强大"，一等公民+装饰器+kwargs 让函数式编程如鱼得水；Java 的函数设计"严谨而受限"，函数式接口+effectively final 让大型工程的函数式代码更安全。**灵活 vs 受限，依然是两门语言的核心权衡**。

---

> **下一章**：进入类与面向对象——Python 的 class vs Java 的 class，self vs this，@property vs getter/setter，dataclass vs Record 的全面对决。`,
  },
  {
    id: "pyvsjava-oop",
    icon: "🏛️",
    title: "类与面向对象",
    group: "语法与类型",
    content: `# 类与面向对象

## 一、类定义语法：简洁 vs 严谨

### Python 类定义

Python 的类定义极其简洁：

\`\`\`python
class Dog:
    # 类变量
    species = "Canis familiaris"

    # 构造器
    def __init__(self, name, age):
        self.name = name  # 实例变量
        self.age = age

    # 实例方法
    def bark(self):
        return f"{self.name} says Woof!"

    # 字符串表示
    def __str__(self):
        return f"Dog(name={self.name}, age={self.age})"

# 使用
dog = Dog("Buddy", 3)
print(dog.bark())  # Buddy says Woof!
print(dog)         # Dog(name=Buddy, age=3)
\`\`\`

Python 不需要声明字段类型，\`self.xxx = xxx\` 直接在 \`__init__\` 里创建实例变量。

### Java 类定义

Java 的类定义更严谨、更啰嗦：

\`\`\`java
public class Dog {
    // 类变量（静态）
    public static String species = "Canis familiaris";

    // 实例变量（字段，需声明类型）
    private String name;
    private int age;

    // 构造器
    public Dog(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // 实例方法
    public String bark() {
        return name + " says Woof!";
    }

    // 字符串表示
    @Override
    public String toString() {
        return "Dog(name=" + name + ", age=" + age + ")";
    }

    public static void main(String[] args) {
        Dog dog = new Dog("Buddy", 3);
        System.out.println(dog.bark());
        System.out.println(dog);
    }
}
\`\`\`

Java 必须显式声明字段类型、访问修饰符、构造器。代码量是 Python 的 2-3 倍。

| 维度 | Python | Java |
|------|--------|------|
| 字段声明 | 不需要（赋值即创建） | 必须显式声明类型 |
| 访问修饰符 | 约定（_name） | 关键字（private/public） |
| 构造器 | \`__init__\` | 与类同名 |
| this/self | self（显式） | this（可省略） |
| 分号 | 不需要 | 必须 |

## 二、构造函数：__init__ vs 构造器

### Python __init__

Python 的 \`__init__\` 是**初始化方法**，不是真正的构造器（真正的构造是 \`__new__\`）。

\`\`\`python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(3, 4)
print(p.x, p.y)  # 3 4

# Python 没有方法重载，多个构造器用类方法模拟
class Point2:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    @classmethod
    def from_tuple(cls, t):
        return cls(t[0], t[1])

    @classmethod
    def origin(cls):
        return cls(0, 0)

p1 = Point2(1, 2)
p2 = Point2.from_tuple((3, 4))
p3 = Point2.origin()
\`\`\`

### Java 构造器

Java 支持构造器重载，多个构造器之间可以用 \`this()\` 调用：

\`\`\`java
public class Point {
    private int x;
    private int y;

    // 主构造器
    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    // 重载：从另一个 Point 构造
    public Point(Point other) {
        this(other.x, other.y);
    }

    // 重载：原点
    public Point() {
        this(0, 0);
    }

    public static void main(String[] args) {
        Point p1 = new Point(1, 2);
        Point p2 = new Point(p1);
        Point p3 = new Point();
    }
}
\`\`\`

Java 的构造器重载比 Python 的"类方法模拟"更自然。

## 三、self vs this：显式 vs 隐式

### Python self

Python **必须显式写出 self**，作为实例方法的第一个参数：

\`\`\`python
class Counter:
    def __init__(self):
        self.count = 0

    def increment(self):
        self.count += 1

    def get(self):
        return self.count

c = Counter()
c.increment()
print(c.get())  # 1

# self 只是约定，可以改名（但不推荐）
class Weird:
    def __init__(this, x):
        this.x = x
\`\`\`

\`self\` 让代码"显式优于隐式"——你永远知道方法属于谁。但写起来啰嗦。

### Java this

Java 的 \`this\` 是**隐式**的，可以省略：

\`\`\`java
public class Counter {
    private int count;

    public Counter() {
        this.count = 0;  // this 可省略，但参数同名时必须写
    }

    public void increment() {
        count++;  // 等价于 this.count++
    }

    public int get() {
        return count;
    }

    // this 用于区分参数和字段
    public void setCount(int count) {
        this.count = count;  // this.count 是字段，count 是参数
    }
}
\`\`\`

Java 的 \`this\` 在参数和字段同名时必须写，其他情况可省略。

| 维度 | Python self | Java this |
|------|-----------|-----------|
| 必要性 | 必须（第一个参数） | 可选 |
| 调用时 | 不传（自动绑定） | 不传（自动绑定） |
| 显式性 | 显式 | 隐式 |
| 哲学 | 显式优于隐式 | 简洁优于啰嗦 |

## 四、访问控制：约定 vs 关键字

### Python 约定

Python 没有真正的访问控制，靠**命名约定**：

\`\`\`python
class Account:
    def __init__(self, balance):
        self.balance = balance      # 公开
        self._internal = "secret"   # 约定：保护（单下划线）
        self.__private = "top secret"  # 名称改写：私有（双下划线）

    def __private_method(self):
        print("private")

acc = Account(100)
print(acc.balance)        # 100
print(acc._internal)      # 能访问，但"约定"不应访问
# print(acc.__private)    # AttributeError
print(acc._Account__private)  # 仍能访问（名称改写后）
\`\`\`

Python 的哲学是"**大家都是成年人**"——约定就够了，不强制。双下划线只是"名称改写"（name mangling），不是真正的私有。

### Java 关键字

Java 有严格的访问控制关键字：

\`\`\`java
public class Account {
    public double balance;          // 公开
    protected double internal;      // 受保护（子类 + 同包）
    double packagePrivate;          // 包级私有（默认，同包）
    private double secret;          // 私有（仅本类）

    private void privateMethod() {
        System.out.println("private");
    }

    // 通常用 getter/setter 控制访问
    public double getSecret() {
        return secret;
    }
    public void setSecret(double s) {
        if (s >= 0) this.secret = s;
    }
}
\`\`\`

Java 的访问控制是**编译期强制**的，违反会编译错误。

| 修饰符 | Python | Java |
|--------|--------|------|
| 公开 | 默认（无前缀） | public |
| 保护 | _name（约定） | protected |
| 包级 | 无 | 默认（无修饰符） |
| 私有 | __name（名称改写） | private |
| 强制性 | 约定 | 编译期强制 |

## 五、属性：@property vs getter/setter

### Python @property

Python 用 \`@property\` 装饰器实现"受控访问"：

\`\`\`python
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("半径不能为负")
        self._radius = value

    @property
    def area(self):
        return 3.14 * self._radius ** 2

c = Circle(5)
print(c.radius)  # 5（像字段一样访问）
c.radius = 10    # 调用 setter
# c.radius = -1  # ValueError
print(c.area)    # 314.0（计算属性）
\`\`\`

\`@property\` 让你**像访问字段一样访问方法**，调用者无需关心是字段还是计算属性。

### Java getter/setter

Java 的标准做法是显式的 getter/setter：

\`\`\`java
public class Circle {
    private double radius;

    public Circle(double radius) {
        setRadius(radius);
    }

    public double getRadius() {
        return radius;
    }

    public void setRadius(double value) {
        if (value < 0) throw new IllegalArgumentException("半径不能为负");
        this.radius = value;
    }

    public double getArea() {
        return 3.14 * radius * radius;
    }

    public static void main(String[] args) {
        Circle c = new Circle(5);
        System.out.println(c.getRadius());  // 必须调用 getter
        c.setRadius(10);
        System.out.println(c.getArea());
    }
}
\`\`\`

Java 的 getter/setter 更显式但更啰嗦。Lombok 的 \`@Getter @Setter\` 注解可以自动生成，但本质还是 getter/setter。

## 六、静态方法和类方法

### Python

\`\`\`python
class MathUtils:
    pi = 3.14159

    # 实例方法
    def instance_method(self):
        return self.pi

    # 类方法：第一个参数是类
    @classmethod
    def class_method(cls):
        return cls.pi

    # 静态方法：无 self 无 cls
    @staticmethod
    def static_method(x, y):
        return x + y

# 调用
print(MathUtils.class_method())      # 3.14159
print(MathUtils.static_method(2, 3)) # 5

m = MathUtils()
print(m.instance_method())  # 3.14159
\`\`\`

Python 区分**实例方法**（self）、**类方法**（cls）、**静态方法**（无）。类方法常用于替代构造器。

### Java

\`\`\`java
public class MathUtils {
    public static double PI = 3.14159;

    // 实例方法
    public double instanceMethod() {
        return PI;
    }

    // 静态方法
    public static int staticMethod(int x, int y) {
        return x + y;
    }

    public static void main(String[] args) {
        System.out.println(MathUtils.staticMethod(2, 3));  // 5
        System.out.println(MathUtils.PI);

        MathUtils m = new MathUtils();
        System.out.println(m.instanceMethod());
    }
}
\`\`\`

Java 只有**实例方法**和**静态方法**（static），没有"类方法"概念。工厂方法通常就是静态方法。

| 维度 | Python | Java |
|------|--------|------|
| 实例方法 | def method(self) | public void method() |
| 类方法 | @classmethod def method(cls) | 无（用 static） |
| 静态方法 | @staticmethod def method() | public static void method() |

## 七、魔法方法 vs toString/equals/hashCode

### Python 算术与比较魔法方法

\`\`\`python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    # 字符串表示
    def __str__(self):
        return f"Vector({self.x}, {self.y})"

    def __repr__(self):
        return f"Vector({self.x!r}, {self.y!r})"

    # 运算符重载
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def __hash__(self):
        return hash((self.x, self.y))

    def __len__(self):
        return int((self.x ** 2 + self.y ** 2) ** 0.5)

    def __getitem__(self, i):
        return (self.x, self.y)[i]

v1 = Vector(1, 2)
v2 = Vector(3, 4)
v3 = v1 + v2  # Vector(4, 6)
print(v1 == Vector(1, 2))  # True
print(len(v1))  # 2
\`\`\`

Python 通过 \`__xxx__\` 魔法方法支持运算符重载、迭代、上下文管理等，极其灵活。

### Java toString/equals/hashCode

Java 不能重载运算符（除了 String 的 +），但有标准方法：

\`\`\`java
import java.util.Objects;

public class Vector {
    private final double x;
    private final double y;

    public Vector(double x, double y) {
        this.x = x;
        this.y = y;
    }

    // 字符串表示
    @Override
    public String toString() {
        return "Vector(" + x + ", " + y + ")";
    }

    // 相等性
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Vector v = (Vector) o;
        return Double.compare(v.x, x) == 0 && Double.compare(v.y, y) == 0;
    }

    // 哈希
    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }

    // 不能重载 + 运算符，必须用方法
    public Vector add(Vector other) {
        return new Vector(x + other.x, y + other.y);
    }

    public static void main(String[] args) {
        Vector v1 = new Vector(1, 2);
        Vector v2 = new Vector(3, 4);
        Vector v3 = v1.add(v2);  // 不能写 v1 + v2
        System.out.println(v1.equals(new Vector(1, 2)));  // true
    }
}
\`\`\`

Java 的 \`equals\` 必须处理 null、类型检查、转型，比 Python 的 \`__eq__\` 啰嗦。但 IDE 能自动生成。

| 操作 | Python | Java |
|------|--------|------|
| 字符串 | \`__str__\` / \`__repr__\` | toString() |
| 相等 | \`__eq__\` | equals(Object) |
| 哈希 | \`__hash__\` | hashCode() |
| 加法 | \`__add__\` | add() 方法（不能重载+） |
| 长度 | \`__len__\` | size() / length() |
| 索引 | \`__getitem__\` | get(i) 方法 |

## 八、dataclass vs Record

### Python dataclass

Python 3.7+ 的 \`@dataclass\` 自动生成 \`__init__\`、\`__repr__\`、\`__eq__\` 等：

\`\`\`python
from dataclasses import dataclass, field

@dataclass
class Point:
    x: int
    y: int
    tags: list = field(default_factory=list)

p1 = Point(1, 2)
p2 = Point(1, 2)
print(p1)         # Point(x=1, y=2, tags=[])
print(p1 == p2)   # True（自动生成 __eq__）

# 可变（默认）
p1.x = 10

# 不可变
@dataclass(frozen=True)
class ImmutablePoint:
    x: int
    y: int
# ImmutablePoint(1, 2).x = 10  # FrozenInstanceError
\`\`\`

dataclass 还支持默认值、默认工厂、字段定制等，非常灵活。

### Java Record

Java 16+ 的 \`Record\` 是不可变的数据载体：

\`\`\`java
public record Point(int x, int y) {}

// 自动生成：构造器、accessor(x()、y())、equals、hashCode、toString
Point p1 = new Point(1, 2);
Point p2 = new Point(1, 2);
System.out.println(p1);          // Point[x=1, y=2]
System.out.println(p1.equals(p2));  // true
System.out.println(p1.x());      // 1（accessor，不是 getX()）

// Record 不可变
// p1.x = 10;  // 编译错误：没有 setter

// 紧凑构造器（验证）
public record PositivePoint(int x, int y) {
    public PositivePoint {
        if (x < 0 || y < 0) throw new IllegalArgumentException();
    }
}
\`\`\`

| 维度 | Python dataclass | Java Record |
|------|-----------------|-------------|
| 可变性 | 默认可变，可 frozen | 不可变 |
| 默认生成 | __init__/__repr__/__eq__ | 构造器/equals/hashCode/toString |
| 字段访问 | \`p.x\` | \`p.x()\`（accessor） |
| 继承 | 支持 | 不支持 |
| 灵活性 | 高（field 定制） | 低（设计为不可变载体） |

## 九、抽象类与接口

### Python ABC

Python 用 \`abc.ABC\` 定义抽象基类：

\`\`\`python
from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def speak(self):
        pass

    @abstractmethod
    def move(self):
        pass

    # 可以有具体方法
    def describe(self):
        print(f"I am a {type(self).__name__}")

class Dog(Animal):
    def speak(self):
        return "Woof!"
    def move(self):
        return "Running"

# animal = Animal()  # TypeError: 抽象类不能实例化
dog = Dog()
dog.describe()  # I am a Dog
\`\`\`

Python 没有原生的"接口"关键字，用 ABC 模拟。ABC 可以有具体方法，也可以全是抽象方法。

### Java abstract class 和 interface

Java 有 \`abstract class\` 和 \`interface\` 两种：

\`\`\`java
// 抽象类：可以有字段、构造器、具体方法
public abstract class Animal {
    protected String name;

    public Animal(String name) {
        this.name = name;
    }

    public abstract String speak();  // 抽象方法
    public abstract String move();

    public void describe() {  // 具体方法
        System.out.println("I am a " + this.getClass().getSimpleName());
    }
}

// 接口：纯契约（Java 8+ 可以有 default/static 方法）
public interface Movable {
    String move();
    default void startMoving() {  // default 方法
        System.out.println("Starting to move: " + move());
    }
}

// 类继承抽象类，实现接口
public class Dog extends Animal implements Movable {
    public Dog() { super("Dog"); }

    @Override
    public String speak() { return "Woof!"; }

    @Override
    public String move() { return "Running"; }
}

// 使用
Dog dog = new Dog();
dog.describe();
dog.startMoving();
\`\`\`

| 维度 | Python ABC | Java abstract/interface |
|------|-----------|------------------------|
| 抽象类 | ABC + @abstractmethod | abstract class |
| 接口 | ABC（无原生接口） | interface 关键字 |
| 多继承 | 支持（多继承多个 ABC） | 类单继承 + 接口多实现 |
| 默认方法 | 具体方法 | default 方法（Java 8+） |
| 字段 | 可以 | 接口只能有常量 |

## 十、一句话总结

| 维度 | Python | Java |
|------|--------|------|
| 类定义 | 简洁，无需声明字段 | 严谨，需声明字段类型 |
| 构造器 | __init__ + 类方法模拟重载 | 构造器重载 |
| this/self | self 显式 | this 隐式可省 |
| 访问控制 | 约定（_name, __name） | 关键字（private/public） |
| 属性 | @property | getter/setter |
| 静态/类方法 | staticmethod/classmethod | static |
| 运算符重载 | 魔法方法支持 | 不支持（除 String +） |
| 数据类 | dataclass（灵活） | Record（不可变） |
| 抽象类 | ABC | abstract class |
| 接口 | ABC 模拟 | interface 原生 |

Python 的 OOP"灵活而简洁"，property+魔法方法+dataclass 让数据建模如丝般顺滑；Java 的 OOP"严谨而分层"，访问控制+接口+Record 让大型工程的契约更清晰。**灵活 vs 严谨，OOP 领域依然是这个主题**。

---

> **下一章**：深入继承与多态——Python 的多继承与 MRO vs Java 的单继承+接口，super() 的对比，以及密封类与模式匹配的现代演进。`,
  },
  {
    id: "pyvsjava-inheritance",
    icon: "🧬",
    title: "继承与多态",
    group: "语法与类型",
    content: `# 继承与多态

## 一、单继承 vs 单继承+接口多实现

### Python 单继承... 等等，Python 支持多继承

Python **支持多继承**——一个类可以继承多个父类：

\`\`\`python
class Flyable:
    def fly(self):
        print("Flying!")

class Swimmable:
    def swim(self):
        print("Swimming!")

class Duck(Flyable, Swimmable):  # 多继承
    def quack(self):
        print("Quack!")

d = Duck()
d.fly()    # Flying!
d.swim()   # Swimming!
d.quack()  # Quack!
\`\`\`

多继承让 Python 能组合多个"能力"，但带来著名的**菱形继承问题**：

\`\`\`python
class A:
    def greet(self):
        print("A.greet")

class B(A):
    def greet(self):
        print("B.greet")
        super().greet()

class C(A):
    def greet(self):
        print("C.greet")
        super().greet()

class D(B, C):  # 菱形：D → B → C → A
    def greet(self):
        print("D.greet")
        super().greet()

d = D()
d.greet()
# D.greet → B.greet → C.greet → A.greet
print(D.__mro__)  # 查看方法解析顺序
# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)
\`\`\`

Python 用 **C3 线性化**算法解决菱形继承，\`__mro__\` 显示方法解析顺序。调用 \`super()\` 会按 MRO 顺序逐层调用。

### Java：单继承 + 接口多实现

Java **类只支持单继承**，但可以**实现多个接口**：

\`\`\`java
// 抽象类/类：单继承
abstract class Animal {
    abstract String sound();
}

// 接口：多实现
interface Flyable {
    default void fly() { System.out.println("Flying!"); }
}

interface Swimmable {
    default void swim() { System.out.println("Swimming!"); }
}

class Duck extends Animal implements Flyable, Swimmable {
    @Override
    String sound() { return "Quack!"; }
}

Duck d = new Duck();
d.fly();
d.swim();
System.out.println(d.sound());
\`\`\`

Java 的设计哲学是：**用接口解决"多能力"问题，用单继承避免菱形继承的复杂性**。Java 8+ 的 \`default\` 方法让接口能带实现，进一步弥补了单继承的局限。

| 维度 | Python | Java |
|------|--------|------|
| 类继承 | 多继承 | 单继承 |
| 接口实现 | 多继承 ABC | 多实现 interface |
| 菱形继承 | 有，用 MRO 解决 | 没有（单继承） |
| 复杂度 | 高（MRO） | 低（单继承） |
| 灵活性 | 高 | 中 |

## 二、MRO：C3 线性化

Python 的多继承必须解决"调用哪个父类方法"的问题。Python 用 **C3 线性化**算法计算 MRO（Method Resolution Order，方法解析顺序）。

\`\`\`python
class A:
    pass
class B(A):
    pass
class C(A):
    pass
class D(B, C):
    pass

print(D.__mro__)
# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)
\`\`\`

C3 算法保证：
1. 子类在父类之前
2. 父类顺序保持（B 在 C 前，因为 D(B, C)）
3. 每个类只出现一次

**无法线性化时会报错**：

\`\`\`python
class X(A, B): pass
class Y(B, A): pass
class Z(X, Y): pass  # TypeError: Cannot create a consistent MRO
\`\`\`

Java 没有这个问题——单继承让方法解析线性且明确。

## 三、super() 对比

### Python super()

Python 的 \`super()\` 按 MRO 调用**下一个**类的方法：

\`\`\`python
class Base:
    def __init__(self):
        print("Base.__init__")
        super().__init__()  # 调用 object.__init__

class A(Base):
    def __init__(self):
        print("A.__init__")
        super().__init__()  # 按 MRO，下一个是 Base

class B(Base):
    def __init__(self):
        print("B.__init__")
        super().__init__()

class C(A, B):
    def __init__(self):
        print("C.__init__")
        super().__init__()  # 按 MRO：C → A → B → Base → object

c = C()
# C.__init__ → A.__init__ → B.__init__ → Base.__init__
print(C.__mro__)
# (C, A, B, Base, object)
\`\`\`

关键：\`super()\` **不是调用"父类"**，而是调用"MRO 中的下一个类"。多继承时，这可能不是你的直接父类。

Python 3 的 \`super()\` 无参数即可，Python 2 需要写 \`super(ClassName, self)\`。

### Java super

Java 的 \`super\` 调用**直接父类**的方法，明确无歧义：

\`\`\`java
class Base {
    Base() { System.out.println("Base()"); }
    void greet() { System.out.println("Base.greet"); }
}

class A extends Base {
    A() {
        super();  // 调用父类构造器（必须是第一行）
        System.out.println("A()");
    }

    @Override
    void greet() {
        System.out.println("A.greet");
        super.greet();  // 调用 Base.greet
    }
}

public class Main {
    public static void main(String[] args) {
        A a = new A();
        // Base() → A()
        a.greet();
        // A.greet → Base.greet
    }
}
\`\`\`

Java 的 \`super\` 总是指向**直接父类**，没有 MRO 的复杂性。但 Java 的接口 \`default\` 方法有"菱形"问题：

\`\`\`java
interface A {
    default void hello() { System.out.println("A.hello"); }
}

interface B {
    default void hello() { System.out.println("B.hello"); }
}

class C implements A, B {
    @Override
    public void hello() {
        // 必须重写，否则编译错误：A 和 B 都有 default hello()
        A.super.hello();  // 显式选择 A 的
        B.super.hello();  // 显式选择 B 的
    }
}
\`\`\`

Java 接口的菱形问题靠"必须重写 + 显式选择"解决，比 Python 的 C3 更明确但更啰嗦。

## 四、方法重写：无关键字 vs @Override

### Python 重写

Python **没有 override 关键字**，子类直接定义同名方法即重写：

\`\`\`python
class Animal:
    def speak(self):
        return "Some sound"

class Dog(Animal):
    def speak(self):  # 直接重写，无关键字
        return "Woof!"

class Cat(Animal):
    def speak(self):
        return "Meow!"

animals = [Dog(), Cat(), Animal()]
for a in animals:
    print(a.speak())  # Woof! Meow! Some sound（多态）
\`\`\`

Python 的重写"自由但危险"——如果你拼错了方法名，Python 不会告诉你（你以为重写了，其实没有）。

\`\`\`python
class Dog(Animal):
    def speek(self):  # 拼错！这不是重写，是新方法
        return "Woof!"
# 没有任何警告，运行时 a.speak() 还是调用父类
\`\`\`

可以用 \`@override\` 装饰器（Python 3.12+ 或 typing_extensions）获得检查：

\`\`\`python
from typing import override

class Dog(Animal):
    @override
    def speak(self):  # 如果父类没有 speak，mypy 报错
        return "Woof!"
\`\`\`

### Java @Override

Java 的 \`@Override\` 是**编译期检查**的注解，强烈推荐使用：

\`\`\`java
class Animal {
    String speak() { return "Some sound"; }
}

class Dog extends Animal {
    @Override  // 编译器检查是否真的重写了
    String speak() { return "Woof!"; }
}

class Cat extends Animal {
    @Override
    String speek() {  // 编译错误：没有重写任何方法（拼错）
        return "Meow!";
    }
}
\`\`\`

\`@Override\` 让拼错方法名在编译期就报错，避免 Python 那种"静默失败"。

| 维度 | Python | Java |
|------|--------|------|
| 重写关键字 | 无（3.12+ 有 @override） | @Override |
| 拼错检查 | 无（运行时静默失败） | 编译期报错 |
| 签名匹配 | 不检查（鸭子类型） | 严格检查 |

## 五、方法重载：不支持 vs 原生支持

### Python 不支持重载

Python **不支持方法重载**（同名不同参数），后定义的会覆盖前面的：

\`\`\`python
class Calculator:
    def add(self, a, b):
        return a + b

    def add(self, a, b, c):  # 覆盖了上面的 add！
        return a + b + c

c = Calculator()
# c.add(1, 2)  # TypeError: 缺少 c 参数
print(c.add(1, 2, 3))  # 6
\`\`\`

Python 用**默认参数**或 \`*args\` 模拟重载：

\`\`\`python
class Calculator:
    def add(self, a, b, c=0):
        return a + b + c

    def add_many(self, *args):
        return sum(args)

c = Calculator()
print(c.add(1, 2))      # 3
print(c.add(1, 2, 3))   # 6

# 或者用 singledispatch 做类型分派
from functools import singledispatchmethod

class Processor:
    @singledispatchmethod
    def process(self, data):
        raise NotImplementedError

    @process.register
    def _(self, data: int):
        return data * 2

    @process.register
    def _(self, data: str):
        return data.upper()

p = Processor()
print(p.process(5))       # 10
print(p.process("hi"))    # HI
\`\`\`

### Java 原生重载

Java **原生支持方法重载**：

\`\`\`java
public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }

    public int add(int a, int b, int c) {
        return a + b + c;
    }

    public double add(double a, double b) {
        return a + b;
    }

    public String add(String a, String b) {
        return a + b;
    }

    public static void main(String[] args) {
        Calculator c = new Calculator();
        System.out.println(c.add(1, 2));          // 3
        System.out.println(c.add(1, 2, 3));       // 6
        System.out.println(c.add(1.5, 2.5));      // 4.0
        System.out.println(c.add("Hello", "!"));  // Hello!
    }
}
\`\`\`

Java 的重载在编译期根据**参数类型和数量**决定调用哪个方法，类型安全且明确。

| 维度 | Python | Java |
|------|--------|------|
| 原生重载 | 不支持 | 支持 |
| 模拟方式 | 默认参数 / singledispatch | 直接定义多个方法 |
| 类型分派 | singledispatch（运行时） | 编译期静态分派 |

## 六、多态：鸭子类型 vs 接口多态

### Python 鸭子类型多态

Python 的多态基于**鸭子类型**——不关心类型，只关心方法：

\`\`\`python
class Dog:
    def speak(self): return "Woof!"

class Cat:
    def speak(self): return "Meow!"

class Robot:  # 不需要继承任何类
    def speak(self): return "Beep boop!"

def make_speak(thing):  # 不声明类型，只要有 speak 方法
    return thing.speak()

for obj in [Dog(), Cat(), Robot()]:
    print(make_speak(obj))
# Woof! Meow! Beep boop!
\`\`\`

\`make_speak\` 接受任何有 \`speak\` 方法的对象，无需继承关系。这是 Python 多态的核心——**基于行为，不基于类型**。

### Java 接口多态

Java 的多态基于**接口/继承**——必须有显式类型关系：

\`\`\`java
interface Speaker {
    String speak();
}

class Dog implements Speaker {
    public String speak() { return "Woof!"; }
}

class Cat implements Speaker {
    public String speak() { return "Meow!"; }
}

class Robot implements Speaker {  // 必须显式实现接口
    public String speak() { return "Beep boop!"; }
}

public class Main {
    static void makeSpeak(Speaker s) {  // 参数必须是 Speaker 类型
        System.out.println(s.speak());
    }

    public static void main(String[] args) {
        for (Speaker s : new Speaker[]{new Dog(), new Cat(), new Robot()}) {
            makeSpeak(s);
        }
    }
}
\`\`\`

Java 要求 \`Robot\` **必须显式 \`implements Speaker\`** 才能传给 \`makeSpeak\`。即使 \`Robot\` 有 \`speak\` 方法，没有声明接口就无法多态。

| 维度 | Python 鸭子多态 | Java 接口多态 |
|------|---------------|-------------|
| 依据 | 行为（有方法） | 类型（实现接口） |
| 解耦 | 高（无需共同基类） | 中（需共同接口） |
| 安全 | 低（运行时错误） | 高（编译期检查） |
| 灵活性 | 高 | 中 |

## 七、final / sealed class

### Python 无 final

Python **没有 final/sealed 概念**，任何类都能被继承：

\`\`\`python
class Base:
    pass

class Child(Base):  # 总是可以继承
    pass

# 无法阻止继承，只能靠约定或文档
# "This class should not be subclassed"
\`\`\`

### Java final / sealed

Java 用 \`final\` 阻止继承：

\`\`\`java
public final class String { ... }  // 不能被继承
// class MyString extends String { }  // 编译错误

final class Utility { }  // 不能继承
\`\`\`

Java 17+ 引入 **密封类（sealed）**，精确控制哪些类可以继承：

\`\`\`java
// 密封类：只允许指定的类继承
public sealed class Shape permits Circle, Square, Triangle {}

final class Circle extends Shape { ... }     // final：不能再继承
final class Square extends Shape { ... }
non-sealed class Triangle extends Shape { ... }  // non-sealed：开放继承
\`\`\`

密封类配合**模式匹配**（pattern matching）非常强大：

\`\`\`java
public static double area(Shape shape) {
    return switch (shape) {  // Java 21 模式匹配 switch
        case Circle c -> Math.PI * c.radius() * c.radius();
        case Square s -> s.side() * s.side();
        case Triangle t -> 0.5 * t.base() * t.height();
        // 不需要 default，因为 sealed 保证了穷尽性
    };
}
\`\`\`

密封类 + 模式匹配让 Java 在"领域建模"上获得了类似函数式语言的代数数据类型（ADT）能力。

| 维度 | Python | Java |
|------|--------|------|
| final 类 | 无 | final 关键字 |
| 密封类 | 无 | sealed + permits |
| 模式匹配 | 无（用 if-elif + isinstance） | switch 模式匹配（Java 21+） |

## 八、instanceof vs isinstance

### Python isinstance

\`\`\`python
class Animal: pass
class Dog(Animal): pass

d = Dog()
print(isinstance(d, Dog))     # True
print(isinstance(d, Animal))  # True（考虑继承）
print(isinstance(d, (int, str)))  # True（支持元组）

# 类型检查
def process(obj):
    if isinstance(obj, str):
        return obj.upper()
    elif isinstance(obj, (int, float)):
        return obj * 2
    return str(obj)

# 但 Python 社区更推荐鸭子类型，少用 isinstance
\`\`\`

### Java instanceof

\`\`\`java
Object obj = "Hello";
if (obj instanceof String) {
    String s = (String) obj;  // 需要强转
    System.out.println(s.length());
}

// Java 16+ 模式匹配 instanceof
if (obj instanceof String s) {  // 直接绑定变量
    System.out.println(s.length());
}

// 继承关系
Animal a = new Dog();
System.out.println(a instanceof Dog);     // true
System.out.println(a instanceof Animal);  // true
\`\`\`

Java 16+ 的 \`instanceof String s\` 模式匹配避免了显式强转，比 Python 的 \`isinstance\` + 强转更优雅。

## 九、多继承的实际权衡

### Python 多继承的适用场景

\`\`\`python
# Mixin 模式：组合小功能
class LogMixin:
    def log(self, msg):
        print(f"[LOG] {msg}")

class ValidateMixin:
    def validate(self, data):
        return bool(data)

class Service(LogMixin, ValidateMixin):
    def run(self, data):
        self.log("Starting")
        if not self.validate(data):
            self.log("Invalid data")
            return
        self.log("Processing: " + str(data))

s = Service()
s.run("test")
# [LOG] Starting
# [LOG] Processing: test
\`\`\`

Python 的 Mixin 模式是多继承的"正确用法"——每个 Mixin 提供独立功能，组合使用。

### Java 接口的 default 方法

\`\`\`java
// Java 8+ 用接口 default 方法实现类似 Mixin
interface LogMixin {
    default void log(String msg) {
        System.out.println("[LOG] " + msg);
    }
}

interface ValidateMixin {
    default boolean validate(Object data) {
        return data != null;
    }
}

class Service implements LogMixin, ValidateMixin {
    void run(Object data) {
        log("Starting");
        if (!validate(data)) {
            log("Invalid data");
            return;
        }
        log("Processing: " + data);
    }
}
\`\`\`

Java 用接口 default 方法实现了类似的 Mixin 效果，但更受限（接口不能有实例字段）。

## 十、一句话总结

| 维度 | Python | Java |
|------|--------|------|
| 类继承 | 多继承 | 单继承 |
| 接口实现 | 多继承 ABC | 多实现 interface |
| 方法解析 | MRO（C3 线性化） | 单继承线性 |
| super() | 按 MRO 下一个 | 直接父类 |
| 方法重写 | 无关键字（@override 3.12+） | @Override 强制检查 |
| 方法重载 | 不支持（默认参数模拟） | 原生支持 |
| 多态 | 鸭子类型（行为） | 接口（类型） |
| final/sealed | 无 | final / sealed |
| 模式匹配 | 无 | switch 模式匹配 |
| isinstance/instanceof | isinstance | instanceof（支持模式匹配） |

Python 的继承体系"自由而灵活"，多继承+MRO+鸭子类型让代码组合极其自由，但也带来心智负担；Java 的继承体系"严谨而可控"，单继承+接口+密封类让大型工程的类型关系清晰可控。**自由 vs 可控，这是继承领域永恒的权衡**。

---

> **下一章**：进入下一批章节——异常处理、模块与包、并发编程，看 Python 和 Java 如何处理错误与协作。`,
  },
];
