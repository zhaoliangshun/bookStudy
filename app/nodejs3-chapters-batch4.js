export const chapters = [
  {
    id: "n3-iterator",
    title: "迭代器模式（Iterator）与生成器",
    icon: "🔄",
    group: "第三部分 结构型与行为型模式",
    content: `
## 迭代器模式的定义

迭代器模式（Iterator Pattern）是一种行为型设计模式，其核心定义是：**提供一种方法顺序访问一个聚合对象中各个元素，而又不暴露该对象的内部表示**。

简单来说，迭代器模式让我们能够遍历一个集合中的所有元素，而不需要关心这个集合底层是用数组、链表、树还是其他数据结构实现的。我们只需要一个统一的接口——"给我下一个元素"，就能完成遍历。

在JavaScript中，迭代器模式已经被深度融入到语言本身。ES6引入的迭代器协议、可迭代协议、for...of循环、展开运算符、解构赋值等特性，全部建立在迭代器模式的思想之上。

## JavaScript中的迭代器协议（Iterator Protocol）

迭代器协议定义了一种标准的方式来产生一个有限或无限序列的值。一个对象只要实现了\`next()\`方法，并且该方法返回一个包含\`value\`（当前值）和\`done\`（是否迭代完成）两个属性的对象，它就是一个迭代器。

\`\`\`javascript
const iterator = {
  next() {
    return { value: 1, done: false };
  }
};
\`\`\`

当\`done\`为\`true\`时，表示迭代已经结束，此时\`value\`通常是\`undefined\`（如果有返回值则存在）。当\`done\`为\`false\`时，\`value\`是当前迭代到的值。

## 可迭代协议（Iterable Protocol）

可迭代协议允许JavaScript对象定义或定制它们的迭代行为。一个对象只要实现了\`[Symbol.iterator]\`方法，该方法返回一个迭代器对象，它就是可迭代的（Iterable）。

JavaScript中内置的可迭代对象包括：Array、String、Map、Set、TypedArray、函数的arguments对象、NodeList等DOM集合类型。

\`\`\`javascript
const arr = [1, 2, 3];
const iter = arr[Symbol.iterator]();
console.log(iter.next()); // { value: 1, done: false }
console.log(iter.next()); // { value: 2, done: false }
\`\`\`

## for...of循环的工作原理

for...of循环是遍历可迭代对象的语法糖。它的本质是：
1. 调用对象的\`[Symbol.iterator]\`方法获取迭代器
2. 不断调用迭代器的\`next()\`方法
3. 当\`done\`为\`false\`时，把\`value\`赋值给循环变量
4. 当\`done\`为\`true\`时，循环结束

展开运算符（\`...\`）、解构赋值（\`[a, b] = iterable\`）、Array.from()、yield*、Promise.all()等底层都遵循同样的机制。

## Generator函数详解

Generator函数是ES6引入的异步编程解决方案，语法上使用\`function*\`定义，内部使用\`yield\`表达式来定义不同的内部状态。

调用Generator函数不会立即执行，而是返回一个指向内部状态的迭代器对象（Iterator Object）。每次调用这个迭代器的\`next()\`方法，函数会执行到下一个\`yield\`表达式的位置，暂停执行并返回\`yield\`后面的值。

\`\`\`javascript
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}
const g = gen();
g.next(); // { value: 1, done: false }
\`\`\`

## Generator的惰性求值特性

Generator最强大的特性之一是**惰性求值（Lazy Evaluation）**。也就是说，只有在真正需要值的时候才会计算，而不是一次性计算出所有结果。这对于处理大数据流、无限序列非常有用。

比如表示一个无限的斐波那契数列，用数组会占满内存，但用Generator可以在需要多少取多少，内存占用始终是常量级别。

## yield*委托

\`yield*\`表达式用于委托给另一个Generator或可迭代对象。它会将迭代控制权交给另一个可迭代对象，自动迭代其中的所有值，不需要我们手动循环调用next。

\`\`\`javascript
function* inner() {
  yield 'a';
  yield 'b';
}
function* outer() {
  yield* inner();
  yield 'c';
}
// outer()迭代结果: 'a', 'b', 'c'
\`\`\`

迭代器模式在JavaScript中的应用非常广泛，它不仅是设计模式的一种实现，更是整个语言异步和集合处理的基础。理解迭代器原理，能帮助你更好地理解for...of、Generator、async/await等JS核心特性。
`,
    code: `
// ========== 1. 手写斐波那契迭代器 ==========
function createFibIterator() {
  let prev = 0;
  let curr = 1;
  return {
    next() {
      const value = curr;
      [prev, curr] = [curr, prev + curr];
      return { value, done: false };
    }
  };
}

console.log('=== 斐波那契迭代器 ===');
const fibIter = createFibIterator();
for (let i = 0; i < 10; i++) {
  console.log('Fib:', fibIter.next().value);
}

// ========== 2. 手写range迭代器 ==========
function createRangeIterator(start, end, step = 1) {
  let current = start;
  return {
    next() {
      if (current <= end) {
        const value = current;
        current += step;
        return { value, done: false };
      }
      return { value: undefined, done: true };
    }
  };
}

console.log('\\n=== range迭代器(1-10步长2) ===');
const rangeIter = createRangeIterator(1, 10, 2);
let result;
while (!(result = rangeIter.next()).done) {
  console.log('Range:', result.value);
}

// ========== 3. 用Generator实现更简洁 ==========
function* fibGen() {
  let prev = 0, curr = 1;
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

function* rangeGen(start, end, step = 1) {
  for (let i = start; i <= end; i += step) {
    yield i;
  }
}

console.log('\\n=== Generator斐波那契 ===');
const fibG = fibGen();
for (let i = 0; i < 10; i++) {
  console.log('FibGen:', fibG.next().value);
}

console.log('\\n=== Generator range展开 ===');
console.log([...rangeGen(1, 5)]);

// ========== 4. 自定义可迭代对象 ==========
class LinkedList {
  constructor() {
    this.items = [];
  }
  add(item) {
    this.items.push(item);
  }
  [Symbol.iterator]() {
    let index = 0;
    const items = this.items;
    return {
      next() {
        if (index < items.length) {
          return { value: items[index++], done: false };
        }
        return { done: true };
      }
    };
  }
}

console.log('\\n=== 自定义可迭代对象LinkedList ===');
const list = new LinkedList();
list.add('苹果');
list.add('香蕉');
list.add('橙子');

// for...of消费
for (const item of list) {
  console.log('for...of:', item);
}

// ========== 5. 各种消费迭代器的方式 ==========
const iterable = {
  *[Symbol.iterator]() {
    yield* [10, 20, 30, 40, 50];
  }
};

console.log('\\n=== 迭代器消费方式 ===');
// 展开运算符
console.log('展开:', [...iterable]);

// 解构赋值
const [first, second, ...rest] = iterable;
console.log('解构: first=', first, 'second=', second, 'rest=', rest);

// Array.from
console.log('Array.from:', Array.from(iterable));

// Set构造
console.log('Set:', new Set(iterable));

// ========== 6. yield*委托演示 ==========
function* gen1() {
  yield 1;
  yield 2;
}

function* gen2() {
  yield* gen1();
  yield* [3, 4];
  yield* 'AB';
  yield 5;
}

console.log('\\n=== yield*委托 ===');
console.log([...gen2()]);

// ========== 7. 用Generator实现take工具(惰性求值) ==========
function* take(n, iterable) {
  const iter = iterable[Symbol.iterator]();
  for (let i = 0; i < n; i++) {
    const res = iter.next();
    if (res.done) break;
    yield res.value;
  }
}

console.log('\\n=== 惰性求值：从无限斐波那契取前15个 ===');
console.log([...take(15, fibGen())]);
`
  },
  {
    id: "n3-state",
    title: "状态模式（State）",
    icon: "🔀",
    group: "第三部分 结构型与行为型模式",
    content: `
## 状态模式的定义

状态模式（State Pattern）是一种行为型设计模式，其核心定义是：**允许对象在内部状态改变时改变它的行为，对象看起来好像修改了它的类**。

这句话怎么理解呢？想象一下一个电梯：电梯有停止状态、运行状态、开门状态、关门状态。在不同状态下，按同一个按钮会产生完全不同的行为——比如在开门状态按"运行"按钮不会响应，但在关门停止状态按"运行"按钮就会启动电梯。如果我们不用状态模式，就需要在每个按钮的处理函数里写大量的if-else或switch-case来判断当前是什么状态，然后决定执行什么逻辑。

状态模式的核心思想就是：**把每个状态的行为封装到独立的状态类中，上下文对象把行为委托给当前状态对象处理，状态切换时自动替换当前状态对象**。这样就彻底消除了庞大的条件分支语句。

## 消除庞大的条件分支

没有使用状态模式的代码通常长这样：

\`\`\`javascript
class Order {
  pay() {
    if (this.state === 'pending') { /* ... */ }
    else if (this.state === 'paid') { throw new Error('已支付'); }
    else if (this.state === 'shipped') { throw new Error('已发货'); }
  }
  cancel() { /* 又是一串if-else */ }
  ship() { /* 又是一串if-else */ }
}
\`\`\`

随着状态数量增加，这种代码会变成"面条代码"，每个方法都要遍历所有状态判断，维护起来非常痛苦，违反开闭原则。状态模式通过将每个状态的行为分散到独立的状态对象中，让代码更清晰。

## 状态模式与策略模式的区别

状态模式和策略模式的UML类图几乎一模一样，都是"组合+委托"的结构，但它们解决的问题和意图完全不同：

| 维度 | 策略模式（Strategy） | 状态模式（State） |
|------|---------------------|-------------------|
| 意图 | 封装可互换的算法族，由客户端选择使用哪种 | 状态驱动行为自动切换，外部不需要关心状态 |
| 控制权 | 外部主动选择替换策略 | 内部状态流转自动触发切换 |
| 状态感知 | 策略之间互不感知 | 状态知道其他状态存在，会触发状态切换 |
| 典型场景 | 排序算法选择、支付方式选择、折扣策略 | 订单流转、有限状态机、TCP连接 |

简单记忆：策略是"选一种算法来用"，状态是"状态变了行为自动变"。

## 应用场景：有限状态机（FSM）

状态模式最经典的应用就是实现**有限状态机（Finite State Machine, FSM）**。有限状态机是一个数学计算模型，包含：
- 有限数量的状态（State）
- 一个初始状态
- 触发状态转移的事件/输入（Event）
- 状态转移规则（Transition：从状态A通过事件X可以转到状态B）
- 每个状态下可执行的动作（Action）

现实中FSM的例子比比皆是：

1. **订单状态流转**：待支付→已支付→已发货→已签收/已退款，每个状态只允许特定流转
2. **Promise三态**：pending→fulfilled、pending→rejected，状态不可逆
3. **TCP连接状态**：LISTEN→SYN_SENT→ESTABLISHED→FIN_WAIT→CLOSED
4. **红绿灯**：红→绿→黄→红，循环切换
5. **游戏角色状态**：站立、行走、跳跃、攻击、受伤，状态间有合法转移规则

有限状态机的好处是：状态转移是显式定义的，非法转移会被禁止，系统行为可预测。

## 状态模式的结构

状态模式通常包含这几个角色：
- **Context（上下文）**：持有当前状态对象的引用，对外暴露请求接口，将请求委托给当前状态处理，提供状态切换的方法
- **State（抽象状态）**：定义一个接口，封装与Context的一个特定状态相关的行为
- **ConcreteState（具体状态）**：实现具体状态下的行为，以及何时切换到其他状态

在JavaScript中，由于语言的动态特性，我们不需要严格的抽象类和继承，可以直接用对象字面量来表示状态，更加灵活轻量。

状态模式的核心价值在于：将与特定状态相关的行为局部化到一个对象中，并且将不同状态的行为分割开来，满足"单一职责原则"；同时让状态转换显式化，减少对象间的相互依赖。
`,
    code: `
const util = require('util');

// ========== 1. 订单状态机 ==========
console.log('========== 订单状态机演示 ==========');

const OrderState = {
  PENDING: 'pending',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled'
};

class Order {
  constructor(orderId) {
    this.orderId = orderId;
    this.state = OrderState.PENDING;
    this.stateHistory = [OrderState.PENDING];
  }

  setState(newState) {
    console.log(\`订单\${this.orderId}: \${this.state} -> \${newState}\`);
    this.state = newState;
    this.stateHistory.push(newState);
  }

  pay() {
    switch (this.state) {
      case OrderState.PENDING:
        console.log('支付成功！');
        this.setState(OrderState.PAID);
        break;
      case OrderState.PAID:
        console.log('订单已支付，请勿重复支付');
        break;
      case OrderState.CANCELLED:
        console.log('已取消订单无法支付');
        break;
      case OrderState.REFUNDED:
        console.log('已退款订单无法支付');
        break;
      default:
        console.log(\`当前状态\${this.state}不允许支付\`);
    }
  }

  ship() {
    switch (this.state) {
      case OrderState.PAID:
        console.log('商家已发货！');
        this.setState(OrderState.SHIPPED);
        break;
      default:
        console.log(\`当前状态\${this.state}不允许发货\`);
    }
  }

  confirmReceive() {
    switch (this.state) {
      case OrderState.SHIPPED:
        console.log('已确认收货，交易完成！');
        this.setState(OrderState.DELIVERED);
        break;
      default:
        console.log(\`当前状态\${this.state}无法确认收货\`);
    }
  }

  refund() {
    switch (this.state) {
      case OrderState.PAID:
        console.log('退款成功！');
        this.setState(OrderState.REFUNDED);
        break;
      case OrderState.SHIPPED:
        console.log('已发货，需退货后退款');
        break;
      case OrderState.PENDING:
        console.log('未支付订单直接取消');
        this.setState(OrderState.CANCELLED);
        break;
      default:
        console.log(\`当前状态\${this.state}无法退款\`);
    }
  }

  cancel() {
    switch (this.state) {
      case OrderState.PENDING:
        console.log('订单已取消');
        this.setState(OrderState.CANCELLED);
        break;
      default:
        console.log(\`当前状态\${this.state}无法取消\`);
    }
  }

  printHistory() {
    console.log('状态流转:', this.stateHistory.join(' -> '));
  }
}

const order = new Order('NO.10086');
order.pay();
order.ship();
order.confirmReceive();
order.printHistory();

console.log('\\n尝试非法操作:');
const order2 = new Order('NO.10087');
order2.ship();
order2.cancel();

// ========== 2. 使用纯状态模式重构(状态对象封装行为) ==========
console.log('\\n========== 纯状态模式实现红绿灯 ==========');

class TrafficLight {
  constructor() {
    this.states = {
      red: new RedState(this),
      green: new GreenState(this),
      yellow: new YellowState(this)
    };
    this.current = this.states.red;
    console.log('初始状态: 红灯');
  }

  setState(state) {
    console.log(\`切换: \${this.current.name} -> \${state.name}\`);
    this.current = state;
  }

  change() {
    this.current.next();
  }
}

class RedState {
  constructor(light) {
    this.light = light;
    this.name = '红灯';
  }
  next() {
    console.log('红灯停...等待60秒');
    setTimeout(() => {}, 0);
    this.light.setState(this.light.states.green);
  }
}

class GreenState {
  constructor(light) {
    this.light = light;
    this.name = '绿灯';
  }
  next() {
    console.log('绿灯行...通行30秒');
    this.light.setState(this.light.states.yellow);
  }
}

class YellowState {
  constructor(light) {
    this.light = light;
    this.name = '黄灯';
  }
  next() {
    console.log('黄灯亮了等一等...5秒');
    this.light.setState(this.light.states.red);
  }
}

const light = new TrafficLight();
light.change();
light.change();
light.change();
light.change();

// ========== 3. 简化版Promise状态机 ==========
console.log('\\n========== 简易Promise状态机 ==========');

const PROMISE_STATES = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
};

class SimplePromise {
  constructor(executor) {
    this.state = PROMISE_STATES.PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === PROMISE_STATES.PENDING) {
        this.state = PROMISE_STATES.FULFILLED;
        this.value = value;
        console.log('Promise: pending -> fulfilled, value=', value);
        this.onFulfilledCallbacks.forEach(fn => fn(value));
      }
    };

    const reject = (reason) => {
      if (this.state === PROMISE_STATES.PENDING) {
        this.state = PROMISE_STATES.REJECTED;
        this.reason = reason;
        console.log('Promise: pending -> rejected, reason=', reason);
        this.onRejectedCallbacks.forEach(fn => fn(reason));
      }
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    if (this.state === PROMISE_STATES.FULFILLED) {
      onFulfilled(this.value);
    } else if (this.state === PROMISE_STATES.REJECTED) {
      onRejected(this.reason);
    } else {
      this.onFulfilledCallbacks.push(onFulfilled);
      this.onRejectedCallbacks.push(onRejected);
    }
    return this;
  }
}

const p = new SimplePromise((resolve) => {
  console.log('Promise执行中...');
  setTimeout(() => resolve('操作成功'), 100);
});
p.then(
  (val) => console.log('收到结果:', val),
  (err) => console.log('捕获错误:', err)
);

// 演示状态不可逆
const p2 = new SimplePromise((resolve, reject) => {
  resolve('第一次resolve');
  reject('再reject也没用了');
});
p2.then(v => console.log('p2结果:', v));

// ========== 4. 通用状态机工厂 ==========
console.log('\\n========== 通用FSM工厂演示: TCP连接 ==========');

function createStateMachine(initialState, transitions) {
  let currentState = initialState;
  return {
    get state() { return currentState; },
    trigger(event) {
      const transition = transitions.find(
        t => t.from === currentState && t.on === event
      );
      if (!transition) {
        console.log(\`非法转移: 在\${currentState}状态不能触发\${event}\`);
        return false;
      }
      if (transition.guard && !transition.guard()) {
        console.log('守卫条件不满足，转移被阻止');
        return false;
      }
      console.log(\`触发\${event}: \${currentState} => \${transition.to}\`);
      currentState = transition.to;
      if (transition.action) transition.action();
      return true;
    }
  };
}

const tcpFSM = createStateMachine('CLOSED', [
  { from: 'CLOSED', on: 'open', to: 'LISTEN', action: () => console.log('开始监听端口') },
  { from: 'LISTEN', on: 'syn', to: 'SYN_RCVD', action: () => console.log('收到SYN') },
  { from: 'SYN_RCVD', on: 'ack', to: 'ESTABLISHED', action: () => console.log('连接建立!') },
  { from: 'ESTABLISHED', on: 'close', to: 'FIN_WAIT_1', action: () => console.log('发送FIN') },
  { from: 'FIN_WAIT_1', on: 'fin_ack', to: 'CLOSED', action: () => console.log('连接关闭') }
]);

tcpFSM.trigger('open');
tcpFSM.trigger('syn');
tcpFSM.trigger('ack');
tcpFSM.trigger('close');
tcpFSM.trigger('fin_ack');
console.log('最终状态:', tcpFSM.state);

console.log('\\n非法转移测试:');
tcpFSM.trigger('open');
tcpFSM.trigger('close');
`
  },
  {
    id: "n3-hof",
    title: "高阶函数（Higher-Order Function）详解",
    icon: "🎩",
    group: "第四部分 函数式编程与编程范式",
    content: `
## 函数是一等公民（First-Class Citizen）

在学习高阶函数之前，我们必须先理解JavaScript中一个至关重要的概念：**函数是一等公民（First-Class Citizen/First-Class Function）**。这意味着函数和其他数据类型（数字、字符串、对象等）处于完全平等的地位，没有任何特殊待遇。

具体来说，一等公民函数意味着：

1. **函数可以赋值给变量**：\`const fn = function() {};\`
2. **函数可以作为参数传递给其他函数**：就像传递数字一样自然
3. **函数可以作为其他函数的返回值**
4. **函数可以存储在数据结构中**：数组里放函数、对象里放函数都可以
5. **函数可以在运行时动态创建**：函数字面量随时可以写

在很多传统语言（比如C语言早期版本）中，函数不能作为参数传递，必须通过函数指针这种"迂回"方式实现。而在JavaScript、Python、Go等现代语言中，函数是语言的核心组成部分，一等公民身份让函数式编程成为可能。

## 什么是高阶函数

**高阶函数（Higher-Order Function，HOF）**的定义非常简单：满足以下任意一个条件的函数就是高阶函数：
1. **接收一个或多个函数作为参数**
2. **返回一个函数作为结果**

两个条件满足其一即可，同时满足当然也是。

为什么需要高阶函数？因为它能帮我们**抽象通用的控制流程和操作模式**，把"做什么"和"怎么做"分离。比如数组的map方法，它抽象了"遍历数组并对每个元素做变换"这个通用模式，而具体"怎么变换每个元素"由我们传入的函数决定。

## JavaScript中常见的内置高阶函数

JavaScript数组原型上提供了大量非常实用的高阶函数：

- **Array.prototype.map**：对每个元素变换，返回新数组
- **Array.prototype.filter**：过滤满足条件的元素，返回新数组
- **Array.prototype.reduce**：将数组归约为单个值（最强大最通用）
- **Array.prototype.forEach**：遍历每个元素执行副作用
- **Array.prototype.some**：是否至少一个元素满足条件
- **Array.prototype.every**：是否所有元素都满足条件
- **Array.prototype.find/findIndex**：查找满足条件的元素
- **Array.prototype.sort**：接收比较函数排序

此外，setTimeout、setInterval、addEventListener、Promise.then等API也都是高阶函数，因为它们都接收回调函数作为参数。

## 手写map/filter/reduce理解本质

很多人天天用这些高阶函数，但并不理解它们内部是怎么实现的。其实它们的原理非常简单——本质上就是一个for循环，只是把循环体里的逻辑抽离出来，由调用者通过函数参数传入。

以map为例，原生的map做了这些事：
1. 创建一个和原数组长度相同的新数组
2. 遍历原数组的每一个元素
3. 对每个元素调用传入的回调函数，传入当前元素、索引、原数组
4. 将回调函数的返回值放到新数组对应位置
5. 遍历结束后返回新数组

理解了这个本质，你会发现高阶函数一点都不神秘，它只是把"变化的部分"提取成参数而已。

## 闭包的本质

高阶函数经常和闭包一起出现。那**闭包（Closure）**到底是什么？

精确定义：闭包是**函数和声明该函数的词法环境（Lexical Environment）的组合**。换句话说，当一个内部函数引用了外部函数作用域中的变量时，即使外部函数已经执行完毕返回了，内部函数依然"记住"并能访问那些外部变量——这就是闭包。

闭包的本质不是什么高深的魔法，它只是JavaScript词法作用域和作用域链的自然结果：函数在定义时就确定了它的作用域链，而不是在调用时。只要函数还被引用，它所在作用域链上的变量就不会被垃圾回收。

闭包是实现数据私有化、函数工厂、柯里化等函数式编程技巧的基础。

## 柯里化与偏应用

**柯里化（Currying）**是把一个接收多个参数的函数，变换成一系列接收单一参数（或者部分参数）的函数，并且返回接收余下参数的新函数的技术。比如\`f(a,b,c)\`柯里化后变成\`f(a)(b)(c)\`。

**偏应用（Partial Application）**是指固定一个函数的部分参数，产生一个更少参数的函数。它和柯里化类似但不完全相同：柯里化是嵌套的单参数调用直到参数收齐，偏应用是一次性绑定部分参数得到剩余参数的函数。

两者都是利用闭包"记住"已传入的参数，等待剩余参数传入后再执行原函数。这在参数复用、延迟执行、函数组合等场景非常有用。

高阶函数是函数式编程的基石。掌握了高阶函数，你就从"会写JS"进阶到了"会用JS写优雅的代码"。
`,
    code: `
// ========== 1. 函数是一等公民演示 ==========
console.log('========== 函数是一等公民 ==========');

// 赋值给变量
const greet = function(name) {
  return \`Hello, \${name}!\`;
};
console.log(greet('World'));

// 存储在数据结构中
const operations = [
  (a, b) => a + b,
  (a, b) => a - b,
  (a, b) => a * b,
  (a, b) => a / b
];
console.log('10 + 5 =', operations[0](10, 5));
console.log('10 * 5 =', operations[2](10, 5));

// 作为对象属性
const calculator = {
  add: (a, b) => a + b,
  multiply: (a, b) => a * b
};
console.log('calculator.add(3,4):', calculator.add(3, 4));

// ========== 2. 手写map ==========
console.log('\\n========== 手写map ==========');

function myMap(arr, callback) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(callback(arr[i], i, arr));
  }
  return result;
}

const numbers = [1, 2, 3, 4, 5];
const doubled = myMap(numbers, n => n * 2);
const squared = myMap(numbers, n => n * n);
console.log('原数组:', numbers);
console.log('翻倍:', doubled);
console.log('平方:', squared);

// ========== 3. 手写filter ==========
console.log('\\n========== 手写filter ==========');

function myFilter(arr, predicate) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i, arr)) {
      result.push(arr[i]);
    }
  }
  return result;
}

const evens = myFilter(numbers, n => n % 2 === 0);
const odds = myFilter(numbers, n => n % 2 === 1);
const gt3 = myFilter(numbers, n => n > 3);
console.log('偶数:', evens);
console.log('奇数:', odds);
console.log('大于3:', gt3);

// ========== 4. 手写reduce ==========
console.log('\\n========== 手写reduce ==========');

function myReduce(arr, reducer, initialValue) {
  let acc = initialValue;
  let startIndex = 0;
  if (initialValue === undefined) {
    acc = arr[0];
    startIndex = 1;
  }
  for (let i = startIndex; i < arr.length; i++) {
    acc = reducer(acc, arr[i], i, arr);
  }
  return acc;
}

const sum = myReduce(numbers, (a, b) => a + b, 0);
const product = myReduce(numbers, (a, b) => a * b, 1);
const max = myReduce(numbers, (a, b) => a > b ? a : b);
console.log('求和:', sum);
console.log('求积:', product);
console.log('最大值:', max);

// 用reduce实现map和filter
const mapByReduce = (arr, fn) =>
  myReduce(arr, (acc, item, i, a) => {
    acc.push(fn(item, i, a));
    return acc;
  }, []);
const filterByReduce = (arr, pred) =>
  myReduce(arr, (acc, item) => pred(item) ? [...acc, item] : acc, []);
console.log('reduce实现map:', mapByReduce([1,2,3], n => n+10));
console.log('reduce实现filter:', filterByReduce([1,2,3,4], n => n>2));

// ========== 5. 高阶函数数据变换组合 ==========
console.log('\\n========== 高阶函数组合数据变换 ==========');

const users = [
  { name: '张三', age: 25, score: 85, active: true },
  { name: '李四', age: 17, score: 92, active: true },
  { name: '王五', age: 30, score: 56, active: false },
  { name: '赵六', age: 22, score: 78, active: true },
  { name: '钱七', age: 28, score: 95, active: true }
];

// 需求：找出活跃用户中成年人(>=18)，按分数降序，取名字列表
const result = myFilter(users, u => u.active)
  .filter(u => u.age >= 18)
  .sort((a, b) => b.score - a.score)
  .map(u => u.name);
console.log('优秀活跃用户:', result);

// 计算活跃用户平均分
const activeUsers = users.filter(u => u.active);
const avgScore = activeUsers.reduce((s, u) => s + u.score, 0) / activeUsers.length;
console.log('活跃用户平均分:', avgScore.toFixed(2));

// ========== 6. 实现once函数(只执行一次) ==========
console.log('\\n========== once函数(只执行一次) ==========');

function once(fn) {
  let called = false;
  let result;
  return function(...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

const initApp = once((config) => {
  console.log('初始化应用，配置:', config);
  return { initialized: true, config };
});

console.log(initApp({ env: 'dev' }));
console.log(initApp({ env: 'prod' }));
console.log('第二次调用返回第一次的结果');

// ========== 7. 实现memoize缓存函数结果 ==========
console.log('\\n========== memoize缓存函数结果 ==========');

function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log(\`  缓存命中 args=\${key}\`);
      return cache.get(key);
    }
    console.log(\`  计算中 args=\${key}\`);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

function slowFib(n) {
  if (n <= 1) return n;
  return slowFib(n - 1) + slowFib(n - 2);
}

const fastFib = memoize(slowFib);
console.time('fib(30) 首次');
console.log('fib(30):', fastFib(30));
console.timeEnd('fib(30) 首次');

console.time('fib(30) 缓存后');
console.log('fib(30) again:', fastFib(30));
console.timeEnd('fib(30) 缓存后');

// ========== 8. some/every手写 ==========
console.log('\\n========== 手写some/every ==========');

function mySome(arr, predicate) {
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i, arr)) return true;
  }
  return false;
}

function myEvery(arr, predicate) {
  for (let i = 0; i < arr.length; i++) {
    if (!predicate(arr[i], i, arr)) return false;
  }
  return true;
}

console.log('有偶数?', mySome([1,3,5,7], n => n%2===0));
console.log('都是偶数?', myEvery([2,4,6,8], n => n%2===0));
console.log('有成年人?', mySome(users, u => u.age >= 18));
`
  },
  {
    id: "n3-curry-compose",
    title: "函数柯里化（Currying）与组合（Compose）",
    icon: "🔗",
    group: "第四部分 函数式编程与编程范式",
    content: `
## 什么是柯里化（Currying）

柯里化（Currying）这个名字来源于数学家Haskell Curry（也是Haskell语言命名的来源），它是函数式编程中一个非常重要的概念。

**柯里化的定义**：把一个接收**多个参数**的函数，变换成一系列**接收单一参数**（或者说逐步接收参数）的函数序列，每次调用返回一个接收剩余参数的新函数，直到所有参数都被接收后才真正执行计算。

举个例子，普通函数\`add(a, b, c)\`调用方式是\`add(1, 2, 3)\`。柯里化后，调用方式变成\`add(1)(2)(3)\`。每次传入一个参数，返回一个新函数等待下一个参数，直到参数全部传入才返回最终结果。

需要注意：理论上的柯里化是每次只传一个参数，但实践中我们通常实现的是"灵活柯里化"——可以一次传多个参数也可以分多次传，只要参数够了就执行。

## 柯里化带来的好处

为什么要这么"绕"地调用函数？柯里化有几个非常实用的价值：

### 1. 参数复用
当某个函数被多次调用，而大部分参数都相同时，柯里化可以帮我们固定那些不变的参数，产生一个更专用的函数。比如我们有个通用的请求函数\`request(method, url, data)\`，可以通过柯里化得到\`get(url)\`、\`post(url, data)\`这样更方便的专用函数。

### 2. 延迟执行
参数没传齐时，函数不会真正执行。我们可以先传一部分参数配置好"要做什么"，等到最后需要结果时再传剩下的参数触发执行。

### 3. 函数组合的基础
柯里化让每个函数都是单参数的，这恰好是函数组合的前提条件。我们后面会看到，函数组合要求被组合的函数都是单参数的，柯里化帮我们实现这一点。

## 通用curry函数实现原理

实现一个通用的curry函数，核心思路是：
1. 记录原函数需要的参数个数（\`fn.length\`）
2. 返回一个柯里化后的函数
3. 每次调用时，把参数收集起来
4. 如果收集到的参数数量 >= 原函数需要的数量，就执行原函数
5. 否则返回一个新函数继续收集参数

这个实现利用了闭包来保存已经传入的参数列表。

## 函数组合（Compose/Pipe）

如果说柯里化是用来"预处理函数"，那**函数组合（Function Composition）**就是用来"组装函数"。

函数组合的思想来自数学：在数学中，如果有\`f(x)\`和\`g(x)\`两个函数，那么\`(f ∘ g)(x) = f(g(x))\`，意思是先用x调用g，把结果传给f。

在编程中，函数组合就是将多个函数**串联起来**，让一个函数的输出作为下一个函数的输入，最终形成一个新的函数。

比如我们想对字符串做一系列处理：先去空格，再转大写，再截断，最后加感叹号。不使用组合时我们会写出层层嵌套的代码：\`exclaim(truncate(toUpperCase(trim(str))))\`。这种写法需要从右往左读，括号多了很容易乱。

使用compose组合后，可以写成：
\`\`\`javascript
const process = compose(exclaim, truncate, toUpperCase, trim);
process(str);
\`\`\`

compose的执行顺序是**从右到左**（和数学一致）。如果你更喜欢从左到右的阅读顺序，可以用pipe函数，它和compose只是执行方向相反。

## Pointfree风格（无点编程）

函数组合带来了一种优雅的编程风格——**Pointfree风格（无点风格/Tacit Programming）**。"Point"这里指的是参数（数据）。Pointfree风格的意思是：函数组合过程中，**永远不提到要操作的数据**，只关注怎样组合函数。

比如：
\`\`\`javascript
// 不是pointfree：提到了str这个数据
const process = str => exclaim(truncate(toUpperCase(trim(str))));

// pointfree：没有提到数据，只是组合函数
const process = compose(exclaim, truncate, toUpperCase, trim);
\`\`\`

Pointfree风格让代码更简洁更声明式，我们不需要关心中间数据是什么样的，只需要描述数据要经过哪些变换。它是函数式编程中非常重要的代码风格。

## 组合的结合律

函数组合满足**结合律（Associativity）**。数学上结合律是指\`f ∘ (g ∘ h) = (f ∘ g) ∘ h\`，也就是说组合的分组不影响最终结果。

这意味着我们可以灵活地把几个函数先组合在一起，再和其他函数组合：
\`\`\`javascript
// 这三种写法结果完全一样
compose(f, g, h)
compose(f, compose(g, h))
compose(compose(f, g), h)
\`\`\`

结合律的实际意义是：我们可以把一些常用的小步骤先组合成"中间件"，再根据需要和其他步骤组合，代码复用非常方便。

柯里化和函数组合是函数式编程的两大核心"武器"。柯里化让函数可以"分步配置"，组合让函数可以"流水线装配"。掌握了这两个技巧，你就能写出非常优雅、声明式、可读性强的函数式代码。
`,
    code: `
// ========== 1. 手动柯里化演示 ==========
console.log('========== 柯里化基础演示 ==========');

// 普通函数
function add(a, b, c) {
  return a + b + c;
}

// 手动柯里化版本
function curriedAdd(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

console.log('普通add(1,2,3):', add(1, 2, 3));
console.log('柯里化add(1)(2)(3):', curriedAdd(1)(2)(3));

// 参数复用：固定第一个参数
const add10 = curriedAdd(10);
const add10And20 = add10(20);
console.log('add10(20)(30):', add10And20(30));
console.log('add10(5)(15):', add10(5)(15));

// ========== 2. 通用curry函数实现 ==========
console.log('\\n========== 通用curry函数 ==========');

function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...moreArgs) {
        return curried.apply(this, args.concat(moreArgs));
      };
    }
  };
}

function multiply(a, b, c) {
  return a * b * c;
}

const curriedMultiply = curry(multiply);
console.log('curriedMultiply(2)(3)(4):', curriedMultiply(2)(3)(4));
console.log('curriedMultiply(2, 3)(4):', curriedMultiply(2, 3)(4));
console.log('curriedMultiply(2)(3, 4):', curriedMultiply(2)(3, 4));
console.log('curriedMultiply(2, 3, 4):', curriedMultiply(2, 3, 4));

// ========== 3. 柯里化实际应用：日志函数 ==========
console.log('\\n========== 柯里化应用：日志函数 ==========');

function log(level, module, message) {
  console.log(\`[\${level.toUpperCase()}] [\${module}] \${message}\`);
}

const curriedLog = curry(log);
// 固定级别
const debugLog = curriedLog('debug');
const errorLog = curriedLog('error');
// 固定级别和模块
const authDebug = debugLog('Auth');
const dbError = errorLog('Database');

authDebug('用户登录成功');
authDebug('用户登出');
dbError('连接超时');
dbError('查询失败');

// ========== 4. 柯里化应用：通用请求函数 ==========
console.log('\\n========== 柯里化应用：请求函数 ==========');

function request(method, url, data) {
  return { method, url, data };
}

const curriedRequest = curry(request);
const get = curriedRequest('GET');
const post = curriedRequest('POST');
const getUser = get('/api/user');
const createUser = post('/api/user');

console.log(getUser(null));
console.log(getUser('/api/user/123')(null));
console.log(createUser({ name: '张三' }));

// ========== 5. 实现compose函数(从右到左) ==========
console.log('\\n========== compose函数(右->左) ==========');

function compose(...fns) {
  return function(x) {
    return fns.reduceRight((acc, fn) => fn(acc), x);
  };
}

// 几个纯函数
const trim = str => str.trim();
const toUpperCase = str => str.toUpperCase();
const exclaim = str => str + '!';
const truncate = str => str.length > 10 ? str.slice(0, 10) + '...' : str;

const shout = compose(exclaim, toUpperCase, trim);
console.log(shout('  hello world  '));

const process = compose(exclaim, truncate, toUpperCase, trim);
console.log(process('  functional programming is great  '));

// ========== 6. 实现pipe函数(从左到右) ==========
console.log('\\n========== pipe函数(左->右) ==========');

function pipe(...fns) {
  return function(x) {
    return fns.reduce((acc, fn) => fn(acc), x);
  };
}

const processPipe = pipe(trim, toUpperCase, truncate, exclaim);
console.log(processPipe('  javascript curry  '));

// ========== 7. Pointfree风格演示 ==========
console.log('\\n========== Pointfree风格 ==========');

const cars = [
  { name: 'Toyota', price: 20000, inStock: true },
  { name: 'BMW', price: 50000, inStock: true },
  { name: 'Tesla', price: 40000, inStock: false },
  { name: 'Honda', price: 25000, inStock: true }
];

const prop = curry((key, obj) => obj[key]);
const filter = curry((pred, arr) => arr.filter(pred));
const map = curry((fn, arr) => arr.map(fn));
const sortBy = curry((key, arr) => [...arr].sort((a, b) => a[key] - b[key]));
const isInStock = item => item.inStock;

// Pointfree: 整个管道没提到具体数据
const getInStockCarNames = pipe(
  filter(isInStock),
  sortBy('price'),
  map(prop('name'))
);

console.log('有库存的车(按价格排序):', getInStockCarNames(cars));

// ========== 8. 结合律演示 ==========
console.log('\\n========== 组合的结合律 ==========');

const f = x => x + 1;
const g = x => x * 2;
const h = x => x - 3;

console.log('compose(f,g,h)(5):', compose(f, g, h)(5));
console.log('compose(f, compose(g,h))(5):', compose(f, compose(g, h))(5));
console.log('compose(compose(f,g), h)(5):', compose(compose(f, g), h)(5));

// ========== 9. 实际例子：数字计算管道 ==========
console.log('\\n========== 数字处理管道 ==========');

const double = n => n * 2;
const addOne = n => n + 1;
const square = n => n * n;
const subtractTen = n => n - 10;

const calculate = pipe(
  double,
  addOne,
  square,
  subtractTen
);

console.log('( (5*2)+1 )^2 - 10 =', calculate(5));
`
  },
  {
    id: "n3-closure",
    title: "闭包原理与经典应用",
    icon: "📦",
    group: "第四部分 函数式编程与编程范式",
    content: `
## 闭包的精确定义

闭包（Closure）是JavaScript中最容易被误解但又最重要的概念之一。很多人用了很久JS也说不清楚闭包到底是什么，有些人觉得它很高深，有些人觉得它只是"函数里套函数"。

ECMAScript规范对闭包的定义是：**闭包是函数和声明该函数的词法环境（Lexical Environment）的组合**。

这个定义听起来学术，但拆开来看非常简单：
- **函数**：就是我们写的function
- **词法环境**：就是函数声明时所在的作用域中的所有局部变量

当一个内部函数被其外部函数之外的变量引用时，就形成了一个闭包。这个内部函数"记住"了它出生时的环境，即使外部函数已经执行结束了。

## 闭包的本质：作用域链的保持

要理解闭包，首先要理解JavaScript的作用域规则：

JavaScript采用的是**词法作用域（Lexical Scoping）**（也叫静态作用域）。也就是说，**函数的作用域在函数定义的时候就决定了，而不是在函数调用的时候决定**。函数在哪里定义，它就能访问哪里的变量，和它在哪里被调用无关。

当一个函数执行时，会创建一个执行上下文（Execution Context），其中包含一个作用域链（Scope Chain）。作用域链是一个对象列表，包含了当前活动对象、外层函数的活动对象、直到全局对象。

正常情况下，函数执行完毕后，它的执行上下文和活动对象会被垃圾回收。但是！如果这个函数内部定义了另一个函数，并且这个内部函数被"带到了外面"（作为返回值、传给其他函数等），那么外层函数的活动对象就不会被回收——因为内部函数的作用域链还在引用它。这就是闭包的本质：**外层作用域的变量被内层函数引用，从而在函数执行结束后依然保留在内存中**。

## 闭包的常见误区

关于闭包有几个常见的误区需要澄清：

### 误区1：闭包会导致内存泄漏
这是错误的。闭包本身不是内存泄漏，它是正常的语言特性。内存泄漏是指**你不再需要用到的内存没有被释放**。闭包保存在内存中的变量是你正在使用的（因为内部函数还在引用它们），这是故意的、正确的行为，不是泄漏。真正的内存泄漏是引用了不再需要的变量且没有正确释放引用。

### 误区2：只有return内部函数才算闭包
不对。只要内部函数引用了外层变量，不管内部函数有没有被return、怎么被传出去的，都是闭包。传给setTimeout的回调、事件监听器、数组方法的回调，只要引用了外层变量，都是闭包。

### 误区3：闭包拷贝了外部变量的值
不对。闭包是**引用**外部变量，不是拷贝。也就是说，闭包拿到的是变量本身，而不是变量在某个时刻的快照。这也是为什么循环中使用var会出现著名的"闭包陷阱"——所有闭包引用的是同一个循环变量。

## 闭包的经典应用

闭包不是什么花里胡哨的语法糖，它在实际开发中无处不在。

### 1. 模块模式（Module Pattern）
在ES6模块出现之前，JavaScript没有原生的模块化机制。开发者们利用闭包实现了模块模式：用一个立即执行函数创建私有作用域，只返回暴露给外部的公共API，私有变量和方法被闭包保护起来，外部无法访问。

### 2. 数据私有化/封装
JavaScript（在class的private字段出现之前）没有真正的私有变量。利用闭包，我们可以实现真正的私有数据——只有通过闭包暴露的方法才能访问，外部无法直接读取或修改。

### 3. 函数工厂
函数工厂就是"生产函数的函数"。外层函数接收配置参数，返回一个定制化的新函数，新函数通过闭包记住配置参数。我们之前讲的柯里化、偏应用、once、memoize本质上都是函数工厂，都依赖闭包。

### 4. 循环中的闭包陷阱
这是面试最常考的点：在for循环中用var声明变量，然后给异步回调或事件处理器使用，结果所有回调拿到的都是循环结束后的最终值。这是因为var没有块级作用域，所有闭包共享同一个变量。解决方案有三个：用let替代var、用IIFE创建立即作用域捕获每次循环的值、用forEach创建作用域。

## 立即执行函数表达式（IIFE）

**IIFE（Immediately Invoked Function Expression）**是一个在定义时就会立即执行的函数：\`(function(){ ... })()\`。

IIFE的核心作用是**创建一个独立的函数作用域**，避免变量污染全局命名空间。在ES6的let/const块级作用域出现之前，IIFE是创建局部作用域的唯一方式。在模块模式中，IIFE也是最外层的"容器"。

IIFE配合闭包，构成了JavaScript模块化的基石。

理解闭包不是一蹴而就的，但只要你抓住"词法作用域+引用保持"这两个关键点，再配合实际代码多写多练，慢慢就能体会到它的精妙之处。闭包不是JS的"附加功能"，而是基于词法作用域的必然结果，是函数作为一等公民的自然体现。
`,
    code: `
// ========== 1. 最基础的闭包 ==========
console.log('========== 基础闭包演示 ==========');

function makeCounter() {
  let count = 0;
  return function() {
    count++;
    return count;
  };
}

const counter = makeCounter();
console.log('counter():', counter());
console.log('counter():', counter());
console.log('counter():', counter());

// 每个闭包是独立的，有自己的count
const counter2 = makeCounter();
console.log('counter2():', counter2());
console.log('counter():', counter());

// ========== 2. 模块模式(经典) ==========
console.log('\\n========== 模块模式 ==========');

const calculator = (function() {
  let result = 0;

  function add(n) {
    result += n;
    return this;
  }

  function subtract(n) {
    result -= n;
    return this;
  }

  function multiply(n) {
    result *= n;
    return this;
  }

  function getResult() {
    return result;
  }

  function reset() {
    result = 0;
    return this;
  }

  return { add, subtract, multiply, getResult, reset };
})();

console.log('链式调用: 0 + 10 - 3 * 2 =',
  calculator.add(10).subtract(3).multiply(2).getResult());
calculator.reset();
console.log('重置后:', calculator.getResult());
// console.log(calculator.result);  无法直接访问私有变量result

// ========== 3. 用闭包封装真正的私有变量 ==========
console.log('\\n========== 私有变量封装 ==========');

function createPerson(name, age) {
  let _name = name;
  let _age = age;

  return {
    getName() { return _name; },
    getAge() { return _age; },
    setName(newName) {
      if (typeof newName === 'string' && newName.length > 0) {
        _name = newName;
      }
    },
    setAge(newAge) {
      if (typeof newAge === 'number' && newAge >= 0 && newAge < 150) {
        _age = newAge;
      }
    },
    greet() {
      return \`我是\${_name}，今年\${_age}岁\`;
    }
  };
}

const person = createPerson('小明', 20);
console.log(person.greet());
person.setAge(25);
person.setName('大明');
console.log(person.greet());
person.setAge(-5);
person.setAge(200);
console.log('非法年龄设置被忽略，当前:', person.getAge());
// person._name 无法直接访问私有变量

// ========== 4. 函数工厂 ==========
console.log('\\n========== 函数工厂 ==========');

function makeMultiplier(factor) {
  return function(n) {
    return n * factor;
  };
}

const double = makeMultiplier(2);
const triple = makeMultiplier(3);
const tenTimes = makeMultiplier(10);
console.log('double(5):', double(5));
console.log('triple(5):', triple(5));
console.log('tenTimes(5):', tenTimes(5));

// 幂函数工厂
function makePower(exponent) {
  return function(base) {
    return Math.pow(base, exponent);
  };
}
const square = makePower(2);
const cube = makePower(3);
const sqrt = makePower(0.5);
console.log('square(4):', square(4));
console.log('cube(3):', cube(3));
console.log('sqrt(16):', sqrt(16));

// ========== 5. 循环闭包陷阱：var的问题 ==========
console.log('\\n========== 循环闭包陷阱(var vs let) ==========');

console.log('--- 使用var(出问题) ---');
function varLoop() {
  const funcs = [];
  for (var i = 0; i < 3; i++) {
    funcs.push(function() {
      console.log('var i =', i);
    });
  }
  funcs.forEach(f => f());
}
varLoop();

console.log('--- 使用let(正确) ---');
function letLoop() {
  const funcs = [];
  for (let i = 0; i < 3; i++) {
    funcs.push(function() {
      console.log('let i =', i);
    });
  }
  funcs.forEach(f => f());
}
letLoop();

console.log('--- 使用IIFE解决var问题 ---');
function iifeLoop() {
  const funcs = [];
  for (var i = 0; i < 3; i++) {
    (function(j) {
      funcs.push(function() {
        console.log('IIFE j =', j);
      });
    })(i);
  }
  funcs.forEach(f => f());
}
iifeLoop();

// ========== 6. 闭包实现缓存/记忆 ==========
console.log('\\n========== 闭包实现缓存 ==========');

function createCache() {
  const store = {};
  return {
    set(key, value) {
      store[key] = value;
    },
    get(key) {
      return store[key];
    },
    has(key) {
      return key in store;
    },
    remove(key) {
      delete store[key];
    },
    size() {
      return Object.keys(store).length;
    }
  };
}

const cache = createCache();
cache.set('name', '张三');
cache.set('age', 25);
console.log('cache.get("name"):', cache.get('name'));
console.log('cache.size():', cache.size());
console.log('cache.has("age"):', cache.has('age'));
cache.remove('age');
console.log('remove后cache.has("age"):', cache.has('age'));

// ========== 7. 事件处理器中的闭包 ==========
console.log('\\n========== 闭包应用：事件处理器(模拟) ==========');

function createButtonHandler(buttonId) {
  let clickCount = 0;
  return function handleClick() {
    clickCount++;
    console.log(\`按钮\${buttonId}被点击了\${clickCount}次\`);
  };
}

const btn1Handler = createButtonHandler('#btn1');
const btn2Handler = createButtonHandler('#btn2');
btn1Handler();
btn1Handler();
btn2Handler();
btn1Handler();
btn2Handler();

// ========== 8. 闭包与柯里化/偏应用的关系 ==========
console.log('\\n========== 闭包是柯里化的基础 ==========');

function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

function greet(greeting, name) {
  return \`\${greeting}, \${name}!\`;
}

const sayHello = partial(greet, 'Hello');
const sayHi = partial(greet, 'Hi');
console.log(sayHello('Alice'));
console.log(sayHi('Bob'));
`
  },
  {
    id: "n3-recursion",
    title: "递归与尾递归优化",
    icon: "🔁",
    group: "第四部分 函数式编程与编程范式",
    content: `
## 什么是递归

递归（Recursion）是一种编程技巧：**函数直接或间接地调用自身**来解决问题。

一个问题可以用递归来解决，通常需要满足两个条件：
1. **子问题和原问题结构相同**，只是规模更小
2. **存在最简单的情况（基准条件）**，不需要继续递归就能直接得出答案

很多人初学递归时觉得它"烧脑"，因为递归的思维方式和我们日常习惯的"迭代式思考"不太一样。但实际上递归非常符合数学定义，很多数学公式本身就是递归的——比如阶乘、斐波那契数列。

## 递归三要素

写出正确的递归函数需要明确三个要素：

1. **基准条件（Base Case）**：什么时候停止递归？这是递归的"出口"，必须存在，否则会无限递归直到栈溢出。
2. **递归推进（Recursive Case）**：怎样把原问题分解成规模更小的子问题？
3. **收敛到基准**：每次递归调用必须让问题规模朝基准条件靠近，不能原地踏步或越变越大。

拿阶乘举例：
- 基准条件：\`0! = 1\`、\`1! = 1\`
- 递归推进：\`n! = n * (n-1)!\`
- 收敛性：每次递归n减1，最终会到达1

## 递归的调用栈与栈溢出

递归虽然优雅，但有一个问题：**每次函数调用都会在调用栈（Call Stack）上压入一个新的栈帧（Stack Frame）**，保存函数的参数、局部变量、返回地址等信息。

如果递归深度太大，调用栈会被撑满，抛出\`RangeError: Maximum call stack size exceeded\`（栈溢出错误）。JavaScript引擎对调用栈的深度是有限制的，通常在几千到一万多层左右（不同浏览器/JS引擎不同）。

比如用递归求10000的阶乘，大概率会栈溢出，因为需要10000层递归调用。

除了栈溢出，普通递归还有一个问题：**重复计算**。最典型的是朴素递归版斐波那契，\`fib(n)\`会调用\`fib(n-1)\`和\`fib(n-2)\`，很多子问题被重复计算了成千上万次，时间复杂度是O(2^n)，n=40以上就很慢了。

## 什么是尾递归

那递归有没有办法避免栈溢出呢？答案是**尾递归（Tail Recursion）**。

尾递归的定义：**递归调用是函数体中最后执行的操作，并且递归调用的返回值直接被当前函数返回，不需要额外的计算**。换句话说，递归调用在尾部，调用完就完事了，不需要保留当前栈帧——因为不需要再用当前栈帧里的任何数据了。

用阶乘举例：
- 普通递归：\`fact(n) = n * fact(n-1)\`——递归调用回来后还要和n相乘，必须保留栈帧
- 尾递归：\`fact(n, acc = 1) = fact(n-1, n * acc)\`——递归调用是最后一步，不需要做别的了，不需要保留旧栈帧

## 尾递归优化（TCO）

既然尾递归调用后旧栈帧没用了，聪明的编译器/解释器就可以做**尾递归优化（Tail Call Optimization, TCO）**：**不保留旧栈帧，直接用新的栈帧覆盖旧的栈帧**，这样不管递归多少层，调用栈深度始终是1，永远不会栈溢出！

这本质上是把递归"编译"成了循环，递归变成了跳转，没有任何栈增长。

ES6规范明确要求引擎实现尾调用优化（PTC，Proper Tail Calls），但现实情况是：
- **Safari（JavaScriptCore引擎）**：支持尾递归优化
- **Chrome/V8、Node.js**：曾经实现过但后来移除了，原因包括调试困难、栈追踪信息丢失、和V8的优化架构冲突等问题
- **Firefox（SpiderMonkey）**：也没有实现

所以在实际开发中，你不能依赖JS引擎自动做尾递归优化。

## 非尾递归转尾递归：累加器模式

怎么把普通递归改成尾递归？最常用的方法是**累加器模式（Accumulator Pattern）**：

给递归函数增加一个"累加器"参数，用来保存中间结果，让递归调用时直接传递更新后的累加器，最后在基准条件返回累加器的值。这样每一步的结果都在累加器里，不需要递归回来再做计算。

## Trampoline（蹦床函数）

既然JS引擎不自动做TCO，我们自己来实现！**Trampoline（蹦床函数）**就是一种在不支持TCO的环境中解决栈溢出的技术。

蹦床函数的思路是：
1. 把尾递归函数改成返回一个**thunk**（另一个函数，包装了下一步的调用），而不是直接递归调用
2. 用一个循环不断执行thunk，直到返回的不是函数而是最终值
3. 整个过程在循环中完成，调用栈深度始终是1

这就像"蹦床"一样：每弹一下（执行一个函数），落地（返回），再弹一下（执行下一个），而不是一直往栈上叠。

## 递归 vs 迭代

递归和迭代（循环）是可以相互转换的：
- 递归：代码简洁优雅，符合数学定义，但有栈溢出和性能开销
- 迭代：性能好，没有栈溢出，但某些问题（树、图遍历、分治）写起来不如递归直观

实践中的建议：
- 深度不大的递归（比如DOM树遍历、深拷贝、简单的分治）：放心用递归，代码好读
- 深度可能很大（比如递归深度超过1000）：要么改成迭代，要么用trampoline
- 有大量重复子问题的递归：用记忆化（memoize）缓存结果

尾递归和蹦床是解决递归栈溢出的利器。理解递归不仅能帮你优雅地解决问题，更是学习函数式编程、树和图算法、编译器原理等进阶内容的基础。
`,
    code: `
// ========== 1. 经典递归：阶乘 ==========
console.log('========== 经典递归：阶乘 ==========');

function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

for (let i = 0; i <= 10; i++) {
  console.log(\`\${i}! = \${factorial(i)}\`);
}

// ========== 2. 经典递归：斐波那契 ==========
console.log('\\n========== 斐波那契递归 ==========');

function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

console.log('前10个斐波那契数:');
for (let i = 0; i < 10; i++) {
  console.log('fib(' + i + ') =', fib(i));
}

// ========== 3. 递归实现深拷贝 ==========
console.log('\\n========== 递归深拷贝 ==========');

function deepClone(obj, visited = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (visited.has(obj)) return visited.get(obj);

  const clone = Array.isArray(obj) ? [] : {};
  visited.set(obj, clone);

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], visited);
    }
  }
  return clone;
}

const obj = {
  a: 1,
  b: { c: 2, d: [3, 4, { e: 5 }] },
  f: null
};
obj.self = obj;

const cloned = deepClone(obj);
console.log('深拷贝结果:', cloned.b.d[2]);
console.log('是不同对象:', obj !== cloned);
console.log('b是不同对象:', obj.b !== cloned.b);
console.log('循环引用处理:', cloned.self === cloned);

// ========== 4. 递归数组扁平化 ==========
console.log('\\n========== 递归数组扁平化 ==========');

function flatten(arr) {
  let result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result = result.concat(flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}

const nested = [1, [2, 3, [4, 5, [6]]], 7, [8, [9]]];
console.log('扁平化:', flatten(nested));

// 指定深度扁平化
function flattenDepth(arr, depth = 1) {
  if (depth < 1) return arr.slice();
  let result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result = result.concat(flattenDepth(item, depth - 1));
    } else {
      result.push(item);
    }
  }
  return result;
}

console.log('flatten 1层:', flattenDepth(nested, 1));
console.log('flatten 2层:', flattenDepth(nested, 2));

// ========== 5. 尾递归版阶乘 ==========
console.log('\\n========== 尾递归阶乘 ==========');

function factorialTail(n, acc = 1) {
  if (n <= 1) return acc;
  return factorialTail(n - 1, n * acc);
}

for (let i = 0; i <= 10; i++) {
  console.log(\`\${i}! = \${factorialTail(i)}\`);
}

// ========== 6. 尾递归版斐波那契 ==========
console.log('\\n========== 尾递归斐波那契 ==========');

function fibTail(n, a = 0, b = 1) {
  if (n === 0) return a;
  return fibTail(n - 1, b, a + b);
}

for (let i = 0; i < 15; i++) {
  console.log('fibTail(' + i + ') =', fibTail(i));
}

// 对比性能：普通递归fib(40) vs 尾递归fib(40)
console.log('\\n--- fib性能对比(fib(40)) ---');
console.time('普通fib(40)');
const r1 = fib(40);
console.timeEnd('普通fib(40)');

console.time('尾递归fib(40)');
const r2 = fibTail(40);
console.timeEnd('尾递归fib(40)');
console.log('结果一致:', r1 === r2);

// ========== 7. Trampoline蹦床函数解决栈溢出 ==========
console.log('\\n========== Trampoline解决栈溢出 ==========');

function trampoline(fn) {
  return function(...args) {
    let result = fn.apply(this, args);
    while (typeof result === 'function') {
      result = result();
    }
    return result;
  };
}

// 用thunk改写尾递归
function factThunk(n, acc = 1) {
  if (n <= 1) return acc;
  return () => factThunk(n - 1, n * acc);
}

const safeFact = trampoline(factThunk);
console.log('trampoline版10! =', safeFact(10));
console.log('trampoline版100! =', safeFact(100));
console.log('trampoline版10000! 不会栈溢出，数字长度:',
  safeFact(10000).toString().length);

// fib trampoline
function fibThunk(n, a = 0, b = 1) {
  if (n === 0) return a;
  return () => fibThunk(n - 1, b, a + b);
}
const safeFib = trampoline(fibThunk);
console.log('trampoline版fib(1000) =', safeFib(1000).toString().slice(0, 30) + '...');

// ========== 8. 递归和迭代相互转换 ==========
console.log('\\n========== 迭代版 vs 递归版对比 ==========');

// 迭代版阶乘
function factorialIter(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// 迭代版斐波那契
function fibIter(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

console.log('迭代版阶乘10! =', factorialIter(10));
console.log('迭代版fib(40) =', fibIter(40));

// ========== 9. 经典递归：汉诺塔 ==========
console.log('\\n========== 汉诺塔递归 ==========');

function hanoi(n, from, to, aux, moves = []) {
  if (n === 1) {
    moves.push(\`移动盘子1: \${from} -> \${to}\`);
    return moves;
  }
  hanoi(n - 1, from, aux, to, moves);
  moves.push(\`移动盘子\${n}: \${from} -> \${to}\`);
  hanoi(n - 1, aux, to, from, moves);
  return moves;
}

const moves = hanoi(3, 'A', 'C', 'B');
console.log('3层汉诺塔步骤(' + moves.length + '步):');
moves.forEach((m, i) => console.log(\`  \${i+1}. \${m}\`));
console.log('4层汉诺塔需要:', hanoi(4, 'A', 'C', 'B').length, '步');
`
  },
  {
    id: "n3-functor-monad",
    title: "函子（Functor）与 Maybe/Either 单子",
    icon: "📮",
    group: "第四部分 函数式编程与编程范式",
    content: `
## 为什么需要函子

在学习函子之前，我们先想一个写代码时经常遇到的问题：**null/undefined检查**。几乎每个稍微复杂点的程序里都充斥着这样的代码：

\`\`\`javascript
const name = user && user.profile && user.profile.name;
\`\`\`

或者处理错误时嵌套的try/catch，或者处理嵌套回调的回调地狱……这些问题的共同点是：我们的值总是"在某个上下文里"——可能是空的上下文、可能是错误的上下文、可能是异步的上下文、可能是多个值的上下文。如果我们直接对值操作，就必须先判断上下文状态，代码很快变得臃肿。

**函子（Functor）**就是为了解决"在上下文中操作值"这个问题而诞生的抽象。它来自范畴论（Category Theory），但我们不需要去啃数学，理解它的实用价值就好。

## 什么是函子

简单说：**函子是一个容器（Container），它包装了一个值，并且实现了map方法，map方法接受一个函数，对容器里的值应用这个函数，返回一个新的同类型函子**。

一个最基础的函子长这样：
\`\`\`javascript
class Container {
  constructor(value) { this.$value = value; }
  static of(value) { return new Container(value); }
  map(f) { return Container.of(f(this.$value)); }
}
\`\`\`

函子需要遵守**函子定律**：
1. **同一律**：\`container.map(x => x)\` === \`container\`（map一个恒等函数不改变容器）
2. **组合律**：\`container.map(x => f(g(x)))\` === \`container.map(g).map(f)\`（可以分步map也可以组合后map）

你发现没有？**Array就是一个函子！** 它包装了多个值，有map方法，map返回新数组，遵守函子定律。Promise其实也是一种函子（它的then在某些层面上类似map）。

函子的核心威力在于：**我们可以在不离开容器的前提下，链式地对值进行一系列变换，容器帮我们处理上下文的特殊逻辑**。不同类型的函子处理不同的上下文。

## Maybe函子：处理空值

**Maybe函子**专门用来处理"值可能是null/undefined"的情况。它有两个子类：
- **Just(x)**：表示有值，包装了非空的值x
- **Nothing**：表示空值、没有值

Maybe的map方法做了一个判断：如果是Nothing，直接返回Nothing（不执行函数）；如果是Just，就对里面的值应用函数。

这样做的效果是什么？我们再也不需要写\`a && a.b && a.b.c\`这样的防御性检查了！如果中间任何一步是null，后面的map都不会执行，最后得到一个Nothing，整个链路是安全的，永远不会出现"Cannot read property of null"错误。

这就是"空安全"的函数式实现。

## Either函子：处理错误

**Either函子**用来处理"可能成功也可能失败"的情况，类似于if-else的右偏版本。它也有两个子类：
- **Right(x)**：表示成功/正确的值，map会对它应用函数
- **Left(x)**：表示失败/错误，map会忽略函数直接传递错误

你会发现Either和try/catch很像，但它是纯的、可组合的：正常流程走Right，一旦出错就变成Left，之后的所有map都跳过，错误信息沿着链条传下去，最后我们在一个地方统一处理错误。

相比try/catch，Either的优势是：
- 错误处理是"一等公民"，可以return、可以传递、可以组合
- 不需要try/catch的语句块，可以和函数组合流畅配合
- 强制你处理错误，不会有未捕获的异常悄悄溜走

## IO函子：惰性执行副作用

**IO函子**用来包裹有副作用的操作（比如读DOM、读文件、打印日志、网络请求）。IO的特点是：**map的时候不执行副作用，只是把函数组合起来，最后调用一个特殊方法（比如run/unsafePerformIO）才真正执行**。

这叫做"惰性执行"——我们把"要做什么副作用"描述成一个纯的组合，而不是立刻执行。这样副作用被推到了程序的最边缘，核心逻辑依然是纯函数。

## Monad单子：解决嵌套问题

函子的map有一个问题：如果你的映射函数返回的也是一个函子，map之后就会出现嵌套——比如\`Maybe.of(1).map(x => Maybe.of(x+1))\`结果是\`Maybe(Maybe(2))\`，用起来很不方便。

**Monad（单子）**就是实现了\`flatMap/chain/join\`方法的函子。chain和map类似，但它期望映射函数返回一个函子，然后chain会把外层的嵌套"拍平"（join），得到单层的函子而不是嵌套的。

Promise的then其实就是chain：你在then里return一个Promise，不会得到Promise嵌套Promise，而是会自动"展开"。这就是为什么说Promise本质上就是一种Monad（虽然它不完全符合数学定律，但思想是一致的）。

函子和Monad听起来抽象，但它们的实用价值非常高。Maybe帮你消灭null检查，Either帮你优雅处理错误，IO帮你隔离副作用。这些思想已经被React、Redux、RxJS等主流库广泛采用，理解它们能让你写出更健壮、更易组合的代码。记住：不要怕名词，看代码就懂了。
`,
    code: `
const assert = require('assert');

// ========== 1. 基础Container函子 ==========
console.log('========== 基础Container函子 ==========');

class Container {
  constructor(value) {
    this.$value = value;
  }

  static of(value) {
    return new Container(value);
  }

  map(fn) {
    return Container.of(fn(this.$value));
  }

  inspect() {
    return \`Container(\${JSON.stringify(this.$value)})\`;
  }
}

const c = Container.of(5)
  .map(x => x + 2)
  .map(x => x * 3);
console.log('Container链式操作:', c.inspect());

// 验证函子定律: 同一律
const c1 = Container.of(42);
const c2 = c1.map(x => x);
assert.strictEqual(c1.$value, c2.$value);
console.log('同一律成立');

// 组合律
const f = x => x + 1;
const g = x => x * 2;
const leftSide = Container.of(5).map(x => f(g(x)));
const rightSide = Container.of(5).map(g).map(f);
assert.strictEqual(leftSide.$value, rightSide.$value);
console.log('组合律成立');

// ========== 2. Maybe函子 ==========
console.log('\\n========== Maybe函子(空安全) ==========');

class Maybe {
  static of(value) {
    return value === null || value === undefined
      ? Nothing.of()
      : Just.of(value);
  }
}

class Just extends Maybe {
  constructor(value) {
    super();
    this.$value = value;
  }

  static of(value) {
    return new Just(value);
  }

  map(fn) {
    return Maybe.of(fn(this.$value));
  }

  chain(fn) {
    return fn(this.$value);
  }

  getOrElse(defaultValue) {
    return this.$value;
  }

  isNothing() { return false; }

  inspect() { return \`Just(\${this.$value})\`; }
}

class Nothing extends Maybe {
  static of() {
    return new Nothing();
  }

  map(fn) {
    return this;
  }

  chain(fn) {
    return this;
  }

  getOrElse(defaultValue) {
    return defaultValue;
  }

  isNothing() { return true; }

  inspect() { return 'Nothing'; }
}

// 安全访问嵌套属性
const user1 = { profile: { name: '张三', address: { city: '北京' } } };
const user2 = { profile: null };
const user3 = null;

function safeGetCity(user) {
  return Maybe.of(user)
    .map(u => u.profile)
    .map(p => p.address)
    .map(a => a.city)
    .getOrElse('未知城市');
}

console.log('user1城市:', safeGetCity(user1));
console.log('user2城市:', safeGetCity(user2));
console.log('user3城市:', safeGetCity(user3));

// ========== 3. 用Maybe做安全的数值运算 ==========
console.log('\\n========== Maybe安全数值运算 ==========');

function safeDivide(a, b) {
  return b === 0 ? Nothing.of() : Just.of(a / b);
}

function safeParseInt(str) {
  const n = parseInt(str, 10);
  return isNaN(n) ? Nothing.of() : Just.of(n);
}

const parseAndDivide = (aStr, bStr) =>
  safeParseInt(aStr)
    .chain(a => safeParseInt(bStr).chain(b => safeDivide(a, b)))
    .getOrElse('计算错误');

console.log('"10" / "2" =', parseAndDivide('10', '2'));
console.log('"10" / "0" =', parseAndDivide('10', '0'));
console.log('"abc" / "2" =', parseAndDivide('abc', '2'));

// ========== 4. Either函子 ==========
console.log('\\n========== Either函子(错误处理) ==========');

class Either {
  static of(value) {
    return Right.of(value);
  }
}

class Left extends Either {
  constructor(value) {
    super();
    this.$value = value;
  }

  static of(value) {
    return new Left(value);
  }

  map(fn) {
    return this;
  }

  chain(fn) {
    return this;
  }

  getOrElse(defaultValue) {
    return defaultValue;
  }

  fold(leftFn, rightFn) {
    return leftFn(this.$value);
  }

  inspect() { return \`Left(\${this.$value})\`; }
}

class Right extends Either {
  constructor(value) {
    super();
    this.$value = value;
  }

  static of(value) {
    return new Right(value);
  }

  map(fn) {
    return Right.of(fn(this.$value));
  }

  chain(fn) {
    return fn(this.$value);
  }

  getOrElse(defaultValue) {
    return this.$value;
  }

  fold(leftFn, rightFn) {
    return rightFn(this.$value);
  }

  inspect() { return \`Right(\${this.$value})\`; }
}

// 用Either做表单验证
function validateUsername(username) {
  if (!username || username.length < 3) {
    return Left.of('用户名至少3个字符');
  }
  return Right.of(username);
}

function validateAge(age) {
  if (typeof age !== 'number' || age < 18) {
    return Left.of('年龄必须大于等于18');
  }
  return Right.of(age);
}

function validateEmail(email) {
  if (!email || !email.includes('@')) {
    return Left.of('邮箱格式不正确');
  }
  return Right.of(email);
}

function registerUser({ username, age, email }) {
  return validateUsername(username)
    .chain(name => validateAge(age)
      .chain(a => validateEmail(email)
        .map(e => ({ name: name, age: a, email: e }))
      )
    )
    .fold(
      error => \`注册失败: \${error}\`,
      user => \`注册成功! 欢迎\${user.name}\`
    );
}

console.log(registerUser({ username: 'ab', age: 25, email: 'a@b.com' }));
console.log(registerUser({ username: 'alice', age: 16, email: 'a@b.com' }));
console.log(registerUser({ username: 'alice', age: 25, email: 'invalid' }));
console.log(registerUser({ username: 'alice', age: 25, email: 'a@b.com' }));

// ========== 5. 对比try/catch与Either ==========
console.log('\\n========== try/catch vs Either ==========');

function tryCatch(fn) {
  try {
    return Right.of(fn());
  } catch (e) {
    return Left.of(e.message);
  }
}

const parseJSON = (str) => tryCatch(() => JSON.parse(str));

const results = [
  parseJSON('{"name":"张三"}'),
  parseJSON('invalid json'),
  parseJSON('[1,2,3]')
];
results.forEach((r, i) => {
  r.fold(
    err => console.log(\`JSON\${i+1}解析失败:\`, err),
    data => console.log(\`JSON\${i+1}解析成功:\`, data)
  );
});

// ========== 6. IO函子(惰性执行) ==========
console.log('\\n========== IO函子 ==========');

class IO {
  constructor(effect) {
    this.$value = effect;
  }

  static of(value) {
    return new IO(() => value);
  }

  map(fn) {
    return new IO(() => fn(this.$value()));
  }

  chain(fn) {
    return new IO(() => fn(this.$value()).$value());
  }

  run() {
    return this.$value();
  }
}

// 纯函数逻辑构建IO操作链
const ioOperation = IO.of('  Hello World  ')
  .map(s => s.trim())
  .map(s => s.toUpperCase())
  .map(s => \`处理结果: [\${s}]\`);

// 真正执行（副作用边界）
console.log('IO运行结果:', ioOperation.run());

// ========== 7. 验证Array也是函子 ==========
console.log('\\n========== Array是函子 ==========');

const arr = [1, 2, 3];
// 同一律
assert.deepStrictEqual(arr.map(x => x), arr);
console.log('Array同一律成立');
// 组合律
const arrLeft = arr.map(x => f(g(x)));
const arrRight = arr.map(g).map(f);
assert.deepStrictEqual(arrLeft, arrRight);
console.log('Array组合律成立');
console.log('Array map链式:', arr.map(x => x * 2).map(x => x + 1));

console.log('\\n========== 总结 ==========');
console.log('Functor: 有map的容器，在上下文中变换值');
console.log('Maybe: 处理null/undefined，消灭空指针');
console.log('Either: 处理错误，替代try/catch');
console.log('Monad: 有chain/flatMap，解决嵌套问题');
`
  },
  {
    id: "n3-oop-vs-fp",
    title: "面向对象 vs 函数式：两种编程范式对比",
    icon: "⚔️",
    group: "第四部分 函数式编程与编程范式",
    content: `
## 编程范式是什么

编程范式（Programming Paradigm）是看待和解决问题的思维方式和风格。就像物理学中你可以用牛顿力学或者量子力学看世界，编程中也有不同的范式。不同的范式没有绝对的好坏，只是适合不同的场景和问题。

JavaScript是一门非常特殊的语言——它是**多范式语言**，同时很好地支持面向对象编程（OOP）和函数式编程（FP），也支持过程式编程。作为JS开发者，理解两种主流范式的核心思想和优劣，能让你在不同场景下选择最合适的武器。

## 面向对象编程（OOP）核心思想

面向对象编程把程序看作是一组相互协作的**对象**。对象把**数据（属性）**和**行为（方法）**封装在一起，代表现实世界或抽象概念中的一个实体。

OOP有四大支柱：

1. **封装（Encapsulation）**：把数据和操作数据的方法捆绑在一起，通过访问控制隐藏内部细节，只暴露公共接口。对象内部怎么实现的，外部不需要知道。

2. **继承（Inheritance）**：子类可以继承父类的属性和方法，实现代码复用。通过继承可以形成类的层次结构，从一般到特殊。

3. **多态（Polymorphism）**：同一个接口可以有不同的实现。不同对象可以响应同一个消息，但表现出不同的行为。比如同样是\`shape.area()\`，圆形和矩形计算面积的方式不同。

4. **抽象（Abstraction）**：只展示对象的必要特征，隐藏不必要的细节。通过抽象类和接口定义"能做什么"，而不关心"怎么做"。

OOP的思维方式是："这个系统里有哪些对象？它们各自有什么属性和行为？它们之间怎么交互？"它非常贴近人类对现实世界的认知——世界是由一个个"东西"组成的，每个东西有自己的状态和能做的事。

## 函数式编程（FP）核心思想

函数式编程把计算看作是**数学函数的求值**，核心是避免可变状态和副作用，用函数的组合来构建程序。

FP的核心原则：

1. **纯函数（Pure Function）**：相同输入永远产生相同输出，且没有任何副作用（不修改外部状态、不打印、不请求网络、不读写DOM等）。纯函数像数学函数一样可预测。

2. **不可变数据（Immutable Data）**：数据一旦创建就不能被修改，修改时总是产生新的数据副本。这避免了共享状态带来的bug。

3. **函数组合（Function Composition）**：通过把简单的纯函数组合起来构建复杂逻辑，而不是通过继承和方法调用。

4. **声明式（Declarative）**：描述"做什么"而不是"怎么做"。你告诉程序想要什么结果，而不是一步步写怎么得到那个结果。SQL就是典型的声明式。

5. **避免共享状态和副作用**：副作用被推到程序的最边缘（IO边界），核心逻辑保持纯粹。

FP的思维方式是："数据要经过哪些变换？怎么把这些变换组合起来？"它把数据和行为分离——数据是简单的数据结构，行为是操作数据的纯函数。

## OOP的优缺点

**OOP的优点**：
- 容易理解和学习，符合人类直觉（物体+动作）
- 封装和访问控制让代码组织清晰
- 继承和多态在建模"是什么"的层级关系时很自然（动物→猫→橘猫）
- 状态管理相对直观，对象自己管理自己的状态
- 有大量成熟的设计模式支持

**OOP的缺点**：
- **this问题**：JS中的this绑定规则复杂，容易出错
- **共享可变状态**：对象的状态可以被任意修改，多线程/并发环境下容易出问题（虽然JS单线程，但异步回调中共享状态也会产生竞态条件）
- **继承的问题**：类继承是强耦合的，"继承来的东西里有你不想要的"，深继承层次难维护（组合优于继承是OOP圈子内部也认可的原则）
- **副作用难以追踪**：方法可以随意修改内部状态，一个方法调用可能改变了很多东西
- **测试需要mock**：因为依赖对象和状态，测试经常需要构造mock对象

## FP的优缺点

**FP的优点**：
- **可测试性极强**：纯函数只依赖输入输出，不需要mock，测试只需要给定输入断言输出
- **可缓存**：相同输入相同输出，可以做记忆化缓存
- **无副作用导致的bug**：不可变数据避免了意外修改
- **并发友好**：没有共享可变状态，天然适合并行计算
- **代码更简洁声明式**：组合+链式调用读起来像描述问题本身
- **时间旅行调试**：因为数据不可变，可以保留每次状态快照

**FP的缺点**：
- **学习曲线陡峭**：函子、单子、柯里化、pointfree等概念对新手不友好
- **性能开销**：不可变数据意味着频繁创建新对象（虽然有持久化数据结构优化，但仍有开销）
- **过度抽象**：过度使用pointfree和抽象会让代码难读，不如直白的循环好懂
- **现实世界有副作用**：程序终归要和外部世界交互，FP需要把IO推到边界，增加了架构复杂度
- **递归性能**：依赖递归而非循环，JS尾递归优化支持不佳

## 实战中如何选择和混合使用

好消息是你不需要二选一！JavaScript让你可以自由混合两种范式，取各自所长：

**OOP更适合的场景**：
- 有明确实体概念的建模（用户、订单、UI组件）
- 需要维护和管理内部状态的对象（游戏角色、数据库连接）
- 需要封装生命周期和资源管理的场景
- 团队新手较多时，OOP相对更直观

**FP更适合的场景**：
- 数据处理和转换（数组操作、管道处理）
- 工具函数、通用逻辑
- 状态管理（Redux就是FP思想的产物）
- 并发/异步流程控制
- 需要高可测试性的核心业务逻辑

**混合使用的最佳实践**：
- 用OOP组织大的模块和组件边界，用FP写内部的数据处理逻辑
- 类的方法尽量写成纯函数，避免隐式修改状态
- 用不可变数据方式更新对象状态（展开运算符而非直接修改）
- 用函数组合代替过深的类继承层次
- 在合适的地方用class，在合适的地方用纯函数，不要教条

记住：范式是工具不是宗教。写代码的目的是解决问题、让代码可读可维护，而不是追求"纯粹"。
`,
    code: `
// ========== 1. OOP风格：购物车实现 ==========
console.log('========== 面向对象风格实现购物车 ==========');

class ShoppingCartOOP {
  constructor() {
    this.items = [];
    this.discountRate = 0;
    this.shippingFee = 10;
    this.freeShippingThreshold = 99;
  }

  addItem(product, quantity = 1) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ ...product, quantity });
    }
    return this;
  }

  removeItem(productId) {
    this.items = this.items.filter(i => i.id !== productId);
    return this;
  }

  applyDiscount(rate) {
    if (rate < 0 || rate > 1) {
      throw new Error('折扣率必须在0-1之间');
    }
    this.discountRate = rate;
    return this;
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  getDiscount() {
    return this.getSubtotal() * this.discountRate;
  }

  getShippingFee() {
    return this.getSubtotal() >= this.freeShippingThreshold ? 0 : this.shippingFee;
  }

  getTotal() {
    return this.getSubtotal() - this.getDiscount() + this.getShippingFee();
  }

  getSummary() {
    return {
      itemCount: this.items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: this.getSubtotal().toFixed(2),
      discount: this.getDiscount().toFixed(2),
      shipping: this.getShippingFee().toFixed(2),
      total: this.getTotal().toFixed(2)
    };
  }
}

const cart1 = new ShoppingCartOOP();
cart1
  .addItem({ id: 1, name: 'JavaScript高级程序设计', price: 89 }, 2)
  .addItem({ id: 2, name: '算法导论', price: 78 }, 1)
  .applyDiscount(0.1);

console.log('OOP购物车:');
console.log(cart1.getSummary());
cart1.addItem({ id: 3, name: 'MacBook', price: 10000 }, 1).applyDiscount(0.2);
console.log('添加电脑并修改折扣后:');
console.log(cart1.getSummary());

// ========== 2. FP风格：购物车实现 ==========
console.log('\\n========== 函数式风格实现购物车 ==========');

function createCart() {
  return { items: [], discountRate: 0 };
}

function addItem(cart, product, quantity = 1) {
  const existing = cart.items.find(i => i.id === product.id);
  const newItems = existing
    ? cart.items.map(i => i.id === product.id
        ? { ...i, quantity: i.quantity + quantity }
        : i)
    : [...cart.items, { ...product, quantity }];
  return { ...cart, items: newItems };
}

function removeItem(cart, productId) {
  return { ...cart, items: cart.items.filter(i => i.id !== productId) };
}

function applyDiscount(cart, rate) {
  if (rate < 0 || rate > 1) throw new Error('折扣率必须在0-1之间');
  return { ...cart, discountRate: rate };
}

const getSubtotal = cart =>
  cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

const getDiscount = cart => getSubtotal(cart) * cart.discountRate;

const SHIPPING_FEE = 10;
const FREE_SHIPPING_THRESHOLD = 99;

const getShippingFee = cart =>
  getSubtotal(cart) >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

const getTotal = cart => getSubtotal(cart) - getDiscount(cart) + getShippingFee(cart);

const getItemCount = cart => cart.items.reduce((sum, i) => sum + i.quantity, 0);

const getSummary = cart => ({
  itemCount: getItemCount(cart),
  subtotal: getSubtotal(cart).toFixed(2),
  discount: getDiscount(cart).toFixed(2),
  shipping: getShippingFee(cart).toFixed(2),
  total: getTotal(cart).toFixed(2)
});

const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

let cart2 = createCart();
cart2 = pipe(
  c => addItem(c, { id: 1, name: 'JavaScript高级程序设计', price: 89 }, 2),
  c => addItem(c, { id: 2, name: '算法导论', price: 78 }, 1),
  c => applyDiscount(c, 0.1)
)(cart2);

console.log('FP购物车(不可变):');
console.log(getSummary(cart2));
console.log('原cart2未被改变，items:', cart2.items.length);

const cart3 = pipe(
  c => addItem(cart2, { id: 3, name: 'MacBook', price: 10000 }, 1),
  c => applyDiscount(c, 0.2)
)();

console.log('新购物车cart3:');
console.log(getSummary(cart3));
console.log('cart2保持不变:');
console.log(getSummary(cart2));

// ========== 3. 可测试性对比 ==========
console.log('\\n========== 可测试性对比 ==========');

// FP纯函数直接测，不需要实例化
const testCart = { items: [{ price: 50, quantity: 2 }], discountRate: 0.1 };
console.log('FP测试: 小计=100, 折扣=10, 包邮, 总计=90');
console.log('实际结果: 小计=', getSubtotal(testCart),
  '折扣=', getDiscount(testCart),
  '运费=', getShippingFee(testCart),
  '总计=', getTotal(testCart));

// OOP需要实例化和setup
const testCartOOP = new ShoppingCartOOP();
testCartOOP.addItem({ id: 1, price: 50 }, 2).applyDiscount(0.1);
console.log('OOP测试结果:', testCartOOP.getSummary());

// ========== 4. 多态OOP示例 ==========
console.log('\\n========== OOP多态: 形状计算面积 ==========');

class Shape {
  area() { throw new Error('子类必须实现area()'); }
  describe() { return \`面积为\${this.area().toFixed(2)}的形状\`; }
}

class Circle extends Shape {
  constructor(radius) { super(); this.radius = radius; }
  area() { return Math.PI * this.radius * this.radius; }
  describe() { return \`半径\${this.radius}的圆，\${super.describe()}\`; }
}

class Rectangle extends Shape {
  constructor(width, height) { super(); this.width = width; this.height = height; }
  area() { return this.width * this.height; }
  describe() { return \`\${this.width}x\${this.height}的矩形，\${super.describe()}\`; }
}

class Triangle extends Shape {
  constructor(base, height) { super(); this.base = base; this.height = height; }
  area() { return 0.5 * this.base * this.height; }
}

const shapes = [new Circle(5), new Rectangle(4, 6), new Triangle(4, 5)];
shapes.forEach(s => console.log(s.describe()));

// ========== 5. FP同样功能用函数实现 ==========
console.log('\\n========== FP风格实现同样功能 ==========');

const circle = r => ({ type: 'circle', radius: r });
const rectangle = (w, h) => ({ type: 'rectangle', width: w, height: h });
const triangle = (b, h) => ({ type: 'triangle', base: b, height: h });

const area = shape => {
  switch (shape.type) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'rectangle': return shape.width * shape.height;
    case 'triangle': return 0.5 * shape.base * shape.height;
  }
};

const describe = shape => {
  const a = area(shape);
  switch (shape.type) {
    case 'circle': return \`半径\${shape.radius}的圆，面积为\${a.toFixed(2)}\`;
    case 'rectangle': return \`\${shape.width}x\${shape.height}的矩形，面积为\${a.toFixed(2)}\`;
    case 'triangle': return \`底\${shape.base}高\${shape.height}的三角形，面积为\${a.toFixed(2)}\`;
  }
};

const shapes2 = [circle(5), rectangle(4, 6), triangle(4, 5)];
shapes2.forEach(s => console.log(describe(s)));

// ========== 6. 混合范式实战 ==========
console.log('\\n========== 混合范式：最佳实践 ==========');

class UserService {
  constructor(db) {
    this.db = db;
  }

  async getUser(id) {
    const user = await this.db.findUser(id);
    return validateUser(user)
      .then(normalizeUser)
      .then(formatUserResponse);
  }
}

// 内部使用FP纯函数
const validateUser = user => {
  if (!user) throw new Error('用户不存在');
  if (!user.email) throw new Error('用户缺少邮箱');
  return user;
};

const normalizeUser = user => ({
  ...user,
  name: (user.name || '').trim(),
  email: user.email.toLowerCase()
});

const formatUserResponse = user => ({
  id: user.id,
  displayName: user.name,
  contact: user.email,
  memberSince: new Date(user.createdAt).getFullYear()
});

console.log('混合范式示例: class封装边界和依赖，内部用纯函数处理数据');
console.log('这是实际项目中最常见的JS风格');

// ========== 7. 不可变更新演示 ==========
console.log('\\n========== 不可变更新(OOP也可以学) ==========');

// 不要这样
const badState = { count: 0, user: { name: 'test' } };
badState.count = 1;  // 直接修改

// 要这样
const goodState1 = { ...badState, count: 1 };
const goodState2 = { ...badState, user: { ...badState.user, name: 'updated' } };
console.log('不可变更新: 原来的', badState);
console.log('不可变更新: 新的', goodState2);
`
  }
];
