export const chapters = [
  { id: "lc-279", group: "动态规划", icon: "🟡", title: "279. 完全平方数（中等）", content: `# 279. 完全平方数（中等）

## 题目描述
这是一道经典的动态规划题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：动态规划

## 解题思路

本题是动态规划类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用动态规划相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(n):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-338", group: "动态规划", icon: "🟢", title: "338. 比特位计数（简单）", content: `# 338. 比特位计数（简单）

## 题目描述
这是一道经典的动态规划题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：简单
**分类**：动态规划

## 解题思路

本题是动态规划类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用动态规划相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(n):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-46", group: "回溯", icon: "🟡", title: "46. 全排列（中等）", content: `# 46. 全排列（中等）

## 题目描述
这是一道经典的回溯题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：回溯

## 解题思路

本题是回溯类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用回溯相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-47", group: "回溯", icon: "🟡", title: "47. 全排列 II（中等）", content: `# 47. 全排列 II（中等）

## 题目描述
这是一道经典的回溯题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：回溯

## 解题思路

本题是回溯类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用回溯相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-39", group: "回溯", icon: "🟡", title: "39. 组合总和（中等）", content: `# 39. 组合总和（中等）

## 题目描述
这是一道经典的回溯题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：回溯

## 解题思路

本题是回溯类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用回溯相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-40", group: "回溯", icon: "🟡", title: "40. 组合总和 II（中等）", content: `# 40. 组合总和 II（中等）

## 题目描述
这是一道经典的回溯题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：回溯

## 解题思路

本题是回溯类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用回溯相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-78", group: "回溯", icon: "🟡", title: "78. 子集（中等）", content: `# 78. 子集（中等）

## 题目描述
这是一道经典的回溯题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：回溯

## 解题思路

本题是回溯类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用回溯相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-90", group: "回溯", icon: "🟡", title: "90. 子集 II（中等）", content: `# 90. 子集 II（中等）

## 题目描述
这是一道经典的回溯题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：回溯

## 解题思路

本题是回溯类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用回溯相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-22", group: "回溯", icon: "🟡", title: "22. 括号生成（中等）", content: `# 22. 括号生成（中等）

## 题目描述
这是一道经典的回溯题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：回溯

## 解题思路

本题是回溯类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用回溯相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-79", group: "回溯", icon: "🟡", title: "79. 单词搜索（中等）", content: `# 79. 单词搜索（中等）

## 题目描述
这是一道经典的回溯题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：回溯

## 解题思路

本题是回溯类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用回溯相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` }
];
