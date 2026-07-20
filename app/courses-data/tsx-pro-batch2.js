// =============================================================
// TypeScript + React 全栈精通 - Batch 2: TS 函数与泛型
// =============================================================
// 覆盖 TypeScript 进阶阶段的 6 章：函数类型、函数重载、泛型基础、
// 泛型约束、类型守卫进阶、可辨识联合。所有 demo 代码均可在
// ts.transpileModule + target ES2020 + CommonJS 环境下直接运行。
// =============================================================

export const chapters = [
  {
    id: "tspro-function-types",
    group: "二、TypeScript 函数与泛型",
    icon: "🔧",
    title: "函数类型完整指南",
    content: `# 函数类型完整指南

## 一、为什么需要专门的函数类型

JS 里函数是一等公民，可以赋值、传参、返回。但 JS 没有类型约束，函数签名全靠注释和记忆。一个函数接受什么参数、返回什么值，调用方根本不知道。

\`\`\`js
// 纯 JS：调用方根本不知道要传什么
function fetchData(id, options, callback) {
  // id 是数字还是字符串？options 有哪些字段？callback 什么时候被调用？
}

// 调用方可能传错
fetchData('user-1', { method: 'GET' }, 'not a function');
\`\`\`

TS 的函数类型就是用来**精确描述函数的输入和输出**：参数有几个、每个是什么类型、返回值是什么类型。这是 TS 类型系统的核心，因为 React 组件本质就是函数，Props 就是参数。

## 二、函数声明的几种方式

TS 支持四种函数定义方式，各有适用场景：

\`\`\`tsx
// 1. 函数声明：有变量提升，可以在定义前调用
function add(a: number, b: number): number {
  return a + b;
}

// 2. 函数表达式：赋值给变量
const add2 = function (a: number, b: number): number {
  return a + b;
};

// 3. 箭头函数：没有自己的 this，适合做回调
const add3 = (a: number, b: number): number => a + b;

// 4. 函数类型字面量：用 type 定义类型，再赋值实现
type AddFn = (a: number, b: number) => number;
const add4: AddFn = (a, b) => a + b;  // 类型已声明，参数类型可省略
\`\`\`

四种方式编译后都是普通函数，区别在变量提升、this 绑定和类型推断的便利性。

| 方式 | 变量提升 | this 绑定 | 适合场景 |
|------|---------|----------|---------|
| 函数声明 | 有 | 自己的 this | 顶层工具函数 |
| 函数表达式 | 无 | 自己的 this | 回调、条件赋值 |
| 箭头函数 | 无 | 外层 this | React 组件、回调 |
| 类型字面量 | - | - | 复用函数签名 |

## 三、参数类型与返回值类型

\`\`\`tsx
// 参数类型：参数名后加 : type
// 返回值类型：参数列表后加 : type
function greet(name: string, age: number): string {
  return 'Hello, ' + name + ', you are ' + age;
}

// 返回值类型通常可以省略，TS 会自动推断
function greet2(name: string, age: number) {
  return 'Hello, ' + name;  // 推断返回 string
}

// void：函数没有返回值（或返回 undefined）
function log(msg: string): void {
  console.log(msg);
  // 没有 return
}
\`\`\`

> 经验法则：公共 API、库函数建议显式标注返回值类型（更清晰、防止实现意外改变返回类型）；内部函数可以让 TS 推断。

## 四、可选参数与默认参数

\`\`\`tsx
// 可选参数：用 ? 标记，必须放在必填参数后面
function greet(name: string, greeting?: string): string {
  return (greeting || 'Hello') + ', ' + name;
}
greet('Alice');              // OK
greet('Alice', 'Hi');        // OK

// 默认参数：直接赋默认值，TS 自动推断为可选
function greet2(name: string, greeting: string = 'Hello'): string {
  return greeting + ', ' + name;
}
greet2('Alice');             // OK，greeting 用默认值
greet2('Alice', 'Hi');       // OK
\`\`\`

| 维度 | 可选参数 \`?:\` | 默认参数 \`=\` |
|------|--------------|--------------|
| 写法 | \`greeting?: string\` | \`greeting: string = 'Hi'\` |
| 类型 | \`string\` 或 \`undefined\` | \`string\`（非 undefined） |
| 调用时不传 | 形参是 undefined | 形参是默认值 |
| 位置 | 必须在必填参数后 | 可以在必填参数前（但要传 undefined） |

## 五、剩余参数

\`\`\`tsx
// 剩余参数：用 ... 收集多个参数成数组
function sum(...nums: number[]): number {
  return nums.reduce((total, n) => total + n, 0);
}
sum(1, 2, 3);        // 6
sum(1, 2, 3, 4, 5);  // 15

// 剩余参数必须是最后一个
function log(tag: string, ...messages: string[]): void {
  console.log('[' + tag + ']', ...messages);
}
log('INFO', 'hello', 'world');  // [INFO] hello world
\`\`\`

剩余参数类型通常是数组或元组：

\`\`\`tsx
// 数组类型：收集任意多个同类型参数
function join(...parts: string[]): string { return parts.join('-'); }

// 元组类型：固定前缀 + 任意后缀
function createUser(name: string, age: number, ...tags: string[]): object {
  return { name, age, tags };
}
\`\`\`

## 六、回调函数类型

回调函数是 JS 异步编程的核心，TS 里要明确回调的签名：

\`\`\`tsx
// 简单回调：接收一个值，无返回
type Callback<T> = (value: T) => void;

function process<T>(value: T, callback: Callback<T>): void {
  callback(value);
}

// 错误优先回调（Node.js 风格）
type NodeCallback<T> = (err: Error | null, data: T | null) => void;

function readFile(path: string, cb: NodeCallback<string>): void {
  try {
    cb(null, 'file content');
  } catch (e) {
    cb(e as Error, null);
  }
}
\`\`\`

> 回调类型一定要明确「接收什么、返回什么」，否则调用方写错回调签名 TS 也帮不上忙。

## 七、函数类型字面量

函数类型字面量是描述函数签名最简洁的方式：

\`\`\`tsx
// 字面量写法：(参数列表) => 返回类型
type Mapper<T, U> = (item: T, index: number) => U;

const toLength: Mapper<string, number> = (s) => s.length;
const toUpper: Mapper<string, string> = (s) => s.toUpperCase();

// React 组件 Props 里的回调字段就是函数类型字面量
type ButtonProps = {
  onClick: (e: MouseEvent) => void;
  onHover?: (e: MouseEvent) => void;
  children: React.ReactNode;
};
\`\`\`

两种等价写法：

\`\`\`tsx
// 写法 1：type 字面量
type Fn1 = (x: number, y: number) => number;

// 写法 2：interface 调用签名
interface Fn2 {
  (x: number, y: number): number;
}
\`\`\`

**推荐用 type 字面量**，更简洁直观。

## 八、函数类型实战：React 组件

React 组件本质上是函数，Props 就是参数。理解函数类型对写 React 至关重要：

\`\`\`tsx
// 函数组件：Props 是参数，返回 JSX.Element
type UserCardProps = {
  name: string;
  age: number;
  onSelect?: (name: string) => void;
};

function UserCard({ name, age, onSelect }: UserCardProps): JSX.Element {
  return (
    <div onClick={() => onSelect?.(name)}>
      {name} - {age}
    </div>
  );
}

// 自定义 Hook：返回值用元组类型（像 useState）
function useToggle(initial: boolean): [boolean, () => void] {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue(!value);
  return [value, toggle];
}
\`\`\`

## 九、this 类型（进阶）

普通函数的 this 默认是 \`any\`，开启 \`noImplicitThis\` 后需要显式声明：

\`\`\`tsx
interface Button {
  text: string;
  onClick(this: Button, e: MouseEvent): void;
}

const btn: Button = {
  text: 'Click',
  onClick(e) {
    console.log(this.text);  // ✅ this 是 Button
  },
};
\`\`\`

\`this\` 作为第一个参数是 TS 的特殊语法，运行时不会真的传，只是给 TS 看的。箭头函数没有自己的 \`this\`，不能用这种方式声明。

## 小结

- 函数四种声明方式：函数声明、函数表达式、箭头函数、类型字面量赋值。
- 参数类型在参数名后标注，返回值类型在参数列表后标注（可省略让 TS 推断）。
- 可选参数用 \`?\`，默认参数用 \`=\`，剩余参数用 \`...\`。
- 回调函数要明确「接收什么、返回什么」。
- 函数类型字面量 \`(a: T) => U\` 是描述函数签名最简洁的方式。
- React 组件和 Hook 都是函数，Props/返回值都是函数类型的应用。
- \`this\` 类型用 \`this: Type\` 作为第一个参数声明（仅普通函数）。
`,
    code: `// 函数类型完整指南 Demo
// 演示函数声明的多种方式、参数类型、返回值、可选/默认/剩余参数、回调、函数类型字面量

// ===== 1. 函数声明的四种方式 =====
// 方式 1：函数声明，有变量提升
function add1(a: number, b: number): number {
  return a + b;
}

// 方式 2：函数表达式
const add2 = function (a: number, b: number): number {
  return a + b;
};

// 方式 3：箭头函数
const add3 = (a: number, b: number): number => a + b;

// 方式 4：用函数类型字面量 + 赋值
type AddFn = (a: number, b: number) => number;
const add4: AddFn = (a, b) => a + b;  // 类型已声明，参数类型可省略

console.log('add1(1, 2) =', add1(1, 2));
console.log('add2(3, 4) =', add2(3, 4));
console.log('add3(5, 6) =', add3(5, 6));
console.log('add4(7, 8) =', add4(7, 8));

// ===== 2. 参数类型与返回值类型 =====
// 显式标注返回值类型，更清晰
function greet(name: string, age: number): string {
  return 'Hello, ' + name + ', you are ' + age;
}

// void：函数没有返回值
function logMessage(msg: string): void {
  console.log('[LOG]', msg);
  // 没有 return，或 return undefined
}

logMessage(greet('Alice', 25));

// ===== 3. 可选参数：用 ? 标记 =====
// 可选参数必须放在必填参数后面
function formatName(first: string, last?: string): string {
  return last ? first + ' ' + last : first;
}
console.log('formatName(Alice) =', formatName('Alice'));
console.log('formatName(Alice, Smith) =', formatName('Alice', 'Smith'));

// ===== 4. 默认参数：直接赋默认值 =====
function greet2(name: string, greeting: string = 'Hello'): string {
  return greeting + ', ' + name;
}
console.log('greet2(Alice) =', greet2('Alice'));         // 用默认值
console.log('greet2(Alice, Hi) =', greet2('Alice', 'Hi'));

// ===== 5. 剩余参数：用 ... 收集成数组 =====
function sum(...nums: number[]): number {
  // nums 是 number[]，可以用 reduce 求和
  return nums.reduce((total, n) => total + n, 0);
}
console.log('sum(1,2,3) =', sum(1, 2, 3));
console.log('sum(1,2,3,4,5) =', sum(1, 2, 3, 4, 5));

// 剩余参数结合固定参数
function logWithTag(tag: string, ...messages: string[]): void {
  console.log('[' + tag + ']', messages.join(' | '));
}
logWithTag('INFO', 'hello', 'world', 'from', 'TS');

// ===== 6. 回调函数类型 =====
// 简单回调：接收一个值，无返回
type Callback<T> = (value: T) => void;

function process<T>(value: T, callback: Callback<T>): void {
  callback(value);
}
process(42, (v) => console.log('got number:', v));
process('hello', (v) => console.log('got string:', v));

// 错误优先回调（Node.js 风格）
type NodeCallback<T> = (err: Error | null, data: T | null) => void;

function readFileMock(path: string, cb: NodeCallback<string>): void {
  // 模拟：根据路径决定成功还是失败
  if (path === '/exists') {
    cb(null, 'file content here');
  } else {
    cb(new Error('file not found: ' + path), null);
  }
}
readFileMock('/exists', (err, data) => {
  if (err) console.log('readFile error:', err.message);
  else console.log('readFile success:', data);
});

// ===== 7. 函数类型字面量：复用函数签名 =====
type Mapper<T, U> = (item: T, index: number) => U;

const toLength: Mapper<string, number> = (s) => s.length;
const toUpper: Mapper<string, string> = (s) => s.toUpperCase;

const words = ['hello', 'world', 'typescript'];
console.log('lengths =', words.map(toLength));
console.log('uppers =', words.map(toUpper));

// ===== 8. 模拟 React 组件 Props（函数类型在组件中的应用）=====
type UserCardProps = {
  name: string;
  age: number;
  onSelect?: (name: string) => void;  // 可选回调
};

// 模拟一个 React 组件（用普通函数演示类型约束）
function UserCard(props: UserCardProps): string {
  let result = props.name + ' (' + props.age + ')';
  if (props.onSelect) {
    props.onSelect(props.name);  // 调用回调
  }
  return result;
}

console.log('UserCard =', UserCard({
  name: 'Alice',
  age: 25,
  onSelect: (name) => console.log('  -> selected:', name),
}));

// ===== 9. 模拟 useState 返回元组类型 =====
function useState<T>(initial: T): [T, (v: T) => void] {
  // 返回元组：当前值和 setter
  let state = initial;
  const setState = (v: T) => { state = v; };
  return [state, setState];
}

const [count, setCount] = useState(0);
console.log('initial count =', count);
setCount(10);
// 注意：state 不会同步更新（无响应式），仅演示类型

const [name, setName] = useState('Alice');
console.log('initial name =', name);

console.log('=== Demo 结束 ===');
`,
  },
  {
    id: "tspro-overloads",
    group: "二、TypeScript 函数与泛型",
    icon: "🎭",
    title: "函数重载（Overloads）",
    content: `# 函数重载（Overloads）

## 一、为什么需要函数重载

有时候同一个函数要根据传入参数的类型返回不同类型的结果。比如一个 \`formatInput\` 函数：传 string 返回 string，传 number 返回 number。用联合类型虽然能写，但 TS 推断不出精确的返回类型。

\`\`\`tsx
// 用联合类型：返回类型模糊
function formatInput(input: string | number): string | number {
  return input;
}

const r = formatInput('hello');
// r 的类型是 string | number，不能直接当 string 用
r.toUpperCase();  // ❌ 报错：number 没有 toUpperCase
\`\`\`

函数重载就是用来解决「同一函数根据参数返回不同类型」的问题：**为同一个函数提供多个类型签名**，TS 根据调用时的参数匹配最合适的签名。

## 二、重载签名 vs 实现签名

重载由两部分组成：

1. **重载签名**：多个对外暴露的函数类型（没有函数体）。
2. **实现签名**：真正的函数实现，签名要兼容所有重载。

\`\`\`tsx
// 重载签名 1：传 string 返回 string
function formatInput(input: string): string;
// 重载签名 2：传 number 返回 number
function formatInput(input: number): number;
// 实现签名：要兼容所有重载，参数和返回值用最宽泛的联合
function formatInput(input: string | number): string | number {
  return input;
}

const r1 = formatInput('hello');  // 类型是 string
const r2 = formatInput(42);       // 类型是 number
r1.toUpperCase();                 // OK
r2.toFixed(2);                    // OK
\`\`\`

### 关键规则

- **重载签名必须在实现签名前面**。
- **实现签名对外不可见**：调用方只能看到重载签名。
- **实现签名的参数和返回值必须兼容所有重载**（通常用联合类型）。

\`\`\`tsx
// ❌ 错误：实现签名不兼容
function f(x: string): string;
function f(x: number): number;
function f(x: string): string {  // ❌ 不兼容 number 重载
  return x;
}

// ✅ 正确：实现签名用联合，兼容所有重载
function f(x: string | number): string | number {
  return x;
}
\`\`\`

## 三、重载的解析顺序

TS 从上到下依次匹配重载签名，**第一个匹配成功的签名生效**：

\`\`\`tsx
function f(x: string): string;
function f(x: any): number;
function f(x: any): any {
  return typeof x === 'string' ? x : 0;
}

const r = f('hello');  // 匹配第 1 个签名，返回 string
const r2 = f(42);      // 第 1 个不匹配，匹配第 2 个，返回 number
\`\`\`

> 经验法则：把最精确的签名放前面，最宽泛的放后面。否则宽泛签名会「吃掉」精确签名。

\`\`\`tsx
// ❌ 错误顺序：any 在前面，后面的精确签名永远不会被匹配
function f(x: any): number;
function f(x: string): string;  // ❌ 永远不会被匹配
\`\`\`

## 四、字符串重载 vs 数字重载

经典场景：一个函数根据输入类型返回不同类型的结果。

\`\`\`tsx
function parseValue(input: string): string[];
function parseValue(input: number): number[];
function parseValue(input: string | number): string[] | number[] {
  if (typeof input === 'string') {
    return input.split(',');           // 字符串按逗号分割
  } else {
    return [input, input * 2, input * 3];  // 数字生成倍数数组
  }
}

const arr1 = parseValue('a,b,c');  // 类型是 string[]
const arr2 = parseValue(5);        // 类型是 number[]
\`\`\`

## 五、参数数量不同的重载

重载不仅能根据参数类型，还能根据参数数量返回不同结果：

\`\`\`tsx
function createDate(ts: number): Date;
function createDate(year: number, month: number, day: number): Date;
function createDate(tsOrYear: number, month?: number, day?: number): Date {
  if (month !== undefined && day !== undefined) {
    return new Date(tsOrYear, month, day);
  }
  return new Date(tsOrYear);
}

const d1 = createDate(1700000000000);       // 时间戳
const d2 = createDate(2024, 5, 15);         // 年月日
\`\`\`

## 六、重载与联合类型的对比

| 维度 | 联合类型 | 函数重载 |
|------|---------|---------|
| 返回类型精度 | 联合（模糊） | 精确（按签名） |
| 调用方体验 | 需要类型收窄 | 直接用精确类型 |
| 实现复杂度 | 简单 | 多写几个签名 |
| 适合场景 | 通用处理 | 类型相关性强 |

\`\`\`tsx
// 联合类型版本：返回类型模糊
function f1(x: string | number): string | number {
  return x;
}
const r1 = f1('hi');  // string | number，需要收窄

// 重载版本：返回类型精确
function f2(x: string): string;
function f2(x: number): number;
function f2(x: string | number): string | number {
  return x;
}
const r2 = f2('hi');  // string，直接用
\`\`\`

**经验法则**：如果只是「能接收多种类型」但返回类型统一，用联合类型；如果「不同参数类型对应不同返回类型」，用重载。

## 七、重载在 React 中的应用

React 里重载最常见的场景是 **\`createElement\` / \`cloneElement\`** 这类 API，根据传入类型返回不同元素。日常业务里重载用得不多，但在写库或通用工具时会用到。

\`\`\`tsx
// 一个通用的 fetch 工具：传 'json' 返回对象，传 'text' 返回字符串
function request(url: string, type: 'json'): Promise<object>;
function request(url: string, type: 'text'): Promise<string>;
function request(url: string, type: 'json' | 'text'): Promise<object | string> {
  return fetch(url).then(res => type === 'json' ? res.json() : res.text());
}

// 调用方拿到精确的返回类型
const data = await request('/api/users', 'json');  // Promise<object>
const text = await request('/api/logs', 'text');   // Promise<string>
\`\`\`

## 小结

- 重载用于「同一函数根据参数返回不同类型」的场景。
- 结构：多个重载签名 + 一个实现签名，实现签名要兼容所有重载。
- 解析顺序：从上到下匹配，第一个匹配的签名生效，精确签名放前面。
- 重载签名对外可见，实现签名对外不可见。
- 联合类型适合「通用处理」，重载适合「类型相关性强」的场景。
- React 日常业务重载用得不多，写通用工具/库时会用到。
`,
    code: `// 函数重载（Overloads）Demo
// 演示重载签名 vs 实现签名、解析顺序、字符串/数字重载、与联合类型对比

// ===== 1. 基本重载：stringOrNumber 函数 =====
// 重载签名 1：传 string 返回 string
function stringOrNumber(input: string): string;
// 重载签名 2：传 number 返回 number
function stringOrNumber(input: number): number;
// 实现签名：用联合类型，兼容所有重载
function stringOrNumber(input: string | number): string | number {
  if (typeof input === 'string') {
    return input.toUpperCase();         // 字符串转大写
  } else {
    return input * 2;                   // 数字翻倍
  }
}

// 调用时 TS 根据参数类型匹配重载签名
const strResult = stringOrNumber('hello');   // 类型是 string
const numResult = stringOrNumber(21);        // 类型是 number
console.log('stringOrNumber(hello) =', strResult);  // HELLO
console.log('stringOrNumber(21) =', numResult);     // 42

// ===== 2. 重载 vs 联合类型：返回类型精度对比 =====
// 联合类型版本：返回类型模糊
function unionVersion(input: string | number): string | number {
  return input;
}
const unionResult = unionVersion('hi');  // 类型是 string | number
console.log('unionVersion(hi) =', unionResult);

// 重载版本：返回类型精确
function overloadVersion(input: string): string;
function overloadVersion(input: number): number;
function overloadVersion(input: string | number): string | number {
  return input;
}
const overloadResult = overloadVersion('hi');  // 类型是 string
console.log('overloadVersion(hi) =', overloadResult);

// ===== 3. 重载解析顺序：精确签名放前面 =====
function pickValue(x: string): string;
function pickValue(x: number): number;
function pickValue(x: any): any {
  // 实现逻辑
  if (typeof x === 'string') return 'S:' + x;
  return 'N:' + x;
}
// TS 从上到下匹配，第一个匹配的签名生效
console.log('pickValue(abc) =', pickValue('abc'));   // 匹配第 1 个，返回 string
console.log('pickValue(99) =', pickValue(99));       // 匹配第 2 个，返回 number

// ===== 4. 参数数量不同的重载 =====
function createDate(ts: number): Date;
function createDate(year: number, month: number, day: number): Date;
function createDate(tsOrYear: number, month?: number, day?: number): Date {
  // 根据参数数量走不同分支
  if (month !== undefined && day !== undefined) {
    return new Date(tsOrYear, month, day);   // 年月日模式
  }
  return new Date(tsOrYear);                 // 时间戳模式
}
const d1 = createDate(1700000000000);        // 时间戳
const d2 = createDate(2024, 5, 15);          // 年月日
console.log('createDate(ts) =', d1.toISOString());
console.log('createDate(y,m,d) =', d2.toISOString());

// ===== 5. 字符串重载 vs 数字重载：返回不同结构 =====
function parseValue(input: string): string[];
function parseValue(input: number): number[];
function parseValue(input: string | number): string[] | number[] {
  if (typeof input === 'string') {
    return input.split(',');              // 字符串按逗号分割成数组
  } else {
    return [input, input * 2, input * 3]; // 数字生成倍数数组
  }
}
const arr1 = parseValue('a,b,c');          // 类型是 string[]
const arr2 = parseValue(5);                // 类型是 number[]
console.log('parseValue(a,b,c) =', arr1);  // ['a', 'b', 'c']
console.log('parseValue(5) =', arr2);      // [5, 10, 15]

// ===== 6. 多个重载签名：根据字面量返回不同类型 =====
function getConfig(key: 'url'): string;
function getConfig(key: 'timeout'): number;
function getConfig(key: 'retries'): number;
function getConfig(key: 'url' | 'timeout' | 'retries'): string | number {
  // 模拟配置读取
  const config = { url: 'https://api.example.com', timeout: 5000, retries: 3 };
  return config[key];
}
const url = getConfig('url');          // 类型是 string
const timeout = getConfig('timeout');  // 类型是 number
console.log('url =', url, '| timeout =', timeout);

// ===== 7. 模拟 React createElement 的重载模式 =====
// React createElement 根据 type 不同返回不同元素类型，这里用简化版演示
function createElement(type: 'div', props: { className?: string }): string;
function createElement(type: 'button', props: { onClick?: () => void; label: string }): string;
function createElement(type: string, props: any): string {
  if (type === 'div') {
    return '<div class="' + (props.className || '') + '"></div>';
  } else if (type === 'button') {
    return '<button>' + props.label + '</button>';
  }
  return '<' + type + '></' + type + '>';
}
const div = createElement('div', { className: 'container' });
const btn = createElement('button', { label: 'Click me' });
console.log('createElement(div) =', div);
console.log('createElement(button) =', btn);

// ===== 8. 重载的常见坑：实现签名对外不可见 =====
function f(x: string): string;
function f(x: number): number;
function f(x: string | number): string | number {
  return x;
}
// 调用方只能看到重载签名，看不到实现签名
// f(true);  // 报错：boolean 不匹配任何重载
console.log('f(hello) =', f('hello'));
console.log('f(42) =', f(42));

console.log('=== Demo 结束 ===');
`,
  },
  {
    id: "tspro-generics-basic",
    group: "二、TypeScript 函数与泛型",
    icon: "🧬",
    title: "泛型基础",
    content: `# 泛型基础

## 一、泛型是什么

泛型是「**类型的参数化**」：把类型也当成参数，让一个函数/类/接口能适配多种类型。可以理解为「类型的变量」。

\`\`\`tsx
// T 是类型参数，调用时才确定具体类型
function identity<T>(value: T): T {
  return value;
}

identity<string>('hello');   // T = string，返回 string
identity<number>(42);        // T = number，返回 number
identity('hello');           // 类型推断：T = string
\`\`\`

泛型让「同一个函数能处理多种类型，且类型之间保持关联」。

## 二、为什么不用 any

\`any\` 也能让函数接收任意类型，但会**丢失类型信息**：

\`\`\`tsx
// ❌ 用 any：类型信息丢失
function identityAny(value: any): any {
  return value;
}
const r = identityAny('hello');
r.toFixed();  // 不报错（any 没有检查），但运行时崩

// ✅ 用泛型：类型信息保留
function identity<T>(value: T): T {
  return value;
}
const r2 = identity('hello');
r2.toFixed();  // ❌ 报错：string 没有 toFixed
\`\`\`

| 维度 | \`any\` | 泛型 \`<T>\` |
|------|-------|------------|
| 类型安全 | 无 | 有 |
| 类型关联 | 丢失 | 保留 |
| 调用方体验 | 无补全 | 有精确类型补全 |
| 重构友好 | 不友好 | 改类型自动传播 |

> 经验法则：能用泛型就不用 \`any\`。\`any\` 是逃生舱，泛型是工具。

## 三、泛型函数：\`<T>(x: T): T\`

最基础的泛型函数：输入什么类型，返回什么类型。

\`\`\`tsx
function identity<T>(value: T): T {
  return value;
}

// 显式指定类型
const a = identity<string>('hello');   // string
const b = identity<number>(42);        // number

// 让 TS 推断（推荐）
const c = identity('hello');           // 推断 T = string
const d = identity(42);                // 推断 T = number
\`\`\`

> 习惯：尖括号 \`<T>\` 写在函数名后面。箭头函数在 \`.tsx\` 文件里要写成 \`<T,>\` 或 \`<T extends unknown>\`，避免和 JSX 冲突。

\`\`\`tsx
// .tsx 文件里箭头函数泛型
const identity = <T,>(value: T): T => value;        // 加逗号避免歧义
const identity2 = <T extends unknown>(value: T): T => value;  // 用 extends
\`\`\`

## 四、多个类型参数：\`<T, U>\`

泛型可以有多个类型参数，用逗号分隔：

\`\`\`tsx
// pair：把两个不同类型的值打包成元组
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const p1 = pair('hello', 42);        // [string, number]
const p2 = pair(true, [1, 2, 3]);    // [boolean, number[]]
\`\`\`

常见用法：键值对、Map、字典操作。

\`\`\`tsx
// 把键值列表转成对象
function toObject<K extends string, V>(entries: [K, V][]): Record<K, V> {
  const result = {} as Record<K, V>;
  for (const [k, v] of entries) {
    result[k] = v;
  }
  return result;
}

const obj = toObject([['a', 1], ['b', 2]]);  // { a: 1, b: 2 }
\`\`\`

## 五、调用时显式指定 vs 类型推断

\`\`\`tsx
function first<T>(arr: T[]): T {
  return arr[0];
}

// 显式指定
const a = first<string>(['hello', 'world']);  // string

// 类型推断（推荐）
const b = first(['hello', 'world']);          // 推断 T = string
const c = first([1, 2, 3]);                   // 推断 T = number
\`\`\`

**何时显式指定**：

1. TS 推断不出（比如空数组 \`first([])\`）。
2. 想让类型更宽泛或更精确（\`first<string | number>([1, 'a'])\`）。
3. 调用方希望明确类型契约。

其他情况让 TS 推断，代码更简洁。

## 六、泛型的常见用法

### 6.1 数组工具函数

\`\`\`tsx
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr];
}
\`\`\`

### 6.2 Promise 工具

\`\`\`tsx
function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

const r = await delay(1000, 'hello');  // 类型是 string
\`\`\`

### 6.3 React Hook 通用化

\`\`\`tsx
function useState<T>(initial: T): [T, (v: T) => void] {
  // ... 实现
  return [state, setState];
}

const [count, setCount] = useState(0);       // T = number
const [name, setName] = useState('Alice');   // T = string
\`\`\`

## 七、泛型约束的引入

泛型默认可以是任何类型，但有时候你想限制 T 的范围，比如「T 必须有 length 属性」。这就需要 \`extends\` 约束，下一章详细讲。

\`\`\`tsx
// 现在写不了：T 是任意类型，不一定有 length
function getLength<T>(value: T): number {
  return value.length;  // ❌ 报错：T 不一定有 length
}

// 用 extends 约束 T 必须有 length 属性
function getLength<T extends { length: number }>(value: T): number {
  return value.length;  // ✅ OK
}
getLength('hello');     // 5
getLength([1, 2, 3]);   // 3
\`\`\`

## 小结

- 泛型是「类型的参数化」，让函数/类/接口适配多种类型。
- 相比 \`any\`：泛型保留类型信息，类型安全。
- 基础语法：\`<T>(value: T): T\`，T 是类型参数。
- 多个类型参数：\`<T, U>\`，用逗号分隔。
- 调用时可以显式指定类型，也可以让 TS 推断（推荐）。
- 常见用法：数组工具、Promise 工具、React Hook 通用化。
- 想限制 T 的范围，用 \`extends\` 约束（下一章详讲）。
`,
    code: `// 泛型基础 Demo
// 演示泛型函数、多类型参数、显式指定 vs 类型推断、常见用法

// ===== 1. identity：最基础的泛型函数 =====
function identity<T>(value: T): T {
  // T 是类型参数，调用时确定具体类型
  return value;
}

// 显式指定类型
const strId = identity<string>('hello');           // 类型是 string
const numId = identity<number>(42);                // 类型是 number
console.log('identity<string> =', strId);
console.log('identity<number> =', numId);

// 让 TS 类型推断（推荐）
const inferred = identity('world');                // 推断 T = string
const inferredNum = identity(100);                 // 推断 T = number
console.log('inferred =', inferred, '| inferredNum =', inferredNum);

// ===== 2. any vs 泛型：类型安全对比 =====
function identityAny(value: any): any {
  // any 丢失类型信息
  return value;
}
const fromAny = identityAny('hello');              // 类型是 any
console.log('identityAny(hello) =', fromAny);
// fromAny.toFixed();  // 不报错，但运行时崩

// 泛型保留类型信息
const fromGeneric = identity('hello');             // 类型是 string
// fromGeneric.toFixed();  // 报错：string 没有 toFixed
console.log('identity(hello) =', fromGeneric);

// ===== 3. pair：多个类型参数 <T, U> =====
function pair<T, U>(first: T, second: U): [T, U] {
  // 把两个不同类型的值打包成元组
  return [first, second];
}
const p1 = pair('hello', 42);                      // [string, number]
const p2 = pair(true, [1, 2, 3]);                  // [boolean, number[]]
console.log('pair(hello, 42) =', p1);
console.log('pair(true, [1,2,3]) =', p2);

// ===== 4. firstElement：从数组取元素，保留元素类型 =====
function firstElement<T>(arr: T[]): T {
  // T 是数组元素类型
  return arr[0];
}
const firstStr = firstElement(['a', 'b', 'c']);    // T = string
const firstNum = firstElement([1, 2, 3]);          // T = number
console.log('firstElement(str[]) =', firstStr);
console.log('firstElement(num[]) =', firstNum);

// ===== 5. map：转换数组元素类型 =====
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  // 输入 T[]，转换成 U[]
  const result: U[] = [];
  for (const item of arr) {
    result.push(fn(item));
  }
  return result;
}
const lengths = map(['hello', 'world', 'ts'], (s) => s.length);  // number[]
console.log('map lengths =', lengths);
const uppers = map(['hello', 'world'], (s) => s.toUpperCase());  // string[]
console.log('map uppers =', uppers);

// ===== 6. filter：过滤数组 =====
function filter<T>(arr: T[], predicate: (item: T) => boolean): T[] {
  const result: T[] = [];
  for (const item of arr) {
    if (predicate(item)) {
      result.push(item);
    }
  }
  return result;
}
const evens = filter([1, 2, 3, 4, 5, 6], (n) => n % 2 === 0);
console.log('filter evens =', evens);
const longWords = filter(['hi', 'hello', 'world', 'ts'], (s) => s.length > 2);
console.log('filter longWords =', longWords);

// ===== 7. reduce：聚合数组 =====
function reduce<T, U>(arr: T[], fn: (acc: U, item: T) => U, initial: U): U {
  let acc = initial;
  for (const item of arr) {
    acc = fn(acc, item);
  }
  return acc;
}
const sumResult = reduce([1, 2, 3, 4, 5], (acc, n) => acc + n, 0);     // number
const joined = reduce(['a', 'b', 'c'], (acc, s) => acc + s, ''); // string
console.log('reduce sum =', sumResult);
console.log('reduce joined =', joined);

// ===== 8. 模拟 React useState：泛型在 Hook 中的应用 =====
function useState<T>(initial: T): [T, (v: T) => void] {
  // 返回元组：当前值和 setter
  let state = initial;
  const setState = (v: T) => { state = v; };
  return [state, setState];
}
const [count, setCount] = useState(0);             // T = number
const [name, setName] = useState('Alice');         // T = string
console.log('useState count =', count, '| name =', name);
setCount(10);
setName('Bob');
// 注意：state 不会同步更新（无响应式），仅演示类型

// ===== 9. Promise 工具：泛型在异步中的应用 =====
function delay<T>(ms: number, value: T): Promise<T> {
  // 延迟 ms 毫秒后返回 value
  return new Promise(resolve => {
    setTimeout(() => resolve(value), ms);
  });
}
// 同步演示：直接调用 Promise.then
delay(10, 'hello').then(v => console.log('delay resolved =', v));
delay(10, 42).then(v => console.log('delay resolved num =', v));

// ===== 10. 泛型约束的引入：T 默认是任意类型 =====
function getLength<T extends { length: number }>(value: T): number {
  // 用 extends 约束 T 必须有 length 属性
  return value.length;
}
console.log('getLength(hello) =', getLength('hello'));     // string 有 length
console.log('getLength([1,2,3]) =', getLength([1, 2, 3])); // 数组有 length
// getLength(42);  // 报错：number 没有 length

console.log('=== Demo 结束 ===');
`,
  },
  {
    id: "tspro-generic-constraints",
    group: "二、TypeScript 函数与泛型",
    icon: "🎢",
    title: "泛型约束（extends + keyof）",
    content: `# 泛型约束（extends + keyof）

## 一、为什么需要泛型约束

泛型默认可以是任何类型，但有时候你想限制 T 的范围。比如「T 必须有 length 属性」、「T 必须是某个接口的子类型」。这时用 \`extends\` 给泛型加约束。

\`\`\`tsx
// 没有约束：T 是任意类型，访问 length 会报错
function getLength<T>(value: T): number {
  return value.length;  // ❌ 报错：T 不一定有 length
}

// 加约束：T 必须有 length 属性
function getLength<T extends { length: number }>(value: T): number {
  return value.length;  // ✅ OK
}
getLength('hello');     // 5
getLength([1, 2, 3]);   // 3
// getLength(42);       // ❌ 报错：number 没有 length
\`\`\`

## 二、\`<T extends SomeType>\` 的含义

\`T extends SomeType\` 表示「T 必须是 SomeType 的子类型」，即 T 至少要有 SomeType 描述的结构。

\`\`\`tsx
// 约束 T 必须有 name 字段
function printName<T extends { name: string }>(obj: T): void {
  console.log(obj.name);
}
printName({ name: 'Alice' });                  // ✅ OK
printName({ name: 'Bob', age: 25 });           // ✅ OK（额外的字段不影响）
// printName({ age: 25 });                     // ❌ 报错：缺 name
\`\`\`

### 约束的本质：缩小 T 的范围

\`\`\`tsx
// T extends string：T 只能是 string 或 string 的子类型（字面量）
function shout<T extends string>(s: T): T {
  return s.toUpperCase() as T;
}
shout('hello');           // ✅ OK
shout('hello' as 'hi');   // ✅ OK，'hi' 是 string 的子类型
// shout(42);             // ❌ 报错：number 不是 string 的子类型
\`\`\`

## 三、用 extends 限制 T 的范围

extends 后面可以跟任意类型：原始类型、对象类型、联合类型、其他泛型等。

\`\`\`tsx
// 1. 约束为对象类型
function getField<T extends { id: number }>(obj: T): number {
  return obj.id;
}

// 2. 约束为函数类型
function callFn<T extends (...args: any[]) => any>(fn: T, ...args: any[]): any {
  return fn(...args);
}

// 3. 约束为其他泛型参数
function copy<T extends U, U>(source: U): T {
  return source as T;  // U 是 T 的父类型
}
\`\`\`

## 四、\`keyof T\`：取键的联合

\`keyof T\` 是 TS 的「键提取操作符」，把对象类型 T 的所有键提取成一个联合类型。

\`\`\`tsx
type User = { name: string; age: number; active: boolean };
type UserKeys = keyof User;  // 'name' | 'age' | 'active'

let k: UserKeys = 'name';    // ✅ OK
k = 'age';                   // ✅ OK
// k = 'email';              // ❌ 报错：'email' 不是 User 的键
\`\`\`

\`keyof\` 在泛型里非常有用：让函数参数「必须是对象的某个键」。

\`\`\`tsx
function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user: User = { name: 'Alice', age: 25, active: true };
getValue(user, 'name');    // ✅ 返回 string
getValue(user, 'age');     // ✅ 返回 number
// getValue(user, 'email');  // ❌ 报错：'email' 不是 User 的键
\`\`\`

## 五、\`T[K]\`：索引访问类型

\`T[K]\` 表示「对象类型 T 中键 K 对应的属性的类型」，叫做**索引访问类型**。

\`\`\`tsx
type User = { name: string; age: number; active: boolean };

type NameType = User['name'];    // string
type AgeType = User['age'];      // number
type MultiType = User['name' | 'age'];  // string | number
\`\`\`

在泛型函数里，\`T[K]\` 让返回类型自动跟随键的类型：

\`\`\`tsx
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user: User = { name: 'Alice', age: 25, active: true };

const name = getProperty(user, 'name');    // 类型是 string
const age = getProperty(user, 'age');      // 类型是 number
const active = getProperty(user, 'active'); // 类型是 boolean
\`\`\`

> 这就是 TS 类型系统的精妙之处：返回类型由参数（键）自动决定，调用方拿到精确类型。

## 六、\`extends keyof\` 的经典用法 getProperty

\`getProperty\` 是泛型约束最经典的例子，组合了 \`keyof\`、\`T[K]\` 和 \`extends\`：

\`\`\`tsx
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
\`\`\`

逐部分解析：

- \`<T>\`：泛型参数，表示对象类型。
- \`<K extends keyof T>\`：K 必须是 T 的某个键。
- \`(obj: T, key: K)\`：参数 obj 是 T 类型，key 是 K 类型。
- \`T[K]\`：返回类型是 obj[key] 的类型。

\`\`\`tsx
const user = { name: 'Alice', age: 25, email: 'a@b.com' };

const name = getProperty(user, 'name');     // string
const age = getProperty(user, 'age');       // number
// getProperty(user, 'phone');             // ❌ 报错：'phone' 不是键
\`\`\`

## 七、setProperty：泛型约束的进阶用法

\`\`\`tsx
function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]): T {
  obj[key] = value;  // ✅ value 类型必须和 obj[key] 一致
  return obj;
}

const user = { name: 'Alice', age: 25 };
setProperty(user, 'name', 'Bob');    // ✅ OK
// setProperty(user, 'name', 42);    // ❌ 报错：name 是 string，不能赋 number
// setProperty(user, 'email', 'a');  // ❌ 报错：'email' 不是键
\`\`\`

## 八、pickProperty：用泛型约束实现 pick

\`\`\`tsx
// 从对象中挑出指定的键，返回新对象
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

const user = { name: 'Alice', age: 25, email: 'a@b.com', active: true };
const picked = pick(user, ['name', 'age']);
// picked 类型是 { name: string; age: number }
console.log(picked.name, picked.age);
// picked.email;  // ❌ 报错：email 没被挑出
\`\`\`

## 九、泛型约束在 React 中的应用

### 9.1 通用的表单 Hook

\`\`\`tsx
function useForm<T extends Record<string, any>>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const setField = <K extends keyof T>(key: K, value: T[K]) => {
    setValues({ ...values, [key]: value });
  };
  return { values, setField };
}

const form = useForm({ name: '', age: 0 });
form.setField('name', 'Alice');    // ✅ OK
form.setField('age', 25);          // ✅ OK
// form.setField('name', 42);      // ❌ 报错：name 是 string
// form.setField('email', 'a');    // ❌ 报错：'email' 不是键
\`\`\`

### 9.2 通用的 Event Bus

\`\`\`tsx
type EventMap = { login: User; logout: void; message: string };

class EventBus<T extends Record<string, any>> {
  private listeners: { [K in keyof T]?: ((data: T[K]) => void)[] } = {};
  
  on<K extends keyof T>(event: K, cb: (data: T[K]) => void) {
    // ... 注册监听
  }
  
  emit<K extends keyof T>(event: K, data: T[K]) {
    // ... 触发事件
  }
}
\`\`\`

## 小结

- \`<T extends SomeType>\`：给泛型加约束，T 必须是 SomeType 的子类型。
- \`keyof T\`：提取 T 的所有键，返回键的联合类型。
- \`T[K]\`：索引访问类型，取 T 中键 K 对应的属性类型。
- \`extends keyof\`：经典组合，让参数「必须是对象的某个键」，返回类型自动跟随。
- 经典用法：\`getProperty\`、\`setProperty\`、\`pick\`。
- React 应用：表单 Hook、Event Bus、通用状态管理。
`,
    code: `// 泛型约束（extends + keyof）Demo
// 演示 extends 约束、keyof 取键、T[K] 索引访问、getProperty / setProperty / pick

// ===== 1. extends 基础约束：T 必须有 length 属性 =====
function getLength<T extends { length: number }>(value: T): number {
  // 用 extends 约束 T 至少要有 length: number 字段
  return value.length;
}
console.log('getLength(hello) =', getLength('hello'));        // string 有 length
console.log('getLength([1,2,3]) =', getLength([1, 2, 3]));   // 数组有 length
// getLength(42);  // 报错：number 没有 length

// ===== 2. extends 约束为对象类型：T 必须有 name 字段 =====
function printName<T extends { name: string }>(obj: T): string {
  // T 至少要有 name: string 字段
  return obj.name;
}
console.log('printName({name:Alice}) =', printName({ name: 'Alice' }));
console.log('printName({name:Bob, age:25}) =', printName({ name: 'Bob', age: 25 }));
// printName({ age: 25 });  // 报错：缺 name

// ===== 3. keyof：提取对象的所有键 =====
type User = { name: string; age: number; active: boolean };
type UserKeys = keyof User;  // 'name' | 'age' | 'active'

let k: UserKeys = 'name';    // OK
k = 'age';                   // OK
// k = 'email';              // 报错：'email' 不是 User 的键
console.log('UserKeys sample =', k);

// ===== 4. T[K]：索引访问类型 =====
type NameType = User['name'];    // string
type AgeType = User['age'];      // number
type MultiType = User['name' | 'age'];  // string | number
const nameSample: NameType = 'Alice';
const ageSample: AgeType = 25;
console.log('NameType =', nameSample, '| AgeType =', ageSample);

// ===== 5. getProperty：extends keyof 的经典用法 =====
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  // K 必须是 T 的某个键，返回类型 T[K] 自动跟随
  return obj[key];
}
const user: User = { name: 'Alice', age: 25, active: true };
const userName = getProperty(user, 'name');     // 类型是 string
const userAge = getProperty(user, 'age');       // 类型是 number
const userActive = getProperty(user, 'active'); // 类型是 boolean
console.log('userName =', userName, '| userAge =', userAge, '| userActive =', userActive);
// getProperty(user, 'email');  // 报错：'email' 不是键

// ===== 6. setProperty：泛型约束 + 索引赋值 =====
function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]): T {
  // value 的类型必须和 obj[key] 一致
  obj[key] = value;
  return obj;
}
const user2 = { name: 'Alice', age: 25 };
setProperty(user2, 'name', 'Bob');    // OK
setProperty(user2, 'age', 30);        // OK
// setProperty(user2, 'name', 42);    // 报错：name 是 string
console.log('setProperty result =', user2);

// ===== 7. pickProperty：从对象挑出指定的键 =====
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  // Pick 是 TS 内置工具类型，挑出指定键组成新类型
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}
const fullUser = { name: 'Alice', age: 25, email: 'a@b.com', active: true };
const picked = pick(fullUser, ['name', 'age']);
// picked 类型是 { name: string; age: number }
console.log('picked =', picked);
// picked.email;  // 报错：email 没被挑出

// ===== 8. 泛型约束结合联合类型 =====
function getElement<T extends string | number>(arr: T[], index: number): T | undefined {
  // T 必须是 string 或 number 的子类型
  return arr[index];
}
const strArr = getElement(['a', 'b', 'c'], 0);   // T = string
const numArr = getElement([1, 2, 3], 1);          // T = number
console.log('getElement(strArr, 0) =', strArr);
console.log('getElement(numArr, 1) =', numArr);

// ===== 9. 多个约束：T extends U =====
function merge<T extends U, U>(target: U, source: T): T & U {
  // T 必须是 U 的子类型
  return { ...target, ...source };
}
const merged = merge({ name: 'Alice' }, { name: 'Bob', age: 25 });
console.log('merge result =', merged);

// ===== 10. 模拟 React useForm：泛型约束在 Hook 中的应用 =====
function useForm<T extends Record<string, any>>(initial: T): {
  values: T;
  setField: <K extends keyof T>(key: K, value: T[K]) => void;
} {
  // T 必须是对象（Record<string, any>）
  let values = initial;
  const setField = <K extends keyof T>(key: K, value: T[K]) => {
    // key 必须是 T 的键，value 必须是对应类型
    values = { ...values, [key]: value };
  };
  return { values, setField };
}

const form = useForm({ name: '', age: 0, active: false });
console.log('initial form =', form.values);
form.setField('name', 'Alice');   // OK
form.setField('age', 25);         // OK
form.setField('active', true);    // OK
// form.setField('name', 42);     // 报错：name 是 string
// form.setField('email', 'a');   // 报错：'email' 不是键
console.log('form after set =', form.values);

console.log('=== Demo 结束 ===');
`,
  },
  {
    id: "tspro-type-guards",
    group: "二、TypeScript 函数与泛型",
    icon: "🛡️",
    title: "类型守卫进阶（typeof / instanceof / in / 自定义守卫）",
    content: `# 类型守卫进阶（typeof / instanceof / in / 自定义守卫）

## 一、为什么需要类型守卫

TS 的联合类型只能访问「所有成员共有的属性」。要用某个成员特有的属性，必须先**收窄类型**。类型守卫就是用来收窄类型的代码模式。

\`\`\`tsx
type Cat = { meow: () => void; name: string };
type Dog = { bark: () => void; name: string };

function speak(animal: Cat | Dog) {
  // animal.meow();  // ❌ 报错：Dog 没有 meow
  // animal.bark();  // ❌ 报错：Cat 没有 bark

  // 用 in 守卫收窄
  if ('meow' in animal) {
    animal.meow();   // ✅ 这里 animal 是 Cat
  } else {
    animal.bark();   // ✅ 这里 animal 是 Dog
  }
}
\`\`\`

TS 提供四种类型守卫：

1. \`typeof\`：判断原始类型。
2. \`instanceof\`：判断类的实例。
3. \`in\`：判断对象是否有某属性。
4. **自定义守卫**：用 \`x is Foo\` 写自己的判断逻辑。

## 二、typeof 守卫的局限

\`typeof\` 只能识别 8 种原始类型：\`string\`、\`number\`、\`boolean\`、\`symbol\`、\`bigint\`、\`undefined\`、\`function\`、\`object\`。

\`\`\`tsx
function process(value: string | number) {
  if (typeof value === 'string') {
    value.toUpperCase();   // ✅ 这里 value 是 string
  } else {
    value.toFixed(2);      // ✅ 这里 value 是 number
  }
}
\`\`\`

### typeof 的局限

\`\`\`tsx
// 1. typeof null 是 'object'（JS 历史 bug）
const x: string | null = null;
if (typeof x === 'object') {
  x;  // 这里 x 仍然是 string | null，没收窄
}
// 正确做法：用 === null
if (x === null) {
  x;  // 这里 x 是 null
} else {
  x;  // 这里 x 是 string
}

// 2. typeof 区分不出具体对象类型
type User = { name: string };
type Product = { price: number };
function handle(x: User | Product) {
  if (typeof x === 'object') {
    // x 仍然是 User | Product，没进一步收窄
    // x.name;  // ❌ 报错
  }
}
\`\`\`

> 经验法则：\`typeof\` 只适合判断原始类型。判断对象类型用 \`in\` 或自定义守卫。

## 三、instanceof 守卫：适合类

\`instanceof\` 判断对象是否是某个类的实例，适合「类产生的对象」。

\`\`\`tsx
class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
  }
}
class NetworkError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

function handleError(err: ValidationError | NetworkError) {
  if (err instanceof ValidationError) {
    err.field;        // ✅ 这里 err 是 ValidationError
  } else {
    err.statusCode;   // ✅ 这里 err 是 NetworkError
  }
}
\`\`\`

### instanceof 也适用于内置类

\`\`\`tsx
function process(x: Date | string) {
  if (x instanceof Date) {
    x.getTime();      // ✅ Date 方法
  } else {
    x.toUpperCase();  // ✅ string 方法
  }
}

function isArr(x: any[] | any) {
  return x instanceof Array;
}
\`\`\`

> 注意：\`instanceof\` 只能判断类，不能判断 \`type\` 定义的纯类型（因为 type 在运行时不存在）。

## 四、in 守卫：适合对象

\`in\` 判断对象是否有某属性，适合「字面量对象 / 接口对象」。

\`\`\`tsx
type Cat = { meow: () => void; name: string };
type Dog = { bark: () => void; name: string };

function speak(animal: Cat | Dog) {
  if ('meow' in animal) {
    animal.meow();    // ✅ 这里 animal 是 Cat
  } else {
    animal.bark();    // ✅ 这里 animal 是 Dog
  }
}

// 用于判别联合
type ApiResponse =
  | { status: 'success'; data: string }
  | { status: 'error'; message: string };

function handle(res: ApiResponse) {
  if ('data' in res) {
    res.data;         // ✅ 有 data
  } else {
    res.message;      // ✅ 有 message
  }
}
\`\`\`

> \`in\` 比 \`instanceof\` 更通用，因为它不依赖类。但要注意：\`in\` 只能判断「属性是否存在」，不能判断属性的类型。

## 五、自定义类型守卫：\`x is Foo\`

当 \`typeof\`、\`instanceof\`、\`in\` 都不够用时，可以写**自定义类型守卫**。语法是：\`x is Foo\`，叫做**类型谓词**。

\`\`\`tsx
// 自定义守卫：返回 boolean，但用「x is User」声明类型收窄
function isUser(x: any): x is User {
  return x
    && typeof x === 'object'
    && typeof x.name === 'string'
    && typeof x.age === 'number';
}

const data: unknown = JSON.parse('{"name":"Alice","age":25}');

if (isUser(data)) {
  data.name;   // ✅ 这里 data 被收窄为 User
  data.age;    // ✅
} else {
  // data 仍然是 unknown
}
\`\`\`

### 类型谓词的写法

\`\`\`tsx
function isFoo(x: any): x is Foo {
  // 返回 boolean：true 表示 x 是 Foo，false 表示不是
  return /* 判断逻辑 */;
}
\`\`\`

- 函数返回类型写成 \`x is Foo\`，而不是 \`boolean\`。
- 函数体返回一个 boolean 表达式。
- TS 看到 \`if (isFoo(x))\` 时，在 if 分支里把 x 收窄为 Foo。

## 六、自定义守卫的常见用法

### 6.1 验证 API 响应

\`\`\`tsx
type User = { id: number; name: string; email: string };

function isUser(x: unknown): x is User {
  return (
    typeof x === 'object' && x !== null &&
    'id' in x && typeof x.id === 'number' &&
    'name' in x && typeof x.name === 'string' &&
    'email' in x && typeof x.email === 'string'
  );
}

function isUserArray(x: unknown): x is User[] {
  return Array.isArray(x) && x.every(isUser);
}

// 使用
const response: unknown = await fetch('/api/users').then(r => r.json());
if (isUserArray(response)) {
  response[0].name;  // ✅ 这里 response 是 User[]
}
\`\`\`

### 6.2 区分联合类型

\`\`\`tsx
type Result = 
  | { ok: true; data: string }
  | { ok: false; error: Error };

function isSuccess(r: Result): r is { ok: true; data: string } {
  return r.ok === true;
}

function handle(r: Result) {
  if (isSuccess(r)) {
    r.data;    // ✅ 这里 r 是 success 分支
  } else {
    r.error;   // ✅ 这里 r 是 error 分支
  }
}
\`\`\`

### 6.3 React 子节点过滤

\`\`\`tsx
function isElement<T>(child: React.ReactNode): child is React.ReactElement<T> {
  return React.isValidElement(child);
}

// 过滤 React children 里的有效元素
React.Children.forEach(children, (child) => {
  if (isElement(child)) {
    // child 是 React.ReactElement，可以访问 props
    console.log(child.props);
  }
});
\`\`\`

## 七、自定义守卫的复用

自定义守卫最大的价值是**复用**：写一次，到处用，类型自动收窄。

\`\`\`tsx
// 定义一组守卫，集中管理
const guards = {
  isString: (x: unknown): x is string => typeof x === 'string',
  isNumber: (x: unknown): x is number => typeof x === 'number',
  isUser: (x: unknown): x is User => /* ... */,
  isUserArray: (x: unknown): x is User[] => Array.isArray(x) && x.every(guards.isUser),
};

// 任意地方都能用
function process(data: unknown) {
  if (guards.isString(data)) {
    data.toUpperCase();  // ✅
  }
  if (guards.isUserArray(data)) {
    data[0].name;        // ✅
  }
}
\`\`\`

## 八、四种守卫的对比

| 守卫 | 适用场景 | 局限 | 写法 |
|------|---------|------|------|
| \`typeof\` | 原始类型 | 只能识别 8 种，null 是 'object' | \`typeof x === 'string'\` |
| \`instanceof\` | 类的实例 | 只能判断类，不能判断 type | \`x instanceof Date\` |
| \`in\` | 对象属性 | 只判断属性存在，不判断类型 | \`'key' in x\` |
| 自定义 | 任意复杂判断 | 需要手写判断逻辑 | \`x is Foo\` |

**优先级**：能用 \`typeof/instanceof/in\` 就用，写不了再自定义。自定义守卫适合「复杂结构验证」和「复用」场景。

## 小结

- \`typeof\`：判断原始类型，但对 \`null\` 和对象类型有局限。
- \`instanceof\`：判断类的实例，适合类产生的对象。
- \`in\`：判断对象是否有某属性，适合字面量对象和接口对象。
- 自定义守卫 \`x is Foo\`：写自己的判断逻辑，类型谓词让 TS 收窄类型。
- 自定义守卫最大的价值是**复用**：写一次到处用。
- 实战场景：验证 API 响应、区分联合类型、过滤 React 子节点。
`,
    code: `// 类型守卫进阶 Demo
// 演示 typeof / instanceof / in / 自定义守卫（x is Foo）

// ===== 1. typeof 守卫：判断原始类型 =====
function processValue(value: string | number): string {
  // typeof 收窄：TS 根据判断自动推断更精确的类型
  if (typeof value === 'string') {
    return value.toUpperCase();          // 这里 value 是 string
  } else {
    return value.toFixed(2);             // 这里 value 是 number
  }
}
console.log('processValue(hello) =', processValue('hello'));     // HELLO
console.log('processValue(3.14) =', processValue(3.14));         // 3.14

// typeof 判断 undefined
function safeAccess(obj: { x?: number }): number {
  if (typeof obj.x === 'number') {
    return obj.x * 2;                    // 这里 obj.x 是 number
  }
  return 0;                              // obj.x 是 undefined
}
console.log('safeAccess({x:5}) =', safeAccess({ x: 5 }));
console.log('safeAccess({}) =', safeAccess({}));

// ===== 2. instanceof 守卫：判断类的实例 =====
class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
  }
}
class NetworkError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

function handleError(err: ValidationError | NetworkError): string {
  // instanceof 收窄
  if (err instanceof ValidationError) {
    return 'Validation failed on: ' + err.field;      // 有 field
  } else {
    return 'Network error: ' + err.statusCode;        // 有 statusCode
  }
}
console.log('handleError(Validation) =', handleError(new ValidationError('email', 'invalid')));
console.log('handleError(Network) =', handleError(new NetworkError(404, 'not found')));

// instanceof 也适用于内置类
function formatDate(x: Date | string): string {
  if (x instanceof Date) {
    return x.toISOString();              // Date 方法
  } else {
    return x.toUpperCase();              // string 方法
  }
}
console.log('formatDate(Date) =', formatDate(new Date('2024-01-01')));
console.log('formatDate(string) =', formatDate('2024-01-01'));

// ===== 3. in 守卫：判断对象是否有某属性 =====
type Cat = { meow: () => string; name: string };
type Dog = { bark: () => string; name: string };

function speak(animal: Cat | Dog): string {
  // in 收窄：判断对象是否有某属性
  if ('meow' in animal) {
    return animal.name + ': ' + animal.meow();        // 这里 animal 是 Cat
  } else {
    return animal.name + ': ' + animal.bark();        // 这里 animal 是 Dog
  }
}
console.log('speak(Cat) =', speak({ name: 'Kitty', meow: () => 'meow' }));
console.log('speak(Dog) =', speak({ name: 'Rex', bark: () => 'woof' }));

// in 用于判别联合
type ApiResponse =
  | { status: 'success'; data: string }
  | { status: 'error'; message: string };

function handleResponse(res: ApiResponse): string {
  if ('data' in res) {
    return 'OK: ' + res.data;            // 有 data
  } else {
    return 'FAIL: ' + res.message;       // 有 message
  }
}
console.log('handleResponse(success) =', handleResponse({ status: 'success', data: 'hello' }));
console.log('handleResponse(error) =', handleResponse({ status: 'error', message: 'timeout' }));

// ===== 4. 自定义类型守卫：x is Foo =====
type User = { id: number; name: string; email: string };

// 自定义守卫：返回 boolean，但用「x is User」声明类型收窄
function isUser(x: unknown): x is User {
  // 逐字段验证
  return (
    typeof x === 'object' && x !== null &&
    'id' in x && typeof (x as any).id === 'number' &&
    'name' in x && typeof (x as any).name === 'string' &&
    'email' in x && typeof (x as any).email === 'string'
  );
}

// 在条件分支中收窄类型
const data: unknown = JSON.parse('{"id":1,"name":"Alice","email":"a@b.com"}');
if (isUser(data)) {
  // 这里 data 被收窄为 User
  console.log('isUser: id =', data.id, '| name =', data.name, '| email =', data.email);
} else {
  console.log('isUser: data is not a User');
}

const badData: unknown = JSON.parse('{"id":"not a number","name":"Alice"}');
if (isUser(badData)) {
  console.log('badData is User');
} else {
  console.log('badData is NOT a User');
}

// ===== 5. 自定义守卫的复用：判断 User 数组 =====
function isUserArray(x: unknown): x is User[] {
  // 复用 isUser 守卫
  return Array.isArray(x) && x.every(isUser);
}

const listData: unknown = JSON.parse('[{"id":1,"name":"Alice","email":"a@b.com"},{"id":2,"name":"Bob","email":"c@d.com"}]');
if (isUserArray(listData)) {
  // 这里 listData 被收窄为 User[]
  console.log('isUserArray: count =', listData.length);
  listData.forEach(u => console.log('  -', u.name, '(' + u.email + ')'));
}

// ===== 6. 自定义守卫区分联合类型 =====
type Result =
  | { ok: true; data: string }
  | { ok: false; error: string };

function isSuccess(r: Result): r is { ok: true; data: string } {
  return r.ok === true;
}

function handleResult(r: Result): string {
  if (isSuccess(r)) {
    return 'success: ' + r.data;         // 这里 r 是 success 分支
  } else {
    return 'error: ' + r.error;          // 这里 r 是 error 分支
  }
}
console.log('handleResult(success) =', handleResult({ ok: true, data: 'hello' }));
console.log('handleResult(error) =', handleResult({ ok: false, error: 'timeout' }));

// ===== 7. 自定义守卫的集合：集中管理复用 =====
const guards = {
  isString: (x: unknown): x is string => typeof x === 'string',
  isNumber: (x: unknown): x is number => typeof x === 'number',
  isUser: isUser,
  isUserArray: isUserArray,
};

function processData(data: unknown): string {
  if (guards.isString(data)) {
    return 'string: ' + data.toUpperCase();   // data 是 string
  }
  if (guards.isNumber(data)) {
    return 'number: ' + data.toFixed(2);      // data 是 number
  }
  if (guards.isUser(data)) {
    return 'user: ' + data.name;              // data 是 User
  }
  return 'unknown type';
}
console.log('processData(hello) =', processData('hello'));
console.log('processData(42) =', processData(42));
console.log('processData(user) =', processData({ id: 1, name: 'Alice', email: 'a@b.com' }));
console.log('processData(other) =', processData({ foo: 'bar' }));

// ===== 8. typeof 的局限演示：判断 null =====
function checkNull(x: string | null): string {
  // typeof null 是 'object'，不能用 typeof 判断
  // 正确做法：用 === null
  if (x === null) {
    return 'is null';                    // 这里 x 是 null
  } else {
    return x.toUpperCase();              // 这里 x 是 string
  }
}
console.log('checkNull(null) =', checkNull(null));
console.log('checkNull(hello) =', checkNull('hello'));

console.log('=== Demo 结束 ===');
`,
  },
  {
    id: "tspro-discriminated-union",
    group: "二、TypeScript 函数与泛型",
    icon: "🔀",
    title: "可辨识联合（Discriminated Union）",
    content: `# 可辨识联合（Discriminated Union）

## 一、什么是可辨识联合

可辨识联合是 TS 类型系统里**最强大的模式之一**：把多个对象类型用联合类型组合起来，每个类型都有一个**同名的字面量字段**作为「判别符」（discriminator），TS 根据这个字段就能在条件分支里自动收窄类型。

简单说：**联合类型 + 同名字面量字段 = 可辨识联合**。

\`\`\`tsx
// 三个对象类型，都有 kind 字段（判别符）
type Circle = { kind: 'circle'; radius: number };
type Square = { kind: 'square'; size: number };
type Triangle = { kind: 'triangle'; base: number; height: number };

// 联合起来就是可辨识联合
type Shape = Circle | Square | Triangle;

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle':
      return Math.PI * s.radius * s.radius;   // s 是 Circle
    case 'square':
      return s.size * s.size;                 // s 是 Square
    case 'triangle':
      return 0.5 * s.base * s.height;         // s 是 Triangle
  }
}
\`\`\`

关键点：每个分支里 \`s\` 的类型被自动收窄为对应的成员类型，可以直接访问 \`radius\`、\`size\` 等专属字段，不需要任何断言。

## 二、与普通联合的区别

普通联合类型在分支里只能用类型守卫收窄，访问专属字段需要断言：

\`\`\`tsx
// ❌ 普通联合：没有判别符
type BadShape = { radius: number } | { size: number } | { base: number; height: number };

function badArea(s: BadShape): number {
  if ('radius' in s) {
    return Math.PI * s.radius * s.radius;  // 必须用 in 收窄
  }
  if ('size' in s) {
    return s.size * s.size;
  }
  // 还要处理第三个分支，写起来很啰嗦
  return 0.5 * (s as any).base * (s as any).height;  // 需要断言
}

// ✅ 可辨识联合：用判别符收窄，干净利落
type GoodShape = { kind: 'circle'; radius: number } | { kind: 'square'; size: number };
\`\`\`

| 维度 | 普通联合 | 可辨识联合 |
|------|---------|-----------|
| 收窄方式 | \`in\` / \`typeof\` / 自定义守卫 | 直接判断判别符字面量 |
| 代码可读性 | 一般，分支条件多 | 高，switch case 一目了然 |
| 类型推断精度 | 需要手动收窄 | 自动收窄 |
| 扩展性 | 加新成员要改多个 if | 加新 case 即可，配合 never 穷尽检查 |

## 三、判别符的选择规则

判别符必须满足两个条件：

1. **所有成员类型都有这个字段**（名字相同）。
2. **字段值是不同的字面量类型**（string 字面量、数字字面量、布尔字面量）。

\`\`\`tsx
// ✅ 判别符是 string 字面量
type Event =
  | { type: 'click'; x: number; y: number }
  | { type: 'scroll'; offset: number }
  | { type: 'input'; value: string };

// ✅ 判别符是数字字面量
type Status =
  | { code: 200; data: unknown }
  | { code: 404; message: string }
  | { code: 500; error: Error };

// ❌ 不是字面量：判别符值是宽泛的 string，无法区分
type Bad =
  | { type: string; x: number }
  | { type: string; y: number };
\`\`\`

> 经验法则：判别符字段名建议用 \`kind\`、\`type\`、\`status\`、\`code\` 等语义清晰的词，值用全小写字符串字面量。

## 四、switch 模式：最经典的可辨识联合用法

switch 是处理可辨识联合最自然的方式，配合 \`never\` 可以做穷尽检查：

\`\`\`tsx
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; size: number }
  | { kind: 'triangle'; base: number; height: number };

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle':
      return Math.PI * s.radius * s.radius;
    case 'square':
      return s.size * s.size;
    case 'triangle':
      return 0.5 * s.base * s.height;
    default:
      // 如果将来给 Shape 加了 'hexagon'，这里会编译报错
      // 因为 default 分支里 s 的类型是 never，不能赋给 _exhaustive
      const _exhaustive: never = s;
      return _exhaustive;
  }
}
\`\`\`

\`never\` 穷尽检查是可辨识联合的杀手锏：**新增一个成员类型后，所有处理函数都会立刻编译报错**，强制你补上新分支。这是重构时的安全网。

## 五、if 模式：简单分支

成员少时用 if 也行：

\`\`\`tsx
type Result =
  | { success: true; data: string }
  | { success: false; error: string };

function handle(r: Result): string {
  if (r.success) {
    return 'OK: ' + r.data;    // r 收窄为 success: true 分支
  } else {
    return 'Err: ' + r.error;  // r 收窄为 success: false 分支
  }
}
\`\`\`

注意判别符可以是布尔字面量 \`true\` / \`false\`，效果和字符串字面量一样。

## 六、穷尽检查：never 的妙用

穷尽检查有三种写法，效果一样：

\`\`\`tsx
// 写法 1：default 分支里赋值给 never
function f1(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.radius * s.radius;
    case 'square': return s.size * s.size;
    case 'triangle': return 0.5 * s.base * s.height;
    default:
      const _: never = s;
      return 0;
  }
}

// 写法 2：return never 函数
function assertNever(x: never): never {
  throw new Error('Unexpected: ' + x);
}
function f2(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.radius * s.radius;
    case 'square': return s.size * s.size;
    case 'triangle': return 0.5 * s.base * s.height;
    default: return assertNever(s);
  }
}

// 写法 3：noImplicitReturns 编译选项 + 完整 switch
// 开启 noImplicitReturns 后，缺少 case 会编译报错
\`\`\`

> 推荐写法 1：最简洁，无运行时开销（default 分支正常情况下不会执行）。

## 七、可辨识联合在 React useReducer 中的应用（重点）

这是可辨识联合**最经典、最实用**的场景：用 useReducer 管理复杂状态时，action 用可辨识联合约束，dispatch 错误 action 直接编译报错。

\`\`\`tsx
// 1. 定义状态类型
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// 2. 定义 action 类型：可辨识联合
type AsyncAction<T> =
  | { type: 'START' }
  | { type: 'SUCCESS'; data: T }
  | { type: 'ERROR'; error: string }
  | { type: 'RESET' };

// 3. reducer 函数：switch 处理每个 action
function asyncReducer<T>(state: AsyncState<T>, action: AsyncAction<T>): AsyncState<T> {
  switch (action.type) {
    case 'START':
      return { status: 'loading' };
    case 'SUCCESS':
      return { status: 'success', data: action.data };
    case 'ERROR':
      return { status: 'error', error: action.error };
    case 'RESET':
      return { status: 'idle' };
    default:
      const _: never = action;
      return _;
  }
}

// 4. 组件里使用
function useAsync<T>() {
  const [state, dispatch] = useReducer(asyncReducer<T>, { status: 'idle' });

  const run = async (promise: Promise<T>) => {
    dispatch({ type: 'START' });
    try {
      const data = await promise;
      dispatch({ type: 'SUCCESS', data });  // ✅ 必须传 data
    } catch (e) {
      dispatch({ type: 'ERROR', error: String(e) });  // ✅ 必须传 error
    }
  };

  return { state, run };
}
\`\`\`

收益：

1. **dispatch 时类型安全**：\`dispatch({ type: 'SUCCESS' })\` 不传 data 会报错。
2. **reducer 里状态收窄**：\`case 'success'\` 分支里 state 自动有 data 字段。
3. **新增 action 自动提醒**：加一个 \`FETCH\` action 后，所有 reducer 都要补 case，否则编译失败。
4. **组件渲染按状态分支**：\`state.status === 'success'\` 分支里能安全访问 \`state.data\`。

## 八、状态机模式：用可辨识联合建模

可辨识联合天然适合做状态机。每个状态有自己的数据，状态之间的转换由 action 触发：

\`\`\`tsx
// 订单状态机
type OrderState =
  | { state: 'pending'; createdAt: number }
  | { state: 'paid'; paidAt: number; amount: number }
  | { state: 'shipped'; trackingNo: string }
  | { state: 'delivered'; receivedAt: number }
  | { state: 'cancelled'; reason: string };

type OrderEvent =
  | { type: 'PAY'; amount: number }
  | { type: 'SHIP'; trackingNo: string }
  | { type: 'DELIVER' }
  | { type: 'CANCEL'; reason: string };

function reduceOrder(s: OrderState, e: OrderEvent): OrderState {
  switch (e.type) {
    case 'PAY':
      if (s.state !== 'pending') return s;        // 只有 pending 能付款
      return { state: 'paid', paidAt: Date.now(), amount: e.amount };
    case 'SHIP':
      if (s.state !== 'paid') return s;           // 只有 paid 能发货
      return { state: 'shipped', trackingNo: e.trackingNo };
    case 'DELIVER':
      if (s.state !== 'shipped') return s;
      return { state: 'delivered', receivedAt: Date.now() };
    case 'CANCEL':
      if (s.state === 'shipped' || s.state === 'delivered') return s;
      return { state: 'cancelled', reason: e.reason };
    default:
      const _: never = e;
      return _;
  }
}
\`\`\`

状态机的好处：**所有可能的状态和转换都在类型里写清楚**，不会出现「订单已经发货了还能付款」这种逻辑漏洞。

## 九、可辨识联合 vs 继承

OOP 用继承表达「多种类型有共同行为」，函数式用可辨识联合表达。两者对比：

\`\`\`tsx
// OOP 风格：抽象类 + 子类
abstract class Shape {
  abstract area(): number;
}
class Circle extends Shape {
  constructor(public radius: number) { super(); }
  area() { return Math.PI * this.radius ** 2; }
}
class Square extends Shape {
  constructor(public size: number) { super(); }
  area() { return this.size ** 2; }
}

// 函数式风格：可辨识联合 + switch
type Shape2 =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; size: number };

function area2(s: Shape2): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.radius ** 2;
    case 'square': return s.size ** 2;
  }
}
\`\`\`

| 维度 | 继承（OOP） | 可辨识联合（FP） |
|------|------------|-----------------|
| 行为绑定 | 行为在类里 | 行为在外部函数 |
| 加新类型 | 加子类，不改父类 | 加联合成员，所有 switch 要补 case |
| 加新行为 | 加方法，所有子类要实现 | 加新函数，不改类型 |
| 适合场景 | 行为稳定、类型多变 | 类型稳定、行为多变 |

React 偏函数式，所以可辨识联合用得更多。

## 小结

- 可辨识联合 = 联合类型 + 同名字面量判别符。
- 比普通联合更安全、更可读：switch case 自动收窄类型。
- 判别符必须是**字面量类型**（string / number / boolean 字面量）。
- 配合 \`never\` 做**穷尽检查**：新增成员后所有 switch 自动报错，重构不漏。
- 在 React 里是 useReducer 的黄金搭档：action 类型安全、状态收窄、新增 action 自动提醒。
- 状态机模式：用可辨识联合建模，所有状态和转换一目了然。
- 和 OOP 继承是两种风格，React 偏函数式，可辨识联合更合适。
`,
    code: `// 可辨识联合 Demo
// 演示可辨识联合的判别符收窄、穷尽检查、状态机模式、useReducer 模拟

// ===== 1. 基本可辨识联合：Shape =====
type Circle = { kind: 'circle'; radius: number };
type Square = { kind: 'square'; size: number };
type Triangle = { kind: 'triangle'; base: number; height: number };

// 联合起来就是可辨识联合
type Shape = Circle | Square | Triangle;

// switch 处理：每个 case 自动收窄类型
function area(s: Shape): number {
  switch (s.kind) {
    case 'circle':
      // s 在这里是 Circle，能访问 radius
      return Math.PI * s.radius * s.radius;
    case 'square':
      // s 在这里是 Square，能访问 size
      return s.size * s.size;
    case 'triangle':
      // s 在这里是 Triangle，能访问 base / height
      return 0.5 * s.base * s.height;
    default:
      // 穷尽检查：s 在这里是 never
      const _: never = s;
      return _;
  }
}

console.log('area(circle) =', area({ kind: 'circle', radius: 2 }));
console.log('area(square) =', area({ kind: 'square', size: 3 }));
console.log('area(triangle) =', area({ kind: 'triangle', base: 4, height: 5 }));

// ===== 2. 判别符是布尔字面量：Result =====
type Result =
  | { success: true; data: string }
  | { success: false; error: string };

function handle(r: Result): string {
  if (r.success) {
    // r 收窄为 success: true 分支，能访问 data
    return 'OK: ' + r.data;
  } else {
    // r 收窄为 success: false 分支，能访问 error
    return 'Err: ' + r.error;
  }
}
console.log('handle(success) =', handle({ success: true, data: 'hello' }));
console.log('handle(error) =', handle({ success: false, error: 'not found' }));

// ===== 3. 模拟 React useReducer：异步状态管理 =====
// 状态类型：可辨识联合
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// action 类型：可辨识联合
type AsyncAction<T> =
  | { type: 'START' }
  | { type: 'SUCCESS'; data: T }
  | { type: 'ERROR'; error: string }
  | { type: 'RESET' };

// reducer：switch 处理每个 action，状态自动收窄
function asyncReducer<T>(state: AsyncState<T>, action: AsyncAction<T>): AsyncState<T> {
  switch (action.type) {
    case 'START':
      return { status: 'loading' };
    case 'SUCCESS':
      // action 在这里是 SUCCESS 分支，能访问 data
      return { status: 'success', data: action.data };
    case 'ERROR':
      return { status: 'error', error: action.error };
    case 'RESET':
      return { status: 'idle' };
    default:
      // 穷尽检查
      const _: never = action;
      return _;
  }
}

// 模拟 useReducer：维护当前状态，dispatch 触发状态转换
function createReducer<T>(initial: AsyncState<T>) {
  let state = initial;
  const dispatch = (action: AsyncAction<T>) => {
    state = asyncReducer(state, action);
  };
  return {
    getState: () => state,
    dispatch,
  };
}

const store = createReducer<string>({ status: 'idle' });
console.log('初始状态 =', store.getState());

store.dispatch({ type: 'START' });
console.log('START 后 =', store.getState());

store.dispatch({ type: 'SUCCESS', data: 'hello world' });
console.log('SUCCESS 后 =', store.getState());

store.dispatch({ type: 'RESET' });
console.log('RESET 后 =', store.getState());

// ===== 4. 状态机：订单流转 =====
type OrderState =
  | { state: 'pending'; createdAt: number }
  | { state: 'paid'; paidAt: number; amount: number }
  | { state: 'shipped'; trackingNo: string }
  | { state: 'delivered'; receivedAt: number }
  | { state: 'cancelled'; reason: string };

type OrderEvent =
  | { type: 'PAY'; amount: number }
  | { type: 'SHIP'; trackingNo: string }
  | { type: 'DELIVER' }
  | { type: 'CANCEL'; reason: string };

function reduceOrder(s: OrderState, e: OrderEvent): OrderState {
  switch (e.type) {
    case 'PAY':
      if (s.state !== 'pending') return s;       // 只有 pending 能付款
      return { state: 'paid', paidAt: Date.now(), amount: e.amount };
    case 'SHIP':
      if (s.state !== 'paid') return s;          // 只有 paid 能发货
      return { state: 'shipped', trackingNo: e.trackingNo };
    case 'DELIVER':
      if (s.state !== 'shipped') return s;       // 只有 shipped 能签收
      return { state: 'delivered', receivedAt: Date.now() };
    case 'CANCEL':
      // 已发货或已签收不能取消
      if (s.state === 'shipped' || s.state === 'delivered') return s;
      return { state: 'cancelled', reason: e.reason };
    default:
      const _: never = e;
      return _;
  }
}

let order: OrderState = { state: 'pending', createdAt: Date.now() };
console.log('订单初始 =', order.state);

order = reduceOrder(order, { type: 'PAY', amount: 99.5 });
console.log('付款后 =', order.state, '| 金额 =', (order as any).amount);

order = reduceOrder(order, { type: 'SHIP', trackingNo: 'SF123456' });
console.log('发货后 =', order.state, '| 单号 =', (order as any).trackingNo);

order = reduceOrder(order, { type: 'DELIVER' });
console.log('签收后 =', order.state);

// 尝试在 delivered 状态下取消（应该被拒绝）
const beforeCancel = order.state;
order = reduceOrder(order, { type: 'CANCEL', reason: '不想要了' });
console.log('签收后尝试取消 =', order.state, '(应为', beforeCancel, ')');

// ===== 5. 穷尽检查演示：新增成员后报错 =====
// 假设 Shape 新增 hexagon，原 area 函数的 default 分支会编译报错
// 这里演示穷尽检查的写法（实际不新增，只演示）
type Shape2 = Circle | Square | Triangle | { kind: 'hexagon'; side: number };

function area2(s: Shape2): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.radius * s.radius;
    case 'square': return s.size * s.size;
    case 'triangle': return 0.5 * s.base * s.height;
    case 'hexagon': return (3 * Math.sqrt(3) / 2) * s.side * s.side;
    default:
      // 如果上面漏了某个 case，s 在这里不是 never，赋值会报错
      const _: never = s;
      return _;
  }
}
console.log('area2(hexagon) =', area2({ kind: 'hexagon', side: 2 }).toFixed(4));

console.log('=== Demo 结束 ===');
`,
  },
];