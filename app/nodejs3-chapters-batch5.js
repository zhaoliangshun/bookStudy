export const chapters = [
  {
    id: "n3-stack-queue",
    icon: "📚",
    group: "第五部分 数据结构与算法实战",
    title: "栈（Stack）与队列（Queue）实现及应用",
    content: `## 栈与队列：最基础也是最重要的数据结构

栈和队列是计算机科学中最基础、使用最广泛的两种线性数据结构。它们是构建更复杂数据结构和算法的基石——函数调用、表达式求值、浏览器历史、消息队列、BFS搜索……这些我们每天都在使用的功能，底层都离不开栈和队列。

理解栈和队列不仅是学习更复杂数据结构的前提，更能帮助你理解很多编程概念背后的本质。比如：JavaScript的事件循环为什么用队列？递归调用为什么会栈溢出？括号匹配算法为什么天然适合用栈？这些问题的答案都藏在栈和队列的设计哲学中。

## 栈（Stack）：后进先出（LIFO）

栈是一种**后进先出（Last In First Out, LIFO）**的数据结构。就像一摞盘子：你只能从最上面放盘子（push），也只能从最上面取盘子（pop），最后放上去的盘子最先被取走。

栈支持的核心操作只有几个：
- **push**：将元素压入栈顶，时间复杂度 O(1)
- **pop**：弹出栈顶元素，时间复杂度 O(1)
- **peek/top**：查看栈顶元素但不弹出，时间复杂度 O(1)
- **isEmpty**：判断栈是否为空
- **size**：返回栈中元素个数

### 栈的经典应用场景

**1. 函数调用栈（Call Stack）**

这是最著名的应用。每次调用一个函数时，JavaScript引擎会创建一个执行上下文（Execution Context）压入调用栈；函数执行完毕后，对应的执行上下文从栈中弹出。这就是为什么递归深度太大会导致"栈溢出"（Stack Overflow）——因为栈的大小是有限的。

\`\`\`javascript
function a() { b(); }
function b() { c(); }
function c() { /* 此时栈：[global, a, b, c] */ }
a();
\`\`\`

**2. 括号匹配验证**

编译器和代码编辑器都需要验证括号是否正确匹配：每一个左括号 \`(\`、\`[\`、\`{\` 都要有对应的右括号，且嵌套顺序正确。用栈来实现非常自然：遇到左括号压栈，遇到右括号时检查栈顶是否是匹配的左括号。

**3. 表达式求值**

编译器计算算术表达式时，通常先将中缀表达式（如 \`3 + 4 * 2\`）转换为后缀表达式（逆波兰表达式 \`3 4 2 * +\`），然后用栈来求值。这个过程中运算符的优先级处理也依赖栈。

**4. 浏览器前进后退**

浏览器的历史记录本质上用了两个栈：访问新页面压入"后退栈"；点击后退时，从后退栈弹出压入"前进栈"；点击前进时则相反。

**5. 进制转换**

将十进制数转换为其他进制（如二进制）时，每次取余数，最后需要逆序输出——用栈存储余数正好能自然实现逆序。

## 队列（Queue）：先进先出（FIFO）

队列是一种**先进先出（First In First Out, FIFO）**的数据结构。就像排队买票：先来的人先买，后来的人排在队尾。

队列支持的核心操作：
- **enqueue**：将元素加入队尾，时间复杂度 O(1)
- **dequeue**：从队首移除元素，时间复杂度 O(1)
- **peek/front**：查看队首元素，时间复杂度 O(1)
- **isEmpty**：判断队列是否为空
- **size**：返回队列中元素个数

### 队列的经典应用场景

**1. 消息队列（Message Queue）**

RabbitMQ、Kafka、Redis List等消息中间件本质上就是队列——生产者将消息放入队尾，消费者从队首取出消息处理。这保证了消息按照发送顺序被消费。

**2. 任务队列/事件循环**

Node.js和浏览器的事件循环中，宏任务队列（macro task queue）和微任务队列（micro task queue）是核心机制。setTimeout回调、I/O回调、UI渲染等任务都在队列中排队等待执行。

**3. 广度优先搜索（BFS）**

图和树的层序遍历（广度优先搜索）天然使用队列：从起点开始，将相邻节点依次入队，每次从队首取出节点处理，直到队列为空。

**4. 缓冲池/连接池**

数据库连接池、线程池等资源池通常用队列维护空闲资源，请求到来时从队首取资源，用完归还到队尾。

## 数组实现 vs 对象实现

### 用数组实现的问题

最直观的实现方式是用JavaScript数组：push/pop操作在数组尾部，时间复杂度是O(1)；但如果用数组实现队列，shift操作需要将所有元素前移一位，时间复杂度是**O(n)**！当数据量很大时，这会成为性能瓶颈。

### 用对象/链表实现O(1)操作

为了实现真正O(1)的入队和出队，我们需要用对象（或链表）来存储数据，并维护两个指针：**head**（队首索引）和**tail**（队尾索引）。
- enqueue时：在tail位置写入元素，tail++
- dequeue时：取出head位置的元素，head++

这样入队和出队都只需要操作指针，不需要移动元素，时间复杂度都是O(1)。这也是V8引擎内部实现某些数据结构的思路。

## 双端队列（Deque）

双端队列（Double-Ended Queue）是栈和队列的推广：允许在两端都进行插入和删除操作。它结合了栈和队列的能力，支持：
- addFirst / removeFirst：在队首操作
- addLast / removeLast：在队尾操作

双端队列在实现滑动窗口最大值、回文检测等算法时非常有用。

## 时间复杂度总结

| 操作 | 栈（数组） | 栈（对象） | 队列（数组） | 队列（对象+指针） |
|------|-----------|-----------|-------------|-----------------|
| push/add | O(1) | O(1) | O(1) | O(1) |
| pop/remove | O(1) | O(1) | **O(n)** | O(1) |
| peek | O(1) | O(1) | O(1) | O(1) |
| 空间 | O(n) | O(n) | O(n) | O(n) |

选择合适的实现方式在性能敏感场景下至关重要。本章的代码部分我们将分别实现数组版和对象版的栈和队列，并用它们解决括号匹配和事件循环调度问题。
`,
    code: `// ============================================================
// 栈与队列实现：数组版 + 对象版 + 实际应用
// ============================================================

// ========== 1. 栈的数组实现 ==========
class ArrayStack {
  constructor() {
    this.items = [];
  }

  push(element) {
    this.items.push(element);
  }

  pop() {
    if (this.isEmpty()) return undefined;
    return this.items.pop();
  }

  peek() {
    if (this.isEmpty()) return undefined;
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  clear() {
    this.items = [];
  }

  toString() {
    return this.items.toString();
  }
}

// ========== 2. 栈的对象实现（O(1) 所有操作） ==========
class ObjectStack {
  constructor() {
    this.items = {};
    this.count = 0;
  }

  push(element) {
    this.items[this.count] = element;
    this.count++;
  }

  pop() {
    if (this.isEmpty()) return undefined;
    this.count--;
    const result = this.items[this.count];
    delete this.items[this.count];
    return result;
  }

  peek() {
    if (this.isEmpty()) return undefined;
    return this.items[this.count - 1];
  }

  isEmpty() {
    return this.count === 0;
  }

  size() {
    return this.count;
  }

  clear() {
    this.items = {};
    this.count = 0;
  }

  toString() {
    if (this.isEmpty()) return '';
    let objString = "" + this.items[0];
    for (let i = 1; i < this.count; i++) {
      objString = objString + "," + this.items[i];
    }
    return objString;
  }
}

// ========== 3. 队列的数组实现（注意：dequeue 是 O(n)） ==========
class ArrayQueue {
  constructor() {
    this.items = [];
  }

  enqueue(element) {
    this.items.push(element);
  }

  dequeue() {
    if (this.isEmpty()) return undefined;
    return this.items.shift();
  }

  peek() {
    if (this.isEmpty()) return undefined;
    return this.items[0];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  clear() {
    this.items = [];
  }

  toString() {
    return this.items.toString();
  }
}

// ========== 4. 队列的对象实现（双指针，所有操作 O(1)） ==========
class ObjectQueue {
  constructor() {
    this.items = {};
    this.lowestCount = 0;
    this.count = 0;
  }

  enqueue(element) {
    this.items[this.count] = element;
    this.count++;
  }

  dequeue() {
    if (this.isEmpty()) return undefined;
    const result = this.items[this.lowestCount];
    delete this.items[this.lowestCount];
    this.lowestCount++;
    if (this.isEmpty()) {
      this.lowestCount = 0;
      this.count = 0;
    }
    return result;
  }

  peek() {
    if (this.isEmpty()) return undefined;
    return this.items[this.lowestCount];
  }

  isEmpty() {
    return this.count - this.lowestCount === 0;
  }

  size() {
    return this.count - this.lowestCount;
  }

  clear() {
    this.items = {};
    this.lowestCount = 0;
    this.count = 0;
  }

  toString() {
    if (this.isEmpty()) return '';
    let objString = "" + this.items[this.lowestCount];
    for (let i = this.lowestCount + 1; i < this.count; i++) {
      objString = objString + "," + this.items[i];
    }
    return objString;
  }
}

// ========== 5. 双端队列 Deque ==========
class Deque {
  constructor() {
    this.items = {};
    this.lowestCount = 0;
    this.count = 0;
  }

  addFront(element) {
    if (this.isEmpty()) {
      this.addBack(element);
    } else if (this.lowestCount > 0) {
      this.lowestCount--;
      this.items[this.lowestCount] = element;
    } else {
      for (let i = this.count; i > this.lowestCount; i--) {
        this.items[i] = this.items[i - 1];
      }
      this.count++;
      this.items[0] = element;
    }
  }

  addBack(element) {
    this.items[this.count] = element;
    this.count++;
  }

  removeFront() {
    if (this.isEmpty()) return undefined;
    const result = this.items[this.lowestCount];
    delete this.items[this.lowestCount];
    this.lowestCount++;
    if (this.isEmpty()) {
      this.lowestCount = 0;
      this.count = 0;
    }
    return result;
  }

  removeBack() {
    if (this.isEmpty()) return undefined;
    this.count--;
    const result = this.items[this.count];
    delete this.items[this.count];
    return result;
  }

  peekFront() {
    if (this.isEmpty()) return undefined;
    return this.items[this.lowestCount];
  }

  peekBack() {
    if (this.isEmpty()) return undefined;
    return this.items[this.count - 1];
  }

  isEmpty() {
    return this.count - this.lowestCount === 0;
  }

  size() {
    return this.count - this.lowestCount;
  }

  clear() {
    this.items = {};
    this.lowestCount = 0;
    this.count = 0;
  }

  toString() {
    if (this.isEmpty()) return '';
    let objString = "" + this.items[this.lowestCount];
    for (let i = this.lowestCount + 1; i < this.count; i++) {
      objString = objString + "," + this.items[i];
    }
    return objString;
  }
}

// ========== 6. 应用1：括号匹配验证 ==========
function bracketsMatcher(str) {
  const stack = new ArrayStack();
  const openBrackets = '([{';
  const closeBrackets = ')]}';
  const matches = {
    ')': '(',
    ']': '[',
    '}': '{'
  };

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (openBrackets.includes(char)) {
      stack.push(char);
    } else if (closeBrackets.includes(char)) {
      if (stack.isEmpty()) return false;
      const top = stack.pop();
      if (matches[char] !== top) return false;
    }
  }
  return stack.isEmpty();
}

// ========== 7. 应用2：十进制转二进制 ==========
function decimalToBinary(decimalNumber) {
  const stack = new ArrayStack();
  let number = decimalNumber;
  let binaryString = '';

  while (number > 0) {
    const remainder = Math.floor(number % 2);
    stack.push(remainder);
    number = Math.floor(number / 2);
  }

  while (!stack.isEmpty()) {
    binaryString += stack.pop();
  }

  return binaryString || '0';
}

// ========== 8. 应用3：模拟事件循环任务调度 ==========
class EventLoopSimulator {
  constructor() {
    this.macroQueue = new ObjectQueue();
    this.microQueue = new ObjectQueue();
    this.currentTask = null;
    this.logs = [];
  }

  setTimeout(fn, delay = 0) {
    this.macroQueue.enqueue({ type: 'macro', fn, delay, id: Date.now() + Math.random() });
  }

  setImmediate(fn) {
    this.microQueue.enqueue({ type: 'micro', fn, id: Date.now() + Math.random() });
  }

  async run() {
    this.logs.push('=== 事件循环开始 ===');

    while (!this.macroQueue.isEmpty() || !this.microQueue.isEmpty()) {
      if (!this.microQueue.isEmpty()) {
        const task = this.microQueue.dequeue();
        this.logs.push('执行微任务');
        task.fn();
      } else if (!this.macroQueue.isEmpty()) {
        const task = this.macroQueue.dequeue();
        this.logs.push('执行宏任务');
        task.fn();
      }
    }

    this.logs.push('=== 事件循环结束 ===');
    return this.logs;
  }
}

// ========== 演示部分 ==========
console.log("========================================");
console.log("  栈与队列数据结构演示");
console.log("========================================");

console.log("\\n--- 1. 栈的基本操作（对象实现）---");
const stack = new ObjectStack();
console.log("栈是否为空:", stack.isEmpty());
stack.push(1);
stack.push(2);
stack.push(3);
console.log("压入 1, 2, 3 后，栈内容:", stack.toString());
console.log("栈顶元素 peek():", stack.peek());
console.log("pop():", stack.pop(), "，剩余:", stack.toString());
console.log("size:", stack.size());

console.log("\\n--- 2. 队列的基本操作（对象实现，O(1)）---");
const queue = new ObjectQueue();
queue.enqueue('A');
queue.enqueue('B');
queue.enqueue('C');
console.log("入队 A, B, C 后，队列:", queue.toString());
console.log("队首 peek():", queue.peek());
console.log("dequeue():", queue.dequeue(), "，剩余:", queue.toString());
console.log("size:", queue.size());

console.log("\\n--- 3. 双端队列 Deque ---");
const deque = new Deque();
deque.addBack('B');
deque.addBack('C');
deque.addFront('A');
console.log("addFront(A) + addBack(B,C):", deque.toString());
deque.removeBack();
console.log("removeBack() 后:", deque.toString());
deque.addBack('D');
console.log("addBack(D) 后:", deque.toString());

console.log("\\n--- 4. 括号匹配验证 ---");
const testCases = [
  '()',
  '()[]{}',
  '(]',
  '([)]',
  '{[]}',
  'console.log(a[0]) + fn(b)',
  '(()'
];
for (const tc of testCases) {
  const result = bracketsMatcher(tc);
  console.log("  '" + tc + "' => " + (result ? '✅ 匹配' : '❌ 不匹配'));
}

console.log("\\n--- 5. 十进制转二进制 ---");
const nums = [0, 1, 2, 10, 100, 255];
for (const n of nums) {
  console.log("  " + n + " => " + decimalToBinary(n));
}

console.log("\\n--- 6. 数组实现 vs 对象实现性能对比（10万次操作）---");
const SIZE = 100000;

const arrQueue = new ArrayQueue();
let start = Date.now();
for (let i = 0; i < SIZE; i++) arrQueue.enqueue(i);
while (!arrQueue.isEmpty()) arrQueue.dequeue();
console.log("  数组队列（shift O(n)）: " + (Date.now() - start) + "ms");

const objQueue = new ObjectQueue();
start = Date.now();
for (let i = 0; i < SIZE; i++) objQueue.enqueue(i);
while (!objQueue.isEmpty()) objQueue.dequeue();
console.log("  对象队列（双指针 O(1)）: " + (Date.now() - start) + "ms");

console.log("\\n--- 7. 模拟事件循环任务调度 ---");
const loop = new EventLoopSimulator();
let output = [];
loop.setTimeout(() => output.push('宏任务1'));
loop.setImmediate(() => output.push('微任务1'));
loop.setTimeout(() => {
  output.push('宏任务2');
  loop.setImmediate(() => output.push('宏任务2中的微任务'));
});
loop.setImmediate(() => output.push('微任务2'));

loop.run().then((logs) => {
  console.log("  执行顺序日志:");
  logs.forEach(l => console.log("    " + l));
  console.log("  任务输出顺序:", output.join(' -> '));
  console.log("  （微任务总是在当前宏任务结束后立即执行）");
  console.log("\\n🎉 栈与队列演示完成！");
});
`
  },
  {
    id: "n3-linked-list",
    icon: "🔗",
    group: "第五部分 数据结构与算法实战",
    title: "链表（Linked List）实现",
    content: `## 链表：内存不连续的线性结构

数组和链表是两种最基础的线性数据结构，它们在内存布局、访问特性和性能表现上形成了鲜明的对比。理解这种对比，是选择合适数据结构的前提。

数组的特点是**内存连续、支持随机访问**：因为元素在内存中是紧挨着存储的，知道数组首地址和元素大小，就能通过下标直接计算出任意元素的地址，所以访问是O(1)。但也正因为内存连续，插入和删除操作需要移动后续所有元素来保持连续性，时间复杂度是O(n)。

链表则正好相反：**内存不连续，不需要预先分配连续空间**。每个节点（Node）包含两部分——存储的数据（value）和指向下一个节点的引用（next指针）。节点之间通过指针串联起来，不需要在内存中相邻。这使得插入和删除操作只需要修改指针，时间复杂度是O(1)（前提是你已经拿到了要操作位置的节点）。但代价是：无法随机访问，要找某个位置的元素必须从头节点开始顺着指针逐个遍历，时间复杂度是O(n)。

| 特性 | 数组 | 链表 |
|------|------|------|
| 内存布局 | 连续 | 不连续 |
| 随机访问 | O(1) | O(n) |
| 头部插入/删除 | O(n)（需移动元素） | O(1) |
| 尾部插入/删除 | O(1)（已知尾指针） | O(n)~O(1) |
| 中间插入/删除（已知节点） | O(n) | O(1) |
| 内存分配 | 静态/连续 | 动态/分散 |
| 缓存友好性 | 好（连续内存，缓存命中率高） | 差 |

## 单链表（Singly Linked List）

单链表是最简单的链表形式：每个节点只有一个next指针，指向后继节点。链表由一个head指针标识头节点，尾节点的next指向null（表示链表结束）。

\`\`\`
head → [value|next] → [value|next] → [value|next] → null
\`\`\`

单链表的基本操作包括：
- **append**：在链表尾部添加节点。如果维护了tail指针可以做到O(1)，否则需要遍历到尾部O(n)。
- **prepend**：在链表头部添加节点，O(1)——新节点指向原头节点，head更新为新节点。
- **insert**：在任意位置插入节点。找到目标位置的前一个节点，修改指针即可O(1)，但查找位置需要O(n)。
- **remove**：删除指定节点。找到前驱节点后修改指针O(1)，查找前驱需要O(n)。
- **find**：按值查找节点，O(n)遍历。
- **reverse**：反转链表，经典面试题，需要三个指针（prev、curr、next）协同工作。

### Dummy头节点（哨兵节点）技巧

在处理链表时，头部操作和中间操作的逻辑经常不一样——因为头节点没有前驱节点。引入一个**dummy节点**（也叫哨兵节点sentinel）可以消除这种差异：dummy永远位于头节点之前，不存储有效数据。所有操作都从dummy开始，最后返回dummy.next作为真正的头节点。这样插入、删除时不需要特殊处理头节点，代码更简洁，也不容易出现空指针错误。

## 双向链表（Doubly Linked List）

单链表的一个局限是：给定一个节点，你只能向后遍历，无法快速知道它的前驱节点。双向链表在每个节点中增加了一个**prev**指针指向前驱节点，这样就可以双向遍历了。

\`\`\`
null ←→ [prev|value|next] ←→ [prev|value|next] ←→ [prev|value|next] ←→ null
 head                                                          tail
\`\`\`

双向链表的优势：
- 可以从尾部向前遍历，某些场景更高效
- 删除已知节点不需要再从头找前驱——通过prev指针直接拿到，O(1)
- 实现双端队列Deque更方便

缺点是每个节点多存一个指针，内存占用稍大。

## 循环链表（Circular Linked List）

循环链表的特点是：尾节点的next不是null，而是指向头节点，形成一个环。它可以是单链也可以是双链。循环链表在处理环形问题时很有用，比如：
- 约瑟夫环问题
- 轮询调度算法（Round Robin）
- 操作系统的进程调度

## 快慢指针技术（Floyd判圈算法）

快慢指针（也叫龟兔赛跑算法）是链表中非常重要的技巧：使用两个指针slow和fast，slow每次走一步，fast每次走两步。

**1. 判断链表是否有环**：如果有环，fast和slow一定会在环内某个点相遇；如果fast走到null说明无环。这就是著名的Floyd判圈算法（Floyd's Cycle Detection），时间复杂度O(n)，空间复杂度O(1)，比用Set记录访问过的节点更节省空间。

**2. 找链表的中点**：fast走两步，slow走一步，当fast到达尾部时slow正好在中间。这在归并排序链表时很有用。

**3. 找链表倒数第k个节点**：fast先走k步，然后slow和fast一起走，fast到达尾部时slow就在倒数第k个位置。

**4. 找环的入口**：相遇后，将一个指针移回头节点，两个指针同速前进，再次相遇的位置就是环的入口（有数学证明）。

这些技巧在面试题中出现频率极高，核心思想是利用两个移动速度不同的指针在链表上制造"距离差"来获取信息。
`,
    code: `// ============================================================
// 链表实现：单链表 + 双向链表 + 快慢指针算法
// ============================================================

// ========== 单链表节点 ==========
class ListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

// ========== 双向链表节点 ==========
class DoublyListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
    this.prev = null;
  }
}

// ========== 单链表实现 ==========
class SinglyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  prepend(value) {
    const newNode = new ListNode(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head = newNode;
    }
    this.length++;
    return this;
  }

  append(value) {
    const newNode = new ListNode(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.length++;
    return this;
  }

  insert(index, value) {
    if (index < 0 || index > this.length) return false;
    if (index === 0) {
      this.prepend(value);
      return true;
    }
    if (index === this.length) {
      this.append(value);
      return true;
    }
    const newNode = new ListNode(value);
    const prev = this._getNodeAt(index - 1);
    newNode.next = prev.next;
    prev.next = newNode;
    this.length++;
    return true;
  }

  remove(index) {
    if (index < 0 || index >= this.length) return undefined;
    if (index === 0) {
      const removed = this.head;
      this.head = this.head.next;
      this.length--;
      if (this.length === 0) this.tail = null;
      return removed.value;
    }
    const prev = this._getNodeAt(index - 1);
    const removed = prev.next;
    prev.next = removed.next;
    if (index === this.length - 1) {
      this.tail = prev;
    }
    this.length--;
    return removed.value;
  }

  removeByValue(value) {
    if (!this.head) return false;
    if (this.head.value === value) {
      this.head = this.head.next;
      this.length--;
      if (this.length === 0) this.tail = null;
      return true;
    }
    let current = this.head;
    while (current.next && current.next.value !== value) {
      current = current.next;
    }
    if (current.next) {
      if (current.next === this.tail) {
        this.tail = current;
      }
      current.next = current.next.next;
      this.length--;
      return true;
    }
    return false;
  }

  find(value) {
    let current = this.head;
    while (current) {
      if (current.value === value) return current;
      current = current.next;
    }
    return null;
  }

  _getNodeAt(index) {
    let current = this.head;
    for (let i = 0; i < index && current; i++) {
      current = current.next;
    }
    return current;
  }

  get(index) {
    if (index < 0 || index >= this.length) return undefined;
    return this._getNodeAt(index).value;
  }

  indexOf(value) {
    let current = this.head;
    let index = 0;
    while (current) {
      if (current.value === value) return index;
      current = current.next;
      index++;
    }
    return -1;
  }

  reverse() {
    let prev = null;
    let current = this.head;
    this.tail = this.head;
    while (current) {
      const next = current.next;
      current.next = prev;
      prev = current;
      current = next;
    }
    this.head = prev;
    return this;
  }

  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  toString() {
    return this.toArray().join(' -> ');
  }

  isEmpty() {
    return this.length === 0;
  }

  size() {
    return this.length;
  }
}

// ========== 双向链表实现 ==========
class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  prepend(value) {
    const newNode = new DoublyListNode(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    this.length++;
    return this;
  }

  append(value) {
    const newNode = new DoublyListNode(value);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.prev = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.length++;
    return this;
  }

  insert(index, value) {
    if (index < 0 || index > this.length) return false;
    if (index === 0) return !!this.prepend(value);
    if (index === this.length) return !!this.append(value);
    const newNode = new DoublyListNode(value);
    const current = this._getNodeAt(index);
    newNode.prev = current.prev;
    newNode.next = current;
    current.prev.next = newNode;
    current.prev = newNode;
    this.length++;
    return true;
  }

  remove(index) {
    if (index < 0 || index >= this.length) return undefined;
    let removed;
    if (index === 0) {
      removed = this.head;
      this.head = this.head.next;
      if (this.head) {
        this.head.prev = null;
      } else {
        this.tail = null;
      }
    } else if (index === this.length - 1) {
      removed = this.tail;
      this.tail = this.tail.prev;
      this.tail.next = null;
    } else {
      removed = this._getNodeAt(index);
      removed.prev.next = removed.next;
      removed.next.prev = removed.prev;
    }
    this.length--;
    return removed.value;
  }

  _getNodeAt(index) {
    let current;
    if (index <= this.length / 2) {
      current = this.head;
      for (let i = 0; i < index; i++) current = current.next;
    } else {
      current = this.tail;
      for (let i = this.length - 1; i > index; i--) current = current.prev;
    }
    return current;
  }

  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  toString() {
    return this.toArray().join(' <-> ');
  }

  reverseToString() {
    const result = [];
    let current = this.tail;
    while (current) {
      result.push(current.value);
      current = current.prev;
    }
    return result.join(' <-> ');
  }

  size() {
    return this.length;
  }
}

// ========== 快慢指针算法 ==========
const LinkedListAlgo = {
  hasCycle(head) {
    if (!head || !head.next) return false;
    let slow = head;
    let fast = head;
    while (fast && fast.next) {
      slow = slow.next;
      fast = fast.next.next;
      if (slow === fast) return true;
    }
    return false;
  },

  detectCycleStart(head) {
    if (!head || !head.next) return null;
    let slow = head;
    let fast = head;
    let hasCycle = false;
    while (fast && fast.next) {
      slow = slow.next;
      fast = fast.next.next;
      if (slow === fast) {
        hasCycle = true;
        break;
      }
    }
    if (!hasCycle) return null;
    slow = head;
    while (slow !== fast) {
      slow = slow.next;
      fast = fast.next;
    }
    return slow;
  },

  findMiddle(head) {
    if (!head) return null;
    let slow = head;
    let fast = head;
    while (fast && fast.next) {
      slow = slow.next;
      fast = fast.next.next;
    }
    return slow;
  },

  findKthFromEnd(head, k) {
    if (!head || k <= 0) return null;
    let fast = head;
    let slow = head;
    for (let i = 0; i < k; i++) {
      if (!fast) return null;
      fast = fast.next;
    }
    while (fast) {
      slow = slow.next;
      fast = fast.next;
    }
    return slow;
  }
};

// ========== 演示部分 ==========
console.log("========================================");
console.log("  链表数据结构演示");
console.log("========================================");

console.log("\\n--- 1. 单链表基本操作 ---");
const list = new SinglyLinkedList();
list.append(10);
list.append(20);
list.append(30);
console.log("append 10, 20, 30:", list.toString());
list.prepend(5);
console.log("prepend 5:", list.toString());
list.insert(2, 15);
console.log("insert(2, 15):", list.toString());
console.log("find(20):", list.find(20) ? '找到' : '未找到');
console.log("get(3):", list.get(3));
console.log("indexOf(30):", list.indexOf(30));
list.remove(1);
console.log("remove(1):", list.toString());
list.removeByValue(20);
console.log("removeByValue(20):", list.toString());
console.log("size:", list.size());

console.log("\\n--- 2. 链表反转 ---");
const list2 = new SinglyLinkedList();
[1, 2, 3, 4, 5].forEach(n => list2.append(n));
console.log("反转前:", list2.toString());
list2.reverse();
console.log("反转后:", list2.toString());

console.log("\\n--- 3. 双向链表 ---");
const dlist = new DoublyLinkedList();
dlist.append('A').append('B').append('C').prepend('Z');
console.log("正向遍历:", dlist.toString());
console.log("反向遍历:", dlist.reverseToString());
dlist.insert(2, 'M');
console.log("insert(2, 'M') 后:", dlist.toString());
dlist.remove(3);
console.log("remove(3) 后:", dlist.toString());

console.log("\\n--- 4. 快慢指针：找中点和倒数第k个 ---");
const list3 = new SinglyLinkedList();
[1, 2, 3, 4, 5, 6, 7].forEach(n => list3.append(n));
console.log("链表:", list3.toString());
const middle = LinkedListAlgo.findMiddle(list3.head);
console.log("中点元素:", middle ? middle.value : null);
const kth = LinkedListAlgo.findKthFromEnd(list3.head, 3);
console.log("倒数第3个:", kth ? kth.value : null);
const kth1 = LinkedListAlgo.findKthFromEnd(list3.head, 1);
console.log("倒数第1个（尾节点）:", kth1 ? kth1.value : null);

console.log("\\n--- 5. Floyd 判圈算法（检测环）---");
function createCyclicList(values, cyclePos) {
  const l = new SinglyLinkedList();
  values.forEach(v => l.append(v));
  if (cyclePos >= 0) {
    const cycleNode = l._getNodeAt(cyclePos);
    l.tail.next = cycleNode;
  }
  return l;
}

const normalList = createCyclicList([1, 2, 3, 4, 5], -1);
console.log("普通链表有环？", LinkedListAlgo.hasCycle(normalList.head));

const cyclicList = createCyclicList([1, 2, 3, 4, 5], 2);
console.log("带环链表有环？", LinkedListAlgo.hasCycle(cyclicList.head));
const cycleStart = LinkedListAlgo.detectCycleStart(cyclicList.head);
console.log("环的入口节点值:", cycleStart ? cycleStart.value : null);

console.log("\\n--- 6. 性能对比：数组 vs 链表 头部插入 ---");
const N = 50000;

const arr = [];
let start = Date.now();
for (let i = 0; i < N; i++) arr.unshift(i);
console.log("数组 unshift(" + N + "次): " + (Date.now() - start) + "ms");

const linkedList = new SinglyLinkedList();
start = Date.now();
for (let i = 0; i < N; i++) linkedList.prepend(i);
console.log("链表 prepend(" + N + "次): " + (Date.now() - start) + "ms");

console.log("\\n🎉 链表演示完成！");
`
  },
  {
    id: "n3-hash-table",
    icon: "🔢",
    group: "第五部分 数据结构与算法实战",
    title: "哈希表（Hash Table）原理与实现",
    content: `## 哈希表：以空间换时间的艺术

哈希表（Hash Table，也叫散列表）是计算机科学中最重要的数据结构之一。它提供了近乎O(1)时间复杂度的插入、删除和查找操作——这种近乎魔法般的效率，使得哈希表成为实际开发中使用频率最高的数据结构。JavaScript中的Object、Map、Set，Python中的dict，Java中的HashMap，Go中的map……几乎所有现代编程语言都内置了哈希表实现。

理解哈希表的工作原理，不仅能帮你写出更高效的代码，还能帮你理解很多工程问题的本质：为什么Object的key只能是字符串或Symbol？为什么Map可以用任何类型做key？负载因子是什么？哈希冲突如何解决？什么时候需要扩容？

## 哈希表的核心思想

哈希表的核心思想非常朴素：**把key通过哈希函数转换成数组下标，然后把value存到数组对应位置**。

\`\`\`
key → 哈希函数 → 数组索引 → 存储桶（bucket）→ value
\`\`\`

数组的随机访问是O(1)，只要我们能把key快速映射到数组下标，就能实现O(1)的查找。关键问题是：如何设计一个好的哈希函数，以及如何处理两个不同key映射到同一个下标的情况（哈希冲突）。

## 哈希函数的要求

一个好的哈希函数应该满足三个条件：

1. **确定性**：同一个key每次哈希的结果必须相同。这个看似显然，但如果key是对象或复杂类型，如何定义"相同"就成了问题——这也是为什么Object只能用字符串/Symbol做key，而Map通过引用地址判断。

2. **快速计算**：哈希计算不能太慢，否则会抵消O(1)查找的优势。对于字符串key，通常采用逐个字符累加并乘以一个质数的方式（类似多项式滚动哈希）。

3. **均匀分布**：哈希值应该尽可能均匀地散布在数组的整个范围内，减少冲突的概率。分布越均匀，哈希表的性能越接近理想的O(1)。

常见的简单哈希函数：除留余数法（key % size）、乘法哈希、多项式滚动哈希（用于字符串）。实际工业级实现（如Java HashMap、V8的OrderedHashTable）使用更复杂的哈希算法（如MurmurHash）来获得更好的分布。

## 哈希冲突及其解决方案

无论哈希函数设计得多好，冲突都是不可避免的——鸽巢原理告诉我们：把n+1个key放入n个桶，至少有一个桶里有多个key。解决哈希冲突主要有两大类方法：

### 1. 链地址法（Separate Chaining）

链地址法是最直观、最常用的方案：数组的每个桶（bucket）不是直接存value，而是存一个链表（或数组）。当多个key哈希到同一个下标时，它们都被存到这个桶的链表中。查找时，先通过哈希定位到桶，再在链表中遍历查找。

\`\`\`
bucket[0] → null
bucket[1] → (k1,v1) → (k5,v5) → null   ← 冲突！k1和k5都哈希到1
bucket[2] → (k2,v2) → null
bucket[3] → null
bucket[4] → (k4,v4) → (k7,v7) → (k9,v9) → null
\`\`\`

**优点**：实现简单，删除操作方便；负载因子可以大于1（即key的数量可以超过桶数组大小）；对哈希函数的要求相对宽松。

**缺点**：需要额外的链表节点空间；如果冲突严重（链表很长），查找退化为O(n)。Java HashMap在链表长度超过8时会将链表转换为红黑树，将最坏查找时间从O(n)降到O(logn)。

### 2. 开放地址法（Open Addressing）

开放地址法不使用额外的数据结构，所有元素都存在桶数组中。当冲突发生时，通过某种探测策略在数组中寻找下一个空位置：

- **线性探测（Linear Probing）**：如果位置h被占了，就依次尝试h+1、h+2、h+3……直到找到空位置。简单但容易产生"聚集"（clustering）问题——连续的被占位置越来越长。
- **二次探测（Quadratic Probing）**：尝试位置为 h + 1², h + 2², h + 3²……，缓解了聚集问题。
- **双重哈希（Double Hashing）**：用第二个哈希函数计算步长，分布更均匀。

**优点**：不需要链表指针，空间利用率高，缓存友好。

**缺点**：删除操作复杂（不能直接删，需要标记墓碑）；负载因子不能太高（一般需要控制在0.7以下），否则探测时间会急剧增长。

## 负载因子与扩容

负载因子（Load Factor）= 元素数量 / 桶数组大小。它衡量哈希表的"拥挤程度"。

负载因子越低→冲突越少→性能越好，但空间浪费越多。负载因子越高→空间利用率高，但冲突增多→性能下降。工程上通常设定一个阈值（如0.75），当负载因子超过阈值时自动**扩容**：创建一个更大的桶数组（通常是原来的2倍），然后将所有元素重新哈希（rehash）到新数组中。

扩容是一个耗时操作（O(n)），但由于扩容是按2倍增长的，均摊到每次插入操作，时间复杂度仍然是O(1)——这就是均摊分析（Amortized Analysis）的思想。

## Object vs Map vs 手写哈希表

| 特性 | Object | Map | 手写哈希表（链地址法） |
|------|--------|-----|---------------------|
| key类型 | 字符串/Symbol | 任意类型 | 任意（需好的哈希函数） |
| 遍历顺序 | ES6后字符串key按插入顺序 | 严格按插入顺序 | 不保证 |
| 原型链 | 有原型继承，可能有意外key | 无此问题 | 无此问题 |
| size获取 | 需要手动计算 | O(1)的size属性 | O(1)的count |
| 性能 | 高度优化 | V8中是有序哈希表 | 取决于实现 |
| 适用场景 | 简单键值对、JSON | 频繁增删、需要遍历 | 学习原理 |

实际开发中我们几乎不需要自己实现哈希表——用内置的Object或Map就够了。但理解底层原理能帮你在遇到性能问题时做出正确判断。
`,
    code: `// ============================================================
// 哈希表实现（链地址法解决冲突）
// ============================================================

class ValuePair {
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }

  toString() {
    return "[" + this.key + ": " + this.value + "]";
  }
}

class HashTable {
  constructor() {
    this.table = [];
    this.count = 0;
    this.limit = 7;
  }

  _loseloseHashCode(key) {
    if (typeof key === 'number') return key % this.limit;
    let hash = 0;
    const keyStr = String(key);
    for (let i = 0; i < keyStr.length; i++) {
      hash += keyStr.charCodeAt(i);
    }
    return hash % this.limit;
  }

  _djb2HashCode(key) {
    const keyStr = String(key);
    let hash = 5381;
    for (let i = 0; i < keyStr.length; i++) {
      hash = (hash * 33) + keyStr.charCodeAt(i);
    }
    return hash % 1013;
  }

  _hashCode(key) {
    return this._loseloseHashCode(key);
  }

  put(key, value) {
    if (key === undefined || key === null) return false;
    const index = this._hashCode(key);

    if (!this.table[index]) {
      this.table[index] = new LinkedList2();
    }

    const bucket = this.table[index];
    let current = bucket.head;
    while (current) {
      if (current.element.key === key) {
        current.element.value = value;
        return true;
      }
      current = current.next;
    }

    bucket.append(new ValuePair(key, value));
    this.count++;

    if (this.count / this.limit > 0.75) {
      this._resize(this._getNextPrime(this.limit * 2));
    }
    return true;
  }

  get(key) {
    const index = this._hashCode(key);
    const bucket = this.table[index];
    if (!bucket) return undefined;
    let current = bucket.head;
    while (current) {
      if (current.element.key === key) {
        return current.element.value;
      }
      current = current.next;
    }
    return undefined;
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  remove(key) {
    const index = this._hashCode(key);
    const bucket = this.table[index];
    if (!bucket) return false;
    let current = bucket.head;
    let position = 0;
    while (current) {
      if (current.element.key === key) {
        bucket.removeAt(position);
        this.count--;
        if (bucket.isEmpty()) {
          this.table[index] = undefined;
        }
        if (this.limit > 7 && this.count / this.limit < 0.25) {
          this._resize(this._getNextPrime(Math.floor(this.limit / 2)));
        }
        return true;
      }
      current = current.next;
      position++;
    }
    return false;
  }

  _resize(newLimit) {
    const oldTable = this.table;
    this.limit = newLimit;
    this.table = [];
    this.count = 0;
    for (let i = 0; i < oldTable.length; i++) {
      if (oldTable[i]) {
        let current = oldTable[i].head;
        while (current) {
          this.put(current.element.key, current.element.value);
          current = current.next;
        }
      }
    }
  }

  _isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  }

  _getNextPrime(num) {
    while (!this._isPrime(num)) {
      num++;
    }
    return num;
  }

  size() {
    return this.count;
  }

  isEmpty() {
    return this.count === 0;
  }

  getLoadFactor() {
    return (this.count / this.limit).toFixed(3);
  }

  getBucketCount() {
    let count = 0;
    for (let i = 0; i < this.table.length; i++) {
      if (this.table[i]) count++;
    }
    return count;
  }

  getCollisionStats() {
    let totalCollisions = 0;
    let maxBucketSize = 0;
    for (let i = 0; i < this.table.length; i++) {
      if (this.table[i]) {
        const size = this.table[i].size();
        if (size > 1) totalCollisions += (size - 1);
        if (size > maxBucketSize) maxBucketSize = size;
      }
    }
    return {
      totalItems: this.count,
      bucketCount: this.getBucketCount(),
      totalCollisions,
      maxBucketSize,
      loadFactor: this.getLoadFactor()
    };
  }

  keys() {
    const keys = [];
    for (let i = 0; i < this.table.length; i++) {
      if (this.table[i]) {
        let current = this.table[i].head;
        while (current) {
          keys.push(current.element.key);
          current = current.next;
        }
      }
    }
    return keys;
  }

  values() {
    const values = [];
    for (let i = 0; i < this.table.length; i++) {
      if (this.table[i]) {
        let current = this.table[i].head;
        while (current) {
          values.push(current.element.value);
          current = current.next;
        }
      }
    }
    return values;
  }

  toString() {
    if (this.isEmpty()) return '';
    let str = '';
    for (let i = 0; i < this.table.length; i++) {
      if (this.table[i]) {
        str += "桶" + i + ": ";
        let current = this.table[i].head;
        while (current) {
          str += current.element.toString();
          if (current.next) str += " -> ";
          current = current.next;
        }
        str += "\\n";
      }
    }
    return str;
  }
}

class Node2 {
  constructor(element) {
    this.element = element;
    this.next = null;
  }
}

class LinkedList2 {
  constructor() {
    this.head = null;
    this.length = 0;
  }

  append(element) {
    const node = new Node2(element);
    if (!this.head) {
      this.head = node;
    } else {
      let current = this.head;
      while (current.next) current = current.next;
      current.next = node;
    }
    this.length++;
  }

  removeAt(position) {
    if (position < 0 || position >= this.length) return null;
    let current = this.head;
    if (position === 0) {
      this.head = current.next;
    } else {
      let prev = null;
      for (let i = 0; i < position; i++) {
        prev = current;
        current = current.next;
      }
      prev.next = current.next;
    }
    this.length--;
    return current.element;
  }

  isEmpty() {
    return this.length === 0;
  }

  size() {
    return this.length;
  }
}

// ========== 演示部分 ==========
console.log("========================================");
console.log("  哈希表实现演示（链地址法）");
console.log("========================================");

const hashTable = new HashTable();

console.log("\\n--- 1. 插入键值对 ---");
const names = [
  ['Gandalf', 'gandalf@email.com'],
  ['John', 'johnsnow@email.com'],
  ['Tyrion', 'tyrion@email.com'],
  ['Aaron', 'aaron@email.com'],
  ['Donnie', 'donnie@email.com'],
  ['Ana', 'ana@email.com'],
  ['Jonathan', 'jonathan@email.com'],
  ['Jamie', 'jamie@email.com'],
  ['Sue', 'sue@email.com'],
  ['Mindy', 'mindy@email.com'],
  ['Paul', 'paul@email.com'],
  ['Nathan', 'nathan@email.com']
];

names.forEach(([k, v]) => {
  hashTable.put(k, v);
  console.log("  put(" + k + ", " + v + ")");
});

console.log("\\n哈希表当前状态:");
console.log(hashTable.toString());

console.log("\\n--- 2. 统计信息 ---");
const stats = hashTable.getCollisionStats();
console.log("  总元素数:", stats.totalItems);
console.log("  桶数组大小:", hashTable.limit);
console.log("  使用的桶数:", stats.bucketCount);
console.log("  冲突数:", stats.totalCollisions);
console.log("  最大桶长度:", stats.maxBucketSize);
console.log("  负载因子:", stats.loadFactor);
console.log("  （注意自动扩容到了质数大小的桶数组）");

console.log("\\n--- 3. 查询操作 ---");
console.log("  get('Tyrion'):", hashTable.get('Tyrion'));
console.log("  get('Gandalf'):", hashTable.get('Gandalf'));
console.log("  has('John'):", hashTable.has('John'));
console.log("  has('NotExist'):", hashTable.has('NotExist'));

console.log("\\n--- 4. 更新值（同key覆盖）---");
hashTable.put('John', 'newjohn@email.com');
console.log("  更新后 get('John'):", hashTable.get('John'));

console.log("\\n--- 5. 删除操作 ---");
console.log("  remove('Tyrion'):", hashTable.remove('Tyrion'));
console.log("  remove('NotExist'):", hashTable.remove('NotExist'));
console.log("  删除后 has('Tyrion'):", hashTable.has('Tyrion'));

console.log("\\n--- 6. 演示哈希冲突 ---");
const smallHash = new HashTable();
const keysToTest = ['abc', 'cba', 'bac', 'cab', 'acb', 'bca'];
keysToTest.forEach(k => smallHash.put(k, k + '-value'));
console.log("  用loselose哈希函数时，这些排列字符串容易冲突:");
keysToTest.forEach(k => {
  console.log("    '" + k + "' 哈希到索引 " + smallHash._loseloseHashCode(k));
});
console.log("  冲突统计:", smallHash.getCollisionStats());

console.log("\\n--- 7. 性能对比：哈希表 vs 数组线性查找 ---");
const SIZE = 50000;
const data = [];
const ht = new HashTable();
for (let i = 0; i < SIZE; i++) {
  const key = "key" + i;
  const value = "value" + i;
  data.push({ key, value });
  ht.put(key, value);
}

let start = Date.now();
let found = 0;
for (let i = 0; i < 1000; i++) {
  const searchKey = "key" + Math.floor(Math.random() * SIZE);
  for (let j = 0; j < data.length; j++) {
    if (data[j].key === searchKey) {
      found++;
      break;
    }
  }
}
console.log("  数组线性查找（1000次随机查询）: " + (Date.now() - start) + "ms");

start = Date.now();
found = 0;
for (let i = 0; i < 1000; i++) {
  const searchKey = "key" + Math.floor(Math.random() * SIZE);
  if (ht.get(searchKey)) found++;
}
console.log("  哈希表查找（1000次随机查询）: " + (Date.now() - start) + "ms");

console.log("\\n🎉 哈希表演示完成！");
`
  },
  {
    id: "n3-sort",
    icon: "📊",
    group: "第五部分 数据结构与算法实战",
    title: "排序算法实现与性能对比",
    content: `## 排序算法：算法学习的经典入门

排序是将一组数据按照特定顺序（升序或降序）排列的操作。它是计算机科学中被研究得最透彻的问题之一——从计算机诞生之初，科学家们就在设计更高效的排序算法。学习排序算法不仅是因为它实用，更因为它涵盖了算法设计的核心思想：分治、递归、贪心、比较与交换。

理解排序算法的原理和性能特征，是培养算法思维的必经之路。虽然实际开发中我们几乎总是直接调用语言内置的sort方法，但了解底层原理能帮你在关键时刻做出正确选择：比如处理小规模数据时插入排序可能比快排更快，追求稳定性时归并排序比快排更合适。

## 排序算法的分类维度

在深入具体算法之前，先理解几个关键的分类维度：

**比较排序 vs 非比较排序**：
- **比较排序**：通过比较元素大小来决定相对顺序，时间复杂度下界是O(nlogn)。冒泡、选择、插入、归并、快排、堆排都属于此类。
- **非比较排序**：不通过直接比较，而是利用数据本身的特性（如整数范围、字符集），可以突破O(nlogn)下界达到O(n)。计数排序、桶排序、基数排序属于此类，但适用范围有限。

**稳定排序 vs 不稳定排序**：
- **稳定排序**：相等元素的相对顺序在排序后保持不变。这在多关键字排序时很重要（比如先按成绩排序，成绩相同的按姓名排序）。
- **不稳定排序**：相等元素的相对顺序可能改变。

**原地排序 vs 非原地排序**：
- **原地排序**：只需要常数级别的额外空间O(1)（或O(logn)的递归栈空间）。
- **非原地排序**：需要额外的O(n)辅助空间。

## 经典排序算法详解

### 1. 冒泡排序（Bubble Sort）

冒泡排序是最直观的排序：重复遍历数组，比较相邻元素，如果顺序不对就交换。每一轮遍历后，最大（或最小）的元素会像气泡一样"浮"到数组末尾。

- 时间复杂度：O(n²)（最好O(n)，已经有序时只需一轮）
- 空间复杂度：O(1) 原地
- 稳定性：稳定
- 特点：实现简单，但效率低，实际中几乎不用，适合教学

### 2. 选择排序（Selection Sort）

选择排序的思路是：每一轮在未排序部分中找到最小（大）元素，放到已排序部分的末尾。

- 时间复杂度：O(n²)（无论数据如何分布都是O(n²)，因为必须完整比较找到最小值）
- 空间复杂度：O(1) 原地
- 稳定性：不稳定（例如 [5,5,2]，第一个5和2交换后，两个5的顺序变了）
- 特点：交换次数少（最多n次交换），这是它唯一的优势

### 3. 插入排序（Insertion Sort）

插入排序就像我们打扑克时整理手牌：每拿到一张新牌，将它插入到手中已经有序的牌的正确位置。对于数组，从第二个元素开始，将当前元素插入到前面已排序部分的合适位置。

- 时间复杂度：O(n²)（最好O(n)，数据接近有序时极快）
- 空间复杂度：O(1) 原地
- 稳定性：稳定
- 特点：**小规模或近乎有序的数据上非常快**（常数因子小），这也是为什么V8的Timsort在小数组上使用插入排序。

### 4. 归并排序（Merge Sort）

归并排序是**分治思想（Divide and Conquer）** 的经典应用：
1. **分**：将数组从中间分成两半
2. **治**：递归地对两半分别排序
3. **合**：将两个有序的子数组合并成一个有序数组

归并排序的合并过程需要额外的辅助数组。

- 时间复杂度：O(nlogn)，最坏/最好/平均都是O(nlogn)，非常稳定
- 空间复杂度：O(n) 非原地（需要辅助数组）
- 稳定性：稳定（合并时先取左边相等元素即可保持稳定）
- 特点：性能稳定，适合链表排序（不需要随机访问），是外部排序的首选

### 5. 快速排序（Quick Sort）

快速排序是实践中**最快**的通用排序算法（因此得名）。它也是分治思想，但和归并排序不同：
1. **选择基准（pivot）**：从数组中选一个元素作为基准
2. **分区（partition）**：将数组重新排列，比基准小的放左边，比基准大的放右边
3. **递归**：递归地对左右两个子数组进行快排

快排的性能高度依赖基准选择：如果每次选到最大/最小值（如已排序数组选第一个元素），会退化为O(n²)。解决方案包括：随机选择基准、三数取中、三向切分等。

- 时间复杂度：平均O(nlogn)，最坏O(n²)（但好的基准选择几乎可以避免）
- 空间复杂度：O(logn) 原地（递归栈空间）
- 稳定性：不稳定
- 特点：平均性能最快，常数因子小，缓存友好，是大多数场景的首选

## JavaScript Array.sort 的底层实现

很多人不知道JavaScript的Array.sort到底用的什么算法。在V8引擎（Chrome/Node.js）中：
- 短小的数组（length < 22）使用**插入排序**（因为小数组上插入排序常数小）
- 长数组使用 **Timsort**（一种归并排序和插入排序的混合算法，由Tim Peters为Python发明）
- Timsort会寻找数组中已有的"有序段"（run），利用这些已有序的部分来减少合并开销，对现实世界中常常部分有序的数据特别高效

## 排序算法选择策略

| 场景 | 推荐算法 | 理由 |
|------|---------|------|
| 通用场景（大多数情况） | 快排/Timsort | 平均最快，常数小 |
| 需要稳定性 | 归并排序 | O(nlogn)且稳定 |
| 小规模/近乎有序 | 插入排序 | O(n)接近，常数极小 |
| 链表排序 | 归并排序 | 不需要随机访问 |
| 已知数据范围有限 | 计数/基数排序 | O(n)非比较排序 |
| 教学/理解原理 | 冒泡/选择 | 最简单直观 |
`,
    code: `// ============================================================
// 排序算法实现：冒泡、选择、插入、归并、快速排序
// ============================================================

function bubbleSort(arr) {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return a;
}

function selectionSort(arr) {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (a[j] < a[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
    }
  }
  return a;
}

function insertionSort(arr) {
  const a = [...arr];
  const n = a.length;
  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
  return a;
}

function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }
  while (i < left.length) {
    result.push(left[i]);
    i++;
  }
  while (j < right.length) {
    result.push(right[j]);
    j++;
  }
  return result;
}

function quickSort(arr) {
  const a = [...arr];
  _quickSort(a, 0, a.length - 1);
  return a;
}

function _quickSort(a, low, high) {
  if (low < high) {
    const pivotIdx = _partition(a, low, high);
    _quickSort(a, low, pivotIdx - 1);
    _quickSort(a, pivotIdx + 1, high);
  }
}

function _partition(a, low, high) {
  const pivot = a[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (a[j] <= pivot) {
      i++;
      [a[i], a[j]] = [a[j], a[i]];
    }
  }
  [a[i + 1], a[high]] = [a[high], a[i + 1]];
  return i + 1;
}

function quickSort3Way(arr) {
  const a = [...arr];
  _quickSort3Way(a, 0, a.length - 1);
  return a;
}

function _quickSort3Way(a, low, high) {
  if (low >= high) return;
  const pivot = a[low];
  let lt = low, gt = high, i = low + 1;
  while (i <= gt) {
    if (a[i] < pivot) {
      [a[lt], a[i]] = [a[i], a[lt]];
      lt++;
      i++;
    } else if (a[i] > pivot) {
      [a[i], a[gt]] = [a[gt], a[i]];
      gt--;
    } else {
      i++;
    }
  }
  _quickSort3Way(a, low, lt - 1);
  _quickSort3Way(a, gt + 1, high);
}

function isSorted(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) return false;
  }
  return true;
}

function generateRandomArray(n, max = 10000) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push(Math.floor(Math.random() * max));
  }
  return arr;
}

function generateNearlySortedArray(n, swapTimes = 10) {
  const arr = [];
  for (let i = 0; i < n; i++) arr.push(i);
  for (let i = 0; i < swapTimes; i++) {
    const a = Math.floor(Math.random() * n);
    const b = Math.floor(Math.random() * n);
    [arr[a], arr[b]] = [arr[b], arr[a]];
  }
  return arr;
}

// ========== 演示部分 ==========
console.log("========================================");
console.log("  排序算法实现与性能对比");
console.log("========================================");

console.log("\\n--- 1. 基本排序正确性验证 ---");
const testArr = [64, 34, 25, 12, 22, 11, 90, 5, 38];
console.log("原始数组:", testArr.join(', '));
console.log("冒泡排序:", bubbleSort(testArr).join(', '));
console.log("选择排序:", selectionSort(testArr).join(', '));
console.log("插入排序:", insertionSort(testArr).join(', '));
console.log("归并排序:", mergeSort(testArr).join(', '));
console.log("快速排序:", quickSort(testArr).join(', '));
console.log("三向快排:", quickSort3Way(testArr).join(', '));
console.log("JS内置sort:", [...testArr].sort((a, b) => a - b).join(', '));

const algorithms = [
  { name: '冒泡排序', fn: bubbleSort },
  { name: '选择排序', fn: selectionSort },
  { name: '插入排序', fn: insertionSort },
  { name: '归并排序', fn: mergeSort },
  { name: '快速排序', fn: quickSort },
  { name: '三向快排', fn: quickSort3Way },
  { name: 'JS内置sort', fn: (arr) => [...arr].sort((a, b) => a - b) }
];

console.log("\\n--- 2. 正确性验证（随机数组1000元素）---");
const randomArr = generateRandomArray(1000);
let allCorrect = true;
for (const algo of algorithms) {
  const sorted = algo.fn(randomArr);
  const correct = isSorted(sorted);
  if (!correct) {
    console.log("  ❌ " + algo.name + ": 排序错误！");
    allCorrect = false;
  }
}
if (allCorrect) {
  console.log("  ✅ 所有算法排序结果均正确！");
}

console.log("\\n--- 3. 性能测试：随机数组（5000元素）---");
const N1 = 5000;
const randomData = generateRandomArray(N1);
console.log("  数组大小:", N1);
const results1 = [];
for (const algo of algorithms) {
  const start = Date.now();
  const sorted = algo.fn(randomData);
  const time = Date.now() - start;
  const correct = isSorted(sorted);
  results1.push({ name: algo.name, time, correct });
}
results1.sort((a, b) => a.time - b.time);
results1.forEach((r, idx) => {
  console.log("  " + (idx + 1) + ". " + r.name + ": " + r.time + "ms" + (r.correct ? ' ✅' : ' ❌'));
});

console.log("\\n--- 4. 性能测试：近乎有序数组（5000元素，仅交换20对）---");
const nearlySorted = generateNearlySortedArray(N1, 20);
console.log("  数组大小:", N1, "(近乎有序)");
const results2 = [];
for (const algo of algorithms) {
  const start = Date.now();
  const sorted = algo.fn(nearlySorted);
  const time = Date.now() - start;
  const correct = isSorted(sorted);
  results2.push({ name: algo.name, time, correct });
}
results2.sort((a, b) => a.time - b.time);
results2.forEach((r, idx) => {
  console.log("  " + (idx + 1) + ". " + r.name + ": " + r.time + "ms" + (r.correct ? ' ✅' : ' ❌'));
});
console.log("  （注意：插入排序在近乎有序的数据上非常快！）");

console.log("\\n--- 5. O(n²) vs O(nlogn) 性能对比（不含冒泡/选择，仅10000元素）---");
const N2 = 10000;
const bigData = generateRandomArray(N2);
const fastAlgos = algorithms.filter(a => !['冒泡排序', '选择排序'].includes(a.name));
console.log("  数组大小:", N2);
const results3 = [];
for (const algo of fastAlgos) {
  const start = Date.now();
  const sorted = algo.fn(bigData);
  const time = Date.now() - start;
  results3.push({ name: algo.name, time, correct: isSorted(sorted) });
}
results3.sort((a, b) => a.time - b.time);
results3.forEach((r, idx) => {
  console.log("  " + (idx + 1) + ". " + r.name + ": " + r.time + "ms" + (r.correct ? ' ✅' : ' ❌'));
});

console.log("\\n--- 6. 稳定性演示 ---");
const items = [
  { name: 'A', score: 90 },
  { name: 'B', score: 80 },
  { name: 'C', score: 90 },
  { name: 'D', score: 70 },
  { name: 'E', score: 80 }
];

function stableSortByScore(arr) {
  return mergeSort([...arr].map((item, idx) => ({ ...item, _idx: idx }))
    .sort((a, b) => a.score === b.score ? a._idx - b._idx : a.score - b.score)
    .map(({ _idx, ...rest }) => rest));
}

console.log("  原始顺序（同分数保持原有顺序）:");
items.forEach(i => console.log("    " + i.name + "(" + i.score + ")"));
console.log("  稳定排序（归并思路）后同分数相对顺序不变。");
console.log("  快速排序和选择排序是不稳定的。");

console.log("\\n🎉 排序算法演示完成！");
`
  },
  {
    id: "n3-search",
    icon: "🔍",
    group: "第五部分 数据结构与算法实战",
    title: "二分查找与搜索算法",
    content: `## 搜索算法：在数据海洋中定位目标

搜索（查找）是计算机最基本的操作之一：从数据库中找一条记录、在文档中搜索关键词、在地图上找最短路径、在代码中找函数定义……搜索无处不在。不同的数据结构和不同的数据分布，决定了我们应该使用哪种搜索策略。

搜索算法的效率直接决定了整个系统的性能。一个O(n)的线性搜索在100万条数据中需要比较约50万次，而二分查找只需要约20次——差距是2.5万倍。理解各种搜索算法的适用场景，是每个开发者必备的基本功。

## 线性搜索（Linear Search）

线性搜索（也叫顺序搜索）是最简单的搜索方式：从第一个元素开始，逐个比较，直到找到目标或遍历完所有元素。

- 时间复杂度：O(n)
- 空间复杂度：O(1)
- 适用场景：**无序数据**或**小规模数据**。不需要数据有序，不需要任何预处理，通用性最强。
- 优化：如果数据有序，可以在找到比目标大的元素时提前终止（但平均仍为O(n)）。

## 二分查找（Binary Search）

二分查找是有序数据上效率最高的搜索算法，也是分治思想和对数时间复杂度的经典体现。它的核心思想非常简单：**利用数组有序的特性，每次比较都排除一半的可能性**。

### 基本原理

在一个有序数组中查找target：
1. 取中间元素mid = arr[midIndex]
2. 如果mid === target：找到了，返回索引
3. 如果mid > target：target只可能在左半部分，在左半部分继续查找
4. 如果mid < target：target只可能在右半部分，在右半部分继续查找
5. 重复上述过程，直到找到或搜索范围为空（不存在）

每次比较都将搜索范围缩小一半，所以时间复杂度是**O(logn)**。这个复杂度有多快？
- 在100个元素中查找：最多7次
- 在1万个元素中查找：最多14次
- 在100万个元素中查找：最多20次
- 在10亿个元素中查找：最多30次！

这就是对数复杂度的威力——数据量增长1000倍，查找次数只增加约10次。

### 边界处理的艺术

二分查找看起来简单，但实现起来有一个著名的陷阱：**边界错误**。很多人写的二分查找会在某些情况下死循环或漏掉答案。关键在于明确搜索区间的定义：

**左闭右闭 [left, right]**：right初始化为arr.length - 1。循环条件是left <= right。当left > right时区间为空。
**左闭右开 [left, right)**：right初始化为arr.length。循环条件是left < right。当left === right时区间为空。

两种写法都正确，但必须保持逻辑一致。mid计算时还要注意整数溢出问题（虽然JS中不太会遇到，但在其他语言中 (left + right) 可能溢出，应该写成 left + Math.floor((right - left) / 2)）。

### 二分查找的四种变体

在实际问题中，我们经常需要查找满足条件的"边界"位置，而不是简单的等值查找：

1. **查找第一个等于target的位置**：当mid等于target时不立即返回，而是继续在左半部分查找。
2. **查找最后一个等于target的位置**：当mid等于target时继续在右半部分查找。
3. **查找第一个大于等于target的位置**（lower_bound）：这是最通用的变体，可以推导出其他变体。
4. **查找最后一个小于等于target的位置**（upper_bound的变体）。

掌握这四种变体，能解决绝大多数二分查找类面试题。二分查找的思想还被用于：在旋转排序数组中查找、搜索插入位置、求平方根、寻找峰值等场景。

## 广度优先搜索（BFS）与深度优先搜索（DFS）

线性搜索和二分查找是在线性结构（数组）上的搜索。当数据是树形或图结构时，我们需要不同的遍历策略。最基础的两种就是BFS和DFS。

### 广度优先搜索（BFS：Breadth-First Search）

BFS是**层序遍历**：从起点开始，先访问所有距离为1的邻居，再访问距离为2的邻居，像水波扩散一样一层一层向外扩展。

BFS使用**队列**来实现：
1. 将起点入队，标记为已访问
2. 出队一个节点，处理它
3. 将它的所有未访问邻居入队，标记为已访问
4. 重复2-3直到队列为空

- 时间复杂度：O(V + E)（V是顶点数，E是边数）
- 空间复杂度：O(V)（队列最多可能存储整层节点数）
- 特点：能找到**最短路径**（无权图中）；按层遍历；适合找最近的目标。

### 深度优先搜索（DFS：Depth-First Search）

DFS是"一路走到黑"：从起点出发，沿着一条路径一直深入到尽头，然后回溯，走另一条分支。

DFS使用**栈**（递归本质上就是利用调用栈）来实现：
1. 访问当前节点，标记为已访问
2. 对每个未访问的邻居，递归执行DFS

- 时间复杂度：O(V + E)
- 空间复杂度：O(V)（递归栈最坏情况下是一条链）
- 特点：实现简单（递归代码很短）；适合检测环、拓扑排序、寻找连通分量；不保证最短路径。

### BFS vs DFS 选择

| 维度 | BFS | DFS |
|------|-----|-----|
| 实现 | 队列+迭代 | 栈/递归 |
| 最短路径 | 可以找到 | 不能保证 |
| 空间 | 宽树/稠密图占用大 | 深树/长链占用大 |
| 适用性 | 层序遍历、最短路径 | 回溯、连通性、拓扑排序 |
| 代码复杂度 | 较直观 | 递归简洁但易栈溢出 |

本章代码部分，我们将实现迭代版和递归版二分查找、四种变体查找，以及BFS和DFS遍历树结构。
`,
    code: `// ============================================================
// 搜索算法实现：二分查找（含变体）+ BFS + DFS
// ============================================================

// ========== 1. 线性搜索 ==========
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

// ========== 2. 二分查找（迭代版，左闭右闭） ==========
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}

// ========== 3. 二分查找（递归版） ==========
function binarySearchRecursive(arr, target) {
  return _binarySearchRecursive(arr, target, 0, arr.length - 1);
}

function _binarySearchRecursive(arr, target, left, right) {
  if (left > right) return -1;
  const mid = left + Math.floor((right - left) / 2);
  if (arr[mid] === target) return mid;
  if (arr[mid] < target) {
    return _binarySearchRecursive(arr, target, mid + 1, right);
  } else {
    return _binarySearchRecursive(arr, target, left, mid - 1);
  }
}

// ========== 4. 二分查找变体1：查找第一个等于target的位置 ==========
function findFirstEqual(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let result = -1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === target) {
      result = mid;
      right = mid - 1;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return result;
}

// ========== 5. 二分查找变体2：查找最后一个等于target的位置 ==========
function findLastEqual(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let result = -1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] === target) {
      result = mid;
      left = mid + 1;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return result;
}

// ========== 6. 二分查找变体3：查找第一个大于等于target的位置（lower_bound） ==========
function lowerBound(arr, target) {
  let left = 0;
  let right = arr.length;
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] >= target) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }
  return left;
}

// ========== 7. 二分查找变体4：查找最后一个小于等于target的位置 ==========
function findLastLessOrEqual(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  let result = -1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (arr[mid] <= target) {
      result = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return result;
}

// ========== 8. 二分查找应用：搜索插入位置 ==========
function searchInsert(arr, target) {
  return lowerBound(arr, target);
}

// ========== 9. 二分查找应用：求平方根（整数） ==========
function mySqrt(x) {
  if (x <= 1) return x;
  let left = 1;
  let right = x;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (mid <= x / mid) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return right;
}

// ========== 树结构定义（用于BFS/DFS演示） ==========
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

function createSampleTree() {
  const root = new TreeNode(1);
  root.left = new TreeNode(2);
  root.right = new TreeNode(3);
  root.left.left = new TreeNode(4);
  root.left.right = new TreeNode(5);
  root.right.left = new TreeNode(6);
  root.right.right = new TreeNode(7);
  return root;
}

// ========== 10. BFS：广度优先搜索（层序遍历） ==========
function bfs(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node.value);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}

function bfsLevelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  let level = 0;
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.value);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push({ level: level++, nodes: currentLevel });
  }
  return result;
}

// ========== 11. DFS：深度优先搜索（递归实现） ==========
function dfsPreOrder(root) {
  const result = [];
  function traverse(node) {
    if (!node) return;
    result.push(node.value);
    traverse(node.left);
    traverse(node.right);
  }
  traverse(root);
  return result;
}

function dfsInOrder(root) {
  const result = [];
  function traverse(node) {
    if (!node) return;
    traverse(node.left);
    result.push(node.value);
    traverse(node.right);
  }
  traverse(root);
  return result;
}

function dfsPostOrder(root) {
  const result = [];
  function traverse(node) {
    if (!node) return;
    traverse(node.left);
    traverse(node.right);
    result.push(node.value);
  }
  traverse(root);
  return result;
}

// ========== 12. DFS：迭代版（用栈模拟递归） ==========
function dfsPreOrderIterative(root) {
  if (!root) return [];
  const result = [];
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    result.push(node.value);
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return result;
}

// ========== 演示部分 ==========
console.log("========================================");
console.log("  搜索算法演示：二分查找 + BFS/DFS");
console.log("========================================");

console.log("\\n--- 1. 二分查找基本功能 ---");
const sortedArr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
console.log("有序数组:", sortedArr.join(', '));
const targets = [7, 1, 19, 10, 0, 20];
for (const t of targets) {
  const iter = binarySearch(sortedArr, t);
  const recur = binarySearchRecursive(sortedArr, t);
  console.log("  查找 " + t + ": 迭代版索引=" + iter + ", 递归版索引=" + recur);
}

console.log("\\n--- 2. 二分查找四种变体（处理重复元素）---");
const dupArr = [1, 2, 2, 2, 3, 3, 4, 5, 5, 5, 5, 6];
console.log("含重复元素的有序数组:", dupArr.join(', '));
const testVal = 3;
console.log("  查找 " + testVal + ":");
console.log("    第一个等于的位置:", findFirstEqual(dupArr, testVal));
console.log("    最后一个等于的位置:", findLastEqual(dupArr, testVal));
console.log("  查找 2:");
console.log("    第一个等于的位置:", findFirstEqual(dupArr, 2));
console.log("    最后一个等于的位置:", findLastEqual(dupArr, 2));
console.log("  查找 5:");
console.log("    第一个大于等于5的位置(lowerBound):", lowerBound(dupArr, 5));
console.log("    最后一个小于等于5的位置:", findLastLessOrEqual(dupArr, 5));

console.log("\\n--- 3. 二分查找应用 ---");
console.log("  搜索插入位置（target=8）:", searchInsert(sortedArr, 8));
console.log("  搜索插入位置（target=0）:", searchInsert(sortedArr, 0));
console.log("  整数平方根 sqrt(16):", mySqrt(16));
console.log("  整数平方根 sqrt(20):", mySqrt(20));
console.log("  整数平方根 sqrt(1):", mySqrt(1));
console.log("  整数平方根 sqrt(0):", mySqrt(0));

console.log("\\n--- 4. 二分查找 vs 线性搜索性能对比 ---");
const N = 1000000;
const bigArr = [];
for (let i = 0; i < N; i++) bigArr.push(i * 2);
const searchTargets = [0, 500000 * 2, 999999 * 2, -1];

console.log("  数组大小:", N);
let start = Date.now();
for (let i = 0; i < 100; i++) {
  const t = searchTargets[i % searchTargets.length];
  linearSearch(bigArr, t);
}
console.log("  线性搜索（100次查询）:", (Date.now() - start) + "ms");

start = Date.now();
for (let i = 0; i < 100000; i++) {
  const t = searchTargets[i % searchTargets.length];
  binarySearch(bigArr, t);
}
console.log("  二分查找（100000次查询）:", (Date.now() - start) + "ms");
console.log("  （注意二分查找查询次数多1000倍，但仍然更快！）");

console.log("\\n--- 5. BFS/DFS 遍历树 ---");
const tree = createSampleTree();
console.log("  树结构:");
console.log("         1");
console.log("       /   \\\\");
console.log("      2     3");
console.log("     / \\\\   / \\\\");
console.log("    4   5 6   7");

console.log("\\n  BFS层序遍历:", bfs(tree).join(' -> '));
const levels = bfsLevelOrder(tree);
console.log("  BFS分层遍历:");
levels.forEach(l => {
  console.log("    第" + l.level + "层:", l.nodes.join(', '));
});

console.log("\\n  DFS前序遍历(根左右):", dfsPreOrder(tree).join(' -> '));
console.log("  DFS中序遍历(左根右):", dfsInOrder(tree).join(' -> '));
console.log("  DFS后序遍历(左右根):", dfsPostOrder(tree).join(' -> '));
console.log("  DFS前序(迭代版):", dfsPreOrderIterative(tree).join(' -> '));

console.log("\\n--- 6. 线性搜索 vs 二分查找使用建议 ---");
console.log("  - 无序数组：只能线性搜索");
console.log("  - 有序数组/小数组(<50)：线性搜索可能更快（无递归/分支开销）");
console.log("  - 有序大数组：二分查找，O(logn) vs O(n) 差距巨大");
console.log("  - 频繁增删：二叉搜索树或跳表");
console.log("  - 键值查找：哈希表O(1)");

console.log("\\n🎉 搜索算法演示完成！");
`
  },
  {
    id: "n3-conclusion",
    icon: "🏆",
    group: "结尾",
    title: "结语：编程内功永无止境",
    content: `## 回顾：我们一路走来学到了什么？

恭喜你坚持到了《Node.js 进阶之路》第三本的最后一章！回顾这部分内容，我们一起探索了编程世界中最核心的内功——从手写核心模块理解底层原理，到设计模式构建可维护系统，从函数式编程拓展思维边界，再到数据结构与算法夯实效率根基。这些知识不是孤立的知识点，而是构成你编程能力大厦的基石。

让我们回顾这几章的核心收获：

**手写核心模块 = 理解底层原理**：我们不再满足于"会用"第三方库，而是亲手实现了EventEmitter、Promise、限流算法、缓存模块、事件总线等核心组件。这个过程的价值不在于你以后要自己写这些东西——大多数时候直接用成熟的库更好——而在于**理解内部原理后，你使用它们时心里有底**。当你的EventEmitter出bug时，你知道从哪查；当你选择限流策略时，你清楚每种算法的trade-off；当缓存出问题时，你能快速判断是击穿、穿透还是雪崩。

**设计模式 = 解决问题的套路**：设计模式不是教条，而是前人总结的、在特定场景下反复验证有效的解决方案。观察者模式解耦了事件发布者和订阅者；策略模式让算法可以独立于使用它的客户端变化；工厂模式封装了对象创建的复杂性；装饰器模式在不修改原代码的情况下扩展功能。记住：模式是工具，不是目标。不要为了用模式而用模式，但当你遇到熟悉的问题时，模式能给你一个好的起点。

**函数式编程 = 思维的拓展**：纯函数、不可变性、高阶函数、闭包、compose组合……这些概念不仅仅是"另一种编程风格"，它们帮你从命令式的"怎么做"转向声明式的"做什么"。函数组合的思想让你像搭乐高一样构建复杂逻辑；闭包让数据和行为优雅地封装在一起；不可变性让并发编程和状态管理变得更可预测。即使你主要写面向对象代码，函数式编程的思想也会让你写出更简洁、更易测试的代码。

**数据结构与算法 = 效率的根基**：栈和队列让我们理解了函数调用和事件循环的本质；链表展示了不同内存布局下的性能取舍；哈希表揭示了O(1)查找背后的原理和代价；排序算法教会了我们分治、递归等算法设计思想；二分查找展示了对数复杂度的威力，BFS/DFS则是图遍历的基础。算法不是只在面试时有用——每次你选择用Map而不是Array做查找、每次你意识到嵌套循环可以优化、每次你在设计数据结构时做出正确选择，都是算法思维在起作用。

## 手写源码是手段，不是目的

有必要特别强调一点：**学习手写源码的目的不是让你在工作中重新发明轮子**。在真实项目中，你应该使用经过充分测试的、社区维护的成熟库——lodash、async、p-limit、events等等。

手写源码的真正价值在于：

1. **消除"魔法感"**：当你知道一个东西是怎么实现的，它就不再是神秘的黑盒，你用起来更有信心，出了问题也能快速定位。
2. **培养设计直觉**：看过优秀代码的设计思路，你自己写代码时会自然地做出更好的设计决策。
3. **应对特殊场景**：当现成的库不能满足需求时，你有能力基于原理做定制开发。
4. **面试加分**：这是不言而喻的好处，但它是副产品而不是目标。

**理解设计思想比记住代码更重要**。十年后，JavaScript的语法可能变了，新的框架可能取代今天流行的，你可能会换语言、换方向。但那些底层的设计思想——解耦、分治、抽象、组合、权衡——是永恒的。这些才是你真正应该带走的东西。

## 技术成长的四个阶段

回顾大多数程序员的成长路径，大致会经历以下阶段：

**第一阶段：API调用者**——能熟练使用各种框架和库完成功能，但对底层原理不甚了解。遇到问题先Google，照着Stack Overflow的答案改。这是每个开发者的必经之路，没什么丢人的，但不应该停留太久。

**第二阶段：原理理解者**——开始好奇"为什么"，主动去理解所用工具的内部原理。能看懂源码，理解性能特性和适用边界。遇到问题能独立分析根因，而不是盲目试错。到这个阶段，你已经是团队中比较靠谱的开发者了。

**第三阶段：源码贡献者**——不满足于理解，开始能给开源项目贡献代码，能设计和实现可复用的库或框架。能在多个方案中做权衡，能预见设计决策的长期后果。这个阶段的开发者通常是技术骨干或架构师。

**第四阶段：体系构建者**——有完整的技术体系和方法论，能从零设计大型系统，能定义团队的技术规范，能指导其他人的成长。技术视野不仅局限于代码，还包括工程实践、团队协作、业务理解。

你现在处于哪个阶段并不重要，重要的是**保持学习的心态**。这本书帮你在第二阶段上走了一段路，但路还很长。

## 推荐的进一步学习方向

学完这三本书，你已经打下了坚实的Node.js和JavaScript基础。接下来可以向这些方向深入：

**V8引擎与JavaScript运行时**：深入理解V8的编译流程（Ignition解释器+TurboFan编译器）、垃圾回收机制（Orinoco）、对象内存布局、闭包的底层实现。这会让你对JS性能优化有本质层面的理解。

**计算机网络与分布式系统**：TCP/IP协议栈、HTTP/2、HTTP/3、TLS握手、WebSocket、RPC框架设计、服务发现、负载均衡、分布式一致性（Raft/Paxos）、CAP定理。后端开发的深水区就在这里。

**数据库与存储原理**：B+树索引原理、事务隔离级别（MVCC实现）、查询优化器、WAL日志、分库分表策略、NoSQL存储引擎（LSM Tree）。理解数据库原理让你不再是"只会写SQL"。

**操作系统基础**：进程与线程、内存管理、文件系统、I/O模型（select/poll/epoll）、进程间通信。Node.js的libuv层很多设计直接对应操作系统概念。

**系统设计与架构**：如何设计一个Twitter/短链接/聊天系统这类经典问题，学习高并发、高可用、可扩展系统的设计原则。阅读《Designing Data-Intensive Applications》（数据密集型应用系统设计）是极好的起点。

## 编程是终身学习的旅程

最后，我想分享一点个人感悟。软件行业是一个变化极快的行业——今天流行的框架明天可能就被遗忘，昨天还在追捧的技术后天可能就被淘汰。这种快速变化既让人兴奋，也让人焦虑。

但在快速变化的表面之下，那些真正基础的东西变化得非常慢：数据结构还是那些，算法分析还是那些，操作系统原理还是那些，网络协议栈还是那些，好代码的标准——清晰、简洁、可维护、可测试——更是从未改变。

**内功修炼越深厚，学习新东西就越快**。当你理解了EventEmitter的原理，学RxJS的Observable就轻车熟路；当你理解了闭包和作用域，学任何函数式库都不费力；当你理解了分治和递归，学任何新算法都有基础。这就是为什么说"基础决定上限"。

不要追逐每一个新框架，不要被"30天精通XXX"的标题诱惑。沉下心来，把基础打牢，把原理搞懂，把代码写好。时间会奖励那些坚持深度思考的人。

编程不仅是一份工作，更是一种思维方式，一种和世界对话的方式。用代码解决问题、用逻辑构建系统、用抽象驾驭复杂性——这是一种创造性的活动，和画家作画、作曲家写交响乐没有本质区别。保持好奇心，保持对代码的热爱，享受这个过程。

**编程内功永无止境，愿你在这条路上越走越远。**

本章最后的综合案例，我们用前面学过的多种技术——EventEmitter、Promise、观察者模式、策略模式、compose函数组合、简单的队列和并发控制——实现一个迷你任务调度系统。它不会完美，但它能展示你在这个旅程中收获的能力：将多个知识点融会贯通，从零构建一个有实际用途的工具。
`,
    code: `// ============================================================
// 综合案例：迷你任务调度系统
// 整合知识点：EventEmitter + Promise + 观察者模式 + 策略模式 +
//            compose组合 + 队列 + 并发控制 + 重试机制
// ============================================================

class MiniEmitter {
  constructor() {
    this._events = Object.create(null);
  }

  on(event, fn) {
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(fn);
    return this;
  }

  once(event, fn) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      fn.apply(this, args);
    };
    wrapper._original = fn;
    return this.on(event, wrapper);
  }

  off(event, fn) {
    if (!fn) {
      this._events[event] = [];
      return this;
    }
    const fns = this._events[event];
    if (fns) {
      this._events[event] = fns.filter(f => f !== fn && f._original !== fn);
    }
    return this;
  }

  emit(event, ...args) {
    const fns = this._events[event];
    if (fns) {
      for (const fn of fns) {
        try {
          fn.apply(this, args);
        } catch (err) {
          if (event !== 'error') this.emit('error', err);
        }
      }
    }
    return this;
  }
}

function compose(middlewares) {
  return function(coreFn) {
    let index = -1;
    return dispatch(0);
    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));
      index = i;
      let fn = middlewares[i];
      if (i === middlewares.length) fn = coreFn;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(function next() {
          return dispatch(i + 1);
        }));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}

const retryStrategies = {
  fixed: (delayMs) => () => delayMs,
  linear: (baseMs, increment = baseMs) => (attempt) => baseMs + attempt * increment,
  exponential: (baseMs, factor = 2) => (attempt) => baseMs * Math.pow(factor, attempt),
  immediate: () => () => 0
};

class Task {
  constructor(id, fn, options = {}) {
    this.id = id;
    this.fn = fn;
    this.retries = options.retries || 0;
    this.retryStrategy = options.retryStrategy || retryStrategies.fixed(100);
    this.timeout = options.timeout || 0;
    this.priority = options.priority || 0;
    this.attempt = 0;
    this.status = 'pending';
    this.result = null;
    this.error = null;
    this._resolve = null;
    this._reject = null;
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  run() {
    this.attempt++;
    this.status = 'running';

    let timeoutPromise = null;
    if (this.timeout > 0) {
      timeoutPromise = new Promise((_, reject) => {
        this._timeoutId = setTimeout(() => {
          reject(new Error("Task " + this.id + " timed out after " + this.timeout + "ms"));
        }, this.timeout);
      });
    }

    const runPromise = Promise.resolve().then(() => this.fn());
    const promises = timeoutPromise ? [Promise.race([runPromise, timeoutPromise])] : [runPromise];

    return Promise.race(promises)
      .then(result => {
        if (this._timeoutId) clearTimeout(this._timeoutId);
        this.status = 'success';
        this.result = result;
        this._resolve(result);
        return { success: true, result };
      })
      .catch(error => {
        if (this._timeoutId) clearTimeout(this._timeoutId);
        this.error = error;
        if (this.attempt <= this.retries) {
          this.status = 'retrying';
          const delay = this.retryStrategy(this.attempt - 1);
          return new Promise(resolve => {
            setTimeout(() => resolve({ success: false, retry: true, error }), delay);
          });
        } else {
          this.status = 'failed';
          this._reject(error);
          return { success: false, retry: false, error };
        }
      });
  }

  then(onFulfilled, onRejected) {
    return this._promise.then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this._promise.catch(onRejected);
  }
}

class TaskScheduler extends MiniEmitter {
  constructor(options = {}) {
    super();
    this.concurrency = options.concurrency || 3;
    this.running = 0;
    this.queue = [];
    this.completed = 0;
    this.failed = 0;
    this.taskIdCounter = 0;
    this.middlewares = [];
    this.isPaused = false;
  }

  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  addTask(fn, options = {}) {
    const id = "task-" + (++this.taskIdCounter);
    const task = new Task(id, fn, options);
    const insertIdx = this.queue.findIndex(t => t.priority < task.priority);
    if (insertIdx === -1) {
      this.queue.push(task);
    } else {
      this.queue.splice(insertIdx, 0, task);
    }
    this.emit('taskAdded', { id, waiting: this.queue.length });
    this._next();
    return task;
  }

  async _next() {
    if (this.isPaused) return;
    while (this.running < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift();
      this.running++;
      this._runTask(task);
    }
    if (this.running === 0 && this.queue.length === 0) {
      this.emit('drain', { completed: this.completed, failed: this.failed });
    }
  }

  async _runTask(task) {
    this.emit('taskStart', { id: task.id, attempt: task.attempt, running: this.running });
    let result;
    do {
      let runResult;
      if (this.middlewares.length > 0) {
        const fn = compose(this.middlewares);
        runResult = await fn(() => task.run());
      } else {
        runResult = await task.run();
      }
      result = runResult;
      if (result.success) {
        this.completed++;
        this.emit('taskSuccess', { id: task.id, result: result.result, attempt: task.attempt });
        break;
      } else if (result.retry) {
        this.emit('taskRetry', { id: task.id, attempt: task.attempt, error: result.error.message });
      } else {
        this.failed++;
        this.emit('taskFail', { id: task.id, error: result.error, attempt: task.attempt });
        break;
      }
    } while (true);
    this.running--;
    this._next();
  }

  pause() {
    this.isPaused = true;
    this.emit('pause');
  }

  resume() {
    this.isPaused = false;
    this.emit('resume');
    this._next();
  }

  getStats() {
    return {
      concurrency: this.concurrency,
      running: this.running,
      waiting: this.queue.length,
      completed: this.completed,
      failed: this.failed,
      total: this.completed + this.failed + this.running + this.queue.length
    };
  }
}

const delay = (ms, shouldFail = false, result) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("模拟失败"));
      } else {
        resolve(result || "ok");
      }
    }, ms);
  });
};

console.log("========================================");
console.log("  综合案例：迷你任务调度系统");
console.log("========================================");

const scheduler = new TaskScheduler({ concurrency: 2 });

scheduler.use(async (next) => {
  const start = Date.now();
  console.log("    [中间件] 任务开始执行");
  try {
    const result = await next();
    console.log("    [中间件] 任务执行成功，耗时 " + (Date.now() - start) + "ms");
    return result;
  } catch (err) {
    console.log("    [中间件] 任务失败: " + err.message);
    throw err;
  }
});

const eventLog = [];
const logEvent = (name, data) => {
  eventLog.push({ time: Date.now(), name, data: JSON.stringify(data) });
};

scheduler.on('taskAdded', (d) => logEvent('added', d));
scheduler.on('taskStart', (d) => console.log("  ▶️  " + d.id + " 开始执行（第" + d.attempt + "次尝试）"));
scheduler.on('taskSuccess', (d) => console.log("  ✅ " + d.id + " 成功，尝试次数: " + d.attempt));
scheduler.on('taskRetry', (d) => console.log("  🔄 " + d.id + " 第" + d.attempt + "次失败(" + d.error + ")，准备重试..."));
scheduler.on('taskFail', (d) => console.log("  ❌ " + d.id + " 最终失败: " + d.error.message));

console.log("\\n--- 添加任务（并发数=2，部分任务会失败重试）---");

const task1 = scheduler.addTask(
  () => delay(200, false, "任务1结果"),
  { retries: 2 }
);

const task2 = scheduler.addTask(
  () => delay(150, false, "任务2结果"),
  { priority: 5 }
);

let attemptCount = 0;
const task3 = scheduler.addTask(
  () => {
    attemptCount++;
    return delay(100, attemptCount < 2, "任务3结果-第" + attemptCount + "次");
  },
  { retries: 3, retryStrategy: retryStrategies.exponential(50), timeout: 2000 }
);

const task4 = scheduler.addTask(
  () => delay(100, false, "任务4结果"),
  { priority: 10 }
);

let task5Calls = 0;
const task5 = scheduler.addTask(
  () => {
    task5Calls++;
    if (task5Calls <= 5) {
      return delay(80, true);
    }
    return delay(80, false, "任务5最终成功");
  },
  { retries: 10, retryStrategy: retryStrategies.linear(30) }
);

const results = [];
Promise.allSettled([task1, task2, task3, task4, task5].map(t => t.catch(e => e)))
  .then(res => {
    results.push(...res);
  });

const statusInterval = setInterval(() => {
  const stats = scheduler.getStats();
  if (stats.waiting === 0 && stats.running === 0) {
    clearInterval(statusInterval);
    console.log("\\n--- 最终统计 ---");
    console.log("  完成:", stats.completed, "失败:", stats.failed);
    console.log("\\n🎉 综合案例演示完成！这是本系列教程的最后一个示例。");
    console.log("   感谢你的学习，编程内功永无止境！");
  }
}, 80);
`
  }
];
