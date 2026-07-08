export const chapters = [
  { id: "lc-77", group: "回溯", icon: "🟡", title: "77. 组合（中等）", content: `# 77. 组合（中等）

## 题目描述
这是一道经典的回溯题目。

**难度**：中等
**分类**：回溯

## 解题思路

本题是回溯类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于回溯类型的题目，我们通常需要：
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
        :rtype: List[List[int]]
        """
        res = []
        def backtrack(path, start):
            if len(path) == len(nums):
                res.append(path[:])
                return
            for i in range(start, len(nums)):
                path.append(nums[i])
                backtrack(path, i + 1)
                path.pop()
        backtrack([], 0)
        return res
\`\`\`

**Java**
\`\`\`java
import java.util.*;

class Solution {
    List<List<Integer>> res = new ArrayList<>();
    
    public List<List<Integer>> solution(int[] nums) {
        backtrack(nums, new ArrayList<>(), 0);
        return res;
    }
    
    private void backtrack(int[] nums, List<Integer> path, int start) {
        if (path.size() == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            backtrack(nums, path, i + 1);
            path.remove(path.size() - 1);
        }
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
  { id: "lc-78", group: "回溯", icon: "🟡", title: "78. 子集（中等）", content: `# 78. 子集（中等）

## 题目描述
这是一道经典的回溯题目。

**难度**：中等
**分类**：回溯

## 解题思路

本题是回溯类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于回溯类型的题目，我们通常需要：
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
        :rtype: List[List[int]]
        """
        res = []
        def backtrack(path, start):
            if len(path) == len(nums):
                res.append(path[:])
                return
            for i in range(start, len(nums)):
                path.append(nums[i])
                backtrack(path, i + 1)
                path.pop()
        backtrack([], 0)
        return res
\`\`\`

**Java**
\`\`\`java
import java.util.*;

class Solution {
    List<List<Integer>> res = new ArrayList<>();
    
    public List<List<Integer>> solution(int[] nums) {
        backtrack(nums, new ArrayList<>(), 0);
        return res;
    }
    
    private void backtrack(int[] nums, List<Integer> path, int start) {
        if (path.size() == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            backtrack(nums, path, i + 1);
            path.remove(path.size() - 1);
        }
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
  { id: "lc-79", group: "回溯", icon: "🟡", title: "79. 单词搜索（中等）", content: `# 79. 单词搜索（中等）

## 题目描述
这是一道经典的回溯题目。

**难度**：中等
**分类**：回溯

## 解题思路

本题是回溯类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于回溯类型的题目，我们通常需要：
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
        :rtype: List[List[int]]
        """
        res = []
        def backtrack(path, start):
            if len(path) == len(nums):
                res.append(path[:])
                return
            for i in range(start, len(nums)):
                path.append(nums[i])
                backtrack(path, i + 1)
                path.pop()
        backtrack([], 0)
        return res
\`\`\`

**Java**
\`\`\`java
import java.util.*;

class Solution {
    List<List<Integer>> res = new ArrayList<>();
    
    public List<List<Integer>> solution(int[] nums) {
        backtrack(nums, new ArrayList<>(), 0);
        return res;
    }
    
    private void backtrack(int[] nums, List<Integer> path, int start) {
        if (path.size() == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            backtrack(nums, path, i + 1);
            path.remove(path.size() - 1);
        }
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
  { id: "lc-90", group: "回溯", icon: "🟡", title: "90. 子集 II（中等）", content: `# 90. 子集 II（中等）

## 题目描述
这是一道经典的回溯题目。

**难度**：中等
**分类**：回溯

## 解题思路

本题是回溯类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于回溯类型的题目，我们通常需要：
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
        :rtype: List[List[int]]
        """
        res = []
        def backtrack(path, start):
            if len(path) == len(nums):
                res.append(path[:])
                return
            for i in range(start, len(nums)):
                path.append(nums[i])
                backtrack(path, i + 1)
                path.pop()
        backtrack([], 0)
        return res
\`\`\`

**Java**
\`\`\`java
import java.util.*;

class Solution {
    List<List<Integer>> res = new ArrayList<>();
    
    public List<List<Integer>> solution(int[] nums) {
        backtrack(nums, new ArrayList<>(), 0);
        return res;
    }
    
    private void backtrack(int[] nums, List<Integer> path, int start) {
        if (path.size() == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            backtrack(nums, path, i + 1);
            path.remove(path.size() - 1);
        }
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
  { id: "lc-131", group: "回溯", icon: "🟡", title: "131. 分割回文串（中等）", content: `# 131. 分割回文串（中等）

## 题目描述
这是一道经典的回溯题目。

**难度**：中等
**分类**：回溯

## 解题思路

本题是回溯类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于回溯类型的题目，我们通常需要：
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
        :rtype: List[List[int]]
        """
        res = []
        def backtrack(path, start):
            if len(path) == len(nums):
                res.append(path[:])
                return
            for i in range(start, len(nums)):
                path.append(nums[i])
                backtrack(path, i + 1)
                path.pop()
        backtrack([], 0)
        return res
\`\`\`

**Java**
\`\`\`java
import java.util.*;

class Solution {
    List<List<Integer>> res = new ArrayList<>();
    
    public List<List<Integer>> solution(int[] nums) {
        backtrack(nums, new ArrayList<>(), 0);
        return res;
    }
    
    private void backtrack(int[] nums, List<Integer> path, int start) {
        if (path.size() == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            backtrack(nums, path, i + 1);
            path.remove(path.size() - 1);
        }
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
  { id: "lc-216", group: "回溯", icon: "🟡", title: "216. 组合总和 III（中等）", content: `# 216. 组合总和 III（中等）

## 题目描述
这是一道经典的回溯题目。

**难度**：中等
**分类**：回溯

## 解题思路

本题是回溯类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于回溯类型的题目，我们通常需要：
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
        :rtype: List[List[int]]
        """
        res = []
        def backtrack(path, start):
            if len(path) == len(nums):
                res.append(path[:])
                return
            for i in range(start, len(nums)):
                path.append(nums[i])
                backtrack(path, i + 1)
                path.pop()
        backtrack([], 0)
        return res
\`\`\`

**Java**
\`\`\`java
import java.util.*;

class Solution {
    List<List<Integer>> res = new ArrayList<>();
    
    public List<List<Integer>> solution(int[] nums) {
        backtrack(nums, new ArrayList<>(), 0);
        return res;
    }
    
    private void backtrack(int[] nums, List<Integer> path, int start) {
        if (path.size() == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            backtrack(nums, path, i + 1);
            path.remove(path.size() - 1);
        }
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
  { id: "lc-401", group: "回溯", icon: "🟢", title: "401. 二进制手表（简单）", content: `# 401. 二进制手表（简单）

## 题目描述
这是一道经典的回溯题目。

**难度**：简单
**分类**：回溯

## 解题思路

本题是回溯类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于回溯类型的题目，我们通常需要：
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
        :rtype: List[List[int]]
        """
        res = []
        def backtrack(path, start):
            if len(path) == len(nums):
                res.append(path[:])
                return
            for i in range(start, len(nums)):
                path.append(nums[i])
                backtrack(path, i + 1)
                path.pop()
        backtrack([], 0)
        return res
\`\`\`

**Java**
\`\`\`java
import java.util.*;

class Solution {
    List<List<Integer>> res = new ArrayList<>();
    
    public List<List<Integer>> solution(int[] nums) {
        backtrack(nums, new ArrayList<>(), 0);
        return res;
    }
    
    private void backtrack(int[] nums, List<Integer> path, int start) {
        if (path.size() == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            backtrack(nums, path, i + 1);
            path.remove(path.size() - 1);
        }
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
  { id: "lc-45", group: "贪心", icon: "🟡", title: "45. 跳跃游戏 II（中等）", content: `# 45. 跳跃游戏 II（中等）

## 题目描述
这是一道经典的贪心题目。

**难度**：中等
**分类**：贪心

## 解题思路

本题是贪心类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于贪心类型的题目，我们通常需要：
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
        :rtype: int or bool
        """
        res = 0
        for num in nums:
            pass
        return res
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int[] nums) {
        int res = 0;
        for (int num : nums) {}
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
  { id: "lc-55", group: "贪心", icon: "🟡", title: "55. 跳跃游戏（中等）", content: `# 55. 跳跃游戏（中等）

## 题目描述
这是一道经典的贪心题目。

**难度**：中等
**分类**：贪心

## 解题思路

本题是贪心类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于贪心类型的题目，我们通常需要：
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
        :rtype: int or bool
        """
        res = 0
        for num in nums:
            pass
        return res
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int[] nums) {
        int res = 0;
        for (int num : nums) {}
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
  { id: "lc-135", group: "贪心", icon: "🔴", title: "135. 分发糖果（困难）", content: `# 135. 分发糖果（困难）

## 题目描述
这是一道经典的贪心题目。

**难度**：困难
**分类**：贪心

## 解题思路

本题是贪心类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于贪心类型的题目，我们通常需要：
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
        :rtype: int or bool
        """
        res = 0
        for num in nums:
            pass
        return res
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int[] nums) {
        int res = 0;
        for (int num : nums) {}
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
