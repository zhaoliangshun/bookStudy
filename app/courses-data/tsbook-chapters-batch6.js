// =============================================================
// TypeScript 全解 · Batch 6：类型守卫与窄化（5 章）
// -------------------------------------------------------------
// 本 batch 覆盖 TypeScript 类型守卫与类型窄化的完整链路：
//   1. 类型守卫           tsbook-type-guard
//   2. 自定义类型守卫     tsbook-user-defined-guard
//   3. 类型窄化           tsbook-narrowing
//   4. 判别式联合         tsbook-discriminated-union
//   5. 类型断言与 unknown tsbook-assertion
// 章节归属 group：类型守卫与窄化
// =============================================================

export const chapters = [
  // ===========================================================
  // 第 1 章：类型守卫（typeof / instanceof / in）
  // ===========================================================
  {
    id: "tsbook-type-guard",
    title: "类型守卫（typeof/instanceof/in）",
    icon: "🛡️",
    group: "类型守卫与窄化",
    content: `# 🛡️ 类型守卫（typeof / instanceof / in）

联合类型让一个变量可能是多种类型之一，但访问属性前必须**先确认到底是哪种类型**——这就是类型守卫的工作：在条件块里"告诉"编译器当前变量的真实类型。

## 一、为什么需要类型守卫

\`\`\`ts
function pad(value: string | number): string {
  // ❌ 报错：string | number 上不存在 .toFixed
  return value.toFixed(2);
}
\`\`\`

编译器只知道 \`value\` 是 \`string | number\`，访问 \`toFixed\` 会报错——\`string\` 没这个方法。必须在分支里"收窄"类型。

## 二、\`typeof\` 守卫：判断原始类型

\`\`\`ts
function pad(value: string | number): string {
  if (typeof value === "number") {
    return value.toFixed(2);    // 这里 value: number
  }
  return value.toUpperCase();   // 这里 value: string
}
\`\`\`

\`typeof\` 只能识别 \`string\` / \`number\` / \`boolean\` / \`symbol\` / \`bigint\` / \`undefined\` / \`function\` / \`object\`。注意：\`typeof null === "object"\`，是历史遗留 bug，不能用来判 \`null\`。

## 三、\`instanceof\` 守卫：判断类实例

\`\`\`ts
function format(err: Error | string): string {
  if (err instanceof Error) {
    return err.message;        // 这里 err: Error
  }
  return err.toUpperCase();    // 这里 err: string
}
\`\`\`

\`instanceof\` 检查原型链，只能用于 **class 实例**——原始类型 (\`string\` / \`number\` 等) 用不了。

## 四、\`in\` 守卫：判断属性存在

\`\`\`ts
interface Fish { swim(): void }
interface Bird { fly(): void }

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim();            // 这里 animal: Fish
  } else {
    animal.fly();             // 这里 animal: Bird
  }
}
\`\`\`

\`in\` 判断属性是否存在于对象上——最适合**形状不同的对象联合**。

## 五、三种守卫的适用场景

| 守卫 | 适用场景 | 局限 |
|------|---------|------|
| \`typeof\` | 原始类型 (\`string\`/\`number\` 等) | 无法区分类实例 |
| \`instanceof\` | class 实例 | 不能用于原始类型 |
| \`in\` | 不同形状的对象联合 | 必须有"独有属性" |

## 六、守卫的本质

类型守卫本质是**带类型信息的运行时检查**：运行时执行检查，编译时根据检查结果缩窄类型。一句话：**双重保险**——既保证运行时安全，又让编译器满意。

> *下一章，自定义类型守卫：\`x is Foo\`。*`,
    code: `// 🛡️ 类型守卫（typeof/instanceof/in）Demo

// ============================================================
// 1️⃣ typeof 守卫：判断原始类型
// ============================================================

// value 可能是 string 或 number，要分别处理
function padLeft(value: string | number, prefix: string): string {
  // typeof 判断原始类型：TS 会在这里收窄 value 的类型
  if (typeof value === "number") {
    // ✅ 在这个分支里，value 被收窄为 number
    return prefix + " ".repeat(value);   // 用 repeat 拼空格
  }
  // ✅ 走到这里 value 一定是 string
  return prefix + value;                  // 字符串直接拼
}

console.log("--- 1️⃣ typeof 守卫 ---");
console.log("padLeft(4, '->')   =", padLeft(4, "->"));
console.log("padLeft('hi', '->') =", padLeft("hi", "->"));

// typeof 也能识别 function、boolean、undefined 等
function describe(x: string | number | boolean | (() => void)): string {
  if (typeof x === "string") return "字符串：" + x;        // x: string
  if (typeof x === "number") return "数字：" + x;          // x: number
  if (typeof x === "boolean") return "布尔：" + x;         // x: boolean
  return "函数";                                            // x: () => void
}
console.log("describe('hi')   =", describe("hi"));
console.log("describe(42)     =", describe(42));
console.log("describe(true)   =", describe(true));
console.log("describe(fn)     =", describe(() => {}));

// ⚠️ typeof null === "object"，不能用来判 null
const n: string | null = Math.random() > 0.5 ? "hello" : null;
// typeof n === "object" 在 n 是 null 时为 true，但 n 不是真对象
if (n === null) {
  console.log("n 是 null");
} else {
  console.log("n 是字符串：", n.toUpperCase());   // 这里 n: string
}

// ============================================================
// 2️⃣ instanceof 守卫：判断类实例
// ============================================================

class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class NetworkError extends Error {
  constructor(public url: string, message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

// err 可能是普通 Error 或自定义错误
function handleError(err: Error | ValidationError | NetworkError): string {
  // instanceof 检查原型链：TS 在分支里收窄为具体子类
  if (err instanceof ValidationError) {
    // ✅ 这里 err: ValidationError，可以访问 field
    return "字段 [" + err.field + "] 校验失败：" + err.message;
  }
  if (err instanceof NetworkError) {
    // ✅ 这里 err: NetworkError，可以访问 url
    return "网络错误 [" + err.url + "]：" + err.message;
  }
  // ✅ 走到这里 err: Error（普通错误）
  return "未知错误：" + err.message;
}

console.log("--- 2️⃣ instanceof 守卫 ---");
console.log(handleError(new ValidationError("email", "邮箱格式错误")));
console.log(handleError(new NetworkError("https://api.x.com", "超时")));
console.log(handleError(new Error("系统异常")));

// instanceof 也能区分数组与对象（数组也是实例）
function processItems(items: string[] | object): string {
  if (items instanceof Array) {
    // ✅ items: string[]
    return "数组长度：" + items.length;
  }
  // ✅ items: object（非数组）
  return "对象 keys：" + Object.keys(items).join(",");
}
console.log("processItems(['a','b']) =", processItems(["a", "b"]));
console.log("processItems({x:1})     =", processItems({ x: 1, y: 2 }));

// ============================================================
// 3️⃣ in 守卫：判断属性是否存在
// ============================================================

interface Fish {
  swim: () => string;       // Fish 有 swim 方法
  name: string;
}

interface Bird {
  fly: () => string;        // Bird 有 fly 方法
  name: string;
}

// animal 是 Fish 或 Bird，两者形状不同
function move(animal: Fish | Bird): string {
  // in 判断属性是否存在：TS 根据独有属性收窄类型
  if ("swim" in animal) {
    // ✅ 有 swim，所以是 Fish
    return animal.name + "：" + animal.swim();
  }
  // ✅ 没有 swim，一定是 Bird
  return animal.name + "：" + animal.fly();
}

console.log("--- 3️⃣ in 守卫 ---");
console.log(move({ name: "尼莫", swim: () => "游啊游" }));
console.log(move({ name: "小鸟", fly: () => "飞呀飞" }));

// in 守卫也适合 API 响应的差异化字段
interface SuccessResponse {
  data: unknown;            // 成功响应有 data
  status: 200;
}

interface ErrorResponse {
  error: string;            // 失败响应有 error
  status: 400 | 500;
}

function handleResponse(res: SuccessResponse | ErrorResponse): string {
  if ("data" in res) {
    // ✅ 有 data 字段，是 SuccessResponse
    return "成功：" + JSON.stringify(res.data);
  }
  // ✅ 否则是 ErrorResponse
  return "失败（" + res.status + "）：" + res.error;
}

console.log("handleResponse(成功) =", handleResponse({ data: { id: 1 }, status: 200 }));
console.log("handleResponse(失败) =", handleResponse({ error: "未授权", status: 401 }));

// ============================================================
// 4️⃣ 三种守卫对比：同一个问题不同写法
// ============================================================

// 场景：处理 string | string[] 的输入
function normalize(input: string | string[]): string[] {
  // 方式 A：用 typeof（适合原始类型）
  if (typeof input === "string") {
    return [input];                // 单个字符串变成单元素数组
  }
  return input;                    // 已经是数组
}
console.log("--- 4️⃣ 守卫对比 ---");
console.log("normalize('hi')     =", normalize("hi"));
console.log("normalize(['a','b']) =", normalize(["a", "b"]));

// 方式 B：用 instanceof Array
function normalize2(input: string | string[]): string[] {
  if (input instanceof Array) {
    return input;                  // 数组直接返回
  }
  return [input];                  // 字符串包装成数组
}
console.log("normalize2('hi')     =", normalize2("hi"));

// 方式 C：用 in（数组有 length 等数组方法，但 string 也有 length，这里用 isArray 更稳）
// 实际开发中：判断数组优先用 Array.isArray
function normalize3(input: string | string[]): string[] {
  if (Array.isArray(input)) {      // Array.isArray 也是类型守卫
    return input;
  }
  return [input];
}
console.log("normalize3(['x'])    =", normalize3(["x"]));

// ============================================================
// 5️⃣ 守卫失败的情况：null 陷阱
// ============================================================

// ⚠️ typeof null === "object"，所以 typeof 不能判 null
function getValue(x: string | null): string {
  // 正确做法：显式 === null
  if (x === null) {
    return "（空）";
  }
  return x.toUpperCase();          // 这里 x: string
}

console.log("--- 5️⃣ null 陷阱 ---");
console.log("getValue('hi')  =", getValue("hi"));
console.log("getValue(null)  =", getValue(null));
`,
  },

  // ===========================================================
  // 第 2 章：自定义类型守卫
  // ===========================================================
  {
    id: "tsbook-user-defined-guard",
    title: "自定义类型守卫",
    icon: "🎯",
    group: "类型守卫与窄化",
    content: `# 🎯 自定义类型守卫

当 \`typeof\` / \`instanceof\` / \`in\` 都不够用时——比如要从 \`unknown\` 里识别一个复杂结构——就需要**自定义类型守卫**：用带 \`x is Foo\` 谓词的函数，把"判断逻辑"和"类型收窄"绑在一起。

## 一、普通布尔返回的痛点

\`\`\`ts
function isUser(x: any): boolean {
  return x && typeof x.name === "string";
}

const data: unknown = { name: "Alice" };
if (isUser(data)) {
  console.log(data.name);  // ❌ 报错：data 还是 unknown
}
\`\`\`

函数返回 \`boolean\` 时，编译器**只知道真假，不知道类型**——\`data\` 在 \`if\` 里还是 \`unknown\`。

## 二、\`x is Foo\` 谓词：把判断和收窄绑定

\`\`\`ts
function isUser(x: any): x is User {   // 返回类型是谓词
  return x && typeof x.name === "string";
}

if (isUser(data)) {
  console.log(data.name);  // ✅ 这里 data: User
}
\`\`\`

\`x is User\` 读作"如果返回 \`true\`，则 \`x\` 是 \`User\` 类型"。编译器据此收窄——这是 TS 独有的语法糖，普通 JS 没有这个能力。

## 三、谓词的本质

\`x is Foo\` 是**对编译器的承诺**：函数返回 \`true\` 时，入参 \`x\` 一定是 \`Foo\`。运行时仍是普通布尔判断，但编译时类型会收窄。

⚠️ **承诺要兑现**：如果你写 \`return true\` 但实际不是 \`Foo\`，编译器不会发现，但运行时会炸——自定义守卫的正确性由你自己保证。

## 四、和普通布尔的对比

| 维度 | 返回 \`boolean\` | 返回 \`x is Foo\` |
|------|----------------|------------------|
| 运行时行为 | 布尔判断 | 布尔判断（一样） |
| 编译时收窄 | ❌ 不收窄 | ✅ 收窄为 \`Foo\` |
| 调用方体验 | 还要再 \`as\` 一次 | 直接当 \`Foo\` 用 |
| 适用场景 | 纯逻辑判断 | 需要类型收窄 |

## 五、泛型守卫：\`isArray<T>\`

\`\`\`ts
function isArray<T>(x: any): x is T[] {
  return Array.isArray(x);
}

if (isArray<number>(data)) {
  data.forEach(n => console.log(n.toFixed()));  // ✅ n: number
}
\`\`\`

泛型 + 谓词 = 可定制的守卫，调用方决定收窄成什么类型。

## 六、何时写自定义守卫

- 处理 \`unknown\` / \`any\` 类型的外部数据
- 需要识别复杂结构的对象（API 响应、JSON 解析结果）
- 同一套判断逻辑要在多处复用
- 想让代码"自文档化"——函数名 + 谓词就是最好的类型说明

> *下一章，类型窄化的所有触发条件。*`,
    code: `// 🎯 自定义类型守卫 Demo

// ============================================================
// 1️⃣ isString：最基础的自定义守卫
// ============================================================

// 返回类型是 "x is string" —— 谓词
function isString(x: unknown): x is string {
  return typeof x === "string";     // 运行时仍是 typeof 判断
}

function process(value: unknown): string {
  if (isString(value)) {
    // ✅ value 在这里被收窄为 string
    return value.toUpperCase();     // 安全调用 string 方法
  }
  return "不是字符串";
}

console.log("--- 1️⃣ isString ---");
console.log("process('hello')  =", process("hello"));
console.log("process(42)       =", process(42));
console.log("process(null)     =", process(null));

// ============================================================
// 2️⃣ isUser：识别复杂对象结构
// ============================================================

interface User {
  id: number;
  name: string;
  email: string;
  age?: number;          // 可选字段
}

// 自定义守卫：判断 unknown 是否是合法的 User
function isUser(x: unknown): x is User {
  if (typeof x !== "object" || x === null) return false;  // 必须是非空对象
  const u = x as Record<string, unknown>;                  // 先断言为可索引类型
  return (
    typeof u.id === "number" &&         // id 必须是 number
    typeof u.name === "string" &&       // name 必须是 string
    typeof u.email === "string"         // email 必须是 string
    // age 是可选的，不强制检查
  );
}

// 处理外部 JSON 数据
function parseUser(json: string): User | null {
  const data: unknown = JSON.parse(json);    // JSON.parse 返回 unknown
  if (isUser(data)) {
    // ✅ data 被收窄为 User
    return data;
  }
  return null;
}

console.log("--- 2️⃣ isUser ---");
const valid = parseUser('{"id":1,"name":"Alice","email":"a@b.com"}');
console.log("合法用户 =", valid);
const invalid = parseUser('{"id":"x","name":"Bob"}');   // id 不是 number
console.log("非法用户 =", invalid);

// ============================================================
// 3️⃣ 泛型守卫：isArray<T>
// ============================================================

// 泛型 + 谓词：让调用方决定元素类型
function isArray<T>(x: unknown): x is T[] {
  return Array.isArray(x);           // 运行时用原生 isArray
}

// 仅判断"是不是数组"，元素类型由调用方"承诺"
function isNumberArray(x: unknown): x is number[] {
  return Array.isArray(x) && x.every(i => typeof i === "number");
}

function sumArray(arr: unknown): number {
  if (isNumberArray(arr)) {
    // ✅ arr 被收窄为 number[]
    return arr.reduce((sum, n) => sum + n, 0);   // 安全求和
  }
  return 0;
}

console.log("--- 3️⃣ 泛型守卫 ---");
console.log("sumArray([1,2,3])    =", sumArray([1, 2, 3]));
console.log("sumArray(['a','b'])  =", sumArray(["a", "b"]));
console.log("sumArray(null)       =", sumArray(null));

// ============================================================
// 4️⃣ 联合类型守卫：从多种类型里识别
// ============================================================

type Result =
  | { ok: true; data: string }
  | { ok: false; error: string };

function isSuccess(r: Result): r is { ok: true; data: string } {
  return r.ok === true;                // 判别式字段
}

function handle(r: Result): string {
  if (isSuccess(r)) {
    // ✅ r 被收窄为 { ok: true; data: string }
    return "成功：" + r.data;
  }
  // ✅ r 被收窄为 { ok: false; error: string }
  return "失败：" + r.error;
}

console.log("--- 4️⃣ 联合类型守卫 ---");
console.log(handle({ ok: true, data: "hello" }));
console.log(handle({ ok: false, error: "超时" }));

// ============================================================
// 5️⃣ 自定义守卫组合：可重用的校验工具
// ============================================================

interface Article {
  title: string;
  content: string;
  tags: string[];
}

function isArticle(x: unknown): x is Article {
  if (typeof x !== "object" || x === null) return false;
  const a = x as Record<string, unknown>;
  return (
    typeof a.title === "string" &&
    typeof a.content === "string" &&
    Array.isArray(a.tags) &&
    a.tags.every(t => typeof t === "string")   // tags 必须是 string[]
  );
}

// 从 JSON 字符串解析文章
function parseArticleList(json: string): Article[] {
  const raw: unknown = JSON.parse(json);
  if (!isArray<unknown>(raw)) return [];       // 先判断是不是数组
  return raw.filter(isArticle);                // 用守卫过滤合法文章
}

const articleJson = JSON.stringify([
  { title: "TS 入门", content: "...", tags: ["ts", "入门"] },
  { title: "JS 进阶", content: "...", tags: ["js"] },
  { foo: "这不是文章" },                        // 非法数据
]);

console.log("--- 5️⃣ 守卫组合 ---");
const articles = parseArticleList(articleJson);
console.log("解析到文章数 =", articles.length);
articles.forEach(a => console.log("  -", a.title, "| tags:", a.tags.join("/")));

// ============================================================
// 6️⃣ 自定义守卫的"承诺"陷阱
// ============================================================

// ⚠️ 守卫只是对编译器的承诺，写错了编译器发现不了
function badIsNumber(x: unknown): x is number {
  return typeof x === "string";   // 错误：明明判断的是 string，却承诺是 number
}

const data: unknown = "hello";
if (badIsNumber(data)) {
  // ❌ 编译通过，但运行时 data 其实是 string
  // data.toFixed(2);  // 运行时会炸：data.toFixed is not a function
  console.log("⚠️ 守卫承诺错误：data 实际是", typeof data);
}
`,
  },

  // ===========================================================
  // 第 3 章：类型窄化
  // ===========================================================
  {
    id: "tsbook-narrowing",
    title: "类型窄化",
    icon: "🔍",
    group: "类型守卫与窄化",
    content: `# 🔍 类型窄化

类型窄化（Narrowing）是 TypeScript 在代码分支里**根据条件逐步收窄变量类型**的过程。所有类型守卫的本质都是触发窄化——这一章把窄化的所有触发条件讲全。

## 一、什么是窄化

\`\`\`ts
function fn(x: string | number) {
  // 这里 x: string | number
  if (typeof x === "string") {
    // 这里 x: string ← 被窄化了
    x.toUpperCase();
  } else {
    // 这里 x: number ← 反向窄化
    x.toFixed();
  }
}
\`\`\`

变量在**不同的代码块里有不同的类型**——这就是窄化。它让"宽类型"在条件分支里变成"窄类型"。

## 二、五种触发窄化的方式

### 1. \`typeof\` 窄化
\`\`\`ts
if (typeof x === "string") { /* x: string */ }
\`\`\`

### 2. 真值窄化（Truthiness）
\`\`\`ts
function fn(x?: string) {
  if (x) {              // 排除了 undefined 和 ""
    x.toUpperCase();    // x: string
  }
}
\`\`\`

\`if (x)\` 排除所有 falsy 值（\`null\`/\`undefined\`/\`""\`/\`0\`/\`false\`/\`NaN\`）。

### 3. 相等性窄化（\`===\` / \`!==\`）
\`\`\`ts
function fn(x: string | null) {
  if (x === null) return;
  x.toUpperCase();    // x: string
}
\`\`\`

### 4. \`in\` 窄化
\`\`\`ts
if ("swim" in animal) { /* animal: Fish */ }
\`\`\`

### 5. \`instanceof\` 窄化
\`\`\`ts
if (e instanceof Error) { /* e: Error */ }
\`\`\`

## 三、\`switch\` 穷尽窄化

\`\`\`ts
type Status = "idle" | "loading" | "success" | "error";

function render(s: Status): string {
  switch (s) {
    case "idle":    return "等待中";     // s: "idle"
    case "loading": return "加载中";     // s: "loading"
    case "success": return "成功";       // s: "success"
    case "error":   return "失败";       // s: "error"
  }
}
\`\`\`

\`switch\` 每个 case 都会窄化为对应的字面量类型——这是判别式联合的基础（下一章细讲）。

## 四、三元表达式也能窄化

\`\`\`ts
const msg = typeof x === "string"
  ? x.toUpperCase()       // x: string
  : x.toFixed();          // x: number
\`\`\`

三元运算的两个分支分别窄化，最终结果是两个分支的联合。

## 五、\`nullish\` 窄化：\`??\` 与可选链

\`\`\`ts
function fn(x?: string) {
  const s = x ?? "default";    // 排除 null/undefined
  s.toUpperCase();              // s: string（不再是 string | undefined）
}
\`\`\`

\`??\` 只排除 \`null\` 和 \`undefined\`，比 \`||\` 更精确（\`||\` 还会排除 \`""\` / \`0\` / \`false\`）。

## 六、窄化的失效场景

\`\`\`ts
function fn(x: string | number) {
  const isStr = typeof x === "string";
  if (isStr) {
    x.toUpperCase();  // ❌ 报错！TS 不会跨变量追踪
  }
}
\`\`\`

把守卫结果存到变量里，TS 就**不再追踪**了——必须把 \`typeof\` 直接写在 \`if\` 里。

## 七、窄化的本质

窄化是**编译器的控制流分析**：跟踪每个分支里变量的类型变化。理解了窄化，联合类型才真正可用——你不再被"不知道是哪个类型"困住。

> *下一章，判别式联合：窄化的最佳实践。*`,
    code: `// 🔍 类型窄化 Demo

// ============================================================
// 1️⃣ typeof 窄化：分支里类型收窄
// ============================================================

function formatValue(x: string | number | boolean): string {
  // typeof 在每个分支里收窄 x 的类型
  if (typeof x === "string") {
    // ✅ x 被窄化为 string
    return "字符串：" + x.toUpperCase();
  }
  if (typeof x === "number") {
    // ✅ x 被窄化为 number
    return "数字：" + x.toFixed(2);
  }
  // ✅ 走到这里 x 一定是 boolean
  return "布尔：" + (x ? "是" : "否");
}

console.log("--- 1️⃣ typeof 窄化 ---");
console.log(formatValue("hi"));
console.log(formatValue(3.14159));
console.log(formatValue(true));

// ============================================================
// 2️⃣ 真值窄化（Truthiness）：排除 falsy
// ============================================================

function greet(name?: string | null): string {
  // if (name) 排除：undefined、null、""（所有 falsy 字符串）
  if (name) {
    // ✅ name 被窄化为 string（不再是 string | null | undefined）
    return "你好，" + name.toUpperCase();
  }
  return "匿名用户";
}

console.log("--- 2️⃣ 真值窄化 ---");
console.log("greet('Alice')  =", greet("Alice"));
console.log("greet('')       =", greet(""));        // 空字符串走 falsy 分支
console.log("greet(null)     =", greet(null));
console.log("greet()         =", greet());          // 不传，undefined

// ⚠️ 注意：真值窄化会排除 "" 和 0，可能不是你想要的
function count(c: number | null): string {
  if (c) {
    // ⚠️ c 是 number，但排除了 0
    return "数量：" + c;
  }
  return "无或零";        // c 可能是 0 或 null
}
console.log("count(0)  =", count(0));              // 走 falsy 分支
console.log("count(5)  =", count(5));
console.log("count(null) =", count(null));

// ============================================================
// 3️⃣ 相等性窄化：=== null / !== undefined
// ============================================================

function getLength(x: string | null): number {
  if (x === null) {
    // ✅ x 在这里被窄化为 null
    return 0;
  }
  // ✅ 走到这里 x 一定是 string（null 被排除了）
  return x.length;
}

console.log("--- 3️⃣ 相等性窄化 ---");
console.log("getLength('hello') =", getLength("hello"));
console.log("getLength(null)    =", getLength(null));

// != 也能窄化（但不推荐用 !=）
function unwrap<T>(x: T | undefined): T {
  if (x !== undefined) {
    // ✅ x 被窄化为 T
    return x;
  }
  throw new Error("值是 undefined");
}
console.log("unwrap(42) =", unwrap(42));

// ============================================================
// 4️⃣ switch 穷尽窄化：字面量联合
// ============================================================

type Direction = "up" | "down" | "left" | "right";

function getArrow(d: Direction): string {
  switch (d) {
    case "up":    // ✅ d 被窄化为 "up"
      return "↑";
    case "down":  // ✅ d 被窄化为 "down"
      return "↓";
    case "left":  // ✅ d 被窄化为 "left"
      return "←";
    case "right": // ✅ d 被窄化为 "right"
      return "→";
    default:
      // 走到这里说明 d 是 never（所有情况都覆盖了）
      const _exhaustive: never = d;   // 穷尽检查
      return _exhaustive;
  }
}

console.log("--- 4️⃣ switch 穷尽 ---");
console.log("up    ->", getArrow("up"));
console.log("down  ->", getArrow("down"));
console.log("left  ->", getArrow("left"));
console.log("right ->", getArrow("right"));

// ============================================================
// 5️⃣ 三元窄化：分支分别收窄
// ============================================================

function describe(x: string | number): string {
  // 三元的两个分支各自窄化
  return typeof x === "string"
    ? "字符串长度 " + x.length        // ✅ x: string
    : "数字保留两位 " + x.toFixed(2); // ✅ x: number
}

console.log("--- 5️⃣ 三元窄化 ---");
console.log(describe("hello"));
console.log(describe(3.14159));

// ============================================================
// 6️⃣ nullish 窄化：?? 和可选链
// ============================================================

interface Config {
  timeout?: number;       // 可选
  retry?: number;
}

function getTimeout(c: Config): number {
  // ?? 只排除 null 和 undefined，保留 0
  const t = c.timeout ?? 3000;      // ✅ t: number（不是 number | undefined）
  return t;
}

console.log("--- 6️⃣ nullish 窄化 ---");
console.log("timeout=5000 :", getTimeout({ timeout: 5000 }));
console.log("timeout=0    :", getTimeout({ timeout: 0 }));   // 0 被保留
console.log("无 timeout   :", getTimeout({}));                // 用默认 3000

// 可选链 ?. 也会窄化：访问到的是 T | undefined
interface User {
  profile?: {
    age?: number;
  };
}

function getAge(u: User): string {
  const age = u.profile?.age;        // 类型是 number | undefined
  if (age === undefined) {
    return "未知";
  }
  // ✅ age 被窄化为 number
  return age.toFixed(0) + " 岁";
}
console.log("有 profile.age :", getAge({ profile: { age: 30 } }));
console.log("无 profile      :", getAge({}));
console.log("profile 无 age  :", getAge({ profile: {} }));

// ============================================================
// 7️⃣ 窄化失效：守卫结果存到变量里就不再追踪
// ============================================================

function badNarrow(x: string | number): string {
  // ❌ 把 typeof 结果存到变量
  const isString = typeof x === "string";
  if (isString) {
    // ⚠️ TS 不会追踪 isString 的来源，x 还是 string | number
    // x.toUpperCase();  // ❌ 编译报错
    return "（无法窄化）" + x;
  }
  return String(x);
}

// ✅ 正确写法：把 typeof 直接写在 if 里
function goodNarrow(x: string | number): string {
  if (typeof x === "string") {
    return x.toUpperCase();          // ✅ 这里 x: string
  }
  return x.toFixed(2);                // ✅ 这里 x: number
}

console.log("--- 7️⃣ 窄化失效 ---");
console.log("badNarrow('hi')  =", badNarrow("hi"));
console.log("goodNarrow('hi') =", goodNarrow("hi"));
console.log("goodNarrow(42)   =", goodNarrow(42));
`,
  },

  // ===========================================================
  // 第 4 章：判别式联合
  // ===========================================================
  {
    id: "tsbook-discriminated-union",
    title: "判别式联合",
    icon: "🏷️",
    group: "类型守卫与窄化",
    content: `# 🏷️ 判别式联合

判别式联合（Discriminated Union）是 TypeScript **最强大的模式**之一：用同一个字段（叫"判别字段"）区分联合类型的各个分支，让 \`switch\` 自动窄化、让 \`never\` 自动检查穷尽。

## 一、普通联合的痛点

\`\`\`ts
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number };

function area(s: Shape): number {
  if (s.kind === "circle") {
    return Math.PI * s.radius * s.radius;   // ✅ 能收窄
  }
  return s.size * s.size;                    // ✅ 反向收窄
}
\`\`\`

关键点：每个分支都有**同名的判别字段** \`kind\`，且**字面量类型不同**（\`"circle"\` vs \`"square"\`）。TS 会用这个字段做窄化——比 \`in\` 更精确、更可读。

## 二、判别字段的规则

1. **字段名必须相同**——所有分支都用 \`kind\` / \`type\` / \`status\` 等
2. **字面量类型必须互斥**——\`"circle"\` 和 \`"square"\` 不能重叠
3. **每个分支可有独有字段**——\`radius\` 只在 \`circle\` 上

\`\`\`ts
type Result =
  | { status: "ok"; data: string }
  | { status: "error"; error: string };
//   ↑ status 是判别字段
\`\`\`

## 三、\`switch\` + 判别式联合：自动窄化

\`\`\`ts
function handle(r: Result): string {
  switch (r.status) {
    case "ok":
      return r.data;        // ✅ r 被窄化为 { status: "ok"; data: string }
    case "error":
      return r.error;       // ✅ r 被窄化为 { status: "error"; error: string }
  }
}
\`\`\`

每个 \`case\` 自动窄化为对应分支，无需手写类型守卫。

## 四、\`never\` 穷尽检查：防止漏分支

\`\`\`ts
function handle(r: Result): string {
  switch (r.status) {
    case "ok":    return r.data;
    case "error": return r.error;
    default:
      const _: never = r;   // 如果有漏掉的分支，这里会报错
      throw new Error();
  }
}
\`\`\`

如果以后给 \`Result\` 加新分支 \`{ status: "loading" }\`，\`default\` 里的 \`r\` 就不再是 \`never\`——编译器会报错，提醒你补全分支。这就是**穷尽检查**：编译器逼你处理所有情况。

## 五、实战场景

1. **状态机**：\`idle\` / \`loading\` / \`success\` / \`error\`，每个状态有不同字段
2. **API 响应**：成功有 \`data\`，失败有 \`error\`
3. **Redux Action**：\`{ type: "ADD_TODO", payload }\` / \`{ type: "REMOVE_TODO", id }\`
4. **UI 组件变体**：\`{ variant: "primary" }\` / \`{ variant: "danger" }\`

## 六、为什么说是"最强模式"

| 优势 | 说明 |
|------|------|
| 类型安全 | 漏分支编译期就报错 |
| 自动窄化 | 无需手写守卫 |
| 可扩展 | 加新分支自动提示补全 |
| 自文档化 | 字面量类型就是业务语义 |

> *下一章，类型断言与 unknown：当编译器不如你懂时怎么办。*`,
    code: `// 🏷️ 判别式联合 Demo

// ============================================================
// 1️⃣ 状态机：用判别式联合建模请求状态
// ============================================================

// 每个状态都有 status 字段（判别字段），且字面量互斥
type RequestState =
  | { status: "idle"; lastFetch: number | null }      // 空闲：上次请求时间
  | { status: "loading"; startedAt: number }          // 加载中：开始时间
  | { status: "success"; data: string; fetchedAt: number }  // 成功：数据
  | { status: "error"; error: string; code: number }; // 失败：错误信息

function renderState(state: RequestState): string {
  // switch 自动窄化：每个 case 里 state 是对应分支
  switch (state.status) {
    case "idle":
      // ✅ state: { status: "idle"; lastFetch: number | null }
      return "⏸ 等待中（上次：" + (state.lastFetch ?? "无") + "）";
    case "loading":
      // ✅ state: { status: "loading"; startedAt: number }
      return "⏳ 加载中（开始于 " + state.startedAt + "）";
    case "success":
      // ✅ state: { status: "success"; data: string; fetchedAt: number }
      return "✅ 成功：" + state.data + "（" + state.fetchedAt + "）";
    case "error":
      // ✅ state: { status: "error"; error: string; code: number }
      return "❌ 失败 [" + state.code + "]：" + state.error;
  }
}

console.log("--- 1️⃣ 状态机 ---");
console.log(renderState({ status: "idle", lastFetch: null }));
console.log(renderState({ status: "loading", startedAt: 1000 }));
console.log(renderState({ status: "success", data: "hello", fetchedAt: 2000 }));
console.log(renderState({ status: "error", error: "超时", code: 500 }));

// ============================================================
// 2️⃣ API 响应：成功/失败两条路径
// ============================================================

type ApiResponse<T> =
  | { ok: true; data: T; status: number }     // 成功分支
  | { ok: false; error: string; status: number }; // 失败分支

function processResponse<T>(res: ApiResponse<T>): string {
  if (res.ok) {
    // ✅ res 被窄化为 { ok: true; data: T; status: number }
    return "数据：" + JSON.stringify(res.data) + "（HTTP " + res.status + "）";
  }
  // ✅ res 被窄化为 { ok: false; error: string; status: number }
  return "错误：" + res.error + "（HTTP " + res.status + "）";
}

console.log("--- 2️⃣ API 响应 ---");
console.log(processResponse({ ok: true, data: { id: 1 }, status: 200 }));
console.log(processResponse({ ok: false, error: "未授权", status: 401 }));

// ============================================================
// 3️⃣ Redux Action：经典判别式联合
// ============================================================

// 所有 action 都有 type 字段（判别字段）
type TodoAction =
  | { type: "ADD_TODO"; text: string }            // 添加
  | { type: "TOGGLE_TODO"; id: number }            // 切换完成
  | { type: "REMOVE_TODO"; id: number }            // 删除
  | { type: "CLEAR_ALL" };                          // 清空

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

function todoReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case "ADD_TODO":
      // ✅ action: { type: "ADD_TODO"; text: string }
      return [
        ...state,
        { id: Date.now(), text: action.text, done: false },
      ];
    case "TOGGLE_TODO":
      // ✅ action: { type: "TOGGLE_TODO"; id: number }
      return state.map(t =>
        t.id === action.id ? { ...t, done: !t.done } : t
      );
    case "REMOVE_TODO":
      // ✅ action: { type: "REMOVE_TODO"; id: number }
      return state.filter(t => t.id !== action.id);
    case "CLEAR_ALL":
      // ✅ action: { type: "CLEAR_ALL" }
      return [];
    default:
      // 穷尽检查：如果漏了 case，action 会有剩余类型，赋值给 never 会报错
      const _exhaustive: never = action;
      return _exhaustive;
  }
}

console.log("--- 3️⃣ Redux Action ---");
let todos: Todo[] = [];
todos = todoReducer(todos, { type: "ADD_TODO", text: "学 TS" });
todos = todoReducer(todos, { type: "ADD_TODO", text: "写代码" });
console.log("添加后 =", todos);
todos = todoReducer(todos, { type: "TOGGLE_TODO", id: todos[0].id });
console.log("切换后 =", todos);
todos = todoReducer(todos, { type: "REMOVE_TODO", id: todos[0].id });
console.log("删除后 =", todos);
todos = todoReducer(todos, { type: "CLEAR_ALL" });
console.log("清空后 =", todos);

// ============================================================
// 4️⃣ never 穷尽检查：新增分支时的"强制提醒"
// ============================================================

// 假设这是已有的判别式联合
type Event =
  | { type: "click"; x: number; y: number }
  | { type: "scroll"; top: number };

function handleEvent(e: Event): string {
  switch (e.type) {
    case "click":
      return "点击 (" + e.x + ", " + e.y + ")";
    case "scroll":
      return "滚动到 " + e.top;
    default:
      // 穷尽检查：如果以后加了新事件类型（比如 "hover"），
      // 这里的 e 不再是 never，赋值就会报错——逼你补 case
      const _: never = e;
      throw new Error("未处理事件：" + _);
  }
}

console.log("--- 4️⃣ never 穷尽检查 ---");
console.log(handleEvent({ type: "click", x: 100, y: 200 }));
console.log(handleEvent({ type: "scroll", top: 50 }));

// 演示穷尽检查如何工作：
// 如果在 Event 联合里加 | { type: "hover"; target: string }
// 那么 default 里的 e 类型是 { type: "hover"; target: string }
// const _: never = e;  ← 这里会编译报错：不能把 hover 赋给 never
// 于是你被强制去补 case "hover":

// ============================================================
// 5️⃣ UI 组件变体：用判别字段控制样式
// ============================================================

type ButtonProps =
  | { variant: "primary"; onClick: () => void; label: string }
  | { variant: "danger"; onConfirm: () => void; label: string; confirmText: string }
  | { variant: "link"; href: string; label: string };

function renderButton(props: ButtonProps): string {
  switch (props.variant) {
    case "primary":
      // ✅ 只有 primary 分支才有 onClick
      return "<button onclick='primary'>" + props.label + "</button>";
    case "danger":
      // ✅ danger 分支独有 confirmText
      return "<button class='danger' confirm='" + props.confirmText + "'>" + props.label + "</button>";
    case "link":
      // ✅ link 分支独有 href
      return "<a href='" + props.href + "'>" + props.label + "</a>";
  }
}

console.log("--- 5️⃣ UI 组件变体 ---");
console.log(renderButton({ variant: "primary", onClick: () => {}, label: "提交" }));
console.log(renderButton({ variant: "danger", onConfirm: () => {}, label: "删除", confirmText: "确定删除？" }));
console.log(renderButton({ variant: "link", href: "/home", label: "首页" }));

// ============================================================
// 6️⃣ 判别式联合 vs 普通联合：对比
// ============================================================

// ❌ 普通联合：没有判别字段，要用 in 才能区分
type BadShape =
  | { radius: number }       // 圆
  | { size: number };        // 方

function badArea(s: BadShape): number {
  if ("radius" in s) {
    return Math.PI * s.radius * s.radius;   // 用 in 判断，可读性差
  }
  return s.size * s.size;
}

// ✅ 判别式联合：有统一的 kind 字段，switch 直接窄化
type GoodShape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; size: number };

function goodArea(s: GoodShape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius * s.radius;  // 自动窄化
    case "square":
      return s.size * s.size;
  }
}

console.log("--- 6️⃣ 对比 ---");
console.log("圆面积 =", goodArea({ kind: "circle", radius: 2 }).toFixed(2));
console.log("方面积 =", goodArea({ kind: "square", size: 3 }));
`,
  },

  // ===========================================================
  // 第 5 章：类型断言与 unknown
  // ===========================================================
  {
    id: "tsbook-assertion",
    title: "类型断言与 unknown",
    icon: "⚡",
    group: "类型守卫与窄化",
    content: `# ⚡ 类型断言与 unknown

类型断言（Assertion）是你**告诉编译器"我比你更懂这个值的类型"**的方式。它绕过编译器的检查，所以也是类型安全的最后一道防线——用错就埋下运行时炸弹。这一章讲清楚断言的所有用法和代价。

## 一、\`as\` 断言：最常用

\`\`\`ts
const el = document.getElementById("app") as HTMLDivElement;
// 编译器以为 el 是 HTMLDivElement，但运行时可能是 null
\`\`\`

\`as\` 把值"断言"为另一个类型——编译器**不再检查**，信你。

## 二、\`<>\` 断言：等价语法

\`\`\`ts
const el = <HTMLDivElement>document.getElementById("app");
\`\`\`

和 \`as\` 完全等价，但在 \`.tsx\` 文件里会和 JSX 冲突，所以**React 项目里只用 \`as\`**。

## 三、断言的代价

\`\`\`ts
const x = "hello" as number;   // ❌ 编译报错：string 不能断言为 number
const y = "hello" as any as number;  // ⚠️ 双重断言：绕过了检查
\`\`\`

- **合理断言**：源类型和目标类型有重叠（比如 \`string | undefined\` 断言为 \`string\`）
- **不合理断言**：编译器直接拒绝
- **双重断言**：\`as any as T\` 绕过所有限制，**极度危险**

## 四、\`unknown\` vs \`any\`

\`\`\`ts
function f1(x: any): void {
  x.foo();    // ✅ 编译通过（但运行时可能炸）
}

function f2(x: unknown): void {
  x.foo();    // ❌ 报错：unknown 上不能直接访问任何属性
  if (typeof x === "object" && x && "foo" in x) {
    (x as { foo: () => void }).foo();   // ✅ 必须先检查/断言
  }
}
\`\`\`

| 类型 | 行为 | 安全性 |
|------|------|--------|
| \`any\` | 放弃类型检查 | ❌ 不安全 |
| \`unknown\` | 强制检查后才能用 | ✅ 安全 |

\`unknown\` 是"类型安全的 \`any\`"：你不能直接用它，必须**先窄化或断言**。\`JSON.parse\` / \`fetch().json()\` 等返回 \`unknown\`，强制你做检查。

## 五、何时用断言

1. **DOM API**：\`getElementById\` 返回 \`HTMLElement | null\`，你确信存在时断言
2. **第三方库类型不准**：库的类型定义比实际窄，断言拓宽
3. **联合类型缩窄**：\`string | undefined\` → \`string\`，配合守卫使用
4. **JSON 解析**：\`unknown\` → 具体类型，**强烈建议先做守卫检查**

## 六、何时**不要**用断言

- 能用类型守卫解决就别用断言（守卫有运行时检查，断言没有）
- 能改类型定义就别用 \`as\`（治标不治本）
- 永远不要写 \`as any\`（除非你 100% 确定值是 \`any\`）

## 七、断言的本质

断言**只在编译时生效，运行时被完全擦除**——它不改变值的实际类型，只改变编译器的认知。所以：

> 断言不是类型转换。如果你断言错了，运行时该炸还是炸。

\`unknown\` 是断言的最佳搭档：先用 \`unknown\` 接住外部数据，再用守卫/断言逐步窄化——既灵活又安全。

> *至此类型守卫与窄化批次结束，下一 batch 进入类型工具与高级类型。*`,
    code: `// ⚡ 类型断言与 unknown Demo

// ============================================================
// 1️⃣ as 断言：联合类型缩窄
// ============================================================

// 模拟 DOM API：返回值是 HTMLElement | null
function getElement(id: string): HTMLElement | null {
  // 模拟实现：返回一个 div
  return { id, tagName: "DIV" } as HTMLElement;
}

// 你"确信"它存在，且是 HTMLDivElement
const app = getElement("app") as HTMLDivElement;
// ✅ 编译器以为 app 是 HTMLDivElement（运行时可能是 null 或其他元素）
console.log("--- 1️⃣ as 断言 ---");
console.log("app.tagName =", app.tagName);

// 联合类型缩窄：string | undefined -> string
function shout(name: string | undefined): string {
  // 你确信 name 不会是 undefined（比如已经在外层校验过）
  const n = name as string;
  return n.toUpperCase();
}
console.log("shout('hi') =", shout("hi"));

// ============================================================
// 2️⃣ <> 断言：等价于 as（在 .tsx 中会冲突，慎用）
// ============================================================

// <T>value 和 value as T 完全等价
const value: unknown = "hello";
const str1 = value as string;        // as 语法
// const str2 = <string>value;       // <> 语法（在 .tsx 里会和 JSX 冲突）

console.log("--- 2️⃣ <> 断言 ---");
console.log("as string =", str1.toUpperCase());

// ============================================================
// 3️⃣ unknown：类型安全的 any
// ============================================================

// any：放弃检查，啥都能干（危险）
function risky(x: any): string {
  return x.toUpperCase();    // ✅ 编译通过，但 x 可能没有 toUpperCase
}

// unknown：必须先检查/断言才能用（安全）
function safe(x: unknown): string {
  // x.toUpperCase();  // ❌ 编译报错：unknown 上不能访问属性
  if (typeof x === "string") {
    return x.toUpperCase();   // ✅ 守卫后窄化为 string
  }
  return String(x);
}

console.log("--- 3️⃣ unknown ---");
console.log("safe('hi')  =", safe("hi"));
console.log("safe(42)    =", safe(42));

// JSON.parse 返回 unknown：强制你做检查
function parseConfig(json: string): { port: number; host: string } {
  const raw: unknown = JSON.parse(json);    // unknown 类型
  // raw.port;  // ❌ 报错：unknown 上不能访问属性

  // 方式 A：用守卫逐步检查
  if (
    typeof raw === "object" && raw !== null &&
    "port" in raw && typeof (raw as any).port === "number" &&
    "host" in raw && typeof (raw as any).host === "string"
  ) {
    return raw as { port: number; host: string };   // 检查通过后断言
  }
  return { port: 3000, host: "localhost" };          // 兜底默认值
}

console.log("parseConfig =", parseConfig('{"port":8080,"host":"0.0.0.0"}'));
console.log("parseConfig(非法) =", parseConfig('"oops"'));

// ============================================================
// 4️⃣ 双重断言：as any as T（危险！）
// ============================================================

// 不合理断言：编译器直接拒绝
// const x1: string = "hello" as number;   // ❌ 报错：string 不能断言为 number

// 双重断言：先转 any 再转目标类型，绕过检查
const x2: number = "hello" as unknown as number;   // ⚠️ 编译通过，但运行时炸
console.log("--- 4️⃣ 双重断言 ---");
console.log("typeof x2 =", typeof x2, "| x2 =", x2);
// x2.toFixed();  // ❌ 运行时报错：x2.toFixed is not a function

// 双重断言的"合理"用法：跨类型系统转换
interface WindowA { x: number }
interface WindowB { y: string }
const a: WindowA = { x: 1 };
// 两个不相关类型互转：编译器拒绝，需要双重断言
const b = a as unknown as WindowB;
console.log("双重断言跨类型 =", b);

// ============================================================
// 5️⃣ unknown + 自定义守卫：最安全的组合
// ============================================================

interface User {
  id: number;
  name: string;
  email: string;
}

// 自定义守卫：从 unknown 里识别 User
function isUser(x: unknown): x is User {
  if (typeof x !== "object" || x === null) return false;
  const u = x as Record<string, unknown>;
  return (
    typeof u.id === "number" &&
    typeof u.name === "string" &&
    typeof u.email === "string"
  );
}

// 从 unknown 到 User：守卫 + 断言组合
function parseUser(json: string): User | null {
  const raw: unknown = JSON.parse(json);    // 1. 接住为 unknown
  if (isUser(raw)) {
    // 2. 守卫通过后，raw 自动收窄为 User，无需断言
    return raw;
  }
  return null;
}

console.log("--- 5️⃣ unknown + 守卫 ---");
const u = parseUser('{"id":1,"name":"Alice","email":"a@b.com"}');
console.log("合法用户 =", u);
const bad = parseUser('{"id":"x"}');
console.log("非法用户 =", bad);

// ============================================================
// 6️⃣ 断言函数：asserts x is T（运行时断言）
// ============================================================

// asserts 语法：函数不返回类型，而是"断言"入参类型
function assertIsString(x: unknown): asserts x is string {
  if (typeof x !== "string") {
    throw new Error("期望 string，实际是 " + typeof x);   // 抛错即断言失败
  }
}

function process(x: unknown): string {
  assertIsString(x);    // 调用后，x 被断言为 string
  // ✅ 后续 x 就是 string 类型
  return x.toUpperCase();
}

console.log("--- 6️⃣ asserts 断言 ---");
console.log("process('hi') =", process("hi"));
try {
  process(42);          // 运行时会抛错
} catch (e) {
  console.log("process(42) 抛错：", (e as Error).message);
}

// asserts x is T 与 x is T 的区别：
// - x is T：用在 if 里，分支内收窄
// - asserts x is T：用在调用后，后续代码都收窄（失败则抛错）

// ============================================================
// 7️⃣ 非空断言：! 后缀
// ============================================================

function getLength(s: string | null): number {
  // s! 表示"我确信 s 不是 null/undefined"
  return s!.length;     // 等价于 (s as string).length
}

console.log("--- 7️⃣ 非空断言 ---");
console.log("getLength('hello') =", getLength("hello"));
// getLength(null);  // ⚠️ 编译通过但运行时炸：Cannot read property 'length' of null

// 配合可选链使用更安全
function safeLength(s: string | null): number {
  return s?.length ?? 0;     // 可选链 + nullish 合并，运行时安全
}
console.log("safeLength(null) =", safeLength(null));

// ============================================================
// 8️⃣ 实战：从 fetch 响应解析数据
// ============================================================

// 模拟 fetch：返回 unknown 类型的 JSON
function mockFetch(): Promise<unknown> {
  return Promise.resolve({
    users: [
      { id: 1, name: "Alice", email: "a@b.com" },
      { id: 2, name: "Bob", email: "b@c.com" },
    ],
    total: 2,
  });
}

// 处理 fetch 响应：unknown -> 具体类型
async function fetchUsers(): Promise<User[]> {
  const raw: unknown = await mockFetch();    // 1. 接住为 unknown
  if (
    typeof raw === "object" && raw !== null &&
    "users" in raw && Array.isArray((raw as any).users)
  ) {
    // 2. 检查通过后断言
    const data = raw as { users: unknown[] };
    // 3. 用守卫过滤每个元素
    return data.users.filter(isUser);
  }
  return [];
}

fetchUsers().then(users => {
  console.log("--- 8️⃣ fetch 解析 ---");
  console.log("用户数 =", users.length);
  users.forEach(u => console.log("  -", u.name, "<" + u.email + ">"));
});
`,
  },
];
