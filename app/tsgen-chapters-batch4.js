// =============================================================
// TypeScript 泛型专门教程 —— 第四批章节（共 5 章）
// -------------------------------------------------------------
// 本文件包含以下章节（实战与类型体操篇）：
//   1. tsgen-patterns       — 泛型常用设计模式
//   2. tsgen-hoc            — 高阶函数与高阶类型模拟
//   3. tsgen-state-machine  — 用泛型实现类型安全的状态机
//   4. tsgen-gymnastics     — 类型体操经典题解析
//   5. tsgen-real-world     — 综合实战：类型安全的 API 客户端
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（全部为"实战与类型体操"）
//   content : Markdown 格式的详细讲解（800+ 中文字符）
//   code    : 可运行、带详细中文注释的 TypeScript 示例代码（30+ 行）
//
// 代码运行环境约束：
//   - TypeScript 先被转译为 JS (target ES2020, module CommonJS)
//   - 在 Node.js vm 沙箱中运行，5 秒超时
//   - 仅可 require Node.js 内置模块
//   - 类型注解在编译后擦除，通过运行时值验证类型行为
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：泛型常用设计模式
  // =========================================================
  {
    id: "tsgen-patterns",
    icon: "📐",
    group: "实战与类型体操",
    title: "泛型常用设计模式",
    content: `## 泛型常用设计模式

### 为什么设计模式需要泛型？

设计模式是前人总结的代码组织经验，泛型是 TypeScript 的类型参数化能力。两者结合，就能写出既灵活又类型安全的代码。没有泛型的设计模式往往依赖 any 或类型断言，类型系统形同虚设；加入泛型后，同一个模式可以安全地作用于任意类型，编译器帮你检查出所有不匹配的错误。本章介绍六种最常用、最适合用泛型表达的设计模式。

### 工厂模式

工厂模式的核心是"用函数创建对象，而不是直接 new"。用泛型实现后，工厂函数根据传入的构造器类型自动推断创建实例的类型：

\`\`\`ts
function create<T>(cls: new () => T): T {
  return new cls();
}
\`\`\`

传入一个类，返回该类的实例，类型完全由编译器推断，不需要任何断言。这在依赖注入、测试桩创建等场景非常实用。

### 建造者模式

建造者模式通过链式调用逐步构建复杂对象。关键技巧是让每个方法返回 this，并用泛型约束让链式调用的每一步都保持精确的类型信息。当最终调用 build 方法时，返回值就是构建好的目标类型。这种模式在配置对象、SQL 构建器、查询条件拼装等场景非常常见。

### 策略模式

策略模式把一组可互换的算法抽象成统一的接口，运行时再决定用哪一个。用泛型定义策略接口后，不同策略实现可以各自携带不同的配置类型，调用方仍然面对统一的抽象。好处是新增策略时不修改已有代码，符合开闭原则。

### 仓库模式（Repository）

仓库模式把数据访问逻辑封装起来，上层只面对统一的增删改查接口。用泛型实现后，一个仓库接口就能服务于任意实体类型：

\`\`\`ts
interface Repository<T> {
  find(id: string): T;
  save(item: T): void;
  delete(id: string): void;
}
\`\`\`

为用户实体写仓库就是 Repository 加 User 类型，为订单实体写仓库就是 Repository 加 Order 类型，接口定义完全复用，类型各不相同。这是后端开发中最实用的泛型模式之一。

### Result 模式

错误处理的优雅做法是不用异常，而是用返回值表达成功或失败。Result 模式用联合类型加泛型实现：

\`\`\`ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
\`\`\`

成功时携带 value，失败时携带 error。调用方必须通过 ok 字段区分后才能取值，编译器强制你处理失败分支。这比 try/catch 更安全，因为异常很容易被遗忘。Rust 语言就是用这种模式处理错误的，TypeScript 完全可以借鉴。

### 事件系统

事件系统是前端开发的高频需求。难点在于不同事件对应不同的回调参数类型。用泛型加映射类型可以完美解决：

\`\`\`ts
interface EventMap {
  click: { x: number; y: number };
  input: { value: string };
}
\`\`\`

监听 click 时回调必须接受坐标对象，监听 input 时回调必须接受字符串值，类型完全不匹配时编译器直接报错。这种模式在事件总线、状态管理、组件通信等场景广泛应用。

### 适用场景与价值

这些模式的共同价值在于：用一次性的类型设计，换取整个项目长期的类型安全。工厂模式适合对象创建场景；建造者模式适合复杂对象逐步构建；策略模式适合算法可替换的场景；仓库模式适合数据访问层；Result 模式适合需要显式错误处理的场景；事件系统适合组件间通信。掌握它们，你就掌握了 TypeScript 项目中最具实战价值的泛型用法，后续章节的类型体操技巧也都是在这些模式基础上演化的。`,
    code: `// ============================================================
// 第一章代码演示：泛型常用设计模式
// ============================================================

console.log("========== 1. 泛型工厂模式 ==========");

// 泛型工厂函数：传入构造器，返回实例
// cls 的类型是 new () => T，表示一个无参构造器，返回 T 类型实例
function create<T>(cls: new () => T): T {
  return new cls();
}

// 定义两个普通类
class User { name = "Alice"; }
class Product { title = "Book"; price = 30; }

// 用工厂创建实例，类型自动推断
const u1 = create(User);       // 推断为 User
const p1 = create(Product);    // 推断为 Product
console.log("工厂创建 User:", u1.name);
console.log("工厂创建 Product:", p1.title + ", 价格=" + p1.price);

console.log("\\n========== 2. 仓库模式 Repository<T> ==========");

// 仓库接口：统一的增删改查抽象
interface Repository<T> {
  find(id: string): T | undefined;
  save(item: T): void;
  list(): T[];
}

// 通用的内存仓库实现，可服务于任意带 id 的实体
class InMemoryRepository<T extends { id: string }> implements Repository<T> {
  private store = new Map<string, T>();

  find(id: string): T | undefined {
    return this.store.get(id);
  }

  save(item: T): void {
    this.store.set(item.id, item);
  }

  list(): T[] {
    return Array.from(this.store.values());
  }
}

// 为 User 和 Order 分别创建仓库，复用同一套实现
const userRepo = new InMemoryRepository<{ id: string; name: string }>();
userRepo.save({ id: "u1", name: "Bob" });
userRepo.save({ id: "u2", name: "Carol" });
console.log("查找用户 u1:", JSON.stringify(userRepo.find("u1")));
console.log("所有用户:", JSON.stringify(userRepo.list()));

console.log("\\n========== 3. Result 模式 ==========");

// Result 类型：成功或失败的联合类型
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// 工具函数：包装成功值和失败原因
function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

function fail<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// 模拟一个除法操作，用 Result 返回结果
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return fail("除数不能为零");
  return ok(a / b);
}

// 调用方必须处理成功和失败两种分支
const r1 = divide(10, 2);
if (r1.ok) {
  console.log("10 / 2 =", r1.value);
} else {
  console.log("错误:", r1.error);
}

const r2 = divide(10, 0);
if (r2.ok) {
  console.log("10 / 0 =", r2.value);
} else {
  console.log("错误:", r2.error);
}

console.log("\\n========== 4. 类型安全事件系统 ==========");

// 事件映射表：事件名 -> 回调参数类型
interface EventMap {
  click: { x: number; y: number };
  input: { value: string };
}

// 泛型事件总线：不同事件的回调参数类型不同
class EventBus<EM extends Record<string, any>> {
  private handlers: { [K in keyof EM]?: Array<(e: EM[K]) => void> } = {};

  // 注册事件监听器，K 约束为 EM 的某个键
  on<K extends keyof EM>(event: K, cb: (e: EM[K]) => void): void {
    const list = this.handlers[event] || [];
    list.push(cb);
    this.handlers[event] = list;
  }

  // 触发事件，参数类型必须匹配事件名对应的类型
  emit<K extends keyof EM>(event: K, e: EM[K]): void {
    const list = this.handlers[event] || [];
    list.forEach(function (fn) { fn(e); });
  }
}

// 使用事件总线
const bus = new EventBus<EventMap>();
bus.on("click", function (e) {
  console.log("点击事件: x=" + e.x + ", y=" + e.y);
});
bus.on("input", function (e) {
  console.log("输入事件: " + e.value);
});
bus.emit("click", { x: 10, y: 20 });
bus.emit("input", { value: "hello" });`,
  },

  // =========================================================
  // 第二章：高阶函数与高阶类型模拟
  // =========================================================
  {
    id: "tsgen-hoc",
    icon: "🎁",
    group: "实战与类型体操",
    title: "高阶函数与高阶类型模拟",
    content: `## 高阶函数与高阶类型模拟

### 什么是高阶函数？

高阶函数是函数式编程的核心概念：接受函数作为参数，或者返回函数作为结果的函数。JavaScript 原生支持高阶函数（如 map、filter、reduce），TypeScript 在此基础上用泛型为高阶函数提供完整的类型安全。

### 泛型 compose 函数

函数组合是高阶函数最经典的应用。把两个函数串联成一个新函数，前一个的输出作为后一个的输入：

\`\`\`ts
function compose<A, B, C>(
  f: (x: A) => B,
  g: (y: B) => C
): (x: A) => C {
  return x => g(f(x));
}
\`\`\`

三个类型参数 A、B、C 完整描述了数据流动：输入 A 类型，经过 f 变成 B，再经过 g 变成 C。编译器会检查 f 的输出和 g 的输入是否匹配，不匹配直接报错。这种类型推导在运行时没有任何开销，因为泛型只在编译期存在。

### memoize：记忆化函数

memoize 缓存函数的计算结果，相同参数再次调用时直接返回缓存值。用泛型实现后，记忆化函数的签名和原函数完全一致，调用方无感知：

\`\`\`ts
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}
\`\`\`

这里用到了 Parameters 和 ReturnType 两个内置工具类型，它们本身也是用 infer 实现的泛型类型。约束 T extends (...args: any[]) => any 确保 memoize 只能作用于函数。

### once：只执行一次

once 让一个函数只执行一次，后续调用返回第一次的结果。这在初始化场景很有用，确保某些逻辑不会重复执行。泛型签名同样保持原函数的类型信息，调用方完全无感知包装层的存在。

### pipeline：管道函数

pipeline 是 compose 的变体，从左到右依次执行函数，更符合阅读直觉。可以用 reduce 实现，泛型确保每一步的类型衔接正确。compose 是从右到左，pipeline 是从左到右，选择哪种取决于个人偏好和可读性。

### 高阶类型的模拟

TypeScript 没有真正的高阶类型（Higher-Kinded Types，简称 HKT）。高阶类型是接收类型参数并返回新类型的"类型函数"，比如 Maybe、List 这样的类型构造器。在 Haskell 中你可以写 Functor 类型类来抽象所有可 map 的类型；但在 TypeScript 中无法直接表达"一个接收类型参数的类型"。

不过可以用模式模拟。定义一个接口，用具体类型填充占位符，间接达到类似效果：

\`\`\`ts
interface Functor<F> {
  map<A, B>(fa: F<A>, f: (a: A) => B): F<B>;
}
\`\`\`

虽然语法上 F 不能直接作为类型构造器使用（TypeScript 不允许 F 加尖括号 A 这样的语法），但可以通过为每个具体类型（如 Array、Promise）分别实现 Functor 接口来模拟。fp-ts 等函数式编程库就是用这种方式在 TypeScript 中实现完整的函数式类型系统的。

### 实际开发场景

高阶泛型函数在实际开发中无处不在：React 的高阶组件用泛型包装组件类型；Express 的中间件用泛型约束请求响应类型；数据库查询构建器用泛型链式返回类型。理解 compose、memoize、once 这些基础模式，是掌握所有高级泛型工具的前提。它们的共同特点是用类型参数描述数据流动，让编译器成为你的安全网。`,
    code: `// ============================================================
// 第二章代码演示：高阶函数与高阶类型模拟
// ============================================================

console.log("========== 1. compose 函数组合 ==========");

// compose：把两个函数串联成一个
// f: A -> B, g: B -> C, 组合后: A -> C
function compose<A, B, C>(
  f: (x: A) => B,
  g: (y: B) => C
): (x: A) => C {
  return function (x: A): C {
    return g(f(x));
  };
}

// 定义两个简单函数
function double(n: number): number {
  return n * 2;
}
function numToString(n: number): string {
  return "结果=" + n;
}

// 组合：先翻倍再转字符串
const doubleThenStr = compose(double, numToString);
console.log("compose(double, numToString)(5):", doubleThenStr(5));

console.log("\\n========== 2. memoize 记忆化 ==========");

// memoize：缓存函数结果，相同参数直接返回缓存
// 泛型约束 T 必须是函数类型
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, any>();
  return function (...args: any[]): any {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log("  (命中缓存) 参数: " + key);
      return cache.get(key);
    }
    console.log("  (计算新值) 参数: " + key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  } as T;
}

// 模拟一个耗时计算
function slowAdd(a: number, b: number): number {
  return a + b;
}

const memoAdd = memoize(slowAdd);
console.log("第一次调用 memoAdd(1, 2):", memoAdd(1, 2));
console.log("第二次调用 memoAdd(1, 2):", memoAdd(1, 2));
console.log("调用 memoAdd(3, 4):", memoAdd(3, 4));

console.log("\\n========== 3. once 只执行一次 ==========");

// once：让函数只执行一次，后续调用返回第一次的结果
function once<T extends (...args: any[]) => any>(fn: T): T {
  let done = false;
  let result: any;
  return function (...args: any[]): any {
    if (!done) {
      result = fn(...args);
      done = true;
      console.log("  (首次执行)");
    } else {
      console.log("  (已执行过，返回缓存结果)");
    }
    return result;
  } as T;
}

function initialize(): string {
  return "系统初始化完成";
}

const initOnce = once(initialize);
console.log("第一次 initOnce():", initOnce());
console.log("第二次 initOnce():", initOnce());

console.log("\\n========== 4. pipeline 管道函数 ==========");

// pipeline：从左到右依次执行函数（与 compose 方向相反）
function pipeline<A, B, C, D>(
  f1: (x: A) => B,
  f2: (x: B) => C,
  f3: (x: C) => D
): (x: A) => D {
  return function (x: A): D {
    return f3(f2(f1(x)));
  };
}

// 定义三个处理函数
function addOne(n: number): number { return n + 1; }
function multiplyTen(n: number): number { return n * 10; }
function toFixed2(n: number): string { return n.toFixed(2); }

// 管道：先加1，再乘10，再保留两位小数
const process = pipeline(addOne, multiplyTen, toFixed2);
console.log("pipeline 处理 5:", process(5));
console.log("pipeline 处理 9:", process(9));

console.log("\\n========== 5. Functor 模式模拟 ==========");

// 模拟高阶类型：为数组实现 map 操作
// Functor 接口定义了 map 的抽象
interface ArrayFunctor {
  map<A, B>(fa: A[], f: (a: A) => B): B[];
}

// 为数组具体实现 Functor
const arrayFunctor: ArrayFunctor = {
  map: function (fa, f) {
    return fa.map(f);
  }
};

const nums = [1, 2, 3];
const squared = arrayFunctor.map(nums, function (x) { return x * x; });
console.log("ArrayFunctor map 平方:", JSON.stringify(squared));`,
  },

  // =========================================================
  // 第三章：用泛型实现类型安全的状态机
  // =========================================================
  {
    id: "tsgen-state-machine",
    icon: "🎭",
    group: "实战与类型体操",
    title: "用泛型实现类型安全的状态机",
    content: `## 用泛型实现类型安全的状态机

### 状态机的基本概念

状态机（State Machine）是一种数学模型，描述一个系统在不同状态之间如何转换。三个核心要素是：状态（State）、事件（Event）、转换（Transition）。系统在任意时刻处于一个状态，收到事件后根据当前状态和事件类型跳转到下一个状态。状态机在 UI 开发、协议解析、游戏逻辑、工作流引擎中应用广泛。

### 用联合类型定义状态

TypeScript 的联合类型加字面量类型非常适合定义状态。每个状态可以携带不同的数据，通过可辨识联合（Discriminated Union）实现类型安全：

\`\`\`ts
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; error: string };
\`\`\`

status 字段是判别属性。当 status 是 success 时，TypeScript 知道状态一定有 data 字段；当 status 是 error 时，一定有 error 字段。这种设计让非法状态在编译期就被排除——你无法构造一个 success 状态却没有 data。

### 用联合类型定义事件

事件同样用可辨识联合定义：

\`\`\`ts
type Event =
  | { type: "FETCH" }
  | { type: "RESOLVE"; data: string }
  | { type: "REJECT"; error: string }
  | { type: "RESET" };
\`\`\`

每个事件携带它需要的数据。RESOLVE 事件必须带 data，REJECT 事件必须带 error。编译器保证你不会发出一个没有 data 的 RESOLVE 事件。

### 类型安全的转换函数

转换函数接收当前状态和事件，返回新状态。关键是利用 switch 语句的窄化能力：在 case success 分支中，TypeScript 知道当前状态有 data 字段；在 case RESOLVE 分支中，知道事件有 data 字段。如果某个转换不合法（比如 idle 状态收到 RESOLVE），就返回原状态保持不变。这种设计确保了状态转换的合法性。

### 有限状态机的泛型实现

可以把状态机抽象成泛型类，接收状态类型和事件类型作为参数。内部维护当前状态，提供 send 方法接收事件并触发转换，reduce 方法定义转换逻辑由构造函数传入。这样不同的业务场景可以复用同一套状态机框架，只需提供不同的状态类型、事件类型和转换函数。

### UI 开发中的状态机

前端开发中最常见的状态机场景是异步数据加载：idle（空闲）收到 FETCH 事件进入 loading（加载中），loading 收到 RESOLVE 进入 success（成功），收到 REJECT 进入 error（失败）。success 和 error 收到 RESET 回到 idle。用状态机描述后，UI 只需要根据当前状态渲染不同界面，逻辑清晰且不会出现"加载中却显示成功"的矛盾状态。

### XState 的类型设计思路

流行的状态机库 XState 在 TypeScript 5+ 中引入了全新的类型系统：用泛型描述状态转换表，用条件类型推断某个状态可以接收哪些事件，用字面量类型约束事件名。其核心思路和本章介绍的完全一致——用联合类型表示状态，用映射类型表示转换表，用泛型参数连接状态和事件。理解了本章的基础实现，再去读 XState 的类型定义会事半功倍。

### 状态机的价值

状态机最大的价值是把隐式的状态逻辑变成显式的类型约束。没有状态机时，状态散落在各种布尔变量里（isLoading、hasError、isSuccess），很容易出现互相矛盾的组合；有了状态机，非法状态在编译期就被排除，调试时也能清晰追踪每次转换。这是泛型在架构层面最实用的应用之一。`,
    code: `// ============================================================
// 第三章代码演示：类型安全的状态机
// ============================================================

console.log("========== 1. 定义状态和事件类型 ==========");

// 状态类型：可辨识联合，每个状态携带不同数据
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; error: string };

// 事件类型：每个事件携带需要的数据
type Event =
  | { type: "FETCH" }
  | { type: "RESOLVE"; data: string }
  | { type: "REJECT"; error: string }
  | { type: "RESET" };

console.log("状态: idle / loading / success / error");
console.log("事件: FETCH / RESOLVE / REJECT / RESET");

console.log("\\n========== 2. 类型安全的转换函数 ==========");

// transition：根据当前状态和事件，返回新状态
// 利用 switch 窄化，编译器保证类型安全
function transition(state: State, event: Event): State {
  switch (state.status) {
    case "idle":
      // idle 状态只能接收 FETCH 事件，进入 loading
      if (event.type === "FETCH") return { status: "loading" };
      break;
    case "loading":
      // loading 状态可以接收 RESOLVE 或 REJECT
      if (event.type === "RESOLVE") {
        return { status: "success", data: event.data };
      }
      if (event.type === "REJECT") {
        return { status: "error", error: event.error };
      }
      break;
    case "success":
    case "error":
      // success 和 error 状态只能接收 RESET，回到 idle
      if (event.type === "RESET") return { status: "idle" };
      break;
  }
  // 不允许的转换，保持原状态不变
  return state;
}

// 测试转换过程
let state: State = { status: "idle" };
console.log("初始状态:", state.status);

state = transition(state, { type: "FETCH" });
console.log("FETCH 后:", state.status);

state = transition(state, { type: "RESOLVE", data: "用户数据" });
// 通过 if 窄化，安全访问 data 字段
if (state.status === "success") {
  console.log("RESOLVE 后:", state.status + ", data=" + state.data);
}

state = transition(state, { type: "RESET" });
console.log("RESET 后:", state.status);

console.log("\\n========== 3. 泛型有限状态机类 ==========");

// 泛型状态机：接收状态类型 S 和事件类型 E
class StateMachine<S, E> {
  private current: S;
  private reduceFn: (state: S, event: E) => S;

  constructor(initial: S, reduce: (state: S, event: E) => S) {
    this.current = initial;
    this.reduceFn = reduce;
  }

  // 获取当前状态
  get state(): S {
    return this.current;
  }

  // 发送事件，触发状态转换
  send(event: E): S {
    this.current = this.reduceFn(this.current, event);
    return this.current;
  }
}

// 用泛型状态机管理加载流程
const fsm = new StateMachine<State, Event>({ status: "idle" }, transition);

console.log("FSM 初始状态:", fsm.state.status);
fsm.send({ type: "FETCH" });
console.log("FSM FETCH 后:", fsm.state.status);
fsm.send({ type: "REJECT", error: "网络超时" });
// 通过 if 窄化，安全访问 error 字段
if (fsm.state.status === "error") {
  console.log("FSM REJECT 后:", fsm.state.status + ", error=" + fsm.state.error);
}
fsm.send({ type: "RESET" });
console.log("FSM RESET 后:", fsm.state.status);

console.log("\\n========== 4. 状态转换合法性验证 ==========");

// 验证非法转换会被正确处理（保持原状态不变）
let s: State = { status: "idle" };
console.log("当前状态:", s.status);

// idle 状态收到 RESOLVE 是非法的，状态应保持不变
s = transition(s, { type: "RESOLVE", data: "不应该出现" });
console.log("idle 收到 RESOLVE（非法）后:", s.status, "（保持不变）");

// error 状态收到 FETCH 也是非法的
s = { status: "error", error: "出错了" };
s = transition(s, { type: "FETCH" });
console.log("error 收到 FETCH（非法）后:", s.status, "（保持不变）");

// 验证合法转换
s = { status: "idle" };
s = transition(s, { type: "FETCH" });
console.log("idle 收到 FETCH（合法）后:", s.status, "（转换成功）");`,
  },

  // =========================================================
  // 第四章：类型体操经典题解析
  // =========================================================
  {
    id: "tsgen-gymnastics",
    icon: "🤸",
    group: "实战与类型体操",
    title: "类型体操经典题解析",
    content: `## 类型体操经典题解析

### 什么是类型体操？

类型体操是利用 TypeScript 类型系统在编译阶段完成复杂类型计算和变换的编程技巧。把类型系统当作一门函数式编程语言：类型是值，泛型是函数，条件类型是分支，映射类型是遍历，递归类型是循环。本章解析五道经典类型体操题，帮助你理解类型系统的能力边界。

### 经典题一：DeepPartial 递归可选

内置的 Partial 只把第一层属性变成可选。如果对象有嵌套结构，需要递归处理每一层：

\`\`\`ts
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
\`\`\`

映射类型遍历每个属性加问号，条件类型判断属性值是否为对象——是对象就递归处理，不是就原样返回。这是递归类型最基础的用法。

### 经典题二：DeepReadonly 递归只读

思路和 DeepPartial 完全一样，只是把问号换成 readonly：

\`\`\`ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};
\`\`\`

注意 T[K] extends object 的判断需要小心——函数和数组也是 object，实际使用中可能需要更精细的判断来避免把函数也变成只读。

### 经典题三：Chainable 链式调用类型推断

这道题要求实现一个链式调用的 option 方法，每次调用都把新的键值对累加到类型中，最终 get 方法返回累加后的类型：

\`\`\`ts
type Chainable<T = {}> = {
  option<K extends string, V>(key: K, value: V): Chainable<T & Record<K, V>>;
  get(): T;
};
\`\`\`

关键技巧是用泛型默认参数 T = {} 作为累加器，每次调用 option 时用交叉类型把新的键值合并进去。K extends string 约束键必须是字符串字面量类型，这样 Record 才能精确记录具体的键名。

### 经典题四：PromiseAll 元组转 Promise 元组

Promise.all 接收一个 Promise 数组，返回一个 Promise，其 resolve 值是原数组对应位置的值组成的元组。类型层面要实现：把 Promise 加数组转成 Promise 加元组。核心是用 infer 提取每个 Promise 的内部类型，配合映射类型遍历元组。这是 infer 最经典的应用场景之一。

### 经典题五：TupleToUnion 元组转联合类型

这是最简洁的入门题，一行就能实现：

\`\`\`ts
type TupleToUnion<T extends readonly any[]> = T[number];
\`\`\`

用 number 索引元组类型，得到所有元素类型的联合。就像运行时用数字索引访问数组可以得到任意元素一样，类型层面用 number 索引元组就得到所有可能元素类型的联合。

### 解题思路

类型体操最大的障碍不是语法而是思维方式。推荐的解题步骤：第一步，先想运行时怎么实现（如果是函数，参数和返回值是什么）；第二步，把运行时概念翻译成类型概念（值变类型，函数变泛型，if 变条件类型，循环变递归）；第三步，写出来后在编辑器里用类型断言验证结果是否正确。坚持这个流程，再复杂的类型题也能拆解。

### 类型体操的意义

类型体操不是为了炫技。它的真正价值在于：帮助你理解 TypeScript 类型系统的能力边界，提升日常的类型设计能力。当你能自如地实现 DeepPartial、Chainable 这些类型时，面对业务中的类型难题就能游刃有余。很多优秀的开源库（如 zod、type-fest、fp-ts）都大量运用类型体操技巧来提供极致的类型安全。把类型体操当作思维训练，你的 TypeScript 水平会有质的飞跃。`,
    code: `// ============================================================
// 第四章代码演示：类型体操经典题
// ============================================================

console.log("========== 1. DeepPartial 递归可选 ==========");

// DeepPartial：递归地把所有层级的属性变成可选
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// 定义一个嵌套配置类型
interface AppConfig {
  server: {
    host: string;
    port: number;
  };
  debug: boolean;
}

// DeepPartial 后，所有层级都变成可选
const partialConfig: DeepPartial<AppConfig> = {
  server: { port: 8080 },  // host 可以省略
  // debug 也可以省略
};
console.log("DeepPartial 配置:", JSON.stringify(partialConfig));

console.log("\\n========== 2. DeepReadonly 递归只读 ==========");

// DeepReadonly：递归地把所有层级的属性变成只读
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// 定义一个嵌套对象类型
interface TreeNode {
  value: number;
  children: {
    left: number;
    right: number;
  };
}

// DeepReadonly 后，所有层级都不可修改
const tree: DeepReadonly<TreeNode> = {
  value: 1,
  children: { left: 2, right: 3 },
};
console.log("DeepReadonly 树:", JSON.stringify(tree));

console.log("\\n========== 3. Chainable 链式调用类型推断 ==========");

// Chainable 类型：每次 option 调用都累加键值对到类型中
// 关键：泛型默认参数 T = {} 作为累加器
interface Chainable<T = {}> {
  option<K extends string, V>(key: K, value: V): Chainable<T & Record<K, V>>;
  get(): T;
}

// 运行时实现
function createChainable<T = {}>(data: Record<string, unknown> = {}): Chainable<T> {
  return {
    option: function <K extends string, V>(key: K, value: V): Chainable<T & Record<K, V>> {
      const newData: Record<string, unknown> = {};
      for (const k in data) {
        newData[k] = data[k];
      }
      newData[key] = value;
      return createChainable(newData) as any;
    },
    get: function (): T {
      return data as any;
    }
  };
}

// 链式调用，类型逐步累加
const chainResult = createChainable()
  .option("name", "Alice")
  .option("age", 30)
  .option("active", true)
  .get();
console.log("Chainable 结果:", JSON.stringify(chainResult));

console.log("\\n========== 4. TupleToUnion 元组转联合类型 ==========");

// TupleToUnion：把元组类型转换为联合类型
type TupleToUnion<T extends readonly any[]> = T[number];

// 定义一个元组类型
type Colors = ["red", "green", "blue"];

// 转换为联合类型 "red" | "green" | "blue"
type ColorUnion = TupleToUnion<Colors>;

// 运行时验证：用数组和 includes 模拟联合类型检查
const colorList: ColorUnion[] = ["red", "green", "blue"];
function isColor(value: string): boolean {
  return colorList.includes(value as ColorUnion);
}
console.log("isColor('red'):", isColor("red"));
console.log("isColor('yellow'):", isColor("yellow"));

console.log("\\n========== 5. 运行时模拟 DeepPartial 行为 ==========");

// 运行时版本的 deepPartial：递归遍历对象
function deepPartial<T extends object>(obj: T): DeepPartial<T> {
  const result: any = {};
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === "object" && value !== null) {
      result[key] = deepPartial(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

const original = { a: 1, b: { c: 2, d: 3 } };
const partial = deepPartial(original);
console.log("原始对象:", JSON.stringify(original));
console.log("DeepPartial 后:", JSON.stringify(partial));
console.log("(运行时值不变，类型层面所有属性变为可选)");`,
  },

  // =========================================================
  // 第五章：综合实战：类型安全的 API 客户端
  // =========================================================
  {
    id: "tsgen-real-world",
    icon: "🌍",
    group: "实战与类型体操",
    title: "综合实战：类型安全的 API 客户端",
    content: `## 综合实战：类型安全的 API 客户端

### 实战目标

本章把前面学到的所有泛型知识整合起来，实现一个类型安全的 HTTP API 客户端。目标是：调用方传入路由名，编译器自动推断出需要的参数类型和返回值类型；GET 请求不需要 body，POST 请求需要 body；返回值用 Result 模式包装，强制处理错误。这个例子涵盖了泛型函数、泛型接口、条件类型、infer、映射类型、模板字面量类型等几乎所有高级技巧。

### 第一步：定义 API 路由映射表

用接口描述所有路由的请求参数和响应类型。每条路由是一个字符串字面量类型（如 "GET /users"），对应的值描述参数和响应：

\`\`\`ts
interface ApiMap {
  "GET /users": { params: void; response: User[] };
  "POST /users": { params: { name: string }; response: User };
  "GET /users/:id": { params: { id: string }; response: User };
  "DELETE /users/:id": { params: { id: string }; response: void };
}
\`\`\`

这个映射表是整个类型安全的基石。新增路由只需加一行，类型推导自动生效。每条路由的 params 描述需要传什么参数，response 描述返回什么类型。

### 第二步：用泛型约束实现参数类型安全

request 函数用泛型参数 K 约束路由名必须是 ApiMap 的键之一。通过索引访问 ApiMap 中 K 对应的 params 和 response，获取参数类型和响应类型。这样传入不同路由时，参数和返回值类型自动变化。编译器会检查路由名是否存在于 ApiMap 中，拼错路由名会直接报错。

### 第三步：用条件类型推断是否需要参数

GET 请求的 params 是 void（不需要参数），POST 和 DELETE 需要 id 或 body。用条件类型实现：如果 params 是 void，参数列表为空数组；否则参数列表包含一个 params 对象：

\`\`\`ts
type Params<T> = T extends void ? [] : [T];
\`\`\`

这个条件类型让 request 函数的签名智能地变化——GET /users 不需要传参，POST /users 需要传 name，DELETE /users/:id 需要传 id。编译器会强制你传正确的参数，多传少传都会报错。

### 第四步：用模板字面量类型约束路径

路由名用字符串字面量类型约束，确保格式是"方法加空格加路径"。可以进一步用模板字面量类型约束路径参数（如冒号加 id 表示路径参数），但本章保持简单，重点展示类型安全的整体设计思路。

### 第五步：错误处理的类型安全

返回值用 Result 模式包装：成功返回 ok 为 true 且携带 data，失败返回 ok 为 false 且携带 error。调用方必须通过 ok 字段区分后才能取 data，编译器强制处理错误分支。这比 throw 异常更安全，因为异常容易被遗忘。Result 模式让错误处理变成显式的、可追踪的类型约束。

### 整合所有知识

这个 API 客户端整合了前面章节学到的所有核心技巧：泛型函数（request 的 K 参数）、泛型接口（ApiMap）、条件类型（Params 判断 void）、索引访问类型（ApiMap 中取 response）、联合类型（Result 的成功失败分支）、字面量类型（路由名约束）。每一项都是前面章节学过的，组合起来就是一个生产可用的类型安全方案。

### 从需求到类型设计的思考过程

面对一个需求，类型设计的思考过程是：第一步，明确数据流——输入什么、输出什么；第二步，用接口描述数据形状（ApiMap）；第三步，用泛型连接输入和输出（request 的 K 参数）；第四步，用条件类型处理分支（Params 判断 void）；第五步，用联合类型处理多态（Result 的成功失败）。掌握这个流程，你就能独立设计任何类型安全的方案。类型设计好了，运行时代码往往水到渠成。`,
    code: `// ============================================================
// 第五章代码演示：类型安全的 API 客户端
// ============================================================

console.log("========== 1. 定义 API 路由映射表 ==========");

// 用户类型
interface User {
  id: string;
  name: string;
}

// API 路由映射表：路由名 -> { 参数类型, 响应类型 }
// 这是整个类型安全的基石
interface ApiMap {
  "GET /users": { params: void; response: User[] };
  "POST /users": { params: { name: string }; response: User };
  "GET /users/:id": { params: { id: string }; response: User };
  "DELETE /users/:id": { params: { id: string }; response: void };
}

console.log("已定义 4 条路由:");
console.log("  GET /users        -> 无参, 返回 User[]");
console.log("  POST /users       -> 传 {name}, 返回 User");
console.log("  GET /users/:id    -> 传 {id}, 返回 User");
console.log("  DELETE /users/:id -> 传 {id}, 返回 void");

console.log("\\n========== 2. 条件类型与 Result 模式 ==========");

// Params 条件类型：params 为 void 时不需传参，否则需要传参对象
// T extends void ? [] : [T]
// void 时返回空数组（无额外参数），否则返回包含一个参数的元组
type Params<T> = T extends void ? [] : [T];

// Result 模式：成功或失败的联合类型
type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

console.log("Params<void>           = [] (无需传参)");
console.log("Params<{name:string}>  = [{name:string}] (需要传参)");
console.log("ApiResult<T>           = 成功加 data | 失败加 error");

console.log("\\n========== 3. 类型安全的 request 函数 ==========");

// request 函数：根据路由名自动推断参数和响应类型
// K extends keyof ApiMap 约束路由名必须是 ApiMap 的某个键
function request<K extends keyof ApiMap>(
  route: K,
  ...args: Params<ApiMap[K]["params"]>
): ApiResult<ApiMap[K]["response"]> {
  console.log("发送请求: " + route);
  if (args.length > 0) {
    console.log("  参数: " + JSON.stringify(args[0]));
  }

  // 模拟不同路由的响应数据
  if (route === "GET /users") {
    return {
      ok: true,
      data: [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
      ],
    };
  }
  if (route === "POST /users") {
    const params = args[0] as { name: string };
    return { ok: true, data: { id: "3", name: params.name } };
  }
  if (route === "GET /users/:id") {
    const params = args[0] as { id: string };
    return { ok: true, data: { id: params.id, name: "用户" + params.id } };
  }
  if (route === "DELETE /users/:id") {
    return { ok: true, data: undefined as any };
  }
  return { ok: false, error: "未知路由" };
}

console.log("\\n========== 4. 调用 API 客户端 ==========");

// 调用 GET /users —— 不需要传参数（params 是 void）
console.log("--- 获取用户列表 ---");
const r1 = request("GET /users");
if (r1.ok) {
  console.log("成功，用户列表:");
  r1.data.forEach(function (u) {
    console.log("  " + u.id + ": " + u.name);
  });
} else {
  console.log("失败: " + r1.error);
}

console.log("");

// 调用 POST /users —— 必须传 name 参数
console.log("--- 创建新用户 ---");
const r2 = request("POST /users", { name: "Carol" });
if (r2.ok) {
  console.log("成功，新用户: " + r2.data.id + " - " + r2.data.name);
} else {
  console.log("失败: " + r2.error);
}

console.log("");

// 调用 GET /users/:id —— 必须传 id 参数
console.log("--- 获取单个用户 ---");
const r3 = request("GET /users/:id", { id: "1" });
if (r3.ok) {
  console.log("成功，用户: " + r3.data.id + " - " + r3.data.name);
} else {
  console.log("失败: " + r3.error);
}

console.log("");

// 调用 DELETE /users/:id —— 必须传 id 参数
console.log("--- 删除用户 ---");
const r4 = request("DELETE /users/:id", { id: "2" });
if (r4.ok) {
  console.log("成功，用户已删除");
} else {
  console.log("失败: " + r4.error);
}

console.log("\\n========== 5. 类型安全总结 ==========");
console.log("1. 路由名受 keyof ApiMap 约束，拼错会报错");
console.log("2. 参数类型根据路由自动推断，GET 无参 POST 有参");
console.log("3. 返回值用 Result 包装，强制处理错误分支");
console.log("4. 新增路由只需在 ApiMap 加一行，类型推导自动生效");
console.log("5. 整合了泛型函数、泛型接口、条件类型、联合类型等技巧");`,
  },
];
