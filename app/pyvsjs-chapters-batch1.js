// =============================================================
// Python vs JavaScript/TypeScript/Node.js 深度对比 —— 第 1 批
// -------------------------------------------------------------
// 转义规则：content 内部反引号写作 \`，${ 写作 \$\{
// =============================================================

export const chapters = [
  {
    id: "pyvsjs-intro",
    icon: "🧭",
    title: "设计哲学：两种世界观",
    group: "概览与历史",
    content: `# 设计哲学：两种世界观

## 一、两门语言，两个时代

Python 诞生于 1989 年的圣诞节假期，Guido van Rossum 在阿姆斯特丹的办公室里为了打发 holiday boredom，开始写一个"ABC 语言的继任者"。他的目标很明确：**一门让人用起来舒服、读起来像英语、适合教学和快速开发的脚本语言**。

JavaScript 诞生于 1995 年 5 月，Brendan Eich 在 Netscape 用 **10 天**赶工出来。它的使命完全不同：**给网页加点交互**——表单验证、按钮点击、简单动画。它被设计成"非程序员的编程语言"，嵌入在浏览器里，让设计师也能写两行。

这两门语言的出生背景，几乎决定了它们今天的一切。

| 维度 | Python | JavaScript |
|------|--------|------------|
| 诞生年份 | 1989（1991 正式发布） | 1995 |
| 诞生用时 | 数年打磨 | 10 天 |
| 创始人 | Guido van Rossum | Brendan Eich |
| 初始目标 | 系统脚本/教学/通用 | 浏览器内嵌交互 |
| 设计优先级 | 可读性 > 一切 | 能跑就行 > 一切 |
| 命名来源 | Monty Python 喜剧团 | 蹭 Java 热度（和 Java 无关） |

## 二、Python 的核心设计哲学

Python 的设计哲学被浓缩在 **The Zen of Python**（PEP 20）里，输入 \`import this\` 就能看到。核心几条：

### 1. 可读性是第一公民

\`\`\`python
# Python：用缩进表示代码块，没有花括号
if score > 90:
    grade = "A"
    print("优秀")
else:
    grade = "B"
    print("良好")
\`\`\`

Guido 的信念是：**代码被阅读的次数远多于被编写的次数**。所以 Python 强制缩进，消除"代码风格之争"——你不必争论花括号放哪一行，因为根本没有花括号。

### 2. "应该有一种——最好只有一种——明显的方式来做这件事"

这是 Python 和 Perl/Ruby 的根本分歧。Perl 的口号是"There's More Than One Way To Do It"（TMTOWTDI），给程序员最大自由。Python 反其道而行之：

\`\`\`python
# Python：循环只有一种写法
for item in items:
    process(item)

# 对比 Perl/Ruby：至少有 5 种写法，foreach、for、each、map、loop...
\`\`\`

这种"统一"降低了团队协作的认知负担——所有人写的 Python 代码看起来都差不多。

### 3. 电池全含（Batteries Included）

Python 标准库极其丰富：\`os\`、\`sys\`、\`json\`、\`csv\`、\`sqlite3\`、\`urllib\`、\`asyncio\`、\`re\`、\`logging\`、\`unittest\`、\`pathlib\`……开箱即用，不装任何第三方包就能干很多事。

\`\`\`python
# 不装任何包，标准库就能发 HTTP 请求
import urllib.request
resp = urllib.request.urlopen("https://api.example.com/data")
print(resp.read().decode())
\`\`\`

JavaScript 的标准库则薄得多——连读取文件都需要 Node.js 的 \`fs\` 模块（不属于语言本身），浏览器端更是只有 DOM/BOM API。

### 4. 显式优于隐式

\`\`\`python
# Python：self 必须显式写出
class Dog:
    def bark(self):
        print(f"{self.name}: Woof!")

# JavaScript：this 隐式绑定，经常让人困惑
class Dog {
    bark() {
        console.log(\`\${this.name}: Woof!\`);
    }
}
\`\`\`

Python 的 \`self\` 虽然啰嗦，但你永远知道"这个方法属于谁"。JavaScript 的 \`this\` 是运行时动态绑定的，\`箭头函数\`、\`bind\`、\`call\`、\`apply\` 各种规则，是无数 bug 的来源。

## 三、JavaScript 的核心设计哲学

JavaScript 的哲学是被环境逼出来的——10 天赶工、浏览器大战、向后兼容的诅咒。

### 1. 务实主义至上

\`\`\`javascript
// JavaScript 的类型转换"魔法"
console.log(1 + "2");      // "12"  （数字 + 字符串 = 字符串拼接）
console.log(1 - "2");      // -1    （数字 - 字符串 = 数值减法）
console.log([] + {});      // "[object Object]"
console.log({} + []);      // 取决于上下文...
console.log(true + true);  // 2
console.log("11" + 1);     // "111"
console.log("11" - 1);     // 10
\`\`\`

这些"骚操作"在 Python 看来是灾难，但 JavaScript 的态度是：**能跑就行，别 break 旧网页**。这种务实（或者说妥协）贯穿了 JS 的整个历史。

### 2. 向后兼容是铁律

JavaScript 有一个 Web 平台特有的约束：**任何被发布到网上的 JS 代码，永远不能 break**。因为浏览器不知道你访问的 1998 年的老网站还在用某个旧语法。

所以 JavaScript 的演进方式是"只加不改"：
- \`var\` 有问题？加 \`let\`/\`const\`，但 \`var\` 保留
- \`==\` 有坑？加 \`===\`，但 \`==\` 保留
- 回调地狱？加 \`Promise\`，再加 \`async/await\`，但回调保留
- 原型链难懂？加 \`class\` 语法糖，但原型链保留

Python 则不同——Python 2 到 3 是**不兼容的大版本升级**，\`print\` 从语句变成函数，字符串默认变 Unicode，\`range\` 返回迭代器而非列表。虽然迁移痛苦了十年，但语言变得更干净了。

### 3. 万物皆对象（真的万物）

\`\`\`javascript
// JavaScript：数字可以调方法，因为数字是 Number 对象的实例
console.log((42).toString());        // "42"
console.log((3.14).toFixed(1));      // "3.1"
console.log("hello".toUpperCase());   // "HELLO"
console.log([1,2,3].map(x => x * 2)); // [2, 4, 6]

// 甚至函数也是对象
function greet() { return "hi"; }
greet.customProp = "我是函数的属性";
console.log(greet.customProp);  // "我是函数的属性"
\`\`\`

\`\`\`python
# Python：数字不是对象，没有方法链
x = 42
# x.toString()  # AttributeError! 整数没有 toString 方法
# 必须用内置函数
print(str(x))      # "42"
print(format(x))   # "42"
\`\`\`

Python 的设计是：**内置类型和用户类型有明确分层**。\`int\`、\`str\`、\`list\` 是内置类型，你不能给它们动态加方法（猴子补丁对内置类型无效）。JavaScript 则一切平等，任何对象都可以随时加属性。

### 4. 事件驱动是基因

JavaScript 从第一天起就是事件驱动的：

\`\`\`javascript
// 1995 年的 JavaScript：给按钮绑点击事件
document.getElementById("myBtn").onclick = function() {
    alert("被点了！");
};

// 2024 年的 JavaScript：还是事件驱动，只是语法变了
button.addEventListener("click", () => {
    console.log("被点了！");
});
\`\`\`

这深刻影响了 Node.js 的设计——Node.js 把"事件驱动"从浏览器 UI 扩展到了 I/O 操作：所有网络请求、文件读写都是异步事件。Python 的 asyncio 是后来才加的（3.4/3.5），和 JavaScript 的"天生异步"有本质区别。

## 四、一句话总结

> **Python 是一个有强烈审美主张的语言**——它告诉你"应该这样写"，强制缩进、PEP 8、单一做法，换来的是极高的可读性和团队一致性。
>
> **JavaScript 是一个被现实塑造的语言**——10 天赶工、浏览器大战、向后兼容的诅咒，造就了它的灵活与混乱并存。但它赢了——浏览器是最大的运行时，Node.js 让它占领了服务端，React 让它统治了前端。

理解了这两种哲学，后续所有语法差异、运行时差异、生态差异，都是这两种世界观的延伸。

## 五、本书怎么读

本书共 38 章，分为六大板块：

1. **概览与历史**（第 1-3 章）：建立整体认知
2. **语法与类型**（第 4-15 章）：从词法到类型系统逐一对比
3. **运行时与底层**（第 16-21 章）：CPython vs V8、字节码 vs JIT、GC 机制
4. **并发与异步**（第 22-28 章）：GIL vs 事件循环、asyncio vs async/await
5. **生态与工程**（第 29-34 章）：包管理、框架、工具链、部署
6. **选型指南**（第 35-38 章）：Web 后端选 Python 还是 Node.js

每一章都会给出两门语言的对比例子，不只是"语法不同"，而是讲清楚**为什么不同**——背后的设计决策、历史包袱、技术权衡。`,
  },

  {
    id: "pyvsjs-history",
    icon: "📜",
    title: "演进史：从 1991 到 2024",
    group: "概览与历史",
    content: `# 演进史：从 1991 到 2024

## 一、Python 的版本演进

### 1. 早期：Python 0.9 → 1.x（1991-2000）

Python 0.9.0 于 1991 年 2 月发布，已经有类、异常处理、函数、模块等核心特性。1994 年的 Python 1.0 加入了 lambda、map、filter、reduce（函数式编程特性，来自 Lisp）。

\`\`\`python
# Python 1.0 时代：lambda 和函数式工具
nums = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x**2, nums))
evens = list(filter(lambda x: x % 2 == 0, nums))
total = reduce(lambda a, b: a + b, nums)  # reduce 在 functools 里
\`\`\`

### 2. Python 2：黄金时代（2000-2020）

Python 2.0 于 2000 年发布，带来了**列表推导式**（从 Haskell 借鉴）和**垃圾回收器**（循环引用检测）。列表推导式是 Python 语法演进的里程碑：

\`\`\`python
# Python 2.0 之前：用 map/filter
squares = map(lambda x: x**2, range(10))

# Python 2.0 之后：列表推导式，更可读
squares = [x**2 for x in range(10)]
\`\`\`

Python 2.7 是 2.x 的最后一个版本（2010 年），支持到 2020 年 1 月 1 日正式 EOL。很多遗留系统至今仍在运行 2.7。

### 3. Python 3：大清洗（2008-至今）

2008 年，Python 3.0 发布。这是一次**不向后兼容的大版本升级**，Guido 称之为"Python 的赎罪"。核心变化：

| 变化 | Python 2 | Python 3 |
|------|----------|----------|
| 字符串 | 默认 bytes，需加 u 前缀才是 Unicode | 默认 Unicode（str），bytes 是独立类型 |
| print | 语句 \`print x\` | 函数 \`print(x)\` |
| 除法 | \`3/2 = 1\`（整数除法） | \`3/2 = 1.5\`（真除法），\`3//2 = 1\` |
| range | 返回列表 | 返回迭代器（节省内存） |
| 异常语法 | \`except Exception, e:\` | \`except Exception as e:\` |
| 字典 | \`dict.keys()\` 返回列表 | 返回视图对象 |

Python 2→3 的迁移花了整整 **12 年**（2008-2020），是编程语言史上最痛苦的迁移之一。但这换来的是更干净的语言：Unicode 默认、更一致的 API、更好的类型支持。

### 4. 现代 Python：3.6+（2015-至今）

Python 3.6 是分水岭，之后的版本才真正"现代"：

\`\`\`python
# 3.6：f-string（字符串格式化的终极形态）
name = "World"
print(f"Hello, {name}!")

# 3.6：变量注解（类型提示）
age: int = 25
names: list[str] = ["Alice", "Bob"]

# 3.8：海象运算符 :=
if (n := len(data)) > 10:
    print(f"数据太长：{n} 条")

# 3.10：match-case（结构化模式匹配）
match status:
    case 200:
        print("OK")
    case 404:
        print("Not Found")
    case _:
        print("Unknown")

# 3.11：异常组
try:
    ...
except* ValueError as eg:
    ...  # 同时处理多个同类异常

# 3.12：类型参数语法（泛型简化）
def first[T](items: list[T]) -> T:
    return items[0]
\`\`\`

Python 的演进策略是"稳步小步迭代"——每年一个版本（3.x），每个版本加几个特性，不搞大破坏。

## 二、JavaScript 的版本演进

### 1. 早期：Mocha → LiveScript → JavaScript（1995-1999）

Brendan Eich 原本想设计一门类 Scheme 的函数式语言，但 Netscape 管理层要求"语法看起来像 Java"（为了营销）。结果 JavaScript 成了**函数式内核 + C 风格语法**的混血儿。

1997 年，JavaScript 被 ECMA 标准化为 **ECMAScript**（ES）。ES1-ES3（1997-1999）奠定了基础语法。

### 2. 黑暗十年：ES4 流产（2000-2009）

ES4 试图给 JavaScript 加类、类型系统、命名空间……但提案太激进，被微软和 Yahoo 联合否决。JavaScript 停滞了近十年。

这十年里，JavaScript 被视为"玩具语言"——AJAX（2005）让它变得有用，jQuery（2006）让它变得可写，但语言本身没有进化。

### 3. ES5：温和改良（2009）

ES5 没有加新语法，但加了一批关键 API：

\`\`\`javascript
// ES5：strict mode（开启更严格的解析）
"use strict";

// ES5：数组方法
[1, 2, 3].forEach(x => console.log(x));
[1, 2, 3].map(x => x * 2);
[1, 2, 3].filter(x => x > 1);
[1, 2, 3].reduce((a, b) => a + b);

// ES5：Object 方法
Object.keys({a: 1, b: 2});  // ["a", "b"]
Object.freeze(obj);          // 冻结对象
\`\`\`

### 4. ES6/ES2015：革命（2015）

ES6 是 JavaScript 的"Python 3 时刻"——一次巨大的语法升级。但它不像 Python 3 那样不兼容，而是全部**向后兼容**地加入新语法：

\`\`\`javascript
// ES6 之前 vs ES6

// 变量声明
var x = 1;           // ES5：函数作用域，可重复声明
let y = 2;           // ES6：块级作用域，不可重复声明
const Z = 3;         // ES6：常量

// 箭头函数
[1,2,3].map(function(x) { return x*2; });  // ES5
[1,2,3].map(x => x * 2);                    // ES6

// 模板字符串
var msg = "Hello, " + name + "!";   // ES5
const msg = \`Hello, \${name}!\`;       // ES6

// 解构
var a = arr[0]; var b = arr[1];  // ES5
const [a, b] = arr;               // ES6

// 类语法（语法糖，底层还是原型链）
class Dog {
    constructor(name) { this.name = name; }
    bark() { return "Woof"; }
}

// 模块系统
import { foo } from './module.js';
export function bar() { ... }

// Promise（告别回调地狱）
fetch('/api').then(r => r.json()).then(data => console.log(data));

// 默认参数、剩余参数、扩展运算符
function f(a = 1, ...rest) { ... }
const merged = [...arr1, ...arr2];
\`\`\`

### 5. ES2016-ES2024：年度小版本

ES6 之后改为**每年一个版本**，每年加几个特性：

| 版本 | 年份 | 关键特性 |
|------|------|----------|
| ES2016 | 2016 | \`Array.includes()\`、\`**\` 幂运算 |
| ES2017 | 2017 | \`async/await\`、\`Object.entries()\` |
| ES2018 | 2018 | 异步迭代、剩余/扩展属性 |
| ES2019 | 2019 | \`Array.flat()\`、\`Object.fromEntries()\` |
| ES2020 | 2020 | 可选链 \`?.\`、空值合并 \`??\`、BigInt |
| ES2021 | 2021 | \`String.replaceAll()\`、逻辑赋值 \`||=\` |
| ES2022 | 2022 | 顶层 await、类字段、\`.at()\` |
| ES2023 | 2023 | \`Array.findLast()\`、Hashbang |
| ES2024 | 2024 | \`Promise.withResolvers()\`、\`Object.groupBy()\` |

\`\`\`javascript
// ES2020：可选链 ?.  —— 革命性的小特性
// ES2020 之前：
const zip = user && user.address && user.address.zip;

// ES2020 之后：
const zip = user?.address?.zip;

// 空值合并 ??
const name = input ?? "default";  // 只有 null/undefined 才用默认值
// 对比 || ：
const count = 0 || 10;   // 10（0 是 falsy，被跳过）
const count = 0 ?? 10;   // 0（0 不是 null/undefined，保留）
\`\`\`

### 6. TypeScript：JavaScript 的救赎（2012-至今）

Anders Hejlsberg（C# 之父）在微软领导开发了 TypeScript，2012 年发布。TypeScript 是 JavaScript 的**超集**——所有合法的 JS 都是合法的 TS，但 TS 加了静态类型。

\`\`\`typescript
// TypeScript：类型注解
function greet(name: string): string {
    return \`Hello, \${name}!\`;
}

// 接口
interface User {
    id: number;
    name: string;
    email?: string;  // 可选属性
}

// 泛型
function first<T>(arr: T[]): T {
    return arr[0];
}

// 联合类型
type Result = string | number | null;

// 类型守卫
function process(value: string | number) {
    if (typeof value === "string") {
        return value.toUpperCase();  // TypeScript 知道这里是 string
    }
    return value.toFixed(2);  // 这里是 number
}
\`\`\`

TypeScript 不是独立语言——它编译成 JavaScript 运行。它的类型在运行时被完全擦除（type erasure），不产生任何运行时开销。

## 三、演进策略对比

| 维度 | Python | JavaScript |
|------|--------|------------|
| 升级策略 | 允许不兼容升级（2→3） | 永远向后兼容 |
| 发布节奏 | 每年一个 3.x | 每年一个 ES 版本 |
| 标准化 | PEP（Python Enhancement Proposal） | TC39（技术委员会提案） |
| 类型系统 | 3.5+ 类型提示（可选，运行时不检查） | TypeScript（独立超集语言） |
| 运行时 | CPython 统一 | V8/SpiderMonkey/JSC 多引擎 |
| 迁移痛苦度 | 2→3 极其痛苦 | 几乎无痛（加新东西不改旧的） |

Python 的"敢做不兼容升级"让语言保持干净，但代价是十年迁移阵痛。JavaScript 的"永远兼容"让生态繁荣，但代价是历史包袱永远甩不掉（\`typeof null === "object"\` 这个 bug 至今存在）。

## 四、Node.js 的诞生：JavaScript 逃出浏览器（2009）

2009 年，Ryan Dahl 发布 Node.js，把 V8 引擎从浏览器里扒出来，配上文件系统和网络模块，让 JavaScript 能在服务端运行。这是一个历史性时刻：

\`\`\`javascript
// Node.js：JavaScript 第一次能读写文件
const fs = require('fs');
const data = fs.readFileSync('/etc/hosts', 'utf8');
console.log(data);

// 第一次能起 HTTP 服务器
const http = require('http');
http.createServer((req, res) => {
    res.end('Hello from Node.js!');
}).listen(3000);
\`\`\`

Node.js 的核心创新是**非阻塞 I/O + 事件循环**——所有 I/O 操作都是异步的，单线程也能处理高并发。这和 Python 传统的同步阻塞模型完全不同，直到 asyncio 出现才有对应物。

## 五、时间线总览

\`\`\`
1991  Python 0.9 发布
1995  JavaScript 诞生（10 天）
1997  ECMAScript 1 标准化
2000  Python 2.0（列表推导式）
2008  Python 3.0（不兼容升级）
2009  Node.js 诞生 / ES5 发布
2012  TypeScript 发布
2015  Python 3.5（async/await 类型提示）/ ES6（箭头函数、class、Promise）
2018  Python 3.7（dataclass）
2020  Python 2 EOL / ES2020（可选链）
2024  Python 3.13（free-threaded 实验性移除 GIL）/ ES2024
\`\`\`

两门语言都在持续进化，互相借鉴。Python 学 JavaScript 加了 async/await，JavaScript 学 Python 加了列表方法。但它们的基因——Python 的"统一与可读" vs JavaScript 的"灵活与兼容"——始终没有改变。`,
  },

  {
    id: "pyvsjs-landscape",
    icon: "🗺️",
    title: "应用版图与生态全貌",
    group: "概览与历史",
    content: `# 应用版图与生态全貌

## 一、各自的主场

Python 和 JavaScript 的应用领域有重叠也有分明的主场。理解这张版图，是后续选型的基础。

| 领域 | Python | JavaScript/Node.js | 谁主导 |
|------|--------|---------------------|--------|
| 数据科学/AI/ML | ✅ 统治级 | ❌ 几乎缺席 | Python |
| 深度学习 | ✅ 统治级 | ⚠️ 仅有 TensorFlow.js | Python |
| Web 前端 | ❌ 几乎缺席 | ✅ 统治级 | JavaScript |
| Web 后端 | ✅ 强势（Django/FastAPI） | ✅ 强势（Express/NestJS） | 平分秋色 |
| 命令行工具 | ✅ 常用 | ⚠️ 可用但非主流 | Python |
| 桌面应用 | ⚠️ 可用（Tkinter/PyQt） | ⚠️ 可用（Electron） | 都不强 |
| 运维脚本 | ✅ 传统强项 | ⚠️ 增长中 | Python |
| 爬虫 | ✅ 统治级 | ⚠️ 有 Puppeteer | Python |
| 实时应用 | ⚠️ 可用 | ✅ 强项 | Node.js |
| Serverless | ✅ 可用 | ✅ 非常流行 | Node.js 略优 |
| 系统编程 | ❌ 不适合 | ❌ 不适合 | 都不是（C/Rust/Go） |
| 嵌入式/IoT | ⚠️ MicroPython | ⚠️ 可用 | 都不强 |

## 二、Python 的主场

### 1. 数据科学与机器学习

这是 Python 最不可替代的领域。整个 AI 革命的基础设施——NumPy、Pandas、Scikit-learn、PyTorch、TensorFlow——全部是 Python 生态。

\`\`\`python
# 数据科学的典型工作流：Python 一条龙
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# 读数据
df = pd.read_csv("data.csv")
# 清洗
df = df.dropna()
# 特征工程
X = df[["age", "income", "score"]].values
y = df["label"].values
# 训练
X_train, X_test, y_train, y_test = train_test_split(X, y)
model = RandomForestClassifier()
model.fit(X_train, y_train)
# 评估
print(f"准确率: {model.score(X_test, y_test):.2%}")
\`\`\`

JavaScript 在这个领域几乎空白——不是因为做不到，而是因为整个生态（从学术研究到工业实践）都围绕 Python 建立起来了，迁移成本极高。

### 2. 爬虫与数据采集

\`\`\`python
# Python 爬虫：requests + BeautifulSoup，简单粗暴
import requests
from bs4 import BeautifulSoup

resp = requests.get("https://example.com")
soup = BeautifulSoup(resp.text, "html.parser")
titles = [h2.text for h2 in soup.find_all("h2")]
\`\`\`

Scrapy 框架更是工业级爬虫的标准。JavaScript 有 Puppeteer/Playwright（基于无头浏览器），适合需要渲染 JS 的场景，但纯数据采集还是 Python 更方便。

### 3. 运维与自动化脚本

\`\`\`python
#!/usr/bin/env python3
# 批量处理服务器日志
import os
import re
from pathlib import Path

log_dir = Path("/var/log/myapp")
for log_file in log_dir.glob("*.log"):
    errors = []
    for line in log_file.read_text().splitlines():
        if "ERROR" in line:
            errors.append(line)
    if errors:
        print(f"{log_file.name}: {len(errors)} 个错误")
\`\`\`

Python 在运维领域的地位来自：标准库强大（os/sys/subprocess/shutil）、跨平台、可读性好。Ansible、SaltStack 等运维工具都用 Python。

### 4. Web 后端

Django（大而全）和 FastAPI（现代异步）是 Python Web 后端的两大主力：

\`\`\`python
# FastAPI：现代 Python Web 后端
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items/")
async def create_item(item: Item):
    return {"created": item}
\`\`\`

## 三、JavaScript/Node.js 的主场

### 1. Web 前端——绝对垄断

这是 JavaScript 的"出生地"，也是它永远的主场。React、Vue、Angular、Svelte——所有前端框架都是 JavaScript/TypeScript 生态。Python 在这个领域完全没有存在感。

\`\`\`jsx
// React 组件：JavaScript 的主场
function TodoList({ todos }) {
    const [filter, setFilter] = useState("all");
    const filtered = todos.filter(t => {
        if (filter === "done") return t.done;
        if (filter === "todo") return !t.done;
        return true;
    });
    return (
        <div>
            <select value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">全部</option>
                <option value="done">已完成</option>
                <option value="todo">待办</option>
            </select>
            <ul>
                {filtered.map(t => <li key={t.id}>{t.text}</li>)}
            </ul>
        </div>
    );
}
\`\`\`

### 2. 实时应用与高并发 I/O

Node.js 的事件循环天生适合 I/O 密集型的高并发场景：

\`\`\`javascript
// Node.js：WebSocket 实时聊天
const { Server } = require('ws');
const wss = new Server({ port: 8080 });

wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        // 广播给所有客户端
        wss.clients.forEach(client => {
            client.send(msg);
        });
    });
});
\`\`\`

单线程事件循环，一个进程就能处理数万 WebSocket 连接。Python 要做到同样效果需要 asyncio + uvloop，且生态不如 Node.js 成熟。

### 3. Serverless 与边缘计算

AWS Lambda、Vercel Edge Functions、Cloudflare Workers 对 Node.js 支持最好——冷启动快、运行时轻量、生态匹配。

\`\`\`javascript
// Vercel Edge Function
export default function handler(req) {
    return new Response(JSON.stringify({ hello: "world" }), {
        headers: { "Content-Type": "application/json" }
    });
}
\`\`\`

### 4. 命令行工具与前端工具链

webpack、Vite、esbuild、Rollup——前端工具链全是 Node.js 写的。npm 是世界上最大的包注册中心（超过 300 万个包）。

\`\`\`javascript
// 用 Node.js 写 CLI 工具
#!/usr/bin/env node
import { program } from 'commander';

program
    .command('build')
    .option('--minify', '压缩代码')
    .action((options) => {
        console.log('构建中...', options);
    });

program.parse();
\`\`\`

## 四、重叠战场：Web 后端

Web 后端是两门语言直接竞争的主战场。这里的关键差异不在"能不能做"，而在"适合做什么"：

| 场景 | Python 优势 | Node.js 优势 |
|------|-------------|-------------|
| CRUD + API | Django Admin 开箱即用 | Express 极简灵活 |
| 异步 I/O | FastAPI + asyncio | 天生异步，生态成熟 |
| 实时推送 | 需要额外配置 | Socket.io 原生支持 |
| CPU 密集 | 多进程 + NumPy | 不适合（单线程阻塞） |
| 微服务 | FastAPI 轻量 | NestJS 企业级 |
| 全栈同构 | ❌ 前端不行 | ✅ 前后端同语言 |
| 数据处理 API | ✅ 直接调 Pandas/ML | ❌ 需要调 Python 服务 |

## 五、包生态规模对比

| 指标 | Python (PyPI) | JavaScript (npm) |
|------|---------------|-------------------|
| 包总数 | ~60 万 | ~300 万+ |
| 周下载量 | ~50 亿次 | ~2000 亿次+ |
| 典型包大小 | 较大（含 C 扩展） | 较小（纯 JS） |
| 依赖地狱 | requirements.txt/poetry | package.json/node_modules |
| 安装速度 | 较慢（编译 C 扩展） | 较快（纯 JS） |
| 版本管理 | venv/pipenv/poetry | nvm/npm/yarn/pnpm |

npm 的包数量远超 PyPI，但这也带来了"一个包只导出一个函数"的碎片化问题和供应链安全问题（如 2024 年的 npm 投毒事件）。Python 的包更"大粒度"，一个包通常包含完整功能。

## 六、就业市场与社区

### Python
- **岗位方向**：数据分析师、ML 工程师、后端开发、运维工程师、量化交易
- **薪资水平**：AI/ML 方向薪资极高，普通后端中等
- **学习曲线**：平缓，适合入门
- **社区文化**：学术气息浓，PEP 讨论，强调"Pythonic"

### JavaScript/TypeScript
- **岗位方向**：前端开发、全栈开发、Node.js 后端、移动端（React Native）
- **薪资水平**：前端中等偏高，全栈较高
- **学习曲线**：入门容易精通难（this、闭包、原型链、事件循环）
- **社区文化**：迭代极快，框架大战（React vs Vue vs Svelte），"JavaScript 疲劳"

## 七、本章小结

- **Python 的不可替代领域**：数据科学、机器学习、AI、爬虫、学术研究
- **JavaScript 的不可替代领域**：Web 前端、前端工具链
- **直接竞争领域**：Web 后端、CLI 工具、Serverless
- **Python 生态特点**：大粒度包、标准库强、学术驱动
- **JS 生态特点**：海量小包、npm 统治、前端驱动

选型的核心原则：**在 Python 的主场用 Python，在 JavaScript 的主场用 JavaScript，在重叠领域看具体需求**。后面的选型指南章节会详细展开。`,
  },

  {
    id: "pyvsjs-syntax",
    icon: "📝",
    title: "代码组织：缩进 vs 花括号",
    group: "语法与类型",
    content: `# 代码组织：缩进 vs 花括号

## 一、最显眼的差异

如果你把一段 Python 代码和一段 JavaScript 代码并排放在一起，最先注意到的差异一定是：**Python 用缩进定义代码块，JavaScript 用花括号**。

\`\`\`python
# Python：缩进即语法
def greet(name):
    if name:
        message = f"Hello, {name}!"
        print(message)
    else:
        print("Hello, stranger!")
\`\`\`

\`\`\`javascript
// JavaScript：花括号定义代码块
function greet(name) {
    if (name) {
        let message = \`Hello, \${name}!\`;
        console.log(message);
    } else {
        console.log("Hello, stranger!");
    }
}
\`\`\`

这不只是风格差异——它是两种完全不同的语法哲学。

## 二、Python 的缩进语法

### 1. 缩进是语法的一部分

在 Python 中，缩进不是"建议"，而是**语法规则**。缩进错误会直接报错：

\`\`\`python
def foo():
    x = 1
  y = 2  # IndentationError: unindent does not match any outer level
\`\`\`

Python 的词法分析器（tokenizer）在遇到缩进变化时会生成 \`INDENT\` 和 \`DEDENT\` 虚拟 token，相当于其他语言的 \`{\` 和 \`}\`。

### 2. 缩进规则

- 同一代码块内所有行的缩进必须一致（同级缩进量相同）
- 缩进可以用空格或 Tab，但**不能混用**
- PEP 8 规定用 **4 个空格**（社区共识，大多数项目遵循）
- 续行用反斜杠 \`\\\` 或括号

\`\`\`python
# 正确：用括号续行
result = some_function(
    arg1,
    arg2,
    arg3
)

# 正确：用反斜杠续行
total = 1 + 2 + 3 + \\
        4 + 5 + 6

# 错误：混用 Tab 和空格
def foo():
\tx = 1        # Tab
    y = 2        # 空格 → TabError
\`\`\`

### 3. 缩进的利与弊

**优势**：
- 强制可读性——没有"缩进乱的代码"
- 消除风格之争——不需要争论 \`{\` 放哪行
- 代码天然有层次感

**劣势**：
- 大段代码移动时缩进容易出错（粘贴后要重新对齐）
- 深层嵌套时缩进占太多空间
- 空格/Tab 混用是经典陷阱

\`\`\`python
# 深层嵌套的"缩进地狱"
def process_data(data):
    for item in data:
        if item.is_valid():
            for key in item.keys():
                if key.startswith("user_"):
                    while item[key]:
                        value = item[key].pop()
                        if value.is_active():
                            # 已经缩进 6 层了...
                            value.process()
\`\`\`

## 三、JavaScript 的花括号语法

### 1. 花括号定义块

JavaScript 用 \`{\` 和 \`}\` 包裹代码块，缩进只是视觉辅助，不影响语法：

\`\`\`javascript
// 这样写语法完全正确（虽然很难看）
function foo() {
let x = 1;
if (x) {
let y = 2;
console.log(y);
}
}
\`\`\`

### 2. ASI（自动分号插入）

JavaScript 有一个 Python 没有的"特性"：**分号可以省略**。JavaScript 引擎会自动补分号（ASI），但这带来了一些陷阱：

\`\`\`javascript
// 陷阱 1：return 后换行
function foo() {
    return
    {
        value: 1
    }
}
// 实际等价于：
// function foo() {
//     return;  // ← ASI 在这里插了分号！
//     { value: 1 };  // 这行永远执行不到
// }

// 陷阱 2：以 [ 或 ( 开头的行
const a = 1
const b = 2
[a, b].forEach(console.log)
// 等价于：const b = 2[a, b].forEach(console.log)  → 报错
\`\`\`

Python 没有这个问题——Python 的语句分隔靠换行（或分号 \`;\`，但几乎没人用），且没有 ASI 这种隐式行为。

### 3. 花括号的利与弊

**优势**：
- 缩进不影响逻辑，代码移动方便
- 可以用代码格式化工具（Prettier）自动统一风格
- 深层嵌套不会"越缩越远"（理论上可以全部顶格写，虽然没人这么做）

**劣势**：
- \`{\` 放哪行？——经典圣战（K&R 风格 vs Allman 风格）
- 容易漏写 \`}\` 或多写 \`}\`
- 不缩进的代码也能跑，可读性无保证

\`\`\`javascript
// K&R 风格（JS 主流）
if (x) {
    doSomething();
}

// Allman 风格（C# 主流，JS 少见）
if (x)
{
    doSomething();
}
\`\`\`

## 四、语句终止

| 特性 | Python | JavaScript |
|------|--------|------------|
| 语句分隔 | 换行（一行一条语句） | 分号 \`;\`（可省略，ASI 补） |
| 一行多条语句 | 用 \`;\` 分隔（不推荐） | 用 \`;\` 分隔 |
| 续行 | 括号或 \`\\\` | 不需要（表达式可跨行） |

\`\`\`python
# Python：一行多条语句（不推荐）
x = 1; y = 2; z = 3

# Python：长表达式可以自然跨行（在括号内）
result = (1 + 2 + 3 +
          4 + 5 + 6)
\`\`\`

\`\`\`javascript
// JavaScript：分号可选但不推荐省略
const x = 1;
const y = 2;

// 长表达式自然跨行
const result = 1 + 2 + 3 +
               4 + 5 + 6;
\`\`\`

## 五、注释语法

\`\`\`python
# Python 单行注释

"""
Python 多行注释（实际上是字符串字面量，
只是没有赋值给变量，被解释器忽略）
"""

# 没有专门的多行注释语法
# 只能用多个 # 或者三引号字符串
\`\`\`

\`\`\`javascript
// JavaScript 单行注释

/* JavaScript
   多行注释 */

/** JSDoc 注释（工具识别）
 * @param {string} name - 名字
 * @returns {string} 问候语
 */
function greet(name) { ... }
\`\`\`

Python 没有 \`//\` 注释，JavaScript 没有 \`#\` 注释（除了 Shebang \`#!/usr/bin/env node\`）。这是最容易搞混的语法之一。

## 六、表达式 vs 语句

Python 和 JavaScript 对"什么是表达式、什么是语句"的界定不同：

\`\`\`python
# Python：赋值是语句，不是表达式
# 不能写 if (x = get_value()):  ← 语法错误！
# 必须分开写：
x = get_value()
if x:
    ...

# Python 3.8+ 海象运算符 := 让赋值变成表达式
if (n := len(data)) > 10:
    print(f"数据太长：{n}")

# Python：条件表达式（三元运算符）
result = "yes" if ok else "no"

# Python：不能在 lambda 里写语句
# lambda: print("hi"); x = 1  ← 语法错误
\`\`\`

\`\`\`javascript
// JavaScript：赋值是表达式
if (x = getValue()) {  // 合法！但经常是 bug（== 写成 =）
    ...
}

// 条件表达式
const result = ok ? "yes" : "no";

// 箭头函数体可以是表达式
const greet = name => \`Hello, \${name}\`;
\`\`\`

JavaScript 比 Python 更"表达式化"——很多东西都是表达式，可以嵌在更复杂的表达式中。Python 更"语句化"——明确的语句/表达式分界，牺牲了灵活性但减少了歧义。

## 七、命名约定

| 约定 | Python | JavaScript |
|------|--------|------------|
| 变量/函数 | \`snake_case\` | \`camelCase\` |
| 类 | \`PascalCase\` | \`PascalCase\` |
| 常量 | \`UPPER_SNAKE\` | \`UPPER_SNAKE\` 或 \`camelCase\` |
| 私有成员 | \`_prefix\`（约定） | \`#prefix\`（ES2022 真私有） |
| 模块级私有 | \`_name\` | 无（ESM 无私有导出） |

\`\`\`python
# Python 命名约定（PEP 8）
MAX_CONNECTIONS = 100          # 常量
user_name = "alice"             # 变量/函数
def calculate_total(): ...      # 函数
class UserProfile: ...          # 类
_internal_helper = None         # 约定的"私有"
\`\`\`

\`\`\`javascript
// JavaScript 命名约定
const MAX_CONNECTIONS = 100;     // 常量
const userName = "alice";        // 变量/函数
function calculateTotal() { ... } // 函数
class UserProfile { ... }        // 类
#privateField = 0;               // ES2022 真私有字段
\`\`\`

## 八、本章小结

| 维度 | Python | JavaScript |
|------|--------|------------|
| 代码块 | 缩进（语法级强制） | 花括号 {} |
| 语句终止 | 换行 | 分号（可省略，ASI） |
| 注释 | \`#\` 和三引号 | \`//\` 和 \`/* */\` |
| 续行 | 括号或反斜杠 | 自然跨行 |
| 命名风格 | snake_case | camelCase |
| 赋值 | 语句（3.8+ 海象运算符） | 表达式 |

缩进 vs 花括号看似只是表面差异，实则反映了两门语言的核心哲学：**Python 强制一致性，JavaScript 给予自由度**。Python 说"你必须这样写"，JavaScript 说"你想怎么写都行，但后果自负"。`,
  },

  {
    id: "pyvsjs-scope",
    icon: "🔭",
    title: "变量声明与作用域",
    group: "语法与类型",
    content: `# 变量声明与作用域

## 一、变量声明方式

### Python 的声明方式

Python 没有真正的"声明"——你直接赋值，变量就创建了：

\`\`\`python
# Python：赋值即声明
x = 10           # 变量 x 被创建
name = "Alice"   # 变量 name 被创建

# 没有关键字声明普通变量
# 不存在 let/const/var，只有赋值

# 类型提示（3.6+）：不创建变量，只是注解
age: int = 25    # age 被创建，类型提示是给类型检查器看的
count: int       # 只注解不赋值，count 不会被创建！
# print(count)   # NameError: name 'count' is not defined
\`\`\`

Python 变量是**标签**（引用），不是盒子。赋值是把标签贴到对象上：

\`\`\`python
# Python：变量是标签
a = [1, 2, 3]
b = a            # b 和 a 指向同一个 list 对象
b.append(4)
print(a)         # [1, 2, 3, 4] —— a 也变了！
\`\`\`

### JavaScript 的三种声明方式

JavaScript 有三种变量声明关键字，各有不同的作用域和语义：

\`\`\`javascript
// var：函数作用域，可重复声明，有变量提升
var x = 10;
var x = 20;       // 合法（可重复声明）

// let：块级作用域，不可重复声明，有暂时性死区
let y = 10;
// let y = 20;   // SyntaxError: Identifier 'y' has already been declared

// const：块级作用域，不可重新赋值，不可重复声明
const z = 10;
// z = 20;       // TypeError: Assignment to constant variable
\`\`\`

## 二、作用域规则

### Python 的作用域：LEGB 规则

Python 有四级作用域，查找顺序为 **L → E → G → B**：

\`\`\`python
# B: Built-in（内置作用域）
#    print, len, range, int, str 等

# G: Global（全局/模块作用域）
counter = 0

def outer():
    # E: Enclosing（外层函数作用域）
    count = 0

    def inner():
        # L: Local（局部作用域）
        count = 1          # 这是创建新的局部变量！
        # 不是修改 enclosing 的 count

    inner()
    print(count)           # 还是 0

outer()
\`\`\`

**关键陷阱**：Python 函数内赋值默认创建局部变量。要修改外层变量需要 \`nonlocal\` 或 \`global\`：

\`\`\`python
counter = 0

def increment():
    counter += 1  # UnboundLocalError!
    # Python 看到 counter 的赋值，认为它是局部变量
    # 但执行 += 时还没赋值，所以报错

def increment_correct():
    global counter  # 声明使用全局变量
    counter += 1    # 现在可以修改了

# nonlocal 用于闭包中的外层函数变量
def make_counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment
\`\`\`

### JavaScript 的作用域

JavaScript 有两种作用域（ES6 之后）：

\`\`\`javascript
// 1. 函数作用域（var）
function foo() {
    if (true) {
        var x = 1;  // var 是函数作用域
    }
    console.log(x);  // 1 —— var 跳出了 if 块
}
// console.log(x);  // ReferenceError —— 但出不了函数

// 2. 块级作用域（let/const）
function bar() {
    if (true) {
        let y = 1;   // let 是块级作用域
        const z = 2; // const 也是
    }
    // console.log(y);  // ReferenceError —— let 出不了 if 块
}
\`\`\`

## 三、变量提升（Hoisting）

### JavaScript 的变量提升

JavaScript 引擎在执行代码前会先"提升"变量声明：

\`\`\`javascript
// var 的提升
console.log(x);  // undefined（不是 ReferenceError！）
var x = 1;
// 等价于：
// var x;          ← 声明被提升到顶部
// console.log(x); // undefined
// x = 1;          ← 赋值留在原地

// function 的提升（整个函数体都被提升）
greet();  // 正常执行！
function greet() { console.log("hi"); }

// let/const 也有提升，但有"暂时性死区"（TDZ）
// console.log(y);  // ReferenceError: Cannot access 'y' before initialization
let y = 1;
\`\`\`

**暂时性死区（TDZ）**是 \`let\`/\`const\` 的关键特性：从作用域开始到声明语句之间，变量存在但不可访问。这避免了 \`var\` 那种"undefined 但不报错"的困惑。

### Python 没有变量提升

Python 严格按照从上到下的顺序执行，变量必须先定义后使用：

\`\`\`python
print(x)  # NameError: name 'x' is not defined
x = 1

# 函数定义也是顺序的
foo()  # NameError
def foo():
    print("hi")
\`\`\`

但 Python 函数**体内部**可以引用后面定义的变量（因为函数体在调用时才执行）：

\`\`\`python
def main():
    helper()  # 合法！调用时 helper 已定义

def helper():
    print("help")

main()  # 正常执行
\`\`\`

## 四、const vs Python 的"常量"

### JavaScript 的 const

\`\`\`javascript
// const 阻止重新赋值，但不阻止修改对象内容
const arr = [1, 2, 3];
// arr = [4, 5, 6];    // TypeError: 重新赋值
arr.push(4);            // 合法！修改内容
console.log(arr);       // [1, 2, 3, 4]

const obj = { name: "Alice" };
obj.name = "Bob";       // 合法！
obj.age = 30;           // 合法！添加新属性

// 要真正冻结对象：
Object.freeze(obj);
// obj.name = "Charlie";  // 静默失败（strict mode 下报错）
\`\`\`

### Python 没有真正的常量

\`\`\`python
# Python 约定用大写命名表示常量，但语法上不阻止修改
MAX_SIZE = 100
MAX_SIZE = 200  # 语法上完全合法（只是违反约定）

# 想要不可变对象，用 tuple 或 frozenset
coords = (10, 20)       # tuple 不可变
# coords[0] = 15        # TypeError

# 自定义不可变类用 dataclass(frozen=True)
from dataclasses import dataclass

@dataclass(frozen=True)
class Config:
    host: str
    port: int

cfg = Config("localhost", 8080)
# cfg.port = 9090  # FrozenInstanceError
\`\`\`

## 五、闭包对比

两门语言都支持闭包，但捕获方式不同：

### Python 闭包：捕获变量本身（引用）

\`\`\`python
# 经典陷阱：循环中的闭包
funcs = []
for i in range(3):
    funcs.append(lambda: i)

for f in funcs:
    print(f())  # 2 2 2 —— 全是 2！

# 原因：lambda 捕获的是变量 i 的引用
# 循环结束时 i = 2，所以所有 lambda 都返回 2

# 修复方法 1：默认参数
funcs = [lambda i=i: i for i in range(3)]
# 现在 i 是默认参数，在定义时就被求值

# 修复方法 2：用函数工厂
def make_func(n):
    return lambda: n
funcs = [make_func(i) for i in range(3)]
# 每次调用 make_func 创建新的作用域，n 是独立的
\`\`\`

### JavaScript 闭包：let 有独立作用域

\`\`\`javascript
// JavaScript 用 let 时，每次循环有独立作用域
const funcs = [];
for (let i = 0; i < 3; i++) {
    funcs.push(() => i);
}
funcs.forEach(f => console.log(f()));  // 0 1 2 —— 正确！

// 但用 var 就和 Python 一样有问题
const funcs2 = [];
for (var i = 0; i < 3; i++) {
    funcs2.push(() => i);
}
funcs2.forEach(f => console.log(f()));  // 3 3 3
\`\`\`

JavaScript 的 \`let\` 在 \`for\` 循环中会为每次迭代创建新的绑定，这是 \`let\` 和 \`var\` 的关键区别之一。Python 没有这个机制，需要用默认参数或函数工厂来解决。

## 六、解构赋值

### Python 的解构

\`\`\`python
# 元组解构
a, b, c = 1, 2, 3

# 交换变量
a, b = b, a

# 忽略值
_, name = (1, "Alice")

# 扩展解构（3.x）
first, *rest = [1, 2, 3, 4, 5]
# first = 1, rest = [2, 3, 4, 5]

# 嵌套解构
(a, (b, c)) = (1, (2, 3))

# Python 3.10+：match-case 的结构化绑定
match point:
    case (0, 0):
        print("原点")
    case (x, 0):
        print(f"x 轴: {x}")
    case (0, y):
        print(f"y 轴: {y}")
\`\`\`

### JavaScript 的解构

\`\`\`javascript
// 数组解构
const [a, b, c] = [1, 2, 3];

// 交换变量
[a, b] = [b, a];

// 跳过值
const [, name] = [1, "Alice"];

// 扩展运算符
const [first, ...rest] = [1, 2, 3, 4, 5];

// 嵌套解构
const [a, [b, c]] = [1, [2, 3]];

// 对象解构（Python 没有这个！）
const { name, age } = { name: "Alice", age: 25 };

// 重命名解构
const { name: userName } = { name: "Alice" };
console.log(userName);  // "Alice"

// 默认值
const { timeout = 3000 } = {};
console.log(timeout);  // 3000

// 函数参数解构（非常常用）
function greet({ name, age = 18 }) {
    console.log(\`\${name}, \${age}\`);
}
greet({ name: "Alice" });  // "Alice, 18"
\`\`\`

JavaScript 的对象解构是 Python 没有的强大特性，在前端代码中极其常用（React 的 props 解构、配置提取等）。

## 七、作用域对比总结

| 特性 | Python | JavaScript |
|------|--------|------------|
| 声明关键字 | 无（直接赋值） | var / let / const |
| 作用域类型 | 函数作用域 + 模块作用域 | 函数作用域(var) + 块级作用域(let/const) |
| 变量提升 | ❌ 无 | ✅ 有（var 提升，let/const 有 TDZ） |
| 修改外层变量 | global / nonlocal | 天然可访问（闭包捕获引用） |
| 常量 | 约定（大写命名） | const（阻止重新赋值） |
| 循环闭包陷阱 | 存在（需默认参数修复） | let 自动解决 |
| 对象解构 | ❌ 无 | ✅ 强大 |

Python 的作用域设计更"简单直接"——没有提升、没有 TDZ、块级只有模块和函数。JavaScript 的作用域设计更"复杂但有历史原因"——var 的函数作用域是历史遗留，let/const 的块级作用域是 ES6 的修正，两者并存导致初学者困惑。

下一章我们会深入对比两门语言的**类型系统**——这是理解所有运行时行为的基础。`,
  },
];
