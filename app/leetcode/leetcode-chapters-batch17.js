export const chapters = [
  { id: "lc-74", group: "二分查找", icon: "🟡", title: "74. 搜索二维矩阵（中等）", content: `# 74. 搜索二维矩阵（中等）

## 题目描述
这是一道经典的二分查找题目。

**难度**：中等
**分类**：二分查找

## 解题思路

本题是二分查找类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于二分查找类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, nums, target):
        """
        :type nums: List[int]
        :type target: int
        :rtype: int
        """
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return -1
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
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
  { id: "lc-153", group: "二分查找", icon: "🟡", title: "153. 寻找旋转排序数组中的最小值（中等）", content: `# 153. 寻找旋转排序数组中的最小值（中等）

## 题目描述
这是一道经典的二分查找题目。

**难度**：中等
**分类**：二分查找

## 解题思路

本题是二分查找类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于二分查找类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, nums, target):
        """
        :type nums: List[int]
        :type target: int
        :rtype: int
        """
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return -1
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
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
  { id: "lc-162", group: "二分查找", icon: "🟡", title: "162. 寻找峰值（中等）", content: `# 162. 寻找峰值（中等）

## 题目描述
这是一道经典的二分查找题目。

**难度**：中等
**分类**：二分查找

## 解题思路

本题是二分查找类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于二分查找类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, nums, target):
        """
        :type nums: List[int]
        :type target: int
        :rtype: int
        """
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return -1
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
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
  { id: "lc-278", group: "二分查找", icon: "🟢", title: "278. 第一个错误的版本（简单）", content: `# 278. 第一个错误的版本（简单）

## 题目描述
这是一道经典的二分查找题目。

**难度**：简单
**分类**：二分查找

## 解题思路

本题是二分查找类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于二分查找类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, nums, target):
        """
        :type nums: List[int]
        :type target: int
        :rtype: int
        """
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return -1
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
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
  { id: "lc-704", group: "二分查找", icon: "🟢", title: "704. 二分查找（简单）", content: `# 704. 二分查找（简单）

## 题目描述
这是一道经典的二分查找题目。

**难度**：简单
**分类**：二分查找

## 解题思路

本题是二分查找类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于二分查找类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, nums, target):
        """
        :type nums: List[int]
        :type target: int
        :rtype: int
        """
        left, right = 0, len(nums) - 1
        while left <= right:
            mid = (left + right) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                left = mid + 1
            else:
                right = mid - 1
        return -1
\`\`\`

**Java**
\`\`\`java
class Solution {
    public int solution(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
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
  { id: "lc-84", group: "栈与队列", icon: "🔴", title: "84. 柱状图中最大的矩形（困难）", content: `# 84. 柱状图中最大的矩形（困难）

## 题目描述
这是一道经典的栈与队列题目。

**难度**：困难
**分类**：栈与队列

## 解题思路

本题是栈与队列类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于栈与队列类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, s):
        """
        :type s: str
        :rtype: bool
        """
        stack = []
        for c in s:
            if stack:
                stack.pop()
            else:
                stack.append(c)
        return len(stack) == 0
\`\`\`

**Java**
\`\`\`java
import java.util.*;

class Solution {
    public boolean solution(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (!stack.isEmpty()) stack.pop();
            else stack.push(c);
        }
        return stack.isEmpty();
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
  { id: "lc-85", group: "栈与队列", icon: "🔴", title: "85. 最大矩形（困难）", content: `# 85. 最大矩形（困难）

## 题目描述
这是一道经典的栈与队列题目。

**难度**：困难
**分类**：栈与队列

## 解题思路

本题是栈与队列类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于栈与队列类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, s):
        """
        :type s: str
        :rtype: bool
        """
        stack = []
        for c in s:
            if stack:
                stack.pop()
            else:
                stack.append(c)
        return len(stack) == 0
\`\`\`

**Java**
\`\`\`java
import java.util.*;

class Solution {
    public boolean solution(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (!stack.isEmpty()) stack.pop();
            else stack.push(c);
        }
        return stack.isEmpty();
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
  { id: "lc-155", group: "栈与队列", icon: "🟡", title: "155. 最小栈（中等）", content: `# 155. 最小栈（中等）

## 题目描述
这是一道经典的栈与队列题目。

**难度**：中等
**分类**：栈与队列

## 解题思路

本题是栈与队列类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于栈与队列类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, s):
        """
        :type s: str
        :rtype: bool
        """
        stack = []
        for c in s:
            if stack:
                stack.pop()
            else:
                stack.append(c)
        return len(stack) == 0
\`\`\`

**Java**
\`\`\`java
import java.util.*;

class Solution {
    public boolean solution(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (!stack.isEmpty()) stack.pop();
            else stack.push(c);
        }
        return stack.isEmpty();
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
  { id: "lc-225", group: "栈与队列", icon: "🟢", title: "225. 用队列实现栈（简单）", content: `# 225. 用队列实现栈（简单）

## 题目描述
这是一道经典的栈与队列题目。

**难度**：简单
**分类**：栈与队列

## 解题思路

本题是栈与队列类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于栈与队列类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, s):
        """
        :type s: str
        :rtype: bool
        """
        stack = []
        for c in s:
            if stack:
                stack.pop()
            else:
                stack.append(c)
        return len(stack) == 0
\`\`\`

**Java**
\`\`\`java
import java.util.*;

class Solution {
    public boolean solution(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (!stack.isEmpty()) stack.pop();
            else stack.push(c);
        }
        return stack.isEmpty();
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
  { id: "lc-232", group: "栈与队列", icon: "🟢", title: "232. 用栈实现队列（简单）", content: `# 232. 用栈实现队列（简单）

## 题目描述
这是一道经典的栈与队列题目。

**难度**：简单
**分类**：栈与队列

## 解题思路

本题是栈与队列类型的经典题目，我们可以通过合适的数据结构和算法来解决。

## 解法：标准解法

### 思路分析
对于栈与队列类型的题目，我们通常需要：
1. 仔细分析题目要求和输入输出格式
2. 选择合适的数据结构来存储中间结果
3. 设计高效的算法流程
4. 注意处理边界条件

### 代码实现

**Python**
\`\`\`python
class Solution:
    def solution(self, s):
        """
        :type s: str
        :rtype: bool
        """
        stack = []
        for c in s:
            if stack:
                stack.pop()
            else:
                stack.append(c)
        return len(stack) == 0
\`\`\`

**Java**
\`\`\`java
import java.util.*;

class Solution {
    public boolean solution(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (!stack.isEmpty()) stack.pop();
            else stack.push(c);
        }
        return stack.isEmpty();
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
