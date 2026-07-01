// =============================================================
// LeetCode 面试算法 200 题 - 第十批章节（二叉树性质与构造，共 10 题）
// 章节 lc-91 ~ lc-100：深度/对称/翻转/平衡/构造等
// =============================================================

export const chapters = [
  // =============================================================
  // lc-91 #104 二叉树的最大深度
  // =============================================================
  {
    id: "lc-91",
    group: "二叉树性质与构造",
    icon: "🌲",
    title: "#104 二叉树的最大深度（简单）",
    content: `## 题目

**LeetCode #104 二叉树的最大深度** | 难度：简单

给定一个二叉树 \`root\`，返回其最大深度。

二叉树的**最大深度**是指从根节点到最远叶子节点的最长路径上的节点数。

示例：

\`\`\`
输入：root = [3,9,20,null,null,15,7]
输出：3
\`\`\`

## 思路

求最大深度有两种经典写法：

1. **递归（DFS）**：一棵树的最大深度 = 1（根节点本身）+ max(左子树深度, 右子树深度)。叶子节点（空节点）深度为 0。这是后序遍历思想的体现：先算左右子树，再汇总到根。
2. **迭代（BFS）**：层序遍历，记录遍历了多少层，层数即最大深度。

递归写法最简洁，是树的「分治」思想入门题。

## Python 实现

\`\`\`python
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    # 写法一：递归
    def maxDepth(self, root):
        if not root:
            return 0
        # 当前深度 = 1 + max(左子树深度, 右子树深度)
        left = self.maxDepth(root.left)
        right = self.maxDepth(root.right)
        return 1 + max(left, right)

    # 写法二：BFS 层数统计
    def maxDepth_bfs(self, root):
        if not root:
            return 0
        depth = 0
        queue = deque([root])
        while queue:
            size = len(queue)
            for _ in range(size):
                node = queue.popleft()
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            depth += 1
        return depth
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

// 写法一：递归
var maxDepth = function(root) {
    if (!root) return 0;
    const left = maxDepth(root.left);
    const right = maxDepth(root.right);
    return 1 + Math.max(left, right);
};

// 写法二：BFS 层数统计
var maxDepthBFS = function(root) {
    if (!root) return 0;
    let depth = 0;
    const queue = [root];
    while (queue.length) {
        const size = queue.length;
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        depth++;
    }
    return depth;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(h)，h 为树高；最坏链状树为 O(n)，平衡树为 O(log n)

## 拓展

- 最小深度（#111）类似，但要注意「单支树」时最小深度不是 1，要走到叶子节点。
- 求深度是后续很多树题的基础，如 #110 平衡二叉树、#124 最大路径和。`
  },

  // =============================================================
  // lc-92 #101 对称二叉树
  // =============================================================
  {
    id: "lc-92",
    group: "二叉树性质与构造",
    icon: "🌲",
    title: "#101 对称二叉树（简单）",
    content: `## 题目

**LeetCode #101 对称二叉树** | 难度：简单

给你一个二叉树的根节点 \`root\`，检查它是否**轴对称**。

示例：

\`\`\`
输入：root = [1,2,2,3,4,4,3]
输出：true

输入：root = [1,2,2,null,3,null,3]
输出：false
\`\`\`

## 思路

对称的本质是：左子树和右子树互为**镜像**。所以问题转化为「判断两棵子树是否镜像相等」。

判断镜像的两个节点 \`left\` 和 \`right\`：
- \`left.val == right.val\`
- \`left.left\` 和 \`right.right\` 镜像（外侧）
- \`left.right\` 和 \`right.left\` 镜像（内侧）

1. **递归写法**：定义辅助函数判断两节点是否镜像，按上述三个条件递归。
2. **迭代写法**：用队列成对入队，每次取出两个节点比较，再把它们的对应孩子成对入队（左的左配右的右，左的右配右的左）。

注意：比较的是「镜像位置」的节点，不是简单的「相同位置」。

## Python 实现

\`\`\`python
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    # 写法一：递归
    def isSymmetric(self, root):
        def isMirror(left, right):
            # 两个都为空，对称
            if not left and not right:
                return True
            # 只有一个为空，不对称
            if not left or not right:
                return False
            # 值相等，且外侧、内侧分别镜像
            return (left.val == right.val
                    and isMirror(left.left, right.right)
                    and isMirror(left.right, right.left))
        return isMirror(root.left, root.right)

    # 写法二：迭代（队列成对比较）
    def isSymmetric_iter(self, root):
        queue = deque([(root.left, root.right)])
        while queue:
            left, right = queue.popleft()
            if not left and not right:
                continue
            if not left or not right:
                return False
            if left.val != right.val:
                return False
            queue.append((left.left, right.right))
            queue.append((left.right, right.left))
        return True
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

// 写法一：递归
var isSymmetric = function(root) {
    const isMirror = (left, right) => {
        if (!left && !right) return true;
        if (!left || !right) return false;
        return left.val === right.val
            && isMirror(left.left, right.right)
            && isMirror(left.right, right.left);
    };
    return isMirror(root.left, root.right);
};

// 写法二：迭代
var isSymmetricIter = function(root) {
    const queue = [[root.left, root.right]];
    while (queue.length) {
        const [left, right] = queue.shift();
        if (!left && !right) continue;
        if (!left || !right) return false;
        if (left.val !== right.val) return false;
        queue.push([left.left, right.right]);
        queue.push([left.right, right.left]);
    }
    return true;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，每个节点访问一次
- 空间复杂度：O(n)，最坏情况队列/递归深度

## 拓展

- 本题是 #100 相同的树的变体：把「对应位置比较」改成「镜像位置比较」。
- 迭代写法也可用栈，思路一致。`
  },

  // =============================================================
  // lc-93 #226 翻转二叉树
  // =============================================================
  {
    id: "lc-93",
    group: "二叉树性质与构造",
    icon: "🌲",
    title: "#226 翻转二叉树（简单）",
    content: `## 题目

**LeetCode #226 翻转二叉树** | 难度：简单

给你一棵二叉树的根节点 \`root\`，翻转这棵二叉树，并返回其根节点。翻转即将每个节点的左右子树**交换**。

示例：

\`\`\`
输入：root = [4,2,7,1,3,6,9]
输出：[4,7,2,9,6,3,1]
\`\`\`

## 思路

翻转的本质：对每个节点，交换它的左右孩子。这是典型的「前序遍历」应用——先处理根（交换左右），再递归处理左右子树。

1. **递归写法**：终止条件是节点为空；否则交换当前节点左右孩子，再递归翻转左右子树。注意：交换和递归的顺序不影响结果（前序/后序都行），因为每个节点都只交换一次自己的孩子。
2. **迭代写法**：用栈做前序遍历，每次出栈一个节点就交换它的左右孩子，再把孩子入栈。

本题曾因让一位著名工程师在家做题时写不出来而闻名，说明即便简单题也要练熟递归思维。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    # 写法一：递归
    def invertTree(self, root):
        if not root:
            return None
        # 交换当前节点的左右孩子
        root.left, root.right = root.right, root.left
        # 递归翻转左右子树
        self.invertTree(root.left)
        self.invertTree(root.right)
        return root

    # 写法二：迭代
    def invertTree_iter(self, root):
        if not root:
            return None
        stack = [root]
        while stack:
            node = stack.pop()
            # 交换左右孩子
            node.left, node.right = node.right, node.left
            if node.left:
                stack.append(node.left)
            if node.right:
                stack.append(node.right)
        return root
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

// 写法一：递归
var invertTree = function(root) {
    if (!root) return null;
    // 交换左右孩子
    [root.left, root.right] = [root.right, root.left];
    // 递归翻转
    invertTree(root.left);
    invertTree(root.right);
    return root;
};

// 写法二：迭代
var invertTreeIter = function(root) {
    if (!root) return null;
    const stack = [root];
    while (stack.length) {
        const node = stack.pop();
        [node.left, node.right] = [node.right, node.left];
        if (node.left) stack.push(node.left);
        if (node.right) stack.push(node.right);
    }
    return root;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(h)，h 为树高

## 拓展

- 本题考察递归基本功，是面试「热身题」。
- 注意 Python/JS 的交换写法：\`a, b = b, a\` 和 \`[a, b] = [b, a]\`，避免用临时变量。`
  },

  // =============================================================
  // lc-94 #100 相同的树
  // =============================================================
  {
    id: "lc-94",
    group: "二叉树性质与构造",
    icon: "🌲",
    title: "#100 相同的树（简单）",
    content: `## 题目

**LeetCode #100 相同的树** | 难度：简单

给你两棵二叉树的根节点 \`p\` 和 \`q\`，编写函数来检验这两棵树是否**相同**（结构和节点值都相同）。

示例：

\`\`\`
输入：p = [1,2,3], q = [1,2,3]
输出：true

输入：p = [1,2], q = [1,null,2]
输出：false
\`\`\`

## 思路

两棵树相同，必须满足：
1. 两个根节点都为空（都空则相同）。
2. 只有一个为空则不同。
3. 都不为空时，根节点值相等，且左子树相同、右子树相同。

这是典型的**同步递归**：同时遍历两棵树的对应位置节点。

1. **递归写法**：按上述三条规则递归判断。
2. **迭代写法**：用队列成对入队，每次取出两个节点比较，再把对应孩子成对入队。

本题是 #101 对称二叉树的基础模板，把「对应位置」改成「镜像位置」即可解对称问题。

## Python 实现

\`\`\`python
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    # 写法一：递归
    def isSameTree(self, p, q):
        # 都为空，相同
        if not p and not q:
            return True
        # 只有一个为空，不同
        if not p or not q:
            return False
        # 值相等，且左右子树都相同
        return (p.val == q.val
                and self.isSameTree(p.left, q.left)
                and self.isSameTree(p.right, q.right))

    # 写法二：迭代
    def isSameTree_iter(self, p, q):
        queue = deque([(p, q)])
        while queue:
            n1, n2 = queue.popleft()
            if not n1 and not n2:
                continue
            if not n1 or not n2:
                return False
            if n1.val != n2.val:
                return False
            queue.append((n1.left, n2.left))
            queue.append((n1.right, n2.right))
        return True
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

// 写法一：递归
var isSameTree = function(p, q) {
    if (!p && !q) return true;
    if (!p || !q) return false;
    return p.val === q.val
        && isSameTree(p.left, q.left)
        && isSameTree(p.right, q.right);
};

// 写法二：迭代
var isSameTreeIter = function(p, q) {
    const queue = [[p, q]];
    while (queue.length) {
        const [n1, n2] = queue.shift();
        if (!n1 && !n2) continue;
        if (!n1 || !n2) return false;
        if (n1.val !== n2.val) return false;
        queue.push([n1.left, n2.left]);
        queue.push([n1.right, n2.right]);
    }
    return true;
};
\`\`\`

## 复杂度

- 时间复杂度：O(min(n, m))，n、m 为两棵树节点数，遍历到第一个不同处即停
- 空间复杂度：O(min(h1, h2))

## 拓展

- #572 子树另一棵树是本题的进阶：判断一棵树是否是另一棵的子结构。
- 对称二叉树（#101）= 判断 \`isSameTree(root.left 的镜像, root.right)\`。`
  },

  // =============================================================
  // lc-95 #110 平衡二叉树
  // =============================================================
  {
    id: "lc-95",
    group: "二叉树性质与构造",
    icon: "🌲",
    title: "#110 平衡二叉树（简单）",
    content: `## 题目

**LeetCode #110 平衡二叉树** | 难度：简单

给定一个二叉树，判断它是否是**高度平衡**的二叉树。

一棵高度平衡二叉树定义为：**一个二叉树每个节点的左右两个子树的高度差的绝对值不超过 1**，并且左右子树本身也是平衡的。

示例：

\`\`\`
输入：root = [3,9,20,null,null,15,7]
输出：true

输入：root = [1,2,2,3,3,null,null,4,4]
输出：false
\`\`\`

## 思路

关键陷阱：不是只判断根节点平衡，而是**每个节点**都要平衡。

1. **自顶向下（朴素递归）**：对每个节点调用 maxDepth 求左右子树高度差。缺点：高度被重复计算，最坏 O(n^2)。
2. **自底向上（推荐）**：后序遍历，递归返回节点高度；一旦发现某子树不平衡，就返回 -1 作为「不平衡」标记向上传递，提前剪枝。这样每个节点只访问一次，O(n)。

自底向上是核心优化：**用 -1 同时承载「高度」和「是否平衡」两种信息**——非负表示高度，-1 表示已不平衡。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def isBalanced(self, root):
        # 返回节点高度；若不平衡返回 -1
        def height(node):
            if not node:
                return 0
            left = height(node.left)
            if left == -1:
                return -1       # 左子树已不平衡，直接传递
            right = height(node.right)
            if right == -1:
                return -1       # 右子树已不平衡，直接传递
            # 当前节点不平衡
            if abs(left - right) > 1:
                return -1
            return 1 + max(left, right)
        return height(root) != -1
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

var isBalanced = function(root) {
    const height = (node) => {
        if (!node) return 0;
        const left = height(node.left);
        if (left === -1) return -1;   // 左子树不平衡，提前返回
        const right = height(node.right);
        if (right === -1) return -1;  // 右子树不平衡，提前返回
        if (Math.abs(left - right) > 1) return -1;  // 当前节点不平衡
        return 1 + Math.max(left, right);
    };
    return height(root) !== -1;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，自底向上每个节点访问一次
- 空间复杂度：O(h)，递归栈深度为树高

## 拓展

- 朴素自顶向下写法时间 O(n^2)，面试不推荐，但可作为对比理解。
- 「自底向上 + 提前剪枝」是树题常用优化套路，类似思想见 #543 直径、#124 最大路径和。`
  },

  // =============================================================
  // lc-96 #222 完全二叉树的节点数
  // =============================================================
  {
    id: "lc-96",
    group: "二叉树性质与构造",
    icon: "🌲",
    title: "#222 完全二叉树的节点数（中等）",
    content: `## 题目

**LeetCode #222 完全二叉树的节点数** | 难度：中等

给你一棵**完全二叉树**的根节点 \`root\`，求出该树的节点个数。

完全二叉树：除最后一层外全满，最后一层节点从左到右连续排列。要求时间复杂度低于 O(n)。

示例：

\`\`\`
输入：root = [1,2,3,4,5,6]
输出：6
\`\`\`

## 思路

普通遍历计数是 O(n)，但题目要求更快。利用**完全二叉树性质**可做到 O(log² n)。

完全二叉树的关键性质：如果某子树的左右「最左路径」「最右路径」深度相同，说明这棵子树是**满二叉树**，节点数 = 2^depth - 1，直接公式计算。否则递归分别计算左右子树节点数。

1. 计算 root 的左子树最左深度（一直向左走）和右子树最右深度（一直向右走）。
2. 若两者相等：说明整棵树是满二叉树，节点数 = 2^depth - 1。
3. 否则：节点数 = 1（根）+ 递归左子树 + 递归右子树。

由于每次递归必有一侧是满二叉树（O(1) 算出），只有另一侧递归下去，递归深度 O(log n)，每次求深度 O(log n)，总共 O(log² n)。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def countNodes(self, root):
        if not root:
            return 0
        # 计算最左路径深度
        left_depth = self.depth(root, True)
        # 计算最右路径深度
        right_depth = self.depth(root, False)
        # 左右深度相等 -> 满二叉树，直接公式
        if left_depth == right_depth:
            return (1 << left_depth) - 1   # 2^depth - 1
        # 否则递归左右子树
        return 1 + self.countNodes(root.left) + self.countNodes(root.right)

    def depth(self, node, is_left):
        # 沿最左/最右路径走到底，返回深度
        d = 0
        while node:
            d += 1
            node = node.left if is_left else node.right
        return d
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

var countNodes = function(root) {
    if (!root) return 0;
    const leftDepth = getDepth(root, true);
    const rightDepth = getDepth(root, false);
    // 左右深度相等 -> 满二叉树
    if (leftDepth === rightDepth) {
        return (1 << leftDepth) - 1;   // 2^depth - 1
    }
    // 否则递归左右子树
    return 1 + countNodes(root.left) + countNodes(root.right);
};

// 沿最左/最右路径求深度
function getDepth(node, isLeft) {
    let d = 0;
    while (node) {
        d++;
        node = isLeft ? node.left : node.right;
    }
    return d;
}
\`\`\`

## 复杂度

- 时间复杂度：O(log² n)
- 空间复杂度：O(log n)，递归深度

## 拓展

- 普通二叉树节点数只能 O(n) 遍历统计，本题快在利用「完全」性质。
- 位运算 \`1 << k\` 等于 \`2^k\`，比 \`Math.pow\` 更快。`
  },

  // =============================================================
  // lc-97 #257 二叉树的所有路径
  // =============================================================
  {
    id: "lc-97",
    group: "二叉树性质与构造",
    icon: "🌲",
    title: "#257 二叉树的所有路径（简单）",
    content: `## 题目

**LeetCode #257 二叉树的所有路径** | 难度：简单

给你一个二叉树的根节点 \`root\`，按任意顺序返回所有从**根节点到叶子节点**的路径，路径用 \`->\` 连接节点值。

示例：

\`\`\`
输入：root = [1,2,3,null,5]
输出：["1->2->5","1->3"]
\`\`\`

## 思路

这是一道典型的**回溯/DFS**题，在递归过程中维护「当前路径」。

1. 从根开始 DFS，每访问一个节点就把它的值追加到当前路径。
2. 当遇到叶子节点（无左右孩子）时，把当前路径拼成字符串加入结果。
3. 递归返回时回溯（移除当前节点值），保证兄弟分支路径互不干扰。

实现细节：
- 递归参数传「路径列表」或「路径字符串」都行。
- 拼接字符串时注意 \`->\` 只在节点间出现，首个节点前不加。
- 回溯写法：传引用时弹出末尾元素；传值（字符串拼接产生新串）则天然回溯无需手动移除。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def binaryTreePaths(self, root):
        res = []
        # path 用列表，便于回溯
        def dfs(node, path):
            if not node:
                return
            path.append(str(node.val))
            # 叶子节点，记录路径
            if not node.left and not node.right:
                res.append("->".join(path))
            else:
                dfs(node.left, path)
                dfs(node.right, path)
            # 回溯：弹出当前节点
            path.pop()
        dfs(root, [])
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

var binaryTreePaths = function(root) {
    const res = [];
    const dfs = (node, path) => {
        if (!node) return;
        path.push(String(node.val));
        // 叶子节点，记录路径
        if (!node.left && !node.right) {
            res.push(path.join("->"));
        } else {
            dfs(node.left, path);
            dfs(node.right, path);
        }
        // 回溯：弹出当前节点
        path.pop();
    };
    dfs(root, []);
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n^2)，最坏每条路径长度 O(n)，共 n 条路径
- 空间复杂度：O(n)，递归栈深度

## 拓展

- 也可用「字符串拼接」版本：每次传新字符串，无需手动回溯，但字符串拷贝开销大。
- 回溯是组合/路径问题的核心套路，本题是树回溯入门。`
  },

  // =============================================================
  // lc-98 #404 左叶子之和
  // =============================================================
  {
    id: "lc-98",
    group: "二叉树性质与构造",
    icon: "🌲",
    title: "#404 左叶子之和（简单）",
    content: `## 题目

**LeetCode #404 左叶子之和** | 难度：简单

给定二叉树的根节点 \`root\`，返回所有**左叶子**之和。

左叶子：某节点的左孩子，且该左孩子本身是叶子节点（无左右孩子）。

示例：

\`\`\`
输入：root = [3,9,20,null,null,15,7]
输出：24
解释：左叶子为 9 和 15，和为 24
\`\`\`

## 思路

关键点：判断一个节点是否为「左叶子」，**必须从它的父节点看**——只看当前节点无法知道自己是左孩子还是右孩子。

所以递归时，对每个节点检查它的左孩子：
- 若左孩子存在且是叶子（无左右孩子），则其值加入总和。
- 否则递归进入左子树继续找。
- 右子树也递归（右子树里可能有左叶子）。

也可以用 BFS/迭代，每个出队节点判断其左孩子是否为左叶子。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def sumOfLeftLeaves(self, root):
        if not root:
            return 0
        total = 0
        # 判断左孩子是否为左叶子
        if root.left and not root.left.left and not root.left.right:
            total += root.left.val
        else:
            # 左孩子不是叶子，递归进入左子树继续找
            total += self.sumOfLeftLeaves(root.left)
        # 右子树递归
        total += self.sumOfLeftLeaves(root.right)
        return total
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

var sumOfLeftLeaves = function(root) {
    if (!root) return 0;
    let total = 0;
    // 判断左孩子是否为左叶子
    if (root.left && !root.left.left && !root.left.right) {
        total += root.left.val;
    } else {
        // 左孩子不是叶子，递归进入左子树继续找
        total += sumOfLeftLeaves(root.left);
    }
    // 右子树递归
    total += sumOfLeftLeaves(root.right);
    return total;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(h)，递归栈深度

## 拓展

- 易错点：误把「最左节点」当左叶子。左叶子必须是叶子（无孩子），且是父的左孩子。
- 类似题：右叶子之和、左叶子计数，思路一致。
- 也可在递归参数里带一个「是否左孩子」标记，更通用。`
  },

  // =============================================================
  // lc-99 #513 找树左下角的值
  // =============================================================
  {
    id: "lc-99",
    group: "二叉树性质与构造",
    icon: "🌲",
    title: "#513 找树左下角的值（中等）",
    content: `## 题目

**LeetCode #513 找树左下角的值** | 难度：中等

给定一个二叉树的根节点 \`root\`，请找出该二叉树**最底层最左边**节点的值。

假设至少有一个节点。

示例：

\`\`\`
输入：root = [1,2,3,4,null,5,6,null,null,7]
输出：7
\`\`\`

## 思路

「最底层最左」= 最后一层的第一个节点。两种解法：

1. **BFS 写法（推荐）**：层序遍历，但每层**从右往左**入队（先右孩子后左孩子），这样最后一个出队的就是最底层最左节点。也可正常从左到右遍历，记录每层第一个节点，最后得到最后一层的最左值。
2. **DFS 写法**：按「根右左」顺序递归（或根左右），用深度判断。当遇到更深的节点时更新结果，因为是「根右左」顺序，第一次到达新深度的就是该层最右；若要最左，则按「根左右」并在 \`depth > maxDepth\` 时更新（首次到达该深度即最左）。

BFS 更直观：从右往左层序，最后访问的就是答案。

## Python 实现

\`\`\`python
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    # 写法一：BFS 从右往左，最后一个就是最底层最左
    def findBottomLeftValue(self, root):
        queue = deque([root])
        node = root
        while queue:
            node = queue.popleft()
            # 先右后左入队，保证最后出队的是最左节点
            if node.right:
                queue.append(node.right)
            if node.left:
                queue.append(node.left)
        return node.val

    # 写法二：DFS
    def findBottomLeftValue_dfs(self, root):
        self.max_depth = -1
        self.res = root.val
        def dfs(node, depth):
            if not node:
                return
            # 首次到达更深的层，更新结果（根左右顺序，首次即最左）
            if depth > self.max_depth:
                self.max_depth = depth
                self.res = node.val
            dfs(node.left, depth + 1)
            dfs(node.right, depth + 1)
        dfs(root, 0)
        return self.res
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

// 写法一：BFS 从右往左
var findBottomLeftValue = function(root) {
    const queue = [root];
    let node = root;
    while (queue.length) {
        node = queue.shift();
        // 先右后左入队
        if (node.right) queue.push(node.right);
        if (node.left) queue.push(node.left);
    }
    return node.val;
};

// 写法二：DFS
var findBottomLeftValueDFS = function(root) {
    let maxDepth = -1;
    let res = root.val;
    const dfs = (node, depth) => {
        if (!node) return;
        if (depth > maxDepth) {
            maxDepth = depth;
            res = node.val;
        }
        dfs(node.left, depth + 1);
        dfs(node.right, depth + 1);
    };
    dfs(root, 0);
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)（BFS 队列）或 O(h)（DFS 递归栈）

## 拓展

- 对应的「最右下角」可类比：BFS 从左往右，最后出队即最右下。
- DFS 解法中 \`>\` 与 \`>=\` 的区别决定取该层最左还是最右，务必想清楚。`
  },

  // =============================================================
  // lc-100 #105 从前序与中序遍历序列构造二叉树
  // =============================================================
  {
    id: "lc-100",
    group: "二叉树性质与构造",
    icon: "🌲",
    title: "#105 从前序与中序遍历序列构造二叉树（中等）",
    content: `## 题目

**LeetCode #105 从前序与中序遍历序列构造二叉树** | 难度：中等

给定两个整数数组 \`preorder\` 和 \`inorder\`，其中 \`preorder\` 是二叉树的**前序遍历**，\`inorder\` 是同一棵树的**中序遍历**，请构造二叉树并返回其根节点。假设没有重复元素。

示例：

\`\`\`
输入：preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
输出：[3,9,20,null,null,15,7]
\`\`\`

## 思路

前序遍历「根左右」，所以 \`preorder[0]\` 一定是根。中序遍历「左根右」，根把中序数组分成**左子树部分**和**右子树部分**。

递归步骤：
1. \`preorder\` 第一个元素是根节点，建立该节点。
2. 在 \`inorder\` 中找到根的下标 \`idx\`，则 \`inorder[0:idx]\` 是左子树，\`inorder[idx+1:]\` 是右子树。
3. 左子树大小 = idx，所以 \`preorder[1:1+idx]\` 是左子树前序，\`preorder[1+idx:]\` 是右子树前序。
4. 递归构造左右子树。

**优化**：用哈希表预处理 inorder 值到下标的映射，避免每次线性查找根，把 O(n^2) 降到 O(n)。同时用前序索引指针（一个全局变量）逐个推进，省去数组切片。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def buildTree(self, preorder, inorder):
        # 哈希表：值 -> 中序下标，O(1) 查找根
        idx_map = {val: i for i, val in enumerate(inorder)}
        self.pre_idx = 0  # 前序指针

        def helper(left, right):
            # 中序区间 [left, right) 为空则返回
            if left >= right:
                return None
            # 前序当前元素是根
            root_val = preorder[self.pre_idx]
            self.pre_idx += 1
            root = TreeNode(root_val)
            # 在中序中找根位置，划分左右子树
            idx = idx_map[root_val]
            root.left = helper(left, idx)
            root.right = helper(idx + 1, right)
            return root

        return helper(0, len(inorder))
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

var buildTree = function(preorder, inorder) {
    // 哈希表：值 -> 中序下标
    const idxMap = new Map();
    inorder.forEach((val, i) => idxMap.set(val, i));
    let preIdx = 0;  // 前序指针

    const helper = (left, right) => {
        // 中序区间 [left, right) 为空则返回
        if (left >= right) return null;
        // 前序当前元素是根
        const rootVal = preorder[preIdx++];
        const root = new TreeNode(rootVal);
        // 在中序中找根位置，划分左右子树
        const idx = idxMap.get(rootVal);
        root.left = helper(left, idx);
        root.right = helper(idx + 1, right);
        return root;
    };

    return helper(0, inorder.length);
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，哈希表查找 O(1)，每个节点构造一次
- 空间复杂度：O(n)，哈希表 + 递归栈

## 拓展

- #106 从中序与后序构造二叉树思路类似：后序最后一个是根。
- #1008 前序构造 BST：前序天然是「根左右」，BST 性质可直接递归构造。
- 关键理解：前序定位根，中序划分左右；用哈希表和前序指针避免数组切片是常见优化。`
  }
];
