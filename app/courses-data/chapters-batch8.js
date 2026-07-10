// =============================================================
// Node.js 交互式教程 —— 第八批章节（测试与调试卷，共 6 章）
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章：测试基础
  // =========================================================
  {
    id: "node-testing-basics",
    title: "测试基础",
    icon: "🧪",
    group: "测试与调试",
    content: `## 为什么需要测试？

在软件开发中，测试是保障代码质量的第一道防线。没有测试的代码就像没有安全网的走钢丝——你永远不知道什么时候会掉下去。**测试不仅仅是找 Bug，更是对代码行为的一种文档化描述**。当你阅读测试用例时，你可以清楚地知道每个函数在什么输入下应该产生什么输出。

### 测试金字塔

测试金字塔是由 Mike Cohn 提出的经典测试策略模型，它将测试分为三个层次：

\`\`\`
         /\\
        /  \\         E2E 测试（端到端）
       /    \\        - 模拟真实用户操作
      /------\\       - 最慢、最昂贵、最脆弱
     /        \\      
    / 集成测试  \\    集成测试
   /   - 测试模块间交互  \\
  /   - 数据库、API 等   \\   单元测试
 /------------------\\   - 测试单个函数/模块
/     单元测试        \\  - 最快、最便宜、最稳定
/   - 覆盖面最广       \\
/----------------------\\
\`\`\`

**单元测试（Unit Tests）**：测试最小的代码单元（函数、方法），不依赖外部资源。速度快（毫秒级），数量多，占测试总量的 70% 左右。

**集成测试（Integration Tests）**：测试多个模块之间的交互，可能涉及数据库、文件系统、网络等。速度较慢（秒级），数量适中，占 20% 左右。

**E2E 测试（End-to-End Tests）**：模拟真实用户操作，测试整个系统的功能。速度最慢（分钟级），数量最少，占 10% 左右。

---

### 测试框架选择

| 框架 | 特点 | 适合场景 |
| --- | --- | --- |
| **Jest** | 零配置、内置断言和 Mock、快照测试 | React 项目、通用项目 |
| **Mocha** | 灵活、需要配合断言库（Chai） | 需要高度定制的项目 |
| **Vitest** | 与 Vite 深度集成、极快的 HMR 测试 | Vite 项目、TypeScript 项目 |
| **Node.js 内置 Test** | Node.js 18+ 原生支持、无需安装 | 简单项目、学习测试概念 |

---

### assert 断言库

Node.js 内置的 assert 模块提供了基础的断言功能。断言是测试的核心——**断言就是声明"我期望某个值为真"**，如果期望不成立，测试就失败了。

常用断言方法：

- \`assert.equal(actual, expected)\` — 宽松相等（==）
- \`assert.strictEqual(actual, expected)\` — 严格相等（===）
- \`assert.deepStrictEqual(actual, expected)\` — 深度严格相等
- \`assert.ok(value)\` — 断言值为真
- \`assert.throws(fn)\` — 断言函数抛出异常
- \`assert.rejects(promise)\` — 断言 Promise 被拒绝

---

### 测试用例结构：AAA 模式

每个测试用例通常遵循 **AAA 模式**：

1. **Arrange（准备）**：设置测试所需的数据和状态。
2. **Act（执行）**：调用被测试的函数或方法。
3. **Assert（断言）**：验证结果是否符合预期。

---

### 测试命名规范

好的测试名称应该描述"被测对象、测试场景、预期行为"：

- \`should return the sum of two numbers\`
- \`should throw an error for negative inputs\`
- \`should handle empty array gracefully\`

---

### describe/it 模式

这是 Behavior-Driven Development（BDD）风格的测试组织方式：

- **describe(name, fn)**：定义一个测试套件（测试组），可以嵌套。
- **it(name, fn)**：定义一个具体的测试用例。

\`\`\`javascript
describe('MathUtils', () => {
  describe('add()', () => {
    it('should return the sum of two positive numbers', () => {
      assert.strictEqual(add(2, 3), 5);
    });
  });
});
\`\`\`

下面这段代码用 assert 模块实现了一个完整的测试框架，包含 describe/it 模式和测试报告功能。`,
    code: `// ============================================================
// 第一章代码演示：实现一个测试框架（describe/it 模式 + 测试报告）
// ============================================================
const assert = require("assert");

// ---- 1. 测试框架核心实现 ----
console.log("===== 1. 测试框架核心实现 =====");

class TestRunner {
  constructor() {
    this.suites = [];  // 测试套件列表
    this.currentSuite = null; // 当前正在定义的套件
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      suites: [],
    };
  }

  // 定义测试套件（支持嵌套）
  describe(name, fn) {
    const suite = {
      name,
      tests: [],
      suites: [],
      beforeEach: null,
      afterEach: null,
    };

    const parentSuite = this.currentSuite;
    this.currentSuite = suite;

    // 执行 describe 回调，收集其中的 it/test 定义
    fn();

    this.currentSuite = parentSuite;

    if (parentSuite) {
      parentSuite.suites.push(suite);
    } else {
      this.suites.push(suite);
    }
  }

  // 定义测试用例
  it(name, fn) {
    if (!this.currentSuite) {
      throw new Error("it() 必须在 describe() 内部调用");
    }
    this.currentSuite.tests.push({ name, fn });
  }

  // 定义 beforeEach 钩子
  beforeEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.beforeEach = fn;
    }
  }

  // 定义 afterEach 钩子
  afterEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.afterEach = fn;
    }
  }

  // 运行单个测试用例
  async _runTest(test, suite) {
    const context = {}; // 测试上下文，可在 beforeEach 中设置
    const startTime = performance.now();

    try {
      // 运行 beforeEach 钩子
      if (suite.beforeEach) {
        await suite.beforeEach.call(context);
      }

      // 执行测试函数
      const result = test.fn.call(context);
      if (result instanceof Promise) {
        await result;
      }

      // 运行 afterEach 钩子
      if (suite.afterEach) {
        await suite.afterEach.call(context);
      }

      const elapsed = performance.now() - startTime;
      return {
        name: test.name,
        status: "passed",
        elapsed: elapsed.toFixed(2) + "ms",
      };
    } catch (err) {
      const elapsed = performance.now() - startTime;
      return {
        name: test.name,
        status: "failed",
        error: err.message,
        elapsed: elapsed.toFixed(2) + "ms",
      };
    }
  }

  // 运行测试套件
  async _runSuite(suite, parentName = "") {
    const fullName = parentName ? parentName + " > " + suite.name : suite.name;
    const suiteResult = {
      name: fullName,
      tests: [],
      passed: 0,
      failed: 0,
    };

    // 运行当前层级的测试用例
    for (const test of suite.tests) {
      const testResult = await this._runTest(test, suite);
      suiteResult.tests.push(testResult);

      if (testResult.status === "passed") {
        suiteResult.passed++;
        this.results.passed++;
      } else {
        suiteResult.failed++;
        this.results.failed++;
      }
      this.results.total++;
    }

    // 递归运行嵌套的测试套件
    for (const childSuite of suite.suites) {
      const childResult = await this._runSuite(childSuite, fullName);
      suiteResult.passed += childResult.passed;
      suiteResult.failed += childResult.failed;
      suiteResult.tests.push(...childResult.tests);
    }

    this.results.suites.push(suiteResult);
    return suiteResult;
  }

  // 运行所有测试
  async run() {
    console.log("\\n开始运行测试...\\n");

    for (const suite of this.suites) {
      await this._runSuite(suite);
    }

    this._printReport();
    return this.results;
  }

  // 打印测试报告
  _printReport() {
    console.log("\\n" + "=".repeat(60));
    console.log("                    测试报告");
    console.log("=".repeat(60));

    for (const suite of this.results.suites) {
      this._printSuiteResult(suite, 0);
    }

    console.log("\\n" + "-".repeat(60));
    console.log(
      "总计: " + this.results.total +
      " | 通过: " + this.results.passed +
      " | 失败: " + this.results.failed +
      " | 跳过: " + this.results.skipped
    );

    const passRate = this.results.total > 0
      ? ((this.results.passed / this.results.total) * 100).toFixed(1) + "%"
      : "N/A";
    console.log("通过率: " + passRate);
    console.log("=".repeat(60));
  }

  // 递归打印套件结果
  _printSuiteResult(suite, indent) {
    const prefix = "  ".repeat(indent);
    console.log(prefix + "📁 " + suite.name);

    for (const test of suite.tests) {
      const icon = test.status === "passed" ? "  ✅" : "  ❌";
      console.log(prefix + icon + " " + test.name + " (" + test.elapsed + ")");
      if (test.error) {
        console.log(prefix + "     错误: " + test.error);
      }
    }
  }
}

// ---- 2. 使用测试框架 ----
const runner = new TestRunner();

// 被测试的函数
function add(a, b) {
  return a + b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error("除数不能为零");
  }
  return a / b;
}

function getUser(id) {
  const users = {
    1: { id: 1, name: "张三", role: "admin" },
    2: { id: 2, name: "李四", role: "user" },
  };
  return users[id] || null;
}

function validateEmail(email) {
  if (typeof email !== "string") {
    throw new TypeError("email 必须是字符串");
  }
  return /^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$/.test(email);
}

// 定义测试套件
runner.describe("MathUtils 数学工具", () => {
  runner.describe("add() 加法函数", () => {
    runner.it("两个正数相加应该返回正确的和", () => {
      assert.strictEqual(add(2, 3), 5);
    });

    runner.it("正数和负数相加应该返回正确的差", () => {
      assert.strictEqual(add(10, -3), 7);
    });

    runner.it("两个零相加应该返回零", () => {
      assert.strictEqual(add(0, 0), 0);
    });
  });

  runner.describe("divide() 除法函数", () => {
    runner.it("两个正数相除应该返回正确的商", () => {
      assert.strictEqual(divide(10, 2), 5);
    });

    runner.it("除数为零时应该抛出异常", () => {
      assert.throws(() => divide(10, 0), /除数不能为零/);
    });

    runner.it("浮点数相除应该返回正确的结果", () => {
      assert.strictEqual(divide(7, 2), 3.5);
    });
  });
});

runner.describe("UserService 用户服务", () => {
  let testContext;

  runner.beforeEach(() => {
    testContext = { startTime: Date.now() };
  });

  runner.afterEach(() => {
    testContext.endTime = Date.now();
    testContext = null;
  });

  runner.describe("getUser() 获取用户", () => {
    runner.it("存在的用户ID应该返回用户对象", () => {
      const user = getUser(1);
      assert.deepStrictEqual(user, { id: 1, name: "张三", role: "admin" });
    });

    runner.it("不存在的用户ID应该返回 null", () => {
      const user = getUser(999);
      assert.strictEqual(user, null);
    });

    runner.it("返回的用户对象应该有 name 属性", () => {
      const user = getUser(2);
      assert.ok(user.name);
      assert.strictEqual(typeof user.name, "string");
    });
  });

  runner.describe("validateEmail() 邮箱验证", () => {
    runner.it("合法的邮箱应该返回 true", () => {
      assert.strictEqual(validateEmail("test@example.com"), true);
    });

    runner.it("不含 @ 的字符串应该返回 false", () => {
      assert.strictEqual(validateEmail("notanemail"), false);
    });

    runner.it("非字符串参数应该抛出 TypeError", () => {
      assert.throws(() => validateEmail(123), TypeError);
    });
  });
});

// ---- 3. 运行测试 ----
runner.run().then((results) => {
  console.log("\\n===== 测试完成 =====");
  console.log("框架特性总结:");
  console.log("  ✅ describe/it 模式 — 支持嵌套的测试套件");
  console.log("  ✅ beforeEach/afterEach — 测试前后的钩子函数");
  console.log("  ✅ 异步支持 — 支持 Promise 和 async/await");
  console.log("  ✅ 测试报告 — 详细的通过/失败统计");
  console.log("  ✅ 时间统计 — 每个测试用例的执行时间");
  console.log("  ✅ 错误信息 — 失败用例的详细错误信息");
});`,
  },

  // =========================================================
  // 第二章：高级测试技巧
  // =========================================================
  {
    id: "node-testing-advanced",
    title: "高级测试技巧",
    icon: "🔬",
    group: "测试与调试",
    content: `## 深入理解 Mock 与 Stub

在单元测试中，我们经常需要隔离被测试的代码，使其不依赖外部资源（如数据库、网络、文件系统）。这就需要用到测试替身（Test Doubles）。

### Mock vs Stub 的区别

| 特性 | Stub（桩） | Mock（模拟） |
| --- | --- | --- |
| **目的** | 提供预设的返回值，控制测试输入 | 验证行为，记录调用情况 |
| **关注点** | 状态验证（返回值是什么） | 行为验证（是否被调用、调用了多少次） |
| **典型用法** | 替换慢速的外部服务，返回固定数据 | 验证回调是否被正确调用 |
| **验证方式** | 断言最终结果 | 断言调用次数、参数 |

**关键区别**：Stub 回答"返回了什么"，Mock 回答"被调用了没有"。

---

### 依赖注入（Dependency Injection）

依赖注入是编写可测试代码的核心设计模式。**核心思想：将依赖从外部传入，而不是在函数内部创建**。

\`\`\`javascript
// ❌ 难以测试：依赖在函数内部创建
function getUserOrders(userId) {  // 声明函数 getUserOrders
  const db = new Database();  // 硬编码依赖
  return db.query('SELECT * FROM orders WHERE user_id = ?', [userId]);  // 返回值
}

// ✅ 易于测试：依赖从外部注入
function getUserOrders(userId, db) {  // 声明函数 getUserOrders
  return db.query('SELECT * FROM orders WHERE user_id = ?', [userId]);  // 返回值
}
// 测试时传入 mock 数据库，生产时传入真实数据库
\`\`\`

---

### 异步测试

Node.js 中大量操作是异步的，测试异步代码需要特别注意：

1. **回调方式**：使用 done 回调通知测试框架异步操作已完成。
2. **Promise 方式**：返回 Promise，测试框架会等待它 resolve/reject。
3. **async/await 方式**：最简洁，使用 async 函数和 await。

\`\`\`javascript
// Promise 方式
it('should fetch user data', () => {
  return fetchUser(1).then(user => {  // 返回值
    assert.strictEqual(user.name, '张三');
  });
});

// async/await 方式（推荐）
it('should fetch user data', async () => {
  const user = await fetchUser(1);  // 定义常量 user
  assert.strictEqual(user.name, '张三');
});
\`\`\`

---

### 测试覆盖率

代码覆盖率衡量测试覆盖了多少代码。常见的覆盖率指标：

- **行覆盖率（Line Coverage）**：被执行的代码行数占比。
- **分支覆盖率（Branch Coverage）**：每个条件分支是否都被执行过。
- **函数覆盖率（Function Coverage）**：每个函数是否被调用过。
- **语句覆盖率（Statement Coverage）**：每个语句是否被执行过。

**注意**：100% 覆盖率不等于没有 Bug！覆盖率只是告诉我们哪些代码没有被测试到，但不能保证已测试的代码没有逻辑错误。

---

### 快照测试（Snapshot Testing）

快照测试是一种"记录然后比较"的测试方法。第一次运行测试时，将输出保存为"快照"文件；后续运行测试时，将当前输出与快照对比，如果不一致则测试失败。

**适用场景**：UI 组件渲染结果、API 响应格式、配置文件生成。

---

### 测试数据工厂（Fixtures）

当测试需要大量数据时，可以使用工厂函数来生成测试数据，而不是手动编写每条数据。

\`\`\`javascript
// 测试数据工厂
function createUser(overrides = {}) {  // 声明函数 createUser
  return {  // 返回值
    id: Math.random().toString(36).slice(2),
    name: '测试用户',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date(),
    ...overrides,  // 允许覆盖默认值
  };
}
\`\`\`

下面这段代码实现了 mock 函数、spy、异步测试和依赖注入的完整演示。`,
    code: `// ============================================================
// 第二章代码演示：Mock 函数、Spy、异步测试、依赖注入
// ============================================================
const assert = require("assert");

// ---- 1. Mock 函数实现 ----
console.log("===== 1. Mock 函数实现 =====");

function createMockFn() {
  const calls = []; // 记录所有调用

  const mockFn = function (...args) {
    calls.push({ args, timestamp: new Date().toISOString() });

    // 执行预设的返回值或实现
    if (mockFn._implementation) {
      return mockFn._implementation.apply(this, args);
    }
    if (mockFn._returnValuesOnce && mockFn._returnValuesOnce.length > 0) {
      return mockFn._returnValuesOnce.shift();
    }
    if (mockFn._returnValues && mockFn._returnValues.length > 0) {
      const idx = Math.min(calls.length - 1, mockFn._returnValues.length - 1);
      return mockFn._returnValues[idx];
    }
    return undefined;
  };

  // 预设返回值
  mockFn._returnValues = [];
  mockFn.mockReturnValue = function (value) {
    this._returnValues = [value];
    return this;
  };

  mockFn.mockReturnValueOnce = function (value) {
    if (!this._returnValuesOnce) this._returnValuesOnce = [];
    this._returnValuesOnce.push(value);
    return this;
  };

  // 预设实现
  mockFn._implementation = null;
  mockFn.mockImplementation = function (fn) {
    this._implementation = fn;
    return this;
  };

  // 获取调用记录
  mockFn.mock = {
    get calls() {
      return calls;
    },
    get callCount() {
      return calls.length;
    },
  };

  // 断言方法
  mockFn.mock.toHaveBeenCalled = function () {
    assert.ok(calls.length > 0, "期望 mock 函数被调用，但实际没有被调用");
  };

  mockFn.mock.toHaveBeenCalledTimes = function (expected) {
    assert.strictEqual(
      calls.length,
      expected,
      "期望 mock 函数被调用 " + expected + " 次，但实际被调用了 " + calls.length + " 次"
    );
  };

  mockFn.mock.toHaveBeenCalledWith = function (...expectedArgs) {
    const matchingCall = calls.find((call) => {
      if (call.args.length !== expectedArgs.length) return false;
      return call.args.every((arg, i) => {
        try {
          assert.deepStrictEqual(arg, expectedArgs[i]);
          return true;
        } catch {
          return false;
        }
      });
    });
    assert.ok(
      matchingCall,
      "期望 mock 函数被以参数 " + JSON.stringify(expectedArgs) + " 调用，但未找到匹配的调用"
    );
  };

  mockFn.mock.mockClear = function () {
    calls.length = 0;
  };

  return mockFn;
}

// 测试 Mock 函数
const mockCallback = createMockFn();
mockCallback.mockReturnValue("返回结果");

const result1 = mockCallback("参数1", "参数2");
const result2 = mockCallback("参数3");

console.log("Mock 返回值1:", result1);
console.log("Mock 返回值2:", result2);
console.log("调用次数:", mockCallback.mock.callCount);
console.log("调用记录:", JSON.stringify(mockCallback.mock.calls, null, 2));

// Mock 断言测试
mockCallback.mock.toHaveBeenCalled();
mockCallback.mock.toHaveBeenCalledTimes(2);
mockCallback.mock.toHaveBeenCalledWith("参数1", "参数2");
console.log("✅ Mock 断言全部通过");

// ---- 2. Spy 实现 ----
console.log("\\n===== 2. Spy 实现 =====");

function createSpy(target, methodName) {
  const original = target[methodName];
  const calls = [];

  target[methodName] = function (...args) {
    calls.push({ args, timestamp: new Date().toISOString() });
    return original.apply(this, args);
  };

  return {
    get calls() {
      return calls;
    },
    get callCount() {
      return calls.length;
    },
    // 恢复原始方法
    restore() {
      target[methodName] = original;
    },
  };
}

// 被测试的服务
const userService = {
  users: [
    { id: 1, name: "张三" },
    { id: 2, name: "李四" },
  ],
  findById(id) {
    return this.users.find((u) => u.id === id) || null;
  },
  save(user) {
    this.users.push(user);
    return user;
  },
};

// 对 findById 方法进行 spy
const spy = createSpy(userService, "findById");

const user = userService.findById(1);
console.log("查询结果:", user);
console.log("Spy 调用次数:", spy.callCount);
console.log("Spy 调用参数:", JSON.stringify(spy.calls[0].args));

// 恢复原始方法
spy.restore();
console.log("✅ Spy 测试完成，已恢复原始方法");

// ---- 3. 依赖注入演示 ----
console.log("\\n===== 3. 依赖注入演示 =====");

// 真实数据库（模拟）
class RealDatabase {
  async query(sql, params) {
    // 模拟数据库查询延迟
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([{ id: params[0], name: "真实用户", balance: 1000 }]);
      }, 50);
    });
  }
}

// 业务逻辑（依赖注入版本）
class AccountService {
  constructor(db) {
    this.db = db; // 依赖通过构造函数注入
  }

  async getAccount(userId) {
    const results = await this.db.query("SELECT * FROM accounts WHERE id = ?", [userId]);
    return results[0] || null;
  }

  async transferMoney(fromId, toId, amount) {
    const from = await this.getAccount(fromId);
    const to = await this.getAccount(toId);

    if (!from) throw new Error("转出账户不存在");
    if (!to) throw new Error("转入账户不存在");
    if (from.balance < amount) throw new Error("余额不足");

    return { success: true, from: from.name, to: to.name, amount };
  }
}

// 测试时使用 Mock 数据库
async function testWithDependencyInjection() {
  console.log("--- 测试场景1：正常查询 ---");

  // 创建 Mock 数据库
  const mockDb = {
    query: createMockFn(),
  };
  mockDb.query.mockReturnValue(
    Promise.resolve([{ id: 1, name: "测试用户", balance: 500 }])
  );

  const service = new AccountService(mockDb);
  const account = await service.getAccount(1);

  console.log("查询到的账户:", JSON.stringify(account));
  // 验证 mock 数据库被正确调用
  mockDb.query.mock.toHaveBeenCalledTimes(1);
  console.log("✅ Mock 数据库被正确调用");

  // --- 测试场景2：转账测试 ---
  console.log("\\n--- 测试场景2：转账测试 ---");

  const mockDb2 = {
    query: createMockFn(),
  };

  // 配置 mock 返回不同值
  mockDb2.query
    .mockReturnValueOnce(
      Promise.resolve([{ id: 1, name: "张三", balance: 1000 }])
    )
    .mockReturnValueOnce(
      Promise.resolve([{ id: 2, name: "李四", balance: 500 }])
    );

  const service2 = new AccountService(mockDb2);
  const result = await service2.transferMoney(1, 2, 300);

  console.log("转账结果:", JSON.stringify(result));
  mockDb2.query.mock.toHaveBeenCalledTimes(2);
  console.log("✅ 转账 Mock 测试通过");

  // --- 测试场景3：余额不足 ---
  console.log("\\n--- 测试场景3：余额不足异常 ---");

  const mockDb3 = {
    query: createMockFn(),
  };
  mockDb3.query
    .mockReturnValueOnce(
      Promise.resolve([{ id: 1, name: "张三", balance: 100 }])
    )
    .mockReturnValueOnce(
      Promise.resolve([{ id: 2, name: "李四", balance: 500 }])
    );

  const service3 = new AccountService(mockDb3);
  try {
    await service3.transferMoney(1, 2, 500);
    console.log("❌ 应该抛出异常但没有");
  } catch (err) {
    console.log("正确捕获异常:", err.message);
    console.log("✅ 余额不足异常测试通过");
  }
}

// 运行依赖注入测试
testWithDependencyInjection().then(() => {
  // ---- 4. 异步测试演示 ----
  console.log("\\n===== 4. 异步测试演示 =====");

  // 模拟异步操作的函数
  function fetchUserAsync(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (id <= 0) {
          reject(new Error("无效的用户ID: " + id));
        } else {
          resolve({ id, name: "用户" + id, email: "user" + id + "@test.com" });
        }
      }, 100);
    });
  }

  function fetchAllUsers(ids) {
    return Promise.all(ids.map((id) => fetchUserAsync(id)));
  }

  // 异步测试运行器
  async function runAsyncTests() {
    console.log("--- 测试1：成功获取用户 ---");
    const user = await fetchUserAsync(1);
    assert.strictEqual(user.name, "用户1");
    assert.strictEqual(user.email, "user1@test.com");
    console.log("  ✅ 获取用户成功:", JSON.stringify(user));

    console.log("--- 测试2：无效ID抛出异常 ---");
    try {
      await fetchUserAsync(0);
      console.log("  ❌ 应该抛出异常但没有");
    } catch (err) {
      assert.ok(err.message.includes("无效的用户ID"));
      console.log("  ✅ 正确抛出异常:", err.message);
    }

    console.log("--- 测试3：批量获取用户 ---");
    const users = await fetchAllUsers([1, 2, 3]);
    assert.strictEqual(users.length, 3);
    assert.strictEqual(users[0].name, "用户1");
    assert.strictEqual(users[2].name, "用户3");
    console.log("  ✅ 批量获取成功:", users.length + " 个用户");

    console.log("--- 测试4：Promise.all 处理部分失败 ---");
    try {
      await fetchAllUsers([1, -1, 3]);
      console.log("  ❌ 应该抛出异常但没有");
    } catch (err) {
      console.log("  ✅ Promise.all 正确传播了错误:", err.message);
    }

    console.log("\\n✅ 所有异步测试通过");
  }

  return runAsyncTests();
}).then(() => {
  // ---- 5. 测试数据工厂 ----
  console.log("\\n===== 5. 测试数据工厂 =====");

  function createTestUser(overrides = {}) {
    let counter = 0;
    return {
      id: overrides.id || "user_" + Math.random().toString(36).slice(2, 8),
      name: overrides.name || "测试用户",
      email: overrides.email || "test@example.com",
      role: overrides.role || "user",
      age: overrides.age || 25,
      createdAt: overrides.createdAt || new Date().toISOString(),
    };
  }

  const user1 = createTestUser({ name: "张三", role: "admin" });
  const user2 = createTestUser({ name: "李四", age: 30 });
  const user3 = createTestUser();

  console.log("User1:", JSON.stringify(user1, null, 2));
  console.log("User2:", JSON.stringify(user2, null, 2));
  console.log("User3:", JSON.stringify(user3, null, 2));
  console.log("✅ 测试数据工厂工作正常");

  // ---- 6. 高级测试技巧总结 ----
  console.log("\\n===== 6. 高级测试技巧总结 =====");
  console.log("  1. Mock 函数 — 预设返回值，验证调用行为");
  console.log("  2. Spy — 监控已有方法的调用情况");
  console.log("  3. 依赖注入 — 将外部依赖作为参数传入");
  console.log("  4. 异步测试 — 使用 async/await 处理 Promise");
  console.log("  5. 测试数据工厂 — 批量生成测试数据");
  console.log("  6. AAA 模式 — Arrange/Act/Assert 清晰分离");
});`,
  },

  // =========================================================
  // 第三章：调试技巧
  // =========================================================
  {
    id: "node-debugging",
    title: "调试技巧",
    icon: "🐛",
    group: "测试与调试",
    content: `## 调试的层次

调试是开发者日常工作中最重要的技能之一。**找到 Bug 往往比修复 Bug 更耗时**。掌握高效的调试技巧可以大幅提升开发效率。

### 调试的四个层次

| 层次 | 工具 | 适用场景 |
| --- | --- | --- |
| **L1：日志调试** | console.log / debug 模块 | 快速定位问题位置 |
| **L2：断言调试** | console.assert / assert 模块 | 验证假设条件 |
| **L3：交互式调试** | node --inspect / Chrome DevTools | 复杂逻辑、难以复现的 Bug |
| **L4：性能调试** | perf_hooks / profiler | 性能瓶颈定位 |

---

### Node.js 调试器（node --inspect）

Node.js 内置了基于 Chrome DevTools Protocol 的调试器。启动方式：

\`\`\`bash
# 启动调试器，等待调试器连接
node --inspect-brk app.js  # 用 Node.js 执行脚本 --inspect-brk

# 启动调试器，不等待（后台运行）
node --inspect app.js  # 用 Node.js 执行脚本 --inspect
\`\`\`

然后在 Chrome 浏览器中打开 \`chrome://inspect\`，即可看到调试目标。

---

### Chrome DevTools 调试

连接后，你可以使用完整的 Chrome DevTools 功能：

- **断点（Breakpoint）**：在代码行上点击设置断点，程序执行到该行时会暂停。
- **条件断点（Conditional Breakpoint）**：右键断点设置条件，只有条件满足时才暂停。
- **Watch 表达式**：监视变量的值变化。
- **Call Stack**：查看当前调用栈。
- **Scope**：查看当前作用域中的所有变量。

---

### VS Code 调试配置

在 VS Code 中，创建 \`.vscode/launch.json\` 文件配置调试：

\`\`\`json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "\${workspaceFolder}/app.js"
    }
  ]
}
\`\`\`

---

### console 调试方法

除了常见的 \`console.log()\`，Node.js 还提供了许多其他调试方法：

| 方法 | 作用 | 示例 |
| --- | --- | --- |
| **console.debug()** | 与 log 类似，但可能有不同的日志级别 | \`console.debug("调试信息")\` |
| **console.trace()** | 打印当前调用栈 | \`console.trace("追踪调用")\` |
| **console.assert()** | 断言为真，否则打印错误 | \`console.assert(x > 0, "x 必须大于 0")\` |
| **console.table()** | 以表格形式显示数据 | \`console.table(users)\` |
| **console.time()** | 计时开始 | \`console.time("label")\` |
| **console.timeEnd()** | 计时结束并输出 | \`console.timeEnd("label")\` |
| **console.group()** | 分组输出 | \`console.group("组名")\` |

---

### debug 模块

\`debug\` 是一个轻量级的调试日志库，通过环境变量控制哪些模块输出调试日志。

\`\`\`javascript
const debug = require('debug')('app:auth');  // 导入模块 debug；require 返回 module.exports
debug('用户登录成功: %s', username);
\`\`\`

通过设置 \`DEBUG=app:*\` 环境变量来控制输出。

---

### util.inspect —— 深入检查对象

\`util.inspect()\` 是 Node.js 内置的深度对象检查工具，比 \`console.log\` 更强大：

\`\`\`javascript
const util = require('util');  // 导入模块 util；require 返回 module.exports

const obj = { a: 1, b: { c: 2, d: [3, 4] } };  // 定义对象 obj
console.log(util.inspect(obj, {  // 打印日志到 stdout
  showHidden: false,  // 是否显示隐藏属性
  depth: null,         // 递归深度（null = 无限）
  colors: true,        // 是否使用颜色
  compact: false,      // 是否紧凑输出
}));
\`\`\`

下面这段代码演示了多种调试技巧，包括 util.inspect、console.trace 和性能分析。`,
    code: `// ============================================================
// 第三章代码演示：调试技巧（util.inspect、console.trace、性能分析）
// ============================================================
const util = require("util");

// ---- 1. util.inspect 深度检查对象 ----
console.log("===== 1. util.inspect 深度检查对象 =====");

const complexObject = {
  name: "测试对象",
  version: "1.0.0",
  config: {
    debug: true,
    maxRetries: 3,
    timeout: 5000,
    features: {
      darkMode: true,
      beta: false,
      modules: ["auth", "payment", "notification"],
    },
  },
  users: [
    { id: 1, name: "张三", roles: ["admin", "editor"] },
    { id: 2, name: "李四", roles: ["viewer"] },
  ],
  metadata: {
    createdAt: new Date(),
    updatedAt: null,
    nullValue: null,
    undefinedValue: undefined,
    regex: /test\\d+/gi,
    function: function hello() {
      return "world";
    },
  },
  // 循环引用
  circular: null,
};
complexObject.circular = complexObject;

console.log("--- 默认 inspect ---");
console.log(util.inspect(complexObject, { depth: 3, colors: false }));

console.log("\\n--- 紧凑模式 ---");
console.log(util.inspect(complexObject, { depth: 2, compact: true, breakLength: 80 }));

console.log("\\n--- 自定义深度 ---");
console.log(util.inspect(complexObject, { depth: 1 }));

console.log("\\n--- 显示隐藏属性 ---");
console.log(util.inspect(complexObject, { depth: 2, showHidden: true }));

console.log("\\n--- 排序键名 ---");
console.log(util.inspect(complexObject, { depth: 2, sorted: true }));

// ---- 2. console.trace 调用栈追踪 ----
console.log("\\n===== 2. console.trace 调用栈追踪 =====");

function level3() {
  console.trace("追踪调用栈 — 在 level3 中");
  return "level3 结果";
}

function level2() {
  const result = level3();
  return "level2 包装: " + result;
}

function level1() {
  const result = level2();
  return "level1 包装: " + result;
}

console.log("调用链: level1 → level2 → level3");
const finalResult = level1();
console.log("最终结果:", finalResult);

// ---- 3. console.assert 断言调试 ----
console.log("\\n===== 3. console.assert 断言调试 =====");

function calculateDiscount(price, userType) {
  // 调试断言：确保参数合法
  console.assert(typeof price === "number" && price > 0, "价格必须为正数，当前值:", price);
  console.assert(
    ["regular", "vip", "admin"].includes(userType),
    "用户类型无效，当前值:",
    userType
  );

  const discounts = {
    regular: 0.05,
    vip: 0.15,
    admin: 0.25,
  };

  const discount = price * discounts[userType];
  return { originalPrice: price, discount, finalPrice: price - discount };
}

console.log("VIP 用户折扣:", calculateDiscount(100, "vip"));
console.log("普通用户折扣:", calculateDiscount(200, "regular"));

// 触发断言失败（不会退出程序，仅打印警告）
console.log("\\n触发断言失败示例:");
console.assert(false, "这是一个断言失败的演示，程序会继续执行");

// ---- 4. console.table 表格展示数据 ----
console.log("\\n===== 4. console.table 表格展示数据 =====");

const debugData = [
  {
    timestamp: "2024-01-15 10:30:00",
    level: "INFO",
    module: "auth",
    message: "用户登录成功",
    userId: 1001,
    elapsed: "12ms",
  },
  {
    timestamp: "2024-01-15 10:30:01",
    level: "DEBUG",
    module: "auth",
    message: "验证 token 通过",
    userId: 1001,
    elapsed: "3ms",
  },
  {
    timestamp: "2024-01-15 10:30:05",
    level: "ERROR",
    module: "payment",
    message: "支付超时",
    userId: 1001,
    elapsed: "5002ms",
  },
  {
    timestamp: "2024-01-15 10:30:06",
    level: "WARN",
    module: "payment",
    message: "重试支付",
    userId: 1001,
    elapsed: "200ms",
  },
];

console.log("调试日志表格:");
console.table(debugData);

// 只展示特定列
console.log("\\n精简视图:");
console.table(debugData, ["level", "module", "message"]);

// ---- 5. console.group 分组输出 ----
console.log("\\n===== 5. console.group 分组输出 =====");

console.group("请求处理流程");
console.log("  1. 接收请求");
console.group("  2. 认证");
console.log("    - 解析 token");
console.log("    - 验证签名");
console.log("    - 检查过期时间");
console.groupEnd();
console.group("  3. 业务处理");
console.log("    - 查询数据库");
console.log("    - 处理数据");
console.log("    - 生成响应");
console.groupEnd();
console.log("  4. 返回响应");
console.groupEnd();

// ---- 6. 自定义调试工具 ----
console.log("\\n===== 6. 自定义调试工具 =====");

// 创建调试上下文管理器
class DebugContext {
  constructor(name) {
    this.name = name;
    this.startTime = performance.now();
    this.steps = [];
    console.log("🔍 [" + this.name + "] 开始调试会话");
  }

  step(label, data) {
    const elapsed = (performance.now() - this.startTime).toFixed(2);
    this.steps.push({ label, elapsed, data });
    console.log("  ⏱️ [" + elapsed + "ms] " + label);

    if (data !== undefined) {
      if (typeof data === "object" && data !== null) {
        console.log("     " + util.inspect(data, { depth: 1, colors: false, compact: true }));
      } else {
        console.log("     → " + data);
      }
    }
    return this;
  }

  end() {
    const totalElapsed = (performance.now() - this.startTime).toFixed(2);
    console.log("✅ [" + this.name + "] 调试会话结束，总耗时: " + totalElapsed + "ms");
    console.log("   步骤数: " + this.steps.length);
    return this.steps;
  }
}

// 使用调试上下文
function processOrder(orderId, items) {
  const debug = new DebugContext("订单处理");

  debug.step("接收订单", { orderId, itemCount: items.length });

  // 模拟验证
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  debug.step("计算总金额", { totalAmount, currency: "CNY" });

  // 模拟折扣计算
  let discount = 0;
  if (totalAmount > 500) {
    discount = totalAmount * 0.1;
    debug.step("应用折扣", { rate: "10%", discount });
  } else {
    debug.step("不满足折扣条件", { minimum: 500, current: totalAmount });
  }

  const finalAmount = totalAmount - discount;
  debug.step("最终金额", finalAmount);

  debug.end();
  return { orderId, totalAmount, discount, finalAmount };
}

console.log("\\n处理订单:");
const orderResult = processOrder("ORD-001", [
  { name: "商品A", price: 100, quantity: 2 },
  { name: "商品B", price: 250, quantity: 1 },
  { name: "商品C", price: 80, quantity: 3 },
]);
console.log("\\n订单结果:", JSON.stringify(orderResult));

// ---- 7. 性能分析钩子 ----
console.log("\\n===== 7. 性能分析钩子 =====");

// 创建性能测量器
class PerformanceTracker {
  constructor() {
    this.marks = new Map();
    this.measures = [];
  }

  mark(name) {
    this.marks.set(name, performance.now());
    return this;
  }

  measure(name, startMark, endMark) {
    const start = this.marks.get(startMark);
    const end = this.marks.get(endMark);
    if (start && end) {
      const duration = end - start;
      this.measures.push({ name, startMark, endMark, duration: duration.toFixed(3) + "ms" });
      return duration;
    }
    return -1;
  }

  report() {
    console.log("性能测量报告:");
    console.table(this.measures);
  }
}

const tracker = new PerformanceTracker();

tracker.mark("start");

// 模拟一些操作
let sum = 0;
for (let i = 0; i < 5000000; i++) {
  sum += Math.sqrt(i);
}
tracker.mark("sqrt_done");

// 模拟字符串操作
let str = "";
for (let i = 0; i < 100000; i++) {
  str += "x";
}
tracker.mark("string_done");

// 测量各个阶段
tracker.measure("平方根计算", "start", "sqrt_done");
tracker.measure("字符串拼接", "sqrt_done", "string_done");
tracker.measure("总耗时", "start", "string_done");

tracker.report();

// ---- 8. 调试技巧总结 ----
console.log("\\n===== 8. 调试技巧总结 =====");
const tips = [
  "1. console.trace() — 查看调用栈，了解代码执行路径",
  "2. console.assert() — 验证假设，条件不满足时打印警告",
  "3. console.table() — 以表格形式展示数组/对象数据",
  "4. console.group() — 组织相关日志，便于阅读",
  "5. util.inspect() — 深度检查对象，控制输出深度和格式",
  "6. performance.now() — 高精度时间测量",
  "7. node --inspect — 使用 Chrome DevTools 进行交互式调试",
  "8. 条件断点 — 只在特定条件满足时才暂停执行",
  "9. Watch 表达式 — 实时监控变量值的变化",
  "10. 自建调试工具 — 针对项目特点封装调试工具",
];
tips.forEach((tip) => console.log("  " + tip));`,
  },

  // =========================================================
  // 第四章：结构化日志
  // =========================================================
  {
    id: "node-logging",
    title: "结构化日志",
    icon: "📝",
    group: "测试与调试",
    content: `## 为什么需要结构化日志？

在生产环境中，日志是排查问题的唯一依据。当系统出现故障时，**你需要快速定位问题——而结构化日志让这一切变得可能**。

传统日志 vs 结构化日志：

\`\`\`
// 传统日志：难以搜索和分析
[2024-01-15 10:30:00] User 1001 logged in from 192.168.1.1

// 结构化日志（JSON）：易于机器解析和搜索
{"timestamp":"2024-01-15T10:30:00Z","level":"info","message":"User logged in",
 "userId":1001,"ip":"192.168.1.1","service":"auth"}
\`\`\`

**结构化日志的优势**：可以用 jq 等工具查询、可以导入 ELK 等日志平台、可以按字段聚合分析。

---

### 日志级别（Log Levels）

日志级别定义了日志的严重程度。通用的级别划分（从低到高）：

| 级别 | 名称 | 说明 | 使用场景 |
| --- | --- | --- | --- |
| 0 | **trace** | 追踪 | 最详细的调试信息，如函数进入/退出 |
| 1 | **debug** | 调试 | 开发调试信息，如变量值 |
| 2 | **info** | 信息 | 一般信息，如服务启动、用户登录 |
| 3 | **warn** | 警告 | 潜在问题，如配置缺失使用默认值 |
| 4 | **error** | 错误 | 错误但服务可继续，如单个请求失败 |
| 5 | **fatal** | 致命 | 致命错误，服务无法继续运行 |

**日志级别控制**：通过设置日志级别，可以过滤掉低级别的日志。例如生产环境通常只记录 info 及以上级别。

---

### 日志格式

**JSON 格式**（推荐用于生产环境）：
- 优点：易于机器解析、支持结构化字段、可导入日志分析平台。
- 缺点：不便于人类阅读。

**文本格式**（推荐用于开发环境）：
- 优点：易读、可以使用颜色高亮。
- 缺点：难以机器解析。

---

### 请求 ID 追踪

在分布式系统中，一个请求可能经过多个服务。**请求 ID（Request ID / Trace ID）** 允许你在日志中追踪一个请求的完整生命周期。

\`\`\`javascript
// 每个请求生成唯一的 requestId
const requestId = crypto.randomUUID();  // 定义常量 requestId

// 所有日志都带上 requestId
logger.info('处理请求', { requestId, path: '/api/users' });
logger.info('查询数据库', { requestId, query: 'SELECT ...' });
logger.info('返回响应', { requestId, status: 200 });
\`\`\`

---

### 敏感信息脱敏

日志中绝对不能包含敏感信息：密码、Token、身份证号、银行卡号、手机号等。在记录日志前必须进行脱敏处理。

\`\`\`javascript
// 敏感信息脱敏函数
function sanitize(data) {  // 声明函数 sanitize
  const sanitized = { ...data };  // 定义对象 sanitized
  if (sanitized.password) sanitized.password = '***';  // 条件判断
  if (sanitized.token) sanitized.token = sanitized.token.slice(0, 8) + '...';  // 条件判断
  if (sanitized.phone) sanitized.phone = sanitized.phone.slice(0, 3) + '****' + sanitized.phone.slice(-4);  // 条件判断
  return sanitized;  // 返回值
}
\`\`\`

---

### 日志轮转（Log Rotation）

日志文件会不断增长，如果不加管理，可能会耗尽磁盘空间。日志轮转策略：

1. **按大小轮转**：文件达到一定大小时创建新文件。
2. **按时间轮转**：每天/每小时创建新文件。
3. **保留策略**：只保留最近 N 天的日志。

---

### Winston / Pino 概念

**Winston**：Node.js 最流行的日志库，支持多种传输方式（控制台、文件、HTTP 等）、日志级别、格式化。

**Pino**：极高性能的 Node.js 日志库，JSON 优先，异步写入，比 Winston 快 5-10 倍。

下面这段代码实现了一个完整的结构化日志器，支持级别控制、JSON 格式和请求追踪。`,
    code: `// ============================================================
// 第四章代码演示：结构化日志器（级别控制、JSON 格式、请求追踪）
// ============================================================
const util = require("util");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

// ---- 1. 日志级别定义 ----
console.log("===== 1. 结构化日志器实现 =====");

const LOG_LEVELS = {
  trace: { priority: 0, label: "TRACE", color: "\\x1b[90m" },
  debug: { priority: 1, label: "DEBUG", color: "\\x1b[36m" },
  info:  { priority: 2, label: "INFO",  color: "\\x1b[32m" },
  warn:  { priority: 3, label: "WARN",  color: "\\x1b[33m" },
  error: { priority: 4, label: "ERROR", color: "\\x1b[31m" },
  fatal: { priority: 5, label: "FATAL", color: "\\x1b[35m" },
};

const RESET_COLOR = "\\x1b[0m";

// ---- 2. 结构化日志器实现 ----
class StructuredLogger {
  constructor(options = {}) {
    this.options = {
      // 最低日志级别，低于此级别的日志不会输出
      level: options.level || "info",
      // 输出格式：json 或 text
      format: options.format || "text",
      // 是否输出到控制台
      console: options.console !== false,
      // 是否输出到文件
      file: options.file || null,
      // 默认元数据
      metadata: options.metadata || {},
      // 是否启用颜色
      colors: options.colors !== false,
      // 敏感字段列表
      sensitiveFields: options.sensitiveFields || [
        "password", "token", "secret", "apiKey", "authorization",
      ],
    };

    this.minPriority = LOG_LEVELS[this.options.level]?.priority || 2;
    this.stats = { trace: 0, debug: 0, info: 0, warn: 0, error: 0, fatal: 0 };
    this.logBuffer = []; // 内存中的日志缓冲区
    this.maxBufferSize = options.maxBufferSize || 1000;
  }

  // 获取当前时间戳
  _timestamp() {
    return new Date().toISOString();
  }

  // 脱敏处理
  _sanitize(data) {
    if (!data || typeof data !== "object") return data;
    const sanitized = Array.isArray(data) ? [...data] : { ...data };
    for (const key of Object.keys(sanitized)) {
      if (this.options.sensitiveFields.includes(key)) {
        const value = sanitized[key];
        if (typeof value === "string" && value.length > 0) {
          sanitized[key] = value.slice(0, 3) + "***" + value.slice(-3);
        } else {
          sanitized[key] = "***REDACTED***";
        }
      }
    }
    return sanitized;
  }

  // 构建日志条目
  _buildEntry(level, message, meta = {}) {
    const entry = {
      timestamp: this._timestamp(),
      level: LOG_LEVELS[level].label,
      message,
      hostname: os.hostname(),
      pid: process.pid,
      ...this.options.metadata, // 注入默认元数据
      ...this._sanitize(meta),  // 注入用户元数据（脱敏后）
    };
    return entry;
  }

  // 格式化文本输出
  _formatText(entry) {
    const levelConfig = LOG_LEVELS[entry.level.toLowerCase()] || LOG_LEVELS.info;
    const levelColor = this.options.colors ? levelConfig.color : "";
    const timestamp = entry.timestamp.slice(11, 23); // 只显示时间部分

    let line = levelColor + "[" + timestamp + "]";
    line += " [" + entry.level + "]";
    line += RESET_COLOR;

    if (entry.requestId) {
      line += " [" + entry.requestId.slice(0, 8) + "]";
    }
    if (entry.module) {
      line += " [" + entry.module + "]";
    }
    line += " " + entry.message;

    // 附加字段
    const extraFields = { ...entry };
    delete extraFields.timestamp;
    delete extraFields.level;
    delete extraFields.message;
    delete extraFields.hostname;
    delete extraFields.pid;
    delete extraFields.requestId;
    delete extraFields.module;

    if (Object.keys(extraFields).length > 0) {
      line += " " + util.inspect(extraFields, {
        depth: 3,
        colors: this.options.colors,
        compact: true,
        breakLength: 120,
      });
    }

    return line;
  }

  // 格式化 JSON 输出
  _formatJson(entry) {
    return JSON.stringify(entry);
  }

  // 输出日志
  _output(entry) {
    const formatted = this.options.format === "json"
      ? this._formatJson(entry)
      : this._formatText(entry);

    // 输出到控制台
    if (this.options.console) {
      if (entry.level === "ERROR" || entry.level === "FATAL") {
        console.error(formatted);
      } else if (entry.level === "WARN") {
        console.warn(formatted);
      } else {
        console.log(formatted);
      }
    }

    // 输出到文件
    if (this.options.file) {
      try {
        fs.appendFileSync(this.options.file, this._formatJson(entry) + "\\n");
      } catch (err) {
        // 文件写入失败，降级到 stderr
        console.error("日志文件写入失败:", err.message);
      }
    }

    // 缓冲区管理
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  // 核心日志方法
  log(level, message, meta = {}) {
    const priority = LOG_LEVELS[level]?.priority || 2;
    if (priority < this.minPriority) return;

    const entry = this._buildEntry(level, message, meta);
    this.stats[level]++;
    this._output(entry);
  }

  // 便捷方法
  trace(message, meta) { this.log("trace", message, meta); }
  debug(message, meta) { this.log("debug", message, meta); }
  info(message, meta)  { this.log("info", message, meta); }
  warn(message, meta)  { this.log("warn", message, meta); }
  error(message, meta) { this.log("error", message, meta); }
  fatal(message, meta) { this.log("fatal", message, meta); }

  // 创建一个带上下文的子日志器
  child(context) {
    const childLogger = new StructuredLogger({
      ...this.options,
      metadata: { ...this.options.metadata, ...context },
    });
    childLogger.stats = this.stats; // 共享统计
    childLogger.logBuffer = this.logBuffer;
    return childLogger;
  }

  // 获取统计信息
  getStats() {
    return { ...this.stats };
  }

  // 获取最近的日志
  getRecent(count = 10) {
    return this.logBuffer.slice(-count);
  }
}

// ---- 3. 使用日志器 ----
// 创建默认日志器（文本格式）
const logger = new StructuredLogger({
  level: "debug",
  format: "text",
  metadata: { service: "demo-service", version: "1.0.0" },
});

console.log("--- 文本格式日志 ---");
logger.trace("这是一条 trace 日志（级别太低，不会显示）");
logger.debug("这是一条 debug 日志");
logger.info("服务启动成功", { port: 3000, env: "development" });
logger.warn("配置项缺失，使用默认值", { configKey: "redis.host", defaultValue: "localhost" });
logger.error("数据库连接失败", { dbHost: "10.0.0.1", error: "Connection refused" });

// 创建 JSON 格式日志器
console.log("\\n--- JSON 格式日志 ---");
const jsonLogger = new StructuredLogger({
  level: "info",
  format: "json",
  metadata: { service: "api-gateway", version: "2.0.0" },
});

jsonLogger.info("API 请求", { method: "GET", path: "/api/users", status: 200, elapsed: 45 });

// 敏感信息脱敏演示
console.log("\\n--- 敏感信息脱敏 ---");
jsonLogger.info("用户登录", {
  username: "zhangsan",
  password: "MySecretPassword123",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  apiKey: "sk-abcdef1234567890",
});

// ---- 4. 请求追踪 ----
console.log("\\n===== 4. 请求追踪 =====");

// 模拟请求追踪中间件
function createRequestContext(req) {
  const requestId = crypto.randomUUID();
  const requestLogger = logger.child({ requestId, module: "http" });

  return {
    requestId,
    logger: requestLogger,
    startTime: performance.now(),
  };
}

function simulateHttpRequest(method, path, userId) {
  const ctx = createRequestContext({ method, path });
  ctx.logger.info("收到请求", { method, path, userId });

  // 模拟认证
  ctx.logger.debug("验证身份", { userId, authenticated: true });

  // 模拟数据库查询
  ctx.logger.debug("查询数据库", { query: "SELECT * FROM users WHERE id = ?", params: [userId] });

  // 模拟业务处理
  const user = { id: userId, name: "用户" + userId, role: "admin" };
  ctx.logger.debug("业务处理完成", { user });

  const elapsed = (performance.now() - ctx.startTime).toFixed(2);
  ctx.logger.info("请求处理完成", { status: 200, elapsed: elapsed + "ms" });

  return { requestId: ctx.requestId, user, elapsed };
}

console.log("\\n模拟 HTTP 请求处理:");
const req1 = simulateHttpRequest("GET", "/api/users/1", 1);
const req2 = simulateHttpRequest("POST", "/api/orders", 2);
console.log("\\n请求1 ID:", req1.requestId);
console.log("请求2 ID:", req2.requestId);

// 按请求ID查看日志
console.log("\\n--- 按 requestId 过滤日志 ---");
const req1Logs = logger.getRecent(100).filter(
  (entry) => entry.requestId === req1.requestId
);
console.log("请求1 的日志条目:");
req1Logs.forEach((entry) => {
  console.log("  [" + entry.level + "] " + entry.message);
});

// ---- 5. 日志级别过滤 ----
console.log("\\n===== 5. 日志级别过滤演示 =====");

// 生产环境日志器（只记录 info 及以上）
const prodLogger = new StructuredLogger({
  level: "warn",
  format: "text",
  metadata: { env: "production" },
});

console.log("生产环境（level=warn）:");
prodLogger.info("这条 info 日志不会显示");
prodLogger.warn("警告：内存使用率超过 80%", { memoryUsage: "82%" });
prodLogger.error("错误：支付服务不可用", { service: "payment", error: "timeout" });
prodLogger.fatal("致命错误：数据库连接全部断开", { dbCluster: "primary" });

// ---- 6. 日志统计 ----
console.log("\\n===== 6. 日志统计 =====");
const stats = logger.getStats();
console.log("日志统计:");
console.table(
  Object.entries(stats).map(([level, count]) => ({
    级别: level.toUpperCase(),
    数量: count,
    优先级: LOG_LEVELS[level]?.priority || "N/A",
  }))
);
console.log("总日志数:", Object.values(stats).reduce((a, b) => a + b, 0));

// ---- 7. 结构化日志总结 ----
console.log("\\n===== 7. 结构化日志总结 =====");
console.log("  1. 日志级别 — trace/debug/info/warn/error/fatal 六级控制");
console.log("  2. JSON 格式 — 机器可解析，便于导入 ELK 等平台");
console.log("  3. 请求追踪 — 使用 requestId 关联同一请求的所有日志");
console.log("  4. 敏感信息脱敏 — 自动处理 password/token/secret 等字段");
console.log("  5. 子日志器 — 通过 child() 创建带上下文的日志器");
console.log("  6. 多种输出 — 控制台 + 文件，可扩展更多传输方式");
console.log("  7. 日志缓冲 — 内存中保留最近日志，方便调试查看");`,
  },

  // =========================================================
  // 第五章：性能分析
  // =========================================================
  {
    id: "node-profiling",
    title: "性能分析",
    icon: "📊",
    group: "测试与调试",
    content: `## 性能分析的核心思想

性能分析不是玄学，而是一门**数据驱动的科学**。在 Node.js 应用中，性能问题的根源往往可以追溯到以下几个方面：

1. **CPU 密集型计算**：阻塞事件循环的同步操作。
2. **内存使用不当**：内存泄漏或频繁的 GC 触发。
3. **I/O 瓶颈**：数据库查询、网络请求、文件操作。
4. **事件循环延迟**：单个 tick 执行时间过长。

**黄金法则：测量，不要猜测！**

---

### CPU 性能分析

Node.js 提供了多种 CPU 性能分析工具：

- **console.profile / console.profileEnd**：在 Chrome DevTools 中标记性能分析区间。
- **--prof 标志**：V8 内置的采样分析器，生成 CPU profile 日志。
- **--cpu-prof**：Node.js 12+ 内置的 CPU 分析器。
- **Clinic.js Doctor**：官方推荐的性能诊断工具。

---

### 内存快照（Heap Snapshot）

内存快照记录了某一时刻堆内存中所有对象的状态。通过对比两次快照，可以找出哪些对象在不断增长。

\`\`\`bash
# 使用 --inspect 启动，在 Chrome DevTools Memory 面板拍摄快照
node --inspect app.js  # 用 Node.js 执行脚本 --inspect
\`\`\`

---

### Event Loop 延迟检测

事件循环延迟是衡量 Node.js 应用健康度的关键指标。如果事件循环被阻塞太久，用户请求的响应时间就会增加。

\`\`\`javascript
// 检测事件循环延迟
let lastCheck = performance.now();  // 定义变量 lastCheck（可变）
setInterval(() => {  // 周期回调
  const now = performance.now();  // 定义常量 now
  const delay = now - lastCheck - 1000; // 期望 1000ms 间隔
  if (delay > 50) {  // 条件判断
    console.warn('事件循环延迟: ' + delay.toFixed(2) + 'ms');  // 打印警告到 stderr
  }
  lastCheck = now;
}, 1000);
\`\`\`

---

### 火焰图（Flame Graph）

火焰图是由 Brendan Gregg 发明的性能可视化工具。它将调用栈和 CPU 时间结合起来，用颜色和宽度表示不同函数的耗时。

**阅读火焰图的关键**：
- X 轴宽度 = CPU 时间占比（越宽越耗时）
- Y 轴高度 = 调用栈深度
- 寻找"平顶山"（宽而矮的矩形）——它表示函数自身消耗了大量 CPU
- 颜色通常随机，仅用于区分不同函数

---

### 关键路径优化

识别并优化关键路径是性能优化的核心。通常遵循 **帕累托原则（80/20 法则）**：80% 的时间花在 20% 的代码上。

优化策略：
1. 找出最慢的 20% 操作
2. 分析是否可以缓存、批处理、异步化
3. 验证优化效果，确保没有引入新的瓶颈

---

### Benchmark 测试

基准测试（Benchmark）用于比较不同实现方案的性能。它需要：
- **预热（Warm-up）**：让 JIT 编译器优化代码
- **多次迭代**：获得统计显著的结果
- **误差范围**：报告 ± 误差而非绝对值

下面这段代码演示了全面的性能测量技术，包括 CPU 时间、内存使用和算法对比。`,
    code: `// ============================================================
// 第五章代码演示：性能分析（performance.now、process.memoryUsage）
// ============================================================
const util = require("util");

// ---- 1. performance.now() 高精度计时 ----
console.log("===== 1. performance.now() 高精度计时 =====");

function benchmark(name, fn, iterations = 1000) {
  // 预热阶段：让 V8 JIT 编译器优化代码
  for (let i = 0; i < 10; i++) {
    fn();
  }

  // 正式测试
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();

  const totalTime = end - start;
  const avgTime = totalTime / iterations;
  const opsPerSec = (iterations / totalTime) * 1000;

  return {
    name,
    totalTime: totalTime.toFixed(3) + "ms",
    avgTime: avgTime.toFixed(4) + "ms",
    opsPerSec: opsPerSec.toFixed(0) + " ops/s",
    iterations,
  };
}

// 测试不同算法
const testArray = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 500));

// 方案1：使用 Set 去重
const result1 = benchmark(
  "Set 去重",
  () => {
    const unique = [...new Set(testArray)];
    return unique;
  },
  500
);

// 方案2：使用 filter + indexOf 去重
const result2 = benchmark(
  "filter + indexOf 去重",
  () => {
    const unique = testArray.filter((item, idx) => testArray.indexOf(item) === idx);
    return unique;
  },
  500
);

// 方案3：使用 reduce 去重
const result3 = benchmark(
  "reduce + includes 去重",
  () => {
    const unique = testArray.reduce((acc, item) => {
      if (!acc.includes(item)) acc.push(item);
      return acc;
    }, []);
    return unique;
  },
  500
);

console.log("数组去重性能对比（500次迭代，数组长度1000）:");
console.table([result1, result2, result3]);

// 找出最快方案
const best = [result1, result2, result3].sort(
  (a, b) => parseFloat(b.opsPerSec) - parseFloat(a.opsPerSec)
)[0];
console.log("最快方案: " + best.name);

// ---- 2. 字符串拼接性能对比 ----
console.log("\\n===== 2. 字符串拼接性能对比 =====");

const strPlus = benchmark(
  "+ 操作符拼接",
  () => {
    let s = "";
    for (let i = 0; i < 3000; i++) {
      s += "item" + i + ",";
    }
    return s;
  },
  200
);

const strJoin = benchmark(
  "数组 join 拼接",
  () => {
    const arr = [];
    for (let i = 0; i < 3000; i++) {
      arr.push("item" + i);
    }
    return arr.join(",");
  },
  200
);

const strTemplate = benchmark(
  "模板字面量拼接",
  () => {
    let s = "";
    for (let i = 0; i < 3000; i++) {
      s += \`item\${i},\`;
    }
    return s;
  },
  200
);

console.log("字符串拼接性能对比（200次迭代，每次拼接3000个元素）:");
console.table([strPlus, strJoin, strTemplate]);

// ---- 3. 对象创建 vs 复用 ----
console.log("\\n===== 3. 对象创建 vs 复用 =====");

function processPoint(p) {
  return p.x * p.x + p.y * p.y;
}

const createNew = benchmark(
  "每次创建新对象",
  () => {
    let total = 0;
    for (let i = 0; i < 50000; i++) {
      const point = { x: i, y: i * 2 };
      total += processPoint(point);
    }
    return total;
  },
  50
);

const reuse = benchmark(
  "复用同一对象",
  () => {
    const point = { x: 0, y: 0 };
    let total = 0;
    for (let i = 0; i < 50000; i++) {
      point.x = i;
      point.y = i * 2;
      total += processPoint(point);
    }
    return total;
  },
  50
);

console.log("对象创建性能对比（50次迭代，每次5万次循环）:");
console.table([createNew, reuse]);

// ---- 4. 斐波那契数列：缓存优化 ----
console.log("\\n===== 4. 斐波那契数列：缓存优化 =====");

// 无缓存版本（O(2^n) 复杂度）
function fibNoCache(n) {
  if (n <= 1) return n;
  return fibNoCache(n - 1) + fibNoCache(n - 2);
}

// 带缓存版本（O(n) 复杂度）
function fibWithCache(n, cache = {}) {
  if (n <= 1) return n;
  if (cache[n] !== undefined) return cache[n];
  cache[n] = fibWithCache(n - 1, cache) + fibWithCache(n - 2, cache);
  return cache[n];
}

const n = 35;
console.log("计算 fib(" + n + "):");

const fibNoCacheResult = benchmark("无缓存递归", () => fibNoCache(n), 1);
const fibCacheResult = benchmark("带缓存递归", () => fibWithCache(n), 1);

console.log("无缓存版本耗时:", fibNoCacheResult.totalTime);
console.log("带缓存版本耗时:", fibCacheResult.totalTime);

const speedup = parseFloat(fibNoCacheResult.totalTime) / parseFloat(fibCacheResult.totalTime);
console.log("缓存加速比: " + speedup.toFixed(0) + "x");

// ---- 5. process.memoryUsage 内存监控 ----
console.log("\\n===== 5. process.memoryUsage 内存监控 =====");

function formatMemory(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

function printMemoryUsage(label) {
  const mem = process.memoryUsage();
  console.log("[" + label + "]");
  console.log("  heapUsed:   " + formatMemory(mem.heapUsed));
  console.log("  heapTotal:  " + formatMemory(mem.heapTotal));
  console.log("  rss:        " + formatMemory(mem.rss));
  console.log("  external:   " + formatMemory(mem.external));
  console.log("  arrayBuffers: " + formatMemory(mem.arrayBuffers));
  return {
    heapUsedMB: parseFloat(formatMemory(mem.heapUsed)),
    heapTotalMB: parseFloat(formatMemory(mem.heapTotal)),
    rssMB: parseFloat(formatMemory(mem.rss)),
  };
}

const baseline = printMemoryUsage("基准内存");

// 模拟分配大量内存
console.log("\\n分配大数组...");
const largeArray = new Array(500000).fill("数据块" + "x".repeat(20));
const afterAlloc = printMemoryUsage("分配大数组后");

console.log("\\n内存增长:");
console.log("  heapUsed 增长: " + (afterAlloc.heapUsedMB - baseline.heapUsedMB).toFixed(2) + " MB");
console.log("  rss 增长: " + (afterAlloc.rssMB - baseline.rssMB).toFixed(2) + " MB");

// 释放内存
largeArray.length = 0;
console.log("\\n释放大数组后:");
printMemoryUsage("释放后");

// ---- 6. 事件循环延迟检测 ----
console.log("\\n===== 6. 事件循环延迟检测 =====");

let sampleCount = 0;
let maxDelay = 0;
let totalDelay = 0;
let lastCheck = performance.now();

// 模拟3次检测
const checkInterval = setInterval(() => {
  const now = performance.now();
  const expectedInterval = 100;
  const delay = now - lastCheck - expectedInterval;

  sampleCount++;
  totalDelay += Math.max(0, delay);
  if (delay > maxDelay) maxDelay = delay;

  const status = delay > 10 ? "⚠️ 高延迟" : delay > 5 ? "⚡ 轻微延迟" : "✅ 正常";
  console.log(
    "  采样 #" + sampleCount +
    " | 延迟: " + delay.toFixed(3) + "ms" +
    " | " + status
  );

  lastCheck = now;

  if (sampleCount >= 3) {
    clearInterval(checkInterval);
    console.log("\\n事件循环延迟统计:");
    console.log("  采样次数: " + sampleCount);
    console.log("  最大延迟: " + maxDelay.toFixed(3) + "ms");
    console.log("  平均延迟: " + (sampleCount > 0 ? (totalDelay / sampleCount).toFixed(3) : "0") + "ms");

    if (maxDelay > 50) {
      console.log("  ⚠️ 警告：事件循环延迟超过 50ms，可能影响用户体验");
    }

    // ---- 7. CPU 密集型操作的影响 ----
    console.log("\\n===== 7. CPU 密集型操作的影响 =====");

    function simulateEventLoopBlock() {
      console.log("模拟事件循环阻塞...");
      const start = performance.now();

      // 同步阻塞操作
      let sum = 0;
      for (let i = 0; i < 5000000; i++) {
        sum += Math.sqrt(i) * Math.sin(i);
      }

      const elapsed = (performance.now() - start).toFixed(2);
      console.log("  阻塞操作完成，耗时: " + elapsed + "ms");
      console.log("  在这段时间内，事件循环无法处理其他任务");
      console.log("  结果: " + sum.toFixed(2));
    }

    // 先设置一个定时器，然后立即执行阻塞操作
    let timerFired = false;
    setTimeout(() => {
      timerFired = true;
    }, 0);

    simulateEventLoopBlock();

    // 检查定时器是否在阻塞期间被触发
    setTimeout(() => {
      console.log("\\n定时器在阻塞操作之后才触发: " + timerFired);
      console.log("（定时器被阻塞操作推迟了执行）");

      // ---- 8. 性能分析总结 ----
      console.log("\\n===== 8. 性能分析总结 =====");
      const tips = [
        "1. performance.now() — 高精度微秒级计时",
        "2. process.memoryUsage() — 监控 heapUsed/heapTotal/rss",
        "3. 缓存优化 — 空间换时间，fibonacci 加速上千倍",
        "4. 对象复用 — 减少 GC 压力，避免频繁创建对象",
        "5. 事件循环延迟 — 检测阻塞操作，目标 < 50ms",
        "6. 算法选择 — Set 去重比 filter+indexOf 快数百倍",
        "7. 数组 join — 大量字符串拼接时比 + 操作符更快",
        "8. 基准测试 — 预热 + 多次迭代 + 统计对比",
        "9. 帕累托原则 — 80% 时间花在 20% 代码上",
        "10. 测量优于猜测 — 用数据驱动优化决策",
      ];
      tips.forEach((tip) => console.log("  " + tip));
    }, 10);
  }
}, 100);`,
  },

  // =========================================================
  // 第六章：内存泄漏排查
  // =========================================================
  {
    id: "node-memory-leak",
    title: "内存泄漏排查",
    icon: "💧",
    group: "测试与调试",
    content: `## 内存泄漏的本质

内存泄漏是指程序中**不再需要的对象仍然被引用，导致垃圾回收器（GC）无法释放它们**。在 JavaScript 中，GC 是自动的，但"自动"不等于"完美"——只要对象还有引用存在，GC 就不会回收它。

### 内存泄漏的常见原因

#### 1. 全局变量

全局变量在整个应用生命周期内都不会被回收：

\`\`\`javascript
// ❌ 无意中创建全局变量
function processData() {  // 声明函数 processData
  data = fetchData(); // 忘记 var/let/const，data 变成全局变量
}

// ❌ 显式挂载到 global
global.cache = new Map(); // 永远不清理，持续增长
\`\`\`

#### 2. 闭包

闭包持有对大对象的引用，即使只需要其中一小部分数据：

\`\`\`javascript
// ❌ 闭包泄漏：持有整个大数组
function createHandler() {  // 声明函数 createHandler
  const largeData = new Array(1000000).fill('x');  // 创建实例 largeData
  return () => console.log(largeData[0]); // 整个 largeData 无法被回收
}
\`\`\`

#### 3. 事件监听器

注册了事件监听器但忘记移除，导致被监听的对象和回调函数都无法被回收：

\`\`\`javascript
// ❌ 监听器泄漏
emitter.on('data', (data) => {
  this.process(data); // this 被 emitter 引用
});
// 如果 this 应该被销毁，emitter 会阻止它被 GC
\`\`\`

#### 4. 定时器

\`setInterval\` 和 \`setTimeout\` 如果不清理，会持有回调函数的引用：

\`\`\`javascript
// ❌ 定时器泄漏
this.timer = setInterval(() => {
  this.poll(); // this 和 timer 互相引用
}, 1000);
\`\`\`

#### 5. 缓存无限增长

使用 Map 或普通对象作为缓存，但不限制大小或设置过期时间。

---

### 内存快照对比

通过对比不同时间点的内存快照，可以找出哪些对象在持续增长：

\`\`\`bash
# 使用 --inspect 启动应用
node --inspect app.js  # 用 Node.js 执行脚本 --inspect

# 在 Chrome DevTools → Memory → Heap Snapshot
# 拍摄快照1 → 执行操作 → 拍摄快照2 → 对比差异
\`\`\`

---

### heapdump 工具

\`heapdump\` 模块可以在程序运行时生成堆快照文件：

\`\`\`javascript
const heapdump = require('heapdump');  // 导入模块 heapdump；require 返回 module.exports
heapdump.writeSnapshot('/tmp/heap-' + Date.now() + '.heapsnapshot');
\`\`\`

生成的 \`.heapsnapshot\` 文件可以在 Chrome DevTools 中打开分析。

---

### WeakMap / WeakRef

**WeakMap**：键是弱引用的 Map。如果键对象被 GC 回收，对应的条目会自动移除。

**WeakRef**：允许创建一个对象的弱引用，不阻止 GC 回收该对象。

\`\`\`javascript
// WeakMap 缓存：对象被回收后缓存自动清理
const cache = new WeakMap();  // 创建实例 cache
function processObj(obj) {  // 声明函数 processObj
  if (cache.has(obj)) return cache.get(obj);  // 条件判断
  const result = compute(obj);  // 定义常量 result
  cache.set(obj, result);
  return result; // 当 obj 被回收时，缓存条目自动清理
}
\`\`\`

---

### 防止内存泄漏的最佳实践

1. **使用 'use strict'** 防止无意中创建全局变量。
2. **清理事件监听器**：使用 \`emitter.once()\` 或手动 \`emitter.off()\`。
3. **清理定时器**：\`clearInterval()\` / \`clearTimeout()\`。
4. **使用 WeakMap 做缓存**：避免缓存阻止对象被回收。
5. **限制缓存大小**：使用 LRU 淘汰策略。
6. **定期监控内存**：使用 \`process.memoryUsage()\` 检查趋势。
7. **避免在闭包中持有大对象**：只保留需要的数据。

下面这段代码演示了 4 种内存泄漏场景及其排查方法。`,
    code: `// ============================================================
// 第六章代码演示：内存泄漏场景与排查方法
// ============================================================
const EventEmitter = require("events");
// 沙箱未注入 global，用 globalThis 建立别名以演示全局变量泄漏场景
const global = globalThis;

// ---- 1. 内存监控工具 ----
console.log("===== 1. 内存监控工具 =====");

function formatMemoryMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(2);
}

function printMemory(label) {
  const mem = process.memoryUsage();
  console.log(
    "[" + label + "] " +
    "heapUsed: " + formatMemoryMB(mem.heapUsed) + " MB | " +
    "heapTotal: " + formatMemoryMB(mem.heapTotal) + " MB | " +
    "rss: " + formatMemoryMB(mem.rss) + " MB"
  );
  return {
    heapUsed: parseFloat(formatMemoryMB(mem.heapUsed)),
    heapTotal: parseFloat(formatMemoryMB(mem.heapTotal)),
    rss: parseFloat(formatMemoryMB(mem.rss)),
  };
}

const baseline = printMemory("程序启动时");

// 内存泄漏检测器
class MemoryLeakDetector {
  constructor() {
    this.samples = [];
    this.baseline = printMemory("检测器初始化");
  }

  sample() {
    const mem = process.memoryUsage();
    const sample = {
      time: new Date().toISOString(),
      heapUsedMB: parseFloat(formatMemoryMB(mem.heapUsed)),
      heapTotalMB: parseFloat(formatMemoryMB(mem.heapTotal)),
      rssMB: parseFloat(formatMemoryMB(mem.rss)),
      externalMB: parseFloat(formatMemoryMB(mem.external)),
    };
    this.samples.push(sample);
    return sample;
  }

  // 检测是否有泄漏趋势
  analyze() {
    if (this.samples.length < 2) {
      return { hasLeak: false, reason: "样本不足" };
    }

    const recent = this.samples.slice(-3);
    let growthCount = 0;
    let totalGrowth = 0;

    for (let i = 1; i < recent.length; i++) {
      const growth = recent[i].heapUsedMB - recent[i - 1].heapUsedMB;
      totalGrowth += growth;
      if (growth > 0.1) growthCount++;
    }

    const hasLeak = growthCount >= 2 && totalGrowth > 0.5;
    return {
      hasLeak,
      growthCount,
      totalGrowthMB: totalGrowth.toFixed(2),
      samples: recent.length,
      verdict: hasLeak
        ? "⚠️ 检测到内存增长趋势，可能存在内存泄漏"
        : "✅ 内存使用稳定",
    };
  }

  getSamples() {
    return this.samples;
  }
}

const detector = new MemoryLeakDetector();

// ---- 2. 场景1：全局变量泄漏 ----
console.log("\\n===== 2. 场景1：全局变量泄漏 =====");

// ❌ 泄漏版本：数据挂在 global 上
function leakyGlobalCache() {
  if (!global._leakyCache) {
    global._leakyCache = [];
  }
  // 每次调用添加 5000 条数据
  for (let i = 0; i < 5000; i++) {
    global._leakyCache.push({
      id: i,
      data: "x".repeat(50),
      timestamp: Date.now(),
    });
  }
}

// 执行几次泄漏操作
leakyGlobalCache();
leakyGlobalCache();
leakyGlobalCache();
detector.sample();
printMemory("全局变量泄漏后");
console.log("global._leakyCache 条目数:", global._leakyCache.length);

// 清理全局泄漏
delete global._leakyCache;
console.log("已清理 global._leakyCache");

// ✅ 修复版本：使用局部变量
function fixedLocalCache() {
  const localCache = []; // 局部变量，函数返回后即可被 GC
  for (let i = 0; i < 5000; i++) {
    localCache.push({ id: i, data: "x".repeat(50) });
  }
  return localCache.length;
}

fixedLocalCache();
fixedLocalCache();
fixedLocalCache();
detector.sample();
printMemory("使用局部变量后");

// ---- 3. 场景2：闭包泄漏 ----
console.log("\\n===== 3. 场景2：闭包泄漏 =====");

// ❌ 泄漏版本：闭包持有整个大数组
function createLeakyClosure() {
  const largeData = new Array(30000).fill("大数据块");
  return function () {
    // 只用了第一个元素，但整个 largeData 都被闭包持有
    return largeData[0];
  };
}

const leakyFuncs = [];
for (let i = 0; i < 30; i++) {
  leakyFuncs.push(createLeakyClosure());
}
detector.sample();
printMemory("闭包泄漏后");
console.log("创建了 30 个持有大数组的闭包");

// 清理
leakyFuncs.length = 0;

// ✅ 修复版本：只保留需要的数据
function createFixedClosure() {
  const firstItem = new Array(30000).fill("大数据块")[0];
  return function () {
    return firstItem; // 只持有 firstItem 字符串
  };
}

const fixedFuncs = [];
for (let i = 0; i < 30; i++) {
  fixedFuncs.push(createFixedClosure());
}
detector.sample();
printMemory("修复闭包后");
fixedFuncs.length = 0;

// ---- 4. 场景3：事件监听器泄漏 ----
console.log("\\n===== 4. 场景3：事件监听器泄漏 =====");

const emitter = new EventEmitter();

// ❌ 泄漏版本：注册了监听器但从不移除
const leakyListeners = [];
function createLeakyListener() {
  const handler = (data) => {
    // 这个闭包持有 handler 引用的作用域
  };
  emitter.on("leaky-data", handler);
  leakyListeners.push(handler);
}

for (let i = 0; i < 50; i++) {
  createLeakyListener();
}
console.log("注册了 50 个事件监听器到 'leaky-data'");
console.log("'leaky-data' 监听器数量:", emitter.listenerCount("leaky-data"));

// 发送事件
emitter.emit("leaky-data", "测试数据");
detector.sample();
printMemory("事件监听器泄漏后");

// 清理泄漏的监听器
emitter.removeAllListeners("leaky-data");
console.log("已清理所有 'leaky-data' 监听器");

// ✅ 修复版本：使用 once 或手动清理
function createSafeListener() {
  const handler = (data) => {
    console.log("  安全处理:", String(data).slice(0, 20));
    emitter.off("safe-data", handler); // 处理完后移除自己
  };
  emitter.on("safe-data", handler);
}

for (let i = 0; i < 10; i++) {
  createSafeListener();
}
emitter.emit("safe-data", "安全事件数据");
console.log("触发事件后 'safe-data' 监听器数量:", emitter.listenerCount("safe-data"));

// ---- 5. 场景4：定时器泄漏 ----
console.log("\\n===== 5. 场景4：定时器泄漏 =====");

// ❌ 泄漏版本：定时器持有大对象引用
function createLeakyTimer() {
  const largeData = new Array(50000).fill("定时器数据");
  const timer = setInterval(() => {
    if (largeData.length > 0) {
      // 定时器回调持有 largeData 引用
      // 即使不需要 largeData，它也无法被回收
    }
  }, 10000);
  return timer;
}

const leakyTimers = [];
for (let i = 0; i < 10; i++) {
  leakyTimers.push(createLeakyTimer());
}
detector.sample();
printMemory("定时器泄漏后");
console.log("创建了 10 个泄漏的定时器");

// 清理泄漏的定时器
leakyTimers.forEach((t) => clearInterval(t));
leakyTimers.length = 0;

// ✅ 修复版本：安全的定时器管理器
class SafeTimerManager {
  constructor() {
    this.timers = new Set();
  }

  createInterval(fn, interval) {
    const timer = setInterval(fn, interval);
    this.timers.add(timer);
    return timer;
  }

  clearTimer(timer) {
    clearInterval(timer);
    this.timers.delete(timer);
  }

  destroy() {
    for (const timer of this.timers) {
      clearInterval(timer);
    }
    this.timers.clear();
  }
}

const manager = new SafeTimerManager();
const t1 = manager.createInterval(() => {}, 10000);
const t2 = manager.createInterval(() => {}, 10000);
console.log("安全定时器管理器创建了 2 个定时器");
manager.destroy();
console.log("调用 destroy() 后，所有定时器已清理");
detector.sample();
printMemory("定时器清理后");

// ---- 6. WeakMap 解决缓存泄漏 ----
console.log("\\n===== 6. WeakMap 解决缓存泄漏 =====");

// ❌ 普通 Map 缓存：键对象被回收后，缓存条目不会自动清理
const normalCache = new Map();

function processWithNormalCache(obj) {
  if (normalCache.has(obj)) {
    return normalCache.get(obj);
  }
  const result = { processed: true, data: obj.name, time: Date.now() };
  normalCache.set(obj, result);
  return result;
}

let objA = { name: "对象A", data: "x".repeat(500) };
let objB = { name: "对象B", data: "x".repeat(500) };
processWithNormalCache(objA);
processWithNormalCache(objB);
console.log("普通 Map 缓存条目数:", normalCache.size);

// 即使将 objA 设为 null，Map 中的条目仍然存在
objA = null;
console.log("将 objA 设为 null 后，缓存条目数:", normalCache.size);
console.log("（普通 Map 中的条目不会被自动清理——这是潜在的内存泄漏）");

// ✅ WeakMap 缓存：键被回收后，条目自动清理
const weakCache = new WeakMap();

function processWithWeakCache(obj) {
  if (weakCache.has(obj)) {
    return weakCache.get(obj);
  }
  const result = { processed: true, data: obj.name, time: Date.now() };
  weakCache.set(obj, result);
  return result;
}

let objC = { name: "对象C", data: "x".repeat(500) };
let objD = { name: "对象D", data: "x".repeat(500) };
processWithWeakCache(objC);
processWithWeakCache(objD);

console.log("WeakMap 缓存已设置（无法直接查看 size）");
console.log("objC 缓存命中:", weakCache.has(objC)); // true

objC = null;
console.log("将 objC 设为 null 后，WeakMap 会在 GC 时自动清理对应条目");
console.log("（WeakMap 的条目不会阻止对象被 GC 回收）");

// ---- 7. 内存泄漏检测结果 ----
console.log("\\n===== 7. 内存泄漏检测结果 =====");

detector.sample();
const analysis = detector.analyze();

console.log("检测分析:", analysis.verdict);
console.log("增长趋势:", analysis.growthCount + "/3 次采样有增长");
console.log("总增长:", analysis.totalGrowthMB + " MB");

console.log("\\n内存采样记录:");
console.table(detector.getSamples().map((s, i) => ({
  "#": i + 1,
  "时间": s.time.slice(11, 19),
  "heapUsed(MB)": s.heapUsedMB,
  "heapTotal(MB)": s.heapTotalMB,
  "rss(MB)": s.rssMB,
})));

// 最终内存状态
printMemory("程序结束");

// ---- 8. 内存泄漏修复清单 ----
console.log("\\n===== 8. 内存泄漏修复清单 =====");
const checklist = [
  { 场景: "全局变量", 风险: "永不回收", 修复: "使用局部变量，避免 global 挂载" },
  { 场景: "闭包引用", 风险: "持有大对象引用", 修复: "只保留需要的数据，释放不需要的引用" },
  { 场景: "事件监听器", 风险: "emitter 持有回调引用", 修复: "使用 once() 或手动 off()" },
  { 场景: "定时器", 风险: "回调持有外部引用", 修复: "clearInterval/clearTimeout 清理" },
  { 场景: "Map 缓存", 风险: "缓存无限增长", 修复: "使用 WeakMap 或 LRU 淘汰策略" },
  { 场景: "Stream", 风险: "流未关闭", 修复: "确保 destroy() 或 end() 被调用" },
  { 场景: "Promise", 风险: "未处理的 Promise 链", 修复: "确保有 catch 处理" },
  { 场景: "Buffer", 风险: "大 Buffer 未释放", 修复: "及时置 null 或使用 Buffer.allocUnsafe" },
];
console.table(checklist);

console.log("\\n内存泄漏排查核心思路:");
console.log("  1. 使用 process.memoryUsage() 定期监控内存趋势");
console.log("  2. 拍摄堆快照对比，定位持续增长的对象");
console.log("  3. 分析引用链，找到阻止 GC 的根源");
console.log("  4. 修复引用问题（清理监听器、定时器、缓存）");
console.log("  5. 使用 WeakMap/WeakRef 避免不必要的强引用");
console.log("  6. 验证修复效果，确保内存不再增长");`,
  },
];

// =============================================================
// 章节分组导出
// =============================================================
export const chapterGroups = [
  {
    id: "node-testing-basics",
    group: "测试与调试",
    title: "测试基础",
    icon: "🧪",
    chapters: ["node-testing-basics"],
  },
  {
    id: "node-testing-advanced",
    group: "测试与调试",
    title: "高级测试技巧",
    icon: "🔬",
    chapters: ["node-testing-advanced"],
  },
  {
    id: "node-debugging",
    group: "测试与调试",
    title: "调试技巧",
    icon: "🐛",
    chapters: ["node-debugging"],
  },
  {
    id: "node-logging",
    group: "测试与调试",
    title: "结构化日志",
    icon: "📝",
    chapters: ["node-logging"],
  },
  {
    id: "node-profiling",
    group: "测试与调试",
    title: "性能分析",
    icon: "📊",
    chapters: ["node-profiling"],
  },
  {
    id: "node-memory-leak",
    group: "测试与调试",
    title: "内存泄漏排查",
    icon: "💧",
    chapters: ["node-memory-leak"],
  },
];