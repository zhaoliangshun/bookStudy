// =============================================================
// LeetCode 面试算法 200 题 - 第十五批章节（贪心算法，共 10 题）
// 章节 lc-141 ~ lc-150：分发饼干 / 最大子数组和 / 股票 / 跳跃 / 取反 / 加油站 / 糖果 / 找零 / 重建队列
// =============================================================

export const chapters = [
  // =============================================================
  // lc-141 #455 分发饼干
  // =============================================================
  {
    id: "lc-141",
    group: "贪心算法",
    icon: "🤑",
    title: "#455 分发饼干（简单）",
    content: `## 题目

**LeetCode #455 分发饼干** | 难度：简单

假设你是一位很棒的家长，要给你的孩子们分发饼干。每个孩子有一个胃口值 \`g[i]\`，每块饼干有一个尺寸 \`s[j]\`。当 \`s[j] >= g[i]\` 时，孩子才能得到满足。你的目标是满足**尽可能多**的孩子。

示例：

\`\`\`
输入：g = [1,2,3], s = [1,1]
输出：1

输入：g = [1,2], s = [1,2,3]
输出：2
\`\`\`

## 思路

经典贪心：**小饼干先喂小胃口的孩子**。

1. 将孩子数组 \`g\` 和饼干数组 \`s\` 都升序排序。
2. 双指针遍历：用每块饼干尝试满足当前胃口最小的孩子。
3. 若当前饼干 \`s[j] >= g[i]\`，孩子 \`i\` 被满足，双指针都后移，答案 +1。
4. 否则这块饼干太小，跳过它换更大的饼干。

**贪心正确性**：若某饼干能孩子 A 也能孩子 B（B 胃口更大），留给 B 一定不更优，因为 A 用更小的饼干就能满足。把小饼干分配给能匹配的最小胃口孩子，剩下的大饼干留给大胃口孩子，整体可满足数最多。

## Python 实现

\`\`\`python
class Solution:
    def findContentChildren(self, g, s):
        # 升序排序
        g.sort()
        s.sort()
        i = j = 0  # i 孩子指针, j 饼干指针
        while i < len(g) and j < len(s):
            if s[j] >= g[i]:
                # 当前饼干满足当前孩子
                i += 1
            j += 1  # 饼干用掉（无论是否满足都后移）
        return i
\`\`\`

## JavaScript 实现

\`\`\`javascript
var findContentChildren = function(g, s) {
    // 升序排序
    g.sort((a, b) => a - b);
    s.sort((a, b) => a - b);
    let i = 0, j = 0; // i 孩子指针, j 饼干指针
    while (i < g.length && j < s.length) {
        if (s[j] >= g[i]) {
            // 当前饼干满足当前孩子
            i++;
        }
        j++; // 饼干用掉（无论是否满足都后移）
    }
    return i;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n log n + m log m)，排序占主导
- 空间复杂度：O(1)（忽略排序栈）

## 拓展

- 贪心入门题，重点理解「排序 + 双指针」的匹配模式。
- 类似题目：#881 救生艇（双指针 + 贪心，但两人一船需限制重量）。`
  },

  // =============================================================
  // lc-142 #53 最大子数组和
  // =============================================================
  {
    id: "lc-142",
    group: "贪心算法",
    icon: "🤑",
    title: "#53 最大子数组和（中等）",
    content: `## 题目

**LeetCode #53 最大子数组和** | 难度：中等

给你一个整数数组 \`nums\`，找出一个具有最大和的连续子数组（子数组至少包含一个元素），返回其最大和。

示例：

\`\`\`
输入：nums = [-2,1,-3,4,-1,2,1,-5,4]
输出：6
解释：连续子数组 [4,-1,2,1] 的和最大，为 6
\`\`\`

## 思路

**贪心 + 滚动求和（Kadane 算法）**：

核心思想——「前面累计和如果是负数，对后面没有帮助，直接丢弃重新开始」。

1. 维护两个变量：\`cur\` 为以当前元素结尾的最大子数组和，\`ans\` 为全局最大值。
2. 遍历到 \`nums[i]\` 时：若 \`cur + nums[i] < nums[i]\`（即 \`cur < 0\`），则抛弃前面的累加，从 \`nums[i]\` 重新起算。
3. 即 \`cur = max(nums[i], cur + nums[i])\`，每步更新 \`ans = max(ans, cur)\`。

**贪心正确性**：若前面累加和为负，它只会拖累后续子数组的和；任何以更早位置开头的子数组都不如从当前元素重新开始更优。

## Python 实现

\`\`\`python
class Solution:
    def maxSubArray(self, nums):
        # Kadane 算法
        cur = ans = nums[0]
        for x in nums[1:]:
            # 若前面的累加和为负则丢弃
            cur = max(x, cur + x)
            ans = max(ans, cur)
        return ans
\`\`\`

## JavaScript 实现

\`\`\`javascript
var maxSubArray = function(nums) {
    // Kadane 算法
    let cur = nums[0], ans = nums[0];
    for (let i = 1; i < nums.length; i++) {
        // 若前面的累加和为负则丢弃
        cur = Math.max(nums[i], cur + nums[i]);
        ans = Math.max(ans, cur);
    }
    return ans;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，一次遍历
- 空间复杂度：O(1)

## 拓展

- 进阶：用分治法 O(n log n) 求解，并能扩展到「最大子数组和」的在线查询（线段树维护）。
- 变体：#152 乘积最大子数组需考虑正负号翻转；#918 环形子数组的最大和。`
  },

  // =============================================================
  // lc-143 #122 买卖股票的最佳时机 II
  // =============================================================
  {
    id: "lc-143",
    group: "贪心算法",
    icon: "🤑",
    title: "#122 买卖股票的最佳时机 II（中等）",
    content: `## 题目

**LeetCode #122 买卖股票的最佳时机 II** | 难度：中等

给你一个数组 \`prices\` 表示股票每天价格。你可以**多次**买卖，但同一时刻最多持有一股。求能获得的最大利润。

示例：

\`\`\`
输入：prices = [7,1,5,3,6,4]
输出：7
解释：第 2 天买入（1），第 3 天卖出（5）赚 4；第 4 天买入（3），第 5 天卖出（6）赚 3。共 7
\`\`\`

## 思路

**贪心：只要今天比昨天贵，就把这两天差价收入囊中。**

1. 遍历价格数组，从第 2 天起比较 \`prices[i]\` 与 \`prices[i-1]\`。
2. 若 \`prices[i] > prices[i-1]\`，则把差价 \`prices[i] - prices[i-1]\` 加到利润里。
3. 否则跳过。

**贪心正确性**：题目允许多次交易且不限制次数，那么「所有上升段的和」就是最大利润。任何跨多日的交易 \`(buy, sell)\` 的利润 \`prices[sell]-prices[buy]\` 都等于这中间所有相邻上升差价之和，因此贪心累加每段上升差价得到的总和不劣于任何策略。

## Python 实现

\`\`\`python
class Solution:
    def maxProfit(self, prices):
        profit = 0
        for i in range(1, len(prices)):
            # 上涨就累加差价
            if prices[i] > prices[i - 1]:
                profit += prices[i] - prices[i - 1]
        return profit
\`\`\`

## JavaScript 实现

\`\`\`javascript
var maxProfit = function(prices) {
    let profit = 0;
    for (let i = 1; i < prices.length; i++) {
        // 上涨就累加差价
        if (prices[i] > prices[i - 1]) {
            profit += prices[i] - prices[i - 1];
        }
    }
    return profit;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(1)

## 拓展

- #121 只允许一次交易：需在上升段里找最大差价（DP/前缀最小值）。
- #309 含冷却期、#714 含手续费，需要状态机 DP，单纯贪心不再适用。`
  },

  // =============================================================
  // lc-144 #55 跳跃游戏
  // =============================================================
  {
    id: "lc-144",
    group: "贪心算法",
    icon: "🤑",
    title: "#55 跳跃游戏（中等）",
    content: `## 题目

**LeetCode #55 跳跃游戏** | 难度：中等

给定非负整数数组 \`nums\`，你最初位于下标 0。每个元素表示你在该位置能跳跃的最大长度。判断你是否能到达最后一个下标。

示例：

\`\`\`
输入：nums = [2,3,1,1,4]
输出：true

输入：nums = [3,2,1,0,4]
输出：false
\`\`\`

## 思路

**贪心：维护「当前能到达的最远位置」**。

1. 维护变量 \`maxReach\` 表示遍历到目前能到达的最远下标。
2. 遍历每个位置 \`i\`：若 \`i > maxReach\`，说明连当前位置都到不了，返回 \`false\`。
3. 否则更新 \`maxReach = max(maxReach, i + nums[i])\`，若 \`maxReach >= n-1\` 直接返回 \`true\`。

**贪心正确性**：每到一个可达位置，就尽可能把能跳到的最远点扩展。若某个位置不可达，则后面所有位置都不可达；只要最远点能覆盖终点，就一定能到。

## Python 实现

\`\`\`python
class Solution:
    def canJump(self, nums):
        max_reach = 0
        n = len(nums)
        for i in range(n):
            # 当前位置不可达
            if i > max_reach:
                return False
            # 更新最远可达
            max_reach = max(max_reach, i + nums[i])
            if max_reach >= n - 1:
                return True
        return True
\`\`\`

## JavaScript 实现

\`\`\`javascript
var canJump = function(nums) {
    let maxReach = 0;
    const n = nums.length;
    for (let i = 0; i < n; i++) {
        // 当前位置不可达
        if (i > maxReach) return false;
        // 更新最远可达
        maxReach = Math.max(maxReach, i + nums[i]);
        if (maxReach >= n - 1) return true;
    }
    return true;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(1)

## 拓展

- #45 跳跃游戏 II 求「最少跳跃次数」，需要在贪心基础上分段统计。
- 关键模式：贪心维护「最远可达」。`
  },

  // =============================================================
  // lc-145 #45 跳跃游戏 II
  // =============================================================
  {
    id: "lc-145",
    group: "贪心算法",
    icon: "🤑",
    title: "#45 跳跃游戏 II（中等）",
    content: `## 题目

**LeetCode #45 跳跃游戏 II** | 难度：中等

给定非负整数数组 \`nums\`，你最初位于下标 0。每个元素表示该位置能跳跃的最大长度。假设你总是能到达最后一个下标，求**最少跳跃次数**。

示例：

\`\`\`
输入：nums = [2,3,1,1,4]
输出：2
解释：先跳到下标 1（值 3），再跳到终点。
\`\`\`

## 思路

**贪心 + 区间扩展（BFS 思想）**：

把每一跳看作 BFS 的一层：

1. 维护当前一跳能覆盖的范围 \`[start, end]\`，以及下一跳能到达的最远位置 \`maxReach\`。
2. 遍历 \`i\` 从 \`start\` 到 \`end\`，过程中 \`maxReach = max(maxReach, i + nums[i])\`。
3. 当 \`i == end\` 时，必须再跳一次，更新 \`start = end + 1\`、\`end = maxReach\`、\`steps += 1\`。
4. 当 \`end >= n-1\` 时停止。

**贪心正确性**：每跳都跳到能扩展出的最远边界，等价于「用最少层数覆盖到终点」。每次都把当前层扩展到极限，层数最少。

## Python 实现

\`\`\`python
class Solution:
    def jump(self, nums):
        n = len(nums)
        if n <= 1:
            return 0
        steps = 0
        end = 0       # 当前一跳的右边界
        max_reach = 0  # 下一跳能到的最远位置
        for i in range(n - 1):
            max_reach = max(max_reach, i + nums[i])
            # 到达当前跳的边界，必须再跳一次
            if i == end:
                steps += 1
                end = max_reach
                if end >= n - 1:
                    break
        return steps
\`\`\`

## JavaScript 实现

\`\`\`javascript
var jump = function(nums) {
    const n = nums.length;
    if (n <= 1) return 0;
    let steps = 0;
    let end = 0;       // 当前一跳的右边界
    let maxReach = 0;  // 下一跳能到的最远位置
    for (let i = 0; i < n - 1; i++) {
        maxReach = Math.max(maxReach, i + nums[i]);
        // 到达当前跳的边界，必须再跳一次
        if (i === end) {
            steps++;
            end = maxReach;
            if (end >= n - 1) break;
        }
    }
    return steps;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(1)

## 拓展

- 关键模式：贪心 + 「分段扩展」，类似 BFS 按层遍历。
- 与 #55 配对：#55 判可达，#45 求最少跳数。`
  },

  // =============================================================
  // lc-146 #1005 K 次取反后最大化的数组和
  // =============================================================
  {
    id: "lc-146",
    group: "贪心算法",
    icon: "🤑",
    title: "#1005 K 次取反后最大化的数组和（简单）",
    content: `## 题目

**LeetCode #1005 K 次取反后最大化的数组和** | 难度：简单

给你一个整数数组 \`nums\` 和一个整数 \`k\`，你可以对数组中任一元素执行 \`k\` 次「取反」操作（可重复对同一元素）。返回数组可能的最大和。

示例：

\`\`\`
输入：nums = [4,2,3], k = 1
输出：5
解释：选 4 取反得 [-4,2,3]，和为 1；选 2 取反得 [4,-2,3] 和为 5；选 3 取反得 [4,2,-3] 和为 3。最大为 5？正确做法：取反 2 得 [-2]... 最优是把最小的 2 取反，和为 4-2+3=5。

输入：nums = [3,-1,0,2], k = 3
输出：6
\`\`\`

## 思路

贪心策略分两步：

1. **按绝对值升序排序**（让绝对值小的负数优先翻转）。
2. 从左到右遍历：若当前数是负数且 \`k > 0\`，就把它翻成正数，\`k -= 1\`。
3. 若遍历完仍有剩余 \`k\`，则把剩下的 \`k\` 全部作用在**绝对值最小的数**上反复取反。因为若 \`k\` 为偶数，取反偶数次不变；若 \`k\` 为奇数，相当于对该数取反一次，让绝对值最小的数承担损失最小。

**贪心正确性**：把负数翻正是收益最大的操作，且应优先翻绝对值大的负数（收益大）。剩余次数集中作用在绝对值最小的数上，损失最小。

## Python 实现

\`\`\`python
class Solution:
    def largestSumAfterKNegations(self, nums, k):
        # 按绝对值升序排序
        nums.sort(key=abs)
        # 从小到大优先翻负数
        for i in range(len(nums)):
            if nums[i] < 0 and k > 0:
                nums[i] = -nums[i]
                k -= 1
        # 剩余次数作用在绝对值最小元素上
        if k % 2 == 1:
            nums[0] = -nums[0]
        return sum(nums)
\`\`\`

## JavaScript 实现

\`\`\`javascript
var largestSumAfterKNegations = function(nums, k) {
    // 按绝对值升序排序
    nums.sort((a, b) => Math.abs(a) - Math.abs(b));
    // 从小到大优先翻负数
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] < 0 && k > 0) {
            nums[i] = -nums[i];
            k--;
        }
    }
    // 剩余次数作用在绝对值最小元素上
    if (k % 2 === 1) {
        nums[0] = -nums[0];
    }
    return nums.reduce((a, b) => a + b, 0);
};
\`\`\`

## 复杂度

- 时间复杂度：O(n log n)，排序占主导
- 空间复杂度：O(1)

## 拓展

- 关键点：剩余次数的奇偶性决定是否需要再翻一次。
- 启发：贪心问题常需先排序再决策，并考虑余数次操作的最优分配。`
  },

  // =============================================================
  // lc-147 #134 加油站
  // =============================================================
  {
    id: "lc-147",
    group: "贪心算法",
    icon: "🤑",
    title: "#134 加油站（中等）",
    content: `## 题目

**LeetCode #134 加油站** | 难度：中等

在一条环路上有 \`n\` 个加油站，第 \`i\` 个加油站有汽油 \`gas[i]\` 升。从第 \`i\ 个加油站开往第 \`i+1\` 个加油站需要耗油 \`cost[i]\` 升。你最初油箱为空，可以选择从一个加油站出发。如果可以绕环路一周，返回出发下标；否则返回 -1。题目保证答案唯一或不存在。

示例：

\`\`\`
输入：gas = [1,2,3,4,5], cost = [3,4,5,1,2]
输出：3
\`\`\`

## 思路

**贪心：总油量 >= 总消耗是可行前提，再找起点。**

1. 先判断总油量 \`sum(gas)\` 是否大于等于总消耗 \`sum(cost)\`，若不足直接返回 -1。
2. 维护 \`tank\` 表示从某起点出发累计的油量。从下标 0 开始模拟，若到 \`i\` 时 \`tank < 0\`，说明从当前起点到 \`i\` 之间任意位置出发都不行，重置起点为 \`i+1\`，\`tank = 0\`。
3. 遍历完后剩下的起点即为答案。

**贪心正确性**：若从 A 出发到 B 时油量变负，则 A~B 之间任一位置作起点都会更早耗尽（因为它们出发时累加的更少）。所以可一次性跳过这整段，从 B 后重新开始。总油量足够的前提下，剩下的起点必然可行。

## Python 实现

\`\`\`python
class Solution:
    def canCompleteCircuit(self, gas, cost):
        total = 0   # 总油量差
        tank = 0    # 当前段累计油量
        start = 0
        for i in range(len(gas)):
            diff = gas[i] - cost[i]
            total += diff
            tank += diff
            # 当前段油量耗尽，换起点
            if tank < 0:
                start = i + 1
                tank = 0
        return start if total >= 0 else -1
\`\`\`

## JavaScript 实现

\`\`\`javascript
var canCompleteCircuit = function(gas, cost) {
    let total = 0;  // 总油量差
    let tank = 0;   // 当前段累计油量
    let start = 0;
    for (let i = 0; i < gas.length; i++) {
        const diff = gas[i] - cost[i];
        total += diff;
        tank += diff;
        // 当前段油量耗尽，换起点
        if (tank < 0) {
            start = i + 1;
            tank = 0;
        }
    }
    return total >= 0 ? start : -1;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，一次遍历
- 空间复杂度：O(1)

## 拓展

- 关键观察：若总油量 >= 总消耗则必有解；从不可行段后重启避免 O(n^2)。
- 类似题：#53 最大子数组和的「丢弃负前缀」思想。`
  },

  // =============================================================
  // lc-148 #135 分发糖果
  // =============================================================
  {
    id: "lc-148",
    group: "贪心算法",
    icon: "🤑",
    title: "#135 分发糖果（困难）",
    content: `## 题目

**LeetCode #135 分发糖果** | 难度：困难

\`n\` 个孩子站成一排。每个孩子有一个评分 \`ratings[i]\`。你需要给每个孩子分发糖果，满足：

- 每个孩子至少分到 1 颗糖果。
- 评分更高的孩子比相邻孩子分到更多糖果。

返回需要准备的**最少**糖果数。

示例：

\`\`\`
输入：ratings = [1,0,2]
输出：5
解释：分别分 [2,1,2] 共 5 颗
\`\`\`

## 思路

**两次遍历贪心**：分别只考虑一侧约束，再取最大值融合。

1. 初始化每个孩子糖果为 1（满足最少 1 颗）。
2. **从左到右**：若 \`ratings[i] > ratings[i-1]\`，则 \`candy[i] = candy[i-1] + 1\`（保证比左边评分高的比左边多）。
3. **从右到左**：若 \`ratings[i] > ratings[i+1]\`，则 \`candy[i] = max(candy[i], candy[i+1] + 1)\`（保证比右边评分高的比右边多，同时不破坏左侧约束）。
4. 求和。

**贪心正确性**：单一方向的约束可以用贪心递推；两个方向的约束相互独立，最终取每个位置在两个方向约束下的最大值即可同时满足两侧。

## Python 实现

\`\`\`python
class Solution:
    def candy(self, ratings):
        n = len(ratings)
        candy = [1] * n
        # 从左到右
        for i in range(1, n):
            if ratings[i] > ratings[i - 1]:
                candy[i] = candy[i - 1] + 1
        # 从右到左
        for i in range(n - 2, -1, -1):
            if ratings[i] > ratings[i + 1]:
                candy[i] = max(candy[i], candy[i + 1] + 1)
        return sum(candy)
\`\`\`

## JavaScript 实现

\`\`\`javascript
var candy = function(ratings) {
    const n = ratings.length;
    const candy = new Array(n).fill(1);
    // 从左到右
    for (let i = 1; i < n; i++) {
        if (ratings[i] > ratings[i - 1]) {
            candy[i] = candy[i - 1] + 1;
        }
    }
    // 从右到左
    for (let i = n - 2; i >= 0; i--) {
        if (ratings[i] > ratings[i + 1]) {
            candy[i] = Math.max(candy[i], candy[i + 1] + 1);
        }
    }
    return candy.reduce((a, b) => a + b, 0);
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，两次遍历
- 空间复杂度：O(n)，糖果数组

## 拓展

- 进阶：可做到 O(1) 空间，按上升/下降/平坡分段统计。
- 关键思想：双向贪心 + 取最大值融合是「相邻约束」类问题的通用模板。`
  },

  // =============================================================
  // lc-149 #860 柠檬水找零
  // =============================================================
  {
    id: "lc-149",
    group: "贪心算法",
    icon: "🤑",
    title: "#860 柠檬水找零（简单）",
    content: `## 题目

**LeetCode #860 柠檬水找零** | 难度：简单

每杯柠檬水售价 5 美元。顾客排队购买，每位顾客只买一杯，付款为 5、10 或 20 美元。你必须给每位顾客正确找零（你一开始没有零钱）。判断能否给所有顾客找零。

示例：

\`\`\`
输入：bills = [5,5,5,10,20]
输出：true

输入：bills = [5,5,10,10,20]
输出：false
\`\`\`

## 思路

**贪心：找零时优先用大面额**。

维护手头 5 元和 10 元钞票数量：

1. 5 元：直接收下，\`cnt5 += 1\`。
2. 10 元：找 5 元，\`cnt5 -= 1, cnt10 += 1\`。
3. 20 元：优先用 10 + 5 找零（保留 5 元更宝贵），不行再用 3 张 5 元。

**贪心正确性**：5 元能用于 10 元和 20 元的找零，10 元只能用于 20 元找零。所以 5 元比 10 元更「通用」，找 20 元时优先消耗 10 元、保留 5 元是最优策略。

## Python 实现

\`\`\`python
class Solution:
    def lemonadeChange(self, bills):
        cnt5 = cnt10 = 0
        for b in bills:
            if b == 5:
                cnt5 += 1
            elif b == 10:
                if cnt5 == 0:
                    return False
                cnt5 -= 1
                cnt10 += 1
            else:  # b == 20
                # 优先用 10 + 5
                if cnt10 > 0 and cnt5 > 0:
                    cnt10 -= 1
                    cnt5 -= 1
                elif cnt5 >= 3:
                    cnt5 -= 3
                else:
                    return False
        return True
\`\`\`

## JavaScript 实现

\`\`\`javascript
var lemonadeChange = function(bills) {
    let cnt5 = 0, cnt10 = 0;
    for (const b of bills) {
        if (b === 5) {
            cnt5++;
        } else if (b === 10) {
            if (cnt5 === 0) return false;
            cnt5--;
            cnt10++;
        } else { // b === 20
            // 优先用 10 + 5
            if (cnt10 > 0 && cnt5 > 0) {
                cnt10--;
                cnt5--;
            } else if (cnt5 >= 3) {
                cnt5 -= 3;
            } else {
                return false;
            }
        }
    }
    return true;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(1)

## 拓展

- 贪心关键：优先消耗「用途窄」的资源，保留「用途广」的资源。
- 类似题：#406 根据身高重建队列（贪心 + 插入）。`
  },

  // =============================================================
  // lc-150 #406 根据身高重建队列
  // =============================================================
  {
    id: "lc-150",
    group: "贪心算法",
    icon: "🤑",
    title: "#406 根据身高重建队列（中等）",
    content: `## 题目

**LeetCode #406 根据身高重建队列** | 难度：中等

有 \`n\` 个人打乱站队。每个人用 \`(h, k)\` 表示：\`h\` 是身高，\`k\` 是排在他前面且身高大于等于 \`h\` 的人数。请重建队列并返回。

示例：

\`\`\`
输入：people = [[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]
输出：[[5,0],[7,0],[5,2],[6,1],[4,4],[7,1]]
\`\`\`

## 思路

**贪心：高个先站，矮个插入**。

1. 把所有人按身高 \`h\` 降序排序；身高相同的按 \`k\` 升序排（因为同身高时，\`k\` 小的应在前）。
2. 依次按 \`k\` 作为下标插入结果列表：高个子先插入，矮个子后插入时插到下标 \`k\` 处。
3. 因为后插入的矮个子不会影响前面已站好的高个子的「前面比他高的人数」，所以每个高个的 \`k\` 约束在插入时就被满足。

**贪心正确性**：高个子先站好位置后，矮个子插入到任意位置都不会改变高个子前面「比他高或相等」的人数（因为新插入的人比他矮）。因此按 \`k\` 直接作为下标插入即可正确放置。

## Python 实现

\`\`\`python
class Solution:
    def reconstructQueue(self, people):
        # 身高降序, 同身高 k 升序
        people.sort(key=lambda x: (-x[0], x[1]))
        res = []
        for p in people:
            # 按 k 作为下标插入
            res.insert(p[1], p)
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var reconstructQueue = function(people) {
    // 身高降序, 同身高 k 升序
    people.sort((a, b) => {
        if (a[0] !== b[0]) return b[0] - a[0];
        return a[1] - b[1];
    });
    const res = [];
    for (const p of people) {
        // 按 k 作为下标插入
        res.splice(p[1], 0, p);
    }
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n^2)，排序 O(n log n) + 每次 insert/splice O(n)
- 空间复杂度：O(n)

## 拓展

- 进阶：用线段树/树状数组可优化到 O(n log n)。
- 关键模式：「先排一维，再按另一维插入」的贪心套路，与 #135 的双向贪心形成对比。`
  }
];
