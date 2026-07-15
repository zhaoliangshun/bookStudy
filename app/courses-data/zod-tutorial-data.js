// =============================================================
// Zod 教程章节数据
// -------------------------------------------------------------
// Zod 是一个以 TypeScript 优先的运行时数据校验库。
// 本教程聚焦日常开发最常用的功能，每章配有详细讲解与可运行示例。
//
// 代码运行环境说明：
//   - 代码在 Node.js vm 沙箱中执行，假设 zod 已全局可用
//   - 每段示例顶部用 const { z } = require("zod") 引入
//   - 用 console.log 输出校验结果
// =============================================================

export const zodChapters = [
  // =========================================================
  // 第一章：Zod 是什么？为什么需要它？
  // =========================================================
  {
    id: "zod-intro",
    icon: "🛡️",
    group: "快速入门",
    title: "Zod 是什么？为什么需要它？",
    content: `## 什么是 Zod？

**Zod** 是一个以 TypeScript 优先的**运行时数据校验库**。它让你用声明式的方式定义数据的"形状"（Schema），然后在程序运行时校验任意数据是否符合这个形状——无论数据来自用户表单、API 响应、配置文件还是环境变量。

一句话概括：**Zod = 运行时的类型系统**。

### 为什么需要运行时校验？

很多人会问：我用了 TypeScript，为什么还需要 Zod？答案是：

**TypeScript 的类型只在编译时存在，运行时全部消失。**

\`\`\`ts
// TypeScript 编译后，下面的类型注解会被完全擦除
interface User { id: number; name: string; }
function getUser(id: number): User { /* ... */ }
\`\`\`

这意味着 TypeScript 只能保证**你自己写的代码**类型正确，但无法保证**来自外部的数据**符合类型。外部数据包括：

- **用户输入**：表单提交、URL 参数，永远不可信
- **API 响应**：后端改了字段，前端 TS 类型却不知道
- **配置文件**：JSON 配置写错了一个字段名
- **环境变量**：\`process.env.PORT\` 永远是字符串，不是数字

没有运行时校验，你只能用 \`as\` 强制断言：

\`\`\`ts
const data = (await res.json()) as User; // 危险！只是骗过编译器，运行时可能根本不是 User
\`\`\`

\`as\` 是一个谎言——它不检查任何东西，只是让编译器闭嘴。当 API 真的返回了不符合结构的数据，你的程序会在某个莫名其妙的角落崩溃。

### Zod 解决了什么

Zod 让你**用一份 Schema 同时获得**：

1. **运行时校验**：数据不合规则立即报错，不会让脏数据流进业务逻辑
2. **静态类型推导**：通过 \`z.infer\` 自动推导出 TypeScript 类型，类型与校验逻辑永远同步
3. **友好的错误信息**：告诉用户/开发者具体哪个字段出了什么问题

### Zod 的核心概念

#### Schema（模式）

Schema 是对数据形状的描述。Zod 提供了一组基础构造器来定义 Schema：

\`\`\`js
const { z } = require("zod");

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});
\`\`\`

#### parse（解析）

\`parse(data)\` 会校验数据。**校验通过返回解析后的数据，校验失败直接抛出 \`ZodError\` 异常**。

\`\`\`js
UserSchema.parse({ id: 1, name: "张三", email: "a@b.com" }); // ✅ 通过
UserSchema.parse({ id: "abc" }); // ❌ 抛出 ZodError
\`\`\`

#### safeParse（安全解析）

\`safeParse(data)\` 不会抛异常，而是返回一个 \`{ success, data, error }\` 对象。**适合处理用户输入**，因为你不想让一个校验失败直接让程序崩溃。

\`\`\`js
const result = UserSchema.safeParse(input);
if (result.success) {
  console.log(result.data);  // 校验通过的数据
} else {
  console.log(result.error); // 详细的错误信息
}
\`\`\`

### parse vs safeParse：什么时候用哪个？

| 场景 | 推荐用法 | 原因 |
| --- | --- | --- |
| 校验**外部不可信输入**（表单、API） | \`safeParse\` | 不想让脏数据让程序崩溃，要友好地提示错误 |
| 校验**内部可信数据**或解析后立即用 | \`parse\` | 如果连内部数据都出错，说明有 bug，应该抛异常暴露 |
| 加载**环境变量**、启动配置 | \`parse\` | 配置错了就该让程序启动失败（fail fast） |

### Zod 的设计哲学

- **单一数据源**：一份 Schema 既是运行时校验器，又是类型定义，杜绝"类型和校验不一致"
- **组合式**：用基础类型组合出复杂结构，可任意嵌套
- **不可变**：\`z.string().min(3)\` 不会修改原 Schema，而是返回新 Schema
- **Tree-shakable**：按需引入，打包体积可控

下面运行示例，直观感受 Zod 的基本用法。`,
    code: `// 第一章：Zod 是什么？—— 感受运行时校验
const { z } = require("zod");

// 定义一个用户 Schema
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

console.log("========== 1. parse：校验通过 ==========");
const ok = UserSchema.parse({ id: 1, name: "张三", email: "a@b.com" });
console.log("解析结果:", ok);

console.log("\\n========== 2. parse：校验失败抛异常 ==========");
try {
  UserSchema.parse({ id: "abc", name: "李四" }); // id 不是数字，email 缺失
} catch (err) {
  console.log("抛出异常:", err.constructor.name);
  console.log("错误信息:", err.errors[0].message);
}

console.log("\\n========== 3. safeParse：安全解析不抛异常 ==========");
const result = UserSchema.safeParse({ id: 99, name: "王五", email: "bad-email" });
console.log("是否通过:", result.success);
if (!result.success) {
  console.log("错误数量:", result.error.issues.length);
  console.log("第一个错误:", result.error.issues[0]);
}

console.log("\\n========== 4. safeParse 通过时拿到数据 ==========");
const good = UserSchema.safeParse({ id: 7, name: "赵六", email: "x@y.com" });
if (good.success) {
  console.log("拿到的数据:", good.data);
  console.log("name 字段:", good.data.name);
}`,
  },

  // =========================================================
  // 第二章：安装与第一个 Schema
  // =========================================================
  {
    id: "zod-install",
    icon: "📦",
    group: "快速入门",
    title: "安装与第一个 Schema",
    content: `## 安装 Zod

Zod 通过 npm 安装，零运行时依赖：

\`\`\`bash
npm install zod
# 或 yarn / pnpm
yarn add zod
pnpm add zod
\`\`\`

安装后在文件中引入：

\`\`\`js
const { z } = require("zod");
// ESM:
// import { z } from "zod";
\`\`\`

\`z\` 是 Zod 的命名空间入口，几乎所有 API 都挂在它上面。

## 第一个 Schema：注册表单

我们来定义一个真实可用的注册表单 Schema，覆盖常见约束：

\`\`\`js
const RegisterSchema = z.object({
  username: z.string().min(3).max(20),     // 3-20 个字符
  email: z.string().email(),              // 合法邮箱
  password: z.string().min(8),            // 至少 8 位
  age: z.number().int().min(18),          // 整数且 >= 18
  agree: z.boolean(),                     // 必须勾选
});
\`\`\`

这就是一个完整的"注册数据契约"。它同时表达了：

1. **运行时**：\`parse\` 会逐字段校验
2. **类型层**：\`z.infer<typeof RegisterSchema>\` 推导出对应 TS 类型

## 链式调用

Zod 的 API 是**链式**的，每个校验方法都返回一个新的 Schema：

\`\`\`js
z.string()            // 字符串 Schema
  .min(3)             // 最少 3 字符
  .max(20)            // 最多 20 字符
  .trim()             // 解析时去除首尾空格
  .toLowerCase();     // 解析时转小写
\`\`\`

链式顺序通常不影响结果，但 **transform 类方法（trim/toLowerCase/transform）的执行顺序**会有影响，建议把格式化方法放在最后。

## 解析时的数据"清洗"

很多 \`parse\` 不只是校验，还会**修改数据**（例如 \`trim\` 去空格、\`default\` 填默认值、\`coerce\` 强制转换）。所以记住：

> **parse 返回的数据 ≠ 原始输入数据**。永远使用 parse 返回的结果，不要继续用原始输入。

\`\`\`js
const Schema = z.string().trim().default("匿名");
Schema.parse("   ");  // 返回 "匿名"，而不是 "   "
\`\`\`

## 嵌套对象

Schema 可以任意嵌套，这正是 Zod 强大的地方：

\`\`\`js
const OrderSchema = z.object({
  orderId: z.string(),
  items: z.array(z.object({
    name: z.string(),
    price: z.number().positive(),
    qty: z.number().int().positive(),
  })),
  address: z.object({
    city: z.string(),
    zip: z.string(),
  }),
});
\`\`\`

运行示例体会一下。`,
    code: `// 第二章：第一个完整 Schema
const { z } = require("zod");

// 注册表单 Schema
const RegisterSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().int().min(18),
  agree: z.boolean(),
});

console.log("========== 1. 合法数据 ==========");
const valid = {
  username: "alice",
  email: "alice@example.com",
  password: "supersecret",
  age: 25,
  agree: true,
};
console.log("校验结果:", RegisterSchema.safeParse(valid).success);

console.log("\\n========== 2. 多个字段非法 ==========");
const invalid = {
  username: "ab",          // 太短
  email: "not-an-email",   // 非邮箱
  password: "123",        // 太短
  age: 16,                // 未成年
  agree: false,           // 没勾选
};
const r = RegisterSchema.safeParse(invalid);
console.log("校验结果:", r.success);
console.log("错误数量:", r.error.issues.length);
r.error.issues.forEach((issue, i) => {
  console.log("  错误" + (i + 1) + " 路径:", issue.path.join("."), "| 信息:", issue.message);
});

console.log("\\n========== 3. 嵌套对象 ==========");
const OrderSchema = z.object({
  orderId: z.string(),
  items: z.array(z.object({
    name: z.string(),
    price: z.number().positive(),
    qty: z.number().int().positive(),
  })),
});
const order = {
  orderId: "ORD-001",
  items: [
    { name: "键盘", price: 299, qty: 1 },
    { name: "鼠标", price: 99, qty: 2 },
  ],
};
const parsed = OrderSchema.parse(order);
console.log("订单解析成功，商品数:", parsed.items.length);
console.log("总价:", parsed.items.reduce((s, it) => s + it.price * it.qty, 0));`,
  },

  // =========================================================
  // 第三章：基础类型
  // =========================================================
  {
    id: "zod-primitives",
    icon: "🔤",
    group: "基础类型",
    title: "基础类型（string/number/boolean/date）",
    content: `## 基础类型概览

Zod 提供了与 JavaScript 原始类型一一对应的 Schema 构造器：

| 构造器 | 校验类型 | 说明 |
| --- | --- | --- |
| \`z.string()\` | string | 字符串 |
| \`z.number()\` | number | 数字（含小数） |
| \`z.bigint()\` | bigint | 大整数 |
| \`z.boolean()\` | boolean | 布尔值 |
| \`z.date()\` | Date | Date 对象（不是字符串） |
| \`z.symbol()\` | symbol | Symbol |
| \`z.null()\` | null | 仅 null |
| \`z.undefined()\` | undefined | 仅 undefined |
| \`z.any()\` | any | 任意值（不校验，谨慎用） |
| \`z.unknown()\` | unknown | 任意值但需先校验 |
| \`z.void()\` | void | undefined |

### string

\`z.string()\` 只接受字符串类型，其他类型一律拒绝：

\`\`\`js
z.string().parse("hello"); // ✅
z.string().parse(42);      // ❌ 期望 string，收到 number
z.string().parse(true);   // ❌
\`\`\`

注意：**空字符串 \`""\` 也是合法的 string**。如果要求非空，要加 \`.min(1)\`。

### number

\`z.number()\` 接受任意数字（整数、小数、负数、0），但拒绝 \`NaN\`：

\`\`\`js
z.number().parse(42);     // ✅
z.number().parse(3.14);   // ✅
z.number().parse(-1);     // ✅
z.number().parse("42");   // ❌ 字符串不是数字
z.number().parse(NaN);    // ❌ NaN 被拒绝
\`\`\`

### boolean

只接受 \`true\` / \`false\`。注意 **\`0\` 和 \`1\` 不会被当作布尔值**（不像 Python）：

\`\`\`js
z.boolean().parse(true);   // ✅
z.boolean().parse(1);      // ❌
z.boolean().parse("true"); // ❌
\`\`\`

如果要把 \`"true"\` / \`1\` 转成布尔，用 \`z.coerce.boolean()\`（见强制转换章节）。

### date

\`z.date()\` 接受 **Date 对象**，不是日期字符串：

\`\`\`js
z.date().parse(new Date());       // ✅
z.date().parse("2024-01-01");     // ❌ 字符串不是 Date
z.date().parse(1700000000000);    // ❌ 时间戳不是 Date
\`\`\`

如果输入是字符串/时间戳，用 \`z.coerce.date()\` 或 \`z.string().datetime()\`。

### any vs unknown

- \`z.any()\`：接受任意值且**不做任何后续校验**，相当于关闭了类型安全。**尽量避免使用**，它会让类型变成 \`any\`，丢失所有保护。
- \`z.unknown()\`：也接受任意值，但**使用前必须先用其他 Schema 校验**，更安全。

\`\`\`js
const S = z.unknown();
const r = S.parse("任意东西"); // 通过，但 r 是 unknown 类型
// r.toUpperCase(); // ❌ TS 报错，必须先收窄
\`\`\`

### literal

\`z.literal()\` 校验数据是否等于某个**字面量值**：

\`\`\`js
z.literal("red").parse("red");   // ✅
z.literal("red").parse("blue");  // ❌
z.literal(42).parse(42);         // ✅
\`\`\`

字面量常用于枚举固定值，详见枚举章节。

下面运行示例，逐个体会每种基础类型的行为。`,
    code: `// 第三章：基础类型
const { z } = require("zod");

console.log("========== 1. string ==========");
console.log("字符串:", z.string().parse("hello"));
console.log("空串:", JSON.stringify(z.string().parse(""))); // 空串合法
console.log("数字给 string:", z.string().safeParse(42).success); // false

console.log("\\n========== 2. number ==========");
console.log("整数:", z.number().parse(42));
console.log("小数:", z.number().parse(3.14));
console.log("负数:", z.number().parse(-1));
console.log("字符串数字:", z.number().safeParse("42").success); // false
console.log("NaN:", z.number().safeParse(NaN).success); // false

console.log("\\n========== 3. boolean ==========");
console.log("true:", z.boolean().parse(true));
console.log("1 当布尔:", z.boolean().safeParse(1).success); // false

console.log("\\n========== 4. date ==========");
const now = z.date().parse(new Date());
console.log("Date 对象:", now instanceof Date, "| 年份:", now.getFullYear());
console.log("字符串当 date:", z.date().safeParse("2024-01-01").success); // false

console.log("\\n========== 5. bigint ==========");
console.log("bigint:", z.bigint().parse(9007199254740991n));
console.log("普通数当 bigint:", z.bigint().safeParse(9007199254740991).success); // false

console.log("\\n========== 6. literal ==========");
console.log("字面量 red:", z.literal("red").parse("red"));
console.log("字面量 42:", z.literal(42).parse(42));
console.log("不匹配:", z.literal("red").safeParse("blue").success); // false

console.log("\\n========== 7. any / unknown ==========");
console.log("any 接受对象:", z.any().parse({ a: 1 }));
const u = z.unknown().parse([1, 2, 3]);
console.log("unknown 接受数组:", u);`,
  },

  // =========================================================
  // 第四章：字符串校验
  // =========================================================
  {
    id: "zod-string-validation",
    icon: "✉️",
    group: "基础类型",
    title: "字符串校验（min/max/email/url/regex/uuid）",
    content: `## 字符串校验方法

字符串是开发中最常校验的类型。Zod 在 \`z.string()\` 上挂了一大批链式校验方法，分为三类。

### 长度校验

| 方法 | 作用 | 示例 |
| --- | --- | --- |
| \`.min(n)\` | 最少 n 个字符 | \`.min(3)\` |
| \`.max(n)\` | 最多 n 个字符 | \`.max(20)\` |
| \`.length(n)\` | 恰好 n 个字符 | \`.length(6)\`（如验证码） |

\`\`\`js
z.string().min(3).parse("ab");   // ❌ 太短
z.string().length(6).parse("123456"); // ✅ 6 位
\`\`\`

### 格式校验（format）

Zod 内置了常用格式校验，免去手写正则：

| 方法 | 校验内容 |
| --- | --- |
| \`.email()\` | 邮箱格式 |
| \`.url()\` | URL 格式 |
| \`.uuid()\` | UUID v4 |
| \`.cuid()\` | CUID |
| \`.ip()\` | IPv4/IPv6 |
| \`.datetime()\` | ISO 8601 日期时间 |
| \`.date()\` | YYYY-MM-DD 日期字符串 |
| \`.time()\` | HH:mm:ss 时间字符串 |
| \`.base64()\` | base64 编码 |

\`\`\`js
z.string().email().parse("a@b.com");    // ✅
z.string().url().parse("https://x.com"); // ✅
z.string().uuid().parse("550e8400-e29b-41d4-a716-446655440000"); // ✅
\`\`\`

**注意**：\`.datetime()\` 默认要求带时区（如 \`2024-01-01T00:00:00Z\`）。如果想要本地时间，用 \`.datetime({ local: true })\`。

### 自定义正则 \`.regex()\`

当内置格式不够时，用 \`.regex()\` 传正则：

\`\`\`js
// 手机号（简单示例）
const PhoneSchema = z.string().regex(/^1[3-9]\\d{9}$/, "请输入合法手机号");
PhoneSchema.parse("13800138000"); // ✅
\`\`\`

注意正则里的反斜杠在字符串中要双写 \`\\\\d\`。

### 清洗方法（会改变数据）

| 方法 | 作用 |
| --- | --- |
| \`.trim()\` | 去除首尾空格 |
| \`.toLowerCase()\` | 转小写 |
| \`.toUpperCase()\` | 转大写 |

这些方法在 parse 时会**修改数据**，所以要把清洗结果作为最终数据使用：

\`\`\`js
z.string().trim().parse("  hi  "); // 返回 "hi"
z.string().toLowerCase().parse("Hello"); // 返回 "hello"
\`\`\`

### 自定义错误信息

每个校验方法都接受第二个参数作为错误信息：

\`\`\`js
z.string().min(8, "密码至少 8 位").parse("123"); // 抛出，错误信息为 "密码至少 8 位"
\`\`\`

也可以传对象，针对不同错误分别定制：

\`\`\`js
z.string().email({ message: "邮箱格式不对" })
\`\`\`

下面运行示例。`,
    code: `// 第四章：字符串校验
const { z } = require("zod");

console.log("========== 1. 长度校验 ==========");
const Code = z.string().length(6);
console.log("6 位验证码:", Code.safeParse("123456").success);
console.log("5 位验证码:", Code.safeParse("12345").success);
console.log("7 位验证码:", Code.safeParse("1234567").success);

console.log("\\n========== 2. email / url / uuid ==========");
console.log("邮箱:", z.string().email().safeParse("hi@example.com").success);
console.log("非邮箱:", z.string().email().safeParse("not-email").success);
console.log("URL:", z.string().url().safeParse("https://abc.com").success);
console.log("非URL:", z.string().url().safeParse("abc.com").success);
console.log("UUID:", z.string().uuid().safeParse("550e8400-e29b-41d4-a716-446655440000").success);

console.log("\\n========== 3. datetime / date ==========");
console.log("datetime:", z.string().datetime().safeParse("2024-01-01T00:00:00Z").success);
console.log("date:", z.string().date().safeParse("2024-01-01").success);
console.log("非date:", z.string().date().safeParse("2024/01/01").success);

console.log("\\n========== 4. regex 自定义正则 ==========");
const Phone = z.string().regex(/^1[3-9]\\d{9}$/, "请输入合法手机号");
console.log("合法手机号:", Phone.safeParse("13800138000").success);
console.log("非法手机号:", Phone.safeParse("123456").success);
if (!Phone.safeParse("123456").success) {
  console.log("  错误信息:", Phone.safeParse("123456").error.issues[0].message);
}

console.log("\\n========== 5. 清洗方法 trim / toLowerCase ==========");
const Name = z.string().trim().toLowerCase();
console.log("原始:", JSON.stringify("  Hello World  "));
console.log("清洗后:", JSON.stringify(Name.parse("  Hello World  ")));

console.log("\\n========== 6. 自定义错误信息 ==========");
const Pwd = z.string().min(8, "密码至少 8 位");
const r = Pwd.safeParse("123");
console.log("错误信息:", r.error.issues[0].message);`,
  },

  // =========================================================
  // 第五章：数字校验
  // =========================================================
  {
    id: "zod-number-validation",
    icon: "🔢",
    group: "基础类型",
    title: "数字校验（min/max/int/positive/negative）",
    content: `## 数字校验方法

数字校验和字符串类似，也是链式调用。常用方法：

### 范围校验

| 方法 | 作用 | 等价数学表达 |
| --- | --- | --- |
| \`.min(n)\` | 不小于 n | x >= n |
| \`.max(n)\` | 不大于 n | x <= n |
| \`.gt(n)\` | 大于 n（不含） | x > n |
| \`.lt(n)\` | 小于 n（不含） | x < n |
| \`.gte(n)\` | 大于等于 | x >= n |
| \`.lte(n)\` | 小于等于 | x <= n |

\`\`\`js
z.number().min(0).parse(-1);   // ❌
z.number().max(100).parse(101); // ❌
z.number().gt(0).parse(0);     // ❌ 必须 > 0
\`\`\`

**\`.min(n)\` 等于 \`.gte(n)\`，\`.max(n)\` 等于 \`.lte(n)\`**。推荐用 \`min/max\`，更直观。

### 整数与符号

| 方法 | 作用 |
| --- | --- |
| \`.int()\` | 必须是整数 |
| \`.positive()\` | 正数（> 0） |
| \`.nonnegative()\` | 非负（>= 0） |
| \`.negative()\` | 负数（< 0） |
| \`.nonpositive()\` | 非正（<= 0） |

\`\`\`js
z.number().int().parse(3.14);     // ❌ 非整数
z.number().positive().parse(-1);  // ❌ 非正数
z.number().nonnegative().parse(0); // ✅
\`\`\`

### 其他

| 方法 | 作用 |
| --- | --- |
| \`.multipleOf(n)\` | 必须是 n 的倍数（如偶数校验 \`.multipleOf(2)\`） |
| \`.finite()\` | 必须有限数（拒绝 Infinity） |
| \`.step(n)\` | 同 multipleOf（旧名） |

\`\`\`js
z.number().multipleOf(5).parse(12); // ❌ 不是 5 的倍数
z.number().finite().parse(Infinity); // ❌
\`\`\`

### 实战：组合校验

常见组合场景：

\`\`\`js
// 年龄：18-120 的整数
const Age = z.number().int().min(18).max(120);
// 百分比：0-100
const Percent = z.number().min(0).max(100);
// 经纬度
const Lat = z.number().min(-90).max(90);
const Lng = z.number().min(-180).max(180);
// 端口号
const Port = z.number().int().min(1).max(65535);
\`\`\`

### 浮点数陷阱

记住 JS 的浮点精度问题在 Zod 中依然存在：

\`\`\`js
z.number().multipleOf(0.01).parse(0.1 + 0.2); // ❌ 0.30000000000000004 不是 0.01 的精确倍数
\`\`\`

涉及金额建议用整数（分）或字符串+decimal 库，不要直接用浮点 number。

### 自定义错误信息

每个方法同样支持自定义错误：

\`\`\`js
z.number().int("必须是整数").min(0, "不能为负数").parse(-1.5);
\`\`\`

下面运行示例。`,
    code: `// 第五章：数字校验
const { z } = require("zod");

console.log("========== 1. 范围 min/max/gt/lt ==========");
const Score = z.number().min(0).max(100);
console.log("60 分:", Score.safeParse(60).success);
console.log("-1 分:", Score.safeParse(-1).success);
console.log("101 分:", Score.safeParse(101).success);
console.log("gt(0):", z.number().gt(0).safeParse(0).success); // false
console.log("min(0):", z.number().min(0).safeParse(0).success); // true

console.log("\\n========== 2. 整数与符号 ==========");
console.log("int(3):", z.number().int().safeParse(3).success);
console.log("int(3.14):", z.number().int().safeParse(3.14).success);
console.log("positive(-1):", z.number().positive().safeParse(-1).success);
console.log("nonnegative(0):", z.number().nonnegative().safeParse(0).success);
console.log("negative(-5):", z.number().negative().safeParse(-5).success);

console.log("\\n========== 3. multipleOf / finite ==========");
console.log("multipleOf(5) 10:", z.number().multipleOf(5).safeParse(10).success);
console.log("multipleOf(5) 12:", z.number().multipleOf(5).safeParse(12).success);
console.log("finite(Infinity):", z.number().finite().safeParse(Infinity).success);

console.log("\\n========== 4. 实战组合 ==========");
const Age = z.number().int().min(18).max(120);
const Port = z.number().int().min(1).max(65535);
console.log("年龄 25:", Age.safeParse(25).success);
console.log("年龄 200:", Age.safeParse(200).success);
console.log("年龄 3.5:", Age.safeParse(3.5).success);
console.log("端口 8080:", Port.safeParse(8080).success);
console.log("端口 0:", Port.safeParse(0).success);
console.log("端口 99999:", Port.safeParse(99999).success);

console.log("\\n========== 5. 自定义错误信息 ==========");
const Pos = z.number().int("必须是整数").min(0, "不能为负数");
const r = Pos.safeParse(-1.5);
console.log("错误数量:", r.error.issues.length);
r.error.issues.forEach(i => console.log("  -", i.message));`,
  },

  // =========================================================
  // 第六章：数组与元组
  // =========================================================
  {
    id: "zod-array-tuple",
    icon: "📋",
    group: "基础类型",
    title: "数组与元组",
    content: `## 数组 z.array()

\`z.array(elementSchema)\` 定义一个数组，**每个元素**都要符合 elementSchema：

\`\`\`js
const NumArr = z.array(z.number());
NumArr.parse([1, 2, 3]);   // ✅
NumArr.parse([1, "2", 3]); // ❌ 第二个元素不是数字
NumArr.parse("123");       // ❌ 不是数组
\`\`\`

也可以用 \`.array()\` 简写：

\`\`\`js
z.string().array().parse(["a", "b"]); // ✅
\`\`\`

### 数组长度校验

| 方法 | 作用 |
| --- | --- |
| \`.min(n)\` | 至少 n 个元素 |
| \`.max(n)\` | 至多 n 个元素 |
| \`.length(n)\` | 恰好 n 个元素 |

\`\`\`js
z.array(z.string()).min(1).parse([]);   // ❌ 至少 1 个
z.array(z.number()).length(3).parse([1, 2]); // ❌ 必须 3 个
\`\`\`

### 非空数组

\`.nonempty()\` 要求至少 1 个元素，返回的元素类型从 \`T[]\` 变成 \`[T, ...T[]]\`（TS 中是非空元组）：

\`\`\`js
const Tags = z.array(z.string()).nonempty();
Tags.parse([]); // ❌
\`\`\`

### 元素校验

数组会逐个校验元素，错误信息里会带**元素下标**：

\`\`\`js
const r = z.array(z.number()).safeParse([1, "x", 3]);
r.error.issues[0].path; // [1] 指向第二个元素
\`\`\`

## 元组 z.tuple()

数组里每个元素类型相同时用 \`z.array\`。如果**每个位置类型不同且固定长度**，用 \`z.tuple\`：

\`\`\`js
const Triple = z.tuple([z.string(), z.number(), z.boolean()]);
Triple.parse(["hello", 42, true]); // ✅
Triple.parse([42, "hello", true]); // ❌ 顺序/类型不对
\`\`\`

元组常见于：坐标 \`[x, y]\`、返回值 \`[data, error]\`、CSV 行等。

### 元组 + rest 扩展

\`z.tuple([...]).rest(schema)\` 允许可变长度的尾部元素：

\`\`\`js
// 第一个是字符串标题，后面是任意多个数字
const T = z.tuple([z.string()]).rest(z.number());
T.parse(["成绩", 90, 80, 70]); // ✅
\`\`\`

### 数组 vs 元组选择

| 特征 | 用 z.array | 用 z.tuple |
| --- | --- | --- |
| 元素类型 | 都相同 | 各位置不同 |
| 长度 | 任意 | 固定（除非 rest） |
| 例子 | 标签列表 | [经度, 纬度] |

下面运行示例。`,
    code: `// 第六章：数组与元组
const { z } = require("zod");

console.log("========== 1. z.array 基础 ==========");
const NumArr = z.array(z.number());
console.log("[1,2,3]:", NumArr.safeParse([1, 2, 3]).success);
console.log("[1,'2',3]:", NumArr.safeParse([1, "2", 3]).success);
console.log("简写 .array():", z.string().array().safeParse(["a", "b"]).success);

console.log("\\n========== 2. 数组长度 ==========");
console.log("min(2) [1]:", z.array(z.number()).min(2).safeParse([1]).success);
console.log("max(2) [1,2,3]:", z.array(z.number()).max(2).safeParse([1, 2, 3]).success);
console.log("length(3) [1,2,3]:", z.array(z.number()).length(3).safeParse([1, 2, 3]).success);
console.log("nonempty []:", z.array(z.string()).nonempty().safeParse([]).success);

console.log("\\n========== 3. 元素错误带下标 ==========");
const r = z.array(z.number()).safeParse([1, "x", 3]);
console.log("错误路径:", r.error.issues[0].path);
console.log("错误信息:", r.error.issues[0].message);

console.log("\\n========== 4. z.tuple 元组 ==========");
const Coord = z.tuple([z.number(), z.number()]);
console.log("[1,2]:", Coord.safeParse([1, 2]).success);
console.log("[1]:", Coord.safeParse([1]).success);
console.log("[1,'2']:", Coord.safeParse([1, "2"]).success);

const Triple = z.tuple([z.string(), z.number(), z.boolean()]);
console.log("['hi',42,true]:", Triple.safeParse(["hi", 42, true]).success);
console.log("[42,'hi',true]:", Triple.safeParse([42, "hi", true]).success);

console.log("\\n========== 5. tuple + rest ==========");
const Scores = z.tuple([z.string()]).rest(z.number());
console.log("['成绩',90,80]:", Scores.safeParse(["成绩", 90, 80]).success);
console.log("['成绩']:", Scores.safeParse(["成绩"]).success);
console.log("['成绩',90,'x']:", Scores.safeParse(["成绩", 90, "x"]).success);

console.log("\\n========== 6. 嵌套数组 ==========");
const Matrix = z.array(z.array(z.number()));
console.log("矩阵:", Matrix.safeParse([[1, 2], [3, 4]]).success);
console.log("非矩阵:", Matrix.safeParse([[1, 2], [3, "x"]]).success);`,
  },

  // =========================================================
  // 第七章：对象验证
  // =========================================================
  {
    id: "zod-object",
    icon: "📦",
    group: "对象与组合",
    title: "对象验证（z.object/嵌套/可选/默认值）",
    content: `## z.object 基础

\`z.object()\` 是 Zod 中最重要的构造器，用于定义对象结构：

\`\`\`js
const User = z.object({
  id: z.number(),
  name: z.string(),
});
User.parse({ id: 1, name: "张三" }); // ✅
\`\`\`

### 默认行为：严格模式

默认情况下，Zod 对象会**剥离未知字段**（strip），不会报错：

\`\`\`js
const S = z.object({ a: z.number() });
S.parse({ a: 1, b: 2 }); // 返回 { a: 1 }，b 被剥离
\`\`\`

如果想拒绝多余字段，用 \`.strict()\`：

\`\`\`js
z.object({ a: z.number() }).strict().parse({ a: 1, b: 2 }); // ❌ 多了 b
\`\`\`

想保留多余字段原样，用 \`.passthrough()\`。

### 可选与默认值

| 写法 | 含义 |
| --- | --- |
| \`z.string()\` | 必填 |
| \`z.string().optional()\` | 可选（值可为 undefined） |
| \`z.string().nullable()\` | 可为 null |
| \`z.string().default("hi")\` | 缺失时填默认值 |
| \`z.string().nullish()\` | 可为 null 或 undefined |

\`\`\`js
const S = z.object({
  name: z.string(),                  // 必填
  age: z.number().optional(),        // 可省略
  role: z.string().default("user"),  // 缺省为 "user"
  nickname: z.string().nullable(),   // 可为 null
});
S.parse({ name: "张三" });
// 返回 { name: "张三", role: "user", nickname: undefined }
\`\`\`

### 嵌套对象

对象可以任意嵌套，错误信息会带完整路径：

\`\`\`js
const User = z.object({
  name: z.string(),
  address: z.object({
    city: z.string(),
    zip: z.string(),
  }),
});
User.parse({ name: "x", address: { city: "上海" } }); // ❌ zip 缺失
// 错误路径: ["address", "zip"]
\`\`\`

## 对象操作方法

Zod 提供一组强大的对象变换方法，让你可以基于已有 Schema 派生新的：

### .partial() —— 全部变可选

\`\`\`js
const User = z.object({ name: z.string(), age: z.number() });
const PartialUser = User.partial(); // 所有字段可选
PartialUser.parse({}); // ✅
\`\`\`

也可只让部分字段可选：\`.partial({ name: true })\`。

### .required() —— 与 partial 相反

### .extend() / .merge() —— 扩展字段

\`\`\`js
const Base = z.object({ id: z.number() });
const WithName = Base.extend({ name: z.string() });
// { id, name }
\`\`\`

### .pick() / .omit() —— 选/弃字段

\`\`\`js
const User = z.object({ id: z.number(), name: z.string(), email: z.string() });
User.pick({ name: true });    // 只留 { name }
User.omit({ email: true });  // 去掉 { email }
\`\`\`

### .keyof() —— 取键名

\`\`\`js
User.keyof(); // enum["id","name","email"]
\`\`\`

下面运行示例。`,
    code: `// 第七章：对象验证
const { z } = require("zod");

console.log("========== 1. 基础对象 ==========");
const User = z.object({
  id: z.number(),
  name: z.string(),
});
console.log("合法:", User.safeParse({ id: 1, name: "张三" }).success);
console.log("缺字段:", User.safeParse({ id: 1 }).success);

console.log("\\n========== 2. 未知字段处理 ==========");
const S = z.object({ a: z.number() });
console.log("默认 strip:", JSON.stringify(S.parse({ a: 1, b: 2 })));
console.log("strict 拒绝:", S.strict().safeParse({ a: 1, b: 2 }).success);
console.log("passthrough 保留:", JSON.stringify(S.passthrough().parse({ a: 1, b: 2 })));

console.log("\\n========== 3. 可选 / 默认值 / null ==========");
const Form = z.object({
  name: z.string(),
  age: z.number().optional(),
  role: z.string().default("user"),
  nickname: z.string().nullable(),
});
const parsed = Form.parse({ name: "张三", nickname: null });
console.log("解析结果:", JSON.stringify(parsed));

console.log("\\n========== 4. 嵌套对象 + 错误路径 ==========");
const Order = z.object({
  id: z.string(),
  buyer: z.object({
    name: z.string(),
    address: z.object({
      city: z.string(),
      zip: z.string(),
    }),
  }),
});
const r = Order.safeParse({ id: "1", buyer: { name: "x", address: { city: "上海" } } });
console.log("校验:", r.success);
console.log("错误路径:", r.error.issues[0].path.join("."));

console.log("\\n========== 5. partial / extend / pick / omit ==========");
const Base = z.object({ id: z.number(), name: z.string(), email: z.string() });
console.log("partial:", JSON.stringify(Base.partial().parse({})));
console.log("extend:", Object.keys(Base.extend({ age: z.number() }).shape));
console.log("pick:", Object.keys(Base.pick({ name: true }).shape));
console.log("omit:", Object.keys(Base.omit({ email: true }).shape));

console.log("\\n========== 6. keyof ==========");
console.log("keyof 选项:", Base.keyof().options);`,
  },

  // =========================================================
  // 第八章：枚举与字面量
  // =========================================================
  {
    id: "zod-enum-literal",
    icon: "🎯",
    group: "对象与组合",
    title: "枚举与字面量（z.enum/z.literal）",
    content: `## z.enum() —— 字符串枚举

\`z.enum()\` 限制值必须是预定义的几个字符串之一，等价于 TS 的字符串字面量联合类型：

\`\`\`js
const Role = z.enum(["admin", "user", "guest"]);
Role.parse("admin"); // ✅
Role.parse("root");  // ❌
\`\`\`

**注意**：\`z.enum\` 的参数必须是一个**字符串数组字面量**（TS 要求 \`as const\`），不能是变量。这是为了让 TS 推导出精确的联合类型。

### 取出所有枚举值

\`\`\`js
Role.options; // ["admin", "user", "guest"]
\`\`\`

### z.enum vs z.literal

- \`z.literal("a")\`：只匹配**单个**字面量
- \`z.enum(["a","b"])\`：匹配**多个**字面量之一（本质是多个 literal 的联合）

\`\`\`js
z.literal("yes").parse("yes");   // ✅
z.enum(["yes","no"]).parse("no"); // ✅
\`\`\`

如果是**非字符串**的固定值（数字、布尔），不能用 \`z.enum\`，要用 \`z.literal\` 联合：

\`\`\`js
// 只接受 0 或 1
const Code = z.union([z.literal(0), z.literal(1)]);
Code.parse(1); // ✅
\`\`\`

## z.nativeEnum() —— 包装 TS 枚举

如果你已经有 TS 的 \`enum\`，用 \`z.nativeEnum()\` 包装：

\`\`\`js
enum Color { Red, Green, Blue } // TS 语法
const ColorSchema = z.nativeEnum(Color);
ColorSchema.parse(Color.Red); // ✅
\`\`\`

注意：纯 JS 环境没有 \`enum\` 关键字，本教程代码用普通对象模拟：

\`\`\`js
const Color = { Red: 0, Green: 1, Blue: 2 };
z.nativeEnum(Color).parse(0); // ✅
\`\`\`

## 实战：状态机

枚举非常适合表示有限状态：

\`\`\`js
const OrderStatus = z.enum([
  "pending",    // 待支付
  "paid",       // 已支付
  "shipped",    // 已发货
  "completed",  // 已完成
  "cancelled",  // 已取消
]);
\`\`\`

下面运行示例。`,
    code: `// 第八章：枚举与字面量
const { z } = require("zod");

console.log("========== 1. z.enum 字符串枚举 ==========");
const Role = z.enum(["admin", "user", "guest"]);
console.log("admin:", Role.safeParse("admin").success);
console.log("root:", Role.safeParse("root").success);
console.log("所有选项:", Role.options);

console.log("\\n========== 2. z.literal 单个字面量 ==========");
const Yes = z.literal("yes");
console.log("yes:", Yes.safeParse("yes").success);
console.log("no:", Yes.safeParse("no").success);

console.log("\\n========== 3. 数字字面量联合 ==========");
const Code = z.union([z.literal(0), z.literal(1)]);
console.log("0:", Code.safeParse(0).success);
console.log("1:", Code.safeParse(1).success);
console.log("2:", Code.safeParse(2).success);

console.log("\\n========== 4. nativeEnum 包装对象 ==========");
const Status = { Pending: 0, Active: 1, Inactive: 2 };
const StatusSchema = z.nativeEnum(Status);
console.log("0:", StatusSchema.safeParse(0).success);
console.log("1:", StatusSchema.safeParse(1).success);
console.log("9:", StatusSchema.safeParse(9).success);

console.log("\\n========== 5. 实战：订单状态机 ==========");
const OrderStatus = z.enum(["pending", "paid", "shipped", "completed", "cancelled"]);
const Order = z.object({
  id: z.string(),
  status: OrderStatus,
  amount: z.number().positive(),
});
console.log("合法订单:", Order.safeParse({ id: "O1", status: "paid", amount: 99 }).success);
console.log("非法状态:", Order.safeParse({ id: "O2", status: "unknown", amount: 99 }).success);

console.log("\\n========== 6. 枚举与 switch 配合 ==========");
function handle(status) {
  const valid = OrderStatus.parse(status); // 校验 + 收窄
  switch (valid) {
    case "pending": return "等待支付";
    case "paid": return "已支付，准备发货";
    case "shipped": return "已发货";
    case "completed": return "已完成";
    case "cancelled": return "已取消";
  }
}
console.log("paid ->", handle("paid"));
console.log("shipped ->", handle("shipped"));`,
  },

  // =========================================================
  // 第九章：联合与交叉类型
  // =========================================================
  {
    id: "zod-union-intersection",
    icon: "🔀",
    group: "对象与组合",
    title: "联合与交叉类型（z.union/z.intersection/z.discriminatedUnion）",
    content: `## z.union() —— 联合类型（或）

\`z.union([A, B])\` 表示值只要**符合其中任意一个** Schema 即可，等价于 TS 的 \`A | B\`：

\`\`\`js
const ID = z.union([z.string(), z.number()]);
ID.parse("abc"); // ✅
ID.parse(42);     // ✅
ID.parse(true);   // ❌
\`\`\`

简写用 \`|\` 操作符（效果相同）：

\`\`\`js
const ID = z.string().or(z.number());
\`\`\`

### union 的校验顺序

union 会**按顺序逐个尝试**每个 Schema。第一个能通过的就用它。所以错误信息可能不够精确——如果都不通过，会显示一个"任意一个都不匹配"的笼统错误。

\`\`\`js
z.union([z.string(), z.number()]).safeParse(null).error;
// "Invalid input: expected string or number"
\`\`\`

## z.intersection() —— 交叉类型（且）

\`z.intersection([A, B])\` 表示值必须**同时满足**两个 Schema，等价于 TS 的 \`A & B\`：

\`\`\`js
const A = z.object({ name: z.string() });
const B = z.object({ age: z.number() });
const Person = z.intersection(A, B);
Person.parse({ name: "张三", age: 20 }); // ✅ 需同时有 name 和 age
\`\`\`

简写用 \`&\` 操作符：

\`\`\`js
const Person = A.and(B);
\`\`\`

> 实际开发中，对象交叉不如直接 \`z.object({...A.shape, ...B.shape})\` 或 \`.extend()\` 直观，推荐用后者。

## z.discriminatedUnion() —— 可辨识联合（推荐）

普通 \`z.union\` 在对象联合时性能差（要逐个完整校验），且错误信息模糊。\`z.discriminatedUnion\` 用一个**判别字段**快速区分：

\`\`\`js
const Shape = z.discriminatedUnion("type", [
  z.object({ type: z.literal("circle"), radius: z.number() }),
  z.object({ type: z.literal("square"), size: z.number() }),
]);
\`\`\`

它先读 \`type\` 字段，直接路由到对应 Schema。**性能更好，错误信息更精确**，是对象联合的首选。

### 实战场景

discriminatedUnion 特别适合：

- **API 响应**：\`{ status: "ok", data } | { status: "error", message }\`
- **消息类型**：\`{ kind: "text", content } | { kind: "image", url }\`
- **表单步骤**：多步表单的每步数据结构不同

### 联合 vs 可辨识联合选择

| 场景 | 推荐 |
| --- | --- |
| 简单类型联合（string\|number） | \`z.union\` |
| 对象联合，有共同判别字段 | \`z.discriminatedUnion\` |
| 对象联合，无判别字段 | \`z.union\`（凑合用） |

下面运行示例。`,
    code: `// 第九章：联合与交叉
const { z } = require("zod");

console.log("========== 1. z.union ==========");
const ID = z.union([z.string(), z.number()]);
console.log("字符串:", ID.safeParse("abc").success);
console.log("数字:", ID.safeParse(42).success);
console.log("布尔:", ID.safeParse(true).success);
console.log("简写 .or():", z.string().or(z.number()).safeParse(42).success);

console.log("\\n========== 2. union 错误信息 ==========");
const r = z.union([z.string(), z.number()]).safeParse(null);
console.log("错误:", r.error.issues[0].message);

console.log("\\n========== 3. z.intersection 交叉 ==========");
const HasName = z.object({ name: z.string() });
const HasAge = z.object({ age: z.number() });
const Person = z.intersection(HasName, HasAge);
console.log("两者都有:", Person.safeParse({ name: "x", age: 1 }).success);
console.log("缺 age:", Person.safeParse({ name: "x" }).success);
console.log("简写 .and():", HasName.and(HasAge).safeParse({ name: "x", age: 1 }).success);

console.log("\\n========== 4. discriminatedUnion 可辨识联合 ==========");
const Shape = z.discriminatedUnion("type", [
  z.object({ type: z.literal("circle"), radius: z.number().positive() }),
  z.object({ type: z.literal("square"), size: z.number().positive() }),
  z.object({ type: z.literal("rect"), width: z.number(), height: z.number() }),
]);
console.log("圆:", Shape.safeParse({ type: "circle", radius: 5 }).success);
console.log("方:", Shape.safeParse({ type: "square", size: 4 }).success);
console.log("类型错:", Shape.safeParse({ type: "triangle", r: 1 }).success);
console.log("圆缺 radius:", Shape.safeParse({ type: "circle" }).success);

console.log("\\n========== 5. 实战：API 响应 ==========");
const ApiResponse = z.discriminatedUnion("status", [
  z.object({ status: z.literal("ok"), data: z.any() }),
  z.object({ status: z.literal("error"), message: z.string(), code: z.number() }),
]);
function callApi(mock) {
  const r = ApiResponse.safeParse(mock);
  if (r.success) {
    if (r.data.status === "ok") return "成功: " + JSON.stringify(r.data.data);
    return "失败[" + r.data.code + "]: " + r.data.message;
  }
  return "响应格式错误";
}
console.log(callApi({ status: "ok", data: { id: 1 } }));
console.log(callApi({ status: "error", message: "未登录", code: 401 }));
console.log(callApi({ status: "????" }));

console.log("\\n========== 6. 计算图形面积（收窄） ==========");
function area(shape) {
  const s = Shape.parse(shape); // 校验后类型被收窄
  if (s.type === "circle") return Math.PI * s.radius * s.radius;
  if (s.type === "square") return s.size * s.size;
  return s.width * s.height;
}
console.log("圆面积:", area({ type: "circle", radius: 2 }).toFixed(2));
console.log("方面积:", area({ type: "square", size: 3 }));
console.log("矩形面积:", area({ type: "rect", width: 3, height: 4 }));`,
  },

  // =========================================================
  // 第十章：可选、空值与默认值
  // =========================================================
  {
    id: "zod-optional-nullable",
    icon: "❓",
    group: "对象与组合",
    title: "可选、空值与默认值（optional/nullable/nullish/default）",
    content: `## 四个易混淆的方法

这是 Zod 中最容易混淆的一组方法，务必分清：

| 方法 | 允许的值 | 等价 TS |
| --- | --- | --- |
| \`.optional()\` | 原类型 + \`undefined\` | \`T \| undefined\` |
| \`.nullable()\` | 原类型 + \`null\` | \`T \| null\` |
| \`.nullish()\` | 原类型 + \`null\` + \`undefined\` | \`T \| null \| undefined\` |
| \`.default(v)\` | 原类型 + 缺失时填 v | \`T\`（缺失补默认值） |

### optional

\`\`\`js
z.string().optional().parse(undefined); // ✅
z.string().optional().parse(null);       // ❌ null 不被允许
\`\`\`

### nullable

\`\`\`js
z.string().nullable().parse(null);       // ✅
z.string().nullable().parse(undefined);  // ❌ undefined 不被允许
\`\`\`

### nullish

\`\`\`js
z.string().nullish().parse(null);       // ✅
z.string().nullish().parse(undefined);  // ✅
\`\`\`

### default

\`default(v)\` 当字段**缺失**或为 \`undefined\` 时填入默认值。注意：它校验后返回的类型**不再是可选的**：

\`\`\`js
const S = z.object({
  name: z.string().default("匿名"),
  age: z.number().default(0),
});
S.parse({}); // { name: "匿名", age: 0 }
\`\`\`

**关键区别**：\`optional()\` 让字段"可以没有"，\`default()\` 让字段"一定有，没有就补上"。

## 组合使用

可以链式组合：

\`\`\`js
// 可空，且为空时给默认值
z.string().nullable().default("未知");
\`\`\`

但要注意顺序语义。常见的实用组合：

- \`z.string().default("x")\`：缺失补 "x"，但有值就校验
- \`z.string().optional().default("x")\`：undefined 也补 "x"
- \`z.number().nullable().default(0)\`：null 补 0

## catch —— 容错

\`.catch(fallback)\` 在校验失败时**不报错**，而是返回一个兜底值。适合"宁可用默认值也别让程序崩"的场景：

\`\`\`js
const Port = z.number().int().min(1).max(65535).catch(3000);
Port.parse("abc"); // 不报错，返回 3000
\`\`\`

也可以传函数动态决定兜底值：\`.catch(() => 3000)\`。

## 实战：用户配置

\`\`\`js
const Config = z.object({
  theme: z.enum(["light", "dark"]).default("light"),
  fontSize: z.number().min(12).max(32).default(14),
  avatar: z.string().url().nullable().default(null),
  bio: z.string().max(200).optional(),
});
\`\`\`

这样配置项就有了完整的默认行为，前端可以放心 \`Config.parse(userInput)\` 拿到结构完整的数据。

下面运行示例。`,
    code: `// 第十章：可选、空值与默认值
const { z } = require("zod");

console.log("========== 1. optional ==========");
const Opt = z.string().optional();
console.log("有值:", Opt.safeParse("hi").success);
console.log("undefined:", Opt.safeParse(undefined).success);
console.log("null:", Opt.safeParse(null).success); // false

console.log("\\n========== 2. nullable ==========");
const Nul = z.string().nullable();
console.log("有值:", Nul.safeParse("hi").success);
console.log("null:", Nul.safeParse(null).success);
console.log("undefined:", Nul.safeParse(undefined).success); // false

console.log("\\n========== 3. nullish ==========");
const Nulish = z.string().nullish();
console.log("null:", Nulish.safeParse(null).success);
console.log("undefined:", Nulish.safeParse(undefined).success);

console.log("\\n========== 4. default ==========");
const WithDefault = z.object({
  name: z.string().default("匿名"),
  age: z.number().default(0),
  role: z.string().default("user"),
});
console.log("空对象:", JSON.stringify(WithDefault.parse({})));
console.log("部分:", JSON.stringify(WithDefault.parse({ name: "张三" })));

console.log("\\n========== 5. catch 容错 ==========");
const Port = z.number().int().min(1).max(65535).catch(3000);
console.log("合法:", Port.parse(8080));
console.log("非法字符串:", Port.parse("abc"));   // 返回 3000
console.log("超范围:", Port.parse(99999));       // 返回 3000

console.log("\\n========== 6. 实战：用户配置 ==========");
const Config = z.object({
  theme: z.enum(["light", "dark"]).default("light"),
  fontSize: z.number().min(12).max(32).default(14),
  avatar: z.string().url().nullable().default(null),
  bio: z.string().max(200).optional(),
});
const c1 = Config.parse({});  // 全用默认
const c2 = Config.parse({ theme: "dark", fontSize: 18, bio: "hello" });
console.log("默认配置:", JSON.stringify(c1));
console.log("自定义配置:", JSON.stringify(c2));

console.log("\\n========== 7. 组合：nullable + default ==========");
const Avatar = z.string().url().nullable().default(null);
console.log("缺失:", JSON.stringify(Avatar.parse(undefined)));
console.log("null:", JSON.stringify(Avatar.parse(null)));
console.log("合法URL:", JSON.stringify(Avatar.parse("https://x.com/a.png")));`,
  },

  // =========================================================
  // 第十一章：自定义校验
  // =========================================================
  {
    id: "zod-refine",
    icon: "🔧",
    group: "自定义与转换",
    title: "自定义校验（refine/superRefine）",
    content: `## 为什么需要自定义校验

Zod 内置的校验覆盖了格式和范围，但有些业务规则无法用内置方法表达：

- 密码必须同时包含字母和数字
- 开始时间必须早于结束时间
- 字段值不能是已存在的用户名（需查数据库，异步）
- 两个字段互斥（要么填 A，要么填 B）

这时就需要 \`refine\` 和 \`superRefine\`。

## refine —— 简单自定义校验

\`refine(check, message)\` 接收一个**返回布尔值**的校验函数。返回 \`true\` 通过，\`false\` 报错：

\`\`\`js
const Password = z.string().refine(
  (val) => /[a-z]/.test(val) && /[0-9]/.test(val),
  "密码必须同时包含字母和数字"
);
\`\`\`

错误信息可以是字符串，也可以是函数（拿到校验值动态生成）：

\`\`\`js
.refine(val => val.length >= 8, val => ({ message: "至少 8 位，当前 " + val.length + " 位" }))
\`\`\`

## refine 作用于对象（跨字段校验）

\`refine\` 用在 \`z.object\` 上时，校验函数能拿到**整个对象**，可以做跨字段校验：

\`\`\`js
const Range = z.object({
  start: z.number(),
  end: z.number(),
}).refine(d => d.start < d.end, "开始必须小于结束");
\`\`\`

默认情况下 refine 报错时 path 是空的（报在根级）。可以用第三个参数指定 path：

\`\`\`js
.refine(d => d.start < d.end, { message: "...", path: ["end"] })
\`\`\`

这样错误会指向 \`end\` 字段，前端能高亮对应输入框。

## superRefine —— 多重 / 复杂校验

当需要**一次性校验多个规则、报多个错误**时，用 \`superRefine\`。它接收 \`ctx\` 上下文，可以多次调用 \`ctx.addIssue()\`：

\`\`\`js
const Password = z.string().superRefine((val, ctx) => {
  if (val.length < 8) {
    ctx.addIssue({ code: "custom", message: "至少 8 位" });
  }
  if (!/[a-z]/.test(val)) {
    ctx.addIssue({ code: "custom", message: "必须包含小写字母" });
  }
  if (!/[0-9]/.test(val)) {
    ctx.addIssue({ code: "custom", message: "必须包含数字" });
  }
});
\`\`\`

superRefine 会收集**所有** issue，不像 refine 一返回 false 就停。这让用户能一次看到全部问题。

## refine vs superRefine 选择

| 需求 | 用哪个 |
| --- | --- |
| 单条规则，一个错误信息 | \`refine\` |
| 多条规则，想一次报多个错 | \`superRefine\` |
| 需要自定义错误 path | 两者都行（refine 传 path） |

## 自定义校验码常量

Zod 要求 issue 的 code 在自定义时用 \`"custom"\`：

\`\`\`js
ctx.addIssue({ code: "custom", message: "...", path: ["field"] });
\`\`\`

下面运行示例。`,
    code: `// 第十一章：自定义校验 refine / superRefine
const { z } = require("zod");

console.log("========== 1. refine 基础 ==========");
const Password = z.string().refine(
  (val) => /[a-z]/.test(val) && /[0-9]/.test(val),
  "密码必须同时包含字母和数字"
);
console.log("合法:", Password.safeParse("abc123").success);
console.log("纯数字:", Password.safeParse("123456").success);
if (!Password.safeParse("123456").success) {
  console.log("  错误:", Password.safeParse("123456").error.issues[0].message);
}

console.log("\\n========== 2. refine 跨字段校验 ==========");
const Range = z.object({
  start: z.number(),
  end: z.number(),
}).refine((d) => d.start < d.end, { message: "开始必须小于结束", path: ["end"] });
console.log("合法:", Range.safeParse({ start: 1, end: 5 }).success);
const r = Range.safeParse({ start: 10, end: 5 });
console.log("非法:", r.success);
console.log("  错误路径:", r.error.issues[0].path); // ["end"]

console.log("\\n========== 3. superRefine 多规则 ==========");
const StrongPwd = z.string().superRefine((val, ctx) => {
  if (val.length < 8) {
    ctx.addIssue({ code: "custom", message: "至少 8 位" });
  }
  if (!/[a-z]/.test(val)) {
    ctx.addIssue({ code: "custom", message: "必须包含小写字母" });
  }
  if (!/[0-9]/.test(val)) {
    ctx.addIssue({ code: "custom", message: "必须包含数字" });
  }
});
const weak = StrongPwd.safeParse("ABC");
console.log("弱密码通过:", weak.success);
console.log("错误数量:", weak.error.issues.length);
weak.error.issues.forEach(i => console.log("  -", i.message));

console.log("\\n========== 4. 互斥字段校验 ==========");
const Either = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
}).superRefine((d, ctx) => {
  const hasEmail = !!d.email;
  const hasPhone = !!d.phone;
  if (!hasEmail && !hasPhone) {
    ctx.addIssue({ code: "custom", message: "邮箱和手机号至少填一个", path: ["email"] });
  }
  if (hasEmail && hasPhone) {
    ctx.addIssue({ code: "custom", message: "邮箱和手机号只能填一个", path: ["phone"] });
  }
});
console.log("都填:", Either.safeParse({ email: "a@b.com", phone: "13800" }).success);
console.log("都不填:", Either.safeParse({}).success);
console.log("只填邮箱:", Either.safeParse({ email: "a@b.com" }).success);

console.log("\\n========== 5. 动态错误信息 ==========");
const Len = z.string().refine(
  (v) => v.length >= 5,
  (v) => ({ message: "至少 5 位，当前 " + v.length + " 位" })
);
const lr = Len.safeParse("ab");
console.log("错误:", lr.error.issues[0].message);`,
  },

  // =========================================================
  // 第十二章：数据转换
  // =========================================================
  {
    id: "zod-transform",
    icon: "🔄",
    group: "自定义与转换",
    title: "数据转换（transform/preprocess）",
    content: `## transform —— 解析后转换数据

\`transform(fn)\` 在校验通过后，对数据做一个**转换**，返回新值。这让 parse 不只是"校验"，还能"塑形"：

\`\`\`js
const ToUpper = z.string().transform((s) => s.toUpperCase());
ToUpper.parse("hello"); // 返回 "HELLO"
\`\`\`

转换后的值类型可以和输入不同。比如把字符串转成数字：

\`\`\`js
const StringToNum = z.string().transform((s) => parseInt(s, 10));
StringToNum.parse("42"); // 返回 42（number）
\`\`\`

注意：transform 之后类型从 string 变成了 number，\`z.infer\` 也会跟着变。

### refine + transform

可以在 transform 前面加 refine 做校验：

\`\`\`js
const Schema = z.string()
  .refine((s) => /^\\d+$/.test(s), "必须是纯数字字符串")
  .transform((s) => parseInt(s, 10));
\`\`\`

## preprocess —— 解析前预处理

\`preprocess(fn, schema)\` 在校验**之前**先对数据做转换，再用 schema 校验转换后的结果：

\`\`\`js
const Trimmed = z.preprocess(
  (val) => typeof val === "string" ? val.trim() : val,
  z.string().min(1)
);
Trimmed.parse("  hi  "); // 返回 "hi"
\`\`\`

preprocess 适合处理"数据脏，但能洗"的场景：去空格、把空字符串转 undefined、把字符串数字转数字等。

### transform vs preprocess 区别

| | transform | preprocess |
| --- | --- | --- |
| 执行时机 | 校验**之后** | 校验**之前** |
| 数据是否已校验 | 是 | 否 |
| 典型用途 | 塑形输出 | 清洗输入 |

## 实战：金额处理

把字符串金额（带 ¥ 符号）转成数字分：

\`\`\`js
const Money = z.string()
  .transform((s) => s.replace(/[^0-9.]/g, ""))   // 去掉非数字
  .transform((s) => Math.round(parseFloat(s) * 100)); // 转成分
Money.parse("¥99.50"); // 返回 9950
\`\`\`

多个 transform 会按顺序串联执行。

## 实战：默认空值

把空字符串、null 统一转成 undefined，再走 optional：

\`\`\`js
const OptionalStr = z.preprocess(
  (v) => (v === "" || v === null ? undefined : v),
  z.string().optional()
);
\`\`\`

这样前端表单传来的空字符串就不会卡在 string 校验上了。

## pipe / preprocess 进阶

新版 Zod 推荐用 \`z.pipe()\` 或 \`z.coerce\` 替代部分 preprocess 场景（见强制转换章节）。但 preprocess 处理复杂清洗依然很有用。

下面运行示例。`,
    code: `// 第十二章：数据转换 transform / preprocess
const { z } = require("zod");

console.log("========== 1. transform 基础 ==========");
const ToUpper = z.string().transform((s) => s.toUpperCase());
console.log("转大写:", ToUpper.parse("hello"));

console.log("\\n========== 2. transform 改变类型 ==========");
const Str2Num = z.string()
  .refine((s) => /^\\d+$/.test(s), "必须是纯数字字符串")
  .transform((s) => parseInt(s, 10));
const n = Str2Num.parse("42");
console.log("解析结果:", n, "| 类型:", typeof n);

console.log("\\n========== 3. 多个 transform 串联 ==========");
const Money = z.string()
  .transform((s) => s.replace(/[^0-9.]/g, ""))
  .transform((s) => Math.round(parseFloat(s) * 100));
console.log("¥99.50 ->", Money.parse("¥99.50"), "分");
console.log("$1234.56 ->", Money.parse("$1234.56"), "分");

console.log("\\n========== 4. preprocess 预处理 ==========");
const Trimmed = z.preprocess(
  (val) => (typeof val === "string" ? val.trim() : val),
  z.string().min(1, "不能为空")
);
console.log("去空格:", JSON.stringify(Trimmed.parse("  hi  ")));
const tr = Trimmed.safeParse("   ");
console.log("纯空格:", tr.success, tr.error ? "| " + tr.error.issues[0].message : "");

console.log("\\n========== 5. 空值统一处理 ==========");
const OptionalStr = z.preprocess(
  (v) => (v === "" || v === null ? undefined : v),
  z.string().optional()
);
console.log("空串:", JSON.stringify(OptionalStr.parse("")));
console.log("null:", JSON.stringify(OptionalStr.parse(null)));
console.log("有值:", JSON.stringify(OptionalStr.parse("hello")));

console.log("\\n========== 6. 实战：标签字符串转数组 ==========");
const Tags = z.string()
  .transform((s) => s.split(",").map((t) => t.trim()).filter(Boolean))
  .transform((arr) => arr.map((t) => t.toLowerCase()));
const tags = Tags.parse("React, Vue , Angular ");
console.log("标签数组:", tags);

console.log("\\n========== 7. transform 后对象 ==========");
const UserDTO = z.object({
  name: z.string(),
  birthYear: z.number().int().min(1900).max(2024),
}).transform((u) => ({
  ...u,
  age: new Date().getFullYear() - u.birthYear,
  isAdult: new Date().getFullYear() - u.birthYear >= 18,
}));
const u = UserDTO.parse({ name: "张三", birthYear: 2000 });
console.log("转换后:", JSON.stringify(u));`,
  },

  // =========================================================
  // 第十三章：类型推导
  // =========================================================
  {
    id: "zod-infer",
    icon: "🧠",
    group: "自定义与转换",
    title: "类型推导（z.infer/z.input/z.output）",
    content: `## z.infer —— 从 Schema 推导 TS 类型

Zod 最强大的特性之一：**一份 Schema 同时是运行时校验器和编译时类型定义**。用 \`z.infer\` 可以从 Schema 反向推导出 TypeScript 类型：

\`\`\`ts
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().optional(),
});

// 从 Schema 推导出类型，无需手写 interface
type User = z.infer<typeof UserSchema>;
// 等价于 { id: number; name: string; email?: string }
\`\`\`

这样**类型和校验逻辑永远同步**——改了 Schema，类型自动更新，不会再出现"interface 写了一份，校验又写一份，两边对不上"的问题。

> 注意：\`z.infer\` 是 TypeScript 类型层面的操作，运行时不存在。下面的代码示例运行在 JS 沙箱，类型相关写法以注释呈现。

## z.input vs z.output

当一个 Schema 包含 \`default\` 或 \`transform\` 时，**输入类型和输出类型可能不同**：

- \`z.input\`：parse **输入**数据的类型（可以缺失/为 undefined）
- \`z.output\`：parse **输出**数据的类型（已填默认值/已转换）

\`\`\`ts
const S = z.object({
  name: z.string().default("匿名"),
  age: z.string().transform((s) => parseInt(s, 10)),
});

type Input  = z.input<typeof S>;  // { name?: string; age: string }
type Output = z.output<typeof S>; // { name: string; age: number }
\`\`\`

注意区别：

- \`name\`：input 可选（因为有 default），output 必填（一定有值）
- \`age\`：input 是 string，output 是 number（被 transform 改了类型）

**\`z.infer\` 是 \`z.output\` 的别名**。大多数情况下你想要的是 output 类型。

## 什么时候用 z.input

当你写"接收用户输入"的函数参数时，应该用 \`z.input\`，因为用户可能传缺失字段：

\`\`\`ts
function createUser(input: z.input<typeof UserSchema>) {
  return UserSchema.parse(input); // 返回 z.output<typeof UserSchema>
}
\`\`\`

## 实战：前后端共享类型

一个常见的工程化模式：在共享文件里定义 Schema，前后端都引用：

\`\`\`ts
// shared/schemas.ts
export const UserSchema = z.object({ ... });
export type User = z.infer<typeof UserSchema>;

// 后端：parse 数据库返回
// 前端：parse API 响应、做表单类型
\`\`\`

这样 API 契约、前端类型、校验逻辑三者合一。

## infer 的局限

- \`z.infer\` 只在 TS 项目中有意义，纯 JS 项目它就是个注释
- 对于复杂的 \`refine\` / \`transform\`，推导出的类型可能比较绕
- 不能从已有的 TS interface 反向生成 Zod Schema（需要手写 Schema）

下面运行示例，感受 Schema 与类型的对应关系（类型部分以注释展示）。`,
    code: `// 第十三章：类型推导 z.infer
// 说明：z.infer 是 TypeScript 类型层面的特性，运行时不存在。
// 本示例演示 Schema 结构与运行时数据的对应关系，TS 类型写法以注释呈现。
const { z } = require("zod");

console.log("========== 1. 基础 infer 对应 ==========");
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "user"]).default("user"),
});
// TS: type User = z.infer<typeof UserSchema>
//     = { id: number; name: string; email?: string; role: "admin" | "user" }
const user = UserSchema.parse({ id: 1, name: "张三" });
console.log("解析结果:", JSON.stringify(user));
console.log("role 默认值:", user.role);

console.log("\\n========== 2. input vs output 的差异 ==========");
const FormSchema = z.object({
  name: z.string().default("匿名"),        // input 可选, output 必填
  age: z.string().transform((s) => parseInt(s, 10)), // input string, output number
});
// TS: type Input  = z.input<typeof FormSchema>   = { name?: string; age: string }
//     type Output = z.output<typeof FormSchema>  = { name: string; age: number }
//     z.infer === z.output
const out = FormSchema.parse({ age: "25" });
console.log("输出 name:", out.name, "| age:", out.age, "| age 类型:", typeof out.age);

console.log("\\n========== 3. Schema 即类型契约 ==========");
// 改 Schema，类型自动跟随，无需维护两份
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
  tags: z.array(z.string()).default([]),
});
// TS: type Product = z.infer<typeof ProductSchema>
const p = ProductSchema.parse({ id: "P1", name: "键盘", price: 199 });
console.log("商品:", JSON.stringify(p));
console.log("tags 默认:", p.tags);

console.log("\\n========== 4. 复合类型推导 ==========");
const ApiResponseSchema = z.object({
  code: z.number(),
  data: z.array(z.object({
    id: z.number(),
    title: z.string(),
  })),
  total: z.number().optional(),
});
// TS: type ApiResponse = z.infer<typeof ApiResponseSchema>
//     = { code: number; data: { id: number; title: string }[]; total?: number }
const resp = ApiResponseSchema.parse({
  code: 0,
  data: [{ id: 1, title: "文章1" }, { id: 2, title: "文章2" }],
  total: 2,
});
console.log("响应 code:", resp.code, "| 文章数:", resp.data.length);

console.log("\\n========== 5. 模拟 input/output 双类型函数 ==========");
// 后端：接收 input（可能缺字段），返回 output（已补默认值）
function createProduct(raw) {
  // raw 对应 z.input
  return ProductSchema.parse(raw); // 返回 z.output
}
const created = createProduct({ id: "P2", name: "鼠标", price: 89 });
console.log("创建商品:", JSON.stringify(created));`,
  },

  // =========================================================
  // 第十四章：表单验证实战
  // =========================================================
  {
    id: "zod-form-validation",
    icon: "📝",
    group: "实战应用",
    title: "表单验证实战",
    content: `## 表单验证的核心需求

表单验证要解决三件事：

1. **校验整表**：一次性校验所有字段
2. **逐字段错误**：每个字段有独立的错误信息，前端能高亮对应输入框
3. **错误信息友好**：告诉用户具体哪里错了、怎么改

Zod 的 \`safeParse\` + 错误结构天然契合这些需求。

## 设计表单 Schema

以注册表单为例，覆盖常见约束：

\`\`\`js
const RegisterForm = z.object({
  username: z.string().min(3, "用户名至少 3 位").max(20, "用户名最多 20 位"),
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(8, "密码至少 8 位"),
  confirmPassword: z.string(),
  age: z.number().int().min(18, "必须年满 18 岁"),
  agree: z.boolean().refine((v) => v, "必须同意协议"),
}).refine(
  (d) => d.password === d.confirmPassword,
  { message: "两次密码不一致", path: ["confirmPassword"] }
);
\`\`\`

注意最后用 \`refine\` 做跨字段校验（密码确认），并把错误 path 指向 \`confirmPassword\`。

## 把错误转成 { 字段: 信息 } 的字典

前端最想要的是一个以字段名为 key、错误信息为值的对象，方便直接显示：

\`\`\`js
function flattenErrors(zodError) {
  const map = {};
  for (const issue of zodError.issues) {
    const key = issue.path[0] || "_root_";
    if (!map[key]) map[key] = issue.message;
  }
  return map;
}
\`\`\`

\`issue.path\` 是数组，对于普通对象字段第一项就是字段名。取第一条错误即可（一个字段通常显示一条错误就够）。

## 校验流程

\`\`\`js
function validate(form) {
  const result = RegisterForm.safeParse(form);
  if (result.success) {
    return { valid: true, data: result.data, errors: {} };
  }
  return { valid: false, data: null, errors: flattenErrors(result.error) };
}
\`\`\`

前端拿到 \`errors\` 后，每个输入框根据 \`errors.username\` 等显示红字。

## 逐字段实时校验

如果想"用户输入完一个字段就校验一个"，可以对单字段做校验。但更好的做法是：**整表 safeParse，但只显示被改动字段的错误**。这样跨字段校验（如密码确认）也能正确触发。

## 实战要点

1. **错误信息要写人话**：别用 Zod 默认的 "Invalid input"，写"请输入正确的邮箱"
2. **必填字段**：不加 \`optional()\` 就是必填，缺失会报 "Required"
3. **数字字段**：表单传来的都是字符串，要么用 \`z.coerce.number()\`，要么用 \`z.number()\` + 前端转类型
4. **复选框**：\`z.boolean()\` + \`refine(v => v)\` 实现必须勾选

下面运行一个完整的表单校验示例。`,
    code: `// 第十四章：表单验证实战
const { z } = require("zod");

// 注册表单 Schema
const RegisterForm = z.object({
  username: z.string().min(3, "用户名至少 3 位").max(20, "用户名最多 20 位"),
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(8, "密码至少 8 位"),
  confirmPassword: z.string(),
  age: z.number().int().min(18, "必须年满 18 岁"),
  agree: z.boolean().refine((v) => v, "必须同意用户协议"),
}).refine(
  (d) => d.password === d.confirmPassword,
  { message: "两次密码不一致", path: ["confirmPassword"] }
);

// 把 ZodError 转成 { 字段: 信息 } 字典
function flattenErrors(zodError) {
  const map = {};
  for (const issue of zodError.issues) {
    const key = issue.path[0] || "_root_";
    if (!map[key]) map[key] = issue.message; // 每字段只取第一条
  }
  return map;
}

function validate(form) {
  const result = RegisterForm.safeParse(form);
  if (result.success) {
    return { valid: true, data: result.data, errors: {} };
  }
  return { valid: false, data: null, errors: flattenErrors(result.error) };
}

console.log("========== 1. 合法表单 ==========");
const ok = validate({
  username: "alice",
  email: "alice@example.com",
  password: "secret123",
  confirmPassword: "secret123",
  age: 25,
  agree: true,
});
console.log("通过:", ok.valid, "| 用户名:", ok.data.username);

console.log("\\n========== 2. 满屏错误 ==========");
const bad = validate({
  username: "ab",
  email: "not-email",
  password: "123",
  confirmPassword: "456",
  age: 16,
  agree: false,
});
console.log("通过:", bad.valid);
console.log("错误字典:");
Object.entries(bad.errors).forEach(([field, msg]) => {
  console.log("  " + field + ": " + msg);
});

console.log("\\n========== 3. 密码不一致（跨字段） ==========");
const mismatch = validate({
  username: "bob",
  email: "bob@example.com",
  password: "password1",
  confirmPassword: "password2",
  age: 30,
  agree: true,
});
console.log("通过:", mismatch.valid);
console.log("confirmPassword 错误:", mismatch.errors.confirmPassword);

console.log("\\n========== 4. 缺必填字段 ==========");
const missing = validate({
  username: "charlie",
  // email 缺失
  password: "longenough",
  confirmPassword: "longenough",
  age: 20,
  agree: true,
});
console.log("通过:", missing.valid);
console.log("email 错误:", missing.errors.email);

console.log("\\n========== 5. 模拟提交逻辑 ==========");
function submit(form) {
  const r = validate(form);
  if (!r.valid) {
    console.log("提交失败，请修正以下错误:");
    Object.entries(r.errors).forEach(([k, v]) => console.log("  - " + k + ": " + v));
    return;
  }
  console.log("提交成功！用户:", r.data.username, "邮箱:", r.data.email);
}
submit({ username: "david", email: "d@e.com", password: "pw123456", confirmPassword: "pw123456", age: 22, agree: true });
submit({ username: "x", email: "bad" });`,
  },

  // =========================================================
  // 第十五章：API 数据验证
  // =========================================================
  {
    id: "zod-api-validation",
    icon: "🌐",
    group: "实战应用",
    title: "API 数据验证（fetch 响应验证）",
    content: `## 为什么必须验证 API 响应

很多开发者拿到 API 响应后直接用：

\`\`\`js
const data = await res.json();
console.log(data.user.name); // 万一 user 是 undefined 就崩了
\`\`\`

后端可能因为版本升级、bug、缓存等原因返回不符合预期的数据。**永远不要信任 API 响应的结构**——把它当成不可信的外部输入。

## 用 Zod 校验响应

\`\`\`js
const UserSchema = z.object({ id: z.number(), name: z.string() });

const res = await fetch("/api/user/1");
const json = await res.json();
const user = UserSchema.parse(json); // 不符合就抛异常
\`\`\`

校验通过后，\`user\` 的类型就是确定、安全的，可以放心使用。

## safeParse 优雅降级

不想让一个 API 失败就整页崩溃，用 \`safeParse\`：

\`\`\`js
const result = UserSchema.safeParse(json);
if (!result.success) {
  // 降级：显示错误页、用兜底数据、上报监控
  return showError("数据格式异常");
}
return result.data;
\`\`\`

## 数组响应

\`\`\`js
const ListSchema = z.object({
  list: z.array(z.object({ id: z.number(), name: z.string() })),
  total: z.number(),
});
\`\`\`

## 可辨识联合：成功/失败响应

很多 API 返回统一格式：成功时 \`{ code: 0, data } \`，失败时 \`{ code: 1, message } \`。用 \`discriminatedUnion\`：

\`\`\`js
const Resp = z.discriminatedUnion("code", [
  z.object({ code: z.literal(0), data: z.unknown() }),
  z.object({ code: z.literal(1), message: z.string() }),
]);
\`\`\`

## 实战：封装 fetch

把校验封装进请求函数，业务代码只拿到**已校验的安全数据**：

\`\`\`js
async function apiGet(url, schema) {
  const res = await fetch(url);
  const json = await res.json();
  const result = schema.safeParse(json);
  if (!result.success) {
    throw new Error("API 响应不符合预期: " + result.error.issues[0].message);
  }
  return result.data;
}
\`\`\`

调用方完全不用关心校验细节：

\`\`\`js
const user = await apiGet("/api/user/1", UserSchema);
\`\`\`

## 关于 fetch 的注意事项

- **HTTP 状态码不保证 body 结构**：200 也可能返回错误体，非 200 也可能返回可解析的 JSON。校验 body 才是关键
- **超时**：fetch 默认无超时，用 AbortController
- **不要把整个 response 对象塞进 schema**，只校验 \`res.json()\` 的结果

下面运行示例（用 mock 数据模拟 API 响应，不发起真实请求）。`,
    code: `// 第十五章：API 数据验证
const { z } = require("zod");

// 定义 API 响应 Schema
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

const ListSchema = z.object({
  list: z.array(z.object({ id: z.number(), name: z.string() })),
  total: z.number(),
});

// 可辨识联合：成功/失败统一响应
const ApiResponseSchema = z.discriminatedUnion("code", [
  z.object({ code: z.literal(0), data: z.unknown(), message: z.string().optional() }),
  z.object({ code: z.literal(1), message: z.string() }),
]);

console.log("========== 1. 校验单个用户 ==========");
const mockUser = { id: 1, name: "张三", email: "a@b.com" };
const u = UserSchema.parse(mockUser);
console.log("校验通过:", u.name, u.email);

console.log("\\n========== 2. 校验列表 ==========");
const mockList = {
  list: [{ id: 1, name: "x" }, { id: 2, name: "y" }],
  total: 2,
};
const list = ListSchema.parse(mockList);
console.log("总数:", list.total, "| 第一项:", list.list[0].name);

console.log("\\n========== 3. 字段缺失/类型错误 ==========");
const badUser = { id: "1", name: "李四" }; // id 是字符串
const r = UserSchema.safeParse(badUser);
console.log("通过:", r.success);
console.log("错误:", r.error.issues[0].path.join("."), "|", r.error.issues[0].message);

console.log("\\n========== 4. 可辨识联合响应 ==========");
function handleResp(json) {
  const r = ApiResponseSchema.safeParse(json);
  if (!r.success) return "响应格式不对: " + r.error.issues[0].message;
  if (r.data.code === 0) return "成功，数据: " + JSON.stringify(r.data.data);
  return "失败[" + r.data.code + "]: " + r.data.message;
}
console.log(handleResp({ code: 0, data: { ok: true }, message: "ok" }));
console.log(handleResp({ code: 1, message: "未授权" }));
console.log(handleResp({ code: 99 }));

console.log("\\n========== 5. 封装 apiGet（模拟 fetch） ==========");
// 用 mockFetch 模拟网络请求，演示封装思路
function mockFetch(url) {
  const db = {
    "/api/user/1": { id: 1, name: "张三", email: "a@b.com" },
    "/api/user/2": { id: 2, name: "李四", email: "bad" }, // 邮箱非法
  };
  return Promise.resolve({ json: () => Promise.resolve(db[url] || null) });
}
async function apiGet(url, schema) {
  const res = await mockFetch(url);
  const json = await res.json();
  const result = schema.safeParse(json);
  if (!result.success) {
    throw new Error("API 响应不符合预期: " + result.error.issues[0].message);
  }
  return result.data;
}
// 顶层 await 风格
(async () => {
  const ok = await apiGet("/api/user/1", UserSchema);
  console.log("user/1:", ok.name);
  try {
    await apiGet("/api/user/2", UserSchema);
  } catch (e) {
    console.log("user/2 失败:", e.message);
  }
  try {
    await apiGet("/api/user/404", UserSchema);
  } catch (e) {
    console.log("user/404 失败:", e.message);
  }
})();`,
  },

  // =========================================================
  // 第十六章：环境变量验证
  // =========================================================
  {
    id: "zod-env-validation",
    icon: "⚙️",
    group: "实战应用",
    title: "环境变量验证",
    content: `## 环境变量的痛点

\`process.env\` 里所有值都是**字符串**，而且：

- 可能有空格、空字符串
- 该有值的可能没设（undefined）
- 数字、布尔都是字符串形式（"3000"、"true"）
- 拼写错误（\`DB_HOSY\` 而不是 \`DB_HOST\`）运行时才暴露

没有校验，你的程序会带着错误配置悄悄跑起来，直到某个奇怪的时刻崩溃。

## 用 Zod 校验环境变量

定义一个 env Schema，启动时一次性 parse：

\`\`\`js
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().int().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  DEBUG: z.coerce.boolean().default(false),
});

const env = EnvSchema.parse(process.env);
\`\`\`

解析成功后，\`env.PORT\` 就是真正的 number，\`env.NODE_ENV\` 是收窄的联合类型。

## 关键技巧：z.coerce

因为 env 全是字符串，必须做类型转换。推荐用 \`z.coerce\`：

| 类型 | 写法 | 效果 |
| --- | --- | --- |
| 数字 | \`z.coerce.number()\` | "3000" → 3000 |
| 布尔 | \`z.coerce.boolean()\` | "true"/"1" → true，"" → false |
| 日期 | \`z.coerce.date()\` | "2024-01-01" → Date |

注意 \`z.coerce.boolean()\` 的规则比较"粗暴"：**非空字符串都算 true**，空字符串算 false。如果你只接受 "true"/"false"，要用 \`z.string().transform()\` 自己转。

## fail fast：启动即校验

把 parse 放在程序入口（最早执行的地方），配置错了就直接挂掉，比带着错误配置跑半天好得多：

\`\`\`js
// config.js —— 最先被 import
const env = EnvSchema.parse(process.env);
export { env };
\`\`\`

任何模块 \`import { env } from "./config"\` 时都拿到校验过的配置。

## 提供友好的错误提示

可以捕获错误，打印出缺失/错误的环境变量名，方便排查：

\`\`\`js
const result = EnvSchema.safeParse(process.env);
if (!result.success) {
  console.error("环境变量配置错误:");
  result.error.issues.forEach(i => console.error(" -", i.path.join("."), ":", i.message));
  process.exit(1);
}
\`\`\`

## 区分前后端环境变量

Next.js 等框架里，**前端能访问的环境变量必须以 \`NEXT_PUBLIC_\` 开头**。可以分两份 Schema：

\`\`\`js
const ServerEnv = z.object({ DATABASE_URL: z.string(), JWT_SECRET: z.string() });
const PublicEnv = z.object({ NEXT_PUBLIC_API_URL: z.string().url() });
\`\`\`

下面运行示例（用 mock 的 env 对象模拟 process.env）。`,
    code: `// 第十六章：环境变量验证
const { z } = require("zod");

// 模拟一个 process.env
const mockEnv = {
  NODE_ENV: "production",
  PORT: "3000",
  DATABASE_URL: "postgres://user:pass@localhost:5432/db",
  JWT_SECRET: "a-very-long-secret-key-32+chars",
  DEBUG: "true",
  // 故意少配一个 Redis URL
};

// 环境变量 Schema
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, "JWT 密钥至少 32 字符"),
  REDIS_URL: z.string().url(),  // 必填，但 mockEnv 里没有
  DEBUG: z.coerce.boolean().default(false),
});

console.log("========== 1. 校验环境变量 ==========");
const r = EnvSchema.safeParse(mockEnv);
console.log("通过:", r.success);
if (!r.success) {
  console.log("错误列表:");
  r.error.issues.forEach(i => console.log("  - " + i.path.join(".") + ": " + i.message));
}

console.log("\\n========== 2. 补齐后校验通过 ==========");
const goodEnv = { ...mockEnv, REDIS_URL: "redis://localhost:6379" };
const env = EnvSchema.parse(goodEnv);
console.log("NODE_ENV:", env.NODE_ENV);
console.log("PORT:", env.PORT, "| 类型:", typeof env.PORT); // number
console.log("DEBUG:", env.DEBUG, "| 类型:", typeof env.DEBUG); // boolean
console.log("JWT_SECRET 长度:", env.JWT_SECRET.length);

console.log("\\n========== 3. coerce 转换效果 ==========");
console.log("PORT coerce:", z.coerce.number().parse("8080"), typeof z.coerce.number().parse("8080"));
console.log("DEBUG coerce true:", z.coerce.boolean().parse("true"));
console.log("DEBUG coerce 任意非空串:", z.coerce.boolean().parse("yes")); // true（注意）
console.log("DEBUG coerce 空串:", z.coerce.boolean().parse("")); // false

console.log("\\n========== 4. 友好的启动失败提示 ==========");
function loadEnv(rawEnv) {
  const result = EnvSchema.safeParse(rawEnv);
  if (!result.success) {
    console.error("环境变量配置错误，程序无法启动:");
    result.error.issues.forEach(i => {
      console.error("  - " + i.path.join(".") + ": " + i.message);
    });
    // 实际项目这里会 process.exit(1)
    return null;
  }
  return result.data;
}
console.log("第一次加载（缺 REDIS_URL）:");
loadEnv(mockEnv);
console.log("第二次加载（补齐）:");
loadEnv(goodEnv);`,
  },

  // =========================================================
  // 第十七章：与 React Hook Form 集成
  // =========================================================
  {
    id: "zod-react-hook-form",
    icon: "⚛️",
    group: "实战应用",
    title: "与 React Hook Form 集成（zodResolver）",
    content: `## React Hook Form + Zod

[React Hook Form](https://react-hook-form.com/)（RHF）是 React 最流行的表单库之一。它本身不带校验规则，而是通过 **resolver** 接入外部校验库。Zod 官方推荐用 \`@hookform/resolvers/zod\` 提供的 \`zodResolver\`。

这样的组合好处：

- **Schema 复用**：同一份 Schema 前端校验 + 后端校验，逻辑不重复
- **类型安全**：表单值的类型直接从 Schema 推导
- **错误信息**：Zod 的错误自动映射到 RHF 的字段错误

## 安装

\`\`\`bash
npm install react-hook-form @hookform/resolvers zod
\`\`\`

## 基本用法

\`\`\`tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. 定义 Schema
const schema = z.object({
  username: z.string().min(3, "至少 3 位"),
  email: z.string().email("邮箱格式不对"),
  age: z.coerce.number().min(18, "必须成年"),
});

// 2. 推导类型
type FormValues = z.infer<typeof schema>;

function MyForm() {
  // 3. 用 zodResolver 连接
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  // 4. 提交时 data 已是校验通过的类型
  const onSubmit = (data: FormValues) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("username")} />
      {errors.username && <p>{errors.username.message}</p>}
      {/* ... */}
    </form>
  );
}
\`\`\`

## 关键细节

### 数字字段用 z.coerce

HTML input 的值永远是字符串。要让 \`age\` 字段在表单里是 number，用 \`z.coerce.number()\`，否则 Zod 会因为收到字符串而报错。

### 模式 mode

\`useForm({ mode: "onBlur" })\` 控制何时触发校验：

- \`onSubmit\`（默认）：提交时校验
- \`onBlur\`：失焦时校验，体验更好
- \`onChange\`：每次输入都校验（可能太频繁）

### 跨字段校验

Zod 的 refine（如密码确认）会自动出现在对应字段的 errors 里（只要你设了 path）。RHF 会正确显示。

### 严格模式

默认 \`zodResolver\` 会剥离多余字段。如果你想保留，传 \`zodResolver(schema, {}, { raw: true })\`。

## 优势总结

| 对比项 | 手写校验 | RHF + Zod |
| --- | --- | --- |
| 校验逻辑复用 | 难 | 前后端共享 Schema |
| 类型推导 | 手写 interface | z.infer 自动 |
| 错误显示 | 手动管理 | errors.username.message |
| 性能 | 受控输入慢 | 非受控，重渲染少 |

> 注意：本教程代码运行在纯 JS 沙箱，无法运行 React 组件。下面的示例聚焦 **Schema 定义与校验逻辑**（这部分可运行），组件写法以注释展示，说明 zodResolver 如何把两者连起来。`,
    code: `// 第十七章：React Hook Form + Zod
// 说明：沙箱无法运行 React，本示例演示 Schema 与校验逻辑（可运行部分），
// 组件集成写法以注释展示。
const { z } = require("zod");

// 1. 定义表单 Schema（这部分会被前后端共享）
const FormSchema = z.object({
  username: z.string().min(3, "至少 3 位").max(20, "最多 20 位"),
  email: z.string().email("邮箱格式不对"),
  age: z.coerce.number().int().min(18, "必须年满 18 岁"),
  password: z.string().min(8, "密码至少 8 位"),
  confirmPassword: z.string(),
  agree: z.boolean().refine((v) => v, "必须同意协议"),
}).refine(
  (d) => d.password === d.confirmPassword,
  { message: "两次密码不一致", path: ["confirmPassword"] }
);

// 2. 模拟 zodResolver 的核心行为：把 Zod 错误映射成 { 字段: message }
//    实际 @hookform/resolvers/zod 做的就是这件事
function zodResolver(schema) {
  return {
    // RHF 在校验时调用，values 是表单当前值
    validate(values) {
      const result = schema.safeParse(values);
      if (result.success) {
        return { values: result.data, errors: {} };
      }
      // 把 ZodError 摊平成 RHF 期望的 { 字段: { message } }
      const errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (key && !errors[key]) {
          errors[key] = { message: issue.message };
        }
      }
      return { values: {}, errors };
    },
  };
}

console.log("========== 1. Schema 校验通过 ==========");
const resolver = zodResolver(FormSchema);
const ok = resolver.validate({
  username: "alice",
  email: "a@b.com",
  age: 25,            // 也接受 "25"（coerce）
  password: "secret123",
  confirmPassword: "secret123",
  agree: true,
});
console.log("通过:", Object.keys(ok.errors).length === 0);
if (ok.values.username) console.log("values:", JSON.stringify(ok.values));

console.log("\\n========== 2. coerce 字符串 age ==========");
const r2 = resolver.validate({
  username: "bob",
  email: "b@c.com",
  age: "30",          // 字符串，coerce 成数字
  password: "longenough",
  confirmPassword: "longenough",
  agree: true,
});
console.log("age 类型:", typeof r2.values.age, "| 值:", r2.values.age);

console.log("\\n========== 3. 错误映射（RHF 风格） ==========");
const bad = resolver.validate({
  username: "ab",
  email: "bad",
  age: 16,
  password: "123",
  confirmPassword: "456",
  agree: false,
});
console.log("错误字段:", Object.keys(bad.errors));
for (const [field, info] of Object.entries(bad.errors)) {
  console.log("  " + field + ": " + info.message);
}

/*
// ===== React 组件集成示意（无法在沙箱运行，仅供参考） =====
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

function RegisterForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(FormSchema),
    mode: "onBlur",
  });
  const onSubmit = (data) => console.log("提交:", data);
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("username")} />
      {errors.username && <p>{errors.username.message}</p>}
      <input {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}
      <input type="number" {...register("age")} />
      {errors.age && <p>{errors.age.message}</p>}
      <input type="password" {...register("password")} />
      <input type="password" {...register("confirmPassword")} />
      {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
      <label>
        <input type="checkbox" {...register("agree")} /> 同意协议
      </label>
      {errors.agree && <p>{errors.agree.message}</p>}
      <button type="submit">注册</button>
    </form>
  );
}
*/`,
  },

  // =========================================================
  // 第十八章：类型强制转换
  // =========================================================
  {
    id: "zod-coerce",
    icon: "🔁",
    group: "进阶技巧",
    title: "类型强制转换（coerce/pipeline）",
    content: `## 为什么需要 coerce

JS 里数据类型经常"不纯"：

- 表单 input 的值永远是字符串（数字也是 "42"）
- URL 参数是字符串（\`?page=3\`）
- JSON 解析后数字可能变成字符串
- localStorage 存取都会变字符串

如果直接用 \`z.number().parse("42")\` 会失败。\`z.coerce\` 让 Zod 在校验前**先尝试类型转换**：

\`\`\`js
z.coerce.number().parse("42");   // ✅ 返回 42
z.coerce.number().parse("3.14"); // ✅
z.coerce.boolean().parse("true");// ✅
z.coerce.date().parse("2024-01-01"); // ✅ 返回 Date
\`\`\`

## z.coerce 的几种类型

| 构造器 | 转换方式 |
| --- | --- |
| \`z.coerce.string()\` | \`String(val)\` |
| \`z.coerce.number()\` | \`Number(val)\`（NaN 仍会被拒绝） |
| \`z.coerce.boolean()\` | \`!!val\`（注意：空串为 false，其余非空串为 true） |
| \`z.coerce.bigint()\` | \`BigInt(val)\` |
| \`z.coerce.date()\` | \`new Date(val)\` |

### coerce.number 的注意点

\`\`\`js
z.coerce.number().parse("42");   // 42
z.coerce.number().parse("abc");  // ❌ Number("abc") 是 NaN，被拒绝
z.coerce.number().parse("");     // ❌ Number("") 是 0... 实际上 0 通过，但要看版本
z.coerce.number().parse(null);  // ❌ Number(null) 是 0，但 null 会先被拒绝
\`\`\`

注意 \`Number(null) === 0\`、\`Number("")===0\`、\`Number([])===0\` 这些 JS 坑。如果担心，可以再加 \`.int()\`、\`.min()\` 等约束过滤掉异常情况。

### coerce.boolean 的坑

\`z.coerce.boolean()\` 用的是 \`!!\`，所以：

\`\`\`js
z.coerce.boolean().parse("false"); // ✅ true！因为非空字符串都是 true
z.coerce.boolean().parse("0");    // ✅ true！
z.coerce.boolean().parse("");      // false
\`\`\`

如果你想严格只接受 "true"/"false" 字符串，用 transform 自己转：

\`\`\`js
z.string().transform((s) => s === "true")
\`\`\`

## coerce 与校验方法链式

coerce 之后可以继续链校验：

\`\`\`js
z.coerce.number().int().min(1).max(65535).parse("8080"); // ✅ 8080
\`\`\`

## pipeline —— 显式管道

\`z.pipe(a, b)\` 或 \`a.pipe(b)\` 把两个 Schema 串联：a 的输出作为 b 的输入。比 coerce 更可控：

\`\`\`js
const Schema = z.string()
  .pipe(z.coerce.number())
  .pipe(z.number().int().positive());
\`\`\`

pipeline 适合"先转字符串再校验"等多步处理：

\`\`\`js
// 接受任意值，先 String() 转字符串，再校验非空
const NonEmpty = z.unknown().pipe(z.string().min(1));
\`\`\`

## coerce vs preprocess vs pipeline

| 方式 | 适合场景 |
| --- | --- |
| \`z.coerce\` | 简单类型转换（字符串→数字/布尔/日期） |
| \`z.preprocess\` | 复杂清洗逻辑（自定义函数） |
| \`z.pipe\` | 显式串联多个 Schema，每步独立校验 |

日常开发中 \`z.coerce\` 用得最多，特别是在处理表单和 URL 参数时。

下面运行示例。`,
    code: `// 第十八章：类型强制转换 coerce / pipeline
const { z } = require("zod");

console.log("========== 1. coerce.number ==========");
console.log("'42' ->", z.coerce.number().parse("42"), "| 类型:", typeof z.coerce.number().parse("42"));
console.log("'3.14' ->", z.coerce.number().parse("3.14"));
console.log("true ->", z.coerce.number().parse(true));
console.log("'abc' ->", z.coerce.number().safeParse("abc").success); // false (NaN)

console.log("\\n========== 2. coerce 链式校验 ==========");
const Port = z.coerce.number().int().min(1).max(65535);
console.log("'8080' ->", Port.parse("8080"));
console.log("'abc' ->", Port.safeParse("abc").success); // false
console.log("'99999' ->", Port.safeParse("99999").success); // false 超范围

console.log("\\n========== 3. coerce.boolean 的坑 ==========");
console.log("'true' ->", z.coerce.boolean().parse("true"));   // true
console.log("'false' ->", z.coerce.boolean().parse("false")); // true! 注意
console.log("'0' ->", z.coerce.boolean().parse("0"));         // true! 注意
console.log("'' ->", z.coerce.boolean().parse(""));           // false

console.log("\\n========== 4. 严格布尔转换 ==========");
const StrictBool = z.string().transform((s) => s === "true");
console.log("'true' ->", StrictBool.parse("true"));
console.log("'false' ->", StrictBool.parse("false"));
console.log("'1' ->", StrictBool.parse("1")); // false（只认 "true"）

console.log("\\n========== 5. coerce.date ==========");
const d = z.coerce.date().parse("2024-01-01T00:00:00Z");
console.log("日期:", d instanceof Date, "| 年:", d.getUTCFullYear());
console.log("时间戳:", z.coerce.date().parse(1700000000000).getTime());

console.log("\\n========== 6. pipeline 管道 ==========");
const ToInt = z.string().pipe(z.coerce.number()).pipe(z.number().int().positive());
console.log("'42' ->", ToInt.parse("42"));
console.log("'-1' ->", ToInt.safeParse("-1").success); // false 非正
console.log("'3.5' ->", ToInt.safeParse("3.5").success); // false 非整数

console.log("\\n========== 7. 实战：URL 参数解析 ==========");
// 模拟 URL 查询参数（全是字符串）
const query = { page: "3", size: "20", active: "true", keyword: "  zod  " };
const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(10),
  active: z.string().transform((s) => s === "true"),
  keyword: z.string().trim().default(""),
});
const parsed = QuerySchema.parse(query);
console.log("解析结果:", JSON.stringify(parsed));
console.log("page 类型:", typeof parsed.page, "| active 类型:", typeof parsed.active);`,
  },

  // =========================================================
  // 第十九章：错误处理与格式化
  // =========================================================
  {
    id: "zod-error-handling",
    icon: "⚠️",
    group: "进阶技巧",
    title: "错误处理与格式化",
    content: `## ZodError 结构

当 parse 失败时抛出 \`ZodError\`，它有一个 \`issues\` 数组，每个 issue 包含：

| 字段 | 含义 |
| --- | --- |
| \`code\` | 错误类型（invalid_type / too_small / invalid_string / custom 等） |
| \`path\` | 错误位置（如 \`["address", "zip"]\`） |
| \`message\` | 错误信息 |
| \`expected\` / \`received\` | 期望/实际类型（部分 code 有） |

\`\`\`js
const r = z.object({ name: z.string() }).safeParse({ name: 123 });
r.error.issues[0].code;      // "invalid_type"
r.error.issues[0].path;      // ["name"]
r.error.issues[0].message;   // "Expected string, received number"
\`\`\`

## 捕获 ZodError

\`ZodError\` 是 Error 子类，可以 catch 后判断：

\`\`\`js
try {
  Schema.parse(input);
} catch (err) {
  if (err instanceof z.ZodError) {
    // Zod 校验错误
  } else {
    // 其他异常
  }
}
\`\`\`

但更推荐用 \`safeParse\`，避免异常控制流。

## 错误格式化方法

ZodError 提供几种格式化方法，适配不同场景：

### flatten() —— 扁平字典

\`\`\`js
error.flatten();
// { fieldErrors: { name: ["..."] }, formErrors: ["..."] }
\`\`\`

\`fieldErrors\` 是以字段名为 key 的数组（一个字段可能多个错误），\`formErrors\` 是根级错误（refine 不带 path 的）。

### format() —— 嵌套树

\`\`\`js
error.format();
// 嵌套结构，跟 Schema 形状一致
\`\`\`

适合需要按嵌套层级展示错误的前端。

### format(fn) —— 自定义格式

\`\`\`js
error.format((issue) => issue.message);
// 每个错误只保留 message 字符串
\`\`\`

## 自定义错误信息（全局）

可以通过 \`errorMap\` 全局定制错误信息。例如把英文默认信息换成中文：

\`\`\`js
const schema = z.string({ error: (iss) => {
  if (iss.code === "invalid_type") return "需要字符串";
  return "默认错误";
}});
\`\`\`

或在 parse 时传：

\`\`\`js
schema.parse(input, { errorMap: (iss, ctx) => ({ message: "..." }) });
\`\`\`

## 把错误转成给用户的提示

最常见的模式：把 ZodError 转成 \`{ 字段: 信息 }\`：

\`\`\`js
function toFieldErrors(error) {
  const map = {};
  for (const issue of error.issues) {
    const key = issue.path[0] || "_form";
    if (!map[key]) map[key] = issue.message;
  }
  return map;
}
\`\`\`

## 上报错误到监控

校验失败往往意味着数据异常，值得上报。可以在 safeParse 失败分支里把 \`error.issues\` 序列化后发送到 Sentry 等监控平台。

下面运行示例。`,
    code: `// 第十九章：错误处理与格式化
const { z } = require("zod");

const UserSchema = z.object({
  name: z.string().min(2, "名字至少 2 位"),
  age: z.number().int().min(0, "年龄不能为负"),
  address: z.object({
    city: z.string(),
    zip: z.string().regex(/^\\d{6}$/, "邮编 6 位数字"),
  }),
});

console.log("========== 1. ZodError 结构 ==========");
const r = UserSchema.safeParse({ name: "x", age: -1, address: { city: 123, zip: "abc" } });
console.log("通过:", r.success);
console.log("issues 数量:", r.error.issues.length);
r.error.issues.forEach((issue, i) => {
  console.log("  错误" + (i + 1) + ":");
  console.log("    code:", issue.code);
  console.log("    path:", issue.path.join("."));
  console.log("    message:", issue.message);
});

console.log("\\n========== 2. flatten 扁平字典 ==========");
const flat = r.error.flatten();
console.log("fieldErrors:", JSON.stringify(flat.fieldErrors, null, 2));
console.log("formErrors:", flat.formErrors);

console.log("\\n========== 3. format 嵌套树 ==========");
const fmt = r.error.format();
console.log("嵌套结构:", JSON.stringify(fmt, null, 2));

console.log("\\n========== 4. format(fn) 只留 message ==========");
const simple = r.error.format((issue) => issue.message);
console.log("简化:", JSON.stringify(simple, null, 2));

console.log("\\n========== 5. 转成 字段:信息 字典 ==========");
function toFieldErrors(error) {
  const map = {};
  for (const issue of error.issues) {
    const key = issue.path[0] || "_form";
    if (!map[key]) map[key] = issue.message;
  }
  return map;
}
console.log("字段错误:", toFieldErrors(r.error));

console.log("\\n========== 6. 嵌套路径错误 ==========");
const r2 = UserSchema.safeParse({ name: "ok", age: 18, address: { city: "上海", zip: "123" } });
console.log("通过:", r2.success);
console.log("错误路径:", r2.error.issues[0].path.join("."));
console.log("错误信息:", r2.error.issues[0].message);

console.log("\\n========== 7. 自定义 errorMap ==========");
const customErrMap = (issue, ctx) => {
  if (issue.code === "invalid_type") {
    return { message: "类型错误：期望 " + issue.expected + "，收到 " + issue.received };
  }
  if (issue.code === "too_small") {
    return { message: "太小了" };
  }
  return { message: ctx.defaultError };
};
const r3 = z.number().int().safeParse("abc", { errorMap: customErrMap });
console.log("自定义错误:", r3.error.issues[0].message);`,
  },

  // =========================================================
  // 第二十章：常见模式与最佳实践
  // =========================================================
  {
    id: "zod-best-practices",
    icon: "⭐",
    group: "进阶技巧",
    title: "常见模式与最佳实践",
    content: `## 1. Schema 复用与组合

不要重复定义。把基础 Schema 抽出来复用：

\`\`\`js
// 公共字段
const IdField = z.string().uuid();
const Timestamps = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
// 组合
const Post = z.object({
  id: IdField,
  title: z.string(),
}).extend(Timestamps.shape);
\`\`\`

用 \`.extend()\` / \`.merge()\` / \`.pick()\` / \`.omit()\` 拼装不同场景的 Schema。

## 2. 一份 Schema 前后端共享

把 Schema 放在共享目录（如 \`shared/schemas.ts\`），前端做表单校验、后端做入参校验。**校验逻辑只有一处真相**：

\`\`\`js
// 后端
app.post("/user", (req, res) => {
  const r = UserSchema.safeParse(req.body);
  if (!r.success) return res.status(400).json(r.error.flatten());
  // r.data 安全可用
});
\`\`\`

## 3. 用 safeParse 处理外部输入

外部输入（表单、API、query）一律 \`safeParse\`，**不要让校验失败变成未捕获异常**。只有可信的内部数据才用 \`parse\`。

## 4. 自定义友好错误信息

Zod 默认错误信息是英文且偏技术化。给面向用户的字段都写中文信息：

\`\`\`js
z.string().email("请输入正确的邮箱").min(8, "密码至少 8 位")
\`\`\`

## 5. 数字字段记得 coerce

表单/URL 参数都是字符串，数字字段用 \`z.coerce.number()\`：

\`\`\`js
{ age: z.coerce.number().int().min(18) }
\`\`\`

## 6. 复杂校验用 superRefine 一次报多个错

让用户一次看到所有问题，而不是改一个错提交一次：

\`\`\`js
.superRefine((val, ctx) => { /* 多次 addIssue */ })
\`\`\`

## 7. 不要信任任何外部数据

养成习惯：**数据进入业务逻辑前先过 Schema**。不管是 req.body、fetch 响应、localStorage、还是 config 文件。

## 8. 性能注意

- \`z.union\` 对象联合性能差，优先用 \`z.discriminatedUnion\`
- Schema 是不可变的，\`.min()\` 等返回新对象，**不要在循环里反复构建 Schema**，提到外面复用
- 大对象校验可用 \`.passthrough()\` 跳过严格模式（但会失去剥离能力）

## 9. 配合 TS 的 z.infer

让类型跟着 Schema 走，避免维护两份：

\`\`\`ts
const Schema = z.object({ ... });
type T = z.infer<typeof Schema>; // 自动同步
\`\`\`

## 10. 错误上报

线上环境把 safeParse 失败的 \`error.issues\` 上报到监控，能及早发现"接口改了但前端没跟"这类问题。

下面运行一个综合最佳实践示例。`,
    code: `// 第二十章：常见模式与最佳实践
const { z } = require("zod");

// ===== 1. Schema 复用与组合 =====
const IdField = z.string().uuid();
const Timestamps = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
const PostSchema = z.object({
  id: IdField,
  title: z.string().min(1, "标题不能为空").max(100, "标题最多 100 字"),
  content: z.string().min(10, "内容至少 10 字"),
  status: z.enum(["draft", "published"]).default("draft"),
}).extend(Timestamps.shape);

console.log("========== 1. Schema 组合 ==========");
console.log("Post 字段:", Object.keys(PostSchema.shape));

// ===== 2. 一份 Schema 同时给前端和后端用 =====
// 后端入参校验 + 前端表单校验共用
function validatePost(input) {
  const r = PostSchema.safeParse(input);
  if (r.success) return { ok: true, data: r.data };
  // 扁平错误，给前端展示
  const errors = {};
  r.error.issues.forEach((i) => {
    const key = i.path[0] || "_form";
    if (!errors[key]) errors[key] = i.message;
  });
  return { ok: false, errors };
}

console.log("\\n========== 2. 前后端共享校验 ==========");
const post1 = validatePost({
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Zod 入门",
  content: "这是一篇关于 Zod 的入门文章...",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-02T00:00:00Z",
});
console.log("合法:", post1.ok, "| status 默认:", post1.data.status);

const post2 = validatePost({ id: "bad", title: "", content: "短" });
console.log("非法:", post2.ok);
console.log("错误:", post2.errors);

// ===== 3. discriminatedUnion 性能优化 =====
console.log("\\n========== 3. discriminatedUnion 优于 union ==========");
const Event = z.discriminatedUnion("type", [
  z.object({ type: z.literal("click"), x: z.number(), y: z.number() }),
  z.object({ type: z.literal("scroll"), delta: z.number() }),
  z.object({ type: z.literal("key"), key: z.string() }),
]);
console.log("click:", Event.safeParse({ type: "click", x: 10, y: 20 }).success);
console.log("key:", Event.safeParse({ type: "key", key: "Enter" }).success);
console.log("未知:", Event.safeParse({ type: "hover" }).success);

// ===== 4. 外部输入一律 safeParse =====
console.log("\\n========== 4. safeParse 不抛异常 ==========");
function handleQuery(qs) {
  const Schema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    keyword: z.string().trim().default(""),
  });
  const r = Schema.safeParse(qs);
  if (!r.success) {
    console.log("参数错误:", r.error.issues[0].message);
    return null;
  }
  return r.data; // 安全数据，放心用
}
console.log("合法:", handleQuery({ page: "2", keyword: "  zod  " }));
console.log("非法:", handleQuery({ page: "abc" }));

// ===== 5. Schema 提到循环外复用 =====
console.log("\\n========== 5. Schema 复用（不重复构建） ==========");
const ItemSchema = z.object({ name: z.string(), price: z.number().positive() }); // 只构建一次
const items = [{ name: "a", price: 1 }, { name: "b", price: 2 }, { name: "c", price: -1 }];
items.forEach((it) => {
  const r = ItemSchema.safeParse(it);
  console.log(it.name + ":", r.success ? "有效" : r.error.issues[0].message);
});

// ===== 6. 综合实践：API 处理函数 =====
console.log("\\n========== 6. 综合实践 ==========");
// 模拟后端 handler：入参校验 + 业务逻辑 + 出参保证
const CreateOrderSchema = z.object({
  userId: IdField,
  items: z.array(z.object({
    productId: z.string(),
    qty: z.number().int().positive(),
  })).min(1, "至少一个商品"),
  coupon: z.string().optional(),
}).superRefine((d, ctx) => {
  if (d.items.length > 50) {
    ctx.addIssue({ code: "custom", message: "单次最多 50 件商品", path: ["items"] });
  }
});

function createOrder(reqBody) {
  const r = CreateOrderSchema.safeParse(reqBody);
  if (!r.success) {
    return { code: 400, message: r.error.issues[0].message };
  }
  const data = r.data;
  const totalQty = data.items.reduce((s, i) => s + i.qty, 0);
  return { code: 0, data: { orderId: "ORD-" + Date.now(), totalQty, coupon: data.coupon || null } };
}
console.log("合法:", createOrder({
  userId: "550e8400-e29b-41d4-a716-446655440000",
  items: [{ productId: "p1", qty: 2 }, { productId: "p2", qty: 1 }],
  coupon: "NEW10",
}));
console.log("空购物车:", createOrder({
  userId: "550e8400-e29b-41d4-a716-446655440000",
  items: [],
}));`,
  },
];

export const zodChapterGroups = [
  "快速入门",
  "基础类型",
  "对象与组合",
  "自定义与转换",
  "实战应用",
  "进阶技巧",
];
