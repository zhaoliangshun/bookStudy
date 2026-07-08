export const chapters = [
  { id: "lc-316", group: "栈与队列", icon: "🟡", title: "316. 去除重复字母（中等）", content: `# 316. 去除重复字母（中等）

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
  { id: "lc-496", group: "栈与队列", icon: "🟢", title: "496. 下一个更大元素 I（简单）", content: `# 496. 下一个更大元素 I（简单）

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
  { id: "lc-503", group: "栈与队列", icon: "🟡", title: "503. 下一个更大元素 II（中等）", content: `# 503. 下一个更大元素 II（中等）

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
  { id: "lc-739", group: "栈与队列", icon: "🟡", title: "739. 每日温度（中等）", content: `# 739. 每日温度（中等）

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
  { id: "lc-1047", group: "栈与队列", icon: "🟢", title: "1047. 删除字符串中的所有相邻重复项（简单）", content: `# 1047. 删除字符串中的所有相邻重复项（简单）

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
  { id: "lc-622", group: "栈与队列", icon: "🟡", title: "622. 设计循环队列（中等）", content: `# 622. 设计循环队列（中等）

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
  { id: "lc-946", group: "栈与队列", icon: "🟡", title: "946. 验证栈序列（中等）", content: `# 946. 验证栈序列（中等）

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
  { id: "lc-349", group: "哈希表", icon: "🟢", title: "349. 两个数组的交集（简单）", content: `# 349. 两个数组的交集（简单）

## 题目描述
这是一道经典的哈希表题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：简单
**分类**：哈希表

## 解题思路

本题是哈希表类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用哈希表相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-350", group: "哈希表", icon: "🟢", title: "350. 两个数组的交集 II（简单）", content: `# 350. 两个数组的交集 II（简单）

## 题目描述
这是一道经典的哈希表题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：简单
**分类**：哈希表

## 解题思路

本题是哈希表类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用哈希表相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-202", group: "哈希表", icon: "🟢", title: "202. 快乐数（简单）", content: `# 202. 快乐数（简单）

## 题目描述
这是一道经典的哈希表题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：简单
**分类**：哈希表

## 解题思路

本题是哈希表类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用哈希表相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums):
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
