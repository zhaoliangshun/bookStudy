// =============================================================
// TypeScript 全解 · 第二批章节（类型系统，共 5 章）
// -------------------------------------------------------------
// 本批聚焦 TypeScript 类型系统的基石：interface、type、数组元组、
// 枚举 enum、字面量与联合类型。这 5 章是后续泛型、高级类型、类型
// 体操的前置基础——把"对象形状怎么描述"这件事彻底讲透。
//
// 章节列表：
//   tsbook-interface     : 接口 interface
//   tsbook-type-alias    : 类型别名 type
//   tsbook-array-tuple   : 数组与元组
//   tsbook-enum          : 枚举 enum
//   tsbook-literal-union : 字面量类型与联合类型
// =============================================================

export const chapters = [
  // ============================================================
  // 第一章：接口 interface
  // ============================================================
  {
    id: "tsbook-interface",
    title: "接口 interface",
    icon: "📐",
    group: "类型系统",
    content: `## 接口 interface

\`interface\` 是 TypeScript 描述**对象形状**最经典的方式——它只规定"对象应该长什么样"，不关心具体值。你可以把它理解为一张"契约"：谁想被认作 \`User\`，就必须拿出契约上写的字段。

### 一、定义对象形状

\`\`\`typescript
interface User {
  id: number;          // 必填字段
  name: string;        // 必填字段
  age?: number;        // 可选字段（带 ? 表示可以不写）
  readonly createdAt: string;  // 只读字段（赋值后不能再改）
}
\`\`\`

四个核心语法一次出现：**必填、可选 \`?\`、只读 \`readonly\`**。

### 二、可选属性 \`?\` ⭐

在属性名后面加 \`?\`，表示这个属性可以不存在。常用于"可选配置项"：

\`\`\`typescript
interface ButtonProps {
  label: string;        // 必填
  size?: "sm" | "md";   // 可选，不传由组件自己给默认值
  onClick?: () => void; // 可选事件回调
}
\`\`\`

> ⭐ \`?\` 的真正含义是"这个属性的类型是 \`T | undefined\`，且允许整个属性不出现"。区分两种"没有"：\`{ a: undefined }\`（属性在但值是 undefined）vs \`{}\`（属性压根不存在）——只有 \`?\` 允许后者。

### 三、只读属性 \`readonly\`

\`\`\`typescript
interface Point {
  readonly x: number;
  readonly y: number;
}

const p: Point = { x: 1, y: 2 };
// p.x = 100;  // ❌ 编译错误：无法分配到只读属性
\`\`\`

> \`readonly\` 是**编译期**检查，运行时无任何保护。它只是"君子协定"——告诉调用方"别动这个字段"。

### 四、索引签名 \`[key: string]: T\` ⭐

当对象的 key 不固定、是动态字符串时，用索引签名：

\`\`\`typescript
interface StringMap {
  [key: string]: string;   // 任意 string key，value 必须是 string
}

const m: StringMap = { a: "1", b: "2", whatever: "ok" };
\`\`\`

> ⭐ 索引签名有一个隐藏约束：**所有显式声明的属性，类型必须能赋给索引的 value 类型**。比如 \`interface A { [k: string]: string; n: number }\` 会报错——因为 \`n: number\` 不兼容 \`string\` value。

### 五、interface vs type：到底用哪个？⭐⭐

这是 TS 面试必考题。两者 90% 的场景能互换，但有几个关键区别：

| 维度 | interface | type |
|------|-----------|------|
| 描述对象形状 | ✅ 原生支持 | ✅ 用 \`type X = {...}\` |
| **合并声明** | ✅ 同名自动合并 | ❌ 重复定义报错 |
| 继承/扩展 | \`extends\` | \`&\` 交叉类型 |
| 联合类型 \`A \| B\` | ❌ 写不出 | ✅ |
| 字面量类型 | ❌ 写不出 | ✅ |
| 条件类型 / 工具类型 | ❌ 写不出 | ✅ |
| 性能 | 同名合并略快 | 简单别名略快 |

#### 合并声明（declaration merging）—— interface 独有能力 ⭐

\`\`\`typescript
interface Window { myProp: string; }   // 第一次声明
interface Window { myFunc: () => void; } // 第二次声明，自动合并

// 合并后 Window 同时拥有 myProp 和 myFunc
\`\`\`

这就是为什么**给第三方库扩展类型**（如给 \`window\` 加属性、给 \`Vue\` 加 \`$xxx\`）必须用 \`interface\`——\`type\` 重名直接报错。

#### 选择口诀

- **描述对象 / 类的形状** → 优先 \`interface\`（更直观、可合并、可继承）
- **联合、交叉、字面量、条件类型、工具类型** → 只能用 \`type\`
- **给已有类型扩展字段** → 用 \`interface\`（合并声明）

### 六、本章小结

- ⭐ \`interface\` 描述对象形状，支持 \`?\` 可选、\`readonly\` 只读、\`[key: string]: T\` 索引签名。
- ⭐ \`interface\` 独有"合并声明"——同名 interface 自动合并字段，\`type\` 做不到。
- ⭐ \`extends\` 继承其他 interface，组合复用类型。
- 选择原则：能 \`interface\` 就 \`interface\`，要联合/字面量/条件类型才用 \`type\`。

下一章讲 \`type\`——它能做 \`interface\` 做不到的事（联合、交叉、字面量）。`,
    code: `// 第一章 interface 接口 Demo
// 演示：对象形状、可选属性、只读属性、索引签名、合并声明、继承

// ============================================================
// 1. 定义对象形状：interface 描述 User 结构
// ============================================================
interface User {
  id: number;                       // 必填：用户 ID
  name: string;                     // 必填：用户名
  age?: number;                     // 可选：年龄（带 ? 可不填）
  readonly createdAt: string;       // 只读：创建时间，赋值后不能改
}

// 创建一个符合 User 接口的对象
const user: User = {
  id: 1,
  name: "张三",
  age: 25,
  createdAt: "2024-01-01",
};

console.log("--- 1. 基本形状 ---");
console.log(\`用户：\${user.name}（id=\${user.id}），创建于 \${user.createdAt}\`);
// user.createdAt = "2025-01-01";  // ❌ 编译错误：只读属性不能重新赋值

// ============================================================
// 2. 可选属性 ?：可以不填，访问时是 undefined
// ============================================================
const user2: User = {
  id: 2,
  name: "李四",
  createdAt: "2024-02-01",
  // age 没填——合法，因为 age 是可选
};

console.log("\\n--- 2. 可选属性 ---");
console.log(\`\${user2.name} 的年龄是：\${user2.age}\`);  // undefined

// ============================================================
// 3. 索引签名 [key: string]: T —— 允许任意额外字符串 key
// ============================================================
interface StringConfig {
  name: string;                     // 固定字段
  [key: string]: string;            // 索引签名：允许任意 string key，value 也必须是 string
}

const config: StringConfig = {
  name: "主配置",                   // 固定字段
  host: "localhost",                // 额外字段（被索引签名容纳）
  port: "3000",                     // 额外字段
};

console.log("\\n--- 3. 索引签名 ---");
console.log(\`name = \${config.name}\`);
console.log(\`host = \${config.host}\`);
console.log(\`port = \${config.port}\`);

// ============================================================
// 4. 合并声明（declaration merging）—— interface 独有能力
//    同名 interface 自动合并字段，type 重名会报错
// ============================================================
interface AppConfig {
  host: string;                     // 第一次声明：host
}
interface AppConfig {
  port: number;                     // 第二次声明：port 自动合并进来
}

// 合并后 AppConfig 同时拥有 host 和 port
const appConfig: AppConfig = {
  host: "0.0.0.0",
  port: 8080,
};

console.log("\\n--- 4. 合并声明 ---");
console.log(\`合并后 AppConfig：{ host: '\${appConfig.host}', port: \${appConfig.port} }\`);

// ============================================================
// 5. interface 继承 extends：复用 + 扩展
// ============================================================
interface Animal {
  name: string;                     // 父接口：动物都有名字
  sound(): void;                    // 父接口：动物都能发声
}

interface Dog extends Animal {
  breed: string;                    // 子接口扩展：品种
}

const dog: Dog = {
  name: "旺财",                     // 继承自 Animal
  breed: "中华田园犬",              // Dog 自己的字段
  sound: () => console.log("汪汪！"),  // 实现父接口方法
};

console.log("\\n--- 5. interface 继承 ---");
console.log(\`\${dog.name}（\${dog.breed}）叫了起来：\`);
dog.sound();

console.log("\\n=== interface 章节演示结束 ===");`,
  },

  // ============================================================
  // 第二章：类型别名 type
  // ============================================================
  {
    id: "tsbook-type-alias",
    title: "类型别名 type",
    icon: "🏷️",
    group: "类型系统",
    content: `## 类型别名 type

\`type\` 给一个类型起个名字，本质是"别名"——它不是新类型，只是个引用。\`type\` 比 \`interface\` 更强大：除了描述对象，还能描述**联合、交叉、字面量、条件类型**等 \`interface\` 表达不了的形态。

### 一、基本别名

\`\`\`typescript
type ID = number;                // 给 number 起名 ID
type Callback = (x: string) => void;  // 给函数类型起名
type User = { id: ID; name: string }; // 描述对象形状
\`\`\`

> 别名只是"快捷方式"，\`ID\` 和 \`number\` 完全等价，可以互相赋值。

### 二、联合类型 \`A | B\` ⭐⭐

\`type\` 独有能力：表示"值可以是 A 或 B 中任意一种"。

\`\`\`typescript
type Status = "loading" | "success" | "error";   // 字符串字面量联合
type ID = number | string;                       // number 或 string
type Result = User | Error;                       // 对象联合
\`\`\`

联合类型是 TS 类型系统的灵魂——它让"穷尽检查"成为可能（见第五章）。

> ⭐ 联合类型 \`A | B\` 表示"**或**"关系：取 A、B 共有的**公共成员**才能安全访问。比如 \`string | number\` 上调 \`.length\` 合法（两者都有），但调 \`.toFixed()\` 报错（只有 number 有）。

### 三、交叉类型 \`A & B\` ⭐

把多个类型"合并"成一个——同时具备 A 和 B 的所有字段。

\`\`\`typescript
type WithId = { id: number };
type WithName = { name: string };
type User = WithId & WithName;   // { id: number; name: string }
\`\`\`

> ⭐ 交叉类型是"**与**"关系：\`A & B\` 必须同时满足 A 和 B。常用于**组合 mixin**——把多个能力拼装成一个对象类型。注意：\`A & B\` 中如果 A、B 有同名但不同类型字段，结果是 \`never\`。

### 四、字面量类型 ⭐

把一个具体的值当成类型——变量只能取这个值：

\`\`\`typescript
type Direction = "left" | "right";   // 只能是这两个字符串之一
type Dice = 1 | 2 | 3 | 4 | 5 | 6;   // 只能是这六个数字
type TrueVal = true;                 // 只能是 true
\`\`\`

字面量类型 + 联合 = TS 中表达"枚举式取值"的**首选方案**（比 enum 更轻量，详见第五章）。

### 五、type 能做、interface 做不到的事 ⭐⭐

| 能力 | type | interface |
|------|------|-----------|
| 联合类型 \`A \| B\` | ✅ | ❌ |
| 交叉类型 \`A & B\` | ✅ | ❌（只能 extends） |
| 字面量类型 \`"left"\` | ✅ | ❌ |
| 元组类型 \`[string, number]\` | ✅ | ❌ |
| 条件类型 \`T extends U ? X : Y\` | ✅ | ❌ |
| 工具类型 \`type Partial<T> = ...\` | ✅ | ❌ |
| 合并声明 | ❌ | ✅ |
| 描述对象形状 | ✅ | ✅（推荐） |

### 六、条件类型预览（高级，详见后续章节）

\`\`\`typescript
// 如果 T 是数组，提取元素类型；否则返回 never
type ElementOf<T> = T extends (infer U)[] ? U : never;

type R1 = ElementOf<string[]>;   // string
type R2 = ElementOf<number>;     // never
\`\`\`

\`type\` + \`infer\` + 条件类型 = 类型体操的基础，\`interface\` 完全无法表达。

### 七、本章小结

- ⭐ \`type\` 是别名，能描述对象也能描述**联合、交叉、字面量、元组、条件类型**。
- ⭐ \`A | B\` 联合：或关系，访问公共成员才安全。
- ⭐ \`A & B\` 交叉：与关系，合并所有字段，常用于 mixin。
- ⭐ 字面量联合 \`"a" | "b"\` 比 enum 更轻量，是表达"有限取值"的首选。
- ⭐ 高级类型（条件、infer、工具类型）只能用 \`type\`。

下一章讲数组与元组——\`type\` 描述元组 \`[string, number]\` 是 \`interface\` 做不到的。`,
    code: `// 第二章 类型别名 type Demo
// 演示：基本别名、联合类型、交叉类型、字面量类型、条件类型预览

// ============================================================
// 1. 基本别名：给类型起个短名
// ============================================================
type ID = number;                       // ID 就是 number 的别名
type Callback = (x: string) => void;    // 函数类型别名

const userId: ID = 1001;                // 等价于 number
const log: Callback = (msg) => console.log(msg);

console.log("--- 1. 基本别名 ---");
console.log(\`userId = \${userId}\`);
log("回调被调用了");

// ============================================================
// 2. 联合类型 A | B：可以是 A 或 B 中任意一种 ⭐
// ============================================================
type Status = "loading" | "success" | "error";   // 只能取这三个字符串之一
type StringOrNumber = string | number;           // 可以是 string 或 number

function formatValue(value: StringOrNumber): string {
  // 联合类型只能访问"共有成员"——string 和 number 都有 toString()
  return \`值是：\${value.toString()}\`;
}

function describeStatus(s: Status): string {
  switch (s) {
    case "loading": return "加载中...";
    case "success": return "成功！";
    case "error":   return "出错了";
  }
}

console.log("\\n--- 2. 联合类型 ---");
console.log(formatValue(42));            // 值是：42
console.log(formatValue("hello"));       // 值是：hello
console.log(describeStatus("success"));  // 成功！

// ============================================================
// 3. 交叉类型 A & B：合并所有字段，"与"关系 ⭐
// ============================================================
type WithId = { id: number };
type WithName = { name: string };
type WithAge = { age: number };

// 三个类型交叉 = 同时拥有三个的所有字段
type Person = WithId & WithName & WithAge;

const person: Person = {
  id: 1,
  name: "张三",
  age: 25,
};

console.log("\\n--- 3. 交叉类型 ---");
console.log(\`Person: { id: \${person.id}, name: \${person.name}, age: \${person.age} }\`);

// ============================================================
// 4. 字面量类型：把"值"当类型 ⭐
// ============================================================
type Direction = "left" | "right" | "up" | "down";  // 只能取这四个值
type Dice = 1 | 2 | 3 | 4 | 5 | 6;                   // 只能取这六个数字
type Answer = "yes" | "no" | "maybe";

function move(dir: Direction): string {
  return \`向 \${dir} 移动\`;
}

function roll(): Dice {
  return (Math.floor(Math.random() * 6) + 1) as Dice;  // 随机 1-6
}

console.log("\\n--- 4. 字面量类型 ---");
console.log(move("left"));    // 向 left 移动
console.log(move("up"));      // 向 up 移动
console.log(\`骰子点数：\${roll()}\`);

// ============================================================
// 5. 条件类型预览：T extends U ? X : Y（type 独有能力）
// ============================================================
// 如果 T 是数组，提取元素类型；否则返回 never
type ElementOf<T> = T extends (infer U)[] ? U : never;

type R1 = ElementOf<string[]>;   // 推导出 string
type R2 = ElementOf<number[]>;   // 推导出 number
type R3 = ElementOf<number>;     // 推导出 never（不是数组）

// 用 any 运行时验证类型推导结果
const checkR1: R1 = "我是 string";
const checkR2: R2 = 42;

console.log("\\n--- 5. 条件类型 ---");
console.log(\`ElementOf<string[]> = \${typeof checkR1}\`);  // string
console.log(\`ElementOf<number[]> = \${typeof checkR2}\`);  // number
console.log(\`ElementOf<number> = never（编译期类型，运行时无值）\`);

// ============================================================
// 6. 实战：用 type 组合一个 API 响应类型
// ============================================================
type ApiResponse<T> = {
  code: number;                        // 状态码
  message: string;                     // 消息
  data: T;                             // 泛型数据
} | {                                  // 或者错误形态
  code: number;
  error: string;
};

// 成功响应
const ok: ApiResponse<{ name: string }> = {
  code: 200,
  message: "OK",
  data: { name: "张三" },
};

// 错误响应
const err: ApiResponse<never> = {
  code: 500,
  error: "服务器内部错误",
};

console.log("\\n--- 6. 实战：API 响应联合类型 ---");
if ("data" in ok) {
  console.log(\`成功：\${ok.data.name}\`);
}
if ("error" in err) {
  console.log(\`失败：\${err.error}\`);
}

console.log("\\n=== type 章节演示结束 ===");`,
  },

  // ============================================================
  // 第三章：数组与元组
  // ============================================================
  {
    id: "tsbook-array-tuple",
    title: "数组与元组",
    icon: "📦",
    group: "类型系统",
    content: `## 数组与元组

数组是日常开发最常用的数据结构，元组则是"长度固定的、每个位置类型可以不同的数组"。理解两者区别，能让你的类型描述精准得多。

### 一、数组声明的两种写法

\`\`\`typescript
const a: number[] = [1, 2, 3];          // 推荐写法：简洁
const b: Array<number> = [1, 2, 3];     // 泛型写法：等价
const c: string[] = ["a", "b"];
const d: (string | number)[] = [1, "a", 2];  // 联合类型数组
\`\`\`

> ⚠️ 注意括号：\`(string | number)[]\` 是"联合类型数组"，而 \`string | number[]\` 是"string 或 number 数组"——优先级陷阱。

### 二、二维数组

\`\`\`typescript
const matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
];
\`\`\`

### 三、元组 Tuple ⭐⭐

元组是"**长度固定、每个位置类型可以不同**"的数组：

\`\`\`typescript
const tuple: [string, number] = ["张三", 25];
//                ^^^^    ^^^^
//                姓名    年龄

tuple[0] = "李四";    // OK
tuple[1] = "三十";    // ❌ 报错：第二个必须是 number
tuple[2] = "extra";   // ❌ 报错：长度只能是 2
\`\`\`

#### 元组 vs 数组：区别在哪？

| 维度 | 数组 \`number[]\` | 元组 \`[string, number]\` |
|------|------------------|--------------------------|
| 长度 | 任意 | 固定 |
| 每个位置类型 | 相同 | 可以不同 |
| 访问越界 | \`undefined\` | 编译期报错 |
| 适用场景 | 同质数据集合 | 固定结构（如坐标、返回值对） |

### 四、什么时候用元组？⭐

**用元组的场景**：
- 函数返回多个值（\`[result, error]\`）
- 固定结构的对（坐标 \`[x, y]\`、RGB \`[r, g, b]\`）
- CSV 行解析（\`[name, age, email]\`）

**不要用元组的场景**：
- 长度可变的数据集合 → 用数组
- 字段含义复杂、需要语义化 → 用 \`interface\`/\`type\` 更清晰

> ⭐ 经验法则：**超过 3 个元素就别用元组**——可读性太差。\`[string, number, boolean, Date, Function]\` 这种是噩梦，改成 \`type X = { name: string; age: number; ... }\` 更好。

### 五、只读元组 \`readonly\`

\`\`\`typescript
const point: readonly [number, number] = [10, 20];
// point[0] = 100;  // ❌ 报错：只读
\`\`\`

\`readonly\` 元组是函数参数的常客——保证函数内部不会修改传入的坐标。

### 六、标签元组 ⭐

给每个位置起名字，可读性大幅提升：

\`\`\`typescript
type Point2D = [x: number, y: number];
type UserInfo = [name: string, age: number, email: string];

const p: Point2D = [10, 20];   // 一看就知道是 x、y
\`\`\`

> ⭐ 标签元组是**编译期**的提示，运行时没有任何影响。但它能让 IDE 悬浮提示更友好，强烈推荐。

### 七、展开运算符与元组

\`\`\`typescript
const t1: [string, number] = ["a", 1];
const t2: [boolean, ...typeof t1] = [true, ...t1];  // [boolean, string, number]
\`\`\`

元组的展开在函数参数转发（\`apply\`/\`call\` 模拟）和类型推导中很有用。

### 八、本章小结

- ⭐ 数组两种写法：\`number[]\`（推荐）和 \`Array<number>\`（泛型）。
- ⭐ 元组 \`[string, number]\`：长度固定、位置类型可不同——用于固定结构。
- ⭐ \`readonly\` 元组保证不可变；标签元组 \`[x: number, y: number]\` 提升可读性。
- ⭐ 元组超过 3 个元素就考虑用 \`interface\` 替代——可读性优先。

下一章讲枚举 \`enum\`——它和字面量联合是"有限取值"的两种方案，各有取舍。`,
    code: `// 第三章 数组与元组 Demo
// 演示：数组两种写法、二维数组、元组、只读元组、标签元组、展开

// ============================================================
// 1. 数组声明的两种写法（等价）
// ============================================================
const a: number[] = [1, 2, 3];              // 推荐写法：类型[]
const b: Array<number> = [4, 5, 6];         // 泛型写法：Array<T>

console.log("--- 1. 数组两种写法 ---");
console.log("number[]      =", a);   // [1, 2, 3]
console.log("Array<number> =", b);   // [4, 5, 6]

// ============================================================
// 2. 联合类型数组：(string | number)[]
//    注意括号！string | number[] 是"string 或 number 数组"，含义完全不同
// ============================================================
const mixed: (string | number)[] = [1, "a", 2, "b", true === false ? 0 : "x"];

console.log("\\n--- 2. 联合类型数组 ---");
mixed.forEach((item, i) => console.log(\`  [\${i}] = \${item} (类型 \${typeof item})\`));

// ============================================================
// 3. 二维数组：number[][]
// ============================================================
const matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

console.log("\\n--- 3. 二维数组 ---");
matrix.forEach((row, i) => console.log(\`  行\${i}: \${row.join(" ")}\`));

// ============================================================
// 4. 元组 Tuple：长度固定、每个位置类型可以不同 ⭐
// ============================================================
const userInfo: [string, number] = ["张三", 25];
//                ^^^^^^  ^^^^^^
//                姓名    年龄

console.log("\\n--- 4. 元组 ---");
console.log(\`姓名：\${userInfo[0]}（类型 string）\`);
console.log(\`年龄：\${userInfo[1]}（类型 number）\`);
// userInfo[1] = "三十";   // ❌ 编译错误：第二个位置必须是 number
// userInfo[2] = "extra";  // ❌ 编译错误：长度只能是 2

// ============================================================
// 5. 元组实战：函数返回多个值 [result, error]
// ============================================================
function divide(a: number, b: number): [number, Error | null] {
  if (b === 0) {
    return [0, new Error("除数不能为 0")];   // 失败：返回错误
  }
  return [a / b, null];                       // 成功：返回结果
}

console.log("\\n--- 5. 元组实战：[result, error] 模式 ---");
const [result, error] = divide(10, 2);
if (error) {
  console.log(\`错误：\${error.message}\`);
} else {
  console.log(\`10 / 2 = \${result}\`);
}

const [r2, e2] = divide(10, 0);
if (e2) {
  console.log(\`错误：\${e2.message}\`);
}

// ============================================================
// 6. 只读元组 readonly：函数内不会改传入的坐标
// ============================================================
function distance(p1: readonly [number, number], p2: readonly [number, number]): number {
  // p1[0] = 999;  // ❌ 编译错误：只读元组不能修改
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  return Math.sqrt(dx * dx + dy * dy);
}

console.log("\\n--- 6. 只读元组 ---");
const p1: readonly [number, number] = [0, 0];
const p2: readonly [number, number] = [3, 4];
console.log(\`(0,0) 到 (3,4) 的距离 = \${distance(p1, p2)}\`);  // 5

// ============================================================
// 7. 标签元组：给每个位置起名字，提升可读性 ⭐
// ============================================================
type Point2D = [x: number, y: number];                    // 二维坐标
type RGB = [r: number, g: number, b: number];             // 颜色
type CSVRow = [name: string, age: number, email: string]; // CSV 一行

const coord: Point2D = [10, 20];                          // 一看就是 x、y
const color: RGB = [255, 128, 0];                         // 一看就是 RGB
const row: CSVRow = ["张三", 25, "zs@example.com"];        // 一看就是 CSV

console.log("\\n--- 7. 标签元组 ---");
console.log(\`坐标 Point2D = (x=\${coord[0]}, y=\${coord[1]})\`);
console.log(\`颜色 RGB = (r=\${color[0]}, g=\${color[1]}, b=\${color[2]})\`);
console.log(\`CSV Row = (name=\${row[0]}, age=\${row[1]}, email=\${row[2]})\`);

// ============================================================
// 8. 展开运算符与元组：拼接新元组
// ============================================================
const base: [string, number] = ["基础", 100];
const extended: [boolean, ...typeof base] = [true, ...base];  // 前面加个 boolean

console.log("\\n--- 8. 展开元组 ---");
console.log("base     =", base);
console.log("extended =", extended);   // [true, "基础", 100]

// ============================================================
// 9. 数组 vs 元组对比
// ============================================================
const arr: number[] = [1, 2, 3, 4, 5];     // 数组：长度任意
const tup: [number, number, number] = [1, 2, 3];  // 元组：长度必须 3

console.log("\\n--- 9. 数组 vs 元组 ---");
console.log(\`数组 number[]：长度 \${arr.length}（可变）\`);
console.log(\`元组 [number,number,number]：长度 \${tup.length}（固定）\`);

console.log("\\n=== 数组与元组章节演示结束 ===");`,
  },

  // ============================================================
  // 第四章：枚举 enum
  // ============================================================
  {
    id: "tsbook-enum",
    title: "枚举 enum",
    icon: "🔢",
    group: "类型系统",
    content: `## 枚举 enum

\`enum\` 是 TypeScript 给"有限取值集合"提供的语法糖——它编译后会生成**真实运行时对象**，与 \`type\` 联合（编译期擦除）有本质区别。

### 一、数字枚举（默认）

\`\`\`typescript
enum Direction {
  Up,      // 0
  Down,    // 1
  Left,    // 2
  Right,   // 3
}

const d: Direction = Direction.Up;
\`\`\`

默认从 0 开始递增。也可以手动指定起始值：

\`\`\`typescript
enum HttpStatus {
  Ok = 200,
  NotFound = 404,
  ServerError = 500,
}
\`\`\`

### 二、字符串枚举 ⭐

\`\`\`typescript
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}
\`\`\`

字符串枚举可读性更好——编译后的代码里能直接看到 \`"RED"\`，调试方便。**实际项目里推荐字符串枚举**。

### 三、反向映射 ⭐⭐（数字枚举独有）

数字枚举有"反向映射"——既可以用 key 查 value，也能用 value 查 key：

\`\`\`typescript
enum Direction { Up, Down }

console.log(Direction.Up);       // 0   （正向：key → value）
console.log(Direction[0]);       // "Up"（反向：value → key）
\`\`\`

**字符串枚举没有反向映射**——只能 key → value，不能 value → key。这是设计上的区别。

> ⭐ 反向映射的本质：数字枚举编译后会生成一个双向对象 \`{ Up: 0, 0: "Up" }\`；字符串枚举只有 \`{ Red: "RED" }\` 单向。

### 四、const enum 常量枚举 ⭐

加 \`const\` 修饰的枚举在编译时**完全内联**——不生成运行时对象，所有引用直接替换成字面量：

\`\`\`typescript
const enum Color {
  Red = "RED",
  Green = "GREEN",
}

const c = Color.Red;   // 编译后直接变成：const c = "RED";
\`\`\`

#### 什么时候用 const enum？

- ✅ 纯内部用的枚举，不导出
- ✅ 想要零运行时开销
- ❌ 不要在跨模块 / 第三方库用——某些打包器（esbuild、swc、babel）默认配置下对 const enum 支持不好，容易出 bug

> ⚠️ **新项目建议**：避免用 const enum，改用"字面量联合类型"（见第五章），同样零运行时开销，且兼容所有工具链。

### 五、异构枚举（Heterogeneous）

数字和字符串混用——**强烈不推荐**，可读性差、容易出错：

\`\`\`typescript
enum Bad {
  No = 0,
  Yes = "YES",
}
\`\`\`

### 六、enum 的陷阱 ⭐⭐

#### 陷阱 1：数字枚举可反向映射，导致类型不安全

\`\`\`typescript
enum Direction { Up, Down }
const d: Direction = 5;   // ✅ 合法！Direction 包含反向映射的 number 索引
\`\`\`

任何 number 都能赋值给数字枚举——这是个**类型安全漏洞**。字符串枚举没有这个问题。

#### 陷阱 2：编译后体积大

普通 enum 编译后会生成真实对象，增加 bundle 体积。const enum 没有这个问题，但有工具链兼容问题。

#### 陷阱 3：tree-shaking 困难

enum 是对象，打包器难以静态分析哪些成员被使用——容易整包打进去。

### 七、enum vs 字面量联合：怎么选？⭐⭐

| 维度 | enum | 字面量联合 \`type\` |
|------|------|---------------------|
| 运行时 | 生成对象 | 完全擦除 |
| 体积 | 较大 | 零 |
| 反向映射 | 数字枚举支持 | 不支持 |
| 迭代 keys | \`Object.keys\` | 需手动维护数组 |
| 工具链兼容 | 好 | 极好 |
| 推荐度 | 字符串 enum 可用 | **首选** |

> ⭐ **现代 TS 项目首选字面量联合**：\`type Status = "loading" | "success" | "error"\`。零运行时、tree-shaking 友好、类型安全更强。enum 主要在"需要反向映射"或"老项目迁移"时使用。

### 八、本章小结

- ⭐ 数字枚举默认 0 开始递增；字符串枚举可读性好，**实际推荐**。
- ⭐ **反向映射**：数字枚举支持 value → key，字符串枚举不支持。
- ⭐ \`const enum\` 编译期内联，零运行时——但跨模块 / 用 esbuild 时要谨慎。
- ⭐ 数字枚举有类型安全漏洞（任何 number 都能赋值），字符串枚举没这个问题。
- ⭐ 现代项目首选**字面量联合**替代 enum——下一章详细讲。`,
    code: `// 第四章 枚举 enum Demo
// 演示：数字枚举、字符串枚举、反向映射、const enum、陷阱

// ============================================================
// 1. 数字枚举（默认从 0 开始递增）
// ============================================================
enum Direction {
  Up,       // 0
  Down,     // 1
  Left,     // 2
  Right,    // 3
}

console.log("--- 1. 数字枚举 ---");
console.log(\`Direction.Up = \${Direction.Up}\`);      // 0
console.log(\`Direction.Right = \${Direction.Right}\`); // 3

// 手动指定起始值
enum HttpStatus {
  Ok = 200,
  NotFound = 404,
  ServerError = 500,
}
console.log(\`HttpStatus.NotFound = \${HttpStatus.NotFound}\`);  // 404

// ============================================================
// 2. 字符串枚举（实际项目推荐）⭐
// ============================================================
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE",
}

console.log("\\n--- 2. 字符串枚举 ---");
const myColor: Color = Color.Red;
console.log(\`myColor = \${myColor}\`);   // RED（可读性好）

// ============================================================
// 3. 反向映射：数字枚举独有能力 ⭐⭐
//    数字枚举编译后生成 { Up: 0, 0: "Up" } 双向对象
//    字符串枚举只有 { Red: "RED" } 单向
// ============================================================
console.log("\\n--- 3. 反向映射 ---");

// 数字枚举：双向都能查
console.log("数字枚举 Direction：");
console.log(\`  正向 Direction.Up = \${Direction.Up}\`);          // 0
console.log(\`  反向 Direction[0] = \${Direction[0]}\`);          // "Up"
console.log(\`  反向 Direction[3] = "\${Direction[3]}"\`);        // "Right"

// 字符串枚举：只能正向
console.log("字符串枚举 Color：");
console.log(\`  正向 Color.Red = \${Color.Red}\`);                // "RED"
// console.log(Color["RED"]);  // ❌ undefined：字符串枚举没有反向映射

// ============================================================
// 4. const enum 常量枚举：编译期内联，零运行时开销 ⭐
//    编译后所有引用直接替换成字面量，不生成对象
// ============================================================
const enum Weekday {
  Mon = "MON",
  Tue = "TUE",
  Wed = "WED",
}

const today: Weekday = Weekday.Mon;   // 编译后：const today = "MON";
console.log("\\n--- 4. const enum ---");
console.log(\`today = \${today}\`);    // MON

// ============================================================
// 5. enum 实战：HTTP 状态码映射
// ============================================================
enum ApiCode {
  Success = 0,
  InvalidParam = 1001,
  Unauthorized = 1002,
  ServerError = 5000,
}

function describeCode(code: ApiCode): string {
  switch (code) {
    case ApiCode.Success:        return "成功";
    case ApiCode.InvalidParam:   return "参数错误";
    case ApiCode.Unauthorized:   return "未授权";
    case ApiCode.ServerError:    return "服务器错误";
  }
}

console.log("\\n--- 5. enum 实战：API 状态码 ---");
console.log(\`Code \${ApiCode.Success}      → \${describeCode(ApiCode.Success)}\`);
console.log(\`Code \${ApiCode.InvalidParam} → \${describeCode(ApiCode.InvalidParam)}\`);
console.log(\`Code \${ApiCode.Unauthorized} → \${describeCode(ApiCode.Unauthorized)}\`);

// ============================================================
// 6. 陷阱演示：数字枚举的类型安全漏洞 ⚠️
// ============================================================
console.log("\\n--- 6. 陷阱：数字枚举接受任意 number ---");

// 数字枚举可以接受任意 number——这是反向映射带来的副作用
const suspicious: Direction = 999;   // ✅ 合法！但 999 不是 Direction 的成员
console.log(\`Direction 接受 999：\${suspicious}（值不是 Up/Down/Left/Right）\`);
console.log(\`反向查 Direction[999] = "\${Direction[999] ?? "undefined"}"\`);  // undefined

console.log("\\n--- 7. 字符串枚举更安全 ---");
// const wrong: Color = "PURPLE";  // ❌ 编译错误：字符串枚举只接受已声明成员
console.log("字符串枚举只能赋值 Color.Red / Green / Blue，传别的会编译报错");

// ============================================================
// 8. 迭代 enum 的 keys / values
// ============================================================
console.log("\\n--- 8. 迭代 enum ---");

// 数字枚举迭代：要过滤掉反向映射产生的数字 key
const numericKeys = Object.keys(Direction)
  .filter((k) => isNaN(Number(k)));   // 只保留字符串 key
console.log(\`Direction 的成员：\${numericKeys.join(", ")}\`);

// 字符串枚举迭代：所有 key 都是成员名
const stringKeys = Object.keys(Color);
console.log(\`Color 的成员：\${stringKeys.join(", ")}\`);

console.log("\\n=== enum 章节演示结束 ===");`,
  },

  // ============================================================
  // 第五章：字面量类型与联合类型
  // ============================================================
  {
    id: "tsbook-literal-union",
    title: "字面量类型与联合类型",
    icon: "🎯",
    group: "类型系统",
    content: `## 字面量类型与联合类型

字面量联合类型是现代 TypeScript 项目中表达"有限取值"的**首选方案**——它比 \`enum\` 更轻量、更安全、更兼容工具链。这一章把它彻底讲透。

### 一、字面量类型

把一个**具体的值**当成类型，变量只能取这个值：

\`\`\`typescript
type Yes = "yes";           // 只能是 "yes"
type TrueVal = true;        // 只能是 true
type One = 1;               // 只能是 1
\`\`\`

单独用没意义，但和联合搭配就强大了。

### 二、字面量联合 \`"a" | "b" | "c"\` ⭐⭐

\`\`\`typescript
type Direction = "left" | "right" | "up" | "down";
type Status = "idle" | "loading" | "success" | "error";
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
\`\`\`

变量只能取列出的字面量之一——这比 \`enum\` 更直观，且**编译后完全擦除**，零运行时开销。

### 三、字面量联合 vs enum：为什么前者更优？⭐⭐

| 维度 | 字面量联合 | enum |
|------|-----------|------|
| 运行时 | **完全擦除** | 生成对象 |
| Bundle 体积 | 零 | 有 |
| Tree-shaking | 完美 | 困难 |
| 类型安全 | 强（只能取字面量） | 数字 enum 有漏洞 |
| 反向映射 | 不支持 | 数字 enum 支持 |
| 迭代 keys | 需手动维护数组 | \`Object.keys\` |
| 序列化 | 直接是字符串值 | 数字 enum 序列化成数字 |
| 调试 | 字符串自解释 | 数字 enum 是 0/1/2 |
| 工具链兼容 | 完美 | const enum 有坑 |

#### 实际对比

\`\`\`typescript
// enum 写法
enum Status { Idle, Loading, Success, Error }
const s: Status = Status.Loading;   // 运行时是 1

// 字面量联合写法（推荐）
type Status = "idle" | "loading" | "success" | "error";
const s: Status = "loading";        // 运行时是 "loading"
\`\`\`

> ⭐ 字面量联合序列化到 JSON、写入日志、传输到前端——都是可读的字符串。数字 enum 序列化后是 0/1/2，调试时还要查表。**这就是为什么现代项目首选字面量联合**。

### 四、穷尽检查（Exhaustive Check）⭐⭐⭐

这是字面量联合最强大的能力——配合 \`switch\` + \`never\` 类型，实现"漏掉分支就编译报错"。

\`\`\`typescript
type Direction = "left" | "right" | "up" | "down";

function move(dir: Direction): string {
  switch (dir) {
    case "left":  return "向左";
    case "right": return "向右";
    case "up":    return "向上";
    case "down":  return "向下";
    default:
      // 穷尽检查：dir 必须是 never 类型
      // 如果未来新增方向但忘了处理，这里会编译报错！
      const _exhaustive: never = dir;
      return _exhaustive;
  }
}
\`\`\`

#### 原理：never 类型 ⭐

\`never\` 是"永远不会出现的值"——它没有任何成员。如果 \`switch\` 处理了所有联合成员，\`default\` 分支里 \`dir\` 的类型会被窄化为 \`never\`，赋值给 \`never\` 变量合法。但**只要漏掉一个分支**，\`dir\` 的类型就不是 \`never\`，赋值就会报错。

> ⭐⭐ \`never\` 穷尽检查是 TS 类型系统的精华——它让"添加新成员"变成**编译期能感知的事件**，强制你处理所有分支。这是 \`enum\` + switch 做不到的（数字 enum 任何值都能赋进去）。

### 五、状态机模式 ⭐

字面量联合 + discriminated union（可辨识联合）= 类型安全的状态机：

\`\`\`typescript
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; error: string };

function handle(state: State): string {
  switch (state.status) {
    case "idle":    return "等待开始";
    case "loading": return "加载中";
    case "success": return \`成功：\${state.data}\`;   // 这里 state 类型已窄化，能访问 data
    case "error":   return \`失败：\${state.error}\`;   // 这里能访问 error
  }
}
\`\`\`

\`status\` 字段是"辨识符"——TS 根据它的字面量值，自动窄化 \`state\` 的类型，让 \`state.data\` / \`state.error\` 在对应分支里安全访问。这是 React \`useReducer\` 状态管理的标准模式。

### 六、字面量联合的迭代

字面量联合是编译期类型，运行时擦除——不能直接 \`Object.keys\`。需要手动维护数组：

\`\`\`typescript
const DIRECTIONS = ["left", "right", "up", "down"] as const;
type Direction = typeof DIRECTIONS[number];   // 自动推导联合类型

DIRECTIONS.forEach(d => console.log(d));      // 运行时迭代
\`\`\`

\`as const\` + \`typeof\` 是"运行时数组 + 编译期类型"的标准模式，一次定义两份都同步。

### 七、本章小结

- ⭐ 字面量联合 \`"a" | "b"\` 比 \`enum\` 更轻量、更安全、更兼容工具链——现代项目首选。
- ⭐⭐ **穷尽检查**：\`switch\` + \`default: const _: never = dir\`，漏掉分支就编译报错。
- ⭐ \`never\` 是"永不出现的值"，是穷尽检查的关键。
- ⭐ 状态机用 discriminated union + 字面量联合，TS 自动窄化字段类型。
- ⭐ \`as const\` + \`typeof arr[number]\` 让数组和类型同步维护。

至此，类型系统 5 章结束。下一批讲**函数与接口**——把类型系统应用到函数签名、重载、this 上。`,
    code: `// 第五章 字面量类型与联合类型 Demo
// 演示：字面量联合、穷尽检查 never、状态机、as const 模式

// ============================================================
// 1. 字面量联合：方向类型（首选方案，替代 enum）
// ============================================================
type Direction = "left" | "right" | "up" | "down";

function move(dir: Direction): string {
  // 每个分支都返回对应的描述
  switch (dir) {
    case "left":  return "向左走 ←";
    case "right": return "向右走 →";
    case "up":    return "向上走 ↑";
    case "down":  return "向下走 ↓";
    default:
      // 穷尽检查：dir 必须被窄化成 never
      // 如果未来 Direction 新增成员但忘了处理，这里会编译报错！
      const _exhaustive: never = dir;
      return _exhaustive;
  }
}

console.log("--- 1. 字面量联合：方向 ---");
console.log(move("left"));    // 向左走 ←
console.log(move("up"));      // 向上走 ↑
// move("diagonal");          // ❌ 编译错误：不在联合里

// ============================================================
// 2. 穷尽检查演示：never 类型 ⭐⭐⭐
// ============================================================
// 演示如果未来扩展 Direction 但忘了更新 move，编译会报错
type DirectionExtended = "left" | "right" | "up" | "down" | "forward";

function moveExtended(dir: DirectionExtended): string {
  switch (dir) {
    case "left":    return "向左";
    case "right":   return "向右";
    case "up":      return "向上";
    case "down":    return "向下";
    case "forward": return "向前";   // 新增分支必须处理
    default:
      // 漏掉 forward 的话，dir 会是 "forward" 而非 never，赋值给 never 报错
      const _: never = dir;
      return _;
  }
}

console.log("\\n--- 2. 穷尽检查 ---");
console.log(\`DirectionExtended 有 5 个成员，全部处理才能通过编译\`);
console.log(moveExtended("forward"));   // 向前

// ============================================================
// 3. 字面量联合 vs enum 对比（运行时差异）
// ============================================================
console.log("\\n--- 3. 字面量联合 vs enum ---");

// 字面量联合：运行时是字符串字面量
const dir: Direction = "left";
console.log(\`字面量联合的值 = "\${dir}"（运行时直接是字符串）\`);
console.log(\`序列化 JSON：\${JSON.stringify({ direction: dir })}\`);  // {"direction":"left"}

// enum 对比（数字 enum 运行时是数字）
enum DirectionEnum { Left, Right, Up, Down }
const dirEnum: DirectionEnum = DirectionEnum.Left;
console.log(\`数字 enum 的值 = \${dirEnum}（运行时是数字，调试要查表）\`);
console.log(\`序列化 JSON：\${JSON.stringify({ direction: dirEnum })}\`);  // {"direction":0}

// ============================================================
// 4. 状态机：可辨识联合（discriminated union）⭐
//    用 status 字段做辨识符，TS 自动窄化每个分支的类型
// ============================================================
type RequestState =
  | { status: "idle" }                          // 空闲
  | { status: "loading" }                       // 加载中
  | { status: "success"; data: string }         // 成功（带数据）
  | { status: "error"; error: string };         // 失败（带错误信息）

function renderState(state: RequestState): string {
  switch (state.status) {
    case "idle":
      // 这里 state 类型是 { status: "idle" }
      return "💤 等待开始";

    case "loading":
      // 这里 state 类型是 { status: "loading" }
      return "⏳ 加载中...";

    case "success":
      // 这里 state 类型窄化为 { status: "success"; data: string }
      // 可以安全访问 state.data
      return \`✅ 成功：\${state.data}\`;

    case "error":
      // 这里 state 类型窄化为 { status: "error"; error: string }
      // 可以安全访问 state.error
      return \`❌ 失败：\${state.error}\`;
  }
}

console.log("\\n--- 4. 状态机：可辨识联合 ---");
const states: RequestState[] = [
  { status: "idle" },
  { status: "loading" },
  { status: "success", data: "用户数据加载完成" },
  { status: "error", error: "网络超时" },
];

states.forEach((s, i) => {
  console.log(\`  [\${i}] \${renderState(s)}\`);
});

// ============================================================
// 5. as const 模式：运行时数组 + 编译期类型同步维护 ⭐
// ============================================================
// 数组用 as const 锁成只读元组
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

// typeof arr[number] 自动推导出联合类型
type HttpMethod = typeof HTTP_METHODS[number];
// 等价于 "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

function sendRequest(method: HttpMethod, url: string): string {
  return \`\${method} \${url}\`;
}

console.log("\\n--- 5. as const 同步模式 ---");
console.log(\`类型 HttpMethod = \${HTTP_METHODS.join(" | ")}\`);
HTTP_METHODS.forEach((m) => {
  console.log(\`  \${sendRequest(m, "/api/users")}\`);
});

// 新增方法只需在数组里加一项，类型自动同步
// const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"] as const;
// HttpMethod 自动包含 "OPTIONS"

// ============================================================
// 6. 实战：HTTP 状态码处理（穷尽检查）
// ============================================================
type ApiStatus = 200 | 201 | 400 | 401 | 404 | 500;

function describeApiStatus(code: ApiStatus): string {
  switch (code) {
    case 200: return "OK - 请求成功";
    case 201: return "Created - 资源已创建";
    case 400: return "Bad Request - 参数错误";
    case 401: return "Unauthorized - 未授权";
    case 404: return "Not Found - 资源不存在";
    case 500: return "Internal Server Error - 服务器错误";
    default:
      // 穷尽检查：漏掉任一状态码就编译报错
      const _: never = code;
      return _;
  }
}

console.log("\\n--- 6. 数字字面量联合：HTTP 状态码 ---");
const codes: ApiStatus[] = [200, 201, 400, 401, 404, 500];
codes.forEach((c) => {
  console.log(\`  \${c} → \${describeApiStatus(c)}\`);
});

console.log("\\n=== 字面量与联合类型章节演示结束 ===");`,
  },
];
