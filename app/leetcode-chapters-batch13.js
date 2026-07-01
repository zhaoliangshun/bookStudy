// =============================================================
// LeetCode 面试算法 200 题 - 第十三批章节（堆与优先队列，共 10 题）
// 章节 lc-121 ~ lc-130：第 K 大 / 第 K 小 / 中位数 / 合并 K 链表等
// Python 用 heapq，JS 手写 MinHeap/MaxHeap 或用排序替代
// =============================================================

export const chapters = [
  // =============================================================
  // lc-121 #215 数组中的第K个最大元素
  // =============================================================
  {
    id: "lc-121",
    group: "堆与优先队列",
    icon: "⛰️",
    title: "#215 数组中的第 K 个最大元素（中等）",
    content: `## 题目

**LeetCode #215 数组中的第 K 个最大元素** | 难度：中等

给定整数数组 \`nums\` 和整数 \`k\`，请返回数组中第 \`k\` 个最大的元素（注意是排序后的第 \`k\` 大，不是第 \`k\` 个不同元素）。

示例：

\`\`\`
输入：nums = [3,2,1,5,6,4], k = 2
输出：5

输入：nums = [3,2,3,1,2,4,5,5,6], k = 4
输出：4
\`\`\`

## 思路

求「第 K 大」是堆最经典的应用。两种主流解法：

1. **小顶堆（推荐）**：维护一个大小为 \`k\` 的**小顶堆**。遍历数组，比堆顶大就入堆，堆大小超过 \`k\` 就弹出堆顶（最小值）。遍历结束后，堆顶就是第 \`k\` 大元素。这样只保留了前 \`k\` 个较大值，堆顶即门槛。
2. **快速选择（Quickselect）**：借鉴快排的 partition，每次根据枢轴位置决定递归左半还是右半，平均 O(n)。最坏 O(n^2)，随机化枢轴可规避。

堆解法适合「数据流」「海量数据」场景；快选适合静态数组且要求 O(n) 平均。本题重点掌握小顶堆维护窗口大小为 k 的技巧。

## Python 实现

\`\`\`python
import heapq

class Solution:
    def findKthLargest(self, nums, k):
        # 维护大小为 k 的小顶堆
        min_heap = []
        for num in nums:
            heapq.heappush(min_heap, num)
            if len(min_heap) > k:
                heapq.heappop(min_heap)  # 弹出最小的，留下前 k 大
        return min_heap[0]  # 堆顶即第 k 大
\`\`\`

## JavaScript 实现

\`\`\`javascript
// JS 没有内置堆，手写小顶堆
class MinHeap {
    constructor() { this.heap = []; }
    size() { return this.heap.length; }
    peek() { return this.heap[0]; }
    push(val) {
        this.heap.push(val);
        this._siftUp(this.heap.length - 1);
    }
    pop() {
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length) {
            this.heap[0] = last;
            this._siftDown(0);
        }
        return top;
    }
    _siftUp(i) {
        while (i > 0) {
            const p = (i - 1) >> 1;
            if (this.heap[p] <= this.heap[i]) break;
            [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
            i = p;
        }
    }
    _siftDown(i) {
        const n = this.heap.length;
        while (true) {
            const l = 2 * i + 1, r = 2 * i + 2;
            let smallest = i;
            if (l < n && this.heap[l] < this.heap[smallest]) smallest = l;
            if (r < n && this.heap[r] < this.heap[smallest]) smallest = r;
            if (smallest === i) break;
            [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
            i = smallest;
        }
    }
}

var findKthLargest = function(nums, k) {
    const heap = new MinHeap();
    for (const num of nums) {
        heap.push(num);
        if (heap.size() > k) heap.pop();  // 弹出最小，留下前 k 大
    }
    return heap.peek();  // 堆顶即第 k 大
};
\`\`\`

## 复杂度

- 时间复杂度：O(n log k)，每个元素入堆一次，堆操作 O(log k)
- 空间复杂度：O(k)，堆大小为 k

## 拓展

- 快速选择解法平均 O(n)，面试可作进阶回答，注意随机化枢轴避免最坏情况。
- 海量数据求 Top K：内存放不下时用大小为 k 的堆逐批处理，是分布式场景的标准做法。
- 相关：#703 数据流第 K 大、#347 前 K 高频元素，都是同一套「维护 k 大小堆」模板。`
  },

  // =============================================================
  // lc-122 #703 数据流中的第K大元素
  // =============================================================
  {
    id: "lc-122",
    group: "堆与优先队列",
    icon: "⛰️",
    title: "#703 数据流中的第 K 大元素（简单）",
    content: `## 题目

**LeetCode #703 数据流中的第 K 大元素** | 难度：简单

设计一个类 \`KthLargest\`，在初始化时传入整数 \`k\` 和整数数组 \`nums\`。实现 \`add(val)\` 方法：将 \`val\` 插入数据流后，返回当前数据流中第 \`k\` 大的元素。

示例：

\`\`\`
输入：k = 3, nums = [4,5,8,2]
add(3) -> 4
add(5) -> 5
add(10) -> 8
add(9) -> 8
\`\`\`

## 思路

这是 #215 的「流式」版本。核心是维护一个大小为 \`k\` 的**小顶堆**：

1. 初始化时把 \`nums\` 中所有元素入堆，超过 \`k\` 个就弹出最小的，最终堆里保留前 \`k\` 大。
2. \`add(val)\` 时：先把 \`val\` 入堆，若堆大小超过 \`k\` 就弹出堆顶。堆顶就是第 \`k\` 大。

堆顶始终是当前前 \`k\` 大中最小的那个，正好是第 \`k\` 大。新增元素只需 O(log k)，比每次重新排序高效得多。

注意边界：初始化时若 \`nums\` 元素不足 \`k\` 个，堆不会强制弹出，\`add\` 后元素够了才生效。

## Python 实现

\`\`\`python
import heapq

class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.heap = []
        for num in nums:
            heapq.heappush(self.heap, num)
            if len(self.heap) > k:
                heapq.heappop(self.heap)

    def add(self, val):
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        return self.heap[0]  # 堆顶即第 k 大
\`\`\`

## JavaScript 实现

\`\`\`javascript
// 手写小顶堆
class MinHeap {
    constructor() { this.heap = []; }
    size() { return this.heap.length; }
    peek() { return this.heap[0]; }
    push(val) {
        this.heap.push(val);
        this._siftUp(this.heap.length - 1);
    }
    pop() {
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length) {
            this.heap[0] = last;
            this._siftDown(0);
        }
        return top;
    }
    _siftUp(i) {
        while (i > 0) {
            const p = (i - 1) >> 1;
            if (this.heap[p] <= this.heap[i]) break;
            [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
            i = p;
        }
    }
    _siftDown(i) {
        const n = this.heap.length;
        while (true) {
            const l = 2 * i + 1, r = 2 * i + 2;
            let s = i;
            if (l < n && this.heap[l] < this.heap[s]) s = l;
            if (r < n && this.heap[r] < this.heap[s]) s = r;
            if (s === i) break;
            [this.heap[s], this.heap[i]] = [this.heap[i], this.heap[s]];
            i = s;
        }
    }
}

var KthLargest = function(k, nums) {
    this.k = k;
    this.heap = new MinHeap();
    for (const num of nums) {
        this.heap.push(num);
        if (this.heap.size() > k) this.heap.pop();
    }
};

KthLargest.prototype.add = function(val) {
    this.heap.push(val);
    if (this.heap.size() > this.k) this.heap.pop();
    return this.heap.peek();  // 堆顶即第 k 大
};
\`\`\`

## 复杂度

- 时间复杂度：构造 O(n log k)，每次 add O(log k)
- 空间复杂度：O(k)，堆大小为 k

## 拓展

- 这就是经典的「Top K 问题」在线版，实时数据流监控高频值常用此结构。
- 若要求「第 k 小」，则改用大顶堆维护前 k 小。
- 相关：#215 第 K 大、#295 数据流中位数，都是堆维护数据流的代表。`
  },

  // =============================================================
  // lc-123 #1046 最后一块石头的重量
  // =============================================================
  {
    id: "lc-123",
    group: "堆与优先队列",
    icon: "⛰️",
    title: "#1046 最后一块石头的重量（简单）",
    content: `## 题目

**LeetCode #1046 最后一块石头的重量** | 难度：简单

有一堆石头，每块石头重量为正整数。每一回合选出**最重的两块**石头 \`x\` 和 \`y\`（x <= y）：

- 若 \`x == y\`，两块都粉碎；
- 若 \`x != y\`，重量为 \`x\` 的石头粉碎，\`y\` 变成 \`y - x\`。

返回最后剩下石头的重量，没有石头剩余返回 0。

示例：

\`\`\`
输入：[2,7,4,1,8,1]
输出：1
解释：8 和 7 碰 -> 1；2 和 4 碰 -> 2；2 和 1 碰 -> 1；1 和 1 碰 -> 0；剩 1
\`\`\`

## 思路

每回合都要取「当前最大」的两块，反复取最大值正是**大顶堆**的拿手好戏。

1. 把所有石头放入大顶堆。
2. 当堆中元素个数 >= 2：弹出两个最大的 \`y\`、\`x\`；若 \`y > x\`，把 \`y - x\` 重新入堆。
3. 循环结束，若堆空返回 0，否则返回堆顶。

Python 的 \`heapq\` 只有小顶堆，所以存**负值**来模拟大顶堆（取负后最小即原最大）。JS 需手写大顶堆，或用排序模拟（每轮 O(n log n)，数据小时可接受，但堆更优 O(n log n) 总体常数更小）。

## Python 实现

\`\`\`python
import heapq

class Solution:
    def lastStoneWeight(self, stones):
        # 存负值模拟大顶堆
        heap = [-s for s in stones]
        heapq.heapify(heap)
        while len(heap) >= 2:
            y = -heapq.heappop(heap)  # 最大
            x = -heapq.heappop(heap)  # 次大
            if y > x:
                heapq.heappush(heap, -(y - x))
        return -heap[0] if heap else 0
\`\`\`

## JavaScript 实现

\`\`\`javascript
// 手写大顶堆
class MaxHeap {
    constructor() { this.heap = []; }
    size() { return this.heap.length; }
    peek() { return this.heap[0]; }
    push(val) {
        this.heap.push(val);
        this._siftUp(this.heap.length - 1);
    }
    pop() {
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length) {
            this.heap[0] = last;
            this._siftDown(0);
        }
        return top;
    }
    _siftUp(i) {
        while (i > 0) {
            const p = (i - 1) >> 1;
            if (this.heap[p] >= this.heap[i]) break;
            [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
            i = p;
        }
    }
    _siftDown(i) {
        const n = this.heap.length;
        while (true) {
            const l = 2 * i + 1, r = 2 * i + 2;
            let s = i;
            if (l < n && this.heap[l] > this.heap[s]) s = l;
            if (r < n && this.heap[r] > this.heap[s]) s = r;
            if (s === i) break;
            [this.heap[s], this.heap[i]] = [this.heap[i], this.heap[s]];
            i = s;
        }
    }
}

var lastStoneWeight = function(stones) {
    const heap = new MaxHeap();
    for (const s of stones) heap.push(s);
    while (heap.size() >= 2) {
        const y = heap.pop();  // 最大
        const x = heap.pop();  // 次大
        if (y > x) heap.push(y - x);
    }
    return heap.size() ? heap.peek() : 0;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n log n)，至多 n 轮，每轮堆操作 O(log n)
- 空间复杂度：O(n)，堆存储所有石头

## 拓展

- Python 用「取负 + 小顶堆」模拟大顶堆是非常常见的技巧，务必掌握。
- 若每轮粉碎后剩余石头有优先级排序需求，堆比反复排序更高效。
- 相关：#215、#703 同属堆基础题，先掌握这些再进阶中位数、合并 K 链表。`
  },

  // =============================================================
  // lc-124 #313 超级丑数
  // =============================================================
  {
    id: "lc-124",
    group: "堆与优先队列",
    icon: "⛰️",
    title: "#313 超级丑数（中等）",
    content: `## 题目

**LeetCode #313 超级丑数** | 难度：中等

超级丑数是正整数，且所有质因数都在给定质数数组 \`primes\` 中。给定整数 \`n\` 和质数数组 \`primes\`，返回第 \`n\` 个超级丑数（从 1 开始，1 视为超级丑数）。

示例：

\`\`\`
输入：n = 12, primes = [2,7,13,19]
输出：32
解释：前 12 个为 [1,2,4,7,8,13,14,16,19,26,28,32]
\`\`\`

## 思路

这是 #264 丑数 II 的推广版（#264 的 primes 固定为 [2,3,5]）。核心思想是**多路归并 + 小顶堆**或**指针归并**。

**指针归并法（推荐，O(nk)）**：

1. \`ugly[i]\` 表示第 i+1 个丑数，\`ugly[0] = 1\`。
2. 为每个质数 \`primes[j]\` 维护一个指针 \`p[j]\`，表示该质数下一个要乘的丑数位置。
3. 下一个候选 = \`min(ugly[p[j]] * primes[j])\`，取最小者作为新丑数。
4. 更新指针：凡是产生该最小值的 \`p[j]\` 都 +1（去重关键，多个质数可能同时产生相同值）。

堆法更直观但常数大、易重复：每次弹出最小候选，加入其乘积，并用集合去重。指针法空间更优且无需去重集合。

注意：去重必须让所有等于最小值的指针都前进，否则会重复入列。

## Python 实现

\`\`\`python
class Solution:
    def nthSuperUglyNumber(self, n, primes):
        k = len(primes)
        ugly = [1]
        # pointers[j] 表示 primes[j] 待乘的丑数下标
        pointers = [0] * k
        for _ in range(1, n):
            # 计算各质数产生的候选
            candidates = [ugly[pointers[j]] * primes[j] for j in range(k)]
            nxt = min(candidates)
            ugly.append(nxt)
            # 所有产生最小值的指针都前进，去重
            for j in range(k):
                if candidates[j] == nxt:
                    pointers[j] += 1
        return ugly[-1]
\`\`\`

## JavaScript 实现

\`\`\`javascript
var nthSuperUglyNumber = function(n, primes) {
    const k = primes.length;
    const ugly = [1];
    const pointers = new Array(k).fill(0);  // 各质数待乘的丑数下标
    for (let i = 1; i < n; i++) {
        // 计算各质数产生的候选
        let nxt = Infinity;
        const candidates = [];
        for (let j = 0; j < k; j++) {
            const c = ugly[pointers[j]] * primes[j];
            candidates.push(c);
            if (c < nxt) nxt = c;
        }
        ugly.push(nxt);
        // 所有产生最小值的指针都前进，去重
        for (let j = 0; j < k; j++) {
            if (candidates[j] === nxt) pointers[j]++;
        }
    }
    return ugly[n - 1];
};
\`\`\`

## 复杂度

- 时间复杂度：O(nk)，每轮遍历 k 个质数计算候选
- 空间复杂度：O(n + k)，ugly 数组与指针数组

## 拓展

- 堆解法：用小顶堆存候选，每次弹出最小并补入，配合 Set 去重，复杂度 O(n log k)。
- #264 丑数 II 是本题 primes=[2,3,5] 的特例，先做 #264 再做本题更顺畅。
- 优化：候选可缓存避免重复乘，本题 n 较小时差异不大。`
  },

  // =============================================================
  // lc-125 #373 查找和最小的K对数字
  // =============================================================
  {
    id: "lc-125",
    group: "堆与优先队列",
    icon: "⛰️",
    title: "#373 查找和最小的 K 对数字（中等）",
    content: `## 题目

**LeetCode #373 查找和最小的 K 对数字** | 难度：中等

给定两个升序整数数组 \`nums1\` 和 \`nums2\`，以及整数 \`k\`。定义和为 \`(u, v)\` 其中 \`u\` 来自 \`nums1\`，\`v\` 来自 \`nums2\`。返回和最小的前 \`k\` 对 \`(u, v)\`。

示例：

\`\`\`
输入：nums1 = [1,7,11], nums2 = [2,4,6], k = 3
输出：[[1,2],[1,4],[1,6]]

输入：nums1 = [1,1,2], nums2 = [1,2,3], k = 2
输出：[[1,1],[1,1]]
\`\`\`

## 思路

暴力枚举所有 O(mn) 对再排序显然超时。利用两个数组**已升序**的性质，用**小顶堆 + 多路归并**：

1. 因为 \`nums1[0] + nums2[j]\` 是以 \`nums1[0]\` 配对的候选中最小的，把所有 \`(0, j)\`（即 nums1 第 0 个配 nums2 各个）入堆，按和排序。
2. 每次弹出和最小对 \`(i, j)\` 加入答案，然后把 \`(i+1, j)\` 入堆（i+1 仍 < len(nums1)）。
3. 重复 \`k\` 次（或堆空）。

为什么只推 \`(i+1, j)\`？因为 \`(i, j+1)\` 已被 \`(i, 0)\` 那条「行」代表，初始入堆时 \`(i, 0)\` 已覆盖所有行起点。这样每个元素最多入堆一次，避免重复。

这种「以行为单位推进列」是多路归并的通用模板，类似 #23 合并 K 链表。

## Python 实现

\`\`\`python
import heapq

class Solution:
    def kSmallestPairs(self, nums1, nums2, k):
        if not nums1 or not nums2:
            return []
        heap = []
        # 初始：nums1 每个元素配 nums2[0]，用和 + 下标定位
        for i in range(min(len(nums1), k)):
            heapq.heappush(heap, (nums1[i] + nums2[0], i, 0))

        res = []
        while heap and len(res) < k:
            s, i, j = heapq.heappop(heap)
            res.append([nums1[i], nums2[j]])
            if j + 1 < len(nums2):
                # 推进 nums2 的列
                heapq.heappush(heap, (nums1[i] + nums2[j + 1], i, j + 1))
        return res
\`\`\`

## JavaScript 实现

\`\`\`javascript
var kSmallestPairs = function(nums1, nums2, k) {
    if (!nums1.length || !nums2.length) return [];
    // 小顶堆，按和排序，存 [sum, i, j]
    const heap = new MinHeapPair();
    for (let i = 0; i < Math.min(nums1.length, k); i++) {
        heap.push([nums1[i] + nums2[0], i, 0]);
    }
    const res = [];
    while (heap.size() && res.length < k) {
        const [s, i, j] = heap.pop();
        res.push([nums1[i], nums2[j]]);
        if (j + 1 < nums2.length) {
            // 推进 nums2 的列
            heap.push([nums1[i] + nums2[j + 1], i, j + 1]);
        }
    }
    return res;
};

// 按 sum 排序的小顶堆，存三元组 [sum, i, j]
function MinHeapPair() {
    this.heap = [];
}
MinHeapPair.prototype.size = function() { return this.heap.length; };
MinHeapPair.prototype.push = function(node) {
    this.heap.push(node);
    let i = this.heap.length - 1;
    while (i > 0) {
        const p = (i - 1) >> 1;
        if (this.heap[p][0] <= this.heap[i][0]) break;
        [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
        i = p;
    }
};
MinHeapPair.prototype.pop = function() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length) {
        this.heap[0] = last;
        let i = 0, n = this.heap.length;
        while (true) {
            const l = 2 * i + 1, r = 2 * i + 2;
            let s = i;
            if (l < n && this.heap[l][0] < this.heap[s][0]) s = l;
            if (r < n && this.heap[r][0] < this.heap[s][0]) s = r;
            if (s === i) break;
            [this.heap[s], this.heap[i]] = [this.heap[i], this.heap[s]];
            i = s;
        }
    }
    return top;
};
\`\`\`

## 复杂度

- 时间复杂度：O(k log min(n, k))，至多 k 次堆操作
- 空间复杂度：O(min(n, k))，堆大小

## 拓展

- 多路归并思路同样适用于 #23 合并 K 个升序链表、#378 有序矩阵第 K 小。
- 若两数组未排序，可先排序再套用此法，或退化为暴力 + 排序 O(mn log(mn))。
- 注意初始化时只取 nums1 前 min(n, k) 个，因为答案至多 k 对，多余的行用不上。`
  },

  // =============================================================
  // lc-126 #23 合并K个升序链表
  // =============================================================
  {
    id: "lc-126",
    group: "堆与优先队列",
    icon: "⛰️",
    title: "#23 合并 K 个升序链表（困难）",
    content: `## 题目

**LeetCode #23 合并 K 个升序链表** | 难度：困难

给你一个链表数组 \`lists\`，其中每个链表已经按升序排列。请将所有链表合并到一个升序链表中，返回合并后的头节点。

示例：

\`\`\`
输入：lists = [[1,4,5],[1,3,4],[2,6]]
输出：[1,1,2,3,4,4,5,6]
\`\`\`

## 思路

合并两个有序链表是基础（双指针 O(n)），合并 K 个的关键是如何高效选出「当前 K 个头节点中的最小值」。两种主流解法：

1. **小顶堆（推荐）**：把每个链表的头节点入堆（按 val 排序）。每次弹出最小节点接到结果链表尾部，若该节点有 next 则把 next 入堆。重复直到堆空。这样每次取最小 O(log k)，总共 O(N log k)，N 为所有节点数。

2. **分治归并**：两两合并链表，类似归并排序。第 i 轮把相邻两条合并，轮数 log k，每轮遍历所有节点 O(N)，总 O(N log k)。递归写法简洁。

堆法更直观且天然支持「链表长度不均」；分治法常数更小。Python \`heapq\` 存节点对象需注意：节点不可比较时会比较第二个元素，所以存 \`(val, idx, node)\` 三元组，idx 用来打破 tie 避免节点比较报错。

## Python 实现

\`\`\`python
import heapq

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def mergeKLists(self, lists):
        heap = []
        for i, node in enumerate(lists):
            if node:
                heapq.heappush(heap, (node.val, i, node))  # i 打破 tie
        dummy = ListNode(-1)
        cur = dummy
        while heap:
            val, i, node = heapq.heappop(heap)
            cur.next = node
            cur = cur.next
            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))
        return dummy.next
\`\`\`

## JavaScript 实现

\`\`\`javascript
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

var mergeKLists = function(lists) {
    // 按 val 排序的小顶堆，存 [val, idx, node]
    const heap = new MinHeapNode();
    for (let i = 0; i < lists.length; i++) {
        if (lists[i]) heap.push([lists[i].val, i, lists[i]]);
    }
    const dummy = new ListNode(-1);
    let cur = dummy;
    while (heap.size()) {
        const [val, i, node] = heap.pop();
        cur.next = node;
        cur = cur.next;
        if (node.next) heap.push([node.next.val, i, node.next]);
    }
    return dummy.next;
};

// 按 val 排序的小顶堆，存 [val, idx, node]
function MinHeapNode() {
    this.heap = [];
}
MinHeapNode.prototype.size = function() { return this.heap.length; };
MinHeapNode.prototype.push = function(node) {
    this.heap.push(node);
    let i = this.heap.length - 1;
    while (i > 0) {
        const p = (i - 1) >> 1;
        if (this.heap[p][0] <= this.heap[i][0]) break;
        [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
        i = p;
    }
};
MinHeapNode.prototype.pop = function() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length) {
        this.heap[0] = last;
        let i = 0, n = this.heap.length;
        while (true) {
            const l = 2 * i + 1, r = 2 * i + 2;
            let s = i;
            if (l < n && this.heap[l][0] < this.heap[s][0]) s = l;
            if (r < n && this.heap[r][0] < this.heap[s][0]) s = r;
            if (s === i) break;
            [this.heap[s], this.heap[i]] = [this.heap[i], this.heap[s]];
            i = s;
        }
    }
    return top;
};
\`\`\`

## 复杂度

- 时间复杂度：O(N log k)，N 为所有节点总数，k 为链表数
- 空间复杂度：O(k)，堆大小

## 拓展

- 分治归并解法：递归两两合并，复杂度相同但常数更小，面试可比较优劣。
- 朴素解法：每次线性找最小头 O(Nk)，会超时，不可取。
- 相关：#88 合并两个有序数组/链表是本题 k=2 的基础。`
  },

  // =============================================================
  // lc-127 #451 根据字符出现频率排序
  // =============================================================
  {
    id: "lc-127",
    group: "堆与优先队列",
    icon: "⛰️",
    title: "#451 根据字符出现频率排序（中等）",
    content: `## 题目

**LeetCode #451 根据字符出现频率排序** | 难度：中等

给定一个字符串 \`s\`，将其中的字符按出现频率**降序**排列。频率相同的字符顺序任意。

示例：

\`\`\`
输入：s = "tree"
输出："eert"（或 "eetr"）

输入：s = "Aabb"
输出："bbAa"（或 "BbaA"，区分大小写）
\`\`\`

## 思路

这是一道「统计频次 + 按频次排序」的题，堆或桶排序均可：

1. **统计频次**：遍历字符串用哈希表记录每个字符出现次数。
2. **按频次降序输出**：
   - **堆法**：大顶堆按频次排序，依次弹出并拼接。
   - **桶排序（推荐）**：以频次为下标建桶，把字符放进对应频次桶，从高频到低频遍历桶拼接。桶排序 O(n) 更优，且频次上限为 n。

本题频次范围小（最多 n），桶排序是最佳选择；堆法更通用，适合「频次范围大或只需 Top K」场景。

## Python 实现

\`\`\`python
from collections import Counter

class Solution:
    def frequencySort(self, s):
        # 统计频次
        cnt = Counter(s)
        # 按频次降序排序字符，拼接
        # cnt.most_common() 已按频次降序返回
        parts = []
        for ch, freq in cnt.most_common():
            parts.append(ch * freq)
        return ''.join(parts)
\`\`\`

## JavaScript 实现

\`\`\`javascript
var frequencySort = function(s) {
    // 统计频次
    const cnt = new Map();
    for (const ch of s) {
        cnt.set(ch, (cnt.get(ch) || 0) + 1);
    }
    // 按频次降序排序字符，拼接
    const chars = [...cnt.keys()].sort((a, b) => cnt.get(b) - cnt.get(a));
    let res = '';
    for (const ch of chars) {
        res += ch.repeat(cnt.get(ch));
    }
    return res;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n log m)，m 为不同字符数（桶排序可到 O(n)）
- 空间复杂度：O(n)，结果字符串与哈希表

## 拓展

- 桶排序版本：建立长度 n+1 的桶数组，\`buckets[freq]\` 存该频次字符，从高到低遍历拼接，复杂度 O(n)。
- 若只要求 Top K 高频字符，可用大小为 k 的小顶堆，参见 #347 前 K 高频元素。
- 区分大小写：'A' 和 'a' 是不同字符，注意题目说明。`
  },

  // =============================================================
  // lc-128 #378 有序矩阵中第K小的元素
  // =============================================================
  {
    id: "lc-128",
    group: "堆与优先队列",
    icon: "⛰️",
    title: "#378 有序矩阵中第 K 小的元素（中等）",
    content: `## 题目

**LeetCode #378 有序矩阵中第 K 小的元素** | 难度：中等

给定一个 \`n x n\` 矩阵 \`matrix\`，其中每行和每列元素均按升序排列。返回矩阵中第 \`k\` 小的元素（注意是排序后第 k 小，不是第 k 个不同元素）。

示例：

\`\`\`
输入：matrix = [[1,5,9],[10,11,13],[12,13,15]], k = 8
输出：13
\`\`\`

## 思路

利用「每行升序」的性质，这题和 #373 查找和最小 K 对**同构**——可把每一行看作一个升序链表，问题转化为「合并 K 个升序链表取第 k 小」。

1. **堆 + 多路归并**：把每行第一个元素入小顶堆（存值、行号、列号）。弹出最小即第几小，把该行下一个元素入堆。重复 k 次弹出的就是第 k 小。O(k log n)。

2. **二分（进阶）**：值域二分，对 mid 统计矩阵中 <= mid 的元素个数（利用每行升序从右上角走或二分）。若个数 < k 说明答案 > mid，否则答案 <= mid。O(n log(range))，当 k 很大时优于堆法。

本题重点掌握堆的多路归并；二分法是面试加分项，体现「值域二分 + 计数判定」思维。

## Python 实现

\`\`\`python
import heapq

class Solution:
    def kthSmallest(self, matrix, k):
        n = len(matrix)
        heap = []
        # 每行第一个元素入堆
        for r in range(min(n, k)):
            heapq.heappush(heap, (matrix[r][0], r, 0))
        cnt = 0
        while heap:
            val, r, c = heapq.heappop(heap)
            cnt += 1
            if cnt == k:
                return val
            if c + 1 < n:
                heapq.heappush(heap, (matrix[r][c + 1], r, c + 1))
        return -1
\`\`\`

## JavaScript 实现

\`\`\`javascript
var kthSmallest = function(matrix, k) {
    const n = matrix.length;
    // 小顶堆，存 [val, r, c]
    const heap = new MinHeapTuple();
    for (let r = 0; r < Math.min(n, k); r++) {
        heap.push([matrix[r][0], r, 0]);
    }
    let cnt = 0;
    while (heap.size()) {
        const [val, r, c] = heap.pop();
        cnt++;
        if (cnt === k) return val;
        if (c + 1 < n) heap.push([matrix[r][c + 1], r, c + 1]);
    }
    return -1;
};

// 按 val 排序的小顶堆，存 [val, r, c]
function MinHeapTuple() {
    this.heap = [];
}
MinHeapTuple.prototype.size = function() { return this.heap.length; };
MinHeapTuple.prototype.push = function(node) {
    this.heap.push(node);
    let i = this.heap.length - 1;
    while (i > 0) {
        const p = (i - 1) >> 1;
        if (this.heap[p][0] <= this.heap[i][0]) break;
        [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
        i = p;
    }
};
MinHeapTuple.prototype.pop = function() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length) {
        this.heap[0] = last;
        let i = 0, n = this.heap.length;
        while (true) {
            const l = 2 * i + 1, r = 2 * i + 2;
            let s = i;
            if (l < n && this.heap[l][0] < this.heap[s][0]) s = l;
            if (r < n && this.heap[r][0] < this.heap[s][0]) s = r;
            if (s === i) break;
            [this.heap[s], this.heap[i]] = [this.heap[i], this.heap[s]];
            i = s;
        }
    }
    return top;
};
\`\`\`

## 复杂度

- 时间复杂度：O(k log n)，堆操作 k 次，每次 O(log n)
- 空间复杂度：O(n)，堆大小为行数 n

## 拓展

- 二分解法：值域 [min, max] 二分，用「从右上角出发计数 <= mid 的个数」判定，O(n log(range))。
- 本题与 #373 同构，多路归并模板要熟练。
- 若矩阵每行升序但列无序，则只能每行独立处理或全展开排序。`
  },

  // =============================================================
  // lc-129 #295 数据流的中位数
  // =============================================================
  {
    id: "lc-129",
    group: "堆与优先队列",
    icon: "⛰️",
    title: "#295 数据流的中位数（困难）",
    content: `## 题目

**LeetCode #295 数据流的中位数** | 难度：困难

设计 \`MedianFinder\` 类：\`addNum(num)\` 向数据结构添加整数；\`findMedian()\` 返回当前所有元素的中位数。中位数是排序后中间的数，若长度为偶数则取中间两个的平均值。

示例：

\`\`\`
addNum(1); addNum(2);
findMedian() -> 1.5
addNum(3);
findMedian() -> 2
\`\`\`

## 思路

中位数要求把数据分成「较小的一半」和「较大的一半」，中位数就在两半交界。用**两个堆**维护：

- **大顶堆 \`lo\`**：存较小的一半，堆顶是这半的最大值（即左半的边界）。
- **小顶堆 \`hi\`**：存较大的一半，堆顶是这半的最小值（即右半的边界）。

保持两个性质：
1. \`len(lo) == len(hi)\` 或 \`len(lo) == len(hi) + 1\`（lo 多放一个，奇数时中位数是 lo 堆顶）。
2. \`lo 所有元素 <= hi 所有元素\`（即 lo 堆顶 <= hi 堆顶）。

\`addNum(num)\` 的标准流程（保证上述性质）：
1. 先入 \`lo\`（大顶堆）。
2. 把 \`lo\` 堆顶移到 \`hi\`（保证 lo <= hi）。
3. 若 \`len(hi) > len(lo)\`，把 \`hi\` 堆顶移回 \`lo\`（平衡数量）。

\`findMedian()\`：若两堆长度相等，取两堆顶平均；否则取 lo 堆顶。每次添加 O(log n)，查询 O(1)。

Python \`heapq\` 是小顶堆，\`lo\` 存负值模拟大顶堆。

## Python 实现

\`\`\`python
import heapq

class MedianFinder:
    def __init__(self):
        self.lo = []  # 大顶堆（存负值），较小的一半
        self.hi = []  # 小顶堆，较大的一半

    def addNum(self, num):
        # 先入 lo
        heapq.heappush(self.lo, -num)
        # lo 堆顶移到 hi，保证 lo 元素 <= hi 元素
        heapq.heappush(self.hi, -heapq.heappop(self.lo))
        # 平衡数量：lo 最多比 hi 多一个
        if len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))

    def findMedian(self):
        if len(self.lo) > len(self.hi):
            return -self.lo[0]
        return (-self.lo[0] + self.hi[0]) / 2
\`\`\`

## JavaScript 实现

\`\`\`javascript
// 大顶堆：存较小的一半
function MaxHeap() {
    this.heap = [];
}
MaxHeap.prototype.size = function() { return this.heap.length; };
MaxHeap.prototype.peek = function() { return this.heap[0]; };
MaxHeap.prototype.push = function(val) {
    this.heap.push(val);
    let i = this.heap.length - 1;
    while (i > 0) {
        const p = (i - 1) >> 1;
        if (this.heap[p] >= this.heap[i]) break;
        [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
        i = p;
    }
};
MaxHeap.prototype.pop = function() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length) {
        this.heap[0] = last;
        let i = 0, n = this.heap.length;
        while (true) {
            const l = 2 * i + 1, r = 2 * i + 2;
            let s = i;
            if (l < n && this.heap[l] > this.heap[s]) s = l;
            if (r < n && this.heap[r] > this.heap[s]) s = r;
            if (s === i) break;
            [this.heap[s], this.heap[i]] = [this.heap[i], this.heap[s]];
            i = s;
        }
    }
    return top;
};

// 小顶堆：存较大的一半
function MinHeap() {
    this.heap = [];
}
MinHeap.prototype.size = function() { return this.heap.length; };
MinHeap.prototype.peek = function() { return this.heap[0]; };
MinHeap.prototype.push = function(val) {
    this.heap.push(val);
    let i = this.heap.length - 1;
    while (i > 0) {
        const p = (i - 1) >> 1;
        if (this.heap[p] <= this.heap[i]) break;
        [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
        i = p;
    }
};
MinHeap.prototype.pop = function() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length) {
        this.heap[0] = last;
        let i = 0, n = this.heap.length;
        while (true) {
            const l = 2 * i + 1, r = 2 * i + 2;
            let s = i;
            if (l < n && this.heap[l] < this.heap[s]) s = l;
            if (r < n && this.heap[r] < this.heap[s]) s = r;
            if (s === i) break;
            [this.heap[s], this.heap[i]] = [this.heap[i], this.heap[s]];
            i = s;
        }
    }
    return top;
};

var MedianFinder = function() {
    this.lo = new MaxHeap();  // 较小的一半
    this.hi = new MinHeap();  // 较大的一半
};
MedianFinder.prototype.addNum = function(num) {
    // 先入 lo
    this.lo.push(num);
    // lo 堆顶移到 hi，保证 lo 元素 <= hi 元素
    this.hi.push(this.lo.pop());
    // 平衡数量：lo 最多比 hi 多一个
    if (this.hi.size() > this.lo.size()) {
        this.lo.push(this.hi.pop());
    }
};
MedianFinder.prototype.findMedian = function() {
    if (this.lo.size() > this.hi.size()) return this.lo.peek();
    return (this.lo.peek() + this.hi.peek()) / 2;
};
\`\`\`

## 复杂度

- 时间复杂度：addNum O(log n)，findMedian O(1)
- 空间复杂度：O(n)，两个堆存储所有元素

## 拓展

- 双堆法是「动态中位数」的经典解法，务必熟练。
- 也可用平衡树（如 C++ multiset），但实现更复杂，双堆更通用。
- 相关：#480 滑动窗口中位数是本题的进阶，需要在双堆基础上支持删除（懒删除 + 延迟弹出）。`
  },

  // =============================================================
  // lc-130 #347 前K个高频元素
  // =============================================================
  {
    id: "lc-130",
    group: "堆与优先队列",
    icon: "⛰️",
    title: "#347 前 K 个高频元素（中等）",
    content: `## 题目

**LeetCode #347 前 K 个高频元素** | 难度：中等

给定非空整数数组 \`nums\` 和整数 \`k\`，返回出现频率前 \`k\` 高的元素。答案可按任意顺序返回。

示例：

\`\`\`
输入：nums = [1,1,1,2,2,3], k = 2
输出：[1,2]

输入：nums = [1], k = 1
输出：[1]
\`\`\`

## 思路

经典 Top K 问题，统计频次后选前 k 高。两种解法：

1. **小顶堆（推荐）**：统计频次后，维护大小为 \`k\` 的小顶堆（按频次排序）。遍历每个元素，入堆，超过 k 就弹出频次最小的（堆顶）。最终堆里就是前 k 高频元素。O(n log k)。

2. **桶排序（最优）**：以频次为下标建桶（频次范围 1~n），\`buckets[freq]\` 存该频次的所有元素。从高频到低频遍历桶，收集 k 个元素即可。O(n)。

堆法通用且适合「频次范围大」场景；桶排序利用频次上界 n 的性质做到 O(n)，是本题的最优解。

## Python 实现

\`\`\`python
from collections import Counter
import heapq

class Solution:
    def topKFrequent(self, nums, k):
        cnt = Counter(nums)
        # 维护大小为 k 的小顶堆（按频次）
        heap = []
        for num, freq in cnt.items():
            heapq.heappush(heap, (freq, num))
            if len(heap) > k:
                heapq.heappop(heap)
        return [num for freq, num in heap]
\`\`\`

## JavaScript 实现

\`\`\`javascript
var topKFrequent = function(nums, k) {
    // 统计频次
    const cnt = new Map();
    for (const num of nums) {
        cnt.set(num, (cnt.get(num) || 0) + 1);
    }
    // 维护大小为 k 的小顶堆（按频次），存 [freq, num]
    const heap = new MinHeapPair2();
    for (const [num, freq] of cnt) {
        heap.push([freq, num]);
        if (heap.size() > k) heap.pop();
    }
    const res = [];
    while (heap.size()) {
        res.push(heap.pop()[1]);
    }
    return res;
};

// 按 freq 排序的小顶堆，存 [freq, num]
function MinHeapPair2() {
    this.heap = [];
}
MinHeapPair2.prototype.size = function() { return this.heap.length; };
MinHeapPair2.prototype.push = function(node) {
    this.heap.push(node);
    let i = this.heap.length - 1;
    while (i > 0) {
        const p = (i - 1) >> 1;
        if (this.heap[p][0] <= this.heap[i][0]) break;
        [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
        i = p;
    }
};
MinHeapPair2.prototype.pop = function() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length) {
        this.heap[0] = last;
        let i = 0, n = this.heap.length;
        while (true) {
            const l = 2 * i + 1, r = 2 * i + 2;
            let s = i;
            if (l < n && this.heap[l][0] < this.heap[s][0]) s = l;
            if (r < n && this.heap[r][0] < this.heap[s][0]) s = r;
            if (s === i) break;
            [this.heap[s], this.heap[i]] = [this.heap[i], this.heap[s]];
            i = s;
        }
    }
    return top;
};
\`\`\`

## 复杂度

- 时间复杂度：O(n log k)，统计 O(n)，堆操作 O(n log k)
- 空间复杂度：O(n + k)，频次表 + 堆

## 拓展

- 桶排序解法：建长度 n+1 的桶数组，\`buckets[freq]\` 存元素，从高到低收集 k 个，O(n)。
- 相关：#215 第 K 大、#451 频率排序，都是「统计 + Top K」家族。
- 进阶：要求 O(n log n) 以内且 n 极大时，桶排序优于堆；要求实时维护时用堆。`
  }
];
