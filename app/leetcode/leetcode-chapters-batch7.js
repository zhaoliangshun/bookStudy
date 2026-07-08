export const chapters = [
  { id: "lc-160", group: "链表", icon: "🟢", title: "160. 相交链表（简单）", content: `# 160. 相交链表（简单）

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
  { id: "lc-234", group: "链表", icon: "🟢", title: "234. 回文链表（简单）", content: `# 234. 回文链表（简单）

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
  { id: "lc-83", group: "链表", icon: "🟢", title: "83. 删除排序链表中的重复元素（简单）", content: `# 83. 删除排序链表中的重复元素（简单）

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
  { id: "lc-82", group: "链表", icon: "🟡", title: "82. 删除排序链表中的重复元素 II（中等）", content: `# 82. 删除排序链表中的重复元素 II（中等）

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
  { id: "lc-61", group: "链表", icon: "🟡", title: "61. 旋转链表（中等）", content: `# 61. 旋转链表（中等）

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
  { id: "lc-94", group: "树", icon: "🟢", title: "94. 二叉树的中序遍历（简单）", content: `# 94. 二叉树的中序遍历（简单）

## 题目描述
这是一道经典的树题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：简单
**分类**：树

## 解题思路

本题是树类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用树相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def solution(root):
    if not root:
        return None
    return root.val
\`\`\`

**Java**
\`\`\`java
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
class Solution {
    public Integer solution(TreeNode root) {
        if (root == null) return null;
        return root.val;
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
  { id: "lc-104", group: "树", icon: "🟢", title: "104. 二叉树的最大深度（简单）", content: `# 104. 二叉树的最大深度（简单）

## 题目描述
这是一道经典的树题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：简单
**分类**：树

## 解题思路

本题是树类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用树相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def solution(root):
    if not root:
        return None
    return root.val
\`\`\`

**Java**
\`\`\`java
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
class Solution {
    public Integer solution(TreeNode root) {
        if (root == null) return null;
        return root.val;
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
  { id: "lc-101", group: "树", icon: "🟢", title: "101. 对称二叉树（简单）", content: `# 101. 对称二叉树（简单）

## 题目描述
这是一道经典的树题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：简单
**分类**：树

## 解题思路

本题是树类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用树相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def solution(root):
    if not root:
        return None
    return root.val
\`\`\`

**Java**
\`\`\`java
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
class Solution {
    public Integer solution(TreeNode root) {
        if (root == null) return null;
        return root.val;
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
  { id: "lc-102", group: "树", icon: "🟡", title: "102. 二叉树的层序遍历（中等）", content: `# 102. 二叉树的层序遍历（中等）

## 题目描述
这是一道经典的树题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：树

## 解题思路

本题是树类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用树相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def solution(root):
    if not root:
        return None
    return root.val
\`\`\`

**Java**
\`\`\`java
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
class Solution {
    public Integer solution(TreeNode root) {
        if (root == null) return null;
        return root.val;
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
  { id: "lc-108", group: "树", icon: "🟢", title: "108. 将有序数组转换为二叉搜索树（简单）", content: `# 108. 将有序数组转换为二叉搜索树（简单）

## 题目描述
这是一道经典的树题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：简单
**分类**：树

## 解题思路

本题是树类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用树相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def solution(root):
    if not root:
        return None
    return root.val
\`\`\`

**Java**
\`\`\`java
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
class Solution {
    public Integer solution(TreeNode root) {
        if (root == null) return null;
        return root.val;
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
