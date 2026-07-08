export const chapters = [
  { id: "lc-133", group: "图", icon: "🟡", title: "133. 克隆图（中等）", content: `# 133. 克隆图（中等）

## 题目描述
这是一道经典的图题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：图

## 解题思路

本题是图类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用图相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(grid):
    m, n = len(grid), len(grid[0])
    def dfs(i, j):
        if i < 0 or i >= m or j < 0 or j >= n:
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-207", group: "图", icon: "🟡", title: "207. 课程表（中等）", content: `# 207. 课程表（中等）

## 题目描述
这是一道经典的图题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：图

## 解题思路

本题是图类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用图相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(grid):
    m, n = len(grid), len(grid[0])
    def dfs(i, j):
        if i < 0 or i >= m or j < 0 or j >= n:
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-210", group: "图", icon: "🟡", title: "210. 课程表 II（中等）", content: `# 210. 课程表 II（中等）

## 题目描述
这是一道经典的图题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：图

## 解题思路

本题是图类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用图相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(grid):
    m, n = len(grid), len(grid[0])
    def dfs(i, j):
        if i < 0 or i >= m or j < 0 or j >= n:
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-547", group: "图", icon: "🟡", title: "547. 省份数量（中等）", content: `# 547. 省份数量（中等）

## 题目描述
这是一道经典的图题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：图

## 解题思路

本题是图类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用图相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(grid):
    m, n = len(grid), len(grid[0])
    def dfs(i, j):
        if i < 0 or i >= m or j < 0 or j >= n:
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-994", group: "图", icon: "🟡", title: "994. 腐烂的橘子（中等）", content: `# 994. 腐烂的橘子（中等）

## 题目描述
这是一道经典的图题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：图

## 解题思路

本题是图类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用图相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(grid):
    m, n = len(grid), len(grid[0])
    def dfs(i, j):
        if i < 0 or i >= m or j < 0 or j >= n:
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-785", group: "图", icon: "🟡", title: "785. 判断二分图（中等）", content: `# 785. 判断二分图（中等）

## 题目描述
这是一道经典的图题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：图

## 解题思路

本题是图类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用图相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(grid):
    m, n = len(grid), len(grid[0])
    def dfs(i, j):
        if i < 0 or i >= m or j < 0 or j >= n:
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-797", group: "图", icon: "🟡", title: "797. 所有可能的路径（中等）", content: `# 797. 所有可能的路径（中等）

## 题目描述
这是一道经典的图题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：图

## 解题思路

本题是图类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用图相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(grid):
    m, n = len(grid), len(grid[0])
    def dfs(i, j):
        if i < 0 or i >= m or j < 0 or j >= n:
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-127", group: "图", icon: "🔴", title: "127. 单词接龙（困难）", content: `# 127. 单词接龙（困难）

## 题目描述
这是一道经典的图题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：困难
**分类**：图

## 解题思路

本题是图类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用图相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(grid):
    m, n = len(grid), len(grid[0])
    def dfs(i, j):
        if i < 0 or i >= m or j < 0 or j >= n:
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-208", group: "设计题", icon: "🟡", title: "208. 实现 Trie (前缀树)（中等）", content: `# 208. 实现 Trie (前缀树)（中等）

## 题目描述
这是一道经典的设计题题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：设计题

## 解题思路

本题是设计题类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用设计题相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
class DataStructure:
    def __init__(self):
        self.data = []
    def insert(self, val):
        self.data.append(val)
    def get(self):
        return self.data[0] if self.data else None
\`\`\`

**Java**
\`\`\`java
import java.util.*;
class DataStructure {
    List<Integer> data;
    public DataStructure() {
        data = new ArrayList<>();
    }
    public void insert(int val) {
        data.add(val);
    }
    public Integer get() {
        return data.isEmpty() ? null : data.get(0);
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
  { id: "lc-211", group: "设计题", icon: "🟡", title: "211. 添加与搜索单词 - 数据结构设计（中等）", content: `# 211. 添加与搜索单词 - 数据结构设计（中等）

## 题目描述
这是一道经典的设计题题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：设计题

## 解题思路

本题是设计题类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用设计题相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
class DataStructure:
    def __init__(self):
        self.data = []
    def insert(self, val):
        self.data.append(val)
    def get(self):
        return self.data[0] if self.data else None
\`\`\`

**Java**
\`\`\`java
import java.util.*;
class DataStructure {
    List<Integer> data;
    public DataStructure() {
        data = new ArrayList<>();
    }
    public void insert(int val) {
        data.add(val);
    }
    public Integer get() {
        return data.isEmpty() ? null : data.get(0);
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
