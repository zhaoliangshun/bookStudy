// =============================================================
// LeetCode 面试算法 200 题 —— 第三批章节（哈希表组，共 10 题）
// -------------------------------------------------------------
// 题号 lc-21 ~ lc-30，覆盖哈希表经典面试题。
// 每题包含：题目 / 思路 / Python 实现 / JavaScript 实现 / 复杂度 / 拓展。
// =============================================================

export const chapters = [
  {
    id: "lc-21",
    group: "哈希表",
    icon: "🗂️",
    title: "#350 两个数组的交集 II（简单）",
    content: `
## 题目

**LeetCode #350 两个数组的交集 II** | 难度：简单

给定两个整数数组 \`nums1\` 和 \`nums2\`，返回它们的交集。结果中每个元素出现的次数，应与该元素在两个数组中出现的最小次数一致。结果的顺序不做要求。

**示例：**
输入：nums1 = [1,2,2,1], nums2 = [2,2]
输出：[2,2]

输入：nums1 = [4,9,5], nums2 = [9,4,9,8,4]
输出：[4,9]（或 [9,4]）

## 思路

这道题要求考虑重复元素，因此不能简单地用集合求交集，而要统计每个数字出现的频次。

1. 用哈希表统计其中一个数组中每个数字出现的次数；
2. 遍历另一个数组，若当前数字在哈希表中计数大于 0，则加入结果，并把计数减 1；
3. 为节省空间，可以让较短的数组作为统计对象。

核心思想是“消费式计数”：每匹配到一个就扣减一次，保证不会多用。

## Python 实现

\`\`\`python
from collections import Counter

class Solution:
    def intersect(self, nums1, nums2):
        # 让较短数组作为统计对象，节省空间
        if len(nums1) > len(nums2):
            nums1, nums2 = nums2, nums1
        counts = Counter(nums1)
        res = []
        for num in nums2:
            if counts.get(num, 0) > 0:
                res.append(num)
                counts[num] -= 1
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var intersect = function(nums1, nums2) {
    // 较短数组作为统计对象
    if (nums1.length > nums2.length) {
        var tmp = nums1; nums1 = nums2; nums2 = tmp;
    }
    var map = new Map();
    for (var i = 0; i < nums1.length; i++) {
        map.set(nums1[i], (map.get(nums1[i]) || 0) + 1);
    }
    var res = [];
    for (var j = 0; j < nums2.length; j++) {
        var c = map.get(nums2[j]) || 0;
        if (c > 0) {
            res.push(nums2[j]);
            map.set(nums2[j], c - 1);
        }
    }
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(m + n)，遍历两个数组各一次。
- 空间复杂度：O(min(m, n))，哈希表只存储较短数组的元素。

## 拓展

- 若两个数组均已排序，可改用双指针法，时间 O(m + n)、空间 O(1)；
- 若 \`nums2\` 存储在磁盘上无法一次性读入内存，可把 \`nums1\` 的频次表加载进内存，然后分批读取 \`nums2\` 进行匹配。
`
  },
  {
    id: "lc-22",
    group: "哈希表",
    icon: "🗂️",
    title: "#383 赎金信（简单）",
    content: `
## 题目

**LeetCode #383 赎金信** | 难度：简单

给定一个字符串 \`ransomNote\` 和一个字符串 \`magazine\`，判断 \`ransomNote\` 能否由 \`magazine\` 里的字符构成。\`magazine\` 中的每个字符只能使用一次。

**示例：**
输入：ransomNote = "a", magazine = "b"
输出：false

输入：ransomNote = "aa", magazine = "ab"
输出：false

## 思路

这是一道典型的“字符频次统计”题。题目限定字符为小写英文字母，所以可以用固定长度的数组代替哈希表，效率更高。

1. 统计 \`magazine\` 中每个字符的出现次数；
2. 遍历 \`ransomNote\`，每遇到一个字符就在频次表中扣减；
3. 若某字符计数不足，立即返回 \`false\`。

也可以先统计 \`ransomNote\` 的需求，再扫一遍 \`magazine\` 做扣减，最后检查是否全部满足。

## Python 实现

\`\`\`python
class Solution:
    def canConstruct(self, ransomNote, magazine):
        # 用 26 长度的数组统计 magazine 的字母频次
        cnt = [0] * 26
        for ch in magazine:
            cnt[ord(ch) - ord('a')] += 1
        for ch in ransomNote:
            idx = ord(ch) - ord('a')
            cnt[idx] -= 1
            if cnt[idx] < 0:
                # 该字母不够用
                return False
        return True
\`\`\`

## JavaScript 实现

\`\`\`javascript
var canConstruct = function(ransomNote, magazine) {
    // 26 个字母的频次数组
    var cnt = new Array(26).fill(0);
    for (var i = 0; i < magazine.length; i++) {
        cnt[magazine.charCodeAt(i) - 97]++;
    }
    for (var j = 0; j < ransomNote.length; j++) {
        var idx = ransomNote.charCodeAt(j) - 97;
        cnt[idx]--;
        if (cnt[idx] < 0) {
            // 字母数量不足
            return false;
        }
    }
    return true;
};
\`\`\`

## 复杂度

- 时间复杂度：O(m + n)，其中 m、n 分别为两字符串长度。
- 空间复杂度：O(1)，频次数组大小固定为 26。

## 拓展

- 若字符集扩大为 Unicode，可改用 \`Map\` / \`Counter\` 进行统计；
- 本题是哈希表“抵消计数”思想的入门题，类似思路见 #242 有效的字母异位词。
`
  },
  {
    id: "lc-23",
    group: "哈希表",
    icon: "🗂️",
    title: "#205 同构字符串（简单）",
    content: `
## 题目

**LeetCode #205 同构字符串** | 难度：简单

给定两个字符串 \`s\` 和 \`t\`，判断它们是否同构。同构指 \`s\` 中的字符可以按某种映射关系替换得到 \`t\`，要求：同一个字符只能映射到同一个字符，不同字符不能映射到同一个字符，且字符不能映射到自身之外的“一对多”。

**示例：**
输入：s = "egg", t = "add"
输出：true

输入：s = "foo", t = "bar"
输出：false

## 思路

这是一道“双向映射”题。需要保证：

1. \`s\` 中同一字符总是映射到 \`t\` 中同一字符；
2. \`t\` 中同一字符总是被 \`s\` 中同一字符映射（即映射是一一对应）。

因此维护两张哈希表：\`s2t\` 记录 \`s→t\` 的映射，\`t2s\` 记录 \`t→s\` 的映射。逐字符扫描，若发现映射不一致立即返回 \`false\`。

## Python 实现

\`\`\`python
class Solution:
    def isIsomorphic(self, s, t):
        s2t, t2s = {}, {}
        for sc, tc in zip(s, t):
            # 检查 s -> t 的映射是否一致
            if sc in s2t and s2t[sc] != tc:
                return False
            # 检查 t -> s 的映射是否一致
            if tc in t2s and t2s[tc] != sc:
                return False
            s2t[sc] = tc
            t2s[tc] = sc
        return True
\`\`\`

## JavaScript 实现

\`\`\`javascript
var isIsomorphic = function(s, t) {
    var s2t = new Map();
    var t2s = new Map();
    for (var i = 0; i < s.length; i++) {
        var sc = s[i], tc = t[i];
        // s -> t 映射检查
        if (s2t.has(sc) && s2t.get(sc) !== tc) return false;
        // t -> s 映射检查
        if (t2s.has(tc) && t2s.get(tc) !== sc) return false;
        s2t.set(sc, tc);
        t2s.set(tc, sc);
    }
    return true;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，遍历字符串一次。
- 空间复杂度：O(1)，字符集有限，哈希表大小有界。

## 拓展

- 也可以记录“每个字符上次出现的位置”，若 \`s[i]\` 与 \`t[i]\` 上次出现位置不同则不同构，实现上只需一次遍历且不用维护映射值；
- 相关题目：#290 单词规律、#890 查找和替换模式。
`
  },
  {
    id: "lc-24",
    group: "哈希表",
    icon: "🗂️",
    title: "#290 单词规律（简单）",
    content: `
## 题目

**LeetCode #290 单词规律** | 难度：简单

给定一种规律 \`pattern\` 和一个字符串 \`s\`，判断 \`s\` 是否遵循相同的规律。即 \`pattern\` 中的每个字符与 \`s\` 中的每个单词之间要建立一一对应的双射关系。

**示例：**
输入：pattern = "abba", s = "dog cat cat dog"
输出：true

输入：pattern = "abba", s = "dog cat cat fish"
输出：false

## 思路

这是 #205 同构字符串的“字符 → 单词”版本，核心仍是双向映射：

1. 先把 \`s\` 按空格拆成单词数组，若单词数量与 \`pattern\` 长度不等直接返回 \`false\`；
2. 维护 \`char2word\` 与 \`word2char\` 两张哈希表；
3. 逐对扫描，若任一方向映射不一致则返回 \`false\`。

注意必须检查“双向”，否则 \`pattern="ab"\`、\`s="dog dog"\` 这类错误会被漏判。

## Python 实现

\`\`\`python
class Solution:
    def wordPattern(self, pattern, s):
        words = s.split()
        if len(pattern) != len(words):
            return False
        c2w, w2c = {}, {}
        for ch, word in zip(pattern, words):
            if ch in c2w and c2w[ch] != word:
                return False
            if word in w2c and w2c[word] != ch:
                return False
            c2w[ch] = word
            w2c[word] = ch
        return True
\`\`\`

## JavaScript 实现

\`\`\`javascript
var wordPattern = function(pattern, s) {
    var words = s.split(' ');
    if (pattern.length !== words.length) return false;
    var c2w = new Map();
    var w2c = new Map();
    for (var i = 0; i < pattern.length; i++) {
        var ch = pattern[i];
        var word = words[i];
        if (c2w.has(ch) && c2w.get(ch) !== word) return false;
        if (w2c.has(word) && w2c.get(word) !== ch) return false;
        c2w.set(ch, word);
        w2c.set(word, ch);
    }
    return true;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，n 为 pattern 长度（或单词数）。
- 空间复杂度：O(n)，哈希表最多存储 n 个映射。

## 拓展

- 本题要求“双射”，若只要求“单射”则只需一张表；
- 同类映射题：#205 同构字符串、#890 查找和替换模式、#291 单词规律 II。
`
  },
  {
    id: "lc-25",
    group: "哈希表",
    icon: "🗂️",
    title: "#49 字母异位词分组（中等）",
    content: `
## 题目

**LeetCode #49 字母异位词分组** | 难度：中等

给定一个字符串数组 \`strs\`，将字母异位词组合在一起。字母异位词是指字母相同但排列不同的字符串。可以按任意顺序返回结果列表。

**示例：**
输入：strs = ["eat","tea","tan","ate","nat","bat"]
输出：[["bat"],["nat","tan"],["ate","eat","tea"]]

## 思路

字母异位词的本质是“字符频次相同”，因此需要一个能唯一标识一组异位词的“键”。常见两种构造键的方式：

1. **排序法**：把字符串排序，排序后的结果作为键。同一组异位词排序后必然相同。
2. **计数法**：统计每个字母出现次数，把频次数组转成字符串作为键。

排序法实现简单，时间复杂度 O(k log k)（k 为字符串长度）；计数法为 O(k)，适合长字符串。下面代码采用排序法，可读性最佳。

## Python 实现

\`\`\`python
from collections import defaultdict

class Solution:
    def groupAnagrams(self, strs):
        groups = defaultdict(list)
        for word in strs:
            # 排序后的字符串作为分组键
            key = ''.join(sorted(word))
            groups[key].append(word)
        return list(groups.values())
\`\`\`

## JavaScript 实现

\`\`\`javascript
var groupAnagrams = function(strs) {
    var map = new Map();
    for (var i = 0; i < strs.length; i++) {
        // 把单词拆分排序后再 join 作为键
        var key = strs[i].split('').sort().join('');
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(strs[i]);
    }
    var res = [];
    map.forEach(function(val) { res.push(val); });
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n · k log k)，n 为字符串数量，k 为最长字符串长度（排序耗时）。
- 空间复杂度：O(n · k)，存储哈希表和结果。

## 拓展

- 若字符串很长，改用“26 位计数串”作为键，时间可降到 O(n · k)；
- 相关题目：#242 有效的字母异位词、#438 找到字符串中所有字母异位词。
`
  },
  {
    id: "lc-26",
    group: "哈希表",
    icon: "🗂️",
    title: "#128 最长连续序列（中等）",
    content: `
## 题目

**LeetCode #128 最长连续序列** | 难度：中等

给定一个未排序的整数数组 \`nums\`，找出数字连续的最长序列的长度。要求算法的时间复杂度为 O(n)。

**示例：**
输入：nums = [100,4,200,1,3,2]
输出：4
解释：最长连续序列是 [1,2,3,4]，长度为 4。

## 思路

要达到 O(n)，不能排序（排序需 O(n log n)）。利用哈希集合可以在 O(1) 内判断某数是否存在：

1. 先把所有数放进哈希集合 \`set\`；
2. 遍历集合中的每个数 \`num\`，**仅当 \`num - 1\` 不在集合中时**才作为“序列起点”向右扩展；
3. 从起点开始不断 \`+1\` 计数，更新最大长度。

关键优化是“只从起点开始扩展”：一个数若 \`num-1\` 也在集合里，它一定被包含在某个更小的起点扩展过程中，跳过即可避免重复计数。每个元素最多被访问两次，总时间 O(n)。

## Python 实现

\`\`\`python
class Solution:
    def longestConsecutive(self, nums):
        num_set = set(nums)
        best = 0
        for num in num_set:
            # 只从序列起点开始扩展
            if num - 1 not in num_set:
                cur = num
                length = 1
                while cur + 1 in num_set:
                    cur += 1
                    length += 1
                best = max(best, length)
        return best
\`\`\`

## JavaScript 实现

\`\`\`javascript
var longestConsecutive = function(nums) {
    var set = new Set(nums);
    var best = 0;
    set.forEach(function(num) {
        // 仅当 num-1 不存在时作为起点
        if (!set.has(num - 1)) {
            var cur = num;
            var len = 1;
            while (set.has(cur + 1)) {
                cur++;
                len++;
            }
            if (len > best) best = len;
        }
    });
    return best;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，每个元素最多被起点判断和外层扩展各访问一次。
- 空间复杂度：O(n)，哈希集合存储所有元素。

## 拓展

- 若允许 O(n log n)，可直接排序后线性扫描，空间可降到 O(1)；
- 并查集也可解本题：把相邻数字合并，最终统计最大连通块大小。
`
  },
  {
    id: "lc-27",
    group: "哈希表",
    icon: "🗂️",
    title: "#169 多数元素（简单）",
    content: `
## 题目

**LeetCode #169 多数元素** | 难度：简单

给定一个大小为 \`n\` 的数组 \`nums\`，返回其中的多数元素。多数元素是指在数组中出现次数 **大于 \`⌊n/2⌋\`** 的元素。可以假设数组非空且一定存在多数元素。

**示例：**
输入：nums = [3,2,3]
输出：3

输入：nums = [2,2,1,1,1,2,2]
输出：2

## 思路

由于多数元素出现次数超过一半，它一定是“众数”。最经典的解法是 **Boyer-Moore 摩尔投票法**，可在 O(n) 时间、O(1) 空间完成：

1. 维护候选 \`candidate\` 和票数 \`count\`；
2. 遍历数组：\`count\` 为 0 时换候选为当前数；当前数等于候选则 \`count++\`，否则 \`count--\`；
3. 由于多数元素超过半数，最终剩下的候选一定是它。

直觉理解：把不同的元素两两“抵消”，最后剩下来的必然是数量占优的那个。也可用哈希表计数，但空间为 O(n)。

## Python 实现

\`\`\`python
class Solution:
    def majorityElement(self, nums):
        # 摩尔投票法
        candidate = None
        count = 0
        for num in nums:
            if count == 0:
                candidate = num
            count += 1 if num == candidate else -1
        return candidate
\`\`\`

## JavaScript 实现

\`\`\`javascript
var majorityElement = function(nums) {
    // 摩尔投票法
    var candidate = null;
    var count = 0;
    for (var i = 0; i < nums.length; i++) {
        if (count === 0) candidate = nums[i];
        count += (nums[i] === candidate) ? 1 : -1;
    }
    return candidate;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，一次遍历。
- 空间复杂度：O(1)，仅用常数变量。

## 拓展

- 若要求出现次数大于 \`⌊n/3⌋\` 的元素，参见 #229，需同时维护两个候选；
- 哈希表计数法时间 O(n)、空间 O(n)，理解简单但不是最优；
- 也可排序后取中位数，时间 O(n log n)。
`
  },
  {
    id: "lc-28",
    group: "哈希表",
    icon: "🗂️",
    title: "#347 前 K 个高频元素（中等）",
    content: `
## 题目

**LeetCode #347 前 K 个高频元素** | 难度：中等

给定一个整数数组 \`nums\` 和一个整数 \`k\`，返回其中出现频率前 \`k\` 高的元素。可以按任意顺序返回答案。

**示例：**
输入：nums = [1,1,1,2,2,3], k = 2
输出：[1,2]

## 思路

分两步走：先用哈希表统计频次，再从中选出前 \`k\` 个。选前 k 个有三种常见做法：

1. **最小堆**：维护大小为 k 的最小堆，遍历频次表，堆顶始终是当前最小的频率，最后堆中剩下的就是 Top-K。时间 O(n log k)。
2. **桶排序**：以频率为下标建立桶（频率最大不超过 n），从高到低收集元素直到凑够 k 个。时间 O(n)。
3. **排序**：按频率降序排序后取前 k，时间 O(n log n)。

下面给出堆与桶排序两种实现。面试中桶排序能体现对“频率上界”的理解，推荐掌握。

## Python 实现

\`\`\`python
import heapq
from collections import Counter

class Solution:
    def topKFrequent(self, nums, k):
        # 方法一：最小堆
        cnt = Counter(nums)
        # 用 (频率, 元素) 构造大小为 k 的最小堆
        return [x for _, x in heapq.nlargest(k, cnt.items(), key=lambda x: x[1])]

    def topKFrequent_bucket(self, nums, k):
        # 方法二：桶排序
        cnt = Counter(nums)
        bucket = [[] for _ in range(len(nums) + 1)]
        for num, freq in cnt.items():
            bucket[freq].append(num)
        res = []
        for freq in range(len(nums), 0, -1):
            for num in bucket[freq]:
                res.append(num)
                if len(res) == k:
                    return res
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var topKFrequent = function(nums, k) {
    // 统计频次
    var map = new Map();
    for (var i = 0; i < nums.length; i++) {
        map.set(nums[i], (map.get(nums[i]) || 0) + 1);
    }
    // 桶排序：以频率作为下标
    var bucket = [];
    for (var b = 0; b <= nums.length; b++) bucket.push([]);
    map.forEach(function(freq, num) {
        bucket[freq].push(num);
    });
    var res = [];
    for (var f = nums.length; f >= 0 && res.length < k; f--) {
        for (var j = 0; j < bucket[f].length; j++) {
            res.push(bucket[f][j]);
            if (res.length === k) return res;
        }
    }
    return res;
};
\`\`\`

## 复杂度

- 堆：时间 O(n log k)，空间 O(n)。
- 桶排序：时间 O(n)，空间 O(n)。

## 拓展

- 也可用快速选择（类似快排的 partition），平均 O(n)、最坏 O(n²)；
- 相关题目：#215 数组中的第 K 个最大元素、#692 前 K 个高频单词。
`
  },
  {
    id: "lc-29",
    group: "哈希表",
    icon: "🗂️",
    title: "#454 四数相加 II（中等）",
    content: `
## 题目

**LeetCode #454 四数相加 II** | 难度：中等

给定四个整数数组 \`nums1\`、\`nums2\`、\`nums3\`、\`nums4\`，数组长度均为 \`n\`。计算有多少个元组 \`(i, j, k, l)\` 满足 \`nums1[i] + nums2[j] + nums3[k] + nums4[l] == 0\`。

**示例：**
输入：nums1 = [1,2], nums2 = [-2,-1], nums3 = [-1,2], nums4 = [0,2]
输出：2
解释：两个满足条件的元组为 (0,0,0,1) → 1+(-2)+(-1)+2=0，(1,1,0,0) → 2+(-1)+(-1)+0=0。

## 思路

四层循环枚举是 O(n⁴)，太慢。利用“分组 + 哈希表”可以降到 O(n²)：

1. 把四个数组分成两组：\`A+B\` 与 \`C+D\`；
2. 先枚举 \`nums1\` 与 \`nums2\` 的所有组合，把和存入哈希表并计数（和可能重复，所以记录次数）；
3. 再枚举 \`nums3\` 与 \`nums4\` 的所有组合，对每个和 \`s\`，在哈希表中查找 \`-s\` 出现的次数并累加。

这样把“四数之和”转化为“两数之和”问题，时间从 O(n⁴) 降到 O(n²)，是典型的空间换时间。

## Python 实现

\`\`\`python
from collections import defaultdict

class Solution:
    def fourSumCount(self, nums1, nums2, nums3, nums4):
        # 统计 nums1 + nums2 的每种和出现次数
        ab = defaultdict(int)
        for a in nums1:
            for b in nums2:
                ab[a + b] += 1
        count = 0
        # 在 nums3 + nums4 中寻找相反数
        for c in nums3:
            for d in nums4:
                count += ab[-(c + d)]
        return count
\`\`\`

## JavaScript 实现

\`\`\`javascript
var fourSumCount = function(nums1, nums2, nums3, nums4) {
    // 哈希表记录 A+B 的和及其次数
    var map = new Map();
    for (var i = 0; i < nums1.length; i++) {
        for (var j = 0; j < nums2.length; j++) {
            var s = nums1[i] + nums2[j];
            map.set(s, (map.get(s) || 0) + 1);
        }
    }
    var count = 0;
    for (var k = 0; k < nums3.length; k++) {
        for (var l = 0; l < nums4.length; l++) {
            // 寻找相反数
            var target = -(nums3[k] + nums4[l]);
            if (map.has(target)) count += map.get(target);
        }
    }
    return count;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n²)，两组双重循环。
- 空间复杂度：O(n²)，哈希表最多存储 n² 个和。

## 拓展

- 若要求元组本身（而非数量），需要把索引也存进哈希表，空间会更大；
- 相关题目：#1 两数之和、#18 四数之和（同一数组，需去重，更复杂）。
`
  },
  {
    id: "lc-30",
    group: "哈希表",
    icon: "🗂️",
    title: "#202 快乐数（简单）",
    content: `
## 题目

**LeetCode #202 快乐数** | 难度：简单

对一个正整数，重复将其替换为它每位数字的平方和，如果最终能变成 1，就是“快乐数”；如果无限循环且变不到 1，则不是。给定 \`n\`，判断它是否为快乐数。

**示例：**
输入：n = 19
输出：true
解释：1² + 9² = 82 → 8² + 2² = 68 → 6² + 6² = 100 → 1² + 0² + 0² = 1。

输入：n = 2
输出：false

## 思路

关键观察：要么最终到 1，要么进入一个不包含 1 的循环。因此问题转化为“检测是否出现重复数字”：

1. 用哈希集合记录每次得到的数字；
2. 不断计算各位平方和作为新数字；
3. 若得到 1 返回 \`true\`；若得到一个已出现过的数字，说明进入循环，返回 \`false\`。

也可用“快慢指针”检测环（Floyd 判圈法），空间可降到 O(1)。下面给出哈希集合实现，更直观。

## Python 实现

\`\`\`python
class Solution:
    def isHappy(self, n):
        seen = set()
        while n != 1 and n not in seen:
            seen.add(n)
            n = self._next(n)
        return n == 1

    def _next(self, n):
        # 计算各位数字平方和
        total = 0
        while n > 0:
            d = n % 10
            total += d * d
            n //= 10
        return total
\`\`\`

## JavaScript 实现

\`\`\`javascript
var isHappy = function(n) {
    var seen = new Set();
    while (n !== 1 && !seen.has(n)) {
        seen.add(n);
        n = nextNum(n);
    }
    return n === 1;
};

// 计算各位平方和
function nextNum(n) {
    var total = 0;
    while (n > 0) {
        var d = n % 10;
        total += d * d;
        n = Math.floor(n / 10);
    }
    return total;
}
\`\`\`

## 复杂度

- 时间复杂度：O(log n)，每次运算把数字位数减少，循环次数有上界（实际很少超过几百次）。
- 空间复杂度：O(log n)，哈希集合存储中间结果。

## 拓展

- 用快慢指针可做到 O(1) 空间：慢指针走一步、快指针走两步，相遇时若值为 1 则快乐；
- 数学上可证明：所有不快乐数最终都会进入 \`4 → 16 → 37 → ... → 4\` 的循环，因此也可硬编码这几个数判断。
`
  }
];
