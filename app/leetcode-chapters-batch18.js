// =============================================================
// LeetCode 面试算法 200 题 - 第十八批章节（排序与区间，共 10 题）
// 章节 lc-171 ~ lc-180：合并/插入/重叠/划分/气球/重建队列/排序/前 K/会议室等
// =============================================================

export const chapters = [
  // =============================================================
  // lc-171 #56 合并区间
  // =============================================================
  {
    id: "lc-171",
    group: "排序与区间",
    icon: "📊",
    title: "#56 合并区间（中等）",
    content: `## 题目

**LeetCode #56 合并区间** | 难度：中等

给出若干区间的集合 \`intervals\`，其中 \`intervals[i] = [starti, endi]\`。请合并所有重叠的区间，返回不重叠的区间集合。

示例：

\`\`\`
输入：intervals = [[1,3],[2,6],[8,10],[15,18]]
输出：[[1,6],[8,10],[15,18]]
解释：[1,3] 与 [2,6] 重叠合并为 [1,6]
\`\`\`

## 思路

1. **排序规则**：按区间**左端点**升序排序。按左端点排序能保证后开的区间起点不小于前一个，只需关心右端点能否合并。若按右端点排序则会打乱合并的线性顺序，不便于贪心。
2. **合并策略**：维护当前合并区间 \`[curStart, curEnd]\`。遍历排序后的区间：
   - 若 \`next.start <= curEnd\`：重叠，更新 \`curEnd = max(curEnd, next.end)\`。
   - 否则：把当前区间入结果，开启新区间。
3. 最后别忘了把最后一个区间加入结果。

按左端点排序是本题的核心，能让所有可合并的区间在遍历时连续出现。

## Python 实现

\`\`\`python
class Solution:
    def merge(self, intervals):
        # 按左端点排序
        intervals.sort(key=lambda x: x[0])
        merged = []
        for iv in intervals:
            # 与当前区间重叠则合并
            if merged and iv[0] <= merged[-1][1]:
                merged[-1][1] = max(merged[-1][1], iv[1])
            else:
                merged.append(iv[:])
        return merged
\`\`\`

## JavaScript 实现

\`\`\`javascript
var merge = function(intervals) {
    // 按左端点排序
    intervals.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const iv of intervals) {
        // 与当前区间重叠则合并
        if (merged.length && iv[0] <= merged[merged.length - 1][1]) {
            merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], iv[1]);
        } else {
            merged.push([...iv]);
        }
    }
    return merged;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n log n)，排序为主
- 空间复杂度：O(n)，存放结果（部分语言排序需 O(log n) 额外空间）

## 拓展

- #57 插入区间：在已排好序且不重叠的区间中插入一个新区间再合并。
- #986 区间列表交集：双指针取两区间右端点较小者推进。
- 按左端点排序是合并类问题的通用范式。`
  },

  // =============================================================
  // lc-172 #57 插入区间
  // =============================================================
  {
    id: "lc-172",
    group: "排序与区间",
    icon: "📊",
    title: "#57 插入区间（中等）",
    content: `## 题目

**LeetCode #57 插入区间** | 难度：中等

给你一个**无重叠**且按左端点升序排列的区间列表 \`intervals\`，以及一个新区间 \`newInterval\`。请将新区间插入并合并必要的区间，返回最终列表。

示例：

\`\`\`
输入：intervals = [[1,3],[6,9]], newInterval = [2,5]
输出：[[1,5],[6,9]]
\`\`\`

## 思路

由于原列表已排序，只需线性扫描分三段处理：

1. **左侧不重叠部分**：原区间右端点 < \`newInterval.start\`，直接加入结果。
2. **中间重叠部分**：原区间左端点 <= \`newInterval.end\` 且右端点 >= \`newInterval.start\`。合并为 \`[min(start), max(end)]\`。
3. **右侧不重叠部分**：原区间左端点 > \`newInterval.end\`，直接加入结果。

也可先插入新区间再排序后调用 #56 的合并逻辑，但那样是 O(n log n)，而本题利用有序性可 O(n) 完成。

## Python 实现

\`\`\`python
class Solution:
    def insert(self, intervals, newInterval):
        res = []
        i = 0
        n = len(intervals)
        # 1. 左侧不重叠的区间直接加入
        while i < n and intervals[i][1] < newInterval[0]:
            res.append(intervals[i])
            i += 1
        # 2. 合并重叠区间
        while i < n and intervals[i][0] <= newInterval[1]:
            newInterval[0] = min(newInterval[0], intervals[i][0])
            newInterval[1] = max(newInterval[1], intervals[i][1])
            i += 1
        res.append(newInterval)
        # 3. 右侧剩余区间直接加入
        while i < n:
            res.append(intervals[i])
            i += 1
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var insert = function(intervals, newInterval) {
    const res = [];
    let i = 0;
    const n = intervals.length;
    // 1. 左侧不重叠的区间直接加入
    while (i < n && intervals[i][1] < newInterval[0]) {
        res.push(intervals[i]);
        i++;
    }
    // 2. 合并重叠区间
    while (i < n && intervals[i][0] <= newInterval[1]) {
        newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
        newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
        i++;
    }
    res.push(newInterval);
    // 3. 右侧剩余区间直接加入
    while (i < n) {
        res.push(intervals[i]);
        i++;
    }
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，一次遍历
- 空间复杂度：O(n)，存放结果

## 拓展

- 若允许输入未排序，可先排序再插入，时间退化为 O(n log n)。
- #56 合并区间是本题的通用版本，可视为「先插入再合并」。
- 区间题目常用「左/右端点分类讨论」的三段法。`
  },

  // =============================================================
  // lc-173 #435 无重叠区间
  // =============================================================
  {
    id: "lc-173",
    group: "排序与区间",
    icon: "📊",
    title: "#435 无重叠区间（中等）",
    content: `## 题目

**LeetCode #435 无重叠区间** | 难度：中等

给定若干区间 \`intervals\`，找到需要移除的最小区间数，使剩余区间**互不重叠**。

示例：

\`\`\`
输入：intervals = [[1,2],[2,3],[3,4],[1,3]]
输出：1
解释：移除 [1,3] 后剩余区间互不重叠
\`\`\`

## 思路

求最少移除数 ⟺ 求最多保留的不重叠区间数（活动选择问题）。贪心策略：

1. **排序规则**：按**右端点**升序排序。按右端点排序能让「当前活动」尽早结束，给后续留出最大空间，是经典的贪心选择。若按左端点排序则可能因左端点小但右端点极大的区间占用过多空间，得不到最优解。
2. **贪心选择**：维护上一个保留区间的右端点 \`end\`。遍历时若当前区间 \`start >= end\`，则可保留，更新 \`end\`；否则跳过（即移除）。
3. **最终结果**：\`n - 保留数\`。

按右端点排序是本题核心，能保证贪心选择性质成立。

## Python 实现

\`\`\`python
class Solution:
    def eraseOverlapIntervals(self, intervals):
        if not intervals:
            return 0
        # 按右端点升序排序
        intervals.sort(key=lambda x: x[1])
        # end 是上一个保留区间的右端点
        end = intervals[0][1]
        keep = 1
        for i in range(1, len(intervals)):
            if intervals[i][0] >= end:
                # 不重叠，保留
                keep += 1
                end = intervals[i][1]
        return len(intervals) - keep
\`\`\`

## JavaScript 实现

\`\`\`javascript
var eraseOverlapIntervals = function(intervals) {
    if (!intervals.length) return 0;
    // 按右端点升序排序
    intervals.sort((a, b) => a[1] - b[1]);
    // end 是上一个保留区间的右端点
    let end = intervals[0][1];
    let keep = 1;
    for (let i = 1; i < intervals.length; i++) {
        if (intervals[i][0] >= end) {
            // 不重叠，保留
            keep++;
            end = intervals[i][1];
        }
    }
    return intervals.length - keep;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n log n)，排序为主
- 空间复杂度：O(log n)，排序栈空间

## 拓展

- #452 用最少数量的箭引爆气球：思路类似但「恰好相接」不算重叠（边界严格大于）。
- #646 最长数对链：求保留的最长链，按右端点排序后贪心。
- 也可 DP：按左端点排序后 \`dp[i]\` 表示前 i 个区间最多保留数，时间 O(n²)。`
  },

  // =============================================================
  // lc-174 #763 划分字母区间
  // =============================================================
  {
    id: "lc-174",
    group: "排序与区间",
    icon: "📊",
    title: "#763 划分字母区间（中等）",
    content: `## 题目

**LeetCode #763 划分字母区间** | 难度：中等

字符串 \`s\` 由小写字母组成。把它划分成尽可能多的片段，使每个字母只出现在一个片段中，返回每个片段的长度列表。

示例：

\`\`\`
输入：s = "ababcbacadefegdehijhklij"
输出：[9,7,8]
解释：划分结果为 "ababcbaca" / "defegde" / "hijhklij"
\`\`\`

## 思路

1. **预处理**：先记录每个字母最后一次出现的位置 \`last[c]\`。
2. **贪心划分**：从左到右遍历，维护当前片段的结束位置 \`end\`（初始为 0）：
   - 每到一个字符，更新 \`end = max(end, last[s[i]])\`。
   - 当 \`i == end\` 时，说明当前片段所有字母的最后一次出现都已包含，可以切分，记录长度。
3. 切分后下一片段从 \`i+1\` 开始，重置起点。

本质上每个片段是一个区间 \`[首次出现, 末次出现]\` 的合并，可转化为区间合并问题，但预处理 last 后直接贪心更简洁。

## Python 实现

\`\`\`python
class Solution:
    def partitionLabels(self, s):
        # 记录每个字母最后一次出现的位置
        last = {c: i for i, c in enumerate(s)}
        res = []
        start = end = 0
        for i, c in enumerate(s):
            # 当前片段的右边界至少要到所有已出现字母的最后位置
            end = max(end, last[c])
            if i == end:
                # 当前片段可切分
                res.append(end - start + 1)
                start = i + 1
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var partitionLabels = function(s) {
    // 记录每个字母最后一次出现的位置
    const last = {};
    for (let i = 0; i < s.length; i++) last[s[i]] = i;
    const res = [];
    let start = 0, end = 0;
    for (let i = 0; i < s.length; i++) {
        // 当前片段的右边界至少要到所有已出现字母的最后位置
        end = Math.max(end, last[s[i]]);
        if (i === end) {
            // 当前片段可切分
            res.push(end - start + 1);
            start = i + 1;
        }
    }
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，两次遍历
- 空间复杂度：O(1)，字母表大小固定为 26

## 拓展

- 转化为区间合并：每个字母看作区间 \`[first, last]\`，合并后每个区间即一个片段，但贪心更高效。
- #56 合并区间、#435 无重叠区间都是同类区间贪心问题。
- 若要求划分数量固定，则需 DP 切分。`
  },

  // =============================================================
  // lc-175 #452 用最少数量的箭引爆气球
  // =============================================================
  {
    id: "lc-175",
    group: "排序与区间",
    icon: "📊",
    title: "#452 用最少数量的箭引爆气球（中等）",
    content: `## 题目

**LeetCode #452 用最少数量的箭引爆气球** | 难度：中等

气球在一维水平线上用区间 \`points = [xstart, xend]\` 表示，一支弓箭垂直射出能引爆该坐标处所有气球。求引爆所有气球所需的最少弓箭数。

示例：

\`\`\`
输入：points = [[10,16],[2,8],[1,6],[7,12]]
输出：2
解释：x=6 射爆 [2,8]、[1,6]；x=11 射爆 [10,16]、[7,12]
\`\`\`

## 思路

求最少弓箭数 ⟺ 求最多能合并的「重叠组」数。

1. **排序规则**：按**右端点**升序排序。按右端点排序让当前一箭尽量靠右射，能覆盖更多右起的气球。若按左端点排序，需要额外维护一个右边界并取最小值，思路类似但实现稍繁。
2. **贪心选择**：维护当前一箭的位置 \`arrow\`（初始为第一个气球的右端点）。遍历气球：
   - 若 \`start > arrow\`：当前气球的起点在箭右侧，射不到，需要新一箭，更新 \`arrow = end\`，箭数 +1。
   - 否则：当前气球被覆盖，跳过。
3. **边界**：注意本题「恰好相接」算重叠（\`start == arrow\` 仍能射爆），与 #435 不同，故条件是 \`start > arrow\` 而非 \`>=\`。

## Python 实现

\`\`\`python
class Solution:
    def findMinArrowShots(self, points):
        if not points:
            return 0
        # 按右端点升序排序
        points.sort(key=lambda x: x[1])
        # 第一箭射在第一个气球的右端点
        arrow = points[0][1]
        cnt = 1
        for s, e in points:
            # 起点在箭右侧，需要新一箭
            if s > arrow:
                cnt += 1
                arrow = e
        return cnt
\`\`\`

## JavaScript 实现

\`\`\`javascript
var findMinArrowShots = function(points) {
    if (!points.length) return 0;
    // 按右端点升序排序
    points.sort((a, b) => a[1] - b[1]);
    // 第一箭射在第一个气球的右端点
    let arrow = points[0][1];
    let cnt = 1;
    for (const [s, e] of points) {
        // 起点在箭右侧，需要新一箭
        if (s > arrow) {
            cnt++;
            arrow = e;
        }
    }
    return cnt;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n log n)，排序为主
- 空间复杂度：O(log n)，排序栈空间

## 拓展

- 与 #435 对比：#435 边界 \`start >= end\` 算不重叠（要移除），本题 \`start == arrow\` 算重叠（不增箭）。
- 也可按左端点排序，维护当前组的右边界最小值，思路等价。
- #1288 区间覆盖删除：被完全包含的区间要删除，需先排序再过滤。`
  },

  // =============================================================
  // lc-176 #406 根据身高重建队列
  // =============================================================
  {
    id: "lc-176",
    group: "排序与区间",
    icon: "📊",
    title: "#406 根据身高重建队列（中等）",
    content: `## 题目

**LeetCode #406 根据身高重建队列** | 难度：中等

有 \`n\` 个人打乱排列，\`people[i] = [hi, ki]\` 表示第 i 人身高 \`hi\`，前面有 \`ki\` 个身高大于等于他的人。请重建正确队列。

示例：

\`\`\`
输入：people = [[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]
输出：[[5,0],[7,0],[5,2],[6,1],[4,4],[7,1]]
\`\`\`

## 思路

1. **排序规则**：按身高**降序**排序；身高相同则按 \`k\` **升序**。这样先排高的，后排矮的；矮的人插入时不会影响已排好高人的相对计数。
2. **插入策略**：遍历排序后的每个人，按其 \`k\` 值插入结果列表对应位置。由于已插入的人都比当前高（或等高但 k 更小），插到第 \`k\` 位正好满足「前面有 k 个 >= 他的人」。
3. 后插入的矮人不会破坏已存在的高人计数。

关键是「先高后矮」的插入顺序，让每个插入位置准确。

## Python 实现

\`\`\`python
class Solution:
    def reconstructQueue(self, people):
        # 按身高降序、k 升序排序
        people.sort(key=lambda x: (-x[0], x[1]))
        res = []
        # 按下标 k 插入
        for p in people:
            res.insert(p[1], p)
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var reconstructQueue = function(people) {
    // 按身高降序、k 升序排序
    people.sort((a, b) => {
        if (a[0] !== b[0]) return b[0] - a[0];
        return a[1] - b[1];
    });
    const res = [];
    // 按下标 k 插入
    for (const p of people) {
        res.splice(p[1], 0, p);
    }
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n²)，每次插入最坏 O(n)；排序 O(n log n)
- 空间复杂度：O(n)，结果数组

## 拓展

- list.insert / Array.splice 是 O(n)，整体 O(n²)。可用树状数组/线段树优化到 O(n log n)。
- 本题是「自定义排序 + 贪心插入」的经典范式。
- 思考变体：若 k 表示前面**严格大于**他的人数，排序逻辑要相应调整。`
  },

  // =============================================================
  // lc-177 #912 排序数组
  // =============================================================
  {
    id: "lc-177",
    group: "排序与区间",
    icon: "📊",
    title: "#912 排序数组（中等）",
    content: `## 题目

**LeetCode #912 排序数组** | 难度：中等

给定一个整数数组 \`nums\`，将该数组升序排列并返回。要求时间复杂度优于 O(n²)。

示例：

\`\`\`
输入：nums = [5,2,3,1]
输出：[1,2,3,5]
\`\`\`

## 思路

考察经典排序算法的实现。常见选择：快速排序、归并排序、堆排序。

### 解法一：快速排序（分治）
选基准 \`pivot\`，把小于 pivot 的放左、大于放右，再递归排左右两半。为避免最坏 O(n²)，可用随机化或三数取中选基准。

### 解法二：归并排序（分治）
把数组对半分，分别排序后合并。稳定且始终 O(n log n)，但需 O(n) 额外空间。

下面给出快速排序实现（含随机化基准）。

## Python 实现

\`\`\`python
import random

class Solution:
    def sortArray(self, nums):
        def quicksort(l, r):
            if l >= r:
                return
            # 随机选基准，与最右交换
            p = random.randint(l, r)
            nums[p], nums[r] = nums[r], nums[p]
            pivot = nums[r]
            # i 指向小于 pivot 区间的右边界
            i = l
            for j in range(l, r):
                if nums[j] < pivot:
                    nums[i], nums[j] = nums[j], nums[i]
                    i += 1
            nums[i], nums[r] = nums[r], nums[i]
            quicksort(l, i - 1)
            quicksort(i + 1, r)
        quicksort(0, len(nums) - 1)
        return nums
\`\`\`

## JavaScript 实现

\`\`\`javascript
var sortArray = function(nums) {
    const quicksort = (l, r) => {
        if (l >= r) return;
        // 随机选基准，与最右交换
        const p = Math.floor(Math.random() * (r - l + 1)) + l;
        [nums[p], nums[r]] = [nums[r], nums[p]];
        const pivot = nums[r];
        // i 指向小于 pivot 区间的右边界
        let i = l;
        for (let j = l; j < r; j++) {
            if (nums[j] < pivot) {
                [nums[i], nums[j]] = [nums[j], nums[i]];
                i++;
            }
        }
        [nums[i], nums[r]] = [nums[r], nums[i]];
        quicksort(l, i - 1);
        quicksort(i + 1, r);
    };
    quicksort(0, nums.length - 1);
    return nums;
};
\`\`\`

## 复杂度

- 快速排序：平均 O(n log n)，最坏 O(n²)（随机化后概率极低）；空间 O(log n)
- 归并排序：始终 O(n log n)，空间 O(n)
- 堆排序：O(n log n)，原地排序 O(1)

## 拓展

- 三路快排适合大量重复元素：分 <pivot / ==pivot / >pivot 三段。
- 内省排序 introsort：快排递归过深时切到堆排序，C++ STL 即用此策略。
- 计数排序/基数排序适合元素范围有限场景，可达 O(n)。`
  },

  // =============================================================
  // lc-178 #215 数组中的第 K 个最大元素
  // =============================================================
  {
    id: "lc-178",
    group: "排序与区间",
    icon: "📊",
    title: "#215 数组中的第 K 个最大元素（中等）",
    content: `## 题目

**LeetCode #215 数组中的第 K 个最大元素** | 难度：中等

给定整数数组 \`nums\` 和整数 \`k\`，返回数组中第 \`k\` 个最大的元素。注意是**排序后**的第 k 大（不去重）。

示例：

\`\`\`
输入：nums = [3,2,1,5,6,4], k = 2
输出：5
\`\`\`

## 思路

### 解法一：快速选择（平均 O(n)）
基于快排的分区思想。每次选基准分区后，若基准位置正好是排序后第 k 大的位置（即下标 \`n-k\`），就返回；否则只递归一侧。期望 O(n)，最坏 O(n²)，随机化后接近 O(n)。

### 解法二：小顶堆维护前 k 大 O(n log k)
维护大小为 k 的小顶堆，遍历数组；堆顶就是第 k 大。适合数据流或 k 远小于 n 的场景。

下面给出快速选择实现（随机化基准）。

## Python 实现

\`\`\`python
import random

class Solution:
    def findKthLargest(self, nums, k):
        target = len(nums) - k  # 升序后第 k 大的下标
        def quickselect(l, r):
            # 随机选基准
            p = random.randint(l, r)
            nums[p], nums[r] = nums[r], nums[p]
            pivot = nums[r]
            i = l
            for j in range(l, r):
                if nums[j] < pivot:
                    nums[i], nums[j] = nums[j], nums[i]
                    i += 1
            nums[i], nums[r] = nums[r], nums[i]
            if i == target:
                return nums[i]
            elif i < target:
                return quickselect(i + 1, r)
            else:
                return quickselect(l, i - 1)
        return quickselect(0, len(nums) - 1)
\`\`\`

## JavaScript 实现

\`\`\`javascript
var findKthLargest = function(nums, k) {
    const target = nums.length - k; // 升序后第 k 大的下标
    const quickselect = (l, r) => {
        // 随机选基准
        const p = Math.floor(Math.random() * (r - l + 1)) + l;
        [nums[p], nums[r]] = [nums[r], nums[p]];
        const pivot = nums[r];
        let i = l;
        for (let j = l; j < r; j++) {
            if (nums[j] < pivot) {
                [nums[i], nums[j]] = [nums[j], nums[i]];
                i++;
            }
        }
        [nums[i], nums[r]] = [nums[r], nums[i]];
        if (i === target) return nums[i];
        else if (i < target) return quickselect(i + 1, r);
        else return quickselect(l, i - 1);
    };
    return quickselect(0, nums.length - 1);
};
\`\`\`

## 复杂度

- 快速选择：平均 O(n)，最坏 O(n²)，随机化后最坏概率极低
- 堆解法：时间 O(n log k)，空间 O(k)

## 拓展

- #347 前 K 个高频元素：用堆或桶排序，O(n)。
- #703 数据流中第 K 大元素：维护小顶堆，流式插入。
- 若要求第 k 小，把 target 改为 \`k-1\` 即可。
- C++ 可用 \`nth_element\`、Python 可用 \`heapq.nlargest\` 简化。`
  },

  // =============================================================
  // lc-179 #252 会议室
  // =============================================================
  {
    id: "lc-179",
    group: "排序与区间",
    icon: "📊",
    title: "#252 会议室（简单）",
    content: `## 题目

**LeetCode #252 会议室** | 难度：简单

给定一个会议时间区间数组 \`intervals\`，其中 \`intervals[i] = [starti, endi]\`，判断一个人是否能参加**所有**会议（即无重叠）。

示例：

\`\`\`
输入：intervals = [[0,30],[5,10],[15,20]]
输出：false

输入：intervals = [[7,10],[2,4]]
输出：true
\`\`\`

## 思路

1. **排序规则**：按**左端点**升序排序。判断是否重叠只需比较相邻区间：若后一个的 start < 前一个的 end，就重叠。按左端点排序能保证遍历时检查相邻是否冲突即可。若按右端点排序反而不直观，因为判断重叠要看的是相邻区间的衔接。
2. **遍历比较**：从第二个区间开始，每个与前一个比 \`start < prev_end\` 则冲突返回 false。
3. 全部通过返回 true。

边界：会议「恰好相接」（\`start == prev_end\`）不算冲突。

## Python 实现

\`\`\`python
class Solution:
    def canAttendMeetings(self, intervals):
        # 按左端点升序排序
        intervals.sort(key=lambda x: x[0])
        for i in range(1, len(intervals)):
            # 当前会议开始早于上一会议结束，冲突
            if intervals[i][0] < intervals[i - 1][1]:
                return False
        return True
\`\`\`

## JavaScript 实现

\`\`\`javascript
var canAttendMeetings = function(intervals) {
    // 按左端点升序排序
    intervals.sort((a, b) => a[0] - b[0]);
    for (let i = 1; i < intervals.length; i++) {
        // 当前会议开始早于上一会议结束，冲突
        if (intervals[i][0] < intervals[i - 1][1]) {
            return false;
        }
    }
    return true;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n log n)，排序为主
- 空间复杂度：O(log n)，排序栈空间

## 拓展

- #253 会议室 II：求最少需要的会议室数（最大重叠数）。
- #56 合并区间：合并后看区间数是否减少即知是否有重叠。
- 若需返回哪些会议冲突，可记录冲突对。`
  },

  // =============================================================
  // lc-180 #253 会议室 II
  // =============================================================
  {
    id: "lc-180",
    group: "排序与区间",
    icon: "📊",
    title: "#253 会议室 II（中等）",
    content: `## 题目

**LeetCode #253 会议室 II** | 难度：中等

给定会议时间区间数组 \`intervals\`，求需要的**最少会议室数**（同时进行会议的最大数量）。

示例：

\`\`\`
输入：intervals = [[0,30],[5,10],[15,20]]
输出：2
\`\`\`

## 思路

### 解法一：差分 + 排序时间点 O(n log n)
把每个会议拆成两个事件：(start, +1)、(end, -1)。按时间排序：时间相同则 end 优先（-1 在前），这样先释放再占用，避免多算。扫描求前缀和最大值即答案。

### 解法二：最小堆 O(n log n)
1. **排序规则**：会议按**左端点**升序排序。
2. **最小堆维护结束时间**：遍历会议，堆顶是当前最早结束的会议。若 \`堆顶 <= 当前会议 start\`，说明该会议室可复用，弹出；把当前会议结束时间入堆。
3. 堆的大小即当前所需会议室数，遍历中取最大值。

按左端点排序保证按开始时间处理；最小堆则跟踪哪间会议室最早空闲。

## Python 实现

\`\`\`python
import heapq

class Solution:
    def minMeetingRooms(self, intervals):
        if not intervals:
            return 0
        # 按开始时间排序
        intervals.sort(key=lambda x: x[0])
        # 最小堆保存正在进行的会议结束时间
        heap = []
        ans = 0
        for s, e in intervals:
            # 最早结束的会议已结束，可复用会议室
            while heap and heap[0] <= s:
                heapq.heappop(heap)
            heapq.heappush(heap, e)
            ans = max(ans, len(heap))
        return ans
\`\`\`

## JavaScript 实现

\`\`\`javascript
// 简易最小堆实现（基于数组）
var MinHeap = function() {
    this.arr = [];
};
MinHeap.prototype.push = function(v) {
    const a = this.arr;
    a.push(v);
    let i = a.length - 1;
    while (i > 0) {
        const p = (i - 1) >> 1;
        if (a[p] <= a[i]) break;
        [a[p], a[i]] = [a[i], a[p]];
        i = p;
    }
};
MinHeap.prototype.pop = function() {
    const a = this.arr;
    const top = a[0];
    const last = a.pop();
    if (a.length) {
        a[0] = last;
        let i = 0, n = a.length;
        while (true) {
            let l = 2 * i + 1, r = 2 * i + 2, s = i;
            if (l < n && a[l] < a[s]) s = l;
            if (r < n && a[r] < a[s]) s = r;
            if (s === i) break;
            [a[s], a[i]] = [a[i], a[s]];
            i = s;
        }
    }
    return top;
};
MinHeap.prototype.peek = function() { return this.arr[0]; };
MinHeap.prototype.size = function() { return this.arr.length; };

var minMeetingRooms = function(intervals) {
    if (!intervals.length) return 0;
    // 按开始时间排序
    intervals.sort((a, b) => a[0] - b[0]);
    // 最小堆保存正在进行的会议结束时间
    const heap = new MinHeap();
    let ans = 0;
    for (const [s, e] of intervals) {
        // 最早结束的会议已结束，可复用会议室
        while (heap.size() && heap.peek() <= s) heap.pop();
        heap.push(e);
        ans = Math.max(ans, heap.size());
    }
    return ans;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n log n)，排序 + 堆操作
- 空间复杂度：O(n)，堆大小

## 拓展

- 差分解法：拆成事件点排序扫描，时间相同则 end(+0) 优先 start(+1) 以避免多算。
- #452 用最少数量的箭引爆气球：与本题对偶，求最大不重叠组数。
- #1094 拼车：差分思想，记录每段乘客数变化。
- 扫描线是区间类问题的通用技巧，本题也可推广到多资源调度。`
  }
];
