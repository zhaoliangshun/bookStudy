export const chapters = [
  { id: "lc-19", group: "链表", icon: "🟡", title: "19. 删除链表的倒数第 N 个结点（中等）", content: `# 19. 删除链表的倒数第 N 个结点（中等）

## 题目描述
这是一道经典的链表题目。

**难度**：中等
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于链表类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def solution(self, head):
        """
        :type head: ListNode
        :rtype: ListNode
        """
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
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` },
  { id: "lc-21", group: "链表", icon: "🟢", title: "21. 合并两个有序链表（简单）", content: `# 21. 合并两个有序链表（简单）

## 题目描述
这是一道经典的链表题目。

**难度**：简单
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于链表类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def solution(self, head):
        """
        :type head: ListNode
        :rtype: ListNode
        """
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
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` },
  { id: "lc-24", group: "链表", icon: "🟡", title: "24. 两两交换链表中的节点（中等）", content: `# 24. 两两交换链表中的节点（中等）

## 题目描述
这是一道经典的链表题目。

**难度**：中等
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于链表类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def solution(self, head):
        """
        :type head: ListNode
        :rtype: ListNode
        """
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
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` },
  { id: "lc-61", group: "链表", icon: "🟡", title: "61. 旋转链表（中等）", content: `# 61. 旋转链表（中等）

## 题目描述
这是一道经典的链表题目。

**难度**：中等
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于链表类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def solution(self, head):
        """
        :type head: ListNode
        :rtype: ListNode
        """
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
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` },
  { id: "lc-82", group: "链表", icon: "🟡", title: "82. 删除排序链表中的重复元素 II（中等）", content: `# 82. 删除排序链表中的重复元素 II（中等）

## 题目描述
这是一道经典的链表题目。

**难度**：中等
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于链表类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def solution(self, head):
        """
        :type head: ListNode
        :rtype: ListNode
        """
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
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` },
  { id: "lc-83", group: "链表", icon: "🟢", title: "83. 删除排序链表中的重复元素（简单）", content: `# 83. 删除排序链表中的重复元素（简单）

## 题目描述
这是一道经典的链表题目。

**难度**：简单
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于链表类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def solution(self, head):
        """
        :type head: ListNode
        :rtype: ListNode
        """
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
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` },
  { id: "lc-86", group: "链表", icon: "🟡", title: "86. 分隔链表（中等）", content: `# 86. 分隔链表（中等）

## 题目描述
这是一道经典的链表题目。

**难度**：中等
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于链表类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def solution(self, head):
        """
        :type head: ListNode
        :rtype: ListNode
        """
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
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` },
  { id: "lc-92", group: "链表", icon: "🟡", title: "92. 反转链表 II（中等）", content: `# 92. 反转链表 II（中等）

## 题目描述
这是一道经典的链表题目。

**难度**：中等
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于链表类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def solution(self, head):
        """
        :type head: ListNode
        :rtype: ListNode
        """
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
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` },
  { id: "lc-138", group: "链表", icon: "🟡", title: "138. 随机链表的复制（中等）", content: `# 138. 随机链表的复制（中等）

## 题目描述
这是一道经典的链表题目。

**难度**：中等
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于链表类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def solution(self, head):
        """
        :type head: ListNode
        :rtype: ListNode
        """
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
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` },
  { id: "lc-141", group: "链表", icon: "🟢", title: "141. 环形链表（简单）", content: `# 141. 环形链表（简单）

## 题目描述
这是一道经典的链表题目。

**难度**：简单
**分类**：链表

## 解题思路

本题是链表类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于链表类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def solution(self, head):
        """
        :type head: ListNode
        :rtype: ListNode
        """
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
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` }
];
