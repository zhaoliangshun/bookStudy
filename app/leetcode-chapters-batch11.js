// =============================================================
// LeetCode 面试算法 200 题 - 第十一批章节（二叉搜索树，共 10 题）
// 章节 lc-101 ~ lc-110：验证/搜索/插入/删除/构造/累加/第K小/迭代器/LCA/修剪
// =============================================================

export const chapters = [
  // =============================================================
  // lc-101 #98 验证二叉搜索树
  // =============================================================
  {
    id: "lc-101",
    group: "二叉搜索树",
    icon: "🎋",
    title: "#98 验证二叉搜索树（中等）",
    content: `## 题目

**LeetCode #98 验证二叉搜索树** | 难度：中等

给你一个二叉树的根节点 \`root\`，判断其是否是一个有效的**二叉搜索树（BST）**。

有效 BST 定义：
- 节点的左子树只包含**小于**当前节点的数。
- 节点的右子树只包含**大于**当前节点的数。
- 所有左子树和右子树自身也必须是二叉搜索树。

示例：

\`\`\`
输入：root = [2,1,3]
输出：true

输入：root = [5,1,4,null,null,3,6]
输出：false
\`\`\`

## 思路

BST 的关键性质：**中序遍历是严格递增序列**。但最常见的坑是只比较「节点与左右孩子」而忽略「节点与整棵子树」的关系——例如 \`[5,1,4,null,null,3,6]\` 中 4 比 5 小但 4 的右孩子 6 大于根 5，整棵树不合法。

两种主流解法：

1. **递归传上下界**：每个节点必须落在区间 \`(min, max)\` 内。从根开始区间为 \`(-∞, +∞)\`，向左走时上界更新为当前值，向右走时下界更新为当前值。任一节点越界即非法。
2. **中序遍历单调递增**：中序遍历 BST 得到升序序列，只需检查当前节点值是否严格大于前驱节点值。不需要存整个序列，维护一个 \`prev\` 变量即可。

递归上下界法更直观地体现 BST 的「子树所有节点都要满足约束」这一语义。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    # 写法一：递归传上下界
    def isValidBST(self, root):
        def helper(node, low, high):
            # 空节点合法
            if not node:
                return True
            # 当前值必须严格在 (low, high) 内
            if not (low < node.val < high):
                return False
            # 左子树上界收紧为当前值，右子树下界收紧为当前值
            return (helper(node.left, low, node.val)
                    and helper(node.right, node.val, high))
        return helper(root, float('-inf'), float('inf'))

    # 写法二：中序遍历检查严格递增
    def isValidBST_inorder(self, root):
        self.prev = None
        def dfs(node):
            if not node:
                return True
            if not dfs(node.left):
                return False
            # 当前值必须严格大于前驱
            if self.prev is not None and node.val <= self.prev:
                return False
            self.prev = node.val
            return dfs(node.right)
        return dfs(root)
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

// 写法一：递归传上下界
var isValidBST = function(root) {
    const helper = (node, low, high) => {
        if (!node) return true;
        if (!(low < node.val && node.val < high)) return false;
        return helper(node.left, low, node.val)
            && helper(node.right, node.val, high);
    };
    // 用 +/-Infinity 表示无穷边界
    return helper(root, -Infinity, Infinity);
};

// 写法二：中序遍历检查严格递增
var isValidBSTInorder = function(root) {
    let prev = null;
    const dfs = (node) => {
        if (!node) return true;
        if (!dfs(node.left)) return false;
        if (prev !== null && node.val <= prev) return false;
        prev = node.val;
        return dfs(node.right);
    };
    return dfs(root);
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，每个节点访问一次
- 空间复杂度：O(h)，递归栈深度；最坏链状树为 O(n)，平衡树为 O(log n)

## 拓展

- 注意「严格大于」而非「大于等于」，BST 不允许重复值。
- 若允许重复值（如 #96 不同的二叉搜索树计数），通常约定「右子树可等于」需相应放宽约束。
- 中序遍历法可推广到「恢复 BST」#99：交换两个节点的中序序列会出现逆序对。`
  },

  // =============================================================
  // lc-102 #700 二叉搜索树中的搜索
  // =============================================================
  {
    id: "lc-102",
    group: "二叉搜索树",
    icon: "🎋",
    title: "#700 二叉搜索树中的搜索（简单）",
    content: `## 题目

**LeetCode #700 二叉搜索树中的搜索** | 难度：简单

给定二叉搜索树（BST）的根节点 \`root\` 和一个整数值 \`val\`，在 BST 中找到节点值等于 \`val\` 的节点，返回以该节点为根的子树；若不存在则返回 \`null\`。

示例：

\`\`\`
输入：root = [4,2,7,1,3], val = 2
输出：[2,1,3]

输入：root = [4,2,7,1,3], val = 5
输出：[]
\`\`\`

## 思路

BST 的核心性质：对于任意节点，左子树所有值 < 节点值 < 右子树所有值。这让「查找」可以像二分查找一样每次排除一半子树，平均 O(log n)。

1. **递归写法**：比较 \`val\` 与 \`root.val\`：
   - 相等则返回当前节点。
   - \`val\` 小于当前值，递归左子树。
   - \`val\` 大于当前值，递归右子树。
2. **迭代写法**：用 while 循环替代递归，空间降为 O(1)。每次比较后决定走左还是右，直到找到或走到空。

本题是 BST 系列的入门题，理解「BST 的查找具有二分性质」是后续插入、删除的基础。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    # 写法一：递归
    def searchBST(self, root, val):
        if not root:
            return None
        if root.val == val:
            return root
        # 利用 BST 性质选择方向
        if val < root.val:
            return self.searchBST(root.left, val)
        return self.searchBST(root.right, val)

    # 写法二：迭代（推荐，O(1) 空间）
    def searchBST_iter(self, root, val):
        while root:
            if root.val == val:
                return root
            root = root.left if val < root.val else root.right
        return None
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

// 写法一：递归
var searchBST = function(root, val) {
    if (!root) return null;
    if (root.val === val) return root;
    if (val < root.val) return searchBST(root.left, val);
    return searchBST(root.right, val);
};

// 写法二：迭代（推荐，O(1) 空间）
var searchBSTIter = function(root, val) {
    while (root) {
        if (root.val === val) return root;
        root = val < root.val ? root.left : root.right;
    }
    return null;
};
\`\`\`

## 复杂度

- 时间复杂度：O(h)，h 为树高；平衡 BST 为 O(log n)，最坏链状为 O(n)
- 空间复杂度：递归 O(h)，迭代 O(1)

## 拓展

- BST 的查找、插入、删除都依赖「比较决定方向」这一性质。
- 若 BST 不平衡，查找会退化为 O(n)，因此有了 AVL、红黑树等自平衡 BST。
- 二分查找可视为「退化的 BST」即数组形式的 BST。`
  },

  // =============================================================
  // lc-103 #701 二叉搜索树中的插入操作
  // =============================================================
  {
    id: "lc-103",
    group: "二叉搜索树",
    icon: "🎋",
    title: "#701 二叉搜索树中的插入操作（中等）",
    content: `## 题目

**LeetCode #701 二叉搜索树中的插入操作** | 难度：中等

给定二叉搜索树的根节点 \`root\` 和要插入的值 \`value\`，将值插入 BST。返回插入后的 BST 根节点。保证原 BST 中不存在该值。题目允许有多种有效插入方式，只要插入后仍是 BST 即可。

示例：

\`\`\`
输入：root = [4,2,7,1,3], val = 5
输出：[4,2,7,1,3,5]
\`\`\`

## 思路

插入的核心：从根开始比较，像查找一样往下走，直到找到一个空位置，把新节点挂上去。由于题目保证值不重复，且允许多种插入方式，最简单的就是「找到合适的叶子位置插入」，不改变原有结构。

1. **迭代写法**：维护一个 \`cur\` 指针，比较 \`val\` 与 \`cur.val\`：
   - \`val\` 较小则看左孩子，若左孩子为空就插入到左孩子位置；否则 \`cur = cur.left\` 继续。
   - \`val\` 较大则看右孩子，若右孩子为空就插入到右孩子位置；否则 \`cur = cur.right\` 继续。
2. **递归写法**：若 \`val < root.val\`，递归插入到左子树；若 \`val > root.val\`，递归插入到右子树。递归到空节点时返回新节点。

注意特例：若 \`root\` 为空，直接返回新节点作为树根。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    # 写法一：迭代
    def insertIntoBST(self, root, val):
        if not root:
            return TreeNode(val)
        cur = root
        while True:
            if val < cur.val:
                # 左为空就挂上去
                if not cur.left:
                    cur.left = TreeNode(val)
                    break
                cur = cur.left
            else:
                # 右为空就挂上去
                if not cur.right:
                    cur.right = TreeNode(val)
                    break
                cur = cur.right
        return root

    # 写法二：递归
    def insertIntoBST_rec(self, root, val):
        if not root:
            return TreeNode(val)
        if val < root.val:
            root.left = self.insertIntoBST_rec(root.left, val)
        else:
            root.right = self.insertIntoBST_rec(root.right, val)
        return root
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

// 写法一：迭代
var insertIntoBST = function(root, val) {
    if (!root) return new TreeNode(val);
    let cur = root;
    while (true) {
        if (val < cur.val) {
            if (!cur.left) {
                cur.left = new TreeNode(val);
                break;
            }
            cur = cur.left;
        } else {
            if (!cur.right) {
                cur.right = new TreeNode(val);
                break;
            }
            cur = cur.right;
        }
    }
    return root;
};

// 写法二：递归
var insertIntoBSTRec = function(root, val) {
    if (!root) return new TreeNode(val);
    if (val < root.val) {
        root.left = insertIntoBSTRec(root.left, val);
    } else {
        root.right = insertIntoBSTRec(root.right, val);
    }
    return root;
};
\`\`\`

## 复杂度

- 时间复杂度：O(h)，h 为树高；平衡 BST 为 O(log n)，最坏 O(n)
- 空间复杂度：迭代 O(1)，递归 O(h)

## 拓展

- 插入总是发生在「叶子位置」，不调整原树结构，因此插入多次后 BST 可能退化成链。
- 若要求插入后保持平衡，需要 AVL/红黑树的旋转操作。
- 对比 #450 删除节点：删除涉及「找后继 + 重构子树」，比插入复杂得多。`
  },

  // =============================================================
  // lc-104 #450 删除二叉搜索树中的节点
  // =============================================================
  {
    id: "lc-104",
    group: "二叉搜索树",
    icon: "🎋",
    title: "#450 删除二叉搜索树中的节点（中等）",
    content: `## 题目

**LeetCode #450 删除二叉搜索树中的节点** | 难度：中等

给定一个二叉搜索树的根节点 \`root\` 和一个值 \`key\`，删除 BST 中值为 \`key\` 的节点，并保持 BST 性质。返回根节点。

示例：

\`\`\`
输入：root = [5,3,6,2,4,null,7], key = 3
输出：[5,4,6,2,null,null,7]
\`\`\`

## 思路

删除是 BST 操作中最复杂的。先找到目标节点，再分三种情况处理：

1. **目标节点无孩子（叶子）**：直接删除，父节点对应指针置空。
2. **只有一个孩子**：用该孩子替代被删节点（孩子顶上来）。
3. **有两个孩子**：找**后继节点**（右子树的最小值，即右子树最左节点）或**前驱节点**（左子树最大值），用后继/前驱的值覆盖被删节点的值，然后递归删除后继/前驱节点。后继节点最多只有一个右孩子，所以第二次删除落到情况 1 或 2。

递归实现：根据 \`key\` 与 \`root.val\` 比较选择递归左/右子树，找到后处理上述三种情况。关键是「两个孩子」时用右子树最小值替换。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def deleteNode(self, root, key):
        if not root:
            return None
        if key < root.val:
            # 在左子树删
            root.left = self.deleteNode(root.left, key)
        elif key > root.val:
            # 在右子树删
            root.right = self.deleteNode(root.right, key)
        else:
            # 找到目标节点
            if not root.left:
                return root.right   # 只有右孩子或都没有
            if not root.right:
                return root.left    # 只有左孩子
            # 两个孩子：找右子树最小值（后继）
            succ = root.right
            while succ.left:
                succ = succ.left
            root.val = succ.val
            # 删掉后继节点
            root.right = self.deleteNode(root.right, succ.val)
        return root
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

var deleteNode = function(root, key) {
    if (!root) return null;
    if (key < root.val) {
        root.left = deleteNode(root.left, key);
    } else if (key > root.val) {
        root.right = deleteNode(root.right, key);
    } else {
        // 找到目标节点
        if (!root.left) return root.right;  // 只有右孩子或都没有
        if (!root.right) return root.left;   // 只有左孩子
        // 两个孩子：找右子树最小值（后继）
        let succ = root.right;
        while (succ.left) succ = succ.left;
        root.val = succ.val;
        // 删掉后继节点
        root.right = deleteNode(root.right, succ.val);
    }
    return root;
};
\`\`\`

## 复杂度

- 时间复杂度：O(h)，查找 O(h) + 找后继 O(h) + 递归删除后继 O(h)
- 空间复杂度：O(h)，递归栈深度

## 拓展

- 也可用「前驱」（左子树最大值）替换，效果对称。
- 红黑树/AVL 的删除除了替换值还要做旋转以保持平衡。
- 也可用「将被删节点的左子树直接接到右子树最左节点下」的方式避免第二次删除，但会改变树结构较多。`
  },

  // =============================================================
  // lc-105 #108 将有序数组转换为二叉搜索树
  // =============================================================
  {
    id: "lc-105",
    group: "二叉搜索树",
    icon: "🎋",
    title: "#108 将有序数组转换为二叉搜索树（简单）",
    content: `## 题目

**LeetCode #108 将有序数组转换为二叉搜索树** | 难度：简单

给你一个整数数组 \`nums\`，其中元素已经按**严格递增**顺序排列，请你将其转换为一棵**高度平衡**的二叉搜索树。高度平衡定义为每个节点的左右子树高度差不超过 1。

示例：

\`\`\`
输入：nums = [-10,-3,0,5,9]
输出：[0,-3,9,-10,null,5] 或 [0,-10,5,null,-3,null,9]
\`\`\`

## 思路

有序数组正是 BST 的**中序遍历**结果。要构造平衡 BST，关键是选好根节点——选数组中间元素作为根，能保证左右子树节点数相差不超过 1，从而保证平衡。

递归分治：
1. 取区间中点 \`mid = (left + right) // 2\` 作为根。
2. 左半区间 \`[left, mid-1]\` 递归构造左子树。
3. 右半区间 \`[mid+1, right]\` 递归构造右子树。

中点选取有两种：向下取整或向上取整，会得到不同但都合法的平衡 BST。下标用闭区间 \`[left, right]\` 较直观，\`left > right\` 时返回空。

本题体现了「中序 + 选根」构造 BST 的核心思想，与 #105「前序+中序构造二叉树」异曲同工。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def sortedArrayToBST(self, nums):
        def helper(left, right):
            # 区间为空
            if left > right:
                return None
            # 取中点作为根，保证左右子树节点数差 <= 1
            mid = (left + right) // 2
            root = TreeNode(nums[mid])
            root.left = helper(left, mid - 1)
            root.right = helper(mid + 1, right)
            return root
        return helper(0, len(nums) - 1)
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

var sortedArrayToBST = function(nums) {
    const helper = (left, right) => {
        // 区间为空
        if (left > right) return null;
        // 取中点作为根
        const mid = Math.floor((left + right) / 2);
        const root = new TreeNode(nums[mid]);
        root.left = helper(left, mid - 1);
        root.right = helper(mid + 1, right);
        return root;
    };
    return helper(0, nums.length - 1);
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，每个元素构造一个节点
- 空间复杂度：O(log n)，递归栈深度等于平衡树高度

## 拓展

- #109 有序链表转 BST：链表不能随机访问，可用「快慢指针找中点」或「中序模拟」（先递归左、再取值、再递归右）。
- 中点选 \`mid = (left + right + 1) // 2\` 会得到不同的合法平衡 BST。
- 这题是「分治构造」的典型，理解后可推广到「构造平衡二叉树」等题。`
  },

  // =============================================================
  // lc-106 #538 把二叉搜索树转换为累加树
  // =============================================================
  {
    id: "lc-106",
    group: "二叉搜索树",
    icon: "🎋",
    title: "#538 把二叉搜索树转换为累加树（中等）",
    content: `## 题目

**LeetCode #538 把二叉搜索树转换为累加树** | 难度：中等

给出 BST 的根节点 \`root\`，将其转换为**累加树（Greater Tree）**，使每个节点的新值等于原树中**大于或等于** \`node.val\` 的各节点值之和。

示例：

\`\`\`
输入：root = [4,1,6,0,2,5,7,null,null,null,3,null,null,null,8]
输出：[30,36,21,36,35,26,15,null,null,33,36,null,36]
\`\`\`

## 思路

BST 中序遍历是升序序列。本题要求每个节点加上「所有大于等于它的值」，即把该节点之后（更大的部分）累加进来。如果把中序遍历「反着走」——**右 → 根 → 左**（反中序），就会得到**降序**序列，遍历过程中维护一个累加和 \`sum\`，每访问一个节点就把 \`sum\` 加到该节点值上。

反中序递归：
1. 先递归右子树（更大的值先累加）。
2. 处理当前节点：\`sum += node.val\`，然后 \`node.val = sum\`。
3. 再递归左子树（更小的值）。

这样每个节点访问时，\`sum\` 已经包含了所有比它大的节点值之和，直接赋值即可。可以用递归或迭代（栈模拟）实现。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    # 写法一：反中序递归
    def convertBST(self, root):
        self.total = 0
        def dfs(node):
            if not node:
                return
            dfs(node.right)        # 先右（大值）
            self.total += node.val  # 累加
            node.val = self.total   # 更新为累加和
            dfs(node.left)          # 后左（小值）
        dfs(root)
        return root

    # 写法二：反中序迭代（栈）
    def convertBST_iter(self, root):
        total = 0
        stack = []
        cur = root
        while cur or stack:
            while cur:
                stack.append(cur)
                cur = cur.right     # 一路向右压栈
            cur = stack.pop()
            total += cur.val
            cur.val = total
            cur = cur.left          # 转向左子树
        return root
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

// 写法一：反中序递归
var convertBST = function(root) {
    let total = 0;
    const dfs = (node) => {
        if (!node) return;
        dfs(node.right);          // 先右（大值）
        total += node.val;        // 累加
        node.val = total;         // 更新为累加和
        dfs(node.left);           // 后左（小值）
    };
    dfs(root);
    return root;
};

// 写法二：反中序迭代（栈）
var convertBSTIter = function(root) {
    let total = 0;
    const stack = [];
    let cur = root;
    while (cur || stack.length) {
        while (cur) {
            stack.push(cur);
            cur = cur.right;       // 一路向右压栈
        }
        cur = stack.pop();
        total += cur.val;
        cur.val = total;
        cur = cur.left;            // 转向左子树
    }
    return root;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，每个节点访问一次
- 空间复杂度：O(h)，递归栈或显式栈深度

## 拓展

- #1038 从 BST 到更大的和树：与本题完全相同。
- 反中序遍历是处理「BST + 后缀和」类问题的通用套路。
- 若要求「前缀和」（小于等于当前值之和），用正常中序（左→根→右）累加即可。`
  },

  // =============================================================
  // lc-107 #230 二叉搜索树中第 K 小的元素
  // =============================================================
  {
    id: "lc-107",
    group: "二叉搜索树",
    icon: "🎋",
    title: "#230 二叉搜索树中第 K 小的元素（中等）",
    content: `## 题目

**LeetCode #230 二叉搜索树中第 K 小的元素** | 难度：中等

给定一个二叉搜索树的根节点 \`root\` 和一个整数 \`k\`，请你设计算法找出其中第 \`k\` 个最小元素（从 1 开始计数）。

示例：

\`\`\`
输入：root = [3,1,4,null,2], k = 1
输出：1

输入：root = [5,3,6,2,4,null,null,1], k = 3
输出：3
\`\`\`

## 思路

BST 的中序遍历是升序序列，所以第 k 小元素就是中序遍历的第 k 个值。两种实现：

1. **迭代中序 + 提前终止**：用栈模拟中序，每弹出一个节点计数加一，到第 k 个就返回。相比一次性遍历完，迭代可在计数到 k 时立即停止，平均更快。
2. **递归中序 + 计数器**：维护全局计数和结果，递归到第 k 个时记录答案并停止后续递归。

迭代版本更直观体现「提前终止」的优势：当 k 很小时不必遍历整棵树。若树会动态修改，可给每个节点维护「子树大小」字段，实现 O(h) 的查找。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    # 写法一：迭代中序，提前终止
    def kthSmallest(self, root, k):
        stack = []
        cur = root
        while cur or stack:
            while cur:
                stack.append(cur)
                cur = cur.left     # 一路向左
            cur = stack.pop()
            k -= 1                 # 访问当前节点
            if k == 0:
                return cur.val
            cur = cur.right        # 转向右子树

    # 写法二：递归中序 + 计数器
    def kthSmallest_rec(self, root, k):
        self.cnt = 0
        self.res = 0
        def dfs(node):
            if not node:
                return
            dfs(node.left)
            self.cnt += 1
            if self.cnt == k:
                self.res = node.val
                return
            dfs(node.right)
        dfs(root)
        return self.res
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

// 写法一：迭代中序，提前终止
var kthSmallest = function(root, k) {
    const stack = [];
    let cur = root;
    while (cur || stack.length) {
        while (cur) {
            stack.push(cur);
            cur = cur.left;        // 一路向左
        }
        cur = stack.pop();
        k--;                       // 访问当前节点
        if (k === 0) return cur.val;
        cur = cur.right;           // 转向右子树
    }
};

// 写法二：递归中序 + 计数器
var kthSmallestRec = function(root, k) {
    let cnt = 0;
    let res = 0;
    const dfs = (node) => {
        if (!node) return;
        dfs(node.left);
        cnt++;
        if (cnt === k) {
            res = node.val;
            return;
        }
        dfs(node.right);
    };
    dfs(root);
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(H + k)，H 为树高，找到最左节点需 O(H)，再访问 k 个节点
- 空间复杂度：O(H)，栈深度

## 拓展

- 第 K 大元素：用「反中序」（右→根→左）。
- 若频繁查询第 k 小，可给节点增加 \`size\` 字段记录子树节点数，查询变为 O(H)。
- #173 BST 迭代器正是本题的延伸：用栈实现「逐步中序」。`
  },

  // =============================================================
  // lc-108 #173 二叉搜索树迭代器
  // =============================================================
  {
    id: "lc-108",
    group: "二叉搜索树",
    icon: "🎋",
    title: "#173 二叉搜索树迭代器（中等）",
    content: `## 题目

**LeetCode #173 二叉搜索树迭代器** | 难度：中等

实现一个二叉搜索树迭代器类 \`BSTIterator\`，表示一个按**中序遍历**二叉搜索树的迭代器：
- \`BSTIterator(TreeNode root)\`：初始化迭代器，指针指向第一个中序元素之前。
- \`boolean hasNext()\`：是否存在下一个元素。
- \`int next()\`：返回下一个元素。

要求：\`next()\` 和 \`hasNext()\` 的平均时间复杂度为 O(1)，空间复杂度为 O(h)，h 为树高。

示例：

\`\`\`
输入：["BSTIterator", "next", "next", "hasNext", "next", "hasNext"]
      [[[7,3,15,null,null,9,20]], [], [], [], [], []]
输出：[null, 3, 7, true, 9, true]
\`\`\`

## 思路

朴素做法是初始化时做一次完整中序遍历存到数组，但这要 O(n) 空间。题目要求 O(h) 空间，需要**惰性**遍历：用栈模拟中序，只保留「从根到当前最左节点」这条路径。

核心技巧：
- 初始化时，从根一路向左压栈，栈顶就是中序第一个元素。
- \`next()\`：弹出栈顶，若它有右子树，把右孩子及其全部左链压栈（这是中序「访问根后转向右子树」的体现），返回弹出的值。
- \`hasNext()\`：栈非空即有。

这样每次 \`next()\` 平均 O(1)（均摊分析：每个节点压栈、出栈各一次，共 2n 次操作分摊到 n 次 next，平均 O(1)）。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class BSTIterator:
    def __init__(self, root):
        self.stack = []
        # 从根一路向左压栈
        while root:
            self.stack.append(root)
            root = root.left

    def next(self):
        # 栈顶即中序下一个节点
        node = self.stack.pop()
        val = node.val
        # 若有右子树，把右孩子及它的全部左链压栈
        cur = node.right
        while cur:
            self.stack.append(cur)
            cur = cur.left
        return val

    def hasNext(self):
        return len(self.stack) > 0
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

var BSTIterator = function(root) {
    this.stack = [];
    // 从根一路向左压栈
    while (root) {
        this.stack.push(root);
        root = root.left;
    }
};

BSTIterator.prototype.next = function() {
    // 栈顶即中序下一个节点
    const node = this.stack.pop();
    const val = node.val;
    // 若有右子树，把右孩子及它的全部左链压栈
    let cur = node.right;
    while (cur) {
        this.stack.push(cur);
        cur = cur.left;
    }
    return val;
};

BSTIterator.prototype.hasNext = function() {
    return this.stack.length > 0;
};
\`\`\`

## 复杂度

- 时间复杂度：\`next()\` 均摊 O(1)，\`hasNext()\` O(1)
- 空间复杂度：O(h)，栈最多保存从根到某叶的左链长度

## 拓展

- 本题就是 #230 第 K 小的迭代版本，核心都是「栈模拟中序 + 一路向左压栈」。
- 也可实现「反中序迭代器」用于反序遍历（如 #538 累加树）。
- 若支持 \`prev()\` 双向迭代，需要维护两个栈或额外的中序数组。`
  },

  // =============================================================
  // lc-109 #235 二叉搜索树的最近公共祖先
  // =============================================================
  {
    id: "lc-109",
    group: "二叉搜索树",
    icon: "🎋",
    title: "#235 二叉搜索树的最近公共祖先（简单）",
    content: `## 题目

**LeetCode #235 二叉搜索树的最近公共祖先** | 难度：简单

给定一个二叉搜索树，找到该树中两个指定节点 \`p\` 和 \`q\` 的**最近公共祖先（LCA）**。所有节点值唯一。\`p\`、\`q\` 本身也算作自己的祖先。

示例：

\`\`\`
输入：root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8
输出：6

输入：root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4
输出：2
\`\`\`

## 思路

普通二叉树 LCA（#236）需要后序遍历比较复杂，但 BST 有序，可利用性质**一次性判断方向**：

对于当前节点 \`cur\` 和两个目标 \`p\`、\`q\`（设 \`p.val < q.val\`）：
- 若 \`cur.val\` **大于两者**，则 LCA 在左子树，\`cur = cur.left\`。
- 若 \`cur.val\` **小于两者**，则 LCA 在右子树，\`cur = cur.right\`。
- 若 \`cur.val\` 处于 \`[p.val, q.val]\` 之间（含端点），则 \`cur\` 就是 LCA——因为 BST 中序有序，分叉点即 LCA。

也可递归或迭代实现。迭代 O(1) 空间更优。注意不要求 \`p\`、\`q\` 的输入大小关系，可先比较确定。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    # 写法一：迭代（推荐，O(1) 空间）
    def lowestCommonAncestor(self, root, p, q):
        while root:
            if root.val > p.val and root.val > q.val:
                # 比两者都大，去左子树
                root = root.left
            elif root.val < p.val and root.val < q.val:
                # 比两者都小，去右子树
                root = root.right
            else:
                # 处于两者之间（含等于），即为 LCA
                return root
        return None

    # 写法二：递归
    def lowestCommonAncestor_rec(self, root, p, q):
        if root.val > p.val and root.val > q.val:
            return self.lowestCommonAncestor_rec(root.left, p, q)
        if root.val < p.val and root.val < q.val:
            return self.lowestCommonAncestor_rec(root.right, p, q)
        return root
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

// 写法一：迭代（推荐，O(1) 空间）
var lowestCommonAncestor = function(root, p, q) {
    while (root) {
        if (root.val > p.val && root.val > q.val) {
            root = root.left;      // 比两者都大，去左
        } else if (root.val < p.val && root.val < q.val) {
            root = root.right;     // 比两者都小，去右
        } else {
            return root;           // 处于中间，即 LCA
        }
    }
    return null;
};

// 写法二：递归
var lowestCommonAncestorRec = function(root, p, q) {
    if (root.val > p.val && root.val > q.val) {
        return lowestCommonAncestorRec(root.left, p, q);
    }
    if (root.val < p.val && root.val < q.val) {
        return lowestCommonAncestorRec(root.right, p, q);
    }
    return root;
};
\`\`\`

## 复杂度

- 时间复杂度：O(h)，最坏走一条到叶子的路径
- 空间复杂度：迭代 O(1)，递归 O(h)

## 拓展

- #236 普通二叉树 LCA：需后序遍历判断左右子树是否各含一个目标。
- BST 的 LCA 利用有序性把 O(n) 降到 O(h)，是 BST 优势的典型体现。
- 若 p、q 未必都在树中，需额外校验存在性。`
  },

  // =============================================================
  // lc-110 #669 修剪二叉搜索树
  // =============================================================
  {
    id: "lc-110",
    group: "二叉搜索树",
    icon: "🎋",
    title: "#669 修剪二叉搜索树（中等）",
    content: `## 题目

**LeetCode #669 修剪二叉搜索树** | 难度：中等

给定一个二叉搜索树的根节点 \`root\`，以及范围 \`[low, high]\`，请修剪 BST 使所有节点值都在该范围内。修剪后应保持 BST 性质，返回新的根节点。

示例：

\`\`\`
输入：root = [1,0,2], low = 1, high = 2
输出：[1,null,2]

输入：root = [3,0,4,null,2,null,null,1], low = 1, high = 3
输出：[3,2,null,1]
\`\`\`

## 思路

直觉是「不在范围内就删掉」，但简单的删除会丢失子树。关键技巧：**修剪不是删节点，而是返回修剪后的子树**。

递归逻辑：
- 若 \`root.val < low\`：当前节点及其左子树都太小（BST 左子树全小于根），只能保留右子树修剪的结果。
- 若 \`root.val > high\`：当前节点及其右子树都太大，只能保留左子树修剪的结果。
- 否则当前节点合法：保留，并分别递归修剪左右子树。

为什么「小于 low 时整个左子树都可丢」？因为 BST 中左子树所有值 < 根值 < low，确实都不在范围；而右子树可能有些值在范围内，需递归修剪。同理「大于 high 时丢右子树」。

本题难点在于理解「返回修剪后的子树根」而非「原地删除」。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def trimBST(self, root, low, high):
        if not root:
            return None
        # 当前值太小：丢弃自己和左子树，返回修剪后的右子树
        if root.val < low:
            return self.trimBST(root.right, low, high)
        # 当前值太大：丢弃自己和右子树，返回修剪后的左子树
        if root.val > high:
            return self.trimBST(root.left, low, high)
        # 当前值合法：保留并修剪左右子树
        root.left = self.trimBST(root.left, low, high)
        root.right = self.trimBST(root.right, low, high)
        return root
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

var trimBST = function(root, low, high) {
    if (!root) return null;
    // 当前值太小：丢弃自己和左子树，返回修剪后的右子树
    if (root.val < low) {
        return trimBST(root.right, low, high);
    }
    // 当前值太大：丢弃自己和右子树，返回修剪后的左子树
    if (root.val > high) {
        return trimBST(root.left, low, high);
    }
    // 当前值合法：保留并修剪左右子树
    root.left = trimBST(root.left, low, high);
    root.right = trimBST(root.right, low, high);
    return root;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，最坏访问所有节点
- 空间复杂度：O(h)，递归栈深度

## 拓展

- 对比 #450 删除节点：本题是「范围批量删除」，但思路更优雅，靠「返回子树」而非「找后继替换」。
- 若区间范围会动态变化，可考虑线段树或平衡 BST。
- 也可用迭代实现：先找到合法根，再分别修剪左右边界，但递归更直观。`
  }
];
