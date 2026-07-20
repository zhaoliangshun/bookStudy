// =============================================================
// TypeScript 全解 - 第三批章节（函数与接口，共 5 章）
// -------------------------------------------------------------
// 本批聚焦函数与接口两大核心建模能力：
//   tsbook-function-types      : 函数类型（注解、可选/默认/剩余参数）
//   tsbook-function-overload   : 函数重载（重载签名 vs 实现签名）
//   tsbook-this-type           : this 类型（ThisType、箭头函数 this）
//   tsbook-optional-readonly   : 可选、只读与可索引（?、readonly、索引签名）
//   tsbook-interface-vs-type   : interface 与 type 对比（声明合并、扩展）
//
// 风格：概念 + 对比 + 可运行 demo，每行关键代码带中文注释。
// 运行环境：TS 先转译为 JS（target ES2020），再在 Node.js 沙箱中运行。
// =============================================================

export const chapters = [
  // ============================================================
  // 第一章：函数类型
  // ============================================================
  {
    id: "tsbook-function-types",
    title: "函数类型",
    icon: "🔧",
    group: "函数与接口",
    content: `## 函数类型：把函数也"形状化"

函数是 JS 的一等公民，TS 自然要给函数一套完整的类型系统。**核心问题只有两个：参数怎么标、返回值怎么标。**

### 一、函数的三种声明方式

\`\`\`ts
// 1. 函数声明：会被提升
function add(a: number, b: number): number {
  return a + b;
}

// 2. 函数表达式：赋值给变量
const add2 = function (a: number, b: number): number {
  return a + b;
};

// 3. 箭头函数：没有自己的 this（后面讲）
const add3 = (a: number, b: number): number => a + b;
\`\`\`

> ⭐ 函数声明会被"提升"到作用域顶部，可以先调用后声明；函数表达式和箭头函数必须先定义后使用。

### 二、函数类型注解的两种写法

描述"一个函数长什么样"有两种等价写法：

\`\`\`ts
// 写法 A：type 别名（推荐，更灵活）
type AddFn = (a: number, b: number) => number;
const add: AddFn = (a, b) => a + b;

// 写法 B：interface（用调用签名）
interface AddFnI {
  (a: number, b: number): number;   // 注意是 () : 而不是 =>
}
const addI: AddFnI = (a, b) => a + b;
\`\`\`

| 维度 | type 别名 | interface 调用签名 |
| --- | --- | --- |
| 语法 | \`(a, b) => R\` | \`(a, b): R\` |
| 可读性 | 简洁直观 | 略繁琐 |
| 扩展属性 | 不方便 | 可以加属性 \`\`fn.version\`\` |
| 推荐 | 优先用 | 需要带属性的函数对象再用 |

> 💡 99% 场景用 \`type\` 写函数类型。只有当"函数本身还要挂属性"时才用 \`interface\`，比如 \`jQuery\` 既是一个函数又有 \`$.ajax\` 这种属性。

### 三、参数的三种特殊形式

#### 1. 可选参数 \`?\`

\`\`\`ts
function greet(name: string, greeting?: string): string {
  // greeting 是 string | undefined
  return \`\${greeting ?? "你好"}, \${name}\`;
}
greet("小明");              // ✅ greeting 不传也行
greet("小明", "哈喽");      // ✅ 传了也行
\`\`\`

> ⚠️ 可选参数**必须放在必选参数后面**，否则 TS 报错。

#### 2. 默认参数

\`\`\`ts
function greet(name: string, greeting = "你好"): string {
  return \`\${greeting}, \${name}\`;   // greeting 推断为 string（不是 string | undefined）
}
greet("小明");              // 用默认值 "你好"
\`\`\`

> 默认参数会自动推断为"必填类型"（不需要 \`??\`），且**不影响后面的参数顺序**——比可选参数更友好。

#### 3. 剩余参数 \`...args\`

\`\`\`ts
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3);        // 6
sum(1, 2, 3, 4, 5);  // 15
\`\`\`

### 四、函数类型的小技巧

- **回调函数类型**：\`type Callback = (err: Error | null, data?: any) => void\`
- **构造函数类型**：\`type Ctor = new (x: number) => T\`
- **推断返回值**：多数情况不用手写返回值类型，让 TS 推断；公开 API 建议显式标注。

下面 demo 把上述用法串起来，运行后会打印结果。`,
    code: `// ===== TypeScript 函数类型 demo =====

// 1) 三种声明方式
function add(a: number, b: number): number {   // 函数声明
  return a + b;
}
const add2 = function (a: number, b: number): number {  // 函数表达式
  return a + b;
};
const add3 = (a: number, b: number): number => a + b;   // 箭头函数
console.log("三种声明:", add(1, 2), add2(1, 2), add3(1, 2));

// 2) 函数类型注解 - type 别名（推荐）
type AddFn = (a: number, b: number) => number;
const fn: AddFn = (a, b) => a + b;   // 参数类型自动推断，不用重复写
console.log("type 别名:", fn(10, 20));

// 3) 函数类型注解 - interface 调用签名（带属性的函数对象）
interface AddFnI {
  (a: number, b: number): number;   // 调用签名：注意是 (): 不是 =>
  version: string;                  // 函数本身挂一个属性
}
const fnI = ((a: number, b: number) => a + b) as AddFnI;
fnI.version = "1.0.0";              // 给函数挂属性
console.log("interface 调用签名:", fnI(5, 6), "版本:", fnI.version);

// 4) 可选参数：必须放在必选参数后面
function greet(name: string, greeting?: string): string {
  // greeting 类型是 string | undefined，用 ?? 兜底
  return \`\${greeting ?? "你好"}, \${name}\`;
}
console.log("可选参数:", greet("小明"));          // 用兜底值
console.log("可选参数:", greet("小明", "哈喽"));   // 用传入值

// 5) 默认参数：自动推断为必填类型，不需要 ??
function greet2(name: string, greeting = "你好"): string {
  return \`\${greeting}, \${name}\`;   // greeting 推断为 string（已排除 undefined）
}
console.log("默认参数:", greet2("小红"));          // 用默认值
console.log("默认参数:", greet2("小红", "嗨"));     // 用传入值

// 6) 剩余参数：收集成数组
function sum(...nums: number[]): number {
  return nums.reduce((acc, n) => acc + n, 0);
}
console.log("剩余参数:", sum(1, 2, 3));         // 6
console.log("剩余参数:", sum(1, 2, 3, 4, 5));   // 15

// 7) 回调函数类型：常见的 node 风格 callback
type Callback = (err: Error | null, data?: string) => void;
function fetchData(cb: Callback) {
  // 模拟异步：成功时传 null + 数据
  setTimeout(() => cb(null, "hello"), 0);
}
fetchData((err, data) => {
  if (err) {
    console.log("回调-出错:", err.message);
  } else {
    console.log("回调-成功:", data);
  }
});

// 8) 构造函数类型：用 new 签名
type PointCtor = new (x: number, y: number) => { x: number; y: number };
const PointClass: PointCtor = class {
  constructor(public x: number, public y: number) {}
};
const p = new PointClass(3, 4);
console.log("构造函数类型:", p.x, p.y);`,
  },

  // ============================================================
  // 第二章：函数重载
  // ============================================================
  {
    id: "tsbook-function-overload",
    title: "函数重载",
    icon: "📚",
    group: "函数与接口",
    content: `## 函数重载：同一个函数名，多种调用方式

JS 里一个函数常根据参数类型返回不同结果，比如 \`Array.from(x)\` 既能接数组也能接字符串。**TS 的函数重载让你把这些"不同的调用方式"分别声明出来，调用方拿到精确的返回类型。**

### 一、为什么需要重载

先看不重载的痛：

\`\`\`ts
// ❌ 不重载：返回类型只能写成联合，调用方还要自己断言
function pick(x: string | number): string[] | number[] {
  if (typeof x === "string") return x.split("");
  return x.toString().split("").map(Number);
}
const r = pick("abc");
// r 类型是 string[] | number[]，没法直接用 .map(s => s.toUpperCase())
\`\`\`

调用方拿到的是"宽泛的联合类型"，每次用都得收窄——**类型系统失去了意义**。

### 二、重载的写法：重载签名 + 实现签名

\`\`\`ts
// 1. 重载签名（对外暴露的调用方式）
function pick(x: string): string[];     // 传 string → 返回 string[]
function pick(x: number): number[];     // 传 number → 返回 number[]

// 2. 实现签名（函数体的真实类型，对外不可见）
function pick(x: string | number): string[] | number[] {
  if (typeof x === "string") return x.split("");
  return x.toString().split("").map(Number);
}

pick("abc").map(s => s.toUpperCase());  // ✅ r 是 string[]
pick(123).map(n => n * 2);              // ✅ r 是 number[]
\`\`\`

### 三、重载的三条规则 ⭐

| 规则 | 说明 |
| --- | --- |
| **实现签名对外不可见** | 调用方只能用重载签名，看不到实现签名 |
| **实现签名要兼容所有重载** | 实现签名的参数必须是所有重载签名的"超集" |
| **重载按顺序自上而下匹配** | 写在前面的优先匹配，更具体的重载要放前面 |

\`\`\`ts
// ❌ 错误示范：实现签名不兼容重载
function f(x: string): string;
function f(x: number): number;
function f(x: string | number): string | number {
  return x;   // ✅ 实现签名兼容所有重载
}
// ❌ 错误：function f(x: boolean): boolean  实现签名没包含 boolean
\`\`\`

### 四、重载 vs 联合返回值：怎么选

| 场景 | 选什么 |
| --- | --- |
| 不同参数 → 不同返回类型 | **重载**（调用方拿到精确类型） |
| 同样参数 → 多种返回可能 | **联合类型**（用类型守卫收窄） |
| 不同参数个数 | **可选参数 / 默认参数**（比重载简单） |

> 💡 重载的本质是"用多份签名描述同一个函数的不同调用形态"。能用可选参数解决就别上重载。

下面 demo 演示一个根据输入类型返回不同类型数组的重载函数。`,
    code: `// ===== TypeScript 函数重载 demo =====

// 1) 重载签名（对外暴露的两种调用方式）
function toArr(x: string): string[];       // 传 string → 返回 string[]
function toArr(x: number): number[];       // 传 number → 返回 number[]

// 2) 实现签名（函数体的真实类型，对外不可见）
//    参数必须是所有重载的"超集"，返回值是所有重载返回值的联合
function toArr(x: string | number): string[] | number[] {
  if (typeof x === "string") {
    return x.split("");        // 字符串拆成字符数组
  }
  return x.toString().split("").map(Number);  // 数字拆成数字数组
}

// 3) 调用：TS 会根据传入类型选择匹配的重载签名
const r1 = toArr("abc");       // 类型精确为 string[]
console.log("字符串重载:", r1);          // ['a', 'b', 'c']
console.log("可以直接用 string 方法:", r1.map(s => s.toUpperCase()));

const r2 = toArr(123);         // 类型精确为 number[]
console.log("数字重载:", r2);            // [1, 2, 3]
console.log("可以直接用 number 方法:", r2.map(n => n * 10));

// 4) 一个更实用的例子：日期解析重载
function parseDate(input: Date): number;        // 传 Date → 时间戳
function parseDate(input: string): number;       // 传 字符串 → 时间戳
function parseDate(input: Date | string): number {
  // 实现签名兼容两种重载
  return input instanceof Date ? input.getTime() : new Date(input).getTime();
}
console.log("重载-Date:", parseDate(new Date("2026-01-01")));
console.log("重载-string:", parseDate("2026-01-01"));

// 5) 重载顺序：更具体的签名要放在前面
function format(x: string | number): string;
function format(x: number): string;
function format(x: string | number): string {
  return typeof x === "number" ? \`数字:\${x}\` : \`字符串:\${x}\`;
}
console.log("重载顺序:", format("abc"));
console.log("重载顺序:", format(42));

// 6) 重载与可选参数的对比
// 用重载：调用方知道传 1 个参数返回 string，传 2 个返回 string[]
function repeat(s: string): string;
function repeat(s: string, n: number): string[];
function repeat(s: string, n?: number): string | string[] {
  if (n === undefined) return s;       // 不传 n → 返回原字符串
  return Array(n).fill(s);             // 传 n → 返回数组
}
console.log("重载-单参:", repeat("hi"));
console.log("重载-双参:", repeat("hi", 3));

// 7) 实现签名对外不可见：下面这行会报错（取消注释看效果）
// const wrong = toArr(true as any);  // 实现签名不接受 boolean`,
  },

  // ============================================================
  // 第三章：this 类型
  // ============================================================
  {
    id: "tsbook-this-type",
    title: "this 类型",
    icon: "👉",
    group: "函数与接口",
    content: `## this 类型：让"动态的 this"也类型安全

JS 的 \`this\` 是出了名的难懂——它指向谁**取决于怎么调用**，而不是怎么定义。TS 提供 \`this\` 类型注解，让你在写代码时就知道 \`this\` 是什么。

### 一、为什么需要 this 类型

\`\`\`ts
// ❌ 没标 this 类型：this 隐式 any，访问属性不报错也不提示
const box = {
  width: 100,
  grow() {
    this.width += 10;   // this 是什么？IDE 不一定知道
    return this;
  }
};

// 危险：用解构后调用，this 丢失，运行时 this.width 报错
const { grow } = box;
grow();   // 运行时崩溃：Cannot read property 'width' of undefined
\`\`\`

**核心痛点**：JS 的 \`this\` 在"被解构赋值"、"作为回调传递"时会丢失绑定，TS 的 \`this\` 类型注解能在编译期就发现这类问题。

### 二、this 参数注解

TS 允许在参数列表第一个位置写 \`this\` 注解——**这个参数不会真的传，只用于类型检查**：

\`\`\`ts
interface Box {
  width: number;
  grow(this: Box): void;   // this 必须是 Box 类型
}

const box: Box = {
  width: 100,
  grow() { this.width += 10; }   // ✅ this 一定是 Box
};
\`\`\`

加上 \`this: Box\` 后，TS 会检查"调用时 \`this\` 是不是 \`Box\`"：

\`\`\`ts
box.grow();          // ✅ this 是 Box
const { grow } = box;
grow();              // ❌ 报错：this 是 undefined，不是 Box
\`\`\`

### 三、普通函数 vs 箭头函数的 this ⭐

这是 JS 的经典坑：

| 函数类型 | this 由什么决定 |
| --- | --- |
| 普通函数 \`function f(){}\` | **调用时**的 \`obj.f()\` 决定（动态） |
| 箭头函数 \`() => {}\` | **定义时**的外层 \`this\`（静态，捕获） |

\`\`\`ts
class Counter {
  count = 0;

  // 普通方法：this 动态绑定，被解构会丢
  increment() { this.count++; }

  // 箭头函数属性：this 静态捕获，永远指向实例
  decrement = () => { this.count--; };
}

const c = new Counter();
const { decrement } = c;
decrement();   // ✅ 箭头函数 this 仍是 c
\`\`\`

> 💡 React 函数组件里 \`onClick={this.handleClick}\` 必须用箭头函数或在构造函数里 \`bind\`，就是这个原因。

### 四、ThisType<T> 工具类型

当 \`this\` 是"对象字面量"时，用 \`ThisType<T>\` 标注：

\`\`\`ts
interface Logger {
  log(msg: string): void;
}

// ThisType<Logger> 告诉 TS：这个对象里的 this 是 Logger
const logger: Logger & ThisType<Logger> = {
  log(msg) {
    console.log(msg);
    this.log("再打一条");   // ✅ this 是 Logger
  }
};
\`\`\`

> \`ThisType\` 主要用于 Vue / Option API 这种"对象字面量 + this 自动绑定"的场景。

下面 demo 演示 this 类型注解、箭头函数 this 捕获、ThisType 的用法。`,
    code: `// ===== TypeScript this 类型 demo =====

// 1) this 参数注解：让方法在编译期就检查 this 绑定
interface Counter {
  count: number;
  increment(this: Counter): void;   // this 必须是 Counter
  value(this: Counter): number;
}

const counter: Counter = {
  count: 0,
  increment() {
    this.count++;   // ✅ this 一定是 Counter，IDE 有补全
  },
  value() {
    return this.count;
  }
};

counter.increment();
counter.increment();
counter.increment();
console.log("this 注解-计数:", counter.value());

// 2) 解构调用：this 类型注解能阻止错误（这里用 bind 修复）
const { increment } = counter;
// increment();  // ❌ 编译报错：this 是 undefined，不是 Counter
// 修复：用 bind 显式绑定 this
const bound = increment.bind(counter);
bound();
console.log("bind 修复后:", counter.value());

// 3) 普通函数 vs 箭头函数的 this 差异
class Timer {
  seconds = 0;

  // 普通方法：this 动态绑定，被解构会丢
  tickRegular() {
    this.seconds++;
    console.log("普通方法:", this.seconds);
  }

  // 箭头函数属性：this 静态捕获，永远指向实例
  tickArrow = () => {
    this.seconds++;
    console.log("箭头方法:", this.seconds);
  };
}

const t = new Timer();
// 模拟回调场景：把方法单独传出去调用
const { tickArrow } = t;
tickArrow();   // ✅ 箭头函数 this 仍是 t
console.log("最终 seconds:", t.seconds);

// 4) ThisType<T>：对象字面量里的 this 类型
interface LoggerApi {
  prefix: string;
  log(msg: string): void;
}

// 用 ThisType<LoggerApi> 标注对象字面量的 this
const makeLogger = function (): LoggerApi & ThisType<LoggerApi> {
  return {
    prefix: "[APP]",
    log(msg) {
      // 这里的 this 是 LoggerApi，可以访问 prefix
      console.log(\`\${this.prefix} \${msg}\`);
    }
  };
};

const logger = makeLogger();
logger.log("服务启动");
logger.log("请求到达");

// 5) 链式调用：this 类型返回当前实例（多态 this）
class StringBuilder {
  private parts: string[] = [];

  // 返回 this 类型，支持链式调用，子类也能正确链
  append(s: string): this {
    this.parts.push(s);
    return this;   // 返回 this 而不是 StringBuilder，子类链式更准
  }

  toString(): string {
    return this.parts.join("");
  }
}

const sb = new StringBuilder()
  .append("Hello")
  .append(", ")
  .append("TypeScript!");
console.log("链式调用:", sb.toString());`,
  },

  // ============================================================
  // 第四章：可选、只读与可索引
  // ============================================================
  {
    id: "tsbook-optional-readonly",
    title: "可选、只读与可索引",
    icon: "🔒",
    group: "函数与接口",
    content: `## 可选、只读与可索引：修饰对象属性的三大武器

这一章讲三个最常见的属性修饰符：\`?\` 让属性可缺、\`readonly\` 让属性不可改、索引签名让对象能"动态加键"。

### 一、可选属性 \`?\`

\`\`\`ts
interface User {
  name: string;
  age?: number;        // age 可有可无
  phone?: string;
}

const u1: User = { name: "Tom" };                // ✅ 不写 age 也行
const u2: User = { name: "Tom", age: 20 };       // ✅ 写了也行
\`\`\`

> ⚠️ 可选属性的类型实际是 \`number | undefined\`，**访问时必须先判空**，否则后续操作可能崩。

### 二、只读属性 \`readonly\`

\`\`\`ts
interface Point {
  readonly x: number;   // 只能在创建时赋值
  readonly y: number;
}

const p: Point = { x: 1, y: 2 };
p.x = 10;   // ❌ 报错：无法分配到 readonly 属性
\`\`\`

> \`readonly\` 是**编译期检查**，运行时不阻止（用 \`as\` 断言能绕过）。它的意义是"约定 + 类型保护"。

### 三、readonly vs const 对比 ⭐

| 维度 | \`const\` | \`readonly\` |
| --- | --- | --- |
| 作用对象 | 变量（绑定） | 对象属性 |
| 限制内容 | 不能重新赋值 | 不能修改该属性 |
| 内部可变？ | ✅ 对象内部可改 | ❌ 该属性不可改 |
| 典型场景 | 不可重新指向的引用 | 不可修改的字段 |

\`\`\`ts
const arr = [1, 2, 3];
arr.push(4);     // ✅ const 不阻止内部修改
arr = [5];       // ❌ const 阻止重新赋值

const roArr: readonly number[] = [1, 2, 3];
roArr.push(4);   // ❌ readonly 阻止内部修改
\`\`\`

> 一句话：\`const\` 锁的是"变量指向"，\`readonly\` 锁的是"对象内容"。

### 四、只读数组与元组

\`\`\`ts
// 只读数组：不能 push / pop / 修改元素
let arr: readonly number[] = [1, 2, 3];
let arr2: ReadonlyArray<number> = [1, 2, 3];   // 等价写法

// 只读元组
let tuple: readonly [string, number] = ["Tom", 20];
\`\`\`

> ⭐ **函数参数**尽量用 \`readonly number[]\` 而不是 \`number[]\`——告诉调用方"我不会改你的数组"，更安全。

### 五、索引签名：动态键的对象

当对象的键"不固定"时，用索引签名：

\`\`\`ts
interface StringMap {
  [key: string]: string;   // 任意 string 键 → string 值
}

const dict: StringMap = {
  hello: "你好",
  world: "世界",
  // 任意键都行
};
\`\`\`

索引签名有两类：
- \`[key: string]: T\` —— 键被强制转为 string（JS 对象的本质）
- \`[key: number]: T\` —— 数字键（实际还是字符串键）

> ⚠️ 索引签名会让"已知属性"也必须满足签名类型，比如：

\`\`\`ts
interface Bad {
  [key: string]: string;
  count: number;   // ❌ 报错：number 不能赋给 string
}
\`\`\`

### 六、深只读：Readonly<T>

\`readonly\` 只锁一层。要"深只读"用工具类型 \`Readonly<T>\`：

\`\`\`ts
interface Config {
  server: { host: string; port: number };
}

// 普通对象：内层可改
const c: Config = { server: { host: "localhost", port: 3000 } };
c.server.port = 8080;   // ✅ 没问题

// 深只读（Readonly 只锁一层，要深只读得递归）
const rc: Readonly<Config> = { server: { host: "localhost", port: 3000 } };
// rc.server = { ... };    // ❌ 外层只读
// rc.server.port = 8080;  // ⚠️ 内层仍可改（Readonly 不递归）
\`\`\`

> 💡 真正的深只读要自己写 \`DeepReadonly<T>\` 递归类型，下一阶段"类型体操"会讲。

下面 demo 把这些修饰符都用一遍。`,
    code: `// ===== 可选、只读与可索引 demo =====

// 1) 可选属性：?
interface User {
  name: string;
  age?: number;        // 可选：可有可无
  phone?: string;
}

const u1: User = { name: "Tom" };             // ✅ 不写 age/phone
const u2: User = { name: "Tom", age: 20 };   // ✅ 写 age 也行
console.log("可选属性:", u1.name, u1.age ?? "未知");

// 2) 可选属性必须先判空再使用
function getAge(u: User): number {
  // if 不写判空，TS 会报错：u.age 可能是 undefined
  return u.age ?? 0;
}
console.log("判空后:", getAge(u1), getAge(u2));

// 3) 只读属性：readonly
interface Point {
  readonly x: number;
  readonly y: number;
}
const p: Point = { x: 1, y: 2 };
console.log("只读属性:", p.x, p.y);
// p.x = 10;  // ❌ 报错：无法分配到 readonly 属性

// 4) readonly vs const 的区别
const arr = [1, 2, 3];            // const 锁绑定，不锁内容
arr.push(4);                       // ✅ 内容可改
console.log("const 数组:", arr);

const roArr: readonly number[] = [10, 20, 30];   // readonly 锁内容
// roArr.push(40);    // ❌ 报错：readonly 数组不能 push
// roArr[0] = 100;     // ❌ 报错：readonly 数组不能修改元素
console.log("readonly 数组:", roArr);

// 5) ReadonlyArray<T> 等价写法
const roArr2: ReadonlyArray<number> = [100, 200];
console.log("ReadonlyArray:", roArr2);

// 6) 只读元组
const roTuple: readonly [string, number] = ["坐标", 42];
// roTuple[0] = "x";  // ❌ 报错：只读元组不能修改
console.log("只读元组:", roTuple);

// 7) 索引签名：动态键的对象
interface StringDict {
  [key: string]: string;   // 任意 string 键 → string 值
}
const dict: StringDict = {
  hello: "你好",
  world: "世界",
  ts: "TypeScript",
};
console.log("索引签名:", dict.hello, dict["world"]);

// 8) 索引签名 + 已知属性（已知属性也要满足签名）
interface Words {
  [key: string]: string;   // 索引签名
  greeting: string;        // 已知属性：必须也是 string 才行
  count: string;           // 这里改成 string，否则报错
}
const words: Words = { greeting: "hi", count: "10", extra: "ok" };
console.log("索引+已知属性:", words.greeting, words.count, words.extra);

// 9) 同时支持 string 和 number 索引
interface StringArray {
  [index: number]: string;   // 数字索引
  [key: string]: string;       // 字符串索引（必须包含数字索引的类型）
}
const list: StringArray = ["a", "b", "c"];
console.log("数字索引:", list[0], list[1], "字符串索引:", list["0"]);

// 10) Readonly<T> 工具类型：浅只读
interface Config {
  host: string;
  port: number;
  options: { debug: boolean };
}
const rc: Readonly<Config> = {
  host: "localhost",
  port: 3000,
  options: { debug: true },
};
// rc.host = "x";      // ❌ 外层只读，不能改
// rc.port = 8080;     // ❌ 外层只读
rc.options.debug = false;  // ⚠️ 内层仍可改（Readonly 不递归）
console.log("Readonly<T>:", rc.host, rc.port, rc.options.debug);

// 11) 函数参数用 readonly 数组：表达"不改你的数据"
function sum(nums: readonly number[]): number {
  // nums.push(0);  // ❌ 函数内不能改，调用方更放心
  return nums.reduce((a, b) => a + b, 0);
}
console.log("readonly 参数:", sum([1, 2, 3, 4, 5]));`,
  },

  // ============================================================
  // 第五章：interface 与 type 对比
  // ============================================================
  {
    id: "tsbook-interface-vs-type",
    title: "interface 与 type 对比",
    icon: "🆚",
    group: "函数与接口",
    content: `## interface vs type：到底用哪个？

这是 TS 新手最常问的问题。**先给结论：90% 场景两者等价，描述对象形状用 \`interface\`，需要联合/交叉/工具类型用 \`type\`。**

### 一、两者等价的写法

\`\`\`ts
// interface 写法
interface User {
  name: string;
  age: number;
}

// type 写法（完全等价）
type UserT = {
  name: string;
  age: number;
};
\`\`\`

### 二、能力对比表 ⭐

| 能力 | interface | type |
| --- | --- | --- |
| 描述对象形状 | ✅ 首选 | ✅ 可以 |
| 联合类型 \`A \| B\` | ❌ 不支持 | ✅ 首选 |
| 交叉类型 \`A & B\` | ✅ 用 \`extends\` | ✅ 用 \`&\` |
| 元组类型 | ❌ 不支持 | ✅ 支持 |
| 字面量类型 | ❌ 不支持 | ✅ 支持 |
| 条件类型 / 映射类型 | ❌ 不支持 | ✅ 支持 |
| **声明合并**（同名自动合并） | ✅ 自动合并 | ❌ 重复定义报错 |
| 类 \`implements\` | ✅ 推荐 | ✅ 可以 |
| 扩展第三方库类型 | ✅ 首选（合并） | ❌ 不行 |
| 计算属性 / 工具类型 | 一般 | ✅ 灵活 |

### 三、interface 的杀手锏：声明合并

\`\`\`ts
interface Window {
  __DEV__: boolean;   // 给全局 Window 加属性
}
interface Window {
  __VERSION__: string;   // 再次声明会自动合并
}
// 现在 Window 同时拥有 __DEV__ 和 __VERSION__
\`\`\`

这个特性在"给第三方库扩展类型"时非常有用——比如给 \`express\` 的 \`Request\` 加 \`user\` 字段。

### 四、type 的杀手锏：联合 + 工具类型

\`\`\`ts
// 联合类型：interface 永远做不到
type Status = "pending" | "done" | "error";

// 元组类型
type Pair = [string, number];

// 条件类型 / 映射类型
type Nullable<T> = { [K in keyof T]: T[K] | null };
\`\`\`

### 五、扩展语法对比

\`\`\`ts
// interface 用 extends
interface Animal { name: string; }
interface Dog extends Animal { bark(): void; }

// type 用 & 交叉
type AnimalT = { name: string };
type DogT = AnimalT & { bark(): void };
\`\`\`

### 六、何时用 interface、何时用 type ⭐

| 场景 | 推荐 |
| --- | --- |
| 描述对象/类的形状 | \`interface\` |
| 需要联合、交叉、元组、字面量 | \`type\` |
| 给第三方库扩展类型 | \`interface\`（合并） |
| 工具类型、条件类型、映射类型 | \`type\` |
| 不确定 | 先 \`interface\`，需要联合再换 \`type\` |

> 💡 **实际项目建议**：团队统一一种风格即可。React + TS 项目里 \`type\` 更常见（Props 用联合类型多），后端 / 库开发 \`interface\` 更常见（需要 \`implements\` 和扩展）。

下面 demo 用同一种数据结构（用户 + 文章）分别用 interface 和 type 实现，方便对比。`,
    code: `// ===== interface vs type 对比 demo =====

// ============================================================
// 用 interface 描述"用户 + 文章"数据结构
// ============================================================

// 1) 基础 interface
interface UserI {
  id: number;
  name: string;
  email: string;
}

// 2) interface 用 extends 扩展
interface AdminI extends UserI {
  permissions: string[];
  canDelete(): boolean;
}

// 3) 文章 interface
interface PostI {
  id: number;
  title: string;
  author: UserI;       // 引用其他 interface
}

const adminI: AdminI = {
  id: 1,
  name: "管理员",
  email: "admin@test.com",
  permissions: ["read", "write", "delete"],
  canDelete() { return this.permissions.includes("delete"); }
};
console.log("interface-管理员:", adminI.name, "可删除:", adminI.canDelete());

const postI: PostI = {
  id: 101,
  title: "TS 入门",
  author: { id: 1, name: "管理员", email: "admin@test.com" }
};
console.log("interface-文章:", postI.title, "作者:", postI.author.name);

// ============================================================
// 用 type 描述完全等价的数据结构
// ============================================================

// 1) 基础 type
type UserT = {
  id: number;
  name: string;
  email: string;
};

// 2) type 用 & 交叉扩展
type AdminT = UserT & {
  permissions: string[];
  canDelete(): boolean;
};

// 3) 文章 type
type PostT = {
  id: number;
  title: string;
  author: UserT;
};

const adminT: AdminT = {
  id: 1,
  name: "管理员",
  email: "admin@test.com",
  permissions: ["read", "write", "delete"],
  canDelete() { return this.permissions.includes("delete"); }
};
console.log("type-管理员:", adminT.name, "可删除:", adminT.canDelete());

// ============================================================
// interface 独有能力：声明合并
// ============================================================

interface AppConfig {
  host: string;
  port: number;
}
interface AppConfig {        // 同名 interface 自动合并
  debug: boolean;
  logLevel: "info" | "warn" | "error";
}
const cfg: AppConfig = {
  host: "localhost",
  port: 3000,
  debug: true,
  logLevel: "info"
};
console.log("声明合并:", cfg.host, cfg.port, cfg.debug, cfg.logLevel);

// ============================================================
// type 独有能力：联合类型、元组、工具类型
// ============================================================

// 1) 联合类型（interface 永远做不到）
type Result = { ok: true; data: string } | { ok: false; error: string };
function handle(r: Result) {
  if (r.ok) {
    console.log("联合-成功:", r.data);     // r 收窄为成功分支
  } else {
    console.log("联合-失败:", r.error);    // r 收窄为失败分支
  }
}
handle({ ok: true, data: "hello" });
handle({ ok: false, error: "网络错误" });

// 2) 元组类型
type Point = [x: number, y: number];   // 带标签的元组
const pt: Point = [3, 4];
console.log("元组:", pt[0], pt[1]);

// 3) 字面量类型 + 联合（替代 enum）
type Direction = "up" | "down" | "left" | "right";
function move(d: Direction) {
  console.log("字面量联合-方向:", d);
}
move("up");

// 4) 工具类型：interface 做不到，type 可以
type PartialUser = Partial<UserT>;            // 所有属性可选
type ReadonlyUser = Readonly<UserT>;           // 所有属性只读
type PickUser = Pick<UserT, "id" | "name">;    // 只挑两个字段

const partial: PartialUser = { name: "Tom" };   // ✅ 只写一个字段也行
const readonly: ReadonlyUser = { id: 1, name: "Tom", email: "t@t.com" };
// readonly.id = 2;  // ❌ 只读
const picked: PickUser = { id: 1, name: "Tom" };   // 只要 id 和 name
console.log("工具类型-Partial:", partial);
console.log("工具类型-Readonly:", readonly);
console.log("工具类型-Pick:", picked);

// ============================================================
// 两者都能 implements：class 实现接口
// ============================================================

interface ILogger {
  log(msg: string): void;
}
type ILoggerT = {
  log(msg: string): void;
}

// class 实现 interface
class ConsoleLoggerI implements ILogger {
  log(msg: string) { console.log("interface-implements:", msg); }
}
// class 实现 type
class ConsoleLoggerT implements ILoggerT {
  log(msg: string) { console.log("type-implements:", msg); }
}

new ConsoleLoggerI().log("hello from interface");
new ConsoleLoggerT().log("hello from type");`,
  },
];
