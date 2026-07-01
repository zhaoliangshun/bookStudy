// =============================================================
// LeetCode 面试算法 200 题 - 第二十批章节（数据结构设计，共 10 题）
// 章节 lc-191 ~ lc-200：循环队列/循环双端队列/RandomizedSet/LRU/LFU/Trie/WordDictionary/RecentCounter/链表/哈希集合
// =============================================================

export const chapters = [
  // =============================================================
  // lc-191 #622 设计循环队列
  // =============================================================
  {
    id: "lc-191",
    group: "数据结构设计",
    icon: "🏗️",
    title: "#622 设计循环队列（中等）",
    content: `## 题目

**LeetCode #622 设计循环队列** | 难度：中等

设计一个循环队列（环形缓冲区）的实现，支持以下操作：
- \`MyCircularQueue(k)\`：构造器，设置队列容量为 k。
- \`Front()\`：从队首获取元素。队列为空返回 -1。
- \`Rear()\`：从队尾获取元素。队列为空返回 -1。
- \`enQueue(value)\`：向循环队列尾部插入一个元素。成功返回 true。
- \`deQueue()\`：从循环队列头部删除一个元素。成功返回 true。
- \`isEmpty()\` / \`isFull()\`：判空 / 判满。

示例：

\`\`\`
输入：
["MyCircularQueue","enQueue","enQueue","enQueue","enQueue","Rear","isFull","deQueue","enQueue","Rear"]
[[3],[1],[2],[3],[4],[],[],[],[4],[]]
输出：[null,true,true,true,false,3,true,true,true,4]
\`\`\`

## 思路

普通数组实现的队列，出队后若不搬移数据就会在前端留下空洞。循环队列让首尾指针「环形复用」已出队的格子，避免搬移，从而所有操作 O(1)。

底层选用**定长数组** + 两个指针 \`front\` / \`rear\` + 一个 \`count\` 计数。为什么用数组而不是链表？数组按下标 O(1) 取首尾，且无需为每个节点存指针，空间紧凑；链表虽也能两端 O(1)，但 \`Rear()\` 取尾需额外维护尾指针，且缓存不友好。

核心难点是**判空与判满的区分**：若只看 \`front == rear\`，空和满无法区分。两种主流方案：
1. **多维护一个 count 变量**：直接用 \`count\` 记录元素个数，判空 \`count==0\`，判满 \`count==capacity\`。逻辑直观，enQueue/deQueue 时增减 count。本题采用。
2. **留一个空位**：数组开 \`k+1\` 长度，约定「rear 的下一格等于 front」为满，\`front==rear\` 为空。省一个 count 变量，但浪费一格空间且边界条件略繁。

指针约定：\`front\` 指向队首元素下标；\`rear\` 指向**队尾下一个待写入位置**（尾元素下标为 \`(rear-1+k)%k\`）。enQueue 写到 rear 再 \`rear=(rear+1)%k\`；deQueue \`front=(front+1)%k\`。所有指针移动都做 \`%k\` 取模，形成环形。

## Python 实现

\`\`\`python
class MyCircularQueue:
    def __init__(self, k: int):
        self.data = [0] * k       # 底层数组，长度 k
        self.front = 0             # 队首下标
        self.rear = 0              # 队尾下一个写入位置
        self.count = 0             # 当前元素个数
        self.cap = k               # 容量

    def enQueue(self, value: int) -> bool:
        if self.isFull():
            return False
        self.data[self.rear] = value              # 写入 rear 位置
        self.rear = (self.rear + 1) % self.cap    # rear 后移并取模
        self.count += 1
        return True

    def deQueue(self) -> bool:
        if self.isEmpty():
            return False
        self.front = (self.front + 1) % self.cap  # front 后移，相当于出队
        self.count -= 1
        return True

    def Front(self) -> int:
        return -1 if self.isEmpty() else self.data[self.front]

    def Rear(self) -> int:
        # 队尾元素位于 rear 的前一个位置
        return -1 if self.isEmpty() else self.data[(self.rear - 1 + self.cap) % self.cap]

    def isEmpty(self) -> bool:
        return self.count == 0

    def isFull(self) -> bool:
        return self.count == self.cap
\`\`\`

## JavaScript 实现

\`\`\`javascript
var MyCircularQueue = function(k) {
    this.data = new Array(k);   // 底层数组
    this.front = 0;              // 队首下标
    this.rear = 0;               // 队尾下一个写入位置
    this.count = 0;              // 当前元素个数
    this.cap = k;               // 容量
};

MyCircularQueue.prototype.enQueue = function(value) {
    if (this.isFull()) return false;
    this.data[this.rear] = value;                // 写入 rear 位置
    this.rear = (this.rear + 1) % this.cap;      // rear 后移并取模
    this.count++;
    return true;
};

MyCircularQueue.prototype.deQueue = function() {
    if (this.isEmpty()) return false;
    this.front = (this.front + 1) % this.cap;    // front 后移，相当于出队
    this.count--;
    return true;
};

MyCircularQueue.prototype.Front = function() {
    return this.isEmpty() ? -1 : this.data[this.front];
};

MyCircularQueue.prototype.Rear = function() {
    // 队尾元素位于 rear 的前一个位置
    return this.isEmpty() ? -1 : this.data[(this.rear - 1 + this.cap) % this.cap];
};

MyCircularQueue.prototype.isEmpty = function() {
    return this.count === 0;
};

MyCircularQueue.prototype.isFull = function() {
    return this.count === this.cap;
};
\`\`\`

## 复杂度

- 时间复杂度：enQueue / deQueue / Front / Rear / isEmpty / isFull 均 O(1)
- 空间复杂度：O(k)

## 拓展

- **留空位法**：数组开 k+1 长度，省去 count 变量但浪费一格空间。
- 相关题：#641 设计循环双端队列（两端都可插删）、#918 环形子数组的最大和。
- 设计要点：循环队列是「数组复用空间」的核心模式，区分判空判满的关键是 count 或留空位。`
  },

  // =============================================================
  // lc-192 #641 设计循环双端队列
  // =============================================================
  {
    id: "lc-192",
    group: "数据结构设计",
    icon: "🏗️",
    title: "#641 设计循环双端队列（中等）",
    content: `## 题目

**LeetCode #641 设计循环双端队列** | 难度：中等

设计实现双端队列（Deque），支持以下操作：
- \`MyCircularDeque(k)\`：构造器，设置双端队列容量为 k。
- \`insertFront(value)\` / \`insertLast(value)\`：头部 / 尾部插入。成功返回 true。
- \`deleteFront()\` / \`deleteLast()\`：头部 / 尾部删除。成功返回 true。
- \`getFront()\` / \`getRear()\`：获取头部 / 尾部元素。为空返回 -1。
- \`isEmpty()\` / \`isFull()\`：判空 / 判满。

示例：

\`\`\`
输入：
["MyCircularDeque","insertLast","insertLast","insertFront","getFront","getRear","deleteFront","deleteLast","isEmpty","isFull"]
[[3],[1],[2],[3],[],[],[],[],[],[]]
输出：[null,true,true,true,3,2,true,true,false,false]
\`\`\`

## 思路

循环双端队列 = 循环队列两端都能插删。底层沿用 #622 的方案：**定长数组** + \`front\` / \`rear\` / \`count\`。为什么仍用数组？双端操作只需把两个指针各自前后移动并取模即可，数组下标 O(1) 访问足以支撑，链表则要额外维护前后向指针，空间与常数更大。

指针约定（与 #622 保持一致）：
- \`front\` 指向队首元素下标。
- \`rear\` 指向**队尾下一个待写入位置**。
- \`count\` 记录当前元素个数，用于区分空与满（判空 \`count==0\`，判满 \`count==capacity\`）。

四种操作的指针移动：
- \`insertLast(value)\`：写 rear，\`rear=(rear+1)%k\`，count++。
- \`deleteFront()\`：\`front=(front+1)%k\`，count--。
- \`insertFront(value)\`：先把 \`front=(front-1+k)%k\`（前移一格，可能绕到数组末尾），再写 front，count++。**先移后写**，因为 front 始终指向已有队首。
- \`deleteLast()\`：\`rear=(rear-1+k)%k\`，count--。**仅移指针**，无需清理数据。

关键陷阱：所有「反向移动」必须 \`+k\` 再 \`%k\`，避免负数取模出错。Python 对负数取模天然正确，但显式 \`+k\` 仍更清晰；JavaScript 的 \`%\` 对负数返回负值，必须 \`+k\`。

## Python 实现

\`\`\`python
class MyCircularDeque:
    def __init__(self, k: int):
        self.data = [0] * k
        self.front = 0          # 队首下标
        self.rear = 0           # 队尾下一个写入位置
        self.count = 0
        self.cap = k

    def insertFront(self, value: int) -> bool:
        if self.isFull():
            return False
        # front 前移一格（绕环），再写入新队首
        self.front = (self.front - 1 + self.cap) % self.cap
        self.data[self.front] = value
        self.count += 1
        return True

    def insertLast(self, value: int) -> bool:
        if self.isFull():
            return False
        self.data[self.rear] = value             # 写入 rear 位置
        self.rear = (self.rear + 1) % self.cap   # rear 后移
        self.count += 1
        return True

    def deleteFront(self) -> bool:
        if self.isEmpty():
            return False
        self.front = (self.front + 1) % self.cap  # front 后移，相当于出队
        self.count -= 1
        return True

    def deleteLast(self) -> bool:
        if self.isEmpty():
            return False
        # rear 前移一格，相当于删掉队尾
        self.rear = (self.rear - 1 + self.cap) % self.cap
        self.count -= 1
        return True

    def getFront(self) -> int:
        return -1 if self.isEmpty() else self.data[self.front]

    def getRear(self) -> int:
        # 队尾元素位于 rear 的前一个位置
        return -1 if self.isEmpty() else self.data[(self.rear - 1 + self.cap) % self.cap]

    def isEmpty(self) -> bool:
        return self.count == 0

    def isFull(self) -> bool:
        return self.count == self.cap
\`\`\`

## JavaScript 实现

\`\`\`javascript
var MyCircularDeque = function(k) {
    this.data = new Array(k);
    this.front = 0;           // 队首下标
    this.rear = 0;            // 队尾下一个写入位置
    this.count = 0;
    this.cap = k;
};

MyCircularDeque.prototype.insertFront = function(value) {
    if (this.isFull()) return false;
    // front 前移一格（绕环），再写入新队首
    this.front = (this.front - 1 + this.cap) % this.cap;
    this.data[this.front] = value;
    this.count++;
    return true;
};

MyCircularDeque.prototype.insertLast = function(value) {
    if (this.isFull()) return false;
    this.data[this.rear] = value;               // 写入 rear 位置
    this.rear = (this.rear + 1) % this.cap;      // rear 后移
    this.count++;
    return true;
};

MyCircularDeque.prototype.deleteFront = function() {
    if (this.isEmpty()) return false;
    this.front = (this.front + 1) % this.cap;   // front 后移，相当于出队
    this.count--;
    return true;
};

MyCircularDeque.prototype.deleteLast = function() {
    if (this.isEmpty()) return false;
    // rear 前移一格，相当于删掉队尾
    this.rear = (this.rear - 1 + this.cap) % this.cap;
    this.count--;
    return true;
};

MyCircularDeque.prototype.getFront = function() {
    return this.isEmpty() ? -1 : this.data[this.front];
};

MyCircularDeque.prototype.getRear = function() {
    // 队尾元素位于 rear 的前一个位置
    return this.isEmpty() ? -1 : this.data[(this.rear - 1 + this.cap) % this.cap];
};

MyCircularDeque.prototype.isEmpty = function() {
    return this.count === 0;
};

MyCircularDeque.prototype.isFull = function() {
    return this.count === this.cap;
};
\`\`\`

## 复杂度

- 时间复杂度：所有操作均 O(1)
- 空间复杂度：O(k)

## 拓展

- #622 设计循环队列（本题的单端版本，先掌握再做本题）。
- Python 直接用 \`collections.deque\` 可近似 O(1) 完成两端操作，但本题旨在手写底层结构。
- 设计要点：循环结构的「反向移动」需 \`+k\` 取模处理负数下标，是循环数组类题的通用陷阱。`
  },

  // =============================================================
  // lc-193 #380 O(1) 时间插入、删除和获取随机元素
  // =============================================================
  {
    id: "lc-193",
    group: "数据结构设计",
    icon: "🏗️",
    title: "#380 O(1) 时间插入、删除和获取随机元素（中等）",
    content: `## 题目

**LeetCode #380 O(1) 时间插入、删除和获取随机元素** | 难度：中等

设计 \`RandomizedSet\` 类，要求所有操作均 **O(1)** 平均时间：
- \`insert(val)\`：元素不存在则插入，返回 true；已存在返回 false。
- \`remove(val)\`：元素存在则删除，返回 true；不存在返回 false。
- \`getRandom()\`：等概率随机返回集合中一个元素。

示例：

\`\`\`
输入：
["RandomizedSet","insert","remove","insert","getRandom","remove","insert","getRandom"]
[[],[1],[2],[2],[],[1],[2],[]]
输出：[null,true,false,true,2,true,false,2]
\`\`\`

## 思路

逐个数据结构看：**哈希表**支持 O(1) insert / remove，但无法 O(1) getRandom（无法按下标随机访问）；**动态数组**支持 O(1) 末尾 insert 与 O(1) getRandom（按下标随机），但删除任意元素需 O(n) 搬移。单独都不行，**组合起来**就行：数组负责支撑 getRandom，哈希表负责支撑 O(1) 定位。

核心数据：
1. \`vals\`：动态数组，存所有元素值。getRandom 直接 \`vals[rand % len]\` 即可。
2. \`valToIdx\`：哈希表，\`val -> 在 vals 中的下标\`。insert/remove 用它 O(1) 定位。

**关键：删除时为何要把末尾元素换到被删位置？** 数组直接删中间元素需把后面所有元素前移 O(n)。为保持 O(1)，做法是先把被删元素与数组**末尾元素**交换，再 pop 末尾。这样只有「被删位置」和「末尾位置」两处发生变化：
- 把末尾元素搬到被删位置；
- 更新末尾元素在哈希表中的下标为「被删位置」；
- pop 掉末尾；
- 哈希表删去被删元素。

末尾元素现在出现在被删位置，逻辑一致；数组无空洞、无搬移；哈希表两项更新都是 O(1)。这就是「删除时把末尾元素换到被删位置」的精妙所在。唯一边界：被删元素本身就是末尾元素时，仅 pop 并删表项即可，故先更新末尾元素下标再 pop（避免把自身写回）。

## Python 实现

\`\`\`python
import random

class RandomizedSet:
    def __init__(self):
        self.vals = []          # 动态数组，存元素值
        self.val_to_idx = {}    # val -> 在 vals 中的下标

    def insert(self, val: int) -> bool:
        if val in self.val_to_idx:
            return False
        self.val_to_idx[val] = len(self.vals)   # 记录下标
        self.vals.append(val)                    # 末尾追加
        return True

    def remove(self, val: int) -> bool:
        if val not in self.val_to_idx:
            return False
        idx = self.val_to_idx[val]               # 被删位置
        last = self.vals[-1]                      # 末尾元素
        # 把末尾元素搬到被删位置，并更新其下标
        self.vals[idx] = last
        self.val_to_idx[last] = idx
        # 删掉末尾元素与被删元素的索引
        self.vals.pop()
        del self.val_to_idx[val]
        return True

    def getRandom(self) -> int:
        return random.choice(self.vals)          # 等概率随机
\`\`\`

## JavaScript 实现

\`\`\`javascript
var RandomizedSet = function() {
    this.vals = [];             // 动态数组，存元素值
    this.valToIdx = new Map();  // val -> 在 vals 中的下标
};

RandomizedSet.prototype.insert = function(val) {
    if (this.valToIdx.has(val)) return false;
    this.valToIdx.set(val, this.vals.length);   // 记录下标
    this.vals.push(val);                         // 末尾追加
    return true;
};

RandomizedSet.prototype.remove = function(val) {
    if (!this.valToIdx.has(val)) return false;
    const idx = this.valToIdx.get(val);          // 被删位置
    const last = this.vals[this.vals.length - 1]; // 末尾元素
    // 把末尾元素搬到被删位置，并更新其下标
    this.vals[idx] = last;
    this.valToIdx.set(last, idx);
    // 删掉末尾元素与被删元素的索引
    this.vals.pop();
    this.valToIdx.delete(val);
    return true;
};

RandomizedSet.prototype.getRandom = function() {
    const i = Math.floor(Math.random() * this.vals.length);   // 等概率随机下标
    return this.vals[i];
};
\`\`\`

## 复杂度

- 时间复杂度：insert / remove / getRandom 均 O(1)
- 空间复杂度：O(n)，n 为元素个数

## 拓展

- #381 插入、删除和获取随机元素 - 允许重复（需用「值 -> 下标集合」结构）。
- 关键不变式：\`vals\` 中无空洞，\`valToIdx\` 与 \`vals\` 始终一一对应。
- 设计要点：「末尾元素交换删除法」是数组 O(1) 删除的标准技巧，务必能默写 remove 中的四步：换位、更新下标、pop、删表项。`
  },

  // =============================================================
  // lc-194 #146 LRU 缓存
  // =============================================================
  {
    id: "lc-194",
    group: "数据结构设计",
    icon: "🏗️",
    title: "#146 LRU 缓存（中等）",
    content: `## 题目

**LeetCode #146 LRU 缓存** | 难度：中等

请你设计并实现一个满足 **LRU（最近最少使用）缓存**约束的数据结构。支持 \`get(key)\` 和 \`put(key, value)\`：
- \`get(key)\`：若关键字存在返回其值，否则返回 -1。
- \`put(key, value)\`：若关键字已存在则更新值；若不存在则插入。当容量达到上限时，应在写入新数据前**删除最久未使用**的关键字。

进阶要求：\`get\` / \`put\` 都要在 **O(1)** 平均时间完成。

## 思路

LRU 的核心：访问过的要「提到最前」，最久没用的「淘汰最后」。要 O(1) 完成「定位 + 提到前面 + 淘汰末尾」，必须组合两个结构：

1. **哈希表**：\`key -> 节点\`，O(1) 定位任意节点。
2. **双向链表**：节点带 \`prev/next\` 指针，O(1) 删除与移动到头部；维护 \`head\`（最近用）与 \`tail\`（最久未用）哨兵。

操作流程：
- \`get(key)\`：哈希表查到节点 → 把节点移到链表头部 → 返回值。
- \`put(key, val)\`：
  - 若 key 存在：更新值，移到头部。
  - 若不存在：新建节点，插入头部，加入哈希表。若超容量，删除 tail 前驱节点并从哈希表移除。

**为什么是双向链表？** 单向链表删节点需前驱，O(n)；双向链表节点自带 prev，配合哈希表 O(1) 删除。**为什么用哨兵头尾？** 避免空表、头尾插入的特判。

Python 还可用 \`OrderedDict\`（\`move_to_end\` + \`popitem(last=False)\`）简洁实现；JS 的 \`Map\` 维持插入顺序，迭代删除最早项即天然 LRU。下面给出三种实现。

## Python 实现（OrderedDict 版）

\`\`\`python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.od = OrderedDict()    # 维护访问顺序

    def get(self, key: int) -> int:
        if key not in self.od:
            return -1
        self.od.move_to_end(key)   # 访问后移到末尾（最近使用）
        return self.od[key]

    def put(self, key: int, value: int) -> None:
        if key in self.od:
            self.od.move_to_end(key)   # 已存在先提到末尾再更新
        self.od[key] = value
        if len(self.od) > self.cap:
            self.od.popitem(last=False)   # 弹出头部（最久未用）
\`\`\`

## Python 实现（双向链表 + 哈希表版）

\`\`\`python
class Node:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map = {}                # key -> Node
        # 哨兵头尾，head.next 最近用，tail.prev 最久未用
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        # 双向链表 O(1) 删除节点
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_head(self, node):
        # 插到哨兵头之后（最近使用位置）
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)          # 访问后提到头部
        self._add_to_head(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.map:
            node = self.map[key]
            node.val = value
            self._remove(node)
        else:
            node = Node(key, value)
            self.map[key] = node
            if len(self.map) > self.cap:
                # 淘汰尾前驱（最久未用）
                lru = self.tail.prev
                self._remove(lru)
                del self.map[lru.key]
        self._add_to_head(node)
\`\`\`

## JavaScript 实现（Map 版）

\`\`\`javascript
var LRUCache = function(capacity) {
    this.cap = capacity;
    this.cache = new Map();   // Map 按插入顺序遍历，天然 LRU
};

LRUCache.prototype.get = function(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);    // 删除再重新插入，刷新为最近使用
    this.cache.set(key, val);
    return val;
};

LRUCache.prototype.put = function(key, value) {
    if (this.cache.has(key)) {
        this.cache.delete(key);   // 已存在先删，使新插入排到末尾
    }
    this.cache.set(key, value);
    if (this.cache.size > this.cap) {
        // 迭代器第一个即为最久未用，淘汰它
        const lruKey = this.cache.keys().next().value;
        this.cache.delete(lruKey);
    }
};
\`\`\`

## 复杂度

- 时间复杂度：get / put 均 O(1)
- 空间复杂度：O(capacity)

## 拓展

- #460 LFU 缓存（按访问频次淘汰，比 LRU 更难）。
- Java 可直接用 \`LinkedHashMap(accessOrder=true)\`，重写 \`removeEldestEntry\` 即可。
- 双向链表 + 哨兵节点是手写 LRU 的标准范式，务必能默写 \`_remove\` / \`_add_to_head\`。`
  },

  // =============================================================
  // lc-195 #460 LFU 缓存
  // =============================================================
  {
    id: "lc-195",
    group: "数据结构设计",
    icon: "🏗️",
    title: "#460 LFU 缓存（困难）",
    content: `## 题目

**LeetCode #460 LFU 缓存** | 难度：困难

请你为 LFU（最不经常使用）缓存设计并实现数据结构。支持 \`get(key)\` 和 \`put(key, value)\`：
- \`get(key)\`：若存在返回值并**增加其使用频次**，否则返回 -1。
- \`put(key, value)\`：存在则更新值并增加频次；不存在则插入。容量满时淘汰**使用频次最低**的键；若频次最低的有多个，淘汰**最久未使用**的（LRU）。

要求 \`get\` / \`put\` 均 O(1)。

## 思路

LFU 比 LRU 多一层「频次」。要 O(1) 完成三件事：定位节点、增减频次、找最小频次。经典结构 = **哈希表 + 双向链表 + 频次链表**：

1. **节点哈希表** \`keyMap: key -> Node\`：O(1) 定位节点。
2. **频次哈希表** \`freqMap: freq -> 双向链表\`：同一频次的所有节点挂在一条双向链表上。**链表头是最近访问的、尾是最久未访问的**——这保证同频次内按 LRU 排序，淘汰时取 \`minFreq\` 链表的尾部。
3. 维护全局 \`minFreq\`：当前最小频次。新增键时 \`minFreq = 1\`；某频次链表被取空时 \`minFreq++\`（被访问的节点频次+1，必然升到下一档）。

**访问节点（get 或 put 命中）的「频次提升」流程：**
1. 从 \`freqMap[oldFreq]\` 链表摘除该节点；
2. 若该链表变空且 \`oldFreq == minFreq\`，则 \`minFreq++\`；
3. 节点 \`freq++\`，插入 \`freqMap[newFreq]\` 链表头部。

**新增键**：容量满则淘汰 \`freqMap[minFreq]\` 尾部节点（含 keyMap 删除）；新节点 freq=1 插入 \`freqMap[1]\` 头部，\`minFreq = 1\`。

## Python 实现

\`\`\`python
class Node:
    def __init__(self, key=0, val=0, freq=1):
        self.key = key
        self.val = val
        self.freq = freq
        self.prev = None
        self.next = None

class LFUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.size = 0
        self.minFreq = 0
        self.keyMap = {}                 # key -> Node
        self.freqMap = {}                # freq -> 双向链表(头尾哨兵)

    def _new_list(self):
        # 带头尾哨兵的双向链表
        head = Node()
        tail = Node()
        head.next = tail
        tail.prev = head
        return head, tail

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_head(self, head, node):
        node.next = head.next
        node.prev = head
        head.next.prev = node
        head.next = node

    def _increase(self, node):
        # 频次提升：摘除 -> 调整 minFreq -> freq+1 -> 插入新频次表头
        head, tail = self.freqMap[node.freq]
        self._remove(node)
        if head.next == tail and node.freq == self.minFreq:
            self.minFreq += 1            # 旧频次链表空，最小频次升一档
        node.freq += 1
        if node.freq not in self.freqMap:
            self.freqMap[node.freq] = self._new_list()
        self._add_to_head(self.freqMap[node.freq][0], node)

    def get(self, key: int) -> int:
        if key not in self.keyMap:
            return -1
        node = self.keyMap[key]
        self._increase(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        if self.cap == 0:
            return
        if key in self.keyMap:
            node = self.keyMap[key]
            node.val = value
            self._increase(node)
            return
        if self.size == self.cap:
            # 淘汰 minFreq 链表尾部（最久未用）
            head, tail = self.freqMap[self.minFreq]
            lru = tail.prev
            self._remove(lru)
            del self.keyMap[lru.key]
            self.size -= 1
        node = Node(key, value, 1)
        self.keyMap[key] = node
        if 1 not in self.freqMap:
            self.freqMap[1] = self._new_list()
        self._add_to_head(self.freqMap[1][0], node)
        self.minFreq = 1
        self.size += 1
\`\`\`

## JavaScript 实现

\`\`\`javascript
function Node(key, val) {
    this.key = key === undefined ? 0 : key;
    this.val = val === undefined ? 0 : val;
    this.freq = 1;
    this.prev = null;
    this.next = null;
}

var LFUCache = function(capacity) {
    this.cap = capacity;
    this.size = 0;
    this.minFreq = 0;
    this.keyMap = new Map();    // key -> Node
    this.freqMap = new Map();   // freq -> {head, tail}
};

LFUCache.prototype._newList = function() {
    const head = new Node(), tail = new Node();
    head.next = tail;
    tail.prev = head;
    return { head, tail };
};

LFUCache.prototype._remove = function(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
};

LFUCache.prototype._addToHead = function(head, node) {
    node.next = head.next;
    node.prev = head;
    head.next.prev = node;
    head.next = node;
};

LFUCache.prototype._increase = function(node) {
    const pair = this.freqMap.get(node.freq);
    this._remove(node);
    if (pair.head.next === pair.tail && node.freq === this.minFreq) {
        this.minFreq++;         // 旧频次链表空，最小频次升一档
    }
    node.freq++;
    if (!this.freqMap.has(node.freq)) {
        this.freqMap.set(node.freq, this._newList());
    }
    this._addToHead(this.freqMap.get(node.freq).head, node);
};

LFUCache.prototype.get = function(key) {
    if (!this.keyMap.has(key)) return -1;
    const node = this.keyMap.get(key);
    this._increase(node);
    return node.val;
};

LFUCache.prototype.put = function(key, value) {
    if (this.cap === 0) return;
    if (this.keyMap.has(key)) {
        const node = this.keyMap.get(key);
        node.val = value;
        this._increase(node);
        return;
    }
    if (this.size === this.cap) {
        const pair = this.freqMap.get(this.minFreq);
        const lru = pair.tail.prev;
        this._remove(lru);
        this.keyMap.delete(lru.key);
        this.size--;
    }
    const node = new Node(key, value);
    this.keyMap.set(key, node);
    if (!this.freqMap.has(1)) {
        this.freqMap.set(1, this._newList());
    }
    this._addToHead(this.freqMap.get(1).head, node);
    this.minFreq = 1;
    this.size++;
};
\`\`\`

## 复杂度

- 时间复杂度：get / put 均 O(1)
- 空间复杂度：O(capacity)

## 拓展

- LFU 难点在「频次提升」与「最小频次维护」的同步：每次摘除节点后判断链表是否变空并更新 \`minFreq\`。
- 另有「O(log n) 平衡树」解法，键值带 \`(freq, time)\` 排序，实现更简单但常数更大。
- 相关题：#146 LRU 缓存（先掌握 LRU 再做 LFU）。`
  },

  // =============================================================
  // lc-196 #208 实现 Trie (前缀树)
  // =============================================================
  {
    id: "lc-196",
    group: "数据结构设计",
    icon: "🏗️",
    title: "#208 实现 Trie (前缀树)（中等）",
    content: `## 题目

**LeetCode #208 实现 Trie (前缀树)** | 难度：中等

Trie（发音 "try"）即前缀树，是一种树形数据结构，用于高效存储和检索字符串键。请实现 \`Trie\` 类：
- \`insert(word)\` 插入字符串。
- \`search(word)\` 判断是否完整存在。
- \`startsWith(prefix)\` 判断是否存在以该前缀开头的单词。

示例：

\`\`\`
输入：
["Trie","insert","search","search","startsWith","insert","search"]
[[],["apple"],["apple"],["app"],["app"],["app"],["app"]]
输出：[null,null,true,false,true,null,true]
\`\`\`

## 思路

Trie 把公共前缀合并到同一条树路径上，每个节点代表一个字符。核心是 **TrieNode** 结构：

\`\`\`
TrieNode:
  children: 字符 -> 子节点（长度 26 的数组 或 dict/Map）
  isEnd:    bool，标记此处是否为一个完整单词的结尾
\`\`\`

为什么这样设计？
- 根节点不存字符，它的子节点是各单词首字符。
- 沿着 \`children\` 一路往下，从根到某节点的路径恰好拼出一个前缀。
- \`isEnd=True\` 表示该前缀同时是一个完整单词，从而区分 \`app\`（单词）与 \`apple\`（更长单词）。
- \`children\` 用**长度 26 的数组**（仅小写字母）可 O(1) 访问子节点；若字符集大（中文/任意 Unicode）则用 \`dict/Map\`。

三个操作都是「从根沿字符指针下走」：insert 沿途补节点并在词尾置 isEnd；search 走到底看 isEnd；startsWith 走到底即可，不看 isEnd。

## Python 实现

\`\`\`python
class TrieNode:
    def __init__(self):
        self.children = [None] * 26   # 26 个小写字母子节点
        self.is_end = False          # 是否为完整单词结尾

class Trie:
    def __init__(self):
        self.root = TrieNode()       # 根节点不存字符

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            idx = ord(ch) - ord('a')
            if node.children[idx] is None:
                node.children[idx] = TrieNode()   # 缺失则新建
            node = node.children[idx]
        node.is_end = True            # 标记单词结尾

    def search(self, word: str) -> bool:
        node = self._walk(word)
        return node is not None and node.is_end   # 走到底且是单词结尾

    def startsWith(self, prefix: str) -> bool:
        return self._walk(prefix) is not None     # 走到底即可

    def _walk(self, s: str):
        # 沿字符指针下走，返回终点节点；走不通返回 None
        node = self.root
        for ch in s:
            idx = ord(ch) - ord('a')
            if node.children[idx] is None:
                return None
            node = node.children[idx]
        return node
\`\`\`

## JavaScript 实现

\`\`\`javascript
var TrieNode = function() {
    this.children = new Array(26).fill(null);   // 26 个小写字母子节点
    this.isEnd = false;                          // 是否为完整单词结尾
};

var Trie = function() {
    this.root = new TrieNode();   // 根节点不存字符
};

Trie.prototype.insert = function(word) {
    let node = this.root;
    for (const ch of word) {
        const idx = ch.charCodeAt(0) - 'a'.charCodeAt(0);
        if (node.children[idx] === null) {
            node.children[idx] = new TrieNode();   // 缺失则新建
        }
        node = node.children[idx];
    }
    node.isEnd = true;            // 标记单词结尾
};

Trie.prototype._walk = function(s) {
    // 沿字符指针下走，返回终点节点；走不通返回 null
    let node = this.root;
    for (const ch of s) {
        const idx = ch.charCodeAt(0) - 'a'.charCodeAt(0);
        if (node.children[idx] === null) return null;
        node = node.children[idx];
    }
    return node;
};

Trie.prototype.search = function(word) {
    const node = this._walk(word);
    return node !== null && node.isEnd;           // 走到底且是单词结尾
};

Trie.prototype.startsWith = function(prefix) {
    return this._walk(prefix) !== null;          // 走到底即可
};
\`\`\`

## 复杂度

- 时间复杂度：insert / search / startsWith 均 O(L)，L 为单词长度
- 空间复杂度：O(S·Σ)，S 为所有单词总字符数，Σ 为字符集大小（26）

## 拓展

- #211 添加与搜索单词（支持 \`.\` 通配符，DFS 搜索）。
- #212 单词搜索 II（Trie + 回溯剪枝）。
- 若字符集不确定，\`children\` 改用 \`Map\` 即可，逻辑不变。
- 设计要点：\`isEnd\` 标记是区分「前缀」与「完整单词」的关键。`
  },

  // =============================================================
  // lc-197 #211 添加与搜索单词 - 数据结构设计
  // =============================================================
  {
    id: "lc-197",
    group: "数据结构设计",
    icon: "🏗️",
    title: "#211 添加与搜索单词 - 数据结构设计（中等）",
    content: `## 题目

**LeetCode #211 添加与搜索单词 - 数据结构设计** | 难度：中等

请你设计 \`WordDictionary\` 支持：
- \`addWord(word)\` 添加单词。
- \`search(word)\` 查找。\`word\` 中可能包含 \`.\`，\`.\` 可以匹配**任意一个字母**。

示例：

\`\`\`
输入：
["WordDictionary","addWord","addWord","addWord","search","search","search","search"]
[[],["bad"],["dad"],["mad"],["pad"],["bad"],[".ad"],["b.."]]
输出：[null,null,null,null,false,true,true,true]
\`\`\`

## 思路

这是 **Trie 的变体**：建词时和普通 Trie 一样；搜词时遇到 \`.\` 要尝试**所有子节点**，因此 \`search\` 退化为**带回溯的 DFS**。

为什么用 Trie 而不是哈希集合？若用集合存所有单词，遇到 \`.\` 时只能枚举 26 种替换逐个查，效率低且无法利用前缀剪枝。Trie 把公共前缀合并，遇到 \`.\` 时只在「当前层实际存在的子节点」里递归，剪枝更彻底。

**search(word, i, node) 的递归设计：**
- 若 \`i == len(word)\`：返回 \`node.isEnd\`。
- 字符是普通字母：走向唯一对应子节点继续递归；不存在则返回 False。
- 字符是 \`.\`：遍历 \`node\` 的所有非空子节点，任意一条路径递归成功即返回 True。

注意：用数组存 children 时遍历 26 槽；用 \`dict/Map\` 时遍历 \`children.values()\` 更省事，本题字符集虽限定小写字母，但用 dict 让通配分支更简洁。

## Python 实现

\`\`\`python
class TrieNode:
    def __init__(self):
        self.children = {}     # 字符 -> 子节点（用 dict 让通配分支更简洁）
        self.is_end = False

class WordDictionary:
    def __init__(self):
        self.root = TrieNode()

    def addWord(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def search(self, word: str) -> bool:
        # DFS：从 i 位字符在 node 处往下匹配
        def dfs(i, node):
            if i == len(word):
                return node.is_end
            ch = word[i]
            if ch == '.':
                # 通配：任一子节点匹配即可
                for child in node.children.values():
                    if dfs(i + 1, child):
                        return True
                return False
            else:
                if ch not in node.children:
                    return False
                return dfs(i + 1, node.children[ch])
        return dfs(0, self.root)
\`\`\`

## JavaScript 实现

\`\`\`javascript
var TrieNode = function() {
    this.children = {};   // 字符 -> 子节点
    this.isEnd = false;
};

var WordDictionary = function() {
    this.root = new TrieNode();
};

WordDictionary.prototype.addWord = function(word) {
    let node = this.root;
    for (const ch of word) {
        if (!node.children[ch]) {
            node.children[ch] = new TrieNode();
        }
        node = node.children[ch];
    }
    node.isEnd = true;
};

WordDictionary.prototype.search = function(word) {
    // DFS：从 i 位字符在 node 处往下匹配
    const dfs = (i, node) => {
        if (i === word.length) return node.isEnd;
        const ch = word[i];
        if (ch === '.') {
            // 通配：任一子节点匹配即可
            for (const child of Object.values(node.children)) {
                if (dfs(i + 1, child)) return true;
            }
            return false;
        } else {
            if (!node.children[ch]) return false;
            return dfs(i + 1, node.children[ch]);
        }
    };
    return dfs(0, this.root);
};
\`\`\`

## 复杂度

- addWord：时间 O(L)，空间 O(S·Σ)
- search：最坏 O(Σ^L)（全是 \`.\`），实际因前缀剪枝远低于此
- 空间复杂度：O(S·Σ)，S 为所有单词总字符数

## 拓展

- #208 实现 Trie（本题基础版，无通配符）。
- #212 单词搜索 II（二维棋盘 + Trie + 回溯剪枝）。
- 若无通配符需求，search 可纯迭代；有 \`.\` 必须递归回溯。`
  },

  // =============================================================
  // lc-198 #933 最近的请求次数
  // =============================================================
  {
    id: "lc-198",
    group: "数据结构设计",
    icon: "🏗️",
    title: "#933 最近的请求次数（简单）",
    content: `## 题目

**LeetCode #933 最近的请求次数** | 难度：简单

写一个 \`RecentCounter\` 类计算特定时间范围内的 ping 次数。\`ping(t)\` 在时间 \`t\` 毫秒发生一次请求，返回过去 3000 毫秒内（即 \`[t-3000, t]\`）发生的请求数（含本次）。

示例：

\`\`\`
输入：
["RecentCounter","ping","ping","ping","ping"]
[[],[1],[100],[3001],[3002]]
输出：[null,1,2,3,3]
解释：ping(3002) 时窗口 [2,3002] 内有 100、3001、3002 三次
\`\`\`

## 思路

请求按时间**单调递增**到达，这是关键性质。\`[t-3000, t]\` 是一个**滑动窗口**：每次 ping 后，窗口右端固定为 t，左端为 t-3000。早于左端的旧请求**永远不会**再进入任何后续窗口（因为后续 t 更大，左端更大）。

因此用**队列**即可：\`ping(t)\` 时把 t 入队，然后**把队首所有 \`< t-3000\` 的元素出队**（它们已过期），队列剩余长度即答案。这本质就是「队列维护滑动窗口最小合法左端」。

为什么不用数组 + 遍历计数？那样每次 O(n)。利用单调性 + 队列，过期元素一次性丢弃，每个元素最多进出队列一次，**均摊 O(1)**。

## Python 实现

\`\`\`python
from collections import deque

class RecentCounter:
    def __init__(self):
        self.q = deque()      # 维护 [t-3000, t] 内的请求时间

    def ping(self, t: int) -> int:
        self.q.append(t)      # 新请求入队
        # 把早于窗口左端的过期请求弹出
        while self.q[0] < t - 3000:
            self.q.popleft()
        return len(self.q)    # 队列长度即窗口内请求数
\`\`\`

## JavaScript 实现

\`\`\`javascript
var RecentCounter = function() {
    this.q = [];    // 维护 [t-3000, t] 内的请求时间
};

RecentCounter.prototype.ping = function(t) {
    this.q.push(t);   // 新请求入队
    // 把早于窗口左端的过期请求弹出
    while (this.q[0] < t - 3000) {
        this.q.shift();
    }
    return this.q.length;   // 队列长度即窗口内请求数
};
\`\`\`

## 复杂度

- 时间复杂度：ping 均摊 O(1)（每个元素最多进出队列一次）
- 空间复杂度：O(W)，W 为窗口内最大并发请求数（最多 3000 个）

## 拓展

- 本题是「单调队列思想」最简单的体现，#239 滑动窗口最大值是其进阶。
- 若窗口大小或请求时间非单调，则需更复杂结构（如线段树/树状数组按时间离散化）。
- 设计要点：识别「单调到达 + 滑动窗口」即可用队列均摊 O(1) 求解。`
  },

  // =============================================================
  // lc-199 #707 设计链表
  // =============================================================
  {
    id: "lc-199",
    group: "数据结构设计",
    icon: "🏗️",
    title: "#707 设计链表（中等）",
    content: `## 题目

**LeetCode #707 设计链表** | 难度：中等

设计链表的实现。单链表节点包含 \`val\` 和 \`next\`。需实现：
- \`get(index)\`：返回第 index 个节点的值，非法返回 -1。
- \`addAtHead(val)\`、\`addAtTail(val)\`、\`addAtIndex(index, val)\`、\`deleteAtIndex(index)\`。

示例：

\`\`\`
输入：
["MyLinkedList","addAtHead","addAtTail","addAtIndex","get","deleteAtIndex","get"]
[[],[1],[3],[1,2],[1],[1],[1]]
输出：[null,null,null,null,2,null,3]
\`\`\`

## 思路

链表操作的痛点是「边界处理」：头插、尾插、空表、index 越界、删除头节点。**哨兵节点（虚拟头节点 dummy head）** 是标准解法：

- 建一个不存值的 \`dummy\` 节点，\`dummy.next\` 指向真实头节点。这样**头插**变成「在 dummy 之后插入」，与中间插入完全同构；**删头**变成「删 dummy.next」，与删中间节点同构，**消除了所有头节点特判**。

为方便尾插，额外维护 \`tail\` 指针；否则每次尾插要 O(n) 遍历找尾。

注意 index 合法性：\`get\` 与 \`deleteAtIndex\` 要求 \`0 <= index < size\`；\`addAtIndex\` 允许 \`index == size\`（尾插），\`index > size\` 忽略，\`index < 0\` 视为头插。把「在某节点后插入」抽成统一方法 \`_add_after(prev, node)\`，头插/尾插/中间插都复用它，并在此维护 tail 与 size。

## Python 实现

\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class MyLinkedList:
    def __init__(self):
        self.dummy = ListNode()   # 哨兵头节点
        self.tail = self.dummy    # 尾指针，初始指向哨兵
        self.size = 0

    def get(self, index: int) -> int:
        if index < 0 or index >= self.size:
            return -1
        cur = self.dummy.next
        for _ in range(index):
            cur = cur.next
        return cur.val

    def addAtHead(self, val: int) -> None:
        self._add_after(self.dummy, ListNode(val))

    def addAtTail(self, val: int) -> None:
        self._add_after(self.tail, ListNode(val))

    def addAtIndex(self, index: int, val: int) -> None:
        if index > self.size:
            return
        if index <= 0:
            self.addAtHead(val)
            return
        if index == self.size:
            self.addAtTail(val)
            return
        # 找到前驱节点 prev
        prev = self.dummy
        for _ in range(index):
            prev = prev.next
        self._add_after(prev, ListNode(val))

    def deleteAtIndex(self, index: int) -> None:
        if index < 0 or index >= self.size:
            return
        prev = self.dummy
        for _ in range(index):
            prev = prev.next
        # 删除 prev.next；若删的是尾节点需回退 tail
        if prev.next is self.tail:
            self.tail = prev
        prev.next = prev.next.next
        self.size -= 1

    def _add_after(self, prev: ListNode, node: ListNode) -> None:
        # 在 prev 之后插入 node，并维护 tail 与 size
        node.next = prev.next
        prev.next = node
        if prev is self.tail:    # 尾插则更新尾
            self.tail = node
        self.size += 1
\`\`\`

## JavaScript 实现

\`\`\`javascript
function ListNode(val, next) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
}

var MyLinkedList = function() {
    this.dummy = new ListNode();   // 哨兵头节点
    this.tail = this.dummy;         // 尾指针
    this.size = 0;
};

MyLinkedList.prototype._addAfter = function(prev, node) {
    // 在 prev 之后插入 node，并维护 tail 与 size
    node.next = prev.next;
    prev.next = node;
    if (prev === this.tail) {      // 尾插则更新尾
        this.tail = node;
    }
    this.size++;
};

MyLinkedList.prototype.get = function(index) {
    if (index < 0 || index >= this.size) return -1;
    let cur = this.dummy.next;
    for (let i = 0; i < index; i++) cur = cur.next;
    return cur.val;
};

MyLinkedList.prototype.addAtHead = function(val) {
    this._addAfter(this.dummy, new ListNode(val));
};

MyLinkedList.prototype.addAtTail = function(val) {
    this._addAfter(this.tail, new ListNode(val));
};

MyLinkedList.prototype.addAtIndex = function(index, val) {
    if (index > this.size) return;
    if (index <= 0) { this.addAtHead(val); return; }
    if (index === this.size) { this.addAtTail(val); return; }
    let prev = this.dummy;
    for (let i = 0; i < index; i++) prev = prev.next;
    this._addAfter(prev, new ListNode(val));
};

MyLinkedList.prototype.deleteAtIndex = function(index) {
    if (index < 0 || index >= this.size) return;
    let prev = this.dummy;
    for (let i = 0; i < index; i++) prev = prev.next;
    if (prev.next === this.tail) this.tail = prev;   // 删尾需回退 tail
    prev.next = prev.next.next;
    this.size--;
};
\`\`\`

## 复杂度

- 时间复杂度：get / addAtIndex / deleteAtIndex O(index)；addAtHead / addAtTail O(1)
- 空间复杂度：O(n)

## 拓展

- 哨兵节点是链表题通用技巧，能消除 90% 的头节点边界特判。
- 改用**双向链表**可让 deleteAtIndex 在已知节点时 O(1)，但本题按下标访问仍需 O(index) 遍历。
- 相关题：#206 反转链表、#19 删除倒数第 N 个节点。`
  },

  // =============================================================
  // lc-200 #705 设计哈希集合
  // =============================================================
  {
    id: "lc-200",
    group: "数据结构设计",
    icon: "🏗️",
    title: "#705 设计哈希集合（简单）",
    content: `## 题目

**LeetCode #705 设计哈希集合** | 难度：简单

不使用内建哈希库，设计一个哈希集合 \`MyHashSet\`，支持 \`add(key)\`、\`remove(key)\`、\`contains(key)\`。

示例：

\`\`\`
输入：
["MyHashSet","add","add","contains","contains","add","remove","contains"]
[[],[1],[2],[1],[3],[2],[2],[2]]
输出：[null,null,null,true,false,null,false,false]
\`\`\`

## 思路

哈希集合 = **哈希函数 + 冲突处理**。

1. **哈希函数**：把任意 key 映射到固定范围的桶下标。本题 key 为非负整数，最简单用 \`key % BASE\`，BASE 取一个素数（如 769，减少聚集）。

2. **冲突处理**：不同 key 可能映射到同一桶。常见两种：
   - **拉链法（链地址法）**：每个桶挂一条链表，同桶元素放链表上。增删查都在链表内线性扫描。本题采用。
   - **开放寻址法**：冲突就按探测序列（线性/二次/双重哈希）找下一个空桶。

\`contains\` / \`remove\` 前先在桶链表中找到 key 的位置。桶数 BASE 越大冲突越少但越费空间，是经典时空权衡。Python 桶内用 list（\`in\` / \`remove\` 直接按值操作）；JS 桶内用数组，借助 \`indexOf\` / \`splice\` 处理。

## Python 实现

\`\`\`python
class MyHashSet:
    def __init__(self):
        self.BASE = 769                  # 桶数，取素数减少冲突
        self.buckets = [[] for _ in range(self.BASE)]   # 每桶一个链表

    def _hash(self, key: int) -> int:
        return key % self.BASE           # 哈希函数

    def add(self, key: int) -> None:
        idx = self._hash(key)
        bucket = self.buckets[idx]
        if key not in bucket:            # 去重：已存在则不重复加
            bucket.append(key)

    def remove(self, key: int) -> None:
        idx = self._hash(key)
        bucket = self.buckets[idx]
        if key in bucket:
            bucket.remove(key)           # 删除指定值

    def contains(self, key: int) -> bool:
        idx = self._hash(key)
        return key in self.buckets[idx]  # 桶内线性查找
\`\`\`

## JavaScript 实现

\`\`\`javascript
var MyHashSet = function() {
    this.BASE = 769;                              // 桶数，取素数减少冲突
    this.buckets = new Array(this.BASE);          // 每桶一个数组（链表）
    for (let i = 0; i < this.BASE; i++) {
        this.buckets[i] = [];
    }
};

MyHashSet.prototype._hash = function(key) {
    return key % this.BASE;    // 哈希函数
};

MyHashSet.prototype._idx = function(key) {
    // 返回 key 在其桶中的下标，不存在返回 -1
    const h = this._hash(key);
    return this.buckets[h].indexOf(key);
};

MyHashSet.prototype.add = function(key) {
    const h = this._hash(key);
    if (this.buckets[h].indexOf(key) === -1) {   // 去重：已存在则不重复加
        this.buckets[h].push(key);
    }
};

MyHashSet.prototype.remove = function(key) {
    const h = this._hash(key);
    const i = this.buckets[h].indexOf(key);
    if (i !== -1) {
        this.buckets[h].splice(i, 1);             // 删除指定下标
    }
};

MyHashSet.prototype.contains = function(key) {
    return this._idx(key) !== -1;    // 桶内线性查找
};
\`\`\`

## 复杂度

- 时间复杂度：add / remove / contains 平均 O(n/BASE)，n 为元素数；理想分布下接近 O(1)，最坏（全部冲突）O(n)
- 空间复杂度：O(n + BASE)

## 拓展

- #706 设计哈希映射（结构几乎相同，桶内改存 (key, value) 对）。
- **开放寻址法**：用大数组 + 线性探测，缓存友好但删除需「软删除」标记。
- 负载因子 = n / BASE 过高时需**扩容 rehash**（重新分配更大桶数组并迁移），是工业级哈希表必备机制。`
  }
];
