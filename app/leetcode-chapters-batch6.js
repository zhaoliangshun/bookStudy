// =============================================================
// LeetCode 面试算法 200 题 —— 第六批章节（二分查找组，共 10 题）
// -------------------------------------------------------------
// 题号 lc-51 ~ lc-60，覆盖二分查找经典面试题。
// 每题包含：题目 / 思路 / Python 实现 / JavaScript 实现 / 复杂度 / 拓展。
// 区间约定：统一使用“左闭右闭” [left, right] 写法，并在涉及处说明对比。
// =============================================================

export const chapters = [
  // =========================================================
  // #704 二分查找（简单）
  // =========================================================
  {
    id: "lc-51",
    group: "二分查找",
    icon: "🔍",
    title: "#704 二分查找（简单）",
    content: `
## 题目

**LeetCode #704 二分查找** | 难度：简单

给定一个 **升序排列** 的整数数组 \`nums\` 和一个目标值 \`target\`，写一个函数在 \`nums\` 中搜索 \`target\`，若存在返回其下标，否则返回 \`-1\`。算法时间复杂度必须是 O(log n)。

**示例：**
输入：nums = [-1,0,3,5,9,12], target = 9
输出：4
解释：9 出现在 nums 中，下标为 4

输入：nums = [-1,0,3,5,9,12], target = 2
输出：-1

## 思路

二分查找是最基础的折半算法，前提是数组**有序**。核心思路：每次取区间中点 \`mid\`，比较 \`nums[mid]\` 与 \`target\`，根据大小关系把搜索区间缩为一半。

这里采用 **“左闭右闭” \`[left, right]\`** 约定：
1. 初始化 \`left = 0\`、\`right = len(nums) - 1\`，表示区间内每个下标都可能是答案。
2. 循环条件 \`left <= right\`：因为 \`right\` 本身也是合法候选，等于号不能省。
3. 取中点 \`mid = left + (right - left) // 2\`，避免 \`(left+right)\` 在大数下溢出。
4. 若 \`nums[mid] == target\`，直接返回 \`mid\`；若 \`nums[mid] < target\`，说明目标在右半段，\`left = mid + 1\`；否则 \`right = mid - 1\`。
5. 跳出循环仍未找到，返回 \`-1\`。

每次比较都把区间折半，故最多比较 log₂n 次。

## Python 实现

\`\`\`python
class Solution:
    def search(self, nums, target):
        # 左闭右闭区间 [left, right]
        left, right = 0, len(nums) - 1
        while left <= right:
            # 防溢出写法
            mid = left + (right - left) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                # 目标在右半段，跳过 mid
                left = mid + 1
            else:
                # 目标在左半段，跳过 mid
                right = mid - 1
        return -1
\`\`\`

## JavaScript 实现

\`\`\`javascript
var search = function(nums, target) {
    // 左闭右闭区间 [left, right]
    var left = 0, right = nums.length - 1;
    while (left <= right) {
        // 用位运算防溢出，等价于 Math.floor((left+right)/2)
        var mid = left + ((right - left) >> 1);
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
};
\`\`\`

## 复杂度

- 时间复杂度：O(log n)，每次循环区间减半。
- 空间复杂度：O(1)，只用常数个变量。

## 拓展

- **左闭右开写法对比**：若用 \`[left, right)\`，则 \`right = len(nums)\`、循环条件 \`left < right\`、收缩时 \`right = mid\`（不 +1）。两者本质等价，但“左闭右闭”边界更直观。
- **\`mid\` 计算防溢出**：\`left + (right - left) // 2\` 比 \`(left + right) // 2\` 更安全；JS 中可用 \`>> 1\` 替代除以 2。
- **相关题目**：#35 搜索插入位置、#34 在排序数组中查找元素的第一个和最后一个位置。
`
  },
  // =========================================================
  // #35 搜索插入位置（简单）
  // =========================================================
  {
    id: "lc-52",
    group: "二分查找",
    icon: "🔍",
    title: "#35 搜索插入位置（简单）",
    content: `
## 题目

**LeetCode #35 搜索插入位置** | 难度：简单

给定一个 **升序排列** 的整数数组 \`nums\` 和一个目标值 \`target\`，请返回 \`target\` 应该插入的下标。如果 \`target\` 已经在数组中，则返回它的下标。要求 O(log n) 时间。

**示例：**
输入：nums = [1,3,5,6], target = 5
输出：2

输入：nums = [1,3,5,6], target = 2
输出：1
解释：2 不存在，应插入到下标 1 使数组仍有序

输入：nums = [1,3,5,6], target = 7
输出：4

## 思路

这题是“查找第一个大于等于 \`target\` 的位置”，即标准的**二分下界（lower_bound）**。

由于“插入位置”可能落在数组末尾（\`target\` 比所有元素都大时返回 \`n\`），用 **“左闭右开” \`[left, right)\`** 写法更自然：\`right\` 初始为 \`len(nums)\`，可表示“插到最后”。

算法：
1. \`left = 0\`、\`right = len(nums)\`，区间 \`[left, right)\`。
2. 当 \`left < right\` 时取 \`mid = left + (right - left) // 2\`。
3. 若 \`nums[mid] < target\`，答案在右半段，\`left = mid + 1\`；
4. 否则（\`nums[mid] >= target\`），\`mid\` 可能就是答案，但左侧或许还有更小的，\`right = mid\`。
5. 循环结束时 \`left == right\`，即为插入位置。

关键点：收缩 \`right\` 时用 \`right = mid\` 而非 \`mid - 1\`，因为 \`mid\` 本身仍可能是答案——这与“精确查找”的写法不同。

## Python 实现

\`\`\`python
class Solution:
    def searchInsert(self, nums, target):
        # 左闭右开区间 [left, right)
        left, right = 0, len(nums)
        while left < right:
            mid = left + (right - left) // 2
            if nums[mid] < target:
                # mid 太小，排除掉
                left = mid + 1
            else:
                # nums[mid] >= target，mid 仍可能是答案
                right = mid
        # left == right 即为插入位置
        return left
\`\`\`

## JavaScript 实现

\`\`\`javascript
var searchInsert = function(nums, target) {
    // 左闭右开区间 [left, right)
    var left = 0, right = nums.length;
    while (left < right) {
        var mid = left + ((right - left) >> 1);
        if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
};
\`\`\`

## 复杂度

- 时间复杂度：O(log n)，标准二分。
- 空间复杂度：O(1)。

## 拓展

- **左闭右闭写法**：\`right = n - 1\`、循环 \`left <= right\`，结束时返回 \`left\`（即 \`right + 1\`）。两者结果一致，但左闭右开在“返回位置类”题目里更不容易写错。
- **本质**：本题即 C++ 的 \`lower_bound\`，返回第一个 \`>= target\` 的位置；若要“第一个 \`> target\`”则改判断为 \`nums[mid] <= target\`（即 \`upper_bound\`）。
- **相关题目**：#704 二分查找、#278 第一个错误的版本。
`
  },
  // =========================================================
  // #278 第一个错误的版本（简单）
  // =========================================================
  {
    id: "lc-53",
    group: "二分查找",
    icon: "🔍",
    title: "#278 第一个错误的版本（简单）",
    content: `
## 题目

**LeetCode #278 第一个错误的版本** | 难度：简单

你是产品经理，当前有 \`n\` 个版本 \`[1, 2, ..., n]\`。已知一旦某个版本是**坏的**，其后所有版本都是坏的。给定一个 API \`isBadVersion(version)\` 返回该版本是否坏。请找出**第一个坏的版本**。要求尽量减少调用 \`isBadVersion\` 的次数。

**示例：**
输入：n = 5, bad = 4
输出：4
解释：调用 isBadVersion(3) → false，isBadVersion(4) → true，所以第一个坏版本是 4

## 思路

由于“坏版本之后全是坏的”，整体呈现 \`[false, false, ..., false, true, true, ...]\` 的形态，分界点就是答案——典型的**二分下界**问题。

用 **“左闭右开” \`[left, right)\`**：
1. \`left = 1\`、\`right = n + 1\`（区间内的版本号都合法）。
2. \`mid = left + (right - left) // 2\`，调用 \`isBadVersion(mid)\`。
3. 若 \`mid\` 不是坏的，说明分界点在右侧，\`left = mid + 1\`。
4. 若 \`mid\` 是坏的，\`mid\` 可能就是第一个坏的，但也可能更靠左，\`right = mid\`。
5. \`left == right\` 时即为第一个坏版本。

**减少 API 调用**：每次循环只调用一次 \`isBadVersion(mid)\`，并用变量缓存结果，避免在 \`if-else\` 分支里重复调用。

## Python 实现

\`\`\`python
def isBadVersion(version):
    # 由题目提供，这里仅为占位
    return version >= 4

class Solution:
    def firstBadVersion(self, n):
        # 左闭右开 [1, n+1)
        left, right = 1, n + 1
        while left < right:
            mid = left + (right - left) // 2
            # 缓存结果，避免重复调用 API
            if isBadVersion(mid):
                # mid 是坏的，分界点在 mid 或更左
                right = mid
            else:
                # mid 是好的，分界点在右侧
                left = mid + 1
        return left
\`\`\`

## JavaScript 实现

\`\`\`javascript
var solution = function(isBadVersion) {
    return function(n) {
        // 左闭右开 [1, n+1)
        var left = 1, right = n + 1;
        while (left < right) {
            var mid = left + ((right - left) >> 1);
            // 只调用一次 API
            if (isBadVersion(mid)) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        return left;
    };
};
\`\`\`

## 复杂度

- 时间复杂度：O(log n)，每次循环折半，API 调用次数为 ⌈log₂n⌉。
- 空间复杂度：O(1)。

## 拓展

- **常见错误**：写 \`mid = (left + right) // 2\` 在 \`n\` 较大时会整型溢出，必须用 \`left + (right - left) // 2\`。
- **左闭右闭写法**：\`left = 1, right = n\`、循环 \`left < right\`、\`mid = left + (right - left) // 2\`，坏则 \`right = mid\`，好则 \`left = mid + 1\`，最后 \`left\` 即答案（注意 \`mid\` 不能用 \`(left+right)//2\`，否则可能死循环）。
- **本质**：找第一个 \`true\`，即布尔数组的下界。同模式题目：#852 山脉数组的峰顶索引、#744 寻找比目标字母大的最小字母。
`
  },
  // =========================================================
  // #367 有效的完全平方数（简单）
  // =========================================================
  {
    id: "lc-54",
    group: "二分查找",
    icon: "🔍",
    title: "#367 有效的完全平方数（简单）",
    content: `
## 题目

**LeetCode #367 有效的完全平方数** | 难度：简单

给定一个 **正整数** \`num\`，判断它是否是一个完全平方数（即是否存在整数 \`x\` 满足 \`x * x == num\`）。要求**不使用内置的平方根函数**如 \`sqrt\`。

**示例：**
输入：num = 16
输出：true
解释：4 * 4 = 16

输入：num = 14
输出：false

## 思路

若 \`num\` 是完全平方数，则 \`x = sqrt(num)\` 必为整数，且 \`1 <= x <= num\`。于是问题等价于：在 \`[1, num]\` 内用二分查找是否存在一个 \`mid\` 使得 \`mid * mid == num\`。

采用 **“左闭右闭” \`[left, right]\`**：
1. \`left = 1\`、\`right = num\`（注意 \`num = 1\` 时也合法）。
2. 循环 \`left <= right\`，\`mid = left + (right - left) // 2\`。
3. 计算 \`sq = mid * mid\`：
   - \`sq == num\`：返回 \`true\`；
   - \`sq < num\`：\`left = mid + 1\`；
   - \`sq > num\`：\`right = mid - 1\`（注意 \`mid * mid\` 可能溢出，需用长整型或 BigInt）。
4. 循环结束未命中，返回 \`false\`。

**优化上界**：当 \`num >= 4\` 时，\`sqrt(num) <= num / 2\`，可令 \`right = num // 2\` 减少迭代次数；但用 \`num\` 作上界也能 AC，逻辑更简单。

## Python 实现

\`\`\`python
class Solution:
    def isPerfectSquare(self, num):
        # 左闭右闭 [1, num]
        left, right = 1, num
        while left <= right:
            mid = left + (right - left) // 2
            sq = mid * mid
            if sq == num:
                return True
            elif sq < num:
                left = mid + 1
            else:
                right = mid - 1
        return False
\`\`\`

## JavaScript 实现

\`\`\`javascript
var isPerfectSquare = function(num) {
    // 左闭右闭 [1, num]
    var left = 1, right = num;
    while (left <= right) {
        var mid = left + ((right - left) >> 1);
        var sq = mid * mid;
        if (sq === num) {
            return true;
        } else if (sq < num) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return false;
};
\`\`\`

## 复杂度

- 时间复杂度：O(log n)，其中 n = num。
- 空间复杂度：O(1)。

## 拓展

- **溢出注意**：JS 中 \`mid * mid\` 仍是双精度浮点，\`Number.MAX_SAFE_INTEGER\` 之内安全；Python 整数无限精度无此问题。若用 C++/Java，需用 \`long\` 防止 \`mid * mid\` 溢出。
- **数学法**：完全平方数满足 \`1 + 3 + 5 + ... + (2k-1) = k²\`，故不断减去奇数直到不能减，最终为 0 即完全平方数，O(√n) 时间。
- **牛顿迭代法**：\`x = (x + num / x) / 2\` 迭代收敛极快，O(log log n)。
- **相关题目**：#69 x 的平方根。
`
  },
  // =========================================================
  // #69 x 的平方根（简单）
  // =========================================================
  {
    id: "lc-55",
    group: "二分查找",
    icon: "🔍",
    title: "#69 x 的平方根（简单）",
    content: `
## 题目

**LeetCode #69 x 的平方根** | 难度：简单

给定一个非负整数 \`x\`，计算并返回 \`x\` 的**算术平方根的整数部分**（即 \`⌊√x⌋\`）。要求不使用内置指数函数或 \`sqrt\`。

**示例：**
输入：x = 4
输出：2

输入：x = 8
输出：2
解释：8 的算术平方根是 2.8284...，整数部分为 2

## 思路

求 \`⌊√x⌋\` 等价于找最大的整数 \`ans\` 满足 \`ans * ans <= x\`。这是典型的**二分上界**——在 \`[0, x]\` 上二分，保留满足条件的最大值。

采用 **“左闭右闭” \`[left, right]\`**：
1. \`left = 0\`、\`right = x\`（\`x = 0/1\` 时也覆盖）。
2. 循环 \`left <= right\`，\`mid = left + (right - left) // 2\`。
3. 若 \`mid * mid <= x\`：\`mid\` 是一个可行解，但可能还有更大的，记录 \`ans = mid\` 并 \`left = mid + 1\`。
4. 否则 \`mid * mid > x\`：\`mid\` 太大，\`right = mid - 1\`。
5. 最终 \`ans\` 即为答案。

与 #367 的区别：#367 只判“是否完全平方”，命中即返回；本题要保留“最后一个满足 \`mid² <= x\` 的 mid”，故需用 \`ans\` 变量累积。

## Python 实现

\`\`\`python
class Solution:
    def mySqrt(self, x):
        # 左闭右闭 [0, x]
        left, right = 0, x
        ans = 0
        while left <= right:
            mid = left + (right - left) // 2
            if mid * mid <= x:
                # mid 是可行解，尝试找更大的
                ans = mid
                left = mid + 1
            else:
                right = mid - 1
        return ans
\`\`\`

## JavaScript 实现

\`\`\`javascript
var mySqrt = function(x) {
    // 左闭右闭 [0, x]
    var left = 0, right = x;
    var ans = 0;
    while (left <= right) {
        var mid = left + ((right - left) >> 1);
        if (mid * mid <= x) {
            ans = mid;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return ans;
};
\`\`\`

## 复杂度

- 时间复杂度：O(log x)。
- 空间复杂度：O(1)。

## 拓展

- **左闭右开写法**：\`right = x + 1\`、循环 \`left < right\`、\`mid * mid <= x\` 时 \`left = mid + 1\` 否则 \`right = mid\`，最终返回 \`left - 1\`。
- **牛顿迭代法**：\`x_{n+1} = (x_n + S / x_n) / 2\`（S 为被开方数），收敛速度 O(log log S)，几步即可达到机器精度。
- **溢出注意**：\`mid * mid\` 在 JS 中对大数会超出安全整数范围，可改写为 \`mid <= x / mid\` 避免乘法溢出（注意整除比较）。
- **相关题目**：#367 有效的完全平方数。
`
  },
  // =========================================================
  // #34 在排序数组中查找元素的第一个和最后一个位置（中等）
  // =========================================================
  {
    id: "lc-56",
    group: "二分查找",
    icon: "🔍",
    title: "#34 在排序数组中查找元素的第一个和最后一个位置（中等）",
    content: `
## 题目

**LeetCode #34 在排序数组中查找元素的第一个和最后一个位置** | 难度：中等

给定一个 **升序排列** 的整数数组 \`nums\` 和一个目标值 \`target\`，请找出 \`target\` 在数组中的**开始位置和结束位置**。若 \`target\` 不存在返回 \`[-1, -1]\`。要求 O(log n) 时间。

**示例：**
输入：nums = [5,7,7,8,8,10], target = 8
输出：[3,4]

输入：nums = [5,7,7,8,8,10], target = 6
输出：[-1,-1]

## 思路

本题是经典的 **“二分下界 + 二分上界”** 组合：
- **左边界**：第一个 \`>= target\` 的位置（\`lower_bound\`）。
- **右边界**：第一个 \`> target\` 的位置减 1（\`upper_bound - 1\`）。

采用 **“左闭右开” \`[left, right)\`**，分别写两个二分：

**找左边界 \`lo\`：**
1. \`left = 0\`、\`right = n\`，循环 \`left < right\`。
2. \`mid = (left + right) // 2\`，若 \`nums[mid] < target\`，\`left = mid + 1\`；否则 \`right = mid\`。
3. 结束后 \`lo = left\`。若 \`lo == n\` 或 \`nums[lo] != target\`，说明 \`target\` 不存在，返回 \`[-1, -1]\`。

**找右边界 \`hi\`（找第一个 \`> target\`）：**
1. \`left = 0\`、\`right = n\`，循环 \`left < right\`。
2. \`mid = (left + right) // 2\`，若 \`nums[mid] <= target\`，\`left = mid + 1\`；否则 \`right = mid\`。
3. 结束后 \`hi = left - 1\`。

返回 \`[lo, hi]\`。关键在于两次二分的“收缩条件”不同：找左边界用 \`<\` 排除，找右边界用 \`<=\` 排除。

## Python 实现

\`\`\`python
class Solution:
    def searchRange(self, nums, target):
        n = len(nums)
        # 找第一个 >= target 的位置
        lo = self.lowerBound(nums, target, n)
        # 若 target 不存在
        if lo == n or nums[lo] != target:
            return [-1, -1]
        # 找第一个 > target 的位置，再减 1
        hi = self.upperBound(nums, target, n) - 1
        return [lo, hi]

    def lowerBound(self, nums, target, n):
        # 左闭右开 [0, n)
        left, right = 0, n
        while left < right:
            mid = left + (right - left) // 2
            if nums[mid] < target:
                left = mid + 1
            else:
                right = mid
        return left

    def upperBound(self, nums, target, n):
        # 找第一个 > target
        left, right = 0, n
        while left < right:
            mid = left + (right - left) // 2
            if nums[mid] <= target:
                left = mid + 1
            else:
                right = mid
        return left
\`\`\`

## JavaScript 实现

\`\`\`javascript
var searchRange = function(nums, target) {
    var n = nums.length;
    var lo = lowerBound(nums, target, n);
    if (lo === n || nums[lo] !== target) {
        return [-1, -1];
    }
    var hi = upperBound(nums, target, n) - 1;
    return [lo, hi];
};

function lowerBound(nums, target, n) {
    var left = 0, right = n;
    while (left < right) {
        var mid = left + ((right - left) >> 1);
        if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
}

function upperBound(nums, target, n) {
    var left = 0, right = n;
    while (left < right) {
        var mid = left + ((right - left) >> 1);
        if (nums[mid] <= target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
}
\`\`\`

## 复杂度

- 时间复杂度：O(log n)，两次二分各 O(log n)。
- 空间复杂度：O(1)。

## 拓展

- **统一模板**：把 \`lower_bound\` 和 \`upper_bound\` 抽成函数是工程化做法；面试中若想少写代码，可让 \`upper_bound(target) = lower_bound(target + 1)\`，但要注意 \`target + 1\` 在整数边界（如 \`2³¹-1\`）溢出。
- **左闭右闭写法**：循环 \`left <= right\`，收缩时左边界 \`right = mid - 1\` 但记录 \`ans\`，思路类似 #69。
- **相关题目**：#35 搜索插入位置、#278 第一个错误的版本、#744 寻找比目标字母大的最小字母。
`
  },
  // =========================================================
  // #33 搜索旋转排序数组（中等）
  // =========================================================
  {
    id: "lc-57",
    group: "二分查找",
    icon: "🔍",
    title: "#33 搜索旋转排序数组（中等）",
    content: `
## 题目

**LeetCode #33 搜索旋转排序数组** | 难度：中等

给定一个 **升序排列** 且 **互不相同** 的整数数组 \`nums\`，它在某个未知下标 \`k\` 处被旋转（\`nums[k], nums[k+1], ..., nums[n-1], nums[0], ..., nums[k-1]\`）。给定 \`target\`，返回其在 \`nums\` 中的下标，不存在返回 \`-1\`。要求 O(log n) 时间。

**示例：**
输入：nums = [4,5,6,7,0,1,2], target = 0
输出：4

输入：nums = [4,5,6,7,0,1,2], target = 3
输出：-1

## 思路

虽然整体被旋转，但二分后**至少有一半是严格有序的**。利用这个性质判断 \`target\` 落在哪一半，从而把搜索区间减半。

采用 **“左闭右闭” \`[left, right]\`**：
1. \`left = 0\`、\`right = n - 1\`，循环 \`left <= right\`。
2. \`mid = (left + right) // 2\`，若 \`nums[mid] == target\` 返回 \`mid\`。
3. 判断 \`mid\` 落在“左半有序”还是“右半有序”：
   - 若 \`nums[left] <= nums[mid]\`（左半有序，等号覆盖 \`left == mid\` 的情况）：
     - 若 \`nums[left] <= target < nums[mid]\`，\`target\` 在左半，\`right = mid - 1\`；
     - 否则 \`left = mid + 1\`。
   - 否则（右半有序）：
     - 若 \`nums[mid] < target <= nums[right]\`，\`target\` 在右半，\`left = mid + 1\`；
     - 否则 \`right = mid - 1\`。
4. 循环结束未命中返回 \`-1\`。

关键点：判断哪一半有序用 \`nums[left] <= nums[mid]\`；判断 \`target\` 是否在有序半段内要包含端点。题目保证元素**互不相同**，否则该判断不可靠（见 #81）。

## Python 实现

\`\`\`python
class Solution:
    def search(self, nums, target):
        # 左闭右闭 [left, right]
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = left + (right - left) // 2
            if nums[mid] == target:
                return mid
            # 判断左半是否有序
            if nums[left] <= nums[mid]:
                # target 在左半有序段内
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:
                # 右半有序
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1
        return -1
\`\`\`

## JavaScript 实现

\`\`\`javascript
var search = function(nums, target) {
    var left = 0, right = nums.length - 1;
    while (left <= right) {
        var mid = left + ((right - left) >> 1);
        if (nums[mid] === target) {
            return mid;
        }
        // 左半有序
        if (nums[left] <= nums[mid]) {
            if (nums[left] <= target && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            // 右半有序
            if (nums[mid] < target && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }
    return -1;
};
\`\`\`

## 复杂度

- 时间复杂度：O(log n)，每次循环区间折半。
- 空间复杂度：O(1)。

## 拓展

- **为什么 \`nums[left] <= nums[mid]\` 要带等号**：当 \`left == mid\`（区间长度为 1 或 2）时，二者相等，需归入“左半有序”分支才能正确收缩。
- **找旋转点法**：也可先二分找最小值下标 \`k\`，再在 \`[0, k-1]\` 或 \`[k, n-1]\` 上做标准二分，共两次 O(log n)。代码更长但思路更清晰。
- **相关题目**：#81 搜索旋转排序数组 II（含重复）、#153 寻找旋转排序数组中的最小值。
`
  },
  // =========================================================
  // #81 搜索旋转排序数组 II（中等）
  // =========================================================
  {
    id: "lc-58",
    group: "二分查找",
    icon: "🔍",
    title: "#81 搜索旋转排序数组 II（中等）",
    content: `
## 题目

**LeetCode #81 搜索旋转排序数组 II** | 难度：中等

已知存在一个升序数组（**可能包含重复元素**）在某个下标处被旋转。给定 \`nums\` 和 \`target\`，判断 \`target\` 是否在数组中。要求尽量做到 O(log n)，最坏可退化为 O(n)。

**示例：**
输入：nums = [2,5,6,0,0,1,2], target = 0
输出：true

输入：nums = [2,5,6,0,0,1,2], target = 3
输出：false

## 思路

整体框架同 #33，但因有重复元素，会出现 \`nums[left] == nums[mid] == nums[right]\` 的“无法判定哪半有序”的情况。例如 \`[1,0,1,1,1]\` 中 \`left=0, mid=2, right=4\` 时 \`nums[0]=nums[2]=nums[4]=1\`，单靠端点比较无法区分。

解决办法：当 \`nums[left] == nums[mid]\`（且 \`nums[mid] == nums[right]\`）时，**左右各跳过一个**——\`left++\`、\`right--\`，跳过重复值后再判断。这导致最坏情况下退化为 O(n)（如全 1 数组）。

采用 **“左闭右闭” \`[left, right]\`**：
1. \`left = 0\`、\`right = n - 1\`，循环 \`left <= right\`。
2. \`mid = (left + right) // 2\`，若 \`nums[mid] == target\` 返回 \`true\`。
3. 处理重复：若 \`nums[left] == nums[mid] && nums[mid] == nums[right]\`，\`left++\`、\`right--\`，\`continue\`。
4. 否则按 #33 逻辑判断哪半有序，收缩区间。
5. 循环结束返回 \`false\`。

## Python 实现

\`\`\`python
class Solution:
    def search(self, nums, target):
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = left + (right - left) // 2
            if nums[mid] == target:
                return True
            # 无法判断哪半有序，跳过两端重复值
            if nums[left] == nums[mid] and nums[mid] == nums[right]:
                left += 1
                right -= 1
            elif nums[left] <= nums[mid]:
                # 左半有序
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:
                # 右半有序
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1
        return False
\`\`\`

## JavaScript 实现

\`\`\`javascript
var search = function(nums, target) {
    var left = 0, right = nums.length - 1;
    while (left <= right) {
        var mid = left + ((right - left) >> 1);
        if (nums[mid] === target) {
            return true;
        }
        // 无法判定时跳过两端
        if (nums[left] === nums[mid] && nums[mid] === nums[right]) {
            left++;
            right--;
        } else if (nums[left] <= nums[mid]) {
            if (nums[left] <= target && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            if (nums[mid] < target && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }
    return false;
};
\`\`\`

## 复杂度

- 时间复杂度：平均 O(log n)，最坏 O(n)（如 \`[1,1,1,...,1,0]\`）。
- 空间复杂度：O(1)。

## 拓展

- **为什么不能只用 \`nums[left] == nums[mid]\` 判断跳过**：若 \`nums[mid] != nums[right]\`，其实仍可判断右半有序，贸然 \`left++\` 会丢失信息。严格写法是 \`nums[left] == nums[mid] && nums[mid] == nums[right]\` 三者相等时才跳。
- **简化写法**：也可仅判断 \`nums[left] == nums[mid]\` 时 \`left++\`，逻辑更短但偶尔多走几步，复杂度仍 O(n) 最坏。
- **相关题目**：#33 搜索旋转排序数组（无重复）、#154 寻找旋转排序数组中的最小值 II。
`
  },
  // =========================================================
  // #153 寻找旋转排序数组中的最小值（中等）
  // =========================================================
  {
    id: "lc-59",
    group: "二分查找",
    icon: "🔍",
    title: "#153 寻找旋转排序数组中的最小值（中等）",
    content: `
## 题目

**LeetCode #153 寻找旋转排序数组中的最小值** | 难度：中等

已知一个长度为 \`n\` 的升序数组在未知下标处被旋转（**元素互不相同**）。请找出数组中的**最小元素**。要求 O(log n) 时间。

**示例：**
输入：nums = [3,4,5,1,2]
输出：1

输入：nums = [4,5,6,7,0,1,2]
输出：0

## 思路

旋转后的数组可看作两段升序子数组拼接：\`[大段..., 小段...]\`，最小值是“小段”的起点。利用二分比较 \`nums[mid]\` 与 \`nums[right]\` 即可判定 \`mid\` 落在“大段”还是“小段”。

采用 **“左闭右开” \`[left, right)\`**，让 \`right\` 始终是候选最小值的位置：
1. \`left = 0\`、\`right = n - 1\`（这里用左闭右闭也行，关键是收缩逻辑）。
2. 循环 \`left < right\`，\`mid = left + (right - left) // 2\`（注意 \`mid\` 偏左，避免 \`mid == right\` 死循环）。
3. 比较 \`nums[mid]\` 与 \`nums[right]\`：
   - 若 \`nums[mid] < nums[right]\`：\`mid\` 在“小段”中（或本身即最小），\`right = mid\`。
   - 若 \`nums[mid] > nums[right]\`：\`mid\` 在“大段”中，最小值必在 \`mid\` 右侧，\`left = mid + 1\`。
4. \`left == right\` 时即为最小值下标。

关键点：与 \`nums[right]\` 比较而非 \`nums[left]\`，因为后者无法区分“未旋转”和“最小在右”两种情况。题目保证无重复，所以 \`nums[mid] != nums[right]\`。

## Python 实现

\`\`\`python
class Solution:
    def findMin(self, nums):
        # 左闭右闭，但循环用 left < right，right 收缩到 mid
        left, right = 0, len(nums) - 1
        while left < right:
            mid = left + (right - left) // 2
            if nums[mid] < nums[right]:
                # mid 在小段，最小可能是 mid
                right = mid
            else:
                # mid 在大段，最小在右侧
                left = mid + 1
        return nums[left]
\`\`\`

## JavaScript 实现

\`\`\`javascript
var findMin = function(nums) {
    var left = 0, right = nums.length - 1;
    while (left < right) {
        var mid = left + ((right - left) >> 1);
        if (nums[mid] < nums[right]) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    return nums[left];
};
\`\`\`

## 复杂度

- 时间复杂度：O(log n)。
- 空间复杂度：O(1)。

## 拓展

- **为何不用 \`nums[left]\` 比较**：当数组未旋转（\`nums[left] < nums[right]\`）时，无法知道最小是否在左侧；而 \`nums[right]\` 是当前候选区间的最大，\`nums[mid]\` 与它比较能稳定区分两段。
- **含重复版本**：#154 中 \`nums[mid] == nums[right]\` 时无法判定，需 \`right--\` 跳过，最坏 O(n)。
- **找最大值**：比较 \`nums[mid]\` 与 \`nums[left]\`，思路对称。
- **相关题目**：#154 寻找旋转排序数组中的最小值 II、#33 搜索旋转排序数组。
`
  },
  // =========================================================
  // #162 寻找峰值（中等）
  // =========================================================
  {
    id: "lc-60",
    group: "二分查找",
    icon: "🔍",
    title: "#162 寻找峰值（中等）",
    content: `
## 题目

**LeetCode #162 寻找峰值** | 难度：中等

峰值是指其值**严格大于左右相邻元素**的元素。给定一个整数数组 \`nums\`，满足 \`nums[i] != nums[i+1]\`，且约定 \`nums[-1] = nums[n] = -∞\`。请返回数组中**任意一个**峰值的下标。要求 O(log n) 时间。

**示例：**
输入：nums = [1,2,3,1]
输出：2
解释：3 是峰值，下标 2

输入：nums = [1,2,1,3,5,6,4]
输出：5
解释：6 是峰值；也可返回下标 1（值为 2）也算正确

## 思路

虽然数组无序，但相邻元素不等这一约束保证了**沿“上坡”方向走一定能遇到峰值**。基于此做二分：

采用 **“左闭右闭” \`[left, right]\`**：
1. \`left = 0\`、\`right = n - 1\`，循环 \`left < right\`（注意是 \`<\` 不是 \`<=\`，因为剩一个元素时它就是峰值）。
2. \`mid = left + (right - left) // 2\`（偏左，避免 \`mid + 1\` 越界）。
3. 比较 \`nums[mid]\` 与 \`nums[mid + 1]\`：
   - 若 \`nums[mid] < nums[mid + 1]\`：右侧是“上坡”，峰值必在 \`mid + 1\` 及右侧，\`left = mid + 1\`。
   - 若 \`nums[mid] > nums[mid + 1]\`：右侧是“下坡”，\`mid\` 本身可能是峰值，\`right = mid\`。
4. \`left == right\` 时即为一个峰值下标。

正确性：每次收缩都保留了“区间内存在峰值”的不变量，故最终落在峰值上。题目允许多个峰值，返回任意一个即可。

## Python 实现

\`\`\`python
class Solution:
    def findPeakElement(self, nums):
        # 左闭右闭 [left, right]
        left, right = 0, len(nums) - 1
        while left < right:
            mid = left + (right - left) // 2
            # 与右侧邻居比较
            if nums[mid] < nums[mid + 1]:
                # 上坡，峰值在右
                left = mid + 1
            else:
                # 下坡，mid 可能是峰值
                right = mid
        return left
\`\`\`

## JavaScript 实现

\`\`\`javascript
var findPeakElement = function(nums) {
    var left = 0, right = nums.length - 1;
    while (left < right) {
        var mid = left + ((right - left) >> 1);
        if (nums[mid] < nums[mid + 1]) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
};
\`\`\`

## 复杂度

- 时间复杂度：O(log n)。
- 空间复杂度：O(1)。

## 拓展

- **为何比较 \`nums[mid + 1]\` 而非 \`nums[mid - 1]\`**：\`mid\` 取偏左（\`left + (right-left)//2\`），\`mid + 1\` 一定在区间内不会越界；若比较 \`mid - 1\` 需额外处理 \`mid == 0\` 的边界。
- **线性解法**：扫描找 \`nums[i] > nums[i+1]\` 的第一个 \`i\` 即可，O(n)；二分是优化版。
- **边界虚拟值 \`-∞\`**：意味着长度为 1 的数组唯一元素必为峰值；首元素大于次元素时首元素是峰值；末元素同理。
- **相关题目**：#852 山脉数组的峰顶索引（峰值必唯一且数组先增后减）、#1095 山脉数组中查找目标值。
`
  },
];
