// =============================================================
// LeetCode 面试算法 200 题 - 第十七批章节（动态规划进阶，共 10 题）
// 章节 lc-161 ~ lc-170：LIS/LCS/子数组/编辑距离/回文子串等
// =============================================================

export const chapters = [
  // =============================================================
  // lc-161 #300 最长递增子序列
  // =============================================================
  {
    id: "lc-161",
    group: "动态规划进阶",
    icon: "💎",
    title: "#300 最长递增子序列（中等）",
    content: `## 题目

**LeetCode #300 最长递增子序列** | 难度：中等

给你一个整数数组 \`nums\`，找到其中**最长严格递增子序列**的长度。子序列不要求连续，但要保持原数组中的相对顺序。

示例：

\`\`\`
输入：nums = [10,9,2,5,3,7,101,18]
输出：4
解释：最长递增子序列是 [2,3,7,101] 或 [2,3,7,18]，长度为 4
\`\`\`

## 思路

### 解法一：动态规划 O(n²)

1. **状态定义**：\`dp[i]\` 表示以 \`nums[i]\` 结尾的最长递增子序列长度。
2. **状态转移**：对所有 \`j < i\`，若 \`nums[j] < nums[i]\`，则 \`dp[i] = max(dp[i], dp[j] + 1)\`。
3. **初始条件**：每个元素自身构成长度为 1 的子序列，\`dp[i] = 1\`。
4. **遍历顺序**：外层 i 从左到右，内层 j 从 0 到 i-1。
5. **最终结果**：\`max(dp)\`，因为最长子序列可能以任意位置结尾。

### 解法二：贪心 + 二分 O(n log n)

维护一个数组 \`tails\`，\`tails[k]\` 表示长度为 \`k+1\` 的递增子序列的最小末尾。每来一个数，在 \`tails\` 中二分找第一个不小于它的位置并替换；若比所有都大则追加。这样 \`tails\` 始终有序，且长度即为答案。

## Python 实现

\`\`\`python
import bisect

class Solution:
    # 解法一：动态规划 O(n^2)
    def lengthOfLIS(self, nums):
        if not nums:
            return 0
        n = len(nums)
        # dp[i] 表示以 nums[i] 结尾的 LIS 长度
        dp = [1] * n
        for i in range(n):
            for j in range(i):
                if nums[j] < nums[i]:
                    dp[i] = max(dp[i], dp[j] + 1)
        return max(dp)

    # 解法二：贪心 + 二分 O(n log n)
    def lengthOfLIS_binary(self, nums):
        # tails[k] 是长度 k+1 的递增子序列的最小末尾
        tails = []
        for x in nums:
            # 找第一个 >= x 的位置
            idx = bisect.bisect_left(tails, x)
            if idx == len(tails):
                tails.append(x)
            else:
                tails[idx] = x
        return len(tails)
\`\`\`

## JavaScript 实现

\`\`\`javascript
// 解法一：动态规划 O(n^2)
var lengthOfLIS = function(nums) {
    if (!nums.length) return 0;
    const n = nums.length;
    // dp[i] 表示以 nums[i] 结尾的 LIS 长度
    const dp = new Array(n).fill(1);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
    }
    return Math.max(...dp);
};

// 解法二：贪心 + 二分 O(n log n)
var lengthOfLISBinary = function(nums) {
    // tails[k] 是长度 k+1 的递增子序列的最小末尾
    const tails = [];
    for (const x of nums) {
        let lo = 0, hi = tails.length;
        // 二分找第一个 >= x 的位置
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (tails[mid] < x) lo = mid + 1;
            else hi = mid;
        }
        if (lo === tails.length) tails.push(x);
        else tails[lo] = x;
    }
    return tails.length;
};
\`\`\`

## 复杂度

- 解法一：时间 O(n²)，空间 O(n)
- 解法二：时间 O(n log n)，空间 O(n)

## 拓展

- 若要求**非严格递增**（允许相等），二分时用 \`bisect_right\` 找第一个大于 x 的位置。
- #1671 求删除后剩余的 LIS 最大长度，需正反各跑一次 LIS。
- 记录具体方案：DP 时用 \`prev\` 数组回溯，或贪心时用 \`pos\` 记录每个元素在 tails 中的位置。`
  },

  // =============================================================
  // lc-162 #674 最长连续递增序列
  // =============================================================
  {
    id: "lc-162",
    group: "动态规划进阶",
    icon: "💎",
    title: "#674 最长连续递增序列（简单）",
    content: `## 题目

**LeetCode #674 最长连续递增序列** | 难度：简单

给定一个未经排序的整数数组 \`nums\`，找到其中**最长连续递增子序列**的长度。要求子序列**连续**。

示例：

\`\`\`
输入：nums = [1,3,5,4,7]
输出：3
解释：最长连续递增子序列是 [1,3,5]，长度为 3
\`\`\`

## 思路

1. **状态定义**：\`dp[i]\` 表示以 \`nums[i]\` 结尾的最长连续递增序列长度。
2. **状态转移**：若 \`nums[i] > nums[i-1]\`，则 \`dp[i] = dp[i-1] + 1\`；否则 \`dp[i] = 1\`。
3. **初始条件**：\`dp[0] = 1\`。
4. **遍历顺序**：从左到右一次遍历。
5. **最终结果**：\`max(dp)\`。

由于 \`dp[i]\` 只依赖 \`dp[i-1]\`，可滚动到单个变量，空间优化到 O(1)。

## Python 实现

\`\`\`python
class Solution:
    def findLengthOfLCIS(self, nums):
        if not nums:
            return 0
        n = len(nums)
        # dp[i] 表示以 nums[i] 结尾的最长连续递增序列长度
        dp = [1] * n
        for i in range(1, n):
            if nums[i] > nums[i - 1]:
                dp[i] = dp[i - 1] + 1
        return max(dp)

    # 空间优化版本
    def findLengthOfLCIS_opt(self, nums):
        ans = 0
        cur = 0
        for i in range(len(nums)):
            if i == 0 or nums[i] > nums[i - 1]:
                cur += 1
            else:
                cur = 1
            ans = max(ans, cur)
        return ans
\`\`\`

## JavaScript 实现

\`\`\`javascript
var findLengthOfLCIS = function(nums) {
    if (!nums.length) return 0;
    const n = nums.length;
    // dp[i] 表示以 nums[i] 结尾的最长连续递增序列长度
    const dp = new Array(n).fill(1);
    for (let i = 1; i < n; i++) {
        if (nums[i] > nums[i - 1]) {
            dp[i] = dp[i - 1] + 1;
        }
    }
    return Math.max(...dp);
};

// 空间优化版本
var findLengthOfLCISOpt = function(nums) {
    let ans = 0, cur = 0;
    for (let i = 0; i < nums.length; i++) {
        if (i === 0 || nums[i] > nums[i - 1]) cur++;
        else cur = 1;
        ans = Math.max(ans, cur);
    }
    return ans;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)，优化后 O(1)

## 拓展

- #300 是不连续版本，本题为连续版本，转移方程更简单。
- 也可用滑动窗口：右指针扩展直到不递增，记录窗口长度，左指针跳到右指针位置。`
  },

  // =============================================================
  // lc-163 #1143 最长公共子序列
  // =============================================================
  {
    id: "lc-163",
    group: "动态规划进阶",
    icon: "💎",
    title: "#1143 最长公共子序列（中等）",
    content: `## 题目

**LeetCode #1143 最长公共子序列** | 难度：中等

给定两个字符串 \`text1\` 和 \`text2\`，返回它们的最长**公共子序列**长度。子序列不要求连续。

示例：

\`\`\`
输入：text1 = "abcde", text2 = "ace"
输出：3
解释：最长公共子序列是 "ace"，长度为 3
\`\`\`

## 思路

1. **状态定义**：\`dp[i][j]\` 表示 \`text1[0..i-1]\` 与 \`text2[0..j-1]\` 的最长公共子序列长度。
2. **状态转移**：
   - 若 \`text1[i-1] == text2[j-1]\`：\`dp[i][j] = dp[i-1][j-1] + 1\`
   - 否则：\`dp[i][j] = max(dp[i-1][j], dp[i][j-1])\`
3. **初始条件**：\`dp[0][j] = dp[i][0] = 0\`（空串与任何串的 LCS 为 0）。
4. **遍历顺序**：i 从 1 到 m，j 从 1 到 n（两层循环均可，因为只依赖左上方三个位置）。
5. **最终结果**：\`dp[m][n]\`。

注意：当字符匹配时，两边各消耗一个字符；不匹配时，分别在两边各舍一个字符取最大值。

## Python 实现

\`\`\`python
class Solution:
    def longestCommonSubsequence(self, text1, text2):
        m, n = len(text1), len(text2)
        # dp[i][j] 表示 text1 前 i 个字符与 text2 前 j 个字符的 LCS 长度
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if text1[i - 1] == text2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
        return dp[m][n]
\`\`\`

## JavaScript 实现

\`\`\`javascript
var longestCommonSubsequence = function(text1, text2) {
    const m = text1.length, n = text2.length;
    // dp[i][j] 表示 text1 前 i 个字符与 text2 前 j 个字符的 LCS 长度
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
};
\`\`\`

## 复杂度

- 时间复杂度：O(mn)
- 空间复杂度：O(mn)，可用滚动数组优化到 O(min(m, n))

## 拓展

- 滚动数组优化：由于 \`dp[i]\` 只依赖 \`dp[i-1]\`，可用两行交替。
- #583 删除操作、#712 最小 ASCII 删除和、#1035 不相交的线 都是该模型的变体。
- 若要输出具体 LCS 字符串，回溯 \`dp\` 表：相等则取字符并向左上走，否则走向较大的一方。`
  },

  // =============================================================
  // lc-164 #1035 不相交的线
  // =============================================================
  {
    id: "lc-164",
    group: "动态规划进阶",
    icon: "💎",
    title: "#1035 不相交的线（中等）",
    content: `## 题目

**LeetCode #1035 不相交的线** | 难度：中等

在两条独立的水平线上按给定顺序写下 \`nums1\` 和 \`nums2\` 中的数字。允许绘制连接 \`nums1[i]\` 和 \`nums2[j]\` 的直线，要求这些直线**不相交**，返回最多能连多少条。

示例：

\`\`\`
输入：nums1 = [1,4,2], nums2 = [1,2,4]
输出：2
解释：可连 1-1 和 2-2 或 4-4 和 2-2
\`\`\`

## 思路

不相交意味着：连接的数字在两个数组中的相对顺序保持一致。这等价于求两个数组的**最长公共子序列（LCS）**长度——LCS 中的每个元素对应一条不相交的连线。

1. **状态定义**：\`dp[i][j]\` 表示 \`nums1[0..i-1]\` 与 \`nums2[0..j-1]\` 中最多可画的不相交连线数。
2. **状态转移**：
   - 若 \`nums1[i-1] == nums2[j-1]\`：\`dp[i][j] = dp[i-1][j-1] + 1\`
   - 否则：\`dp[i][j] = max(dp[i-1][j], dp[i][j-1])\`
3. **初始条件**：\`dp[0][j] = dp[i][0] = 0\`。
4. **遍历顺序**：i 从 1 到 m，j 从 1 到 n。
5. **最终结果**：\`dp[m][n]\`。

## Python 实现

\`\`\`python
class Solution:
    def maxUncrossedLines(self, nums1, nums2):
        m, n = len(nums1), len(nums2)
        # dp[i][j] 表示 nums1 前 i 个与 nums2 前 j 个的最大不相交连线数
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if nums1[i - 1] == nums2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
        return dp[m][n]
\`\`\`

## JavaScript 实现

\`\`\`javascript
var maxUncrossedLines = function(nums1, nums2) {
    const m = nums1.length, n = nums2.length;
    // dp[i][j] 表示 nums1 前 i 个与 nums2 前 j 个的最大不相交连线数
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (nums1[i - 1] === nums2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
};
\`\`\`

## 复杂度

- 时间复杂度：O(mn)
- 空间复杂度：O(mn)，可滚动数组优化到 O(min(m, n))

## 拓展

- 本题本质就是 LCS，理解「不相交 ⟺ 保持相对顺序」是关键。
- 若允许数字重复出现，连接方式不唯一，但 LCS 长度仍是最大连线数。
- #1143、#583 都是同一 DP 模型，可放在一起练习。`
  },

  // =============================================================
  // lc-165 #53 最大子数组和
  // =============================================================
  {
    id: "lc-165",
    group: "动态规划进阶",
    icon: "💎",
    title: "#53 最大子数组和（中等）",
    content: `## 题目

**LeetCode #53 最大子数组和** | 难度：中等

给你一个整数数组 \`nums\`，请你找出一个具有最大和的**连续子数组**（至少一个元素），返回其最大和。

示例：

\`\`\`
输入：nums = [-2,1,-3,4,-1,2,1,-5,4]
输出：6
解释：连续子数组 [4,-1,2,1] 的和最大，为 6
\`\`\`

## 思路

1. **状态定义**：\`dp[i]\` 表示以 \`nums[i]\` 结尾的最大连续子数组和。
2. **状态转移**：\`dp[i] = max(nums[i], dp[i-1] + nums[i])\`。即要么从 \`nums[i]\` 重新开始，要么接上前一段。
3. **初始条件**：\`dp[0] = nums[0]\`。
4. **遍历顺序**：从左到右一次遍历。
5. **最终结果**：\`max(dp)\`，因为最大和子数组可能以任意位置结尾。

由于 \`dp[i]\` 只依赖 \`dp[i-1]\`，可用一个变量滚动，空间 O(1)。这本质上就是 Kadane 算法。

## Python 实现

\`\`\`python
class Solution:
    def maxSubArray(self, nums):
        n = len(nums)
        # dp[i] 表示以 nums[i] 结尾的最大连续子数组和
        dp = [0] * n
        dp[0] = nums[0]
        ans = nums[0]
        for i in range(1, n):
            # 要么接上前面，要么从自己重新开始
            dp[i] = max(nums[i], dp[i - 1] + nums[i])
            ans = max(ans, dp[i])
        return ans

    # 空间优化版本（Kadane 算法）
    def maxSubArray_opt(self, nums):
        pre = ans = nums[0]
        for i in range(1, len(nums)):
            pre = max(nums[i], pre + nums[i])
            ans = max(ans, pre)
        return ans
\`\`\`

## JavaScript 实现

\`\`\`javascript
var maxSubArray = function(nums) {
    const n = nums.length;
    // dp[i] 表示以 nums[i] 结尾的最大连续子数组和
    const dp = new Array(n);
    dp[0] = nums[0];
    let ans = nums[0];
    for (let i = 1; i < n; i++) {
        // 要么接上前面，要么从自己重新开始
        dp[i] = Math.max(nums[i], dp[i - 1] + nums[i]);
        ans = Math.max(ans, dp[i]);
    }
    return ans;
};

// 空间优化版本（Kadane 算法）
var maxSubArrayOpt = function(nums) {
    let pre = ans = nums[0];
    for (let i = 1; i < nums.length; i++) {
        pre = Math.max(nums[i], pre + nums[i]);
        ans = Math.max(ans, pre);
    }
    return ans;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)
- 空间复杂度：O(n)，优化后 O(1)

## 拓展

- 若要返回具体子数组，记录取得最大值时的起点和终点。
- #152 乘积最大子数组：转移方程需同时维护 max 和 min（负负得正）。
- 分治解法 O(n log n)：将数组分成左右两半，最大和要么在左、要么在右、要么跨越中点。
- #918 环形子数组的最大和：分两种情况讨论，取 max。`
  },

  // =============================================================
  // lc-166 #392 判断子序列
  // =============================================================
  {
    id: "lc-166",
    group: "动态规划进阶",
    icon: "💎",
    title: "#392 判断子序列（简单）",
    content: `## 题目

**LeetCode #392 判断子序列** | 难度：简单

给定字符串 \`s\` 和 \`t\`，判断 \`s\` 是否为 \`t\` 的**子序列**（可以删除 \`t\` 中某些字符，但不打乱剩余字符相对顺序）。

示例：

\`\`\`
输入：s = "abc", t = "ahbgdc"
输出：true

输入：s = "axc", t = "ahbgdc"
输出：false
\`\`\`

## 思路

### 解法一：双指针 O(n + m)

用两个指针分别扫描 \`s\` 和 \`t\`，当 \`s[i] == t[j]\` 时 \`i\` 前进，\`j\` 始终前进。若 \`i\` 走完 \`s\` 说明是子序列。

### 解法二：动态规划（适合多次查询）

如果对同一 \`t\` 有大量 \`s\` 查询，可预处理 \`t\`：

1. **状态定义**：\`dp[j][c]\` 表示 \`t\` 中位置 \`j\` 之后字符 \`c\` 下一次出现的位置。
2. **状态转移**：\`dp[j][c] = j\`（若 \`t[j] == c\`），否则 \`dp[j][c] = dp[j+1][c]\`。
3. **初始条件**：\`dp[n][c] = n\`（表示没找到）。
4. **遍历顺序**：\`j\` 从 \`n-1\` 到 \`0\` 逆序。
5. **最终结果**：从 \`j=0\` 开始，按 \`s\` 的字符不断跳转；若跳到 \`n\` 说明找不到。

## Python 实现

\`\`\`python
class Solution:
    # 解法一：双指针
    def isSubsequence(self, s, t):
        i = 0
        for c in t:
            if i < len(s) and s[i] == c:
                i += 1
        return i == len(s)

    # 解法二：DP 预处理（多次查询友好）
    def isSubsequence_dp(self, s, t):
        n = len(t)
        # dp[j][c] 表示 t 中位置 j 之后字符 c 下一次出现的位置
        dp = [[n] * 26 for _ in range(n + 1)]
        for j in range(n - 1, -1, -1):
            for c in range(26):
                dp[j][c] = j if ord(t[j]) - ord('a') == c else dp[j + 1][c]
        # 从位置 0 开始匹配 s
        j = 0
        for ch in s:
            nxt = dp[j][ord(ch) - ord('a')]
            if nxt == n:
                return False
            j = nxt + 1
        return True
\`\`\`

## JavaScript 实现

\`\`\`javascript
// 解法一：双指针
var isSubsequence = function(s, t) {
    let i = 0;
    for (const c of t) {
        if (i < s.length && s[i] === c) i++;
    }
    return i === s.length;
};

// 解法二：DP 预处理（多次查询友好）
var isSubsequenceDP = function(s, t) {
    const n = t.length;
    // dp[j][c] 表示 t 中位置 j 之后字符 c 下一次出现的位置
    const dp = Array.from({ length: n + 1 }, () => new Array(26).fill(n));
    for (let j = n - 1; j >= 0; j--) {
        for (let c = 0; c < 26; c++) {
            dp[j][c] = (t.charCodeAt(j) - 97 === c) ? j : dp[j + 1][c];
        }
    }
    let j = 0;
    for (const ch of s) {
        const nxt = dp[j][ch.charCodeAt(0) - 97];
        if (nxt === n) return false;
        j = nxt + 1;
    }
    return true;
};
\`\`\`

## 复杂度

- 解法一：时间 O(n + m)，空间 O(1)
- 解法二：预处理 O(26n)，每次查询 O(m)

## 拓展

- #792 匹配子序列的单词数：大量查询场景，DP 预处理显著提速。
- #1055 形成字符串的最短路径：贪心 + 子序列匹配。
- 若 \`s\` 可空，应返回 true；若 \`t\` 空而 \`s\` 非空，应返回 false。`
  },

  // =============================================================
  // lc-167 #115 不同的子序列
  // =============================================================
  {
    id: "lc-167",
    group: "动态规划进阶",
    icon: "💎",
    title: "#115 不同的子序列（困难）",
    content: `## 题目

**LeetCode #115 不同的子序列** | 难度：困难

给定两个字符串 \`s\` 和 \`t\`，返回 \`s\` 的子序列中 \`t\` 出现的个数。结果保证在 32 位有符号整数范围内。

示例：

\`\`\`
输入：s = "rabbbit", t = "rabbit"
输出：3
解释：有 3 种方式从 s 中删除字符得到 t（删不同的 b）
\`\`\`

## 思路

1. **状态定义**：\`dp[i][j]\` 表示 \`s[0..i-1]\` 中组成 \`t[0..j-1]\` 的方案数。
2. **状态转移**：
   - 若 \`s[i-1] == t[j-1]\`：可以选 \`s[i-1]\` 配 \`t[j-1]\`（\`dp[i-1][j-1]\`），也可以不选 \`s[i-1]\`（\`dp[i-1][j]\`），两者相加。
   - 若不等：只能不选 \`s[i-1]\`，\`dp[i][j] = dp[i-1][j]\`。
3. **初始条件**：
   - \`dp[i][0] = 1\`（t 为空，s 中只有一种「删空」方案）。
   - \`dp[0][j] = 0\`（s 为空、t 非空，无法组成）。
4. **遍历顺序**：i 从 1 到 m，j 从 1 到 n。
5. **最终结果**：\`dp[m][n]\`。

注意：t 的长度通常较小，可对 t 维度滚动数组优化。

## Python 实现

\`\`\`python
class Solution:
    def numDistinct(self, s, t):
        m, n = len(s), len(t)
        # dp[i][j] 表示 s 前 i 个字符组成 t 前 j 个字符的方案数
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        # t 为空时，s 只有 1 种方案（全删）
        for i in range(m + 1):
            dp[i][0] = 1
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                # 不选 s[i-1]
                dp[i][j] = dp[i - 1][j]
                # 若相等，加上选 s[i-1] 的方案
                if s[i - 1] == t[j - 1]:
                    dp[i][j] += dp[i - 1][j - 1]
        return dp[m][n]
\`\`\`

## JavaScript 实现

\`\`\`javascript
var numDistinct = function(s, t) {
    const m = s.length, n = t.length;
    // dp[i][j] 表示 s 前 i 个字符组成 t 前 j 个字符的方案数
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    // t 为空时，s 只有 1 种方案（全删）
    for (let i = 0; i <= m; i++) dp[i][0] = 1;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            // 不选 s[i-1]
            dp[i][j] = dp[i - 1][j];
            // 若相等，加上选 s[i-1] 的方案
            if (s[i - 1] === t[j - 1]) {
                dp[i][j] += dp[i - 1][j - 1];
            }
        }
    }
    return dp[m][n];
};
\`\`\`

## 复杂度

- 时间复杂度：O(mn)
- 空间复杂度：O(mn)，可滚动数组优化到 O(n)

## 拓展

- 滚动数组优化：由于 \`dp[i]\` 只依赖 \`dp[i-1]\`，可逆序遍历 \`j\` 用一维数组。
- #583、#72 都是字符串匹配 DP 的变体，转移思路相似但操作不同。
- 注意取模：若题目要求结果取模，相加时及时取模避免溢出。`
  },

  // =============================================================
  // lc-168 #583 两个字符串的删除操作
  // =============================================================
  {
    id: "lc-168",
    group: "动态规划进阶",
    icon: "💎",
    title: "#583 两个字符串的删除操作（中等）",
    content: `## 题目

**LeetCode #583 两个字符串的删除操作** | 难度：中等

给定两个单词 \`word1\` 和 \`word2\`，找到使它们相同所需的最少删除步数（每步删一个字符）。

示例：

\`\`\`
输入：word1 = "sea", word2 = "eat"
输出：2
解释：删 word1 的 's'，删 word2 的 't'，得到 "ea"
\`\`\`

## 思路

### 解法一：直接 DP

1. **状态定义**：\`dp[i][j]\` 表示 \`word1[0..i-1]\` 与 \`word2[0..j-1]\` 相同所需的最少删除步数。
2. **状态转移**：
   - 若 \`word1[i-1] == word2[j-1]\`：\`dp[i][j] = dp[i-1][j-1]\`（无需删除）。
   - 否则：\`dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1])\`（删一个）。
3. **初始条件**：\`dp[i][0] = i\`，\`dp[0][j] = j\`（与空串相同需删全部）。
4. **遍历顺序**：i 从 1 到 m，j 从 1 到 n。
5. **最终结果**：\`dp[m][n]\`。

### 解法二：转化为 LCS

两串相同 ⟺ 都删成它们的 LCS。所以答案 = \`m + n - 2 * lcs\`。

## Python 实现

\`\`\`python
class Solution:
    def minDistance(self, word1, word2):
        m, n = len(word1), len(word2)
        # dp[i][j] 表示 word1 前 i 个与 word2 前 j 个相同所需的最少删除步数
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if word1[i - 1] == word2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1])
        return dp[m][n]
\`\`\`

## JavaScript 实现

\`\`\`javascript
var minDistance = function(word1, word2) {
    const m = word1.length, n = word2.length;
    // dp[i][j] 表示 word1 前 i 个与 word2 前 j 个相同所需的最少删除步数
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (word1[i - 1] === word2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
};
\`\`\`

## 复杂度

- 时间复杂度：O(mn)
- 空间复杂度：O(mn)，可滚动数组优化到 O(min(m, n))

## 拓展

- LCS 解法：先求 LCS，再 \`m + n - 2 * lcs\` 即为答案。
- #72 编辑距离允许替换和插入，本题只允许删除，更简单。
- #712 最小 ASCII 删除和：把步数换成 ASCII 值求和。`
  },

  // =============================================================
  // lc-169 #72 编辑距离
  // =============================================================
  {
    id: "lc-169",
    group: "动态规划进阶",
    icon: "💎",
    title: "#72 编辑距离（困难）",
    content: `## 题目

**LeetCode #72 编辑距离** | 难度：困难

给你两个单词 \`word1\` 和 \`word2\`，请返回将 \`word1\` 转换成 \`word2\` 所使用的最少操作数。可执行的操作：插入一个字符、删除一个字符、替换一个字符。

示例：

\`\`\`
输入：word1 = "horse", word2 = "ros"
输出：3
解释：horse -> rorse (替换 h 为 r) -> rose (删除 r) -> ros (删除 e)
\`\`\`

## 思路

1. **状态定义**：\`dp[i][j]\` 表示 \`word1[0..i-1]\` 转换成 \`word2[0..j-1]\` 的最少操作数。
2. **状态转移**：
   - 若 \`word1[i-1] == word2[j-1]\`：\`dp[i][j] = dp[i-1][j-1]\`（无需操作）。
   - 否则取以下三种操作的最小值加 1：
     - 删 \`word1[i-1]\`：\`dp[i-1][j] + 1\`
     - 插入（相当于删 \`word2[j-1]\`）：\`dp[i][j-1] + 1\`
     - 替换：\`dp[i-1][j-1] + 1\`
3. **初始条件**：
   - \`dp[i][0] = i\`（word1 全删成空串）。
   - \`dp[0][j] = j\`（空串全插成 word2）。
4. **遍历顺序**：i 从 1 到 m，j 从 1 到 n。
5. **最终结果**：\`dp[m][n]\`。

关键理解：插入操作 \`dp[i][j-1] + 1\` 表示在 word1 末尾插入 \`word2[j-1]\`，等价于把问题缩小为 \`word1[0..i-1]\` 转 \`word2[0..j-2]\` 再加一次插入。

## Python 实现

\`\`\`python
class Solution:
    def minDistance(self, word1, word2):
        m, n = len(word1), len(word2)
        # dp[i][j] 表示 word1 前 i 个转成 word2 前 j 个的最少操作数
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if word1[i - 1] == word2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    # 删、插、替换 三者取最小 +1
                    dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
        return dp[m][n]
\`\`\`

## JavaScript 实现

\`\`\`javascript
var minDistance = function(word1, word2) {
    const m = word1.length, n = word2.length;
    // dp[i][j] 表示 word1 前 i 个转成 word2 前 j 个的最少操作数
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (word1[i - 1] === word2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                // 删、插、替换 三者取最小 +1
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }
    return dp[m][n];
};
\`\`\`

## 复杂度

- 时间复杂度：O(mn)
- 空间复杂度：O(mn)，可滚动数组优化到 O(n)

## 拓展

- 滚动数组优化：\`dp[i]\` 只依赖 \`dp[i-1]\`，可用一维数组 + 前驱变量 \`pre\` 保存左上角值。
- #583 是只允许删除的简化版；#712 把操作代价换成 ASCII 值。
- 编辑距离是自然语言处理（拼写纠错、模糊匹配）的基础算法。
- 若只允许插入和删除（不允许替换），即 #583 模型，答案是 \`m + n - 2 * lcs\`。`
  },

  // =============================================================
  // lc-170 #647 回文子串
  // =============================================================
  {
    id: "lc-170",
    group: "动态规划进阶",
    icon: "💎",
    title: "#647 回文子串（中等）",
    content: `## 题目

**LeetCode #647 回文子串** | 难度：中等

给你一个字符串 \`s\`，请你统计并返回其中**回文子串**的数目。子串要求连续。

示例：

\`\`\`
输入：s = "abc"
输出：3
解释：三个回文子串 "a", "b", "c"

输入：s = "aaa"
输出：6
解释：6 个回文子串 "a","a","a","aa","aa","aaa"
\`\`\`

## 思路

### 解法一：动态规划

1. **状态定义**：\`dp[i][j]\` 表示 \`s[i..j]\` 是否为回文（布尔）。
2. **状态转移**：
   - 若 \`s[i] == s[j]\`：当 \`j - i < 2\`（长度 1 或 2）时 \`dp[i][j] = true\`；否则 \`dp[i][j] = dp[i+1][j-1]\`。
   - 若 \`s[i] != s[j]\`：\`dp[i][j] = false\`。
3. **初始条件**：\`dp[i][i] = true\`（单个字符必回文）。
4. **遍历顺序**：由于 \`dp[i][j]\` 依赖 \`dp[i+1][j-1]\`，必须**先算左下**。可按子串长度从小到大、或按 \`i\` 从大到小 \`j\` 从小到大遍历。
5. **最终结果**：统计所有 \`dp[i][j] == true\` 的数量。

### 解法二：中心扩展

枚举每个中心（奇数中心 n 个、偶数中心 n-1 个），向两边扩展统计回文数。空间 O(1)。

## Python 实现

\`\`\`python
class Solution:
    # 解法一：动态规划
    def countSubstrings(self, s):
        n = len(s)
        # dp[i][j] 表示 s[i..j] 是否为回文
        dp = [[False] * n for _ in range(n)]
        ans = 0
        # i 从大到小，保证 dp[i+1][j-1] 已算出
        for i in range(n - 1, -1, -1):
            for j in range(i, n):
                if s[i] == s[j]:
                    if j - i < 2 or dp[i + 1][j - 1]:
                        dp[i][j] = True
                        ans += 1
        return ans

    # 解法二：中心扩展
    def countSubstrings_expand(self, s):
        n = len(s)
        ans = 0
        def expand(l, r):
            cnt = 0
            while l >= 0 and r < n and s[l] == s[r]:
                cnt += 1
                l -= 1
                r += 1
            return cnt
        for i in range(n):
            ans += expand(i, i)      # 奇数中心
            ans += expand(i, i + 1)  # 偶数中心
        return ans
\`\`\`

## JavaScript 实现

\`\`\`javascript
// 解法一：动态规划
var countSubstrings = function(s) {
    const n = s.length;
    // dp[i][j] 表示 s[i..j] 是否为回文
    const dp = Array.from({ length: n }, () => new Array(n).fill(false));
    let ans = 0;
    // i 从大到小，保证 dp[i+1][j-1] 已算出
    for (let i = n - 1; i >= 0; i--) {
        for (let j = i; j < n; j++) {
            if (s[i] === s[j]) {
                if (j - i < 2 || dp[i + 1][j - 1]) {
                    dp[i][j] = true;
                    ans++;
                }
            }
        }
    }
    return ans;
};

// 解法二：中心扩展
var countSubstringsExpand = function(s) {
    const n = s.length;
    let ans = 0;
    const expand = (l, r) => {
        let cnt = 0;
        while (l >= 0 && r < n && s[l] === s[r]) {
            cnt++;
            l--;
            r++;
        }
        return cnt;
    };
    for (let i = 0; i < n; i++) {
        ans += expand(i, i);      // 奇数中心
        ans += expand(i, i + 1);  // 偶数中心
    }
    return ans;
};
\`\`\`

## 复杂度

- 解法一：时间 O(n²)，空间 O(n²)
- 解法二：时间 O(n²)，空间 O(1)

## 拓展

- #5 最长回文子串：中心扩展时记录最长即可。
- #131 分割回文串：先 DP 预处理回文表，再 DFS/DP 切分。
- #1745 分割成回文串 III：结合区间 DP 与划分 DP。
- Manacher 算法可在 O(n) 时间内求所有回文半径，是进阶解法。`
  }
];
