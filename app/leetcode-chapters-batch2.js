// =============================================================
// LeetCode 面试算法 200 题 - 第二批章节（字符串处理，共 10 题）
// 第 11-20 题：反转字符串 / 反转字符串 II / 验证回文串 / 有效的字母异位词
//          / 最长公共前缀 / 第一个匹配项下标 / 最后一个单词长度
//          / 无重复字符最长子串 / 最长回文子串 / Z 字形变换
// =============================================================

export const chapters = [
  {
    id: 'lc-11',
    group: '字符串处理',
    icon: '📝',
    title: '#344 反转字符串（简单）',
    content: `## 题目

**LeetCode #344 反转字符串** | 难度：简单

编写一个函数，其作用是将输入的字符串反转过来。输入字符串以字符数组 \`s\` 的形式给出。要求**原地**修改输入数组，使用 O(1) 额外空间解决。

**示例：**
输入：s = ["h","e","l","l","o"]
输出：["o","l","l","e","h"]

输入：s = ["H","a","n","n","a","h"]
输出：["h","a","n","n","a","H"]

## 思路

这是字符串题的最基础模板——双指针对称交换。把数组看作一条直线，左右两端各放一个指针，互换后向中间靠拢，直到相遇或交叉。

算法流程：
1. \`left = 0\`、\`right = s.length - 1\`。
2. 当 \`left < right\` 时，交换 \`s[left]\` 和 \`s[right]\`，然后 \`left++\`、\`right--\`。
3. 循环结束时整个数组已反转。

时间 O(n)，空间 O(1)。这是所有"反转/对撞"类问题的通用模板：链表反转、回文判定、容器盛水等都是这个思路的变体。

注意一些语言细节：Python 的 \`s[left], s[right] = s[right], s[left]\` 是原子交换；JS 的解构赋值 \`[a, b] = [b, a]\` 也能一行搞定。某些语言（C/C++）没有原生交换语法，要用临时变量或异或。

## Python 实现

\`\`\`python
class Solution:
    def reverseString(self, s):
        # 左右双指针对称交换
        left, right = 0, len(s) - 1
        while left < right:
            s[left], s[right] = s[right], s[left]
            left += 1
            right -= 1
\`\`\`

## JavaScript 实现

\`\`\`javascript
var reverseString = function(s) {
    // 双指针从两端向中间靠拢
    let left = 0;
    let right = s.length - 1;
    while (left < right) {
        // 解构赋值完成交换
        [s[left], s[right]] = [s[right], s[left]];
        left++;
        right--;
    }
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，n 为字符数，每个字符被访问一次。
- 空间复杂度：O(1)，原地修改。

## 拓展

- **变体**：#541 反转字符串 II（带规则）、#345 反转字符串中的元音字母、#557 反转字符串中的单词 III。
- **面试追问**：为什么用 \`left < right\` 而不是 \`left <= right\`？因为相等时是同一个元素，交换无意义。
- **延伸**：单链表反转没法用双端指针，要用"三指针"或"递归"实现，是另一类经典题。
- **工程意义**：很多高级 API（如 \`reverse()\`）就是这种实现，了解底层有助于在面试中手写。`,
  },
  {
    id: 'lc-12',
    group: '字符串处理',
    icon: '📝',
    title: '#541 反转字符串 II（简单）',
    content: `## 题目

**LeetCode #541 反转字符串 II** | 难度：简单

给定一个字符串 \`s\` 和一个整数 \`k\`，从字符串开头算起，每计数至 \`2k\` 个字符，就反转前 \`k\` 个字符：
- 如果剩余字符少于 \`k\` 个，则全部反转。
- 如果剩余字符在 \`k\` 到 \`2k\` 之间（含 \`k\`），则反转前 \`k\` 个，其余字符保持原样。

**示例：**
输入：s = "abcdefg", k = 2
输出："bacdfeg"
解释：第一组 "abcd" 反转前 2 个得到 "bacd"，第二组 "efg" 剩余少于 2k，反转前 2 个得到 "feg"，合并为 "bacdfeg"。

## 思路

题意看似绕，本质就是"以 2k 为一组遍历，每组反转前 k 个，不够 k 就全反转"。

关键观察：可以用步长 \`2k\` 跳跃遍历，每次处理 \`[i, i + 2k)\` 这一段。在这段内反转 \`[i, i + k)\` 即可，但要注意末尾不够 k 的情况——把结束位置 clamp 到 \`min(i + k, n)\`。

算法流程：
1. 把字符串转成字符数组（很多语言字符串不可变，必须转数组操作）。
2. 用 \`i\` 以步长 2k 遍历：\`i = 0, 2k, 4k, ...\`。
3. 每次确定反转区间 \`[i, min(i + k, n))\`，用双指针反转。
4. 把字符数组拼回字符串。

注意边界：\`i + k\` 可能超过 n，要取 \`Math.min\`。如果 \`i\` 后剩余不足 k 个，则区间就是 \`[i, n)\`，正好把剩余全部反转。

## Python 实现

\`\`\`python
class Solution:
    def reverseStr(self, s, k):
        # 转成列表以便原地修改
        chars = list(s)
        n = len(chars)
        # 步长为 2k 跳跃
        for i in range(0, n, 2 * k):
            # 反转区间右端 clamp 到 n
            right = min(i + k, n)
            # 双指针反转 [i, right)
            left, right = i, right - 1
            while left < right:
                chars[left], chars[right] = chars[right], chars[left]
                left += 1
                right -= 1
        return ''.join(chars)
\`\`\`

## JavaScript 实现

\`\`\`javascript
var reverseStr = function(s, k) {
    // 转字符数组原地修改
    const chars = s.split('');
    const n = chars.length;
    // 辅助反转函数
    const reverse = (start, end) => {
        while (start < end) {
            [chars[start], chars[end]] = [chars[end], chars[start]];
            start++;
            end--;
        }
    };
    // 以 2k 为步长遍历
    for (let i = 0; i < n; i += 2 * k) {
        // 右端 clamp 到 n-1
        const right = Math.min(i + k, n) - 1;
        reverse(i, right);
    }
    return chars.join('');
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，每个字符最多被反转一次。
- 空间复杂度：O(n)，因为字符串不可变，需要转成字符数组。若语言字符串可变则可降到 O(1)。

## 拓展

- **相关题目**：#344 反转字符串（基础）、#557 反转字符串中的单词 III（按空格切分后反转每个单词）。
- **面试追问**：为什么步长是 2k 而不是 k？因为每 2k 个字符里只有前 k 个需要反转，后 k 个保持原样。
- **陷阱**：忘记 clamp 右边界、忘记字符串不可变直接 \`s[i]\` 赋值（JS 会静默失败，Python 会报错）。
- **优化**：Python 可用切片 \`chars[i:i+k] = reversed(chars[i:i+k])\` 一行完成，但面试建议手写双指针展示理解。`,
  },
  {
    id: 'lc-13',
    group: '字符串处理',
    icon: '📝',
    title: '#125 验证回文串（简单）',
    content: `## 题目

**LeetCode #125 验证回文串** | 难度：简单

如果在将所有大写字符转换为小写字符、并移除所有非字母数字字符之后，短语正着读和反着读都一样，则认为该短语是一个回文串。返回 \`true\` 或 \`false\`。字母和数字都属于字母数字字符。

**示例：**
输入：s = "A man, a plan, a canal: Panama"
输出：true
解释："amanaplanacanalpanama" 是回文串

输入：s = "race a car"
输出：false
解释："raceacar" 不是回文串

## 思路

这题考查两个点：字符过滤 + 双指针对撞。回文判定的标准模板是双指针从两端向中间走，每次比较两端字符。本题需要先做"清洗"——跳过非字母数字、统一大小写。

算法流程：
1. \`left = 0\`、\`right = n - 1\`。
2. 当 \`left < right\`：
   - 若 \`s[left]\` 不是字母数字，\`left++\` 跳过。
   - 若 \`s[right]\` 不是字母数字，\`right--\` 跳过。
   - 否则比较 \`lower(s[left])\` 与 \`lower(s[right])\`，若不等返回 \`false\`。
   - \`left++\`、\`right--\`。
3. 走完返回 \`true\`。

这种"边走边过滤"避免了预处理整个字符串，空间 O(1)。预处理版本（先过滤再比较）空间 O(n) 但更直观，作为备选。

注意字符判定：JS 用 \`/[a-zA-Z0-9]/.test(c)\` 或 \`charCodeAt\` 范围判断；Python 直接 \`c.isalnum()\`。

## Python 实现

\`\`\`python
class Solution:
    def isPalindrome(self, s):
        # 左右双指针
        left, right = 0, len(s) - 1
        while left < right:
            # 跳过左端非字母数字
            while left < right and not s[left].isalnum():
                left += 1
            # 跳过右端非字母数字
            while left < right and not s[right].isalnum():
                right -= 1
            # 统一小写比较
            if s[left].lower() != s[right].lower():
                return False
            left += 1
            right -= 1
        return True
\`\`\`

## JavaScript 实现

\`\`\`javascript
var isPalindrome = function(s) {
    // 双指针 + 边走边过滤
    let left = 0;
    let right = s.length - 1;
    while (left < right) {
        // 跳过左端非字母数字
        while (left < right && !/[a-zA-Z0-9]/.test(s[left])) {
            left++;
        }
        // 跳过右端非字母数字
        while (left < right && !/[a-zA-Z0-9]/.test(s[right])) {
            right--;
        }
        // 统一小写后比较
        if (s[left].toLowerCase() !== s[right].toLowerCase()) {
            return false;
        }
        left++;
        right--;
    }
    return true;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，每个字符最多被访问一次。
- 空间复杂度：O(1)，只用了两个指针。

## 拓展

- **变体**：#680 验证回文串 II（允许删除最多一个字符）——遇到不匹配时尝试跳过左或右，分别递归判断。
- **相关题目**：#5 最长回文子串、#9 回文数（数字版的回文判定）。
- **面试追问**：是否可以一次遍历完成？可以，本解法就是 O(n)。是否可以递归？可以但会消耗 O(n) 栈空间，不推荐。
- **优化**：JS 中用正则每次 \`test\` 略慢，海量数据可用 \`charCodeAt\` 范围判断提速：\`(c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9')\`。`,
  },
  {
    id: 'lc-14',
    group: '字符串处理',
    icon: '📝',
    title: '#242 有效的字母异位词（简单）',
    content: `## 题目

**LeetCode #242 有效的字母异位词** | 难度：简单

给定两个字符串 \`s\` 和 \`t\`，编写一个函数来判断 \`t\` 是否是 \`s\` 的字母异位词。字母异位词指字母相同但排列不同的字符串。假设字符串只包含小写字母。

**示例：**
输入：s = "anagram", t = "nagaram"
输出：true

输入：s = "rat", t = "car"
输出：false

## 思路

"字母异位词"本质就是两个字符串中每个字母出现次数完全相同。判定思路有两种：

1. **排序后比较**：把两个字符串排序后比较是否相等。O(n log n) 时间，O(n) 空间（取决于排序算法）。简单直观，但效率一般。
2. **字符计数**：用长度 26 的数组（因为只有小写字母）记录 \`s\` 中每个字符的出现次数，再遍历 \`t\` 时减一。最后检查数组是否全为 0。O(n) 时间，O(1) 空间（26 个常量）。

最优解是字符计数。可以用一个数组：先对 \`s\` 加、再对 \`t\` 减，最后若全 0 则是异位词。也可以用两个数组分别计数再比较，思路等价但空间略大。

边界情况：
- 长度不同直接返回 \`false\`，省去后续计算。
- 扩展到 Unicode（如汉字）时改用 \`Map\` 即可。

进阶问"输入包含 Unicode 字符怎么办"——用 \`Map\` 替代固定数组，键是字符码点，值是计数。

## Python 实现

\`\`\`python
class Solution:
    def isAnagram(self, s, t):
        # 长度不同直接排除
        if len(s) != len(t):
            return False
        # 26 个字母的计数数组
        count = [0] * 26
        for c in s:
            count[ord(c) - ord('a')] += 1
        for c in t:
            count[ord(c) - ord('a')] -= 1
        # 全为 0 才是字母异位词
        return all(x == 0 for x in count)

    # 进阶：Unicode 版本用 Counter
    def isAnagramUnicode(self, s, t):
        from collections import Counter
        return Counter(s) == Counter(t)
\`\`\`

## JavaScript 实现

\`\`\`javascript
var isAnagram = function(s, t) {
    // 长度不同直接排除
    if (s.length !== t.length) return false;
    // 26 个字母计数数组
    const count = new Array(26).fill(0);
    for (const c of s) {
        count[c.charCodeAt(0) - 'a'.charCodeAt(0)]++;
    }
    for (const c of t) {
        count[c.charCodeAt(0) - 'a'.charCodeAt(0)]--;
    }
    // 全为 0 才是字母异位词
    return count.every(x => x === 0);
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，遍历两个字符串各一次。
- 空间复杂度：O(1)，固定 26 个计数槽位。

## 拓展

- **变体**：#49 字母异位词分组（把所有异位词归到一组）、#438 找到字符串中所有字母异位词（滑动窗口 + 计数比较）。
- **进阶问**：如果数据流式到来、内存放不下怎么办？用哈希表流式计数，但需要先约定字符集大小。
- **面试追问**：为什么不用排序？排序 O(n log n) 比计数 O(n) 慢，且无法处理流式数据。
- **陷阱**：\`ord('a')\` 是 97，记得减基准值；JS 中 \`charCodeAt\` 同理。如果题目扩展为大写字母混合，需要先转小写再计数。`,
  },
  {
    id: 'lc-15',
    group: '字符串处理',
    icon: '📝',
    title: '#14 最长公共前缀（简单）',
    content: `## 题目

**LeetCode #14 最长公共前缀** | 难度：简单

编写一个函数来查找字符串数组中的最长公共前缀。如果不存在公共前缀，返回空字符串 \`""\`。

**示例：**
输入：strs = ["flower","flow","flight"]
输出："fl"

输入：strs = ["dog","racecar","car"]
输出：""
解释：输入不存在公共前缀。

## 思路

公共前缀必须同时出现在所有字符串的开头。有几种主流思路：

1. **纵向扫描**：以第一个字符串为基准，逐列比较所有字符串同一位置的字符。一旦发现不匹配或某字符串已到末尾，返回已收集的前缀。这是最直观的解法。
2. **横向扫描**：先取前两个的公共前缀，再和第三个求公共前缀，依此类推。
3. **分治**：把数组分成两半分别求公共前缀，再合并。
4. **排序后比较首尾**：排序后只需比较第一个和最后一个的公共前缀——因为排序后首尾字符差异最大，它们的公共前缀就是整个数组的公共前缀。这是个聪明的偷懒技巧。

推荐纵向扫描，思路清晰且实现简洁。注意边界：空数组返回 \`""\`；数组只有一个字符串返回它本身。

## Python 实现

\`\`\`python
class Solution:
    def longestCommonPrefix(self, strs):
        if not strs:
            return ""
        # 以第一个字符串为基准
        first = strs[0]
        for i in range(len(first)):
            ch = first[i]
            # 与其它字符串同一位置比较
            for s in strs[1:]:
                # 越界或不匹配就返回已收集部分
                if i >= len(s) or s[i] != ch:
                    return first[:i]
        return first
\`\`\`

## JavaScript 实现

\`\`\`javascript
var longestCommonPrefix = function(strs) {
    if (strs.length === 0) return '';
    // 以第一个字符串为基准
    const first = strs[0];
    for (let i = 0; i < first.length; i++) {
        const ch = first[i];
        // 与其它字符串同一位置比较
        for (let j = 1; j < strs.length; j++) {
            // 越界或不匹配就返回已收集部分
            if (i >= strs[j].length || strs[j][i] !== ch) {
                return first.slice(0, i);
            }
        }
    }
    return first;
};
\`\`\`

## 复杂度

- 时间复杂度：O(m × n)，m 是字符串平均长度，n 是字符串数量。最坏情况所有字符串相同，每个字符都被比较 n 次。
- 空间复杂度：O(1)，不计输出，只用常量额外空间。

## 拓展

- **相关题目**：最长公共后缀（反转字符串后套用本解法）、最长公共子串（DP，复杂得多）。
- **面试追问**：如果数据量极大、字符串极长怎么办？分治或并行处理；二分长度也可以。
- **排序首尾技巧**：\`strs.sort(); return commonPrefix(strs[0], strs[strs.length-1])\`，排序 O(n log n × L) 但实现极简，适合面试快速写。
- **陷阱**：基准字符串可能是最短的（被其它字符串"截断"），代码中 \`i >= len(s)\` 的判断正是为此准备，不能省。`,
  },
  {
    id: 'lc-16',
    group: '字符串处理',
    icon: '📝',
    title: '#28 找出字符串中第一个匹配项的下标（简单）',
    content: `## 题目

**LeetCode #28 找出字符串中第一个匹配项的下标** | 难度：简单

给你两个字符串 \`haystack\` 和 \`needle\`，请你在 \`haystack\` 字符串中找出 \`needle\` 字符串的第一个匹配项的下标（下标从 0 开始）。如果 \`needle\` 不是 \`haystack\` 的一部分，则返回 \`-1\`。

**示例：**
输入：haystack = "sadbutsad", needle = "sad"
输出：0
解释："sad" 在下标 0 和 6 处匹配，返回第一个 0。

输入：haystack = "leetcode", needle = "leeto"
输出：-1

## 思路

这是经典的字符串匹配题。有几种解法：

1. **暴力匹配（BF）**：从 \`haystack\` 的每个起点 \`i\` 开始，尝试和 \`needle\` 逐字符比较，匹配失败就回退到下一个起点。最坏 O(m × n)，但实现简单，能通过本题。
2. **KMP 算法**：通过预处理 \`needle\` 构造 next 数组，利用已匹配信息避免主串指针回退。O(m + n) 时间，O(n) 空间。是面试高频考点。
3. **Sunday 算法 / Boyer-Moore**：从右往左匹配，利用坏字符规则跳过更多位置，平均性能更好。

面试中通常推荐先写暴力（保底），再口述 KMP 思路展示进阶。本题给出暴力实现，并在拓展中介绍 KMP 核心思想。

暴力算法：外层 \`i\` 从 0 遍历到 \`m - n\`，内层 \`j\` 从 0 遍历比较 \`haystack[i+j]\` 与 \`needle[j]\`，若全程相等则返回 \`i\`。

## Python 实现

\`\`\`python
class Solution:
    def strStr(self, haystack, needle):
        # 边界：空 needle 视为匹配在 0
        if not needle:
            return 0
        m, n = len(haystack), len(needle)
        # 暴力匹配
        for i in range(m - n + 1):
            j = 0
            while j < n and haystack[i + j] == needle[j]:
                j += 1
            # 完全匹配则返回起点
            if j == n:
                return i
        return -1
\`\`\`

## JavaScript 实现

\`\`\`javascript
var strStr = function(haystack, needle) {
    // 边界：空 needle 返回 0
    if (needle.length === 0) return 0;
    const m = haystack.length, n = needle.length;
    // 暴力匹配
    for (let i = 0; i <= m - n; i++) {
        let j = 0;
        while (j < n && haystack[i + j] === needle[j]) {
            j++;
        }
        // 完全匹配则返回起点
        if (j === n) return i;
    }
    return -1;
};
\`\`\`

## 复杂度

- 时间复杂度：O(m × n)，最坏情况每个起点都要比较 n 次。
- 空间复杂度：O(1)，暴力版本只用了几个变量。

## 拓展

- **KMP 算法**：核心是构造 \`next\` 数组（也叫 failure function），记录模式串每个位置的最长公共前后缀长度。匹配时若失配，模式串指针跳到 \`next[j-1]\` 而不是 0，主串指针不回退。整体 O(m + n)。
- **next 数组构造**：用双指针 j=0、i=1，比较 \`needle[i]\` 与 \`needle[j]\`，相等则 \`next[i] = j+1\`，否则回退 j。
- **面试追问**：KMP 的 next 数组怎么构造？为什么 KMP 是线性时间？主串指针为何不回退？
- **工程实践**：JS / Python 的内置 \`indexOf\`、\`find\` 通常用优化过的字符串匹配算法（如 Two-Way），生产代码直接调用即可，面试才需要手写。
- **相关题目**：#459 重复的子字符串（用 KMP 判断周期性）、#214 最短回文串。`,
  },
  {
    id: 'lc-17',
    group: '字符串处理',
    icon: '📝',
    title: '#58 最后一个单词的长度（简单）',
    content: `## 题目

**LeetCode #58 最后一个单词的长度** | 难度：简单

给定一个由若干单词组成的字符串 \`s\`，单词之间用空格隔开。返回字符串中最后一个单词的长度。如果不存在最后一个单词，请返回 0。单词是指仅由字母组成、不包含任何空格字符的子串。

**示例：**
输入：s = "Hello World"
输出：5
解释：最后一个单词是 "World"，长度为 5。

输入：s = "   fly me   to   the moon  "
输出：4
解释：最后一个单词是 "moon"，长度为 4。

## 思路

最直观的解法是 \`s.trim().split(' ').pop().length\`，但需要 O(n) 额外空间。原地解法是**从后往前遍历**，先跳过末尾空格，再数最后一个单词的字符数。

算法流程：
1. 从字符串末尾开始向前扫描。
2. 先跳过所有尾部空格（找到最后一个单词的末尾）。
3. 然后继续向前数非空格字符，直到遇到空格或到达字符串开头。
4. 返回数到的字符数。

这种"反向扫描 + 双阶段（先跳过空格、再数单词）"思路简单但容易写错——常错点是忘记处理尾部空格、循环条件边界。

时间 O(n)，空间 O(1)。如果允许用内置函数，一行搞定但浪费空间且体现不出算法思维。

## Python 实现

\`\`\`python
class Solution:
    def lengthOfLastWord(self, s):
        n = len(s)
        i = n - 1
        # 第一步：跳过尾部空格
        while i >= 0 and s[i] == ' ':
            i -= 1
        # 第二步：数最后一个单词的字符
        length = 0
        while i >= 0 and s[i] != ' ':
            length += 1
            i -= 1
        return length

    # 一行版本（仅作对比，不推荐面试用）
    def lengthOfLastWordOneLine(self, s):
        return len(s.rstrip().split(' ')[-1])
\`\`\`

## JavaScript 实现

\`\`\`javascript
var lengthOfLastWord = function(s) {
    let i = s.length - 1;
    // 第一步：跳过尾部空格
    while (i >= 0 && s[i] === ' ') {
        i--;
    }
    // 第二步：数最后一个单词的字符
    let length = 0;
    while (i >= 0 && s[i] !== ' ') {
        length++;
        i--;
    }
    return length;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，最坏遍历整个字符串一次。
- 空间复杂度：O(1)，原地操作，只用几个变量。

## 拓展

- **变体**：第一个单词的长度（正向扫描）、所有单词的列表（split 实现）。
- **面试追问**：为什么不用 \`split\`？它需要 O(n) 额外空间存所有单词，反向扫描只 O(1)；海量数据时差距明显。
- **相关题目**：#557 反转字符串中的单词 III、#151 反转字符串中的单词（按单词整体反转）。
- **陷阱**：字符串全空格时返回 0；末尾没有空格时第一个 while 直接跳过，要保证逻辑正确。
- **工程意义**：处理日志、CSV 末尾字段时常用反向扫描，因为最后一项往往是关注焦点。`,
  },
  {
    id: 'lc-18',
    group: '字符串处理',
    icon: '📝',
    title: '#3 无重复字符的最长子串（中等）',
    content: `## 题目

**LeetCode #3 无重复字符的最长子串** | 难度：中等

给定一个字符串 \`s\`，请你找出其中不含有重复字符的**最长子串**的长度。子串是字符串中连续的字符序列。

**示例：**
输入：s = "abcabcbb"
输出：3
解释：最长无重复子串是 "abc"，长度为 3。

输入：s = "pwwkew"
输出：3
解释：最长无重复子串是 "wke"，长度为 3。（注意答案必须是子串长度，"pwke" 是子序列不是子串）

## 思路

这是**滑动窗口**的经典入门题。子串要求连续，让我们想到维护一个"窗口"\`[left, right]\`，让窗口内始终无重复字符，过程中记录最大窗口长度。

关键问题：当 \`right\` 向右扩展遇到重复字符时怎么办？需要把 \`left\` 移动到"上次出现位置 + 1"，从而把重复字符排除出窗口。

用哈希表记录每个字符最近一次出现的下标。流程：
1. \`left = 0\`、\`max_len = 0\`、\`map = {}\` 记录字符到下标。
2. \`right\` 从 0 遍历到末尾：
   - 若 \`s[right]\` 已在 map 中且 \`map[s[right]] >= left\`，说明在当前窗口内有重复，把 \`left\` 跳到 \`map[s[right]] + 1\`。
   - 更新 \`map[s[right]] = right\`。
   - 更新 \`max_len = max(max_len, right - left + 1)\`。
3. 返回 \`max_len\`。

注意 \`map[s[right]] >= left\` 这个判断——只在"上次出现仍在窗口内"时才移动 left，避免被窗口外的历史记录误导。

时间 O(n)，空间 O(min(m, n))（m 是字符集大小）。

## Python 实现

\`\`\`python
class Solution:
    def lengthOfLongestSubstring(self, s):
        # map 记录字符最近下标
        char_index = {}
        left = 0
        max_len = 0
        for right, ch in enumerate(s):
            # 字符已出现且仍在窗口内，移动左边界
            if ch in char_index and char_index[ch] >= left:
                left = char_index[ch] + 1
            # 更新字符最近下标
            char_index[ch] = right
            # 更新最大长度
            max_len = max(max_len, right - left + 1)
        return max_len
\`\`\`

## JavaScript 实现

\`\`\`javascript
var lengthOfLongestSubstring = function(s) {
    // map 记录字符最近下标
    const charIndex = new Map();
    let left = 0;
    let maxLen = 0;
    for (let right = 0; right < s.length; right++) {
        const ch = s[right];
        // 字符已出现且仍在窗口内，移动左边界
        if (charIndex.has(ch) && charIndex.get(ch) >= left) {
            left = charIndex.get(ch) + 1;
        }
        // 更新字符最近下标
        charIndex.set(ch, right);
        // 更新最大长度
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，左右指针各最多遍历一次。
- 空间复杂度：O(min(m, n))，m 是字符集大小（如 ASCII 128、Unicode 更大），最坏情况窗口覆盖整个字符集。

## 拓展

- **变体**：#159 至多包含两个不同字符的最长子串、#340 至多包含 k 个不同字符的最长子串、#424 替换后的最长重复字符子串。
- **滑动窗口模板**：本题是"窗口内维护无重复"的代表；另一种模板是"窗口内维护计数 ≤ k"，思路相通。
- **面试追问**：为什么用 \`Map\` 而不是 \`Set\`？因为需要知道重复字符的下标来移动 left，Set 只能判断存在不能查位置。
- **陷阱**：忘记判断 \`map[ch] >= left\`——若上次出现已经在窗口外（如 "tmmzuxt" 中第二个 t），不应回退 left。
- **扩展到字符集**：如果只处理小写字母，可以用长度 26 的数组替代 Map 提速。`,
  },
  {
    id: 'lc-19',
    group: '字符串处理',
    icon: '📝',
    title: '#5 最长回文子串（中等）',
    content: `## 题目

**LeetCode #5 最长回文子串** | 难度：中等

给定一个字符串 \`s\`，找到 \`s\` 中最长的回文子串。子串是字符串中连续的字符序列。

**示例：**
输入：s = "babad"
输出："bab"
解释："aba" 同样是有效答案。

输入：s = "cbbd"
输出："bb"

## 思路

回文串的特点是"从中心向两端对称展开"。最长回文子串的主流解法：

1. **中心扩展法**：枚举每个可能的中心，向两端扩展直到失配。回文中心有奇数（单字符中心）和偶数（双字符中心）两种情况。O(n²) 时间，O(1) 空间。实现简单，面试首选。
2. **动态规划**：\`dp[i][j]\` 表示 \`s[i..j]\` 是否为回文。O(n²) 时间和空间。代码稍长但思路清晰。
3. **Manacher 算法**：线性 O(n)，但实现复杂、面试极少要求。

推荐中心扩展法。关键点：枚举中心时分别考虑"奇数长度"（中心是单个字符）和"偶数长度"（中心是两个相邻字符），取扩展更长的那个。

辅助函数 \`expand(s, left, right)\`：从 \`left, right\` 向两端扩展，返回最长回文子串的起止下标。主循环遍历每个 i，分别调用 \`expand(i, i)\` 和 \`expand(i, i+1)\`，比较记录最长。

## Python 实现

\`\`\`python
class Solution:
    def longestPalindrome(self, s):
        if not s:
            return ""
        start, end = 0, 0  # 记录最长回文的起止
        for i in range(len(s)):
            # 奇数长度中心
            len1 = self.expand(s, i, i)
            # 偶数长度中心
            len2 = self.expand(s, i, i + 1)
            cur_len = max(len1, len2)
            # 更新最长回文位置
            if cur_len > end - start:
                start = i - (cur_len - 1) // 2
                end = i + cur_len // 2
        return s[start:end + 1]

    def expand(self, s, left, right):
        # 从中心向两端扩展，返回回文长度
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        # 注意循环结束时 left/right 已越界，实际回文长度是 (right - left - 1)
        return right - left - 1
\`\`\`

## JavaScript 实现

\`\`\`javascript
var longestPalindrome = function(s) {
    if (s.length === 0) return '';
    let start = 0, end = 0;  // 记录最长回文的起止
    for (let i = 0; i < s.length; i++) {
        // 奇数长度中心
        const len1 = expand(s, i, i);
        // 偶数长度中心
        const len2 = expand(s, i, i + 1);
        const curLen = Math.max(len1, len2);
        // 更新最长回文位置
        if (curLen > end - start) {
            start = i - Math.floor((curLen - 1) / 2);
            end = i + Math.floor(curLen / 2);
        }
    }
    return s.slice(start, end + 1);
};

// 从中心向两端扩展，返回回文长度
function expand(s, left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
        left--;
        right++;
    }
    // 注意循环结束时 left/right 已越界，实际回文长度是 (right - left - 1)
    return right - left - 1;
}
\`\`\`

## 复杂度

- 时间复杂度：O(n²)，每个中心最多扩展 O(n) 次，共 2n-1 个中心。
- 空间复杂度：O(1)，只用了几个变量。

## 拓展

- **变体**：#647 回文子串（统计有多少个回文子串，同中心扩展思路）、#131 分割回文串（DFS + 回文判定）、#132 分割回文串 II（DP + 回文判定）。
- **DP 解法**：\`dp[i][j] = (s[i] == s[j]) && (j - i < 2 || dp[i+1][j-1])\`，按长度递推。O(n²) 时间和空间。
- **Manacher 算法**：通过插入特殊字符统一奇偶长度，利用回文的对称性 O(n) 求解。理解门槛高，面试通常不要求手写。
- **面试追问**：为什么奇偶中心都要试？因为 "bb" 这种偶数长度的回文没有单字符中心。
- **陷阱**：\`start = i - (cur_len - 1) // 2\` 的推导要算清楚——以 i 为中心，长度 cur_len 向左占 \`cur_len // 2\`，向右占 \`(cur_len - 1) // 2\`，反过来推 start。`,
  },
  {
    id: 'lc-20',
    group: '字符串处理',
    icon: '📝',
    title: '#6 Z 字形变换（中等）',
    content: `## 题目

**LeetCode #6 Z 字形变换** | 难度：中等

将一个给定字符串 \`s\` 根据给定的行数 \`numRows\` 以从上往下、从左到右进行 Z 字形排列（实际是 N 字形）。比如输入 \`s = "PAYPALISHIRING", numRows = 3\`，排列如下：

\`\`\`
P   A   H   N
A P L S I I G
Y   I   R
\`\`\`

然后按行输出："PAHNAPLSIIGYIR"。

**示例：**
输入：s = "PAYPALISHIRING", numRows = 3
输出："PAHNAPLSIIGYIR"

输入：s = "PAYPALISHIRING", numRows = 4
输出："PINALSIGYAHRPI"

## 思路

关键观察：字符在行间来回走，先向下到底，再斜向上到顶，循环往复。用一个变量 \`cur_row\` 跟踪当前字符所在的行，一个方向标志 \`going_down\` 控制走向——到顶（\`cur_row == 0\`）或到底（\`cur_row == numRows - 1\`）时翻转方向。

算法流程：
1. 特殊情况：\`numRows == 1\` 时直接返回原字符串（无需变换）。
2. 建立 \`numRows\` 个字符串（或字符列表）分别代表每一行。
3. 遍历 \`s\` 每个字符：
   - 把字符追加到 \`rows[cur_row]\`。
   - 若 \`cur_row == 0\` 或 \`cur_row == numRows - 1\`，翻转 \`going_down\`。
   - \`cur_row += going_down ? 1 : -1\`。
4. 把所有行拼接起来返回。

注意方向翻转的时机——必须在"已到达边界"时翻转，而不是边界外。也要注意 \`numRows\` 可能大于字符串长度，此时多出来的行是空的，不影响结果。

## Python 实现

\`\`\`python
class Solution:
    def convert(self, s, numRows):
        # 单行直接返回
        if numRows == 1 or numRows >= len(s):
            return s
        # 每行一个列表
        rows = [''] * numRows
        cur_row = 0
        going_down = False
        for ch in s:
            rows[cur_row] += ch
            # 到顶或到底时翻转方向
            if cur_row == 0 or cur_row == numRows - 1:
                going_down = not going_down
            cur_row += 1 if going_down else -1
        # 按行拼接
        return ''.join(rows)
\`\`\`

## JavaScript 实现

\`\`\`javascript
var convert = function(s, numRows) {
    // 单行直接返回
    if (numRows === 1 || numRows >= s.length) return s;
    // 每行一个数组
    const rows = new Array(numRows).fill('').map(() => []);
    let curRow = 0;
    let goingDown = false;
    for (const ch of s) {
        rows[curRow].push(ch);
        // 到顶或到底时翻转方向
        if (curRow === 0 || curRow === numRows - 1) {
            goingDown = !goingDown;
        }
        curRow += goingDown ? 1 : -1;
    }
    // 按行拼接
    return rows.map(row => row.join('')).join('');
};
\`\`\`

## 复杂度

- 时间复杂度：O(n)，n 为字符串长度，遍历一次，拼接操作 O(n)。
- 空间复杂度：O(n)，需要 O(n) 空间存储所有行的字符。

## 拓展

- **规律法**：可以不模拟，直接按行计算下标。第 0 行和第 numRows-1 行字符间隔为 \`2 * (numRows - 1)\`；中间行每周期内有两个字符，间隔交替为 \`2 * (numRows - 1 - i)\` 和 \`2 * i\`。O(n) 时间、O(1) 额外空间。实现稍复杂但更优。
- **变体**：把字符按不同形状（矩形、对角线、三角形）排列，思路类似——跟踪位置和方向。
- **面试追问**：为什么 \`numRows == 1\` 要特判？因为方向翻转逻辑依赖 \`numRows - 1\`，等于 1 时边界重合会导致死循环。
- **陷阱**：\`going_down\` 初始为 \`false\`（向上），但第一次循环时 \`cur_row == 0\` 会立即翻转为 \`true\`（向下），逻辑自洽；若初始为 \`true\` 也能工作但需保持一致。
- **工程意义**：模拟法适合理解题意和写代码；规律法适合追求常数空间优化的场景。`,
  },
];
