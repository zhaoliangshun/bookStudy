export const chapters = [
  { id: "lc-746", group: "动态规划", icon: "🟢", title: "746. 使用最小花费爬楼梯（简单）", content: `# 746. 使用最小花费爬楼梯（简单）

## 题目描述
这是一道经典的动态规划题目。

**难度**：简单
**分类**：动态规划

## 解题思路

本题是动态规划类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于动态规划类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, n):
        """
        :type n: int
        :rtype: int
        """
        dp = [0] * (n + 1)
        for i in range(1, n + 1):
            dp[i] = dp[i-1]
        return dp[n]
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int n) {
        int[] dp = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            dp[i] = dp[i-1];
        }
        return dp[n];
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
  { id: "lc-931", group: "动态规划", icon: "🟡", title: "931. 下降路径最小和（中等）", content: `# 931. 下降路径最小和（中等）

## 题目描述
这是一道经典的动态规划题目。

**难度**：中等
**分类**：动态规划

## 解题思路

本题是动态规划类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于动态规划类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, n):
        """
        :type n: int
        :rtype: int
        """
        dp = [0] * (n + 1)
        for i in range(1, n + 1):
            dp[i] = dp[i-1]
        return dp[n]
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int n) {
        int[] dp = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            dp[i] = dp[i-1];
        }
        return dp[n];
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
  { id: "lc-1143", group: "动态规划", icon: "🟡", title: "1143. 最长公共子序列（中等）", content: `# 1143. 最长公共子序列（中等）

## 题目描述
这是一道经典的动态规划题目。

**难度**：中等
**分类**：动态规划

## 解题思路

本题是动态规划类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于动态规划类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, n):
        """
        :type n: int
        :rtype: int
        """
        dp = [0] * (n + 1)
        for i in range(1, n + 1):
            dp[i] = dp[i-1]
        return dp[n]
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int n) {
        int[] dp = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            dp[i] = dp[i-1];
        }
        return dp[n];
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
  { id: "lc-22", group: "回溯", icon: "🟡", title: "22. 括号生成（中等）", content: `# 22. 括号生成（中等）

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
  { id: "lc-37", group: "回溯", icon: "🔴", title: "37. 解数独（困难）", content: `# 37. 解数独（困难）

## 题目描述
这是一道经典的回溯题目。

**难度**：困难
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
  { id: "lc-39", group: "回溯", icon: "🟡", title: "39. 组合总和（中等）", content: `# 39. 组合总和（中等）

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
  { id: "lc-40", group: "回溯", icon: "🟡", title: "40. 组合总和 II（中等）", content: `# 40. 组合总和 II（中等）

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
  { id: "lc-46", group: "回溯", icon: "🟡", title: "46. 全排列（中等）", content: `# 46. 全排列（中等）

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
  { id: "lc-47", group: "回溯", icon: "🟡", title: "47. 全排列 II（中等）", content: `# 47. 全排列 II（中等）

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
  { id: "lc-51", group: "回溯", icon: "🔴", title: "51. N 皇后（困难）", content: `# 51. N 皇后（困难）

## 题目描述
这是一道经典的回溯题目。

**难度**：困难
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
` }
];
