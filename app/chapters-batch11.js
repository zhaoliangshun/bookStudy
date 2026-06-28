// =============================================================
// Node.js 交互式教程 —— 第十一批章节（实战模式组，共 6 章）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：依赖注入
  // =========================================================
  {
    id: 'node-di-pattern',
    group: '实战模式',
    icon: '💉',
    title: '依赖注入',
    content: `## 依赖注入——让代码解耦的核心模式

依赖注入（Dependency Injection，简称 DI）是面向对象编程中最重要的设计模式之一。它的核心思想是：**一个对象不应该负责创建它所依赖的对象，而是应该由外部将依赖"注入"进来**。这听起来简单，但它带来的好处是革命性的——可测试性、可替换性和可维护性都得到了质的飞跃。

### 问题的根源：硬编码依赖

在没有依赖注入的代码中，一个类通常会直接在内部实例化它所依赖的其他类：

\`\`\`javascript
class OrderService {
  constructor() {
    // 硬编码依赖——OrderService 与 MySQL 数据库强耦合
    this.db = new MySQLDatabase('localhost', 3306, 'orders');
    this.email = new EmailService('smtp.company.com');
  }
}
\`\`\`

这种写法的问题很明显：如果你想换成 PostgreSQL、想进行单元测试时用内存数据库替代、或者想切换邮件服务提供商，你都必须修改 OrderService 的源码。**这违反了"开闭原则"——对扩展开放，对修改关闭**。

### 依赖注入的三种方式

**1. 构造函数注入（Constructor Injection）**

最推荐的方式，依赖在构造时一次性传入，对象创建后立即可用，且依赖关系不可变：

\`\`\`javascript
class OrderService {
  constructor(db, emailService) {
    this.db = db;               // 通过构造函数注入
    this.emailService = emailService;
  }
}
\`\`\`

**2. 属性注入（Setter/Property Injection）**

通过 setter 方法或直接赋值来注入依赖，灵活但依赖可能在对象生命周期中变化：

\`\`\`javascript
class OrderService {
  setDatabase(db) { this.db = db; }
  setEmailService(email) { this.emailService = email; }
}
\`\`\`

**3. 接口注入**

依赖通过实现特定接口来接收，在强类型语言中更常见，Node.js 中较少使用。

### IoC 容器（控制反转容器）

IoC（Inversion of Control）容器是依赖注入的自动化实现。它负责：
- **服务注册**：声明哪些类/实例是可注入的
- **依赖解析**：自动分析构造函数参数，递归创建依赖链
- **生命周期管理**：控制服务的创建和销毁策略

### 生命周期策略

| 策略 | 说明 | 适用场景 |
| --- | --- | --- |
| **Singleton（单例）** | 整个应用只创建一个实例，所有注入共享 | 数据库连接、配置对象、日志器 |
| **Transient（瞬态）** | 每次注入都创建新实例 | 请求上下文、DTO 对象 |
| **Scoped（作用域）** | 在同一作用域内共享实例（如 HTTP 请求） | Web 请求级别的上下文 |

### 依赖注入的优势

- **可测试性**：单元测试时可以轻松注入 Mock 对象，无需真实数据库或网络
- **解耦**：高层模块不依赖低层模块的具体实现，只依赖抽象
- **可替换性**：更换实现（如从 MySQL 切换到 PostgreSQL）只需修改注册代码
- **集中配置**：所有依赖关系在容器中统一管理，一目了然

下面代码实现一个完整的 IoC 容器，支持服务注册、自动解析依赖和生命周期管理。`,
    code: `// ============================================================
// 第一章代码演示：IoC 容器实现（依赖注入）
// ============================================================
// 实现一个简单的 IoC 容器，支持服务注册、自动解析
// 依赖和生命周期管理（Singleton / Transient）。

var util = require("util");

// ============================================================
// 演示 1：问题场景——硬编码依赖
// ============================================================
console.log("===== 演示 1：硬编码依赖的问题 =====");

// 模拟一个硬编码依赖的类——所有依赖在内部创建
function HardCodedOrderService() {
  // 直接在构造函数中创建依赖，无法替换
  this.db = { type: "MySQL", host: "localhost:3306", connect: function () { return "已连接 MySQL"; } };
  this.logger = { log: function (msg) { return "[LOG] " + msg; } };
  this.email = { send: function (to, body) { return "发送邮件到 " + to; } };
}

HardCodedOrderService.prototype.createOrder = function (order) {
  var dbMsg = this.db.connect();
  var logMsg = this.logger.log("创建订单: " + JSON.stringify(order));
  var emailMsg = this.email.send(order.email, "订单确认");
  return { dbMsg: dbMsg, logMsg: logMsg, emailMsg: emailMsg };
};

var hardService = new HardCodedOrderService();
var result = hardService.createOrder({ id: 1, email: "user@test.com" });
console.log("硬编码依赖的执行结果:");
console.log("  " + result.dbMsg);
console.log("  " + result.logMsg);
console.log("  " + result.emailMsg);
console.log("\\n问题: 要测试 OrderService 必须连接真实 MySQL，无法替换为 Mock");

// ============================================================
// 演示 2：IoC 容器核心实现
// ============================================================
console.log("\\n===== 演示 2：IoC 容器核心实现 =====");

/**
 * IoC 容器——管理服务的注册、解析和生命周期
 */
function IoCContainer() {
  // 服务注册表: { 服务名: { factory, lifecycle, instance } }
  this._registry = {};
}

/**
 * 注册一个服务
 * @param {string} name - 服务名称
 * @param {Function} factory - 工厂函数，接收 container 返回服务实例
 * @param {string} lifecycle - 生命周期: 'singleton' | 'transient'
 */
IoCContainer.prototype.register = function (name, factory, lifecycle) {
  lifecycle = lifecycle || "singleton";
  this._registry[name] = {
    factory: factory,
    lifecycle: lifecycle,
    instance: null, // singleton 缓存
  };
  console.log('  [注册] "' + name + '" (' + lifecycle + ')');
  return this;
};

/**
 * 解析（获取）一个服务实例
 * @param {string} name - 服务名称
 * @returns {*} 服务实例
 */
IoCContainer.prototype.resolve = function (name) {
  var entry = this._registry[name];
  if (!entry) {
    throw new Error('未注册的服务: "' + name + '"');
  }

  // singleton 生命周期——返回缓存的实例
  if (entry.lifecycle === "singleton") {
    if (!entry.instance) {
      console.log('  [解析] "' + name + '" → 创建单例实例');
      entry.instance = entry.factory(this);
    } else {
      console.log('  [解析] "' + name + '" → 返回缓存的单例');
    }
    return entry.instance;
  }

  // transient 生命周期——每次创建新实例
  console.log('  [解析] "' + name + '" → 创建瞬态实例');
  return entry.factory(this);
};

/**
 * 列出所有已注册的服务
 */
IoCContainer.prototype.list = function () {
  console.log("\\n已注册的服务:");
  console.log("名称".padEnd(20) + "生命周期".padEnd(15) + "已实例化");
  console.log("-".repeat(50));
  var self = this;
  Object.keys(self._registry).forEach(function (name) {
    var entry = self._registry[name];
    console.log(
      name.padEnd(20) +
      entry.lifecycle.padEnd(15) +
      (entry.instance ? "是" : "否")
    );
  });
};

// ============================================================
// 演示 3：使用 IoC 容器注册服务
// ============================================================
console.log("\\n===== 演示 3：注册服务到容器 =====");

var container = new IoCContainer();

// 注册数据库连接（单例——整个应用共享一个连接）
container.register("database", function (c) {
  return {
    type: "MySQL",
    host: "localhost:3306",
    connected: false,
    connect: function () {
      this.connected = true;
      return "MySQL 已连接 (localhost:3306)";
    },
    query: function (sql) {
      return { sql: sql, rows: [{ id: 1, name: "张三" }] };
    },
    close: function () {
      this.connected = false;
      return "MySQL 已断开";
    },
  };
}, "singleton");

// 注册日志服务（单例）
container.register("logger", function (c) {
  var logs = [];
  return {
    info: function (msg) {
      var entry = "[INFO] " + new Date().toISOString() + " " + msg;
      logs.push(entry);
      return entry;
    },
    error: function (msg) {
      var entry = "[ERROR] " + new Date().toISOString() + " " + msg;
      logs.push(entry);
      return entry;
    },
    getLogs: function () { return logs; },
  };
}, "singleton");

// 注册邮件服务（单例——配置不变）
container.register("emailService", function (c) {
  var logger = c.resolve("logger");
  return {
    send: function (to, subject, body) {
      var msg = '发送邮件 → ' + to + ' 主题: ' + subject;
      logger.info(msg);
      return msg;
    },
  };
}, "singleton");

// 注册订单服务（瞬态——每次请求创建新实例）
container.register("orderService", function (c) {
  var db = c.resolve("database");
  var logger = c.resolve("logger");
  var email = c.resolve("emailService");

  return {
    db: db,
    logger: logger,
    email: email,
    createOrder: function (order) {
      logger.info("创建订单: " + JSON.stringify(order));
      var dbResult = db.query("INSERT INTO orders ...");
      email.send(order.email, "订单确认", "订单 #" + order.id + " 已创建");
      return { success: true, orderId: order.id };
    },
  };
}, "transient");

// 注册用户服务（依赖 orderService 和其他服务）
container.register("userService", function (c) {
  var db = c.resolve("database");
  var logger = c.resolve("logger");

  return {
    getUser: function (id) {
      logger.info("查询用户: " + id);
      return db.query("SELECT * FROM users WHERE id = " + id);
    },
    createUser: function (user) {
      logger.info("创建用户: " + JSON.stringify(user));
      return { success: true, userId: user.id || 1 };
    },
  };
}, "singleton");

container.list();

// ============================================================
// 演示 4：解析服务并执行业务逻辑
// ============================================================
console.log("\\n===== 演示 4：解析服务并执行业务逻辑 =====");

// 获取 userService（会自动解析其依赖链）
console.log("\\n--- 获取 userService ---");
var userSvc = container.resolve("userService");
var userResult = userSvc.getUser(42);
console.log("查询结果: " + JSON.stringify(userResult));

// 获取 orderService（transient——每次都是新实例）
console.log("\\n--- 第一次获取 orderService ---");
var orderSvc1 = container.resolve("orderService");
var order1 = orderSvc1.createOrder({ id: 1001, email: "user@test.com", amount: 99 });
console.log("订单创建结果: " + JSON.stringify(order1));

console.log("\\n--- 第二次获取 orderService (transient 新实例) ---");
var orderSvc2 = container.resolve("orderService");
console.log("orderSvc1 === orderSvc2 ? " + (orderSvc1 === orderSvc2));
var order2 = orderSvc2.createOrder({ id: 1002, email: "vip@test.com", amount: 199 });
console.log("订单创建结果: " + JSON.stringify(order2));

// 验证 singleton——logger 和 database 是同一个实例
console.log("\\n--- 验证 Singleton 单例 ---");
var db1 = container.resolve("database");
var db2 = container.resolve("database");
console.log("database 是单例: " + (db1 === db2));

// ============================================================
// 演示 5：依赖注入的可测试性——替换为 Mock
// ============================================================
console.log("\\n===== 演示 5：可测试性——替换为 Mock =====");

var testContainer = new IoCContainer();

// 注册 Mock 数据库（内存实现，无需真实连接）
testContainer.register("database", function (c) {
  var data = [{ id: 1, name: "测试用户" }, { id: 2, name: "Mock用户" }];
  return {
    query: function (sql) {
      return { sql: sql, rows: data, from: "MockDatabase" };
    },
    connect: function () { return "Mock 已连接"; },
    close: function () { return "Mock 已断开"; },
  };
}, "singleton");

// 注册 Mock 日志器（不输出到文件，只记录到数组）
testContainer.register("logger", function (c) {
  var calls = [];
  return {
    info: function (msg) { calls.push({ level: "info", msg: msg }); },
    error: function (msg) { calls.push({ level: "error", msg: msg }); },
    getCalls: function () { return calls; },
  };
}, "singleton");

// 注册 Mock 邮件服务（不真实发送）
testContainer.register("emailService", function (c) {
  var sent = [];
  return {
    send: function (to, subject, body) {
      sent.push({ to: to, subject: subject });
      return { sent: true, to: to };
    },
    getSent: function () { return sent; },
  };
}, "singleton");

// 注册相同的 orderService（但依赖全部被 Mock 替换）
testContainer.register("orderService", function (c) {
  var db = c.resolve("database");
  var logger = c.resolve("logger");
  var email = c.resolve("emailService");

  return {
    createOrder: function (order) {
      logger.info("测试: 创建订单 " + JSON.stringify(order));
      var dbResult = db.query("INSERT INTO orders ...");
      email.send(order.email, "订单确认", "测试订单");
      return { success: true, orderId: order.id, db: dbResult.from };
    },
  };
}, "transient");

var testOrderSvc = testContainer.resolve("orderService");
var testResult = testOrderSvc.createOrder({ id: 999, email: "test@mock.com" });
console.log("Mock 测试结果: " + JSON.stringify(testResult));
console.log("\\n优势: 无需真实数据库、无需网络、测试速度快且完全隔离");

// ============================================================
// 演示 6：构造函数注入模式实践
// ============================================================
console.log("\\n===== 演示 6：构造函数注入最佳实践 =====");

/**
 * 使用构造函数注入的 OrderService
 * 依赖通过构造函数明确声明，不可变且类型清晰
 */
function OrderService(db, logger, emailService) {
  // 验证依赖不为空
  if (!db) throw new Error("OrderService 需要 database 依赖");
  if (!logger) throw new Error("OrderService 需要 logger 依赖");
  if (!emailService) throw new Error("OrderService 需要 emailService 依赖");

  this._db = db;
  this._logger = logger;
  this._email = emailService;
}

OrderService.prototype.placeOrder = function (order) {
  this._logger.info("处理订单: #" + order.id);

  // 验证库存
  var stock = this._db.query("SELECT stock FROM products WHERE id=" + order.productId);
  if (!stock || stock.rows.length === 0) {
    throw new Error("商品不存在");
  }

  // 创建订单
  var result = this._db.query("INSERT INTO orders ...");
  this._logger.info("订单 #" + order.id + " 创建成功");

  // 发送确认邮件
  this._email.send(order.email, "订单确认", "您的订单 #" + order.id + " 已确认");

  return { orderId: order.id, status: "confirmed" };
};

// 使用容器自动装配
var db = container.resolve("database");
var logger = container.resolve("logger");
var email = container.resolve("emailService");

var orderService = new OrderService(db, logger, email);
var placeResult = orderService.placeOrder({ id: 2001, productId: 5, email: "cust@test.com" });
console.log("下单结果: " + JSON.stringify(placeResult));

console.log("\\n===== IoC 容器与依赖注入演示完成 =====");
`,
  },

  // =========================================================
  // 第二章：Repository 模式
  // =========================================================
  {
    id: 'node-repository',
    group: '实战模式',
    icon: '🗄️',
    title: 'Repository 模式',
    content: `## Repository 模式——数据访问的抽象层

Repository 模式是企业应用架构中最经典的模式之一，它通过在业务逻辑和数据存储之间引入一个**抽象层**，将数据访问逻辑与业务逻辑完全分离。这个模式最初由 Martin Fowler 在《企业应用架构模式》中系统阐述，至今仍是后端开发的核心实践。

### 为什么需要 Repository？

在直接使用数据访问代码的应用中，业务逻辑层直接调用数据库 API：

\`\`\`javascript
// 业务逻辑中混入了数据访问细节——这是反模式
function getActiveUsers() {
  const db = new MySQLConnection();
  const rows = db.query("SELECT * FROM users WHERE status = 'active' ORDER BY created_at DESC");
  return rows.map(r => new User(r));
}
\`\`\`

这种写法的代价是：如果你想换数据库、想加入缓存、想进行单元测试，都需要修改业务逻辑代码。**Repository 模式通过"集合式"接口解决了这个问题**——业务层只看到 Repository 提供的抽象集合，不关心底层是 MySQL、MongoDB 还是内存数组。

### Repository 的核心职责

| 职责 | 说明 |
| --- | --- |
| **CRUD 封装** | 提供统一的增删改查接口，隐藏 SQL/ORM 细节 |
| **查询抽象** | 将查询条件封装为对象，避免 SQL 拼接 |
| **数据源切换** | 替换底层存储不影响业务代码 |
| **缓存策略** | 在 Repository 层实现缓存，业务层无感知 |
| **数据映射** | 将数据库行映射为领域对象（Domain Model） |

### 通用 Repository 接口

一个标准的 Repository 接口通常包含以下方法：

\`\`\`javascript
interface Repository<T> {
  findById(id): T | null;
  findAll(criteria?): T[];
  save(entity): T;
  update(id, data): T;
  delete(id): boolean;
  count(criteria?): number;
}
\`\`\`

### 查询条件封装

与其拼接 SQL 字符串，不如使用查询构建器：

\`\`\`javascript
// 查询条件对象——类型安全、可组合
const criteria = {
  where: { status: 'active', age: { gte: 18 } },
  orderBy: { field: 'createdAt', direction: 'desc' },
  limit: 20,
  offset: 0
};
const users = userRepo.findAll(criteria);
\`\`\`

### Repository 与 Service 层配合

典型的分层结构：

- **Controller 层**：处理 HTTP 请求，参数验证，调用 Service
- **Service 层**：业务逻辑，事务管理，跨 Repository 调用
- **Repository 层**：数据访问，CRUD 操作，查询构建
- **Domain 层**：领域模型，业务实体

Repository 层只负责"如何存取数据"，Service 层负责"如何处理业务规则"。

下面代码实现完整的 Repository 模式，包含通用接口、内存实现和查询构建器。`,
    code: `// ============================================================
// 第二章代码演示：Repository 模式实现
// ============================================================
// 实现通用 Repository 接口、内存数据源实现和查询
// 构建器，演示数据访问层抽象和替换。

var crypto = require("crypto");

// ============================================================
// 演示 1：查询构建器
// ============================================================
console.log("===== 演示 1：查询构建器 =====");

/**
 * 查询构建器——将查询条件封装为可组合的对象
 */
function QueryBuilder() {
  this._conditions = {};    // 等值条件: { status: 'active' }
  this._filters = [];       // 复杂过滤: [{ field, op, value }]
  this._orderBy = null;     // 排序: { field: 'name', direction: 'asc' }
  this._limit = null;       // 限制条数
  this._offset = null;      // 偏移量
}

// 设置等值条件
QueryBuilder.prototype.where = function (conditions) {
  var self = this;
  Object.keys(conditions).forEach(function (key) {
    self._conditions[key] = conditions[key];
  });
  return this;
};

// 添加复杂过滤条件
QueryBuilder.prototype.filter = function (field, op, value) {
  this._filters.push({ field: field, op: op, value: value });
  return this;
};

// 设置排序
QueryBuilder.prototype.orderBy = function (field, direction) {
  this._orderBy = { field: field, direction: direction || "asc" };
  return this;
};

// 设置分页
QueryBuilder.prototype.limit = function (n) {
  this._limit = n;
  return this;
};

QueryBuilder.prototype.offset = function (n) {
  this._offset = n;
  return this;
};

// 构建查询描述对象
QueryBuilder.prototype.build = function () {
  return {
    conditions: this._conditions,
    filters: this._filters,
    orderBy: this._orderBy,
    limit: this._limit,
    offset: this._offset,
  };
};

// 应用查询条件到数据数组
QueryBuilder.prototype.applyTo = function (items) {
  var result = items.slice(); // 浅拷贝，避免修改原数组

  // 1. 应用等值条件
  var self = this;
  Object.keys(self._conditions).forEach(function (key) {
    result = result.filter(function (item) {
      return item[key] === self._conditions[key];
    });
  });

  // 2. 应用复杂过滤
  self._filters.forEach(function (f) {
    result = result.filter(function (item) {
      var val = item[f.field];
      switch (f.op) {
        case "gt": return val > f.value;
        case "gte": return val >= f.value;
        case "lt": return val < f.value;
        case "lte": return val <= f.value;
        case "neq": return val !== f.value;
        case "in": return f.value.indexOf(val) !== -1;
        case "contains": return String(val).indexOf(f.value) !== -1;
        case "startsWith": return String(val).indexOf(f.value) === 0;
        default: return val === f.value;
      }
    });
  });

  // 3. 应用排序
  if (self._orderBy) {
    var field = self._orderBy.field;
    var dir = self._orderBy.direction === "desc" ? -1 : 1;
    result.sort(function (a, b) {
      if (a[field] < b[field]) return -1 * dir;
      if (a[field] > b[field]) return 1 * dir;
      return 0;
    });
  }

  // 4. 应用分页
  if (self._offset !== null) {
    result = result.slice(self._offset);
  }
  if (self._limit !== null) {
    result = result.slice(0, self._limit);
  }

  return result;
};

// 演示查询构建器
var users = [
  { id: 1, name: "张三", age: 28, status: "active", role: "admin" },
  { id: 2, name: "李四", age: 22, status: "active", role: "user" },
  { id: 3, name: "王五", age: 35, status: "inactive", role: "user" },
  { id: 4, name: "赵六", age: 30, status: "active", role: "admin" },
  { id: 5, name: "孙七", age: 19, status: "active", role: "user" },
];

var qb = new QueryBuilder();
qb.where({ status: "active" })
  .filter("age", "gte", 18)
  .orderBy("age", "desc")
  .limit(3);

var result = qb.applyTo(users);
console.log("查询条件: status=active, age>=18, 按age降序, 前3条");
result.forEach(function (u) {
  console.log("  " + u.name + " (年龄: " + u.age + ", 角色: " + u.role + ")");
});

// ============================================================
// 演示 2：通用 Repository 接口
// ============================================================
console.log("\\n===== 演示 2：通用 Repository 接口 =====");

/**
 * 基础 Repository 抽象类——定义标准 CRUD 接口
 */
function BaseRepository(options) {
  this.entityName = (options && options.entityName) || "Entity";
  this.idField = (options && options.idField) || "id";
}

// 生成唯一 ID
BaseRepository.prototype._generateId = function () {
  return crypto.randomBytes(8).toString("hex");
};

// 以下方法需要子类实现
BaseRepository.prototype.findById = function (id) {
  throw new Error("findById 必须由子类实现");
};

BaseRepository.prototype.findAll = function (queryBuilder) {
  throw new Error("findAll 必须由子类实现");
};

BaseRepository.prototype.save = function (entity) {
  throw new Error("save 必须由子类实现");
};

BaseRepository.prototype.update = function (id, data) {
  throw new Error("update 必须由子类实现");
};

BaseRepository.prototype.delete = function (id) {
  throw new Error("delete 必须由子类实现");
};

BaseRepository.prototype.count = function (queryBuilder) {
  throw new Error("count 必须由子类实现");
};

console.log("BaseRepository 接口定义完成");
console.log("  实体名: " + this.entityName);
console.log("  ID字段: " + this.idField);
console.log("  抽象方法: findById, findAll, save, update, delete, count");

// ============================================================
// 演示 3：内存 Repository 实现
// ============================================================
console.log("\\n===== 演示 3：内存 Repository 实现 =====");

/**
 * 内存 Repository——使用数组存储数据
 * 适用于测试、原型开发和小型应用
 */
function MemoryRepository(options) {
  BaseRepository.call(this, options);
  this._store = {}; // { id: entity }
  this._nextId = 1;
}

MemoryRepository.prototype = Object.create(BaseRepository.prototype);

MemoryRepository.prototype.findById = function (id) {
  return this._store[id] || null;
};

MemoryRepository.prototype.findAll = function (queryBuilder) {
  var all = Object.keys(this._store).map((function (key) {
    return this._store[key];
  }).bind(this));

  if (queryBuilder) {
    return queryBuilder.applyTo(all);
  }
  return all;
};

MemoryRepository.prototype.save = function (entity) {
  var id = entity[this.idField] || this._generateId();
  entity[this.idField] = id;
  entity._createdAt = entity._createdAt || new Date().toISOString();
  entity._updatedAt = new Date().toISOString();
  this._store[id] = Object.assign({}, entity);
  console.log('  [保存] ' + this.entityName + ' #' + id);
  return this._store[id];
};

MemoryRepository.prototype.update = function (id, data) {
  var existing = this._store[id];
  if (!existing) {
    throw new Error(this.entityName + ' #' + id + ' 不存在');
  }
  var self = this;
  Object.keys(data).forEach(function (key) {
    if (key !== self.idField && key !== "_createdAt") {
      existing[key] = data[key];
    }
  });
  existing._updatedAt = new Date().toISOString();
  console.log('  [更新] ' + this.entityName + ' #' + id);
  return existing;
};

MemoryRepository.prototype.delete = function (id) {
  if (!this._store[id]) return false;
  delete this._store[id];
  console.log('  [删除] ' + this.entityName + ' #' + id);
  return true;
};

MemoryRepository.prototype.count = function (queryBuilder) {
  if (queryBuilder) {
    return queryBuilder.applyTo(Object.values(this._store)).length;
  }
  return Object.keys(this._store).length;
};

// 创建 UserRepository
var userRepo = new MemoryRepository({ entityName: "User", idField: "id" });

// 填充测试数据
var testUsers = [
  { name: "张三", email: "zhangsan@test.com", age: 28, status: "active" },
  { name: "李四", email: "lisi@test.com", age: 22, status: "active" },
  { name: "王五", email: "wangwu@test.com", age: 35, status: "inactive" },
  { name: "赵六", email: "zhaoliu@test.com", age: 30, status: "active" },
  { name: "孙七", email: "sunqi@test.com", age: 19, status: "active" },
];

testUsers.forEach(function (u) {
  userRepo.save(u);
});

console.log("\\n已保存 " + userRepo.count() + " 个用户");

// ============================================================
// 演示 4：Repository CRUD 操作
// ============================================================
console.log("\\n===== 演示 4：CRUD 操作 =====");

// 查询所有
var allUsers = userRepo.findAll();
console.log("\\n--- 所有用户 ---");
allUsers.forEach(function (u) {
  console.log("  #" + u.id + " " + u.name + " (" + u.email + ")");
});

// 按 ID 查询
var user = userRepo.findById(allUsers[0].id);
console.log("\\n--- 按ID查询: " + user.id + " ---");
console.log("  姓名: " + user.name + ", 邮箱: " + user.email);

// 条件查询
console.log("\\n--- 条件查询: status=active, age>=25 ---");
var qb2 = new QueryBuilder();
qb2.where({ status: "active" }).filter("age", "gte", 25).orderBy("age", "desc");
var activeUsers = userRepo.findAll(qb2);
activeUsers.forEach(function (u) {
  console.log("  " + u.name + " (年龄: " + u.age + ")");
});

// 更新
console.log("\\n--- 更新用户 ---");
var updated = userRepo.update(user.id, { name: "张三(已更新)", age: 29 });
console.log("  更新后: " + updated.name + ", 年龄: " + updated.age);

// 删除
console.log("\\n--- 删除用户 ---");
var deleted = userRepo.delete(allUsers[4].id);
console.log("  删除结果: " + deleted);
console.log("  剩余用户数: " + userRepo.count());

// ============================================================
// 演示 5：OrderRepository 与 ProductRepository
// ============================================================
console.log("\\n===== 演示 5：多个 Repository 协同 =====");

var orderRepo = new MemoryRepository({ entityName: "Order", idField: "id" });
var productRepo = new MemoryRepository({ entityName: "Product", idField: "id" });

// 初始化产品数据
productRepo.save({ name: "MacBook Pro", price: 12999, stock: 50 });
productRepo.save({ name: "iPhone 15", price: 6999, stock: 100 });
productRepo.save({ name: "AirPods Pro", price: 1999, stock: 200 });

console.log("\\n产品列表:");
productRepo.findAll().forEach(function (p) {
  console.log("  " + p.name + " - ¥" + p.price + " (库存: " + p.stock + ")");
});

// 创建订单——使用多个 Repository 协同
console.log("\\n--- 创建订单 ---");
var products = productRepo.findAll();
var order = {
  customerName: "张三",
  items: [
    { productId: products[0].id, productName: products[0].name, quantity: 1, price: products[0].price },
    { productId: products[2].id, productName: products[2].name, quantity: 2, price: products[2].price },
  ],
  totalAmount: products[0].price + products[2].price * 2,
  status: "pending",
  createdAt: new Date().toISOString(),
};

var savedOrder = orderRepo.save(order);
console.log("订单详情:");
console.log("  订单号: #" + savedOrder.id);
console.log("  客户: " + savedOrder.customerName);
console.log("  商品:");
savedOrder.items.forEach(function (item) {
  console.log("    - " + item.productName + " x" + item.quantity + " = ¥" + (item.price * item.quantity));
});
console.log("  总金额: ¥" + savedOrder.totalAmount);
console.log("  状态: " + savedOrder.status);

// 更新订单状态
console.log("\\n--- 更新订单状态 ---");
orderRepo.update(savedOrder.id, { status: "confirmed" });
var confirmedOrder = orderRepo.findById(savedOrder.id);
console.log("  订单 #" + confirmedOrder.id + " 状态: " + confirmedOrder.status);

// ============================================================
// 演示 6：数据源替换——切换到不同数据源
// ============================================================
console.log("\\n===== 演示 6：数据源替换演示 =====");

/**
 * 模拟 MySQL Repository——演示数据源可替换
 * 实际项目中会连接真实数据库，这里用内存模拟接口
 */
function MySQLRepository(options) {
  MemoryRepository.call(this, options);
  this._dbType = "MySQL";
}

MySQLRepository.prototype = Object.create(MemoryRepository.prototype);

MySQLRepository.prototype.findById = function (id) {
  console.log("  [MySQL] SELECT * FROM " + this.entityName.toLowerCase() + "s WHERE id = " + id);
  return MemoryRepository.prototype.findById.call(this, id);
};

MySQLRepository.prototype.findAll = function (queryBuilder) {
  console.log("  [MySQL] SELECT * FROM " + this.entityName.toLowerCase() + "s" + (queryBuilder ? " (带条件)" : ""));
  return MemoryRepository.prototype.findAll.call(this, queryBuilder);
};

MySQLRepository.prototype.save = function (entity) {
  console.log("  [MySQL] INSERT INTO " + this.entityName.toLowerCase() + "s ...");
  return MemoryRepository.prototype.save.call(this, entity);
};

/**
 * 模拟 Redis 缓存 Repository——装饰器模式
 */
function CachedRepository(innerRepo, cache) {
  this._inner = innerRepo;
  this._cache = cache || {};
  this.entityName = innerRepo.entityName;
}

CachedRepository.prototype.findById = function (id) {
  var cacheKey = this.entityName + ":" + id;
  if (this._cache[cacheKey]) {
    console.log("  [缓存命中] " + cacheKey);
    return this._cache[cacheKey];
  }
  console.log("  [缓存未命中] " + cacheKey + " → 查询底层存储");
  var entity = this._inner.findById(id);
  if (entity) {
    this._cache[cacheKey] = entity;
  }
  return entity;
};

CachedRepository.prototype.findAll = function (queryBuilder) {
  return this._inner.findAll(queryBuilder);
};

CachedRepository.prototype.save = function (entity) {
  var saved = this._inner.save(entity);
  this._cache[this.entityName + ":" + saved[this._inner.idField]] = saved;
  return saved;
};

// 演示：创建 MySQL 风格的 Repository 并用缓存装饰
console.log("\\n--- MySQL + Redis 缓存 ---");
var mysqlUserRepo = new MySQLRepository({ entityName: "User", idField: "id" });
mysqlUserRepo.save({ name: "缓存测试用户", email: "cache@test.com" });

var cachedUserRepo = new CachedRepository(mysqlUserRepo);

// 第一次查询——缓存未命中，走 MySQL
console.log("\\n第一次查询（缓存未命中）:");
var u1 = cachedUserRepo.findById(Object.keys(mysqlUserRepo._store)[0]);

// 第二次查询——缓存命中
console.log("\\n第二次查询（缓存命中）:");
var u2 = cachedUserRepo.findById(Object.keys(mysqlUserRepo._store)[0]);

console.log("\\n数据源替换优势:");
console.log("  ✓ 业务代码无需修改——只需更换 Repository 实现");
console.log("  ✓ 测试使用内存 Repository，生产使用 MySQL Repository");
console.log("  ✓ 可叠加缓存层，业务逻辑无感知");

console.log("\\n===== Repository 模式演示完成 =====");
`,
  },

  // =========================================================
  // 第三章：Service 层设计
  // =========================================================
  {
    id: 'node-service-layer',
    group: '实战模式',
    icon: '🏗️',
    title: 'Service 层设计',
    content: `## Service 层设计——分层架构的核心

在现代后端架构中，**分层设计**是最基础也是最重要的架构原则。一个清晰的层次结构让代码职责分明、易于维护、便于测试。典型的四层架构如下：

\`\`\`
┌─────────────────────────────────┐
│         Controller 层            │  ← HTTP 请求处理、参数验证、响应格式化
├─────────────────────────────────┤
│          Service 层              │  ← 业务逻辑、事务管理、业务规则
├─────────────────────────────────┤
│        Repository 层             │  ← 数据访问、CRUD 操作、查询封装
├─────────────────────────────────┤
│         Domain 层                │  ← 领域实体、值对象、领域规则
└─────────────────────────────────┘
\`\`\`

### 各层职责

**Controller 层（表现层）**：
- 接收 HTTP 请求，解析参数
- 调用 Service 层处理业务
- 格式化响应（JSON/XML）
- 绝不包含业务逻辑

**Service 层（业务逻辑层）**：
- 封装业务规则和工作流
- 协调多个 Repository 完成复杂操作
- 事务管理（确保数据一致性）
- 权限校验、数据校验

**Repository 层（数据访问层）**：
- 封装数据存储的细节
- 提供 CRUD 接口
- 查询条件封装
- 不包含业务逻辑

**Domain 层（领域层）**：
- 领域实体（Entity）定义
- 值对象（Value Object）
- 领域规则（业务不变量）

### Service 层的关键职责

Service 层是分层架构的"中枢"。它不应该只是一个"数据传递者"，而应该包含真正的业务逻辑：

\`\`\`javascript
class OrderService {
  // 好的 Service——包含业务逻辑
  async placeOrder(userId, items) {
    const user = await this.userRepo.findById(userId);      // 1. 获取用户
    const products = await this.productRepo.findByIds(...);  // 2. 获取商品
    this.validateStock(products, items);                     // 3. 验证库存
    const total = this.calculateTotal(products, items);     // 4. 计算价格
    const order = await this.orderRepo.save({...});          // 5. 保存订单
    await this.inventoryRepo.deduct(items);                  // 6. 扣减库存
    await this.notificationService.send(order);              // 7. 发送通知
    return order;
  }
}
\`\`\`

### DTO vs Domain Model

- **DTO（Data Transfer Object）**：用于层间数据传输，通常是扁平的数据结构，不含业务逻辑
- **Domain Model**：包含业务行为和规则，是领域层的核心

### 跨 Service 调用

当一个 Service 需要调用另一个 Service 时，要注意避免循环依赖。解决方案：
- 通过事件解耦（Event-Driven）
- 提取共享逻辑到独立的领域服务
- 使用依赖注入容器管理依赖关系

下面代码实现完整的分层架构示例，包含 Controller、Service、Repository 三层。`,
    code: `// ============================================================
// 第三章代码演示：分层架构（Controller/Service/Repository）
// ============================================================
// 实现完整的分层架构，包含 Controller、Service、
// Repository 三层，演示业务逻辑封装和层间协作。

var crypto = require("crypto");

// ============================================================
// 演示 1：Domain 层——领域实体
// ============================================================
console.log("===== 演示 1：Domain 层——领域实体 =====");

/**
 * 用户实体
 */
function User(data) {
  this.id = data.id || "";
  this.name = data.name || "";
  this.email = data.email || "";
  this.balance = data.balance || 0;
  this.status = data.status || "active";
  this.createdAt = data.createdAt || new Date().toISOString();
}

// 领域规则：用户是否可以下单
User.prototype.canPlaceOrder = function () {
  return this.status === "active";
};

// 领域规则：扣款
User.prototype.deduct = function (amount) {
  if (this.balance < amount) {
    throw new Error("余额不足，当前余额: ¥" + this.balance + "，需要: ¥" + amount);
  }
  this.balance -= amount;
  return this.balance;
};

/**
 * 商品实体
 */
function Product(data) {
  this.id = data.id || "";
  this.name = data.name || "";
  this.price = data.price || 0;
  this.stock = data.stock || 0;
  this.status = data.status || "on_sale";
}

// 领域规则：减库存
Product.prototype.deductStock = function (quantity) {
  if (this.stock < quantity) {
    throw new Error("库存不足，当前库存: " + this.stock + "，需要: " + quantity);
  }
  this.stock -= quantity;
  return this.stock;
};

// 领域规则：是否在售
Product.prototype.isAvailable = function () {
  return this.status === "on_sale" && this.stock > 0;
};

/**
 * 订单实体
 */
function Order(data) {
  this.id = data.id || "";
  this.userId = data.userId || "";
  this.items = data.items || [];
  this.totalAmount = data.totalAmount || 0;
  this.status = data.status || "pending";
  this.createdAt = data.createdAt || new Date().toISOString();
}

// 领域规则：是否可以取消
Order.prototype.canCancel = function () {
  return this.status === "pending";
};

// 领域规则：计算总价
Order.prototype.calculateTotal = function () {
  var total = 0;
  this.items.forEach(function (item) {
    total += item.price * item.quantity;
  });
  this.totalAmount = total;
  return total;
};

console.log("Domain 实体定义完成:");
console.log("  User: 用户实体（余额、状态、扣款规则）");
console.log("  Product: 商品实体（库存、价格、减库存规则）");
console.log("  Order: 订单实体（订单项、总价、取消规则）");

// ============================================================
// 演示 2：Repository 层——数据访问
// ============================================================
console.log("\\n===== 演示 2：Repository 层——数据访问 =====");

/**
 * 通用 Repository 基类（内存实现）
 */
function BaseRepository() {
  this._store = {};
}

BaseRepository.prototype.findById = function (id) {
  return this._store[id] || null;
};

BaseRepository.prototype.findAll = function () {
  var self = this;
  return Object.keys(self._store).map(function (k) { return self._store[k]; });
};

BaseRepository.prototype.save = function (entity) {
  if (!entity.id) {
    entity.id = crypto.randomBytes(8).toString("hex");
  }
  this._store[entity.id] = entity;
  return entity;
};

BaseRepository.prototype.update = function (id, updates) {
  var entity = this._store[id];
  if (!entity) throw new Error("记录不存在: " + id);
  Object.keys(updates).forEach(function (key) {
    entity[key] = updates[key];
  });
  return entity;
};

BaseRepository.prototype.delete = function (id) {
  delete this._store[id];
  return true;
};

// 具体 Repository
function UserRepository() { BaseRepository.call(this); }
UserRepository.prototype = Object.create(BaseRepository.prototype);

// 按邮箱查找
UserRepository.prototype.findByEmail = function (email) {
  var users = this.findAll();
  return users.filter(function (u) { return u.email === email; })[0] || null;
};

function ProductRepository() { BaseRepository.call(this); }
ProductRepository.prototype = Object.create(BaseRepository.prototype);

// 批量按 ID 查找
ProductRepository.prototype.findByIds = function (ids) {
  var self = this;
  return ids.map(function (id) { return self.findById(id); }).filter(Boolean);
};

function OrderRepository() { BaseRepository.call(this); }
OrderRepository.prototype = Object.create(BaseRepository.prototype);

// 按用户查找订单
OrderRepository.prototype.findByUserId = function (userId) {
  return this.findAll().filter(function (o) { return o.userId === userId; });
};

console.log("Repository 层创建完成:");
console.log("  UserRepository, ProductRepository, OrderRepository");

// ============================================================
// 演示 3：Service 层——业务逻辑
// ============================================================
console.log("\\n===== 演示 3：Service 层——业务逻辑封装 =====");

/**
 * OrderService——封装订单业务逻辑
 * 不关心 HTTP，不关心数据如何存储，只关心业务规则
 */
function OrderService(userRepo, productRepo, orderRepo) {
  this.userRepo = userRepo;
  this.productRepo = productRepo;
  this.orderRepo = orderRepo;
}

/**
 * 下单——核心业务流程
 */
OrderService.prototype.placeOrder = function (userId, orderItems) {
  // 1. 获取用户并验证
  var user = this.userRepo.findById(userId);
  if (!user) {
    return { success: false, error: "用户不存在", code: "USER_NOT_FOUND" };
  }
  if (!user.canPlaceOrder()) {
    return { success: false, error: "用户状态异常，无法下单", code: "USER_INACTIVE" };
  }

  // 2. 获取商品并验证
  var self = this;
  var productIds = orderItems.map(function (item) { return item.productId; });
  var products = self.productRepo.findByIds(productIds);

  if (products.length !== orderItems.length) {
    return { success: false, error: "部分商品不存在", code: "PRODUCT_NOT_FOUND" };
  }

  // 验证商品是否在售和库存
  for (var i = 0; i < orderItems.length; i++) {
    var product = products[i];
    if (!product.isAvailable()) {
      return { success: false, error: '商品 "' + product.name + '" 已下架', code: "PRODUCT_UNAVAILABLE" };
    }
  }

  // 3. 计算总价
  var orderItemsWithPrice = orderItems.map(function (item) {
    var product = products.find(function (p) { return p.id === item.productId; });
    return {
      productId: item.productId,
      productName: product.name,
      price: product.price,
      quantity: item.quantity,
    };
  });

  var order = new Order({
    userId: userId,
    items: orderItemsWithPrice,
  });
  order.calculateTotal();

  // 4. 验证余额
  try {
    user.deduct(order.totalAmount);
  } catch (e) {
    return { success: false, error: e.message, code: "INSUFFICIENT_BALANCE" };
  }

  // 5. 扣减库存
  try {
    for (var j = 0; j < orderItems.length; j++) {
      var prod = products.find(function (p) { return p.id === orderItems[j].productId; });
      prod.deductStock(orderItems[j].quantity);
    }
  } catch (e) {
    // 回滚余额
    user.balance += order.totalAmount;
    return { success: false, error: e.message, code: "STOCK_ERROR" };
  }

  // 6. 保存订单和更新用户
  var savedOrder = self.orderRepo.save(order);
  self.userRepo.update(userId, { balance: user.balance });

  // 更新商品库存
  products.forEach(function (p) {
    self.productRepo.update(p.id, { stock: p.stock });
  });

  return {
    success: true,
    orderId: savedOrder.id,
    totalAmount: order.totalAmount,
    items: orderItemsWithPrice,
  };
};

/**
 * 取消订单
 */
OrderService.prototype.cancelOrder = function (orderId) {
  var order = this.orderRepo.findById(orderId);
  if (!order) {
    return { success: false, error: "订单不存在", code: "ORDER_NOT_FOUND" };
  }
  if (!order.canCancel()) {
    return { success: false, error: "订单状态不允许取消", code: "ORDER_CANNOT_CANCEL" };
  }

  // 恢复库存
  var self = this;
  order.items.forEach(function (item) {
    var product = self.productRepo.findById(item.productId);
    if (product) {
      product.stock += item.quantity;
      self.productRepo.update(product.id, { stock: product.stock });
    }
  });

  // 退款
  var user = this.userRepo.findById(order.userId);
  if (user) {
    user.balance += order.totalAmount;
    this.userRepo.update(user.id, { balance: user.balance });
  }

  // 更新订单状态
  this.orderRepo.update(orderId, { status: "cancelled" });

  return { success: true, orderId: orderId, refundAmount: order.totalAmount };
};

console.log("OrderService 创建完成");
console.log("  方法: placeOrder(), cancelOrder()");
console.log("  封装规则: 用户验证、商品验证、库存扣减、余额扣款、事务回滚");

// ============================================================
// 演示 4：Controller 层——HTTP 请求处理
// ============================================================
console.log("\\n===== 演示 4：Controller 层——HTTP 请求处理 =====");

/**
 * OrderController——处理 HTTP 请求
 * 只负责参数解析、调用 Service、格式化响应
 */
function OrderController(orderService) {
  this.orderService = orderService;
}

/**
 * POST /api/orders——创建订单
 */
OrderController.prototype.createOrder = function (req) {
  console.log("\\n[Controller] 收到 POST /api/orders 请求");

  // 1. 参数验证（Controller 层职责）
  var userId = req.body && req.body.userId;
  var items = req.body && req.body.items;

  if (!userId) {
    return { statusCode: 400, body: { error: "缺少 userId 参数" } };
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { statusCode: 400, body: { error: "items 不能为空" } };
  }

  for (var i = 0; i < items.length; i++) {
    if (!items[i].productId || !items[i].quantity) {
      return { statusCode: 400, body: { error: "每个 item 需要 productId 和 quantity" } };
    }
  }

  // 2. 调用 Service 层（Controller 不包含业务逻辑）
  var result = this.orderService.placeOrder(userId, items);

  // 3. 格式化响应
  if (result.success) {
    return {
      statusCode: 201,
      body: {
        message: "订单创建成功",
        data: {
          orderId: result.orderId,
          totalAmount: result.totalAmount,
          items: result.items,
        },
      },
    };
  } else {
    var statusMap = {
      USER_NOT_FOUND: 404,
      USER_INACTIVE: 403,
      PRODUCT_NOT_FOUND: 404,
      PRODUCT_UNAVAILABLE: 400,
      INSUFFICIENT_BALANCE: 402,
      STOCK_ERROR: 409,
    };
    return {
      statusCode: statusMap[result.code] || 500,
      body: { error: result.error, code: result.code },
    };
  }
};

/**
 * POST /api/orders/:id/cancel——取消订单
 */
OrderController.prototype.cancelOrder = function (req) {
  console.log("\\n[Controller] 收到 POST /api/orders/" + (req.params && req.params.id) + "/cancel 请求");

  var orderId = req.params && req.params.id;
  if (!orderId) {
    return { statusCode: 400, body: { error: "缺少订单 ID" } };
  }

  var result = this.orderService.cancelOrder(orderId);

  if (result.success) {
    return {
      statusCode: 200,
      body: { message: "订单已取消", data: { orderId: orderId, refundAmount: result.refundAmount } },
    };
  } else {
    var statusMap = { ORDER_NOT_FOUND: 404, ORDER_CANNOT_CANCEL: 400 };
    return { statusCode: statusMap[result.code] || 500, body: { error: result.error } };
  }
};

console.log("OrderController 创建完成");
console.log("  路由: POST /api/orders, POST /api/orders/:id/cancel");

// ============================================================
// 演示 5：完整业务流程演示
// ============================================================
console.log("\\n===== 演示 5：完整业务流程演示 =====");

// 初始化数据层
var userRepo = new UserRepository();
var productRepo = new ProductRepository();
var orderRepo = new OrderRepository();

// 初始化 Service 层
var orderService = new OrderService(userRepo, productRepo, orderRepo);

// 初始化 Controller 层
var orderController = new OrderController(orderService);

// 填充测试数据
var user1 = new User({ id: "u1", name: "张三", email: "zhangsan@test.com", balance: 50000 });
var user2 = new User({ id: "u2", name: "李四", email: "lisi@test.com", balance: 1000, status: "inactive" });
userRepo.save(user1);
userRepo.save(user2);

var p1 = new Product({ id: "p1", name: "MacBook Pro", price: 12999, stock: 10 });
var p2 = new Product({ id: "p2", name: "iPhone 15", price: 6999, stock: 20 });
var p3 = new Product({ id: "p3", name: "AirPods Pro", price: 1999, stock: 0, status: "sold_out" });
productRepo.save(p1);
productRepo.save(p2);
productRepo.save(p3);

console.log("初始数据:");
console.log("  用户: " + user1.name + " (余额: ¥" + user1.balance + ")");
console.log("  商品: " + p1.name + " (¥" + p1.price + ", 库存: " + p1.stock + ")");
console.log("  商品: " + p2.name + " (¥" + p2.price + ", 库存: " + p2.stock + ")");
console.log("  商品: " + p3.name + " (缺货)");

// 场景 1：正常下单
console.log("\\n--- 场景 1：正常下单 ---");
var req1 = { body: { userId: "u1", items: [{ productId: "p1", quantity: 1 }, { productId: "p2", quantity: 2 }] } };
var res1 = orderController.createOrder(req1);
console.log("响应: " + res1.statusCode + " " + JSON.stringify(res1.body));

// 场景 2：用户不存在
console.log("\\n--- 场景 2：用户不存在 ---");
var req2 = { body: { userId: "u999", items: [{ productId: "p1", quantity: 1 }] } };
var res2 = orderController.createOrder(req2);
console.log("响应: " + res2.statusCode + " " + JSON.stringify(res2.body));

// 场景 3：用户状态异常
console.log("\\n--- 场景 3：用户状态异常 ---");
var req3 = { body: { userId: "u2", items: [{ productId: "p1", quantity: 1 }] } };
var res3 = orderController.createOrder(req3);
console.log("响应: " + res3.statusCode + " " + JSON.stringify(res3.body));

// 场景 4：商品缺货
console.log("\\n--- 场景 4：商品缺货 ---");
var req4 = { body: { userId: "u1", items: [{ productId: "p3", quantity: 1 }] } };
var res4 = orderController.createOrder(req4);
console.log("响应: " + res4.statusCode + " " + JSON.stringify(res4.body));

// 场景 5：取消订单
console.log("\\n--- 场景 5：取消订单 ---");
var orderId = res1.body.data.orderId;
var req5 = { params: { id: orderId } };
var res5 = orderController.cancelOrder(req5);
console.log("响应: " + res5.statusCode + " " + JSON.stringify(res5.body));

// 验证数据一致性
console.log("\\n--- 数据一致性验证 ---");
var finalUser = userRepo.findById("u1");
console.log("用户余额: ¥" + finalUser.balance + " (原始: ¥50000, 下单扣款已退款)");
var finalProduct = productRepo.findById("p1");
console.log("商品库存: " + finalProduct.stock + " (原始: 10, 下单扣减后取消恢复)");

console.log("\\n===== 分层架构演示完成 =====");
`,
  },

  // =========================================================
  // 第四章：健康检查
  // =========================================================
  {
    id: 'node-health-check',
    group: '实战模式',
    icon: '❤️',
    title: '健康检查',
    content: `## 健康检查——生产环境的生命线

在生产环境中，知道你的应用是否"活着"和"健康"是至关重要的。健康检查（Health Check）是现代微服务架构的**基础设施**，它让负载均衡器、容器编排系统（Kubernetes）和监控系统能够自动判断服务状态，并做出相应决策。

### 健康检查的类型

Kubernetes 定义了三种健康检查探针：

| 探针类型 | 端点 | 用途 | 失败后果 |
| --- | --- | --- | --- |
| **Liveness Probe** | /health/liveness | 检测应用是否"活着"（进程没死） | 重启容器 |
| **Readiness Probe** | /health/readiness | 检测应用是否"准备好"接收流量 | 从 Service 摘除 |
| **Startup Probe** | /health/startup | 检测应用是否启动完成 | 阻止 Liveness/Readiness 检查 |

### 检查项设计

一个好的健康检查器应该能够检查多个维度：

- **数据库连接**：能否成功连接数据库并执行简单查询
- **缓存服务**：Redis/Memcached 是否可达
- **外部 API**：依赖的第三方服务是否正常
- **磁盘空间**：临时目录是否有足够空间
- **内存使用**：堆内存使用率是否在安全范围内
- **消息队列**：能否连接到 Kafka/RabbitMQ

### 检查结果聚合

健康检查器汇总所有检查项的结果，返回统一格式：

\`\`\`json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "checks": {
    "database": { "status": "healthy", "latency": "12ms" },
    "redis": { "status": "healthy", "latency": "5ms" },
    "disk": { "status": "degraded", "message": "磁盘使用率 85%" }
  }
}
\`\`\`

### 超时控制

每个检查项都应该有独立的超时时间，防止某个外部服务挂起导致整个健康检查阻塞。总体健康检查也应该有总超时时间。

### 优雅关闭

当应用收到 SIGTERM 信号时，应该立即将 Readiness 探针标记为"不健康"，让负载均衡器停止发送流量，同时等待现有请求处理完毕。

下面代码实现完整的健康检查器，支持多个检查项、超时控制和 K8s 风格的状态返回。`,
    code: `// ============================================================
// 第四章代码演示：健康检查器实现
// ============================================================
// 实现健康检查器，支持多个检查项、超时控制、
// 分级状态和 K8s 风格的探针端点。

var os = require("os");
var EventEmitter = require("events").EventEmitter;

// ============================================================
// 演示 1：健康检查器核心实现
// ============================================================
console.log("===== 演示 1：健康检查器核心实现 =====");

/**
 * 健康检查状态枚举
 */
var HealthStatus = {
  HEALTHY: "healthy",       // 一切正常
  DEGRADED: "degraded",     // 部分功能降级但仍可用
  UNHEALTHY: "unhealthy",   // 不可用
};

/**
 * 健康检查器
 */
function HealthChecker() {
  EventEmitter.call(this);
  this._checks = {};          // 检查项注册表: { name: { fn, timeout, critical } }
  this._results = {};         // 最近一次检查结果
  this._lastCheckTime = null; // 最近一次检查时间
  this._overallStatus = HealthStatus.HEALTHY;
  this._isShuttingDown = false; // 优雅关闭标记
}

HealthChecker.prototype = Object.create(EventEmitter.prototype);

/**
 * 注册一个检查项
 * @param {string} name - 检查项名称
 * @param {Function} checkFn - 检查函数，返回 { status, message, latency } 或 Promise
 * @param {Object} options - { timeout: 毫秒, critical: 是否关键项 }
 */
HealthChecker.prototype.register = function (name, checkFn, options) {
  options = options || {};
  this._checks[name] = {
    fn: checkFn,
    timeout: options.timeout || 3000,   // 默认 3 秒超时
    critical: options.critical !== false, // 默认是关键项
  };
  console.log('  [注册] 检查项: "' + name + '" (超时: ' + this._checks[name].timeout + 'ms, 关键: ' + this._checks[name].critical + ')');
  return this;
};

/**
 * 执行单个检查项（带超时控制）
 */
HealthChecker.prototype._runCheck = function (name, checkConfig) {
  var self = this;
  var startTime = Date.now();

  return new Promise(function (resolve) {
    var timeoutId = null;
    var settled = false;

    // 设置超时
    timeoutId = setTimeout(function () {
      if (!settled) {
        settled = true;
        resolve({
          name: name,
          status: HealthStatus.UNHEALTHY,
          message: "检查超时 (>" + checkConfig.timeout + "ms)",
          latency: Date.now() - startTime,
          critical: checkConfig.critical,
        });
      }
    }, checkConfig.timeout);

    // 执行检查函数
    try {
      var result = checkConfig.fn();
      // 支持同步和异步（Promise）返回值
      if (result && typeof result.then === "function") {
        result.then(function (checkResult) {
          if (!settled) {
            settled = true;
            clearTimeout(timeoutId);
            resolve(self._normalizeResult(name, checkResult, checkConfig, startTime));
          }
        }).catch(function (err) {
          if (!settled) {
            settled = true;
            clearTimeout(timeoutId);
            resolve({
              name: name,
              status: HealthStatus.UNHEALTHY,
              message: "检查异常: " + (err.message || err),
              latency: Date.now() - startTime,
              critical: checkConfig.critical,
            });
          }
        });
      } else {
        if (!settled) {
          settled = true;
          clearTimeout(timeoutId);
          resolve(self._normalizeResult(name, result, checkConfig, startTime));
        }
      }
    } catch (err) {
      if (!settled) {
        settled = true;
        clearTimeout(timeoutId);
        resolve({
          name: name,
          status: HealthStatus.UNHEALTHY,
          message: "检查异常: " + (err.message || err),
          latency: Date.now() - startTime,
          critical: checkConfig.critical,
        });
      }
    }
  });
};

/**
 * 标准化检查结果
 */
HealthChecker.prototype._normalizeResult = function (name, result, checkConfig, startTime) {
  if (result && typeof result === "object" && result.status) {
    result.latency = result.latency || Date.now() - startTime;
    result.name = name;
    result.critical = checkConfig.critical;
    return result;
  }
  // 如果返回的是简单值，视为 healthy
  return {
    name: name,
    status: HealthStatus.HEALTHY,
    latency: Date.now() - startTime,
    critical: checkConfig.critical,
  };
};

/**
 * 运行所有检查项
 * @returns {Promise<Object>} 汇总的检查结果
 */
HealthChecker.prototype.runAll = function () {
  var self = this;

  // 如果正在关闭，直接返回 unhealthy
  if (self._isShuttingDown) {
    return Promise.resolve({
      status: HealthStatus.UNHEALTHY,
      message: "服务正在关闭",
      timestamp: new Date().toISOString(),
      checks: {},
    });
  }

  var checkNames = Object.keys(self._checks);
  var promises = checkNames.map(function (name) {
    return self._runCheck(name, self._checks[name]);
  });

  return Promise.all(promises).then(function (results) {
    // 汇总结果
    var checks = {};
    var overallStatus = HealthStatus.HEALTHY;

    results.forEach(function (r) {
      checks[r.name] = {
        status: r.status,
        latency: r.latency + "ms",
        message: r.message || "",
      };

      // 关键项 unhealthy → 整体 unhealthy
      if (r.critical && r.status === HealthStatus.UNHEALTHY) {
        overallStatus = HealthStatus.UNHEALTHY;
      }
      // 非关键项 unhealthy 或任何项 degraded → 整体 degraded（但不超过 unhealthy）
      if (overallStatus !== HealthStatus.UNHEALTHY) {
        if (r.status === HealthStatus.UNHEALTHY || r.status === HealthStatus.DEGRADED) {
          overallStatus = HealthStatus.DEGRADED;
        }
      }
    });

    self._results = checks;
    self._lastCheckTime = new Date().toISOString();
    self._overallStatus = overallStatus;

    self.emit("check-complete", { status: overallStatus, checks: checks });

    return {
      status: overallStatus,
      timestamp: self._lastCheckTime,
      uptime: process.uptime(),
      checks: checks,
    };
  });
};

/**
 * 获取 Liveness 状态（轻量级，只检查进程是否存活）
 */
HealthChecker.prototype.getLiveness = function () {
  return {
    status: this._isShuttingDown ? HealthStatus.UNHEALTHY : HealthStatus.HEALTHY,
    timestamp: new Date().toISOString(),
  };
};

/**
 * 获取 Readiness 状态（检查是否准备好接收流量）
 */
HealthChecker.prototype.getReadiness = function () {
  if (this._isShuttingDown) {
    return { status: HealthStatus.UNHEALTHY, message: "服务正在关闭" };
  }
  return {
    status: this._overallStatus,
    timestamp: this._lastCheckTime,
    checks: this._results,
  };
};

/**
 * 标记为关闭中（优雅关闭）
 */
HealthChecker.prototype.shutdown = function () {
  this._isShuttingDown = true;
  this._overallStatus = HealthStatus.UNHEALTHY;
  console.log("\\n[健康检查] 服务标记为关闭中，Readiness 返回 unhealthy");
};

console.log("HealthChecker 核心实现完成");

// ============================================================
// 演示 2：注册检查项
// ============================================================
console.log("\\n===== 演示 2：注册检查项 =====");

var checker = new HealthChecker();

// 检查项 1：数据库连接（关键）
checker.register("database", function () {
  // 模拟数据库连接检查
  var latency = Math.floor(Math.random() * 50) + 5;
  var healthy = Math.random() > 0.1; // 90% 概率健康
  return {
    status: healthy ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
    message: healthy ? "MySQL 连接正常" : "MySQL 连接被拒绝",
    latency: latency,
  };
}, { timeout: 3000, critical: true });

// 检查项 2：Redis 缓存（关键）
checker.register("redis", function () {
  return new Promise(function (resolve) {
    // 模拟异步 Redis PING
    var latency = Math.floor(Math.random() * 20) + 2;
    setTimeout(function () {
      resolve({
        status: HealthStatus.HEALTHY,
        message: "Redis PONG",
        latency: latency,
      });
    }, latency);
  });
}, { timeout: 2000, critical: true });

// 检查项 3：磁盘空间（非关键）
checker.register("disk", function () {
  var usagePercent = Math.floor(Math.random() * 30) + 60; // 60-90%
  if (usagePercent > 90) {
    return {
      status: HealthStatus.UNHEALTHY,
      message: "磁盘使用率 " + usagePercent + "%（超过 90%）",
    };
  } else if (usagePercent > 80) {
    return {
      status: HealthStatus.DEGRADED,
      message: "磁盘使用率 " + usagePercent + "%（超过 80% 阈值）",
    };
  }
  return {
    status: HealthStatus.HEALTHY,
    message: "磁盘使用率 " + usagePercent + "%",
  };
}, { timeout: 1000, critical: false });

// 检查项 4：内存使用（非关键）
checker.register("memory", function () {
  var totalMem = os.totalmem();
  var freeMem = os.freemem();
  var usagePercent = Math.round((1 - freeMem / totalMem) * 100);
  var heapUsed = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

  if (usagePercent > 95) {
    return {
      status: HealthStatus.UNHEALTHY,
      message: "内存使用率 " + usagePercent + "% (堆内存: " + heapUsed + "MB)",
    };
  } else if (usagePercent > 85) {
    return {
      status: HealthStatus.DEGRADED,
      message: "内存使用率高 " + usagePercent + "% (堆内存: " + heapUsed + "MB)",
    };
  }
  return {
    status: HealthStatus.HEALTHY,
    message: "内存使用率 " + usagePercent + "% (堆内存: " + heapUsed + "MB)",
  };
}, { timeout: 1000, critical: false });

// 检查项 5：外部 API（关键）
checker.register("externalApi", function () {
  return new Promise(function (resolve) {
    var latency = Math.floor(Math.random() * 200) + 50;
    setTimeout(function () {
      resolve({
        status: HealthStatus.HEALTHY,
        message: "外部 API 可达 (https://api.example.com)",
        latency: latency,
      });
    }, latency);
  });
}, { timeout: 5000, critical: true });

console.log("\\n已注册检查项: " + Object.keys(checker._checks).join(", "));

// ============================================================
// 演示 3：执行健康检查
// ============================================================
console.log("\\n===== 演示 3：执行健康检查 =====");

// 监听检查完成事件
checker.on("check-complete", function (result) {
  console.log("\\n[事件] 检查完成，整体状态: " + result.status);
});

checker.runAll().then(function (result) {
  console.log("\\n===== 健康检查报告 =====");
  console.log("状态: " + result.status.toUpperCase());
  console.log("时间: " + result.timestamp);
  console.log("运行时间: " + Math.round(result.uptime) + "s");
  console.log("\\n检查详情:");
  console.log("检查项".padEnd(18) + "状态".padEnd(14) + "延迟".padEnd(10) + "说明");
  console.log("-".repeat(70));

  Object.keys(result.checks).forEach(function (name) {
    var c = result.checks[name];
    var statusLabel = c.status === "healthy" ? "✓ 正常" : (c.status === "degraded" ? "⚠ 降级" : "✗ 异常");
    console.log(
      name.padEnd(18) +
      statusLabel.padEnd(14) +
      c.latency.padEnd(10) +
      (c.message || "")
    );
  });
});

// ============================================================
// 演示 4：Kubernetes 探针端点
// ============================================================
console.log("\\n===== 演示 4：Kubernetes 探针端点 =====");

// 模拟 HTTP 服务器路由
function simulateProbe(checker) {
  console.log("\\n--- 模拟 K8s 探针请求 ---");

  // Liveness 探针：GET /health/liveness
  console.log("\\nGET /health/liveness");
  var liveness = checker.getLiveness();
  console.log("  响应: " + JSON.stringify(liveness));

  // Readiness 探针：GET /health/readiness
  console.log("\\nGET /health/readiness");
  var readiness = checker.getReadiness();
  console.log("  整体状态: " + readiness.status);
  if (readiness.checks) {
    Object.keys(readiness.checks).forEach(function (name) {
      console.log("    " + name + ": " + readiness.checks[name].status);
    });
  }

  // Startup 探针：GET /health/startup
  console.log("\\nGET /health/startup");
  console.log("  响应: { status: 'healthy' } (应用已启动完成)");
}

// 等待第一次检查完成后模拟探针
setTimeout(function () {
  simulateProbe(checker);
}, 500);

// ============================================================
// 演示 5：优雅关闭时的健康检查
// ============================================================
console.log("\\n===== 演示 5：优雅关闭 =====");

setTimeout(function () {
  console.log("\\n--- 收到 SIGTERM 信号，开始优雅关闭 ---");
  console.log("1. 标记健康检查为 unhealthy");
  checker.shutdown();

  console.log("\\n2. Readiness 探针响应:");
  var readinessAfterShutdown = checker.getReadiness();
  console.log("   " + JSON.stringify(readinessAfterShutdown));

  console.log("\\n3. Liveness 探针响应:");
  var livenessAfterShutdown = checker.getLiveness();
  console.log("   " + JSON.stringify(livenessAfterShutdown));

  console.log("\\n4. 负载均衡器看到 Readiness 为 unhealthy → 停止发送流量");
  console.log("5. 等待现有请求处理完毕（graceful shutdown timeout）");
  console.log("6. 关闭数据库连接、释放资源");
  console.log("7. 进程退出 → K8s 重启新 Pod");

  console.log("\\n优雅关闭流程完成。");
}, 1000);

// ============================================================
// 演示 6：健康检查器摘要
// ============================================================
console.log("\\n===== 演示 6：健康检查器配置摘要 =====");

console.log("\\nK8s 探针配置建议:");
console.log("  Liveness Probe:");
console.log("    path: /health/liveness");
console.log("    initialDelaySeconds: 30");
console.log("    periodSeconds: 10");
console.log("    timeoutSeconds: 3");
console.log("    failureThreshold: 3");
console.log("\\n  Readiness Probe:");
console.log("    path: /health/readiness");
console.log("    initialDelaySeconds: 5");
console.log("    periodSeconds: 5");
console.log("    timeoutSeconds: 5");
console.log("    failureThreshold: 2");
console.log("\\n  Startup Probe:");
console.log("    path: /health/startup");
console.log("    initialDelaySeconds: 0");
console.log("    periodSeconds: 5");
console.log("    failureThreshold: 30");

console.log("\\n已注册检查项:");
Object.keys(checker._checks).forEach(function (name) {
  var c = checker._checks[name];
  console.log("  " + name + " (超时: " + c.timeout + "ms, 关键: " + c.critical + ")");
});

console.log("\\n===== 健康检查演示完成 =====");
`,
  },

  // =========================================================
  // 第五章：重试与断路器
  // =========================================================
  {
    id: 'node-retry-circuit',
    group: '实战模式',
    icon: '🔁',
    title: '重试与断路器',
    content: `## 重试与断路器——构建弹性系统

在分布式系统中，**失败是常态而非异常**。网络抖动、服务暂时不可用、数据库连接超时——这些都不是 Bug，而是分布式系统的固有特征。如何优雅地处理这些失败，让系统在部分组件故障时仍能正常工作，是每个后端工程师必须掌握的技能。

### 重试策略

重试是最简单的容错手段，但"如何重试"大有讲究：

**固定间隔重试**：每次重试之间等待固定时间。

\`\`\`javascript
// 最简单的重试：固定间隔 1 秒
retry(operation, { retries: 3, interval: 1000 });
\`\`\`

**指数退避（Exponential Backoff）**：每次重试的等待时间翻倍，避免给故障服务造成"雪崩"。

\`\`\`javascript
// 指数退避：1s → 2s → 4s → 8s
retry(operation, { retries: 4, backoff: 'exponential', baseDelay: 1000 });
\`\`\`

**随机抖动（Jitter）**：在退避时间上增加随机偏移，避免多个客户端同时重试造成"惊群效应"。

\`\`\`javascript
// 指数退避 + 随机抖动：1s±200ms → 2s±400ms → 4s±800ms
retry(operation, { retries: 3, backoff: 'exponential', jitter: true });
\`\`\`

### 断路器模式（Circuit Breaker）

断路器是比简单重试更高级的容错模式，灵感来自电气工程中的断路器：

| 状态 | 行为 | 转换条件 |
| --- | --- | --- |
| **Closed（关闭）** | 正常请求通过，记录失败次数 | 失败次数达到阈值 → Open |
| **Open（打开）** | 直接拒绝请求，快速失败 | 超时时间到 → Half-Open |
| **Half-Open（半开）** | 允许少量请求试探 | 成功 → Closed；失败 → Open |

### 断路器 vs 重试

重试和断路器通常是配合使用的：
- 断路器在"上游"快速判断服务是否可用
- 如果断路器放行，内部仍然可以使用重试来处理临时故障
- 断路器打开后，连重试都不需要——直接快速失败

### 降级策略（Fallback）

当断路器打开或重试耗尽时，应该执行降级策略：
- 返回缓存数据
- 返回默认值
- 调用备用服务
- 返回友好的错误提示

下面代码实现重试器（指数退避+抖动）和断路器，演示故障恢复流程。`,
    code: `// ============================================================
// 第五章代码演示：重试器与断路器实现
// ============================================================
// 实现重试器（指数退避+抖动）和断路器模式，
// 演示分布式系统中的故障恢复机制。

var util = require("util");

// ============================================================
// 演示 1：重试器实现
// ============================================================
console.log("===== 演示 1：重试器实现 =====");

/**
 * 重试器——支持多种退避策略
 */
function Retryer(options) {
  this.maxRetries = (options && options.maxRetries) || 3;
  this.baseDelay = (options && options.baseDelay) || 1000;      // 基础延迟（毫秒）
  this.maxDelay = (options && options.maxDelay) || 30000;       // 最大延迟
  this.backoff = (options && options.backoff) || "exponential"; // 退避策略: fixed | exponential
  this.jitter = (options && options.jitter) !== false;          // 是否启用随机抖动
  this.retryableErrors = (options && options.retryableErrors) || null; // 可重试的错误类型
}

/**
 * 计算第 N 次重试的延迟时间
 */
Retryer.prototype._calculateDelay = function (attempt) {
  var delay;

  if (this.backoff === "fixed") {
    delay = this.baseDelay;
  } else if (this.backoff === "exponential") {
    // 指数退避: baseDelay * 2^(attempt-1)
    delay = this.baseDelay * Math.pow(2, attempt - 1);
  } else {
    delay = this.baseDelay;
  }

  // 限制最大延迟
  delay = Math.min(delay, this.maxDelay);

  // 添加随机抖动（±30%）
  if (this.jitter) {
    var jitterRange = delay * 0.3;
    var jitter = (Math.random() * 2 - 1) * jitterRange;
    delay = Math.max(0, Math.round(delay + jitter));
  }

  return delay;
};

/**
 * 执行带重试的操作
 * @param {Function} fn - 要执行的操作（可返回 Promise 或普通值）
 * @returns {Promise} 操作结果
 */
Retryer.prototype.execute = function (fn) {
  var self = this;
  var attempt = 0;

  return new Promise(function (resolve, reject) {
    function tryOnce() {
      attempt++;

      console.log("  [重试] 第 " + attempt + " 次尝试...");

      try {
        var result = fn();
        // 处理同步和异步返回值
        if (result && typeof result.then === "function") {
          result.then(function (value) {
            console.log("  [成功] 第 " + attempt + " 次尝试成功");
            resolve(value);
          }).catch(function (err) {
            handleError(err);
          });
        } else {
          console.log("  [成功] 第 " + attempt + " 次尝试成功");
          resolve(result);
        }
      } catch (err) {
        handleError(err);
      }
    }

    function handleError(err) {
      console.log("  [失败] 第 " + attempt + " 次尝试失败: " + (err.message || err));

      // 检查错误是否可重试
      if (self.retryableErrors && !self.retryableErrors.some(function (e) {
        return err instanceof e || err.message === e;
      })) {
        console.log("  [放弃] 错误类型不可重试");
        return reject(err);
      }

      // 检查是否还有重试次数
      if (attempt >= self.maxRetries) {
        console.log("  [放弃] 已达到最大重试次数 (" + self.maxRetries + ")");
        return reject(new Error("重试耗尽: " + (err.message || err)));
      }

      // 计算延迟并重试
      var delay = self._calculateDelay(attempt);
      console.log("  [等待] " + delay + "ms 后重试...");
      setTimeout(tryOnce, delay);
    }

    tryOnce();
  });
};

// 测试重试器
console.log("\\n--- 测试：固定间隔重试 ---");
var fixedRetryer = new Retryer({ maxRetries: 3, baseDelay: 200, backoff: "fixed", jitter: false });

var callCount = 0;
fixedRetryer.execute(function () {
  callCount++;
  if (callCount < 3) {
    throw new Error("临时故障 #" + callCount);
  }
  return "操作成功";
}).then(function (result) {
  console.log("\\n最终结果: " + result);
}).catch(function (err) {
  console.log("\\n最终失败: " + err.message);
});

// ============================================================
// 演示 2：指数退避 + 抖动
// ============================================================
console.log("\\n===== 演示 2：指数退避 + 随机抖动 =====");

// 延迟一定时间，让演示 1 的异步操作完成
setTimeout(function () {
  var expRetryer = new Retryer({
    maxRetries: 4,
    baseDelay: 100,
    backoff: "exponential",
    jitter: true,
  });

  console.log("退避策略: 指数退避 + 30% 随机抖动");
  console.log("基础延迟: 100ms, 最大重试: 4 次\\n");

  // 模拟延迟时序
  console.log("理论延迟序列:");
  for (var i = 1; i <= 4; i++) {
    var delay = expRetryer._calculateDelay(i);
    console.log("  第 " + i + " 次重试后等待: " + delay + "ms");
  }

  var failCount = 0;
  expRetryer.execute(function () {
    failCount++;
    if (failCount < 4) {
      throw new Error("网络超时");
    }
    return "指数退避重试成功";
  }).then(function (result) {
    console.log("\\n最终结果: " + result);
    console.log("总共尝试: " + failCount + " 次");
  }).catch(function (err) {
    console.log("\\n最终失败: " + err.message);
  });
}, 1500);

// ============================================================
// 演示 3：断路器的实现
// ============================================================
setTimeout(function () {
  console.log("\\n===== 演示 3：断路器实现 =====");

  /**
   * 断路器状态
   */
  var CircuitState = {
    CLOSED: "CLOSED",       // 正常——请求通过
    OPEN: "OPEN",           // 熔断——直接拒绝
    HALF_OPEN: "HALF_OPEN", // 半开——试探性恢复
  };

  /**
   * 断路器
   */
  function CircuitBreaker(options) {
    options = options || {};
    this.failureThreshold = options.failureThreshold || 3;    // 失败阈值
    this.resetTimeout = options.resetTimeout || 10000;        // 熔断恢复超时（ms）
    this.halfOpenMaxRequests = options.halfOpenMaxRequests || 1; // 半开状态最大试探请求数

    this.state = CircuitState.CLOSED;
    this.failureCount = 0;           // 当前失败计数
    this.lastFailureTime = null;     // 最近一次失败时间
    this.halfOpenRequests = 0;       // 半开状态中的请求数
    this.stats = {
      totalRequests: 0,
      totalFailures: 0,
      totalSuccesses: 0,
      stateChanges: [],
    };
  }

  /**
   * 执行受断路器保护的操作
   */
  CircuitBreaker.prototype.execute = function (fn, fallback) {
    var self = this;

    return new Promise(function (resolve, reject) {
      // 检查是否可以执行
      if (!self._allowRequest()) {
        var reason = "断路器已打开，快速拒绝请求";
        console.log("  [断路器] " + reason);
        self.stats.totalRequests++;
        self.stats.totalFailures++;

        if (fallback) {
          console.log("  [降级] 执行降级策略");
          try {
            var fbResult = fallback();
            return resolve(fbResult);
          } catch (fbErr) {
            return reject(fbErr);
          }
        }
        return reject(new Error(reason));
      }

      // 允许执行
      self.stats.totalRequests++;
      if (self.state === CircuitState.HALF_OPEN) {
        self.halfOpenRequests++;
      }

      try {
        var result = fn();
        if (result && typeof result.then === "function") {
          result.then(function (value) {
            self._onSuccess();
            resolve(value);
          }).catch(function (err) {
            self._onFailure(err);
            if (fallback) {
              console.log("  [降级] 执行降级策略");
              try {
                resolve(fallback());
              } catch (fbErr) {
                reject(fbErr);
              }
            } else {
              reject(err);
            }
          });
        } else {
          self._onSuccess();
          resolve(result);
        }
      } catch (err) {
        self._onFailure(err);
        if (fallback) {
          console.log("  [降级] 执行降级策略");
          try {
            resolve(fallback());
          } catch (fbErr) {
            reject(fbErr);
          }
        } else {
          reject(err);
        }
      }
    });
  };

  /**
   * 判断是否允许请求通过
   */
  CircuitBreaker.prototype._allowRequest = function () {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }

    if (this.state === CircuitState.OPEN) {
      // 检查是否超过熔断超时时间
      var elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.resetTimeout) {
        console.log("  [断路器] OPEN → HALF_OPEN (超时 " + this.resetTimeout + "ms 已过)");
        this._transitionTo(CircuitState.HALF_OPEN);
        this.halfOpenRequests = 0;
        return true;
      }
      return false;
    }

    if (this.state === CircuitState.HALF_OPEN) {
      // 限制半开状态的最大试探请求数
      return this.halfOpenRequests < this.halfOpenMaxRequests;
    }

    return true;
  };

  /**
   * 请求成功回调
   */
  CircuitBreaker.prototype._onSuccess = function () {
    this.stats.totalSuccesses++;
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      console.log("  [断路器] HALF_OPEN → CLOSED (试探成功)");
      this._transitionTo(CircuitState.CLOSED);
    }
  };

  /**
   * 请求失败回调
   */
  CircuitBreaker.prototype._onFailure = function (err) {
    this.stats.totalFailures++;
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      console.log("  [断路器] HALF_OPEN → OPEN (试探失败)");
      this._transitionTo(CircuitState.OPEN);
      return;
    }

    if (this.state === CircuitState.CLOSED && this.failureCount >= this.failureThreshold) {
      console.log("  [断路器] CLOSED → OPEN (失败次数 " + this.failureCount + " >= " + this.failureThreshold + ")");
      this._transitionTo(CircuitState.OPEN);
    }
  };

  /**
   * 状态转换
   */
  CircuitBreaker.prototype._transitionTo = function (newState) {
    var oldState = this.state;
    this.state = newState;
    this.stats.stateChanges.push({
      from: oldState,
      to: newState,
      time: new Date().toISOString(),
    });
  };

  /**
   * 获取断路器状态
   */
  CircuitBreaker.prototype.getState = function () {
    return {
      state: this.state,
      failureCount: this.failureCount,
      stats: this.stats,
    };
  };

  // 创建断路器实例
  var breaker = new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 5000, // 5秒后尝试恢复
    halfOpenMaxRequests: 1,
  });

  console.log("断路器配置: 失败阈值=3, 熔断超时=5000ms, 半开试探请求=1");
  console.log("初始状态: " + breaker.state);

  // ============================================================
  // 演示 4：断路器工作流程
  // ============================================================
  console.log("\\n===== 演示 4：断路器工作流程 =====");

  var callIndex = 0;

  function simulateServiceCall() {
    callIndex++;
    // 模拟一个经常失败的服务
    if (callIndex <= 4) {
      return Promise.reject(new Error("服务不可用 (请求 #" + callIndex + ")"));
    }
    return Promise.resolve("服务响应正常 (请求 #" + callIndex + ")");
  }

  function fallbackResponse() {
    return { fromCache: true, data: "降级数据——缓存中的旧数据", timestamp: new Date().toISOString() };
  }

  // 模拟连续请求
  function makeRequest(label) {
    console.log("\\n--- " + label + " ---");
    console.log("当前断路器状态: " + breaker.state);

    breaker.execute(simulateServiceCall, fallbackResponse).then(function (result) {
      console.log("  结果: " + (typeof result === "object" ? JSON.stringify(result) : result));
      console.log("  断路器状态: " + breaker.state);
    }).catch(function (err) {
      console.log("  错误: " + err.message);
      console.log("  断路器状态: " + breaker.state);
    });
  }

  // 连续发送请求，触发断路器
  makeRequest("请求 1 (失败)");
  makeRequest("请求 2 (失败)");
  makeRequest("请求 3 (失败) → 触发熔断");
  makeRequest("请求 4 (断路器打开，快速拒绝)");
  makeRequest("请求 5 (断路器打开，快速拒绝)");

  // 等待熔断超时后，断路器进入半开状态
  setTimeout(function () {
    console.log("\\n===== 演示 5：断路器恢复 =====");
    console.log("\\n等待 " + (breaker.resetTimeout / 1000) + " 秒后，断路器超时...");

    // 重置 callIndex 让服务恢复
    callIndex = 0;

    makeRequest("半开状态试探请求");
    makeRequest("服务恢复正常");

    // 显示统计
    console.log("\\n--- 断路器统计 ---");
    var state = breaker.getState();
    console.log("当前状态: " + state.state);
    console.log("总请求: " + state.stats.totalRequests);
    console.log("成功: " + state.stats.totalSuccesses);
    console.log("失败: " + state.stats.totalFailures);
    console.log("状态变更历史:");
    state.stats.stateChanges.forEach(function (change) {
      console.log("  " + change.from + " → " + change.to + " (" + change.time + ")");
    });

    console.log("\\n===== 重试与断路器演示完成 =====");
  }, 6000);
}, 4000);
`,
  },

  // =========================================================
  // 第六章：分页设计
  // =========================================================
  {
    id: 'node-pagination',
    group: '实战模式',
    icon: '📄',
    title: '分页设计',
    content: `## 分页设计——从偏移到游标

分页是 API 设计中最常见也最容易做错的功能之一。当数据量变大时，一个看似简单的分页实现可能带来严重的性能问题和数据一致性问题。

### 两种主流分页策略

**1. 偏移分页（Offset-based Pagination）**

最直观的分页方式——跳过前 N 条记录，取接下来的 M 条：

\`\`\`javascript
GET /api/users?page=2&pageSize=20
// SQL: SELECT * FROM users LIMIT 20 OFFSET 20
\`\`\`

请求和响应格式：

\`\`\`json
{
  "total": 1000,
  "page": 2,
  "pageSize": 20,
  "totalPages": 50,
  "items": [...]
}
\`\`\`

**2. 游标分页（Cursor-based Pagination）**

使用记录的某个唯一标识作为"游标"，每次查询"游标之后"的数据：

\`\`\`javascript
GET /api/users?cursor=eyJpZCI6MjB9&limit=20
// SQL: SELECT * FROM users WHERE id > 20 ORDER BY id LIMIT 20
\`\`\`

### 偏移分页的致命缺陷

偏移分页看似简单，但有两个严重问题：

**数据重复/遗漏**：当用户在翻页过程中，如果有新数据插入或删除，会导致：
- 数据插入到前面的页 → 翻页后看到重复数据
- 数据从前面被删除 → 翻页后遗漏数据

**性能问题**：OFFSET 越大，数据库需要扫描的行数越多。OFFSET 100000 意味着数据库需要扫描并丢弃前 10 万行。

### 游标分页的优势

游标分页使用稳定排序字段（通常是自增 ID 或时间戳），完美解决了偏移分页的问题：

- **数据一致性**：新插入的数据不会影响已翻过的页（因为游标是固定的）
- **性能稳定**：无论数据量多大，查询始终使用索引，性能恒定
- **实时友好**：适合无限滚动、社交动态等场景

### 游标分页的实现要点

1. 需要一个**唯一且可排序的字段**（如自增 ID、创建时间）
2. 游标需要**编码**（Base64），防止客户端依赖内部实现
3. 响应中返回 nextCursor 和 hasMore，而不是 total 和 totalPages

### 什么时候用哪种？

| 场景 | 推荐策略 |
| --- | --- |
| 管理后台、数据表格 | 偏移分页（需要跳页和总数） |
| 社交动态、信息流 | 游标分页（实时数据、无限滚动） |
| 搜索结果 | 偏移分页（需要总页数） |
| API Feed | 游标分页（高性能、一致性） |

下面代码实现两种分页模式，通过对比演示各自的优缺点。`,
    code: `// ============================================================
// 第六章代码演示：分页设计（偏移分页 vs 游标分页）
// ============================================================
// 实现偏移分页和游标分页两种模式，对比优缺点，
// 演示数据一致性问题和性能差异。

// ============================================================
// 演示 1：模拟数据集
// ============================================================
console.log("===== 演示 1：构建模拟数据集 =====");

/**
 * 生成模拟用户数据
 */
function generateUsers(count) {
  var users = [];
  var names = ["张三", "李四", "王五", "赵六", "孙七", "周八", "吴九", "郑十", "陈一", "刘二"];
  for (var i = 1; i <= count; i++) {
    users.push({
      id: i,
      name: names[i % names.length] + i,
      email: "user" + i + "@example.com",
      age: 18 + (i % 50),
      createdAt: new Date(Date.now() - (count - i) * 3600000).toISOString(),
    });
  }
  return users;
}

var users = generateUsers(100);
console.log("已生成 " + users.length + " 条用户数据");
console.log("第一条: " + users[0].name + " (id: " + users[0].id + ")");
console.log("最后一条: " + users[users.length - 1].name + " (id: " + users[users.length - 1].id + ")");

// ============================================================
// 演示 2：偏移分页实现
// ============================================================
console.log("\\n===== 演示 2：偏移分页（Offset-based）=====");

/**
 * 偏移分页器
 * @param {Array} data - 数据源
 * @param {Object} options - { page, pageSize }
 * @returns {Object} 分页结果
 */
function offsetPaginate(data, options) {
  var page = (options && options.page) || 1;
  var pageSize = (options && options.pageSize) || 10;

  if (page < 1) page = 1;
  if (pageSize < 1) pageSize = 10;
  if (pageSize > 100) pageSize = 100;

  var total = data.length;
  var totalPages = Math.ceil(total / pageSize);
  var offset = (page - 1) * pageSize;
  var items = data.slice(offset, offset + pageSize);

  return {
    total: total,
    page: page,
    pageSize: pageSize,
    totalPages: totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    items: items,
  };
}

// 演示偏移分页
console.log("\\n--- 第 1 页 (pageSize=10) ---");
var page1 = offsetPaginate(users, { page: 1, pageSize: 10 });
console.log("总记录: " + page1.total + ", 总页数: " + page1.totalPages);
console.log("当前页: " + page1.page + "/" + page1.totalPages);
page1.items.forEach(function (u) {
  console.log("  #" + u.id + " " + u.name + " (" + u.email + ")");
});

console.log("\\n--- 第 5 页 (pageSize=10) ---");
var page5 = offsetPaginate(users, { page: 5, pageSize: 10 });
console.log("当前页: " + page5.page + "/" + page5.totalPages);
page5.items.forEach(function (u) {
  console.log("  #" + u.id + " " + u.name);
});

console.log("\\n--- 最后一页 ---");
var lastPage = offsetPaginate(users, { page: page1.totalPages, pageSize: 10 });
console.log("当前页: " + lastPage.page + "/" + lastPage.totalPages);
console.log("hasNext: " + lastPage.hasNext + ", hasPrev: " + lastPage.hasPrev);
lastPage.items.forEach(function (u) {
  console.log("  #" + u.id + " " + u.name);
});

// ============================================================
// 演示 3：偏移分页的数据一致性问题
// ============================================================
console.log("\\n===== 演示 3：偏移分页的数据一致性问题 =====");

console.log("\\n场景: 用户在浏览第 1 页时，有新数据插入到最前面");
console.log("\\n--- 原始数据（第 1 页，pageSize=5）---");
var originalPage1 = offsetPaginate(users, { page: 1, pageSize: 5 });
originalPage1.items.forEach(function (u) {
  console.log("  #" + u.id + " " + u.name);
});

// 模拟新数据插入
console.log("\\n⚠ 此时有新用户注册！(id: 101, 102 插入到最前面)");
var usersWithInsert = users.slice(); // 复制
usersWithInsert.unshift(
  { id: 101, name: "新用户A", email: "new-a@test.com", age: 25, createdAt: new Date().toISOString() },
  { id: 102, name: "新用户B", email: "new-b@test.com", age: 30, createdAt: new Date().toISOString() }
);

console.log("\\n--- 现在请求第 2 页（pageSize=5）---");
var problemPage2 = offsetPaginate(usersWithInsert, { page: 2, pageSize: 5 });
problemPage2.items.forEach(function (u) {
  console.log("  #" + u.id + " " + u.name);
});
console.log("\\n问题: 原本第 1 页最后 2 条记录（id:4,5）被挤到了第 2 页");
console.log("      用户翻页后会看到重复数据！");

// 数据删除场景
console.log("\\n\\n场景: 用户浏览第 1 页时，前面的数据被删除");
var usersWithDelete = users.slice(5); // 删除前 5 条
console.log("\\n--- 删除前 5 条后请求第 1 页（pageSize=5）---");
var deletedPage1 = offsetPaginate(usersWithDelete, { page: 1, pageSize: 5 });
deletedPage1.items.forEach(function (u) {
  console.log("  #" + u.id + " " + u.name);
});
console.log("\\n问题: 原本第 2 页的前 5 条（id:6-10）现在变成了第 1 页");
console.log("      用户翻页后会遗漏 id:1-5 的数据！");

// ============================================================
// 演示 4：游标分页实现
// ============================================================
console.log("\\n===== 演示 4：游标分页（Cursor-based）=====");

/**
 * 游标分页器
 * 使用 Base64 编码的游标，基于 ID 排序
 */
function cursorPaginate(data, options) {
  var limit = (options && options.limit) || 10;
  var cursor = (options && options.cursor) || null; // Base64 编码的游标
  var sortField = (options && options.sortField) || "id";

  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  // 解码游标
  var afterId = null;
  if (cursor) {
    try {
      var decoded = Buffer.from(cursor, "base64").toString("utf8");
      var cursorObj = JSON.parse(decoded);
      afterId = cursorObj[sortField];
    } catch (e) {
      throw new Error("无效的游标: " + cursor);
    }
  }

  // 筛选游标之后的数据
  var filtered = data;
  if (afterId !== null) {
    filtered = data.filter(function (item) {
      return item[sortField] > afterId;
    });
  }

  // 按排序字段排序
  filtered.sort(function (a, b) {
    if (a[sortField] < b[sortField]) return -1;
    if (a[sortField] > b[sortField]) return 1;
    return 0;
  });

  // 取前 limit 条
  var items = filtered.slice(0, limit);
  var hasMore = filtered.length > limit;

  // 生成下一页游标
  var nextCursor = null;
  if (hasMore && items.length > 0) {
    var lastItem = items[items.length - 1];
    var cursorObj = {};
    cursorObj[sortField] = lastItem[sortField];
    nextCursor = Buffer.from(JSON.stringify(cursorObj)).toString("base64");
  }

  return {
    items: items,
    limit: limit,
    nextCursor: nextCursor,
    hasMore: hasMore,
  };
}

// 演示游标分页
console.log("\\n--- 第 1 页 (limit=10) ---");
var cursor1 = cursorPaginate(users, { limit: 10 });
console.log("数据条数: " + cursor1.items.length);
console.log("hasMore: " + cursor1.hasMore);
console.log("nextCursor: " + (cursor1.nextCursor || "无"));
cursor1.items.forEach(function (u) {
  console.log("  #" + u.id + " " + u.name);
});

console.log("\\n--- 第 2 页 (使用游标) ---");
var cursor2 = cursorPaginate(users, { limit: 10, cursor: cursor1.nextCursor });
console.log("数据条数: " + cursor2.items.length);
console.log("hasMore: " + cursor2.hasMore);
console.log("nextCursor: " + (cursor2.nextCursor || "无"));
cursor2.items.forEach(function (u) {
  console.log("  #" + u.id + " " + u.name);
});

console.log("\\n--- 最后一页 ---");
var cursor3 = cursorPaginate(users, { limit: 10, cursor: cursor2.nextCursor });
// 模拟翻到最后
var currentCursor = cursor2.nextCursor;
var pageCount = 0;
while (currentCursor) {
  pageCount++;
  var page = cursorPaginate(users, { limit: 10, cursor: currentCursor });
  if (pageCount === 8) {
    console.log("数据条数: " + page.items.length);
    console.log("hasMore: " + page.hasMore);
    console.log("nextCursor: " + (page.nextCursor || "无"));
    page.items.forEach(function (u) {
      console.log("  #" + u.id + " " + u.name);
    });
  }
  currentCursor = page.nextCursor;
}

// ============================================================
// 演示 5：游标分页的数据一致性
// ============================================================
console.log("\\n===== 演示 5：游标分页的数据一致性 =====");

console.log("\\n场景: 用户在浏览游标分页时，有新数据插入");
console.log("\\n--- 第 1 页 (limit=5) ---");
var cPage1 = cursorPaginate(users, { limit: 5 });
cPage1.items.forEach(function (u) {
  console.log("  #" + u.id + " " + u.name);
});

console.log("\\n⚠ 此时有新用户注册（id: 101, 102）");
console.log("\\n--- 第 2 页 (使用游标 #" + cPage1.items[cPage1.items.length - 1].id + ") ---");
var cPage2 = cursorPaginate(usersWithInsert, { limit: 5, cursor: cPage1.nextCursor });
cPage2.items.forEach(function (u) {
  console.log("  #" + u.id + " " + u.name);
});
console.log("\\n✓ 游标分页不受数据插入影响——没有重复也没有遗漏！");
console.log("  新数据(id:101,102)不会出现在游标之后的结果中");

// ============================================================
// 演示 6：两种分页模式对比
// ============================================================
console.log("\\n===== 演示 6：两种分页模式对比 =====");

/**
 * 对比框架
 */
function comparePagination(data, pageSize) {
  var results = [];

  // 偏移分页
  var offsetStart = Date.now();
  var offsetResults = [];
  for (var p = 1; p <= 5; p++) {
    var opr = offsetPaginate(data, { page: p, pageSize: pageSize });
    offsetResults.push(opr);
  }
  var offsetTime = Date.now() - offsetStart;

  // 游标分页
  var cursorStart = Date.now();
  var cursorResults = [];
  var cursor = null;
  for (var i = 0; i < 5; i++) {
    var cpr = cursorPaginate(data, { limit: pageSize, cursor: cursor });
    cursorResults.push(cpr);
    cursor = cpr.nextCursor;
  }
  var cursorTime = Date.now() - cursorStart;

  console.log("\\n分页模式".padEnd(20) + "耗时".padEnd(12) + "总页数信息".padEnd(15) + "数据一致性".padEnd(15) + "跳页支持");
  console.log("-".repeat(80));
  console.log(
    "偏移分页".padEnd(20) +
    (offsetTime + "ms").padEnd(12) +
    "✓ (totalPages)".padEnd(15) +
    "✗ (数据变化)".padEnd(15) +
    "✓ (page=5)"
  );
  console.log(
    "游标分页".padEnd(20) +
    (cursorTime + "ms").padEnd(12) +
    "✗ (无总数)".padEnd(15) +
    "✓ (稳定)".padEnd(15) +
    "✗ (需游标)"
  );

  console.log("\\n偏移分页 5 页数据:");
  offsetResults.forEach(function (r, i) {
    console.log("  第 " + r.page + " 页: " + r.items.length + " 条 (数据范围: #" + r.items[0].id + "-#" + r.items[r.items.length - 1].id + ")");
  });

  console.log("\\n游标分页 5 页数据:");
  cursorResults.forEach(function (r, i) {
    console.log("  第 " + (i + 1) + " 页: " + r.items.length + " 条 (数据范围: #" + r.items[0].id + "-#" + r.items[r.items.length - 1].id + ")");
  });
}

comparePagination(users, 10);

// ============================================================
// 演示 7：分页工具类
// ============================================================
console.log("\\n===== 演示 7：分页工具类实战 =====");

/**
 * 通用分页工具
 */
function PaginationHelper() {}

/**
 * 构建偏移分页响应
 */
PaginationHelper.offsetResponse = function (data, options) {
  var result = offsetPaginate(data, options);
  return {
    success: true,
    data: {
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNext: result.hasNext,
      hasPrev: result.hasPrev,
      items: result.items,
    },
    meta: {
      timestamp: new Date().toISOString(),
      pagination: "offset",
    },
  };
};

/**
 * 构建游标分页响应
 */
PaginationHelper.cursorResponse = function (data, options) {
  var result = cursorPaginate(data, options);
  return {
    success: true,
    data: {
      items: result.items,
      limit: result.limit,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    },
    meta: {
      timestamp: new Date().toISOString(),
      pagination: "cursor",
    },
  };
};

// 偏移分页 API 响应示例
console.log("\\n--- 偏移分页 API 响应 (GET /api/users?page=1&pageSize=5) ---");
var offsetResponse = PaginationHelper.offsetResponse(users, { page: 1, pageSize: 5 });
console.log(JSON.stringify(offsetResponse, null, 2));

// 游标分页 API 响应示例
console.log("\\n--- 游标分页 API 响应 (GET /api/users?limit=5&cursor=...) ---");
var cursorResponse = PaginationHelper.cursorResponse(users, { limit: 5 });
console.log(JSON.stringify(cursorResponse, null, 2));

// 使用建议
console.log("\\n===== 分页策略选择建议 =====");
console.log("\\n推荐使用偏移分页的场景:");
console.log("  ✓ 管理后台数据表格——需要显示总页数、支持跳页");
console.log("  ✓ 搜索结果——用户需要知道总共有多少结果");
console.log("  ✓ 数据量较小（< 10000 条）——OFFSET 性能问题不明显");
console.log("\\n推荐使用游标分页的场景:");
console.log("  ✓ 社交动态、信息流——实时数据，无限滚动");
console.log("  ✓ 大数据量——避免 OFFSET 性能问题");
console.log("  ✓ 实时性要求高——数据频繁变化，需保证一致性");
console.log("  ✓ API Feed——第三方消费的 API 接口");

console.log("\\n===== 分页设计演示完成 =====");
`,
  },
];

// 侧边栏分组顺序
export const chapterGroups = ['基础入门', '核心模块', '异步编程', '进阶实战', '工程化', '实战补充', '实战模式'];