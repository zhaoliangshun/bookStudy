// =============================================================
// Python vs JavaScript/TypeScript/Node.js 深度对比 —— 第 2 批
// -------------------------------------------------------------
// 转义规则：content 内部反引号写作 \`，${ 写作 \$\{
// =============================================================

export const chapters = [
  {
    id: "pyvsjs-types",
    icon: "🏷️",
    title: "类型系统总览",
    group: "语法与类型",
    content: `# 类型系统总览

## 一、两个维度，四种语言

要理解 Python 和 JavaScript 的类型系统差异，必须先把两个独立维度拆开看：

1. **动 vs 静**（Dynamic vs Static）：类型检查发生在**运行时**还是**编译时**？
2. **强 vs 弱**（Strong vs Weak）：是否允许**隐式类型转换**？

这两个维度组合出四种风格：

| 组合 | 代表语言 | 特点 |
|------|----------|------|
| 动态强类型 | **Python**、Ruby | 运行时检查 + 不轻易隐式转换 |
| 动态弱类型 | **JavaScript**、PHP | 运行时检查 + 大量隐式转换 |
| 静态强类型 | Java、Go、Rust | 编译期检查 + 严格类型 |
| 静态弱类型 | C | 编译期检查 + 可随意强转 |

**Python 是动态强类型**：变量没有类型声明，但 \`1 + "2"\` 会直接抛 \`TypeError\`。
**JavaScript 是动态弱类型**：变量同样没有类型声明，但 \`1 + "2"\` 得到 \`"12"\`，\`1 - "2"\` 得到 \`-1\`。

这个差异看似只是"一个报错、一个不报错"，但它深刻地影响了两门语言的**可靠性**、**调试体验**和**重构难度**。

## 二、动态性的表现

两门语言都是动态类型——变量本身不绑定类型，值才有类型：

\`\`\`python
# Python：同一个变量可以反复换类型
x = 10          # int
x = "hello"     # str
x = [1, 2, 3]   # list
print(type(x))  # <class 'list'>
\`\`\`

\`\`\`javascript
// JavaScript：同样可以
let x = 10;           // number
x = "hello";          // string
x = [1, 2, 3];        // object (Array)
console.log(typeof x); // "object"
\`\`\`

注意一个著名的坑：JavaScript 的 \`typeof null\` 返回 \`"object"\`——这是 1995 年实现上的 bug，但因为向后兼容的铁律，永远改不了。

## 三、强弱类型：隐式转换的鸿沟

### Python 的"强"：拒绝模糊

\`\`\`python
# Python 不会偷偷帮你转换类型
print(1 + "2")        # TypeError: unsupported operand type(s)
print("3" * 4)        # "3333"  （字符串重复，这是语义明确的）
print([1] + [2])      # [1, 2]  （列表拼接）
print(True + 1)       # 2  （bool 是 int 的子类，这是文档化的行为）
\`\`\`

Python 的逻辑是：**如果你想做类型转换，请显式写出来**。\`int("3")\`、\`str(1)\`、\`float("3.14")\`——意图清晰，没有惊喜。

### JavaScript 的"弱"：处处是惊喜

\`\`\`javascript
// JavaScript 的隐式转换让人又爱又恨
console.log(1 + "2");        // "12"   （+ 优先字符串拼接）
console.log(1 - "2");        // -1     （- 只有数值语义）
console.log("3" * 4);        // 12     （字符串转数字）
console.log([] + []);        // ""     （两个空数组相加 = 空字符串）
console.log([] + {});        // "[object Object]"
console.log({} + []);        // 0 或 "[object Object]"（取决于上下文）
console.log(true + true);    // 2
console.log(null + 1);       // 1     （null 转 0）
console.log(undefined + 1);  // NaN   （undefined 转 NaN）
\`\`\`

JavaScript 的 \`+\` 运算符有两重语义：**数值加法**和**字符串拼接**。当任意一个操作数是字符串时，优先走拼接路径，其他操作数被隐式转成字符串。这条规则引发了一连串看似荒谬的结果。

## 四、== vs ===：JavaScript 的两套相等

JavaScript 有两个相等运算符，这本身就是弱类型设计的产物：

\`\`\`javascript
// == 会做隐式类型转换
console.log(1 == "1");       // true   （字符串转数字）
console.log(0 == false);     // true
console.log(null == undefined); // true
console.log(null == 0);      // false  （这条特别反直觉）
console.log(NaN == NaN);     // false  （NaN 不等于任何值）

// === 严格相等，不做转换
console.log(1 === "1");      // false
console.log(0 === false);    // false
console.log(null === undefined); // false
\`\`\`

**实践建议**：JavaScript 项目里应该永远用 \`===\`，eslint 默认开启 \`eqeqeq\` 规则。\`==\` 的转换表过于复杂（涉及 ToPrimitive、ToNumber、ToBoolean 等抽象操作），没人能全部记住。

## 五、== vs is：Python 的两套相等

Python 也有两个相等判断，但语义完全不同：

\`\`\`python
# == 比较值（调用 __eq__ 方法）
a = [1, 2, 3]
b = [1, 2, 3]
print(a == b)  # True   （值相等）
print(a is b)  # False  （不是同一个对象）

# is 比较身份（内存地址，等价于 id(a) == id(b)）
c = a
print(a is c)  # True   （同一个对象）
\`\`\`

\`is\` 的设计意图是判断"两个引用是否指向同一个对象"。它**不应该**用来比较值，但有一个常见陷阱——小整数缓存：

\`\`\`python
# Python 缓存了 [-5, 257) 范围内的整数
x = 256
y = 256
print(x is y)  # True   （命中缓存，同一个对象）

x = 257
y = 257
print(x is y)  # False  （超出缓存，不同对象）
\`\`\`

这种"看起来相等但 is 结果不一致"的行为，是 Python 新手常踩的坑。**规则**：\`is\` 只用来判断 \`None\`、\`True\`、\`False\`，比较值永远用 \`==\`。

## 六、type() vs typeof：查询类型的方式

\`\`\`python
# Python：type() 返回类型对象本身
print(type(42))         # <class 'int'>
print(type("hello"))    # <class 'str'>
print(type([1, 2]))     # <class 'list'>
print(type(None))       # <class 'NoneType'>

# 用 isinstance() 做类型检查（推荐）
print(isinstance(42, int))           # True
print(isinstance(42, (int, float)))  # True  （支持元组）
print(isinstance(True, int))         # True  （bool 是 int 的子类）
\`\`\`

\`\`\`javascript
// JavaScript：typeof 返回类型字符串
console.log(typeof 42);          // "number"
console.log(typeof "hello");     // "string"
console.log(typeof undefined);   // "undefined"
console.log(typeof null);        // "object"  （历史 bug）
console.log(typeof [1, 2]);      // "object"  （数组也是 object）
console.log(typeof function(){});// "function"

// 判断数组要用 Array.isArray()
console.log(Array.isArray([1, 2]));  // true
console.log([1, 2] instanceof Array); // true
\`\`\`

JavaScript 的 \`typeof\` 有两个著名缺陷：
1. \`typeof null === "object"\`——历史遗留 bug
2. \`typeof []\` 和 \`typeof {}\` 都是 \`"object"\`——无法区分数组和普通对象

## 七、类型对比总表

| 维度 | Python | JavaScript |
|------|--------|------------|
| 类型系统分类 | 动态强类型 | 动态弱类型 |
| 类型检查时机 | 运行时 | 运行时 |
| 隐式类型转换 | 很少（仅 bool→int 等文档化行为） | 大量（+、-、==、if 等） |
| 相等运算符 | \`==\`（值）、\`is\`（身份） | \`==\`（带转换）、\`===\`（严格） |
| 类型查询 | \`type(x)\` 返回类型对象 | \`typeof x\` 返回字符串 |
| 类型判断 | \`isinstance(x, T)\` | \`typeof\`、\`instanceof\`、\`Array.isArray\` |
| 数字类型 | int（无限精度）、float、complex | number（双精度浮点）、bigint |
| 空值 | \`None\`（单一） | \`null\` + \`undefined\`（两个） |
| 布尔类型 | \`True\`/\`False\`（首字母大写） | \`true\`/\`false\`（小写） |
| 数组类型 | \`list\`（独立类型） | \`Array\`（本质是 object） |

## 八、鸭子类型 vs 隐式转换：哲学的差异

Python 虽然是强类型，但它有**鸭子类型**（Duck Typing）：

\`\`\`python
# 不看类型，看行为
def make_sound(animal):
    # 不检查类型，只要 animal 有 speak() 方法就行
    return animal.speak()

class Dog:
    def speak(self):
        return "Woof"

class Cat:
    def speak(self):
        return "Meow"

class Robot:
    def speak(self):
        return "Beep"

print(make_sound(Dog()))    # Woof
print(make_sound(Robot()))  # Beep  （不是动物也能用）
\`\`\`

JavaScript 因为弱类型，**所有**多态都是隐式的——只要对象有同名属性/方法，就能调用，不需要任何接口约定：

\`\`\`javascript
function makeSound(animal) {
    // 不检查，直接调用，没有就 undefined
    return animal.speak();
}

console.log(makeSound({ speak: () => "Woof" }));  // "Woof"
console.log(makeSound({}));                        // undefined（运行时才报错）
console.log(makeSound(null));                      // TypeError: Cannot read properties of null
\`\`\`

表面看两者都"不检查类型"，但本质不同：
- **Python 鸭子类型**：行为约定清晰，错误在**调用缺失方法时**才发生，且报错信息明确（\`AttributeError\`）
- **JavaScript 隐式调用**：类型完全不可知，错误可能在**属性访问**、**方法调用**、**运算**任何环节发生，且 \`undefined\` 会层层传播

## 九、TypeScript：给 JavaScript 补上静态类型

JavaScript 的弱类型痛点催生了 **TypeScript**（微软 2012 年发布）——在 JavaScript 之上加了一层静态类型系统，编译期检查，运行时擦除：

\`\`\`typescript
// TypeScript：编译期就能发现类型错误
function add(a: number, b: number): number {
    return a + b;
}

add(1, 2);        // OK
add(1, "2");      // 编译错误：Argument of type 'string' is not assignable to parameter of type 'number'.
\`\`\`

Python 也有类型注解（PEP 484，2014 年），但哲学不同——Python 的注解是**可选的、运行时不强制**的工具，主要服务于 IDE 和 mypy 等静态检查器；TypeScript 则要求**整个项目类型正确才能编译通过**。

\`\`\`python
# Python 类型注解（可选，运行时不影响）
def add(a: int, b: int) -> int:
    return a + b

add(1, "2")  # 运行时不报错（注解只是提示），mypy 才会报错
\`\`\`

## 十、小结

Python 和 JavaScript 都属于动态类型语言，但 Python 的"强"让它在大型项目里更稳健——类型错误更早暴露、重构更安全；JavaScript 的"弱"让它在小脚本里更灵活，但在大型项目里不得不依靠 TypeScript 来补救。

理解这两套类型系统的差异，是写好两门语言的根本——下一章我们会深入到**基础类型**的细节，看数字、字符串、布尔、空值在两门语言里的具体差异。`,
  },
  {
    id: "pyvsjs-primitives",
    icon: "🔢",
    title: "基础类型深度对比",
    group: "语法与类型",
    content: `# 基础类型深度对比

基础类型是语言的"原子"。Python 和 JavaScript 在数字、字符串、布尔、空值这四类基础类型上的设计差异，直接决定了它们在科学计算、金融、文本处理等领域的适用性。

## 一、数字类型：无限精度 vs 双精度浮点

### Python：int 无限精度 + float + complex

\`\`\`python
# Python 的 int 是真正的任意精度整数
big = 2 ** 100
print(big)        # 1267650600228229401496703205376
print(type(big))  # <class 'int'>

# 不存在溢出， factorial(1000) 也能精确算
import math
print(math.factorial(100))  # 9332621544394415268169923885626670049071596826438...
\`\`\`

Python 的 \`int\` 在底层是一个**变长结构**——当数字超过机器字长（通常 64 位）时，自动扩展内存。这意味着 Python **永远不会有整数溢出**，这在密码学、大数运算、组合数学里是巨大优势。

\`\`\`python
# float 是 IEEE 754 双精度（和 JS 的 number 一样）
x = 0.1 + 0.2
print(x)                  # 0.30000000000000004
print(x == 0.3)           # False  （浮点经典问题，Python 也有）

# 但有 Decimal 处理精确小数
from decimal import Decimal
print(Decimal("0.1") + Decimal("0.2"))  # 0.3  （精确）
print(Decimal("0.1") + Decimal("0.2") == Decimal("0.3"))  # True
\`\`\`

注意：**Python 也有 0.1 + 0.2 !== 0.3 的问题**，因为它的 \`float\` 和 JS 的 \`number\` 一样都是 IEEE 754 双精度。区别在于 Python 提供了 \`Decimal\` 标准库来精确处理十进制小数——这是 JS 标准库没有的。

### JavaScript：number 双精度浮点 + BigInt

\`\`\`javascript
// JavaScript 的 number 是 IEEE 754 双精度浮点（没有真正的整数类型）
console.log(typeof 42);        // "number"
console.log(typeof 42.5);      // "number"  （整数小数都是 number）

// 经典的浮点问题
console.log(0.1 + 0.2);        // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false

// 整数"安全范围"：-(2^53 - 1) 到 2^53 - 1
console.log(Number.MAX_SAFE_INTEGER);  // 9007199254740991
console.log(9007199254740991 + 1);     // 9007199254740992
console.log(9007199254740991 + 2);     // 9007199254740992  （错误！丢失精度）
\`\`\`

JavaScript 的 \`number\` 在底层就是一个 64 位浮点数。这意味着 **JavaScript 里所有数字（包括整数）都是浮点数**——这就是为什么 \`typeof 42 === "number"\` 而不是 \`"integer"\`。

\`\`\`javascript
// BigInt（ES2020）处理大整数，但语法不同
const big = 2n ** 100n;
console.log(big);              // 1267650600228229401496703205376n
console.log(typeof big);       // "bigint"

// BigInt 不能和 number 混用
console.log(1n + 1);           // TypeError: Cannot mix BigInt and other types
console.log(1n + 1n);          // 2n
console.log(Number(1n) + 1);   // 2  （需要显式转换）
\`\`\`

BigInt 解决了整数精度问题，但语法上必须加 \`n\` 后缀，且和 \`number\` 不互通——这种"两套数字类型并存"的设计比 Python 的"统一 int"麻烦得多。

### 数字类型对比表

| 维度 | Python | JavaScript |
|------|--------|------------|
| 整数类型 | \`int\`（任意精度） | \`number\`（双精度浮点）+ \`BigInt\` |
| 浮点类型 | \`float\`（双精度） | \`number\`（双精度） |
| 复数类型 | \`complex\`（内置） | ❌ 无内置 |
| 大整数 | \`int\` 自动扩展 | 需用 \`BigInt\`（带 \`n\` 后缀） |
| 精确小数 | \`Decimal\` 标准库 | ❌ 标准库无（需第三方） |
| 分数类型 | \`Fraction\` 标准库 | ❌ 无 |
| 整数除法 | \`//\`（地板除）、\`/\`（真除法） | \`/\`（始终浮点） |
| 安全整数范围 | 不限 | \`Number.MAX_SAFE_INTEGER\`（2^53-1） |

## 二、字符串：Unicode 优先 vs UTF-16 历史包袱

### Python：str 是不可变 Unicode 序列

\`\`\`python
# Python 3 的 str 是 Unicode 序列（不像 Python 2 有 str/unicode 之分）
s = "你好，世界"
print(len(s))              # 5  （字符数，不是字节数）
print(s[0])                # "你"

# 索引按字符（码点），不是 UTF-16 编码单元
print("𝕏"[0])              # "𝕏"  （一个字符）
print(len("𝕏"))            # 1

# 字符串不可变
s = "hello"
# s[0] = "H"  # TypeError: 'str' object does not support item assignment
new_s = "H" + s[1:]  # 必须创建新字符串
\`\`\`

Python 3 的 \`str\` 在内部用灵活编码（Latin-1、UCS-2、UCS-4 之一，按字符串最长码点选择），**始终按码点索引**。这意味着 \`len("你好")\` 是 2 而不是 6，索引 \`s[0]\` 直接得到第一个字符——符合直觉。

### JavaScript：string 是不可变 UTF-16 序列

\`\`\`javascript
// JavaScript 的 string 是 UTF-16 编码单元序列
const s = "你好，世界";
console.log(s.length);        // 5
console.log(s[0]);            // "你"

// 但遇到辅助平面字符（emoji 等）就出问题
const x = "𝕏";
console.log(x.length);        // 2  （surrogate pair 占两个 code unit）
console.log(x[0]);            // "\\uD835"  （半个字符！）
console.log(x[1]);            // "\\uDD4F"
console.log([...x].length);   // 1  （用 Array.from 才能正确迭代）

// 字符串不可变
let str = "hello";
// str[0] = "H";  // 静默失败（不报错，但不生效）
str = "H" + str.slice(1);
\`\`\`

JavaScript 字符串的 \`length\` 和索引都基于 **UTF-16 编码单元**，不是 Unicode 码点。对于 BMP（基本多语言平面）内的字符（如中文字），这没问题；但对于 emoji、数学符号等辅助平面字符，会出现"一个字符 length 是 2"的反直觉现象——这是 JavaScript 字符串 API 最大的坑。

\`\`\`javascript
// 处理 emoji 字符串要特别小心
const family = "👨‍👩‍👧‍👦";  // 7 个码点组成的"家庭"emoji
console.log(family.length);        // 11  （UTF-16 code units）
console.log([...family].length);   // 7   （码点数，但仍是 7 不是 1）
console.log(Array.from(family));   // ['👨', '‍', '👩', '‍', '👧', '‍', '👦']

// 要正确计算"视觉字符"需要 Intl.Segmenter（ES2022+）
const seg = new Intl.Segmenter("en", { granularity: "grapheme" });
console.log([...seg.segment(family)].length);  // 1
\`\`\`

### 字符串对比表

| 维度 | Python | JavaScript |
|------|--------|------------|
| 内部表示 | Unicode 码点序列 | UTF-16 编码单元序列 |
| \`len(s)\` / \`s.length\` | 码点数 | UTF-16 单元数 |
| 索引 \`s[0]\` | 第一个码点 | 第一个 UTF-16 单元 |
| emoji 处理 | 直观（\`len("𝕏") == 1\`） | 反直觉（\`"𝕏".length == 2\`） |
| 可变性 | 不可变 | 不可变 |
| 字符串模板 | f-string \`f"{x}"\` | 模板字符串 \`\`\` \${x} \`\`\` |
| 多行字符串 | 三引号 \`"""...\`""" | 模板字符串 \`\`\` \`\`\` |
| 字节串 | \`bytes\` 类型 | ❌ 无（用 \`Uint8Array\`） |

## 三、布尔值：细节里的魔鬼

\`\`\`python
# Python 布尔是 True/False（首字母大写），且是 int 的子类
print(True + True)      # 2
print(True == 1)        # True
print(isinstance(True, int))  # True
print(True + 1)         # 2

# 假值：False, 0, 0.0, "", [], {}, None, set()
bool([])        # False
bool([0])       # True  （非空列表就是真）
bool("False")   # True  （非空字符串就是真）
\`\`\`

\`\`\`javascript
// JavaScript 布尔是 true/false（小写）
console.log(true + true);   // 2
console.log(true == 1);     // true  （== 会转换）
console.log(true === 1);    // false （=== 严格相等）

// 假值（falsy）：false, 0, -0, 0n, "", null, undefined, NaN
Boolean([]);        // true  （空数组是真！这是大坑）
Boolean([0]);       // true
Boolean({});        // true  （空对象也是真！）
Boolean("false");   // true
Boolean("0");       // true  （非空字符串都是真）
\`\`\`

**最大的差异**：Python 里 \`[]\`、\`{}\` 是假值，JavaScript 里 \`[]\`、\`{}\` 是真值！这是 JavaScript 新手最常踩的坑：

\`\`\`javascript
// JavaScript 的陷阱
const items = [];
if (items) {
    console.log("数组非空");  // 会执行！[] 是 truthy
}

// 判断数组是否为空要写：
if (items.length > 0) { ... }
\`\`\`

\`\`\`python
# Python 直观得多
items = []
if items:
    print("非空")  # 不会执行，[] 是 falsy
\`\`\`

## 四、空值：一个 vs 两个

\`\`\`python
# Python 只有一种空值：None
x = None
print(x is None)        # True
print(type(None))       # <class 'NoneType'>

# 函数默认返回值
def do_nothing():
    pass
print(do_nothing())     # None
\`\`\`

\`\`\`javascript
// JavaScript 有两种空值：null 和 undefined
let a = undefined;  // 变量声明了但没赋值
let b = null;       // 显式表示"空"

console.log(typeof undefined);  // "undefined"
console.log(typeof null);       // "object"  （历史 bug）

// 函数没 return 时返回 undefined
function doNothing() {}
console.log(doNothing());  // undefined

// null 和 undefined 的关系
console.log(null == undefined);    // true   （== 视为相等）
console.log(null === undefined);   // false  （严格不等）
\`\`\`

JavaScript 的双空值设计经常被批评为"历史包袱"。约定俗成的用法是：
- \`undefined\`：变量未赋值、函数无返回值、对象属性不存在
- \`null\`：开发者**显式**表示"这里没有值"（如 DOM 查询未找到元素）

Python 的 \`None\` 单一设计更简洁，但缺少"未定义"和"空"的区分——这在 JS 里有时是有用的（比如区分"用户没填"和"用户填了空"）。

## 五、null 的传播：错误 vs 静默

\`\`\`python
# Python：None 不能参与运算
print(None + 1)  # TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'

# 访问 None 的属性也直接报错
x = None
# x.foo  # AttributeError: 'NoneType' object has no attribute 'foo'
\`\`\`

\`\`\`javascript
// JavaScript：null/undefined 参与运算得到 NaN 或报错
console.log(null + 1);         // 1      （null 转 0）
console.log(undefined + 1);    // NaN    （undefined 转 NaN）
console.log("a" + null);       // "anull" （null 转字符串）

// 访问 null/undefined 的属性报错
const x = null;
// x.foo;  // TypeError: Cannot read properties of null (reading 'foo')

// 可选链 ?. 处理 null/undefined（ES2020）
const y = null;
console.log(y?.foo);           // undefined  （不报错）
console.log(y?.foo?.bar);      // undefined
\`\`\`

JavaScript 的可选链 \`?.\` 是处理"可能为空"的现代方案，Python 没有对应的语法糖（虽然有第三方库如 \`glom\`）：

\`\`\`python
# Python 处理可能为 None 的链式访问
data = {"user": {"address": None}}
# street = data["user"]["address"]["street"]  # TypeError
street = data.get("user", {}).get("address", {})
if street:
    street = street.get("street")
# 或者用 try/except
try:
    street = data["user"]["address"]["street"]
except (KeyError, TypeError):
    street = None
\`\`\`

## 六、基础类型对比总表

| 类型 | Python | JavaScript | 备注 |
|------|--------|------------|------|
| 整数 | \`int\`（任意精度） | \`number\` / \`BigInt\` | JS 整数有 2^53 上限 |
| 浮点 | \`float\` | \`number\` | 都是 IEEE 754 双精度 |
| 复数 | \`complex\` | ❌ | Python 内置 |
| 精确小数 | \`Decimal\` | ❌ | JS 需第三方库 |
| 字符串 | \`str\`（Unicode） | \`string\`（UTF-16） | JS emoji 处理麻烦 |
| 布尔 | \`True\`/\`False\` | \`true\`/\`false\` | Python bool 是 int 子类 |
| 空值 | \`None\` | \`null\` + \`undefined\` | JS 双空值 |
| 字节 | \`bytes\`/\`bytearray\` | \`Uint8Array\` | Python 有专门类型 |

## 七、小结

Python 在基础类型上的设计更"工程化"——\`int\` 无限精度、\`Decimal\` 精确小数、\`str\` 真正的 Unicode、\`None\` 单一空值，每一项都更符合数值计算和文本处理的直觉。JavaScript 的设计更"历史化"——双精度浮点统一数字、UTF-16 字符串、双空值，每一项都是 1995 年的妥协，但通过 \`BigInt\`、\`Intl.Segmenter\`、可选链等后续补丁逐渐改善。

下一章我们将对比两门语言的**容器与集合**——list、dict、set 在 Python 是一等公民，而 JavaScript 的 Array/Object/Map/Set 有着完全不同的设计逻辑。`,
  },
  {
    id: "pyvsjs-collections",
    icon: "📦",
    title: "容器与集合",
    group: "语法与类型",
    content: `# 容器与集合

容器是组织数据的核心抽象。Python 和 JavaScript 都有列表、字典、集合，但底层实现和 API 设计差异巨大——Python 的容器是"真"容器类型，JavaScript 的容器则更像是"对象+语法糖"。

## 一、序列：list vs Array

### Python list：指针数组

\`\`\`python
# Python list 是一个动态数组，但存的是指针
items = [1, "hello", 3.14, [1, 2], {"a": 1}]  # 可混合类型
print(len(items))      # 5
print(items[0])        # 1
print(items[-1])       # {'a': 1}  （支持负索引）

# 切片（强大且直观）
nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
print(nums[2:5])       # [2, 3, 4]   （左闭右开）
print(nums[:3])        # [0, 1, 2]
print(nums[7:])        # [7, 8, 9]
print(nums[::2])       # [0, 2, 4, 6, 8]  （步长）
print(nums[::-1])      # [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]  （反转）

# 可变
items.append(100)
items.extend([200, 300])
items.insert(0, "first")
items.remove("hello")
popped = items.pop()   # 弹出末尾
\`\`\`

Python 的 \`list\` 底层是一个**指针数组**（PyObject* 数组）——每个槽位存的是对象的指针，所以可以混合类型。它的 \`append\`/\`pop\` 是 O(1) 摊还，中间插入/删除是 O(n)。

### JavaScript Array：本质是对象

\`\`\`javascript
// JavaScript Array 在底层可能是真数组或 hash map（取决于实现）
const items = [1, "hello", 3.14, [1, 2], { a: 1 }];  // 可混合类型
console.log(items.length);   // 5
console.log(items[0]);       // 1
console.log(items.at(-1));   // { a: 1 }  （at() 支持负索引，ES2022）

// 切片用 slice（功能弱于 Python）
const nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
console.log(nums.slice(2, 5));  // [2, 3, 4]
console.log(nums.slice(0, 3));  // [0, 1, 2]
console.log(nums.slice(7));     // [7, 8, 9]
// 没有步长参数！反转要单独 reverse()
console.log(nums.slice().reverse());  // [9, ..., 0]

// 可变
items.push(100);              // 末尾添加
items.push(200, 300);         // 可变参数
items.unshift("first");       // 头部添加（O(n)）
items.shift();                // 头部弹出（O(n)）
const popped = items.pop();   // 末尾弹出

// 稀疏数组（Python 没有的特性）
const sparse = [1, , 3];      // 中间空着
console.log(sparse.length);   // 3
console.log(sparse[1]);       // undefined
\`\`\`

JavaScript 的 \`Array\` 在 V8 引擎里有一个优化：如果元素类型一致且密集，会用真正的 C++ 数组存储；一旦变成稀疏或混合类型，就退化成 hash map（"dictionary mode"）。这种"看情况优化"的设计让 JS 数组在某些场景下性能不如 Python 的统一实现。

### list vs Array 对比

| 维度 | Python list | JavaScript Array |
|------|-------------|------------------|
| 底层实现 | 指针数组 | 真数组 or hash map（动态） |
| 索引 | \`items[0]\`、\`items[-1]\` | \`items[0]\`、\`items.at(-1)\` |
| 切片 | \`a[1:5:2]\`（强） | \`a.slice(1, 5)\`（弱） |
| 步长 | \`a[::2]\` | ❌ 无 |
| 长度 | \`len(a)\`（函数） | \`a.length\`（属性） |
| 稀疏数组 | ❌ 不支持 | ✅ 支持 |
| 解构 | ❌ 无原生 | ✅ \`const [a, b] = arr\` |
| 推导式 | \`[x*2 for x in xs]\` | \`xs.map(x => x*2)\` |

## 二、映射：dict vs Object / Map

### Python dict：有序且类型安全

\`\`\`python
# Python dict 在 3.7+ 保证插入顺序
d = {"apple": 3, "banana": 5, "cherry": 2}
d["date"] = 7
print(list(d.keys()))    # ['apple', 'banana', 'cherry', 'date']

# 键可以是任何可哈希类型（不只是字符串）
d2 = {1: "one", "two": 2, (1, 2): "tuple key", frozenset({3}): "set key"}
print(d2[(1, 2)])        # "tuple key"

# 访问
print(d.get("apple"))      # 3
print(d.get("missing"))    # None  （不报错）
print(d.get("missing", 0)) # 0    （默认值）
# print(d["missing"])       # KeyError  （直接访问会报错）

# 字典推导式
squares = {n: n**2 for n in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# 合并（3.9+）
merged = {"a": 1} | {"b": 2}  # {'a': 1, 'b': 2}
\`\`\`

Python 的 \`dict\` 是真正的哈希表实现——键可以是**任何可哈希对象**（数字、字符串、元组、frozenset 等不可变类型），不只是字符串。这在科学计算、图算法等场景非常有用。

### JavaScript Object：键只能是 string/symbol

\`\`\`javascript
// JavaScript Object 的键会被强制转为字符串
const obj = {};
obj[1] = "one";           // 键其实是字符串 "1"
obj["1"] = "ONE";         // 覆盖了上面
console.log(Object.keys(obj));  // ["1"]

obj[true] = "yes";        // 键是 "true"
console.log(obj["true"]); // "yes"

// 对象作为键？不行，会被转成 "[object Object]"
const key = { a: 1 };
obj[key] = "value";
console.log(obj["[object Object]"]);  // "value"

// 访问
console.log(obj.apple || "default");   // "default"（短路）
console.log(obj?.apple ?? "default");  // "default"（空值合并，ES2020）

// 合并（ES2018+）
const merged = { a: 1, ...{ b: 2 } };  // { a: 1, b: 2 }
const merged2 = Object.assign({}, { a: 1 }, { b: 2 });
\`\`\`

JavaScript Object 的键**只能是字符串或 Symbol**——任何其他类型都会被 \`toString()\` 转换。这是个巨大限制，所以 ES2015 引入了 \`Map\`：

\`\`\`javascript
// Map：真正的哈希表，键可以是任何类型
const map = new Map();
map.set(1, "one");              // 数字键
map.set("two", 2);              // 字符串键
map.set({ a: 1 }, "obj key");   // 对象键（按引用）
map.set([1, 2], "arr key");     // 数组键

console.log(map.get(1));        // "one"
console.log(map.size);          // 4
console.log(map.has("two"));    // true

// 迭代（保证插入顺序）
for (const [k, v] of map) {
    console.log(k, v);
}

// Map 没有字面量语法，必须 new Map([["a", 1], ["b", 2]])
\`\`\`

### dict vs Object vs Map 对比

| 维度 | Python dict | JS Object | JS Map |
|------|-------------|-----------|--------|
| 键类型 | 任何可哈希 | string/symbol | 任何类型 |
| 顺序 | 插入顺序（3.7+） | 插入顺序（ES2015+） | 插入顺序 |
| 字面量 | \`{"k": v}\` | \`{ k: v }\` | ❌ 无 |
| 长度 | \`len(d)\` | \`Object.keys(o).length\` | \`map.size\` |
| 默认值 | \`d.get(k, default)\` | \`o[k] ?? default\` | \`map.get(k) ?? default\` |
| 大小性能 | O(1) | O(1) | O(1) |
| 迭代 | \`for k, v in d.items()\` | \`for (const [k, v] of Object.entries(o))\` | \`for (const [k, v] of map)\` |
| 序列化 | \`json.dumps\` | \`JSON.stringify\` | ❌ 不支持 |

**实践建议**：JavaScript 中如果键不是字符串、需要频繁增删、需要知道大小，应该用 \`Map\`；否则用对象字面量更简洁。Python 则统一用 \`dict\`，没有这种分裂。

## 三、集合：set vs Set

\`\`\`python
# Python set：可变集合
s = {1, 2, 3, 3}      # {1, 2, 3}  （自动去重）
s.add(4)
s.discard(1)           # 不存在不报错
# s.remove(99)         # 不存在会 KeyError

# 集合运算
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
print(a | b)           # {1, 2, 3, 4, 5, 6}  并集
print(a & b)           # {3, 4}              交集
print(a - b)           # {1, 2}              差集
print(a ^ b)           # {1, 2, 5, 6}        对称差集

# frozenset：不可变集合，可作字典键
fs = frozenset({1, 2, 3})
d = {fs: "frozen"}     # OK
\`\`\`

\`\`\`javascript
// JavaScript Set（ES2015）
const s = new Set([1, 2, 3, 3]);  // Set { 1, 2, 3 }  自动去重
s.add(4);
s.delete(1);           // 删除，返回是否成功

// 集合运算（ES2025 新增，老版本要手动实现）
const a = new Set([1, 2, 3, 4]);
const b = new Set([3, 4, 5, 6]);
const union = a.union(b);              // Set {1,2,3,4,5,6}
const intersect = a.intersection(b);   // Set {3,4}
const diff = a.difference(b);          // Set {1,2}
const symDiff = a.symmetricDifference(b); // Set {1,2,5,6}

// 没有 frozenset 等价物——Set 本身不可作为 Map 键（按引用比较）
// 用数组去重：[...new Set([1, 1, 2, 3])]  =>  [1, 2, 3]
\`\`\`

JavaScript 的 \`Set\` 历史上一直缺乏集合运算方法，直到 ES2025 才补上 \`union\`/\`intersection\` 等。在此之前开发者要么手写、要么用 lodash。Python 的 \`set\` 从一开始就有完整的运算符重载（\`|\`\`&\`-\`^\`）。

## 四、元组：Python 独有的不可变序列

\`\`\`python
# tuple：不可变序列，比 list 更轻量
point = (3, 4)
# point[0] = 5  # TypeError: 'tuple' object does not support item assignment

# 用途：多返回值、解包、字典键
def min_max(nums):
    return min(nums), max(nums)  # 实际返回 tuple

lo, hi = min_max([1, 5, 3])     # 解包
print(lo, hi)                    # 1 5

# 元组作字典键
graph = {(0, 0): "origin", (1, 0): "right"}

# 命名元组（更可读）
from collections import namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(p.x, p.y)  # 3 4
\`\`\`

JavaScript 没有内置的元组类型——\`const arr = [1, 2]\` 虽然不能重新赋值变量，但内容仍可变（\`arr.push(3)\`）。要实现"不可变数组"得用 \`Object.freeze\` 或第三方库 Immutable.js：

\`\`\`javascript
// Object.freeze：浅冻结
const arr = Object.freeze([1, 2, 3]);
// arr.push(4);  // 严格模式下抛错，非严格模式静默失败
// arr[0] = 99;  // 同上

// 但只是浅冻结
const nested = Object.freeze([1, [2, 3]]);
nested[1].push(4);  // OK，内层数组还是可变

// 解构做"伪元组"
const [x, y] = [3, 4];  // 类似 Python 的解包
const point = [3, 4];   // 但 point 可变，不能作 Map 键（按引用比较）
\`\`\`

## 五、推导式 vs 链式调用

### Python 推导式：声明式 + 可读性

\`\`\`python
# 列表推导式
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]

# 字典/集合推导式
square_map = {x: x**2 for x in range(5)}
unique_lens = {len(w) for w in ["a", "bb", "ccc", "a"]}

# 嵌套推导式
matrix = [[i*j for j in range(3)] for i in range(3)]
# [[0,0,0],[0,1,2],[0,2,4]]
\`\`\`

### JavaScript 链式方法：函数式风格

\`\`\`javascript
// map / filter / reduce
const squares = Array.from({ length: 10 }, (_, i) => i ** 2);
const evens = Array.from({ length: 20 }, (_, i) => i).filter(x => x % 2 === 0);

// 链式调用（没有推导式语法）
const result = nums
    .filter(x => x > 0)
    .map(x => x ** 2)
    .reduce((sum, x) => sum + x, 0);

// 没有"字典推导式"——要用 Object.fromEntries
const squareMap = Object.fromEntries(
    Array.from({ length: 5 }, (_, i) => [i, i ** 2])
);
\`\`\`

两种风格各有优势：Python 推导式更紧凑、性能更好（一次遍历完成多步），JavaScript 链式调用更通用、可读性在长链中更佳。

## 六、容器对比总表

| 容器 | Python | JavaScript | 备注 |
|------|--------|------------|------|
| 可变序列 | \`list\` | \`Array\` | JS Array 可稀疏 |
| 不可变序列 | \`tuple\` | \`Object.freeze(arr)\` | JS 无原生元组 |
| 映射 | \`dict\` | \`Object\` / \`Map\` | JS 分裂为两种 |
| 可变集合 | \`set\` | \`Set\` | JS 集合运算 ES2025+ |
| 不可变集合 | \`frozenset\` | ❌ | JS 无 |
| 有序映射 | \`OrderedDict\`（3.7+ 冗余） | \`Map\` | dict/Map 都有序 |
| 双端队列 | \`collections.deque\` | ❌（数组模拟） | Python 有专门类型 |
| 命名元组 | \`namedtuple\` | ❌ | JS 用对象替代 |
| 字符串缓冲 | \`io.StringIO\` | 字符串拼接（V8 优化） | - |

## 七、可变性的设计哲学

Python 区分 \`list\`/\`tuple\`、\`set\`/\`frozenset\`、\`dict\`（无不可变版本）——**显式区分可变与不可变**，让开发者用类型表达意图。元组作字典键、frozenset 作集合元素，都是利用不可变性保证哈希稳定。

JavaScript 则统一为"可变 + Object.freeze 补丁"——\`Array\`、\`Object\`、\`Set\`、\`Map\` 都可变，要不可变得手动 freeze（且只是浅冻结）。这种设计牺牲了表达力，但减少了类型数量。

\`\`\`python
# Python 用类型表达"我不会修改它"
def process(items: tuple[int, ...]) -> int:
    # 调用者知道：items 不会被修改
    return sum(items)

data = (1, 2, 3)
process(data)
\`\`\`

\`\`\`javascript
// JavaScript 只能靠约定（const 只防重新赋值，不防内容修改）
function process(items) {
    // items 仍可被修改（除非 freeze）
    return items.reduce((a, b) => a + b, 0);
}

const data = Object.freeze([1, 2, 3]);
process(data);  // 函数内修改会失败（严格模式下报错）
\`\`\`

## 八、小结

Python 的容器设计更"学院派"——类型丰富（list/tuple/set/frozenset/dict/OrderedMap/deque/namedtuple）、语义清晰（可变 vs 不可变显式区分）、键类型灵活（任何可哈希对象）。JavaScript 的容器设计更"实用主义"——Array/Object 两类打天下，Map/Set 作为补丁，靠链式方法而非推导式表达数据处理流。

下一章我们将对比两门语言的**函数**——都是一等公民，但 Python 的 def/lambda 与 JavaScript 的 function/箭头函数在闭包、this、参数处理上有着深刻差异。`,
  },
  {
    id: "pyvsjs-functions",
    icon: "⚡",
    title: "函数：一等公民的两种实现",
    group: "语法与类型",
    content: `# 函数：一等公民的两种实现

Python 和 JavaScript 都把函数视为一等公民（first-class citizen）——可以赋值给变量、作为参数传递、作为返回值。但两门语言在函数定义、参数处理、闭包语义、\`this\`/\`self\` 绑定上差异巨大，这些差异直接影响代码风格和 bug 模式。

## 一、函数定义：四种语法

\`\`\`python
# Python：def 和 lambda
def add(a, b):
    return a + b

# lambda 只能是单表达式（限制很大）
square = lambda x: x ** 2

# 函数是对象，可赋值
ops = {"add": add, "square": square}
print(ops["add"](1, 2))  # 3
\`\`\`

\`\`\`javascript
// JavaScript：function 声明、函数表达式、箭头函数
function add(a, b) {
    return a + b;
}

// 函数表达式
const square1 = function(x) { return x ** 2; };

// 箭头函数（ES2015）
const square2 = x => x ** 2;          // 单参数可省括号
const square3 = (x) => x ** 2;
const add2 = (a, b) => a + b;         // 隐式 return
const greet = name => {                // 多语句用花括号
    const msg = "Hello, " + name;
    return msg;
};

// 函数是对象
const ops = { add, square: square2 };
console.log(ops.add(1, 2));  // 3
\`\`\`

JavaScript 的箭头函数是函数式编程的福音——简洁、隐式 return、没有自己的 \`this\`。Python 的 \`lambda\` 在功能上严重受限（只能单表达式），所以 Python 函数式风格不如 JS 流行。

## 二、参数处理：*args/**kwargs vs rest/解构

### Python：丰富的参数模式

\`\`\`python
# 位置参数 + 默认值
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

# 关键字参数（调用时可指定参数名）
greet("Alice")                    # "Hello, Alice!"
greet("Bob", greeting="Hi")       # "Hi, Bob!"
greet(greeting="Hey", name="Carol")  # 顺序无关

# *args 收集位置参数
def sum_all(*args):
    return sum(args)
sum_all(1, 2, 3, 4)  # 10

# **kwargs 收集关键字参数
def make_config(**kwargs):
    return kwargs
make_config(host="localhost", port=8080, debug=True)
# {'host': 'localhost', 'port': 8080, 'debug': True}

# 仅限关键字参数（* 之后）
def create_user(name, *, age, email):
    # age 和 email 必须用关键字传递
    return {name, age, email}
create_user("Alice", age=30, email="a@b.com")

# 仅限位置参数（/ 之前，3.8+）
def f(a, b, /, c):
    pass
f(1, 2, c=3)  # a, b 必须位置传，c 可位置可关键字
\`\`\`

### JavaScript：rest + 解构

\`\`\`javascript
// 默认值
function greet(name, greeting = "Hello") {
    return \`\${greeting}, \${name}!\`;
}

// 没有"关键字参数"——靠对象解构模拟
function greet2({ name, greeting = "Hello" }) {
    return \`\${greeting}, \${name}!\`;
}
greet2({ name: "Alice" });              // "Hello, Alice!"
greet2({ greeting: "Hi", name: "Bob" }); // "Hi, Bob!"

// ...rest 收集剩余参数
function sumAll(...args) {
    return args.reduce((a, b) => a + b, 0);
}
sumAll(1, 2, 3, 4);  // 10

// 对象解构做"命名参数"
function createUser({ name, age, email }) {
    return { name, age, email };
}
createUser({ name: "Alice", age: 30, email: "a@b.com" });

// 数组解构
const [first, ...rest] = [1, 2, 3, 4];
console.log(first, rest);  // 1 [2, 3, 4]
\`\`\`

JavaScript 没有真正的"关键字参数"——所有函数参数都是位置参数，但通过**对象解构**模拟出了类似效果。这导致 JS 函数 API 设计有个约定：超过 2 个参数就改成对象。React、Vue、各种库都遵循这个模式。

| 参数特性 | Python | JavaScript |
|----------|--------|------------|
| 默认值 | \`def f(a=1):\` | \`function f(a = 1)\` |
| 关键字参数 | 原生支持 | 用对象解构模拟 |
| 可变位置参数 | \`*args\` | \`...args\` |
| 可变关键字参数 | \`**kwargs\` | 对象解构 \`{ ...rest }\` |
| 仅限关键字 | \`def f(a, *, b):\` | ❌ 无 |
| 仅限位置 | \`def f(a, /, b):\` | ❌ 无 |
| 参数解构 | ❌ 无 | ✅ \`f([a, b])\` / \`f({a, b})\` |

## 三、闭包：相同机制，不同陷阱

\`\`\`python
# Python 闭包：捕获变量引用
def make_counters():
    counters = []
    for i in range(3):
        def counter():
            return i  # 捕获的是 i 的引用
        counters.append(counter)
    return counters

for c in make_counters():
    print(c())
# 输出：2 2 2  （i 最后变成 2，所有闭包都看到 2）
\`\`\`

\`\`\`javascript
// JavaScript var 的闭包陷阱（同 Python）
function makeCounters() {
    var counters = [];
    for (var i = 0; i < 3; i++) {
        counters.push(function() { return i; });
    }
    return counters;
}
makeCounters().forEach(c => console.log(c()));
// 输出：3 3 3

// let 解决了这个问题（每轮迭代新绑定）
function makeCounters2() {
    const counters = [];
    for (let i = 0; i < 3; i++) {
        counters.push(() => i);
    }
    return counters;
}
makeCounters2().forEach(c => console.log(c()));
// 输出：0 1 2  （let 创建块作用域，每轮新变量）
\`\`\`

Python 的修复方式是**默认参数**（在函数定义时求值）：

\`\`\`python
def make_counters():
    counters = []
    for i in range(3):
        def counter(i=i):  # 默认参数在定义时求值
            return i
        counters.append(counter)
    return counters
# 现在输出 0 1 2
\`\`\`

JavaScript 的 \`let\` 在循环里自动创建新绑定，是更优雅的解决方案。这是 JS 比 Python 优秀的一个细节。

## 四、this vs self：动态 vs 显式

这是两门语言**最深刻**的差异之一。

### Python：self 显式传递

\`\`\`python
class Counter:
    def __init__(self):
        self.count = 0

    def increment(self):    # self 必须显式声明
        self.count += 1
        return self.count

    def reset(self):
        self.count = 0

c = Counter()
print(c.increment())  # 1  （c.increment() 等价于 Counter.increment(c)）

# 方法可以独立取出
inc = c.increment
print(inc())  # 2  （依然绑定到 c，因为 Python 方法是 bound method）
\`\`\`

Python 的 \`self\` 是**显式参数**——你看到的方法签名第一个参数永远是 \`self\`，调用 \`c.increment()\` 时 Python 自动把 \`c\` 作为 \`self\` 传入。这种设计虽然啰嗦，但**永远不会搞错"这个方法属于谁"**。

### JavaScript：this 动态绑定

\`\`\`javascript
class Counter {
    constructor() {
        this.count = 0;
    }

    increment() {
        this.count++;
        return this.count;
    }
}

const c = new Counter();
console.log(c.increment());  // 1

// 但取出来单独调用就出问题了
const inc = c.increment;
// console.log(inc());  // TypeError: this is undefined（严格模式）
// 非严格模式下 this 指向全局对象，count 变成 NaN

// 必须显式绑定
const inc2 = c.increment.bind(c);
console.log(inc2());  // 2

// 箭头函数解决回调中的 this 问题
class Timer {
    constructor() {
        this.seconds = 0;
    }
    start() {
        // 普通函数：this 会丢失
        // setInterval(function() { this.seconds++; }, 1000);  // NaN
        setInterval(() => { this.seconds++; }, 1000);  // OK，箭头函数捕获外层 this
    }
}
\`\`\`

JavaScript 的 \`this\` 是**运行时动态绑定**的，规则有 4 种：
1. 默认绑定（独立调用）：严格模式 \`undefined\`，非严格模式全局对象
2. 隐式绑定（\`obj.method()\`）：\`this\` 是 \`obj\`
3. 显式绑定（\`fn.call(obj)\` / \`fn.apply(obj)\` / \`fn.bind(obj)\`）：\`this\` 是 \`obj\`
4. \`new\` 绑定：\`this\` 是新创建的对象

箭头函数没有自己的 \`this\`，继承外层作用域——这解决了回调陷阱，但也带来新的困惑（不能用 \`bind\` 改变箭头函数的 \`this\`）。

**对比**：Python 的 \`self\` 简单可预测，JavaScript 的 \`this\` 灵活但易错。这是 JS 被"声讨"最多的设计之一。

## 五、高阶函数与偏应用

\`\`\`python
from functools import partial, reduce

# map / filter / reduce
nums = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, nums))      # [1, 4, 9, 16, 25]
evens = list(filter(lambda x: x % 2 == 0, nums))  # [2, 4]
total = reduce(lambda a, b: a + b, nums)        # 15

# 偏应用：固定部分参数
def power(base, exp):
    return base ** exp

square = partial(power, exp=2)
cube = partial(power, exp=3)
print(square(5))  # 25
print(cube(2))    # 8
\`\`\`

\`\`\`javascript
// map / filter / reduce 是数组方法
const nums = [1, 2, 3, 4, 5];
const squared = nums.map(x => x ** 2);          // [1, 4, 9, 16, 25]
const evens = nums.filter(x => x % 2 === 0);    // [2, 4]
const total = nums.reduce((a, b) => a + b, 0);  // 15

// 偏应用：用箭头函数实现（没有内置 partial）
const power = (base, exp) => base ** exp;
const square = base => power(base, 2);
const cube = base => power(base, 3);

// 柯里化（手动）
const curry = fn => a => b => fn(a, b);
const curriedAdd = curry((a, b) => a + b);
curriedAdd(1)(2);  // 3
\`\`\`

JavaScript 的链式调用 \`arr.map().filter().reduce()\` 是函数式风格的标志，比 Python 的 \`map(filter(reduce(...)))\` 嵌套更易读。但 Python 有列表推导式作为更紧凑的替代。

## 六、生成器：yield 的两种语言

\`\`\`python
# Python 生成器：用 yield
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fib = fibonacci()
print(next(fib))  # 0
print(next(fib))  # 1
print(next(fib))  # 1
print(next(fib))  # 2

# 生成器表达式（类似推导式但惰性）
squares = (x**2 for x in range(10))  # 不立即计算
print(list(squares)[:5])  # [0, 1, 4, 9, 16]

# yield from 委托给子生成器
def chained():
    yield from [1, 2, 3]
    yield from range(4, 7)
print(list(chained()))  # [1, 2, 3, 4, 5, 6]
\`\`\`

\`\`\`javascript
// JavaScript 生成器：function*
function* fibonacci() {
    let [a, b] = [0, 1];
    while (true) {
        yield a;
        [a, b] = [b, a + b];
    }
}

const fib = fibonacci();
console.log(fib.next().value);  // 0
console.log(fib.next().value);  // 1
console.log(fib.next().value);  // 1
console.log(fib.next().value);  // 2

// 没有生成器表达式字面量，但可以用 function* + yield
function* squares(n) {
    for (let i = 0; i < n; i++) yield i ** 2;
}
console.log([...squares(5)]);  // [0, 1, 4, 9, 16]

// yield* 委托
function* chained() {
    yield* [1, 2, 3];
    yield* [4, 5, 6];
}
console.log([...chained()]);  // [1, 2, 3, 4, 5, 6]
\`\`\`

两门语言的生成器机制几乎一致——\`yield\` 暂停、\`next()\` 恢复、\`yield from\`/\`yield*\` 委托。差异在于 Python 有**生成器表达式** \`(x for x in xs)\` 这种字面量语法，更紧凑；JavaScript 必须显式写 \`function*\`。

## 七、装饰器：Python 的语法糖

\`\`\`python
import time
from functools import wraps

# 装饰器：高阶函数的语法糖
def timing(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = fn(*args, **kwargs)
        print(f"{fn.__name__} took {time.time() - start:.3f}s")
        return result
    return wrapper

@timing
def slow():
    time.sleep(1)
    return "done"

slow()  # slow took 1.001s
\`\`\`

\`\`\`javascript
// JavaScript 没有装饰器语法（TC39 提案中），用高阶函数
function timing(fn) {
    return function(...args) {
        const start = Date.now();
        const result = fn.apply(this, args);
        console.log(\`\${fn.name} took \${Date.now() - start}ms\`);
        return result;
    };
}

// 必须显式包装
const slow = timing(function slow() {
    // 模拟耗时
    for (let i = 0; i < 1e8; i++);
    return "done";
});

slow();
\`\`\`

装饰器是 Python 的杀手锏——\`@timing\` 一行就能给函数加横切逻辑。JavaScript 的装饰器提案折腾了多年（最初是 Angular/TypeScript 用），目前仍在 TC39 流程中，主流 JS 代码还是用高阶函数显式包装。下一章我们会专门深入这个话题。

## 八、函数对比总表

| 特性 | Python | JavaScript |
|------|--------|------------|
| 函数声明 | \`def\` | \`function\` / 箭头函数 |
| 匿名函数 | \`lambda\`（单表达式） | 箭头函数（无限制） |
| 关键字参数 | 原生 | 用对象解构模拟 |
| 闭包陷阱 | 存在（用默认参数修复） | \`var\` 有，\`let\` 解决 |
| 方法绑定 | \`self\` 显式 | \`this\` 动态（4 种规则） |
| 生成器 | \`yield\` | \`yield\`（\`function*\`） |
| 生成器表达式 | \`(x for x in xs)\` | ❌ 无字面量 |
| 装饰器 | \`@decorator\` | ❌ 用高阶函数模拟 |
| 偏应用 | \`functools.partial\` | 手动箭头函数 |
| 异步 | \`async\`/\`await\` | \`async\`/\`await\` |

## 九、小结

Python 的函数设计更"规整"——\`self\` 显式、参数模式丰富、装饰器语法糖到位，适合编写结构化的业务代码。JavaScript 的函数设计更"灵活"——箭头函数极简、闭包陷阱被 \`let\` 解决、链式方法优雅，适合函数式风格和回调密集的前端代码。

\`this\` vs \`self\` 的差异是两门语言哲学的缩影：Python 偏好**显式和可预测**，JavaScript 偏好**灵活和动态**（代价是更多陷阱）。下一章我们会进入**面向对象**，看这种哲学差异如何体现在类设计上。`,
  },
  {
    id: "pyvsjs-oop",
    icon: "🏛️",
    title: "类与面向对象",
    group: "语法与类型",
    content: `# 类与面向对象

Python 和 JavaScript 都支持面向对象编程，但底层模型截然不同——Python 从一开始就是基于类的 OO（class-based），JavaScript 则是基于原型的 OO（prototype-based），\`class\` 关键字只是 ES2015 加的语法糖。这种根源差异决定了继承、多态、属性访问等方方面面的不同。

## 一、类的定义：真类 vs 语法糖

\`\`\`python
# Python：真正的类
class Dog:
    # 类变量（所有实例共享）
    species = "Canis familiaris"

    # 构造器
    def __init__(self, name, age):
        self.name = name       # 实例变量
        self.age = age

    # 实例方法
    def bark(self):
        return f"{self.name} says Woof!"

    # 类方法
    @classmethod
    def from_dict(cls, data):
        return cls(data["name"], data["age"])

    # 静态方法
    @staticmethod
    def info():
        return "Dogs are great"

dog = Dog("Rex", 3)
print(dog.bark())      # Rex says Woof!
print(Dog.info())      # Dogs are great
print(dog.species)     # Canis familiaris
\`\`\`

\`\`\`javascript
// JavaScript：class 是原型链的语法糖
class Dog {
    // 类字段（实例属性，ES2022）
    species = "Canis familiaris";

    // 构造器
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    // 实例方法（实际挂在 Dog.prototype 上）
    bark() {
        return \`\${this.name} says Woof!\`;
    }

    // 静态方法（挂在 Dog 函数对象上）
    static fromDict(data) {
        return new Dog(data.name, data.age);
    }

    static info() {
        return "Dogs are great";
    }
}

const dog = new Dog("Rex", 3);
console.log(dog.bark());      // Rex says Woof!
console.log(Dog.info());      // Dogs are great
console.log(dog.species);     // Canis familiaris
\`\`\`

表面上两者很像，但底层完全不同：

\`\`\`javascript
// JavaScript class 的真相
console.log(typeof Dog);              // "function"  （类本质是函数）
console.log(Dog.prototype.bark);      // [Function: bark]
console.log(dog.__proto__ === Dog.prototype);  // true  （原型链）

// 等价的 ES5 写法（class 之前）
function DogES5(name, age) {
    this.name = name;
    this.age = age;
}
DogES5.prototype.bark = function() {
    return this.name + " says Woof!";
};
\`\`\`

JavaScript 的 \`class\` 编译后等价于 ES5 的构造函数 + 原型方法。这意味着 \`typeof Dog === "function"\`，类可以被"调用"（虽然会报错），可以 \`Object.assign(Dog, { staticMethod })\` 等等——它本质还是函数对象。

Python 的 \`class\` 则是真正的元类（metaclass）实例化产物，\`type\` 是默认元类。

## 二、继承：super() vs extends

\`\`\`python
# Python：单继承 + MRO
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        raise NotImplementedError

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)   # 显式调用父类
        self.breed = breed

    def speak(self):
        return f"{self.name} barks"

class Puppy(Dog):
    def __init__(self, name, breed, toy):
        super().__init__(name, breed)
        self.toy = toy

    def speak(self):
        return f"{self.name} yips"

p = Puppy("Buddy", "Lab", "Ball")
print(p.speak())  # Buddy yips
\`\`\`

\`\`\`javascript
// JavaScript：单继承 + extends
class Animal {
    constructor(name) {
        this.name = name;
    }

    speak() {
        throw new Error("Not implemented");
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        super(name);   // 必须在用 this 之前调用
        this.breed = breed;
    }

    speak() {
        return \`\${this.name} barks\`;
    }
}

class Puppy extends Dog {
    constructor(name, breed, toy) {
        super(name, breed);
        this.toy = toy;
    }

    speak() {
        return \`\${this.name} yips\`;
    }
}

const p = new Puppy("Buddy", "Lab", "Ball");
console.log(p.speak());  // Buddy yips
\`\`\`

继承语法几乎一样，差异在于：
- Python 的 \`super()\` 在 \`__init__\` 中是可选的（但推荐），JavaScript 的 \`super()\` 在子类 \`constructor\` 中**必须**在使用 \`this\` 之前调用
- Python 用 MRO（方法解析顺序）支持多继承，JavaScript 只支持单继承

## 三、多继承 vs Mixin

\`\`\`python
# Python 支持多继承，通过 MRO（C3 线性化）解决钻石问题
class Flyable:
    def fly(self):
        return f"{self.name} is flying"

class Swimmable:
    def swim(self):
        return f"{self.name} is swimming"

class Duck(Flyable, Swimmable):
    def __init__(self, name):
        self.name = name

d = Duck("Donald")
print(d.fly())   # Donald is flying
print(d.swim())  # Donald is swimming

# 查看 MRO
print(Duck.__mro__)
# (<class 'Duck'>, <class 'Flyable'>, <class 'Swimmable'>, <class 'object'>)
\`\`\`

JavaScript 不支持多继承，要用 Mixin 模式：

\`\`\`javascript
// JavaScript Mixin：通过 Object.assign 混入方法
const Flyable = {
    fly() {
        return \`\${this.name} is flying\`;
    }
};

const Swimmable = {
    swim() {
        return \`\${this.name} is swimming\`;
    }
};

class Duck {
    constructor(name) {
        this.name = name;
    }
}
Object.assign(Duck.prototype, Flyable, Swimmable);

const d = new Duck("Donald");
console.log(d.fly());   // Donald is flying
console.log(d.swim());  // Donald is swimming
\`\`\`

Python 的多继承 + MRO 是工程上的双刃剑——能优雅组合能力，但也容易写出"菱形继承"地狱。JavaScript 的 Mixin 更显式，但失去了类型系统的支持（除非用 TypeScript 的 intersection types）。

## 四、属性访问：@property vs getter/setter

\`\`\`python
class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius

    @property
    def fahrenheit(self):
        return self._celsius * 9 / 5 + 32

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("Below absolute zero")
        self._celsius = value

t = Temperature(100)
print(t.fahrenheit)  # 212.0  （像属性访问，但实际调方法）
t.celsius = 0        # 触发 setter
# t.celsius = -300    # ValueError
\`\`\`

\`\`\`javascript
class Temperature {
    constructor(celsius) {
        this._celsius = celsius;
    }

    // 用 get/set 关键字
    get fahrenheit() {
        return this._celsius * 9 / 5 + 32;
    }

    get celsius() {
        return this._celsius;
    }

    set celsius(value) {
        if (value < -273.15) {
            throw new Error("Below absolute zero");
        }
        this._celsius = value;
    }
}

const t = new Temperature(100);
console.log(t.fahrenheit);  // 212
t.celsius = 0;
// t.celsius = -300;  // Error
\`\`\`

两门语言的属性访问机制几乎一样——\`@property\` 对应 \`get\`，\`@x.setter\` 对应 \`set\`。差异在 Python 用装饰器、JS 用关键字。

## 五、字符串表示：__str__/__repr__ vs toString()

\`\`\`python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        # 给最终用户看（print、str()）
        return f"({self.x}, {self.y})"

    def __repr__(self):
        # 给开发者看（repr()、调试器、容器内显示）
        return f"Point({self.x!r}, {self.y!r})"

p = Point(3, 4)
print(p)            # (3, 4)        调用 __str__
print(repr(p))      # Point(3, 4)   调用 __repr__
print([p])          # [Point(3, 4)] 容器内用 __repr__
\`\`\`

\`\`\`javascript
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return \`(\${this.x}, \${this.y})\`;
    }

    // Node.js 调试时显示（非标准，V8 特性）
    [Symbol.toPrimitive](hint) {
        if (hint === "string") return \`(\${this.x}, \${this.y})\`;
        return NaN;
    }
}

const p = new Point(3, 4);
console.log(p.toString());   // (3, 4)
console.log(\`\${p}\`);          // (3, 4)  模板字符串自动调用 toString
console.log(String(p));      // (3, 4)
console.log([p]);            // [ Point { x: 3, y: 4 } ]  （调试视图）
\`\`\`

Python 区分 \`__str__\`（用户友好）和 \`__repr__\`（开发者/可重建），这是更细致的设计。JavaScript 只有 \`toString()\` 和 \`Symbol.toPrimitive\`，调试视图由运行时决定（V8 用 \`inspect\` 自定义）。

## 六、魔法方法 vs Symbol 协议

Python 用 \`__dunder__\` 方法实现运算符重载和协议；JavaScript 用 \`Symbol\` 实现。

\`\`\`python
class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def __len__(self):
        return 2

    def __getitem__(self, i):
        return [self.x, self.y][i]

    def __iter__(self):
        yield self.x
        yield self.y

    def __contains__(self, item):
        return item in (self.x, self.y)

v = Vector(1, 2) + Vector(3, 4)
print(v == Vector(4, 6))  # True
print(len(v))             # 2
print(list(v))            # [1, 2]  哦不对，应该是 [4, 6]
\`\`\`

\`\`\`javascript
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    // 没有运算符重载！必须用方法
    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    // 迭代协议
    *[Symbol.iterator]() {
        yield this.x;
        yield this.y;
    }

    // 自定义 toString 之外的转换
    [Symbol.toPrimitive](hint) {
        if (hint === "number") return Math.hypot(this.x, this.y);
        return \`(\${this.x}, \${this.y})\`;
    }

    static get [Symbol.species]() {
        return Vector;  // 控制 map 等方法返回的子类类型
    }
}

const v = new Vector(1, 2);
console.log([...v]);         // [1, 2]
console.log(+v);             // 2.236  （Symbol.toPrimitive "number"）
\`\`\`

关键差异：
- **Python 支持运算符重载**（\`__add__\`、\`__eq__\`、\`__lt__\` 等），JS 不支持（\`+\`、\`==\` 行为固定）
- **Python 的协议更丰富**：\`__len__\`、\`__getitem__\`、\`__contains__\`、\`__enter__\`/\`__exit__\` 等，JS 用 Symbol 协议（\`Symbol.iterator\`、\`Symbol.toPrimitive\`、\`Symbol.hasInstance\`）

Python 的运算符重载让自定义类型能像内置类型一样自然使用（\`a + b\` 而不是 \`a.add(b)\`），代价是可能被滥用。JavaScript 拒绝运算符重载，保持 \`+\`/\`==\` 行为统一，代价是自定义类型体验稍差。

## 七、数据类：dataclass vs class fields

\`\`\`python
from dataclasses import dataclass, field

@dataclass
class User:
    name: str
    age: int = 0
    tags: list = field(default_factory=list)  # 可变默认值用 factory

    def __post_init__(self):
        # 初始化后钩子
        if self.age < 0:
            raise ValueError("age < 0")

u = User("Alice", 30)
print(u)  # User(name='Alice', age=30, tags=[])

# 自动生成 __eq__
u2 = User("Alice", 30)
print(u == u2)  # True

# 可变 vs 不可变
@dataclass(frozen=True)
class Point:
    x: int
    y: int
# Point(1, 2).x = 5  # FrozenInstanceError
\`\`\`

\`\`\`javascript
// JavaScript：class fields（ES2022），没有自动 __eq__
class User {
    // 字段声明（实例属性）
    name;
    age = 0;
    tags = [];

    constructor(name, age) {
        this.name = name;
        if (age !== undefined) this.age = age;
    }

    // 没有 __eq__，必须自己写
    equals(other) {
        return this.name === other.name && this.age === other.age;
    }

    toString() {
        return \`User(name=\${this.name}, age=\${this.age})\`;
    }
}

const u = new User("Alice", 30);
const u2 = new User("Alice", 30);
console.log(u.equals(u2));  // true
console.log(u === u2);      // false  （引用比较）
\`\`\`

Python 的 \`@dataclass\` 是声明式数据类的杀手锏——一行装饰器自动生成 \`__init__\`、\`__repr__\`、\`__eq__\`，支持默认值、可变性控制、后初始化钩子。JavaScript 的 class fields 只是简化了实例属性声明，没有这些自动化能力。

## 八、私有性：约定 vs 真私有

\`\`\`python
class Account:
    def __init__(self, balance):
        self._balance = balance    # 约定私有（仍可访问）
        self.__secret = "xxx"      # 名称改写（伪私有）

    def _internal(self):
        # 约定内部方法
        pass

    def __private_method(self):
        # 名称改写为 _Account__private_method
        pass

acc = Account(100)
print(acc._balance)              # 100  （能访问，但约定不要）
# print(acc.__secret)            # AttributeError
print(acc._Account__secret)      # "xxx"  （仍可访问，伪私有）
\`\`\`

\`\`\`javascript
class Account {
    #balance;        // 真私有字段（ES2022）
    #secret = "xxx";

    constructor(balance) {
        this.#balance = balance;
    }

    #privateMethod() {
        // 真私有，外部无法访问
    }

    get balance() {
        return this.#balance;
    }
}

const acc = new Account(100);
// console.log(acc.#balance);   // SyntaxError
// console.log(acc.balance);    // 通过 getter 访问
\`\`\`

**有趣的反转**：
- Python 的"私有"是约定（\`_x\`）或名称改写（\`__x\`），都能被绕过
- JavaScript 的 \`#field\` 是**真私有**——语言层面强制，外部完全无法访问

JavaScript 在这一点上比 Python 更严格。\`#private\` 是 ES2022 才标准化的，但已被主流环境广泛支持。

## 九、OOP 对比总表

| 特性 | Python | JavaScript |
|------|--------|------------|
| OO 模型 | 基于类 | 基于原型（class 是语法糖） |
| 类本质 | 元类实例 | 函数对象 |
| 构造器 | \`__init__\` | \`constructor\` |
| 继承 | \`class B(A):\` + super() | \`class B extends A\` + super() |
| 多继承 | ✅ MRO 支持 | ❌ 单继承 + Mixin |
| 属性访问 | \`@property\` | \`get\`/\`set\` 关键字 |
| 字符串表示 | \`__str__\` + \`__repr__\` | \`toString()\` + \`Symbol.toPrimitive\` |
| 运算符重载 | ✅ \`__add__\` 等 | ❌ 不支持 |
| 迭代协议 | \`__iter__\`/\`__next__\` | \`Symbol.iterator\` |
| 私有性 | \`_x\`/\`__x\`（约定/改写） | \`#x\`（真私有） |
| 数据类 | \`@dataclass\` | class fields（无自动 __eq__） |
| 元编程 | 元类、\`__init_subclass__\` | \`Proxy\`、\`Reflect\` |

## 十、小结

Python 的 OOP 设计更"经典"——基于类、支持多继承、运算符重载、丰富的魔法方法，适合编写领域模型和算法库。JavaScript 的 OOP 设计更"原型化"——\`class\` 是语法糖、单继承 + Mixin、\`#private\` 真私有、\`Proxy\` 元编程，适合 Web 应用的动态需求。

两门语言的 OOP 都不是 Java/C# 那种"重 OO"——Python 偏好混合范式（函数式 + OOP），JavaScript 偏好基于原型的灵活性。下一章我们会聚焦在 Python 的杀手锏特性——**装饰器**，看 JavaScript 如何用高阶函数模拟同样的效果。`,
  },
  {
    id: "pyvsjs-decorators",
    icon: "🎨",
    title: "装饰器与高阶函数",
    group: "语法与类型",
    content: `# 装饰器与高阶函数

装饰器是 Python 最优雅的特性之一——\`@decorator\` 一行就能给函数加上横切逻辑（日志、缓存、权限、重试）。JavaScript 没有装饰器语法（TC39 提案折腾多年），但凭借一流的高阶函数和闭包，能实现等价效果。本章对比两门语言的"函数增强"机制。

## 一、高阶函数：共同的基础

两门语言的函数都是一等公民，高阶函数（接收函数为参数、或返回函数的函数）是共同能力：

\`\`\`python
# Python 高阶函数
def apply_twice(fn, x):
    return fn(fn(x))

print(apply_twice(lambda x: x + 3, 5))  # 11

# 函数作为返回值
def make_adder(n):
    def adder(x):
        return x + n
    return adder

add5 = make_adder(5)
print(add5(10))  # 15
\`\`\`

\`\`\`javascript
// JavaScript 高阶函数
function applyTwice(fn, x) {
    return fn(fn(x));
}

console.log(applyTwice(x => x + 3, 5));  // 11

function makeAdder(n) {
    return x => x + n;  // 箭头函数更简洁
}

const add5 = makeAdder(5);
console.log(add5(10));  // 15
\`\`\`

高阶函数是装饰器的基石——理解了"函数返回函数"，装饰器就只是语法糖。

## 二、Python 装饰器：语法糖的力量

### 基本装饰器

\`\`\`python
import time
from functools import wraps

def timing(fn):
    @wraps(fn)  # 保留原函数的元信息（名字、文档）
    def wrapper(*args, **kwargs):
        start = time.time()
        result = fn(*args, **kwargs)
        print(f"[timing] {fn.__name__} 耗时 {time.time() - start:.3f}s")
        return result
    return wrapper

# @decorator 是语法糖，等价于 slow = timing(slow)
@timing
def slow_func(n):
    """模拟慢函数"""
    time.sleep(0.1)
    return sum(range(n))

print(slow_func(1000))
# [timing] slow_func 耗时 0.101s
# 499500

print(slow_func.__name__)  # slow_func  （@wraps 保护了名字）
print(slow_func.__doc__)   # 模拟慢函数
\`\`\`

\`@timing\` 等价于 \`slow_func = timing(slow_func)\`——装饰器就是一个接收函数、返回函数的高阶函数。Python 的语法糖让它读起来像"声明"，而不是"包装"。

### 多个装饰器叠加

\`\`\`python
def uppercase_result(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs).upper()
    return wrapper

def exclaim_result(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs) + "!"
    return wrapper

@uppercase_result
@exclaim_result
def greet(name):
    return f"hello, {name}"

print(greet("alice"))  # HELLO, ALICE!
# 执行顺序：greet -> exclaim_result -> uppercase_result
# 等价于：greet = uppercase_result(exclaim_result(greet))
\`\`\`

装饰器叠加时，**靠近函数定义的先执行**，外层装饰器最后包装。这符合"洋葱模型"——外层装饰器包裹内层。

### 带参数的装饰器

\`\`\`python
def repeat(times):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            result = None
            for _ in range(times):
                result = fn(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(times=3)
def say(msg):
    print(msg)

say("hi")
# hi
# hi
# hi
\`\`\`

带参数的装饰器是"三层嵌套"——\`repeat(times)\` 返回真正的装饰器，装饰器再返回包装函数。\`@repeat(times=3)\` 等价于 \`say = repeat(times=3)(say)\`。

### 类装饰器

\`\`\`python
def singleton(cls):
    instances = {}
    @wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance

@singleton
class Database:
    def __init__(self, url):
        self.url = url

db1 = Database("postgres://localhost")
db2 = Database("mysql://localhost")
print(db1 is db2)  # True  （单例）
print(db1.url)     # postgres://localhost
\`\`\`

类装饰器接收类、返回类（或函数）。常见用途：单例、注册、添加方法。

## 三、functools：Python 的函数式工具箱

Python 的 \`functools\` 模块是装饰器生态的核心：

\`\`\`python
from functools import lru_cache, partial, reduce, singledispatch
import time

# 1. lru_cache：自动缓存（最近最少使用）
@lru_cache(maxsize=128)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(100))  # 瞬间算出（无缓存会递归爆炸）

# 2. partial：偏应用
def power(base, exp):
    return base ** exp
square = partial(power, exp=2)
cube = partial(power, exp=3)
print(square(5), cube(2))  # 25 8

# 3. singledispatch：单分派泛函数（按第一个参数类型分发）
@singledispatch
def process(data):
    raise TypeError(f"Unsupported type: {type(data)}")

@process.register
def _(data: int):
    return f"integer: {data}"

@process.register
def _(data: str):
    return f"string: {data}"

@process.register(list)
def _(data):
    return f"list of {len(data)} items"

print(process(42))        # integer: 42
print(process("hello"))   # string: hello
print(process([1, 2, 3])) # list of 3 items
\`\`\`

\`lru_cache\` 是 Python 装饰器最实用的应用——一行装饰器把递归函数变成 O(n) 复杂度。\`singledispatch\` 实现了基于类型的函数重载，是 Python 弥补"没有方法重载"的方案。

## 四、JavaScript：用高阶函数模拟装饰器

JavaScript 没有装饰器语法，所有"装饰器"都是显式的高阶函数包装：

\`\`\`javascript
// 基本装饰器：高阶函数
function timing(fn) {
    return function(...args) {
        const start = Date.now();
        const result = fn.apply(this, args);  // 注意保留 this
        console.log(\`[timing] \${fn.name} 耗时 \${Date.now() - start}ms\`);
        return result;
    };
}

// 必须显式包装
const slowFunc = timing(function slowFunc(n) {
    for (let i = 0; i < n; i++);  // 模拟耗时
    return n;
});

console.log(slowFunc(1e6));
// [timing] slowFunc 耗时 5ms
// 1000000
\`\`\`

注意 JavaScript 包装函数必须用 \`fn.apply(this, args)\` 而不是 \`fn(args)\`——这样才能保留 \`this\` 绑定（用于方法装饰）。这是 JS 没有 \`@decorator\` 的隐藏成本：每个包装都要小心处理 \`this\`。

### 多个装饰器叠加

\`\`\`javascript
function uppercaseResult(fn) {
    return function(...args) {
        return fn.apply(this, args).toUpperCase();
    };
}

function exclaimResult(fn) {
    return function(...args) {
        return fn.apply(this, args) + "!";
    };
}

// 显式嵌套（从内到外）
const greet = uppercaseResult(exclaimResult(function greet(name) {
    return \`hello, \${name}\`;
}));

console.log(greet("alice"));  // HELLO, ALICE!
\`\`\`

\`uppercaseResult(exclaimResult(greet))\` 读起来比 \`@uppercase_result @exclaim_result\` 啰嗦得多，尤其是装饰器数量多时。

### 带参数的"装饰器工厂"

\`\`\`javascript
function repeat(times) {
    return function(fn) {
        return function(...args) {
            let result;
            for (let i = 0; i < times; i++) {
                result = fn.apply(this, args);
            }
            return result;
        };
    };
}

const say = repeat(3)(function say(msg) {
    console.log(msg);
});

say("hi");  // hi hi hi
\`\`\`

### 类装饰器

\`\`\`javascript
function singleton(Class) {
    let instance;
    return function(...args) {
        if (!instance) instance = new Class(...args);
        return instance;
    };
}

const Database = singleton(class Database {
    constructor(url) {
        this.url = url;
    }
});

const db1 = new Database("postgres://localhost");
const db2 = new Database("mysql://localhost");
console.log(db1 === db2);  // true
console.log(db1.url);      // postgres://localhost
\`\`\`

JavaScript 的"类装饰器"通常返回一个工厂函数（用 \`new\` 调用），这破坏了 \`instanceof\` 检查。要保持 \`instanceof\` 需要返回类（用 \`class extends\` 包装），更复杂。

## 五、JavaScript 的装饰器提案：何时能等到？

JavaScript 的装饰器提案（TC39 stage 3）历经多次重新设计：

- **Stage 1（2014）**：Yehuda Katz 提出最初的"字段装饰器"
- **Stage 2（2017）**：被 Angular/TypeScript 大量使用，但语义有争议
- **Stage 3（2022）**：新版提案，只支持方法装饰器（不支持字段）

TypeScript 5.0（2023）实现了 Stage 3 装饰器：

\`\`\`typescript
// TypeScript 5.0+ 装饰器（Stage 3 提案）
function timing(originalMethod, context) {
    return function(...args) {
        const start = Date.now();
        const result = originalMethod.apply(this, args);
        console.log(\`\${context.name} 耗时 \${Date.now() - start}ms\`);
        return result;
    };
}

class Service {
    @timing
    slowMethod() {
        for (let i = 0; i < 1e6; i++);
    }
}

new Service().slowMethod();  // slowMethod 耗时 5ms
\`\`\`

但这个提案只支持**方法装饰器**，不支持函数装饰器、类装饰器、字段装饰器。比 Python 的装饰器能力弱得多。

## 六、函数组合与柯里化

### Python：手动实现

\`\`\`python
from functools import reduce

def compose(*fns):
    def composed(x):
        return reduce(lambda acc, fn: fn(acc), reversed(fns), x)
    return composed

# 或者更简洁
def compose(*fns):
    def composed(x):
        for fn in reversed(fns):
            x = fn(x)
        return x
    return composed

pipeline = compose(
    lambda x: x + 1,
    lambda x: x * 2,
    lambda x: x ** 2,
)
print(pipeline(3))  # ((3)^2 * 2) + 1 = 19

# 柯里化（手动）
def curry(fn):
    def curried(*args):
        if len(args) >= fn.__code__.co_argcount:
            return fn(*args)
        return lambda *more: curried(*args, *more)
    return curried

@curry
def add3(a, b, c):
    return a + b + c

print(add3(1)(2)(3))  # 6
print(add3(1, 2)(3))  # 6
print(add3(1)(2, 3))  # 6
\`\`\`

### JavaScript：lodash/ramda 生态

\`\`\`javascript
// 手动 compose
function compose(...fns) {
    return x => fns.reduceRight((acc, fn) => fn(acc), x);
}

const pipeline = compose(
    x => x + 1,
    x => x * 2,
    x => x ** 2
);
console.log(pipeline(3));  // 19

// pipe（从左到右，更直观）
function pipe(...fns) {
    return x => fns.reduce((acc, fn) => fn(acc), x);
}

const result = pipe(
    x => x ** 2,
    x => x * 2,
    x => x + 1
)(3);  // 19

// lodash 的 curry
const _ = require("lodash");
const add3 = _.curry((a, b, c) => a + b + c);
console.log(add3(1)(2)(3));  // 6
console.log(add3(1, 2)(3));  // 6
console.log(add3(1)(2, 3));  // 6
\`\`\`

JavaScript 因为箭头函数简洁，函数组合的写法更流畅。lodash/ramda 等库提供了完整的函数式工具，弥补了标准库的不足。Python 的 \`functools\` 相对克制，主要提供装饰器相关工具。

## 七、实战对比：日志装饰器

\`\`\`python
# Python 版本：装饰器优雅地应用到一批函数
def logged(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        print(f"[LOG] 调用 {fn.__name__}({args}, {kwargs})")
        try:
            result = fn(*args, **kwargs)
            print(f"[LOG] {fn.__name__} 返回 {result!r}")
            return result
        except Exception as e:
            print(f"[LOG] {fn.__name__} 抛出 {e!r}")
            raise
    return wrapper

@logged
def divide(a, b):
    return a / b

divide(10, 2)   # 正常
divide(10, 0)   # 抛 ZeroDivisionError，但日志已记录
\`\`\`

\`\`\`javascript
// JavaScript 版本：必须显式包装
function logged(fn) {
    return function(...args) {
        console.log(\`[LOG] 调用 \${fn.name}(\${JSON.stringify(args)})\`);
        try {
            const result = fn.apply(this, args);
            console.log(\`[LOG] \${fn.name} 返回 \${JSON.stringify(result)}\`);
            return result;
        } catch (e) {
            console.log(\`[LOG] \${fn.name} 抛出 \${e.message}\`);
            throw e;
        }
    };
}

const divide = logged(function divide(a, b) {
    return a / b;
});

divide(10, 2);
divide(10, 0);
\`\`\`

JavaScript 版本功能等价，但有几个体验劣势：
1. 没有 \`@\` 语法，必须写 \`const fn = logged(fn)\`
2. \`this\` 处理增加心智负担（虽然这里没用到）
3. 函数名要重复写（\`function divide\` 和 \`const divide\`）

## 八、装饰器对比总表

| 特性 | Python | JavaScript |
|------|--------|------------|
| 装饰器语法 | \`@decorator\` | ❌ 无（TC39 Stage 3 仅方法） |
| 函数装饰器 | ✅ 原生 | 用高阶函数模拟 |
| 类装饰器 | ✅ 原生 | 用高阶函数模拟 |
| 方法装饰器 | ✅ 原生 | ✅ Stage 3 提案（TS 5.0+） |
| 字段装饰器 | ✅ 原生 | ❌ 提案不支持 |
| 带参数装饰器 | 三层嵌套 | 高阶函数 + 调用 |
| 元信息保护 | \`@wraps\` | 手动复制 \`name\`/\`length\` |
| 标准库工具 | \`functools\` | lodash/ramda（第三方） |
| 缓存装饰器 | \`@lru_cache\` | 手动实现或 lodash.memoize |
| 分派装饰器 | \`@singledispatch\` | 手动 switch 或类型判断 |

## 九、何时该用装饰器/高阶函数

装饰器和高阶函数适合**横切关注点**（cross-cutting concerns）——和业务逻辑正交的功能：

- **日志**：记录函数调用、参数、返回值、异常
- **缓存**：\`@lru_cache\`、memoize
- **重试**：网络请求失败自动重试
- **限流**：API 调用频率控制
- **权限**：检查用户是否有权调用
- **事务**：数据库事务包裹（Django 的 \`@transaction.atomic\`）
- **路由**：Web 框架注册路由（Flask 的 \`@app.route\`、FastAPI 的 \`@app.get\`）

\`\`\`python
# FastAPI 的装饰器：路由 + 参数校验一体化
from fastapi import FastAPI
app = FastAPI()

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id}
\`\`\`

\`\`\`javascript
// Express 的等价写法：方法调用，不是装饰器
const express = require("express");
const app = express();

app.get("/users/:user_id", (req, res) => {
    const userId = req.params.user_id;
    res.json({ user_id: userId });
});
\`\`\`

注意 FastAPI 的 \`@app.get("/users/{user_id}")\` 把路由声明和方法定义融为一体，比 Express 的 \`app.get(path, handler)\` 更声明式。这是 Python 装饰器在 Web 框架里的杀手级应用。

## 十、小结

Python 的装饰器是语言级特性——\`@\` 语法让横切逻辑声明化，\`functools\` 提供成熟的工具链，Web 框架（Flask/FastAPI/Django）深度依赖装饰器。JavaScript 没有装饰器语法，靠高阶函数模拟，体验上要写更多代码、处理 \`this\` 绑定，但凭借箭头函数的简洁和 lodash 生态，函数式风格同样强大。

两门语言的差异本质是**哲学差异**：Python 追求"一种明显的方式"——装饰器是横切逻辑的标准答案；JavaScript 追求"灵活至上"——高阶函数 + 各种模式让开发者自由选择。

至此，第 2 批章节（第 6-11 章）结束。我们已经从类型系统、基础类型、容器、函数、OOP、装饰器六个维度深入对比了 Python 和 JavaScript。下一批章节将进入**异步编程、模块系统、错误处理**等运行时行为层面的对比。`,
  },
];
