// =============================================================
// LeetCode 面试算法 200 题 - 第十四批章节（回溯算法，共 10 题）
// 章节 lc-131 ~ lc-140：组合 / 排列 / 子集 / 字母组合 / 括号生成
// 回溯三要素：选择、路径、结束条件；重点画决策树、说明剪枝
// =============================================================

export const chapters = [
  // =============================================================
  // lc-131 #77 组合
  // =============================================================
  {
    id: "lc-131",
    group: "回溯算法",
    icon: "🔄",
    title: "#77 组合（中等）",
    content: `## 题目

**LeetCode #77 组合** | 难度：中等

给定两个整数 \`n\` 和 \`k\`，返回范围 \`[1, n]\` 中所有可能的 \`k\` 个数的组合。组合不区分顺序（\`[1,2]\` 和 \`[2,1]\` 视为相同）。

示例：

\`\`\`
输入：n = 4, k = 2
输出：[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]
\`\`\`

## 思路

回溯法是组合问题的标准解法。决策树如下（n=4, k=2）：

\`\`\`
              []
         /    |    \
      [1]   [2]   [3]   [4]
     / |\\    |\\     |
 [1,2][1,3][1,4] [2,3][2,4] [3,4]
\`\`\`

核心三要素：
1. **路径**：已选的数字 \`path\`。
2. **选择**：当前可选的数字范围 \`[start, n]\`。
3. **结束条件**：\`path.length == k\`，加入答案。

关键技巧：用 \`start\` 参数限制选择范围，只往后选不回头。这天然保证了「不区分顺序」——因为 \`[1,2]\` 产生后不会再产生 \`[2,1]\`（2 之后只选 3、4）。

**剪枝**：当剩余可选数字不够凑齐 k 个时提前返回。即 \`n - start + 1 < k - path.length\` 时直接剪枝，可显著减少无效递归。

## Python 实现

\`\`\`python
class Solution:
    def combine(self, n, k):
        res = []
        path = []

        def backtrack(start):
            # 剪枝：剩余数字不足以凑齐 k 个
            if n - start + 1 < k - len(path):
                return
            # 结束条件：选够 k 个
            if len(path) == k:
                res.append(path[:])
                return
            # 从 start 开始选，避免重复
            for i in range(start, n + 1):
                path.append(i)
                backtrack(i + 1)  # 下一位开始，保证升序不回头
                path.pop()  # 撤销选择

        backtrack(1)
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var combine = function(n, k) {
    const res = [];
    const path = [];

    const backtrack = (start) => {
        // 剪枝：剩余数字不足以凑齐 k 个
        if (n - start + 1 < k - path.length) return;
        // 结束条件：选够 k 个
        if (path.length === k) {
            res.push([...path]);
            return;
        }
        // 从 start 开始选，避免重复
        for (let i = start; i <= n; i++) {
            path.push(i);
            backtrack(i + 1);  // 下一位开始，保证升序不回头
            path.pop();  // 撤销选择
        }
    };

    backtrack(1);
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(C(n,k) * k)，组合数 C(n,k) 个结果，每个复制需 O(k)
- 空间复杂度：O(k + n)，递归深度 k，path 大小 k

## 拓展

- 剪枝是回溯优化的关键，本题剪枝后性能提升明显。
- 组合问题是所有回溯题的入门模板，后续的组合总和、子集都基于此变形。
- 若改求「排列」，则不需要 start 限制，而是用 visited 数组标记已用元素。`
  },

  // =============================================================
  // lc-132 #39 组合总和
  // =============================================================
  {
    id: "lc-132",
    group: "回溯算法",
    icon: "🔄",
    title: "#39 组合总和（中等）",
    content: `## 题目

**LeetCode #39 组合总和** | 难度：中等

给定无重复元素的整数数组 \`candidates\` 和目标数 \`target\`，找出所有使数字和为 \`target\` 的组合。\`candidates\` 中的数字可以**无限制重复**选取。组合不区分顺序。

示例：

\`\`\`
输入：candidates = [2,3,6,7], target = 7
输出：[[2,2,3],[7]]

输入：candidates = [2,3,5], target = 8
输出：[[2,2,2,2],[2,3,3],[3,5]]
\`\`\`

## 思路

决策树（candidates=[2,3,6,7], target=7）：

\`\`\`
                []
           /    |    |    \\
         2      3     6     7
        /|\\    / \\
     2,2 2,3 2,6 2,7  3,3 3,6 ...
\`\`\`

关键点：数字可重复选，但要避免「同一组合的不同顺序」。解决办法：用 \`start\` 参数限制每次只从当前下标及之后选。

- 递归时传 \`i\`（不是 \`i+1\`），因为同一数字可重复使用。
- 下一轮从 \`i\` 开始选，保证 \`[2,3]\` 后不会再产生 \`[3,2]\`。

**剪枝**：先把 \`candidates\` 排序。递归中若当前和 + 候选值已超过 \`target\`，由于数组升序，后面的更大值必然也超，直接 break。

回溯三要素：
1. 路径：\`path\`，当前和 \`sum\`。
2. 选择：\`candidates[start:]\`。
3. 结束：\`sum == target\` 加入答案；\`sum > target\` 返回。

## Python 实现

\`\`\`python
class Solution:
    def combinationSum(self, candidates, target):
        res = []
        path = []
        candidates.sort()  # 排序便于剪枝

        def backtrack(start, remain):
            if remain == 0:
                res.append(path[:])
                return
            for i in range(start, len(candidates)):
                # 剪枝：超出 target，后面更大必然也超
                if candidates[i] > remain:
                    break
                path.append(candidates[i])
                # 传 i 不是 i+1，因为可重复选
                backtrack(i, remain - candidates[i])
                path.pop()

        backtrack(0, target)
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var combinationSum = function(candidates, target) {
    const res = [];
    const path = [];
    candidates.sort((a, b) => a - b);  // 排序便于剪枝

    const backtrack = (start, remain) => {
        if (remain === 0) {
            res.push([...path]);
            return;
        }
        for (let i = start; i < candidates.length; i++) {
            // 剪枝：超出 target，后面更大必然也超
            if (candidates[i] > remain) break;
            path.push(candidates[i]);
            // 传 i 不是 i+1，因为可重复选
            backtrack(i, remain - candidates[i]);
            path.pop();
        }
    };

    backtrack(0, target);
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n^(target/min))，最坏情况递归深度为 target/min
- 空间复杂度：O(target/min)，递归深度

## 拓展

- 与 #77 区别：本题可重复选，传 \`i\` 而非 \`i+1\`。
- 排序 + 剪枝是组合问题的通用优化，务必养成习惯。
- 相关：#40 组合总和 II（每个数只能用一次）、#216 组合总和 III（1-9 选 k 个）。`
  },

  // =============================================================
  // lc-133 #40 组合总和 II
  // =============================================================
  {
    id: "lc-133",
    group: "回溯算法",
    icon: "🔄",
    title: "#40 组合总和 II（中等）",
    content: `## 题目

**LeetCode #40 组合总和 II** | 难度：中等

给定可能含重复元素的数组 \`candidates\` 和目标数 \`target\`，找出所有使数字和为 \`target\` 的组合。\`candidates\` 中的每个数字在组合中**只能使用一次**。结果不能含重复组合。

示例：

\`\`\`
输入：candidates = [10,1,2,7,6,1,5], target = 8
输出：[[1,1,6],[1,2,5],[1,7],[2,6]]

输入：candidates = [2,5,2,1,2], target = 5
输出：[[1,2,2],[5]]
\`\`\`

## 思路

本题难点在于「去重」：数组含重复元素，且每个只用一次。决策树（排序后 [1,1,2,5,6,7,10], target=8）：

\`\`\`
              []
        /  |  |  |  |  \\
       1   1' 2   5   6   7 ...
      /|
     1,1 1,2 ...
\`\`\`

如果两个相同的 1 都作为「同一层」的分支起点，会产生重复组合。所以**同层去重**：排序后，若 \`candidates[i] == candidates[i-1]\` 且 \`i > start\`，则跳过（这个 1' 与前一个 1 在同一层，会重复）。

注意区分：
- \`i > start\`：同层剪枝，跳过重复。
- \`i == start\`：第一个出现的该值，不跳过（这是纵向递归，允许）。

另外，每个数只用一次，所以递归传 \`i + 1\`（不是 \`i\`）。配合排序剪枝（超出 target 就 break）。

## Python 实现

\`\`\`python
class Solution:
    def combinationSum2(self, candidates, target):
        res = []
        path = []
        candidates.sort()  # 排序，让重复元素相邻

        def backtrack(start, remain):
            if remain == 0:
                res.append(path[:])
                return
            for i in range(start, len(candidates)):
                # 剪枝：超出 target
                if candidates[i] > remain:
                    break
                # 同层去重：与上一个相同且不是本层第一个，跳过
                if i > start and candidates[i] == candidates[i - 1]:
                    continue
                path.append(candidates[i])
                backtrack(i + 1, remain - candidates[i])  # i+1 每个只用一次
                path.pop()

        backtrack(0, target)
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var combinationSum2 = function(candidates, target) {
    const res = [];
    const path = [];
    candidates.sort((a, b) => a - b);  // 排序，让重复元素相邻

    const backtrack = (start, remain) => {
        if (remain === 0) {
            res.push([...path]);
            return;
        }
        for (let i = start; i < candidates.length; i++) {
            // 剪枝：超出 target
            if (candidates[i] > remain) break;
            // 同层去重：与上一个相同且不是本层第一个，跳过
            if (i > start && candidates[i] === candidates[i - 1]) continue;
            path.push(candidates[i]);
            backtrack(i + 1, remain - candidates[i]);  // i+1 每个只用一次
            path.pop();
        }
    };

    backtrack(0, target);
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(2^n)，最坏每个数选或不选
- 空间复杂度：O(n)，递归深度

## 拓展

- 「同层去重」是回溯去重的核心技巧：\`i > start && nums[i] == nums[i-1]\` 跳过。
- 与 #39 区别：每个数只用一次（传 i+1）+ 数组有重复（需去重）。
- 相关：#90 子集 II、#47 全排列 II 同样用到「排序 + 同层去重」。`
  },

  // =============================================================
  // lc-134 #216 组合总和 III
  // =============================================================
  {
    id: "lc-134",
    group: "回溯算法",
    icon: "🔄",
    title: "#216 组合总和 III（中等）",
    content: `## 题目

**LeetCode #216 组合总和 III** | 难度：中等

找出所有相加之和为 \`n\` 的 \`k\` 个数的组合，且只使用数字 1-9，每个数字**最多用一次**。返回所有有效组合的列表。

示例：

\`\`\`
输入：k = 3, n = 7
输出：[[1,2,4]]

输入：k = 3, n = 9
输出：[[1,2,6],[1,3,5],[2,3,4]]
\`\`\`

## 思路

这是 #77（组合）与 #39（组合总和）的结合：选 k 个数，和为 n，且候选固定为 1-9。

决策树（k=3, n=9）：

\`\`\`
              []
         /    |    \\
       [1]   [2]   [3] ...
      /|\\     |
  [1,2][1,3]..[1,2,6]
\`\`\`

回溯要素：
1. 路径：\`path\`，当前和 \`sum\`。
2. 选择：\`[start, 9]\`。
3. 结束：\`path.length == k\`，若 \`sum == n\` 加入答案。

**剪枝**（两个）：
1. 数量剪枝：剩余数字不够凑 k 个时返回。\`9 - start + 1 < k - path.length\`。
2. 和剪枝：\`sum + i\` 超过 n 时，由于 i 递增，后续更大，直接 break。

每个数只用一次，递归传 \`i + 1\`。数字天然升序无重复，无需排序去重。

## Python 实现

\`\`\`python
class Solution:
    def combinationSum3(self, k, n):
        res = []
        path = []

        def backtrack(start, remain):
            # 剪枝：剩余数字不够
            if 9 - start + 1 < k - len(path):
                return
            # 结束条件
            if len(path) == k:
                if remain == 0:
                    res.append(path[:])
                return
            for i in range(start, 10):
                # 剪枝：超出目标和
                if i > remain:
                    break
                path.append(i)
                backtrack(i + 1, remain - i)  # 每个只用一次
                path.pop()

        backtrack(1, n)
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var combinationSum3 = function(k, n) {
    const res = [];
    const path = [];

    const backtrack = (start, remain) => {
        // 剪枝：剩余数字不够
        if (9 - start + 1 < k - path.length) return;
        // 结束条件
        if (path.length === k) {
            if (remain === 0) res.push([...path]);
            return;
        }
        for (let i = start; i <= 9; i++) {
            // 剪枝：超出目标和
            if (i > remain) break;
            path.push(i);
            backtrack(i + 1, remain - i);  // 每个只用一次
            path.pop();
        }
    };

    backtrack(1, n);
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(C(9,k) * k)，从 9 个数选 k 个
- 空间复杂度：O(k)，递归深度

## 拓展

- 综合了「数量限制 k」和「和限制 n」双重剪枝，是组合回溯的典型。
- 候选 1-9 天然无重复，不需要去重逻辑。
- 相关：#77 组合、#39/#40 组合总和系列，思路一脉相承。`
  },

  // =============================================================
  // lc-135 #46 全排列
  // =============================================================
  {
    id: "lc-135",
    group: "回溯算法",
    icon: "🔄",
    title: "#46 全排列（中等）",
    content: `## 题目

**LeetCode #46 全排列** | 难度：中等

给定一个没有重复数字的数组 \`nums\`，返回其所有可能的全排列。可以按任意顺序返回。

示例：

\`\`\`
输入：nums = [1,2,3]
输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
\`\`\`

## 思路

排列与组合的区别：排列**区分顺序**（\`[1,2]\` 和 \`[2,1]\` 不同），组合不区分。所以排列不能用 \`start\` 限制范围，而是用 \`visited\` 数组标记已使用的元素。

决策树（nums=[1,2,3]）：

\`\`\`
            []
        /   |   \\
       1    2    3
      / \\  / \\  / \\
     2  3  1 3  1  2
     |  |  |  |  |  |
     3  2  3  1  2  1
\`\`\`

回溯要素：
1. 路径：\`path\`，已选元素。
2. 选择：未被访问的所有元素（用 \`visited\` 标记）。
3. 结束：\`path.length == nums.length\`，加入答案。

每层都从头遍历，跳过已访问的元素。这样每个位置都能选任意未用元素，自然产生所有排列。

## Python 实现

\`\`\`python
class Solution:
    def permute(self, nums):
        res = []
        path = []
        visited = [False] * len(nums)

        def backtrack():
            # 结束条件：选满
            if len(path) == len(nums):
                res.append(path[:])
                return
            for i in range(len(nums)):
                if visited[i]:
                    continue  # 跳过已用
                visited[i] = True
                path.append(nums[i])
                backtrack()
                path.pop()  # 撤销
                visited[i] = False  # 撤销标记

        backtrack()
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var permute = function(nums) {
    const res = [];
    const path = [];
    const visited = new Array(nums.length).fill(false);

    const backtrack = () => {
        // 结束条件：选满
        if (path.length === nums.length) {
            res.push([...path]);
            return;
        }
        for (let i = 0; i < nums.length; i++) {
            if (visited[i]) continue;  // 跳过已用
            visited[i] = true;
            path.push(nums[i]);
            backtrack();
            path.pop();  // 撤销
            visited[i] = false;  // 撤销标记
        }
    };

    backtrack();
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n * n!)，n! 个排列，每个复制 O(n)
- 空间复杂度：O(n)，递归深度 + visited 数组

## 拓展

- 排列用 visited 数组，组合用 start，这是两者的核心区别。
- 交换法：原地交换 nums 的位置，省去 visited 和 path 空间，但顺序与上面不同。
- 相关：#47 全排列 II（含重复元素，需去重）。`
  },

  // =============================================================
  // lc-136 #47 全排列 II
  // =============================================================
  {
    id: "lc-136",
    group: "回溯算法",
    icon: "🔄",
    title: "#47 全排列 II（中等）",
    content: `## 题目

**LeetCode #47 全排列 II** | 难度：中等

给定一个可包含重复数字的序列 \`nums\`，按任意顺序返回所有不重复的全排列。

示例：

\`\`\`
输入：nums = [1,1,2]
输出：[[1,1,2],[1,2,1],[2,1,1]]

输入：nums = [1,2,3]
输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
\`\`\`

## 思路

在 #46 基础上增加去重。决策树（排序后 nums=[1,1,2]）：

\`\`\`
            []
         /   |   \\
        1    1'   2
       /|\\   |
      1' 2   2
      |
      2
\`\`\`

若同层出现两个相同值 1 和 1'，以它们为起点的排列完全相同，产生重复。所以**同层去重**：排序后，若 \`nums[i] == nums[i-1]\` 且 \`nums[i-1]\` 未被访问（说明是同层回退），则跳过 \`nums[i]\`。

关键去重条件：\`i > 0 && nums[i] == nums[i-1] && !visited[i-1]\`。
- 为什么要求 \`!visited[i-1]\`？因为若前一个相同值已访问，说明是纵向递归（前一个 1 在 path 中，现在选第二个 1，是允许的，如 [1,1,2]）；若前一个未访问，说明是同层（前一个 1 刚被撤销，现在又选 1，会重复）。

先排序让相同元素相邻，再用 visited 标记使用状态。

## Python 实现

\`\`\`python
class Solution:
    def permuteUnique(self, nums):
        res = []
        path = []
        nums.sort()  # 排序让相同元素相邻
        visited = [False] * len(nums)

        def backtrack():
            if len(path) == len(nums):
                res.append(path[:])
                return
            for i in range(len(nums)):
                if visited[i]:
                    continue
                # 同层去重：与前一个相同且前一个未访问
                if i > 0 and nums[i] == nums[i - 1] and not visited[i - 1]:
                    continue
                visited[i] = True
                path.append(nums[i])
                backtrack()
                path.pop()
                visited[i] = False

        backtrack()
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var permuteUnique = function(nums) {
    const res = [];
    const path = [];
    nums.sort((a, b) => a - b);  // 排序让相同元素相邻
    const visited = new Array(nums.length).fill(false);

    const backtrack = () => {
        if (path.length === nums.length) {
            res.push([...path]);
            return;
        }
        for (let i = 0; i < nums.length; i++) {
            if (visited[i]) continue;
            // 同层去重：与前一个相同且前一个未访问
            if (i > 0 && nums[i] === nums[i - 1] && !visited[i - 1]) continue;
            visited[i] = true;
            path.push(nums[i]);
            backtrack();
            path.pop();
            visited[i] = false;
        }
    };

    backtrack();
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n * n!)，最坏 n! 个排列
- 空间复杂度：O(n)，递归深度 + visited

## 拓展

- 去重条件 \`!visited[i-1]\` 是本题难点，务必理解「同层 vs 纵向」的区别。
- 也可用 \`visited[i-1]\` 的写法（剪枝策略略不同），两者都正确，前者效率略高。
- 相关：#46 全排列、#90 子集 II，去重逻辑相通。`
  },

  // =============================================================
  // lc-137 #78 子集
  // =============================================================
  {
    id: "lc-137",
    group: "回溯算法",
    icon: "🔄",
    title: "#78 子集（中等）",
    content: `## 题目

**LeetCode #78 子集** | 难度：中等

给定一个无重复元素的整数数组 \`nums\`，返回该数组所有可能的子集（幂集）。解集不能包含重复子集。

示例：

\`\`\`
输入：nums = [1,2,3]
输出：[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]
\`\`\`

## 思路

子集与组合的区别：不需要凑齐 k 个，**每个节点**（不只是叶子）都是结果。决策树（nums=[1,2,3]）：

\`\`\`
            [] ✓
         /   |   \\
       [1]✓ [2]✓  [3]✓
       / \\    |
   [1,2]✓ [1,3]✓ [2,3]✓
     |
 [1,2,3]✓
\`\`\`

每个节点（含空集）都要加入答案。用 \`start\` 限制范围避免重复（与组合相同）。

回溯要素：
1. 路径：\`path\`。
2. 选择：\`[start, n)\`。
3. 收集：**进入函数立即收集** \`path\`（每个节点都是子集），无需等到叶子。

注意与组合的区别：组合有结束条件（选够 k 个），子集没有固定长度，每一步都记录。递归传 \`i + 1\` 保证不回头、不重复。

## Python 实现

\`\`\`python
class Solution:
    def subsets(self, nums):
        res = []
        path = []

        def backtrack(start):
            # 每个节点都是一个子集，立即收集
            res.append(path[:])
            for i in range(start, len(nums)):
                path.append(nums[i])
                backtrack(i + 1)  # 不回头
                path.pop()

        backtrack(0)
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var subsets = function(nums) {
    const res = [];
    const path = [];

    const backtrack = (start) => {
        // 每个节点都是一个子集，立即收集
        res.push([...path]);
        for (let i = start; i < nums.length; i++) {
            path.push(nums[i]);
            backtrack(i + 1);  // 不回头
            path.pop();
        }
    };

    backtrack(0);
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n * 2^n)，2^n 个子集，每个复制 O(n)
- 空间复杂度：O(n)，递归深度

## 拓展

- 子集的「每节点都收集」是与组合的关键区别。
- 另有迭代法：从空集开始，每加入一个数，把现有所有子集都加上该数生成新子集。
- 相关：#90 子集 II（含重复元素，需去重），去重思路同 #40/#47。`
  },

  // =============================================================
  // lc-138 #90 子集 II
  // =============================================================
  {
    id: "lc-138",
    group: "回溯算法",
    icon: "🔄",
    title: "#90 子集 II（中等）",
    content: `## 题目

**LeetCode #90 子集 II** | 难度：中等

给定一个可能包含重复元素的整数数组 \`nums\`，返回该数组所有可能的子集（幂集）。解集不能包含重复子集。

示例：

\`\`\`
输入：nums = [1,2,2]
输出：[[],[1],[1,2],[1,2,2],[2],[2,2]]

输入：nums = [0]
输出：[[],[0]]
\`\`\`

## 思路

在 #78 基础上增加去重。决策树（排序后 nums=[1,2,2]）：

\`\`\`
            [] ✓
         /      \\
       [1]✓     [2]✓
       / \\       |
   [1,2]✓ [1,2'] [2,2]✓  (2' 同层跳过)
     |
 [1,2,2]✓
\`\`\`

若同层出现两个相同的 2，第二个 2 作为分支起点产生的子集与第一个完全重复。所以**同层去重**：排序后，若 \`nums[i] == nums[i-1]\` 且 \`i > start\`，跳过。

去重条件：\`i > start && nums[i] == nums[i-1]\`（与 #40 组合总和 II 完全一致）。
- \`i > start\` 表示是同层（非纵向递归的第一个），跳过。
- 纵向递归允许相同（如 [1,2] 后选第二个 2 得到 [1,2,2]）。

每节点都收集子集，递归传 \`i + 1\`。

## Python 实现

\`\`\`python
class Solution:
    def subsetsWithDup(self, nums):
        res = []
        path = []
        nums.sort()  # 排序让相同元素相邻

        def backtrack(start):
            # 每个节点都是子集
            res.append(path[:])
            for i in range(start, len(nums)):
                # 同层去重：与前一个相同且不是本层第一个
                if i > start and nums[i] == nums[i - 1]:
                    continue
                path.append(nums[i])
                backtrack(i + 1)
                path.pop()

        backtrack(0)
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var subsetsWithDup = function(nums) {
    const res = [];
    const path = [];
    nums.sort((a, b) => a - b);  // 排序让相同元素相邻

    const backtrack = (start) => {
        // 每个节点都是子集
        res.push([...path]);
        for (let i = start; i < nums.length; i++) {
            // 同层去重：与前一个相同且不是本层第一个
            if (i > start && nums[i] === nums[i - 1]) continue;
            path.push(nums[i]);
            backtrack(i + 1);
            path.pop();
        }
    };

    backtrack(0);
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n * 2^n)，最坏 2^n 个子集
- 空间复杂度：O(n)，递归深度

## 拓展

- 「同层去重」\`i > start && nums[i] == nums[i-1]\` 是去重回溯的万能模板，#40、#47、#90 通用。
- 与 #78 区别仅在于排序 + 去重。
- 相关：#78 子集、#40 组合总和 II，去重逻辑一致。`
  },

  // =============================================================
  // lc-139 #17 电话号码的字母组合
  // =============================================================
  {
    id: "lc-139",
    group: "回溯算法",
    icon: "🔄",
    title: "#17 电话号码的字母组合（中等）",
    content: `## 题目

**LeetCode #17 电话号码的字母组合** | 难度：中等

给定一个仅包含数字 2-9 的字符串 \`digits\`，返回所有它能表示的字母组合。数字到字母的映射同电话按键（2:abc, 3:def, 4:ghi, 5:jkl, 6:mno, 7:pqrs, 8:tuv, 9:wxyz）。按任意顺序返回。

示例：

\`\`\`
输入：digits = "23"
输出：["ad","ae","af","bd","be","bf","cd","ce","cf"]

输入：digits = ""
输出：[]
\`\`\`

## 思路

每个数字对应多个字母，求所有组合就是经典的「多叉树遍历」。决策树（digits="23"）：

\`\`\`
          ""
        /  |  \\
       a   b   c
      /|\\  /|\\  /|\\
     ad ae af bd be bf cd ce cf
\`\`\`

回溯要素：
1. 路径：\`path\`（已选字母）。
2. 选择：当前数字对应的所有字母。
3. 结束：\`path.length == digits.length\`。

用 \`index\` 表示当前处理到第几个数字。每层遍历该数字对应的所有字母，逐个选择并递归。无需 visited（每个数字独立选字母，不存在重复使用问题）。

边界：\`digits\` 为空返回空列表。

## Python 实现

\`\`\`python
class Solution:
    def letterCombinations(self, digits):
        if not digits:
            return []
        # 数字到字母映射
        mapping = {
            '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
            '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
        }
        res = []

        def backtrack(index, path):
            # 结束条件：处理完所有数字
            if index == len(digits):
                res.append(''.join(path))
                return
            # 遍历当前数字对应的所有字母
            for ch in mapping[digits[index]]:
                path.append(ch)
                backtrack(index + 1, path)
                path.pop()

        backtrack(0, [])
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var letterCombinations = function(digits) {
    if (!digits) return [];
    // 数字到字母映射
    const mapping = {
        '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
        '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
    };
    const res = [];

    const backtrack = (index, path) => {
        // 结束条件：处理完所有数字
        if (index === digits.length) {
            res.push(path.join(''));
            return;
        }
        // 遍历当前数字对应的所有字母
        for (const ch of mapping[digits[index]]) {
            path.push(ch);
            backtrack(index + 1, path);
            path.pop();
        }
    };

    backtrack(0, []);
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(3^m * 4^n)，m 是对应 3 字母的数字数，n 是对应 4 字母的数字数
- 空间复杂度：O(m + n)，递归深度

## 拓展

- 本题是最简单的多叉树回溯，无剪枝无去重。
- 也可用迭代法：从 [\"\"] 开始，每遇到一个数字，把现有所有组合都追加该数字的每个字母。
- 相关：#22 括号生成是另一道基础回溯，结合了「选择受限」的剪枝思想。`
  },

  // =============================================================
  // lc-140 #22 括号生成
  // =============================================================
  {
    id: "lc-140",
    group: "回溯算法",
    icon: "🔄",
    title: "#22 括号生成（中等）",
    content: `## 题目

**LeetCode #22 括号生成** | 难度：中等

数字 \`n\` 代表生成括号的对数，请设计一个函数生成所有可能的且**有效的**括号组合。

示例：

\`\`\`
输入：n = 3
输出：["((()))","(()())","(())()","()(())","()()()"]

输入：n = 1
输出：["()"]
\`\`\`

## 思路

有效括号的核心约束：任意前缀中「左括号数 >= 右括号数」。基于此做回溯，决策树（n=3）：

\`\`\`
            ""
            |
           "("
          /    \\
       "(("   "()"
       /  \\      |
    "(((" "(()"  "()("
     |     |   ...
   "((())" "(()()"
     |
  "((()))"
\`\`\`

回溯要素：
1. 路径：\`path\`（已拼的括号串）。
2. 选择：可加 \`(\` 或 \`)\`。
3. 约束（剪枝核心）：
   - 左括号数 \`left < n\` 才能加 \`(\`。
   - 右括号数 \`right < left\` 才能加 \`)\`（保证前缀左 >= 右）。
4. 结束：\`path.length == 2 * n\`。

剪枝即约束本身：右括号不能比左括号多。这样保证生成的全是有效组合，无需事后校验。

## Python 实现

\`\`\`python
class Solution:
    def generateParenthesis(self, n):
        res = []

        def backtrack(path, left, right):
            # 结束条件：括号用完
            if len(path) == 2 * n:
                res.append(''.join(path))
                return
            # 可加左括号
            if left < n:
                path.append('(')
                backtrack(path, left + 1, right)
                path.pop()
            # 可加右括号（剪枝：右不能超过左）
            if right < left:
                path.append(')')
                backtrack(path, left, right + 1)
                path.pop()

        backtrack([], 0, 0)
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var generateParenthesis = function(n) {
    const res = [];

    const backtrack = (path, left, right) => {
        // 结束条件：括号用完
        if (path.length === 2 * n) {
            res.push(path.join(''));
            return;
        }
        // 可加左括号
        if (left < n) {
            path.push('(');
            backtrack(path, left + 1, right);
            path.pop();
        }
        // 可加右括号（剪枝：右不能超过左）
        if (right < left) {
            path.push(')');
            backtrack(path, left, right + 1);
            path.pop();
        }
    };

    backtrack([], 0, 0);
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(4^n / sqrt(n))，第 n 个卡特兰数
- 空间复杂度：O(n)，递归深度

## 拓展

- 「右括号不超过左括号」是本题剪枝核心，本质是卡特兰数的递归构造。
- 也可用闭合数法（区间 DP 思路）枚举第一对括号的位置。
- 相关：#301 删除无效括号、#921 使括号有效的最少插入，都用到括号有效性约束。`
  }
];
