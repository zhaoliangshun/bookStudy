export const chapters = [
  {
    id: "n3-intro",
    group: "开篇",
    icon: "🎯",
    title: "为什么要手写源码与学习设计模式",
    content: `# 为什么要手写源码与学习设计模式

欢迎来到《Node.js 源码手写与设计模式实战》！这是一套完全不同的学习路径——我们不仅要"用"Node.js，更要"造"出那些我们每天都在用的核心模块和工具函数。

---

## "会用API"和"理解底层"的区别

很多开发者在学习编程时会陷入一个误区：**API调用者** vs **底层理解者**。

什么是"会用API"？你知道 \`EventEmitter.on()\` 可以监听事件，\`Promise.then()\` 可以处理异步结果，\`[].slice()\` 可以截取数组，遇到问题就查文档、搜Stack Overflow、复制粘贴解决方案。这没有错——这是编程的入门阶段，每个人都要经历。

但当你遇到这些问题时，"会用API"就不够用了：

- 为什么 EventEmitter 的 error 事件如果不监听，整个进程就会崩溃？
- Promise 的链式调用到底是怎么实现的？为什么 then 里面 return 一个值就能传给下一个 then？
- 为什么 \`typeof null === 'object'\` 但 \`null instanceof Object\` 却是 false？
- 防抖和节流到底有什么本质区别？手写的时候为什么要用闭包？
- bind 方法返回的函数，被 new 调用的时候 this 为什么不指向绑定的对象？

这些问题的答案，**文档里不会写，博客里讲不透，只有亲手写一遍源码才能真正理解**。

---

## 手写源码是理解本质最快的方式

编程界有一句名言：**"What I cannot create, I do not understand."**（我不能创造的，我就不能理解。）——理查德·费曼

这句话在编程领域尤其适用。当你能从零开始写出一个 EventEmitter，你就不再是 EventEmitter 的"使用者"，而是它的"创造者"。你会理解：

- 每个方法背后的数据结构是什么？（一个对象存事件名到监听器数组的映射）
- 为什么 once 要用包装函数？（因为要在执行后自动移除，必须保留对原始函数的引用）
- 为什么要设计 newListener 这个特殊事件？（为了让你在监听器被添加时能做一些事情）

手写源码的过程，就像是**拆解然后重新组装一台发动机**。当你把每个零件都摸过一遍，再装回去，你对这台发动机的理解就完全不同了。你知道哪个齿轮负责什么，哪个油路通向哪里，出了问题你能立刻定位到原因。

这不是说你要在工作中自己造轮子——**你不需要自己写EventEmitter，Node.js已经有了**。但理解轮子是怎么造的，能让你：
1. 用轮子的时候更得心应手，知道它的边界在哪
2. 出问题的时候能快速定位，而不是瞎猜
3. 需要定制的时候，知道怎么改
4. 面试的时候从容应对各种原理题

---

## 设计模式是解决通用问题的模板

如果说手写源码是"知其然"，那设计模式就是"知其所以然"。

你写 EventEmitter 的时候，其实就在用**观察者模式**（发布-订阅模式）；你写 Promise 的时候，其实在实践**链式调用模式**和**状态机模式**；你写深拷贝的时候，需要考虑**递归遍历**和**循环引用处理**；你写防抖节流的时候，闭包的本质就是**函数式编程中的状态封装**。

设计模式不是什么高深莫测的东西，它是前人总结出来的、在特定场景下反复验证有效的**代码组织套路**。学习设计模式不是为了背诵23种模式的定义，而是为了：

1. **识别问题**：看到一个场景，能立刻反应过来"这是典型的XX模式场景"
2. **沟通交流**：和同事说"这里用个单例模式吧"，大家都懂是什么意思
3. **避免踩坑**：前人踩过的坑、总结的最佳实践，你不用再踩一遍

本教程会在手写源码的过程中自然而然地引出设计模式——不是先讲模式再套例子，而是**在实现功能的过程中发现模式的必要性**，这样你才能真正理解为什么需要这个模式，它解决了什么问题。

---

## 本教程覆盖的内容

### 第一部分：手写核心模块
这是我们第一批章节要做的事情——从零开始手写那些JavaScript开发者每天都在用但未必理解其原理的东西：
- EventEmitter：发布订阅模式的经典实现
- Promise：异步编程的基石，符合Promises/A+规范
- CancelToken：可取消的异步任务
- 深拷贝：处理循环引用和各种特殊类型
- instanceof 和 new 操作符：原型链的本质
- call/apply/bind：this绑定的三种方式
- 防抖与节流：高频性能优化的利器

### 后续部分预告
- 经典设计模式在JavaScript中的实现（单例、工厂、装饰器、代理、迭代器等）
- 函数式编程核心概念（柯里化、组合、函子、Monad）
- 常用数据结构与算法的JavaScript实现
- 更多Node.js核心模块的手写实现

---

## 学习方法

### 1. 边写边测，不要只看不写
每个章节都配有完整的可运行代码，**一定要亲手敲一遍、运行一遍**。看懂了和写出来了是完全两回事。你可以试着不看答案先自己写，遇到卡壳的地方再看参考实现。

### 2. 对比官方实现
写完之后，去看Node.js官方的源码是怎么实现的。你会发现官方实现考虑了更多边界情况、做了更多性能优化。对比差异的过程就是最好的学习。

### 3. 理解设计决策
每一个API的设计背后都有原因。为什么EventEmitter默认最多10个监听器就要警告？为什么Promise一旦状态改变就不可逆？为什么bind之后的函数被new调用时new的优先级更高？多问几个"为什么"，而不是"是什么"。

### 4. 故意搞破坏
写完之后，试试传入各种奇怪的参数会发生什么？不传参数？传null？传一个已经被移除的监听器去off？好的代码要能优雅地处理边界情况。

准备好了吗？让我们从一个简单的问题开始——当你调用 \`emitter.on('event', handler)\` 的时候，这背后到底发生了什么？
`,
    code: `// ============================================
// 开篇思考：一行代码背后到底隐藏了什么？
// ============================================

const { EventEmitter } = require('events');
const assert = require('assert');

// 这是一行你可能写过无数次的代码：
const emitter = new EventEmitter();

let callCount = 0;
const handler = () => { callCount++; };

emitter.on('greet', handler);
emitter.on('greet', handler); // 重复添加同一个handler
emitter.once('greet', () => console.log('  我是once，只执行一次'));

console.log('当前 greet 事件监听器数量:', emitter.listenerCount('greet'));
console.log('执行 emit...');

emitter.emit('greet');
console.log('第一次emit后，callCount =', callCount);

emitter.emit('greet');
console.log('第二次emit后，callCount =', callCount);
console.log('现在 greet 事件监听器数量:', emitter.listenerCount('greet'));

// 思考：
// 1. 为什么同一个handler重复on不会被去重？（对比一下如果你传的是不同函数）
// 2. once是怎么实现的？它怎么知道执行完要把自己移除？
// 3. 如果我emit一个没有任何监听器的error事件会怎样？
// 4. 如果我想让监听器添加到数组最前面而不是最后面，要怎么办？

console.log('');
console.log('💭 思考问题：');
console.log('   emitter.on() 这短短一行代码，内部做了多少事情？');
console.log('   - 它怎么存储事件名和监听器的对应关系？');
console.log('   - on和addListener是同一个函数吗？');
console.log('   - once的包装函数是怎么和原函数关联起来的？');
console.log('   - 为什么不监听error事件进程会退出？');
console.log('');
console.log('👉 下一章，我们将从零手写一个完整的EventEmitter，');
console.log('   所有这些问题的答案都将浮出水面！');
`
  },
  {
    id: "n3-handwrite-ee",
    group: "第一部分 手写核心模块",
    icon: "📡",
    title: "手写 EventEmitter（完整版）",
    content: `# 手写 EventEmitter（完整版）

EventEmitter 是Node.js事件驱动架构的核心，几乎所有Node.js核心模块都继承自它——流（Stream）、HTTP服务器、文件系统操作，处处都有它的身影。它是**观察者模式**（发布-订阅模式）的经典实现。

今天我们要从零实现一个功能完整的EventEmitter，不仅仅是简单的on和emit，还包括once、prependListener、特殊事件等高级特性。

---

## 核心数据结构

EventEmitter的本质是什么？非常简单——**一个对象，key是事件名，value是监听器函数的数组**。

\`\`\`
{
  "event1": [fn1, fn2, fn3],
  "event2": [fnA, fnB]
}
\`\`\`

就这么简单。所有方法都是围绕这个数据结构做增删改查。

---

## 方法逐个解析

### 1. constructor 构造函数

初始化 \`this._events\` 这个存储对象。为什么用 \`_events\`？因为官方Node.js就是这么命名的，以 _ 开头表示是内部属性。

还需要考虑一个细节：如果一个类继承自EventEmitter，可能会传入 \`captureRejections\` 等选项，但我们简化处理，先把核心功能做好。

### 2. on / addListener：添加监听器

\`on\` 和 \`addListener\` 是**完全一样的方法**，只是两个名字。做的事情：
1. 拿到事件名对应的数组，如果不存在就创建一个空数组
2. 把监听器函数push到数组末尾
3. **关键：触发 'newListener' 特殊事件**

为什么 \`newListener\` 事件要在添加**之前**触发？这是一个设计细节——因为如果在添加之后才触发newListener，那在newListener回调里再去获取监听器列表，就会包含刚添加的这个，可能导致意外行为。官方实现是在真正push之前触发newListener。

### 3. emit：触发事件

做的事情：
1. 取出事件名对应的监听器数组
2. 从数组**副本**上依次执行每个函数（为什么要副本？因为监听器执行过程中可能会添加/移除监听器，不能影响当前这次emit的执行）
3. 特殊处理 'error' 事件：如果没有监听器监听error，抛出错误让进程崩溃

为什么error事件这么特殊？这是Node.js的设计哲学——**错误必须被处理**。如果你emit了一个error却没人监听，说明你忽略了一个可能的异常，这是很危险的，所以直接崩溃让你知道有问题。

### 4. once：只执行一次的监听器

这是最巧妙的一个方法。你可能会想：once就是on一个包装函数，包装函数执行后把自己off掉。但这里有个问题：

\`\`\`javascript
const wrapper = (...args) => {  // 箭头函数 wrapper
  this.off(event, wrapper);  // 要能引用到wrapper自己才能移除
  fn.apply(this, args);
};
this.on(event, wrapper);
\`\`\`

对，核心就是用一个包装函数，并且这个包装函数要持有对自己的引用，这样执行时才能把自己从数组里移除。

但还有一个细节：用户调用 \`off(event, originalFn)\` 时，我们希望能把这个once监听器也移除掉，因为用户传的是原始函数，不是包装函数。怎么做到的？我们需要在包装函数上挂一个属性，比如 \`wrapper.listener = fn\`，这样移除的时候可以检查这个属性。

### 5. off / removeListener：移除监听器

做的事情：
1. 找到事件名对应的数组
2. 从后往前遍历（为什么从后往前？因为splice会改变数组长度，从后往前不会影响前面的索引）
3. 找到匹配的函数（要同时检查原始函数和wrapper.listener，因为once的包装函数和原始函数不同）就splice掉
4. **关键：触发 'removeListener' 特殊事件**

为什么从后往前遍历？假设数组是 [a,b,c,d]，如果你从前往后遍历，i=1的时候删除了b，数组变成 [a,c,d]，然后i++变成2，就跳过了原来的c（现在在位置1）。从后往前就没有这个问题。

### 6. removeAllListeners：移除所有监听器

可以指定事件名，也可以不指定（移除所有事件的）。

### 7. prependListener / prependOnceListener

和on/once类似，但是把监听器unshift到数组**开头**而不是push到末尾。这样emit的时候会先执行。

### 8. listenerCount：返回监听器数量

直接返回数组的length。注意要处理事件不存在的情况，返回0。

### 9. rawListeners

返回监听器数组的**副本**（或者是原始引用？官方rawListeners返回的是实际的数组引用，包括once的包装器，而listeners返回的是unwrap后的数组）。

---

## 手写开始

理解了原理，我们来写代码。记住核心原则：**先让它跑起来，再处理边界情况**。
`,
    code: `// ============================================
// 手写完整 EventEmitter
// ============================================

const assert = require('assert');

class MyEventEmitter {
  constructor() {
    this._events = Object.create(null); // 不用{}，避免原型链上的属性干扰
  }

  on(eventName, listener) {
    return this._addListener(eventName, listener, false);
  }

  addListener(eventName, listener) {
    return this.on(eventName, listener);
  }

  once(eventName, listener) {
    return this._addListener(eventName, listener, true);
  }

  prependListener(eventName, listener) {
    return this._addListener(eventName, listener, false, true);
  }

  prependOnceListener(eventName, listener) {
    return this._addListener(eventName, listener, true, true);
  }

  _addListener(eventName, listener, once, prepend = false) {
    if (typeof listener !== 'function') {
      throw new TypeError('The "listener" argument must be of type Function');
    }

    // 先触发 newListener 事件（在真正添加之前）
    if (eventName !== 'newListener') {
      this.emit('newListener', eventName, listener);
    }

    let wrapped = listener;
    if (once) {
      // 关键：once需要一个包装函数，执行后自动移除
      const wrapper = (...args) => {
        this.removeListener(eventName, wrapper);
        listener.apply(this, args);
      };
      wrapper.listener = listener; // 保存原始函数引用，方便off时匹配
      wrapped = wrapper;
    }

    if (!this._events[eventName]) {
      this._events[eventName] = [];
    }

    if (prepend) {
      this._events[eventName].unshift(wrapped);
    } else {
      this._events[eventName].push(wrapped);
    }

    return this;
  }

  emit(eventName, ...args) {
    const listeners = this._events[eventName];

    // error 事件特殊处理：没有监听器就抛出
    if (eventName === 'error') {
      if (!listeners || listeners.length === 0) {
        const err = args[0];
        if (err instanceof Error) {
          throw err;
        }
        throw new Error('Unhandled error: ' + err);
      }
    }

    if (!listeners || listeners.length === 0) {
      return false;
    }

    // 用副本遍历，避免执行过程中监听器数组被修改导致问题
    const listenersCopy = [...listeners];
    for (const fn of listenersCopy) {
      fn.apply(this, args);
    }

    return true;
  }

  off(eventName, listener) {
    return this.removeListener(eventName, listener);
  }

  removeListener(eventName, listener) {
    const listeners = this._events[eventName];
    if (!listeners) return this;

    // 从后往前遍历，避免splice导致索引错乱
    for (let i = listeners.length - 1; i >= 0; i--) {
      const fn = listeners[i];
      // 匹配：要么是同一个函数，要么是once的包装函数（wrapper.listener === listener）
      if (fn === listener || (fn.listener && fn.listener === listener)) {
        listeners.splice(i, 1);

        // 触发 removeListener 事件
        if (eventName !== 'removeListener') {
          this.emit('removeListener', eventName, listener);
        }
        break;
      }
    }

    // 如果数组空了，删除key
    if (listeners.length === 0) {
      delete this._events[eventName];
    }

    return this;
  }

  removeAllListeners(eventName) {
    if (eventName) {
      delete this._events[eventName];
    } else {
      this._events = Object.create(null);
    }
    return this;
  }

  listenerCount(eventName) {
    const listeners = this._events[eventName];
    return listeners ? listeners.length : 0;
  }

  listeners(eventName) {
    const listeners = this._events[eventName];
    if (!listeners) return [];
    // 返回解包后的监听器（unwrap once wrapper）
    return listeners.map(fn => fn.listener || fn);
  }

  rawListeners(eventName) {
    const listeners = this._events[eventName];
    if (!listeners) return [];
    return [...listeners];
  }
}

// ============================================
// 测试代码
// ============================================

console.log('=== 测试1: 基本 on/emit ===');
const e1 = new MyEventEmitter();
let results = [];
e1.on('test', (a, b) => results.push(a + b));
e1.emit('test', 1, 2);
assert.strictEqual(results[0], 3);
console.log('✓ on/emit 基本功能正常');

console.log('=== 测试2: once 只执行一次 ===');
const e2 = new MyEventEmitter();
let count = 0;
e2.once('tick', () => count++);
e2.emit('tick');
e2.emit('tick');
e2.emit('tick');
assert.strictEqual(count, 1);
console.log('✓ once 只执行一次');

console.log('=== 测试3: off 移除监听器 ===');
const e3 = new MyEventEmitter();
let val = 0;
const fn = () => val++;
e3.on('inc', fn);
e3.emit('inc');
assert.strictEqual(val, 1);
e3.off('inc', fn);
e3.emit('inc');
assert.strictEqual(val, 1); // 移除后不再执行
console.log('✓ off 移除监听器正常');

console.log('=== 测试4: once 后能 off 原始函数 ===');
const e4 = new MyEventEmitter();
let onceVal = 0;
const onceFn = () => onceVal++;
e4.once('x', onceFn);
e4.off('x', onceFn); // 用原始函数off，也应该能移除
e4.emit('x');
assert.strictEqual(onceVal, 0);
console.log('✓ once包装器也能通过原始函数移除');

console.log('=== 测试5: prependListener 先执行 ===');
const e5 = new MyEventEmitter();
const order = [];
e5.on('seq', () => order.push('third'));
e5.on('seq', () => order.push('first')); // 不对，prepend才是开头
e5.prependListener('seq', () => order.push('prepended'));
e5.emit('seq');
assert.strictEqual(order[0], 'prepended');
console.log('✓ prependListener 添加到开头');

console.log('=== 测试6: newListener 事件 ===');
const e6 = new MyEventEmitter();
const newListenerEvents = [];
e6.on('newListener', (event, listener) => {
  newListenerEvents.push(event);
});
e6.on('hello', () => {});
e6.on('world', () => {});
assert.deepStrictEqual(newListenerEvents, ['hello', 'world']);
console.log('✓ newListener 事件正确触发');

console.log('=== 测试7: removeListener 事件 ===');
const e7 = new MyEventEmitter();
const removed = [];
e7.on('removeListener', (event) => removed.push(event));
const tmpFn = () => {};
e7.on('rm', tmpFn);
e7.off('rm', tmpFn);
assert.deepStrictEqual(removed, ['rm']);
console.log('✓ removeListener 事件正确触发');

console.log('=== 测试8: listenerCount ===');
const e8 = new MyEventEmitter();
e8.on('a', () => {});
e8.on('a', () => {});
e8.on('b', () => {});
assert.strictEqual(e8.listenerCount('a'), 2);
assert.strictEqual(e8.listenerCount('b'), 1);
assert.strictEqual(e8.listenerCount('nonexistent'), 0);
console.log('✓ listenerCount 正确');

console.log('=== 测试9: removeAllListeners ===');
const e9 = new MyEventEmitter();
e9.on('x', () => {});
e9.on('y', () => {});
e9.removeAllListeners('x');
assert.strictEqual(e9.listenerCount('x'), 0);
assert.strictEqual(e9.listenerCount('y'), 1);
e9.removeAllListeners();
assert.strictEqual(e9.listenerCount('y'), 0);
console.log('✓ removeAllListeners 正确');

console.log('=== 测试10: error 事件无监听器则抛出 ===');
const e10 = new MyEventEmitter();
let threw = false;
try {
  e10.emit('error', new Error('test error'));
} catch (err) {
  threw = true;
  assert.strictEqual(err.message, 'test error');
}
assert.strictEqual(threw, true);
console.log('✓ error事件无监听时正确抛出');

console.log('=== 测试11: error 事件有监听器则不抛出 ===');
const e11 = new MyEventEmitter();
let errorCaught = null;
e11.on('error', (err) => { errorCaught = err; });
e11.emit('error', new Error('handled'));
assert.strictEqual(errorCaught.message, 'handled');
console.log('✓ error事件有监听时正常处理');

console.log('');
console.log('🎉 所有测试通过！MyEventEmitter 实现完整！');
`
  },
  {
    id: "n3-handwrite-promise",
    icon: "🔗",
    group: "第一部分 手写核心模块",
    title: "手写 Promise（符合 Promises/A+ 规范）",
    content: `# 手写 Promise（符合 Promises/A+ 规范）

Promise 是JavaScript异步编程的基石。从ES6引入到现在，它已经彻底改变了JavaScript的异步写法——从回调地狱到链式调用，再到async/await的语法糖，底层都是Promise。

但你有没有想过，Promise到底是怎么实现的？为什么then能链式调用？为什么resolve一个Promise会等待它完成？为什么微任务总是比setTimeout先执行？

今天我们就从零实现一个**完全符合Promises/A+规范**的Promise。

---

## Promise 的核心概念

### 三种状态
Promise有三种互斥的状态：
- **pending（等待中）**：初始状态，既没有被兑现，也没有被拒绝
- **fulfilled（已兑现）**：意味着操作成功完成
- **rejected（已拒绝）**：意味着操作失败

**状态一旦从pending变为fulfilled或rejected，就永远不会再改变**。这是Promise最核心的设计——不可逆性。这就是为什么Promise没有"取消"功能（下一章我们会自己实现可取消的Promise）。

### 为什么要异步执行then回调？

Promises/A+规范明确要求：then的回调必须异步执行，不能同步执行。为什么？

想象一下这样的场景：
\`\`\`javascript
let value;
promise.then(() => console.log(value));
value = 42;
\`\`\`
如果promise是已经resolve的状态，then如果同步执行回调，那value还是undefined；但根据规范，then必须异步，所以value已经被赋值为42了。这样保证了**无论promise是已经resolve还是稍后resolve，回调的执行时机都是一致的**——都是异步。

我们用 \`setTimeout\` 来模拟微任务（虽然实际是微任务，但setTimeout作为宏任务也能保证异步性，功能上是对的，只是时序上和真实微任务有差异）。在Node.js环境中也可以用 \`process.nextTick\`。

### The Promise Resolution Procedure（Promise解析过程）

这是Promises/A+规范2.3节的核心，也是最难理解的部分。规范定义了如何处理resolve的值x：

1. 如果promise和x指向同一个对象，reject一个TypeError
2. 如果x是一个Promise，采用它的状态（等待它resolve或reject）
3. 如果x是一个对象或函数：
   - 取x.then（注意这里如果访问then属性抛出异常，直接reject）
   - 如果then是函数，用x作为this调用它，传两个回调resolvePromise和rejectPromise
   - 如果then不是函数，直接fulfill这个x
4. 如果x不是对象或函数，直接fulfill x

还有一个关键规则：如果resolvePromise和rejectPromise都被调用，或者被调用了多次，**只采用第一次调用**，后续调用全部忽略。这就是为什么要一个called标志。

### then 为什么要返回新Promise？

链式调用的秘密就在这里：**每个then都返回一个新的Promise**。

\`\`\`javascript
promise.then(fn1).then(fn2).then(fn3)
// 等价于
const p1 = promise.then(fn1);  // 定义常量 p1
const p2 = p1.then(fn2);  // 定义常量 p2
const p3 = p2.then(fn3);  // 定义常量 p3
\`\`\`

这样每个环节的成功或失败都可以独立处理，fn1的返回值会传给p2的resolve，fn1抛出的错误会让p2reject。

### 值穿透

如果你给then传的不是函数，比如 \`promise.then(123).then(console.log)\`，它应该把值穿透传到下一个then。这就是为什么实现的时候要判断：如果onFulfilled不是函数，就把它变成一个return value的函数；如果onRejected不是函数，就变成一个throw reason的函数。

---

## 静态方法

除了核心的then，我们还需要实现常用的静态方法：
- \`Promise.resolve(value)\`：返回一个resolve的promise
- \`Promise.reject(reason)\`：返回一个reject的promise
- \`Promise.all(promises)\`：全部成功才成功，任一失败就失败
- \`Promise.race(promises)\`：第一个settled的就决定结果
- \`Promise.allSettled(promises)\`：等所有都settled，不管成功失败

---

## 开始手写

让我们按照规范一步步来写。记住Promises/A+规范有一个官方测试套件（promises-aplus-tests），我们写完后逻辑上应该能通过（虽然我们这里用setTimeout模拟异步）。
`,
    code: `// ============================================
// 手写符合 Promises/A+ 规范的 Promise
// ============================================

const assert = require('assert');

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor(executor) {
    this._state = PENDING;
    this._value = undefined;
    this._reason = undefined;
    this._onFulfilledCallbacks = [];
    this._onRejectedCallbacks = [];

    const resolve = (value) => {
      // 处理 value 是 thenable 的情况
      if (value instanceof MyPromise) {
        value.then(resolve, reject);
        return;
      }

      if (this._state === PENDING) {
        this._state = FULFILLED;
        this._value = value;
        // 异步执行所有回调
        this._onFulfilledCallbacks.forEach(fn => this._runAsync(fn));
      }
    };

    const reject = (reason) => {
      if (this._state === PENDING) {
        this._state = REJECTED;
        this._reason = reason;
        this._onRejectedCallbacks.forEach(fn => this._runAsync(fn));
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  _runAsync(fn) {
    // 用setTimeout模拟异步（微任务），真实是微任务，这里用宏任务也能保证异步性
    setTimeout(() => fn(), 0);
  }

  then(onFulfilled, onRejected) {
    // 值穿透：非函数的参数要变成透传的函数
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e; };

    const promise2 = new MyPromise((resolve, reject) => {
      const onFulfilledWrapper = () => {
        try {
          const x = onFulfilled(this._value);
          this._resolvePromise(promise2, x, resolve, reject);
        } catch (err) {
          reject(err);
        }
      };

      const onRejectedWrapper = () => {
        try {
          const x = onRejected(this._reason);
          this._resolvePromise(promise2, x, resolve, reject);
        } catch (err) {
          reject(err);
        }
      };

      if (this._state === FULFILLED) {
        this._runAsync(onFulfilledWrapper);
      } else if (this._state === REJECTED) {
        this._runAsync(onRejectedWrapper);
      } else {
        // pending状态，存起来
        this._onFulfilledCallbacks.push(onFulfilledWrapper);
        this._onRejectedCallbacks.push(onRejectedWrapper);
      }
    });

    return promise2;
  }

  _resolvePromise(promise2, x, resolve, reject) {
    // 规范 2.3.1: x 和 promise2 是同一个对象
    if (x === promise2) {
      reject(new TypeError('Chaining cycle detected for promise'));
      return;
    }

    // 规范 2.3.2: x 是 MyPromise 实例
    if (x instanceof MyPromise) {
      if (x._state === FULFILLED) {
        resolve(x._value);
      } else if (x._state === REJECTED) {
        reject(x._reason);
      } else {
        x.then(
          value => this._resolvePromise(promise2, value, resolve, reject),
          reject
        );
      }
      return;
    }

    // 规范 2.3.3: x 是对象或函数
    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
      let called = false; // 防止resolvePromise和rejectPromise都被调用
      try {
        const then = x.then;
        if (typeof then === 'function') {
          then.call(
            x,
            y => {
              if (called) return;
              called = true;
              this._resolvePromise(promise2, y, resolve, reject);
            },
            r => {
              if (called) return;
              called = true;
              reject(r);
            }
          );
        } else {
          resolve(x);
        }
      } catch (err) {
        if (called) return;
        called = true;
        reject(err);
      }
      return;
    }

    // 规范 2.3.4: x 不是对象或函数，直接fulfill
    resolve(x);
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(onFinally) {
    return this.then(
      value => MyPromise.resolve(onFinally()).then(() => value),
      reason => MyPromise.resolve(onFinally()).then(() => { throw reason; })
    );
  }

  static resolve(value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise(resolve => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let completed = 0;
      const len = promises.length;

      if (len === 0) {
        resolve(results);
        return;
      }

      promises.forEach((p, index) => {
        MyPromise.resolve(p).then(
          value => {
            results[index] = value;
            completed++;
            if (completed === len) {
              resolve(results);
            }
          },
          reject // 任一失败，直接reject
        );
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(p => {
        MyPromise.resolve(p).then(resolve, reject);
      });
    });
  }

  static allSettled(promises) {
    return new MyPromise((resolve) => {
      const results = [];
      let completed = 0;
      const len = promises.length;

      if (len === 0) {
        resolve(results);
        return;
      }

      promises.forEach((p, index) => {
        MyPromise.resolve(p).then(
          value => {
            results[index] = { status: 'fulfilled', value };
            completed++;
            if (completed === len) resolve(results);
          },
          reason => {
            results[index] = { status: 'rejected', reason };
            completed++;
            if (completed === len) resolve(results);
          }
        );
      });
    });
  }
}

// ============================================
// 测试代码
// ============================================

let testsPassed = 0;
let testsTotal = 0;

function test(name, fn) {
  testsTotal++;
  try {
    fn();
    testsPassed++;
    console.log('✓', name);
  } catch (e) {
    console.log('✗', name, '-', e.message);
  }
}

// 注意：因为异步，我们需要用async测试
async function runTests() {
  console.log('=== 基础测试 ===');

  await new Promise(resolve => {
    const p = new MyPromise(res => res(42));
    p.then(val => {
      assert.strictEqual(val, 42);
      console.log('✓ 基本resolve');
      resolve();
    });
  });

  await new Promise(resolve => {
    const p = new MyPromise((_, rej) => rej(new Error('fail')));
    p.catch(err => {
      assert.strictEqual(err.message, 'fail');
      console.log('✓ 基本reject');
      resolve();
    });
  });

  await new Promise(resolve => {
    const p = new MyPromise(res => {
      setTimeout(() => res('async'), 50);
    });
    p.then(val => {
      assert.strictEqual(val, 'async');
      console.log('✓ 异步resolve');
      resolve();
    });
  });

  console.log('=== 链式调用测试 ===');

  await new Promise(resolve => {
    new MyPromise(res => res(1))
      .then(n => n + 1)
      .then(n => n * 3)
      .then(n => {
        assert.strictEqual(n, 6);
        console.log('✓ 链式调用传递返回值');
        resolve();
      });
  });

  await new Promise(resolve => {
    new MyPromise(res => res(1))
      .then(() => { throw new Error('chain error'); })
      .then(() => assert.fail('不应执行'))
      .catch(err => {
        assert.strictEqual(err.message, 'chain error');
        console.log('✓ 链式调用catch错误');
        resolve();
      });
  });

  console.log('=== 值穿透测试 ===');

  await new Promise(resolve => {
    new MyPromise(res => res(100))
      .then(200) // 非函数，应穿透
      .then(null) // null，也穿透
      .then(val => {
        assert.strictEqual(val, 100);
        console.log('✓ 值穿透');
        resolve();
      });
  });

  console.log('=== Promise.resolve / reject ===');

  await new Promise(resolve => {
    MyPromise.resolve(99).then(v => {
      assert.strictEqual(v, 99);
      console.log('✓ Promise.resolve');
      resolve();
    });
  });

  await new Promise(resolve => {
    MyPromise.reject(new Error('rej')).catch(e => {
      assert.strictEqual(e.message, 'rej');
      console.log('✓ Promise.reject');
      resolve();
    });
  });

  console.log('=== Promise.all ===');

  await MyPromise.all([
    MyPromise.resolve(1),
    MyPromise.resolve(2),
    MyPromise.resolve(3)
  ]).then(results => {
    assert.deepStrictEqual(results, [1, 2, 3]);
    console.log('✓ Promise.all 全部成功');
  });

  await MyPromise.all([
    MyPromise.resolve(1),
    MyPromise.reject(new Error('one fails')),
    MyPromise.resolve(3)
  ]).then(
    () => assert.fail('不应成功'),
    err => {
      assert.strictEqual(err.message, 'one fails');
      console.log('✓ Promise.all 任一失败则失败');
    }
  );

  console.log('=== Promise.race ===');

  await MyPromise.race([
    new MyPromise(res => setTimeout(() => res('slow'), 100)),
    MyPromise.resolve('fast')
  ]).then(val => {
    assert.strictEqual(val, 'fast');
    console.log('✓ Promise.race 取最快的');
  });

  console.log('=== Promise.allSettled ===');

  await MyPromise.allSettled([
    MyPromise.resolve('ok'),
    MyPromise.reject(new Error('no'))
  ]).then(results => {
    assert.strictEqual(results[0].status, 'fulfilled');
    assert.strictEqual(results[0].value, 'ok');
    assert.strictEqual(results[1].status, 'rejected');
    console.log('✓ Promise.allSettled');
  });

  console.log('=== resolve thenable ===');

  await new Promise(resolve => {
    const thenable = {
      then(res) { setTimeout(() => res('thenable value'), 30); }
    };
    MyPromise.resolve(thenable).then(v => {
      assert.strictEqual(v, 'thenable value');
      console.log('✓ resolve thenable对象');
      resolve();
    });
  });

  console.log('');
  console.log('🎉 所有Promise测试完成！');
}

runTests();
`
  },
  {
    id: "n3-cancel-token",
    icon: "❌",
    group: "第一部分 手写核心模块",
    title: "手写可取消的 Promise（CancelToken）",
    content: `# 手写可取消的 Promise（CancelToken）

你有没有遇到过这样的场景？
- 用户点击搜索按钮，发起一个请求，还没等结果返回，用户又输入了新的关键词发起新请求，上一个请求已经不需要了
- 页面跳转了，但之前页面的请求还在回来，处理这些响应毫无意义甚至可能导致内存泄漏
- 一个请求超过3秒还没响应，你想直接超时放弃
- 并发发了5个请求，拿到第一个结果就不需要其他4个了

这时候你会发现：**原生Promise是不可取消的**。一旦new了一个Promise并启动了异步任务，你就无法从外部"撤回"它。resolve和reject都在executor内部，外部没有控制权。

为什么Promise设计成不可取消？因为Promise代表一个**异步结果**，而不是一个**异步任务**。结果是一个值，值不存在"取消"的概念——它要么成功，要么失败，要么还在等。但任务确实是可以取消的。

所以我们需要一个机制来**通知异步任务"你可以停了"**。这就是取消（cancellation）要解决的问题。

---

## 方案一：CancelToken 模式

这是axios库曾经使用的取消方案（后来也支持了AbortController）。核心思路：
1. 创建一个CancelToken源，它包含一个token和一个cancel方法
2. 把token传给异步任务
3. 异步任务内部监听token的状态，如果被取消了就停止工作
4. 外部调用cancel方法来发出取消信号

这种模式的优点是：Promise本身还是标准的Promise，取消是通过**一个额外的信号对象**来传递的，而不是修改Promise本身的语义。

CancelToken的本质还是**发布订阅模式**——token内部有一个pending状态的promise，异步任务await这个promise，外部调用cancel时resolve它，异步任务发现被取消了就停止。

---

## 方案二：AbortController / AbortSignal

这是现在的**Web标准方案**。浏览器的fetch API从一开始就用这个，Node.js也原生支持。AbortController是一个更通用的取消原语：

- \`AbortController\`：有一个 \`signal\` 属性和一个 \`abort()\` 方法
- \`AbortSignal\`：有一个 \`aborted\` 属性表示是否已取消，可以监听 \`abort\` 事件，还有 \`throwIfAborted()\` 方法会在已取消时抛出异常

它比CancelToken更灵活，因为：
1. signal是一个事件发射器，可以被多个地方监听
2. 支持timeout（AbortSignal.timeout()）
3. 可以组合多个signal（AbortSignal.any()）
4. 是Web标准，前后端通用

---

## 取消传播（Cancellation Propagation）

一个好的取消机制应该支持传播。比如你有一个父任务，它内部启了几个子任务，如果父任务被取消了，子任务也应该自动被取消。这就像树形结构，取消信号从父节点传播到所有子节点。

---

## 实现要点

1. 取消是**协作式**的，不是抢占式的。我们不能强行终止一个正在运行的函数，只能发出"请你停下"的信号，函数自己在合适的检查点检查是否被取消，然后主动停止。
2. 取消后Promise应该reject一个Cancel对象，这样调用方可以区分"正常失败"和"被取消"
3. 异步任务在执行关键操作前检查signal状态，取消后要及时清理资源（清除定时器、关闭连接等）

---

## 开始实现

我们先实现CancelToken版本（理解原理），再实现一个简化版AbortController（贴近标准），最后用它们做几个演示：超时取消、手动取消、并发请求取第一个。
`,
    code: `// ============================================
// 可取消 Promise：CancelToken 和 AbortController
// ============================================

// ---------- 1. Cancel 错误类型 ----------
class CancelError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CancelError';
    this.isCanceled = true;
  }
}

// ---------- 2. CancelToken 实现（axios 风格）----------
class CancelToken {
  constructor(executor) {
    this._reason = null;
    this._listeners = [];

    const cancel = (message) => {
      if (this._reason) return; // 已经取消过了
      this._reason = new CancelError(message);
      this._listeners.forEach(fn => fn(this._reason));
      this._listeners = [];
    };

    this.promise = new Promise(resolve => {
      this._resolvePromise = resolve;
      this._listeners.push(reason => resolve(reason));
    });

    executor(cancel);
  }

  // 工厂方法：创建 token 和 cancel 函数
  static source() {
    let cancel;
    const token = new CancelToken(c => { cancel = c; });
    return { token, cancel };
  }

  get isCanceled() {
    return this._reason !== null;
  }

  get reason() {
    return this._reason;
  }

  // 如果已取消，直接抛出
  throwIfRequested() {
    if (this._reason) throw this._reason;
  }
}

// ---------- 3. AbortController 简易实现（Web 标准风格）----------
class MyAbortSignal {
  constructor() {
    this._aborted = false;
    this._reason = undefined;
    this._listeners = { abort: [] };
    this.onabort = null;
  }

  get aborted() {
    return this._aborted;
  }

  addEventListener(event, listener) {
    if (event === 'abort') {
      this._listeners.abort.push(listener);
      // 如果已经aborted了，添加监听器时立即触发
      if (this._aborted) {
        setTimeout(() => listener({ type: 'abort', target: this }), 0);
      }
    }
  }

  removeEventListener(event, listener) {
    if (event === 'abort') {
      const idx = this._listeners.abort.indexOf(listener);
      if (idx !== -1) this._listeners.abort.splice(idx, 1);
    }
  }

  dispatchEvent(event) {
    if (event.type === 'abort' && !this._aborted) {
      this._aborted = true;
      this._listeners.abort.forEach(fn => {
        try { fn(event); } catch (e) { /* 监听器错误不影响 */ }
      });
      if (this.onabort) this.onabort(event);
    }
  }

  throwIfAborted() {
    if (this._aborted) {
      throw (this._reason || new DOMException('The operation was aborted.', 'AbortError'));
    }
  }

  // 静态方法：超时自动取消
  static timeout(ms) {
    const controller = new MyAbortController();
    setTimeout(() => controller.abort(new DOMException('TimeoutError', 'TimeoutError')), ms);
    return controller.signal;
  }
}

class MyAbortController {
  constructor() {
    this.signal = new MyAbortSignal();
  }

  abort(reason) {
    if (this.signal._aborted) return;
    this.signal._reason = reason;
    const event = { type: 'abort', target: this.signal };
    this.signal.dispatchEvent(event);
  }
}

// ---------- 4. 包装一个可取消的"异步请求"----------
function fakeRequest(url, delay, signal) {
  return new Promise((resolve, reject) => {
    // 先检查是否已经取消
    if (signal && signal.aborted) {
      reject(signal._reason || new CancelError('Already canceled'));
      return;
    }

    const timer = setTimeout(() => {
      resolve({ url, data: 'response from ' + url, time: Date.now() });
    }, delay);

    // 监听取消信号
    if (signal) {
      const onAbort = () => {
        clearTimeout(timer);
        reject(signal._reason || new CancelError('Request canceled: ' + url));
      };
      if (signal.addEventListener) {
        signal.addEventListener('abort', onAbort);
      } else if (signal.promise) {
        // CancelToken 模式
        signal.promise.then(onAbort);
      }
    }
  });
}

// ============================================
// 演示代码
// ============================================

async function demo1_manualCancel() {
  console.log('=== 演示1：手动取消请求 ===');
  const controller = new MyAbortController();

  console.log('发起请求A...');
  const reqA = fakeRequest('/api/a', 2000, controller.signal);

  // 1秒后取消
  setTimeout(() => {
    console.log('用户取消了请求A');
    controller.abort(new CancelError('User canceled'));
  }, 1000);

  try {
    const result = await reqA;
    console.log('请求A结果:', result);
  } catch (err) {
    console.log('请求A被取消:', err.message);
    console.log('是否是取消错误:', err instanceof CancelError || err.name === 'AbortError');
  }
}

async function demo2_timeout() {
  console.log('');
  console.log('=== 演示2：超时自动取消 ===');
  const signal = MyAbortSignal.timeout(500); // 500ms超时

  try {
    // 这个请求要2秒，会超时
    const result = await fakeRequest('/api/slow', 2000, signal);
    console.log('结果:', result);
  } catch (err) {
    console.log('请求超时:', err.message);
  }
}

async function demo3_race() {
  console.log('');
  console.log('=== 演示3：多个请求取最快的，取消其余 ===');

  const controller = new MyAbortController();

  const requests = [
    fakeRequest('/api/fast', 100, controller.signal),
    fakeRequest('/api/medium', 1000, controller.signal),
    fakeRequest('/api/slow', 2000, controller.signal),
  ];

  try {
    const winner = await Promise.race(requests);
    console.log('最快的响应:', winner);
    controller.abort(new CancelError('Got fastest response'));
    console.log('已取消其余请求');
  } catch (err) {
    console.log('错误:', err.message);
  }
}

async function demo4_cancelToken() {
  console.log('');
  console.log('=== 演示4：CancelToken 模式（axios 风格）===');
  const source = CancelToken.source();

  console.log('发起请求...');
  const req = fakeRequest('/api/data', 3000, source.token);

  setTimeout(() => {
    console.log('调用cancel取消请求');
    source.cancel('Operation canceled by user');
  }, 500);

  try {
    const result = await req;
    console.log('结果:', result);
  } catch (err) {
    console.log('捕获到取消错误:', err.message);
    console.log('isCanceled:', err.isCanceled);
  }
}

async function demo5_alreadyCanceled() {
  console.log('');
  console.log('=== 演示5：先取消再发起请求 ===');
  const controller = new MyAbortController();
  controller.abort(new CancelError('Pre-canceled'));

  try {
    await fakeRequest('/api/b', 100, controller.signal);
  } catch (err) {
    console.log('请求前已取消，直接reject:', err.message);
  }
}

async function runAll() {
  await demo1_manualCancel();
  await new Promise(r => setTimeout(r, 1200));
  await demo2_timeout();
  await new Promise(r => setTimeout(r, 600));
  await demo3_race();
  await new Promise(r => setTimeout(r, 300));
  await demo4_cancelToken();
  await new Promise(r => setTimeout(r, 700));
  await demo5_alreadyCanceled();
  console.log('');
  console.log('🎉 所有取消Promise演示完成！');
}

runAll();
`
  },
  {
    id: "n3-deep-clone",
    icon: "📋",
    group: "第一部分 手写核心模块",
    title: "手写深拷贝（deepClone）",
    content: `# 手写深拷贝（deepClone）

深拷贝是面试高频题，也是日常开发中经常遇到的需求。但你真的理解深拷贝吗？很多人第一反应是 \`JSON.parse(JSON.stringify())\`，但这个方法有非常多缺陷。

今天我们要实现一个工业级的深拷贝，处理各种边界情况。

---

## JSON 序列化的缺点

先看看 \`JSON.parse(JSON.stringify(obj))\` 到底有什么问题：

1. **丢失函数**：\`function\` 类型会被直接忽略，序列化结果里没有这个key
2. **丢失undefined**：值为 \`undefined\` 的key也会消失
3. **循环引用报错**：\`const a = {}; a.self = a;\` 序列化直接抛TypeError: Converting circular structure to JSON
4. **Date对象变字符串**：new Date() 会变成ISO格式的字符串，不再是Date对象
5. **RegExp变空对象**：正则表达式会变成 \`{}\`，丢失pattern和flags
6. **Symbol类型丢失**：key是Symbol的属性会被忽略，值是Symbol也会变成undefined
7. **BigInt报错**：BigInt类型不能被序列化，直接抛TypeError
8. **Map/Set丢失**：Map和Set都会变成空对象 \`{}\`
9. **TypedArray丢失**：Int32Array等类型数组处理不正确
10. **原型链丢失**：对象的原型链不会被保留
11. **稀疏数组问题**：数组中的空槽会变成null

你可能觉得这些情况你遇不到，但只要代码足够复杂，迟早会踩坑。

---

## 基础版：递归实现

最朴素的深拷贝思路：
1. 如果是基本类型，直接返回
2. 如果是引用类型（对象或数组），创建一个新的空对象/数组
3. 遍历原对象的每个属性，递归拷贝

但基础版解决不了循环引用——递归到a.self的时候，self又指向a，a还没拷贝完呢，就无限递归了，栈溢出。

---

## 解决循环引用：WeakMap

怎么解决循环引用？很简单——**用一个"备忘录"记录已经拷贝过的对象**。

每次要拷贝一个对象之前，先看看备忘录里有没有：
- 有：直接返回备忘录里存的拷贝版本，不再递归
- 没有：先在备忘录里记下来（占位），再继续递归拷贝属性

为什么用 \`WeakMap\` 而不是 \`Map\` 或普通对象？因为WeakMap的key是弱引用，如果原对象被垃圾回收了，WeakMap里的记录也会自动被回收，不会造成内存泄漏。这是一个细节但重要的选择。

注意：WeakMap的key必须是对象，这刚好符合我们的需求——基本类型不需要记录。

---

## 处理各种特殊类型

| 类型 | 处理方式 |
|------|---------|
| Date | new Date(originalDate) |
| RegExp | new RegExp(reg.source, reg.flags) |
| Map | 遍历entries，递归拷贝key和value |
| Set | 遍历values，递归拷贝 |
| Function | 直接返回原函数？还是复制？函数的深拷贝是个争议话题，通常浅拷贝直接引用即可，因为函数是纯逻辑，一般不需要"拷贝" |
| Symbol | Symbol值直接返回（Symbol是唯一的，不能也不需要"拷贝"）；Symbol作为key时要用Object.getOwnPropertySymbols()获取 |
| BigInt | BigInt(n) 直接复制 |
| TypedArray (Int8Array等) | new constructor(copy) |
| null/undefined | 直接返回 |

---

## 其他细节

1. **属性描述符**：如果要完美拷贝，应该用Object.getOwnPropertyDescriptors获取描述符（包括writable/enumerable/configurable/getter/setter），然后用Object.create或Object.defineProperties创建，而不是简单赋值。我们这里简化处理。
2. **原型链**：用Object.create(Object.getPrototypeOf(obj))来保留原型链。
3. **性能**：对于大对象，递归可能栈溢出，但实际中极少有对象嵌套层级深到栈溢出。如果要处理，可以改成迭代版（用栈/队列+循环），但递归版更清晰。
4. **structuredClone**：浏览器和Node.js 17+内置了structuredClone API，是官方的深拷贝实现，功能很强大，但它也不能拷贝函数。

---

## 开始实现

我们写一个功能较完善的版本，处理最常见的情况。
`,
    code: `// ============================================
// 手写深拷贝 deepClone
// ============================================

const assert = require('assert');

function deepClone(source, hash = new WeakMap()) {
  // null 或 undefined 直接返回
  if (source == null) return source;

  // 基本类型直接返回
  if (typeof source !== 'object') return source;

  // 处理循环引用：已经拷贝过的直接返回缓存
  if (hash.has(source)) return hash.get(source);

  // Date
  if (source instanceof Date) {
    const copy = new Date(source.getTime());
    hash.set(source, copy);
    return copy;
  }

  // RegExp
  if (source instanceof RegExp) {
    const copy = new RegExp(source.source, source.flags);
    copy.lastIndex = source.lastIndex;
    hash.set(source, copy);
    return copy;
  }

  // Map
  if (source instanceof Map) {
    const copy = new Map();
    hash.set(source, copy);
    source.forEach((value, key) => {
      copy.set(deepClone(key, hash), deepClone(value, hash));
    });
    return copy;
  }

  // Set
  if (source instanceof Set) {
    const copy = new Set();
    hash.set(source, copy);
    source.forEach(value => {
      copy.add(deepClone(value, hash));
    });
    return copy;
  }

  // Array 或普通对象
  // 保留原型链
  const copy = Array.isArray(source)
    ? []
    : Object.create(Object.getPrototypeOf(source));

  hash.set(source, copy);

  // 处理 Symbol 类型的 key
  const symKeys = Object.getOwnPropertySymbols(source);
  if (symKeys.length) {
    symKeys.forEach(key => {
      copy[key] = deepClone(source[key], hash);
    });
  }

  // 处理普通 key（包括不可枚举的？这里我们只处理可枚举属性）
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      copy[key] = deepClone(source[key], hash);
    }
  }

  return copy;
}

// ============================================
// 测试代码
// ============================================

console.log('=== 测试1: 基本对象/数组拷贝 ===');
const obj1 = { a: 1, b: [2, 3], c: { d: 4 } };
const cloned1 = deepClone(obj1);
assert.deepStrictEqual(cloned1, obj1);
assert.notStrictEqual(cloned1, obj1);
assert.notStrictEqual(cloned1.b, obj1.b);
assert.notStrictEqual(cloned1.c, obj1.c);
console.log('✓ 基本对象/数组深拷贝成功，引用不共享');

console.log('=== 测试2: 循环引用 ===');
const obj2 = { name: 'circular' };
obj2.self = obj2;
obj2.child = { parent: obj2 };
const cloned2 = deepClone(obj2);
assert.strictEqual(cloned2.name, 'circular');
assert.strictEqual(cloned2.self, cloned2); // 自引用正确
assert.strictEqual(cloned2.child.parent, cloned2); // 互相引用正确
assert.notStrictEqual(cloned2, obj2);
console.log('✓ 循环引用处理正确');

console.log('=== 测试3: Date 对象 ===');
const obj3 = { time: new Date('2024-01-15T10:30:00Z') };
const cloned3 = deepClone(obj3);
assert.ok(cloned3.time instanceof Date);
assert.strictEqual(cloned3.time.getTime(), obj3.time.getTime());
assert.notStrictEqual(cloned3.time, obj3.time);
console.log('✓ Date 拷贝正确，类型保留');

console.log('=== 测试4: RegExp 对象 ===');
const obj4 = { pattern: /hello/gi, pattern2: new RegExp('world', 'm') };
const cloned4 = deepClone(obj4);
assert.ok(cloned4.pattern instanceof RegExp);
assert.strictEqual(cloned4.pattern.source, 'hello');
assert.strictEqual(cloned4.pattern.flags, 'gi');
assert.strictEqual(cloned4.pattern2.source, 'world');
assert.notStrictEqual(cloned4.pattern, obj4.pattern);
console.log('✓ RegExp 拷贝正确，保留source和flags');

console.log('=== 测试5: Map ===');
const map1 = new Map();
map1.set('k1', { val: 1 });
map1.set({ nested: 'key' }, [1, 2, 3]);
const clonedMap = deepClone(map1);
assert.ok(clonedMap instanceof Map);
assert.strictEqual(clonedMap.size, 2);
const k1Val = clonedMap.get('k1');
assert.notStrictEqual(k1Val, map1.get('k1'));
assert.strictEqual(k1Val.val, 1);
console.log('✓ Map 深拷贝正确');

console.log('=== 测试6: Set ===');
const set1 = new Set([{ n: 1 }, { n: 2 }, { n: 3 }]);
const clonedSet = deepClone(set1);
assert.ok(clonedSet instanceof Set);
assert.strictEqual(clonedSet.size, 3);
const setArr = [...clonedSet];
assert.notStrictEqual(setArr[0], [...set1][0]);
assert.strictEqual(setArr[0].n, 1);
console.log('✓ Set 深拷贝正确');

console.log('=== 测试7: Symbol 键 ===');
const sym = Symbol('testSym');
const obj7 = { [sym]: 'symbolValue', normal: 'ok' };
const cloned7 = deepClone(obj7);
assert.strictEqual(cloned7[sym], 'symbolValue');
assert.strictEqual(cloned7.normal, 'ok');
console.log('✓ Symbol 键正确拷贝');

console.log('=== 测试8: 基本类型 ===');
assert.strictEqual(deepClone(null), null);
assert.strictEqual(deepClone(undefined), undefined);
assert.strictEqual(deepClone(42), 42);
assert.strictEqual(deepClone('hello'), 'hello');
assert.strictEqual(deepClone(true), true);
const symVal = Symbol('x');
assert.strictEqual(deepClone(symVal), symVal); // Symbol直接返回
assert.strictEqual(deepClone(100n), 100n);
console.log('✓ 基本类型直接返回');

console.log('=== 测试9: 嵌套数组 ===');
const arr = [[1], [2, [3, [4]]]];
const clonedArr = deepClone(arr);
assert.deepStrictEqual(clonedArr, arr);
assert.notStrictEqual(clonedArr[1][1], arr[1][1]);
console.log('✓ 嵌套数组拷贝正确');

console.log('=== 测试10: 对比 JSON 方法的缺陷 ===');
const tricky = {
  func: () => 'hi',
  undef: undefined,
  date: new Date('2024-01-01'),
  reg: /test/g,
  symKey: Symbol('s'),
};
tricky[Symbol('symKey')] = 'symVal';
const jsonCloned = JSON.parse(JSON.stringify(tricky));
const deepCloned = deepClone(tricky);

console.log('JSON方法结果: func=', typeof jsonCloned.func,
  ', undef=', 'undef' in jsonCloned,
  ', date=', typeof jsonCloned.date,
  ', reg=', JSON.stringify(jsonCloned.reg));
console.log('deepClone结果: func=', typeof deepCloned.func,
  ', undef=', 'undef' in deepCloned,
  ', date=', deepCloned.date instanceof Date,
  ', reg=', deepCloned.reg instanceof RegExp);

assert.strictEqual(typeof deepCloned.func, 'function');
assert.ok('undef' in deepCloned);
assert.ok(deepCloned.date instanceof Date);
assert.ok(deepCloned.reg instanceof RegExp);
console.log('✓ deepClone 修复了JSON方法的主要缺陷');

console.log('');
console.log('🎉 所有深拷贝测试通过！');
`
  },
  {
    id: "n3-instanceof-new",
    icon: "🔨",
    group: "第一部分 手写核心模块",
    title: "手写 instanceof 与 new 操作符",
    content: `# 手写 instanceof 与 new 操作符

\`instanceof\` 和 \`new\` 是JavaScript中非常基础的运算符和关键字，但很多人只是"会用"，并不理解它们的底层原理。这两个操作符都和**原型链（prototype chain）**紧密相关。

理解它们的实现，是理解JavaScript面向对象本质的关键。

---

## instanceof 的原理

\`a instanceof B\` 的作用是：判断 \`B.prototype\` 是否在 \`a\` 的原型链上。

就这么简单。具体算法：
1. 取 \`B.prototype\)（构造函数的prototype属性）
2. 取 \`a.__proto__\)（也就是Object.getPrototypeOf(a)）
3. 沿着__proto__这条链一直往上找：
   - 如果找到 \`__proto__ === B.prototype\`，返回true
   - 如果找到 \`__proto__ === null\)（到了原型链顶端Object.prototype.__proto__），返回false
   - 否则继续 \`__proto__ = __proto__.__proto__\) 往上走

### 为什么 \`typeof null === 'object'\` 但 \`null instanceof Object === false\`？

这是一个历史遗留bug。typeof null返回'object'是因为JavaScript最初实现时，值的类型标签用低位表示，对象的类型标签是0，而null被表示为空指针（0x00），所以typeof误判为object。

但instanceof是通过原型链查找的，null根本没有__proto__（它是原始值，不是对象），所以查找不到Object.prototype，返回false。

### 为什么字面量也能instanceof？

你可能会问：\`"hello" instanceof String\` 是false，但 \`new String("hello") instanceof String\` 是true。因为字符串字面量是原始类型string，不是String对象。但是你在字面量上调用方法时，JS引擎会临时包装成String对象，调用完就丢弃。

---

## new 操作符做了什么

当你写 \`new Person('Tom')\` 的时候，JavaScript引擎做了这四件事：

1. **创建一个全新的空对象** \`obj = {}\`
2. **设置原型链**：把obj的__proto__指向Person.prototype（obj.[[Prototype]] = Person.prototype）
3. **绑定this执行构造函数**：Person.call(obj, 'Tom')，构造函数里的this就是这个新对象，给this加属性就是给obj加属性
4. **处理返回值**：
   - 如果构造函数return的是一个**对象**（包括函数、数组、Date等），那就返回这个对象，而不是我们创建的obj
   - 如果构造函数return的是**原始类型**（number/string/boolean/null/undefined/Symbol/BigInt），或者没有return，那就返回我们创建的obj

这第4步是很多人不知道的——构造函数可以显式返回一个对象来覆盖默认返回的新对象。这在一些设计模式里有用，比如单例模式。

### 为什么new会影响原型链？

因为第2步——新对象的__proto__被设置为构造函数的prototype。这就是为什么：
\`\`\`javascript
function Person() {}  // 声明函数 Person
const p = new Person();  // 创建实例 p
p.__proto__ === Person.prototype; // true
p instanceof Person; // true，因为Person.prototype在p的原型链上
\`\`\`

---

## 原型链的本质

你可能注意到了，instanceof和new都围绕同一个东西：**__proto__链**。

每个对象都有一个[[Prototype]]（通过__proto__或Object.getPrototypeOf访问），指向它的"原型对象"。当你访问一个对象的属性时，如果对象自身没有，JS引擎就去__proto__指向的对象上找，再找不到就继续往上，直到null。这就是原型链的本质——**委托机制**，不是类继承。

函数也是对象，所以函数也有__proto__，但函数额外有一个prototype属性（普通对象没有），这个prototype是给new出来的实例当__proto__用的。

理清这两个概念很重要：
- **__proto__**：每个对象都有，指向自己的原型
- **prototype**：只有函数有，new的时候给实例当__proto__

---

## 开始手写

让我们实现myInstanceof和myNew两个函数，验证这些原理。
`,
    code: `// ============================================
// 手写 instanceof 和 new
// ============================================

const assert = require('assert');

// ---------- 手写 instanceof ----------
function myInstanceof(obj, Constructor) {
  // 基本类型直接返回false
  // 注意：typeof null === 'object' 是历史bug，要单独排除
  if (obj === null || obj === undefined) return false;
  if (typeof obj !== 'object' && typeof obj !== 'function') return false;

  // 取构造函数的prototype
  let prototype = Constructor.prototype;

  // 沿原型链往上找
  let proto = Object.getPrototypeOf(obj); // 相当于 obj.__proto__

  while (proto !== null) {
    if (proto === prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }

  return false;
}

// ---------- 手写 new ----------
function myNew(Constructor, ...args) {
  // 步骤1: 创建空对象，并设置原型
  // Object.create(proto) 创建一个新对象，__proto__指向proto
  const obj = Object.create(Constructor.prototype);

  // 步骤2: 执行构造函数，绑定this
  const result = Constructor.apply(obj, args);

  // 步骤3: 处理返回值
  // 如果构造函数返回的是对象/函数，就返回它；否则返回创建的obj
  if (result !== null && (typeof result === 'object' || typeof result === 'function')) {
    return result;
  }

  return obj;
}

// ============================================
// 测试 myInstanceof
// ============================================

console.log('=== instanceof 测试 ===');

// 基本类型
assert.strictEqual(myInstanceof(42, Number), false);
assert.strictEqual(myInstanceof('hello', String), false);
assert.strictEqual(myInstanceof(true, Boolean), false);
assert.strictEqual(myInstanceof(null, Object), false);
assert.strictEqual(myInstanceof(undefined, Object), false);
assert.strictEqual(myInstanceof(Symbol('x'), Symbol), false);
console.log('✓ 基本类型instanceof返回false');

// 包装对象
assert.strictEqual(myInstanceof(new Number(42), Number), true);
assert.strictEqual(myInstanceof(new String('hi'), String), true);
console.log('✓ 包装对象正确判断');

// 普通对象
function Animal(name) { this.name = name; }
function Dog(name) { Animal.call(this, name); }
// 原型继承
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

const dog = new Dog('旺财');
assert.strictEqual(myInstanceof(dog, Dog), true);
assert.strictEqual(myInstanceof(dog, Animal), true);
assert.strictEqual(myInstanceof(dog, Object), true);
assert.strictEqual(myInstanceof(dog, Array), false);
console.log('✓ 原型链继承链上的都返回true');

// 数组
const arr = [1, 2, 3];
assert.strictEqual(myInstanceof(arr, Array), true);
assert.strictEqual(myInstanceof(arr, Object), true);
console.log('✓ 数组instanceof正确');

// 函数
function fn() {}
assert.strictEqual(myInstanceof(fn, Function), true);
assert.strictEqual(myInstanceof(fn, Object), true);
console.log('✓ 函数instanceof正确');

// Date、RegExp
assert.strictEqual(myInstanceof(new Date(), Date), true);
assert.strictEqual(myInstanceof(/test/, RegExp), true);
console.log('✓ 内置对象类型正确');

// 和原生instanceof对比
console.log('myInstanceof 和原生 instanceof 行为一致');

// ============================================
// 测试 myNew
// ============================================

console.log('');
console.log('=== new 测试 ===');

function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.sayHi = function() { return 'Hi, ' + this.name; };

const p1 = myNew(Person, 'Alice', 25);
assert.strictEqual(p1.name, 'Alice');
assert.strictEqual(p1.age, 25);
assert.strictEqual(typeof p1.sayHi, 'function');
assert.strictEqual(p1.sayHi(), 'Hi, Alice');
assert.strictEqual(myInstanceof(p1, Person), true);
assert.strictEqual(myInstanceof(p1, Object), true);
console.log('✓ 基本new功能正常：属性正确、原型方法可用、instanceof正确');

// 构造函数返回对象
function Factory() {
  this.name = 'ignored';
  return { custom: 'factory object' };
}
const f1 = myNew(Factory);
assert.deepStrictEqual(f1, { custom: 'factory object' });
assert.strictEqual(f1.name, undefined);
console.log('✓ 构造函数返回对象时，返回该对象');

// 构造函数返回原始值（应忽略，返回新对象）
function ReturnsPrimitive() {
  this.val = 42;
  return 123; // 返回number，忽略
}
const rp = myNew(ReturnsPrimitive);
assert.strictEqual(rp.val, 42);
assert.strictEqual(typeof rp, 'object');
console.log('✓ 构造函数返回原始值时，返回新创建的对象');

// 构造函数返回null（null是原始值类处理，返回新对象）
function ReturnsNull() {
  this.ok = true;
  return null;
}
const rn = myNew(ReturnsNull);
assert.strictEqual(rn.ok, true);
console.log('✓ 构造函数返回null时，返回新对象');

// 构造函数返回函数
function ReturnsFn() {
  return function() { return 'returned fn'; };
}
const rf = myNew(ReturnsFn);
assert.strictEqual(typeof rf, 'function');
assert.strictEqual(rf(), 'returned fn');
console.log('✓ 构造函数返回函数时，返回该函数');

// 原型链正确设置
function Parent() { this.parentProp = 'parent'; }
Parent.prototype.parentMethod = () => 'pm';
function Child() {
  Parent.call(this);
  this.childProp = 'child';
}
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;
Child.prototype.childMethod = () => 'cm';

const child = myNew(Child);
assert.strictEqual(child.parentProp, 'parent');
assert.strictEqual(child.childProp, 'child');
assert.strictEqual(child.parentMethod(), 'pm');
assert.strictEqual(child.childMethod(), 'cm');
assert.strictEqual(myInstanceof(child, Child), true);
assert.strictEqual(myInstanceof(child, Parent), true);
console.log('✓ 继承场景下原型链正确');

// 空构造函数（无参数）
function Empty() {}
const e = myNew(Empty);
assert.ok(e instanceof Empty);
assert.ok(myInstanceof(e, Empty));
console.log('✓ 无参数构造函数正常');

// 验证和原生new的一致性
const nativeP = new Person('Bob', 30);
const myP = myNew(Person, 'Bob', 30);
assert.deepStrictEqual({ name: myP.name, age: myP.age }, { name: nativeP.name, age: nativeP.age });
console.log('✓ 和原生new结果一致');

console.log('');
console.log('🎉 所有 instanceof 和 new 测试通过！');
console.log('');
console.log('💡 原理总结：');
console.log('   instanceof = 沿__proto__链找Constructor.prototype');
console.log('   new = 创建空对象+设原型+绑定this执行+处理返回值');
`
  },
  {
    id: "n3-bind-call-apply",
    icon: "🔧",
    group: "第一部分 手写核心模块",
    title: "手写 Function.prototype.bind/call/apply",
    content: `# 手写 Function.prototype.bind/call/apply

\`call\`、\`apply\`、\`bind\` 是JavaScript中改变函数 \`this\` 指向的三大利器。它们是Function.prototype上的方法，每个函数都能调用。

理解它们不仅是面试必考题，更能帮助你深入理解JavaScript中this的绑定规则。

---

## this的绑定规则回顾

先回顾一下this的四种绑定规则（优先级从低到高）：
1. **默认绑定**：独立函数调用，this指向全局对象（严格模式是undefined）
2. **隐式绑定**：obj.fn()，this指向obj
3. **显式绑定**：call/apply/bind，this指向你指定的对象
4. **new绑定**：new Fn()，this指向新创建的对象

优先级：new > bind > call/apply > 隐式 > 默认

这也是为什么我们手写bind的时候要特别处理new调用的情况——new的优先级比bind高，new绑定的函数，this应该是新创建的实例对象，而不是bind绑定的那个对象。

---

## call 和 apply 的实现原理

call和applay的作用是一样的：**立即执行函数，指定函数内的this指向**。唯一区别是传参方式：
- \`fn.call(thisArg, arg1, arg2, arg3)\`：参数列表展开
- \`fn.apply(thisArg, [arg1, arg2, arg3])\`：参数用数组

那怎么实现"指定this执行函数"呢？这里有一个巧妙的技巧：**把函数挂到对象上作为方法，然后通过对象调用它**。

因为根据隐式绑定规则：\`obj.fn()\` 执行时，fn里的this就是obj。

所以核心步骤：
1. 把要执行的函数fn，临时挂到thisArg上作为一个属性（比如thisArg._fn = fn）
2. 通过thisArg._fn(...args)执行，这样fn里的this就是thisArg
3. 执行完删掉临时属性，别污染了原对象
4. 返回执行结果

边界情况处理：
- thisArg如果是null或undefined：非严格模式下指向全局对象（globalThis），严格模式下就是undefined
- thisArg如果是原始类型（string/number/boolean）：需要包装成对应的对象（new String()等），因为原始类型不能加属性

---

## bind 的实现原理

bind和call/apply不同：**它不立即执行函数，而是返回一个新函数**，这个新函数被调用时this指向绑定的对象。bind还支持**柯里化（currying）**——绑定时传一部分参数，调用时再传剩下的参数，两部分会合并。

但bind最复杂的地方是：**new的优先级高于bind**。

什么意思？
\`\`\`javascript
function Person(name) { this.name = name; }  // 声明函数 Person
const BoundPerson = Person.bind({ custom: 'obj' }, 'Tom');  // 定义常量 BoundPerson
const p = new BoundPerson();  // 创建实例 p
// p.name 应该是 'Tom'
// p.__proto__ 应该是 Person.prototype
// p 不是 { custom: 'obj' } 的实例
\`\`\`
看到了吗？当你用new调用bind返回的函数时，bind绑定的thisArg就被忽略了，this指向new出来的新对象。这是因为new绑定优先级最高。

怎么实现这个？我们需要判断返回的bound函数是否被new调用了。怎么判断？**用instanceof**。
- 如果是new调用的，那么函数执行时this instanceof boundFunction === true
- 如果是普通调用，this是全局对象或其他，不是boundFunction的实例

然后原型链也要处理好——boundFunction.prototype应该继承自原函数的prototype，这样new bound()出来的对象instanceof原函数才是true。标准做法是用一个空函数做中转（Object.create的原理），避免直接修改prototype影响原函数。

---

## 开始手写

我们先实现myCall和myApply（它们很像），再实现复杂的myBind，然后测试各种场景。
`,
    code: `// ============================================
// 手写 call/apply/bind
// ============================================

const assert = require('assert');

// ---------- 手写 call ----------
Function.prototype.myCall = function(thisArg, ...args) {
  // this 是调用myCall的函数（fn.myCall中的fn）
  if (typeof this !== 'function') {
    throw new TypeError('myCall must be called on a function');
  }

  // null/undefined 指向全局对象
  if (thisArg === null || thisArg === undefined) {
    thisArg = globalThis;
  }

  // 原始类型包装成对象
  thisArg = Object(thisArg);

  // 创建唯一的symbol key，避免覆盖原有属性
  const fnKey = Symbol('fn');

  // 把函数挂到thisArg上
  thisArg[fnKey] = this;

  // 执行函数：此时this是thisArg（隐式绑定）
  const result = thisArg[fnKey](...args);

  // 删除临时属性，不污染对象
  delete thisArg[fnKey];

  return result;
};

// ---------- 手写 apply ----------
Function.prototype.myApply = function(thisArg, argsArray) {
  if (typeof this !== 'function') {
    throw new TypeError('myApply must be called on a function');
  }

  if (thisArg === null || thisArg === undefined) {
    thisArg = globalThis;
  }

  thisArg = Object(thisArg);

  const fnKey = Symbol('fn');
  thisArg[fnKey] = this;

  // apply的参数是数组（或类数组），处理undefined的情况
  let result;
  if (argsArray === null || argsArray === undefined) {
    result = thisArg[fnKey]();
  } else {
    // 检查是否是类数组
    if (typeof argsArray !== 'object') {
      throw new TypeError('CreateListFromArrayLike called on non-object');
    }
    result = thisArg[fnKey](...argsArray);
  }

  delete thisArg[fnKey];
  return result;
};

// ---------- 手写 bind ----------
Function.prototype.myBind = function(thisArg, ...boundArgs) {
  if (typeof this !== 'function') {
    throw new TypeError('Bind must be called on a function');
  }

  const originalFn = this;

  // 空函数用于原型中转，避免直接new boundFn时修改原函数原型
  function Empty() {}

  function boundFn(...callArgs) {
    // 合并参数：bind时传的 + 调用时传的
    const allArgs = [...boundArgs, ...callArgs];

    // 判断是否是new调用：如果this instanceof boundFn，说明是new调用的
    // new调用时，this绑定到新对象，且新对象的__proto__是boundFn.prototype
    const isNewCall = this instanceof boundFn;

    // new调用时忽略thisArg，用新创建的this；否则用绑定的thisArg
    const context = isNewCall ? this : thisArg;

    return originalFn.myApply(context, allArgs);
  }

  // 原型继承：让boundFn.prototype继承原函数的prototype
  // 这样 new boundFn() 出来的对象 instanceof 原函数 === true
  if (originalFn.prototype) {
    Empty.prototype = originalFn.prototype;
    boundFn.prototype = new Empty();
    // 修正constructor
    boundFn.prototype.constructor = boundFn;
  }

  return boundFn;
};

// ============================================
// 测试 myCall
// ============================================

console.log('=== call 测试 ===');

const obj1 = { name: 'Alice' };
function greet(greeting, punc) {
  return greeting + ', ' + this.name + punc;
}

assert.strictEqual(greet.myCall(obj1, 'Hello', '!'), 'Hello, Alice!');
console.log('✓ call基本功能正常');

// call传数字作为this（会包装成Number对象）
function getThisValue() { return this.valueOf(); }
assert.strictEqual(getThisValue.myCall(42), 42);
console.log('✓ call原始类型thisArg自动包装');

// call null/undefined 指向全局
const globalTest = function() { return this; };
assert.strictEqual(globalTest.myCall(null), globalThis);
assert.strictEqual(globalTest.myCall(undefined), globalThis);
console.log('✓ call null/undefined指向全局对象');

// 用call借用其他对象的方法
const arrLike = { 0: 'a', 1: 'b', length: 2 };
const arrResult = Array.prototype.slice.myCall(arrLike);
assert.deepStrictEqual(arrResult, ['a', 'b']);
console.log('✓ call可用于方法借用（类数组转数组）');

// ============================================
// 测试 myApply
// ============================================

console.log('');
console.log('=== apply 测试 ===');

const obj2 = { x: 10, y: 20 };
function sum() {
  let s = 0;
  for (const key in this) {
    if (typeof this[key] === 'number') s += this[key];
  }
  return s;
}
assert.strictEqual(sum.myApply(obj2), 30);
console.log('✓ apply基本功能正常');

// apply传数组参数
function add(a, b, c) { return a + b + c; }
assert.strictEqual(add.myApply(null, [1, 2, 3]), 6);
console.log('✓ apply数组参数正确');

// apply 不传第二个参数
function noArgs() { return arguments.length; }
assert.strictEqual(noArgs.myApply(null), 0);
console.log('✓ apply无参数时正常');

// Math.max/Math.min 用apply
const numbers = [5, 2, 8, 1, 9];
assert.strictEqual(Math.max.myApply(null, numbers), 9);
assert.strictEqual(Math.min.myApply(null, numbers), 1);
console.log('✓ apply配合Math.max求数组最值');

// ============================================
// 测试 myBind
// ============================================

console.log('');
console.log('=== bind 测试 ===');

const obj3 = { val: 'bound' };
function getVal() { return this.val; }
const boundGetVal = getVal.myBind(obj3);
assert.strictEqual(boundGetVal(), 'bound');
console.log('✓ bind基本this绑定正确');

// bind 柯里化参数
function multiply(a, b, c) { return a * b * c; }
const double = multiply.myBind(null, 2);
assert.strictEqual(double(3, 4), 24); // 2*3*4
const triple = multiply.myBind(null, 2, 3);
assert.strictEqual(triple(4), 24); // 2*3*4
const fixed = multiply.myBind(null, 2, 3, 4);
assert.strictEqual(fixed(), 24);
console.log('✓ bind柯里化参数正确');

// bind后new调用：new优先级高于bind
function Animal(type, name) {
  this.type = type;
  this.name = name;
}
Animal.prototype.speak = function() { return this.type + ':' + this.name; };

const BindToObj = Animal.myBind({ fake: 'obj' }, 'dog');
const pet = new BindToObj('Rex');
assert.strictEqual(pet.name, 'Rex');
assert.strictEqual(pet.type, 'dog');
assert.strictEqual(pet.fake, undefined); // bind的thisArg被忽略
assert.ok(pet instanceof Animal);
assert.strictEqual(pet.speak(), 'dog:Rex');
console.log('✓ new调用bind返回的函数时，new优先级正确，原型链正确');

// bind返回的函数作为普通函数调用
const boundGreet = greet.myBind(obj1, 'Hi');
assert.strictEqual(boundGreet('?'), 'Hi, Alice?');
console.log('✓ bind返回的函数普通调用正常');

// 多次bind：只有第一次bind生效
function showThis() { return this.name; }
const bind1 = showThis.myBind({ name: 'first' });
const bind2 = bind1.myBind({ name: 'second' }); // 这次bind无效
assert.strictEqual(bind2(), 'first');
console.log('✓ 多次bind只有第一次生效（this一旦绑定不可更改）');

console.log('');
console.log('🎉 所有 call/apply/bind 测试通过！');
console.log('');
console.log('💡 关键原理：');
console.log('   call/apply核心技巧：把函数挂到对象上，利用隐式绑定规则改变this');
console.log('   bind核心难点：需要判断是否被new调用，new优先级高于bind');
console.log('   参数合并：绑定时传的参数 + 调用时传的参数 拼接在一起');
`
  },
  {
    id: "n3-debounce-throttle",
    icon: "⏱️",
    group: "第一部分 手写核心模块",
    title: "手写防抖（debounce）与节流（throttle）",
    content: `# 手写防抖（debounce）与节流（throttle）

防抖和节流是前端性能优化中最常用的两个工具函数。它们的作用都是**控制函数在高频触发场景下的执行频率**，但策略不同。

几乎每个前端面试都会考到这两个函数，让我们从原理到实现彻底搞懂。

---

## 为什么需要防抖和节流？

想象这些场景：
- 搜索框，用户每输入一个字符就发一次请求——输入快的话一秒可能发10个请求，浪费带宽
- 窗口resize事件，拖拽窗口的时候每秒触发几十次——每次都重排重绘会很卡
- 滚动事件scroll，滚动时每秒触发很多次——里面如果有复杂计算或DOM操作就会卡
- 按钮点击，用户手快点了两下——不防抖就会提交两次表单
- mousemove跟踪鼠标位置，移动鼠标时触发极频繁

这些场景的共同特点：**事件触发频率远高于我们需要的执行频率**。防抖和节流就是解决这个问题的两种不同策略。

---

## 防抖（Debounce）：最后一次触发后等n秒再执行

### 核心原理
当事件触发时，**不立即执行**，而是等待n毫秒。如果这n毫秒内又触发了，就**重新计时**。只有等了n毫秒都没有新的触发，才真正执行。

就像坐电梯：门快要关了，又有人进来，门又打开重新等。一直等到有一段时间没人进来了，电梯才关门（执行）。

### 应用场景
- **搜索框输入联想**：等用户停下来输入了才发请求，不是每个字符都发
- **窗口resize事件**：等窗口大小调整完了再重新计算布局
- **表单验证**：用户输完一个字段后等一下再验证
- **按钮防重复提交**：点了按钮后短时间内再点无效（其实节流更适合，但防抖也能用）

### 立即执行版本（leading）
防抖还有一个可选的模式：**立即执行（leading: true）**。第一次触发就立即执行，然后n毫秒内的触发都被忽略，n毫秒后才重新触发。

这种模式适合按钮点击——第一次点击立即响应，接下来的重复点击忽略，防止双击提交。

### cancel 和 flush
一个完整的防抖函数还应该提供：
- \`cancel()\`：取消等待中的执行，可以取消防抖
- \`flush()\`：立即执行等待中的函数，不用等了

---

## 节流（Throttle）：n秒内只执行一次

### 核心原理
不管事件触发多频繁，**保证在n毫秒内只执行一次**。

和防抖的区别：防抖是"等停下来再执行"，节流是"按固定频率执行"。

就像红绿灯：不管来多少车，固定间隔放行一次；或者像技能冷却时间，放了一个技能后要等CD才能放下一个。

### 应用场景
- **滚动加载（无限滚动）**：判断是否滚动到底部加载更多，不需要每次scroll都判断，节流到比如200ms一次就行
- **mousemove跟随**：鼠标移动时跟随效果，不需要每帧都执行（虽然requestAnimationFrame更适合）
- **按钮防重复点击**：点了按钮后1秒内不能再点（用leading模式）
- **进度条更新**：上传下载进度，不用每个字节都更新UI，固定频率更新即可

### leading 和 trailing 选项
节流也有两个选项：
- \`leading: true\`：第一次触发时立即执行（头执行）
- \`trailing: true\`：最后一次触发后，周期结束时再执行一次（尾执行）

常见组合：
- { leading: true, trailing: true }：头和尾都执行（默认，最常用）
- { leading: true, trailing: false }：只在头执行，尾不执行（类似技能CD）
- { leading: false, trailing: true }：头不执行，尾执行（类似防抖但保证频率）

---

## 实现方式

### 防抖的实现
用**定时器**：每次触发先clearTimeout之前的定时器，然后setTimeout新的定时器。如果有immediate选项，第一次触发时判断是否有定时器在跑，没有就立即执行。

### 节流的实现
有两种常见实现：
1. **时间戳版**：记录上次执行时间，每次触发时比较当前时间和上次时间，差超过wait就执行
2. **定时器版**：设置定时器，wait毫秒后执行并清掉定时器，定时器存在期间触发就忽略
3. **时间戳+定时器结合**：这是最完整的实现，能同时支持leading和trailing

为什么结合版最好？
- 时间戳版能保证第一次立即执行（leading），但最后一次触发后如果还没到间隔不会再执行（trailing丢失）
- 定时器版能保证最后一次会执行（trailing），但第一次触发不会立即执行，要等wait毫秒
- 结合版：用时间戳处理leading，用定时器处理trailing，完美

---

## 开始实现

我们实现完整的debounce（支持immediate、cancel、flush）和throttle（支持leading/trailing），然后用计数器模拟事件触发验证效果。
`,
    code: `// ============================================
// 手写防抖(debounce)和节流(throttle)
// ============================================

const assert = require('assert');

// ---------- 防抖 debounce ----------
function debounce(fn, wait, options = {}) {
  let timer = null;
  let lastArgs = null;
  let lastThis = null;
  let result;

  const { leading = false, trailing = true } = options;

  function invokeFunc() {
    if (lastArgs) {
      result = fn.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
    }
    return result;
  }

  function startTimer() {
    timer = setTimeout(() => {
      timer = null;
      if (trailing) {
        invokeFunc();
      }
    }, wait);
  }

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;

    // 如果定时器存在，说明还在等待期，清除重新计时
    if (timer) {
      clearTimeout(timer);
    }

    // leading模式：如果没有定时器在跑（第一次或冷却结束），立即执行
    if (leading && !timer) {
      invokeFunc();
      // 启动定时器，wait后清空，这段时间内的触发都只重置定时器
      startTimer();
    } else {
      // trailing模式：设置定时器，wait后执行
      startTimer();
    }

    return result;
  }

  // 取消
  debounced.cancel = function() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    lastArgs = lastThis = null;
  };

  // 立即执行
  debounced.flush = function() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
      return invokeFunc();
    }
    return result;
  };

  return debounced;
}

// ---------- 节流 throttle ----------
function throttle(fn, wait, options = {}) {
  let timer = null;
  let lastArgs = null;
  let lastThis = null;
  let lastInvokeTime = 0;
  let result;

  const { leading = true, trailing = true } = options;

  function invokeFunc(time) {
    result = fn.apply(lastThis, lastArgs);
    lastInvokeTime = time;
    lastArgs = lastThis = null;
    return result;
  }

  function startTimer() {
    timer = setTimeout(() => {
      timer = null;
      if (trailing && lastArgs) {
        const now = Date.now();
        invokeFunc(now);
        // 执行完trailing后，如果还有持续触发，继续设置定时器
        if (lastArgs) {
          startTimer();
        } else {
          lastInvokeTime = !leading ? 0 : Date.now();
        }
      } else {
        lastInvokeTime = !leading ? 0 : Date.now();
      }
    }, wait);
  }

  function throttled(...args) {
    const now = Date.now();
    const isFirstCall = lastInvokeTime === 0;

    lastArgs = args;
    lastThis = this;

    // 计算距离上次执行过了多久
    const timeSinceLast = now - lastInvokeTime;

    // 如果是第一次调用且leading为false，不立即执行，等待wait后trailing
    if (isFirstCall && !leading) {
      lastInvokeTime = now; // 记录时间，让后续计算remaining正确
      if (!timer && trailing) {
        startTimer();
      }
      return result;
    }

    // 时间到了，可以执行了（leading或冷却结束）
    if (timeSinceLast >= wait) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastInvokeTime = now;
      result = fn.apply(this, args);
      lastArgs = lastThis = null;
    } else if (!timer && trailing) {
      // 还没到时间，设置trailing定时器
      startTimer();
    }

    return result;
  }

  throttled.cancel = function() {
    if (timer) clearTimeout(timer);
    timer = null;
    lastInvokeTime = 0;
    lastArgs = lastThis = null;
  };

  return throttled;
}

// ============================================
// 测试代码
// ============================================

console.log('=== 防抖测试 ===');

// 模拟快速触发，验证最后执行一次
async function testDebounceBasic() {
  let count = 0;
  const debounced = debounce(() => count++, 100);

  // 快速连续触发5次
  debounced();
  debounced();
  debounced();
  debounced();
  debounced();

  // 还没到100ms，应该还没执行
  assert.strictEqual(count, 0, '防抖期间不执行');
  console.log('✓ 防抖快速触发期间不执行');

  await new Promise(r => setTimeout(r, 200));
  assert.strictEqual(count, 1, '防抖结束后只执行一次');
  console.log('✓ 防抖结束后执行一次');
}

async function testDebounceImmediate() {
  let count = 0;
  const debounced = debounce(() => count++, 100, { leading: true, trailing: false });

  debounced(); // 立即执行
  assert.strictEqual(count, 1, 'leading模式第一次立即执行');
  console.log('✓ leading模式立即执行');

  debounced(); // 被忽略
  debounced(); // 被忽略
  assert.strictEqual(count, 1, '冷却期内不执行');
  console.log('✓ 冷却期内触发被忽略');

  await new Promise(r => setTimeout(r, 200));
  debounced();
  assert.strictEqual(count, 2, '冷却结束后再次触发立即执行');
  console.log('✓ 冷却结束后可再次触发');
}

async function testDebounceCancel() {
  let count = 0;
  const debounced = debounce(() => count++, 100);

  debounced();
  debounced.cancel(); // 取消

  await new Promise(r => setTimeout(r, 200));
  assert.strictEqual(count, 0, 'cancel后不执行');
  console.log('✓ cancel取消防抖执行');
}

async function testDebounceFlush() {
  let value = 0;
  const debounced = debounce((n) => { value = n; }, 100);

  debounced(42);
  assert.strictEqual(value, 0, 'flush前未执行');
  const flushedValue = debounced.flush();
  assert.strictEqual(value, 42, 'flush立即执行');
  console.log('✓ flush立即执行');
}

async function testDebounceArgs() {
  let lastArg = null;
  const debounced = debounce((x) => { lastArg = x; }, 50);

  debounced(1);
  debounced(2);
  debounced(3); // 最后一次的参数

  await new Promise(r => setTimeout(r, 100));
  assert.strictEqual(lastArg, 3, '防抖使用最后一次触发的参数');
  console.log('✓ 防抖使用最后一次的参数');
}

async function runDebounceTests() {
  await testDebounceBasic();
  await testDebounceImmediate();
  await testDebounceCancel();
  testDebounceFlush();
  await testDebounceArgs();
}

console.log('');
console.log('=== 节流测试 ===');

async function testThrottleBasic() {
  let count = 0;
  const throttled = throttle(() => count++, 100);

  throttled(); // 立即执行
  assert.strictEqual(count, 1, '节流第一次立即执行');
  console.log('✓ 节流leading立即执行');

  throttled(); // 被节流
  throttled(); // 被节流
  await new Promise(r => setTimeout(r, 50));
  assert.strictEqual(count, 1, '节流期间不重复执行');
  console.log('✓ 节流间隔期内不执行');

  await new Promise(r => setTimeout(r, 100));
  // trailing应该执行了最后一次
  assert.ok(count >= 2, '节流周期结束后trailing执行');
  console.log('✓ 节流trailing在周期结束执行');
}

async function testThrottleNoLeading() {
  let count = 0;
  const throttled = throttle(() => count++, 100, { leading: false, trailing: true });

  throttled(); // 不立即执行
  assert.strictEqual(count, 0, 'leading:false时不立即执行');
  console.log('✓ leading:false时首次不立即执行');

  await new Promise(r => setTimeout(r, 150));
  assert.strictEqual(count, 1, 'wait后trailing执行');
  console.log('✓ trailing在wait后执行');
}

async function testThrottleFrequency() {
  let timestamps = [];
  const throttled = throttle(() => {
    timestamps.push(Date.now());
  }, 100, { leading: true, trailing: false });

  // 在300ms内每20ms触发一次
  for (let i = 0; i < 15; i++) {
    throttled();
    await new Promise(r => setTimeout(r, 20));
  }

  // 检查执行间隔：相邻执行时间差应该 >= 100ms
  console.log('  执行次数:', timestamps.length, '次');
  console.log('  执行时间戳:', timestamps.map(t => t - timestamps[0]).join('ms, ') + 'ms');

  for (let i = 1; i < timestamps.length; i++) {
    const diff = timestamps[i] - timestamps[i - 1];
    assert.ok(diff >= 90, '节流间隔应约100ms，实际: ' + diff);
  }
  console.log('✓ 节流保证执行频率约100ms一次');
}

async function testThrottleCancel() {
  let count = 0;
  const throttled = throttle(() => count++, 100);

  throttled();
  assert.strictEqual(count, 1);
  throttled.cancel();

  await new Promise(r => setTimeout(r, 150));
  assert.strictEqual(count, 1, 'cancel后trailing不执行');
  console.log('✓ cancel取消节流的trailing执行');
}

async function runThrottleTests() {
  await testThrottleBasic();
  await testThrottleNoLeading();
  await testThrottleFrequency();
  await testThrottleCancel();
}

async function runAllTests() {
  await runDebounceTests();
  console.log('');
  await runThrottleTests();
  console.log('');
  console.log('=== 防抖vs节流 对比演示 ===');
  console.log('模拟每10ms触发一次，共触发20次（200ms），wait=100ms');

  let debounceCount = 0;
  let throttleCount = 0;
  const db = debounce(() => debounceCount++, 100);
  const th = throttle(() => throttleCount++, 100);

  const start = Date.now();
  const interval = setInterval(() => {
    db();
    th();
    if (Date.now() - start > 250) {
      clearInterval(interval);
      setTimeout(() => {
        console.log('  防抖执行次数:', debounceCount, '（只执行最后一次）');
        console.log('  节流执行次数:', throttleCount, '（约100ms一次，执行2-3次）');
        console.log('');
        console.log('🎉 所有防抖节流测试完成！');
        console.log('');
        console.log('💡 核心区别：');
        console.log('   防抖(debounce)：事件停下来n毫秒后才执行，适合搜索框、resize');
        console.log('   节流(throttle)：n毫秒内最多执行一次，适合滚动加载、按钮防重');
      }, 200);
    }
  }, 10);
}

runAllTests();
`
  }
];
