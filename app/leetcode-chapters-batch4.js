// =============================================================
// LeetCode 面试算法 200 题 —— 第四批章节（双指针技巧组，共 10 题）
// -------------------------------------------------------------
// 题号 lc-31 ~ lc-40，覆盖双指针经典面试题。
// 每题包含：题目 / 思路 / Python 实现 / JavaScript 实现 / 复杂度 / 拓展。
// =============================================================

export const chapters = [
  {
    id: "lc-31",
    group: "双指针技巧",
    icon: "👉",
    title: "#167 两数之和 II - 输入有序数组（中等）",
    content: `
## 题目

**LeetCode #167 两数之和 II - 输入有序数组** | 难度：中等

给定一个 **已按非递减顺序排列** 的整数数组 \`numbers\` 和一个目标值 \`target\`，找出和等于 \`target\` 的两个数，返回它们的下标（下标从 1 开始）。题目保证恰好有一个解，且同一元素不能使用两次。

**示例：**
输入：numbers = [2,7,11,15], target = 9
输出：[1,2]
解释：2 + 7 = 9，因此下标为 1 和 2。

## 思路

数组有序是“对撞双指针”的典型信号：

1. 左指针 \`left = 0\`，右指针 \`right = n - 1\`；
2. 计算 \`sum = numbers[left] + numbers[right]\`：
   - 若 \`sum == target\`，返回 \`(left+1, right+1)\`；
   - 若 \`sum < target\`，说明左端太小，\`left++\`；
   - 若 \`sum > target\`，说明右端太大，\`right--\`。

每次移动都能排除一个不可能的元素，由于解唯一，循环一定会停在与答案相遇时。相比哈希表法，本方法把空间从 O(n) 降到 O(1)。

## Python 实现

\`\`\`python
class Solution:
    def twoSum(self, numbers, target):
        left, right = 0, len(numbers) - 1
        while left < right:
            s = numbers[left] + numbers[right]
            if s == target:
                # 题目要求下标从 1 开始
                return [left + 1, right + 1]
            elif s < target:
                left += 1
            else:
                right -= 1
        return []
\`\`\`

## JavaScript 实现

\`\`\`javascript
var twoSum = function(numbers, target) {
    var left = 0, right = numbers.length - 1;
    while (left < right) {
        var s = numbers[left] + numbers[right];
        if (s === target) {
            // 下标从 1 开始
            return [left + 1, right + 1];
        } else if (s < target) {
            left++;
        } else {
            right--;
        }
    }
    return [];
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，两指针一共最多移动 n 次。
- 空间复杂度：O(1)，只用常数空间。

## 拓展

- 若数组无序，参见 #1 两数之和（用哈希表）；
- 相关题目：#15 三数之和、#16 最接近的三数之和、#653 两数之和 IV - BST。
`
  },
  {
    id: "lc-32",
    group: "双指针技巧",
    icon: "👉",
    title: "#15 三数之和（中等）",
    content: `
## 题目

**LeetCode #15 三数之和** | 难度：中等

给定一个整数数组 \`nums\`，判断是否存在三元组 \`[nums[i], nums[j], nums[k]]\` 满足 \`i != j != k\` 且三数之和为 0。返回所有不重复的三元组。

**示例：**
输入：nums = [-1,0,1,2,-1,-4]
输出：[[-1,-1,2],[-1,0,1]]
解释：注意不包含重复三元组。

## 思路

“三数之和为 0”即找 \`a + b + c = 0\`。固定一个数后，剩下两数之和为 \`-a\`，就转化成“两数之和 II”（有序数组 + 双指针）。

1. **排序** 数组（解决去重和双指针前提）；
2. 遍历 \`i\`，跳过重复的 \`nums[i]\`；
3. 对每个 \`i\`，用双指针 \`left = i+1\`、\`right = n-1\` 在剩余区间找两数之和等于 \`-nums[i]\`；
4. 找到一组解后，\`left\` 和 \`right\` 都要继续跳过重复元素，避免重复三元组。

去重是本题的核心难点：\`nums[i]\` 与前一个相等则跳过；命中后双指针要跳过相同值。

## Python 实现

\`\`\`python
class Solution:
    def threeSum(self, nums):
        nums.sort()
        res = []
        n = len(nums)
        for i in range(n - 2):
            # 跳过重复的 i
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            left, right = i + 1, n - 1
            while left < right:
                s = nums[i] + nums[left] + nums[right]
                if s == 0:
                    res.append([nums[i], nums[left], nums[right]])
                    # 跳过 left 重复
                    while left < right and nums[left] == nums[left + 1]:
                        left += 1
                    # 跳过 right 重复
                    while left < right and nums[right] == nums[right - 1]:
                        right -= 1
                    left += 1
                    right -= 1
                elif s < 0:
                    left += 1
                else:
                    right -= 1
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var threeSum = function(nums) {
    nums.sort(function(a, b) { return a - b; });
    var res = [];
    var n = nums.length;
    for (var i = 0; i < n - 2; i++) {
        // 跳过重复 i
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        var left = i + 1, right = n - 1;
        while (left < right) {
            var s = nums[i] + nums[left] + nums[right];
            if (s === 0) {
                res.push([nums[i], nums[left], nums[right]]);
                while (left < right && nums[left] === nums[left + 1]) left++;
                while (left < right && nums[right] === nums[right - 1]) right--;
                left++;
                right--;
            } else if (s < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n²)，外层 O(n) × 内层双指针 O(n)，排序 O(n log n) 不是瓶颈。
- 空间复杂度：O(log n)，排序所需栈空间（不计结果数组）。

## 拓展

- #16 最接近的三数之和：双指针找最接近 target 的三元组；
- #18 四数之和：再加一层循环，外层去重思路相同；
- 哈希表法也可解，但去重更繁琐，双指针更推荐。
`
  },
  {
    id: "lc-33",
    group: "双指针技巧",
    icon: "👉",
    title: "#11 盛最多水的容器（中等）",
    content: `
## 题目

**LeetCode #11 盛最多水的容器** | 难度：中等

给定一个长度为 \`n\` 的整数数组 \`height\`，其中 \`height[i]\` 表示第 \`i\` 条垂线的高度。两条垂线与 x 轴构成的容器能容纳的水量，由“较短的那条”和“两线距离”共同决定：\`面积 = min(height[i], height[j]) * (j - i)\`。求能容纳的最大水量。

**示例：**
输入：height = [1,8,6,2,5,4,8,3,7]
输出：49

## 思路

若枚举所有对，复杂度 O(n²)。利用对撞双指针可降到 O(n)：

1. \`left = 0\`，\`right = n - 1\`，初始宽度最大；
2. 计算当前面积并更新答案；
3. 移动较矮的那一侧指针：因为面积受短板限制，宽度在缩小，只有让短板变高才可能获得更大面积。把高的一侧留着不动；
4. 直到两指针相遇。

直觉证明：当 \`left\` 较矮时，\`left\` 与任何中间位置的宽度都更小、高度上限还是 \`height[left]\`，所以这些组合一定不会更优，可以全部排除。

## Python 实现

\`\`\`python
class Solution:
    def maxArea(self, height):
        left, right = 0, len(height) - 1
        best = 0
        while left < right:
            # 面积由短板决定
            h = min(height[left], height[right])
            w = right - left
            best = max(best, h * w)
            # 移动较矮的一侧
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
        return best
\`\`\`

## JavaScript 实现

\`\`\`javascript
var maxArea = function(height) {
    var left = 0, right = height.length - 1;
    var best = 0;
    while (left < right) {
        // 面积由短板决定
        var h = Math.min(height[left], height[right]);
        var w = right - left;
        if (h * w > best) best = h * w;
        // 移动较矮的一侧
        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }
    return best;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，两指针一共最多移动 n 次。
- 空间复杂度：O(1)。

## 拓展

- 本题是“对撞双指针 + 贪心”的经典模板，可推广到“双指针保留较优解”类问题；
- 相关题目：#42 接雨水（同向/对撞指针更复杂的应用）。
`
  },
  {
    id: "lc-34",
    group: "双指针技巧",
    icon: "👉",
    title: "#42 接雨水（困难）",
    content: `
## 题目

**LeetCode #42 接雨水** | 难度：困难

给定 \`n\` 个非负整数表示每个柱子的高度，计算按此排列的柱子，下雨后能接多少雨水。

**示例：**
输入：height = [0,1,0,2,1,0,1,3,2,1,2,1]
输出：6

## 思路

每根柱子上方能接的水量，取决于它“左右两侧最高柱子的较小值”减去“自身高度”。有三种主流解法：

1. **动态规划**：预处理 \`leftMax\` 和 \`rightMax\` 数组，再逐个求和。时间 O(n)、空间 O(n)。
2. **单调栈**：维护递减栈，遇到更高柱子时弹出并计算。时间 O(n)、空间 O(n)。
3. **双指针**：用两个变量记录左右最大值，对撞指针移动较矮的一侧。时间 O(n)、空间 O(1)，最优。

双指针思路：设 \`leftMax\`、\`rightMax\` 分别为左侧、右侧已扫到的最大值。哪边的最大值更小，哪边的指针位置就是“瓶颈”，可以确定该位置的水量（由该侧最大值决定，因为另一侧一定有更高或相等的柱子挡着）。

## Python 实现

\`\`\`python
class Solution:
    def trap(self, height):
        if not height:
            return 0
        left, right = 0, len(height) - 1
        leftMax = rightMax = 0
        water = 0
        while left < right:
            # 较矮的一侧先行计算
            if height[left] < height[right]:
                if height[left] >= leftMax:
                    leftMax = height[left]
                else:
                    water += leftMax - height[left]
                left += 1
            else:
                if height[right] >= rightMax:
                    rightMax = height[right]
                else:
                    water += rightMax - height[right]
                right -= 1
        return water
\`\`\`

## JavaScript 实现

\`\`\`javascript
var trap = function(height) {
    if (height.length === 0) return 0;
    var left = 0, right = height.length - 1;
    var leftMax = 0, rightMax = 0;
    var water = 0;
    while (left < right) {
        // 较矮的一侧先计算
        if (height[left] < height[right]) {
            if (height[left] >= leftMax) {
                leftMax = height[left];
            } else {
                water += leftMax - height[left];
            }
            left++;
        } else {
            if (height[right] >= rightMax) {
                rightMax = height[right];
            } else {
                water += rightMax - height[right];
            }
            right--;
        }
    }
    return water;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，一次遍历。
- 空间复杂度：O(1)，只使用常数变量（双指针解法）。

## 拓展

- 动态规划法更易理解，建议先掌握再优化到双指针；
- 相关题目：#84 柱状图中最大的矩形（单调栈）、#407 接雨水 II（3D 版本，用优先队列）。
`
  },
  {
    id: "lc-35",
    group: "双指针技巧",
    icon: "👉",
    title: "#75 颜色分类（中等）",
    content: `
## 题目

**LeetCode #75 颜色分类** | 难度：中等

给定一个包含红、白、蓝三种颜色（分别用 0、1、2 表示）的数组 \`nums\`，**原地** 对它们排序，使得相同颜色相邻，按 0、1、2 顺序排列。要求不使用库函数，并尽量一趟扫描完成。

**示例：**
输入：nums = [2,0,2,1,1,0]
输出：[0,0,1,1,2,2]

## 思路

这是经典的 **荷兰国旗问题**，用三指针一趟扫描：

- \`p0\`：下一个应放 0 的位置（左边界）；
- \`p2\`：下一个应放 2 的位置（右边界）；
- \`cur\`：当前扫描指针。

扫描规则：
1. \`nums[cur] == 0\`：与 \`nums[p0]\` 交换，\`p0++\`、\`cur++\`；
2. \`nums[cur] == 1\`：已经就位，\`cur++\`；
3. \`nums[cur] == 2\`：与 \`nums[p2]\` 交换，\`p2--\`，但 **\`cur\` 不动**，因为换过来的元素还没被检查。

注意第 3 步不 \`cur++\` 是关键易错点，否则会漏判换来的数。

## Python 实现

\`\`\`python
class Solution:
    def sortColors(self, nums):
        p0, cur, p2 = 0, 0, len(nums) - 1
        while cur <= p2:
            if nums[cur] == 0:
                nums[p0], nums[cur] = nums[cur], nums[p0]
                p0 += 1
                cur += 1
            elif nums[cur] == 1:
                cur += 1
            else:  # nums[cur] == 2
                nums[p2], nums[cur] = nums[cur], nums[p2]
                p2 -= 1
                # cur 不动，需检查换来的元素
\`\`\`

## JavaScript 实现

\`\`\`javascript
var sortColors = function(nums) {
    var p0 = 0, cur = 0, p2 = nums.length - 1;
    while (cur <= p2) {
        if (nums[cur] === 0) {
            var t0 = nums[p0]; nums[p0] = nums[cur]; nums[cur] = t0;
            p0++;
            cur++;
        } else if (nums[cur] === 1) {
            cur++;
        } else {
            var t2 = nums[p2]; nums[p2] = nums[cur]; nums[cur] = t2;
            p2--;
            // cur 不动，需检查换来的元素
        }
    }
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，一次扫描。
- 空间复杂度：O(1)，原地排序。

## 拓展

- 计数排序法也可：统计 0/1/2 个数后重写数组，两趟扫描，思路更简单；
- 本题是“三路划分”的模板，可用于快速排序优化（针对大量重复元素），参见 #215、#75 的进阶变体。
`
  },
  {
    id: "lc-36",
    group: "双指针技巧",
    icon: "👉",
    title: "#977 有序数组的平方（简单）",
    content: `
## 题目

**LeetCode #977 有序数组的平方** | 难度：简单

给定一个 **按非递减顺序排序** 的整数数组 \`nums\`（可能含负数），返回每个元素的平方组成的新数组，要求也按非递减顺序排序。

**示例：**
输入：nums = [-4,-1,0,3,10]
输出：[0,1,9,16,100]
解释：平方后为 [16,1,0,9,100]，排序后为 [0,1,9,16,100]。

## 思路

数组本身有序，但平方后负数部分会变成正数，所以“最大平方值”一定出现在数组两端。利用 **对撞双指针从两端向中间** 收集，**从后往前** 填充结果数组：

1. \`left = 0\`，\`right = n - 1\`；
2. 比较两端平方，较大者放入结果数组末尾位置 \`pos\`；
3. 对应指针内移，\`pos--\`；
4. 直到 \`pos < 0\`。

这样一趟扫描即可完成，避免了显式排序。

## Python 实现

\`\`\`python
class Solution:
    def sortedSquares(self, nums):
        n = len(nums)
        res = [0] * n
        left, right = 0, n - 1
        pos = n - 1  # 从后往前填
        while left <= right:
            ls = nums[left] ** 2
            rs = nums[right] ** 2
            if ls > rs:
                res[pos] = ls
                left += 1
            else:
                res[pos] = rs
                right -= 1
            pos -= 1
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var sortedSquares = function(nums) {
    var n = nums.length;
    var res = new Array(n);
    var left = 0, right = n - 1;
    var pos = n - 1; // 从后往前填
    while (left <= right) {
        var ls = nums[left] * nums[left];
        var rs = nums[right] * nums[right];
        if (ls > rs) {
            res[pos] = ls;
            left++;
        } else {
            res[pos] = rs;
            right--;
        }
        pos--;
    }
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，一趟扫描。
- 空间复杂度：O(n)，结果数组（不计输出则 O(1)）。

## 拓展

- 若数组全为非负数，直接平方即有序，可省去双指针；
- 思想类似“合并两个有序数组”，可类比 #88 合并两个有序数组。
`
  },
  {
    id: "lc-37",
    group: "双指针技巧",
    icon: "👉",
    title: "#349 两个数组的交集（简单）",
    content: `
## 题目

**LeetCode #349 两个数组的交集** | 难度：简单

给定两个数组 \`nums1\` 和 \`nums2\`，返回它们的交集。结果中的每个元素必须 **唯一**，且顺序不限。

**示例：**
输入：nums1 = [1,2,2,1], nums2 = [2,2]
输出：[2]

输入：nums1 = [4,9,5], nums2 = [9,4,9,8,4]
输出：[9,4]（或 [4,9]）

## 思路

这道题与 #350 的区别在于结果去重。两种主流解法：

1. **哈希集合**：把一个数组放入集合，遍历另一个数组，存在于集合中的元素加入结果集合。最直观。
2. **排序 + 双指针**：两个数组排序后，用双指针同步前进，遇到相等且未重复的元素就加入结果。可做到 O(1) 额外空间（不计排序栈）。

下面给出双指针实现，体现双指针主题；哈希集合法在拓展中说明。

## Python 实现

\`\`\`python
class Solution:
    def intersection(self, nums1, nums2):
        nums1.sort()
        nums2.sort()
        res = []
        i = j = 0
        while i < len(nums1) and j < len(nums2):
            if nums1[i] == nums2[j]:
                # 去重：仅当与上一个结果不同时加入
                if not res or res[-1] != nums1[i]:
                    res.append(nums1[i])
                i += 1
                j += 1
            elif nums1[i] < nums2[j]:
                i += 1
            else:
                j += 1
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var intersection = function(nums1, nums2) {
    nums1.sort(function(a, b) { return a - b; });
    nums2.sort(function(a, b) { return a - b; });
    var res = [];
    var i = 0, j = 0;
    while (i < nums1.length && j < nums2.length) {
        if (nums1[i] === nums2[j]) {
            // 去重：仅当与上一个结果不同时加入
            if (res.length === 0 || res[res.length - 1] !== nums1[i]) {
                res.push(nums1[i]);
            }
            i++;
            j++;
        } else if (nums1[i] < nums2[j]) {
            i++;
        } else {
            j++;
        }
    }
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(m log m + n log n)，排序主导；双指针部分 O(m + n)。
- 空间复杂度：O(log m + log n)，排序栈空间（不计结果数组）。

## 拓展

- 哈希集合法：时间 O(m + n)、空间 O(m + n)，实现更简单：
  \`set1 = set(nums1); return list(set(x for x in nums2 if x in set1))\`；
- 相关题目：#350 两个数组的交集 II（保留重复）、#1213 三个有序数组的交集。
`
  },
  {
    id: "lc-38",
    group: "双指针技巧",
    icon: "👉",
    title: "#844 比较含退格的字符串（简单）",
    content: `
## 题目

**LeetCode #844 比较含退格的字符串** | 难度：简单

给定两个字符串 \`s\` 和 \`t\`，其中的 \`#\` 表示退格符。对两个字符串应用所有退格操作后，判断它们最终是否相等。

**示例：**
输入：s = "ab#c", t = "ad#c"
输出：true
解释：s 处理后为 "ac"，t 处理后也为 "ac"。

输入：s = "ab##", t = "c#d#"
输出：true
解释：两者处理后都为空字符串。

## 思路

最直观的做法是用栈模拟：遇到非 \`#\` 入栈，遇到 \`#\` 弹出栈顶。时间 O(n)、空间 O(n)。但本题可以用 **逆向双指针** 做到 O(1) 空间：

1. 从两个字符串末尾开始向前扫描；
2. 维护各自的“待退格数” \`skip\`：遇到 \`#\` 则 \`skip++\` 并继续前移；遇到普通字符时若 \`skip > 0\` 则跳过该字符、\`skip--\`，否则停下来比较；
3. 分别找到两个字符串当前有效字符，比较是否相等；不等则返回 \`false\`；
4. 任何一串先扫完时，另一串必须也扫完才相等。

核心是“退格只影响前面的字符”，所以从后往前处理最自然。

## Python 实现

\`\`\`python
class Solution:
    def backspaceCompare(self, s, t):
        i, j = len(s) - 1, len(t) - 1
        skip_s = skip_t = 0
        while i >= 0 or j >= 0:
            # 找到 s 的下一个有效字符
            while i >= 0:
                if s[i] == '#':
                    skip_s += 1
                    i -= 1
                elif skip_s > 0:
                    skip_s -= 1
                    i -= 1
                else:
                    break
            # 找到 t 的下一个有效字符
            while j >= 0:
                if t[j] == '#':
                    skip_t += 1
                    j -= 1
                elif skip_t > 0:
                    skip_t -= 1
                    j -= 1
                else:
                    break
            # 比较当前有效字符
            if i >= 0 and j >= 0:
                if s[i] != t[j]:
                    return False
            elif i >= 0 or j >= 0:
                # 一方还有字符，另一方已空
                return False
            i -= 1
            j -= 1
        return True
\`\`\`

## JavaScript 实现

\`\`\`javascript
var backspaceCompare = function(s, t) {
    var i = s.length - 1, j = t.length - 1;
    var skipS = 0, skipT = 0;
    while (i >= 0 || j >= 0) {
        // 找到 s 的下一个有效字符
        while (i >= 0) {
            if (s[i] === '#') { skipS++; i--; }
            else if (skipS > 0) { skipS--; i--; }
            else break;
        }
        // 找到 t 的下一个有效字符
        while (j >= 0) {
            if (t[j] === '#') { skipT++; j--; }
            else if (skipT > 0) { skipT--; j--; }
            else break;
        }
        // 比较当前有效字符
        if (i >= 0 && j >= 0) {
            if (s[i] !== t[j]) return false;
        } else if (i >= 0 || j >= 0) {
            return false;
        }
        i--;
        j--;
    }
    return true;
};
\`\`\`

## 复杂度

- 时间复杂度：O(m + n)，两指针各最多遍历一次。
- 空间复杂度：O(1)，只用常数变量。

## 拓展

- 栈模拟法更易写，适合先理解题意再用双指针优化；
- 相关思想：从后向前扫描处理“撤销”类操作，在文本编辑器实现中常见。
`
  },
  {
    id: "lc-39",
    group: "双指针技巧",
    icon: "👉",
    title: "#345 反转字符串中的元音字母（简单）",
    content: `
## 题目

**LeetCode #345 反转字符串中的元音字母** | 难度：简单

给定一个字符串 \`s\`，仅反转字符串中的所有元音字母，并返回结果字符串。元音字母包括 \`a/e/i/o/u\`（大小写都算）。

**示例：**
输入：s = "hello"
输出："holle"

输入：s = "leetcode"
输出："leotcede"

## 思路

这是“对撞双指针 + 条件交换”的模板：

1. \`left = 0\`，\`right = n - 1\`；
2. 让 \`left\` 跳到下一个元音，\`right\` 也跳到下一个元音；
3. 交换两者，然后 \`left++\`、\`right--\`；
4. 直到 \`left >= right\`。

由于字符串在 Python 中不可变，需先转成列表再操作；JS 中字符串同样不可变，也转为数组处理。判断元音用一个小集合即可。

## Python 实现

\`\`\`python
class Solution:
    def reverseVowels(self, s):
        vowels = set('aeiouAEIOU')
        chars = list(s)
        left, right = 0, len(chars) - 1
        while left < right:
            while left < right and chars[left] not in vowels:
                left += 1
            while left < right and chars[right] not in vowels:
                right -= 1
            # 交换两个元音
            chars[left], chars[right] = chars[right], chars[left]
            left += 1
            right -= 1
        return ''.join(chars)
\`\`\`

## JavaScript 实现

\`\`\`javascript
var reverseVowels = function(s) {
    var vowels = new Set(['a','e','i','o','u','A','E','I','O','U']);
    var chars = s.split('');
    var left = 0, right = chars.length - 1;
    while (left < right) {
        while (left < right && !vowels.has(chars[left])) left++;
        while (left < right && !vowels.has(chars[right])) right--;
        // 交换两个元音
        var tmp = chars[left];
        chars[left] = chars[right];
        chars[right] = tmp;
        left++;
        right--;
    }
    return chars.join('');
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，两指针一共最多移动 n 次。
- 空间复杂度：O(n)，字符数组（字符串不可变，必须转成数组）。

## 拓展

- 若允许原地修改（如 C++ 的 \`std::string\`），空间可降到 O(1)；
- 相关题目：#344 反转字符串、#541 反转字符串 II、#917 仅仅反转字母。
`
  },
  {
    id: "lc-40",
    group: "双指针技巧",
    icon: "👉",
    title: "#922 按奇偶排序数组 II（中等）",
    content: `
## 题目

**LeetCode #922 按奇偶排序数组 II** | 难度：中等

给定一个非负整数数组 \`nums\`，其中恰好一半是奇数、一半是偶数。要求重新排列数组，使得下标为偶数的位置放偶数、下标为奇数的位置放奇数。可返回任一满足条件的排列。

**示例：**
输入：nums = [4,2,5,7]
输出：[4,5,2,7]（或 [2,5,4,7] 等任一合法解）

## 思路

题目保证奇偶各半，所以解一定存在。用 **双指针** 原地调整：

- \`i\` 指向偶数下标（0、2、4…），\`j\` 指向奇数下标（1、3、5…）；
- 当 \`nums[i]\` 已经是偶数，\`i += 2\` 跳过；
- 当 \`nums[j]\` 已经是奇数，\`j += 2\` 跳过；
- 否则说明 \`nums[i]\` 是奇数、\`nums[j]\` 是偶数，**两者刚好错位，直接交换**，交换后两边都恢复正确，再各自 += 2。

由于奇偶各半，错位的奇数和偶数一定成对出现，交换能让双方同时就位，最终所有位置正确。

## Python 实现

\`\`\`python
class Solution:
    def sortArrayByParityII(self, nums):
        i, j = 0, 1  # i 找偶数位上的奇数，j 找奇数位上的偶数
        n = len(nums)
        while i < n and j < n:
            if nums[i] % 2 == 0:
                i += 2  # 偶数位已正确
            elif nums[j] % 2 == 1:
                j += 2  # 奇数位已正确
            else:
                # 双方错位，交换后都正确
                nums[i], nums[j] = nums[j], nums[i]
                i += 2
                j += 2
        return nums
\`\`\`

## JavaScript 实现

\`\`\`javascript
var sortArrayByParityII = function(nums) {
    var i = 0, j = 1; // i 找偶数位上的奇数，j 找奇数位上的偶数
    var n = nums.length;
    while (i < n && j < n) {
        if (nums[i] % 2 === 0) {
            i += 2; // 偶数位已正确
        } else if (nums[j] % 2 === 1) {
            j += 2; // 奇数位已正确
        } else {
            // 双方错位，交换后都正确
            var tmp = nums[i];
            nums[i] = nums[j];
            nums[j] = tmp;
            i += 2;
            j += 2;
        }
    }
    return nums;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，每个元素最多被访问一次。
- 空间复杂度：O(1)，原地交换。

## 拓展

- 也可用两遍扫描：分别收集奇偶数，再按位置填入，空间 O(n)；
- 相关题目：#905 按奇偶排序数组（仅分奇偶，无下标约束）、#922 是其进阶版。
`
  }
];
