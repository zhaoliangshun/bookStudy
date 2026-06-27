// =============================================================
// TypeScript 交互式教程 —— 第九批章节（共 5 章 · 实战篇）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   1. ts-design-patterns  — 设计模式
//   2. ts-state-machine    — 状态机与状态管理
//   3. ts-real-world       — 真实世界类型设计
//   4. ts-performance      — 性能优化
//   5. ts-best-practices   — 最佳实践与避坑指南
//
// 每个章节包含：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（实战）
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
//     setImmediate, URL, URLSearchParams, TextEncoder, TextDecoder,
//     Promise, __dirname, __filename, require, module, exports
//   - V8 内置对象(globalThis/Reflect/JSON/Math/Date/Map/Set/WeakMap
//     等)在 vm 上下文中也可用
//   - 沙箱不能 require 外部模块(react/express/xstate 等)，所以
//     相关 demo 用对象字面量 + 接口来模拟这些库的类型设计与运行时行为
//   - 类型注解/interface/type/enum/泛型/装饰器都可用(转译器处理)
//   - 类型错误不会阻止运行(教程侧重运行结果)
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：设计模式
  // =========================================================
  {
    id: "ts-design-patterns",
    title: "设计模式",
    icon: "🎨",
    group: "实战",
    content: `## 设计模式

设计模式是前人在大量工程实践中总结出的、可复用的面向对象设计经验。GoF（Gang of Four）的 23 种设计模式分为三大类：**创建型**（关注对象创建）、**结构型**（关注类与对象的组合）、**行为型**（关注对象间的通信）。TypeScript 提供了接口、泛型、可辨识联合、装饰器等丰富特性，能让经典设计模式实现得更类型安全、更优雅。本章极其详细地讲解 8 种在 TS 项目中最常用的设计模式，每种都讲透适用场景、TS 实现、类型安全设计、优缺点与对比。

### 1. 单例模式（Singleton）

#### 适用场景

需要全局唯一实例的场景：配置管理、日志器、数据库连接池、缓存、设备驱动。当一个对象创建成本高（如建立连接）或必须全局协调（如事件总线）时，单例能避免重复创建与状态不一致。

#### 类实现

\`\`\`ts
class Logger {
  private static instance: Logger;
  private logs: string[] = [];

  private constructor() {} // 私有构造，禁止外部 new

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(msg: string): void {
    this.logs.push(msg);
    console.log("[LOG]", msg);
  }
}

const a = Logger.getInstance();
const b = Logger.getInstance();
console.log(a === b); // true，同一实例
\`\`\`

#### 模块单例（更推荐）

ES Module 本身就是单例——一个模块只会被求值一次，导出的就是单例。这比类单例更简洁、更易测试。

\`\`\`ts
// logger.ts
class Logger {
  private logs: string[] = [];
  log(msg: string) { this.logs.push(msg); console.log(msg); }
}
export const logger = new Logger(); // 模块级单例
\`\`\`

#### 线程安全？

JavaScript 单线程，无需考虑多线程下的双重检查锁。但在异步场景下要注意：单例的初始化如果依赖异步（如读配置文件），可能出现"第一次调用还没初始化完，第二次调用又来"的问题。解决方案是**初始化只暴露 Promise**。

#### 优缺点

| 优点 | 缺点 |
| --- | --- |
| 全局唯一，节省资源 | 隐藏依赖（谁用了单例不直观） |
| 全局协调方便 | 难测试（mock 困难） |
| 懒加载 | 违反单一职责（既管自己又管创建） |

#### 与模块单例对比

| 维度 | 类单例 | 模块单例 |
| --- | --- | --- |
| 实现 | 静态字段 + 私有构造 | 直接 export 实例 |
| 懒加载 | 是 | 否（模块加载即创建） |
| 可测试性 | 差 | 中 |
| 推荐度 | 一般 | 高 |

### 2. 工厂模式

#### 简单工厂（Simple Factory）

用一个函数根据参数返回不同子类。**不是 GoF 模式**，但最常用。

\`\`\`ts
type AnimalKind = "dog" | "cat" | "bird";

interface Animal {
  kind: AnimalKind;
  speak(): string;
}

class Dog implements Animal {
  kind = "dog" as const;
  speak() { return "汪汪"; }
}

class Cat implements Animal {
  kind = "cat" as const;
  speak() { return "喵喵"; }
}

function createAnimal(kind: AnimalKind): Animal {
  switch (kind) {
    case "dog": return new Dog();
    case "cat": return new Cat();
    case "bird": return new Bird();
  }
}
\`\`\`

#### 工厂方法（Factory Method）

定义创建对象的接口，由子类决定实例化哪个类。把"用什么"和"怎么造"解耦。

\`\`\`ts
abstract class Logistics {
  abstract createTransport(): Transport;
  deliver(): string {
    const t = this.createTransport();
    return "用 " + t.name + " 配送";
  }
}
class TruckLogistics extends Logistics {
  createTransport() { return new Truck(); }
}
\`\`\`

#### 抽象工厂（Abstract Factory）

创建一系列相关对象（产品族）。如 UI 主题工厂同时创建 Button + Input + Modal。

\`\`\`ts
interface UIFactory {
  createButton(): Button;
  createInput(): Input;
}
class DarkUIFactory implements UIFactory { /* 暗色系 */ }
class LightUIFactory implements UIFactory { /* 亮色系 */ }
\`\`\`

#### 三种工厂对比

| 模式 | 关注点 | 复杂度 | 适用场景 |
| --- | --- | --- | --- |
| 简单工厂 | 单一产品 | 低 | 产品少、不常变 |
| 工厂方法 | 单一产品 + 扩展 | 中 | 产品可能增加 |
| 抽象工厂 | 产品族 | 高 | 多系列相关产品 |

### 3. 观察者模式（Observer）

#### 适用场景

一对多依赖：一个对象状态变化时，所有依赖者自动收到通知。典型应用：事件总线、Vue 响应式、RxJS、消息队列。

#### 与发布订阅的区别

- **观察者**：Subject 直接持有 Observer 引用，直接调用。耦合较高。
- **发布订阅**：发布者与订阅者通过中间 Broker 解耦，互不感知。EventEmitter 介于两者之间。

\`\`\`ts
type Listener<T> = (payload: T) => void;

class EventBus<EventMap extends Record<string, unknown>> {
  private listeners: { [K in keyof EventMap]?: Listener<EventMap[K]>[] } = {};

  on<K extends keyof EventMap>(event: K, fn: Listener<EventMap[K]>): void {
    (this.listeners[event] ??= []).push(fn);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    (this.listeners[event] ?? []).forEach((fn) => fn(payload));
  }

  off<K extends keyof EventMap>(event: K, fn: Listener<EventMap[K]>): void {
    const arr = this.listeners[event] ?? [];
    const i = arr.indexOf(fn);
    if (i >= 0) arr.splice(i, 1);
  }
}

interface AppEvents {
  login: { userId: string };
  logout: void;
  error: { code: number; msg: string };
}

const bus = new EventBus<AppEvents>();
bus.on("login", (p) => console.log("登录:", p.userId));
bus.emit("login", { userId: "u1" });
\`\`\`

注意这里的 **EventMap 限定 K** 让 \`emit("login", 123)\` 类型错误——payload 必须匹配。

### 4. 策略模式（Strategy）

#### 适用场景

消除庞大的 \`switch/if-else\`。把每种"策略"封装成独立对象，运行时切换。如：支付方式、排序算法、折扣计算。

\`\`\`ts
interface DiscountStrategy {
  calculate(price: number): number;
}
class FullDiscount implements DiscountStrategy {
  constructor(private threshold: number, private reduce: number) {}
  calculate(price: number) {
    return price >= this.threshold ? price - this.reduce : price;
  }
}
class PercentDiscount implements DiscountStrategy {
  constructor(private percent: number) {}
  calculate(price: number) { return price * this.percent; }
}

class Order {
  constructor(private price: number, private strategy: DiscountStrategy) {}
  setStrategy(s: DiscountStrategy) { this.strategy = s; }
  finalPrice() { return this.strategy.calculate(this.price); }
}
\`\`\`

#### 与 switch 对比

\`\`\`ts
// ❌ 丑陋且难扩展
function calc(price: number, type: string): number {
  switch (type) {
    case "full": return price >= 300 ? price - 50 : price;
    case "percent": return price * 0.8;
    case "newUser": return price - 20;
    default: return price;
  }
}
// ✅ 策略模式：新增策略不用改原代码（开闭原则）
\`\`\`

### 5. 装饰器模式

#### 适用场景

在不改变原对象的前提下，动态添加职责。比继承更灵活（继承是静态的、爆炸式的）。

#### 与 TS 装饰器对比

| 维度 | 装饰器模式（设计模式） | TS 装饰器（语法） |
| --- | --- | --- |
| 是什么 | 包装对象的 OOP 模式 | 给类/方法/属性加注解的语法 |
| 运行时 | 包装对象 | Reflect.metadata |
| 用途 | 增加行为 | 标记元数据（如 \@Controller） |
| 关系 | 概念相关但不同 | 概念相关但不同 |

\`\`\`ts
interface Coffee { cost(): number; desc(): string; }
class SimpleCoffee implements Coffee {
  cost() { return 10; }
  desc() { return "咖啡"; }
}
class MilkDecorator implements Coffee {
  constructor(private inner: Coffee) {}
  cost() { return this.inner.cost() + 2; }
  desc() { return this.inner.desc() + " +牛奶"; }
}
const c = new MilkDecorator(new SimpleCoffee());
console.log(c.cost(), c.desc()); // 12 咖啡 +牛奶
\`\`\`

### 6. 适配器模式（Adapter）

#### 适用场景

让不兼容的接口协同工作。如：旧 API 接入新系统、第三方 SDK 适配。

\`\`\`ts
// 旧系统返回 { full_name: "Alice" }
interface OldUser { full_name: string; }
// 新系统期望 { name: string }
interface NewUser { name: string; }

class UserAdapter implements NewUser {
  constructor(private old: OldUser) {}
  get name() { return this.old.full_name; }
}
\`\`\`

### 7. 命令模式（Command）

#### 适用场景

把"请求"封装成对象，支持撤销、队列、日志。如：编辑器操作、事务、宏。

\`\`\`ts
interface Command { execute(): void; undo(): void; }
class AddTextCmd implements Command {
  constructor(private doc: string[], private text: string) {}
  execute() { this.doc.push(this.text); }
  undo() { this.doc.pop(); }
}
\`\`\`

### 8. 建造者模式（Builder）

#### 适用场景

构造复杂对象（参数多、可选多、需分步）。比构造函数/工厂更清晰。TS 里常用**链式调用 + 类型递进**确保必填项先填。

\`\`\`ts
class QueryBuilder {
  private parts: string[] = [];
  select(cols: string) { this.parts.push("SELECT " + cols); return this; }
  from(t: string) { this.parts.push("FROM " + t); return this; }
  where(cond: string) { this.parts.push("WHERE " + cond); return this; }
  build() { return this.parts.join(" "); }
}
const sql = new QueryBuilder().select("*").from("users").where("age > 18").build();
\`\`\`

### 9. 设计模式核心原则（SOLID）

| 原则 | 含义 | 模式应用 |
| --- | --- | --- |
| SRP 单一职责 | 一个类只一个变化原因 | 单例违反此原则 |
| OCP 开闭 | 扩展开放，修改关闭 | 策略、工厂方法 |
| LSP 里氏替换 | 子类能替换父类 | 工厂返回子类 |
| ISP 接口隔离 | 接口小而专 | 抽象工厂拆接口 |
| DIP 依赖倒置 | 依赖抽象非具体 | 工厂方法、适配器 |

### 10. 陷阱与最佳实践

1. **不要为模式而模式**：简单逻辑用函数即可，硬套模式反而增加复杂度。
2. **TS 的可辨识联合替代部分模式**：如状态机不用 State 类，用 \`type State = { type: "idle" } | { type: "loading" }\`。
3. **单例难测试**：优先模块单例，必要时用依赖注入替代。
4. **装饰器模式 vs 装饰器语法**：两者概念相关但实现不同，不要混淆。
5. **抽象工厂易过度设计**：产品族不明显时别用。

### 本章小结

设计模式是工具箱，不是教条。TypeScript 的类型系统让许多模式（如工厂、策略、观察者）能获得编译期安全。下面代码用纯 TS 实现 8 种模式的完整 demo。`,
    code: `// ============================================================
// 设计模式 —— 代码演示
// 用纯 TypeScript 实现 8 种常用设计模式
// ============================================================

// ============ 1. 单例模式 ============
console.log("========== 1. 单例模式 ==========");

// 类实现：私有构造 + 静态字段
class AppConfig {
  private static instance: AppConfig;
  private settings: Record<string, unknown> = {};

  // 私有构造函数：禁止外部 new
  private constructor() {
    this.settings = { env: "production", port: 3000 };
  }

  // 全局访问点
  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  get<T>(key: string): T | undefined {
    return this.settings[key] as T | undefined;
  }

  set(key: string, value: unknown): void {
    this.settings[key] = value;
  }
}

const cfg1 = AppConfig.getInstance();
const cfg2 = AppConfig.getInstance();
cfg1.set("version", "1.0.0");
console.log("两次 getInstance 是否同一实例:", cfg1 === cfg2);
console.log("cfg2 读取 cfg1 设置的 version:", cfg2.get<string>("version"));

// ============ 2. 工厂模式 ============
console.log("\\n========== 2. 工厂模式 ==========");

// 产品接口
interface Shape {
  readonly kind: string;
  area(): number;
  describe(): string;
}

// 具体产品：圆
class Circle implements Shape {
  readonly kind = "circle";
  constructor(private radius: number) {}
  area(): number {
    return Math.PI * this.radius * this.radius;
  }
  describe(): string {
    return "圆(半径=" + this.radius + ")";
  }
}

// 具体产品：矩形
class Rectangle implements Shape {
  readonly kind = "rectangle";
  constructor(private w: number, private h: number) {}
  area(): number {
    return this.w * this.h;
  }
  describe(): string {
    return "矩形(" + this.w + "x" + this.h + ")";
  }
}

// 具体产品：三角形
class Triangle implements Shape {
  readonly kind = "triangle";
  constructor(private base: number, private height: number) {}
  area(): number {
    return 0.5 * this.base * this.height;
  }
  describe(): string {
    return "三角形(底=" + this.base + ",高=" + this.height + ")";
  }
}

// 简单工厂：根据类型 + 参数创建
type ShapeConfig =
  | { type: "circle"; radius: number }
  | { type: "rectangle"; w: number; h: number }
  | { type: "triangle"; base: number; height: number };

function createShape(cfg: ShapeConfig): Shape {
  switch (cfg.type) {
    case "circle":
      return new Circle(cfg.radius);
    case "rectangle":
      return new Rectangle(cfg.w, cfg.h);
    case "triangle":
      return new Triangle(cfg.base, cfg.height);
  }
}

const shapes: Shape[] = [
  createShape({ type: "circle", radius: 5 }),
  createShape({ type: "rectangle", w: 3, h: 4 }),
  createShape({ type: "triangle", base: 6, height: 8 }),
];

for (const s of shapes) {
  console.log(s.describe() + " 面积=" + s.area().toFixed(2));
}

// ============ 3. 观察者模式 / 事件总线 ============
console.log("\\n========== 3. 观察者模式 ==========");

// 类型安全的事件总线：用泛型约束事件名与 payload
type EventHandler<T> = (payload: T) => void;

class TypedEventBus<EventMap extends Record<string, unknown>> {
  // 每个事件名对应一组 handler
  private handlers: { [K in keyof EventMap]?: EventHandler<EventMap[K]>[] } = {};

  // 订阅
  on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event]!.push(handler);
  }

  // 一次性订阅
  once<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    const wrapper: EventHandler<EventMap[K]> = (payload) => {
      handler(payload);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  // 取消订阅
  off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    const arr = this.handlers[event];
    if (!arr) return;
    const i = arr.indexOf(handler);
    if (i >= 0) arr.splice(i, 1);
  }

  // 发布
  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const arr = this.handlers[event];
    if (!arr) return;
    // 复制一份避免回调里 off 导致索引错乱
    arr.slice().forEach((h) => {
      try {
        h(payload);
      } catch (e) {
        console.error("事件处理器异常:", (e as Error).message);
      }
    });
  }
}

// 定义应用事件契约
interface AppEvents {
  "user:login": { userId: string; name: string };
  "user:logout": { userId: string };
  "cart:add": { sku: string; qty: number };
}

const bus = new TypedEventBus<AppEvents>();

// 多个订阅者
const loginLogger = (p: { userId: string; name: string }) => {
  console.log("  [日志] 用户登录: " + p.name + " (" + p.userId + ")");
};
const loginAnalytics = (p: { userId: string; name: string }) => {
  console.log("  [埋点] 上报登录事件 userId=" + p.userId);
};

bus.on("user:login", loginLogger);
bus.on("user:login", loginAnalytics);
bus.once("user:login", (p) => {
  console.log("  [一次性] 首次登录欢迎 " + p.name);
});

console.log("第一次 emit login:");
bus.emit("user:login", { userId: "u001", name: "Alice" });

console.log("第二次 emit login（一次性 handler 不再触发）:");
bus.emit("user:login", { userId: "u002", name: "Bob" });

bus.off("user:login", loginAnalytics);
console.log("移除 analytics 后第三次 emit:");
bus.emit("user:login", { userId: "u003", name: "Carol" });

// ============ 4. 策略模式 ============
console.log("\\n========== 4. 策略模式 ==========");

// 策略接口
interface PriceStrategy {
  readonly name: string;
  calculate(price: number): number;
}

// 满减策略
class FullReductionStrategy implements PriceStrategy {
  readonly name = "满减";
  constructor(private threshold: number, private reduce: number) {}
  calculate(price: number): number {
    return price >= this.threshold ? price - this.reduce : price;
  }
}

// 折扣策略
class PercentOffStrategy implements PriceStrategy {
  readonly name = "折扣";
  constructor(private percent: number) {}
  calculate(price: number): number {
    return Math.round(price * this.percent * 100) / 100;
  }
}

// 新用户立减
class NewUserStrategy implements PriceStrategy {
  readonly name = "新用户立减";
  constructor(private reduce: number) {}
  calculate(price: number): number {
    return Math.max(0, price - this.reduce);
  }
}

// 上下文：订单
class ShoppingCart {
  private items: { name: string; price: number; qty: number }[] = [];
  private strategy: PriceStrategy;

  constructor(strategy: PriceStrategy) {
    this.strategy = strategy;
  }

  addItem(name: string, price: number, qty: number): void {
    this.items.push({ name, price, qty });
  }

  setStrategy(s: PriceStrategy): void {
    this.strategy = s;
  }

  subtotal(): number {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  finalPrice(): number {
    return this.strategy.calculate(this.subtotal());
  }

  printBill(): void {
    console.log("商品清单:");
    for (const i of this.items) {
      console.log("  " + i.name + " x" + i.qty + " = " + i.price * i.qty);
    }
    console.log("小计: " + this.subtotal());
    console.log("应用策略[" + this.strategy.name + "] 后应付: " + this.finalPrice());
  }
}

const cart = new ShoppingCart(new PercentOffStrategy(0.8));
cart.addItem("键盘", 200, 1);
cart.addItem("鼠标", 80, 2);
cart.printBill();

console.log("切换为满减策略（满 300 减 50）:");
cart.setStrategy(new FullReductionStrategy(300, 50));
cart.printBill();

console.log("切换为新用户立减 30:");
cart.setStrategy(new NewUserStrategy(30));
cart.printBill();

// ============ 5. 装饰器模式 ============
console.log("\\n========== 5. 装饰器模式 ==========");

// 组件接口
interface TextComponent {
  render(): string;
}

// 基础组件
class PlainText implements TextComponent {
  constructor(private text: string) {}
  render(): string {
    return this.text;
  }
}

// 装饰器基类（也可省略，直接实现接口）
abstract class TextDecorator implements TextComponent {
  constructor(protected inner: TextComponent) {}
  abstract render(): string;
}

// 加粗装饰器
class BoldDecorator extends TextDecorator {
  render(): string {
    return "**" + this.inner.render() + "**";
  }
}

// 斜体装饰器
class ItalicDecorator extends TextDecorator {
  render(): string {
    return "*" + this.inner.render() + "*";
  }
}

// 大写装饰器
class UpperCaseDecorator extends TextDecorator {
  render(): string {
    return this.inner.render().toUpperCase();
  }
}

// 链式叠加多个装饰器
const decorated = new BoldDecorator(
  new ItalicDecorator(new UpperCaseDecorator(new PlainText("hello world")))
);
console.log("原文本: hello world");
console.log("加粗+斜体+大写 后:", decorated.render());

// ============ 6. 适配器模式 ============
console.log("\\n========== 6. 适配器模式 ==========");

// 老的第三方 API 返回这种结构
interface LegacyUserApi {
  full_name: string;
  age_value: number;
  contact_email: string;
}

// 我们系统期望的新结构
interface ModernUser {
  name: string;
  age: number;
  email: string;
}

// 适配器：把老结构包装成新接口
class UserAdapter implements ModernUser {
  constructor(private legacy: LegacyUserApi) {}

  get name(): string {
    return this.legacy.full_name;
  }
  get age(): number {
    return this.legacy.age_value;
  }
  get email(): string {
    return this.legacy.contact_email;
  }
}

// 模拟老 API 调用
function fetchLegacyUser(): LegacyUserApi {
  return { full_name: "张三", age_value: 28, contact_email: "zhangsan@old.com" };
}

const legacyData = fetchLegacyUser();
const modernUser: ModernUser = new UserAdapter(legacyData);
console.log("适配后的用户:", modernUser.name, modernUser.age, modernUser.email);

// ============ 7. 命令模式 ============
console.log("\\n========== 7. 命令模式 ==========");

// 命令接口
interface Command {
  readonly name: string;
  execute(): void;
  undo(): void;
}

// 接收者：文本编辑器
class TextDocument {
  private content = "";

  insert(text: string): void {
    this.content += text;
  }
  removeLast(n: number): void {
    this.content = this.content.slice(0, -n);
  }
  getText(): string {
    return this.content;
  }
}

// 具体命令：插入文本
class InsertCommand implements Command {
  readonly name = "Insert";
  constructor(private doc: TextDocument, private text: string) {}
  execute(): void {
    this.doc.insert(this.text);
  }
  undo(): void {
    this.doc.removeLast(this.text.length);
  }
}

// 调用者：维护命令历史
class CommandManager {
  private history: Command[] = [];
  private undone: Command[] = [];

  execute(cmd: Command): void {
    cmd.execute();
    this.history.push(cmd);
    this.undone = []; // 新命令清空 redo 栈
    console.log("  执行[" + cmd.name + "] 当前文本: '" + this.currentText(cmd) + "'");
  }

  undo(): void {
    const cmd = this.history.pop();
    if (!cmd) {
      console.log("  无可撤销命令");
      return;
    }
    cmd.undo();
    this.undone.push(cmd);
    console.log("  撤销[" + cmd.name + "]");
  }

  // 辅助：仅用于演示输出
  private currentText(cmd: Command): string {
    // 通过反射拿 doc 引用太复杂，这里仅示意
    return "(已更新)";
  }

  get canUndo(): boolean {
    return this.history.length > 0;
  }
}

const doc = new TextDocument();
const manager = new CommandManager();

// 这里为了演示输出，手动跟踪文本
manager.execute(new InsertCommand(doc, "Hello"));
console.log("  文档内容: '" + doc.getText() + "'");
manager.execute(new InsertCommand(doc, " World"));
console.log("  文档内容: '" + doc.getText() + "'");
manager.undo();
console.log("  撤销后文档: '" + doc.getText() + "'");
manager.undo();
console.log("  再撤销后文档: '" + doc.getText() + "'");

// ============ 8. 建造者模式 ============
console.log("\\n========== 8. 建造者模式 ==========");

// SQL 查询建造者：链式调用
class QueryBuilder {
  private selectClause = "";
  private fromClause = "";
  private whereClauses: string[] = [];
  private orderByClause = "";
  private limitClause: number | null = null;

  select(cols: string): this {
    this.selectClause = "SELECT " + cols;
    return this;
  }

  from(table: string): this {
    this.fromClause = "FROM " + table;
    return this;
  }

  where(cond: string): this {
    this.whereClauses.push(cond);
    return this;
  }

  orderBy(col: string, dir: "ASC" | "DESC" = "ASC"): this {
    this.orderByClause = "ORDER BY " + col + " " + dir;
    return this;
  }

  limit(n: number): this {
    this.limitClause = n;
    return this;
  }

  build(): string {
    const parts: string[] = [this.selectClause, this.fromClause];
    if (this.whereClauses.length > 0) {
      parts.push("WHERE " + this.whereClauses.join(" AND "));
    }
    if (this.orderByClause) parts.push(this.orderByClause);
    if (this.limitClause !== null) parts.push("LIMIT " + this.limitClause);
    return parts.join(" ");
  }
}

const sql = new QueryBuilder()
  .select("id, name, email")
  .from("users")
  .where("age >= 18")
  .where("status = 'active'")
  .orderBy("created_at", "DESC")
  .limit(10)
  .build();

console.log("生成的 SQL:");
console.log("  " + sql);

// ============ 9. 模式选择速查表 ============
console.log("\\n========== 9. 模式选择速查表 ==========");

const patternGuide: { pattern: string; scenario: string }[] = [
  { pattern: "单例", scenario: "全局唯一实例（配置/日志/连接池）" },
  { pattern: "简单工厂", scenario: "根据参数创建几种相关对象" },
  { pattern: "工厂方法", scenario: "产品类型会扩展，子类决定创建" },
  { pattern: "抽象工厂", scenario: "创建一系列相关产品（产品族）" },
  { pattern: "观察者", scenario: "一对多通知（事件/响应式）" },
  { pattern: "策略", scenario: "消除 switch，运行时切换算法" },
  { pattern: "装饰器", scenario: "动态叠加职责（比继承灵活）" },
  { pattern: "适配器", scenario: "兼容旧接口/第三方 SDK" },
  { pattern: "命令", scenario: "需要撤销/队列/日志的请求" },
  { pattern: "建造者", scenario: "复杂对象分步构建（链式）" },
];

console.log("场景 -> 模式:");
for (const g of patternGuide) {
  console.log("  " + g.pattern.padEnd(8) + " <- " + g.scenario);
}

console.log("\\n设计模式章节演示完成！");`,
  },

  // =========================================================
  // 第二章：状态机与状态管理
  // =========================================================
  {
    id: "ts-state-machine",
    title: "状态机与状态管理",
    icon: "🔁",
    group: "实战",
    content: `## 状态机与状态管理

**有限状态机（Finite State Machine, FSM）** 是建模"对象在不同状态间流转"的经典工具。一个状态机在任何时刻只处于一个状态，事件触发状态转换。前端表单、订单流程、协议解析、UI 加载态、游戏 AI 都能用状态机清晰建模。TypeScript 的**可辨识联合（Discriminated Union）** 是实现类型安全状态机的杀手锏——编译器能保证你处理了所有状态、所有非法转换都被拒绝。本章极其详细地讲透 FSM 概念、可辨识联合实现、reducer 模式、XState 思想、层次状态机。

### 1. 有限状态机基础

#### 核心概念

| 概念 | 说明 | 例子（订单） |
| --- | --- | --- |
| 状态 (State) | 对象在某一时刻的"模式" | 待支付、已支付、已发货 |
| 事件 (Event) | 触发状态变化的输入 | 支付、发货、取消 |
| 转换 (Transition) | 状态 + 事件 -> 新状态 | (待支付, 支付) -> 已支付 |
| 初始状态 | 启动时的状态 | 待支付 |
| 终止状态 | 不可再转换的状态 | 已签收、已取消 |
| 上下文 (Context) | 与状态关联的数据 | 订单金额、物流单号 |

#### 状态转换图（订单流程）

\`\`\`
   ┌─────────┐  支付  ┌─────────┐  发货  ┌─────────┐ 签收 ┌─────────┐
   │ 待支付   │ ────▶ │ 已支付   │ ────▶ │ 已发货   │ ───▶ │ 已签收   │ (终态)
   └────┬────┘        └────┬────┘        └─────────┘      └─────────┘
        │ 取消              │ 取消
        ▼                   ▼
   ┌─────────┐        ┌─────────┐
   │ 已取消   │ (终态) │ 已退款   │ (终态)
   └─────────┘        └─────────┘
\`\`\`

#### 为什么要用状态机

1. **显式建模**：把隐式的 \`status\` 字符串变成清晰的图，避免遗漏分支。
2. **拒绝非法转换**：从"已签收"再"发货"是不可能的，状态机能拒绝。
3. **类型安全**：可辨识联合让编译器检查所有状态分支。
4. **可测试**：状态机是纯函数（state + event -> state），易测试。
5. **可视化**：状态图能自动生成文档。

### 2. 用可辨识联合实现类型安全状态机

#### 可辨识联合回顾

\`\`\`ts
type OrderState =
  | { status: "pending"; amount: number }
  | { status: "paid"; amount: number; paidAt: Date }
  | { status: "shipped"; amount: number; trackingNo: string };
\`\`\`

每个分支都有共同的 \`status\` 字段（判别器），但其他字段不同。TS 在 \`switch (state.status)\` 后能**收窄**类型，访问对应分支的专属字段。

#### 状态机的类型设计

\`\`\`ts
// 状态：可辨识联合
type OrderState =
  | { status: "pending"; amount: number }
  | { status: "paid"; amount: number; paidAt: string }
  | { status: "shipped"; amount: number; trackingNo: string }
  | { status: "received" }
  | { status: "cancelled"; reason: string };

// 事件：也是可辨识联合
type OrderEvent =
  | { type: "PAY" }
  | { type: "SHIP"; trackingNo: string }
  | { type: "RECEIVE" }
  | { type: "CANCEL"; reason: string };

// 转换函数：纯函数 (state, event) -> state
function reduceOrder(state: OrderState, event: OrderEvent): OrderState {
  switch (state.status) {
    case "pending":
      if (event.type === "PAY") {
        return { status: "paid", amount: state.amount, paidAt: new Date().toISOString() };
      }
      if (event.type === "CANCEL") {
        return { status: "cancelled", reason: event.reason };
      }
      break;
    case "paid":
      if (event.type === "SHIP") {
        return { status: "shipped", amount: state.amount, trackingNo: event.trackingNo };
      }
      if (event.type === "CANCEL") {
        return { status: "cancelled", reason: event.reason };
      }
      break;
    case "shipped":
      if (event.type === "RECEIVE") {
        return { status: "received" };
      }
      break;
    case "received":
    case "cancelled":
      // 终态，不处理任何事件
      break;
  }
  // 非法转换：返回原状态（或抛错）
  return state;
}
\`\`\`

这里的关键：**TS 编译器会强制你在 switch 里处理所有状态**（如果开了 \`switchCase\` 检查），且 \`event\` 的字段访问会被收窄到合法分支。

### 3. Reducer 模式

状态机的转换函数 \`(state, event) -> state\` 正是 Redux 的 reducer 形态。Redux 本质就是一个巨大的状态机。

\`\`\`ts
type Action = { type: "INCREMENT" } | { type: "DECREMENT" } | { type: "RESET"; to: number };
type CounterState = { count: number };

function counterReducer(state: CounterState, action: Action): CounterState {
  switch (action.type) {
    case "INCREMENT": return { count: state.count + 1 };
    case "DECREMENT": return { count: state.count - 1 };
    case "RESET": return { count: action.to };
  }
}
\`\`\`

Reducer 三原则：
1. **纯函数**：相同输入永远相同输出，无副作用。
2. **不可变**：返回新状态，不修改原状态。
3. **单一来源**：所有状态变化都过 reducer。

### 4. XState 概念

XState 是 JS 最流行的状态机库。核心概念：

- **Machine**：状态机的定义（状态 + 事件 + 转换）。
- **State**：当前状态。
- **Context**：扩展数据（与状态分离）。
- **Guard**：转换的条件（如"金额 > 100 才能分期"）。
- **Action**：进入/离开状态时执行的副作用。
- **Service**：运行中的状态机实例，可发送事件、订阅状态。

XState 用对象描述状态图，运行时解释执行。TS 项目里能对状态/事件做严格类型约束。

### 5. 状态机在 UI 中的应用

UI 加载流程是最典型的状态机：

\`\`\`ts
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };
\`\`\`

- \`idle -> loading\`：发起请求。
- \`loading -> success\`：请求成功。
- \`loading -> error\`：请求失败。
- \`error -> loading\`：重试。

用可辨识联合，TS 强制你 \`switch (state.status)\` 处理所有 4 种情况，避免"忘了处理 loading 导致白屏"。

### 6. 层次状态机（HSM）

普通 FSM 状态多了会爆炸。**层次状态机**让状态嵌套，子状态继承父状态的转换。

如"播放器"父状态包含"播放中/暂停中"子状态，父状态响应"停止"事件统一回到"待机"。

XState 支持层次状态：\`playing: { initial: "buffering", states: { buffering: {}, ready: {} } }\`。

### 7. 状态机 vs 普通状态管理

| 维度 | 普通状态（useState/变量） | 状态机 |
| --- | --- | --- |
| 合法状态 | 任意组合（可能非法） | 只能是预定义状态 |
| 转换约束 | 无 | 显式定义 |
| 类型安全 | 弱 | 强（可辨识联合） |
| 复杂度 | 低 | 中 |
| 适用场景 | 简单 UI | 复杂流程、协议、UI |

### 8. 陷阱与最佳实践

1. **终态别忘处理**：可辨识联合的 switch 里终态要显式 break，否则 fallthrough。
2. **非法转换的策略**：返回原状态？抛错？日志告警？根据业务定。生产推荐"日志 + 返回原状态"，开发模式抛错。
3. **副作用不放 reducer**：reducer 必须纯，副作用（发请求、写日志）用中间件或 effect。
4. **Context 与 State 分离**：状态机管"模式"，Context 管"数据"。混在一起会让状态数爆炸。
5. **状态爆炸时上层次状态机**：扁平 FSM 状态超过 10 个就该考虑分层。

### 本章小结

状态机用"状态 + 事件 + 转换"建模流程，可辨识联合让 TS 在编译期保证类型安全。下面代码实现订单状态机、红绿灯状态机、异步加载状态机，并演示 reducer 模式。`,
    code: `// ============================================================
// 状态机与状态管理 —— 代码演示
// 用可辨识联合 + reducer 模式实现类型安全状态机
// ============================================================

// ============ 1. 订单状态机 ============
console.log("========== 1. 订单状态机 ===========");

// 状态：可辨识联合，每个分支有 status 判别器
type OrderState =
  | { status: "pending"; amount: number; createdAt: string }
  | { status: "paid"; amount: number; paidAt: string }
  | { status: "shipped"; amount: number; trackingNo: string; shippedAt: string }
  | { status: "received"; receivedAt: string }
  | { status: "cancelled"; reason: string; cancelledAt: string };

// 事件：也是可辨识联合
type OrderEvent =
  | { type: "PAY" }
  | { type: "SHIP"; trackingNo: string }
  | { type: "RECEIVE" }
  | { type: "CANCEL"; reason: string };

// 转换是否合法的查询表
const validTransitions: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["received"],
  received: [],
  cancelled: [],
};

// 转换函数（reducer）：纯函数 (state, event) -> state
function reduceOrder(state: OrderState, event: OrderEvent): OrderState {
  switch (state.status) {
    case "pending": {
      // 待支付：可支付、可取消
      if (event.type === "PAY") {
        return { status: "paid", amount: state.amount, paidAt: new Date().toISOString() };
      }
      if (event.type === "CANCEL") {
        return {
          status: "cancelled",
          reason: event.reason,
          cancelledAt: new Date().toISOString(),
        };
      }
      break;
    }
    case "paid": {
      // 已支付：可发货、可取消（退款）
      if (event.type === "SHIP") {
        return {
          status: "shipped",
          amount: state.amount,
          trackingNo: event.trackingNo,
          shippedAt: new Date().toISOString(),
        };
      }
      if (event.type === "CANCEL") {
        return {
          status: "cancelled",
          reason: "用户退款: " + event.reason,
          cancelledAt: new Date().toISOString(),
        };
      }
      break;
    }
    case "shipped": {
      // 已发货：只能签收
      if (event.type === "RECEIVE") {
        return { status: "received", receivedAt: new Date().toISOString() };
      }
      break;
    }
    case "received":
    case "cancelled": {
      // 终态：不接受任何事件
      break;
    }
  }
  // 非法转换：返回原状态（实际项目可抛错或告警）
  console.log("  ⚠️ 非法转换被拒绝: " + state.status + " + " + event.type);
  return state;
}

// 状态机包装类：记录历史、校验
class OrderMachine {
  private current: OrderState;
  private history: { event: string; state: string; at: string }[] = [];

  constructor(initial: OrderState) {
    this.current = initial;
    this.history.push({ event: "(init)", state: initial.status, at: new Date().toISOString() });
  }

  send(event: OrderEvent): OrderState {
    const prev = this.current.status;
    this.current = reduceOrder(this.current, event);
    const next = this.current.status;
    if (prev !== next) {
      this.history.push({ event: event.type, state: next, at: new Date().toISOString() });
    }
    return this.current;
  }

  getState(): OrderState {
    return this.current;
  }

  canHandle(event: OrderEvent): boolean {
    // 简化判断：根据事件类型推断目标状态
    const targetMap: Record<string, string> = {
      PAY: "paid",
      SHIP: "shipped",
      RECEIVE: "received",
      CANCEL: "cancelled",
    };
    const target = targetMap[event.type];
    return validTransitions[this.current.status].includes(target);
  }

  printHistory(): void {
    console.log("状态流转历史:");
    for (const h of this.history) {
      console.log("  [" + h.event + "] -> " + h.state);
    }
  }
}

// 创建订单
const order = new OrderMachine({
  status: "pending",
  amount: 199.0,
  createdAt: new Date().toISOString(),
});

console.log("初始状态: " + order.getState().status);

// 尝试非法转换：还没支付就想发货
console.log("\\n尝试在待支付时发货:");
order.send({ type: "SHIP", trackingNo: "SF001" });
console.log("当前状态仍为: " + order.getState().status);

// 合法流程
console.log("\\n合法流程演示:");
order.send({ type: "PAY" });
console.log("支付后: " + order.getState().status);

order.send({ type: "SHIP", trackingNo: "SF123456" });
console.log("发货后: " + order.getState().status);
if (order.getState().status === "shipped") {
  console.log("物流单号: " + order.getState().trackingNo);
}

order.send({ type: "RECEIVE" });
console.log("签收后: " + order.getState().status);

order.printHistory();

// ============ 2. 红绿灯状态机 ============
console.log("\\n========== 2. 红绿灯状态机 ===========");

type LightState = "red" | "green" | "yellow";
type LightEvent = { type: "TICK" };

function reduceLight(state: LightState, event: LightEvent): LightState {
  if (event.type !== "TICK") return state;
  switch (state) {
    case "red":
      return "green";
    case "green":
      return "yellow";
    case "yellow":
      return "red";
  }
}

// 用计时器驱动（演示 6 个周期）
let light: LightState = "red";
console.log("红绿灯循环（每秒切换）:");
for (let i = 0; i < 6; i++) {
  console.log("  t=" + i + "s: " + light);
  light = reduceLight(light, { type: "TICK" });
}

// ============ 3. 异步加载状态机 ============
console.log("\\n========== 3. 异步加载状态机 ===========");

// 通用的异步状态：idle / loading / success / error
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

type AsyncEvent<T> =
  | { type: "FETCH" }
  | { type: "RESOLVE"; data: T }
  | { type: "REJECT"; error: string }
  | { type: "RESET" };

function reduceAsync<T>(state: AsyncState<T>, event: AsyncEvent<T>): AsyncState<T> {
  switch (state.status) {
    case "idle":
      if (event.type === "FETCH") return { status: "loading" };
      break;
    case "loading":
      if (event.type === "RESOLVE") return { status: "success", data: event.data };
      if (event.type === "REJECT") return { status: "error", error: event.error };
      break;
    case "success":
    case "error":
      if (event.type === "FETCH") return { status: "loading" };
      if (event.type === "RESET") return { status: "idle" };
      break;
  }
  return state;
}

// 演示一次完整的请求流程
let asyncState: AsyncState<{ users: string[] }> = { status: "idle" };

console.log("初始: " + asyncState.status);

asyncState = reduceAsync(asyncState, { type: "FETCH" });
console.log("发起请求: " + asyncState.status);

// 模拟请求成功
asyncState = reduceAsync(asyncState, { type: "RESOLVE", data: { users: ["Alice", "Bob"] } });
if (asyncState.status === "success") {
  console.log("成功: 拿到 " + asyncState.data.users.length + " 个用户");
}

// 演示失败场景
asyncState = reduceAsync(asyncState, { type: "FETCH" });
asyncState = reduceAsync(asyncState, { type: "REJECT", error: "网络超时" });
if (asyncState.status === "error") {
  console.log("失败: " + asyncState.error);
}

// 重试
asyncState = reduceAsync(asyncState, { type: "FETCH" });
asyncState = reduceAsync(asyncState, { type: "RESOLVE", data: { users: ["Alice"] } });
if (asyncState.status === "success") {
  console.log("重试成功: " + asyncState.data.users.join(", "));
}

// ============ 4. 带上下文的状态机 ============
console.log("\\n========== 4. 带上下文的状态机 ===========");

// 状态机管"模式"，Context 管"数据"
interface CounterContext {
  count: number;
  history: number[];
}

type CounterState =
  | { status: "active" }
  | { status: "frozen"; frozenAt: number };

type CounterEvent =
  | { type: "INC" }
  | { type: "DEC" }
  | { type: "FREEZE" }
  | { type: "UNFREEZE" };

interface CounterMachine {
  state: CounterState;
  context: CounterContext;
}

function reduceCounter(machine: CounterMachine, event: CounterEvent): CounterMachine {
  const { state, context } = machine;

  switch (state.status) {
    case "active": {
      if (event.type === "INC") {
        const newCount = context.count + 1;
        return {
          state,
          context: { count: newCount, history: [...context.history, newCount] },
        };
      }
      if (event.type === "DEC") {
        const newCount = context.count - 1;
        return {
          state,
          context: { count: newCount, history: [...context.history, newCount] },
        };
      }
      if (event.type === "FREEZE") {
        return { state: { status: "frozen", frozenAt: context.count }, context };
      }
      break;
    }
    case "frozen": {
      if (event.type === "UNFREEZE") {
        return { state: { status: "active" }, context };
      }
      // 冻结时 INC/DEC 无效
      break;
    }
  }
  return machine;
}

let counter: CounterMachine = {
  state: { status: "active" },
  context: { count: 0, history: [] },
};

console.log("初始: state=" + counter.state.status + " count=" + counter.context.count);

counter = reduceCounter(counter, { type: "INC" });
counter = reduceCounter(counter, { type: "INC" });
counter = reduceCounter(counter, { type: "INC" });
console.log("三次 INC: count=" + counter.context.count);

counter = reduceCounter(counter, { type: "FREEZE" });
console.log("冻结: state=" + counter.state.status + " frozenAt=" + (counter.state.status === "frozen" ? counter.state.frozenAt : "—"));

// 冻结时 INC 无效
counter = reduceCounter(counter, { type: "INC" });
console.log("冻结时 INC: count 仍为 " + counter.context.count);

counter = reduceCounter(counter, { type: "UNFREEZE" });
counter = reduceCounter(counter, { type: "DEC" });
console.log("解冻后 DEC: count=" + counter.context.count);

console.log("操作历史: " + counter.context.history.join(" -> "));

// ============ 5. 状态图可视化 ============
console.log("\\n========== 5. 状态图可视化 ===========");

// 把订单状态机的转换表打印出来
const orderTransitions: { from: string; event: string; to: string }[] = [
  { from: "pending", event: "PAY", to: "paid" },
  { from: "pending", event: "CANCEL", to: "cancelled" },
  { from: "paid", event: "SHIP", to: "shipped" },
  { from: "paid", event: "CANCEL", to: "cancelled" },
  { from: "shipped", event: "RECEIVE", to: "received" },
];

console.log("订单状态机转换表:");
console.log("  当前状态".padEnd(12) + "事件".padEnd(10) + "下一状态");
console.log("  " + "-".repeat(36));
for (const t of orderTransitions) {
  console.log("  " + t.from.padEnd(12) + t.event.padEnd(10) + t.to);
}

console.log("\\n状态机章节演示完成！");`,
  },

  // =========================================================
  // 第三章：真实世界类型设计
  // =========================================================
  {
    id: "ts-real-world",
    title: "真实世界类型设计",
    icon: "🌍",
    group: "实战",
    content: `## 真实世界类型设计

理论学再多，落不到真实场景就是空谈。真实业务里，**类型设计**直接决定代码可维护性。API 响应怎么标、数据库实体怎么分创建/更新、表单怎么标输入与验证、配置怎么标环境变量、事件怎么标契约、插件怎么标扩展点——每一类都有套路。本章极其详细地讲透 8 个真实场景的类型设计，每个都有完整接口与代码示例。

### 1. API 响应类型设计

#### 成功/失败分页统一

API 响应最忌讳"成功返回 data，失败返回 error"两种结构混用，调用方 \`if (res.data)\` 既丑又危险。统一用可辨识联合：

\`\`\`ts
// 通用响应：成功或失败
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

// 分页响应
type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}>;
\`\`\`

调用方：

\`\`\`ts
const res: ApiResponse<User> = await fetchUser();
if (res.success) {
  console.log(res.data.name); // 收窄到 success 分支
} else {
  console.log(res.error.message); // 收窄到 error 分支
}
\`\`\`

#### 为什么不用 \`{ data?: T; error?: Error }\`

| 方案 | 优点 | 缺点 |
| --- | --- | --- |
| 可辨识联合 \`{ success, data }\` | 类型安全、必填字段对 | 写法稍长 |
| 可选字段 \`{ data?, error? }\` | 写法短 | 调用方要 \`if (res.data)\`，类型不收窄 |

可辨识联合让"成功必有 data，失败必有 error"在编译期就保证，是更优解。

### 2. 数据库实体类型

#### Entity / CreateDTO / UpdateDTO 区分

数据库里的实体有完整字段（含 id、createdAt），但创建时没有 id（数据库生成），更新时只有部分字段。混淆会导致"创建时传了 id"的低级错误。

\`\`\`ts
// 完整实体（数据库行）
interface UserEntity {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// 创建 DTO：没有 id/createdAt/updatedAt（DB 生成）
type UserCreateDTO = Omit<UserEntity, "id" | "createdAt" | "updatedAt">;

// 更新 DTO：所有字段可选（部分更新）
type UserUpdateDTO = Partial<UserCreateDTO>;

// 查询条件：组合查询
type UserQuery = Partial<Pick<UserEntity, "id" | "name" | "email">> & {
  createdAtAfter?: string;
  createdAtBefore?: string;
};
\`\`\`

用 \`Omit\` / \`Partial\` / \`Pick\` 从 Entity 派生 DTO，保证改 Entity 时 DTO 自动同步。

### 3. 表单类型设计

#### 三阶段：输入 / 验证 / 提交

表单字段在三个阶段类型不同：输入时是 \`string\`（来自 input），验证后是强类型，提交时是干净 DTO。

\`\`\`ts
// 原始输入：全 string（HTML input 都返回 string）
interface LoginFormInput {
  email: string;
  password: string;
  remember: string; // "on" | undefined
}

// 验证后：类型已转换
interface LoginFormValidated {
  email: string; // 已校验格式
  password: string; // 已校验长度
  remember: boolean;
}

// 提交 DTO：可能加密密码
interface LoginFormSubmit {
  email: string;
  passwordHash: string;
  remember: boolean;
}
\`\`\`

#### 验证器类型

\`\`\`ts
type Validator<T> = (value: T) => string | null; // 返回错误信息或 null

const emailValidator: Validator<string> = (v) =>
  /\\S+@\\S+\\.\\S+/.test(v) ? null : "邮箱格式错误";

interface FieldConfig<T> {
  initial: T;
  validate: Validator<T>;
}
\`\`\`

### 4. 配置类型设计

#### 环境变量

环境变量都是 \`string | undefined\`，直接用要到处判空。最佳实践：**在启动时校验并解析成强类型 Config**。

\`\`\`ts
interface AppConfig {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  logLevel: "debug" | "info" | "warn" | "error";
  features: {
    newDashboard: boolean;
    betaApi: boolean;
  };
}

function loadConfig(env: NodeJS.ProcessEnv): AppConfig {
  const port = Number(env.PORT);
  if (!Number.isFinite(port)) throw new Error("PORT 必须是数字");
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL 必填");
  // ...
  return { port, databaseUrl: env.DATABASE_URL, /* ... */ };
}
\`\`\`

#### 特性开关（Feature Flags）

\`\`\`ts
type FeatureFlag = "newDashboard" | "betaApi" | "darkMode";
type FeatureConfig = Record<FeatureFlag, boolean>;
\`\`\`

### 5. 事件系统类型设计

事件系统的难点是"事件名与 payload 类型对应"。用**映射类型 + 泛型约束**解决：

\`\`\`ts
interface EventMap {
  "user:login": { userId: string; at: string };
  "user:logout": { userId: string };
  "order:created": { orderId: string; amount: number };
}

class TypedEmitter<E extends Record<string, unknown>> {
  on<K extends keyof E>(event: K, fn: (payload: E[K]) => void): void { /* ... */ }
  emit<K extends keyof E>(event: K, payload: E[K]): void { /* ... */ }
}
\`\`\`

\`K extends keyof E\` 让 \`emit("user:login", { userId: "u1", at: "..." })\` 类型安全，传错 payload 编译失败。

### 6. 插件系统类型设计

插件系统的关键：**定义扩展点（Hook）**，让插件能注册、被宿主调用。

\`\`\`ts
// 插件接口
interface EditorPlugin {
  name: string;
  // 钩子：可选实现
  onInit?(editor: Editor): void;
  onPaste?(text: string): string;
  onSave?(content: string): void;
}

// 插件宿主
class Editor {
  private plugins: EditorPlugin[] = [];
  use(plugin: EditorPlugin) { this.plugins.push(plugin); plugin.onInit?.(this); }

  paste(text: string) {
    // 链式调用所有 onPaste，每个可改 text
    let t = text;
    for (const p of this.plugins) if (p.onPaste) t = p.onPaste(t);
    // ...
  }
}
\`\`\`

### 7. 类型安全的路由系统

Express/Koa 的路由 \`req.params: any\` 是类型黑洞。设计类型安全路由：

\`\`\`ts
interface RouteParams {
  "/users/:id": { id: string };
  "/posts/:postId/comments/:commentId": { postId: string; commentId: string };
}

function getParam<P extends keyof RouteParams>(path: P): RouteParams[P] { /* ... */ }
\`\`\`

### 8. DTO 与 Entity 转换

DTO 与 Entity 字段名常不同（DB 下划线、JS 驼峰），转换函数需要类型约束：

\`\`\`ts
function toDTO<E, D>(entity: E, mapper: (e: E) => D): D {
  return mapper(entity);
}
\`\`\`

### 9. 真实场景对比表

| 场景 | 错误做法 | 正确做法 |
| --- | --- | --- |
| API 响应 | \`{ data?, error? }\` | 可辨识联合 \`{ success, data }\` |
| DB 实体 | 一个 \`User\` 接口管所有 | Entity / CreateDTO / UpdateDTO 分离 |
| 表单 | \`{ age: number }\` 一开始就 number | Input / Validated / Submit 三阶段 |
| 配置 | \`process.env.PORT\` 到处用 | 启动时 loadConfig 校验 |
| 事件 | \`emit(name: string, data: any)\` | EventMap + \`K extends keyof E\` |
| 插件 | \`plugin.hook?.(data)\` 任意 | 接口定义所有 Hook |

### 10. 陷阱与最佳实践

1. **DTO 派生自 Entity**：用 \`Omit/Partial/Pick\` 派生，改一处自动同步。
2. **不要在前端类型里暴露 DB 字段**：如 \`createdAt\` 改名 \`created_at\` 会泄露实现。
3. **API 响应成功/失败必互斥**：可辨识联合强制保证。
4. **配置校验放启动时**：fail fast，别等运行时才崩。
5. **事件契约集中定义**：\`interface EventMap\` 放一处，前后端共享。

### 本章小结

真实世界的类型设计核心是**用可辨识联合、派生类型、映射类型把业务约束编译期化**。下面代码实现完整的 API 类型系统、表单验证、事件总线、插件系统。`,
    code: `// ============================================================
// 真实世界类型设计 —— 代码演示
// 实现 API 响应、DB 实体、表单、配置、事件、插件系统
// ============================================================

// ============ 1. API 响应类型系统 ============
console.log("========== 1. API 响应类型系统 ===========");

// 通用响应：成功或失败（可辨识联合）
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: unknown } };

// 分页响应
type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}>;

// 业务实体
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
}

// 模拟 API 函数
function fetchUser(id: number): ApiResponse<User> {
  if (id <= 0) {
    return {
      success: false,
      error: { code: "INVALID_ID", message: "id 必须为正数", details: { provided: id } },
    };
  }
  if (id > 100) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "用户不存在" },
    };
  }
  return {
    success: true,
    data: { id, name: "用户" + id, email: "user" + id + "@example.com", role: "user" },
  };
}

function fetchUsers(page: number, pageSize: number): PaginatedResponse<User> {
  const total = 250;
  const start = (page - 1) * pageSize;
  if (start >= total) {
    return {
      success: false,
      error: { code: "PAGE_OUT_OF_RANGE", message: "页码超出范围" },
    };
  }
  const items: User[] = [];
  for (let i = 0; i < Math.min(pageSize, total - start); i++) {
    items.push({
      id: start + i + 1,
      name: "用户" + (start + i + 1),
      email: "user" + (start + i + 1) + "@example.com",
      role: "user",
    });
  }
  return {
    success: true,
    data: {
      items,
      total,
      page,
      pageSize,
      hasMore: start + items.length < total,
    },
  };
}

// 调用并处理响应
function handleUserResponse(res: ApiResponse<User>): void {
  if (res.success) {
    // 收窄到 success 分支，data 一定存在
    console.log("  ✅ 用户: " + res.data.name + " <" + res.data.email + "> 角色:" + res.data.role);
  } else {
    // 收窄到 error 分支
    console.log("  ❌ 错误[" + res.error.code + "]: " + res.error.message);
  }
}

console.log("查 id=1:");
handleUserResponse(fetchUser(1));
console.log("查 id=-5（非法）:");
handleUserResponse(fetchUser(-5));
console.log("查 id=999（不存在）:");
handleUserResponse(fetchUser(999));

console.log("\\n分页查询 page=1, pageSize=5:");
const page1 = fetchUsers(1, 5);
if (page1.success) {
  console.log("  总数: " + page1.data.total + "，本页 " + page1.data.items.length + " 条");
  console.log("  第一条: " + page1.data.items[0].name);
  console.log("  还有更多: " + page1.data.hasMore);
}

// ============ 2. 数据库实体与 DTO ============
console.log("\\n========== 2. 数据库实体与 DTO ===========");

// 完整实体（DB 行）
interface UserEntity {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
  createdAt: string;
  updatedAt: string;
}

// 创建 DTO：省略 DB 自动生成字段
type UserCreateDTO = Omit<UserEntity, "id" | "createdAt" | "updatedAt">;

// 更新 DTO：所有字段可选
type UserUpdateDTO = Partial<UserCreateDTO>;

// 查询条件
type UserQuery = Partial<Pick<UserEntity, "id" | "name" | "email" | "role">> & {
  createdAtAfter?: string;
  createdAtBefore?: string;
};

// 模拟 DB
const userDb: UserEntity[] = [];

function createUser(dto: UserCreateDTO): UserEntity {
  const now = new Date().toISOString();
  const entity: UserEntity = {
    id: userDb.length + 1,
    ...dto,
    createdAt: now,
    updatedAt: now,
  };
  userDb.push(entity);
  return entity;
}

function updateUser(id: number, dto: UserUpdateDTO): UserEntity | null {
  const idx = userDb.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  userDb[idx] = { ...userDb[idx], ...dto, updatedAt: new Date().toISOString() };
  return userDb[idx];
}

function queryUsers(q: UserQuery): UserEntity[] {
  return userDb.filter((u) => {
    if (q.id !== undefined && u.id !== q.id) return false;
    if (q.name !== undefined && u.name !== q.name) return false;
    if (q.email !== undefined && u.email !== q.email) return false;
    if (q.role !== undefined && u.role !== q.role) return false;
    if (q.createdAtAfter !== undefined && u.createdAt < q.createdAtAfter) return false;
    if (q.createdAtBefore !== undefined && u.createdAt > q.createdAtBefore) return false;
    return true;
  });
}

// 创建（DTO 无 id/createdAt，TS 编译期就会拒绝传这些字段）
const u1 = createUser({ name: "Alice", email: "alice@x.com", role: "admin" });
const u2 = createUser({ name: "Bob", email: "bob@x.com", role: "user" });
console.log("创建 Alice:", u1.id, u1.name);
console.log("创建 Bob:", u2.id, u2.name);

// 更新（部分字段）
const updated = updateUser(1, { email: "alice@new.com" });
console.log("更新 Alice 邮箱:", updated ? updated.email : "未找到");

// 查询
const admins = queryUsers({ role: "admin" });
console.log("查询 admin 角色: " + admins.map((u) => u.name).join(", "));

// ============ 3. 表单验证类型系统 ============
console.log("\\n========== 3. 表单验证类型系统 ===========");

// 验证器
type Validator<T> = (value: T) => string | null;
type FieldErrors<T> = Partial<Record<keyof T, string>>;

interface FieldConfig<T> {
  initial: T;
  validate: Validator<T>;
}

// 登录表单配置
interface LoginForm {
  email: string;
  password: string;
}

const loginFormConfig: Record<keyof LoginForm, FieldConfig<string>> = {
  email: {
    initial: "",
    validate: (v) => (/^\\S+@\\S+\\.\\S+$/.test(v) ? null : "邮箱格式错误"),
  },
  password: {
    initial: "",
    validate: (v) => (v.length >= 6 ? null : "密码至少 6 位"),
  },
};

// 通用表单验证函数
function validateForm<F extends Record<string, unknown>>(
  values: F,
  config: Record<keyof F, FieldConfig<F[keyof F]>>
): FieldErrors<F> {
  const errors: FieldErrors<F> = {};
  for (const key in config) {
    const err = config[key].validate(values[key]);
    if (err) errors[key] = err;
  }
  return errors;
}

// 测试
const testData: LoginForm[] = [
  { email: "alice@example.com", password: "123456" },
  { email: "invalid-email", password: "123" },
  { email: "bob@x.com", password: "abc" },
];

for (const data of testData) {
  const errors = validateForm(data, loginFormConfig);
  const hasError = Object.keys(errors).length > 0;
  console.log("表单 " + JSON.stringify(data) + ":");
  if (hasError) {
    for (const field in errors) {
      console.log("  ❌ " + field + ": " + errors[field]);
    }
  } else {
    console.log("  ✅ 验证通过，可提交");
  }
}

// ============ 4. 配置加载（启动校验）============
console.log("\\n========== 4. 配置加载 ===========");

interface AppConfig {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  logLevel: "debug" | "info" | "warn" | "error";
  features: {
    newDashboard: boolean;
    betaApi: boolean;
  };
}

function loadConfig(env: Record<string, string | undefined>): AppConfig {
  const errors: string[] = [];

  // 端口
  const port = Number(env.PORT);
  if (!Number.isFinite(port) || port < 1 || port > 65535) {
    errors.push("PORT 必须是 1-65535 的数字");
  }

  // 必填字符串
  if (!env.DATABASE_URL) errors.push("DATABASE_URL 必填");
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 8) {
    errors.push("JWT_SECRET 必填且至少 8 位");
  }

  // 枚举
  const validLogLevels = ["debug", "info", "warn", "error"];
  if (!env.LOG_LEVEL || !validLogLevels.includes(env.LOG_LEVEL)) {
    errors.push("LOG_LEVEL 必须是 " + validLogLevels.join("/"));
  }

  // 布尔特性开关
  const parseBool = (v: string | undefined, def: boolean): boolean => {
    if (v === undefined) return def;
    return v === "true" || v === "1";
  };

  if (errors.length > 0) {
    throw new Error("配置错误:\\n  " + errors.join("\\n  "));
  }

  return {
    port,
    databaseUrl: env.DATABASE_URL!,
    jwtSecret: env.JWT_SECRET!,
    logLevel: env.LOG_LEVEL as AppConfig["logLevel"],
    features: {
      newDashboard: parseBool(env.FEATURE_NEW_DASHBOARD, false),
      betaApi: parseBool(env.FEATURE_BETA_API, false),
    },
  };
}

// 测试正常配置
const goodEnv = {
  PORT: "3000",
  DATABASE_URL: "postgres://localhost/mydb",
  JWT_SECRET: "supersecret",
  LOG_LEVEL: "info",
  FEATURE_NEW_DASHBOARD: "true",
  FEATURE_BETA_API: "false",
};

try {
  const config = loadConfig(goodEnv);
  console.log("✅ 配置加载成功:");
  console.log("  port:", config.port);
  console.log("  databaseUrl:", config.databaseUrl);
  console.log("  logLevel:", config.logLevel);
  console.log("  features:", JSON.stringify(config.features));
} catch (e) {
  console.log("❌ " + (e as Error).message);
}

// 测试错误配置
console.log("\\n测试错误配置:");
const badEnv = {
  PORT: "abc",
  DATABASE_URL: undefined,
  JWT_SECRET: "short",
  LOG_LEVEL: "verbose",
};

try {
  loadConfig(badEnv);
} catch (e) {
  console.log("❌ 启动失败:");
  console.log((e as Error).message);
}

// ============ 5. 类型安全事件总线 ============
console.log("\\n========== 5. 类型安全事件总线 ===========");

interface EventMap {
  "user:login": { userId: string; at: string };
  "user:logout": { userId: string };
  "order:created": { orderId: string; amount: number };
}

class TypedEmitter<E extends Record<string, unknown>> {
  private listeners: { [K in keyof E]?: ((p: E[K]) => void)[] } = {};

  on<K extends keyof E>(event: K, fn: (p: E[K]) => void): void {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event]!.push(fn);
  }

  emit<K extends keyof E>(event: K, payload: E[K]): void {
    const arr = this.listeners[event];
    if (!arr) return;
    for (const fn of arr.slice()) {
      try {
        fn(payload);
      } catch (e) {
        console.error("事件处理异常:", (e as Error).message);
      }
    }
  }
}

const emitter = new TypedEmitter<EventMap>();

emitter.on("user:login", (p) => {
  console.log("  [登录] " + p.userId + " at " + p.at);
});
emitter.on("order:created", (p) => {
  console.log("  [订单] " + p.orderId + " 金额 " + p.amount);
});

// 类型安全：payload 必须匹配
emitter.emit("user:login", { userId: "u001", at: new Date().toISOString() });
emitter.emit("order:created", { orderId: "o001", amount: 199.0 });

// ============ 6. 插件系统 ============
console.log("\\n========== 6. 插件系统 ===========");

interface EditorPlugin {
  name: string;
  onInit?(): void;
  onPaste?(text: string): string;
  onSave?(content: string): void;
}

class Editor {
  private content = "";
  private plugins: EditorPlugin[] = [];

  use(plugin: EditorPlugin): void {
    this.plugins.push(plugin);
    plugin.onInit?.();
    console.log("  加载插件: " + plugin.name);
  }

  paste(text: string): void {
    let t = text;
    for (const p of this.plugins) {
      if (p.onPaste) t = p.onPaste(t);
    }
    this.content += t;
    console.log("  粘贴后内容: '" + this.content + "'");
  }

  save(): void {
    for (const p of this.plugins) {
      p.onSave?.(this.content);
    }
    console.log("  保存内容: '" + this.content + "'");
  }
}

// 插件1：去除 HTML 标签
const htmlStripPlugin: EditorPlugin = {
  name: "html-stripper",
  onPaste(text) {
    return text.replace(/<[^>]+>/g, "");
  },
};

// 插件2：自动保存日志
const autoSavePlugin: EditorPlugin = {
  name: "auto-save",
  onSave(content) {
    console.log("    [auto-save] 已记录 " + content.length + " 字符");
  },
};

// 插件3：初始化欢迎
const welcomePlugin: EditorPlugin = {
  name: "welcome",
  onInit() {
    console.log("    [welcome] 编辑器初始化完成");
  },
};

const editor = new Editor();
editor.use(welcomePlugin);
editor.use(htmlStripPlugin);
editor.use(autoSavePlugin);

console.log("\\n粘贴带 HTML 的文本:");
editor.paste("<b>Hello</b> <i>World</i>");

editor.save();

console.log("\\n真实世界类型设计章节演示完成！");`,
  },

  // =========================================================
  // 第四章：性能优化
  // =========================================================
  {
    id: "ts-performance",
    title: "性能优化",
    icon: "🚀",
    group: "实战",
    content: `## 性能优化

TypeScript 的性能分三个维度：**编译性能**（tsc 编译速度）、**运行时性能**（生成 JS 的执行速度）、**构建性能**（打包工具的速度）。还有开发者体验维度：**IDE 响应速度**。本章极其详细地讲透每个维度的优化手段、原理、量化对比，以及大型项目的类型检查策略。

### 1. 编译性能优化

#### 1.1 tsc 为什么慢

tsc 是纯 TS 实现的单线程编译器，慢在：

1. **类型检查**：每改一处类型，可能触发全局类型图重算。
2. **文件数**：项目越大，要检查的文件越多，线性增长。
3. **类型复杂度**：深度递归的条件类型、巨型联合，单个类型展开可能耗百毫秒。
4. **第三方 .d.ts**：\`node_modules/@types\` 里动辄几万行声明，全量加载慢。

#### 1.2 tsconfig 优化项

| 选项 | 作用 | 建议值 |
| --- | --- | --- |
| \`skipLibCheck\` | 跳过 .d.ts 文件的类型检查 | true（必开） |
| \`incremental\` | 增量编译，缓存 .tsbuildinfo | true |
| \`composite\` | 项目引用必需，配合 incremental | 子项目开 |
| \`isolatedModules\` | 每文件独立编译，配合 esbuild | true |
| \`types\` | 限制全局 types 只加载指定的 | \`["node"]\` |
| \`diagnostics\` | 输出编译耗时明细 | 调试时开 |
| \`strict\` | 严格模式（与性能无关，但影响代码量） | true |

\`\`\`json
{
  "compilerOptions": {
    "skipLibCheck": true,        // 跳过 .d.ts 检查，能省 30-60% 时间
    "incremental": true,         // 增量编译
    "isolatedModules": true,     // 单文件可编译
    "types": ["node"],           // 只加载 node 类型，不要全量
    "strict": true
  }
}
\`\`\`

#### 1.3 项目引用（Project References）

大型 monorepo 把代码拆成多个子项目，每个子项目独立 tsconfig，主项目用 \`references\` 引用。改动一个子项目只重编它和它的依赖，不重编全部。

\`\`\`json
// tsconfig.json（根）
{
  "files": [],
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/server" },
    { "path": "./packages/client" }
  ]
}

// packages/server/tsconfig.json
{
  "compilerOptions": { "composite": true, "outDir": "dist" },
  "references": [{ "path": "../shared" }]
}
\`\`\`

配合 \`tsc --build\` 走增量构建。

### 2. 类型复杂度与编译速度

#### 2.1 类型体操的代价

深度递归的条件类型、巨型联合、模板字面量类型会显著拖慢编译。极端例子：一个 50 层递归的类型展开能花几百毫秒。

\`\`\`ts
// ❌ 慢：50 层递归
type DeepFlatten<T> = T extends Array<infer U> ? DeepFlatten<U> : T;

// ❌ 慢：巨型联合
type AllKeys = keyof SomeHugeObject; // 几千个 key

// ✅ 快：用 const 断言 + 简单工具类型
\`\`\`

#### 2.2 类型复杂度量化

| 类型构造 | 编译耗时 | 建议 |
| --- | --- | --- |
| 简单 interface/类型别名 | 极低 | 随意用 |
| \`keyof\` / \`typeof\` | 低 | 安全 |
| 联合（< 20 个分支） | 低 | 安全 |
| 条件类型 1-2 层 | 中 | 谨慎 |
| 条件类型 5+ 层 | 高 | 避免 |
| 模板字面量类型展开 | 高 | 避免大集合 |
| 递归类型 | 极高 | 严控深度 |

#### 2.3 避免过度类型体操

1. **能写函数就别写类型**：\`function parse(s) { return JSON.parse(s) }\` 比 \`type Parsed<T> = ...\` 简单且快。
2. **拆分巨型类型**：把 1000 行的 \`type\` 拆成几个小 \`type\`。
3. **避免 \`infer\` 链**：\`infer\` 嵌套难展开，能用 \`typeof\` 替代就替代。
4. **用 \`const\` 断言替代字面量联合推导**。

### 3. 运行时性能

#### 3.1 类型擦除无开销

TS 编译后所有类型注解被擦除，运行时是纯 JS，**类型本身零开销**。

\`\`\`ts
// 编译前
function add(a: number, b: number): number { return a + b; }
// 编译后（ES2020）
function add(a, b) { return a + b; }
\`\`\`

所以"TS 比 JS 慢"是误解。运行时性能取决于生成的 JS 代码质量，与类型无关。

#### 3.2 影响运行时的写法

| 写法 | 运行时影响 |
| --- | --- |
| \`enum\`（非 const） | 生成对象，有少量开销 |
| \`const enum\` | 内联，零开销 |
| \`class\` 装饰器 | 元数据反射开销 |
| 频繁的 \`Object.assign\` | 浅拷贝开销 |
| 大量 \`as const\` | 零开销（编译期） |

#### 3.3 优先 const enum

\`\`\`ts
// ❌ 普通 enum 生成对象
enum Color { Red, Green, Blue }
// 编译为: var Color; (function(Color){ Color[Color.Red=0]="Red"; ... })(Color||{});

// ✅ const enum 内联
const enum Color2 { Red, Green, Blue }
// 编译为内联常量 0/1/2，零对象
\`\`\`

注意：\`isolatedModules\` 下不能用 const enum（需 babel/swc 时改用 union）。

### 4. 构建性能（Bundlers）

#### 4.1 转译器选择

| 工具 | 速度 | 类型检查 | 适用 |
| --- | --- | --- | --- |
| tsc | 慢（1x） | 是 | 严格场景 |
| esbuild | 极快（100x） | 否（只转译） | 开发热更新 |
| swc | 极快（70x） | 否（只转译） | Next.js 默认 |
| babel + @babel/preset-typescript | 中 | 否 | 老项目 |

**最佳实践**：开发用 esbuild/swc 只转译不检查（快），CI 用 tsc 单独跑类型检查（准）。

#### 4.2 turbo / nx 缓存

monorepo 用 turbo 缓存构建结果：相同输入哈希命中缓存直接读产物，CI 时间从 10 分钟降到 1 分钟。

### 5. IDE 响应优化

#### 5.1 IDE 慢的原因

- **ts-server**：VSCode 用 tsserver 做语言服务，大项目会卡。
- **大文件**：单文件超过 3000 行 tsserver 明显卡。
- **复杂类型**：hover 一个巨型条件类型会卡几百毫秒。

#### 5.2 优化手段

1. **拆大文件**：单文件控制在 1000 行内。
2. **关 \`typescript.tsserver.experimental.enableEarly\` 等**实验功能慎重开。
3. **用 \`include\` 限制 ts-server 范围**：避免它扫描 node_modules。
4. **升级 TS 版本**：每个版本都有性能改进。
5. **用 Volar 替代 tsserver**（Vue 项目）。

### 6. memory 使用

| 操作 | 内存影响 |
| --- | --- |
| 加载大型 .d.ts | 几十 MB |
| 增量编译缓存 | 几十 MB（.tsbuildinfo） |
| 项目引用 | 每个子项目独立 tsserver |

### 7. 大型项目类型检查策略

1. **CI 分层检查**：先检查 \`packages/shared\`，再 \`packages/server\`，避免一处错全卡。
2. **类型检查与转译分离**：开发不检查（esbuild 转），CI 用 \`tsc --noEmit\` 检查。
3. **预提交只检查改动文件**：lint-staged + tsc --noEmit --project 改动文件。
4. **类型覆盖率**：用 \`type-coverage\` 工具统计，逐步降低 any 比例。

### 8. 性能陷阱清单

1. **过度类型体操**：递归 > 10 层、联合 > 100 分支，编译慢 10 倍。
2. **未开 skipLibCheck**：白白检查 @types。
3. **单文件过大**：> 5000 行 tsserver 卡。
4. **未开 incremental**：每次全量编译。
5. **const enum 在 isolatedModules**：会报错。
6. **开发模式跑 tsc**：慢，应改 esbuild。
7. **monorepo 不用项目引用**：改一处重编全部。

### 本章小结

TS 性能优化三层：编译期（skipLibCheck/incremental/项目引用）、构建期（esbuild/swc/turbo 缓存）、运行期（类型擦除无开销，注意 const enum）。下面代码模拟编译耗时测量、对比类型复杂度、实现构建缓存。`,
    code: `// ============================================================
// 性能优化 —— 代码演示
// 模拟编译耗时测量、类型复杂度对比、构建缓存实现
// ============================================================

// ============ 1. 编译耗时测量 ============
console.log("========== 1. 编译耗时测量 ===========");

// 模拟一个简易的"类型检查器"耗时模型
// 真实 tsc 的耗时与文件数、类型复杂度、第三方 d.ts 数量相关

interface CompileMetrics {
  files: number;
  typeComplexity: number; // 1-10
  thirdPartyDecls: number;
  skipLibCheck: boolean;
  incremental: boolean;
  estimatedMs: number;
}

function estimateCompileTime(cfg: {
  files: number;
  typeComplexity: number;
  thirdPartyDecls: number;
  skipLibCheck: boolean;
  incremental: boolean;
}): CompileMetrics {
  // 基础耗时：每文件 2ms
  let base = cfg.files * 2;

  // 类型复杂度系数：1-10，影响系数 1x-5x
  const complexityFactor = 1 + (cfg.typeComplexity - 1) * 0.4;
  base *= complexityFactor;

  // 第三方声明：未 skipLibCheck 时全量检查
  if (!cfg.skipLibCheck) {
    base += cfg.thirdPartyDecls * 0.5; // 每行声明 0.5ms
  } else {
    base += cfg.thirdPartyDecls * 0.02; // skip 后仅加载元数据
  }

  // 增量编译：只重编改动文件（假设 10% 改动）
  if (cfg.incremental) {
    base *= 0.3; // 70% 缩减
  }

  return { ...cfg, estimatedMs: Math.round(base) };
}

const scenarios: { name: string; cfg: Omit<CompileMetrics, "estimatedMs"> }[] = [
  {
    name: "小型项目（未优化）",
    cfg: { files: 50, typeComplexity: 3, thirdPartyDecls: 5000, skipLibCheck: false, incremental: false },
  },
  {
    name: "小型项目（优化后）",
    cfg: { files: 50, typeComplexity: 3, thirdPartyDecls: 5000, skipLibCheck: true, incremental: true },
  },
  {
    name: "大型项目（未优化）",
    cfg: { files: 2000, typeComplexity: 7, thirdPartyDecls: 50000, skipLibCheck: false, incremental: false },
  },
  {
    name: "大型项目（优化后）",
    cfg: { files: 2000, typeComplexity: 7, thirdPartyDecls: 50000, skipLibCheck: true, incremental: true },
  },
];

console.log("编译耗时估算对比:");
console.log("  场景".padEnd(24) + "估算耗时");
console.log("  " + "-".repeat(40));
for (const s of scenarios) {
  const m = estimateCompileTime(s.cfg);
  const timeStr = m.estimatedMs > 1000 ? (m.estimatedMs / 1000).toFixed(2) + "s" : m.estimatedMs + "ms";
  console.log("  " + s.name.padEnd(24) + timeStr);
}

// ============ 2. 类型复杂度对比 ============
console.log("\\n========== 2. 类型复杂度对比 ===========");

// 测量不同类型推导的耗时（用 Object.keys 模拟类型展开成本）

// 简单类型
interface SimpleUser {
  id: number;
  name: string;
}

// 中等类型
interface MediumUser {
  id: number;
  name: string;
  email: string;
  age: number;
  role: string;
  address: {
    city: string;
    street: string;
    zip: string;
  };
  tags: string[];
}

// 复杂类型（模拟大型联合）
type ComplexStatus = "idle" | "loading" | "success" | "error" | "cancelled" | "pending" | "approved" | "rejected";

interface ComplexUser {
  id: number;
  status: ComplexStatus;
  profile: {
    basic: { name: string; age: number; gender: "m" | "f" | "o" };
    contact: { email: string; phone: string; address: string };
    preferences: { theme: "light" | "dark"; lang: "zh" | "en" | "ja" };
  };
  permissions: string[];
  meta: Record<string, unknown>;
}

// 模拟"类型展开"耗时：通过运行时反射大对象的 key 遍历
function measureTypeExpansion<T>(obj: T, iterations: number): number {
  const start = Date.now();
  for (let i = 0; i < iterations; i++) {
    // 模拟 TS 内部遍历类型树
    JSON.stringify(obj); // 序列化触发完整遍历
  }
  return Date.now() - start;
}

const simple: SimpleUser = { id: 1, name: "Alice" };
const medium: MediumUser = {
  id: 1, name: "Alice", email: "a@x.com", age: 30, role: "admin",
  address: { city: "SH", street: "Main", zip: "200000" }, tags: ["a", "b"],
};
const complex: ComplexUser = {
  id: 1, status: "active" as ComplexStatus,
  profile: {
    basic: { name: "Alice", age: 30, gender: "f" },
    contact: { email: "a@x.com", phone: "123", address: "SH" },
    preferences: { theme: "dark", lang: "zh" },
  },
  permissions: ["read", "write", "admin"],
  meta: { k1: "v1", k2: "v2", k3: "v3" },
};

const ITER = 10000;
const t1 = measureTypeExpansion(simple, ITER);
const t2 = measureTypeExpansion(medium, ITER);
const t3 = measureTypeExpansion(complex, ITER);

console.log("类型展开耗时对比（" + ITER + " 次迭代）:");
console.log("  简单类型:  " + t1 + "ms");
console.log("  中等类型:  " + t2 + "ms");
console.log("  复杂类型:  " + t3 + "ms");
console.log("  复杂/简单比: " + (t3 / Math.max(t1, 1)).toFixed(1) + "x");
console.log("  💡 类型越复杂，tsc 内部展开越慢，IDE hover 也越卡");

// ============ 3. skipLibCheck 效果模拟 ============
console.log("\\n========== 3. skipLibCheck 效果 ===========");

// 模拟第三方 .d.ts 文件
interface DeclFile {
  name: string;
  lines: number;
  checked: boolean;
}

function genThirdPartyDecls(count: number): DeclFile[] {
  const decls: DeclFile[] = [];
  const libs = ["lodash", "express", "react", "axios", "moment", "rxjs", "uuid", "qs"];
  for (let i = 0; i < count; i++) {
    const lib = libs[i % libs.length];
    decls.push({
      name: "@types/" + lib + "/index.d.ts",
      lines: 1000 + (i * 137) % 3000,
      checked: false,
    });
  }
  return decls;
}

function checkWithoutSkipLibCheck(decls: DeclFile[]): { time: number; checkedLines: number } {
  const start = Date.now();
  let lines = 0;
  for (const d of decls) {
    // 模拟每行 0.05ms 检查
    lines += d.lines;
  }
  // 模拟耗时（缩放避免真等几秒）
  const elapsed = Math.round(lines * 0.005);
  return { time: elapsed, checkedLines: lines };
}

function checkWithSkipLibCheck(decls: DeclFile[]): { time: number; loadedLines: number } {
  const start = Date.now();
  let lines = 0;
  for (const d of decls) {
    // 只加载元数据，不检查
    lines += 10; // 每文件只读 10 行元数据
  }
  const elapsed = Math.round(lines * 0.005);
  return { time: elapsed, loadedLines: lines };
}

const decls = genThirdPartyDecls(20);
const without = checkWithoutSkipLibCheck(decls);
const withSkip = checkWithSkipLibCheck(decls);

console.log("第三方声明文件: " + decls.length + " 个");
console.log("未开 skipLibCheck:");
console.log("  检查行数: " + without.checkedLines + " 行");
console.log("  估算耗时: " + without.time + "ms");
console.log("开启 skipLibCheck:");
console.log("  加载行数: " + withSkip.loadedLines + " 行（仅元数据）");
console.log("  估算耗时: " + withSkip.time + "ms");
console.log("  加速比: " + (without.time / Math.max(withSkip.time, 1)).toFixed(1) + "x");

// ============ 4. 增量编译缓存模拟 ============
console.log("\\n========== 4. 增量编译缓存 ===========");

// 模拟 .tsbuildinfo 缓存
interface BuildCache {
  [file: string]: {
    hash: string;
    mtime: number;
    deps: string[];
  };
}

class IncrementalCompiler {
  private cache: BuildCache = {};
  private fileContents: Record<string, { content: string; mtime: number }> = {};
  private totalCompiles = 0;
  private skippedCompiles = 0;

  // 简易 hash
  private hash(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) | 0;
    }
    return h.toString(16);
  }

  setFile(path: string, content: string, mtime: number): void {
    this.fileContents[path] = { content, mtime };
  }

  compile(paths: string[]): { compiled: string[]; skipped: string[] } {
    const compiled: string[] = [];
    const skipped: string[] = [];

    for (const path of paths) {
      this.totalCompiles++;
      const file = this.fileContents[path];
      if (!file) continue;

      const currentHash = this.hash(file.content);
      const cached = this.cache[path];

      if (cached && cached.hash === currentHash && cached.mtime === file.mtime) {
        // 哈希命中且 mtime 未变，跳过
        skipped.push(path);
        this.skippedCompiles++;
      } else {
        // 需要重编译
        compiled.push(path);
        this.cache[path] = { hash: currentHash, mtime: file.mtime, deps: [] };
      }
    }

    return { compiled, skipped };
  }

  stats(): { total: number; skipped: number; hitRate: string } {
    return {
      total: this.totalCompiles,
      skipped: this.skippedCompiles,
      hitRate: ((this.skippedCompiles / Math.max(this.totalCompiles, 1)) * 100).toFixed(1) + "%",
    };
  }
}

const compiler = new IncrementalCompiler();
const files = ["src/index.ts", "src/utils.ts", "src/auth.ts", "src/db.ts"];

// 首次编译：全部 miss
files.forEach((f, i) => {
  compiler.setFile(f, "content of " + f + " v1", Date.now() + i);
});

console.log("首次编译:");
let result = compiler.compile(files);
console.log("  编译: " + result.compiled.length + " 个文件");
console.log("  跳过: " + result.skipped.length + " 个文件");

// 第二次：未改动，全部命中
console.log("\\n第二次编译（未改动）:");
result = compiler.compile(files);
console.log("  编译: " + result.compiled.length + " 个文件");
console.log("  跳过: " + result.skipped.length + " 个文件");

// 第三次：只改一个文件
console.log("\\n第三次编译（只改 src/utils.ts）:");
compiler.setFile("src/utils.ts", "content of src/utils.ts v2", Date.now() + 100);
result = compiler.compile(files);
console.log("  编译: " + result.compiled.length + " 个文件 -> " + result.compiled.join(", "));
console.log("  跳过: " + result.skipped.length + " 个文件");

const stats = compiler.stats();
console.log("\\n缓存统计:");
console.log("  总编译次数: " + stats.total);
console.log("  命中跳过: " + stats.skipped);
console.log("  命中率: " + stats.hitRate);

// ============ 5. const enum vs enum 性能 ============
console.log("\\n========== 5. const enum vs enum ===========");

// 普通 enum：编译为对象
enum Color {
  Red = 0,
  Green = 1,
  Blue = 2,
}

// const enum：编译期内联
const enum Color2 {
  Red = 0,
  Green = 1,
  Blue = 2,
}

// 模拟编译产物对比
console.log("普通 enum Color 编译产物:");
console.log("  var Color;");
console.log("  (function (Color) {");
console.log("    Color[Color['Red'] = 0] = 'Red';");
console.log("    Color[Color['Green'] = 1] = 'Green';");
console.log("    Color[Color['Blue'] = 2] = 'Blue';");
console.log("  })(Color || (Color = {}));");

console.log("\\nconst enum Color2 编译产物:");
console.log("  // 直接内联为字面量 0/1/2，无对象生成");

// 运行时验证
console.log("\\n运行时使用:");
console.log("  Color.Red =", Color.Red);
console.log("  Color2.Red =", Color2.Red); // 转译为 0
console.log("  Color[0] =", Color[0]); // 反向映射

// ============ 6. 性能优化清单 ============
console.log("\\n========== 6. 性能优化清单 ===========");

const checklist: { category: string; item: string; impact: string }[] = [
  { category: "编译", item: "开启 skipLibCheck", impact: "节省 30-60%" },
  { category: "编译", item: "开启 incremental", impact: "增量编译快 70%" },
  { category: "编译", item: "monorepo 用项目引用", impact: "改一处不全编" },
  { category: "编译", item: "限制 types 只加载必要的", impact: "减少全局声明" },
  { category: "类型", item: "避免 > 10 层递归类型", impact: "防止编译卡死" },
  { category: "类型", item: "巨型联合拆分", impact: "降低展开成本" },
  { category: "构建", item: "开发用 esbuild/swc 转译", impact: "100x 加速" },
  { category: "构建", item: "CI 单独跑 tsc --noEmit", impact: "类型检查与构建分离" },
  { category: "构建", item: "turbo 缓存", impact: "CI 命中缓存秒级" },
  { category: "运行时", item: "类型擦除无开销", impact: "运行时不慢" },
  { category: "运行时", item: "用 const enum 替代 enum", impact: "零对象开销" },
  { category: "IDE", item: "单文件 < 1000 行", impact: "tsserver 流畅" },
  { category: "IDE", item: "升级 TS 版本", impact: "每版有优化" },
];

console.log("类别".padEnd(8) + "优化项".padEnd(28) + "收益");
console.log("  " + "-".repeat(56));
for (const c of checklist) {
  console.log("  " + c.category.padEnd(8) + c.item.padEnd(28) + c.impact);
}

console.log("\\n性能优化章节演示完成！");`,
  },

  // =========================================================
  // 第五章：最佳实践与避坑指南
  // =========================================================
  {
    id: "ts-best-practices",
    title: "最佳实践与避坑指南",
    icon: "💎",
    group: "实战",
    content: `## 最佳实践与避坑指南

学完语法、类型系统、工程化、实战模式，最后一章把"踩过的坑"和"沉淀的规范"汇成清单。本章极其详细地讲透类型设计原则、any 的安全替代、strict 模式实践、命名约定、类型导入、避免类型体操过度、团队协作、常见陷阱（结构化类型/类型断言/协变逆变/null 检查/枚举 vs 联合）。

### 1. 类型设计原则

#### 1.1 精确而非宽泛

类型要尽可能精确，让非法状态在编译期就无法表达。

\`\`\`ts
// ❌ 宽泛：任何字符串都行
function setAge(age: number) { /* age 可能是负数、小数 */ }

// ✅ 精确：限定范围
type Age = number & { __brand: "Age" }; // 品牌类型
function setAge(age: Age) { /* 编译期保证是合法年龄 */ }

// ❌ 宽泛：status 是任意 string
interface Order { status: string }

// ✅ 精确：联合字面量
interface Order { status: "pending" | "paid" | "shipped" | "received" | "cancelled" }
\`\`\`

#### 1.2 组合而非继承

继承层级深了难维护。优先用**组合**（小接口 + 类型交集）。

\`\`\`ts
// ❌ 深继承
class Animal { }
class Dog extends Animal { }
class ServiceDog extends Dog { }

// ✅ 组合
interface Barker { bark(): void }
interface Walker { walk(): void }
type ServiceDog = Barker & Walker & { assist(): void };
\`\`\`

#### 1.3 让非法状态不可表达

"Make illegal states unrepresentable"——类型设计的最高境界。

\`\`\`ts
// ❌ 合法但无意义的状态可能存在
interface Meeting {
  start: Date;
  end: Date;
} // start > end 也合法

// ✅ 构造函数校验
class Meeting {
  constructor(readonly start: Date, readonly end: Date) {
    if (start >= end) throw new Error("start 必须早于 end");
  }
}
\`\`\`

### 2. any 的安全替代

\`any\` 关闭类型检查，是 TS 最大敌人。但有些场景确实"不知道类型"，怎么办？有 4 种安全替代：

| 替代 | 适用 | 示例 |
| --- | --- | --- |
| \`unknown\` | 真不知道类型，需手动收窄 | \`JSON.parse\` 返回 |
| 泛型 | 调用方决定类型 | \`identity<T>(x: T): T\` |
| 函数重载 | 同名不同参不同返回 | \`createElement\` |
| 条件类型 | 根据输入推输出 | \`type Unbox<T> = T extends Box<infer U> ? U : T\` |

#### unknown vs any

\`\`\`ts
// ❌ any：随便用，编译过但运行时崩
function parse1(s: string): any { return JSON.parse(s); }
const r1 = parse1('{"a":1}');
r1.b.c; // 编译过，运行时 TypeError

// ✅ unknown：必须先收窄
function parse2(s: string): unknown { return JSON.parse(s); }
const r2 = parse2('{"a":1}');
// r2.b; // ❌ 编译错误：r2 是 unknown
if (typeof r2 === "object" && r2 && "a" in r2) {
  console.log(r2.a); // ✅ 收窄后可用
}
\`\`\`

### 3. strict 模式最佳实践

\`strict: true\` 打开一组严格检查：\`noImplicitAny\` / \`strictNullChecks\` / \`strictFunctionTypes\` / \`strictBindCallApply\` / \`strictPropertyInitialization\` / \`alwaysStrict\` / \`noImplicitThis\` / \`useUnknownInCatchVariables\`。

#### strictNullChecks 最重要

\`\`\`ts
// 未开：null/undefined 可赋给任何类型
let x: number = null; // 不报错
x.toFixed(); // 运行时 TypeError

// 开启后：必须显式包含 null
let x: number | null = null;
x.toFixed(); // ❌ 编译错误：x 可能是 null
if (x !== null) x.toFixed(); // ✅ 收窄后可用
\`\`\`

#### useUnknownInCatchVariables

\`\`\`ts
// 旧：catch (e) e 是 any
try { } catch (e) { e.code; } // 编译过但 e 可能没 code

// 新（strict）：e 是 unknown
try { } catch (e) {
  // e.code; // ❌ 编译错误
  if (e instanceof Error) e.message; // ✅ 收窄
}
\`\`\`

### 4. 命名约定

#### 4.1 泛型参数

| 参数 | 含义 | 例子 |
| --- | --- | --- |
| \`T\` | Type（通用） | \`identity<T>(x: T)\` |
| \`U\` | 第二个 Type | \`map<T, U>(arr: T[], fn: (x: T) => U)\` |
| \`K\` | Key（对象键） | \`Record<K, V>\` |
| \`V\` | Value（对象值） | \`Record<K, V>\` |
| \`E\` | Element（元素） | \`Array<E>\` |
| \`R\` | Return/Result | \`Promise<R>\` |

多参数时优先用语义化名字：\`<Item, Result>\` 比 \`<T, U>\` 清晰。

#### 4.2 前缀后缀

| 约定 | 含义 | 例子 |
| --- | --- | --- |
| \`I\` 前缀 | Interface（不推荐） | \`IUser\` |
| \`T\` 前缀 | Type（不推荐） | \`TUser\` |
| \`Props\` 后缀 | 组件属性 | \`ButtonProps\` |
| \`State\` 后缀 | 状态 | \`AppState\` |
| \`DTO\` 后缀 | 数据传输对象 | \`UserCreateDTO\` |
| \`Entity\` 后缀 | 数据库实体 | \`UserEntity\` |
| \`Event\` 后缀 | 事件 | \`LoginEvent\` |
| \`Handler\` 后缀 | 处理器 | \`ClickHandler\` |

**官方建议**：不用 \`I\`/\`T\` 前缀，直接用名字（\`User\` 而非 \`IUser\`）。

### 5. 类型导入最佳实践

#### 5.1 import type

\`\`\`ts
// ❌ 普通导入类型：isolatedModules 下不安全
import { User } from "./types";

// ✅ type 导入：明确是类型，编译时擦除
import type { User } from "./types";

// ✅ 内联 type
import { fetchUser, type User } from "./api";
\`\`\`

#### 5.2 为什么用 import type

- **isolatedModules 兼容**：每个文件独立编译，type 导入明确告诉编译器"这是类型，别保留"。
- **打包优化**：type 导入被编译器擦除，不进 bundle。
- **可读性**：一眼看出哪些是值导入、哪些是类型导入。

### 6. 避免类型体操过度

类型体操（type gymnastics）指用复杂条件类型、映射类型、递归类型实现强力推导。它强大但易过度：

\`\`\`ts
// 过度：用类型实现一个 SQL 解析器
type ParseSQL<S extends string> = ... // 200 行条件类型

// 务实：用函数 + 简单类型
function query<T>(sql: string, mapper: (row: Row) => T): T[] { /* ... */ }
\`\`\`

#### 何时该用类型体操

- 库作者：给用户提供极致类型推导（如 zod、tRPC）。
- 业务里**频繁复用**的模式：抽工具类型。
- 团队 TS 水平高、有文档。

#### 何时该避免

- 一次性代码：直接写函数。
- 团队不熟悉：维护成本高。
- 编译明显变慢：性能不可接受。

### 7. 团队协作

#### 7.1 共享类型

- **monorepo 共享**：\`packages/shared/types\` 放公共类型，子项目引用。
- **前后端共享**：用 OpenAPI 生成 TS 类型，或用 zod/tRPC 双向同步。
- **版本化**：类型变更走 semver，避免破坏下游。

#### 7.2 类型文档

复杂类型加 JSDoc：

\`\`\`ts
/**
 * 解析查询字符串为对象
 * @template T 字段类型映射
 * @param qs 查询字符串
 * @returns 解析后的对象
 */
function parseQuery<T extends Record<string, string>>(qs: string): T { /* ... */ }
\`\`\`

#### 7.3 Code Review 类型

review 时关注：
1. 是否有 \`any\`？能否换 \`unknown\`/泛型？
2. 是否有 \`!\` 非空断言？能否换类型守卫？
3. 类型是否精确？\`string\` 能否换联合字面量？
4. 公共 API 是否有 JSDoc？

### 8. 常见陷阱

#### 8.1 结构化类型

TS 是结构化类型（鸭子类型），不是名义类型。只要结构匹配就算同类型：

\`\`\`ts
interface User { name: string }
interface Admin { name: string }
const a: User = { name: "x" }; // Admin 类型的也能赋给 User
\`\`\`

陷阱：想区分两个结构相同的概念，需用**品牌类型**：

\`\`\`ts
type UserId = string & { __brand: "UserId" };
type OrderId = string & { __brand: "OrderId" };
// UserId 和 OrderId 不能互相赋值
\`\`\`

#### 8.2 类型断言

\`as\` 断言绕过类型检查，危险：

\`\`\`ts
const x = "hello" as number; // ❌ 编译过但运行时是 string
const y = "hello" as unknown as number; // 双重断言更危险
\`\`\`

替代：用类型守卫 \`if (typeof x === "number")\` 或 \`unknown\` + 收窄。

#### 8.3 协变逆变

函数参数是**逆变**的（子类型函数的参数要是父类型），返回值是**协变**的。TS 对函数参数默认双变（\`strictFunctionTypes\` 开启后逆变），容易踩坑：

\`\`\`ts
declare let f1: (x: Animal) => void;
declare let f2: (x: Dog) => void;
f1 = f2; // strictFunctionTypes 下报错：Dog 比 Animal 窄
\`\`\`

#### 8.4 null 检查

\`\`\`ts
// ❌ 误判：0、""、false 都被当成 falsy
if (x) { }

// ✅ 显式判断
if (x !== null && x !== undefined) { }
// 或
if (x != null) { } // 同时排除 null 和 undefined
\`\`\`

#### 8.5 enum vs 联合

\`\`\`ts
// enum：运行时有对象，可反向映射
enum Color { Red, Green }
// 但 isolatedModules 下 const enum 不可用，普通 enum 有运行时开销

// 联合字面量：编译期擦除，更轻
type Color = "red" | "green" | "blue";
\`\`\`

**推荐**：新项目优先联合字面量；需要反向映射或一组数值常量时用 enum。

### 9. 最佳实践速查表

| 场景 | 推荐 | 避免 |
| --- | --- | --- |
| 不知道类型 | \`unknown\` + 收窄 | \`any\` |
| 函数返回 | 泛型 \`<T>\` | \`any\` |
| 可能 null | \`T \| null\` + 守卫 | \`!\` 断言 |
| 多种返回 | 函数重载 | \`any\` 联合 |
| 区分概念 | 品牌类型 | 结构相同 |
| 类型导入 | \`import type\` | 普通 import |
| 枚举 | 联合字面量 | enum（除非需反向映射） |
| 公共 API | JSDoc | 裸类型 |
| 复杂推导 | 工具类型 + 注释 | 200 行条件类型 |

### 本章小结

TS 最佳实践核心：**精确类型、unknown 替代 any、strict 全开、import type、避免类型体操过度、品牌类型区分概念**。下面代码演示陷阱的运行时表现、any 替代方案对比、正反例对比。`,
    code: `// ============================================================
// 最佳实践与避坑指南 —— 代码演示
// 展示常见陷阱的运行时表现、any 替代方案、正反例对比
// ============================================================

// ============ 1. any 的危险 vs unknown 的安全 ============
console.log("========== 1. any vs unknown ===========");

// 模拟 JSON.parse 返回（真实返回 any）
function parseJson(s: string): unknown {
  return JSON.parse(s);
}

// ❌ any 风格：编译过但运行时崩
function dangerAny(s: string): any {
  return JSON.parse(s);
}

const data = parseJson('{"name":"Alice","age":30}');

// data.name; // ❌ 编译错误：data 是 unknown

// ✅ unknown + 类型守卫收窄
function safeAccess(obj: unknown): string | number {
  if (typeof obj === "object" && obj !== null) {
    if ("name" in obj && typeof (obj as any).name === "string") {
      return (obj as { name: string }).name;
    }
  }
  return "unknown";
}

console.log("安全访问 name:", safeAccess(data));

// 演示 any 的危险
console.log("\\n演示 any 的危险:");
const anyData = dangerAny('{"a":1}');
// anyData.b.c; // 编译过，运行时 TypeError: Cannot read property 'c' of undefined
try {
  // @ts-ignore 演示 any 危险
  const result = (anyData as any).b.c;
  console.log(result);
} catch (e) {
  console.log("  ❌ 运行时崩溃: " + (e as Error).message);
}

// ============ 2. unknown 收窄的几种方式 ============
console.log("\\n========== 2. unknown 收窄方式 ===========");

// typeof 收窄
function handleUnknown(v: unknown): string {
  if (typeof v === "string") {
    return "字符串: " + v.toUpperCase();
  }
  if (typeof v === "number") {
    return "数字: " + (v * 2);
  }
  if (typeof v === "boolean") {
    return "布尔: " + v;
  }
  return "未知类型";
}

console.log(handleUnknown("hello"));
console.log(handleUnknown(42));
console.log(handleUnknown(true));
console.log(handleUnknown(null));

// instanceof 收窄
class Dog { bark(): string { return "汪"; } }
class Cat { meow(): string { return "喵"; } }

function animalSound(v: unknown): string {
  if (v instanceof Dog) return v.bark();
  if (v instanceof Cat) return v.meow();
  return "无声音";
}

console.log("\\n" + animalSound(new Dog()));
console.log(animalSound(new Cat()));
console.log(animalSound("not animal"));

// in 操作符收窄
console.log("\\n对象属性收窄:");
function getUserName(v: unknown): string {
  if (typeof v === "object" && v !== null && "name" in v) {
    const name = (v as { name: unknown }).name;
    if (typeof name === "string") return name;
  }
  return "匿名";
}

console.log(getUserName({ name: "Bob" }));
console.log(getUserName({ age: 20 }));
console.log(getUserName(null));

// ============ 3. 品牌类型（Nominal Typing 模拟）============
console.log("\\n========== 3. 品牌类型 ===========");

// TS 是结构化类型，结构相同就算同类型
// 品牌类型用交叉类型 + 唯一标记模拟名义类型

type UserId = string & { readonly __brand: "UserId" };
type OrderId = string & { readonly __brand: "OrderId" };

// 构造函数：唯一创建品牌类型的方式
function createUserId(s: string): UserId {
  if (!/^u_\\d+$/.test(s)) throw new Error("UserId 格式应为 u_数字");
  return s as UserId;
}
function createOrderId(s: string): OrderId {
  if (!/^o_\\d+$/.test(s)) throw new Error("OrderId 格式应为 o_数字");
  return s as OrderId;
}

const uid = createUserId("u_001");
const oid = createOrderId("o_001");

console.log("UserId:", uid);
console.log("OrderId:", oid);

// ❌ 编译错误：UserId 不能赋给 OrderId（虽然都是 string）
// const wrong: OrderId = uid;

function findOrder(id: OrderId): string {
  return "找到订单 " + id;
}
console.log(findOrder(oid));
// findOrder(uid); // ❌ 编译错误

// 对比：未用品牌类型时
const plainUid: string = "u_001";
const plainOid: string = "o_001";
// 这两个可以互相赋值，没有任何保护
const mixedUp: string = plainUid; // 把 UserId 当 OrderId 用，编译过！
console.log("\\n未用品牌类型时（无保护）:", mixedUp);

// ============ 4. 类型断言的危险 ============
console.log("\\n========== 4. 类型断言危险 ===========");

// ❌ as 断言绕过检查
const value: unknown = "hello";
const asNum = value as number; // 编译过！但运行时是 string
console.log("as number 后实际类型:", typeof asNum); // string
console.log("尝试数学运算:", asNum + 100); // "hello100"（字符串拼接，不是数学）

// ❌ 双重断言更危险
const doubleCast = "hello" as unknown as number;
console.log("双重断言:", typeof doubleCast); // string

// ✅ 安全做法：类型守卫
function safeNumberCast(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string" && /^\\d+$/.test(v)) return Number(v);
  throw new Error("无法转为 number");
}

try {
  console.log("安全转换 '123':", safeNumberCast("123"));
  console.log("安全转换 456:", safeNumberCast(456));
  console.log("安全转换 'abc':", safeNumberCast("abc"));
} catch (e) {
  console.log("  ❌ " + (e as Error).message);
}

// ============ 5. null 检查陷阱 ============
console.log("\\n========== 5. null 检查陷阱 ===========");

// ❌ 误判 falsy：0、""、false 都被当成"无值"
function badCheck(x?: number): string {
  if (x) {
    // x 为 0 时进不来！
    return "有值: " + x;
  }
  return "无值";
}

console.log("badCheck(0):", badCheck(0)); // "无值" —— 错误！
console.log("badCheck(5):", badCheck(5));
console.log("badCheck(undefined):", badCheck(undefined));

// ✅ 显式判断
function goodCheck(x?: number): string {
  if (x !== null && x !== undefined) {
    return "有值: " + x;
  }
  return "无值";
}

console.log("\\ngoodCheck(0):", goodCheck(0)); // "有值: 0" —— 正确
console.log("goodCheck(undefined):", goodCheck(undefined));

// ✅ 简写：!= null 同时排除 null 和 undefined
function goodCheck2(x?: number): string {
  if (x != null) return "有值: " + x;
  return "无值";
}
console.log("\\ngoodCheck2(0):", goodCheck2(0));
console.log("goodCheck2(null):", goodCheck2(null as any));

// ============ 6. enum vs 联合字面量 ============
console.log("\\n========== 6. enum vs 联合字面量 ===========");

// enum：运行时有对象
enum StatusEnum {
  Pending = "pending",
  Active = "active",
  Inactive = "inactive",
}

// 联合字面量：编译期擦除
type StatusUnion = "pending" | "active" | "inactive";

// 对比运行时
console.log("enum 运行时:");
console.log("  typeof StatusEnum:", typeof StatusEnum); // object
console.log("  StatusEnum.Pending:", StatusEnum.Pending);
console.log("  反向映射 StatusEnum['pending']:", (StatusEnum as any)["pending"]);

console.log("\\n联合字面量运行时:");
const s: StatusUnion = "pending";
console.log("  typeof s:", typeof s); // string
console.log("  s:", s);

// 性能对比：enum 多一个对象
console.log("\\n推荐:");
console.log("  新项目 -> 联合字面量（轻量、isolatedModules 友好）");
console.log("  需反向映射/数值常量 -> enum");

// ============ 7. strictNullChecks 的价值 ============
console.log("\\n========== 7. strictNullChecks 价值 ===========");

interface User {
  id: number;
  name: string;
  email: string | null; // 可能没邮箱
}

function getEmail(user: User): string {
  // 未开 strictNullChecks：user.email 直接用，运行时可能 null
  // 开启后：必须处理 null
  if (user.email === null) {
    return "无邮箱";
  }
  return user.email; // 收窄后是 string
}

const users: User[] = [
  { id: 1, name: "Alice", email: "alice@x.com" },
  { id: 2, name: "Bob", email: null },
];

for (const u of users) {
  console.log(u.name + " 的邮箱: " + getEmail(u));
}

// ============ 8. import type 的价值 ============
console.log("\\n========== 8. import type 价值 ===========");

// 模拟：类型与值混合导出
// 真实场景：export interface User {} export function fetchUser(): Promise<User>

// 假设这是从 ./api 导入
interface ApiUser {
  id: number;
  name: string;
}

// 模拟运行时值
const apiModule = {
  fetchUser: function (): ApiUser {
    return { id: 1, name: "Alice" };
  },
};

// import type 后，编译产物只保留值导入
console.log("import type 编译产物对比:");
console.log("  普通导入: const { User, fetchUser } = require('./api');");
console.log("    -> User 是类型，运行时 undefined，但代码里还引用了");
console.log("  type 导入: const { fetchUser } = require('./api');");
console.log("    -> User 被擦除，不进 bundle");

const user = apiModule.fetchUser();
console.log("\\n调用 fetchUser:", user.name);

// ============ 9. 正反例对比：精确类型 ============
console.log("\\n========== 9. 精确类型 vs 宽泛类型 ===========");

// ❌ 宽泛
interface BadConfig {
  env: string; // 任何字符串都行
  port: number; // 任何数字都行
  logLevel: string; // 任何字符串都行
}

// ✅ 精确
type GoodEnv = "development" | "staging" | "production";
type GoodLogLevel = "debug" | "info" | "warn" | "error";

interface GoodConfig {
  env: GoodEnv;
  port: number; // 1-65535，可用品牌类型进一步约束
  logLevel: GoodLogLevel;
}

// 实际配置
const config: GoodConfig = {
  env: "production",
  port: 3000,
  logLevel: "info",
};

// ❌ 这种错误配置编译期就拒绝
// const badConfig: GoodConfig = {
//   env: "prod",  // ❌ 不在联合里
//   port: 99999,
//   logLevel: "verbose",  // ❌ 不在联合里
// };

console.log("✅ 精确配置:", JSON.stringify(config));

// 用品牌类型约束 port
type Port = number & { readonly __brand: "Port" };
function createPort(n: number): Port {
  if (n < 1 || n > 65535) throw new Error("端口必须在 1-65535");
  return n as Port;
}

try {
  const p1 = createPort(3000);
  console.log("合法端口:", p1);
  const p2 = createPort(99999);
} catch (e) {
  console.log("非法端口被拒: " + (e as Error).message);
}

// ============ 10. 最佳实践速查表 ============
console.log("\\n========== 10. 最佳实践速查表 ===========");

const practices: { scenario: string; good: string; bad: string }[] = [
  { scenario: "未知类型", good: "unknown + 守卫", bad: "any" },
  { scenario: "函数返回", good: "泛型 <T>", bad: "any" },
  { scenario: "可能 null", good: "T | null + 守卫", bad: "! 非空断言" },
  { scenario: "区分概念", good: "品牌类型", bad: "结构相同" },
  { scenario: "类型导入", good: "import type", bad: "普通 import" },
  { scenario: "枚举", good: "联合字面量", bad: "enum（除非需反向映射）" },
  { scenario: "状态字段", good: "联合字面量", bad: "string" },
  { scenario: "null 判断", good: "!= null", bad: "if (x)" },
  { scenario: "类型转换", good: "类型守卫", bad: "as 断言" },
  { scenario: "公共 API", good: "JSDoc 注释", bad: "裸类型" },
];

console.log("场景".padEnd(14) + "✅ 推荐".padEnd(20) + "❌ 避免");
console.log("  " + "-".repeat(54));
for (const p of practices) {
  console.log("  " + p.scenario.padEnd(14) + p.good.padEnd(20) + p.bad);
}

console.log("\\n最佳实践与避坑指南章节演示完成！");
console.log("=== TypeScript 实战篇 9 章节全部结束 ===");`,
  },
];
