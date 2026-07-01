// =============================================================
// LeetCode 面试算法 200 题 - 第十六批章节（动态规划基础，共 10 题）
// 章节 lc-151 ~ lc-160：爬楼梯 / 最小花费 / 不同路径 / 整数拆分 / BST / 打家劫舍 / 股票
// =============================================================

export const chapters = [
  // =============================================================
  // lc-151 #70 爬楼梯
  // =============================================================
  {
    id: "lc-151",
    group: "动态规划基础",
    icon: "💰",
    title: "#70 爬楼梯（简单）",
    content: `## 题目

**LeetCode #70 爬楼梯** | 难度：简单

假设你正在爬楼梯。需要 \`n\` 阶你才能到达楼顶。每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？

示例：

\`\`\`
输入：n = 3
输出：3
解释：1+1+1 / 1+2 / 2+1 共 3 种
\`\`\`

## 思路

经典 DP 入门题，本质是「斐波那契数列」。

1. **状态定义**：\`dp[i]\` 表示爬到第 \`i\` 阶的方法数。
2. **状态转移方程**：\`dp[i] = dp[i-1] + dp[i-2]\`，因为到达第 \`i\` 阶只能从第 \`i-1\` 阶跨 1 步，或从第 \`i-2\` 阶跨 2 步。
3. **初始条件**：\`dp[0] = 1\`（在地面，1 种方式——不动），\`dp[1] = 1\`（爬 1 阶只有 1 种）。
4. **遍历顺序**：从左到右，\`i\` 从 2 到 \`n\`。
5. **最终结果**：\`dp[n]\`。

空间优化：只需前两个状态，可用滚动变量代替数组，空间降到 O(1)。

## Python 实现

\`\`\`python
class Solution:
    def climbStairs(self, n):
        if n <= 2:
            return n
        # 滚动变量
        prev, curr = 1, 2
        for i in range(3, n + 1):
            prev, curr = curr, prev + curr  # dp[i] = dp[i-1] + dp[i-2]
        return curr
\`\`\`

## JavaScript 实现

\`\`\`javascript
var climbStairs = function(n) {
    if (n <= 2) return n;
    // 滚动变量
    let prev = 1, curr = 2;
    for (let i = 3; i <= n; i++) {
        const next = prev + curr; // dp[i] = dp[i-1] + dp[i-2]
        prev = curr;
        curr = next;
    }
    return curr;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(1)

## 拓展

- 变体：#746 最小花费爬楼梯，把「方法数」改为「最小花费」。
- 进阶：允许步长为 1/2/3 时状态转移改为三项求和。`
  },

  // =============================================================
  // lc-152 #746 使用最小花费爬楼梯
  // =============================================================
  {
    id: "lc-152",
    group: "动态规划基础",
    icon: "💰",
    title: "#746 使用最小花费爬楼梯（简单）",
    content: `## 题目

**LeetCode #746 使用最小花费爬楼梯** | 难度：简单

给你一个整数数组 \`cost\`，\`cost[i]\` 是从第 \`i\` 个台阶向上爬的费用。你可以从下标 0 或 1 开始爬，每次爬 1 或 2 个台阶。求到达楼顶（下标 \`n\`，即越过最后一个台阶）的**最小花费**。

示例：

\`\`\`
输入：cost = [10,15,20]
输出：15
解释：从下标 1 出发，付 15 爬两步到楼顶，共 15
\`\`\`

## 思路

1. **状态定义**：\`dp[i]\` 表示到达第 \`i\` 阶（含楼顶）的最小累计花费。
2. **状态转移方程**：\`dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])\`，即从前一阶或前两阶爬上来，加上该阶的费用。
3. **初始条件**：\`dp[0] = 0\`，\`dp[1] = 0\`（起点 0 或 1 都不花钱）。
4. **遍历顺序**：从左到右，\`i\` 从 2 到 \`n\`。
5. **最终结果**：\`dp[n]\`（楼顶位置）。

注意：付费发生在「离开」某台阶时，所以到达起点不花钱，离开才花该台阶的 \`cost\`。

## Python 实现

\`\`\`python
class Solution:
    def minCostClimbingStairs(self, cost):
        n = len(cost)
        dp = [0] * (n + 1)  # dp[i] 到达第 i 阶的最小花费
        for i in range(2, n + 1):
            # 从 i-1 或 i-2 爬上来
            dp[i] = min(dp[i - 1] + cost[i - 1],
                        dp[i - 2] + cost[i - 2])
        return dp[n]
\`\`\`

## JavaScript 实现

\`\`\`javascript
var minCostClimbingStairs = function(cost) {
    const n = cost.length;
    const dp = new Array(n + 1).fill(0); // dp[i] 到达第 i 阶的最小花费
    for (let i = 2; i <= n; i++) {
        // 从 i-1 或 i-2 爬上来
        dp[i] = Math.min(dp[i - 1] + cost[i - 1],
                        dp[i - 2] + cost[i - 2]);
    }
    return dp[n];
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)，可滚动变量优化到 O(1)

## 拓展

- 与 #70 对比：方法数（求和）vs 最小花费（求 min）。
- 关键区分「到达」与「离开」的花费时机。`
  },

  // =============================================================
  // lc-153 #62 不同路径
  // =============================================================
  {
    id: "lc-153",
    group: "动态规划基础",
    icon: "💰",
    title: "#62 不同路径（中等）",
    content: `## 题目

**LeetCode #62 不同路径** | 难度：中等

一个 \`m x n\` 网格，机器人位于左上角，每次只能向下或向右走一步，求到达右下角的不同路径数。

示例：

\`\`\`
输入：m = 3, n = 7
输出：28
\`\`\`

## 思路

经典二维 DP。

1. **状态定义**：\`dp[i][j]\` 表示从左上角到 \`(i, j)\` 的路径数。
2. **状态转移方程**：\`dp[i][j] = dp[i-1][j] + dp[i][j-1]\`，因为只能从上方或左方走来。
3. **初始条件**：第一行 \`dp[0][j] = 1\`，第一列 \`dp[i][0] = 1\`（只有一条直线路径）。
4. **遍历顺序**：从上到下，从左到右（保证依赖项已计算）。
5. **最终结果**：\`dp[m-1][n-1]\`。

空间优化：用一维数组滚动，\`dp[j] += dp[j-1]\`，空间 O(n)。

## Python 实现

\`\`\`python
class Solution:
    def uniquePaths(self, m, n):
        # 一维滚动数组
        dp = [1] * n  # 第一行全为 1
        for i in range(1, m):
            for j in range(1, n):
                dp[j] += dp[j - 1]  # dp[j] = dp[j](上) + dp[j-1](左)
        return dp[n - 1]
\`\`\`

## JavaScript 实现

\`\`\`javascript
var uniquePaths = function(m, n) {
    // 一维滚动数组
    const dp = new Array(n).fill(1); // 第一行全为 1
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            dp[j] += dp[j - 1]; // dp[j] = dp[j](上) + dp[j-1](左)
        }
    }
    return dp[n - 1];
};
\`\`\`

## 复杂度

- 时间复杂度：O(m * n)
- 空间复杂度：O(n)，滚动数组优化

## 拓展

- 数学法：组合数 \`C(m+n-2, m-1)\`，O(min(m,n)) 时间 O(1) 空间。
- #63 增加障碍物，#64 求最小路径和。`
  },

  // =============================================================
  // lc-154 #63 不同路径 II
  // =============================================================
  {
    id: "lc-154",
    group: "动态规划基础",
    icon: "💰",
    title: "#63 不同路径 II（中等）",
    content: `## 题目

**LeetCode #63 不同路径 II** | 难度：中等

一个 \`m x n\` 网格，机器人位于左上角，每次只能向下或向右走一步。网格中有障碍物（\`obstacleGrid[i][j] = 1\` 表示障碍）。求到达右下角的不同路径数。

示例：

\`\`\`
输入：obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]
输出：2
\`\`\`

## 思路

在 #62 基础上加入障碍处理。

1. **状态定义**：\`dp[i][j]\` 表示到 \`(i, j)\` 的路径数。
2. **状态转移方程**：若 \`grid[i][j]\` 是障碍，\`dp[i][j] = 0\`；否则 \`dp[i][j] = dp[i-1][j] + dp[i][j-1]\`。
3. **初始条件**：起点若为障碍则 \`dp[0][0] = 0\` 否则为 1；第一行/第一列在遇到第一个障碍前为 1，障碍及之后全为 0。
4. **遍历顺序**：从上到下、从左到右。
5. **最终结果**：\`dp[m-1][n-1]\`。

注意：第一行和第一列要单独初始化，因为它们只能从一个方向来。

## Python 实现

\`\`\`python
class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid):
        m, n = len(obstacleGrid), len(obstacleGrid[0])
        dp = [[0] * n for _ in range(m)]
        # 起点
        dp[0][0] = 0 if obstacleGrid[0][0] == 1 else 1
        # 第一列
        for i in range(1, m):
            dp[i][0] = dp[i - 1][0] if obstacleGrid[i][0] == 0 else 0
        # 第一行
        for j in range(1, n):
            dp[0][j] = dp[0][j - 1] if obstacleGrid[0][j] == 0 else 0
        # 其余位置
        for i in range(1, m):
            for j in range(1, n):
                if obstacleGrid[i][j] == 1:
                    dp[i][j] = 0
                else:
                    dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
        return dp[m - 1][n - 1]
\`\`\`

## JavaScript 实现

\`\`\`javascript
var uniquePathsWithObstacles = function(obstacleGrid) {
    const m = obstacleGrid.length, n = obstacleGrid[0].length;
    const dp = Array.from({ length: m }, () => new Array(n).fill(0));
    // 起点
    dp[0][0] = obstacleGrid[0][0] === 1 ? 0 : 1;
    // 第一列
    for (let i = 1; i < m; i++) {
        dp[i][0] = obstacleGrid[i][0] === 0 ? dp[i - 1][0] : 0;
    }
    // 第一行
    for (let j = 1; j < n; j++) {
        dp[0][j] = obstacleGrid[0][j] === 0 ? dp[0][j - 1] : 0;
    }
    // 其余位置
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            if (obstacleGrid[i][j] === 1) {
                dp[i][j] = 0;
            } else {
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
            }
        }
    }
    return dp[m - 1][n - 1];
};
\`\`\`

## 复杂度

- 时间复杂度：O(m * n)
- 空间复杂度：O(m * n)，可滚动数组优化到 O(n)

## 拓展

- 关键点：障碍处路径数为 0，且会阻断后续同行/同列的可达性。
- 可用原地修改 \`grid\` 或一维数组进一步省空间。`
  },

  // =============================================================
  // lc-155 #343 整数拆分
  // =============================================================
  {
    id: "lc-155",
    group: "动态规划基础",
    icon: "💰",
    title: "#343 整数拆分（中等）",
    content: `## 题目

**LeetCode #343 整数拆分** | 难度：中等

给定一个正整数 \`n\`，将其拆分为 **至少两个** 正整数之和，使这些整数乘积最大。返回最大乘积。

示例：

\`\`\`
输入：n = 10
输出：36
解释：10 = 3 + 3 + 4，乘积 3*3*4 = 36
\`\`\`

## 思路

1. **状态定义**：\`dp[i]\` 表示正整数 \`i\` 拆分（至少两份）后的最大乘积。
2. **状态转移方程**：对 \`i\`，枚举第一段切出的长度 \`j\`（\`1 <= j < i\`），剩下 \`i-j\` 可以不再切（乘积为 \`j*(i-j)\`）或继续切（乘积为 \`j*dp[i-j]\`）。所以：

\`dp[i] = max(j*(i-j), j*dp[i-j])\` 对所有 \`j\` 取最大。

3. **初始条件**：\`dp[1] = 1\`（虽然 1 无法拆成两份，作为递推基础），\`dp[2] = 1\`（2 = 1+1）。
4. **遍历顺序**：\`i\` 从 3 到 \`n\`，每个 \`i\` 枚举 \`j\` 从 1 到 \`i-1\`。
5. **最终结果**：\`dp[n]\`。

数学结论：尽量拆成 3，余 1 则把一个 3+1 换成 2+2，可 O(1) 数学法但 DP 更通用。

## Python 实现

\`\`\`python
class Solution:
    def integerBreak(self, n):
        dp = [0] * (n + 1)
        dp[1] = 1
        for i in range(2, n + 1):
            for j in range(1, i):
                # 剩余部分不再切 / 继续切
                dp[i] = max(dp[i], j * (i - j), j * dp[i - j])
        return dp[n]
\`\`\`

## JavaScript 实现

\`\`\`javascript
var integerBreak = function(n) {
    const dp = new Array(n + 1).fill(0);
    dp[1] = 1;
    for (let i = 2; i <= n; i++) {
        for (let j = 1; j < i; j++) {
            // 剩余部分不再切 / 继续切
            dp[i] = Math.max(dp[i], j * (i - j), j * dp[i - j]);
        }
    }
    return dp[n];
};
\`\`\`

## 复杂度

- 时间复杂度：O(n^2)
- 空间复杂度：O(n)

## 拓展

- 数学法：当 \`n >= 5\` 时尽量拆 3，剩余按 2/4 处理，O(1) 时间。
- 关键思想：枚举「最后一步切出的段」，是 DP 拆分问题的通用切入点。`
  },

  // =============================================================
  // lc-156 #96 不同的二叉搜索树
  // =============================================================
  {
    id: "lc-156",
    group: "动态规划基础",
    icon: "💰",
    title: "#96 不同的二叉搜索树（中等）",
    content: `## 题目

**LeetCode #96 不同的二叉搜索树** | 难度：中等

给定整数 \`n\`，求由 \`n\` 个节点（值 1 到 \`n\`）能组成多少种**结构不同**的二叉搜索树（BST）。

示例：

\`\`\`
输入：n = 3
输出：5
\`\`\`

## 思路

BST 性质：以 \`j\` 为根时，左子树由 \`1..j-1\`（共 \`j-1\` 个节点）构成，右子树由 \`j+1..n\`（共 \`n-j\` 个节点）构成。左右子树本身也是 BST，结构数只与节点个数有关。

这就是**卡特兰数**。

1. **状态定义**：\`dp[i]\` 表示 \`i\` 个节点能组成的 BST 种数。
2. **状态转移方程**：枚举根 \`j\` 从 1 到 \`i\`：\`dp[i] += dp[j-1] * dp[i-j]\`（左子树方案 × 右子树方案）。
3. **初始条件**：\`dp[0] = 1\`（空树 1 种），\`dp[1] = 1\`。
4. **遍历顺序**：\`i\` 从 2 到 \`n\`，内层 \`j\` 从 1 到 \`i\`。
5. **最终结果**：\`dp[n]\`。

## Python 实现

\`\`\`python
class Solution:
    def numTrees(self, n):
        dp = [0] * (n + 1)
        dp[0] = dp[1] = 1
        for i in range(2, n + 1):
            for j in range(1, i + 1):
                # 以 j 为根：左 j-1 个, 右 i-j 个
                dp[i] += dp[j - 1] * dp[i - j]
        return dp[n]
\`\`\`

## JavaScript 实现

\`\`\`javascript
var numTrees = function(n) {
    const dp = new Array(n + 1).fill(0);
    dp[0] = dp[1] = 1;
    for (let i = 2; i <= n; i++) {
        for (let j = 1; j <= i; j++) {
            // 以 j 为根：左 j-1 个, 右 i-j 个
            dp[i] += dp[j - 1] * dp[i - j];
        }
    }
    return dp[n];
};
\`\`\`

## 复杂度

- 时间复杂度：O(n^2)
- 空间复杂度：O(n)

## 拓展

- 卡特兰数通项：\`C(n) = C(2n,n)/(n+1)\`，可 O(n) 计算。
- #95 要求构造所有 BST，是回溯/递归构造题。`
  },

  // =============================================================
  // lc-157 #198 打家劫舍
  // =============================================================
  {
    id: "lc-157",
    group: "动态规划基础",
    icon: "💰",
    title: "#198 打家劫舍（中等）",
    content: `## 题目

**LeetCode #198 打家劫舍** | 难度：中等

你是一个专业小偷，沿街排列的房屋每间有金额 \`nums[i]\`。若两间相邻房屋同时被偷会报警。求在不报警的前提下能偷到的最大金额。

示例：

\`\`\`
输入：nums = [2,7,9,3,1]
输出：12
解释：偷第 1、3、5 间（2+9+1=12）
\`\`\`

## 思路

经典线性 DP。

1. **状态定义**：\`dp[i]\` 表示考虑前 \`i\` 间房（下标 0~i）能偷到的最大金额。
2. **状态转移方程**：对第 \`i\` 间房，有偷或不偷两种选择：
   - 偷：\`nums[i] + dp[i-2]\`（不能偷上一间）
   - 不偷：\`dp[i-1]\`
   - 取较大：\`dp[i] = max(dp[i-1], nums[i] + dp[i-2])\`
3. **初始条件**：\`dp[0] = nums[0]\`，\`dp[1] = max(nums[0], nums[1])\`。
4. **遍历顺序**：从左到右，\`i\` 从 2 到 \`n-1\`。
5. **最终结果**：\`dp[n-1]\`。

空间优化：只依赖前两个值，用两个变量滚动，空间 O(1)。

## Python 实现

\`\`\`python
class Solution:
    def rob(self, nums):
        n = len(nums)
        if n == 1:
            return nums[0]
        prev2 = nums[0]                       # dp[i-2]
        prev1 = max(nums[0], nums[1])         # dp[i-1]
        for i in range(2, n):
            curr = max(prev1, nums[i] + prev2) # 偷或不偷
            prev2, prev1 = prev1, curr
        return prev1
\`\`\`

## JavaScript 实现

\`\`\`javascript
var rob = function(nums) {
    const n = nums.length;
    if (n === 1) return nums[0];
    let prev2 = nums[0];                       // dp[i-2]
    let prev1 = Math.max(nums[0], nums[1]);    // dp[i-1]
    for (let i = 2; i < n; i++) {
        const curr = Math.max(prev1, nums[i] + prev2); // 偷或不偷
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(1)

## 拓展

- #213 房屋排成环（首尾相邻），需拆成两条线性分别 DP。
- #337 房屋排成二叉树，需树形 DP。`
  },

  // =============================================================
  // lc-158 #213 打家劫舍 II
  // =============================================================
  {
    id: "lc-158",
    group: "动态规划基础",
    icon: "💰",
    title: "#213 打家劫舍 II（中等）",
    content: `## 题目

**LeetCode #213 打家劫舍 II** | 难度：中等

房屋排成一圈（环形），其余规则同 #198：不能偷相邻两间。求最大金额。

示例：

\`\`\`
输入：nums = [2,3,2]
输出：3
解释：第一间和第三间相邻（环形），只能偷其中一间。
\`\`\`

## 思路

环形难点：首尾相邻，不能同时偷第 0 间和第 \`n-1\` 间。拆解为两种**线性**情况取最大：

1. **偷第 0 间**：则不能偷第 \`n-1\` 间，范围缩为 \`nums[0..n-2]\`。
2. **不偷第 0 间**：范围缩为 \`nums[1..n-1]\`。

两种情况分别用 #198 的线性 DP 求最大，再取两者最大值。

1. **状态定义**：\`dp[i]\` 表示范围内前 \`i\` 间能偷的最大金额。
2. **状态转移方程**：\`dp[i] = max(dp[i-1], nums[i] + dp[i-2])\`。
3. **初始条件**：\`dp[0] = nums[0]\`，\`dp[1] = max(nums[0], nums[1])\`。
4. **遍历顺序**：从左到右。
5. **最终结果**：\`max(rob(nums[0..n-2]), rob(nums[1..n-1]))\`，特判 \`n == 1\`。

## Python 实现

\`\`\`python
class Solution:
    def rob(self, nums):
        n = len(nums)
        if n == 1:
            return nums[0]
        # 线性打劫舍辅助函数
        def rob_line(arr):
            if len(arr) == 1:
                return arr[0]
            prev2 = arr[0]
            prev1 = max(arr[0], arr[1])
            for i in range(2, len(arr)):
                prev2, prev1 = prev1, max(prev1, arr[i] + prev2)
            return prev1
        # 偷第一间(不含最后) 或 不偷第一间(含最后)
        return max(rob_line(nums[:-1]), rob_line(nums[1:]))
\`\`\`

## JavaScript 实现

\`\`\`javascript
var rob = function(nums) {
    const n = nums.length;
    if (n === 1) return nums[0];
    // 线性打劫舍辅助函数
    const robLine = (arr) => {
        if (arr.length === 1) return arr[0];
        let prev2 = arr[0];
        let prev1 = Math.max(arr[0], arr[1]);
        for (let i = 2; i < arr.length; i++) {
            const curr = Math.max(prev1, arr[i] + prev2);
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    };
    // 偷第一间(不含最后) 或 不偷第一间(含最后)
    return Math.max(robLine(nums.slice(0, n - 1)), robLine(nums.slice(1)));
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(1)（切片会 O(n) 空间，可用下标范围优化）

## 拓展

- 核心：环形问题拆成线性，枚举首尾取舍情况。
- #337 推广到树形结构上的打劫舍。`
  },

  // =============================================================
  // lc-159 #337 打家劫舍 III
  // =============================================================
  {
    id: "lc-159",
    group: "动态规划基础",
    icon: "💰",
    title: "#337 打家劫舍 III（中等）",
    content: `## 题目

**LeetCode #337 打家劫舍 III** | 难度：中等

房屋排列成**二叉树**，相邻指父子节点。不能同时偷父子节点。求能偷到的最大金额。

示例：

\`\`\`
输入：root = [3,2,3,null,3,null,1]
输出：7
解释：偷根节点 3 + 右孙 3 + 左孙 1 = 7
\`\`\`

## 思路

**树形 DP**：对每个节点返回「偷该节点」与「不偷该节点」两种情况的最大收益。

1. **状态定义**：后序遍历返回 \`(notRob, rob)\` —— 不偷当前节点的最大收益 / 偷当前节点的最大收益。
2. **状态转移方程**：对节点 \`node\`，拿到左右孩子的 \`(lNot, lRob)\`、\`(rNot, rRob)\`：
   - 偷 \`node\`：\`node.val + lNot + rNot\`（孩子不能偷）。
   - 不偷 \`node\`：\`max(lNot, lRob) + max(rNot, rRob)\`（孩子可偷可不偷）。
3. **初始条件**：空节点返回 \`(0, 0)\`。
4. **遍历顺序**：后序遍历（先左右孩子，再根），自底向上汇总。
5. **最终结果**：根节点返回值的 \`max(notRob, rob)\`。

## Python 实现

\`\`\`python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def rob(self, root):
        # 返回 (不偷当前, 偷当前)
        def dfs(node):
            if not node:
                return (0, 0)
            lNot, lRob = dfs(node.left)
            rNot, rRob = dfs(node.right)
            # 偷当前节点，孩子不能偷
            rob = node.val + lNot + rNot
            # 不偷当前节点，孩子可偷可不偷
            not_rob = max(lNot, lRob) + max(rNot, rRob)
            return (not_rob, rob)
        return max(dfs(root))
\`\`\`

## JavaScript 实现

\`\`\`javascript
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

var rob = function(root) {
    // 返回 [不偷当前, 偷当前]
    const dfs = (node) => {
        if (!node) return [0, 0];
        const [lNot, lRob] = dfs(node.left);
        const [rNot, rRob] = dfs(node.right);
        // 偷当前节点，孩子不能偷
        const robCur = node.val + lNot + rNot;
        // 不偷当前节点，孩子可偷可不偷
        const notRob = Math.max(lNot, lRob) + Math.max(rNot, rRob);
        return [notRob, robCur];
    };
    const [notRob, robCur] = dfs(root);
    return Math.max(notRob, robCur);
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，每个节点访问一次
- 空间复杂度：O(h)，递归栈深度，h 为树高

## 拓展

- 树形 DP 通用模板：后序遍历 + 返回多状态元组。
- 与 #198/#213 对比：线性 → 环形 → 树形，状态转移思想一致但结构不同。`
  },

  // =============================================================
  // lc-160 #121 买卖股票的最佳时机
  // =============================================================
  {
    id: "lc-160",
    group: "动态规划基础",
    icon: "💰",
    title: "#121 买卖股票的最佳时机（简单）",
    content: `## 题目

**LeetCode #121 买卖股票的最佳时机** | 难度：简单

给定数组 \`prices\`，\`prices[i]\` 是第 \`i\` 天股票价格。你只能选择**某一天**买入并在**之后某一天**卖出，求最大利润。若不能获利返回 0。

示例：

\`\`\`
输入：prices = [7,1,5,3,6,4]
输出：5
解释：第 2 天买入（1），第 5 天卖出（6），利润 5
\`\`\`

## 思路

**一次遍历，维护历史最小买入价**。

1. **状态定义**：\`minPrice\` 表示到第 \`i\` 天为止见过的最低价格；\`maxProfit\` 表示最大利润。
2. **状态转移方程**：第 \`i\` 天若卖出，利润为 \`prices[i] - minPrice\`，更新 \`maxProfit = max(maxProfit, prices[i] - minPrice)\`；同时更新 \`minPrice = min(minPrice, prices[i])\`。
3. **初始条件**：\`minPrice = prices[0]\`，\`maxProfit = 0\`。
4. **遍历顺序**：从左到右，\`i\` 从 1 到 \`n-1\`。
5. **最终结果**：\`maxProfit\`。

也可用 DP：\`dp[i]\` 表示前 \`i\` 天最大利润，转移同上。本质是贪心/DP 的统一。

## Python 实现

\`\`\`python
class Solution:
    def maxProfit(self, prices):
        min_price = prices[0]
        max_profit = 0
        for i in range(1, len(prices)):
            # 更新历史最低价
            min_price = min(min_price, prices[i])
            # 以今天卖出更新最大利润
            max_profit = max(max_profit, prices[i] - min_price)
        return max_profit
\`\`\`

## JavaScript 实现

\`\`\`javascript
var maxProfit = function(prices) {
    let minPrice = prices[0];
    let maxProfit = 0;
    for (let i = 1; i < prices.length; i++) {
        // 更新历史最低价
        minPrice = Math.min(minPrice, prices[i]);
        // 以今天卖出更新最大利润
        maxProfit = Math.max(maxProfit, prices[i] - minPrice);
    }
    return maxProfit;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，一次遍历
- 空间复杂度：O(1)

## 拓展

- #122 允许多次交易（贪心累加上升差价）。
- #123/#188 限制交易次数，需多维状态机 DP。
- 本题是「前缀最小值 + 当前差值」的经典模式。`
  }
];
