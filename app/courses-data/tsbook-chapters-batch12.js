// =============================================================
// TypeScript 全解 · Batch 12：设计模式与最佳实践（5 章）
// -------------------------------------------------------------
// 本 batch 覆盖 TypeScript 设计模式与工程化最佳实践的完整链路：
//   1. 单例模式              tsbook-singleton
//   2. 建造者模式            tsbook-builder
//   3. 观察者模式            tsbook-observer
//   4. 类型安全的 API 设计   tsbook-type-safe-api
//   5. TypeScript 最佳实践   tsbook-ts-best-practice
// 章节归属 group：设计模式与最佳实践
// =============================================================

export const chapters = [
  // ===========================================================
  // 第 1 章：单例模式
  // ===========================================================
  {
    id: "tsbook-singleton",
    title: "单例模式",
    icon: "🎯",
    group: "设计模式与最佳实践",
    content: `# 🎯 单例模式

单例模式（Singleton）保证**一个类只有一个实例**，并提供全局访问点。在 TS 里实现单例比 JS 更优雅——\`private constructor\` 直接堵死外部 \`new\`。

## 一、什么时候该用单例

✅ **适合单例的场景**：
- 全局配置管理（\`Config\`）
- 全局日志器（\`Logger\`）
- 数据库连接池
- 缓存服务

❌ **不适合单例的场景**（反模式）：
- 把所有东西都塞进单例（变成"全局变量大杂烩"）
- 用单例替代依赖注入（破坏可测试性）
- 状态会变化的"上帝对象"

> ⚠️ 单例最大的骂名来自"隐藏全局状态"——单元测试时 mock 困难。**能用依赖注入就别用单例**。

## 二、经典实现：private constructor + getInstance

\`\`\`ts
class Logger {
  private static instance: Logger;          // 静态实例引用

  private constructor() {                   // 私有构造：外部不能 new
    console.log("Logger 初始化");
  }

  static getInstance(): Logger {            // 全局访问点
    if (!Logger.instance) {                  // 懒加载：第一次调用才创建
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(msg: string): void {
    console.log(\`[LOG] \${msg}\`);
  }
}

const a = Logger.getInstance();              // ✅ 创建实例
const b = Logger.getInstance();              // ✅ 返回同一实例
console.log(a === b);                        // true
// new Logger();                             // ❌ 编译报错：构造是 private
\`\`\`

两个关键点：
1. **\`private constructor\`**：外部无法 \`new\`，强制走 \`getInstance\`。
2. **\`static instance\` + \`static getInstance\`**：类本身持有唯一实例。

## 三、懒加载 vs 饿汉式

\`\`\`ts
// 懒加载（lazy）：第一次 getInstance 才创建
class LazySingleton {
  private static instance?: LazySingleton;   // 可选，初始为 undefined
  private constructor() {}
  static getInstance(): LazySingleton {
    if (!LazySingleton.instance) {
      LazySingleton.instance = new LazySingleton();
    }
    return LazySingleton.instance;
  }
}

// 饿汉式（eager）：类加载就创建
class EagerSingleton {
  private static instance = new EagerSingleton();  // 直接初始化
  private constructor() {}
  static getInstance(): EagerSingleton {
    return EagerSingleton.instance;
  }
}
\`\`\`

| 方式 | 优点 | 缺点 |
|------|------|------|
| 懒加载 | 节省资源（不用就不创建） | 多线程不安全（TS 单线程可忽略） |
| 饿汉式 | 简单、线程安全 | 启动时即占用资源 |

## 四、Node.js 的"伪单例陷阱"

Node.js 模块系统天然有**缓存**——\`require()\` 同一个模块返回的是缓存对象。于是很多人以为"导出一个对象就是单例"：

\`\`\`ts
// db.ts
export const db = createConnection();        // 看似单例

// app.ts
import { db } from "./db";                   // 拿到的是缓存实例
\`\`\`

但**这是模块级单例**，不是类单例。两者区别：
- **模块级单例**：靠 Node 模块缓存，简单但有副作用（import 即创建）
- **类单例**：靠 \`getInstance\` 控制，懒加载、可控

## 五、TypeScript 的单例最佳实践

\`\`\`ts
// ✅ 推荐：泛型化 + 接口暴露
interface ILogger {
  log(msg: string): void;
}

class LoggerImpl implements ILogger {
  private static instance: LoggerImpl;
  private constructor() {}
  static getInstance(): LoggerImpl {
    return LoggerImpl.instance ??= new LoggerImpl();  // 逻辑空赋值
  }
  log(msg: string): void { console.log(msg); }
}

// 通过接口注入，方便测试 mock
function doWork(logger: ILogger) {           // 依赖接口而非具体类
  logger.log("working");
}
\`\`\`

依赖接口而非具体类，单元测试时可注入 mock 实现——保留单例好处的同时削弱"全局状态"危害。

## 六、一句话总结

单例 = \`private constructor\` + \`static getInstance\`。**用对场景（配置、日志、连接池）受益，用错场景（替代依赖注入）反模式**。能用 DI 就别用单例。

> *下一章，建造者模式——解决"参数爆炸"的链式构建方案。*`,
    code: `// 🎯 单例模式 Demo
// 演示三种单例实现：Logger 懒加载 / Config 饿汉式 / Node 模块单例

// ============================================================
// 1️⃣ Logger 单例（懒加载）
// ============================================================

class Logger {
  // 私有静态实例：初始为 null，第一次 getInstance 才创建
  private static instance: Logger | null = null;

  // 记录日志级别（实例属性，演示实例唯一性）
  private level: string = "info";

  // 私有构造：阻止外部 new Logger()
  private constructor() {
    console.log("  [Logger] 实例被创建（只应执行一次）");
  }

  // 全局访问点
  static getInstance(): Logger {
    if (Logger.instance === null) {           // 还没创建
      Logger.instance = new Logger();          // 创建一次
    }
    return Logger.instance;                    // 后续直接返回缓存实例
  }

  // 业务方法
  setLevel(level: string): void {
    this.level = level;
  }

  log(msg: string): void {
    console.log(\`  [\${this.level.toUpperCase()}] \${msg}\`);
  }
}

console.log("--- 1️⃣ Logger 单例（懒加载）---");
const loggerA = Logger.getInstance();          // 第一次：创建
const loggerB = Logger.getInstance();          // 第二次：返回同一实例
console.log("loggerA === loggerB ?", loggerA === loggerB);   // true（同一实例）
loggerA.setLevel("debug");                     // 通过 A 修改
loggerB.log("通过 B 调用 log，level 是 debug？");  // B 也能看到修改

// new Logger();  // ❌ 编译报错：constructor 是 private

// ============================================================
// 2️⃣ 配置管理单例（饿汉式 + 只读快照）
// ============================================================

interface AppConfig {
  readonly apiBase: string;                    // readonly：实例创建后不可改
  readonly timeout: number;
  readonly retries: number;
}

class Config {
  // 饿汉式：类加载即创建，避免多线程竞争
  private static instance: Config = new Config();

  // 私有构造：阻止外部 new
  private constructor() {}

  // 直接返回已创建的实例
  static getInstance(): Config {
    return Config.instance;
  }

  // 配置快照：返回只读对象，外部无法修改
  getConfig(): AppConfig {
    return {
      apiBase: "https://api.example.com",      // 实际项目从环境变量读
      timeout: 5000,
      retries: 3
    };
  }
}

console.log("\\n--- 2️⃣ Config 单例（饿汉式 + 只读）---");
const cfg1 = Config.getInstance();
const cfg2 = Config.getInstance();
console.log("cfg1 === cfg2 ?", cfg1 === cfg2);              // true
const cfg = cfg1.getConfig();
console.log("apiBase :", cfg.apiBase);
console.log("timeout :", cfg.timeout);
// cfg.apiBase = "x";  // ❌ 编译报错：readonly

// ============================================================
// 3️⃣ Node 模块级单例（导出对象即单例）
// ============================================================

// 真实场景：在 db.ts 里写
//   export const db = { connect() {...} };
// 多次 import 拿到的是 Node 模块缓存的同一对象

// 这里用 namespace 模拟"模块级单例"效果
namespace DatabaseModule {
  // 模块加载时即创建（饿汉）
  const connection = {
    host: "localhost",
    port: 5432,
    isConnected: false,

    connect(): void {
      this.isConnected = true;                // 模拟连接
      console.log("  [DB] 已连接", this.host + ":" + this.port);
    },
    query(sql: string): string {
      return \`结果: \${sql}\`;                  // 模拟查询
    }
  };

  export function getConnection() {           // 暴露访问点
    return connection;
  }
}

console.log("\\n--- 3️⃣ Node 模块级单例 ---");
const dbA = DatabaseModule.getConnection();
const dbB = DatabaseModule.getConnection();
console.log("dbA === dbB ?", dbA === dbB);                  // true
dbA.connect();                                  // 通过 A 连接
console.log("dbB 也看到 isConnected ?", dbB.isConnected);  // true（同一对象）

// ============================================================
// 4️⃣ 通过接口注入：降低单例的全局耦合（推荐做法）
// ============================================================

// 接口：定义 logger 的契约
interface ILogger {
  log(msg: string): void;
}

// 单例实现该接口
class ConsoleLogger implements ILogger {
  private static instance: ConsoleLogger | null = null;
  private constructor() {}
  static getInstance(): ConsoleLogger {
    if (ConsoleLogger.instance === null) {
      ConsoleLogger.instance = new ConsoleLogger();
    }
    return ConsoleLogger.instance;
  }
  log(msg: string): void {
    console.log("  [LOG]", msg);
  }
}

// 业务函数：依赖接口而非具体类（方便测试 mock）
function doWork(logger: ILogger, task: string): void {
  logger.log(\`开始任务：\${task}\`);
  logger.log(\`完成任务：\${task}\`);
}

console.log("\\n--- 4️⃣ 依赖注入解耦 ---");
const logger = ConsoleLogger.getInstance();     // 拿到单例
doWork(logger, "数据导出");                       // 注入：业务函数不关心来源

// 测试时可以注入 mock 实现
const mockLogger: ILogger = {
  log(msg: string) { console.log("  [MOCK]", msg); }
};
doWork(mockLogger, "测试任务");                  // 替换实现，业务函数不变

// ============================================================
// 5️⃣ 使用 ??= 简化懒加载（TS 4.0+ 推荐）
// ============================================================

class Cache {
  private static instance?: Cache;              // 可选类型，初始为 undefined

  private constructor() {
    console.log("  [Cache] 创建实例");
  }

  static getInstance(): Cache {
    // ??= 逻辑空赋值：instance 为 null/undefined 时才赋值
    return Cache.instance ??= new Cache();
  }

  private store = new Map<string, unknown>();

  set(key: string, val: unknown): void {
    this.store.set(key, val);                   // 存入缓存
  }
  get<T = unknown>(key: string): T | undefined {
    return this.store.get(key) as T | undefined; // 取出缓存
  }
}

console.log("\\n--- 5️⃣ ??= 简化懒加载 ---");
const c1 = Cache.getInstance();                  // 创建
const c2 = Cache.getInstance();                  // 复用
console.log("c1 === c2 ?", c1 === c2);
c1.set("user", { name: "Tom", age: 18 });
console.log("c2.get('user') =", c2.get<{ name: string; age: number }>("user"));  // 同一对象能读到

console.log("\\n✅ 单例模式要点：private constructor + static getInstance + 接口注入解耦");`,
  },

  // ===========================================================
  // 第 2 章：建造者模式
  // ===========================================================
  {
    id: "tsbook-builder",
    title: "建造者模式",
    icon: "🏗️",
    group: "设计模式与最佳实践",
    content: `# 🏗️ 建造者模式

建造者模式（Builder）用**链式调用**逐步构造复杂对象，避免"参数爆炸"——一个 10 个参数的构造函数，谁都调不明白。

## 一、参数爆炸问题

\`\`\`ts
// ❌ 反面教材：构造函数 10 个参数，谁能记住顺序？
class User {
  constructor(
    name: string, age: number, email: string, phone: string,
    address: string, city: string, country: string,
    isAdmin: boolean, createdAt: Date, updatedAt: Date
  ) {}
}

new User("Tom", 18, "tom@x.com", "138...", "...", "...", "...", false, new Date(), new Date());
// 😱 调用时根本分不清第 6 个参数是 city 还是 country
\`\`\`

## 二、Builder 解决方案

\`\`\`ts
class UserBuilder {
  private name?: string;
  private age?: number;
  private email?: string;

  withName(name: string): this {              // 返回 this 实现链式调用
    this.name = name;
    return this;
  }
  withAge(age: number): this {
    this.age = age;
    return this;
  }

  build(): User {                              // 最终构造
    return new User(this.name!, this.age!, ...);
  }
}

new UserBuilder()
  .withName("Tom")
  .withAge(18)
  .build();
\`\`\`

关键点：**每个 \`withX\` 返回 \`this\`**——这样就能 \`.withA().withB().withC()\` 链起来。

## 三、TypeScript 的"不可变 Builder"

JS 的 Builder 通常返回 \`this\`（可变），TS 可以更进一步——**每一步返回新对象**：

\`\`\`ts
class UrlBuilder {
  private constructor(
    private readonly protocol: string,
    private readonly host: string,
    private readonly path: string,
    private readonly query: Record<string, string>
  ) {}

  static create(protocol: string, host: string): UrlBuilder {
    return new UrlBuilder(protocol, host, "", {});
  }

  withPath(path: string): UrlBuilder {
    return new UrlBuilder(this.protocol, this.host, path, this.query);  // 返回新实例
  }

  withQuery(key: string, val: string): UrlBuilder {
    return new UrlBuilder(this.protocol, this.host, this.path, { ...this.query, [key]: val });
  }

  build(): string {
    const q = Object.entries(this.query).map(([k, v]) => \`\${k}=\${v}\`).join("&");
    return \`\${this.protocol}://\${this.host}\${this.path}\${q ? "?" + q : ""}\`;
  }
}
\`\`\`

每次链式调用都生成新对象——**不可变、可缓存、线程安全**。代价是分配更多内存。

## 四、Builder 的适用场景

✅ **适合**：
- 对象字段多（≥5 个）且大多可选
- 字段构造有顺序依赖（如先设 host 再设 port）
- 需要分步骤构建（如 SQL 查询的 SELECT/FROM/WHERE）

❌ **不适合**：
- 字段就 2-3 个，直接构造更清楚
- 对象本身简单，Builder 反而增加复杂度

## 五、用接口分离实现"渐进式 Builder"

\`\`\`ts
interface IUrlStart { withHost(h: string): IUrlWithHost; }
interface IUrlWithHost { withPath(p: string): IUrlBuildable; }
interface IUrlBuildable { build(): string; }

class UrlBuilder implements IUrlStart, IUrlWithHost, IUrlBuildable {
  // 通过接口类型约束链式调用顺序
  withHost(h: string): IUrlWithHost { return this; }
  withPath(p: string): IUrlBuildable { return this; }
  build(): string { return ""; }
}

UrlBuilder.create().withHost("a").withPath("b").build();  // ✅ 顺序正确
// UrlBuilder.create().withPath("b");                       // ❌ 必须先 withHost
\`\`\`

通过返回类型的不同接口，**编译期强制调用顺序**——这是 TS 独有的 Builder 增强。

## 六、一句话总结

Builder = 链式调用 + 渐进构造，解决"参数爆炸"。TS 借助接口分离还能**编译期强制调用顺序**——这就是类型系统给设计模式带来的加成。

> *下一章，观察者模式——一对多的事件通知。*`,
    code: `// 🏗️ 建造者模式 Demo
// 演示 URL Builder / SQL Query Builder / User Builder

// ============================================================
// 1️⃣ URL Builder（不可变链式）
// ============================================================

class UrlBuilder {
  // 全部字段 readonly：每次链式返回新实例
  private constructor(
    private readonly protocol: string,                // 协议：http / https
    private readonly host: string,                     // 域名
    private readonly port: number | null,              // 端口（可空）
    private readonly pathSegments: string[],           // 路径分段
    private readonly queryParams: Record<string, string>  // 查询参数
  ) {}

  // 工厂入口：从协议 + 主机开始构建
  static https(host: string): UrlBuilder {
    return new UrlBuilder("https", host, null, [], {});  // 默认 https
  }

  static http(host: string): UrlBuilder {
    return new UrlBuilder("http", host, null, [], {});   // 默认 http
  }

  // 链式：设置端口（返回新实例，原对象不变）
  withPort(port: number): UrlBuilder {
    return new UrlBuilder(this.protocol, this.host, port, this.pathSegments, this.queryParams);
  }

  // 链式：追加路径段（如 /api/users）
  appendPath(segment: string): UrlBuilder {
    const clean = segment.replace(/^\\/+|\\/+$/g, "");   // 去掉首尾斜杠
    return new UrlBuilder(this.protocol, this.host, this.port, [...this.pathSegments, clean], this.queryParams);
  }

  // 链式：添加查询参数
  withQuery(key: string, value: string): UrlBuilder {
    return new UrlBuilder(this.protocol, this.host, this.port, this.pathSegments, { ...this.queryParams, [key]: value });
  }

  // 终结方法：拼出最终 URL 字符串
  build(): string {
    const portPart = this.port ? \`:\${this.port}\` : "";  // 端口部分
    const pathPart = this.pathSegments.length ? "/" + this.pathSegments.join("/") : "";  // 路径部分
    const queryPart = Object.entries(this.queryParams)
      .map(([k, v]) => \`\${encodeURIComponent(k)}=\${encodeURIComponent(v)}\`)  // URL 编码
      .join("&");
    return \`\${this.protocol}://\${this.host}\${portPart}\${pathPart}\${queryPart ? "?" + queryPart : ""}\`;
  }
}

console.log("--- 1️⃣ URL Builder ---");
const url = UrlBuilder.https("api.example.com")    // 起点：https
  .withPort(8443)                                  // 加端口
  .appendPath("v2")                                // 加路径段 v2
  .appendPath("users")                              // 加路径段 users
  .withQuery("page", "1")                          // 加查询参数
  .withQuery("limit", "20")
  .withQuery("q", "张三")
  .build();                                        // 终结：生成字符串
console.log("最终 URL =", url);

// 验证不可变性：中途结果可以复用
const base = UrlBuilder.https("api.example.com").appendPath("v1");
const usersUrl = base.appendPath("users").build();
const postsUrl = base.appendPath("posts").build();
console.log("usersUrl =", usersUrl);
console.log("postsUrl =", postsUrl);

// ============================================================
// 2️⃣ SQL Query Builder（链式构建 SQL）
// ============================================================

type WhereClause = { field: string; op: "=" | ">" | "<" | "LIKE"; value: string | number };

class QueryBuilder {
  private constructor(
    private readonly table: string,
    private readonly columns: string[],
    private readonly wheres: WhereClause[],
    private readonly orderByField: string | null,
    private readonly limitVal: number | null
  ) {}

  // 起点：FROM table
  static select(...columns: string[]): { from: (table: string) => QueryBuilder } {
    return {
      from: (table: string) => new QueryBuilder(table, columns.length ? columns : ["*"], [], null, null)
    };
  }

  // 链式：添加 WHERE 条件
  where(field: string, op: WhereClause["op"], value: string | number): QueryBuilder {
    return new QueryBuilder(this.table, this.columns, [...this.wheres, { field, op, value }], this.orderByField, this.limitVal);
  }

  // 链式：设置 ORDER BY
  orderBy(field: string): QueryBuilder {
    return new QueryBuilder(this.table, this.columns, this.wheres, field, this.limitVal);
  }

  // 链式：设置 LIMIT
  limit(n: number): QueryBuilder {
    return new QueryBuilder(this.table, this.columns, this.wheres, this.orderByField, n);
  }

  // 终结：拼 SQL
  build(): string {
    const cols = this.columns.join(", ");                              // SELECT a, b
    const wherePart = this.wheres.length
      ? " WHERE " + this.wheres.map(w => {
          const v = typeof w.value === "string" ? \`'\${w.value.replace(/'/g, "''")}'\` : w.value;  // 字符串加引号 + 防注入
          return \`\${w.field} \${w.op} \${v}\`;
        }).join(" AND ")
      : "";
    const orderPart = this.orderByField ? \` ORDER BY \${this.orderByField}\` : "";
    const limitPart = this.limitVal !== null ? \` LIMIT \${this.limitVal}\` : "";
    return \`SELECT \${cols} FROM \${this.table}\${wherePart}\${orderPart}\${limitPart};\`;
  }
}

console.log("\\n--- 2️⃣ SQL Query Builder ---");
const sql = QueryBuilder
  .select("id", "name", "email")             // SELECT 子句
  .from("users")                              // FROM 子句
  .where("age", ">", 18)                      // WHERE age > 18
  .where("name", "LIKE", "Tom%' OR 1=1--")    // 防注入测试
  .orderBy("id")                              // ORDER BY id
  .limit(10)                                  // LIMIT 10
  .build();
console.log("最终 SQL =", sql);

// ============================================================
// 3️⃣ User Builder（接口分离实现"渐进式"调用）
// ============================================================

interface User {
  name: string;
  age: number;
  email: string;
  phone?: string;
  address?: string;
}

// 渐进式接口：限制调用顺序（必须先 name，再 age，最后 email）
interface INameStage { withAge(age: number): IAgeStage; }
interface IAgeStage { withEmail(email: string): IEmailStage; }
interface IEmailStage {
  withPhone(phone: string): IEmailStage;     // 可选字段返回自身
  withAddress(addr: string): IEmailStage;
  build(): User;                              // 必填字段齐全后才能 build
}

class UserBuilder implements INameStage, IAgeStage, IEmailStage {
  private name!: string;                       // 必填，初始未赋值
  private age!: number;
  private email!: string;
  private phone?: string;
  private address?: string;

  // 私有构造：只能通过 create 进入
  private constructor() {}

  // 入口：必须先设置 name
  static create(name: string): INameStage {
    const b = new UserBuilder();
    b.name = name;
    return b;
  }

  // 链式：必填字段 age
  withAge(age: number): IAgeStage {
    this.age = age;
    return this;
  }

  // 链式：必填字段 email（之后才能 build）
  withEmail(email: string): IEmailStage {
    this.email = email;
    return this;
  }

  // 链式：可选字段 phone（返回自身接口）
  withPhone(phone: string): IEmailStage {
    this.phone = phone;
    return this;
  }

  // 链式：可选字段 address
  withAddress(addr: string): IEmailStage {
    this.address = addr;
    return this;
  }

  // 终结：构造 User 对象
  build(): User {
    return {
      name: this.name,
      age: this.age,
      email: this.email,
      ...(this.phone ? { phone: this.phone } : {}),       // 可选字段条件展开
      ...(this.address ? { address: this.address } : {})
    };
  }
}

console.log("\\n--- 3️⃣ User Builder（渐进式接口）---");
const user = UserBuilder
  .create("张三")                                // 起点：name（必填）
  .withAge(25)                                  // 必填 age
  .withEmail("zhangsan@example.com")             // 必填 email
  .withPhone("13800138000")                      // 可选 phone
  .withAddress("北京市朝阳区")                    // 可选 address
  .build();                                     // 终结：构造对象
console.log("User =", user);

// 编译期约束示例（注释掉的报错代码）：
// UserBuilder.create("x");                          // ❌ 类型是 INameStage，没有 build 方法
// UserBuilder.create("x").withEmail("a@b.com");      // ❌ 必须先 withAge
// UserBuilder.create("x").withAge(1);                // ❌ 类型是 IAgeStage，不能 build

console.log("\\n✅ Builder 要点：链式返回 this / 新实例 + 终结 build() + 接口分离约束顺序");`,
  },

  // ===========================================================
  // 第 3 章：观察者模式
  // ===========================================================
  {
    id: "tsbook-observer",
    title: "观察者模式",
    icon: "📡",
    group: "设计模式与最佳实践",
    content: `# 📡 观察者模式

观察者模式（Observer）定义对象间**一对多**的依赖：当一个对象状态变化时，所有依赖者自动收到通知。这是事件驱动编程的基础。

## 一、观察者 vs 发布订阅：常被混淆的两个概念

| 概念 | 结构 | 耦合度 | 典型实现 |
|------|------|--------|---------|
| **观察者** | Subject ↔ Observer 直接引用 | 高（互相知道） | DOM \`addEventListener\` |
| **发布订阅** | Publisher → **Broker** → Subscriber | 低（互不相识） | Redis Pub/Sub、消息队列 |

\`\`\`
// 观察者：Subject 持有 Observer 列表
Subject ---notify---> Observer1
        ---> Observer2
        ---> Observer3

// 发布订阅：中间有 Broker
Publisher --publish--> [Broker] --dispatch--> Subscriber1
                                  --> Subscriber2
\`\`\`

观察者更轻量、适合进程内；发布订阅解耦更彻底、适合跨进程。

## 二、TypeScript 实现 EventEmitter

\`\`\`ts
type Listener<T = any> = (payload: T) => void;

class EventEmitter<Events extends Record<string, any>> {
  private listeners: { [K in keyof Events]?: Listener<Events[K]>[] } = {};

  on<K extends keyof Events>(event: K, fn: Listener<Events[K]>): void {
    (this.listeners[event] ??= []).push(fn);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners[event]?.forEach(fn => fn(payload));
  }

  off<K extends keyof Events>(event: K, fn: Listener<Events[K]>): void {
    this.listeners[event] = this.listeners[event]?.filter(f => f !== fn);
  }
}

// 用法
const bus = new EventEmitter<{
  login: { userId: string };
  logout: void;
}>();

bus.on("login", ({ userId }) => console.log(userId));  // 类型安全
bus.emit("login", { userId: "u123" });                  // ✅
// bus.emit("login", "wrong");                          // ❌ 类型错
\`\`\`

TS 的增强点：**用泛型约束事件名和 payload**——写错 payload 类型直接编译报错。

## 三、Subject + Observer 经典接口

\`\`\`ts
interface Observer<T> { update(data: T): void; }

class Subject<T> {
  private observers: Observer<T>[] = [];
  subscribe(o: Observer<T>) { this.observers.push(o); }
  unsubscribe(o: Observer<T>) { this.observers = this.observers.filter(x => x !== o); }
  notify(data: T) { this.observers.forEach(o => o.update(data)); }
}
\`\`\`

经典 OOP 风格，Subject 持有 Observer 列表，状态变化时调 \`notify\`。

## 四、Subject vs Observable：RxJS 风格

RxJS 的 \`Subject\` 是观察者模式的进阶——既能 \`subscribe\`（被订阅），又能 \`next\`（推送数据）。配合 \`Observable\` 形成**响应式编程**范式：

\`\`\`ts
import { Subject } from "rxjs";

const click$ = new Subject<{ x: number; y: number }>();

click$.subscribe(({ x, y }) => console.log(x, y));
click$.next({ x: 1, y: 2 });  // 推送数据
\`\`\`

适合流式数据（鼠标移动、WebSocket 消息、轮询结果）。

## 五、观察者模式的常见坑

⚠️ **内存泄漏**：忘记 \`off\` / \`unsubscribe\`，长生命周期 Subject 会持有 Observer 引用导致无法 GC。

⚠️ **循环依赖**：A 订阅 B、B 订阅 A，互相触发形成死循环。

⚠️ **顺序敏感**：Observer 的执行顺序取决于注册顺序，难以保证逻辑正确性。

解法：
- 短生命周期组件（如 React 组件）卸载时 \`off\`
- 用 \`takeUntil\` / \`take(1)\` 自动退订
- 大量 Observer 时用 \`setTimeout(0)\` 异步通知

## 六、一句话总结

观察者 = Subject 持有 Observer 列表 + 状态变化时广播。TS 用泛型让事件名和 payload **类型安全**，\`EventEmitter<Events>\` 是最常用的封装。

> *下一章，类型安全的 API 设计——用类型系统表达业务约束。*`,
    code: `// 📡 观察者模式 Demo
// 演示类型安全 EventEmitter / Subject Observer / 内存泄漏防护

// ============================================================
// 1️⃣ 类型安全的 EventEmitter（核心实现）
// ============================================================

// Listener 类型：接收一个 payload
type Listener<T> = (payload: T) => void;

// 泛型约束：Events 是事件名到 payload 类型的映射
class EventEmitter<Events extends Record<string, any>> {
  // 内部存储：每个事件名对应一个监听器数组
  private listeners: { [K in keyof Events]?: Listener<Events[K]>[] } = {};

  // 订阅事件：返回取消订阅的函数（推荐用法）
  on<K extends keyof Events>(event: K, fn: Listener<Events[K]>): () => void {
    (this.listeners[event] ??= []).push(fn);          // 加入监听器数组
    return () => this.off(event, fn);                  // 返回退订函数
  }

  // 一次性订阅：触发一次后自动退订
  once<K extends keyof Events>(event: K, fn: Listener<Events[K]>): () => void {
    const wrapper: Listener<Events[K]> = (payload) => {
      this.off(event, wrapper);                        // 先退订自己
      fn(payload);                                     // 再执行原函数
    };
    return this.on(event, wrapper);
  }

  // 触发事件：通知所有监听器
  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners[event]?.forEach(fn => fn(payload)); // 遍历调用
  }

  // 退订事件
  off<K extends keyof Events>(event: K, fn: Listener<Events[K]>): void {
    this.listeners[event] = this.listeners[event]?.filter(f => f !== fn);  // 过滤掉指定函数
  }

  // 清空某个事件的所有监听器
  clear<K extends keyof Events>(event: K): void {
    delete this.listeners[event];
  }
}

// 定义事件契约：事件名 → payload 类型
interface AppEvents {
  login: { userId: string; time: Date };     // login 事件携带 userId 和时间
  logout: void;                                // logout 事件无 payload
  message: { from: string; text: string };    // message 事件携带消息
}

console.log("--- 1️⃣ 类型安全 EventEmitter ---");
const bus = new EventEmitter<AppEvents>();

// 订阅 login 事件：回调参数自动推导为 { userId: string; time: Date }
const offLogin = bus.on("login", (payload) => {
  console.log("  [login]", payload.userId, "登录于", payload.time.toISOString());
});

// 订阅 message 事件
bus.on("message", ({ from, text }) => {
  console.log(\`  [msg] \${from}: \${text}\`);
});

// 触发事件
bus.emit("login", { userId: "u123", time: new Date() });           // ✅ 类型对
bus.emit("message", { from: "Alice", text: "Hi" });
// bus.emit("login", { userId: "u123" });                          // ❌ 缺 time 字段
// bus.emit("unknown", {});                                         // ❌ 不存在的事件

// 退订 login
offLogin();
bus.emit("login", { userId: "u456", time: new Date() });           // 不再触发（已退订）

// ============================================================
// 2️⃣ Subject + Observer 经典接口
// ============================================================

// Observer 接口：定义 update 方法
interface Observer<T> {
  update(data: T): void;
}

// Subject：被观察对象
class Subject<T> {
  private observers: Set<Observer<T>> = new Set();  // 用 Set 去重

  // 订阅
  subscribe(o: Observer<T>): () => void {
    this.observers.add(o);                            // 加入观察者集合
    return () => this.observers.delete(o);            // 返回退订函数
  }

  // 通知所有观察者
  notify(data: T): void {
    this.observers.forEach(o => o.update(data));      // 遍历调用 update
  }
}

console.log("\\n--- 2️⃣ Subject + Observer ---");

// 模拟温度传感器
const temperature = new Subject<number>();

// 观察者 1：LCD 显示器
const display: Observer<number> = {
  update(temp) {
    console.log(\`  [LCD] 当前温度：\${temp}°C\`);
  }
};

// 观察者 2：警报器
const alarm: Observer<number> = {
  update(temp) {
    if (temp > 50) {
      console.log(\`  [ALARM] 温度过高：\${temp}°C！\`);
    }
  }
};

// 订阅
const offDisplay = temperature.subscribe(display);
temperature.subscribe(alarm);

// 模拟温度变化
temperature.notify(25);    // LCD 显示
temperature.notify(60);    // LCD 显示 + ALARM 触发
temperature.notify(40);    // LCD 显示

// LCD 退订
offDisplay();
temperature.notify(70);    // 只有 ALARM 触发

// ============================================================
// 3️⃣ 一次性订阅 + 事件回调链
// ============================================================

console.log("\\n--- 3️⃣ once 一次性订阅 ---");
const bus2 = new EventEmitter<{ click: number }>();

let clickCount = 0;
bus2.once("click", (n) => {
  clickCount += 1;
  console.log(\`  [once] 第 \${n} 次点击（本次会自动退订）\`);
});

bus2.emit("click", 1);     // 触发
bus2.emit("click", 2);     // 不触发（已退订）
console.log("clickCount =", clickCount);   // 1

// ============================================================
// 4️⃣ 内存泄漏防护：组件卸载时退订
// ============================================================

console.log("\\n--- 4️⃣ 内存泄漏防护 ---");

// 模拟 React 组件的订阅 + 卸载
class Component {
  private cleanups: (() => void)[] = [];     // 收集所有退订函数

  // 模拟 useEffect / componentDidMount
  mount(bus: EventEmitter<AppEvents>): void {
    // 订阅多个事件，把退订函数收集起来
    this.cleanups.push(
      bus.on("login", ({ userId }) => {
        console.log("  组件收到 login:", userId);
      })
    );
    this.cleanups.push(
      bus.on("message", ({ from, text }) => {
        console.log(\`  组件收到 msg: \${from}: \${text}\`);
      })
    );
    console.log("  [组件] 挂载完成，已订阅 login + message");
  }

  // 模拟 componentWillUnmount
  unmount(): void {
    // 一次性退订所有事件，防止内存泄漏
    this.cleanups.forEach(cleanup => cleanup());
    this.cleanups = [];
    console.log("  [组件] 卸载完成，已退订所有事件");
  }
}

const comp = new Component();
comp.mount(bus);
bus.emit("login", { userId: "u789", time: new Date() });   // 组件能收到
comp.unmount();
bus.emit("login", { userId: "u999", time: new Date() });   // 组件已退订，收不到

// ============================================================
// 5️⃣ 异步通知：避免长时间回调阻塞
// ============================================================

console.log("\\n--- 5️⃣ 异步通知 ---");

class AsyncEventEmitter<Events extends Record<string, any>> {
  private listeners: { [K in keyof Events]?: Listener<Events[K]>[] } = {};

  on<K extends keyof Events>(event: K, fn: Listener<Events[K]>): void {
    (this.listeners[event] ??= []).push(fn);
  }

  // 异步通知：用 queueMicrotask 推迟到下一个微任务
  asyncEmit<K extends keyof Events>(event: K, payload: Events[K]): void {
    queueMicrotask(() => {
      this.listeners[event]?.forEach(fn => fn(payload));   // 异步遍历调用
    });
  }
}

const asyncBus = new AsyncEventEmitter<{ done: string }>();
asyncBus.on("done", (msg) => console.log("  [async]", msg));

console.log("  调用 asyncEmit 前");
asyncBus.asyncEmit("done", "我会在同步代码后执行");
console.log("  调用 asyncEmit 后");

// 同步代码先执行完，微任务在后面才触发
setTimeout(() => {
  console.log("\\n✅ 观察者要点：类型约束事件 + Subject 持有 Observer 列表 + 卸载时退订防泄漏");
}, 100);`,
  },

  // ===========================================================
  // 第 4 章：类型安全的 API 设计
  // ===========================================================
  {
    id: "tsbook-type-safe-api",
    title: "类型安全的 API 设计",
    icon: "🛡️",
    group: "设计模式与最佳实践",
    content: `# 🛡️ 类型安全的 API 设计

好的 API 设计让**错误用法编译不过去**——这是 TS 比动态语言最大的优势。本章覆盖四个核心套路：\`Result\` 类型、\`Option\` 类型、函数式错误处理、\`Brand\` 类型。

## 一、Result<T, E>：把错误写进类型

JS 的 \`try/catch\` 的根本缺陷：\`catch (e)\` 的 \`e\` 是 \`any\`（TS 4.4 后是 \`unknown\`），调用方完全不知道会抛什么。**Result 类型**把错误写进返回类型：

\`\`\`ts
type Result<T, E = Error> =
  | { ok: true; value: T }        // 成功分支：带 value
  | { ok: false; error: E };      // 失败分支：带 error

// 用法
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return { ok: false, error: "除零错误" };  // 失败
  return { ok: true, value: a / b };                      // 成功
}

const r = divide(10, 0);
if (r.ok) {
  console.log(r.value);   // ✅ 这里 r.value 是 number
} else {
  console.log(r.error);   // ✅ 这里 r.error 是 string
}
\`\`\`

调用方**必须处理失败分支**——这是编译期强制。

## 二、Option<T>：消除 null 的优雅方案

\`\`ts\` 风格的"可能为空"用 \`| null\` 表达，每次用都要判空。**Option 类型**用两个变体表达"有值"和"无值"：

\`\`\`ts
type Option<T> =
  | { some: true; value: T }
  | { some: false };

function findUser(id: string): Option<User> {
  const u = db.find(id);
  return u ? { some: true, value: u } : { some: false };
}

const r = findUser("u1");
if (r.some) {
  console.log(r.value.name);   // ✅ 收窄为 User
} else {
  console.log("not found");
}
\`\`\`

类似 Rust 的 \`Option\`、Haskell 的 \`Maybe\`——比 \`| null\` 更显式。

## 三、函数式错误处理：map / andThen / unwrap

光有 Result/Option 不够，还要有**链式组合**：

\`\`\`ts
class Ok<T> { constructor(readonly value: T) {} }
class Err<E> { constructor(readonly error: E) {} }
type Result2<T, E> = Ok<T> | Err<E>;

// map：成功时变换值，失败时透传
function map<T, U, E>(r: Result2<T, E>, fn: (v: T) => U): Result2<U, E> {
  return r instanceof Ok ? new Ok(fn(r.value)) : r;
}

// andThen：链式串联（失败则透传）
function andThen<T, U, E>(r: Result2<T, E>, fn: (v: T) => Result2<U, E>): Result2<U, E> {
  return r instanceof Ok ? fn(r.value) : r;
}
\`\`\`

链式调用 + 自动透传错误——比 \`try/catch\` 嵌套更线性、更可组合。

## 四、Brand 类型：让两个相同结构互不兼容

\`\`\`ts
// 普通做法：UserId 和 OrderId 都是 string，可以互相赋值（不安全）
type UserId = string;
type OrderId = string;
const uid: UserId = "u1";
const oid: OrderId = uid;  // ❌ 这不该允许，但 TS 允许了

// Brand 做法：标记类型，让 UserId 和 OrderId 不兼容
declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

const uid = "u1" as UserId;
const oid = uid as OrderId;  // ❌ 编译报错
\`\`\`

Brand 的本质：**给底层类型加个"幻影标记"**，运行时是普通 \`string\`，编译时却互不兼容。解决"两个相同底层类型不能互换"的问题。

## 五、Opaque 类型：另一种 brand 写法

\`\`\`ts
declare struct Brand<T, B>;  // 占位声明（无运行时开销）
type Opaque<T, B> = T & Brand<T, B>;

// 或更简洁的 unique symbol 写法
declare const tag: unique symbol;
type Opaque<T, B extends string> = T & { readonly [tag]: B };
\`\`\`

\`Brand\` 和 \`Opaque\` 是同一思路的不同实现。社区有 \`ts-brand\`、\`opaque-types\` 等库。

## 六、Brand 的实战场景

\`\`\`ts
// 1. 区分 ID 类型
type UserId = Brand<string, "UserId">;
type PostId = Brand<string, "PostId">;
function getUserPost(uid: UserId, pid: PostId) {}

// 2. 防止单位混淆
type Meters = Brand<number, "Meters">;
type Seconds = Brand<number, "Seconds">;
function speed(d: Meters, t: Seconds): number {
  return d / t;  // 不会传错单位
}

// 3. 类型化字符串
type Email = Brand<string, "Email">;
function makeEmail(s: string): Email | null {
  return s.includes("@") ? (s as Email) : null;
}
\`\`\`

## 七、用类型系统表达业务约束

更进一步的"类型驱动设计"——把业务规则编码进类型：

\`\`\`ts
// 用模板字面量类型限制格式
type Email = \`\${string}@\${string}.\${string}\`;
const e: Email = "a@b.com";  // ✅
// const e: Email = "abc";   // ❌ 不匹配格式

// 用字面量联合表达枚举状态
type OrderStatus = "pending" | "paid" | "shipped" | "done";

// 用条件类型表达"必填字段依赖"
type User<T extends "guest" | "member"> = T extends "member"
  ? { name: string; email: string }     // member 必须有 name + email
  : { name?: string };                  // guest 可选
\`\`\`

## 八、一句话总结

类型安全 API = **Result 表达错误** + **Option 表达可能为空** + **Brand 区分同构类型** + **字面量类型表达业务约束**。让错误用法编译不过去——这就是 TS 的"零成本抽象"。

> *下一章，TypeScript 最佳实践总结——大项目的实战经验。*`,
    code: `// 🛡️ 类型安全的 API 设计 Demo
// 演示 Result / Option / Brand / Opaque 类型 + 函数式错误处理

// ============================================================
// 1️⃣ Result<T, E>：把错误写进返回类型
// ============================================================

// 联合类型：成功 or 失败
type Result<T, E = Error> =
  | { ok: true; value: T }                   // 成功分支
  | { ok: false; error: E };                 // 失败分支

// 工厂函数：简化构造
const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// 示例：除法（可能失败）
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return err("除零错误");        // 失败：返回字符串错误
  return ok(a / b);                            // 成功：返回数值
}

console.log("--- 1️⃣ Result<T, E> ---");
const r1 = divide(10, 2);
if (r1.ok) {
  console.log("  10/2 =", r1.value);          // ✅ 收窄为 number
} else {
  console.log("  错误：", r1.error);          // ✅ 收窄为 string
}

const r2 = divide(10, 0);
if (r2.ok) {
  console.log("  10/0 =", r2.value);
} else {
  console.log("  错误：", r2.error);          // "除零错误"
}

// ============================================================
// 2️⃣ Option<T>：消除 null 的优雅方案
// ============================================================

type Option<T> =
  | { some: true; value: T }                  // 有值分支
  | { some: false };                          // 无值分支

const some = <T>(value: T): Option<T> => ({ some: true, value });
const none = (): Option<never> => ({ some: false });

// 示例：从数组查找
function findEven(arr: number[]): Option<number> {
  const found = arr.find(x => x % 2 === 0);   // find 返回 number | undefined
  return found !== undefined ? some(found) : none();
}

console.log("\\n--- 2️⃣ Option<T> ---");
const o1 = findEven([1, 3, 4, 5]);
if (o1.some) {
  console.log("  找到偶数：", o1.value);      // ✅ 收窄为 number
} else {
  console.log("  没找到");
}

const o2 = findEven([1, 3, 5]);
if (o2.some) {
  console.log("  找到偶数：", o2.value);
} else {
  console.log("  没找到偶数");                // 走这里
}

// ============================================================
// 3️⃣ 函数式错误处理：map / andThen 链式组合
// ============================================================

// 简化版 Result + 链式方法
class Ok<T> { constructor(readonly value: T) {} }
class Err<E> { constructor(readonly error: E) {} }
type Result2<T, E> = Ok<T> | Err<E>;

// map：成功时变换值，失败时透传
function map<T, U, E>(r: Result2<T, E>, fn: (v: T) => U): Result2<U, E> {
  return r instanceof Ok ? new Ok(fn(r.value)) : r;
}

// andThen：链式串联（失败则透传）
function andThen<T, U, E>(r: Result2<T, E>, fn: (v: T) => Result2<U, E>): Result2<U, E> {
  return r instanceof Ok ? fn(r.value) : r;
}

// unwrapOr：失败时给默认值
function unwrapOr<T, E>(r: Result2<T, E>, fallback: T): T {
  return r instanceof Ok ? r.value : fallback;
}

console.log("\\n--- 3️⃣ 函数式链式组合 ---");

// 业务函数：字符串转数字
function parseNum(s: string): Result2<number, string> {
  const n = Number(s);
  return isNaN(n) ? new Err("非数字") : new Ok(n);
}

// 业务函数：数字必须为正
function mustPositive(n: number): Result2<number, string> {
  return n > 0 ? new Ok(n) : new Err("非正数");
}

// 链式调用：解析 → 转换 → 校验，错误自动透传
const chain1 = andThen(parseNum("42"), mustPositive);
console.log("  parseNum('42') → mustPositive:", chain1 instanceof Ok ? chain1.value : chain1.error);

const chain2 = andThen(parseNum("-5"), mustPositive);
console.log("  parseNum('-5') → mustPositive:", chain2 instanceof Ok ? chain2.value : chain2.error);

const chain3 = andThen(parseNum("abc"), mustPositive);   // 解析失败，自动透传错误
console.log("  parseNum('abc') → mustPositive:", chain3 instanceof Ok ? chain3.value : chain3.error);

// map 变换成功值
const mapped = map(parseNum("10"), n => n * 2);
console.log("  map(*2):", mapped instanceof Ok ? mapped.value : mapped.error);

// unwrapOr 兜底
const safe = unwrapOr(parseNum("xyz"), 0);
console.log("  unwrapOr(0):", safe);

// ============================================================
// 4️⃣ Brand 类型：让两个相同结构互不兼容
// ============================================================

// 用 unique symbol 做标记
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

// 定义两种"被标记的 string"
type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

// 工厂函数：从普通 string 创建 Brand
function makeUserId(s: string): UserId {
  // 实际项目可以校验格式
  return s as UserId;                          // 强制断言为 UserId
}

function makeOrderId(s: string): OrderId {
  return s as OrderId;                         // 强制断言为 OrderId
}

// 业务函数：参数类型严格区分
function getUserOrder(uid: UserId, oid: OrderId): string {
  return \`用户 \${uid} 的订单 \${oid}\`;
}

console.log("\\n--- 4️⃣ Brand 类型 ---");
const uid = makeUserId("u_001");
const oid = makeOrderId("o_999");
console.log("  getUserOrder =", getUserOrder(uid, oid));

// ❌ 以下调用编译会报错（类型不兼容）：
// getUserOrder(oid, uid);   // 错：OrderId 不能赋给 UserId
// getUserOrder("u_001", "o_999");  // 错：普通 string 不能赋给 Brand 类型

// Brand 在运行时仍然是普通 string
console.log("  uid 运行时 =", uid, "类型 =", typeof uid);

// ============================================================
// 5️⃣ Brand 实战：单位防混淆
// ============================================================

console.log("\\n--- 5️⃣ Brand 单位防混淆 ---");

type Meters = Brand<number, "Meters">;
type Seconds = Brand<number, "Seconds">;

function asMeters(n: number): Meters { return n as Meters; }
function asSeconds(n: number): Seconds { return n as Seconds; }

function calcSpeed(d: Meters, t: Seconds): number {
  return d / t;                                // 单位已通过类型约束保证
}

const distance = asMeters(100);
const time = asSeconds(10);
console.log("  速度 =", calcSpeed(distance, time), "m/s");

// ❌ 编译报错：单位不匹配
// calcSpeed(time, distance);
// calcSpeed(100, 10);

// ============================================================
// 6️⃣ 模板字面量类型约束字符串格式
// ============================================================

console.log("\\n--- 6️⃣ 模板字面量类型 ---");

// 类型化 Email：必须包含 @ 和 .
type Email = \`\${string}@\${string}.\${string}\`;

// 类型守卫：检查格式后才能转 Email
function makeEmail(s: string): Email | null {
  // 用正则校验，符合才返回 Email
  return /^[^@]+@[^@]+\\.[^@]+$/.test(s) ? (s as Email) : null;
}

const e1 = makeEmail("alice@example.com");
const e2 = makeEmail("not-an-email");
console.log("  makeEmail('alice@example.com') =", e1);
console.log("  makeEmail('not-an-email')    =", e2);

// 模板字面量类型让赋值时编译期就校验
const verified: Email = "bob@test.org";        // ✅ 匹配格式
// const bad: Email = "no-at-symbol";         // ❌ 编译报错

// ============================================================
// 7️⃣ 用字面量联合表达业务状态
// ============================================================

console.log("\\n--- 7️⃣ 字面量联合状态机 ---");

type OrderStatus = "pending" | "paid" | "shipped" | "done" | "cancelled";

// 状态转移函数：编译期校验合法转移
function transition(from: OrderStatus, to: OrderStatus): OrderStatus | never {
  const allowed: Record<OrderStatus, OrderStatus[]> = {
    pending: ["paid", "cancelled"],            // 待支付 → 已支付 / 已取消
    paid: ["shipped"],                          // 已支付 → 已发货
    shipped: ["done"],                          // 已发货 → 已完成
    done: [],                                    // 已完成：终态
    cancelled: []                                // 已取消：终态
  };
  if (!allowed[from].includes(to)) {
    throw new Error(\`不允许的状态转移：\${from} → \${to}\`);
  }
  return to;
}

console.log("  pending → paid:", transition("pending", "paid"));
console.log("  paid → shipped:", transition("paid", "shipped"));
try {
  transition("pending", "shipped");             // 不允许直接从 pending 到 shipped
} catch (e) {
  console.log("  错误捕获:", (e as Error).message);
}

console.log("\\n✅ 类型安全 API 要点：Result 表达错误 + Option 表达空值 + Brand 区分同构 + 字面量表达约束");`,
  },

  // ===========================================================
  // 第 5 章：TypeScript 最佳实践总结
  // ===========================================================
  {
    id: "tsbook-ts-best-practice",
    title: "TypeScript 最佳实践总结",
    icon: "🏆",
    group: "设计模式与最佳实践",
    content: `# 🏆 TypeScript 最佳实践总结

写 TS 容易，写好 TS 难。本章是大项目实战的经验沉淀——从项目结构、命名约定到 \`any\` 的克制使用。

## 一、项目类型组织

大型项目建议按"领域"组织类型，而不是按"类型种别"：

\`\`\`
src/
├── types/                  # 全局共享类型
│   ├── common.ts           # 通用类型（ID、Time、Pagination）
│   └── index.ts            # 重新导出
├── features/               # 按业务领域分模块
│   ├── user/
│   │   ├── types.ts        # User 类型（领域内用）
│   │   ├── api.ts          # API 调用
│   │   └── index.ts
│   └── order/
│       └── types.ts
└── shared/                # 跨模块共享
    ├── utils/
    └── types/
\`\`\`

**关键原则**：
- 类型放在**离使用方最近的地方**（领域内的类型不放到全局 \`types/\`）
- 只有**真正跨模块复用**的类型才进 \`types/\`
- 每个模块用 \`index.ts\` 显式 re-export，对外只暴露公开 API

## 二、类型导出模式

\`\`\`ts
// ✅ 推荐：用 type 关键字导出纯类型
export type User = { id: string; name: string };
export type UserID = string;

// ❌ 不推荐：用 interface 当通用类型（interface 适合被实现/扩展）
export interface User { id: string; name: string; }
\`\`\`

**type vs interface 选型**：
- 简单对象形状 → \`type\`（更简洁、支持联合）
- 需要被 \`implements\` / 多次合并 → \`interface\`
- 联合、交叉、条件、映射类型 → 必须 \`type\`

## 三、命名约定

| 类型 | 命名 | 示例 |
|------|------|------|
| 类型 / 接口 | PascalCase | \`User\`、\`OrderItem\` |
| 类型变量（泛型） | T / U / K / V / E | \`T\`、\`Result<T, E>\` |
| 联合字面量 | PascalCase | \`OrderStatus\` |
| 工具类型后缀 | 加后缀 | \`UserDTO\`、\`UserInput\`、\`UserOutput\` |

> 别加 \`I\` 前缀（\`IUser\`）——那是 C# / Java 的习惯，TS 社区主流是不加。

## 四、避免 any 的实战技巧

\`\`\`ts
// ❌ 反面：直接用 any
function process(data: any) {
  return data.foo.bar;   // 运行时炸
}

// ✅ 技巧 1：用 unknown 代替 any
function process(data: unknown) {
  if (typeof data === "object" && data !== null && "foo" in data) {
    // 类型守卫后才能用
  }
}

// ✅ 技巧 2：用泛型保留类型信息
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

// ✅ 技巧 3：用 as unknown as T 做显式断言（比 as any 安全）
const el = document.querySelector("#x") as unknown as HTMLCanvasElement;

// ✅ 技巧 4：用 satisfies 检查对象形状（TS 4.9+）
const config = {
  host: "localhost",
  port: 3000
} satisfies Config;   // 类型被检查，但保留具体类型
\`\`\`

## 五、tsconfig 推荐配置

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUncheckedIndexedAccess": true,         // arr[0] 返回 T | undefined
    "noImplicitOverride": true,               // override 必须显式
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "noEmit": true
  },
  "include": ["src"]
}
\`\`\`

**进阶严格选项**：
- \`noUncheckedIndexedAccess\`：数组索引返回 \`T | undefined\`（防越界）
- \`noImplicitOverride\`：子类覆盖必须加 \`override\` 关键字
- \`exactOptionalPropertyTypes\`：可选属性不能赋 \`undefined\`（最严）

## 六、错误处理规范

\`\`\`ts
// ❌ 反面：抛字符串
throw "用户不存在";

// ✅ 正面：抛 Error 子类
class UserNotFoundError extends Error {
  constructor(public userId: string) {
    super(\`User \${userId} not found\`);
    this.name = "UserNotFoundError";
  }
}
throw new UserNotFoundError("u123");

// ✅ 返回 Result 而非抛错（见上一章）
function findUser(id: string): Result<User, NotFoundError> { ... }
\`\`\`

## 七、函数式偏好

\`\`\`ts
// ❌ 命令式：可变状态 + for 循环
let sum = 0;
for (const n of arr) sum += n;

// ✅ 函数式：纯函数 + 不可变
const sum = arr.reduce((a, b) => a + b, 0);

// ✅ 用 readonly 标记不可变参数
function process(arr: readonly number[]): number {
  // arr.push(1);   // ❌ 编译报错
  return arr.length;
}
\`\`\`

\`readonly\` 是 TS 的"软不可变"——编译期阻止修改，运行时仍是普通数组。

## 八、依赖注入与可测试性

\`\`\`ts
// ❌ 紧耦合：直接依赖具体类
class UserService {
  private repo = new UserRepo();   // 不可替换
}

// ✅ 解耦：依赖接口
interface IUserRepo {
  findById(id: string): User | null;
}

class UserService {
  constructor(private repo: IUserRepo) {}   // 注入接口
}

// 测试时注入 mock
const mockRepo: IUserRepo = { findById: () => null };
const svc = new UserService(mockRepo);
\`\`\`

## 九、性能与工程化建议

- **避免过度抽象**：3 个用例以下别抽工具函数
- **类型推导优先**：能用 \`const x = 1\` 别写 \`const x: number = 1\`
- **善用 \`satisfies\`**：检查形状又保留具体类型
- **API 边界定义类型**：从 API 入口到内部全链路类型贯通
- **不要用 \`enum\`**：用字面量联合 + \`as const\` 更轻量
- **第三方类型补丁**：放到 \`types/*.d.ts\`

## 十、一句话总结

TS 最佳实践的核心 = **项目分层清晰** + **类型导出克制** + **any 克制** + **strict 全开** + **接口依赖注入**。前期多写类型，后期少踩运行时坑——稳赚不赔。

> *至此 TypeScript 全解 60 章完结。回头再读一遍前 11 个 batch，温故而知新。*`,
    code: `// 🏆 TypeScript 最佳实践总结 Demo
// 演示项目类型组织 / 类型导出 / 避免 any / 严格配置 / 依赖注入

// ============================================================
// 1️⃣ 类型导出模式：type vs interface
// ============================================================

console.log("--- 1️⃣ 类型导出模式 ---");

// ✅ 推荐：用 type 表达对象形状（简洁、支持联合）
type User = {
  id: string;
  name: string;
  email?: string;                  // 可选字段
  readonly createdAt: Date;        // 只读字段
};

// 用 type 表达联合字面量（enum 替代方案）
type OrderStatus = "pending" | "paid" | "shipped" | "done";

// DTO 模式：用后缀区分用途
type UserDTO = Pick<User, "id" | "name">;        // 数据传输对象
type UserInput = Omit<User, "id" | "createdAt">;  // 输入表单

const u: User = {
  id: "u1",
  name: "张三",
  createdAt: new Date()
};
console.log("  User:", u);

// interface 适合需要被实现 / 扩展的场景
interface ILogger {
  log(msg: string): void;
}

class ConsoleLogger implements ILogger {
  log(msg: string): void {
    console.log("  [LOG]", msg);
  }
}

// ============================================================
// 2️⃣ 避免 any 的技巧
// ============================================================

console.log("\\n--- 2️⃣ 避免 any ---");

// ❌ 反面：直接 any
//   function process(data: any) { return data.foo.bar; }

// ✅ 技巧 1：unknown + 类型守卫
function processUnknown(data: unknown): string {
  if (typeof data === "object" && data !== null && "foo" in data) {
    const foo = (data as { foo: unknown }).foo;     // 收窄后再用
    return typeof foo === "string" ? foo : "非字符串";
  }
  return "未知结构";
}
console.log("  processUnknown({foo:'hi'}) =", processUnknown({ foo: "hi" }));
console.log("  processUnknown(123)        =", processUnknown(123));

// ✅ 技巧 2：泛型保留类型信息
function first<T>(arr: readonly T[]): T | undefined {
  return arr[0];                                    // 类型保留
}
const nums = [1, 2, 3];
const firstNum = first(nums);                       // number | undefined
console.log("  first([1,2,3]) =", firstNum);

// ✅ 技巧 3：satisfies 检查形状又保留具体类型（TS 4.9+）
type Config = {
  host: string;
  port: number;
  env?: string;
};

const config = {
  host: "localhost",
  port: 3000,
  env: "dev"
} satisfies Config;                                // ✅ 检查形状，但保留具体类型

// config.port 是 number 字面量 3000，不是宽泛的 number
console.log("  config.host =", config.host);
console.log("  config.port =", config.port);

// ✅ 技巧 4：用 readonly 标记不可变
function sumArr(arr: readonly number[]): number {
  // arr.push(1);                                  // ❌ 编译报错：readonly
  return arr.reduce((a, b) => a + b, 0);            // ✅ 纯函数
}
console.log("  sumArr([1,2,3]) =", sumArr([1, 2, 3]));

// ============================================================
// 3️⃣ 依赖注入与可测试性
// ============================================================

console.log("\\n--- 3️⃣ 依赖注入 ---");

// 接口：定义仓储契约
interface IUserRepo {
  findById(id: string): User | null;
  findAll(): User[];
}

// 真实实现：访问数据库
class DbUserRepo implements IUserRepo {
  private users: User[] = [
    { id: "u1", name: "Alice", createdAt: new Date() },
    { id: "u2", name: "Bob", createdAt: new Date() }
  ];
  findById(id: string): User | null {
    return this.users.find(u => u.id === id) ?? null;
  }
  findAll(): User[] {
    return [...this.users];                          // 返回副本，避免外部修改
  }
}

// 业务服务：依赖接口（不依赖具体类）
class UserService {
  constructor(private repo: IUserRepo) {}            // 构造函数注入

  getName(id: string): string {
    const u = this.repo.findById(id);
    return u ? u.name : "未知用户";
  }
}

// 真实场景
const realSvc = new UserService(new DbUserRepo());
console.log("  真实 getName('u1') =", realSvc.getName("u1"));

// 测试场景：注入 mock
const mockRepo: IUserRepo = {
  findById: (id) => ({ id, name: "MOCK", createdAt: new Date() }),
  findAll: () => []
};
const testSvc = new UserService(mockRepo);
console.log("  mock  getName('u1') =", testSvc.getName("u1"));

// ============================================================
// 4️⃣ 错误处理规范：抛 Error 子类
// ============================================================

console.log("\\n--- 4️⃣ 错误处理规范 ---");

// 自定义错误子类
class UserNotFoundError extends Error {
  constructor(public userId: string) {
    super(\`用户 \${userId} 不存在\`);                 // 调用父类构造
    this.name = "UserNotFoundError";                 // 设置错误名
    Object.setPrototypeOf(this, UserNotFoundError.prototype);  // 修复原型链
  }
}

class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

function findUserOrThrow(id: string): User {
  // 模拟查找
  if (id === "u1") {
    return { id, name: "Alice", createdAt: new Date() };
  }
  throw new UserNotFoundError(id);                   // 抛具体错误子类
}

try {
  findUserOrThrow("u999");
} catch (err) {
  // 用 instanceof 区分不同错误
  if (err instanceof UserNotFoundError) {
    console.log("  捕获 UserNotFoundError:", err.userId, err.message);
  } else if (err instanceof ValidationError) {
    console.log("  捕获 ValidationError:", err.field);
  } else {
    console.log("  未知错误");
  }
}

// ============================================================
// 5️⃣ 函数式偏好：纯函数 + 不可变数据
// ============================================================

console.log("\\n--- 5️⃣ 函数式偏好 ---");

// ❌ 命令式：可变状态
function sumImperative(arr: number[]): number {
  let sum = 0;
  for (const n of arr) sum += n;                     // 修改外部变量
  return sum;
}

// ✅ 函数式：纯函数
const sumFunctional = (arr: readonly number[]): number =>
  arr.reduce((a, b) => a + b, 0);

// ✅ 不可变更新：用展开运算符替代 push
const addTodo = (todos: readonly string[], todo: string): string[] =>
  [...todos, todo];                                  // 返回新数组，原数组不变

const todos = ["吃饭", "睡觉"];
const newTodos = addTodo(todos, "写代码");
console.log("  原 todos:", todos);
console.log("  新 todos:", newTodos);

// ✅ 用 Record + as const 替代 enum
const STATUS = {
  PENDING: "pending",
  PAID: "paid",
  SHIPPED: "shipped"
} as const;                                          // as const 让值变成字面量

type Status = typeof STATUS[keyof typeof STATUS];   // "pending" | "paid" | "shipped"
const s: Status = STATUS.PAID;
console.log("  status =", s);

// ============================================================
// 6️⃣ 项目类型组织示例（结构演示）
// ============================================================

console.log("\\n--- 6️⃣ 项目类型组织 ---");

// 真实项目结构（注释展示）：
/*
src/
├── types/
│   ├── common.ts       # 通用类型：ID, Pagination, Result
│   └── index.ts        # 统一 re-export
├── features/
│   ├── user/
│   │   ├── types.ts    # User 领域类型
│   │   ├── api.ts      # API 调用
│   │   └── index.ts    # 对外只暴露公开 API
│   └── order/
│       └── types.ts
└── shared/
    └── utils/
*/

// 通用类型（types/common.ts）
type ID<T extends string = string> = Brand<string, T>;
type Pagination = { page: number; pageSize: number };

declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

// 领域类型（features/user/types.ts）
type User2 = {
  id: ID<"User">;
  name: string;
  email?: string;
};

// 对外只暴露公开 API（features/user/index.ts）
// export type { User2 };
// export { UserService } from "./UserService";

const uid = "u1" as ID<"User">;
const user2: User2 = { id: uid, name: "Alice" };
console.log("  User:", user2);

// ============================================================
// 7️⃣ 推荐的 tsconfig.json（注释展示）
// ============================================================

console.log("\\n--- 7️⃣ 推荐 tsconfig ---");
console.log(\`  target: ES2022
  module: ESNext
  moduleResolution: Bundler
  strict: true
  noUncheckedIndexedAccess: true   # 数组索引返回 T | undefined
  noImplicitOverride: true           # override 必须显式
  noFallthroughCasesInSwitch: true  # switch case 必须有 break
  esModuleInterop: true
  skipLibCheck: true
  forceConsistentCasingInFileNames: true
  isolatedModules: true
  resolveJsonModule: true
  noEmit: true\`);

console.log("\\n✅ TS 最佳实践要点：项目分层 + type 导出克制 + 避 any + 严格 tsconfig + 接口依赖注入");
console.log("🎉 TypeScript 全解 60 章完结，恭喜！");`,
  },
];
