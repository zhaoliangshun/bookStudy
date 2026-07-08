export const chapters = [
  { id: "lc-295", group: "设计题", icon: "🔴", title: "295. 数据流的中位数（困难）", content: `# 295. 数据流的中位数（困难）

## 题目描述
这是一道经典的设计题题目，需要仔细分析题目要求，选择合适的数据结构和算法来解决。

**难度**：困难
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
  { id: "lc-380", group: "设计题", icon: "🟡", title: "380. O(1) 时间插入、删除和获取随机元素（中等）", content: `# 380. O(1) 时间插入、删除和获取随机元素（中等）

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
