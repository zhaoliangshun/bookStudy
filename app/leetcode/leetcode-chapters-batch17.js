export const chapters = [
  { id: "lc-242", group: "哈希表", icon: "🟢", title: "242. 有效的字母异位词（简单）", content: `# 242. 有效的字母异位词（简单）

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
  { id: "lc-383", group: "哈希表", icon: "🟢", title: "383. 赎金信（简单）", content: `# 383. 赎金信（简单）

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
  { id: "lc-454", group: "哈希表", icon: "🟡", title: "454. 四数相加 II（中等）", content: `# 454. 四数相加 II（中等）

## 题目描述
这是一道经典的哈希表题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
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
  { id: "lc-146", group: "哈希表", icon: "🟡", title: "146. LRU 缓存（中等）", content: `# 146. LRU 缓存（中等）

## 题目描述
这是一道经典的哈希表题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
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
  { id: "lc-137", group: "位运算", icon: "🟡", title: "137. 只出现一次的数字 II（中等）", content: `# 137. 只出现一次的数字 II（中等）

## 题目描述
这是一道经典的位运算题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：位运算

## 解题思路

本题是位运算类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用位运算相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-260", group: "位运算", icon: "🟡", title: "260. 只出现一次的数字 III（中等）", content: `# 260. 只出现一次的数字 III（中等）

## 题目描述
这是一道经典的位运算题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：位运算

## 解题思路

本题是位运算类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用位运算相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-190", group: "位运算", icon: "🟢", title: "190. 颠倒二进制位（简单）", content: `# 190. 颠倒二进制位（简单）

## 题目描述
这是一道经典的位运算题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：简单
**分类**：位运算

## 解题思路

本题是位运算类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用位运算相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-191", group: "位运算", icon: "🟢", title: "191. 位1的个数（简单）", content: `# 191. 位1的个数（简单）

## 题目描述
这是一道经典的位运算题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：简单
**分类**：位运算

## 解题思路

本题是位运算类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用位运算相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-231", group: "位运算", icon: "🟢", title: "231. 2 的幂（简单）", content: `# 231. 2 的幂（简单）

## 题目描述
这是一道经典的位运算题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：简单
**分类**：位运算

## 解题思路

本题是位运算类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用位运算相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums):
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
- **时间复杂度**：O(n)
- **空间复杂度**：O(n)

## 边界条件与注意事项

1. 注意边界条件处理
2. 考虑特殊输入情况
3. 注意时间复杂度和空间复杂度的优化

## 相似题目推荐

同类型相关题目
` },
  { id: "lc-371", group: "位运算", icon: "🟡", title: "371. 两整数之和（中等）", content: `# 371. 两整数之和（中等）

## 题目描述
这是一道经典的位运算题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：中等
**分类**：位运算

## 解题思路

本题是位运算类型的经典题目，我们可以通过多种方法来解决。

## 解法1：常规解法

### 思路分析
这是常规解法方法的实现思路。该方法通过合理利用位运算相关的数据结构和算法思想，有效地解决了问题。具体步骤如下：

1. 首先处理特殊情况和边界条件
2. 初始化必要的数据结构和变量
3. 遍历/处理输入数据，执行核心逻辑
4. 收集并返回结果

### 代码实现

**Python**
\`\`\`python
def solution(nums):
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
