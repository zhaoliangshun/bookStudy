// =============================================================
// TypeScript 全解 · Batch 7：面向对象（5 章）
// -------------------------------------------------------------
// 本 batch 覆盖 TypeScript 面向对象编程的完整链路：
//   1. 类与继承           tsbook-class-basic
//   2. 访问修饰符         tsbook-access-modifier
//   3. 抽象类与接口实现   tsbook-abstract-class
//   4. 装饰器             tsbook-decorator
//   5. Mixin 模式         tsbook-mixin
// 章节归属 group：面向对象
// =============================================================

export const chapters = [
  // ===========================================================
  // 第 1 章：类与继承
  // ===========================================================
  {
    id: "tsbook-class-basic",
    title: "类与继承",
    icon: "🐾",
    group: "面向对象",
    content: `# 🐾 类与继承

TypeScript 的 class 在 JS class 基础上加了**类型层**的强力约束——这就是为什么用 TS 写面向对象比 JS 更安全、更工程化。

## 一、TS class 相比 JS class 的增强

JS 的 class 靠"约定"维持类型，TS 的 class 靠"编译器"强制类型：

| 维度 | JS class | TS class |
|------|---------|---------|
| 属性声明 | 在构造函数里直接 \`this.x = 1\` | **必须先在类里声明**字段 |
| 属性类型 | 无 | 显式标注 |
| 方法参数 | 无类型 | 显式标注 |
| 修饰符 | 无 | \`public\`/\`private\`/\`protected\`/\`readonly\` |
| 编译期检查 | 无 | 全部检查 |

\`\`\`ts
// ❌ JS 风格在 TS 里直接报错
class Bad {
  constructor() {
    this.name = "Alice";  // ❌ TS 报错：name 未声明
  }
}

// ✅ TS 风格：先声明字段
class Good {
  name: string;            // 必须先声明
  constructor() {
    this.name = "Alice";   // 再赋值
  }
}
\`\`\`

**字段必须先声明**这条规则，是 TS class 和 JS class 最大的差别。

## 二、属性、方法、构造函数

\`\`\`ts
class Person {
  // 字段声明
  name: string;
  age: number = 0;            // 声明并初始化

  // 构造函数
  constructor(name: string) {
    this.name = name;
  }

  // 方法
  greet(): string {
    return \`Hello, I'm \${this.name}\`;
  }
}
\`\`\`

字段可以在声明处给默认值（\`age: number = 0\`），也可以在构造函数里赋值。

## 三、参数属性：构造函数简写

\`\`\`ts
class Person {
  constructor(public name: string, public age: number) {}
  // 等价于：
  //   class Person {
  //     public name: string;
  //     public age: number;
  //     constructor(name: string, age: number) {
  //       this.name = name;
  //       this.age = age;
  //     }
  //   }
}
\`\`\`

给构造函数参数加修饰符（\`public\`/\`private\`/\`protected\`/\`readonly\`），TS 自动生成同名字段并赋值——一行顶三行。

## 四、继承 \`extends\` 和 \`super\`

\`\`\`ts
class Animal {
  constructor(public name: string) {}
  speak(): string { return \`\${this.name} makes a sound\`; }
}

class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name);                 // 必须先调用 super()
  }
  speak(): string {             // 重写父类方法
    return \`\${this.name} says: 汪汪\`;
  }
}
\`\`\`

子类构造函数里**必须先调用 \`super()\`** 才能使用 \`this\`。这是 ES6 继承的硬规则，TS 完全继承。

## 五、方法重写与 \`super.method()\`

\`\`\`ts
class Cat extends Animal {
  speak(): string {
    return super.speak() + " (喵)";   // 调用父类方法再加工
  }
}
\`\`\`

子类重写方法时，可以通过 \`super.method()\` 复用父类逻辑——和 Java/C# 完全一样。

## 六、\`instanceof\` 与原型链

\`\`\`ts
const d = new Dog("旺财", "柴犬");
d instanceof Dog;     // true
d instanceof Animal;  // true（Dog 继承自 Animal）
\`\`\`

\`instanceof\` 沿原型链向上查找，能识别继承关系。

## 七、小结

- TS class 强制声明字段，编译期挡住大量运行时错误
- 参数属性是构造函数的"简写糖"
- \`extends\` 实现继承，子类构造函数必须先 \`super()\`
- 方法可重写，可用 \`super.method()\` 复用父类逻辑

> *下一章，深入访问修饰符：\`public\`/\`private\`/\`protected\`/\`readonly\` 和 \`#\` 私有字段。*`,
    code: `// 🐾 类与继承 Demo

// ============================================================
// 1️⃣ 基础类：属性、方法、构造函数
// ============================================================

class Person {
  // 字段声明：TS 必须先声明，不像 JS 可以直接 this.x
  name: string;
  age: number = 0;            // 声明 + 默认值

  // 构造函数
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  // 方法
  greet(): string {
    return "Hello, I'm " + this.name + ", " + this.age + " years old";
  }
}

const p = new Person("Alice", 30);
console.log("--- 1️⃣ Person ---");
console.log(p.greet());

// ============================================================
// 2️⃣ 参数属性：构造函数参数简写
// ============================================================

// 在构造函数参数前加 public，TS 自动生成同名字段
class User {
  constructor(
    public id: number,        // 自动生成 public id 字段
    public name: string,      // 自动生成 public name 字段
    public email: string,     // 自动生成 public email 字段
  ) {}

  toString(): string {
    return "[User #" + this.id + "] " + this.name + " <" + this.email + ">";
  }
}

const u = new User(1, "Bob", "bob@example.com");
console.log("--- 2️⃣ 参数属性 ---");
console.log(u.toString());
console.log("u.name =", u.name);     // 公开字段可直接访问

// ============================================================
// 3️⃣ 继承 extends：Animal 与 Dog
// ============================================================

class Animal {
  constructor(public name: string) {}     // 参数属性

  speak(): string {
    return this.name + " makes a sound";
  }

  eat(food: string): string {
    return this.name + " is eating " + food;
  }
}

class Dog extends Animal {
  constructor(
    name: string,
    public breed: string,     // 子类新增字段
  ) {
    super(name);               // ✅ 必须先调用 super()
    // 这里之后才能用 this
  }

  // 重写父类方法
  speak(): string {
    return this.name + " says: 汪汪！";
  }

  // 子类独有方法
  fetch(): string {
    return this.breed + " " + this.name + " 去捡球了";
  }
}

console.log("--- 3️⃣ 继承 ---");
const dog = new Dog("旺财", "柴犬");
console.log("dog.speak() =", dog.speak());      // 重写后的版本
console.log("dog.eat()   =", dog.eat("骨头"));    // 继承自父类
console.log("dog.fetch() =", dog.fetch());       // 子类独有

// ============================================================
// 4️⃣ super.method()：复用父类逻辑
// ============================================================

class Cat extends Animal {
  constructor(name: string) {
    super(name);
  }

  // 重写时调用父类方法
  speak(): string {
    const base = super.speak();        // 调用 Animal.speak()
    return base + " (然后喵了一声)";
  }
}

console.log("--- 4️⃣ super.method ---");
const cat = new Cat("小黑");
console.log("cat.speak() =", cat.speak());

// ============================================================
// 5️⃣ 多层继承
// ============================================================

class GuideDog extends Dog {
  constructor(name: string, breed: string, public owner: string) {
    super(name, breed);               // 调用 Dog 的构造函数
  }

  guide(): string {
    return this.name + " 正在引导 " + this.owner;
  }
}

console.log("--- 5️⃣ 多层继承 ---");
const guide = new GuideDog("Lucky", "拉布拉多", "张三");
console.log("guide.speak() =", guide.speak());    // 继承自 Dog
console.log("guide.fetch() =", guide.fetch());     // 继承自 Dog
console.log("guide.guide() =", guide.guide());     // 自己的方法

// ============================================================
// 6️⃣ instanceof：原型链判断
// ============================================================

console.log("--- 6️⃣ instanceof ---");
console.log("guide instanceof GuideDog:", guide instanceof GuideDog);   // true
console.log("guide instanceof Dog:     ", guide instanceof Dog);        // true（多层继承）
console.log("guide instanceof Animal:  ", guide instanceof Animal);     // true
console.log("guide instanceof Cat:      ", guide instanceof Cat);         // false
`,
  },

  // ===========================================================
  // 第 2 章：访问修饰符
  // ===========================================================
  {
    id: "tsbook-access-modifier",
    title: "访问修饰符",
    icon: "🔒",
    group: "面向对象",
    content: `# 🔒 访问修饰符

访问修饰符控制**类外部能否访问类的成员**——这是面向对象"封装"的基础。TS 提供 \`public\`/\`private\`/\`protected\` 三档权限，外加 \`readonly\` 和 ES2022 的 \`#\` 私有字段。

## 一、四种访问级别

| 修饰符 | 类内 | 子类 | 类外 |
|--------|------|------|------|
| \`public\`（默认） | ✅ | ✅ | ✅ |
| \`private\` | ✅ | ❌ | ❌ |
| \`protected\` | ✅ | ✅ | ❌ |
| \`readonly\` | 读 ✅ 写 ❌ | 读 ✅ 写 ❌ | 读 ✅ 写 ❌ |

\`\`\`ts
class Account {
  public owner: string;        // 谁都能看
  private balance: number;     // 只能类内改
  protected pin: string;       // 子类能改
  readonly id: string;          // 只读，初始化后不能改

  constructor(owner: string, balance: number, pin: string) {
    this.owner = owner;
    this.balance = balance;
    this.pin = pin;
    this.id = "ACC-" + Math.random().toString(36).slice(2);
  }
}
\`\`\`

## 二、\`private\` vs \`#\`：编译时 vs 运行时

TS 有**两套**"私有"机制，差别是：

| 对比项 | \`private\` 关键字 | \`#\` 私有字段 |
|--------|------------------|--------------|
| 来源 | TS 自有 | ES2022 标准 |
| 检查时机 | **编译时** | **运行时** |
| 编译后 | 普通属性，外部可访问 | 真正隔离的字段 |
| 反射 | 能拿到 | 拿不到 |
| 子类访问 | ❌ | ❌（但子类可声明同名字段） |

\`\`\`ts
class Safe {
  private tsSecret = "ts-private";
  #jsSecret = "js-private";

  reveal(): string {
    return this.tsSecret + " | " + this.#jsSecret;
  }
}

const s = new Safe();
// @ts-ignore —— 编译期挡住，但运行时能拿到
console.log(s.tsSecret);   // 运行时：ts-private（没真隔离）
// s.#jsSecret;  // 运行时也拿不到（SyntaxError）
\`\`\`

**结论**：要真正的封装隔离，用 \`#\`；要 TS 编译期约束 + 兼容老代码，用 \`private\`。

## 三、\`readonly\`：只读修饰符

\`\`\`ts
class Point {
  readonly x: number;
  readonly y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
const p = new Point(1, 2);
// p.x = 10;  // ❌ 只读，不能重新赋值
\`\`\`

\`readonly\` 只能读不能写，但**构造函数里可以赋值**——这是初始化的唯一窗口。

\`readonly\` 可以和其他修饰符组合：\`private readonly\`、\`public readonly\`。

## 四、\`protected\` 构造函数：禁止直接 new

\`\`\`ts
class Singleton {
  private static instance: Singleton;
  protected constructor() {}    // 外部不能 new
  static getInstance(): Singleton {
    if (!Singleton.instance) Singleton.instance = new Singleton();
    return Singleton.instance;
  }
}
// new Singleton();   // ❌ protected 构造函数，外部无法 new
Singleton.getInstance();   // ✅
\`\`\`

\`protected constructor()\` 把"new 权限"留给子类或静态方法——这是单例模式的常见写法。

## 五、参数属性 + 修饰符

\`\`\`ts
class Wallet {
  constructor(
    public owner: string,           // 自动 public 字段
    private balance: number,        // 自动 private 字段
    readonly id: string,            // 自动 readonly 字段
  ) {}
}
\`\`\`

一行就把字段、修饰符、构造函数全搞定了。

## 六、小结

- \`public\`/\`private\`/\`protected\` 控制访问范围
- \`readonly\` 控制可写性
- \`private\` 是编译期私有，\`#\` 是运行时真正私有
- 参数属性 + 修饰符是最简写法

> *下一章，抽象类与接口实现。*`,
    code: `// 🔒 访问修饰符 Demo

// ============================================================
// 1️⃣ 四种访问级别：public / private / protected / readonly
// ============================================================

class Account {
  public owner: string;          // 公开：类外可访问
  private balance: number;        // 私有：只有类内能改
  protected pin: string;          // 受保护：子类能改
  readonly id: string;            // 只读：初始化后不能改

  constructor(owner: string, balance: number, pin: string) {
    this.owner = owner;
    this.balance = balance;
    this.pin = pin;
    this.id = "ACC-" + Math.random().toString(36).slice(2, 8);
  }

  // 公开方法：提供安全的访问入口
  getBalance(): number {
    return this.balance;
  }

  // 公开方法：受保护地修改 balance
  deposit(amount: number): void {
    if (amount <= 0) throw new Error("金额必须为正");
    this.balance += amount;       // 类内可访问 private
  }

  // 公开方法：验证 PIN（内部用 this.pin）
  verifyPin(input: string): boolean {
    return input === this.pin;
  }
}

console.log("--- 1️⃣ 访问修饰符 ---");
const acc = new Account("Alice", 1000, "1234");
console.log("owner =", acc.owner);              // ✅ public 可访问
// console.log(acc.balance);  // ❌ private，编译报错
// console.log(acc.pin);      // ❌ protected，编译报错
console.log("balance =", acc.getBalance());     // ✅ 通过公开方法访问
acc.deposit(500);
console.log("deposit 后 balance =", acc.getBalance());
console.log("verifyPin('1234') =", acc.verifyPin("1234"));
// acc.id = "X";  // ❌ readonly，编译报错

// ============================================================
// 2️⃣ protected 在子类中的可访问性
// ============================================================

class SafeAccount extends Account {
  constructor(owner: string, balance: number, pin: string) {
    super(owner, balance, pin);
  }

  // ✅ 子类可以访问 protected 字段 pin
  changePin(oldPin: string, newPin: string): boolean {
    if (oldPin === this.pin) {        // 子类能读 protected
      this.pin = newPin;              // 子类能写 protected
      return true;
    }
    return false;
  }

  // ❌ 子类不能访问 private balance
  // steal(): number {
  //   return this.balance;   // 编译报错
  // }
}

console.log("--- 2️⃣ protected 子类 ---");
const safe = new SafeAccount("Bob", 500, "0000");
console.log("改 PIN 成功？", safe.changePin("0000", "9999"));
console.log("新 PIN 验证 =", safe.verifyPin("9999"));

// ============================================================
// 3️⃣ private vs #：编译时 vs 运行时
// ============================================================

class Safe {
  private tsSecret: string;       // TS 编译期私有
  #jsSecret: string;              // ES2022 运行时私有

  constructor() {
    this.tsSecret = "ts-private-value";
    this.#jsSecret = "js-private-value";
  }

  reveal(): string {
    return this.tsSecret + " | " + this.#jsSecret;   // 类内都能访问
  }
}

console.log("--- 3️⃣ private vs # ---");
const s = new Safe();
console.log("reveal() =", s.reveal());
// s.tsSecret   // ❌ 编译报错，但运行时其实是普通属性
// s.#jsSecret  // ❌ 真正的 SyntaxError，运行时也拿不到
// @ts-ignore 后编译通过，运行时能拿到 tsSecret，但拿不到 #jsSecret
// console.log((s as any).tsSecret);  // 运行时：ts-private-value
// console.log((s as any).jsSecret);  // 运行时：undefined（# 字段不是普通属性）

// ============================================================
// 4️⃣ readonly：只读字段
// ============================================================

class Point {
  readonly x: number;             // 只读
  readonly y: number;             // 只读

  constructor(x: number, y: number) {
    this.x = x;                    // ✅ 构造函数里能赋值
    this.y = y;                    // ✅
  }

  distance(other: Point): number {
    const dx = this.x - other.x;   // ✅ 只读字段可读
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

console.log("--- 4️⃣ readonly ---");
const p1 = new Point(0, 0);
const p2 = new Point(3, 4);
console.log("distance =", p1.distance(p2));
// p1.x = 10;  // ❌ readonly，编译报错

// ============================================================
// 5️⃣ 参数属性 + 修饰符组合
// ============================================================

class Wallet {
  // 构造函数参数前加修饰符，TS 自动生成字段
  constructor(
    public owner: string,           // 自动生成 public owner
    private balance: number,        // 自动生成 private balance
    readonly id: string,            // 自动生成 readonly id
  ) {}

  spend(amount: number): boolean {
    if (this.balance >= amount) {
      this.balance -= amount;       // private 字段类内可改
      return true;
    }
    return false;
  }

  toString(): string {
    return this.owner + " 钱包余额: " + this.balance;
  }
}

console.log("--- 5️⃣ 参数属性 ---");
const w = new Wallet("Charlie", 100, "W-001");
console.log("初始:", w.toString());
console.log("消费 30 成功?", w.spend(30));
console.log("消费后:", w.toString());
// w.balance = 1000;  // ❌ private，编译报错
// w.id = "X";        // ❌ readonly，编译报错

// ============================================================
// 6️⃣ protected constructor：禁止直接 new（单例模式）
// ============================================================

class Logger {
  private static instance: Logger | null = null;

  protected constructor(public tag: string = "APP") {}    // 外部不能 new

  static getInstance(): Logger {
    if (Logger.instance === null) {
      Logger.instance = new Logger();      // ✅ 类内静态方法可 new
    }
    return Logger.instance;
  }

  log(msg: string): void {
    console.log("[" + this.tag + "] " + msg);
  }
}

console.log("--- 6️⃣ 单例模式 ---");
// const logger = new Logger();   // ❌ protected 构造函数，编译报错
const logger1 = Logger.getInstance();
const logger2 = Logger.getInstance();
console.log("logger1 === logger2 ?", logger1 === logger2);    // true（同一实例）
logger1.log("Hello from singleton");
`,
  },

  // ===========================================================
  // 第 3 章：抽象类与接口实现
  // ===========================================================
  {
    id: "tsbook-abstract-class",
    title: "抽象类与接口实现",
    icon: "📐",
    group: "面向对象",
    content: `# 📐 抽象类与接口实现

抽象类和接口都是用来"定义契约"的——但两者用法、定位、能力都不同。本章讲清楚什么时候用哪个。

## 一、抽象类：\`abstract class\`

\`abstract\` 修饰的类**不能被实例化**，只能被继承。它可以有：

- 抽象方法（只有签名没有实现）：\`abstract method(): T;\`
- 具体方法（带实现的）：\`speak() { ... }\`
- 字段

\`\`\`ts
abstract class Shape {
  abstract area(): number;          // 子类必须实现
  describe(): string {               // 子类直接继承
    return "面积是 " + this.area();
  }
}
// new Shape();   // ❌ 抽象类不能 new
\`\`\`

抽象方法**强制子类实现**——这是"父类定契约，子类填实现"的模板方法模式。

## 二、抽象方法必须被实现

\`\`\`ts
class Circle extends Shape {
  constructor(public radius: number) { super(); }
  area(): number {                   // ✅ 必须实现
    return Math.PI * this.radius ** 2;
  }
}
\`\`\`

如果子类也是抽象类，可以不实现；如果子类是具体类，**必须全部实现**父类的抽象方法。

## 三、接口实现：\`implements\`

接口（\`interface\`）只能定义形状，不能有实现。类用 \`implements\` 实现：

\`\`\`ts
interface Comparable {
  compareTo(other: unknown): number;
}

class Money implements Comparable {
  constructor(public yuan: number) {}
  compareTo(other: unknown): number {
    if (!(other instanceof Money)) throw new Error("类型不匹配");
    return this.yuan - (other as Money).yuan;
  }
}
\`\`\`

一个类可以 \`implements\` 多个接口：

\`\`\`ts
class X implements A, B, C { ... }
\`\`\`

## 四、抽象类 vs 接口：怎么选？

| 对比项 | 抽象类 \`abstract class\` | 接口 \`interface\` |
|--------|-------------------------|-------------------|
| 能有实现 | ✅ 可以有具体方法 | ❌ 只能声明（默认实现要 TS 5.x+） |
| 能有字段 | ✅ | ❌（只有属性签名） |
| 多继承 | ❌ 只能继承一个 | ✅ 可 implements 多个 |
| 表达的是 | "是什么"（is-a） | "能做什么"（can-do） |
| 适合场景 | 共享代码 + 共享契约 | 纯契约、能力组合 |

**经验法则**：

- 多个类有**共享代码**（同名方法的具体实现） → 抽象类
- 只想**约定形状**，多个不相关类都要满足 → 接口
- 想要"能力组合"（一个类有多个能力） → 多个接口 \`implements\`

## 五、抽象类 + 接口组合使用

\`\`\`ts
interface Drawable {
  draw(): void;
}

abstract class Shape {
  abstract area(): number;
}

class Circle extends Shape implements Drawable {
  // 既要实现父类的抽象方法 area，又要实现接口的 draw
  area(): number { return 0; }
  draw(): void { ... }
}
\`\`\`

继承负责"复用代码"，接口负责"声明能力"——两者配合使用最灵活。

## 六、小结

- 抽象类用 \`abstract\` 修饰，不能 new，可以包含抽象方法和具体方法
- 抽象方法强制子类实现，是模板方法模式的基础
- 接口用 \`implements\` 实现，可同时实现多个
- 有共享代码选抽象类，纯契约选接口

> *下一章，元编程的入口：装饰器。*`,
    code: `// 📐 抽象类与接口实现 Demo

// ============================================================
// 1️⃣ 抽象类：abstract class + abstract method
// ============================================================

abstract class Shape {
  // 抽象方法：只有签名，子类必须实现
  abstract area(): number;
  abstract perimeter(): number;

  // 具体方法：子类直接继承，不用重写
  describe(): string {
    return "面积=" + this.area().toFixed(2) + ", 周长=" + this.perimeter().toFixed(2);
  }

  // 抽象类可以有字段
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

// const s = new Shape("x");  // ❌ 抽象类不能 new

// ============================================================
// 2️⃣ 子类继承抽象类：必须实现所有抽象方法
// ============================================================

class Circle extends Shape {
  constructor(
    name: string,
    public radius: number,    // 子类新增字段
  ) {
    super(name);              // 调用父类构造函数
  }

  area(): number {            // ✅ 实现抽象方法
    return Math.PI * this.radius * this.radius;
  }

  perimeter(): number {       // ✅ 实现抽象方法
    return 2 * Math.PI * this.radius;
  }
}

class Rectangle extends Shape {
  constructor(
    name: string,
    public width: number,
    public height: number,
  ) {
    super(name);
  }

  area(): number {
    return this.width * this.height;
  }

  perimeter(): number {
    return 2 * (this.width + this.height);
  }
}

console.log("--- 2️⃣ 抽象类 ---");
const circle = new Circle("圆A", 5);
const rect = new Rectangle("矩形B", 4, 6);
console.log(circle.name + ":", circle.describe());     // 继承自 Shape 的方法
console.log(rect.name + ":", rect.describe());

// ============================================================
// 3️⃣ 接口：interface + implements
// ============================================================

// 接口只能定义形状，不能有实现
interface Comparable {
  compareTo(other: Comparable): number;    // 返回负/0/正
}

interface Printable {
  print(): void;
}

// 类实现接口：必须实现接口的所有方法
class Money implements Comparable {
  constructor(public yuan: number) {}

  compareTo(other: Comparable): number {
    // 类型守卫：先确认是 Money 才能访问 yuan
    if (other instanceof Money) {
      return this.yuan - other.yuan;
    }
    return 0;
  }
}

console.log("--- 3️⃣ 单接口 ---");
const m1 = new Money(100);
const m2 = new Money(150);
console.log("m1 vs m2 =", m1.compareTo(m2));      // 负数：m1 < m2
console.log("m2 vs m1 =", m2.compareTo(m1));      // 正数：m2 > m1

// ============================================================
// 4️⃣ 多接口实现：implements A, B, C
// ============================================================

class Product implements Comparable, Printable {
  constructor(
    public name: string,
    public price: number,
  ) {}

  // 实现 Comparable
  compareTo(other: Comparable): number {
    if (other instanceof Product) {
      return this.price - other.price;
    }
    return 0;
  }

  // 实现 Printable
  print(): void {
    console.log("商品[" + this.name + "] 价格 ¥" + this.price);
  }
}

console.log("--- 4️⃣ 多接口 ---");
const p1 = new Product("鼠标", 80);
const p2 = new Product("键盘", 200);
p1.print();
p2.print();
console.log("p1 vs p2 =", p1.compareTo(p2));    // 负数：p1 < p2

// ============================================================
// 5️⃣ 抽象类 + 接口组合
// ============================================================

interface Drawable {
  draw(): void;     // 接口定义能力
}

// 抽象类负责共享代码 + 共享契约
abstract class Widget {
  constructor(public id: string) {}

  abstract render(): string;          // 抽象方法

  mount(): void {                       // 共享的具体方法
    console.log("挂载 Widget #" + this.id);
  }
}

// 子类既要实现抽象方法，又要实现接口
class Button extends Widget implements Drawable {
  constructor(
    id: string,
    public label: string,
  ) {
    super(id);
  }

  // 实现抽象类的方法
  render(): string {
    return "<button>" + this.label + "</button>";
  }

  // 实现接口的方法
  draw(): void {
    console.log("绘制按钮：" + this.render());
  }
}

console.log("--- 5️⃣ 抽象类 + 接口 ---");
const btn = new Button("submit", "提交");
btn.mount();                // 继承自 Widget
btn.draw();                 // 实现自 Drawable
console.log("render:", btn.render());

// ============================================================
// 6️⃣ 模板方法模式：抽象类经典应用
// ============================================================

abstract class DataProcessor {
  // 模板方法：固定流程
  process(data: unknown): void {
    const raw = this.read(data);         // 步骤1：读取（子类实现）
    const parsed = this.parse(raw);     // 步骤2：解析（子类实现）
    this.output(parsed);                // 步骤3：输出（子类实现）
  }

  protected abstract read(source: unknown): string;
  protected abstract parse(raw: string): unknown;
  protected abstract output(parsed: unknown): void;
}

class JsonProcessor extends DataProcessor {
  protected read(source: unknown): string {
    return typeof source === "string" ? source : JSON.stringify(source);
  }

  protected parse(raw: string): unknown {
    return JSON.parse(raw);
  }

  protected output(parsed: unknown): void {
    console.log("JSON 输出:", parsed);
  }
}

console.log("--- 6️⃣ 模板方法 ---");
const processor = new JsonProcessor();
processor.process('{"name":"Alice","age":30}');
`,
  },

  // ===========================================================
  // 第 4 章：装饰器
  // ===========================================================
  {
    id: "tsbook-decorator",
    title: "装饰器",
    icon: "✨",
    group: "面向对象",
    content: `# ✨ 装饰器

装饰器是 TS 的**元编程特性**：用 \`@xxx\` 语法在类、方法、属性、参数上"贴标签"，在不修改原代码的前提下增强行为。

## 一、装饰器是元编程

普通代码"操作数据"，元编程"操作代码本身"。装饰器接收**类/方法/属性的定义**作为参数，返回一个新的定义——在编译时就被处理，运行时已经是改造后的版本。

\`\`\`ts
@log                                    // 给类贴标签
class Foo {
  @readonly                              // 给方法贴标签
  greet() { return "hi"; }
}
\`\`\`

## 二、\`experimentalDecorators\` 选项

装饰器是 ES 标准（Stage 3），TS 提供两种实现：

1. **老装饰器（实验性）**：\`experimentalDecorators: true\` + \`emitDecoratorMetadata: true\`，主流框架（NestJS、TypeORM、TypeStack）都用这套
2. **新装饰器（标准）**：TS 5.0+ 直接支持，无需配置

老装饰器更成熟、生态更广，本章基于老装饰器讲解。

\`\`\`json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
\`\`\`

## 三、四类装饰器

| 装饰器 | 接收参数 | 用途 |
|--------|---------|------|
| 类装饰器 | \`constructor\` | 替换或修改类 |
| 方法装饰器 | \`target, key, descriptor\` | 改方法行为 |
| 属性装饰器 | \`target, key\` | 标记属性 |
| 参数装饰器 | \`target, key, paramIndex\` | 标记参数 |

## 四、方法装饰器：经典 \`@log\`

\`\`\`ts
function log(target: any, key: string, desc: PropertyDescriptor) {
  const original = desc.value;
  desc.value = function(...args: any[]) {
    console.log("调用 " + key + "，参数:", args);
    const result = original.apply(this, args);
    console.log(key + " 返回:", result);
    return result;
  };
}

class Calc {
  @log
  add(a: number, b: number): number { return a + b; }
}
\`\`\`

方法装饰器拿到 \`descriptor\`，包装原方法后写回去——AOP（面向切面编程）的核心思想。

## 五、类装饰器：\`@sealed\`

\`\`\`ts
function sealed(constructor: Function) {
  Object.seal(constructor);        // 锁定构造函数
  Object.seal(constructor.prototype);
}

@sealed
class Foo { ... }
\`\`\`

类装饰器拿到构造函数本身，可以改造它、返回新的构造函数。

## 六、属性装饰器：\`@readonly\`

\`\`\`ts
function readonly(target: any, key: string) {
  // 通过 Object.defineProperty 把属性改成只读
  let value = target[key];
  Object.defineProperty(target, key, {
    get: () => value,
    set: () => { throw new Error("不能修改只读属性 " + key); },
  });
}
\`\`\`

属性装饰器不能直接改 \`descriptor\`（实例属性还没创建），通常配合 \`getter/setter\` 或返回新的属性描述符。

## 七、装饰器工厂：\`@log("标签")\`

带参数的装饰器需要写成"工厂函数"——外层接收参数，返回真正的装饰器：

\`\`\`ts
function log(label: string) {
  return function(target: any, key: string, desc: PropertyDescriptor) {
    // ... 包装时用 label
  };
}

class Foo {
  @log("DEBUG") greet() { ... }
}
\`\`\`

## 八、小结

- 装饰器是元编程，\`@xxx\` 语法给类/方法/属性贴标签
- 需要开 \`experimentalDecorators\`（老装饰器）
- 四类：类、方法、属性、参数装饰器
- 带参数的写法是"装饰器工厂"
- NestJS、TypeORM 等框架大量使用

> *下一章，组合优于继承：Mixin 模式。*`,
    code: `// ✨ 装饰器 Demo
// ⚠️ 需要 tsconfig.json 配置：
//   "experimentalDecorators": true,
//   "emitDecoratorMetadata": true

// ============================================================
// 1️⃣ 方法装饰器：经典 @log
// ============================================================

// 方法装饰器签名：(target, key, descriptor)
function log(target: any, key: string, desc: PropertyDescriptor) {
  const original = desc.value;                   // 保存原方法
  desc.value = function (...args: any[]) {       // 替换为包装函数
    console.log("[log] 调用 " + key + "，参数:", args);
    const result = original.apply(this, args);    // 调用原方法
    console.log("[log] " + key + " 返回:", result);
    return result;
  };
  return desc;                                    // 返回修改后的 descriptor
}

class Calculator {
  @log                                          // 给方法贴装饰器
  add(a: number, b: number): number {
    return a + b;
  }

  @log
  multiply(a: number, b: number): number {
    return a * b;
  }
}

console.log("--- 1️⃣ 方法装饰器 @log ---");
const calc = new Calculator();
console.log("结果:", calc.add(2, 3));
console.log("---");
console.log("结果:", calc.multiply(4, 5));

// ============================================================
// 2️⃣ 类装饰器：@sealed 防止扩展
// ============================================================

// 类装饰器签名：(constructor: Function)
function sealed(constructor: Function) {
  Object.seal(constructor);                    // 锁定构造函数本身
  Object.seal(constructor.prototype);          // 锁定原型
}

@sealed                                        // 给类贴装饰器
class Fixed {
  greeting = "hello";

  speak(): string {
    return this.greeting;
  }
}

console.log("--- 2️⃣ 类装饰器 @sealed ---");
const f = new Fixed();
console.log("speak =", f.speak());
// Fixed.prototype.newMethod = ...;  // 严格模式下会报错（已 sealed）

// ============================================================
// 3️⃣ 属性装饰器：@readonly
// ============================================================

// 属性装饰器签名：(target, key)
// 不能直接改 descriptor（属性尚未初始化），用 getter/setter 包装
function readonly(target: any, key: string) {
  // 用闭包保存初始值
  let value: any;
  // 用 Object.defineProperty 拦截 get/set
  const getter = function (this: any) {
    return this["_" + key] !== undefined ? this["_" + key] : value;
  };
  const setter = function (this: any, newVal: any) {
    if (this["_" + key] === undefined) {
      this["_" + key] = newVal;                 // 第一次赋值允许
    } else {
      throw new Error("不能修改只读属性 " + key);
    }
  };
  // 替换属性的 get/set
  Object.defineProperty(target, key, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true,
  });
}

class Config {
  @readonly
  apiKey: string = "default-key";              // 初始值通过 setter 设置

  @readonly
  env: string = "production";
}

console.log("--- 3️⃣ 属性装饰器 @readonly ---");
const cfg = new Config();
console.log("apiKey =", cfg.apiKey);
console.log("env =", cfg.env);
try {
  cfg.apiKey = "hacked";                         // ❌ 会抛错：只读
} catch (e) {
  console.log("捕获错误:", (e as Error).message);
}

// ============================================================
// 4️⃣ 参数装饰器：@required 标记必填
// ============================================================

// 参数装饰器签名：(target, key, paramIndex)
// 通常和元数据配合用，这里用简单例子
function required(target: any, key: string, paramIndex: number) {
  // 在原型上记录哪些参数是必填的
  const requiredParams =
    (target as any).__requiredParams__ || (target as any).__requiredParams__ = {};
  requiredParams[key] = requiredParams[key] || [];
  requiredParams[key].push(paramIndex);
}

class UserService {
  // 用 @required 标记 userId 必须传
  findUser(@required userId: string, options?: object): string {
    return "找到用户 " + userId;
  }
}

console.log("--- 4️⃣ 参数装饰器 @required ---");
const svc = new UserService();
console.log(svc.findUser("U001"));
console.log("__requiredParams__ =", (svc as any).__requiredParams__);

// ============================================================
// 5️⃣ 装饰器工厂：带参数的 @logWith("标签")
// ============================================================

// 工厂函数：返回真正的装饰器
function logWith(label: string) {
  return function (target: any, key: string, desc: PropertyDescriptor) {
    const original = desc.value;
    desc.value = function (...args: any[]) {
      console.log("[" + label + "] " + key + " 入参:", args);
      const start = Date.now();
      const result = original.apply(this, args);
      const elapsed = Date.now() - start;
      console.log("[" + label + "] " + key + " 出参:", result, "| 耗时", elapsed, "ms");
      return result;
    };
    return desc;
  };
}

class Api {
  @logWith("API")
  fetchUser(id: number): string {
    // 模拟耗时
    for (let i = 0; i < 1000000; i++) {}  // eslint-disable-line
    return "User-" + id;
  }

  @logWith("DB")
  query(sql: string): string {
    return "执行: " + sql;
  }
}

console.log("--- 5️⃣ 装饰器工厂 ---");
const api = new Api();
console.log("结果:", api.fetchUser(42));
console.log("---");
console.log("结果:", api.query("SELECT * FROM users"));

// ============================================================
// 6️⃣ 类装饰器工厂：@injectable 模拟 IoC 标记
// ============================================================

// 类装饰器工厂：返回真正的类装饰器
function injectable(tag: string) {
  return function <T extends new (...args: any[]) => any>(constructor: T) {
    // 返回一个新类继承原类
    return class extends constructor {
      __tag__ = tag;                            // 添加标记字段
      __isInjectable__ = true;                  // 添加可注入标记

      toString(): string {
        return "[" + tag + "]";
      }
    };
  };
}

@injectable("UserService")
class MyService {
  hello(): string {
    return "hello";
  }
}

console.log("--- 6️⃣ 类装饰器工厂 ---");
const service = new MyService() as any;
console.log("toString:", service.toString());
console.log("__tag__:", service.__tag__);
console.log("__isInjectable__:", service.__isInjectable__);
console.log("hello():", service.hello());
`,
  },

  // ===========================================================
  // 第 5 章：Mixin 模式
  // ===========================================================
  {
    id: "tsbook-mixin",
    title: "Mixin 模式",
    icon: "🧩",
    group: "面向对象",
    content: `# 🧩 Mixin 模式

JavaScript / TypeScript **不支持多重继承**——一个类只能 \`extends\` 一个父类。但实际开发里我们经常需要"组合多个能力"：一个类既要 \`Disposable\`，又要 \`Serializable\`，又要 \`Clonable\`……Mixin 模式就是解决这个问题的。

## 一、为什么需要 Mixin

\`\`\`ts
// 单继承没法同时复用两个父类
class X extends Disposable, Serializable { }   // ❌ 语法不允许
\`\`\`

组合优于继承：把每个"能力"做成一个**可插拔的小类**（mixin），然后把这些能力"混入"目标类。

## 二、Mixin 的核心思路

1. 每个 mixin 是一个**普通类**，定义一个能力
2. 用 \`applyMixins(targetClass, [MixinA, MixinB])\` 把 mixin 的方法**复制**到目标类的原型上
3. 目标类用 \`implements\` 声明具备这些能力（保证类型安全）

\`\`\`ts
class Disposable {
  dispose() { ... }
}

class Clonable {
  clone() { ... }
}

class Resource implements Disposable, Clonable {
  // 类型上声明具备这两个能力
  // 实际方法由 applyMixins 注入
  dispose!: () => void;
  clone!: () => this;
}

applyMixins(Resource, [Disposable, Clonable]);   // 运行时注入方法
\`\`\`

## 三、\`applyMixins\` 函数

\`\`\`ts
function applyMixins(target: any, mixins: any[]) {
  mixins.forEach(mixin => {
    Object.getOwnPropertyNames(mixin.prototype).forEach(name => {
      if (name !== "constructor") {
        target.prototype[name] = mixin.prototype[name];   // 复制方法
      }
    });
  });
}
\`\`\`

\`applyMixins\` 遍历每个 mixin 的原型方法，复制到目标类的原型上——这是 mixin 的运行时核心。

## 四、构造函数类型：\`Mixin Ctor<T>\`

mixin 经常需要拿到目标实例的字段。TS 用一个特殊的"构造函数类型"模式：

\`\`\`ts
type Ctor<T = {}> = new (...args: any[]) => T;

function Disposable<T extends Ctor>(Base: T) {
  return class extends Base {
    isDisposed = false;
    dispose() { this.isDisposed = true; }
  };
}
\`\`\`

这样 mixin 既能作为函数被调用（函数式 mixin），又能保留 \`this\` 类型。

## 五、函数式 Mixin

更现代的写法是**函数式 mixin**——直接返回一个新类：

\`\`\`ts
class A {}
const B = Disposable(A);   // B 同时具备 A 和 Disposable 的能力
const b = new B();
b.dispose();
\`\`\`

函数式 mixin 更类型友好，是 TS 5.0+ 推荐的写法。

## 六、Mixin 的取舍

| 优势 | 劣势 |
|------|------|
| 灵活组合能力 | 方法冲突难处理（同名方法会被覆盖） |
| 避免"继承地狱" | 运行时复制方法，调试稍复杂 |
| 比 \`extends\` 更解耦 | 类型推导有时不精确 |

## 七、小结

- TS 不支持多重继承，mixin 是"组合"的方案
- \`applyMixins\` 函数复制方法到目标类的原型
- 目标类用 \`implements\` 声明能力，用 \`!\` 断言字段已注入
- 函数式 mixin 更现代、类型更友好

> *面向对象体系告一段落，下一 batch 进入高级类型。*`,
    code: `// 🧩 Mixin 模式 Demo

// ============================================================
// 1️⃣ 经典 Mixin：Disposable + Clonable
// ============================================================

// 能力 1：可销毁
class Disposable {
  isDisposed = false;                // 状态字段

  dispose(): void {
    console.log("调用 dispose()");
    this.isDisposed = true;            // 标记已销毁
  }
}

// 能力 2：可克隆
class Clonable {
  clone(): this {                     // 返回 this 类型
    // 简化版：用 Object.create 复制原型
    const clone = Object.create(Object.getPrototypeOf(this));
    Object.assign(clone, this);       // 复制实例字段
    return clone as this;
  }
}

// 能力 3：可序列化
class Serializable {
  serialize(): string {
    return JSON.stringify(this);
  }
}

// ============================================================
// 2️⃣ 目标类：implements 声明能力 + ! 断言字段
// ============================================================

class UserResource
  implements Disposable, Clonable, Serializable
{
  // 用 implements 声明具备这些能力（保证类型安全）
  // 实际方法由 applyMixins 在运行时注入

  name: string;                       // 自己的字段
  data: unknown;

  constructor(name: string, data: unknown) {
    this.name = name;
    this.data = data;
  }

  // 声明字段类型，但不实现（mixin 注入）
  isDisposed!: boolean;               // 非空断言：mixin 会注入
  dispose!: () => void;
  clone!: () => this;
  serialize!: () => string;
}

// ============================================================
// 3️⃣ applyMixins：运行时方法注入核心
// ============================================================

function applyMixins(target: any, mixins: any[]): void {
  mixins.forEach((mixin) => {
    // 遍历 mixin 原型的所有属性
    Object.getOwnPropertyNames(mixin.prototype).forEach((name) => {
      if (name !== "constructor") {
        // 复制到目标类原型上
        target.prototype[name] = mixin.prototype[name];
      }
    });
  });
}

// 把三个 mixin 的方法注入到 UserResource
applyMixins(UserResource, [Disposable, Clonable, Serializable]);

console.log("--- 1️⃣-3️⃣ applyMixins ---");
const user = new UserResource("Alice", { age: 30 });
console.log("serialize =", user.serialize());
const cloned = user.clone();
console.log("cloned name =", cloned.name);
user.dispose();
console.log("isDisposed =", user.isDisposed);

// ============================================================
// 4️⃣ 构造函数类型 + 函数式 Mixin
// ============================================================

// 构造函数类型：捕获类的构造签名
type Ctor<T = {}> = new (...args: any[]) => T;

// 函数式 mixin：Disposable
function withDisposable<T extends Ctor>(Base: T) {
  return class extends Base {
    isDisposed = false;

    dispose(): void {
      console.log("[函数式] dispose()");
      this.isDisposed = true;
    }

    get isAlive(): boolean {
      return !this.isDisposed;
    }
  };
}

// 函数式 mixin：Timestamped
function withTimestamped<T extends Ctor>(Base: T) {
  return class extends Base {
    createdAt = new Date();          // 创建时间

    getAge(): number {
      return Date.now() - this.createdAt.getTime();
    }
  };
}

// ============================================================
// 5️⃣ 组合多个函数式 Mixin
// ============================================================

// 基础类
class BaseItem {
  constructor(public id: number) {}
  toString(): string {
    return "Item#" + this.id;
  }
}

// 链式组合：先 Disposable，再 Timestamped
const EnhancedItem = withTimestamped(withDisposable(BaseItem));
type EnhancedItem = InstanceType<typeof EnhancedItem>;   // 类型别名

console.log("--- 4️⃣-5️⃣ 函数式 Mixin ---");
const item = new EnhancedItem(42);
console.log("toString =", item.toString());     // 来自 BaseItem
console.log("createdAt =", item.createdAt);     // 来自 Timestamped
console.log("isAlive =", item.isAlive);         // 来自 Disposable
console.log("age (ms) =", item.getAge());       // 来自 Timestamped
item.dispose();
console.log("dispose 后 isAlive =", item.isAlive);

// ============================================================
// 6️⃣ Mixin 实战：日志 + 验证
// ============================================================

// mixin：可记录日志
function withLogger<T extends Ctor>(Base: T) {
  return class extends Base {
    log(msg: string): void {
      console.log("[Logger] " + msg);
    }
  };
}

// mixin：可验证字段
function withValidator<T extends Ctor>(Base: T) {
  return class extends Base {
    validateNonEmpty(value: string, field: string): boolean {
      if (!value || value.trim() === "") {
        this.log?.(field + " 不能为空");        // 可选链，调用其他 mixin 的方法
        return false;
      }
      return true;
    }
  };
}

// 基础类
class Form {
  constructor(public name: string) {}
}

// 组合：先 Logger，再 Validator（Validator 可能调用 Logger.log）
const SmartForm = withValidator(withLogger(Form));
type SmartForm = InstanceType<typeof SmartForm>;

console.log("--- 6️⃣ 实战：日志 + 验证 ---");
const form = new SmartForm("login") as any;
console.log("name 验证:", form.validateNonEmpty("", "name"));
console.log("name 验证:", form.validateNonEmpty("Alice", "name"));
form.log("表单初始化完成");

// ============================================================
// 7️⃣ 多 mixin 实例：完整的 Repository
// ============================================================

interface Entity {
  id: number;
}

// mixin：可查找
function withFindable<T extends Ctor<Entity>>(Base: T) {
  return class extends Base {
    static find(this: new (...args: any[]) => any, id: number): Entity | null {
      // 简化版：实际场景查数据库
      console.log("查找 id=" + id);
      return null;
    }
  };
}

// mixin：可保存
function withSavable<T extends Ctor>(Base: T) {
  return class extends Base {
    save(): void {
      console.log("保存到数据库");
    }
  };
}

// 实体类
class User2 implements Entity {
  id: number;
  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

// 组合 Repository：Base + Findable + Savable
const UserRepository = withSavable(withFindable(User2));
type UserRepository = InstanceType<typeof UserRepository>;

console.log("--- 7️⃣ 完整 Repository ---");
const repo = new UserRepository(1, "Alice") as any;
console.log("repo.name =", repo.name);
console.log("repo.id =", repo.id);
repo.save();
`,
  },
];
