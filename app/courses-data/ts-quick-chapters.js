// =============================================================
// TypeScript 速查教程 —— 全部章节（共 15 章，3 个分组）
// -------------------------------------------------------------
// 定位：日常开发高频用法、避坑、模板代码，"简单实用、马上能用"。
// 风格：少讲历史原理，多给"这样写 → 那样写"对比与可直接复制的模板。
//
// 三个分组：
//   上手即用   : 注解、interface/type、联合可选、字面量、数组元组
//   日常高频   : 泛型、Utility Types、断言守卫、null 处理、enum 取舍
//   实战模板   : API 类型、事件回调、React 类型、第三方声明、tsconfig
//
// 运行环境：
//   - 用户写的 TS 先被 typescript 编译器转译为 JS
//     (target ES2020, module CommonJS, 支持装饰器)
//   - 再在 Node.js vm 沙箱中运行，5 秒超时
//   - 类型错误不会阻止运行（教程侧重运行结果），但在 IDE 中会标红
//   - 全局可用: console, process, setTimeout, Promise 等
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：类型注解速写
  // =========================================================
  {
    id: "tsq-annotations",
    title: "类型注解速写",
    icon: "✏️",
    group: "上手即用",
    content: `## 类型注解：到底该标哪里？

TypeScript 的类型注解（annotation）就是给变量、参数、返回值"贴标签"。**核心原则：能被推断出来的就不用手写，标在"边界"上最有价值。**

### 三个最该标的地方

1. **函数参数** —— 调用方看不到函数体，必须标
2. **函数返回值** —— 公开 API 建议标，便于调用方获得准确类型
3. **对象字面量 / 外部数据** —— 不能推断形状时手动标

### 能省则省：推断已经很聪明

\`\`\`ts
let count = 0;          // 推断为 number，不用写 let count: number = 0
let name = "Tom";       // 推断为 string
const PI = 3.14;        // const 字面量推断为 3.14（字面量类型）

// 函数返回值一般能推断出来，但公开 API 建议显式标注
function add(a: number, b: number) {  // 返回值推断为 number
  return a + b;
}
\`\`\`

### 三种声明方式的区别

| 写法 | 类型 | 可改值 | 可改类型 | 用途 |
| --- | --- | --- | --- | --- |
| \`let x: T = v\` | T | ✅ | ✅ | 普通变量 |
| \`const x: T = v\` | T | ❌ | — | 不可重新赋值 |
| \`const x = v\`（无注解） | 字面量类型 | ❌ | — | 常量首选 |

### 别标太多：过度标注是噪音

\`\`\`ts
// ❌ 啰嗦：能推断的别写
let arr: number[] = [1, 2, 3];
function f(): void { console.log("hi"); }

// ✅ 简洁：让推断干活
let arr = [1, 2, 3];
function f() { console.log("hi"); }
\`\`\`

> 💡 **判断标准**：把鼠标悬停在变量上，IDE 显示的类型和你想的一致，就不用手写注解。

下面 demo 把"该标"和"能省"的用法都演示一遍，运行后会打印结果。`,
    code: `// ===== TypeScript 类型注解速写 demo =====

// 1) 函数参数：必须标，调用方才知道传什么
function greet(name: string, age: number): string {
  // 返回值类型 string 也可省略（能推断），公开 API 建议保留
  return \`你好 \${name}，今年 \${age} 岁\`;
}
console.log(greet("小明", 18));

// 2) 能推断的别手写：让推断干活
let count = 0;            // 推断为 number
count = 10;               // ✅ 同类型可改
// count = "十";          // ❌ IDE 报错：不能赋 string 给 number
console.log("count =", count);

const PI = 3.14;          // const 推断为字面量类型 3.14
console.log("PI =", PI);

// 3) 数组与对象：形状不能推断时才手动标
let scores: number[] = [90, 85, 88];
console.log("scores 平均 =", scores.reduce((a, b) => a + b, 0) / scores.length);

// 对象类型用 inline 结构或 interface（下一章讲）
let user: { name: string; age: number } = { name: "Tom", age: 20 };
console.log("user =", user.name, user.age);

// 4) 函数返回值：多数情况能推断，但联合分支建议显式标
function pick(n: number): string | number {
  return n > 0 ? "正数" : n;   // 返回 string | number
}
console.log("pick(5) =", pick(5));
console.log("pick(-1) =", pick(-1));`,
  },

  // =========================================================
  // 第二章：interface vs type
  // =========================================================
  {
    id: "tsq-interface-type",
    title: "interface vs type 怎么选",
    icon: "🆚",
    group: "上手即用",
    content: `## interface 和 type：90% 场景都能互换

新手最常纠结的问题。**结论先给：描述对象形状用 \`interface\`，需要联合/交叉/工具类型用 \`type\`。**

### 两者等价的写法

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

### 关键区别

| 维度 | interface | type |
| --- | --- | --- |
| 描述对象/类形状 | ✅ 首选 | ✅ 可以 |
| 联合类型 \`A | B\` | ❌ 不行 | ✅ 首选 |
| 交叉类型 \`A & B\` | 用 extends | ✅ 首选 |
| 同名合并（声明合并） | ✅ 自动合并 | ❌ 重复定义报错 |
| 扩展语法 | \`extends\` | \`&\` 交叉 |
| 用于工具类型 | 一般 | ✅ 灵活 |

### interface 的"声明合并"特性

\`\`\`ts
interface Window { myProp: string; }   // 给全局 Window 加属性会自动合并
\`\`\`

这在给第三方库扩展类型时很有用（见"第三方库类型声明"一章）。

### 实用选择建议

- **对象/类的形状** → \`interface\`（可被 implements、可声明合并）
- **联合类型、元组、工具类型、条件类型** → \`type\`
- **不确定** → 先用 \`interface\`，需要联合再换 \`type\`

下面 demo 演示两者的等价用法和扩展方式。`,
    code: `// ===== interface vs type 用法对比 demo =====

// 1) interface：描述对象形状（首选）
interface User {
  name: string;
  age: number;
  greet(): void;
}

const u: User = {
  name: "小明",
  age: 20,
  greet() { console.log(\`我是 \${this.name}\`); }
};
u.greet();

// 2) type：完全等价的写法
type UserT = {
  name: string;
  age: number;
};
const u2: UserT = { name: "小红", age: 22 };
console.log("UserT:", u2.name, u2.age);

// 3) interface 用 extends 扩展
interface Animal { name: string; }
interface Dog extends Animal { bark(): void; }
const d: Dog = {
  name: "旺财",
  bark() { console.log(\`\${this.name}: 汪汪！\`); }
};
d.bark();

// 4) type 用 & 交叉扩展
type WithId = { id: number };
type Task = WithId & { title: string };
const t: Task = { id: 1, title: "写 TS" };
console.log("Task:", t.id, t.title);

// 5) type 才能做的：联合类型
type Status = "pending" | "done" | "error";
function handle(s: Status) {
  console.log("当前状态:", s);
}
handle("done");

// 6) interface 声明合并：同名自动合并
interface Config { host: string; }
interface Config { port: number; }   // 自动合并到上面
const cfg: Config = { host: "localhost", port: 3000 };
console.log("Config:", cfg.host, cfg.port);`,
  },

  // =========================================================
  // 第三章：联合类型与可选属性
  // =========================================================
  {
    id: "tsq-union-optional",
    title: "联合类型与可选属性",
    icon: "🔗",
    group: "上手即用",
    content: `## 联合类型与可选：处理"可能有也可能没有"

真实业务里字段经常"可能没有"、值经常"可能是多种类型"。这两个特性是日常用得最多的。

### 可选属性 \`?\`

\`\`\`ts
interface User {
  name: string;
  age?: number;      // age 可有可无
  phone?: string;
}
const u1: User = { name: "Tom" };          // ✅ 不写 age 也行
const u2: User = { name: "Tom", age: 20 }; // ✅ 写了也行
\`\`\`

> ⚠️ 可选属性的类型其实是 \`number | undefined\`，访问时要注意空值。

### 联合类型 \`|\`

\`\`\`ts
let id: string | number;
id = 123;        // ✅
id = "A001";     // ✅

type Result = { ok: true; data: string } | { ok: false; error: string };
\`\`\`

### 只读属性 \`readonly\`

\`\`\`ts
interface Point { readonly x: number; readonly y: number; }
const p: Point = { x: 1, y: 2 };
// p.x = 5;   // ❌ 只读不能改
\`\`\`

### 实战： discriminated union（可辨识联合）

处理"多种情况"的最佳模式，配合 \`switch\` 能安全收窄类型：

\`\`\`ts
type Event =
  | { type: "click"; x: number; y: number }
  | { type: "scroll"; top: number };
\`\`\`

下面 demo 演示可选、联合、可辨识联合的完整用法。`,
    code: `// ===== 联合类型与可选属性 demo =====

// 1) 可选属性：处理"可能没有"的字段
interface User {
  name: string;
  age?: number;       // 可选
  phone?: string;     // 可选
}
function printUser(u: User) {
  console.log("姓名:", u.name);
  // 可选属性访问前要判空，否则可能是 undefined
  console.log("年龄:", u.age ?? "未填");
  console.log("电话:", u.phone ?? "未填");
}
printUser({ name: "小明" });
printUser({ name: "小红", age: 22, phone: "13800000000" });

// 2) 联合类型：一个值可能是多种类型
let id: string | number;
id = 1001;
console.log("数字 id:", id);
id = "A1001";
console.log("字符串 id:", id);

// 3) 联合类型 + 类型守卫：用前要收窄
function formatId(id: string | number): string {
  if (typeof id === "number") {
    return "NUM-" + id;     // 这里 id 是 number
  }
  return "STR-" + id;       // 这里 id 是 string
}
console.log(formatId(1001));
console.log(formatId("A1001"));

// 4) 可辨识联合：用 type 字段区分多种情况（最常用模式）
type ApiResponse =
  | { status: "ok"; data: string }
  | { status: "error"; message: string };

function handle(res: ApiResponse) {
  switch (res.status) {
    case "ok":
      console.log("成功:", res.data);      // res.data 可访问
      break;
    case "error":
      console.log("失败:", res.message);   // res.message 可访问
      break;
  }
}
handle({ status: "ok", data: "拿到数据了" });
handle({ status: "error", message: "网络错误" });

// 5) readonly：防止误改
interface Point { readonly x: number; readonly y: number; }
const p: Point = { x: 1, y: 2 };
console.log("Point:", p.x, p.y);
// p.x = 5;  // ❌ IDE 报错：只读属性不可修改`,
  },

  // =========================================================
  // 第四章：字面量类型与 as const
  // =========================================================
  {
    id: "tsq-literal-const",
    title: "字面量类型与 as const",
    icon: "🏷️",
    group: "上手即用",
    content: `## 字面量类型与 as const：把值变成类型

字面量类型让一个变量"只能是某个具体值"，配合 \`as const\` 能写出非常精确的类型，常用于状态值、配置项、常量集合。

### 字面量类型

\`\`\`ts
let dir: "left" | "right" | "up" | "down";
dir = "left";    // ✅
// dir = "east"; // ❌ 只能是四个值之一

type Status = 200 | 404 | 500;
\`\`\`

### const 的"字面量推断"

\`\`\`ts
let n = 5;        // 推断为 number（宽类型）
const n2 = 5;     // 推断为 5（字面量类型，因为 const 不可改）
\`\`\`

### as const：把对象/数组"冻结"成字面量类型

这是日常高频用法，**让普通对象变成精确的只读字面量类型**：

\`\`\`ts
const config = { host: "localhost", port: 3000 } as const;
// config 的类型：{ readonly host: "localhost"; readonly port: 3000 }
\`\`\`

### 实战：用 as const 定义状态集合 + 提取类型

\`\`\`ts
const ROLES = ["admin", "user", "guest"] as const;
type Role = typeof ROLES[number];   // "admin" | "user" | "guest"
\`\`\`

这样改一处常量数组，类型自动同步，不用手动维护联合类型。

下面 demo 演示字面量类型、as const 和"从常量提取类型"的完整用法。`,
    code: `// ===== 字面量类型与 as const demo =====

// 1) 字面量类型：变量只能是特定值
type Direction = "left" | "right" | "up" | "down";
function move(dir: Direction) {
  console.log("向", dir, "移动");
}
move("left");
move("up");

// 2) let vs const 的推断差异
let n = 5;        // 推断为 number
const m = 5;      // 推断为字面量 5
console.log("let n =", n, " const m =", m);

// 3) as const：把对象冻结成只读字面量类型
const CONFIG = {
  host: "localhost",
  port: 3000,
  debug: true
} as const;
// CONFIG 的类型精确到字面量：{ readonly host: "localhost"; readonly port: 3000; readonly debug: true }
console.log("CONFIG:", CONFIG.host, CONFIG.port, CONFIG.debug);
// CONFIG.port = 8080;  // ❌ 只读不可改

// 4) 从常量数组提取联合类型（高频技巧）
const ROLES = ["admin", "user", "guest"] as const;
type Role = typeof ROLES[number];   // "admin" | "user" | "guest"

function checkRole(role: Role) {
  console.log("角色:", role, ROLES.includes(role) ? "（合法）" : "");
}
checkRole("admin");
checkRole("guest");

// 5) as const 让数组变成只读元组
const pair = [10, 20] as const;
// pair 的类型：readonly [10, 20]，长度和类型都固定
console.log("元组:", pair[0], pair[1]);

// 6) 实战：定义 HTTP 状态码字面量类型
type HttpCode = 200 | 301 | 404 | 500;
function desc(code: HttpCode): string {
  switch (code) {
    case 200: return "OK";
    case 301: return "永久重定向";
    case 404: return "未找到";
    case 500: return "服务器错误";
  }
}
console.log(desc(200));
console.log(desc(404));`,
  },

  // =========================================================
  // 第五章：数组与元组
  // =========================================================
  {
    id: "tsq-array-tuple",
    title: "数组与元组类型",
    icon: "📋",
    group: "上手即用",
    content: `## 数组与元组：日常最常操作的容器

数组类型有几种写法，元组用于"长度和位置都固定"的场景。

### 数组类型的几种写法

\`\`\`ts
let a: number[] = [1, 2, 3];        // 推荐写法
let b: Array<number> = [1, 2, 3];   // 泛型写法（等价）
let c: (string | number)[] = [1, "a", 2];   // 联合元素数组
\`\`\`

> ⚠️ 注意 \`number[]\` 和 \`(number | string)[]\` 的括号：\`number | string[]\` 会被理解成 \`number | string[]\`（一个数字或一个字符串数组），不是"数字或字符串的数组"。

### 二维数组

\`\`\`ts
let matrix: number[][] = [[1, 2], [3, 4]];
\`\`\`

### 元组 tuple：长度和类型都固定

\`\`\`ts
let tup: [string, number] = ["小明", 20];
\`\`\`

元组常用于：
- 函数返回多个值
- 固定格式的小数据（坐标、键值对）
- \`useSate\` 返回的 \`[state, setState]\`

### readonly 数组

\`\`\`ts
const arr: readonly number[] = [1, 2, 3];
// arr.push(4);  // ❌ 只读数组不能改
\`\`\`

下面 demo 演示数组、元组、只读数组的常见操作。`,
    code: `// ===== 数组与元组类型 demo =====

// 1) 数组类型：推荐 number[] 写法
let scores: number[] = [90, 85, 88];
console.log("平均分:", scores.reduce((a, b) => a + b, 0) / scores.length);

// 2) 联合元素数组：注意括号
let mixed: (string | number)[] = [1, "a", 2, "b"];
console.log("混合数组:", mixed);

// 3) 二维数组
let matrix: number[][] = [[1, 2], [3, 4]];
console.log("矩阵 [1][0]:", matrix[1][0]);

// 4) 元组：长度和位置都固定
let user: [string, number, boolean] = ["小明", 20, true];
const [name, age, active] = user;   // 解构取值
console.log("元组解构:", name, age, active);

// 5) 元组实战：函数返回多个值
function findUser(id: number): [string, number] | null {
  if (id === 1) return ["小明", 20];
  return null;
}
const result = findUser(1);
if (result) {
  const [userName, userAge] = result;
  console.log("查到用户:", userName, userAge);
}

// 6) readonly 数组：防止误改
const fixed: readonly number[] = [1, 2, 3];
console.log("只读数组:", fixed);
// fixed.push(4);   // ❌ IDE 报错：readonly 数组没有 push 方法

// 7) 元组带标签：提高可读性（仅类型层面，运行时无影响）
type LabeledTuple = [name: string, age: number];
const lt: LabeledTuple = ["小红", 22];
console.log("带标签元组:", lt[0], lt[1]);`,
  },

  // =========================================================
  // 第六章：泛型速成
  // =========================================================
  {
    id: "tsq-generics",
    title: "泛型速成：写通用工具",
    icon: "🌀",
    group: "日常高频",
    content: `## 泛型：让函数/类型"保留输入类型"

泛型不是高深概念，**就是"类型的占位符"**：调用时再决定具体是什么类型。日常写工具函数、封装请求、定义容器时都用得上。

### 最简单的泛型函数

\`\`\`ts
function identity<T>(value: T): T {
  return value;
}
identity<number>(5);     // 返回 number
identity("hi");          // 返回 string（类型推断）
\`\`\`

### 实战：通用"取第一个元素"

\`\`\`ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
first([1, 2, 3]);        // 返回 number | undefined
first(["a", "b"]);       // 返回 string | undefined
\`\`\`

不用泛型的话，你只能写成 \`any\` 或 \`unknown\`，丢失类型信息。

### 泛型约束（constraints）

用 \`extends\` 限制 T 必须有某些属性：

\`\`\`ts
function getLength<T extends { length: number }>(x: T): number {
  return x.length;       // 保证 T 有 length
}
getLength("abc");        // ✅ string 有 length
getLength([1, 2]);       // ✅ 数组有 length
// getLength(123);       // ❌ number 没有 length
\`\`\`

### 多个泛型参数

\`\`\`ts
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}
\`\`\`

### 泛型接口

\`\`\`ts
interface Box<T> { value: T; }
const b: Box<string> = { value: "hello" };
\`\`\`

> 💡 **判断要不要用泛型**：当"输入类型"和"输出类型"要保持一致，或想保留调用方的具体类型时，就用泛型。

下面 demo 演示泛型函数、约束、多参数的完整用法。`,
    code: `// ===== 泛型速成 demo =====

// 1) 最简单的泛型：原样返回，保留类型
function identity<T>(value: T): T {
  return value;
}
const n = identity(5);          // T 推断为 number，n 是 number
const s = identity("hi");       // T 推断为 string，s 是 string
console.log("identity:", n, s);

// 2) 实战：通用"取第一个元素"
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
console.log("数字数组首项:", first([10, 20, 30]));
console.log("字符串数组首项:", first(["a", "b"]));
console.log("空数组首项:", first([]));

// 3) 泛型约束：要求 T 必须有 length 属性
function getLength<T extends { length: number }>(x: T): number {
  return x.length;
}
console.log("字符串长度:", getLength("hello"));
console.log("数组长度:", getLength([1, 2, 3]));

// 4) 多个泛型参数
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}
const p = pair("name", "小明");
console.log("键值对:", p[0], "=", p[1]);

// 5) 泛型接口：通用容器
interface Box<T> {
  value: T;
  unwrap(): T;
}
function makeBox<T>(value: T): Box<T> {
  return {
    value,
    unwrap() { return this.value; }
  };
}
const box = makeBox(42);
console.log("Box 内容:", box.unwrap());

// 6) 实战：通用"取对象属性"
function pluck<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { name: "小明", age: 20 };
console.log("pluck name:", pluck(user, "name"));
console.log("pluck age:", pluck(user, "age"));`,
  },

  // =========================================================
  // 第七章：Utility Types 速查
  // =========================================================
  {
    id: "tsq-utility-types",
    title: "Utility Types 速查",
    icon: "🧰",
    group: "日常高频",
    content: `## Utility Types：内置类型工具箱

TypeScript 自带一批"类型转换函数"，**日常 80% 的类型操作都靠这几个**。记住它们能省下大量重复定义。

### 最常用的 6 个

| 工具 | 作用 | 用途 |
| --- | --- | --- |
| \`Partial<T>\` | 所有属性变可选 | 更新/补丁对象 |
| \`Required<T>\` | 所有属性变必填 | 确保字段齐全 |
| \`Pick<T, K>\` | 挑选部分属性 | 从大类型取子集 |
| \`Omit<T, K>\` | 去掉部分属性 | 排除某些字段 |
| \`Record<K, V>\` | 构造键值对类型 | 字典/映射表 |
| \`ReturnType<F>\` | 取函数返回类型 | 复用已有函数的类型 |

### 次常用 4 个

| 工具 | 作用 |
| --- | --- |
| \`Readonly<T>\` | 全部变只读 |
| \`Parameters<F>\` | 取函数参数类型（元组） |
| \`Awaited<P>\` | 解包 Promise（拿 \`Promise<User>\` 里的 \`User\`） |
| \`NonNullable<T>\` | 去掉 null/undefined |

### 实战示例

\`\`\`ts
interface User { id: number; name: string; age: number; }

type UserPatch = Partial<User>;              // 更新时所有字段可选
type UserPreview = Pick<User, "id" | "name">; // 只取 id 和 name
type CreateUser = Omit<User, "id">;          // 创建时不带 id
type UserMap = Record<string, User>;         // 按 id 索引的字典
\`\`\`

> 💡 **从已有类型派生新类型**，而不是重复定义，是 TS 维护性的关键。

下面 demo 把常用工具类型全部跑一遍。`,
    code: `// ===== Utility Types 速查 demo =====

interface User {
  id: number;
  name: string;
  age: number;
  email?: string;
}

// 1) Partial：所有属性变可选（用于更新/补丁）
type UserPatch = Partial<User>;
function updateUser(id: number, patch: UserPatch) {
  console.log("更新用户", id, "字段:", JSON.stringify(patch));
}
updateUser(1, { name: "新名字" });        // 只传要改的
updateUser(2, { age: 25, email: "a@b.c" });

// 2) Required：所有属性变必填
type FullUser = Required<User>;
const full: FullUser = { id: 1, name: "小明", age: 20, email: "a@b.c" };
console.log("Required:", full.email);

// 3) Pick：挑选部分属性
type UserPreview = Pick<User, "id" | "name">;
const preview: UserPreview = { id: 1, name: "小明" };
console.log("Pick 预览:", preview.id, preview.name);

// 4) Omit：去掉部分属性
type CreateUser = Omit<User, "id">;
const newUser: CreateUser = { name: "小红", age: 22 };
console.log("Omit 创建:", newUser.name, newUser.age);

// 5) Record：构造键值对类型（字典）
type UserMap = Record<string, User>;
const users: UserMap = {
  "u1": { id: 1, name: "小明", age: 20 },
  "u2": { id: 2, name: "小红", age: 22 }
};
console.log("Record 字典:", users["u1"].name);

// 6) ReturnType：取函数返回类型
function fetchUser(): User {
  return { id: 1, name: "小明", age: 20 };
}
type FetchedUser = ReturnType<typeof fetchUser>;   // 等于 User
const fu: FetchedUser = fetchUser();
console.log("ReturnType:", fu.name);

// 7) Readonly：全部变只读
type FrozenUser = Readonly<User>;
const frozen: FrozenUser = { id: 1, name: "小明", age: 20 };
console.log("Readonly:", frozen.id);
// frozen.id = 2;  // ❌ 只读不可改

// 8) NonNullable：去掉 null/undefined
type MaybeStr = string | null | undefined;
type SureStr = NonNullable<MaybeStr>;   // string
const sure: SureStr = "一定有值";
console.log("NonNullable:", sure);

// 9) Awaited：解包 Promise
async function getUser(): Promise<User> {
  return { id: 1, name: "异步用户", age: 20 };
}
type AsyncUser = Awaited<ReturnType<typeof getUser>>;   // User
console.log("Awaited<Promise<User>> 等于 User");`,
  },

  // =========================================================
  // 第八章：断言与类型守卫
  // =========================================================
  {
    id: "tsq-assertion-guard",
    title: "as 断言与类型守卫",
    icon: "🛡️",
    group: "日常高频",
    content: `## 断言与类型守卫：安全地"收窄类型"

处理联合类型时，TS 不知道当前是哪种，需要你帮它"收窄"。**优先用类型守卫（安全），少用 as 断言（危险）。**

### 类型守卫：安全收窄（推荐）

\`\`\`ts
// typeof 守卫：基本类型
function f(x: string | number) {
  if (typeof x === "string") {
    x.toUpperCase();   // 这里 x 是 string
  }
}

// in 守卫：判断对象有没有某属性
interface Cat { meow(): void }
interface Dog { bark(): void }
function speak(pet: Cat | Dog) {
  if ("meow" in pet) pet.meow();
  else pet.bark();
}

// instanceof 守卫：判断类实例
if (err instanceof Error) err.message;
\`\`\`

### 自定义类型守卫函数

\`\`\`ts
function isString(x: unknown): x is string {
  return typeof x === "string";
}
\`\`\`

\`x is string\` 是"类型谓词"，告诉 TS 在 if 分支里 x 就是 string。**处理 unknown 数据时这个最有用。**

### as 断言：强制告诉类型（谨慎用）

\`\`\`ts
const el = document.querySelector("#app") as HTMLDivElement;
const data = JSON.parse(str) as User;
\`\`\`

> ⚠️ as 是"我保证它是这个类型"，TS 不检查。**断言错了运行时崩，编译期不报错。** 能用守卫就别用 as。

### 双重断言（极少用）

\`\`\`ts
const x = obj as unknown as User;   // 先转 unknown 再转目标
\`\`\`

下面 demo 演示三种守卫和断言的用法与风险。`,
    code: `// ===== as 断言与类型守卫 demo =====

// 1) typeof 守卫：基本类型收窄
function process(x: string | number) {
  if (typeof x === "string") {
    console.log("字符串:", x.toUpperCase());   // x 是 string
  } else {
    console.log("数字:", x.toFixed(2));         // x 是 number
  }
}
process("hello");
process(3.14159);

// 2) in 守卫：判断对象属性
interface Cat { name: string; meow(): void }
interface Dog { name: string; bark(): void }
function speak(pet: Cat | Dog) {
  console.log("宠物:", pet.name);
  if ("meow" in pet) pet.meow();     // pet 收窄为 Cat
  else pet.bark();                   // pet 收窄为 Dog
}
speak({ name: "咪咪", meow() { console.log("喵~"); } });
speak({ name: "旺财", bark() { console.log("汪！"); } });

// 3) instanceof 守卫：判断类实例
class ValidationError extends Error {
  constructor(public field: string) { super(field + " 无效"); }
}
function report(err: Error | ValidationError) {
  if (err instanceof ValidationError) {
    console.log("校验错误，字段:", err.field);
  } else {
    console.log("普通错误:", err.message);
  }
}
report(new ValidationError("email"));
report(new Error("网络错误"));

// 4) 自定义类型守卫：处理 unknown 数据（最实用）
function isUser(x: unknown): x is { name: string; age: number } {
  return typeof x === "object" && x !== null &&
    "name" in x && "age" in x &&
    typeof (x as any).name === "string" &&
    typeof (x as any).age === "number";
}
const raw = JSON.parse('{"name":"小明","age":20}');
if (isUser(raw)) {
  console.log("合法用户:", raw.name, raw.age);   // raw 收窄为 User
} else {
  console.log("数据格式不对");
}

// 5) as 断言：谨慎使用（运行时不检查）
const input = "123";
const num = (input as unknown) as number;   // 双重断言，危险
console.log("as 断言（实际还是字符串）:", num, typeof num);

// 6) 可辨识联合 + switch 守卫
type Shape =
  | { kind: "circle"; r: number }
  | { kind: "square"; size: number };
function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.r * s.r;
    case "square": return s.size * s.size;
  }
}
console.log("圆面积:", area({ kind: "circle", r: 2 }).toFixed(2));
console.log("正方形面积:", area({ kind: "square", size: 3 }));`,
  },

  // =========================================================
  // 第九章：处理 null / undefined
  // =========================================================
  {
    id: "tsq-null-undefined",
    title: "处理 null / undefined",
    icon: "🚫",
    group: "日常高频",
    content: `## null / undefined：日常 bug 重灾区

JS 里空值导致的 \`Cannot read property of undefined\` 是最常见的运行时错误。TS 的空值处理能让你在编译期就避免大部分。

### 严格空值检查

开启 \`strictNullChecks\` 后，\`string\` 和 \`string | null\` 是不同类型，不能互相赋值：

\`\`\`ts
let s: string = "hi";
// s = null;   // ❌ 报错
let sn: string | null = "hi";
sn = null;     // ✅
\`\`\`

### 可选链 \`?.\`：安全访问可能为空的属性

\`\`\`ts
const city = user?.address?.city;   // 任何一层是 null/undefined 都返回 undefined
const name = user?.getName?.();     // 方法也支持
const len = user?.name?.length ?? 0;
\`\`\`

### 空值合并 \`??\`：给 null/undefined 一个默认值

\`\`\`ts
const name = input ?? "匿名";   // input 是 null/undefined 时用"匿名"
\`\`\`

> ⚠️ 别和 \`||\` 混淆：\`||\` 对所有假值（0、""、false）都生效，\`??\` 只对 null/undefined 生效。

### 非空断言 \`!\`：我保证不是空（谨慎）

\`\`\`ts
const el = document.querySelector("#app")!;   // 告诉 TS 肯定不是 null
\`\`\`

> ⚠️ 运行时不检查，如果实际是 null 会崩。只在"你确信不会为空"时用。

### 实战：安全访问嵌套数据

下面 demo 演示可选链、空值合并、非空断言的对比。`,
    code: `// ===== 处理 null / undefined demo =====

// 1) 严格空值：string 和 string | null 是不同类型
let s: string = "hi";
// s = null;   // ❌ IDE 报错
let sn: string | null = "hi";
sn = null;     // ✅
console.log("sn =", sn);

// 2) 可选链 ?.：安全访问嵌套属性
interface UserProfile {
  name: string;
  address?: {
    city?: string;
    zip?: string;
  };
}
const u1: UserProfile = { name: "小明", address: { city: "北京" } };
const u2: UserProfile = { name: "小红" };   // 没有 address

console.log("u1 城市:", u1?.address?.city);    // "北京"
console.log("u2 城市:", u2?.address?.city);    // undefined（不报错）

// 3) 空值合并 ??：给 null/undefined 默认值
const city1 = u1?.address?.city ?? "未知";
const city2 = u2?.address?.city ?? "未知";
console.log("u1 城市默认值:", city1);   // "北京"
console.log("u2 城市默认值:", city2);   // "未知"

// 4) ?? vs || 的区别（重要！）
const count1 = 0;
console.log("0 || 10 =", count1 || 10);    // 10（0 是假值）
console.log("0 ?? 10 =", count1 ?? 10);    // 0（0 不是 null/undefined）

const text = "";
console.log('"" || "默认" =', text || "默认");   // "默认"
console.log('"" ?? "默认" =', text ?? "默认");   // ""

// 5) 非空断言 !：确信不为空时用（运行时不检查）
function getFirst(arr: number[]): number {
  // 假设调用方保证数组非空，这里用 ! 告诉 TS 不为空
  return arr[0]!;
}
console.log("非空断言取首项:", getFirst([5, 6, 7]));

// 6) 实战：安全处理 API 返回的嵌套数据
interface ApiResponse {
  data?: {
    user?: {
      profile?: {
        nickname?: string;
      };
    };
  };
}
const res: ApiResponse = {};
const nickname = res?.data?.user?.profile?.nickname ?? "游客";
console.log("最终昵称:", nickname);   // "游客"

// 7) 显式判空：最稳妥的方式
function printLen(str: string | null | undefined) {
  if (str == null) {        // == 同时判断 null 和 undefined
    console.log("空字符串");
    return;
  }
  console.log("长度:", str.length);
}
printLen(null);
printLen("hello");`,
  },

  // =========================================================
  // 第十章：enum 与联合字面量取舍
  // =========================================================
  {
    id: "tsq-enum",
    title: "enum vs 联合字面量",
    icon: "🔢",
    group: "日常高频",
    content: `## enum vs 联合字面量：状态值怎么定义

定义"一组固定值"（状态、角色、方向）时有两种主流写法，**各有利弊**。

### 方式一：enum

\`\`\`ts
enum Status {
  Pending = "pending",
  Done = "done",
  Error = "error",
}
const s: Status = Status.Done;
\`\`\`

优点：
- 有命名空间，\`Status.Done\` 自带语义
- 支持数字枚举、字符串枚举
- 可以反向映射（数字枚举）

缺点：
- 编译后会生成真实运行时代码（不是纯类型）
- 在 tree-shaking 和常量提取上略麻烦

### 方式二：联合字面量 + as const

\`\`\`ts
const STATUS = ["pending", "done", "error"] as const;
type Status = typeof STATUS[number];   // "pending" | "done" | "error"
const s: Status = "done";
\`\`\`

或直接写联合：

\`\`\`ts
type Status = "pending" | "done" | "error";
\`\`\`

优点：
- 零运行时开销（纯类型）
- tree-shaking 友好
- 可直接用字符串字面量

缺点：
- 没有命名空间，纯字符串容易和别的字符串混淆

### 选择建议

- **需要"运行时常量集合"**（要遍历、要拿值）→ \`enum\` 或 \`as const\` 数组
- **只是类型约束**（限定取值）→ 联合字面量
- **团队有规范** → 跟规范走

> 💡 现代项目越来越倾向"联合字面量 + as const"，因为零运行时开销且更简洁。

下面 demo 对比两种写法的运行时行为。`,
    code: `// ===== enum vs 联合字面量对比 demo =====

// 1) enum：编译后会生成真实对象
enum Status {
  Pending = "pending",
  Done = "done",
  Error = "error",
}
let s: Status = Status.Done;
console.log("enum 值:", s);
console.log("enum 遍历:", Object.values(Status));

// 2) 数字 enum：默认从 0 递增
enum Priority {
  Low,      // 0
  Medium,   // 1
  High,     // 2
}
console.log("数字 enum:", Priority.Low, Priority.Medium, Priority.High);

// 3) 联合字面量：纯类型，零运行时
type Status2 = "pending" | "done" | "error";
let s2: Status2 = "done";
console.log("联合字面量:", s2);

// 4) as const 数组 + 提取类型：运行时常量 + 类型
const ROLES = ["admin", "user", "guest"] as const;
type Role = typeof ROLES[number];
function check(role: Role) {
  console.log("角色:", role);
}
check("admin");
console.log("as const 遍历:", ROLES);

// 5) 实战：用 enum 定义 HTTP 方法（需要运行时值时）
enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}
function request(method: HttpMethod, url: string) {
  console.log(\`[\${method}] \${url}\`);
}
request(HttpMethod.GET, "/api/users");
request(HttpMethod.POST, "/api/users");

// 6) 实战：用联合字面量定义状态（只需类型约束时）
type OrderState = "created" | "paid" | "shipped" | "done" | "canceled";
function transit(from: OrderState, to: OrderState) {
  console.log(\`订单状态：\${from} -> \${to}\`);
}
transit("paid", "shipped");`,
  },

  // =========================================================
  // 第十一章：API 响应类型模板
  // =========================================================
  {
    id: "tsq-api-types",
    title: "API 响应类型模板",
    icon: "🌐",
    group: "实战模板",
    content: `## API 响应类型：可直接复用的模板

定义 API 类型是 TS 项目里最高频的工作。下面是经过实战验证的标准模板，**copy 过来改字段即可**。

### 标准响应包装

\`\`\`ts
// 统一响应结构
interface ApiResponse<T> {
  code: number;        // 业务状态码
  message: string;     // 提示信息
  data: T;             // 实际数据（泛型）
}

// 分页结构
interface Paginated<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
\`\`\`

### 实体类型 + 创建/更新类型

\`\`\`ts
// 完整实体（接口返回）
interface User {
  id: number;
  name: string;
  createdAt: string;
}

// 创建时的输入（不带 id、时间戳）
type CreateUserDTO = Omit<User, "id" | "createdAt">;

// 更新时的输入（所有字段可选）
type UpdateUserDTO = Partial<CreateUserDTO>;
\`\`\`

> 💡 **DTO（Data Transfer Object）** 是数据传输对象，指接口入参/出参的类型。

### 用泛型封装请求函数

\`\`\`ts
async function request<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json();
}
\`\`\`

这样调用方自动拿到正确类型，不用手动断言。

下面 demo 演示完整的 API 类型定义和模拟请求流程。`,
    code: `// ===== API 响应类型模板 demo =====

// 1) 统一响应包装（泛型）
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 2) 分页结构（泛型）
interface Paginated<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 3) 实体类型 + DTO 派生
interface User {
  id: number;
  name: string;
  age: number;
  createdAt: string;
}
// 创建入参：去掉 id 和时间戳
type CreateUserDTO = Omit<User, "id" | "createdAt">;
// 更新入参：所有字段可选
type UpdateUserDTO = Partial<CreateUserDTO>;

// 4) 模拟请求函数（泛型保留返回类型）
async function request<T>(mockData: T): Promise<ApiResponse<T>> {
  // 真实场景是 fetch(url).then(r => r.json())
  return { code: 200, message: "ok", data: mockData };
}

// 5) 模拟分页查询
async function fetchUsers(): Promise<ApiResponse<Paginated<User>>> {
  const users: User[] = [
    { id: 1, name: "小明", age: 20, createdAt: "2024-01-01" },
    { id: 2, name: "小红", age: 22, createdAt: "2024-01-02" }
  ];
  return request<Paginated<User>>({
    list: users,
    total: users.length,
    page: 1,
    pageSize: 10
  });
}

// 6) 模拟创建用户
async function createUser(input: CreateUserDTO): Promise<ApiResponse<User>> {
  const newUser: User = {
    ...input,
    id: Date.now(),
    createdAt: new Date().toISOString()
  };
  return request<User>(newUser);
}

// 7) 执行演示
(async () => {
  // 查询用户列表
  const res = await fetchUsers();
  if (res.code === 200) {
    console.log("查询成功，共", res.data.total, "人");
    res.data.list.forEach(u => console.log(" -", u.id, u.name, u.age + "岁"));
  }

  // 创建新用户（用 DTO 类型保证入参正确）
  const createRes = await createUser({ name: "小刚", age: 25 });
  console.log("创建成功:", createRes.data.name, "ID:", createRes.data.id);

  // 更新用户（用 Partial 保证字段可选）
  const updateInput: UpdateUserDTO = { name: "新名字" };
  console.log("更新入参（部分字段）:", JSON.stringify(updateInput));
})();`,
  },

  // =========================================================
  // 第十二章：事件处理与回调类型
  // =========================================================
  {
    id: "tsq-event-handler",
    title: "事件处理与回调类型",
    icon: "🎯",
    group: "实战模板",
    content: `## 事件处理与回调：函数类型怎么标

写回调函数、事件处理器、订阅发布时，函数类型标注很容易写错。下面是常用模板。

### 函数类型字面量

\`\`\`ts
type Handler = (data: string) => void;
const h: Handler = (data) => console.log(data);
\`\`\`

### 回调函数的两种写法

\`\`\`ts
// 方式一：内联
function fetch(cb: (err: Error | null, data?: string) => void) {}

// 方式二：抽成类型（推荐，可复用）
type Callback = (err: Error | null, data?: string) => void;
function fetch(cb: Callback) {}
\`\`\`

### 事件处理器类型

\`\`\`ts
// DOM 事件
const onClick: (e: MouseEvent) => void = (e) => {
  console.log(e.clientX, e.clientY);
};

// 自定义事件
interface MyEvent {
  type: string;
  payload: unknown;
}
type Listener<T> = (event: T) => void;
\`\`\`

### 简单的发布订阅

\`\`\`ts
class Emitter<Events extends Record<string, unknown>> {
  // 每个 on 调用注册一个监听器
  on<K extends keyof Events>(type: K, fn: (payload: Events[K]) => void) {}
  emit<K extends keyof Events>(type: K, payload: Events[K]) {}
}
\`\`\`

> 💡 **键映射 + 泛型**是写类型安全发布订阅的核心模式。

下面 demo 实现一个类型安全的事件总线。`,
    code: `// ===== 事件处理与回调类型 demo =====

// 1) 函数类型字面量
type Handler = (data: string) => void;
const h: Handler = (data) => console.log("处理:", data);
h("hello");

// 2) 回调类型抽出来复用
type Callback = (err: Error | null, data?: string) => void;
function mockFetch(cb: Callback) {
  // 模拟异步操作
  setTimeout(() => {
    if (Math.random() > 0.5) {
      cb(null, "拿到数据");
    } else {
      cb(new Error("网络错误"));
    }
  }, 10);
}
mockFetch((err, data) => {
  if (err) console.log("回调失败:", err.message);
  else console.log("回调成功:", data);
});

// 3) 类型安全的发布订阅（核心模板）
// Events 是一个"事件名 -> 载荷类型"的映射类型
class Emitter<Events extends Record<string, unknown>> {
  private listeners: { [K: string]: Function[] } = {};

  // on：注册监听器，K 限定为 Events 的某个键
  on<K extends keyof Events>(type: K, fn: (payload: Events[K]) => void) {
    (this.listeners[type as string] ||= []).push(fn as Function);
  }

  // emit：触发事件，payload 类型必须匹配 Events[K]
  emit<K extends keyof Events>(type: K, payload: Events[K]) {
    (this.listeners[type as string] || []).forEach(fn => fn(payload));
  }
}

// 4) 定义事件映射类型
interface AppEvents {
  login: { userId: number; name: string };
  logout: { userId: number };
  message: { from: string; text: string };
}

// 5) 使用事件总线（类型完全安全）
const bus = new Emitter<AppEvents>();

// 注册 login 监听：payload 自动推断为 { userId; name }
bus.on("login", (p) => {
  console.log(\`[login] 用户 \${p.userId} (\${p.name}) 登录\`);
});

bus.on("message", (p) => {
  console.log(\`[message] \${p.from}: \${p.text}\`);
});

// 触发事件（payload 类型必须匹配，否则 IDE 报错）
setTimeout(() => {
  bus.emit("login", { userId: 1, name: "小明" });
  bus.emit("message", { from: "小红", text: "在吗？" });
  // bus.emit("login", { name: "漏了 userId" });  // ❌ 类型不对
}, 20);`,
  },

  // =========================================================
  // 第十三章：React 常用类型
  // =========================================================
  {
    id: "tsq-react-types",
    title: "React 常用类型",
    icon: "⚛️",
    group: "实战模板",
    content: `## React 常用类型：props / state / 事件 / ref

React + TS 项目里最常写的几种类型。**这份模板可以直接复制改字段。**

> ⚠️ 运行环境没有 React，本 demo 只演示类型写法，运行时用 console 模拟。

### 函数组件 + Props

\`\`\`ts
import { FC } from "react";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
}

const Button: FC<ButtonProps> = ({ text, onClick, disabled }) => {
  return null;   // 实际返回 JSX
};
\`\`\`

> 💡 \`FC\`（Function Component）可选，很多人偏好直接写函数：\`function Button(props: ButtonProps)\`。

### children 类型

\`\`\`ts
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;   // 接收任意 JSX/字符串/null
}
\`\`\`

### 事件类型

\`\`\`ts
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};
const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.clientX);
};
\`\`\`

### useState 类型

\`\`\`ts
const [count, setCount] = useState(0);              // 推断为 number
const [user, setUser] = useState<User | null>(null); // 联合类型要显式标
\`\`\`

### useRef 类型

\`\`\`ts
const inputRef = useRef<HTMLInputElement>(null);     // DOM 引用
const timerRef = useRef<number | null>(null);        // 普通值引用
\`\`\`

### 自定义 Hook 返回类型

\`\`\`ts
function useToggle(): [boolean, () => void] {
  const [on, setOn] = useState(false);
  const toggle = () => setOn(!on);
  return [on, toggle];
}
\`\`\`

下面 demo 把这些类型用法跑一遍（运行时模拟）。`,
    code: `// ===== React 常用类型模板（运行时模拟）demo =====
// 说明：运行环境无 React，这里演示类型写法，运行时用普通函数模拟。

// 1) Props 接口定义
interface ButtonProps {
  text: string;
  onClick?: () => void;     // 可选回调
  disabled?: boolean;       // 可选布尔
}

// 2) 模拟函数组件（实际 React 里返回 JSX）
function Button(props: ButtonProps) {
  console.log("渲染按钮:", props.text, props.disabled ? "(禁用)" : "");
  if (props.onClick && !props.disabled) {
    props.onClick();
  }
}
Button({ text: "提交", onClick: () => console.log("  -> 点击了提交") });
Button({ text: "取消", disabled: true });

// 3) children 类型：模拟 ReactNode（任意内容）
type ReactNode = string | number | boolean | null | undefined;
interface CardProps { title: string; children: ReactNode }
function Card({ title, children }: CardProps) {
  console.log("卡片:", title, "| 内容:", children);
}
Card({ title: "用户信息", children: "小明，20岁" });

// 4) 模拟事件类型
interface ChangeEvent<T> { target: T; }
function handleInput(e: ChangeEvent<{ value: string }>) {
  console.log("输入值:", e.target.value);
}
handleInput({ target: { value: "hello" } });

// 5) 模拟 useState（联合类型要显式标）
function useState<T>(initial: T): [T, (v: T) => void] {
  let val = initial;
  const set = (v: T) => { val = v; console.log("  setState ->", v); };
  return [val, set];
}
const [count, setCount] = useState(0);
console.log("初始 count:", count);
setCount(5);

// 联合类型必须显式标，否则推断成 null
const [user, setUser] = useState<{ name: string } | null>(null);
console.log("初始 user:", user);
setUser({ name: "小明" });

// 6) 模拟 useRef（DOM 引用）
function useRef<T>(initial: T): { current: T } {
  return { current: initial };
}
const inputRef = useRef<{ value: string } | null>(null);
console.log("初始 ref:", inputRef.current);

// 7) 模拟自定义 Hook
function useToggle(): [boolean, () => void] {
  const [on, setOn] = useState(false);
  const toggle = () => setOn(!on);
  return [on, toggle];
}
const [on, toggle] = useToggle();
console.log("初始 toggle:", on);
toggle();`,
  },

  // =========================================================
  // 第十四章：第三方库类型声明
  // =========================================================
  {
    id: "tsq-declare",
    title: "第三方库类型声明",
    icon: "📦",
    group: "实战模板",
    content: `## 第三方库类型：没有类型怎么办

大多数 npm 包自带类型或通过 \`@types/xxx\` 提供。但偶尔会遇到"无类型"的包或老 JS 代码，这时要手动声明。

### 三种情况

**情况一：包自带类型**（如 React、Lodash）
直接 import，类型自动可用。

**情况二：有 \`@types/xxx\`**（如 \`@types/node\`、\`@types/lodash\`）
\`\`\`bash
npm install --save-dev @types/lodash
\`\`\`

**情况三：完全没有类型**
需要自己写声明文件（\`.d.ts\`）或用 \`declare\`。

### 用 declare 声明模块

\`\`\`ts
// globals.d.ts
declare module "some-old-lib" {
  export function doSomething(x: string): number;
  export const version: string;
}
\`\`\`

声明后 import 就有类型了。

### 给全局对象扩展属性

\`\`\`ts
// 给 window 加自定义属性
declare global {
  interface Window {
    myAppConfig: { apiBase: string };
  }
}
window.myAppConfig = { apiBase: "/api" };
\`\`\`

### 用 declare 声明全局变量

\`\`\`ts
// 假设页面通过 <script> 注入了全局 MY_GLOBAL
declare const MY_GLOBAL: { version: string };
console.log(MY_GLOBAL.version);
\`\`\`

### 快速逃生：any 兜底

\`\`\`ts
// 实在搞不定类型时，先 any 兜底，别卡住开发
import someLib from "no-types-lib";
const result = (someLib as any).doSomething();
\`\`\`

> ⚠️ any 是逃生口，不是长期方案。能补类型就补，避免类型系统形同虚设。

下面 demo 演示 declare 的几种用法（运行时模拟）。`,
    code: `// ===== 第三方库类型声明 demo =====
// 说明：演示 declare 用法，运行时用模拟实现。

// 1) 模拟"无类型库"：先用 declare 声明模块类型
declare module "old-lib" {
  export function parse(str: string): Record<string, unknown>;
  export const version: string;
}

// 2) 模拟引入并使用（运行时用模拟实现代替真实 import）
const oldLib = {
  parse(str: string): Record<string, unknown> {
    return JSON.parse(str);
  },
  version: "1.2.3"
};
const parsed = oldLib.parse('{"name":"小明","age":20}');
console.log("old-lib version:", oldLib.version);
console.log("old-lib parse:", parsed);

// 3) 模拟给全局 Window 扩展属性
// declare global { interface Window { myConfig: { apiBase: string } } }
// 运行时用 globalThis 模拟
interface MyAppConfig { apiBase: string; env: string }
const myConfig: MyAppConfig = { apiBase: "/api/v1", env: "production" };
console.log("全局配置:", myConfig.apiBase, myConfig.env);

// 4) 模拟声明全局常量（页面注入的全局变量）
// declare const MY_GLOBAL: { version: string; build: number }
const MY_GLOBAL = { version: "2.0.0", build: 42 };   // 模拟运行时已存在
console.log("全局变量:", MY_GLOBAL.version, "build", MY_GLOBAL.build);

// 5) 实战：给普通 JS 模块补类型（ambient module 声明）
// 假设有个没类型的 npm 包 "my-utils"，我们补一份声明
declare module "my-utils" {
  export function formatDate(d: Date): string;
  export function clamp(n: number, min: number, max: number): number;
}
// 模拟实现（真实场景是 import { formatDate } from "my-utils"）
const myUtils = {
  formatDate(d: Date): string {
    return \`\${d.getFullYear()}-\${d.getMonth() + 1}-\${d.getDate()}\`;
  },
  clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
  }
};
console.log("formatDate:", myUtils.formatDate(new Date("2024-06-15")));
console.log("clamp:", myUtils.clamp(150, 0, 100));

// 6) 逃生口：any 兜底（演示用法，实际尽量少用）
interface SomeLib { doStuff(x: string): unknown }
const someLib = { doStuff: (x: string) => ({ result: x.toUpperCase() }) } as SomeLib;
const result = (someLib.doStuff("hello") as { result: string }).result;
console.log("any 兜底结果:", result);

// 7) 声明合并：给已有 interface 扩展字段
interface Window { customProp: string }
// 实际 React/浏览器环境会自动合并，这里用对象模拟
const fakeWindow: { customProp: string } = { customProp: "合并进来的" };
console.log("声明合并:", fakeWindow.customProp);`,
  },

  // =========================================================
  // 第十五章：tsconfig 关键配置
  // =========================================================
  {
    id: "tsq-tsconfig",
    title: "tsconfig 关键配置速查",
    icon: "⚙️",
    group: "实战模板",
    content: `## tsconfig.json：日常最该懂的配置

\`tsconfig.json\` 控制 TS 编译行为。**90% 项目用下面这套配置就够**，其余的用到再查。

### 推荐基础配置

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",              // 编译目标 ES 版本
    "module": "ESNext",              // 模块系统（配合打包工具）
    "moduleResolution": "bundler",   // 模块解析策略
    "strict": true,                  // ★ 开启所有严格检查
    "esModuleInterop": true,         // ★ 兼容 CommonJS 默认导入
    "skipLibCheck": true,            // 跳过 .d.ts 检查（加速）
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,       // 允许 import json
    "isolatedModules": true,         // 每文件独立编译（Vite 要求）
    "jsx": "react-jsx",              // JSX 处理（React 项目）
    "baseUrl": ".",                  // 路径解析根
    "paths": { "@/*": ["src/*"] }    // ★ 路径别名
  },
  "include": ["src"]
}
\`\`\`

### 最该懂的几个选项

| 选项 | 作用 | 建议 |
| --- | --- | --- |
| \`strict\` | 开启全部严格模式（含下面几项） | **必须开** |
| \`strictNullChecks\` | null/undefined 不能赋给其他类型 | 必须开 |
| \`noImplicitAny\` | 禁止隐式 any | 必须开 |
| \`esModuleInterop\` | 允许 \`import React from "react"\` | 建议开 |
| \`skipLibCheck\` | 跳过 node_modules 类型检查 | 建议开（加速） |
| \`resolveJsonModule\` | 可 \`import data from "./a.json"\` | 建议开 |
| \`paths\` | 路径别名 \`@/xxx\` | 建议配 |

### strict 都开了什么

\`strict: true\` 等价于同时开启：
- \`strictNullChecks\` —— 空值检查
- \`noImplicitAny\` —— 禁止隐式 any
- \`strictFunctionTypes\` —— 函数类型严格
- \`strictBindCallApply\` —— bind/call/apply 严格
- \`strictPropertyInitialization\` —— 类属性必须初始化
- \`alwaysStrict\` —— 编译出 \`"use strict"\`

### 路径别名

\`\`\`json
{ "paths": { "@/*": ["./src/*"] } }
\`\`\`

配完后可以：
\`\`\`ts
import { foo } from "@/utils";   // 等价于 src/utils
\`\`\`

> ⚠️ 别忘了在打包工具（Vite/Webpack）里也配对应的别名，否则运行时找不到模块。

### 实用技巧

- **查类型**：鼠标悬停变量，或用 \`typeof\` 提取类型
- **看编译结果**：\`tsc --noEmit\` 只检查不输出
- **watch 模式**：\`tsc --watch\` 改文件自动检查

下面 demo 演示严格模式下的典型报错场景（运行时模拟）。`,
    code: `// ===== tsconfig 关键配置效果演示 demo =====
// 说明：运行环境已开启严格模式相关转译，这里演示配置带来的类型约束。
// 注意：类型错误不会阻止运行，但在 IDE 中会标红。

// 1) strictNullChecks：null 不能赋给其他类型
let name1: string = "小明";
// name1 = null;   // ❌ IDE 报错：不能把 null 赋给 string
let name2: string | null = "小明";
name2 = null;      // ✅ 显式声明了联合类型
console.log("strictNullChecks:", name2);

// 2) noImplicitAny：禁止隐式 any
function bad(x) { return x; }   // ❌ 隐式 any（运行时不报错，IDE 标红）
function good(x: unknown) { return x; }  // ✅ 显式 unknown
console.log("noImplicitAny:", bad("hi"), good("hi"));

// 3) esModuleInterop：兼容 CommonJS 默认导入
// 模拟 import React from "react"（实际依赖此选项）
const react = { version: "18.0.0", createElement: () => null };
console.log("esModuleInterop 模拟:", react.version);

// 4) resolveJsonModule：可以 import json
// import data from "./data.json";  // 需要此选项开启
const data = { name: "小明", age: 20 };  // 这里用对象模拟
console.log("resolveJsonModule 模拟:", data.name);

// 5) paths 路径别名效果演示
// 配置 { "paths": { "@/*": ["./src/*"] } } 后：
// import { foo } from "@/utils";   // 等价于 src/utils
console.log("paths 别名：@/utils 等价于 ./src/utils");

// 6) strict 模式下类属性必须初始化
class User {
  name: string;          // ❌ 未初始化（IDE 标红）
  age: number = 0;       // ✅ 有初始值
  email!: string;        // ✅ 用 ! 断言"肯定会被赋值"

  constructor(name: string) {
    this.name = name;    // 在构造函数里赋值也算初始化
  }
}
const u = new User("小明");
console.log("类属性初始化:", u.name, u.age);

// 7) 实战：用 typeof 从已有值提取类型
const config = { host: "localhost", port: 3000, debug: true };
type Config = typeof config;   // 自动推断类型
const cfg2: Config = { host: "0.0.0.0", port: 8080, debug: false };
console.log("typeof 提取类型:", cfg2.host, cfg2.port);`,
  },
];
