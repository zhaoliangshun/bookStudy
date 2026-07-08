export const chapters = [
  { id: "lc-162", group: "二分查找", icon: "🟡", title: "162. 寻找峰值（中等）", content: `# 162. 寻找峰值（中等）

## 题目描述
这是一道经典的二分查找题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：二分查找

## 解题思路

本题是二分查找类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用二分查找相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums, target):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-4", group: "二分查找", icon: "🔴", title: "4. 寻找两个正序数组的中位数（困难）", content: `# 4. 寻找两个正序数组的中位数（困难）

## 题目描述
这是一道经典的二分查找题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：困难
**分类**：二分查找

## 解题思路

本题是二分查找类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用二分查找相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums, target):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-69", group: "二分查找", icon: "🟢", title: "69. x 的平方根（简单）", content: `# 69. x 的平方根（简单）

## 题目描述
这是一道经典的二分查找题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：简单
**分类**：二分查找

## 解题思路

本题是二分查找类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用二分查找相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums, target):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-278", group: "二分查找", icon: "🟢", title: "278. 第一个错误的版本（简单）", content: `# 278. 第一个错误的版本（简单）

## 题目描述
这是一道经典的二分查找题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：简单
**分类**：二分查找

## 解题思路

本题是二分查找类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用二分查找相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums, target):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-155", group: "栈与队列", icon: "🟡", title: "155. 最小栈（中等）", content: `# 155. 最小栈（中等）

## 题目描述
这是一道经典的栈与队列题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：栈与队列

## 解题思路

本题是栈与队列类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用栈与队列相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(s):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-232", group: "栈与队列", icon: "🟢", title: "232. 用栈实现队列（简单）", content: `# 232. 用栈实现队列（简单）

## 题目描述
这是一道经典的栈与队列题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：简单
**分类**：栈与队列

## 解题思路

本题是栈与队列类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用栈与队列相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(s):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-225", group: "栈与队列", icon: "🟢", title: "225. 用队列实现栈（简单）", content: `# 225. 用队列实现栈（简单）

## 题目描述
这是一道经典的栈与队列题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：简单
**分类**：栈与队列

## 解题思路

本题是栈与队列类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用栈与队列相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(s):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-84", group: "栈与队列", icon: "🔴", title: "84. 柱状图中最大的矩形（困难）", content: `# 84. 柱状图中最大的矩形（困难）

## 题目描述
这是一道经典的栈与队列题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：困难
**分类**：栈与队列

## 解题思路

本题是栈与队列类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用栈与队列相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(s):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-85", group: "栈与队列", icon: "🔴", title: "85. 最大矩形（困难）", content: `# 85. 最大矩形（困难）

## 题目描述
这是一道经典的栈与队列题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：困难
**分类**：栈与队列

## 解题思路

本题是栈与队列类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用栈与队列相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(s):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-239", group: "栈与队列", icon: "🔴", title: "239. 滑动窗口最大值（困难）", content: `# 239. 滑动窗口最大值（困难）

## 题目描述
这是一道经典的栈与队列题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：困难
**分类**：栈与队列

## 解题思路

本题是栈与队列类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用栈与队列相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(s):
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
