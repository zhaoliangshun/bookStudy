// =============================================================
// LeetCode 面试算法 200 题 - 第九批章节（二叉树遍历，共 10 题）
// 章节 lc-81 ~ lc-90：前序/中序/后序遍历 + 层序遍历系列
// =============================================================

export const chapters = [
  // =============================================================
  // lc-81 #144 二叉树的前序遍历
  // =============================================================
  {
    id: "lc-81",
    group: "二叉树遍历",
    icon: "🌳",
    title: "#144 二叉树的前序遍历（简单）",
    content: `## 题目

**LeetCode #144 二叉树的前序遍历** | 难度：简单

给定二叉树的根节点 \`root\`，返回它节点值的**前序遍历**。

前序遍历顺序为：**根 → 左 → 右**。

示例：

\`\`\`
输入：root = [1,null,2,3]
输出：[1,2,3]
\`\`\`

## 思路

前序遍历是最直观的深度优先遍历，访问顺序为「根、左、右」。

1. **递归写法**：定义一个辅助函数 dfs，按照「访问根节点 → 递归左子树 → 递归右子树」的顺序处理，把节点值追加到结果数组。递归终止条件是节点为空。
2. **迭代写法**：用栈模拟递归过程。前序遍历的「根左右」天然契合栈的「后进先出」特性。先把根节点入栈，每次出栈一个节点访问其值，然后**先压右孩子再压左孩子**（这样左孩子会先出栈，保证「左在右前」）。

两种写法都遍历了所有节点一次，时间复杂度 O(n)。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    # 写法一：递归
    def preorderTraversal(self, root):
        res = []
        def dfs(node):
            if not node:
                return
            res.append(node.val)  # 根
            dfs(node.left)        # 左
            dfs(node.right)       # 右
        dfs(root)
        return res

    # 写法二：迭代（栈模拟）
    def preorderTraversal_iter(self, root):
        if not root:
            return []
        res, stack = [], [root]
        while stack:
            node = stack.pop()
            res.append(node.val)        # 访问根
            # 先压右再压左，保证左孩子先出栈
            if node.right:
                stack.append(node.right)
            if node.left:
                stack.append(node.left)
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

// 写法一：递归
var preorderTraversal = function(root) {
    const res = [];
    const dfs = (node) => {
        if (!node) return;
        res.push(node.val);   // 根
        dfs(node.left);       // 左
        dfs(node.right);      // 右
    };
    dfs(root);
    return res;
};

// 写法二：迭代
var preorderTraversalIter = function(root) {
    if (!root) return [];
    const res = [];
    const stack = [root];
    while (stack.length) {
        const node = stack.pop();
        res.push(node.val);
        if (node.right) stack.push(node.right);
        if (node.left) stack.push(node.left);
    }
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，每个节点访问一次
- 空间复杂度：O(n)，最坏情况栈深度等于节点数（链状树）；平均 O(log n)

## 拓展

- 递归写法可改用「标记法」统一三种遍历的迭代写法：入栈时给节点打标记，访问到标记时才输出值。
- Morris 遍历可以把空间复杂度降到 O(1)，但会临时修改树结构。
- 相关题目：#94 中序遍历、#145 后序遍历。`
  },

  // =============================================================
  // lc-82 #94 二叉树的中序遍历
  // =============================================================
  {
    id: "lc-82",
    group: "二叉树遍历",
    icon: "🌳",
    title: "#94 二叉树的中序遍历（简单）",
    content: `## 题目

**LeetCode #94 二叉树的中序遍历** | 难度：简单

给定二叉树的根节点 \`root\`，返回它的**中序遍历**。

中序遍历顺序为：**左 → 根 → 右**。

示例：

\`\`\`
输入：root = [1,null,2,3]
输出：[1,3,2]
\`\`\`

## 思路

中序遍历对二叉搜索树而言会得到递增序列，是验证 BST 的常用手段。

1. **递归写法**：按「递归左子树 → 访问根节点 → 递归右子树」顺序处理即可。
2. **迭代写法**：中序遍历的迭代比前序复杂。核心思路是**一路向左压栈**，直到走到最左下角的节点；然后弹出栈顶访问，再转向其右子树，对右子树重复「一路向左压栈」的过程。

迭代写法的关键是：**先不访问根，而是先把所有左孩子入栈，弹栈时才访问**。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    # 写法一：递归
    def inorderTraversal(self, root):
        res = []
        def dfs(node):
            if not node:
                return
            dfs(node.left)         # 左
            res.append(node.val)   # 根
            dfs(node.right)        # 右
        dfs(root)
        return res

    # 写法二：迭代
    def inorderTraversal_iter(self, root):
        res, stack = [], []
        cur = root
        while cur or stack:
            # 一路向左，全部压栈
            while cur:
                stack.append(cur)
                cur = cur.left
            cur = stack.pop()
            res.append(cur.val)    # 访问根
            cur = cur.right        # 转向右子树
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

// 写法一：递归
var inorderTraversal = function(root) {
    const res = [];
    const dfs = (node) => {
        if (!node) return;
        dfs(node.left);
        res.push(node.val);
        dfs(node.right);
    };
    dfs(root);
    return res;
};

// 写法二：迭代
var inorderTraversalIter = function(root) {
    const res = [];
    const stack = [];
    let cur = root;
    while (cur || stack.length) {
        while (cur) {
            stack.push(cur);
            cur = cur.left;
        }
        cur = stack.pop();
        res.push(cur.val);
        cur = cur.right;
    }
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)，最坏为链状树的栈深度

## 拓展

- BST 的中序遍历结果是有序的，常用于验证 BST（#98）。
- Morris 遍历可实现 O(1) 空间的中序遍历，利用空闲右指针建立临时线索。`
  },

  // =============================================================
  // lc-83 #145 二叉树的后序遍历
  // =============================================================
  {
    id: "lc-83",
    group: "二叉树遍历",
    icon: "🌳",
    title: "#145 二叉树的后序遍历（简单）",
    content: `## 题目

**LeetCode #145 二叉树的后序遍历** | 难度：简单

给定二叉树的根节点 \`root\`，返回它节点值的**后序遍历**。

后序遍历顺序为：**左 → 右 → 根**。

示例：

\`\`\`
输入：root = [1,null,2,3]
输出：[3,2,1]
\`\`\`

## 思路

后序遍历的递归写法与前序中序一样简单，但**迭代写法是三种遍历里最难的**，因为根节点要在左右子树都处理完之后才访问，需要记住「是否已经处理过右子树」。

这里介绍一个巧妙的**前序翻转法**：

1. 前序遍历是「根左右」，如果我们把压栈顺序改成「先压左、再压右」，就得到「根右左」。
2. 把「根右左」的结果**反转**，就得到了「左右根」即后序遍历。

这样迭代写法就和前序一样简单，只需最后反转数组即可。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    # 写法一：递归
    def postorderTraversal(self, root):
        res = []
        def dfs(node):
            if not node:
                return
            dfs(node.left)          # 左
            dfs(node.right)         # 右
            res.append(node.val)    # 根
        dfs(root)
        return res

    # 写法二：迭代（前序翻转法）
    def postorderTraversal_iter(self, root):
        if not root:
            return []
        res, stack = [], [root]
        while stack:
            node = stack.pop()
            res.append(node.val)         # 根（先放）
            # 先压左再压右 -> 出栈顺序为「根右左」
            if node.left:
                stack.append(node.left)
            if node.right:
                stack.append(node.right)
        # 反转「根右左」得到「左右根」
        return res[::-1]
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

// 写法一：递归
var postorderTraversal = function(root) {
    const res = [];
    const dfs = (node) => {
        if (!node) return;
        dfs(node.left);
        dfs(node.right);
        res.push(node.val);
    };
    dfs(root);
    return res;
};

// 写法二：迭代（前序翻转法）
var postorderTraversalIter = function(root) {
    if (!root) return [];
    const res = [];
    const stack = [root];
    while (stack.length) {
        const node = stack.pop();
        res.push(node.val);
        if (node.left) stack.push(node.left);
        if (node.right) stack.push(node.right);
    }
    return res.reverse();
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)

## 拓展

- 另一种迭代写法用「上次访问节点」标记，判断右子树是否已处理，但代码更复杂。
- 后序遍历常用于「计算树高度」「释放树内存」等场景。`
  },

  // =============================================================
  // lc-84 #102 二叉树的层序遍历
  // =============================================================
  {
    id: "lc-84",
    group: "二叉树遍历",
    icon: "🌳",
    title: "#102 二叉树的层序遍历（中等）",
    content: `## 题目

**LeetCode #102 二叉树的层序遍历** | 难度：中等

给你二叉树的根节点 \`root\`，返回其节点值的**层序遍历**。（即逐层地，从左到右访问所有节点）。

示例：

\`\`\`
输入：root = [3,9,20,null,null,15,7]
输出：[[3],[9,20],[15,7]]
\`\`\`

## 思路

层序遍历是典型的**广度优先搜索（BFS）**，用队列实现。

1. 初始化队列，把根节点入队。
2. 每次处理一层：先记录当前队列长度 \`size\`（即本层节点数），然后循环 \`size\` 次，每次出队一个节点，把它的值加入当前层结果，并把左右孩子入队。
3. 关键技巧是「**外层循环控制层数，内层循环按 size 处理本层全部节点**」，这样才能区分每一层。

如果不区分层次，只需一个 while 循环即可；区分层次必须先固定 \`size\`。

## Python 实现

\`\`\`python
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def levelOrder(self, root):
        if not root:
            return []
        res = []
        queue = deque([root])
        while queue:
            size = len(queue)           # 本层节点数
            level = []
            for _ in range(size):
                node = queue.popleft()
                level.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            res.append(level)
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

var levelOrder = function(root) {
    if (!root) return [];
    const res = [];
    const queue = [root];
    while (queue.length) {
        const size = queue.length;   // 本层节点数
        const level = [];
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            level.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        res.push(level);
    }
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，每个节点入队出队各一次
- 空间复杂度：O(n)，队列最多存一层的节点，最坏 n/2 个

## 拓展

- 层序遍历是众多树的 BFS 题目的基础模板：#107（自底向上）、#199（右视图）、#637（层平均）、#515（每层最大值）都基于此变形。
- JS 中 \`queue.shift()\` 是 O(n) 操作，数据量大时可改用双指针或循环队列优化。`
  },

  // =============================================================
  // lc-85 #107 二叉树的层序遍历 II
  // =============================================================
  {
    id: "lc-85",
    group: "二叉树遍历",
    icon: "🌳",
    title: "#107 二叉树的层序遍历 II（中等）",
    content: `## 题目

**LeetCode #107 二叉树的层序遍历 II** | 难度：中等

给定二叉树，返回其节点值**自底向上的层序遍历**。（即按从叶子节点所在层到根节点所在的层，逐层从左向右遍历）。

示例：

\`\`\`
输入：root = [3,9,20,null,null,15,7]
输出：[[15,7],[9,20],[3]]
\`\`\`

## 思路

本题是 #102 层序遍历的变体，只要把正常的层序遍历结果**反转**即可。

1. 先按常规 BFS 得到从上到下的层序结果 \`[[3],[9,20],[15,7]]\`。
2. 最后对结果数组整体反转，得到从下到上的顺序。

也可以在每层结束时把当前层结果插入到结果数组**头部**（用 \`insert(0, level)\` 或 \`unshift\`），但整体反转更高效（O(n) vs 多次头部插入的 O(n^2)）。

## Python 实现

\`\`\`python
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def levelOrderBottom(self, root):
        if not root:
            return []
        res = []
        queue = deque([root])
        while queue:
            size = len(queue)
            level = []
            for _ in range(size):
                node = queue.popleft()
                level.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            res.append(level)
        # 反转得到自底向上
        return res[::-1]
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

var levelOrderBottom = function(root) {
    if (!root) return [];
    const res = [];
    const queue = [root];
    while (queue.length) {
        const size = queue.length;
        const level = [];
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            level.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        res.push(level);
    }
    return res.reverse();
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)

## 拓展

- 本题是 #102 的直接变体，掌握层序遍历模板即可秒杀。
- 也可用 DFS 递归：按深度索引把节点值存入对应层，最后反转。`
  },

  // =============================================================
  // lc-86 #199 二叉树的右侧视图
  // =============================================================
  {
    id: "lc-86",
    group: "二叉树遍历",
    icon: "🌳",
    title: "#199 二叉树的右侧视图（中等）",
    content: `## 题目

**LeetCode #199 二叉树的右侧视图** | 难度：中等

给定一棵二叉树的根节点 \`root\`，想象自己站在它的**右侧**，按照从顶部到底部的顺序，返回能看到的节点值。

示例：

\`\`\`
输入：root = [1,2,3,null,5,null,4]
输出：[1,3,4]
\`\`\`

## 思路

站在右侧看，每一层只能看到**最右边的节点**。所以问题转化为：层序遍历，取每一层的最后一个节点。

1. **BFS 写法**：套用层序遍历模板，每层处理时记录最后一个节点的值即可。内层循环里，当 \`i == size - 1\` 时把节点值加入结果。
2. **DFS 写法**：按「根 → 右 → 左」的顺序递归，并记录当前深度。当深度等于结果数组长度时，说明这是该层第一次被访问的节点（即最右侧节点），加入结果。

两种写法都很经典，BFS 更直观，DFS 空间更省（退化为链状树时）。

## Python 实现

\`\`\`python
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    # 写法一：BFS
    def rightSideView_bfs(self, root):
        if not root:
            return []
        res = []
        queue = deque([root])
        while queue:
            size = len(queue)
            for i in range(size):
                node = queue.popleft()
                # 当前层的最后一个节点
                if i == size - 1:
                    res.append(node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
        return res

    # 写法二：DFS（根右左）
    def rightSideView(self, root):
        res = []
        def dfs(node, depth):
            if not node:
                return
            # 该深度第一次访问到的就是最右侧节点
            if depth == len(res):
                res.append(node.val)
            dfs(node.right, depth + 1)
            dfs(node.left, depth + 1)
        dfs(root, 0)
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

// 写法一：BFS
var rightSideViewBFS = function(root) {
    if (!root) return [];
    const res = [];
    const queue = [root];
    while (queue.length) {
        const size = queue.length;
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            if (i === size - 1) res.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
    }
    return res;
};

// 写法二：DFS
var rightSideView = function(root) {
    const res = [];
    const dfs = (node, depth) => {
        if (!node) return;
        if (depth === res.length) res.push(node.val);
        dfs(node.right, depth + 1);
        dfs(node.left, depth + 1);
    };
    dfs(root, 0);
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)（BFS 队列）或 O(h)（DFS 递归栈，h 为树高）

## 拓展

- 左视图同理，DFS 时先访问左孩子即可。
- 也可用「根左右」DFS 取每层第一个节点，效果相同。`
  },

  // =============================================================
  // lc-87 #637 二叉树的层平均值
  // =============================================================
  {
    id: "lc-87",
    group: "二叉树遍历",
    icon: "🌳",
    title: "#637 二叉树的层平均值（简单）",
    content: `## 题目

**LeetCode #637 二叉树的层平均值** | 难度：简单

给定一个非空二叉树的根节点 \`root\`，以数组的形式返回**每一层节点的平均值**。

示例：

\`\`\`
输入：root = [3,9,20,null,null,15,7]
输出：[3.00000,14.50000,11.00000]
解释：第 0 层平均值 = 3 / 1 = 3；第 1 层 = (9+20) / 2 = 14.5；第 2 层 = (15+7) / 2 = 11
\`\`\`

## 思路

这题是层序遍历的简单变形：对每一层，求节点值之和再除以节点个数。

1. 用 BFS 逐层处理，固定 \`size\` 为本层节点数。
2. 内层循环累加本层所有节点值到 \`total\`。
3. 一层结束后，\`total / size\` 即为本层平均值，加入结果数组。

注意除法：Python 3 中 \`/\` 是浮点除法，结果默认为浮点；JS 中数值都是浮点，直接相除即可。

## Python 实现

\`\`\`python
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def averageOfLevels(self, root):
        res = []
        queue = deque([root])
        while queue:
            size = len(queue)
            total = 0
            for _ in range(size):
                node = queue.popleft()
                total += node.val
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            # 本层平均值
            res.append(total / size)
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

var averageOfLevels = function(root) {
    const res = [];
    const queue = [root];
    while (queue.length) {
        const size = queue.length;
        let total = 0;
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            total += node.val;
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        res.push(total / size);
    }
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)

## 拓展

- 注意整数溢出：当节点值较大且层节点数多时，累加和可能超出 32 位整数范围，需用 64 位或浮点存储。
- 类似变体：每层最大值（#515）、每层求和、每层最右节点（#199）。`
  },

  // =============================================================
  // lc-88 #429 N 叉树的层序遍历
  // =============================================================
  {
    id: "lc-88",
    group: "二叉树遍历",
    icon: "🌳",
    title: "#429 N 叉树的层序遍历（中等）",
    content: `## 题目

**LeetCode #429 N 叉树的层序遍历** | 难度：中等

给定一个 N 叉树的根节点 \`root\`，返回其节点值的**层序遍历**。（即从左到右，逐层遍历）。

N 叉树的每个节点有多个子节点，存放在 \`children\` 数组中。

示例：

\`\`\`
输入：root = [1,null,3,2,4,null,5,6]
输出：[[1],[3,2,4],[5,6]]
\`\`\`

## 思路

和二叉树层序遍历思路完全一致，区别仅在于：二叉树每个节点最多两个子节点 \`left/right\`，而 N 叉树每个节点有**不定数量的子节点 \`children\`**。

1. 用队列做 BFS。
2. 每层固定 \`size\`，内层循环出队一个节点，把它的值加入本层结果。
3. 区别在于入队孩子：二叉树是分别判断 left、right；N 叉树直接遍历 \`node.children\` 数组，逐个入队。

注意处理 \`children\` 为空或不存在的情况。

## Python 实现

\`\`\`python
from collections import deque

class Node:
    def __init__(self, val=None, children=None):
        self.val = val
        self.children = children if children else []

class Solution:
    def levelOrder(self, root):
        if not root:
            return []
        res = []
        queue = deque([root])
        while queue:
            size = len(queue)
            level = []
            for _ in range(size):
                node = queue.popleft()
                level.append(node.val)
                # 把所有孩子入队
                for child in node.children:
                    queue.append(child)
            res.append(level)
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
function Node(val, children) {
    this.val = val;
    this.children = children || [];
}

var levelOrder = function(root) {
    if (!root) return [];
    const res = [];
    const queue = [root];
    while (queue.length) {
        const size = queue.length;
        const level = [];
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            level.push(node.val);
            // 把所有孩子入队
            for (const child of node.children) {
                queue.push(child);
            }
        }
        res.push(level);
    }
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，n 为所有节点总数
- 空间复杂度：O(n)

## 拓展

- N 叉树的前序/后序遍历也是把 left/right 换成遍历 children 数组。
- N 叉树常用于表示文件目录结构、评论楼层嵌套等场景。`
  },

  // =============================================================
  // lc-89 #515 在每个树行中找最大值
  // =============================================================
  {
    id: "lc-89",
    group: "二叉树遍历",
    icon: "🌳",
    title: "#515 在每个树行中找最大值（中等）",
    content: `## 题目

**LeetCode #515 在每个树行中找最大值** | 难度：中等

给定一棵二叉树的根节点 \`root\`，请找出该二叉树中**每一层的最大值**。

示例：

\`\`\`
输入：root = [1,3,2,5,3,null,9]
输出：[1,3,9]
\`\`\`

## 思路

又是层序遍历的变形：每一层求最大值而非收集所有值。

1. **BFS 写法**：逐层处理，初始化本层最大值为负无穷（\`-inf\`），内层循环中不断更新最大值。注意不能用 0 初始化，因为节点值可能为负数。
2. **DFS 写法**：按深度索引，递归时若当前深度首次到达，把节点值作为该层最大值存入结果；否则更新为更大者。

BFS 更直观，推荐使用。注意初始化用 \`float('-inf')\`（Python）或 \`-Infinity\`（JS）。

## Python 实现

\`\`\`python
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def largestValues(self, root):
        if not root:
            return []
        res = []
        queue = deque([root])
        while queue:
            size = len(queue)
            # 初始化为负无穷，应对负数节点值
            level_max = float('-inf')
            for _ in range(size):
                node = queue.popleft()
                level_max = max(level_max, node.val)
                if node.left:
                    queue.append(node.left)
                if node.right:
                    queue.append(node.right)
            res.append(level_max)
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

var largestValues = function(root) {
    if (!root) return [];
    const res = [];
    const queue = [root];
    while (queue.length) {
        const size = queue.length;
        let levelMax = -Infinity;
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            if (node.val > levelMax) levelMax = node.val;
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        res.push(levelMax);
    }
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)

## 拓展

- 本题易错点：用 0 初始化最大值，当节点值全为负时会得到错误结果。务必用负无穷。
- 同类变形：每层最小值、每层求和、每层平均值（#637）。`
  },

  // =============================================================
  // lc-90 #116 填充每个节点的下一个右侧节点指针
  // =============================================================
  {
    id: "lc-90",
    group: "二叉树遍历",
    icon: "🌳",
    title: "#116 填充每个节点的下一个右侧节点指针（中等）",
    content: `## 题目

**LeetCode #116 填充每个节点的下一个右侧节点指针** | 难度：中等

给定一个**完美二叉树**（所有叶子在同一层，每个父节点都有两个孩子），其所有叶子都在同一层，每个父节点都有两个子节点。填充每个节点的 \`next\` 指针，使其指向**同层右侧下一个节点**。如果不存在右侧节点，则 \`next = null\`。

示例：

\`\`\`
输入：root = [1,2,3,4,5,6,7]
输出：[1,#,2,3,#,4,5,6,7,#]（# 表示 next 指向）
\`\`\`

## 思路

本题要求 O(1) 空间（不算递归栈），关键在于**利用已建立的 next 指针**横向遍历。

1. **BFS 写法**：套用层序模板，每层从左到右处理，把当前节点 next 指向队列中下一个节点。简单但空间 O(n)。
2. **O(1) 空间写法**：从根节点开始，利用「上一层已经连好的 next 链」横向遍历当前层，同时为下一层建立 next 链：
   - \`left.next = right\`（亲兄弟）
   - \`right.next = cur.next.left\`（堂兄弟，前提是 cur.next 存在）
   - 然后沿 \`cur.next\` 横向移动，处理完一层后跳到下一层最左节点。

因为是完美二叉树，每层最左节点的 left 一定存在，可作为外层循环条件。

## Python 实现

\`\`\`python
class Node:
    def __init__(self, val=0, left=None, right=None, next=None):
        self.val = val
        self.left = left
        self.right = right
        self.next = next

class Solution:
    def connect(self, root):
        if not root:
            return root
        leftmost = root
        # 外层：逐层向下，最左节点的 left 存在说明还有下一层
        while leftmost.left:
            cur = leftmost
            # 内层：横向遍历当前层，连接下一层
            while cur:
                cur.left.next = cur.right            # 亲兄弟
                if cur.next:
                    cur.right.next = cur.next.left   # 堂兄弟
                cur = cur.next                       # 横向右移
            leftmost = leftmost.left                 # 下一层最左
        return root
\`\`\`

## JavaScript 实现

\`\`\`javascript
function Node(val, left, right, next) {
    this.val = val;
    this.left = left;
    this.right = right;
    this.next = next;
}

var connect = function(root) {
    if (!root) return root;
    let leftmost = root;
    // 外层：逐层向下
    while (leftmost.left) {
        let cur = leftmost;
        // 内层：横向遍历当前层，连接下一层
        while (cur) {
            cur.left.next = cur.right;            // 亲兄弟
            if (cur.next) {
                cur.right.next = cur.next.left;   // 堂兄弟
            }
            cur = cur.next;                       // 横向右移
        }
        leftmost = leftmost.left;                 // 下一层最左
    }
    return root;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(1)，仅用常数个指针（不算递归栈）

## 拓展

- #117 是本题的通用版（任意二叉树，非完美），思路类似但需处理缺失孩子的情况。
- 本题是「链式 BFS」的经典应用：用 next 指针替代队列，省去 O(n) 空间。`
  }
];
