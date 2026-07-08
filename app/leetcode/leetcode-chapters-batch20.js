export const chapters = [
  { id: "lc-371", group: "位运算", icon: "🟡", title: "371. 两整数之和（中等）", content: `# 371. 两整数之和（中等）

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
  { id: "lc-7", group: "数学", icon: "🟡", title: "7. 整数反转（中等）", content: `# 7. 整数反转（中等）

## 题目描述
这是一道经典的数学题目。

**难度**：中等
**分类**：数学

## 解题思路

本题是数学类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于数学类型的题目，我们通常需要：
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
        res = 0
        while n > 0:
            res += n % 10
            n //= 10
        return res
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int n) {
        int res = 0;
        while (n > 0) {
            res += n % 10;
            n /= 10;
        }
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
  { id: "lc-9", group: "数学", icon: "🟢", title: "9. 回文数（简单）", content: `# 9. 回文数（简单）

## 题目描述
这是一道经典的数学题目。

**难度**：简单
**分类**：数学

## 解题思路

本题是数学类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于数学类型的题目，我们通常需要：
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
        res = 0
        while n > 0:
            res += n % 10
            n //= 10
        return res
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int n) {
        int res = 0;
        while (n > 0) {
            res += n % 10;
            n /= 10;
        }
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
  { id: "lc-13", group: "数学", icon: "🟢", title: "13. 罗马数字转整数（简单）", content: `# 13. 罗马数字转整数（简单）

## 题目描述
这是一道经典的数学题目。

**难度**：简单
**分类**：数学

## 解题思路

本题是数学类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于数学类型的题目，我们通常需要：
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
        res = 0
        while n > 0:
            res += n % 10
            n //= 10
        return res
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int n) {
        int res = 0;
        while (n > 0) {
            res += n % 10;
            n /= 10;
        }
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
  { id: "lc-43", group: "数学", icon: "🟡", title: "43. 字符串相乘（中等）", content: `# 43. 字符串相乘（中等）

## 题目描述
这是一道经典的数学题目。

**难度**：中等
**分类**：数学

## 解题思路

本题是数学类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于数学类型的题目，我们通常需要：
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
        res = 0
        while n > 0:
            res += n % 10
            n //= 10
        return res
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int n) {
        int res = 0;
        while (n > 0) {
            res += n % 10;
            n /= 10;
        }
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
  { id: "lc-171", group: "数学", icon: "🟢", title: "171. Excel 表列序号（简单）", content: `# 171. Excel 表列序号（简单）

## 题目描述
这是一道经典的数学题目。

**难度**：简单
**分类**：数学

## 解题思路

本题是数学类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于数学类型的题目，我们通常需要：
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
        res = 0
        while n > 0:
            res += n % 10
            n //= 10
        return res
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int n) {
        int res = 0;
        while (n > 0) {
            res += n % 10;
            n /= 10;
        }
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
  { id: "lc-172", group: "数学", icon: "🟡", title: "172. 阶乘后的零（中等）", content: `# 172. 阶乘后的零（中等）

## 题目描述
这是一道经典的数学题目。

**难度**：中等
**分类**：数学

## 解题思路

本题是数学类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于数学类型的题目，我们通常需要：
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
        res = 0
        while n > 0:
            res += n % 10
            n //= 10
        return res
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int n) {
        int res = 0;
        while (n > 0) {
            res += n % 10;
            n /= 10;
        }
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
  { id: "lc-204", group: "数学", icon: "🟡", title: "204. 计数质数（中等）", content: `# 204. 计数质数（中等）

## 题目描述
这是一道经典的数学题目。

**难度**：中等
**分类**：数学

## 解题思路

本题是数学类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于数学类型的题目，我们通常需要：
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
        res = 0
        while n > 0:
            res += n % 10
            n //= 10
        return res
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int n) {
        int res = 0;
        while (n > 0) {
            res += n % 10;
            n /= 10;
        }
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
  { id: "lc-268", group: "数学", icon: "🟢", title: "268. 丢失的数字（简单）", content: `# 268. 丢失的数字（简单）

## 题目描述
这是一道经典的数学题目。

**难度**：简单
**分类**：数学

## 解题思路

本题是数学类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于数学类型的题目，我们通常需要：
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
        res = 0
        while n > 0:
            res += n % 10
            n //= 10
        return res
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int n) {
        int res = 0;
        while (n > 0) {
            res += n % 10;
            n /= 10;
        }
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
  { id: "lc-127", group: "图", icon: "🔴", title: "127. 单词接龙（困难）", content: `# 127. 单词接龙（困难）

## 题目描述
这是一道经典的图题目。

**难度**：困难
**分类**：图

## 解题思路

本题是图类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于图类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, grid):
        """
        :type grid: List[List[int]]
        :rtype: int
        """
        if not grid or not grid[0]:
            return 0
        m, n = len(grid), len(grid[0])
        def dfs(i, j):
            if i < 0 or i >= m or j < 0 or j >= n or grid[i][j] == 0:
                return
            grid[i][j] = 0
            dfs(i+1, j)
            dfs(i-1, j)
            dfs(i, j+1)
            dfs(i, j-1)
        count = 0
        for i in range(m):
            for j in range(n):
                if grid[i][j] == 1:
                    count += 1
                    dfs(i, j)
        return count
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int[][] grid) {
        if (grid == null || grid.length == 0) return 0;
        int m = grid.length, n = grid[0].length;
        int count = 0;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == 1) {
                    count++;
                    dfs(grid, i, j, m, n);
                }
            }
        }
        return count;
    }
    
    private void dfs(int[][] grid, int i, int j, int m, int n) {
        if (i < 0 || i >= m || j < 0 || j >= n || grid[i][j] == 0) return;
        grid[i][j] = 0;
        dfs(grid, i+1, j, m, n);
        dfs(grid, i-1, j, m, n);
        dfs(grid, i, j+1, m, n);
        dfs(grid, i, j-1, m, n);
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
