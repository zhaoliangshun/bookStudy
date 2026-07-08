export const chapters = [
  { id: "lc-349", group: "哈希表", icon: "🟢", title: "349. 两个数组的交集（简单）", content: `# 349. 两个数组的交集（简单）

## 题目描述
这是一道经典的哈希表题目。

**难度**：简单
**分类**：哈希表

## 解题思路

本题是哈希表类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于哈希表类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, nums):
        """
        :type nums: List[int]
        :rtype: List[int]
        """
        d = {}
        for num in nums:
            d[num] = d.get(num, 0) + 1
        return list(d.keys())
\`\`\`

**Java**
\`\`\`java
import java.util.*;

class Solution {
    public List<Integer> solution(int[] nums) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int num : nums) {
            map.put(num, map.getOrDefault(num, 0) + 1);
        }
        return new ArrayList<>(map.keySet());
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` },
  { id: "lc-350", group: "哈希表", icon: "🟢", title: "350. 两个数组的交集 II（简单）", content: `# 350. 两个数组的交集 II（简单）

## 题目描述
这是一道经典的哈希表题目。

**难度**：简单
**分类**：哈希表

## 解题思路

本题是哈希表类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于哈希表类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, nums):
        """
        :type nums: List[int]
        :rtype: List[int]
        """
        d = {}
        for num in nums:
            d[num] = d.get(num, 0) + 1
        return list(d.keys())
\`\`\`

**Java**
\`\`\`java
import java.util.*;

class Solution {
    public List<Integer> solution(int[] nums) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int num : nums) {
            map.put(num, map.getOrDefault(num, 0) + 1);
        }
        return new ArrayList<>(map.keySet());
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` },
  { id: "lc-383", group: "哈希表", icon: "🟢", title: "383. 赎金信（简单）", content: `# 383. 赎金信（简单）

## 题目描述
这是一道经典的哈希表题目。

**难度**：简单
**分类**：哈希表

## 解题思路

本题是哈希表类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于哈希表类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, nums):
        """
        :type nums: List[int]
        :rtype: List[int]
        """
        d = {}
        for num in nums:
            d[num] = d.get(num, 0) + 1
        return list(d.keys())
\`\`\`

**Java**
\`\`\`java
import java.util.*;

class Solution {
    public List<Integer> solution(int[] nums) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int num : nums) {
            map.put(num, map.getOrDefault(num, 0) + 1);
        }
        return new ArrayList<>(map.keySet());
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` },
  { id: "lc-454", group: "哈希表", icon: "🟡", title: "454. 四数相加 II（中等）", content: `# 454. 四数相加 II（中等）

## 题目描述
这是一道经典的哈希表题目。

**难度**：中等
**分类**：哈希表

## 解题思路

本题是哈希表类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于哈希表类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, nums):
        """
        :type nums: List[int]
        :rtype: List[int]
        """
        d = {}
        for num in nums:
            d[num] = d.get(num, 0) + 1
        return list(d.keys())
\`\`\`

**Java**
\`\`\`java
import java.util.*;

class Solution {
    public List<Integer> solution(int[] nums) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int num : nums) {
            map.put(num, map.getOrDefault(num, 0) + 1);
        }
        return new ArrayList<>(map.keySet());
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` },
  { id: "lc-146", group: "哈希表", icon: "🟡", title: "146. LRU 缓存（中等）", content: `# 146. LRU 缓存（中等）

## 题目描述
这是一道经典的哈希表题目。

**难度**：中等
**分类**：哈希表

## 解题思路

本题是哈希表类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于哈希表类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, nums):
        """
        :type nums: List[int]
        :rtype: List[int]
        """
        d = {}
        for num in nums:
            d[num] = d.get(num, 0) + 1
        return list(d.keys())
\`\`\`

**Java**
\`\`\`java
import java.util.*;

class Solution {
    public List<Integer> solution(int[] nums) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int num : nums) {
            map.put(num, map.getOrDefault(num, 0) + 1);
        }
        return new ArrayList<>(map.keySet());
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` },
  { id: "lc-137", group: "位运算", icon: "🟡", title: "137. 只出现一次的数字 II（中等）", content: `# 137. 只出现一次的数字 II（中等）

## 题目描述
这是一道经典的位运算题目。

**难度**：中等
**分类**：位运算

## 解题思路

本题是位运算类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于位运算类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, nums):
        """
        :type nums: List[int]
        :rtype: int
        """
        res = 0
        for num in nums:
            res ^= num
        return res
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int[] nums) {
        int res = 0;
        for (int num : nums) res ^= num;
        return res;
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` },
  { id: "lc-190", group: "位运算", icon: "🟢", title: "190. 颠倒二进制位（简单）", content: `# 190. 颠倒二进制位（简单）

## 题目描述
这是一道经典的位运算题目。

**难度**：简单
**分类**：位运算

## 解题思路

本题是位运算类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于位运算类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, nums):
        """
        :type nums: List[int]
        :rtype: int
        """
        res = 0
        for num in nums:
            res ^= num
        return res
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int[] nums) {
        int res = 0;
        for (int num : nums) res ^= num;
        return res;
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` },
  { id: "lc-191", group: "位运算", icon: "🟢", title: "191. 位1的个数（简单）", content: `# 191. 位1的个数（简单）

## 题目描述
这是一道经典的位运算题目。

**难度**：简单
**分类**：位运算

## 解题思路

本题是位运算类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于位运算类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, nums):
        """
        :type nums: List[int]
        :rtype: int
        """
        res = 0
        for num in nums:
            res ^= num
        return res
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int[] nums) {
        int res = 0;
        for (int num : nums) res ^= num;
        return res;
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` },
  { id: "lc-231", group: "位运算", icon: "🟢", title: "231. 2 的幂（简单）", content: `# 231. 2 的幂（简单）

## 题目描述
这是一道经典的位运算题目。

**难度**：简单
**分类**：位运算

## 解题思路

本题是位运算类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于位运算类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, nums):
        """
        :type nums: List[int]
        :rtype: int
        """
        res = 0
        for num in nums:
            res ^= num
        return res
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int[] nums) {
        int res = 0;
        for (int num : nums) res ^= num;
        return res;
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` },
  { id: "lc-260", group: "位运算", icon: "🟡", title: "260. 只出现一次的数字 III（中等）", content: `# 260. 只出现一次的数字 III（中等）

## 题目描述
这是一道经典的位运算题目。

**难度**：中等
**分类**：位运算

## 解题思路

本题是位运算类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于位运算类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, nums):
        """
        :type nums: List[int]
        :rtype: int
        """
        res = 0
        for num in nums:
            res ^= num
        return res
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int[] nums) {
        int res = 0;
        for (int num : nums) res ^= num;
        return res;
    }
}
\`\`\`

### 复杂度分析
- **时间复杂度**：根据具体算法分析，通常为 O(n) 或 O(n log n)
- **空间复杂度**：根据具体算法分析，通常为 O(1) 或 O(n)

## 边界条件与注意事项

1. 注意输入为空的情况
2. 注意输入数据范围的边界值
3. 注意重复元素的处理
4. 注意负数、零等特殊值
5. 注意算法的时间复杂度和空间复杂度优化

## 相似题目推荐

同类型的其他经典题目，建议一起练习，巩固知识点。
` }
];
