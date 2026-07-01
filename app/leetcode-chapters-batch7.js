// =============================================================
// LeetCode 面试算法 200 题 —— 第七批章节（链表组，共 10 题）
// -------------------------------------------------------------
// 覆盖：反转链表 / 合并有序链表 / 环形链表 / 相交链表 / 删除倒数第N个
//       两两交换 / K个一组翻转 / 随机链表复制 / 两数相加
// 每题包含：题目描述 / 思路讲解 / Python 实现 / JS 实现 / 复杂度分析 / 拓展
// =============================================================

export const chapters = [
  // =========================================================
  // #206 反转链表（简单）
  // =========================================================
  {
    id: "lc-61",
    group: "链表",
    icon: "🔗",
    title: "#206 反转链表（简单）",
    content: `## 题目

**LeetCode #206 反转链表** | 难度：简单

给你单链表的头节点 \`head\`，请你反转链表，并返回反转后的链表。

**示例：**
- 输入：\`head = [1,2,3,4,5]\`
- 输出：\`[5,4,3,2,1]\`

## 思路

反转链表是链表题的基础，核心是**改变每个节点的 next 指针方向**。

**迭代法步骤：**
1. 维护三个指针：\`prev\`（前驱，初始为 null）、\`curr\`（当前节点）、\`next\`（暂存下一个节点）
2. 遍历链表，每次先保存 \`curr.next\` 到 \`next\`，防止断链
3. 将 \`curr.next\` 指向 \`prev\`，完成当前节点的反转
4. 然后 \`prev\` 和 \`curr\` 都向后移动一位
5. 循环结束时 \`curr\` 为 null，\`prev\` 即为新链表的头节点

**递归法思路：** 递归到链表末尾，回溯时将当前节点的 next 指回自己，再把 next 置空。

## Python 实现

\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def reverseList(self, head):
        # 迭代法：三指针反转
        prev = None        # 前驱节点
        curr = head         # 当前节点
        while curr:
            next_node = curr.next  # 暂存下一个节点
            curr.next = prev       # 反转指针方向
            prev = curr            # prev 前移
            curr = next_node       # curr 前移
        return prev                # prev 即为新头
\`\`\`

## JavaScript 实现

\`\`\`javascript
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

var reverseList = function(head) {
    // 迭代法：三指针反转
    let prev = null;       // 前驱节点
    let curr = head;       // 当前节点
    while (curr) {
        const nextNode = curr.next;  // 暂存下一个节点
        curr.next = prev;           // 反转指针方向
        prev = curr;                 // prev 前移
        curr = nextNode;             // curr 前移
    }
    return prev;                     // prev 即为新头
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，遍历一次链表
- 空间复杂度：O(1)，仅使用常数个指针变量

## 拓展

- **递归实现**：空间复杂度 O(n)（递归栈），代码更简洁但实际工程中慎用
- **相关题目**：#92 反转链表 II（反转指定区间）、#25 K 个一组翻转链表
- **面试技巧**：迭代法是首选，能体现对指针操作的掌控力
`,
  },

  // =========================================================
  // #21 合并两个有序链表（简单）
  // =========================================================
  {
    id: "lc-62",
    group: "链表",
    icon: "🔗",
    title: "#21 合并两个有序链表（简单）",
    content: `## 题目

**LeetCode #21 合并两个有序链表** | 难度：简单

将两个升序链表合并为一个新的升序链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。

**示例：**
- 输入：\`l1 = [1,2,4]\`，\`l2 = [1,3,4]\`
- 输出：\`[1,1,2,3,4,4]\`

## 思路

**哑节点（dummy node）+ 双指针法：**

1. 创建一个哑节点 \`dummy\` 作为合并链表的起始，避免单独处理头节点
2. 用一个 \`curr\` 指针指向当前拼接位置
3. 比较 \`l1.val\` 和 \`l2.val\`，将较小者接到 \`curr.next\`
4. 被选中的链表指针后移一位，\`curr\` 也后移一位
5. 当某个链表遍历完后，将另一个链表剩余部分直接接到末尾
6. 返回 \`dummy.next\` 即为合并后的头节点

哑节点是链表题的常用技巧，能统一处理头节点的特殊情况，减少边界判断。

## Python 实现

\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def mergeTwoLists(self, l1, l2):
        # 哑节点简化头节点处理
        dummy = ListNode(-1)
        curr = dummy
        while l1 and l2:
            if l1.val <= l2.val:
                curr.next = l1
                l1 = l1.next
            else:
                curr.next = l2
                l2 = l2.next
            curr = curr.next
        # 把剩余部分直接接上
        curr.next = l1 if l1 else l2
        return dummy.next
\`\`\`

## JavaScript 实现

\`\`\`javascript
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

var mergeTwoLists = function(l1, l2) {
    // 哑节点简化头节点处理
    const dummy = new ListNode(-1);
    let curr = dummy;
    while (l1 && l2) {
        if (l1.val <= l2.val) {
            curr.next = l1;
            l1 = l1.next;
        } else {
            curr.next = l2;
            l2 = l2.next;
        }
        curr = curr.next;
    }
    // 把剩余部分直接接上
    curr.next = l1 ? l1 : l2;
    return dummy.next;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n + m)，n 和 m 分别为两个链表的长度
- 空间复杂度：O(1)，仅使用常数个指针，节点直接复用

## 拓展

- **递归实现**：代码简洁但空间 O(n+m)，且容易栈溢出
- **相关题目**：#23 合并 K 个升序链表（用最小堆优化）、#88 合并两个有序数组
- **哑节点技巧**：链表题高频套路，务必熟练掌握
`,
  },

  // =========================================================
  // #141 环形链表（简单）
  // =========================================================
  {
    id: "lc-63",
    group: "链表",
    icon: "🔗",
    title: "#141 环形链表（简单）",
    content: `## 题目

**LeetCode #141 环形链表** | 难度：简单

给你一个链表的头节点 \`head\`，判断链表中是否有环。如果链表中存在环，则返回 true，否则返回 false。

**示例：**
- 输入：\`head = [3,2,0,-4]\`，\`pos = 1\`
- 输出：\`true\`（链表中存在环，尾节点连接到节点 1）

## 思路

**快慢指针法（Floyd 判圈算法）：**

1. 设置两个指针 \`slow\` 和 \`fast\`，都从 head 出发
2. \`slow\` 每次走一步，\`fast\` 每次走两步
3. 如果没有环，\`fast\` 会先到达链表末尾（null），返回 false
4. 如果有环，\`fast\` 会在环内不断绕圈，最终 \`slow\` 进入环后两者一定会相遇
5. 一旦 \`slow == fast\`，说明有环，返回 true

**为什么一定会相遇？** 进入环后，两者的速度差为 1 步，每轮差距缩小 1，最终一定会相遇。这就像两个人在环形跑道上同向跑步，快的人一定会追上慢的人。

**哈希表法**也可行（记录访问过的节点），但空间 O(n)，不如快慢指针优雅。

## Python 实现

\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def hasCycle(self, head):
        # 快慢指针判圈
        slow = head
        fast = head
        while fast and fast.next:
            slow = slow.next       # 慢指针走一步
            fast = fast.next.next  # 快指针走两步
            if slow is fast:       # 相遇说明有环
                return True
        return False               # fast 到达末尾，无环
\`\`\`

## JavaScript 实现

\`\`\`javascript
function ListNode(val) {
    this.val = val
    this.next = null
}

var hasCycle = function(head) {
    // 快慢指针判圈
    let slow = head;
    let fast = head;
    while (fast && fast.next) {
        slow = slow.next;        // 慢指针走一步
        fast = fast.next.next;   // 快指针走两步
        if (slow === fast) {     // 相遇说明有环
            return true;
        }
    }
    return false;                // fast 到达末尾，无环
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，最坏情况遍历整个链表
- 空间复杂度：O(1)，仅使用两个指针

## 拓展

- **进阶题目**：#142 环形链表 II（找出环的入口节点）
- **相关算法**：Floyd 判圈算法也适用于判断一个序列是否存在循环
- **注意**：快指针走两步是关键，走其他步数可能错过相遇点
`,
  },

  // =========================================================
  // #142 环形链表 II（中等）
  // =========================================================
  {
    id: "lc-64",
    group: "链表",
    icon: "🔗",
    title: "#142 环形链表 II（中等）",
    content: `## 题目

**LeetCode #142 环形链表 II** | 难度：中等

给定一个链表的头节点 \`head\`，返回链表开始入环的第一个节点。如果链表无环，则返回 null。

**示例：**
- 输入：\`head = [3,2,0,-4]\`，\`pos = 1\`
- 输出：返回索引为 1 的链表节点（即值为 2 的节点）

## 思路

在 #141 快慢指针判圈的基础上，进一步**找出环的入口**。这是经典的数学推导题。

**推导过程：**
1. 设链表头到环入口距离为 \`a\`，环长为 \`b\`
2. 快慢指针相遇时，慢指针走了 \`s\` 步，快指针走了 \`2s\` 步
3. 快指针比慢指针多绕了 \`n\` 圈：\`2s - s = n * b\`，即 \`s = n * b\`
4. 慢指针进入环后走的距离 \`s = a + (n-1)*b + x\`（x 为相遇点距入口的距离），简化后可得相遇点距入口的关系
5. 关键结论：**从头节点出发走 a 步 = 从相遇点出发走 a 步，两者会在环入口相遇**

**算法步骤：**
1. 快慢指针找到相遇点（同 #141）
2. 若无环返回 null
3. 将一个指针重置到 head，另一个留在相遇点
4. 两者都每次走一步，再次相遇的节点就是环入口

## Python 实现

\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def detectCycle(self, head):
        # 第一步：快慢指针找相遇点
        slow = head
        fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                # 第二步：一个从头出发，一个从相遇点出发
                slow = head
                while slow is not fast:
                    slow = slow.next
                    fast = fast.next
                return slow  # 再次相遇即环入口
        return None  # 无环
\`\`\`

## JavaScript 实现

\`\`\`javascript
function ListNode(val) {
    this.val = val
    this.next = null
}

var detectCycle = function(head) {
    // 第一步：快慢指针找相遇点
    let slow = head;
    let fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) {
            // 第二步：一个从头出发，一个从相遇点出发
            slow = head;
            while (slow !== fast) {
                slow = slow.next;
                fast = fast.next;
            }
            return slow;  // 再次相遇即环入口
        }
    }
    return null;  // 无环
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，最多遍历两次链表
- 空间复杂度：O(1)，仅使用常数个指针

## 拓展

- **哈希表法**：用集合记录访问过的节点，第一次重复访问即为入口，空间 O(n)
- **数学证明**：理解 a = n*b - x 的推导是面试加分项
- **相关题目**：#287 寻找重复数（同样可用快慢指针，把数组当作隐式链表）
`,
  },

  // =========================================================
  // #160 相交链表（简单）
  // =========================================================
  {
    id: "lc-65",
    group: "链表",
    icon: "🔗",
    title: "#160 相交链表（简单）",
    content: `## 题目

**LeetCode #160 相交链表** | 难度：简单

给你两个单链表的头节点 \`headA\` 和 \`headB\`，请你找出并返回两个单链表相交的起始节点。如果两个链表不存在相交节点，返回 null。

**示例：**
- 输入：\`listA = [4,1,8,4,5]\`，\`listB = [5,6,1,8,4,5]\`
- 输出：相交于值为 8 的节点

## 思路

**双指针交换法（最优雅的解法）：**

核心思想：让两个指针走相同的总路径长度，从而在交点对齐。

1. 指针 \`pA\` 从 headA 出发，指针 \`pB\` 从 headB 出发
2. 当 \`pA\` 走到末尾时，转而从 headB 继续走
3. 当 \`pB\` 走到末尾时，转而从 headA 继续走
4. 两者走的总长度都是 \`lenA + lenB\`，必然会在交点相遇
5. 如果没有交点，两者最终会同时到达 null

**为什么有效？** 假设交点前 A 链长 \`a\`、B 链长 \`b\`，交点后公共部分长 \`c\`。\`pA\` 走 \`a + c + b\` 步到交点，\`pB\` 走 \`b + c + a\` 步到交点，两者步数相等，必然同时到达交点。

这个解法不需要预先计算链表长度，代码极简。

## Python 实现

\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def getIntersectionNode(self, headA, headB):
        # 双指针交换法
        if not headA or not headB:
            return None
        pA = headA
        pB = headB
        # 两者都走 lenA + lenB 步，会在交点相遇
        while pA is not pB:
            pA = pA.next if pA else headB  # A 走完走 B
            pB = pB.next if pB else headA  # B 走完走 A
        return pA  # 相交则返回交点，否则返回 None
\`\`\`

## JavaScript 实现

\`\`\`javascript
function ListNode(val) {
    this.val = val
    this.next = null
}

var getIntersectionNode = function(headA, headB) {
    // 双指针交换法
    if (!headA || !headB) return null;
    let pA = headA;
    let pB = headB;
    // 两者都走 lenA + lenB 步，会在交点相遇
    while (pA !== pB) {
        pA = pA ? pA.next : headB;  // A 走完走 B
        pB = pB ? pB.next : headA;  // B 走完走 A
    }
    return pA;  // 相交则返回交点，否则返回 null
};
\`\`\`

## 复杂度

- 时间复杂度：O(m + n)，m 和 n 为两个链表长度
- 空间复杂度：O(1)，仅使用两个指针

## 拓展

- **长度差法**：先计算两链表长度，让长的先走差值步，再同步走
- **注意**：判断相交是判断节点引用相同，而非值相同
- **相关题目**：链表相交是链表题的高频考点，理解双指针交换法的巧妙之处
`,
  },

  // =========================================================
  // #19 删除链表的倒数第N个结点（中等）
  // =========================================================
  {
    id: "lc-66",
    group: "链表",
    icon: "🔗",
    title: "#19 删除链表的倒数第N个结点（中等）",
    content: `## 题目

**LeetCode #19 删除链表的倒数第 N 个结点** | 难度：中等

给你一个链表的头节点 \`head\`，删除链表的倒数第 \`n\` 个结点，并且返回链表的头结点。要求使用一趟扫描实现。

**示例：**
- 输入：\`head = [1,2,3,4,5]\`，\`n = 2\`
- 输出：\`[1,2,3,5]\`（删除倒数第 2 个，即值为 4 的节点）

## 思路

**快慢指针 + 哑节点：**

要删除倒数第 n 个节点，需要找到它的**前驱节点**。

1. 使用哑节点 \`dummy\`，其 next 指向 head，处理删除头节点的特殊情况
2. 快指针 \`fast\` 先走 n 步
3. 然后快慢指针同时走，直到 \`fast\` 到达末尾
4. 此时 \`slow\` 恰好停在倒数第 n 个节点的前驱位置
5. 执行 \`slow.next = slow.next.next\` 删除目标节点

**为什么快指针先走 n 步？** 这样快慢指针之间始终间隔 n 个节点，当快指针到达末尾时，慢指针正好在倒数第 n+1 个位置（即待删节点的前驱）。

哑节点是关键：当要删除的是头节点时（如链表 [1,2] 删除倒数第 2 个），没有哑节点会导致找不到前驱。

## Python 实现

\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def removeNthFromEnd(self, head, n):
        # 哑节点处理删除头节点的情况
        dummy = ListNode(0, head)
        fast = dummy
        slow = dummy
        # 快指针先走 n 步
        for _ in range(n):
            fast = fast.next
        # 快慢同步走，fast 到末尾时 slow 在待删节点前驱
        while fast.next:
            fast = fast.next
            slow = slow.next
        # 删除倒数第 n 个节点
        slow.next = slow.next.next
        return dummy.next
\`\`\`

## JavaScript 实现

\`\`\`javascript
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

var removeNthFromEnd = function(head, n) {
    // 哑节点处理删除头节点的情况
    const dummy = new ListNode(0, head);
    let fast = dummy;
    let slow = dummy;
    // 快指针先走 n 步
    for (let i = 0; i < n; i++) {
        fast = fast.next;
    }
    // 快慢同步走，fast 到末尾时 slow 在待删节点前驱
    while (fast.next) {
        fast = fast.next;
        slow = slow.next;
    }
    // 删除倒数第 n 个节点
    slow.next = slow.next.next;
    return dummy.next;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，一趟扫描完成
- 空间复杂度：O(1)，仅使用常数个指针

## 拓展

- **两趟扫描法**：第一趟计算长度，第二趟找到前驱删除，逻辑更直观
- **相关题目**：#83 删除排序链表中的重复元素、#82 删除排序链表中的重复元素 II
- **面试要点**：哑节点是处理链表头节点边界情况的通用技巧
`,
  },

  // =========================================================
  // #24 两两交换链表中的节点（中等）
  // =========================================================
  {
    id: "lc-67",
    group: "链表",
    icon: "🔗",
    title: "#24 两两交换链表中的节点（中等）",
    content: `## 题目

**LeetCode #24 两两交换链表中的节点** | 难度：中等

给你一个链表，两两交换其中相邻的节点，并返回交换后链表的头节点。你必须实际交换节点，而不能只是修改节点的值。

**示例：**
- 输入：\`head = [1,2,3,4]\`
- 输出：\`[2,1,4,3]\`

## 思路

**哑节点 + 指针操作：**

要交换相邻的两个节点，需要操作三个指针：前驱、节点 A、节点 B。

1. 创建哑节点 \`dummy\` 指向 head
2. 用 \`prev\` 指向待交换两个节点的前驱
3. 设 \`node1 = prev.next\`，\`node2 = prev.next.next\`
4. 交换步骤：
   - \`prev.next = node2\`（前驱指向 node2）
   - \`node1.next = node2.next\`（node1 指向 node2 原来的后继）
   - \`node2.next = node1\`（node2 指向 node1，完成交换）
5. \`prev\` 移动到 \`node1\`（交换后 node1 在后面），继续下一对

注意边界：当剩余节点不足两个时停止。

**递归法**也很直观：把前两个节点交换，剩余部分递归处理，最后把第一个节点的 next 指向递归结果。

## Python 实现

\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def swapPairs(self, head):
        # 哑节点简化头节点处理
        dummy = ListNode(0, head)
        prev = dummy
        while prev.next and prev.next.next:
            node1 = prev.next      # 第一个节点
            node2 = prev.next.next # 第二个节点
            # 交换三个指针
            prev.next = node2
            node1.next = node2.next
            node2.next = node1
            # prev 前移到交换后的后一个节点
            prev = node1
        return dummy.next
\`\`\`

## JavaScript 实现

\`\`\`javascript
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

var swapPairs = function(head) {
    // 哑节点简化头节点处理
    const dummy = new ListNode(0, head);
    let prev = dummy;
    while (prev.next && prev.next.next) {
        const node1 = prev.next;       // 第一个节点
        const node2 = prev.next.next;  // 第二个节点
        // 交换三个指针
        prev.next = node2;
        node1.next = node2.next;
        node2.next = node1;
        // prev 前移到交换后的后一个节点
        prev = node1;
    }
    return dummy.next;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，遍历一次链表
- 空间复杂度：O(1)，仅使用常数个指针

## 拓展

- **递归实现**：\`head.next = swapPairs(剩余)\`，代码简洁但空间 O(n)
- **相关题目**：#25 K 个一组翻转链表（本题的通用版本）
- **关键点**：画图理清三个指针的指向关系，避免指针混乱
`,
  },

  // =========================================================
  // #25 K个一组翻转链表（困难）
  // =========================================================
  {
    id: "lc-68",
    group: "链表",
    icon: "🔗",
    title: "#25 K 个一组翻转链表（困难）",
    content: `## 题目

**LeetCode #25 K 个一组翻转链表** | 难度：困难

给你链表的头节点 \`head\`，每 \`k\` 个节点一组进行翻转，请你返回修改后的链表。\`k\` 是一个正整数，它的值小于或等于链表的长度。如果节点总数不是 \`k\` 的整数倍，那么请将最后剩余的节点保持原有顺序。不能只改变节点内部的值，需要实际进行节点交换。

**示例：**
- 输入：\`head = [1,2,3,4,5]\`，\`k = 2\`
- 输出：\`[2,1,4,3,5]\`

## 思路

这是 #206 反转链表的进阶版，需要**分段反转**。

**算法步骤：**
1. 用哑节点 \`dummy\` 简化头节点处理
2. 用 \`prev\` 指向每组翻转的前驱
3. 先探测是否有 k 个节点：从 \`prev\` 出发数 k 步，若不足则结束
4. 记录本组起点 \`start = prev.next\`，本组终点（翻转后变成终点）\`end\`，以及下一组起点 \`nextGroup = end.next\`
5. 反转 \`start\` 到 \`end\` 这段（不含 nextGroup），返回新的头尾
6. 连接：\`prev.next = 新头\`，\`start.next = nextGroup\`（start 翻转后变成尾）
7. \`prev = start\`，继续下一组

**反转 k 个节点的子函数**与 #206 类似，但需要反转固定数量并返回新的头尾。

## Python 实现

\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def reverseKGroup(self, head, k):
        dummy = ListNode(0, head)
        prev = dummy
        while True:
            # 探测是否还有 k 个节点
            end = prev
            for _ in range(k):
                end = end.next
                if not end:
                    return dummy.next  # 不足 k 个，结束
            # 记录本组起点和下一组起点
            start = prev.next
            nextGroup = end.next
            # 反转 [start, end] 这一段，先断开
            end.next = None
            newHead, newTail = self.reverse(start)
            # 重新连接
            prev.next = newHead
            newTail.next = nextGroup
            # prev 移动到翻转后的尾节点
            prev = newTail

    def reverse(self, head):
        # 反转链表，返回新的头尾
        prev = None
        curr = head
        while curr:
            nxt = curr.next
            curr.next = prev
            prev = curr
            curr = nxt
        return prev, head  # prev 是新头，head 变成尾
\`\`\`

## JavaScript 实现

\`\`\`javascript
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

var reverseKGroup = function(head, k) {
    const dummy = new ListNode(0, head);
    let prev = dummy;
    while (true) {
        // 探测是否还有 k 个节点
        let end = prev;
        for (let i = 0; i < k; i++) {
            end = end.next;
            if (!end) return dummy.next;  // 不足 k 个，结束
        }
        // 记录本组起点和下一组起点
        const start = prev.next;
        const nextGroup = end.next;
        // 反转 [start, end] 这一段，先断开
        end.next = null;
        const reversed = reverse(start);
        // 重新连接
        prev.next = reversed.head;
        reversed.tail.next = nextGroup;
        // prev 移动到翻转后的尾节点
        prev = reversed.tail;
    }
};

// 反转链表，返回新的头尾
function reverse(head) {
    let prev = null;
    let curr = head;
    while (curr) {
        const nxt = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nxt;
    }
    return { head: prev, tail: head };  // prev 是新头，head 变成尾
}
\`\`\`

## 复杂度

- 时间复杂度：O(n)，每个节点被访问常数次
- 空间复杂度：O(1)，仅使用常数个指针（递归解法为 O(n/k) 栈空间）

## 拓展

- **递归解法**：先递归翻转后续部分，再翻转当前 k 个，代码更简洁
- **相关题目**：#24 两两交换链表中的节点（k=2 的特例）、#92 反转链表 II
- **面试要点**：本题考察对链表指针的精细控制，画图是关键
`,
  },

  // =========================================================
  // #138 随机链表的复制（中等）
  // =========================================================
  {
    id: "lc-69",
    group: "链表",
    icon: "🔗",
    title: "#138 随机链表的复制（中等）",
    content: `## 题目

**LeetCode #138 随机链表的复制** | 难度：中等

给你一个长度为 \`n\` 的链表，每个节点除了 \`next\` 指针外，还有一个 \`random\` 指针，该指针可以指向链表中的任何节点或空节点。请构造这个链表的深拷贝，并返回复制链表的头节点。

**示例：**
- 输入：\`head = [[7,null],[13,0],[11,4],[10,2],[1,0]]\`
- 输出：深拷贝后的链表，结构与原链表一致

## 思路

难点在于 \`random\` 指针的处理——复制节点时，random 指向的节点可能还未创建。

**哈希表法（最直观）：**
1. 第一次遍历：创建所有新节点，存入哈希表 \`{原节点: 新节点}\`
2. 第二次遍历：根据原节点的 next 和 random，设置新节点的对应指针

**原地拼接法（空间 O(1)）：**
1. 在每个原节点后面插入一个复制节点：A -> A' -> B -> B' -> ...
2. 设置复制节点的 random：\`curr.next.random = curr.random.next\`（如果 random 存在）
3. 拆分两个链表，恢复原链表并得到复制链表

哈希表法更易理解，推荐面试时使用；原地法空间更优但容易出错。

## Python 实现

\`\`\`python
class Node:
    def __init__(self, val=0, next=None, random=None):
        self.val = val
        self.next = next
        self.random = random

class Solution:
    def copyRandomList(self, head):
        if not head:
            return None
        # 哈希表：原节点 -> 复制节点
        mapping = {}
        # 第一次遍历：创建所有复制节点
        curr = head
        while curr:
            mapping[curr] = Node(curr.val)
            curr = curr.next
        # 第二次遍历：设置 next 和 random 指针
        curr = head
        while curr:
            if curr.next:
                mapping[curr].next = mapping[curr.next]
            if curr.random:
                mapping[curr].random = mapping[curr.random]
            curr = curr.next
        return mapping[head]
\`\`\`

## JavaScript 实现

\`\`\`javascript
function Node(val, next, random) {
    this.val = val
    this.next = (next === undefined ? null : next)
    this.random = (random === undefined ? null : random)
}

var copyRandomList = function(head) {
    if (!head) return null;
    // 哈希表：原节点 -> 复制节点
    const map = new Map();
    // 第一次遍历：创建所有复制节点
    let curr = head;
    while (curr) {
        map.set(curr, new Node(curr.val));
        curr = curr.next;
    }
    // 第二次遍历：设置 next 和 random 指针
    curr = head;
    while (curr) {
        if (curr.next) {
            map.get(curr).next = map.get(curr.next);
        }
        if (curr.random) {
            map.get(curr).random = map.get(curr.random);
        }
        curr = curr.next;
    }
    return map.get(head);
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，遍历两次链表
- 空间复杂度：O(n)，哈希表存储 n 个节点映射（原地法可优化为 O(1)）

## 拓展

- **原地拼接法**：先插入复制节点再设 random 最后拆分，空间 O(1)
- **相关题目**：图的深拷贝（#133），处理对象引用的复制
- **面试要点**：哈希表法思路清晰，先讲清楚再考虑空间优化
`,
  },

  // =========================================================
  // #2 两数相加（中等）
  // =========================================================
  {
    id: "lc-70",
    group: "链表",
    icon: "🔗",
    title: "#2 两数相加（中等）",
    content: `## 题目

**LeetCode #2 两数相加** | 难度：中等

给你两个非空的链表，表示两个非负的整数。它们每位数字都是按照**逆序**方式存储的，并且每个节点只能存储一位数字。请你将两个数相加，并以相同形式返回一个表示和的链表。

**示例：**
- 输入：\`l1 = [2,4,3]\`，\`l2 = [5,6,4]\`（即 342 + 465）
- 输出：\`[7,0,8]\`（即 807）

## 思路

由于数字逆序存储，正好符合加法从低位到高位的计算顺序，可以**模拟竖式加法**。

**算法步骤：**
1. 同时遍历两个链表，逐位相加
2. 维护进位 \`carry\`，初始为 0
3. 当前位和 = \`l1.val + l2.val + carry\`，新节点值为 \`sum % 10\`，进位为 \`sum // 10\`
4. 某个链表遍历完后，继续处理另一个链表，仍需考虑进位
5. 两个链表都遍历完后，若还有进位，补一个值为 1 的节点
6. 用哑节点简化头节点处理

**注意点：**
- 两个链表长度可能不同，短的补 0 处理
- 最高位进位不要遗漏（如 5 + 5 = 10）

## Python 实现

\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def addTwoNumbers(self, l1, l2):
        dummy = ListNode(0)   # 哑节点
        curr = dummy
        carry = 0              # 进位
        while l1 or l2 or carry:
            # 取当前位的值，链表短的一方补 0
            x = l1.val if l1 else 0
            y = l2.val if l2 else 0
            total = x + y + carry
            carry = total // 10          # 计算进位
            curr.next = ListNode(total % 10)  # 创建新节点
            curr = curr.next
            # 两个链表指针后移
            if l1:
                l1 = l1.next
            if l2:
                l2 = l2.next
        return dummy.next
\`\`\`

## JavaScript 实现

\`\`\`javascript
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

var addTwoNumbers = function(l1, l2) {
    const dummy = new ListNode(0);  // 哑节点
    let curr = dummy;
    let carry = 0;                   // 进位
    while (l1 || l2 || carry) {
        // 取当前位的值，链表短的一方补 0
        const x = l1 ? l1.val : 0;
        const y = l2 ? l2.val : 0;
        const total = x + y + carry;
        carry = Math.floor(total / 10);       // 计算进位
        curr.next = new ListNode(total % 10);  // 创建新节点
        curr = curr.next;
        // 两个链表指针后移
        if (l1) l1 = l1.next;
        if (l2) l2 = l2.next;
    }
    return dummy.next;
};
\`\`\`

## 复杂度

- 时间复杂度：O(max(m, n))，m 和 n 为两个链表长度
- 空间复杂度：O(max(m, n))，结果链表的长度

## 拓展

- **相关题目**：#445 两数相加 II（数字正序存储，需用栈或反转链表）
- **大数运算**：链表表示大数是常见手法，避免数字溢出
- **面试要点**：注意处理进位和长度不等的情况，循环条件加上 \`or carry\` 避免遗漏最高位进位
`,
  },
];
