export const chapters = [
  {
    id: "n3-decorator",
    title: "装饰器模式（Decorator）",
    icon: "🎀",
    group: "第三部分 结构型与行为型模式",
    content: `# 装饰器模式（Decorator）

## 一、模式定义

装饰器模式（Decorator Pattern）是一种结构型设计模式，它允许在不改变原有对象结构的前提下，动态地给对象添加一些额外的职责（功能）。就功能扩展而言，装饰器模式比生成子类（继承）更加灵活。

装饰器模式的核心思想是：**用组合代替继承**。传统的继承是静态的，在编译时就确定了对象的行为；而装饰器是在运行时动态地将功能一层层"包裹"到对象上，可以灵活地组合和拆卸。

### 1.1 为什么需要装饰器模式

假设我们有一个基础组件，如果要给它添加日志功能，可以通过继承创建一个带日志的子类；如果还要添加缓存功能，又需要再继承一个子类；如果既要日志又要缓存，还需要一个子类。随着功能组合的增多，子类的数量会呈指数级增长（类爆炸）。装饰器模式解决了这个问题——每个装饰器只负责一个功能，运行时按需组合。

## 二、装饰器模式的结构

装饰器模式包含以下角色：

1. **Component（抽象组件）**：定义一个对象接口，可以给这些对象动态添加职责。
2. **ConcreteComponent（具体组件）**：定义一个具体的对象，也可以给这个对象添加一些职责。
3. **Decorator（抽象装饰器）**：继承或实现 Component，持有一个 Component 引用，并定义与 Component 一致的接口。
4. **ConcreteDecorator（具体装饰器）**：负责给组件添加具体的职责。

在 JavaScript 这种函数式语言中，我们通常不需要严格的类继承结构，而是用高阶函数来实现装饰器，更加简洁自然。

## 三、装饰器模式与继承的区别

| 特性 | 继承 | 装饰器 |
|------|------|--------|
| 时机 | 静态，编译时确定 | 动态，运行时组合 |
| 灵活性 | 子类与父类强耦合 | 装饰器之间独立，可自由组合 |
| 复用粒度 | 类级别 | 功能级别，细粒度 |
| 组合方式 | 单继承链 | 多层嵌套包装 |
| 类数量 | 功能组合导致类爆炸 | N 个功能只需 N 个装饰器 |

继承是"is-a"关系，装饰器是"has-a"关系。装饰器持有被装饰对象的引用，在调用前后添加自己的行为。

## 四、JavaScript 中的装饰器实现方式

### 4.1 高阶函数装饰器

在 JavaScript 中，函数是一等公民，所以最简单的装饰器就是高阶函数——接收一个函数作为参数，返回一个增强后的新函数。这是最常用、最实用的装饰器实现方式。

常见的高阶函数装饰器包括：
- **日志装饰器**：在函数调用前后记录日志
- **性能计时装饰器**：统计函数执行时间
- **重试装饰器**：函数执行失败时自动重试
- **缓存装饰器（Memoize）**：缓存函数调用结果，避免重复计算
- **防抖/节流装饰器**：控制函数调用频率

### 4.2 类装饰器与方法装饰器

ES6 引入了 class 语法后，TC39 提出了装饰器提案（Decorator Proposal），可以用 \`@decorator\` 语法来装饰类和类方法。类装饰器接收类构造函数作为参数，可以修改或替换类；方法装饰器接收目标对象、属性名、属性描述符，可以修改方法行为。

虽然 TC39 装饰器提案几经变动（从传统装饰器到最新的 Stage 3 版本），但核心思想一致：在定义阶段对类或方法进行增强。TypeScript 中的装饰器（experimentalDecorators）是较早版本的实现，而最新的 JavaScript 装饰器标准已经在现代引擎中逐步落地。

### 4.3 AOP 面向切面编程

装饰器模式是 AOP（Aspect-Oriented Programming，面向切面编程）在 JavaScript 中的典型实现。AOP 的核心是将横切关注点（如日志、事务、权限、缓存）从业务逻辑中分离出来，通过装饰器（切面）动态织入。这保持了业务逻辑的纯粹性，同时提高了代码复用性。

## 五、装饰器模式的实际应用场景

1. **Express/Koa 中间件**：中间件本质就是装饰器模式。每个中间件接收 \`(req, res, next)\`，在 next 前后执行自己的逻辑，一层层包装，形成处理管道。
2. **React 高阶组件（HOC）**：\`withRouter\`、\`connect\` 等 HOC 就是组件装饰器，接收一个组件返回一个增强的新组件。
3. **日志与监控**：在不修改业务代码的前提下，给关键函数添加日志记录和性能监控。
4. **缓存层**：为数据库查询、API 请求添加缓存装饰器，提高性能。
5. **参数校验**：在函数执行前校验参数合法性。
6. **权限控制**：在函数执行前检查用户权限。

## 六、装饰器模式的优缺点

### 优点
- 比继承更灵活，可以动态组合多个装饰器
- 遵循开闭原则，对扩展开放，对修改关闭
- 每个装饰器职责单一，便于复用和测试
- 可以按需添加和移除装饰器

### 缺点
- 多层装饰器嵌套会增加调试难度
- 装饰器顺序可能影响结果，需要注意排列顺序
- 过度使用会导致代码中产生大量小对象，增加理解成本

## 七、总结

装饰器模式是 JavaScript 中最实用的设计模式之一。在函数式编程范式下，高阶函数是最自然的装饰器实现方式。掌握装饰器模式，可以帮助我们写出更加灵活、可复用、可组合的代码。从 Express 中间件到 React HOC，从日志记录到缓存优化，装饰器模式无处不在。`,
    code: `// ==================== 装饰器模式完整演示 ====================

// ---------- 1. 高阶函数装饰器基础 ----------

// 1.1 日志装饰器
function withLogging(fn, fnName = fn.name || 'anonymous') {
  return function(...args) {
    console.log(\`[LOG] 调用函数 \${fnName}，参数: \${JSON.stringify(args)}\`);
    const start = Date.now();
    const result = fn.apply(this, args);
    const end = Date.now();
    console.log(\`[LOG] 函数 \${fnName} 执行完成，耗时: \${end - start}ms，返回值: \${JSON.stringify(result)}\`);
    return result;
  };
}

// 1.2 性能计时装饰器
function withTiming(fn, label = fn.name || 'function') {
  return function(...args) {
    const start = performance.now();
    const result = fn.apply(this, args);
    const end = performance.now();
    console.log(\`[TIMING] \${label} 执行耗时: \${(end - start).toFixed(4)}ms\`);
    return result;
  };
}

// 1.3 重试装饰器
function withRetry(fn, maxRetries = 3, delayMs = 100) {
  return async function(...args) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn.apply(this, args);
      } catch (err) {
        lastError = err;
        console.log(\`[RETRY] 第 \${attempt} 次尝试失败: \${err.message}\`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        }
      }
    }
    throw lastError;
  };
}

// 1.4 缓存 Memoize 装饰器
function withMemoize(fn, resolver = (...args) => JSON.stringify(args)) {
  const cache = new Map();
  return function(...args) {
    const key = resolver.apply(this, args);
    if (cache.has(key)) {
      console.log(\`[MEMOIZE] 缓存命中，key: \${key}\`);
      return cache.get(key);
    }
    console.log(\`[MEMOIZE] 缓存未命中，计算中... key: \${key}\`);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// 1.5 防抖装饰器
function withDebounce(fn, waitMs = 300) {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, waitMs);
  };
}

// ---------- 2. 装饰器组合使用 ----------

// 基础业务函数：计算斐波那契（递归版本，慢，适合演示缓存）
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 组合装饰器：先加缓存，再加日志，再加计时
const enhancedFib = withLogging(
  withTiming(
    withMemoize(fibonacci)
  ), 'fibonacci'
);

// 模拟数据库查询函数
async function fetchUserData(userId) {
  await new Promise(r => setTimeout(r, 100));
  if (userId < 0) throw new Error('无效的用户ID');
  return { id: userId, name: \`用户\${userId}\`, age: 20 + userId };
}

// 带重试的数据库查询
const reliableFetch = withRetry(fetchUserData, 3, 50);

// ---------- 3. 类方法装饰器（模拟TC39装饰器风格） ----------

// 类方法装饰器工厂
function methodDecorator(before, after) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function(...args) {
      if (before) before.call(this, propertyKey, args);
      const result = originalMethod.apply(this, args);
      if (after) after.call(this, propertyKey, result);
      return result;
    };
    return descriptor;
  };
}

// 具体的类方法日志装饰器
function logMethod(target, propertyKey, descriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args) {
    console.log(\`[MethodLog] 调用方法 \${propertyKey}，参数: \${JSON.stringify(args)}\`);
    const result = original.apply(this, args);
    console.log(\`[MethodLog] 方法 \${propertyKey} 返回: \${JSON.stringify(result)}\`);
    return result;
  };
  return descriptor;
}

// 只读装饰器
function readonly(target, propertyKey, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

// 手动应用装饰器的工具函数（模拟@装饰器语法）
function applyDecorators(target, decorators) {
  decorators.forEach(({ prop, decorator }) => {
    const descriptor = Object.getOwnPropertyDescriptor(target.prototype, prop);
    const newDescriptor = decorator(target.prototype, prop, descriptor);
    if (newDescriptor) {
      Object.defineProperty(target.prototype, prop, newDescriptor);
    }
  });
}

// 示例类
class Calculator {
  add(a, b) { return a + b; }
  multiply(a, b) { return a * b; }
}

// 手动给方法应用装饰器
applyDecorators(Calculator, [
  { prop: 'add', decorator: logMethod },
  { prop: 'multiply', decorator: logMethod }
]);

// ---------- 4. AOP 面向切面装饰器 ----------

function before(fn, advice) {
  return function(...args) {
    advice.apply(this, args);
    return fn.apply(this, args);
  };
}

function after(fn, advice) {
  return function(...args) {
    const result = fn.apply(this, args);
    advice.call(this, result);
    return result;
  };
}

function around(fn, advice) {
  return function(...args) {
    const joinPoint = {
      args,
      target: this,
      proceed: () => fn.apply(this, args)
    };
    return advice.call(this, joinPoint);
  };
}

// ---------- 5. 运行演示 ----------

async function main() {
  console.log('========== 1. 组合装饰器演示（缓存+计时+日志） ==========\\n');
  
  console.log('--- 第一次调用 fib(10) ---');
  console.log('结果:', enhancedFib(10));
  console.log('');
  
  console.log('--- 第二次调用 fib(10)（缓存命中）---');
  console.log('结果:', enhancedFib(10));
  console.log('');
  
  console.log('--- 第一次调用 fib(15) ---');
  console.log('结果:', enhancedFib(15));
  console.log('');
  
  console.log('--- 第二次调用 fib(15)（缓存命中）---');
  console.log('结果:', enhancedFib(15));
  console.log('');

  console.log('========== 2. 重试装饰器演示 ==========\\n');
  
  try {
    const user = await reliableFetch(1);
    console.log('成功获取用户:', user);
  } catch (e) {
    console.log('最终失败:', e.message);
  }
  
  try {
    await reliableFetch(-1);
  } catch (e) {
    console.log('重试后最终失败:', e.message);
  }
  console.log('');

  console.log('========== 3. 类方法装饰器演示 ==========\\n');
  const calc = new Calculator();
  console.log('add(3, 4) =', calc.add(3, 4));
  console.log('multiply(5, 6) =', calc.multiply(5, 6));
  console.log('');

  console.log('========== 4. AOP环绕装饰器演示 ==========\\n');
  
  const businessLogic = (name) => \`Hello, \${name}!\`;
  
  const wrappedLogic = around(businessLogic, (joinPoint) => {
    console.log('[AOP Before] 方法执行前，参数:', joinPoint.args);
    const result = joinPoint.proceed();
    console.log('[AOP After] 方法执行后，结果:', result);
    return \`[包装] \${result}\`;
  });
  
  console.log(wrappedLogic('World'));
  console.log('');

  console.log('========== 5. 防抖装饰器演示 ==========\\n');
  let debounceCount = 0;
  const debouncedFn = withDebounce(() => {
    debounceCount++;
    console.log('防抖函数执行，第', debounceCount, '次');
  }, 100);
  
  debouncedFn();
  debouncedFn();
  debouncedFn();
  console.log('快速调用3次防抖函数，等待200ms后...');
  await new Promise(r => setTimeout(r, 200));
  console.log('最终只执行了', debounceCount, '次');
}

main().catch(console.error);
`,
  },
  {
    id: "n3-proxy",
    title: "代理模式（Proxy）",
    icon: "🛡️",
    group: "第三部分 结构型与行为型模式",
    content: `# 代理模式（Proxy）

## 一、模式定义

代理模式（Proxy Pattern）是一种结构型设计模式，为其他对象提供一种代理以控制对这个对象的访问。代理对象在客户端和目标对象之间起到中介作用，可以在访问目标对象前后添加额外的逻辑。

生活中代理的例子比比皆是：律师代理当事人处理法律事务，经纪人代理明星处理商业合作，VPN 代理访问远程网络，快递柜代理收件。在这些场景中，我们不直接与目标对象打交道，而是通过代理间接访问，代理可以帮我们做很多额外的事情。

## 二、代理模式的类型

根据用途不同，代理可以分为多种类型：

1. **虚拟代理（Virtual Proxy）**：延迟创建开销大的对象，直到真正需要时才创建。例如加载大图片时先显示占位符，图片加载完成后再替换。
2. **缓存代理（Cache Proxy）**：为昂贵的操作结果提供缓存，后续相同请求直接返回缓存结果。例如 HTTP 缓存、计算结果缓存。
3. **保护代理（Protection Proxy）**：控制对目标对象的访问权限，根据调用者身份决定是否允许访问。例如权限校验。
4. **远程代理（Remote Proxy）**：为位于不同地址空间的对象提供本地代表。例如 RPC 调用、gRPC 客户端 stub。
5. **写时复制代理（Copy-on-Write Proxy）**：延迟对象的复制过程，只有在真正修改时才复制，用于提高性能。
6. **日志代理（Logging Proxy）**：记录对目标对象的所有访问和操作。
7. **智能引用（Smart Reference）**：在访问对象时执行额外操作，如引用计数、懒加载。

## 三、ES6 Proxy 的强大能力

ES6 引入了原生的 \`Proxy\` 对象，这是 JavaScript 中代理模式的终极武器。\`Proxy\` 可以拦截几乎所有对目标对象的底层操作，这在以前是无法做到的。

\`Proxy\` 支持的拦截操作（traps）包括：

| 拦截方法 | 拦截的操作 |
|----------|-----------|
| \`get(target, prop, receiver)\` | 读取属性：\`obj.prop\`、\`obj[key]\` |
| \`set(target, prop, value, receiver)\` | 设置属性：\`obj.prop = value\` |
| \`has(target, prop)\` | \`in\` 操作符：\`prop in obj\` |
| \`deleteProperty(target, prop)\` | \`delete\` 操作：\`delete obj.prop\` |
| \`apply(target, thisArg, args)\` | 函数调用：\`fn(...args)\` |
| \`construct(target, args, newTarget)\` | \`new\` 操作：\`new Fn(...args)\` |
| \`getOwnPropertyDescriptor\` | \`Object.getOwnPropertyDescriptor\` |
| \`defineProperty\` | \`Object.defineProperty\` |
| \`getPrototypeOf\` | \`Object.getPrototypeOf\`、\`instanceof\` |
| \`setPrototypeOf\` | \`Object.setPrototypeOf\` |
| \`ownKeys\` | \`Object.keys\`、\`Object.getOwnPropertyNames\` |
| \`preventExtensions\` | \`Object.preventExtensions\` |
| \`isExtensible\` | \`Object.isExtensible\` |

## 四、Reflect 的作用

\`Reflect\` 是与 \`Proxy\` 配套的内置对象，它提供了一组与 Proxy traps 一一对应的静态方法。\`Reflect\` 的作用是：

1. **提供默认行为**：在 Proxy trap 中调用 \`Reflect\` 对应的方法，可以执行默认的底层操作，相当于"放行"。
2. **更规范的 API**：\`Reflect\` 方法返回布尔值表示操作是否成功，比 \`Object\` 上的方法抛异常更友好。
3. **函数式操作**：\`Reflect\` 将对象操作变成函数调用，便于组合和传递。

最佳实践：在 Proxy trap 中，完成自定义逻辑后，总是调用 \`Reflect\` 对应的方法来执行默认行为，确保操作的正确传播。

## 五、代理模式与装饰器模式的区别

代理模式和装饰器模式在结构上很相似——都是持有目标对象的引用并转发请求，但它们的意图不同：

| 维度 | 装饰器模式 | 代理模式 |
|------|-----------|---------|
| 目的 | 增强对象功能 | 控制对对象的访问 |
| 关系 | 装饰器知道被装饰者的存在 | 代理和目标可能完全独立 |
| 创建时机 | 组合时静态或动态传入 | 代理自己管理目标对象的生命周期 |
| 关注点 | 添加新职责 | 控制访问（权限、缓存、延迟等） |

简单来说：装饰器说"让我来帮你加个功能"，代理说"让我来帮你管这件事"。

## 六、代理模式的实际应用场景

1. **Vue 3 响应式系统**：Vue 3 使用 \`Proxy\` 替代了 Vue 2 的 \`Object.defineProperty\`，实现了更强大的响应式系统。\`reactive()\` 函数返回一个 Proxy，在 get 时追踪依赖，在 set 时触发更新。
2. **数据校验**：在 set 属性时校验数据类型和范围，非法值不允许设置。
3. **默认值处理**：访问不存在的属性时返回默认值而不是 undefined。
4. **日志追踪**：记录所有对象操作，用于调试和审计。
5. **只读视图**：通过 Proxy 包装对象，禁止所有修改操作。
6. **负数索引数组**：让数组支持 \`arr[-1]\` 访问最后一个元素。
7. **链式 API**：通过 Proxy 实现类似 jQuery 的链式调用，支持不存在的方法。
8. **类型安全**：在运行时为普通 JavaScript 对象添加类型检查。

## 七、代理模式的优缺点

### 优点
- 可以在客户端毫无察觉的情况下控制对对象的访问
- 符合开闭原则，可以在不修改目标对象的情况下添加控制逻辑
- 各种代理类型可以灵活组合
- ES6 Proxy 原生支持，性能好且功能强大

### 缺点
- 增加了一层间接访问，可能有轻微性能开销
- 过度使用会增加系统复杂度
- Proxy 无法透传目标对象的类型信息（在 TypeScript 中需要注意）

## 八、总结

ES6 Proxy 是 JavaScript 语言中最强大的元编程特性之一，它让代理模式从需要手动实现变成了语言内置能力。从 Vue 3 的响应式系统到各种数据校验、日志追踪、缓存优化，Proxy 都有着广泛的应用。理解 Proxy 和 Reflect，是掌握现代 JavaScript 框架底层原理的关键。`,
    code: `// ==================== 代理模式完整演示 ====================

// ---------- 1. ES6 Proxy 基础 ----------

console.log('========== 1. 基础 Proxy 拦截 ==========\\n');

const target = { name: 'Alice', age: 25 };

const loggingProxy = new Proxy(target, {
  get(obj, prop, receiver) {
    console.log(\`[GET] 读取属性: \${String(prop)}\`);
    if (prop in obj) {
      return Reflect.get(obj, prop, receiver);
    }
    return \`属性 \${String(prop)} 不存在\`;
  },
  set(obj, prop, value, receiver) {
    console.log(\`[SET] 设置属性: \${String(prop)} = \${JSON.stringify(value)}\`);
    return Reflect.set(obj, prop, value, receiver);
  },
  has(obj, prop) {
    console.log(\`[HAS] 检查属性: \${String(prop)}\`);
    return Reflect.has(obj, prop);
  },
  deleteProperty(obj, prop) {
    console.log(\`[DELETE] 删除属性: \${String(prop)}\`);
    return Reflect.deleteProperty(obj, prop);
  }
});

console.log('name:', loggingProxy.name);
console.log('age:', loggingProxy.age);
console.log('gender:', loggingProxy.gender);
loggingProxy.age = 26;
console.log('name in proxy:', 'name' in loggingProxy);
console.log('');

// ---------- 2. 数据响应式系统（简化版Vue3 reactive） ----------

console.log('========== 2. 响应式系统（类Vue3 reactive） ==========\\n');

let activeEffect = null;
const targetMap = new WeakMap();

function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  dep.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => effect());
  }
}

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key);
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, key);
      }
      return result;
    }
  });
}

function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

const state = reactive({ count: 0, message: 'Hello' });
let renderCount = 0;

effect(() => {
  renderCount++;
  console.log(\`[渲染] count = \${state.count}, message = \${state.message}, 渲染次数: \${renderCount}\`);
});

state.count = 1;
state.count = 2;
state.message = 'World';
console.log('');

// ---------- 3. 缓存代理 ----------

console.log('========== 3. 缓存代理 ==========\\n');

function createCacheProxy(fn) {
  const cache = new Map();
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        console.log(\`[Cache代理] 命中缓存，key: \${key}\`);
        return cache.get(key);
      }
      console.log(\`[Cache代理] 未命中缓存，执行计算，key: \${key}\`);
      const result = Reflect.apply(target, thisArg, args);
      cache.set(key, result);
      return result;
    }
  });
}

function slowMultiply(a, b) {
  let result = 0;
  for (let i = 0; i < b; i++) result += a;
  return result;
}

const cachedMultiply = createCacheProxy(slowMultiply);
console.log('3 * 4 =', cachedMultiply(3, 4));
console.log('3 * 4 =', cachedMultiply(3, 4));
console.log('5 * 6 =', cachedMultiply(5, 6));
console.log('');

// ---------- 4. 保护代理（数据校验） ----------

console.log('========== 4. 保护代理（数据校验） ==========\\n');

function createValidatedPerson(initialData) {
  const data = { ...initialData };
  return new Proxy(data, {
    set(obj, prop, value) {
      if (prop === 'age') {
        if (typeof value !== 'number' || value < 0 || value > 150) {
          console.log(\`[校验] 年龄设置非法: \${value}，必须是0-150的数字\`);
          return false;
        }
      }
      if (prop === 'name') {
        if (typeof value !== 'string' || value.length === 0) {
          console.log('[校验] 名字必须是非空字符串');
          return false;
        }
      }
      console.log(\`[校验通过] 设置 \${String(prop)} = \${value}\`);
      return Reflect.set(obj, prop, value);
    }
  });
}

const person = createValidatedPerson({ name: 'Bob', age: 30 });
person.age = 25;
person.age = -5;
person.age = 200;
person.name = '';
person.name = 'Charlie';
console.log('最终person:', { name: person.name, age: person.age });
console.log('');

// ---------- 5. 虚拟代理（图片懒加载） ----------

console.log('========== 5. 虚拟代理（图片懒加载模拟） ==========\\n');

function createImageProxy(realImageLoader) {
  let realImage = null;
  const placeholder = { src: 'loading-placeholder.png', loaded: false };
  
  return new Proxy({}, {
    get(target, prop) {
      if (prop === 'src') {
        if (!realImage) {
          console.log('[虚拟代理] 首次访问，开始加载真实图片...');
          realImage = { src: placeholder.src, loaded: false };
          realImageLoader((actualSrc) => {
            realImage.src = actualSrc;
            realImage.loaded = true;
            console.log('[虚拟代理] 真实图片加载完成:', actualSrc);
          });
        }
        return realImage ? realImage.src : placeholder.src;
      }
      if (prop === 'loaded') {
        return realImage ? realImage.loaded : false;
      }
      return undefined;
    }
  });
}

const image = createImageProxy((callback) => {
  setTimeout(() => callback('real-image.jpg'), 100);
});
console.log('初始src:', image.src, 'loaded:', image.loaded);
setTimeout(() => {
  console.log('150ms后 src:', image.src, 'loaded:', image.loaded);
}, 150);
console.log('');

// ---------- 6. 负数索引数组 ----------

console.log('========== 6. 支持负数索引的数组代理 ==========\\n');

function negativeIndexArray(arr) {
  return new Proxy(arr, {
    get(target, prop, receiver) {
      const index = Number(prop);
      if (!isNaN(index) && index < 0) {
        return Reflect.get(target, target.length + index, receiver);
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}

const arr = negativeIndexArray([10, 20, 30, 40, 50]);
console.log('arr[0]:', arr[0]);
console.log('arr[-1]:', arr[-1], '(最后一个元素)');
console.log('arr[-2]:', arr[-2], '(倒数第二个)');
console.log('arr[-5]:', arr[-5]);
console.log('');

// ---------- 7. 只读代理 ----------

console.log('========== 7. 只读代理 ==========\\n');

function readonly(obj) {
  return new Proxy(obj, {
    set() {
      console.log('[只读代理] 禁止修改属性');
      return false;
    },
    deleteProperty() {
      console.log('[只读代理] 禁止删除属性');
      return false;
    },
    defineProperty() {
      console.log('[只读代理] 禁止定义属性');
      return false;
    },
    setPrototypeOf() {
      console.log('[只读代理] 禁止修改原型');
      return false;
    }
  });
}

const readonlyData = readonly({ x: 1, y: 2 });
console.log('readonlyData.x:', readonlyData.x);
readonlyData.x = 100;
delete readonlyData.y;
console.log('');

setTimeout(() => {}, 200);
`,
  },
  {
    id: "n3-adapter",
    title: "适配器模式（Adapter）",
    icon: "🔌",
    group: "第三部分 结构型与行为型模式",
content: `# 适配器模式（Adapter）

## 一、模式定义

适配器模式（Adapter Pattern）是一种结构型设计模式，它将一个类的接口转换成客户希望的另一个接口，使得原本由于接口不兼容而不能一起工作的类可以协同工作。适配器模式的别名是**包装器（Wrapper）**。

适配器模式在生活中随处可见：电源适配器将220V交流电转换为手机需要的5V直流电，Type-C转接头让USB接口的设备能插在Type-C口上，翻译官将一种语言翻译成另一种语言让交流双方互相理解。这些都是适配器的典型例子——**接口不匹配，加个中间层来转换**。

## 二、适配器模式的结构

适配器模式包含以下角色：

1. **Target（目标接口）**：客户期望的接口，客户代码只依赖这个接口。
2. **Adaptee（被适配者）**：需要被适配的旧接口，它的接口与 Target 不兼容。
3. **Adapter（适配器）**：实现 Target 接口，内部持有 Adaptee 引用，将 Target 调用转换为 Adaptee 调用。

## 三、类适配器 vs 对象适配器

适配器有两种实现方式：

### 3.1 对象适配器（推荐）

适配器持有被适配者的实例（组合），实现目标接口，将请求转发给被适配者。这是 JavaScript 中最常用的方式，因为 JavaScript 基于原型链，组合比继承更灵活。

### 3.2 类适配器

适配器继承被适配者的类，同时实现目标接口。由于 JavaScript 是单继承（原型链只有一条），类适配器的使用场景有限。但在多继承语言中（如C++），类适配器也是一种选择。

在 JavaScript 中，几乎总是使用对象适配器——通过组合持有被适配对象。

## 四、适配器模式的应用场景

1. **新旧接口兼容**：系统升级后旧接口需要保留，但内部已改用新接口，通过适配器让旧代码继续工作。
2. **多格式数据转换**：后端返回 XML/CSV 等格式，前端需要 JSON，通过适配器做格式转换。
3. **第三方库集成**：使用第三方库时，它的接口与我们的项目接口不匹配，用适配器做一层封装。
4. **遗留系统改造**：不修改遗留代码，通过适配器让遗留系统与新系统对接。
5. **多数据源统一**：不同数据源（MySQL、MongoDB、REST API）返回格式不同，通过适配器统一接口。
6. **跨平台兼容**：不同平台 API 不同，通过适配器提供统一的跨平台接口。

## 五、适配器模式与其他模式的区别

### 5.1 适配器 vs 装饰器

- **适配器**：改变接口，让不兼容的接口变得兼容。重点在**接口转换**。
- **装饰器**：不改变接口，只是增强功能。重点在**功能增强**。
- 适配器是"接口不对，我帮你转"，装饰器是"接口没问题，我帮你加点东西"。

### 5.2 适配器 vs 代理

- **适配器**：改变接口适配目标。
- **代理**：不改变接口，控制访问。
- 适配器是"换个接口"，代理是"接口不变，我在中间控制"。

### 5.3 适配器 vs 外观模式

- **适配器**：包装一个对象，改变它的接口。
- **外观模式**：包装多个对象，简化接口。
- 适配器是事后补救（已有接口不匹配），外观是事前设计（提供简化接口）。

## 六、适配器模式的优缺点

### 优点
- 让不兼容的类可以一起工作，提高代码复用性
- 符合开闭原则，不需要修改原有代码
- 解耦了客户代码与被适配者，客户只依赖目标接口
- 可以透明地替换底层实现

### 缺点
- 过多的适配器会增加系统复杂度
- 适配器层多了一次间接调用，有微小性能开销
- 有时直接重写原有代码可能比写适配器更清晰（需要权衡）

## 七、JavaScript 中的适配器特点

JavaScript 的动态类型特性让适配器模式实现起来特别简单。因为 JavaScript 没有严格的接口检查，我们不需要像 Java 那样先定义接口再实现——鸭子类型（Duck Typing）天然适合适配器模式：只要对象有期望的方法，就能正常工作。

在 JavaScript 中，适配器模式甚至不一定需要类。一个简单的转换函数、一个包装对象都可以是适配器。

## 八、总结

适配器模式是一种"补救"模式，它通常在代码已经写好、接口已经确定但需要对接时才使用。虽然它不像其他模式那样在设计阶段就考虑，但在实际开发中非常实用——我们几乎总会遇到接口不兼容的情况。记住：**当两个东西不能直接配合工作时，加一层适配器总是可行的方案**。在 JavaScript 中，由于语言的灵活性，适配器模式实现起来格外优雅和简洁。`,
    code: `// ==================== 适配器模式完整演示 ====================

// ---------- 1. 旧API到新API的适配器（日志系统升级） ----------

console.log('========== 1. 旧日志API适配新日志API ==========\\n');

// 旧版日志API（被适配者 Adaptee）
const OldLogger = {
  log(message) {
    console.log(\`[OLD-LOG] \${message}\`);
  },
  error(message) {
    console.error(\`[OLD-ERROR] \${message}\`);
  }
};

// 新版日志接口（目标 Target）
// 期望的方法：info, warn, error, debug

// 适配器（Adapter）
class LoggerAdapter {
  constructor(oldLogger) {
    this.oldLogger = oldLogger;
  }
  
  info(message) {
    this.oldLogger.log(\`[INFO] \${message}\`);
  }
  
  warn(message) {
    this.oldLogger.log(\`[WARN] \${message}\`);
  }
  
  error(message) {
    this.oldLogger.error(message);
  }
  
  debug(message) {
    console.log(\`[DEBUG] \${message}\`);
  }
}

const newLogger = new LoggerAdapter(OldLogger);
newLogger.info('系统启动成功');
newLogger.warn('内存使用率超过80%');
newLogger.error('数据库连接失败');
newLogger.debug('变量值: x=42');
console.log('');

// ---------- 2. 数据格式适配器（XML转JSON） ----------

console.log('========== 2. 数据格式适配器（XML → JSON） ==========\\n');

// 模拟旧系统返回XML数据
const OldXMLAPI = {
  getUserData() {
    return \`
      <user>
        <id>1001</id>
        <name>张三</name>
        <email>zhangsan@example.com</email>
        <roles>
          <role>admin</role>
          <role>editor</role>
        </roles>
        <profile>
          <age>28</age>
          <city>北京</city>
        </profile>
      </user>
    \`;
  },
  getOrderData() {
    return \`
      <order>
        <orderId>ORD20240001</orderId>
        <amount>299.00</amount>
        <status>paid</status>
        <items>
          <item>
            <name>JavaScript高级程序设计</name>
            <price>89.00</price>
            <qty>1</qty>
          </item>
          <item>
            <name>Node.js实战</name>
            <price>105.00</price>
            <qty>2</qty>
          </item>
        </items>
      </order>
    \`;
  }
};

// 简单XML解析适配器
function xmlToJson(xml) {
  const result = {};
  
  function parseTag(tagContent) {
    const tagMatch = tagContent.trim().match(/^<(\\w+)>([\\s\\S]*?)<\\/\\1>$/);
    if (!tagMatch) {
      const items = [];
      const itemRegex = /<(\\w+)>([\\s\\S]*?)<\\/\\1>/g;
      let m;
      const children = {};
      let hasChildren = false;
      while ((m = itemRegex.exec(tagContent)) !== null) {
        hasChildren = true;
        const [, tag, content] = m;
        const parsed = parseTag(\`<\${tag}>\${content}</\${tag}>\`);
        if (children[tag]) {
          if (!Array.isArray(children[tag])) {
            children[tag] = [children[tag]];
          }
          children[tag].push(parsed[tag]);
        } else {
          children[tag] = parsed[tag];
        }
      }
      if (!hasChildren) return tagContent.trim();
      return children;
    }
    const [, tag, content] = tagMatch;
    const parsed = {};
    const itemRegex = /<(\\w+)>([\\s\\S]*?)<\\/\\1>/g;
    let m;
    const childTags = [];
    while ((m = itemRegex.exec(content)) !== null) {
      childTags.push({ tag: m[1], content: m[2] });
    }
    if (childTags.length === 0) {
      parsed[tag] = content.trim();
      return parsed;
    }
    const obj = {};
    childTags.forEach(({ tag: ct, content: cc }) => {
      const childParsed = parseTag(\`<\${ct}>\${cc}</\${ct}>\`);
      if (obj[ct]) {
        if (!Array.isArray(obj[ct])) obj[ct] = [obj[ct]];
        obj[ct].push(childParsed[ct]);
      } else {
        obj[ct] = childParsed[ct];
      }
    });
    parsed[tag] = obj;
    return parsed;
  }
  
  return parseTag(xml);
}

// 数据适配器
const JsonDataAdapter = {
  getUser() {
    const xml = OldXMLAPI.getUserData();
    const json = xmlToJson(xml);
    return json.user;
  },
  getOrder() {
    const xml = OldXMLAPI.getOrderData();
    const json = xmlToJson(xml);
    return json.order;
  }
};

const user = JsonDataAdapter.getUser();
console.log('用户数据(JSON格式):');
console.log(JSON.stringify(user, null, 2));
console.log('');

const order = JsonDataAdapter.getOrder();
console.log('订单数据(JSON格式):');
console.log(JSON.stringify(order, null, 2));
console.log('');

// ---------- 3. jQuery风格API适配原生DOM API ----------

console.log('========== 3. jQuery风格API适配原生DOM（模拟） ==========\\n');

// 模拟jQuery风格的$函数适配器
function $(selector) {
  const elements = document 
    ? document.querySelectorAll(selector)
    : [{ textContent: '模拟元素1' }, { textContent: '模拟元素2' }];
  
  return {
    elements: Array.from(elements),
    
    html(content) {
      if (content === undefined) {
        return this.elements[0]?.innerHTML || '';
      }
      this.elements.forEach(el => { if (el.innerHTML !== undefined) el.innerHTML = content; });
      return this;
    },
    
    text(content) {
      if (content === undefined) {
        return this.elements.map(el => el.textContent).join('');
      }
      this.elements.forEach(el => { el.textContent = content; });
      return this;
    },
    
    css(prop, value) {
      if (typeof prop === 'object') {
        this.elements.forEach(el => {
          if (el.style) Object.assign(el.style, prop);
        });
      } else if (value === undefined) {
        return this.elements[0]?.style?.[prop];
      } else {
        this.elements.forEach(el => {
          if (el.style) el.style[prop] = value;
        });
      }
      return this;
    },
    
    on(event, handler) {
      this.elements.forEach(el => {
        if (el.addEventListener) el.addEventListener(event, handler);
      });
      return this;
    },
    
    addClass(cls) {
      this.elements.forEach(el => {
        if (el.classList) el.classList.add(cls);
      });
      return this;
    },
    
    each(callback) {
      this.elements.forEach((el, i) => callback.call(el, i, el));
      return this;
    }
  };
}

// 演示：在Node环境中模拟
const mock$ = (items) => ({
  elements: items,
  text(content) {
    if (content !== undefined) {
      this.elements.forEach(el => el.textContent = content);
      return this;
    }
    return this.elements.map(el => el.textContent).join(', ');
  },
  addClass(cls) {
    this.elements.forEach(el => el.className = (el.className || '') + ' ' + cls);
    return this;
  },
  each(fn) { this.elements.forEach(fn); return this; }
});

const mockItems = [{ textContent: 'A' }, { textContent: 'B' }];
const $items = mock$(mockItems);
console.log('初始文本:', $items.text());
$items.addClass('highlight');
$items.text('更新后');
console.log('添加class并设置文本后:', $items.elements.map(e => ({ text: e.textContent, cls: e.className })));
console.log('');

// ---------- 4. 支付网关适配器（多支付渠道统一接口） ----------

console.log('========== 4. 支付网关适配器（多渠道统一接口） ==========\\n');

// 不同支付渠道的不同API
const WeChatPay = {
  createPayment(orderId, amountInCents) {
    return { wxPayUrl: \`wxp://pay?order=\${orderId}&fen=\${amountInCents}\`, orderId };
  },
  queryStatus(wxOrderId) {
    return { status: 'success', wxOrderId, paidAt: new Date().toISOString() };
  }
};

const AlipaySDK = {
  initiateTrade({ outTradeNo, totalAmount, subject }) {
    return { alipayUrl: \`alipays://pay?trade=\${outTradeNo}&amount=\${totalAmount}\`, tradeNo: outTradeNo };
  },
  checkTrade(tradeNo) {
    return { tradeStatus: 'TRADE_SUCCESS', tradeNo, gmtPayment: new Date().toISOString() };
  }
};

const BankAPI = {
  transfer(from, to, amountYuan) {
    return { bankTxId: \`BANK\${Date.now()}\`, from, to, amount: amountYuan, status: 'processing' };
  },
  getTransferStatus(txId) {
    return { txId, status: 'completed' };
  }
};

// 统一支付接口适配器
class PaymentAdapter {
  constructor(paymentType) {
    this.paymentType = paymentType;
    switch (paymentType) {
      case 'wechat': this.sdk = WeChatPay; break;
      case 'alipay': this.sdk = AlipaySDK; break;
      case 'bank': this.sdk = BankAPI; break;
      default: throw new Error('不支持的支付方式: ' + paymentType);
    }
  }
  
  pay(orderId, amount, subject = '订单支付') {
    switch (this.paymentType) {
      case 'wechat': {
        const result = this.sdk.createPayment(orderId, Math.round(amount * 100));
        return { success: true, payUrl: result.wxPayUrl, orderId, provider: 'wechat' };
      }
      case 'alipay': {
        const result = this.sdk.initiateTrade({ outTradeNo: orderId, totalAmount: amount.toFixed(2), subject });
        return { success: true, payUrl: result.alipayUrl, orderId, provider: 'alipay' };
      }
      case 'bank': {
        const result = this.sdk.transfer('user-account', 'merchant-account', amount);
        return { success: true, txId: result.bankTxId, orderId, provider: 'bank' };
      }
    }
  }
  
  query(orderId) {
    switch (this.paymentType) {
      case 'wechat': {
        const r = this.sdk.queryStatus(orderId);
        return { status: r.status === 'success' ? 'paid' : 'pending', paidAt: r.paidAt, provider: 'wechat' };
      }
      case 'alipay': {
        const r = this.sdk.checkTrade(orderId);
        return { status: r.tradeStatus === 'TRADE_SUCCESS' ? 'paid' : 'pending', paidAt: r.gmtPayment, provider: 'alipay' };
      }
      case 'bank': {
        const r = this.sdk.getTransferStatus(orderId);
        return { status: r.status === 'completed' ? 'paid' : 'pending', provider: 'bank' };
      }
    }
  }
}

const wxPay = new PaymentAdapter('wechat');
const aliPay = new PaymentAdapter('alipay');
const bankPay = new PaymentAdapter('bank');

console.log('微信支付:', wxPay.pay('ORD001', 99.9));
console.log('支付宝支付:', aliPay.pay('ORD002', 199.0, '购买书籍'));
console.log('银行卡支付:', bankPay.pay('ORD003', 500));
console.log('');
console.log('微信查询:', wxPay.query('ORD001'));
console.log('支付宝查询:', aliPay.query('ORD002'));
console.log('');

// ---------- 5. 函数适配器（参数适配） ----------

console.log('========== 5. 函数参数适配器 ==========\\n');

// 旧函数：接收多个独立参数
function oldFetchMethod(url, method, headers, body, timeout) {
  return { url, method, headers, body, timeout };
}

// 新代码期望：接收一个options对象
function newFetchAdapter(options) {
  const { url, method = 'GET', headers = {}, body = null, timeout = 5000 } = options;
  return oldFetchMethod(url, method, headers, body, timeout);
}

console.log('适配后调用:', newFetchAdapter({
  url: '/api/users',
  method: 'POST',
  body: JSON.stringify({ name: 'test' })
}));
console.log('');

console.log('========== 适配器模式演示完成 ==========');
`,
  },
  {
    id: "n3-observer-pubsub",
    title: "观察者模式（Observer）与发布订阅模式（Pub/Sub）",
    icon: "👁️",
    group: "第三部分 结构型与行为型模式",
content: `# 观察者模式（Observer）与发布订阅模式（Pub/Sub）

## 一、观察者模式定义

观察者模式（Observer Pattern）是一种行为型设计模式，它定义了对象之间的一对多依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都会收到通知并自动更新。

观察者模式也叫**发布-订阅模式**的一种，但在软件工程中，我们通常会区分经典观察者模式和广义的发布订阅模式。观察者模式中发生状态变化的对象称为**主题（Subject）**或**被观察者（Observable）**，收到通知的对象称为**观察者（Observer）**。

生活中的观察者模式例子：订阅报纸（报社是Subject，订户是Observer，新报纸出版时所有订户收到报纸）、微信群消息（群是Subject，群成员是Observer，有人发消息时所有人收到）、Vue/React 的数据驱动视图（数据是Subject，视图是Observer，数据变化时视图自动更新）。

## 二、观察者模式的结构

经典观察者模式包含以下角色：

1. **Subject（主题/被观察者）**：
   - 持有观察者列表
   - 提供 \`attach(observer)\` 添加观察者
   - 提供 \`detach(observer)\` 移除观察者
   - 提供 \`notify()\` 通知所有观察者
   
2. **Observer（观察者）**：
   - 定义一个更新接口 \`update(data)\`
   - 收到通知时执行自己的更新逻辑

3. **ConcreteSubject（具体主题）**：存储状态，状态变化时调用 notify。
4. **ConcreteObserver（具体观察者）**：实现 update 方法，维护与主题状态一致的引用。

观察者模式的核心是：**Subject 直接持有 Observer 的引用，通知是直接从 Subject 发出到 Observer 的**。

## 三、JavaScript 中的观察者模式

JavaScript 中观察者模式非常常见：

1. **DOM 事件监听**：\`element.addEventListener('click', handler)\` 就是观察者模式。DOM元素是Subject，事件处理函数是Observer，用户点击时notify所有handler。
2. **Node.js EventEmitter**：\`emitter.on('event', handler)\` 是事件机制的典型实现。
3. **Vue 的响应式系统**：数据是Subject，watcher是Observer，数据变化时watcher收到通知更新视图。
4. **Promise 的 then/catch**：Promise 是Subject，then回调是Observer，Promise状态改变时通知回调。
5. **RxJS Observable**：这是观察者模式的极致封装，提供了丰富的操作符来处理异步数据流。

## 四、发布订阅模式（Pub/Sub）

发布订阅模式（Publish-Subscribe Pattern）是观察者模式的一种变体，它引入了一个**事件通道（Event Channel）**或**消息调度中心（Message Broker）**作为中间层。

在发布订阅模式中：
- **发布者（Publisher）**：不直接发送消息给订阅者，而是通过事件通道发布消息。
- **订阅者（Subscriber）**：向事件通道订阅自己感兴趣的事件类型。
- **事件通道（Event Channel/Message Broker）**：维护事件类型到订阅者的映射，接收发布者的消息并转发给对应的订阅者。

### 关键区别

| 维度 | 观察者模式 | 发布订阅模式 |
|------|-----------|-------------|
| 通信方式 | Subject 直接通知 Observer | 通过事件通道间接通信 |
| 耦合度 | Subject 和 Observer 存在耦合 | 发布者和订阅者完全解耦 |
| 是否知道对方 | Subject 知道所有 Observer | 发布者不知道订阅者是谁，反之亦然 |
| 通信粒度 | 整个主题变化 | 基于事件类型/主题名的细粒度通信 |
| 典型实现 | addEventListener | EventEmitter、消息队列 |

### 为什么 Node.js 的 EventEmitter 更接近发布订阅？

Node.js 的 EventEmitter 虽然常被当作观察者模式的例子，但它更接近发布订阅模式，原因是：
1. 它基于事件名称（字符串）来分发消息，而不是直接调用观察者方法。
2. 发布者（emit）和订阅者（on）之间通过事件名解耦，发布者不需要知道谁在监听。
3. 可以有多个不同类型的事件，每个事件有自己的订阅者列表。

但 EventEmitter 是在同一个进程内的轻量级实现，没有独立的消息 Broker，所以是"轻量级"的发布订阅。

## 五、两种模式的优缺点对比

### 观察者模式的优缺点
- **优点**：实现简单，直接通信，性能开销小；主题和观察者之间关系清晰。
- **缺点**：Subject 和 Observer 之间存在耦合；观察者只能观察整个主题，无法细粒度选择关注什么。

### 发布订阅模式的优缺点
- **优点**：发布者和订阅者完全解耦，互不感知；支持细粒度的事件订阅；可以跨进程/跨网络通信（引入消息队列）。
- **缺点**：引入了中间层，增加了复杂度；消息流转不直观，调试困难；消息的顺序和可靠性需要额外保证。

## 六、实际应用场景

1. **DOM 事件系统**：\`addEventListener\` 是最经典的观察者模式。
2. **Node.js EventEmitter**：几乎所有 Node.js 核心模块都继承自 EventEmitter（Stream、Server、Process等）。
3. **Vue/React 状态管理**：Vue 的 watch、React 的 useState + useEffect 都是观察者模式思想。
4. **消息队列**：RabbitMQ、Kafka、Redis Pub/Sub 是跨进程的发布订阅模式。
5. **Websocket 消息推送**：服务端推送消息给客户端。
6. **状态管理库**：Redux 的 subscribe、Vuex 的 watch 本质都是观察者模式。
7. **自定义事件总线**：前端应用中常实现 EventBus 来实现跨组件通信。

## 七、总结

观察者模式和发布订阅模式是 JavaScript 异步编程和事件驱动编程的基础。理解它们的区别和联系，能帮助我们更好地理解浏览器事件模型、Node.js EventEmitter、响应式框架的底层原理。在实际开发中，我们常常使用发布订阅模式的变体——基于事件名的 EventBus 来实现模块间的松耦合通信。两者的核心思想都是"**状态变化时自动通知依赖方**"，这是构建可扩展、松耦合系统的重要基石。`,
    code: `// ==================== 观察者模式与发布订阅模式完整演示 ====================

// ---------- 1. 经典观察者模式 ----------

console.log('========== 1. 经典观察者模式 ==========\\n');

// 观察者接口
class Observer {
  update(data) {
    throw new Error('子类必须实现update方法');
  }
}

// 具体观察者：日志观察者
class LoggerObserver extends Observer {
  constructor(name) {
    super();
    this.name = name;
  }
  update(data) {
    console.log(\`[Logger-\${this.name}] 收到通知: \${JSON.stringify(data)}\`);
  }
}

// 具体观察者：邮件通知观察者
class EmailObserver extends Observer {
  update(data) {
    if (data.type === 'urgent') {
      console.log(\`[Email] 发送紧急邮件通知: \${data.message}\`);
    }
  }
}

// 具体观察者：UI更新观察者
class UIObserver extends Observer {
  update(data) {
    console.log(\`[UI] 更新界面显示: \${data.message}\`);
  }
}

// 主题（Subject）
class Subject {
  constructor() {
    this.observers = [];
    this.state = null;
  }
  
  attach(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }
  
  detach(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }
  
  notify() {
    for (const observer of this.observers) {
      observer.update(this.state);
    }
  }
  
  setState(newState) {
    this.state = newState;
    this.notify();
  }
}

// 具体主题：天气站
class WeatherStation extends Subject {
  constructor() {
    super();
    this.temperature = 0;
    this.humidity = 0;
  }
  
  setMeasurements(temp, humidity) {
    this.temperature = temp;
    this.humidity = humidity;
    this.setState({
      type: 'weather',
      temperature: temp,
      humidity: humidity,
      message: \`温度\${temp}°C，湿度\${humidity}%\`
    });
  }
}

const weatherStation = new WeatherStation();
const display1 = new LoggerObserver('主显示屏');
const display2 = new EmailObserver();
const display3 = new UIObserver();

weatherStation.attach(display1);
weatherStation.attach(display2);
weatherStation.attach(display3);

weatherStation.setMeasurements(25.5, 60);
console.log('');
weatherStation.detach(display2);
weatherStation.setMeasurements(28.0, 55);
console.log('');

// ---------- 2. 发布订阅模式（EventChannel） ----------

console.log('========== 2. 发布订阅模式（EventChannel/EventBus） ==========\\n');

class EventChannel {
  constructor() {
    this.events = {};
    this.onceEvents = {};
  }
  
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    return () => this.unsubscribe(event, callback);
  }
  
  subscribeOnce(event, callback) {
    const wrapper = (...args) => {
      this.unsubscribe(event, wrapper);
      callback(...args);
    };
    return this.subscribe(event, wrapper);
  }
  
  unsubscribe(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
  }
  
  publish(event, ...args) {
    if (this.events[event]) {
      [...this.events[event]].forEach(callback => {
        try {
          callback(...args);
        } catch (err) {
          console.error(\`[EventBus] 事件 \${event} 的回调执行出错: \${err.message}\`);
        }
      });
    }
  }
  
  listenerCount(event) {
    return this.events[event]?.length || 0;
  }
  
  eventNames() {
    return Object.keys(this.events);
  }
}

const eventBus = new EventChannel();

// 模块A：订阅用户登录事件
const unsubscribeUserLogin = eventBus.subscribe('user:login', (user) => {
  console.log(\`[模块A-导航栏] 用户 \${user.name} 登录，更新导航栏显示\`);
});

eventBus.subscribe('user:login', (user) => {
  console.log(\`[模块B-购物车] 加载 \${user.name} 的购物车数据\`);
});

eventBus.subscribe('user:logout', () => {
  console.log('[模块A-导航栏] 用户退出，清空导航栏用户信息');
  console.log('[模块B-购物车] 清空购物车');
});

eventBus.subscribeOnce('app:ready', () => {
  console.log('[一次性监听] 应用初始化完成（只触发一次）');
});

// 模块C：发布事件
console.log('--- 发布 app:ready ---');
eventBus.publish('app:ready');
console.log('--- 再次发布 app:ready（一次性监听不再触发） ---');
eventBus.publish('app:ready');
console.log('');

console.log('--- 用户登录 ---');
eventBus.publish('user:login', { id: 1, name: '小明' });
console.log('');

console.log('--- 取消模块A的监听后，用户再次登录 ---');
unsubscribeUserLogin();
eventBus.publish('user:login', { id: 2, name: '小红' });
console.log('');

console.log('--- 用户退出 ---');
eventBus.publish('user:logout');
console.log('');

// ---------- 3. 对比观察者和发布订阅的耦合度 ----------

console.log('========== 3. 耦合度对比演示 ==========\\n');

// 观察者模式：Subject需要知道Observer
console.log('观察者模式: Subject直接持有Observer引用');
const subject = new Subject();
const obs = new LoggerObserver('测试');
subject.attach(obs);
console.log('Subject的observers列表:', subject.observers.length, '个观察者');
console.log('Subject和Observer是直接关联的');
console.log('');

// 发布订阅：Publisher和Subscriber互相不知道
console.log('发布订阅模式: Publisher和Subscriber完全解耦');
console.log('事件名列表:', eventBus.eventNames());
console.log('user:login 监听器数量:', eventBus.listenerCount('user:login'));
console.log('发布者只需要调用 eventBus.publish("event", data)');
console.log('订阅者只需要调用 eventBus.subscribe("event", handler)');
console.log('双方都通过事件总线通信，互不感知');
console.log('');

// ---------- 4. 带命名空间的事件总线（支持通配符） ----------

console.log('========== 4. 高级：支持通配符的事件总线 ==========\\n');

class WildcardEventChannel extends EventChannel {
  publish(event, ...args) {
    super.publish(event, ...args);
    const parts = event.split(':');
    for (let i = 1; i <= parts.length; i++) {
      const wildcard = parts.slice(0, i).join(':') + ':*';
      super.publish(wildcard, ...args);
    }
    super.publish('*', event, ...args);
  }
}

const wildBus = new WildcardEventChannel();
wildBus.subscribe('user:*', (event, ...args) => {
  console.log(\`[通配user:*] 收到事件: \${event}\`, ...args);
});
wildBus.subscribe('order:*', (event) => {
  console.log(\`[通配order:*] 收到事件: \${event}\`);
});
wildBus.subscribe('*', (event, ...args) => {
  console.log(\`[全局*] 所有事件都会收到: \${event}\`);
});

wildBus.publish('user:login', { id: 1 });
console.log('');
wildBus.publish('user:logout');
console.log('');
wildBus.publish('order:created', { orderId: '123' });

console.log('');
console.log('========== 观察者模式与发布订阅模式演示完成 ==========');
`,
  },
  {
    id: "n3-strategy",
    title: "策略模式（Strategy）",
    icon: "♟️",
    group: "第三部分 结构型与行为型模式",
content: `# 策略模式（Strategy）

## 一、模式定义

策略模式（Strategy Pattern）是一种行为型设计模式，它定义了一系列算法，把每个算法封装起来，使它们可以互相替换，且算法的变化不会影响使用算法的客户。策略模式让算法可以独立于使用它的客户端而变化。

策略模式的核心思想是：**将可变的部分抽象出来，封装成独立的策略类（或函数），通过组合而非继承的方式，在运行时选择具体的算法实现**。

## 二、策略模式是消除 if-else/switch 的利器

在日常开发中，我们经常遇到大量 if-else 或 switch 语句来处理不同情况的问题。例如：

\`\`\`javascript
function calculatePrice(type, price) {  // 声明函数 calculatePrice
  if (type === 'normal') return price;  // 条件判断
  else if (type === 'vip') return price * 0.8;  // 否则如果
  else if (type === 'svip') return price * 0.6;  // 否则如果
  else if (type === 'promotion') return price * 0.5;  // 否则如果
  // 每增加一种折扣，就要加一个else-if
}
\`\`\`

这样的代码问题很明显：
1. **违反开闭原则**：新增一种类型必须修改原函数。
2. **代码臃肿**：逻辑都堆在一个函数里，难以维护。
3. **无法复用**：每个分支逻辑不能独立复用和测试。
4. **容易出错**：修改一个分支可能影响其他分支。

策略模式将每个分支封装成独立的策略，上下文只负责委托给策略对象执行，完美消除这些问题。

## 三、策略模式的结构

策略模式包含三个角色：

1. **Strategy（策略接口）**：定义所有支持的算法的公共接口。在 JavaScript 中，由于鸭子类型，通常不需要显式接口，只要策略对象有相同的方法即可。
2. **ConcreteStrategy（具体策略）**：实现了具体的算法逻辑。
3. **Context（上下文）**：持有一个 Strategy 对象的引用，提供设置策略的方法，将请求委托给策略执行。

上下文不关心具体使用哪种策略，它只知道策略有一个统一的接口可以调用。客户端创建具体策略对象并传给上下文，运行时可以动态切换策略。

## 四、策略模式为什么符合开闭原则

开闭原则要求"对扩展开放，对修改关闭"。策略模式完美符合这个原则：
- 新增算法时，只需创建新的策略类/函数，不需要修改上下文代码。
- 修改某个算法时，只需修改对应的策略，不影响其他策略和上下文。
- 上下文的代码稳定不变，变化的部分被隔离在策略中。

## 五、JavaScript 中策略模式的特点

在 JavaScript 这种函数一等公民的语言中，策略模式实现起来非常自然：
- 策略不一定是类，函数本身就是最简单的策略。
- 策略对象可以是包含方法的普通对象。
- 可以使用 Map 来做策略映射，查找策略比 switch 更清晰。
- 高阶函数天然支持策略的组合和切换。

## 六、实际应用场景

1. **表单验证**：不同字段需要不同验证规则（非空、最小长度、邮箱、手机号等），每个规则是一个策略，可灵活组合。
2. **支付方式选择**：微信支付、支付宝、银行卡支付，每个支付方式是一个策略，费率计算和流程不同。
3. **排序算法选择**：根据数据规模选择快速排序、归并排序、插入排序等不同排序策略。
4. **折扣/促销计算**：不同会员等级、不同促销活动对应不同折扣策略。
5. **文件导出**：导出为 PDF、Excel、CSV 等不同格式，每个导出器是一个策略。
6. **数据压缩**：ZIP、GZIP、LZ4 等不同压缩算法策略。
7. **AI 模型选择**：不同场景选用不同的 AI 模型（快速响应vs高质量回答）。
8. **路由/导航策略**：步行、驾车、公交、骑行等不同路径规划策略。

## 七、策略模式的优缺点

### 优点
- 完美消除 if-else/switch 分支判断
- 符合开闭原则，新增策略无需修改上下文
- 每个策略职责单一，便于单元测试
- 运行时可以动态切换算法
- 策略可以复用，不同上下文可以共享同一个策略

### 缺点
- 客户端需要了解不同策略的区别，才能选择合适的策略
- 策略数量增多会增加类/对象数量
- 如果策略逻辑很简单（只有一两行），策略模式可能显得过度设计
- 策略之间如果有公共逻辑，需要在策略基类或上下文中处理

## 八、策略模式与其他模式的区别

- **策略 vs 状态模式**：结构相似，但意图不同。策略是客户端主动选择使用哪个策略；状态模式中状态的切换是由状态内部条件触发的，客户端不需要了解状态。
- **策略 vs 简单工厂**：工厂是创建型模式，负责创建对象；策略是行为型模式，负责封装算法。
- **策略 vs 模板方法**：模板方法使用继承来改变算法的部分步骤；策略使用组合来切换整个算法。

## 九、总结

策略模式是 JavaScript 开发中最实用的设计模式之一，是消除冗长 if-else/switch 的最佳方案。在函数式编程风格下，策略可以用简单的函数或对象映射来实现，非常轻量。掌握策略模式的关键在于：识别代码中变化的部分，将其封装为独立的策略，让上下文通过委托调用具体策略，从而实现代码的灵活性和可扩展性。`,
    code: `// ==================== 策略模式完整演示 ====================

// ---------- 1. 表单验证策略 ----------

console.log('========== 1. 表单验证策略 ==========\\n');

// 验证策略集合
const validationStrategies = {
  required(value, msg = '此项不能为空') {
    if (value === null || value === undefined || String(value).trim() === '') {
      return msg;
    }
  },
  minLength(value, length, msg) {
    msg = msg || \`最少输入\${length}个字符\`;
    if (String(value).length < length) {
      return msg;
    }
  },
  maxLength(value, length, msg) {
    msg = msg || \`最多输入\${length}个字符\`;
    if (String(value).length > length) {
      return msg;
    }
  },
  email(value, msg = '请输入有效的邮箱地址') {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return msg;
    }
  },
  phone(value, msg = '请输入有效的手机号') {
    const phoneRegex = /^1[3-9]\\d{9}$/;
    if (value && !phoneRegex.test(value)) {
      return msg;
    }
  },
  pattern(value, regex, msg = '格式不正确') {
    if (value && !regex.test(value)) {
      return msg;
    }
  },
  numeric(value, msg = '请输入数字') {
    if (value && isNaN(Number(value))) {
      return msg;
    }
  }
};

// 验证器上下文
class Validator {
  constructor() {
    this.rules = [];
  }
  
  add(field, value, rules) {
    rules.forEach(rule => {
      const [strategyName, ...params] = rule;
      this.rules.push({ field, value, strategyName, params });
    });
  }
  
  validate() {
    const errors = [];
    for (const rule of this.rules) {
      const strategy = validationStrategies[rule.strategyName];
      if (!strategy) {
        errors.push({ field: rule.field, message: \`未知的验证规则: \${rule.strategyName}\` });
        continue;
      }
      const result = strategy(rule.value, ...rule.params);
      if (result) {
        errors.push({ field: rule.field, message: result });
      }
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

const validator = new Validator();
validator.add('username', 'zhangsan', [
  ['required'],
  ['minLength', 3],
  ['maxLength', 20]
]);
validator.add('email', 'invalid-email', [
  ['required', '邮箱不能为空'],
  ['email']
]);
validator.add('phone', '12345', [
  ['required'],
  ['phone']
]);
validator.add('age', 'abc', [
  ['required'],
  ['numeric', '年龄必须是数字']
]);

const result = validator.validate();
console.log('验证结果:', result.valid ? '通过' : '失败');
result.errors.forEach(err => {
  console.log(\`  - \${err.field}: \${err.message}\`);
});
console.log('');

// ---------- 2. 支付策略 ----------

console.log('========== 2. 支付策略 ==========\\n');

// 支付策略
const PaymentStrategies = {
  wechat: {
    name: '微信支付',
    pay(orderId, amount) {
      const fee = amount * 0.006;
      console.log(\`[微信支付] 订单\${orderId}，金额¥\${amount}，手续费¥\${fee.toFixed(2)}，实际到账¥\${(amount - fee).toFixed(2)}\`);
      console.log('  → 唤起微信支付页面...');
      return { success: true, provider: 'wechat', fee, orderId };
    },
    refund(orderId, amount) {
      console.log(\`[微信支付] 订单\${orderId} 退款¥\${amount}\`);
      return { success: true };
    }
  },
  alipay: {
    name: '支付宝',
    pay(orderId, amount) {
      const fee = amount * 0.0055;
      console.log(\`[支付宝] 订单\${orderId}，金额¥\${amount}，手续费¥\${fee.toFixed(2)}，实际到账¥\${(amount - fee).toFixed(2)}\`);
      console.log('  → 跳转到支付宝页面...');
      return { success: true, provider: 'alipay', fee, orderId };
    },
    refund(orderId, amount) {
      console.log(\`[支付宝] 订单\${orderId} 退款¥\${amount}\`);
      return { success: true };
    }
  },
  bank: {
    name: '银行卡支付',
    pay(orderId, amount) {
      const fee = amount < 100 ? 2 : amount * 0.002;
      console.log(\`[银行卡] 订单\${orderId}，金额¥\${amount}，手续费¥\${fee.toFixed(2)}，实际到账¥\${(amount - fee).toFixed(2)}\`);
      console.log('  → 跳转到网银页面...');
      return { success: true, provider: 'bank', fee, orderId };
    },
    refund(orderId, amount) {
      console.log(\`[银行卡] 订单\${orderId} 退款¥\${amount}（3-5个工作日到账）\`);
      return { success: true };
    }
  },
  credit: {
    name: '信用卡支付',
    pay(orderId, amount) {
      const fee = amount * 0.01;
      console.log(\`[信用卡] 订单\${orderId}，金额¥\${amount}，手续费¥\${fee.toFixed(2)}\`);
      console.log('  → 输入信用卡信息...');
      return { success: true, provider: 'credit', fee, orderId };
    },
    refund(orderId, amount) {
      console.log(\`[信用卡] 订单\${orderId} 退款¥\${amount}（7-15个工作日到账）\`);
      return { success: true };
    }
  }
};

// 支付上下文
class PaymentContext {
  constructor(strategyName) {
    this.setStrategy(strategyName);
  }
  
  setStrategy(strategyName) {
    const strategy = PaymentStrategies[strategyName];
    if (!strategy) {
      throw new Error(\`不支持的支付方式: \${strategyName}\`);
    }
    this.strategy = strategy;
    this.strategyName = strategyName;
  }
  
  pay(orderId, amount) {
    console.log(\`使用[\${this.strategy.name}]支付\`);
    return this.strategy.pay(orderId, amount);
  }
  
  refund(orderId, amount) {
    return this.strategy.refund(orderId, amount);
  }
}

const payment = new PaymentContext('wechat');
payment.pay('ORD001', 100);
console.log('');

payment.setStrategy('alipay');
payment.pay('ORD002', 500);
console.log('');

payment.setStrategy('bank');
payment.pay('ORD003', 50);
console.log('');

// ---------- 3. 排序策略 ----------

console.log('========== 3. 排序策略 ==========\\n');

const SortStrategies = {
  bubble(arr) {
    const a = [...arr];
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a.length - i - 1; j++) {
        if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
      }
    }
    return a;
  },
  quick(arr) {
    if (arr.length <= 1) return [...arr];
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    return [...SortStrategies.quick(left), ...middle, ...SortStrategies.quick(right)];
  },
  insertion(arr) {
    const a = [...arr];
    for (let i = 1; i < a.length; i++) {
      let j = i;
      while (j > 0 && a[j - 1] > a[j]) {
        [a[j], a[j - 1]] = [a[j - 1], a[j]];
        j--;
      }
    }
    return a;
  },
  native(arr) {
    return [...arr].sort((a, b) => a - b);
  }
};

class Sorter {
  constructor(strategy = 'native') {
    this.setStrategy(strategy);
  }
  setStrategy(strategy) {
    this.strategy = SortStrategies[strategy];
    this.strategyName = strategy;
  }
  sort(arr) {
    console.log(\`使用[\${this.strategyName}]排序\`);
    return this.strategy(arr);
  }
}

const testArr = [64, 34, 25, 12, 22, 11, 90, 45, 33, 78];
const sorter = new Sorter();

console.log('原始数组:', testArr);
sorter.setStrategy('bubble');
console.log('冒泡排序:', sorter.sort(testArr));
sorter.setStrategy('quick');
console.log('快速排序:', sorter.sort(testArr));
sorter.setStrategy('insertion');
console.log('插入排序:', sorter.sort(testArr));
console.log('');

// ---------- 4. 折扣计算策略（经典例子） ----------

console.log('========== 4. 折扣计算策略 ==========\\n');

const DiscountStrategies = {
  normal(price) {
    return price;
  },
  vip(price) {
    return price * 0.9;
  },
  svip(price) {
    return price * 0.8;
  },
  promotion(price) {
    return Math.max(0, price - Math.floor(price / 100) * 20);
  },
  newcomer(price) {
    return price > 50 ? price - 20 : price * 0.5;
  }
};

class PriceCalculator {
  constructor(discountType = 'normal') {
    this.setDiscount(discountType);
  }
  setDiscount(discountType) {
    this.discount = DiscountStrategies[discountType];
    this.discountName = discountType;
  }
  calculate(originalPrice) {
    const finalPrice = this.discount(originalPrice);
    console.log(\`原价¥\${originalPrice}，[\${this.discountName}]折扣后: ¥\${finalPrice.toFixed(2)}\`);
    return finalPrice;
  }
}

const calc = new PriceCalculator();
calc.calculate(299);
calc.setDiscount('vip');
calc.calculate(299);
calc.setDiscount('svip');
calc.calculate(299);
calc.setDiscount('promotion');
calc.calculate(299);
calc.setDiscount('newcomer');
calc.calculate(80);
calc.calculate(30);

console.log('');
console.log('========== 策略模式演示完成 ==========');
`,
  },
  {
    id: "n3-chain",
    title: "责任链模式（Chain of Responsibility）",
    icon: "⛓️",
    group: "第三部分 结构型与行为型模式",
content: `# 责任链模式（Chain of Responsibility）

## 一、模式定义

责任链模式（Chain of Responsibility Pattern）是一种行为型设计模式，它将请求的发送者和接收者解耦，使多个对象都有机会处理这个请求。将这些对象连成一条链，并沿着这条链传递请求，直到有对象能够处理它为止。

生活中的责任链例子：请假审批流程（组长→经理→总监→CEO），客服分级处理（一线客服→二线技术→专家团队），快递分拣（区域中心→城市站点→配送员），异常处理（try-catch多层捕获）。在这些场景中，请求沿着一条链传递，每个处理者决定自己是否处理，或者传递给下一个处理者。

## 二、责任链模式的结构

责任链模式包含以下角色：

1. **Handler（处理者）**：定义处理请求的接口，通常包含一个指向下一个处理者的引用。实现后继链（setNext）。
2. **ConcreteHandler（具体处理者）**：处理自己负责的请求，如果能处理就处理，不能处理就将请求转发给下一个处理者。
3. **Client（客户端）**：向链上的第一个处理者提交请求。

请求在链上传递，每个处理者面对请求有两个选择：
- 自己处理这个请求
- 将请求传递给下一个处理者

## 三、纯责任链 vs 不纯责任链

### 纯责任链
- 每个请求必须被某个处理者处理，不能出现没人处理的情况。
- 处理者要么处理请求，要么传递给下一个，不能处理了又继续传递。
- 现实中比较少见。

### 不纯责任链（更常见）
- 请求可以被某个处理者部分处理，然后继续传递给下一个处理者。
- 请求可以最终不被任何处理者处理（需要有默认处理或兜底）。
- 处理者可以在传递前后都执行操作（类似中间件洋葱模型）。
- 现实中绝大多数责任链都是不纯的。

## 四、责任链模式的实际应用场景

1. **中间件/洋葱模型**：Express/Koa 的中间件机制是责任链的经典应用。请求经过日志中间件→认证中间件→权限中间件→业务处理→响应，每个中间件可以决定是否继续传递。
2. **DOM 事件冒泡**：事件从最具体的元素开始，逐级向上冒泡到 document，每个节点都可以处理事件或继续冒泡。
3. **异常处理链**：try-catch 的多层嵌套、Java 的异常捕获机制，异常沿着调用栈向上传递直到被捕获。
4. **审批流程**：请假、报销等审批流，根据金额/天数由不同级别领导审批。
5. **表单验证链**：多个验证规则按顺序执行，任一验证失败则终止。
6. **日志处理链**：日志依次经过不同处理器（格式化→过滤→输出到文件→输出到控制台→上报到服务器）。
7. **HTTP 请求处理**：服务器端的请求经过一系列过滤器/拦截器。
8. **数据处理管道**：数据经过清洗→转换→校验→存储多个步骤。

## 五、责任链与策略模式的区别

责任链和策略模式都涉及多个处理逻辑，但它们的核心区别在于：

| 维度 | 策略模式 | 责任链模式 |
|------|---------|-----------|
| 处理者选择 | 客户端知道要用哪个策略，主动选择 | 客户端不知道谁会处理，请求沿链传递 |
| 处理者数量 | 只有一个策略处理请求 | 可能有多个处理者参与（不纯责任链） |
| 处理顺序 | 无关，只选一个 | 有严格的链式顺序 |
| 灵活性 | 策略之间互相独立 | 处理者可以决定是否继续传递 |

简单来说：策略模式是"我知道用哪个算法"，责任链模式是"我不管谁处理，沿链传下去就行"。

## 六、JavaScript 中责任链的实现方式

在 JavaScript 中，责任链可以通过多种方式实现：

1. **链表式**：每个处理者持有下一个处理者的引用，类似链表结构。
2. **数组式**：用数组存储所有处理者，按顺序遍历执行，更灵活。
3. **洋葱模型式**：类似 Koa 中间件，通过 next() 函数控制流程，可以在下游返回后继续执行（前后都有逻辑）。
4. **Promise 链式**：利用 Promise.then() 天然的链式调用。

洋葱模型是最强大的实现方式——每个处理者不仅能在请求传递前做事情（前置处理），还能在下游处理完返回后做事情（后置处理），就像洋葱一样一层层包裹。

## 七、责任链模式的优缺点

### 优点
- 请求发送者和接收者解耦，发送者不需要知道谁会处理
- 可以动态添加/删除/重排处理者，灵活调整链的结构
- 符合开闭原则，新增处理者无需修改现有代码
- 每个处理者职责单一，只关注自己能处理的范围
- 可以组合出复杂的处理流程

### 缺点
- 请求可能到达链末端也没被处理，需要考虑兜底逻辑
- 链过长会影响性能（每个节点都有调用开销）
- 调试困难，请求流转不直观
- 如果建链不当，可能出现循环引用或死链

## 八、总结

责任链模式在 Node.js 开发中极其常见——Express/Koa 中间件就是最典型的应用。理解责任链模式，特别是洋葱模型的执行机制，是掌握 Node.js Web 框架的关键。责任链的核心思想是"**让多个对象都有机会处理请求，将处理者连成链传递请求**"，这种松耦合的设计让我们可以灵活地组织和扩展处理流程。`,
    code: `// ==================== 责任链模式完整演示 ====================

// ---------- 1. 审批流责任链（经典例子） ----------

console.log('========== 1. 审批流责任链 ==========\\n');

class Approver {
  constructor(name, approvalLimit) {
    this.name = name;
    this.approvalLimit = approvalLimit;
    this.nextApprover = null;
  }
  
  setNext(next) {
    this.nextApprover = next;
    return next;
  }
  
  approve(request) {
    if (request.amount <= this.approvalLimit) {
      console.log(\`✅ [\${this.name}] 审批通过: \${request.purpose}，金额¥\${request.amount}\`);
      return true;
    }
    
    console.log(\`➡️  [\${this.name}] 金额超出权限(¥\${this.approvalLimit})，转交给上级...\`);
    
    if (this.nextApprover) {
      return this.nextApprover.approve(request);
    }
    
    console.log(\`❌ 无人能审批此请求: \${request.purpose}，金额¥\${request.amount}\`);
    return false;
  }
}

const teamLead = new Approver('组长', 1000);
const manager = new Approver('经理', 5000);
const director = new Approver('总监', 20000);
const ceo = new Approver('CEO', Infinity);

teamLead.setNext(manager).setNext(director).setNext(ceo);

const requests = [
  { amount: 500, purpose: '购买办公用品' },
  { amount: 3000, purpose: '团建活动费用' },
  { amount: 15000, purpose: '项目采购设备' },
  { amount: 100000, purpose: '新项目投资' }
];

requests.forEach(req => {
  console.log(\`--- 提交审批: \${req.purpose} ¥\${req.amount} ---\`);
  teamLead.approve(req);
  console.log('');
});

// ---------- 2. 数组式请求处理链（Web中间件风格） ----------

console.log('========== 2. Web请求处理链 ==========\\n');

class RequestHandler {
  constructor() {
    this.middlewares = [];
  }
  
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }
  
  async handle(request) {
    const ctx = {
      request,
      response: { status: 200, body: null, headers: {} },
      state: {}
    };
    
    let index = 0;
    
    const next = async () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        await middleware(ctx, next);
      }
    };
    
    await next();
    return ctx.response;
  }
}

const app = new RequestHandler();

// 日志中间件
app.use(async (ctx, next) => {
  const start = Date.now();
  console.log(\`[日志] \${ctx.request.method} \${ctx.request.url}\`);
  await next();
  const ms = Date.now() - start;
  console.log(\`[日志] 响应状态: \${ctx.response.status}，耗时: \${ms}ms\`);
});

// 认证中间件
app.use(async (ctx, next) => {
  const token = ctx.request.headers?.authorization;
  if (ctx.request.url !== '/login' && !token) {
    ctx.response.status = 401;
    ctx.response.body = { error: '未授权，请先登录' };
    console.log('[认证] 无token，返回401');
    return;
  }
  if (token) {
    ctx.state.user = { id: 1, name: '测试用户', role: 'user' };
    console.log(\`[认证] 用户已认证: \${ctx.state.user.name}\`);
  }
  await next();
});

// 权限中间件
app.use(async (ctx, next) => {
  if (ctx.request.url.startsWith('/admin')) {
    if (ctx.state.user?.role !== 'admin') {
      ctx.response.status = 403;
      ctx.response.body = { error: '无权限访问管理页面' };
      console.log('[权限] 非管理员，返回403');
      return;
    }
  }
  await next();
});

// 业务处理中间件
app.use(async (ctx, next) => {
  console.log('[业务] 处理业务逻辑...');
  if (ctx.request.url === '/login') {
    ctx.response.body = { message: '登录成功', token: 'jwt-token-xxx' };
  } else if (ctx.request.url === '/api/user') {
    ctx.response.body = { user: ctx.state.user };
  } else if (ctx.request.url === '/admin/dashboard') {
    ctx.response.body = { data: '管理面板数据' };
  } else {
    ctx.response.status = 404;
    ctx.response.body = { error: '页面不存在' };
  }
  await next();
});

// 响应格式化中间件
app.use(async (ctx) => {
  if (ctx.response.body && typeof ctx.response.body === 'object') {
    ctx.response.headers['Content-Type'] = 'application/json';
    console.log('[响应] 格式化JSON响应');
  }
});

async function testRequests() {
  const testReqs = [
    { method: 'POST', url: '/login', headers: {} },
    { method: 'GET', url: '/api/user', headers: {} },
    { method: 'GET', url: '/api/user', headers: { authorization: 'Bearer token123' } },
    { method: 'GET', url: '/admin/dashboard', headers: { authorization: 'Bearer token123' } }
  ];
  
  for (const req of testReqs) {
    console.log(\`\\n===== 请求: \${req.method} \${req.url} =====\`);
    const res = await app.handle(req);
    console.log('响应:', JSON.stringify(res));
  }
}

// ---------- 3. 表单验证责任链 ----------

console.log('\\n========== 3. 表单验证责任链 ==========\\n');

function createValidatorChain(...validators) {
  return function validate(data) {
    const errors = [];
    for (const validator of validators) {
      const result = validator(data);
      if (result) {
        if (Array.isArray(result)) {
          errors.push(...result);
        } else {
          errors.push(result);
        }
      }
    }
    return {
      valid: errors.length === 0,
      errors
    };
  };
}

const requiredFields = (data) => {
  const errs = [];
  if (!data.username) errs.push('用户名不能为空');
  if (!data.password) errs.push('密码不能为空');
  return errs;
};

const lengthCheck = (data) => {
  const errs = [];
  if (data.username && data.username.length < 3) errs.push('用户名至少3个字符');
  if (data.password && data.password.length < 6) errs.push('密码至少6个字符');
  return errs;
};

const formatCheck = (data) => {
  const errs = [];
  if (data.email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data.email)) {
    errs.push('邮箱格式不正确');
  }
  if (data.phone && !/^1[3-9]\\d{9}$/.test(data.phone)) {
    errs.push('手机号格式不正确');
  }
  return errs;
};

const passwordMatch = (data) => {
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    return '两次输入的密码不一致';
  }
};

const formValidator = createValidatorChain(
  requiredFields,
  lengthCheck,
  formatCheck,
  passwordMatch
);

const testForms = [
  { username: '', password: '' },
  { username: 'ab', password: '123' },
  { username: 'testuser', password: '123456', email: 'bad-email', phone: '123' },
  { username: 'testuser', password: '123456', confirmPassword: '654321' },
  { username: 'testuser', password: '123456', confirmPassword: '123456', email: 't***@example.com', phone: '13800138000' }
];

testForms.forEach((form, i) => {
  console.log(\`--- 表单\${i + 1}验证 ---\`);
  const res = formValidator(form);
  if (res.valid) {
    console.log('✅ 验证通过');
  } else {
    res.errors.forEach(e => console.log('  ❌', e));
  }
});
console.log('');

// ---------- 4. 同步执行演示 ----------

console.log('========== 4. 洋葱模型执行顺序演示 ==========\\n');

const chain = new RequestHandler();

chain.use(async (ctx, next) => {
  console.log('1. 第一层中间件 - 进入');
  await next();
  console.log('1. 第一层中间件 - 退出');
});

chain.use(async (ctx, next) => {
  console.log('2. 第二层中间件 - 进入');
  await next();
  console.log('2. 第二层中间件 - 退出');
});

chain.use(async (ctx) => {
  console.log('3. 核心业务处理');
  ctx.response.body = 'done';
});

chain.handle({ method: 'GET', url: '/test', headers: {} }).then(() => {
  console.log('');
  console.log('========== 责任链模式演示完成 ==========');
});

testRequests();
`,
  },
  {
    id: "n3-command",
    title: "命令模式（Command）",
    icon: "📜",
    group: "第三部分 结构型与行为型模式",
content: `# 命令模式（Command）

## 一、模式定义

命令模式（Command Pattern）是一种行为型设计模式，它将请求封装为一个对象，从而可以用不同的请求对客户进行参数化，支持请求的排队、记录日志、以及可撤销的操作。

命令模式的核心思想是：**将"请求"本身变成一个对象**。通常一个请求就是一次方法调用，但在命令模式中，我们把方法调用的所有信息（调用哪个对象、哪个方法、什么参数）封装成一个命令对象。这个命令对象可以被存储、传递、组合、排队、撤销、重做——就像任何其他对象一样。

生活中的命令模式例子：餐厅点餐（顾客点餐→订单是命令→厨师是接收者，订单可以排队、撤销）、遥控器（每个按钮是一个命令对象，按下按钮执行命令，可以记录和回放）、文本编辑器的撤销/重做（每个编辑操作是一个命令对象，保存在历史栈中）。

## 二、命令模式的结构

命令模式包含以下角色：

1. **Command（命令接口）**：声明执行操作的接口，通常包含 \`execute()\` 方法，支持撤销的话还有 \`undo()\` 方法。
2. **ConcreteCommand（具体命令）**：实现 Command 接口，绑定接收者和动作，调用接收者相应的操作。
3. **Receiver（接收者）**：真正执行命令的对象，包含实际的业务逻辑。任何类都可以作为接收者。
4. **Invoker（调用者）**：持有命令对象，触发命令执行（调用 execute）。它不关心命令具体做什么，只知道命令有 execute 方法。
5. **Client（客户端）**：创建具体命令对象，设置接收者，并将命令交给调用者。

## 三、为什么将请求变成对象就有了灵活性？

将方法调用封装成对象看似多此一举，但这带来了巨大的灵活性：

1. **可撤销/重做**：命令对象保存了执行前的状态，可以在 undo 时恢复。维护一个命令历史栈，可以实现多级撤销/重做。
2. **可排队/延迟执行**：命令是对象，可以放入队列中，按顺序执行或延迟执行。任务队列、消息队列本质上都是命令队列。
3. **可组合（宏命令）**：多个命令可以组合成一个宏命令，execute 时依次执行所有子命令，undo 时逆序撤销。
4. **可记录/持久化**：命令对象可以被序列化存储，系统崩溃后可以重新执行恢复状态（操作日志）。
5. **可事务化**：一系列命令要么全部执行成功，要么全部撤销（类似数据库事务回滚）。
6. **可参数化**：Invoker 可以接收不同的命令对象，在运行时动态切换行为。

## 四、实际应用场景

1. **撤销/重做功能**：文本编辑器、图形编辑器、IDE 的撤销重做是命令模式最经典的应用。每个编辑操作（插入、删除、格式设置）都是命令对象。
2. **任务队列/作业调度**：将任务封装成命令对象，放入队列异步执行或定时执行。
3. **宏命令/批量操作**：如 Photoshop 的动作录制，可以录制一系列操作然后批量执行。
4. **事务操作**：数据库事务中，每个 SQL 操作是命令，失败时可以回滚。
5. **GUI 按钮/菜单项**：每个按钮绑定一个命令对象，点击时执行。更换命令就更换了按钮行为。
6. **操作日志/审计**：记录所有执行过的命令，用于审计、恢复、回放。
7. **延迟执行/异步任务**：命令对象可以在创建后不立即执行，在合适的时机再执行。
8. **Redux/NgRx**：Redux 中的 action 对象本质就是命令——描述"发生了什么"，dispatch 后由 reducer 执行。

## 五、命令模式的优缺点

### 优点
- 将请求调用者和请求接收者解耦
- 命令可以被组合、排队、撤销、重做、记录
- 新增命令很容易，无需修改现有代码（符合开闭原则）
- 可以将命令序列化，实现持久化和网络传输
- 支持事务性操作（全部成功或全部撤销）

### 缺点
- 每增加一个操作就要增加一个命令类，可能导致类数量膨胀
- 增加了代码复杂度，对于简单操作可能过度设计
- 撤销功能的实现需要谨慎处理状态保存，特别是涉及外部状态时

## 六、JavaScript 中命令模式的特点

在 JavaScript 中，函数本身就是一等公民，闭包天然可以保存状态，所以命令模式的实现非常简洁：
- 命令对象可以用普通对象或闭包实现，不一定需要类层次结构。
- execute/undo 方法可以直接用函数来表达。
- 宏命令可以用数组存储子命令，执行时遍历即可。
- 利用闭包可以方便地捕获命令执行前的状态用于撤销。

## 七、总结

命令模式是一种非常优雅的设计模式，它的核心价值在于"**将请求对象化**"。当你需要撤销/重做、任务队列、操作日志、宏命令等功能时，命令模式是最佳选择。理解命令模式，可以帮助我们设计出更灵活、更可追溯的系统。在 Redux 等状态管理库中，action 对象的设计思想就源自命令模式。`,
    code: `// ==================== 命令模式完整演示 ====================

// ---------- 1. 文本编辑器的撤销/重做 ----------

console.log('========== 1. 文本编辑器撤销/重做 ==========\\n');

// 接收者（Receiver）：真正执行编辑操作的文本编辑器
class TextEditor {
  constructor() {
    this.content = '';
  }
  
  getText() {
    return this.content;
  }
  
  insert(position, text) {
    this.content = this.content.slice(0, position) + text + this.content.slice(position);
    return { position, text, length: text.length };
  }
  
  delete(position, length) {
    const deletedText = this.content.slice(position, position + length);
    this.content = this.content.slice(0, position) + this.content.slice(position + length);
    return { position, length, deletedText };
  }
  
  replace(position, length, newText) {
    const oldText = this.content.slice(position, position + length);
    this.content = this.content.slice(0, position) + newText + this.content.slice(position + length);
    return { position, oldLength: length, oldText, newLength: newText.length, newText };
  }
}

// 具体命令：插入命令
class InsertCommand {
  constructor(editor, position, text) {
    this.editor = editor;
    this.position = position;
    this.text = text;
    this.type = 'insert';
  }
  
  execute() {
    this.savedState = this.editor.insert(this.position, this.text);
  }
  
  undo() {
    this.editor.delete(this.savedState.position, this.savedState.length);
  }
}

// 具体命令：删除命令
class DeleteCommand {
  constructor(editor, position, length) {
    this.editor = editor;
    this.position = position;
    this.length = length;
    this.type = 'delete';
  }
  
  execute() {
    this.savedState = this.editor.delete(this.position, this.length);
  }
  
  undo() {
    this.editor.insert(this.savedState.position, this.savedState.deletedText);
  }
}

// 调用者（Invoker）：命令历史管理器，支持undo/redo
class CommandHistory {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
  }
  
  executeCommand(command) {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
  }
  
  undo() {
    if (this.undoStack.length === 0) {
      console.log('  (没有可撤销的操作)');
      return false;
    }
    const command = this.undoStack.pop();
    command.undo();
    this.redoStack.push(command);
    return true;
  }
  
  redo() {
    if (this.redoStack.length === 0) {
      console.log('  (没有可重做的操作)');
      return false;
    }
    const command = this.redoStack.pop();
    command.execute();
    this.undoStack.push(command);
    return true;
  }
  
  canUndo() { return this.undoStack.length > 0; }
  canRedo() { return this.redoStack.length > 0; }
}

const editor = new TextEditor();
const history = new CommandHistory();

function showEditor(label) {
  console.log(\`\${label} 内容: "\${editor.getText()}"\`);
}

showEditor('初始');

history.executeCommand(new InsertCommand(editor, 0, 'Hello'));
showEditor('插入"Hello"后');

history.executeCommand(new InsertCommand(editor, 5, ' World'));
showEditor('插入" World"后');

history.executeCommand(new InsertCommand(editor, 11, '!'));
showEditor('插入"!"后');

console.log('\\n--- 第一次撤销 ---');
history.undo();
showEditor('撤销后');

console.log('--- 第二次撤销 ---');
history.undo();
showEditor('撤销后');

console.log('--- 重做一次 ---');
history.redo();
showEditor('重做后');

history.executeCommand(new InsertCommand(editor, 5, ' Beautiful'));
showEditor('\\n插入新文字后（redo栈被清空）');

history.redo();
showEditor('尝试重做');
console.log('');

// ---------- 2. 宏命令（组合命令） ----------

console.log('========== 2. 宏命令（批量操作） ==========\\n');

class MacroCommand {
  constructor(name) {
    this.name = name;
    this.commands = [];
  }
  
  add(command) {
    this.commands.push(command);
  }
  
  execute() {
    console.log(\`[宏命令: \${this.name}] 开始执行 \${this.commands.length} 个子命令\`);
    for (const cmd of this.commands) {
      cmd.execute();
    }
    console.log(\`[宏命令: \${this.name}] 执行完成\`);
  }
  
  undo() {
    console.log(\`[宏命令: \${this.name}] 撤销所有子命令\`);
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }
}

const editor2 = new TextEditor();
const history2 = new CommandHistory();

// 创建一个宏命令：初始化模板
const initMacro = new MacroCommand('初始化文档模板');
initMacro.add(new InsertCommand(editor2, 0, '# 标题\\n\\n'));
initMacro.add(new InsertCommand(editor2, editor2.getText().length, '## 正文\\n\\n'));
initMacro.add(new InsertCommand(editor2, editor2.getText().length, '这里写正文内容...'));

history2.executeCommand(initMacro);
console.log('执行宏命令后内容:');
console.log(editor2.getText());
console.log('');

console.log('撤销宏命令:');
history2.undo();
console.log('撤销后内容: "' + editor2.getText() + '"');
console.log('');

// ---------- 3. 命令队列（异步任务执行） ----------

console.log('========== 3. 命令队列（异步任务） ==========\\n');

class TaskQueue {
  constructor() {
    this.queue = [];
    this.running = false;
  }
  
  addTask(command) {
    this.queue.push(command);
    console.log(\`[队列] 添加任务: \${command.name || '未命名'}\`);
    this.runNext();
  }
  
  async runNext() {
    if (this.running || this.queue.length === 0) return;
    this.running = true;
    
    while (this.queue.length > 0) {
      const cmd = this.queue.shift();
      console.log(\`[队列] 执行任务: \${cmd.name}\`);
      await cmd.execute();
      console.log(\`[队列] 任务完成: \${cmd.name}\`);
    }
    
    this.running = false;
    console.log('[队列] 所有任务执行完毕');
  }
}

function createAsyncTask(name, delayMs, shouldFail = false) {
  return {
    name,
    async execute() {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      if (shouldFail) {
        console.log(\`  [任务\${name}] 执行失败!\`);
        throw new Error(\`任务\${name}失败\`);
      }
      console.log(\`  [任务\${name}] 执行成功 (耗时\${delayMs}ms)\`);
    }
  };
}

const taskQueue = new TaskQueue();
taskQueue.addTask(createAsyncTask('下载文件', 200));
taskQueue.addTask(createAsyncTask('解压文件', 150));
taskQueue.addTask(createAsyncTask('处理数据', 300));
taskQueue.addTask(createAsyncTask('上传结果', 200));

setTimeout(() => {
  // ---------- 4. 简单函数式命令（无需类） ----------
  
  console.log('\\n========== 4. 函数式命令（JS简洁实现） ==========\\n');
  
  function createCommand(execute, undo) {
    return { execute, undo };
  }
  
  const light = { on: false, brightness: 100 };
  
  const turnOn = createCommand(
    () => { light.on = true; console.log('灯已打开'); },
    () => { light.on = false; console.log('灯已关闭'); }
  );
  
  const setBrightness = (level) => {
    const prev = light.brightness;
    return createCommand(
      () => { light.brightness = level; console.log(\`亮度设置为 \${level}%\`); },
      () => { light.brightness = prev; console.log(\`亮度恢复为 \${prev}%\`); }
    );
  };
  
  const simpleHistory = new CommandHistory();
  console.log('初始状态:', light);
  
  simpleHistory.executeCommand(turnOn);
  simpleHistory.executeCommand(setBrightness(50));
  console.log('操作后状态:', light);
  
  simpleHistory.undo();
  console.log('撤销亮度设置:', light);
  
  simpleHistory.undo();
  console.log('撤销开灯:', light);
  
  console.log('');
  console.log('========== 命令模式演示完成 ==========');
}, 1200);
`,
  },
  {
    id: "n3-template-method",
    title: "模板方法模式（Template Method）",
    icon: "📐",
    group: "第三部分 结构型与行为型模式",
content: `# 模板方法模式（Template Method）

## 一、模式定义

模板方法模式（Template Method Pattern）是一种行为型设计模式，它在一个方法中定义一个算法的骨架（模板），而将一些步骤延迟到子类中实现。子类可以在不改变算法结构的情况下，重新定义算法中的某些特定步骤。

模板方法模式的核心思想是：**算法的整体流程（骨架）是固定的，但流程中的某些具体步骤是可变的，将可变步骤交给子类（或传入的函数）来实现**。

生活中的模板方法例子：去银行办业务（取号→排队→办理具体业务→评价，"办理具体业务"是可变步骤）、做饮料（煮水→冲泡→倒入杯中→加调料，"冲泡"和"加调料"因咖啡/茶而异）、建筑施工（打地基→搭框架→砌墙→装修，装修风格可变）、试卷答题（题目固定，答案因人而异）。

## 二、模板方法模式的结构

模板方法模式包含两个角色：

1. **AbstractClass（抽象类/父类）**：
   - 定义**模板方法**（template method）：它是算法的骨架，通常是一个具体方法，按固定顺序调用各个步骤。
   - 定义**基本方法**（primitive methods）：算法中的各个步骤，可以是抽象方法（子类必须实现）、具体方法（有默认实现）、或钩子方法（hook，子类可以选择性覆盖）。

2. **ConcreteClass（具体类/子类）**：
   - 实现父类中的抽象方法，提供特定步骤的具体实现。
   - 可以选择性覆盖钩子方法，来影响模板方法的某些行为。

## 三、好莱坞原则

模板方法模式体现了一个重要的设计原则——**好莱坞原则（Hollywood Principle）**：

> "Don't call us, we'll call you."（不要调用我们，我们会调用你。）

在模板方法中，父类（高层组件）控制整体流程，子类（低层组件）只实现某些步骤。是父类调用子类的方法，而不是子类调用父类。这是一种反向的控制结构，子类不要主动调用父类，而是等待父类在合适的时机调用自己。这与依赖倒置原则（Dependency Inversion Principle）密切相关。

## 四、钩子方法（Hook）

钩子方法是模板方法中一种特殊的方法——父类提供一个默认实现（通常是空操作或返回默认值），子类可以选择覆盖它来"挂钩"到算法流程中的特定点，影响算法行为。

钩子方法的典型用途：
1. **条件控制**：模板方法根据钩子方法的返回值决定是否执行某个步骤。
2. **默认行为**：提供默认实现，子类可以选择是否覆盖。
3. **扩展点**：在算法流程的关键节点预留扩展点，子类按需实现。

抽象方法是"必须实现"，钩子方法是"可选实现"。

## 五、JavaScript 中模板方法的实现方式

### 5.1 基于类继承的模板方法（传统方式）

与传统面向对象语言一样，可以使用 ES6 class 的继承来实现模板方法。父类定义模板方法和抽象/钩子方法，子类覆盖需要定制的步骤。

### 5.2 基于高阶函数的模板方法（JS风格）

JavaScript 中函数是一等公民，我们不一定需要类继承。可以通过向模板函数传入不同的步骤函数来实现模板方法，这更加灵活和轻量。这是 JavaScript 中更常用的方式。

### 5.3 基于配置对象的模板方法

通过传入一个包含各步骤实现的配置对象，模板方法按固定顺序调用这些步骤。未提供的步骤使用默认实现。

## 六、实际应用场景

1. **框架生命周期**：React 的 \`render\`、\`componentDidMount\`、\`useEffect\`，Vue 的 \`created\`、\`mounted\`、\`updated\` 等生命周期函数本质上就是模板方法——框架定义了组件从创建到销毁的流程骨架，开发者通过实现特定的生命周期钩子来插入自己的逻辑。
2. **构建流程**：构建工具（Webpack、Vite）的构建流程是固定的（读取配置→解析入口→编译模块→打包→输出），各步骤的具体行为由配置和插件决定。
3. **数据处理流程**：数据导入/导出的固定流程（读取→验证→转换→保存→输出报告），不同数据源的验证和转换逻辑不同。
4. **HTTP 请求处理**：请求处理流程（接收请求→解析→验证权限→处理业务→生成响应→发送），业务处理部分可变。
5. **测试框架**：测试的生命周期（setup→执行测试→teardown），setup和teardown是钩子方法。
6. **代码生成器**：生成代码文件的固定结构（包声明→导入→类定义→方法→收尾），各部分内容可变。
7. **游戏引擎**：游戏主循环（初始化→输入处理→更新状态→渲染→清理），每帧的更新和渲染逻辑由具体游戏实现。

## 七、模板方法模式与策略模式的区别

- **模板方法**：基于继承，在编译时（写代码时）确定算法的可变部分，控制流程在父类。整个算法的结构是固定的，只改变某些步骤。
- **策略模式**：基于组合，在运行时可以切换整个算法，通过委托给不同策略对象来改变行为。
- 模板方法是"**整体流程固定，局部步骤变化**"；策略模式是"**整个算法都可以替换**"。

## 八、模板方法模式的优缺点

### 优点
- 代码复用：公共流程在父类中实现，避免重复代码
- 反向控制：通过好莱坞原则，父类控制流程，子类实现细节
- 符合开闭原则：新增子类不需要修改父类模板方法
- 结构清晰：算法流程集中在一个方法中，易于理解

### 缺点
- 类继承的局限性：JavaScript 中类继承不如组合灵活，子类数量增加
- 父类步骤固定：模板方法定义了固定流程，限制了灵活性
- 子类调试困难：流程在父类中，子类只看到部分步骤，理解全流程需要阅读父类代码

## 九、总结

模板方法模式是"不要调用我，让我来调用你"的好莱坞原则的最佳体现。在 JavaScript 框架中随处可见它的影子——生命周期钩子就是最典型的模板方法应用。虽然在 JavaScript 中我们通常更倾向于使用组合而非继承，但模板方法的核心思想——**固定骨架、可变步骤**——在函数式编程中同样适用，通过高阶函数传入可变步骤，就能实现轻量级的模板方法。`,
    code: `// ==================== 模板方法模式完整演示 ====================

// ---------- 1. 饮料冲泡模板（经典例子） ----------

console.log('========== 1. 饮料冲泡模板方法 ==========\\n');

// 抽象类：咖啡因饮料
class CaffeineBeverage {
  // 模板方法：固定了冲泡流程
  prepare() {
    this.boilWater();
    this.brew();
    this.pourInCup();
    if (this.customerWantsCondiments()) {
      this.addCondiments();
    }
    console.log('饮料制作完成！\\n');
  }
  
  boilWater() {
    console.log('1. 煮沸水');
  }
  
  pourInCup() {
    console.log('3. 倒入杯中');
  }
  
  // 抽象方法：子类必须实现
  brew() {
    throw new Error('子类必须实现brew方法');
  }
  
  addCondiments() {
    throw new Error('子类必须实现addCondiments方法');
  }
  
  // 钩子方法：子类可以选择覆盖
  customerWantsCondiments() {
    return true;
  }
}

// 具体类：咖啡
class Coffee extends CaffeineBeverage {
  constructor(withCondiments = true) {
    super();
    this.withCondiments = withCondiments;
  }
  
  brew() {
    console.log('2. 用沸水冲泡咖啡粉');
  }
  
  addCondiments() {
    console.log('4. 加糖和牛奶');
  }
  
  customerWantsCondiments() {
    return this.withCondiments;
  }
}

// 具体类：茶
class Tea extends CaffeineBeverage {
  constructor(withCondiments = true) {
    super();
    this.withCondiments = withCondiments;
  }
  
  brew() {
    console.log('2. 用沸水浸泡茶叶');
  }
  
  addCondiments() {
    console.log('4. 加柠檬');
  }
  
  customerWantsCondiments() {
    return this.withCondiments;
  }
}

console.log('--- 制作咖啡（加调料）---');
const coffee = new Coffee(true);
coffee.prepare();

console.log('--- 制作茶（不加调料）---');
const tea = new Tea(false);
tea.prepare();

// ---------- 2. 数据处理模板（更实际的例子） ----------

console.log('========== 2. 数据处理模板方法 ==========\\n');

class DataProcessor {
  // 模板方法：定义数据处理的完整流程
  async process(source) {
    console.log('========== 开始数据处理 ==========');
    
    console.log('[步骤1] 读取数据...');
    const rawData = await this.read(source);
    
    console.log('[步骤2] 验证数据...');
    const validation = this.validate(rawData);
    if (!validation.valid) {
      console.log('验证失败:', validation.errors);
      this.onError(new Error('数据验证失败: ' + validation.errors.join(', ')));
      return null;
    }
    console.log('验证通过');
    
    console.log('[步骤3] 转换数据...');
    const transformedData = this.transform(rawData);
    
    console.log('[步骤4] 保存数据...');
    const savedResult = await this.save(transformedData);
    
    console.log('[步骤5] 生成报告...');
    const report = this.generateReport(transformedData, savedResult);
    
    console.log('========== 数据处理完成 ==========\\n');
    return { data: transformedData, result: savedResult, report };
  }
  
  // 抽象方法：由子类实现
  async read(source) { throw new Error('子类必须实现read'); }
  validate(data) { throw new Error('子类必须实现validate'); }
  transform(data) { throw new Error('子类必须实现transform'); }
  async save(data) { throw new Error('子类必须实现save'); }
  
  // 钩子方法：有默认实现，子类可覆盖
  generateReport(data, result) {
    return { recordCount: Array.isArray(data) ? data.length : 1, timestamp: new Date().toISOString() };
  }
  
  onError(error) {
    console.error('处理出错:', error.message);
  }
}

// 具体处理器：CSV文件处理
class CSVProcessor extends DataProcessor {
  async read(source) {
    console.log('  模拟读取CSV文件:', source);
    return 'name,age,city\\n张三,25,北京\\n李四,30,上海\\n王五,28,广州';
  }
  
  validate(data) {
    const lines = data.split('\\n');
    if (lines.length < 2) return { valid: false, errors: ['CSV至少需要表头和一行数据'] };
    const headerCols = lines[0].split(',').length;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].split(',').length !== headerCols) {
        return { valid: false, errors: [\`第\${i + 1}行列数不匹配\`] };
      }
    }
    return { valid: true };
  }
  
  transform(data) {
    const lines = data.split('\\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((h, i) => obj[h] = values[i]);
      obj.age = Number(obj.age);
      return obj;
    });
  }
  
  async save(data) {
    console.log('  模拟保存到数据库:', data.length, '条记录');
    return { inserted: data.length, table: 'users' };
  }
  
  generateReport(data, result) {
    const cities = [...new Set(data.map(d => d.city))];
    const avgAge = data.reduce((s, d) => s + d.age, 0) / data.length;
    return {
      recordCount: data.length,
      cities,
      averageAge: avgAge.toFixed(1),
      savedAt: new Date().toISOString()
    };
  }
}

// 具体处理器：JSON API处理
class JSONAPIProcessor extends DataProcessor {
  async read(url) {
    console.log('  模拟请求API:', url);
    return JSON.stringify({
      code: 0,
      data: [
        { id: 1, product: '手机', price: 3999, stock: 100 },
        { id: 2, product: '电脑', price: 6999, stock: 50 }
      ]
    });
  }
  
  validate(data) {
    try {
      const parsed = JSON.parse(data);
      if (parsed.code !== 0) return { valid: false, errors: ['API返回错误码'] };
      if (!parsed.data || !Array.isArray(parsed.data)) return { valid: false, errors: ['数据格式错误'] };
      return { valid: true };
    } catch (e) {
      return { valid: false, errors: ['JSON解析失败'] };
    }
  }
  
  transform(data) {
    const parsed = JSON.parse(data);
    return parsed.data.map(item => ({
      ...item,
      priceWithTax: Math.round(item.price * 1.13),
      inStock: item.stock > 0
    }));
  }
  
  async save(data) {
    console.log('  模拟保存到商品库:', data.length, '个商品');
    return { upserted: data.length, table: 'products' };
  }
}

async function testDataProcessing() {
  const csvProcessor = new CSVProcessor();
  const csvResult = await csvProcessor.process('users.csv');
  console.log('CSV处理报告:', csvResult.report);
  console.log('转换后数据:', csvResult.data);
  console.log('');
  
  const jsonProcessor = new JSONAPIProcessor();
  const jsonResult = await jsonProcessor.process('https://api.example.com/products');
  console.log('API处理报告:', jsonResult.report);
  console.log('转换后数据:', jsonResult.data);
  console.log('');
}

// ---------- 3. JavaScript风格：高阶函数实现模板方法（无需类） ----------

console.log('========== 3. JS风格：高阶函数模板方法 ==========\\n');

function createDataProcessor(steps) {
  // 默认步骤实现
  const defaults = {
    read: async (source) => source,
    validate: () => ({ valid: true }),
    transform: (data) => data,
    save: async (data) => ({ saved: true }),
    onError: (err) => console.error('错误:', err.message)
  };
  
  const actualSteps = { ...defaults, ...steps };
  
  return async function process(source) {
    console.log('----- 函数式数据处理 -----');
    try {
      console.log('1. 读取...');
      const raw = await actualSteps.read(source);
      
      console.log('2. 验证...');
      const v = actualSteps.validate(raw);
      if (!v.valid) throw new Error(v.errors?.join(',') || '验证失败');
      
      console.log('3. 转换...');
      const transformed = actualSteps.transform(raw);
      
      console.log('4. 保存...');
      const result = await actualSteps.save(transformed);
      
      console.log('处理完成');
      return { data: transformed, result };
    } catch (err) {
      actualSteps.onError(err);
      return null;
    }
  };
}

// 使用函数式方式创建处理器
const numberProcessor = createDataProcessor({
  read: async (input) => {
    console.log('  读取数字数组');
    return input;
  },
  validate: (data) => {
    if (!Array.isArray(data)) return { valid: false, errors: ['必须是数组'] };
    return { valid: true };
  },
  transform: (data) => {
    return data.map(n => ({ original: n, doubled: n * 2, squared: n * n }));
  },
  save: async (data) => {
    console.log('  保存', data.length, '条处理结果');
    return { count: data.length };
  }
});

numberProcessor([1, 2, 3, 4, 5]).then(result => {
  if (result) {
    console.log('处理结果:', result.data);
  }
  console.log('');
});

// ---------- 4. 测试框架生命周期模板 ----------

console.log('========== 4. 测试框架生命周期（模板方法） ==========\\n');

class TestSuite {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.beforeEachFns = [];
    this.afterEachFns = [];
  }
  
  beforeEach(fn) { this.beforeEachFns.push(fn); }
  afterEach(fn) { this.afterEachFns.push(fn); }
  
  addTest(name, fn) {
    this.tests.push({ name, fn });
  }
  
  // 模板方法：测试执行流程
  async run() {
    console.log(\`===== 运行测试套件: \${this.name} =====\`);
    
    // beforeAll 钩子
    if (this.beforeAll) await this.beforeAll();
    
    let passed = 0;
    let failed = 0;
    
    for (const test of this.tests) {
      try {
        // beforeEach 钩子
        for (const fn of this.beforeEachFns) await fn();
        
        console.log(\`  运行: \${test.name}\`);
        await test.fn();
        
        // afterEach 钩子
        for (const fn of this.afterEachFns) await fn();
        
        console.log(\`  ✅ \${test.name} 通过\`);
        passed++;
      } catch (err) {
        console.log(\`  ❌ \${test.name} 失败: \${err.message}\`);
        failed++;
        for (const fn of this.afterEachFns) {
          try { await fn(); } catch(e) {}
        }
      }
    }
    
    // afterAll 钩子
    if (this.afterAll) await this.afterAll();
    
    console.log(\`===== 结果: \${passed}通过, \${failed}失败 =====\\n\`);
  }
}

const suite = new TestSuite('数学运算测试');
let counter = 0;

suite.beforeEach(() => {
  counter = 0;
});

suite.addTest('加法', () => {
  counter = 1 + 2;
  if (counter !== 3) throw new Error('1+2应该等于3');
});

suite.addTest('乘法', () => {
  counter = 3 * 4;
  if (counter !== 12) throw new Error('3*4应该等于12');
});

suite.addTest('故意失败的测试', () => {
  throw new Error('这是一个模拟失败');
});

// 运行演示
testDataProcessing().then(() => {
  suite.run();
  setTimeout(() => {
    console.log('========== 模板方法模式演示完成 ==========');
  }, 500);
});
`,
  },
];
