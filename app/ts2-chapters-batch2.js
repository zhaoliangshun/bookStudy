// =============================================================
// TypeScript 进阶教程（ts2）—— 第二批章节（共 6 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. ts2-interface-advanced   — 接口高级用法
//   2. ts2-type-alias-advanced  — 类型别名进阶
//   3. ts2-union-intersection   — 联合与交叉类型深入
//   4. ts2-enum-const            — 枚举与常量模式
//   5. ts2-literal-template      — 字面量与模板字面量类型
//   6. ts2-type-narrowing        — 类型收窄完全指南
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解（文字量是普通教程的 5 倍）
//   code    : 可运行、带详细中文注释的 TypeScript 示例代码
//
// 代码运行环境约束：
//   - 用户写的 TypeScript 先被 typescript 编译器转译为 JS
//     (target ES2020, module CommonJS, 支持装饰器)
//   - 再在 Node.js vm 沙箱中运行，5 秒超时
//   - 仅可 require: fs, path, os, url, crypto, util, events, stream,
//     buffer, querystring, string_decoder, zlib, assert, timers
//   - 全局可用: console, process, Buffer, setTimeout, setInterval,
//     setImmediate, URL, TextEncoder, TextDecoder, Promise,
//     __dirname, __filename, require, module, exports
//   - 类型注解/interface/type/enum/泛型/装饰器都可用(转译器处理)
//   - 类型错误不会阻止运行(教程侧重运行结果)
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：接口高级用法
  // =========================================================
  {
    id: "ts2-interface-advanced",
    title: "接口高级用法",
    icon: "🔌",
    group: "类型系统核心",
    content: `## 接口高级用法

在 TypeScript 中，**接口（Interface）** 是最核心的类型定义工具之一。它不仅是"描述对象形状"的契约，更是一个功能强大、用法灵活的类型系统基石。本章将深入探讨接口的高级用法，包括与 type 的对比、声明合并、接口继承、混合类型、函数接口、implements 关键字以及泛型接口等。

### interface vs type：核心区别

很多初学者都会问：**interface 和 type 到底有什么区别？什么时候用哪个？** 这是一个非常关键的问题，我们逐一分析两者的根本差异。

#### 声明合并（Declaration Merging）

这是 interface 与 type 最本质的区别。**interface 支持声明合并，type 不支持。**

\`\`\`ts
// interface 可以多次声明同名接口，TypeScript 会自动合并
interface User {
  name: string;
}
interface User {
  age: number;
}
// 最终 User 接口同时拥有 name 和 age 两个属性
const user: User = { name: "张三", age: 25 }; // ✅ 合法

// type 则不行，同名 type 会报错
type Product = { name: string };
// type Product = { price: number }; // ❌ 报错：Duplicate identifier
\`\`\`

声明合并是 TypeScript 编译器的一个核心特性，它的工作原理是：编译器在同一个声明空间（declaration space）中遇到相同名字的接口声明时，会将它们的成员**合并**成一个接口。如果成员类型冲突（比如同名属性类型不同），则会报错。

声明合并最典型的应用场景是**为第三方库扩充类型**。比如，你想给 Express 的 Request 对象扩展一个自定义属性：

\`\`\`ts
// 全局扩展 Express 的 Request 接口
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: string };
    }
  }
}
// 现在所有路由处理函数中的 req.user 都有类型提示了
\`\`\`

#### 扩展方式（Extending）

interface 使用 \`extends\` 关键字实现继承，type 使用 \`&\` 交叉运算符实现组合。两者在大多数情况下可以达到相同的效果，但在处理冲突时有细微差别：

\`\`\`ts
// interface 继承：如果同名属性类型冲突，编译器会报错
interface A { x: string; }
// interface B extends A { x: number; } // ❌ 报错：类型不兼容

// type 交叉：冲突的属性会被解析为 never 类型
type C = { x: string; };
type D = { x: number; };
type E = C & D; // E 的 x 属性类型为 string & number，即 never（无法赋值）
\`\`\`

#### 可表达的类型范围

type 可以表达的类型范围比 interface 更广。interface 只能描述**对象类型**（包括函数签名），而 type 可以表达：

- 联合类型：\`type Status = "active" | "inactive"\`
- 交叉类型：\`type Combined = A & B\`
- 元组类型：\`type Point = [number, number]\`
- 基本类型的别名：\`type Name = string\`
- 映射类型：\`type Readonly<T> = { readonly [K in keyof T]: T[K] }\`
- 条件类型：\`type IsString<T> = T extends string ? true : false\`

因此，**当你需要联合类型、元组、映射类型等非对象类型时，只能用 type**。

#### 性能差异

在编译性能方面，interface 通常比 type 略快，因为：
1. interface 创建的是命名类型，可以被缓存和复用
2. type 中的交叉类型需要编译器展开计算
3. interface 的声明合并是在简单合并成员，而复杂的交叉类型需要递归展平

不过在实际项目中，这种性能差异极小，通常不需要作为选择依据。

#### 选择建议：何时用 interface？何时用 type？

**优先使用 interface 的场景：**
- 定义对象的形状（API 返回数据、组件 props 等）
- 需要被其他接口继承的场景
- 需要声明合并的场景（如扩展第三方库类型）
- 定义一个类的公共接口

**优先使用 type 的场景：**
- 需要联合类型或交叉类型
- 需要元组类型
- 需要映射类型或条件类型
- 定义函数签名（虽然 interface 也能做，但 type 更简洁）
- 定义基本类型的别名

一个广为流传的实践准则是：**默认使用 interface，当 interface 无法满足需求时再使用 type**。

### 接口继承（extends）

interface 支持通过 \`extends\` 关键字继承其他接口，可以同时继承多个接口：

\`\`\`ts
interface Shape {
  color: string;
}

interface PenStroke {
  penWidth: number;
}

// 同时继承多个接口
interface Square extends Shape, PenStroke {
  sideLength: number;
}

// Square 现在拥有 color、penWidth、sideLength 三个属性
const square: Square = {
  color: "blue",
  penWidth: 2,
  sideLength: 10,
};
\`\`\`

接口继承还支持**覆盖父接口的属性类型**，但只能将类型收窄（更具体），不能放宽（更宽泛）：

\`\`\`ts
interface Animal {
  name: string;
}

interface Dog extends Animal {
  name: "旺财" | "大黄" | "小黑"; // ✅ 收窄为字面量联合类型，合法
  breed: string;
}
\`\`\`

### 混合类型（Hybrid Types）

在 JavaScript 中，函数也是对象，可以为函数附加属性。TypeScript 的 interface 支持描述这种"既可作为函数调用，又可作为对象访问属性"的类型：

\`\`\`ts
// 定义一个计数器接口，它本身是可调用的，同时有 interval 属性和 reset 方法
interface Counter {
  (start: number): string;       // 调用签名
  interval: number;               // 属性
  reset(): void;                  // 方法
}

// 实现这个混合类型
function createCounter(): Counter {
  const counter = function (start: number) {
    return "计数从 " + start + " 开始";
  } as Counter;
  counter.interval = 5;
  counter.reset = function () {
    console.log("计数器已重置");
  };
  return counter;
}

const c = createCounter();
console.log(c(10));    // 作为函数调用
console.log(c.interval); // 访问属性
c.reset();             // 调用方法
\`\`\`

这种模式在第三方库中很常见，比如 jQuery 的 \`$\` 既是函数又有很多属性方法。

### 函数接口

除了用 type 定义函数签名，interface 也可以用来描述函数的类型：

\`\`\`ts
// 用 interface 描述函数类型
interface SearchFunc {
  (source: string, subString: string): boolean;
}

// 实现该接口的函数
const mySearch: SearchFunc = function (source: string, subString: string): boolean {
  return source.includes(subString);
};
\`\`\`

interface 的函数签名写法比 type 更加灵活，你可以在同一个 interface 中定义**多个重载签名**：

\`\`\`ts
interface OverloadedFunc {
  (x: number): number;
  (x: string): string;
  (x: number, y: number): number;
}

const fn: OverloadedFunc = (x: number | string, y?: number): any => {
  if (typeof x === "number" && typeof y === "number") return x + y;
  if (typeof x === "number") return x * 2;
  return x.toUpperCase();
};
\`\`\`

### implements 关键字

TypeScript 的 class 可以使用 \`implements\` 关键字来强制实现某个接口的约束。与 \`extends\` 继承不同，\`implements\` 表示"实现契约"——类必须按照接口的定义来提供属性和方法：

\`\`\`ts
interface ClockInterface {
  currentTime: Date;
  setTime(d: Date): void;
}

class Clock implements ClockInterface {
  currentTime: Date = new Date();

  setTime(d: Date): void {
    this.currentTime = d;
  }

  // 类可以有自己的额外方法，接口并不限制
  getTime(): string {
    return this.currentTime.toISOString();
  }
}
\`\`\`

一个类可以实现**多个接口**：

\`\`\`ts
interface Runnable { run(): void; }
interface Stoppable { stop(): void; }

class Engine implements Runnable, Stoppable {
  run() { console.log("引擎启动"); }
  stop() { console.log("引擎停止"); }
}
\`\`\`

**implements 只检查类的实例部分**，不检查静态部分（构造函数、静态属性）。如果你需要检查类的静态部分，需要单独定义构造器签名接口。

### 泛型接口

接口也可以接受泛型参数，让接口更加灵活和可复用：

\`\`\`ts
interface Repository<T> {
  getById(id: number): T;
  getAll(): T[];
  create(item: T): T;
  update(id: number, item: Partial<T>): T;
  delete(id: number): boolean;
}

// 使用泛型接口定义用户仓库
interface User {
  id: number;
  name: string;
  email: string;
}

const userRepo: Repository<User> = {
  getById(id: number) {
    return { id, name: "张三", email: "zhangsan@example.com" };
  },
  getAll() {
    return [{ id: 1, name: "张三", email: "zhangsan@example.com" }];
  },
  create(item) { return item; },
  update(id, item) {
    return { id, name: "李四", email: "lisi@example.com", ...item };
  },
  delete(id) { return true; },
};
\`\`\`

泛型接口在大型项目中非常有用，特别是当你有多个实体需要相同的 CRUD 操作模式时，定义一个泛型接口可以极大减少重复代码。

### 接口的索引签名（Index Signature）

当你不知道对象的具体属性名，但知道属性值的类型时，可以使用索引签名：

\`\`\`ts
interface StringDictionary {
  [key: string]: string;  // 任意字符串属性名，值必须是 string
}

const dict: StringDictionary = {
  hello: "你好",
  world: "世界",
  // num: 123, // ❌ 值必须是 string
};
\`\`\`

索引签名有两种：\`[key: string]\` 和 \`[key: number]\`。当同时存在时，数字索引的返回值类型必须是字符串索引返回值类型的子类型，因为 JavaScript 在访问对象时会将数字索引转为字符串。

### 只读属性与可选属性

interface 支持 \`readonly\` 修饰符和 \`?\` 可选标记：

\`\`\`ts
interface Config {
  readonly apiUrl: string;      // 只读，初始化后不能修改
  timeout?: number;              // 可选，可以有也可以没有
  retryCount?: number;
}

const config: Config = { apiUrl: "https://api.example.com" };
// config.apiUrl = "new-url"; // ❌ 只读属性不能赋值
\`\`\`

### 本节代码演示

下面的代码演示了接口高级用法的多个方面：声明合并、继承、混合类型、函数接口、implements、泛型接口和索引签名。你可以运行代码观察结果，并自由修改实验。`,

    code: `// ============================================================
// 第一章代码演示：接口高级用法全景
// ============================================================

// ---- 1. 声明合并 ----
// 同名接口会自动合并成员
interface MergeDemo {
  name: string;
}
interface MergeDemo {
  age: number;
}
// 现在 MergeDemo 同时有 name 和 age
const merged: MergeDemo = { name: "小明", age: 20 };

console.log("========== 1. 声明合并 ==========");
console.log("合并后的对象:", JSON.stringify(merged));

// ---- 2. 接口继承 ----
interface Animal {
  species: string;
  makeSound(): string;
}

interface Pet extends Animal {
  name: string;
  owner: string;
}

const myDog: Pet = {
  species: "狗",
  name: "旺财",
  owner: "张三",
  makeSound() {
    return this.name + "汪汪叫！";
  },
};

console.log("\\n========== 2. 接口继承 ==========");
console.log("物种:", myDog.species);
console.log("名字:", myDog.name);
console.log("主人:", myDog.owner);
console.log("叫声:", myDog.makeSound());

// 多继承
interface Flyable {
  fly(): string;
}
interface Swimmable {
  swim(): string;
}
interface Duck extends Flyable, Swimmable {
  name: string;
}

const duck: Duck = {
  name: "唐老鸭",
  fly() { return this.name + "在空中飞"; },
  swim() { return this.name + "在水里游"; },
};

console.log("\\n多继承示例:");
console.log(duck.fly());
console.log(duck.swim());

// ---- 3. 混合类型（函数 + 属性） ----
interface Calculator {
  (a: number, b: number): number;
  operationName: string;
  version: string;
}

function createCalculator(): Calculator {
  const calc = function (a: number, b: number): number {
    return a + b;
  } as Calculator;
  calc.operationName = "加法";
  calc.version = "1.0.0";
  return calc;
}

const calc = createCalculator();
console.log("\\n========== 3. 混合类型 ==========");
console.log("计算结果:", calc(10, 20));
console.log("操作名称:", calc.operationName);
console.log("版本号:", calc.version);

// ---- 4. 函数接口 ----
interface GreetingFunction {
  (name: string, greeting?: string): string;
}

const sayHello: GreetingFunction = (name, greeting = "你好") => {
  return greeting + "，" + name + "！";
};

console.log("\\n========== 4. 函数接口 ==========");
console.log(sayHello("李四"));
console.log(sayHello("王五", "早上好"));

// ---- 5. implements 关键字 ----
interface Printable {
  content: string;
  print(): string;
}

interface Shareable {
  share(platform: string): string;
}

class Document implements Printable, Shareable {
  content: string;

  constructor(title: string, body: string) {
    this.content = "【" + title + "】" + body;
  }

  print(): string {
    return "打印内容: " + this.content;
  }

  share(platform: string): string {
    return "分享到 " + platform + ": " + this.content;
  }
}

console.log("\\n========== 5. implements 关键字 ==========");
const doc = new Document("会议纪要", "讨论了下季度计划");
console.log(doc.print());
console.log(doc.share("微信"));
console.log(doc.share("邮件"));

// ---- 6. 泛型接口 ----
interface Pair<K, V> {
  key: K;
  value: V;
  getKey(): K;
  getValue(): V;
}

const pair: Pair<string, number> = {
  key: "age",
  value: 25,
  getKey() { return this.key; },
  getValue() { return this.value; },
};

console.log("\\n========== 6. 泛型接口 ==========");
console.log("Key:", pair.getKey());
console.log("Value:", pair.getValue());

// 泛型接口用于数据仓库模式
interface Repository<T> {
  data: T[];
  findById(id: number): T | undefined;
  findAll(): T[];
}

interface User {
  id: number;
  name: string;
  role: string;
}

const userRepo: Repository<User> = {
  data: [
    { id: 1, name: "管理员", role: "admin" },
    { id: 2, name: "编辑", role: "editor" },
    { id: 3, name: "访客", role: "guest" },
  ],
  findById(id: number) {
    return this.data.find((u) => u.id === id);
  },
  findAll() {
    return this.data;
  },
};

const foundUser = userRepo.findById(2);
console.log("\\n查找用户 ID=2:", foundUser ? foundUser.name + " (" + foundUser.role + ")" : "未找到");
console.log("所有用户:", userRepo.findAll().map((u) => u.name).join(", "));

// ---- 7. 索引签名与只读属性 ----
interface ConfigMap {
  readonly appName: string;
  readonly version: string;
  [key: string]: string | number; // 索引签名，允许额外的字符串或数字属性
}

const appConfig: ConfigMap = {
  appName: "MyApp",
  version: "2.0.0",
  author: "开发团队",
  maxUsers: 1000,
  // appName 是只读的，不能修改
};

console.log("\\n========== 7. 索引签名与只读 ==========");
console.log("应用名称:", appConfig.appName);
console.log("版本:", appConfig.version);
console.log("作者:", appConfig.author);
console.log("最大用户数:", appConfig.maxUsers);

console.log("\\n✅ 接口高级用法全部演示完成！");`,
  },

  // =========================================================
  // 第二章：类型别名进阶
  // =========================================================
  {
    id: "ts2-type-alias-advanced",
    title: "类型别名进阶",
    icon: "🏷️",
    group: "类型系统核心",
    content: `## 类型别名进阶

**类型别名（Type Alias）** 是 TypeScript 中另一个重要的类型定义工具。它通过 \`type\` 关键字为任意类型创建一个名字，可以理解为"给类型起绰号"。虽然 interface 和 type 在很多场景下可以互换，但 type 拥有一些 interface 无法替代的独特能力。本章将深入探讨 type 的高级用法，包括与 interface 的深度对比、递归类型、可辨识联合、模板字面量类型、映射类型以及何时优先使用 type。

### type vs interface 深度对比

在上一章中我们已经讨论了 interface 和 type 的基本区别。这里我们做一个更深入、更全面的对比。

#### 1. 表达能力范围

type 的"表达能力"远大于 interface。interface 本质上只能描述"对象的结构"，而 type 是一个通用的类型别名系统，可以描述 TypeScript 中几乎所有的类型：

| 能力 | interface | type |
|------|-----------|------|
| 描述对象形状 | ✅ | ✅ |
| 描述函数签名 | ✅ | ✅ |
| 联合类型 | ❌ | ✅ |
| 交叉类型 | ❌ | ✅ |
| 元组类型 | ❌ | ✅ |
| 基本类型别名 | ❌ | ✅ |
| 映射类型 | ❌ | ✅ |
| 条件类型 | ❌ | ✅ |
| 递归类型 | ❌ | ✅ |
| 声明合并 | ✅ | ❌ |
| 被类实现 | ✅ | ❌（但可通过交叉间接实现） |
| extends 继承 | ✅ | ❌（但可通过交叉实现类似效果） |

#### 2. 错误信息可读性

当类型检查失败时，TypeScript 在错误信息中会显示类型名称。interface 通常显示为接口名称，而 type 的显示取决于类型定义：

\`\`\`ts
interface User { name: string; age: number; }
type Product = { name: string; price: number; };

// 错误信息中会显示 "User" 和 "Product"（对于简单类型别名）
// 但对于复杂的联合/交叉类型，type 的错误信息可能很长很难读
\`\`\`

#### 3. 编辑器中的类型提示

在 VS Code 等编辑器中，当你悬停在变量上时：
- interface 类型通常显示为接口名称
- type 则可能直接展开显示完整的类型定义

对于复杂类型，interface 的"折叠显示"更友好，避免信息过载。

#### 4. 扩展性

interface 可以通过同名声明合并来扩展，这在给第三方库打补丁时非常有用。type 不支持声明合并，但可以通过交叉类型 \`&\` 来组合多个类型。

#### 5. 性能

interface 在 TypeScript 编译器内部是**按名称缓存**的，而 type 别名展开后可能产生大量内联类型计算。在极大规模的类型操作中，interface 可能有微小的性能优势，但对绝大多数项目来说完全可以忽略。

### 递归类型（Recursive Types）

递归类型是 type 相对于 interface 的一个重要优势——你可以定义引用自身的类型结构。这在处理树形结构、嵌套 JSON、链表等场景中非常有用：

\`\`\`ts
// 用 type 定义树形节点（递归类型）
type TreeNode = {
  value: string;
  children?: TreeNode[];  // 引用自身
};

// 等价地，interface 需要更复杂的写法
interface TreeNodeInterface {
  value: string;
  children?: TreeNodeInterface[];
}
\`\`\`

事实上，interface 也支持一定程度的递归（通过引用自身），但在某些复杂场景下（比如递归条件类型），type 是唯一的选项：

\`\`\`ts
// 递归条件类型：将一个嵌套对象的所有属性变为可选
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// 这种递归条件类型只能用 type 实现，interface 做不到
\`\`\`

递归类型的能力非常强大，可以用于实现各种高级类型体操：

\`\`\`ts
// 将嵌套路径展开为联合类型
type NestedPaths<T> = T extends object
  ? { [K in keyof T]: K extends string
      ? T[K] extends object
        ? K | \`\${K}.\${NestedPaths<T[K]>}\`
        : K
      : never
    }[keyof T]
  : never;
\`\`\`

### 可辨识联合（Discriminated Unions）

**可辨识联合（Discriminated Union）** 是 TypeScript 中最强大的类型设计模式之一。它通过一个共同的"判别字段"（discriminant）来区分联合类型中的不同变体（variant），让 TypeScript 的收窄推理精确到每个变体：

\`\`\`ts
// 定义三种形状，每种都有一个 kind 字段作为"判别标签"
type Circle = { kind: "circle"; radius: number };
type Rectangle = { kind: "rectangle"; width: number; height: number };
type Triangle = { kind: "triangle"; base: number; height: number };

// 联合为一个 Shape 类型
type Shape = Circle | Rectangle | Triangle;

// 根据 kind 字段精确计算面积
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;   // shape 被收窄为 Circle
    case "rectangle":
      return shape.width * shape.height;     // shape 被收窄为 Rectangle
    case "triangle":
      return (shape.base * shape.height) / 2; // shape 被收窄为 Triangle
  }
}
\`\`\`

可辨识联合的核心要素：
1. 所有变体类型有一个**共同的字段**（如 \`kind\`）
2. 该字段是**字面量类型**（如 \`"circle"\`、\`"rectangle"\`）
3. 每个变体的该字段值**互不相同**

可辨识联合在 Redux action、状态机、AST 节点等场景中广泛使用，它能提供**完整的类型安全**和**穷尽性检查**。

### 模板字面量类型（Template Literal Types）

TypeScript 4.1 引入的模板字面量类型是 type 独有的能力，interface 无法表达。它允许你像字符串模板一样拼接类型：

\`\`\`ts
type Direction = "top" | "bottom" | "left" | "right";
type Margin = \`margin\${Capitalize<Direction>}\`;
// 展开为: "marginTop" | "marginBottom" | "marginLeft" | "marginRight"

type EventName = "click" | "focus" | "blur";
type HandlerName = \`on\${Capitalize<EventName>}\`;
// 展开为: "onClick" | "onFocus" | "onBlur"
\`\`\`

模板字面量类型配合内置字符串操作类型（\`Uppercase\`、\`Lowercase\`、\`Capitalize\`、\`Uncapitalize\`），可以构建出非常精确的字符串类型约束。

### 映射类型与 type（Mapped Types）

虽然 interface 也可以通过继承来修改属性，但只有 type 能使用**映射类型（Mapped Types）** 来系统性变换一个类型的所有属性：

\`\`\`ts
// 将一个类型的所有属性变为只读
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

// 将一个类型的所有属性变为可选
type Partial<T> = {
  [K in keyof T]?: T[K];
};

// 挑选特定属性
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 条件映射：只保留函数类型的属性
type FunctionProperties<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K];
};
\`\`\`

这些内置的映射类型（\`Partial\`、\`Readonly\`、\`Pick\`、\`Record\`、\`Omit\` 等）是 TypeScript 类型系统的核心工具，它们都基于 type 的映射能力实现。

### 何时优先使用 type 而非 interface

综合以上分析，以下是优先使用 type 的明确场景：

1. **需要联合类型**：如 \`type Status = "success" | "error" | "loading"\`
2. **需要交叉类型**：如 \`type AdminUser = User & { role: "admin" }\`
3. **需要元组类型**：如 \`type Point3D = [number, number, number]\`
4. **需要映射类型**：如 \`type Partial<T> = { [K in keyof T]?: T[K] }\`
5. **需要条件类型**：如 \`type IsArray<T> = T extends any[] ? true : false\`
6. **需要模板字面量类型**：如 \`type EventHandler = \\\`on\\\${Capitalize<string>}\\\`\`
7. **需要递归类型**：虽然 interface 也能做简单递归，但 type 更灵活
8. **定义函数签名**：\`type Fn = (x: number) => string\` 比 interface 更简洁
9. **定义基本类型别名**：如 \`type ID = string | number\`

反之，对于纯粹的对象形状描述，使用 interface 仍然是更好的选择，因为它支持声明合并、继承更直观、编辑器提示更友好。

### 最佳实践总结

一个实用的经验法则：
- **外部 API 的类型定义**：优先使用 interface（易于扩展）
- **组件 Props 类型**：优先使用 interface（继承方便）
- **状态管理中的 action 类型**：使用 type + 可辨识联合
- **工具类型（Utility Types）**：只能用 type
- **简单的数据结构**：interface 和 type 都可以，团队统一即可

### 本节代码演示

下面代码演示了 type 的核心高级用法：递归类型、可辨识联合、模板字面量类型、映射类型和条件类型。`,

    code: `// ============================================================
// 第二章代码演示：类型别名进阶全景
// ============================================================

// ---- 1. 递归类型：树形结构 ----
type TreeNode = {
  label: string;
  children?: TreeNode[];
};

const fileTree: TreeNode = {
  label: "src",
  children: [
    {
      label: "components",
      children: [
        { label: "Header.tsx" },
        { label: "Footer.tsx" },
      ],
    },
    {
      label: "utils",
      children: [
        { label: "helpers.ts" },
        { label: "format.ts" },
      ],
    },
    { label: "index.ts" },
  ],
};

function printTree(node: TreeNode, indent: number = 0): void {
  const prefix = "  ".repeat(indent);
  console.log(prefix + (node.children ? "📁 " : "📄 ") + node.label);
  if (node.children) {
    node.children.forEach((child) => printTree(child, indent + 1));
  }
}

console.log("========== 1. 递归类型：文件树 ==========");
printTree(fileTree);

// ---- 2. 可辨识联合（Discriminated Union） ----
type Circle = { kind: "circle"; radius: number };
type Rectangle = { kind: "rectangle"; width: number; height: number };
type Triangle = { kind: "triangle"; base: number; height: number };
type Shape = Circle | Rectangle | Triangle;

function calculateArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius * shape.radius;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}

function describeShape(shape: Shape): string {
  switch (shape.kind) {
    case "circle":
      return "圆形 (半径: " + shape.radius + ")";
    case "rectangle":
      return "矩形 (" + shape.width + " × " + shape.height + ")";
    case "triangle":
      return "三角形 (底: " + shape.base + ", 高: " + shape.height + ")";
  }
}

console.log("\\n========== 2. 可辨识联合 ==========");
const shapes: Shape[] = [
  { kind: "circle", radius: 5 },
  { kind: "rectangle", width: 4, height: 6 },
  { kind: "triangle", base: 3, height: 4 },
];

shapes.forEach((shape) => {
  console.log(describeShape(shape) + " → 面积: " + calculateArea(shape).toFixed(2));
});

// ---- 3. 可辨识联合用于状态机 ----
type LoadingState = { status: "loading"; progress: number };
type SuccessState = { status: "success"; data: string[] };
type ErrorState = { status: "error"; message: string; code: number };
type RequestState = LoadingState | SuccessState | ErrorState;

function renderState(state: RequestState): string {
  switch (state.status) {
    case "loading":
      return "⏳ 加载中... " + state.progress + "%";
    case "success":
      return "✅ 成功获取 " + state.data.length + " 条数据: " + state.data.join(", ");
    case "error":
      return "❌ 错误 [" + state.code + "]: " + state.message;
  }
}

console.log("\\n========== 3. 状态机模式 ==========");
const states: RequestState[] = [
  { status: "loading", progress: 45 },
  { status: "success", data: ["用户数据", "订单数据", "产品数据"] },
  { status: "error", message: "网络连接超时", code: 500 },
];

states.forEach((s) => console.log(renderState(s)));

// ---- 4. 模板字面量类型应用 ----
// (下面运行时用字符串操作模拟类型级别的能力)
type Direction = "top" | "bottom" | "left" | "right";
// 类型级别：type Margin = \`margin\${Capitalize<Direction>}\`
// 我们运行时代码模拟：

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

console.log("\\n========== 4. 模板字面量类型（运行时模拟） ==========");
const directions: Direction[] = ["top", "bottom", "left", "right"];
const marginProps = directions.map((d) => "margin" + capitalize(d));
console.log("margin 属性:", marginProps.join(", "));

// ---- 5. 交叉类型（Intersection Types） ----
type Timestamped = { createdAt: string; updatedAt: string };
type Identifiable = { id: number };
type SoftDeletable = { deletedAt?: string };

type BaseEntity = Identifiable & Timestamped;
type FullEntity = BaseEntity & SoftDeletable & { name: string };

const entity: FullEntity = {
  id: 1,
  name: "产品A",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-06-15T12:00:00Z",
};

console.log("\\n========== 5. 交叉类型 ==========");
console.log("实体 ID:", entity.id);
console.log("实体名称:", entity.name);
console.log("创建时间:", entity.createdAt);
console.log("更新时间:", entity.updatedAt);
console.log("是否已删除:", entity.deletedAt ?? "否");

// ---- 6. 条件类型 + 类型别名（运行时模拟） ----
type ApiResponse<T> = {
  success: true;
  data: T;
  timestamp: string;
} | {
  success: false;
  error: string;
  code: number;
};

function handleResponse(response: ApiResponse<string[]>): string {
  if (response.success) {
    return "成功: " + response.data.join(", ") + " (时间: " + response.timestamp + ")";
  } else {
    return "失败 [" + response.code + "]: " + response.error;
  }
}

console.log("\\n========== 6. 条件类型应用 ==========");
const successResp: ApiResponse<string[]> = {
  success: true,
  data: ["item1", "item2", "item3"],
  timestamp: new Date().toISOString(),
};
const errorResp: ApiResponse<string[]> = {
  success: false,
  error: "权限不足",
  code: 403,
};

console.log(handleResponse(successResp));
console.log(handleResponse(errorResp));

console.log("\\n✅ 类型别名进阶全部演示完成！");`,
  },

  // =========================================================
  // 第三章：联合与交叉类型深入
  // =========================================================
  {
    id: "ts2-union-intersection",
    title: "联合与交叉类型深入",
    icon: "🔀",
    group: "类型系统核心",
    content: `## 联合与交叉类型深入

**联合类型（Union Types）** 和**交叉类型（Intersection Types）** 是 TypeScript 类型系统中最强大、最常用的两个类型组合工具。它们分别对应集合论中的"并集"和"交集"概念，是理解 TypeScript 类型系统运作方式的关键。本章将深入探讨两者的原理、用法、组合技巧以及常见陷阱。

### 联合类型：类型的"或"

#### 基本概念

联合类型用竖线 \`|\` 表示，表示一个值可以是**多种类型中的任意一种**。从集合论的角度看，联合类型是这些类型的**并集**：

\`\`\`ts
type StringOrNumber = string | number;
// 这个类型的值可以是 string 或 number

let value: StringOrNumber;
value = "hello";  // ✅ 合法
value = 42;       // ✅ 合法
// value = true;  // ❌ 不合法，boolean 不在联合中
\`\`\`

#### 联合类型的属性访问

当你有一个联合类型的值时，你只能访问**所有成员类型都共有的属性**。这是因为 TypeScript 不知道运行时这个值到底是哪种类型，只能保证访问共有属性是安全的：

\`\`\`ts
type Bird = { fly(): void; layEggs(): void };
type Fish = { swim(): void; layEggs(): void };
type Pet = Bird | Fish;

function getPet(): Pet {
  return Math.random() > 0.5
    ? { fly() {}, layEggs() {} }
    : { swim() {}, layEggs() {} };
}

const pet = getPet();
pet.layEggs();  // ✅ 合法，Bird 和 Fish 都有 layEggs
// pet.fly();   // ❌ 不合法，Fish 没有 fly 方法
// pet.swim();  // ❌ 不合法，Bird 没有 swim 方法
\`\`\`

#### 联合类型的收窄

要访问联合类型中特定成员的方法，必须先进行**类型收窄（Type Narrowing）**。TypeScript 会根据你的检查逻辑自动缩小类型范围：

\`\`\`ts
function interact(pet: Bird | Fish) {
  if ("fly" in pet) {
    pet.fly();  // ✅ pet 被收窄为 Bird
  } else {
    pet.swim(); // ✅ pet 被收窄为 Fish
  }
}
\`\`\`

#### 联合类型的分配律

联合类型在条件类型中遵循**分配律（Distributive Law）**：当条件类型的检查目标是裸类型参数（naked type parameter）时，条件类型会"分发"到联合类型的每个成员上：

\`\`\`ts
type ToArray<T> = T extends any ? T[] : never;
type Result = ToArray<string | number>;
// 展开为: ToArray<string> | ToArray<number>
// 即: string[] | number[]
// 而不是: (string | number)[]
\`\`\`

这个特性非常重要，很多内置工具类型（如 \`Exclude\`、\`Extract\`）都依赖这个行为。

### 可辨识联合（Discriminated Unions）深度剖析

可辨识联合是联合类型的一种特殊模式，我们在上一章已经介绍过。这里深入分析它的工作原理和最佳实践。

#### 判别字段的选择

判别字段（discriminant）应该满足以下条件：
1. 在所有变体中**都存在**
2. 是**字面量类型**（不能是 \`string\` 这种宽泛类型）
3. 每个变体的值**互不相同**

常见的判别字段命名：
- \`type\`、\`kind\`、\`tag\`、\`variant\`、\`status\`
- 在 Redux 中通常用 \`type\`
- 在 AST 节点中通常用 \`kind\` 或 \`type\`

#### 穷尽性检查（Exhaustiveness Checking）

当使用 switch 处理可辨识联合时，TypeScript 可以帮你检查是否覆盖了所有情况。使用 \`never\` 类型作为兜底分支：

\`\`\`ts
function assertNever(x: never): never {
  throw new Error("Unexpected value: " + x);
}

function handleShape(shape: Shape): string {
  switch (shape.kind) {
    case "circle":
      return "圆形";
    case "rectangle":
      return "矩形";
    case "triangle":
      return "三角形";
    default:
      // 如果未来新增了 Shape 变体但没有处理，
      // 这里 shape 会被推断为那个新类型（不是 never），
      // 导致编译错误，从而提醒你更新代码
      return assertNever(shape);
  }
}
\`\`\`

这个 \`assertNever\` 模式是 TypeScript 官方推荐的写法，它利用 TypeScript 的控制流分析能力，确保 switch 语句覆盖了所有可能的变体。

### 交叉类型：类型的"且"

#### 基本概念

交叉类型用 \`&\` 表示，表示一个值**同时满足多个类型的约束**。从集合论的角度看，交叉类型是这些类型的**交集**：

\`\`\`ts
type Person = { name: string; age: number };
type Employee = { employeeId: number; department: string };
type Staff = Person & Employee;

// Staff 类型的对象必须同时拥有 Person 和 Employee 的所有属性
const staff: Staff = {
  name: "张三",
  age: 30,
  employeeId: 1001,
  department: "研发部",
};
\`\`\`

#### 交叉类型的冲突处理

当交叉类型的多个成员中存在同名属性，但类型不同时，TypeScript 会如何处理？答案是：**交叉后的属性类型是各成员属性类型的交集**：

\`\`\`ts
type A = { x: string | number };
type B = { x: number };
type C = A & B;
// C 的 x 属性类型为: (string | number) & number
// 即 number（因为 number 是 string | number 的子集）
\`\`\`

如果类型无法兼容（比如 \`string & number\`），结果就是 \`never\` 类型，意味着该属性**永远无法赋值**：

\`\`\`ts
type X = { value: string };
type Y = { value: number };
type Z = X & Y;
// Z 的 value 属性类型为 string & number，即 never
// 这意味着 Z 类型的对象无法被创建（除非 value 是 never 类型，但 never 没有值）
\`\`\`

#### 交叉类型与函数重载

当交叉类型用于函数类型时，交叉后的结果是**函数重载**：

\`\`\`ts
type Fn1 = (x: string) => string;
type Fn2 = (x: number) => number;
type CombinedFn = Fn1 & Fn2;

// CombinedFn 等价于一个同时接受 string 和 number 的重载函数
const fn: CombinedFn = (x: any): any => {
  if (typeof x === "string") return x.toUpperCase();
  return x * 2;
};
\`\`\`

### 联合与交叉的组合使用

联合和交叉可以组合使用，但需要注意优先级。交叉类型 \`&\` 的优先级高于联合类型 \`|\`（类似于乘除高于加减）：

\`\`\`ts
type A = { a: string };
type B = { b: number };
type C = { c: boolean };

// 交叉优先级高于联合
type Result1 = A & B | C;     // 等价于 (A & B) | C
type Result2 = A | B & C;     // 等价于 A | (B & C)
\`\`\`

#### 联合与交叉的分配律

在 TypeScript 的类型系统中，交叉对联合具有分配律（类似于乘法对加法的分配律）：

\`\`\`ts
type A = { a: string };
type Result = A & (string | number);
// 等价于: (A & string) | (A & number)
// 展开后: (string & { a: string }) | (number & { a: string })
// 最终: string | never = string
\`\`\`

这个特性在类型编程中非常有用，可以帮助你理解复杂类型表达式的展开结果。

### 实际应用场景

#### 场景一：Redux Action 类型

\`\`\`ts
type AddTodoAction = { type: "ADD_TODO"; text: string };
type ToggleTodoAction = { type: "TOGGLE_TODO"; id: number };
type DeleteTodoAction = { type: "DELETE_TODO"; id: number };
type TodoAction = AddTodoAction | ToggleTodoAction | DeleteTodoAction;

function todoReducer(state: any, action: TodoAction) {
  switch (action.type) {
    case "ADD_TODO":
      return [...state, { text: action.text, completed: false }];
    case "TOGGLE_TODO":
      return state.map((todo: any, i: number) =>
        i === action.id ? { ...todo, completed: !todo.completed } : todo
      );
    case "DELETE_TODO":
      return state.filter((_: any, i: number) => i !== action.id);
  }
}
\`\`\`

#### 场景二：API 响应类型

\`\`\`ts
type ApiSuccess<T> = { status: "ok"; data: T; message?: string };
type ApiError = { status: "error"; error: string; code: number };
type ApiResult<T> = ApiSuccess<T> | ApiError;
\`\`\`

#### 场景三：权限系统

\`\`\`ts
type BasicUser = { name: string; email: string } & { role: "user" };
type AdminUser = { name: string; email: string } & { role: "admin"; permissions: string[] };
type AppUser = BasicUser | AdminUser;
\`\`\`

### 常见陷阱与注意事项

1. **联合类型 \`string | number\` 与 \`string & number\` 的混淆**：联合是"或"，交叉是"且"。\`string | number\` 表示可以是字符串或数字，\`string & number\` 表示同时是字符串和数字（即 \`never\`）。

2. **联合类型中的 \`never\` 会被自动过滤**：\`string | never\` 等价于 \`string\`，\`never\` 是联合类型的"零元"。

3. **交叉类型中的 \`unknown\` 是"幺元"**：\`T & unknown\` 等价于 \`T\`，因为 unknown 是顶类型。

4. **对象联合类型不等于属性联合**：\`{ a: string } | { b: number }\` 的对象不一定同时有 a 和 b 属性。

5. **交叉类型中大接口优先**：当用交叉类型组合多个接口时，如果属性冲突，类型更窄的那个会胜出。

### 本节代码演示

下面代码演示了联合类型、交叉类型、可辨识联合、穷尽性检查等核心概念的实际应用。`,

    code: `// ============================================================
// 第三章代码演示：联合与交叉类型深入
// ============================================================

// ---- 1. 联合类型基础 ----
type StringOrNumber = string | number;
type Result = "success" | "error" | "pending";

function processValue(value: StringOrNumber): string {
  // 类型收窄：根据 typeof 判断
  if (typeof value === "string") {
    return "字符串: " + value.toUpperCase();
  } else {
    return "数字: " + (value * 100).toFixed(2);
  }
}

console.log("========== 1. 联合类型基础 ==========");
console.log(processValue("hello"));
console.log(processValue(3.14159));

// ---- 2. 交叉类型 ----
type Person = { name: string; age: number };
type Contact = { email: string; phone: string };
type Address = { city: string; street: string };

// 交叉：对象必须同时拥有所有类型的属性
type Employee = Person & Contact & Address;

const employee: Employee = {
  name: "张三",
  age: 28,
  email: "zhangsan@example.com",
  phone: "13800138000",
  city: "北京",
  street: "长安街100号",
};

console.log("\\n========== 2. 交叉类型 ==========");
console.log("员工: " + employee.name);
console.log("联系方式: " + employee.email + " / " + employee.phone);
console.log("地址: " + employee.city + " " + employee.street);

// ---- 3. 可辨识联合：订单系统 ----
type PendingOrder = {
  status: "pending";
  orderId: number;
  amount: number;
};

type ShippedOrder = {
  status: "shipped";
  orderId: number;
  amount: number;
  trackingNumber: string;
  shippedAt: string;
};

type DeliveredOrder = {
  status: "delivered";
  orderId: number;
  amount: number;
  trackingNumber: string;
  deliveredAt: string;
};

type CancelledOrder = {
  status: "cancelled";
  orderId: number;
  amount: number;
  cancelReason: string;
};

type Order = PendingOrder | ShippedOrder | DeliveredOrder | CancelledOrder;

function processOrder(order: Order): string {
  switch (order.status) {
    case "pending":
      return "订单 #" + order.orderId + " 待处理，金额: ¥" + order.amount;
    case "shipped":
      return "订单 #" + order.orderId + " 已发货 (快递单号: " + order.trackingNumber + ")，发货时间: " + order.shippedAt;
    case "delivered":
      return "订单 #" + order.orderId + " 已签收 (快递单号: " + order.trackingNumber + ")，签收时间: " + order.deliveredAt;
    case "cancelled":
      return "订单 #" + order.orderId + " 已取消，原因: " + order.cancelReason;
  }
}

console.log("\\n========== 3. 可辨识联合：订单系统 ==========");
const orders: Order[] = [
  { status: "pending", orderId: 1001, amount: 299.99 },
  { status: "shipped", orderId: 1002, amount: 599.00, trackingNumber: "SF1234567890", shippedAt: "2025-06-20" },
  { status: "delivered", orderId: 1003, amount: 1299.00, trackingNumber: "YT0987654321", deliveredAt: "2025-06-25" },
  { status: "cancelled", orderId: 1004, amount: 89.00, cancelReason: "用户主动取消" },
];

orders.forEach((order) => console.log(processOrder(order)));

// ---- 4. 穷尽性检查（Exhaustiveness Check） ----
type LogLevel = "debug" | "info" | "warn" | "error";

function assertNever(value: never): never {
  throw new Error("未处理的枚举值: " + value);
}

function getLogPrefix(level: LogLevel): string {
  switch (level) {
    case "debug":
      return "🐛 [DEBUG]";
    case "info":
      return "ℹ️ [INFO]";
    case "warn":
      return "⚠️ [WARN]";
    case "error":
      return "❌ [ERROR]";
    default:
      return assertNever(level); // 如果新增了 LogLevel 值，这里会编译报错
  }
}

console.log("\\n========== 4. 穷尽性检查 ==========");
const logLevels: LogLevel[] = ["debug", "info", "warn", "error"];
logLevels.forEach((level) => {
  console.log(getLogPrefix(level) + " 这是一条" + level + "级别的日志");
});

// ---- 5. 联合与交叉组合：API 响应处理 ----
type ApiMeta = { timestamp: string; requestId: string };

type ApiSuccess<T> = { status: "ok" } & ApiMeta & { data: T };
type ApiFail = { status: "error" } & ApiMeta & { error: string; code: number };
type ApiResult<T> = ApiSuccess<T> | ApiFail;

function handleApiResult<T>(result: ApiResult<T>): string {
  const base = "请求ID: " + result.requestId + " | 时间: " + result.timestamp;
  if (result.status === "ok") {
    const data = result.data as any;
    return "✅ " + base + " | 数据: " + JSON.stringify(data);
  } else {
    return "❌ " + base + " | 错误[" + result.code + "]: " + result.error;
  }
}

console.log("\\n========== 5. 联合与交叉组合 ==========");
const successResult: ApiResult<string[]> = {
  status: "ok",
  timestamp: new Date().toISOString(),
  requestId: "req-001",
  data: ["用户列表", "订单列表", "产品列表"],
};

const failResult: ApiResult<string[]> = {
  status: "error",
  timestamp: new Date().toISOString(),
  requestId: "req-002",
  error: "数据库连接失败",
  code: 503,
};

console.log(handleApiResult(successResult));
console.log(handleApiResult(failResult));

// ---- 6. 联合类型的分配律（运行时演示） ----
// 类型层面：ToArray<string | number> = string[] | number[]
// 运行时我们模拟分发逻辑

function toArray(value: string | number): string[] | number[] {
  if (typeof value === "string") {
    return [value]; // string[]
  }
  return [value]; // number[]
}

console.log("\\n========== 6. 联合类型分配律（运行时模拟） ==========");
const arr1 = toArray("hello");
const arr2 = toArray(42);
console.log("字符串数组:", JSON.stringify(arr1));
console.log("数字数组:", JSON.stringify(arr2));

console.log("\\n✅ 联合与交叉类型深入全部演示完成！");`,
  },

  // =========================================================
  // 第四章：枚举与常量模式
  // =========================================================
  {
    id: "ts2-enum-const",
    title: "枚举与常量模式",
    icon: "🔢",
    group: "类型系统核心",
    content: `## 枚举与常量模式

**枚举（Enum）** 是 TypeScript 少数几个不是 JavaScript 超集的特性之一——它是 TypeScript 在运行时层面真正新增的语法结构。枚举为一组相关的数值赋予友好的名字，让代码更具可读性和可维护性。然而，枚举也是 TypeScript 社区中最有争议的特性之一。本章将全面探讨枚举的各种用法、编译行为、常见陷阱以及替代方案。

### 数值枚举（Numeric Enums）

数值枚举是最基本的枚举形式，成员默认从 0 开始自动递增：

\`\`\`ts
enum Direction {
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right,   // 3
}

console.log(Direction.Up);      // 0
console.log(Direction[0]);      // "Up"  ← 反向映射！
\`\`\`

数值枚举的一个关键特性是**反向映射（Reverse Mapping）**：你可以通过枚举名获取值，也可以通过值获取枚举名。这是因为编译后的 JavaScript 代码会创建一个双向映射对象：

\`\`\`js
// 编译后的 JS（简化版）
var Direction;
(function (Direction) {
  Direction[Direction["Up"] = 0] = "Up";
  Direction[Direction["Down"] = 1] = "Down";
  // ...
})(Direction || (Direction = {}));
\`\`\`

你也可以手动指定起始值，后续成员会自动递增：

\`\`\`ts
enum StatusCode {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  InternalServerError = 500,
}
\`\`\`

### 字符串枚举（String Enums）

字符串枚举的每个成员必须用字符串字面量显式初始化，没有自动递增机制：

\`\`\`ts
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}

console.log(Color.Red);  // "RED"
// console.log(Color["RED"]);  // ❌ 字符串枚举没有反向映射！
\`\`\`

字符串枚举**没有反向映射**，因为字符串枚举的值是字符串，不像数字枚举那样可以从值反向推导名字。字符串枚举在运行时生成的对象只包含从名字到值的映射。

字符串枚举相比数值枚举有几个优势：
1. **可读性更好**：在日志中看到 \`"RED"\` 比看到 \`0\` 更容易理解
2. **避免冲突**：不同枚举的字符串值可以相同，但数字值可能意外冲突
3. **序列化安全**：如果枚举值需要存储到数据库或 JSON 中，字符串更稳定（不会因为顺序调整而改变）

### 常量枚举（Const Enums）

常量枚举用 \`const enum\` 声明，它**不会生成任何运行时代码**——编译器会在编译时将所有枚举引用替换为实际值（内联展开）：

\`\`\`ts
const enum Size {
  Small = 10,
  Medium = 20,
  Large = 30,
}

const mySize = Size.Medium;
// 编译后：const mySize = 20;  ← 直接内联，没有 Size 对象
\`\`\`

常量枚举的优点：
- **零运行时开销**：编译后完全消失，没有任何额外代码
- **更小的打包体积**：没有枚举对象，Tree-shaking 友好

常量枚举的限制：
- **不能反向映射**：因为没有运行时的枚举对象
- **不能动态访问**：\`Size["Medium"]\` 这样的动态访问会报错
- **在 \`--isolatedModules\` 模式下可能有问题**：如果从其他模块导入 const enum，Babel 等工具无法正确处理

### 枚举的陷阱与问题

#### 陷阱一：数值枚举的类型安全问题

数值枚举有一个令人意外的问题：**任何数字都可以赋值给数值枚举类型**：

\`\`\`ts
enum Direction {
  Up = 0,
  Down = 1,
}

let dir: Direction = Direction.Up;
dir = 999;  // ✅ 这居然合法！TypeScript 不会报错
\`\`\`

这是因为 TypeScript 为了向后兼容（早期 JavaScript 代码中大量使用数字魔法值），对数值枚举放宽了类型检查。这是一个容易踩到的坑。

#### 陷阱二：编译产物体积

数值枚举和字符串枚举都会生成额外的 JavaScript 代码。如果枚举很大或很多，编译产物体积会显著增加：

\`\`\`ts
// 这个枚举编译后会生成一个几十行的 IIFE
enum LargeEnum {
  A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z,
}
\`\`\`

#### 陷阱三：const enum 在不同工具中的兼容性

使用 Babel 或 esbuild 等工具时，\`const enum\` 可能无法正确处理，因为这些工具默认不依赖 TypeScript 编译器（tsc），而是独立解析 TypeScript 语法。如果项目使用 Babel 作为转译器，需要特别注意 \`const enum\` 的兼容性。

#### 陷阱四：枚举与联合类型的混淆

枚举的值和枚举的类型是不同的概念：

\`\`\`ts
enum Status {
  Active = "active",
  Inactive = "inactive",
}

// 这里的类型是 Status（枚举类型），不是 "active" | "inactive"
let s: Status = Status.Active;

// 如果你想用字面量联合类型，枚举帮不了你
// 你需要另外定义 type StatusValue = "active" | "inactive"
\`\`\`

### 枚举的替代方案

TypeScript 社区中有相当一部分人主张**完全避免使用枚举**，转而使用以下替代方案：

#### 方案一：字面量联合类型

最简单、最轻量的替代方案，零运行时开销：

\`\`\`ts
// 代替枚举
type Direction = "up" | "down" | "left" | "right";

function move(dir: Direction) {
  // dir 只能是这四个值之一
}
move("up");   // ✅
// move("north"); // ❌
\`\`\`

优点：零运行时开销、类型安全、与 JavaScript 完全兼容
缺点：没有反向映射、不能迭代所有值（除非额外维护数组）

#### 方案二：常量对象（const object）配合 \`as const\`

这是最接近枚举功能但更加安全的替代方案：

\`\`\`ts
const Direction = {
  Up: "UP",
  Down: "DOWN",
  Left: "LEFT",
  Right: "RIGHT",
} as const;

// 提取值类型
type Direction = typeof Direction[keyof typeof Direction];
// 等价于 "UP" | "DOWN" | "LEFT" | "RIGHT"

// 使用
const dir: Direction = Direction.Up;  // "UP"
// 可以遍历所有值
Object.values(Direction).forEach(v => console.log(v));
\`\`\`

优点：
- 零运行时开销（常量对象可能被 Tree-shaking）
- 可以枚举所有值
- 完全的类型安全（不能随便赋值不相关的值）
- 编译结果就是纯 JavaScript 对象，没有魔法

缺点：
- 不能反向映射（但可以通过额外代码实现）
- 语法稍显冗长

#### 方案三：字符串联合类型 + 辅助数组

\`\`\`ts
const DIRECTIONS = ["up", "down", "left", "right"] as const;
type Direction = typeof DIRECTIONS[number];
// 等价于 "up" | "down" | "left" | "right"
\`\`\`

### 何时应该使用枚举？何时应该避免？

**适合使用枚举的场景：**
- 需要反向映射（数字枚举的 \`Enum[value]\`）
- 需要同时作为值和类型使用（TypeScript 枚举本身就同时是值和类型）
- 团队已统一使用枚举，保持一致性
- 枚举值是在运行时计算出来的（如 \`OK = 200\`，\`Created = 201\`）

**应该避免使用枚举的场景：**
- 项目使用 Babel/esbuild 等非 tsc 工具转译（const enum 兼容性问题）
- 在乎打包体积（数值/字符串枚举会生成额外代码）
- 只需要"几个固定值"的约束（字面量联合类型更简单）
- 需要与外部 JSON 或 API 交互（字符串联合类型更自然）
- 团队有"尽量避免非 JS 标准特性"的约定

### 异构枚举（Heterogeneous Enums）

技术上 TypeScript 允许混合字符串和数字成员，但**强烈不推荐**：

\`\`\`ts
// 不推荐！容易造成混淆
enum Mixed {
  No = 0,
  Yes = "YES",
}
\`\`\`

### 计算成员与常量成员

枚举成员可以是常量表达式（编译期确定），也可以是计算表达式：

\`\`\`ts
enum FileAccess {
  None,                    // 常量成员
  Read = 1 << 1,          // 常量成员（编译期可计算）
  Write = 1 << 2,         // 常量成员
  ReadWrite = Read | Write, // 常量成员
  // Computed = getValue(), // 计算成员（需要运行时计算）
}
\`\`\`

注意：如果枚举中有计算成员，后续没有显式初始化的成员会报错。

### 本节代码演示

下面代码演示了数值枚举、字符串枚举、常量枚举、枚举替代方案（常量对象 + as const）、联合类型替代模式等。`,

    code: `// ============================================================
// 第四章代码演示：枚举与常量模式
// ============================================================

// ---- 1. 数值枚举 ----
enum Direction {
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right,   // 3
}

console.log("========== 1. 数值枚举 ==========");
console.log("Direction.Up =", Direction.Up);
console.log("Direction.Down =", Direction.Down);
console.log("Direction.Left =", Direction.Left);
console.log("Direction.Right =", Direction.Right);

// 反向映射：通过值获取名字
console.log("Direction[0] =", Direction[0]);
console.log("Direction[3] =", Direction[3]);

// 遍历枚举
console.log("\\n遍历数值枚举:");
for (let key in Direction) {
  // 数值枚举会同时包含正向和反向映射，过滤掉数字键
  if (isNaN(Number(key))) {
    console.log("  " + key + " = " + Direction[key as keyof typeof Direction]);
  }
}

// ---- 2. 字符串枚举 ----
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Suspended = "SUSPENDED",
  Deleted = "DELETED",
}

console.log("\\n========== 2. 字符串枚举 ==========");
console.log("Status.Active =", Status.Active);
console.log("Status.Inactive =", Status.Inactive);

// 字符串枚举没有反向映射
console.log("尝试反向映射 Status['ACTIVE']:", (Status as any)["ACTIVE"] ?? "undefined（无反向映射）");

// 将字符串枚举用于比较
function canLogin(status: Status): boolean {
  return status === Status.Active;
}
console.log("Active 可以登录?", canLogin(Status.Active));
console.log("Suspended 可以登录?", canLogin(Status.Suspended));

// ---- 3. 常量枚举（const enum）效果模拟 ----
// const enum 在编译时会被内联，运行时没有枚举对象
// 这里我们模拟 const enum 的效果
const SizeSmall = 10;
const SizeMedium = 20;
const SizeLarge = 30;

type Size = 10 | 20 | 30;

console.log("\\n========== 3. 常量枚举（内联效果模拟） ==========");
const mySize: Size = SizeMedium;
console.log("mySize =", mySize);
console.log("编译后 mySize 直接就是", mySize, "，没有枚举对象");

// ---- 4. 枚举替代方案：常量对象 + as const ----
const Colors = {
  Red: "#FF0000",
  Green: "#00FF00",
  Blue: "#0000FF",
  Yellow: "#FFFF00",
  Purple: "#800080",
} as const;

// 提取类型
type Color = typeof Colors[keyof typeof Colors];

console.log("\\n========== 4. 常量对象替代枚举 ==========");
console.log("Colors.Red =", Colors.Red);
console.log("Colors.Green =", Colors.Green);

// 可以遍历所有值
console.log("\\n所有颜色:");
Object.entries(Colors).forEach(([name, hex]) => {
  console.log("  " + name + ": " + hex);
});

// 也可以遍历所有键
const colorNames = Object.keys(Colors);
console.log("\\n颜色名称:", colorNames.join(", "));

// ---- 5. 联合类型替代枚举 ----
type UserRole = "admin" | "editor" | "viewer";

// 辅助数组：用于迭代所有可能的值
const ALL_ROLES: readonly UserRole[] = ["admin", "editor", "viewer"] as const;

function getRolePermissions(role: UserRole): string[] {
  switch (role) {
    case "admin":
      return ["创建", "编辑", "删除", "查看用户"];
    case "editor":
      return ["创建", "编辑"];
    case "viewer":
      return ["查看"];
  }
}

console.log("\\n========== 5. 联合类型替代枚举 ==========");
ALL_ROLES.forEach((role) => {
  console.log(role + " 权限: " + getRolePermissions(role).join(", "));
});

// ---- 6. 枚举实战：HTTP 状态码 ----
enum HttpStatus {
  OK = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
  BadGateway = 502,
  ServiceUnavailable = 503,
}

function getStatusMessage(status: HttpStatus): string {
  const messages: Record<HttpStatus, string> = {
    [HttpStatus.OK]: "请求成功",
    [HttpStatus.Created]: "资源已创建",
    [HttpStatus.NoContent]: "无内容",
    [HttpStatus.BadRequest]: "请求参数错误",
    [HttpStatus.Unauthorized]: "未授权",
    [HttpStatus.Forbidden]: "禁止访问",
    [HttpStatus.NotFound]: "资源未找到",
    [HttpStatus.InternalServerError]: "服务器内部错误",
    [HttpStatus.BadGateway]: "网关错误",
    [HttpStatus.ServiceUnavailable]: "服务不可用",
  };
  return messages[status];
}

console.log("\\n========== 6. HTTP 状态码枚举 ==========");
const statuses = [
  HttpStatus.OK,
  HttpStatus.NotFound,
  HttpStatus.InternalServerError,
  HttpStatus.Created,
];

statuses.forEach((status) => {
  console.log(status + " → " + getStatusMessage(status));
});

// 反向映射功能
console.log("\\n反向映射: HttpStatus[200] =", HttpStatus[200]);
console.log("反向映射: HttpStatus[404] =", HttpStatus[404]);

// ---- 7. 位标志枚举 ----
enum Permission {
  Read = 1 << 0,    // 1
  Write = 1 << 1,   // 2
  Execute = 1 << 2, // 4
  Delete = 1 << 3,  // 8
  Admin = 1 << 4,   // 16
}

function hasPermission(userPerm: number, required: Permission): boolean {
  return (userPerm & required) === required;
}

console.log("\\n========== 7. 位标志枚举 ==========");
const userPermissions = Permission.Read | Permission.Write | Permission.Execute;
console.log("用户权限值:", userPermissions);
console.log("有 Read 权限?", hasPermission(userPermissions, Permission.Read));
console.log("有 Write 权限?", hasPermission(userPermissions, Permission.Write));
console.log("有 Delete 权限?", hasPermission(userPermissions, Permission.Delete));
console.log("有 Admin 权限?", hasPermission(userPermissions, Permission.Admin));

console.log("\\n✅ 枚举与常量模式全部演示完成！");`,
  },

  // =========================================================
  // 第五章：字面量与模板字面量类型
  // =========================================================
  {
    id: "ts2-literal-template",
    title: "字面量与模板字面量类型",
    icon: "📝",
    group: "类型系统核心",
    content: `## 字面量与模板字面量类型

TypeScript 的类型系统不仅包含 \`string\`、\`number\`、\`boolean\` 这样的宽泛类型，还支持**字面量类型（Literal Types）**——将具体的值作为类型。更进一步，TypeScript 4.1 引入了**模板字面量类型（Template Literal Types）**，允许在类型层面进行字符串拼接和变换。这些特性极大地增强了 TypeScript 的表达能力，让你可以构建出极其精确的类型约束。

### 字面量类型基础

#### 什么是字面量类型？

字面量类型就是将**具体的值**作为类型使用。比如 \`"hello"\` 不仅是一个字符串值，也可以是一个类型——它表示"只能是这个具体字符串"：

\`\`\`ts
// 字符串字面量类型
let greeting: "hello" = "hello";
// greeting = "hi";  // ❌ 类型 "hi" 不能赋给类型 "hello"

// 数字字面量类型
let answer: 42 = 42;
// answer = 43;  // ❌

// 布尔字面量类型
let flag: true = true;
// flag = false;  // ❌
\`\`\`

#### 字面量类型的实际价值

单独的字面量类型看起来没什么用——谁会定义一个只能为特定值的变量呢？字面量类型真正的威力在于**与联合类型结合**：

\`\`\`ts
// 用字面量联合类型限制参数的取值范围
type Alignment = "left" | "center" | "right";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

function alignText(text: string, alignment: Alignment): string {
  // alignment 只能是 "left"、"center" 或 "right"
  return text + " (对齐方式: " + alignment + ")";
}

alignText("标题", "center");  // ✅
// alignText("标题", "justify");  // ❌
\`\`\`

这种模式在 TypeScript 中极其常见，用于：
- 组件 props 的限制（如 Button 的 size 属性）
- API 请求方法的限制
- 状态值的限制
- 配置选项的限制

#### 数字字面量类型

数字字面量类型常用于限制取值范围：

\`\`\`ts
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
type HttpStatusSuccess = 200 | 201 | 204;
type Port = 80 | 443 | 3000 | 8080;
type Rating = 1 | 2 | 3 | 4 | 5;

function rollDice(): DiceRoll {
  return Math.ceil(Math.random() * 6) as DiceRoll;
}
\`\`\`

#### 布尔字面量类型

布尔字面量类型 \`true\` 和 \`false\` 在条件类型中非常有用，可以用来表示"是/否"的选择：

\`\`\`ts
// 条件类型中根据布尔字面量分发
type IsString<T> = T extends string ? true : false;
type Result1 = IsString<"hello">;  // true
type Result2 = IsString<42>;       // false
\`\`\`

### 模板字面量类型（Template Literal Types）

TypeScript 4.1 引入的模板字面量类型是字面量类型的"超级加强版"。它允许你像 JavaScript 的模板字符串一样，在类型层面拼接字符串：

\`\`\`ts
type World = "world";
type Greeting = \`hello \${World}\`;
// 类型为: "hello world"
\`\`\`

#### 与联合类型组合

这是模板字面量类型最强大的用法——当插值位置是联合类型时，会产生**笛卡尔积**展开：

\`\`\`ts
type Direction = "top" | "bottom" | "left" | "right";
type CssMargin = \`margin-\${Direction}\`;
// 展开为: "margin-top" | "margin-bottom" | "margin-left" | "margin-right"

type Event = "click" | "focus" | "blur";
type Handler = \`on\${Capitalize<Event>}\`;
// 展开为: "onClick" | "onFocus" | "onBlur"
\`\`\`

当多个插值位置都是联合类型时，会产生所有组合：

\`\`\`ts
type Vertical = "top" | "bottom";
type Horizontal = "left" | "right";
type Corner = \`\${Vertical}-\${Horizontal}\`;
// 展开为: "top-left" | "top-right" | "bottom-left" | "bottom-right"
\`\`\`

#### 与泛型结合

模板字面量类型可以用于构建泛型工具类型：

\`\`\`ts
// 给对象类型的所有属性添加 getter 和 setter 方法名
type Accessors<T> = {
  [K in keyof T & string as \`get\${Capitalize<K>}\`]: () => T[K];
} & {
  [K in keyof T & string as \`set\${Capitalize<K>}\`]: (value: T[K]) => void;
};

interface Person {
  name: string;
  age: number;
}

// Accessors<Person> 的类型为:
// {
//   getName: () => string;
//   setName: (value: string) => void;
//   getAge: () => number;
//   setAge: (value: number) => void;
// }
\`\`\`

### 内置字符串操作类型

TypeScript 提供了四个内置的字符串操作类型，用于在模板字面量中变换字符串：

#### \`Uppercase<StringType>\`

将字符串字面量类型中的所有字符转为大写：

\`\`\`ts
type Shout = Uppercase<"hello">;
// 类型为: "HELLO"
\`\`\`

#### \`Lowercase<StringType>\`

将字符串字面量类型中的所有字符转为小写：

\`\`\`ts
type Whisper = Lowercase<"HELLO">;
// 类型为: "hello"
\`\`\`

#### \`Capitalize<StringType>\`

将字符串字面量类型中的首字母转为大写：

\`\`\`ts
type Proper = Capitalize<"hello">;
// 类型为: "Hello"
\`\`\`

#### \`Uncapitalize<StringType>\`

将字符串字面量类型中的首字母转为小写：

\`\`\`ts
type Unproper = Uncapitalize<"Hello">;
// 类型为: "hello"
\`\`\`

这四个类型在构建事件处理函数名、CSS 属性名、getter/setter 方法名等场景中非常有用。

### 模板字面量类型的高级应用

#### 应用一：类型安全的事件系统

\`\`\`ts
type EventMap = {
  click: { x: number; y: number };
  focus: { element: string };
  input: { value: string };
};

type EventNames = keyof EventMap;
type EventHandler<K extends EventNames> = (event: EventMap[K]) => void;
type ListenerMap = {
  [K in EventNames as \\\`on\\\${Capitalize<K>}\\\`]: EventHandler<K>;
};
\`\`\`

#### 应用二：类型安全的路由系统

\`\`\`ts
type Route = "users" | "products" | "orders";
type RouteWithId = \\\`/\\\${Route}/:id\\\`;
// "/users/:id" | "/products/:id" | "/orders/:id"

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type RouteHandler = \\\`\\\${HttpMethod} \\\${RouteWithId}\\\`;
// "GET /users/:id" | "POST /users/:id" | ... 共 12 种组合
\`\`\`

#### 应用三：CSS 属性类型

\`\`\`ts
type CssUnit = "px" | "em" | "rem" | "%" | "vh" | "vw";
type CssValue = \\\`\\\${number}\\\${CssUnit}\\\`;
// "\${number}px" | "\${number}em" | ...

// 更精确的边距定义
type MarginProp = \\\`margin\\\${"" | \\\`-\\\${"top" | "bottom" | "left" | "right"}\\\`}\\\`;
// "margin" | "margin-top" | "margin-bottom" | "margin-left" | "margin-right"
\`\`\`

#### 应用四：类型安全的字符串格式化

\`\`\`ts
// 检查字符串是否以特定前缀开头
type StartsWith<S extends string, Prefix extends string> =
  S extends \\\`\\\${Prefix}\\\${infer Rest}\\\` ? true : false;

type Test1 = StartsWith<"hello world", "hello">;  // true
type Test2 = StartsWith<"hello world", "world">;  // false
\`\`\`

### 模板字面量类型与递归

模板字面量类型结合递归条件类型可以实现更复杂的字符串操作：

\`\`\`ts
// 将字符串分割为联合类型
type Split<S extends string, Sep extends string> =
  S extends \\\`\\\${infer Head}\\\${Sep}\\\${infer Tail}\\\`
    ? Head | Split<Tail, Sep>
    : S;

type Parts = Split<"a,b,c,d", ",">;
// 类型为: "a" | "b" | "c" | "d"
\`\`\`

### 注意事项与限制

1. **联合类型组合数量爆炸**：当多个插值位置都是大的联合类型时，生成的联合类型可能非常大（笛卡尔积）。如果组合数量超过 TypeScript 的限制（默认约 10 万个），编译器会报错或变得极慢。

2. **模板字面量类型只处理字符串**：不能处理 \`number\`、\`boolean\` 等非字符串类型（除非先转为字符串字面量）。

3. **运行时没有类型信息**：模板字面量类型只在编译期存在，运行时完全消失。运行时字符串操作需要使用 JavaScript 的模板字符串。

4. **与 \`string\` 类型的兼容性**：任何字面量字符串类型都是 \`string\` 的子类型，所以 \`"hello"\` 可以赋值给 \`string\`，但 \`string\` 不能赋值给 \`"hello"\`。

5. **性能考虑**：复杂的模板字面量类型操作（特别是递归的）会显著增加 TypeScript 编译时间，应谨慎使用。

### 本节代码演示

下面代码演示了字面量类型、联合字面量、模板字面量类型（类型层面）以及运行时字符串操作模式。`,

    code: `// ============================================================
// 第五章代码演示：字面量与模板字面量类型
// ============================================================

// ---- 1. 字面量类型基础 ----
type Alignment = "left" | "center" | "right";
type VerticalAlign = "top" | "middle" | "bottom";

function alignText(text: string, h: Alignment, v: VerticalAlign): string {
  const hMap: Record<Alignment, string> = { left: "左", center: "中", right: "右" };
  const vMap: Record<VerticalAlign, string> = { top: "上", middle: "中", bottom: "下" };
  return "文本: " + text + " (水平: " + hMap[h] + ", 垂直: " + vMap[v] + ")";
}

console.log("========== 1. 字面量类型 ==========");
console.log(alignText("标题", "center", "middle"));
console.log(alignText("页脚", "left", "bottom"));
console.log(alignText("按钮", "right", "top"));

// ---- 2. 数字字面量类型 ----
type Rating = 1 | 2 | 3 | 4 | 5;
type HttpStatusSuccess = 200 | 201 | 204;

function getRatingDescription(rating: Rating): string {
  const descriptions: Record<Rating, string> = {
    1: "非常差",
    2: "较差",
    3: "一般",
    4: "较好",
    5: "非常好",
  };
  return rating + " 星 → " + descriptions[rating];
}

console.log("\\n========== 2. 数字字面量类型 ==========");
const ratings: Rating[] = [1, 2, 3, 4, 5];
ratings.forEach((r) => console.log(getRatingDescription(r)));

// ---- 3. 模板字面量类型（运行时模拟） ----
// 类型层面：type Margin = \`margin-\${"top" | "bottom" | "left" | "right"}\`
// 运行时代码用字符串操作模拟

const directions = ["top", "bottom", "left", "right"] as const;
type Direction = typeof directions[number];

// 生成 CSS 属性名
function generateCssProps(prefix: string, suffixes: readonly string[]): string[] {
  return suffixes.map((s) => prefix + "-" + s);
}

console.log("\\n========== 3. 模板字面量（运行时模拟） ==========");
const marginProps = generateCssProps("margin", directions);
const paddingProps = generateCssProps("padding", directions);
console.log("margin 属性:", marginProps.join(", "));
console.log("padding 属性:", paddingProps.join(", "));

// ---- 4. 事件处理函数名模式 ----
type EventName = "click" | "focus" | "blur" | "change" | "submit";
// 类型层面：type Handler = \`on\${Capitalize<EventName>}\`

const eventNames: EventName[] = ["click", "focus", "blur", "change", "submit"];

function toHandlerName(event: EventName): string {
  return "on" + event.charAt(0).toUpperCase() + event.slice(1);
}

console.log("\\n========== 4. 事件处理器命名模式 ==========");
eventNames.forEach((event) => {
  console.log(event + " → " + toHandlerName(event));
});

// ---- 5. 字符串操作类型模拟（Uppercase/Lowercase/Capitalize/Uncapitalize） ----
console.log("\\n========== 5. 字符串操作类型（运行时模拟） ==========");

function simulateUppercase<T extends string>(s: T): Uppercase<T> {
  return s.toUpperCase() as Uppercase<T>;
}

function simulateLowercase<T extends string>(s: T): Lowercase<T> {
  return s.toLowerCase() as Lowercase<T>;
}

function simulateCapitalize<T extends string>(s: T): Capitalize<T> {
  return (s.charAt(0).toUpperCase() + s.slice(1)) as Capitalize<T>;
}

function simulateUncapitalize<T extends string>(s: T): Uncapitalize<T> {
  return (s.charAt(0).toLowerCase() + s.slice(1)) as Uncapitalize<T>;
}

console.log("Uppercase('hello'):", simulateUppercase("hello"));
console.log("Lowercase('HELLO'):", simulateLowercase("HELLO"));
console.log("Capitalize('hello'):", simulateCapitalize("hello"));
console.log("Uncapitalize('Hello'):", simulateUncapitalize("Hello"));

// ---- 6. 类型安全的状态机 ----
type LoadingState = "idle" | "loading" | "success" | "error";
type StateTransition = {
  from: LoadingState;
  to: LoadingState;
  allowed: boolean;
};

const transitions: StateTransition[] = [
  { from: "idle", to: "loading", allowed: true },
  { from: "loading", to: "success", allowed: true },
  { from: "loading", to: "error", allowed: true },
  { from: "success", to: "idle", allowed: true },
  { from: "error", to: "idle", allowed: true },
  { from: "idle", to: "success", allowed: false },
  { from: "success", to: "error", allowed: false },
];

function canTransition(from: LoadingState, to: LoadingState): boolean {
  const rule = transitions.find((t) => t.from === from && t.to === to);
  return rule ? rule.allowed : false;
}

console.log("\\n========== 6. 类型安全的状态转换 ==========");
const states: LoadingState[] = ["idle", "loading", "success", "error"];
states.forEach((from) => {
  states.forEach((to) => {
    if (from !== to) {
      const ok = canTransition(from, to);
      console.log(from + " → " + to + ": " + (ok ? "✅ 允许" : "❌ 禁止"));
    }
  });
});

// ---- 7. 组合多个联合类型（笛卡尔积效果） ----
type Method = "GET" | "POST" | "PUT" | "DELETE";
type Resource = "users" | "products" | "orders";

// 类型层面：所有组合 Method × Resource
// 运行时模拟
const methods: Method[] = ["GET", "POST", "PUT", "DELETE"];
const resources: Resource[] = ["users", "products", "orders"];

console.log("\\n========== 7. 联合类型组合（笛卡尔积） ==========");
console.log("API 端点组合总数: " + (methods.length * resources.length) + " 个");
methods.forEach((method) => {
  resources.forEach((resource) => {
    console.log("  " + method + " /api/" + resource);
  });
});

console.log("\\n✅ 字面量与模板字面量类型全部演示完成！");`,
  },

  // =========================================================
  // 第六章：类型收窄完全指南
  // =========================================================
  {
    id: "ts2-type-narrowing",
    title: "类型收窄完全指南",
    icon: "🔍",
    group: "类型系统核心",
    content: `## 类型收窄完全指南

**类型收窄（Type Narrowing）** 是 TypeScript 类型系统的核心机制之一。它指的是编译器根据代码中的控制流逻辑（如条件判断、类型守卫、赋值等），自动将变量的类型从宽泛的类型"收窄"到更具体的类型。理解类型收窄的工作原理，是写出类型安全、简洁高效的 TypeScript 代码的关键。

### 什么是类型收窄？

假设你有一个联合类型的变量 \`string | number\`，在你使用它之前，TypeScript 只知道它可能是字符串或数字。但如果你先用 \`typeof\` 检查它是字符串，那么在检查通过之后的代码块中，TypeScript 就知道它**一定是字符串**——这就是类型收窄。

\`\`\`ts
function padLeft(value: string | number, padding: number) {
  if (typeof value === "string") {
    // 在这个代码块中，value 的类型被收窄为 string
    return value.padStart(padding);  // ✅ string 的方法
  }
  // 在这个代码块中，value 的类型被收窄为 number
  return value.toFixed(padding);     // ✅ number 的方法
}
\`\`\`

类型收窄不是在运行时发生的——它完全是在**编译期**由 TypeScript 的**控制流分析（Control Flow Analysis）** 引擎完成的。TypeScript 会遍历代码的每一条执行路径，追踪变量在每条路径上的类型变化。

### typeof 收窄

\`typeof\` 是 JavaScript 中最常用的类型检查方式，TypeScript 完全理解它的语义，并能据此收窄类型。TypeScript 对 \`typeof\` 返回值的理解是：

- \`typeof x === "string"\` → 收窄为 \`string\`
- \`typeof x === "number"\` → 收窄为 \`number\`
- \`typeof x === "boolean"\` → 收窄为 \`boolean\`
- \`typeof x === "undefined"\` → 收窄为 \`undefined\`
- \`typeof x === "object"\` → 收窄为 \`object | null\`（注意：null 的 typeof 也是 "object"）
- \`typeof x === "function"\` → 收窄为函数类型
- \`typeof x === "bigint"\` → 收窄为 \`bigint\`
- \`typeof x === "symbol"\` → 收窄为 \`symbol\`

\`\`\`ts
function printValue(value: string | number | boolean | undefined) {
  if (typeof value === "string") {
    console.log("字符串:", value.toUpperCase());
  } else if (typeof value === "number") {
    console.log("数字:", value.toFixed(2));
  } else if (typeof value === "boolean") {
    console.log("布尔:", value ? "是" : "否");
  } else {
    console.log("未定义");
  }
}
\`\`\`

#### 注意事项

\`typeof null\` 在 JavaScript 中返回 \`"object"\`，这是一个历史遗留问题。因此 TypeScript 在 \`typeof x === "object"\` 后会将类型收窄为 \`object | null\` 而不是纯 \`object\`。如果你需要确认变量不是 null，需要额外检查。

### instanceof 收窄

\`instanceof\` 用于检查一个对象是否是某个类的实例。TypeScript 也理解它的语义：

\`\`\`ts
function handleError(error: Error | string) {
  if (error instanceof Error) {
    // 收窄为 Error 类型
    console.log(error.message);
    console.log(error.stack);
  } else {
    // 收窄为 string 类型
    console.log("错误信息: " + error);
  }
}
\`\`\`

\`instanceof\` 收窄适用于类（class）和构造函数，但不适用于接口（interface）和类型别名（type），因为它们在运行时不存在。

### in 操作符收窄

\`in\` 操作符检查对象是否具有某个属性，TypeScript 可以据此收窄联合类型：

\`\`\`ts
type Bird = { fly(): void; wingspan: number };
type Fish = { swim(): void; gills: boolean };

function move(animal: Bird | Fish) {
  if ("swim" in animal) {
    // animal 被收窄为 Fish
    animal.swim();
  } else {
    // animal 被收窄为 Bird
    animal.fly();
  }
}
\`\`\`

\`in\` 收窄特别适合处理可辨识联合中判别字段不是单一字段的情况，或者不同变体有不同的方法名。

### 相等性收窄

TypeScript 也理解 \`===\`、\`!==\`、\`==\`、\`!=\` 等比较操作符，能据此收窄类型：

\`\`\`ts
function process(value: string | number | null | undefined) {
  if (value === null) {
    // 收窄为 null
    return "值为 null";
  }
  if (value === undefined) {
    // 收窄为 undefined
    return "值为 undefined";
  }
  // 此时 value 被收窄为 string | number
  return "值: " + value;
}
\`\`\`

特别注意：\`switch\` 语句也会进行相等性收窄，这就是为什么 switch 处理可辨识联合时能正常工作。

### 真值收窄（Truthiness Narrowing）

JavaScript 中的"假值（falsy）"包括：\`false\`、\`0\`、\`""\`、\`null\`、\`undefined\`、\`NaN\`。TypeScript 理解 \`if (value)\` 这样的真值检查，会过滤掉假值类型：

\`\`\`ts
function printAll(strs: string | string[] | null) {
  if (strs) {
    // strs 被收窄为 string | string[]（排除了 null）
    if (typeof strs === "string") {
      console.log(strs);
    } else {
      strs.forEach(console.log);
    }
  }
}
\`\`\`

但要注意一个陷阱：对于数字类型，\`0\` 和 \`NaN\` 是假值，所以真值收窄会把 \`0\` 也过滤掉：

\`\`\`ts
function processNumber(num?: number) {
  if (num) {
    // num 被收窄为 number，但 num = 0 不会进入这个分支！
    console.log(num.toFixed(2));
  }
}
\`\`\`

### 控制流分析（Control Flow Analysis）

TypeScript 的类型收窄不仅仅是简单的条件判断，它还会进行**跨代码块的控制流分析**。这意味着 TypeScript 会追踪变量在整个函数中的类型变化：

\`\`\`ts
function example() {
  let x: string | number = Math.random() > 0.5 ? "hello" : 42;

  // 第一次赋值后，x 的类型是 string | number
  x = "world";
  // 赋值后，x 的类型收窄为 string（因为赋了一个 string 值）
  console.log(x.toUpperCase()); // ✅

  x = 100;
  // 再次赋值后，x 的类型收窄为 number
  console.log(x.toFixed(2)); // ✅
}
\`\`\`

控制流分析也适用于**提前返回（early return）** 模式：

\`\`\`ts
function process(value: string | null) {
  if (value === null) return;  // 提前返回，后面代码中 value 自动收窄为 string
  console.log(value.toUpperCase()); // ✅ value 是 string
}
\`\`\`

### 类型谓词（Type Predicates）

类型谓词是 TypeScript 最强大的类型收窄工具之一。它是一个返回布尔值的函数，但返回值类型使用 \`parameterName is Type\` 语法，告诉 TypeScript 编译器"如果这个函数返回 true，那么参数就是指定的类型"：

\`\`\`ts
interface Cat {
  meow(): void;
  name: string;
}

interface Dog {
  bark(): void;
  name: string;
}

// 类型谓词：animal is Cat
function isCat(animal: Cat | Dog): animal is Cat {
  return "meow" in animal;
}

function handleAnimal(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow();  // ✅ 收窄为 Cat
  } else {
    animal.bark();  // ✅ 收窄为 Dog
  }
}
\`\`\`

类型谓词类似于 \`Array.isArray()\` 这样的内置 API——TypeScript 就是用类型谓词来声明 \`Array.isArray\` 的返回类型的：\`function isArray(arg: any): arg is any[]\`。

#### 类型谓词的注意事项

类型谓词是开发者的**承诺**——TypeScript 不会验证你的类型谓词实现是否正确。如果你的 \`isCat\` 函数实现有误（比如总是返回 true），TypeScript 也不会报错，但运行时可能出错：

\`\`\`ts
// 危险：类型谓词承诺了但实现错误
function isNumber(value: unknown): value is number {
  return typeof value === "string";  // 实现错误！但 TypeScript 不会报错
}
\`\`\`

因此，类型谓词需要开发者自己保证正确性。

### 断言函数（Assertion Functions）

TypeScript 3.7 引入了断言函数，这是类型谓词的"断言版本"。断言函数不返回布尔值，而是在条件不满足时抛出异常：

\`\`\`ts
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("期望字符串，但得到了 " + typeof value);
  }
}

function process(value: unknown) {
  assertIsString(value);
  // 断言通过后，value 被收窄为 string
  console.log(value.toUpperCase());
}
\`\`\`

断言函数在以下场景中特别有用：
- 参数验证（确保函数参数满足特定条件）
- 测试框架（断言测试值满足条件）
- 防御性编程（在函数入口处检查前置条件）

### 可辨识联合的收窄

可辨识联合（Discriminated Unions）是 TypeScript 中类型收窄最优雅的应用场景。TypeScript 会自动根据判别字段的值来收窄类型：

\`\`\`ts
type Shape = 
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;    // shape: Circle
    case "rectangle":
      return shape.width * shape.height;      // shape: Rectangle
    case "triangle":
      return (shape.base * shape.height) / 2; // shape: Triangle
  }
}
\`\`\`

### 类型收窄的局限

1. **变量被重新赋值后收窄可能失效**：如果变量在闭包中被修改，TypeScript 可能无法追踪其类型变化。

2. **跨函数调用**：TypeScript 不会追踪函数调用对变量类型的影响（除非函数有类型谓词）。

3. **属性访问**：对对象属性的类型收窄需要将属性赋值给局部变量后才能生效。

4. **else 分支的推理**：TypeScript 在 if/else 中能推理两个分支，但对于更复杂的条件分支，可能需要手动帮助。

### 最佳实践

1. **优先使用可辨识联合**：设计类型时，考虑加入判别字段，让编译器自动收窄。
2. **善用类型谓词**：对于复杂的类型判断逻辑，封装成类型谓词函数，复用且清晰。
3. **使用断言函数做参数验证**：在函数入口处使用断言，后续代码可以安全使用收窄后的类型。
4. **避免过度使用 \`as\` 断言**：用类型收窄代替类型断言，让编译器帮你验证。
5. **利用提前返回**：用 \`if (!condition) return\` 模式，后续代码自动获得收窄后的类型。

### 本节代码演示

下面代码演示了 typeof 收窄、instanceof 收窄、in 操作符收窄、真值收窄、类型谓词、断言函数、可辨识联合收窄等所有收窄方式。`,

    code: `// ============================================================
// 第六章代码演示：类型收窄完全指南
// ============================================================

// ---- 1. typeof 收窄 ----
function formatValue(value: string | number | boolean | null | undefined): string {
  if (typeof value === "string") {
    return "字符串: '" + value + "' (长度: " + value.length + ")";
  } else if (typeof value === "number") {
    return "数字: " + value.toFixed(2) + " (是否为整数: " + Number.isInteger(value) + ")";
  } else if (typeof value === "boolean") {
    return "布尔: " + (value ? "真" : "假");
  } else if (value === null) {
    return "null 值";
  } else {
    return "undefined 值";
  }
}

console.log("========== 1. typeof 收窄 ==========");
const testValues: (string | number | boolean | null | undefined)[] = [
  "Hello TypeScript",
  3.14159,
  true,
  false,
  null,
  undefined,
];
testValues.forEach((v) => console.log(formatValue(v)));

// ---- 2. instanceof 收窄 ----
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public receivedValue: unknown
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

function handleError(error: Error): string {
  if (error instanceof ApiError) {
    return "API 错误 [" + error.statusCode + "] " + error.endpoint + ": " + error.message;
  } else if (error instanceof ValidationError) {
    return "验证错误 (字段: " + error.field + "): " + error.message + " (收到: " + JSON.stringify(error.receivedValue) + ")";
  } else {
    return "未知错误: " + error.message;
  }
}

console.log("\\n========== 2. instanceof 收窄 ==========");
const errors: Error[] = [
  new ApiError("资源未找到", 404, "/api/users/999"),
  new ValidationError("邮箱格式不正确", "email", "not-an-email"),
  new Error("未知的系统错误"),
];

errors.forEach((err) => console.log(handleError(err)));

// ---- 3. in 操作符收窄 ----
type Car = {
  type: "car";
  drive(): string;
  wheels: number;
};

type Boat = {
  type: "boat";
  sail(): string;
  length: number;
};

type Plane = {
  type: "plane";
  fly(): string;
  altitude: number;
};

type Vehicle = Car | Boat | Plane;

function operateVehicle(vehicle: Vehicle): string {
  if ("drive" in vehicle) {
    return "🚗 汽车: " + vehicle.drive() + " (" + vehicle.wheels + " 个轮子)";
  } else if ("sail" in vehicle) {
    return "🚢 船: " + vehicle.sail() + " (长度: " + vehicle.length + "m)";
  } else {
    return "✈️ 飞机: " + vehicle.fly() + " (高度: " + vehicle.altitude + "m)";
  }
}

console.log("\\n========== 3. in 操作符收窄 ==========");
const vehicles: Vehicle[] = [
  { type: "car", drive: () => "行驶中", wheels: 4 },
  { type: "boat", sail: () => "航行中", length: 50 },
  { type: "plane", fly: () => "飞行中", altitude: 10000 },
];

vehicles.forEach((v) => console.log(operateVehicle(v)));

// ---- 4. 真值收窄 ----
function processInput(input: string | null | undefined | false | 0): string {
  if (!input) {
    return "输入为空或假值: " + JSON.stringify(input);
  }
  // 这里 input 被收窄为 string（排除了 null, undefined, false, 0）
  return "输入: " + input.toUpperCase();
}

console.log("\\n========== 4. 真值收窄 ==========");
const inputs: (string | null | undefined | false | 0)[] = [
  "hello",
  "",
  null,
  undefined,
  false,
  0,
  "TypeScript",
];
inputs.forEach((inp) => console.log("[" + JSON.stringify(inp) + "] → " + processInput(inp)));

// ---- 5. 类型谓词（Type Predicates） ----
interface User {
  id: number;
  name: string;
  email: string;
}

interface Admin {
  id: number;
  name: string;
  email: string;
  role: "admin";
  permissions: string[];
}

type AppUser = User | Admin;

function isAdmin(user: AppUser): user is Admin {
  return "role" in user && user.role === "admin";
}

function getDashboard(user: AppUser): string {
  if (isAdmin(user)) {
    return "管理员 " + user.name + " | 权限: " + user.permissions.join(", ");
  } else {
    return "用户 " + user.name + " | 邮箱: " + user.email;
  }
}

console.log("\\n========== 5. 类型谓词 ==========");
const appUsers: AppUser[] = [
  { id: 1, name: "张三", email: "zhangsan@example.com" },
  { id: 2, name: "管理员李四", email: "admin@example.com", role: "admin", permissions: ["用户管理", "系统配置", "数据查看"] },
  { id: 3, name: "王五", email: "wangwu@example.com" },
];

appUsers.forEach((u) => console.log(getDashboard(u)));

// ---- 6. 断言函数 ----
function assertNonNull<T>(value: T | null | undefined, message: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

function assertIsPositiveNumber(value: unknown): asserts value is number {
  if (typeof value !== "number" || value <= 0) {
    throw new Error("期望一个正数，但得到了 " + JSON.stringify(value));
  }
}

console.log("\\n========== 6. 断言函数 ==========");

// 正常使用
try {
  let maybeName: string | null = "小明";
  assertNonNull(maybeName, "名字不能为空");
  console.log("名字:", maybeName.toUpperCase()); // 收窄为 string
} catch (e: any) {
  console.log("断言失败:", e.message);
}

// 断言失败
try {
  let maybeName: string | null = null;
  assertNonNull(maybeName, "名字不能为空");
  console.log("这行不会执行");
} catch (e: any) {
  console.log("断言失败:", e.message);
}

// 数字断言
try {
  let value: unknown = -5;
  assertIsPositiveNumber(value);
  console.log("正数:", value.toFixed(2));
} catch (e: any) {
  console.log("断言失败:", e.message);
}

try {
  let value: unknown = 42;
  assertIsPositiveNumber(value);
  console.log("正数:", value.toFixed(2));
} catch (e: any) {
  console.log("断言失败:", e.message);
}

// ---- 7. 可辨识联合收窄 ----
type Circle = { kind: "circle"; radius: number };
type Rectangle = { kind: "rectangle"; width: number; height: number };
type Triangle = { kind: "triangle"; base: number; height: number };
type Shape = Circle | Rectangle | Triangle;

function calculateArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius * shape.radius;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}

function describeShape(shape: Shape): string {
  const area = calculateArea(shape);
  switch (shape.kind) {
    case "circle":
      return "圆形 (半径=" + shape.radius + ") 面积=" + area.toFixed(2);
    case "rectangle":
      return "矩形 (" + shape.width + "×" + shape.height + ") 面积=" + area.toFixed(2);
    case "triangle":
      return "三角形 (底=" + shape.base + ", 高=" + shape.height + ") 面积=" + area.toFixed(2);
  }
}

console.log("\\n========== 7. 可辨识联合收窄 ==========");
const shapes: Shape[] = [
  { kind: "circle", radius: 5 },
  { kind: "rectangle", width: 4, height: 7 },
  { kind: "triangle", base: 6, height: 3 },
];

shapes.forEach((shape) => console.log(describeShape(shape)));

// ---- 8. 提前返回模式收窄 ----
function getUserEmail(user: { name: string; email?: string } | null): string {
  if (user === null) {
    return "用户不存在";
  }
  // 这里 user 自动收窄为 { name: string; email?: string }
  if (user.email === undefined) {
    return user.name + " (未设置邮箱)";
  }
  // 这里 user.email 自动收窄为 string
  return user.name + " <" + user.email + ">";
}

console.log("\\n========== 8. 提前返回模式收窄 ==========");
console.log(getUserEmail(null));
console.log(getUserEmail({ name: "张三" }));
console.log(getUserEmail({ name: "李四", email: "lisi@example.com" }));

console.log("\\n✅ 类型收窄完全指南全部演示完成！");`,
  },
];