// =============================================================
// LeetCode 面试算法 200 题 —— 第八批章节（栈与队列组，共 10 题）
// -------------------------------------------------------------
// 覆盖：有效括号 / 最小栈 / 栈实现队列 / 队列实现栈 / 逆波兰求值
//       字符串解码 / 每日温度 / 下一个更大元素 / 柱状图最大矩形
// 每题包含：题目描述 / 思路讲解 / Python 实现 / JS 实现 / 复杂度分析 / 拓展
// =============================================================

export const chapters = [
  // =========================================================
  // #20 有效的括号（简单）
  // =========================================================
  {
    id: "lc-71",
    group: "栈与队列",
    icon: "📚",
    title: "#20 有效的括号（简单）",
    content: `## 题目

**LeetCode #20 有效的括号** | 难度：简单

给定一个只包括 \`(\`、\`)\`、\`{\`、\`}\`、\`[\`、\`]\` 的字符串 \`s\`，判断字符串是否有效。有效字符串需满足：左括号必须用相同类型的右括号闭合，且左括号必须以正确的顺序闭合。

**示例：**
- 输入：\`s = "()[]{}"\`
- 输出：\`true\`
- 输入：\`s = "([)]"\`
- 输出：\`false\`

## 思路

**栈的经典应用：**

括号匹配的本质是"后进先出"，最后一个左括号必须最先被闭合，这正是栈的特性。

**算法步骤：**
1. 遍历字符串每个字符
2. 遇到左括号（\`(\` \`{\` \`[\`）压入栈
3. 遇到右括号时，检查栈顶：
   - 栈为空 → 不匹配（多了右括号）
   - 栈顶左括号与当前右括号不配对 → 不匹配
   - 匹配则弹出栈顶
4. 遍历结束后，栈为空则全部匹配，否则有未闭合的左括号

**优化技巧：** 遇到左括号时，可以压入对应的右括号，这样匹配时只需比较栈顶与当前字符是否相等，代码更简洁。

## Python 实现

\`\`\`python
class Solution:
    def isValid(self, s):
        # 左右括号映射
        pairs = {')': '(', '}': '{', ']': '['}
        stack = []
        for ch in s:
            if ch in pairs:  # 右括号
                # 栈空或栈顶不匹配则无效
                if not stack or stack[-1] != pairs[ch]:
                    return False
                stack.pop()
            else:  # 左括号压栈
                stack.append(ch)
        # 栈空则全部匹配
        return not stack
\`\`\`

## JavaScript 实现

\`\`\`javascript
var isValid = function(s) {
    // 左右括号映射
    const pairs = { ')': '(', '}': '{', ']': '[' };
    const stack = [];
    for (const ch of s) {
        if (ch in pairs) {  // 右括号
            // 栈空或栈顶不匹配则无效
            if (stack.length === 0 || stack[stack.length - 1] !== pairs[ch]) {
                return false;
            }
            stack.pop();
        } else {  // 左括号压栈
            stack.push(ch);
        }
    }
    // 栈空则全部匹配
    return stack.length === 0;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，遍历一次字符串
- 空间复杂度：O(n)，最坏情况栈存全部左括号

## 拓展

- **相关题目**：#32 最长有效括号（动态规划 / 栈）、#1249 移除无效括号
- **变体**：含通配符的括号匹配（#678），通配符可当任意括号
- **应用**：编译器语法分析、HTML/XML 标签匹配都基于此原理
`,
  },

  // =========================================================
  // #155 最小栈（中等）
  // =========================================================
  {
    id: "lc-72",
    group: "栈与队列",
    icon: "📚",
    title: "#155 最小栈（中等）",
    content: `## 题目

**LeetCode #155 最小栈** | 难度：中等

设计一个支持 \`push\`、\`pop\`、\`top\` 操作，并能在常数时间内检索到最小元素的栈。

**示例：**
- 输入：\`["MinStack","push","push","push","getMin","pop","top","getMin"]\`
- 输出：\`[null,null,null,null,-3,null,0,-2]\`

## 思路

要求 \`getMin\` 在 O(1) 时间内完成，关键在于**维护一个辅助栈**记录最小值。

**辅助栈法：**
1. 主栈 \`stack\` 存储所有元素
2. 辅助栈 \`minStack\` 存储每个状态对应的最小值
3. \`push(x)\`：主栈压入 x；若 \`minStack\` 为空或 x <= 栈顶，则压入 x，否则压入当前栈顶（保持同步长度）
4. \`pop()\`：两栈同时弹出
5. \`getMin()\`：返回 \`minStack\` 栈顶

**关键点：** push 时辅助栈压入的是"当前状态下的最小值"，这样 pop 时辅助栈同步弹出，栈顶始终对应剩余元素的最小值。

**优化变体：** 辅助栈只在 x <= 当前最小值时压入（更省空间），但 pop 时需判断是否要同步弹出辅助栈。

## Python 实现

\`\`\`python
class MinStack:
    def __init__(self):
        self.stack = []      # 主栈
        self.min_stack = []  # 辅助栈，存每个状态的最小值

    def push(self, val):
        self.stack.append(val)
        # 辅助栈为空或新值更小则压入新值，否则压入当前最小值
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)
        else:
            self.min_stack.append(self.min_stack[-1])

    def pop(self):
        self.stack.pop()
        self.min_stack.pop()

    def top(self):
        return self.stack[-1]

    def getMin(self):
        return self.min_stack[-1]
\`\`\`

## JavaScript 实现

\`\`\`javascript
var MinStack = function() {
    this.stack = [];       // 主栈
    this.minStack = [];    // 辅助栈，存每个状态的最小值
};

MinStack.prototype.push = function(val) {
    this.stack.push(val);
    // 辅助栈为空或新值更小则压入新值，否则压入当前最小值
    if (this.minStack.length === 0 || val <= this.minStack[this.minStack.length - 1]) {
        this.minStack.push(val);
    } else {
        this.minStack.push(this.minStack[this.minStack.length - 1]);
    }
};

MinStack.prototype.pop = function() {
    this.stack.pop();
    this.minStack.pop();
};

MinStack.prototype.top = function() {
    return this.stack[this.stack.length - 1];
};

MinStack.prototype.getMin = function() {
    return this.minStack[this.minStack.length - 1];
};
\`\`\`

## 复杂度

- 时间复杂度：所有操作均为 O(1)
- 空间复杂度：O(n)，辅助栈与主栈等长

## 拓展

- **优化空间**：辅助栈仅在最小值变化时压入，可减少空间，但 pop 逻辑稍复杂
- **相关题目**：#716 最大栈（双向操作的栈）、#232 用栈实现队列
- **面试要点**：辅助栈是"空间换时间"思想的典型体现
`,
  },

  // =========================================================
  // #232 用栈实现队列（简单）
  // =========================================================
  {
    id: "lc-73",
    group: "栈与队列",
    icon: "📚",
    title: "#232 用栈实现队列（简单）",
    content: `## 题目

**LeetCode #232 用栈实现队列** | 难度：简单

请你仅使用两个栈实现先入先出队列。队列应当支持一般队列支持的所有操作（\`push\`、\`pop\`、\`peek\`、\`empty\`）。

**示例：**
- 输入：\`["MyQueue","push","push","peek","pop","empty"]\`，\`[[],[1],[2],[],[],[]]\`
- 输出：\`[null,null,null,1,1,false]\`

## 思路

栈是后进先出（LIFO），队列是先进先出（FIFO）。用一个栈无法实现队列，但用**两个栈配合**可以。

**双栈法：**
1. \`inStack\`（输入栈）：负责接收 push 的元素
2. \`outStack\`（输出栈）：负责 pop 和 peek
3. \`push(x)\`：直接压入 inStack
4. \`pop()\` / \`peek()\`：若 outStack 为空，则把 inStack 的元素**全部**倒入 outStack（注意是全部倒，顺序正好反转一次），再从 outStack 弹出
5. 两次反转（inStack 一次、倒入 outStack 一次）正好抵消，实现了先进先出

**关键点：** 倒栈操作必须**一次性倒完**所有元素，且只在 outStack 为空时才倒，这样保证 outStack 中的元素顺序正确。

**均摊复杂度：** 每个元素最多被压入和弹出各两次，所以 push/pop 的均摊时间复杂度为 O(1)。

## Python 实现

\`\`\`python
class MyQueue:
    def __init__(self):
        self.in_stack = []   # 输入栈
        self.out_stack = []  # 输出栈

    def push(self, x):
        self.in_stack.append(x)

    def pop(self):
        self.peek()  # 确保 out_stack 非空
        return self.out_stack.pop()

    def peek(self):
        # out_stack 为空时，把 in_stack 全部倒入
        if not self.out_stack:
            while self.in_stack:
                self.out_stack.append(self.in_stack.pop())
        return self.out_stack[-1]

    def empty(self):
        return not self.in_stack and not self.out_stack
\`\`\`

## JavaScript 实现

\`\`\`javascript
var MyQueue = function() {
    this.inStack = [];    // 输入栈
    this.outStack = [];   // 输出栈
};

MyQueue.prototype.push = function(x) {
    this.inStack.push(x);
};

MyQueue.prototype.pop = function() {
    this.peek();  // 确保 outStack 非空
    return this.outStack.pop();
};

MyQueue.prototype.peek = function() {
    // outStack 为空时，把 inStack 全部倒入
    if (this.outStack.length === 0) {
        while (this.inStack.length > 0) {
            this.outStack.push(this.inStack.pop());
        }
    }
    return this.outStack[this.outStack.length - 1];
};

MyQueue.prototype.empty = function() {
    return this.inStack.length === 0 && this.outStack.length === 0;
};
\`\`\`

## 复杂度

- 时间复杂度：push O(1)；pop/peek 均摊 O(1)（最坏单次 O(n)）
- 空间复杂度：O(n)，两个栈共存 n 个元素

## 拓展

- **相关题目**：#225 用队列实现栈（反向问题）
- **均摊分析**：理解为何均摊 O(1) 是面试常考点
- **应用场景**：两个栈实现队列是数据结构设计的经典题
`,
  },

  // =========================================================
  // #225 用队列实现栈（简单）
  // =========================================================
  {
    id: "lc-74",
    group: "栈与队列",
    icon: "📚",
    title: "#225 用队列实现栈（简单）",
    content: `## 题目

**LeetCode #225 用队列实现栈** | 难度：简单

请你仅使用一个队列实现一个后入先出（LIFO）的栈，并支持普通栈的全部操作（\`push\`、\`pop\`、\`top\`、\`empty\`）。

**示例：**
- 输入：\`["MyStack","push","push","top","pop","empty"]\`，\`[[],[1],[2],[],[],[]]\`
- 输出：\`[null,null,null,2,2,false]\`

## 思路

栈是后进先出，队列是先进先出。用队列实现栈，需要在 push 时就调整好顺序。

**单队列法：**
1. push(x) 时：先把 x 入队，然后把 x 前面的所有元素依次出队再入队（循环 size-1 次）
2. 这样 x 就被移到了队首，pop 时直接出队即可
3. top 返回队首元素（不出队）
4. empty 判断队列是否为空

**举例：** 队列 [1,2,3]，push(4)：
- 4 入队 → [1,2,3,4]
- 前面 3 个依次出队入队 → [4,1,2,3]
- 现在 4 在队首，pop 直接取出

**双队列法：** 用辅助队列临时保存元素，思路类似但稍复杂。单队列法更简洁，推荐使用。

## Python 实现

\`\`\`python
from collections import deque

class MyStack:
    def __init__(self):
        self.queue = deque()

    def push(self, x):
        # 先入队，再把前面的元素依次出队入队
        self.queue.append(x)
        for _ in range(len(self.queue) - 1):
            self.queue.append(self.queue.popleft())

    def pop(self):
        return self.queue.popleft()

    def top(self):
        return self.queue[0]

    def empty(self):
        return len(self.queue) == 0
\`\`\`

## JavaScript 实现

\`\`\`javascript
var MyStack = function() {
    this.queue = [];
};

MyStack.prototype.push = function(x) {
    // 先入队，再把前面的元素依次出队入队
    this.queue.push(x);
    for (let i = 0; i < this.queue.length - 1; i++) {
        this.queue.push(this.queue.shift());
    }
};

MyStack.prototype.pop = function() {
    return this.queue.shift();
};

MyStack.prototype.top = function() {
    return this.queue[0];
};

MyStack.prototype.empty = function() {
    return this.queue.length === 0;
};
\`\`\`

## 复杂度

- 时间复杂度：push O(n)（需移动 n-1 个元素）；pop/top/empty O(1)
- 空间复杂度：O(n)

## 拓展

- **优化方向**：也可让 pop 为 O(n)、push 为 O(1)，看哪个操作更频繁
- **相关题目**：#232 用栈实现队列（反向问题）
- **注意**：JS 的 \`shift()\` 本身是 O(n)，本题严格说用数组实现并不完美，面试可说明
`,
  },

  // =========================================================
  // #150 逆波兰表达式求值（中等）
  // =========================================================
  {
    id: "lc-75",
    group: "栈与队列",
    icon: "📚",
    title: "#150 逆波兰表达式求值（中等）",
    content: `## 题目

**LeetCode #150 逆波兰表达式求值** | 难度：中等

根据逆波兰表示法，求表达式的值。有效的运算符包括 \`+\`、\`-\`、\`*\`、\`/\`。每个运算对象可以是整数，也可以是另一个逆波兰表达式。**注意**两个整数之间的除法只保留整数部分（向零截断）。

**示例：**
- 输入：\`tokens = ["2","1","+","3","*"]\`
- 输出：\`9\`（即 (2 + 1) * 3 = 9）

## 思路

逆波兰表达式（后缀表达式）天然适合用**栈**求值。

**算法步骤：**
1. 遍历 tokens
2. 遇到数字：压入栈
3. 遇到运算符：弹出栈顶两个元素，**先弹出的是右操作数，后弹出的是左操作数**（顺序很重要！）
4. 计算 \`左 op 右\`，结果压回栈
5. 遍历结束，栈中唯一元素即为答案

**为什么后缀表达式不需要括号？** 因为运算符的位置已经隐含了运算优先级，栈的天然结构保证了运算顺序。

**注意点：**
- 除法向零截断：Python 用 \`int(a / b)\`，JS 用 \`Math.trunc(a / b)\`
- 减法和除法操作数顺序：\`b - a\` 不是 \`a - b\`

## Python 实现

\`\`\`python
class Solution:
    def evalRPN(self, tokens):
        stack = []
        for token in tokens:
            if token in '+-*/':
                # 先弹出的是右操作数，后弹出的是左操作数
                b = stack.pop()
                a = stack.pop()
                if token == '+':
                    stack.append(a + b)
                elif token == '-':
                    stack.append(a - b)
                elif token == '*':
                    stack.append(a * b)
                else:  # 除法向零截断
                    stack.append(int(a / b))
            else:
                stack.append(int(token))
        return stack[0]
\`\`\`

## JavaScript 实现

\`\`\`javascript
var evalRPN = function(tokens) {
    const stack = [];
    for (const token of tokens) {
        if (token === '+' || token === '-' || token === '*' || token === '/') {
            // 先弹出的是右操作数，后弹出的是左操作数
            const b = stack.pop();
            const a = stack.pop();
            if (token === '+') stack.push(a + b);
            else if (token === '-') stack.push(a - b);
            else if (token === '*') stack.push(a * b);
            else stack.push(Math.trunc(a / b));  // 除法向零截断
        } else {
            stack.push(parseInt(token, 10));
        }
    }
    return stack[0];
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，遍历一次 tokens
- 空间复杂度：O(n)，栈最多存一半的数字

## 拓展

- **相关题目**：#224 基本计算器（中缀表达式，需处理括号和优先级）
- **中缀转后缀**：调度场算法（Shunting Yard）将中缀表达式转为后缀
- **应用**：逆波兰表达式是栈式虚拟机的基础，编译器后端常用
`,
  },

  // =========================================================
  // #394 字符串解码（中等）
  // =========================================================
  {
    id: "lc-76",
    group: "栈与队列",
    icon: "📚",
    title: "#394 字符串解码（中等）",
    content: `## 题目

**LeetCode #394 字符串解码** | 难度：中等

给定一个经过编码的字符串，返回它解码后的字符串。编码规则为：\`k[encoded_string]\`，表示其中 encoded_string 部分重复 k 次。

**示例：**
- 输入：\`s = "3[a2[c]]"\`
- 输出：\`"accaccacc"\`
- 输入：\`s = "2[abc]3[cd]ef"\`
- 输出：\`"abcabccdcdcdef"\`

## 思路

嵌套结构 \`k[...]\` 天然适合用**栈**处理，遇到嵌套时保存外层状态，处理完内层再合并。

**双栈法：**
1. \`strStack\`：保存外层字符串
2. \`numStack\`：保存外层重复次数
3. 维护当前字符串 \`curr\` 和当前数字 \`num\`
4. 遍历字符串：
   - 数字：累积到 \`num\`（注意多位数）
   - \`[\`：把当前 \`curr\` 和 \`num\` 压栈，重置 curr 和 num
   - \`]\`：弹出 numStack 和 strStack，将 curr 重复 num 次拼接到外层字符串后
   - 字母：拼到 \`curr\`

**举例：\`"3[a2[c]]"\`**
- 遇到 \`3[\`：压栈（"", 3），curr 重置
- 遇到 \`a\`：curr = "a"
- 遇到 \`2[\`：压栈（"a", 2），curr 重置
- 遇到 \`c\`：curr = "c"
- 遇到 \`]\`：弹出（"a", 2），curr = "a" + "c"*2 = "acc"
- 遇到 \`]\`：弹出（"", 3），curr = "" + "acc"*3 = "accaccacc"

## Python 实现

\`\`\`python
class Solution:
    def decodeString(self, s):
        str_stack = []  # 存外层字符串
        num_stack = []  # 存外层重复次数
        curr = ""       # 当前字符串
        num = 0         # 当前数字
        for ch in s:
            if ch.isdigit():
                num = num * 10 + int(ch)  # 处理多位数
            elif ch == '[':
                # 进入新一层，保存外层状态
                str_stack.append(curr)
                num_stack.append(num)
                curr = ""
                num = 0
            elif ch == ']':
                # 退出当前层，合并到外层
                prev_str = str_stack.pop()
                repeat = num_stack.pop()
                curr = prev_str + curr * repeat
            else:
                curr += ch
        return curr
\`\`\`

## JavaScript 实现

\`\`\`javascript
var decodeString = function(s) {
    const strStack = [];  // 存外层字符串
    const numStack = [];  // 存外层重复次数
    let curr = '';        // 当前字符串
    let num = 0;          // 当前数字
    for (const ch of s) {
        if (ch >= '0' && ch <= '9') {
            num = num * 10 + parseInt(ch, 10);  // 处理多位数
        } else if (ch === '[') {
            // 进入新一层，保存外层状态
            strStack.push(curr);
            numStack.push(num);
            curr = '';
            num = 0;
        } else if (ch === ']') {
            // 退出当前层，合并到外层
            const prevStr = strStack.pop();
            const repeat = numStack.pop();
            curr = prevStr + curr.repeat(repeat);
        } else {
            curr += ch;
        }
    }
    return curr;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n * maxK)，n 为字符串长度，maxK 为最大重复次数（解码后长度）
- 空间复杂度：O(n)，栈空间

## 拓展

- **递归解法**：遇到 \`[\` 递归处理，遇到 \`]\` 返回，思路类似
- **相关题目**：#71 简化路径（栈处理路径）、#856 括号的分数
- **注意**：数字可能是多位数，必须累积计算
`,
  },

  // =========================================================
  // #739 每日温度（中等）
  // =========================================================
  {
    id: "lc-77",
    group: "栈与队列",
    icon: "📚",
    title: "#739 每日温度（中等）",
    content: `## 题目

**LeetCode #739 每日温度** | 难度：中等

给定一个整数数组 \`temperatures\`，表示每天的温度，返回一个数组 \`answer\`，其中 \`answer[i]\` 是指对于第 \`i\` 天，下一个更高温度出现在几天后。如果此后没有更高的温度，则 \`answer[i] == 0\`。

**示例：**
- 输入：\`temperatures = [73,74,75,71,69,72,76,73]\`
- 输出：\`[1,1,4,2,1,1,0,0]\`

## 思路

这是**单调栈**的经典应用。目标是找每个元素右边第一个更大的元素。

**单调栈法：**
1. 维护一个**单调递减栈**（栈中存索引，对应温度递减）
2. 遍历数组，对每个温度 \`T[i]\`：
   - 当栈非空且 \`T[i] > T[栈顶]\` 时，弹出栈顶索引 \`idx\`
   - \`answer[idx] = i - idx\`（找到右边第一个更高温度）
   - 重复直到栈顶温度不小于当前温度
3. 当前索引 \`i\` 压入栈
4. 遍历结束，栈中剩余索引的 answer 为 0（默认）

**为什么单调递减？** 栈中存的是"还没找到更高温度"的索引，保持温度递减意味着一旦遇到更高温度，就能确定栈中若干元素的答案。

**举例：** \`[73,74]\` → 73 入栈，74 > 73 弹出，answer[0] = 1。

## Python 实现

\`\`\`python
class Solution:
    def dailyTemperatures(self, temperatures):
        n = len(temperatures)
        answer = [0] * n
        stack = []  # 单调递减栈，存索引
        for i in range(n):
            # 当前温度大于栈顶温度，弹出并记录答案
            while stack and temperatures[i] > temperatures[stack[-1]]:
                idx = stack.pop()
                answer[idx] = i - idx
            stack.append(i)
        # 栈中剩余元素 answer 默认为 0
        return answer
\`\`\`

## JavaScript 实现

\`\`\`javascript
var dailyTemperatures = function(temperatures) {
    const n = temperatures.length;
    const answer = new Array(n).fill(0);
    const stack = [];  // 单调递减栈，存索引
    for (let i = 0; i < n; i++) {
        // 当前温度大于栈顶温度，弹出并记录答案
        while (stack.length > 0 && temperatures[i] > temperatures[stack[stack.length - 1]]) {
            const idx = stack.pop();
            answer[idx] = i - idx;
        }
        stack.push(i);
    }
    // 栈中剩余元素 answer 默认为 0
    return answer;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，每个元素最多入栈出栈各一次
- 空间复杂度：O(n)，栈空间

## 拓展

- **单调栈模板**：找"下一个更大/更小元素"的标准套路
- **相关题目**：#496 下一个更大元素 I、#503 下一个更大元素 II、#84 柱状图最大矩形
- **变种**：找左边第一个更大元素（反向遍历）、找下一个更小元素（单调递增栈）
`,
  },

  // =========================================================
  // #496 下一个更大元素 I（简单）
  // =========================================================
  {
    id: "lc-78",
    group: "栈与队列",
    icon: "📚",
    title: "#496 下一个更大元素 I（简单）",
    content: `## 题目

**LeetCode #496 下一个更大元素 I** | 难度：简单

\`nums1\` 是 \`nums2\` 的子集。对于 \`nums1\` 中每个元素 \`x\`，在 \`nums2\` 中找到 \`x\` 右边第一个比 \`x\` 大的元素。如果不存在，返回 -1。

**示例：**
- 输入：\`nums1 = [4,1,2]\`，\`nums2 = [1,3,4,2]\`
- 输出：\`[-1,3,-1]\`

## 思路

这道题是 #739 的变体，关键在于 nums2 中找下一个更大元素，再映射回 nums1。

**单调栈 + 哈希表：**
1. 先用单调栈处理 \`nums2\`，对每个元素求出"下一个更大元素"
2. 用哈希表存储：\`{元素值: 下一个更大元素值}\`
3. 遍历 \`nums1\`，从哈希表中查表即可

**单调栈处理 nums2：**
1. 维护单调递减栈（存值或索引都可，这里存值）
2. 遍历 nums2，当前元素 \`num\` 大于栈顶时，弹出栈顶，记录 \`{栈顶: num}`
3. 当前元素压栈
4. 遍历结束后，栈中剩余元素没有下一个更大元素，哈希表不记录（默认 -1）

这样 nums2 只需遍历一次，nums1 查表 O(1)。

## Python 实现

\`\`\`python
class Solution:
    def nextGreaterElement(self, nums1, nums2):
        # 哈希表：元素 -> 下一个更大元素
        next_greater = {}
        stack = []  # 单调递减栈
        for num in nums2:
            # 当前元素大于栈顶，记录栈顶的下一个更大元素
            while stack and num > stack[-1]:
                next_greater[stack.pop()] = num
            stack.append(num)
        # 栈中剩余元素无下一个更大，默认 -1
        return [next_greater.get(x, -1) for x in nums1]
\`\`\`

## JavaScript 实现

\`\`\`javascript
var nextGreaterElement = function(nums1, nums2) {
    // 哈希表：元素 -> 下一个更大元素
    const nextGreater = new Map();
    const stack = [];  // 单调递减栈
    for (const num of nums2) {
        // 当前元素大于栈顶，记录栈顶的下一个更大元素
        while (stack.length > 0 && num > stack[stack.length - 1]) {
            nextGreater.set(stack.pop(), num);
        }
        stack.push(num);
    }
    // 栈中剩余元素无下一个更大，默认 -1
    return nums1.map(x => nextGreater.get(x) ?? -1);
};
\`\`\`

## 复杂度

- 时间复杂度：O(n + m)，n 为 nums2 长度，m 为 nums1 长度
- 空间复杂度：O(n)，哈希表和栈

## 拓展

- **相关题目**：#503 下一个更大元素 II（循环数组）、#739 每日温度
- **单调栈精髓**：先对长数组预处理，再用哈希表加速查询
- **变体**：若元素有重复，需用索引而非值作为键
`,
  },

  // =========================================================
  // #503 下一个更大元素 II（中等）
  // =========================================================
  {
    id: "lc-79",
    group: "栈与队列",
    icon: "📚",
    title: "#503 下一个更大元素 II（中等）",
    content: `## 题目

**LeetCode #503 下一个更大元素 II** | 难度：中等

给定一个**循环数组** \`nums\`（\`nums[nums.length - 1]\` 的下一个元素是 \`nums[0]\`），返回每个元素的下一个更大元素。如果不存在，返回 -1。

**示例：**
- 输入：\`nums = [1,2,1]\`
- 输出：\`[2,-1,2]\`（最后一个 1 的下一个更大元素是循环后的 2）

## 思路

循环数组的处理技巧是**遍历两遍**（即模拟环形），用单调栈。

**单调栈法：**
1. 将数组逻辑上拼接两次：\`[1,2,1,1,2,1]\`
2. 实际无需真正拼接，用 \`i % n\` 取模即可遍历 2n 次
3. 维护单调递减栈（存索引）
4. 第一遍（i < n）：找下一个更大元素，正常处理
5. 第二遍（n <= i < 2n）：继续找剩余元素的下一个更大元素，但**不重新入栈**（避免重复）
6. 栈中剩余元素 answer 为 -1

**关键点：**
- 遍历 2n 次，用 \`i % n\` 访问元素
- 第二遍时只为栈中"未找到答案"的元素找答案，不再压栈（因为已经处理过所有元素）

**举例：\`[1,2,1]\`**
- i=0：1 入栈 [0]
- i=1：2 > 1，弹出 0，answer[0]=2；2 入栈 [1]
- i=2：1 入栈 [1,2]
- i=3（即 %3=0）：2 > 栈顶 1，弹出 2，answer[2]=2；2 不大于栈顶 2，停止
- i=4（即 %3=1）：2 不大于 2，停止
- i=5：结束
- answer = [2, -1, 2]

## Python 实现

\`\`\`python
class Solution:
    def nextGreaterElements(self, nums):
        n = len(nums)
        answer = [-1] * n
        stack = []  # 单调递减栈，存索引
        # 遍历两遍模拟循环
        for i in range(2 * n):
            num = nums[i % n]
            # 当前元素大于栈顶，弹出并记录答案
            while stack and num > nums[stack[-1]]:
                answer[stack.pop()] = num
            # 第一遍才入栈，避免重复
            if i < n:
                stack.append(i)
        return answer
\`\`\`

## JavaScript 实现

\`\`\`javascript
var nextGreaterElements = function(nums) {
    const n = nums.length;
    const answer = new Array(n).fill(-1);
    const stack = [];  // 单调递减栈，存索引
    // 遍历两遍模拟循环
    for (let i = 0; i < 2 * n; i++) {
        const num = nums[i % n];
        // 当前元素大于栈顶，弹出并记录答案
        while (stack.length > 0 && num > nums[stack[stack.length - 1]]) {
            answer[stack.pop()] = num;
        }
        // 第一遍才入栈，避免重复
        if (i < n) {
            stack.push(i);
        }
    }
    return answer;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，遍历 2n 次，每个元素入栈出栈各一次
- 空间复杂度：O(n)，栈空间

## 拓展

- **循环数组通用技巧**：取模遍历 2n 次，适用于各类循环数组问题
- **相关题目**：#496 下一个更大元素 I、#739 每日温度
- **优化**：也可拼接数组遍历，但取模法更省空间
`,
  },

  // =========================================================
  // #84 柱状图中最大的矩形（困难）
  // =========================================================
  {
    id: "lc-80",
    group: "栈与队列",
    icon: "📚",
    title: "#84 柱状图中最大的矩形（困难）",
    content: `## 题目

**LeetCode #84 柱状图中最大的矩形** | 难度：困难

给定 \`n\` 个非负整数，用来表示柱状图中各个柱子的高度。每个柱子彼此相邻，且宽度为 1。求在该柱状图中，能够勾勒出来的矩形的最大面积。

**示例：**
- 输入：\`heights = [2,1,5,6,2,3]\`
- 输出：\`10\`（高度为 5 和 6 的两根柱子组成的矩形，面积 5*2=10）

## 思路

这是**单调栈的经典难题**。核心是：对每根柱子，找到它左右两边第一个**比它矮**的柱子，确定它作为高的矩形能延伸的最大宽度。

**单调栈法：**
1. 维护一个**单调递增栈**（存索引，对应高度递增）
2. 遍历每根柱子：
   - 当当前高度 < 栈顶高度时，弹出栈顶 \`idx\`
   - 此时当前柱子是弹出柱子**右边第一个更矮**的柱子
   - 弹出后新的栈顶是它**左边第一个更矮**的柱子
   - 宽度 = \`right - left - 1\`，面积 = \`heights[idx] * 宽度`
   - 更新最大面积
3. 当前索引压栈
4. 遍历结束后处理栈中剩余元素（右边无更矮柱子，right = n）

**哨兵技巧：** 在数组首尾各加一个高度为 0 的哨兵柱，省去边界判断和末尾单独处理。

**举例：\`[2,1,5,6,2,3]\`** → 加哨兵 \`[0,2,1,5,6,2,3,0]\`
- 遍历到末尾 0 时，依次弹出 6、5、2 等计算面积，最终最大值为 10。

## Python 实现

\`\`\`python
class Solution:
    def largestRectangleArea(self, heights):
        # 首尾加哨兵 0，简化边界处理
        heights = [0] + heights + [0]
        n = len(heights)
        stack = []  # 单调递增栈，存索引
        max_area = 0
        for i in range(n):
            # 当前高度小于栈顶，弹出并计算面积
            while stack and heights[i] < heights[stack[-1]]:
                h = heights[stack.pop()]
                # 宽度 = 当前位置 - 新栈顶 - 1
                w = i - stack[-1] - 1
                max_area = max(max_area, h * w)
            stack.append(i)
        return max_area
\`\`\`

## JavaScript 实现

\`\`\`javascript
var largestRectangleArea = function(heights) {
    // 首尾加哨兵 0，简化边界处理
    heights = [0, ...heights, 0];
    const n = heights.length;
    const stack = [];  // 单调递增栈，存索引
    let maxArea = 0;
    for (let i = 0; i < n; i++) {
        // 当前高度小于栈顶，弹出并计算面积
        while (stack.length > 0 && heights[i] < heights[stack[stack.length - 1]]) {
            const h = heights[stack.pop()];
            // 宽度 = 当前位置 - 新栈顶 - 1
            const w = i - stack[stack.length - 1] - 1;
            maxArea = Math.max(maxArea, h * w);
        }
        stack.push(i);
    }
    return maxArea;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，每个元素入栈出栈各一次
- 空间复杂度：O(n)，栈空间

## 拓展

- **相关题目**：#85 最大矩形（二维版本，每行看作柱状图）、#42 接雨水（类似单调栈思路）
- **哨兵技巧**：在数组首尾加极值简化边界，是单调栈题的常用套路
- **面试要点**：本题是单调栈的巅峰题，理解"找左右第一个更小元素"是核心
`,
  },
];
