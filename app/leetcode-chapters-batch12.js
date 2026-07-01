// =============================================================
// LeetCode 面试算法 200 题 - 第十二批章节（图与搜索，共 10 题）
// 章节 lc-111 ~ lc-120：岛屿/克隆/课程表/区域/水流/拓扑/BFS/二分图/并查集
// =============================================================

export const chapters = [
  // =============================================================
  // lc-111 #200 岛屿数量
  // =============================================================
  {
    id: "lc-111",
    group: "图与搜索",
    icon: "🗺️",
    title: "#200 岛屿数量（中等）",
    content: `## 题目

**LeetCode #200 岛屿数量** | 难度：中等

给你一个由 \`'1'\`（陆地）和 \`'0'\`（水）组成的二维网格 \`grid\`，请你计算网格中**岛屿的数量**。岛屿总是被水包围，并且每座岛屿只能由水平方向和/或垂直方向上相邻的陆地连接形成。此外，你可以假设该网格的四条边均被水包围。

示例：

\`\`\`
输入：grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
输出：3
\`\`\`

## 思路

把网格看作一个图，每个陆地为节点，上下左右相邻的陆地之间有边。岛屿数即「连通分量数」。遍历网格，遇到一个未被访问的陆地，就找到了一个新岛屿，计数加一并从该点出发**DFS 或 BFS 淹没**整个连通块（把访问过的陆地标记为已访问，常用「改为 '0'」就地标记，省去 visited 数组）。

- **DFS 写法**：从起点递归向四个方向扩展，遇到越界、水或已访问的格子就返回。
- **BFS 写法**：用队列，把相邻陆地入队逐层扩展。

两者本质相同，都是「flood fill 洪水填充」。DFS 递归写法最简洁，但网格很大时可能爆栈，此时用 BFS 或迭代 DFS 更稳。

## Python 实现

\`\`\`python
from collections import deque

class Solution:
    # 写法一：DFS 就地标记
    def numIslands(self, grid):
        if not grid:
            return 0
        rows, cols = len(grid), len(grid[0])
        count = 0

        def dfs(r, c):
            # 越界或非陆地，返回
            if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
                return
            grid[r][c] = '0'  # 标记为已访问（淹没）
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)

        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == '1':
                    count += 1
                    dfs(r, c)
        return count

    # 写法二：BFS
    def numIslands_bfs(self, grid):
        if not grid:
            return 0
        rows, cols = len(grid), len(grid[0])
        count = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == '1':
                    count += 1
                    queue = deque([(r, c)])
                    grid[r][c] = '0'
                    while queue:
                        x, y = queue.popleft()
                        for dx, dy in [(1,0),(-1,0),(0,1),(0,-1)]:
                            nx, ny = x + dx, y + dy
                            if 0 <= nx < rows and 0 <= ny < cols and grid[nx][ny] == '1':
                                grid[nx][ny] = '0'
                                queue.append((nx, ny))
        return count
\`\`\`

## JavaScript 实现

\`\`\`javascript
// 写法一：DFS 就地标记
var numIslands = function(grid) {
    if (!grid.length) return 0;
    const rows = grid.length, cols = grid[0].length;
    let count = 0;
    const dfs = (r, c) => {
        if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== '1') return;
        grid[r][c] = '0';  // 标记为已访问（淹没）
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
    };
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '1') {
                count++;
                dfs(r, c);
            }
        }
    }
    return count;
};

// 写法二：BFS
var numIslandsBFS = function(grid) {
    if (!grid.length) return 0;
    const rows = grid.length, cols = grid[0].length;
    let count = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '1') {
                count++;
                const queue = [[r, c]];
                grid[r][c] = '0';
                while (queue.length) {
                    const [x, y] = queue.shift();
                    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
                        const nx = x + dx, ny = y + dy;
                        if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && grid[nx][ny] === '1') {
                            grid[nx][ny] = '0';
                            queue.push([nx, ny]);
                        }
                    }
                }
            }
        }
    }
    return count;
};
\`\`\`

## 复杂度

- 时间复杂度：O(M * N)，每个格子访问一次
- 空间复杂度：DFS O(M * N) 最坏递归栈；BFS O(min(M, N)) 队列

## 拓展

- #695 岛屿的最大面积：flood fill 时统计面积。
- #1254 统计封闭岛屿：八方向变四方向，且从边界开始淹没有关岛屿。
- #1905 统计子岛屿：两图同时遍历判断包含关系。`
  },

  // =============================================================
  // lc-112 #133 克隆图
  // =============================================================
  {
    id: "lc-112",
    group: "图与搜索",
    icon: "🗺️",
    title: "#133 克隆图（中等）",
    content: `## 题目

**LeetCode #133 克隆图** | 难度：中等

给定无向**连通图**中一个节点的引用，返回该图的**深拷贝（克隆）**。图中的每个节点都包含它的值 \`val\` 和其邻居的列表 \`neighbors\`。

节点定义：
\`\`\`
class Node {
    public int val;
    public List<Node> neighbors;
}
\`\`\`

示例：

\`\`\`
输入：adjList = [[2,4],[1,3],[2,4],[1,3]]
输出：[[2,4],[1,3],[2,4],[1,3]]
\`\`\`

## 思路

图的深拷贝关键：**避免重复克隆同一节点**，否则会陷入死循环并破坏邻居关系。用哈希表 \`visited\` 记录「原节点 → 克隆节点」的映射。

- **DFS 写法**：递归克隆当前节点，若已在映射中直接返回克隆；否则新建克隆，再递归克隆所有邻居加入克隆的邻居列表。
- **BFS 写法**：用队列，先克隆起点入队。每次取出一个原节点，遍历其邻居：若邻居未克隆则克隆并入队；把邻居的克隆加入当前克隆的邻居列表。

图的表示方法：邻接表（本题 \`neighbors\` 列表）。给定点引用相当于给定起点，需遍历整个连通图。哈希表既是去重又是「已访问」标记。

## Python 实现

\`\`\`python
class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []

class Solution:
    # 写法一：DFS
    def cloneGraph(self, node):
        if not node:
            return None
        visited = {}  # 原节点 -> 克隆节点

        def dfs(orig):
            if orig in visited:
                return visited[orig]
            clone = Node(orig.val)
            visited[orig] = clone
            for nb in orig.neighbors:
                clone.neighbors.append(dfs(nb))
            return clone

        return dfs(node)

    # 写法二：BFS
    def cloneGraph_bfs(self, node):
        if not node:
            return None
        visited = {node: Node(node.val)}
        from collections import deque
        queue = deque([node])
        while queue:
            cur = queue.popleft()
            for nb in cur.neighbors:
                if nb not in visited:
                    visited[nb] = Node(nb.val)
                    queue.append(nb)
                visited[cur].neighbors.append(visited[nb])
        return visited[node]
\`\`\`

## JavaScript 实现

\`\`\`javascript
function Node(val, neighbors) {
    this.val = val === undefined ? 0 : val;
    this.neighbors = neighbors === undefined ? [] : neighbors;
}

// 写法一：DFS
var cloneGraph = function(node) {
    if (!node) return null;
    const visited = new Map();  // 原节点 -> 克隆节点
    const dfs = (orig) => {
        if (visited.has(orig)) return visited.get(orig);
        const clone = new Node(orig.val);
        visited.set(orig, clone);
        for (const nb of orig.neighbors) {
            clone.neighbors.push(dfs(nb));
        }
        return clone;
    };
    return dfs(node);
};

// 写法二：BFS
var cloneGraphBFS = function(node) {
    if (!node) return null;
    const visited = new Map();
    visited.set(node, new Node(node.val));
    const queue = [node];
    while (queue.length) {
        const cur = queue.shift();
        for (const nb of cur.neighbors) {
            if (!visited.has(nb)) {
                visited.set(nb, new Node(nb.val));
                queue.push(nb);
            }
            visited.get(cur).neighbors.push(visited.get(nb));
        }
    }
    return visited.get(node);
};
\`\`\`

## 复杂度

- 时间复杂度：O(V + E)，V 为节点数，E 为边数
- 空间复杂度：O(V)，哈希表存储所有克隆节点

## 拓展

- 深拷贝 vs 浅拷贝：浅拷贝只复制引用，深拷贝创建全新对象。
- 类似题：#138 复制带随机指针的链表，也是哈希表去重。
- 若图不连通需返回所有连通分量，要遍历所有节点起点。`
  },

  // =============================================================
  // lc-113 #207 课程表
  // =============================================================
  {
    id: "lc-113",
    group: "图与搜索",
    icon: "🗺️",
    title: "#207 课程表（中等）",
    content: `## 题目

**LeetCode #207 课程表** | 难度：中等

你这个学期必须选修 \`numCourses\` 门课程，记为 \`0\` 到 \`numCourses - 1\`。给你一个数组 \`prerequisites\`，其中 \`prerequisites[i] = [ai, bi]\` 表示要先修 \`bi\` 才能修 \`ai\`。请判断是否可能完成所有课程的学习（即判断图中**是否有环**）。

示例：

\`\`\`
输入：numCourses = 2, prerequisites = [[1,0]]
输出：true

输入：numCourses = 2, prerequisites = [[1,0],[0,1]]
输出：false
\`\`\`

## 思路

把课程看作节点，\`[ai, bi]\` 表示一条从 \`bi\` 指向 \`ai\` 的有向边（先修 → 后修）。能否修完所有课 = 有向图是否有环。两种主流解法：

1. **DFS 三色标记法**：每个节点有三种状态——未访问(0)、访问中(1)、已完成(2)。DFS 过程中若遇到「访问中」的节点，说明出现环（回边）。访问完一个节点的所有邻居后标记为「已完成」。
2. **BFS 拓扑排序（Kahn 算法）**：统计每个节点入度，把入度为 0 的节点入队，每次出队一个节点并将其邻居入度减一，若减到 0 就入队。最终若处理完的节点数等于课程数则无环。

本题先用 DFS 三色法，直观体现「环检测」。

## Python 实现

\`\`\`python
from collections import defaultdict, deque

class Solution:
    # 写法一：DFS 三色标记检测环
    def canFinish(self, numCourses, prerequisites):
        graph = defaultdict(list)
        for a, b in prerequisites:
            graph[b].append(a)   # b -> a
        # 0 未访问，1 访问中，2 已完成
        state = [0] * numCourses

        def dfs(node):
            if state[node] == 1:
                return False  # 遇到访问中的节点，有环
            if state[node] == 2:
                return True   # 已完成，无环
            state[node] = 1    # 标记访问中
            for nb in graph[node]:
                if not dfs(nb):
                    return False
            state[node] = 2    # 标记已完成
            return True

        for i in range(numCourses):
            if state[i] == 0:
                if not dfs(i):
                    return False
        return True

    # 写法二：BFS 拓扑排序
    def canFinish_bfs(self, numCourses, prerequisites):
        graph = defaultdict(list)
        indegree = [0] * numCourses
        for a, b in prerequisites:
            graph[b].append(a)
            indegree[a] += 1
        queue = deque([i for i in range(numCourses) if indegree[i] == 0])
        count = 0
        while queue:
            cur = queue.popleft()
            count += 1
            for nb in graph[cur]:
                indegree[nb] -= 1
                if indegree[nb] == 0:
                    queue.append(nb)
        return count == numCourses
\`\`\`

## JavaScript 实现

\`\`\`javascript
// 写法一：DFS 三色标记检测环
var canFinish = function(numCourses, prerequisites) {
    const graph = new Map();
    for (let i = 0; i < numCourses; i++) graph.set(i, []);
    for (const [a, b] of prerequisites) graph.get(b).push(a);
    // 0 未访问，1 访问中，2 已完成
    const state = new Array(numCourses).fill(0);
    const dfs = (node) => {
        if (state[node] === 1) return false;  // 有环
        if (state[node] === 2) return true;
        state[node] = 1;
        for (const nb of graph.get(node)) {
            if (!dfs(nb)) return false;
        }
        state[node] = 2;
        return true;
    };
    for (let i = 0; i < numCourses; i++) {
        if (state[i] === 0 && !dfs(i)) return false;
    }
    return true;
};

// 写法二：BFS 拓扑排序
var canFinishBFS = function(numCourses, prerequisites) {
    const graph = new Map();
    const indegree = new Array(numCourses).fill(0);
    for (let i = 0; i < numCourses; i++) graph.set(i, []);
    for (const [a, b] of prerequisites) {
        graph.get(b).push(a);
        indegree[a]++;
    }
    const queue = [];
    for (let i = 0; i < numCourses; i++) {
        if (indegree[i] === 0) queue.push(i);
    }
    let count = 0;
    while (queue.length) {
        const cur = queue.shift();
        count++;
        for (const nb of graph.get(cur)) {
            if (--indegree[nb] === 0) queue.push(nb);
        }
    }
    return count === numCourses;
};
\`\`\`

## 复杂度

- 时间复杂度：O(V + E)，建图 + 遍历所有节点和边
- 空间复杂度：O(V + E)，邻接表与状态数组

## 拓展

- #210 课程表 II：要求返回一种合法修课顺序，即拓扑序列本身。
- 三色标记法也可用于「找图中的所有环」。
- 若图不连通，需从每个未访问节点开始 DFS。`
  },

  // =============================================================
  // lc-114 #210 课程表 II
  // =============================================================
  {
    id: "lc-114",
    group: "图与搜索",
    icon: "🗺️",
    title: "#210 课程表 II（中等）",
    content: `## 题目

**LeetCode #210 课程表 II** | 难度：中等

现在你总共有 \`numCourses\` 门课需要选，记为 \`0\` 到 \`numCourses - 1\`。给你一个数组 \`prerequisites\`，其中 \`prerequisites[i] = [ai, bi]\` 表示要先修 \`bi\` 才能修 \`ai\`。返回你为了学完所有课程所安排的学习顺序。如果有多个正确顺序，返回**任意一个**即可。如果不能完成所有课程，返回**空数组**。

示例：

\`\`\`
输入：numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]
输出：[0,2,1,3] 或 [0,1,2,3]

输入：numCourses = 2, prerequisites = [[1,0],[0,1]]
输出：[]
\`\`\`

## 思路

这是「拓扑排序」的典型题——返回一个合法的拓扑序列。两种实现：

1. **BFS（Kahn 算法）**：统计入度，入度为 0 的节点入队，出队时加入结果并削减邻居入度，邻居入度为 0 时入队。结果长度等于课程数则有解，否则有环返回空数组。BFS 自然得到拓扑序。
2. **DFS 后序逆序**：DFS 完成一个节点（所有邻居访问完）时把节点压栈，最后栈的出栈顺序即拓扑序。注意要先检测环。

BFS 更直观且自带「入度为 0 优先」的顺序感，是面试首选。

## Python 实现

\`\`\`python
from collections import defaultdict, deque

class Solution:
    # 写法一：BFS 拓扑排序
    def findOrder(self, numCourses, prerequisites):
        graph = defaultdict(list)
        indegree = [0] * numCourses
        for a, b in prerequisites:
            graph[b].append(a)
            indegree[a] += 1
        # 入度为 0 的课程先入队
        queue = deque([i for i in range(numCourses) if indegree[i] == 0])
        order = []
        while queue:
            cur = queue.popleft()
            order.append(cur)
            for nb in graph[cur]:
                indegree[nb] -= 1
                if indegree[nb] == 0:
                    queue.append(nb)
        return order if len(order) == numCourses else []

    # 写法二：DFS 后序逆序
    def findOrder_dfs(self, numCourses, prerequisites):
        graph = defaultdict(list)
        for a, b in prerequisites:
            graph[b].append(a)
        state = [0] * numCourses
        order = []
        has_cycle = [False]
        def dfs(node):
            if state[node] == 1:
                has_cycle[0] = True
                return
            if state[node] == 2:
                return
            state[node] = 1
            for nb in graph[node]:
                dfs(nb)
                if has_cycle[0]:
                    return
            state[node] = 2
            order.append(node)  # 完成时加入
        for i in range(numCourses):
            if state[i] == 0:
                dfs(i)
                if has_cycle[0]:
                    return []
        order.reverse()  # 后序逆序即拓扑序
        return order
\`\`\`

## JavaScript 实现

\`\`\`javascript
// 写法一：BFS 拓扑排序
var findOrder = function(numCourses, prerequisites) {
    const graph = new Map();
    const indegree = new Array(numCourses).fill(0);
    for (let i = 0; i < numCourses; i++) graph.set(i, []);
    for (const [a, b] of prerequisites) {
        graph.get(b).push(a);
        indegree[a]++;
    }
    const queue = [];
    for (let i = 0; i < numCourses; i++) {
        if (indegree[i] === 0) queue.push(i);
    }
    const order = [];
    while (queue.length) {
        const cur = queue.shift();
        order.push(cur);
        for (const nb of graph.get(cur)) {
            if (--indegree[nb] === 0) queue.push(nb);
        }
    }
    return order.length === numCourses ? order : [];
};

// 写法二：DFS 后序逆序
var findOrderDFS = function(numCourses, prerequisites) {
    const graph = new Map();
    for (let i = 0; i < numCourses; i++) graph.set(i, []);
    for (const [a, b] of prerequisites) graph.get(b).push(a);
    const state = new Array(numCourses).fill(0);
    const order = [];
    let hasCycle = false;
    const dfs = (node) => {
        if (state[node] === 1) { hasCycle = true; return; }
        if (state[node] === 2) return;
        state[node] = 1;
        for (const nb of graph.get(node)) {
            dfs(nb);
            if (hasCycle) return;
        }
        state[node] = 2;
        order.push(node);
    };
    for (let i = 0; i < numCourses; i++) {
        if (state[i] === 0) {
            dfs(i);
            if (hasCycle) return [];
        }
    }
    order.reverse();
    return order;
};
\`\`\`

## 复杂度

- 时间复杂度：O(V + E)
- 空间复杂度：O(V + E)

## 拓展

- 拓扑排序只适用于 DAG（有向无环图），有环则无解。
- BFS 结果是「字典序最小」当队列用优先队列实现时。
- #1462 课程安排 IV：在拓扑排序基础上传递「是否为先修」的可达关系。`
  },

  // =============================================================
  // lc-115 #130 被围绕的区域
  // =============================================================
  {
    id: "lc-115",
    group: "图与搜索",
    icon: "🗺️",
    title: "#130 被围绕的区域（中等）",
    content: `## 题目

**LeetCode #130 被围绕的区域** | 难度：中等

给你一个 \`m x n\` 的矩阵 \`board\`，由若干字符 \`'X'\` 和 \`'O'\` 组成。找到所有被 \`'X'\` 围绕的区域，并将这些区域里的 \`'O'\` 全部替换为 \`'X'\`。一个区域被围绕的条件是该区域中所有 \`'O'\` 都不和边界上的 \`'O'\` 相连（上下左右）。

示例：

\`\`\`
输入：board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]
输出：[["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]
\`\`\`

## 思路

直接找「被围绕的 O」比较麻烦，反过来想更巧妙：**任何与边界相连的 O 都不会被围绕**。所以分两步：

1. 从**矩阵四条边**上所有 \`'O'\` 出发，做 DFS/BFS 把与之连通的所有 \`'O'\` 标记为临时字符（如 \`'#'\`），表示「与边界连通，保留」。
2. 遍历整个矩阵：把 \`'O'\` 改为 \`'X'\`（被围绕），把 \`'#'\` 还原为 \`'O'\`（保留）。

这是经典的「从边界反向标记」技巧，把困难问题转化为 flood fill。DFS 递归最简洁，但栈深度可能很大，BFS 或迭代更安全。

## Python 实现

\`\`\`python
class Solution:
    def solve(self, board):
        if not board:
            return
        rows, cols = len(board), len(board[0])

        def dfs(r, c):
            if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != 'O':
                return
            board[r][c] = '#'  # 标记为与边界连通
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)

        # 从四条边上的 'O' 出发淹没
        for r in range(rows):
            dfs(r, 0)
            dfs(r, cols - 1)
        for c in range(cols):
            dfs(0, c)
            dfs(rows - 1, c)

        # 遍历：被围绕的 O 变 X，# 还原为 O
        for r in range(rows):
            for c in range(cols):
                if board[r][c] == 'O':
                    board[r][c] = 'X'
                elif board[r][c] == '#':
                    board[r][c] = 'O'
\`\`\`

## JavaScript 实现

\`\`\`javascript
var solve = function(board) {
    if (!board.length) return;
    const rows = board.length, cols = board[0].length;
    const dfs = (r, c) => {
        if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== 'O') return;
        board[r][c] = '#';  // 标记为与边界连通
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
    };
    // 从四条边上的 'O' 出发淹没
    for (let r = 0; r < rows; r++) {
        dfs(r, 0);
        dfs(r, cols - 1);
    }
    for (let c = 0; c < cols; c++) {
        dfs(0, c);
        dfs(rows - 1, c);
    }
    // 遍历：被围绕的 O 变 X，# 还原为 O
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] === 'O') board[r][c] = 'X';
            else if (board[r][c] === '#') board[r][c] = 'O';
        }
    }
};
\`\`\`

## 复杂度

- 时间复杂度：O(M * N)，每个格子最多访问常数次
- 空间复杂度：O(M * N) 最坏递归栈

## 拓展

- 「从边界反向标记」是解决「与边界连通」类问题的通用套路。
- #417 太平洋大西洋水流问题也用类似思路：从两片海域反向标记。
- 若递归栈过深，可改 BFS 或并查集（把边界 O 与虚拟节点合并）。`
  },

  // =============================================================
  // lc-116 #417 太平洋大西洋水流问题
  // =============================================================
  {
    id: "lc-116",
    group: "图与搜索",
    icon: "🗺️",
    title: "#417 太平洋大西洋水流问题（中等）",
    content: `## 题目

**LeetCode #417 太平洋大西洋水流问题** | 难度：中等

有一个 \`m x n\` 的矩形岛屿，与太平洋和大西洋相邻。给你一个 \`m x n\` 的非负整数矩阵 \`heights\`，表示坐标 \`(r, c)\` 上单元格的地表高度。雨水只能按**上下左右**方向流向高度**相等或更低**的相邻单元格。请返回能同时流向太平洋和大西洋的坐标列表。

- 太平洋在左边界和上边界
- 大西洋在右边界和下边界

示例：

\`\`\`
输入：heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]
输出：[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]
\`\`\`

## 思路

正向思考「从某点能否到达两个大洋」需要对每个点都做两次 DFS/BFS，复杂度 O((M*N)^2)。反向思考更高效：**从大洋边界反向标记可达区域**——因为「水从高流到低」等价于「从低反向走到高」。

1. 从太平洋边界（第一行、第一列）出发做 DFS/BFS，标记所有能「反向到达」太平洋的点（沿高度非递减方向走）。
2. 从大西洋边界（最后一行、最后一列）出发，标记能到达大西洋的点。
3. 两个集合的交集即为所求。

反向 flood fill 把 O((M*N)^2) 降为 O(M*N)，是本题核心优化。

## Python 实现

\`\`\`python
class Solution:
    def pacificAtlantic(self, heights):
        if not heights:
            return []
        rows, cols = len(heights), len(heights[0])
        pac = set()  # 能流到太平洋的点
        atl = set()  # 能流到大西洋的点

        def dfs(r, c, visited, prev_height):
            # 越界、已访问、或高度更低（水不能往高处流，反向走需非递减）
            if ((r, c) in visited or r < 0 or r >= rows
                    or c < 0 or c >= cols or heights[r][c] < prev_height):
                return
            visited.add((r, c))
            dfs(r + 1, c, visited, heights[r][c])
            dfs(r - 1, c, visited, heights[r][c])
            dfs(r, c + 1, visited, heights[r][c])
            dfs(r, c - 1, visited, heights[r][c])

        # 从太平洋边界（左、上）出发
        for r in range(rows):
            dfs(r, 0, pac, heights[r][0])
        for c in range(cols):
            dfs(0, c, pac, heights[0][c])
        # 从大西洋边界（右、下）出发
        for r in range(rows):
            dfs(r, cols - 1, atl, heights[r][cols - 1])
        for c in range(cols):
            dfs(rows - 1, c, atl, heights[rows - 1][c])

        # 交集
        return list(map(list, pac & atl))
\`\`\`

## JavaScript 实现

\`\`\`javascript
var pacificAtlantic = function(heights) {
    if (!heights.length) return [];
    const rows = heights.length, cols = heights[0].length;
    const pac = new Set();  // 能流到太平洋的点
    const atl = new Set();  // 能流到大西洋的点
    const key = (r, c) => r * cols + c;
    const dfs = (r, c, visited, prevHeight) => {
        if (visited.has(key(r, c))) return;
        if (r < 0 || r >= rows || c < 0 || c >= cols) return;
        if (heights[r][c] < prevHeight) return;  // 反向走需非递减
        visited.add(key(r, c));
        dfs(r + 1, c, visited, heights[r][c]);
        dfs(r - 1, c, visited, heights[r][c]);
        dfs(r, c + 1, visited, heights[r][c]);
        dfs(r, c - 1, visited, heights[r][c]);
    };
    // 从太平洋边界（左、上）出发
    for (let r = 0; r < rows; r++) dfs(r, 0, pac, heights[r][0]);
    for (let c = 0; c < cols; c++) dfs(0, c, pac, heights[0][c]);
    // 从大西洋边界（右、下）出发
    for (let r = 0; r < rows; r++) dfs(r, cols - 1, atl, heights[r][cols - 1]);
    for (let c = 0; c < cols; c++) dfs(rows - 1, c, atl, heights[rows - 1][c]);
    // 交集
    const res = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (pac.has(key(r, c)) && atl.has(key(r, c))) res.push([r, c]);
        }
    }
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(M * N)，两次 DFS 各遍历一次
- 空间复杂度：O(M * N)，两个 visited 集合

## 拓展

- 「反向 flood fill」与 #130 被围绕的区域思路一致：从边界出发标记。
- 也可用 BFS 实现，效果相同。
- 若要求路径本身，可在 DFS 中记录前驱节点。`
  },

  // =============================================================
  // lc-117 #207 课程表（拓扑排序）
  // =============================================================
  {
    id: "lc-117",
    group: "图与搜索",
    icon: "🗺️",
    title: "#207 课程表（拓扑排序）（中等）",
    content: `## 题目

**LeetCode #207 课程表（拓扑排序视角）** | 难度：中等

本篇从**拓扑排序**视角重新审视 #207：判断是否能完成所有课程。题目同 #207：\`numCourses\` 门课，\`prerequisites[i] = [ai, bi]\` 表示先修 \`bi\` 才能修 \`ai\`。返回是否可能完成所有课程。

示例：

\`\`\`
输入：numCourses = 2, prerequisites = [[1,0],[0,1]]
输出：false
\`\`\`

## 思路

本题与 lc-113 同题，这里聚焦 **Kahn 算法（BFS 拓扑排序）** 的标准化实现，强调「拓扑排序」这个核心概念。

**拓扑排序**：对有向无环图（DAG）的所有节点进行线性排序，使对每条边 \`u -> v\`，\`u\` 都排在 \`v\` 前。如果图中有环，则不存在拓扑排序。

Kahn 算法步骤：
1. 计算每个节点的**入度**（有多少条边指向它）。
2. 把所有入度为 0 的节点入队（无前驱，可先处理）。
3. 每次出队一个节点，把它的所有邻居入度减 1；若某邻居入度变为 0，则入队。
4. 出队的节点序列即拓扑序；若出队节点数 = 总节点数，则无环；否则有环。

入度为 0 表示「所有前驱已处理完」，这正是「可以开始学」的条件。

## Python 实现

\`\`\`python
from collections import defaultdict, deque

class Solution:
    def canFinish(self, numCourses, prerequisites):
        # 建邻接表与入度数组
        graph = defaultdict(list)
        indegree = [0] * numCourses
        for a, b in prerequisites:
            # b -> a：先修 b 才能修 a
            graph[b].append(a)
            indegree[a] += 1

        # 入度为 0 的节点入队（无前驱，可先学）
        queue = deque([i for i in range(numCourses) if indegree[i] == 0])
        studied = 0
        while queue:
            course = queue.popleft()
            studied += 1
            # 学习该课后，所有后继课程入度 -1
            for nxt in graph[course]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    queue.append(nxt)
        # 学完的课程数等于总数则无环，否则有环
        return studied == numCourses
\`\`\`

## JavaScript 实现

\`\`\`javascript
var canFinish = function(numCourses, prerequisites) {
    // 建邻接表与入度数组
    const graph = new Map();
    const indegree = new Array(numCourses).fill(0);
    for (let i = 0; i < numCourses; i++) graph.set(i, []);
    for (const [a, b] of prerequisites) {
        // b -> a：先修 b 才能修 a
        graph.get(b).push(a);
        indegree[a]++;
    }
    // 入度为 0 的节点入队（无前驱，可先学）
    const queue = [];
    for (let i = 0; i < numCourses; i++) {
        if (indegree[i] === 0) queue.push(i);
    }
    let studied = 0;
    while (queue.length) {
        const course = queue.shift();
        studied++;
        // 学习该课后，所有后继课程入度 -1
        for (const nxt of graph.get(course)) {
            if (--indegree[nxt] === 0) queue.push(nxt);
        }
    }
    // 学完的课程数等于总数则无环，否则有环
    return studied === numCourses;
};
\`\`\`

## 复杂度

- 时间复杂度：O(V + E)，每个节点入队出队一次，每条边访问一次
- 空间复杂度：O(V + E)，邻接表 + 入度数组 + 队列

## 拓展

- 拓扑排序是解决「依赖关系」「任务调度」的核心算法。
- 用优先队列代替普通队列可得到「字典序最小」的拓扑序（如 #1462）。
- 拓扑排序也可用于「关键路径」分析（AOE 网），求工程最短工期。`
  },

  // =============================================================
  // lc-118 #994 腐烂的橘子
  // =============================================================
  {
    id: "lc-118",
    group: "图与搜索",
    icon: "🗺️",
    title: "#994 腐烂的橘子（中等）",
    content: `## 题目

**LeetCode #994 腐烂的橘子** | 难度：中等

在给定的 \`m x n\` 网格中，每个单元格可以有三个值之一：\`0\` 空单元格、\`1\` 新鲜橘子、\`2\` 腐烂橘子。每分钟，腐烂的橘子会向上下左右四个方向传播腐烂。返回直到没有新鲜橘子为止所必须经过的最小分钟数。如果不可能腐烂所有橘子，返回 \`-1\`。

示例：

\`\`\`
输入：grid = [[2,1,1],[1,1,0],[0,1,1]]
输出：4

输入：grid = [[2,1,1],[0,1,1],[1,0,1]]
输出：-1
\`\`\`

## 思路

这是典型的**多源 BFS**问题：所有腐烂橘子同时开始传播，每分钟扩展一层，求扩散到所有新鲜橘子所需层数（即时间）。

1. 先遍历网格，统计新鲜橘子数量，把所有初始腐烂橘子坐标入队。
2. BFS：每次处理当前队列里所有橘子（一轮 = 一分钟），对每个腐烂橘子的四方向邻居若是新鲜橘子，就让它腐烂并入队，新鲜计数减一。
3. BFS 结束后：若新鲜计数为 0 返回所用分钟数；否则返回 -1（还有新鲜橘子无法被传染到）。

为什么用 BFS 而非 DFS？因为腐烂是「同时扩散」，BFS 天然按层扩展，每层即一分钟，层数即时间。多源 BFS 是求「最短传染时间」的最优解。

## Python 实现

\`\`\`python
from collections import deque

class Solution:
    def orangesRotting(self, grid):
        rows, cols = len(grid), len(grid[0])
        queue = deque()
        fresh = 0
        # 统计新鲜橘子数，腐烂橘子入队
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 2:
                    queue.append((r, c))
                elif grid[r][c] == 1:
                    fresh += 1
        # 没有新鲜橘子，直接 0 分钟
        if fresh == 0:
            return 0

        minutes = 0
        directions = [(1,0),(-1,0),(0,1),(0,-1)]
        while queue:
            # 每轮处理当前所有腐烂橘子（一分钟）
            size = len(queue)
            for _ in range(size):
                r, c = queue.popleft()
                for dr, dc in directions:
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                        grid[nr][nc] = 2  # 变腐烂
                        fresh -= 1
                        queue.append((nr, nc))
            # 一轮扩散完，分钟数 +1（队列非空表示还会继续扩散）
            if queue:
                minutes += 1
        return minutes if fresh == 0 else -1
\`\`\`

## JavaScript 实现

\`\`\`javascript
var orangesRotting = function(grid) {
    const rows = grid.length, cols = grid[0].length;
    const queue = [];
    let fresh = 0;
    // 统计新鲜橘子数，腐烂橘子入队
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 2) queue.push([r, c]);
            else if (grid[r][c] === 1) fresh++;
        }
    }
    // 没有新鲜橘子，直接 0 分钟
    if (fresh === 0) return 0;

    let minutes = 0;
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    while (queue.length) {
        const size = queue.length;
        for (let i = 0; i < size; i++) {
            const [r, c] = queue.shift();
            for (const [dr, dc] of dirs) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
                    grid[nr][nc] = 2;  // 变腐烂
                    fresh--;
                    queue.push([nr, nc]);
                }
            }
        }
        // 一轮扩散完，分钟数 +1（队列非空表示还会继续扩散）
        if (queue.length) minutes++;
    }
    return fresh === 0 ? minutes : -1;
};
\`\`\`

## 复杂度

- 时间复杂度：O(M * N)，每个格子最多入队一次
- 空间复杂度：O(M * N) 最坏队列大小

## 拓展

- 多源 BFS 是「同时扩散取最短时间」的标准解法，类似 #1162 地图分析。
- 若要求最后传染的具体时刻，注意 minutes 的更新时机（队列为空时不再 +1）。
- #542 01 矩阵也是多源 BFS，求每个点到最近 0 的距离。`
  },

  // =============================================================
  // lc-119 #785 判断二分图
  // =============================================================
  {
    id: "lc-119",
    group: "图与搜索",
    icon: "🗺️",
    title: "#785 判断二分图（中等）",
    content: `## 题目

**LeetCode #785 判断二分图** | 难度：中等

给定一个无向图 \`graph\`，其中 \`graph[u]\` 是节点 \`u\` 的邻居数组，判断该图是否为**二分图**。二分图定义为：能把节点分成两个不相交集合，使每条边的两个端点分别属于不同集合（即能用两种颜色对节点染色，相邻节点颜色不同）。

示例：

\`\`\`
输入：graph = [[1,2,3],[0,2],[0,1,3],[0,2]]
输出：false

输入：graph = [[1,3],[0,2],[1,3],[0,2]]
输出：true
\`\`\`

## 思路

二分图判定 = **二着色问题**。用 BFS 或 DFS 给每个节点染色（0 未染、1 / -1 两种颜色），相邻节点必须不同色。若染色时发现邻居已是同色，则不是二分图。

- **BFS 写法**：从每个未染色节点出发，染 1，邻居染 -1，邻居的邻居染 1……用队列逐层染色，遇到已染同色的邻居即返回 false。
- **DFS 写法**：递归染色，当前染 \`color\`，邻居染 \`-color\`，遇到同色邻居即失败。

图可能不连通，需对每个未染色节点都尝试染色。邻接表表示：\`graph[u]\` 直接给出邻居。

## Python 实现

\`\`\`python
from collections import deque

class Solution:
    # 写法一：BFS 染色
    def isBipartite(self, graph):
        n = len(graph)
        color = [0] * n  # 0 未染，1 和 -1 两种颜色
        for start in range(n):
            if color[start] != 0:
                continue
            queue = deque([start])
            color[start] = 1
            while queue:
                u = queue.popleft()
                for v in graph[u]:
                    if color[v] == 0:
                        # 邻居染相反色
                        color[v] = -color[u]
                        queue.append(v)
                    elif color[v] == color[u]:
                        # 同色邻居，非二分图
                        return False
        return True

    # 写法二：DFS 染色
    def isBipartite_dfs(self, graph):
        n = len(graph)
        color = [0] * n
        def dfs(u, c):
            color[u] = c
            for v in graph[u]:
                if color[v] == 0:
                    if not dfs(v, -c):
                        return False
                elif color[v] == c:
                    return False
            return True
        for i in range(n):
            if color[i] == 0 and not dfs(i, 1):
                return False
        return True
\`\`\`

## JavaScript 实现

\`\`\`javascript
// 写法一：BFS 染色
var isBipartite = function(graph) {
    const n = graph.length;
    const color = new Array(n).fill(0);  // 0 未染，1 和 -1 两种颜色
    for (let start = 0; start < n; start++) {
        if (color[start] !== 0) continue;
        const queue = [start];
        color[start] = 1;
        while (queue.length) {
            const u = queue.shift();
            for (const v of graph[u]) {
                if (color[v] === 0) {
                    // 邻居染相反色
                    color[v] = -color[u];
                    queue.push(v);
                } else if (color[v] === color[u]) {
                    // 同色邻居，非二分图
                    return false;
                }
            }
        }
    }
    return true;
};

// 写法二：DFS 染色
var isBipartiteDFS = function(graph) {
    const n = graph.length;
    const color = new Array(n).fill(0);
    const dfs = (u, c) => {
        color[u] = c;
        for (const v of graph[u]) {
            if (color[v] === 0) {
                if (!dfs(v, -c)) return false;
            } else if (color[v] === c) {
                return false;
            }
        }
        return true;
    };
    for (let i = 0; i < n; i++) {
        if (color[i] === 0 && !dfs(i, 1)) return false;
    }
    return true;
};
\`\`\`

## 复杂度

- 时间复杂度：O(V + E)，每个节点和边访问一次
- 空间复杂度：O(V)，颜色数组和队列/递归栈

## 拓展

- 二分图判定也可用**并查集**：把每个节点的「对立节点」合并到同一集合，若发现冲突即非二分图。
- 二分图的重要应用：二分图最大匹配（匈牙利算法）。
- #886 可能的二分法：把关系转为「不相邻」约束，本质同二分图判定。`
  },

  // =============================================================
  // lc-120 #684 冗余连接
  // =============================================================
  {
    id: "lc-120",
    group: "图与搜索",
    icon: "🗺️",
    title: "#684 冗余连接（中等）",
    content: `## 题目

**LeetCode #684 冗余连接** | 难度：中等

树可以看成是一个连通无向无环图。给定一个由 \`n\` 个节点（节点值 \`1 ~ n\`）和 \`n\` 条边组成的图，其中多了一条边。返回一条可以删去的边，使得删除后图变为一棵有 \`n\` 个节点的树。若有多个答案，返回输入中**最后出现**的那条边。

示例：

\`\`\`
输入：edges = [[1,2],[1,3],[2,3]]
输出：[2,3]

输入：edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]
输出：[1,4]
\`\`\`

## 思路

一棵有 \`n\` 个节点的树只有 \`n-1\` 条边，本题给了 \`n\` 条边，多了正好一条，这条边会在图中形成一个环。我们要找的就是「构成环的最后一条边」。

经典解法是**并查集（Union-Find）**：
1. 初始化每个节点自成一个集合。
2. 按输入顺序逐条处理边 \`(u, v)\`：若 \`u\` 和 \`v\` 已在同一集合（find 相同根），说明这条边会形成环，即为答案。
3. 否则合并（union）两个集合。

并查集用「路径压缩 + 按秩合并」优化，单次操作接近 O(1)。按输入顺序处理保证返回「最后出现」的冗余边。

## Python 实现

\`\`\`python
class Solution:
    def findRedundantConnection(self, edges):
        parent = list(range(1001))  # 节点值 1 ~ 1000

        def find(x):
            # 路径压缩
            if parent[x] != x:
                parent[x] = find(parent[x])
            return parent[x]

        def union(x, y):
            rx, ry = find(x), find(y)
            if rx == ry:
                return False  # 已同根，合并失败（成环）
            parent[rx] = ry
            return True

        for u, v in edges:
            if not union(u, v):
                return [u, v]  # 第一条成环的边即答案
        return []
\`\`\`

## JavaScript 实现

\`\`\`javascript
var findRedundantConnection = function(edges) {
    const parent = new Array(1001).fill(0).map((_, i) => i);
    const find = (x) => {
        // 路径压缩
        if (parent[x] !== x) {
            parent[x] = find(parent[x]);
        }
        return parent[x];
    };
    const union = (x, y) => {
        const rx = find(x), ry = find(y);
        if (rx === ry) return false;  // 已同根，合并失败（成环）
        parent[rx] = ry;
        return true;
    };
    for (const [u, v] of edges) {
        if (!union(u, v)) return [u, v];  // 第一条成环的边即答案
    }
    return [];
};
\`\`\`

## 复杂度

- 时间复杂度：O(n * α(n))，α 是反阿克曼函数，接近常数
- 空间复杂度：O(n)，并查集父节点数组

## 拓展

- 并查集是处理「连通性」「环检测」的高效工具。
- #685 冗余连接 II：有向图的版本，需考虑「入度为 2」和「成环」两种情况，更复杂。
- 路径压缩让并查集近乎 O(1)，是面试高频数据结构。`
  }
];
