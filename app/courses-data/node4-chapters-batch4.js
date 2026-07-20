export const chapters = [
  {
    id: "n4-callback",
    group: "第三部分 异步编程",
    icon: "📞",
    title: "回调函数：Node.js 异步编程的起点",
    content: `# 回调函数：Node.js 异步编程的起点

回调函数（Callback）是 Node.js 异步编程最基础、最核心的概念。理解回调是掌握 Promise、async/await 的前提，因为它们本质上都是回调的不同封装形式。

## 一、什么是回调函数

### 1.1 回调的定义

**回调函数**就是一个被当作参数传递给另一个函数的函数，它会在外部函数完成某个操作后被"回调"（调用）。

\`\`\`javascript
// 普通函数：接收数据并处理
function greet(name) {
  console.log('你好，' + name);
}

// 高阶函数：接收另一个函数作为参数
function processUserInput(callback) {
  const name = '张三';
  callback(name); // 回调执行
}

processUserInput(greet); // 把 greet 作为回调传入
\`\`\`

这是同步回调——立即执行。但 Node.js 中最常见的是**异步回调**，它不会立即执行，而是等到某个异步操作（如文件读取、网络请求）完成后才执行。

### 1.2 为什么需要回调

JavaScript 在浏览器和 Node.js 中都是**单线程**的。如果使用同步方式执行耗时操作（如读取大文件、查询数据库），整个线程就会被阻塞——什么都做不了，只能等待。

回调函数提供了一种**非阻塞**的方式：发起异步操作时，传入一个回调函数，然后继续执行后面的代码。等操作完成了，再调用回调函数处理结果。

> 💡 **生活类比**：你去咖啡店点咖啡，不需要站在柜台前一直等着（同步阻塞）。你可以找座位坐下玩手机，咖啡做好了店员叫你（回调），你再去取。

---

## 二、Error-First 回调约定（错误优先回调）

Node.js 形成了一个标准约定：**错误优先的回调模式**。这是几乎所有 Node.js 核心 API 都遵循的规范。

### 2.1 约定规则

1. 回调函数的**第一个参数**保留给错误对象 \`err\`
   - 如果操作成功，\`err\` 为 \`null\` 或 \`undefined\`
   - 如果操作失败，\`err\` 是一个 \`Error\` 对象，包含错误信息
2. 从**第二个参数**开始，才是操作成功返回的数据

### 2.2 为什么要错误优先

- 强制开发者**必须处理错误**——每次回调第一眼就看到 err 参数
- 避免用 \`try/catch\` 无法捕获异步错误的问题
- 统一的错误处理风格，所有 API 行为一致

\`\`\`javascript
const fs = require('fs');

// fs.readFile 是典型的 error-first 回调
fs.readFile('example.txt', 'utf8', function(err, data) {
  if (err) {
    // 第一个参数是错误，必须先检查
    console.error('读取文件失败:', err.message);
    return; // 出错了就不要继续执行了
  }
  // 第二个参数才是成功的数据
  console.log('文件内容:', data);
});
\`\`\`

---

## 三、同步 vs 异步回调

### 3.1 同步回调

同步回调在函数返回之前就执行了：

\`\`\`javascript
const arr = [1, 2, 3];
// forEach 的回调是同步执行的
console.log('开始');
arr.forEach(item => {
  console.log('处理', item);
});
console.log('结束');
// 输出顺序：开始 → 处理1 → 处理2 → 处理3 → 结束
\`\`\`

### 3.2 异步回调

异步回调在当前代码执行完之后，未来某个时间点才执行：

\`\`\`javascript
console.log('开始');
setTimeout(() => {
  console.log('定时器回调执行');
}, 1000);
console.log('结束');
// 输出顺序：开始 → 结束 → (1秒后)定时器回调执行
\`\`\`

> ⚠️ **关键区别**：异步回调不会阻塞后续代码的执行。理解这一点是理解整个 Node.js 异步模型的基础。

---

## 四、回调地狱（Callback Hell）

回调虽然解决了非阻塞问题，但也带来了著名的"回调地狱"问题。

### 4.1 什么是回调地狱

当你需要按顺序执行多个异步操作时，代码会层层嵌套，形成一个"金字塔"形状，难以阅读和维护：

\`\`\`javascript
fs.readFile('file1.txt', 'utf8', (err, data1) => {
  if (err) throw err;
  fs.readFile('file2.txt', 'utf8', (err, data2) {
    if (err) throw err;
    fs.readFile('file3.txt', 'utf8', (err, data3) {
      if (err) throw err;
      // 嵌套越来越深...
      console.log(data1, data2, data3);
    });
  });
});
\`\`\`

这被称为**回调地狱（Callback Hell）**或**末日金字塔（Pyramid of Doom）**。

### 4.2 回调地狱的问题

1. **代码可读性差**：嵌套层级深，眼睛要从左上角看到右下角
2. **错误处理重复**：每一层都要写 \`if (err)\` 检查
3. **难以重构**：调整执行顺序很麻烦
4. **闭包引用问题**：多层嵌套容易产生意外的变量引用
5. **调试困难**：堆栈跟踪不直观

### 4.3 如何避免回调地狱

**方法一：具名函数拆分**

把匿名回调提取成具名函数：

\`\`\`javascript
function readFile3(err, data3) {
  if (err) return handleError(err);
  console.log('完成');
}

function readFile2(err, data2) {
  if (err) return handleError(err);
  fs.readFile('file3.txt', 'utf8', readFile3);
}

function readFile1(err, data1) {
  if (err) return handleError(err);
  fs.readFile('file2.txt', 'utf8', readFile2);
}

fs.readFile('file1.txt', 'utf8', readFile1);
\`\`\`

**方法二：模块化**

把相关操作封装到独立模块中。

**方法三：使用 Promise 或 async/await**

这是现代 JavaScript 的标准解决方案——把回调风格转换成 Promise 风格，再用 async/await 写线性代码。我们在后续章节详细讲解。

---

## 五、回调的执行模式

### 5.1 顺序执行（串行）

一个操作完成后再开始下一个，适合有依赖关系的任务：

\`\`\`javascript
// 按顺序读取文件 A → B → C
function readSequential(callback) {
  fs.readFile('a.txt', 'utf8', (err, a) => {
    if (err) return callback(err);
    fs.readFile('b.txt', 'utf8', (err, b) => {
      if (err) return callback(err);
      fs.readFile('c.txt', 'utf8', (err, c) => {
        if (err) return callback(err);
        callback(null, [a, b, c]);
      });
    });
  });
}
\`\`\`

### 5.2 并行执行

同时发起多个操作，等全部完成后处理结果。适合没有依赖关系的任务，速度更快：

\`\`\`javascript
// 同时读取文件 A、B、C，等全部完成后一起返回
function readParallel(callback) {
  const results = {};
  let pending = 3;

  function done(err) {
    if (err) {
      callback(err);
      callback = () => {}; // 防止多次回调
      return;
    }
    if (--pending === 0) {
      callback(null, results);
    }
  }

  fs.readFile('a.txt', 'utf8', (err, data) => {
    if (err) return done(err);
    results.a = data;
    done();
  });

  fs.readFile('b.txt', 'utf8', (err, data) => {
    if (err) return done(err);
    results.b = data;
    done();
  });

  fs.readFile('c.txt', 'utf8', (err, data) => {
    if (err) return done(err);
    results.c = data;
    done();
  });
}
\`\`\`

> 💡 **注意**：并行不是"同时运行"（多线程），而是"同时发起"——因为 Node.js 单线程，I/O 操作本身是在后台由系统处理的，回调才回到 JS 线程执行。

---

## 六、回调设计最佳实践

1. **始终遵循 error-first 约定**：第一个参数 err，第二个参数开始是数据
2. **回调必须被调用且只调用一次**：确保每个路径都调用回调，特别是错误分支
3. **回调要么是同步要么是异步，不能混合**：避免 Zalgo 问题（有时候同步有时候异步）
4. **在回调中明确 return**：\`if (err) return callback(err)\` 防止继续执行
5. **不要在回调中嵌套太多层**：超过 3 层就考虑重构或使用 Promise

回调是理解 Node.js 异步编程的基石。虽然现代代码很少直接写回调了，但你使用的每个框架、每个库底层都在使用回调。理解回调能帮你读懂源码、调试问题，也是理解 Promise 和 async/await 的前提。
`,
    code: `// ============================================
// 回调函数（Callback）完整示例
// 运行方式：node n4-callback-demo.js
// ============================================

const fs = require('fs');
const path = require('path');
const os = require('os');

// ============================================
// --- Demo 1：理解什么是回调函数 ---
// ============================================
console.log('===== Demo 1：回调函数基础 =====');

// 这是一个普通的处理函数
function processResult(result) {
  console.log('处理结果:', result);
}

// 这是一个高阶函数 - 接收回调作为参数
function add(a, b, callback) {
  const sum = a + b;
  callback(sum); // 在合适的时机调用回调
}

// 调用时传入回调函数
add(3, 5, processResult);

// 也可以直接传入匿名函数
add(10, 20, function(result) {
  console.log('匿名回调结果:', result);
});

// 箭头函数形式的回调
add(100, 200, result => console.log('箭头回调结果:', result));

console.log('');

// ============================================
// --- Demo 2：同步回调 vs 异步回调 ---
// ============================================
console.log('===== Demo 2：同步回调 vs 异步回调 =====');

// 同步回调 - forEach 的回调是同步执行的
const numbers = [1, 2, 3];
console.log('同步 forEach 开始');
numbers.forEach((num, index) => {
  console.log(\`  索引 \${index}: 值 \${num}\`);
});
console.log('同步 forEach 结束');

console.log('');

// 异步回调 - setTimeout 是异步的
console.log('异步 setTimeout 开始');
setTimeout(() => {
  console.log('  setTimeout 回调执行了！');
}, 500);
console.log('异步 setTimeout 结束（注意：回调还没执行！）');

// 等异步操作完成
setTimeout(() => {
  console.log('');

  // ============================================
  // --- Demo 3：Error-First 回调（错误优先）---
  // ============================================
  console.log('===== Demo 3：Error-First 回调模式 =====');

  // Node.js 核心 API 都使用 error-first 模式
  // 尝试读取一个不存在的文件
  fs.readFile('/this/path/does/not/exist.txt', 'utf8', (err, data) => {
    // 第一步：永远先检查错误！
    if (err) {
      console.log('读取失败（预期的错误）:');
      console.log('  错误类型:', err.code);
      console.log('  错误信息:', err.message);
      // 出错后必须 return，避免继续执行
    }
  });

  // 先创建一个测试文件再读取
  const testFile = path.join(os.tmpdir(), 'callback-demo.txt');
  fs.writeFileSync(testFile, '这是回调函数演示文件的内容\\nHello Node.js!');
  console.log('已创建测试文件:', testFile);

  // 读取存在的文件
  fs.readFile(testFile, 'utf8', (err, data) => {
    if (err) {
      console.error('意外错误:', err);
      return;
    }
    console.log('读取成功！文件内容:');
    console.log(data);

    // ============================================
    // --- Demo 4：回调地狱（Callback Hell）演示 ---
    // ============================================
    console.log('\\n===== Demo 4：回调地狱演示 =====');
    console.log('（层层嵌套的金字塔结构）');

    // 创建三个临时文件用于演示
    const file1 = path.join(os.tmpdir(), 'file1.txt');
    const file2 = path.join(os.tmpdir(), 'file2.txt');
    const file3 = path.join(os.tmpdir(), 'file3.txt');

    fs.writeFileSync(file1, '第一个文件内容');
    fs.writeFileSync(file2, '第二个文件内容');
    fs.writeFileSync(file3, '第三个文件内容');

    // 这就是典型的回调地狱 - 层层嵌套
    console.log('开始顺序读取文件（回调地狱方式）...');
    const startTime1 = Date.now();

    fs.readFile(file1, 'utf8', (err, data1) => {
      if (err) {
        console.error('读 file1 失败:', err);
        return;
      }
      console.log('  读取 file1:', data1);

      fs.readFile(file2, 'utf8', (err, data2) => {
        if (err) {
          console.error('读 file2 失败:', err);
          return;
        }
        console.log('  读取 file2:', data2);

        fs.readFile(file3, 'utf8', (err, data3) => {
          if (err) {
            console.error('读 file3 失败:', err);
            return;
          }
          console.log('  读取 file3:', data3);
          console.log(\`  顺序读取完成，耗时 \${Date.now() - startTime1}ms\`);

          // ============================================
          // --- Demo 5：用命名函数重构回调地狱 ---
          // ============================================
          console.log('\\n===== Demo 5：重构回调地狱（命名函数）=====');

          // 把每个回调拆分成独立的命名函数
          function readFile3(err, data3) {
            if (err) {
              console.error('错误:', err);
              return;
            }
            console.log('  [重构后] 读取 file3:', data3);
            console.log('  重构后的顺序读取完成');
            demo6Parallel();
          }

          function readFile2(err, data2) {
            if (err) {
              console.error('错误:', err);
              return;
            }
            console.log('  [重构后] 读取 file2:', data2);
            fs.readFile(file3, 'utf8', readFile3);
          }

          function readFile1(err, data1) {
            if (err) {
              console.error('错误:', err);
              return;
            }
            console.log('  [重构后] 读取 file1:', data1);
            fs.readFile(file2, 'utf8', readFile2);
          }

          console.log('开始顺序读取文件（重构后）...');
          fs.readFile(file1, 'utf8', readFile1);
        });
      });
    });
  });

  // ============================================
  // --- Demo 6：并行执行（同时发起所有操作）---
  // ============================================
  function demo6Parallel() {
    console.log('\\n===== Demo 6：并行执行模式 =====');

    const files = [file1, file2, file3];
    const results = [];
    let completedCount = 0;
    let hasError = false;
    const startTime2 = Date.now();

    console.log('同时发起 3 个文件读取请求...');

    files.forEach((filePath, index) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (hasError) return; // 已经出错了，不再处理

        if (err) {
          hasError = true;
          console.error('读取失败:', err);
          return;
        }

        results[index] = data;
        completedCount++;
        console.log(\`  文件 \${index + 1} 读取完成\`);

        // 当所有文件都读完了
        if (completedCount === files.length) {
          console.log(\`  所有文件并行读取完成，耗时 \${Date.now() - startTime2}ms\`);
          console.log('  结果:', results);
          demo7CustomAsync();
        }
      });
    });
  }
}, 100);

// ============================================
// --- Demo 7：自定义异步函数（封装回调）---
// ============================================
function demo7CustomAsync() {
  console.log('\\n===== Demo 7：自定义 error-first 异步函数 =====');

  // 模拟一个异步数据库查询操作
  function queryDatabase(sql, callback) {
    console.log(\`  执行 SQL: \${sql}\`);

    // 模拟网络/IO延迟
    setTimeout(() => {
      // 模拟随机错误（20%概率出错）
      if (Math.random() < 0.2) {
        const error = new Error('数据库连接超时');
        error.code = 'DB_TIMEOUT';
        callback(error); // 错误优先！第一个参数是错误
        return;
      }

      // 模拟查询结果
      const mockResult = [
        { id: 1, name: '张三' },
        { id: 2, name: '李四' },
      ];
      callback(null, mockResult); // 成功时第一个参数是 null
    }, 300);
  }

  // 使用自定义的异步函数
  queryDatabase('SELECT * FROM users', (err, results) => {
    if (err) {
      console.log('  查询失败:', err.message);
    } else {
      console.log('  查询成功，结果数量:', results.length);
      console.log('  第一条记录:', results[0]);
    }

    demo8CallbackGuard();
  });
}

// ============================================
// --- Demo 8：回调防护（防止多次回调）---
// ============================================
function demo8CallbackGuard() {
  console.log('\\n===== Demo 8：回调防护（避免多次调用回调）=====');

  function dangerousAsyncOperation(callback) {
    // 错误示例：某些分支可能多次调用回调！
    setTimeout(() => {
      callback(null, '第一次结果');
      // 下面这行如果不注释掉，回调会被调用两次 - 这是 BUG！
      // callback(null, '第二次结果 - 不应该出现！');
    }, 100);
  }

  // 使用 called 标志防止多次回调
  function safeAsyncOperation(callback) {
    let called = false;

    function guardedCallback(err, data) {
      if (called) {
        console.log('  ⚠️ 警告：回调试图被多次调用，已阻止！');
        return;
      }
      called = true;
      callback(err, data);
    }

    setTimeout(() => {
      guardedCallback(null, '安全的结果');
      // 即使再次调用也不会出问题
      guardedCallback(null, '这次调用会被忽略');
    }, 100);
  }

  safeAsyncOperation((err, result) => {
    console.log('  安全操作结果:', result);
    console.log('\\n===== 所有演示完成 =====');
    console.log('\\n📝 总结：');
    console.log('1. 回调是作为参数传递的函数，在异步操作完成后执行');
    console.log('2. Node.js 使用 error-first 约定：第一个参数是 err');
    console.log('3. 回调地狱可以通过命名函数、模块化来缓解');
    console.log('4. 并行执行比串行更快，但需要用计数器跟踪完成数');
    console.log('5. 确保回调只调用一次，出错时 return 终止执行');
  });
}

console.log('等待异步操作完成...');
`,
  },
  {
    id: "n4-promise-basics",
    group: "第三部分 异步编程",
    icon: "🤝",
    title: "Promise 基础：告别回调地狱",
    content: `# Promise 基础：告别回调地狱

Promise 是 ES6（ES2015）引入的异步编程解决方案，比回调更强大、更优雅。它是现代 JavaScript 异步编程的基石，也是 async/await 的底层基础。

## 一、为什么需要 Promise

回调函数虽然解决了异步问题，但有几个明显的缺陷：

1. **回调地狱**：多层嵌套导致代码横向发展
2. **错误处理冗余**：每个回调都要检查 err
3. **控制反转**：回调的调用权交给了第三方，你无法确定回调何时被调用、调用几次
4. **并行/串行组合困难**：手写并行逻辑需要计数器

Promise 通过链式调用（.then()）把嵌套的异步操作变成线性的"流水线"，完美解决了这些问题。

> 💡 **Promise 的含义**：Promise 是一个"承诺"——它承诺在未来某个时刻返回结果（成功或失败），你可以用标准的方式接收这个结果。

---

## 二、Promise 的三种状态

每个 Promise 对象必定处于以下三种状态之一：

| 状态 | 含义 | 说明 |
|------|------|------|
| **pending** | 进行中 | 初始状态，既没有成功也没有失败 |
| **fulfilled** | 已成功 | 操作成功完成，有一个返回值 |
| **rejected** | 已失败 | 操作失败，有一个错误原因 |

### 状态转换规则

- 状态只能从 pending 变为 fulfilled，或者从 pending 变为 rejected
- **一旦状态改变就不可逆**——fulfilled 不能变回 pending，rejected 也不能变回 fulfilled
- 状态改变后，会一直保持这个结果，不会再变

\`\`\`
   pending
   /    \\
  /      \\
fulfilled  rejected
(定型)    (定型)
\`\`\`

---

## 三、创建 Promise

### 3.1 基本语法

使用 \`new Promise()\` 构造函数创建 Promise：

\`\`\`javascript
const promise = new Promise((resolve, reject) => {
  // 这里写异步操作
  // 成功时调用 resolve(value)
  // 失败时调用 reject(error)
});
\`\`\`

构造函数接收一个函数（称为 **executor**），executor 有两个参数：
- \`resolve\`：将 Promise 标记为 fulfilled，传入成功结果
- \`reject\`：将 Promise 标记为 rejected，传入错误对象

executor **立即同步执行**（在创建 Promise 的瞬间就执行）。

### 3.2 简单示例

\`\`\`javascript
const p = new Promise((resolve, reject) => {
  console.log('Promise 执行器开始执行');
  setTimeout(() => {
    const random = Math.random();
    if (random > 0.5) {
      resolve('成功！随机数是: ' + random);
    } else {
      reject(new Error('失败！随机数太小了: ' + random));
    }
  }, 1000);
});
\`\`\`

---

## 四、.then()、.catch()、.finally()

创建 Promise 后，用这三个方法来处理结果：

### 4.1 .then() - 处理成功和失败

\`\`\`javascript
promise.then(
  function(value) { /* 成功时执行 */ },
  function(error) { /* 失败时执行（可选）*/ }
);
\`\`\`

- 第一个参数是 fulfilled 时的回调
- 第二个参数（可选）是 rejected 时的回调
- **.then() 返回一个新的 Promise**，因此可以链式调用

### 4.2 .catch() - 捕获错误

\`\`\`javascript
promise.catch(function(error) { /* 处理错误 */ });
\`\`\`

\`.catch(fn)\` 等价于 \`.then(null, fn)\`，是语法糖，专门用来处理错误。

### 4.3 .finally() - 无论成功失败都执行

\`\`\`javascript
promise.finally(function() { /* 总是执行 */ });
\`\`\`

- 不接收参数（不知道前面是成功还是失败）
- 返回值会被忽略
- 常用于清理操作（如隐藏加载动画、关闭数据库连接）

### 4.4 链式调用示例

\`\`\`javascript
readFilePromise('file.txt')
  .then(data => {
    console.log('文件内容:', data);
    return processData(data); // 返回另一个 Promise
  })
  .then(result => {
    console.log('处理完成:', result);
  })
  .catch(err => {
    // 前面任何一个环节出错都会到这里
    console.error('出错了:', err);
  })
  .finally(() => {
    console.log('操作结束（无论成功失败）');
  });
\`\`\`

> ✅ **关键点**：链式调用中，错误会沿着链向下传递，直到被 .catch() 捕获。这比每个回调单独处理错误简洁得多！

---

## 五、Promise.resolve() 和 Promise.reject()

这两个是快速创建已定型 Promise 的静态方法。

### 5.1 Promise.resolve(value)

快速创建一个 fulfilled 状态的 Promise：

\`\`\`javascript
// 等价于 new Promise(resolve => resolve(42))
const p = Promise.resolve(42);
p.then(value => console.log(value)); // 42

// 如果传入的是 Promise，直接返回这个 Promise
const p2 = Promise.resolve(p);
console.log(p2 === p); // true
\`\`\`

### 5.2 Promise.reject(error)

快速创建一个 rejected 状态的 Promise：

\`\`\`javascript
// 等价于 new Promise((_, reject) => reject(new Error('fail')))
const p = Promise.reject(new Error('出错了'));
p.catch(err => console.error(err.message)); // 出错了
\`\`\`

---

## 六、Promise 化：将回调函数转为 Promise

Node.js 内置了 \`util.promisify\` 工具，可以把 error-first 风格的回调函数转成返回 Promise 的函数：

\`\`\`javascript
const fs = require('fs');
const util = require('util');

// 将 fs.readFile 转换为 Promise 版本
const readFile = util.promisify(fs.readFile);

// 现在可以用 .then() 了！
readFile('example.txt', 'utf8')
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Node.js 10+ 也提供了 fs.promises API
const fsp = fs.promises;
fsp.readFile('example.txt', 'utf8')
  .then(data => console.log(data));
\`\`\`

### 手动 promisify（理解原理）

\`\`\`javascript
function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}
\`\`\`

---

## 七、.then() 链中的返回值

理解 .then() 回调中返回不同值的行为，是写好 Promise 链的关键：

| 在 .then() 中返回... | 下一个 .then() 收到... |
|----------------------|------------------------|
| 普通值（如 42、'hello'） | 这个值本身 |
| 一个 Promise | 等待这个 Promise 定型后的结果 |
| 不返回（undefined） | undefined |
| 抛出异常（throw）| 进入 .catch() |

\`\`\`javascript
Promise.resolve(1)
  .then(val => {
    console.log(val); // 1
    return val + 1;  // 返回普通值
  })
  .then(val => {
    console.log(val); // 2
    return Promise.resolve(val * 10); // 返回 Promise
  })
  .then(val => {
    console.log(val); // 20
    throw new Error('故意出错'); // 抛出异常
  })
  .then(val => {
    console.log('这里不会执行');
  })
  .catch(err => {
    console.log('捕获到错误:', err.message); // 捕获到错误: 故意出错
  });
\`\`\`

---

## 八、常见错误

### 8.1 忘记 return

这是最常见的错误——忘记 return 下一个 Promise，导致链断了：

\`\`\`javascript
// ❌ 错误：忘记 return，后续 .then() 不会等待异步操作
getUser()
  .then(user => {
    saveUser(user); // 没有 return！
  })
  .then(result => {
    console.log(result); // undefined！saveUser 还没完成
  });

// ✅ 正确：return Promise
getUser()
  .then(user => {
    return saveUser(user); // return Promise
  })
  .then(result => {
    console.log(result); // saveUser 完成后的结果
  });
\`\`\`

### 8.2 嵌套 .then()（失去了 Promise 的意义）

\`\`\`javascript
// ❌ 错误：又回到了回调地狱风格
getUser(userId)
  .then(user => {
    getOrders(user.id)
      .then(orders => {
        getOrderDetails(orders[0].id)
          .then(details => {
            // ...
          });
      });
  });

// ✅ 正确：链式调用（扁平化）
getUser(userId)
  .then(user => getOrders(user.id))
  .then(orders => getOrderDetails(orders[0].id))
  .then(details => {
    // ...
  })
  .catch(err => console.error(err));
\`\`\`

Promise 把异步代码从"横向嵌套"变成了"纵向链式"，大大提升了可读性。但它仍然有回调——只是从横向缩进变成了纵向的 .then()。下一章我们将学习 async/await，用同步的写法写异步代码，更上一层楼！
`,
    code: `// ============================================
// Promise 基础完整示例
// 运行方式：node n4-promise-basics-demo.js
// ============================================

const fs = require('fs');
const path = require('path');
const os = require('os');
const util = require('util');

// ============================================
// --- Demo 1：创建第一个 Promise ---
// ============================================
console.log('===== Demo 1：创建和基本使用 Promise =====');

// 创建一个模拟异步操作的 Promise
function readFileWithPromise(filePath, encoding) {
  // 返回一个新的 Promise 对象
  return new Promise((resolve, reject) => {
    console.log(\`  [Promise执行器] 开始读取: \${filePath}\`);

    // 在 executor 中执行传统的异步操作
    fs.readFile(filePath, encoding, (err, data) => {
      if (err) {
        // 失败时调用 reject，传入错误
        reject(err);
      } else {
        // 成功时调用 resolve，传入结果
        resolve(data);
      }
    });
  });
}

// 创建测试文件
const demoFile = path.join(os.tmpdir(), 'promise-demo.txt');
fs.writeFileSync(demoFile, 'Promise 学习演示\\n你好，Promise！');

// 使用 Promise
const promise1 = readFileWithPromise(demoFile, 'utf8');
console.log('  Promise 创建完成，当前状态: pending（进行中）');

// 通过 .then 注册成功回调，通过 .catch 注册失败回调
promise1
  .then(data => {
    console.log('  ✅ 文件读取成功！');
    console.log('  文件内容:', data.replace(/\\n/g, ' '));
  })
  .catch(err => {
    console.log('  ❌ 文件读取失败:', err.message);
  })
  .then(() => {
    demo2States();
  });

// ============================================
// --- Demo 2：Promise 的三种状态 ---
// ============================================
function demo2States() {
  console.log('\\n===== Demo 2：Promise 状态演示 =====');

  // 状态1：pending（进行中）的 Promise
  const pendingPromise = new Promise(() => {
    // 永远不调用 resolve 或 reject，就一直保持 pending
  });
  console.log('  pending Promise 创建了（永远不会完成）');

  // 状态2：fulfilled（已成功）的 Promise
  const fulfilledPromise = Promise.resolve('这是成功的结果');
  console.log('  fulfilled Promise:', fulfilledPromise);
  fulfilledPromise.then(val => console.log('  成功值:', val));

  // 状态3：rejected（已失败）的 Promise
  const rejectedPromise = Promise.reject(new Error('这是一个失败的 Promise'));
  console.log('  rejected Promise（注意会有警告，因为我们稍后才 catch）');
  rejectedPromise.catch(err => console.log('  错误信息:', err.message));

  // 状态不可逆演示
  console.log('\\n  --- 状态不可逆演示 ---');
  const irreversiblePromise = new Promise((resolve, reject) => {
    resolve('第一次 resolve');
    // 下面的调用都会被忽略！状态一旦改变就不能再变
    reject(new Error('这次 reject 无效'));
    resolve('第二次 resolve 也无效');
  });

  irreversiblePromise
    .then(val => console.log('  收到的值:', val))
    .then(() => demo3Chain());
}

// ============================================
// --- Demo 3：链式调用（.then 链）---
// ============================================
function demo3Chain() {
  console.log('\\n===== Demo 3：Promise 链式调用 =====');

  // 模拟异步操作：乘以2
  function multiplyByTwo(n) {
    return new Promise(resolve => {
      setTimeout(() => resolve(n * 2), 300);
    });
  }

  // 链式调用：1 → 2 → 4 → 8 → 16
  console.log('  开始链式计算：1 → x2 → x2 → x2 → x2');
  const start = Date.now();

  Promise.resolve(1)  // 从 1 开始
    .then(result => {
      console.log('  第1步结果:', result);
      return multiplyByTwo(result);  // 返回 Promise
    })
    .then(result => {
      console.log('  第2步结果:', result);
      return multiplyByTwo(result);
    })
    .then(result => {
      console.log('  第3步结果:', result);
      return multiplyByTwo(result);
    })
    .then(result => {
      console.log('  第4步结果:', result);
      return multiplyByTwo(result);
    })
    .then(result => {
      console.log('  最终结果:', result);
      console.log(\`  链式调用完成，耗时: \${Date.now() - start}ms\`);
    })
    .catch(err => console.error('链中出错:', err))
    .then(() => demo4Return());
}

// ============================================
// --- Demo 4：.then 中返回不同值的行为 ---
// ============================================
function demo4Return() {
  console.log('\\n===== Demo 4：.then 返回值的各种情况 =====');

  Promise.resolve('初始值')
    // 情况1：返回普通值
    .then(val => {
      console.log('  1. 收到:', val);
      return '普通字符串'; // 返回普通值
    })
    .then(val => {
      console.log('  2. 收到普通值:', val);
      // 情况2：返回 Promise
      return new Promise(resolve => {
        setTimeout(() => resolve('Promise 的结果'), 500);
      });
    })
    .then(val => {
      console.log('  3. 收到 Promise 结果:', val);
      // 情况3：不返回值（undefined）
      console.log('  4. 这里不 return 任何东西');
    })
    .then(val => {
      console.log('  5. 收到:', val, '(undefined)');
      // 情况4：抛出异常
      throw new Error('我故意抛出的错误');
    })
    .then(val => {
      console.log('  这里不会执行，因为前面抛错了');
    })
    .catch(err => {
      console.log('  6. catch 捕获到错误:', err.message);
      // catch 之后可以继续链式调用
      return '错误已恢复，继续执行';
    })
    .then(val => {
      console.log('  7. catch 之后继续:', val);
    })
    .then(() => demo5Promisify());
}

// ============================================
// --- Demo 5：util.promisify ---
// ============================================
function demo5Promisify() {
  console.log('\\n===== Demo 5：util.promisify 转换回调函数 =====');

  // Node.js 内置的 promisify
  const readFilePromise = util.promisify(fs.readFile);
  const writeFilePromise = util.promisify(fs.writeFile);

  console.log('  使用 promisify 转换后的 fs.readFile:');

  readFilePromise(demoFile, 'utf8')
    .then(data => {
      console.log('  ✅ 读取成功，内容长度:', data.length);
      return writeFilePromise(path.join(os.tmpdir(), 'promise-write.txt'), '写入测试');
    })
    .then(() => {
      console.log('  ✅ 写入成功');
    })
    // Node.js 10+ 直接提供 fs.promises API
    .then(() => fs.promises.readFile(demoFile, 'utf8'))
    .then(data => {
      console.log('  ✅ 使用 fs.promises 读取也成功');
    })
    .then(() => demo6Mistakes());
}

// ============================================
// --- Demo 6：常见错误演示 ---
// ============================================
function demo6Mistakes() {
  console.log('\\n===== Demo 6：常见错误 - 忘记 return =====');

  // 模拟异步获取用户
  function getUser(id) {
    return Promise.resolve({ id: id, name: '用户' + id });
  }

  // 模拟异步保存
  function saveUser(user) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ ...user, saved: true });
      }, 300);
    });
  }

  console.log('  --- 错误写法（忘记 return）---');
  getUser(1)
    .then(user => {
      console.log('  获取到用户:', user.name);
      saveUser(user); // ❌ 没有 return！
    })
    .then(result => {
      console.log('  收到的结果:', result, '(undefined - 因为没 return!)');
    })
    .then(() => {
      console.log('\\n  --- 正确写法（return Promise）---');
      return getUser(2);
    })
    .then(user => {
      console.log('  获取到用户:', user.name);
      return saveUser(user); // ✅ return Promise
    })
    .then(result => {
      console.log('  保存结果:', result);
    })
    .then(() => demo7Finally());
}

// ============================================
// --- Demo 7：.finally() 使用 ---
// ============================================
function demo7Finally() {
  console.log('\\n===== Demo 7：.finally() 演示 =====');

  function testPromise(shouldFail) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          reject(new Error('操作失败'));
        } else {
          resolve('操作成功');
        }
      }, 300);
    });
  }

  console.log('  --- 成功情况 ---');
  testPromise(false)
    .then(result => console.log('  结果:', result))
    .catch(err => console.log('  错误:', err.message))
    .finally(() => {
      console.log('  finally 执行了（无论成功失败）');

      console.log('\\n  --- 失败情况 ---');
      testPromise(true)
        .then(result => console.log('  结果:', result))
        .catch(err => console.log('  错误:', err.message))
        .finally(() => {
          console.log('  finally 也执行了');
          demo8Sequential();
        });
    });
}

// ============================================
// --- Demo 8：用 Promise 链顺序执行 ---
// ============================================
function demo8Sequential() {
  console.log('\\n===== Demo 8：用 Promise 链实现顺序执行 =====');

  const file1 = path.join(os.tmpdir(), 'p-file1.txt');
  const file2 = path.join(os.tmpdir(), 'p-file2.txt');
  const file3 = path.join(os.tmpdir(), 'p-file3.txt');

  // 准备测试文件
  fs.writeFileSync(file1, '文件1');
  fs.writeFileSync(file2, '文件2');
  fs.writeFileSync(file3, '文件3');

  const readFile = util.promisify(fs.readFile);
  const start = Date.now();

  console.log('  顺序读取文件（Promise 链方式）...');

  // 顺序执行：file1 → file2 → file3
  readFile(file1, 'utf8')
    .then(data1 => {
      console.log('  读完 file1:', data1);
      return readFile(file2, 'utf8');
    })
    .then(data2 => {
      console.log('  读完 file2:', data2);
      return readFile(file3, 'utf8');
    })
    .then(data3 => {
      console.log('  读完 file3:', data3);
      console.log(\`  顺序读取完成，耗时 \${Date.now() - start}ms\`);
      console.log('\\n===== 所有演示完成 =====');
      console.log('\\n📝 Promise 总结：');
      console.log('1. Promise 有三种状态：pending → fulfilled/rejected');
      console.log('2. new Promise((resolve, reject) => { ... }) 创建 Promise');
      console.log('3. .then() 处理成功，.catch() 处理错误，.finally() 总是执行');
      console.log('4. .then() 返回新 Promise，支持链式调用');
      console.log('5. util.promisify 把回调函数转成 Promise 函数');
      console.log('6. 忘记 return Promise 是最常见错误！');
    });
}
`,
  },
  {
    id: "n4-promise-static",
    group: "第三部分 异步编程",
    icon: "⚡",
    title: "Promise 静态方法：并发控制利器",
    content: `# Promise 静态方法：并发控制利器

上一章我们学了 Promise 基础和链式调用。本章重点学习 Promise 的四个静态方法：\`Promise.all()\`、\`Promise.allSettled()\`、\`Promise.race()\`、\`Promise.any()\`。它们是处理多个异步操作的强大工具，也是并发控制的基础。

## 一、为什么需要 Promise 静态方法

链式 .then() 适合处理**有依赖关系**的串行任务。但现实中我们经常需要处理**多个并行任务**：

- 同时调用多个 API，等所有数据都回来再渲染页面
- 给一个请求设置超时时间（哪个先到用哪个）
- 批量处理任务，不管成功失败都要知道每个的结果
- 多台服务器备份，只要有一台响应就可以

这些场景下，手动管理多个 Promise 的状态很麻烦。Promise 静态方法正是为这些场景设计的。

---

## 二、Promise.all() - 等待所有，失败快速

### 2.1 基本用法

\`\`\`javascript
const p = Promise.all(iterable);
\`\`\`

接收一个可迭代对象（通常是数组），数组元素是 Promise。返回一个新 Promise：

- **全部成功**：返回一个**结果数组**，顺序和传入的 Promise 顺序一致（不是完成顺序！）
- **任意一个失败**：立即 reject，返回**第一个**失败的错误（fail-fast 快速失败）

### 2.2 示例

\`\`\`javascript
// 同时读取 3 个文件
Promise.all([
  readFile('file1.txt', 'utf8'),
  readFile('file2.txt', 'utf8'),
  readFile('file3.txt', 'utf8')
])
  .then(([data1, data2, data3]) => {
    console.log('全部读取成功');
    console.log(data1, data2, data3);
  })
  .catch(err => {
    console.error('至少一个文件读失败:', err);
  });
\`\`\`

### 2.3 重要特性：结果顺序与传入顺序一致

即使后面的 Promise 先完成，结果数组的顺序也和传入顺序一致：

\`\`\`javascript
// p2 比 p1 更快完成，但结果顺序仍然是 [p1的结果, p2的结果]
const p1 = new Promise(r => setTimeout(() => r('p1慢'), 500));
const p2 = new Promise(r => setTimeout(() => r('p2快'), 100));

Promise.all([p1, p2]).then(([r1, r2]) => {
  console.log(r1, r2); // 'p1慢' 'p2快'（顺序和传入一致！）
});
\`\`\`

### 2.4 适用场景

- 页面需要多个 API 数据才能渲染（缺一不可）
- 并行执行无依赖关系的任务，提高速度
- 数据库同时查询多张表

### 2.5 注意事项

- **不是真正的限制并发**：Promise.all 只是等待结果，传入的 Promise 在传入时就已经开始执行了
- **快速失败**：一个失败就全部失败，其他 Promise 的结果会被丢弃（但它们仍然在执行）

---

## 三、Promise.allSettled() - 等待所有，获取所有结果

### 3.1 基本用法

\`\`\`javascript
const p = Promise.allSettled(iterable);
\`\`\`

和 Promise.all 类似，但**不会快速失败**——它会等待所有 Promise 都定型（无论是成功还是失败），然后返回每个 Promise 的结果和状态。

每个结果是一个对象：
- 成功：\`{ status: 'fulfilled', value: 结果值 }\`
- 失败：\`{ status: 'rejected', reason: 错误原因 }\`

### 3.2 示例

\`\`\`javascript
Promise.allSettled([
  Promise.resolve('成功1'),
  Promise.reject(new Error('失败1')),
  Promise.resolve('成功2')
]).then(results => {
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(\`Promise \${index} 成功:\`, result.value);
    } else {
      console.log(\`Promise \${index} 失败:\`, result.reason.message);
    }
  });
});
\`\`\`

### 3.3 适用场景

- **批量处理**：例如批量上传文件，要知道哪些成功哪些失败
- **容错**：多个独立操作，不希望一个失败导致全部失败
- **收集所有结果**：不管成功失败，需要知道每个的状态

---

## 四、Promise.race() - 谁先完成用谁（无论成败）

### 4.1 基本用法

\`\`\`javascript
const p = Promise.race(iterable);
\`\`\`

"竞速"——传入多个 Promise，哪个**最先定型**（无论是成功还是失败），就返回哪个的结果/错误。

### 4.2 经典应用：请求超时

\`\`\`javascript
// 超时 Promise：指定毫秒后 reject
function timeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('请求超时')), ms);
  });
}

// 请求和超时竞赛
function fetchWithTimeout(url, ms = 5000) {
  return Promise.race([
    fetch(url),
    timeout(ms)
  ]);
}

fetchWithTimeout('/api/data', 3000)
  .then(data => console.log('请求成功', data))
  .catch(err => console.log('超时或失败', err));
\`\`\`

### 4.3 注意事项

- 其他 Promise 仍然在执行，只是结果被忽略了
- 如果第一个完成的是 rejected，那整个 race 就是 rejected

---

## 五、Promise.any() - 谁先成功用谁（忽略失败）

### 5.1 基本用法

\`\`\`javascript
const p = Promise.any(iterable);
\`\`\`

和 Promise.race 类似，但**只看成功**——只要有一个 Promise 成功，就返回那个成功的值。只有当**所有** Promise 都失败时，才会 reject。

### 5.2 示例

\`\`\`javascript
Promise.any([
  Promise.reject(new Error('失败1')),
  Promise.resolve('成功！'),  // 这个先成功
  Promise.reject(new Error('失败2'))
])
  .then(val => console.log(val)) // '成功！'
  .catch(err => console.log('全部失败:', err));
\`\`\`

当全部失败时，catch 收到的是一个 \`AggregateError\` 对象，包含所有错误：

\`\`\`javascript
Promise.any([
  Promise.reject(new Error('错误1')),
  Promise.reject(new Error('错误2'))
]).catch(err => {
  console.log(err instanceof AggregateError); // true
  console.log(err.errors); // [Error: 错误1, Error: 错误2]
});
\`\`\`

### 5.3 适用场景

- **多源获取**：从多个备份服务器获取数据，哪台先响应用哪台
- **容错请求**：多个 CDN 地址，只要有一个能用就行

---

## 六、四个方法对比总结

| 方法 | 全部成功时 | 一个失败时 | 全部失败时 | 典型场景 |
|------|-----------|-----------|-----------|---------|
| \`Promise.all\` | 返回所有结果数组 | 立即 reject 第一个错误 | - | 全部成功才有意义 |
| \`Promise.allSettled\` | 返回所有状态对象 | 继续等，返回所有状态 | 返回所有状态对象 | 批量处理需知每个结果 |
| \`Promise.race\` | 第一个成功的值 | 第一个完成的（无论成败）| - | 超时控制 |
| \`Promise.any\` | 第一个成功的值 | 忽略失败，继续等 | AggregateError | 多源容错，只要一个成功 |

---

## 七、重要限制：Promise.all 不限制并发

Promise.all 是"等待所有完成"，但它**不控制并发数**。传入的 Promise 在传入之前就已经开始执行了：

\`\`\`javascript
// ❌ 这 100 个请求在传给 Promise.all 时就已经全部发出了！
const promises = [];
for (let i = 0; i < 100; i++) {
  promises.push(fetch(\`/api/item/\${i}\`)); // 请求立即发起！
}
Promise.all(promises); // 只是在等待，不是控制并发
\`\`\`

如果需要限制同时执行的任务数量（并发控制），需要自己实现队列机制，我们在第 35 章专门讲解。

掌握这四个静态方法，你就拥有了处理组合异步操作的利器。配合下一章的 async/await，代码会更加简洁优雅！
`,
    code: `// ============================================
// Promise 静态方法完整示例
// 运行方式：node n4-promise-static-demo.js
// ============================================

const fs = require('fs');
const path = require('path');
const os = require('os');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// 创建一些测试文件
const tmpDir = os.tmpdir();
const files = {
  a: path.join(tmpDir, 'static-a.txt'),
  b: path.join(tmpDir, 'static-b.txt'),
  c: path.join(tmpDir, 'static-c.txt'),
};
writeFile(files.a, '文件A的内容');
writeFile(files.b, '文件B的内容');
writeFile(files.c, '文件C的内容');

// 辅助函数：延迟指定毫秒后 resolve
function delay(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

// 辅助函数：延迟指定毫秒后 reject
function delayFail(ms, errorMsg) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(errorMsg)), ms)
  );
}

// ============================================
// --- Demo 1：Promise.all() 基本用法 ---
// ============================================
console.log('===== Demo 1：Promise.all() - 等待全部成功 =====');

async function demo1All() {
  console.log('  开始并行读取 3 个文件...');
  const start = Date.now();

  try {
    // Promise.all 接收 Promise 数组，返回结果数组
    // 注意：结果顺序和传入顺序一致，不是完成顺序！
    const results = await Promise.all([
      readFile(files.a, 'utf8'),
      readFile(files.b, 'utf8'),
      readFile(files.c, 'utf8'),
    ]);

    console.log(\`  全部完成，耗时 \${Date.now() - start}ms\`);
    console.log('  结果数组（顺序和传入一致）:');
    results.forEach((data, i) => {
      console.log(\`    [\${i}]: \${data.trim()}\`);
    });
  } catch (err) {
    console.log('  ❌ 有文件读取失败:', err.message);
  }

  demo2AllFailFast();
}

// ============================================
// --- Demo 2：Promise.all() 快速失败特性 ---
// ============================================
function demo2AllFailFast() {
  console.log('\\n===== Demo 2：Promise.all() 快速失败（fail-fast）=====');

  const nonexistent = '/path/that/does/not/exist.txt';

  const start = Date.now();
  Promise.all([
    readFile(files.a, 'utf8'),           // 会成功
    readFile(nonexistent, 'utf8'),       // 会失败
    delay(500, '慢操作'),                 // 还没完成就会因为失败而跳过
  ])
    .then(results => {
      console.log('  不会执行到这里');
    })
    .catch(err => {
      console.log(\`  ✅ 捕获到第一个失败，耗时 \${Date.now() - start}ms\`);
      console.log('  错误:', err.code);
      console.log('  注意：其他 Promise 仍然在执行，只是结果被忽略了');
    })
    .then(() => demo3AllOrder());
}

// ============================================
// --- Demo 3：Promise.all() 结果顺序演示 ---
// ============================================
function demo3AllOrder() {
  console.log('\\n===== Demo 3：Promise.all() 顺序保证 =====');
  console.log('  传入顺序：慢(500ms) → 中(200ms) → 快(100ms)');
  console.log('  实际完成顺序：快 → 中 → 慢');
  console.log('  但结果数组顺序保持传入顺序！');

  Promise.all([
    delay(500, '慢操作结果'),  // [0]
    delay(200, '中操作结果'),  // [1]
    delay(100, '快操作结果'),  // [2]
  ]).then(results => {
    console.log('  结果数组:');
    results.forEach((val, i) => {
      console.log(\`    [\${i}]: \${val}\`);
    });
    demo4AllSettled();
  });
}

// ============================================
// --- Demo 4：Promise.allSettled() ---
// ============================================
function demo4AllSettled() {
  console.log('\\n===== Demo 4：Promise.allSettled() - 获取所有结果 =====');

  Promise.allSettled([
    Promise.resolve('成功1'),
    Promise.reject(new Error('失败1')),
    delay(200, '成功2（延迟的）'),
    delayFail(100, '失败2（延迟的）'),
    Promise.resolve('成功3'),
  ]).then(results => {
    console.log('  所有 Promise 都已定型：');
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        console.log(\`    [\${i}] ✅ 成功: \${result.value}\`);
      } else {
        console.log(\`    [\${i}] ❌ 失败: \${result.reason.message}\`);
      }
    });
    demo5Race();
  });
}

// ============================================
// --- Demo 5：Promise.race() - 超时模式 ---
// ============================================
function demo5Race() {
  console.log('\\n===== Demo 5：Promise.race() - 竞速 =====');

  // 经典应用：给异步操作加超时
  function withTimeout(promise, ms, timeoutMsg = '操作超时') {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMsg)), ms);
    });
    return Promise.race([promise, timeoutPromise]);
  }

  console.log('  --- 场景1：操作在超时内完成 ---');
  withTimeout(delay(200, '快速操作的结果'), 500, '超时500ms')
    .then(result => console.log('  ✅ 成功:', result))
    .catch(err => console.log('  ❌ 失败:', err.message))
    .then(() => {
      console.log('\\n  --- 场景2：操作超时 ---');
      return withTimeout(delay(1000, '慢速操作的结果'), 300, '超时300ms')
        .then(result => console.log('  ✅ 成功:', result))
        .catch(err => console.log('  ❌ 失败:', err.message));
    })
    .then(() => demo6RaceFirst());
}

// ============================================
// --- Demo 6：Promise.race() 谁先到用谁 ---
// ============================================
function demo6RaceFirst() {
  console.log('\\n===== Demo 6：Promise.race() 无论成功失败，先到先得 =====');

  // 失败更快的情况
  Promise.race([
    delay(500, '慢的成功结果'),
    delayFail(100, '快的失败！'),
  ])
    .then(val => console.log('  成功:', val))
    .catch(err => console.log('  ❌ race 结果（失败更快）:', err.message));

  // 演示 race 和 any 的区别
  setTimeout(() => demo7Any(), 600);
}

// ============================================
// --- Demo 7：Promise.any() - 第一个成功者 ---
// ============================================
function demo7Any() {
  console.log('\\n===== Demo 7：Promise.any() - 只要有一个成功 =====');

  console.log('  --- 场景1：有成功有失败，取第一个成功 ---');
  Promise.any([
    delayFail(100, '失败1（最快）'),
    delay(300, '成功结果（第一个成功）'),
    delayFail(200, '失败2（中间）'),
    delay(500, '另一个成功（但更慢）'),
  ])
    .then(val => console.log('  ✅ any 结果:', val))
    .catch(err => console.log('  ❌ 全部失败:', err));

  setTimeout(() => {
    console.log('\\n  --- 场景2：全部失败 ---');
    Promise.any([
      Promise.reject(new Error('错误A')),
      Promise.reject(new Error('错误B')),
      Promise.reject(new Error('错误C')),
    ])
      .then(val => console.log('  不会执行'))
      .catch(err => {
        console.log('  ❌ 全部失败，收到 AggregateError');
        console.log('  错误数量:', err.errors.length);
        err.errors.forEach((e, i) => {
          console.log(\`    错误\${i + 1}: \${e.message}\`);
        });
      })
      .then(() => demo8Practical());
  }, 400);
}

// ============================================
// --- Demo 8：实际应用场景 ---
// ============================================
function demo8Practical() {
  console.log('\\n===== Demo 8：实际应用场景对比 =====');

  // 模拟从多个 CDN 获取资源
  function fetchFromCDN(name, delayMs, shouldFail = false) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          reject(new Error(\`\${name} 服务器不可用\`));
        } else {
          resolve(\`来自 \${name} 的数据\`);
        }
      }, delayMs);
    });
  }

  console.log('  场景：3个CDN服务器，CDN1最快但不稳定');

  // allSettled：获取所有CDN状态（监控用）
  console.log('\\n  [allSettled] 检查所有CDN状态：');
  Promise.allSettled([
    fetchFromCDN('CDN1(主)', 100, Math.random() > 0.5),
    fetchFromCDN('CDN2(备)', 300),
    fetchFromCDN('CDN3(备)', 500),
  ]).then(results => {
    results.forEach((r, i) => {
      const icon = r.status === 'fulfilled' ? '✅' : '❌';
      const msg = r.status === 'fulfilled' ? r.value : r.reason.message;
      console.log(\`    \${icon} CDN\${i + 1}: \${msg}\`);
    });
  });

  // any：从任意可用CDN获取
  console.log('\\n  [any] 从任意可用CDN获取（容灾）：');
  Promise.any([
    fetchFromCDN('CDN1', 100, true),  // 这个挂了
    fetchFromCDN('CDN2', 300),
    fetchFromCDN('CDN3', 500),
  ]).then(data => {
    console.log('  ✅ 获取成功:', data);
  });

  // race：超时控制
  console.log('\\n  [race] 带超时的请求：');
  const timeout = ms => new Promise((_, r) => setTimeout(() => r(new Error('超时')), ms));
  Promise.race([
    fetchFromCDN('慢CDN', 800),
    timeout(300),
  ])
    .then(data => console.log('  ✅:', data))
    .catch(err => console.log('  ❌:', err.message));

  setTimeout(() => {
    console.log('\\n===== 所有演示完成 =====');
    console.log('\\n📝 Promise 静态方法总结：');
    console.log('1. Promise.all([])：全部成功才成功，一个失败立即失败');
    console.log('2. Promise.allSettled([])：等待所有完成，获取每个的状态');
    console.log('3. Promise.race([])：谁先定型用谁（无论成功失败）- 超时模式');
    console.log('4. Promise.any([])：谁先成功用谁，全部失败才失败 - 容灾模式');
    console.log('5. Promise.all 结果顺序与传入顺序一致');
    console.log('6. 这些方法不限制并发！只是等待和组合结果');
  }, 1000);
}

// 启动演示
demo1All();
`,
  },
  {
    id: "n4-async-await",
    group: "第三部分 异步编程",
    icon: "✨",
    title: "async/await：以同步方式写异步代码",
    content: `# async/await：以同步方式写异步代码

async/await 是 ES2017 引入的语法，是 Promise 的语法糖。它让你能用**看起来像同步代码**的方式写异步逻辑，彻底消灭 .then() 链，代码可读性达到顶峰。

## 一、为什么需要 async/await

Promise 比回调好了很多，但 .then() 链仍然有"回调感"——每一步都要写 .then()，逻辑被拆成了多个函数。

async/await 让异步代码看起来和同步代码一样：
- 没有回调
- 没有 .then() 链
- 可以用 try/catch 捕获错误
- 可以用普通的 if/for/while 控制流程

这是异步编程的终极形态（至少在 JavaScript 里目前是）。

---

## 二、async 函数

### 2.1 基本语法

在函数声明前加 \`async\` 关键字：

\`\`\`javascript
// 函数声明
async function fetchData() {
  // ...
}

// 函数表达式
const fetchData = async function() { /* ... */ };

// 箭头函数
const fetchData = async () => { /* ... */ };

// 对象方法
const obj = {
  async fetchData() { /* ... */ }
};

// 类方法
class Api {
  async fetchData() { /* ... */ }
}
\`\`\`

### 2.2 async 函数的特性

1. **总是返回 Promise**：无论你 return 什么，async 函数都会把它包装成 Promise
2. **函数体内可以使用 await**：这是 async 函数最核心的能力

\`\`\`javascript
async function getNumber() {
  return 42; // 自动包装成 Promise.resolve(42)
}

getNumber().then(n => console.log(n)); // 42

async function getError() {
  throw new Error('出错了'); // 自动包装成 Promise.reject
}

getError().catch(err => console.log(err.message)); // 出错了
\`\`\`

---

## 三、await 关键字

### 3.1 基本用法

\`await\` 只能在 \`async\` 函数内使用（ES2022 开始支持顶层 await，见下文）。

它会**暂停**async 函数的执行，等待后面的 Promise 完成，然后返回结果：

\`\`\`javascript
async function example() {
  console.log('开始');

  // await 会"等待"Promise 完成，把结果赋值给 data
  const data = await readFile('file.txt', 'utf8');
  console.log(data); // 这里拿到的是 resolve 的值

  console.log('结束');
}
\`\`\`

> 💡 **关键理解**：await 不是"阻塞线程"，它只是暂停当前 async 函数的执行，把控制权交还给事件循环。其他代码仍然可以运行！当 Promise 完成后，函数从暂停的位置继续执行。

### 3.2 await 后面可以跟什么

- **Promise**：等待 Promise 定型，返回 resolve 的值
- **thenable 对象**（有 .then 方法的对象）：同 Promise
- **普通值**：直接返回这个值（等价于 await Promise.resolve(value)）

\`\`\`javascript
async function demo() {
  const a = await Promise.resolve(100); // Promise: 等待并返回 100
  const b = await 200;                   // 普通值: 直接返回 200
  const c = await 'hello';               // 普通值: 直接返回 'hello'
}
\`\`\`

---

## 四、错误处理：try/catch

在 async 函数中，可以直接用 \`try/catch\` 捕获异步错误——这是 async/await 最爽的地方之一：

\`\`\`javascript
async function readConfig() {
  try {
    const config = await readFile('config.json', 'utf8');
    const data = JSON.parse(config);
    return data;
  } catch (err) {
    // 文件读取错误和 JSON.parse 错误都能在这里捕获！
    console.error('读取配置失败:', err.message);
    // 可以返回默认配置
    return { port: 3000, debug: false };
  }
}
\`\`\`

多个 await 的错误可以统一处理，不需要像 .then() 那样在最后写一个 .catch()。

### await 不包裹 try/catch 的后果

如果 await 的 Promise rejected 了，又没有 try/catch，那么 async 函数返回的 Promise 会被 reject：

\`\`\`javascript
async function risky() {
  // 如果这个 Promise reject，整个 risky() 返回的 Promise 就是 rejected
  const data = await Promise.reject(new Error('错误'));
}

risky().catch(err => console.log('需要在这里 catch'));
\`\`\`

---

## 五、await 与循环

这是 async/await 最容易出错的地方之一！不同的循环写法，行为完全不同。

### 5.1 串行：for 循环中 await（顺序执行）

普通 for 循环中使用 await，会**按顺序**逐个等待：

\`\`\`javascript
async function sequential() {
  for (let i = 0; i < 3; i++) {
    await delay(100); // 等100ms
    console.log(i);
  }
  // 输出：0 → (100ms) → 1 → (100ms) → 2（总共约300ms）
}
\`\`\`

\`for...of\` 循环也是串行的：

\`\`\`javascript
async function sequentialForOf(files) {
  for (const file of files) {
    const data = await readFile(file, 'utf8'); // 顺序读取
    console.log(data);
  }
}
\`\`\`

### 5.2 ⚠️ 并行：forEach 中 await 不等待！

**这是最常见的坑！**在 \`forEach\`/\`map\`/\`filter\` 等数组方法的回调中写 await，不会等待！

\`\`\`javascript
async function parallelForEach(files) {
  files.forEach(async file => {
    const data = await readFile(file, 'utf8');
    console.log(data);
  });
  // ❌ forEach 不会等待异步回调！
  // 这里代码会立即继续执行，文件在后台并行读取
  console.log('forEach 后的代码立即执行了！');
}
\`\`\`

原因：forEach 对每个回调只是调用，它不关心返回值，也不会 await 回调返回的 Promise。

### 5.3 并行：Promise.all + await（正确方式）

要并行执行并用 await 等待所有完成，配合 Promise.all：

\`\`\`javascript
async function parallel() {
  const promises = [
    readFile('file1.txt', 'utf8'),
    readFile('file2.txt', 'utf8'),
    readFile('file3.txt', 'utf8'),
  ];

  // 同时发起，然后等待全部完成
  const [data1, data2, data3] = await Promise.all(promises);
  console.log(data1, data2, data3);
}
\`\`\`

### 5.4 先用 map 生成 Promise 数组，再 await Promise.all

\`\`\`javascript
async function parallelWithMap(files) {
  // 第一步：map 创建所有 Promise（此时请求已经全部发起！）
  const promises = files.map(file => readFile(file, 'utf8'));

  // 第二步：等待全部完成
  const results = await Promise.all(promises);
  return results;
}
\`\`\`

---

## 六、顶层 await（Top-Level await）

ES2022 引入了顶层 await，允许在 ES 模块（ESM）的顶层直接使用 await，不需要包裹在 async 函数中：

\`\`\`javascript
// ESM 模块中可以直接写
const data = await readFile('config.json', 'utf8');
console.log(data);

// CommonJS (require) 模块不支持顶层 await！
\`\`\`

Node.js 中使用顶层 await 条件：
1. 文件扩展名是 \`.mjs\`，或者
2. package.json 中设置 \`"type": "module"\`

如果在 CommonJS 模块中需要顶层等待，可以用匿名 async IIFE：

\`\`\`javascript
// CommonJS 中模拟顶层 await
(async () => {
  const data = await readFile('config.json', 'utf8');
  console.log(data);
})();
\`\`\`

---

## 七、常见模式和最佳实践

### 7.1 顺序执行

\`\`\`javascript
async function sequential(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}
\`\`\`

### 7.2 并行执行

\`\`\`javascript
async function parallel(tasks) {
  return Promise.all(tasks.map(task => task()));
}
\`\`\`

### 7.3 组合使用

\`\`\`javascript
async function getFullData(userId) {
  // 并行获取不相关的数据
  const [user, posts] = await Promise.all([
    getUser(userId),
    getPosts(userId)
  ]);

  // 依赖 user 的结果，顺序执行
  const comments = await getComments(posts[0].id);

  return { user, posts, comments };
}
\`\`\`

### 7.4 注意事项

1. **不要滥用 await**：不相关的操作不要一个个 await，用 Promise.all 并行
2. **记得 try/catch**：或者在调用方 .catch()，避免 unhandledRejection
3. **forEach 不等待**：需要等待就用 for...of 或 Promise.all
4. **async 函数总是返回 Promise**：即使你 return 普通值

async/await 是 Node.js 异步编程的"终极武器"。掌握它之后，你的异步代码将和同步代码一样清晰易读。配合 Promise 的静态方法，几乎可以应对所有异步场景！
`,
    code: `// ============================================
// async/await 完整示例
// 运行方式：node n4-async-await-demo.js
// 注意：本文件使用 CommonJS，顶层需要用 IIFE 包裹 await
// ============================================

const fs = require('fs');
const path = require('path');
const os = require('os');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const tmpDir = os.tmpdir();

// 辅助函数：延迟
function delay(ms, value = 'done') {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

// ============================================
// --- Demo 1：async 函数基础 ---
// ============================================
console.log('===== Demo 1：async 函数基本用法 =====');

// async 函数声明
async function getData() {
  return '这是 async 函数返回的数据';
}

// async 箭头函数
const getNumber = async () => 42;

// 调用 async 函数总是返回 Promise
console.log('调用 async 函数得到:', getData());

// 需要用 .then() 或 await 获取结果
getData().then(data => {
  console.log('  .then 获取结果:', data);
});

(async () => {
  const num = await getNumber();
  console.log('  await 获取结果:', num);
  demo2Await();
})();

// ============================================
// --- Demo 2：await 等待 Promise ---
// ============================================
async function demo2Await() {
  console.log('\\n===== Demo 2：await 基本用法 =====');

  console.log('  开始执行...');

  // await 会暂停函数执行，直到 Promise 完成
  const result1 = await delay(300, '第一个异步结果');
  console.log('  300ms 后收到:', result1);

  const result2 = await delay(200, '第二个异步结果');
  console.log('  又200ms 后收到:', result2);

  // await 普通值会直接返回
  const result3 = await '普通字符串值';
  console.log('  await 普通值:', result3);

  console.log('  全部完成');
  demo3TryCatch();
}

// ============================================
// --- Demo 3：try/catch 错误处理 ---
// ============================================
async function demo3TryCatch() {
  console.log('\\n===== Demo 3：try/catch 错误处理 =====');

  // 模拟可能失败的异步操作
  async function riskyOperation(shouldFail) {
    await delay(200);
    if (shouldFail) {
      throw new Error('操作失败了！');
    }
    return '操作成功';
  }

  console.log('  --- 成功情况 ---');
  try {
    const result = await riskyOperation(false);
    console.log('  ✅', result);
  } catch (err) {
    console.log('  ❌ 错误:', err.message);
  }

  console.log('\\n  --- 失败情况 ---');
  try {
    const result = await riskyOperation(true);
    console.log('  这里不会执行');
  } catch (err) {
    console.log('  ❌ 捕获到错误:', err.message);
  }

  // 多个 await 的错误可以一起捕获
  console.log('\\n  --- 多个 await 统一错误处理 ---');
  const nonExistent = '/no/such/file.txt';
  const testFile = path.join(tmpDir, 'async-test.txt');
  await writeFile(testFile, '测试内容');

  try {
    // 这里会因为文件不存在而抛错
    const data1 = await readFile(nonExistent, 'utf8');
    const data2 = await readFile(testFile, 'utf8');
    console.log('  不会执行到这里');
  } catch (err) {
    console.log('  ❌ 捕获到任意错误:', err.code);
  }
  demo4Loops();
}

// ============================================
// --- Demo 4：循环中的 await（重点！）---
// ============================================
async function demo4Loops() {
  console.log('\\n===== Demo 4：循环中的 await（重点！）=====');

  const tasks = [
    () => delay(100, '任务A'),
    () => delay(200, '任务B'),
    () => delay(100, '任务C'),
  ];

  // 方式1：for 循环 - 串行执行（一个接一个）
  console.log('\\n  --- 1. for 循环（串行，总耗时约400ms）---');
  let start = Date.now();
  const results1 = [];
  for (let i = 0; i < tasks.length; i++) {
    results1.push(await tasks[i]());
  }
  console.log('  结果:', results1);
  console.log(\`  耗时: \${Date.now() - start}ms\`);

  // 方式2：for...of 循环 - 也是串行
  console.log('\\n  --- 2. for...of 循环（串行）---');
  start = Date.now();
  const results2 = [];
  for (const task of tasks) {
    results2.push(await task());
  }
  console.log('  结果:', results2);
  console.log(\`  耗时: \${Date.now() - start}ms\`);

  // 方式3：Promise.all + map - 并行执行（同时跑）
  console.log('\\n  --- 3. Promise.all + map（并行，总耗时约200ms）---');
  start = Date.now();
  const results3 = await Promise.all(tasks.map(task => task()));
  console.log('  结果:', results3);
  console.log(\`  耗时: \${Date.now() - start}ms（注意比串行快！）\`);

  demo5ForEachPitfall();
}

// ============================================
// --- Demo 5：⚠️ forEach 不等待！（经典坑）---
// ============================================
async function demo5ForEachPitfall() {
  console.log('\\n===== Demo 5：⚠️ forEach 中 await 不会等待！=====');

  const items = ['a', 'b', 'c'];

  console.log('  使用 forEach（注意输出顺序！）:');
  console.log('  forEach 开始');

  items.forEach(async (item, i) => {
    await delay(100 * (3 - i)); // a最慢，c最快
    console.log(\`    处理完 \${item}\`);
  });

  console.log('  forEach 结束（但任务还没完成！）');

  // 等待所有 forEach 的任务完成才能继续
  await delay(400);

  console.log('\\n  🔑 教训：forEach/map/filter 不等待异步回调！');
  console.log('  需要等待请使用 for...of 或 Promise.all');
  demo6Patterns();
}

// ============================================
// --- Demo 6：常见模式 ---
// ============================================
async function demo6Patterns() {
  console.log('\\n===== Demo 6：常见异步模式 =====');

  // 模拟 API 函数
  async function getUser(id) {
    await delay(200);
    return { id, name: '用户' + id };
  }
  async function getPosts(userId) {
    await delay(200);
    return [
      { id: 1, title: '帖子1', userId },
      { id: 2, title: '帖子2', userId },
    ];
  }
  async function getComments(postId) {
    await delay(200);
    return [
      { id: 1, postId, text: '评论1' },
    ];
  }

  console.log('  --- 模式1：依赖关系的串行 ---');
  let start = Date.now();
  const user = await getUser(1);
  const posts = await getPosts(user.id); // 需要先有 user
  const comments = await getComments(posts[0].id); // 需要先有 posts
  console.log(\`  串行完成，耗时: \${Date.now() - start}ms\`);
  console.log('  用户:', user.name, '帖子:', posts.length, '评论:', comments.length);

  console.log('\\n  --- 模式2：无依赖的并行（Promise.all）---');
  start = Date.now();
  const [user2, user3] = await Promise.all([
    getUser(2),
    getUser(3),
  ]);
  console.log(\`  并行获取2个用户，耗时: \${Date.now() - start}ms（更快！）\`);
  console.log('  用户:', user2.name, user3.name);

  console.log('\\n  --- 模式3：组合：先并行再串行 ---');
  start = Date.now();
  // 先并行获取用户和所有用户的帖子（有依赖但可以同时发起不同用户的）
  const [u1, u2Posts, u3Posts] = await Promise.all([
    getUser(1),
    getPosts(2),
    getPosts(3),
  ]);
  // 再串行获取某个帖子的评论
  const c = await getComments(u2Posts[0].id);
  console.log(\`  组合模式完成，耗时: \${Date.now() - start}ms\`);

  demo7TopLevelAwait();
}

// ============================================
// --- Demo 7：顶层 await（模拟）---
// ============================================
async function demo7TopLevelAwait() {
  console.log('\\n===== Demo 7：顶层 await 模式 =====');

  console.log('  CommonJS 中使用 IIFE（立即执行异步函数）模拟顶层 await:');
  console.log('  (async () => { const data = await ...; })();');

  // 创建并读取配置文件演示
  const configFile = path.join(tmpDir, 'config.json');
  await writeFile(configFile, JSON.stringify({ port: 3000, debug: true }, null, 2));

  // 这就是 CommonJS 中的"顶层 await"模式
  (async () => {
    try {
      const configData = await readFile(configFile, 'utf8');
      const config = JSON.parse(configData);
      console.log('  读取配置成功:');
      console.log('    port:', config.port);
      console.log('    debug:', config.debug);
    } catch (err) {
      console.log('  读取配置失败:', err.message);
    }
  })();

  await delay(100); // 等上面的 IIFE 完成
  demo8Mistakes();
}

// ============================================
// --- Demo 8：常见错误 ---
// ============================================
async function demo8Mistakes() {
  console.log('\\n===== Demo 8：常见错误总结 =====');

  async function fetchUser(id) {
    await delay(100);
    return { id, name: 'User' + id };
  }

  console.log('  --- 错误1：忘记 await（得到 Promise 而非值）---');
  const wrong = fetchUser(1); // ❌ 没有 await，得到的是 Promise！
  console.log('  错误结果类型:', typeof wrong, wrong instanceof Promise);

  const correct = await fetchUser(1); // ✅ 有 await
  console.log('  正确结果:', correct.name);

  console.log('\\n  --- 错误2：不必要的顺序 await ---');
  let start = Date.now();
  // ❌ 不相关的请求被串行化了，慢！
  const a = await fetchUser(1);
  const b = await fetchUser(2);
  const c = await fetchUser(3);
  console.log(\`  串行3个请求耗时: \${Date.now() - start}ms\`);

  start = Date.now();
  // ✅ 不相关的请求并行，快！
  const [x, y, z] = await Promise.all([
    fetchUser(1), fetchUser(2), fetchUser(3)
  ]);
  console.log(\`  并行3个请求耗时: \${Date.now() - start}ms\`);

  console.log('\\n===== 所有演示完成 =====');
  console.log('\\n📝 async/await 总结：');
  console.log('1. async 函数总是返回 Promise');
  console.log('2. await 只能在 async 函数中使用（ESM 支持顶层 await）');
  console.log('3. await 暂停函数执行，等待 Promise 完成后继续');
  console.log('4. 用 try/catch 处理 await 的错误');
  console.log('5. for/for...of 中 await 是串行的');
  console.log('6. ⚠️ forEach/map 中 await 不会等待！');
  console.log('7. 无依赖关系的操作用 Promise.all + await 并行');
}

// CommonJS 中需要用 IIFE 包裹顶层 await
(async () => {
  await getData();
})();
`,
  },
  {
    id: "n4-event-loop",
    group: "第三部分 异步编程",
    icon: "🔁",
    title: "事件循环：理解 Node.js 的心脏",
    content: `# 事件循环：理解 Node.js 的心脏

事件循环（Event Loop）是 Node.js 实现非阻塞 I/O 的核心机制。理解事件循环，你才能真正理解 Node.js 中异步代码的执行顺序，解释"为什么这段代码先输出那个"这类问题。

## 一、Node.js 为什么需要事件循环

Node.js 是**单线程**的（指 JavaScript 执行线程），但它能处理高并发。秘密就在于事件循环：

1. JavaScript 代码在单线程上执行
2. I/O 操作（文件读写、网络请求等）交给系统内核或线程池处理
3. 当 I/O 完成，回调函数被放入队列
4. 事件循环负责从队列中取出回调，在 JS 线程上执行

> 💡 **类比**：事件循环就像一个餐厅服务员（JS主线程）。服务员只做接待客人、上菜（执行JS）这种事。真正的烹饪（I/O操作）由后厨（系统内核/线程池）完成。后厨做好了按铃通知（回调入队），服务员听到了就去取餐上菜（事件循环取出回调执行）。服务员一个人就能服务很多桌客人。

---

## 二、事件循环的6个阶段

Node.js 事件循环分6个阶段，按顺序反复执行。每个阶段都有自己的回调队列：

\`\`\`
   ┌───────────────────────────┐
┌─>│           timers          │  setTimeout、setInterval 回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  延迟的 I/O 回调（如 TCP 错误）
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  内部使用（忽略）
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │  I/O 回调（核心！）
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │  setImmediate 回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  socket.on('close') 等
   └───────────────────────────┘
\`\`\`

### 2.1 各阶段简述

| 阶段 | 执行什么回调 |
|------|-------------|
| **timers** | \`setTimeout()\` 和 \`setInterval()\` 指定的回调 |
| **pending callbacks** | 上一轮循环中未执行的 I/O 回调（操作系统层面延迟的，如 TCP 错误） |
| **idle, prepare** | 内部使用，不需要关心 |
| **poll** | **最重要的阶段**：检索新的 I/O 事件，执行 I/O 回调（几乎所有回调除了 timers/check/close） |
| **check** | \`setImmediate()\` 的回调 |
| **close callbacks** | 关闭事件的回调，如 \`socket.on('close')\` |

### 2.2 事件循环的工作流程

每个阶段都有一个**先入先出（FIFO）**的回调队列。事件循环进入某个阶段时：
1. 执行该阶段队列中的回调，直到队列清空或达到系统限制
2. 进入下一个阶段

当所有阶段按顺序执行完一遍，称为一个**tick**（循环周期）。

---

## 三、微任务队列（Microtasks）

除了6个阶段的宏任务队列，还有**微任务队列**，这是理解执行顺序的关键！

### 3.1 什么是微任务

微任务在**每个阶段完成后、下一个阶段开始前**被清空！也就是说，在事件循环的每个阶段切换时，都会把微任务队列全部执行完。

微任务包括：
1. **\`process.nextTick()\`**：Node.js 特有，优先级最高
2. **Promise.then()/catch()/finally()**：标准微任务
3. **\`queueMicrotask()\`**：标准 API，显式添加微任务

### 3.2 执行顺序

**每个阶段执行完后**，按以下顺序清空微任务：

1. 先执行**所有** \`process.nextTick\` 队列（nextTick 微任务）
2. 再执行**所有** Promise 微任务队列

\`\`\`
阶段执行 → 所有 nextTick 回调 → 所有 Promise 微任务 → 下一个阶段
\`\`\`

> ⚠️ **nextTick 比 Promise 微任务优先级更高！** 这是 Node.js 与浏览器的一个差异。

### 3.3 关键理解

事件循环的执行顺序规则：
1. **同步代码**先执行完（调用栈清空）
2. 然后进入事件循环
3. 每个阶段内，执行该阶段的宏任务回调
4. **每个回调执行完后**，清空微任务队列（先 nextTick，再 Promise）
5. 阶段队列清空后，进入下一个阶段

---

## 四、setTimeout(fn, 0) vs setImmediate

这是面试常考的经典问题：**setTimeout(fn, 0) 和 setImmediate 谁先执行？**

答案是：**在主模块（顶层）中，顺序不确定！但在 I/O 回调中，setImmediate 总是先执行。**

### 4.1 主模块中（顺序不确定）

\`\`\`javascript
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
// 可能输出 timeout → immediate
// 也可能输出 immediate → timeout
\`\`\`

原因：
- \`setTimeout(fn, 0)\` 有个最小延迟（实际上约 1ms，不是精确的 0）
- 如果事件循环进入 timers 阶段时，计时器到点了，timeout 先执行
- 如果准备时间超过了 1ms，进入 check 阶段时，immediate 先执行

### 4.2 I/O 回调中（setImmediate 一定先执行）

\`\`\`javascript
const fs = require('fs');
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});
// 永远是 immediate → timeout
\`\`\`

原因：I/O 回调在 poll 阶段执行。poll 阶段之后是 check 阶段（setImmediate），之后才是下一轮循环的 timers 阶段。所以在 I/O 回调中，setImmediate 一定比 setTimeout(fn, 0) 先执行。

---

## 五、poll 阶段详解

poll 阶段是事件循环最重要的阶段，有两个主要功能：

1. **执行 I/O 回调**：处理几乎所有的异步 I/O 回调（文件读写、网络请求等）
2. **阻塞等待**：如果后续没有其他任务，poll 阶段会在这里等待新的 I/O 事件

poll 阶段的逻辑：
1. 如果 poll 队列不为空，遍历执行回调直到清空或达到上限
2. 如果 poll 队列为空：
   - 如果有 \`setImmediate\` 回调，结束 poll 阶段，进入 check 阶段
   - 如果有到期的 \`setTimeout\`，绕回 timers 阶段执行
   - 如果都没有，阻塞等待新的 I/O 事件

---

## 六、阻塞事件循环

因为 JS 是单线程执行的，如果你在回调中执行耗时的同步操作（大循环、CPU密集计算、同步I/O），整个事件循环就会被阻塞——所有异步操作都会被延迟：

\`\`\`javascript
const start = Date.now();
setTimeout(() => {
  console.log('timeout 回调执行，延迟了:', Date.now() - start);
}, 100);

// 阻塞事件循环 2 秒！
const end = Date.now() + 2000;
while (Date.now() < end) {
  // 空转 2 秒，什么都做不了
}
// setTimeout 本来预计 100ms 后执行，实际上要等 2000ms+！
\`\`\`

这就是为什么 Node.js 中**永远不要阻塞事件循环**——CPU 密集任务应该交给 worker_threads 或子进程处理。

---

## 七、Node.js vs 浏览器事件循环

虽然浏览器也有事件循环，但实现和 Node.js 不同：

| 特性 | Node.js | 浏览器 |
|------|---------|--------|
| 阶段划分 | 6个明确阶段 | 宏任务/微任务模型 |
| 微任务执行时机 | **每个阶段后**清空 | 每个宏任务后清空 |
| nextTick | 有，优先级最高 | 无 |
| setImmediate | 有（check 阶段） | 无（有 setTimeout 0） |

理解事件循环是区分"会用 Node.js"和"精通 Node.js"的分水岭。当你遇到异步执行顺序不符合预期的问题，从事件循环角度分析，就能找到答案！
`,
    code: `// ============================================
// 事件循环完整示例
// 运行方式：node n4-event-loop-demo.js
// ============================================

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('===== 事件循环执行顺序演示 =====\\n');

// 用于记录步骤的数组
const order = [];
function logStep(name) {
  order.push(name);
  console.log(\`  [\${order.length}] \${name}\`);
}

// ============================================
// --- Demo 1：同步代码、微任务、宏任务执行顺序 ---
// ============================================
console.log('===== Demo 1：基础执行顺序 =====');
logStep('1. 同步代码开始');

// Promise 微任务
Promise.resolve().then(() => {
  logStep('5. Promise.then 微任务');
});

// process.nextTick 微任务（优先级比 Promise 高！）
process.nextTick(() => {
  logStep('4. process.nextTick 微任务');
});

// setTimeout 宏任务（timers 阶段）
setTimeout(() => {
  logStep('6. setTimeout 宏任务');

  // 在 setTimeout 中再注册微任务
  process.nextTick(() => {
    logStep('7. setTimeout 中的 nextTick');
  });
  Promise.resolve().then(() => {
    logStep('8. setTimeout 中的 Promise.then');
  });
}, 0);

// setImmediate 宏任务（check 阶段）
setImmediate(() => {
  logStep('9. setImmediate 宏任务');
});

logStep('2. 同步代码结束');
logStep('3. 同步调用栈已清空，等待微任务...');

// 给事件循环一些时间执行
setTimeout(() => {
  console.log('\\n  📊 执行顺序分析：');
  console.log('  同步代码 → nextTick → Promise.then → setTimeout → setImmediate');
  console.log('  注意：setTimeout 中的微任务在 setTimeout 回调后立即执行');
  demo2NextTickVsPromise();
}, 100);

// ============================================
// --- Demo 2：nextTick 优先于 Promise 微任务 ---
// ============================================
function demo2NextTickVsPromise() {
  console.log('\\n===== Demo 2：nextTick vs Promise 微任务优先级 =====');
  const order2 = [];

  Promise.resolve().then(() => order2.push('Promise 1'));
  process.nextTick(() => order2.push('nextTick 1'));
  Promise.resolve().then(() => order2.push('Promise 2'));
  process.nextTick(() => order2.push('nextTick 2'));
  process.nextTick(() => {
    order2.push('nextTick 3');
    Promise.resolve().then(() => order2.push('Promise in nextTick'));
  });

  setTimeout(() => {
    console.log('  执行顺序:');
    order2.forEach((item, i) => console.log(\`    [\${i + 1}] \${item}\`));
    console.log('  🔑 结论：所有 nextTick 清空后，才执行 Promise 微任务');
    demo3TimeoutVsImmediate();
  }, 50);
}

// ============================================
// --- Demo 3：setTimeout(0) vs setImmediate ---
// ============================================
function demo3TimeoutVsImmediate() {
  console.log('\\n===== Demo 3：setTimeout(fn,0) vs setImmediate =====');
  console.log('  （在主模块顶层运行多次，顺序可能不同）\\n');

  let timeoutWins = 0;
  let immediateWins = 0;
  let rounds = 0;
  const totalRounds = 5;

  function runRound() {
    rounds++;
    let done = false;

    setTimeout(() => {
      if (!done) {
        done = true;
        timeoutWins++;
        if (rounds < totalRounds) {
          runRound();
        } else {
          printResults();
        }
      }
    }, 0);

    setImmediate(() => {
      if (!done) {
        done = true;
        immediateWins++;
        if (rounds < totalRounds) {
          runRound();
        } else {
          printResults();
        }
      }
    });
  }

  function printResults() {
    console.log(\`  \${totalRounds} 轮测试结果:\`);
    console.log(\`    setTimeout(0) 先执行: \${timeoutWins} 次\`);
    console.log(\`    setImmediate 先执行: \${immediateWins} 次\`);
    console.log('  🔑 结论：主模块中顺序不确定！取决于事件循环准备速度');
    demo4IOdeterministic();
  }

  runRound();
}

// ============================================
// --- Demo 4：I/O 回调中 setImmediate 一定先于 setTimeout ---
// ============================================
function demo4IOdeterministic() {
  console.log('\\n===== Demo 4：I/O 回调中顺序是确定的！=====');

  const tmpFile = path.join(os.tmpdir(), 'event-loop-test.txt');
  fs.writeFileSync(tmpFile, 'test');

  console.log('  在 fs.readFile 回调中：');

  fs.readFile(tmpFile, () => {
    const results = [];

    setImmediate(() => {
      results.push('setImmediate');
    });

    setTimeout(() => {
      results.push('setTimeout(0)');

      // 两者都执行完后打印
      setImmediate(() => {
        console.log('  执行顺序:', results.join(' → '));
        console.log('  🔑 结论：I/O 回调（poll阶段）后是 check 阶段（setImmediate）');
        console.log('       然后才是下一轮的 timers 阶段（setTimeout）');
        demo5BlockEventLoop();
      });
    }, 0);
  });
}

// ============================================
// --- Demo 5：阻塞事件循环的后果 ---
// ============================================
function demo5BlockEventLoop() {
  console.log('\\n===== Demo 5：阻塞事件循环演示 =====');

  const blockTime = 1000; // 阻塞 1 秒

  setTimeout(() => {
    console.log(\`  setTimeout 回调执行（预期 100ms，实际被阻塞延迟了）\`);
    demo6FullOrder();
  }, 100);

  setImmediate(() => {
    console.log('  setImmediate 也被阻塞了');
  });

  Promise.resolve().then(() => {
    console.log('  Promise 微任务也被阻塞了');
  });

  console.log(\`  开始阻塞事件循环 \${blockTime}ms...\`);
  console.log('  （此时所有异步回调都无法执行！）');
  const start = Date.now();

  // ⚠️ 这就是阻塞事件循环！
  // 现实中 CPU 密集计算、大循环、同步 I/O 都会这样
  while (Date.now() - start < blockTime) {
    // 忙等待 - 阻塞事件循环！
  }

  console.log(\`  阻塞结束，实际阻塞: \${Date.now() - start}ms\`);
  console.log('  现在异步回调开始陆续执行...');
}

// ============================================
// --- Demo 6：完整执行顺序深度演示 ---
// ============================================
function demo6FullOrder() {
  console.log('\\n===== Demo 6：完整执行顺序深度演示 =====');

  const steps = [];
  function record(name) {
    steps.push(name);
  }

  // 1. 同步代码
  record('同步代码 1');

  // 各种异步
  setTimeout(() => {
    record('setTimeout 1');
    process.nextTick(() => record('nextTick in setTimeout 1'));
    Promise.resolve().then(() => record('Promise in setTimeout 1'));
  }, 0);

  setImmediate(() => {
    record('setImmediate 1');
    process.nextTick(() => record('nextTick in setImmediate'));
    Promise.resolve().then(() => record('Promise in setImmediate'));
  });

  process.nextTick(() => {
    record('nextTick 1');
    process.nextTick(() => record('nextTick in nextTick'));
    Promise.resolve().then(() => record('Promise in nextTick'));
  });

  Promise.resolve().then(() => {
    record('Promise 1');
    process.nextTick(() => record('nextTick in Promise'));
    Promise.resolve().then(() => record('Promise in Promise'));
  });

  setTimeout(() => {
    record('setTimeout 2');
  }, 0);

  record('同步代码 2');

  // 等待所有执行完
  setTimeout(() => {
    console.log('  完整执行顺序:');
    steps.forEach((step, i) => console.log(\`    [\${i + 1}] \${step}\`));
    console.log('\\n📝 事件循环总结：');
    console.log('1. 同步代码先执行（调用栈）');
    console.log('2. 微任务：nextTick 队列清空 → Promise 队列清空');
    console.log('3. 事件循环按6个阶段循环：timers → pending → poll → check → close');
    console.log('4. 每个阶段后都清空微任务队列');
    console.log('5. 主模块中 setTimeout(0) vs setImmediate 顺序不确定');
    console.log('6. I/O 回调中 setImmediate 一定先于 setTimeout(0)');
    console.log('7. CPU 密集计算会阻塞整个事件循环！');
  }, 200);
}
`,
  },
  {
    id: "n4-nexttick-setimmediate",
    group: "第三部分 异步编程",
    icon: "⏱️",
    title: "nextTick 与 setImmediate：微任务与检查阶段",
    content: `# nextTick 与 setImmediate：微任务与检查阶段

\`process.nextTick()\` 和 \`setImmediate()\` 是 Node.js 中两个特殊的异步 API，它们都能"把代码推迟执行"，但执行时机和用途完全不同。理解它们的区别是深入掌握 Node.js 事件循环的关键。

## 一、process.nextTick()

### 1.1 基本用法

\`\`\`javascript
process.nextTick(callback, ...args);
\`\`\`

- 将 callback 添加到 "nextTick 队列"
- 不在事件循环的任何阶段执行，而是在**当前操作完成后、事件循环进入下一个阶段前**执行
- 可以传递参数给回调

### 1.2 执行时机

nextTick 的执行时机比你想象的要"急"：

1. **同步代码执行完后立即执行**
2. **在任何 I/O 事件或定时器之前执行**
3. **比 Promise.then() 微任务优先级更高**
4. 在**每个阶段结束后**，进入下一个阶段前，清空 nextTick 队列

\`\`\`
同步代码 → nextTick 队列 → Promise 微任务 → 事件循环下一阶段
\`\`\`

---

## 二、为什么需要 nextTick

nextTick 的设计目的是**让用户能够在事件循环继续之前处理某些事情**。

### 2.1 典型用途1：在事件触发前设置监听器

有时你需要确保在 I/O 事件触发前添加事件监听器：

\`\`\`javascript
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {
  constructor() {
    super();
    // 如果直接发射事件，监听器还没绑定，事件就丢失了！
    // this.emit('ready'); // ❌ 这时候外面还没调用 .on('ready')
    process.nextTick(() => {
      this.emit('ready'); // ✅ 推迟到同步代码执行完后再发射
    });
  }
}

// 使用
const emitter = new MyEmitter();
emitter.on('ready', () => {
  console.log('ready 事件触发了！'); // 能正常捕获
});
\`\`\`

### 2.2 典型用途2：错误处理

允许用户在 I/O 操作开始前处理错误：

\`\`\`javascript
function readData(callback) {
  if (typeof callback !== 'function') {
    // 这里不能同步 throw，因为调用者可能还没设置 try/catch
    // 也不能异步太快导致调用者的代码还没跑完
    process.nextTick(() => {
      throw new TypeError('callback must be a function');
    });
    return;
  }
  // 继续正常读取...
}
\`\`\`

### 2.3 典型用途3：保持函数异步性

确保一个 API 要么**总是同步**要么**总是异步**，不能混用（防止 Zalgo）：

\`\`\`javascript
function maybeSync(callback) {
  if (cache.hasData()) {
    // 如果数据在缓存里，不能直接同步调用 callback！
    // 这会导致 API 有时候同步有时候异步，调用者无法正确处理
    // callback(cache.get()); // ❌ 同步调用，破坏一致性
    process.nextTick(() => callback(cache.get())); // ✅ 总是异步
  } else {
    fetchFromDB(callback); // 异步操作
  }
}
\`\`\`

> 💡 **Zalgo 问题**：如果一个函数有时候同步回调、有时候异步回调，调用者就必须同时处理两种情况，非常容易出 bug。\`process.nextTick\` 保证即使数据已经准备好，回调也总是异步执行，API 行为一致。

---

## 三、nextTick 饥饿问题（Starvation）

nextTick 会在每个阶段结束后**完全清空**nextTick 队列。如果你递归地在 nextTick 中注册 nextTick，会导致事件循环永远无法进入下一个阶段——I/O 和定时器都会被饿死！

\`\`\`javascript
// ⚠️ 危险！递归 nextTick 会阻塞事件循环！
function recursiveNextTick() {
  process.nextTick(recursiveNextTick);
}
recursiveNextTick();

// 下面的代码永远不会执行！
setTimeout(() => console.log('timeout'), 0); // 永远等不到
setImmediate(() => console.log('immediate')); // 永远等不到
// I/O 回调也永远不会执行
\`\`\`

因为 nextTick 队列永远清空不了，事件循环被卡住了。这叫做**事件循环饥饿**。

> ⚠️ **重要警告**：不要递归使用 process.nextTick！它会饿死 I/O 和其他阶段。如果需要递归地推迟任务，使用 setImmediate。

---

## 四、setImmediate()

### 4.1 基本用法

\`\`\`javascript
setImmediate(callback, ...args);
\`\`\`

- 在事件循环的 **check 阶段**执行
- poll 阶段完成后立即执行
- 返回一个 immediate 对象，可以用 \`clearImmediate()\` 取消

### 4.2 执行时机

setImmediate 在**当前轮次的 poll 阶段完成后**执行，即在 check 阶段。它总是在 I/O 回调之后、下一轮 timers 之前。

---

## 五、setTimeout(fn, 0) vs setImmediate 深度对比

| 特性 | setTimeout(fn, 0) | setImmediate |
|------|-------------------|--------------|
| **执行阶段** | timers 阶段（下一轮循环） | check 阶段（当前轮次 poll 之后）|
| **最小延迟** | 实际约 1ms（非精确 0ms）| 无延迟，poll 完就执行 |
| **主模块中** | 顺序不确定 | 顺序不确定 |
| **I/O 回调中** | 下一轮执行 | 当前轮次立即执行（一定先于 setTimeout）|
| **递归行为** | 每轮至少一个 setTimeout 执行 | 每轮执行一个，不会饿死其他 I/O |

### 5.1 为什么 I/O 回调中 setImmediate 一定先执行

事件循环阶段顺序：poll → check → close → timers → ...

I/O 回调在 poll 阶段执行。poll 阶段执行完后，紧接着是 check 阶段（setImmediate），然后才是 close 阶段，之后才回到下一轮循环的 timers 阶段。

所以在 I/O 回调中：
1. 注册 setImmediate → 加入 check 队列（当前轮次）
2. 注册 setTimeout(fn,0) → 加入 timers 队列（下一轮次）
3. poll 阶段结束 → check 阶段执行 setImmediate
4. 下一轮循环 → timers 阶段执行 setTimeout

---

## 六、什么时候用什么？

| 场景 | 推荐 |
|------|------|
| 需要在事件循环继续前执行（如错误处理、发射事件前设置监听器）| process.nextTick |
| 需要异步执行但不需要 I/O 前置 | setImmediate |
| 需要指定延迟执行 | setTimeout |
| 递归执行异步任务（避免饿死 I/O）| setImmediate |
| 标准的微任务（跨平台一致）| queueMicrotask |

> ✅ **最佳实践**：大多数情况下，优先使用 \`setImmediate\` 而不是 \`process.nextTick\`。nextTick 有饥饿问题，setImmediate 更安全。只有在确实需要"就在当前操作之后、任何 I/O 之前"执行的特殊场景才用 nextTick。

---

## 七、queueMicrotask() - 标准微任务 API

Node.js 11+ 提供了标准的 \`queueMicrotask()\` API，它将回调加入 Promise 微任务队列：

\`\`\`javascript
queueMicrotask(() => {
  console.log('这是一个标准微任务');
});

// 等价于
Promise.resolve().then(() => {
  console.log('这是一个标准微任务');
});
\`\`\`

优先级顺序：
\`\`\`
同步代码 → process.nextTick → queueMicrotask/Promise.then → 事件循环
\`\`\`

使用 \`queueMicrotask\` 比 \`Promise.resolve().then()\` 更直观，意图更清晰。

---

## 八、执行顺序完整总结

把所有异步 API 的执行时机放在一起（按优先级从高到低）：

1. **同步代码**（当前调用栈）
2. **process.nextTick 队列**（全部执行完）
3. **Promise 微任务 / queueMicrotask**（全部执行完）
4. **事件循环一个阶段的宏任务**（执行一个或一批）
5. 回到步骤 2（当前宏任务结束后，先执行微任务）

这就是 Node.js 异步执行顺序的完整图谱！
`,
    code: `// ============================================
// nextTick 与 setImmediate 完整示例
// 运行方式：node n4-nexttick-setimmediate-demo.js
// ============================================

const fs = require('fs');
const path = require('path');
const os = require('os');

const tmpFile = path.join(os.tmpdir(), 'nexttick-test.txt');
fs.writeFileSync(tmpFile, 'test content');

// ============================================
// --- Demo 1：nextTick 基础执行顺序 ---
// ============================================
console.log('===== Demo 1：nextTick 基础执行顺序 =====');

const order1 = [];
function log1(name) {
  order1.push(name);
  console.log(\`  \${name}\`);
}

log1('1. 同步代码开始');

process.nextTick(() => log1('5. process.nextTick 回调'));
Promise.resolve().then(() => log1('6. Promise.then 回调'));
setTimeout(() => log1('7. setTimeout 回调'), 0);
setImmediate(() => log1('8. setImmediate 回调'));

log1('2. 同步代码继续');

process.nextTick(() => {
  log1('5.1 nextTick 中再注册 nextTick');
  process.nextTick(() => log1('5.2 nextTick 嵌套的 nextTick'));
  Promise.resolve().then(() => log1('6.1 nextTick 中注册的 Promise'));
});

log1('3. 同步代码结束');
log1('4. 调用栈清空，接下来是微任务...');

setTimeout(() => {
  console.log('\\n  📊 观察：nextTick 比 Promise 先执行！');
  console.log('  nextTick 中的 nextTick 也在同一次清空中执行');
  demo2NextTickUseCases();
}, 50);

// ============================================
// --- Demo 2：nextTick 的实际用途 ---
// ============================================
function demo2NextTickUseCases() {
  console.log('\\n===== Demo 2：nextTick 的用途 =====');

  // 用途1：保证事件能被监听器捕获
  console.log('\\n  --- 用途1：事件触发时机 ---');

  const EventEmitter = require('events');
  class SafeEmitter extends EventEmitter {
    constructor() {
      super();
      console.log('  构造函数中...');

      // 如果直接 emit，监听器还没绑定
      // this.emit('init'); // ❌ 监听器会错过事件

      // 用 nextTick 推迟到同步代码完成后
      process.nextTick(() => {
        this.emit('init', '构造完成的数据');
      });
    }
  }

  const emitter = new SafeEmitter();
  console.log('  构造函数返回了，现在绑定监听器');
  emitter.on('init', (data) => {
    console.log('  ✅ 收到 init 事件:', data);
  });

  // 等一下让 nextTick 执行
  setTimeout(() => {
    // 用途2：保持 API 异步一致性
    console.log('\\n  --- 用途2：保持 API 总是异步 ---');

    function asyncEvenNumber(n, callback) {
      if (n % 2 !== 0) {
        // 错误也要异步传递！
        process.nextTick(callback, new Error('必须是偶数'));
        return;
      }
      // 即使数据准备好了，也要用 nextTick 异步回调
      process.nextTick(callback, null, n * 2);
    }

    // 调用者可以确定回调一定是异步的
    let syncFlag = true;
    asyncEvenNumber(4, (err, result) => {
      console.log(\`  回调执行时 syncFlag = \${syncFlag}（必须是 false，说明异步）\`);
      console.log(\`  结果: \${result}\`);
    });
    syncFlag = false;

    asyncEvenNumber(3, (err) => {
      console.log('  错误处理也是异步的:', err.message);
    });

    setTimeout(() => demo3NextTickStarvation(), 50);
  }, 50);
}

// ============================================
// --- Demo 3：nextTick 饥饿问题 ---
// ============================================
function demo3NextTickStarvation() {
  console.log('\\n===== Demo 3：nextTick 饥饿问题（演示但不真的饿死）=====');
  console.log('  递归 nextTick 会导致事件循环无法进入下一阶段！');
  console.log('  这里我们只递归3次来演示，实际会饿死 I/O');

  let count = 0;
  const maxCount = 5;

  function recursive() {
    count++;
    if (count <= maxCount) {
      console.log(\`    nextTick 递归 #\${count}\`);
      process.nextTick(recursive);
    }
  }

  setTimeout(() => console.log('  setTimeout 本来应该在 nextTick 之前？不！'), 0);
  recursive();

  // 注意：所有 nextTick 都执行完后 setTimeout 才会执行
  setTimeout(() => {
    console.log('  setTimeout 执行了！所有递归 nextTick 完成后才轮到我');
    console.log('  🔑 如果递归不停止，setTimeout 永远不会执行 - 这就是饥饿！');
    demo4SetImmediate();
  }, 100);
}

// ============================================
// --- Demo 4：setImmediate 基础 ---
// ============================================
function demo4SetImmediate() {
  console.log('\\n===== Demo 4：setImmediate 执行时机 =====');

  const order = [];

  setImmediate(() => order.push('setImmediate 1'));
  setImmediate(() => {
    order.push('setImmediate 2');
    setImmediate(() => order.push('setImmediate 嵌套'));
  });
  process.nextTick(() => order.push('nextTick'));
  Promise.resolve().then(() => order.push('Promise'));

  setTimeout(() => {
    console.log('  执行顺序:');
    order.forEach((s, i) => console.log(\`    [\${i + 1}] \${s}\`));
    console.log('  🔑 nextTick → Promise → setImmediate');
    demo5Deterministic();
  }, 50);
}

// ============================================
// --- Demo 5：I/O 回调中的确定顺序 ---
// ============================================
function demo5Deterministic() {
  console.log('\\n===== Demo 5：I/O 回调中的确定顺序 =====');
  console.log('  在 fs.readFile 回调中（poll 阶段）：');

  fs.readFile(tmpFile, () => {
    const ioOrder = [];

    // 注意：这里是在 poll 阶段执行！
    setImmediate(() => ioOrder.push('1. setImmediate（check阶段，当前轮次）'));
    setTimeout(() => ioOrder.push('2. setTimeout(0)（timers阶段，下一轮次）'), 0);
    process.nextTick(() => {
      ioOrder.push('0. nextTick（微任务，在 poll 结束后立即执行！）');
    });
    Promise.resolve().then(() => ioOrder.push('0.5 Promise 微任务'));

    // 等所有执行完
    setImmediate(() => {
      console.log('  顺序：');
      ioOrder.forEach(s => console.log('    ' + s));
      console.log('  🔑 poll阶段回调 → nextTick → Promise → check(setImmediate) → 下一轮 timers');
      demo6RecursiveSetImmediate();
    });
  });
}

// ============================================
// --- Demo 6：递归 setImmediate vs nextTick ---
// ============================================
function demo6RecursiveSetImmediate() {
  console.log('\\n===== Demo 6：递归 setImmediate 不会饿死 I/O =====');
  console.log('  递归 setImmediate：每次 check 阶段只执行一个，');
  console.log('  事件循环可以正常处理 I/O 和 timers');

  let count = 0;
  const maxCount = 5;
  const start = Date.now();

  function recursiveImmediate() {
    count++;
    if (count <= maxCount) {
      if (count === 1) {
        // 在递归过程中插入一个 setTimeout
        setTimeout(() => {
          console.log(\`    setTimeout 执行了！递归还在继续（count=\${count}）\`);
        }, 10);
      }
      console.log(\`    setImmediate 递归 #\${count}\`);
      setImmediate(recursiveImmediate);
    } else {
      console.log(\`    递归完成，耗时 \${Date.now() - start}ms\`);
      console.log('  🔑 setImmediate 递归不会饿死其他任务！');
      demo7QueueMicrotask();
    }
  }

  recursiveImmediate();
}

// ============================================
// --- Demo 7：queueMicrotask ---
// ============================================
function demo7QueueMicrotask() {
  console.log('\\n===== Demo 7：queueMicrotask 标准微任务 API =====');

  const order7 = [];

  queueMicrotask(() => order7.push('queueMicrotask 1'));
  process.nextTick(() => order7.push('process.nextTick'));
  queueMicrotask(() => order7.push('queueMicrotask 2'));
  Promise.resolve().then(() => order7.push('Promise.then'));
  queueMicrotask(() => {
    order7.push('queueMicrotask 3');
    queueMicrotask(() => order7.push('queueMicrotask 嵌套'));
  });

  setTimeout(() => {
    console.log('  执行顺序:');
    order7.forEach((s, i) => console.log(\`    [\${i + 1}] \${s}\`));
    console.log('  🔑 nextTick > queueMicrotask = Promise.then');
    console.log('  queueMicrotask 和 Promise.then 在同一队列');
    demo8Summary();
  }, 50);
}

// ============================================
// --- Demo 8：完整优先级总结 ---
// ============================================
function demo8Summary() {
  console.log('\\n===== Demo 8：完整执行优先级总结 =====');

  const fullOrder = [];

  // 同步
  fullOrder.push('1. 同步代码');

  // 各种异步
  process.nextTick(() => fullOrder.push('3. process.nextTick'));
  queueMicrotask(() => fullOrder.push('4. queueMicrotask'));
  Promise.resolve().then(() => fullOrder.push('5. Promise.then'));
  setTimeout(() => {
    fullOrder.push('7. setTimeout（timers阶段）');
    // 在宏任务中再注册微任务
    process.nextTick(() => fullOrder.push('8. setTimeout 中的 nextTick'));
    Promise.resolve().then(() => fullOrder.push('9. setTimeout 中的 Promise'));
    setImmediate(() => fullOrder.push('10. setTimeout 中的 setImmediate（需要下一轮）'));
  }, 0);
  setImmediate(() => {
    fullOrder.push('7.x setImmediate（check阶段，可能先或后于setTimeout）');
  });

  setTimeout(() => {
    console.log('  完整优先级：');
    fullOrder.forEach(s => console.log('    ' + s));
    console.log('\\n📝 nextTick vs setImmediate 总结：');
    console.log('1. process.nextTick 在当前操作后立即执行，优先级最高');
    console.log('2. setImmediate 在 check 阶段执行（poll 之后）');
    console.log('3. 递归 nextTick 会饿死 I/O，setImmediate 不会');
    console.log('4. I/O 回调中 setImmediate 一定先于 setTimeout(0)');
    console.log('5. 大多数时候用 setImmediate 代替 nextTick 更安全');
    console.log('6. queueMicrotask 是标准微任务 API，与 Promise.then 同级');
    console.log('7. nextTick 用于：事件发射前、错误处理、API 异步一致性');
  }, 100);
}
`,
  },
  {
    id: "n4-timers",
    group: "第三部分 异步编程",
    icon: "⏰",
    title: "定时器：setTimeout/setInterval 与时间控制",
    content: `# 定时器：setTimeout/setInterval 与时间控制

定时器是 Node.js 中最基础的异步 API 之一，用于在指定时间后执行代码，或按固定间隔重复执行。虽然简单，但要注意定时器不精确、内存泄漏等问题。

## 一、setTimeout - 延迟执行

### 1.1 基本用法

\`\`\`javascript
const timer = setTimeout(callback, delay, ...args);
\`\`\`

- \`callback\`：延迟后执行的函数
- \`delay\`：延迟毫秒数（默认 0，但实际最小约 1ms）
- \`...args\`：传递给 callback 的参数
- 返回一个 Timeout 对象，用于取消定时器

\`\`\`javascript
// 2秒后执行
setTimeout((name, age) => {
  console.log(\`你好 \${name}，你 \${age} 岁了\`);
}, 2000, '张三', 25);
\`\`\`

### 1.2 取消定时器：clearTimeout

\`\`\`javascript
const timer = setTimeout(() => console.log('不会执行'), 5000);
clearTimeout(timer); // 取消，回调不会执行
\`\`\`

### 1.3 零延迟 setTimeout(fn, 0)

\`setTimeout(fn, 0)\` 不是"立即执行"，而是"尽快执行"——等当前同步代码和微任务执行完，在 timers 阶段执行。

---

## 二、setInterval - 重复执行

### 2.1 基本用法

\`\`\`javascript
const interval = setInterval(callback, interval, ...args);
\`\`\`

每隔 interval 毫秒执行一次 callback。

\`\`\`javascript
let count = 0;
const timer = setInterval(() => {
  count++;
  console.log('第', count, '次执行');
  if (count >= 5) {
    clearInterval(timer); // 停止
  }
}, 1000);
\`\`\`

### 2.2 取消定时器：clearInterval

\`\`\`javascript
clearInterval(interval);
\`\`\`

---

## 三、定时器不精确的原因

⚠️ **Node.js 的定时器不保证精确的执行时间**，原因：

1. **事件循环延迟**：如果事件循环被阻塞（CPU密集计算），定时器回调会被推迟
2. **最小延迟**：即使设 delay=0，也有约 1ms 的最小延迟
3. **系统调度**：操作系统对进程的调度也会带来延迟
4. **执行时间**：回调本身的执行时间会影响后续定时器

\`\`\`javascript
const start = Date.now();
setTimeout(() => {
  console.log('预期 100ms，实际:', Date.now() - start, 'ms');
}, 100);

// 如果在这里加一个阻塞操作...
// while (Date.now() - start < 500) {} // 阻塞500ms
// setTimeout 会被推迟到 500ms+ 才执行！
\`\`\`

---

## 四、递归 setTimeout vs setInterval

两者都能重复执行，但有重要区别：

### 4.1 setInterval 的问题：执行时间漂移

setInterval 是按固定间隔调度，不管回调执行多久：

\`\`\`
|--100ms--|--100ms--|--100ms--|
^        ^        ^        ^
start    执行     执行     执行
         |--回调执行50ms--|
                  ^ 这里只有50ms间隔
\`\`\`

如果回调执行时间长，可能出现：
- 回调堆积（上一个还没执行完，下一个就被加入队列）
- 实际间隔比设定的短

### 4.2 递归 setTimeout：精确控制间隔

递归 setTimeout 可以在回调执行完后再安排下一次，避免漂移：

\`\`\`javascript
function recursiveTimeout() {
  setTimeout(() => {
    // 执行任务...
    console.log('执行时间:', Date.now());
    recursiveTimeout(); // 执行完后再安排下一次
  }, 1000);
}
\`\`\`

递归 setTimeout 保证两次执行之间的间隔至少是 delay（回调执行时间不影响间隔），而 setInterval 是按"开始时间"算间隔的。

---

## 五、timer.ref() 和 timer.unref()

默认情况下，只要有活跃的定时器，Node.js 进程就不会退出。但你可以调用 \`timer.unref()\` 让定时器"不阻止进程退出"：

\`\`\`javascript
const timer = setInterval(() => {
  console.log('心跳...');
}, 1000);

timer.unref(); // 即使这个定时器还在，进程也可以退出
// 如果没有其他活跃任务，进程会直接退出，定时器不会执行

// timer.ref(); // 恢复，让定时器重新阻止退出
\`\`\`

典型用途：
- 心跳/监控定时器不应该阻止进程退出
- 后台清理任务
- 客户端连接保活定时器

---

## 六、Node.js 定时器 vs 浏览器定时器

| 特性 | Node.js | 浏览器 |
|------|---------|--------|
| 最小延迟（0ms）| 约 1ms | 嵌套超过5层后最小4ms |
| setTimeout 回调参数 | 支持 | 旧 IE 不支持 |
| 返回值 | Timeout 对象 | 数字 ID |
| unref/ref | 有 | 无 |

---

## 七、防抖（Debounce）与节流（Throttle）

这是定时器最经典的应用场景。

### 7.1 防抖（Debounce）

防抖：事件触发后等待 wait 毫秒，如果期间又触发了则重新计时。适合搜索框输入、窗口resize：

\`\`\`javascript
function debounce(fn, wait) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

// 使用：输入停止300ms后才搜索
const search = debounce((keyword) => {
  console.log('搜索:', keyword);
}, 300);
\`\`\`

### 7.2 节流（Throttle）

节流：在 wait 毫秒内最多执行一次。适合滚动事件、按钮防重复点击：

\`\`\`javascript
function throttle(fn, wait) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
\`\`\`

---

## 八、定时器最佳实践

1. **及时 clearTimeout/clearInterval**：不需要的定时器一定要取消，防止内存泄漏
2. **用递归 setTimeout 替代 setInterval**：避免回调堆积和时间漂移
3. **注意定时器不精确**：不要用定时器做精确计时
4. **避免阻塞事件循环**：定时器回调中的同步阻塞会影响所有后续定时器
5. **后台任务用 unref**：防止定时器阻止进程正常退出
6. **注意 this 指向**：setTimeout 回调中的 this 不指向原对象（箭头函数可以解决）
`,
    code: `// ============================================
// 定时器完整示例
// 运行方式：node n4-timers-demo.js
// ============================================

// ============================================
// --- Demo 1：setTimeout 基础 ---
// ============================================
console.log('===== Demo 1：setTimeout 基础 =====');

console.log('  开始');

// 基本用法：延迟执行
setTimeout((name, greeting) => {
  console.log(\`  \${greeting}, \${name}!\`);
}, 500, '张三', '你好'); // 后面的参数传给回调

// 0ms 延迟 - 不是立即执行，而是等同步代码和微任务执行完
setTimeout(() => {
  console.log('  setTimeout(0) 执行了');
  console.log('  注意：同步代码和微任务都执行完后才轮到我');
}, 0);

Promise.resolve().then(() => {
  console.log('  Promise 微任务执行');
});

process.nextTick(() => {
  console.log('  nextTick 执行（在 Promise 前）');
});

console.log('  同步代码结束');

setTimeout(() => demo2Cancel(), 600);

// ============================================
// --- Demo 2：clearTimeout 取消定时器 ---
// ============================================
function demo2Cancel() {
  console.log('\\n===== Demo 2：取消定时器 =====');

  const timer1 = setTimeout(() => {
    console.log('  这个定时器不会执行，因为被取消了');
  }, 1000);

  clearTimeout(timer1);
  console.log('  timer1 已取消');

  const timer2 = setTimeout(() => {
    console.log('  这个定时器会执行');
    demo3Interval();
  }, 200);
}

// ============================================
// --- Demo 3：setInterval ---
// ============================================
function demo3Interval() {
  console.log('\\n===== Demo 3：setInterval 重复执行 =====');

  let count = 0;
  const start = Date.now();

  const interval = setInterval(() => {
    count++;
    const elapsed = Date.now() - start;
    console.log(\`  第 \${count} 次执行，已过 \${elapsed}ms\`);

    if (count >= 5) {
      clearInterval(interval);
      console.log('  已停止 interval');
      demo4Recursive();
    }
  }, 200);
}

// ============================================
// --- Demo 4：递归 setTimeout vs setInterval 漂移 ---
// ============================================
function demo4Recursive() {
  console.log('\\n===== Demo 4：递归 setTimeout vs setInterval 对比 =====');

  // 模拟一个耗时操作
  function blockingTask(ms) {
    const end = Date.now() + ms;
    while (Date.now() < end) {} // 模拟阻塞
  }

  console.log('  --- setInterval 漂移问题 ---');
  let intCount = 0;
  const intStart = Date.now();

  const interval = setInterval(() => {
    intCount++;
    blockingTask(50); // 回调执行50ms
    const elapsed = Date.now() - intStart;
    console.log(\`    setInterval 第\${intCount}次: \${elapsed}ms (理论值:\${intCount*100}ms)\`);

    if (intCount >= 3) {
      clearInterval(interval);

      setTimeout(() => {
        console.log('\\n  --- 递归 setTimeout（无漂移）---');
        let recCount = 0;
        const recStart = Date.now();

        function recursiveSetTimeout() {
          recCount++;
          blockingTask(50); // 同样阻塞50ms
          const elapsed = Date.now() - recStart;
          console.log(\`    递归setTimeout 第\${recCount}次: \${elapsed}ms (理论值:\${recCount*150}ms)\`);

          if (recCount < 3) {
            setTimeout(recursiveSetTimeout, 100);
          } else {
            setTimeout(demo5Unref, 100);
          }
        }
        setTimeout(recursiveSetTimeout, 100);
      }, 200);
    }
  }, 100);
}

// ============================================
// --- Demo 5：unref 允许进程退出 ---
// ============================================
function demo5Unref() {
  console.log('\\n===== Demo 5：timer.unref() 演示 =====');

  const heartbeat = setInterval(() => {
    console.log('  心跳（不会阻止进程退出）');
  }, 500);

  heartbeat.unref(); // 不阻止进程退出
  console.log('  心跳定时器已 unref');

  // 创建一个会结束的定时器
  setTimeout(() => {
    console.log('  主任务完成');
    console.log('  进程即将退出（因为唯一的活跃定时器 unref 了）');
    clearInterval(heartbeat);
    demo6Debounce();
  }, 300);
}

// ============================================
// --- Demo 6：防抖 Debounce 实现 ---
// ============================================
function demo6Debounce() {
  console.log('\\n===== Demo 6：防抖（Debounce）实现 =====');

  function debounce(fn, wait) {
    let timer = null;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // 模拟搜索输入
  function search(keyword) {
    console.log(\`  🔍 搜索: \${keyword}\`);
  }

  const debouncedSearch = debounce(search, 300);

  console.log('  模拟快速输入：');
  debouncedSearch('a');
  setTimeout(() => debouncedSearch('ab'), 50);
  setTimeout(() => debouncedSearch('abc'), 100);
  setTimeout(() => debouncedSearch('abcd'), 150);
  setTimeout(() => debouncedSearch('abcde'), 200);
  // 只有最后一次会执行，等300ms后

  setTimeout(() => {
    console.log('  （停止输入300ms后执行一次搜索）');
    demo7Throttle();
  }, 600);
}

// ============================================
// --- Demo 7：节流 Throttle 实现 ---
// ============================================
function demo7Throttle() {
  console.log('\\n===== Demo 7：节流（Throttle）实现 =====');

  function throttle(fn, wait) {
    let lastTime = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastTime >= wait) {
        lastTime = now;
        fn.apply(this, args);
      }
    };
  }

  function handleScroll(position) {
    console.log(\`  📜 处理滚动位置: \${position}px\`);
  }

  const throttledScroll = throttle(handleScroll, 200);

  console.log('  模拟频繁滚动事件（每50ms触发一次）:');
  let pos = 0;
  const scrollInterval = setInterval(() => {
    pos += 50;
    throttledScroll(pos);
    if (pos >= 500) {
      clearInterval(scrollInterval);
      setTimeout(() => {
        demo8Inaccuracy();
      }, 300);
    }
  }, 50);
}

// ============================================
// --- Demo 8：定时器不精确演示 ---
// ============================================
function demo8Inaccuracy() {
  console.log('\\n===== Demo 8：定时器不精确演示 =====');

  const delays = [0, 10, 50, 100];
  const results = [];

  delays.forEach(delay => {
    const start = process.hrtime.bigint();
    setTimeout(() => {
      const actual = Number(process.hrtime.bigint() - start) / 1e6;
      results.push({ expected: delay, actual: actual.toFixed(2) });

      if (results.length === delays.length) {
        console.log('  预期延迟 vs 实际延迟:');
        results.forEach(r => {
          console.log(\`    预期\${r.expected}ms → 实际\${r.actual}ms\`);
        });
        console.log('\\n📝 定时器总结：');
        console.log('1. setTimeout 延迟执行，setInterval 重复执行');
        console.log('2. 定时器不精确，受事件循环影响');
        console.log('3. 递归 setTimeout 比 setInterval 更可控');
        console.log('4. unref() 让定时器不阻止进程退出');
        console.log('5. 防抖：最后一次触发后 wait ms 执行');
        console.log('6. 节流：wait ms 内最多执行一次');
        console.log('7. 记得及时 clearTimeout/clearInterval 防止泄漏');
      }
    }, delay);
  });
}
`,
  },
  {
    id: "n4-async-iterator",
    group: "第三部分 异步编程",
    icon: "🔄",
    title: "异步迭代器与 for await...of",
    content: `# 异步迭代器与 for await...of

异步迭代器（Async Iterator）是 ES2018 引入的特性，它让你可以用 \`for await...of\` 循环逐个处理异步产生的数据。这是处理数据流、分页API、可读流等场景的优雅方案。

## 一、什么是异步可迭代对象

### 1.1 同步迭代器回顾

同步迭代器实现了 \`Symbol.iterator\` 方法，返回一个有 \`next()\` 方法的对象：

\`\`\`javascript
const arr = [1, 2, 3];
const iterator = arr[Symbol.iterator]();
console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.next()); // { value: 3, done: false }
console.log(iterator.next()); // { value: undefined, done: true }
\`\`\`

### 1.2 异步迭代器

异步迭代器实现了 \`Symbol.asyncIterator\` 方法，\`next()\` 返回 **Promise**（resolve 为 {value, done}）：

\`\`\`javascript
const asyncIterable = {
  [Symbol.asyncIterator]() {
    let i = 0;
    return {
      async next() {
        await delay(100); // 模拟异步获取数据
        if (i < 3) return { value: i++, done: false };
        return { done: true };
      }
    };
  }
};
\`\`\`

---

## 二、for await...of 循环

### 2.1 基本用法

\`for await...of\` 可以遍历异步可迭代对象，每次等待 Promise 完成：

\`\`\`javascript
async function iterate() {
  for await (const value of asyncIterable) {
    console.log(value); // 依次输出 0, 1, 2，每次间隔100ms
  }
}
\`\`\`

### 2.2 for await...of 只能在 async 函数中使用

和 await 一样，\`for await...of\` 也只能在 async 函数（或 ESM 顶层）中使用。

---

## 三、异步生成器（Async Generators）

异步生成器是创建异步迭代器最方便的方式，使用 \`async function*\` 和 \`yield\`：

\`\`\`javascript
async function* asyncGenerator() {
  for (let i = 0; i < 3; i++) {
    await delay(100); // 异步操作
    yield i; // 产出值
  }
}

// 使用
for await (const val of asyncGenerator()) {
  console.log(val);
}
\`\`\`

异步生成器比手动实现 \`Symbol.asyncIterator\` 简洁得多。

---

## 四、Node.js 中的异步迭代

Node.js 的许多核心 API 都支持异步迭代！

### 4.1 Readable 流是异步可迭代的

Node.js 的 Readable 流（如 fs.createReadStream）天生支持异步迭代：

\`\`\`javascript
const fs = require('fs');

async function readFileLineByLine() {
  const stream = fs.createReadStream('file.txt', 'utf8');
  for await (const chunk of stream) {
    console.log('读取到数据块:', chunk.length, '字节');
  }
}
\`\`\`

### 4.2 readline 模块逐行读取

使用 readline 逐行读取文件是异步迭代器的经典场景：

\`\`\`javascript
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('file.txt'),
  crlfDelay: Infinity
});

let lineNum = 0;
for await (const line of rl) {
  lineNum++;
  console.log(\`行\${lineNum}: \${line}\`);
}
\`\`\`

### 4.3 events.on - 将 EventEmitter 转为异步迭代器

Node.js 提供了 \`events.on()\` 可以把 EventEmitter 的事件转为异步迭代器：

\`\`\`javascript
const { on } = require('events');

async function listen(server) {
  for await (const [req, res] of on(server, 'request')) {
    res.end('hello');
  }
}
\`\`\`

---

## 五、错误处理

异步迭代中的错误用 \`try/catch\` 处理：

\`\`\`javascript
async function safeIterate(iterable) {
  try {
    for await (const value of iterable) {
      console.log(value);
    }
  } catch (err) {
    console.error('迭代出错:', err);
  }
}
\`\`\`

如果异步迭代器的 next() 返回的 Promise reject，错误会被 try/catch 捕获。

---

## 六、异步迭代的实际应用场景

1. **逐行处理大文件**：不需要一次性把文件读入内存
2. **分页 API**：自动处理下一页数据
3. **数据库游标**：逐条处理查询结果
4. **消息队列消费**：持续消费消息
5. **WebSocket 数据流**：实时处理消息
6. **流式数据转换**：类似 Unix 管道

---

## 七、异步迭代器 vs 其他方式对比

| 方式 | 适用场景 | 数据模式 |
|------|---------|---------|
| Promise.all | 一次性获取所有结果 | 全部完成后处理 |
| 回调/事件 | 事件驱动 | 回调式 |
| 异步迭代器 | 流式数据 | 逐个处理，内存友好 |

异步迭代器最大的优势是**内存效率**——不需要把所有数据加载到内存，处理一个再处理下一个，特别适合大数据量场景。
`,
    code: `// ============================================
// 异步迭代器完整示例
// 运行方式：node n4-async-iterator-demo.js
// ============================================

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { on } = require('events');

const tmpDir = os.tmpdir();

// 辅助函数：延迟
function delay(ms, value) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

// ============================================
// --- Demo 1：手动实现异步迭代器 ---
// ============================================
console.log('===== Demo 1：手动实现异步迭代器 =====');

// 创建一个模拟异步数据源
const rangeAsync = {
  [Symbol.asyncIterator]() {
    let current = 1;
    const max = 5;
    return {
      async next() {
        await delay(150);
        if (current <= max) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      },
      async return() {
        console.log('    迭代器被提前终止');
        return { done: true };
      }
    };
  }
};

(async () => {
  console.log('  遍历 1-5（每个间隔150ms）:');
  for await (const num of rangeAsync) {
    console.log(\`    收到值: \${num}\`);
  }
  console.log('  遍历完成\\n');

  demo2AsyncGenerator();
})();

// ============================================
// --- Demo 2：异步生成器 async function* ---
// ============================================
async function demo2AsyncGenerator() {
  console.log('===== Demo 2：异步生成器 =====');

  // 异步生成器 - 更简洁的写法
  async function* fetchPages(totalPages) {
    for (let page = 1; page <= totalPages; page++) {
      console.log(\`    正在获取第 \${page} 页数据...\`);
      await delay(200);
      yield { page: page, data: \`第\${page}页数据\` };
    }
  }

  console.log('  模拟分页 API 获取：');
  for await (const result of fetchPages(3)) {
    console.log(\`    处理: \${result.data}\`);
  }
  console.log('  所有页面获取完成\\n');

  demo3FileRead();
}

// ============================================
// --- Demo 3：逐行读取文件 ---
// ============================================
async function demo3FileRead() {
  console.log('===== Demo 3：逐行读取文件（readline）=====');

  // 创建测试文件
  const testFile = path.join(tmpDir, 'async-iter-lines.txt');
  const lines = ['第一行：你好', '第二行：Node.js', '第三行：异步迭代器', '第四行：for await...of', '第五行：最后一行'];
  fs.writeFileSync(testFile, lines.join('\\n'));
  console.log('  测试文件已创建:', testFile);

  const rl = readline.createInterface({
    input: fs.createReadStream(testFile, 'utf8'),
    crlfDelay: Infinity
  });

  let lineCount = 0;
  console.log('  逐行读取：');
  for await (const line of rl) {
    lineCount++;
    console.log(\`    [\${lineCount}] \${line}\`);
  }
  console.log(\`  共读取 \${lineCount} 行\\n\`);

  demo4Stream();
}

// ============================================
// --- Demo 4：Readable 流异步迭代 ---
// ============================================
async function demo4Stream() {
  console.log('===== Demo 4：Readable 流异步迭代 =====');

  const streamFile = path.join(tmpDir, 'async-iter-stream.txt');
  fs.writeFileSync(streamFile, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(100));

  let totalSize = 0;
  let chunkCount = 0;

  const stream = fs.createReadStream(streamFile, { highWaterMark: 100 });
  console.log('  按块读取文件流：');

  for await (const chunk of stream) {
    chunkCount++;
    totalSize += chunk.length;
    if (chunkCount <= 3 || chunkCount % 5 === 0) {
      console.log(\`    块\${chunkCount}: \${chunk.length} 字节, 内容前10字符: \${chunk.slice(0, 10)}...\`);
    }
  }
  console.log(\`  共 \${chunkCount} 个数据块，总大小 \${totalSize} 字节\\n\`);

  demo5Break();
}

// ============================================
// --- Demo 5：提前终止（break）---
// ============================================
async function demo5Break() {
  console.log('===== Demo 5：break 提前终止迭代 =====');

  async function* infiniteNumbers() {
    let n = 1;
    while (true) {
      await delay(100);
      yield n++;
    }
  }

  console.log('  无限序列，取前5个：');
  let sum = 0;
  for await (const n of infiniteNumbers()) {
    console.log(\`    数字: \${n}\`);
    sum += n;
    if (n >= 5) {
      console.log('    取够了，break 退出');
      break;
    }
  }
  console.log(\`  前5个数之和: \${sum}\\n\`);

  demo6ErrorHandling();
}

// ============================================
// --- Demo 6：错误处理 ---
// ============================================
async function demo6ErrorHandling() {
  console.log('===== Demo 6：异步迭代中的错误处理 =====');

  async function* failingGenerator() {
    yield 1;
    yield 2;
    throw new Error('生成器内部出错了！');
    yield 3;
  }

  try {
    for await (const val of failingGenerator()) {
      console.log(\`    收到值: \${val}\`);
    }
  } catch (err) {
    console.log(\`  ✅ 捕获到错误: \${err.message}\`);
  }
  console.log('  错误处理完成\\n');

  demo7Events();
}

// ============================================
// --- Demo 7：events.on 转换 EventEmitter ---
// ============================================
async function demo7Events() {
  console.log('===== Demo 7：events.on 与 EventEmitter =====');

  const { EventEmitter } = require('events');
  const emitter = new EventEmitter();

  // 定时发送事件
  let count = 0;
  const interval = setInterval(() => {
    count++;
    emitter.emit('data', \`消息\${count}\`);
    if (count >= 3) {
      clearInterval(interval);
      emitter.emit('end');
    }
  }, 200);

  console.log('  监听 data 事件（异步迭代方式）:');

  // 注意：实际项目中可以用 events.on(emitter, 'data')，但它会一直等待
  // 这里我们手动收集
  const asyncIterator = on(emitter, 'data');
  let received = 0;

  for await (const [msg] of asyncIterator) {
    console.log(\`    收到事件: \${msg}\`);
    received++;
    if (received >= 3) break;
  }

  setTimeout(() => {
    console.log('\\n📝 异步迭代器总结：');
    console.log('1. Symbol.asyncIterator 定义异步迭代协议');
    console.log('2. for await...of 遍历异步可迭代对象');
    console.log('3. async function* 异步生成器最方便');
    console.log('4. Node.js Readable 流原生支持异步迭代');
    console.log('5. readline 模块逐行读取文件');
    console.log('6. events.on 把 EventEmitter 转为异步迭代器');
    console.log('7. 适合流式/分页/大文件等内存友好场景');
  }, 100);
}
`,
  },
  {
    id: "n4-concurrency",
    group: "第三部分 异步编程",
    icon: "🚦",
    title: "并发控制：限制同时执行的任务数",
    content: `# 并发控制：限制同时执行的任务数

并发控制是生产环境中非常重要的技术。虽然 Promise.all 能并行执行任务，但它不限制并发数——如果同时发起成百上千个请求，可能导致资源耗尽、连接池爆满、被限流等问题。

## 一、为什么需要并发控制

### 1.1 Promise.all 的问题

\`Promise.all\` 会一次性启动所有任务，没有并发限制：

\`\`\`javascript
// ❌ 1000 个请求同时发出！可能导致：
// - 数据库连接池耗尽
// - 文件描述符用尽
// - 被 API 服务限流/封禁
// - 内存占用过高
const promises = [];
for (let i = 0; i < 1000; i++) {
  promises.push(fetch(\`/api/item/\${i}\`));
}
await Promise.all(promises);
\`\`\`

### 1.2 串行执行太慢

完全串行虽然安全，但效率太低：

\`\`\`javascript
// ❌ 一个接一个执行，1000个请求每个100ms要 100秒！
for (let i = 0; i < 1000; i++) {
  await fetch(\`/api/item/\${i}\`);
}
\`\`\`

### 1.3 理想方案：控制并发数

同时运行 N 个任务，每当一个完成就启动下一个新任务。这样既不会太慢，也不会压垮系统。

---

## 二、批量处理（Batching）

最简单的并发控制方式：把任务分成 N 个一组，一组完成后再执行下一组。

\`\`\`javascript
async function batchProcess(tasks, batchSize) {
  const results = [];
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(t => t()));
    results.push(...batchResults);
  }
  return results;
}
\`\`\`

优点：简单易实现
缺点：如果一批中有一个特别慢，整个批次都在等它（木桶效应）

---

## 三、队列模式（真正的并发控制）

更精细的控制：始终保持 N 个任务在运行，完成一个就补一个。这是 \`p-limit\` 库的核心原理。

### 3.1 核心思想

1. 维护一个"正在运行"的任务计数器
2. 维护一个等待队列
3. 有空闲槽位时，从队列取任务执行
4. 任务完成后释放槽位，继续执行下一个

### 3.2 实现一个并发限制器

\`\`\`javascript
function pLimit(concurrency) {
  let running = 0;
  const queue = [];

  function next() {
    if (running >= concurrency || queue.length === 0) return;
    running++;
    const { fn, resolve, reject } = queue.shift();
    fn().then(
      val => { running--; resolve(val); next(); },
      err => { running--; reject(err); next(); }
    );
  }

  return function limit(fn) {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
  };
}
\`\`\`

使用方式：

\`\`\`javascript
const limit = pLimit(3); // 最多同时3个
const tasks = urls.map(url => limit(() => fetch(url)));
const results = await Promise.all(tasks);
\`\`\`

---

## 四、并发 vs 并行

在 Node.js 中需要理解这两个概念：

| 概念 | 含义 | Node.js 中的体现 |
|------|------|----------------|
| **并发（Concurrency）** | 任务交替进行，逻辑上同时 | 事件循环处理多个 I/O 操作 |
| **并行（Parallelism）** | 物理上同时执行 | worker_threads、子进程 |

Node.js 单线程的异步操作是**并发**的（I/O 在后台，JS 线程交替处理回调），但不是**并行**的（JS 代码一次只能执行一个）。

并发控制限制的是同时"挂起"的异步操作数量，而不是真正的 CPU 并行数。

---

## 五、常见并发控制场景

| 场景 | 推荐并发数 | 原因 |
|------|-----------|------|
| 文件读取/写入 | 5-20 | 文件描述符有限 |
| HTTP API 请求 | 5-10 | 受对方限流、连接池限制 |
| 数据库查询 | 5-20 | 数据库连接池大小 |
| CPU 密集计算 | CPU核心数 | 避免线程切换开销 |

---

## 六、并发控制最佳实践

1. **总是设置合理的并发数**：根据目标系统的承载能力设置
2. **优先使用队列模式而非批量模式**：更平滑、效率更高
3. **添加超时**：每个任务应该有超时，避免一个慢任务卡住整个流程
4. **错误隔离**：单个任务失败不应该影响其他任务（用 allSettled 或 try/catch）
5. **重试机制**：失败的任务可以加入重试队列
6. **监控进度**：记录已完成/失败/等待中的任务数
7. **动态调整并发数**：根据系统负载动态增减
`,
    code: `// ============================================
// 并发控制完整示例
// 运行方式：node n4-concurrency-demo.js
// ============================================

const fs = require('fs');
const path = require('path');
const os = require('os');
const { writeFile } = require('fs').promises;

const tmpDir = os.tmpdir();

// 模拟异步任务（带随机延迟）
function simulateTask(id, minMs = 100, maxMs = 500) {
  const delay = minMs + Math.floor(Math.random() * (maxMs - minMs));
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 5% 概率失败
      if (Math.random() < 0.05) {
        reject(new Error(\`任务\${id}失败\`));
      } else {
        resolve({ id, delay, result: \`任务\${id}结果\` });
      }
    }, delay);
  });
}

// ============================================
// --- Demo 1：串行执行 ---
// ============================================
console.log('===== Demo 1：串行执行（一个接一个）=====');

async function runSequential(count) {
  const results = [];
  const start = Date.now();

  for (let i = 1; i <= count; i++) {
    try {
      const result = await simulateTask(i, 100, 200);
      results.push(result);
    } catch (err) {
      console.log(\`  \${err.message}\`);
    }
  }

  console.log(\`  串行完成 \${results.length} 个任务，耗时: \${Date.now() - start}ms\`);
  return results;
}

// ============================================
// --- Demo 2：完全并行（Promise.all）---
// ============================================
console.log('===== Demo 2：完全并行（无限制）=====');

async function runParallel(count) {
  const start = Date.now();

  const promises = [];
  for (let i = 1; i <= count; i++) {
    promises.push(simulateTask(i, 100, 200).catch(err => ({ error: err.message })));
  }

  const results = await Promise.all(promises);
  const successCount = results.filter(r => !r.error).length;

  console.log(\`  并行完成 \${successCount} 个任务，耗时: \${Date.now() - start}ms\`);
  console.log('  注意：所有任务几乎同时启动');
}

// ============================================
// --- Demo 3：批量处理（分批并行）---
// ============================================
console.log('===== Demo 3：批量处理（Batch）=====');

async function runBatch(tasks, batchSize) {
  const results = [];
  const start = Date.now();

  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(fn => fn().catch(err => ({ error: err.message })))
    );
    results.push(...batchResults);
    console.log(\`  第 \${Math.floor(i / batchSize) + 1} 批完成\`);
  }

  const elapsed = Date.now() - start;
  const successCount = results.filter(r => !r.error).length;
  console.log(\`  批量处理完成，共 \${successCount} 个成功，耗时: \${elapsed}ms\`);
  console.log(\`  每批 \${batchSize} 个，共 \${Math.ceil(tasks.length / batchSize)} 批\`);
  return results;
}

// ============================================
// --- Demo 4：p-limit 风格的并发控制器 ---
// ============================================
console.log('\\n===== Demo 4：p-limit 并发控制器 =====');

function pLimit(concurrency) {
  if (concurrency < 1) throw new Error('concurrency must be >= 1');

  let running = 0;
  const queue = [];

  function next() {
    if (running >= concurrency || queue.length === 0) return;

    running++;
    const { fn, resolve, reject } = queue.shift();

    Promise.resolve()
      .then(fn)
      .then(
        val => {
          running--;
          resolve(val);
          next();
        },
        err => {
          running--;
          reject(err);
          next();
        }
      );
  }

  return function enqueue(fn) {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      process.nextTick(next);
    });
  };
}

// ============================================
// --- Demo 5：带进度监控的并发控制 ---
// ============================================
async function runWithLimit(taskCount, concurrency) {
  const limit = pLimit(concurrency);
  const start = Date.now();
  let completed = 0;
  let failed = 0;

  console.log(\`  并发数: \${concurrency}, 总任务: \${taskCount}\`);
  console.log('  运行中: 0/' + concurrency);

  const promises = [];
  for (let i = 1; i <= taskCount; i++) {
    const promise = limit(() =>
      simulateTask(i, 100, 300)
        .then(result => {
          completed++;
          if (completed % 5 === 0 || completed === taskCount) {
            const elapsed = Date.now() - start;
            const progress = ((completed / taskCount) * 100).toFixed(0);
            console.log(\`  进度: \${progress}% (\${completed}/\${taskCount}), 失败: \${failed}, 耗时: \${elapsed}ms\`);
          }
          return result;
        })
        .catch(err => {
          failed++;
          completed++;
          return { error: err.message };
        })
    );
    promises.push(promise);
  }

  const results = await Promise.all(promises);
  const elapsed = Date.now() - start;

  console.log(\`\\n  ✅ 全部完成！成功: \${taskCount - failed}, 失败: \${failed}\`);
  console.log(\`  总耗时: \${elapsed}ms, 并发数: \${concurrency}\`);

  return results;
}

// ============================================
// --- 运行所有对比演示 ---
// ============================================
(async () => {
  const taskCount = 15;

  await runSequential(taskCount);
  console.log('');

  setTimeout(async () => {
    await runParallel(taskCount);
    console.log('');

    setTimeout(async () => {
      const tasks = [];
      for (let i = 1; i <= taskCount; i++) {
        tasks.push(() => simulateTask(i, 100, 300));
      }
      await runBatch(tasks, 4);
      console.log('');

      setTimeout(() => demo5FullLimit(), 500);
    }, 500);
  }, 500);
})();

async function demo5FullLimit() {
  console.log('===== Demo 5：不同并发数的效率对比 =====');
  const taskCount = 20;

  async function measure(concurrency) {
    const limit = pLimit(concurrency);
    const start = Date.now();

    const promises = [];
    for (let i = 0; i < taskCount; i++) {
      promises.push(limit(() => simulateTask(i, 100, 200)).catch(() => {}));
    }
    await Promise.all(promises);
    return Date.now() - start;
  }

  const limits = [1, 2, 4, 8, 20];
  console.log(\`  \${taskCount} 个任务（每个 100-200ms）:\`);

  for (const concurrency of limits) {
    const time = await measure(concurrency);
    const bars = '█'.repeat(Math.floor(time / 50));
    console.log(\`  并发\${String(concurrency).padStart(2)}: \${String(time).padStart(5)}ms \${bars}\`);
  }

  console.log('\\n  🔑 观察：并发数越大越快，但边际效益递减');
  console.log('  实际项目中需要根据资源情况选择合适的并发数\\n');

  demo6Practical();
}

// ============================================
// --- Demo 6：实际应用场景 - 批量读取文件 ---
// ============================================
function demo6Practical() {
  console.log('===== Demo 6：实际场景 - 并发控制要点 =====');

  console.log('  并发控制最佳实践：');
  console.log('  1. 根据目标系统能力设置合理并发数');
  console.log('  2. 队列模式（p-limit）比批量模式效率更高');
  console.log('  3. 每个任务要有超时，避免卡住');
  console.log('  4. 错误隔离：单任务失败不影响整体');
  console.log('  5. 添加重试机制处理临时失败');
  console.log('  6. 监控进度方便排查问题');

  console.log('\\n📝 并发控制总结：');
  console.log('1. Promise.all 不限制并发，可能压垮系统');
  console.log('2. 完全串行效率太低');
  console.log('3. 批量处理：简单但有木桶效应');
  console.log('4. p-limit 队列模式：始终保持 N 个并发');
  console.log('5. Node.js 单线程是并发而非并行');
  console.log('6. 根据场景选择并发数：API 5-10, 文件 5-20');
}
`,
  },
  {
    id: "n4-async-error",
    group: "第三部分 异步编程",
    icon: "🛡️",
    title: "异步错误处理：uncaughtException 与 unhandledRejection",
    content: `# 异步错误处理：uncaughtException 与 unhandledRejection

异步错误处理是 Node.js 开发中最容易被忽视但又极其重要的话题。同步错误可以用 try/catch 捕获，但异步错误如果处理不当，会导致进程崩溃或默默失败。

## 一、为什么异步错误特殊

### 1.1 try/catch 无法捕获异步错误

\`\`\`javascript
try {
  setTimeout(() => {
    throw new Error('这个错误 try/catch 捕获不到！');
  }, 100);
} catch (err) {
  // 永远不会执行到这里！
  console.log('捕获到错误:', err.message);
}
\`\`\`

原因：当 setTimeout 回调执行时，try/catch 所在的调用栈已经退出了。回调在事件循环的某个阶段独立执行，不在 try 块的保护范围内。

### 1.2 未处理的 Promise rejection

如果 Promise 被 reject 了但没有 .catch() 或 try/catch，就会产生 unhandledRejection：

\`\`\`javascript
// 这个 Promise reject 了但没有 catch
Promise.reject(new Error('未处理的 Promise 错误'));
// 会触发 unhandledRejection 事件
\`\`\`

---

## 二、各种异步模式的错误处理

### 2.1 回调模式：error-first

回调模式中，错误通过第一个参数传递：

\`\`\`javascript
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('读取失败:', err);
    return; // 必须 return，否则会继续执行
  }
  // 处理 data
});
\`\`\`

### 2.2 Promise 模式：.catch()

\`\`\`javascript
readFilePromise('file.txt', 'utf8')
  .then(data => console.log(data))
  .catch(err => console.error('错误:', err));
\`\`\`

建议：每个 Promise 链的末尾都要有 .catch()。

### 2.3 async/await 模式：try/catch

\`\`\`javascript
async function readConfig() {
  try {
    const data = await readFilePromise('config.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('读取配置失败:', err.message);
    return defaultConfig;
  }
}
\`\`\`

---

## 三、process.on('unhandledRejection')

当 Promise 被 reject 但没有被任何 .catch() 或 try/catch 处理时，Node.js 会触发 'unhandledRejection' 事件：

\`\`\`javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise Rejection:');
  console.error('原因:', reason);
  console.error('Promise:', promise);

  // 建议：记录日志后优雅退出
  // 因为未处理的 rejection 意味着应用处于未知状态
});
\`\`\`

> ⚠️ **重要**：unhandledRejection 将来可能会导致进程崩溃（Node.js 未来版本计划让 unhandledRejection 直接退出进程）。现在就应该正确处理所有 Promise 错误！

---

## 四、process.on('uncaughtException')

当未捕获的 JavaScript 异常一直冒泡到事件循环顶部时，会触发 'uncaughtException' 事件：

\`\`\`javascript
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  console.error('堆栈:', err.stack);

  // ⚠️ 重要：uncaughtException 后进程处于未知状态！
  // 必须做的事情：
  // 1. 记录错误日志（同步写入）
  // 2. 清理资源
  // 3. 优雅退出进程
  process.exit(1);
});
\`\`\`

### 4.1 为什么 uncaughtException 后要退出进程

当异常未被捕获时，应用处于**未定义状态**：
- 某些变量可能处于不一致的状态
- 连接可能未正常关闭
- 内存可能已损坏
- 继续运行可能导致更严重的问题

最佳实践是：记录错误 → 清理资源 → 退出进程（让进程管理器如 PM2/systemd 重启）。

---

## 五、优雅关闭（Graceful Shutdown）

收到 uncaughtException 或 unhandledRejection 后，应该优雅关闭：

\`\`\`javascript
let isShuttingDown = false;

function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(\`收到 \${signal}，开始优雅关闭...\`);

  // 停止接受新请求
  server.close(() => {
    // 关闭数据库连接
    db.end(() => {
      console.log('已优雅关闭');
      process.exit(0);
    });
  });

  // 强制退出超时
  setTimeout(() => {
    console.error('强制退出');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
\`\`\`

---

## 六、EventEmitter 错误处理

EventEmitter 如果触发 'error' 事件但没有监听器，会直接抛出异常导致进程退出！

\`\`\`javascript
const { EventEmitter } = require('events');
const emitter = new EventEmitter();

// ⚠️ 没有监听 'error' 事件！
emitter.emit('error', new Error('会导致崩溃！'));
// 这会直接抛出，触发 uncaughtException

// ✅ 正确：总是监听 error 事件
emitter.on('error', (err) => {
  console.error('EventEmitter 错误:', err.message);
});
\`\`\`

> 💡 **记住**：使用 EventEmitter 时，第一件事就是添加 error 事件监听器！

---

## 七、已弃用的方案

### 7.1 Domain 模块（已弃用）

domain 模块曾用于异步错误处理，但已被标记为弃用，不要使用。它有内存泄漏和资源泄漏问题。

### 7.2 'multipleResolves' 事件

用于检测 Promise 被多次 resolve/reject，已弃用。

---

## 八、异步错误处理最佳实践

1. **所有 Promise 链末尾加 .catch()**：不要留下未处理的 Promise
2. **async 函数中的 await 包裹 try/catch**：或者让错误向上抛给调用者处理
3. **监听 unhandledRejection**：记录日志并考虑优雅退出
4. **监听 uncaughtException**：记录日志后必须退出进程
5. **EventEmitter 必须监听 error 事件**：否则会崩溃
6. **不要忽略错误**：空的 catch 块是代码坏味道
7. **错误要有上下文**：记录哪个操作失败、参数是什么
8. **使用错误日志库**：如 winston、pino，记录完整堆栈
9. **进程管理器**：生产环境用 PM2 或 systemd 自动重启崩溃的进程
10. **不要在 uncaughtException 后继续运行**：进程状态不可靠
`,
    code: `// ============================================
// 异步错误处理完整示例
// 运行方式：node n4-async-error-demo.js
// ============================================

const fs = require('fs');
const util = require('util');
const { EventEmitter } = require('events');

// ============================================
// 全局错误处理器设置
// ============================================

// 注意：这些处理器在实际项目中应该在入口文件最开始设置
// 这里为了演示，我们添加但不导致进程退出，方便展示其他 demo

process.on('unhandledRejection', (reason, promise) => {
  console.log('\\n  🛑 [unhandledRejection] 未处理的 Promise 错误:');
  console.log('     原因:', reason.message || reason);
  console.log('     建议：每个 Promise 链末尾加 .catch()');
});

process.on('uncaughtException', (err) => {
  console.log('\\n  💥 [uncaughtException] 未捕获的异常:');
  console.log('     错误:', err.message);
  console.log('     建议：生产环境记录日志后优雅退出');
  // process.exit(1); // 实际项目中要退出！
});

// ============================================
// --- Demo 1：try/catch 无法捕获异步错误 ---
// ============================================
console.log('===== Demo 1：异步错误无法被 try/catch 捕获 =====');

try {
  setTimeout(() => {
    // 这个错误在 setTimeout 回调中
    // try/catch 已经退出了，捕获不到！
    // throw new Error('这是异步错误，try/catch 抓不到');
    console.log('  （注释掉了 throw，避免触发 uncaughtException 影响后续演示）');
    console.log('  setTimeout 回调执行了');
    demo2CallbackError();
  }, 100);
  console.log('  try 块结束，但 setTimeout 还没执行');
} catch (err) {
  console.log('  这里不会执行:', err.message);
}

// ============================================
// --- Demo 2：回调模式的错误处理 ---
// ============================================
function demo2CallbackError() {
  console.log('\\n===== Demo 2：error-first 回调错误处理 =====');

  // 读取不存在的文件
  fs.readFile('/no/such/file.txt', 'utf8', (err, data) => {
    if (err) {
      console.log('  ✅ 错误优先回调捕获到错误:');
      console.log('     错误码:', err.code);
      console.log('     错误信息:', err.message);
      // return; // 记得 return，不然后面的代码会继续执行
    } else {
      console.log('  文件内容:', data);
    }
    demo3PromiseError();
  });
}

// ============================================
// --- Demo 3：Promise 错误处理 ---
// ============================================
function demo3PromiseError() {
  console.log('\\n===== Demo 3：Promise 错误处理 =====');

  const readFile = util.promisify(fs.readFile);

  // 正确：有 catch 的 Promise
  readFile('/no/such/file.txt', 'utf8')
    .then(data => {
      console.log('  不会执行到这里');
    })
    .catch(err => {
      console.log('  ✅ .catch() 捕获到 Promise 错误:', err.code);
    })
    .then(() => {
      // catch 后可以继续链式调用
      demo4AsyncAwaitError();
    });

  // 错误：没有 catch 的 Promise
  // 会触发 unhandledRejection
  // Promise.reject(new Error('这个错误没有被处理！'));
  console.log('  （注释掉了未处理的 rejection，避免太多警告）');
}

// ============================================
// --- Demo 4：async/await 错误处理 ---
// ============================================
async function demo4AsyncAwaitError() {
  console.log('\\n===== Demo 4：async/await try/catch 错误处理 =====');

  const readFile = util.promisify(fs.readFile);

  // 正确：try/catch 包裹 await
  try {
    const data = await readFile('/no/such/file.txt', 'utf8');
    console.log('  不会执行');
  } catch (err) {
    console.log('  ✅ try/catch 捕获到 await 错误:', err.code);
  }

  // 多个 await 统一处理
  try {
    const f1 = await readFile('/no/file1.txt', 'utf8');
    const f2 = await readFile('/no/file2.txt', 'utf8');
  } catch (err) {
    console.log('  ✅ 多个 await 的错误统一捕获:', err.code);
  }

  demo5EventEmitterError();
}

// ============================================
// --- Demo 5：EventEmitter error 事件 ---
// ============================================
function demo5EventEmitterError() {
  console.log('\\n===== Demo 5：EventEmitter error 事件 =====');

  const emitter = new EventEmitter();

  // ✅ 正确：先添加 error 监听器
  emitter.on('error', (err) => {
    console.log('  ✅ EventEmitter error 监听器捕获:', err.message);
  });

  emitter.emit('data', '一些数据');
  emitter.emit('error', new Error('EventEmitter 发生错误'));

  // ⚠️ 对比：如果没有 error 监听器会直接崩溃
  const dangerous = new EventEmitter();
  console.log('  （如果没有 error 监听器，emit error 会直接抛出异常）');
  // dangerous.emit('error', new Error('这会崩溃！'));

  demo6ErrorWrapping();
}

// ============================================
// --- Demo 6：错误包装与传递 ---
// ============================================
function demo6ErrorWrapping() {
  console.log('\\n===== Demo 6：错误包装（添加上下文）=====');

  const readFile = util.promisify(fs.readFile);

  async function loadConfig(configPath) {
    try {
      const data = await readFile(configPath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      // 包装错误，添加上下文信息
      const wrappedError = new Error(\`加载配置失败 [\${configPath}]: \${err.message}\`);
      wrappedError.cause = err;
      wrappedError.code = 'CONFIG_LOAD_FAILED';
      throw wrappedError;
    }
  }

  loadConfig('/not/exists/config.json')
    .then(config => console.log('  配置:', config))
    .catch(err => {
      console.log('  ✅ 包装后的错误信息更有意义:');
      console.log('    ', err.message);
      console.log('     错误码:', err.code);
    })
    .then(() => demo7BestPractices());
}

// ============================================
// --- Demo 7：最佳实践演示 ---
// ============================================
function demo7BestPractices() {
  console.log('\\n===== Demo 7：异步错误处理最佳实践 =====');

  console.log('  1. 回调模式：检查 err 参数后 return');
  console.log('  2. Promise 链：末尾必须有 .catch()');
  console.log('  3. async/await：用 try/catch 包裹 await');
  console.log('  4. EventEmitter：必须监听 error 事件');
  console.log('  5. 全局监听 unhandledRejection');
  console.log('  6. 全局监听 uncaughtException（记录后退出）');
  console.log('  7. 不要吞掉错误（空 catch 块）');
  console.log('  8. 错误添加上下文信息（哪个操作失败）');
  console.log('  9. 优雅关闭：关闭连接、保存状态后退出');
  console.log('  10. 生产环境用 PM2/systemd 重启进程');

  setTimeout(() => {
    console.log('\\n📝 异步错误处理总结：');
    console.log('1. try/catch 无法捕获异步错误');
    console.log('2. 回调用 error-first，Promise 用 .catch，async/await 用 try/catch');
    console.log('3. 必须监听 unhandledRejection 和 uncaughtException');
    console.log('4. uncaughtException 后必须退出进程');
    console.log('5. EventEmitter 必须监听 error 事件');
    console.log('6. 不要忽略错误，记录日志并添加上下文');
    console.log('7. 实现优雅关闭机制');
    console.log('8. 不要使用已弃用的 domain 模块');
  }, 500);
}
`,
  },
];


