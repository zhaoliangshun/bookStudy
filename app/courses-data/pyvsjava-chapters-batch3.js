// =============================================================
// Python vs Java 深度对比 —— 第 3 批
// -------------------------------------------------------------
// 转义规则：content 内部反引号写作 \`，${ 写作 \$\{
// =============================================================

export const chapters = [
  {
    id: "pyvsjava-generics",
    icon: "🎯",
    title: "泛型：运行时 vs 编译时",
    group: "语法与类型",
    content: `# 泛型：运行时 vs 编译时

## 一、泛型要解决什么问题

泛型（Generics）的本质是**参数化类型**——把类型当成参数传给类、接口、方法，实现"一份代码，多种类型"。

没有泛型之前，两种语言都面临同一个问题：

\`\`\`python
# Python：没有泛型时，类型信息丢失
def first(items):
    return items[0]

result = first([1, 2, 3])  # 调用者不知道返回的是 int 还是 str
\`\`\`

\`\`\`java
// Java：没有泛型时（JDK 1.4 之前），只能用 Object
public static Object first(List items) {
    return items.get(0);
}
// 使用时必须强转，运行时才报错
String s = (String) first(list);  // ClassCastException
\`\`\`

泛型解决三件事：
1. **类型安全**：编译/静态检查期就能发现类型错误
2. **消除强转**：调用方不用再写 \`(String)\` 这种危险转换
3. **代码复用**：一份容器代码服务所有类型

但 Python 和 Java 实现泛型的方式截然不同——一个走"运行时保留"路线，一个走"编译时擦除"路线。这是本章的核心分歧。

## 二、Java 泛型：类型擦除（Type Erasure）

Java 的泛型是 **JDK 5（2004 年）** 引入的，为了向后兼容 1.4 的字节码，设计者做了一个影响深远的决定：**类型擦除（Type Erasure）**。

也就是说，\`List<String>\` 和 \`List<Integer>\` 在编译后**变成同一个类型** \`List\`，泛型类型参数 \`<String>\`、\`<Integer>\` 在字节码里**完全消失**。

\`\`\`java
List<String> strings = new ArrayList<>();
List<Integer> numbers = new ArrayList<>();

// 运行时，两者的 class 是同一个！
System.out.println(strings.getClass());  // class java.util.ArrayList
System.out.println(numbers.getClass());  // class java.util.ArrayList
System.out.println(strings.getClass() == numbers.getClass());  // true
\`\`\`

编译器做的"擦除魔法"：

\`\`\`java
// 你写的代码
public class Box<T> {
    private T value;
    public void set(T value) { this.value = value; }
    public T get() { return value; }
}

// 编译后实际变成（擦除后 T 变成 Object，或有上界时变成上界）
public class Box {
    private Object value;
    public void set(Object value) { this.value = value; }
    public Object get() { return value; }
}
\`\`\`

类型擦除的**好处**：JDK 5 的泛型代码能和 JDK 1.4 的非泛型代码互操作，平滑过渡。

类型擦除的**代价**（很多让人崩溃的限制）：

| 限制 | 说明 | 示例 |
|------|------|------|
| 运行时拿不到泛型类型 | \`T.class\` 不存在 | 不能写 \`new T()\` |
| 不能创建泛型数组 | 类型不安全 | \`new List<String>[10]\` 编译报错 |
| 不能用基本类型做参数 | 必须用包装类 | \`List<int>\` 非法，必须 \`List<Integer>\` |
| 不能 instanceof 参数化类型 | 类型已擦除 | \`x instanceof List<String>\` 非法（只能 \`instanceof List\`） |
| 静态字段不能用类的类型参数 | 类型参数是实例级的 | \`static T x;\` 非法 |
| 方法签名冲突 | 擦除后签名相同 | \`int f(List<String>)\` 和 \`void f(List<Integer>)\` 不能共存 |

\`\`\`java
// ❌ 这些都编译不过
public class Box<T> {
    // private static T instance;        // 静态字段不能用 T
    // public T create() { return new T(); }  // 不能 new T
    // public T[] array() { return new T[10]; }  // 不能 new T[]
    // public boolean isString(List<T> list) {
    //     return list instanceof List<String>;  // 不能 instanceof 参数化类型
    // }
}
\`\`\`

那运行时真就完全拿不到泛型信息了吗？也不全是——**类字面量**和**匿名子类**能保留一点残余：

\`\`\`java
// 通过类字面量拿到（这是类级别的，不是实例级别的）
Class<?> listType = List.class;  // ✓ 但拿不到 List<String>

// 通过匿名子类的父类 ParameterizedType 反射拿到
List<String> anonymous = new ArrayList<String>() {};  // 注意这个匿名大括号
Type type = anonymous.getClass().getGenericSuperclass();
ParameterizedType pt = (ParameterizedType) type;
System.out.println(pt.getActualTypeArguments()[0]);  // class java.lang.String
\`\`\`

这是很多框架（如 Jackson、Hibernate）能反射到泛型类型的"作弊"手法——靠匿名内部类保留的 \`ParameterizedType\` 信息。非常 hacky。

## 三、Python 泛型：运行时保留

Python 的泛型是 **PEP 484（2014 年）** 引入的类型提示（Type Hints）的一部分。和 Java 不同，**Python 的泛型是"运行时保留"的**——泛型参数在运行时是真实存在的对象。

\`\`\`python
from typing import Generic, TypeVar

T = TypeVar("T")

class Box(Generic[T]):
    def __init__(self, value: T) -> None:
        self.value = value
    def get(self) -> T:
        return self.value

# 运行时，泛型参数 T 被替换成具体类型，且保留下来
box_str: Box[str] = Box("hello")
box_int: Box[int] = Box(42)

# 运行时可以拿到泛型类型参数！
print(box_str.__orig_class__.__args__)  # (str,)
print(box_int.__orig_class__.__args__)  # (int,)
\`\`\`

注意 \`__orig_class__\` 是 CPython 内部保留的属性（赋值时若类继承自 \`Generic\`，会把原始类对象记下来）。这虽然不是公开 API，但确实证明：**Python 的泛型参数在运行时没被擦除**。

不过要小心：Python 类型提示默认**不强制运行时检查**。也就是说 \`Box("hello")\` 即使你声明成 \`Box[int]\`，运行时也不会报错——类型检查靠 **mypy/pyright** 这种静态检查工具。

\`\`\`python
box: Box[int] = Box("oops")  # 运行时不报错！mypy 会报错
\`\`\`

但如果你想要运行时强制检查，可以用 \`@dataclass\` 配合 \`pydantic\`，或者用 \`typing.runtime_checkable\`：

\`\`\`python
from typing import Protocol, runtime_checkable

@runtime_checkable
class Quackable(Protocol):
    def quack(self) -> None: ...

def make_sound(x: Quackable) -> None:
    if isinstance(x, Quackable):  # 运行时检查协议
        x.quack()
\`\`\`

## 四、Python List[int] vs Java List<Integer>

这是初学者最容易混淆的点。

| 维度 | Python \`list[int]\` | Java \`List<Integer>\` |
|------|---------------------|----------------------|
| 类型擦除 | 不擦除，运行时保留 | 擦除，运行时只是 \`List\` |
| 元素基本类型 | \`int\` 就是 \`int\`，无包装 | 必须 \`Integer\`，\`int\` 不行 |
| 装箱开销 | 无（一切皆对象） | 有（自动装箱拆箱） |
| 运行时类型检查 | 默认无（靠 mypy） | 编译期检查 |
| 反射拿泛型 | \`__orig_class__.__args__\` | 需要匿名子类 hack |

\`\`\`python
from typing import List

def sum_list(items: List[int]) -> int:
    return sum(items)

# 运行时不检查，但 mypy 会检查
sum_list([1, 2, 3])       # ✓
sum_list(["a", "b"])      # 运行时 OK，mypy 报错
\`\`\`

\`\`\`java
import java.util.List;

public static int sumList(List<Integer> items) {
    int sum = 0;
    for (Integer i : items) {
        sum += i;  // 自动拆箱，可能 NPE
    }
    return sum;
}

sumList(List.of(1, 2, 3));  // ✓
// sumList(List.of("a"));   // 编译就报错
\`\`\`

Java 的 \`List<int>\` 是非法的——基本类型不能做泛型参数，只能用包装类 \`Integer\`。这带来一个隐藏的性能陷阱：

\`\`\`java
List<Integer> nums = new ArrayList<>();
for (int i = 0; i < 1_000_000; i++) {
    nums.add(i);  // 每次都装箱！1 百万个 Integer 对象
}
// 内存占用：1 百万个 int ≈ 4MB，1 百万个 Integer ≈ 16MB+（对象头 + 引用）
\`\`\`

Python 没有这个问题——\`int\` 本来就是对象，\`list\` 存的就是引用，没有"装箱"概念。

## 五、Java 通配符：协变、逆变、不变

Java 泛型最大的特色之一是**通配符（Wildcard）**，用于表达类型参数的"协变/逆变"关系。

先说背景：Java 泛型默认是**不变（invariant）**的：

\`\`\`java
List<Integer> ints = new ArrayList<>();
List<Number> nums = ints;  // ❌ 编译错误！
// 即使 Integer 是 Number 的子类，List<Integer> 也不是 List<Number> 的子类
\`\`\`

为什么不变？因为如果允许协变，会破坏类型安全：

\`\`\`java
List<Integer> ints = new ArrayList<>();
List<Number> nums = ints;  // 假设允许
nums.add(3.14);            // Number 装得下 Double
Integer i = ints.get(0);   // 运行时爆炸！拿到 3.14
\`\`\`

但如果只用"读"，其实是安全的。Java 用 **\`? extends T\`（上界通配符，协变）** 表达"只读不写"：

\`\`\`java
List<Integer> ints = List.of(1, 2, 3);
List<? extends Number> nums = ints;  // ✓ 协变
Number n = nums.get(0);              // ✓ 读出来当 Number 没问题
// nums.add(1);  // ❌ 编译错误，不能写（除了 null）
\`\`\`

反过来，"只写不读"用 **\`? super T\`（下界通配符，逆变）**：

\`\`\`java
List<Number> nums = new ArrayList<>();
List<? super Integer> sink = nums;  // ✓ 逆变
sink.add(1);                        // ✓ 写入 Integer 没问题
// Integer x = sink.get(0);  // ❌ 编译错误，读出来只能当 Object
\`\`\`

**PECS 原则**（Producer Extends, Consumer Super）：
- 如果是**生产者**（数据源，只读）→ \`? extends T\`
- 如果是**消费者**（数据汇，只写）→ \`? super T\`

经典案例 \`Collections.copy\`：

\`\`\`java
public static <T> void copy(List<? super T> dest, List<? extends T> src) {
    // 从 src 读（extends），往 dest 写（super）
}
\`\`\`

## 六、Python 没有通配符：靠子类型 + 鸭子类型

Python 的类型系统里**没有 Java 那样的通配符概念**。原因有二：
1. Python 类型提示是可选的，运行时不强制
2. Python 用 \`TypeVar\` 的 \`bound\` 和协变/逆变声明来表达类似语义

\`\`\`python
from typing import TypeVar

# 协变 TypeVar
T_co = TypeVar("T_co", covariant=True)

# 逆变 TypeVar
T_contra = TypeVar("T_contra", contravariant=True)
\`\`\`

但这些大多用于设计**泛型容器/协议**时，普通业务代码很少碰。日常 Python 里，"读 List[Number]" 直接写 \`list[Number]\` 就行，运行时也不强制：

\`\`\`python
from numbers import Number

def sum_list(items: list[Number]) -> Number:
    return sum(items)

sum_list([1, 2, 3])       # ✓ int 是 Number 子类
sum_list([1.5, 2.5])      # ✓ float 是 Number 子类
sum_list(["a"])           # 运行时 OK，mypy 报错
\`\`\`

Python 的思路是：**与其搞复杂的协变/逆变规则，不如让类型提示保持简单，把检查交给静态工具**。这是哲学分歧——Java 用复杂语法换编译期安全，Python 用简单语法换易用性。

| 维度 | Java | Python |
|------|------|--------|
| 默认可变性 | 不变 | 不变（但运行时不强制） |
| 协变语法 | \`? extends T\` | \`TypeVar(covariant=True)\` |
| 逆变语法 | \`? super T\` | \`TypeVar(contravariant=True)\` |
| PECS 原则 | 必须遵守 | 不需要（无强制） |
| 学习曲线 | 陡（通配符是面试经典难题） | 平 |

## 七、PEP 585：泛型语法演进

Python 的泛型语法经历了几个阶段，**PEP 585（Python 3.9）** 是一个重要里程碑。

**阶段 1：PEP 484 时代（3.5+）**——必须从 typing 导入大写版本：

\`\`\`python
from typing import List, Dict, Tuple, Set

def f(items: List[int], mapping: Dict[str, int]) -> Tuple[int, str]:
    ...
\`\`\`

**阶段 2：PEP 585（3.9+）**——内置容器可以直接当泛型用，小写：

\`\`\`python
def f(items: list[int], mapping: dict[str, int]) -> tuple[int, str]:
    ...
\`\`\`

PEP 585 让 Python 的泛型语法**和 Java 一样简洁**，甚至更简洁：

\`\`\`python
# Python 3.9+
def head(xs: list[int]) -> int: ...
def pairs(xs: list[tuple[str, int]]) -> dict[str, int]: ...
\`\`\`

\`\`\`java
// Java
public static int head(List<Integer> xs) { ... }
public static Map<String, Integer> pairs(List<Map.Entry<String, Integer>> xs) { ... }
\`\`\`

**阶段 3：自定义泛型**（仍然是 \`Generic[T]\`）：

\`\`\`python
from typing import Generic, TypeVar

T = TypeVar("T")

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    def push(self, x: T) -> None:
        self._items.append(x)
    def pop(self) -> T:
        return self._items.pop()
\`\`\`

Python 3.12 进一步引入了 **PEP 695 类型参数语法**，让自定义泛型更简洁：

\`\`\`python
# Python 3.12+，新语法
class Stack[T]:
    def __init__(self) -> None:
        self._items: list[T] = []
    def push(self, x: T) -> None:
        self._items.append(x)

def head[T](xs: list[T]) -> T:
    return xs[0]
\`\`\`

这种语法和 Java 的 \`<T>\` 已经非常接近了。

## 八、泛型方法

两边都支持"方法级别的泛型"（类型参数声明在方法上，不是类上）。

\`\`\`java
// Java 泛型方法
public static <T> T first(List<T> items) {
    return items.get(0);
}

// 多个类型参数
public static <K, V> Map<K, V> zip(List<K> keys, List<V> values) {
    Map<K, V> map = new HashMap<>();
    for (int i = 0; i < keys.size(); i++) {
        map.put(keys.get(i), values.get(i));
    }
    return map;
}

// 调用（通常类型推断）
String s = first(List.of("a", "b"));
Integer i = first(List.of(1, 2));
\`\`\`

\`\`\`python
# Python 泛型方法（函数）
from typing import TypeVar, List

T = TypeVar("T")

def first(items: List[T]) -> T:
    return items[0]

# 多个类型参数
K = TypeVar("K")
V = TypeVar("V")
def zip_kv(keys: List[K], values: List[V]) -> dict[K, V]:
    return dict(zip(keys, values))

# 调用（类型推断靠 mypy）
s: str = first(["a", "b"])
i: int = first([1, 2])
\`\`\`

## 九、类型参数约束

如何限定类型参数的上界？

\`\`\`java
// Java：用 <T extends Bound>
public static <T extends Number> double sum(List<T> nums) {
    double s = 0;
    for (Number n : nums) s += n.doubleValue();
    return s;
}

sum(List.of(1, 2, 3));      // ✓ Integer extends Number
sum(List.of(1.0, 2.0));     // ✓ Double extends Number
// sum(List.of("a"));        // ❌ String 不 extends Number
\`\`\`

\`\`\`python
# Python：用 TypeVar(bound=...)
from typing import TypeVar
from numbers import Number

T = TypeVar("T", bound=Number)

def sum_list(nums: list[T]) -> float:
    return sum(float(x) for x in nums)
\`\`\`

Java 还支持**多重约束**（\`<T extends A & B>\`），Python 的 \`TypeVar\` 只能单 bound，要表达多重约束得用 \`Protocol\`：

\`\`\`java
// Java 多重约束
public static <T extends Comparable<T> & Serializable> void sort(List<T> list) {
    // T 必须既是 Comparable 又是 Serializable
}
\`\`\`

\`\`\`python
# Python 用 Protocol
from typing import Protocol, TypeVar

class Comparable(Protocol):
    def __lt__(self, other: "Comparable") -> bool: ...

T = TypeVar("T", bound=Comparable)
def sort_list(xs: list[T]) -> list[T]: ...
\`\`\`

此外，Python 的 \`TypeVar\` 还支持**值约束**（枚举几个允许的类型），Java 没这个特性：

\`\`\`python
from typing import TypeVar
# Python：限制 T 只能是 str 或 bytes
T = TypeVar("T", str, bytes)

def concat(a: T, b: T) -> T:
    return a + b

concat("a", "b")    # ✓
concat(b"a", b"b")  # ✓
# concat(1, 2)      # mypy 报错
\`\`\`

Java 要实现类似效果只能定义多个重载方法。

## 十、对比总表

| 维度 | Python | Java |
|------|--------|------|
| 引入版本 | 3.5（PEP 484，2014） | JDK 5（2004） |
| 实现机制 | 运行时保留 | 编译时擦除 |
| 运行时拿泛型类型 | ✓（\`__orig_class__\`） | ✗（需匿名子类 hack） |
| 类型检查 | 静态工具（mypy） | 编译器 |
| 基本类型参数 | ✓（int 即可） | ✗（必须 Integer） |
| 通配符 | 无 | \`? extends\` / \`? super\` |
| 协变/逆变 | \`TypeVar(covariant=True)\` | 通配符 |
| 上界约束 | \`TypeVar(bound=X)\` | \`<T extends X>\` |
| 多重约束 | \`Protocol\` | \`<T extends A & B>\` |
| 值约束 | \`TypeVar("T", str, bytes)\` | 不支持（要重载） |
| 自定义泛型类 | \`class C(Generic[T])\` | \`class C<T>\` |
| 新语法（3.12） | \`class C[T]\` | — |

## 十一、一句话总结

- **Java 泛型**是编译期的"类型安全门神"，运行时类型擦除让反射和框架代码屡屡吃瘪，通配符是初学者的噩梦但也是类型工程的利器。
- **Python 泛型**是运行时的"类型信息载体"，类型检查靠外部工具，语法简单灵活但缺少编译期强制力。

---

> **下一章**：泛型讲完，我们看异常——Python 全是非受检异常，Java 却有"受检异常"这个被业界反复争议的设计，这是两门语言最大的工程哲学分歧之一。`,
  },
  {
    id: "pyvsjava-exceptions",
    icon: "⚠️",
    title: "异常处理机制",
    group: "语法与类型",
    content: `# 异常处理机制

## 一、异常的本质

异常（Exception）是程序遇到"非正常情况"时的控制流转移机制。两门语言都把异常当**对象**处理，但设计哲学截然不同。

\`\`\`python
# Python：一切皆对象，异常也是
print(type(ValueError("x")))  # <class 'ValueError'>
print(ValueError.__bases__)   # (Exception,)
print(Exception.__bases__)    # (BaseException,)
\`\`\`

\`\`\`java
// Java：异常是 Throwable 的子类
System.out.println(new IllegalArgumentException("x").getClass());
// class java.lang.IllegalArgumentException
// 继承链：IllegalArgumentException → RuntimeException → Exception → Throwable → Object
\`\`\`

两边的异常类层次：

| Python | Java | 是否"受检" |
|--------|------|-----------|
| BaseException | Throwable | — |
| Exception | Exception | Java 中是受检 |
| RuntimeError | RuntimeException | 非受检 |
| ValueError | IllegalArgumentException | Java 中非受检 |
| TypeError | ClassCastException | Java 中非受检 |
| KeyError | NoSuchElementException | — |
| FileNotFoundError | IOException | Java 中受检 |
| ZeroDivisionError | ArithmeticException | 非受检 |
| KeyboardInterrupt | — | — |
| SystemExit | — | — |
| — | Error（JVM 错误） | 非受检 |

## 二、try-except vs try-catch

基本语法对比：

\`\`\`python
# Python：try-except-else-finally
try:
    result = 10 / x
except ZeroDivisionError as e:
    print(f"除零: {e}")
except (TypeError, ValueError) as e:
    print(f"类型/值错误: {e}")
else:
    print(f"结果: {result}")  # try 没异常时才执行
finally:
    print("清理")  # 一定执行
\`\`\`

\`\`\`java
// Java：try-catch-finally（无 else）
try {
    int result = 10 / x;
    System.out.println("结果: " + result);
} catch (ArithmeticException e) {
    System.out.println("除零: " + e);
} catch (ClassCastException | IllegalArgumentException e) {
    System.out.println("类型/值错误: " + e);
} finally {
    System.out.println("清理");
}
\`\`\`

几个细节差异：

| 维度 | Python | Java |
|------|--------|------|
| 捕获关键字 | \`except\` | \`catch\` |
| 异常对象绑定 | \`as e\` | \`(... e)\` |
| 多类型捕获 \| \`except (A, B)\` | \`catch (A | B)\`（JDK 7+） |
| 无异常分支 | \`else\` | 无（要嵌套 try） |
| finally 中 return | 会覆盖 try 的 return | 同（但 IDE 警告） |
| 异常重新抛出 | \`raise\`（裸 raise 重抛当前） | \`throw e;\`（要写变量） |

Python 的 \`else\` 子句是 Java 没有的——它表示"try 没抛异常才执行"，用于把"可能出错的代码"和"成功后的代码"分开，避免误捕获：

\`\`\`python
try:
    data = load_file(path)
except OSError:
    log("加载失败")
else:
    # 这里抛的异常不会被上面的 except 捕获
    process(data)  # 如果 process 抛 OSError，不会被误当成 load 失败
\`\`\`

## 三、受检异常：Java 最大的争议

**这是 Java 和 Python 异常机制最大的分歧。**

Java 把异常分两类（外加一个 Error）：
- **受检异常（Checked Exception）**：继承自 \`Exception\`（但不含 \`RuntimeException\`）。**编译器强制要求声明或捕获**。
- **非受检异常（Unchecked Exception）**：继承自 \`RuntimeException\` 或 \`Error\`。不强制声明。

\`\`\`java
import java.io.IOException;

// 受检异常：必须 throws 声明或 try-catch
public String readFile(String path) throws IOException {
    // 如果不写 throws，编译器报错
    FileReader fr = new FileReader(path);  // 可能抛 IOException
    return fr.toString();
}

// 调用方也必须处理
try {
    String s = readFile("a.txt");
} catch (IOException e) {
    e.printStackTrace();
}
\`\`\`

\`\`\`python
# Python：全都是非受检异常，无需声明
def read_file(path: str) -> str:
    with open(path) as f:  # 可能抛 FileNotFoundError
        return f.read()

# 调用方想处理就处理，不处理就让它冒泡
s = read_file("a.txt")  # 不强制 try
\`\`\`

### 受检异常的初衷

Java 设计者认为：**有些错误是可恢复的（如文件找不到、网络断开），调用方必须知道并处理**。编译器强制声明，等于把"可能出错的情况"变成 API 契约的一部分。

听起来很美好，但实践中受检异常被诟病无数：

1. **异常吞噬**：程序员嫌麻烦，写 \`catch (Exception e) {}\` 把异常吞掉，比不处理还糟
2. **异常包装地狱**：低层抛 \`IOException\`，高层想抛 \`BusinessException\`，只能 \`try-catch\` 后包一层再抛，代码膨胀
3. **lambda 困境**：\`Stream\` 的 lambda 不能抛受检异常，导致 \`IOException\` 等几乎无法在 stream 中使用
4. **接口污染**：每个方法都要声明 \`throws A, B, C\`，接口签名又臭又长

\`\`\`java
// 受检异常的"包装地狱"
public void doSomething() throws BusinessException {
    try {
        readFile("a.txt");    // throws IOException
        callApi();            // throws SQLException
        parseXml();           // throws XmlParseException
    } catch (IOException | SQLException | XmlParseException e) {
        throw new BusinessException("初始化失败", e);  // 必须包装
    }
}
\`\`\`

### 业界的反弹

C# 设计者 Anders Hejlsberg（也是 Turbo Pascal 和 Delphi 的作者）明确表示：**C# 不学 Java 的受检异常**，因为实践证明它弊大于利。Python、Kotlin、Scala、Rust、Go 都没有受检异常。

Kotlin 甚至在 JVM 上跑，却**显式去掉了受检异常**——所有 Java 的受检异常在 Kotlin 里都是非受检的。这是对 Java 设计的直接否定。

| 立场 | 支持者 | 反对者 |
|------|--------|--------|
| 受检异常 | Java（仍坚持） | C#、Python、Kotlin、Scala |
| 主要论点 | 强制文档化/处理 | 诱发吞噬、污染签名、难以演进 |

## 四、throws 声明 vs 无声明

\`\`\`java
// Java：throws 声明受检异常
public List<User> loadUsers(String path) throws IOException, ParseException {
    // ...
    return new ArrayList<>();
}
\`\`\`

\`\`\`python
# Python：无 throws，但可以用类型提示标注
def load_users(path: str) -> list:
    """加载用户。

    Raises:
        FileNotFoundError: 文件不存在
        ValueError: 解析失败
    """
    ...
\`\`\`

Python 靠**文档字符串**或 \`:raises:\` 注解声明可能抛的异常，是"软契约"——调用方知道可能出什么错，但编译器不强制处理。

## 五、自定义异常

\`\`\`python
# Python：继承 Exception（或更具体的子类）
class InsufficientFundsError(Exception):
    def __init__(self, balance: float, amount: float):
        super().__init__(f"余额 {balance} 不足，无法取 {amount}")
        self.balance = balance
        self.amount = amount

try:
    raise InsufficientFundsError(100, 200)
except InsufficientFundsError as e:
    print(f"余额: {e.balance}, 想取: {e.amount}")
\`\`\`

\`\`\`java
// Java：继承 Exception（受检）或 RuntimeException（非受检）
public class InsufficientFundsException extends Exception {  // 受检
    private final double balance;
    private final double amount;

    public InsufficientFundsException(double balance, double amount) {
        super(String.format("余额 %s 不足，无法取 %s", balance, amount));
        this.balance = balance;
        this.amount = amount;
    }
    public double getBalance() { return balance; }
    public double getAmount() { return amount; }
}

// 使用
try {
    throw new InsufficientFundsException(100, 200);
} catch (InsufficientFundsException e) {
    System.out.printf("余额: %s, 想取: %s%n", e.getBalance(), e.getAmount());
}
\`\`\`

**关键决策**：Java 自定义异常要选"受检还是非受检"。
- 受检（继承 \`Exception\`）：调用方必须处理，适合"业务可恢复"错误
- 非受检（继承 \`RuntimeException\`）：调用方不强制，适合"程序 bug"（如参数非法）

业界现在更倾向**多用非受检**（Spring 全部用 \`RuntimeException\`），因为受检异常的负担太重。

Python 没这个选择困难——所有异常都是非受检的。

## 六、异常链：raise from vs caused by

当异常被包装重抛时，保留原始异常信息很重要。

\`\`\`python
# Python：raise ... from ...
def load_config():
    import json
    try:
        with open("config.json") as f:
            return json.load(f)
    except FileNotFoundError as e:
        raise RuntimeError("配置加载失败") from e  # 显式链

try:
    load_config()
except RuntimeError as e:
    print(e)            # 配置加载失败
    print(e.__cause__)  # FileNotFoundError(...) —— 原始异常
    # traceback 会显示：
    # FileNotFoundError: ...
    # The above exception was the direct cause of the following exception:
    # RuntimeError: 配置加载失败
\`\`\`

\`\`\`java
// Java：new Exception(msg, cause)
public java.util.Map<String, Object> loadConfig() {
    try (java.io.FileReader fr = new java.io.FileReader("config.json")) {
        return parseJson(fr);
    } catch (java.io.IOException e) {
        throw new RuntimeException("配置加载失败", e);  // 第二参数为 cause
    }
}

try {
    loadConfig();
} catch (RuntimeException e) {
    System.out.println(e);           // RuntimeException: 配置加载失败
    System.out.println(e.getCause()); // IOException: ...
    e.printStackTrace();  // 打印完整因果链
}
\`\`\`

Python 还有隐式异常链 \`__context__\`（在 except 块里 raise 新异常时自动设置）：

\`\`\`python
try:
    1 / 0
except ZeroDivisionError:
    raise ValueError("new error")  # 自动设置 __context__ = ZeroDivisionError
# traceback 会显示 "During handling of the above exception, another exception occurred"
\`\`\`

## 七、with vs try-with-resources

资源管理（自动关闭文件、连接）两边都有专门语法。

\`\`\`python
# Python：with 语句（上下文管理器）
class DbConn:
    def __enter__(self):
        self.conn = connect()
        return self.conn
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.close()  # 自动调用
        # 返回 True 表示吞掉异常，返回 None/False 表示继续传播

with DbConn() as conn:
    conn.query("SELECT 1")
# 离开 with 块，__exit__ 自动调用，即使抛异常也会关闭
\`\`\`

\`\`\`java
// Java：try-with-resources（JDK 7+）
public class DbConn implements AutoCloseable {
    public DbConn() { /* connect */ }
    public void query(String sql) { /* ... */ }
    @Override
    public void close() throws Exception { /* 自动调用 */ }
}

try (DbConn conn = new DbConn()) {
    conn.query("SELECT 1");
}  // 离开 try 块，close() 自动调用
\`\`\`

两者对比：

| 维度 | Python \`with\` | Java \`try-with-resources\` |
|------|---------------|---------------------------|
| 实现接口 | \`__enter__\`/\`__exit__\` 魔术方法 | \`AutoCloseable\` 接口 |
| 是否需要 try | 不需要（可单独用） | 必须在 try 里 |
| 异常吞咽 | \`__exit__\` 返回值控制 | 不能吞（异常会传播） |
| 多资源 | 多个 with 或逗号 | 分号分隔多个 |
| 抑制异常 | 无（自己处理） | \`addSuppressed\`（资源关闭时抛异常会被抑制） |

\`\`\`python
# Python 多资源
with open("a") as a, open("b") as b:
    pass
\`\`\`

\`\`\`java
// Java 多资源
try (java.io.FileReader a = new java.io.FileReader("a");
     java.io.FileReader b = new java.io.FileReader("b")) {
    // ...
}
\`\`\`

Java 一个独特能力：如果 try 块抛了异常，**资源关闭时又抛了异常**，后者的异常会被"抑制"（attached as suppressed）到前者上：

\`\`\`java
try {
    try (Resource r = new Resource()) {
        throw new RuntimeException("主异常");
    }  // r.close() 抛 IOException("关闭异常")
} catch (Exception e) {
    e.printStackTrace();
    // 主异常: RuntimeException: 主异常
    //   Suppressed: IOException: 关闭异常
    Throwable[] suppressed = e.getSuppressed();
}
\`\`\`

Python 的 \`__exit__\` 拿到异常信息后可以自己决定怎么处理，但没有自动的 suppressed 机制。

## 八、异常性能

异常的性能开销主要在"抛出时构建栈追踪"。

\`\`\`python
# Python：异常开销大，不该用于正常控制流
def find_even(nums):
    for n in nums:
        if n % 2 == 0:
            return n
    raise ValueError("没有偶数")  # 抛异常慢

# 比返回 None 慢 10-100 倍
\`\`\`

\`\`\`java
// Java：异常开销也大（构建堆栈）
public static int findEven(int[] nums) {
    for (int n : nums) {
        if (n % 2 == 0) return n;
    }
    throw new IllegalArgumentException("没有偶数");
}
\`\`\`

实测：Python 抛一次异常约 1-10 微秒，Java 约 0.1-1 微秒（JIT 优化后）。两者都**比正常返回慢一两个数量级**。

例外：Java 的 JVM 在某些情况下能"快速抛出"（不构建完整堆栈），但仍不适合热路径。Python 3.11+ 优化了异常处理速度（PEP 654、zero-cost exception），但仍比正常路径慢。

**结论**：异常只用于"异常情况"，不要用于正常控制流（不要用 try-catch 替代 if-else）。

## 九、最佳实践

### Python

\`\`\`python
# ❌ 不要捕获过宽
try:
    process()
except Exception:  # ❌ 太宽，会吞掉 KeyboardInterrupt 之外的所有
    pass

# ✓ 捕获具体异常
try:
    process()
except (ConnectionError, TimeoutError) as e:
    print(f"网络问题: {e}")
    retry()

# ✓ 重抛时保留原异常
except OSError as e:
    raise MyError("处理失败") from e
\`\`\`

### Java

\`\`\`java
// ❌ 不要吞异常
try { } catch (Exception e) { /* 空 */ }  // 反模式

// ✓ 至少记日志或包装重抛
try { } catch (IOException e) {
    log.warn("处理失败", e);
    throw new BusinessException("处理失败", e);
}

// ✓ 优先非受检异常（现代风格）
public class BusinessException extends RuntimeException { }

// ✓ try-with-resources 管理资源
try (Connection conn = dataSource.getConnection()) { }
\`\`\`

## 十、对比总表

| 维度 | Python | Java |
|------|--------|------|
| 异常基类 | BaseException | Throwable |
| 受检异常 | 无 | 有（Exception 子类，非 RuntimeException） |
| 捕获语法 | \`except\` | \`catch\` |
| 异常绑定 | \`as e\` | \`(Exception e)\` |
| else 子句 | 有 | 无 |
| throws 声明 | 无 | 有（受检异常必须） |
| 异常链 | \`raise from\` + \`__context__\` | \`new X(msg, cause)\` + \`getCause\` |
| 资源管理 | \`with\` | \`try-with-resources\` |
| 抑制异常 | 无自动机制 | \`addSuppressed\` |
| 自定义异常 | 继承 Exception | 继承 Exception 或 RuntimeException |
| 多重捕获 \| \`except (A, B)\` | \`catch (A | B)\` |
| 性能 | 较慢（3.11 后优化） | 较慢（JIT 可优化） |

## 十一、一句话总结

- **Python 异常**简单直接：全非受检、无 throws、\`with\` 管资源，把"该不该处理"的决定权交给程序员。
- **Java 异常**工程化强但争议大：受检异常的"强制契约"理想很美，实践却屡屡诱发异常吞噬和包装地狱，业界正悄悄向"全非受检"靠拢。

---

> **下一章**：异常之后，我们看模块系统——Python 一个 .py 文件就是一个模块，Java 用 package + 目录结构组织，Java 9 又引入了 JPMS 模块系统，两边的代码组织哲学截然不同。`,
  },
  {
    id: "pyvsjava-modules",
    icon: "📦",
    title: "模块系统",
    group: "语法与类型",
    content: `# 模块系统

## 一、代码组织的基本单位

代码量一大，就要拆文件、拆目录、按主题分组。两门语言在"模块"上的设计差异巨大。

\`\`\`python
# Python：一个 .py 文件就是一个模块
# 文件 math_utils.py 就是模块 math_utils
def add(a, b):
    return a + b

# 别的文件里
import math_utils
math_utils.add(1, 2)
\`\`\`

\`\`\`java
// Java：一个 .java 文件必须属于某个 package
// 文件路径 src/com/example/MathUtils.java
package com.example;

public class MathUtils {
    public static int add(int a, int b) { return a + b; }
}

// 别的文件里
import com.example.MathUtils;
MathUtils.add(1, 2);
\`\`\`

最根本的差异：**Python 的模块就是文件，Java 的包是目录 + package 声明**。

| 维度 | Python | Java |
|------|--------|------|
| 模块单位 | 一个 .py 文件 | 一个 .java 文件（一个顶级类型） |
| 包单位 | 一个目录（含 \`__init__.py\`） | 一个目录 + package 声明 |
| 命名空间 | 文件名即模块名 | 域名反写（com.example） |
| 包声明 | 隐式（目录结构） | 显式 \`package x.y;\` |
| 导入语法 | \`import x\` / \`from x import y\` | \`import x.y.Class;\` |
| 文件名 vs 类名 | 模块名 = 文件名 | 类名必须 = 文件名 |

## 二、import 机制对比

### Python import

\`\`\`python
# 导入整个模块
import os
os.getcwd()

# 导入模块并起别名
import numpy as np
np.array([1, 2])

# 从模块导入特定名字
from collections import defaultdict, OrderedDict
d = defaultdict(list)

# 从模块导入所有公开名字（不推荐）
from os import *  # 污染命名空间

# 相对导入（包内）
from . import sibling        # 同级模块
from .. import parent        # 上级
from .models import User     # 同级 models 模块
\`\`\`

Python import 是**运行时执行**的：导入一个模块，会**执行该模块的顶层代码**，并把模块对象塞进 \`sys.modules\` 缓存。

\`\`\`python
import my_module  # 此时 my_module.py 的所有顶层代码都执行一遍
import my_module  # 第二次：直接从 sys.modules 拿，不重新执行
\`\`\`

### Java import

\`\`\`java
// 导入单个类
import java.util.List;
import java.util.Map;

// 导入整个包（按需，不递归子包）
import java.util.*;
List<String> list = new ArrayList<>();
Map<String, Integer> map = new HashMap<>();

// 静态导入（导入静态成员）
import static java.lang.Math.PI;
import static java.lang.Math.sqrt;
double r = sqrt(2 * PI);

// Java 不支持相对导入，也没有"从模块导入部分符号"
\`\`\`

Java import 是**编译期**的——只是个"类型别名提示"，告诉编译器 \`List\` 指的是 \`java.util.List\`。运行时（字节码层面）所有类型都用**全限定名** \`java.util.List\`，import 语句在字节码里**根本不存在**。

\`\`\`java
// 编译后字节码里：
// getfield java/util/List
// 而不是 List
\`\`\`

一个关键差异：Python 的 \`from x import *\` 是运行时执行的，会污染当前命名空间；Java 的 \`import x.*\` 只是编译期提示，**不会污染**运行时命名空间。

## 三、__init__.py vs package-info

### Python 的 __init__.py

Python 包是"含 \`__init__.py\` 的目录"。\`__init__.py\` 是包的"入口文件"：

\`\`\`
mypackage/
    __init__.py        # 包初始化
    models.py
    views.py
    utils/
        __init__.py
        helpers.py
\`\`\`

\`\`\`python
# mypackage/__init__.py
from .models import User
from .views import index

__all__ = ["User", "index"]
__version__ = "1.0.0"

# 这样外部就能：
# from mypackage import User
# 而不用 from mypackage.models import User
\`\`\`

\`__init__.py\` 还能控制：
- 包级别的初始化代码（如注册日志、加载配置）
- \`__all__\` 控制导出
- \`__path__\` 控制包搜索路径（命名空间包）

Python 3.3+ 支持**命名空间包**（无 \`__init__.py\` 的目录也能当包），但常规包仍然推荐用 \`__init__.py\`。

### Java 的 package-info.java

Java 6 引入 \`package-info.java\`，用于包级别注解和文档：

\`\`\`java
// com/example/package-info.java
/**
 * 用户管理模块。
 */
@NonNullApi
package com.example;

import org.springframework.lang.NonNullApi;
\`\`\`

但它的作用远不如 Python 的 \`__init__.py\`——不能写初始化代码，不能控制导出，主要是给 javadoc 和注解用的。

## 四、命名空间包

Python 的命名空间包（PEP 420）允许**一个包跨多个目录**：

\`\`\`python
# 假设有两个独立的库都提供 mylib.plugins 插件：
# /site-packages/mylib/plugins/a.py    # 来自 mylib-core
# /site-packages/mylib/plugins/b.py    # 来自 mylib-extras

# import mylib.plugins 会合并两个目录的内容
import mylib.plugins.a
import mylib.plugins.b
\`\`\`

Java 没有等价概念——Java 的包和目录是严格一对一的。同一包名只能对应一个目录。

## 五、Java 9 模块系统（JPMS）

Java 9（2017）引入了**Java Platform Module System（JPMS）**，用 \`module-info.java\` 显式声明模块及其依赖：

\`\`\`java
// src/com.example.app/module-info.java
module com.example.app {
    requires com.example.utils;    // 依赖其他模块
    requires java.sql;             // 依赖 JDK 模块
    exports com.example.app.api;   // 只导出 api 包
    // com.example.app.internal 不导出，对外不可见
    opens com.example.app.dto to com.fasterxml.jackson.databind;
}
\`\`\`

JPMS 的核心思想：
1. **强封装**：模块只 \`exports\` 指定的包才能被其他模块访问，未导出的包即使 \`public\` 也对外不可见
2. **显式依赖**：\`requires\` 明确声明依赖，启动时 JVM 验证依赖图
3. **可靠配置**：编译期和启动期就能发现"找不到模块"问题

\`\`\`java
// 模块外访问未 exports 的包 → 编译报错或运行时 IllegalAccessError
module com.example.app {
    exports com.example.app.api;
    // internal 包未 exports
}

// 另一个模块
import com.example.app.internal.Secret;  // ❌ 编译失败
\`\`\`

### Python 没有正式的模块系统

Python 的 \`__all__\` 是个"软导出"——只控制 \`from x import *\` 的行为，不阻止显式导入：

\`\`\`python
# mymodule.py
__all__ = ["public_func"]

def public_func():
    pass

def _private_func():  # 约定下划线开头是私有的，但不强制
    pass

# 外部
from mymodule import *  # 只导入 public_func
from mymodule import _private_func  # 仍然能用！只是不推荐
\`\`\`

Python 没有 \`requires\` 声明依赖、没有"模块边界"概念。包之间的依赖靠 **pip + requirements.txt / pyproject.toml** 在**安装期**解决，不是运行时。

| 维度 | Java JPMS | Python |
|------|-----------|--------|
| 引入版本 | Java 9（2017） | 无正式模块系统 |
| 模块声明 | \`module-info.java\` | 无（靠包目录） |
| 显式依赖 | \`requires\` | 无（靠 pip） |
| 强封装 | \`exports\` 控制 | 无（\`__all__\` 是软的） |
| 运行时验证 | 启动时检查依赖图 | 无 |
| 采用率 | 缓慢（很多库未模块化） | — |

实际上 JPMS 在 Java 生态里**采用率很低**——大量库仍是"传统 jar"，因为模块化改造成本高、收益对中小项目不明显。Spring、Hibernate 等主流框架直到现在才逐步支持。这是 Java 一个"叫好不叫座"的特性。

## 六、循环导入：Python 的痛

Python 的运行时 import 机制带来一个 Java 没有的经典问题：**循环导入**。

\`\`\`python
# a.py
from b import b_func

def a_func():
    b_func()

# b.py
from a import a_func

def b_func():
    a_func()
\`\`\`

\`\`\`python
import a
# ImportError: cannot import name 'a_func' from partially initialized module 'a'
\`\`\`

原因：导入 \`a\` 时执行 \`from b import b_func\`，触发导入 \`b\`，\`b\` 又执行 \`from a import a_func\`——但此时 \`a\` 还没执行完，\`a_func\` 还没定义，于是报错。

**解决方法**：

\`\`\`python
# 方法 1：把 import 放到函数内（延迟导入）
# a.py
def a_func():
    from b import b_func  # 运行时才导入
    b_func()

# 方法 2：只导入模块，不导入符号
# a.py
import b

def a_func():
    b.b_func()

# 方法 3：重构，把共享逻辑抽到 c.py
# c.py
def shared():
    pass
# a.py 和 b.py 都 from c import shared
\`\`\`

**Java 没有循环导入问题**——Java 是编译期解析，类型之间互相引用完全合法：

\`\`\`java
// A.java
package com.example;
public class A {
    public void a() { new B().b(); }
}

// B.java
package com.example;
public class B {
    public void b() { new A().a(); }
}
// 完全合法，编译器无所谓顺序
\`\`\`

这是 Java 编译期 import + 全限定名机制的天然优势。Python 的循环导入是它"import 即执行"设计的副作用，初学者经常踩坑。

## 七、__all__ vs access control

### Python 的可见性控制

\`\`\`python
# mymodule.py
__all__ = ["Public", "public_func"]

def public_func():
    pass

def _private_func():        # 约定：下划线前缀 = 私有
    pass

def __name_mangled_func():  # 双下划线 = 名称改写（类内）
    pass

class Public:
    pass

class _Internal:
    pass
\`\`\`

规则：
- \`__all__\`：控制 \`from x import *\` 导出哪些（不影响显式导入）
- 单下划线 \`_x\`：约定私有，"不应"被外部访问（但能访问）
- 双下划线 \`__x\`（类内）：名称改写，避免子类冲突，仍可访问
- 没有"protected"、"package-private"

### Java 的访问控制

Java 有 4 级访问控制：

| 修饰符 | 类内 | 同包 | 子类 | 全局 |
|--------|------|------|------|------|
| \`public\` | ✓ | ✓ | ✓ | ✓ |
| \`protected\` | ✓ | ✓ | ✓ | ✗ |
| （默认/package-private） | ✓ | ✓ | ✗ | ✗ |
| \`private\` | ✓ | ✗ | ✗ | ✗ |

\`\`\`java
package com.example;

public class User {
    public String name;          // 全局可见
    protected int age;           // 同包 + 子类
    String internalId;           // package-private（同包）
    private String password;     // 仅本类

    public void login() { }
    private void hashPassword() { }
}
\`\`\`

Java 的访问控制是**编译期强制**的，违反会编译报错。Python 是**约定 + 运行时可绕过**——私有不强制，开发者自觉。

| 维度 | Python | Java |
|------|--------|------|
| 控制 granularity | 命名约定（弱） | 4 级修饰符（强） |
| 强制性 | 不强制（可绕过） | 编译期强制 |
| 包私有 | 无 | 有（默认） |
| protected | 无 | 有 |
| private | \`_x\` 约定 / \`__x\` 改写 | \`private\` 关键字 |
| 模块边界 | 无 | JPMS \`exports\` |

## 八、第三方包管理

### Python

\`\`\`bash
# pip 安装
pip install requests
pip install -r requirements.txt

# 现代：pyproject.toml + poetry/uv
# pyproject.toml
# [project]
# dependencies = ["requests>=2.31", "numpy>=1.24"]

# uv（新一代，Rust 写的，快）
uv pip install requests
uv add requests  # 加到 pyproject.toml
\`\`\`

Python 包生态：PyPI（仓库）+ pip（安装器）+ venv/conda（虚拟环境）+ pyproject.toml（项目元数据）。

### Java

\`\`\`bash
# Maven
mvn install
# pom.xml 声明依赖

# Gradle
gradle build
# build.gradle 声明依赖
\`\`\`

\`\`\`xml
<!-- pom.xml -->
<dependencies>
    <dependency>
        <groupId>org.apache.httpcomponents</groupId>
        <artifactId>httpclient</artifactId>
        <version>4.5.13</version>
    </dependency>
</dependencies>
\`\`\`

Java 包生态：Maven Central（仓库）+ Maven/Gradle（构建工具）+ pom.xml/build.gradle（依赖声明）。Java 没有"虚拟环境"概念——依赖都装到本地仓库 \`~/.m2/repository\`，靠 build 工具管理版本。

| 维度 | Python | Java |
|------|--------|------|
| 仓库 | PyPI | Maven Central |
| 安装器 | pip / uv | Maven / Gradle |
| 依赖文件 | requirements.txt / pyproject.toml | pom.xml / build.gradle |
| 虚拟环境 | venv / conda | 无（全局 ~/.m2） |
| 锁文件 | poetry.lock / uv.lock | gradle.lockfile |
| 速度 | pip 慢 / uv 极快 | Maven 中等 / Gradle 快 |

## 九、对比总表

| 维度 | Python | Java |
|------|--------|------|
| 模块单位 | .py 文件 | .java 文件 |
| 包单位 | 目录 + \`__init__.py\` | 目录 + package 声明 |
| import 时机 | 运行时执行 | 编译期解析 |
| 循环导入 | 有问题（要绕） | 无问题 |
| 包初始化 | \`__init__.py\` | \`package-info.java\`（弱） |
| 命名空间包 | 有（PEP 420） | 无 |
| 模块系统 | 无正式系统 | JPMS（Java 9） |
| 访问控制 | 约定（弱） | 4 级修饰符（强） |
| 包管理 | pip + PyPI | Maven/Gradle + Maven Central |
| 虚拟环境 | venv/conda | 无 |

## 十、一句话总结

- **Python 模块系统**简单灵活：文件即模块、import 即执行、\`__init__.py\` 控初始化，但循环导入和弱可见性是它的代价。
- **Java 模块系统**严谨工程化：package + import 编译期解析、4 级访问控制、JPMS 提供强封装，但 JPMS 采用率低、过度设计之嫌明显。

---

> **下一章**：模块之后，我们看字符串和编码——Python 3 原生 Unicode，Java 用 UTF-16 内部表示，这个差异让两者在处理 emoji、生僻字时表现截然不同。`,
  },
  {
    id: "pyvsjava-strings",
    icon: "🔤",
    title: "字符串与编码",
    group: "语法与类型",
    content: `# 字符串与编码

## 一、字符串的本质

字符串是几乎所有程序都绕不开的数据类型，但 Python 和 Java 在字符串的内部表示和设计哲学上有显著差异。

\`\`\`python
# Python：str 是 Unicode 码点序列
s = "你好"
print(len(s))            # 2（两个码点）
print([hex(ord(c)) for c in s])  # ['0x4f60', '0x597d']
\`\`\`

\`\`\`java
// Java：String 内部是 UTF-16 编码的 char 序列
String s = "你好";
System.out.println(s.length());      // 2（两个 UTF-16 单元）
// 但对于 emoji 就不一样了
String emoji = "😀";
System.out.println(emoji.length());  // 2！surrogate pair
\`\`\`

最根本的差异：
- **Python 3 的 \`str\` 是 Unicode 码点（code point）序列**，一个字符就是一个元素
- **Java 的 \`String\` 内部是 UTF-16 编码的 \`char\` 序列**，一个"字符"可能是 1 个或 2 个 \`char\`

| 维度 | Python \`str\` | Java \`String\` |
|------|---------------|---------------|
| 内部表示 | Unicode 码点序列 | UTF-16 \`char[]\`（JDK 9+ Compact Strings） |
| 字符类型 | 无 char，单字符是长度 1 的 str | \`char\`（16 位 UTF-16 单元） |
| 长度含义 | 码点数 | UTF-16 单元数（不是码点数！） |
| 不可变 | 是 | 是 |
| 内存表示 | PEP 393 灵活（1/2/4 字节按需） | byte[] + 编码标记（JDK 9+） |

## 二、char 类型：Python 没有，Java 有

Java 有专门的 \`char\` 类型，是 16 位无符号整数，表示一个 UTF-16 编码单元：

\`\`\`java
char c = 'A';
char zh = '中';
System.out.println((int) c);   // 65
System.out.println((int) zh);  // 20013

char[] arr = "abc".toCharArray();
\`\`\`

Python **没有 char 类型**——单字符就是长度为 1 的 \`str\`：

\`\`\`python
c = "A"
zh = "中"
print(ord(c))   # 65
print(ord(zh))  # 20013
print(len(c))   # 1

# 想遍历字符，直接遍历 str
for ch in "abc":
    print(ch)  # 'a', 'b', 'c'
\`\`\`

| 操作 | Python | Java |
|------|--------|------|
| 单字符字面量 | \`"a"\`（str） | \`'a'\`（char，单引号） |
| 字符串字面量 | \`"abc"\`（str） | \`"abc"\`（String，双引号） |
| char ↔ int | \`ord(c)\` / \`chr(65)\` | \`(int) c\` / \`(char) 65\` |
| char 是否独立类型 | 否（是 str） | 是（16 位整数） |

Java 的单引号是 \`char\`，双引号是 \`String\`，初学者容易搞混：

\`\`\`java
char c = "A";   // ❌ 编译错误，"A" 是 String
String s = 'A'; // ❌ 编译错误，'A' 是 char
char c2 = 'A';  // ✓
String s2 = "A";// ✓
\`\`\`

## 三、不可变性

两边字符串都**不可变**，但实现机制不同。

\`\`\`python
# Python：str 不可变
s = "hello"
# s[0] = "H"  # ❌ TypeError: 'str' object does not support item assignment
new_s = "H" + s[1:]  # 创建新对象

# 拼接大量字符串时，用 join 而非 +
parts = ["a", "b", "c"]
result = "".join(parts)  # 高效
\`\`\`

\`\`\`java
// Java：String 不可变
String s = "hello";
// s = s + " world";  // 创建新对象，原对象不变

// 拼接大量字符串用 StringBuilder
StringBuilder sb = new StringBuilder();
for (String part : parts) {
    sb.append(part);
}
String result = sb.toString();
\`\`\`

为什么不可变？
1. **线程安全**：不可变对象天然线程安全
2. **哈希缓存**：hashCode 算一次后缓存
3. **字符串常量池**：相同字面量可共享
4. **安全性**：作为参数传递时不会被改

Java 还提供可变的 \`StringBuilder\`（单线程）和 \`StringBuffer\`（线程安全，同步开销大）：

\`\`\`java
StringBuilder sb = new StringBuilder();  // 单线程，推荐
StringBuffer sb2 = new StringBuffer();   // 线程安全，慢
\`\`\`

Python 没有官方的"可变字符串"类型，但有 \`io.StringIO\` 或 \`list\` 累积：

\`\`\`python
import io
buf = io.StringIO()
for part in parts:
    buf.write(part)
result = buf.getvalue()
\`\`\`

## 四、f-string vs String.format

字符串格式化是高频操作，两边的演进都很有意思。

### Python：f-string（PEP 498，3.6+）

\`\`\`python
name = "Alice"
age = 30
s = f"姓名: {name}, 年龄: {age}"
# 调用表达式
s2 = f"明年 {age + 1} 岁"
# 格式说明符
s3 = f"{3.14159:.2f}"        # "3.14"
s4 = f"{1234567:,}"          # "1,234,567"
s5 = f"{name:>10}"           # 右对齐宽度 10
# 调试语法（3.8+）
x = 42
print(f"{x = }")             # x = 42
\`\`\`

f-string 简洁、可读、快（编译期优化），是 Python 字符串格式化的**首选**。

历史演进：
- \`%\` 格式化（C 风格）：\`"姓名: %s" % name\`
- \`str.format\`：\`"姓名: {}".format(name)\`
- f-string：\`f"姓名: {name}"\`

### Java：String.format / printf

\`\`\`java
String name = "Alice";
int age = 30;
String s = String.format("姓名: %s, 年龄: %d", name, age);

// 格式说明符
String s2 = String.format("%.2f", 3.14159);    // "3.14"
String s3 = String.format("%,d", 1234567);     // "1,234,567"
String s4 = String.format("%10s", "Alice");    // "     Alice"

// JDK 15+：String.formatted（简化）
String s5 = "姓名: %s, 年龄: %d".formatted(name, age);
\`\`\`

Java 没有 f-string 这种"直接嵌入变量"的语法。最接近的是 \`MessageFormat\` 或第三方库（如 SLF4J 的 \`{}\` 占位符）：

\`\`\`java
// MessageFormat
String s = java.text.MessageFormat.format("姓名: {0}, 年龄: {1}", name, age);

// SLF4J 日志
log.info("姓名: {}, 年龄: {}", name, age);
\`\`\`

JDK 21 引入了**字符串模板**（Preview），总算有了类似 f-string 的能力：

\`\`\`java
// JDK 21+（Preview）
String s = STR."姓名: \\{name}, 年龄: \\{age}";
\`\`\`

但截至现在仍是 preview 特性，尚未稳定。

| 维度 | Python f-string | Java String.format |
|------|-----------------|-------------------|
| 语法 | \`f"{x}"\` | \`String.format("%s", x)\` |
| 表达式嵌入 | ✓（任意表达式） | ✗（只有占位符） |
| 类型安全 | 运行时检查 | 运行时（占位符与参数不匹配抛异常） |
| 性能 | 编译期优化 | 运行时解析 |
| 可读性 | 高 | 中 |

## 五、字符串拼接性能

\`\`\`python
# ❌ 慢：循环里用 +
result = ""
for s in parts:
    result += s  # 每次都创建新对象，O(n²)

# ✓ 快：用 join
result = "".join(parts)  # O(n)
\`\`\`

\`\`\`java
// ❌ 慢：循环里用 +
String result = "";
for (String s : parts) {
    result += s;  // 每次创建新 String + StringBuilder
}

// ✓ 快：用 StringBuilder
StringBuilder sb = new StringBuilder();
for (String s : parts) {
    sb.append(s);
}
String result = sb.toString();
\`\`\`

不过 Java 编译器对 \`+\` 拼接做了优化——单行表达式里的 \`+\` 会自动翻译成 \`StringBuilder\`（或 JDK 9+ 的 \`invokedynamic\`）：

\`\`\`java
// 这行会被编译器优化成 StringBuilder.append 链
String s = a + b + c + d;
// 等价于
String s2 = new StringBuilder().append(a).append(b).append(c).append(d).toString();
\`\`\`

所以**单行拼接用 \`+\` 没问题**，**循环里用 \`+\` 才慢**（每次循环都 new 一个 StringBuilder）。

Python 的 \`+\` 拼接也有 CPython 优化（在 str 引用计数为 1 时原地扩展），但**循环里仍推荐 join**。

## 六、编码：bytes vs Charset

### Python 的 bytes

Python 严格区分 \`str\`（文本）和 \`bytes\`（字节）：

\`\`\`python
# str ↔ bytes 转换
s = "你好"
b = s.encode("utf-8")      # str → bytes
print(b)                    # b'\\xe4\\xbd\\xa0\\xe5\\xa5\\xbd'
print(len(b))               # 6（UTF-8 编码占 6 字节）

s2 = b.decode("utf-8")      # bytes → str
print(s2)                   # 你好

# 指定错误处理
s3 = b.decode("utf-8", errors="replace")
s4 = b.decode("utf-8", errors="ignore")
\`\`\`

\`\`\`python
# 读取文件要明确编码
with open("file.txt", encoding="utf-8") as f:
    text = f.read()  # str

# 不指定编码 → 用系统默认（Windows 上是 GBK，坑！）
with open("file.txt") as f:  # 不推荐
    text = f.read()
\`\`\`

### Java 的 byte[] + Charset

Java 用 \`byte[]\` + \`Charset\` 处理字节：

\`\`\`java
String s = "你好";
byte[] b = s.getBytes(StandardCharsets.UTF_8);  // String → byte[]
System.out.println(b.length);  // 6

String s2 = new String(b, StandardCharsets.UTF_8);  // byte[] → String
System.out.println(s2);  // 你好
\`\`\`

\`\`\`java
// 读取文件
try (java.io.BufferedReader r = java.nio.file.Files.newBufferedReader(
        java.nio.file.Path.of("file.txt"), StandardCharsets.UTF_8)) {
    String line = r.readLine();
}

// Files.readString（JDK 11+）
String content = java.nio.file.Files.readString(
    java.nio.file.Path.of("file.txt"), StandardCharsets.UTF_8);
\`\`\`

**关键差异**：Python 默认编码是 UTF-8（3.0+，PEP 540），Java 默认编码是**系统编码**（取决于平台，Linux 通常 UTF-8，Windows 可能是 GBK/CP1252）。这导致 Java 跨平台时容易出乱码：

\`\`\`java
// ❌ 不指定编码，跨平台可能乱码
byte[] b = s.getBytes();              // 用系统默认编码
String s3 = new String(b);            // 用系统默认解码
// Files.readString(Path.of("file.txt"));// 用系统默认编码

// ✓ 显式指定 UTF-8
byte[] b2 = s.getBytes(StandardCharsets.UTF_8);
\`\`\`

Python 3 强制区分 str/bytes，强制显式编码转换，**避免了 Python 2 时代的乱码地狱**。这是 Python 3 最大的改进之一。

## 七、Unicode 处理差异：surrogate pair 之痛

这是 Java 字符串最被诟病的地方。

\`\`\`python
# Python 3：原生 Unicode，emoji 是一个字符
emoji = "😀"
print(len(emoji))           # 1
print(ord(emoji))           # 128512
for c in emoji:
    print(c)                # 😀
\`\`\`

\`\`\`java
// Java：UTF-16 内部表示，emoji 是两个 char（surrogate pair）
String emoji = "😀";
System.out.println(emoji.length());        // 2！
// System.out.println(emoji.charAt(0));    // 输出乱码（高代理项）
// System.out.println(emoji.codePointAt(0)); // 128512 ✓

// 遍历"字符"要小心
for (int i = 0; i < emoji.length(); i++) {
    char c = emoji.charAt(i);
    System.out.println(c);  // 输出两个乱码字符
}

// 正确遍历码点
emoji.codePoints().forEach(cp -> {
    System.out.println(Character.toString(cp));  // 😀
});

// 字符串长度（码点数）
int len = emoji.codePointCount(0, emoji.length());  // 1
\`\`\`

Java 处理 emoji、生僻字（如部分 CJK 扩展汉字）时，\`length()\`、\`charAt()\`、\`substring()\` 都可能"截断"surrogate pair，导致乱码：

\`\`\`java
String s = "a😀b";
// 错误截取
String sub = s.substring(0, 2);  // "a?" + 截断了 emoji 的代理对
// 正确做法：用 BreakIterator 或 codePoint 处理
\`\`\`

Python 3 没有这个问题——\`len()\`、切片、遍历都按码点，emoji 就是一个字符。

这是 Python 3 设计上的胜利：**PEP 393 让 \`str\` 内部按需使用 1/2/4 字节存储，但对外永远是码点语义**。Java 的 \`String\` API 设计于 Unicode 还只有 16 位（UCS-2）的年代，后来 Unicode 扩展到 21 位，Java 只能用 surrogate pair 兼容，背上了历史包袱。

| 操作 | Python（码点语义） | Java（UTF-16 语义） |
|------|---------------------|---------------------|
| \`len("😀")\` | 1 | 2 |
| \`for c in "😀"\` | 1 次循环 | 2 次（拆开） |
| 切片 \`"a😀b"[1]\` | "😀" | 截断的乱码 |
| 反转 \`"abc"[::-1]\` | "cba" ✓ | emoji 可能被拆开 |

Java 反转含 emoji 的字符串是经典面试坑：

\`\`\`java
// 反转字符串
String s = "abc😀def";
String reversed = new StringBuilder(s).reverse().toString();
// "fed??cba" —— emoji 被拆开成乱码（surrogate pair 顺序也反了）
\`\`\`

正确反转要按码点：

\`\`\`java
int[] cps = s.codePoints().toArray();
StringBuilder sb = new StringBuilder();
for (int i = cps.length - 1; i >= 0; i--) {
    sb.appendCodePoint(cps[i]);
}
String reversed2 = sb.toString();  // "fed😀cba" ✓
\`\`\`

## 八、正则表达式

### Python：re 模块

\`\`\`python
import re

# 编译 + 复用
email_re = re.compile(r"^[\\w.+-]+@[\\w-]+\\.[\\w.]+$")

# 匹配
m = re.match(r"(\\d+)-(\\d+)", "123-456")
if m:
    print(m.group(0))  # 123-456
    print(m.group(1))  # 123
    print(m.group(2))  # 456

# 查找所有
re.findall(r"\\d+", "a1b22c333")  # ['1', '22', '333']

# 替换
re.sub(r"\\d+", "#", "a1b22c333")  # "a#b#c#"

# 命名分组
m = re.match(r"(?P<year>\\d{4})-(?P<month>\\d{2})", "2024-01")
print(m.group("year"))   # 2024
print(m.group("month"))  # 01
\`\`\`

### Java：java.util.regex

\`\`\`java
import java.util.regex.*;

// 编译 + 复用
Pattern emailRe = Pattern.compile("^[\\\\w.+-]+@[\\\\w-]+\\\\.[\\\\w.]+$");

// 匹配
Matcher m = Pattern.compile("(\\\\d+)-(\\\\d+)").matcher("123-456");
if (m.matches()) {
    System.out.println(m.group(0));  // 123-456
    System.out.println(m.group(1));  // 123
    System.out.println(m.group(2));  // 456
}

// 查找所有
java.util.List<String> all = new java.util.ArrayList<>();
Matcher m2 = Pattern.compile("\\\\d+").matcher("a1b22c333");
while (m2.find()) {
    all.add(m2.group());
}  // ["1", "22", "333"]

// 替换
String r = "a1b22c333".replaceAll("\\\\d+", "#");  // "a#b#c#"

// 命名分组
Matcher m3 = Pattern.compile("(?<year>\\\\d{4})-(?<month>\\\\d{2})").matcher("2024-01");
if (m3.matches()) {
    System.out.println(m3.group("year"));   // 2024
    System.out.println(m3.group("month"));  // 01
}
\`\`\`

对比：

| 维度 | Python re | Java regex |
|------|-----------|------------|
| API 风格 | 函数式（\`re.match\`） | 面向对象（\`Pattern\`/\`Matcher\`） |
| 正则字符串 | \`r"..."\`（raw string） | 普通字符串（要双转义 \`\\\\d\`） |
| 命名分组 | \`(?P<name>...)\` | \`(?<name>...)\` |
| 不可变 Pattern | ✓（编译后复用） | ✓（\`Pattern\` 线程安全） |
| 性能 | 中等 | 较快（JIT） |

Python 的 \`r"..."\` raw string 让正则不用双转义，**比 Java 直观很多**：

\`\`\`python
import re
# Python
re.match(r"\\d+\\s+", text)  # 写什么就是什么
\`\`\`

\`\`\`java
// Java
Pattern.compile("\\\\d+\\\\s+");  // 每个反斜杠都要双写
\`\`\`

## 九、对比总表

| 维度 | Python | Java |
|------|--------|------|
| 字符串类型 | \`str\`（码点序列） | \`String\`（UTF-16 序列） |
| char 类型 | 无（单字符是 str） | \`char\`（16 位） |
| 不可变 | 是 | 是 |
| 可变版本 | 无（用 StringIO/list） | \`StringBuilder\`/\`StringBuffer\` |
| 格式化 | f-string | \`String.format\` |
| 字符串模板 | f-string（成熟） | 字符串模板（JDK 21 preview） |
| 拼接优化 | join | StringBuilder |
| 字节类型 | \`bytes\`（独立类型） | \`byte[]\`（数组） |
| 默认编码 | UTF-8 | 系统编码（坑） |
| Unicode 长度语义 | 码点 | UTF-16 单元（emoji 麻烦） |
| 正则 raw string | \`r"..."\` | 无（双转义） |
| 正则 API | 函数式 | OO（Pattern/Matcher） |

## 十、一句话总结

- **Python 字符串**是 Unicode 时代的原生设计：str 即码点、bytes 独立、f-string 优雅、emoji 无障碍，是 Python 3 相对 Python 2 最大的胜利。
- **Java 字符串**背负 UTF-16 历史包袱：surrogate pair 让 emoji 处理处处踩坑、默认编码依赖系统、正则双转义繁琐，但 JIT 优化和 StringBuilder 让性能稳。

---

> **下一章**：字符串之后，第 3 批章节结束。"语法与类型"分组告一段落，下一批我们将进入"函数与并发"的世界——Python 的函数是一等公民、闭包、装饰器，Java 的 lambda、Stream、函数式接口，以及两者并发模型的根本差异。`,
  },
];
