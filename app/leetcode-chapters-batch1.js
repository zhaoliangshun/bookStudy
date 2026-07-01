// =============================================================
// LeetCode 面试算法 200 题 - 第一批章节（数组基础，共 10 题）
// 第 1-10 题：两数之和 / 存在重复元素 / 只出现一次的数字 / 删除有序数组重复项
//          / 合并两个有序数组 / 移动零 / 买卖股票最佳时机 / 轮转数组
//          / 旋转图像 / 螺旋矩阵
// =============================================================

export const chapters = [
  {
    id: 'lc-01',
    group: '数组基础',
    icon: '🔢',
    title: '#1 两数之和（简单）',
    content: `## 题目

**LeetCode #1 两数之和** | 难度：简单

给定一个整数数组 \`nums\` 和一个整数目标值 \`target\`，请在数组中找出和为目标值的两个整数，并返回它们的数组下标。可以假设每种输入只会对应一个答案，且不能使用同一个元素两次。可以按任意顺序返回答案。

**示例：**
输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1]

## 思路

最直观的思路是双重循环枚举所有 (i, j) 组合，判断 \`nums[i] + nums[j] == target\` 是否成立，时间复杂度 O(n²)。这种做法能通过但面试官通常会要求优化。

优化的关键在于：当我们遍历到 \`nums[i]\` 时，需要找的"另一半"是 \`target - nums[i]\`。如果能在 O(1) 时间内判断这个值是否出现过，整体就能降到 O(n)。哈希表正好提供这种能力。

具体步骤：
1. 建立一个哈希表，键是数组中的值，值是对应的下标。
2. 遍历数组，对每个元素 \`num\`，计算 \`complement = target - num\`。
3. 如果 \`complement\` 已经在哈希表中，直接返回它的下标和当前下标。
4. 否则把 \`num -> i\` 存入哈希表，继续遍历。

注意要先判断"补数是否已存在"再插入当前元素，这样可以避免同一元素被使用两次（例如 target = 6, nums = [3,...]）。这种"查后插"的顺序在哈希表类题目里非常常见。

## Python 实现

\`\`\`python
class Solution:
    def twoSum(self, nums, target):
        # 哈希表存储"值 -> 下标"
        hash_map = {}
        for i, num in enumerate(nums):
            complement = target - num
            # 先查补数是否已经出现
            if complement in hash_map:
                return [hash_map[complement], i]
            # 再把当前值插入
            hash_map[num] = i
        return []
\`\`\`

## JavaScript 实现

\`\`\`javascript
var twoSum = function(nums, target) {
    // 使用 Map 保证插入顺序和查找都是 O(1)
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        // 查找补数是否已存在
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        // 不存在则记录当前值与下标
        map.set(nums[i], i);
    }
    return [];
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，只遍历一次数组，哈希表查找/插入平均 O(1)。
- 空间复杂度：O(n)，最坏情况需要把 n-1 个元素存入哈希表。

## 拓展

- **变体**：若数组有序，可用双指针 O(n) + O(1) 空间；若要求返回所有组合，需注意去重。
- **面试追问**：为什么先查后插？哈希表最坏情况会退化到 O(n)（哈希冲突），如何避免？
- **相关题目**：#15 三数之和、#18 四数之和、#454 四数相加 II。
- **工程考虑**：JS 中用 \`Map\` 比普通对象更安全，因为对象键会被转成字符串，且会受原型链污染。`,
  },
  {
    id: 'lc-02',
    group: '数组基础',
    icon: '🔢',
    title: '#217 存在重复元素（简单）',
    content: `## 题目

**LeetCode #217 存在重复元素** | 难度：简单

给定一个整数数组 \`nums\`，如果任一值在数组中出现至少两次，返回 \`true\`；如果数组中每个元素互不相同，返回 \`false\`。

**示例：**
输入：nums = [1,2,3,1]
输出：true

输入：nums = [1,2,3,4]
输出：false

## 思路

判断"是否有重复"是哈希集合的经典应用。有三种主流思路：

1. **暴力双重循环**：对每对 (i, j) 比较，O(n²) 时间，O(1) 空间。数据量稍大就超时。
2. **排序后扫描**：先排序，相同元素必然相邻，只需比较相邻两个是否相等。O(n log n) 时间，O(1) 或 O(n) 空间（取决于排序算法）。
3. **哈希集合**：遍历数组，逐个加入集合，若某次加入失败说明已存在。O(n) 时间，O(n) 空间。

面试中通常推荐哈希集合方案，因为它思路最直接、复杂度最优。排序方案在空间紧张时是备选。这里实现哈希集合版本，并附排序版本作为对比。

## Python 实现

\`\`\`python
class Solution:
    def containsDuplicate(self, nums):
        # 用集合记录已经出现过的元素
        seen = set()
        for num in nums:
            if num in seen:
                return True
            seen.add(num)
        return False

    # 排序版本（空间更省，时间略慢）
    def containsDuplicateSort(self, nums):
        nums.sort()
        for i in range(1, len(nums)):
            if nums[i] == nums[i - 1]:
                return True
        return False
\`\`\`

## JavaScript 实现

\`\`\`javascript
var containsDuplicate = function(nums) {
    // 用 Set 实现 O(n) 查重
    const seen = new Set();
    for (const num of nums) {
        if (seen.has(num)) {
            return true;
        }
        seen.add(num);
    }
    return false;
};

// 一行流式写法（面试谨慎使用，可读性差）
var containsDuplicateOneLine = function(nums) {
    return new Set(nums).size !== nums.length;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，哈希集合方案遍历一次，插入/查找平均 O(1)。
- 空间复杂度：O(n)，最坏情况所有元素都不同，集合大小为 n。

## 拓展

- **变体**：#219 存在重复元素 II（限制下标差不超过 k）、#220 存在重复元素 III（限制值差不超过 t）。
- **面试追问**：数据量极大、内存放不下怎么办？分治 + 外部排序；或用布隆过滤器做初步筛选（有假阳性）。
- **陷阱**：JS 的 \`Set\` 用 SameValueZero 比较，\`NaN\` 也会被正确去重，比手动 \`indexOf\` 更可靠。`,
  },
  {
    id: 'lc-03',
    group: '数组基础',
    icon: '🔢',
    title: '#136 只出现一次的数字（简单）',
    content: `## 题目

**LeetCode #136 只出现一次的数字** | 难度：简单

给定一个非空整数数组，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。要求算法具有线性时间复杂度，且不使用额外空间。

**示例：**
输入：nums = [2,2,1]
输出：1

输入：nums = [4,1,2,1,2]
输出：4

## 思路

题目有两个硬性要求：O(n) 时间、O(1) 额外空间。哈希表计数能满足时间但满足不了空间，排序会破坏 O(n)。这里必须用到位运算——异或（XOR）。

异或有两个关键性质：
1. **自反性**：\`a ^ a = 0\`，任何数和自己异或结果为 0。
2. **恒等性**：\`a ^ 0 = a\`，任何数和 0 异或仍是自身。
3. **交换律与结合律**：异或的顺序不影响结果。

基于这三条，把数组所有元素依次异或起来，出现两次的元素两两抵消成 0，最后只剩下出现一次的那个元素。

举例：\`4 ^ 1 ^ 2 ^ 1 ^ 2 = 4 ^ (1 ^ 1) ^ (2 ^ 2) = 4 ^ 0 ^ 0 = 4\`。

这种方法代码极简，但面试时要主动解释清楚为什么这样做对，否则会被认为"只是背了答案"。

## Python 实现

\`\`\`python
class Solution:
    def singleNumber(self, nums):
        # 初始为 0，依次异或所有元素
        result = 0
        for num in nums:
            result ^= num
        return result
\`\`\`

## JavaScript 实现

\`\`\`javascript
var singleNumber = function(nums) {
    // 异或所有元素，成对的会互相抵消
    let result = 0;
    for (const num of nums) {
        result ^= num;
    }
    return result;
};

// reduce 写法更函数式
var singleNumberReduce = function(nums) {
    return nums.reduce((acc, cur) => acc ^ cur, 0);
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，遍历一次。
- 空间复杂度：O(1)，只用一个变量。

## 拓展

- **变体**：#137 只出现一次的数字 II（其它元素出现 3 次）、#260 只出现一次的数字 III（有两个只出现一次的元素）。
- **延伸**：出现 3 次的题不能直接异或，要用"按位统计每一位 1 的个数模 3"的思路。
- **面试追问**：如果数组为空怎么办？如果不止一个出现一次的元素怎么办？（异或结果会丢失分组信息，需要更复杂方法）
- **工程意义**：异或还常用于无临时变量的两数交换：\`a ^= b; b ^= a; a ^= b;\`（但可读性差，不推荐生产用）。`,
  },
  {
    id: 'lc-04',
    group: '数组基础',
    icon: '🔢',
    title: '#26 删除有序数组中的重复项（简单）',
    content: `## 题目

**LeetCode #26 删除有序数组中的重复项** | 难度：简单

给定一个**升序排列**的数组 \`nums\`，原地删除重复出现的元素，使每个元素只出现一次，返回删除后数组的新长度。要求：原地修改输入数组，并在函数内返回新长度；不需要考虑超出新长度后面的元素。

**示例：**
输入：nums = [0,0,1,1,1,2,2,3,3,4]
输出：5, nums = [0,1,2,3,4,...]

## 思路

数组**有序**是本题的关键前提——相同的元素必然相邻。这让我们可以用"双指针"一次扫描完成。

定义两个指针：
- \`slow\`：指向当前已处理好的"无重复部分"的末尾位置（待写入位置）。
- \`fast\`：扫描指针，遍历整个数组寻找新元素。

算法流程：
1. \`slow\` 从 0 开始，\`fast\` 从 1 开始。
2. 当 \`nums[fast] !== nums[fast - 1]\` 时，说明遇到了一个新元素，把它写到 \`nums[slow]\` 位置，\`slow\` 加 1。
3. \`fast\` 每轮都加 1。
4. 最终 \`slow\` 就是去重后的长度。

这种"读写双指针"模式是数组分发、去重、过滤类题目的通用模板，务必记牢。

## Python 实现

\`\`\`python
class Solution:
    def removeDuplicates(self, nums):
        if not nums:
            return 0
        # slow 指向下一个写入位置
        slow = 1
        for fast in range(1, len(nums)):
            # 当前元素和前一个不同，说明是新值
            if nums[fast] != nums[fast - 1]:
                nums[slow] = nums[fast]
                slow += 1
        return slow
\`\`\`

## JavaScript 实现

\`\`\`javascript
var removeDuplicates = function(nums) {
    if (nums.length === 0) return 0;
    // slow 指向待写入位置
    let slow = 1;
    for (let fast = 1; fast < nums.length; fast++) {
        // 与前一个元素不同即为新值
        if (nums[fast] !== nums[fast - 1]) {
            nums[slow] = nums[fast];
            slow++;
        }
    }
    return slow;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，只遍历一次。
- 空间复杂度：O(1)，原地修改，只用两个指针变量。

## 拓展

- **变体**：#80 删除有序数组中的重复项 II（允许每个元素最多出现两次）。
- **通用模板**：把"允许出现 k 次"参数化，判断条件改为 \`nums[fast] !== nums[slow - k]\`。
- **面试追问**：为什么用 \`nums[fast] !== nums[fast - 1]\` 而不是 \`nums[fast] !== nums[slow - 1]\`？两者等价，前者更直观；后者更通用（适合"最多 k 次"模板）。
- **陷阱**：本题判题时检查前 \`slow\` 个元素是否正确，多余的元素会被忽略，所以不需要真正"删除"它们。`,
  },
  {
    id: 'lc-05',
    group: '数组基础',
    icon: '🔢',
    title: '#88 合并两个有序数组（简单）',
    content: `## 题目

**LeetCode #88 合并两个有序数组** | 难度：简单

给定两个**非递减顺序**排列的整数数组 \`nums1\` 和 \`nums2\`，另有三个整数 \`m\`、\`n\` 分别表示元素数目。请合并 \`nums2\` 到 \`nums1\` 中，使合并后的数组同样按非递减顺序排列。注意：\`nums1\` 的总长度为 \`m + n\`，前 \`m\` 个是有效元素，后 \`n\` 个为占位 0，应被忽略；要求原地修改 \`nums1\`。

**示例：**
输入：nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
输出：[1,2,2,3,5,6]

## 思路

最容易想到的是直接把 \`nums2\` 拼到 \`nums1\` 尾部再 \`sort\`，时间 O((m+n) log(m+n))，能用但没利用"有序"这个关键信息。

更好的方案是**从后往前的三指针合并**。两个数组都从有效部分的末尾开始比较，把较大的写到 \`nums1\` 的最末尾。这样能完美利用 \`nums1\` 后面预留的 n 个空位，不会覆盖 \`nums1\` 还没处理的有效元素。

具体步骤：
1. 三个指针：\`p1 = m - 1\`（nums1 有效末尾）、\`p2 = n - 1\`（nums2 末尾）、\`p = m + n - 1\`（合并写入位置）。
2. 比较 \`nums1[p1]\` 和 \`nums2[p2]\`，较大者写到 \`nums1[p]\`，对应指针左移。
3. 重复直到 \`p1 < 0\` 或 \`p2 < 0\`。
4. 若 \`nums2\` 还有剩余（p1 < 0 但 p2 >= 0），把它们复制到 \`nums1\` 前部。若 \`nums1\` 还有剩余则无需处理（它们已经在正确位置）。

这种"反向合并"是合并类问题的标准技巧，记住它能秒杀所有变体。

## Python 实现

\`\`\`python
class Solution:
    def merge(self, nums1, m, nums2, n):
        # 从后往前三指针合并
        p1 = m - 1          # nums1 有效部分末尾
        p2 = n - 1          # nums2 末尾
        p = m + n - 1       # 合并写入位置
        while p1 >= 0 and p2 >= 0:
            # 把较大的放到末尾
            if nums1[p1] > nums2[p2]:
                nums1[p] = nums1[p1]
                p1 -= 1
            else:
                nums1[p] = nums2[p2]
                p2 -= 1
            p -= 1
        # nums2 可能还有剩余，复制过来
        while p2 >= 0:
            nums1[p] = nums2[p2]
            p2 -= 1
            p -= 1
\`\`\`

## JavaScript 实现

\`\`\`javascript
var merge = function(nums1, m, nums2, n) {
    // 三指针从后往前合并
    let p1 = m - 1;
    let p2 = n - 1;
    let p = m + n - 1;
    while (p1 >= 0 && p2 >= 0) {
        // 较大者写入当前位置
        if (nums1[p1] > nums2[p2]) {
            nums1[p] = nums1[p1];
            p1--;
        } else {
            nums1[p] = nums2[p2];
            p2--;
        }
        p--;
    }
    // nums2 剩余部分直接复制
    while (p2 >= 0) {
        nums1[p] = nums2[p2];
        p2--;
        p--;
    }
};
\`\`\`

## 复杂度

- 时间复杂度：O(m + n)，每个元素最多被比较/写入一次。
- 空间复杂度：O(1)，原地修改。

## 拓展

- **相关题目**：#21 合并两个有序链表（思路类似但正向）、#23 合并 K 个有序链表（堆优化）。
- **面试追问**：为什么从前往后不行？因为会覆盖 \`nums1\` 还没处理的元素；从后往前能利用尾部预留空间，避开覆盖问题。
- **扩展**：如果要合并 k 个有序数组，用最小堆每次取最小元素，O(N log k)。
- **工程应用**：归并排序的合并步骤就是这个思路，是分治算法的基础组件。`,
  },
  {
    id: 'lc-06',
    group: '数组基础',
    icon: '🔢',
    title: '#283 移动零（简单）',
    content: `## 题目

**LeetCode #283 移动零** | 难度：简单

给定一个数组 \`nums\`，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。要求**原地**操作，尽量减少操作次数。

**示例：**
输入：nums = [0,1,0,3,12]
输出：[1,3,12,0,0]

## 思路

这题和 #26 删除有序数组重复项 是同一类"读写双指针"模板。可以把"移动零"理解为"把所有非零元素压到前面，剩下的位置补 0"。

定义两个指针：
- \`slow\`：下一个非零元素应该写入的位置。
- \`fast\`：扫描指针，遍历数组找非零元素。

算法流程：
1. \`slow = 0\`，\`fast\` 从 0 遍历到末尾。
2. 当 \`nums[fast] !== 0\` 时，把 \`nums[fast]\` 写入 \`nums[slow]\`，\`slow++\`。
3. 遍历结束后，从 \`slow\` 到末尾全部置 0。

优化：可以避免"先全部前移再补 0"的两步，直接用**交换**——把非零元素和 \`slow\` 位置交换，一次扫描完成且不丢失 0。这种方式更优雅，且当非零元素已经在前时不会做多余赋值。

注意：当 \`slow === fast\` 时交换是自交换，可以加判断跳过，但通常没必要（开销很小）。

## Python 实现

\`\`\`python
class Solution:
    def moveZeroes(self, nums):
        # 交换法：一次遍历完成
        slow = 0
        for fast in range(len(nums)):
            if nums[fast] != 0:
                # 交换 slow 和 fast 位置
                nums[slow], nums[fast] = nums[fast], nums[slow]
                slow += 1
\`\`\`

## JavaScript 实现

\`\`\`javascript
var moveZeroes = function(nums) {
    // slow 指向下一个非零写入位置
    let slow = 0;
    for (let fast = 0; fast < nums.length; fast++) {
        if (nums[fast] !== 0) {
            // 交换，非零元素前移
            [nums[slow], nums[fast]] = [nums[fast], nums[slow]];
            slow++;
        }
    }
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，只遍历一次。
- 空间复杂度：O(1)，原地操作。

## 拓展

- **变体**：移动指定值到末尾、把奇数放前偶数放后（注意保持相对顺序则不能用快排的 partition）。
- **面试追问**：为什么用交换而不是先收集再补 0？交换保证一次遍历完成，且不需要后续填充步骤，更简洁。
- **注意**：若要求保持 0 的相对顺序也无影响，因为交换法天然保持非零元素相对顺序，0 被推到末尾后顺序也保持。
- **相关题目**：#27 移除元素（同样模板，只是不补 0）、#905 按奇偶排序数组。`,
  },
  {
    id: 'lc-07',
    group: '数组基础',
    icon: '🔢',
    title: '#121 买卖股票的最佳时机（简单）',
    content: `## 题目

**LeetCode #121 买卖股票的最佳时机** | 难度：简单

给定一个数组 \`prices\`，它的第 \`i\` 个元素 \`prices[i]\` 表示一支股票第 \`i\` 天的价格。你只能选择某一天买入并在未来的某一天卖出。计算你能获取的最大利润。如果不能获取任何利润，返回 0。

**示例：**
输入：prices = [7,1,5,3,6,4]
输出：5
解释：在第 2 天（价格=1）买入，第 5 天（价格=6）卖出，利润=5。

## 思路

暴力做法是双重循环枚举所有买入卖出日，O(n²)。但本题有非常优雅的 O(n) 解法。

关键观察：对于每个位置 \`i\` 作为卖出日，最优买入日一定是 \`[0, i]\` 区间内的最小值。所以只需维护一个"历史最低价"变量，遍历时用它计算"如果今天卖出的利润"，并更新全局最大利润。

算法流程：
1. 初始化 \`min_price = prices[0]\`、\`max_profit = 0\`。
2. 遍历每一天的价格 \`price\`：
   - 用 \`price - min_price\` 更新 \`max_profit\`（假设今天卖出）。
   - 用 \`price\` 更新 \`min_price\`（为后续卖出做准备）。
3. 返回 \`max_profit\`。

这种"维护历史最小值、滚动更新最大利润"的思路是股票系列题的入门，后续变体（多次交易、含手续费、含冷冻期）都是 DP 思路的演化。

## Python 实现

\`\`\`python
class Solution:
    def maxProfit(self, prices):
        if not prices:
            return 0
        # min_price 维护到当前位置的最低价
        min_price = prices[0]
        max_profit = 0
        for price in prices:
            # 假设今天卖出，更新最大利润
            if price - min_price > max_profit:
                max_profit = price - min_price
            # 更新历史最低价
            if price < min_price:
                min_price = price
        return max_profit
\`\`\`

## JavaScript 实现

\`\`\`javascript
var maxProfit = function(prices) {
    if (prices.length === 0) return 0;
    // 维护历史最低价和最大利润
    let minPrice = prices[0];
    let maxProfit = 0;
    for (const price of prices) {
        // 假设今天卖出能获得的利润
        if (price - minPrice > maxProfit) {
            maxProfit = price - minPrice;
        }
        // 更新最低价
        if (price < minPrice) {
            minPrice = price;
        }
    }
    return maxProfit;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，单次遍历。
- 空间复杂度：O(1)，只用了两个变量。

## 拓展

- **变体系列**：#122 多次买卖（贪心/DP）、#123 最多两次交易、#188 最多 k 次交易、#309 含冷冻期、#714 含手续费。这些题都用 DP 状态机思路统一处理。
- **DP 视角**：定义 \`dp[i][0]\` 表示第 i 天不持股的最大收益，\`dp[i][1]\` 表示持股的最大收益，状态转移方程为：
  - \`dp[i][0] = max(dp[i-1][0], dp[i-1][1] + prices[i])\`
  - \`dp[i][1] = max(dp[i-1][1], -prices[i])\`
- **面试追问**：如果只能用一次交易但允许做空呢？对称处理最大值即可。
- **陷阱**：不要被"贪心"误导为"找到最低点和最高点"——必须保证买入在卖出之前。`,
  },
  {
    id: 'lc-08',
    group: '数组基础',
    icon: '🔢',
    title: '#189 轮转数组（中等）',
    content: `## 题目

**LeetCode #189 轮转数组** | 难度：中等

给定一个整数数组 \`nums\`，将数组中的元素向右轮转 \`k\` 个位置，其中 \`k\` 是非负数。要求尽量使用空间复杂度为 O(1) 的原地算法。

**示例：**
输入：nums = [1,2,3,4,5,6,7], k = 3
输出：[5,6,7,1,2,3,4]
解释：向右轮转 1 步: [7,1,2,3,4,5,6]；轮转 3 步后得到 [5,6,7,1,2,3,4]

## 思路

朴素做法是开新数组，把 \`nums[i]\` 放到 \`new[(i + k) % n]\`，再复制回去。空间 O(n)，能用但不够优。

最优解是**三次反转**，空间 O(1)：
1. 先把 \`k\` 取模 \`k %= n\`（因为轮转 n 次回到原位，k 可能远大于 n）。
2. **反转整个数组**。
3. **反转前 k 个元素**。
4. **反转后 n - k 个元素**。

以 \`[1,2,3,4,5,6,7], k=3\` 为例：
- 整体反转：\`[7,6,5,4,3,2,1]\`
- 反转前 3：\`[5,6,7,4,3,2,1]\`
- 反转后 4：\`[5,6,7,1,2,3,4]\` ✓

为什么这个三步有效？向右轮转 k 等价于把后 k 个元素移到前面。整体反转后，原数组的后 k 个变成前 k 个但顺序反了，再分别反转前后两段就恢复了各自顺序。

辅助函数 \`reverse(nums, start, end)\` 用双指针交换即可。注意边界：\`k\` 取模后为 0 直接返回，避免做无用功。

## Python 实现

\`\`\`python
class Solution:
    def rotate(self, nums, k):
        n = len(nums)
        k %= n  # 处理 k 大于 n 的情况
        if k == 0:
            return
        # 三次反转
        self.reverse(nums, 0, n - 1)
        self.reverse(nums, 0, k - 1)
        self.reverse(nums, k, n - 1)

    def reverse(self, nums, start, end):
        # 双指针交换反转
        while start < end:
            nums[start], nums[end] = nums[end], nums[start]
            start += 1
            end -= 1
\`\`\`

## JavaScript 实现

\`\`\`javascript
var rotate = function(nums, k) {
    const n = nums.length;
    k %= n;
    if (k === 0) return;
    // 辅助反转函数
    const reverse = (start, end) => {
        while (start < end) {
            [nums[start], nums[end]] = [nums[end], nums[start]];
            start++;
            end--;
        }
    };
    // 三次反转
    reverse(0, n - 1);
    reverse(0, k - 1);
    reverse(k, n - 1);
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，三次反转各 O(n)，整体 O(n)。
- 空间复杂度：O(1)，原地修改。

## 拓展

- **变体**：#61 旋转链表（链表版的轮转，思路类似但用快慢指针找断点）、#725 分隔链表。
- **面试追问**：如果要求向左轮转呢？向左 k 等价于向右 n - k，套同一套代码即可。
- **其它解法**：环状替换法（每个元素直接放到目标位置，用计数判断是否遍历完所有元素），同样 O(1) 空间但代码复杂、易错。
- **陷阱**：忘记 \`k %= n\` 是最常见 bug——当 k 远大于 n 时会做大量无用旋转甚至死循环。`,
  },
  {
    id: 'lc-09',
    group: '数组基础',
    icon: '🔢',
    title: '#48 旋转图像（中等）',
    content: `## 题目

**LeetCode #48 旋转图像** | 难度：中等

给定一个 \`n × n\` 的二维矩阵 \`matrix\` 表示一个图像。请将图像顺时针旋转 90 度。要求**原地**旋转，不能使用另一个矩阵来旋转图像。

**示例：**
输入：matrix = [[1,2,3],[4,5,6],[7,8,9]]
输出：[[7,4,1],[8,5,2],[9,6,3]]

## 思路

朴素做法是开新矩阵，\`new[j][n-1-i] = matrix[i][j]\`，但违反 O(1) 空间要求。

最优解是**两步法**：先**转置**再**水平翻转**。原理：顺时针 90° 旋转等价于"沿主对角线转置" + "每行左右翻转"。

以 \`[[1,2,3],[4,5,6],[7,8,9]]\` 为例：
1. 转置（沿主对角线交换 \`matrix[i][j]\` 与 \`matrix[j][i]\`）：
   \`[[1,4,7],[2,5,8],[3,6,9]]\`
2. 每行左右翻转：
   \`[[7,4,1],[8,5,2],[9,6,3]]\` ✓

为什么有效？转置把行变列（\`(i,j) -> (j,i)\`），翻转再把列倒序（\`(j,i) -> (j, n-1-i)\`），合起来正是顺时针 90° 的映射 \`(i,j) -> (j, n-1-i)\`。

转置注意只遍历上三角（\`i < j\` 部分），避免交换两次又回到原位。翻转每行用双指针即可。

记忆口诀：**"转置 + 翻转 = 旋转"**。逆时针 90° 则是转置 + 上下翻转；180° 是上下翻转 + 左右翻转。

## Python 实现

\`\`\`python
class Solution:
    def rotate(self, matrix):
        n = len(matrix)
        # 第一步：沿主对角线转置
        for i in range(n):
            for j in range(i + 1, n):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
        # 第二步：每行左右翻转
        for row in matrix:
            row.reverse()
\`\`\`

## JavaScript 实现

\`\`\`javascript
var rotate = function(matrix) {
    const n = matrix.length;
    // 第一步：转置（只遍历上三角）
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
        }
    }
    // 第二步：每行翻转
    for (const row of matrix) {
        row.reverse();
    }
};
\`\`\`

## 复杂度

- 时间复杂度：O(n²)，转置和翻转各访问约一半元素。
- 空间复杂度：O(1)，原地修改。

## 拓展

- **变体**：#54 螺旋矩阵、#59 螺旋矩阵 II（构造）、#48 旋转图像的逆操作。
- **其它解法**：四元组原地旋转——把四个对称位置的元素 \`(i,j), (j,n-1-i), (n-1-i,n-1-j), (n-1-j,i)\` 一次性轮转交换。代码稍复杂但只一次遍历。
- **面试追问**：如何逆时针 90°？（转置 + 上下翻转，或水平翻转 + 转置）如何 180°？（上下翻转 + 左右翻转）。
- **记忆技巧**：把"顺时针 90° = 转置 + 左右翻转"作为基准，其它方向通过调整翻转方向派生。`,
  },
  {
    id: 'lc-10',
    group: '数组基础',
    icon: '🔢',
    title: '#54 螺旋矩阵（中等）',
    content: `## 题目

**LeetCode #54 螺旋矩阵** | 难度：中等

给定一个 \`m × n\` 的矩阵 \`matrix\`，按顺时针螺旋顺序返回矩阵中的所有元素。

**示例：**
输入：matrix = [[1,2,3],[4,5,6],[7,8,9]]
输出：[1,2,3,6,9,8,7,4,5]

输入：matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]
输出：[1,2,3,4,8,12,11,10,9,5,6,7]

## 思路

螺旋遍历就是模拟人眼"从外向内一圈圈走"的过程。每一圈有四段：上边从左到右、右边从上到下、下边从右到左、左边从下到上。走完一圈后边界向内收缩一层。

定义四个边界变量：
- \`top\`：当前最上行（初始 0）
- \`bottom\`：当前最下行（初始 m - 1）
- \`left\`：当前最左列（初始 0）
- \`right\`：当前最右列（初始 n - 1）

每圈四步：
1. **上边**：从 \`left\` 到 \`right\`，行固定为 \`top\`，结束后 \`top++\`。
2. **右边**：从 \`top\` 到 \`bottom\`，列固定为 \`right\`，结束后 \`right--\`。
3. **下边**：从 \`right\` 到 \`left\`，行固定为 \`bottom\`，结束后 \`bottom--\`。（前提：\`top <= bottom\`，避免只剩一行时重复走）
4. **左边**：从 \`bottom\` 到 \`top\`，列固定为 \`left\`，结束后 \`left++\`。（前提：\`left <= right\`，避免只剩一列时重复走）

每段结束后立即收缩对应边界，循环条件是 \`top <= bottom && left <= right\`。第 3、4 步的前置判断至关重要——例如只剩一行时，第 1 步已经把这一行走完了，再走第 3 步就会重复收集。

## Python 实现

\`\`\`python
class Solution:
    def spiralOrder(self, matrix):
        if not matrix or not matrix[0]:
            return []
        m, n = len(matrix), len(matrix[0])
        result = []
        top, bottom = 0, m - 1
        left, right = 0, n - 1
        while top <= bottom and left <= right:
            # 上边：左到右
            for j in range(left, right + 1):
                result.append(matrix[top][j])
            top += 1
            # 右边：上到下
            for i in range(top, bottom + 1):
                result.append(matrix[i][right])
            right -= 1
            # 下边：右到左（需判断是否还有行）
            if top <= bottom:
                for j in range(right, left - 1, -1):
                    result.append(matrix[bottom][j])
                bottom -= 1
            # 左边：下到上（需判断是否还有列）
            if left <= right:
                for i in range(bottom, top - 1, -1):
                    result.append(matrix[i][left])
                left += 1
        return result
\`\`\`

## JavaScript 实现

\`\`\`javascript
var spiralOrder = function(matrix) {
    if (matrix.length === 0 || matrix[0].length === 0) return [];
    const m = matrix.length, n = matrix[0].length;
    const result = [];
    let top = 0, bottom = m - 1;
    let left = 0, right = n - 1;
    while (top <= bottom && left <= right) {
        // 上边：左到右
        for (let j = left; j <= right; j++) result.push(matrix[top][j]);
        top++;
        // 右边：上到下
        for (let i = top; i <= bottom; i++) result.push(matrix[i][right]);
        right--;
        // 下边：右到左（注意边界判断）
        if (top <= bottom) {
            for (let j = right; j >= left; j--) result.push(matrix[bottom][j]);
            bottom--;
        }
        // 左边：下到上（注意边界判断）
        if (left <= right) {
            for (let i = bottom; i >= top; i--) result.push(matrix[i][left]);
            left++;
        }
    }
    return result;
};
\`\`\`

## 复杂度

- 时间复杂度：O(m × n)，每个元素访问一次。
- 空间复杂度：O(1)，不计输出数组则为常数空间。

## 拓展

- **相关题目**：#59 螺旋矩阵 II（给定 n，构造 n×n 螺旋矩阵）、#885 螺旋矩阵 III（从中心向外螺旋）。
- **变体**：顺时针 vs 逆时针、从外向内 vs 从内向外，思路一致只是方向调整。
- **面试追问**：为什么第 3、4 步要加边界判断？因为退化为一行/一列时只走第 1、2 步就够了，再走会重复收集。
- **工程应用**：矩阵螺旋遍历在图像处理（按层次扫描）、压缩算法里有实际用途。`,
  },
];
