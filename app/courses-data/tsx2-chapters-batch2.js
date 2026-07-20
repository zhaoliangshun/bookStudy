// =============================================================
// TypeScript + React 从入门到精通大全 —— 第二批章节
// -------------------------------------------------------------
// 覆盖：第二部分 TypeScript 类型进阶
// 包含 5 个章节：ch06 ~ ch10
//
// 主题：联合类型与类型守卫、交叉类型、查找类型、泛型、
//      高级类型工具（Partial/Pick/Record/条件类型/模板字面量类型）
// =============================================================

const chapters = [
  // ============================================================
  // 第六章：联合类型与类型守卫
  // ============================================================
  {
    id: "tsx2-ch06",
    group: "第二部分 TypeScript 类型进阶",
    icon: "🔀",
    title: "第六章 联合类型与类型守卫",
    content: `# 第六章 联合类型与类型守卫

联合类型（Union Types）是 TS 描述"这个值可能是 A，也可能是 B"的核心工具。它和"或"运算符在语义上一致——\`A | B\` 表示"是 A 或 B"。但和 JS 的"或"不同，TS 在**编译期**就能保证安全。本章你将学到：联合类型的使用、类型守卫（type guards）的各种形式，以及工程中最常用的"判别联合"模式。

## 6.1 联合类型基础

### 6.1.1 用 \`|\` 组合多个类型

\`\`\`tsx
// 变量可能是 string 或 number
let value: string | number = "hello";
value = 100; // ✓

// 多个类型
type Status = "success" | "error" | "loading";
let s: Status = "success";
// s = "done";  // ❌ 不是 Status 之一
\`\`\`

### 6.1.2 联合类型的"收缩"

TS 不会让联合类型的值做"两边都做不到"的事。**只有所有成员类型都支持的操作才被允许**：

\`\`\`tsx
function print(x: string | number) {
  // x.toString();  // ✓ string 和 number 都有
  // x.toUpperCase();  // ❌ number 没有
  // x.toFixed();      // ❌ string 没有
}
\`\`\`

要让联合类型的具体方法可用，必须先"收窄"（narrow）。这就是类型守卫的用武之地。

## 6.2 typeof 守卫

\`typeof\` 在 JS 里是运行期运算符，在 TS 里同时是**类型守卫**：

\`\`\`tsx
function process(x: string | number) {
  if (typeof x === "string") {
    // 这里 x 被收窄为 string
    console.log(x.toUpperCase());
  } else {
    // 这里 x 被收窄为 number
    console.log(x.toFixed(2));
  }
}
\`\`\`

**支持的值**："string" / "number" / "boolean" / "undefined" / "object" / "function" / "symbol" / "bigint"。

**注意**：\`typeof null === "object"\` 是 JS 的历史 bug，TS 不会帮你修，但写 \`x === null\` 可以正确收窄。

## 6.3 instanceof 守卫

用于 class 实例：

\`\`\`tsx
class Dog {
  bark() { console.log("汪"); }
}
class Cat {
  meow() { console.log("喵"); }
}

function speak(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark();
  } else {
    animal.meow();
  }
}

speak(new Dog()); // "汪"
speak(new Cat()); // "喵"
\`\`\`

## 6.4 in 守卫

检查对象是否有某个属性：

\`\`\`tsx
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim();
  } else {
    animal.fly();
  }
}
\`\`\`

## 6.5 等值守卫

\`===\` / \`!==\` 也能收窄：

\`\`\`tsx
type Status = "ok" | "error";

function handle(s: Status) {
  if (s === "ok") {
    // s 收窄为 "ok"
  } else {
    // s 收窄为 "error"
  }
}
\`\`\`

这个模式对**字面量联合**尤其有效。

## 6.6 自定义类型谓词（Type Predicates）

当内置守卫不够用时，自己写一个：

\`\`\`tsx
// 谓词函数：返回值是 parameterName is Type
function isString(x: unknown): x is string {
  return typeof x === "string";
}

const v: unknown = "hello";
if (isString(v)) {
  // v 收窄为 string
  console.log(v.toUpperCase());
}
\`\`\`

**谓词语法**：\`parameterName is Type\`——参数名必须和形参一致。

## 6.7 判别联合（Discriminated Unions）

这是 TS 最有用的模式之一：**联合 + 字面量 tag + 穷尽性 switch**。

\`\`\`tsx
// 用 kind 字段区分不同形状
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "rectangle"; width: number; height: number };

// 计算面积
function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      // s 收窄为 { kind: "circle"; radius: number }
      return Math.PI * s.radius ** 2;
    case "square":
      return s.side ** 2;
    case "rectangle":
      return s.width * s.height;
  }
  // 理想：这里 s 应该是 never
  throw new Error("unreachable");
}
\`\`\`

判别联合之所以强大，是因为 TS 知道"在 case 内 s 的具体形状"。新增形状时，**所有 switch 必须更新**（否则 area 函数会编译失败）。

## 6.8 穷尽性检查

把 6.7 的代码升级成完全安全的版本：

\`\`\`tsx
// never 类型的工具函数
function assertNever(x: never): never {
  throw new Error("Unhandled: " + JSON.stringify(x));
}

function areaSafe(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "square": return s.side ** 2;
    case "rectangle": return s.width * s.height;
    default: return assertNever(s);
    // 如果新增了 Shape 但没在这里加 case，s 不会变成 never
    // 编译期就报错
  }
}
\`\`\`

这是大型项目里**保证不漏分支**的标准做法。

## 6.9 类型守卫对比

| 守卫方式 | 适用场景 | 写法 |
| --- | --- | --- |
| \`typeof\` | 原始类型 | \`typeof x === "string"\` |
| \`instanceof\` | class 实例 | \`x instanceof Date\` |
| \`in\` | 对象有某属性 | \`"id" in x\` |
| 等值 | 字面量类型 | \`x === "ok"\` |
| 自定义谓词 | 复杂场景 | \`(x): x is T => ...\` |

## 6.10 综合 Demo：API 错误处理

\`\`\`tsx
// 第六章综合 demo：完整 API 错误处理
// 演示：联合类型 + 判别联合 + 穷尽性检查

// 1. 用判别联合表示"加载结果"
type AsyncResult<T> =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; data: T }
  | { kind: "error"; error: { code: number; message: string } };

// 2. 渲染函数：处理所有可能
function render<T>(r: AsyncResult<T>): string {
  switch (r.kind) {
    case "idle":
      return "点击加载";
    case "loading":
      return "加载中...";
    case "success":
      // r.data 在这里是 T
      return \`成功：\${JSON.stringify(r.data)}\`;
    case "error":
      // r.error 有具体形状
      return \`错误 \${r.error.code}: \${r.error.message}\`;
  }
  // 如果将来给 AsyncResult 加新 case 但忘了更新这里，会编译失败
  return assertNever(r);
}

// 3. never 工具函数
function assertNever(x: never): never {
  throw new Error("Unhandled: " + JSON.stringify(x));
}

// 4. 用例
console.log(render({ kind: "idle" }));
console.log(render({ kind: "loading" }));
console.log(render({ kind: "success", data: { id: 1 } }));
console.log(render({ kind: "error", error: { code: 404, message: "Not Found" } }));

// 5. 自定义类型谓词
type User = { id: number; name: string; email: string };
type Admin = User & { role: "admin"; permissions: string[] };

function isAdmin(u: User | Admin): u is Admin {
  // 通过 role 字段判断
  return (u as Admin).role === "admin";
}

const guest: User = { id: 1, name: "张三", email: "a@b.c" };
const boss: Admin = {
  id: 2, name: "李四", email: "b@c.d", role: "admin", permissions: ["all"],
};

function greet(u: User | Admin) {
  if (isAdmin(u)) {
    // u 收窄为 Admin
    console.log(\`管理员 \${u.name} 拥有 \${u.permissions.length} 个权限\`);
  } else {
    console.log(\`普通用户 \${u.name}\`);
  }
}

greet(guest);
greet(boss);

// 6. 处理 React props 的"可选或某种类型"
type ButtonProps =
  | { variant: "link"; href: string }
  | { variant: "button"; onClick: () => void }
  | { variant: "submit" };

function handleButton(p: ButtonProps) {
  switch (p.variant) {
    case "link":
      // p 有 href
      console.log("导航到", p.href);
      break;
    case "button":
      // p 有 onClick
      p.onClick();
      break;
    case "submit":
      // p 没有额外字段
      console.log("提交");
      break;
  }
}

handleButton({ variant: "link", href: "/home" });
handleButton({ variant: "button", onClick: () => console.log("clicked") });
handleButton({ variant: "submit" });
\`\`\`

## 小结

- 联合类型用 \`|\` 组合多个类型，是 TS 表达"或"的核心。
- **类型守卫**包括 \`typeof\`、\`instanceof\`、\`in\`、等值、自定义谓词五种。
- **判别联合**（\`kind\` 字段 + switch）是描述"多形态数据"最优雅的模式。
- 穷尽性检查（\`assertNever\`）保证不漏分支，新增类型时编译器会提醒。
- 自定义谓词 \`x is T\` 让函数返回类型信息。
- 字面量联合 + 判别字段是设计 React 组件 API 的常用招法。
`,
  },

  // ============================================================
  // 第七章：交叉类型与类型合并
  // ============================================================
  {
    id: "tsx2-ch07",
    group: "第二部分 TypeScript 类型进阶",
    icon: "✖️",
    title: "第七章 交叉类型与类型合并",
    content: `# 第七章 交叉类型与类型合并

如果说联合类型（\`|\`）是"或"，那交叉类型（\`&\`）就是"与"——\`A & B\` 表示"既是 A 又是 B"。本章你将学到：交叉类型的本质、它和联合类型的对比、什么时候用交叉、什么时候用联合，以及一些常见的踩坑点。

## 7.1 交叉类型基础

\`\`\`tsx
// A & B：必须同时满足 A 和 B
type A = { name: string };
type B = { age: number };

type AB = A & B;
// 等价于 { name: string; age: number }

const u: AB = { name: "张三", age: 30 };
\`\`\`

交叉类型**把所有属性合并**，就像把多个接口 \`extends\` 到一起。

## 7.2 联合 vs 交叉：核心区别

这是新人最容易混淆的概念。**记住一句话：联合是"取并集（用时选一个）"，交叉是"取并集（用时全要）"**。

### 7.2.1 联合类型 \`|\`

\`\`\`tsx
// 联合：值可以是其中之一
type Value = string | number;
const v1: Value = "hi";
const v2: Value = 42;
\`\`\`

### 7.2.2 交叉类型 \`&\`

\`\`\`tsx
// 交叉：值必须同时满足
type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;

// const p: Person = { name: "张三" };  // ❌ 缺 age
const p: Person = { name: "张三", age: 30 }; // ✓
\`\`\`

### 7.2.3 一个反直觉的例子

\`\`\`tsx
// string | number   → string | number
// string & number   → never（因为没东西能同时是 string 和 number）

type Impossible = string & number;
// const x: Impossible = ???  // 不可能存在
\`\`\`

**两个不相交类型交叉，结果是 \`never\`**。

### 7.2.4 对象类型的交叉

\`\`\`tsx
// A 有 name，B 有 age
// A & B 必须同时有 name 和 age
type A = { name: string };
type B = { age: number };
type AB = A & B; // { name: string; age: number }

// 联合的对象
type AorB = A | B;
// const x: AorB = { name: "张三" };  // ✓ 单独 A
// const y: AorB = { age: 30 };       // ✓ 单独 B
// const z: AorB = { name: "张三", age: 30 };  // ✓ 两者都满足也合法
\`\`\`

## 7.3 同名字段的交叉

当交叉的两个类型有同名字段时，**结果类型是两者的"交集"**：

\`\`\`tsx
// 同名字段，类型不同
type A = { value: string };
type B = { value: number };
type AB = A & B;
// { value: string & number } = { value: never }
// 实际写不出来
\`\`\`

如果同名字段类型**兼容**，结果就是子类型：

\`\`\`tsx
type A = { id: number };
type B = { id: number | string };
type AB = A & B; // { id: number }（A 的 id 是 B 的子类型）
\`\`\`

## 7.4 用交叉类型扩展第三方类型

\`\`\`tsx
// 给 React 组件 props 加自定义字段
import React from "react";

type WithLoading<T> = T & { loading?: boolean };

// 给 Button 的 props 加 loading 字段
type ButtonProps = WithLoading<React.ButtonHTMLAttributes<HTMLButtonElement>>;
// 等价于把所有 ButtonHTMLAttributes 加上 loading 字段
\`\`\`

这是 HOC、自定义 Hook 包装组件时的常用招法。

## 7.5 接口继承 vs 交叉类型

大部分情况下**接口继承更推荐**，因为：

- 接口继承有名字，鼠标悬停时更清晰
- 接口可以被 class implements
- 接口支持声明合并

\`\`\`tsx
// 用 interface 继承
interface BaseProps {
  id: string;
}
interface ButtonProps extends BaseProps {
  onClick: () => void;
}

// 用 type 交叉
type ButtonProps2 = BaseProps & { onClick: () => void };
// 实际效果相同
\`\`\`

**何时用交叉**：动态组合多个已有类型时用 \`&\` 更顺手：

\`\`\`tsx
// 动态从配置里拼类型
type UserConfig = {
  theme: "light" | "dark";
  locale: "zh" | "en";
};

type UserSettings = UserConfig & {
  notifications: boolean;
};
\`\`\`

## 7.6 常见的交叉类型模式

### 7.6.1 混入（Mixin）

\`\`\`tsx
// 多个"小类型"组合成大类型
type Timestamps = { createdAt: number; updatedAt: number };
type SoftDelete = { deletedAt: number | null };

type WithTimestamps<T> = T & Timestamps;
type WithSoftDelete<T> = T & SoftDelete;

type Article = WithTimestamps<{
  id: string;
  title: string;
}> & SoftDelete;
\`\`\`

### 7.6.2 强类型合并

\`\`\`tsx
// 模拟 Object.assign 的强类型版本
function assign<T extends object, U extends object>(target: T, source: U): T & U {
  return Object.assign(target, source);
}

const merged = assign(
  { name: "张三" },
  { age: 30 }
);
// merged: { name: string } & { age: number } = { name: string; age: number }
\`\`\`

### 7.6.3 混合事件类型

\`\`\`tsx
type BaseEvent = { timestamp: number; id: string };
type ClickEvent = BaseEvent & { x: number; y: number };
type KeyEvent = BaseEvent & { key: string; code: number };
\`\`\`

## 7.7 交叉类型 vs 接口继承

| 维度 | 交叉 \`&\` | 接口 \`extends\` |
| --- | --- | --- |
| 语法 | \`A & B\` | \`interface C extends A, B {}\` |
| 多个来源 | 任意组合 | 列表式 |
| 同名冲突 | 取交集 | 报错 |
| 用于 class | 不能直接 implements | 可以 |
| 声明合并 | 不能合并 | 可以 |
| 动态性 | 更灵活（type 上） | 固定结构 |

**实践指南**：
- 固定形状的领域对象用 interface + extends
- 临时组合、mixin、工具组合用 type + \`&\`

## 7.8 综合 Demo：电商订单系统

\`\`\`tsx
// 第七章综合 demo：电商订单类型
// 演示：交叉类型在真实业务里的应用

// 1. 基础时间戳
type Timestamps = {
  createdAt: number;
  updatedAt: number;
};

// 2. 软删除
type SoftDelete = {
  deletedAt: number | null;
};

// 3. 审计字段
type Auditable = {
  createdBy: string;
  updatedBy: string;
};

// 4. 完整实体
type BaseEntity = Timestamps & SoftDelete & Auditable;

// 5. 用户
type User = BaseEntity & {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
};

// 6. 商品
type Product = BaseEntity & {
  id: string;
  name: string;
  price: number;
  stock: number;
};

// 7. 订单条目
type OrderItem = {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
};

// 8. 订单
type Order = BaseEntity & {
  id: string;
  userId: string;
  items: OrderItem[];
  status: "pending" | "paid" | "shipped" | "delivered";
  total: number;
};

// 9. 测试
const sampleUser: User = {
  id: "u1",
  name: "张三",
  email: "zhangsan@example.com",
  role: "member",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  deletedAt: null,
  createdBy: "system",
  updatedBy: "system",
};

const sampleProduct: Product = {
  id: "p1",
  name: "机械键盘",
  price: 599,
  stock: 100,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  deletedAt: null,
  createdBy: "admin",
  updatedBy: "admin",
};

const sampleOrder: Order = {
  id: "o1",
  userId: sampleUser.id,
  items: [{ productId: sampleProduct.id, quantity: 1, priceAtPurchase: 599 }],
  status: "pending",
  total: 599,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  deletedAt: null,
  createdBy: sampleUser.id,
  updatedBy: sampleUser.id,
};

console.log("用户：", sampleUser.name);
console.log("订单状态：", sampleOrder.status);
console.log("订单总额：", sampleOrder.total);

// 10. 强类型 assign
function merge<A extends object, B extends object>(a: A, b: B): A & B {
  return { ...a, ...b };
}

const merged = merge(
  { user: sampleUser.name },
  { product: sampleProduct.name }
);
// merged: { user: string } & { product: string }
console.log("合并结果：", merged);

// 11. 动态组合：根据配置创建类型
type WithMeta<T> = T & { meta: { version: number; source: string } };

const productWithMeta: WithMeta<Product> = {
  ...sampleProduct,
  meta: { version: 1, source: "api" },
};

console.log("带元数据商品：", productWithMeta.name, "v" + productWithMeta.meta.version);
\`\`\`

## 小结

- 交叉类型 \`&\` 把多个类型合并成"既要 A 又要 B"。
- 联合 \`|\` 是"或"，交叉 \`&\` 是"与"，**字面类型交叉不相交时是 \`never\`**。
- 交叉的同名字段取交集；不兼容就变 \`never\`，编译器会立刻报错。
- 固定结构优先用 \`interface extends\`，动态组合用 \`type &\`。
- 交叉常用于 mixin、混入时间戳/审计字段、强类型 assign。
- 对象类型交叉 = 属性合并，但属性冲突会变成"更严格的类型"。
`,
  },

  // ============================================================
  // 第八章：类型别名与查找类型
  // ============================================================
  {
    id: "tsx2-ch08",
    group: "第二部分 TypeScript 类型进阶",
    icon: "🏷️",
    title: "第八章 类型别名与查找类型",
    content: `# 第八章 类型别名与查找类型

类型别名（Type Alias）和查找类型（Lookup Types）是 TS 类型系统里的"工程化工具"。前者给复杂类型起名字，提高可读性与复用性；后者从一个类型里"取出"某个属性或"取出"所有键名。本章你将学到：什么时候用 \`type\`、什么时候用 \`interface\`、以及 \`keyof\`、\`T[K]\` 这些"在类型之间取数据"的操作。

## 8.1 类型别名 \`type\`

### 8.1.1 基本用法

\`\`\`tsx
// 给类型起一个名字
type UserId = string;
type Age = number;
type User = {
  id: UserId;  // 等价于 string，但更清晰
  age: Age;
};
\`\`\`

### 8.1.2 联合类型别名

\`\`\`tsx
type Status = "idle" | "loading" | "success" | "error";
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function handle(r: Result<number>) {
  if (r.ok) {
    console.log("结果是", r.value);
  } else {
    console.log("错误：", r.error);
  }
}
\`\`\`

### 8.1.3 函数类型别名

\`\`\`tsx
type Handler = (event: { type: string }) => void;
type AsyncLoader<T> = (id: string) => Promise<T>;
\`\`\`

## 8.2 type vs interface 终极对比

新人最常问的问题："\`type\` 和 \`interface\` 到底用哪个？"答案是：**大多数场景它们互通，少数场景有差异**。

### 8.2.1 差异表

| 维度 | \`type\` | \`interface\` |
| --- | --- | --- |
| 描述对象形状 | ✓ | ✓ |
| 描述联合/交叉 | ✓ | ❌（只能 extends） |
| 描述函数类型 | ✓ | ✓ |
| 描述元组/数组 | ✓ | 极少用 |
| 声明合并 | ❌ | ✓（同名自动合并） |
| 类 implements | ✓ | ✓ |
| extends | \`&\` 组合 | \`extends\` 关键字 |
| 工具类型 | 自由组合 | 受限 |

### 8.2.2 经验法则

- **领域对象**（User、Order、Product）：用 \`interface\`，因为它有名字、可被 implements、可扩展。
- **联合、工具类型、临时组合**：用 \`type\`，因为 interface 表达不了。
- **库的公共 API**：用 \`interface\`，因为用户可以声明合并扩展。
- **组件 props**：现代 React 项目里两者都常见，但 \`type\` 在动态组合时更方便。

### 8.2.3 等价示例

\`\`\`tsx
// interface
interface User1 {
  name: string;
  age: number;
}

// type
type User2 = {
  name: string;
  age: number;
};

// 两者效果几乎一样
const u1: User1 = { name: "张三", age: 30 };
const u2: User2 = { name: "李四", age: 30 };
\`\`\`

## 8.3 \`keyof\`：取出所有键

\`keyof T\` 返回类型 \`T\` 的所有键组成的联合：

\`\`\`tsx
interface User {
  id: number;
  name: string;
  age: number;
}

type UserKeys = keyof User;
// 等价于 "id" | "name" | "age"

function getProp(obj: User, key: UserKeys) {
  return obj[key];
}

getProp({ id: 1, name: "张三", age: 30 } as User, "name"); // ✓
getProp({ id: 1, name: "张三", age: 30 } as User, "foo"); // ❌
\`\`\`

**注意**：\`keyof\` 只保留**共有键**。如果对象类型有可选字段，keyof 仍然包含它（运行时值可能是 undefined）。

## 8.4 索引访问类型（Indexed Access Types）

用 \`T[K]\` 从类型 \`T\` 上取 \`K\` 键对应的类型：

\`\`\`tsx
interface User {
  id: number;
  name: string;
  age: number;
}

// 单个键
type NameType = User["name"]; // string

// 多个键（用 keyof）
type AllValues = User[keyof User]; // number | string

// 等价于
type Same = number | string;
\`\`\`

这在"通用工具函数"里特别有用。

### 8.4.1 用例：通用 get 函数

\`\`\`tsx
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user: User = { id: 1, name: "张三", age: 30 };

const name = get(user, "name"); // string
const id = get(user, "id");     // number
\`\`\`

\`K extends keyof T\` 约束了 K 必须是 T 的键，\`T[K]\` 让返回类型精确到对应字段。

### 8.4.2 用例：访问数组元素

\`\`\`tsx
// T[number] 取数组元素的类型
type StrArr = string[];
type Elem = StrArr[number]; // string

// 元组
type Tup = [string, number, boolean];
type TupElem = Tup[number]; // string | number | boolean
type First = Tup[0];        // string
type Second = Tup[1];       // number
\`\`\`

## 8.5 联合的 keyof 与索引访问

\`\`\`tsx
interface A { a: string; common: number }
interface B { b: string; common: number }

type AB = A | B;
type Common = keyof AB; // "common"（共有键）
type Values = AB[keyof AB]; // number
\`\`\`

**联合类型的 keyof 只保留共有键**——这是 TS 的安全设计，避免"键不存在的字段"。

## 8.6 typeof 类型查询

\`\`\`tsx
// 把值的类型"取出来"作为类型
const config = {
  api: "https://api.example.com",
  retries: 3,
};

type Config = typeof config;
// 等价于 { api: string; retries: number }
\`\`\`

\`typeof\` 在 JS 是运行期运算符，在 TS 类型位置上是**类型查询**。

## 8.7 typeof + keyof 组合（实用模式）

\`\`\`tsx
const COLORS = {
  red: "#ff0000",
  green: "#00ff00",
  blue: "#0000ff",
} as const;

type Color = keyof typeof COLORS;
// "red" | "green" | "blue"

function getColor(c: Color): string {
  return COLORS[c];
}

getColor("red");    // "#ff0000"
getColor("purple"); // ❌
\`\`\`

**这是"对象作为枚举"的经典模式**。比 \`enum\` 更类型安全（值就是字面量）。

## 8.8 查找类型实战

### 8.8.1 通用 pick 函数

\`\`\`tsx
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

const user: User = { id: 1, name: "张三", age: 30 };
const partial = pick(user, ["id", "name"]);
// { id: number; name: string }
console.log(partial);
\`\`\`

### 8.8.2 函数参数与返回类型

\`\`\`tsx
// Parameters 工具类型取函数参数
type MyFunc = (a: string, b: number) => boolean;
type Params = Parameters<MyFunc>; // [string, number]

// ReturnType 取函数返回类型
type Ret = ReturnType<MyFunc>; // boolean
\`\`\`

这些工具类型在第九章会详细讲。

## 8.9 综合 Demo：通用工具集

\`\`\`tsx
// 第八章综合 demo：类型工具集
// 演示：type vs interface、keyof、索引访问、typeof

// 1. 颜色表（字面量联合 + 对象实现）
const STATUS = {
  idle: "空闲",
  loading: "加载中",
  success: "成功",
  error: "错误",
} as const;

type Status = keyof typeof STATUS;
// "idle" | "loading" | "success" | "error"

function getStatusText(s: Status): string {
  return STATUS[s];
}
console.log(getStatusText("loading")); // "加载中"

// 2. 用户类型
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

// 3. 通用 get
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user: User = { id: 1, name: "张三", email: "a@b.c" };
console.log(get(user, "name")); // "张三"

// 4. 通用 set
function set<T, K extends keyof T>(obj: T, key: K, value: T[K]): T {
  return { ...obj, [key]: value };
}

const updated = set(user, "name", "李四");
console.log(updated); // { id: 1, name: "李四", email: "a@b.c" }

// 5. 通用 pick
function pick<T, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

const idAndName = pick(user, ["id", "name"]);
console.log(idAndName); // { id: 1, name: "张三" }

// 6. 通用 omit
function omit<T, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete (result as any)[key];
  }
  return result as Omit<T, K>;
}

const noEmail = omit(user, ["email"]);
console.log(noEmail); // { id: 1, name: "张三" }

// 7. 枚举式定义路由
const ROUTES = {
  home: "/",
  about: "/about",
  contact: "/contact",
  user: "/user/:id",
} as const;

type RouteName = keyof typeof ROUTES; // "home" | "about" | "contact" | "user"
type RoutePath = typeof ROUTES[RouteName]; // "/" | "/about" | "/contact" | "/user/:id"

function navigate(name: RouteName): void {
  console.log("跳转到", ROUTES[name]);
}
navigate("about");

// 8. 复杂场景：根据 Status 取对应数据结构
type StatusData = {
  idle: null;
  loading: null;
  success: { data: User[] };
  error: { code: number; message: string };
};

// 通过 Status 取对应 data 的类型
type DataForStatus<S extends Status> = StatusData[S];

function handleStatus<S extends Status>(s: S, data: DataForStatus<S>) {
  switch (s) {
    case "idle":
    case "loading":
      console.log("无数据");
      break;
    case "success":
      // data 收窄为 { data: User[] }
      console.log("用户数：", data.data.length);
      break;
    case "error":
      // data 收窄为 { code: number; message: string }
      console.log("错误：", data.message);
      break;
  }
}

handleStatus("success", { data: [user] });
handleStatus("error", { code: 404, message: "Not Found" });

// 9. 模拟 Parameters 和 ReturnType
type MyParameters<T extends (...args: any[]) => any> = T extends (...args: infer P) => any ? P : never;
type MyReturnType<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R ? R : never;

function add(a: number, b: number): string {
  return String(a + b);
}

type AddParams = MyParameters<typeof add>; // [number, number]
type AddReturn = MyReturnType<typeof add>; // string
console.log("参数：", AddParams, "返回：", AddReturn);
\`\`\`

## 小结

- \`type\` 给任意类型起名字，\`interface\` 只能描述对象/函数形状。
- 大多数场景两者互通，差异主要在联合/工具类型只能用 \`type\`、声明合并只能用 \`interface\`。
- \`keyof T\` 取出所有键的联合，\`T[K]\` 取出某个键对应值的类型。
- 联合类型的 \`keyof\` 只保留共有键，索引访问得到共有值的联合。
- \`typeof\` 在类型位置上是"类型查询"，配合 \`keyof\` 可实现"对象当枚举"。
- \`T[K]\` 配合泛型约束 \`K extends keyof T\` 是写通用工具函数的核心。
- 元组也支持索引访问：\`T[number]\` 取所有元素的联合，\`T[0]\` 取第一个。
`,
  },

  // ============================================================
  // 第九章：泛型基础
  // ============================================================
  {
    id: "tsx2-ch09",
    group: "第二部分 TypeScript 类型进阶",
    icon: "🧬",
    title: "第九章 泛型基础",
    content: `# 第九章 泛型基础

泛型（Generics）是 TS 类型系统的灵魂。**它让你写出"不绑定到具体类型"的可复用代码**，同时保留完整的类型安全。本章从泛型函数开始，覆盖泛型接口、泛型类、泛型约束、默认类型、多类型参数等核心概念。第十章会进一步讲基于泛型构建的高级工具类型。

## 9.1 为什么要泛型

先看一个反例：函数要"既能处理 number 数组，又能处理 string 数组"。

\`\`\`tsx
// 方案 1：联合类型（繁琐、不能扩展）
function first(arr: number[] | string[]): number | string {
  return arr[0];
}

// 方案 2：any（丢失类型信息）
function first2(arr: any[]): any {
  return arr[0];
}

// 方案 3：泛型（推荐）
function first3<T>(arr: T[]): T | undefined {
  return arr[0];
}

first3<number>([1, 2, 3]);      // number | undefined
first3<string>(["a", "b"]);     // string | undefined
\`\`\`

泛型让函数**只写一次，但适用于所有类型**——而且调用时返回类型自动精确。

## 9.2 泛型函数

### 9.2.1 基本语法

\`\`\`tsx
// <T> 声明类型参数，T 是占位符
function identity<T>(arg: T): T {
  return arg;
}

const a = identity(42);       // 推断为 number
const b = identity("hello");  // 推断为 string
const c = identity<boolean>(true); // 显式指定
\`\`\`

**惯例**：
- \`T\`：Type
- \`K\`：Key
- \`V\`：Value
- \`E\`：Element
- \`U\` / \`S\`：第二、第三类型参数

### 9.2.2 多个类型参数

\`\`\`tsx
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}

const p = pair("age", 30); // [string, number]
\`\`\`

### 9.2.3 显式 vs 推断

\`\`\`tsx
// 让 TS 推断
const x = identity(42); // 推断 T 为 number

// 显式指定
const y = identity<number>(42); // 明确 T 是 number

// 当推断不出时必须显式
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "张三", age: 30 };
// 推断：getProp(user, "name") → string
const name = getProp(user, "name");
\`\`\`

## 9.3 泛型接口

\`\`\`tsx
// 接口本身带类型参数
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: number; message: string };
}

// 使用时提供具体类型
const userRes: ApiResponse<{ name: string }> = {
  success: true,
  data: { name: "张三" },
};

const listRes: ApiResponse<number[]> = {
  success: true,
  data: [1, 2, 3],
};
\`\`\`

**React 组件 props 是泛型接口的最大用户**：

\`\`\`tsx
// 通用列表组件
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => string;
}

// 实际使用
const props: ListProps<{ id: number; name: string }> = {
  items: [{ id: 1, name: "张三" }],
  renderItem: (item) => item.name,
};
\`\`\`

## 9.4 泛型类

\`\`\`tsx
// 类带类型参数
class Box<T> {
  private value: T;
  constructor(value: T) {
    this.value = value;
  }
  get(): T {
    return this.value;
  }
}

const numBox = new Box<number>(42);
const strBox = new Box("hello"); // 推断为 string
\`\`\`

**注意**：**类的静态成员不能使用类的类型参数**（TS 设计如此，因为 static 属于类本身而非实例）。

## 9.5 泛型约束（extends）

泛型默认"什么类型都行"，但很多场景需要"必须是某形状"：

\`\`\`tsx
// 要求 T 至少有 length 属性
function logLength<T extends { length: number }>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("hello");   // ✓
logLength([1, 2, 3]); // ✓
logLength(42);        // ❌ number 没有 length
\`\`\`

**\`extends\` 在这里是"约束"，不是"继承"**。

### 9.5.1 keyof 约束

\`\`\`tsx
// K 必须是 T 的键
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
\`\`\`

这是写"通用对象工具函数"的标准模式。

### 9.5.2 多重约束

\`\`\`tsx
// 必须同时满足两个约束（用交叉类型）
interface Named { name: string }
interface Aged { age: number }

function greet<T extends Named & Aged>(obj: T): string {
  return \`\${obj.name}, \${obj.age}岁\`;
}

greet({ name: "张三", age: 30 });
\`\`\`

## 9.6 默认泛型类型

\`\`\`tsx
// 给泛型参数一个默认值
interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
}

// 不指定也能用
const r1: ApiResponse = { success: true, data: null };
// 等价于 ApiResponse<unknown>
\`\`\`

**React 的 useState 也是默认泛型**：

\`\`\`tsx
// 真实签名
// function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];

// 不指定时类型由初始值推断
const [count, setCount] = useState(0); // number
const [name, setName] = useState("张三"); // string

// 显式指定
const [user, setUser] = useState<User | null>(null);
\`\`\`

## 9.7 条件类型初步（infer）

\`infer\` 关键字在泛型约束里"提取"类型信息：

\`\`\`tsx
// 提取 Promise 的内部类型
type Unwrap<T> = T extends Promise<infer U> ? U : T;

type A = Unwrap<Promise<string>>; // string
type B = Unwrap<number>;          // number（不是 Promise，原样返回）
\`\`\`

\`infer\` 是高级类型推导的基石，第十章会详细展开。

## 9.8 泛型常见模式

### 9.8.1 容器类型

\`\`\`tsx
// 通用 Result 类型
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

const r1: Result<number> = ok(42);
const r2: Result<never, string> = err("failed");
\`\`\`

### 9.8.2 工厂函数

\`\`\`tsx
// 通用工厂
function makeArray<T>(length: number, value: T): T[] {
  return Array(length).fill(value);
}

makeArray(3, 0);        // number[]
makeArray(3, "hello");  // string[]
\`\`\`

### 9.8.3 类型守卫工厂

\`\`\`tsx
// 创建"判断某个字段存在"的类型守卫
function hasKey<K extends string>(key: K) {
  return function <T>(obj: T): obj is T & Record<K, unknown> {
    return typeof obj === "object" && obj !== null && key in obj;
  };
}

const hasId = hasKey("id");
const obj = { name: "张三", id: 1 };

if (hasId(obj)) {
  // obj 现在一定有 id 字段
  console.log("ID:", (obj as any).id);
}
\`\`\`

## 9.9 泛型 vs any

| 维度 | \`<T>\` | \`any\` |
| --- | --- | --- |
| 类型安全 | 完整 | 完全丧失 |
| 推断 | 调用时精确 | 一律 any |
| IDE 补全 | 完整 | 无 |
| 适用场景 | 通用工具、容器 | 临时绕过 |

**原则**：能用泛型就别用 any。

## 9.10 综合 Demo：通用数据层

\`\`\`tsx
// 第九章综合 demo：实现一个迷你数据访问层
// 演示：泛型函数、接口、类、约束、默认类型

// 1. 实体类型（领域对象）
interface User {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

// 2. 通用 Repository（CRUD）
// 这是经典的"仓储模式"
class Repository<T extends { id: string }> {
  private store = new Map<string, T>();

  // 增
  create(entity: T): T {
    this.store.set(entity.id, entity);
    return entity;
  }

  // 查单个
  findById(id: string): T | undefined {
    return this.store.get(id);
  }

  // 查所有
  findAll(): T[] {
    return Array.from(this.store.values());
  }

  // 改
  update(id: string, patch: Partial<T>): T | undefined {
    const existing = this.store.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch };
    this.store.set(id, updated);
    return updated;
  }

  // 删
  delete(id: string): boolean {
    return this.store.delete(id);
  }

  // 条件查
  findBy<K extends keyof T>(key: K, value: T[K]): T[] {
    return this.findAll().filter(item => item[key] === value);
  }
}

// 3. 使用
const userRepo = new Repository<User>();
const u1 = userRepo.create({ id: "u1", name: "张三", email: "a@b.c" });
const u2 = userRepo.create({ id: "u2", name: "李四", email: "b@c.d" });

console.log("全部用户：", userRepo.findAll());
console.log("按 ID 查：", userRepo.findById("u1"));
console.log("按 email 查：", userRepo.findBy("email", "b@c.d"));

userRepo.update("u1", { name: "张三丰" });
console.log("更新后：", userRepo.findById("u1"));

// 4. 通用 API 响应
interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  meta?: { timestamp: number };
}

function makeResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data, meta: { timestamp: Date.now() } };
}

const userRes = makeResponse<User>(u1);
const listRes = makeResponse<User[]>([u1, u2]);
console.log("用户响应：", userRes);
console.log("列表响应：", listRes);

// 5. 通用函数：pick
function pick<T, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

const summary = pick(u1, ["id", "name"]);
console.log("摘要：", summary);

// 6. 通用缓存
class Cache<K, V> {
  private store = new Map<K, { value: V; expiresAt: number }>();

  set(key: K, value: V, ttlMs: number = 60000): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }
}

const userCache = new Cache<string, User>();
userCache.set("u1", u1, 5000);
console.log("缓存命中：", userCache.get("u1")?.name);

// 7. 泛型 + 默认类型
interface Paginated<T, M = unknown> {
  items: T[];
  total: number;
  meta?: M;
}

const page1: Paginated<User> = {
  items: [u1, u2],
  total: 2,
};

const page2: Paginated<User, { page: number; perPage: number }> = {
  items: [u1],
  total: 1,
  meta: { page: 1, perPage: 10 },
};

console.log("分页：", page1);
\`\`\`

## 小结

- 泛型用 \`<T>\` 声明类型参数，让代码既能复用又类型安全。
- 泛型可应用于函数、接口、类，覆盖 90% 通用工具场景。
- **\`T extends X\`** 是约束，要求 T 必须满足某个形状。
- \`K extends keyof T\` 是"取对象键"的标准模式，配合 \`T[K]\` 实现通用对象工具。
- 默认泛型让"省略类型参数"成为可能（如 React 的 \`useState\`）。
- \`infer\` 在条件类型中提取类型信息，是高级推导的基础。
- 静态成员不能使用类的类型参数（TS 设计）。
- Repository、Cache、API Response 等是泛型的经典实战场景。
`,
  },

  // ============================================================
  // 第十章：高级类型工具
  // ============================================================
  {
    id: "tsx2-ch10",
    group: "第二部分 TypeScript 类型进阶",
    icon: "🛠️",
    title: "第十章 高级类型工具",
    content: `# 第十章 高级类型工具

TS 内置了一套非常丰富的类型工具，覆盖了对象操作、函数解构、Promise 拆包、条件类型、映射类型、模板字面量类型等几乎所有日常开发场景。**熟练掌握这些工具能让你写出"以一当十"的类型代码**。本章是第二部分的最后一章，学完后你就具备"读懂任何 TS 源码类型"的能力。

## 10.1 对象操作工具类型

### 10.1.1 \`Partial<T>\`：所有字段变可选

\`\`\`tsx
interface User {
  id: number;
  name: string;
  age: number;
}

type PartialUser = Partial<User>;
// 等价于 { id?: number; name?: string; age?: number; }

function update(id: number, patch: Partial<User>) {
  // patch 里所有字段都可以不传
}

update(1, { name: "张三" });  // ✓
update(1, {});                // ✓
\`\`\`

**实现原理**（了解即可）：
\`\`\`tsx
type MyPartial<T> = { [K in keyof T]?: T[K] };
\`\`\`

### 10.1.2 \`Required<T>\`：所有字段变必填

\`\`\`tsx
interface User {
  id?: number;
  name?: string;
}

type RequiredUser = Required<User>;
// { id: number; name: string }
\`\`\`

\`Required\` 是 \`Partial\` 的逆操作。

### 10.1.3 \`Readonly<T>\`：所有字段变只读

\`\`\`tsx
type ReadonlyUser = Readonly<User>;
// { readonly id: number; readonly name: string; ... }

const u: ReadonlyUser = { id: 1, name: "张三" };
// u.name = "李四";  // ❌
\`\`\`

### 10.1.4 \`Pick<T, K>\`：挑选字段

\`\`\`tsx
type UserPreview = Pick<User, "id" | "name">;
// { id: number; name: string }
\`\`\`

\`K extends keyof T\`，只能挑存在的键。

### 10.1.5 \`Omit<T, K>\`：排除字段

\`\`\`tsx
type UserWithoutAge = Omit<User, "age">;
// { id: number; name: string }
\`\`\`

**实现**：\`Pick<T, Exclude<keyof T, K>>\`（Omit 是 Pick + Exclude 组合）。

### 10.1.6 \`Record<K, T>\`：构造映射类型

\`\`\`tsx
type Roles = "admin" | "user" | "guest";
type RoleMap = Record<Roles, number>;
// { admin: number; user: number; guest: number }

const roleMap: RoleMap = {
  admin: 1,
  user: 2,
  guest: 3,
};
\`\`\`

\`Record\` 适合"键集合已知、值类型统一"的场景。

## 10.2 联合操作工具类型

### 10.2.1 \`Exclude<T, U>\`：从 T 排除 U

\`\`\`tsx
type All = "a" | "b" | "c" | "d";
type WithoutBC = Exclude<All, "b" | "c">; // "a" | "d"
\`\`\`

### 10.2.2 \`Extract<T, U>\`：从 T 提取 U

\`\`\`tsx
type All = "a" | "b" | "c" | "d";
type OnlyBC = Extract<All, "b" | "c">; // "b" | "c"
\`\`\`

**记忆**：Exclude 是"剔除"，Extract 是"保留"。

### 10.2.3 \`NonNullable<T>\`：排除 null 和 undefined

\`\`\`tsx
type MaybeString = string | null | undefined;
type DefinitelyString = NonNullable<MaybeString>; // string
\`\`\`

## 10.3 函数工具类型

### 10.3.1 \`ReturnType<T>\`：函数返回类型

\`\`\`tsx
function f() { return { x: 10, y: 20 }; }
type FReturn = ReturnType<typeof f>; // { x: number; y: number }
\`\`\`

### 10.3.2 \`Parameters<T>\`：函数参数元组

\`\`\`tsx
function f(a: string, b: number, c: boolean) { /* ... */ }
type FParams = Parameters<typeof f>; // [string, number, boolean]
\`\`\`

### 10.3.3 \`Awaited<T>\`：解 Promise 包

\`\`\`tsx
type A = Awaited<Promise<string>>; // string
type B = Awaited<Promise<Promise<number>>>; // number
type C = Awaited<string>; // string（非 Promise 原样返回）
\`\`\`

### 10.3.4 \`ConstructorParameters<T>\`：构造函数参数

\`\`\`tsx
class Person {
  constructor(public name: string, public age: number) {}
}

type CtorParams = ConstructorParameters<typeof Person>;
// [string, number]
\`\`\`

### 10.3.5 \`InstanceType<T>\`：构造函数返回的实例类型

\`\`\`tsx
type PersonInstance = InstanceType<typeof Person>;
// Person
\`\`\`

## 10.4 条件类型

条件类型是 TS 类型系统里的"三元运算符"：\`T extends U ? X : Y\`。

### 10.4.1 基本形式

\`\`\`tsx
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">; // true
type B = IsString<42>;      // false
\`\`\`

### 10.4.2 分布式条件类型

当 \`T\` 是联合类型时，**条件类型会"分布式"应用**到每个成员：

\`\`\`tsx
type ToArray<T> = T extends any ? T[] : never;
type StrOrNum = ToArray<string | number>;
// (string[] | number[])：string[] | number[]
\`\`\`

去掉分布式：用元组包裹 \`[T]\`：

\`\`\`tsx
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type Test = ToArrayNonDist<string | number>;
// (string | number)[]
\`\`\`

### 10.4.3 \`infer\`：在条件类型中提取

\`\`\`tsx
// 提取函数返回类型
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type Func = () => number;
type R = MyReturnType<Func>; // number

// 提取数组元素
type ElementOf<T> = T extends (infer E)[] ? E : never;

type E = ElementOf<string[]>; // string
\`\`\`

### 10.4.4 多个 infer

\`\`\`tsx
// 提取 Promise 内部 + 函数参数
type Complex<T> =
  T extends Promise<infer U>
    ? U extends (...args: infer A) => infer R
      ? { args: A; return: R }
      : never
    : never;

type Test = Complex<Promise<(x: number) => string>>;
// { args: [number]; return: string }
\`\`\`

## 10.5 映射类型（Mapped Types）

映射类型让你"批量转换"一个对象类型的属性。

### 10.5.1 基本形式

\`\`\`tsx
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

interface User { id: number; name: string; }
type ReadonlyUser = MyReadonly<User>;
// { readonly id: number; readonly name: string; }
\`\`\`

### 10.5.2 修饰符：+/-/? 

\`\`\`tsx
// 移除 readonly
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

// 添加可选
type Optional<T> = {
  [K in keyof T]?: T[K];
};

// 移除可选
type Concrete<T> = {
  [K in keyof T]-?: T[K];
};
\`\`\`

### 10.5.3 键重映射（as）

TS 4.1+ 支持用 \`as\` 重新映射键：

\`\`\`tsx
// 给所有键加前缀
type Prefixed<T> = {
  [K in keyof T as \`prefix_\${string & K}\`]: T[K];
};

type T = Prefixed<{ a: number; b: string }>;
// { prefix_a: number; prefix_b: string }
\`\`\`

## 10.6 模板字面量类型

字符串字面量类型 + 模板字符串：

\`\`\`tsx
type Greeting = \`hello, \${string}\`;
// 任何 "hello, ..." 开头的字符串

const a: Greeting = "hello, world"; // ✓
const b: Greeting = "hi, world";     // ❌

// CSS 单位
type CssUnit = \`\${number}px\` | \`\${number}rem\` | \`\${number}%\`;

const w: CssUnit = "100px";  // ✓
const h: CssUnit = "50rem";  // ✓
const x: CssUnit = "100";    // ❌
\`\`\`

### 10.6.1 配合 keyof

\`\`\`tsx
// 给对象所有键加 getter 前缀
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

interface User { id: number; name: string; }
type UserGetters = Getters<User>;
// { getId: () => number; getName: () => string }
\`\`\`

## 10.7 内置工具类型速查表

| 工具 | 作用 | 等价实现 |
| --- | --- | --- |
| \`Partial<T>\` | 全部变可选 | \`{ [K in keyof T]?: T[K] }\` |
| \`Required<T>\` | 全部变必填 | \`{ [K in keyof T]-?: T[K] }\` |
| \`Readonly<T>\` | 全部变只读 | \`{ readonly [K in keyof T]: T[K] }\` |
| \`Pick<T, K>\` | 挑选字段 | — |
| \`Omit<T, K>\` | 排除字段 | \`Pick<T, Exclude<keyof T, K>>\` |
| \`Record<K, T>\` | 构造对象 | \`{ [P in K]: T }\` |
| \`Exclude<T, U>\` | 联合排除 | — |
| \`Extract<T, U>\` | 联合提取 | — |
| \`NonNullable<T>\` | 排除 null/undefined | — |
| \`ReturnType<T>\` | 函数返回 | \`T extends (...a)=>infer R ? R : never\` |
| \`Parameters<T>\` | 函数参数 | \`T extends (...a: infer P)=>any ? P : never\` |
| \`Awaited<T>\` | 解 Promise | 递归 \`T extends Promise<infer U> ? Awaited<U> : T\` |
| \`InstanceType<T>\` | 构造实例 | \`T extends new (...a)=>infer R ? R : never\` |
| \`ConstructorParameters<T>\` | 构造参数 | \`T extends new (...a: infer P)=>any ? P : never\` |

## 10.8 综合 Demo：API 客户端类型层

\`\`\`tsx
// 第十章综合 demo：实现一个强类型 API 客户端
// 演示：高级工具类型 + 条件类型 + 模板字面量

// 1. 基础响应
interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

// 2. 用户
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

// 3. 用 Omit/Pick 派生不同视图
type UserPreview = Pick<User, "id" | "name">;
type UserCreate = Omit<User, "id">;
type UserUpdate = Partial<Omit<User, "id">>;

// 4. 路由配置
interface RouteMap {
  "/users": { method: "GET"; response: User[] };
  "/users/:id": { method: "GET"; params: { id: string }; response: User };
  "/users": { method: "POST"; body: UserCreate; response: User };
  "/users/:id": { method: "PUT"; params: { id: string }; body: UserUpdate; response: User };
  "/users/:id": { method: "DELETE"; params: { id: string }; response: { success: boolean } };
}

// 5. 强类型 fetch 函数
// 根据 path 推导出 params/body/response
async function request<P extends keyof RouteMap>(
  path: P,
  ...args: RouteMap[P] extends { params: infer Params }
    ? RouteMap[P] extends { body: infer Body }
      ? [params: Params, body: Body]
      : RouteMap[P] extends { body: infer Body }
        ? [body: Body]
        : RouteMap[P] extends { params: infer P2 }
          ? [params: P2]
          : []
    : []
): Promise<ApiResponse<RouteMap[P]["response"]>> {
  // 真实项目里这里会调 fetch
  // 沙箱里我们模拟
  const mock = { code: 0, data: null as any, message: "ok" };
  return mock as any;
}

// 6. 用例（类型完全自动推断）
async function main() {
  // GET /users
  const list = await request("/users");
  // list.data: User[]

  // GET /users/:id
  const one = await request("/users/:id", { id: "u1" });
  // one.data: User

  // POST /users
  const created = await request("/users", { name: "张三", email: "a@b.c", age: 30 });
  // body 类型: UserCreate

  // PUT /users/:id
  const updated = await request("/users/:id", { id: "u1" }, { name: "李四" });
  // body 类型: UserUpdate

  console.log("列表：", list);
  console.log("单个：", one);
  console.log("创建：", created);
  console.log("更新：", updated);
}

main().catch(console.error);

// 7. 模板字面量类型：构造 CSS 单位工具
type CssUnit = \`\${number}px\` | \`\${number}rem\` | \`\${number}%\` | \`\${number}em\` | \`\${number}vh\` | \`\${number}vw\`;

function setSize(width: CssUnit, height: CssUnit): void {
  console.log(\`width: \${width}; height: \${height};\`);
}

setSize("100px", "200rem");
setSize("50%", "30vh");

// 8. 模板字面量 + 映射：构造事件名
type EventName<T extends string> = \`on\${Capitalize<T>}\`;

interface Events {
  click: void;
  focus: string;
  blur: void;
}

type EventHandlers = {
  [K in keyof Events as EventName<K>]: (payload: Events[K]) => void;
};
// { onClick: (p: void) => void; onFocus: (p: string) => void; onBlur: (p: void) => void }

const handlers: EventHandlers = {
  onClick: () => console.log("clicked"),
  onFocus: (msg) => console.log("focused:", msg),
  onBlur: () => console.log("blurred"),
};
handlers.onClick();
handlers.onFocus("hello");

// 9. 条件类型 + infer：自定义工具
// 提取 Promise 内部
type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T;

type A = UnwrapPromise<Promise<Promise<string>>>; // string

// 提取数组第一个元素
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;

type F1 = First<[number, string, boolean]>; // number
type F2 = First<[]>; // never
\`\`\`

## 小结

- TS 内置工具类型覆盖 90% 日常类型操作。
- 对象类：\`Partial\` / \`Required\` / \`Readonly\` / \`Pick\` / \`Omit\` / \`Record\`。
- 联合类：\`Exclude\` / \`Extract\` / \`NonNullable\`。
- 函数类：\`ReturnType\` / \`Parameters\` / \`Awaited\` / \`InstanceType\`。
- **条件类型** \`T extends U ? X : Y\` 是类型世界的三元运算符，**联合类型会分布式应用**。
- \`infer\` 在条件类型里提取信息，是高级推导的核心。
- 映射类型 \`{ [K in keyof T]: ... }\` 批量转换对象属性。
- 模板字面量类型让字符串也能像类型一样被精确约束。
- 组合这些工具可以构造"接近编程语言"的类型系统（像 Zod、tRPC 这种库就是这么干的）。
`,
  },
];

export { chapters };
