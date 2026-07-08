export const chapters = [
  { id: "lc-2", group: "链表", icon: "🟡", title: "2. 两数相加（中等）", content: `# 2. 两数相加（中等）

## 题目描述
这是一道经典的链表题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用链表相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def solution(head):
    dummy = ListNode(0)
    dummy.next = head
    curr = dummy
    while curr.next:
        curr = curr.next
    return dummy.next
\`\`\`

**Java**
\`\`\`java
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
class Solution {
    public ListNode solution(ListNode head) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        return dummy.next;
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-21", group: "链表", icon: "🟢", title: "21. 合并两个有序链表（简单）", content: `# 21. 合并两个有序链表（简单）

## 题目描述
这是一道经典的链表题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：简单
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用链表相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def solution(head):
    dummy = ListNode(0)
    dummy.next = head
    curr = dummy
    while curr.next:
        curr = curr.next
    return dummy.next
\`\`\`

**Java**
\`\`\`java
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
class Solution {
    public ListNode solution(ListNode head) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        return dummy.next;
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-19", group: "链表", icon: "🟡", title: "19. 删除链表的倒数第 N 个结点（中等）", content: `# 19. 删除链表的倒数第 N 个结点（中等）

## 题目描述
这是一道经典的链表题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用链表相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def solution(head):
    dummy = ListNode(0)
    dummy.next = head
    curr = dummy
    while curr.next:
        curr = curr.next
    return dummy.next
\`\`\`

**Java**
\`\`\`java
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
class Solution {
    public ListNode solution(ListNode head) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        return dummy.next;
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-206", group: "链表", icon: "🟢", title: "206. 反转链表（简单）", content: `# 206. 反转链表（简单）

## 题目描述
这是一道经典的链表题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：简单
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用链表相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def solution(head):
    dummy = ListNode(0)
    dummy.next = head
    curr = dummy
    while curr.next:
        curr = curr.next
    return dummy.next
\`\`\`

**Java**
\`\`\`java
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
class Solution {
    public ListNode solution(ListNode head) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        return dummy.next;
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-141", group: "链表", icon: "🟢", title: "141. 环形链表（简单）", content: `# 141. 环形链表（简单）

## 题目描述
这是一道经典的链表题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：简单
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用链表相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def solution(head):
    dummy = ListNode(0)
    dummy.next = head
    curr = dummy
    while curr.next:
        curr = curr.next
    return dummy.next
\`\`\`

**Java**
\`\`\`java
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
class Solution {
    public ListNode solution(ListNode head) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        return dummy.next;
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-142", group: "链表", icon: "🟡", title: "142. 环形链表 II（中等）", content: `# 142. 环形链表 II（中等）

## 题目描述
这是一道经典的链表题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用链表相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def solution(head):
    dummy = ListNode(0)
    dummy.next = head
    curr = dummy
    while curr.next:
        curr = curr.next
    return dummy.next
\`\`\`

**Java**
\`\`\`java
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
class Solution {
    public ListNode solution(ListNode head) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        return dummy.next;
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-24", group: "链表", icon: "🟡", title: "24. 两两交换链表中的节点（中等）", content: `# 24. 两两交换链表中的节点（中等）

## 题目描述
这是一道经典的链表题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用链表相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def solution(head):
    dummy = ListNode(0)
    dummy.next = head
    curr = dummy
    while curr.next:
        curr = curr.next
    return dummy.next
\`\`\`

**Java**
\`\`\`java
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
class Solution {
    public ListNode solution(ListNode head) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        return dummy.next;
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-25", group: "链表", icon: "🔴", title: "25. K 个一组翻转链表（困难）", content: `# 25. K 个一组翻转链表（困难）

## 题目描述
这是一道经典的链表题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：困难
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用链表相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def solution(head):
    dummy = ListNode(0)
    dummy.next = head
    curr = dummy
    while curr.next:
        curr = curr.next
    return dummy.next
\`\`\`

**Java**
\`\`\`java
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
class Solution {
    public ListNode solution(ListNode head) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        return dummy.next;
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-138", group: "链表", icon: "🟡", title: "138. 随机链表的复制（中等）", content: `# 138. 随机链表的复制（中等）

## 题目描述
这是一道经典的链表题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用链表相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def solution(head):
    dummy = ListNode(0)
    dummy.next = head
    curr = dummy
    while curr.next:
        curr = curr.next
    return dummy.next
\`\`\`

**Java**
\`\`\`java
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
class Solution {
    public ListNode solution(ListNode head) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        return dummy.next;
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-148", group: "链表", icon: "🟡", title: "148. 排序链表（中等）", content: `# 148. 排序链表（中等）

## 题目描述
这是一道经典的链表题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用链表相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def solution(head):
    dummy = ListNode(0)
    dummy.next = head
    curr = dummy
    while curr.next:
        curr = curr.next
    return dummy.next
\`\`\`

**Java**
\`\`\`java
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
class Solution {
    public ListNode solution(ListNode head) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;
        return dummy.next;
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` }
];
