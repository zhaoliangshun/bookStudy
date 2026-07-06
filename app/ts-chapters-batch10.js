// =============================================================
// TypeScript 交互式教程 —— 第十批章节（共 5 章 · 进阶类型与工程化）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. ts-satisfies           — satisfies 操作符深入
//   2. ts-ts5-features        — TypeScript 5.x-6.x 新特性汇总
//   3. ts-variance            — 协变、逆变与双变深入
//   4. ts-unknown-any-deep    — unknown vs any 系统对比
//   5. ts-assertion-vs-guard  — 类型断言与类型守卫对比
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解（文字量是普通教程的 10 倍）
//   code    : 可运行、带详细中文注释的 TypeScript 示例代码
//
// 代码运行环境约束：
//   - 用户写的 TypeScript 先被 typescript 编译器转译为 JS
//     (target ES2020, module CommonJS, 支持装饰器, isolatedModules)
//   - 再在 Node.js vm 沙箱中运行，5 秒超时
//   - 仅可 require: fs, path, os, url, crypto, util, events, stream,
//     buffer, querystring, string_decoder, zlib, assert, timers
//   - 全局可用: console, process, Buffer, setTimeout, setInterval,
//     setImmediate, URL, TextEncoder, TextDecoder, Promise,
//     __dirname, __filename, require, module, exports
//   - 沙箱上下文自带 Math/JSON/Date/Map/Set/Array/Object 等内置对象
//   - 高级类型（条件类型/映射类型/infer/模板字面量类型）在转译后
//     全部被擦除，代码 demo 用 typeof 验证运行时值类型，并用注释
//     说明编译期的类型计算结果
//   - 类型错误不会阻止运行(教程侧重运行结果)
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：satisfies 操作符深入
  // =========================================================
  {
    id: "ts-satisfies",
    title: "satisfies 操作符深入",
    icon: "✅",
    group: "进阶类型深入",
    content: `## satisfies 操作符深入

\`satisfies\` 是 TypeScript 4.9 引入的一个看似简单却极具实用价值的关键字。它解决了一个长期困扰 TS 开发者的两难问题：**既想让编译器验证某个值符合某个类型约束，又想保留这个值最精确的字面量类型推导**。在 \`satisfies\` 出现之前，这两个目标几乎是互相排斥的——你要么用类型注解强制拓宽类型（牺牲精度），要么用 \`as\` 断言绕过检查（牺牲安全），要么写一堆冗余的显式注解（牺牲简洁）。本章将极其详细地讲解 \`satisfies\` 的动机、语法、与 \`as\` / 类型注解的差异、实战场景、与 \`as const\` 的组合拳、与索引签名的配合，以及常见的陷阱与最佳实践。

### satisfies 的动机：精度与安全的两难

考虑一个常见的场景：定义一个配置对象，每个属性都有自己的字面量类型，同时又想确保整个对象符合某个约束。

\`\`\`ts
// 想法：定义路由配置，每个路由有自己的精确类型
const routes = {  // 声明常量 routes
  home: { path: "/home", auth: false },
  login: { path: "/login", auth: false },
  dashboard: { path: "/dashboard", auth: true },
};

// 期望：编译器知道 routes.home.auth 是字面量 false，而不是 boolean
// 期望：同时验证每个路由都有 path 和 auth 属性
\`\`\`

如果不加任何注解，TypeScript 会推导出 \`routes.home.auth\` 的类型是 \`boolean\`（拓宽了），失去了字面量精度。如果想强制约束每个路由的结构：

\`\`\`ts
type RouteConfig = Record<string, { path: string; auth: boolean }>;  // 定义类型别名 RouteConfig

const routes: RouteConfig = {  // 声明常量 routes，类型 RouteConfig
  home: { path: "/home", auth: false },
  // ...
};
// 后果：routes.home.auth 变成了 boolean，不再是字面量 false
\`\`\`

类型注解\` : RouteConfig\` 强制拓宽了类型——这正是问题所在。你"赢得了约束，却失去了精度"。

\`satisfies\` 让你鱼和熊掌兼得：

\`\`\`ts
const routes = {  // 声明常量 routes
  home: { path: "/home", auth: false },
  login: { path: "/login", auth: false },
  dashboard: { path: "/dashboard", auth: true },
} satisfies Record<string, { path: string; auth: boolean }>;

// 现在 routes.home.auth 的类型是 false（字面量），不是 boolean
// 同时编译器验证了整个对象符合 RouteConfig 约束
\`\`\`

\`satisfies T\` 的语义是：**"我承诺这个值满足类型 T，请编译器帮我验证；但请保留这个值原本的精确类型，不要拓宽。"** 这是一种"验证而不拓宽"的操作。

### satisfies 的语法

\`\`\`ts
表达式 satisfies 类型
\`\`\`

\`satisfies\` 是一个中缀操作符，左边是要验证的表达式，右边是约束类型。表达式可以是对象字面量、数组字面量、函数表达式、变量等任何有类型的值。

#### 验证失败会报错

\`\`\`ts
type RouteConfig = Record<string, { path: string; auth: boolean }>;  // 定义类型别名 RouteConfig

const badRoutes = {  // 声明常量 badRoutes
  home: { path: "/home" }, // ❌ 缺少 auth 属性
} satisfies RouteConfig;
// 编译错误：Type '{ path: string; }' is not assignable to type '{ path: string; auth: boolean; }'
\`\`\`

如果验证不通过，编译器会报错——这是 \`satisfies\` 与 \`as\` 最大的区别。

### satisfies vs as：验证 vs 强制

\`as\` 是**类型断言**（Type Assertion），语义是"我（开发者）知道这个值是什么类型，编译器你别管了"。它**不做真正的检查**，只是覆盖编译器的推导。

\`\`\`ts
const x = "hello" as number; // ❌ 编译错误：string 和 number 不够重叠
const y = "hello" as unknown as number; // ✅ 双重断言绕过，但运行时 y 仍是字符串
\`\`\`

\`as\` 的危险在于：它能让编译器"相信"一个错误的类型，从而在后续代码中产生虚假的类型安全。

\`satisfies\` 则是**类型验证**（Type Validation），语义是"编译器请你检查这个值是否符合这个类型，如果不符合就报错"。它**真正做检查**，而且不会改变推导出的类型。

| 维度 | \`as T\` | \`satisfies T\` |
| --- | --- | --- |
| 语义 | 强制覆盖（断言） | 验证（检查） |
| 编译期检查 | 几乎不检查（只查"够不够重叠"） | 完整检查（值必须可赋值给 T） |
| 失败行为 | 只在极端不重叠时报错 | 不符合约束就报错 |
| 推导结果类型 | 变成 T | 保留原推导类型 |
| 运行时影响 | 无 | 无 |
| 安全性 | 低（逃生舱） | 高 |

#### 对比示例

\`\`\`ts
type RouteConfig = Record<string, { path: string; auth: boolean }>;  // 定义类型别名 RouteConfig

// as：绕过检查
const r1 = {  // 声明常量 r1
  home: { path: "/home" }, // 缺少 auth
} as RouteConfig;  // 注意：类型断言会绕过类型检查
// ✅ 编译通过，但 r1.home.auth 是 undefined（运行时崩溃）

// satisfies：真正检查
const r2 = {  // 声明常量 r2
  home: { path: "/home" }, // 缺少 auth
} satisfies RouteConfig;
// ❌ 编译错误：缺少 auth 属性
\`\`\`

这就是 \`satisfies\` 的核心价值——**真正的类型安全验证，而不是绕过检查**。

### satisfies vs 显式类型注解：保留精度

显式类型注解 \`const x: T = ...\` 会**拓宽**值的类型到 T，丢失字面量精度。

\`\`\`ts
type Colors = "red" | "green" | "blue";  // 定义类型别名 Colors

// 注解：类型拓宽成 Colors（联合）
const c1: Colors = "red";  // 声明常量 c1，类型 Colors
// c1 的类型是 Colors，不是 "red"
// 后续 if (c1 === "red") 中 "red" 仍可用，但 c1 本身是宽类型

// satisfies：保留字面量
const c2 = "red" satisfies Colors;  // 声明常量 c2
// c2 的类型是 "red"（字面量），同时验证了 "red" 属于 Colors
\`\`\`

#### 对象字面量的差异更明显

\`\`\`ts
type Config = Record<string, string | number>;  // 定义类型别名 Config，联合类型

// 注解：所有值的类型都拓宽成 string | number
const config1: Config = {  // 声明常量 config1，类型 Config
  host: "localhost",
  port: 3000,
};
// config1.host 的类型是 string | number（不是 "localhost"）
// config1.port 的类型是 string | number（不是 3000）

// satisfies：保留字面量类型
const config2 = {  // 声明常量 config2
  host: "localhost",
  port: 3000,
} satisfies Config;
// config2.host 的类型是 "localhost"（字面量）
// config2.port 的类型是 3000（字面量数字）
\`\`\`

这种精度差异在后续代码中非常有用——比如基于 \`config2.port\` 做条件判断时，TS 能知道它是字面量 \`3000\`，可以做更精确的类型收窄。

### 三种方式的对比表

| 方式 | 语法 | 验证 | 保留字面量 | 安全性 | 适用场景 |
| --- | --- | --- | --- | --- | --- |
| 显式注解 | \`const x: T = ...\` | ✅ 完整 | ❌ 拓宽到 T | 高 | 希望类型明确拓宽 |
| 类型断言 | \`x as T\` | ❌ 几乎不 | ❌ 变成 T | 低 | 确切知道类型，绕过推导 |
| satisfies | \`x satisfies T\` | ✅ 完整 | ✅ 保留原推导 | 高 | 既想验证又想保留精度 |

### 实战场景 1：配置对象验证

\`\`\`ts
type ServerConfig = {  // 定义类型别名 ServerConfig
  host: string;
  port: number;
  env: "development" | "production" | "test";
  features: {
    auth: boolean;
    logging: boolean;
    metrics: boolean;
  };
};

const config = {  // 声明常量 config
  host: "localhost",
  port: 3000,
  env: "development",
  features: {
    auth: true,
    logging: true,
    metrics: false,
  },
} satisfies ServerConfig;

// 后续代码能享受字面量精度
if (config.env === "development") {  // 条件判断
  // TS 知道这里 config.env 是 "development"
  console.log("开发模式");  // 控制台输出
}
\`\`\`

### 实战场景 2：路由表定义

\`\`\`ts
type RouteMap = Record<string, {  // 定义类型别名 RouteMap
  path: string;
  component: () => unknown;  // 箭头函数
  guard?: (params: unknown) => boolean;  // 箭头函数
}>;

const routes = {  // 声明常量 routes
  home: {
    path: "/",
    component: () => "HomePage",  // 箭头函数
  },
  profile: {
    path: "/profile",
    component: () => "ProfilePage",  // 箭头函数
    guard: (p) => !!p,  // 箭头函数
  },
} satisfies RouteMap;

// routes.profile.guard 的类型是 (p: unknown) => boolean | undefined
// 而不是 (p: unknown) => boolean（因为 guard 是可选的）
\`\`\`

### 实战场景 3：状态机转换表

\`\`\`ts
type States = "idle" | "loading" | "success" | "error";  // 定义类型别名 States
type Transitions = Record<States, States[]>;  // 定义类型别名 Transitions

const transitions = {  // 声明常量 transitions
  idle: ["loading"],
  loading: ["success", "error"],
  success: ["idle"],
  error: ["idle", "loading"],
} satisfies Transitions;

// transitions.idle 的类型是 States[]，但 transitions 本身的键被验证为 States
\`\`\`

### 实战场景 4：API 响应校验

\`\`\`ts
type ApiResponse = {  // 定义类型别名 ApiResponse
  status: "success" | "error";
  data?: unknown;
  error?: string;
};

const mockResponse = {  // 声明常量 mockResponse
  status: "success",
  data: { id: 1, name: "张三" },
} satisfies ApiResponse;

// mockResponse.status 是 "success"（字面量），可以做可辨识联合收窄
if (mockResponse.status === "success") {  // 条件判断
  console.log(mockResponse.data); // 类型是 { id: number; name: string }
}
\`\`\`

### satisfies + as const 组合拳

\`as const\` 让对象的所有属性变成 \`readonly\` 且保留字面量类型，\`satisfies\` 验证约束。两者组合能同时获得"只读 + 字面量 + 约束验证"。

\`\`\`ts
type RouteConfig = Record<string, { path: string; auth: boolean }>;  // 定义类型别名 RouteConfig

const routes = {  // 声明常量 routes
  home: { path: "/home", auth: false },
  dashboard: { path: "/dashboard", auth: true },
} as const satisfies RouteConfig;  // 注意：类型断言会绕过类型检查

// routes.home 的类型是 { readonly path: "/home"; readonly auth: false }
// 既验证了约束，又保留了只读字面量
// routes.home.path = "/x"; // ❌ 编译错误：readonly
\`\`\`

注意 \`as const satisfies T\` 的顺序——\`as const\` 在前，\`satisfies\` 在后。如果反过来 \`satisfies T as const\` 是语法错误。

### satisfies 与索引签名的配合

索引签名（\`[key: string]: T\`）通常会拓宽值的类型，但配合 \`satisfies\` 可以保留精度。

\`\`\`ts
type StringNumberMap = { [key: string]: string | number };  // 定义类型别名 StringNumberMap，联合类型

const map = {  // 声明常量 map
  a: "hello",
  b: 42,
  c: true, // ❌ boolean 不在 string | number 里
} satisfies StringNumberMap;
// 编译错误：c 的类型 boolean 不可赋值给 string | number
\`\`\`

\`satisfies\` 验证了每个属性都符合索引签名的值类型约束，同时保留了每个属性的具体类型。

### TS 4.9 引入背景

在 \`satisfies\` 引入之前，社区有几种"曲线救国"的方案：

1. **显式注解每个属性**：繁琐，且容易写错。
2. **用泛型函数包装**：如 \`function defineConfig<T extends RouteConfig>(c: T): T { return c; }\`，能保留精度但语法笨重。
3. **用 \`as\` 断言**：危险，绕过检查。

\`satisfies\` 是这些方案的"语法糖"——它用一个简洁的关键字实现了"验证 + 保留精度"，是 TypeScript 团队在长期社区反馈后的精心设计。

### 常见陷阱

1. **顺序问题**：\`as const satisfies T\` 是合法的，但 \`satisfies T as const\` 是语法错误。
2. **不能用于声明**：\`satisfies\` 只能用于表达式，不能用于类型声明。\`let x: T satisfies U\` 是错的。
3. **不改变推导类型**：\`satisfies\` 验证但不改变推导，所以后续赋值可能拓宽。
4. **过度使用**：不是所有场景都需要 \`satisfies\`，简单的类型注解有时更清晰。

### 最佳实践

1. **配置对象优先用 satisfies**：保留字面量精度，同时验证约束。
2. **路由表、状态机用 satisfies + as const**：获得只读 + 字面量 + 验证。
3. **避免滥用 as**：能用 \`satisfies\` 就别用 \`as\`。
4. **结合可辨识联合**：用 \`satisfies\` 保留判别字段的字面量类型，方便后续收窄。

下面通过代码演示 \`satisfies\` 的各种用法和与 \`as\` / 类型注解的对比。`,
    code: `// ============================================================
// satisfies 操作符深入 —— 代码演示
// ============================================================
// satisfies 在转译后会被擦除（它只在编译期做验证）。
// 我们用变量声明 + 赋值验证编译期类型计算，并用运行时
// 对象展示 satisfies 保留字面量精度的效果。

console.log("========== satisfies 操作符深入 ==========");

// ---- 1. 基础用法：配置对象用 satisfies 验证 ----
console.log("\\n---- 1. 基础用法：配置对象验证 ----");

// 定义约束类型
type ServerConfig = {
  host: string;
  port: number;
  env: "development" | "production" | "test";
  features: {
    auth: boolean;
    logging: boolean;
    metrics: boolean;
  };
};

// 用 satisfies 验证配置对象符合 ServerConfig，同时保留字面量精度
const config = {
  host: "localhost",
  port: 3000,
  env: "development", // 字面量 "development"
  features: {
    auth: true,
    logging: true,
    metrics: false,
  },
} satisfies ServerConfig;

// 编译期：config.host 的类型是 "localhost"（字面量），不是 string
// 编译期：config.port 的类型是 3000（字面量数字），不是 number
// 编译期：config.env 的类型是 "development"，不是联合类型
console.log("config.host:", config.host, "| typeof:", typeof config.host);
console.log("config.port:", config.port, "| typeof:", typeof config.port);
console.log("config.env:", config.env);
console.log("config.features:", JSON.stringify(config.features));

// 后续代码能享受字面量精度——可辨识联合收窄
if (config.env === "development") {
  console.log("→ 开发模式，启用调试日志");
}

// ---- 2. 对比三种方式：注解拓宽 vs as 绕过 vs satisfies 保留 ----
console.log("\\n---- 2. 三种方式对比 ----");

type ColorMap = Record<string, "red" | "green" | "blue">;

// 方式 A：显式类型注解 —— 类型拓宽
const colorsA: ColorMap = {
  primary: "red",
  secondary: "green",
  danger: "red",
};
// colorsA.primary 的类型是 "red" | "green" | "blue"（拓宽了）
console.log("[注解] colorsA.primary:", colorsA.primary);
console.log("[注解] 类型被拓宽到联合（失去字面量精度）");

// 方式 B：as 断言 —— 不做真正检查
const colorsB = {
  primary: "red",
  // secondary: "yellow", // ⚠️ "yellow" 不在联合里，但 as 不会报错
  danger: "blue",
} as ColorMap;
console.log("[as] colorsB:", JSON.stringify(colorsB));
console.log("[as] 不做真正检查，可能藏 bug");

// 方式 C：satisfies —— 验证 + 保留精度
const colorsC = {
  primary: "red",
  secondary: "green",
  danger: "red",
} satisfies ColorMap;
// colorsC.primary 的类型是 "red"（字面量保留）
// colorsC.danger 的类型也是 "red"
console.log("[satisfies] colorsC.primary:", colorsC.primary, "（保留字面量）");
console.log("[satisfies] colorsC.danger:", colorsC.danger, "（保留字面量）");

// 验证 satisfies 会真正检查：以下代码会编译错误（类型错误不阻止运行）
// const badColors = {
//   primary: "yellow", // ❌ "yellow" 不在 "red" | "green" | "blue" 中
// } satisfies ColorMap;
console.log("[satisfies] 如果写错颜色字面量，编译期会报错");

// ---- 3. 路由表实战 ----
console.log("\\n---- 3. 路由表实战 ----");

type RouteConfig = Record<string, {
  path: string;
  component: () => string;
  guard?: (params: unknown) => boolean;
}>;

const routes = {
  home: {
    path: "/",
    component: () => "HomePage",
  },
  profile: {
    path: "/profile",
    component: () => "ProfilePage",
    guard: function (p) { return !!p; },
  },
  settings: {
    path: "/settings",
    component: () => "SettingsPage",
    guard: function (p) { return p !== null; },
  },
} satisfies RouteConfig;

// routes 的键被验证（home/profile/settings 都是 string）
// 每个路由的 path 是字面量保留
console.log("routes.home.path:", routes.home.path);
console.log("routes.profile.component():", routes.profile.component());

// guard 是可选的，home 没有 guard
if (routes.profile.guard) {
  console.log("routes.profile.guard({id:1}):", routes.profile.guard({ id: 1 }));
}
console.log("routes.home.guard:", routes.home.guard, "（undefined，未定义）");

// 运行时模拟路由匹配
function matchRoute(routeName: keyof typeof routes, params?: unknown): string {
  const route = routes[routeName];
  if (route.guard && !route.guard(params)) {
    return "访问被拒绝: " + routeName;
  }
  return "访问: " + route.component() + " (path: " + route.path + ")";
}
console.log("matchRoute('home'):", matchRoute("home"));
console.log("matchRoute('profile', {id:1}):", matchRoute("profile", { id: 1 }));
console.log("matchRoute('profile', null):", matchRoute("profile", null));

// ---- 4. satisfies + as const 组合拳 ----
console.log("\\n---- 4. satisfies + as const ----");

type StatusConfig = Record<string, {
  label: string;
  color: string;
  priority: number;
}>;

const statuses = {
  pending: { label: "待处理", color: "#gray", priority: 1 },
  active: { label: "进行中", color: "#blue", priority: 2 },
  done: { label: "已完成", color: "#green", priority: 3 },
} as const satisfies StatusConfig;

// as const 让所有属性 readonly 且保留字面量
// satisfies 验证符合 StatusConfig
// statuses.pending.label 的类型是 "待处理"（字面量）
// statuses.pending.priority 的类型是 1（字面量数字）
console.log("statuses.pending.label:", statuses.pending.label);
console.log("statuses.pending.color:", statuses.pending.color);
console.log("statuses.pending.priority:", statuses.pending.priority);

// 以下代码会编译错误（readonly）：
// statuses.pending.label = "新标签"; // ❌ readonly
console.log("（编译期：statuses 是 readonly，不能修改）");

// 字面量精度让条件判断更精确
if (statuses.pending.priority === 1) {
  console.log("→ pending 优先级最低");
}

// ---- 5. 状态机转换表 ----
console.log("\\n---- 5. 状态机转换表 ----");

type OrderState = "created" | "paid" | "shipped" | "delivered" | "cancelled";
type TransitionTable = Record<OrderState, OrderState[]>;

const orderTransitions = {
  created: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [], // 终态
  cancelled: [], // 终态
} satisfies TransitionTable;

// 验证了每个状态都有转换列表，且转换目标都是合法状态
console.log("orderTransitions.created:", orderTransitions.created);
console.log("orderTransitions.paid:", orderTransitions.paid);
console.log("orderTransitions.delivered:", orderTransitions.delivered, "（终态）");

// 运行时模拟状态转换
function canTransition(from: OrderState, to: OrderState): boolean {
  return orderTransitions[from].includes(to);
}
console.log("canTransition('created', 'paid'):", canTransition("created", "paid"));
console.log("canTransition('created', 'shipped'):", canTransition("created", "shipped"), "（非法转换）");
console.log("canTransition('delivered', 'cancelled'):", canTransition("delivered", "cancelled"), "（终态不能转换）");

// ---- 6. satisfies 验证失败的场景演示 ----
console.log("\\n---- 6. satisfies 验证失败的场景 ----");

type StrictUser = {
  id: number;
  name: string;
  email: string;
};

// 以下代码会编译错误（类型错误不阻止运行）：
// const badUser = {
//   id: "1", // ❌ 应该是 number
//   name: "张三",
// } satisfies StrictUser;
// 编译错误：id 类型 string 不可赋值给 number，且缺少 email

// 正确的写法
const goodUser = {
  id: 1,
  name: "张三",
  email: "zhangsan@example.com",
} satisfies StrictUser;
console.log("goodUser:", JSON.stringify(goodUser));
console.log("（编译期：satisfies 验证了 goodUser 符合 StrictUser）");

// ---- 7. satisfies 保留精度用于后续收窄 ----
console.log("\\n---- 7. satisfies 保留精度用于收窄 ----");

type ApiResponse = {
  status: "success" | "error";
  data?: unknown;
  error?: string;
};

const mockSuccess = {
  status: "success",
  data: { id: 1, name: "张三" },
} satisfies ApiResponse;

const mockError = {
  status: "error",
  error: "用户不存在",
} satisfies ApiResponse;

// 因为 satisfies 保留了 status 的字面量类型，可以做可辨识联合收窄
function handleResponse(resp: typeof mockSuccess | typeof mockError): string {
  if (resp.status === "success") {
    // 这里 resp 被收窄为 { status: "success"; data: { id: number; name: string } }
    return "成功: " + JSON.stringify(resp.data);
  }
  // 这里 resp 被收窄为 { status: "error"; error: string }
  return "失败: " + resp.error;
}
console.log("handleResponse(mockSuccess):", handleResponse(mockSuccess));
console.log("handleResponse(mockError):", handleResponse(mockError));

// ---- 8. satisfies 与索引签名 ----
console.log("\\n---- 8. satisfies 与索引签名 ----");

type NumericMap = { [key: string]: number };

const scores = {
  math: 95,
  english: 88,
  science: 92,
} satisfies NumericMap;

// 每个属性都是 number（验证通过），且保留字面量精度
console.log("scores:", JSON.stringify(scores));
console.log("scores.math:", scores.math, "（字面量 95）");

// 以下会编译错误（值不是 number）：
// const badScores = {
//   math: "A", // ❌ string 不可赋值给 number
// } satisfies NumericMap;
console.log("（编译期：scores 的每个值都必须是 number）");

// ---- 9. 综合应用：类型安全的事件处理器注册 ----
console.log("\\n---- 9. 综合应用：事件处理器注册 ----");

type EventMap = {
  click: { x: number; y: number };
  input: { value: string };
  submit: { formData: Record<string, string> };
};

type HandlerMap = {
  [K in keyof EventMap]?: (payload: EventMap[K]) => void;
};

const handlers = {
  click: function (p) { console.log("  点击:", p.x, p.y); },
  submit: function (p) { console.log("  提交:", JSON.stringify(p.formData)); },
  // input 未注册（可选）
} satisfies HandlerMap;

console.log("注册的处理器:");
if (handlers.click) handlers.click({ x: 100, y: 200 });
if (handlers.submit) handlers.submit({ formData: { name: "张三" } });
console.log("handlers.input:", handlers.input, "（未注册）");

// ---- 10. satisfies 的运行时无影响 ----
console.log("\\n---- 10. satisfies 运行时无影响 ----");

const demo = { a: 1, b: "hello" } satisfies Record<string, string | number>;
console.log("demo:", JSON.stringify(demo));
console.log("typeof demo:", typeof demo);
console.log("demo.a:", demo.a, "（运行时就是普通对象，satisfies 不留痕迹）");
console.log("Object.keys(demo):", Object.keys(demo));

console.log("\\nsatisfies 操作符深入章节演示完成！");`,
  },

  // =========================================================
  // 第二章：TypeScript 5.x-6.x 新特性汇总
  // =========================================================
  {
    id: "ts-ts5-features",
    title: "TypeScript 5.x-6.x 新特性汇总",
    icon: "🚀",
    group: "工程化进阶",
    content: `## TypeScript 5.x-6.x 新特性汇总

TypeScript 5.0 是一个里程碑版本——它不仅带来了大量新特性，还完成了编译器内部的彻底重写（从自研代码库迁移到基于 TypeScript 自身的模块化架构），编译速度、内存占用、包体积都有显著改善。从 5.0 到 6.1，TypeScript 团队持续交付了大量语言层面的改进：全新装饰器标准、const 类型参数、显式资源管理（using）、import attributes、NoInfer 工具类型、推断类型谓词、迭代器辅助方法、可擦除语法、以及 6.0 重大版本的模块解析默认值变更等。本章将极其详细地梳理 TS 5.x-6.x 各版本的关键特性、演进时间线、升级注意事项，以及每个特性的实战用法。

### TS 5.0：里程碑版本

#### 全新装饰器标准（ECMAScript Decorators）

TS 5.0 抛弃了实验性装饰器（\`experimentalDecorators\`），转向支持 TC39 标准装饰器提案。新装饰器更简洁、更易于组合，且与 JavaScript 标准对齐。

| 维度 | 实验性装饰器（旧） | 标准装饰器（新） |
| --- | --- | --- |
| 启用方式 | \`experimentalDecorators: true\` | 默认支持 |
| API 风格 | 基于描述符（descriptor） | 基于 addInitializer / metadata |
| 元数据 | 需要 \`emitDecoratorMetadata\` | 内建 \`Symbol.metadata\` |
| 参数装饰器 | 支持 | 不直接支持（需要包装） |
| 与标准对齐 | 否 | 是 |

\`\`\`ts
// 标准装饰器示例
function logMethod(target: any, context: ClassMethodDecoratorContext) {  // 定义函数 logMethod，参数: target: any, context: ClassMethodDecoratorContext（注意：any 关闭了类型检查）
  return function (this: any, ...args: any[]) {  // 返回 function (this: any, ...args: any[]) {（注意：any 关闭了类型检查）
    console.log("调用", context.name, "参数", args);  // 控制台输出
    return target.apply(this, args);  // 返回 target.apply(this, args)
  };
}

class Calculator {  // 定义类 Calculator
  @logMethod  // 装饰器 logMethod
  add(a: number, b: number) { return a + b; }  // 调用 add
}
\`\`\`

#### const 类型参数

泛型类型参数现在可以加 \`const\` 修饰符，让推断结果保留字面量类型，无需调用方写 \`as const\`。

\`\`\`ts
function asTuple<const T extends readonly string[]>(arr: T): T {  // 定义函数 asTuple，泛型 const T extends readonly string[]，参数: arr: T，返回 T
  return arr;  // 返回 arr
}

const t = asTuple(["a", "b", "c"]);  // 声明常量 t
// t 的类型是 readonly ["a", "b", "c"]（保留字面量）
// 没有 const 修饰符的话，t 的类型会是 string[]
\`\`\`

#### 全新模块解析

TS 5.0 引入了新的 \`--moduleResolution\` 选项：

- \`bundler\`：为打包器（Vite/webpack/esbuild）设计，最灵活
- \`node16\` / \`nodenext\`：正确模拟 Node 16+ 的 ESM/CJS 互操作规则
- \`node10\`（旧 \`node\`）：传统 Node 解析，已过时

\`bundler\` 模式允许 import 没有扩展名的文件（像打包器一样），是现代前端项目的推荐选择。

#### enum 现代化

旧版 TS 的 enum 有一些反直觉的行为（如 \`enum E { A } \` 的 \`E.A\` 可以是 number）。TS 5.0 修复了多个 enum 相关的 bug，并让 enum 的类型推导更精确。

### TS 5.1：装饰器元数据与性能

#### 装饰器元数据

TS 5.1 完善了装饰器元数据支持，可以通过 \`context.metadata\` 访问和写入类的元数据。

\`\`\`ts
function route(path: string) {  // 定义函数 route，参数: path: string
  return function (target: any, context: ClassMethodDecoratorContext) {  // 返回 function (target: any, context: ClassMethodDecoratorContext) {（注意：any 关闭了类型检查）
    context.metadata.routes ||= {};
    context.metadata.routes[context.name as string] = path;  // 注意：类型断言会绕过类型检查
  };
}

class ApiController {  // 定义类 ApiController
  @route("/users")  // 装饰器 route
  getUsers() {}  // 调用 getUsers
}
\`\`\`

#### 类型检查性能优化

TS 5.1 大幅优化了类型检查性能，特别是对大型 union 类型和复杂泛型的推导速度。

### TS 5.2：显式资源管理（using）

TS 5.2 实现了 TC39 Explicit Resource Management 提案，引入了 \`using\` 声明和 \`Symbol.dispose\` / \`Symbol.asyncDispose\`。

\`\`\`ts
class FileResource implements Disposable {  // 定义类 FileResource，implements Disposable
  constructor(public name: string) {}  // 调用 constructor
  [Symbol.dispose]() {
    console.log("关闭文件:", this.name);  // 控制台输出
  }
}

{
  using file = new FileResource("data.txt");
  console.log("使用文件");  // 控制台输出
} // 离开作用域时自动调用 file[Symbol.dispose]()
\`\`\`

\`using\` 类似 Python 的 \`with\` 或 C# 的 \`using\`——确保资源在作用域结束时被清理，即使中间抛异常。对于 \`async\` 场景，可以用 \`await using\` 配合 \`AsyncDisposable\` 和 \`Symbol.asyncDispose\`。

### TS 5.3：import attributes

TS 5.3 支持了 \`import attributes\` 语法（\`with\` 关键字）：

\`\`\`ts
import data from "./data.json" with { type: "json" };  // 导入 data
import wasm from "./module.wasm" with { type: "webassembly" };  // 导入 wasm
\`\`\`

这是对旧的 \`assert\` 语法的替代（\`assert { type: "json" }\` 已废弃）。

### TS 5.4：NoInfer 与 Object.groupBy

#### NoInfer 工具类型

\`NoInfer<T>\` 阻止 TS 从某个位置推断类型，常用于避免"推断出过宽的类型导致后续校验失效"。

\`\`\`ts
function createState<T>(initial: T, fallback: NoInfer<T>): T {  // 定义函数 createState，泛型 T，参数: initial: T, fallback: NoInfer<T>，返回 T
  return initial ?? fallback;  // 返回 initial ?? fallback
}

createState("hello", "world"); // ✅ T 推断为 "hello"，fallback 必须匹配
// 没有 NoInfer 的话，T 会被推断为 "hello" | "world"
\`\`\`

#### Object.groupBy / Map.groupBy

TS 5.4 为这两个新 API 提供了类型支持：

\`\`\`ts
const items = [  // 声明常量 items
  { kind: "fruit", name: "apple" },
  { kind: "fruit", name: "banana" },
  { kind: "veggie", name: "carrot" },
];

const grouped = Object.groupBy(items, (item) => item.kind);  // 声明常量 grouped
// grouped.fruit 是 [{ name: "apple" }, { name: "banana" }]
\`\`\`

### TS 5.5：推断类型谓词

这是 TS 5.5 的旗舰特性——TypeScript 能自动推断函数返回的类型谓词（\`x is Type\`），无需手动标注。

\`\`\`ts
// 旧：需要手动写类型谓词
const isString = (x: unknown): x is string => typeof x === "string";  // 类型守卫：判断是否为 string

// 新：TS 5.5 自动推断
const isString = (x: unknown) => typeof x === "string";  // 类型守卫：判断是否为 string
// TS 自动推断 isString 的返回类型为 (x: unknown) => x is string

const arr: unknown[] = ["a", 1, "b"];  // 声明常量 arr，类型 unknown[]
const strs = arr.filter(isString); // strs: string[]
\`\`\`

这让自定义类型守卫的编写更简洁，也让 \`Array.filter\` 的类型推导更智能。

### 各版本特性时间线表

| 版本 | 发布时间 | 旗舰特性 |
| --- | --- | --- |
| 5.0 | 2023.03 | 标准装饰器、const 类型参数、新模块解析 |
| 5.1 | 2023.06 | 装饰器元数据、类型检查性能优化 |
| 5.2 | 2023.08 | using 显式资源管理 |
| 5.3 | 2023.11 | import attributes (with 语法) |
| 5.4 | 2024.03 | NoInfer 工具类型、Object.groupBy |
| 5.5 | 2024.06 | 推断类型谓词、const 类型参数占位符 |
| 5.6 | 2024.09 | 迭代器辅助方法、strict BuiltinIterator Checks |
| 5.7 | 2024.11 | ES2024 API、--rewriteRelativeImportExtensions |
| 5.8 | 2025.03 | --erasableSyntaxOnly、annotate 与推断类型声明 |
| 6.0 | 2025.10 | 重大版本：默认 moduleResolution 为 bundler、移除废弃选项 |
| 6.1 | 2026.03 | 进一步增强 |

### 升级注意事项与 Breaking Changes

1. **标准装饰器与实验性装饰器不兼容**：迁移时需要重写装饰器代码。
2. **模块解析变化**：\`bundler\` / \`node16\` / \`nodenext\` 比 \`node\` 更严格，可能要求显式扩展名。
3. **enum 行为变化**：一些旧的 enum 边界行为被修复，可能导致原本能编译的代码报错。
4. **--target 影响**：\`using\` 需要 \`ES2022\` 或更高 target 才能正确生成代码。
5. **包体积减少**：TS 5.0 移除了内嵌的 TypeScript 编译器源码，包体积从 ~60MB 降到 ~20MB。

### 最佳实践

1. **新项目默认用 TS 5.x 最新版**：享受性能和特性红利。
2. **装饰器优先用标准装饰器**：与 JS 标准对齐，未来兼容性好。
3. **const 类型参数减少 as const 滥用**：让库的 API 更易用。
4. **using 替代 try/finally**：资源管理更简洁可靠。
5. **升级前用 \`tsc --noEmit\` 检查**：先确认无类型错误再升级。

下面通过代码演示 TS 5.x 的关键特性。`,
    code: `// ============================================================
// TypeScript 5.x-6.x 新特性汇总 —— 代码演示
// ============================================================
// 注意：部分特性（如标准装饰器、using）需要 TS 5.0+ 和合适的
// target 配置才能正确转译。这里演示核心概念，沙箱环境会尽力
// 转译，重点展示运行时行为和类型推导效果。

console.log("========== TypeScript 5.x 新特性 ==========");

// ---- 1. const 类型参数（TS 5.0） ----
console.log("\\n---- 1. const 类型参数 ----");

// 旧写法：泛型 T 推断为 string[]，丢失字面量
function asTupleOld<T extends readonly string[]>(arr: T): T {
  return arr;
}
const oldTuple = asTupleOld(["a", "b", "c"]);
// oldTuple 的类型是 string[]（字面量丢失）

// 新写法：const 修饰符让 T 推断为 readonly ["a", "b", "c"]
// 注意：转译后 const 修饰符被擦除，运行时行为一致
function asTupleNew<const T extends readonly string[]>(arr: T): T {
  return arr;
}
const newTuple = asTupleNew(["a", "b", "c"]);
// newTuple 的类型是 readonly ["a", "b", "c"]（保留字面量）

console.log("asTupleOld(['a','b','c']):", JSON.stringify(oldTuple));
console.log("asTupleNew(['a','b','c']):", JSON.stringify(newTuple));
console.log("（编译期：newTuple 保留字面量类型 readonly ['a','b','c']）");

// const 类型参数的应用：构建类型安全的 API
function createConfig<const T extends Record<string, unknown>>(config: T): T {
  return config;
}
const appConfig = createConfig({
  port: 3000,
  host: "localhost",
});
// appConfig.port 的类型是 3000（字面量），不是 number
console.log("createConfig:", JSON.stringify(appConfig));

// ---- 2. using 显式资源管理（TS 5.2） ----
console.log("\\n---- 2. using 显式资源管理 ----");

// 模拟 Disposable 接口（TS 5.2 内置 Symbol.dispose）
interface Disposable {
  [Symbol.dispose](): void;
}

class FileResource implements Disposable {
  constructor(public name: string) {
    console.log("  打开文件:", name);
  }
  [Symbol.dispose]() {
    console.log("  关闭文件:", this.name);
  }
  read(): string {
    return "文件内容: " + this.name;
  }
}

// using 声明（注意：沙箱可能不支持 using 语法，这里用 try/finally 模拟）
function useFileDemo(): void {
  console.log("  模拟 using 资源管理:");
  const file = new FileResource("data.txt");
  try {
    console.log("  " + file.read());
  } finally {
    file[Symbol.dispose]();
  }
}
useFileDemo();

// AsyncDisposable 示例（概念演示）
interface AsyncDisposable {
  [Symbol.asyncDispose](): Promise<void>;
}

class DatabaseConnection implements AsyncDisposable {
  constructor(public url: string) {
    console.log("  连接数据库:", url);
  }
  async [Symbol.asyncDispose]() {
    console.log("  异步关闭数据库连接:", this.url);
    await new Promise<void>(function (resolve) { setTimeout(resolve, 10); });
  }
  query(sql: string): string {
    return "查询结果: " + sql;
  }
}

// await using 的概念演示
async function dbDemo(): Promise<void> {
  console.log("  模拟 await using 异步资源管理:");
  const db = new DatabaseConnection("mysql://localhost");
  try {
    console.log("  " + db.query("SELECT 1"));
  } finally {
    await db[Symbol.asyncDispose]();
  }
}
dbDemo().then(function () {
  console.log("  数据库演示完成");
});

// ---- 3. NoInfer 工具类型（TS 5.4） ----
console.log("\\n---- 3. NoInfer 工具类型 ----");

// NoInfer<T> 阻止从某个位置推断类型
// 场景：创建状态时，fallback 不应该影响 initial 的推断

// 旧写法（没有 NoInfer）：T 会被推断为联合类型
function createStateBad<T>(initial: T, fallback: T): T {
  return initial !== null && initial !== undefined ? initial : fallback;
}
const stateBad = createStateBad("hello", "world");
// stateBad 的类型是 "hello" | "world"（T 被两个位置联合推断）

// 新写法（用 NoInfer）：T 只从 initial 推断
type NoInfer<T> = T; // 沙箱可能没有内置 NoInfer，这里用一个简化版演示
// 实际 TS 5.4 的 NoInfer 会阻止推断，这里只是演示概念
function createStateGood<T>(initial: T, fallback: NoInfer<T>): T {
  return initial !== null && initial !== undefined ? initial : fallback;
}
const stateGood = createStateGood("hello", "world");
// stateGood 的类型是 "hello"（T 只从 initial 推断）

console.log("createStateBad('hello', 'world'):", stateBad);
console.log("createStateGood('hello', 'world'):", stateGood);
console.log("（编译期：stateGood 保留 'hello' 字面量，stateBad 是联合）");

// NoInfer 的实际应用：避免 fallback 拓宽类型
interface Pet { name: string; kind: string; }
function createPet<T extends Pet>(pet: T, fallback: NoInfer<T>): T {
  return pet.name ? pet : fallback;
}
const myPet = createPet(
  { name: "旺财", kind: "dog" },
  { name: "无名", kind: "unknown" }
);
console.log("createPet:", JSON.stringify(myPet));

// ---- 4. 标准装饰器（TS 5.0） ----
console.log("\\n---- 4. 标准装饰器 ----");

// TS 5.0 标准装饰器语法（与实验性装饰器不同）
// 注意：标准装饰器使用 ClassMethodDecoratorContext 等上下文对象

// 模拟标准装饰器（沙箱转译可能不完全支持，这里用对象模式演示）
function logMethod(target: Function, context: { name: string | symbol }) {
  return function (this: any, ...args: any[]) {
    console.log("  [装饰器] 调用 " + String(context.name) + " 参数:", JSON.stringify(args));
    const result = target.apply(this, args);
    console.log("  [装饰器] " + String(context.name) + " 返回:", result);
    return result;
  };
}

class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
  multiply(a: number, b: number): number {
    return a * b;
  }
}

// 手动应用装饰器（演示概念）
const calc = new Calculator();
calc.add = logMethod(calc.add, { name: "add" }) as any;
calc.multiply = logMethod(calc.multiply, { name: "multiply" }) as any;

console.log("标准装饰器演示:");
console.log("calc.add(2, 3) =", calc.add(2, 3));
console.log("calc.multiply(4, 5) =", calc.multiply(4, 5));

// 装饰器元数据演示
function route(path: string): Function {
  return function (target: Function, context: { name: string | symbol; metadata?: any }) {
    context.metadata = context.metadata || {};
    context.metadata.routes = context.metadata.routes || {};
    context.metadata.routes[String(context.name)] = path;
    return target;
  };
}

class ApiController {
  getUsers(): string { return "用户列表"; }
  createUser(): string { return "创建用户"; }
}

// 模拟元数据收集
const apiMeta: Record<string, string> = {};
const getUsersDecorator = route("/users");
const createUserDecorator = route("/users");
getUsersDecorator(ApiController.prototype.getUsers, { name: "getUsers", metadata: apiMeta });
createUserDecorator(ApiController.prototype.createUser, { name: "createUser", metadata: apiMeta });
console.log("装饰器元数据（路由表）:", JSON.stringify(apiMeta, null, 2));

// ---- 5. 推断类型谓词（TS 5.5） ----
console.log("\\n---- 5. 推断类型谓词 ----");

// 旧写法：需要手动写类型谓词 (x is Type)
const isStringOld = (x: unknown): x is string => typeof x === "string";
const isNumberOld = (x: unknown): x is number => typeof x === "number";

// 新写法（TS 5.5）：自动推断类型谓词
// 注意：这里仍需手动写谓词以兼容沙箱，但概念上 TS 5.5 能自动推断
const isStringNew = (x: unknown) => typeof x === "string";
const isNumberNew = (x: unknown) => typeof x === "number";

// 应用：过滤数组时自动收窄类型
const mixed: unknown[] = ["hello", 42, "world", 100, true];

// 用类型谓词过滤
const strings = mixed.filter(isStringOld);
const numbers = mixed.filter(isNumberOld);
console.log("原始数组:", JSON.stringify(mixed));
console.log("过滤字符串:", JSON.stringify(strings));
console.log("过滤数字:", JSON.stringify(numbers));

// 更复杂的类型谓词：自定义对象类型守卫
interface User { id: number; name: string; }
const isUser = (x: unknown): x is User => {
  if (typeof x !== "object" || x === null) return false;
  const obj = x as Record<string, unknown>;
  return typeof obj.id === "number" && typeof obj.name === "string";
};

const candidates: unknown[] = [
  { id: 1, name: "张三" },
  { id: "2", name: "李四" }, // id 是 string，不符合
  { id: 3, name: "王五" },
  "不是对象",
];
const validUsers = candidates.filter(isUser);
console.log("候选对象:", JSON.stringify(candidates));
console.log("有效用户:", JSON.stringify(validUsers));

// ---- 6. import attributes 概念演示 ----
console.log("\\n---- 6. import attributes ----");

// TS 5.3 支持 with 语法（替代旧的 assert）
// import data from "./data.json" with { type: "json" };
// 沙箱中无法真正 import JSON 文件，这里用对象模拟

const jsonData = {
  name: "张三",
  age: 30,
  skills: ["TypeScript", "React"],
};
console.log("JSON 数据（模拟 import attributes）:", JSON.stringify(jsonData, null, 2));

// ---- 7. Object.groupBy / Map.groupBy（TS 5.4） ----
console.log("\\n---- 7. Object.groupBy / Map.groupBy ----");

interface Item { kind: string; name: string; price: number; }
const items: Item[] = [
  { kind: "fruit", name: "苹果", price: 5 },
  { kind: "fruit", name: "香蕉", price: 3 },
  { kind: "veggie", name: "胡萝卜", price: 2 },
  { kind: "veggie", name: "土豆", price: 4 },
  { kind: "meat", name: "牛肉", price: 50 },
];

// Object.groupBy（TS 5.4 提供类型支持，运行时需较新 Node）
// 沙箱可能没有 Object.groupBy，这里手动实现
function groupBy<T>(arr: T[], fn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  arr.forEach(function (item) {
    const key = fn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  });
  return result;
}

const grouped = groupBy(items, function (item) { return item.kind; });
console.log("按 kind 分组:");
Object.keys(grouped).forEach(function (key) {
  console.log("  " + key + ":", grouped[key].map(function (i) { return i.name; }).join(", "));
});

// 按价格区间分组
const byPriceRange = groupBy(items, function (item) {
  if (item.price < 5) return "便宜";
  if (item.price < 20) return "中等";
  return "昂贵";
});
console.log("按价格区间分组:");
Object.keys(byPriceRange).forEach(function (key) {
  console.log("  " + key + ":", byPriceRange[key].map(function (i) { return i.name + "(" + i.price + ")"; }).join(", "));
});

// ---- 8. 综合应用：使用 TS 5.x 特性的现代代码 ----
console.log("\\n---- 8. 综合应用 ----");

// 结合 const 类型参数 + NoInfer + 推断类型谓词
function createRepository<const T extends { id: string }>(
  initial: T[],
  defaultItem: NoInfer<T>
): {
  all: () => T[];
  find: (id: string) => T | undefined;
  filter: (predicate: (item: T) => boolean) => T[];
} {
  let items: T[] = [...initial];
  return {
    all: function () { return items; },
    find: function (id) { return items.find(function (i) { return i.id === id; }); },
    filter: function (predicate) { return items.filter(predicate); },
  };
}

interface Task { id: string; title: string; done: boolean; }
const taskRepo = createRepository<Task>(
  [
    { id: "t1", title: "学习 TS", done: false },
    { id: "t2", title: "写代码", done: true },
    { id: "t3", title: "review", done: false },
  ],
  { id: "default", title: "默认任务", done: false }
);

console.log("所有任务:", JSON.stringify(taskRepo.all()));
console.log("查找 t2:", JSON.stringify(taskRepo.find("t2")));
console.log("未完成任务:", JSON.stringify(taskRepo.filter(function (t) { return !t.done; })));

console.log("\\nTypeScript 5.x 新特性章节演示完成！");`,
  },

  // =========================================================
  // 第三章：协变、逆变与双变深入
  // =========================================================
  {
    id: "ts-variance",
    title: "协变、逆变与双变深入",
    icon: "🔄",
    group: "进阶类型深入",
    content: `## 协变、逆变与双变深入

协变（Covariance）、逆变（Contravariance）、双变（Bivariance）是类型系统中描述**复合类型（如函数、数组）的子类型关系如何由其组成部分决定**的规则。这些概念听起来抽象，但它们直接影响你写代码时的类型安全性——比如为什么 \`Dog[]\` 能赋值给 \`Animal[]\`（这其实是协变，有风险），为什么事件处理器的回调参数不能太严格（这涉及逆变），为什么 \`strictFunctionTypes\` 选项重要。本章将极其详细地讲解子类型关系、协变/逆变/双变/不变的语义、\`strictFunctionTypes\` 的影响、数组协变陷阱、方法 vs 函数属性的差异，以及实战中的坑。

### 子类型关系回顾

在讨论协变/逆变前，先回顾子类型（Subtyping）的基本概念。

**T1 是 T2 的子类型**（记作 \`T1 <: T2\`）意味着：任何期望 \`T2\` 类型值的地方，都可以安全地使用 \`T1\` 类型的值。直观上，子类型"更具体"或"更窄"。

\`\`\`ts
interface Animal { name: string; }  // 定义接口 Animal
interface Dog extends Animal { breed: string; }  // 定义接口 Dog，extends Animal

// Dog <: Animal
// 任何期望 Animal 的地方都能用 Dog
const a: Animal = { name: "旺财", breed: "柴犬" }; // ✅ Dog 可赋值给 Animal
\`\`\`

子类型关系是 TypeScript 类型兼容性的基础。结构化类型系统通过结构兼容性判断子类型——如果 \`Dog\` 有 \`Animal\` 的所有属性（且类型兼容），则 \`Dog <: Animal\`。

### 协变（Covariance）

**协变**：如果 \`T1 <: T2\`，那么 \`F<T1> <: F<T2>\`。即复合类型 \`F<>\` 保持了子类型关系**同向**。

#### 返回值是协变的

函数的返回类型是协变的——如果 \`Dog <: Animal\`，那么 \`() => Dog <: () => Animal\`。

\`\`\`ts
interface Animal { name: string; }  // 定义接口 Animal
interface Dog extends Animal { breed: string; }  // 定义接口 Dog，extends Animal

function makeDog(): Dog { return { name: "旺财", breed: "柴犬" }; }  // 定义函数 makeDog，返回 Dog
const makeAnimal: () => Animal = makeDog; // ✅ 协变，合法
\`\`\`

为什么合法？因为 \`makeDog()\` 返回 \`Dog\`，而 \`Dog\` 可以赋值给 \`Animal\`——调用方期望 \`Animal\`，得到 \`Dog\` 是安全的（\`Dog\` 有 \`Animal\` 的所有属性）。

#### 数组是协变的

\`Dog[]\` 可以赋值给 \`Animal[]\`——这是协变。

\`\`\`ts
const dogs: Dog[] = [{ name: "旺财", breed: "柴犬" }];  // 声明常量 dogs，类型 Dog[]
const animals: Animal[] = dogs; // ✅ 数组协变，合法
\`\`\`

但数组协变是**不安全**的（见下文"数组协变陷阱"），TypeScript 这么做主要是为了与旧代码兼容。

### 逆变（Contravariance）

**逆变**：如果 \`T1 <: T2\`，那么 \`F<T1> :> F<T2>\`（注意方向反转）。即复合类型 \`F<>\` 反转了子类型关系。

#### 函数参数是逆变的

函数的参数类型是逆变的——如果 \`Animal <: Dog\`？不对，应该是 \`Dog <: Animal\`。那么 \`（参数: Animal）=> void <: (参数: Dog) => void\`？

逆变规则：如果 \`Dog <: Animal\`，那么 \`(param: Animal) => void <: (param: Dog) => void\`。

注意方向反转：\`Animal\` 是更宽的类型，但接收 \`Animal\` 的函数却更"小"（更具体）。直观理解：**接收更宽类型参数的函数更通用，可以被用在期望更窄类型的地方**。

\`\`\`ts
function handleAnimal(a: Animal): void { console.log(a.name); }  // 定义函数 handleAnimal，参数: a: Animal，返回 void
const handleDog: (d: Dog) => void = handleAnimal; // ✅ 逆变，合法
\`\`\`

为什么合法？\`handleDog\` 期望接收 \`Dog\` 类型的参数。我们传给它 \`handleAnimal\`，\`handleAnimal\` 期望 \`Animal\`。当调用方传一个 \`Dog\` 时，\`handleAnimal\` 收到一个 \`Dog\`——\`Dog\` 有 \`Animal\` 的所有属性，所以 \`handleAnimal\` 能安全处理。这就是"接收更宽类型的函数更通用"的含义。

反过来不合法：

\`\`\`ts
function handleDog(d: Dog): void { console.log(d.breed); }  // 定义函数 handleDog，参数: d: Dog，返回 void
const handleAnimal: (a: Animal) => void = handleDog; // ❌ 逆变检查失败
// 原因：调用方可能传一个非 Dog 的 Animal（如 Cat），handleDog 访问 d.breed 会出错
\`\`\`

### 双变（Bivariance）

**双变**：既是协变又是逆变。如果 \`T1 <: T2\` 或 \`T2 <: T1\`，那么 \`F<T1>\` 和 \`F<T2>\` 互相兼容。

双变是"宽松"的模式——参数既允许协变也允许逆变。TypeScript 默认对**方法**（method syntax）使用双变，对**函数属性**（function property）在 \`strictFunctionTypes\` 开启时使用逆变。

#### 方法 vs 函数属性

\`\`\`ts
interface WithMethod {  // 定义接口 WithMethod
  handler(x: Animal): void; // 方法语法
}

interface WithFunctionProp {  // 定义接口 WithFunctionProp
  handler: (x: Animal) => void; // 函数属性语法
}
\`\`\`

这两种写法在运行时几乎等价，但在类型系统里行为不同：

- \`handler(x: Animal): void\`（方法）：参数双变
- \`handler: (x: Animal) => void\`（函数属性）：参数逆变（\`strictFunctionTypes\` 开启时）

为什么方法要双变？主要是历史原因——大量旧代码（如 DOM 事件处理器）依赖双变，强行改逆变会破坏兼容性。

### strictFunctionTypes 选项

\`strictFunctionTypes\`（包含在 \`strict\` 中）开启后，**函数属性**的参数检查从双变变为逆变（更严格）。但**方法**仍然是双变。

\`\`\`ts
// strictFunctionTypes: true
interface Animal { name: string; }  // 定义接口 Animal
interface Dog extends Animal { breed: string; }  // 定义接口 Dog，extends Animal

function handleAnimal(a: Animal): void {}  // 定义函数 handleAnimal，参数: a: Animal，返回 void
const fn1: (d: Dog) => void = handleAnimal; // ✅ 逆变合法

function handleDog(d: Dog): void { d.breed; }  // 定义函数 handleDog，参数: d: Dog，返回 void
const fn2: (a: Animal) => void = handleDog; // ❌ 逆变检查失败

// 但如果是方法语法，仍然合法（双变）
interface WithMethod {  // 定义接口 WithMethod
  handle(d: Dog): void;  // 方法声明 handle(d: Dog)，返回 void
}
const obj: WithMethod = { handle: handleAnimal }; // ✅ 方法双变
\`\`\`

\`strictFunctionTypes\` 是类型安全的重要防线——它防止"参数类型不匹配的回调"造成的运行时崩溃。新项目应该始终开启。

### 数组协变陷阱

数组是协变的，但这其实是**类型不安全**的设计。

\`\`\`ts
const dogs: Dog[] = [{ name: "旺财", breed: "柴犬" }];  // 声明常量 dogs，类型 Dog[]
const animals: Animal[] = dogs; // ✅ 协变合法

// 陷阱：通过 animals 写入一个非 Dog 的 Animal
animals.push({ name: "小喵" } as Animal); // 运行时合法，但 dogs 数组里混入了非 Dog
// 现在 dogs[1] 是 { name: "小喵" }，但 dogs 的类型是 Dog[]，访问 dogs[1].breed 会是 undefined
\`\`\`

TypeScript 允许这种不安全的协变，主要是为了与旧代码（如 \`Animal[] dogs = ...\` 的 Java 风格）兼容。更安全的做法是用**只读数组** \`readonly T[]\`——只读数组没有 \`push\`，避免了写入不安全的问题，但读取仍然是协变的。

\`\`\`ts
const dogs: readonly Dog[] = [{ name: "旺财", breed: "柴犬" }];  // 声明常量 dogs，类型 readonly Dog[]
const animals: readonly Animal[] = dogs; // ✅ 只读数组协变，无写入风险
\`\`\`

### 方法 vs 函数属性的双变差异

这是一个容易混淆的点——同样的"函数"在接口里写成方法 vs 函数属性，类型检查行为不同。

\`\`\`ts
interface Animal { name: string; }  // 定义接口 Animal
interface Dog extends Animal { breed: string; }  // 定义接口 Dog，extends Animal
interface Cat extends Animal { meow: boolean; }  // 定义接口 Cat，extends Animal

// 方法语法：双变
interface ListenerMethod {  // 定义接口 ListenerMethod
  on(event: Dog): void;  // 方法声明 on(event: Dog)，返回 void
}
const catListener: ListenerMethod = {  // 声明常量 catListener，类型 ListenerMethod
  on(event: Cat) { console.log(event.meow); }, // ✅ 双变，参数 Cat 替代 Dog
};

// 函数属性语法（strictFunctionTypes）：逆变
interface ListenerFunction {  // 定义接口 ListenerFunction
  on: (event: Dog) => void;  // 箭头函数
}
// const bad: ListenerFunction = { on: (event: Cat) => {} }; // ❌ 逆变检查失败
\`\`\`

写库时建议用函数属性语法（更安全），写应用代码时方法语法更宽松。

### 实战中的坑

#### 1. 事件处理器

\`\`\`ts
interface Event { type: string; }  // 定义接口 Event
interface ClickEvent extends Event { x: number; y: number; }  // 定义接口 ClickEvent，extends Event

// 期望接收 ClickEvent 的处理器
function setupClick(handler: (e: ClickEvent) => void) {  // 定义函数 setupClick，参数: handler: (e: ClickEvent
  document.addEventListener("click", handler as (e: Event) => void);  // 箭头函数（注意：类型断言会绕过类型检查）
}
\`\`\`

如果 \`handler\` 只接受 \`ClickEvent\`，把它传给 \`addEventListener\`（期望接收 \`Event\`）是不安全的——因为 \`addEventListener\` 可能传入非 \`ClickEvent\` 的事件。逆变的规则会让这种代码报错（\`strictFunctionTypes\` 下）。

#### 2. 回调签名

\`\`\`ts
// Promise.then 的回调
const p: Promise<Dog> = ...;  // 声明常量 p，类型 Promise<Dog>
p.then((animal: Animal) => animal.name); // ✅ 协变，then 期望 (Dog) => U，传入 (Animal) => U 合法（逆变参数）
\`\`\`

\`then\` 的回调参数是 \`Dog\`，但我们传入一个接收 \`Animal\` 的函数——逆变让这合法。

#### 3. Promise 链

\`\`\`ts
async function getDog(): Promise<Dog> { return { name: "旺财", breed: "柴犬" }; }  // 定义函数 getDog，返回 Promise<Dog>
async function getAnimal(): Promise<Animal> {  // 定义函数 getAnimal，返回 Promise<Animal>
  return getDog(); // ✅ Promise 协变，Promise<Dog> 可赋值给 Promise<Animal>
}
\`\`\`

Promise 是协变的——\`Promise<Dog>\` 可以赋值给 \`Promise<Animal>\`，因为 \`Dog\` 可以赋值给 \`Animal\`。

### 对比表：协变 / 逆变 / 双变 / 不变

| 模式 | 规则 | 例子 | 安全性 |
| --- | --- | --- | --- |
| 协变 | \`T1 <: T2\` ⟹ \`F<T1> <: F<T2>\` | 返回值、数组、Promise | 取决于是否只读 |
| 逆变 | \`T1 <: T2\` ⟹ \`F<T1> :> F<T2>\` | 函数参数（strict） | 安全 |
| 双变 | 协变 + 逆变 | 方法参数（默认） | 不安全 |
| 不变 | 既不协变也不逆变 | 可变容器（理想） | 最安全 |

### 方向性图示

用文字描述方向性：

\`\`\`
协变方向：  T1 <: T2  ⟹  F<T1> <: F<T2>     （同向）
逆变方向：  T1 <: T2  ⟹  F<T1> :> F<T2>     （反向）
双变方向：  T1 <: T2  ⟹  F<T1> ↔ F<T2>     （双向）
不变方向：  T1 <: T2  ⟹  F<T1> 与 F<T2> 无关 （无方向）
\`\`\`

记忆口诀：**"返回协，参数逆，方法双，容器不变"**。

### 最佳实践

1. **始终开启 \`strictFunctionTypes\`**：让函数属性参数逆变，更安全。
2. **只读数组用 \`readonly T[]\`**：避免数组协变的写入风险。
3. **库 API 用函数属性语法**：更严格的类型检查。
4. **回调参数设计要宽松**：让调用方能传更通用的处理器。
5. **理解方法 vs 函数属性的差异**：在需要双变时用方法，需要逆变时用函数属性。

下面通过代码演示协变、逆变、双变的具体行为。`,
    code: `// ============================================================
// 协变、逆变与双变深入 —— 代码演示
// ============================================================
// 协变/逆变是编译期的类型关系，转译后被擦除。我们用变量
// 赋值验证编译期的类型兼容性，用运行时函数展示实际行为。

console.log("========== 协变、逆变与双变深入 ==========");

// ---- 0. 定义基础类型层次 ----
console.log("\\n---- 0. 类型层次 ----");

interface Animal {
  name: string;
}
interface Dog extends Animal {
  breed: string;
}
interface Cat extends Animal {
  meow: boolean;
}

// Dog <: Animal, Cat <: Animal
const dog: Dog = { name: "旺财", breed: "柴犬" };
const cat: Cat = { name: "小喵", meow: true };
const animal: Animal = dog; // ✅ Dog <: Animal
console.log("Dog <: Animal:", animal.name);
console.log("Cat <: Animal:", (cat as Animal).name);

// ---- 1. 协变演示：返回值 ----
console.log("\\n---- 1. 协变：返回值 ----");

// 函数返回 Dog
function makeDog(): Dog {
  return { name: "旺财", breed: "柴犬" };
}
// 函数返回 Animal
function makeAnimal(): Animal {
  return { name: "动物" };
}

// 协变：() => Dog 可以赋值给 () => Animal
const makeAnimalFromDog: () => Animal = makeDog;
// 原因：调用方期望 Animal，得到 Dog 是安全的（Dog 有 Animal 的所有属性）
// 反过来不行：() => Animal 不能赋值给 () => Dog（Animal 可能没有 breed）
console.log("协变 makeAnimalFromDog():", JSON.stringify(makeAnimalFromDog()));

// 运行时验证：返回值的"安全性"
function useAnimalMaker(maker: () => Animal): string {
  const a = maker();
  return "使用 Animal: " + a.name; // 只访问 Animal 的属性，安全
}
console.log("useAnimalMaker(makeDog):", useAnimalMaker(makeDog));

// ---- 2. 逆变演示：参数 ----
console.log("\\n---- 2. 逆变：参数 ----");

// 接收 Animal 的函数（更通用）
function handleAnimal(a: Animal): string {
  return "处理 Animal: " + a.name;
}
// 接收 Dog 的函数（更具体）
function handleDog(d: Dog): string {
  return "处理 Dog: " + d.name + " (" + d.breed + ")";
}

// 逆变：(param: Animal) => void 可以赋值给 (param: Dog) => void
const handleDogFromAnimal: (d: Dog) => string = handleAnimal;
// 原因：调用方传 Dog，handleAnimal 收到 Dog（有 Animal 的所有属性），安全
console.log("逆变 handleDogFromAnimal(dog):", handleDogFromAnimal(dog));

// 运行时验证：接收更宽类型的函数更"通用"
function registerDogHandler(handler: (d: Dog) => string): string {
  const myDog: Dog = { name: "测试狗", breed: "金毛" };
  return handler(myDog);
}
console.log("registerDogHandler(handleAnimal):", registerDogHandler(handleAnimal));
console.log("registerDogHandler(handleDog):", registerDogHandler(handleDog));

// 逆变的反方向（不安全）：(param: Dog) => void 不能赋值给 (param: Animal) => void
// 因为调用方可能传 Cat，handleDog 访问 breed 会是 undefined
// 以下代码在 strictFunctionTypes 下会编译错误：
// const badHandler: (a: Animal) => string = handleDog;
console.log("（编译期：handleDog 赋值给 (a: Animal) => string 会报错，因为可能传入非 Dog）");

// ---- 3. 数组协变陷阱 ----
console.log("\\n---- 3. 数组协变陷阱 ----");

// 数组协变：Dog[] 可以赋值给 Animal[]
const dogs: Dog[] = [
  { name: "旺财", breed: "柴犬" },
  { name: "小黑", breed: "拉布拉多" },
];
const animals: Animal[] = dogs; // ✅ 协变合法
console.log("数组协变 dogs -> animals:", JSON.stringify(animals));

// 陷阱：通过 animals 写入非 Dog 的 Animal
animals.push({ name: "小喵" }); // 运行时合法，但 dogs 数组被污染
console.log("push 后的 dogs:", JSON.stringify(dogs));
console.log("dogs[2].breed:", (dogs[2] as Dog).breed, "← undefined！运行时陷阱");

// 更安全：用只读数组 readonly T[]
const safeDogs: readonly Dog[] = [
  { name: "旺财", breed: "柴犬" },
  { name: "小黑", breed: "拉布拉多" },
];
const safeAnimals: readonly Animal[] = safeDogs; // ✅ 只读数组协变
console.log("只读数组协变 safeAnimals:", JSON.stringify(safeAnimals));
// safeAnimals.push(...) // ❌ 编译错误：readonly 没有 push
console.log("（编译期：readonly 数组不能 push，避免写入风险）");

// ---- 4. 方法 vs 函数属性的双变差异 ----
console.log("\\n---- 4. 方法 vs 函数属性 ----");

// 方法语法：参数双变（宽松）
interface ListenerMethod {
  handle(event: Dog): string;
}

// 函数属性语法：参数逆变（严格，strictFunctionTypes 下）
interface ListenerFunction {
  handle: (event: Dog) => string;
}

// 方法语法接受 Cat 参数（双变）
const catHandler: (event: Cat) => string = function (event) {
  return "处理 Cat: " + event.name + " meow=" + event.meow;
};

// 用方法语法包装：合法（双变）
const methodListener: ListenerMethod = {
  handle: catHandler as any, // ⚠️ 双变允许，但实际调用要小心
};
console.log("方法语法（双变）可以接受更窄的参数类型");

// 函数属性语法（strictFunctionTypes 下会报错）
// const functionListener: ListenerFunction = {
//   handle: catHandler, // ❌ 逆变检查失败
// };
console.log("函数属性语法（strict）要求参数逆变，更安全");

// 运行时演示：双变的实际风险
function callMethodListener(listener: ListenerMethod, arg: Dog): string {
  return listener.handle(arg);
}
console.log("callMethodListener(methodListener, dog):", callMethodListener(methodListener, dog));

// ---- 5. 事件处理器实战 ----
console.log("\\n---- 5. 事件处理器实战 ----");

interface BaseEvent { type: string; }
interface ClickEvent extends BaseEvent { type: "click"; x: number; y: number; }
interface InputEvent extends BaseEvent { type: "input"; value: string; }

// 事件分发器
class EventDispatcher {
  private handlers: Record<string, Function[]> = {};

  on(eventType: string, handler: Function): void {
    if (!this.handlers[eventType]) this.handlers[eventType] = [];
    this.handlers[eventType].push(handler);
  }

  emit(event: BaseEvent): void {
    const handlers = this.handlers[event.type] || [];
    handlers.forEach(function (h) { h(event); });
  }
}

const dispatcher = new EventDispatcher();

// 注册 click 处理器（参数是 ClickEvent）
// 逆变的正确用法：接收更宽类型 BaseEvent 的函数更通用
dispatcher.on("click", function (e: BaseEvent) {
  const click = e as ClickEvent;
  console.log("  Click 处理器: x=" + click.x + ", y=" + click.y);
});

// 注册 input 处理器
dispatcher.on("input", function (e: BaseEvent) {
  const input = e as InputEvent;
  console.log("  Input 处理器: value=" + input.value);
});

// 触发事件
console.log("触发 click 事件:");
dispatcher.emit({ type: "click", x: 100, y: 200 });
console.log("触发 input 事件:");
dispatcher.emit({ type: "input", value: "hello" });

// ---- 6. Promise 链的协变 ----
console.log("\\n---- 6. Promise 链协变 ----");

// Promise<Dog> 可以赋值给 Promise<Animal>（协变）
async function fetchDog(): Promise<Dog> {
  return { name: "旺财", breed: "柴犬" };
}

async function fetchAnimal(): Promise<Animal> {
  return fetchDog(); // ✅ Promise 协变
}

fetchAnimal().then(function (animal) {
  console.log("fetchAnimal() 结果:", JSON.stringify(animal));
});

// Promise.then 的回调参数是逆变的
// then 期望 (Dog) => U，传入 (Animal) => U 合法
fetchDog().then(function (animal: Animal) {
  console.log("then 回调（接收 Animal，处理 Dog）:", animal.name);
});

// ---- 7. 不变（Invariant）的概念演示 ----
console.log("\\n---- 7. 不变（Invariant）概念 ----");

// 可变容器在理论上应该是"不变"的——既不协变也不逆变
// 但 TypeScript 为了兼容性，数组是协变的（不安全的妥协）
// 真正的不变容器：用泛型类封装，控制读写

class InvariantContainer<T> {
  private items: T[] = [];
  add(item: T): void { this.items.push(item); }
  get(index: number): T | undefined { return this.items[index]; }
  getAll(): T[] { return [...this.items]; }
}

const dogContainer = new InvariantContainer<Dog>();
dogContainer.add({ name: "旺财", breed: "柴犬" });

// 以下赋值会编译错误（理想的不变容器）：
// const animalContainer: InvariantContainer<Animal> = dogContainer;
// 因为如果允许，就可以通过 animalContainer add 一个非 Dog 的 Animal，污染 dogContainer
console.log("InvariantContainer<Dog>:", JSON.stringify(dogContainer.getAll()));
console.log("（编译期：InvariantContainer<Dog> 不能赋值给 InvariantContainer<Animal>）");

// ---- 8. 综合应用：类型安全的回调注册 ----
console.log("\\n---- 8. 综合应用：类型安全回调 ----");

// 利用协变和逆变设计类型安全的回调系统
type EventHandler<E extends BaseEvent> = (event: E) => void;

class TypedEventDispatcher {
  private handlers: Record<string, Function[]> = {};

  on<E extends BaseEvent>(eventType: E["type"], handler: EventHandler<E>): void {
    if (!this.handlers[eventType]) this.handlers[eventType] = [];
    this.handlers[eventType].push(handler);
  }

  emit<E extends BaseEvent>(event: E): void {
    const handlers = this.handlers[event.type] || [];
    handlers.forEach(function (h) { h(event); });
  }
}

const typedDispatcher = new TypedEventDispatcher();

// 注册类型安全的处理器
typedDispatcher.on<ClickEvent>("click", function (e) {
  // 这里 e 被收窄为 ClickEvent，可以安全访问 x, y
  console.log("  类型安全 Click: x=" + e.x + ", y=" + e.y);
});

typedDispatcher.on<InputEvent>("input", function (e) {
  // 这里 e 被收窄为 InputEvent，可以安全访问 value
  console.log("  类型安全 Input: value=" + e.value);
});

console.log("类型安全事件分发:");
typedDispatcher.emit({ type: "click", x: 50, y: 75 } as ClickEvent);
typedDispatcher.emit({ type: "input", value: "test" } as InputEvent);

console.log("\\n协变、逆变与双变深入章节演示完成！");`,
  },

  // =========================================================
  // 第四章：unknown vs any 系统对比
  // =========================================================
  {
    id: "ts-unknown-any-deep",
    title: "unknown vs any 系统对比",
    icon: "❓",
    group: "进阶类型",
    content: `## unknown vs any 系统对比

\`any\` 和 \`unknown\` 是 TypeScript 中两个"顶部类型"（Top Type）——它们都能接受任何类型的值。但它们代表了截然相反的哲学：\`any\` 是"放弃类型检查的逃生舱"，\`unknown\` 是"安全的 any"——它要求你必须先收窄才能使用。理解 \`any\` 和 \`unknown\` 的差异，是在 TS 项目中平衡"灵活性"和"安全性"的核心技能。本章将极其详细地对比 \`any\` 和 \`unknown\` 的语义、行为、收窄方式、与泛型/JSON.parse/catch 的配合，以及 \`any\` 的 5 种安全替代方案。

### any 的语义：逃生舱

\`any\` 类型的语义是"任何类型都行，我也不管了"。它是**双向兼容**的——\`any\` 可以赋值给任何类型，任何类型也可以赋值给 \`any\`。一旦一个值被标记为 \`any\`，TypeScript 就**完全放弃对它的类型检查**。

\`\`\`ts
let x: any = 10;  // 声明变量 x，类型 any（注意：any 关闭了类型检查）
x = "hello";      // ✅ 任何类型赋值给 any
x = { foo: 1 };   // ✅

let y: number = x; // ✅ any 赋值给任何类型（危险！）
y.toUpperCase();   // ✅ 编译通过，但运行时崩溃（y 是对象）
\`\`\`

\`any\` 关闭了类型检查的"安全网"，让编译器"闭嘴"。它适合迁移期、原型开发、与第三方库交互的临时方案，但**生产代码应该尽量避免 \`any\`**。

### unknown 的语义：安全的 any

\`unknown\` 是 TS 3.0 引入的"安全顶部类型"。它也是任何类型都可以赋值给它，但**它不能直接使用**——必须先"收窄"（narrow）到一个具体类型后才能操作。

\`\`\`ts
let x: unknown = 10;  // 声明变量 x，类型 unknown
x = "hello";      // ✅ 任何类型赋值给 unknown
x = { foo: 1 };   // ✅

let y: number = x; // ❌ 编译错误：unknown 不能赋值给 number
y.toUpperCase();   // ❌ 编译错误：unknown 上不能调用方法

// 必须先收窄
if (typeof x === "number") {  // 类型守卫：判断是否为 number
  console.log(x + 1); // ✅ 这里 x 被收窄为 number
}
\`\`\`

\`unknown\` 强制你**显式处理类型不确定性**——在使用前必须证明它确实是某个类型。这是"类型安全的灵活性"。

### any vs unknown 行为对比表

| 操作 | \`any\` | \`unknown\` |
| --- | --- | --- |
| 任何类型赋值给它 | ✅ | ✅ |
| 它赋值给任何类型 | ✅（危险） | ❌（除非先收窄） |
| 访问属性 | ✅（结果仍是 any） | ❌ |
| 调用方法 | ✅（结果仍是 any） | ❌ |
| 算术运算 | ✅ | ❌ |
| 函数调用 | ✅ | ❌ |
| 作为索引 | ✅ | ❌ |
| \`typeof\` 收窄后使用 | 不需要 | 必须 |

### unknown 的 5 种收窄方式

\`unknown\` 必须收窄后才能使用，TS 提供了 5 种收窄方式：

#### 1. typeof 收窄

\`\`\`ts
function process(v: unknown): string {  // 定义函数 process，参数: v: unknown，返回 string
  if (typeof v === "string") {  // 类型守卫：判断是否为 string
    return v.toUpperCase(); // ✅ v 收窄为 string
  }
  if (typeof v === "number") {  // 类型守卫：判断是否为 number
    return v.toFixed(2); // ✅ v 收窄为 number
  }
  return String(v);  // 返回 String(v)
}
\`\`\`

\`typeof\` 适合原始类型（string/number/boolean/undefined/symbol/bigint）和 function。

#### 2. instanceof 收窄

\`\`\`ts
function handleError(e: unknown): string {  // 定义函数 handleError，参数: e: unknown，返回 string
  if (e instanceof Error) {  // 类型守卫：instanceof 判断实例类型
    return e.message; // ✅ e 收窄为 Error
  }
  return String(e);  // 返回 String(e)
}
\`\`\`

\`instanceof\` 适合类实例的收窄。

#### 3. in 操作符收窄

\`\`\`ts
interface Cat { meow: boolean; }  // 定义接口 Cat
interface Dog { bark: boolean; }  // 定义接口 Dog

function speak(pet: unknown): string {  // 定义函数 speak，参数: pet: unknown，返回 string
  if (typeof pet === "object" && pet !== null && "meow" in pet) {  // 条件判断
    return "喵"; // pet 收窄为 Cat
  }
  if (typeof pet === "object" && pet !== null && "bark" in pet) {  // 条件判断
    return "汪"; // pet 收窄为 Dog
  }
  return "...";  // 返回 "..."
}
\`\`\`

\`in\` 检查属性是否存在，适合区分对象结构。

#### 4. 自定义类型守卫

\`\`\`ts
function isUser(v: unknown): v is { id: number; name: string } {  // 定义函数 isUser，参数: v: unknown，返回 v is
  return typeof v === "object" && v !== null &&  // 返回 typeof v === "object" && v !== null &&
    typeof (v as any).id === "number" &&  // 调用 typeof（注意：any 关闭了类型检查；注意：类型断言会绕过类型检查）
    typeof (v as any).name === "string";  // 调用 typeof（注意：any 关闭了类型检查；注意：类型断言会绕过类型检查）
}

const data: unknown = JSON.parse('{"id":1,"name":"张三"}');  // 声明常量 data，类型 unknown
if (isUser(data)) {  // 条件判断
  console.log(data.name); // ✅ data 收窄为 User
}
\`\`\`

自定义类型守卫是最强大的收窄方式——你可以写任意复杂的验证逻辑，返回 \`v is Type\` 让 TS 收窄。

#### 5. 类型断言

\`\`\`ts
const data: unknown = "hello";  // 声明常量 data，类型 unknown
const str = data as string; // ⚠️ 强制断言，不安全
console.log(str.toUpperCase());  // 控制台输出
\`\`\`

类型断言是"最后手段"——它不做运行时检查，只是告诉编译器"我相信它是这个类型"。如果断言错误，运行时会崩溃。**优先用前 4 种，断言只在确信时用**。

### unknown 与泛型的配合

\`unknown\` 可以作为泛型的约束上限，表达"任何类型都可以，但调用方必须明确"。

\`\`\`ts
function safeParse<T>(text: string, validator: (v: unknown) => v is T): T | null {  // 定义函数 safeParse，泛型 T，参数: text: string, validator: (v: unknown
  const data: unknown = JSON.parse(text);  // 声明常量 data，类型 unknown
  if (validator(data)) {  // 条件判断
    return data;  // 返回 data
  }
  return null;  // 返回 null
}

const user = safeParse('{"id":1}', (v): v is { id: number } =>  // 声明常量 user
  typeof v === "object" && v !== null && typeof (v as any).id === "number"  // 注意：any 关闭了类型检查；注意：类型断言会绕过类型检查
);
\`\`\`

这种模式结合了 \`unknown\` 的安全性和泛型的精确性——运行时验证 + 编译期类型推导。

### JSON.parse 返回 unknown（TS 5+ 默认）

从 TypeScript 5.0 开始（配合 \`useUnknownInCatchVariables\` 等），\`JSON.parse\` 的返回类型在严格模式下是 \`unknown\`（而不是 \`any\`）。这强迫你对解析结果做验证。

\`\`\`ts
const data = JSON.parse('{"id":1}');  // 声明常量 data
// data 的类型是 any（默认）或 unknown（严格）
// 推荐显式标注：const data: unknown = JSON.parse(...)
\`\`\`

实际项目中，推荐显式写 \`const data: unknown = JSON.parse(...)\`，然后用类型守卫收窄。

### useUnknownInCatchVariables 选项

\`useUnknownInCatchVariables\`（包含在 \`strict\` 中）让 \`catch\` 子句的变量类型从 \`any\` 变为 \`unknown\`。

\`\`\`ts
// useUnknownInCatchVariables: true
try {  // 异常捕获
  JSON.parse("invalid");  // 调用 JSON.parse
} catch (e) {
  // e 的类型是 unknown（不是 any）
  // console.log(e.message); // ❌ 编译错误
  if (e instanceof Error) {  // 类型守卫：instanceof 判断实例类型
    console.log(e.message); // ✅ 收窄后使用
  }
}
\`\`\`

这是 \`any\` 最常见的来源之一——\`catch\` 块的 \`e\` 默认是 \`any\`，开启此选项后变成 \`unknown\`，强制安全处理。

### any 的 5 种安全替代方案决策树

当你 tempted 用 \`any\` 时，考虑这些替代：

1. **优先用 \`unknown\`**：如果你只是"不知道类型"，用 \`unknown\` 强制收窄。
2. **用泛型**：如果类型由调用方决定，用泛型 \`<T>\` 保留类型信息。
3. **用函数重载**：如果输入输出有明确对应关系，用重载表达。
4. **用条件类型**：如果类型根据输入变化，用条件类型计算。
5. **用 satisfies**：如果只是想验证约束但保留精度，用 \`satisfies\`。

决策树：

\`\`\`
需要"任何类型"吗？
├── 否 → 用具体类型
└── 是
    ├── 类型由调用方决定？
    │   ├── 是 → 泛型 <T>
    │   └── 否
    │       ├── 需要运行时验证？
    │       │   ├── 是 → unknown + 类型守卫
    │       │   └── 否
    │       │       ├── 输入输出有对应关系？
    │       │       │   ├── 是 → 重载或条件类型
    │       │       │   └── 否 → satisfies 或 unknown
    │       │       └──
    │       └──
    └──
\`\`\`

### 何时 any 是合理的

虽然 \`any\` 危险，但有些场景它是合理的：

1. **迁移期**：从 JS 迁移到 TS 时，逐文件加类型，过渡期用 \`any\` 临时占位。
2. **原型开发**：快速验证想法时，类型可以稍后补。
3. **第三方库类型缺失**：库没有类型声明，临时用 \`any\`。
4. **极端性能场景**：复杂类型推导拖慢编译时，临时用 \`any\` 绕过。
5. **与动态语言交互**：如执行用户输入的脚本，类型本质上不确定。

但即使在这些场景，也应该**用 \`// @ts-expect-error\` 或显式 \`unknown\` 替代 \`any\`**，并尽快补回类型。

### 陷阱与最佳实践

#### 陷阱

1. **\`any\` 会"污染"**：\`any\` 赋值给其他类型后，那个类型也变成了 \`any\`（隐式）。
2. **\`any[]\` 特别危险**：数组元素是 \`any\`，所有操作都失去检查。
3. **\`any\` 绕过可辨识联合**：用 \`any\` 后，可辨识联合的收窄失效。
4. **\`as any\` 滥用**：\`x as any\` 是最常见的 \`any\` 来源，应该用 \`unknown\` + 守卫。

#### 最佳实践

1. **开启 \`strict\`**：包含 \`noImplicitAny\`，禁止隐式 \`any\`。
2. **catch 块用 \`unknown\`**：开启 \`useUnknownInCatchVariables\`。
3. **JSON.parse 结果用 \`unknown\`**：显式标注并验证。
4. **第三方库写 .d.ts**：不要用 \`any\` 占位，写最小声明。
5. **eslint 禁止 \`any\`**：用 \`@typescript-eslint/no-explicit-any\` 规则。

下面通过代码演示 \`any\` 的危险和 \`unknown\` 的安全使用。`,
    code: `// ============================================================
// unknown vs any 系统对比 —— 代码演示
// ============================================================
// unknown 和 any 都是编译期类型，转译后被擦除。我们用变量
// 声明和运行时函数展示它们的行为差异和收窄方式。

console.log("========== unknown vs any 系统对比 ==========");

// ---- 1. any 的危险：运行时崩溃但编译通过 ----
console.log("\\n---- 1. any 的危险 ----");

// any 关闭类型检查，编译通过但运行时可能崩溃
function dangerousAny(): void {
  const data: any = "hello";
  // 以下操作编译都通过，但运行时会崩溃
  console.log("  data:", data);
  console.log("  data.toFixed(2):", data.toFixed); // 字符串没有 toFixed
  // data.toFixed(2) 会运行时崩溃：data.toFixed is not a function
  console.log("  （data.toFixed 是 undefined，调用会崩溃）");

  // 更危险：any 可以赋值给任何类型
  const num: number = data; // ✅ 编译通过，但 num 实际是 string
  console.log("  num（实际是 string）被当作 number:", typeof num);
}
dangerousAny();

// any 的"污染"效应：any 赋值后，目标也失去类型检查
function anyPollution(): void {
  const a: any = 42;
  const b: number = a; // b 是 number，但来源是 any
  const c: string = a; // ✅ 编译通过，但 c 实际是 number
  console.log("  a:", a, "| b:", b, "| c（number 当 string）:", c);
  // c.toUpperCase() 会运行时崩溃
  console.log("  （c.toUpperCase() 会崩溃，因为 c 实际是 number）");
}
anyPollution();

// ---- 2. unknown 必须收窄 ----
console.log("\\n---- 2. unknown 必须收窄 ----");

function safeUnknown(): void {
  const data: unknown = "hello";
  console.log("  data:", data);
  // 以下操作都会编译错误（unknown 不能直接使用）：
  // data.toUpperCase(); // ❌ 编译错误
  // const len: number = data.length; // ❌ 编译错误
  console.log("  （unknown 不能直接调用方法或访问属性）");

  // 必须先收窄
  if (typeof data === "string") {
    console.log("  收窄后 data.toUpperCase():", data.toUpperCase());
    console.log("  收窄后 data.length:", data.length);
  }
}
safeUnknown();

// unknown 不能赋值给其他类型（除非先收窄）
function unknownAssignment(): void {
  const data: unknown = 42;
  // const num: number = data; // ❌ 编译错误：unknown 不能赋值给 number
  const num: number = data as number; // ⚠️ 断言可以，但不安全
  console.log("  断言后的 num:", num);
}
unknownAssignment();

// ---- 3. unknown 的 5 种收窄方式 ----
console.log("\\n---- 3. unknown 的 5 种收窄方式 ----");

// 方式 1：typeof 收窄
function narrowByTypeof(v: unknown): string {
  if (typeof v === "string") {
    return "字符串: " + v.toUpperCase(); // v 收窄为 string
  }
  if (typeof v === "number") {
    return "数字: " + v.toFixed(2); // v 收窄为 number
  }
  if (typeof v === "boolean") {
    return "布尔: " + v; // v 收窄为 boolean
  }
  if (typeof v === "function") {
    return "函数: " + v.name; // v 收窄为 function
  }
  return "其他: " + String(v);
}
console.log("typeof 收窄:");
console.log("  ", narrowByTypeof("hello"));
console.log("  ", narrowByTypeof(3.14159));
console.log("  ", narrowByTypeof(true));
console.log("  ", narrowByTypeof(function test() {}));

// 方式 2：instanceof 收窄
function narrowByInstanceof(v: unknown): string {
  if (v instanceof Error) {
    return "Error: " + v.message; // v 收窄为 Error
  }
  if (v instanceof Date) {
    return "Date: " + v.toISOString(); // v 收窄为 Date
  }
  if (v instanceof Array) {
    return "Array: length=" + v.length; // v 收窄为 Array
  }
  return "其他: " + String(v);
}
console.log("instanceof 收窄:");
console.log("  ", narrowByInstanceof(new Error("测试错误")));
console.log("  ", narrowByInstanceof(new Date()));
console.log("  ", narrowByInstanceof([1, 2, 3]));

// 方式 3：in 操作符收窄
interface Cat { meow: boolean; name: string; }
interface Dog { bark: boolean; name: string; }

function narrowByIn(v: unknown): string {
  if (typeof v === "object" && v !== null) {
    if ("meow" in v) {
      const cat = v as Cat;
      return "Cat: " + cat.name + " meow=" + cat.meow;
    }
    if ("bark" in v) {
      const dog = v as Dog;
      return "Dog: " + dog.name + " bark=" + dog.bark;
    }
  }
  return "未知动物";
}
console.log("in 操作符收窄:");
console.log("  ", narrowByIn({ meow: true, name: "小喵" }));
console.log("  ", narrowByIn({ bark: true, name: "旺财" }));
console.log("  ", narrowByIn("不是动物"));

// 方式 4：自定义类型守卫
interface User { id: number; name: string; email: string; }

function isUser(v: unknown): v is User {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj.id === "number" &&
    typeof obj.name === "string" &&
    typeof obj.email === "string"
  );
}

function narrowByGuard(v: unknown): string {
  if (isUser(v)) {
    return "User: " + v.name + " <" + v.email + ">"; // v 收窄为 User
  }
  return "非 User 类型";
}
console.log("自定义类型守卫收窄:");
console.log("  ", narrowByGuard({ id: 1, name: "张三", email: "zhangsan@example.com" }));
console.log("  ", narrowByGuard({ id: "1", name: "李四" }));
console.log("  ", narrowByGuard("字符串"));

// 方式 5：类型断言（最后手段）
function narrowByAssertion(v: unknown): string {
  // ⚠️ 断言不做运行时检查，不安全
  const str = v as string;
  try {
    return "断言为 string: " + str.toUpperCase();
  } catch (e) {
    return "断言失败: " + String(e);
  }
}
console.log("类型断言收窄:");
console.log("  ", narrowByAssertion("hello"));
console.log("  ", narrowByAssertion(42), "（断言错误，但 try/catch 兜底）");

// ---- 4. catch 块的 unknown 处理 ----
console.log("\\n---- 4. catch 块的 unknown 处理 ----");

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (e) {
    // useUnknownInCatchVariables: true 时，e 是 unknown
    // 必须收窄后使用
    if (e instanceof Error) {
      console.log("  解析错误:", e.message);
    } else {
      console.log("  未知错误:", String(e));
    }
    return null;
  }
}

console.log("catch 块处理:");
const parsed1 = safeJsonParse('{"id":1,"name":"张三"}');
console.log("  解析成功:", JSON.stringify(parsed1));
const parsed2 = safeJsonParse('invalid json');
console.log("  解析失败:", parsed2);

// 模拟抛出非 Error 对象
function safeJsonParse2(text: string): unknown {
  try {
    // 模拟抛出字符串
    if (text === "throw-string") throw "字符串错误";
    return JSON.parse(text);
  } catch (e) {
    // e 是 unknown，需要处理各种情况
    if (e instanceof Error) {
      return "Error: " + e.message;
    }
    if (typeof e === "string") {
      return "String: " + e;
    }
    return "Unknown: " + String(e);
  }
}
console.log("  抛出字符串:", safeJsonParse2("throw-string"));

// ---- 5. JSON.parse 安全处理 ----
console.log("\\n---- 5. JSON.parse 安全处理 ----");

// 不安全：直接用 any
function unsafeParse(text: string): any {
  return JSON.parse(text);
}
const unsafe = unsafeParse('{"id":1,"name":"张三"}');
console.log("不安全解析（any）:", unsafe.id, unsafe.name);
// unsafe.nonExistent 也不会报错（any 的危险）

// 安全：用 unknown + 类型守卫
function safeParse(text: string): User | null {
  const data: unknown = JSON.parse(text);
  if (isUser(data)) {
    return data; // 收窄为 User
  }
  return null;
}

const safeResult = safeParse('{"id":1,"name":"张三","email":"zhangsan@example.com"}');
if (safeResult) {
  console.log("安全解析（unknown）:", safeResult.id, safeResult.name, safeResult.email);
} else {
  console.log("安全解析：格式不符");
}

const safeResult2 = safeParse('{"id":"1","name":"李四"}');
console.log("安全解析（格式不符）:", safeResult2);

// 通用的安全解析函数（结合泛型 + 类型守卫）
function safeParseGeneric<T>(
  text: string,
  validator: (v: unknown) => v is T
): T | null {
  const data: unknown = JSON.parse(text);
  return validator(data) ? data : null;
}

// 定义各种类型守卫
const isString = (v: unknown): v is string => typeof v === "string";
const isNumber = (v: unknown): v is number => typeof v === "number";
const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(function (x) { return typeof x === "string"; });

console.log("泛型安全解析:");
console.log("  isString:", safeParseGeneric('"hello"', isString));
console.log("  isNumber:", safeParseGeneric('42', isNumber));
console.log("  isStringArray:", safeParseGeneric('["a","b","c"]', isStringArray));
console.log("  isString (失败):", safeParseGeneric('42', isString));

// ---- 6. any 的污染效应演示 ----
console.log("\\n---- 6. any 的污染效应 ----");

function pollutionDemo(): void {
  const anyData: any = { foo: 1 };
  const num1: number = anyData.foo; // ✅ any 赋值给 number
  const str1: string = anyData.foo; // ✅ 同样的值赋给 string（矛盾！）
  console.log("  anyData.foo 赋值给 number:", num1);
  console.log("  anyData.foo 赋值给 string:", str1);
  console.log("  （同一值被当作不同类型，类型系统失效）");

  // any 数组更危险
  const anyArray: any[] = [1, "hello", true, null];
  anyArray.forEach(function (item) {
    // item 是 any，所有操作都通过编译
    // console.log(item.toFixed(2)); // 对 string 调用会崩溃
    console.log("  数组项:", item, "typeof:", typeof item);
  });
}
pollutionDemo();

// ---- 7. 替代方案：泛型优于 any ----
console.log("\\n---- 7. 泛型优于 any ----");

// 不好：用 any 失去类型信息
function firstAny(arr: any[]): any {
  return arr[0];
}
const r1 = firstAny([1, 2, 3]); // r1 是 any
console.log("firstAny([1,2,3]):", r1, "（类型是 any）");

// 好：用泛型保留类型信息
function first<T>(arr: T[]): T {
  return arr[0];
}
const r2 = first([1, 2, 3]); // r2 是 number
const r3 = first(["a", "b"]); // r3 是 string
console.log("first([1,2,3]):", r2, "（类型是 number）");
console.log("first(['a','b']):", r3, "（类型是 string）");

// ---- 8. 综合应用：类型安全的 API 客户端 ----
console.log("\\n---- 8. 综合应用：类型安全 API 客户端 ----");

// 模拟 API 响应类型
interface ApiSuccess<T> { status: "success"; data: T; }
interface ApiError { status: "error"; error: string; }
type ApiResponse<T> = ApiSuccess<T> | ApiError;

// 类型守卫：验证响应结构
function isApiSuccess<T>(v: unknown, dataGuard: (v: unknown) => v is T): v is ApiSuccess<T> {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return obj.status === "success" && dataGuard(obj.data);
}

function isApiError(v: unknown): v is ApiError {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return obj.status === "error" && typeof obj.error === "string";
}

// 模拟 API 调用
function mockApiCall(response: unknown): unknown {
  return response; // 模拟网络返回的 unknown 数据
}

// User 类型守卫（复用）
const isUserGuard = (v: unknown): v is User => isUser(v);

// 处理 API 响应
function handleUserApi(rawResponse: unknown): string {
  // 先验证是成功响应
  if (isApiSuccess(rawResponse, isUserGuard)) {
    // rawResponse 收窄为 ApiSuccess<User>
    return "成功: " + rawResponse.data.name + " <" + rawResponse.data.email + ">";
  }
  if (isApiError(rawResponse)) {
    return "失败: " + rawResponse.error;
  }
  return "未知响应格式";
}

console.log("API 响应处理:");
console.log("  ", handleUserApi({ status: "success", data: { id: 1, name: "张三", email: "z@x.com" } }));
console.log("  ", handleUserApi({ status: "error", error: "用户不存在" }));
console.log("  ", handleUserApi({ status: "success", data: { id: "1", name: "李四" } }), "（data 不符合 User）");
console.log("  ", handleUserApi("invalid"));

console.log("\\nunknown vs any 系统对比章节演示完成！");`,
  },

  // =========================================================
  // 第五章：类型断言与类型守卫对比
  // =========================================================
  {
    id: "ts-assertion-vs-guard",
    title: "类型断言与类型守卫对比",
    icon: "🛡️",
    group: "进阶类型",
    content: `## 类型断言与类型守卫对比

类型断言（\`as\`）和类型守卫（Type Guard）是 TypeScript 中处理类型不确定性的两种根本不同的机制。**类型断言是"我说什么就是什么"**——它不做运行时检查，只是覆盖编译器的推导；**类型守卫是"我用运行时检查证明它是什么"**——它真正验证类型并让编译器收窄。理解两者的差异，是写出类型安全代码的关键——滥用断言会导致运行时崩溃，正确使用守卫能在编译期和运行时都保证安全。本章将极其详细地对比类型断言和类型守卫的语义、用法、危险、适用场景，以及 \`!\` 非空断言的滥用与替代。

### 类型断言 \`as\` 的语义

\`as\` 是类型断言操作符，语义是"我（开发者）知道这个值的类型，编译器你别管了"。它**不做运行时检查**，只是告诉编译器"把这个值当作某个类型"。

\`\`\`ts
const x: unknown = "hello";  // 声明常量 x，类型 unknown
const str = x as string; // 断言 x 是 string
console.log(str.toUpperCase()); // 编译通过
\`\`\`

\`as\` 的本质是"覆盖编译器的类型推导"——编译器原本认为 \`x\` 是 \`unknown\`，开发者用 \`as\` 告诉它"是 \`string\`"，编译器就信了。如果 \`x\` 实际不是 \`string\`（比如是 \`number\`），运行时调用 \`toUpperCase()\` 会崩溃，但编译期不会报错。

### \`<>\` 旧语法

TypeScript 还支持 \`<Type>value\` 的断言语法（C# 风格）：

\`\`\`ts
const x: unknown = "hello";  // 声明常量 x，类型 unknown
const str = <string>x; // 旧语法
\`\`\`

这种语法在 .tsx 文件中会与 JSX 冲突，所以现代代码统一用 \`as\`。\`<>\` 语法已经不推荐。

### 双重断言 \`as unknown as\` 及其危险

当 \`as\` 的源类型和目标类型"不够重叠"时，TS 会报错：

\`\`\`ts
const x: string = "hello";  // 声明常量 x，类型 string
const num = x as number; // ❌ 编译错误：string 和 number 不够重叠
\`\`\`

这时开发者常用"双重断言"绕过：

\`\`\`ts
const x: string = "hello";  // 声明常量 x，类型 string
const num = x as unknown as number; // ✅ 双重断言，绕过检查
\`\`\`

\`as unknown as\` 先转成 \`unknown\`（任何类型都能转 \`unknown\`），再转成目标类型。这是**最危险的写法**——它绕过了所有检查，运行时 \`num\` 实际仍是字符串，对它做数字运算会崩溃。

**双重断言几乎总是错的**——如果你需要用它，说明你的类型设计有问题，应该重新考虑。

### 类型断言的危险

\`\`\`ts
// 危险示例 1：断言错误的类型
const data: unknown = JSON.parse('{"name":"张三"}');  // 声明常量 data，类型 unknown
const user = data as { id: number; name: string }; // 断言有 id
console.log(user.id); // undefined（实际没有 id 属性）
console.log(user.id.toFixed(2)); // 运行时崩溃：Cannot read property 'toFixed' of undefined

// 危险示例 2：双重断言
const str = "hello" as unknown as number;  // 声明常量 str（注意：类型断言会绕过类型检查）
str.toFixed(2); // 运行时崩溃：str.toFixed is not a function

// 危险示例 3：断言绕过可辨识联合
type Result = { ok: true; data: string } | { ok: false; error: string };  // 定义类型别名 Result，联合类型
const r: Result = { ok: false, error: "失败" };  // 声明常量 r，类型 Result
const success = r as { ok: true; data: string };  // 声明常量 success（注意：类型断言会绕过类型检查）
console.log(success.data); // undefined（实际是 error 分支）
\`\`\`

断言的核心问题：**它让编译器"相信"一个可能错误的类型，从而在后续代码中产生虚假的类型安全**。

### 类型守卫的语义

类型守卫是"运行时检查 + 编译期收窄"的组合——你用 \`typeof\` / \`instanceof\` / \`in\` / 自定义谓词做运行时验证，TypeScript 根据验证结果收窄类型。

\`\`\`ts
const data: unknown = "hello";  // 声明常量 data，类型 unknown
if (typeof data === "string") {  // 类型守卫：判断是否为 string
  // 在这个块里，data 被收窄为 string
  console.log(data.toUpperCase()); // ✅ 类型安全
}
\`\`\`

类型守卫的关键：**它做了真正的运行时检查**。如果 \`data\` 不是 \`string\`，根本不会进入 \`if\` 块，所以 \`toUpperCase()\` 一定是安全的。

### 四种类型守卫

#### 1. typeof

\`\`\`ts
function pad(v: string | number): string {  // 定义函数 pad，参数: v: string | number，返回 string
  if (typeof v === "string") {  // 类型守卫：判断是否为 string
    return v.padStart(10, "0"); // v 收窄为 string
  }
  return String(v).padStart(10, "0"); // v 收窄为 number
}
\`\`\`

\`typeof\` 适合原始类型检查。

#### 2. instanceof

\`\`\`ts
function logError(e: Error | string): string {  // 定义函数 logError，参数: e: Error | string，返回 string
  if (e instanceof Error) {  // 类型守卫：instanceof 判断实例类型
    return e.message; // e 收窄为 Error
  }
  return e; // e 收窄为 string
}
\`\`\`

\`instanceof\` 适合类实例检查。

#### 3. in 操作符

\`\`\`ts
interface Cat { meow: () => void; }  // 定义接口 Cat
interface Dog { bark: () => void; }  // 定义接口 Dog

function speak(pet: Cat | Dog): string {  // 定义函数 speak，参数: pet: Cat | Dog，返回 string
  if ("meow" in pet) {  // 条件判断
    return "喵"; // pet 收窄为 Cat
  }
  return "汪"; // pet 收窄为 Dog
}
\`\`\`

\`in\` 检查属性是否存在，适合区分对象结构。

#### 4. 自定义类型谓词（x is Type）

\`\`\`ts
function isString(v: unknown): v is string {  // 自定义类型守卫（返回 x is T）
  return typeof v === "string";  // 类型守卫：判断是否为 string
}

const data: unknown = "hello";  // 声明常量 data，类型 unknown
if (isString(data)) {  // 条件判断
  console.log(data.toUpperCase()); // data 收窄为 string
}
\`\`\`

自定义类型谓词是最强大的——你可以写任意复杂的验证逻辑，用 \`v is Type\` 返回类型告诉 TS 收窄。

### 对比表：断言 vs 守卫

| 维度 | 类型断言 (\`as\`) | 类型守卫 (typeof/instanceof/in/谓词) |
| --- | --- | --- |
| 检查时机 | 编译期（不真正检查） | 运行时（真正检查） |
| 安全性 | 低（可能崩溃） | 高（运行时保证） |
| 适用场景 | 确切知道类型 | 不可信数据 |
| 代码量 | 少 | 多（需要 if 分支） |
| 运行时开销 | 无 | 有（运行时检查） |
| 收窄范围 | 整个后续代码 | 仅在 if 块内 |
| 失败行为 | 运行时崩溃 | 走 else 分支 |

### 何时该用断言

断言并非总是错的，有些场景它是合理的：

#### 1. 与第三方库交互

\`\`\`ts
// 第三方库返回 any，但你确切知道实际类型
import { someLib } from "some-lib";  // 导入 { someLib }
const result = someLib.doSomething() as { id: number; name: string };  // 声明常量 result（注意：类型断言会绕过类型检查）
\`\`\`

如果库的类型声明不准确（返回 \`any\`），且你确信实际类型，断言是合理的。

#### 2. 确切知道更精确类型

\`\`\`ts
const el = document.getElementById("app") as HTMLDivElement;  // 声明常量 el（注意：类型断言会绕过类型检查）
// getElementById 返回 HTMLElement | null
// 你确信 #app 是 div，可以断言
\`\`\`

#### 3. DOM 操作

\`\`\`ts
const input = document.querySelector("input") as HTMLInputElement;  // 声明常量 input（注意：类型断言会绕过类型检查）
console.log(input.value); // HTMLInputElement 有 value 属性
\`\`\`

DOM API 通常返回 \`Element\` 或 \`HTMLElement\`，但你常知道具体是 \`HTMLInputElement\`、\`HTMLCanvasElement\` 等，断言是常规做法。

#### 4. 类型推导不够精确时

\`\`\`ts
// TS 推导出联合类型，但你确信是某个具体分支
const response = JSON.parse('{"status":"success"}') as { status: "success" };  // 声明常量 response（注意：类型断言会绕过类型检查）
\`\`\`

### 何时必须用守卫

#### 1. 不可信数据（API 响应、用户输入）

\`\`\`ts
// API 响应是不可信的，必须用守卫验证
fetch("/api/user")  // 调用 fetch
  .then(r => r.json())  // 箭头函数
  .then((data: unknown) => {  // 箭头函数
    if (isUser(data)) {  // 条件判断
      // data 收窄为 User，安全使用
      console.log(data.name);  // 控制台输出
    }
  });
\`\`\`

API 响应可能不符合预期（字段缺失、类型错误），断言会导致崩溃，必须用守卫。

#### 2. 用户输入

\`\`\`ts
const input = prompt("输入数字") as number; // ❌ 危险
// 应该：
const text = prompt("输入数字") ?? "";  // 声明常量 text
const num = Number(text);  // 声明常量 num
if (!isNaN(num)) {  // 条件判断
  console.log(num); // 安全
}
\`\`\`

#### 3. JSON.parse 结果

\`\`\`ts
const data: unknown = JSON.parse(text);  // 声明常量 data，类型 unknown
if (isUser(data)) {  // 条件判断
  // 安全
}
\`\`\`

### \`!\` 非空断言的滥用

\`!\` 是非空断言操作符，告诉编译器"这个值不是 null/undefined"。

\`\`\`ts
const el = document.getElementById("app")!;  // 声明常量 el（注意：非空断言，运行时可能为空）
// el 的类型从 HTMLElement | null 变成 HTMLElement
\`\`\`

\`!\` 是断言的一种特殊形式，同样危险——如果元素实际不存在，后续操作会崩溃。

#### 滥用示例

\`\`\`ts
// 滥用：每个可能为空的值都加 !
const user = getUser()!;  // 声明常量 user（注意：非空断言，运行时可能为空）
const name = user.profile!.name!;  // 声明常量 name（注意：非空断言，运行时可能为空）
const email = user.profile!.email!.toLowerCase();  // 声明常量 email（注意：非空断言，运行时可能为空）
\`\`\`

这种代码在运行时很容易崩溃——任何一环是 null/undefined 都会出错。

#### 替代方案

1. **显式检查**：

\`\`\`ts
const user = getUser();  // 声明常量 user
if (user) {  // 条件判断
  console.log(user.name);  // 控制台输出
} else {
  console.log("用户不存在");  // 控制台输出
}
\`\`\`

2. **可选链 \`?.\`**：

\`\`\`ts
const name = user?.profile?.name ?? "默认名";  // 声明常量 name
\`\`\`

3. **空值合并 \`??\`**：

\`\`\`ts
const value = maybeNull ?? "默认值";  // 声明常量 value
\`\`\`

4. **提前返回**：

\`\`\`ts
function processUser(user?: User): void {  // 定义函数 processUser，参数: user?: User，返回 void
  if (!user) return; // 提前返回，后续 user 一定是 User
  console.log(user.name);  // 控制台输出
}
\`\`\`

### 最佳实践

1. **不可信数据用守卫，可信数据可用断言**：API 响应、用户输入、JSON.parse 必须用守卫。
2. **避免双重断言 \`as unknown as\`**：几乎总是错的，说明类型设计有问题。
3. **少用 \`!\`，多用 \`?.\` 和显式检查**：\`!\` 是逃生舱，\`?.\` 更安全。
4. **DOM 操作的断言是常规做法**：但最好封装成函数，集中管理。
5. **自定义类型守卫是处理复杂验证的利器**：写一次，到处用。
6. **eslint 规则**：用 \`@typescript-eslint/consistent-type-assertions\` 限制断言，用 \`@typescript-eslint/no-non-null-assertion\` 禁止 \`!\`。

下面通过代码演示断言的危险和守卫的安全。`,
    code: `// ============================================================
// 类型断言与类型守卫对比 —— 代码演示
// ============================================================
// 断言和守卫都是编译期概念，转译后守卫的运行时检查保留，
// 断言被擦除。我们用运行时函数展示两者的行为差异。

console.log("========== 类型断言与类型守卫对比 ==========");

// ---- 1. 类型断言的危险 ----
console.log("\\n---- 1. 类型断言的危险 ----");

// 断言错误类型，运行时崩溃
function dangerousAssertion(): void {
  const data: unknown = 42; // 实际是 number
  const str = data as string; // ⚠️ 断言为 string，编译通过
  console.log("  断言后的值:", str, "typeof:", typeof str);
  // str.toUpperCase() 会运行时崩溃
  try {
    str.toUpperCase();
  } catch (e) {
    console.log("  ❌ 运行时崩溃:", e instanceof Error ? e.message : String(e));
  }
}
dangerousAssertion();

// 双重断言更危险
function doubleAssertion(): void {
  const x: string = "hello";
  // const num = x as number; // ❌ 编译错误：不够重叠
  const num = x as unknown as number; // ✅ 双重断言绕过
  console.log("  双重断言后的值:", num, "typeof:", typeof num, "（实际仍是 string）");
  // num.toFixed(2) 会运行时崩溃
  try {
    num.toFixed(2);
  } catch (e) {
    console.log("  ❌ 运行时崩溃:", e instanceof Error ? e.message : String(e));
  }
}
doubleAssertion();

// 断言绕过可辨识联合
function bypassDiscriminatedUnion(): void {
  type Result = { ok: true; data: string } | { ok: false; error: string };
  const r: Result = { ok: false, error: "失败" };

  // 危险：断言成 success 分支
  const success = r as { ok: true; data: string };
  console.log("  断言 success.data:", success.data, "← undefined（实际是 error 分支）");
  // success.data.toUpperCase() 会崩溃
  try {
    success.data.toUpperCase();
  } catch (e) {
    console.log("  ❌ 运行时崩溃:", e instanceof Error ? e.message : String(e));
  }
}
bypassDiscriminatedUnion();

// ---- 2. 类型守卫的安全 ----
console.log("\\n---- 2. 类型守卫的安全 ----");

// typeof 守卫
function safeTypeof(v: string | number): string {
  if (typeof v === "string") {
    // v 收窄为 string，安全调用字符串方法
    return "字符串: " + v.toUpperCase();
  }
  // v 收窄为 number，安全调用数字方法
  return "数字: " + v.toFixed(2);
}
console.log("typeof 守卫:");
console.log("  ", safeTypeof("hello"));
console.log("  ", safeTypeof(3.14159));

// instanceof 守卫
function safeInstanceof(e: Error | string): string {
  if (e instanceof Error) {
    // e 收窄为 Error，安全访问 message
    return "Error: " + e.message;
  }
  // e 收窄为 string
  return "String: " + e;
}
console.log("instanceof 守卫:");
console.log("  ", safeInstanceof(new Error("测试错误")));
console.log("  ", safeInstanceof("字符串错误"));

// in 操作符守卫
interface Cat { meow(): string; }
interface Dog { bark(): string; }

function safeIn(pet: Cat | Dog): string {
  if ("meow" in pet) {
    // pet 收窄为 Cat
    return "猫: " + pet.meow();
  }
  // pet 收窄为 Dog
  return "狗: " + pet.bark();
}
console.log("in 操作符守卫:");
console.log("  ", safeIn({ meow: function () { return "喵"; } }));
console.log("  ", safeIn({ bark: function () { return "汪"; } }));

// 处理 unknown：守卫 vs 断言对比
function processUnknown(v: unknown): string {
  // 守卫方式：安全
  if (typeof v === "string") {
    return "字符串: " + v.toUpperCase(); // ✅ 安全
  }
  if (typeof v === "number") {
    return "数字: " + v.toFixed(2); // ✅ 安全
  }
  return "其他类型: " + String(v);
}
console.log("unknown 处理（守卫）:");
console.log("  ", processUnknown("hello"));
console.log("  ", processUnknown(42));
console.log("  ", processUnknown(true));

// ---- 3. 自定义类型谓词 ----
console.log("\\n---- 3. 自定义类型谓词 ----");

// 定义类型
interface User { id: number; name: string; email: string; }
interface Product { id: string; title: string; price: number; }

// 自定义类型守卫
function isUser(v: unknown): v is User {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj.id === "number" &&
    typeof obj.name === "string" &&
    typeof obj.email === "string"
  );
}

function isProduct(v: unknown): v is Product {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.price === "number"
  );
}

// 使用类型守卫处理 unknown 数据
function processData(data: unknown): string {
  if (isUser(data)) {
    // data 收窄为 User，安全访问属性
    return "用户: " + data.name + " <" + data.email + ">";
  }
  if (isProduct(data)) {
    // data 收窄为 Product，安全访问属性
    return "商品: " + data.title + " ¥" + data.price;
  }
  return "未知数据类型";
}

console.log("自定义类型谓词:");
console.log("  ", processData({ id: 1, name: "张三", email: "z@x.com" }));
console.log("  ", processData({ id: "p1", title: "手机", price: 9999 }));
console.log("  ", processData({ id: 1, name: "李四" }), "（缺 email，不是 User）");
console.log("  ", processData("字符串"));

// 复杂的类型守卫：嵌套对象验证
interface Order {
  orderId: string;
  user: User;
  items: Product[];
  total: number;
}

function isOrder(v: unknown): v is Order {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj.orderId === "string" &&
    isUser(obj.user) &&
    Array.isArray(obj.items) && obj.items.every(isProduct) &&
    typeof obj.total === "number"
  );
}

const orderData: unknown = {
  orderId: "ORD-001",
  user: { id: 1, name: "张三", email: "z@x.com" },
  items: [
    { id: "p1", title: "手机", price: 9999 },
    { id: "p2", title: "耳机", price: 299 },
  ],
  total: 10298,
};

if (isOrder(orderData)) {
  // orderData 收窄为 Order，安全访问嵌套属性
  console.log("订单验证通过:");
  console.log("  订单号:", orderData.orderId);
  console.log("  用户:", orderData.user.name);
  console.log("  商品数:", orderData.items.length);
  console.log("  总价:", orderData.total);
}

// ---- 4. 非空断言 ! 的滥用 ----
console.log("\\n---- 4. 非空断言 ! 的滥用 ----");

// 模拟可能返回 null 的函数
function findUser(id: number): User | null {
  const users: User[] = [
    { id: 1, name: "张三", email: "z@x.com" },
    { id: 2, name: "李四", email: "l@x.com" },
  ];
  return users.find(function (u) { return u.id === id; }) || null;
}

// 滥用 !：每个可能为空的都加 !
function abuseNonNull(): void {
  const user = findUser(999)!; // ❌ 滥用 !，实际是 null
  console.log("  滥用 ! 查找不存在的用户:");
  try {
    console.log("  用户名:", user.name); // 运行时崩溃
  } catch (e) {
    console.log("  ❌ 运行时崩溃:", e instanceof Error ? e.message : String(e));
  }
}
abuseNonNull();

// 正确做法 1：显式检查
function safeCheck(): void {
  const user = findUser(1);
  if (user) {
    console.log("  显式检查:", user.name); // ✅ 安全
  } else {
    console.log("  显式检查: 用户不存在");
  }
}
safeCheck();

// 正确做法 2：可选链 ?.
function safeOptionalChaining(): void {
  const user = findUser(999);
  console.log("  可选链:", user?.name ?? "用户不存在"); // ✅ 安全
}
safeOptionalChaining();

// 正确做法 3：提前返回
function safeEarlyReturn(id: number): string {
  const user = findUser(id);
  if (!user) return "用户不存在"; // 提前返回
  return "用户: " + user.name; // 后续 user 一定是 User
}
console.log("  提前返回:", safeEarlyReturn(1));
console.log("  提前返回:", safeEarlyReturn(999));

// 正确做法 4：空值合并 ??
function safeNullish(id: number): string {
  const user = findUser(id);
  return user?.name ?? "匿名用户";
}
console.log("  空值合并:", safeNullish(1));
console.log("  空值合并:", safeNullish(999));

// ---- 5. DOM 操作中的断言（合理使用） ----
console.log("\\n---- 5. DOM 操作中的断言 ----");

// 模拟 DOM 环境（沙箱无 DOM，用对象模拟）
interface MockElement {
  tagName: string;
  value?: string;
  textContent?: string;
  getElementById(id: string): MockElement | null;
  querySelector(sel: string): MockElement | null;
}

const mockDoc: MockElement = {
  tagName: "document",
  getElementById: function (id) {
    if (id === "username") {
      return { tagName: "input", value: "张三" };
    }
    return null;
  },
  querySelector: function (sel) {
    if (sel === "input") {
      return { tagName: "input", value: "hello" };
    }
    return null;
  },
};

// 断言的合理使用：你知道元素的具体类型
function domWithAssertion(): void {
  const el = mockDoc.getElementById("username");
  if (el) {
    // 断言为 input 元素（你知道 #username 是 input）
    const input = el as MockElement & { value: string };
    console.log("  断言方式 - input.value:", input.value);
  }
}
domWithAssertion();

// 更安全：用守卫检查
function domWithGuard(): void {
  const el = mockDoc.getElementById("username");
  if (el && "value" in el) {
    console.log("  守卫方式 - el.value:", el.value);
  }
}
domWithGuard();

// 通用 DOM 查询封装（集中管理断言）
function getInputValue(id: string): string | null {
  const el = mockDoc.getElementById(id);
  if (el && typeof el.value === "string") {
    return el.value;
  }
  return null;
}
console.log("  getInputValue('username'):", getInputValue("username"));
console.log("  getInputValue('nonexistent'):", getInputValue("nonexistent"));

// ---- 6. 断言 vs 守卫的综合对比 ----
console.log("\\n---- 6. 综合对比 ----");

// 场景：处理 API 响应
interface ApiResponse { id: number; name: string; }

// 方式 A：断言（危险）
function handleWithAssertion(raw: unknown): string {
  const data = raw as ApiResponse; // ⚠️ 断言，不做检查
  // 如果 raw 不是预期结构，这里会出问题
  try {
    return "断言: " + data.id + " - " + data.name;
  } catch (e) {
    return "断言失败: " + (e instanceof Error ? e.message : String(e));
  }
}

// 方式 B：守卫（安全）
function handleWithGuard(raw: unknown): string {
  if (
    typeof raw === "object" && raw !== null &&
    typeof (raw as Record<string, unknown>).id === "number" &&
    typeof (raw as Record<string, unknown>).name === "string"
  ) {
    const data = raw as ApiResponse; // 此时断言是安全的（已验证）
    return "守卫: " + data.id + " - " + data.name;
  }
  return "守卫: 数据格式不符";
}

console.log("正常数据:");
console.log("  ", handleWithAssertion({ id: 1, name: "张三" }));
console.log("  ", handleWithGuard({ id: 1, name: "张三" }));

console.log("异常数据（缺字段）:");
console.log("  ", handleWithAssertion({ id: 1 }), "（name 是 undefined）");
console.log("  ", handleWithGuard({ id: 1 }));

console.log("异常数据（类型错误）:");
const badData: unknown = { id: "1", name: 123 };
console.log("  ", handleWithAssertion(badData), "（id 是 string，name 是 number）");
console.log("  ", handleWithGuard(badData));

console.log("完全错误的数据:");
console.log("  ", handleWithAssertion("字符串"));
console.log("  ", handleWithGuard("字符串"));

// ---- 7. 实战：类型安全的 JSON 解析器 ----
console.log("\\n---- 7. 类型安全的 JSON 解析器 ----");

// 组合守卫构建复杂验证
function parseUser(json: string): User | { error: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch (e) {
    return { error: "JSON 解析失败: " + (e instanceof Error ? e.message : String(e)) };
  }

  if (!isUser(raw)) {
    return { error: "数据不符合 User 结构" };
  }
  return raw;
}

console.log("类型安全 JSON 解析:");
console.log("  ", parseUser('{"id":1,"name":"张三","email":"z@x.com"}'));
console.log("  ", parseUser('{"id":"1","name":"李四"}'));
console.log("  ", parseUser('invalid json'));

// ---- 8. 断言的合理场景总结 ----
console.log("\\n---- 8. 断言的合理场景 ----");

// 场景 1：第三方库返回 any，你确信实际类型
declare const thirdParty: { getData(): any };
// 模拟第三方库
const thirdPartyMock = {
  getData: function (): any { return { id: 1, name: "测试" }; }
};
const data = thirdPartyMock.getData() as { id: number; name: string };
console.log("  第三方库断言:", JSON.stringify(data));

// 场景 2：类型推导不够精确
const tuple = [1, "hello", true] as [number, string, boolean];
console.log("  元组断言:", JSON.stringify(tuple));

// 场景 3：联合类型的特定分支
type Status = "pending" | "success" | "error";
const currentStatus: Status = "success";
const successStatus = currentStatus as "success";
console.log("  联合类型断言:", successStatus);

console.log("\\n类型断言与类型守卫对比章节演示完成！");`,
  },
];
